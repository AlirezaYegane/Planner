from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.gamification import UserStats, Achievement, UserAchievement, FocusSession
from app.models.task_history import DailyStats
from app.schemas.gamification import (
    UserStatsResponse,
    AchievementResponse,
    UserAchievementResponse,
    FocusSessionCreate,
    FocusSessionUpdate,
    FocusSessionResponse,
    GamificationSummary
)

router = APIRouter()


def calculate_level(total_xp: int) -> int:
    """Calculate level based on total XP"""
    return int((total_xp / 500) ** 0.5) + 1


def xp_to_next_level(current_level: int) -> int:
    """Calculate XP needed to reach next level"""
    return (current_level ** 2) * 500


def get_or_create_user_stats(db: Session, user_id: int) -> UserStats:
    """Get or create user stats record"""
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's gamification statistics.
    
    Returns XP, level, streaks, and other gamification metrics.
    """
    stats = get_or_create_user_stats(db, current_user.id)
    
    # Calculate level from XP
    stats.level = calculate_level(stats.total_xp)
    db.commit()
    
    # Prepare response with computed fields
    response_data = UserStatsResponse.model_validate(stats)
    response_data.xp_to_next_level = xp_to_next_level(stats.level)
    
    return response_data


@router.get("/achievements", response_model=List[UserAchievementResponse])
def get_user_achievements(
    include_locked: bool = Query(True, description="Include locked achievements"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all achievements with unlock status for current user.
    
    - **include_locked**: If true, returns all achievements. If false, only unlocked ones.
    """
    if include_locked:
        # Get all achievements
        all_achievements = db.query(Achievement).filter(Achievement.is_active == True).all()
        
        # Get user's unlocked achievements
        unlocked_ids = {ua.achievement_id for ua in db.query(UserAchievement).filter(
            UserAchievement.user_id == current_user.id
        ).all()}
        
        # Return with unlock status
        result = []
        for achievement in all_achievements:
            if achievement.id in unlocked_ids:
                user_achievement = db.query(UserAchievement).filter(
                    UserAchievement.user_id == current_user.id,
                    UserAchievement.achievement_id == achievement.id
                ).first()
                result.append(UserAchievementResponse.model_validate(user_achievement))
        
        return result
    else:
        # Only unlocked
        unlocked = db.query(UserAchievement).filter(
            UserAchievement.user_id == current_user.id
        ).all()
        return [UserAchievementResponse.model_validate(ua) for ua in unlocked]


@router.post("/sessions", response_model=FocusSessionResponse, status_code=status.HTTP_201_CREATED)
def start_focus_session(
    session_data: FocusSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Start a new focus session.
    
    Creates a focus session record for tracking Pomodoro/focus time.
    """
    session = FocusSession(
        user_id=current_user.id,
        task_id=session_data.task_id,
        session_type=session_data.session_type,
        planned_duration=session_data.planned_duration,
        flow_rating=session_data.flow_rating
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return session


@router.patch("/sessions/{session_id}", response_model=FocusSessionResponse)
def complete_focus_session(
    session_id: int,
    session_update: FocusSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Complete or update a focus session.
    
    Updates session with completion data and awards XP.
    """
    session = db.query(FocusSession).filter(
        FocusSession.id == session_id,
        FocusSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Focus session not found"
        )
    
    # Update session fields
    update_data = session_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(session, field, value)
    
    # Calculate XP if session completed
    if session.was_completed and session.xp_earned == 0:
        # Base XP for completing a focus session
        base_xp = 10
        # Bonus for task completion
        task_bonus = 20 if session.task_completed_in_session else 0
        # Flow quality bonus
        flow_bonus = (session.flow_rating or 3) * 2
        
        session.xp_earned = base_xp + task_bonus + flow_bonus
        
        # Update user stats
        stats = get_or_create_user_stats(db, current_user.id)
        stats.total_xp += session.xp_earned
        stats.total_focus_time += session.duration_minutes
        stats.level = calculate_level(stats.total_xp)
        
        # Update today's daily stats
        today = datetime.utcnow().date()
        daily_stats = db.query(DailyStats).filter(
            DailyStats.user_id == current_user.id,
            DailyStats.date == today
        ).first()
        
        if not daily_stats:
            daily_stats = DailyStats(user_id=current_user.id, date=today)
            db.add(daily_stats)
        
        daily_stats.focus_sessions_count += 1
        daily_stats.total_focus_minutes += session.duration_minutes
        if session.was_completed:
            daily_stats.completed_focus_sessions += 1
        daily_stats.xp_earned += session.xp_earned
    
    db.commit()
    db.refresh(session)
    
    return session


@router.get("/summary", response_model=GamificationSummary)
def get_gamification_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get comprehensive gamification summary for dashboard.
    
    Includes stats, recent achievements, streak data, and daily progress.
    """
    # Get user stats
    stats = get_or_create_user_stats(db, current_user.id)
    stats.level = calculate_level(stats.total_xp)
    db.commit()
    
    stats_response = UserStatsResponse.model_validate(stats)
    stats_response.xp_to_next_level = xp_to_next_level(stats.level)
    
    # Get recent achievements (last 5)
    recent_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).order_by(UserAchievement.unlocked_at.desc()).limit(5).all()
    
    # Streak data
    streak_data = {
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "last_activity": stats.last_activity_date.isoformat() if stats.last_activity_date else None
    }
    
    # Today's stats
    today = datetime.utcnow().date()
    daily_progress = db.query(DailyStats).filter(
        DailyStats.user_id == current_user.id,
        DailyStats.date == today
    ).first()
    
    return GamificationSummary(
        user_stats=stats_response,
        recent_achievements=[UserAchievementResponse.model_validate(a) for a in recent_achievements],
        streak_data=streak_data,
        daily_progress=DailyStatsResponse.model_validate(daily_progress) if daily_progress else None
    )

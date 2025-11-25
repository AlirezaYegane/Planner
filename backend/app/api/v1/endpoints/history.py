from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.task_history import TaskHistory, DailyStats
from app.schemas.gamification import TaskHistoryResponse, DailyStatsResponse

router = APIRouter()


@router.get("/tasks", response_model=List[TaskHistoryResponse])
def get_task_history(
    task_id: Optional[int] = Query(None, description="Filter by specific task ID"),
    start_date: Optional[date] = Query(None, description="Start date for history"),
    end_date: Optional[date] = Query(None, description="End date for history"),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get task completion history with optional filters.
    
    Returns historical records of task changes and completions.
    """
    query = db.query(TaskHistory).filter(TaskHistory.user_id == current_user.id)
    
    if task_id:
        query = query.filter(TaskHistory.task_id == task_id)
    
    if start_date:
        query = query.filter(TaskHistory.created_at >= start_date)
    
    if end_date:
        # Add one day to include the end date
        end_datetime = datetime.combine(end_date + timedelta(days=1), datetime.min.time())
        query = query.filter(TaskHistory.created_at < end_datetime)
    
    history = query.order_by(TaskHistory.created_at.desc()).limit(limit).all()
    
    return [TaskHistoryResponse.model_validate(h) for h in history]


@router.get("/daily-stats", response_model=List[DailyStatsResponse])
def get_daily_stats(
    start_date: Optional[date] = Query(None, description="Start date"),
    end_date: Optional[date] = Query(None, description="End date"),
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get daily statistics for a date range.
    
    Returns aggregated daily productivity metrics.
    """
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = datetime.utcnow().date()
    if not start_date:
        start_date = end_date - timedelta(days=limit - 1)
    
    daily_stats = db.query(DailyStats).filter(
        and_(
            DailyStats.user_id == current_user.id,
            DailyStats.date >= start_date,
            DailyStats.date <= end_date
        )
    ).order_by(DailyStats.date.desc()).limit(limit).all()
    
    return [DailyStatsResponse.model_validate(ds) for ds in daily_stats]


@router.get("/streak", response_model=dict)
def get_streak_details(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed streak information including calendar data.
    
    Returns current streak, longest streak, and activity calendar.
    """
    from app.models.gamification import UserStats
    
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    
    if not stats:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_activity_date": None,
            "activity_calendar": []
        }
    
    # Get last 90 days of daily stats for calendar
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=90)
    
    daily_stats = db.query(DailyStats).filter(
        and_(
            DailyStats.user_id == current_user.id,
            DailyStats.date >= start_date,
            DailyStats.date <= end_date
        )
    ).order_by(DailyStats.date).all()
    
    # Build activity calendar
    activity_calendar = []
    for ds in daily_stats:
        activity_calendar.append({
            "date": ds.date.isoformat(),
            "tasks_completed": ds.tasks_completed,
            "focus_minutes": ds.total_focus_minutes,
            "xp_earned": ds.xp_earned,
            "has_activity": ds.tasks_completed > 0 or ds.total_focus_minutes > 0
        })
    
    return {
        "current_streak": stats.current_streak,
        "longest_streak": stats.longest_streak,
        "last_activity_date": stats.last_activity_date.isoformat() if stats.last_activity_date else None,
        "activity_calendar": activity_calendar
    }

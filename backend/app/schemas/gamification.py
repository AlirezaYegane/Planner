from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


# UserStats schemas
class UserStatsBase(BaseModel):
    total_xp: int = 0
    level: int = 1
    total_points: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    total_tasks_completed: int = 0
    total_focus_time: int = 0


class UserStatsResponse(UserStatsBase):
    id: int
    user_id: int
    last_activity_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    # Computed fields
    xp_to_next_level: Optional[int] = None
    
    class Config:
        from_attributes = True


# Achievement schemas
class AchievementBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: str
    icon: Optional[str] = Field(None, max_length=50)
    criteria_type: str = Field(..., max_length=50)
    criteria_value: int
    xp_reward: int = 0
    tier: str = "bronze"


class AchievementCreate(AchievementBase):
    pass


class AchievementResponse(AchievementBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# UserAchievement schemas
class UserAchievementBase(BaseModel):
    achievement_id: int
    progress: int = 0


class UserAchievementCreate(UserAchievementBase):
    pass


class UserAchievementResponse(UserAchievementBase):
    id: int
    user_id: int
    unlocked_at: datetime
    
    # Nested achievement data
    achievement: Optional[AchievementResponse] = None
    
    class Config:
        from_attributes = True


# FocusSession schemas
class FocusSessionBase(BaseModel):
    task_id: Optional[int] = None
    session_type: str = "focus"
    planned_duration: int = 25
    flow_rating: Optional[int] = Field(None, ge=1, le=5)


class FocusSessionCreate(FocusSessionBase):
    pass


class FocusSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    was_completed: Optional[bool] = None
    task_completed_in_session: Optional[bool] = None
    xp_earned: Optional[int] = None
    interruptions: Optional[int] = None
    flow_rating: Optional[int] = Field(None, ge=1, le=5)


class FocusSessionResponse(FocusSessionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_minutes: int
    was_completed: bool
    task_completed_in_session: bool
    xp_earned: int
    interruptions: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# TaskHistory schemas
class TaskHistoryResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    event_type: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    changes: Optional[dict] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# DailyStats schemas
class DailyStatsBase(BaseModel):
    date: date
    tasks_created: int = 0
    tasks_completed: int = 0
    tasks_postponed: int = 0
    focus_sessions_count: int = 0
    total_focus_minutes: int = 0
    completed_focus_sessions: int = 0
    xp_earned: int = 0
    achievements_unlocked: int = 0
    completion_rate: int = 0
    average_flow_rating: Optional[int] = None
    daily_goal_met: int = 0


class DailyStatsResponse(DailyStatsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Gamification Summary (for dashboard)
class GamificationSummary(BaseModel):
    """Comprehensive gamification data for dashboard"""
    user_stats: UserStatsResponse
    recent_achievements: list[UserAchievementResponse] = []
    streak_data: dict = {}
    daily_progress: Optional[DailyStatsResponse] = None

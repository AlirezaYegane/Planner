from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class UserStats(Base):
    """User gamification statistics - XP, levels, streaks, points."""
    
    __tablename__ = "user_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # Gamification metrics
    total_xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    total_points = Column(Integer, default=0, nullable=False)
    
    # Streak tracking
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(DateTime(timezone=True), nullable=True)
    
    # Task statistics
    total_tasks_completed = Column(Integer, default=0, nullable=False)
    total_focus_time = Column(Integer, default=0, nullable=False)  # in minutes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="user_stats")
    
    def __repr__(self):
        return f"<UserStats(user_id={self.user_id}, level={self.level}, xp={self.total_xp})>"


class Achievement(Base):
    """Master table for all available achievements."""
    
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(50), nullable=True)  # emoji or icon identifier
    
    # Unlock criteria
    criteria_type = Column(String(50), nullable=False)  # e.g., "tasks_completed", "streak_days", "focus_time"
    criteria_value = Column(Integer, nullable=False)
    
    # Rewards
    xp_reward = Column(Integer, default=0, nullable=False)
    
    # Metadata
    tier = Column(String(50), default="bronze", nullable=False)  # bronze, silver, gold, platinum
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Achievement(name='{self.name}', tier='{self.tier}')>"


class UserAchievement(Base):
    """Junction table tracking which achievements users have unlocked."""
    
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False, index=True)
    
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Progress tracking for multi-step achievements
    progress = Column(Integer, default=0, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
    
    def __repr__(self):
        return f"<UserAchievement(user_id={self.user_id}, achievement_id={self.achievement_id})>"


class FocusSession(Base):
    """Individual focus/Pomodoro sessions with tracking."""
    
    __tablename__ = "focus_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True, index=True)
    
    # Session details
    start_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=0, nullable=False)
    
    # Session type
    session_type = Column(String(50), default="focus", nullable=False)  # focus, break
    planned_duration = Column(Integer, default=25, nullable=False)  # minutes
    
    # Completion
    was_completed = Column(Boolean, default=False, nullable=False)
    task_completed_in_session = Column(Boolean, default=False, nullable=False)
    
    # Rewards
    xp_earned = Column(Integer, default=0, nullable=False)
    
    # Quality metrics
    interruptions = Column(Integer, default=0, nullable=False)
    flow_rating = Column(Integer, nullable=True)  # 1-5 rating of focus quality
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="focus_sessions")
    task = relationship("Task", back_populates="focus_sessions")
    
    def __repr__(self):
        return f"<FocusSession(id={self.id}, user_id={self.user_id}, duration={self.duration_minutes}min)>"

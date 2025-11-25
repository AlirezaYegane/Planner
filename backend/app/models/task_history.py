from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class TaskHistory(Base):
    """Immutable log of all task status changes and events."""
    
    __tablename__ = "task_history"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Event details
    event_type = Column(String(50), nullable=False)  # created, updated, completed, deleted, status_changed
    old_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    
    # Metadata
    changes = Column(JSON, nullable=True)  # Store what changed (field: {old, new})
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="history")
    user = relationship("User")
    
    def __repr__(self):
        return f"<TaskHistory(task_id={self.task_id}, event='{self.event_type}', at={self.created_at})>"


class DailyStats(Base):
    """Aggregated daily statistics for user productivity."""
    
    __tablename__ = "daily_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    
    # Task metrics
    tasks_created = Column(Integer, default=0, nullable=False)
    tasks_completed = Column(Integer, default=0, nullable=False)
    tasks_postponed = Column(Integer, default=0, nullable=False)
    
    # Focus metrics
    focus_sessions_count = Column(Integer, default=0, nullable=False)
    total_focus_minutes = Column(Integer, default=0, nullable=False)
    completed_focus_sessions = Column(Integer, default=0, nullable=False)
    
    # Gamification metrics
    xp_earned = Column(Integer, default=0, nullable=False)
    achievements_unlocked = Column(Integer, default=0, nullable=False)
    
    # Quality metrics
    completion_rate = Column(Integer, default=0, nullable=False)  # percentage
    average_flow_rating = Column(Integer, nullable=True)  # 1-5
    
    # Goals tracking
    daily_goal_met = Column(Integer, default=0, nullable=False)  # boolean as int
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="daily_stats")
    
    def __repr__(self):
        return f"<DailyStats(user_id={self.user_id}, date={self.date}, completed={self.tasks_completed})>"

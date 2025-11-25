from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Task(Base):
    """Task model - individual tasks in the system."""
    
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="not_started", nullable=False)  # not_started, in_progress, done, postponed
    priority = Column(String(50), default="medium", nullable=False)  # low, medium, high, urgent
    date = Column(Date, nullable=True, index=True)
    
    # Gamification fields
    estimated_time = Column(Integer, nullable=True)  # in minutes
    actual_time = Column(Integer, nullable=True)  # in minutes
    points_value = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="tasks")
    group = relationship("Group", back_populates="tasks")
    team = relationship("Team", back_populates="tasks")
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")
    focus_sessions = relationship("FocusSession", back_populates="task", cascade="all, delete-orphan")
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Task(id={self.id}, name='{self.name}', status='{self.status}')>"


class Subtask(Base):
    """Subtask model - parts of a main task."""
    
    __tablename__ = "subtasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    is_done = Column(Boolean, default=False, nullable=False)
    order = Column(Integer, default=0, nullable=False)
    
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    task = relationship("Task", back_populates="subtasks")
    
    def __repr__(self):
        return f"<Subtask(id={self.id}, name='{self.name}', done={self.is_done})>"

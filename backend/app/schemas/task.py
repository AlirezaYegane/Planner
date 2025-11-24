from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


# --- Subtask Schemas ---

class SubtaskBase(BaseModel):
    """Base subtask schema."""
    name: str
    order: int = 0


class SubtaskCreate(SubtaskBase):
    """Schema for creating a subtask."""
    pass


class SubtaskUpdate(BaseModel):
    """Schema for updating a subtask."""
    name: Optional[str] = None
    is_done: Optional[bool] = None
    order: Optional[int] = None


class SubtaskResponse(SubtaskBase):
    """Schema for subtask response."""
    id: int
    is_done: bool
    task_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# --- Task Schemas ---

class TaskBase(BaseModel):
    """Base task schema."""
    name: str
    description: Optional[str] = None
    status: str = "not_started"  # not_started, in_progress, done, postponed
    priority: str = "medium"  # low, medium, high, urgent
    date: Optional[date] = None


class TaskCreate(TaskBase):
    """Schema for creating a task."""
    group_id: Optional[int] = None
    subtasks: Optional[List[SubtaskCreate]] = []


class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    date: Optional[date] = None
    group_id: Optional[int] = None


class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    user_id: int
    group_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    subtasks: List[SubtaskResponse] = []
    
    class Config:
        from_attributes = True

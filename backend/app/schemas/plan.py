from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class PlanBase(BaseModel):
    """Base plan schema."""
    date: date
    sleep_time: Optional[float] = 0.0
    commute_time: Optional[float] = 0.0
    work_time: Optional[float] = 0.0


class PlanCreate(PlanBase):
    """Schema for creating a plan."""
    pass


class PlanUpdate(BaseModel):
    """Schema for updating a plan."""
    sleep_time: Optional[float] = None
    commute_time: Optional[float] = None
    work_time: Optional[float] = None


class PlanResponse(PlanBase):
    """Schema for plan response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

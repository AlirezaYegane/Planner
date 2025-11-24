from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Group Schemas ---

class GroupBase(BaseModel):
    """Base group schema."""
    name: str
    color: str = "#579bfc"
    order: int = 0


class GroupCreate(GroupBase):
    """Schema for creating a group."""
    pass


class GroupUpdate(BaseModel):
    """Schema for updating a group."""
    name: Optional[str] = None
    color: Optional[str] = None
    order: Optional[int] = None


class GroupResponse(GroupBase):
    """Schema for group response."""
    id: int
    board_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# --- Board Schemas ---

class BoardBase(BaseModel):
    """Base board schema."""
    name: str
    description: Optional[str] = None


class BoardCreate(BoardBase):
    """Schema for creating a board."""
    pass


class BoardUpdate(BaseModel):
    """Schema for updating a board."""
    name: Optional[str] = None
    description: Optional[str] = None


class BoardResponse(BoardBase):
    """Schema for board response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    groups: List[GroupResponse] = []
    
    class Config:
        from_attributes = True

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.team import TeamRole

# Team Member Schemas
class TeamMemberBase(BaseModel):
    role: TeamRole = TeamRole.MEMBER

class TeamMemberCreate(TeamMemberBase):
    email: EmailStr

class TeamMemberUpdate(TeamMemberBase):
    pass

class TeamMemberResponse(TeamMemberBase):
    id: int
    user_id: int
    team_id: int
    joined_at: datetime
    user_email: str

    class Config:
        from_attributes = True

# Team Schemas
class TeamBase(BaseModel):
    name: str

class TeamCreate(TeamBase):
    pass

class TeamUpdate(TeamBase):
    name: Optional[str] = None

class TeamResponse(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime
    members: List[TeamMemberResponse] = []

    class Config:
        from_attributes = True

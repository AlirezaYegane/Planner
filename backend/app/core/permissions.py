from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.team import TeamMember, TeamRole

class TeamPermission:
    def __init__(self, required_roles: list[str]):
        self.required_roles = required_roles

    def __call__(self, team_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
        member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id
        ).first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this team"
            )

        if member.role not in self.required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        
        return member

# Common permission checkers
check_is_owner = TeamPermission([TeamRole.OWNER])
check_is_admin = TeamPermission([TeamRole.OWNER, TeamRole.ADMIN])
check_is_member = TeamPermission([TeamRole.OWNER, TeamRole.ADMIN, TeamRole.MEMBER])

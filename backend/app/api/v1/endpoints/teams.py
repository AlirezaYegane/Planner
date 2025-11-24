from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.team import Team, TeamMember, TeamRole
from app.schemas.team import TeamCreate, TeamResponse, TeamMemberCreate, TeamMemberResponse
from app.core.permissions import check_is_admin, check_is_owner, check_is_member

router = APIRouter()

@router.post("/", response_model=TeamResponse)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Create a new team.
    """
    team = Team(name=team_in.name)
    db.add(team)
    db.commit()
    db.refresh(team)

    # Add creator as owner
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role=TeamRole.OWNER
    )
    db.add(member)
    db.commit()
    
    # Audit Log
    from app.core.audit import create_audit_log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="TEAM_CREATED",
        target_type="TEAM",
        target_id=team.id,
        details={"name": team.name}
    )
    
    return team

@router.get("/", response_model=List[TeamResponse])
def read_teams(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Retrieve teams that the current user belongs to.
    """
    teams = (
        db.query(Team)
        .join(TeamMember)
        .filter(TeamMember.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return teams

@router.get("/{team_id}", response_model=TeamResponse)
def read_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get a specific team by ID.
    """
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is a member
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return team


@router.post("/{team_id}/members", response_model=TeamMemberResponse)
def add_member(
    team_id: int,
    member_in: TeamMemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Add a new member to the team.
    """
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check permissions (must be owner)
    check_is_owner(db, current_user, team_id)

    # Check if user to add exists
    user_to_add = db.query(User).filter(User.email == member_in.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if already a member
    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_to_add.id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User already in team")
    
    new_member = TeamMember(
        team_id=team_id,
        user_id=user_to_add.id,
        role=member_in.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    # Hack to return user_email for response schema
    new_member.user_email = user_to_add.email
    
    # Audit Log
    from app.core.audit import create_audit_log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="MEMBER_ADDED",
        target_type="TEAM",
        target_id=team_id,
        details={"added_user_id": user_to_add.id, "role": member_in.role}
    )

    return new_member

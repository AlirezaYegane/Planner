from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.board import Board, Group
from app.schemas.board import BoardCreate, BoardUpdate, BoardResponse, GroupCreate, GroupUpdate, GroupResponse

router = APIRouter()


# --- Board endpoints ---

@router.get("/", response_model=List[BoardResponse])
def get_boards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all boards for the current user."""
    boards = db.query(Board).filter(Board.user_id == current_user.id)\
        .order_by(Board.created_at.desc())\
        .offset(skip).limit(limit).all()
    
    return boards


@router.get("/{board_id}", response_model=BoardResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific board by ID with all its groups."""
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    return board


@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
def create_board(
    board_data: BoardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new Kanban board.
    
    - **name**: Board name (required)
    - **description**: Optional description
    """
    # Check subscription limits
    board_count = db.query(Board).filter(Board.user_id == current_user.id).count()
    
    # Free tier limit: 3 boards
    if board_count >= 3:
        # Check if user has active subscription
        if not current_user.subscription or current_user.subscription.plan_id == "free":
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Free plan is limited to 3 boards. Please upgrade to Pro."
            )

    board = Board(
        name=board_data.name,
        description=board_data.description,
        user_id=current_user.id
    )
    
    db.add(board)
    db.commit()
    db.refresh(board)
    
    # Audit Log
    from app.core.audit import create_audit_log
    create_audit_log(
        db=db,
        user_id=current_user.id,
        action="BOARD_CREATED",
        target_type="BOARD",
        target_id=board.id,
        details={"name": board.name}
    )

    return board


@router.patch("/{board_id}", response_model=BoardResponse)
def update_board(
    board_id: int,
    board_data: BoardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a board."""
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    update_data = board_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(board, field, value)
    
    db.commit()
    db.refresh(board)
    
    return board


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a board and all its groups and tasks."""
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    db.delete(board)
    db.commit()
    
    return None


# --- Group endpoints ---

@router.get("/{board_id}/groups", response_model=List[GroupResponse])
def get_groups(
    board_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all groups (columns) for a board."""
    # Verify board belongs to user
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    groups = db.query(Group).filter(Group.board_id == board_id)\
        .order_by(Group.order).all()
    
    return groups


@router.post("/{board_id}/groups", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    board_id: int,
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new group (column) in a board.
    
    - **name**: Group name (e.g., "To Do", "In Progress", "Done")
    - **color**: Hex color code (default: #579bfc)
    - **order**: Display order
    """
    # Verify board belongs to user
    board = db.query(Board).filter(
        Board.id == board_id,
        Board.user_id == current_user.id
    ).first()
    
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Board not found"
        )
    
    group = Group(
        name=group_data.name,
        color=group_data.color,
        order=group_data.order,
        board_id=board_id
    )
    
    db.add(group)
    db.commit()
    db.refresh(group)
    
    return group


@router.patch("/groups/{group_id}", response_model=GroupResponse)
def update_group(
    group_id: int,
    group_data: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a group."""
    group = db.query(Group).join(Board).filter(
        Group.id == group_id,
        Board.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    update_data = group_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
    
    db.commit()
    db.refresh(group)
    
    return group


@router.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a group."""
    group = db.query(Group).join(Board).filter(
        Group.id == group_id,
        Board.user_id == current_user.id
    ).first()
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    db.delete(group)
    db.commit()
    
    return None

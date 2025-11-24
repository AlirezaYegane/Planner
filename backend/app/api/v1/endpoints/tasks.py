from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.task import Task, Subtask
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, SubtaskCreate, SubtaskUpdate, SubtaskResponse

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    date_filter: Optional[date] = Query(None, description="Filter tasks by date"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all tasks for the current user with optional filters.
    
    - **date_filter**: Filter by specific date
    - **status_filter**: Filter by status (not_started, in_progress, done, postponed)
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if date_filter:
        query = query.filter(Task.date == date_filter)
    
    if status_filter:
        query = query.filter(Task.status == status_filter)
    
    tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
    
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific task by ID."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new task.
    
    - **name**: Task name (required)
    - **description**: Optional description
    - **status**: Task status (default: not_started)
    - **priority**: Task priority (default: medium)
    - **date**: Optional due date
    - **group_id**: Optional Kanban group ID
    - **subtasks**: List of subtasks to create
    """
    # Create task
    task = Task(
        name=task_data.name,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        date=task_data.date,
        user_id=current_user.id,
        group_id=task_data.group_id
    )
    
    db.add(task)
    db.flush()  # Get task ID without committing
    
    # Create subtasks if provided
    if task_data.subtasks:
        for subtask_data in task_data.subtasks:
            subtask = Subtask(
                name=subtask_data.name,
                order=subtask_data.order,
                task_id=task.id
            )
            db.add(subtask)
    
    db.commit()
    db.refresh(task)
    
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update an existing task.
    
    Only provided fields will be updated.
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a task."""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return None


# --- Subtask endpoints ---

@router.post("/{task_id}/subtasks", response_model=SubtaskResponse, status_code=status.HTTP_201_CREATED)
def create_subtask(
    task_id: int,
    subtask_data: SubtaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a subtask for a task."""
    # Verify task belongs to user
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    subtask = Subtask(
        name=subtask_data.name,
        order=subtask_data.order,
        task_id=task_id
    )
    
    db.add(subtask)
    db.commit()
    db.refresh(subtask)
    
    return subtask


@router.patch("/subtasks/{subtask_id}", response_model=SubtaskResponse)
def update_subtask(
    subtask_id: int,
    subtask_data: SubtaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a subtask."""
    subtask = db.query(Subtask).join(Task).filter(
        Subtask.id == subtask_id,
        Task.user_id == current_user.id
    ).first()
    
    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )
    
    update_data = subtask_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subtask, field, value)
    
    db.commit()
    db.refresh(subtask)
    
    return subtask


@router.delete("/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subtask(
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a subtask."""
    subtask = db.query(Subtask).join(Task).filter(
        Subtask.id == subtask_id,
        Task.user_id == current_user.id
    ).first()
    
    if not subtask:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )
    
    db.delete(subtask)
    db.commit()
    
    return None

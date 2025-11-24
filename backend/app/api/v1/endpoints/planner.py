from typing import Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User
from app.api import deps

router = APIRouter()

@router.post("/reschedule-overdue")
def reschedule_overdue_tasks(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Smart Reschedule: Move all overdue tasks to today/tomorrow.
    """
    # 1. Find overdue tasks
    # Note: This is a simplified query. In production, we'd check due_date < now and status != done
    # For this prototype, we'll just grab tasks with due_date < today
    
    today = datetime.utcnow().date()
    tasks = db.query(Task).filter(
        Task.owner_id == current_user.id,
        Task.status != "done",
        Task.due_date < today
    ).all()
    
    rescheduled_tasks = []
    target_date = today # Move to today for now, or tomorrow
    
    for task in tasks:
        task.due_date = target_date
        db.add(task)
        rescheduled_tasks.append(task)
        
    db.commit()
    
    return rescheduled_tasks

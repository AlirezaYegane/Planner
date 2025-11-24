from typing import Any, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.post("/reschedule-overdue", response_model=List[schemas.Task])
def reschedule_overdue_tasks(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Smart Reschedule: Move all overdue tasks to today/tomorrow.
    """
    # 1. Find overdue tasks
    # Note: This is a simplified query. In production, we'd check due_date < now and status != done
    # For this prototype, we'll just grab tasks with due_date < today
    
    today = datetime.utcnow().date()
    tasks = db.query(models.Task).filter(
        models.Task.owner_id == current_user.id,
        models.Task.status != "done",
        models.Task.due_date < today
    ).all()
    
    rescheduled_tasks = []
    target_date = today # Move to today for now, or tomorrow
    
    for task in tasks:
        task.due_date = target_date
        db.add(task)
        rescheduled_tasks.append(task)
        
    db.commit()
    
    return rescheduled_tasks

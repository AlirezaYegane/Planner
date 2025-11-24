from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.plan import Plan
from app.schemas.plan import PlanCreate, PlanUpdate, PlanResponse

router = APIRouter()


@router.get("/", response_model=List[PlanResponse])
def get_plans(
    start_date: Optional[date] = Query(None, description="Filter plans from this date"),
    end_date: Optional[date] = Query(None, description="Filter plans until this date"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all plans for the current user.
    
    - **start_date**: Optional start date filter
    - **end_date**: Optional end date filter
    """
    query = db.query(Plan).filter(Plan.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Plan.date >= start_date)
    
    if end_date:
        query = query.filter(Plan.date <= end_date)
    
    plans = query.order_by(Plan.date.desc()).offset(skip).limit(limit).all()
    
    return plans


@router.get("/{plan_date}", response_model=PlanResponse)
def get_plan_by_date(
    plan_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a plan for a specific date."""
    plan = db.query(Plan).filter(
        Plan.date == plan_date,
        Plan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan not found for date {plan_date}"
        )
    
    return plan


@router.post("/", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_data: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new daily plan.
    
    - **date**: Plan date
    - **sleep_time**: Hours spent sleeping
    - **commute_time**: Hours spent commuting
    - **work_time**: Hours spent working
    """
    # Check if plan already exists for this date
    existing_plan = db.query(Plan).filter(
        Plan.date == plan_data.date,
        Plan.user_id == current_user.id
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plan already exists for date {plan_data.date}"
        )
    
    plan = Plan(
        date=plan_data.date,
        sleep_time=plan_data.sleep_time,
        commute_time=plan_data.commute_time,
        work_time=plan_data.work_time,
        user_id=current_user.id
    )
    
    db.add(plan)
    db.commit()
    db.refresh(plan)
    
    return plan


@router.patch("/{plan_date}", response_model=PlanResponse)
def update_plan(
    plan_date: date,
    plan_data: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a plan for a specific date."""
    plan = db.query(Plan).filter(
        Plan.date == plan_date,
        Plan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan not found for date {plan_date}"
        )
    
    update_data = plan_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    
    return plan


@router.delete("/{plan_date}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a plan for a specific date."""
    plan = db.query(Plan).filter(
        Plan.date == plan_date,
        Plan.user_id == current_user.id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plan not found for date {plan_date}"
        )
    
    db.delete(plan)
    db.commit()
    
    return None

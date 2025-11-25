from fastapi import APIRouter
from app.api.v1.endpoints import auth, tasks, boards, plans, teams, payments, planner, gamification, history

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(boards.router, prefix="/boards", tags=["Boards"])
api_router.include_router(plans.router, prefix="/plans", tags=["Plans"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(planner.router, prefix="/planner", tags=["Planner"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
api_router.include_router(history.router, prefix="/history", tags=["History"])

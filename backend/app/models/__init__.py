"""
Models package initialization.

Import all models here to ensure SQLAlchemy can resolve
string-based relationship references.
"""

# Import all models in proper order to resolve relationships
from app.models.user import User
from app.models.team import Team, TeamMember
from app.models.board import Board, Group
from app.models.task import Task, Subtask
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.audit import AuditLog
from app.models.gamification import UserStats, Achievement, UserAchievement, FocusSession
from app.models.task_history import TaskHistory, DailyStats

__all__ = [
    "User",
    "Team",
    "TeamMember",
    "Board",
    "Group",
    "Task",
    "Subtask",
    "Plan",
    "Subscription",
    "AuditLog",
    "UserStats",
    "Achievement",
    "UserAchievement",
    "FocusSession",
    "TaskHistory",
    "DailyStats",
]

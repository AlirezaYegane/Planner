from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from typing import Any, Dict, Optional

def create_audit_log(
    db: Session,
    user_id: int,
    action: str,
    target_type: str,
    target_id: Optional[int] = None,
    details: Optional[Dict[str, Any]] = None
):
    """
    Create a new audit log entry.
    """
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception as e:
        # Log error but don't fail the request
        print(f"Failed to create audit log: {e}")
        db.rollback()

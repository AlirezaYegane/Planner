from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Plan(Base):
    """Plan model - Daily plans with time tracking."""
    
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    
    # Time tracking (in hours)
    sleep_time = Column(Float, default=0.0, nullable=True)
    commute_time = Column(Float, default=0.0, nullable=True)
    work_time = Column(Float, default=0.0, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="plans")
    
    def __repr__(self):
        return f"<Plan(id={self.id}, date='{self.date}', user_id={self.user_id})>"

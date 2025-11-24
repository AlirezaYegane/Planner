from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Board(Base):
    """Board model - Kanban boards for organizing tasks.

    Each board belongs to a user (owner) and a team, and contains multiple groups (columns).
    """
    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1024), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="boards")
    team = relationship("Team", back_populates="boards")
    groups = relationship("Group", back_populates="board", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Board(id={self.id}, name='{self.name}', user_id={self.user_id})>"


class Group(Base):
    """Group model - Columns in a Kanban board.

    Each group belongs to a board and contains multiple tasks.
    """
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    color = Column(String(20), default="#579bfc", nullable=False)
    order = Column(Integer, default=0, nullable=False)
    board_id = Column(Integer, ForeignKey("boards.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    board = relationship("Board", back_populates="groups")
    tasks = relationship("Task", back_populates="group", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Group(id={self.id}, name='{self.name}', board_id={self.board_id})>"

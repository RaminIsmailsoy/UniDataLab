from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False)
    region = Column(String, nullable=False)
    type = Column(String, default="public")  # 'public' or 'private'
    student_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

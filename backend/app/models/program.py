from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    field = Column(String, nullable=False, index=True)
    degree_level = Column(String, nullable=False)  # 'bachelor', 'master', 'phd'
    enrolled_students = Column(Integer, default=0)
    graduation_rate = Column(Float, default=0.0)
    status = Column(String, default="active")  # 'active', 'inactive', 'under_review'
    created_at = Column(DateTime(timezone=True), default=_utcnow)

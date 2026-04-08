from datetime import datetime, timezone, date
from typing import List
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, JSON
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class JobMarket(Base):
    __tablename__ = "job_market"

    id = Column(Integer, primary_key=True, index=True)
    specialization = Column(String, nullable=False, index=True)
    region = Column(String, nullable=False, index=True)
    job_openings = Column(Integer, default=0)
    avg_salary = Column(Float, default=0.0)
    demand_score = Column(Float, default=0.0)
    growth_rate = Column(Float, default=0.0)
    top_skills = Column(JSON, default=list)
    data_date = Column(Date, nullable=False, default=date.today)
    source = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

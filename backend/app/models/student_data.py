from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class StudentData(Base):
    __tablename__ = "student_data"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False)
    applications = Column(Integer, default=0)
    enrolled = Column(Integer, default=0)
    graduated = Column(Integer, default=0)
    employment_rate = Column(Float, default=0.0)
    avg_starting_salary = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=_utcnow)


class IndustryForecast(Base):
    __tablename__ = "industry_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    industry = Column(String, nullable=False, index=True)
    region = Column(String, nullable=False)
    forecast_year = Column(Integer, nullable=False)
    growth_prediction = Column(Float, default=0.0)
    confidence_level = Column(Float, default=0.0)
    emerging_skills = Column(JSON, default=list)
    source = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False, index=True)
    action = Column(String, nullable=False)  # 'expand', 'reduce', 'maintain', 'monitor', 'open', 'close'
    score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    explanation = Column(String, nullable=False)
    factors = Column(JSON, default=dict)
    generated_at = Column(DateTime(timezone=True), default=_utcnow)

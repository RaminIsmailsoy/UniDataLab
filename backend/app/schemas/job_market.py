from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date


class JobMarketCreate(BaseModel):
    specialization: str
    region: str
    job_openings: int = 0
    avg_salary: float = 0.0
    demand_score: float = 0.0
    growth_rate: float = 0.0
    top_skills: List[str] = []
    data_date: date
    source: Optional[str] = None


class JobMarketResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    specialization: str
    region: str
    job_openings: int
    avg_salary: float
    demand_score: float
    growth_rate: float
    top_skills: List[Any]
    data_date: date
    source: Optional[str]
    created_at: datetime


class TrendData(BaseModel):
    specialization: str
    region: Optional[str] = None
    data_points: List[dict]
    direction: str
    slope: float
    r_squared: float

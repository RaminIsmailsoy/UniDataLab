from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class RecommendationCreate(BaseModel):
    university_id: int
    program_id: int
    action: str
    score: float
    confidence: float
    explanation: str
    factors: Dict[str, Any] = {}


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    university_id: int
    program_id: int
    action: str
    score: float
    confidence: float
    explanation: str
    factors: Dict[str, Any]
    generated_at: datetime

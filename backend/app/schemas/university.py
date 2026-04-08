from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class UniversityCreate(BaseModel):
    name: str
    country: str
    region: str
    type: str = "public"
    student_count: int = 0


class UniversityUpdate(BaseModel):
    name: Optional[str] = None
    country: Optional[str] = None
    region: Optional[str] = None
    type: Optional[str] = None
    student_count: Optional[int] = None


class UniversityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    country: str
    region: str
    type: str
    student_count: int
    created_at: datetime

from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime


class ProgramCreate(BaseModel):
    university_id: int
    name: str
    field: str
    degree_level: str
    enrolled_students: int = 0
    graduation_rate: float = 0.0
    status: str = "active"


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    field: Optional[str] = None
    degree_level: Optional[str] = None
    enrolled_students: Optional[int] = None
    graduation_rate: Optional[float] = None
    status: Optional[str] = None


class ProgramResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    university_id: int
    name: str
    field: str
    degree_level: str
    enrolled_students: int
    graduation_rate: float
    status: str
    created_at: datetime

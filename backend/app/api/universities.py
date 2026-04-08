from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.university import University
from app.schemas.university import UniversityCreate, UniversityUpdate, UniversityResponse
from app.auth.dependencies import get_current_active_user, require_admin
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[UniversityResponse])
def list_universities(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    country: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(University)
    if country:
        query = query.filter(University.country.ilike(f"%{country}%"))
    if region:
        query = query.filter(University.region.ilike(f"%{region}%"))
    if type:
        query = query.filter(University.type == type)
    return query.offset(skip).limit(limit).all()


@router.get("/{university_id}", response_model=UniversityResponse)
def get_university(
    university_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    university = db.query(University).filter(University.id == university_id).first()
    if not university:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
    return university


@router.post("/", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
def create_university(
    university_in: UniversityCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    university = University(**university_in.model_dump())
    db.add(university)
    db.commit()
    db.refresh(university)
    return university


@router.put("/{university_id}", response_model=UniversityResponse)
def update_university(
    university_id: int,
    university_in: UniversityUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    university = db.query(University).filter(University.id == university_id).first()
    if not university:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="University not found")
    for field, value in university_in.model_dump(exclude_unset=True).items():
        setattr(university, field, value)
    db.commit()
    db.refresh(university)
    return university

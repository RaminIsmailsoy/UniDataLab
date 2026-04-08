from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.recommendation import RecommendationResponse
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.services.recommendation_service import RecommendationService

router = APIRouter()
recommendation_service = RecommendationService()


@router.get("/", response_model=List[RecommendationResponse])
def list_recommendations(
    university_id: Optional[int] = Query(None),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return recommendation_service.get_all_recommendations(db, university_id, action)


@router.get("/{university_id}", response_model=List[RecommendationResponse])
def get_recommendations_for_university(
    university_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return recommendation_service.get_all_recommendations(db, university_id=university_id)


@router.post("/generate", response_model=List[RecommendationResponse])
def generate_recommendations(
    university_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return recommendation_service.generate_recommendations(db, university_id)

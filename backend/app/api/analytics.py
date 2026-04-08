from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter()
analytics_service = AnalyticsService()


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return analytics_service.get_dashboard_kpis(db)


@router.get("/demand-supply")
def get_demand_supply(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return analytics_service.get_demand_supply_analysis(db)


@router.get("/skill-gaps")
def get_skill_gaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return analytics_service.get_skill_gaps(db)


@router.get("/trends")
def get_trends(
    specialization: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return analytics_service.get_trends(db, specialization)


@router.get("/regional")
def get_regional(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return analytics_service.get_regional_data(db)

from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job_market import JobMarket
from app.schemas.job_market import JobMarketCreate, JobMarketResponse, TrendData
from app.auth.dependencies import get_current_active_user, require_admin
from app.models.user import User
from app.engine.trend_analyzer import TrendAnalyzer

router = APIRouter()
trend_analyzer = TrendAnalyzer()


@router.get("/", response_model=List[JobMarketResponse])
def list_job_market(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    specialization: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(JobMarket)
    if specialization:
        query = query.filter(JobMarket.specialization.ilike(f"%{specialization}%"))
    if region:
        query = query.filter(JobMarket.region.ilike(f"%{region}%"))
    return query.order_by(JobMarket.data_date.desc()).offset(skip).limit(limit).all()


@router.get("/trends", response_model=List[TrendData])
def get_trends(
    specialization: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(JobMarket)
    if specialization:
        query = query.filter(JobMarket.specialization.ilike(f"%{specialization}%"))
    if region:
        query = query.filter(JobMarket.region.ilike(f"%{region}%"))
    records = query.order_by(JobMarket.data_date.asc()).all()

    # Group by specialization
    grouped: dict = {}
    for r in records:
        key = r.specialization
        grouped.setdefault(key, [])
        grouped[key].append((r.data_date, float(r.demand_score)))

    results = []
    for spec, points in grouped.items():
        analysis = trend_analyzer.analyze_trend(points)
        data_points = [{"date": str(d), "value": v} for d, v in points]
        results.append(
            TrendData(
                specialization=spec,
                region=region,
                data_points=data_points,
                direction=analysis["direction"],
                slope=analysis["slope"],
                r_squared=analysis["r_squared"],
            )
        )
    return results


@router.post("/ingest", response_model=List[JobMarketResponse], status_code=201)
def ingest_job_market(
    entries: List[JobMarketCreate],
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    created = []
    for entry in entries:
        jm = JobMarket(**entry.model_dump())
        db.add(jm)
        db.flush()
        created.append(jm)
    db.commit()
    for jm in created:
        db.refresh(jm)
    return created

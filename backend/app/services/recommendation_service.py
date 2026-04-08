from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.student_data import Recommendation
from app.schemas.recommendation import RecommendationCreate
from app.engine.recommendation_engine import RecommendationEngine
from app.models.university import University

engine = RecommendationEngine()


class RecommendationService:
    def get_all_recommendations(
        self,
        db: Session,
        university_id: Optional[int] = None,
        action: Optional[str] = None,
    ) -> List[Recommendation]:
        query = db.query(Recommendation)
        if university_id is not None:
            query = query.filter(Recommendation.university_id == university_id)
        if action:
            query = query.filter(Recommendation.action == action)
        return query.order_by(Recommendation.generated_at.desc()).all()

    def generate_recommendations(
        self, db: Session, university_id: Optional[int] = None
    ) -> List[Recommendation]:
        if university_id:
            university_ids = [university_id]
        else:
            university_ids = [u.id for u in db.query(University).all()]

        created: List[Recommendation] = []
        for uid in university_ids:
            rec_creates: List[RecommendationCreate] = engine.generate_for_university(db, uid)
            for rc in rec_creates:
                # Remove stale recommendation for same program/university
                db.query(Recommendation).filter(
                    Recommendation.university_id == rc.university_id,
                    Recommendation.program_id == rc.program_id,
                ).delete()
                rec = Recommendation(**rc.model_dump())
                db.add(rec)
                db.flush()
                created.append(rec)
        db.commit()
        for rec in created:
            db.refresh(rec)
        return created

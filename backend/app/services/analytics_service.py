from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.program import Program
from app.models.student_data import StudentData
from app.models.job_market import JobMarket
from app.models.university import University
from app.engine.trend_analyzer import TrendAnalyzer
from app.engine.skill_gap import SkillGapAnalyzer

trend_analyzer = TrendAnalyzer()
skill_gap_analyzer = SkillGapAnalyzer()


class AnalyticsService:
    def get_dashboard_kpis(self, db: Session) -> Dict[str, Any]:
        total_programs = db.query(func.count(Program.id)).scalar() or 0

        avg_employment = (
            db.query(func.avg(StudentData.employment_rate)).scalar()
        )
        avg_employment_rate = round(float(avg_employment), 2) if avg_employment else 0.0

        top_field_row = (
            db.query(JobMarket.specialization, func.avg(JobMarket.growth_rate).label("avg_growth"))
            .group_by(JobMarket.specialization)
            .order_by(func.avg(JobMarket.growth_rate).desc())
            .first()
        )
        top_growing_field = top_field_row[0] if top_field_row else "N/A"

        programs_needing_attention = (
            db.query(func.count(Program.id))
            .filter(Program.graduation_rate < 0.6)
            .scalar()
            or 0
        )

        total_universities = db.query(func.count(University.id)).scalar() or 0
        avg_salary_row = db.query(func.avg(JobMarket.avg_salary)).scalar()
        avg_salary = round(float(avg_salary_row), 2) if avg_salary_row else 0.0

        return {
            "total_programs": total_programs,
            "total_universities": total_universities,
            "avg_employment_rate": avg_employment_rate,
            "top_growing_field": top_growing_field,
            "programs_needing_attention": programs_needing_attention,
            "avg_market_salary": avg_salary,
        }

    def get_demand_supply_analysis(self, db: Session) -> List[Dict[str, Any]]:
        job_data = (
            db.query(
                JobMarket.specialization,
                func.avg(JobMarket.demand_score).label("demand_score"),
                func.avg(JobMarket.job_openings).label("job_openings"),
            )
            .group_by(JobMarket.specialization)
            .all()
        )

        program_data = (
            db.query(Program.field, func.sum(Program.enrolled_students).label("enrolled"))
            .group_by(Program.field)
            .all()
        )
        supply_map = {row.field: int(row.enrolled or 0) for row in program_data}

        max_enrolled = max(supply_map.values(), default=1) or 1
        results = []
        for row in job_data:
            demand_score = float(row.demand_score or 0)
            enrolled = supply_map.get(row.specialization, 0)
            supply_score = round((enrolled / max_enrolled) * 100, 2)
            gap = round(demand_score - supply_score, 2)
            results.append(
                {
                    "specialization": row.specialization,
                    "demand_score": round(demand_score, 2),
                    "supply_score": supply_score,
                    "gap": gap,
                    "job_openings": int(row.job_openings or 0),
                    "enrolled_students": enrolled,
                }
            )
        results.sort(key=lambda x: x["gap"], reverse=True)
        return results

    def get_skill_gaps(self, db: Session) -> List[Dict[str, Any]]:
        job_records = db.query(JobMarket).all()
        market_skills: List[str] = []
        for r in job_records:
            if r.top_skills:
                market_skills.extend(r.top_skills)

        program_fields = db.query(Program.field).distinct().all()
        program_skills = [row[0] for row in program_fields]

        skill_gap_analyzer.analyze_gaps(program_skills, market_skills)

        skill_freq: Dict[str, int] = {}
        for skill in market_skills:
            skill_freq[skill] = skill_freq.get(skill, 0) + 1

        top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:20]
        result = []
        for skill, demand_count in top_skills:
            in_programs = skill.lower() in [p.lower() for p in program_skills]
            result.append(
                {
                    "skill": skill,
                    "demand": demand_count,
                    "supply": 1 if in_programs else 0,
                    "gap": 0 if in_programs else demand_count,
                    "covered": in_programs,
                }
            )
        return result

    def get_trends(self, db: Session, specialization: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.query(JobMarket)
        if specialization:
            query = query.filter(JobMarket.specialization.ilike(f"%{specialization}%"))
        records = query.order_by(JobMarket.data_date.asc()).all()

        grouped: Dict[str, list] = {}
        for r in records:
            grouped.setdefault(r.specialization, []).append((r.data_date, float(r.demand_score)))

        results = []
        for spec, points in grouped.items():
            analysis = trend_analyzer.analyze_trend(points)
            moving_avg = trend_analyzer.calculate_moving_average([v for _, v in points], window=3)
            results.append(
                {
                    "specialization": spec,
                    "data_points": [{"date": str(d), "demand_score": v} for d, v in points],
                    "moving_average": moving_avg,
                    "direction": analysis["direction"],
                    "slope": analysis["slope"],
                    "r_squared": analysis["r_squared"],
                }
            )
        return results

    def get_regional_data(self, db: Session) -> List[Dict[str, Any]]:
        region_jobs = (
            db.query(
                JobMarket.region,
                func.sum(JobMarket.job_openings).label("total_openings"),
                func.avg(JobMarket.avg_salary).label("avg_salary"),
                func.avg(JobMarket.demand_score).label("avg_demand"),
            )
            .group_by(JobMarket.region)
            .all()
        )

        region_unis = (
            db.query(University.region, func.count(University.id).label("uni_count"))
            .group_by(University.region)
            .all()
        )
        uni_map = {row.region: int(row.uni_count) for row in region_unis}

        results = []
        for row in region_jobs:
            results.append(
                {
                    "region": row.region,
                    "total_job_openings": int(row.total_openings or 0),
                    "avg_salary": round(float(row.avg_salary or 0), 2),
                    "avg_demand_score": round(float(row.avg_demand or 0), 2),
                    "university_count": uni_map.get(row.region, 0),
                }
            )
        results.sort(key=lambda x: x["total_job_openings"], reverse=True)
        return results

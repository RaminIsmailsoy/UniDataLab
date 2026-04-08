from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.student_data import IndustryForecast


class SkillGapAnalyzer:
    def analyze_gaps(
        self, program_skills: List[str], market_skills: List[str]
    ) -> Dict[str, Any]:
        program_set = {s.lower() for s in program_skills}
        market_set = {s.lower() for s in market_skills}

        missing_skills = list(market_set - program_set)
        total_market = len(market_set) if market_set else 1
        coverage_count = len(market_set & program_set)
        coverage_rate = round(coverage_count / total_market, 4)
        gap_score = round((1 - coverage_rate) * 100, 2)

        return {
            "missing_skills": missing_skills,
            "covered_skills": list(market_set & program_set),
            "coverage_rate": coverage_rate,
            "gap_score": gap_score,
            "total_market_skills": len(market_set),
            "total_program_skills": len(program_set),
        }

    def get_emerging_skills(self, db: Session) -> List[str]:
        forecasts = db.query(IndustryForecast).order_by(IndustryForecast.growth_prediction.desc()).all()
        skills = []
        for f in forecasts:
            if f.emerging_skills:
                for skill in f.emerging_skills:
                    if skill not in skills:
                        skills.append(skill)
        return skills[:50]

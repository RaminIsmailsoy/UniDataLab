from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.program import Program
from app.models.job_market import JobMarket
from app.models.student_data import StudentData
from app.schemas.recommendation import RecommendationCreate

# Thresholds for decision logic
DEMAND_HIGH_THRESHOLD = 65.0
DEMAND_LOW_THRESHOLD = 40.0
SUPPLY_HIGH_THRESHOLD = 300   # enrolled students
SUPPLY_LOW_THRESHOLD = 100
GRAD_RATE_LOW = 0.6


class RecommendationEngine:
    def generate_for_university(
        self, db: Session, university_id: int
    ) -> List[RecommendationCreate]:
        programs = (
            db.query(Program).filter(Program.university_id == university_id).all()
        )
        if not programs:
            return []

        # Gather job market data indexed by field
        job_data: Dict[str, Dict[str, float]] = {}
        jm_rows = db.query(
            JobMarket.specialization,
            func.avg(JobMarket.demand_score).label("avg_demand"),
            func.avg(JobMarket.growth_rate).label("avg_growth"),
            func.avg(JobMarket.avg_salary).label("avg_salary"),
        ).group_by(JobMarket.specialization).all()
        for row in jm_rows:
            job_data[row.specialization.lower()] = {
                "demand": float(row.avg_demand or 0),
                "growth": float(row.avg_growth or 0),
                "salary": float(row.avg_salary or 0),
            }

        # Latest employment rate per program
        employment_map: Dict[int, float] = {}
        sd_rows = (
            db.query(StudentData.program_id, func.avg(StudentData.employment_rate).label("avg_emp"))
            .filter(StudentData.university_id == university_id)
            .group_by(StudentData.program_id)
            .all()
        )
        for row in sd_rows:
            employment_map[row.program_id] = float(row.avg_emp or 0)

        recommendations: List[RecommendationCreate] = []
        for program in programs:
            market = job_data.get(program.field.lower(), {})
            demand_score = market.get("demand", 50.0)
            growth_rate = market.get("growth", 0.0)
            avg_salary = market.get("salary", 50000.0)
            supply = program.enrolled_students
            grad_rate = program.graduation_rate
            emp_rate = employment_map.get(program.id, 0.5)

            high_demand = demand_score >= DEMAND_HIGH_THRESHOLD
            low_demand = demand_score < DEMAND_LOW_THRESHOLD
            high_supply = supply >= SUPPLY_HIGH_THRESHOLD
            low_supply = supply < SUPPLY_LOW_THRESHOLD
            low_grad = grad_rate < GRAD_RATE_LOW

            action, explanation, score, confidence, factors = self._decide(
                high_demand,
                low_demand,
                high_supply,
                low_supply,
                low_grad,
                demand_score,
                supply,
                grad_rate,
                emp_rate,
                growth_rate,
                avg_salary,
                program,
            )

            recommendations.append(
                RecommendationCreate(
                    university_id=university_id,
                    program_id=program.id,
                    action=action,
                    score=score,
                    confidence=confidence,
                    explanation=explanation,
                    factors=factors,
                )
            )
        return recommendations

    def _decide(
        self,
        high_demand: bool,
        low_demand: bool,
        high_supply: bool,
        low_supply: bool,
        low_grad: bool,
        demand_score: float,
        supply: int,
        grad_rate: float,
        emp_rate: float,
        growth_rate: float,
        avg_salary: float,
        program: Program,
    ):

        factors = {
            "demand_score": round(demand_score, 2),
            "enrolled_students": supply,
            "graduation_rate": round(grad_rate, 4),
            "employment_rate": round(emp_rate, 4),
            "market_growth_rate": round(growth_rate, 2),
            "avg_market_salary": round(avg_salary, 2),
        }

        if high_demand and low_supply:
            action = "expand"
            explanation = (
                f"'{program.name}' has high market demand (score {demand_score:.1f}) "
                f"but only {supply} enrolled students. Expanding capacity will improve "
                f"alignment with labor market needs."
            )
            score = round(min(100, 60 + demand_score * 0.4), 1)
            confidence = round(min(100, 55 + demand_score * 0.35 + growth_rate), 1)
        elif high_demand and not low_supply and not high_supply:
            action = "open"
            explanation = (
                f"'{program.name}' shows strong market demand ({demand_score:.1f}) and "
                f"moderate supply. Consider opening additional sections or a new campus program."
            )
            score = round(min(100, 50 + demand_score * 0.35), 1)
            confidence = round(min(100, 50 + demand_score * 0.3 + growth_rate * 0.5), 1)
        elif low_demand and high_supply:
            action = "reduce"
            explanation = (
                f"'{program.name}' is oversupplied ({supply} students) with low market demand "
                f"(score {demand_score:.1f}). Reducing intake aligns resources with market realities."
            )
            score = round(min(100, 50 + (100 - demand_score) * 0.35), 1)
            confidence = round(min(100, 50 + (100 - demand_score) * 0.3), 1)
        elif low_demand and low_supply and low_grad:
            action = "close"
            explanation = (
                f"'{program.name}' has low market demand ({demand_score:.1f}), small enrollment "
                f"({supply}), and poor graduation rate ({grad_rate * 100:.1f}%). "
                f"Closing the program is recommended to redirect resources."
            )
            score = round(min(100, 55 + (100 - demand_score) * 0.3), 1)
            confidence = round(min(100, 50 + (100 - demand_score) * 0.28), 1)
        elif high_demand and high_supply and not low_grad:
            action = "maintain"
            explanation = (
                f"'{program.name}' is well-aligned with market demand ({demand_score:.1f}) "
                f"and has healthy enrollment ({supply}). Maintain current operations."
            )
            score = round(min(100, 45 + demand_score * 0.3), 1)
            confidence = round(min(100, 60 + grad_rate * 20), 1)
        else:
            action = "monitor"
            explanation = (
                f"'{program.name}' has mixed indicators: demand {demand_score:.1f}, "
                f"enrollment {supply}, graduation rate {grad_rate * 100:.1f}%. "
                f"Continued monitoring is recommended before making structural changes."
            )
            score = round(min(100, 30 + demand_score * 0.2 + grad_rate * 20), 1)
            confidence = round(40 + emp_rate * 20, 1)

        score = max(0.0, min(100.0, score))
        confidence = max(0.0, min(100.0, confidence))
        return action, explanation, score, confidence, factors

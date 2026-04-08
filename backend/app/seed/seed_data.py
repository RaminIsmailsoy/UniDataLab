import random
from datetime import date, timedelta, datetime
from typing import List
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.university import University
from app.models.program import Program
from app.models.job_market import JobMarket
from app.models.student_data import StudentData, IndustryForecast, Recommendation
from app.auth.jwt_handler import get_password_hash
from app.engine.recommendation_engine import RecommendationEngine

random.seed(42)
engine = RecommendationEngine()


UNIVERSITIES = [
    {"name": "Massachusetts Institute of Technology", "country": "USA", "region": "North America", "type": "private", "student_count": 11574},
    {"name": "Stanford University", "country": "USA", "region": "North America", "type": "private", "student_count": 17246},
    {"name": "University of California Berkeley", "country": "USA", "region": "North America", "type": "public", "student_count": 45057},
    {"name": "University of Toronto", "country": "Canada", "region": "North America", "type": "public", "student_count": 97000},
    {"name": "University of Oxford", "country": "UK", "region": "Europe", "type": "public", "student_count": 26000},
    {"name": "Technical University of Munich", "country": "Germany", "region": "Europe", "type": "public", "student_count": 48000},
    {"name": "ETH Zurich", "country": "Switzerland", "region": "Europe", "type": "public", "student_count": 22200},
    {"name": "National University of Singapore", "country": "Singapore", "region": "Asia", "type": "public", "student_count": 40000},
    {"name": "University of Tokyo", "country": "Japan", "region": "Asia", "type": "public", "student_count": 28000},
    {"name": "King Abdullah University of Science and Technology", "country": "Saudi Arabia", "region": "Middle East", "type": "public", "student_count": 3000},
    {"name": "American University of Beirut", "country": "Lebanon", "region": "Middle East", "type": "private", "student_count": 10000},
    {"name": "University of Cape Town", "country": "South Africa", "region": "Africa", "type": "public", "student_count": 29000},
]

PROGRAMS = [
    # Computer Science & Tech
    {"name": "B.Sc. Computer Science", "field": "Computer Science", "degree_level": "bachelor", "base_enrolled": 350, "base_grad": 0.82},
    {"name": "M.Sc. Computer Science", "field": "Computer Science", "degree_level": "master", "base_enrolled": 180, "base_grad": 0.88},
    {"name": "B.Sc. Data Science", "field": "Data Science", "degree_level": "bachelor", "base_enrolled": 220, "base_grad": 0.79},
    {"name": "M.Sc. Data Science & Analytics", "field": "Data Science", "degree_level": "master", "base_enrolled": 150, "base_grad": 0.85},
    {"name": "M.Sc. Artificial Intelligence", "field": "AI/ML", "degree_level": "master", "base_enrolled": 130, "base_grad": 0.87},
    {"name": "Ph.D. Machine Learning", "field": "AI/ML", "degree_level": "phd", "base_enrolled": 45, "base_grad": 0.72},
    {"name": "B.Sc. Cybersecurity", "field": "Cybersecurity", "degree_level": "bachelor", "base_enrolled": 180, "base_grad": 0.78},
    {"name": "M.Sc. Cybersecurity & Networks", "field": "Cybersecurity", "degree_level": "master", "base_enrolled": 95, "base_grad": 0.84},
    # Engineering
    {"name": "B.Eng. Mechanical Engineering", "field": "Mechanical Engineering", "degree_level": "bachelor", "base_enrolled": 300, "base_grad": 0.76},
    {"name": "M.Eng. Mechanical Engineering", "field": "Mechanical Engineering", "degree_level": "master", "base_enrolled": 120, "base_grad": 0.81},
    {"name": "B.Eng. Civil Engineering", "field": "Civil Engineering", "degree_level": "bachelor", "base_enrolled": 250, "base_grad": 0.75},
    {"name": "B.Eng. Electrical Engineering", "field": "Electrical Engineering", "degree_level": "bachelor", "base_enrolled": 280, "base_grad": 0.77},
    {"name": "M.Eng. Electrical Engineering", "field": "Electrical Engineering", "degree_level": "master", "base_enrolled": 110, "base_grad": 0.82},
    # Business
    {"name": "B.B.A. Business Administration", "field": "Business Administration", "degree_level": "bachelor", "base_enrolled": 400, "base_grad": 0.80},
    {"name": "MBA", "field": "Business Administration", "degree_level": "master", "base_enrolled": 200, "base_grad": 0.91},
    {"name": "B.Sc. Finance", "field": "Finance", "degree_level": "bachelor", "base_enrolled": 280, "base_grad": 0.78},
    {"name": "M.Sc. Finance", "field": "Finance", "degree_level": "master", "base_enrolled": 130, "base_grad": 0.85},
    {"name": "B.B.A. Marketing", "field": "Marketing", "degree_level": "bachelor", "base_enrolled": 260, "base_grad": 0.77},
    # Medicine & Health
    {"name": "M.D. Medicine", "field": "Medicine", "degree_level": "master", "base_enrolled": 150, "base_grad": 0.93},
    {"name": "B.Sc. Nursing", "field": "Nursing", "degree_level": "bachelor", "base_enrolled": 200, "base_grad": 0.85},
    {"name": "B.Sc. Psychology", "field": "Psychology", "degree_level": "bachelor", "base_enrolled": 230, "base_grad": 0.76},
    # Education & Humanities
    {"name": "B.Ed. Education", "field": "Education", "degree_level": "bachelor", "base_enrolled": 220, "base_grad": 0.82},
    {"name": "M.Ed. Educational Technology", "field": "Education", "degree_level": "master", "base_enrolled": 90, "base_grad": 0.83},
    # Science & Environment
    {"name": "B.Sc. Environmental Science", "field": "Environmental Science", "degree_level": "bachelor", "base_enrolled": 160, "base_grad": 0.74},
    {"name": "M.Sc. Environmental Engineering", "field": "Environmental Science", "degree_level": "master", "base_enrolled": 75, "base_grad": 0.79},
]

JOB_MARKET_DATA = [
    # Computer Science
    {"specialization": "Computer Science", "region": "North America", "job_openings": 125000, "avg_salary": 115000, "demand_score": 90, "growth_rate": 15.0, "top_skills": ["Python", "Java", "SQL", "Cloud Computing", "Algorithms", "Git"]},
    {"specialization": "Computer Science", "region": "Europe", "job_openings": 85000, "avg_salary": 75000, "demand_score": 85, "growth_rate": 12.0, "top_skills": ["Python", "C++", "Java", "DevOps", "Kubernetes"]},
    {"specialization": "Computer Science", "region": "Asia", "job_openings": 110000, "avg_salary": 55000, "demand_score": 88, "growth_rate": 18.0, "top_skills": ["Java", "Python", "Go", "Microservices", "Cloud"]},
    {"specialization": "Computer Science", "region": "Middle East", "job_openings": 18000, "avg_salary": 65000, "demand_score": 78, "growth_rate": 14.0, "top_skills": ["Python", "AWS", "DevOps", "SQL"]},
    # Data Science
    {"specialization": "Data Science", "region": "North America", "job_openings": 95000, "avg_salary": 120000, "demand_score": 92, "growth_rate": 22.0, "top_skills": ["Python", "R", "Machine Learning", "SQL", "Tableau", "Spark"]},
    {"specialization": "Data Science", "region": "Europe", "job_openings": 62000, "avg_salary": 78000, "demand_score": 87, "growth_rate": 19.0, "top_skills": ["Python", "R", "TensorFlow", "Power BI", "Azure"]},
    {"specialization": "Data Science", "region": "Asia", "job_openings": 78000, "avg_salary": 52000, "demand_score": 85, "growth_rate": 24.0, "top_skills": ["Python", "SQL", "Tableau", "Machine Learning", "Hadoop"]},
    {"specialization": "Data Science", "region": "Middle East", "job_openings": 12000, "avg_salary": 70000, "demand_score": 80, "growth_rate": 20.0, "top_skills": ["Python", "R", "Power BI", "SQL"]},
    # AI/ML
    {"specialization": "AI/ML", "region": "North America", "job_openings": 72000, "avg_salary": 135000, "demand_score": 95, "growth_rate": 35.0, "top_skills": ["PyTorch", "TensorFlow", "Python", "Deep Learning", "NLP", "MLOps"]},
    {"specialization": "AI/ML", "region": "Europe", "job_openings": 45000, "avg_salary": 90000, "demand_score": 90, "growth_rate": 30.0, "top_skills": ["PyTorch", "TensorFlow", "Python", "Computer Vision", "Transformers"]},
    {"specialization": "AI/ML", "region": "Asia", "job_openings": 60000, "avg_salary": 65000, "demand_score": 92, "growth_rate": 40.0, "top_skills": ["TensorFlow", "Python", "NLP", "Computer Vision", "Robotics"]},
    {"specialization": "AI/ML", "region": "Middle East", "job_openings": 8000, "avg_salary": 85000, "demand_score": 82, "growth_rate": 28.0, "top_skills": ["Python", "TensorFlow", "NLP", "MLOps"]},
    # Cybersecurity
    {"specialization": "Cybersecurity", "region": "North America", "job_openings": 65000, "avg_salary": 110000, "demand_score": 88, "growth_rate": 18.0, "top_skills": ["Network Security", "SIEM", "Penetration Testing", "Cloud Security", "CISSP"]},
    {"specialization": "Cybersecurity", "region": "Europe", "job_openings": 40000, "avg_salary": 72000, "demand_score": 83, "growth_rate": 16.0, "top_skills": ["GDPR Compliance", "Penetration Testing", "SOC", "Firewalls"]},
    {"specialization": "Cybersecurity", "region": "Asia", "job_openings": 48000, "avg_salary": 58000, "demand_score": 80, "growth_rate": 20.0, "top_skills": ["Network Security", "SOC", "Cloud Security", "ISO 27001"]},
    # Mechanical Engineering
    {"specialization": "Mechanical Engineering", "region": "North America", "job_openings": 45000, "avg_salary": 88000, "demand_score": 68, "growth_rate": 5.0, "top_skills": ["CAD", "FEA", "SolidWorks", "AutoCAD", "Manufacturing"]},
    {"specialization": "Mechanical Engineering", "region": "Europe", "job_openings": 52000, "avg_salary": 65000, "demand_score": 72, "growth_rate": 6.0, "top_skills": ["CAD", "CATIA", "FEA", "Robotics", "Industry 4.0"]},
    {"specialization": "Mechanical Engineering", "region": "Asia", "job_openings": 85000, "avg_salary": 42000, "demand_score": 75, "growth_rate": 8.0, "top_skills": ["CAD", "Manufacturing", "Quality Control", "Lean"]},
    {"specialization": "Mechanical Engineering", "region": "Middle East", "job_openings": 15000, "avg_salary": 55000, "demand_score": 65, "growth_rate": 7.0, "top_skills": ["CAD", "Project Management", "AutoCAD"]},
    # Civil Engineering
    {"specialization": "Civil Engineering", "region": "North America", "job_openings": 38000, "avg_salary": 82000, "demand_score": 62, "growth_rate": 4.0, "top_skills": ["AutoCAD", "Structural Analysis", "GIS", "Project Management"]},
    {"specialization": "Civil Engineering", "region": "Europe", "job_openings": 42000, "avg_salary": 58000, "demand_score": 65, "growth_rate": 5.0, "top_skills": ["AutoCAD", "BIM", "Structural Design", "Environmental Impact"]},
    {"specialization": "Civil Engineering", "region": "Middle East", "job_openings": 25000, "avg_salary": 62000, "demand_score": 78, "growth_rate": 12.0, "top_skills": ["BIM", "Project Management", "AutoCAD", "Structural Engineering"]},
    # Electrical Engineering
    {"specialization": "Electrical Engineering", "region": "North America", "job_openings": 55000, "avg_salary": 95000, "demand_score": 75, "growth_rate": 9.0, "top_skills": ["Circuit Design", "MATLAB", "Power Systems", "Embedded Systems", "PLC"]},
    {"specialization": "Electrical Engineering", "region": "Europe", "job_openings": 60000, "avg_salary": 68000, "demand_score": 78, "growth_rate": 10.0, "top_skills": ["PLC", "SCADA", "Power Electronics", "Embedded Systems", "MATLAB"]},
    {"specialization": "Electrical Engineering", "region": "Asia", "job_openings": 90000, "avg_salary": 45000, "demand_score": 80, "growth_rate": 11.0, "top_skills": ["Embedded Systems", "MATLAB", "Power Systems", "IoT", "Circuit Design"]},
    # Business Administration
    {"specialization": "Business Administration", "region": "North America", "job_openings": 90000, "avg_salary": 78000, "demand_score": 72, "growth_rate": 7.0, "top_skills": ["Leadership", "Excel", "Strategic Planning", "CRM", "Communication"]},
    {"specialization": "Business Administration", "region": "Europe", "job_openings": 75000, "avg_salary": 62000, "demand_score": 70, "growth_rate": 6.0, "top_skills": ["Strategic Management", "Excel", "ERP", "Project Management"]},
    {"specialization": "Business Administration", "region": "Asia", "job_openings": 95000, "avg_salary": 48000, "demand_score": 74, "growth_rate": 9.0, "top_skills": ["Leadership", "Excel", "Supply Chain", "ERP", "Communication"]},
    {"specialization": "Business Administration", "region": "Middle East", "job_openings": 22000, "avg_salary": 58000, "demand_score": 68, "growth_rate": 8.0, "top_skills": ["Leadership", "Arabic", "ERP", "Excel"]},
    # Finance
    {"specialization": "Finance", "region": "North America", "job_openings": 68000, "avg_salary": 95000, "demand_score": 78, "growth_rate": 10.0, "top_skills": ["Financial Modeling", "Excel", "Bloomberg", "Risk Management", "CFA"]},
    {"specialization": "Finance", "region": "Europe", "job_openings": 55000, "avg_salary": 72000, "demand_score": 74, "growth_rate": 9.0, "top_skills": ["Financial Modeling", "Excel", "Basel III", "SAP", "Python"]},
    {"specialization": "Finance", "region": "Middle East", "job_openings": 18000, "avg_salary": 75000, "demand_score": 76, "growth_rate": 11.0, "top_skills": ["Islamic Finance", "Excel", "Financial Modeling", "Bloomberg"]},
    # Marketing
    {"specialization": "Marketing", "region": "North America", "job_openings": 55000, "avg_salary": 72000, "demand_score": 70, "growth_rate": 8.0, "top_skills": ["Digital Marketing", "SEO", "Google Analytics", "Social Media", "Content Marketing"]},
    {"specialization": "Marketing", "region": "Europe", "job_openings": 45000, "avg_salary": 58000, "demand_score": 68, "growth_rate": 7.0, "top_skills": ["Digital Marketing", "SEO", "CRM", "Email Marketing", "Analytics"]},
    # Medicine
    {"specialization": "Medicine", "region": "North America", "job_openings": 42000, "avg_salary": 220000, "demand_score": 88, "growth_rate": 12.0, "top_skills": ["Clinical Skills", "Patient Care", "Diagnosis", "Surgery", "EHR"]},
    {"specialization": "Medicine", "region": "Europe", "job_openings": 38000, "avg_salary": 95000, "demand_score": 85, "growth_rate": 10.0, "top_skills": ["Clinical Skills", "Diagnosis", "Research", "Patient Care"]},
    {"specialization": "Medicine", "region": "Middle East", "job_openings": 20000, "avg_salary": 85000, "demand_score": 87, "growth_rate": 14.0, "top_skills": ["Clinical Skills", "Arabic", "Emergency Medicine", "Diagnosis"]},
    # Nursing
    {"specialization": "Nursing", "region": "North America", "job_openings": 95000, "avg_salary": 78000, "demand_score": 92, "growth_rate": 16.0, "top_skills": ["Patient Care", "Clinical Assessment", "EHR", "IV Therapy", "Critical Care"]},
    {"specialization": "Nursing", "region": "Europe", "job_openings": 72000, "avg_salary": 52000, "demand_score": 88, "growth_rate": 14.0, "top_skills": ["Patient Care", "Medication Administration", "Clinical Skills", "Communication"]},
    {"specialization": "Nursing", "region": "Middle East", "job_openings": 28000, "avg_salary": 55000, "demand_score": 90, "growth_rate": 18.0, "top_skills": ["Patient Care", "IV Therapy", "Critical Care", "Arabic", "EHR"]},
    # Psychology
    {"specialization": "Psychology", "region": "North America", "job_openings": 32000, "avg_salary": 72000, "demand_score": 65, "growth_rate": 8.0, "top_skills": ["CBT", "Assessment", "Counseling", "Research", "Data Analysis"]},
    {"specialization": "Psychology", "region": "Europe", "job_openings": 25000, "avg_salary": 55000, "demand_score": 60, "growth_rate": 7.0, "top_skills": ["Counseling", "Research", "CBT", "Statistics"]},
    # Education
    {"specialization": "Education", "region": "North America", "job_openings": 48000, "avg_salary": 58000, "demand_score": 70, "growth_rate": 6.0, "top_skills": ["Curriculum Design", "Classroom Management", "EdTech", "Assessment", "Special Ed"]},
    {"specialization": "Education", "region": "Asia", "job_openings": 85000, "avg_salary": 35000, "demand_score": 75, "growth_rate": 9.0, "top_skills": ["Teaching", "Curriculum Design", "EdTech", "TESOL", "Assessment"]},
    {"specialization": "Education", "region": "Middle East", "job_openings": 25000, "avg_salary": 42000, "demand_score": 72, "growth_rate": 10.0, "top_skills": ["Arabic", "Curriculum Design", "TESOL", "EdTech"]},
    # Environmental Science
    {"specialization": "Environmental Science", "region": "North America", "job_openings": 28000, "avg_salary": 68000, "demand_score": 68, "growth_rate": 10.0, "top_skills": ["GIS", "Environmental Assessment", "Sustainability", "Data Analysis", "Climate Modeling"]},
    {"specialization": "Environmental Science", "region": "Europe", "job_openings": 32000, "avg_salary": 58000, "demand_score": 72, "growth_rate": 12.0, "top_skills": ["GIS", "Sustainability", "EU Regulations", "Environmental Impact", "Carbon Accounting"]},
    {"specialization": "Environmental Science", "region": "Asia", "job_openings": 25000, "avg_salary": 40000, "demand_score": 65, "growth_rate": 14.0, "top_skills": ["GIS", "Sustainability", "Environmental Impact", "Carbon Footprint"]},
]

INDUSTRY_FORECASTS = [
    {"industry": "AI/ML", "region": "North America", "forecast_year": 2025, "growth_prediction": 38.0, "confidence_level": 88.0, "emerging_skills": ["LLMs", "MLOps", "Responsible AI", "Prompt Engineering", "Vector Databases"], "source": "Gartner"},
    {"industry": "AI/ML", "region": "Europe", "forecast_year": 2025, "growth_prediction": 32.0, "confidence_level": 82.0, "emerging_skills": ["AI Ethics", "TensorFlow", "Transformers", "MLOps", "Federated Learning"], "source": "McKinsey"},
    {"industry": "AI/ML", "region": "Asia", "forecast_year": 2025, "growth_prediction": 42.0, "confidence_level": 85.0, "emerging_skills": ["LLMs", "Computer Vision", "Robotics", "NLP", "Edge AI"], "source": "IDC"},
    {"industry": "Cybersecurity", "region": "North America", "forecast_year": 2025, "growth_prediction": 20.0, "confidence_level": 90.0, "emerging_skills": ["Zero Trust", "Cloud Security", "AI Security", "DevSecOps", "Threat Intelligence"], "source": "ISC2"},
    {"industry": "Cybersecurity", "region": "Europe", "forecast_year": 2025, "growth_prediction": 18.0, "confidence_level": 85.0, "emerging_skills": ["GDPR Compliance", "Zero Trust", "SOC Automation", "Threat Hunting"], "source": "ENISA"},
    {"industry": "Data Science", "region": "North America", "forecast_year": 2025, "growth_prediction": 25.0, "confidence_level": 87.0, "emerging_skills": ["AutoML", "DataOps", "Causal Inference", "Feature Engineering", "Data Mesh"], "source": "Forrester"},
    {"industry": "Data Science", "region": "Asia", "forecast_year": 2025, "growth_prediction": 28.0, "confidence_level": 80.0, "emerging_skills": ["Python", "Spark", "MLflow", "Data Lakehouse", "Real-time Analytics"], "source": "IDC"},
    {"industry": "Renewable Energy", "region": "Europe", "forecast_year": 2025, "growth_prediction": 30.0, "confidence_level": 85.0, "emerging_skills": ["Solar Engineering", "Wind Energy", "Battery Storage", "Grid Management", "Carbon Capture"], "source": "IEA"},
    {"industry": "Renewable Energy", "region": "Middle East", "forecast_year": 2025, "growth_prediction": 35.0, "confidence_level": 82.0, "emerging_skills": ["Solar Engineering", "Grid Management", "Energy Storage", "Hydrogen"], "source": "IRENA"},
    {"industry": "Healthcare Tech", "region": "North America", "forecast_year": 2025, "growth_prediction": 22.0, "confidence_level": 83.0, "emerging_skills": ["Digital Health", "Telemedicine", "Health Informatics", "Wearables", "AI Diagnostics"], "source": "Deloitte"},
    {"industry": "FinTech", "region": "Europe", "forecast_year": 2025, "growth_prediction": 18.0, "confidence_level": 80.0, "emerging_skills": ["Blockchain", "DeFi", "Open Banking", "RegTech", "Digital Payments"], "source": "EY"},
    {"industry": "FinTech", "region": "Asia", "forecast_year": 2025, "growth_prediction": 26.0, "confidence_level": 84.0, "emerging_skills": ["Mobile Payments", "Blockchain", "Digital Banking", "RegTech", "Crypto"], "source": "KPMG"},
    {"industry": "AI/ML", "region": "North America", "forecast_year": 2026, "growth_prediction": 42.0, "confidence_level": 80.0, "emerging_skills": ["Agentic AI", "Multimodal Models", "Synthetic Data", "AI Governance"], "source": "Gartner"},
    {"industry": "Cybersecurity", "region": "North America", "forecast_year": 2026, "growth_prediction": 24.0, "confidence_level": 85.0, "emerging_skills": ["AI-Powered SIEM", "Quantum Cryptography", "Autonomous SOC", "Zero Trust Architecture"], "source": "ISC2"},
    {"industry": "Data Science", "region": "Europe", "forecast_year": 2026, "growth_prediction": 22.0, "confidence_level": 78.0, "emerging_skills": ["Federated Learning", "Privacy-Preserving Analytics", "Causal AI", "Data Governance"], "source": "Forrester"},
]


def seed_database(db: Session) -> None:
    # Users
    if db.query(User).count() > 0:
        return  # already seeded

    admin = User(
        email="admin@unidatalab.com",
        hashed_password=get_password_hash("Admin@12345"),
        full_name="Platform Administrator",
        role="admin",
        is_active=True,
    )
    analyst = User(
        email="analyst@unidatalab.com",
        hashed_password=get_password_hash("Analyst@12345"),
        full_name="Data Analyst",
        role="analyst",
        is_active=True,
    )
    db.add_all([admin, analyst])
    db.flush()

    # Universities
    uni_objs: List[University] = []
    for u in UNIVERSITIES:
        uni = University(**u)
        db.add(uni)
        uni_objs.append(uni)
    db.flush()

    # Programs (5-7 per university)
    program_objs: List[Program] = []
    for uni in uni_objs:
        selected = random.sample(PROGRAMS, k=random.randint(5, 7))
        for pt in selected:
            variance = random.uniform(0.85, 1.15)
            prog = Program(
                university_id=uni.id,
                name=pt["name"],
                field=pt["field"],
                degree_level=pt["degree_level"],
                enrolled_students=int(pt["base_enrolled"] * variance),
                graduation_rate=round(min(1.0, pt["base_grad"] * random.uniform(0.9, 1.08)), 4),
                status="active" if random.random() > 0.08 else "under_review",
            )
            db.add(prog)
            program_objs.append(prog)
    db.flush()

    # Job Market entries (each entry per year for 5 years)
    base_date = date(2020, 1, 1)
    for jm_template in JOB_MARKET_DATA:
        for year_offset in range(5):
            jm_date = base_date.replace(year=2020 + year_offset)
            growth_factor = 1 + (jm_template["growth_rate"] / 100) * year_offset
            jm = JobMarket(
                specialization=jm_template["specialization"],
                region=jm_template["region"],
                job_openings=int(jm_template["job_openings"] * growth_factor * random.uniform(0.95, 1.05)),
                avg_salary=round(jm_template["avg_salary"] * growth_factor * random.uniform(0.97, 1.03), 2),
                demand_score=round(min(100, jm_template["demand_score"] * growth_factor * random.uniform(0.97, 1.03)), 2),
                growth_rate=round(jm_template["growth_rate"] * random.uniform(0.9, 1.1), 2),
                top_skills=jm_template["top_skills"],
                data_date=jm_date,
                source="UniDataLab Market Research",
            )
            db.add(jm)
    db.flush()

    # Student data (3-5 years per program)
    for prog in program_objs:
        for year_offset in range(random.randint(3, 5)):
            year = 2019 + year_offset
            enrolled = int(prog.enrolled_students * random.uniform(0.8, 1.0))
            applications = int(enrolled * random.uniform(2.5, 5.0))
            graduated = int(enrolled * prog.graduation_rate * random.uniform(0.9, 1.05))
            emp_rate = round(random.uniform(0.65, 0.95), 4)
            avg_salary = round(random.uniform(38000, 95000), 2)
            sd = StudentData(
                university_id=prog.university_id,
                program_id=prog.id,
                year=year,
                applications=applications,
                enrolled=enrolled,
                graduated=graduated,
                employment_rate=emp_rate,
                avg_starting_salary=avg_salary,
            )
            db.add(sd)
    db.flush()

    # Industry forecasts
    for fc in INDUSTRY_FORECASTS:
        forecast = IndustryForecast(**fc)
        db.add(forecast)
    db.flush()

    # Recommendations
    for uni in uni_objs:
        recs = engine.generate_for_university(db, uni.id)
        for rc in recs:
            rec = Recommendation(**rc.model_dump())
            db.add(rec)

    db.commit()

from datetime import datetime, timezone
import io
import csv
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.program import Program
from app.models.university import University
from app.models.job_market import JobMarket
from app.models.student_data import Recommendation

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate,
        Paragraph,
        Spacer,
        Table,
        TableStyle,
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class ReportService:
    def export_csv(self, db: Session) -> bytes:
        programs = (
            db.query(
                Program.id,
                Program.name,
                Program.field,
                Program.degree_level,
                Program.enrolled_students,
                Program.graduation_rate,
                Program.status,
                University.name.label("university_name"),
                University.country,
                University.region,
            )
            .join(University, Program.university_id == University.id)
            .all()
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "Program ID",
                "Program Name",
                "Field",
                "Degree Level",
                "Enrolled Students",
                "Graduation Rate (%)",
                "Status",
                "University",
                "Country",
                "Region",
            ]
        )
        for p in programs:
            writer.writerow(
                [
                    p.id,
                    p.name,
                    p.field,
                    p.degree_level,
                    p.enrolled_students,
                    f"{p.graduation_rate * 100:.1f}",
                    p.status,
                    p.university_name,
                    p.country,
                    p.region,
                ]
            )
        return output.getvalue().encode("utf-8")

    def export_pdf(self, db: Session) -> bytes:
        if not REPORTLAB_AVAILABLE:
            return b"ReportLab not available"

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch)
        styles = getSampleStyleSheet()
        story = []

        # Title
        story.append(Paragraph("UniDataLab — Analytics Report", styles["Title"]))
        story.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]))
        story.append(Spacer(1, 0.3 * inch))

        # KPI summary
        total_programs = db.query(func.count(Program.id)).scalar() or 0
        total_unis = db.query(func.count(University.id)).scalar() or 0
        avg_grad = db.query(func.avg(Program.graduation_rate)).scalar() or 0.0
        story.append(Paragraph("Key Performance Indicators", styles["Heading2"]))
        kpi_data = [
            ["Metric", "Value"],
            ["Total Universities", str(total_unis)],
            ["Total Programs", str(total_programs)],
            ["Avg Graduation Rate", f"{float(avg_grad) * 100:.1f}%"],
        ]
        kpi_table = Table(kpi_data, colWidths=[3 * inch, 3 * inch])
        kpi_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                ]
            )
        )
        story.append(kpi_table)
        story.append(Spacer(1, 0.3 * inch))

        # Top job market entries
        story.append(Paragraph("Job Market Overview (Top 10 by Demand)", styles["Heading2"]))
        top_jobs = (
            db.query(JobMarket)
            .order_by(JobMarket.demand_score.desc())
            .limit(10)
            .all()
        )
        job_data = [["Specialization", "Region", "Demand Score", "Avg Salary", "Growth Rate"]]
        for j in top_jobs:
            job_data.append(
                [
                    j.specialization,
                    j.region,
                    f"{j.demand_score:.1f}",
                    f"${j.avg_salary:,.0f}",
                    f"{j.growth_rate:.1f}%",
                ]
            )
        job_table = Table(job_data, colWidths=[1.8 * inch, 1.4 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch])
        job_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
                ]
            )
        )
        story.append(job_table)
        story.append(Spacer(1, 0.3 * inch))

        # Recommendations summary
        story.append(Paragraph("Recommendations Summary", styles["Heading2"]))
        recs = db.query(Recommendation).order_by(Recommendation.score.desc()).limit(15).all()
        rec_data = [["University ID", "Program ID", "Action", "Score", "Confidence"]]
        for r in recs:
            rec_data.append(
                [
                    str(r.university_id),
                    str(r.program_id),
                    r.action.upper(),
                    f"{r.score:.0f}",
                    f"{r.confidence:.0f}%",
                ]
            )
        rec_table = Table(rec_data, colWidths=[1.3 * inch, 1.3 * inch, 1.4 * inch, 1 * inch, 1.5 * inch])
        rec_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#7c3aed")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f3ff")]),
                ]
            )
        )
        story.append(rec_table)

        doc.build(story)
        return buffer.getvalue()

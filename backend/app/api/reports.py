from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.services.report_service import ReportService

router = APIRouter()
report_service = ReportService()


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    csv_bytes = report_service.export_csv(db)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=unidatalab_report.csv"},
    )


@router.get("/export/pdf")
def export_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    pdf_bytes = report_service.export_pdf(db)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=unidatalab_report.pdf"},
    )

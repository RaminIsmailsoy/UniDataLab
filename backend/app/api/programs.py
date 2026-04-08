from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate, ProgramResponse
from app.auth.dependencies import get_current_active_user, require_admin
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ProgramResponse])
def list_programs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    university_id: Optional[int] = Query(None),
    field: Optional[str] = Query(None),
    degree_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = db.query(Program)
    if university_id:
        query = query.filter(Program.university_id == university_id)
    if field:
        query = query.filter(Program.field.ilike(f"%{field}%"))
    if degree_level:
        query = query.filter(Program.degree_level == degree_level)
    if status:
        query = query.filter(Program.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/{program_id}", response_model=ProgramResponse)
def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    return program


@router.post("/", response_model=ProgramResponse, status_code=status.HTTP_201_CREATED)
def create_program(
    program_in: ProgramCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    program = Program(**program_in.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


@router.put("/{program_id}", response_model=ProgramResponse)
def update_program(
    program_id: int,
    program_in: ProgramUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    for field, value in program_in.model_dump(exclude_unset=True).items():
        setattr(program, field, value)
    db.commit()
    db.refresh(program)
    return program

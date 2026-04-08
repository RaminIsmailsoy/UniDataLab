from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.config import settings
from app.database import engine, SessionLocal
from app.models import User, University, Program, JobMarket, StudentData, IndustryForecast, Recommendation
from app.database import Base

from app.api import auth, universities, programs, job_market, analytics, recommendations, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Seed if empty
    db = SessionLocal()
    try:
        from app.models.user import User as UserModel
        from app.seed.seed_data import seed_database
        if db.query(UserModel).count() == 0:
            seed_database(db)
    except Exception as e:
        print(f"Seeding error: {e}")
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(universities.router, prefix=f"{settings.API_V1_STR}/universities", tags=["Universities"])
app.include_router(programs.router, prefix=f"{settings.API_V1_STR}/programs", tags=["Programs"])
app.include_router(job_market.router, prefix=f"{settings.API_V1_STR}/job-market", tags=["Job Market"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix=f"{settings.API_V1_STR}/recommendations", tags=["Recommendations"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["Reports"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

# UniDataLab Architecture Documentation

## 1. System Overview

UniDataLab is a three-tier web application consisting of a Next.js frontend, a FastAPI backend, and a PostgreSQL database. The system ingests job market data, university program data, and industry forecasts to generate actionable recommendations for university administrators.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Client Browser                               │
│                    http://localhost:3000                              │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS / HTTP
┌──────────────────────────────▼───────────────────────────────────────┐
│                     Frontend Layer (Next.js 14)                       │
│                                                                       │
│  ┌─────────────┐  ┌──────────────────┐  ┌────────────┐  ┌────────┐  │
│  │  Dashboard  │  │ Recommendations  │  │  Programs  │  │Reports │  │
│  └─────────────┘  └──────────────────┘  └────────────┘  └────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │         State Management (React Context / SWR)                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ REST API (JSON)
                               │ JWT Bearer Token
┌──────────────────────────────▼───────────────────────────────────────┐
│                      Backend Layer (FastAPI)                           │
│                    http://localhost:8000                              │
│                                                                       │
│  ┌────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │    Auth    │  │ Universities │  │  Programs  │  │  Analytics  │  │
│  │  /api/auth │  │  /api/univ.. │  │ /api/prog..│  │ /api/analy..│  │
│  └────────────┘  └──────────────┘  └────────────┘  └─────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Intelligence Engine                            │ │
│  │  ┌──────────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │ │
│  │  │Trend Analyzer│  │Skill Gap  │  │Forecaster │  │Recommender│  │ │
│  │  └──────────────┘  └───────────┘  └───────────┘  └──────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │              Data Layer (SQLAlchemy 2.0 ORM)                     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ SQLAlchemy / psycopg2
┌──────────────────────────────▼───────────────────────────────────────┐
│                   Database Layer (PostgreSQL 15)                       │
│                                                                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  users   │  │universities  │  │   programs   │  │ job_market  │  │
│  └──────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
│                                                                       │
│  ┌──────────────────┐  ┌────────────────────┐  ┌───────────────────┐ │
│  │student_enrollment│  │graduate_employment │  │industry_forecasts │ │
│  └──────────────────┘  └────────────────────┘  └───────────────────┘ │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                    recommendations                             │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Descriptions

### 2.1 Frontend (Next.js 14)

The frontend is a server-side rendered React application built with Next.js 14, using the App Router paradigm.

**Key Pages:**
- `/` — Landing / Login page
- `/dashboard` — Main analytics dashboard with KPI cards and charts
- `/recommendations` — AI-generated program recommendations
- `/programs` — University program management (CRUD)
- `/reports` — Export CSV/PDF reports
- `/settings` — User and system settings (admin only)

**Key Libraries:**
- **Tailwind CSS** — Utility-first styling for rapid UI development
- **Recharts** — Composable charting library built on D3, used for all visualizations
- **SWR** — Stale-while-revalidate data fetching with automatic revalidation
- **React Hook Form** — Performant form handling with minimal re-renders

**Why Next.js?**
Next.js provides server-side rendering for improved SEO and initial load performance, built-in API routes if needed for BFF patterns, and excellent TypeScript support. The App Router model makes nested layouts straightforward.

**Why Recharts?**
Recharts is the most React-idiomatic charting library, built as composable React components. It handles responsiveness natively and produces clean, accessible charts without requiring D3 expertise.

---

### 2.2 Backend (FastAPI)

The backend exposes a RESTful JSON API, documented automatically via OpenAPI/Swagger at `/docs`.

**Router Structure:**
```
app/
├── main.py              — FastAPI app initialization, middleware, router mounting
├── database.py          — SQLAlchemy engine, session factory, get_db dependency
├── models/
│   ├── user.py          — User ORM model
│   ├── university.py    — University + Program ORM models
│   ├── job_market.py    — JobMarketData ORM model
│   ├── enrollment.py    — StudentEnrollment ORM model
│   ├── employment.py    — GraduateEmployment ORM model
│   ├── forecast.py      — IndustryForecast ORM model
│   └── recommendation.py— Recommendation ORM model
├── schemas/             — Pydantic v2 request/response schemas
├── routers/
│   ├── auth.py          — POST /login, POST /register, GET /me
│   ├── universities.py  — CRUD for universities and programs
│   ├── analytics.py     — Dashboard KPIs, demand-supply, skill gaps, regional
│   ├── recommendations.py— GET/POST recommendations
│   └── reports.py       — CSV and PDF export
├── services/
│   └── intelligence/    — Intelligence Engine (see Section 5)
└── utils/
    ├── security.py      — JWT creation/verification, password hashing
    └── data_loader.py   — Seeding from JSON files in /data
```

**Why FastAPI?**
FastAPI offers automatic OpenAPI documentation, native async support (ASGI), Pydantic v2 validation at near-zero overhead, and Python type hints throughout. Its dependency injection system makes testing and auth middleware clean and composable.

**Why PostgreSQL?**
PostgreSQL is the most feature-complete open-source relational database, supporting JSON columns, full-text search, window functions, and CTEs — all of which are useful for analytics queries. Its ACID guarantees ensure data integrity for recommendations.

---

### 2.3 Database Layer (PostgreSQL 15 + SQLAlchemy 2.0)

SQLAlchemy 2.0 provides a modern async-compatible ORM layer. All models inherit from a declarative `Base` class.

---

## 3. Database Schema

### 3.1 Entity Relationship Overview

```
users ──────────────────────── recommendations
                                      │
universities ──┬── programs ──────────┤
               │         │            │
               │    student_enrollment│
               │         │            │
               │    graduate_employment
               │
job_market_data (global, not per-university)
industry_forecasts (global, not per-university)
```

### 3.2 Table Definitions

**users**
```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    full_name   VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    role        VARCHAR(50) DEFAULT 'analyst',  -- 'admin' | 'analyst'
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

**universities**
```sql
CREATE TABLE universities (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) UNIQUE NOT NULL,
    country      VARCHAR(100),
    region       VARCHAR(100),
    type         VARCHAR(50),  -- 'public' | 'private'
    student_count INTEGER,
    created_at   TIMESTAMP DEFAULT NOW()
);
```

**programs**
```sql
CREATE TABLE programs (
    id                SERIAL PRIMARY KEY,
    university_id     INTEGER REFERENCES universities(id) ON DELETE CASCADE,
    name              VARCHAR(255) NOT NULL,
    field             VARCHAR(100),
    degree_level      VARCHAR(50),  -- 'bachelor' | 'master' | 'doctorate'
    enrolled_students INTEGER,
    graduation_rate   FLOAT,
    status            VARCHAR(50) DEFAULT 'active',
    created_at        TIMESTAMP DEFAULT NOW()
);
```

**job_market_data**
```sql
CREATE TABLE job_market_data (
    id              SERIAL PRIMARY KEY,
    specialization  VARCHAR(255) NOT NULL,
    region          VARCHAR(100) NOT NULL,
    job_openings    INTEGER,
    avg_salary      INTEGER,
    demand_score    FLOAT,
    growth_rate     FLOAT,
    top_skills      JSONB,
    data_date       DATE,
    source          VARCHAR(255)
);
```

**student_enrollment**
```sql
CREATE TABLE student_enrollment (
    id                  SERIAL PRIMARY KEY,
    university_id       INTEGER REFERENCES universities(id),
    program_id          INTEGER REFERENCES programs(id),
    year                INTEGER NOT NULL,
    applications        INTEGER,
    enrolled            INTEGER,
    graduated           INTEGER,
    employment_rate     FLOAT,
    avg_starting_salary INTEGER
);
```

**graduate_employment**
```sql
CREATE TABLE graduate_employment (
    id                        SERIAL PRIMARY KEY,
    program_id                INTEGER REFERENCES programs(id),
    university_id             INTEGER REFERENCES universities(id),
    year                      INTEGER NOT NULL,
    graduates                 INTEGER,
    employed_within_6_months  INTEGER,
    employment_rate           FLOAT,
    avg_salary                INTEGER,
    top_employers             JSONB,
    industry                  VARCHAR(255)
);
```

**industry_forecasts**
```sql
CREATE TABLE industry_forecasts (
    id                  SERIAL PRIMARY KEY,
    industry            VARCHAR(255) NOT NULL,
    region              VARCHAR(100),
    forecast_year       INTEGER NOT NULL,
    growth_prediction   FLOAT,
    confidence_level    FLOAT,
    emerging_skills     JSONB,
    source              VARCHAR(255)
);
```

**recommendations**
```sql
CREATE TABLE recommendations (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER REFERENCES programs(id),
    university_id   INTEGER REFERENCES universities(id),
    action          VARCHAR(50),  -- 'expand'|'reduce'|'open'|'close'|'maintain'|'monitor'
    score           FLOAT,        -- 0-100
    confidence      FLOAT,        -- 0-100
    explanation     TEXT,
    factors         JSONB,
    generated_at    TIMESTAMP DEFAULT NOW(),
    generated_by    INTEGER REFERENCES users(id)
);
```

---

## 4. Data Flow

### 4.1 Data Ingestion Pipeline

```
JSON Files (data/)
      │
      ▼
data_loader.py (startup)
      │
      ├── Parse job_market_data.json → INSERT INTO job_market_data
      ├── Parse university_programs.json → INSERT INTO universities + programs
      ├── Parse student_enrollment.json → INSERT INTO student_enrollment
      ├── Parse graduate_employment.json → INSERT INTO graduate_employment
      └── Parse industry_forecasts.json → INSERT INTO industry_forecasts
```

### 4.2 Recommendation Generation Flow

```
POST /api/recommendations/generate
      │
      ▼
RecommendationService.generate_all()
      │
      ├── For each (university, program):
      │     │
      │     ├── TrendAnalyzer.get_demand_score(program, region)
      │     │     └── Queries job_market_data for matching specialization + region
      │     │         Applies linear regression on historical demand_score
      │     │         Returns: demand_score (0-100), trend (+/-), confidence
      │     │
      │     ├── SupplyAnalyzer.get_supply_score(program)
      │     │     └── Queries student_enrollment for enrollment trend
      │     │         Compares against regional job_openings
      │     │         Returns: supply_score (0-100), saturation_ratio
      │     │
      │     ├── SkillGapAnalyzer.get_gap_score(program)
      │     │     └── Queries job_market_data.top_skills
      │     │         Compares against program curriculum skills
      │     │         Returns: gap_score, missing_skills[]
      │     │
      │     ├── ForecasterService.get_forecast(specialization)
      │     │     └── Queries industry_forecasts for matching industry
      │     │         Returns: 3-year growth predictions
      │     │
      │     └── RecommendationEngine.decide(demand, supply, gap, forecast)
      │           └── Applies decision matrix (see README)
      │               Calculates final score and confidence
      │               Generates human-readable explanation
      │               Returns: Recommendation object
      │
      └── Bulk INSERT INTO recommendations
```

### 4.3 Dashboard Data Flow

```
GET /api/analytics/dashboard
      │
      ├── COUNT(programs) → total_programs
      ├── AVG(employment_rate) FROM graduate_employment WHERE year = 2024
      │     → avg_employment_rate
      ├── SELECT specialization, MAX(growth_rate) FROM job_market_data
      │     GROUP BY specialization → top_growing_field
      └── COUNT(recommendations) WHERE action IN ('reduce','close')
            → programs_needing_attention

Response → Frontend KPI Cards
```

---

## 5. Intelligence Engine Architecture

The Intelligence Engine lives in `backend/app/services/intelligence/` and consists of four cooperating modules:

### 5.1 TrendAnalyzer
- Reads historical `job_market_data` grouped by specialization and region
- Applies a simple linear regression (via numpy) to detect demand trends
- Outputs: `demand_score`, `trend_direction` (+/-/stable), `confidence`

### 5.2 SkillGapAnalyzer
- Reads `top_skills` from `job_market_data` for the matching specialization
- Compares against a configurable curriculum skill set per program
- Outputs: `gap_score` (0-100), `missing_skills[]`, `matched_skills[]`

### 5.3 ForecasterService
- Reads `industry_forecasts` for the program's industry category
- Uses a weighted average of 3-year growth predictions, discounted by confidence
- Outputs: `forecast_score`, `growth_1yr`, `growth_3yr`

### 5.4 RecommendationEngine (Decision Matrix)

```python
def decide(demand_score, supply_score, gap_score, forecast_score):
    if demand_score >= 70 and supply_score <= 40:
        action = "expand"
    elif demand_score >= 70 and supply_score <= 20:
        action = "open"   # for programs not yet offered
    elif demand_score <= 30 and supply_score >= 70:
        action = "close"
    elif demand_score <= 50 and supply_score >= 60:
        action = "reduce"
    elif demand_score >= 60 and supply_score >= 60:
        action = "maintain"
    else:
        action = "monitor"

    score = (demand_score * 0.4 + (100 - supply_score) * 0.3
             + gap_score * 0.2 + forecast_score * 0.1)
    confidence = min(95, base_confidence - data_age_penalty)
    return Recommendation(action, score, confidence, ...)
```

---

## 6. Security Model

### 6.1 Authentication (JWT)

1. Client sends `POST /api/auth/login` with email + password
2. Backend verifies password hash using **bcrypt** (via passlib)
3. Backend issues a signed JWT with:
   - `sub`: user email
   - `exp`: 30-minute expiry (configurable)
   - `role`: user role
4. Client stores token in memory (or httpOnly cookie for production)
5. All protected endpoints require `Authorization: Bearer <token>`
6. FastAPI dependency `get_current_user` verifies token on every request

### 6.2 Role-Based Access Control (RBAC)

| Endpoint Category | Analyst | Admin |
|------------------|---------|-------|
| GET analytics | ✅ | ✅ |
| GET recommendations | ✅ | ✅ |
| POST generate recommendations | ❌ | ✅ |
| GET/POST programs | ✅ | ✅ |
| DELETE programs | ❌ | ✅ |
| User management | ❌ | ✅ |
| Export reports | ✅ | ✅ |

### 6.3 Additional Security Measures

- **CORS**: Configured to allow only trusted origins (see `BACKEND_CORS_ORIGINS` env var)
- **Rate Limiting**: Recommended via nginx reverse proxy in production
- **SQL Injection**: Prevented by SQLAlchemy parameterized queries; raw SQL is never used
- **Input Validation**: All inputs validated via Pydantic v2 schemas before reaching business logic
- **Password Policy**: Minimum 8 characters; hashed with bcrypt (work factor 12)
- **Secret Key**: Loaded from environment variable, never hardcoded

---

## 7. Scalability Considerations

### 7.1 Horizontal Scaling

The backend is stateless — JWT tokens carry all session state. Multiple backend instances can run behind a load balancer (e.g., nginx) without shared session storage.

```
           Load Balancer (nginx)
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
  backend:8001  backend:8002  backend:8003
      │             │             │
      └─────────────┼─────────────┘
                    ▼
              PostgreSQL (primary)
                    │
              PostgreSQL (read replica)  ← for analytics queries
```

### 7.2 Caching Strategy

- **Redis** (future): Cache dashboard KPIs with 5-minute TTL; recommendation results with 1-hour TTL
- **Database**: Add indexes on `job_market_data(specialization, region)`, `programs(university_id)`, `recommendations(university_id, generated_at)`

### 7.3 Analytics Query Optimization

Heavy analytics queries (demand trends, employment rates) should use:
- PostgreSQL window functions for year-over-year comparisons
- Materialized views refreshed nightly for dashboard aggregations
- Connection pooling via PgBouncer in production

---

## 8. Deployment Guide

### 8.1 Development (Docker Compose)

```bash
docker compose up --build
```

Services start in order: db → backend → frontend

### 8.2 Production Checklist

1. **Secrets**: Replace all default passwords and `SECRET_KEY` with strong random values
2. **HTTPS**: Terminate TLS at nginx reverse proxy
3. **Database**: Use managed PostgreSQL (e.g., AWS RDS, Supabase) with automated backups
4. **Environment Variables**: Use Docker secrets or a secrets manager (Vault, AWS Secrets Manager)
5. **Monitoring**: Add health check endpoints; integrate with Prometheus/Grafana
6. **Logging**: Structured JSON logging; ship to ELK stack or Datadog
7. **CI/CD**: GitHub Actions pipeline handles lint → test → build → (optional deploy)

### 8.3 Environment Variables Reference

| Variable | Service | Description | Example |
|----------|---------|-------------|---------|
| `DATABASE_URL` | backend | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | backend | JWT signing secret (min 32 chars) | `openssl rand -hex 32` |
| `BACKEND_CORS_ORIGINS` | backend | JSON array of allowed origins | `["https://app.example.com"]` |
| `POSTGRES_DB` | db | Database name | `unidatalab` |
| `POSTGRES_USER` | db | Database user | `postgres` |
| `POSTGRES_PASSWORD` | db | Database password | (strong random) |
| `NEXT_PUBLIC_API_URL` | frontend | Backend API base URL | `https://api.example.com` |

---

## 9. Technology Decision Rationale

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| **FastAPI** | Django REST, Flask, Express | Native async, auto OpenAPI docs, Pydantic validation, type-safe |
| **PostgreSQL** | MySQL, MongoDB, SQLite | ACID, JSON support, window functions, mature ecosystem |
| **Next.js 14** | Create React App, Vite+React, Vue | SSR, App Router, great DX, Vercel deployment path |
| **Recharts** | Chart.js, D3, Victory | React-native components, responsive by default, composable |
| **SQLAlchemy 2.0** | Tortoise ORM, Prisma, raw SQL | Mature, async-compatible, flexible, excellent PostgreSQL support |
| **Docker Compose** | Kubernetes, bare metal | Right-sized for development and small-scale production |
| **JWT** | Session cookies, OAuth2 only | Stateless, scalable, works across domains, standard |
| **bcrypt** | SHA-256, MD5, Argon2 | Industry standard for passwords, adaptive work factor |

# UniDataLab 🎓

> **University Specialization Intelligence Platform** — Data-driven recommendations for academic program management

UniDataLab empowers universities to make evidence-based decisions about which specializations to open, expand, reduce, or close — eliminating the guesswork with real data analysis.

## 🎯 Problem Solved

Universities traditionally select or maintain academic programs based on:
- Outdated assumptions and tradition
- Limited market intelligence
- Subjective faculty preferences

This leads to education-job market mismatch, graduate unemployment, and resource waste. UniDataLab solves this with a unified analytics platform.

## ✨ Key Features

| Feature | Description |
|---------|------------|
| 📊 **Analytics Dashboard** | Real-time KPIs, trend charts, employment rates |
| 🎯 **Recommendation Engine** | AI-powered open/expand/reduce/close recommendations |
| 🔮 **Demand Forecasting** | ML predictions for 1-3 years ahead |
| 🗺️ **Regional Analysis** | Geographic breakdown of demand and supply |
| 📈 **Skill Gap Detection** | Market vs. curriculum skill comparison |
| 📄 **Report Export** | CSV and PDF report generation |
| 🔐 **Role-Based Access** | Admin and Analyst roles with JWT auth |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                 │
│  Dashboard │ Recommendations │ Programs │ Reports     │
└─────────────────────┬───────────────────────────────┘
                      │ REST API
┌─────────────────────▼───────────────────────────────┐
│                   Backend (FastAPI)                   │
│  Auth │ Universities │ Programs │ Analytics           │
│  ┌─────────────────────────────────────────────┐    │
│  │          Intelligence Engine                 │    │
│  │  Trend Analyzer │ Skill Gap │ Forecaster     │    │
│  │  Recommendation Engine                       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │ SQLAlchemy ORM
┌─────────────────────▼───────────────────────────────┐
│                  PostgreSQL Database                  │
│  Users │ Universities │ Programs │ Job Market Data    │
│  Student Data │ Industry Forecasts │ Recommendations  │
└─────────────────────────────────────────────────────┘
```

## 🚀 Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts  
**Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, Pydantic v2  
**Database:** PostgreSQL 15  
**ML/Analytics:** scikit-learn, pandas, numpy  
**DevOps:** Docker, Docker Compose, GitHub Actions

## 🏃 Getting Started

### Prerequisites
- Docker Desktop installed
- Git

### Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/RaminIsmailsoy/UniDataLab.git
cd UniDataLab

# Start all services
docker compose up --build

# Access the platform
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Default Credentials

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@unidatalab.com | admin123 |
| Analyst | analyst@unidatalab.com | analyst123 |

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL in .env
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## 📊 Dashboard Preview

The platform provides:
1. **KPI Cards** — Total programs, average employment rate, top growing field, attention-needed programs
2. **Demand Trend Chart** — Line chart tracking specialization demand over time
3. **Employment Rate Chart** — Bar chart comparing fields
4. **Supply vs. Demand** — Grouped bar chart showing market gaps
5. **Skill Gap Analysis** — Visual breakdown of missing skills
6. **Regional Heatmap** — Geographic demand distribution

## 🤖 Recommendation Engine

The engine evaluates each program on four dimensions:

| Demand | Supply | Recommendation |
|--------|--------|---------------|
| HIGH | LOW | **Expand** or **Open** |
| LOW | HIGH | **Reduce** or **Close** |
| HIGH | HIGH | **Maintain** |
| LOW | LOW | **Monitor** |

Each recommendation includes:
- **Action** — What to do (expand/reduce/open/close/maintain/monitor)
- **Score** — Strength of recommendation (0-100)
- **Confidence** — Data quality confidence (0-100)
- **Explanation** — Human-readable reasoning
- **Factors** — Detailed data breakdown

## 🔌 API Reference

Full API documentation available at `http://localhost:8000/docs` (Swagger UI)

Key endpoints:
- `POST /api/auth/login` — Get JWT token
- `GET /api/analytics/dashboard` — Dashboard KPIs
- `GET /api/recommendations` — All recommendations
- `POST /api/recommendations/generate` — Generate new recommendations
- `GET /api/reports/export/csv` — Export CSV report
- `GET /api/reports/export/pdf` — Export PDF report

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

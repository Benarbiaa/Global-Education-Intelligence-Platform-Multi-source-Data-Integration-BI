# BI Project — Modern ETL & Data Warehouse Pipeline

BI Project is a production-grade Business Intelligence platform designed to consolidate, transform, and visualize data from multiple sources. It combines a modular Python ETL pipeline, a PostgreSQL data warehouse built on a star schema, a Django REST API, a React frontend, and Streamlit dashboards — all orchestrated with GitHub Actions and containerized with Docker.

### **Tools**
<p>
  <img alt="Python" src="https://img.shields.io/badge/python-306998.svg?style=for-the-badge&logo=python&logoColor=white"/>
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img alt="Django" src="https://img.shields.io/badge/Django-092E20.svg?style=for-the-badge&logo=django&logoColor=white"/>
  <img alt="React" src="https://img.shields.io/badge/React-20232A.svg?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img alt="Streamlit" src="https://img.shields.io/badge/Streamlit-white?style=for-the-badge&logo=streamlit"/>
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white"/>
  <img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub_Actions-2088FF.svg?style=for-the-badge&logo=githubactions&logoColor=white"/>
</p>

---
A complete Business Intelligence & Data Engineering workflow combining:

- A modular Python ETL pipeline
- PostgreSQL data warehouse
- Django backend (API + warehouse models)
- Streamlit dashboards
- Automated CI/CD execution via GitHub Actions
- Docker-based local deployment

This repository follows industry-standard Data Engineering practices, including layered ETL, dependency-aware pipeline orchestration, and fully automated runs.

## ETL Architecture 

The ETL has been fully rebuilt from scratch, reorganized into clear domains:

- FOUNDATION
- RESEARCH MART
- EDUCATION MART

Each stage loads only after its dependencies are ready, ensuring deterministic, reproducible data processing.

Located under: `etl/pipelines/`

## ETL Structure Overview

```
etl/
├── sources/                # Extractors (APIs, CSVs, external data)
│   ├── api.py
│   └── local_csv_loader.py
│
├── transformers/           # Cleaning, validation, pivoting, reshaping
│
├── loaders/                # Loads dim/fact tables into PostgreSQL DW
│
├── pipelines/              # Orchestrated pipelines (modular + runnable)
│   ├── foundation/
│   │   ├── dim_countries_pipeline.py
│   │   └── dim_speciality_pipeline.py
│   │
│   ├── research_mart/
│   │   ├── dim_institution_pipeline.py
│   │   ├── fact_research_pipeline.py
│   │   └── fact_investment_pipeline.py
│   │
│   ├── education_mart/
│   │   ├── fact_student_staff_pipeline.py
│   │   ├── fact_graduates_pipeline.py
│   │   └── fact_university_ranking_pipeline.py
│   │
│   ├── run_foundation.py
│   ├── run_research_mart.py
│   ├── run_education_mart.py
│   └── full_refresh.py     # Used in CI/CD (GitHub Actions)
│
└── data/ (git ignored)
    ├── raw/                # Raw files for ETL
    └── warehouse/          # Results snapshots
```

## Running the ETL

You can run the ETL as a whole, by domain, or by individual pipeline.

**Must be run using module mode (`python -m ...`) from the repository root.**

### Option 1 — Full Warehouse Refresh (Recommended)

Runs everything in the correct dependency order.

```bash
python -m etl.pipelines.full_refresh
```

Used by GitHub Actions.

### Option 2 — Run by Phase

1. **Foundation (must run first)**

Creates all base dimension tables.

```bash
python -m etl.pipelines.run_foundation
```

2. **Research Mart**

```bash
python -m etl.pipelines.run_research_mart
```

3. **Education Mart**

```bash
python -m etl.pipelines.run_education_mart
```

### Option 3 — Run Individual Pipelines

**Foundation**
```bash
python -m etl.pipelines.foundation.dim_countries_pipeline
python -m etl.pipelines.foundation.dim_speciality_pipeline
```

**Research Mart**
```bash
python -m etl.pipelines.research_mart.dim_institution_pipeline
python -m etl.pipelines.research_mart.fact_research_pipeline
python -m etl.pipelines.research_mart.fact_investment_pipeline
```

**Education Mart**
```bash
python -m etl.pipelines.education_mart.fact_student_staff_pipeline
python -m etl.pipelines.education_mart.fact_graduates_pipeline
python -m etl.pipelines.education_mart.fact_university_ranking_pipeline
```

## Dependency Graph

The ETL is dependency-driven. Foundation tables must load before facts.

```
FOUNDATION (run first)
├── dim_countries ──────┐
│                       │
└── dim_speciality ─────┼─────┐
                        │     │
                        │     │
RESEARCH MART           │     │
├── dim_institution ────┤     │
│   └── depends on: ────┘     │
│                             │
├── fact_institution_research │
│   └── depends on: dim_institution
│                             │
└── fact_research_investment  │
    └── depends on: ──────────┤
                              │
EDUCATION MART                │
├── fact_student_staff_ratio  │
│   └── depends on: ──────────┤
│                             │
├── fact_tertiary_graduates   │
│   └── depends on: ──────────┴──── dim_countries + dim_speciality
│
└── fact_university_ranking
    └── depends on: ──────────────── dim_countries
```

## CI/CD

GitHub Actions automatically runs:

- Foundation
- Research Mart
- Education Mart
- Full refresh in scheduled jobs

Located in: `.github/workflows/run_etl.yml`

## Deployment

- Docker images for ETL, backend, and dashboard
- `docker-compose.yml` for local development
- PostgreSQL warehouse included in the stack


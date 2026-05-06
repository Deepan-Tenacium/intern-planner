\# Intern Resource Planner



\## What this is

A web app for Tenacium managers to view their intern cohort's

skills, availability, and current allocations, and manage who

is working on which project.



\## Stack

\- Backend: FastAPI (Python 3.12), SQLAlchemy 2.0, Alembic

\- Frontend: Next.js 14 (app router), TypeScript, Tailwind

\- Database: PostgreSQL 16

\- Everything runs in Docker Compose



\## Folder structure

\- /apps/api    FastAPI backend

\- /apps/web    Next.js frontend

\- /infra       Dockerfiles, docker-compose.yml



\## Phase 1 (this week): Working CRUD app, NO AI yet

\## Phase 2 (next week): Add Claude AI assistant



\## Hard rules

\- Use SQLAlchemy 2.0 syntax (select(), not query())

\- Use Pydantic v2 syntax

\- API responses use Pydantic models, never raw dicts

\- snake\_case in Python and DB, camelCase in TypeScript



\## How to run

\- docker compose up

\- API at localhost:8000

\- Frontend at localhost:3000


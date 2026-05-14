# Intern Resource Planner

## What this is
A web app for Tenacium managers to view their intern
cohort's skills, availability, and current allocations,
and manage who is working on which project.
Built during internship at Tenacium DC by Deepan.

## Current Status
Phase 1 complete — full CRUD web app, tested and deployed.
Task 2 in progress — learning Skills, MCP, and Playwright.

## Stack
- Backend: FastAPI (Python 3.12), SQLAlchemy 2.0, Alembic
- Frontend: Next.js 14 (app router), TypeScript, Tailwind
- Database: PostgreSQL 16
- Testing: Playwright (10 smoke tests)
- Containerisation: Docker Compose
- Dev tool: Claude Code with Playwright MCP

## Folder Structure
- /apps/api           FastAPI backend
- /apps/web           Next.js frontend
- /apps/web/tests     Playwright test files
- /infra              Dockerfiles, docker-compose.yml
- /.claude            Claude Code config
- /.claude/skills     Custom skill files
- /test-screenshots   Screenshots from Playwright MCP sessions

## Skills
Skills live in .claude/skills/
Always load the relevant skill before starting a task.

Current skills:
- playwright-testing — use when testing any feature
  with the Playwright browser

## MCP Servers
- playwright: connected at user scope
  Browser: chromium, headless
  Output: test-screenshots/

## Hard Rules — Never Break These
- Use SQLAlchemy 2.0 syntax (select(), not query())
- Use Pydantic v2 syntax
- API responses use Pydantic models, never raw dicts
- snake_case in Python and DB, camelCase in TypeScript

## How To Run
- docker compose up -d
- API at localhost:8000
- API docs at localhost:8000/docs  
- Frontend at localhost:3000

## How To Run Tests
- cd apps/web
- npx playwright test
- npx playwright test --headed
- npx playwright test --grep "test name"

## Key Pages
- /            Dashboard
- /interns      Intern grid
- /interns/[id] Intern profile
- /projects     Project cards
- /allocations  Allocation table
- /workload     Workload bars
- /skills-gap   Skills gap analysis
- /timeline     Gantt timeline

## API Endpoints
- GET/POST/PATCH/DELETE /interns/
- GET/POST/PATCH/DELETE /projects/
- GET/POST/PATCH/DELETE /allocations/
- GET /skills/
- POST /interns/{id}/skills
- PATCH/DELETE /interns/{id}/skills/{skill_id}
- GET /health

## Database Tables
- interns (id, name, email, cohort_start, cohort_end,
  weekly_capacity_hours, status)
- skills (id, name, category)
- intern_skills (intern_id, skill_id, proficiency 1-5)
- projects (id, name, description, owner, status,
  start_date, end_date)
- project_skills (project_id, skill_id,
  required_proficiency)
- allocations (id, intern_id, project_id,
  hours_per_week, start_date, end_date)
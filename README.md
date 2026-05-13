# Intern Resource Planner

A web app for managers to track intern skills, availability, and project allocations.

---

## What is this?

Intern Resource Planner is an internal tool built for Tenacium DC to help managers oversee their intern cohorts. It gives a real-time view of who is working on what, how many hours each intern has allocated, and which projects are running. Managers can create and manage interns, projects, and allocations — all from one place.

---

## Tech Stack

| Tool | Role |
|---|---|
| **FastAPI** | Python REST API — handles all CRUD endpoints |
| **SQLAlchemy 2.0** | ORM for database access (uses `select()` syntax) |
| **Alembic** | Database migrations |
| **Pydantic v2** | Request/response validation and serialization |
| **PostgreSQL 16** | Primary relational database |
| **Next.js 14** | React frontend with App Router |
| **TypeScript** | Type-safe frontend code |
| **Tailwind CSS** | Utility-first styling |
| **Docker Compose** | Runs API, frontend, and database together |
| **Playwright** | End-to-end browser testing framework |
| **Claude Code** | AI pair programmer used to build the project |
| **GitHub** | Version control at [github.com/Deepan-Tenacium/intern-planner](https://github.com/Deepan-Tenacium/intern-planner) |

---

## Features

### Dashboard (`/`)
- Summary stat tiles: total interns, projects, allocations, overloaded count, average hours/week
- Active projects panel with timeline progress bars
- Workload snapshot showing each intern's allocated vs. capacity hours
- Recent allocations feed
- Cohort overview with colour-coded donut charts (green / amber / red load status)

### Interns (`/interns`)
- Grid of intern cards showing name, email, cohort dates, weekly capacity, and skills with proficiency levels
- Colour-coded load indicator dot (green = available, amber = at capacity, red = overloaded)
- Summary stats bar at the top
- "New Intern" button opens a slide-in panel from the right
- Form fields: name, email, cohort dates, weekly capacity
- Skills section: checkbox per skill with proficiency dot selector (1–5)
- Validates required fields before submitting
- New intern appears in the grid instantly without page reload

### Intern Detail (`/interns/[id]`)
- Full profile for a single intern
- Skills breakdown with categories and proficiency ratings
- List of current project allocations

### Projects (`/projects`)
- List of all projects with status, owner, date range, and required skills
- Create, edit, and delete projects
- Filter bar at top: All / Active / Planning / Completed with live counts per status
- Expandable cards: click "View Details" to see full description, allocated interns, and total hours
- Pulsing green dot indicator on active projects
- Timeline progress bar showing how far through the project we are today
- "Allocate Intern" button opens a modal: intern selector with current load shown, overload warning if intern already over 30 h/week, hours per week and date range inputs
- "New Project" button opens a slide-in panel with full form and inline validation

### Allocations (`/allocations`)
- Table of all intern–project assignments
- Create, edit, and delete allocations with hours-per-week and date range

### Workload (`/workload`)
- Full workload table sorted by load status (overloaded first)
- Gradient progress bars per intern
- Summary banner: overloaded / at capacity / has space counts

---

## UI & Design

- Professional dark theme throughout (`#0f1117`)
- Fixed left sidebar (240 px) with inline SVG icons
- Active nav link highlighted in indigo
- Slide-in panels from the right for creating interns and projects
- Modal overlays for allocating interns
- Toast notifications — green for success, red for errors, auto-dismiss after 3 seconds
- Staggered card fade-in animations on page load
- Hover glow effects on all interactive cards
- No page reloads for most create/update actions

---

## How to Run Locally

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- Git

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd intern-planner

# 2. Start all services
docker compose up --build

# 3. Run database migrations
docker compose exec api alembic upgrade head

# 4. Seed demo data
docker compose exec api python seed.py

# 5. Open the app
# Frontend → http://localhost:3000
# API docs  → http://localhost:8000/docs
```

---

## Testing

This project uses [Playwright](https://playwright.dev/) for automated end-to-end testing.

### Setup

Playwright is already configured. The test suite runs against the live app at localhost:3000.

Make sure the app is running before running tests:

```bash
docker compose up -d
```

### Run Tests

```bash
cd apps/web
npx playwright test
```

### Run With Visible Browser

```bash
npx playwright test --headed
```

### Run A Single Test

```bash
npx playwright test --grep "dashboard"
```

### View Test Report

```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Current Test Coverage

| Test name | What it checks |
|---|---|
| dashboard loads | Page title matches `/intern/i` on the root route |
| sidebar is visible | `<nav>` element is present and visible on the dashboard |
| all 5 nav links are present | Dashboard, Interns, Projects, Allocations, and Workload links all render |
| dashboard stat tiles are visible | All five stat tiles (Total Interns, Total Projects, etc.) appear on the dashboard |
| all 5 pages load without errors or 404 | Every route returns a non-404 response and renders an `<h1>` |
| new intern panel opens and closes | "New Intern" button shows the slide-in panel; Cancel hides it |
| new project panel opens and closes | "New Project" button shows the slide-in panel; Cancel dismisses it |
| clicking an intern card navigates to profile | Clicking the first intern card routes to `/interns/[id]` |
| no horizontal scroll on any page | `scrollWidth` never exceeds `clientWidth` on any of the five routes |
| global search opens with Ctrl+K | Pressing Ctrl+K reveals a search input or dialog |

### Test Screenshots

Failed test screenshots are saved to:

```
apps/web/test-results/
```

Screenshots taken during MCP browser sessions are saved to:

```
test-screenshots/
```

### MCP Browser Testing

Claude Code is configured with Playwright MCP which allows the AI to control a real browser during development. This is used for:

- Exploring bugs interactively
- Verifying features visually
- Writing new tests faster

Trigger with prompts like:
> "Navigate to localhost:3000/interns and tell me what you see"

---

## Project Structure

```
intern-planner/
├── apps/
│   ├── api/                    # FastAPI backend
│   │   ├── app/
│   │   │   ├── models.py       # SQLAlchemy ORM models
│   │   │   ├── schemas.py      # Pydantic request/response schemas
│   │   │   ├── database.py     # DB session and engine setup
│   │   │   └── routers/        # Route handlers (interns, projects, allocations)
│   │   ├── alembic/            # Database migration scripts
│   │   ├── seed.py             # Demo data loader
│   │   └── requirements.txt
│   │
│   └── web/                    # Next.js frontend
│       └── app/
│           ├── page.tsx         # Dashboard
│           ├── interns/         # Interns list + detail pages
│           ├── projects/        # Projects page
│           ├── allocations/     # Allocations page
│           ├── workload/        # Workload page
│           └── components/      # Shared UI (Sidebar, NavLink)
│
├── infra/
│   ├── api.Dockerfile
│   └── web.Dockerfile
│
├── docker-compose.yml
└── CLAUDE.md
```

---

## Built by

**Deepan Prashanth Prem Kumar** — internship project at **Tenacium DC**

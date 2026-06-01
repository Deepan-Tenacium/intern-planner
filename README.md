# Intern Resource Planner

A web app for managers to track intern skills, availability, and project allocations — with role-based access control so interns can view but not edit.

---

## What is this?

Intern Resource Planner is an internal tool built for Tenacium DC to help managers oversee their intern cohorts. It gives a real-time view of who is working on what, how many hours each intern has allocated, and which projects are running. Managers have full CRUD access; interns get a read-only view of all the same data.

---

## Tech Stack

| Tool | Role |
|---|---|
| **FastAPI** | Async Python REST API — all route handlers use `async/await` |
| **SQLAlchemy 2.0** | ORM for database access (uses `select()` syntax) |
| **Alembic** | Database migrations |
| **Pydantic v2** | Request/response validation and serialization |
| **PostgreSQL 16** | Primary relational database |
| **Next.js 14** | React frontend with App Router |
| **TypeScript** | Type-safe frontend code |
| **Tailwind CSS** | Utility-first styling |
| **NextAuth.js** | Session management — credentials login + GitHub OAuth |
| **JWT (python-jose)** | Backend token issuance and verification |
| **Docker Compose** | Runs API, frontend, and database together |
| **Playwright** | End-to-end browser testing framework |
| **Claude Code** | AI pair programmer used to build the project |
| **GitHub** | Version control at [github.com/Deepan-Tenacium/intern-planner](https://github.com/Deepan-Tenacium/intern-planner) |

---

## Authentication & Roles

The app uses JWT-based authentication with two roles:

| Role | Access |
|---|---|
| **manager** | Full read + write access — can create, edit, and delete interns, projects, allocations, and skills |
| **intern** | Read-only — all pages and data are visible but all create/edit/delete controls are hidden |

### Login methods

- **Credentials** — email + password via `/auth/login`
- **GitHub OAuth** — via `/auth/github` (new GitHub users are created with the `intern` role by default)

### How it works

1. On login the API issues a signed JWT containing `email`, `role`, and `user_id`.
2. NextAuth stores the token in the session and forwards it as a `Bearer` header on every proxied API request.
3. The backend enforces `require_manager` on all write endpoints (POST, PATCH, DELETE) — so even if the UI were bypassed, the API would return 403.
4. The frontend reads `session.user.role` via a `useIsManager()` hook and conditionally renders all write controls.

---

## Features

### Dashboard (`/`)
- Summary stat tiles: total interns, projects, allocations, overloaded count, average hours/week
- Active projects panel with timeline progress bars
- Workload snapshot showing each intern's allocated vs. capacity hours
- Recent allocations feed
- Cohort overview with colour-coded load status (green / amber / red)

### Interns (`/interns`)
- Grid of intern cards showing name, email, cohort dates, weekly capacity, and skills with proficiency levels
- Colour-coded load indicator dot (green = available, amber = at capacity, red = overloaded)
- Filter bar: All / Active / On Leave / Finished
- **Managers only:** "New Intern" slide-in panel with inline validation and skill assignment

### Intern Detail (`/interns/[id]`)
- Full profile: avatar, status badge, stat cards (cohort dates, capacity, current load)
- Skills section with proficiency dots by category
- Workload ring chart showing % allocated
- Current allocation cards with per-project breakdown
- 8-week availability calendar
- **Managers only:** "Edit" button to update intern details, "Edit Skills" panel to add/remove/adjust proficiency

### Projects (`/projects`)
- Filter bar: All / Active / Planning / Completed with live counts
- Expandable cards: status badge, timeline progress bar, allocated interns list
- Pulsing green dot on active projects
- **Managers only:** edit pencil per card, "New Project" slide-in panel, "Allocate Intern" modal (with overload warning if intern exceeds 30 h/week)

### Allocations (`/allocations`)
- Table of all intern–project assignments with hours/week and date range
- Expandable rows showing all projects for that intern and their total load
- Search by intern or project name, filter by project, filter by load band
- **Managers only:** "Add Allocation" modal, inline edit and delete per row

### Workload (`/workload`)
- Full workload table sorted by load status (overloaded first)
- Gradient progress bars per intern
- Summary banner: overloaded / at capacity / has space counts

### Global Search
- Triggered with `Ctrl+K` from any page
- Searches across interns and projects by name

---

## Architecture Notes

### Async Python backend
All FastAPI route handlers are `async def`, using `await` with SQLAlchemy's async session. This keeps the event loop unblocked under concurrent requests without needing multiple threads.

### Next.js Server / Client component split
Pages follow the Next.js App Router pattern:
- `page.tsx` — server component, runs on the server, fetches data directly
- `*Client.tsx` — client component (`"use client"`), receives data as props, owns all interactive state (panels, modals, forms, toasts)
- `loading.tsx` — skeleton UI shown by Next.js while the server component fetches data

This means the initial HTML is server-rendered with real data; client-side JS only hydrates the interactive layer.

---

## UI & Design

- Professional dark theme throughout (`#0f1117`)
- Fixed left sidebar (240 px) with inline SVG icons
- Active nav link highlighted in indigo
- Slide-in panels from the right for create/edit forms
- Modal overlays for allocations
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

# 4. Seed demo data (creates 2 users, 8 interns, 8 skills, 5 projects, 10 allocations)
docker compose exec api python seed.py

# 5. Open the app
# Frontend → http://localhost:3000
# API docs  → http://localhost:8000/docs
```

Log in with one of the demo accounts above, or register a new account at `/login`.

---

## API Endpoints

| Method | Path | Auth required |
|---|---|---|
| GET | `/interns/` | Any logged-in user |
| POST | `/interns/` | Manager only |
| PATCH | `/interns/{id}` | Manager only |
| DELETE | `/interns/{id}` | Manager only |
| POST | `/interns/{id}/skills` | Manager only |
| PATCH | `/interns/{id}/skills/{skill_id}` | Manager only |
| DELETE | `/interns/{id}/skills/{skill_id}` | Manager only |
| GET | `/projects/` | Any logged-in user |
| POST | `/projects/` | Manager only |
| PATCH | `/projects/{id}` | Manager only |
| DELETE | `/projects/{id}` | Manager only |
| GET | `/allocations/` | Any logged-in user |
| POST | `/allocations/` | Manager only |
| PATCH | `/allocations/{id}` | Manager only |
| DELETE | `/allocations/{id}` | Manager only |
| GET | `/skills/` | Any logged-in user |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/github` | Public |
| GET | `/auth/me` | Any logged-in user |
| GET | `/health` | Public |

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
│   │   │   ├── models.py       # SQLAlchemy ORM models (User, Intern, Project, Allocation, Skill)
│   │   │   ├── schemas.py      # Pydantic request/response schemas
│   │   │   ├── database.py     # DB session and engine setup
│   │   │   ├── auth.py         # JWT helpers, get_current_user, require_manager
│   │   │   └── routers/        # Route handlers (auth, interns, projects, allocations, skills)
│   │   ├── alembic/            # Database migration scripts
│   │   ├── seed.py             # Demo data loader (2 users, 8 interns, 5 projects, 10 allocations)
│   │   └── requirements.txt
│   │
│   └── web/                    # Next.js frontend
│       └── app/
│           ├── page.tsx              # Dashboard (server component — fetches data)
│           ├── DashboardClient.tsx   # Dashboard (client component — interactivity)
│           ├── loading.tsx           # Dashboard skeleton
│           ├── interns/
│           │   ├── page.tsx          # Interns list (server component)
│           │   ├── InternsClient.tsx # Interns list (client component)
│           │   ├── loading.tsx
│           │   └── [id]/
│           │       ├── page.tsx               # Intern profile (server component)
│           │       ├── InternProfileClient.tsx # Intern profile (client component)
│           │       └── loading.tsx
│           ├── projects/
│           │   ├── page.tsx          # Projects (server component)
│           │   ├── ProjectsClient.tsx
│           │   └── loading.tsx
│           ├── allocations/
│           │   ├── page.tsx          # Allocations (server component)
│           │   ├── AllocationsPageClient.tsx
│           │   └── loading.tsx
│           ├── workload/
│           │   ├── page.tsx
│           │   └── loading.tsx
│           ├── login/                # Login page (credentials + GitHub OAuth)
│           ├── lib/
│           │   ├── api.ts            # Typed fetch helpers
│           │   ├── forms.ts          # Form validation helpers
│           │   ├── utils.ts          # Shared utility functions
│           │   └── workload.ts       # Workload calculation helpers
│           ├── hooks/
│           │   └── useRole.ts        # useIsManager() hook for role-based UI
│           ├── components/           # Shared UI (AppShell, Sidebar, NavLink, Toast, Icons)
│           └── api/
│               ├── auth/             # NextAuth route (credentials + GitHub provider)
│               └── proxy/            # Proxy route — forwards requests to API with Bearer token
│
├── .claude/
│   └── skills/                 # Claude Code custom skill files
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

from datetime import date
from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# --- Skills ---
skills_data = [
    ("Python", "backend"),
    ("TypeScript", "frontend"),
    ("React", "frontend"),
    ("SQL", "data"),
    ("FastAPI", "backend"),
    ("Data Analysis", "data"),
    ("Figma", "design"),
    ("Go", "backend"),
]
skills = {}
for name, category in skills_data:
    s = models.Skill(name=name, category=category)
    db.add(s)
    db.flush()
    skills[name] = s

# --- Projects ---
projects_data = [
    {
        "name": "Internal Dashboard",
        "description": "Admin dashboard for internal ops tracking.",
        "status": "active",
        "owner": "Alice Morgan",
        "start_date": date(2026, 1, 15),
        "end_date": date(2026, 6, 30),
        "required_skills": [("React", 3), ("TypeScript", 3), ("Figma", 2)],
    },
    {
        "name": "Data Pipeline Revamp",
        "description": "Rebuild ETL pipeline for reporting.",
        "status": "active",
        "owner": "Bob Chen",
        "start_date": date(2026, 2, 1),
        "end_date": date(2026, 7, 31),
        "required_skills": [("Python", 4), ("SQL", 3), ("Data Analysis", 3)],
    },
    {
        "name": "API Gateway",
        "description": "Unified API gateway service.",
        "status": "active",
        "owner": "Alice Morgan",
        "start_date": date(2026, 3, 1),
        "end_date": date(2026, 8, 31),
        "required_skills": [("Go", 3), ("Python", 3), ("FastAPI", 3)],
    },
    {
        "name": "Mobile Companion App",
        "description": "React Native app for field staff.",
        "status": "planning",
        "owner": "Carla Diaz",
        "start_date": date(2026, 5, 1),
        "end_date": date(2026, 10, 31),
        "required_skills": [("React", 4), ("TypeScript", 4), ("Figma", 3)],
    },
    {
        "name": "ML Reporting Tool",
        "description": "Automated reporting with ML-driven insights.",
        "status": "active",
        "owner": "Bob Chen",
        "start_date": date(2026, 1, 1),
        "end_date": date(2026, 9, 30),
        "required_skills": [("Python", 4), ("Data Analysis", 4), ("SQL", 3)],
    },
]

projects = []
for pd in projects_data:
    p = models.Project(
        name=pd["name"],
        description=pd["description"],
        status=pd["status"],
        owner=pd["owner"],
        start_date=pd["start_date"],
        end_date=pd["end_date"],
    )
    db.add(p)
    db.flush()
    for skill_name, req_prof in pd["required_skills"]:
        db.add(models.ProjectSkill(
            project_id=p.id,
            skill_id=skills[skill_name].id,
            required_proficiency=req_prof,
        ))
    projects.append(p)

# --- Interns ---
interns_data = [
    {
        "name": "Jordan Lee",
        "email": "jordan.lee@intern.tenacium.io",
        "cohort_start": date(2026, 1, 6),
        "cohort_end": date(2026, 6, 30),
        "weekly_capacity_hours": 40,
        "skills": [("Python", 4), ("SQL", 3), ("FastAPI", 3)],
    },
    {
        "name": "Priya Nair",
        "email": "priya.nair@intern.tenacium.io",
        "cohort_start": date(2026, 1, 6),
        "cohort_end": date(2026, 6, 30),
        "weekly_capacity_hours": 40,
        "skills": [("React", 4), ("TypeScript", 4), ("Figma", 3)],
    },
    {
        "name": "Marcus Webb",
        "email": "marcus.webb@intern.tenacium.io",
        "cohort_start": date(2026, 1, 6),
        "cohort_end": date(2026, 6, 30),
        "weekly_capacity_hours": 32,
        "skills": [("Python", 3), ("Data Analysis", 4), ("SQL", 4)],
    },
    {
        "name": "Sofia Reyes",
        "email": "sofia.reyes@intern.tenacium.io",
        "cohort_start": date(2026, 1, 6),
        "cohort_end": date(2026, 6, 30),
        "weekly_capacity_hours": 40,
        "skills": [("Go", 3), ("Python", 2), ("FastAPI", 2)],
    },
    {
        "name": "Aiden Park",
        "email": "aiden.park@intern.tenacium.io",
        "cohort_start": date(2026, 5, 5),
        "cohort_end": date(2026, 10, 31),
        "weekly_capacity_hours": 40,
        "skills": [("React", 3), ("TypeScript", 3), ("Figma", 4)],
    },
    {
        "name": "Lena Fischer",
        "email": "lena.fischer@intern.tenacium.io",
        "cohort_start": date(2026, 5, 5),
        "cohort_end": date(2026, 10, 31),
        "weekly_capacity_hours": 40,
        "skills": [("Python", 5), ("Data Analysis", 5), ("SQL", 4)],
    },
    {
        "name": "Omar Hassan",
        "email": "omar.hassan@intern.tenacium.io",
        "cohort_start": date(2026, 5, 5),
        "cohort_end": date(2026, 10, 31),
        "weekly_capacity_hours": 32,
        "skills": [("Go", 4), ("Python", 3), ("FastAPI", 4)],
    },
    {
        "name": "Chloe Tran",
        "email": "chloe.tran@intern.tenacium.io",
        "cohort_start": date(2026, 5, 5),
        "cohort_end": date(2026, 10, 31),
        "weekly_capacity_hours": 40,
        "skills": [("TypeScript", 4), ("React", 3), ("SQL", 2)],
    },
]

interns = []
for id_ in interns_data:
    intern = models.Intern(
        name=id_["name"],
        email=id_["email"],
        cohort_start=id_["cohort_start"],
        cohort_end=id_["cohort_end"],
        weekly_capacity_hours=id_["weekly_capacity_hours"],
    )
    db.add(intern)
    db.flush()
    for skill_name, prof in id_["skills"]:
        db.add(models.InternSkill(
            intern_id=intern.id,
            skill_id=skills[skill_name].id,
            proficiency=prof,
        ))
    interns.append(intern)

# --- Allocations ---
# interns[0] Jordan  → Data Pipeline Revamp (20h) + ML Reporting Tool (20h)  [overloaded test]
# interns[1] Priya   → Internal Dashboard (40h)
# interns[2] Marcus  → ML Reporting Tool (32h)
# interns[3] Sofia   → API Gateway (32h)
# interns[4] Aiden   → Mobile Companion App (40h)
# interns[5] Lena    → Data Pipeline Revamp (40h)
# interns[6] Omar    → API Gateway (32h)
# interns[7] Chloe   → Internal Dashboard (20h) + Mobile Companion App (20h)  [overloaded test]

allocations_data = [
    (0, 1, 20, date(2026, 2, 1), date(2026, 7, 31)),
    (0, 4, 20, date(2026, 2, 1), date(2026, 7, 31)),
    (1, 0, 40, date(2026, 1, 15), date(2026, 6, 30)),
    (2, 4, 32, date(2026, 2, 1), date(2026, 7, 31)),
    (3, 2, 32, date(2026, 3, 1), date(2026, 8, 31)),
    (4, 3, 40, date(2026, 5, 1), date(2026, 10, 31)),
    (5, 1, 40, date(2026, 5, 5), date(2026, 7, 31)),
    (6, 2, 32, date(2026, 5, 5), date(2026, 8, 31)),
    (7, 0, 20, date(2026, 5, 5), date(2026, 6, 30)),
    (7, 3, 20, date(2026, 5, 5), date(2026, 10, 31)),
]

for intern_idx, project_idx, hours, start, end in allocations_data:
    db.add(models.Allocation(
        intern_id=interns[intern_idx].id,
        project_id=projects[project_idx].id,
        hours_per_week=hours,
        start_date=start,
        end_date=end,
    ))

db.commit()
db.close()
print("Seeded: 8 interns, 8 skills, 5 projects, 10 allocations.")

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import interns, projects, allocations, skills
from app.routers.auth import router as auth_router

app = FastAPI(title="Intern Resource Planner")

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(interns.router, prefix="/interns", tags=["interns"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(allocations.router, prefix="/allocations", tags=["allocations"])
app.include_router(skills.router, prefix="/skills", tags=["skills"])


@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import interns, projects, allocations

app = FastAPI(title="Intern Resource Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interns.router, prefix="/interns", tags=["interns"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(allocations.router, prefix="/allocations", tags=["allocations"])


@app.get("/health")
def health():
    return {"status": "ok"}

from datetime import date
from pydantic import BaseModel, EmailStr


# --- Skill ---

class SkillOut(BaseModel):
    id: int
    name: str
    category: str

    model_config = {"from_attributes": True}


# --- InternSkill ---

class InternSkillCreate(BaseModel):
    skill_id: int
    proficiency: int


class InternSkillOut(BaseModel):
    skill: SkillOut
    proficiency: int

    model_config = {"from_attributes": True}


# --- Intern ---

class InternCreate(BaseModel):
    name: str
    email: EmailStr
    cohort_start: date
    cohort_end: date
    weekly_capacity_hours: int = 40


class InternUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    cohort_start: date | None = None
    cohort_end: date | None = None
    weekly_capacity_hours: int | None = None


class InternOut(BaseModel):
    id: int
    name: str
    email: str
    cohort_start: date
    cohort_end: date
    weekly_capacity_hours: int
    skills: list[InternSkillOut] = []

    model_config = {"from_attributes": True}


# --- ProjectSkill ---

class ProjectSkillOut(BaseModel):
    skill: SkillOut
    required_proficiency: int

    model_config = {"from_attributes": True}


# --- Project ---

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: str = "active"
    owner: str
    start_date: date
    end_date: date


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: str | None = None
    owner: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: str | None
    status: str
    owner: str
    start_date: date
    end_date: date
    required_skills: list[ProjectSkillOut] = []

    model_config = {"from_attributes": True}


# --- Allocation ---

class AllocationCreate(BaseModel):
    intern_id: int
    project_id: int
    hours_per_week: int
    start_date: date
    end_date: date


class AllocationUpdate(BaseModel):
    hours_per_week: int | None = None
    start_date: date | None = None
    end_date: date | None = None


class AllocationOut(BaseModel):
    id: int
    intern_id: int
    project_id: int
    hours_per_week: int
    start_date: date
    end_date: date

    model_config = {"from_attributes": True}

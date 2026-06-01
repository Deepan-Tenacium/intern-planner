from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, EmailStr


# --- Auth / User ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["intern", "manager"] = "intern"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None
    role: str | None = None
    user_id: int | None = None


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


class InternSkillUpdate(BaseModel):
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
    status: Literal["active", "on_leave", "finished"] | None = None


class InternOut(BaseModel):
    id: int
    name: str
    email: str
    cohort_start: date
    cohort_end: date
    weekly_capacity_hours: int
    status: str = "active"
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
    status: Literal["active", "planning", "completed"] = "active"
    owner: str
    start_date: date
    end_date: date


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: Literal["active", "planning", "completed"] | None = None
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

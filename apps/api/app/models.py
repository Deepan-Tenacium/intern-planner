from datetime import date
from sqlalchemy import (
    Column, Integer, String, Date, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base


class Intern(Base):
    __tablename__ = "interns"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    cohort_start = Column(Date, nullable=False)
    cohort_end = Column(Date, nullable=False)
    weekly_capacity_hours = Column(Integer, nullable=False, default=40)

    skills = relationship("InternSkill", back_populates="intern", cascade="all, delete-orphan")
    allocations = relationship("Allocation", back_populates="intern", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=False)

    intern_skills = relationship("InternSkill", back_populates="skill")
    project_skills = relationship("ProjectSkill", back_populates="skill")


class InternSkill(Base):
    __tablename__ = "intern_skills"
    __table_args__ = (UniqueConstraint("intern_id", "skill_id"),)

    id = Column(Integer, primary_key=True)
    intern_id = Column(Integer, ForeignKey("interns.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(Integer, nullable=False)  # 1–5

    intern = relationship("Intern", back_populates="skills")
    skill = relationship("Skill", back_populates="intern_skills")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, nullable=False, default="active")
    owner = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    required_skills = relationship("ProjectSkill", back_populates="project", cascade="all, delete-orphan")
    allocations = relationship("Allocation", back_populates="project", cascade="all, delete-orphan")


class ProjectSkill(Base):
    __tablename__ = "project_skills"
    __table_args__ = (UniqueConstraint("project_id", "skill_id"),)

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_proficiency = Column(Integer, nullable=False, default=3)

    project = relationship("Project", back_populates="required_skills")
    skill = relationship("Skill", back_populates="project_skills")


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True)
    intern_id = Column(Integer, ForeignKey("interns.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    hours_per_week = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    intern = relationship("Intern", back_populates="allocations")
    project = relationship("Project", back_populates="allocations")

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.SkillOut])
def list_skills(db: Session = Depends(get_db)):
    return db.execute(select(models.Skill)).scalars().all()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.get("/", response_model=list[schemas.InternOut])
def list_interns(db: Session = Depends(get_db)):
    return db.execute(select(models.Intern)).scalars().all()


@router.get("/{intern_id}", response_model=schemas.InternOut)
def get_intern(intern_id: int, db: Session = Depends(get_db)):
    intern = db.get(models.Intern, intern_id)
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    return intern


@router.post("/", response_model=schemas.InternOut, status_code=201)
def create_intern(body: schemas.InternCreate, db: Session = Depends(get_db)):
    intern = models.Intern(**body.model_dump())
    db.add(intern)
    db.commit()
    db.refresh(intern)
    return intern


@router.patch("/{intern_id}", response_model=schemas.InternOut)
def update_intern(intern_id: int, body: schemas.InternUpdate, db: Session = Depends(get_db)):
    intern = db.get(models.Intern, intern_id)
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(intern, field, value)
    db.commit()
    db.refresh(intern)
    return intern


@router.delete("/{intern_id}", status_code=204)
def delete_intern(intern_id: int, db: Session = Depends(get_db)):
    intern = db.get(models.Intern, intern_id)
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")
    db.delete(intern)
    db.commit()


@router.post("/{intern_id}/skills", response_model=schemas.InternSkillOut, status_code=201)
def add_intern_skill(intern_id: int, body: schemas.InternSkillCreate, db: Session = Depends(get_db)):
    if not db.get(models.Intern, intern_id):
        raise HTTPException(status_code=404, detail="Intern not found")
    if not db.get(models.Skill, body.skill_id):
        raise HTTPException(status_code=404, detail="Skill not found")
    intern_skill = models.InternSkill(intern_id=intern_id, **body.model_dump())
    db.add(intern_skill)
    db.commit()
    db.refresh(intern_skill)
    return intern_skill

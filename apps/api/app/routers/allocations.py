from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_manager

router = APIRouter()


@router.get("/", response_model=list[schemas.AllocationOut])
def list_allocations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.execute(select(models.Allocation)).scalars().all()


@router.get("/{allocation_id}", response_model=schemas.AllocationOut)
def get_allocation(allocation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    allocation = db.get(models.Allocation, allocation_id)
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    return allocation


@router.post("/", response_model=schemas.AllocationOut, status_code=201)
def create_allocation(body: schemas.AllocationCreate, db: Session = Depends(get_db), current_user=Depends(require_manager)):
    if not db.get(models.Intern, body.intern_id):
        raise HTTPException(status_code=404, detail="Intern not found")
    if not db.get(models.Project, body.project_id):
        raise HTTPException(status_code=404, detail="Project not found")
    allocation = models.Allocation(**body.model_dump())
    db.add(allocation)
    db.commit()
    db.refresh(allocation)
    return allocation


@router.patch("/{allocation_id}", response_model=schemas.AllocationOut)
def update_allocation(
    allocation_id: int,
    body: schemas.AllocationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_manager),
):
    allocation = db.get(models.Allocation, allocation_id)
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(allocation, field, value)
    db.commit()
    db.refresh(allocation)
    return allocation


@router.delete("/{allocation_id}", status_code=204)
def delete_allocation(allocation_id: int, db: Session = Depends(get_db), current_user=Depends(require_manager)):
    allocation = db.get(models.Allocation, allocation_id)
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    db.delete(allocation)
    db.commit()

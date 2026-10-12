from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import GrowthRecord, Plant, User
from app.schemas.schemas import GrowthRecordCreate, GrowthRecordResponse
from app.api.deps import get_current_user
import os

router = APIRouter(tags=["Plant Growth Tracking"])

@router.get("/plants/{plant_id}/growth", response_model=List[GrowthRecordResponse])
def get_growth_records(
    plant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    records = db.query(GrowthRecord).filter(
        GrowthRecord.plant_id == plant_id,
        GrowthRecord.user_id == current_user.id
    ).order_by(GrowthRecord.recorded_at.asc()).all()

    return [GrowthRecordResponse.model_validate(r) for r in records]

@router.post("/plants/{plant_id}/growth", response_model=GrowthRecordResponse, status_code=status.HTTP_201_CREATED)
async def add_growth_record(
    plant_id: str,
    height: Optional[float] = Form(None),
    measurement_unit: Optional[str] = Form("cm"),
    leaf_count: Optional[int] = Form(None),
    health_status: Optional[str] = Form("healthy"),
    observation: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    photo_url = None
    if photo and photo.filename:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        extension = os.path.splitext(photo.filename)[1]
        filename = f"growth_{plant_id}_{int(datetime.now().timestamp())}{extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        contents = await photo.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        photo_url = f"/uploads/{filename}"

    record = GrowthRecord(
        user_id=current_user.id,
        plant_id=plant_id,
        height=height,
        measurement_unit=measurement_unit or "cm",
        leaf_count=leaf_count,
        health_status=health_status or "healthy",
        photo_url=photo_url,
        observation=observation,
        recorded_at=datetime.now(timezone.utc)
    )
    db.add(record)

    # If plant health changed, update plant record
    if health_status and health_status != plant.health_status:
        plant.health_status = health_status

    db.commit()
    db.refresh(record)
    return GrowthRecordResponse.model_validate(record)

@router.delete("/growth-records/{record_id}")
def delete_growth_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = db.query(GrowthRecord).filter(
        GrowthRecord.id == record_id,
        GrowthRecord.user_id == current_user.id
    ).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    db.delete(record)
    db.commit()
    return {"message": "Growth record deleted"}

import os
import shutil
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Plant, CareReminder, CareLog, User
from app.schemas.schemas import PlantCreate, PlantUpdate, PlantResponse, CareLogCreate, CareLogResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/plants", tags=["Plants Management"])

@router.get("", response_model=List[PlantResponse])
def get_user_plants(
    search: Optional[str] = Query(None, description="Search by common or scientific name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    health_status: Optional[str] = Query(None, description="Filter by health status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Plant).filter(Plant.user_id == current_user.id)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter((Plant.common_name.ilike(s)) | (Plant.scientific_name.ilike(s)))
    if category and category.lower() != "all":
        query = query.filter(Plant.category == category)
    if health_status and health_status.lower() != "all":
        query = query.filter(Plant.health_status == health_status)
    
    plants = query.order_by(Plant.created_at.desc()).all()
    return [PlantResponse.model_validate(p) for p in plants]

@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
def create_plant(
    plant_in: PlantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = Plant(
        user_id=current_user.id,
        common_name=plant_in.common_name,
        scientific_name=plant_in.scientific_name,
        category=plant_in.category or "Indoor",
        photo_url=plant_in.photo_url,
        location=plant_in.location or "Living Room",
        environment=plant_in.environment or "indoor",
        health_status=plant_in.health_status or "healthy",
        care_preferences=plant_in.care_preferences or {
            "light": "Bright indirect",
            "watering_frequency_days": 7,
            "fertilizing_frequency_days": 30,
            "soil": "Well-draining potting soil",
            "humidity": "50%"
        },
        notes=plant_in.notes
    )
    db.add(plant)
    db.flush()

    # Automatically seed sensible default reminders for the plant!
    water_days = (plant.care_preferences or {}).get("watering_frequency_days", 7)
    water_reminder = CareReminder(
        user_id=current_user.id,
        plant_id=plant.id,
        task_type="watering",
        title=f"Water {plant.common_name}",
        due_at=datetime.now(timezone.utc) + timedelta(days=water_days),
        repeat_rule=f"every_{water_days}_days" if water_days != 7 else "weekly",
        repeat_days=water_days,
        notes="Check top 2 inches of soil moisture first.",
        status="pending"
    )
    db.add(water_reminder)

    fertilize_days = (plant.care_preferences or {}).get("fertilizing_frequency_days", 30)
    fertilize_reminder = CareReminder(
        user_id=current_user.id,
        plant_id=plant.id,
        task_type="fertilizing",
        title=f"Fertilize {plant.common_name}",
        due_at=datetime.now(timezone.utc) + timedelta(days=fertilize_days),
        repeat_rule="monthly",
        repeat_days=fertilize_days,
        notes="Use half-strength organic fertilizer.",
        status="pending"
    )
    db.add(fertilize_reminder)

    db.commit()
    db.refresh(plant)
    return PlantResponse.model_validate(plant)

@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(
    plant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    return PlantResponse.model_validate(plant)

@router.patch("/{plant_id}", response_model=PlantResponse)
def update_plant(
    plant_id: str,
    plant_in: PlantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    if plant_in.common_name is not None:
        plant.common_name = plant_in.common_name
    if plant_in.scientific_name is not None:
        plant.scientific_name = plant_in.scientific_name
    if plant_in.category is not None:
        plant.category = plant_in.category
    if plant_in.photo_url is not None:
        plant.photo_url = plant_in.photo_url
    if plant_in.location is not None:
        plant.location = plant_in.location
    if plant_in.environment is not None:
        plant.environment = plant_in.environment
    if plant_in.health_status is not None:
        plant.health_status = plant_in.health_status
    if plant_in.care_preferences is not None:
        plant.care_preferences = plant_in.care_preferences
    if plant_in.notes is not None:
        plant.notes = plant_in.notes
    
    db.commit()
    db.refresh(plant)
    return PlantResponse.model_validate(plant)

@router.delete("/{plant_id}")
def delete_plant(
    plant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    db.delete(plant)
    db.commit()
    return {"message": "Plant and associated care records successfully deleted"}

@router.post("/{plant_id}/photo", response_model=PlantResponse)
async def upload_plant_photo(
    plant_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    # Validate MIME type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPG, PNG, WEBP, or GIF images are accepted")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename or "plant.jpg")[1]
    filename = f"plant_{plant_id}_{int(datetime.now().timestamp())}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    plant.photo_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(plant)
    return PlantResponse.model_validate(plant)

@router.get("/{plant_id}/care-logs", response_model=List[CareLogResponse])
def get_plant_care_logs(
    plant_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    logs = db.query(CareLog).filter(CareLog.plant_id == plant_id).order_by(CareLog.completed_at.desc()).all()
    return [CareLogResponse.model_validate(l) for l in logs]

@router.post("/{plant_id}/care-logs", response_model=CareLogResponse, status_code=status.HTTP_201_CREATED)
def add_plant_care_log(
    plant_id: str,
    log_in: CareLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    
    log = CareLog(
        user_id=current_user.id,
        plant_id=plant_id,
        reminder_id=log_in.reminder_id,
        action_type=log_in.action_type,
        notes=log_in.notes,
        measurement_value=log_in.measurement_value,
        measurement_unit=log_in.measurement_unit,
        completed_at=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return CareLogResponse.model_validate(log)

import os
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import PlantDiagnosis, Plant, User, Notification
from app.schemas.schemas import DiagnosisResponse, ConditionDetail
from app.services.gemini_service import gemini_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/diagnose", tags=["AI Plant Disease Diagnosis"])

@router.post("", response_model=DiagnosisResponse)
async def diagnose_disease(
    file: UploadFile = File(...),
    plant_id: Optional[str] = Form(None),
    plant_species: Optional[str] = Form(None),
    plant_age: Optional[str] = Form(None),
    environment: Optional[str] = Form(None),
    watering_frequency: Optional[str] = Form(None),
    sunlight_exposure: Optional[str] = Form(None),
    fertilizer_usage: Optional[str] = Form(None),
    symptoms_description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Please upload JPG, PNG, WEBP, or GIF."
        )

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save image
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename or "disease.jpg")[1]
    filename = f"diag_{current_user.id}_{int(datetime.now().timestamp())}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{filename}"

    user_context = {
        "plant_species": plant_species,
        "plant_age": plant_age,
        "environment": environment,
        "watering_frequency": watering_frequency,
        "sunlight_exposure": sunlight_exposure,
        "fertilizer_usage": fertilizer_usage,
        "symptoms_description": symptoms_description
    }

    # Call AI pathology diagnosis
    diag_result = await gemini_service.diagnose_disease_from_image(
        contents,
        file.content_type,
        user_context=user_context
    )

    possible_conditions = [
        ConditionDetail(
            name=c.get("name", "Unknown Plant Condition"),
            confidence=c.get("confidence", 0.8),
            severity=c.get("severity", "Moderate"),
            description=c.get("description", ""),
            contributing_factors=c.get("contributing_factors", [])
        ) for c in diag_result.get("possible_conditions", [])
    ]

    # Save diagnosis record
    diag_record = PlantDiagnosis(
        user_id=current_user.id,
        plant_id=plant_id,
        image_url=image_url,
        observed_symptoms=diag_result.get("observed_symptoms", []),
        possible_conditions=[c.model_dump() for c in possible_conditions],
        recommendations=diag_result.get("recommendations", {}),
        isolation_needed=diag_result.get("isolation_needed", False),
        confidence=diag_result.get("confidence", 0.88),
        provider=diag_result.get("provider", "FloraAI Pathology Engine"),
        user_context=user_context
    )
    db.add(diag_record)

    # If linked to a plant, update the plant's health status if attention needed
    if plant_id:
        plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == current_user.id).first()
        if plant:
            if diag_record.isolation_needed:
                plant.health_status = "diseased"
            else:
                plant.health_status = "needs_attention"
            
            # Send notification alert
            alert_notif = Notification(
                user_id=current_user.id,
                plant_id=plant.id,
                title=f"Health Alert for {plant.common_name}",
                message=f"Diagnosis detected possible '{possible_conditions[0].name if possible_conditions else 'symptoms'}'. Check care recommendations.",
                notification_type="health_alert"
            )
            db.add(alert_notif)

    db.commit()
    db.refresh(diag_record)

    return DiagnosisResponse(
        id=diag_record.id,
        image_url=diag_record.image_url,
        confidence=diag_record.confidence,
        provider=diag_record.provider,
        observed_symptoms=diag_record.observed_symptoms,
        possible_conditions=possible_conditions,
        recommendations=diag_record.recommendations,
        isolation_needed=diag_record.isolation_needed,
        user_context=diag_record.user_context,
        created_at=diag_record.created_at
    )

@router.get("", response_model=List[DiagnosisResponse])
def get_user_diagnoses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(PlantDiagnosis).filter(
        PlantDiagnosis.user_id == current_user.id
    ).order_by(PlantDiagnosis.created_at.desc()).all()

    results = []
    for r in records:
        conditions = [ConditionDetail(**c) for c in (r.possible_conditions or [])]
        results.append(DiagnosisResponse(
            id=r.id,
            image_url=r.image_url,
            confidence=r.confidence,
            provider=r.provider,
            observed_symptoms=r.observed_symptoms or [],
            possible_conditions=conditions,
            recommendations=r.recommendations or {},
            isolation_needed=r.isolation_needed,
            user_context=r.user_context,
            created_at=r.created_at
        ))

    return results

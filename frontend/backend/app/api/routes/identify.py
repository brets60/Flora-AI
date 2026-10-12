import os
import shutil
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import PlantIdentification, User
from app.schemas.schemas import IdentificationResponse, IdentificationCandidate
from app.services.gemini_service import gemini_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/identify", tags=["AI Plant Identification"])

@router.post("", response_model=IdentificationResponse)
async def identify_plant(
    file: UploadFile = File(...),
    plant_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/gif"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Please upload JPG, PNG, WEBP, or GIF."
        )

    # Read image bytes
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Save to uploads
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename or "leaf.jpg")[1]
    filename = f"identify_{current_user.id}_{int(datetime.now().timestamp())}{extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{filename}"

    # Call AI identification service
    ai_result = await gemini_service.identify_plant_from_image(contents, file.content_type)

    primary = ai_result["primary_candidate"]
    alternatives = [
        IdentificationCandidate(
            common_name=alt.get("common_name", ""),
            scientific_name=alt.get("scientific_name", ""),
            family=alt.get("family"),
            confidence=alt.get("confidence", 0.7),
            description=alt.get("description", ""),
            light=alt.get("light", "Moderate light"),
            water=alt.get("water", "Moderate water"),
            soil=alt.get("soil", "Potting mix"),
            humidity=alt.get("humidity", "40-60%"),
            pet_toxicity=alt.get("pet_toxicity", "Unknown"),
            propagation=alt.get("propagation", "Cuttings"),
            common_problems=alt.get("common_problems", []),
            care_tips=alt.get("care_tips", [])
        ) for alt in ai_result.get("alternative_candidates", [])
    ]

    primary_candidate_obj = IdentificationCandidate(
        common_name=primary.get("common_name", "Unknown Species"),
        scientific_name=primary.get("scientific_name", "Specimen"),
        family=primary.get("family"),
        confidence=primary.get("confidence", 0.9),
        description=primary.get("description", ""),
        light=primary.get("light", "Bright indirect light"),
        water=primary.get("water", "Water when topsoil dries"),
        soil=primary.get("soil", "Well-draining mix"),
        humidity=primary.get("humidity", "50%"),
        pet_toxicity=primary.get("pet_toxicity", "Check pet compatibility"),
        propagation=primary.get("propagation", "Stem cuttings"),
        common_problems=primary.get("common_problems", []),
        care_tips=primary.get("care_tips", [])
    )

    # Store in database
    ident_record = PlantIdentification(
        user_id=current_user.id,
        plant_id=plant_id,
        image_url=image_url,
        identification_result={
            "primary": primary_candidate_obj.model_dump(),
            "alternatives": [alt.model_dump() for alt in alternatives]
        },
        confidence=ai_result.get("confidence", 0.95),
        provider=ai_result.get("provider", "FloraAI Botanical Engine")
    )
    db.add(ident_record)
    db.commit()
    db.refresh(ident_record)

    return IdentificationResponse(
        id=ident_record.id,
        image_url=ident_record.image_url,
        confidence=ident_record.confidence,
        provider=ident_record.provider,
        primary_candidate=primary_candidate_obj,
        alternative_candidates=alternatives,
        created_at=ident_record.created_at
    )

@router.get("", response_model=List[IdentificationResponse])
def get_user_identifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(PlantIdentification).filter(
        PlantIdentification.user_id == current_user.id
    ).order_by(PlantIdentification.created_at.desc()).all()

    results = []
    for r in records:
        data = r.identification_result or {}
        primary_data = data.get("primary", {})
        alternatives_data = data.get("alternatives", [])

        primary_candidate = IdentificationCandidate(
            common_name=primary_data.get("common_name", "Unknown"),
            scientific_name=primary_data.get("scientific_name", "Unknown"),
            family=primary_data.get("family"),
            confidence=primary_data.get("confidence", 0.9),
            description=primary_data.get("description", ""),
            light=primary_data.get("light", ""),
            water=primary_data.get("water", ""),
            soil=primary_data.get("soil", ""),
            humidity=primary_data.get("humidity"),
            pet_toxicity=primary_data.get("pet_toxicity"),
            propagation=primary_data.get("propagation"),
            common_problems=primary_data.get("common_problems", []),
            care_tips=primary_data.get("care_tips", [])
        )

        results.append(IdentificationResponse(
            id=r.id,
            image_url=r.image_url,
            confidence=r.confidence,
            provider=r.provider,
            primary_candidate=primary_candidate,
            alternative_candidates=[IdentificationCandidate(**alt) for alt in alternatives_data],
            created_at=r.created_at
        ))

    return results

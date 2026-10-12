from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, Notification
from app.schemas.schemas import UserCreate, UserLogin, UserProfileUpdate, PasswordChange, UserResponse, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Validate email uniqueness
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Password policy check
    if len(user_in.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters long"
        )
    
    # Create user
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        preferred_language="en",
        timezone="UTC",
        theme="light",
        measurement_units="metric"
    )
    db.add(user)
    db.flush()

    # Create welcome notification
    welcome_notif = Notification(
        user_id=user.id,
        title="Welcome to FloraAI! 🌿",
        message="Your digital botanical assistant is ready. Start by scanning a plant or exploring your digital garden.",
        notification_type="system"
    )
    db.add(welcome_notif)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.patch("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name.strip()
    if profile_in.avatar_url is not None:
        current_user.avatar_url = profile_in.avatar_url
    if profile_in.preferred_language is not None:
        current_user.preferred_language = profile_in.preferred_language
    if profile_in.timezone is not None:
        current_user.timezone = profile_in.timezone
    if profile_in.theme is not None:
        current_user.theme = profile_in.theme
    if profile_in.measurement_units is not None:
        current_user.measurement_units = profile_in.measurement_units
    if profile_in.notification_preferences is not None:
        current_user.notification_preferences = profile_in.notification_preferences

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.post("/change-password")
def change_password(
    pwd_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password does not match"
        )
    if len(pwd_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters long"
        )
    
    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.delete("/delete-account")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "User account and all associated plant data successfully deleted"}

@router.get("/export-data")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plants_data = []
    for plant in current_user.plants:
        plants_data.append({
            "id": plant.id,
            "common_name": plant.common_name,
            "scientific_name": plant.scientific_name,
            "category": plant.category,
            "location": plant.location,
            "environment": plant.environment,
            "health_status": plant.health_status,
            "care_preferences": plant.care_preferences,
            "notes": plant.notes,
            "date_added": str(plant.date_added),
        })

    reminders_data = [
        {
            "id": r.id,
            "plant_id": r.plant_id,
            "task_type": r.task_type,
            "title": r.title,
            "due_at": str(r.due_at),
            "status": r.status
        } for r in current_user.reminders
    ]

    return {
        "profile": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": str(current_user.created_at)
        },
        "plants": plants_data,
        "reminders": reminders_data,
        "diagnoses_count": len(current_user.diagnoses),
        "identifications_count": len(current_user.identifications),
        "export_date": str(current_user.updated_at)
    }

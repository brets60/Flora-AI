from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    terms_accepted: bool = Field(True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None
    measurement_units: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    preferred_language: str
    timezone: str
    theme: str
    measurement_units: str
    notification_preferences: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Plant Schemas ---
class PlantCarePreferences(BaseModel):
    light: Optional[str] = "Bright indirect light"
    watering_frequency_days: Optional[int] = 7
    fertilizing_frequency_days: Optional[int] = 30
    soil: Optional[str] = "Well-draining potting mix"
    humidity: Optional[str] = "40-60%"
    toxicity: Optional[str] = "Check pet safety"
    ideal_temp: Optional[str] = "18-24°C"

class PlantCreate(BaseModel):
    common_name: str = Field(..., min_length=1)
    scientific_name: Optional[str] = None
    category: Optional[str] = "Indoor"
    photo_url: Optional[str] = None
    location: Optional[str] = "Living Room"
    environment: Optional[str] = "indoor"
    health_status: Optional[str] = "healthy"
    care_preferences: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class PlantUpdate(BaseModel):
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    category: Optional[str] = None
    photo_url: Optional[str] = None
    location: Optional[str] = None
    environment: Optional[str] = None
    health_status: Optional[str] = None
    care_preferences: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None

class PlantResponse(BaseModel):
    id: str
    user_id: str
    common_name: str
    scientific_name: Optional[str] = None
    category: str
    photo_url: Optional[str] = None
    location: Optional[str] = None
    environment: str
    date_added: datetime
    health_status: str
    care_preferences: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Identification Schemas ---
class IdentificationCandidate(BaseModel):
    common_name: str
    scientific_name: str
    family: Optional[str] = None
    confidence: float
    description: str
    light: str
    water: str
    soil: str
    humidity: Optional[str] = None
    pet_toxicity: Optional[str] = None
    propagation: Optional[str] = None
    common_problems: Optional[List[str]] = []
    care_tips: Optional[List[str]] = []

class IdentificationResponse(BaseModel):
    id: str
    image_url: str
    confidence: float
    provider: str
    primary_candidate: IdentificationCandidate
    alternative_candidates: List[IdentificationCandidate] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Diagnosis Schemas ---
class DiagnosisContext(BaseModel):
    plant_species: Optional[str] = None
    plant_age: Optional[str] = None
    environment: Optional[str] = None
    watering_frequency: Optional[str] = None
    sunlight_exposure: Optional[str] = None
    fertilizer_usage: Optional[str] = None
    symptoms_description: Optional[str] = None

class ConditionDetail(BaseModel):
    name: str
    confidence: float
    severity: str
    description: str
    contributing_factors: List[str] = []

class DiagnosisResponse(BaseModel):
    id: str
    image_url: str
    confidence: float
    provider: str
    observed_symptoms: List[str]
    possible_conditions: List[ConditionDetail]
    recommendations: Dict[str, Any]
    isolation_needed: bool
    user_context: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Reminders & Care ---
class ReminderCreate(BaseModel):
    plant_id: str
    task_type: str
    title: str
    due_at: datetime
    repeat_rule: Optional[str] = "weekly"
    repeat_days: Optional[int] = 7
    notes: Optional[str] = None

class ReminderUpdate(BaseModel):
    task_type: Optional[str] = None
    title: Optional[str] = None
    due_at: Optional[datetime] = None
    repeat_rule: Optional[str] = None
    repeat_days: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ReminderResponse(BaseModel):
    id: str
    user_id: str
    plant_id: str
    task_type: str
    title: str
    due_at: datetime
    repeat_rule: str
    repeat_days: int
    notes: Optional[str] = None
    status: str
    plant_name: Optional[str] = None
    plant_photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CareLogCreate(BaseModel):
    plant_id: str
    reminder_id: Optional[str] = None
    action_type: str
    notes: Optional[str] = None
    measurement_value: Optional[float] = None
    measurement_unit: Optional[str] = None

class CareLogResponse(BaseModel):
    id: str
    user_id: str
    plant_id: str
    reminder_id: Optional[str] = None
    action_type: str
    notes: Optional[str] = None
    measurement_value: Optional[float] = None
    measurement_unit: Optional[str] = None
    completed_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Growth Schemas ---
class GrowthRecordCreate(BaseModel):
    plant_id: str
    height: Optional[float] = None
    measurement_unit: Optional[str] = "cm"
    leaf_count: Optional[int] = None
    health_status: Optional[str] = "healthy"
    photo_url: Optional[str] = None
    observation: Optional[str] = None

class GrowthRecordResponse(BaseModel):
    id: str
    user_id: str
    plant_id: str
    height: Optional[float] = None
    measurement_unit: str
    leaf_count: Optional[int] = None
    health_status: str
    photo_url: Optional[str] = None
    observation: Optional[str] = None
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Chat Schemas ---
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    plant_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    suggested_actions: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatConversationResponse(BaseModel):
    id: str
    user_id: str
    plant_id: Optional[str] = None
    title: str
    messages: List[ChatMessageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    plant_id: Optional[str] = None
    reminder_id: Optional[str] = None
    title: str
    message: str
    notification_type: str
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Article Schemas ---
class ArticleResponse(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    image_url: Optional[str] = None
    summary: str
    content: str
    difficulty: str
    light_req: Optional[str] = None
    water_req: Optional[str] = None
    common_problems: Optional[List[Dict[str, str]]] = []
    step_by_step: Optional[List[str]] = []
    attribution: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Dashboard Stats ---
class DashboardStats(BaseModel):
    total_plants: int
    plants_needing_attention: int
    upcoming_tasks_count: int
    completed_tasks_this_week: int
    health_distribution: Dict[str, int]
    today_tasks: List[ReminderResponse]
    recent_diagnoses: List[DiagnosisResponse]
    seasonal_tip: Dict[str, str]

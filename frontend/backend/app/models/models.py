import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    preferred_language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC")
    theme = Column(String(10), default="light")
    measurement_units = Column(String(10), default="metric")
    notification_preferences = Column(JSON, default=lambda: {"email": False, "browser": True, "watering": True, "fertilizing": True})
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    plants = relationship("Plant", back_populates="user", cascade="all, delete-orphan")
    identifications = relationship("PlantIdentification", back_populates="user", cascade="all, delete-orphan")
    diagnoses = relationship("PlantDiagnosis", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("CareReminder", back_populates="user", cascade="all, delete-orphan")
    care_logs = relationship("CareLog", back_populates="user", cascade="all, delete-orphan")
    growth_records = relationship("GrowthRecord", back_populates="user", cascade="all, delete-orphan")
    chat_conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Plant(Base):
    __tablename__ = "plants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    common_name = Column(String(255), nullable=False, index=True)
    scientific_name = Column(String(255), nullable=True)
    category = Column(String(100), default="Indoor", index=True)
    photo_url = Column(String(500), nullable=True)
    location = Column(String(255), default="Living Room")
    environment = Column(String(50), default="indoor")  # indoor, outdoor, garden, greenhouse, farm
    date_added = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    health_status = Column(String(50), default="healthy", index=True) # healthy, needs_attention, recovering, diseased
    care_preferences = Column(JSON, default=dict)
    # care_preferences holds:
    # {
    #   "light": "Bright indirect",
    #   "watering_frequency_days": 7,
    #   "fertilizing_frequency_days": 30,
    #   "soil": "Well-draining potting mix",
    #   "humidity": "50-60%",
    #   "toxicity": "Non-toxic to pets",
    #   "ideal_temp": "18-24°C"
    # }
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="plants")
    reminders = relationship("CareReminder", back_populates="plant", cascade="all, delete-orphan")
    care_logs = relationship("CareLog", back_populates="plant", cascade="all, delete-orphan")
    growth_records = relationship("GrowthRecord", back_populates="plant", cascade="all, delete-orphan")
    diagnoses = relationship("PlantDiagnosis", back_populates="plant")
    identifications = relationship("PlantIdentification", back_populates="plant")

class PlantIdentification(Base):
    __tablename__ = "plant_identifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True)
    image_url = Column(String(500), nullable=False)
    identification_result = Column(JSON, nullable=False)
    confidence = Column(Float, default=0.95)
    provider = Column(String(100), default="FloraAI Botanical Engine")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="identifications")
    plant = relationship("Plant", back_populates="identifications")

class PlantDiagnosis(Base):
    __tablename__ = "plant_diagnoses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True)
    image_url = Column(String(500), nullable=False)
    observed_symptoms = Column(JSON, nullable=False)
    possible_conditions = Column(JSON, nullable=False)
    recommendations = Column(JSON, nullable=False)
    isolation_needed = Column(Boolean, default=False)
    confidence = Column(Float, default=0.88)
    provider = Column(String(100), default="FloraAI Pathology Engine")
    user_context = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="diagnoses")
    plant = relationship("Plant", back_populates="diagnoses")

class CareReminder(Base):
    __tablename__ = "care_reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="CASCADE"), index=True, nullable=False)
    task_type = Column(String(50), nullable=False, index=True)  # watering, fertilizing, pruning, repotting, pest_inspection, harvesting, custom
    title = Column(String(255), nullable=False)
    due_at = Column(DateTime, nullable=False, index=True)
    repeat_rule = Column(String(50), default="weekly") # daily, every_3_days, weekly, biweekly, monthly, custom_days, once
    repeat_days = Column(Integer, default=7)
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending", index=True)  # pending, completed, overdue, snoozed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reminders")
    plant = relationship("Plant", back_populates="reminders")

class CareLog(Base):
    __tablename__ = "care_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="CASCADE"), index=True, nullable=False)
    reminder_id = Column(String(36), ForeignKey("care_reminders.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(50), nullable=False)  # watering, fertilizing, pruning, repotting, misting, etc.
    notes = Column(Text, nullable=True)
    measurement_value = Column(Float, nullable=True)
    measurement_unit = Column(String(20), nullable=True)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="care_logs")
    plant = relationship("Plant", back_populates="care_logs")

class GrowthRecord(Base):
    __tablename__ = "growth_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="CASCADE"), index=True, nullable=False)
    height = Column(Float, nullable=True)
    measurement_unit = Column(String(20), default="cm")
    leaf_count = Column(Integer, nullable=True)
    health_status = Column(String(50), default="healthy")
    photo_url = Column(String(500), nullable=True)
    observation = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="growth_records")
    plant = relationship("Plant", back_populates="growth_records")

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), default="Botanical Consultation")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("chat_conversations.id", ondelete="CASCADE"), index=True, nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    suggested_actions = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    conversation = relationship("ChatConversation", back_populates="messages")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    plant_id = Column(String(36), ForeignKey("plants.id", ondelete="SET NULL"), nullable=True)
    reminder_id = Column(String(36), ForeignKey("care_reminders.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="care_due") # care_due, care_overdue, health_alert, system
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="notifications")

class Article(Base):
    __tablename__ = "articles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    image_url = Column(String(500), nullable=True)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    difficulty = Column(String(50), default="Easy") # Easy, Medium, Advanced
    light_req = Column(String(100), nullable=True)
    water_req = Column(String(100), nullable=True)
    common_problems = Column(JSON, default=list)
    step_by_step = Column(JSON, default=list)
    attribution = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

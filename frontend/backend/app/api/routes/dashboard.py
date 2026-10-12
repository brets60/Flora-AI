from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Plant, CareReminder, CareLog, PlantDiagnosis, User
from app.schemas.schemas import DashboardStats, ReminderResponse, DiagnosisResponse, ConditionDetail
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Aggregations"])

def get_seasonal_tip() -> Dict[str, str]:
    month = datetime.now().month
    if month in [3, 4, 5]: # Spring
        return {
            "season": "Spring Renewal",
            "title": "Spring Growth & Repotting Window",
            "tip": "As daylight hours lengthen, indoor plants break dormancy. Inspect root-bound plants for repotting into pots 1-2 inches larger, and resume light fertilizing."
        }
    elif month in [6, 7, 8]: # Summer
        return {
            "season": "Summer Hydration",
            "title": "Sun Shielding & Deep Hydration",
            "tip": "High summer temperatures accelerate soil drying. Move sun-sensitive tropicals back from intense south-facing windows and water deeply during cooler morning hours."
        }
    elif month in [9, 10, 11]: # Autumn
        return {
            "season": "Autumn Preparation",
            "title": "Tapering Fertilizers & Pest Scouting",
            "tip": "Growth rates slow down as temperatures cool. Gradually reduce watering intervals, stop synthetic fertilizers, and inspect plants brought inside from outdoors for hitchhiking pests."
        }
    else: # Winter
        return {
            "season": "Winter Dormancy",
            "title": "Humidity Defense & Draft Protection",
            "tip": "Indoor winter heating strips air moisture. Group plants together, run a cool-mist humidifier, and keep sensitive leaves away from cold window glass and radiator heat blasts."
        }

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)
    seven_days_ago = now - timedelta(days=7)

    # Plants count
    total_plants = db.query(Plant).filter(Plant.user_id == current_user.id).count()
    plants_needing_attention = db.query(Plant).filter(
        Plant.user_id == current_user.id,
        Plant.health_status != "healthy"
    ).count()

    # Health distribution
    health_rows = db.query(Plant.health_status, func.count(Plant.id)).filter(
        Plant.user_id == current_user.id
    ).group_by(Plant.health_status).all()
    health_dist = {status: count for status, count in health_rows}

    # Today's tasks (due today, overdue, or pending)
    tasks_query = db.query(CareReminder).filter(
        CareReminder.user_id == current_user.id,
        CareReminder.status.in_(["pending", "overdue", "snoozed"]),
        CareReminder.due_at <= today_end
    ).order_by(CareReminder.due_at.asc()).all()

    today_tasks_res = []
    for t in tasks_query:
        p = t.plant
        today_tasks_res.append(ReminderResponse(
            id=t.id,
            user_id=t.user_id,
            plant_id=t.plant_id,
            task_type=t.task_type,
            title=t.title,
            due_at=t.due_at,
            repeat_rule=t.repeat_rule,
            repeat_days=t.repeat_days,
            notes=t.notes,
            status=t.status,
            plant_name=p.common_name if p else "Plant",
            plant_photo=p.photo_url if p else None,
            created_at=t.created_at,
            updated_at=t.updated_at
        ))

    # Upcoming count next 7 days
    upcoming_tasks_count = db.query(CareReminder).filter(
        CareReminder.user_id == current_user.id,
        CareReminder.status.in_(["pending", "snoozed"]),
        CareReminder.due_at <= now + timedelta(days=7)
    ).count()

    # Completed tasks this week
    completed_this_week = db.query(CareLog).filter(
        CareLog.user_id == current_user.id,
        CareLog.completed_at >= seven_days_ago
    ).count()

    # Recent diagnoses
    recent_diags_db = db.query(PlantDiagnosis).filter(
        PlantDiagnosis.user_id == current_user.id
    ).order_by(PlantDiagnosis.created_at.desc()).limit(3).all()

    recent_diags = []
    for d in recent_diags_db:
        conds = [ConditionDetail(**c) for c in (d.possible_conditions or [])]
        recent_diags.append(DiagnosisResponse(
            id=d.id,
            image_url=d.image_url,
            confidence=d.confidence,
            provider=d.provider,
            observed_symptoms=d.observed_symptoms or [],
            possible_conditions=conds,
            recommendations=d.recommendations or {},
            isolation_needed=d.isolation_needed,
            user_context=d.user_context,
            created_at=d.created_at
        ))

    return DashboardStats(
        total_plants=total_plants,
        plants_needing_attention=plants_needing_attention,
        upcoming_tasks_count=upcoming_tasks_count,
        completed_tasks_this_week=completed_this_week,
        health_distribution=health_dist,
        today_tasks=today_tasks_res,
        recent_diagnoses=recent_diags,
        seasonal_tip=get_seasonal_tip()
    )

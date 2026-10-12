from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CareReminder, CareLog, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/calendar", tags=["Plant Care Calendar"])

@router.get("/events")
def get_calendar_events(
    start_date: Optional[str] = Query(None, description="ISO Start date e.g. 2026-10-01"),
    end_date: Optional[str] = Query(None, description="ISO End date e.g. 2026-10-31"),
    plant_id: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch reminders
    r_query = db.query(CareReminder).filter(CareReminder.user_id == current_user.id)
    if plant_id:
        r_query = r_query.filter(CareReminder.plant_id == plant_id)
    if task_type and task_type.lower() != "all":
        r_query = r_query.filter(CareReminder.task_type == task_type)
    
    reminders = r_query.all()

    # Fetch completed care logs
    l_query = db.query(CareLog).filter(CareLog.user_id == current_user.id)
    if plant_id:
        l_query = l_query.filter(CareLog.plant_id == plant_id)
    if task_type and task_type.lower() != "all":
        l_query = l_query.filter(CareLog.action_type == task_type)

    care_logs = l_query.all()

    events = []
    for r in reminders:
        plant = r.plant
        events.append({
            "id": f"rem_{r.id}",
            "reminder_id": r.id,
            "type": "reminder",
            "task_type": r.task_type,
            "title": r.title,
            "date": r.due_at.isoformat(),
            "status": r.status,
            "plant_id": r.plant_id,
            "plant_name": plant.common_name if plant else "Plant",
            "notes": r.notes
        })

    for log in care_logs:
        plant = log.plant
        events.append({
            "id": f"log_{log.id}",
            "type": "completed_log",
            "task_type": log.action_type,
            "title": f"Completed: {log.action_type.capitalize()} on {plant.common_name if plant else 'Plant'}",
            "date": log.completed_at.isoformat(),
            "status": "completed",
            "plant_id": log.plant_id,
            "plant_name": plant.common_name if plant else "Plant",
            "notes": log.notes
        })

    return events

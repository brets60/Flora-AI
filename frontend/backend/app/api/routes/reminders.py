from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CareReminder, CareLog, Plant, User, Notification
from app.schemas.schemas import ReminderCreate, ReminderUpdate, ReminderResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/reminders", tags=["Care Reminders & Scheduling"])

def update_overdue_statuses(db: Session, user_id: str):
    now = datetime.now(timezone.utc)
    # Mark pending reminders whose due_at is before now as overdue
    overdue_tasks = db.query(CareReminder).filter(
        CareReminder.user_id == user_id,
        CareReminder.status == "pending",
        CareReminder.due_at < now
    ).all()
    for task in overdue_tasks:
        task.status = "overdue"
    if overdue_tasks:
        db.commit()

@router.get("", response_model=List[ReminderResponse])
def get_reminders(
    status_filter: Optional[str] = Query(None, alias="status"),
    plant_id: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_overdue_statuses(db, current_user.id)

    query = db.query(CareReminder).filter(CareReminder.user_id == current_user.id)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(CareReminder.status == status_filter)
    if plant_id:
        query = query.filter(CareReminder.plant_id == plant_id)
    if task_type and task_type.lower() != "all":
        query = query.filter(CareReminder.task_type == task_type)

    reminders = query.order_by(CareReminder.due_at.asc()).all()
    
    results = []
    for r in reminders:
        plant = r.plant
        res = ReminderResponse(
            id=r.id,
            user_id=r.user_id,
            plant_id=r.plant_id,
            task_type=r.task_type,
            title=r.title,
            due_at=r.due_at,
            repeat_rule=r.repeat_rule,
            repeat_days=r.repeat_days,
            notes=r.notes,
            status=r.status,
            plant_name=plant.common_name if plant else "Unknown Plant",
            plant_photo=plant.photo_url if plant else None,
            created_at=r.created_at,
            updated_at=r.updated_at
        )
        results.append(res)
    return results

@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plant = db.query(Plant).filter(Plant.id == reminder_in.plant_id, Plant.user_id == current_user.id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")

    repeat_days = reminder_in.repeat_days or 7
    if reminder_in.repeat_rule == "daily":
        repeat_days = 1
    elif reminder_in.repeat_rule == "every_3_days":
        repeat_days = 3
    elif reminder_in.repeat_rule == "weekly":
        repeat_days = 7
    elif reminder_in.repeat_rule == "biweekly":
        repeat_days = 14
    elif reminder_in.repeat_rule == "monthly":
        repeat_days = 30

    reminder = CareReminder(
        user_id=current_user.id,
        plant_id=reminder_in.plant_id,
        task_type=reminder_in.task_type,
        title=reminder_in.title,
        due_at=reminder_in.due_at,
        repeat_rule=reminder_in.repeat_rule or "weekly",
        repeat_days=repeat_days,
        notes=reminder_in.notes,
        status="pending"
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)

    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        plant_id=reminder.plant_id,
        task_type=reminder.task_type,
        title=reminder.title,
        due_at=reminder.due_at,
        repeat_rule=reminder.repeat_rule,
        repeat_days=reminder.repeat_days,
        notes=reminder.notes,
        status=reminder.status,
        plant_name=plant.common_name,
        plant_photo=plant.photo_url,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )

@router.patch("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(
    reminder_id: str,
    reminder_in: ReminderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(CareReminder).filter(CareReminder.id == reminder_id, CareReminder.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    if reminder_in.task_type is not None:
        reminder.task_type = reminder_in.task_type
    if reminder_in.title is not None:
        reminder.title = reminder_in.title
    if reminder_in.due_at is not None:
        reminder.due_at = reminder_in.due_at
    if reminder_in.repeat_rule is not None:
        reminder.repeat_rule = reminder_in.repeat_rule
    if reminder_in.repeat_days is not None:
        reminder.repeat_days = reminder_in.repeat_days
    if reminder_in.notes is not None:
        reminder.notes = reminder_in.notes
    if reminder_in.status is not None:
        reminder.status = reminder_in.status

    db.commit()
    db.refresh(reminder)
    plant = reminder.plant
    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        plant_id=reminder.plant_id,
        task_type=reminder.task_type,
        title=reminder.title,
        due_at=reminder.due_at,
        repeat_rule=reminder.repeat_rule,
        repeat_days=reminder.repeat_days,
        notes=reminder.notes,
        status=reminder.status,
        plant_name=plant.common_name if plant else "Unknown",
        plant_photo=plant.photo_url if plant else None,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )

@router.post("/{reminder_id}/complete", response_model=ReminderResponse)
def complete_reminder(
    reminder_id: str,
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(CareReminder).filter(CareReminder.id == reminder_id, CareReminder.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    now = datetime.now(timezone.utc)
    reminder.status = "completed"

    # Create CareLog entry
    care_log = CareLog(
        user_id=current_user.id,
        plant_id=reminder.plant_id,
        reminder_id=reminder.id,
        action_type=reminder.task_type,
        notes=notes or f"Completed {reminder.title}",
        completed_at=now
    )
    db.add(care_log)

    # If repeating, schedule next occurrence
    if reminder.repeat_rule != "once":
        next_due = now + timedelta(days=reminder.repeat_days)
        next_reminder = CareReminder(
            user_id=current_user.id,
            plant_id=reminder.plant_id,
            task_type=reminder.task_type,
            title=reminder.title,
            due_at=next_due,
            repeat_rule=reminder.repeat_rule,
            repeat_days=reminder.repeat_days,
            notes=reminder.notes,
            status="pending"
        )
        db.add(next_reminder)

    db.commit()
    db.refresh(reminder)

    plant = reminder.plant
    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        plant_id=reminder.plant_id,
        task_type=reminder.task_type,
        title=reminder.title,
        due_at=reminder.due_at,
        repeat_rule=reminder.repeat_rule,
        repeat_days=reminder.repeat_days,
        notes=reminder.notes,
        status=reminder.status,
        plant_name=plant.common_name if plant else "Unknown",
        plant_photo=plant.photo_url if plant else None,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )

@router.post("/{reminder_id}/snooze", response_model=ReminderResponse)
def snooze_reminder(
    reminder_id: str,
    days: int = Query(1, ge=1, le=14),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(CareReminder).filter(CareReminder.id == reminder_id, CareReminder.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    reminder.due_at = datetime.now(timezone.utc) + timedelta(days=days)
    reminder.status = "snoozed"
    db.commit()
    db.refresh(reminder)

    plant = reminder.plant
    return ReminderResponse(
        id=reminder.id,
        user_id=reminder.user_id,
        plant_id=reminder.plant_id,
        task_type=reminder.task_type,
        title=reminder.title,
        due_at=reminder.due_at,
        repeat_rule=reminder.repeat_rule,
        repeat_days=reminder.repeat_days,
        notes=reminder.notes,
        status=reminder.status,
        plant_name=plant.common_name if plant else "Unknown",
        plant_photo=plant.photo_url if plant else None,
        created_at=reminder.created_at,
        updated_at=reminder.updated_at
    )

@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reminder = db.query(CareReminder).filter(CareReminder.id == reminder_id, CareReminder.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")

    db.delete(reminder)
    db.commit()
    return {"message": "Reminder deleted successfully"}

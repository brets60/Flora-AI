from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ChatConversation, ChatMessage, Plant, User
from app.schemas.schemas import ChatMessageRequest, ChatMessageResponse, ChatConversationResponse
from app.services.gemini_service import gemini_service
from app.api.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Plant Assistant Chat"])

@router.post("", response_model=ChatMessageResponse)
async def send_chat_message(
    chat_in: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve or create conversation
    conv = None
    if chat_in.conversation_id:
        conv = db.query(ChatConversation).filter(
            ChatConversation.id == chat_in.conversation_id,
            ChatConversation.user_id == current_user.id
        ).first()

    if not conv:
        # Title conversation based on prompt
        title = chat_in.message[:40] + ("..." if len(chat_in.message) > 40 else "")
        conv = ChatConversation(
            user_id=current_user.id,
            plant_id=chat_in.plant_id,
            title=title
        )
        db.add(conv)
        db.flush()

    # Save user message
    user_msg = ChatMessage(
        conversation_id=conv.id,
        role="user",
        content=chat_in.message.strip()
    )
    db.add(user_msg)
    db.flush()

    # Retrieve prior conversation messages
    all_msgs = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv.id).order_by(ChatMessage.created_at.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in all_msgs]

    # Plant context if available
    plant_context = None
    plant_target = None
    if chat_in.plant_id or conv.plant_id:
        p_id = chat_in.plant_id or conv.plant_id
        plant_target = db.query(Plant).filter(Plant.id == p_id, Plant.user_id == current_user.id).first()
        if plant_target:
            plant_context = {
                "common_name": plant_target.common_name,
                "scientific_name": plant_target.scientific_name,
                "category": plant_target.category,
                "location": plant_target.location,
                "environment": plant_target.environment,
                "health_status": plant_target.health_status,
                "care_preferences": plant_target.care_preferences,
                "notes": plant_target.notes
            }

    # Generate response
    ai_reply = await gemini_service.chat_plant_doctor(history, plant_context=plant_context)

    # Save assistant message
    asst_msg = ChatMessage(
        conversation_id=conv.id,
        role="assistant",
        content=ai_reply.get("content", "I am observing your plant's status. How can I assist further?"),
        suggested_actions=ai_reply.get("suggested_actions", [])
    )
    db.add(asst_msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(asst_msg)

    return ChatMessageResponse.model_validate(asst_msg)

@router.get("/conversations", response_model=List[ChatConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    convs = db.query(ChatConversation).filter(
        ChatConversation.user_id == current_user.id
    ).order_by(ChatConversation.updated_at.desc()).all()

    results = []
    for c in convs:
        msgs = [ChatMessageResponse.model_validate(m) for m in c.messages]
        results.append(ChatConversationResponse(
            id=c.id,
            user_id=c.user_id,
            plant_id=c.plant_id,
            title=c.title,
            messages=msgs,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))
    return results

@router.get("/conversations/{conversation_id}", response_model=ChatConversationResponse)
def get_conversation_detail(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    msgs = [ChatMessageResponse.model_validate(m) for m in conv.messages]
    return ChatConversationResponse(
        id=conv.id,
        user_id=conv.user_id,
        plant_id=conv.plant_id,
        title=conv.title,
        messages=msgs,
        created_at=conv.created_at,
        updated_at=conv.updated_at
    )

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation cleared successfully"}

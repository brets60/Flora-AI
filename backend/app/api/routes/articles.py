from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Article
from app.schemas.schemas import ArticleResponse

router = APIRouter(prefix="/articles", tags=["Plant Library & Learning Center"])

@router.get("", response_model=List[ArticleResponse])
def get_articles(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Article)
    if category and category.lower() != "all":
        query = query.filter(Article.category == category)
    if difficulty and difficulty.lower() != "all":
        query = query.filter(Article.difficulty == difficulty)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter((Article.title.ilike(s)) | (Article.summary.ilike(s)) | (Article.content.ilike(s)))

    articles = query.order_by(Article.title.asc()).all()
    return [ArticleResponse.model_validate(a) for a in articles]

@router.get("/{slug}", response_model=ArticleResponse)
def get_article_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")
    return ArticleResponse.model_validate(article)

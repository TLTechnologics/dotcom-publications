from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.models import Category, ActivityLog
from backend.app.schemas.schemas import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])

def build_category_response(cat: Category) -> CategoryResponse:
    sub_responses = [build_category_response(sub) for sub in cat.subcategories]
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        image_url=cat.image_url,
        parent_id=cat.parent_id,
        parent_name=cat.parent.name if cat.parent else None,
        books_count=len(cat.books),
        subcategories=sub_responses,
        created_at=cat.created_at
    )

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    flat: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Category)
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))

    if not flat and not search:
        # Return root categories with subcategories nested
        roots = query.filter(Category.parent_id == None).order_by(Category.name.asc()).all()
        return [build_category_response(cat) for cat in roots]

    # Return all flat
    categories = query.order_by(Category.name.asc()).all()
    return [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            image_url=cat.image_url,
            parent_id=cat.parent_id,
            parent_name=cat.parent.name if cat.parent else None,
            books_count=len(cat.books),
            subcategories=[],
            created_at=cat.created_at
        )
        for cat in categories
    ]

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return build_category_response(cat)

@router.post("", response_model=CategoryResponse, status_code=201)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db)):
    # Check slug uniqueness
    existing = db.query(Category).filter(Category.slug == cat_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")

    cat = Category(
        name=cat_in.name,
        slug=cat_in.slug,
        description=cat_in.description,
        image_url=cat_in.image_url,
        parent_id=cat_in.parent_id
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)

    log = ActivityLog(
        action_type="create",
        entity_type="category",
        entity_id=cat.id,
        entity_name=cat.name,
        description=f"Created academic category '{cat.name}'"
    )
    db.add(log)
    db.commit()

    return build_category_response(cat)

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, cat_in: CategoryUpdate, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = cat_in.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"] != cat.slug:
        existing = db.query(Category).filter(Category.slug == update_data["slug"]).first()
        if existing and existing.id != cat.id:
            raise HTTPException(status_code=400, detail="Slug already in use by another category")

    for field, value in update_data.items():
        setattr(cat, field, value)

    log = ActivityLog(
        action_type="update",
        entity_type="category",
        entity_id=cat.id,
        entity_name=cat.name,
        description=f"Updated category '{cat.name}'"
    )
    db.add(log)
    db.commit()
    db.refresh(cat)

    return build_category_response(cat)

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    name = cat.name
    log = ActivityLog(
        action_type="delete",
        entity_type="category",
        entity_id=category_id,
        entity_name=name,
        description=f"Deleted category '{name}'"
    )
    db.add(log)
    db.delete(cat)
    db.commit()
    return {"message": f"Category '{name}' deleted successfully", "id": category_id}

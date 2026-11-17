from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- Author Schemas -----------------
class AuthorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

class AuthorCreate(AuthorBase):
    pass

class AuthorUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

class AuthorResponse(AuthorBase):
    id: int
    books_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Publisher Schemas -----------------
class PublisherBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    logo_url: Optional[str] = None
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None

class PublisherCreate(PublisherBase):
    pass

class PublisherUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None

class PublisherResponse(PublisherBase):
    id: int
    books_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Category Schemas -----------------
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    parent_name: Optional[str] = None
    books_count: int = 0
    subcategories: List['CategoryResponse'] = []
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Book Schemas -----------------
class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    subtitle: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    cover_image: Optional[str] = None
    additional_images: Optional[List[str]] = []

    isbn: Optional[str] = None
    edition: Optional[str] = None
    publication_year: Optional[int] = None
    publisher_id: Optional[int] = None
    pages: Optional[int] = None
    language: str = "English"
    book_format: str = "Paperback"
    subject: Optional[str] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None

    selling_price: float = Field(0.0, ge=0.0)
    mrp: float = Field(0.0, ge=0.0)
    currency: str = "INR"

    is_draft: bool = False
    is_featured: bool = False
    availability_status: str = "in_stock"
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class BookCreate(BookBase):
    author_ids: List[int] = []

class BookUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    cover_image: Optional[str] = None
    additional_images: Optional[List[str]] = None

    isbn: Optional[str] = None
    edition: Optional[str] = None
    publication_year: Optional[int] = None
    publisher_id: Optional[int] = None
    pages: Optional[int] = None
    language: Optional[str] = None
    book_format: Optional[str] = None
    subject: Optional[str] = None
    category_id: Optional[int] = None
    subcategory_id: Optional[int] = None

    selling_price: Optional[float] = None
    mrp: Optional[float] = None
    currency: Optional[str] = None

    is_draft: Optional[bool] = None
    is_featured: Optional[bool] = None
    availability_status: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    author_ids: Optional[List[int]] = None

class BookAuthorBrief(BaseModel):
    id: int
    name: str
    profile_picture: Optional[str] = None

class BookResponse(BookBase):
    id: int
    authors: List[BookAuthorBrief] = []
    publisher_name: Optional[str] = None
    category_name: Optional[str] = None
    subcategory_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Media Schemas -----------------
class MediaResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    url: str
    file_size: int
    mime_type: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Landing Page Schemas -----------------
class LandingPageContent(BaseModel):
    hero_heading: str
    hero_description: str
    hero_image: Optional[str] = None
    featured_book_ids: List[int] = []
    latest_publications: List[int] = []
    popular_categories: List[int] = []
    about_title: str
    about_description: str
    about_stats: List[dict] = []
    contact_email: str
    contact_phone: str
    contact_address: str
    footer_text: str

class LandingPageResponse(LandingPageContent):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Site Settings Schemas -----------------
class SiteSettingsContent(BaseModel):
    company_name: str
    logo_url: Optional[str] = None
    description: str
    contact_email: str
    phone: str
    address: str
    social_links: dict = {}
    currency: str = "INR"
    catalogue_download_url: Optional[str] = None
    maintenance_mode: bool = False

class SiteSettingsResponse(SiteSettingsContent):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Activity Log & Dashboard -----------------
class ActivityLogResponse(BaseModel):
    id: int
    action_type: str
    entity_type: str
    entity_id: Optional[int]
    entity_name: Optional[str]
    description: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_books: int
    published_books: int
    draft_books: int
    total_authors: int
    total_categories: int
    total_publishers: int
    recently_added_books: List[BookResponse]
    featured_books: List[BookResponse]
    recent_activity: List[ActivityLogResponse]

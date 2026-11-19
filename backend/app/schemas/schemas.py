from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- User & Authentication Schemas -----------------
class UserBase(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    username: str = Field(..., min_length=2, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    role: str = Field("viewer", description="Role: super-admin, content_manager, order_manager, viewer")
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserPasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=128)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

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

# ----------------- Activity Log & Notification Schemas -----------------
class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    action_type: str
    entity_type: str
    entity_id: Optional[int] = None
    entity_name: Optional[str] = None
    description: str
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Order Schemas -----------------
class OrderItemBrief(BaseModel):
    id: Optional[int] = None
    book_id: Optional[int] = None
    title: str
    price: float
    quantity: int = 1
    cover_image: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=255)
    customer_email: str = Field(..., min_length=3, max_length=255)
    customer_phone: str = Field(..., min_length=5, max_length=50)
    shipping_address: str = Field(..., min_length=5)
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    items: List[OrderItemBrief]
    total_amount: Optional[float] = None
    payment_method: str = "Cash on Delivery"

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    items_json: str
    items: List[OrderItemBrief] = []
    total_amount: float
    payment_method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedOrdersResponse(BaseModel):
    items: List[OrderResponse]
    total: int
    page: int
    limit: int
    pages: int

# ----------------- Dashboard & Analytics Schemas -----------------
class MonthlyRevenueItem(BaseModel):
    month: str
    revenue: float
    orders_count: int

class OrderStatusCount(BaseModel):
    status: str
    count: int

class TopSellingBook(BaseModel):
    book_id: int
    title: str
    cover_image: Optional[str] = None
    units_sold: int
    total_revenue: float

class DashboardStats(BaseModel):
    total_books: int
    published_books: int
    draft_books: int
    total_authors: int
    total_categories: int
    total_publishers: int
    total_orders: int = 0
    total_revenue: float = 0.0
    pending_orders: int = 0
    processing_orders: int = 0
    completed_orders: int = 0
    cancelled_orders: int = 0
    recently_added_books: List[BookResponse] = []
    featured_books: List[BookResponse] = []
    recent_activity: List[ActivityLogResponse] = []

class DashboardAnalytics(BaseModel):
    monthly_revenue: List[MonthlyRevenueItem] = []
    order_status_distribution: List[OrderStatusCount] = []
    top_selling_books: List[TopSellingBook] = []
    recent_orders: List[OrderResponse] = []

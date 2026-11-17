from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Table
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

# Association table for Book <-> Author (Many-to-Many)
book_authors = Table(
    "book_authors",
    Base.metadata,
    Column("book_id", Integer, ForeignKey("books.id", ondelete="CASCADE"), primary_key=True),
    Column("author_id", Integer, ForeignKey("authors.id", ondelete="CASCADE"), primary_key=True)
)

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    profile_picture = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    books = relationship("Book", secondary=book_authors, back_populates="authors")

class Publisher(Base):
    __tablename__ = "publishers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    logo_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    books = relationship("Book", back_populates="publisher")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    parent_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    subcategories = relationship("Category", backref="parent", remote_side=[id])
    books = relationship("Book", foreign_keys="[Book.category_id]", back_populates="category")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    # Basic Information
    title = Column(String(300), nullable=False, index=True)
    subtitle = Column(String(300), nullable=True)
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    cover_image = Column(Text, nullable=True)
    additional_images = Column(Text, nullable=True, default="[]")  # JSON encoded list of URLs

    # Publication Details
    isbn = Column(String(50), nullable=True, index=True)
    edition = Column(String(100), nullable=True)
    publication_year = Column(Integer, nullable=True)
    publisher_id = Column(Integer, ForeignKey("publishers.id", ondelete="SET NULL"), nullable=True)
    pages = Column(Integer, nullable=True)
    language = Column(String(50), default="English")
    book_format = Column(String(50), default="Paperback")  # Paperback, Hardcover, E-Book
    subject = Column(String(200), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    subcategory_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)

    # Pricing
    selling_price = Column(Float, nullable=False, default=0.0)
    mrp = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="INR")

    # Publishing Options
    is_draft = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    availability_status = Column(String(50), default="in_stock")  # in_stock, out_of_stock, pre_order
    seo_title = Column(String(300), nullable=True)
    seo_description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    authors = relationship("Author", secondary=book_authors, back_populates="books")
    publisher = relationship("Publisher", back_populates="books")
    category = relationship("Category", foreign_keys=[category_id], back_populates="books")
    subcategory = relationship("Category", foreign_keys=[subcategory_id])

class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    mime_type = Column(String(100), nullable=False)
    category = Column(String(50), default="covers")  # covers, authors, banners, general
    created_at = Column(DateTime, default=datetime.utcnow)

class LandingPage(Base):
    __tablename__ = "landing_pages"

    id = Column(Integer, primary_key=True, default=1)
    hero_heading = Column(String(300), default="Advancing Knowledge Through Academic Excellence")
    hero_description = Column(Text, default="Dotcom Publications brings you peer-reviewed academic textbooks, monographs, and educational resources trusted by leading institutions and scholars worldwide.")
    hero_image = Column(Text, nullable=True)
    featured_book_ids = Column(Text, default="[]")  # JSON list of book IDs
    latest_publications = Column(Text, default="[]")  # JSON list of book IDs
    popular_categories = Column(Text, default="[]")  # JSON list of category IDs
    about_title = Column(String(300), default="About Dotcom Publications")
    about_description = Column(Text, default="Established as a premier academic imprint, Dotcom Publications is dedicated to high-calibre pedagogical literature, cutting-edge scholarly research, and empowering students and researchers across disciplines.")
    about_stats = Column(Text, default='[{"label":"Published Titles","value":"500+"},{"label":"Contributing Scholars","value":"180+"},{"label":"Partner Universities","value":"65+"},{"label":"Global Readers","value":"250K+"}]')
    contact_email = Column(String(255), default="editor@dotcompublications.com")
    contact_phone = Column(String(100), default="+91 11 4567 8900")
    contact_address = Column(Text, default="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India")
    footer_text = Column(Text, default="© 2026 Dotcom Publications. Developed with pride by TL Technologics. All Rights Reserved.")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, default=1)
    company_name = Column(String(255), default="Dotcom Publications")
    logo_url = Column(Text, nullable=True)
    description = Column(Text, default="Educational and Academic Book Publisher")
    contact_email = Column(String(255), default="contact@dotcompublications.com")
    phone = Column(String(100), default="+91 11 4567 8900")
    address = Column(Text, default="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India")
    social_links = Column(Text, default='{"twitter":"https://twitter.com/dotcombooks","linkedin":"https://linkedin.com/company/dotcom-publications","facebook":"https://facebook.com/dotcombooks","instagram":"https://instagram.com/dotcombooks"}')
    currency = Column(String(10), default="INR")
    catalogue_download_url = Column(Text, nullable=True)
    maintenance_mode = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String(50), nullable=False)  # "create", "update", "delete", "publish", "unpublish"
    entity_type = Column(String(50), nullable=False)  # "book", "author", "category", "publisher", "landing", "settings"
    entity_id = Column(Integer, nullable=True)
    entity_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

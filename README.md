# Dotcom Publications — Admin Panel & Content Management System
**Client:** Dotcom Publications  
**Developed by:** TL Technologics  
**Phase:** 01 — Admin Panel & Catalogue Management Platform  

---

## 1. Overview & Architecture

Dotcom Publications is an educational and academic publishing house. This platform serves as the central administrative cockpit for managing the catalogue of monographs, textbooks, academic authors, subject disciplines, publishers, media library, and the public-facing homepage content.

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** FastAPI (Python), SQLAlchemy, Pydantic v2, Uvicorn
- **Database:** PostgreSQL (production ready via `DATABASE_URL` environment variable) with zero-friction SQLite fallback for local development
- **Media Storage:** Abstracted upload and asset management service (`/uploads/`) compatible with Supabase Storage / S3 / local disk.

---

## 2. Directory Structure

```
dotcom-publication/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dashboard.py     # Live derived statistics & activity logs
│   │   │   ├── books.py         # Full CRUD, filtering, search, toggle publish
│   │   │   ├── authors.py       # Faculty & author profiles & bibliographies
│   │   │   ├── categories.py    # Hierarchical disciplines & taxonomy
│   │   │   ├── publishers.py    # Academic press imprints & contacts
│   │   │   ├── media.py         # Centralized media asset management
│   │   │   ├── landing.py       # Dynamic landing page content CMS
│   │   │   └── settings.py      # System settings & configuration
│   │   ├── core/
│   │   │   ├── config.py        # Settings & environment variables
│   │   │   └── database.py      # SQLAlchemy session and engine
│   │   ├── models/
│   │   │   └── models.py        # Relational models & M2M relationships
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic v2 request/response schemas
│   │   ├── seed_data.py         # Realistic academic demonstration dataset
│   │   └── main.py              # FastAPI application & startup seeder
│   ├── uploads/                 # Stored images and book covers
│   ├── requirements.txt
│   └── run.py                   # Backend entry point (port 8000)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, TopNav, responsive Layout
│   │   │   ├── ui/              # Button, Input, Select, Modal, Badge, Pagination, etc.
│   │   │   ├── books/           # 5-section BookFormModal, BookPreviewModal
│   │   │   ├── authors/         # AuthorFormModal, AuthorDetailModal
│   │   │   ├── categories/      # CategoryFormModal
│   │   │   ├── publishers/      # PublisherFormModal
│   │   │   ├── media/           # MediaPickerModal
│   │   │   └── landing/         # LandingPreviewModal (Live Public Site Preview)
│   │   ├── context/             # Toast notification provider
│   │   ├── pages/               # 8 Core Modules (Dashboard, Books, Authors, Categories, etc.)
│   │   ├── services/            # API client
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 3. Running Locally

### Step 1: Start Backend (FastAPI)
```bash
# In the project root:
python backend/run.py
```
*The backend automatically creates tables and seeds realistic academic monographs, faculty authors, and disciplines upon first boot. API docs will be available at `http://127.0.0.1:8000/docs`.*

### Step 2: Start Frontend (React + Vite)
```bash
# In another terminal:
cd frontend
npm run dev
```
*Access the Admin Panel in your browser at `http://localhost:5173`.*

---

## 4. Phase 1 Features Implemented

1. **Publishing Executive Dashboard:**
   - Real dynamic counters derived from underlying data (Total Books, Published Titles, In-Review Drafts, Authors, Disciplines).
   - Section A: Recently Added Books with quick preview.
   - Section B: Featured Academic Titles spotlight.
   - Section C: Recent administrative editorial activity log.
   - Section D: Quick Action launchers.

2. **Book Management (Core Module):**
   - Professional data table with cover jackets, ISBNs, dual prices (Selling Price & MRP with auto-calculated savings %), discipline badges, and publication status toggles.
   - Instant search across title, ISBN, author, and subject.
   - Multi-criteria filtering by discipline, author, and status.
   - Sorting by Date Added, Title (A-Z), and Price.
   - Pagination controls.
   - **5-Section Form:**
     * **Section A:** Title, Subtitle, Short Synopsis, Full Description, Cover Image Picker, Additional Images.
     * **Section B:** Author selector with multi-authorship support + "+ Create New Author" without leaving the form.
     * **Section C:** ISBN, Edition, Year, Publisher Imprint, Pages, Language, Format, Subject tags, Category & Subcategory.
     * **Section D:** Selling Price (INR), MRP, auto-computed discount %, Currency.
     * **Section E:** Draft/Published status, Featured toggle, Warehouse availability, SEO Title & Meta Description.
     * **Actions:** Save as Draft, Preview, Publish Book.

3. **Author Management:**
   - Faculty member profiles with portrait photo, research bio, email, and personal academic websites.
   - Modal to view all books associated with an author.

4. **Category & Discipline Management:**
   - Full parent-child hierarchy support (Root disciplines & specialized subcategories).
   - Book counts and clean URL slug identifiers.

5. **Publisher Imprint Management:**
   - Manage university presses and co-publishing partners with logos, office addresses, contact emails, and phone numbers.

6. **Centralized Media Library:**
   - Upload new image assets (covers, portraits, banners).
   - Filter by media type, preview in lightbox, copy URL to clipboard, and delete assets.
   - Directly integrate media picker into all book, author, and landing page forms.

7. **Landing Page CMS & Live Preview:**
   - Configure Hero headline, description, and hero banner.
   - Select which monographs appear in the featured showcase.
   - Select highlighted disciplines.
   - Editable institutional narrative and impact statistics.
   - **Live Website Preview Modal:** Authentic interactive preview of how public visitors experience `dotcompublications.com`.

8. **System & Publisher Settings:**
   - Manage corporate legal entity name, logos, contact routing, social profiles (Twitter, LinkedIn, Facebook, Instagram), currency, catalogue download link, and maintenance mode toggle.

---

## 5. Phase 2 Scalability (Public-Facing Website)

All models and API endpoints are designed so that Phase 2 (the public book catalogue, visitor search, discipline browser, and author portfolios) consumes the identical database and endpoints (`/api/books`, `/api/authors`, `/api/landing`, etc.) without schema duplication.

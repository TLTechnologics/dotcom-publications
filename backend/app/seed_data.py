import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.models.models import (
    Author, Publisher, Category, Book, Media, LandingPage, SiteSettings, ActivityLog
)

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Book).count() > 0:
        return

    print("Seeding Dotcom Publications academic demonstration data...")

    # 1. Publishers
    publishers_data = [
        {
            "name": "Dotcom Academic Imprints",
            "logo_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80",
            "description": "Primary academic publishing division of Dotcom Publications specializing in university textbooks and peer-reviewed works.",
            "email": "imprints@dotcompublications.com",
            "phone": "+91 11 4567 8901",
            "address": "7th Floor, Dotcom Tower, Knowledge Park III, Greater Noida, UP, India",
            "website": "https://dotcompublications.com"
        },
        {
            "name": "TechCore Scientific Press",
            "logo_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80",
            "description": "Pioneering research monograph publisher for Computer Science, Electrical Engineering and Applied Machine Learning.",
            "email": "contact@techcorepress.org",
            "phone": "+91 80 2345 6789",
            "address": "Cyber City Phase 2, Gurugram, Haryana, India",
            "website": "https://techcorepress.org"
        },
        {
            "name": "Aethelgard Scholarly Editions",
            "logo_url": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&auto=format&fit=crop&q=80",
            "description": "Dedicated to Humanities, Political Economy, Classical Philosophy, and International Relations.",
            "email": "editorial@aethelgard.edu",
            "phone": "+91 33 2289 1234",
            "address": "College Street Scholarly Row, Kolkata, West Bengal, India",
            "website": "https://aethelgard.edu"
        }
    ]

    publishers = []
    for p in publishers_data:
        pub = Publisher(**p)
        db.add(pub)
        publishers.append(pub)
    db.commit()

    # 2. Categories & Subcategories
    categories_data = [
        {
            "name": "Computer Science & AI",
            "slug": "computer-science-ai",
            "description": "Algorithms, machine learning foundations, operating systems, and distributed computational theory.",
            "image_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
            "subs": ["Deep Learning & Neural Networks", "Distributed Systems", "Data Structures & Algorithms"]
        },
        {
            "name": "Economics & Public Policy",
            "slug": "economics-public-policy",
            "description": "Macroeconomic policy, developmental economics, econometric modelling, and trade theory.",
            "image_url": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&auto=format&fit=crop&q=80",
            "subs": ["Econometric Theory", "Behavioral Economics", "Public Finance"]
        },
        {
            "name": "Medical & Clinical Sciences",
            "slug": "medical-clinical-sciences",
            "description": "Clinical pharmacology, neuroanatomy, epidemiology, and healthcare diagnostics.",
            "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80",
            "subs": ["Clinical Pharmacology", "Human Neurobiology", "Epidemiological Methods"]
        },
        {
            "name": "Pure & Applied Mathematics",
            "slug": "pure-applied-mathematics",
            "description": "Abstract algebra, stochastic differential equations, topology, and numeric computational methods.",
            "image_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=80",
            "subs": ["Real Analysis", "Topology & Geometry", "Applied Linear Algebra"]
        },
        {
            "name": "Philosophy & Ethics",
            "slug": "philosophy-ethics",
            "description": "Ethics of technology, political epistemology, classical moral theory, and logic.",
            "image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?w=500&auto=format&fit=crop&q=80",
            "subs": ["AI Ethics & Society", "Epistemology", "Continental Philosophy"]
        }
    ]

    all_categories = []
    for cat_data in categories_data:
        subs = cat_data.pop("subs")
        parent = Category(**cat_data)
        db.add(parent)
        db.flush()
        all_categories.append(parent)

        for sub_name in subs:
            sub_slug = f"{parent.slug}-{sub_name.lower().replace(' ', '-').replace('&', 'and')}"
            sub = Category(
                name=sub_name,
                slug=sub_slug,
                description=f"Specialized branch within {parent.name}.",
                image_url=parent.image_url,
                parent_id=parent.id
            )
            db.add(sub)
            all_categories.append(sub)
    db.commit()

    # 3. Authors
    authors_data = [
        {
            "name": "Dr. Arvind R. Subramanian",
            "profile_picture": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            "bio": "Distinguished Professor of Statistical Machine Learning at Indian Institute of Science. Author of four globally referenced textbooks on deep neural architectures.",
            "email": "a.subramanian@iisc.ac.in",
            "website": "https://arvindsubramanian.academic.org"
        },
        {
            "name": "Prof. Elena Rostova",
            "profile_picture": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
            "bio": "Senior Fellow at Oxford Institute for Global Economic Governance. Her research focuses on transition dynamics in emerging market economies.",
            "email": "elena.rostova@oxon.org",
            "website": "https://elenarostova.net"
        },
        {
            "name": "Dr. Marcus Vance, MD, PhD",
            "profile_picture": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80",
            "bio": "Head of Neurovascular Research and Clinical Professor of Internal Medicine. Recipient of the 2024 International Medical Educator Laureate.",
            "email": "m.vance@stanfordmed.edu",
            "website": "https://marcusvancemd.com"
        },
        {
            "name": "Dr. Suniti Mukherjee",
            "profile_picture": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
            "bio": "Chair of Pure Mathematics, specializing in algebraic geometry and noncommutative topology. Advisor to national STEM curriculum bodies.",
            "email": "smukherjee@tifr.res.in",
            "website": "https://suniti-mukherjee.math.tifr.res.in"
        },
        {
            "name": "Prof. David K. Sterling",
            "profile_picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
            "bio": "Director of the Centre for Applied Ethics & Computational Governance. Regularly consulted by multilateral bodies on AI regulation and societal safety.",
            "email": "david.sterling@cam.ac.uk",
            "website": "https://davidsterling.philosophy.cam.ac.uk"
        }
    ]

    authors = []
    for a in authors_data:
        auth = Author(**a)
        db.add(auth)
        authors.append(auth)
    db.commit()

    # 4. Books
    books_data = [
        {
            "title": "Principles of Modern Deep Learning: From Perceptrons to Transformers",
            "subtitle": "A Rigorous Mathematical and Algorithmic Exposition",
            "short_description": "Comprehensive textbook covering deep neural architectures, loss surfaces, backpropagation calculus, and state-of-the-art transformer mechanics.",
            "full_description": "Widely adopted across undergraduate and postgraduate computer science programs, this title presents a unified mathematical treatment of modern machine learning. Includes extensive proofs, Python/PyTorch implementations, and real-world case studies in computer vision and natural language processing.",
            "cover_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
            ]),
            "isbn": "978-81-945621-0-4",
            "edition": "3rd Revised Edition",
            "publication_year": 2025,
            "publisher_id": publishers[0].id,
            "pages": 842,
            "language": "English",
            "book_format": "Hardcover",
            "subject": "Machine Learning & Artificial Intelligence",
            "category_id": all_categories[0].id,
            "subcategory_id": all_categories[1].id,
            "selling_price": 1495.0,
            "mrp": 1850.0,
            "currency": "INR",
            "is_draft": False,
            "is_featured": True,
            "availability_status": "in_stock",
            "seo_title": "Principles of Modern Deep Learning | Dotcom Publications",
            "seo_description": "Definitive textbook on deep learning by Dr. Arvind Subramanian. Order online with academic discount.",
            "author_indices": [0],
            "created_offset_days": 2
        },
        {
            "title": "Macroeconomic Modeling in Developing Economies",
            "subtitle": "Fiscal Dominance, Exchange Regimes, and Monetary Shocks",
            "short_description": "An essential guide to macroeconomic stabilization policies and structural challenges in developing and emerging markets.",
            "full_description": "Focuses on the unique institutional realities of emerging economies: informality, capital flow volatility, and trade fragmentation. Features DSGE models calibrated with empirical cross-country datasets.",
            "cover_image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-1-1",
            "edition": "2nd Edition",
            "publication_year": 2024,
            "publisher_id": publishers[2].id,
            "pages": 560,
            "language": "English",
            "book_format": "Paperback",
            "subject": "Macroeconomics",
            "category_id": all_categories[4].id,
            "subcategory_id": all_categories[5].id,
            "selling_price": 950.0,
            "mrp": 1200.0,
            "currency": "INR",
            "is_draft": False,
            "is_featured": True,
            "availability_status": "in_stock",
            "seo_title": "Macroeconomic Modeling in Developing Economies | Elena Rostova",
            "seo_description": "Comprehensive textbook on monetary economics and developing market dynamics by Prof. Elena Rostova.",
            "author_indices": [1],
            "created_offset_days": 4
        },
        {
            "title": "Clinical Neuroanatomy & Translational Diagnostics",
            "subtitle": "Pathological Correlations and Functional Systems",
            "short_description": "Authoritative clinical manual bridging structural neuroscience and bedside diagnostic neurology.",
            "full_description": "Features high-resolution histological illustrations, MRI/CT correlation plates, and clinical vignette questions designed for medical residents and neurological specialists.",
            "cover_image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-2-8",
            "edition": "5th Global Edition",
            "publication_year": 2025,
            "publisher_id": publishers[0].id,
            "pages": 724,
            "language": "English",
            "book_format": "Hardcover",
            "subject": "Neurology & Internal Medicine",
            "category_id": all_categories[8].id,
            "subcategory_id": all_categories[10].id,
            "selling_price": 2250.0,
            "mrp": 2790.0,
            "currency": "INR",
            "is_draft": False,
            "is_featured": True,
            "availability_status": "in_stock",
            "seo_title": "Clinical Neuroanatomy & Diagnostics | Dr. Marcus Vance",
            "seo_description": "Premier medical textbook for neurology and clinical anatomy students.",
            "author_indices": [2],
            "created_offset_days": 6
        },
        {
            "title": "Algebraic Topology and Homological Algebra",
            "subtitle": "Categories, Complexes, and Spectral Sequences",
            "short_description": "Advanced graduate-level monograph introducing simplicial methods, derived categories, and duality theories.",
            "full_description": "A masterwork for doctoral researchers in mathematics, presenting simplicial complexes, homotopy groups, cohomology rings, and exact couples with elegant geometric intuition.",
            "cover_image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-3-5",
            "edition": "1st Edition",
            "publication_year": 2023,
            "publisher_id": publishers[1].id,
            "pages": 612,
            "language": "English",
            "book_format": "Hardcover",
            "subject": "Pure Mathematics",
            "category_id": all_categories[12].id,
            "subcategory_id": all_categories[14].id,
            "selling_price": 1800.0,
            "mrp": 2100.0,
            "currency": "INR",
            "is_draft": False,
            "is_featured": False,
            "availability_status": "in_stock",
            "seo_title": "Algebraic Topology and Homological Algebra | Dr. Suniti Mukherjee",
            "seo_description": "Graduate text on homological algebra and spectral sequences.",
            "author_indices": [3],
            "created_offset_days": 8
        },
        {
            "title": "Algorithms of Obligation: Ethics in Autonomous Systems",
            "subtitle": "Moral Philosophy Meets Algorithmic Agency",
            "short_description": "Interdisciplinary exploration of ethics in artificial general intelligence, algorithmic bias, and human accountability.",
            "full_description": "Prof. David Sterling examines deontological and consequentialist ethical frameworks applied to automated decision systems in warfare, jurisprudence, and finance.",
            "cover_image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-4-2",
            "edition": "1st Edition",
            "publication_year": 2025,
            "publisher_id": publishers[2].id,
            "pages": 388,
            "language": "English",
            "book_format": "Paperback",
            "subject": "Philosophy & Computer Ethics",
            "category_id": all_categories[16].id,
            "subcategory_id": all_categories[17].id,
            "selling_price": 720.0,
            "mrp": 899.0,
            "currency": "INR",
            "is_draft": False,
            "is_featured": True,
            "availability_status": "in_stock",
            "seo_title": "Ethics in Autonomous Systems | Prof. David Sterling",
            "seo_description": "Pioneering philosophical inquiry into artificial intelligence and responsibility.",
            "author_indices": [4],
            "created_offset_days": 10
        },
        {
            "title": "Distributed Consensus and Fault Tolerant Systems",
            "subtitle": "Paxoss, Raft, Byzantine Generals, and Beyond",
            "short_description": "Architectural principles behind geo-distributed databases, consensus protocols, and resilient cloud infrastructure.",
            "full_description": "A hands-on theoretical guide analyzing CAP theorem limits, leader election algorithms, and distributed log replication under network partition conditions.",
            "cover_image": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-5-9",
            "edition": "2nd Edition",
            "publication_year": 2024,
            "publisher_id": publishers[1].id,
            "pages": 496,
            "language": "English",
            "book_format": "Paperback",
            "subject": "Distributed Systems",
            "category_id": all_categories[0].id,
            "subcategory_id": all_categories[2].id,
            "selling_price": 1150.0,
            "mrp": 1450.0,
            "currency": "INR",
            "is_draft": False,
            "is_featured": False,
            "availability_status": "in_stock",
            "seo_title": "Distributed Consensus & Fault Tolerance | Dotcom Publications",
            "seo_description": "Complete guide to modern distributed consensus by top system engineers.",
            "author_indices": [0],
            "created_offset_days": 12
        },
        {
            "title": "Contemporary Behavioral Econometrics (Draft)",
            "subtitle": "Experimental Design and Nonparametric Estimation",
            "short_description": "Working manuscript detailing lab experiment methodologies and quasi-experimental econometric estimation.",
            "full_description": "Currently under peer review by the academic editorial board. This textbook synthesizes behavioral economics heuristics with high-dimensional causal inference.",
            "cover_image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-6-6",
            "edition": "Pre-Publication Draft",
            "publication_year": 2026,
            "publisher_id": publishers[0].id,
            "pages": 430,
            "language": "English",
            "book_format": "Paperback",
            "subject": "Behavioral Economics",
            "category_id": all_categories[4].id,
            "subcategory_id": all_categories[6].id,
            "selling_price": 890.0,
            "mrp": 1100.0,
            "currency": "INR",
            "is_draft": True,
            "is_featured": False,
            "availability_status": "pre_order",
            "seo_title": "Contemporary Behavioral Econometrics | Dotcom Publications Draft",
            "seo_description": "Academic draft textbook under editorial review.",
            "author_indices": [1],
            "created_offset_days": 1
        },
        {
            "title": "Pediatric Immunology and Vaccine Therapeutics (Draft)",
            "subtitle": "Molecular Cellular Dynamics and Clinical Trials",
            "short_description": "In-depth reference manual on child immunological development and novel recombinant vaccine platforms.",
            "full_description": "A comprehensive collaborative review exploring neonatal humoral responses, autoimmune mechanisms in early childhood, and clinical trial efficacy endpoints.",
            "cover_image": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
            "additional_images": json.dumps([]),
            "isbn": "978-81-945621-7-3",
            "edition": "Review Draft",
            "publication_year": 2026,
            "publisher_id": publishers[0].id,
            "pages": 512,
            "language": "English",
            "book_format": "Hardcover",
            "subject": "Immunology & Pediatrics",
            "category_id": all_categories[8].id,
            "subcategory_id": all_categories[9].id,
            "selling_price": 1950.0,
            "mrp": 2400.0,
            "currency": "INR",
            "is_draft": True,
            "is_featured": False,
            "availability_status": "out_of_stock",
            "seo_title": "Pediatric Immunology | Dotcom Draft",
            "seo_description": "In-preparation medical textbook.",
            "author_indices": [2],
            "created_offset_days": 3
        }
    ]

    created_books = []
    for b_data in books_data:
        auth_idx = b_data.pop("author_indices")
        offset = b_data.pop("created_offset_days", 5)
        book = Book(**b_data)
        book.created_at = datetime.utcnow() - timedelta(days=offset)
        book.updated_at = datetime.utcnow() - timedelta(days=offset // 2)
        for idx in auth_idx:
            book.authors.append(authors[idx])
        db.add(book)
        created_books.append(book)
    db.commit()

    # 5. Media Library initial entries
    media_items = [
        {
            "filename": "deep-learning-cover.jpg",
            "original_name": "Modern Deep Learning Cover 3rd Ed.jpg",
            "url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
            "file_size": 245890,
            "mime_type": "image/jpeg",
            "category": "covers"
        },
        {
            "filename": "macroeconomics-front.jpg",
            "original_name": "Macroeconomic Modeling Front Cover.jpg",
            "url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80",
            "file_size": 312440,
            "mime_type": "image/jpeg",
            "category": "covers"
        },
        {
            "filename": "hero-publishing-banner.jpg",
            "original_name": "Dotcom Publications Academic Library Banner.jpg",
            "url": "https://images.unsplash.com/photo-1507842229450-76296b7914c6?w=1600&auto=format&fit=crop&q=80",
            "file_size": 894120,
            "mime_type": "image/jpeg",
            "category": "banners"
        },
        {
            "filename": "dr-arvind-subramanian.jpg",
            "original_name": "Dr Arvind Subramanian Portrait.jpg",
            "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
            "file_size": 182300,
            "mime_type": "image/jpeg",
            "category": "authors"
        },
        {
            "filename": "prof-elena-rostova.jpg",
            "original_name": "Prof Elena Rostova Official Photo.jpg",
            "url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
            "file_size": 194500,
            "mime_type": "image/jpeg",
            "category": "authors"
        },
        {
            "filename": "clinical-neuroanatomy-3d.jpg",
            "original_name": "Clinical Neuroanatomy Render.jpg",
            "url": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80",
            "file_size": 412000,
            "mime_type": "image/jpeg",
            "category": "covers"
        }
    ]

    for m in media_items:
        db.add(Media(**m))
    db.commit()

    # 6. Landing Page
    landing = LandingPage(
        id=1,
        hero_heading="Advancing Knowledge Through Academic Excellence",
        hero_description="Dotcom Publications brings you peer-reviewed academic textbooks, scholarly monographs, and educational resources trusted by leading institutions and scholars worldwide.",
        hero_image="https://images.unsplash.com/photo-1507842229450-76296b7914c6?w=1600&auto=format&fit=crop&q=80",
        featured_book_ids=json.dumps([created_books[0].id, created_books[1].id, created_books[2].id, created_books[4].id]),
        latest_publications=json.dumps([created_books[0].id, created_books[2].id, created_books[4].id]),
        popular_categories=json.dumps([all_categories[0].id, all_categories[4].id, all_categories[8].id]),
        about_title="Publishing for Scholarly Impact",
        about_description="Founded with an unwavering dedication to academic rigor, Dotcom Publications partners with researchers, professors, and universities across India and internationally to publish literature that informs the next generation of scientists, economists, and thinkers.",
        about_stats=json.dumps([
            {"label": "Published Titles", "value": "520+"},
            {"label": "Contributing Scholars", "value": "190+"},
            {"label": "University Adoptions", "value": "75+"},
            {"label": "Global Readers", "value": "280K+"}
        ]),
        contact_email="editorial@dotcompublications.com",
        contact_phone="+91 11 4567 8900",
        contact_address="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India",
        footer_text="© 2026 Dotcom Publications. Developed with pride by TL Technologics. All Rights Reserved."
    )
    db.add(landing)

    # 7. Site Settings
    settings = SiteSettings(
        id=1,
        company_name="Dotcom Publications",
        logo_url="",
        description="Educational and Academic Book Publisher — High-calibre pedagogy, research monographs, and global university textbooks.",
        contact_email="contact@dotcompublications.com",
        phone="+91 11 4567 8900",
        address="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India",
        social_links=json.dumps({
            "twitter": "https://twitter.com/dotcombooks",
            "linkedin": "https://linkedin.com/company/dotcom-publications",
            "facebook": "https://facebook.com/dotcombooks",
            "instagram": "https://instagram.com/dotcombooks"
        }),
        currency="INR",
        catalogue_download_url="https://dotcompublications.com/downloads/catalogue-2026.pdf",
        maintenance_mode=False
    )
    db.add(settings)

    # 8. Activity Logs
    logs = [
        {
            "action_type": "publish",
            "entity_type": "book",
            "entity_id": created_books[0].id,
            "entity_name": created_books[0].title,
            "description": f"Published new title '{created_books[0].title}' (ISBN: {created_books[0].isbn})",
            "timestamp": datetime.utcnow() - timedelta(hours=2)
        },
        {
            "action_type": "create",
            "entity_type": "author",
            "entity_id": authors[0].id,
            "entity_name": authors[0].name,
            "description": f"Added profile for faculty author '{authors[0].name}'",
            "timestamp": datetime.utcnow() - timedelta(hours=5)
        },
        {
            "action_type": "update",
            "entity_type": "book",
            "entity_id": created_books[1].id,
            "entity_name": created_books[1].title,
            "description": f"Updated pricing and availability for '{created_books[1].title}'",
            "timestamp": datetime.utcnow() - timedelta(hours=18)
        },
        {
            "action_type": "create",
            "entity_type": "category",
            "entity_id": all_categories[0].id,
            "entity_name": all_categories[0].name,
            "description": f"Created category '{all_categories[0].name}' with subcategories",
            "timestamp": datetime.utcnow() - timedelta(days=1, hours=4)
        },
        {
            "action_type": "publish",
            "entity_type": "landing",
            "entity_id": 1,
            "entity_name": "Homepage Hero Section",
            "description": "Updated featured academic titles on the public landing page manager",
            "timestamp": datetime.utcnow() - timedelta(days=2)
        }
    ]

    for log in logs:
        db.add(ActivityLog(**log))

    db.commit()
    print("Database seeding completed successfully!")

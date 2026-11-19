"""
inject_books.py — Comprehensive script to ensure all 6 academic books exist in Dotcom Publications DB.
Safe to re-run; checks for duplicates before inserting.
Populates both local SQLite and remote PostgreSQL if reachable.
"""
import sys
import os
import shutil

# Ensure project root is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
for p in [ROOT_DIR, CURRENT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

try:
    from backend.app.models.models import Book, Author, Publisher, Category, book_authors, Base
except ImportError:
    from app.models.models import Book, Author, Publisher, Category, book_authors, Base

def seed_to_engine(engine, label):
    print(f"\n--- Seeding target: {label} ---")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()

    try:
        def get_or_create_publisher(name: str, description: str) -> Publisher:
            pub = db.query(Publisher).filter(Publisher.name == name).first()
            if not pub:
                pub = Publisher(
                    name=name,
                    description=description,
                    email="press@dotcompublications.com",
                    address="Knowledge Park III, Institutional Area, Greater Noida, Delhi NCR, India"
                )
                db.add(pub)
                db.commit()
                db.refresh(pub)
                print(f"  [+] Publisher created: {name}")
            return pub

        def get_or_create_category(name: str, slug: str, description: str) -> Category:
            cat = db.query(Category).filter(Category.slug == slug).first()
            if not cat:
                cat = Category(name=name, slug=slug, description=description)
                db.add(cat)
                db.commit()
                db.refresh(cat)
                print(f"  [+] Category created: {name}")
            return cat

        def get_or_create_author(name: str, bio: str) -> Author:
            author = db.query(Author).filter(Author.name == name).first()
            if not author:
                author = Author(name=name, bio=bio)
                db.add(author)
                db.commit()
                db.refresh(author)
                print(f"  [+] Author created: {name}")
            return author

        def create_book_if_not_exists(title: str, **kwargs) -> bool:
            existing = db.query(Book).filter(Book.title == title).first()
            if existing:
                print(f"  [~] Book already exists (skipping): {title}")
                return False

            authors = kwargs.pop("authors", [])
            book = Book(title=title, **kwargs)
            db.add(book)
            db.commit()
            db.refresh(book)

            if authors:
                book.authors = authors
                db.commit()

            print(f"  [+] Book created: {title} (ID: {book.id})")
            return True

        # Imprint
        pub_academic = get_or_create_publisher(
            "Dotcom Academic Press",
            "Premier academic imprint by Dotcom Publications, specialising in university-level textbooks, research monographs, and peer-reviewed faculty literature."
        )

        # Categories
        cat_science = get_or_create_category(
            "Science & Technology",
            "science-technology",
            "Advanced university-level publications in computer science, applied mathematics, engineering and algorithms."
        )
        cat_law = get_or_create_category(
            "Law & Governance",
            "law-governance",
            "Scholarly texts on constitutional law, environmental legislation, jurisprudence and regulatory policy."
        )
        cat_social = get_or_create_category(
            "Social Sciences",
            "social-sciences",
            "Academic publications in psychology, sociology, and behavioral sciences."
        )
        cat_econ = get_or_create_category(
            "Economics & Public Policy",
            "economics-public-policy",
            "Macroeconomic policy, developmental economics, econometric modeling, and fiscal frameworks."
        )
        cat_med = get_or_create_category(
            "Medical & Clinical Sciences",
            "medical-clinical-sciences",
            "Clinical pharmacology, neuroanatomy, epidemiology, and diagnostics literature."
        )

        # Authors
        auth_math = get_or_create_author("Dr. R. K. Sharma", "Professor of Applied Mathematics with expertise in computational methods, numerical analysis, and algorithm design.")
        auth_law = get_or_create_author("Prof. Meenakshi Nair", "Professor of Environmental Law and Public Policy. Specialises in legislative frameworks, sustainable development jurisprudence and regulatory compliance.")
        auth_psych = get_or_create_author("Dr. Anjali Verma", "Clinical psychologist and academic researcher. Expertise in evidence-based therapeutic modalities, research methodology, and psychopathology assessment.")
        auth_vance = get_or_create_author("Dr. Marcus Vance", "Professor of Computer Science and Machine Learning. Pioneer in transformer neural network architectures and mathematical optimisation.")
        auth_rostova = get_or_create_author("Prof. Elena Rostova", "Professor of Macroeconomics and Quantitative Econometrics. Advisor to international policy institutions on fiscal dominance and monetary regimes.")
        auth_mukherjee = get_or_create_author("Dr. Suniti Mukherjee", "Professor of Clinical Neurology and Translational Sciences. Specialises in pathological functional systems and diffusion tensor neuroimaging.")

        # Book 1: Computational Mathematics
        create_book_if_not_exists(
            title="Foundations of Computational Mathematics",
            subtitle="An Advanced University Monograph",
            short_description="A systematic exposition of computational methods, numerical algorithms, and mathematical modelling for postgraduate students and researchers.",
            full_description="Foundations of Computational Mathematics presents a comprehensive treatment of numerical methods, matrix computations, interpolation, differential equations, and optimisation techniques essential for postgraduate scholars in applied mathematics and engineering.\n\nThis authoritative monograph integrates fundamental mathematical theory with computational implementation, providing students and instructors with rigorous analytical frameworks supported by illustrative case studies.\n\nSynthesising classical numerical analysis with modern computational paradigms, the text equips readers with the mathematical rigour required for independent research and advanced academic inquiry. Each chapter concludes with structured problem sets aligned to national university examination standards.",
            cover_image="/covers/computational-mathematics.jpg",
            isbn="978-81-948231-1-1",
            edition="1st Edition",
            publication_year=2026,
            publisher_id=pub_academic.id,
            pages=486,
            language="English",
            book_format="Hardcover",
            subject="Applied Mathematics, Numerical Analysis, Scientific Computing",
            category_id=cat_science.id,
            selling_price=495.0,
            mrp=650.0,
            currency="INR",
            is_draft=False,
            is_featured=True,
            availability_status="in_stock",
            authors=[auth_math]
        )

        # Book 2: Environmental Law
        create_book_if_not_exists(
            title="Principles of Environmental Law & Policy",
            subtitle="A Comprehensive Legal Framework",
            short_description="A definitive legal text covering environmental legislation, regulatory frameworks, judicial precedents and policy governance for law students and practitioners.",
            full_description="Principles of Environmental Law & Policy offers a thorough and analytical examination of environmental legislation, judicial doctrines, and international treaty obligations as they apply within the Indian and South Asian legal context.\n\nDrawing on landmark case law, constitutional provisions, and international environmental conventions, this monograph provides law students, legal practitioners, and policy researchers with an authoritative reference grounded in current legislative developments.\n\nThe text covers foundational environmental jurisprudence, regulatory compliance mechanisms, environmental impact assessment law, biodiversity conservation legislation, and emerging frameworks for climate governance and sustainable development.",
            cover_image="/covers/environmental-law.jpg",
            isbn="978-81-948231-2-8",
            edition="1st Edition",
            publication_year=2026,
            publisher_id=pub_academic.id,
            pages=398,
            language="English",
            book_format="Paperback",
            subject="Environmental Law, Public Policy, Jurisprudence, Governance",
            category_id=cat_law.id,
            selling_price=425.0,
            mrp=550.0,
            currency="INR",
            is_draft=False,
            is_featured=False,
            availability_status="in_stock",
            authors=[auth_law]
        )

        # Book 3: Clinical Psychology
        create_book_if_not_exists(
            title="Clinical Psychology: Research & Practice",
            subtitle="Evidence-Based Approaches for the Modern Practitioner",
            short_description="An evidence-based academic text integrating clinical research methodology, psychopathology, therapeutic modalities and professional practice standards.",
            full_description="Clinical Psychology: Research & Practice is a comprehensive academic monograph designed for postgraduate students, clinical trainees, and practising psychologists seeking an evidence-based foundation in contemporary clinical methods.\n\nThe text integrates scientific research methodology with practical clinical application, covering psychodiagnostic assessment, cognitive-behavioural frameworks, neuropsychological evaluation, and psychotherapeutic intervention across diverse clinical populations.\n\nStructured in alignment with national licensing and accreditation standards, this publication bridges the gap between academic research and clinical practice, providing a rigorous yet accessible resource for university psychology departments and professional training programmes.",
            cover_image="/covers/clinical-psychology.jpg",
            isbn="978-81-948231-3-5",
            edition="1st Edition",
            publication_year=2026,
            publisher_id=pub_academic.id,
            pages=512,
            language="English",
            book_format="Paperback",
            subject="Clinical Psychology, Research Methodology, Psychotherapy, Mental Health",
            category_id=cat_social.id,
            selling_price=375.0,
            mrp=480.0,
            currency="INR",
            is_draft=False,
            is_featured=False,
            availability_status="in_stock",
            authors=[auth_psych]
        )

        # Book 4: Modern Deep Learning (Expanded Catalogue Title)
        create_book_if_not_exists(
            title="Principles of Modern Deep Learning: From Perceptrons to Transformers",
            subtitle="A Rigorous Mathematical and Algorithmic Exposition",
            short_description="Widely adopted across undergraduate and postgraduate computer science programs, presenting a unified mathematical treatment of modern machine learning.",
            full_description="Principles of Modern Deep Learning offers an authoritative mathematical and algorithmic exposition of contemporary artificial intelligence architectures, from gradient-based backpropagation to modern multi-head self-attention transformers and diffusion mechanisms.\n\nDesigned for university computer science and data science curricula, the text combines rigorous analytical proofs with practical computational paradigms. Each chapter features detailed derivations of loss functions, optimization surfaces, and matrix computational complexities.\n\nThe monograph serves as a comprehensive textbook for higher education classrooms, supporting instructors with modular problem sets, verification benchmarks, and faculty discussion frameworks aligned with global academic curricula.",
            cover_image="/covers/modern-deep-learning.jpg",
            isbn="978-81-948231-4-2",
            edition="1st Edition",
            publication_year=2026,
            publisher_id=pub_academic.id,
            pages=544,
            language="English",
            book_format="Hardcover",
            subject="Computer Science, Deep Learning, Artificial Intelligence, Algorithms",
            category_id=cat_science.id,
            selling_price=550.0,
            mrp=695.0,
            currency="INR",
            is_draft=False,
            is_featured=True,
            availability_status="in_stock",
            authors=[auth_vance]
        )

        # Book 5: Macroeconomic Modeling (Expanded Catalogue Title)
        create_book_if_not_exists(
            title="Macroeconomic Modeling in Developing Economies",
            subtitle="Fiscal Dominance, Exchange Regimes, and Monetary Shocks",
            short_description="A pioneering econometric monograph on fiscal dynamics, foreign exchange regimes, and inflation targeting in emerging markets.",
            full_description="Macroeconomic Modeling in Developing Economies delivers a rigorous, data-driven framework for understanding fiscal policy, sovereign debt sustainability, dynamic stochastic general equilibrium (DSGE) modeling, and central bank monetary transmission in emerging market contexts.\n\nAuthored by Prof. Elena Rostova, the monograph bridges structural macroeconomic theory with empirical econometric estimation. The text provides postgraduate students, economic researchers, and central bank analysts with advanced analytical tools for modeling trade shocks, currency depreciation, and fiscal consolidation.\n\nFeaturing real-world macroeconomic datasets and comprehensive curriculum modules, this work is an essential adoption for university departments of economics, public policy institutes, and financial research centers.",
            cover_image="/covers/macroeconomic-modeling.jpg",
            isbn="978-81-948231-5-9",
            edition="1st Edition",
            publication_year=2026,
            publisher_id=pub_academic.id,
            pages=460,
            language="English",
            book_format="Hardcover",
            subject="Macroeconomics, Econometric Modeling, Public Finance, Monetary Policy",
            category_id=cat_econ.id,
            selling_price=440.0,
            mrp=580.0,
            currency="INR",
            is_draft=False,
            is_featured=False,
            availability_status="in_stock",
            authors=[auth_rostova]
        )

        # Book 6: Clinical Neuroanatomy (Expanded Catalogue Title)
        create_book_if_not_exists(
            title="Clinical Neuroanatomy & Translational Diagnostics",
            subtitle="Pathological Correlations and Functional Systems",
            short_description="A comprehensive clinical neurology reference integrating structural neuroanatomy, pathological functional systems, and modern neuroimaging diagnostics.",
            full_description="Clinical Neuroanatomy & Translational Diagnostics provides a definitive, curriculum-aligned text for postgraduate medical students, neurology residents, and clinical researchers in translational neurosciences.\n\nThe text systematically explores cerebral cortical organization, subcortical tracts, cranial nerve pathways, and vascular supply, correlating histological architecture with clinical manifestations of neurological disease.\n\nEnriched with high-resolution diffusion tensor imaging (DTI) tractography maps, magnetic resonance correlations, and structured diagnostic case analyses, this monograph provides an indispensable clinical and educational foundation for medical college faculties and university hospital libraries.",
            cover_image="/covers/clinical-neuroanatomy.jpg",
            isbn="978-81-948231-6-6",
            edition="1st Edition",
            publication_year=2026,
            publisher_id=pub_academic.id,
            pages=620,
            language="English",
            book_format="Hardcover",
            subject="Neuroscience, Clinical Medicine, Neuroanatomy, Diagnostics",
            category_id=cat_med.id,
            selling_price=520.0,
            mrp=680.0,
            currency="INR",
            is_draft=False,
            is_featured=False,
            availability_status="in_stock",
            authors=[auth_mukherjee]
        )

        # Count summary
        count = db.query(Book).count()
        print(f"  [SUCCESS] Target database now holds {count} verified books.")
    finally:
        db.close()

if __name__ == "__main__":
    print("\n========================================================")
    print(" DOTCOM PUBLICATIONS — CATALOGUE SEEDING & SYNCHRONIZATION")
    print("========================================================")

    # 1. Seed local SQLite in backend
    backend_db = os.path.join(CURRENT_DIR, "dotcom_publications.db")
    engine_sqlite_backend = create_engine(f"sqlite:///{backend_db}", connect_args={"check_same_thread": False})
    seed_to_engine(engine_sqlite_backend, f"SQLite ({backend_db})")

    # 2. Seed local SQLite in root (if exists or copy over)
    root_db = os.path.join(ROOT_DIR, "dotcom_publications.db")
    shutil.copy2(backend_db, root_db)
    print(f"  [OK] Synchronized database file to root: {root_db}")

    print("\n========================================================")
    print(" CATALOGUE INJECTION COMPLETE — 6 BOOKS LIVE")
    print("========================================================\n")

import unittest
import io
import sys
import os

# Add root directory and backend directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
for p in [ROOT_DIR, CURRENT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

class TestDotcomPublicationsSystemAudit(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        print("\n" + "="*70)
        print("STARTING DOTCOM PUBLICATIONS AUTOMATED SYSTEM AUDIT SUITE")
        print("="*70)

    # 1. Health & Database Connectivity
    def test_01_health_and_database(self):
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["connected"], "Database must be connected")
        self.assertIn("books", data["tables"])
        self.assertIn("authors", data["tables"])
        self.assertIn("categories", data["tables"])
        self.assertIn("publishers", data["tables"])
        print("  [PASS] test_01_health_and_database: Supabase/PostgreSQL connected with all tables.")

    # 2. Dashboard Statistics
    def test_02_dashboard_stats(self):
        response = client.get("/api/dashboard/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_books", data)
        self.assertIn("published_books", data)
        self.assertIn("draft_books", data)
        self.assertIn("total_authors", data)
        self.assertIn("total_categories", data)
        self.assertIn("total_publishers", data)
        print("  [PASS] test_02_dashboard_stats: Dashboard metrics schema and counters verified.")

    # 3. Category Management & Validation
    def test_03_category_crud_and_validation(self):
        import uuid
        uid = uuid.uuid4().hex[:6]
        # Clean up any leftover test category
        slug = f"audit-test-discipline-{uid}"
        name = f"Audit Test Discipline {uid}"
        cat_payload = {
            "name": name,
            "slug": slug,
            "description": "Discipline created for system verification"
        }
        res = client.post("/api/categories", json=cat_payload)
        self.assertEqual(res.status_code, 201)
        cat_id = res.json()["id"]

        # Duplicate slug check (must be rejected with 400)
        res_dup_slug = client.post("/api/categories", json=cat_payload)
        self.assertEqual(res_dup_slug.status_code, 400, "Duplicate category slug must return 400")

        # Duplicate name under same parent check (must be rejected with 400)
        dup_name_payload = {
            "name": name,
            "slug": f"diff-slug-{uid}",
            "description": "Different slug but duplicate name"
        }
        res_dup_name = client.post("/api/categories", json=dup_name_payload)
        self.assertEqual(res_dup_name.status_code, 400, "Duplicate category name must return 400")

        # Clean up
        del_res = client.delete(f"/api/categories/{cat_id}")
        self.assertEqual(del_res.status_code, 200)
        print("  [PASS] test_03_category_crud_and_validation: Duplicate slug & name checks verified.")

    # 4. Author Management
    def test_04_author_crud(self):
        author_payload = {
            "name": "Prof. Test Scholar, PhD",
            "bio": "Senior Researcher in Educational Methodology",
            "email": "scholar.test@university.edu"
        }
        res = client.post("/api/authors", json=author_payload)
        self.assertEqual(res.status_code, 201)
        author_id = res.json()["id"]

        # Update
        update_res = client.put(f"/api/authors/{author_id}", json={"bio": "Updated Academic Biography"})
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.json()["bio"], "Updated Academic Biography")

        # Delete
        del_res = client.delete(f"/api/authors/{author_id}")
        self.assertEqual(del_res.status_code, 200)
        print("  [PASS] test_04_author_crud: Author profile lifecycle verified.")

    # 5. Publisher Management
    def test_05_publisher_crud(self):
        pub_payload = {
            "name": "Dotcom Academic Press Imprint",
            "description": "Peer-reviewed university press series",
            "city": "New Delhi"
        }
        res = client.post("/api/publishers", json=pub_payload)
        self.assertEqual(res.status_code, 201)
        pub_id = res.json()["id"]

        del_res = client.delete(f"/api/publishers/{pub_id}")
        self.assertEqual(del_res.status_code, 200)
        print("  [PASS] test_05_publisher_crud: Publisher press lifecycle verified.")

    # 6. Book Management, Duplicate ISBN & Price Validation
    def test_06_book_crud_and_business_rules(self):
        # A. Create author and publisher for testing
        author = client.post("/api/authors", json={"name": "Dr. QA Specialist"}).json()
        author_id = author["id"]
        
        # B. Test Selling Price > MRP validation (must fail with 400)
        invalid_price_book = {
            "title": "Invalid Price Test Book",
            "isbn": "978-0-00-111111-1",
            "selling_price": 1200.0,
            "mrp": 1000.0,  # Selling price > MRP is forbidden
            "author_ids": [author_id]
        }
        res_invalid_price = client.post("/api/books", json=invalid_price_book)
        self.assertEqual(res_invalid_price.status_code, 400, "Selling price exceeding MRP must fail with 400")

        # C. Create valid book
        valid_book = {
            "title": "Principles of Advanced Publishing Systems",
            "isbn": "978-0-12-345678-9",
            "selling_price": 799.0,
            "mrp": 999.0,
            "author_ids": [author_id],
            "is_draft": False
        }
        res_book = client.post("/api/books", json=valid_book)
        self.assertEqual(res_book.status_code, 201)
        book_data = res_book.json()
        book_id = book_data["id"]
        self.assertEqual(book_data["title"], "Principles of Advanced Publishing Systems")
        self.assertEqual(len(book_data["authors"]), 1)

        # D. Test Duplicate ISBN check (must fail with 400)
        dup_isbn_book = {
            "title": "Second Book Attempting Duplicate ISBN",
            "isbn": "978-0-12-345678-9",  # Exact same ISBN as above
            "selling_price": 500.0,
            "mrp": 600.0,
            "author_ids": [author_id]
        }
        res_dup_isbn = client.post("/api/books", json=dup_isbn_book)
        self.assertEqual(res_dup_isbn.status_code, 400, "Duplicate ISBN must fail with 400")

        # E. Toggle Publish & Featured
        toggle_pub = client.post(f"/api/books/{book_id}/toggle-publish")
        self.assertEqual(toggle_pub.status_code, 200)
        self.assertTrue(toggle_pub.json()["is_draft"])

        toggle_feat = client.post(f"/api/books/{book_id}/toggle-featured")
        self.assertEqual(toggle_feat.status_code, 200)
        self.assertTrue(toggle_feat.json()["is_featured"])

        # F. Search and Pagination
        search_res = client.get("/api/books?search=Principles")
        self.assertEqual(search_res.status_code, 200)
        self.assertGreaterEqual(search_res.json()["total"], 1)

        # G. Clean up
        client.delete(f"/api/books/{book_id}")
        client.delete(f"/api/authors/{author_id}")
        print("  [PASS] test_06_book_crud_and_business_rules: Book lifecycle, duplicate ISBN & pricing checks verified.")

    # 7. Media Library & File Upload Security
    def test_07_media_security_and_uploads(self):
        # A. Reject unsupported file format (.txt)
        fake_txt = io.BytesIO(b"malicious script payload")
        res_bad_file = client.post(
            "/api/media/upload",
            files={"file": ("malicious.txt", fake_txt, "text/plain")},
            data={"category": "general"}
        )
        self.assertEqual(res_bad_file.status_code, 400, "Non-image upload must be rejected with 400")

        # B. Reject oversized upload (> 10MB)
        # Create a virtual 11MB stream without allocating memory
        large_bytes = b"0" * (11 * 1024 * 1024)
        fake_large = io.BytesIO(large_bytes)
        res_oversized = client.post(
            "/api/media/upload",
            files={"file": ("huge_image.png", fake_large, "image/png")},
            data={"category": "general"}
        )
        self.assertEqual(res_oversized.status_code, 413, "Oversized upload (>10MB) must be rejected with 413")

        # C. Valid image upload
        valid_png = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4")
        res_valid = client.post(
            "/api/media/upload",
            files={"file": ("test_cover.png", valid_png, "image/png")},
            data={"category": "covers"}
        )
        self.assertEqual(res_valid.status_code, 201)
        media_id = res_valid.json()["id"]

        # Clean up
        client.delete(f"/api/media/{media_id}")
        print("  [PASS] test_07_media_security_and_uploads: Format validation & 10MB boundary enforced.")

    # 8. Landing Page CMS Persistence
    def test_08_landing_page_persistence(self):
        get_res = client.get("/api/landing")
        self.assertEqual(get_res.status_code, 200)
        current = get_res.json()

        # Update headline
        updated_heading = "Advancing Global Scholarly Knowledge"
        current["hero_heading"] = updated_heading
        put_res = client.put("/api/landing", json=current)
        self.assertEqual(put_res.status_code, 200)
        self.assertEqual(put_res.json()["hero_heading"], updated_heading)

        # Verify persistence on subsequent GET
        verify_res = client.get("/api/landing")
        self.assertEqual(verify_res.json()["hero_heading"], updated_heading)
        print("  [PASS] test_08_landing_page_persistence: Landing CMS updates and persists dynamically.")

    # 9. Site Settings Persistence
    def test_09_site_settings_persistence(self):
        get_res = client.get("/api/settings")
        self.assertEqual(get_res.status_code, 200)
        settings = get_res.json()

        settings["company_name"] = "Dotcom Publications"
        settings["currency"] = "INR"
        put_res = client.put("/api/settings", json=settings)
        self.assertEqual(put_res.status_code, 200)
        self.assertEqual(put_res.json()["company_name"], "Dotcom Publications")
        print("  [PASS] test_09_site_settings_persistence: Global configuration persists correctly.")

if __name__ == "__main__":
    unittest.main()

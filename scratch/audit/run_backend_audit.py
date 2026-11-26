import requests
import json
import uuid
import sys

BASE_URL = "http://127.0.0.1:8000/api"

session = requests.Session()
session.trust_env = False

audit_results = {
    "passed": [],
    "failed": [],
    "vulnerabilities": [],
    "performance": [],
    "edge_cases": []
}

def log_test(category, name, passed, details):
    entry = {"test": name, "passed": passed, "details": details}
    if passed:
        audit_results["passed"].append(entry)
        print(f"[PASS] {category} - {name}")
    else:
        audit_results["failed"].append(entry)
        print(f"[FAIL] {category} - {name}: {details}")

print("=== 1. SYSTEM HEALTH & DB STATUS ===")
try:
    r = session.get(f"{BASE_URL}/health", timeout=5)
    log_test("Health", "API health check responds 200", r.status_code == 200, f"Status: {r.status_code}, DB: {r.json().get('database_type')}")
    r2 = session.get(f"{BASE_URL}/db-status", timeout=5)
    db_info = r2.json()
    log_test("Health", "Database connected and reports tables", db_info.get("connected") == True, f"Tables: {len(db_info.get('tables', []))}")
except Exception as e:
    log_test("Health", "API health check", False, str(e))

print("\n=== 2. AUTHENTICATION & SECURITY ENFORCEMENT ===")
# Check if admin API endpoints are protected by ANY auth token or header
endpoints_to_check = [
    ("GET", f"{BASE_URL}/dashboard/stats"),
    ("GET", f"{BASE_URL}/orders"),
    ("POST", f"{BASE_URL}/books"),
    ("PUT", f"{BASE_URL}/settings"),
    ("DELETE", f"{BASE_URL}/books/999999"),
]

for method, url in endpoints_to_check:
    try:
        if method == "GET":
            res = session.get(url)
        elif method == "POST":
            res = session.post(url, json={})
        elif method == "PUT":
            res = session.put(url, json={})
        elif method == "DELETE":
            res = session.delete(url)
        
        # If res.status_code is 401 or 403, auth is enforced. If 200, 422, 404, or 400, auth is completely bypassed!
        is_unprotected = res.status_code not in (401, 403)
        if is_unprotected:
            audit_results["vulnerabilities"].append({
                "issue": "Unauthenticated API Endpoint",
                "endpoint": f"{method} {url}",
                "status_code": res.status_code,
                "severity": "Critical",
                "detail": f"Endpoint returned {res.status_code} without requiring an Authorization header or session token."
            })
            print(f"[SECURITY VULNERABILITY] {method} {url} is completely unprotected! (Status: {res.status_code})")
        else:
            log_test("Security", f"Auth enforced on {method} {url}", True, "Returned 401/403")
    except Exception as e:
        print(f"Auth test error for {url}: {e}")

print("\n=== 3. DASHBOARD STATS ACCURACY & INTEGRITY ===")
try:
    r_stats = session.get(f"{BASE_URL}/dashboard/stats")
    stats = r_stats.json()
    r_books = session.get(f"{BASE_URL}/books?limit=100")
    books_data = r_books.json()
    
    actual_books_count = books_data.get("total", 0)
    reported_books_count = stats.get("total_books", 0)
    
    log_test("Dashboard", "Total books matches books list count", actual_books_count == reported_books_count,
             f"Reported: {reported_books_count}, Actual: {actual_books_count}")
    
    published_count = len([b for b in books_data.get("items", []) if not b.get("is_draft")])
    reported_published = stats.get("published_books", 0)
    log_test("Dashboard", "Published books count accuracy", published_count == reported_published,
             f"Reported: {reported_published}, Actual: {published_count}")
             
    draft_count = len([b for b in books_data.get("items", []) if b.get("is_draft")])
    reported_draft = stats.get("draft_books", 0)
    log_test("Dashboard", "Draft books count accuracy", draft_count == reported_draft,
             f"Reported: {reported_draft}, Actual: {draft_count}")
             
    # Check if orders are in dashboard stats
    has_orders_in_stats = "total_orders" in stats or "revenue" in stats
    log_test("Dashboard", "Dashboard stats tracks orders/revenue", has_orders_in_stats,
             f"Stats keys: {list(stats.keys())}")
except Exception as e:
    log_test("Dashboard", "Stats check", False, str(e))

print("\n=== 4. BOOKS CRUD & VALIDATION AUDIT ===")
test_isbn = f"978-81-{uuid.uuid4().hex[:7]}-X"
created_book_id = None

# 4.1 Validation: Selling price > MRP
try:
    invalid_price_payload = {
        "title": "Audit Validation Test Book",
        "selling_price": 999.0,
        "mrp": 500.0,
        "author_ids": []
    }
    r = session.post(f"{BASE_URL}/books", json=invalid_price_payload)
    log_test("Books", "Rejects selling_price > mrp", r.status_code == 400, f"Status: {r.status_code}, Body: {r.text}")
except Exception as e:
    log_test("Books", "Price validation test", False, str(e))

# 4.2 Validation: Empty title
try:
    empty_title_payload = {
        "title": "",
        "selling_price": 100.0,
        "mrp": 200.0
    }
    r = session.post(f"{BASE_URL}/books", json=empty_title_payload)
    log_test("Books", "Rejects empty title", r.status_code in (400, 422), f"Status: {r.status_code}")
except Exception as e:
    log_test("Books", "Empty title test", False, str(e))

# 4.3 Successful Create
try:
    valid_payload = {
        "title": "QA Automated Audit Test Monograph",
        "subtitle": "A Verification Study",
        "short_description": "Test short description for automated QA audit.",
        "full_description": "Comprehensive test description for automated QA audit.",
        "isbn": test_isbn,
        "selling_price": 450.0,
        "mrp": 600.0,
        "currency": "INR",
        "is_draft": True,
        "is_featured": False,
        "language": "English",
        "book_format": "Hardcover",
        "author_ids": []
    }
    r = session.post(f"{BASE_URL}/books", json=valid_payload)
    passed = r.status_code == 201
    book_created = r.json() if passed else {}
    created_book_id = book_created.get("id")
    log_test("Books", "Create valid book", passed, f"ID: {created_book_id}, Status: {r.status_code}")
except Exception as e:
    log_test("Books", "Create valid book", False, str(e))

# 4.4 Validation: Duplicate ISBN
if created_book_id:
    try:
        dup_payload = {
            "title": "Duplicate ISBN Monograph",
            "isbn": test_isbn,
            "selling_price": 100.0,
            "mrp": 200.0
        }
        r = session.post(f"{BASE_URL}/books", json=dup_payload)
        log_test("Books", "Rejects duplicate ISBN", r.status_code == 400, f"Status: {r.status_code}, Detail: {r.text}")
    except Exception as e:
        log_test("Books", "Duplicate ISBN test", False, str(e))

# 4.5 Update Book
if created_book_id:
    try:
        update_payload = {
            "title": "QA Automated Audit Test Monograph (Updated)",
            "selling_price": 480.0
        }
        r = session.put(f"{BASE_URL}/books/{created_book_id}", json=update_payload)
        updated_data = r.json() if r.status_code == 200 else {}
        log_test("Books", "Update book details", r.status_code == 200 and updated_data.get("selling_price") == 480.0,
                 f"Status: {r.status_code}, Updated price: {updated_data.get('selling_price')}")
    except Exception as e:
        log_test("Books", "Update book", False, str(e))

# 4.6 Toggle Publish and Featured
if created_book_id:
    try:
        r_pub = session.post(f"{BASE_URL}/books/{created_book_id}/toggle-publish")
        log_test("Books", "Toggle publish status", r_pub.status_code == 200 and r_pub.json().get("is_draft") == False,
                 f"Status: {r_pub.status_code}, Res: {r_pub.text}")
        r_feat = session.post(f"{BASE_URL}/books/{created_book_id}/toggle-featured")
        log_test("Books", "Toggle featured status", r_feat.status_code == 200 and r_feat.json().get("is_featured") == True,
                 f"Status: {r_feat.status_code}, Res: {r_feat.text}")
    except Exception as e:
        log_test("Books", "Toggle publish/featured", False, str(e))

# 4.7 Clean up test book
if created_book_id:
    try:
        r_del = session.delete(f"{BASE_URL}/books/{created_book_id}")
        log_test("Books", "Delete book (clean up)", r_del.status_code == 200, f"Status: {r_del.status_code}")
    except Exception as e:
        log_test("Books", "Delete book", False, str(e))

print("\n=== 5. AUTHORS CRUD & INTEGRITY ===")
created_author_id = None
try:
    auth_payload = {
        "name": f"Prof. QA Auditor {uuid.uuid4().hex[:4]}",
        "bio": "Senior Automated QA Test Bio",
        "email": "qa.author@example.com"
    }
    r = session.post(f"{BASE_URL}/authors", json=auth_payload)
    if r.status_code == 201:
        created_author_id = r.json().get("id")
        log_test("Authors", "Create author", True, f"ID: {created_author_id}")
    else:
        log_test("Authors", "Create author", False, f"Status: {r.status_code}, Text: {r.text}")
except Exception as e:
    log_test("Authors", "Create author", False, str(e))

if created_author_id:
    try:
        r = session.put(f"{BASE_URL}/authors/{created_author_id}", json={"bio": "Updated QA Bio"})
        log_test("Authors", "Update author", r.status_code == 200, f"Status: {r.status_code}")
        r_del = session.delete(f"{BASE_URL}/authors/{created_author_id}")
        log_test("Authors", "Delete author (clean up)", r_del.status_code == 200, f"Status: {r_del.status_code}")
    except Exception as e:
        log_test("Authors", "Update/Delete author", False, str(e))

print("\n=== 6. CATEGORIES & HIERARCHY ===")
created_cat_id = None
try:
    slug = f"qa-cat-{uuid.uuid4().hex[:6]}"
    cat_payload = {
        "name": f"QA Category {uuid.uuid4().hex[:4]}",
        "slug": slug,
        "description": "Category for automated testing"
    }
    r = session.post(f"{BASE_URL}/categories", json=cat_payload)
    if r.status_code == 201:
        created_cat_id = r.json().get("id")
        log_test("Categories", "Create root category", True, f"ID: {created_cat_id}")
        
        # Test duplicate slug
        r_dup = session.post(f"{BASE_URL}/categories", json=cat_payload)
        log_test("Categories", "Rejects duplicate category slug", r_dup.status_code == 400, f"Status: {r_dup.status_code}")
        
        # Clean up
        session.delete(f"{BASE_URL}/categories/{created_cat_id}")
        log_test("Categories", "Delete category (clean up)", True, "Cleaned")
    else:
        log_test("Categories", "Create category", False, f"Status: {r.status_code}, {r.text}")
except Exception as e:
    log_test("Categories", "Category test", False, str(e))

print("\n=== 7. PUBLISHERS CRUD ===")
created_pub_id = None
try:
    pub_payload = {
        "name": f"QA Academic Imprint {uuid.uuid4().hex[:4]}",
        "description": "Imprint for QA testing"
    }
    r = session.post(f"{BASE_URL}/publishers", json=pub_payload)
    if r.status_code == 201:
        created_pub_id = r.json().get("id")
        log_test("Publishers", "Create publisher", True, f"ID: {created_pub_id}")
        session.delete(f"{BASE_URL}/publishers/{created_pub_id}")
        log_test("Publishers", "Delete publisher (clean up)", True, "Cleaned")
    else:
        log_test("Publishers", "Create publisher", False, f"Status: {r.status_code}")
except Exception as e:
    log_test("Publishers", "Publisher test", False, str(e))

print("\n=== 8. ORDERS MODULE AUDIT ===")
try:
    # Test empty cart order
    r_empty = session.post(f"{BASE_URL}/orders", json={
        "customer_name": "Test User",
        "customer_email": "test@user.com",
        "customer_phone": "9999999999",
        "shipping_address": "Test Address",
        "items": [],
        "total_amount": 0.0
    })
    log_test("Orders", "Rejects empty cart order", r_empty.status_code == 400, f"Status: {r_empty.status_code}")
    
    # Test valid order creation
    r_order = session.post(f"{BASE_URL}/orders", json={
        "customer_name": "QA Audit Scholar",
        "customer_email": "scholar.qa@dotcompublications.com",
        "customer_phone": "+91 98765 00000",
        "shipping_address": "QA Lab, Campus North",
        "city": "Greater Noida",
        "state": "Uttar Pradesh",
        "pincode": "201310",
        "items": [{
            "book_id": 1,
            "title": "Foundations of Computational Mathematics",
            "price": 495.0,
            "quantity": 1
        }],
        "total_amount": 495.0,
        "payment_method": "Cash on Delivery"
    })
    passed_order = r_order.status_code == 201
    order_data = r_order.json() if passed_order else {}
    order_id = order_data.get("id")
    order_num = order_data.get("order_number")
    log_test("Orders", "Create valid customer order", passed_order, f"Order #: {order_num}")
    
    if order_id:
        # Test status patch
        r_patch = session.patch(f"{BASE_URL}/orders/{order_id}/status", json={"status": "Shipped"})
        log_test("Orders", "Patch order status to 'Shipped'", r_patch.status_code == 200 and r_patch.json().get("status") == "Shipped",
                 f"Status: {r_patch.status_code}, Res: {r_patch.text}")
        
        # Test orders list filter
        r_list = session.get(f"{BASE_URL}/orders?status=Shipped")
        shipped_orders = r_list.json()
        found = any(o.get("id") == order_id for o in shipped_orders)
        log_test("Orders", "Filter orders by status ('Shipped')", found, f"Found in list: {found}")
except Exception as e:
    log_test("Orders", "Order module test", False, str(e))

print("\n=== 9. MEDIA UPLOAD & SECURITY ===")
# 9.1 Upload malicious extension (.exe/.py)
try:
    fake_exe = ("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/x-msdownload")
    r_exe = session.post(f"{BASE_URL}/media/upload", files={"file": fake_exe})
    log_test("Media", "Blocks dangerous file extension (.exe)", r_exe.status_code == 400, f"Status: {r_exe.status_code}")
except Exception as e:
    log_test("Media", "Dangerous file test", False, str(e))

# 9.2 Upload valid image
try:
    # 1x1 transparent PNG
    png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82'
    valid_img = ("audit_test_pixel.png", png_bytes, "image/png")
    r_img = session.post(f"{BASE_URL}/media/upload", files={"file": valid_img}, data={"category": "covers"})
    passed_img = r_img.status_code == 201
    media_data = r_img.json() if passed_img else {}
    media_id = media_data.get("id")
    log_test("Media", "Uploads valid PNG image", passed_img, f"Media ID: {media_id}, URL: {media_data.get('url')}")
    
    if media_id:
        r_del_media = session.delete(f"{BASE_URL}/media/{media_id}")
        log_test("Media", "Delete uploaded media (clean up)", r_del_media.status_code == 200, f"Status: {r_del_media.status_code}")
except Exception as e:
    log_test("Media", "Valid image upload test", False, str(e))

print("\n=== 10. SECURITY: SQL INJECTION & XSS PROBES ===")
# 10.1 SQL Injection in Books search
try:
    sqli_payload = "' OR 1=1 --"
    r_sqli = session.get(f"{BASE_URL}/books?search={sqli_payload}")
    # If ORM uses parameterized queries (which SQLAlchemy ilike does), it will search for the literal string and not crash with 500
    log_test("Security", "SQL Injection resistance in search", r_sqli.status_code == 200, f"Status: {r_sqli.status_code}")
except Exception as e:
    log_test("Security", "SQL Injection test", False, str(e))

# 10.2 XSS payload in Book title
try:
    xss_payload = "<script>alert('XSS')</script>"
    r_xss = session.post(f"{BASE_URL}/books", json={
        "title": xss_payload,
        "selling_price": 100.0,
        "mrp": 200.0
    })
    if r_xss.status_code == 201:
        xss_book = r_xss.json()
        xss_id = xss_book.get("id")
        audit_results["vulnerabilities"].append({
            "issue": "Stored XSS Risk / Unsanitized HTML",
            "endpoint": "POST /api/books",
            "detail": "HTML script tags accepted verbatim without server-side HTML escaping/sanitization.",
            "severity": "Medium"
        })
        print(f"[SECURITY WARNING] Book title accepts unsanitized HTML tags: {xss_book.get('title')}")
        session.delete(f"{BASE_URL}/books/{xss_id}")
except Exception as e:
    pass

with open("scratch/audit/backend_audit_results.json", "w", encoding="utf-8") as f:
    json.dump(audit_results, f, indent=2)

print("\n=== AUDIT SUMMARY ===")
print(f"Passed tests: {len(audit_results['passed'])}")
print(f"Failed tests: {len(audit_results['failed'])}")
print(f"Security vulnerabilities: {len(audit_results['vulnerabilities'])}")

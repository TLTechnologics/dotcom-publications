import asyncio
from playwright.async_api import async_playwright
import os
import json

RESULTS_DIR = r"C:\Users\Harshil Swami\.gemini\antigravity\brain\b025c225-8a39-4a3b-9d78-5b79a26de55d\scratch\audit"
SCREENSHOTS_DIR = os.path.join(RESULTS_DIR, "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

ui_findings = {
    "auth_flow": {},
    "modules_tested": {},
    "responsive_issues": [],
    "ui_ux_observations": [],
    "console_errors": []
}

async def run_ui_audit():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        
        # -------------------------------------------------------------
        # 1. AUTHENTICATION & LOGIN WORKFLOW
        # -------------------------------------------------------------
        print("Testing Auth: /admin portal login...")
        context = await browser.new_context(viewport={"width": 1366, "height": 768})
        page = await context.new_page()
        
        page.on("console", lambda msg: ui_findings["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
        
        await page.goto("http://127.0.0.1:5173/admin")
        await page.wait_for_timeout(1000)
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "01_admin_login_initial.jpg"))
        
        # Test invalid password
        pw_input = page.locator("input[type='password'], input[type='text']").first
        await pw_input.fill("wrong_key_123")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(500)
        
        err_msg = await page.locator("text=Invalid security access key").count()
        ui_findings["auth_flow"]["invalid_password_error_shown"] = err_msg > 0
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "02_admin_login_error.jpg"))
        
        # Test valid password
        await pw_input.fill("tl04")
        await page.click("button[type='submit']")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=os.path.join(SCREENSHOTS_DIR, "03_admin_dashboard_logged_in.jpg"))
        
        is_dashboard_visible = await page.locator("text=Demonstration Environment Active").count() > 0
        ui_findings["auth_flow"]["admin_login_successful"] = is_dashboard_visible
        
        # Verify role restrictions in /admin
        landing_in_sidebar = await page.locator("aside button:has-text('Landing Page CMS')").count()
        settings_in_sidebar = await page.locator("aside button:has-text('System Settings')").count()
        ui_findings["auth_flow"]["admin_role_hides_cms"] = (landing_in_sidebar == 0)
        ui_findings["auth_flow"]["admin_role_hides_settings"] = (settings_in_sidebar == 0)
        
        # -------------------------------------------------------------
        # 2. SUPER ADMIN AUTHENTICATION
        # -------------------------------------------------------------
        print("Testing Super Admin: /super-admin portal login...")
        page_sa = await context.new_page()
        await page_sa.goto("http://127.0.0.1:5173/super-admin")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "04_superadmin_login.jpg"))
        
        pw_input_sa = page_sa.locator("input[type='password'], input[type='text']").first
        await pw_input_sa.fill("tl04")
        await page_sa.click("button[type='submit']")
        await page_sa.wait_for_timeout(1500)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "05_superadmin_dashboard.jpg"))
        
        sa_landing_in_sidebar = await page_sa.locator("aside button:has-text('Landing Page CMS')").count()
        sa_settings_in_sidebar = await page_sa.locator("aside button:has-text('System Settings')").count()
        ui_findings["auth_flow"]["superadmin_role_shows_cms"] = (sa_landing_in_sidebar > 0)
        ui_findings["auth_flow"]["superadmin_role_shows_settings"] = (sa_settings_in_sidebar > 0)

        # -------------------------------------------------------------
        # 3. TEST DASHBOARD MODULE
        # -------------------------------------------------------------
        print("Auditing Dashboard Page components...")
        stats_cards = await page_sa.locator("text=Total Titles in Catalogue").count()
        recent_books = await page_sa.locator("text=Featured Publications").count()
        recent_activity = await page_sa.locator("text=Recent Publishing Activity").count()
        
        ui_findings["modules_tested"]["dashboard"] = {
            "stats_cards_present": stats_cards > 0,
            "featured_grid_present": recent_books > 0,
            "recent_activity_present": recent_activity > 0
        }
        
        # Test Quick Action "New Title" modal
        await page_sa.click("button:has-text('New Title')")
        await page_sa.wait_for_timeout(600)
        modal_visible = await page_sa.locator("text=New Academic Monograph").count() > 0 or await page_sa.locator("text=Book Synopsis").count() > 0 or await page_sa.locator("text=Basic Information").count() > 0
        ui_findings["modules_tested"]["dashboard"]["new_title_modal_opens"] = modal_visible
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "06_dashboard_new_title_modal.jpg"))
        
        # Close modal
        close_btn = page_sa.locator("button:has-text('Cancel'), button[aria-label='Close'], button:has-text('Close')").first
        if await close_btn.count() > 0:
            await close_btn.click()
            await page_sa.wait_for_timeout(400)

        # -------------------------------------------------------------
        # 4. TEST BOOKS CATALOGUE MODULE
        # -------------------------------------------------------------
        print("Auditing Books Page...")
        await page_sa.click("aside button:has-text('Books Catalogue')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "07_books_catalogue_page.jpg"))
        
        books_table_rows = await page_sa.locator("table tbody tr").count()
        search_input = page_sa.locator("input[placeholder*='Search']").first
        
        # Test Search
        await search_input.fill("Mathematics")
        await page_sa.wait_for_timeout(800)
        filtered_rows = await page_sa.locator("table tbody tr").count()
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "08_books_search_filtered.jpg"))
        
        await search_input.fill("")
        await page_sa.wait_for_timeout(800)
        
        ui_findings["modules_tested"]["books"] = {
            "table_rendered": books_table_rows > 0,
            "total_rows_initially": books_table_rows,
            "search_filtering_works": filtered_rows > 0 and filtered_rows <= books_table_rows
        }

        # -------------------------------------------------------------
        # 5. TEST ORDERS MODULE
        # -------------------------------------------------------------
        print("Auditing Orders Page...")
        await page_sa.click("aside button:has-text('Customer Orders')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "09_orders_page.jpg"))
        
        orders_metric = await page_sa.locator("text=Total Orders").count() > 0
        orders_cards = await page_sa.locator("text=Order #").count()
        ui_findings["modules_tested"]["orders"] = {
            "metrics_rendered": orders_metric,
            "orders_rendered_count": orders_cards
        }

        # -------------------------------------------------------------
        # 6. TEST AUTHORS MODULE
        # -------------------------------------------------------------
        print("Auditing Authors Page...")
        await page_sa.click("aside button:has-text('Faculty & Authors')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "10_authors_page.jpg"))
        
        authors_count = await page_sa.locator("text=Dr.").count() + await page_sa.locator("text=Prof.").count()
        ui_findings["modules_tested"]["authors"] = {
            "authors_rendered": authors_count > 0
        }

        # -------------------------------------------------------------
        # 7. TEST CATEGORIES MODULE
        # -------------------------------------------------------------
        print("Auditing Categories Page...")
        await page_sa.click("aside button:has-text('Disciplines & Categories')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "11_categories_page.jpg"))
        
        cats_count = await page_sa.locator("text=Science & Technology").count()
        ui_findings["modules_tested"]["categories"] = {
            "categories_rendered": cats_count > 0
        }

        # -------------------------------------------------------------
        # 8. TEST PUBLISHERS MODULE
        # -------------------------------------------------------------
        print("Auditing Publishers Page...")
        await page_sa.click("aside button:has-text('Publisher Imprints')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "12_publishers_page.jpg"))
        
        pubs_count = await page_sa.locator("text=Dotcom Academic Press").count()
        ui_findings["modules_tested"]["publishers"] = {
            "publishers_rendered": pubs_count > 0
        }

        # -------------------------------------------------------------
        # 9. TEST MEDIA LIBRARY MODULE
        # -------------------------------------------------------------
        print("Auditing Media Library Page...")
        await page_sa.click("aside button:has-text('Media Library')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "13_media_library_page.jpg"))
        
        media_upload_btn = await page_sa.locator("button:has-text('Upload Media Asset')").count()
        ui_findings["modules_tested"]["media"] = {
            "upload_button_present": media_upload_btn > 0
        }

        # -------------------------------------------------------------
        # 10. TEST LANDING PAGE CMS MODULE
        # -------------------------------------------------------------
        print("Auditing Landing Page CMS...")
        await page_sa.click("aside button:has-text('Landing Page CMS')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "14_landing_cms_page.jpg"))
        
        cms_hero_field = await page_sa.locator("input[value*='Advancing Knowledge'], textarea").count()
        ui_findings["modules_tested"]["landing_cms"] = {
            "hero_field_rendered": cms_hero_field > 0
        }

        # -------------------------------------------------------------
        # 11. TEST SYSTEM SETTINGS MODULE
        # -------------------------------------------------------------
        print("Auditing System Settings...")
        await page_sa.click("aside button:has-text('System Settings')")
        await page_sa.wait_for_timeout(1000)
        await page_sa.screenshot(path=os.path.join(SCREENSHOTS_DIR, "15_system_settings_page.jpg"))
        
        settings_company = await page_sa.locator("input[value*='Dotcom Publications']").count()
        ui_findings["modules_tested"]["settings"] = {
            "company_name_rendered": settings_company > 0
        }

        # -------------------------------------------------------------
        # 12. RESPONSIVE DESIGN TESTING ACROSS 5 VIEWPORTS
        # -------------------------------------------------------------
        viewports = [
            ("Desktop_1920x1080", 1920, 1080),
            ("Laptop_1366x768", 1366, 768),
            ("Tablet_768x1024", 768, 1024),
            ("Mobile_390x844", 390, 844),
            ("SmallMobile_360x800", 360, 800)
        ]
        
        print("\nAuditing Responsive Layout across viewports...")
        for name, width, height in viewports:
            vp_page = await context.new_page()
            await vp_page.set_viewport_size({"width": width, "height": height})
            await vp_page.goto("http://127.0.0.1:5173/super-admin")
            await vp_page.wait_for_timeout(1000)
            
            # Check for horizontal scroll / overflow
            scroll_width = await vp_page.evaluate("() => document.documentElement.scrollWidth")
            client_width = await vp_page.evaluate("() => document.documentElement.clientWidth")
            has_overflow = scroll_width > client_width
            
            # Check if sidebar is blocking mobile view or properly responsive
            sidebar_visible = await vp_page.locator("aside").is_visible()
            
            snap_path = os.path.join(SCREENSHOTS_DIR, f"responsive_{name}.jpg")
            await vp_page.screenshot(path=snap_path)
            
            issue = {
                "viewport": name,
                "width": width,
                "height": height,
                "has_horizontal_overflow": has_overflow,
                "scroll_width": scroll_width,
                "client_width": client_width,
                "sidebar_always_visible": sidebar_visible,
                "screenshot": snap_path
            }
            ui_findings["responsive_issues"].append(issue)
            print(f"Viewport {name}: Overflow: {has_overflow} (ScrollW: {scroll_width}, ClientW: {client_width}), Sidebar visible: {sidebar_visible}")
            await vp_page.close()

        await browser.close()

    with open(os.path.join(RESULTS_DIR, "ui_audit_findings.json"), "w", encoding="utf-8") as f:
        json.dump(ui_findings, f, indent=2)
    print("\nUI Audit finished successfully! Results saved.")

asyncio.run(run_ui_audit())

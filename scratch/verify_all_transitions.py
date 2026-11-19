import asyncio
import os
from playwright.async_api import async_playwright

async def verify_scroll_journey():
    out_dir = r"C:/Users/Harshil Swami/.gemini/antigravity/brain/b025c225-8a39-4a3b-9d78-5b79a26de55d/scratch/screenshots"
    os.makedirs(out_dir, exist_ok=True)
    
    console_errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        # 1. Desktop Verification (1308x768 - matching reference video resolution)
        print("=== 1. DESKTOP VERIFICATION (1308x768) ===")
        page = await browser.new_page(viewport={"width": 1308, "height": 768})
        
        def handle_console(msg):
            if msg.type in ["error"]:
                console_errors.append(msg.text)
                print(f"Console error: {msg.text}")
        
        page.on("console", handle_console)
        
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Test 1: Hero Section
        print("Testing Stage 1: Hero Section...")
        await page.screenshot(path=os.path.join(out_dir, "01_hero_desktop.jpg"))
        
        # Test 2: Hero to Manifesto transition
        print("Testing Stage 2: Manifesto Section...")
        await page.evaluate("window.scrollTo(0, 700)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "02_manifesto_desktop.jpg"))
        
        # Test 3: Horizontal Gallery Entrance
        print("Testing Stage 3: Horizontal Gallery Entrance...")
        await page.evaluate("window.scrollTo(0, 1600)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "03_gallery_start_desktop.jpg"))
        
        # Test 4: Horizontal Gallery Scrolled Along Track
        print("Testing Stage 3: Horizontal Gallery Middle / End...")
        await page.evaluate("window.scrollTo(0, 2600)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "04_gallery_scrolled_desktop.jpg"))
        
        # Test 5: Gallery to Dark Artifact Transition
        print("Testing Stage 4: Dark Publication Artifact Entrance...")
        await page.evaluate("window.scrollTo(0, 3600)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "05_artifact_entrance_desktop.jpg"))
        
        # Test 6: Artifact Progressive Reveal & Perforation
        print("Testing Stage 4: Artifact Progressive Details...")
        await page.evaluate("window.scrollTo(0, 4400)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "06_artifact_scrolled_desktop.jpg"))
        
        # Test 7: Artifact to FAQ Transition
        print("Testing Stage 5: FAQ Section...")
        await page.evaluate("window.scrollTo(0, 5200)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "07_faq_desktop.jpg"))
        
        # Test 8: FAQ to Information / Pricing Table
        print("Testing Stage 6: Pricing / Publication Index Table...")
        await page.evaluate("window.scrollTo(0, 5900)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "08_pricing_table_desktop.jpg"))
        
        # Test 9: Information Table to Final Editorial Section (22 Contour Lines Canvas)
        print("Testing Stage 7: Final Editorial Section (~22 Contour Lines)...")
        await page.evaluate("window.scrollTo(0, 6800)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "09_final_editorial_desktop.jpg"))
        
        # Test 10: Final Section into Customer Footer
        print("Testing Stage 8: Footer Transition...")
        await page.evaluate("window.scrollTo(0, 8000)")
        await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(out_dir, "10_footer_desktop.jpg"))
        
        # Verify Horizontal Overflow
        scroll_width = await page.evaluate("document.documentElement.scrollWidth")
        client_width = await page.evaluate("document.documentElement.clientWidth")
        print(f"Viewport client width: {client_width}, Scroll width: {scroll_width}")
        has_horizontal_overflow = scroll_width > client_width
        print(f"Horizontal document overflow detected: {has_horizontal_overflow}")
        
        # 2. Mobile Verification (375x812 iPhone)
        print("\n=== 2. MOBILE VIEWPORT VERIFICATION (375x812) ===")
        mobile_page = await browser.new_page(viewport={"width": 375, "height": 812})
        await mobile_page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await mobile_page.wait_for_timeout(1000)
        await mobile_page.screenshot(path=os.path.join(out_dir, "mobile_01_hero.jpg"))
        
        await mobile_page.evaluate("window.scrollTo(0, 800)")
        await mobile_page.wait_for_timeout(400)
        await mobile_page.screenshot(path=os.path.join(out_dir, "mobile_02_gallery.jpg"))
        
        await mobile_page.evaluate("window.scrollTo(0, 1800)")
        await mobile_page.wait_for_timeout(400)
        await mobile_page.screenshot(path=os.path.join(out_dir, "mobile_03_artifact.jpg"))
        
        await mobile_page.evaluate("window.scrollTo(0, 2800)")
        await mobile_page.wait_for_timeout(400)
        await mobile_page.screenshot(path=os.path.join(out_dir, "mobile_04_faq_pricing.jpg"))
        
        m_scroll_w = await mobile_page.evaluate("document.documentElement.scrollWidth")
        m_client_w = await mobile_page.evaluate("document.documentElement.clientWidth")
        print(f"Mobile client width: {m_client_w}, Mobile scroll width: {m_scroll_w}")
        
        await browser.close()
        
    print(f"\nVerification finished! Total console errors: {len(console_errors)}")
    if console_errors:
        print("Errors encountered:", console_errors)

if __name__ == "__main__":
    asyncio.run(verify_scroll_journey())

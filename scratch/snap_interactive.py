import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1308, "height": 768})
        await page.goto("http://127.0.0.1:5173/")
        await page.wait_for_timeout(1000)
        
        # Test 1: Open Cart Drawer
        cart_btn = page.locator("button:has-text('Cart')").first
        await cart_btn.click()
        await page.wait_for_timeout(600)
        await page.screenshot(path="C:/Users/Harshil Swami/.gemini/antigravity/brain/b025c225-8a39-4a3b-9d78-5b79a26de55d/scratch/screenshots/snap_cart_drawer.jpg")
        
        # Close Cart Drawer
        close_btn = page.locator("button:has-text('Browse Academic Catalogue'), button[title='Close Reader (Esc)']").first
        if await close_btn.is_visible():
            await close_btn.click()
        else:
            await page.keyboard.press("Escape")
        await page.wait_for_timeout(400)
        
        # Test 2: Click a card in Horizontal Gallery to open 3D Reader
        await page.evaluate("window.scrollTo(0, 1600)")
        await page.wait_for_timeout(600)
        first_card = page.locator("#publications-gallery .cursor-pointer").first
        await first_card.click()
        await page.wait_for_timeout(1200)
        await page.screenshot(path="C:/Users/Harshil Swami/.gemini/antigravity/brain/b025c225-8a39-4a3b-9d78-5b79a26de55d/scratch/screenshots/snap_3d_reader.jpg")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1308, "height": 768})
        await page.goto("http://127.0.0.1:5173/")
        await page.wait_for_timeout(1000)
        footer = page.locator("footer")
        await footer.scroll_into_view_if_needed()
        await page.wait_for_timeout(600)
        await page.screenshot(path="C:/Users/Harshil Swami/.gemini/antigravity/brain/b025c225-8a39-4a3b-9d78-5b79a26de55d/scratch/screenshots/actual_footer.jpg")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

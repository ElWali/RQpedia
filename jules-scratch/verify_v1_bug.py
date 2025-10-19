
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await page.goto("http://localhost:8000/index.html")
            await page.wait_for_load_state('networkidle')
            await page.screenshot(path="screenshot_before.png")
            print("Screenshot 'screenshot_before.png' captured successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

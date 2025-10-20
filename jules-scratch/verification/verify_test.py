
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:8000/test_index.html")
        await page.wait_for_selector(".success", timeout=10000)
        await page.screenshot(path="jules-scratch/verification/test_result.png")
        await browser.close()

asyncio.run(main())

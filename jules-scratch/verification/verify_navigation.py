
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("http://localhost:8000/DataXplorer.html")

        # Search for a site and click the autocomplete suggestion
        await page.get_by_placeholder("Search for a site...").fill("Abri Rihane")
        await page.get_by_text("Abri Rihane").click()

        # Click the "View Full Profile" button
        await page.get_by_role("link", name="View Full Profile").click()

        # Wait for the new page to load
        await page.wait_for_load_state("networkidle")

        # Check that the new page has the correct title
        await expect(page.get_by_role("heading", name="Abri Rihane")).to_be_visible()

        await page.screenshot(path="jules-scratch/verification/profile_navigation.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())

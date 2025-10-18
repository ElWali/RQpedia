import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("http://localhost:8081/Ask/Ask1v1.html")

        # Wait for the search input to be visible
        search_input = page.locator("#search-input")
        await expect(search_input).to_be_visible()

        # Type a search query and press Enter
        await search_input.fill("Eiffel Tower")
        await search_input.press("Enter")

        # Wait for the results to be displayed
        info_div = page.locator("#info")
        await expect(info_div).to_be_visible(timeout=15000)

        # Take a screenshot
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
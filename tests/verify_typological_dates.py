
import asyncio
from playwright.async_api import async_playwright, TimeoutError
import subprocess
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        server_process = await asyncio.create_subprocess_exec(
            "python3", "-m", "http.server", "8000", "--directory", "VX"
        )
        time.sleep(2)

        try:
            await page.goto("http://localhost:8000/sites.html")
            await page.wait_for_selector("#sites-table-body tr")

            row_selector = "tr:has-text(\"Hassi Ouenzga\")"
            row = page.locator(row_selector).first

            # Scroll down until the element is visible
            max_scrolls = 20
            for _ in range(max_scrolls):
                if await row.is_visible():
                    break
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(500)
            else:
                raise TimeoutError("Element not found after scrolling")

            typological_dates_cell = row.locator("td:nth-child(5)")
            typological_dates_count = await typological_dates_cell.inner_text()

            print(f"Typological dates count for Hassi Ouenzga: {typological_dates_count}")
            assert int(typological_dates_count) > 0

        finally:
            await browser.close()
            server_process.terminate()

if __name__ == "__main__":
    asyncio.run(main())

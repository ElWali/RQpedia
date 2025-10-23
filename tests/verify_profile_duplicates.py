import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Start a local server from the root directory
        server_command = "python3 -m http.server 8000 --directory VX"
        server_process = await asyncio.create_subprocess_shell(
            server_command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        await asyncio.sleep(2)  # Wait for server to start

        try:
            # Navigate to the specific profile page
            await page.goto("http://localhost:8000/profile.html?id=66407")

            # Wait for the table to be populated
            await page.wait_for_selector("#c14-table tbody tr")

            # Get the number of rows in the table
            rows = await page.query_selector_all("#c14-table tbody tr")

            print(f"Found {len(rows)} rows in the radiocarbon dates table.")

            # There are two entries for Hassi Ouenzga with the same bp and std
            # but different lab numbers. The original bug showed both.
            # The fix should only show one.
            if len(rows) == 21:
                print("Test passed: Duplicate radiocarbon dates are not displayed.")
            else:
                print(f"Test failed: Expected 21 row, but found {len(rows)}.")

            # Capture a screenshot for verification
            await page.screenshot(path="tests/hassi_ouenzga_profile.png")

        finally:
            await browser.close()
            server_process.terminate()

if __name__ == "__main__":
    asyncio.run(main())

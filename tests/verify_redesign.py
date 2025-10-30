
import asyncio
from playwright.async_api import async_playwright
import pytest
import os
import sys

# Add the root of the project to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from tests.utils import run_test_server_and_check

async def run_verification(playwright, server_port, labnr):
    browser = await playwright.chromium.launch()
    page = await browser.new_page()

    # Construct the URL to the profile page
    url = f"http://localhost:{server_port}/profile.html?labnr={labnr}"
    await page.goto(url)

    # Check for the main title
    await page.wait_for_selector('#profile-site-title')

    # Check for the main sections
    await page.wait_for_selector('.profile-grid')
    await page.wait_for_selector('.profile-left')
    await page.wait_for_selector('.profile-right')
    await page.wait_for_selector('.additional-tables-section')

    # Take a screenshot
    screenshot_path = "jules-scratch/profile_redesign_verify.png"
    await page.screenshot(path=screenshot_path)
    print(f"Screenshot saved to {screenshot_path}")

    await browser.close()

@pytest.mark.asyncio
async def test_profile_page_redesign():
    port = 8000
    labnr = "Gif-6184"

    async def main_test():
        async with async_playwright() as playwright:
            await run_verification(playwright, port, labnr)

    await run_test_server_and_check(port, main_test, "C14")

if __name__ == "__main__":
    async def main():
        port = 8000
        labnr = "Gif-6184"

        async def main_test():
            async with async_playwright() as playwright:
                await run_verification(playwright, port, labnr)

        await run_test_server_and_check(port, main_test, "C14")

    asyncio.run(main())

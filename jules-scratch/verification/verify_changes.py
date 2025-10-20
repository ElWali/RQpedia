
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            # Navigate to the profile page for a specific site ID
            await page.goto("http://localhost:8000/profile.html?id=66294", wait_until='networkidle')

            # Wait for the target element to be visible
            changelog_section = await page.wait_for_selector('#changelog', state='visible', timeout=10000)

            # Take a screenshot of the entire page
            await page.screenshot(path="jules-scratch/verification/screenshot.png")
            print("Screenshot saved to jules-scratch/verification/screenshot.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Capture a screenshot even if an error occurs to aid debugging
            await page.screenshot(path="jules-scratch/verification/error_screenshot.png")
            print("Error screenshot saved to jules-scratch/verification/error_screenshot.png")

        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(main())

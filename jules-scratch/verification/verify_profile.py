
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the profile page with a specific labnr
        page.goto("http://localhost:8000/profile.html?labnr=MC-557")

        # Wait for the page to be fully loaded
        page.wait_for_selector("text=Direct References")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/profile_verification.png")

        browser.close()

if __name__ == "__main__":
    run()

import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    try:
        page.goto("http://localhost:8081/Ask/Ask1v1.html", timeout=60000)

        # Fill the search box and press Enter
        page.get_by_placeholder("Search any place (e.g., Statue of Liberty, Tokyo, Sahara Desert)").fill("Eiffel Tower")
        page.get_by_placeholder("Search any place (e.g., Statue of Liberty, Tokyo, Sahara Desert)").press("Enter")

        # Wait for the #info element to be visible and contain text
        info_element = page.locator("#info")
        expect(info_element).to_be_visible(timeout=30000)
        expect(info_element).not_to_be_empty(timeout=30000)

        # Take a screenshot
        screenshot_path = "material_design_screenshot.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

    except Exception as e:
        print(f"An error occurred: {e}")
        # Take a screenshot on error for debugging
        page.screenshot(path="error_screenshot.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
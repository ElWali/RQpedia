from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:8081/Ask/Ask1v1.html")

    # Search for a location
    search_input = page.locator('#search-input')
    search_input.type('Paris')
    search_input.press('Enter')

    # Wait for the result to be visible
    location_info = page.locator('#location-info')
    expect(location_info).to_be_visible(timeout=10000)

    # Take a screenshot of the results area
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
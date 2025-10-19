
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Verify index.html
    page.goto("http://localhost:8000/index.html")
    page.wait_for_selector('#map')
    page.screenshot(path="jules-scratch/verification/index_page_restored.png")

    # Verify navigation to sites.html
    page.click('a:has-text("Browse")')
    page.wait_for_selector('table')
    page.screenshot(path="jules-scratch/verification/sites_page_from_index.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

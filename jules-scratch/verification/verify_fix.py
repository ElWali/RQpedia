from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:8000/DataXplorer.html")
    page.wait_for_selector('#map .leaflet-marker-icon')
    page.screenshot(path="jules-scratch/verification/dataxplorer_fix_verify.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

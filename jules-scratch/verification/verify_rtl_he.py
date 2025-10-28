from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Verify DataXplorer.html in Arabic
    page.goto("http://localhost:8000/DataXplorer.html?lang=ar")
    page.screenshot(path="jules-scratch/verification/dataxplorer_ar.png")

    # Verify profile.html in Arabic
    page.goto("http://localhost:8000/profile.html?site=Jebel%20Irhoud&lang=ar")
    page.screenshot(path="jules-scratch/verification/profile_ar.png")

    # Verify DataXplorer.html in Hebrew
    page.goto("http://localhost:8000/DataXplorer.html?lang=he")
    page.screenshot(path="jules-scratch/verification/dataxplorer_he.png")

    # Verify profile.html in Hebrew
    page.goto("http://localhost:8000/profile.html?site=Jebel%20Irhoud&lang=he")
    page.screenshot(path="jules-scratch/verification/profile_he.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

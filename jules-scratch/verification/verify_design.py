from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    page.goto("http://localhost:8000")
    page.screenshot(path="jules-scratch/verification/homepage.png")

    page.click("text=Browse data")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="jules-scratch/verification/sites.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)

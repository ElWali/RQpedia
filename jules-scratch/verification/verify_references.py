
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://localhost:8000/profile.html?id=Abri%20de%20la%20Borie-del-Rey')
    page.screenshot(path='jules-scratch/verification/verification.png')
    browser.close()

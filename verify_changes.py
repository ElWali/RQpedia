import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # --- Test Search Functionality ---
    page.goto("http://localhost:8081/RQpedia/index.html")

    # Fill the search box and click the search button
    page.get_by_placeholder("Search for archeological sites").fill("Abri")
    page.get_by_role("button", name="Search").click()

    # Wait for the results page to load
    page.wait_for_url("**/results.html?q=Abri")

    # Verify the results page
    page.wait_for_selector("h1")
    expect(page.locator("h1")).to_contain_text("Abri")
    page.screenshot(path="search_results.png")


    # --- Test "Surprise Me" Functionality ---
    page.goto("http://localhost:8081/RQpedia/index.html")

    # Click the "Surprise Me" button
    page.get_by_role("button", name="Surprise Me!").click()

    # Wait for the results page to load
    page.wait_for_url("**/results.html?q=**")

    # Verify that the results page has loaded with a site
    expect(page.locator("h1")).not_to_be_empty()
    page.screenshot(path="surprise_me_results.png")


    browser.close()

with sync_playwright() as playwright:
    run(playwright)
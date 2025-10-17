from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Start the server in the background
    # This is not ideal, but for this self-contained script it's the easiest way
    # In a real-world scenario, the server would be started as a separate process
    page.goto("http://localhost:8080/Ask/Ask1v0.html")

    searchInput = page.locator('#search-input')
    map_element = page.locator('#map')
    locationInfo = page.locator('#location-info')
    markerSelector = '.leaflet-marker-icon'

    # 1. Perform a search to get a marker on the map
    searchInput.fill('Eiffel Tower')
    searchInput.press('Enter')

    # 2. Wait for the search to complete and the marker to be added.
    expect(locationInfo).to_be_visible(timeout=15000)
    expect(page.locator(markerSelector)).to_be_visible()

    # 3. Click on the map to trigger the state reset
    map_element.click(position={ 'x': 100, 'y': 100 })

    # 4. Assert that the marker has been removed
    expect(page.locator(markerSelector)).not_to_be_visible()

    # 5. Take a screenshot to visually verify the fix
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
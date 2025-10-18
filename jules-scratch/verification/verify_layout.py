from playwright.sync_api import Page, expect

def test_layout_change(page: Page):
    """
    This test verifies that the map is at the top and the search bar is at the bottom.
    """
    # 1. Arrange: Go to the page.
    page.goto("http://localhost:8081/Ask/Ask1v3.html")

    # 2. Assert: Check the layout.
    # We can't easily check the visual order, but we can check the element order in the DOM.
    body = page.locator("body")
    expect(body.locator("body > div:first-child")).to_have_id("map-container")
    expect(body.locator("body > header:last-child")).to_be_visible()


    # 3. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")
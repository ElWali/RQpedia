from playwright.sync_api import Page, expect

def test_profile_page_fixes(page: Page):
    """
    Tests that all three bugs on the Jebel Irhoud profile page have been fixed.
    """
    # Navigate to the profile page for Jebel Irhoud
    page.goto("http://localhost:8000/profile.html?site=Jebel%20Irhoud")

    # 1. Verify the "Basic Info" section title does not have a leading dot
    basic_info_title = page.locator("summary", has_text="Basic Info")
    expect(basic_info_title).to_have_text("Basic Info")

    # 2. Verify the material distribution chart is fully visible
    material_chart = page.locator("#materialChart")
    expect(material_chart).to_be_visible()

    # 3. Verify the calibration graph shows the "No valid C14 data" message
    no_data_message = page.locator("#graph-placeholder p")
    expect(no_data_message).to_have_text("No valid C14 data available for calibration.")

    # Take a screenshot for visual verification
    page.screenshot(path="tests/jebel_irhoud_fixes.png")

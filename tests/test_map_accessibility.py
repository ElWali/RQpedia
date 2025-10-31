# tests/test_map_accessibility.py
import pytest
from playwright.sync_api import Page, expect

def test_toggle_control_accessibility(page: Page, start_server):
    """Tests that the map toggle control has the correct accessibility attributes."""
    page.goto(f"{start_server}/index.html")

    # Locate the toggle control link
    toggle_control = page.locator("#toggle-layer")

    # Wait for the element to be visible
    toggle_control.wait_for(state="visible")

    # Expect the element to have role="button"
    expect(toggle_control).to_have_attribute("role", "button")

    # Expect the element to have the correct aria-label
    expect(toggle_control).to_have_attribute("aria-label", "Toggle Heatmap/Markers")

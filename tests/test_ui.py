
import pytest
from playwright.sync_api import sync_playwright, expect
import subprocess
import time
import os
import json

PORT = 8008
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session")
def http_server():
    # Start a server in a separate process
    server_process = subprocess.Popen(
        ["python3", "-m", "http.server", str(PORT), "--directory", "C14"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    # Give the server a moment to start
    time.sleep(1)
    yield f"http://localhost:{PORT}"
    # Clean up: terminate the server process
    server_process.terminate()
    server_process.wait()

def test_reference_year_undefined_string(http_server):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Mock GeoJSON data with the problematic "undefined" year
        mock_geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "site": "Test Site for Undefined Year",
                        "labnr": "XYZ-123",
                        "references": [
                            {"author": "Test Author", "year": "undefined"},
                            {"author": "Another Author", "year": "2023"}
                        ]
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [ -5.55, 33.88 ]
                    }
                }
            ]
        }

        # Intercept the request for the data file and respond with mock data
        def handle_route(route):
            if "data/Output_full.json" in route.request.url:
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps(mock_geojson)
                )
            else:
                route.continue_()

        page.route("**/data/Output_full.json", handle_route)

        page.goto(f"{http_server}/index.html")

        # Click on the map marker to trigger the sidebar UI update
        page.wait_for_selector(".leaflet-marker-icon")
        page.click(".leaflet-marker-icon")

        # The element where the details are rendered
        site_details_element = page.locator("#site-details")

        # Assert that the text "(undefined)" is NOT present
        expect(site_details_element).not_to_contain_text("(undefined)")

        # Assert that the author's name IS present
        expect(site_details_element).to_contain_text("Test Author")

        # Assert that the other valid reference IS present
        expect(site_details_element).to_contain_text("Another Author (2023)")

        browser.close()

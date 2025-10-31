import pytest
from playwright.sync_api import Page, expect
import subprocess
import time
import os
import signal
import json

PORT = 8000
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session", autouse=True)
def start_server_with_xss_data():
    # Load the original data
    with open("C14/data/Output_full.json", "r") as f:
        data = json.load(f)

    # Find a feature to inject the XSS payload into
    labnr = None
    for feature in data["features"]:
        if feature["properties"].get("references"):
            feature["properties"]["references"].append({
                "author": "<script>console.log('XSS')</script>",
                "year": "2025"
            })
            labnr = feature["properties"]["labnr"]
            break

    if labnr is None:
        pytest.skip("No feature with references found to inject XSS payload.")

    # Write the modified data to a temporary file
    with open("C14/data/Output_full_xss.json", "w") as f:
        json.dump(data, f)

    # Rename the original file and replace it with the modified one
    os.rename("C14/data/Output_full.json", "C14/data/Output_full.json.bak")
    os.rename("C14/data/Output_full_xss.json", "C14/data/Output_full.json")

    # Start the server
    command = ["python3", "-m", "http.server", str(PORT), "--directory", "C14"]
    server_process = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)

    yield labnr # Pass the labnr to the test

    # Stop the server and restore the original data
    os.kill(server_process.pid, signal.SIGTERM)
    server_process.wait()
    os.rename("C14/data/Output_full.json.bak", "C14/data/Output_full.json")


def test_xss_vulnerability_in_references(page: Page, start_server_with_xss_data):
    labnr = start_server_with_xss_data
    page.goto(f"{BASE_URL}/profile.html?labnr={labnr}")

    # After the fix, the script tag should be sanitized and not present as a raw tag
    content = page.content()
    assert "<script>console.log('XSS')</script>" not in content
    assert "&lt;script&gt;console.log('XSS')&lt;/script&gt;" in content

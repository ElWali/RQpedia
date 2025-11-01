import asyncio
import http.server
import socketserver
import threading
import json
from playwright.async_api import async_playwright

PORT = 8000
SCREENSHOT_PATH = "tests/c14_profile_page_verification.png"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="C14", **kwargs)

def get_first_labnr():
    """Reads the first feature's labnr from the GeoJSON file."""
    try:
        with open("C14/data/output_full.geojson", "r") as f:
            data = json.load(f)
            if data["features"]:
                return data["features"][0]["properties"]["labnr"]
    except (IOError, json.JSONDecodeError, KeyError) as e:
        print(f"Error reading labnr from data file: {e}")
        return None

async def main():
    labnr_to_test = get_first_labnr()
    if not labnr_to_test:
        print("Could not retrieve a labnr to test. Aborting.")
        return

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            url = f"http://localhost:{PORT}/profile.html?labnr={labnr_to_test}"
            print(f"Navigating to {url}")

            await page.goto(url, wait_until="networkidle")

            # Wait for the content to be populated
            await page.wait_for_selector(".collapsible-section")
            await page.wait_for_selector("#references-list")
            await page.wait_for_selector("#phasing-list")

            print(f"Content loaded. Taking screenshot...")
            await page.screenshot(path=SCREENSHOT_PATH, full_page=True)
            await browser.close()
            print(f"Screenshot saved to {SCREENSHOT_PATH}")

        httpd.shutdown()

if __name__ == "__main__":
    asyncio.run(main())

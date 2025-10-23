import asyncio
import http.server
import socketserver
import threading
from playwright.async_api import async_playwright

PORT = 8000
SCREENSHOT_PATH = "tests/profile_page_verification.png"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="VX", **kwargs)

async def main():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            # ID for a site with both typological and reference data
            site_id_to_test = "66294"
            url = f"http://localhost:{PORT}/profile.html?id={site_id_to_test}"

            await page.goto(url, wait_until="networkidle")

            # Wait for the content to be populated
            await page.wait_for_selector("#c14-table tbody tr")
            await page.wait_for_selector("#typo-table tbody tr")
            await page.wait_for_selector("#references-container p")

            await page.screenshot(path=SCREENSHOT_PATH)
            await browser.close()

        httpd.shutdown()

if __name__ == "__main__":
    asyncio.run(main())

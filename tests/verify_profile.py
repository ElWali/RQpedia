import asyncio
import http.server
import socketserver
import threading
from playwright.async_api import async_playwright

PORT = 8000
SCREENSHOT_PATH = "tests/profile_page_verification.png"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="FinalVersion", **kwargs)

async def main():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            # A site with radiocarbon and typological data
            site_name_to_test = "Abri Rihane"
            url = f"http://localhost:{PORT}/profile.html?site={site_name_to_test}"

            await page.goto(url, wait_until="networkidle")

            # Wait for the content to be populated
            await page.wait_for_selector("#rc-body tr")
            await page.wait_for_selector("#typo-body tr")
            await page.wait_for_selector("#bib-content pre")

            await page.screenshot(path=SCREENSHOT_PATH)
            await browser.close()

        httpd.shutdown()

if __name__ == "__main__":
    asyncio.run(main())

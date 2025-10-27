import asyncio
import http.server
import socketserver
import threading
import os
import sys
from playwright.async_api import async_playwright, expect

PORT = 8000
# Make BASE_DIR an absolute path to be safe
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'FinalVersion'))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        if sys.version_info >= (3, 7):
            # The 'directory' keyword argument was introduced in Python 3.7.
            super().__init__(*args, directory=BASE_DIR, **kwargs)
        else:
            # For older versions, we'll handle the directory change in do_GET.
            self.directory = BASE_DIR
            super().__init__(*args, **kwargs)

    def do_GET(self):
        if sys.version_info < (3, 7):
            original_cwd = os.getcwd()
            try:
                os.chdir(self.directory)
                super().do_GET()
            finally:
                os.chdir(original_cwd)
        else:
            super().do_GET()


async def main():
    # Use a socket to find a free port
    with socketserver.TCPServer(("127.0.0.1", 0), None) as s:
        free_port = s.server_address[1]

    httpd = socketserver.TCPServer(("", free_port), Handler)
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    print(f"Server started at http://localhost:{free_port}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto(f"http://localhost:{free_port}/DataXplorer.html", wait_until="networkidle")

            record_count_element = page.locator("#record-count")

            # Increased timeout to give the page plenty of time to load the data
            await expect(record_count_element).to_have_text("1,288", timeout=15000)

            print("✅ Test passed: Record count is correctly displayed as 1,288.")

        except Exception as e:
            print(f"❌ Test failed: {e}")
            # Take a screenshot for debugging
            await page.screenshot(path="tests/failure_screenshot.png")
            print("📷 Screenshot saved to tests/failure_screenshot.png")
        finally:
            await browser.close()
            httpd.shutdown()
            print("Server stopped.")

if __name__ == "__main__":
    # First, make sure any lingering server is stopped
    os.system("pkill -f 'http.server'")
    asyncio.run(main())

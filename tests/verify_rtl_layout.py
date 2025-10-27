import pytest
from playwright.sync_api import sync_playwright
import os
import http.server
import socketserver
import threading

PORT = 8008
BASE_URL = f"http://localhost:{PORT}/FinalVersion"

class Server(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='.', **kwargs)

@pytest.fixture(scope="session")
def http_server():
    with socketserver.TCPServer(("", PORT), Server) as httpd:
        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()
        yield httpd
        httpd.shutdown()

def test_rtl_layout(http_server):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        os.makedirs("rtl_screenshots", exist_ok=True)

        # Test DataXplorer.html
        page.goto(f"{BASE_URL}/DataXplorer.html")
        page.click('button[data-lang-switcher="ar"]')
        page.wait_for_selector('html[dir="rtl"]')
        page.screenshot(path="rtl_screenshots/DataXplorer_ar.png")

        # Test profile.html for a specific site
        site_name = "Ifri Oudadane"
        page.goto(f"{BASE_URL}/profile.html?site={site_name}")
        page.click('button[data-lang-switcher="ar"]')
        page.wait_for_selector('html[dir="rtl"]')
        page.screenshot(path="rtl_screenshots/profile_ar.png")

        browser.close()

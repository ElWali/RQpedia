from playwright.sync_api import sync_playwright, TimeoutError

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console messages
        page.on("console", lambda msg: print(f"PAGE LOG: {msg.text}"))

        try:
            page.goto("http://localhost:8000/test_index.html", wait_until="load")
            # Wait for either success or failure class to be present on the status element
            page.wait_for_selector("#test-status.success, #test-status.failure", timeout=10000)

            status_element = page.locator("#test-status")
            status_text = status_element.text_content()

            print(f"Test Result: {status_text}")

            if "FAILED" in status_text:
                print("Test failed. See screenshot for details.")
            else:
                print("Test passed.")

        except TimeoutError:
            print("Test timed out. The test result element did not appear.")

        finally:
            page.screenshot(path="test_result.png")
            browser.close()

run()

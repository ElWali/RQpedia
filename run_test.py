from playwright.sync_api import sync_playwright
import json

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:8000/index.html', wait_until="domcontentloaded")

        # Get the expected number of markers from output.json
        with open('Ask/V2/output.json', 'r') as f:
            places = json.load(f)
        expected_marker_count = len([p for p in places if p.get('lat') and p.get('lon')])

        # Wait for the markers to be added to the map
        page.wait_for_function(f'window.searchResultLayer && window.searchResultLayer.getLayers().length === {expected_marker_count}')

        marker_count = page.evaluate('window.searchResultLayer.getLayers().length')

        print(f"Found {marker_count} markers on the map.")
        print(f"Expected {expected_marker_count} markers.")

        if marker_count == expected_marker_count:
            print('Test passed successfully!')
        else:
            print('Test failed!')

        page.screenshot(path='test_result.png')
        browser.close()

if __name__ == '__main__':
    run_test()

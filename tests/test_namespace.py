from playwright.sync_api import Page

def test_render_calibration_graph_not_in_global_scope(page: Page):
    """
    Tests that the renderCalibrationGraph function is not in the global scope.
    """
    page.goto("http://localhost:8000/profile.html?labnr=Gif-6184")

    # Check if renderCalibrationGraph is defined in the global scope
    is_global = page.evaluate("typeof window.renderCalibrationGraph === 'function'")

    # Assert that the function is not in the global scope
    assert is_global is False

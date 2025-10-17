const { test, expect } = require('@playwright/test');

test.describe('GeoSearch Manual Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/Ask/Ask1v0.html');
  });

  test('should perform a manual search when Enter is pressed', async ({ page }) => {
    const searchInput = await page.locator('#search-input');
    await searchInput.type('Tokyo');
    await searchInput.press('Enter');

    // Wait for the search to complete and the location info to be updated
    const locationInfo = await page.locator('#location-info');
    await expect(locationInfo).toBeVisible({ timeout: 10000 });

    const infoTitle = await page.locator('#info-title');
    await expect(infoTitle).toContainText('Tokyo');
  });
});
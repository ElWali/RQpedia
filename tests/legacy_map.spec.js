const { test, expect } = require('@playwright/test');

test.describe('Atlas Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/RQpedia/map.html');
  });

  test('should initialize the map', async ({ page }) => {
    const map = await page.locator('#map');
    await expect(map).toBeVisible();
  });
});
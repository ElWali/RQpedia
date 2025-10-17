const { test, expect } = require('@playwright/test');

test.describe('Atlas Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080');
  });

  test('should initialize the map', async ({ page }) => {
    const map = await page.locator('#map');
    await expect(map).toBeVisible();
  });

  test('should change center on dblclick', async ({ page }) => {
    const initialCenter = await page.evaluate(() => window.atlasInstance.getCenter());
    await page.dblclick('#map', { position: { x: 100, y: 100 } });
    await page.waitForTimeout(500); // Wait for animation
    const newCenter = await page.evaluate(() => window.atlasInstance.getCenter());
    expect(newCenter.lat).not.toBe(initialCenter.lat);
    expect(newCenter.lon).not.toBe(initialCenter.lon);
  });

  test('should zoom in', async ({ page }) => {
    const initialZoom = await page.evaluate(() => window.atlasInstance.getZoom());
    await page.click('button[title="Zoom in"]');
    await page.waitForTimeout(500); // Wait for animation
    const newZoom = await page.evaluate(() => window.atlasInstance.getZoom());
    expect(newZoom).toBe(initialZoom + 1);
  });

  test('should zoom out', async ({ page }) => {
    const initialZoom = await page.evaluate(() => window.atlasInstance.getZoom());
    await page.click('button[title="Zoom out"]');
    await page.waitForTimeout(500); // Wait for animation
    const newZoom = await page.evaluate(() => window.atlasInstance.getZoom());
    expect(newZoom).toBe(initialZoom - 1);
  });

  test('should pan the map', async ({ page }) => {
    const initialCenter = await page.evaluate(() => window.atlasInstance.getCenter());
    await page.dragAndDrop('#map', '#map', {
      sourcePosition: { x: 100, y: 100 },
      targetPosition: { x: 200, y: 200 },
    });
    await page.waitForTimeout(500); // Wait for animation
    const newCenter = await page.evaluate(() => window.atlasInstance.getCenter());
    expect(newCenter.lat).not.toBe(initialCenter.lat);
    expect(newCenter.lon).not.toBe(initialCenter.lon);
  });

  test('should add a marker', async ({ page }) => {
    await page.evaluate(() => {
      const marker = new window.AtlasMarker({ lat: 51.505, lon: -0.09 });
      window.atlasInstance.addOverlay(marker);
    });
    const marker = await page.locator('.atlas-marker');
    await expect(marker).toBeVisible();
  });
});
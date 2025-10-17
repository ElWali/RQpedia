const { test, expect } = require('@playwright/test');

test.describe('RQpedia Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/RQpedia/index.html');
  });

  test('should display the hero section', async ({ page }) => {
    const hero = await page.locator('.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toHaveText('Welcome to QRpedia');
  });

  test('should display the features section', async ({ page }) => {
    const features = await page.locator('.features');
    await expect(features).toBeVisible();
    await expect(features.locator('h2')).toHaveText('Explore the Past with Powerful Tools');
  });

  test('should have three feature cards', async ({ page }) => {
    const cards = await page.locator('.card');
    await expect(cards).toHaveCount(3);
  });

  test('should navigate to the map page when "Start Exploring" is clicked', async ({ page }) => {
    await page.click('.cta-button');
    await expect(page).toHaveURL('http://localhost:8080/RQpedia/map.html');
    const map = await page.locator('#map');
    await expect(map).toBeVisible();
  });
});
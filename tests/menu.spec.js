const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

test.describe('Menu', () => {
  test('apre la vista menu', async ({ page }) => {
    await gotoView(page, 'menu');
    await expect(page.locator('#menu-content')).toBeVisible();
  });

  test('crea un prodotto nuovo', async ({ page }) => {
    const name = uniqueName('Prodotto Test');
    await gotoView(page, 'menu');

    await page.locator('#btn-new-product').click();
    await expect(page.locator('#pm-name')).toBeVisible();

    await page.locator('#pm-name').fill(name);
    await page.locator('#pm-price').fill('4.50');
    await page.locator('#pm-desc').fill('Creato da Playwright');
    await page.locator('[data-modal-confirm]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    await expect(page.locator('#menu-content')).toContainText(name);
  });

  test('modifica un prodotto creato dal test', async ({ page }) => {
    const original = uniqueName('Prodotto Modifica');
    const updated  = `${original} Edit`;
    await gotoView(page, 'menu');

    await page.locator('#btn-new-product').click();
    await expect(page.locator('#pm-name')).toBeVisible();
    await page.locator('#pm-name').fill(original);
    await page.locator('#pm-price').fill('5.00');
    await page.locator('[data-modal-confirm]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    await expect(page.locator('#menu-content')).toContainText(original);

    const card = page.locator('#menu-content .card').filter({ hasText: original }).first();
    await expect(card).toBeVisible();
    await card.locator('button[data-edit]').click();

    await expect(page.locator('#pm-name')).toBeVisible();
    await page.locator('#pm-name').fill(updated);
    await page.locator('[data-modal-confirm]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    await expect(page.locator('#menu-content')).toContainText(updated);
  });
});

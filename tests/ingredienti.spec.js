const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

test.describe('Ingredienti', () => {
  test('apre la vista ingredienti', async ({ page }) => {
    await gotoView(page, 'ingredienti');
    await expect(page.locator('#view-container')).toBeVisible();
  });

  test('crea un nuovo ingrediente', async ({ page }) => {
    const name = uniqueName('Ingrediente Test');
    await gotoView(page, 'ingredienti');

    await page.getByRole('button', { name: /nuovo ingrediente/i }).click();
    await expect(page.locator('#im-name')).toBeVisible();

    await page.locator('#im-name').fill(name);
    await page.locator('#im-cost').fill('3.50');
    await page.locator('[data-modal-confirm]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    await expect(page.locator('#view-container')).toContainText(name);
  });

  test('modifica un ingrediente creato dal test', async ({ page }) => {
    const original = uniqueName('Ing Modifica');
    const updated  = `${original} Edit`;
    await gotoView(page, 'ingredienti');

    await page.getByRole('button', { name: /nuovo ingrediente/i }).click();
    await expect(page.locator('#im-name')).toBeVisible();
    await page.locator('#im-name').fill(original);
    await page.locator('#im-cost').fill('2.00');
    await page.locator('[data-modal-confirm]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    await expect(page.locator('#view-container')).toContainText(original);

    const row = page.locator('tr').filter({ hasText: original }).first();
    await expect(row).toBeVisible();
    await row.locator('button[data-edit]').click();

    await expect(page.locator('#im-name')).toBeVisible();
    await page.locator('#im-name').fill(updated);
    await page.locator('[data-modal-confirm]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    await expect(page.locator('#view-container')).toContainText(updated);
  });
});

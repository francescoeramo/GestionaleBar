const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

test.describe('Bar Gestionale CRUD', () => {
  test('fornitori: crea e cerca fornitore', async ({ page }) => {
    const name = uniqueName('Fornitore Test');
    await gotoView(page, 'fornitori');

    await page.getByRole('button', { name: /nuovo fornitore/i }).click();
    await page.locator('#sup-form [name="name"]').fill(name);
    await page.locator('#sup-form [name="contact_name"]').fill('Mario Test');
    await page.locator('#sup-form [name="phone"]').fill('0100000000');
    await page.locator('#sup-form [name="email"]').fill('mario.test@example.com');
    await page.locator('#sup-form [name="notes"]').fill('Creato da Playwright');
    await page.locator('#btn-sup-submit').click();

    await expect(page.locator('#sup-search')).toBeVisible();
    await page.locator('#sup-search').fill(name);
    await expect(page.locator('#sup-form-modal')).not.toBeVisible();
  });

  test('fornitori: crea, apre dettaglio e modifica fornitore', async ({ page }) => {
    const originalName = uniqueName('Fornitore Modifica');
    const updatedName = `${originalName} Edit`;
    await gotoView(page, 'fornitori');

    await page.getByRole('button', { name: /nuovo fornitore/i }).click();
    await page.locator('#sup-form [name="name"]').fill(originalName);
    await page.locator('#sup-form [name="contact_name"]').fill('Mario Test');
    await page.locator('#btn-sup-submit').click();

    await expect(page.locator('#sup-search')).toBeVisible();
    await page.locator('#sup-search').fill(originalName);

    const card = page.locator('#sup-grid .card').filter({
      hasText: originalName
    }).first();

    await expect(card).toBeVisible();
    await card.click();

    await expect(page.locator('#sup-detail-modal')).toBeVisible();
    await page.locator('#btn-edit-from-detail').click();
    await expect(page.locator('#sup-form-modal')).toBeVisible();

    await page.locator('#sup-form [name="name"]').fill(updatedName);
    await page.locator('#btn-sup-submit').click();

    await page.locator('#sup-search').fill(updatedName);
    await expect(page.locator('#sup-grid .card').filter({ hasText: updatedName }).first()).toBeVisible();
  });

  test('magazzino: apre modal e registra carico', async ({ page }) => {
    await gotoView(page, 'magazzino');

    const firstRow = page.locator('#inv-table-wrap tbody tr').first();
    await expect(firstRow).toBeVisible();

    await firstRow.getByRole('button', { name: 'Movimenta' }).click();

    await expect(page.locator('#mov-modal')).toBeVisible();
    await page.locator('#mov-form [name="type"]').selectOption('carico');
    await page.locator('#mov-form [name="qty"]').fill('2');
    await page.locator('#mov-form [name="note"]').fill('Carico test Playwright');
    await page.locator('#mov-form button[type="submit"]').click();
  });

  test('magazzino: registra rettifica e aggiorna soglia minima', async ({ page }) => {
    await gotoView(page, 'magazzino');

    const firstRow = page.locator('#inv-table-wrap tbody tr').first();
    await expect(firstRow).toBeVisible();

    await firstRow.getByRole('button', { name: 'Movimenta' }).click();
    await expect(page.locator('#mov-modal')).toBeVisible();

    await page.locator('#mov-form [name="type"]').selectOption('rettifica');
    await page.locator('#mov-form [name="qty"]').fill('5');
    await page.locator('#mov-form [name="min_stock"]').fill('2');
    await page.locator('#mov-form [name="note"]').fill('Rettifica test');
    await page.locator('#mov-form button[type="submit"]').click();
  });

  test('tema toggle funziona', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-theme-toggle]')).toBeVisible();

    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await page.locator('[data-theme-toggle]').click();
    const after = await html.getAttribute('data-theme');

    expect(after).not.toBe(before);
  });
});

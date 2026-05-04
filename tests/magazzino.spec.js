const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

test.describe('Magazzino', () => {
  test('apre la vista magazzino', async ({ page }) => {
    await gotoView(page, 'magazzino');
    await expect(page.locator('#inv-table-wrap')).toBeVisible();
  });

  test('mostra i KPI di stock', async ({ page }) => {
    await gotoView(page, 'magazzino');
    await expect(page.locator('#stock-kpis')).toBeVisible();
  });

  test('filtra per nome ingrediente', async ({ page }) => {
    await gotoView(page, 'magazzino');
    // attendi che la tabella sia caricata
    await expect(page.locator('#inv-table-wrap')).toBeVisible();
    await page.locator('#mag-search').fill('zzz_nessun_risultato_xyz');
    await expect(page.locator('#inv-table-wrap')).toContainText('Nessun ingrediente trovato');
  });

  test('apre il modal movimenta', async ({ page }) => {
    await gotoView(page, 'magazzino');
    // attendi che ci sia almeno un bottone Movimenta
    const btn = page.locator('button', { hasText: 'Movimenta' }).first();
    await expect(btn).toBeVisible();
    await btn.click();
    // il modal deve contenere il form
    await expect(page.locator('#mov-form')).toBeVisible();
  });

  test('chiude il modal movimenta', async ({ page }) => {
    await gotoView(page, 'magazzino');
    const btn = page.locator('button', { hasText: 'Movimenta' }).first();
    await btn.click();
    await expect(page.locator('#mov-form')).toBeVisible();

    await page.locator('#btn-close-mov').click();
    await expect(page.locator('#mov-form')).not.toBeVisible();
  });
});

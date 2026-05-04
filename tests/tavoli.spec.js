const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

test.describe('Tavoli', () => {
  test('apre la vista tavoli', async ({ page }) => {
    await gotoView(page, 'tavoli');
    await expect(page.locator('#tables-grid')).toBeVisible();
  });

  test('mostra almeno un tavolo', async ({ page }) => {
    await gotoView(page, 'tavoli');
    const cards = page.locator('#tables-grid .table-card');
    await expect(cards.first()).toBeVisible();
  });

  test('apre modal coperti su tavolo libero', async ({ page }) => {
    await gotoView(page, 'tavoli');

    // clicca il primo tavolo libero
    const freeCard = page.locator('#tables-grid .table-card.free').first();
    await expect(freeCard).toBeVisible();
    await freeCard.click();

    // il modal deve contenere l'input coperti
    await expect(page.locator('#inp-covers')).toBeVisible();
  });

  test('annulla apertura tavolo', async ({ page }) => {
    await gotoView(page, 'tavoli');

    const freeCard = page.locator('#tables-grid .table-card.free').first();
    await freeCard.click();
    await expect(page.locator('#inp-covers')).toBeVisible();

    await page.locator('[data-modal-cancel]').click();
    await page.locator('[data-app-modal]').waitFor({ state: 'detached' });

    // siamo ancora sulla vista tavoli
    await expect(page.locator('#tables-grid')).toBeVisible();
  });

  test('aggiorna la lista tavoli col bottone refresh', async ({ page }) => {
    await gotoView(page, 'tavoli');
    await page.locator('#btn-refresh-tavoli').click();
    await expect(page.locator('#tables-grid .table-card').first()).toBeVisible();
  });
});

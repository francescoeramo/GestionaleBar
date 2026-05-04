const { test, expect } = require('@playwright/test');

    test.use({
      baseURL: process.env.BASE_URL || 'http://127.0.0.1:8000'
    });

    async function gotoView(page, hash) {
      await page.goto(`/#${hash}`);
      await expect(page.locator('#view-container')).toBeVisible();
      await expect(page.locator('.sidebar-nav')).toBeVisible();
    }

test('fornitori apre form nuovo fornitore', async ({ page }) => {
  await gotoView(page, 'fornitori');
  await page.getByRole('button', { name: /\+ nuovo fornitore/i }).click();
  await expect(page.locator('#sup-form-modal')).toBeVisible();
});

test.describe('Bar Gestionale smoke e pulsanti principali', () => {
      test('navigazione sidebar', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#view-container')).toBeVisible();

      const views = ['tavoli', 'pos', 'menu', 'ingredienti', 'magazzino', 'fornitori'];
      for (const view of views) {
        await page.locator(`.nav-item[data-view="${view}"]`).click();
        await expect(page).toHaveURL(new RegExp(`#${view}$|#${view}\\?`));
      }
    });

  test('magazzino apre modal movimenta se esiste almeno una riga', async ({ page }) => {
    await gotoView(page, 'magazzino');
    const btn = page.locator('button:has-text("Movimenta")').first();
    if (await btn.count()) {
      await btn.click();
      await expect(page.locator('#mov-modal')).toBeVisible();
      await page.locator('#btn-close-mov').click();
    }
  });

  test('ricerca fornitori digita senza errori', async ({ page }) => {
    await gotoView(page, 'fornitori');
    const input = page.locator('#sup-search');
    await input.fill('test');
    await expect(input).toHaveValue('test');
  });

  test('magazzino filtro stato funziona', async ({ page }) => {
    await gotoView(page, 'magazzino');
    const filter = page.locator('#mag-filter');
    await filter.selectOption('ok');
    await expect(filter).toHaveValue('ok');
  });

  test('tema toggle cliccabile', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-theme-toggle]')).toBeVisible();

      const html = page.locator('html');
      const before = await html.getAttribute('data-theme');
      await page.locator('[data-theme-toggle]').click();
      const after = await html.getAttribute('data-theme');

      expect(after).not.toBe(before);
    });
});

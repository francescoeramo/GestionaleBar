const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

test.describe('Storico', () => {
  test('apre la vista storico', async ({ page }) => {
    await gotoView(page, 'storico');
    await expect(page.locator('#st-table-wrap')).toBeVisible();
  });

  test('mostra i filtri data e stato', async ({ page }) => {
    await gotoView(page, 'storico');
    await expect(page.locator('#st-from')).toBeVisible();
    await expect(page.locator('#st-to')).toBeVisible();
    await expect(page.locator('#st-status')).toBeVisible();
  });

  test('i filtri hanno la data di oggi come default', async ({ page }) => {
    await gotoView(page, 'storico');
    const today = new Date().toISOString().slice(0, 10);
    await expect(page.locator('#st-from')).toHaveValue(today);
    await expect(page.locator('#st-to')).toHaveValue(today);
  });

  test('il bottone cerca esegue la ricerca', async ({ page }) => {
    await gotoView(page, 'storico');
    await page.locator('#st-search').click();
    // dopo la ricerca, il wrap non mostra più lo spinner
    await expect(page.locator('#st-table-wrap .loading-spinner')).not.toBeVisible();
  });

  test('il bottone reset ripristina i filtri', async ({ page }) => {
    await gotoView(page, 'storico');
    const today = new Date().toISOString().slice(0, 10);

    // cambia i filtri
    await page.locator('#st-from').fill('2020-01-01');
    await page.locator('#st-status').selectOption('cancelled');

    // reset
    await page.locator('#st-reset').click();

    await expect(page.locator('#st-from')).toHaveValue(today);
    await expect(page.locator('#st-status')).toHaveValue('');
  });
});

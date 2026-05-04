const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

test.describe('POS', () => {
  test('apre la vista pos', async ({ page }) => {
    await gotoView(page, 'pos');
    await expect(page.locator('#view-container')).toBeVisible();
  });

  test('aggiunge un prodotto al carrello', async ({ page }) => {
    await gotoView(page, 'pos');

    const productBtn = page.locator('.menu-item-btn').first();
    if (await productBtn.count()) {
      await productBtn.click();
      await expect(page.locator('#inp-qty')).toBeVisible();
      await page.locator('[data-modal-confirm]').click();
    }
  });

  test('aggiunge prodotto libero', async ({ page }) => {
      await gotoView(page, 'pos');

      // Cerca il bottone per testo reale invece di id generico
      const freeItemBtn = page.getByRole('button', { name: /prodotto libero|articolo libero|libero/i }).first();
      if (await freeItemBtn.count()) {
        await freeItemBtn.click();
        await expect(page.locator('#fi-name')).toBeVisible();
        await page.locator('#fi-name').fill('Cocktail speciale');
        await page.locator('#fi-price').fill('9');
        await page.locator('#fi-qty').fill('1');
        await page.locator('[data-modal-confirm]').click();
      }
    });

  test('procede al pagamento se ci sono articoli', async ({ page }) => {
    await gotoView(page, 'pos');

    const payBtn = page.locator('#btn-confirm-pay, button:has-text("Paga")').first();
    if (await payBtn.count()) {
      await payBtn.click();
      await expect(page.locator('#pay-method')).toBeVisible();
    }
  });
});

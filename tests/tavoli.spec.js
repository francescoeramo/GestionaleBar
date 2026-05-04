const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

test.describe('Tavoli', () => {
  test('apre la vista tavoli', async ({ page }) => {
    await gotoView(page, 'tavoli');
    await expect(page.locator('#view-container')).toBeVisible();
  });

  test('apre ordine su tavolo libero', async ({ page }) => {
    await gotoView(page, 'tavoli');

    const freeTable = page.locator('.table-card[data-status="free"]').first();
    if (await freeTable.count()) {
      await freeTable.click();
      await expect(page.locator('#inp-covers')).toBeVisible();
      await page.locator('[data-modal-confirm]').click();
    }
  });

  test('tavolo occupato mostra pulsante vai al conto', async ({ page }) => {
    await gotoView(page, 'tavoli');

    const busyTable = page.locator('.table-card[data-status="open"]').first();
    if (await busyTable.count()) {
      await busyTable.click();
      await expect(page.locator('[data-modal-confirm]')).toBeVisible();
    }
  });
});

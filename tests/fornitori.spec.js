const { test, expect } = require('@playwright/test');

async function gotoView(page, hash) {
  await page.goto(`/#${hash}`);
  await expect(page.locator('#view-container')).toBeVisible();
}

function uniqueName(prefix) {
  return `${prefix} ${Date.now()}`;
}

test.describe('Fornitori', () => {
  test('apre la vista fornitori', async ({ page }) => {
    await gotoView(page, 'fornitori');
    await expect(page.locator('#sup-grid')).toBeVisible();
  });

  test('crea un nuovo fornitore', async ({ page }) => {
    const name = uniqueName('Fornitore Test');
    await gotoView(page, 'fornitori');

    await page.locator('#btn-new-sup').click();
    await expect(page.locator('#sup-form')).toBeVisible();

    await page.locator('[name="name"]').fill(name);
    await page.locator('[name="contact_name"]').fill('Mario Rossi');
    await page.locator('[name="phone"]').fill('0984123456');
    await page.locator('#btn-sup-submit').click();

    // il modal si chiude (display:none, non detached)
    await expect(page.locator('#sup-form-modal')).not.toBeVisible();
    await expect(page.locator('#sup-grid')).toContainText(name);
  });

  test('modifica un fornitore creato dal test', async ({ page }) => {
    const original = uniqueName('Fornitore Modifica');
    const updated  = `${original} Edit`;
    await gotoView(page, 'fornitori');

    // crea
    await page.locator('#btn-new-sup').click();
    await expect(page.locator('#sup-form')).toBeVisible();
    await page.locator('[name="name"]').fill(original);
    await page.locator('#btn-sup-submit').click();
    await expect(page.locator('#sup-form-modal')).not.toBeVisible();
    await expect(page.locator('#sup-grid')).toContainText(original);

    // modifica
    const card = page.locator('#sup-grid .card').filter({ hasText: original }).first();
    await expect(card).toBeVisible();
    await card.locator('button', { hasText: 'Modifica' }).click();

    await expect(page.locator('#sup-form')).toBeVisible();
    await page.locator('[name="name"]').fill(updated);
    await page.locator('#btn-sup-submit').click();
    await expect(page.locator('#sup-form-modal')).not.toBeVisible();

    await expect(page.locator('#sup-grid')).toContainText(updated);
  });

  test('apre il dettaglio di un fornitore', async ({ page }) => {
    const name = uniqueName('Fornitore Dettaglio');
    await gotoView(page, 'fornitori');

    // crea prima un fornitore
    await page.locator('#btn-new-sup').click();
    await expect(page.locator('#sup-form')).toBeVisible();
    await page.locator('[name="name"]').fill(name);
    await page.locator('#btn-sup-submit').click();
    await expect(page.locator('#sup-form-modal')).not.toBeVisible();

    // clicca sulla card (non sui bottoni)
    const card = page.locator('#sup-grid .card').filter({ hasText: name }).first();
    await expect(card).toBeVisible();
    await card.locator('.card-title').click();

    await expect(page.locator('#sup-detail-modal')).toBeVisible();
    await expect(page.locator('#detail-title')).toContainText(name);

    // chiudi
    await page.locator('#btn-close-detail').click();
    await expect(page.locator('#sup-detail-modal')).not.toBeVisible();
  });
});

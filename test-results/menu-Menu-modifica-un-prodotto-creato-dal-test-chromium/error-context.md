# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: menu.spec.js >> Menu >> modifica un prodotto creato dal test
- Location: tests/menu.spec.js:32:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.waitFor: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-app-modal]') to be detached
    63 × locator resolved to visible <div data-app-modal="1" class="modal-overlay">…</div>

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - img "Bar Gestionale" [ref=e5]
        - generic [ref=e11]: Bar Gestionale
      - navigation [ref=e12]:
        - link "Tavoli" [ref=e13] [cursor=pointer]:
          - /url: "#tavoli"
          - img [ref=e14]
          - text: Tavoli
        - link "Comande / POS" [ref=e19] [cursor=pointer]:
          - /url: "#pos"
          - img [ref=e20]
          - text: Comande / POS
        - link "Menu & Ricette" [ref=e23] [cursor=pointer]:
          - /url: "#menu"
          - img [ref=e24]
          - text: Menu & Ricette
        - link "Ingredienti" [ref=e27] [cursor=pointer]:
          - /url: "#ingredienti"
          - img [ref=e28]
          - text: Ingredienti
        - link "Magazzino" [ref=e31] [cursor=pointer]:
          - /url: "#magazzino"
          - img [ref=e32]
          - text: Magazzino
        - link "Fornitori" [ref=e35] [cursor=pointer]:
          - /url: "#fornitori"
          - img [ref=e36]
          - text: Fornitori
      - generic [ref=e41]:
        - button "Cambia tema" [ref=e42] [cursor=pointer]:
          - img [ref=e43]
        - generic [ref=e45]: v0.2
    - main [ref=e46]:
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - generic [ref=e50]: Menu & Ricette
            - generic [ref=e51]: Gestisci prodotti, prezzi e ricette con calcolo costo/margine
          - button "+ Nuovo prodotto" [ref=e52] [cursor=pointer]
        - generic [ref=e53]:
          - generic [ref=e54]:
            - generic [ref=e55]: Analcolici
            - table [ref=e57]:
              - rowgroup [ref=e58]:
                - row "Prodotto Prezzo Costo teorico Margine % Ricetta Stato" [ref=e59]:
                  - columnheader "Prodotto" [ref=e60]
                  - columnheader "Prezzo" [ref=e61]
                  - columnheader "Costo teorico" [ref=e62]
                  - columnheader "Margine %" [ref=e63]
                  - columnheader "Ricetta" [ref=e64]
                  - columnheader "Stato" [ref=e65]
                  - columnheader [ref=e66]
              - rowgroup [ref=e67]:
                - row "Acqua Tonica € 3.50 — — + Aggiungi Attivo Modifica" [ref=e68]:
                  - cell "Acqua Tonica" [ref=e69]:
                    - strong [ref=e70]: Acqua Tonica
                  - cell "€ 3.50" [ref=e71]
                  - cell "—" [ref=e72]
                  - cell "—" [ref=e73]
                  - cell "+ Aggiungi" [ref=e74]:
                    - generic [ref=e75] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e76]:
                    - generic [ref=e77]: Attivo
                  - cell "Modifica" [ref=e78]:
                    - button "Modifica" [ref=e80] [cursor=pointer]
          - generic [ref=e81]:
            - generic [ref=e82]: Cocktail Classici
            - table [ref=e84]:
              - rowgroup [ref=e85]:
                - row "Prodotto Prezzo Costo teorico Margine % Ricetta Stato" [ref=e86]:
                  - columnheader "Prodotto" [ref=e87]
                  - columnheader "Prezzo" [ref=e88]
                  - columnheader "Costo teorico" [ref=e89]
                  - columnheader "Margine %" [ref=e90]
                  - columnheader "Ricetta" [ref=e91]
                  - columnheader "Stato" [ref=e92]
                  - columnheader [ref=e93]
              - rowgroup [ref=e94]:
                - row "Aperol Spritz Aperol, Prosecco, Soda € 8.00 € 1.49 81.4% ✓ Sì Attivo Ricetta Modifica" [ref=e95]:
                  - cell "Aperol Spritz Aperol, Prosecco, Soda" [ref=e96]:
                    - strong [ref=e97]: Aperol Spritz
                    - text: Aperol, Prosecco, Soda
                  - cell "€ 8.00" [ref=e98]
                  - cell "€ 1.49" [ref=e99]
                  - cell "81.4%" [ref=e100]
                  - cell "✓ Sì" [ref=e101]:
                    - generic [ref=e102]: ✓ Sì
                  - cell "Attivo" [ref=e103]:
                    - generic [ref=e104]: Attivo
                  - cell "Ricetta Modifica" [ref=e105]:
                    - generic [ref=e106]:
                      - button "Ricetta" [ref=e107] [cursor=pointer]
                      - button "Modifica" [ref=e108] [cursor=pointer]
                - row "Mojito Rum, Lime, Menta, Zucchero, Soda € 9.50 € 1.68 82.3% ✓ Sì Attivo Ricetta Modifica" [ref=e109]:
                  - cell "Mojito Rum, Lime, Menta, Zucchero, Soda" [ref=e110]:
                    - strong [ref=e111]: Mojito
                    - text: Rum, Lime, Menta, Zucchero, Soda
                  - cell "€ 9.50" [ref=e112]
                  - cell "€ 1.68" [ref=e113]
                  - cell "82.3%" [ref=e114]
                  - cell "✓ Sì" [ref=e115]:
                    - generic [ref=e116]: ✓ Sì
                  - cell "Attivo" [ref=e117]:
                    - generic [ref=e118]: Attivo
                  - cell "Ricetta Modifica" [ref=e119]:
                    - generic [ref=e120]:
                      - button "Ricetta" [ref=e121] [cursor=pointer]
                      - button "Modifica" [ref=e122] [cursor=pointer]
                - row "Moscow Mule Vodka, Lime, Ginger Beer € 9.00 — — ✓ Sì Attivo Ricetta Modifica" [ref=e123]:
                  - cell "Moscow Mule Vodka, Lime, Ginger Beer" [ref=e124]:
                    - strong [ref=e125]: Moscow Mule
                    - text: Vodka, Lime, Ginger Beer
                  - cell "€ 9.00" [ref=e126]
                  - cell "—" [ref=e127]
                  - cell "—" [ref=e128]
                  - cell "✓ Sì" [ref=e129]:
                    - generic [ref=e130]: ✓ Sì
                  - cell "Attivo" [ref=e131]:
                    - generic [ref=e132]: Attivo
                  - cell "Ricetta Modifica" [ref=e133]:
                    - generic [ref=e134]:
                      - button "Ricetta" [ref=e135] [cursor=pointer]
                      - button "Modifica" [ref=e136] [cursor=pointer]
                - row "Negroni Gin, Campari, Vermouth Rosso € 9.00 € 1.16 87.1% ✓ Sì Attivo Ricetta Modifica" [ref=e137]:
                  - cell "Negroni Gin, Campari, Vermouth Rosso" [ref=e138]:
                    - strong [ref=e139]: Negroni
                    - text: Gin, Campari, Vermouth Rosso
                  - cell "€ 9.00" [ref=e140]
                  - cell "€ 1.16" [ref=e141]
                  - cell "87.1%" [ref=e142]
                  - cell "✓ Sì" [ref=e143]:
                    - generic [ref=e144]: ✓ Sì
                  - cell "Attivo" [ref=e145]:
                    - generic [ref=e146]: Attivo
                  - cell "Ricetta Modifica" [ref=e147]:
                    - generic [ref=e148]:
                      - button "Ricetta" [ref=e149] [cursor=pointer]
                      - button "Modifica" [ref=e150] [cursor=pointer]
                - row "Negroni € 8.00 — — + Aggiungi Attivo Modifica" [ref=e151]:
                  - cell "Negroni" [ref=e152]:
                    - strong [ref=e153]: Negroni
                  - cell "€ 8.00" [ref=e154]
                  - cell "—" [ref=e155]
                  - cell "—" [ref=e156]
                  - cell "+ Aggiungi" [ref=e157]:
                    - generic [ref=e158] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e159]:
                    - generic [ref=e160]: Attivo
                  - cell "Modifica" [ref=e161]:
                    - button "Modifica" [ref=e163] [cursor=pointer]
                - row "Negroni € 8.00 — — + Aggiungi Attivo Modifica" [ref=e164]:
                  - cell "Negroni" [ref=e165]:
                    - strong [ref=e166]: Negroni
                  - cell "€ 8.00" [ref=e167]
                  - cell "—" [ref=e168]
                  - cell "—" [ref=e169]
                  - cell "+ Aggiungi" [ref=e170]:
                    - generic [ref=e171] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e172]:
                    - generic [ref=e173]: Attivo
                  - cell "Modifica" [ref=e174]:
                    - button "Modifica" [ref=e176] [cursor=pointer]
                - row "Prodotto Modifica 1777890615270 € 5.00 — — + Aggiungi Attivo Modifica" [ref=e177]:
                  - cell "Prodotto Modifica 1777890615270" [ref=e178]:
                    - strong [ref=e179]: Prodotto Modifica 1777890615270
                  - cell "€ 5.00" [ref=e180]
                  - cell "—" [ref=e181]
                  - cell "—" [ref=e182]
                  - cell "+ Aggiungi" [ref=e183]:
                    - generic [ref=e184] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e185]:
                    - generic [ref=e186]: Attivo
                  - cell "Modifica" [ref=e187]:
                    - button "Modifica" [ref=e189] [cursor=pointer]
                - row "Prodotto Modifica 1777891007626 € 5.00 — — + Aggiungi Attivo Modifica" [ref=e190]:
                  - cell "Prodotto Modifica 1777891007626" [ref=e191]:
                    - strong [ref=e192]: Prodotto Modifica 1777891007626
                  - cell "€ 5.00" [ref=e193]
                  - cell "—" [ref=e194]
                  - cell "—" [ref=e195]
                  - cell "+ Aggiungi" [ref=e196]:
                    - generic [ref=e197] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e198]:
                    - generic [ref=e199]: Attivo
                  - cell "Modifica" [ref=e200]:
                    - button "Modifica" [ref=e202] [cursor=pointer]
                - row "Prodotto Modifica 1777891286015 € 5.00 — — + Aggiungi Attivo Modifica" [ref=e203]:
                  - cell "Prodotto Modifica 1777891286015" [ref=e204]:
                    - strong [ref=e205]: Prodotto Modifica 1777891286015
                  - cell "€ 5.00" [ref=e206]
                  - cell "—" [ref=e207]
                  - cell "—" [ref=e208]
                  - cell "+ Aggiungi" [ref=e209]:
                    - generic [ref=e210] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e211]:
                    - generic [ref=e212]: Attivo
                  - cell "Modifica" [ref=e213]:
                    - button "Modifica" [ref=e215] [cursor=pointer]
                - row "Prodotto Modifica 1777891286015 € 5.00 — — + Aggiungi Attivo Modifica" [ref=e216]:
                  - cell "Prodotto Modifica 1777891286015" [ref=e217]:
                    - strong [ref=e218]: Prodotto Modifica 1777891286015
                  - cell "€ 5.00" [ref=e219]
                  - cell "—" [ref=e220]
                  - cell "—" [ref=e221]
                  - cell "+ Aggiungi" [ref=e222]:
                    - generic [ref=e223] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e224]:
                    - generic [ref=e225]: Attivo
                  - cell "Modifica" [ref=e226]:
                    - button "Modifica" [ref=e228] [cursor=pointer]
                - row "Prodotto Modifica 1777891434174 € 5.00 — — + Aggiungi Attivo Modifica" [ref=e229]:
                  - cell "Prodotto Modifica 1777891434174" [ref=e230]:
                    - strong [ref=e231]: Prodotto Modifica 1777891434174
                  - cell "€ 5.00" [ref=e232]
                  - cell "—" [ref=e233]
                  - cell "—" [ref=e234]
                  - cell "+ Aggiungi" [ref=e235]:
                    - generic [ref=e236] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e237]:
                    - generic [ref=e238]: Attivo
                  - cell "Modifica" [ref=e239]:
                    - button "Modifica" [ref=e241] [cursor=pointer]
                - row "Prodotto Modifica 1777891434174 € 5.00 — — + Aggiungi Attivo Modifica" [ref=e242]:
                  - cell "Prodotto Modifica 1777891434174" [ref=e243]:
                    - strong [ref=e244]: Prodotto Modifica 1777891434174
                  - cell "€ 5.00" [ref=e245]
                  - cell "—" [ref=e246]
                  - cell "—" [ref=e247]
                  - cell "+ Aggiungi" [ref=e248]:
                    - generic [ref=e249] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e250]:
                    - generic [ref=e251]: Attivo
                  - cell "Modifica" [ref=e252]:
                    - button "Modifica" [ref=e254] [cursor=pointer]
                - row "Prodotto Test 1777890614156 Creato da Playwright € 4.50 — — + Aggiungi Attivo Modifica" [ref=e255]:
                  - cell "Prodotto Test 1777890614156 Creato da Playwright" [ref=e256]:
                    - strong [ref=e257]: Prodotto Test 1777890614156
                    - text: Creato da Playwright
                  - cell "€ 4.50" [ref=e258]
                  - cell "—" [ref=e259]
                  - cell "—" [ref=e260]
                  - cell "+ Aggiungi" [ref=e261]:
                    - generic [ref=e262] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e263]:
                    - generic [ref=e264]: Attivo
                  - cell "Modifica" [ref=e265]:
                    - button "Modifica" [ref=e267] [cursor=pointer]
                - row "Prodotto Test 1777891006836 Creato da Playwright € 4.50 — — + Aggiungi Attivo Modifica" [ref=e268]:
                  - cell "Prodotto Test 1777891006836 Creato da Playwright" [ref=e269]:
                    - strong [ref=e270]: Prodotto Test 1777891006836
                    - text: Creato da Playwright
                  - cell "€ 4.50" [ref=e271]
                  - cell "—" [ref=e272]
                  - cell "—" [ref=e273]
                  - cell "+ Aggiungi" [ref=e274]:
                    - generic [ref=e275] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e276]:
                    - generic [ref=e277]: Attivo
                  - cell "Modifica" [ref=e278]:
                    - button "Modifica" [ref=e280] [cursor=pointer]
                - row "Prodotto Test 1777891284932 Creato da Playwright € 4.50 — — + Aggiungi Attivo Modifica" [ref=e281]:
                  - cell "Prodotto Test 1777891284932 Creato da Playwright" [ref=e282]:
                    - strong [ref=e283]: Prodotto Test 1777891284932
                    - text: Creato da Playwright
                  - cell "€ 4.50" [ref=e284]
                  - cell "—" [ref=e285]
                  - cell "—" [ref=e286]
                  - cell "+ Aggiungi" [ref=e287]:
                    - generic [ref=e288] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e289]:
                    - generic [ref=e290]: Attivo
                  - cell "Modifica" [ref=e291]:
                    - button "Modifica" [ref=e293] [cursor=pointer]
                - row "Prodotto Test 1777891433107 Creato da Playwright € 4.50 — — + Aggiungi Attivo Modifica" [ref=e294]:
                  - cell "Prodotto Test 1777891433107 Creato da Playwright" [ref=e295]:
                    - strong [ref=e296]: Prodotto Test 1777891433107
                    - text: Creato da Playwright
                  - cell "€ 4.50" [ref=e297]
                  - cell "—" [ref=e298]
                  - cell "—" [ref=e299]
                  - cell "+ Aggiungi" [ref=e300]:
                    - generic [ref=e301] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e302]:
                    - generic [ref=e303]: Attivo
                  - cell "Modifica" [ref=e304]:
                    - button "Modifica" [ref=e306] [cursor=pointer]
          - generic [ref=e307]:
            - generic [ref=e308]: Birre
            - table [ref=e310]:
              - rowgroup [ref=e311]:
                - row "Prodotto Prezzo Costo teorico Margine % Ricetta Stato" [ref=e312]:
                  - columnheader "Prodotto" [ref=e313]
                  - columnheader "Prezzo" [ref=e314]
                  - columnheader "Costo teorico" [ref=e315]
                  - columnheader "Margine %" [ref=e316]
                  - columnheader "Ricetta" [ref=e317]
                  - columnheader "Stato" [ref=e318]
                  - columnheader [ref=e319]
              - rowgroup [ref=e320]:
                - row "Birra Alla Spina 0.4L birra artigianale € 5.00 — — + Aggiungi Attivo Modifica" [ref=e321]:
                  - cell "Birra Alla Spina 0.4L birra artigianale" [ref=e322]:
                    - strong [ref=e323]: Birra Alla Spina
                    - text: 0.4L birra artigianale
                  - cell "€ 5.00" [ref=e324]
                  - cell "—" [ref=e325]
                  - cell "—" [ref=e326]
                  - cell "+ Aggiungi" [ref=e327]:
                    - generic [ref=e328] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e329]:
                    - generic [ref=e330]: Attivo
                  - cell "Modifica" [ref=e331]:
                    - button "Modifica" [ref=e333] [cursor=pointer]
          - generic [ref=e334]:
            - generic [ref=e335]: Stuzzichini
            - table [ref=e337]:
              - rowgroup [ref=e338]:
                - row "Prodotto Prezzo Costo teorico Margine % Ricetta Stato" [ref=e339]:
                  - columnheader "Prodotto" [ref=e340]
                  - columnheader "Prezzo" [ref=e341]
                  - columnheader "Costo teorico" [ref=e342]
                  - columnheader "Margine %" [ref=e343]
                  - columnheader "Ricetta" [ref=e344]
                  - columnheader "Stato" [ref=e345]
                  - columnheader [ref=e346]
              - rowgroup [ref=e347]:
                - row "Patatine 80g patatine fritte € 3.00 — — + Aggiungi Attivo Modifica" [ref=e348]:
                  - cell "Patatine 80g patatine fritte" [ref=e349]:
                    - strong [ref=e350]: Patatine
                    - text: 80g patatine fritte
                  - cell "€ 3.00" [ref=e351]
                  - cell "—" [ref=e352]
                  - cell "—" [ref=e353]
                  - cell "+ Aggiungi" [ref=e354]:
                    - generic [ref=e355] [cursor=pointer]: + Aggiungi
                  - cell "Attivo" [ref=e356]:
                    - generic [ref=e357]: Attivo
                  - cell "Modifica" [ref=e358]:
                    - button "Modifica" [ref=e360] [cursor=pointer]
  - button "Apri menu" [ref=e361]:
    - img [ref=e362]
  - generic [ref=e364]:
    - generic [ref=e365]: Nuovo prodotto
    - generic [ref=e366]:
      - generic [ref=e367]:
        - generic [ref=e368]: Nome
        - textbox "Es. Negroni" [ref=e369]: Prodotto Modifica 1777891434174
      - generic [ref=e370]:
        - generic [ref=e371]: Categoria
        - combobox [ref=e372] [cursor=pointer]:
          - option "Cocktail Classici" [selected]
          - option "Signature Cocktail"
          - option "Analcolici"
          - option "Birre"
          - option "Stuzzichini"
      - generic [ref=e373]:
        - generic [ref=e374]:
          - generic [ref=e375]: Prezzo vendita (€)
          - spinbutton [ref=e376]: "5.00"
        - generic [ref=e377]:
          - checkbox "Modificabile" [checked] [ref=e378]
          - generic [ref=e379]: Modificabile
      - generic [ref=e380]:
        - generic [ref=e381]: Descrizione (opzionale)
        - textbox "Breve descrizione" [ref=e382]
    - generic [ref=e383]:
      - button "Annulla" [ref=e384] [cursor=pointer]
      - button "Salva" [active] [ref=e385] [cursor=pointer]
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | async function gotoView(page, hash) {
  4  |   await page.goto(`/#${hash}`);
  5  |   await expect(page.locator('#view-container')).toBeVisible();
  6  | }
  7  | 
  8  | function uniqueName(prefix) {
  9  |   return `${prefix} ${Date.now()}`;
  10 | }
  11 | 
  12 | test.describe('Menu', () => {
  13 |   test('apre la vista menu', async ({ page }) => {
  14 |     await gotoView(page, 'menu');
  15 |     await expect(page.locator('#menu-content')).toBeVisible();
  16 |   });
  17 | 
  18 |   test('crea un prodotto nuovo', async ({ page }) => {
  19 |     const name = uniqueName('Prodotto Test');
  20 |     await gotoView(page, 'menu');
  21 | 
  22 |     await page.locator('#btn-new-product').click();
  23 |     await expect(page.locator('#pm-name')).toBeVisible();
  24 | 
  25 |     await page.locator('#pm-name').fill(name);
  26 |     await page.locator('#pm-price').fill('4.50');
  27 |     await page.locator('#pm-desc').fill('Creato da Playwright');
  28 |     await page.locator('[data-modal-confirm]').click();
  29 | 
  30 |     await expect(page.locator('#menu-content')).toContainText(name);
  31 |   });
  32 |   test('modifica un prodotto creato dal test', async ({ page }) => {
  33 |       const original = uniqueName('Prodotto Modifica');
  34 |       const updated = `${original} Edit`;
  35 |       await gotoView(page, 'menu');
  36 | 
  37 |       await page.locator('#btn-new-product').click();
  38 |       await expect(page.locator('#pm-name')).toBeVisible();
  39 |       await page.locator('#pm-name').fill(original);
  40 |       await page.locator('#pm-price').fill('5.00');
  41 |       await page.locator('[data-modal-confirm]').click();         // ← solo questo
> 42 |       await page.locator('[data-app-modal]').waitFor({ state: 'detached' }); // ← aggiunto
     |                                              ^ Error: locator.waitFor: Test timeout of 30000ms exceeded.
  43 | 
  44 |       await expect(page.locator('#menu-content')).toContainText(original);
  45 | 
  46 |       const card = page.locator('#menu-content .card').filter({ hasText: original }).first();
  47 |       await expect(card).toBeVisible();
  48 |       await card.locator('button[data-edit]').click();
  49 | 
  50 |       await expect(page.locator('#pm-name')).toBeVisible();
  51 |       await page.locator('#pm-name').fill(updated);
  52 |       await page.locator('[data-modal-confirm]').click();
  53 |       await page.locator('[data-app-modal]').waitFor({ state: 'detached' });
  54 | 
  55 |       await expect(page.locator('#menu-content')).toContainText(updated);
  56 |     });
  57 | });
  58 | 
```
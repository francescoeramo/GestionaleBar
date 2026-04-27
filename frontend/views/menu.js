
// ============================================================
//  View: Gestione Menu & Ricette
// ============================================================

async function renderMenu(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Menu & Ricette</div>
        <div class="page-subtitle">Gestisci prodotti, prezzi e ricette con calcolo costo/margine</div>
      </div>
      <button class="btn btn-primary" id="btn-new-product">+ Nuovo prodotto</button>
    </div>
    <div id="menu-content"></div>
  `;

  let categories = [], products = [], costs = {};

  async function load() {
    [categories, products] = await Promise.all([
      api('GET', '/categories/'),
      api('GET', '/products/?active_only=false'),
    ]);
    const costList = await api('GET', '/products/recipes/costs').catch(() => []);
    costs = Object.fromEntries(costList.map(c => [c.product_id, c]));
    render();
  }

  function render() {
    const el = document.getElementById('menu-content');
    if (!products.length) {
      el.innerHTML = `<div class="empty-state"><p>Nessun prodotto. Creane uno!</p></div>`;
      return;
    }
    // Raggruppa per categoria
    const byCat = {};
    products.forEach(p => {
      const catName = categories.find(c => c.id === p.category_id)?.name || 'Senza categoria';
      if (!byCat[catName]) byCat[catName] = [];
      byCat[catName].push(p);
    });

    el.innerHTML = Object.entries(byCat).map(([cat, prods]) => `
      <div style="margin-bottom:28px">
        <div style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-muted);margin-bottom:10px">${cat}</div>
        <div class="card" style="padding:0;overflow:hidden">
          <table class="data-table">
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Prezzo</th>
                <th>Costo teorico</th>
                <th>Margine %</th>
                <th>Ricetta</th>
                <th>Stato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${prods.map(p => {
                const c = costs[p.id];
                const costStr   = c ? `€ ${c.theoretical_cost.toFixed(2)}`  : '—';
                const marginStr = c ? `${c.margin_pct.toFixed(1)}%`          : '—';
                const marginColor = c && c.margin_pct >= 70 ? 'var(--color-success)' : c && c.margin_pct >= 50 ? 'var(--color-warning)' : 'var(--color-error)';
                return `
                  <tr>
                    <td><strong>${p.name}</strong>${p.description ? `<br><span style="font-size:var(--text-xs);color:var(--color-text-muted)">${p.description}</span>` : ''}</td>
                    <td class="num">€ ${p.sale_price.toFixed(2)}</td>
                    <td class="num" style="color:var(--color-text-muted)">${costStr}</td>
                    <td class="num" style="color:${marginColor};font-weight:600">${marginStr}</td>
                    <td>${p.has_recipe ? '<span class="badge badge-success">✓ Sì</span>' : '<span class="badge badge-info" style="cursor:pointer" data-edit-recipe="'+p.id+'">+ Aggiungi</span>'}</td>
                    <td>${p.active ? '<span class="badge badge-success">Attivo</span>' : '<span class="badge badge-error">Archiviato</span>'}</td>
                    <td>
                      <div class="flex gap-2">
                        ${p.has_recipe ? `<button class="btn btn-ghost btn-sm" data-view-recipe="${p.id}">Ricetta</button>` : ''}
                        <button class="btn btn-ghost btn-sm" data-edit-product="${p.id}">Modifica</button>
                      </div>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('[data-edit-recipe]').forEach(b => {
      b.addEventListener('click', () => openRecipeModal(+b.dataset.editRecipe, products));
    });
    el.querySelectorAll('[data-view-recipe]').forEach(b => {
      b.addEventListener('click', () => openRecipeModal(+b.dataset.viewRecipe, products));
    });
    el.querySelectorAll('[data-edit-product]').forEach(b => {
      b.addEventListener('click', () => openProductModal(+b.dataset.editProduct));
    });
  }

  // ── Crea/modifica prodotto ───────────────────────────────────
  async function openProductModal(productId = null) {
    let p = null;
    if (productId) p = products.find(x => x.id === productId);
    openModal(`
      <div class="modal-title">${p ? 'Modifica' : 'Nuovo'} prodotto</div>
      <div class="flex-col gap-3">
        <div>
          <label class="field-label">Nome</label>
          <input id="pm-name" class="input" value="${p?.name || ''}" placeholder="Es. Negroni">
        </div>
        <div>
          <label class="field-label">Categoria</label>
          <select id="pm-cat" class="input">
            ${categories.map(c => `<option value="${c.id}" ${p?.category_id === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="grid-2">
          <div>
            <label class="field-label">Prezzo vendita (€)</label>
            <input id="pm-price" class="input" type="number" step="0.5" value="${p?.sale_price || 8}">
          </div>
          <div style="display:flex;align-items:center;padding-top:22px;gap:8px">
            <input id="pm-mods" type="checkbox" ${!p || p.allow_mods ? 'checked' : ''}>
            <label for="pm-mods" style="font-size:var(--text-sm)">Modificabile</label>
          </div>
        </div>
        <div>
          <label class="field-label">Descrizione (opzionale)</label>
          <input id="pm-desc" class="input" value="${p?.description || ''}" placeholder="Breve descrizione">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
        ${p ? `<button class="btn btn-danger btn-sm" data-archive="${p.id}">Archivia</button>` : ''}
        <button class="btn btn-primary" data-modal-confirm>Salva</button>
      </div>
    `, async (overlay) => {
      const body = {
        name:       overlay.querySelector('#pm-name').value.trim(),
        category_id: +overlay.querySelector('#pm-cat').value,
        sale_price:  +overlay.querySelector('#pm-price').value,
        allow_mods:  overlay.querySelector('#pm-mods').checked ? 1 : 0,
        description: overlay.querySelector('#pm-desc').value.trim() || null,
      };
      if (!body.name) { toast('Inserisci un nome', 'error'); return; }
      try {
        if (p) await api('PUT', `/products/${p.id}`, body);
        else    await api('POST', '/products/', body);
        toast('Prodotto salvato', 'success');
        await load();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  // ── Ricetta ──────────────────────────────────────────────────
  async function openRecipeModal(productId, prods) {
    const prod = prods.find(p => p.id === productId);
    const ingrs = await api('GET', '/ingredients/');
    let existingRecipe = null;
    if (prod.has_recipe) {
      existingRecipe = await api('GET', `/products/${productId}/recipe`).catch(() => null);
    }

    let items = existingRecipe?.items?.map(i => ({
      ingredient_id: i.ingredient_id,
      name: i.ingredient_name,
      quantity: i.quantity,
      unit: i.unit,
    })) || [];

    function buildItemRows() {
      if (!items.length) return `<div style="color:var(--color-text-faint);font-size:var(--text-sm);padding:8px 0">Nessun ingrediente aggiunto.</div>`;
      return items.map((it, idx) => `
        <div class="flex gap-2" style="align-items:center;margin-bottom:6px">
          <span style="flex:1;font-size:var(--text-sm)">${it.name}</span>
          <input class="input ri-qty" style="width:70px" type="number" step="0.5" value="${it.quantity}" data-idx="${idx}">
          <select class="input ri-unit" style="width:90px" data-idx="${idx}">
            ${['ml','cl','g','pz','dash','barspoon','splash'].map(u => `<option ${u===it.unit?'selected':''}>${u}</option>`).join('')}
          </select>
          <button class="btn btn-danger btn-sm ri-del" data-idx="${idx}">×</button>
        </div>`).join('');
    }

    const overlay = openModal(`
      <div class="modal-title">Ricetta — ${prod.name}</div>
      ${existingRecipe ? `<div style="margin-bottom:12px;font-size:var(--text-sm);color:var(--color-text-muted)">
        Costo teorico: <strong style="color:var(--color-text)">€ ${existingRecipe.theoretical_cost?.toFixed(2) ?? '—'}</strong> &nbsp;|&nbsp;
        Margine: <strong style="color:var(--color-success)">${existingRecipe.margin_pct?.toFixed(1) ?? '—'}%</strong>
      </div>` : ''}
      <div>
        <label class="field-label">Aggiungi ingrediente</label>
        <div class="flex gap-2" style="margin-bottom:12px">
          <select id="ri-ingr" class="input">
            ${ingrs.map(i => `<option value="${i.id}" data-name="${i.name}">${i.name} (${i.base_unit})</option>`).join('')}
          </select>
          <button class="btn btn-ghost btn-sm" id="ri-add">+ Aggiungi</button>
        </div>
        <div id="ri-list">${buildItemRows()}</div>
      </div>
      <div class="mt-4 grid-2">
        <div>
          <label class="field-label">Resa (ml, opzionale)</label>
          <input id="ri-yield" class="input" type="number" value="${existingRecipe?.yield_ml || ''}">
        </div>
        <div>
          <label class="field-label">Note</label>
          <input id="ri-notes" class="input" value="${existingRecipe?.notes || ''}">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
        <button class="btn btn-primary" data-modal-confirm>Salva ricetta</button>
      </div>
    `, async (overlay) => {
      const body = {
        yield_ml: +overlay.querySelector('#ri-yield').value || null,
        notes: overlay.querySelector('#ri-notes').value || null,
        items: items.map((it, idx) => {
          const qty  = +overlay.querySelectorAll('.ri-qty')[idx]?.value  || it.quantity;
          const unit = overlay.querySelectorAll('.ri-unit')[idx]?.value || it.unit;
          return { ingredient_id: it.ingredient_id, quantity: qty, unit, sort_order: idx };
        }),
      };
      try {
        await api('POST', `/products/${productId}/recipe`, body);
        toast('Ricetta salvata', 'success');
        await load();
      } catch (e) { toast(e.message, 'error'); }
    });

    // Aggiungi ingrediente
    overlay.querySelector('#ri-add').addEventListener('click', () => {
      const sel = overlay.querySelector('#ri-ingr');
      const name = sel.options[sel.selectedIndex].dataset.name;
      items.push({ ingredient_id: +sel.value, name, quantity: 1, unit: 'cl' });
      overlay.querySelector('#ri-list').innerHTML = buildItemRows();
      bindRiEvents();
    });

    function bindRiEvents() {
      overlay.querySelectorAll('.ri-del').forEach(b => {
        b.addEventListener('click', () => {
          items.splice(+b.dataset.idx, 1);
          overlay.querySelector('#ri-list').innerHTML = buildItemRows();
          bindRiEvents();
        });
      });
    }
    bindRiEvents();
  }

  document.getElementById('btn-new-product').addEventListener('click', () => openProductModal());
  await load();

}

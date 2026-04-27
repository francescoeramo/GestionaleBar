
// ============================================================
//  View: Ingredienti
// ============================================================

async function renderIngredienti(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Ingredienti</div>
        <div class="page-subtitle">Anagrafica ingredienti e costi unitari</div>
      </div>
      <button class="btn btn-primary" id="btn-new-ingr">+ Nuovo ingrediente</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th><th>Unità base</th><th>Costo / unità</th><th>Stato</th><th></th>
          </tr>
        </thead>
        <tbody id="ingr-tbody"><tr><td colspan="5" style="text-align:center;color:var(--color-text-faint);padding:32px">Caricamento…</td></tr></tbody>
      </table>
    </div>
  `;

  let ingrs = [];

  async function load() {
    ingrs = await api('GET', '/ingredients/?active_only=false');
    const tbody = document.getElementById('ingr-tbody');
    if (!ingrs.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--color-text-faint);padding:32px">Nessun ingrediente</td></tr>`;
      return;
    }
    tbody.innerHTML = ingrs.map(i => `
      <tr>
        <td><strong>${i.name}</strong></td>
        <td><span class="tag">${i.base_unit}</span></td>
        <td class="num">€ ${i.theoretical_unit_cost.toFixed(4)} / ${i.base_unit}</td>
        <td>${i.active ? '<span class="badge badge-success">Attivo</span>' : '<span class="badge badge-error">Archiviato</span>'}</td>
        <td><button class="btn btn-ghost btn-sm" data-edit="${i.id}">Modifica</button></td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-edit]').forEach(b => {
      b.addEventListener('click', () => openModal2(+b.dataset.edit));
    });
  }

  function openModal2(id = null) {
    const ing = id ? ingrs.find(i => i.id === id) : null;
    openModal(`
      <div class="modal-title">${ing ? 'Modifica' : 'Nuovo'} ingrediente</div>
      <div class="flex-col gap-3">
        <div>
          <label class="field-label">Nome</label>
          <input id="im-name" class="input" value="${ing?.name || ''}" placeholder="Es. Gin, Rum Bianco…">
        </div>
        <div class="grid-2">
          <div>
            <label class="field-label">Unità base</label>
            <select id="im-unit" class="input">
              ${['ml','cl','g','pz'].map(u => `<option ${ing?.base_unit===u?'selected':''}>${u}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="field-label">Costo per unità (€)</label>
            <input id="im-cost" class="input" type="number" step="0.001" min="0" value="${ing?.theoretical_unit_cost || 0}">
          </div>
        </div>
        <div>
          <label class="field-label">Allergeni (opzionale)</label>
          <input id="im-allergens" class="input" value="${ing?.allergens || ''}" placeholder='["glutine","latte"]'>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
        <button class="btn btn-primary" data-modal-confirm>Salva</button>
      </div>
    `, async (overlay) => {
      const body = {
        name: overlay.querySelector('#im-name').value.trim(),
        base_unit: overlay.querySelector('#im-unit').value,
        theoretical_unit_cost: +overlay.querySelector('#im-cost').value,
        allergens: overlay.querySelector('#im-allergens').value.trim() || null,
      };
      if (!body.name) { toast('Inserisci un nome', 'error'); return; }
      try {
        if (ing) await api('PUT', `/ingredients/${ing.id}`, body);
        else      await api('POST', '/ingredients/', body);
        toast('Ingrediente salvato', 'success');
        await load();
      } catch (e) { toast(e.message, 'error'); }
    });
  }

  document.getElementById('btn-new-ingr').addEventListener('click', () => openModal2());
  await load();

}

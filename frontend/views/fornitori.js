// ============================================================
//  View: Fornitori
// ============================================================

let _sup = [];
let _ing = [];

async function renderFornitori(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Fornitori</div>
        <div class="page-subtitle">Anagrafica fornitori e associazione ingredienti</div>
      </div>
      <button class="btn btn-primary" onclick="supNew()">+ Nuovo fornitore</button>
    </div>
    <div class="toolbar">
      <input id="sup-search" type="search" class="input" placeholder="Cerca fornitore…">
    </div>
    <div id="sup-grid" class="cards-grid"></div>
    <div id="sup-form-modal"   class="modal-backdrop hidden"></div>
    <div id="sup-detail-modal" class="modal-backdrop hidden"></div>
  `;
  document.getElementById('sup-search').addEventListener('input', supFilter);
  try {
    const [sr, ir] = await Promise.all([fetch('/api/suppliers/'), fetch('/api/ingredients/?active_only=false')]);
    _sup = await sr.json();
    _ing = await ir.json();
  } catch(e) { toast('Errore caricamento fornitori', 'error'); }
  supFilter();
}

function supFilter() {
  const q = (document.getElementById('sup-search')?.value || '').toLowerCase();
  supRenderGrid(_sup.filter(s => s.name.toLowerCase().includes(q)));
}

function supRenderGrid(items) {
  const grid = document.getElementById('sup-grid');
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = `<div class="empty-state"><p>Nessun fornitore trovato</p><button class="btn btn-primary" onclick="supNew()">+ Aggiungi il primo</button></div>`;
    return;
  }
  grid.innerHTML = items.map(s => `
    <div class="card card-hover" onclick="supDetail(${s.id})">
      <div class="card-header">
        <span class="card-title">${supEsc(s.name)}</span>
        <span class="badge">${s.ingredient_count ?? 0} ingredienti</span>
      </div>
      ${s.contact_name ? `<p class="card-meta">👤 ${supEsc(s.contact_name)}</p>` : ''}
      ${s.phone        ? `<p class="card-meta">📞 ${supEsc(s.phone)}</p>`        : ''}
      ${s.email        ? `<p class="card-meta">✉️ ${supEsc(s.email)}</p>`        : ''}
      ${s.notes        ? `<p class="card-meta text-muted">${supEsc(s.notes)}</p>`: ''}
      <div class="card-actions">
        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();supEdit(${s.id})">Modifica</button>
        <button class="btn btn-sm btn-ghost"   onclick="event.stopPropagation();supDelete(${s.id})">Archivia</button>
      </div>
    </div>`).join('');
}

function supOpenForm(data = {}) {
  const modal = document.getElementById('sup-form-modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${data.id ? 'Modifica fornitore' : 'Nuovo fornitore'}</h3>
        <button class="btn-icon" onclick="supCloseForm()">✕</button>
      </div>
      <div class="modal-body">
        <form id="sup-form">
          <div class="form-group">
            <label>Ragione sociale *</label>
            <input name="name" class="input" required value="${supEsc(data.name||'')}">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Referente</label>
              <input name="contact_name" class="input" value="${supEsc(data.contact_name||'')}">
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <input name="phone" class="input" type="tel" value="${supEsc(data.phone||'')}">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input name="email" class="input" type="email" value="${supEsc(data.email||'')}">
          </div>
          <div class="form-group">
            <label>Note</label>
            <textarea name="notes" class="input" rows="3">${supEsc(data.notes||'')}</textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full">
            ${data.id ? 'Salva modifiche' : 'Crea fornitore'}
          </button>
        </form>
      </div>
    </div>`;
  document.getElementById('sup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    const url  = data.id ? `/api/suppliers/${data.id}` : '/api/suppliers/';
    try {
      await fetch(url, { method: data.id ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      toast(data.id ? 'Fornitore aggiornato' : 'Fornitore creato', 'success');
      supCloseForm();
      await supReload();
    } catch(err) { toast('Errore: ' + err.message, 'error'); }
  });
}

window.supNew    = () => supOpenForm();
window.supEdit   = id  => supOpenForm(_sup.find(s => s.id === id) || {});
window.supCloseForm = () => document.getElementById('sup-form-modal')?.classList.add('hidden');
window.supDelete = async id => {
  if (!confirm('Archiviare questo fornitore?')) return;
  await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
  toast('Fornitore archiviato', 'info');
  await supReload();
};

window.supDetail = async id => {
  let sup;
  try { sup = await fetch(`/api/suppliers/${id}`).then(r => r.json()); } catch(e) { toast('Errore', 'error'); return; }
  const linked = new Set(sup.ingredients.map(i => i.id));
  const modal  = document.getElementById('sup-detail-modal');
  modal.classList.remove('hidden');

  function drawDetail() {
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3>${supEsc(sup.name)}</h3>
          <button class="btn-icon" onclick="supCloseDetail()">✕</button>
        </div>
        <div class="modal-body modal-split">
          <div class="modal-section">
            <h4>Ingredienti associati</h4>
            ${sup.ingredients.length ? `
              <table class="data-table">
                <thead><tr><th>Ingrediente</th><th>Unità</th><th class="num">Prezzo/unità</th><th></th></tr></thead>
                <tbody>${sup.ingredients.map(i => `
                  <tr>
                    <td>${supEsc(i.name)}</td><td>${supEsc(i.unit)}</td>
                    <td class="num tabular">${i.unit_price != null ? '€'+Number(i.unit_price).toFixed(4) : '—'}</td>
                    <td><button class="btn btn-sm btn-ghost" onclick="supUnlink(${id},${i.id})">Rimuovi</button></td>
                  </tr>`).join('')}
                </tbody>
              </table>` : '<p class="text-muted">Nessun ingrediente associato</p>'}

            <h4 style="margin-top:var(--space-5)">Aggiungi ingrediente</h4>
            <form id="link-form" class="form-row" style="align-items:flex-end;gap:var(--space-3)">
              <div class="form-group" style="flex:1">
                <label>Ingrediente</label>
                <select name="ingredient_id" class="input" required>
                  <option value="">— seleziona —</option>
                  ${_ing.filter(i => !linked.has(i.id)).map(i =>
                    `<option value="${i.id}">${supEsc(i.name)} (${supEsc(i.unit)})</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="width:140px">
                <label>Prezzo/unità €</label>
                <input name="unit_price" type="number" step="0.0001" min="0" class="input" placeholder="0.0000">
              </div>
              <button type="submit" class="btn btn-primary">Associa</button>
            </form>
          </div>
          <div class="modal-section">
            <h4>Scheda fornitore</h4>
            <dl class="detail-list">
              ${supRow('Referente', sup.contact_name)}
              ${supRow('Telefono',  sup.phone)}
              ${supRow('Email',     sup.email)}
              ${supRow('Note',      sup.notes)}
            </dl>
            <button class="btn btn-outline btn-full" style="margin-top:var(--space-4)"
              onclick="supEdit(${id})">Modifica scheda</button>
          </div>
        </div>
      </div>`;

    document.getElementById('link-form').addEventListener('submit', async e => {
      e.preventDefault();
      const fd           = new FormData(e.target);
      const ingredient_id = parseInt(fd.get('ingredient_id'));
      const unit_price    = fd.get('unit_price') ? parseFloat(fd.get('unit_price')) : null;
      try {
        await fetch(`/api/suppliers/${id}/ingredients`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ ingredient_id, unit_price }),
        });
        sup = await fetch(`/api/suppliers/${id}`).then(r => r.json());
        linked.clear(); sup.ingredients.forEach(i => linked.add(i.id));
        drawDetail();
        toast('Ingrediente associato', 'success');
      } catch(err) { toast('Errore: ' + err.message, 'error'); }
    });
  }
  drawDetail();
};

window.supUnlink = async (supId, ingId) => {
  await fetch(`/api/suppliers/${supId}/ingredients/${ingId}`, { method: 'DELETE' });
  supDetail(supId);
};
window.supCloseDetail = () => document.getElementById('sup-detail-modal')?.classList.add('hidden');

async function supReload() {
  try {
    const [sr, ir] = await Promise.all([fetch('/api/suppliers/'), fetch('/api/ingredients/?active_only=false')]);
    _sup = await sr.json(); _ing = await ir.json();
  } catch(e) {}
  supFilter();
}

function supEsc(s) { return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function supRow(l,v) { return v ? `<div class="dl-row"><dt>${l}</dt><dd>${supEsc(v)}</dd></div>` : ''; }

// ============================================================
//  View: Magazzino
// ============================================================

let _inv = [];

async function renderMagazzino(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Magazzino</div>
        <div class="page-subtitle">Scorte, soglie di riordino e movimentazione</div>
      </div>
      <div id="stock-kpis" class="kpi-row"></div>
    </div>

    <div class="toolbar">
      <input id="mag-search" type="search" class="input" placeholder="Cerca ingrediente…">
      <select id="mag-filter" class="input" style="max-width:180px">
        <option value="">Tutti gli stati</option>
        <option value="critical">🔴 Critici</option>
        <option value="low">🟡 In esaurimento</option>
        <option value="ok">🟢 OK</option>
        <option value="none">⚪ Non monitorati</option>
      </select>
    </div>

    <div id="inv-table-wrap" class="table-wrap"></div>
  `;

  document.getElementById('mag-search').addEventListener('input',  magApplyFilter);
  document.getElementById('mag-filter').addEventListener('change', magApplyFilter);
  await magLoad();
}

async function magLoad() {
  try {
    const res = await fetch('/api/inventory/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _inv = await res.json();
    magRenderKpis();
    magApplyFilter();
  } catch(e) {
    toast('Errore caricamento magazzino: ' + e.message, 'error');
  }
}

function magRenderKpis() {
  const crit = _inv.filter(i => i.status === 'critical').length;
  const low  = _inv.filter(i => i.status === 'low').length;
  const ok   = _inv.filter(i => i.status === 'ok').length;
  const none = _inv.filter(i => i.status === 'none').length;
  const val  = _inv.reduce((s, i) => s + i.current_stock * i.theoretical_unit_cost, 0);
  const el = document.getElementById('stock-kpis');
  if (!el) return;
  el.innerHTML = `
    <div class="kpi kpi-error">  <span class="kpi-val">${crit}</span><span class="kpi-lbl">Critici</span></div>
    <div class="kpi kpi-warn">   <span class="kpi-val">${low}</span> <span class="kpi-lbl">Esaurimento</span></div>
    <div class="kpi kpi-ok">     <span class="kpi-val">${ok}</span>  <span class="kpi-lbl">OK</span></div>
    <div class="kpi kpi-neutral"><span class="kpi-val">${none}</span><span class="kpi-lbl">Non monitorati</span></div>
    <div class="kpi kpi-neutral"><span class="kpi-val">€${val.toFixed(0)}</span><span class="kpi-lbl">Valore scorte</span></div>
  `;
}

function magApplyFilter() {
  const q = (document.getElementById('mag-search')?.value || '').toLowerCase();
  const s = document.getElementById('mag-filter')?.value || '';
  magRenderTable(_inv.filter(i => i.name.toLowerCase().includes(q) && (!s || i.status === s)));
}

function magStatusBadge(s) {
  const m = {
    critical: ['badge badge-error', '🔴 Critico'],
    low:      ['badge badge-warn',  '🟡 Esaurimento'],
    ok:       ['badge badge-ok',    '🟢 OK'],
    none:     ['badge',             '⚪ Nessuna soglia'],
  };
  const [cls, txt] = m[s] || ['badge', '—'];
  return `<span class="${cls}">${txt}</span>`;
}

function magRenderTable(items) {
  const wrap = document.getElementById('inv-table-wrap');
  if (!wrap) return;

  if (!items.length) {
    wrap.innerHTML = `<div class="empty-state"><p>Nessun ingrediente trovato</p></div>`;
    return;
  }

  const table = document.createElement('table');
  table.className = 'data-table';

  table.innerHTML = `
    <thead>
      <tr>
        <th>Ingrediente</th>
        <th>Unità</th>
        <th class="num">Scorta</th>
        <th class="num">Soglia min.</th>
        <th>Stato</th>
        <th class="num">Valore</th>
        <th></th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  items.forEach(i => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="fw-medium">${magEsc(i.name)}</td>
      <td>${magEsc(i.base_unit)}</td>
      <td class="num tabular">${Number(i.current_stock).toFixed(2)}</td>
      <td class="num tabular">${Number(i.min_stock) > 0 ? Number(i.min_stock).toFixed(2) : '—'}</td>
      <td>${magStatusBadge(i.status)}</td>
      <td class="num tabular">€${(i.current_stock * i.theoretical_unit_cost).toFixed(2)}</td>
      <td></td>
    `;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline';
    btn.textContent = 'Movimenta';
    btn.addEventListener('click', () => {
      magOpenMovModal(i.id, i.name, i.base_unit, i.min_stock);
    });

    tr.lastElementChild.appendChild(btn);
    tbody.appendChild(tr);
  });

  wrap.innerHTML = '';
  wrap.appendChild(table);
}

window.magOpenMovModal = async function(id, name, unit, minStock) {
  document.getElementById('mov-modal')?.remove();

  let movs = [];
  try { movs = await fetch(`/api/inventory/movements/${id}`).then(r => r.json()); } catch(_) {}

  const modal = document.createElement('div');
  modal.id = 'mov-modal';
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>${magEsc(name)}</h3>
        <button type="button" class="btn-icon" id="btn-close-mov">✕</button>
      </div>
      <div class="modal-body modal-split">
        <div class="modal-section">
          <h4>Nuovo movimento</h4>
          <form id="mov-form">
            <div class="form-group">
              <label>Tipo operazione</label>
              <select name="type" class="input" required>
                <option value="carico">📦 Carico — aggiunge scorta</option>
                <option value="scarico">📤 Scarico — rimuove scorta</option>
                <option value="rettifica">✏️ Rettifica — imposta quantità esatta</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Quantità (${magEsc(unit)})</label>
                <input type="number" name="qty" class="input" step="0.01" min="0.01" required>
              </div>
              <div class="form-group">
                <label>Soglia minima (${magEsc(unit)})</label>
                <input type="number" name="min_stock" class="input" step="0.01" min="0"
                  placeholder="${Number(minStock) > 0 ? 'Attuale: ' + Number(minStock).toFixed(2) : 'Non impostata'}">
              </div>
            </div>
            <div class="form-group">
              <label>Note (opzionale)</label>
              <input type="text" name="note" class="input">
            </div>
            <button type="submit" class="btn btn-primary btn-full">Registra</button>
          </form>
        </div>
        <div class="modal-section">
          <h4>Ultimi movimenti</h4>
          <div class="mov-list">
            ${movs.length ? movs.map(m => `
              <div class="mov-row">
                <div>
                  <span class="fw-medium">${magMovLabel(m.movement_type)}</span>
                  ${m.note ? `<span class="text-muted"> — ${magEsc(m.note)}</span>` : ''}
                </div>
                <span class="tabular">${m.quantity > 0 ? '+' : ''}${Number(m.quantity).toFixed(2)} ${magEsc(unit)}</span>
                <span class="text-muted small">${magFmtDate(m.created_at)}</span>
              </div>`).join('')
            : '<p class="text-muted">Nessun movimento registrato</p>'}
          </div>
        </div>
      </div>
    </div>`;

  document.body.appendChild(modal);

  document.getElementById('btn-close-mov').addEventListener('click', magCloseModal);
  modal.addEventListener('click', e => { if (e.target === modal) magCloseModal(); });

  document.getElementById('mov-form').addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    const fd     = new FormData(e.target);
    const type   = fd.get('type');
    const qty    = parseFloat(fd.get('qty'));
    const minVal = fd.get('min_stock');
    const note   = fd.get('note') || null;

    try {
      await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_id: id, quantity: qty, movement_type: type, note }),
      });
      if (minVal !== '') {
        await fetch(`/api/inventory/${id}/thresholds`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ min_stock: parseFloat(minVal) }),
        });
      }
      toast('Movimento registrato', 'success');
      magCloseModal();
      await magLoad();
    } catch(err) {
      toast('Errore: ' + err.message, 'error');
      submitBtn.disabled = false;
    }
  });
};

window.magCloseModal = function() {
  document.getElementById('mov-modal')?.remove();
};

function magEsc(s) { return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function magMovLabel(t) { return { carico:'📦 Carico', scarico:'📤 Scarico', rettifica:'✏️ Rettifica' }[t] || t; }
function magFmtDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('it-IT', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}
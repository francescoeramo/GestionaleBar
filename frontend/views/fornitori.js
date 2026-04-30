// ============================================================
//  View: Fornitori
// ============================================================

let _sup = [];
let _ing = [];

function supEsc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function supRow(l, v) {
  return v ? `<div class="dl-row"><dt>${supEsc(l)}</dt><dd>${supEsc(v)}</dd></div>` : '';
}

async function renderFornitori(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Fornitori</div>
        <div class="page-subtitle">Anagrafica fornitori e associazione ingredienti</div>
      </div>
      <button class="btn btn-primary" id="btn-new-sup">+ Nuovo fornitore</button>
    </div>
    <div class="toolbar">
      <input id="sup-search" type="search" class="input" placeholder="Cerca fornitore…">
    </div>
    <div id="sup-grid" class="cards-grid"></div>
    <div id="sup-form-modal"   class="modal-backdrop hidden"></div>
    <div id="sup-detail-modal" class="modal-backdrop hidden"></div>
  `;

  document.getElementById('btn-new-sup').addEventListener('click', () => supOpenForm());
  document.getElementById('sup-search').addEventListener('input', supFilter);

  try {
    await supReload();
  } catch (e) {
    toast('Errore caricamento fornitori', 'error');
  }
}

function supFilter() {
  const q = (document.getElementById('sup-search')?.value || '').toLowerCase();
  supRenderGrid(_sup.filter(s => s.name.toLowerCase().includes(q)));
}

function supRenderGrid(items) {
  const grid = document.getElementById('sup-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<p>Nessun fornitore trovato</p>`;
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = '+ Aggiungi il primo';
    btn.addEventListener('click', () => supOpenForm());
    empty.appendChild(btn);
    grid.appendChild(empty);
    return;
  }

  grid.innerHTML = '';
  items.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card card-hover';

    // Header
    const header = document.createElement('div');
    header.className = 'card-header';
    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = s.name;
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `${s.ingredient_count ?? 0} ingredienti`;
    header.appendChild(title);
    header.appendChild(badge);
    card.appendChild(header);

    // Meta fields
    const metas = [
      { val: s.contact_name, prefix: '👤 ' },
      { val: s.phone,        prefix: '📞 ' },
      { val: s.email,        prefix: '✉️ ' },
      { val: s.notes,        prefix: '',   cls: 'text-muted' },
    ];
    metas.forEach(({ val, prefix, cls }) => {
      if (!val) return;
      const p = document.createElement('p');
      p.className = 'card-meta' + (cls ? ' ' + cls : '');
      p.textContent = prefix + val;
      card.appendChild(p);
    });

    // Actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline';
    editBtn.textContent = 'Modifica';
    editBtn.addEventListener('click', e => { e.stopPropagation(); supOpenForm(s); });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-sm btn-ghost';
    delBtn.textContent = 'Archivia';
    delBtn.addEventListener('click', e => { e.stopPropagation(); supDelete(s.id); });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);

    // Click card → dettaglio
    card.addEventListener('click', () => supDetail(s.id));
    grid.appendChild(card);
  });
}

// ── Form nuovo/modifica fornitore ────────────────────────────
function supOpenForm(data = {}) {
  const modal = document.getElementById('sup-form-modal');
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${data.id ? 'Modifica fornitore' : 'Nuovo fornitore'}</h3>
        <button class="btn-icon" id="btn-close-form">✕</button>
      </div>
      <div class="modal-body">
        <form id="sup-form">
          <div class="form-group">
            <label>Ragione sociale *</label>
            <input name="name" class="input" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Referente</label>
              <input name="contact_name" class="input">
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <input name="phone" class="input" type="tel">
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input name="email" class="input" type="email">
          </div>
          <div class="form-group">
            <label>Note</label>
            <textarea name="notes" class="input" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-full" id="btn-sup-submit">
            ${data.id ? 'Salva modifiche' : 'Crea fornitore'}
          </button>
        </form>
      </div>
    </div>`;

  // FIX: popoliamo i valori con .value dopo aver creato il DOM
  // (evita injection tramite attributo value= con dati non trusted)
  const form = document.getElementById('sup-form');
  form.elements['name'].value         = data.name         ?? '';
  form.elements['contact_name'].value = data.contact_name ?? '';
  form.elements['phone'].value        = data.phone        ?? '';
  form.elements['email'].value        = data.email        ?? '';
  form.elements['notes'].value        = data.notes        ?? '';

  document.getElementById('btn-close-form').addEventListener('click', supCloseForm);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = document.getElementById('btn-sup-submit');
    submitBtn.disabled = true;

    const body = Object.fromEntries(new FormData(e.target).entries());
    // Rimuovi campi vuoti per non sovrascrivere con stringhe vuote in PATCH
    Object.keys(body).forEach(k => { if (body[k] === '') delete body[k]; });

    try {
      if (data.id) {
        await api('PUT', `/suppliers/${data.id}`, body);
        toast('Fornitore aggiornato', 'success');
      } else {
        await api('POST', '/suppliers/', body);
        toast('Fornitore creato', 'success');
      }
      supCloseForm();
      await supReload();
    } catch (err) {
      toast('Errore: ' + err.message, 'error');
      submitBtn.disabled = false;
    }
  });
}

function supCloseForm() {
  document.getElementById('sup-form-modal')?.classList.add('hidden');
}

async function supDelete(id) {
  if (!confirm('Archiviare questo fornitore?')) return;
  try {
    await api('DELETE', `/suppliers/${id}`);
    toast('Fornitore archiviato', 'info');
    await supReload();
  } catch (e) {
    toast('Errore: ' + e.message, 'error');
  }
}

// ── Dettaglio fornitore ──────────────────────────────────────
async function supDetail(id) {
  let sup;
  try {
    sup = await api('GET', `/suppliers/${id}`);
  } catch (e) {
    toast('Errore caricamento fornitore: ' + e.message, 'error');
    return;
  }

  const linked = new Set(sup.ingredients.map(i => i.id));
  const modal  = document.getElementById('sup-detail-modal');
  modal.classList.remove('hidden');

  function drawDetail() {
    modal.innerHTML = `
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 id="detail-title"></h3>
          <button class="btn-icon" id="btn-close-detail">✕</button>
        </div>
        <div class="modal-body modal-split">
          <div class="modal-section">
            <h4>Ingredienti associati</h4>
            <div id="detail-ing-table"></div>

            <h4 style="margin-top:var(--space-5)">Aggiungi ingrediente</h4>
            <form id="link-form" class="form-row" style="align-items:flex-end;gap:var(--space-3)">
              <div class="form-group" style="flex:1">
                <label>Ingrediente</label>
                <select name="ingredient_id" id="link-ing-select" class="input" required>
                  <option value="">— seleziona —</option>
                </select>
              </div>
              <div class="form-group" style="width:140px">
                <label>Prezzo/unità €</label>
                <input name="unit_price" type="number" step="0.0001" min="0" class="input" placeholder="0.0000">
              </div>
              <button type="submit" class="btn btn-primary" id="btn-link-submit">Associa</button>
            </form>
          </div>
          <div class="modal-section">
            <h4>Scheda fornitore</h4>
            <dl class="detail-list" id="detail-dl"></dl>
            <button class="btn btn-outline btn-full" style="margin-top:var(--space-4)" id="btn-edit-from-detail">
              Modifica scheda
            </button>
          </div>
        </div>
      </div>`;

    // Titolo (textContent: sicuro)
    document.getElementById('detail-title').textContent = sup.name;

    // Scheda info
    const dl = document.getElementById('detail-dl');
    dl.innerHTML = [
      supRow('Referente', sup.contact_name),
      supRow('Telefono',  sup.phone),
      supRow('Email',     sup.email),
      supRow('Note',      sup.notes),
    ].join('');

    // Tabella ingredienti associati
    const ingTable = document.getElementById('detail-ing-table');
    if (!sup.ingredients.length) {
      ingTable.innerHTML = `<p class="text-muted">Nessun ingrediente associato</p>`;
    } else {
      const table = document.createElement('table');
      table.className = 'data-table';
      table.innerHTML = `<thead><tr><th>Ingrediente</th><th>Unità</th><th class="num">Prezzo/unità</th><th></th></tr></thead>`;
      const tbody = document.createElement('tbody');
      sup.ingredients.forEach(ing => {
        const tr = document.createElement('tr');
        const tdName  = document.createElement('td'); tdName.textContent  = ing.name;
        const tdUnit  = document.createElement('td'); tdUnit.textContent  = ing.unit ?? '—';
        const tdPrice = document.createElement('td'); tdPrice.className = 'num tabular';
        tdPrice.textContent = ing.unit_price != null ? `€${Number(ing.unit_price).toFixed(4)}` : '—';
        const tdAct   = document.createElement('td');
        const unlinkBtn = document.createElement('button');
        unlinkBtn.className = 'btn btn-sm btn-ghost';
        unlinkBtn.textContent = 'Rimuovi';
        unlinkBtn.addEventListener('click', async () => {
          unlinkBtn.disabled = true;
          try {
            await api('DELETE', `/suppliers/${id}/ingredients/${ing.id}`);
            sup = await api('GET', `/suppliers/${id}`);
            linked.clear(); sup.ingredients.forEach(i => linked.add(i.id));
            drawDetail();
            toast('Ingrediente rimosso', 'info');
          } catch (e) {
            toast(e.message, 'error');
            unlinkBtn.disabled = false;
          }
        });
        tdAct.appendChild(unlinkBtn);
        tr.append(tdName, tdUnit, tdPrice, tdAct);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      ingTable.appendChild(table);
    }

    // Select ingredienti non ancora associati
    const sel = document.getElementById('link-ing-select');
    _ing.filter(i => !linked.has(i.id)).forEach(i => {
      const opt = document.createElement('option');
      opt.value = i.id;
      opt.textContent = `${i.name}${i.unit ? ' (' + i.unit + ')' : ''}`;
      sel.appendChild(opt);
    });

    // Listener X e Modifica
    document.getElementById('btn-close-detail').addEventListener('click', supCloseDetail);
    document.getElementById('btn-edit-from-detail').addEventListener('click', () => {
      supCloseDetail();
      supOpenForm(sup);
    });

    // Form associa ingrediente
    document.getElementById('link-form').addEventListener('submit', async e => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-link-submit');
      submitBtn.disabled = true;
      const fd            = new FormData(e.target);
      const ingredient_id = parseInt(fd.get('ingredient_id'));
      const unit_price    = fd.get('unit_price') ? parseFloat(fd.get('unit_price')) : null;
      if (!ingredient_id) { toast('Seleziona un ingrediente', 'error'); submitBtn.disabled = false; return; }
      try {
        await api('POST', `/suppliers/${id}/ingredients`, { ingredient_id, unit_price });
        sup = await api('GET', `/suppliers/${id}`);
        linked.clear(); sup.ingredients.forEach(i => linked.add(i.id));
        drawDetail();
        toast('Ingrediente associato', 'success');
      } catch (err) {
        toast('Errore: ' + err.message, 'error');
        submitBtn.disabled = false;
      }
    });
  }

  drawDetail();
}

function supCloseDetail() {
  document.getElementById('sup-detail-modal')?.classList.add('hidden');
}

async function supReload() {
  const [s, i] = await Promise.all([
    api('GET', '/suppliers/'),
    api('GET', '/ingredients/?active_only=false'),
  ]);
  _sup = s;
  _ing = i;
  supFilter();
}
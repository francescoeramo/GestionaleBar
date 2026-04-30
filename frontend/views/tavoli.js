// ============================================================
//  View: Gestione Tavoli
// ============================================================

// Funzione di escaping per prevenire XSS
function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function renderTavoli(container) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Mappa Tavoli</div>
        <div class="page-subtitle">Seleziona un tavolo per aprire la comanda</div>
      </div>
      <button class="btn btn-ghost btn-sm" id="btn-refresh-tavoli">↻ Aggiorna</button>
    </div>
    <div id="legend" class="flex gap-3 mt-2" style="margin-bottom:20px">
      <span class="flex gap-2" style="align-items:center;font-size:var(--text-xs);color:var(--color-text-muted)">
        <span style="width:10px;height:10px;border-radius:50%;background:var(--color-free);display:inline-block"></span> Libero
      </span>
      <span class="flex gap-2" style="align-items:center;font-size:var(--text-xs);color:var(--color-text-muted)">
        <span style="width:10px;height:10px;border-radius:50%;background:var(--color-occupied);display:inline-block"></span> Occupato
      </span>
      <span class="flex gap-2" style="align-items:center;font-size:var(--text-xs);color:var(--color-text-muted)">
        <span style="width:10px;height:10px;border-radius:50%;background:var(--color-reserved);display:inline-block"></span> Riservato
      </span>
    </div>
    <div id="tables-grid" class="tables-grid"></div>
  `;

  async function loadTavoli() {
    try {
      const tables = await api('GET', '/tables/');
      const grid = document.getElementById('tables-grid');
      if (!tables.length) {
        grid.innerHTML = `<div class="empty-state"><p>Nessun tavolo configurato.</p></div>`;
        return;
      }

      // FIX XSS: costruiamo le card con createElement invece di innerHTML con dati raw
      grid.innerHTML = '';
      tables.forEach(t => {
        const statusLabel = { free: 'Libero', occupied: 'Occupato', reserved: 'Riservato' }[t.status] ?? t.status;

        const card = document.createElement('div');
        card.className = `table-card ${escHtml(t.status)}`;
        card.dataset.id = t.id;
        card.dataset.order = t.open_order_id ?? '';
        card.dataset.status = t.status;

        const nameEl = document.createElement('div');
        nameEl.className = 'table-name';
        nameEl.textContent = t.name; // textContent: nessun XSS possibile

        const statusRow = document.createElement('div');
        statusRow.style = 'margin:6px 0 4px';
        statusRow.innerHTML = `<span class="table-status-dot"></span>`;
        const statusText = document.createElement('span');
        statusText.style = 'font-size:var(--text-xs);color:var(--color-text-muted)';
        statusText.textContent = statusLabel;
        statusRow.appendChild(statusText);

        const infoEl = document.createElement('div');
        infoEl.className = 'table-info';
        infoEl.textContent = `${t.capacity} coperti`;

        card.appendChild(nameEl);
        card.appendChild(statusRow);
        card.appendChild(infoEl);

        if (t.status === 'occupied' && t.open_order_id) {
          const orderInfo = document.createElement('div');
          orderInfo.className = 'table-info';
          orderInfo.textContent = `Comanda #${t.open_order_id}`;
          card.appendChild(orderInfo);
        }

        card.addEventListener('click', () => handleTableClick(card));
        grid.appendChild(card);
      });

    } catch (e) {
      toast('Errore caricamento tavoli: ' + e.message, 'error');
    }
  }

  async function handleTableClick(card) {
    const id = +card.dataset.id;
    const status = card.dataset.status;
    const orderId = card.dataset.order;
    const name = card.querySelector('.table-name').textContent; // già testuale, sicuro

    if (status === 'occupied' && orderId) {
      location.hash = `#pos?order=${orderId}&table=${id}`;
    } else if (status === 'free') {
      openModal(`
        <div class="modal-title">Apri ${escHtml(name)}</div>
        <div>
          <label class="field-label">Numero coperti</label>
          <input id="inp-covers" class="input" type="number" min="1" max="20" value="2">
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
          <button class="btn btn-primary" data-modal-confirm>Apri tavolo</button>
        </div>
      `, async (overlay) => {
        const covers = +overlay.querySelector('#inp-covers').value || 1;
        try {
          const order = await api('POST', '/orders/', { table_id: id, covers });
          toast(`${name} aperto — Comanda #${order.id}`, 'success');
          location.hash = `#pos?order=${order.id}&table=${id}`;
        } catch (e) {
          toast('Errore: ' + e.message, 'error');
        }
      });
    } else {
      toast(`${name} è riservato`, 'info');
    }
  }

  document.getElementById('btn-refresh-tavoli').addEventListener('click', loadTavoli);
  await loadTavoli();
}
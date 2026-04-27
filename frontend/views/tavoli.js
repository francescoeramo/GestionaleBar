
// ============================================================
//  View: Gestione Tavoli
// ============================================================

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
      grid.innerHTML = tables.map(t => {
        const statusLabel = { free: 'Libero', occupied: 'Occupato', reserved: 'Riservato' }[t.status];
        const subtotalNote = t.status === 'occupied' && t.open_order_id
          ? `<div class="table-info">Comanda #${t.open_order_id}</div>` : '';
        return `
          <div class="table-card ${t.status}" data-id="${t.id}" data-order="${t.open_order_id || ''}" data-status="${t.status}">
            <div class="table-name">${t.name}</div>
            <div style="margin:6px 0 4px">
              <span class="table-status-dot"></span>
              <span style="font-size:var(--text-xs);color:var(--color-text-muted)">${statusLabel}</span>
            </div>
            <div class="table-info">${t.capacity} coperti</div>
            ${subtotalNote}
          </div>`;
      }).join('');

      grid.querySelectorAll('.table-card').forEach(card => {
        card.addEventListener('click', () => handleTableClick(card));
      });
    } catch (e) {
      toast('Errore caricamento tavoli: ' + e.message, 'error');
    }
  }

  async function handleTableClick(card) {
    const id = +card.dataset.id;
    const status = card.dataset.status;
    const orderId = card.dataset.order;
    const name = card.querySelector('.table-name').textContent;

    if (status === 'occupied' && orderId) {
      // Vai direttamente al POS con questo ordine
      location.hash = `#pos?order=${orderId}&table=${id}`;
    } else if (status === 'free') {
      // Chiedi coperti e apri ordine
      openModal(`
        <div class="modal-title">Apri ${name}</div>
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

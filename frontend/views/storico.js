// ╔══════════════════════════════════════════════════════════════╗
//  storico.js — Vista Storico Ordini
// ╚══════════════════════════════════════════════════════════════╝

window.renderStorico = async function (container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Storico Ordini</h1>
    </div>

    <div class="card" style="margin-bottom:1.25rem;padding:1rem 1.25rem">
      <div style="display:flex;flex-wrap:wrap;gap:.75rem;align-items:flex-end">
        <div class="form-group" style="margin:0;flex:1;min-width:140px">
          <label class="form-label">Dal</label>
          <input type="date" id="st-from" class="form-control">
        </div>
        <div class="form-group" style="margin:0;flex:1;min-width:140px">
          <label class="form-label">Al</label>
          <input type="date" id="st-to" class="form-control">
        </div>
        <div class="form-group" style="margin:0;flex:1;min-width:130px">
          <label class="form-label">Stato</label>
          <select id="st-status" class="form-control">
            <option value="">Tutti</option>
            <option value="closed">Chiusi</option>
            <option value="cancelled">Annullati</option>
          </select>
        </div>
        <button id="st-search" class="btn btn-primary">Cerca</button>
        <button id="st-reset" class="btn btn-ghost">Reset</button>
      </div>
    </div>

    <div id="st-summary" style="display:none" class="card" style="margin-bottom:1.25rem;padding:1rem 1.25rem">
    </div>

    <div id="st-table-wrap">
      <p class="text-muted" style="text-align:center;padding:2rem">Seleziona un intervallo di date e premi Cerca.</p>
    </div>

    <div id="st-detail-modal" class="modal-overlay" style="display:none"></div>
  `;

  // ── date di default: oggi ─────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('st-from').value = today;
  document.getElementById('st-to').value   = today;

  document.getElementById('st-search').addEventListener('click', loadOrders);
  document.getElementById('st-reset').addEventListener('click', () => {
    document.getElementById('st-from').value    = today;
    document.getElementById('st-to').value      = today;
    document.getElementById('st-status').value  = '';
    loadOrders();
  });

  await loadOrders();
};

// ── carica ordini ─────────────────────────────────────────────────────────────
async function loadOrders() {
  const from   = document.getElementById('st-from').value;
  const to     = document.getElementById('st-to').value;
  const status = document.getElementById('st-status').value;
  const wrap   = document.getElementById('st-table-wrap');
  const sumBox = document.getElementById('st-summary');

  wrap.innerHTML = '<div class="loading-spinner"></div>';

  try {
    let qs = '';
    if (status) qs += `status=${status}&`;
    const orders = await api('GET', `/orders/?${qs}`);

    // filtra per data lato client (opened_at o closed_at)
    const fromDt = from ? new Date(from + 'T00:00:00') : null;
    const toDt   = to   ? new Date(to   + 'T23:59:59') : null;

    const filtered = orders.filter(o => {
      const ref = new Date(o.closed_at || o.opened_at);
      if (fromDt && ref < fromDt) return false;
      if (toDt   && ref > toDt)   return false;
      return true;
    });

    renderSummary(filtered, sumBox);
    renderTable(filtered, wrap);
  } catch (err) {
    wrap.innerHTML = `<p class="error-state">Errore: ${err.message}</p>`;
  }
}

// ── riepilogo numerico ────────────────────────────────────────────────────────
function renderSummary(orders, box) {
  const closed     = orders.filter(o => o.status === 'closed');
  const cancelled  = orders.filter(o => o.status === 'cancelled');
  const totalGross = closed.reduce((s, o) => s + (o.total_gross || 0), 0);
  const totalNet   = closed.reduce((s, o) => s + (o.total_net   || 0), 0);

  box.style.display = '';
  box.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:1.5rem;padding:.25rem 0">
      <div class="stat-card">
        <span class="stat-label">Ordini chiusi</span>
        <span class="stat-value">${closed.length}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Annullati</span>
        <span class="stat-value">${cancelled.length}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Totale lordo</span>
        <span class="stat-value">${totalGross.toFixed(2)} €</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Totale netto</span>
        <span class="stat-value" style="color:var(--color-primary)">${totalNet.toFixed(2)} €</span>
      </div>
    </div>
  `;
}

// ── tabella ordini ────────────────────────────────────────────────────────────
function renderTable(orders, wrap) {
  if (!orders.length) {
    wrap.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem">Nessun ordine trovato.</p>';
    return;
  }

  const rows = orders.map(o => {
    const dt = new Date(o.closed_at || o.opened_at);
    const dateStr = dt.toLocaleDateString('it-IT');
    const timeStr = dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const badge = o.status === 'closed'
      ? '<span class="badge badge-success">Chiuso</span>'
      : '<span class="badge badge-error">Annullato</span>';
    const net = o.total_net != null ? `${Number(o.total_net).toFixed(2)} €` : '—';
    return `
      <tr>
        <td>#${o.id}</td>
        <td>${dateStr} ${timeStr}</td>
        <td>${o.table_id ? `Tavolo ${o.table_id}` : '—'}</td>
        <td>${badge}</td>
        <td style="text-align:right">${net}</td>
        <td style="text-align:right">
          <button class="btn btn-ghost btn-sm" data-detail="${o.id}">Dettaglio</button>
        </td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Data / Ora</th>
            <th>Tavolo</th>
            <th>Stato</th>
            <th style="text-align:right">Totale netto</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;

  wrap.querySelectorAll('[data-detail]').forEach(btn => {
    btn.addEventListener('click', () => openOrderDetail(Number(btn.dataset.detail)));
  });
}

// ── modal dettaglio ordine ────────────────────────────────────────────────────
async function openOrderDetail(orderId) {
  try {
    const order    = await api('GET', `/orders/${orderId}`);
    const payments = await api('GET', `/payments/order/${orderId}`);

    const itemRows = (order.items || []).map(it => {
      const total = ((it.unit_price_snapshot || 0) * it.quantity).toFixed(2);
      const status = it.status === 'cancelled'
        ? '<span class="badge badge-error">Ann.</span>'
        : '';
      return `<tr>
        <td>${it.name || it.product_name || '—'}</td>
        <td style="text-align:center">${it.quantity}</td>
        <td style="text-align:right">${Number(it.unit_price_snapshot).toFixed(2)} €</td>
        <td style="text-align:right">${total} €</td>
        <td>${status}</td>
      </tr>`;
    }).join('');

    const payRows = payments.map(p => {
      const method = { cash: 'Contanti', card: 'Carta', voucher: 'Voucher' }[p.method] || p.method;
      return `<tr><td>${method}</td><td style="text-align:right">${Number(p.amount).toFixed(2)} €</td></tr>`;
    }).join('');

    const discountLine = order.discount_type && order.discount_type !== 'none'
      ? `<p style="margin:.5rem 0 0">Sconto: ${ order.discount_type === 'percent'
          ? `${order.discount_value}%`
          : `${Number(order.discount_value).toFixed(2)} €` }</p>`
      : '';

    openModal(`
      <h2 class="modal-title">Ordine #${order.id}</h2>
      <h3 style="margin:.75rem 0 .4rem;font-size:.875rem;text-transform:uppercase;opacity:.6">Articoli</h3>
      <div class="table-container" style="max-height:260px;overflow-y:auto">
        <table class="table">
          <thead><tr><th>Prodotto</th><th>Q.tà</th><th>Prezzo</th><th>Totale</th><th></th></tr></thead>
          <tbody>${itemRows || '<tr><td colspan="5" style="text-align:center">Nessun articolo</td></tr>'}</tbody>
        </table>
      </div>
      <div style="margin-top:.75rem;text-align:right">
        <strong>Lordo: ${Number(order.total_gross || 0).toFixed(2)} €</strong>${discountLine}
        <p style="margin:.25rem 0 0;font-size:1.1rem"><strong>Netto: ${Number(order.total_net || 0).toFixed(2)} €</strong></p>
      </div>
      ${ payments.length ? `
        <h3 style="margin:1rem 0 .4rem;font-size:.875rem;text-transform:uppercase;opacity:.6">Pagamenti</h3>
        <table class="table"><tbody>${payRows}</tbody></table>` : '' }
      <div class="modal-actions">
        <button class="btn btn-primary" data-modal-cancel>Chiudi</button>
      </div>
    `);
  } catch (err) {
    toast('Errore nel caricamento del dettaglio: ' + err.message, 'error');
  }
}

// ============================================================
//  View: POS / Comande
// ============================================================

// Funzione di escaping per prevenire XSS (anche negli attributi HTML)
function posEsc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function renderPos(container) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  let currentOrderId = params.get('order') ? +params.get('order') : null;
  let currentTableId = params.get('table') ? +params.get('table') : null;

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">Comanda / POS</div>
        <div id="pos-subtitle" class="page-subtitle">Seleziona un tavolo dalla mappa</div>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" id="btn-back-tavoli">← Tavoli</button>
        <button class="btn btn-ghost btn-sm" id="btn-free-item">+ Fuori menù</button>
      </div>
    </div>
    <div class="pos-layout">
      <!-- Catalogo -->
      <div class="pos-catalog card" style="padding:16px">
        <div class="catalog-cats" id="cat-filters"></div>
        <div class="products-grid" id="products-grid">
          <div class="empty-state"><p>Caricamento prodotti…</p></div>
        </div>
      </div>
      <!-- Ordine -->
      <div class="pos-order card" style="padding:0">
        <div class="order-header">
          <div style="font-weight:600;font-size:var(--text-sm)" id="order-label">Nessun ordine</div>
          <div style="font-size:var(--text-xs);color:var(--color-text-muted);margin-top:2px" id="order-meta"></div>
        </div>
        <div class="order-items-list" id="order-items"></div>
        <div class="order-footer">
          <div class="order-total-label">TOTALE</div>
          <div class="order-total" id="order-total">€ 0,00</div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-success" id="btn-pay" disabled>
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="16" height="11" rx="2"/><path d="M2 9h16"/></svg>
              Incassa
            </button>
            <button class="btn btn-danger btn-sm" id="btn-cancel-order" disabled>Annulla ordine</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-back-tavoli').addEventListener('click', () => {
    location.hash = '#tavoli';
  });

  let categories = [];
  let products = [];
  let currentCat = null;
  let orderItems = [];

  // ── Carica categorie e prodotti ──────────────────────────────
  async function loadCatalog() {
    [categories, products] = await Promise.all([
      api('GET', '/categories/'),
      api('GET', '/products/'),
    ]);
    renderCatFilters();
    renderProducts();
  }

  function renderCatFilters() {
    const el = document.getElementById('cat-filters');
    el.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = `cat-btn ${currentCat === null ? 'active' : ''}`;
    allBtn.textContent = 'Tutti';
    allBtn.addEventListener('click', () => { currentCat = null; renderCatFilters(); renderProducts(); });
    el.appendChild(allBtn);

    categories.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `cat-btn ${currentCat === c.id ? 'active' : ''}`;
      btn.textContent = c.name; // textContent: sicuro contro XSS
      btn.addEventListener('click', () => { currentCat = c.id; renderCatFilters(); renderProducts(); });
      el.appendChild(btn);
    });
  }

  function renderProducts() {
    const grid = document.getElementById('products-grid');
    const filtered = currentCat ? products.filter(p => p.category_id === currentCat) : products;

    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state"><p>Nessun prodotto in questa categoria.</p></div>`;
      return;
    }

    // FIX XSS: costruiamo i bottoni prodotto con createElement
    // I data-* vengono impostati con dataset (sicuro) invece di template literal
    grid.innerHTML = '';
    filtered.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'product-btn';
      // Usiamo dataset per evitare injection negli attributi
      btn.dataset.id = p.id;
      btn.dataset.price = p.sale_price;
      btn.dataset.mods = p.allow_mods;
      // NON mettiamo il nome nel dataset — lo leggiamo dall'oggetto p direttamente nel click handler

      const nameEl = document.createElement('div');
      nameEl.className = 'p-name';
      nameEl.textContent = p.name; // textContent: nessun XSS

      const priceEl = document.createElement('div');
      priceEl.className = 'p-price';
      priceEl.textContent = `€ ${Number(p.sale_price).toFixed(2)}`;

      btn.appendChild(nameEl);
      btn.appendChild(priceEl);

      // Salviamo i dati del prodotto sull'elemento (no DOM attribute injection)
      btn._product = { id: p.id, name: p.name, price: p.sale_price, canMod: !!p.allow_mods };
      btn.addEventListener('click', () => handleProductClick(btn._product));
      grid.appendChild(btn);
    });
  }

  async function handleProductClick({ id, name, price, canMod }) {
    if (!currentOrderId) {
      toast('Seleziona prima un tavolo dalla mappa', 'info');
      return;
    }

    if (canMod) {
      openModal(`
        <div class="modal-title">Aggiungi: ${posEsc(name)}</div>
        <div>
          <label class="field-label">Quantità</label>
          <input id="inp-qty" class="input" type="number" min="1" max="99" value="1" style="width:80px">
        </div>
        <div class="mt-4">
          <label class="field-label">Note / Modifiche (opzionale)</label>
          <input id="inp-note" class="input" type="text" placeholder="Es. senza ghiaccio, doppia dose gin…">
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
          <button class="btn btn-primary" data-modal-confirm>Aggiungi</button>
        </div>
      `, async (overlay) => {
        const qty = +overlay.querySelector('#inp-qty').value || 1;
        const note = overlay.querySelector('#inp-note').value.trim() || null;
        await addItem({
          item_type: 'menu',
          product_id: id,
          product_name_snapshot: name,
          unit_price_snapshot: price,
          quantity: qty,
          notes: note,
        });
      });
    } else {
      await addItem({
        item_type: 'menu',
        product_id: id,
        product_name_snapshot: name,
        unit_price_snapshot: price,
        quantity: 1,
      });
    }
  }

  // ── Fuori menù ───────────────────────────────────────────────
  document.getElementById('btn-free-item').addEventListener('click', () => {
    if (!currentOrderId) { toast('Seleziona prima un tavolo', 'info'); return; }
    openModal(`
      <div class="modal-title">Prodotto fuori menù</div>
      <div>
        <label class="field-label">Nome prodotto</label>
        <input id="fi-name" class="input" type="text" placeholder="Es. Mojito speciale, Spritz analcolico…">
      </div>
      <div class="mt-4 grid-2">
        <div>
          <label class="field-label">Prezzo (€)</label>
          <input id="fi-price" class="input" type="number" min="0" step="0.5" value="8">
        </div>
        <div>
          <label class="field-label">Quantità</label>
          <input id="fi-qty" class="input" type="number" min="1" value="1">
        </div>
      </div>
      <div class="mt-4">
        <label class="field-label">Note</label>
        <input id="fi-note" class="input" type="text" placeholder="Opzionale">
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
        <button class="btn btn-primary" data-modal-confirm>Aggiungi</button>
      </div>
    `, async (overlay) => {
      const name = overlay.querySelector('#fi-name').value.trim();
      if (!name) { toast('Inserisci un nome', 'error'); return; }
      const price = +overlay.querySelector('#fi-price').value;
      const qty   = +overlay.querySelector('#fi-qty').value || 1;
      const note  = overlay.querySelector('#fi-note').value.trim() || null;
      await addItem({
        item_type: 'free',
        product_name_snapshot: name,
        unit_price_snapshot: price,
        quantity: qty,
        notes: note,
      });
    });
  });

  async function addItem(data) {
    try {
      const item = await api('POST', `/orders/${currentOrderId}/items`, data);
      orderItems.push(item);
      renderOrderItems();
      closeModal();
      toast(`${posEsc(data.product_name_snapshot)} aggiunto`, 'success');
    } catch (e) {
      toast('Errore: ' + e.message, 'error');
    }
  }

  // ── Rendering ordine ─────────────────────────────────────────
  function renderOrderItems() {
    const el = document.getElementById('order-items');
    const active = orderItems.filter(i => i.status !== 'cancelled');

    if (!active.length) {
      el.innerHTML = `<div class="empty-state" style="padding:32px 16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
        <p>Comanda vuota</p></div>`;
    } else {
      el.innerHTML = '';
      active.forEach(item => {
        const row = document.createElement('div');
        row.className = 'order-item-row';

        const qty = document.createElement('span');
        qty.className = 'oi-qty';
        qty.textContent = `${item.quantity}×`;

        const nameWrap = document.createElement('span');
        nameWrap.className = 'oi-name';
        nameWrap.textContent = item.product_name_snapshot; // sicuro

        if (item.notes) {
          const modTag = document.createElement('span');
          modTag.className = 'oi-mod-tag';
          modTag.textContent = `↳ ${item.notes}`; // sicuro
          nameWrap.appendChild(modTag);
        }

        const price = document.createElement('span');
        price.className = 'oi-price';
        price.textContent = `€${(item.unit_price_snapshot * item.quantity).toFixed(2)}`;

        const delBtn = document.createElement('button');
        delBtn.className = 'oi-del btn-icon';
        delBtn.title = 'Rimuovi';
        delBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5l10 10M15 5L5 15"/></svg>`;

        // FIX: disabilitiamo il bottone durante la chiamata per evitare double-click
        delBtn.addEventListener('click', async () => {
          delBtn.disabled = true;
          try {
            await api('DELETE', `/orders/${currentOrderId}/items/${item.id}`);
            orderItems = orderItems.map(i => i.id === item.id ? { ...i, status: 'cancelled' } : i);
            renderOrderItems();
          } catch (e) {
            toast(e.message, 'error');
            delBtn.disabled = false;
          }
        });

        row.appendChild(qty);
        row.appendChild(nameWrap);
        row.appendChild(price);
        row.appendChild(delBtn);
        el.appendChild(row);
      });
    }

    const total = active.reduce((s, i) => s + i.unit_price_snapshot * i.quantity, 0);
    document.getElementById('order-total').textContent = `€ ${total.toFixed(2)}`;

    const hasItems = active.length > 0;
    document.getElementById('btn-pay').disabled = !hasItems;
    document.getElementById('btn-cancel-order').disabled = !currentOrderId;
  }

  // ── Incasso ──────────────────────────────────────────────────
  document.getElementById('btn-pay').addEventListener('click', () => showPayModal());

  async function showPayModal() {
    // FIX: rileggiamo il totale dal server prima di aprire il modal
    // per evitare di usare dati stale se l'ordine è stato modificato altrove
    let freshOrder;
    try {
      freshOrder = await api('GET', `/orders/${currentOrderId}`);
    } catch (e) {
      toast('Errore nel recupero dell\'ordine: ' + e.message, 'error');
      return;
    }

    const activeItems = (freshOrder.items || []).filter(i => i.status !== 'cancelled');
    const total = activeItems.reduce((s, i) => s + i.unit_price_snapshot * i.quantity, 0);
    const totalFmt = total.toFixed(2);

    const overlay = openModal(`
      <div class="modal-title">Incassa — € ${totalFmt}</div>
      <div>
        <label class="field-label">Metodo di pagamento</label>
        <select id="pay-method" class="input">
          <option value="cash">Contanti</option>
          <option value="card">Carta</option>
          <option value="voucher">Voucher</option>
        </select>
      </div>
      <div id="pay-cash-extra" class="mt-4">
        <label class="field-label">Contanti ricevuti (€)</label>
        <input id="pay-cash-given" class="input" type="number" min="${totalFmt}" step="0.5" value="${Math.ceil(total)}">
        <div id="pay-change" style="margin-top:6px;font-size:var(--text-sm);color:var(--color-success)"></div>
      </div>
      <div id="pay-voucher-extra" class="mt-4" style="display:none">
        <label class="field-label">Codice voucher</label>
        <input id="pay-voucher-code" class="input" type="text" placeholder="VOUCHER123">
      </div>
      <div id="pay-discount" class="mt-4">
        <label class="field-label">Sconto (opzionale)</label>
        <div class="flex gap-2">
          <select id="discount-type" class="input" style="width:120px">
            <option value="">Nessuno</option>
            <option value="percent">%</option>
            <option value="flat">€ Fisso</option>
          </select>
          <input id="discount-val" class="input" type="number" min="0" placeholder="0" style="width:80px">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-cancel>Annulla</button>
        <button class="btn btn-success" id="btn-confirm-pay" data-modal-confirm>Conferma pagamento</button>
      </div>
    `, async (ov) => {
      // FIX: disabilita il bottone subito per evitare doppio submit
      const confirmBtn = ov.querySelector('#btn-confirm-pay');
      if (confirmBtn) confirmBtn.disabled = true;

      const method = ov.querySelector('#pay-method').value;
      const cashGiven = method === 'cash' ? +ov.querySelector('#pay-cash-given').value : null;
      const voucherCode = method === 'voucher' ? ov.querySelector('#pay-voucher-code').value : null;
      const discType = ov.querySelector('#discount-type').value || null;
      const discVal = +ov.querySelector('#discount-val').value || 0;

      // Il calcolo del netto è solo per determinare l'importo da pagare lato frontend,
      // il backend ricalcola e valida indipendentemente
      let netTotal = total;
      if (discType === 'percent') netTotal = total * (1 - discVal / 100);
      else if (discType === 'flat') netTotal = Math.max(total - discVal, 0);
      netTotal = Math.round(netTotal * 100) / 100;

      try {
        await api('POST', '/payments/', {
          order_id: currentOrderId,
          method,
          amount: netTotal,
          cash_given: cashGiven,
          voucher_code: voucherCode,
        });
        await api('PATCH', `/orders/${currentOrderId}/close`, {
          discount_type: discType,
          discount_value: discVal,
        });
        toast('Pagamento registrato! Conto chiuso.', 'success');
        currentOrderId = null;
        orderItems = [];
        renderOrderItems();
        document.getElementById('order-label').textContent = 'Nessun ordine';
        document.getElementById('order-meta').textContent = '';
        location.hash = '#tavoli';
      } catch (e) {
        toast('Errore pagamento: ' + e.message, 'error');
        if (confirmBtn) confirmBtn.disabled = false;
      }
    });

    // FIX: accediamo agli elementi direttamente tramite overlay (no setTimeout)
    const methodSel = overlay.querySelector('#pay-method');
    const cashDiv = overlay.querySelector('#pay-cash-extra');
    const voucherDiv = overlay.querySelector('#pay-voucher-extra');
    const cashInput = overlay.querySelector('#pay-cash-given');
    const changeDiv = overlay.querySelector('#pay-change');

    function updateChange() {
      const given = +cashInput.value;
      const change = given - total;
      changeDiv.textContent = change >= 0 ? `Resto: € ${change.toFixed(2)}` : '';
    }

    cashInput?.addEventListener('input', updateChange);
    updateChange();

    methodSel?.addEventListener('change', () => {
      cashDiv.style.display = methodSel.value === 'cash' ? '' : 'none';
      voucherDiv.style.display = methodSel.value === 'voucher' ? '' : 'none';
    });
  }

  // ── Annulla ordine ───────────────────────────────────────────
  document.getElementById('btn-cancel-order').addEventListener('click', () => {
    if (!currentOrderId) return;
    openModal(`
      <div class="modal-title">Annulla ordine?</div>
      <p style="font-size:var(--text-sm);color:var(--color-text-muted)">
        Questa azione annullerà la comanda corrente e libererà il tavolo.
      </p>
      <div class="modal-footer">
        <button class="btn btn-ghost" data-modal-cancel>No, torna indietro</button>
        <button class="btn btn-danger" id="btn-confirm-cancel" data-modal-confirm>Sì, annulla</button>
      </div>
    `, async (ov) => {
      const confirmBtn = ov.querySelector('#btn-confirm-cancel');
      if (confirmBtn) confirmBtn.disabled = true;
      try {
        await api('PATCH', `/orders/${currentOrderId}/cancel`);
        toast('Ordine annullato', 'info');
        currentOrderId = null;
        orderItems = [];
        renderOrderItems();
        location.hash = '#tavoli';
      } catch (e) {
        toast(e.message, 'error');
        if (confirmBtn) confirmBtn.disabled = false;
      }
    });
  });

  // ── Se arriva con un ordine esistente, caricalo ──────────────
  async function loadExistingOrder(orderId) {
    try {
      const order = await api('GET', `/orders/${orderId}`);
      orderItems = order.items || [];
      document.getElementById('order-label').textContent =
        order.table_id ? `Tavolo — Comanda #${order.id}` : `Banco — Comanda #${order.id}`;
      document.getElementById('order-meta').textContent =
        `${order.covers} coperti · aperto alle ${order.opened_at.slice(11, 16)}`;
      renderOrderItems();
    } catch (e) {
      toast('Errore caricamento ordine: ' + e.message, 'error');
    }
  }

  // ── Init ─────────────────────────────────────────────────────
  await loadCatalog();
  if (currentOrderId) {
    document.getElementById('order-label').textContent = `Caricamento ordine #${currentOrderId}…`;
    await loadExistingOrder(currentOrderId);
    document.getElementById('btn-cancel-order').disabled = false;
  }
}
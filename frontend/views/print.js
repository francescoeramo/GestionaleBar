// ============================================================
//  print.js — Utilità stampa scontrino
//  Usato da pos.js: window.printReceipt(order, payments)
// ============================================================

window.printReceipt = function (order, payments) {
  const el = document.getElementById('print-receipt');
  if (!el) return;

  const dt = new Date(order.closed_at || order.opened_at);
  const dateStr = dt.toLocaleDateString('it-IT');
  const timeStr = dt.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const itemRows = (order.items || [])
    .filter(i => i.status !== 'cancelled')
    .map(i => {
      const name  = String(i.name || i.product_name || '').replace(/</g, '&lt;');
      const total = ((i.unit_price_snapshot || 0) * i.quantity).toFixed(2);
      return `<tr>
        <td>${name}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">${total} &euro;</td>
      </tr>`;
    }).join('');

  const payRows = (payments || []).map(p => {
    const method = { cash: 'Contanti', card: 'Carta', voucher: 'Voucher' }[p.method] || p.method;
    return `<tr>
      <td>${method}</td>
      <td style="text-align:right">${Number(p.amount).toFixed(2)} &euro;</td>
    </tr>`;
  }).join('');

  let discountLine = '';
  if (order.discount_type && order.discount_type !== 'none' && order.discount_value > 0) {
    const dVal = order.discount_type === 'percent'
      ? `${order.discount_value}%`
      : `${Number(order.discount_value).toFixed(2)} €`;
    discountLine = `<tr><td colspan="2">Sconto (${dVal})</td><td style="text-align:right">-</td></tr>`;
  }

  el.innerHTML = `
    <div style="max-width:320px;margin:0 auto;font-family:monospace;font-size:12px">
      <h2 style="text-align:center;margin:0 0 4px">Bar Gestionale</h2>
      <p style="text-align:center;margin:0 0 8px">${dateStr} ${timeStr}</p>
      ${ order.table_id ? `<p style="text-align:center;margin:0 0 8px">Tavolo ${order.table_id}</p>` : '' }
      <hr>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left">Prodotto</th>
            <th style="text-align:center">Q</th>
            <th style="text-align:right">Tot.</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <hr>
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${discountLine}
          <tr><td><strong>Lordo</strong></td><td style="text-align:right">${Number(order.total_gross||0).toFixed(2)} &euro;</td></tr>
          <tr><td><strong>TOTALE</strong></td><td style="text-align:right"><strong>${Number(order.total_net||0).toFixed(2)} &euro;</strong></td></tr>
        </tbody>
      </table>
      ${ payRows ? `<hr><table style="width:100%"><tbody>${payRows}</tbody></table>` : '' }
      <hr>
      <p style="text-align:center;margin:8px 0 0">Grazie e arrivederci!</p>
    </div>
  `;

  window.print();
};

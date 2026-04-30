// ╔══════════════════════════════════════════════════════════════╗
//  Bar Gestionale — app.js  (Fase 2)
// ╚══════════════════════════════════════════════════════════════╝

// ── api() ─────────────────────────────────────────────────────────────────────
window.api = async function(method, path, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`/api${path}`, opts);
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.detail || JSON.stringify(j); } catch (_) {}
    throw new Error(`${method} /api${path} → ${res.status}: ${msg}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── toast() ───────────────────────────────────────────────────────────────────
window.toast = function(msg, type = 'info') {
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
};

// ── openModal(html, onConfirm) ────────────────────────────────────────────────
window.openModal = function(html, onConfirm) {
  document.querySelectorAll('.modal-overlay[data-app-modal]').forEach(el => el.remove());
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.dataset.appModal = '1';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  overlay.querySelector('[data-modal-cancel]')?.addEventListener('click', closeModal);
  overlay.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
    if (typeof onConfirm === 'function') onConfirm(overlay);
  });
  return overlay;
};

window.closeModal = function() {
  document.querySelectorAll('.modal-overlay[data-app-modal]').forEach(el => el.remove());
};

// ── router ────────────────────────────────────────────────────────────────────
const ROUTE_FNS = {
  tavoli:      'renderTavoli',
  pos:         'renderPos',
  menu:        'renderMenu',
  ingredienti: 'renderIngredienti',
  magazzino:   'renderMagazzino',
  fornitori:   'renderFornitori',
};

const DEFAULT   = 'tavoli';
const container = document.getElementById('view-container');
const sidebar   = document.getElementById('sidebar');
const nav       = document.querySelector('.sidebar-nav');

// ── hamburger mobile ──────────────────────────────────────────────────────────
const toggle = document.createElement('button');
toggle.id = 'menu-toggle';
toggle.setAttribute('aria-label', 'Apri menu');
toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
document.body.appendChild(toggle);

const backdrop = document.createElement('div');
backdrop.id = 'sidebar-backdrop';
document.body.appendChild(backdrop);

toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
backdrop.addEventListener('click', () => sidebar.classList.remove('open'));

// ── nuove voci sidebar ────────────────────────────────────────────────────────
const NEW_ITEMS = [
  {
    key: 'magazzino', label: 'Magazzino',
    svg: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="8" width="16" height="10" rx="1.5"/><path d="M5 8V6a5 5 0 0 1 10 0v2"/><path d="M8 13h4"/></svg>',
  },
  {
    key: 'fornitori', label: 'Fornitori',
    svg: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="8" width="12" height="9" rx="1"/><path d="M13 11h3l2 3v3h-5V11Z"/><circle cx="5" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
  },
];
NEW_ITEMS.forEach(({ key, label, svg }) => {
  if (nav.querySelector(`[data-view="${key}"]`)) return;
  const a = document.createElement('a');
  a.href = `#${key}`;
  a.className    = 'nav-item';
  a.dataset.view = key;
  a.innerHTML    = `${svg}${label}`;
  nav.appendChild(a);
});

const ver = document.querySelector('.sidebar-version');
if (ver) ver.textContent = 'v0.2';

// ── navigate ──────────────────────────────────────────────────────────────────
window._routeParams = {};

async function navigate() {
  const raw   = location.hash.slice(1) || DEFAULT;
  const [key, qs] = raw.split('?');
  window._routeParams = Object.fromEntries(new URLSearchParams(qs || ''));
  const routeKey = ROUTE_FNS[key] ? key : DEFAULT;
  const fn       = window[ROUTE_FNS[routeKey]];

  document.querySelectorAll('.nav-item').forEach(a =>
    a.classList.toggle('active', a.dataset.view === routeKey));

  sidebar.classList.remove('open');
  container.innerHTML = '<div class="loading-spinner"></div>';

  if (typeof fn !== 'function') {
    container.innerHTML = `<div class="error-state"><p>Modulo <strong>${routeKey}</strong> non trovato.</p></div>`;
    return;
  }
  try {
    await fn(container);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <p>Errore nel modulo <strong>${routeKey}</strong>:</p>
        <pre>${err.message}</pre>
      </div>`;
    console.error('[router]', routeKey, err);
  }
}

window.addEventListener('hashchange', navigate);
navigate();

// ── dark mode ─────────────────────────────────────────────────────────────────
(function () {
  const btn  = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let dark = matchMedia('(prefers-color-scheme:dark)').matches;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  btn?.addEventListener('click', () => {
    dark = !dark;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  });
})();
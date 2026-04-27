// ── Helper API globale ────────────────────────────────────────────────────────
window.api = async function(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`/api${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${err}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Mappa route → nome funzione globale ───────────────────────────────────────
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
const nav       = document.querySelector('.sidebar-nav');

// ── aggiungi voci Magazzino e Fornitori alla sidebar ──────────────────────────
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
if (ver) ver.textContent = 'v0.2 — Fase 2';

// ── router ────────────────────────────────────────────────────────────────────
async function navigate() {
  const hash   = location.hash.slice(1) || DEFAULT;
  const key    = ROUTE_FNS[hash] ? hash : DEFAULT;
  const fnName = ROUTE_FNS[key];
  const fn     = window[fnName];

  document.querySelectorAll('.nav-item').forEach(a =>
    a.classList.toggle('active', a.dataset.view === key)
  );

  container.innerHTML = '<div class="loading-spinner"></div>';

  if (typeof fn !== 'function') {
    container.innerHTML = `<div class="error-state"><p>Modulo <strong>${key}</strong> non trovato.<br>Assicurati che views/${key}.js sia incluso in index.html.</p></div>`;
    return;
  }

  try {
    await fn(container);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <p>Errore nel modulo <strong>${key}</strong>:</p>
        <pre style="font-size:.8em;overflow:auto;white-space:pre-wrap">${err.message}</pre>
      </div>`;
    console.error('[router]', key, err);
  }
}

window.addEventListener('hashchange', navigate);
navigate();

// ── toast globale ─────────────────────────────────────────────────────────────
window.toast = function(msg, type = 'info') {
  const tc = document.getElementById('toast-container');
  if (!tc) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  tc.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
};

// ── dark mode ─────────────────────────────────────────────────────────────────
(function () {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root   = document.documentElement;
  let dark = matchMedia('(prefers-color-scheme:dark)').matches;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  toggle?.addEventListener('click', () => {
    dark = !dark;
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    toggle.innerHTML = dark
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  });
})();
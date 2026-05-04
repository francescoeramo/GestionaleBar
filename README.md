# GestionaleBar

Applicazione gestionale per bar, sviluppata con **FastAPI** (backend) e **JavaScript vanilla** (frontend SPA).

## Funzionalità

| Vista | Descrizione |
|---|---|
| **POS** | Punto vendita: aggiunta prodotti al carrello, prodotti liberi, pagamento (contanti, carta, voucher) |
| **Menu** | Gestione prodotti del menu con categorie, prezzi e descrizioni |
| **Ingredienti** | Anagrafica ingredienti con costo unitario |
| **Magazzino** | Gestione inventario e movimenti di magazzino |
| **Fornitori** | Anagrafica fornitori con dettaglio e storico ordini |
| **Tavoli** | Stato dei tavoli (libero, occupato, riservato) |

## Stack tecnologico

- **Backend:** Python 3, FastAPI, SQLAlchemy, SQLite
- **Frontend:** JavaScript (ES6+), HTML5, CSS3 — SPA con routing hash-based
- **Test:** Playwright (E2E)

## Requisiti

- Python 3.10+
- Node.js 18+ (solo per i test Playwright)

## Installazione e avvio

### 1. Clona la repo

```bash
git clone https://github.com/francescoeramo/GestionaleBar.git
cd GestionaleBar
```

### 2. Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
# oppure: .venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 3. Avvia il server

```bash
python backend/main.py
```

Il backend sarà disponibile su `http://localhost:8000`.  
Il frontend viene servito staticamente dallo stesso processo — apri `http://localhost:8000` nel browser.

## Test E2E (Playwright)

```bash
npm install
npx playwright install chromium

# Esegui tutti i test
npx playwright test

# Esegui un singolo file con browser visibile
npx playwright test tests/pos.spec.js --headed
```

## Struttura del progetto

```
GestionaleBar/
├── backend/
│   ├── main.py          # Entry point FastAPI
│   ├── database.py      # Connessione SQLAlchemy
│   ├── models/          # Modelli ORM
│   ├── routers/         # Router API (products, orders, inventory, ...)
│   └── migrations/      # Script di migrazione DB
├── frontend/
│   ├── index.html       # Shell HTML
│   ├── app.js           # Router SPA e sistema modale
│   ├── style.css        # Stili principali
│   └── views/           # View JS (pos, menu, ingredienti, ...)
├── db/                  # File database SQLite (ignorato da git)
├── tests/               # Test Playwright
└── requirements.txt
```

## API

La documentazione interattiva delle API è disponibile automaticamente su:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

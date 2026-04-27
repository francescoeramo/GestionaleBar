-- ============================================================
--  BAR GESTIONALE — Schema SQLite  |  Fase 1
--  Moduli: Menu, Ricette, Tavoli, Comande, POS base
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. CATEGORIE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    type        TEXT    NOT NULL
                CHECK(type IN ('cocktail','analcolico','food',
                               'birra','vino','altro')),
    sort_order  INTEGER NOT NULL DEFAULT 0,
    active      INTEGER NOT NULL DEFAULT 1,  -- 0 = archiviata
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- 2. INGREDIENTI  (stock minimo — espanso in Fase 3)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredients (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    name                 TEXT    NOT NULL,
    base_unit            TEXT    NOT NULL
                         CHECK(base_unit IN ('ml','cl','g','pz')),
    theoretical_unit_cost REAL   NOT NULL DEFAULT 0,  -- € per unità base
    allergens            TEXT,    -- JSON array es. ["glutine","latte"]
    active               INTEGER NOT NULL DEFAULT 1,
    created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- 3. PRODOTTI (catalogo menu)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    category_id     INTEGER NOT NULL REFERENCES categories(id),
    sale_price      REAL    NOT NULL CHECK(sale_price >= 0),
    active          INTEGER NOT NULL DEFAULT 1,
    allow_mods      INTEGER NOT NULL DEFAULT 1,  -- modificabile in comanda
    has_recipe      INTEGER NOT NULL DEFAULT 0,  -- ha ricetta associata
    description     TEXT,
    allergens       TEXT,    -- JSON array (ereditato/sovrascritta da ricetta)
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- 4. RICETTE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER NOT NULL UNIQUE REFERENCES products(id)
                ON DELETE CASCADE,
    yield_ml    INTEGER,   -- resa finale in ml (opzionale)
    notes       TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- righe della ricetta
CREATE TABLE IF NOT EXISTS recipe_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id     INTEGER NOT NULL REFERENCES recipes(id)
                  ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES ingredients(id),
    quantity      REAL    NOT NULL CHECK(quantity > 0),
    unit          TEXT    NOT NULL
                  CHECK(unit IN ('ml','cl','g','pz','dash','barspoon','splash')),
    sort_order    INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- 5. TAVOLI
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tables (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,           -- es. "Tavolo 1", "Bancone", "Terrazza 3"
    capacity   INTEGER NOT NULL DEFAULT 4,
    status     TEXT    NOT NULL DEFAULT 'free'
               CHECK(status IN ('free','occupied','reserved')),
    pos_x      REAL    NOT NULL DEFAULT 0,  -- coordinate per mappa visiva (Fase 2)
    pos_y      REAL    NOT NULL DEFAULT 0,
    active     INTEGER NOT NULL DEFAULT 1
);

-- ------------------------------------------------------------
-- 6. ORDINI / COMANDE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id        INTEGER REFERENCES tables(id),  -- NULL = asporto/banco
    status          TEXT    NOT NULL DEFAULT 'open'
                    CHECK(status IN ('open','closed','cancelled')),
    opened_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    closed_at       TEXT,
    covers          INTEGER DEFAULT 1,   -- numero coperti
    discount_type   TEXT    CHECK(discount_type IN ('flat','percent')),
    discount_value  REAL    NOT NULL DEFAULT 0,
    total_gross     REAL    NOT NULL DEFAULT 0,  -- snapshot alla chiusura
    total_net       REAL    NOT NULL DEFAULT 0,  -- dopo sconti
    notes           TEXT
);

-- ------------------------------------------------------------
-- 7. RIGHE ORDINE
-- Tipo 'menu'  → prodotto dal catalogo (product_id obbligatorio)
-- Tipo 'free'  → prodotto fuori menù   (product_id NULL, nome libero)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id                INTEGER NOT NULL REFERENCES orders(id)
                            ON DELETE CASCADE,
    item_type               TEXT    NOT NULL
                            CHECK(item_type IN ('menu','free')),
    product_id              INTEGER REFERENCES products(id),
    -- snapshot al momento dell'ordine (immutabile anche se il menu cambia)
    product_name_snapshot   TEXT    NOT NULL,
    unit_price_snapshot     REAL    NOT NULL CHECK(unit_price_snapshot >= 0),
    quantity                INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
    notes                   TEXT,
    status                  TEXT    NOT NULL DEFAULT 'pending'
                            CHECK(status IN ('pending','served','cancelled')),
    created_at              TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ------------------------------------------------------------
-- 8. MODIFICHE A RIGA ORDINE
-- Aggiunte, rimozioni ingrediente, note libere
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_item_modifications (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    order_item_id INTEGER NOT NULL REFERENCES order_items(id)
                  ON DELETE CASCADE,
    mod_type      TEXT    NOT NULL
                  CHECK(mod_type IN ('add','remove','note')),
    ingredient_id INTEGER REFERENCES ingredients(id),  -- NULL per note libere
    description   TEXT    NOT NULL,
    delta_price   REAL    NOT NULL DEFAULT 0  -- variazione prezzo (€, può essere negativa)
);

-- ------------------------------------------------------------
-- 9. PAGAMENTI
-- Un ordine può avere più pagamenti (es. pagamento misto)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id     INTEGER NOT NULL REFERENCES orders(id),
    method       TEXT    NOT NULL
                 CHECK(method IN ('cash','card','voucher')),
    amount       REAL    NOT NULL CHECK(amount > 0),
    cash_given   REAL,         -- solo per method='cash'
    change_given REAL,         -- solo per method='cash'
    voucher_code TEXT,         -- solo per method='voucher'
    paid_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- INDICI  (lettura veloce nelle schermate principali)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_recipe  ON recipe_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_table         ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_payments_order       ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_modifications_item   ON order_item_modifications(order_item_id);

-- ============================================================
-- VISTE UTILI (usate dal backend senza scrivere JOIN ogni volta)
-- ============================================================

-- Costo teorico per ricetta (somma ingredienti)
CREATE VIEW IF NOT EXISTS v_recipe_cost AS
SELECT
    r.id            AS recipe_id,
    r.product_id,
    p.name          AS product_name,
    p.sale_price,
    ROUND(SUM(
        CASE ri.unit
            WHEN 'cl'       THEN ri.quantity * 10 * i.theoretical_unit_cost
            WHEN 'dash'     THEN ri.quantity * 0.9 * i.theoretical_unit_cost
            WHEN 'barspoon' THEN ri.quantity * 5   * i.theoretical_unit_cost
            WHEN 'splash'   THEN ri.quantity * 15  * i.theoretical_unit_cost
            ELSE                 ri.quantity       * i.theoretical_unit_cost
        END
    ), 4)           AS theoretical_cost,
    ROUND(p.sale_price - SUM(
        CASE ri.unit
            WHEN 'cl'       THEN ri.quantity * 10 * i.theoretical_unit_cost
            WHEN 'dash'     THEN ri.quantity * 0.9 * i.theoretical_unit_cost
            WHEN 'barspoon' THEN ri.quantity * 5   * i.theoretical_unit_cost
            WHEN 'splash'   THEN ri.quantity * 15  * i.theoretical_unit_cost
            ELSE                 ri.quantity       * i.theoretical_unit_cost
        END
    ), 4)           AS theoretical_margin,
    ROUND(
        (1 - SUM(
            CASE ri.unit
                WHEN 'cl'       THEN ri.quantity * 10 * i.theoretical_unit_cost
                WHEN 'dash'     THEN ri.quantity * 0.9 * i.theoretical_unit_cost
                WHEN 'barspoon' THEN ri.quantity * 5   * i.theoretical_unit_cost
                WHEN 'splash'   THEN ri.quantity * 15  * i.theoretical_unit_cost
                ELSE                 ri.quantity       * i.theoretical_unit_cost
            END
        ) / NULLIF(p.sale_price, 0)) * 100
    , 1)            AS margin_pct
FROM recipes r
JOIN products p       ON p.id = r.product_id
JOIN recipe_items ri  ON ri.recipe_id = r.id
JOIN ingredients i    ON i.id = ri.ingredient_id
GROUP BY r.id;

-- Riepilogo ordine aperto per tavolo
CREATE VIEW IF NOT EXISTS v_open_order_summary AS
SELECT
    o.id            AS order_id,
    o.table_id,
    t.name          AS table_name,
    o.opened_at,
    o.covers,
    COUNT(oi.id)                                    AS item_count,
    SUM(oi.unit_price_snapshot * oi.quantity)
        FILTER (WHERE oi.status != 'cancelled')     AS subtotal,
    o.discount_type,
    o.discount_value
FROM orders o
JOIN tables t       ON t.id = o.table_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'open'
GROUP BY o.id;

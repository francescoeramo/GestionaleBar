-- 002_inventory_suppliers.sql
-- Eseguire una riga alla volta in SQLite (non supporta multiple ALTER in batch)

ALTER TABLE ingredients ADD COLUMN current_stock REAL NOT NULL DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN min_stock     REAL NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS inventory_movements (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id  INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity       REAL    NOT NULL,
    movement_type  TEXT    NOT NULL CHECK(movement_type IN ('carico','scarico','rettifica')),
    note           TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    contact_name  TEXT,
    phone         TEXT,
    email         TEXT,
    notes         TEXT,
    active        INTEGER NOT NULL DEFAULT 1,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredient_suppliers (
    ingredient_id  INTEGER NOT NULL REFERENCES ingredients(id)  ON DELETE CASCADE,
    supplier_id    INTEGER NOT NULL REFERENCES suppliers(id)     ON DELETE CASCADE,
    unit_price     REAL,
    PRIMARY KEY (ingredient_id, supplier_id)
);

#!/usr/bin/env python3
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta
import random

DB_PATH = Path('bar.db')

CATEGORIES = [
    ('Caffetteria', 1),
    ('Cocktail', 1),
    ('Birre', 1),
    ('Vini', 1),
    ('Analcolici', 1),
    ('Panini', 1),
    ('Dolci', 1),
]

PRODUCTS = [
    ('Espresso', 'Caffè classico', 1.30, 'Caffetteria'),
    ('Cappuccino', 'Caffè con latte montato', 1.80, 'Caffetteria'),
    ('Spritz', 'Aperitivo classico', 6.00, 'Cocktail'),
    ('Gin Tonic', 'Gin premium e tonica', 8.00, 'Cocktail'),
    ('Negroni', 'Bitter, vermouth e gin', 8.50, 'Cocktail'),
    ('IPA Artigianale', 'Birra ambrata luppolata', 5.50, 'Birre'),
    ('Pils', 'Birra chiara 0.4L', 4.50, 'Birre'),
    ('Vermentino', 'Calice bianco ligure', 5.00, 'Vini'),
    ('Chianti', 'Calice rosso toscano', 5.50, 'Vini'),
    ('Acqua Naturale', 'Bottiglia 0.5L', 1.00, 'Analcolici'),
    ('Cola', 'Bibita in lattina', 2.50, 'Analcolici'),
    ('Panino Crudo', 'Prosciutto crudo e mozzarella', 6.50, 'Panini'),
    ('Toast', 'Prosciutto e formaggio', 4.50, 'Panini'),
    ('Cheesecake', 'Dolce della casa', 4.50, 'Dolci'),
]

INGREDIENTS = [
    ('Caffè in grani', 'kg', 18.0, 4.0, 8.0),
    ('Latte fresco', 'L', 1.6, 6.0, 12.0),
    ('Ghiaccio', 'kg', 0.2, 5.0, 20.0),
    ('Prosecco', 'L', 6.0, 3.0, 10.0),
    ('Aperol', 'L', 10.0, 2.0, 8.0),
    ('Gin', 'L', 18.0, 2.0, 6.0),
    ('Acqua tonica', 'pz', 0.8, 12.0, 36.0),
    ('Bitter', 'L', 12.0, 1.0, 4.0),
    ('Vermouth rosso', 'L', 9.0, 1.0, 4.0),
    ('Pane', 'pz', 0.4, 20.0, 50.0),
    ('Prosciutto crudo', 'kg', 22.0, 1.0, 3.0),
    ('Mozzarella', 'kg', 8.0, 1.0, 4.0),
    ('Formaggio fette', 'kg', 10.0, 0.8, 3.0),
    ('Cola lattina', 'pz', 0.7, 10.0, 24.0),
    ('Acqua bottiglia 0.5', 'pz', 0.25, 24.0, 72.0),
    ('Base cheesecake', 'pz', 1.5, 4.0, 10.0),
]

SUPPLIERS = [
    ('Torrefazione Genovese', 'Marco Rossi', '0101234567', 'ordini@torrefazionegenovese.it', 'Fornitore principale caffetteria'),
    ('Liguria Beverage', 'Sara Bianchi', '0102345678', 'sales@liguriabeverage.it', 'Bibite e aperitivi'),
    ('Distribuzione Horeca Nord', 'Luca Verdi', '0103456789', 'commerciale@horecanord.it', 'Alcolici e toniche'),
    ('Panificio del Porto', 'Giulia Neri', '0104567890', 'info@panificiodelporto.it', 'Pane e prodotti da forno'),
    ('Caseificio Riviera', 'Paolo Gallo', '0105678901', 'vendite@caseificioriviera.it', 'Latticini e formaggi'),
]

TABLES = [f'T{i}' for i in range(1, 11)]


def table_exists(cur, name):
    row = cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()
    return row is not None


def cols(cur, table):
    return [r[1] for r in cur.execute(f'PRAGMA table_info({table})').fetchall()]


def ensure_table(cur, create_sql):
    cur.execute(create_sql)


def bootstrap_schema(cur):
    if not table_exists(cur, 'categories'):
        ensure_table(cur, '''
        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          active INTEGER NOT NULL DEFAULT 1
        )''')
    if not table_exists(cur, 'products'):
        ensure_table(cur, '''
        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          active INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY(category_id) REFERENCES categories(id)
        )''')
    if not table_exists(cur, 'ingredients'):
        ensure_table(cur, '''
        CREATE TABLE ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          base_unit TEXT NOT NULL,
          theoretical_unit_cost REAL NOT NULL DEFAULT 0,
          min_stock REAL NOT NULL DEFAULT 0,
          current_stock REAL NOT NULL DEFAULT 0,
          active INTEGER NOT NULL DEFAULT 1
        )''')
    if not table_exists(cur, 'suppliers'):
        ensure_table(cur, '''
        CREATE TABLE suppliers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          contact_name TEXT,
          phone TEXT,
          email TEXT,
          notes TEXT,
          active INTEGER NOT NULL DEFAULT 1
        )''')
    if not table_exists(cur, 'supplier_ingredients'):
        ensure_table(cur, '''
        CREATE TABLE supplier_ingredients (
          supplier_id INTEGER NOT NULL,
          ingredient_id INTEGER NOT NULL,
          unit_price REAL,
          PRIMARY KEY (supplier_id, ingredient_id),
          FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
          FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
        )''')
    if not table_exists(cur, 'restaurant_tables'):
        ensure_table(cur, '''
        CREATE TABLE restaurant_tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          active INTEGER NOT NULL DEFAULT 1
        )''')
    if not table_exists(cur, 'orders'):
        ensure_table(cur, '''
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'open',
          discount_type TEXT,
          discount_value REAL,
          opened_at TEXT DEFAULT CURRENT_TIMESTAMP,
          closed_at TEXT,
          FOREIGN KEY(table_id) REFERENCES restaurant_tables(id)
        )''')
    if not table_exists(cur, 'order_items'):
        ensure_table(cur, '''
        CREATE TABLE order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          unit_price_snapshot REAL NOT NULL,
          status TEXT NOT NULL DEFAULT 'ordered',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(order_id) REFERENCES orders(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        )''')
    if not table_exists(cur, 'payments'):
        ensure_table(cur, '''
        CREATE TABLE payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          method TEXT NOT NULL DEFAULT 'cash',
          paid_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(order_id) REFERENCES orders(id)
        )''')
    if not table_exists(cur, 'inventory_movements'):
        ensure_table(cur, '''
        CREATE TABLE inventory_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ingredient_id INTEGER NOT NULL,
          quantity REAL NOT NULL,
          movement_type TEXT NOT NULL,
          note TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
        )''')


def clear_data(cur):
    for table in [
        'inventory_movements', 'payments', 'order_items', 'orders',
        'supplier_ingredients', 'suppliers', 'products', 'categories',
        'ingredients', 'restaurant_tables'
    ]:
        if table_exists(cur, table):
            cur.execute(f'DELETE FROM {table}')


def seed(cur):
    category_ids = {}
    for name, active in CATEGORIES:
        cur.execute('INSERT INTO categories (name, active) VALUES (?, ?)', (name, active))
        category_ids[name] = cur.lastrowid

    product_ids = {}
    for name, desc, price, cat_name in PRODUCTS:
        cur.execute(
            'INSERT INTO products (category_id, name, description, price, active) VALUES (?, ?, ?, ?, 1)',
            (category_ids[cat_name], name, desc, price)
        )
        product_ids[name] = cur.lastrowid

    ingredient_ids = {}
    for name, unit, cost, min_stock, stock in INGREDIENTS:
        cur.execute(
            'INSERT INTO ingredients (name, base_unit, theoretical_unit_cost, min_stock, current_stock, active) VALUES (?, ?, ?, ?, ?, 1)',
            (name, unit, cost, min_stock, stock)
        )
        ingredient_ids[name] = cur.lastrowid

    supplier_ids = {}
    for name, contact, phone, email, notes in SUPPLIERS:
        cur.execute(
            'INSERT INTO suppliers (name, contact_name, phone, email, notes, active) VALUES (?, ?, ?, ?, ?, 1)',
            (name, contact, phone, email, notes)
        )
        supplier_ids[name] = cur.lastrowid

    links = [
        ('Torrefazione Genovese', 'Caffè in grani', 17.5),
        ('Caseificio Riviera', 'Latte fresco', 1.4),
        ('Liguria Beverage', 'Prosecco', 5.8),
        ('Liguria Beverage', 'Aperol', 9.6),
        ('Distribuzione Horeca Nord', 'Gin', 17.0),
        ('Distribuzione Horeca Nord', 'Acqua tonica', 0.7),
        ('Panificio del Porto', 'Pane', 0.35),
        ('Caseificio Riviera', 'Mozzarella', 7.5),
        ('Caseificio Riviera', 'Formaggio fette', 9.5),
        ('Liguria Beverage', 'Cola lattina', 0.65),
        ('Liguria Beverage', 'Acqua bottiglia 0.5', 0.22),
    ]
    for sname, iname, unit_price in links:
        cur.execute(
            'INSERT INTO supplier_ingredients (supplier_id, ingredient_id, unit_price) VALUES (?, ?, ?)',
            (supplier_ids[sname], ingredient_ids[iname], unit_price)
        )

    table_ids = {}
    for t in TABLES:
        cur.execute('INSERT INTO restaurant_tables (name, active) VALUES (?, 1)', (t,))
        table_ids[t] = cur.lastrowid

    open_tables = random.sample(TABLES, 3)
    for t in TABLES:
        status = 'open' if t in open_tables else random.choice(['closed', 'cancelled', 'closed', 'closed'])
        opened = datetime.now() - timedelta(hours=random.randint(1, 72))
        closed = None if status == 'open' else (opened + timedelta(hours=random.randint(1, 5))).isoformat(timespec='seconds')
        cur.execute(
            'INSERT INTO orders (table_id, status, discount_type, discount_value, opened_at, closed_at) VALUES (?, ?, ?, ?, ?, ?)',
            (
                table_ids[t],
                status,
                random.choice([None, 'flat', 'percent', None]),
                random.choice([None, 1.0, 2.0, 10.0]),
                opened.isoformat(timespec='seconds'),
                closed,
            )
        )
        order_id = cur.lastrowid

        chosen_products = random.sample(PRODUCTS, random.randint(2, 5))
        total = 0.0
        for p in chosen_products:
            qty = random.randint(1, 3)
            price = p[2]
            total += qty * price
            cur.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price_snapshot, status) VALUES (?, ?, ?, ?, ?)',
                (order_id, product_ids[p[0]], qty, price, 'ordered' if status == 'open' else 'served')
            )
        if status == 'closed':
            cur.execute(
                'INSERT INTO payments (order_id, amount, method, paid_at) VALUES (?, ?, ?, ?)',
                (order_id, round(total, 2), random.choice(['cash', 'card']), datetime.now().isoformat(timespec='seconds'))
            )

    movement_types = ['carico', 'scarico', 'rettifica']
    for iname, iid in ingredient_ids.items():
        for _ in range(random.randint(2, 5)):
            mt = random.choice(movement_types)
            qty = round(random.uniform(0.5, 8.0), 2)
            signed_qty = qty if mt == 'carico' else (-qty if mt == 'scarico' else qty)
            note = random.choice([
                'Consegna settimanale', 'Utilizzo cucina', 'Aperitivo serale', 'Correzione inventario', 'Consumo bar'
            ])
            cur.execute(
                'INSERT INTO inventory_movements (ingredient_id, quantity, movement_type, note, created_at) VALUES (?, ?, ?, ?, ?)',
                (iid, signed_qty, mt, note, (datetime.now() - timedelta(days=random.randint(0, 15))).isoformat(timespec='seconds'))
            )


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('PRAGMA foreign_keys=OFF')
    bootstrap_schema(cur)
    clear_data(cur)
    seed(cur)
    conn.commit()
    conn.close()
    print(f'Seed completato su {DB_PATH.resolve()}')


if __name__ == '__main__':
    main()

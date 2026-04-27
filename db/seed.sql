-- ============================================================
--  BAR GESTIONALE — Dati di esempio  |  Fase 1
-- ============================================================

-- Categorie
INSERT INTO categories (name, type, sort_order) VALUES
    ('Cocktail Classici',  'cocktail',   1),
    ('Signature Cocktail', 'cocktail',   2),
    ('Analcolici',         'analcolico', 3),
    ('Birre',              'birra',      4),
    ('Stuzzichini',        'food',       5);

-- Ingredienti (costo per unità base = ml oppure pz)
INSERT INTO ingredients (name, base_unit, theoretical_unit_cost, allergens) VALUES
    ('Gin',            'ml', 0.018,  NULL),
    ('Vermouth Rosso', 'ml', 0.008,  NULL),
    ('Campari',        'ml', 0.012,  NULL),
    ('Vodka',          'ml', 0.014,  NULL),
    ('Rum Bianco',     'ml', 0.013,  NULL),
    ('Lime',           'pz', 0.25,   NULL),
    ('Sciroppo Zucchero', 'ml', 0.003, NULL),
    ('Menta Fresca',   'pz', 0.10,   NULL),
    ('Acqua Frizzante','ml', 0.001,  NULL),
    ('Succo Limone',   'ml', 0.004,  NULL),
    ('Coca-Cola',      'ml', 0.003,  NULL),
    ('Angostura Bitters','ml',0.05,  NULL),
    ('Ghiaccio',       'pz', 0.02,   NULL),
    ('Prosecco',       'ml', 0.006,  NULL),
    ('Aperol',         'ml', 0.010,  NULL);

-- Prodotti
INSERT INTO products (name, category_id, sale_price, allow_mods, has_recipe, description) VALUES
    ('Negroni',          1, 9.00,  1, 1, 'Gin, Campari, Vermouth Rosso'),
    ('Mojito',           1, 9.50,  1, 1, 'Rum, Lime, Menta, Zucchero, Soda'),
    ('Aperol Spritz',    1, 8.00,  1, 1, 'Aperol, Prosecco, Soda'),
    ('Moscow Mule',      1, 9.00,  1, 1, 'Vodka, Lime, Ginger Beer'),
    ('Acqua Tonica',     3, 3.50,  0, 0, NULL),
    ('Birra Alla Spina', 4, 5.00,  0, 0, '0.4L birra artigianale'),
    ('Patatine',         5, 3.00,  0, 0, '80g patatine fritte');

-- Ricette
INSERT INTO recipes (product_id, yield_ml, notes) VALUES
    (1, 90,  'Build in old fashioned, ghiaccio grande'),  -- Negroni
    (2, 300, 'Muddling lime e menta, top soda'),           -- Mojito
    (3, 200, 'Build in bicchiere da vino, ghiaccio cubo'); -- Aperol Spritz

-- Ricetta Negroni (product_id=1, recipe_id=1)
INSERT INTO recipe_items (recipe_id, ingredient_id, quantity, unit, sort_order) VALUES
    (1, 1,  3, 'cl', 1),   -- Gin 3cl
    (1, 2,  3, 'cl', 2),   -- Vermouth Rosso 3cl
    (1, 3,  3, 'cl', 3),   -- Campari 3cl
    (1, 13, 1, 'pz', 4);   -- Ghiaccio

-- Ricetta Mojito (product_id=2, recipe_id=2)
INSERT INTO recipe_items (recipe_id, ingredient_id, quantity, unit, sort_order) VALUES
    (2, 5,  5,  'cl',      1),   -- Rum Bianco 5cl
    (2, 6,  1,  'pz',      2),   -- Lime
    (2, 8,  6,  'pz',      3),   -- Foglie menta
    (2, 7,  2,  'cl',      4),   -- Sciroppo Zucchero
    (2, 9,  10, 'cl',      5),   -- Soda
    (2, 13, 1,  'pz',      6);   -- Ghiaccio

-- Ricetta Aperol Spritz (product_id=3, recipe_id=3)
INSERT INTO recipe_items (recipe_id, ingredient_id, quantity, unit, sort_order) VALUES
    (3, 15, 9,  'cl',  1),   -- Aperol 9cl
    (3, 14, 9,  'cl',  2),   -- Prosecco 9cl
    (3, 9,  3,  'cl',  3),   -- Soda 3cl
    (3, 13, 1,  'pz',  4);   -- Ghiaccio

-- Tavoli
INSERT INTO tables (name, capacity, pos_x, pos_y) VALUES
    ('Bancone',    6,   50,  50),
    ('Tavolo 1',   4,  200, 100),
    ('Tavolo 2',   4,  350, 100),
    ('Tavolo 3',   4,  200, 250),
    ('Tavolo 4',   6,  350, 250),
    ('Terrazza 1', 4,  200, 420),
    ('Terrazza 2', 4,  350, 420);

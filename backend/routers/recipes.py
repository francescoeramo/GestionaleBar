from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.recipe import RecipeCreate

router = APIRouter(prefix="/products", tags=["Ricette"])


def _get_recipe_full(product_id: int, db: sqlite3.Connection):
    recipe = db.execute("SELECT * FROM recipes WHERE product_id=?", (product_id,)).fetchone()
    if not recipe:
        return None
    recipe = dict_row(recipe)
    items = dict_rows(db.execute(
        "SELECT ri.*, i.name AS ingredient_name "
        "FROM recipe_items ri "
        "JOIN ingredients i ON i.id = ri.ingredient_id "
        "WHERE ri.recipe_id=? ORDER BY ri.sort_order",
        (recipe["id"],),
    ).fetchall())
    recipe["items"] = items
    cost_row = db.execute(
        "SELECT theoretical_cost, theoretical_margin, margin_pct "
        "FROM v_recipe_cost WHERE product_id=?",
        (product_id,),
    ).fetchone()
    if cost_row:
        recipe.update(dict_row(cost_row))
    return recipe


@router.get("/recipes/costs")
def all_recipe_costs(db: sqlite3.Connection = Depends(get_db)):
    return dict_rows(db.execute("SELECT * FROM v_recipe_cost").fetchall())


@router.get("/{product_id}/recipe")
def get_recipe(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    r = _get_recipe_full(product_id, db)
    if not r:
        raise HTTPException(404, "Ricetta non trovata")
    return r


@router.post("/{product_id}/recipe", status_code=201)
def upsert_recipe(product_id: int, data: RecipeCreate, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM products WHERE id=?", (product_id,)).fetchone():
        raise HTTPException(404, "Prodotto non trovato")
    db.execute("DELETE FROM recipes WHERE product_id=?", (product_id,))
    cur = db.execute(
        "INSERT INTO recipes (product_id, yield_ml, notes) VALUES (?,?,?)",
        (product_id, data.yield_ml, data.notes),
    )
    recipe_id = cur.lastrowid
    for item in data.items:
        db.execute(
            "INSERT INTO recipe_items (recipe_id, ingredient_id, quantity, unit, sort_order) "
            "VALUES (?,?,?,?,?)",
            (recipe_id, item.ingredient_id, item.quantity, item.unit, item.sort_order),
        )
    db.execute(
        "UPDATE products SET has_recipe=1, updated_at=datetime('now') WHERE id=?", (product_id,)
    )
    db.commit()
    return _get_recipe_full(product_id, db)


@router.delete("/{product_id}/recipe", status_code=204)
def delete_recipe(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute("DELETE FROM recipes WHERE product_id=?", (product_id,))
    db.execute("UPDATE products SET has_recipe=0, updated_at=datetime('now') WHERE id=?", (product_id,))
    db.commit()

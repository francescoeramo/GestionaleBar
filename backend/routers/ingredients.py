from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.ingredient import IngredientCreate, IngredientUpdate

router = APIRouter(prefix="/ingredients", tags=["Ingredienti"])


@router.get("/")
def list_ingredients(active_only: bool = True, db: sqlite3.Connection = Depends(get_db)):
    q = "SELECT * FROM ingredients"
    q += " WHERE active=1" if active_only else ""
    q += " ORDER BY name"
    return dict_rows(db.execute(q).fetchall())


@router.get("/{id}")
def get_ingredient(id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM ingredients WHERE id=?", (id,)).fetchone()
    if not row:
        raise HTTPException(404, "Ingrediente non trovato")
    return dict_row(row)


@router.post("/", status_code=201)
def create_ingredient(data: IngredientCreate, db: sqlite3.Connection = Depends(get_db)):
    cur = db.execute(
        "INSERT INTO ingredients (name, base_unit, theoretical_unit_cost, allergens) VALUES (?,?,?,?)",
        (data.name, data.base_unit, data.theoretical_unit_cost, data.allergens),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM ingredients WHERE id=?", (cur.lastrowid,)).fetchone())


@router.put("/{id}")
def update_ingredient(id: int, data: IngredientUpdate, db: sqlite3.Connection = Depends(get_db)):
    fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "Nessun campo da aggiornare")
    set_clause = ", ".join(f"{k}=?" for k in fields)
    db.execute(
        f"UPDATE ingredients SET {set_clause}, updated_at=datetime('now') WHERE id=?",
        (*fields.values(), id),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM ingredients WHERE id=?", (id,)).fetchone())

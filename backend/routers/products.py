from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.product import ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["Prodotti"])


@router.get("/")
def list_products(
    category_id: Optional[int] = Query(None),
    active_only: bool = True,
    db: sqlite3.Connection = Depends(get_db),
):
    q = "SELECT * FROM products WHERE 1=1"
    params = []
    if active_only:
        q += " AND active=1"
    if category_id is not None:
        q += " AND category_id=?"
        params.append(category_id)
    q += " ORDER BY name"
    return dict_rows(db.execute(q, params).fetchall())


@router.get("/{id}")
def get_product(id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM products WHERE id=?", (id,)).fetchone()
    if not row:
        raise HTTPException(404, "Prodotto non trovato")
    return dict_row(row)


@router.post("/", status_code=201)
def create_product(data: ProductCreate, db: sqlite3.Connection = Depends(get_db)):
    cur = db.execute(
        "INSERT INTO products "
        "(name, category_id, sale_price, allow_mods, has_recipe, description, allergens) "
        "VALUES (?,?,?,?,?,?,?)",
        (data.name, data.category_id, data.sale_price,
         data.allow_mods, data.has_recipe, data.description, data.allergens),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM products WHERE id=?", (cur.lastrowid,)).fetchone())


@router.put("/{id}")
def update_product(id: int, data: ProductUpdate, db: sqlite3.Connection = Depends(get_db)):
    fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "Nessun campo da aggiornare")
    set_clause = ", ".join(f"{k}=?" for k in fields)
    db.execute(
        f"UPDATE products SET {set_clause}, updated_at=datetime('now') WHERE id=?",
        (*fields.values(), id),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM products WHERE id=?", (id,)).fetchone())


@router.delete("/{id}", status_code=204)
def archive_product(id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute("UPDATE products SET active=0, updated_at=datetime('now') WHERE id=?", (id,))
    db.commit()

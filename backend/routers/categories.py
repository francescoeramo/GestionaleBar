from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.category import CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categorie"])


@router.get("/")
def list_categories(active_only: bool = True, db: sqlite3.Connection = Depends(get_db)):
    q = "SELECT * FROM categories"
    q += " WHERE active=1" if active_only else ""
    q += " ORDER BY sort_order, name"
    return dict_rows(db.execute(q).fetchall())


@router.get("/{id}")
def get_category(id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM categories WHERE id=?", (id,)).fetchone()
    if not row:
        raise HTTPException(404, "Categoria non trovata")
    return dict_row(row)


@router.post("/", status_code=201)
def create_category(data: CategoryCreate, db: sqlite3.Connection = Depends(get_db)):
    cur = db.execute(
        "INSERT INTO categories (name, type, sort_order) VALUES (?,?,?)",
        (data.name, data.type, data.sort_order),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM categories WHERE id=?", (cur.lastrowid,)).fetchone())


@router.put("/{id}")
def update_category(id: int, data: CategoryUpdate, db: sqlite3.Connection = Depends(get_db)):
    fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "Nessun campo da aggiornare")
    set_clause = ", ".join(f"{k}=?" for k in fields)
    db.execute(f"UPDATE categories SET {set_clause} WHERE id=?", (*fields.values(), id))
    db.commit()
    return dict_row(db.execute("SELECT * FROM categories WHERE id=?", (id,)).fetchone())


@router.delete("/{id}", status_code=204)
def archive_category(id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute("UPDATE categories SET active=0 WHERE id=?", (id,))
    db.commit()

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from pydantic import BaseModel

router = APIRouter(prefix="/api/suppliers", tags=["Fornitori"])


# ── Modelli ─────────────────────────────────────────────────

class SupplierCreate(BaseModel):
    name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class IngredientLink(BaseModel):
    ingredient_id: int
    unit_price: Optional[float] = None


# ── Endpoints ────────────────────────────────────────────────

@router.get("/")
def list_suppliers(db: sqlite3.Connection = Depends(get_db)):
    return dict_rows(db.execute("""
        SELECT s.*,
               COUNT(ics.ingredient_id) AS ingredient_count
        FROM suppliers s
        LEFT JOIN ingredient_suppliers ics ON ics.supplier_id = s.id
        GROUP BY s.id
        ORDER BY s.name
    """).fetchall())


@router.get("/{id}")
def get_supplier(id: int, db: sqlite3.Connection = Depends(get_db)):
    sup = dict_row(db.execute("SELECT * FROM suppliers WHERE id=?", (id,)).fetchone())
    if not sup:
        raise HTTPException(404, "Fornitore non trovato")

    ings = dict_rows(db.execute("""
        SELECT i.id,
               i.name,
               i.base_unit               AS unit,
               i.theoretical_unit_cost   AS cost_per_unit,
               ics.unit_price
        FROM ingredients i
        JOIN ingredient_suppliers ics ON ics.ingredient_id = i.id
        WHERE ics.supplier_id = ?
        ORDER BY i.name
    """, (id,)).fetchall())

    sup["ingredients"] = ings
    return sup


@router.post("/", status_code=201)
def create_supplier(data: SupplierCreate, db: sqlite3.Connection = Depends(get_db)):
    existing = db.execute(
        "SELECT id FROM suppliers WHERE name = ?", (data.name,)
    ).fetchone()
    if existing:
        raise HTTPException(409, f"Esiste già un fornitore con nome '{data.name}'")

    cur = db.execute(
        "INSERT INTO suppliers (name, contact_name, phone, email, notes) VALUES (?,?,?,?,?)",
        (data.name, data.contact_name, data.phone, data.email, data.notes),
    )
    return dict_row(db.execute("SELECT * FROM suppliers WHERE id=?", (cur.lastrowid,)).fetchone())


@router.put("/{id}")
def update_supplier(id: int, data: SupplierUpdate, db: sqlite3.Connection = Depends(get_db)):
    sup = db.execute("SELECT id FROM suppliers WHERE id=?", (id,)).fetchone()
    if not sup:
        raise HTTPException(404, "Fornitore non trovato")

    ALLOWED = {"name", "contact_name", "phone", "email", "notes"}
    updates = {k: v for k, v in data.model_dump(exclude_none=True).items() if k in ALLOWED}

    if not updates:
        raise HTTPException(422, "Nessun campo da aggiornare")

    cols = ", ".join(f"{k} = ?" for k in updates)
    db.execute(f"UPDATE suppliers SET {cols} WHERE id=?", (*updates.values(), id))

    return dict_row(db.execute("SELECT * FROM suppliers WHERE id=?", (id,)).fetchone())


@router.delete("/{id}", status_code=204)
def delete_supplier(id: int, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM suppliers WHERE id=?", (id,)).fetchone():
        raise HTTPException(404, "Fornitore non trovato")
    db.execute("DELETE FROM suppliers WHERE id=?", (id,))
    return None


@router.post("/{id}/ingredients", status_code=201)
def link_ingredient(id: int, data: IngredientLink, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM suppliers WHERE id=?", (id,)).fetchone():
        raise HTTPException(404, "Fornitore non trovato")
    if not db.execute("SELECT id FROM ingredients WHERE id=?", (data.ingredient_id,)).fetchone():
        raise HTTPException(404, "Ingrediente non trovato")

    if db.execute(
        "SELECT id FROM ingredient_suppliers WHERE supplier_id=? AND ingredient_id=?",
        (id, data.ingredient_id),
    ).fetchone():
        raise HTTPException(409, "Ingrediente già associato a questo fornitore")

    db.execute(
        "INSERT INTO ingredient_suppliers (supplier_id, ingredient_id, unit_price) VALUES (?,?,?)",
        (id, data.ingredient_id, data.unit_price),
    )
    return {"ok": True}


@router.delete("/{id}/ingredients/{ing_id}", status_code=204)
def unlink_ingredient(id: int, ing_id: int, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute(
        "SELECT id FROM ingredient_suppliers WHERE supplier_id=? AND ingredient_id=?",
        (id, ing_id),
    ).fetchone():
        raise HTTPException(404, "Associazione non trovata")

    db.execute(
        "DELETE FROM ingredient_suppliers WHERE supplier_id=? AND ingredient_id=?",
        (id, ing_id),
    )
    return None
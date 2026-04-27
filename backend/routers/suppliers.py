from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.database import dict_rows, dict_row
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/suppliers", tags=["Fornitori"])


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


@router.get("/")
def list_suppliers(db=Depends(get_db)):
    rows = db.execute("""
        SELECT s.*,
               COUNT(ис.ingredient_id) AS ingredient_count
        FROM suppliers s
        LEFT JOIN ingredient_suppliers ис ON ис.supplier_id = s.id
        WHERE s.active = 1
        GROUP BY s.id
        ORDER BY s.name
    """).fetchall()
    return dict_rows(rows)


@router.post("/", status_code=201)
def create_supplier(body: SupplierCreate, db=Depends(get_db)):
    cur = db.execute(
        "INSERT INTO suppliers (name,contact_name,phone,email,notes) VALUES (?,?,?,?,?)",
        (body.name, body.contact_name, body.phone, body.email, body.notes),
    )
    return dict_row(
        db.execute("SELECT * FROM suppliers WHERE id=?", (cur.lastrowid,)).fetchone()
    )


@router.get("/{id}")
def get_supplier(id: int, db=Depends(get_db)):
    row = db.execute("SELECT * FROM suppliers WHERE id=?", (id,)).fetchone()
    if not row:
        raise HTTPException(404, "Fornitore non trovato")
    ings = db.execute("""
        SELECT i.id, i.name, i.unit, i.cost_per_unit, ис.unit_price
        FROM ingredient_suppliers ис
        JOIN ingredients i ON i.id = ис.ingredient_id
        WHERE ис.supplier_id = ?
        ORDER BY i.name
    """, (id,)).fetchall()
    result = dict(row)
    result["ingredients"] = dict_rows(ings)
    return result


@router.put("/{id}")
def update_supplier(id: int, body: SupplierUpdate, db=Depends(get_db)):
    if not db.execute("SELECT id FROM suppliers WHERE id=?", (id,)).fetchone():
        raise HTTPException(404, "Fornitore non trovato")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if updates:
        cols = ", ".join(f"{k} = ?" for k in updates)
        db.execute(f"UPDATE suppliers SET {cols} WHERE id=?", (*updates.values(), id))
    return dict_row(db.execute("SELECT * FROM suppliers WHERE id=?", (id,)).fetchone())


@router.delete("/{id}", status_code=204)
def archive_supplier(id: int, db=Depends(get_db)):
    db.execute("UPDATE suppliers SET active=0 WHERE id=?", (id,))


@router.post("/{supplier_id}/ingredients", status_code=201)
def link_ingredient(supplier_id: int, body: IngredientLink, db=Depends(get_db)):
    if not db.execute("SELECT id FROM suppliers WHERE id=?", (supplier_id,)).fetchone():
        raise HTTPException(404, "Fornitore non trovato")
    if not db.execute("SELECT id FROM ingredients WHERE id=?", (body.ingredient_id,)).fetchone():
        raise HTTPException(404, "Ingrediente non trovato")
    db.execute(
        "INSERT OR REPLACE INTO ingredient_suppliers (supplier_id,ingredient_id,unit_price) VALUES (?,?,?)",
        (supplier_id, body.ingredient_id, body.unit_price),
    )
    return {"ok": True}


@router.delete("/{supplier_id}/ingredients/{ingredient_id}", status_code=204)
def unlink_ingredient(supplier_id: int, ingredient_id: int, db=Depends(get_db)):
    db.execute(
        "DELETE FROM ingredient_suppliers WHERE supplier_id=? AND ingredient_id=?",
        (supplier_id, ingredient_id),
    )

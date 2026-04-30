from fastapi import APIRouter, Depends, HTTPException
from backend.database import get_db
from backend.database import dict_rows, dict_row
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/inventory", tags=["Magazzino"])


class MovementCreate(BaseModel):
    ingredient_id: int
    quantity: float
    movement_type: str          # carico | scarico | rettifica
    note: Optional[str] = None


class ThresholdUpdate(BaseModel):
    min_stock: Optional[float] = None
    current_stock: Optional[float] = None


@router.get("/")
def list_inventory(db=Depends(get_db)):
    rows = db.execute("""
        SELECT
        i.id,
        i.name,
        i.base_unit,
        i.theoretical_unit_cost,
        COALESCE(i.current_stock, 0) AS current_stock,
        COALESCE(i.min_stock, 0) AS min_stock,
        CASE
            WHEN COALESCE(i.current_stock,0) = 0
                 AND COALESCE(i.min_stock,0) > 0 THEN 'critical'
            WHEN COALESCE(i.min_stock,0) > 0
                 AND COALESCE(i.current_stock,0) <= COALESCE(i.min_stock,0) THEN 'critical'
            WHEN COALESCE(i.min_stock,0) > 0
                 AND COALESCE(i.current_stock,0) <= COALESCE(i.min_stock,0) * 1.5 THEN 'low'
            ELSE 'ok'
        END AS status
    FROM ingredients i
    WHERE i.active = 1
    ORDER BY
        CASE status WHEN 'critical' THEN 0 WHEN 'low' THEN 1 ELSE 2 END,
        i.name;
    """).fetchall()
    return dict_rows(rows)


@router.get("/low-stock")
def low_stock(db=Depends(get_db)):
    rows = db.execute("""
        SELECT i.id, i.name, i.base_unit,
               COALESCE(i.current_stock,0) AS current_stock,
               COALESCE(i.min_stock,    0) AS min_stock
        FROM ingredients i
        WHERE i.active = 1
          AND i.min_stock > 0
          AND COALESCE(i.current_stock,0) <= COALESCE(i.min_stock,0)
        ORDER BY i.name
    """).fetchall()
    return dict_rows(rows)


@router.get("/movements/{ingredient_id}")
def get_movements(ingredient_id: int, db=Depends(get_db)):
    rows = db.execute("""
        SELECT m.id, m.quantity, m.movement_type, m.note, m.created_at,
               i.name AS ingredient_name, i.base_unit
        FROM inventory_movements m
        JOIN ingredients i ON i.id = m.ingredient_id
        WHERE m.ingredient_id = ?
        ORDER BY m.created_at DESC
        LIMIT 60
    """, (ingredient_id,)).fetchall()
    return dict_rows(rows)


@router.post("/movements", status_code=201)
def add_movement(body: MovementCreate, db=Depends(get_db)):
    ing = db.execute(
        "SELECT id, current_stock FROM ingredients WHERE id = ?",
        (body.ingredient_id,),
    ).fetchone()
    if not ing:
        raise HTTPException(404, "Ingrediente non trovato")

    if body.movement_type not in ("carico", "scarico", "rettifica"):
        raise HTTPException(422, "movement_type non valido")

    current_stock = float(ing["current_stock"] or 0)

    if body.movement_type == "rettifica":
        new_stock = body.quantity
        qty_delta = round(new_stock - current_stock, 2)
        db.execute(
            "UPDATE ingredients SET current_stock = ? WHERE id = ?",
            (new_stock, body.ingredient_id),
        )
    elif body.movement_type == "scarico":
        qty_delta = -abs(body.quantity)
        db.execute(
            "UPDATE ingredients SET current_stock = COALESCE(current_stock,0) + ? WHERE id = ?",
            (qty_delta, body.ingredient_id),
        )
    else:
        qty_delta = abs(body.quantity)
        db.execute(
            "UPDATE ingredients SET current_stock = COALESCE(current_stock,0) + ? WHERE id = ?",
            (qty_delta, body.ingredient_id),
        )

    db.execute(
        "INSERT INTO inventory_movements (ingredient_id, quantity, movement_type, note) VALUES (?,?,?,?)",
        (body.ingredient_id, qty_delta, body.movement_type, body.note),
    )

    return {"ok": True, "quantity_delta": qty_delta}


@router.patch("/{ingredient_id}/thresholds")
def update_thresholds(ingredient_id: int, body: ThresholdUpdate, db=Depends(get_db)):
    ing = db.execute(
        "SELECT id FROM ingredients WHERE id = ?", (ingredient_id,)
    ).fetchone()
    if not ing:
        raise HTTPException(404, "Ingrediente non trovato")
    if body.min_stock is not None:
        db.execute(
            "UPDATE ingredients SET min_stock = ? WHERE id = ?",
            (body.min_stock, ingredient_id),
        )
    if body.current_stock is not None:
        db.execute(
            "UPDATE ingredients SET current_stock = ? WHERE id = ?",
            (body.current_stock, ingredient_id),
        )
    return {"ok": True}

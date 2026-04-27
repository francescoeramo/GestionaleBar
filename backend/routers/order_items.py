from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from backend.database import get_db, dict_row
from backend.models.order import OrderItemCreate, OrderItemModCreate

router = APIRouter(prefix="/orders", tags=["Righe Ordine"])


@router.post("/{order_id}/items", status_code=201)
def add_item(order_id: int, data: OrderItemCreate, db: sqlite3.Connection = Depends(get_db)):
    order = db.execute("SELECT status FROM orders WHERE id=?", (order_id,)).fetchone()
    if not order:
        raise HTTPException(404, "Ordine non trovato")
    if order["status"] != "open":
        raise HTTPException(400, "Impossibile aggiungere righe a un ordine non aperto")

    if data.item_type == "menu" and data.product_id:
        product = db.execute(
            "SELECT name, sale_price FROM products WHERE id=? AND active=1", (data.product_id,)
        ).fetchone()
        if not product:
            raise HTTPException(404, "Prodotto non trovato o non attivo")
        name_snap = product["name"]
        price_snap = product["sale_price"]
    else:
        name_snap = data.product_name_snapshot
        price_snap = data.unit_price_snapshot

    cur = db.execute(
        "INSERT INTO order_items "
        "(order_id, item_type, product_id, product_name_snapshot, "
        "unit_price_snapshot, quantity, notes) "
        "VALUES (?,?,?,?,?,?,?)",
        (order_id, data.item_type, data.product_id,
         name_snap, price_snap, data.quantity, data.notes),
    )
    item_id = cur.lastrowid

    for mod in data.modifications:
        db.execute(
            "INSERT INTO order_item_modifications "
            "(order_item_id, mod_type, ingredient_id, description, delta_price) "
            "VALUES (?,?,?,?,?)",
            (item_id, mod.mod_type, mod.ingredient_id, mod.description, mod.delta_price),
        )
    db.commit()
    return dict_row(db.execute("SELECT * FROM order_items WHERE id=?", (item_id,)).fetchone())


@router.delete("/{order_id}/items/{item_id}", status_code=204)
def cancel_item(order_id: int, item_id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute(
        "UPDATE order_items SET status='cancelled' WHERE id=? AND order_id=?",
        (item_id, order_id),
    )
    db.commit()


@router.patch("/{order_id}/items/{item_id}/serve", status_code=204)
def serve_item(order_id: int, item_id: int, db: sqlite3.Connection = Depends(get_db)):
    db.execute(
        "UPDATE order_items SET status='served' WHERE id=? AND order_id=?",
        (item_id, order_id),
    )
    db.commit()


@router.post("/{order_id}/items/{item_id}/mods", status_code=201)
def add_modification(
    order_id: int, item_id: int,
    data: OrderItemModCreate,
    db: sqlite3.Connection = Depends(get_db),
):
    item = db.execute(
        "SELECT id FROM order_items WHERE id=? AND order_id=?", (item_id, order_id)
    ).fetchone()
    if not item:
        raise HTTPException(404, "Riga ordine non trovata")
    cur = db.execute(
        "INSERT INTO order_item_modifications "
        "(order_item_id, mod_type, ingredient_id, description, delta_price) "
        "VALUES (?,?,?,?,?)",
        (item_id, data.mod_type, data.ingredient_id, data.description, data.delta_price),
    )
    db.commit()
    return dict_row(
        db.execute(
            "SELECT * FROM order_item_modifications WHERE id=?", (cur.lastrowid,)
        ).fetchone()
    )

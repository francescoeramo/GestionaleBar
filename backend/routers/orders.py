from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.order import OrderCreate, OrderClose

router = APIRouter(prefix="/orders", tags=["Ordini"])


def _build_order(order_id: int, db: sqlite3.Connection) -> dict:
    order = dict_row(db.execute("SELECT * FROM orders WHERE id=?", (order_id,)).fetchone())
    if not order:
        return None

    items = dict_rows(
        db.execute(
            "SELECT * FROM order_items WHERE order_id=? ORDER BY created_at",
            (order_id,),
        ).fetchall()
    )

    for item in items:
        item["modifications"] = dict_rows(
            db.execute(
                "SELECT * FROM order_item_modifications WHERE order_item_id=?",
                (item["id"],),
            ).fetchall()
        )

    order["items"] = items
    return order


@router.get("/open-summary")
def open_orders_summary(db: sqlite3.Connection = Depends(get_db)):
    return dict_rows(db.execute("SELECT * FROM v_open_order_summary").fetchall())


@router.get("/")
def list_orders(
    status: Optional[str] = Query(None),
    table_id: Optional[int] = Query(None),
    db: sqlite3.Connection = Depends(get_db),
):
    q = "SELECT * FROM orders WHERE 1=1"
    params = []

    if status:
        q += " AND status=?"
        params.append(status)

    if table_id is not None:
        q += " AND table_id=?"
        params.append(table_id)

    q += " ORDER BY opened_at DESC"
    return dict_rows(db.execute(q, params).fetchall())


@router.get("/{id}")
def get_order(id: int, db: sqlite3.Connection = Depends(get_db)):
    order = _build_order(id, db)
    if not order:
        raise HTTPException(404, "Ordine non trovato")
    return order


@router.post("/", status_code=201)
def open_order(data: OrderCreate, db: sqlite3.Connection = Depends(get_db)):
    if data.table_id:
        existing = db.execute(
            "SELECT id FROM orders WHERE table_id=? AND status='open'",
            (data.table_id,),
        ).fetchone()
        if existing:
            raise HTTPException(409, f"Il tavolo ha già un ordine aperto (id={existing['id']})")

    cur = db.execute(
        "INSERT INTO orders (table_id, covers, notes) VALUES (?,?,?)",
        (data.table_id, data.covers, data.notes),
    )
    order_id = cur.lastrowid

    if data.table_id:
        db.execute("UPDATE tables SET status='occupied' WHERE id=?", (data.table_id,))

    order = _build_order(order_id, db)
    if not order:
        raise HTTPException(500, "Errore interno durante la creazione dell'ordine")

    return order


@router.patch("/{id}/close")
def close_order(id: int, data: OrderClose, db: sqlite3.Connection = Depends(get_db)):
    order = dict_row(db.execute("SELECT * FROM orders WHERE id=?", (id,)).fetchone())
    if not order:
        raise HTTPException(404, "Ordine non trovato")

    if order["status"] != "open":
        raise HTTPException(400, "L'ordine non è aperto")

    gross_row = db.execute(
        "SELECT COALESCE(SUM(unit_price_snapshot * quantity), 0) AS total "
        "FROM order_items WHERE order_id=? AND status != 'cancelled'",
        (id,),
    ).fetchone()
    total_gross = round(gross_row["total"], 2)

    if data.discount_type == "percent":
        total_net = round(total_gross * (1 - data.discount_value / 100), 2)
    elif data.discount_type == "flat":
        total_net = round(max(total_gross - data.discount_value, 0), 2)
    else:
        total_net = total_gross

    paid = db.execute(
        "SELECT COALESCE(SUM(amount), 0) AS paid FROM payments WHERE order_id=?",
        (id,),
    ).fetchone()["paid"]
    paid = round(paid, 2)

    if paid < total_net:
        raise HTTPException(
            400,
            f"Pagamento insufficiente: pagato {paid:.2f}€, dovuto {total_net:.2f}€",
        )

    db.execute(
        "UPDATE orders SET status='closed', closed_at=datetime('now'), "
        "discount_type=?, discount_value=?, total_gross=?, total_net=? WHERE id=?",
        (data.discount_type, data.discount_value, total_gross, total_net, id),
    )

    if order["table_id"]:
        db.execute("UPDATE tables SET status='free' WHERE id=?", (order["table_id"],))

    result = _build_order(id, db)
    if not result:
        raise HTTPException(500, "Errore interno durante la chiusura dell'ordine")

    return result


@router.patch("/{id}/cancel", status_code=204)
def cancel_order(id: int, db: sqlite3.Connection = Depends(get_db)):
    order = dict_row(db.execute("SELECT * FROM orders WHERE id=?", (id,)).fetchone())
    if not order:
        raise HTTPException(404, "Ordine non trovato")

    if order["status"] != "open":
        raise HTTPException(400, "È possibile annullare solo ordini aperti")

    db.execute("UPDATE orders SET status='cancelled' WHERE id=?", (id,))

    if order["table_id"]:
        db.execute("UPDATE tables SET status='free' WHERE id=?", (order["table_id"],))

    return None
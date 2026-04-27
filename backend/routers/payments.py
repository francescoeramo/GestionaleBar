from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.payment import PaymentCreate

router = APIRouter(prefix="/payments", tags=["Pagamenti"])


@router.get("/order/{order_id}")
def get_payments_for_order(order_id: int, db: sqlite3.Connection = Depends(get_db)):
    return dict_rows(
        db.execute(
            "SELECT * FROM payments WHERE order_id=? ORDER BY paid_at", (order_id,)
        ).fetchall()
    )


@router.post("/", status_code=201)
def register_payment(data: PaymentCreate, db: sqlite3.Connection = Depends(get_db)):
    order = db.execute("SELECT status FROM orders WHERE id=?", (data.order_id,)).fetchone()
    if not order:
        raise HTTPException(404, "Ordine non trovato")
    if order["status"] != "open":
        raise HTTPException(400, "Impossibile aggiungere pagamenti a un ordine non aperto")

    change = None
    if data.method == "cash" and data.cash_given is not None:
        change = round(data.cash_given - data.amount, 2)
        if change < 0:
            raise HTTPException(400, "Contanti insufficienti")

    cur = db.execute(
        "INSERT INTO payments "
        "(order_id, method, amount, cash_given, change_given, voucher_code) "
        "VALUES (?,?,?,?,?,?)",
        (data.order_id, data.method, data.amount,
         data.cash_given, change, data.voucher_code),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM payments WHERE id=?", (cur.lastrowid,)).fetchone())


@router.delete("/{id}", status_code=204)
def delete_payment(id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT order_id FROM payments WHERE id=?", (id,)).fetchone()
    if not row:
        raise HTTPException(404, "Pagamento non trovato")
    order = db.execute("SELECT status FROM orders WHERE id=?", (row["order_id"],)).fetchone()
    if order["status"] != "open":
        raise HTTPException(400, "Impossibile rimuovere pagamento da ordine chiuso")
    db.execute("DELETE FROM payments WHERE id=?", (id,))
    db.commit()

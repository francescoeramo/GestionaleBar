from fastapi import APIRouter, Depends, HTTPException
import sqlite3
from backend.database import get_db, dict_rows, dict_row
from backend.models.table import TableCreate, TableUpdate, TableStatusUpdate

router = APIRouter(prefix="/tables", tags=["Tavoli"])


@router.get("/")
def list_tables(active_only: bool = True, db: sqlite3.Connection = Depends(get_db)):
    q = (
        "SELECT t.*, "
        "(SELECT id FROM orders o WHERE o.table_id=t.id AND o.status='open' LIMIT 1) AS open_order_id "
        "FROM tables t"
    )
    if active_only:
        q += " WHERE t.active=1"
    q += " ORDER BY t.name"
    return dict_rows(db.execute(q).fetchall())


@router.get("/{id}")
def get_table(id: int, db: sqlite3.Connection = Depends(get_db)):
    row = db.execute("SELECT * FROM tables WHERE id=?", (id,)).fetchone()
    if not row:
        raise HTTPException(404, "Tavolo non trovato")
    return dict_row(row)


@router.post("/", status_code=201)
def create_table(data: TableCreate, db: sqlite3.Connection = Depends(get_db)):
    cur = db.execute(
        "INSERT INTO tables (name, capacity, pos_x, pos_y) VALUES (?,?,?,?)",
        (data.name, data.capacity, data.pos_x, data.pos_y),
    )
    db.commit()
    return dict_row(db.execute("SELECT * FROM tables WHERE id=?", (cur.lastrowid,)).fetchone())


@router.patch("/{id}/status")
def update_table_status(id: int, data: TableStatusUpdate, db: sqlite3.Connection = Depends(get_db)):
    if not db.execute("SELECT id FROM tables WHERE id=?", (id,)).fetchone():
        raise HTTPException(404, "Tavolo non trovato")
    db.execute("UPDATE tables SET status=? WHERE id=?", (data.status, id))
    db.commit()
    return dict_row(db.execute("SELECT * FROM tables WHERE id=?", (id,)).fetchone())


@router.put("/{id}")
def update_table(id: int, data: TableUpdate, db: sqlite3.Connection = Depends(get_db)):
    fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(400, "Nessun campo da aggiornare")
    set_clause = ", ".join(f"{k}=?" for k in fields)
    db.execute(f"UPDATE tables SET {set_clause} WHERE id=?", (*fields.values(), id))
    db.commit()
    return dict_row(db.execute("SELECT * FROM tables WHERE id=?", (id,)).fetchone())

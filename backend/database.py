import sqlite3
import os
from pathlib import Path
from typing import Generator

# Percorso DB: da variabile d'ambiente oppure default db/bar.db
_env_db = os.environ.get("DB_PATH", "")
if _env_db:
    DB_PATH = Path(_env_db)
else:
    DB_PATH = Path(__file__).parent.parent / "db" / "bar.db"


def get_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def dict_row(row: sqlite3.Row) -> dict:
    return dict(row) if row else None


def dict_rows(rows) -> list[dict]:
    return [dict(r) for r in rows]

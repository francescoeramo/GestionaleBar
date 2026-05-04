"""Carica la configurazione da .env (se presente) o usa i valori di default."""
from pathlib import Path
import os

# Carica .env manualmente senza dipendenze esterne
_env_file = Path(__file__).parent.parent / ".env"
if _env_file.exists():
    for line in _env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if key and key not in os.environ:
            os.environ[key] = value

HOST    = os.environ.get("HOST", "0.0.0.0")
PORT    = int(os.environ.get("PORT", "8000"))
DB_PATH = os.environ.get("DB_PATH", "")  # vuoto = usa default in database.py
ENV     = os.environ.get("ENV", "development")

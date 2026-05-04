import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path

from backend.config import HOST, PORT, ENV
from backend.routers import (
    categories, products, ingredients, recipes,
    tables, orders, order_items, payments,
)
from backend.routers import inventory, suppliers

logging.basicConfig(
    level=logging.INFO if ENV == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("bar_gestionale")

app = FastAPI(
    title="Bar Gestionale",
    version="1.1.0",
    description="Gestionale per bar",
    # Disabilita docs in produzione
    docs_url=None if ENV == "production" else "/docs",
    redoc_url=None if ENV == "production" else "/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENV != "production" else ["http://localhost", "http://127.0.0.1"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gestione errori globale ────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Errore interno del server. Riprova tra qualche istante."},
    )

# ── Router ────────────────────────────────────────────────────────────────────
PREFIX = "/api"
app.include_router(categories.router,  prefix=PREFIX)
app.include_router(products.router,    prefix=PREFIX)
app.include_router(ingredients.router, prefix=PREFIX)
app.include_router(recipes.router,     prefix=PREFIX)
app.include_router(tables.router,      prefix=PREFIX)
app.include_router(orders.router,      prefix=PREFIX)
app.include_router(order_items.router, prefix=PREFIX)
app.include_router(payments.router,    prefix=PREFIX)
app.include_router(inventory.router)
app.include_router(suppliers.router)

# ── Frontend statico ──────────────────────────────────────────────────────────
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

# ── Avvio diretto ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    logger.info(f"Avvio server su {HOST}:{PORT} (ENV={ENV})")
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=(ENV != "production"))

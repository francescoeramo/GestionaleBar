from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from backend.routers import (
    categories, products, ingredients, recipes,
    tables, orders, order_items, payments,
)
from backend.routers import inventory, suppliers

app = FastAPI(
    title="Bar Gestionale",
    version="1.0.0",
    description="Gestionale per bar — Fase 1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

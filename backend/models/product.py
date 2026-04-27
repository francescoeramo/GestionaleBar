from typing import Optional
from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    category_id: int
    sale_price: float
    allow_mods: int = 1
    has_recipe: int = 0
    description: Optional[str] = None
    allergens: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    sale_price: Optional[float] = None
    allow_mods: Optional[int] = None
    has_recipe: Optional[int] = None
    description: Optional[str] = None
    allergens: Optional[str] = None
    active: Optional[int] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    category_id: int
    sale_price: float
    active: int
    allow_mods: int
    has_recipe: int
    description: Optional[str]
    allergens: Optional[str]
    created_at: str
    updated_at: str
from typing import Literal, Optional
from pydantic import BaseModel

RecipeUnit = Literal["ml", "cl", "g", "pz", "dash", "barspoon", "splash"]


class RecipeItemCreate(BaseModel):
    ingredient_id: int
    quantity: float
    unit: RecipeUnit
    sort_order: int = 0


class RecipeCreate(BaseModel):
    yield_ml: Optional[int] = None
    notes: Optional[str] = None
    items: list[RecipeItemCreate]


class RecipeItemResponse(BaseModel):
    id: int
    ingredient_id: int
    ingredient_name: str
    quantity: float
    unit: str
    sort_order: int


class RecipeResponse(BaseModel):
    id: int
    product_id: int
    yield_ml: Optional[int]
    notes: Optional[str]
    items: list[RecipeItemResponse]
    # Dati costo dalla view v_recipe_cost
    theoretical_cost: Optional[float] = None
    theoretical_margin: Optional[float] = None
    margin_pct: Optional[float] = None

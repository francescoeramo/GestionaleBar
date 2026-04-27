from typing import Literal, Optional
from pydantic import BaseModel

BaseUnit = Literal["ml", "cl", "g", "pz"]


class IngredientCreate(BaseModel):
    name: str
    base_unit: BaseUnit
    theoretical_unit_cost: float = 0.0
    allergens: Optional[str] = None   # JSON array come stringa, es. '[\"glutine\"]'


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    base_unit: Optional[BaseUnit] = None
    theoretical_unit_cost: Optional[float] = None
    allergens: Optional[str] = None
    active: Optional[int] = None


class IngredientResponse(BaseModel):
    id: int
    name: str
    base_unit: str
    theoretical_unit_cost: float
    allergens: Optional[str]
    active: int
    created_at: str
    updated_at: str
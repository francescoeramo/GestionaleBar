from typing import Literal, Optional
from pydantic import BaseModel

CategoryType = Literal["cocktail", "analcolico", "food", "birra", "vino", "altro"]


class CategoryCreate(BaseModel):
    name: str
    type: CategoryType
    sort_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[CategoryType] = None
    sort_order: Optional[int] = None
    active: Optional[int] = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    type: str
    sort_order: int
    active: int
    created_at: str
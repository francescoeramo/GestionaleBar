from typing import Literal, Optional
from pydantic import BaseModel

class OrderCreate(BaseModel):
    table_id: Optional[int] = None   # None = asporto / banco
    covers: int = 1
    notes: Optional[str] = None


class OrderClose(BaseModel):
    discount_type: Optional[Literal["flat", "percent"]] = None
    discount_value: float = 0.0


class OrderItemModCreate(BaseModel):
    mod_type: Literal["add", "remove", "note"]
    ingredient_id: Optional[int] = None
    description: str
    delta_price: float = 0.0


class OrderItemCreate(BaseModel):
    item_type: Literal["menu", "free"]
    product_id: Optional[int] = None       # None per item_type='free'
    product_name_snapshot: str
    unit_price_snapshot: float
    quantity: int = 1
    notes: Optional[str] = None
    modifications: list[OrderItemModCreate] = []


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    item_type: str
    product_id: Optional[int]
    product_name_snapshot: str
    unit_price_snapshot: float
    quantity: int
    notes: Optional[str]
    status: str
    created_at: str
    modifications: list[dict] = []


class OrderResponse(BaseModel):
    id: int
    table_id: Optional[int]
    status: str
    opened_at: str
    closed_at: Optional[str]
    covers: int
    discount_type: Optional[str]
    discount_value: float
    total_gross: float
    total_net: float
    notes: Optional[str]
    items: list[OrderItemResponse] = []

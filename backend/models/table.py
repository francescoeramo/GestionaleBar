from typing import Literal, Optional
from pydantic import BaseModel

TableStatus = Literal["free", "occupied", "reserved"]

class TableCreate(BaseModel):
    name: str
    capacity: int = 4
    pos_x: float = 0.0
    pos_y: float = 0.0


class TableUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    active: Optional[int] = None


class TableStatusUpdate(BaseModel):
    status: TableStatus


class TableResponse(BaseModel):
    id: int
    name: str
    capacity: int
    status: str
    pos_x: float
    pos_y: float
    active: int
    open_order_id: Optional[int] = None  # se ha un ordine aperto

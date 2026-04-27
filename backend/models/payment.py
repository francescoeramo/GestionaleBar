from typing import Literal, Optional
from pydantic import BaseModel

class PaymentCreate(BaseModel):
    order_id: int
    method: Literal["cash", "card", "voucher"]
    amount: float
    cash_given: Optional[float] = None
    voucher_code: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    method: str
    amount: float
    cash_given: Optional[float]
    change_given: Optional[float]
    voucher_code: Optional[str]
    paid_at: str

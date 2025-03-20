from pydantic import BaseModel
from typing import Optional

class CarBase(BaseModel):
    manufacturer: str
    model: str
    year: int
    body_type: Optional[str] = None
    engine_info: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    mpg: Optional[float] = None

    class Config:
        from_attributes = True

class CarResponse(CarBase):
    id: int
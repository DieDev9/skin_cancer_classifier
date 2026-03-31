from pydantic import BaseModel

class PrediccionMelanoma(BaseModel):
    diagnostico: str
    probabilidad_maligno: float
    umbral_utilizado: float
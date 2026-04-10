from pydantic import BaseModel
from typing import Optional

# 1. ESTE ES EL QUE FALTA (El que pide el error)
class PeticionImagen(BaseModel):
    imagen_url: str

class CasoGuardar(BaseModel):
    # Datos del Paciente
    nombre_paciente: str
    apellido_paciente: str
    fecha_nacimiento: Optional[str] = None
    estado: str = "Activo"
    
    # Datos del Diagnóstico
    imagen_url: str
    clasificacion: str
    probabilidad: float
    descripcion_medico: Optional[str] = ""
    diagnostico_confirmado: bool

class PrediccionMelanoma(BaseModel):
    diagnostico: str
    probabilidad_maligno: float
    umbral_utilizado: float
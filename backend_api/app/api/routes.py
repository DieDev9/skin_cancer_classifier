from fastapi import APIRouter, HTTPException
import requests
from app.ml.predict import predict_melanoma
from app.schemas.models import PeticionImagen, PrediccionMelanoma, CasoGuardar
from app.database import supabase

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "La API está funcionando correctamente"}

@router.post("/predict", response_model=PrediccionMelanoma)
async def predict_image(peticion: PeticionImagen):
    """
    Recibe la URL pública de la imagen en Supabase, la descarga en RAM
    y la pasa por el modelo híbrido CNN-ViT.
    """
    try:
        # 1. Descargar la imagen desde Supabase
        respuesta = requests.get(peticion.imagen_url)
        respuesta.raise_for_status() 
        
        # 2. Extraer los bytes puros para el preprocesamiento
        image_bytes = respuesta.content
        
        # 3. Pasar los bytes al modelo de IA
        resultado_ia = predict_melanoma(image_bytes)
        
        # 4. Devolver el resultado mapeado al esquema
        return PrediccionMelanoma(
            diagnostico=resultado_ia["diagnostico"],
            probabilidad_maligno=resultado_ia["probabilidad_maligno"],
            umbral_utilizado=resultado_ia["umbral_utilizado"]
        )
        
    except requests.exceptions.RequestException:
        raise HTTPException(status_code=400, detail="No se pudo descargar la imagen de Supabase. Revisa la URL.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al procesar la imagen con la IA: {str(e)}")
    

@router.post("/guardar_historial")
async def guardar_historial(caso: CasoGuardar):
    try:
        # 1. Insertar el Paciente en la tabla 'Pacientes'
        nuevo_paciente = {
            "nombre": caso.nombre_paciente,
            "apellido": caso.apellido_paciente,
            "fecha_nacimiento": caso.fecha_nacimiento,
            "estado": caso.estado
        }
        
        # .execute() envía la orden a Supabase
        respuesta_pac = supabase.table("Pacientes").insert(nuevo_paciente).execute()
        
        # Extraemos el ID que Supabase le asignó automáticamente al paciente
        paciente_id = respuesta_pac.data[0]['id'] 

        # 2. Insertar el Diagnóstico vinculándolo al paciente (Llave Foránea)
        nuevo_diagnostico = {
            "paciente_id": paciente_id,
            "imagen_url": caso.imagen_url,
            "clasificacion": caso.clasificacion,
            "probabilidad": caso.probabilidad,
            "descripcion_medico": caso.descripcion_medico,
            "diagnostico_confirmado": caso.diagnostico_confirmado
        }
        
        respuesta_diag = supabase.table("Diagnostico").insert(nuevo_diagnostico).execute()

        return {
            "mensaje": "Historial guardado exitosamente en la base de datos",
            "paciente_id": paciente_id,
            "diagnostico_id": respuesta_diag.data[0]['id']
        }

    except Exception as e:
        return {"error": f"Hubo un problema al guardar en Supabase: {str(e)}"}
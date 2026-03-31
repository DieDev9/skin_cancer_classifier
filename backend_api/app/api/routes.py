from fastapi import APIRouter, File, UploadFile, HTTPException
from app.ml.predict import predict_melanoma
from app.schemas.models import PrediccionMelanoma

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok", "message": "La API está funcionando correctamente"}

@router.post("/predict", response_model=PrediccionMelanoma)
async def predict_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo enviado no es una imagen válida.")
    
    try:
        image_bytes = await file.read()
        resultado = predict_melanoma(image_bytes)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al procesar la imagen: {str(e)}")
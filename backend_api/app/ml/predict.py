import torch
import os
from app.ml.architecture import HybridModel
from app.ml.preprocess import transform_image

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# 1. Se crea el esqueleto del modelo
model = HybridModel(
    cnn_name='efficientnet_b0', 
    vit_name='vit_base_patch16_224', 
    hidden=512, 
    dropout=0.4
)

MODEL_PATH = "model_weights/hybrid_final.pt.zip"

def load_model_weights():
    # Validación 1: Si el archivo no existe, DESTRUYE LA EJECUCIÓN inmediatamente.
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"¡CRÍTICO! No se encontró el archivo del modelo en: {MODEL_PATH}. El servidor no puede iniciar.")

    try:
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(device)
        model.eval()
        
        optimal_thresh = checkpoint.get('optimal_thresh', 0.5)
        print(f"Modelo híbrido cargado con éxito. Umbral óptimo: {optimal_thresh:.4f}")
        return optimal_thresh
        
    except Exception as e:
        # Validación 2: Si el archivo existe pero está corrupto, también destruye la ejecución.
        raise RuntimeError(f"¡CRÍTICO! El archivo existe pero está corrupto o es inválido: {e}")

# Si esto falla, FastAPI nunca se levantará. Así evitamos falsos positivos.
UMBRAL_OPTIMO = load_model_weights()

def predict_melanoma(image_bytes: bytes):
    tensor = transform_image(image_bytes).to(device)
    
    with torch.no_grad():
        logits = model(tensor).squeeze(1).float()
        probabilidad = torch.sigmoid(logits).item()
        
    diagnostico = "Maligno" if probabilidad >= UMBRAL_OPTIMO else "Benigno"
    
    return {
        "diagnostico": diagnostico,
        "probabilidad_maligno": probabilidad,
        "umbral_utilizado": UMBRAL_OPTIMO
    }
import torch
import os
from app.ml.architecture import HybridModel
from app.ml.preprocess import transform_image

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = HybridModel(
    cnn_name='efficientnet_b0', 
    vit_name='vit_base_patch16_224', 
    hidden=512, 
    dropout=0.4
)

MODEL_PATH = "model_weights/hybrid_final.pt.zip"

def load_model_weights():
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(device)
        model.eval()
        
        optimal_thresh = checkpoint.get('optimal_thresh', 0.5)
        print(f"Modelo híbrido cargado. Umbral óptimo: {optimal_thresh:.4f}")
        return optimal_thresh
    except Exception as e:
        print(f"Error cargando los pesos del modelo: {e}")
        return 0.5

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
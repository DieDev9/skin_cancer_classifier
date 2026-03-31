import io
from PIL import Image
import torchvision.transforms as T

# Valores extraídos del pipeline de entrenamiento
IMG_SIZE = 224
MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]

def transform_image(image_bytes: bytes):
    """
    Convierte los bytes de la imagen recibida en un tensor normalizado 
    listo para el modelo híbrido.
    """
    transform = T.Compose([
        T.Resize((IMG_SIZE, IMG_SIZE)),
        T.ToTensor(),
        T.Normalize(mean=MEAN, std=STD),
    ])
    
    # Abrir la imagen en memoria y asegurar que tenga 3 canales (RGB)
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    
    # Aplicar transformaciones y añadir la dimensión del batch [1, C, H, W]
    tensor = transform(img).unsqueeze(0)
    
    return tensor
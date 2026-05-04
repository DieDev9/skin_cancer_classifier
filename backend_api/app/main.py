from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database import supabase
from app.schemas.models import PrediccionMelanoma

app = FastAPI(title="API Diagnóstico Cáncer de Piel (Híbrido)")

# --- MODO PRODUCCIÓN: RESTRINGIDO A VERCEL ---
origenes_permitidos = [
    "https://dermascanuis.vercel.app", 
    "http://localhost:5173",                   
    "http://localhost:3000"                    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos, # Pasamos la lista exacta
    allow_credentials=True,            # Esto cambia a True ahora que no usamos "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
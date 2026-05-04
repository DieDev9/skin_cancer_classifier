from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database import supabase
from app.schemas.models import PrediccionMelanoma

app = FastAPI(title="API Diagnóstico Cáncer de Piel (Híbrido)")

# --- MODO PRODUCCIÓN: RESTRINGIDO A VERCEL ---
origenes_permitidos = [
    "https://tu-proyecto-frontend.vercel.app", # Reemplaza esto con tu URL real de Vercel
    "http://localhost:5173",                   # Mantenlo para que puedas seguir probando en tu PC
    "http://localhost:3000"                    # Por si usas Next.js en local
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos, # Pasamos la lista exacta
    allow_credentials=True,            # Esto cambia a True ahora que no usamos "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database import supabase
from app.schemas.models import PrediccionMelanoma

app = FastAPI(title="API Diagnóstico Cáncer de Piel (Híbrido)")

# --- MODO DESARROLLO: ABIERTO A TODOS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # El comodín mágico que deja pasar a React
    allow_credentials=False,     # Apagamos esto para que el "*" funcione sin errores
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
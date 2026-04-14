from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database import supabase
from app.schemas.models import PrediccionMelanoma
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="API Diagnóstico Cáncer de Piel (Híbrido)")

# --- MODO DESARROLLO: ABIERTO A TODOS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Resolver ruta del frontend dist segun contexto (dev o exe)
_base = os.environ.get("_APP_BASE_PATH", os.path.dirname(os.path.abspath(__file__)))
_dist_dir = os.path.join(_base, "dist")

app.mount("/", StaticFiles(directory=_dist_dir, html=True), name="static")
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar .env desde la ruta correcta (dev o exe)
_base = os.environ.get("_APP_BASE_PATH", "")
if getattr(sys, 'frozen', False):
    _env_path = os.path.join(_base, ".env")
else:
    _env_path = os.path.join(_base, "backend_api", ".env")
load_dotenv(_env_path, override=True)

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(URL, KEY)
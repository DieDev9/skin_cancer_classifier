import sys
import os
import traceback

log_path = os.path.join(os.path.dirname(sys.executable if getattr(sys, 'frozen', False) else __file__), "launcher.log")

def log(msg):
    print(msg)
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

try:
    if getattr(sys, 'frozen', False):
        base = sys._MEIPASS
        sys.path.insert(0, base)
        os.environ["_APP_BASE_PATH"] = base
        log(f"Modo exe. Base: {base}")
    else:
        base = os.path.dirname(os.path.abspath(__file__))
        sys.path.insert(0, os.path.join(base, "backend_api"))
        os.environ["_APP_BASE_PATH"] = base
        log(f"Modo desarrollo. Base: {base}")

    # Importacion directa para que PyInstaller detecte TODAS las dependencias
    from app.main import app
    import uvicorn
    import webbrowser
    import threading
    import time

    def abrir_navegador():
        time.sleep(3)
        webbrowser.open("http://localhost:8000")

    threading.Thread(target=abrir_navegador, daemon=True).start()

    log("Iniciando servidor en http://localhost:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)

except Exception as e:
    log(f"ERROR: {e}")
    log(traceback.format_exc())
    input("Presiona Enter para cerrar...")

import os
import sys
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from backend.app.main import app as real_app
    app = real_app
except Exception as e:
    err_tb = traceback.format_exc()
    app = FastAPI(title="FloraAI Vercel Diagnostics")
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500, 
            content={
                "error": "FastAPI Startup Exception",
                "message": str(e),
                "traceback": err_tb.splitlines()
            }
        )

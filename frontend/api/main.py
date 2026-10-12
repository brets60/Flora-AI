import os
import sys

# Ensure frontend/backend is in sys.path for Vercel Serverless Function
api_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.dirname(api_dir)
backend_dir = os.path.join(frontend_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if frontend_dir not in sys.path:
    sys.path.insert(0, frontend_dir)

from backend.app.main import app

@echo off
echo ===================================================
echo Starting FloraAI Plant Assistant (Full Stack)
echo ===================================================

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FloraAI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Frontend on http://localhost:3000 ...
start "FloraAI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting up!
echo - Frontend: http://localhost:3000
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo ===================================================

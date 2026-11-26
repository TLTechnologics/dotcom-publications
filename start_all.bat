@echo off
TITLE Dotcom Publications Launcher
echo ======================================================================
echo           DOTCOM PUBLICATIONS - STARTING PLATFORM SERVERS
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend FastAPI Server (Port 8000)...
start "Dotcom Publications - Backend API" cmd /k "cd /d "%~dp0backend" && python run.py"

echo [2/2] Launching Frontend React App (Port 5173)...
start "Dotcom Publications - Frontend Admin" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo   Both servers have been launched in separate terminal windows!
echo   - Frontend Admin: http://localhost:5173/
echo   - Backend REST API: http://127.0.0.1:8000
echo   - Swagger API Docs: http://127.0.0.1:8000/docs
echo ======================================================================
echo.
pause

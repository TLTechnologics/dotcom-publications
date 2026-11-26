# Dotcom Publications - PowerShell Server Launcher
Write-Host "======================================================================" -ForegroundColor DarkRed
Write-Host "          DOTCOM PUBLICATIONS - STARTING PLATFORM SERVERS" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor DarkRed
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting Backend FastAPI Server on Port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; python run.py"

Write-Host "[2/2] Starting Frontend Vite Server on Port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; npm run dev"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  Both servers launched in independent terminal windows!" -ForegroundColor Green
Write-Host "  Frontend Admin: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "  Backend API:    http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "  API Docs:       http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Green

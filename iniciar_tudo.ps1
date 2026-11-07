# Script PowerShell para iniciar Backend e Frontend em janelas separadas
$Root = $PSScriptRoot

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Iniciando Catálogo de Cosméticos (Backend + Frontend) " -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Iniciar Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; Write-Host 'Backend Iniciando...' -ForegroundColor Green; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# Aguardar 2 segundos
Start-Sleep -Seconds 2

# 2. Iniciar Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; Write-Host 'Frontend Iniciando...' -ForegroundColor Magenta; npm.cmd start"

Write-Host "`nServidores iniciados em novas janelas!" -ForegroundColor Green
Write-Host "Vitrine do Cliente: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Painel do Lojista: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "Swagger / API: http://127.0.0.1:8000/docs" -ForegroundColor Cyan


@echo off
title Catalogo Express de Cosmeticos
echo ======================================================
echo Iniciando Sistema Completo (Backend + Frontend)...
echo ======================================================
start "Backend - FastAPI" cmd /k "%~dp0iniciar_backend.bat"
timeout /t 3 /nobreak >nul
start "Frontend - Next.js" cmd /k "%~dp0iniciar_frontend.bat"
echo.
echo ======================================================
echo Sistema iniciado com sucesso!
echo - No Computador: http://localhost:3000
echo - No Celular (mesmo Wi-Fi): http://192.168.0.6:3000
echo - Painel do Lojista: http://localhost:3000/admin
echo - Documentacao da API: http://127.0.0.1:8000/docs
echo ======================================================


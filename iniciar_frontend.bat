@echo off
title Frontend - Catalogo de Cosmeticos
echo ======================================================
echo Iniciando Frontend (Next.js) em http://localhost:3000
echo Rede Local: http://192.168.0.6:3000
echo ======================================================
cd /d "%~dp0frontend"
npm.cmd start -- -H 0.0.0.0 -p 3000
pause


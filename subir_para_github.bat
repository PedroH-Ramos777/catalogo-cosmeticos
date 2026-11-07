@echo off
title Enviar Catalogo para o GitHub
color 0B
echo ======================================================
echo   ENVIANDO PROJETO PARA SEU REPOSITORIO NO GITHUB
echo   Destino: https://github.com/PedroH-Ramos777/catalogo-cosmeticos.git
echo ======================================================
echo.

git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ======================================================
    echo ATENCAO: Se apareceu erro de repositorio nao encontrado:
    echo 1. Acesse: https://github.com/new
    echo 2. Crie o repositorio com o nome: catalogo-cosmeticos
    echo 3. Depois execute este arquivo (subir_para_github.bat) novamente!
    echo ======================================================
) else (
    echo.
    echo ======================================================
    echo SUCESSO! Todo o seu codigo ja esta no GitHub!
    echo Acesse: https://github.com/PedroH-Ramos777/catalogo-cosmeticos
    echo ======================================================
)

echo.
pause

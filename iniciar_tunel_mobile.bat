@echo off
title Criar Link Publico HTTPS para Celular
echo ======================================================
echo Gerando link publico HTTPS para teste no celular...
echo ======================================================
echo Certifique-se de que o sistema (iniciar_tudo.bat) ja esta rodando!
echo.
echo Quando o link aparecer abaixo (ex: https://...loca.lt),
echo basta abrir no Safari/Chrome do seu iPhone ou celular Android.
echo (Se pedir a "Friendly Password", seu IP publico pode ser consultado em https://loca.lt/mytunnelpassword)
echo ======================================================
npx --yes localtunnel --port 3000
pause


@echo off
REM Instalador para Windows — A Coroa de Varnor (motor 2D)
echo Verificando programas...
where node >nul 2>nul || (echo Instale o Node.js: https://nodejs.org  && pause && exit /b)
where python >nul 2>nul || (echo Instale o Python: https://www.python.org/downloads/  ^(marque "Add to PATH"^) && pause && exit /b)
where ffmpeg >nul 2>nul || (echo Instale o ffmpeg:  winget install Gyan.FFmpeg  ^(depois feche e abra o terminal^) && pause && exit /b)
call npm install
call npx playwright install chromium
python -m pip install numpy
echo.
echo Tudo pronto! Para gerar o episodio 1:   node gerar.js ep01
pause

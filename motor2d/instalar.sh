#!/usr/bin/env bash
# Instalador para Mac/Linux — A Coroa de Varnor (motor 2D)
set -e
command -v node >/dev/null || { echo "Instale o Node.js: https://nodejs.org"; exit 1; }
command -v python3 >/dev/null || { echo "Instale o Python 3: https://www.python.org/downloads/"; exit 1; }
command -v ffmpeg >/dev/null || { echo "Instale o ffmpeg (Mac: brew install ffmpeg | Linux: sudo apt install ffmpeg)"; exit 1; }
npm install
npx playwright install chromium
python3 -m pip install --user numpy
echo "Tudo pronto! Para gerar o episódio 1:  node gerar.js ep01"

# Motor 3D low-poly — A Coroa de Varnor

Cenas 3D feitas 100% por código (Three.js), renderizadas quadro a quadro e montadas com ffmpeg.
Nenhum crédito de IA é gasto.

| Arquivo | O que faz |
|---|---|
| `personagens.js` | Vitorioso, Brasa e os monstros (formas low-poly + poses animadas) |
| `cena_ep01.js` | Cenário (portão, vila em chamas, floresta), luz, câmera e linha do tempo |
| `render.js` | Abre a cena num navegador invisível e salva cada quadro em `frames/` |
| `compor.py` | Junta quadros + legendas + narração + efeitos → `teste_3d_ep01.mp4` |

## Como gerar
```bash
npm install          # instala o three.js
node render.js 30    # renderiza a 30 fps (~2 min)
python3 compor.py    # monta o vídeo final
```
Requer Node, Python 3 com Pillow, ffmpeg e Playwright com Chromium.

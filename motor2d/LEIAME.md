# Motor 2D — A Coroa de Varnor

Animação 2D vetorial (personagens chapados + quadros técnicos com curiosidades), feita 100% por código.
**Gratuito e roda em qualquer computador** — não precisa de placa de vídeo.

## Instalar (uma vez só)
1. Instale **Node.js** (https://nodejs.org), **Python 3** (https://www.python.org — no Windows marque *Add to PATH*) e **ffmpeg**
   (Windows: `winget install Gyan.FFmpeg` · Mac: `brew install ffmpeg` · Linux: `sudo apt install ffmpeg`).
2. Baixe este repositório (botão verde **Code → Download ZIP** no GitHub) e descompacte.
3. Abra a pasta `motor2d` e rode o instalador:
   - Windows: dois cliques em `instalar.bat`
   - Mac/Linux: `./instalar.sh`

## Gerar um episódio
```
cd motor2d
node gerar.js ep01
```
O vídeo sai em `videos/ep01_2d/EP01_2D.mp4` (≈ 5 a 10 minutos, dependendo do computador).

## Arquivos
| Arquivo | O que é |
|---|---|
| `lib.js` | Biblioteca: personagens (Vitorioso, Bram, Lira, Draven, Brasa, criaturas, aldeões, corvo), rostos com expressões e boca falando, quadros técnicos, chuva, fogo, legendas |
| `ep01.js` | Roteiro visual do episódio 1 (tomadas, câmera, legendas) |
| `elenco2d.js` | Prancha do elenco e das expressões |
| `render2d.js` | Desenha cada quadro do vídeo (navegador invisível) |
| `compor.py` | Junta quadros + vozes + efeitos sonoros |
| `gerar.js` | Faz tudo acima com um comando |

## Vozes
As falas ficam em `videos/epXX_2d/*.mp3` e a posição de cada uma em `videos/epXX_2d/timeline.py`.
Hoje são geradas no ElevenLabs. Alternativa gratuita local: **Piper** ou **XTTS-v2** (português), salvando com os mesmos nomes.

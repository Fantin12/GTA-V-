# Cortador de lives de GTA 6

Acha os melhores momentos de uma live e gera cortes verticais (1080x1920) para Shorts, TikTok e Reels. Cada corte sai com:

- título no topo
- o vídeo com borda neon e fundo desfocado
- legenda palavra por palavra, com a palavra falada em amarelo
- selo "@streamer · corte liberado" e barra de progresso
- um arquivo `.txt` com título, descrição (link da live, crédito e prova da autorização) e hashtags

> **Só use com streamers que liberaram cortes publicamente ou que te autorizaram.** O script exige `--autorizacao` (o link ou print da regra) e coloca isso na descrição de cada corte.

## Instalação (uma vez)
1. Instale o **Python 3** e o **ffmpeg** (no Windows: `winget install ffmpeg`; no Mac: `brew install ffmpeg`).
2. No terminal, dentro desta pasta:
   ```
   pip install numpy pillow faster-whisper yt-dlp
   ```
   O `faster-whisper` faz a legenda automática; na primeira vez ele baixa o modelo de voz (uns 500 MB).

## Uso
Com o arquivo da live:
```
python3 cortador.py live.mp4 --streamer @NomeDoStreamer --fonte https://twitch.tv/videos/123 --autorizacao "https://link-da-regra" --pagina @SuaPagina
```
Com o link da live (baixa sozinho com o yt-dlp):
```
python3 cortador.py "https://www.twitch.tv/videos/123" --streamer @NomeDoStreamer --autorizacao "print da regra no Discord, 20/11" --pagina @SuaPagina
```

Opções úteis:

| Opção | O que faz | Padrão |
|---|---|---|
| `--cortes 5` | quantos cortes gerar | 3 |
| `--duracao 40` | segundos por corte (20 a 60) | 45 |
| `--chat chat.txt` | usa o chat para achar picos (linhas que começam com `01:23:45`) | — |
| `--titulos "TÍTULO 1" "TÍTULO 2"` | escolhe os títulos na mão | automático |
| `--modelo medium` | legenda mais precisa (mais lenta) | small |

Os cortes saem na pasta `cortes/`. **Assista cada um e leia o `.txt` antes de postar:** o título automático usa as primeiras palavras do trecho e quase sempre melhora se você reescrever.

## Como ele escolhe os momentos
Ele mede o volume da live a cada meio segundo e compara com o volume normal daquele trecho. Gritos, risadas e explosões ficam bem acima da média e viram picos. Se você passar o chat, a quantidade de mensagens também conta. Os cortes nunca se sobrepõem, e o primeiro minuto da live é ignorado.

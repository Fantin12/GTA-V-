#!/usr/bin/env python3
"""Cortador automático de lives de GTA 6 para Shorts, TikTok e Reels.

Acha os momentos de pico da live (volume e reação, e opcionalmente o chat),
corta no formato vertical 1080x1920 com o layout da página, legenda palavra
por palavra, crédito do streamer na tela, e escreve título, descrição e
hashtags de cada corte.

Só use com lives de streamers que liberaram cortes publicamente ou que te
autorizaram: o script pede a prova da autorização e a coloca na descrição.

Exemplos:
  python3 cortador.py live.mp4 --streamer @alguem --fonte https://twitch.tv/videos/123 \
      --autorizacao "https://link-da-regra-de-cortes" --pagina @MinhaPagina
  python3 cortador.py "https://www.twitch.tv/videos/123" --streamer @alguem \
      --autorizacao "print da regra no Discord, 20/11" --cortes 5 --duracao 40
"""
import argparse, json, os, re, shutil, subprocess, sys, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "video", "fonts")
W, H = 1080, 1920
PINK, TEAL, YEL = (255, 61, 127), (32, 214, 199), (255, 216, 74)


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def probe(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=width,height:format=duration", "-of", "json", path])
    j = json.loads(out)
    s = j["streams"][0]
    return s["width"], s["height"], float(j["format"]["duration"])


def baixar(url, pasta):
    """Baixa a live com yt-dlp (pip install yt-dlp). Só para conteúdo liberado."""
    if not shutil.which("yt-dlp"):
        sys.exit("Para usar link, instale o yt-dlp:  pip install yt-dlp   (ou passe o arquivo .mp4 direto)")
    alvo = os.path.join(pasta, "live.%(ext)s")
    sh(["yt-dlp", "-f", "bv*[height<=1080]+ba/b[height<=1080]/b", "--merge-output-format", "mp4", "-o", alvo, url])
    return os.path.join(pasta, "live.mp4")


# ---------------------------------------------------------------- picos
def energia(path, passo=0.5):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-vn", "-ac", "1", "-ar", "8000",
                                   "-f", "s16le", "-"])
    pcm = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    n = int(8000 * passo)
    k = len(pcm) // n
    rms = np.sqrt((pcm[:k * n].reshape(k, n) ** 2).mean(1) + 1e-10)
    return 20 * np.log10(rms), passo


def chat_contagem(path, total, passo):
    """Arquivo de chat com o tempo no começo da linha: 01:23:45 msg  ou  [1:23:45] msg."""
    cont = np.zeros(int(total / passo) + 1)
    rx = re.compile(r"^\[?(\d+):(\d{2}):(\d{2})")
    with open(path, encoding="utf-8", errors="ignore") as f:
        for linha in f:
            m = rx.match(linha.strip())
            if m:
                t = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3])
                i = int(t / passo)
                if i < len(cont):
                    cont[i] += 1
    return cont


def suaviza(x, janela):
    janela = max(1, int(janela))
    return np.convolve(x, np.ones(janela) / janela, mode="same")


def acha_picos(db, passo, dur, n, chat=None, ignora_inicio=60):
    # empolgação = quanto o volume está acima do normal daquele trecho da live
    base = np.array([np.median(db[max(0, i - 120):i + 120]) for i in range(0, len(db), 20)])
    base = np.repeat(base, 20)[:len(db)]
    exc = suaviza(np.clip(db - base, 0, None), 3 / passo)
    pontos = exc / (exc.std() + 1e-6)
    if chat is not None:
        c = suaviza(chat[:len(pontos)], 10 / passo)
        pontos[:len(c)] += 1.5 * c / (c.std() + 1e-6)
    ordem = np.argsort(pontos)[::-1]
    escolhidos = []
    for i in ordem:
        t = i * passo
        if t < ignora_inicio:
            continue
        if all(abs(t - e) > dur for e in escolhidos):
            escolhidos.append(t)
        if len(escolhidos) == n:
            break
    cortes = []
    for t in sorted(escolhidos):
        ini = max(0, t - 0.6 * dur)
        # começa num respiro (ponto mais baixo nos 3 s antes) para não cortar no meio da frase
        a, b = int(max(0, ini - 3) / passo), int(ini / passo) + 1
        if b > a:
            ini = (a + int(np.argmin(db[a:b]))) * passo
        cortes.append((ini, dur, float(pontos[int(t / passo)])))
    return cortes


# ---------------------------------------------------------------- legenda
def transcreve(path, ini, dur, modelo):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    tmp = path + f".{int(ini)}.wav"
    sh(["ffmpeg", "-v", "error", "-y", "-ss", f"{ini:.2f}", "-t", f"{dur:.2f}", "-i", path, "-ac", "1", "-ar", "16000", tmp])
    m = transcreve.cache.get(modelo) or WhisperModel(modelo, compute_type="int8")
    transcreve.cache[modelo] = m
    segs, _ = m.transcribe(tmp, language="pt", word_timestamps=True, vad_filter=True)
    palavras = [(w.start, w.end, w.word.strip()) for s in segs for w in (s.words or []) if w.word.strip()]
    os.remove(tmp)
    return palavras
transcreve.cache = {}


def ass_tempo(t):
    t = max(0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def escreve_ass(palavras, caminho, y_legenda):
    cab = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,Anton,118,&H00FFFFFF,&H00FFFFFF,&H00140A0E,&H00000000,0,0,0,0,100,100,0,0,1,9,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    linhas = []
    grupos = [palavras[i:i + 3] for i in range(0, len(palavras), 3)]
    for gi, g in enumerate(grupos):
        fim_grupo = grupos[gi + 1][0][0] if gi + 1 < len(grupos) else g[-1][1] + 0.4
        for wi, (a, b, _) in enumerate(g):
            fim = g[wi + 1][0] if wi + 1 < len(g) else fim_grupo
            txt = " ".join(("{\\c&H4AD8FF&}" + p.upper() + "{\\c&HFFFFFF&}") if j == wi else p.upper()
                           for j, (_, _, p) in enumerate(g))
            pop = "{\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)}" if wi == 0 else ""
            linhas.append(f"Dialogue: 0,{ass_tempo(a)},{ass_tempo(fim)},Leg,,0,0,0,,{{\\pos({W // 2},{y_legenda})}}{pop}{txt}")
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(cab + "\n".join(linhas) + "\n")


# ---------------------------------------------------------------- layout
def fonte(nome, tam):
    return ImageFont.truetype(os.path.join(FONTS, nome), tam)


def quebra(draw, texto, f, largura):
    palavras, linhas, atual = texto.split(), [], ""
    for p in palavras:
        teste = (atual + " " + p).strip()
        if draw.textlength(teste, font=f) <= largura:
            atual = teste
        else:
            linhas.append(atual)
            atual = p
    linhas.append(atual)
    return linhas


def layout_png(caminho, titulo, streamer, pagina, vy, vh):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # faixa escura atrás do título
    d.rectangle((0, 0, W, vy - 40), fill=(12, 8, 20, 150))
    tam = 104
    while True:
        f = fonte("Anton.ttf", tam)
        ls = quebra(d, titulo.upper(), f, W - 120)
        if len(ls) <= 3 or tam <= 64:
            break
        tam -= 8
    alt = len(ls) * tam * 1.08
    y = (vy - 40 - alt) / 2 + 10
    for l in ls:
        d.text((W / 2 + 5, y + 5), l, font=f, fill=PINK, anchor="ma")
        d.text((W / 2, y), l, font=f, fill="white", anchor="ma")
        y += tam * 1.08
    # bordas neon do vídeo
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.rectangle((0, vy - 8, W, vy), fill=PINK + (255,))
    gd.rectangle((0, vy + vh, W, vy + vh + 8), fill=TEAL + (255,))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(10)))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)
    # selo do streamer
    sf = fonte("Montserrat-ExtraBold.ttf", 40)
    txt = f"{streamer}  ·  corte liberado"
    tw = d.textlength(txt, font=sf)
    x0, y0 = (W - tw) / 2 - 30, vy + vh + 40
    d.rounded_rectangle((x0, y0, x0 + tw + 60, y0 + 72), 36, fill=(255, 255, 255, 235))
    d.ellipse((x0 + 22, y0 + 28, x0 + 38, y0 + 44), fill=(255, 60, 60))
    d.text((x0 + 48, y0 + 14), txt, font=sf, fill=(20, 14, 20))
    d.rectangle((0, H - 200, W, H), fill=(12, 8, 20, 170))
    # rodapé
    d.text((W / 2, H - 150), "Live completa: link na descrição", font=fonte("Montserrat-Regular.ttf", 32), fill=(230, 225, 240), anchor="mm")
    if pagina:
        d.text((W / 2, H - 95), pagina, font=fonte("Montserrat-ExtraBold.ttf", 40), fill=YEL, anchor="mm")
    img.save(caminho)


# ---------------------------------------------------------------- render
def renderiza(src, ini, dur, sw, sh_, saida, png, ass):
    # vídeo na largura toda; se for vertical, limita a altura
    vh = min(int(W * sh_ / sw) // 2 * 2, 1150)
    vw = min(W, int(vh * sw / sh_) // 2 * 2)
    vy = 560 if vh < 800 else 380
    fg = f"scale={vw}:{vh}"
    filtro = (f"[0:v]split[a][b];"
              f"[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},gblur=sigma=40,eq=brightness=-0.28:saturation=1.3[bg];"
              f"[b]{fg}[fg];[bg][fg]overlay=({W}-w)/2:{vy}[v1];[v1][1:v]overlay=0:0[v2];"
              f"color=c=0xFF3D7F:s={W}x14:r=30[bar];[v2][bar]overlay=x='-{W}+{W}*t/{dur:.2f}':y={H - 30}:shortest=1[v3]")
    filtro += f";[v3]ass='{ass}':fontsdir='{FONTS}'[v]" if ass else ";[v3]null[v]"
    sh(["ffmpeg", "-v", "error", "-y", "-ss", f"{ini:.2f}", "-t", f"{dur:.2f}", "-i", src, "-loop", "1", "-i", png,
        "-filter_complex", filtro, "-map", "[v]", "-map", "0:a?", "-t", f"{dur:.2f}",
        "-af", f"loudnorm=I=-14:TP=-1.5,afade=t=in:d=0.3,afade=t=out:st={dur - 0.5:.2f}:d=0.5",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", saida])
    return vy, vh


def hms(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{int(t % 60):02d}"


def main():
    ap = argparse.ArgumentParser(description="Cortador de lives de GTA 6 (só conteúdo liberado)")
    ap.add_argument("entrada", help="arquivo .mp4 da live ou link (Twitch/Kick/YouTube) com yt-dlp")
    ap.add_argument("--streamer", required=True, help="@ do streamer, vai na tela e na descrição")
    ap.add_argument("--autorizacao", required=True, help="link ou descrição da regra pública / autorização de cortes")
    ap.add_argument("--fonte", default="", help="link da live original (vai na descrição)")
    ap.add_argument("--pagina", default="", help="@ da sua página, aparece no rodapé")
    ap.add_argument("--cortes", type=int, default=3)
    ap.add_argument("--duracao", type=float, default=45, help="segundos por corte (20 a 60)")
    ap.add_argument("--chat", help="arquivo de chat com horários, para achar picos de reação")
    ap.add_argument("--titulos", nargs="*", help="títulos para os cortes, na ordem (opcional)")
    ap.add_argument("--modelo", default="small", help="modelo do faster-whisper para a legenda")
    ap.add_argument("--saida", default=os.path.join(HERE, "cortes"))
    a = ap.parse_args()

    dur = min(60, max(20, a.duracao))
    os.makedirs(a.saida, exist_ok=True)
    src = a.entrada
    if re.match(r"https?://", src):
        a.fonte = a.fonte or src
        src = baixar(src, a.saida)
    sw, sh_, total = probe(src)
    print(f"Live: {hms(total)}  {sw}x{sh_}")
    db, passo = energia(src)
    chat = chat_contagem(a.chat, total, passo) if a.chat else None
    cortes = acha_picos(db, passo, dur, a.cortes, chat, ignora_inicio=min(60, total * 0.05))
    if not cortes:
        sys.exit("Não achei picos. A live é curta demais?")
    nome = re.sub(r"\W+", "", a.streamer) or "live"
    tem_whisper = True
    try:
        import faster_whisper  # noqa
    except ImportError:
        tem_whisper = False
        print("Aviso: sem faster-whisper, os cortes saem sem legenda. Instale com:  pip install faster-whisper")

    for i, (ini, d, nota) in enumerate(cortes, 1):
        base = os.path.join(a.saida, f"{nome}_corte{i}")
        palavras = transcreve(src, ini, d, a.modelo) if tem_whisper else None
        if a.titulos and i <= len(a.titulos):
            titulo = a.titulos[i - 1]
        elif palavras:
            frase = " ".join(p for _, _, p in palavras[:12])
            titulo = textwrap.shorten(frase, 48, placeholder="...")
        else:
            titulo = "O MOMENTO MAIS INSANO DA LIVE"
        vh = min(int(W * sh_ / sw) // 2 * 2, 1150)
        vy = 560 if vh < 800 else 380
        png = base + "_layout.png"
        layout_png(png, titulo, a.streamer, a.pagina, vy, vh)
        ass = None
        if palavras:
            ass = base + ".ass"
            escreve_ass(palavras, ass, vy + vh + 260 if vy + vh + 360 < H - 200 else vy + vh - 140)
        renderiza(src, ini, d, sw, sh_, base + ".mp4", png, ass)
        tags = "#gta6 #gtavi #cortes #" + nome.lower()
        desc = (f"{titulo}\n\nCorte da live de {a.streamer} (trecho {hms(ini)} a {hms(ini + d)}).\n"
                + (f"Live completa: {a.fonte}\n" if a.fonte else "")
                + f"Corte publicado conforme a regra/autorização do criador: {a.autorizacao}\n"
                + f"Todos os direitos do conteúdo original são de {a.streamer}. Se quiser que este corte seja removido, é só avisar.\n\n{tags} #shorts")
        with open(base + ".txt", "w", encoding="utf-8") as f:
            f.write(f"TÍTULO: {textwrap.shorten(titulo, 90, placeholder='...')} | {a.streamer} #shorts\n\nDESCRIÇÃO:\n{desc}\n")
        for tmp in (png, ass):
            if tmp and os.path.exists(tmp):
                os.remove(tmp)
        print(f"Corte {i}: {hms(ini)} (+{int(d)}s, pico {nota:.1f})  ->  {base}.mp4")
    print("Pronto. Revise cada corte e o .txt antes de postar.")


if __name__ == "__main__":
    main()

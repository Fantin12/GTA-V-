#!/usr/bin/env python3
"""Monta o Short vertical (1080x1920) do canal com layout, legenda e narrador na tela.

Uso:
  python3 render.py                                   # prévia com cena ilustrativa
  python3 render.py --gameplay meu_clip.mp4           # com o seu gameplay
  python3 render.py --gameplay clip.mp4 --facecam cam.mp4 --canal @SeuCanal
"""
import argparse, math, random, subprocess, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
GX, GY, GW, GH = 40, 250, 1000, 960          # área do gameplay
PINK, TEAL, YEL = (255, 61, 127), (32, 214, 199), (255, 216, 74)

ap = argparse.ArgumentParser()
ap.add_argument("--audio", default=os.path.join(HERE, "narracao.mp3"))
ap.add_argument("--gameplay")
ap.add_argument("--facecam")
ap.add_argument("--canal", default="@SeuCanal")
ap.add_argument("--titulo", default="DETALHE INÚTIL")
ap.add_argument("--numero", default="#1")
ap.add_argument("--out", default=os.path.join(HERE, "short-detalhe-inutil-1.mp4"))
ap.add_argument("--segundos", type=float, default=0)
A = ap.parse_args()

F = lambda n, s: ImageFont.truetype(os.path.join(HERE, "fonts", n), s)
ANTON = lambda s: F("Anton.ttf", s)
MB = lambda s: F("Montserrat-ExtraBold.ttf", s)
MR = lambda s: F("Montserrat-Regular.ttf", s)

# ---------- áudio: duração e volume por quadro ----------
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", A.audio]))
if A.segundos: dur = min(dur, A.segundos)
N = int(dur * FPS)
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", A.audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"])
pcm = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = 16000 // FPS
rms = np.array([np.sqrt(np.mean(pcm[i*hop:(i+1)*hop]**2) + 1e-9) for i in range(N + 1)])
rms = np.nan_to_num(rms)
lvl = np.clip(rms / (np.percentile(rms, 95) + 1e-6), 0, 1)

# ---------- legenda: frases com início/fim (pausas medidas na narração) ----------
FRASES = [
    (0.10, 6.36, "A Rockstar fez isso só pra essa cena. Repara nessa poça: ela reflete o neon da rua inteira."),
    (6.67, 14.40, "Agora olha quando o carro passa... a água espirra e o reflexo se quebra! E não para aí: o pneu sai molhado e deixa a marca no asfalto."),
    (14.83, 16.39, "Ninguém para pra olhar isso..."),
    (16.72, 19.13, "mas alguém na Rockstar passou dias fazendo."),
    (19.52, 20.91, "Detalhe inútil número um."),
    (21.25, 22.24, "Você já tinha reparado?"),
    (22.56, 24.90, "Comenta qual detalhe eu testo no próximo vídeo!"),
]
DESTAQUE = {"rockstar", "poça", "neon", "carro", "água", "reflexo", "pneu", "marca", "ninguém", "dias", "inútil", "um.", "reparado?", "comenta", "próximo"}
words = []  # (ini, fim, palavra)
for a, b, txt in FRASES:
    ws = txt.split(); tot = sum(len(w) + 2 for w in ws); t = a
    for w in ws:
        d = (b - a) * (len(w) + 2) / tot; words.append((t, t + d, w)); t += d
groups = []  # até 3 palavras por tela, sem atravessar frase
for a, b, txt in FRASES:
    ws = [w for w in words if a - 1e-6 <= w[0] < b]
    for i in range(0, len(ws), 3):
        g = ws[i:i+3]; groups.append((g[0][0], g[-1][1], g))

# ---------- fundo fixo do layout ----------
def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w-1, h-1), r, fill=255); return m

base = Image.new("RGB", (W, H))
bd = ImageDraw.Draw(base)
for y in range(H):
    k = y / H
    bd.line([(0, y), (W, y)], fill=(int(14 + 20*k), int(10 + 6*(1-k)), int(30 + 14*k)))
glow = Image.new("RGB", (W, H)); gd = ImageDraw.Draw(glow)
gd.ellipse((-300, -200, 700, 700), fill=(90, 20, 60)); gd.ellipse((500, 1300, 1400, 2200), fill=(10, 70, 75))
base = Image.blend(base, glow.filter(ImageFilter.GaussianBlur(160)), 0.55)
# moldura neon do gameplay
neon = Image.new("RGB", (W, H)); nd = ImageDraw.Draw(neon)
nd.rounded_rectangle((GX-6, GY-6, GX+GW+6, GY+GH+6), 42, outline=PINK, width=10)
base = Image.composite(Image.new("RGB", (W, H), PINK), base, neon.convert("L").filter(ImageFilter.GaussianBlur(18)).point(lambda v: min(255, v*2)))
bd = ImageDraw.Draw(base)
bd.rounded_rectangle((GX-4, GY-4, GX+GW+4, GY+GH+4), 40, outline=(255, 140, 180), width=4)
# cabeçalho
tf = ANTON(118); tw = bd.textlength(A.titulo, font=tf)
nf = ANTON(118); nw = bd.textlength(A.numero, font=nf)
x0 = (W - tw - nw - 40) / 2
bd.text((x0 + 6, 62 + 6), A.titulo, font=tf, fill=PINK)
bd.text((x0, 62), A.titulo, font=tf, fill="white")
bx = x0 + tw + 24
bd.rounded_rectangle((bx, 78, bx + nw + 28, 200), 22, fill=YEL)
bd.text((bx + 14, 62), A.numero, font=nf, fill=(20, 14, 20))
# cartão do narrador
CY0, CY1 = 1290, 1680
card = Image.new("RGBA", (W, H), (0, 0, 0, 0)); cd = ImageDraw.Draw(card)
cd.rounded_rectangle((40, CY0, W-40, CY1), 44, fill=(255, 255, 255, 22), outline=(255, 255, 255, 60), width=2)
base = Image.alpha_composite(base.convert("RGBA"), card).convert("RGB"); bd = ImageDraw.Draw(base)
AVX, AVY, AVR = 230, (CY0 + CY1)//2, 145
bd.ellipse((AVX-AVR-10, AVY-AVR-10, AVX+AVR+10, AVY+AVR+10), outline=TEAL, width=8)
bd.text((430, CY0 + 70), A.canal, font=MB(56), fill="white")
bd.text((430, CY0 + 146), "narrando agora", font=MR(36), fill=(210, 205, 220))
bd.ellipse((398, CY0 + 160, 418, CY0 + 180), fill=(255, 70, 70))
bd.text((W//2, 1745), "Cenas ilustrativas", font=MR(30), fill=(170, 165, 185), anchor="mm")
BASE = base

# ---------- cena ilustrativa (prévia sem gameplay) ----------
rnd = random.Random(7)
HOR = 430
def make_scene():
    s = Image.new("RGB", (GW, GH)); d = ImageDraw.Draw(s)
    for y in range(HOR):
        k = y / HOR
        d.line([(0, y), (GW, y)], fill=(int(20 + 120*k**2), int(12 + 20*k), int(48 + 50*k)))
    d.ellipse((620, 60, 760, 200), fill=(255, 220, 230))
    s = Image.blend(s, s.filter(ImageFilter.GaussianBlur(30)), 0.5); d = ImageDraw.Draw(s)
    x = -20
    while x < GW:
        bw = rnd.randint(70, 150); bh = rnd.randint(120, 330); top = HOR - bh
        c = rnd.choice([(24, 20, 44), (30, 24, 54), (20, 26, 46)])
        d.rectangle((x, top, x + bw, HOR), fill=c)
        for wy in range(top + 14, HOR - 10, 22):
            for wx in range(x + 10, x + bw - 10, 18):
                if rnd.random() < 0.35:
                    d.rectangle((wx, wy, wx + 8, wy + 10), fill=rnd.choice([(255, 210, 140), (255, 120, 190), (120, 240, 230)]))
        if rnd.random() < 0.5:
            nc = rnd.choice([PINK, TEAL]); ny = top + rnd.randint(20, 60)
            d.rounded_rectangle((x + 12, ny, x + bw - 12, ny + 26), 13, outline=nc, width=5)
        x += bw + rnd.randint(0, 12)
    for px in (90, 860):  # palmeiras
        pts = [(px + 10*math.sin(i/6), HOR - i*9) for i in range(30)]
        d.line(pts, fill=(10, 8, 20), width=16)
        tx, ty = pts[-1]
        for a in range(0, 360, 40):
            r = math.radians(a)
            d.polygon([(tx, ty), (tx + 120*math.cos(r) - 10, ty + 60*math.sin(r) + 30), (tx + 120*math.cos(r) + 10, ty + 60*math.sin(r) + 45)], fill=(10, 8, 20))
    # chão molhado com reflexo
    top = s.crop((0, 0, GW, HOR))
    refl = top.transpose(Image.FLIP_TOP_BOTTOM).resize((GW, GH - HOR)).filter(ImageFilter.GaussianBlur(4))
    asphalt = Image.new("RGB", (GW, GH - HOR), (16, 14, 24))
    s.paste(Image.blend(asphalt, refl, 0.42), (0, HOR))
    d = ImageDraw.Draw(s)
    for i in range(6):
        d.rectangle((i*200 + 40, 700, i*200 + 140, 712), fill=(200, 190, 160))
    return s, refl
SCENE, REFL = make_scene()
PUD = (300, 560, 760, 690)
pm = Image.new("L", (GW, GH), 0); ImageDraw.Draw(pm).ellipse(PUD, fill=255); PMASK = pm.filter(ImageFilter.GaussianBlur(10))
drops = [(rnd.uniform(0, GW), rnd.uniform(0, GH), rnd.uniform(28, 46)) for _ in range(260)]
splash = [(rnd.uniform(-1, 1), rnd.uniform(0.6, 1.4)) for _ in range(90)]

def scene_frame(t):
    s = SCENE.copy()
    # poça: reflexo nítido que se quebra quando o carro passa
    amp = 2 + (22 * max(0, 1 - abs(t - 8.6)/2.2) if 6.4 < t < 11 else 0)
    pr = Image.new("RGB", (GW, GH))
    band = REFL.resize((GW, GH - HOR))
    for yy in range(0, GH - HOR, 6):
        off = int(amp * math.sin(yy/9 + t*6))
        pr.paste(band.crop((0, yy, GW, yy + 6)), (off, HOR + yy))
    pr = Image.blend(pr, Image.new("RGB", (GW, GH), (30, 20, 50)), 0.15)
    s = Image.composite(pr, s, PMASK); d = ImageDraw.Draw(s)
    # marcas de pneu
    if t > 8.4:
        a = max(0, 1 - (t - 9.5) / 7)
        for oy in (630, 676):
            x1 = min(GW, 470 + (t - 8.4) * 520)
            d.line([(470, oy), (x1, oy)], fill=(int(16 + 10*(1-a)), int(14 + 10*(1-a)), int(24 + 12*(1-a))), width=int(14*a) + 1)
    # carro
    if 6.6 < t < 11.2:
        cx = -320 + (t - 6.6) / 4.6 * (GW + 640); cy = 620
        d.polygon([(cx, cy), (cx + 40, cy - 46), (cx + 150, cy - 84), (cx + 250, cy - 84), (cx + 320, cy - 40), (cx + 340, cy), (cx + 340, cy + 30), (cx, cy + 30)], fill=(244, 170, 200))
        d.polygon([(cx + 160, cy - 76), (cx + 244, cy - 76), (cx + 300, cy - 40), (cx + 120, cy - 40)], fill=(30, 26, 44))
        for wx in (cx + 70, cx + 270):
            d.ellipse((wx - 34, cy - 4, wx + 34, cy + 64), fill=(12, 10, 16)); d.ellipse((wx - 14, cy + 16, wx + 14, cy + 44), fill=(150, 150, 160))
        d.ellipse((cx + 318, cy - 14, cx + 346, cy + 4), fill=(255, 250, 220))
        d.polygon([(cx + 340, cy - 6), (cx + 640, cy - 60), (cx + 640, cy + 60)], fill=(70, 60, 70))
        if 300 < cx + 170 < 820:
            k = 1 - abs(cx + 170 - 560) / 260
            for dx, sp in splash:
                px = cx + 170 + dx*120*sp; py = cy + 40 - 160*k*sp*abs(math.sin(dx*3))
                d.ellipse((px - 5, py - 5, px + 5, py + 5), fill=(190, 225, 255))
    # chuva
    for x, y, L in drops:
        yy = (y + t*1400) % (GH + 60) - 60
        d.line([(x - 6, yy), (x, yy + L)], fill=(170, 190, 230), width=2)
    # leve zoom contínuo
    z = 1 + 0.06 * t / max(dur, 1)
    cw, ch = int(GW / z), int(GH / z)
    return s.crop(((GW - cw)//2, (GH - ch)//2, (GW + cw)//2, (GH + ch)//2)).resize((GW, GH))

# ---------- leitores de vídeo (gameplay / facecam) ----------
def reader(path, w, h):
    cmd = ["ffmpeg", "-v", "error", "-stream_loop", "-1", "-i", path, "-vf", f"fps={FPS},scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    return lambda: Image.frombytes("RGB", (w, h), p.stdout.read(w*h*3))
gp = reader(A.gameplay, GW, GH) if A.gameplay else None
fc = reader(A.facecam, AVR*2, AVR*2) if A.facecam else None
GMASK = rounded_mask(GW, GH, 38)
AMASK = Image.new("L", (AVR*2, AVR*2), 0); ImageDraw.Draw(AMASK).ellipse((0, 0, AVR*2-1, AVR*2-1), fill=255)

# ---------- narrador ilustrado ----------
def avatar(t, v):
    a = Image.new("RGB", (AVR*2, AVR*2), (40, 30, 70)); d = ImageDraw.Draw(a)
    d.ellipse((-60, 130, 350, 520), fill=(255, 80, 140))        # moletom
    d.rectangle((120, 160, 170, 220), fill=(196, 132, 96))       # pescoço
    bob = int(4 * math.sin(t*3) + v*4)
    d.ellipse((70, 40 + bob, 220, 200 + bob), fill=(214, 150, 110))  # rosto
    d.chord((62, 22 + bob, 228, 150 + bob), 180, 360, fill=(30, 24, 30))  # cabelo
    d.arc((48, 60 + bob, 242, 230 + bob), 200, 340, fill=(20, 20, 26), width=14)  # headset
    d.ellipse((38, 112 + bob, 78, 166 + bob), fill=(20, 20, 26)); d.ellipse((212, 112 + bob, 252, 166 + bob), fill=(20, 20, 26))
    d.line([(70, 150 + bob), (110, 186 + bob)], fill=(20, 20, 26), width=6); d.ellipse((104, 180 + bob, 120, 196 + bob), fill=TEAL)
    blink = (t % 3.7) < 0.12
    for ex in (118, 172):
        if blink: d.line([(ex - 10, 112 + bob), (ex + 10, 112 + bob)], fill=(30, 20, 20), width=4)
        else: d.ellipse((ex - 9, 104 + bob, ex + 9, 122 + bob), fill=(30, 20, 20))
    d.line([(104, 92 + bob), (130, 88 + bob)], fill=(30, 24, 30), width=6); d.line([(160, 88 + bob), (186, 92 + bob)], fill=(30, 24, 30), width=6)
    mo = int(4 + 26 * v)
    d.ellipse((128, 150 + bob - mo//3, 162, 154 + bob + mo//1.5), fill=(90, 30, 40))
    return a

# ---------- quadro a quadro ----------
CAPF = ANTON(92)
def caption(img, t):
    g = next((g for g in groups if g[0] <= t < g[1] + 0.15), None)
    if not g: return
    d = ImageDraw.Draw(img)
    parts = [w[2].upper() for w in g[2]]
    sp = d.textlength(" ", font=CAPF); total = sum(d.textlength(p, font=CAPF) for p in parts) + sp*(len(parts)-1)
    if total > GW - 60:
        f = ANTON(int(92 * (GW - 60) / total)); sp *= (GW - 60)/total
    else: f = CAPF
    total = sum(d.textlength(p, font=f) for p in parts) + sp*(len(parts)-1)
    x = (W - total)/2; y = GY + GH - 210
    pop = min(1, (t - g[0]) / 0.12)
    for w, p in zip(g[2], parts):
        on = w[0] <= t < w[1] + 0.05
        col = YEL if on else ("white" if p.strip(".,!?:").lower() not in DESTAQUE else (255, 150, 190))
        d.text((x, y + (1 - pop)*20), p, font=f, fill=col, stroke_width=9, stroke_fill=(10, 6, 14))
        x += d.textlength(p, font=f) + sp

ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-i", A.audio, "-t", f"{dur:.2f}", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", A.out], stdin=subprocess.PIPE)
for i in range(N):
    t = i / FPS; v = float(np.mean(lvl[max(0, i-1):i+2]))
    img = BASE.copy()
    g = gp() if gp else scene_frame(t)
    img.paste(g, (GX, GY), GMASK)
    if not gp:
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((GX + 24, GY + 24, GX + 330, GY + 76), 26, fill=(0, 0, 0))
        d.text((GX + 46, GY + 31), "PRÉVIA ILUSTRATIVA", font=MB(26), fill="white")
    face = fc() if fc else avatar(t, v)
    img.paste(face, (AVX - AVR, AVY - AVR), AMASK)
    d = ImageDraw.Draw(img)
    # ondas da voz
    for k in range(14):
        h = 8 + 70 * v * (0.5 + 0.5*abs(math.sin(k*1.7 + t*9)))
        x = 430 + k*36
        d.rounded_rectangle((x, CY0 + 290 - h/2, x + 20, CY0 + 290 + h/2), 10, fill=TEAL if k % 2 else PINK)
    caption(img, t)
    # barra de progresso
    d.rounded_rectangle((60, 1800, W - 60, 1816), 8, fill=(255, 255, 255, 40))
    d.rounded_rectangle((60, 1800, 60 + (W - 120) * (i + 1)/N, 1816), 8, fill=PINK)
    if t > dur - 3.2:
        s = 1 + 0.04*math.sin(t*10)
        bw, bh = 520*s, 92*s
        d.rounded_rectangle((W/2 - bw/2, 1215 - bh/2 + 30, W/2 + bw/2, 1215 + bh/2 + 30), 46, fill=YEL)
        d.text((W/2, 1245), "COMENTA AÍ  👇".replace("👇", "").strip(), font=ANTON(int(58*s)), fill=(20, 14, 20), anchor="mm")
    ff.stdin.write(img.tobytes())
ff.stdin.close(); ff.wait()
print("pronto:", A.out)

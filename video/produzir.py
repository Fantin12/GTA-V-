#!/usr/bin/env python3
"""Produz um Short vertical (1080x1920) a partir de um roteiro e da narração.

Diferente do render.py (feito para o Detalhe Inútil #1), este é genérico:
- a legenda é sincronizada sozinha: o texto do roteiro é distribuído pelos
  trechos com voz da narração (as pausas são detectadas com o ffmpeg);
- a cena ilustrativa é escolhida com --cena (portal, patch);
- título, selo, chamada final e narrador vêm por parâmetro.

Uso:
  python3 produzir.py --roteiro roteiros/portal.txt --audio narracao-portal.mp3 \
      --cena portal --titulo "PORTAL SECRETO" --selo "GTA 6" --cta "VOCÊ JÁ ACHOU?" \
      --out short-portal.mp4
"""
import argparse, math, os, random, re, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
GX, GY, GW, GH = 40, 250, 1000, 960
PINK, TEAL, YEL = (255, 61, 127), (32, 214, 199), (255, 216, 74)

ap = argparse.ArgumentParser()
ap.add_argument("--roteiro", required=True)
ap.add_argument("--audio", required=True)
ap.add_argument("--cena", default="portal", choices=["portal", "patch"])
ap.add_argument("--titulo", default="CURIOSIDADE")
ap.add_argument("--selo", default="GTA 6")
ap.add_argument("--cta", default="COMENTA AÍ")
ap.add_argument("--canal", default="@SeuCanal")
ap.add_argument("--itens", nargs="*", default=[], help="itens da cena patch")
ap.add_argument("--out", required=True)
A = ap.parse_args()

F = lambda n, s: ImageFont.truetype(os.path.join(HERE, "fonts", n), s)
ANTON = lambda s: F("Anton.ttf", s)
MB = lambda s: F("Montserrat-ExtraBold.ttf", s)
MR = lambda s: F("Montserrat-Regular.ttf", s)

# ---------------- áudio
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", A.audio]))
N = int(dur * FPS)
raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", A.audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"])
pcm = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = 16000 // FPS
rms = np.nan_to_num(np.array([np.sqrt(np.mean(pcm[i*hop:(i+1)*hop]**2)) if i*hop < len(pcm) else 0 for i in range(N + 2)]))
lvl = np.clip(rms / (np.percentile(rms, 95) + 1e-6), 0, 1)

# ---------------- legenda sincronizada pelas pausas
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", A.audio, "-af", "silencedetect=noise=-35dB:d=0.2", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
voz, t0 = [], 0.0
for a, b in zip(ss, se + [dur] * (len(ss) - len(se))):
    if a - t0 > 0.15:
        voz.append((t0, a))
    t0 = b
if dur - t0 > 0.15:
    voz.append((t0, dur))
texto = re.sub(r"\[[^\]]*\]", " ", open(A.roteiro, encoding="utf-8").read())
ws = texto.split()
pesos = np.array([len(w) + 2 + (6 if w[-1] in ".!?" else 3 if w[-1] in ",:" else 0) for w in ws], float)
total_voz = sum(b - a for a, b in voz)
def tempo_voz(x):  # x em segundos de voz acumulada -> tempo real
    for a, b in voz:
        if x <= b - a:
            return a + x
        x -= b - a
    return voz[-1][1]
cum = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * total_voz
words = [(tempo_voz(cum[i]), tempo_voz(cum[i + 1] - 1e-3), w) for i, w in enumerate(ws)]
groups = []
for i in range(0, len(words), 3):
    g = words[i:i + 3]
    # não junta palavras de frases diferentes no mesmo grupo
    for k, w in enumerate(g[:-1]):
        if w[2][-1] in ".!?":
            g = g[:k + 1]
            break
    groups.append(g)
# refaz agrupamento respeitando o corte de frase
groups, i = [], 0
while i < len(words):
    g = [words[i]]
    while len(g) < 3 and i + len(g) < len(words) and g[-1][2][-1] not in ".!?":
        g.append(words[i + len(g)])
    groups.append(g)
    i += len(g)
def quando(*chaves):
    for a, b, w in words:
        if any(c in w.lower() for c in chaves):
            return a
    return None
DESTAQUE = {"portal", "2002", "sério!", "ruínas.", "doze", "pixelado!", "bonés,", "j", "l.", "mario", "luigi!", "achou?",
            "patch", "travamentos,", "clima", "procurado", "lucia", "bug", "comenta"}

# ---------------- layout fixo
def rounded_mask(w, h, r):
    m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255); return m
base = Image.new("RGB", (W, H)); bd = ImageDraw.Draw(base)
for y in range(H):
    k = y / H
    bd.line([(0, y), (W, y)], fill=(int(14 + 20*k), int(10 + 6*(1-k)), int(30 + 14*k)))
glow = Image.new("RGB", (W, H)); gd = ImageDraw.Draw(glow)
gd.ellipse((-300, -200, 700, 700), fill=(90, 20, 60)); gd.ellipse((500, 1300, 1400, 2200), fill=(10, 70, 75))
base = Image.blend(base, glow.filter(ImageFilter.GaussianBlur(160)), 0.55)
neon = Image.new("L", (W, H)); ImageDraw.Draw(neon).rounded_rectangle((GX-6, GY-6, GX+GW+6, GY+GH+6), 42, outline=255, width=10)
base = Image.composite(Image.new("RGB", (W, H), PINK), base, neon.filter(ImageFilter.GaussianBlur(18)).point(lambda v: min(255, v*2)))
bd = ImageDraw.Draw(base)
bd.rounded_rectangle((GX-4, GY-4, GX+GW+4, GY+GH+4), 40, outline=(255, 140, 180), width=4)
tam = 118
while True:
    tf = ANTON(tam); tw = bd.textlength(A.titulo, font=tf); nw = bd.textlength(A.selo, font=ANTON(int(tam*0.62)))
    if tw + nw + 70 < W - 80 or tam < 70: break
    tam -= 6
x0 = (W - tw - nw - 70) / 2
bd.text((x0 + 6, 62 + 6), A.titulo, font=tf, fill=PINK); bd.text((x0, 62), A.titulo, font=tf, fill="white")
bx = x0 + tw + 24; sf = ANTON(int(tam*0.62))
bd.rounded_rectangle((bx, 92, bx + nw + 30, 92 + tam*0.82), 20, fill=YEL)
bd.text((bx + 15, 92 + tam*0.41), A.selo, font=sf, fill=(20, 14, 20), anchor="lm")
CY0, CY1 = 1290, 1680
card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(card).rounded_rectangle((40, CY0, W-40, CY1), 44, fill=(255, 255, 255, 22), outline=(255, 255, 255, 60), width=2)
base = Image.alpha_composite(base.convert("RGBA"), card).convert("RGB"); bd = ImageDraw.Draw(base)
AVX, AVY, AVR = 230, (CY0 + CY1)//2, 145
bd.ellipse((AVX-AVR-10, AVY-AVR-10, AVX+AVR+10, AVY+AVR+10), outline=TEAL, width=8)
bd.text((430, CY0 + 70), A.canal, font=MB(56), fill="white")
bd.text((430, CY0 + 146), "narrando agora", font=MR(36), fill=(210, 205, 220))
bd.ellipse((398, CY0 + 160, 418, CY0 + 180), fill=(255, 70, 70))
bd.text((W//2, 1745), "Cenas ilustrativas · narração com voz de IA", font=MR(28), fill=(170, 165, 185), anchor="mm")
BASE = base
GMASK = rounded_mask(GW, GH, 38)
AMASK = Image.new("L", (AVR*2, AVR*2), 0); ImageDraw.Draw(AMASK).ellipse((0, 0, AVR*2-1, AVR*2-1), fill=255)

# ---------------- narrador ilustrado
def avatar(t, v):
    a = Image.new("RGB", (AVR*2, AVR*2), (40, 30, 70)); d = ImageDraw.Draw(a)
    d.ellipse((-60, 130, 350, 520), fill=(255, 80, 140)); d.rectangle((120, 160, 170, 220), fill=(196, 132, 96))
    bob = int(4*math.sin(t*3) + v*4)
    d.ellipse((70, 40+bob, 220, 200+bob), fill=(214, 150, 110))
    d.chord((62, 22+bob, 228, 150+bob), 180, 360, fill=(30, 24, 30))
    d.arc((48, 60+bob, 242, 230+bob), 200, 340, fill=(20, 20, 26), width=14)
    d.ellipse((38, 112+bob, 78, 166+bob), fill=(20, 20, 26)); d.ellipse((212, 112+bob, 252, 166+bob), fill=(20, 20, 26))
    d.line([(70, 150+bob), (110, 186+bob)], fill=(20, 20, 26), width=6); d.ellipse((104, 180+bob, 120, 196+bob), fill=TEAL)
    blink = (t % 3.7) < 0.12
    for ex in (118, 172):
        if blink: d.line([(ex-10, 112+bob), (ex+10, 112+bob)], fill=(30, 20, 20), width=4)
        else: d.ellipse((ex-9, 104+bob, ex+9, 122+bob), fill=(30, 20, 20))
    mo = int(4 + 26*v)
    d.ellipse((128, 150+bob-mo//3, 162, 154+bob+mo//1.5), fill=(90, 30, 40))
    return a

# ---------------- cena: portal
rnd = random.Random(11)
T_PIX = quando("pixelado") or dur*0.5
T_CAPS = quando("bloco") or dur*0.7
T_PORTAL = 0.6
def cena_floresta():
    s = Image.new("RGB", (GW, GH)); d = ImageDraw.Draw(s)
    for y in range(GH):
        k = y / GH
        d.line([(0, y), (GW, y)], fill=(int(10 + 40*k), int(20 + 30*k), int(40 + 30*k)))
    d.ellipse((760, 80, 870, 190), fill=(230, 240, 220))
    s = Image.blend(s, s.filter(ImageFilter.GaussianBlur(25)), 0.5); d = ImageDraw.Draw(s)
    for layer, (col, hmin, hmax) in enumerate([((22, 40, 48), 380, 560), ((12, 24, 30), 460, 700)]):
        x = -40
        while x < GW + 40:
            h = rnd.randint(hmin, hmax); top = 700 - h
            d.polygon([(x, 700), (x + 40, top), (x + 80, 700)], fill=col)
            for k in range(6):
                yy = top + 40 + k*h/7
                d.polygon([(x + 40, yy - 20), (x - 10 - k*4, yy + 40), (x + 90 + k*4, yy + 40)], fill=col)
            x += rnd.randint(60, 110)
    # ruínas
    for cx, hh in ((260, 260), (360, 180), (640, 230), (740, 290)):
        d.rectangle((cx - 32, 700 - hh, cx + 32, 700), fill=(74, 70, 96))
        d.rectangle((cx - 40, 700 - hh, cx + 40, 700 - hh + 22), fill=(92, 88, 116))
        d.polygon([(cx - 32, 700 - hh), (cx - 10, 700 - hh - 26), (cx + 12, 700 - hh)], fill=(74, 70, 96))
    d.rectangle((300, 420, 700, 450), fill=(92, 88, 116))
    # água do pântano
    agua = s.crop((0, 300, GW, 700)).transpose(Image.FLIP_TOP_BOTTOM).resize((GW, GH - 700)).filter(ImageFilter.GaussianBlur(5))
    s.paste(Image.blend(Image.new("RGB", agua.size, (8, 18, 24)), agua, 0.5), (0, 700))
    return s
FLORESTA = cena_floresta()
vagalumes = [(rnd.uniform(0, GW), rnd.uniform(300, 900), rnd.uniform(0, 6.28)) for _ in range(40)]
def club():
    s = Image.new("RGB", (100, 96)); d = ImageDraw.Draw(s)
    for y in range(96):
        d.line([(0, y), (100, y)], fill=(40 + y, 10, 60 + y//2))
    for i in range(-10, 12):
        d.line([(50, 50), (50 + i*12, 96)], fill=(255, 60, 160))
    for y in (60, 70, 82):
        d.line([(0, y), (100, y)], fill=(255, 60, 160))
    d.rectangle((25, 14, 75, 26), outline=(40, 230, 220), width=2)
    d.rectangle((30, 18, 70, 22), fill=(255, 220, 90))
    d.ellipse((46, 54, 54, 62), fill=(240, 200, 160)); d.rectangle((45, 62, 55, 78), fill=(255, 255, 255))
    for px in (8, 88):
        d.line([(px, 96), (px + 2, 40)], fill=(20, 10, 30), width=3)
        for a in range(0, 360, 60):
            d.line([(px + 2, 40), (px + 2 + 12*math.cos(math.radians(a)), 40 + 6*math.sin(math.radians(a)))], fill=(20, 10, 30), width=2)
    return s.resize((GW, GH), Image.NEAREST)
CLUB = club()
def portal(s, t, r):
    d = ImageDraw.Draw(s, "RGBA"); cx, cy = 500, 560
    g = Image.new("RGBA", (GW, GH), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    gd.ellipse((cx - r*1.5, cy - r*1.9, cx + r*1.5, cy + r*1.9), fill=(255, 60, 160, 90))
    s.paste(g.filter(ImageFilter.GaussianBlur(40)), (0, 0), g.filter(ImageFilter.GaussianBlur(40)))
    d = ImageDraw.Draw(s)
    for k in range(18):
        rr = r * (1 - k/20)
        if rr < 4: break
        col = [PINK, TEAL, YEL][k % 3]
        st = (t*240*(1 if k % 2 else -1) + k*37) % 360
        d.arc((cx - rr*0.8, cy - rr, cx + rr*0.8, cy + rr), st, st + 220, fill=col, width=6)
    d.ellipse((cx - r*0.25, cy - r*0.3, cx + r*0.25, cy + r*0.3), fill=(255, 240, 250))
def bones(s, t):
    d = ImageDraw.Draw(s); k = t - T_CAPS
    by = 330 - 14*max(0, math.sin(min(k, 0.3)*10))
    d.rounded_rectangle((440, by - 60, 560, by + 60), 10, fill=(240, 170, 40), outline=(120, 70, 10), width=6)
    d.text((500, by), "?", font=ANTON(90), fill="white", anchor="mm")
    for i, (letra, cor, dx) in enumerate((("J", (220, 40, 50), -190), ("L", (40, 170, 70), 190))):
        p = min(1, max(0, (k - 0.3 - i*0.25) / 0.5))
        if p <= 0: continue
        x = 500 + dx*p; y = by - 40 - 200*math.sin(p*math.pi*0.9) + 260*p
        d.chord((x - 90, y - 70, x + 90, y + 80), 180, 360, fill=cor)
        d.ellipse((x - 20, y - 40, x + 110, y + 20), fill=cor)
        d.ellipse((x - 40, y - 52, x + 40, y + 2), fill="white")
        d.text((x, y - 26), letra, font=ANTON(56), fill=cor, anchor="mm")
def cena_portal(t):
    if T_PIX - 0.4 < t < T_CAPS - 0.3:
        s = CLUB.copy()
        if t < T_PIX + 0.2:  # clarão de transição
            s = Image.blend(s, Image.new("RGB", (GW, GH), "white"), max(0, 1 - (t - (T_PIX - 0.4)) / 0.6))
        return s
    s = FLORESTA.copy()
    r = 0 if t < T_PORTAL else min(1, (t - T_PORTAL) / 2.5) * 190
    if r > 0: portal(s, t, r + 6*math.sin(t*5))
    d = ImageDraw.Draw(s)
    for x, y, ph in vagalumes:
        a = 0.5 + 0.5*math.sin(t*3 + ph)
        d.ellipse((x - 3, y - 3 + 10*math.sin(t + ph), x + 3, y + 3 + 10*math.sin(t + ph)), fill=(int(200*a + 50), int(255*a), int(120*a)))
    if t >= T_CAPS - 0.3: bones(s, t)
    z = 1 + 0.25 * min(1, t / max(T_PIX, 1)) if t < T_PIX else 1.05
    cw, ch = int(GW / z), int(GH / z)
    return s.crop(((GW - cw)//2, int((GH - ch)*0.58), (GW + cw)//2, int((GH - ch)*0.58) + ch)).resize((GW, GH))

# ---------------- cena: patch (lista de correções aparecendo)
def cena_patch(t):
    s = Image.new("RGB", (GW, GH), (16, 22, 40)); d = ImageDraw.Draw(s)
    for y in range(0, GH, 40):
        d.line([(0, y), (GW, y)], fill=(22, 30, 52))
    d.rounded_rectangle((60, 60, GW - 60, 170), 24, fill=(30, 40, 70))
    d.text((100, 115), "NOTAS DO PATCH", font=ANTON(64), fill="white", anchor="lm")
    itens = A.itens or ["Travamentos", "Clima parado", "Salvamento automático", "Estrela de procurado", "Ligações da história", "Bug da Lucia"]
    seg = (dur - 4) / len(itens)
    for i, it in enumerate(itens):
        ti = 2 + i*seg
        if t < ti: break
        p = min(1, (t - ti) / 0.3); y = 220 + i*120
        ok = not it.lower().startswith("bug")
        d.rounded_rectangle((60 + (1-p)*200, y, GW - 60, y + 100), 20, fill=(28, 50, 50) if ok else (70, 24, 36))
        d.text((110 + (1-p)*200, y + 50), it, font=MB(44), fill="white", anchor="lm")
        d.text((GW - 110, y + 50), "OK" if ok else "!", font=ANTON(60), fill=TEAL if ok else PINK, anchor="mm")
    return s

CENA = cena_portal if A.cena == "portal" else cena_patch

# ---------------- montagem
CAPF = ANTON(92)
def caption(img, t):
    g = next((g for g in groups if g[0][0] <= t < g[-1][1] + 0.12), None)
    if not g: return
    d = ImageDraw.Draw(img); parts = [w[2].upper() for w in g]
    sp = d.textlength(" ", font=CAPF); total = sum(d.textlength(p, font=CAPF) for p in parts) + sp*(len(parts)-1)
    f = CAPF if total <= GW - 60 else ANTON(int(92*(GW - 60)/total))
    sp = d.textlength(" ", font=f); total = sum(d.textlength(p, font=f) for p in parts) + sp*(len(parts)-1)
    x = (W - total)/2; y = GY + GH - 200; pop = min(1, (t - g[0][0]) / 0.12)
    for w, p in zip(g, parts):
        on = w[0] <= t < w[1] + 0.05
        col = YEL if on else ((255, 150, 190) if w[2].lower() in DESTAQUE else "white")
        d.text((x, y + (1 - pop)*20), p, font=f, fill=col, stroke_width=9, stroke_fill=(10, 6, 14))
        x += d.textlength(p, font=f) + sp

ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-i", A.audio, "-t", f"{dur:.2f}", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", A.out], stdin=subprocess.PIPE)
for i in range(N):
    t = i / FPS; v = float(np.mean(lvl[max(0, i-1):i+2]))
    img = BASE.copy()
    img.paste(CENA(t), (GX, GY), GMASK)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((GX + 24, GY + 24, GX + 300, GY + 76), 26, fill=(0, 0, 0))
    d.text((GX + 46, GY + 31), "CENA ILUSTRATIVA", font=MB(26), fill="white")
    img.paste(avatar(t, v), (AVX - AVR, AVY - AVR), AMASK)
    d = ImageDraw.Draw(img)
    for k in range(14):
        h = 8 + 70*v*(0.5 + 0.5*abs(math.sin(k*1.7 + t*9)))
        x = 430 + k*36
        d.rounded_rectangle((x, CY0 + 290 - h/2, x + 20, CY0 + 290 + h/2), 10, fill=TEAL if k % 2 else PINK)
    caption(img, t)
    d.rounded_rectangle((60, 1800, W - 60, 1816), 8, fill=(60, 55, 75))
    d.rounded_rectangle((60, 1800, 60 + (W - 120)*(i + 1)/N, 1816), 8, fill=PINK)
    if t > dur - 3:
        s = 1 + 0.04*math.sin(t*10); bw, bh = 560*s, 92*s
        d.rounded_rectangle((W/2 - bw/2, 1245 - bh/2, W/2 + bw/2, 1245 + bh/2), 46, fill=YEL)
        d.text((W/2, 1245), A.cta, font=ANTON(int(58*s)), fill=(20, 14, 20), anchor="mm")
    ff.stdin.write(img.tobytes())
ff.stdin.close(); ff.wait()
print("pronto:", A.out)

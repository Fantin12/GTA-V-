"""Monta o EP1 de A Coroa de Varnor: Ken Burns + tremor + legendas + narração."""
import subprocess, os
from PIL import Image, ImageDraw, ImageFont

D = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 30
FONT = os.path.join(D, "fonts", "Anton.ttf")
YEL = (255, 212, 0)

# (imagem, inicio, fim, movimento)
CENAS = [
    ("cenas/c1.png", 0.0, 3.0, "in"),
    ("cenas/c2.png", 3.0, 6.0, "down"),
    ("cenas/c3.png", 6.0, 8.7, "in"),
    ("cenas/c4.png", 8.7, 11.3, "shake"),
    ("cenas/c5.png", 11.3, 15.2, "out"),
]
END = 2.3  # tela final
TOTAL = CENAS[-1][2] + END

# legendas: (inicio, fim, [(texto, amarelo?)...])
LEG = [
    (0.1, 3.0, [("TODO MUNDO", False), ("FUGIU", True)]),
    (3.0, 6.0, [("ELAS", False), ("DESCERAM", True)]),
    (6.1, 7.6, [("UM GUARDA...", False)]),
    (7.6, 8.7, [("E UM", False), ("GATO", True)]),
    (8.8, 11.3, [("NINGUÉM", False), ("PASSA", True)]),
    (11.5, 12.9, [("ELE NÃO FUGIU.", False)]),
    (13.0, 15.2, [("ELE", False), ("FICOU", True)]),
]


def caption_png(path, parts, size=150):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FONT, size)
    # quebra em linhas se passar da largura
    words = []
    for t, y in parts:
        words += [(w, y) for w in t.split(" ")]
    lines, cur = [], []
    for w in words:
        test = cur + [w]
        tw = d.textlength(" ".join(x for x, _ in test), font=f)
        if tw > W - 140 and cur:
            lines.append(cur); cur = [w]
        else:
            cur = test
    lines.append(cur)
    lh = int(size * 1.15)
    y0 = int(H * 0.68) - (len(lines) * lh) // 2
    sp = d.textlength(" ", font=f)
    for i, line in enumerate(lines):
        tw = sum(d.textlength(w, font=f) for w, _ in line) + sp * (len(line) - 1)
        x = (W - tw) / 2
        for w, yel in line:
            # sombra
            d.text((x + 6, y0 + i * lh + 8), w, font=f, fill=(0, 0, 0, 160))
            d.text((x, y0 + i * lh), w, font=f, fill=YEL if yel else (255, 255, 255),
                   stroke_width=10, stroke_fill=(0, 0, 0))
            x += d.textlength(w, font=f) + sp
    img.save(path)


def endcard(path):
    img = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    f1 = ImageFont.truetype(FONT, 190)
    f2 = ImageFont.truetype(FONT, 80)
    for txt, f, y, col in [("PARTE 1", f1, H * 0.42, YEL), ("A COROA DE VARNOR", f2, H * 0.55, (255, 255, 255))]:
        tw = d.textlength(txt, font=f)
        d.text(((W - tw) / 2, y), txt, font=f, fill=col)
    img.save(path)


def run(cmd):
    print(" ".join(cmd[:6]), "...")
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def clip(src, dur, mode, out):
    n = int(round(dur * FPS))
    # imagem ampliada para dar margem ao movimento
    base = f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2}"
    if mode == "in":
        z = f"zoompan=z='1+0.12*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
    elif mode == "out":
        z = f"zoompan=z='1.18-0.16*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
    elif mode == "down":
        z = f"zoompan=z='1.15':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*on/{n}'"
    else:  # shake: zoom rápido no impacto + tremor decrescente
        z = (f"zoompan=z='1.12+0.06*exp(-on/6)':"
             f"x='iw/2-(iw/zoom/2)+40*sin(on*2.3)*exp(-on/10)':"
             f"y='ih/2-(ih/zoom/2)+40*cos(on*1.7)*exp(-on/10)'")
    vf = f"{base},{z}:d={n}:s={W}x{H}:fps={FPS},format=yuv420p"
    run(["ffmpeg", "-y", "-loop", "1", "-i", src, "-vf", vf, "-frames:v", str(n),
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", out])


def main():
    os.chdir(D)
    parts = []
    for i, (img, a, b, mode) in enumerate(CENAS):
        out = f"clip{i+1}.mp4"
        clip(img, b - a, mode, out)
        parts.append(out)
    endcard("end.png")
    run(["ffmpeg", "-y", "-loop", "1", "-i", "end.png", "-vf", "fade=in:0:15,format=yuv420p",
         "-frames:v", str(int(END * FPS)), "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "clip_end.mp4"])
    parts.append("clip_end.mp4")
    with open("lista.txt", "w") as f:
        f.writelines(f"file '{p}'\n" for p in parts)
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", "lista.txt", "-c", "copy", "base.mp4"])

    # legendas
    inputs, filt, last = ["-i", "base.mp4"], [], "0:v"
    for i, (a, b, p) in enumerate(LEG):
        caption_png(f"leg{i}.png", p)
        inputs += ["-i", f"leg{i}.png"]
        nxt = f"v{i}"
        filt.append(f"[{last}][{i+1}:v]overlay=0:0:enable='between(t,{a},{b})'[{nxt}]")
        last = nxt
    vfade_out = CENAS[-1][2] - 0.4
    filt.append(f"[{last}]fade=in:0:8[vf]")

    # áudio: narração + drone grave + impacto no escudo
    ai = len(LEG) + 1
    inputs += ["-i", "narracao.mp3",
               "-f", "lavfi", "-t", str(TOTAL), "-i", "anoisesrc=color=brown:amplitude=0.5:seed=7",
               "-f", "lavfi", "-t", "1.5", "-i", "sine=frequency=48:sample_rate=44100"]
    filt.append(f"[{ai}:a]adelay=0|0,volume=1.6[nar]")
    filt.append(f"[{ai+1}:a]lowpass=f=180,volume=0.35,afade=in:0:1,afade=out:st={TOTAL-1.5}:d=1.5[amb]")
    filt.append(f"[{ai+2}:a]volume=2.2,afade=out:st=0.05:d=1.4,adelay=8900|8900[boom]")
    filt.append("[nar][amb][boom]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[af]")

    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(filt), "-map", "[vf]", "-map", "[af]",
         "-t", str(TOTAL), "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "EP01_O_Portao.mp4"])
    print("OK")


if __name__ == "__main__":
    main()

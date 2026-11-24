"""Junta os quadros 3D com legendas, narração, efeitos e a pergunta final -> EP01_O_Portao_3D.mp4"""
import subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'videos', 'ep01'))
import montar  # reaproveita caption_png (fonte Anton, palavra amarela)
os.chdir(HERE)
montar.D = os.path.abspath('../videos/ep01')
montar.FONT = os.path.join(montar.D, 'fonts', 'Anton.ttf')

DUR, END, SLAM = 15.0, 3.5, 9.55
LEG = [(0.1, 3.0, [("TODO MUNDO", False), ("FUGIU", True)]),
       (3.0, 6.0, [("ELAS", False), ("DESCERAM", True)]),
       (6.1, 7.6, [("UM GUARDA...", False)]),
       (7.6, 8.7, [("E UM", False), ("GATO", True)]),
       (8.8, 11.3, [("NINGUÉM", False), ("PASSA", True)]),
       (11.5, 12.9, [("ELE NÃO FUGIU.", False)]),
       (13.0, 15.0, [("ELE", False), ("FICOU", True)])]
PERGUNTA = ("ELE AGUENTA ATÉ O AMANHECER?", "A) SIM", "B) NÃO")


def tela_final(path):
    W, H = 1080, 1920
    img = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(img)
    F = lambda s: ImageFont.truetype(montar.FONT, s)
    def c(txt, f, y, col):
        d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=col)
    c('PARTE 1', F(170), 560, (255, 212, 0)); c('A COROA DE VARNOR', F(70), 770, (255, 255, 255))
    c(PERGUNTA[0], F(78), 1010, (255, 255, 255))
    for i, op in enumerate(PERGUNTA[1:]):
        f = F(95); w = d.textlength(op, font=f); x = (W - w) / 2; y = 1150 + i * 150
        d.rounded_rectangle((x - 50, y - 10, x + w + 50, y + 125), 24, outline=(255, 212, 0), width=6)
        d.text((x, y), op, font=f, fill=(255, 212, 0) if i == 0 else (255, 255, 255))
    c('COMENTA AÍ', F(60), 1500, (180, 180, 180))
    img.save(path)


os.makedirs('tmp', exist_ok=True)
for i, (_, _, p) in enumerate(LEG): montar.caption_png(f'tmp/leg{i}.png', p)
SUBIR = {3: 620}  # 'E UM GATO': legenda mais alta para não cobrir o Brasa
for i, dy in SUBIR.items():
    im = Image.open(f'tmp/leg{i}.png'); out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.paste(im, (0, -dy)); out.save(f'tmp/leg{i}.png')
tela_final('tmp/end.png')
inp = ['-framerate', '30', '-i', 'frames/f%04d.png', '-loop', '1', '-t', str(END), '-i', 'tmp/end.png']
for i in range(len(LEG)): inp += ['-i', f'tmp/leg{i}.png']
inp += ['-i', '../videos/ep01/narracao.mp3',
        '-f', 'lavfi', '-t', str(DUR + END), '-i', 'anoisesrc=color=brown:amplitude=0.5:seed=7',
        '-f', 'lavfi', '-t', '1.5', '-i', 'sine=frequency=48:sample_rate=44100']
f, last = ['[0:v]format=yuv420p,fade=in:0:8[b]'], 'b'
for i, (a, b, _) in enumerate(LEG):
    f.append(f"[{last}][{i+2}:v]overlay=0:0:enable='between(t,{a},{b})'[v{i}]"); last = f'v{i}'
f.append('[1:v]format=yuv420p,fade=in:0:12,fps=30[e]')
f.append(f'[{last}][e]concat=n=2:v=1:a=0[vf]')
n = len(LEG) + 2
f.append(f'[{n}:a]volume=1.6[nar]')
f.append(f'[{n+1}:a]lowpass=f=180,volume=0.35,afade=in:0:1,afade=out:st={DUR+END-1.5}:d=1.5[amb]')
ms = int(SLAM * 1000)
f.append(f'[{n+2}:a]volume=2.2,afade=out:st=0.05:d=1.4,adelay={ms}|{ms}[boom]')
f.append('[nar][amb][boom]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[af]')
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]',
                '-t', str(DUR + END), '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'EP01_O_Portao_3D.mp4'], check=True)
print('OK')

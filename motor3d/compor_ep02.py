"""EP2 — junta: abertura (lembrança do EP1) + quadros 3D + legendas + vozes + pergunta final."""
import subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'videos', 'ep01'))
import montar
os.chdir(HERE)
montar.D = os.path.abspath('../videos/ep01'); montar.FONT = os.path.join(montar.D, 'fonts', 'Anton.ttf')
EP = '../videos/ep02'
DUR, END, RECAP = 31.0, 3.5, 3.0
LEG = [(0.1, 2.8, [("ONTEM ELE", False), ("SEGUROU", True), ("O PORTÃO", False)]),
       (3.3, 5.9, [("AINDA DE", False), ("PÉ", True)]),
       (6.3, 8.0, [("A VILA", False), ("VIU", True)]),
       (8.3, 11.8, [("QUEM NÃO SE DEFENDE", False), ("PAGA", True)]),
       (12.3, 15.0, [("BREJO CINZA SE", False), ("DEFENDEU", True)]),
       (15.4, 18.9, [("O LORDE", False), ("CHEGOU", True)]),
       (19.3, 21.0, [("BOM TRABALHO, GUARDA.", False)]),
       (21.3, 23.9, [("VOLTE PRO SEU", False), ("PORTÃO", True)]),
       (24.2, 25.8, [("ELE OLHOU PRO LORDE...", False)]),
       (25.9, 28.2, [("E PENSOU EM", False), ("UMA COISA", True)])]
PERGUNTA = ("O QUE ELE FAZ?", "A) VOLTA PRO PORTÃO", "B) ENFRENTA O LORDE")

def tela_final(path):
    W, H = 1080, 1920
    img = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(img)
    F = lambda s: ImageFont.truetype(montar.FONT, s)
    def c(txt, f, y, col): d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=col)
    c('PARTE 2', F(170), 560, (255, 212, 0)); c('A COROA DE VARNOR', F(70), 770, (255, 255, 255))
    c(PERGUNTA[0], F(90), 1000, (255, 255, 255))
    for i, op in enumerate(PERGUNTA[1:]):
        f = F(80); w = d.textlength(op, font=f); x = (W - w) / 2; y = 1150 + i * 140
        d.rounded_rectangle((x - 45, y - 8, x + w + 45, y + 110), 22, outline=(255, 212, 0), width=6)
        d.text((x, y), op, font=f, fill=(255, 212, 0) if i == 0 else (255, 255, 255))
    c('COMENTA AÍ', F(60), 1470, (180, 180, 180))
    img.save(path)

os.makedirs('tmp', exist_ok=True)
for i, (_, _, p) in enumerate(LEG): montar.caption_png(f'tmp/e2leg{i}.png', p)
tela_final('tmp/e2end.png')
nf = int(RECAP * 30)
inp = ['-i', f'{EP}/recap_ep01.png',
       '-framerate', '30', '-start_number', str(nf), '-i', 'frames/f%04d.png',
       '-loop', '1', '-t', str(END), '-i', 'tmp/e2end.png']
for i in range(len(LEG)): inp += ['-i', f'tmp/e2leg{i}.png']
nl = 3 + len(LEG)
inp += ['-i', f'{EP}/narr_a.mp3', '-i', f'{EP}/draven.mp3', '-i', f'{EP}/narr_b.mp3',
        '-f', 'lavfi', '-t', str(DUR + END), '-i', 'anoisesrc=color=brown:amplitude=0.4:seed=3',
        '-f', 'lavfi', '-t', '2.5', '-i', 'sine=frequency=55:sample_rate=44100']
f = [# lembrança: azulado, dessaturado, zoom lento, vinheta
     f'[0:v]scale=2160:3840,zoompan=z=\'1+0.06*on/{nf}\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d={nf}:s=1080x1920:fps=30,'
     'hue=s=0.35,colorbalance=bs=0.25:bm=0.1,vignette=PI/4,format=yuv420p,fade=in:0:8,fade=out:st=2.7:d=0.3[rc]',
     '[1:v]scale=1080:1920:flags=lanczos,format=yuv420p,fade=in:0:8[sc]',
     '[2:v]format=yuv420p,fade=in:0:12,fps=30[e]',
     '[rc][sc][e]concat=n=3:v=1:a=0[b]']
last = 'b'
for i, (a, b, _) in enumerate(LEG):
    f.append(f"[{last}][{i+3}:v]overlay=0:0:enable='between(t,{a},{b})'[v{i}]"); last = f'v{i}'
f.append(f'[{last}]null[vf]')
f.append(f'[{nl}:a]volume=1.6[n1]')
f.append(f'[{nl+1}:a]volume=1.7,adelay=19300|19300[dv]')
f.append(f'[{nl+2}:a]volume=1.6,adelay=24200|24200[n2]')
f.append(f'[{nl+3}:a]lowpass=f=300,volume=0.25,afade=in:st=0:d=1.5,afade=out:st={DUR+END-1.5}:d=1.5[amb]')
f.append(f'[{nl+4}:a]volume=1.5,afade=in:st=0:d=0.3,afade=out:st=0.5:d=2,adelay=28300|28300[sting]')
f.append('[n1][dv][n2][amb][sting]amix=inputs=5:duration=longest:normalize=0,alimiter=limit=0.95[af]')
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]',
                '-t', str(DUR + END), '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-profile:v', 'high', '-tune', 'animation',
                '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', f'{EP}/EP02_O_Escudo_Rachado_3D.mp4'], check=True)
print('OK')

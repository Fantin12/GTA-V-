"""EP3 (1 min) — abertura (lembrança do EP2) + quadros 3D + legendas + 3 vozes + martelo + janela de item + pergunta final."""
import subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'videos', 'ep01')); sys.path.insert(0, os.path.join(HERE, '..', 'videos', 'ep03'))
import montar, timeline
os.chdir(HERE)
montar.D = os.path.abspath('../videos/ep01'); montar.FONT = os.path.join(montar.D, 'fonts', 'Anton.ttf')
EP = '../videos/ep03'
DUR, END, RECAP = 64.5, 4.0, 4.0
STRIKES = [4.6, 5.7, 6.8, 7.7, 39.6, 40.3, 41.0, 41.7, 42.4, 43.1, 43.8, 44.5, 45.2]
LEG = [(0.3, 3.9, [("MANDOU ELE VOLTAR PRO", False), ("PORTÃO", True)]),
       (8.3, 11.3, [("NÃO", False), ("SERVE", True), ("MAIS", False)]),
       (13.2, 16.4, [("NÃO CONSEGUIU", False), ("DORMIR", True)]),
       (19.0, 21.9, [("UM", False), ("REINO", True), ("INTEIRO", False)]),
       (24.0, 27.0, [("QUER SER", False), ("REI", True), ("?", False)]),
       (28.3, 29.7, [("NÃO.", False)]),
       (29.8, 32.9, [("O DONO DE", False), ("VARNOR", True)]),
       (34.2, 36.2, [("BRAM", False), ("RIU...", True)]),
       (36.4, 38.5, [("E PAROU DE", False), ("RIR", True)]),
       (39.5, 44.0, [("SETE", True), ("DIAS E SETE NOITES", False)]),
       (47.3, 50.4, [("ESCUDO DO", False), ("PORTÃO", True)]),
       (53.2, 57.5, [("O GUARDA QUER SER", False), ("REI", True)]),
       (58.8, 61.2, [("CHEGOU A", False), ("HORA", True)])]
PERGUNTA = ("SER REI PRA QUÊ?", "A) VINGANÇA", "B) PROTEGER A VILA")
F = lambda s: ImageFont.truetype(montar.FONT, s)

def tela_final(path):
    W, H = 1080, 1920; img = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(img)
    def c(txt, f, y, col): d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=col)
    c('PARTE 3', F(170), 560, (255, 212, 0)); c('A COROA DE VARNOR', F(70), 770, (255, 255, 255)); c(PERGUNTA[0], F(90), 1000, (255, 255, 255))
    for i, op in enumerate(PERGUNTA[1:]):
        f = F(80); w = d.textlength(op, font=f); x = (W - w) / 2; y = 1150 + i * 140
        d.rounded_rectangle((x - 45, y - 8, x + w + 45, y + 110), 22, outline=(255, 212, 0), width=6)
        d.text((x, y), op, font=f, fill=(255, 212, 0) if i == 0 else (255, 255, 255))
    c('COMENTA AÍ', F(60), 1470, (180, 180, 180)); img.save(path)

def janela_item(path):                     # tooltip de item estilo MMO
    W, H = 1080, 1920; img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 150, 230, 930, 640
    d.rounded_rectangle((x0, y0, x1, y1), 26, fill=(12, 12, 20, 215), outline=(212, 162, 58, 255), width=6)
    d.rounded_rectangle((x0 + 14, y0 + 14, x1 - 14, y1 - 14), 20, outline=(120, 90, 30, 255), width=2)
    d.text((x0 + 50, y0 + 40), 'ESCUDO DO PORTÃO', font=F(78), fill=(255, 212, 0))
    d.text((x0 + 50, y0 + 145), 'Escudo-torre  ·  Grau: FERRO', font=F(46), fill=(200, 200, 210))
    d.text((x0 + 50, y0 + 215), 'Defesa +12     Bloqueio +8%', font=F(46), fill=(110, 230, 120))
    d.text((x0 + 50, y0 + 290), '"Feito para aguentar um reino."', font=F(42), fill=(230, 200, 140))
    img.save(path)

os.makedirs('tmp', exist_ok=True)
for i, (_, _, p) in enumerate(LEG): montar.caption_png(f'tmp/e3leg{i}.png', p)
tela_final('tmp/e3end.png'); janela_item('tmp/e3item.png')
nf = int(RECAP * 30)
inp = ['-i', f'{EP}/recap_ep02.png', '-framerate', '30', '-start_number', str(nf), '-i', 'frames/f%04d.png',
       '-loop', '1', '-t', str(END), '-i', 'tmp/e3end.png', '-loop', '1', '-i', 'tmp/e3item.png']
for i in range(len(LEG)): inp += ['-i', f'tmp/e3leg{i}.png']
na = 4 + len(LEG)
for nome, _, _ in timeline.FALAS: inp += ['-i', f'{EP}/{nome}.mp3']
nb = na + len(timeline.FALAS)
total = DUR + END
inp += ['-f', 'lavfi', '-t', str(total), '-i', 'anoisesrc=color=pink:amplitude=0.25:seed=11',
        '-f', 'lavfi', '-t', '0.9', '-i', "aevalsrc='0.55*sin(2*PI*1150*t)*exp(-7*t)+0.35*sin(2*PI*2870*t)*exp(-11*t)+0.2*sin(2*PI*4100*t)*exp(-16*t)':s=44100"]
f = [f'[0:v]scale=2160:3840,zoompan=z=\'1+0.06*on/{nf}\':x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':d={nf}:s=1080x1920:fps=30,'
     'hue=s=0.35,colorbalance=bs=0.25:bm=0.1,vignette=PI/4,format=yuv420p,fade=in:0:8,fade=out:st=3.7:d=0.3[rc]',
     '[1:v]scale=1080:1920:flags=lanczos,format=yuv420p,fade=in:0:6[sc]',
     '[2:v]format=yuv420p,fade=in:0:12,fps=30[e]',
     '[rc][sc][e]concat=n=3:v=1:a=0[b0]',
     "[b0][3:v]overlay=0:0:enable='between(t,48.0,53.0)'[b]"]
last = 'b'
for i, (a, b, _) in enumerate(LEG):
    f.append(f"[{last}][{i+4}:v]overlay=0:0:enable='between(t,{a},{b})'[v{i}]"); last = f'v{i}'
f.append(f'[{last}]null[vf]')
mix = []
for k, (nome, _, t0) in enumerate(timeline.FALAS):
    ms = int(t0 * 1000); f.append(f'[{na+k}:a]volume=1.7,adelay={ms}|{ms}[s{k}]'); mix.append(f'[s{k}]')
f.append(f'[{nb}:a]lowpass=f=1600,highpass=f=200,volume=0.12,afade=in:st=0:d=1.5,afade=out:st={total-1.5}:d=1.5[fire]'); mix.append('[fire]')
f.append(f'[{nb+1}:a]asplit={len(STRIKES)}' + ''.join(f'[c{i}]' for i in range(len(STRIKES))))
for i, st in enumerate(STRIKES):
    ms = int(st * 1000); f.append(f'[c{i}]volume=0.9,adelay={ms}|{ms}[cl{i}]'); mix.append(f'[cl{i}]')
f.append(''.join(mix) + f'amix=inputs={len(mix)}:duration=longest:normalize=0,alimiter=limit=0.95[af]')
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]', '-t', str(total),
                '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-profile:v', 'high', '-tune', 'animation', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', f'{EP}/EP03_A_Promessa_1min.mp4'], check=True)
print('OK')

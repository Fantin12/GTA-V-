"""Junta os quadros 3D com legendas, narração e efeitos -> teste_3d_ep01.mp4"""
import subprocess, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'videos', 'ep01'))
import montar  # reaproveita caption_png / endcard (fonte Anton)
os.chdir(os.path.dirname(os.path.abspath(__file__)))
montar.D = os.path.abspath('../videos/ep01')
montar.FONT = os.path.join(montar.D, 'fonts', 'Anton.ttf')
DUR, END = 8.3, 2.0
LEG = [(0.05, 1.5, [("UM GUARDA...", False)]), (1.5, 2.7, [("E UM", False), ("GATO", True)]),
       (2.8, 4.4, [("NINGUÉM", False), ("PASSA", True)]), (5.4, 6.8, [("ELE NÃO FUGIU.", False)]),
       (6.9, 8.3, [("ELE", False), ("FICOU", True)])]
os.makedirs('tmp', exist_ok=True)
for i, (_, _, p) in enumerate(LEG): montar.caption_png(f'tmp/leg{i}.png', p)
montar.endcard('tmp/end.png')
inp = ['-framerate', '30', '-i', 'frames/f%04d.png', '-loop', '1', '-t', str(END), '-i', 'tmp/end.png']
for i in range(len(LEG)): inp += ['-i', f'tmp/leg{i}.png']
inp += ['-ss', '6.1', '-t', '8.0', '-i', '../videos/ep01/narracao.mp3',
        '-f', 'lavfi', '-t', str(DUR + END), '-i', 'anoisesrc=color=brown:amplitude=0.5:seed=7',
        '-f', 'lavfi', '-t', '1.5', '-i', 'sine=frequency=48:sample_rate=44100']
f, last = ['[0:v]format=yuv420p,fade=in:0:6[b]'], 'b'
for i, (a, b, _) in enumerate(LEG):
    f.append(f"[{last}][{i+2}:v]overlay=0:0:enable='between(t,{a},{b})'[v{i}]"); last = f'v{i}'
f.append('[1:v]format=yuv420p,fade=in:0:12,fps=30[e]')
f.append(f'[{last}][e]concat=n=2:v=1:a=0[vf]')
n = len(LEG) + 2
f.append(f'[{n}:a]volume=1.6[nar]')
f.append(f'[{n+1}:a]lowpass=f=180,volume=0.35,afade=in:0:1,afade=out:st={DUR+END-1.5}:d=1.5[amb]')
f.append(f'[{n+2}:a]volume=2.2,afade=out:st=0.05:d=1.4,adelay=2750|2750[boom]')
f.append('[nar][amb][boom]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[af]')
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]',
                '-t', str(DUR + END), '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', 'teste_3d_ep01.mp4'], check=True)
print('OK')

"""Junta os quadros 2D com as falas e os efeitos de som. Uso: python3 compor.py ep01"""
import subprocess, sys, os, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
ep = sys.argv[1] if len(sys.argv) > 1 else 'ep01'
pasta = os.path.abspath(f'../videos/{ep}_2d')
spec = importlib.util.spec_from_file_location('tl', os.path.join(pasta, 'timeline.py')); tl = importlib.util.module_from_spec(spec); spec.loader.exec_module(tl)
EFEITOS = {'ep01': {'impacto': [41.6], 'suspense': [53.2], 'fogo': (4, 10)}}.get(ep, {})
DUR = tl.DUR
inp = ['-framerate', '30', '-i', 'frames/f%04d.png']
for nome, _, _ in tl.FALAS: inp += ['-i', f'{pasta}/{nome}.mp3']
n = 1 + len(tl.FALAS)
inp += ['-f', 'lavfi', '-t', str(DUR), '-i', 'anoisesrc=color=pink:amplitude=0.3:seed=4',
        '-f', 'lavfi', '-t', '1.5', '-i', 'sine=frequency=48:sample_rate=44100',
        '-f', 'lavfi', '-t', '3', '-i', "aevalsrc='0.25*sin(2*PI*110*t)*exp(-0.8*t)+0.2*sin(2*PI*164.8*t)*exp(-0.8*t)+0.15*sin(2*PI*220*t)*exp(-1*t)':s=44100"]
f, mix = ['[0:v]format=yuv420p[vf]'], []
for k, (nome, _, t0) in enumerate(tl.FALAS):
    ms = int(t0 * 1000); f.append(f'[{1+k}:a]volume=1.7,adelay={ms}|{ms}[s{k}]'); mix.append(f'[s{k}]')
fa, fb = EFEITOS.get('fogo', (0, 0))
f.append(f"[{n}:a]asplit=2[r0][r1]"); f.append(f"[r0]highpass=f=500,lowpass=f=7000,volume=0.22,afade=in:st=0:d=1,afade=out:st={DUR-5.5}:d=1[chuva]"); mix.append('[chuva]')
f.append(f"[r1]lowpass=f=900,volume='if(between(t,{fa},{fb}),0.6,0)':eval=frame[fogo]"); mix.append('[fogo]')
for i, t0 in enumerate(EFEITOS.get('impacto', [])): ms = int(t0 * 1000); f.append(f'[{n+1}:a]volume=2.4,afade=out:st=0.05:d=1.4,adelay={ms}|{ms}[im{i}]'); mix.append(f'[im{i}]')
for i, t0 in enumerate(EFEITOS.get('suspense', [])): ms = int(t0 * 1000); f.append(f'[{n+2}:a]volume=1.2,adelay={ms}|{ms}[su{i}]'); mix.append(f'[su{i}]')
f.append(''.join(mix) + f'amix=inputs={len(mix)}:duration=longest:normalize=0,alimiter=limit=0.95[af]')
out = f'{pasta}/{ep.upper()}_2D.mp4'
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]', '-t', str(DUR),
                '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
print('OK ->', out)

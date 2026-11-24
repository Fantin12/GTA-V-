"""Junta os quadros 2D com as falas e os efeitos de som. Uso: python3 compor.py ep01"""
import subprocess, sys, os, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
ep = sys.argv[1] if len(sys.argv) > 1 else 'ep01'
pasta = os.path.abspath(f'../videos/{ep}_2d')
spec = importlib.util.spec_from_file_location('tl', os.path.join(pasta, 'timeline.py')); tl = importlib.util.module_from_spec(spec); spec.loader.exec_module(tl)
KILLS = [96.8, 102.2, 103.2, 104.2, 105.2, 106.2, 107.2, 108.2, 109.2]
EFEITOS = {'ep01': {'impacto': [41.6], 'suspense': [53.2], 'fogo': (4, 10)},
           'he01': {'impacto': [3.5, 77.8] + KILLS, 'suspense': [3.6, 52.3, 131.5], 'chuva': [(37.5, 45)],
                    'fogo': (81, 88.9), 'fabrica': [(14, 25)], 'moeda': KILLS + [126.2]}}.get(ep, {})
DUR = tl.DUR
inp = ['-framerate', '30', '-i', 'frames/f%04d.png']
for nome, _, _ in tl.FALAS: inp += ['-i', f'{pasta}/{nome}.mp3']
n = 1 + len(tl.FALAS)
inp += ['-f', 'lavfi', '-t', str(DUR), '-i', 'anoisesrc=color=pink:amplitude=0.3:seed=4',
        '-f', 'lavfi', '-t', '1.5', '-i', 'sine=frequency=48:sample_rate=44100',
        '-f', 'lavfi', '-t', '3', '-i', "aevalsrc='0.25*sin(2*PI*110*t)*exp(-0.8*t)+0.2*sin(2*PI*164.8*t)*exp(-0.8*t)+0.15*sin(2*PI*220*t)*exp(-1*t)':s=44100",
        '-f', 'lavfi', '-t', '0.8', '-i', "aevalsrc='0.3*sin(2*PI*1318*t)*exp(-6*t)+0.25*sin(2*PI*1975*t)*exp(-5*t)*gte(t,0.08)':s=44100",
        '-f', 'lavfi', '-t', str(DUR), '-i', "aevalsrc='0.5*sin(2*PI*60*t)+0.25*sin(2*PI*120*t)+0.1*sin(2*PI*240*t)*(0.6+0.4*sin(2*PI*3*t))':s=44100"]
f, mix = ['[0:v]format=yuv420p[vf]'], []
for k, (nome, _, t0) in enumerate(tl.FALAS):
    ms = int(t0 * 1000); f.append(f'[{1+k}:a]volume=1.7,adelay={ms}|{ms}[s{k}]'); mix.append(f'[s{k}]')
fa, fb = EFEITOS.get('fogo', (0, 0))
f.append(f"[{n}:a]asplit=2[r0][r1]"); cr = EFEITOS.get('chuva'); cexp = '+'.join(f'between(t,{a},{b})' for a, b in cr) if cr else '1'
f.append(f"[r0]highpass=f=500,lowpass=f=7000,volume='0.22*({cexp})':eval=frame,afade=in:st=0:d=1,afade=out:st={DUR-5.5}:d=1[chuva]"); mix.append('[chuva]')
fb_ = EFEITOS.get('fabrica', []); fexp = '+'.join(f'between(t,{a},{b})' for a, b in fb_) or '0'
f.append(f"[{n+4}:a]volume='0.10*({fexp})':eval=frame[fab]"); mix.append('[fab]')
for i, t0 in enumerate(EFEITOS.get('moeda', [])): ms = int(t0 * 1000); f.append(f'[{n+3}:a]volume=0.9,adelay={ms}|{ms}[mo{i}]'); mix.append(f'[mo{i}]')
f.append(f"[r1]lowpass=f=900,volume='if(between(t,{fa},{fb}),0.6,0)':eval=frame[fogo]"); mix.append('[fogo]')
for i, t0 in enumerate(EFEITOS.get('impacto', [])): ms = int(t0 * 1000); f.append(f'[{n+1}:a]volume=2.4,afade=out:st=0.05:d=1.4,adelay={ms}|{ms}[im{i}]'); mix.append(f'[im{i}]')
for i, t0 in enumerate(EFEITOS.get('suspense', [])): ms = int(t0 * 1000); f.append(f'[{n+2}:a]volume=1.2,adelay={ms}|{ms}[su{i}]'); mix.append(f'[su{i}]')
f.append(''.join(mix) + f'amix=inputs={len(mix)}:duration=longest:normalize=0,alimiter=limit=0.95[af]')
out = f'{pasta}/{ep.upper()}_2D.mp4'
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]', '-t', str(DUR),
                '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
print('OK ->', out)

"""HORAS EXTRAS T1·EP2 (2D, 2:30): posição de cada fala + sincronia labial."""
import json, subprocess, numpy as np, os
FPS, DUR = 30, 150.0
FALAS = [('n01', 'N', 0.4), ('r01', 'N', 8.6), ('n02', 'N', 17.0), ('v01', 'V', 24.0), ('s01', 'S', 36.0), ('v02', 'V', 43.2),
         ('n04', 'N', 50.5), ('s02', 'S', 69.0), ('n05', 'N', 75.0), ('v03', 'V', 83.0), ('n06', 'N', 86.0), ('n07', 'N', 91.5),
         ('n08', 'N', 98.0), ('v04', 'V', 104.5), ('n09', 'N', 108.0), ('n10', 'N', 114.0), ('v05', 'V', 122.0), ('n11', 'N', 139.5)]
def envelope(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; hop = 16000 // FPS
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
    return np.convolve(np.clip((rms - 0.015) / 0.12, 0, 1) ** 0.7, [0.25, 0.5, 0.25], 'same')
if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); n = int(DUR * FPS); lip = {k: np.zeros(n) for k in 'VNBMAS'}
    for nome, quem, t0 in FALAS:
        e = envelope(os.path.join(here, f'{nome}.mp3')); i0 = int(t0 * FPS); m = min(len(e), n - i0)
        lip[quem][i0:i0 + m] = np.maximum(lip[quem][i0:i0 + m], e[:m])
    json.dump({k: [round(float(v), 3) for v in a] for k, a in lip.items()}, open(os.path.join(here, '..', '..', 'motor2d', 'lipsync_he02.json'), 'w'))
    print('ok')

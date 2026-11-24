"""HORAS EXTRAS T1·EP1 (2D, 2:30): posição de cada fala + sincronia labial."""
import json, subprocess, numpy as np, os
FPS, DUR = 30, 150.0
FALAS = [('n01', 'N', 0.5), ('n02', 'N', 10.8), ('b01', 'B', 18.0), ('v01', 'V', 21.2), ('m01', 'M', 25.6), ('n03', 'N', 31.0),
         ('v02', 'V', 34.6), ('a01', 'A', 38.0), ('n04', 'N', 45.4), ('n05', 'N', 52.5), ('n06', 'N', 61.4), ('v03', 'V', 67.3),
         ('s01', 'S', 72.0), ('v04', 'V', 75.7), ('s02', 'S', 77.8), ('n07', 'N', 81.3), ('b02', 'B', 85.2), ('v05', 'V', 89.0),
         ('n08', 'N', 92.0), ('v06', 'V', 98.2), ('s03', 'S', 110.5), ('s04', 'S', 102.0), ('n09', 'N', 115.5), ('n10', 'N', 124.5), ('n11', 'N', 131.5),
         ('n12', 'N', 139.5)]
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
    json.dump({k: [round(float(v), 3) for v in a] for k, a in lip.items()}, open(os.path.join(here, '..', '..', 'motor2d', 'lipsync_he01.json'), 'w'))
    print('ok')

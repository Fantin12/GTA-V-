"""EP1 (2D): posição de cada fala no vídeo + abertura da boca por quadro (sincronia labial)."""
import json, subprocess, numpy as np, os
FPS, DUR = 30, 61.0
FALAS = [('n1', 'N', 0.4), ('n2', 'N', 4.4), ('n3', 'N', 10.4), ('n4', 'N', 15.4), ('n5', 'N', 19.6), ('n6', 'N', 25.4),
         ('n7', 'N', 31.8), ('v1', 'V', 38.6), ('v2', 'V', 42.0), ('n8', 'N', 45.2), ('n9', 'N', 49.6)]
def envelope(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; hop = 16000 // FPS
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
    return np.convolve(np.clip((rms - 0.015) / 0.12, 0, 1) ** 0.7, [0.25, 0.5, 0.25], 'same')
if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__)); n = int(DUR * FPS); lip = {k: np.zeros(n) for k in 'VN'}
    for nome, quem, t0 in FALAS:
        e = envelope(os.path.join(here, f'{nome}.mp3')); i0 = int(t0 * FPS); m = min(len(e), n - i0)
        lip[quem][i0:i0 + m] = np.maximum(lip[quem][i0:i0 + m], e[:m])
    json.dump({k: [round(float(v), 3) for v in a] for k, a in lip.items()}, open(os.path.join(here, '..', '..', 'motor2d', 'lipsync_ep01.json'), 'w'))
    print('ok')

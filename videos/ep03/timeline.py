"""Linha do tempo do áudio do EP3 + sincronia labial (abertura da boca por quadro, por personagem)."""
import json, subprocess, numpy as np, os
FPS, DUR = 30, 64.5
FALAS = [('n1', 'N', 0.3), ('b1', 'B', 8.3), ('n2', 'N', 13.2), ('v1', 'V', 19.0), ('b2', 'B', 24.0), ('v2', 'V', 28.3),
         ('n3', 'N', 34.2), ('n4', 'N', 39.5), ('n5', 'N', 47.3), ('n6', 'N', 53.2), ('b3', 'B', 58.8)]
def envelope(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    hop = 16000 // FPS
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
    v = np.clip((rms - 0.015) / 0.12, 0, 1) ** 0.7
    return np.convolve(v, [0.25, 0.5, 0.25], 'same')        # suaviza
if __name__ == '__main__':
    n = int(DUR * FPS); lip = {k: np.zeros(n) for k in 'VBN'}
    for nome, quem, t0 in FALAS:
        e = envelope(f'{nome}.mp3'); i0 = int(t0 * FPS)
        m = min(len(e), n - i0); lip[quem][i0:i0 + m] = np.maximum(lip[quem][i0:i0 + m], e[:m])
    out = {k: [round(float(v), 3) for v in a] for k, a in lip.items()}
    json.dump(out, open(os.path.join(os.path.dirname(__file__), '..', '..', 'motor3d', 'lipsync_ep03.json'), 'w'))
    print('ok', {k: round(float(np.mean(a)), 3) for k, a in lip.items()})

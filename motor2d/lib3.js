// Biblioteca 2D — HORAS EXTRAS EP2+: cozinha, mural de missões, caverna, lobos, rachadura, monitor cardíaco, moedas.
import * as L from './lib.js';
const { el, g, grad, rng, clamp, ease } = L;

export function cozinha(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#2a2a34'], [1, '#16161c']]) }, root);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 7; c++) el('rect', { x: c * 160 + 4, y: 700 + r * 90 + 4, width: 152, height: 82, fill: (r + c) % 2 ? '#d8dcd4' : '#cdd2c8', opacity: 0.18 }, root);   // azulejo
  el('rect', { x: 0, y: 300, width: 1080, height: 16, fill: '#3a3a44' }, root);
  const lamp = g({}, root); el('line', { x1: 540, y1: 0, x2: 540, y2: 180, stroke: '#111', 'stroke-width': 4 }, lamp); el('circle', { cx: 540, cy: 200, r: 30, fill: '#fff4c8' }, lamp);
  el('path', { d: 'M500 200 L230 1300 L850 1300 L580 200 Z', fill: 'rgba(255,240,190,0.08)' }, root);
  // geladeira com foto da mãe
  el('rect', { x: 760, y: 520, width: 300, height: 1000, rx: 24, fill: grad([[0, '#e8ece8'], [1, '#b8c0bc']]) }, root);
  el('line', { x1: 760, y1: 860, x2: 1060, y2: 860, stroke: '#9aa29e', 'stroke-width': 6 }, root);
  el('rect', { x: 790, y: 600, width: 120, height: 150, fill: '#f8f4ea', transform: 'rotate(-6 850 675)' }, root);
  el('circle', { cx: 850, cy: 660, r: 34, fill: '#d09070', transform: 'rotate(-6 850 675)' }, root);
  el('path', { d: 'M812 740 q38 -50 76 0 Z', fill: '#7aa0c0', transform: 'rotate(-6 850 675)' }, root);
  // bancada, pia, fogão
  el('rect', { x: 0, y: 1300, width: 760, height: 40, fill: '#5a4a3a' }, root);
  el('rect', { x: 0, y: 1340, width: 760, height: 580, fill: '#3a3028' }, root);
  el('rect', { x: 60, y: 1290, width: 280, height: 26, rx: 8, fill: '#9aa4ac' }, root);
  el('path', { d: 'M240 1290 v-120 q0 -40 40 -40 h30', fill: 'none', stroke: '#9aa4ac', 'stroke-width': 14 }, root);
  const panela = g({ transform: 'translate(560 1260)' }, root);
  el('rect', { x: -110, y: -60, width: 220, height: 90, rx: 14, fill: '#7a7e86' }, panela);
  el('rect', { x: 110, y: -45, width: 110, height: 16, rx: 8, fill: '#222' }, panela);
  const vapor = g({ fill: 'none', stroke: 'rgba(255,255,255,0.35)', 'stroke-width': 10, 'stroke-linecap': 'round' }, panela);
  const vs = [-50, 0, 50].map((x) => ({ e: el('path', {}, vapor), x }));
  const relogio = g({ transform: 'translate(240 470)' }, root);
  el('circle', { r: 80, fill: '#f4f0e6', stroke: '#2a2a30', 'stroke-width': 10 }, relogio);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -55, stroke: '#2a2a30', 'stroke-width': 8 }, relogio);
  el('line', { x1: 0, y1: 0, x2: 42, y2: 20, stroke: '#2a2a30', 'stroke-width': 10 }, relogio);   // ~7h
  return { g: root, set: (t) => vs.forEach((v, i) => { const p = (t * 0.6 + i / 3) % 1; v.e.setAttribute('d', `M${v.x} ${-70 - p * 180} q${20 * Math.sin(t * 3 + i)} -40 0 -80`); v.e.setAttribute('opacity', Math.sin(p * Math.PI)); }) };
}

export function sangueNariz(parent, k = 1) {   // sobre vitorBusto (rosto em 540,880 escala 1.12)
  const gg = g({ opacity: k }, parent);
  el('path', { d: 'M520 990 q-8 28 -4 62 q4 10 10 0 q4 -34 2 -62 Z', fill: '#b01818' }, gg);
  el('path', { d: 'M560 992 q6 24 2 44 q-4 8 -8 0 q-2 -26 0 -44 Z', fill: '#b01818' }, gg);
  return gg;
}

export function vilaMural(parent) {   // praça da vila em Varnor com o mural de missões
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#7ab8e8'], [0.6, '#f4dcb0'], [1, '#c8a070']]) }, root);
  for (const [x, s] of [[120, 1], [930, 1.1]]) { const c = g({ transform: `translate(${x} 1150) scale(${s})` }, root); el('rect', { x: -130, y: -300, width: 260, height: 300, fill: '#e8d8b8' }, c); el('path', { d: 'M-160 -300 L0 -460 L160 -300 Z', fill: '#a84a30' }, c); el('rect', { x: -40, y: -140, width: 80, height: 140, fill: '#6a4a2a' }, c); }
  el('rect', { y: 1150, width: 1080, height: 770, fill: grad([[0, '#b8946a'], [1, '#8a6a44']]) }, root);
  for (let i = 0; i < 12; i++) el('ellipse', { cx: 60 + i * 90, cy: 1300 + (i % 3) * 140, rx: 40, ry: 14, fill: 'rgba(0,0,0,0.12)' }, root);
  const mural = g({ transform: 'translate(540 900)' }, root);
  for (const x of [-330, 330]) el('rect', { x: x - 20, y: -380, width: 40, height: 760, fill: '#5a3a1e' }, mural);
  el('rect', { x: -320, y: -360, width: 640, height: 520, rx: 10, fill: '#8a6238' }, mural);
  el('path', { d: 'M-360 -380 h720 l-40 -60 h-640 Z', fill: '#6a4a2a' }, mural);
  const tt = el('text', { x: 0, y: -395, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 40, fill: '#f4e4c0' }, mural); tt.textContent = 'MURAL DE MISSÕES';
  [[-200, -230, -4], [190, -250, 5], [-180, 20, 3]].forEach(([x, y, r]) => { el('rect', { x: x - 90, y: y - 80, width: 180, height: 170, fill: '#e8dcc0', transform: `rotate(${r} ${x} ${y})` }, mural); for (let k = 0; k < 4; k++) el('rect', { x: x - 60, y: y - 40 + k * 26, width: 120 - k * 14, height: 8, fill: '#a89a80', transform: `rotate(${r} ${x} ${y})` }, mural); });
  const cartaz = g({}, mural);
  el('rect', { x: -10, y: -170, width: 300, height: 330, fill: '#f8f0d8', stroke: '#c8a040', 'stroke-width': 6 }, cartaz);
  el('circle', { cx: 140, cy: -160, r: 12, fill: '#b02020' }, cartaz);
  L.loboSilhueta(g({ transform: 'translate(140 -40) scale(0.45)' }, cartaz), 0, 0, 1);
  const c1 = el('text', { x: 140, y: 70, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 34, fill: '#3a2a10' }, cartaz); c1.textContent = 'TOCA DOS LOBOS';
  const c2 = el('text', { x: 140, y: 130, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 48, fill: '#1e8a3a' }, cartaz); c2.textContent = 'R$ 400';
  return { g: root, mural, cartaz };
}

export function caverna(parent, { fundo = false } = {}) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: fundo ? grad([[0, '#0c0a10'], [1, '#1a1418']]) : grad([[0, '#2a3a4a'], [0.5, '#3a4a40'], [1, '#2a2a24']]) }, root);
  if (!fundo) {
    el('path', { d: 'M0 600 Q300 380 540 420 Q800 380 1080 560 L1080 1920 L0 1920 Z', fill: '#4a4a44' }, root);
    el('path', { d: 'M260 1400 Q260 760 540 720 Q820 760 820 1400 Z', fill: '#0a0808' }, root);                // boca da toca
    for (let i = 0; i < 6; i++) el('path', { d: `M${300 + i * 90} ${760 + Math.abs(i - 2.5) * 30} l30 ${90 + (i % 2) * 40} l30 ${-90 - (i % 2) * 40} Z`, fill: '#5a5a52' }, root);
    for (let i = 0; i < 14; i++) el('path', { d: `M${i * 80} 1400 q40 -60 80 0`, fill: '#3a4a2a' }, root);
  } else {
    for (let i = 0; i < 9; i++) el('path', { d: `M${i * 130 - 20} 0 l60 ${200 + (i % 3) * 120} l60 ${-200 - (i % 3) * 120} Z`, fill: '#221c22' }, root);   // estalactites
    el('ellipse', { cx: 540, cy: 1150, rx: 700, ry: 300, fill: 'rgba(60,40,60,0.35)' }, root);
    for (let i = 0; i < 18; i++) el('circle', { cx: 80 + (i * 137) % 940, cy: 1500 + (i * 53) % 300, r: 10 + (i % 3) * 6, fill: '#c8bca8', opacity: 0.5 }, root);  // ossos
  }
  el('rect', { y: 1400, width: 1080, height: 520, fill: fundo ? '#141014' : '#2a2620' }, root);
  return { g: root };
}

// lobo de perfil, virado para a direita, pés em (0,0). set({ t, pulo, morto, alfa })
export function lobo(parent, { alfa = false, seed = 1 } = {}) {
  const R = rng(seed + 50), root = g({}, parent), body = g({}, root);
  const c = alfa ? '#5a5a66' : '#8a8a94', c2 = alfa ? '#3a3a46' : '#62626c', s = alfa ? 1.6 : 1;
  const sc = g({ transform: `scale(${s})` }, body);
  const cauda = el('path', { fill: 'none', stroke: c2, 'stroke-width': 30, 'stroke-linecap': 'round' }, sc);
  const pernas = [-130, -80, 70, 120].map((x) => el('rect', { x: x - 14, y: -130, width: 28, height: 130, rx: 12, fill: c2 }, sc));
  el('ellipse', { cx: 0, cy: -170, rx: 170, ry: 80, fill: c }, sc);
  el('path', { d: 'M60 -230 Q150 -300 200 -250 L260 -200 Q270 -170 230 -160 L140 -150 Z', fill: c }, sc);     // cabeça/focinho
  el('path', { d: 'M140 -270 l20 -60 l30 55 Z M175 -262 l25 -55 l20 60 Z', fill: c2 }, sc);                   // orelhas
  const boca = el('path', { d: 'M260 -190 L180 -175', stroke: '#1a0a0a', 'stroke-width': 8 }, sc);
  const dentes = el('path', { d: 'M250 -190 l-8 14 l-8 -14 l-8 14 l-8 -14', fill: 'none', stroke: '#f4f0e0', 'stroke-width': 4, opacity: 0 }, sc);
  const olho = el('circle', { cx: 200, cy: -225, r: 10, fill: alfa ? '#ff3020' : '#ffd040' }, sc);
  if (alfa) {
    el('path', { d: 'M175 -255 l18 18 M188 -258 l-12 22', stroke: '#c8a8a0', 'stroke-width': 6 }, sc);       // cicatriz do olho cego
    el('circle', { cx: 200, cy: -225, r: 26, fill: L.P.brilhoV, opacity: 0.8 }, sc);
  }
  const ph = R() * 6;
  return {
    g: root,
    set: ({ t = 0, pulo = 0, morto = false, uiva = 0, rosna = 0 } = {}) => {
      cauda.setAttribute('d', `M-160 -190 q-90 ${-20 + 20 * Math.sin(t * 6 + ph)} -150 ${40 + 30 * Math.sin(t * 6 + ph)}`);
      pernas.forEach((p, i) => p.setAttribute('transform', `rotate(${pulo > 0 ? (i < 2 ? 40 : -40) * pulo : 14 * Math.sin(t * 10 + i * 1.6 + ph) * (morto ? 0 : 1)} ${p.getAttribute('x') * 1 + 14} -130)`));
      dentes.setAttribute('opacity', rosna || pulo > 0 ? 1 : 0); boca.setAttribute('d', rosna || pulo > 0 ? 'M262 -195 L180 -160' : 'M260 -190 L180 -175');
      const uv = uiva ? `rotate(${-35 * uiva} 0 -170)` : '';
      body.setAttribute('transform', morto ? 'translate(0 -40) rotate(180 0 -110)' : `${uv} rotate(${-25 * pulo} 0 -100)`);
      root.setAttribute('opacity', 1);
    },
  };
}

export function rachadura(parent, cx = 540, cy = 900, seed = 3) {   // tela racha como vidro
  const R = rng(seed), gg = g({ fill: 'none', stroke: '#fff', 'stroke-width': 5, opacity: 0 }, parent), ls = [];
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2 + R() * 0.3; let x = cx, y = cy, d = `M${x} ${y}`; for (let k = 0; k < 5; k++) { const r = 80 + R() * 160; x += Math.cos(a + (R() - 0.5) * 0.6) * r; y += Math.sin(a + (R() - 0.5) * 0.6) * r; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; } ls.push(L.traco(gg, d, '#ffffff', 5)); }
  for (let r of [70, 150]) el('circle', { cx, cy, r, stroke: 'rgba(255,255,255,0.6)', 'stroke-width': 3, 'stroke-dasharray': '30 20' }, gg);
  return { set: (k) => { gg.setAttribute('opacity', k > 0 ? 1 : 0); ls.forEach((l) => l.set(k * 1.5)); } };
}

export function monitorCardiaco(parent) {   // linha verde que vira reta
  const gg = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: '#020604' }, gg);
  for (let i = 0; i < 20; i++) el('line', { x1: 0, y1: i * 100, x2: 1080, y2: i * 100, stroke: 'rgba(60,255,120,0.06)', 'stroke-width': 2 }, gg);
  for (let i = 0; i < 12; i++) el('line', { x1: i * 100, y1: 0, x2: i * 100, y2: 1920, stroke: 'rgba(60,255,120,0.06)', 'stroke-width': 2 }, gg);
  const linha = el('polyline', { fill: 'none', stroke: '#3fff7a', 'stroke-width': 8, 'stroke-linejoin': 'round' }, gg);
  const bpm = el('text', { x: 860, y: 420, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 140, fill: '#3fff7a' }, gg);
  return { g: gg, set: (t, reta) => { let pts = ''; for (let x = 0; x <= 1080; x += 10) { const ph = (x / 360 + t * 1.4) % 1; const tempo = t - (1080 - x) / 1500; let y = 960; if (tempo < reta) { if (ph > 0.40 && ph < 0.44) y = 960 - 280; else if (ph > 0.44 && ph < 0.48) y = 960 + 160; else if (ph > 0.3 && ph < 0.36) y = 960 - 40; } pts += `${x},${y} `; } linha.setAttribute('points', pts); bpm.textContent = t < reta ? String(Math.round(150 + 20 * Math.sin(t * 7))) : '0'; } };
}

export function moedas(parent, n = 15, seed = 8) {   // "R$" verdes caindo e sumindo
  const R = rng(seed), gg = g({}, parent);
  const ms = Array.from({ length: n }, () => { const c = g({}, gg); el('circle', { r: 34, fill: '#3fd26a', stroke: '#0a5a2a', 'stroke-width': 6 }, c); const tx = el('text', { y: 14, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 36, fill: '#0a3a1a' }, c); tx.textContent = 'R$'; return { c, x: 200 + R() * 680, v: 300 + R() * 400, d: R() * 0.6, r: R() * 360 }; });
  return { set: (k) => ms.forEach((m) => { const u = Math.max(0, k - m.d); m.c.setAttribute('transform', `translate(${m.x} ${900 + u * m.v + 400 * u * u}) rotate(${m.r + u * 300})`); m.c.setAttribute('opacity', clamp(1 - u / 1.4)); }) };
}

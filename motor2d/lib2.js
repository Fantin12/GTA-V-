// Biblioteca 2D — HORAS EXTRAS: cenários da vida real (fábrica, ônibus, hospital, ponto, clínica, quarto),
// HUD do Relógio, balões da Plateia, números de tempo, transição em pixels, taverna, ratos e personagens novos.
import * as L from './lib.js';
const { el, g, grad, rng, clamp, ease, P } = L;
export { L };

// ---------------- detalhes reutilizáveis ----------------
export function sombraChao(parent, cx, cy, rx, ry = 30, op = 0.35) { return el('ellipse', { cx, cy, rx, ry, fill: `rgba(0,0,0,${op})` }, parent); }
export function luzCone(parent, x, y, w, h, cor = 'rgba(255,240,200,0.18)') { return el('path', { d: `M${x - 30} ${y} L${x + 30} ${y} L${x + w / 2} ${y + h} L${x - w / 2} ${y + h} Z`, fill: grad([[0, cor], [1, 'rgba(255,255,255,0)']]) }, parent); }
export function poeira(parent, n = 40, seed = 3, cor = 'rgba(255,255,255,0.25)') {
  const R = rng(seed), gg = g({ fill: cor }, parent);
  const ps = Array.from({ length: n }, () => ({ e: el('circle', { r: 1.5 + R() * 3 }, gg), x: R() * 1080, y: R() * 1920, v: 10 + R() * 30, ph: R() * 6 }));
  return { set: (t) => ps.forEach((p) => { p.e.setAttribute('cx', p.x + 20 * Math.sin(t * 0.5 + p.ph)); p.e.setAttribute('cy', (p.y - t * p.v + 1920) % 1920); }) };
}

// ---------------- VITOR (vida real): rosto do Vitorioso + macacão e protetor auricular ----------------
const VIT = { pele: ['#e8a676', '#cf8656', '#b56f45'], cabelo: '#2a1a10', olhos: '#3a78c0', estilo: 'cachos', barba: 'rala', cicatriz: true, bravo: 0.35 };
export function vitorBusto(parent, { macacao = true, curativo = false } = {}) {
  const root = g({}, parent);
  const roupa = macacao ? grad([[0, '#4a6a8a'], [1, '#2a3e54']]) : grad([[0, '#3a3a44'], [1, '#1e1e26']]);
  el('path', { d: 'M120 1920 L170 1330 Q540 1210 910 1330 L960 1920 Z', fill: roupa }, root);
  if (macacao) {
    el('path', { d: 'M400 1260 L540 1420 L680 1260', fill: 'none', stroke: '#1e2e40', 'stroke-width': 18 }, root);
    el('rect', { x: 620, y: 1460, width: 150, height: 110, rx: 10, fill: '#3a5a78' }, root);
    const cr = el('rect', { x: 640, y: 1480, width: 110, height: 60, rx: 6, fill: '#e8e4d8' }, root);
    const tx = el('text', { x: 695, y: 1522, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 26, fill: '#2a3e54' }, root); tx.textContent = 'VITOR';
  }
  el('rect', { x: 465, y: 1050, width: 150, height: 230, rx: 60, fill: '#bf7a4c' }, root);
  const cab = g({ transform: 'translate(540 880) scale(1.12)' }, root);
  const f = L.rosto(cab, VIT);
  if (curativo) el('rect', { x: 760, y: 870, width: 46, height: 34, rx: 8, fill: '#f4efe6', stroke: '#d8d0c4', 'stroke-width': 3 }, root);
  return { g: root, set: f.set };
}

// ---------------- DONA CIDA, SEU BRÁULIO ----------------
export function maeNaCama(parent) {
  const root = g({}, parent);
  el('rect', { x: 120, y: 1150, width: 840, height: 260, rx: 30, fill: '#e8ecf0' }, root);               // cama
  el('rect', { x: 120, y: 1380, width: 840, height: 60, fill: '#b8c4cc' }, root);
  el('ellipse', { cx: 360, cy: 1120, rx: 200, ry: 70, fill: '#ffffff' }, root);                             // travesseiro
  const cab = g({ transform: 'translate(360 1000) scale(0.62)' }, root);
  const f = L.rosto(cab, { pele: ['#e8b090', '#d09070', '#b07050'], cabelo: '#9a9a9a', olhos: '#6a4a2a', estilo: 'longo', fem: true, bravo: 0 });
  el('path', { d: 'M420 1180 Q700 1140 940 1200 L940 1380 L420 1380 Z', fill: grad([[0, '#a8c8e0'], [1, '#7aa0c0']]) }, root); // lençol
  return { g: root, set: f.set };
}
export function brauilioBusto(parent) {
  const root = g({}, parent);
  el('path', { d: 'M100 1920 L150 1320 Q540 1190 930 1320 L980 1920 Z', fill: grad([[0, '#4a6a8a'], [1, '#2a3e54']]) }, root);
  el('rect', { x: 460, y: 1050, width: 160, height: 220, rx: 60, fill: '#c98a6a' }, root);
  const cab = g({ transform: 'translate(540 880) scale(1.12)' }, root);
  const f = L.rosto(cab, { pele: ['#eaa98a', '#d48a6a', '#b06a4a'], cabelo: '#e0ddd5', sobrancelha: '#e8e4dc', olhos: '#5a5a7a', estilo: 'careca', barba: 'cheia', bravo: 0.3 });
  el('path', { d: 'M300 600 Q540 470 780 600 L790 660 L290 660 Z', fill: '#e8c030' }, cab.parentNode); // capacete de segurança
  el('rect', { x: 280, y: 640, width: 520, height: 30, rx: 12, fill: '#c8a020' }, root);
  return { g: root, set: f.set };
}

// ---------------- CENÁRIOS DA VIDA REAL ----------------
export function fabrica(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#2a3238'], [1, '#14181c']]) }, root);
  for (let i = 0; i < 4; i++) { el('rect', { x: 140 + i * 230, y: 120, width: 120, height: 18, fill: '#e8f4f0' }, root); luzCone(root, 200 + i * 230, 138, 360, 900, 'rgba(220,255,240,0.10)'); }
  for (let i = 0; i < 6; i++) el('rect', { x: i * 190 - 20, y: 300, width: 14, height: 1000, fill: '#1e2428' }, root);                   // pilares
  el('rect', { y: 1300, width: 1080, height: 620, fill: grad([[0, '#3a4046'], [1, '#22262a']]) }, root);                                   // piso
  for (let i = 0; i < 8; i++) el('rect', { x: 0, y: 1320 + i * 75, width: 1080, height: 3, fill: 'rgba(255,255,255,0.04)' }, root);
  el('path', { d: 'M0 1340 h1080', stroke: '#e8c030', 'stroke-width': 10, 'stroke-dasharray': '50 30' }, root);                          // faixa amarela
  // bobinadeira
  const maq = g({ transform: 'translate(540 1160)' }, root);
  el('rect', { x: -330, y: -160, width: 660, height: 420, rx: 20, fill: grad([[0, '#5a7a6a'], [1, '#34483e']]) }, maq);
  el('rect', { x: -300, y: -130, width: 220, height: 140, rx: 10, fill: '#1e2a26' }, maq);
  el('rect', { x: -280, y: -110, width: 180, height: 50, rx: 6, fill: '#3fd26a', opacity: 0.6 }, maq);
  for (let i = 0; i < 4; i++) el('circle', { cx: -260 + i * 50, cy: -20, r: 14, fill: ['#e83a3a', '#e8c030', '#3fd26a', '#3a8ae8'][i] }, maq);
  const bobina = g({ transform: 'translate(150 -40)' }, maq);
  el('circle', { r: 120, fill: grad([[0, '#e89a5a'], [0.6, '#c8703a'], [1, '#8a4a22']], { radial: true, cx: 0.4, cy: 0.4, r: 0.7 }) }, bobina);
  const espiras = g({ stroke: 'rgba(255,220,170,0.6)', 'stroke-width': 3, fill: 'none' }, bobina);
  for (let r = 40; r < 120; r += 9) el('circle', { r }, espiras);
  el('circle', { r: 30, fill: '#3a3a40' }, bobina);
  const raio = el('line', { x1: 0, y1: 0, x2: 0, y2: -110, stroke: '#3a3a40', 'stroke-width': 10 }, bobina);
  el('path', { d: 'M-60 -400 Q60 -250 150 -160', fill: 'none', stroke: '#e89a5a', 'stroke-width': 5 }, maq);                            // fio de cobre
  const faisca = g({ opacity: 0 }, maq); el('circle', { cx: 150, cy: -160, r: 40, fill: L.P.brilho }, faisca);
  return { g: root, set: (t) => { raio.setAttribute('transform', `rotate(${t * 720})`); espiras.setAttribute('transform', `rotate(${t * 720})`); faisca.setAttribute('opacity', 0.4 + 0.4 * Math.sin(t * 30)); } };
}
export function onibus(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#3a4450'], [1, '#1a1e24']]) }, root);
  const fora = g({}, root);
  el('rect', { x: 60, y: 380, width: 960, height: 520, rx: 30, fill: grad([[0, '#1a2440'], [1, '#e8a070']]) }, root);                   // janela (amanhecer)
  const pred = g({}, root); for (let i = 0; i < 14; i++) el('rect', { x: i * 160, y: 620 - (i % 3) * 80, width: 120, height: 280 + (i % 3) * 80, fill: '#1a1e2a' }, pred);
  el('rect', { x: 60, y: 380, width: 960, height: 520, rx: 30, fill: 'none', stroke: '#2a3038', 'stroke-width': 30 }, root);
  el('rect', { x: 0, y: 140, width: 1080, height: 20, fill: '#8a9098' }, root);                                                       // barra
  for (let i = 0; i < 5; i++) { el('line', { x1: 120 + i * 210, y1: 160, x2: 120 + i * 210, y2: 260, stroke: '#8a9098', 'stroke-width': 6 }, root); el('rect', { x: 95 + i * 210, y: 255, width: 50, height: 70, rx: 18, fill: 'none', stroke: '#c8ccd2', 'stroke-width': 8 }, root); }
  // passageiros (silhuetas)
  for (let i = 0; i < 6; i++) { const x = 80 + i * 180; el('circle', { cx: x, cy: 1040, r: 70, fill: '#22262e' }, root); el('path', { d: `M${x - 110} 1920 L${x - 100} 1130 Q${x} 1080 ${x + 100} 1130 L${x + 110} 1920 Z`, fill: '#22262e' }, root); }
  return { g: root, set: (t) => pred.setAttribute('transform', `translate(${-(t * 300) % 160} 0)`) };
}
export function hospital(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#c8d4dc'], [1, '#98a8b4']]) }, root);
  el('rect', { x: 620, y: 260, width: 360, height: 460, rx: 10, fill: grad([[0, '#2a3a5a'], [1, '#5a6a8a']]) }, root);                // janela noturna
  el('rect', { x: 620, y: 260, width: 360, height: 460, rx: 10, fill: 'none', stroke: '#e8ecf0', 'stroke-width': 18 }, root);
  const mon = g({ transform: 'translate(150 520)' }, root);
  el('rect', { width: 300, height: 200, rx: 16, fill: '#1a2226' }, mon);
  const linha = el('polyline', { fill: 'none', stroke: '#3fd26a', 'stroke-width': 5 }, mon);
  el('rect', { x: 0, y: 1440, width: 1080, height: 480, fill: '#7a8a94' }, root);
  return { g: root, set: (t) => { let pts = ''; for (let x = 0; x <= 280; x += 8) { const ph = ((x / 280) + t * 0.8) % 1; const y = 100 + (ph > 0.45 && ph < 0.5 ? -70 : ph > 0.5 && ph < 0.53 ? 40 : 0); pts += `${x + 10},${y} `; } linha.setAttribute('points', pts); } };
}
export function pontoOnibus(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#2a2438'], [1, '#14121c']]) }, root);
  for (let i = 0; i < 8; i++) el('rect', { x: i * 150 - 30, y: 500 + (i % 3) * 120, width: 110, height: 900, fill: '#1a1828' }, root);
  el('rect', { y: 1500, width: 1080, height: 420, fill: '#2a2a30' }, root);
  const placa = g({ transform: 'translate(540 960)' }, root);
  el('rect', { x: -340, y: -520, width: 680, height: 920, rx: 20, fill: '#f4f8fc' }, placa);                                          // outdoor iluminado
  el('rect', { x: -340, y: -520, width: 680, height: 920, rx: 20, fill: 'none', stroke: '#3a3a44', 'stroke-width': 24 }, placa);
  el('circle', { cx: 0, cy: -280, r: 130, fill: grad([[0, '#7ae0e8'], [1, '#2a8ab0']], { radial: true, cx: 0.5, cy: 0.5, r: 0.6 }) }, placa);
  el('path', { d: 'M-60 -320 q60 -60 120 0 q-20 80 -60 100 q-40 -20 -60 -100 Z', fill: '#f4f8fc', opacity: 0.85 }, placa);            // lua/sono
  const t1 = el('text', { x: 0, y: -60, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 92, fill: '#1a2a44' }, placa); t1.textContent = 'MORFEU LABS';
  const t2 = el('text', { x: 0, y: 30, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 46, fill: '#2a8ab0' }, placa); t2.textContent = 'DURMA. JOGUE. GANHE TEMPO.';
  const t3 = el('text', { x: 0, y: 140, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 70, fill: '#e8a030' }, placa); t3.textContent = 'TEMPO = DINHEIRO';
  el('rect', { x: -340, y: 300, width: 680, height: 100, fill: '#1a2a44' }, placa);
  const t4 = el('text', { x: 0, y: 368, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 44, fill: '#fff' }, placa); t4.textContent = 'INSCREVA-SE HOJE';
  const brilho = el('rect', { x: -340, y: -520, width: 680, height: 920, rx: 20, fill: 'rgba(160,230,255,0.08)' }, placa);
  return { g: root, set: (t) => brilho.setAttribute('opacity', 0.6 + 0.4 * Math.sin(t * 8) * Math.sin(t * 3.1)) };
}
export function clinica(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#f8fbfd'], [1, '#d8e4ec']]) }, root);
  for (let i = 0; i < 3; i++) el('rect', { x: 120 + i * 300, y: 200, width: 240, height: 24, rx: 12, fill: '#ffffff', stroke: '#c8dce8', 'stroke-width': 4 }, root);
  const logo = el('text', { x: 540, y: 420, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 80, fill: '#2a8ab0', opacity: 0.35 }, root); logo.textContent = 'MORFEU LABS';
  el('rect', { x: 160, y: 1200, width: 760, height: 90, rx: 16, fill: '#ffffff', stroke: '#c8dce8', 'stroke-width': 6 }, root);       // mesa
  // pilha de contrato
  const pilha = g({ transform: 'translate(540 1150)' }, root);
  for (let i = 0; i < 12; i++) el('rect', { x: -230 + i * 1.5, y: -i * 6, width: 300, height: 380, fill: i % 2 ? '#ffffff' : '#f0f0ea', stroke: '#d8d8d0', 'stroke-width': 2, transform: `rotate(${(i % 3 - 1) * 1.5})` }, pilha);
  const linhas = g({ fill: '#b8b8b0' }, pilha); for (let i = 0; i < 14; i++) el('rect', { x: -200, y: -50 + i * 22, width: 180 + (i % 3) * 30, height: 8 }, linhas);
  const caneta = g({}, root); el('rect', { x: -8, y: -140, width: 16, height: 140, rx: 6, fill: '#2a2a30' }, caneta); el('path', { d: 'M-8 0 l8 24 l8 -24 Z', fill: '#c8a040' }, caneta);
  return { g: root, set: (t) => caneta.setAttribute('transform', `translate(${480 + 60 * Math.sin(t * 9)} ${1200 + 20 * Math.cos(t * 13)}) rotate(25)`) };
}
export function quartoNoite(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#141a2a'], [1, '#0a0c14']]) }, root);
  el('rect', { x: 640, y: 300, width: 320, height: 420, fill: grad([[0, '#1a2a4a'], [1, '#2a3a5a']]) }, root);                          // janela
  el('circle', { cx: 860, cy: 400, r: 50, fill: '#e8ecf4', opacity: 0.85 }, root);                                                     // lua
  el('rect', { x: 640, y: 300, width: 320, height: 420, fill: 'none', stroke: '#2a2a36', 'stroke-width': 18 }, root);
  el('line', { x1: 800, y1: 300, x2: 800, y2: 720, stroke: '#2a2a36', 'stroke-width': 12 }, root);
  luzCone(root, 800, 720, 700, 900, 'rgba(150,180,255,0.10)');
  // criado-mudo + despertador
  el('rect', { x: 60, y: 1180, width: 220, height: 220, rx: 10, fill: '#2a2026' }, root);
  const desp = g({ transform: 'translate(170 1130)' }, root);
  el('rect', { x: -80, y: -50, width: 160, height: 90, rx: 16, fill: '#1a1a1e' }, desp);
  const hora = el('text', { x: 0, y: 18, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 54, fill: '#e83a3a' }, desp); hora.textContent = '21:47';
  // cama (vista de cima/frente)
  el('rect', { x: 260, y: 1250, width: 820, height: 670, rx: 30, fill: '#2a3040' }, root);
  el('ellipse', { cx: 560, cy: 1290, rx: 230, ry: 70, fill: '#d8dce4' }, root);
  return { g: root, set: (t, txt = null) => { if (txt) hora.textContent = txt; } };
}

// ---------------- HUD ----------------
export function relogioHUD(parent, { modo = 'real' } = {}) {      // canto superior direito
  const cor = modo === 'jogo' ? '#ffd400' : '#5ef0d8';
  const gg = g({ transform: 'translate(1050 70)' }, parent);
  const bg = el('rect', { x: -470, y: -10, width: 470, height: 120, rx: 18, fill: 'rgba(0,0,0,0.55)', stroke: cor, 'stroke-width': 4 }, gg);
  const lb = el('text', { x: -450, y: 30, 'font-family': 'Anton', 'font-size': 30, fill: cor }, gg); lb.textContent = 'TEMPO DE VIDA';
  const tx = el('text', { x: -450, y: 92, 'font-family': 'Anton', 'font-size': 58, fill: '#fff' }, gg);
  const delta = el('text', { x: -20, y: 160, 'text-anchor': 'end', 'font-family': 'Anton', 'font-size': 54, fill: '#ffd400', opacity: 0 }, gg);
  return {
    g: gg,
    set: ({ texto, show = 1, deltaTxt = '', deltaK = 0, falha = 0, cor2 = null }) => {
      gg.setAttribute('opacity', show); tx.textContent = texto;
      if (cor2) { bg.setAttribute('stroke', cor2); lb.setAttribute('fill', cor2); } else { bg.setAttribute('stroke', cor); lb.setAttribute('fill', cor); }
      delta.textContent = deltaTxt; delta.setAttribute('opacity', deltaK); delta.setAttribute('transform', `translate(0 ${-30 * deltaK})`);
      gg.setAttribute('transform', `translate(${1050 + (falha ? (Math.random() - 0.5) * 20 : 0)} 70)`);
    },
  };
}
export function hudJogo(parent) {                                   // barra de vida e de fadiga (canto superior esquerdo)
  const gg = g({ transform: 'translate(40 60)' }, parent);
  el('rect', { width: 420, height: 130, rx: 16, fill: 'rgba(0,0,0,0.55)' }, gg);
  const nm = el('text', { x: 20, y: 40, 'font-family': 'Anton', 'font-size': 32, fill: '#fff' }, gg); nm.textContent = 'VITORIOSO · NV 1';
  el('rect', { x: 20, y: 58, width: 380, height: 26, rx: 8, fill: '#3a1010' }, gg); const vida = el('rect', { x: 20, y: 58, width: 380, height: 26, rx: 8, fill: '#e83a3a' }, gg);
  el('rect', { x: 20, y: 94, width: 380, height: 18, rx: 6, fill: '#1a2a3a' }, gg); const fad = el('rect', { x: 20, y: 94, width: 60, height: 18, rx: 6, fill: '#8a6ae8' }, gg);
  return { g: gg, set: ({ nivel = 1, hp = 1, fadiga = 0.15 }) => { nm.textContent = `VITORIOSO · NV ${nivel}`; vida.setAttribute('width', 380 * hp); fad.setAttribute('width', 380 * fadiga); } };
}
export function plateia(parent, msgs, seed = 9) {                   // balões de comentário subindo pela lateral
  const R = rng(seed), gg = g({}, parent);
  const bs = msgs.map(([nome, txt], i) => {
    const b = g({}, gg); const w = Math.max(320, txt.length * 22 + 60);
    el('rect', { x: 0, y: 0, width: w, height: 96, rx: 22, fill: 'rgba(20,20,30,0.82)', stroke: 'rgba(255,255,255,0.25)', 'stroke-width': 2 }, b);
    const n = el('text', { x: 22, y: 34, 'font-family': 'Anton', 'font-size': 26, fill: ['#5ef0d8', '#ffd400', '#ff8ab0', '#8ac8ff'][i % 4] }, b); n.textContent = '@' + nome;
    const tt = el('text', { x: 22, y: 76, 'font-family': 'Anton', 'font-size': 36, fill: '#fff' }, b); tt.textContent = txt;
    return { b, x: R() > 0.5 ? 40 : 1040 - w, ph: i * 0.9 };
  });
  const cont = g({ transform: 'translate(40 230)' }, gg);
  el('rect', { width: 330, height: 64, rx: 32, fill: '#e83a3a' }, cont); const cn = el('text', { x: 165, y: 45, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 34, fill: '#fff' }, cont);
  return { g: gg, set: (t, viewers = 312) => { cn.textContent = `● AO VIVO · ${viewers}`; bs.forEach((s) => { const k = t - s.ph; s.b.style.display = k > 0 && k < 4 ? '' : 'none'; s.b.setAttribute('transform', `translate(${s.x} ${1300 - k * 160})`); s.b.setAttribute('opacity', clamp(Math.min(k * 3, (4 - k) * 2))); }); } };
}
export function numerosTempo(parent) {                              // "+20 min" dourado subindo
  const gg = g({}, parent), pool = Array.from({ length: 8 }, () => { const t = el('text', { 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 80, fill: '#ffd400', 'paint-order': 'stroke', stroke: '#5a3a00', 'stroke-width': 10 }, gg); return t; });
  return { set: (t, eventos) => { pool.forEach((p) => (p.style.display = 'none')); eventos.forEach(([t0, x, y, txt], i) => { const k = t - t0; if (k < 0 || k > 1.4 || i >= pool.length) return; const p = pool[i]; p.style.display = ''; p.textContent = txt; p.setAttribute('x', x); p.setAttribute('y', y - k * 180); p.setAttribute('opacity', clamp((1.4 - k) * 2)); p.setAttribute('font-size', 80 + 20 * Math.max(0, 0.2 - k) * 5); }); } };
}
export function pixels(parent, seed = 4) {                          // transição: tela se desfaz em pixels
  const R = rng(seed), gg = g({}, parent), cells = [];
  for (let y = 0; y < 1920; y += 120) for (let x = 0; x < 1080; x += 120) cells.push({ e: el('rect', { x, y, width: 120, height: 120, fill: R() > 0.5 ? '#0a0c14' : '#141a2a' }, gg), d: R() });
  return { set: (k) => cells.forEach((c) => { const v = clamp((k - c.d * 0.6) / 0.4); c.e.setAttribute('opacity', v); c.e.setAttribute('transform', `translate(${c.e.getAttribute('x')} ${c.e.getAttribute('y')}) scale(${v}) translate(${-c.e.getAttribute('x')} ${-c.e.getAttribute('y')})`); }) };
}

// ---------------- JOGO ----------------
export function campoDourado(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#6ab0e8'], [0.55, '#f8d8a0'], [1, '#e8b060']]) }, root);
  el('circle', { cx: 820, cy: 520, r: 110, fill: '#fff4d0', opacity: 0.9 }, root);
  el('path', { d: 'M0 1000 Q300 880 600 960 Q850 1020 1080 920 L1080 1920 L0 1920 Z', fill: '#8ab060' }, root);
  el('path', { d: 'M0 1150 Q400 1060 1080 1140 L1080 1920 L0 1920 Z', fill: grad([[0, '#d8b050'], [1, '#b08a30']]) }, root);
  const R = rng(5), trigo = g({ stroke: '#e8c870', 'stroke-width': 5 }, root), ts = [];
  for (let i = 0; i < 90; i++) { const x = R() * 1080, y = 1180 + R() * 740, h = 60 + R() * 80; ts.push({ e: el('line', { x1: x, y1: y, x2: x, y2: y - h }, trigo), x, y, h, ph: R() * 6 }); }
  return { g: root, set: (t) => ts.forEach((s) => s.e.setAttribute('x2', s.x + 12 * Math.sin(t * 2 + s.ph))) };
}
export function porao(parent) {
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: grad([[0, '#2a1a12'], [1, '#120a06']]) }, root);
  for (let r = 0; r < 14; r++) for (let c = 0; c < 6; c++) el('rect', { x: c * 190 + (r % 2) * 95 - 40, y: r * 110, width: 180, height: 100, rx: 6, fill: (r + c) % 3 ? '#3a2618' : '#32200f' }, root);
  const fogos = [];
  for (const x of [120, 960]) { el('rect', { x: x - 10, y: 600, width: 20, height: 80, fill: '#4a3020' }, root); fogos.push(L.fogo(root, x, 600, 0.25, x)); }
  el('rect', { y: 1450, width: 1080, height: 470, fill: '#1e140c' }, root);
  for (let i = 0; i < 4; i++) { const bx = 80 + i * 260; el('ellipse', { cx: bx + 80, cy: 1420, rx: 90, ry: 30, fill: '#2a1a10' }, root); el('rect', { x: bx, y: 1250, width: 160, height: 170, rx: 30, fill: '#5a3a20' }, root); el('rect', { x: bx, y: 1300, width: 160, height: 14, fill: '#3a2614' }, root); }
  return { g: root, set: (t) => fogos.forEach((f) => f.set(t)) };
}
export function rato(parent, seed = 1) {
  const R = rng(seed + 21), root = g({}, parent), c = '#5a4a4a';
  const corpo = g({}, root);
  el('path', { d: 'M-90 0 q-90 -20 -150 -90', fill: 'none', stroke: '#c88a8a', 'stroke-width': 12, 'stroke-linecap': 'round' }, corpo);
  el('ellipse', { cx: 0, cy: -60, rx: 110, ry: 70, fill: c }, corpo);
  el('ellipse', { cx: 100, cy: -80, rx: 60, ry: 45, fill: c }, corpo);
  el('circle', { cx: 90, cy: -130, r: 26, fill: '#c88a8a' }, corpo);
  el('circle', { cx: 125, cy: -88, r: 8, fill: '#ff3030' }, corpo);
  el('path', { d: 'M150 -70 l14 6 l-14 6 Z', fill: '#f0e0d0' }, corpo);
  const ph = R() * 6;
  return { g: root, set: ({ t = 0, morto = false }) => corpo.setAttribute('transform', morto ? 'rotate(180) translate(0 60) scale(1 0.8)' : `translate(${6 * Math.sin(t * 14 + ph)} ${-8 * Math.abs(Math.sin(t * 14 + ph))})`) };
}
export function contrato(parent) {                                  // página com a Cláusula 14
  const root = g({}, parent);
  el('rect', { width: 1080, height: 1920, fill: '#1a1612' }, root);
  const pg = g({ transform: 'translate(540 960) rotate(-3)' }, root);
  el('rect', { x: -420, y: -620, width: 840, height: 1180, fill: '#f6f2e8' }, pg);
  const ln = g({ fill: '#c8c2b4' }, pg); for (let i = 0; i < 26; i++) if (i < 9 || i > 13) el('rect', { x: -360, y: -560 + i * 42, width: 600 + (i % 4) * 40, height: 12 }, ln);
  const c1 = el('text', { x: -360, y: -140, 'font-family': 'Anton', 'font-size': 46, fill: '#2a2620' }, pg); c1.textContent = 'CLÁUSULA 14.';
  const lines = ['Mortes no ambiente Varnor', 'serão debitadas do', 'Tempo de Vida do usuário.'];
  const tl = lines.map((s, i) => { const t = el('text', { x: -360, y: -70 + i * 60, 'font-family': 'Anton', 'font-size': 52, fill: '#8a1010' }, pg); t.textContent = s; return t; });
  const marca = el('rect', { x: -370, y: -120, width: 720, height: 0, fill: 'rgba(255,220,0,0.35)' }, pg);
  return { g: root, pg, set: (k) => marca.setAttribute('height', 200 * clamp(k)) };
}

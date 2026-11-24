// Biblioteca 2D vetorial de A Coroa de Varnor: personagens chapados com sombreado suave, rostos expressivos,
// quadros técnicos ("laboratório"), chuva, fogo e legendas. Tudo SVG, desenhado por código (original).
export const NS = 'http://www.w3.org/2000/svg';
export const svg = document.getElementById('tela');
export function el(tag, attrs = {}, parent = svg) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent.appendChild(e); return e;
}
export const g = (attrs = {}, parent = svg) => el('g', attrs, parent);
export const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const rel = (t, a, b) => (t - a) / (b - a);
export function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
export const defs = el('defs');
let gid = 0;
export function grad(stops, { radial = false, x1 = 0, y1 = 0, x2 = 0, y2 = 1, cx = 0.4, cy = 0.35, r = 0.8 } = {}) {
  const id = 'gr' + (gid++);
  const gr = el(radial ? 'radialGradient' : 'linearGradient', radial ? { id, cx, cy, r } : { id, x1, y1, x2, y2 }, defs);
  stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gr)); return `url(#${id})`;
}
export function filtroSat() { const id = 'sat' + (gid++); const f = el('filter', { id }, defs); const m = el('feColorMatrix', { type: 'saturate', values: '1' }, f); return { url: `url(#${id})`, set: (v) => m.setAttribute('values', v.toFixed(3)) }; }
const blurF = el('filter', { id: 'blur8', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); el('feGaussianBlur', { stdDeviation: 8 }, blurF);
export const P = {   // paleta
  aco: grad([[0, '#7a8496'], [1, '#3a414d']]), acoE: grad([[0, '#525b6b'], [1, '#272c35']]), ouro: '#d4a23a',
  capa: grad([[0, '#93203a'], [1, '#4e0e1a']]), couro: grad([[0, '#7a4e2e'], [1, '#4a2e1a']]),
  brilho: grad([[0, 'rgba(255,220,100,1)'], [0.35, 'rgba(255,180,40,0.6)'], [1, 'rgba(255,160,20,0)']], { radial: true, cx: 0.5, cy: 0.5, r: 0.5 }),
  brilhoV: grad([[0, 'rgba(255,60,40,1)'], [0.35, 'rgba(255,30,20,0.55)'], [1, 'rgba(255,0,0,0)']], { radial: true, cx: 0.5, cy: 0.5, r: 0.5 }),
  boneco: grad([[0, '#f2e4ca'], [1, '#d6c4a4']]),
};
const peles = {};
const pele = (c1, c2, c3) => peles[c1] ||= grad([[0, c1], [0.7, c2], [1, c3]], { radial: true, cx: 0.4, cy: 0.32, r: 0.8 });

// ============================== ROSTO ==============================
// cabeça com centro em (0,0), raio ~200. opts: pele [c1,c2,c3], cabelo, olhos, estilo, barba, cicatriz, fem
export function rosto(parent, o = {}) {
  const [c1, c2, c3] = o.pele || ['#e8a676', '#cf8656', '#b56f45'];
  const root = g({}, parent);
  const hairC = o.cabelo || '#2a1a10', hairG = grad([[0, hairC], [1, '#0d0806']]);
  if (o.estilo === 'longo') el('path', { d: 'M-230 -60 Q-250 260 -170 330 L170 330 Q250 260 230 -60 Z', fill: hairG }, root);
  for (const s of [-1, 1]) el('ellipse', { cx: s * 205, cy: 20, rx: 32, ry: 52, fill: c2 }, root);
  const fem = o.fem ? 1 : 0;
  el('path', { d: `M-205 -70 Q-205 -300 0 -310 Q205 -300 205 -70 Q${210 - fem * 20} 140 ${70 - fem * 10} 222 Q0 ${258 - fem * 25} ${-70 + fem * 10} 222 Q${-210 + fem * 20} 140 -205 -70 Z`, fill: pele(c1, c2, c3) }, root);
  if (o.barba === 'rala') el('path', { d: 'M-180 60 Q-160 190 -70 225 Q0 258 70 225 Q160 190 180 60 Q150 140 0 160 Q-150 140 -180 60 Z', fill: 'rgba(55,28,14,0.30)' }, root);
  if (o.barba === 'cavanhaque') el('path', { d: 'M-55 140 Q0 125 55 140 Q60 215 0 240 Q-60 215 -55 140 Z', fill: hairC }, root);
  // nariz
  el('path', { d: 'M0 -10 q-10 80 -32 108 q32 20 64 0', fill: 'rgba(140,70,40,0.45)' }, root);
  // olhos
  const eyes = [], lids = [], brows = [];
  for (const s of [-1, 1]) {
    const e = g({ transform: `translate(${s * 88} -20)` }, root);
    el('ellipse', { cx: 0, cy: 0, rx: 44, ry: 27 - fem * 2, fill: '#f6efe6' }, e);
    const iris = g({}, e);
    el('circle', { cx: -s * 4, cy: 2, r: 18, fill: o.olhos || '#3a78c0' }, iris); el('circle', { cx: -s * 4, cy: 2, r: 9, fill: '#0a0a0a' }, iris);
    el('circle', { cx: -s * 4 + 6, cy: -4, r: 4, fill: '#fff' }, iris);
    if (fem) el('path', { d: 'M-46 -6 q46 -34 92 0', fill: 'none', stroke: '#1a0f08', 'stroke-width': 7 }, e);
    const lid = el('rect', { x: -48, y: -34, width: 96, height: 12, fill: c2 }, e);
    eyes.push(iris); lids.push(lid);
    brows.push(el('path', { d: '', stroke: o.sobrancelha || hairC, 'stroke-width': fem ? 12 : 24, 'stroke-linecap': 'round', fill: 'none' }, root));
  }
  // boca
  const mouth = g({ transform: 'translate(0 150)' }, root);
  const mOpen = el('ellipse', { cx: 0, cy: 6, rx: 44, ry: 4, fill: '#4a1414' }, mouth);
  const mTeeth = el('rect', { x: -30, y: 2, width: 60, height: 0, fill: '#f4efe6', rx: 4 }, mouth);
  const mLine = el('path', { d: 'M-52 0 q52 10 104 0', fill: 'none', stroke: '#7a3a28', 'stroke-width': 9, 'stroke-linecap': 'round' }, mouth);
  if (o.barba === 'rala' || o.barba === 'cavanhaque') el('path', { d: 'M-62 -22 q62 -16 124 0', fill: 'none', stroke: o.barba === 'cavanhaque' ? hairC : 'rgba(55,28,14,0.5)', 'stroke-width': 11, 'stroke-linecap': 'round' }, mouth);
  if (o.cicatriz) el('rect', { x: -48, y: -4, width: 8, height: 22, fill: '#b01818', rx: 3 }, mouth);
  if (o.barba === 'cheia') {
    const bb = grad([[0, '#f4f2ec'], [1, '#c8c4bc']]);
    el('path', { d: 'M-200 20 Q-200 250 -90 330 Q0 380 90 330 Q200 250 200 20 Q160 130 0 120 Q-160 130 -200 20 Z', fill: bb }, root);
    el('path', { d: 'M-90 115 q90 -50 180 0 q-30 25 -90 15 q-60 10 -90 -15 Z', fill: '#e8e4dc' }, root);   // bigode
  }
  // cabelo
  const hair = g({ fill: hairG }, root);
  const R = rng(o.seed || 7);
  if (o.estilo === 'cachos') {
    el('path', { d: 'M-210 -60 Q-220 -320 0 -335 Q220 -320 210 -60 Q180 -200 0 -200 Q-180 -200 -210 -60 Z' }, hair);
    for (let i = 0; i < 26; i++) { const a = Math.PI * (0.03 + 0.94 * R()); el('circle', { cx: -Math.cos(a) * (190 + R() * 30), cy: -200 - Math.sin(a) * (95 + R() * 40), r: 36 + R() * 18 }, hair); }
  } else if (o.estilo === 'penteado') {
    el('path', { d: 'M-212 -40 Q-225 -330 0 -340 Q225 -330 212 -40 Q190 -230 40 -250 Q-120 -240 -212 -40 Z' }, hair);
    el('path', { d: 'M-150 -270 Q0 -330 160 -250', fill: 'none', stroke: 'rgba(255,255,255,0.12)', 'stroke-width': 10 }, hair);
  } else if (o.estilo === 'longo') {
    el('path', { d: 'M-215 -30 Q-230 -330 0 -340 Q230 -330 215 -30 Q190 -230 0 -240 Q-60 -200 -140 -150 Q-190 -100 -215 -30 Z' }, hair);
  } else if (o.estilo === 'careca') {
    for (const s of [-1, 1]) el('path', { d: `M${s * 200} -60 q${s * 20} 60 ${s * 5} 110 l${-s * 25} 0 q${-s * 5} -60 ${s * 20} -110 Z`, fill: '#e0ddd5' }, hair);
    el('path', { d: 'M-90 -250 q90 -40 180 0', fill: 'none', stroke: 'rgba(255,255,255,0.25)', 'stroke-width': 14, 'stroke-linecap': 'round' }, root);
  } else if (o.estilo === 'capuz') {
    el('path', { d: 'M-250 260 Q-290 -330 0 -360 Q290 -330 250 260 L210 260 Q240 -200 0 -230 Q-240 -200 -210 260 Z', fill: o.capuzCor || '#2a2236' }, root);
  }
  const glow = g({ opacity: 0 }, root);
  for (const s of [-1, 1]) { el('circle', { cx: s * 88, cy: -18, r: 120, fill: o.glowVermelho ? P.brilhoV : P.brilho }, glow); el('circle', { cx: s * 88, cy: -18, r: 20, fill: o.glowVermelho ? '#ff8070' : '#ffe680' }, glow); }
  const bravo = o.bravo ?? 0.6;
  function set({ boca = 0, expr = 'serio', piscar = 0, brilho = 0, olharX = 0 } = {}) {
    const ang = { serio: bravo, bravo: 1, riso: -0.4, surpreso: -0.8, triste: -0.6, neutro: 0.2 }[expr] ?? bravo;
    brows.forEach((b, i) => { const s = i ? 1 : -1, y0 = -82 - (expr === 'surpreso' ? 26 : 0); b.setAttribute('d', `M${s * 40} ${y0 + ang * 14} L${s * 150} ${y0 - ang * 18}`); });
    const lidH = Math.max(12 + (expr === 'bravo' || expr === 'serio' ? 10 * bravo : 0) - (expr === 'surpreso' ? 12 : 0), 54 * piscar);
    lids.forEach((l) => l.setAttribute('height', lidH));
    eyes.forEach((e) => e.setAttribute('transform', `translate(${olharX * 14} 0)`));
    const open = clamp(boca);
    if (expr === 'riso') { mLine.setAttribute('d', 'M-60 -6 q60 50 120 0'); mOpen.setAttribute('ry', 10 + open * 26); mOpen.setAttribute('cy', 14); mTeeth.setAttribute('height', 10); }
    else if (expr === 'surpreso') { mLine.setAttribute('d', 'M-20 0 q20 6 40 0'); mOpen.setAttribute('rx', 24); mOpen.setAttribute('ry', 20 + open * 12); mTeeth.setAttribute('height', 0); }
    else { mLine.setAttribute('d', `M-52 ${-open * 4} q52 ${expr === 'triste' ? -14 : 10} 104 0`); mOpen.setAttribute('rx', 44); mOpen.setAttribute('ry', 2 + open * 30); mOpen.setAttribute('cy', 6 + open * 12); mTeeth.setAttribute('height', open > 0.3 ? 10 : 0); }
    glow.setAttribute('opacity', brilho);
  }
  set(); return { g: root, set };
}

// ============================== VITORIOSO ==============================
const VIT = { pele: ['#e8a676', '#cf8656', '#b56f45'], cabelo: '#2a1a10', olhos: '#3a78c0', estilo: 'cachos', barba: 'rala', cicatriz: true, bravo: 0.55 };
export function vitoriosoBusto(parent) {        // close: ombros + cabeça (centro do rosto em 540,880)
  const root = g({}, parent);
  el('path', { d: 'M150 1920 L190 1250 Q540 1150 890 1250 L930 1920 Z', fill: P.capa }, root);
  el('path', { d: 'M200 1400 Q540 1180 880 1400 L900 1920 L180 1920 Z', fill: P.aco }, root);
  el('path', { d: 'M540 1300 L540 1920', stroke: '#2a3039', 'stroke-width': 14 }, root);
  el('path', { d: 'M260 1420 Q540 1260 820 1420', fill: 'none', stroke: P.ouro, 'stroke-width': 12 }, root);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) el('ellipse', { cx: 540 + s * (300 + k * 20), cy: 1290 + k * 70, rx: 190 - k * 15, ry: 120 - k * 10, fill: k % 2 ? P.acoE : P.aco }, root);
    el('path', { d: `M${540 + s * 140} 1240 q${s * 170} -40 ${s * 330} 60`, fill: 'none', stroke: P.ouro, 'stroke-width': 9 }, root);
  }
  el('ellipse', { cx: 540, cy: 1205, rx: 180, ry: 60, fill: '#2b313b' }, root);
  el('rect', { x: 465, y: 1050, width: 150, height: 170, rx: 60, fill: '#bf7a4c' }, root);
  const cab = g({ transform: 'translate(540 880) scale(1.12)' }, root);
  const f = rosto(cab, VIT);
  return { g: root, set: f.set };
}
export function escudoTorre(parent, { rachado = false, x = 0, y = 0, s = 1 } = {}) {
  const sh = g({ transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('path', { d: 'M-150 -280 h300 v460 q0 60 -150 110 q-150 -50 -150 -110 Z', fill: P.aco, stroke: P.ouro, 'stroke-width': 14, 'stroke-linejoin': 'round' }, sh);
  el('path', { d: 'M-60 -60 v-70 h30 v25 h20 v-25 h20 v25 h20 v-25 h30 v70 h-30 v80 h-60 v-80 Z', fill: '#a8afbb' }, sh);
  el('path', { d: 'M-15 20 v-40 a15 15 0 0 1 30 0 v40 Z', fill: '#1a1c22' }, sh);
  for (let i = 0; i < 7; i++) for (const xx of [-125, 125]) el('circle', { cx: xx, cy: -250 + i * 70, r: 7, fill: P.ouro }, sh);
  if (rachado) el('path', { d: 'M-120 -270 l40 70 l-30 60 l60 80 l-20 70 l70 90 l-20 60', fill: 'none', stroke: '#0a0a0c', 'stroke-width': 10, 'stroke-linejoin': 'round' }, sh);
  return sh;
}
// corpo inteiro (pés na origem, altura ~980). set({ crava: 0..1, ...rosto })
export function vitoriosoCorpo(parent, { rachado = false } = {}) {
  const root = g({}, parent);
  const body = g({}, root);
  el('path', { d: 'M-150 -720 Q-210 -300 -190 -60 L190 -60 Q210 -300 150 -720 Z', fill: P.capa }, body);       // capa atrás
  for (const s of [-1, 1]) {
    el('rect', { x: s * 70 - 48, y: -420, width: 96, height: 380, rx: 40, fill: '#3a2a22' }, body);              // pernas
    el('rect', { x: s * 70 - 52, y: -300, width: 104, height: 170, rx: 30, fill: P.aco }, body);                 // grevas
    el('circle', { cx: s * 70, cy: -330, r: 44, fill: P.acoE }, body);
    el('rect', { x: s * 70 - 62, y: -70, width: 130, height: 70, rx: 26, fill: P.couro }, body);                 // botas
  }
  el('path', { d: 'M-170 -760 Q0 -820 170 -760 L150 -420 Q0 -380 -150 -420 Z', fill: P.aco }, body);            // peitoral
  el('path', { d: 'M-150 -470 Q0 -430 150 -470', fill: 'none', stroke: P.ouro, 'stroke-width': 12 }, body);
  el('rect', { x: -160, y: -470, width: 320, height: 60, rx: 20, fill: P.couro }, body);                        // cinto
  for (let k = 0; k < 2; k++) el('path', { d: `M-150 ${-415 + k * 50} h300 l-20 50 h-260 Z`, fill: k ? P.acoE : P.aco }, body);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) el('ellipse', { cx: s * (170 + k * 10), cy: -760 + k * 45, rx: 105 - k * 10, ry: 70 - k * 8, fill: k % 2 ? P.acoE : P.aco }, body);
  el('rect', { x: 150, y: -720, width: 80, height: 330, rx: 36, fill: P.aco }, body);                            // braço da espada
  const espada = g({ transform: 'translate(195 -380) rotate(18)' }, body);
  el('rect', { x: -12, y: 0, width: 24, height: 330, rx: 6, fill: '#d8dce4' }, espada); el('rect', { x: -50, y: -10, width: 100, height: 20, rx: 8, fill: P.ouro }, espada);
  el('rect', { x: -60, y: -860, width: 120, height: 110, rx: 40, fill: '#bf7a4c' }, body);                      // pescoço
  const cab = g({ transform: 'translate(0 -1010) scale(0.62)' }, body);
  const f = rosto(cab, VIT);
  const shield = g({}, body);
  escudoTorre(shield, { rachado, x: -150, y: -470, s: 0.95 });
  el('rect', { x: -250, y: -720, width: 80, height: 300, rx: 36, fill: P.aco }, body);                          // braço do escudo (atrás do escudo? na frente)
  function set(p = {}) {
    const c = clamp(p.crava ?? 0);
    body.setAttribute('transform', `translate(0 ${c * 60}) rotate(${c * 4})`);
    shield.setAttribute('transform', `translate(${-20 * c} ${130 * c})`);
    f.set(p);
  }
  set(); return { g: root, set };
}

// ============================== BRAM, LIRA, DRAVEN ==============================
function corpoSimples(parent, { roupa, roupa2, larg = 170, saia = false, capa = null }) {
  const b = g({}, parent);
  if (capa) el('path', { d: `M${-larg + 20} -720 Q${-larg - 60} -300 ${-larg - 30} -40 L${larg + 30} -40 Q${larg + 60} -300 ${larg - 20} -720 Z`, fill: capa }, b);
  if (saia) el('path', { d: `M${-larg + 30} -470 L${-larg - 40} -10 L${larg + 40} -10 L${larg - 30} -470 Z`, fill: roupa }, b);
  else for (const s of [-1, 1]) { el('rect', { x: s * 70 - 50, y: -440, width: 100, height: 400, rx: 40, fill: roupa2 }, b); el('rect', { x: s * 70 - 60, y: -70, width: 130, height: 70, rx: 26, fill: '#3a2618' }, b); }
  el('path', { d: `M${-larg} -760 Q0 -820 ${larg} -760 L${larg - 20} -420 Q0 -390 ${-larg + 20} -420 Z`, fill: roupa }, b);
  for (const s of [-1, 1]) el('rect', { x: s * (larg + 10) - 40, y: -740, width: 80, height: 340, rx: 36, fill: roupa }, b);
  el('rect', { x: -60, y: -860, width: 120, height: 110, rx: 40, fill: '#c98a62' }, b);
  return b;
}
export function bram(parent) {
  const root = g({}, parent);
  const b = corpoSimples(root, { roupa: grad([[0, '#9a8a72'], [1, '#6a5c48']]), roupa2: '#4a3c30', larg: 200 });
  el('path', { d: 'M-150 -720 h300 l20 640 h-340 Z', fill: P.couro }, b);                           // avental
  const m = g({ transform: 'translate(250 -420) rotate(-25)' }, b);
  el('rect', { x: -12, y: -260, width: 24, height: 300, rx: 8, fill: '#6a4a2a' }, m); el('rect', { x: -70, y: -300, width: 140, height: 70, rx: 12, fill: '#4a4a52' }, m);
  const cab = g({ transform: 'translate(0 -1010) scale(0.62)' }, b);
  const f = rosto(cab, { pele: ['#eaa98a', '#d48a6a', '#b06a4a'], cabelo: '#e0ddd5', sobrancelha: '#e8e4dc', olhos: '#5a5a7a', estilo: 'careca', barba: 'cheia', bravo: 0.1 });
  return { g: root, set: f.set };
}
export function lira(parent) {
  const root = g({}, parent);
  const b = corpoSimples(root, { roupa: grad([[0, '#f2ece0'], [1, '#c8c0ae']]), larg: 140, saia: true, capa: grad([[0, '#3f8a4e'], [1, '#22502c']]) });
  el('rect', { x: -20, y: -760, width: 40, height: 330, fill: '#3f7a4a' }, b);
  const cj = g({ transform: 'translate(220 -40)' }, b);
  el('rect', { x: -10, y: -1000, width: 20, height: 1000, rx: 8, fill: '#6a4a2a' }, cj);
  el('circle', { cx: 0, cy: -1030, r: 80, fill: grad([[0, 'rgba(140,255,170,0.9)'], [1, 'rgba(60,220,120,0)']], { radial: true, cx: 0.5, cy: 0.5, r: 0.5 }) }, cj);
  el('path', { d: 'M0 -1080 l30 50 l-30 50 l-30 -50 Z', fill: '#a8ffc0' }, cj);
  const cab = g({ transform: 'translate(0 -990) scale(0.58)' }, b);
  const f = rosto(cab, { pele: ['#f4c4a4', '#e2a482', '#c4825e'], cabelo: '#7a3e1e', olhos: '#3a8a4a', estilo: 'longo', fem: true, bravo: 0 });
  return { g: root, set: f.set };
}
export function draven(parent) {
  const root = g({}, parent);
  const b = corpoSimples(root, { roupa: grad([[0, '#3a3c46'], [1, '#15161b']]), roupa2: '#1a1b20', larg: 175, capa: grad([[0, '#1a1a22'], [1, '#050508']]) });
  for (let i = 0; i < 11; i++) el('circle', { cx: -170 + i * 34, cy: -780 + Math.abs(i - 5) * 4, r: 34, fill: '#5a5456' }, b);        // gola de pele
  el('path', { d: 'M-90 -640 l90 40 l90 -40 l-20 30 l-70 30 l-70 -30 Z', fill: '#c8ccd6' }, b);                                  // corvo prateado
  el('circle', { cx: 0, cy: -590, r: 16, fill: '#c8ccd6' }, b);
  const cab = g({ transform: 'translate(0 -1010) scale(0.62)' }, b);
  const f = rosto(cab, { pele: ['#ead2c0', '#d4b8a4', '#b89884'], cabelo: '#121216', olhos: '#8a94a0', estilo: 'penteado', barba: 'cavanhaque', bravo: 0.9 });
  el('path', { d: 'M-130 -1180 Q0 -1215 130 -1180', fill: 'none', stroke: '#c8ccd6', 'stroke-width': 10 }, b);                     // diadema
  return { g: root, set: f.set };
}

// ============================== BRASA, CRIATURAS, ALDEÕES, CORVO ==============================
export function brasa(parent) {
  const root = g({}, parent);
  const lar = grad([[0, '#f39a3c'], [1, '#c8661e']]);
  const tail = el('path', { d: 'M90 -40 q120 -20 110 -150', fill: 'none', stroke: '#e0782a', 'stroke-width': 30, 'stroke-linecap': 'round' }, root);
  el('ellipse', { cx: 0, cy: -80, rx: 110, ry: 85, fill: lar }, root);
  for (let i = 0; i < 3; i++) el('path', { d: `M${-40 + i * 40} -160 q10 30 0 60`, stroke: '#a8501a', 'stroke-width': 10, fill: 'none' }, root);
  el('circle', { cx: -60, cy: -190, r: 70, fill: lar }, root);
  for (const s of [-1, 1]) el('path', { d: `M${-60 + s * 28} -240 l${s * 30} -60 l${s * 10} 70 Z`, fill: '#e0782a' }, root);
  el('ellipse', { cx: -60, cy: -165, rx: 30, ry: 22, fill: '#f6ece0' }, root);
  const olhos = [-1, 1].map((s) => el('ellipse', { cx: -60 + s * 26, cy: -200, rx: 10, ry: 12, fill: '#f0b020' }, root));
  for (const x of [-70, 40]) el('rect', { x, y: -40, width: 34, height: 40, rx: 14, fill: '#e0782a' }, root);
  return { g: root, set: ({ t = 0, eriçado = 0 } = {}) => { tail.setAttribute('d', `M90 -40 q${120 + 20 * Math.sin(t * 5)} ${-20 - eriçado * 40} 110 -150`); olhos.forEach((o) => o.setAttribute('ry', 12 * (1 - 0.9 * (Math.sin(t * 1.3) > 0.97)))); } };
}
export function criatura(parent, seed = 1) {
  const R = rng(seed + 3), root = g({}, parent), c = ['#1a1520', '#221a24', '#16121a'][seed % 3];
  const body = g({}, root);
  el('path', { d: 'M-160 0 Q-200 -300 -60 -420 Q60 -480 150 -380 Q220 -260 170 0 Z', fill: c }, body);
  for (const s of [-1, 1]) el('path', { d: `M${s * 40} -440 q${s * 40} -80 ${s * 110} -110 q${-s * 40} 60 ${-s * 70} 120 Z`, fill: '#d8ccb0' }, body);  // chifres
  const eyes = g({}, body);
  for (const s of [-1, 1]) { el('circle', { cx: s * 45, cy: -360, r: 46, fill: P.brilhoV, opacity: 0.8 }, eyes); el('circle', { cx: s * 45, cy: -360, r: 14, fill: '#ff5040' }, eyes); }
  for (const s of [-1, 1]) el('path', { d: `M${s * 120} -260 q${s * 70} 130 ${s * 40} 260`, stroke: c, 'stroke-width': 48, 'stroke-linecap': 'round', fill: 'none' }, body);
  const ph = R() * 10;
  return { g: root, set: ({ t = 0, anda = 0, morto = false } = {}) => { eyes.style.display = morto ? 'none' : ''; body.setAttribute('transform', morto ? 'rotate(90) translate(-60 0)' : `translate(0 ${-anda * 18 * Math.abs(Math.sin(t * 7 + ph))}) rotate(${anda * 3 * Math.sin(t * 7 + ph)})`); } };
}
export function aldeao(parent, seed = 1) {
  const R = rng(seed + 11), root = g({}, parent), c = ['#3a2a22', '#2e2a36', '#3a3226', '#2a3030'][seed % 4];
  el('circle', { cx: 0, cy: -330, r: 50, fill: c }, root);
  el('path', { d: 'M-60 -270 h120 l20 180 h-160 Z', fill: c }, root);
  const pernas = [-1, 1].map((s) => el('rect', { x: s * 25 - 18, y: -100, width: 36, height: 110, rx: 14, fill: c }, root));
  if (R() > 0.5) el('ellipse', { cx: -60, cy: -220, rx: 50, ry: 40, fill: c }, root);      // trouxa
  return { g: root, set: ({ t = 0 } = {}) => pernas.forEach((p, i) => p.setAttribute('transform', `rotate(${(i ? 1 : -1) * 25 * Math.sin(t * 12 + seed)} ${p.getAttribute('x')} -100)`)) };
}
export function corvo(parent) {
  const root = g({}, parent);
  el('path', { d: 'M-90 -60 Q-40 -150 40 -130 Q110 -110 130 -40 Q60 -60 -10 -20 Z', fill: '#1a1a20' }, root);
  el('path', { d: 'M-40 -90 Q40 -140 110 -70', fill: 'none', stroke: '#c8ccd6', 'stroke-width': 8 }, root);   // reflexo prateado
  el('circle', { cx: 60, cy: -150, r: 40, fill: '#1a1a20' }, root);
  el('path', { d: 'M95 -155 l60 15 l-60 10 Z', fill: '#c8ccd6' }, root);
  el('circle', { cx: 70, cy: -158, r: 8, fill: '#e8e8f0' }, root);
  el('path', { d: 'M-90 -60 l-80 40 l90 -10 Z', fill: '#1a1a20' }, root);
  return { g: root };
}

// ============================== CENÁRIO: céu, vila em chamas, portão, chuva, fogo ==============================
export function ceuNoite(parent) { el('rect', { width: 1080, height: 1920, fill: grad([[0, '#1a2838'], [1, '#0a121c']]) }, parent); }
export function chuva(parent, n = 140, seed = 5) {
  const R = rng(seed), gg = g({ stroke: 'rgba(200,220,255,0.28)', 'stroke-width': 3 }, parent);
  const gotas = Array.from({ length: n }, () => ({ e: el('line', {}, gg), x: R() * 1200 - 60, y: R() * 1920, v: 1600 + R() * 900, l: 50 + R() * 60 }));
  return { g: gg, set: (t) => gotas.forEach((d) => { const y = (d.y + t * d.v) % 2100 - 100, x = d.x - y * 0.12; d.e.setAttribute('x1', x); d.e.setAttribute('y1', y); d.e.setAttribute('x2', x - d.l * 0.12); d.e.setAttribute('y2', y + d.l); }) };
}
export function fogo(parent, x, y, s = 1, seed = 1) {
  const R = rng(seed), gg = g({ transform: `translate(${x} ${y}) scale(${s})` }, parent);
  const ch = [['#ff5a10', 1.0], ['#ff9a20', 0.75], ['#ffd060', 0.45]].map(([c, k]) => el('path', { fill: c }, gg));
  const ph = R() * 10;
  return { g: gg, set: (t) => ch.forEach((p, i) => { const k = [1, 0.75, 0.45][i], h = 260 * k * (1 + 0.15 * Math.sin(t * 9 + ph + i)), w = 120 * k; p.setAttribute('d', `M${-w} 0 Q${-w} ${-h * 0.5} ${-w * 0.2 + 20 * Math.sin(t * 7 + i)} ${-h} Q${w * 0.3} ${-h * 0.6} ${w} 0 Z`); }) };
}
export function casa(parent, x, y, s = 1, queimando = false) {
  const gg = g({ transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('rect', { x: -150, y: -200, width: 300, height: 200, fill: queimando ? '#3a2418' : '#5a4030' }, gg);
  el('path', { d: 'M-180 -200 L0 -330 L180 -200 Z', fill: queimando ? '#2a1810' : '#4a2a1c' }, gg);
  el('rect', { x: -40, y: -140, width: 50, height: 50, fill: '#ffb040' }, gg);
  return gg;
}
export function portao(parent, x, y, s = 1) {
  const gg = g({ transform: `translate(${x} ${y}) scale(${s})` }, parent), m = '#4a301c', m2 = '#5b3a22';
  for (const xx of [-330, 280]) el('rect', { x: xx, y: -700, width: 50, height: 700, fill: m }, gg);
  el('rect', { x: -360, y: -720, width: 720, height: 60, fill: m }, gg);
  for (let i = 0; i < 12; i++) { const xx = -560 + i * 100 + (i > 5 ? 220 : -220); if (Math.abs(xx) < 300) continue; el('path', { d: `M${xx} 0 v-460 l35 -60 l35 60 v460 Z`, fill: i % 2 ? m : m2 }, gg); }
  return gg;
}

// ============================== QUADRO TÉCNICO ==============================
export function quadro(parent, { x = 70, y = 330, w = 940, h = 1060 } = {}) {
  const gg = g({ transform: `translate(${x} ${y})` }, parent);
  el('rect', { x: -x, y: -y, width: 1080, height: 1920, fill: '#0a2229' }, gg);
  el('rect', { width: w, height: h, fill: grad([[0, '#14525e'], [1, '#0b2c35']], { radial: true, cx: 0.5, cy: 0.35, r: 0.8 }) }, gg);
  const gr = g({ stroke: 'rgba(120,220,230,0.10)', 'stroke-width': 2 }, gg);
  for (let xx = 0; xx <= w; xx += 47) el('line', { x1: xx, y1: 0, x2: xx, y2: h }, gr);
  for (let yy = 0; yy <= h; yy += 47) el('line', { x1: 0, y1: yy, x2: w, y2: yy }, gr);
  el('rect', { width: w, height: h, fill: 'none', stroke: '#c9a24a', 'stroke-width': 4, rx: 6 }, gg);
  return gg;
}
export function manequim(parent, x, y, s = 1) {
  const m = g({ transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('circle', { cx: 0, cy: -560, r: 62, fill: P.boneco }, m);
  el('circle', { cx: -20, cy: -555, r: 6, fill: '#5a4636' }, m); el('circle', { cx: 20, cy: -555, r: 6, fill: '#5a4636' }, m);
  el('rect', { x: -70, y: -490, width: 140, height: 250, rx: 50, fill: P.boneco }, m);
  for (const s2 of [-1, 1]) { el('rect', { x: s2 * 35 - 25, y: -260, width: 50, height: 260, rx: 25, fill: P.boneco }, m); el('rect', { x: s2 * 95 - 21, y: -470, width: 42, height: 220, rx: 21, fill: P.boneco }, m); }
  return m;
}
export function traco(parent, d, cor = '#9fe6ee', w = 7) { const p = el('path', { d, fill: 'none', stroke: cor, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, parent); const L = p.getTotalLength(); p.setAttribute('stroke-dasharray', L); return { p, set: (k) => p.setAttribute('stroke-dashoffset', L * (1 - clamp(k))) }; }
export function cota(parent, x1, y1, x2, y2, label, side = 1) {
  const gg = g({ stroke: '#fff', 'stroke-width': 4, fill: 'none' }, parent);
  el('line', { x1, y1, x2, y2 }, gg);
  const a = Math.atan2(y2 - y1, x2 - x1), hd = (x, y, d) => `M${x + 22 * Math.cos(a + d * 2.6)} ${y + 22 * Math.sin(a + d * 2.6)} L${x} ${y} L${x + 22 * Math.cos(a - d * 2.6)} ${y + 22 * Math.sin(a - d * 2.6)}`;
  el('path', { d: hd(x1, y1, -1) + hd(x2, y2, 1).replace(/^M/, ' M') }, gg);
  const tx = el('text', { x: (x1 + x2) / 2 + side * 30, y: (y1 + y2) / 2 + 18, fill: '#fff', stroke: 'none', 'font-family': 'Anton', 'font-size': 52, 'text-anchor': side > 0 ? 'start' : 'end' }, gg); tx.textContent = label;
  return gg;
}
export function setaPeso(parent) { return el('path', { d: 'M-18 0 h36 v60 h26 l-44 50 l-44 -50 h26 Z', fill: '#3fd26a' }, parent); }
export function rotulo(parent, x, y, txt, { cor = '#ffd400', size = 78 } = {}) { const t = el('text', { x, y, fill: cor, 'font-family': 'Anton', 'font-size': size, 'text-anchor': 'middle' }, parent); t.textContent = txt; return t; }
export function loboSilhueta(parent, x, y, s = 1) {
  const gg = g({ transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('path', { d: 'M-260 -120 Q-200 -230 -40 -220 Q120 -230 190 -260 L240 -330 L250 -260 Q300 -240 310 -200 L250 -180 Q200 -120 180 -60 L150 0 L120 0 L130 -80 Q20 -90 -120 -80 L-150 0 L-180 0 L-190 -100 Q-260 -90 -330 -160 Q-280 -130 -260 -120 Z', fill: 'none', stroke: '#9fe6ee', 'stroke-width': 7, 'stroke-linejoin': 'round' }, gg);
  return gg;
}

// ============================== LEGENDAS ==============================
export function legendas(parent, lista, y = 1560) {
  const gg = g({}, parent);
  const items = lista.map(([a, b, parts, yy]) => {
    const t = el('text', { x: 540, y: yy || y, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 96, 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 16, 'stroke-linejoin': 'round' }, gg);
    parts.forEach(([txt, yel], i) => { const s = el('tspan', { fill: yel ? '#ffd400' : '#fff' }, t); s.textContent = (i ? ' ' : '') + txt; });
    return { t, a, b };
  });
  return { g: gg, set: (t) => items.forEach((L) => (L.t.style.display = t >= L.a && t < L.b ? '' : 'none')) };
}
export async function pronto() { await document.fonts.load('96px Anton'); window.ready = true; }

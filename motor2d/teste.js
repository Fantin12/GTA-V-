// Teste do estilo 2D vetorial (inspirado no formato "personagem + quadro técnico"): 10 segundos.
const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('tela');
function el(tag, attrs = {}, parent = svg) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent.appendChild(e); return e;
}
const g = (attrs = {}, parent = svg) => el('g', attrs, parent);
const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// ---------- definições: gradientes e filtros ----------
const defs = el('defs');
function grad(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, radial = false) {
  const gr = el(radial ? 'radialGradient' : 'linearGradient', radial ? { id, cx: x1, cy: y1, r: x2 } : { id, x1, y1, x2, y2 }, defs);
  stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gr)); return `url(#${id})`;
}
const G = {
  ceu: grad('ceu', [[0, '#1a2838'], [1, '#0c141e']]),
  bp: grad('bp', [[0, '#13505c'], [1, '#0b2c35']], 0.5, 0.35, 0.8, 0, true),
  pele: grad('pele', [[0, '#e8a676'], [0.7, '#cf8656'], [1, '#b56f45']], 0.4, 0.35, 0.75, 0, true),
  aco: grad('aco', [[0, '#6c7686'], [1, '#353c48']]),
  acoE: grad('acoE', [[0, '#4a5262'], [1, '#262b34']]),
  capa: grad('capa', [[0, '#8a1c2e'], [1, '#4e0e1a']]),
  cabelo: grad('cabelo', [[0, '#3a2618'], [1, '#1a100a']]),
  boneco: grad('boneco', [[0, '#f0e2c8'], [1, '#d6c4a4']]),
  brilho: grad('brilho', [[0, 'rgba(255,214,90,1)'], [0.4, 'rgba(255,180,40,0.55)'], [1, 'rgba(255,160,20,0)']], 0.5, 0.5, 0.5, 0, true),
};
el('feColorMatrix', { id: 'cinzaM', type: 'saturate', values: '1' }, el('filter', { id: 'cinza' }, defs));
const satNode = defs.querySelector('#cinzaM');
const blur = el('filter', { id: 'blur6', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); el('feGaussianBlur', { stdDeviation: 6 }, blur);

// =====================================================================
// CENA A — quadro técnico (fundo azul-petróleo com grade, moldura dourada)
// =====================================================================
const A = g();
el('rect', { width: 1080, height: 1920, fill: '#0a2229' }, A);
const frameA = g({ transform: 'translate(70 330)' }, A);
el('rect', { width: 940, height: 1060, fill: G.bp }, frameA);
const grid = g({ stroke: 'rgba(120,220,230,0.10)', 'stroke-width': 2 }, frameA);
for (let x = 0; x <= 940; x += 47) el('line', { x1: x, y1: 0, x2: x, y2: 1060 }, grid);
for (let y = 0; y <= 1060; y += 47) el('line', { x1: 0, y1: y, x2: 940, y2: y }, grid);
el('rect', { width: 940, height: 1060, fill: 'none', stroke: '#c9a24a', 'stroke-width': 4, rx: 6 }, frameA);
// boneco (manequim creme) segurando o escudo
const man = g({ transform: 'translate(330 210)' }, frameA);
el('circle', { cx: 0, cy: 0, r: 62, fill: G.boneco }, man);
el('path', { d: 'M-38 -10 q38 -40 76 0', fill: 'none', stroke: '#b89c74', 'stroke-width': 6, 'stroke-linecap': 'round' }, man);
el('circle', { cx: -20, cy: 5, r: 6, fill: '#5a4636' }, man); el('circle', { cx: 20, cy: 5, r: 6, fill: '#5a4636' }, man);
el('rect', { x: -70, y: 70, width: 140, height: 250, rx: 50, fill: G.boneco }, man);
el('rect', { x: -60, y: 300, width: 50, height: 300, rx: 25, fill: G.boneco }, man);
el('rect', { x: 10, y: 300, width: 50, height: 300, rx: 25, fill: G.boneco }, man);
const manArm = el('rect', { x: 55, y: 90, width: 42, height: 230, rx: 21, fill: G.boneco, transform: 'rotate(-35 76 100)' }, man);
el('rect', { x: -100, y: 90, width: 42, height: 230, rx: 21, fill: G.boneco, transform: 'rotate(12 -79 100)' }, man);
// escudo-torre desenhado em traço (aparece aos poucos)
const shieldPath = 'M0 0 h300 v560 q0 60 -150 110 q-150 -50 -150 -110 Z';
const shieldA = g({ transform: 'translate(430 200)' }, frameA);
const sFill = el('path', { d: shieldPath, fill: 'rgba(160,220,230,0.10)' }, shieldA);
const sLine = el('path', { d: shieldPath, fill: 'none', stroke: '#9fe6ee', 'stroke-width': 7, 'stroke-linejoin': 'round' }, shieldA);
const emb = el('path', { d: 'M90 230 v-70 h30 v25 h20 v-25 h20 v25 h20 v-25 h30 v70 h-30 v80 h-60 v-80 Z M135 310 v-50 a15 15 0 0 1 30 0 v50', fill: 'none', stroke: '#e6c35a', 'stroke-width': 6 }, shieldA);
// cota: altura
const cota = g({ stroke: '#ffffff', 'stroke-width': 4, fill: 'none' }, frameA);
el('line', { x1: 790, y1: 200, x2: 790, y2: 870 }, cota);
el('path', { d: 'M775 225 l15 -25 l15 25 M775 845 l15 25 l15 -25' }, cota);
const cotaTxt = el('text', { x: 815, y: 548, fill: '#fff', 'font-family': 'Anton', 'font-size': 52 }, frameA); cotaTxt.textContent = '1,2 m';
// peso: setas verdes balançando
const peso = g({}, frameA);
const arrows = [0, 1].map((i) => el('path', { d: 'M-18 0 h36 v60 h26 l-44 50 l-44 -50 h26 Z', fill: '#3fd26a' }, peso));
const pesoTxt = el('text', { x: 470, y: 1010, fill: '#ffd400', 'font-family': 'Anton', 'font-size': 78, 'text-anchor': 'middle' }, frameA); pesoTxt.textContent = '15 kg';

// =====================================================================
// CENA B — close do Vitorioso na chuva
// =====================================================================
const B = g();
const mundo = g({ filter: 'url(#cinza)' }, B);
el('rect', { width: 1080, height: 1920, fill: G.ceu }, mundo);
for (let i = 0; i < 9; i++) el('rect', { x: i * 130 - 40, y: 300 + (i % 3) * 60, width: 90, height: 1300, fill: 'rgba(255,255,255,0.025)' }, mundo); // vigas ao fundo
const heroi = g({}, mundo);
// capa e ombros
el('path', { d: 'M150 1920 L190 1250 Q540 1150 890 1250 L930 1920 Z', fill: G.capa }, heroi);
el('path', { d: 'M200 1400 Q540 1180 880 1400 L900 1920 L180 1920 Z', fill: G.aco }, heroi);   // peitoral
el('path', { d: 'M540 1300 L540 1920', stroke: '#2a3039', 'stroke-width': 14 }, heroi);
el('path', { d: 'M260 1420 Q540 1260 820 1420', fill: 'none', stroke: '#c9962e', 'stroke-width': 12 }, heroi);
for (const s of [-1, 1]) {                                      // ombreiras em camadas
  for (let k = 0; k < 3; k++) el('ellipse', { cx: 540 + s * (300 + k * 20), cy: 1290 + k * 70, rx: 190 - k * 15, ry: 120 - k * 10, fill: k % 2 ? G.acoE : G.aco }, heroi);
  el('path', { d: `M${540 + s * 140} 1240 q${s * 170} -40 ${s * 330} 60`, fill: 'none', stroke: '#c9962e', 'stroke-width': 9 }, heroi);
  for (let k = 0; k < 3; k++) el('circle', { cx: 540 + s * (250 + k * 60), cy: 1460, r: 9, fill: '#d9a84a' }, heroi);
}
el('ellipse', { cx: 540, cy: 1205, rx: 180, ry: 60, fill: '#2b313b' }, heroi);   // gola
// pescoço e cabeça
el('rect', { x: 465, y: 1060, width: 150, height: 160, rx: 60, fill: '#bf7a4c' }, heroi);
const cab = g({ transform: 'translate(540 1000) scale(1.12) translate(-540 -880)' }, heroi);
for (const s of [-1, 1]) el('ellipse', { cx: 540 + s * 215, cy: 790, rx: 34, ry: 56, fill: '#c98050' }, cab);  // orelhas
el('path', { d: 'M335 700 Q335 470 540 460 Q745 470 745 700 Q750 900 610 990 Q540 1025 470 990 Q330 900 335 700 Z', fill: G.pele }, cab);
el('path', { d: 'M360 820 Q380 950 470 995 Q540 1030 610 995 Q700 950 720 820 Q690 900 540 920 Q390 900 360 820 Z', fill: 'rgba(60,30,15,0.30)' }, cab);  // barba por fazer
el('path', { d: 'M470 900 q70 -18 140 0', fill: 'none', stroke: 'rgba(60,30,15,0.45)', 'stroke-width': 10, 'stroke-linecap': 'round' }, cab); // bigode fino
el('path', { d: 'M485 935 q55 12 110 0', fill: 'none', stroke: '#7a3a28', 'stroke-width': 9, 'stroke-linecap': 'round' }, cab);   // boca
el('rect', { x: 493, y: 932, width: 8, height: 20, fill: '#b01818', rx: 3 }, cab);                                             // cicatriz
el('path', { d: 'M540 760 q-8 80 -30 110 q30 18 60 0', fill: 'rgba(150,80,45,0.55)' }, cab);                                   // nariz
// olhos (bravos) + sobrancelhas
const olhos = g({}, cab);
for (const s of [-1, 1]) {
  el('ellipse', { cx: 540 + s * 95, cy: 760, rx: 46, ry: 26, fill: '#f6efe6' }, olhos);
  el('circle', { cx: 540 + s * 88, cy: 762, r: 18, fill: '#3a78c0' }, olhos);
  el('circle', { cx: 540 + s * 88, cy: 762, r: 9, fill: '#0a0a0a' }, olhos);
  el('path', { d: `M${540 + s * 45} 738 L${540 + s * 145} 742 L${540 + s * 145} 725 L${540 + s * 45} 725 Z`, fill: '#c98050' }, olhos); // pálpebra (cara séria)
  el('path', { d: `M${540 + s * 40} 712 L${540 + s * 155} ${690}`, stroke: '#24160c', 'stroke-width': 26, 'stroke-linecap': 'round' }, cab);
}
// cabelo cacheado
const hair = g({ fill: G.cabelo }, cab);
el('path', { d: 'M330 690 Q320 460 540 445 Q760 460 750 690 Q720 560 540 560 Q360 560 330 690 Z' }, hair);
const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
for (let i = 0; i < 26; i++) { const a = Math.PI * (0.05 + 0.9 * R()); el('circle', { cx: 540 - Math.cos(a) * (190 + R() * 30), cy: 560 - Math.sin(a) * (95 + R() * 40), r: 36 + R() * 18 }, hair); }
// brilho dos olhos (fora do filtro cinza)
const glow = g({ opacity: 0 }, B);
const glowIn = g({ transform: 'translate(540 1000) scale(1.12) translate(-540 -880)' }, glow);
for (const s of [-1, 1]) { el('circle', { cx: 540 + s * 88, cy: 762, r: 120, fill: G.brilho }, glowIn); el('circle', { cx: 540 + s * 88, cy: 762, r: 20, fill: '#ffe680' }, glowIn); }
// chuva (por cima de tudo)
const chuva = g({ stroke: 'rgba(200,220,255,0.28)', 'stroke-width': 3 }, B);
const gotas = []; for (let i = 0; i < 140; i++) gotas.push({ e: el('line', {}, chuva), x: R() * 1200 - 60, y: R() * 1920, v: 1600 + R() * 900, l: 50 + R() * 60 });

// =====================================================================
// LEGENDAS (palavra amarela, contorno preto)
// =====================================================================
const leg = g({});
const LEG = [[0.2, 2.4, [['UM', 0], ['ESCUDO-TORRE', 1]]], [2.5, 5.0, [['PESA', 0], ['15 QUILOS.', 1]]],
             [5.2, 7.4, [['ELE SEGURA COM', 0], ['UM BRAÇO.', 1]]], [7.6, 10, [['E NÃO', 0], ['CANSA.', 1]]]];
const legEls = LEG.map(([a, b, parts]) => {
  const t = el('text', { x: 540, y: 1560, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 96, 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 16, 'stroke-linejoin': 'round' }, leg);
  parts.forEach(([txt, y], i) => { const s = el('tspan', { fill: y ? '#ffd400' : '#fff' }, t); s.textContent = (i ? ' ' : '') + txt; });
  return { t, a, b };
});

// =====================================================================
window.DUR = 10;
window.renderAt = (t) => {
  const inA = t < 5;
  A.style.display = inA ? '' : 'none'; B.style.display = inA ? 'none' : '';
  if (inA) {
    const k = ease(t / 1.6), L = 2100;
    sLine.setAttribute('stroke-dasharray', L); sLine.setAttribute('stroke-dashoffset', L * (1 - k));
    sFill.setAttribute('opacity', ease((t - 1.2) / 0.6)); emb.setAttribute('opacity', ease((t - 1.5) / 0.5));
    manArm.setAttribute('transform', `rotate(${-35 - 10 * ease(t / 1.5)} 76 100)`);
    cota.setAttribute('opacity', ease((t - 1.8) / 0.4)); cotaTxt.setAttribute('opacity', ease((t - 1.9) / 0.4));
    const show = ease((t - 2.5) / 0.3);
    arrows.forEach((a, i) => a.setAttribute('transform', `translate(${470 + (i ? 1 : -1) * 190} ${860 + 14 * Math.sin(t * 7 + i)}) scale(${show})`));
    pesoTxt.setAttribute('opacity', show);
    frameA.setAttribute('transform', `translate(70 330) scale(${1 + 0.02 * t / 5})`);
  } else {
    const u = t - 5;
    heroi.setAttribute('transform', `translate(540 1100) scale(${1 + 0.035 * u}) translate(-540 -1100) translate(0 ${-6 * Math.sin(u * 2.4)})`);
    const lit = ease((t - 7.6) / 0.35);
    satNode.setAttribute('values', (1 - 0.92 * lit).toFixed(3));
    glow.setAttribute('opacity', lit * (0.85 + 0.15 * Math.sin(t * 18)));
    glow.setAttribute('transform', heroi.getAttribute('transform'));
    gotas.forEach((d) => { const y = (d.y + u * d.v) % 2100 - 100, x = d.x - (y * 0.12); d.e.setAttribute('x1', x); d.e.setAttribute('y1', y); d.e.setAttribute('x2', x - d.l * 0.12); d.e.setAttribute('y2', y + d.l); });
  }
  for (const L of legEls) L.t.style.display = t >= L.a && t < L.b ? '' : 'none';
  return true;
};
document.fonts.load('96px Anton').then(() => { window.ready = true; });

// A Coroa de Varnor — EP1 "O Portão" (2D, ~1 min): história + quadros técnicos com curiosidades reais.
import * as L from './lib.js';
const { el, g, ease, clamp, rel, rng } = L;
const lip = await (await fetch('/lipsync_ep01.json')).json();
const boca = (who, t) => { const a = lip[who] || []; return a[Math.max(0, Math.min(a.length - 1, Math.floor(t * 30)))] || 0; };
const T = { s1: 0, s2: 4, s3: 10, s4: 15, s5: 19, s6: 25, s7: 31.5, s8: 38, s9: 41, s10: 44.5, s11: 49, fim: 56, end: 61 };
const SLAM = 41.6;
const cenas = [];
const cena = (a, b) => { const c = g(); c.a = a; c.b = b; cenas.push(c); return c; };
const R = rng(11);

// ---------- S1 / S8 / S10: close do Vitorioso na chuva ----------
const satClose = L.filtroSat();
function closeScene(a, b) {
  const c = cena(a, b), mundo = g({ filter: satClose.url }, c);
  L.ceuNoite(mundo);
  const brilhoFogo = el('rect', { width: 1080, height: 1920, fill: L.grad([[0, 'rgba(255,120,40,0)'], [1, 'rgba(255,120,40,0.25)']]) }, mundo);
  for (let i = 0; i < 9; i++) el('rect', { x: i * 130 - 40, y: 300 + (i % 3) * 60, width: 90, height: 1300, fill: 'rgba(255,255,255,0.025)' }, mundo);
  const hb = g({}, mundo); const v = L.vitoriosoBusto(hb);
  const ch = L.chuva(c, 150, a * 10 + 3);
  return { c, hb, v, ch };
}
const C1 = closeScene(T.s1, T.s2), C8 = closeScene(T.s8, T.s9), C10 = closeScene(T.s10, T.s11);

// ---------- S2: vila em chamas, aldeões fugindo ----------
const S2 = cena(T.s2, T.s3);
el('rect', { width: 1080, height: 1920, fill: L.grad([[0, '#1a0e14'], [0.6, '#5a1e10'], [1, '#2a120a']]) }, S2);
const vila = g({}, S2), fogos2 = [];
[[180, 1150, 1.1], [560, 1100, 0.9], [900, 1170, 1.2], [360, 1300, 1.4], [760, 1320, 1.3]].forEach(([x, y, s], i) => { L.casa(vila, x, y, s, true); fogos2.push(L.fogo(vila, x, y - 250 * s, s * 0.9, i + 1)); });
el('rect', { y: 1320, width: 1080, height: 600, fill: L.grad([[0, '#7a3416'], [1, '#2a120a']]) }, S2);
const brasas = g({ fill: '#ffb040' }, S2), brs = Array.from({ length: 70 }, () => ({ e: el('circle', { r: 3 + R() * 4 }, brasas), x: R() * 1080, y: R() * 1600, v: 80 + R() * 160, ph: R() * 6 }));
const fuga = g({ filter: 'brightness(0.15)' }, S2), ald = Array.from({ length: 9 }, (_, i) => { const a = L.aldeao(g({}, fuga), i); a.x0 = -200 - i * 160; a.y = 1500 + (i % 3) * 110; a.s = 0.9 + (i % 3) * 0.25; a.v = 260 + (i % 4) * 40; return a; });

// ---------- S3: criaturas descendo o morro ----------
const S3 = cena(T.s3, T.s4);
el('rect', { width: 1080, height: 1920, fill: L.grad([[0, '#0a1018'], [1, '#141c26']]) }, S3);
el('path', { d: 'M0 700 Q540 520 1080 700 L1080 1920 L0 1920 Z', fill: '#0e1610' }, S3);
for (let i = 0; i < 40; i++) { const x = R() * 1100 - 10, y = 600 + R() * 380, h = 260 + R() * 260; el('path', { d: `M${x} ${y - h} l${70 + h * 0.15} ${h} h${-140 - h * 0.3} Z`, fill: i % 2 ? '#0c140e' : '#101a12' }, S3); }
const olhosF = g({}, S3), olf = Array.from({ length: 26 }, () => { const x = 60 + R() * 960, y = 650 + R() * 380, gg = g({ transform: `translate(${x} ${y})` }, olhosF); for (const s of [-1, 1]) { el('circle', { cx: s * 14, r: 22, fill: L.P.brilhoV }, gg); el('circle', { cx: s * 14, r: 6, fill: '#ff5040' }, gg); } return { gg, ph: R() * 9 }; });
const desc = g({}, S3), cri3 = Array.from({ length: 6 }, (_, i) => { const c = L.criatura(g({}, desc), i); c.x = 150 + i * 160 + (R() - 0.5) * 60; c.y0 = 900 + (i % 2) * 60; c.s = 0.55 + (i % 3) * 0.12; return c; });

// ---------- S4 / S9 / S11: herói de corpo inteiro no portão ----------
function gateScene(a, b, amanhecer = false) {
  const c = cena(a, b), mundo = g({}, c);
  el('rect', { width: 1080, height: 1920, fill: amanhecer ? L.grad([[0, '#3a5a9a'], [0.55, '#e8a070'], [1, '#ffd0a0']]) : L.grad([[0, '#140e18'], [0.7, '#4a1a10'], [1, '#2a120a']]) }, mundo);
  const fundo = g({}, mundo);
  if (!amanhecer) [[160, 1200, 0.8], [880, 1180, 0.9]].forEach(([x, y, s], i) => { L.casa(fundo, x, y, s, true); L.fogo(fundo, x, y - 200 * s, s * 0.8, i + 4); });
  else { [[160, 1200, 0.8], [880, 1180, 0.9]].forEach(([x, y, s]) => L.casa(fundo, x, y, s, true)); }
  L.portao(mundo, 540, 1500, 1.15);
  el('rect', { y: 1480, width: 1080, height: 440, fill: amanhecer ? '#4a3a28' : '#1a120c' }, mundo);
  const heroiG = g({}, mundo), heroi = L.vitoriosoCorpo(heroiG, { rachado: amanhecer });
  const gato = L.brasa(g({ transform: 'translate(760 1720) scale(0.55)' }, mundo));
  return { c, mundo, heroiG, heroi, gato, fundo };
}
const G4 = gateScene(T.s4, T.s5), G9 = gateScene(T.s9, T.s10), G11 = gateScene(T.s11, T.fim, true);
const ch4 = L.chuva(G4.c, 120, 41), ch9 = L.chuva(G9.c, 120, 91);
// criaturas à frente no S9 (de costas para a câmera, encarando o herói)
const frente9 = g({}, G9.c), cri9 = [0, 1, 2].map((i) => { const c = L.criatura(g({}, frente9), i + 7); return c; });
const faisca = g({ fill: '#ffd060' }, G9.c), fs = Array.from({ length: 60 }, () => ({ e: el('circle', { r: 4 + R() * 5 }, faisca), a: R() * Math.PI, v: 400 + R() * 900 }));
const flash = el('rect', { width: 1080, height: 1920, fill: '#ffe0a0', opacity: 0 }, G9.c);
// S11: caídos, fumaça, corvo
const caidos = g({}, G11.mundo); [[160, 1760], [420, 1840], [930, 1790]].forEach(([x, y], i) => L.criatura(g({ transform: `translate(${x} ${y}) scale(0.45)` }, caidos), i).set({ morto: true }));
const fumaca = g({ fill: 'rgba(60,50,50,0.35)' }, G11.mundo), fum = Array.from({ length: 10 }, (_, i) => ({ e: el('circle', {}, fumaca), x: i < 5 ? 160 : 880, ph: R() }));
const poste = g({ transform: 'translate(890 1080)' }, G11.c);
el('path', { d: 'M-40 600 v-600 l40 -60 l40 60 v600 Z', fill: '#4a301c' }, poste);
const corvoG = g({ transform: 'translate(0 -60) scale(0.9)' }, poste); L.corvo(corvoG);
const corvoBrilho = el('circle', { cx: 63, cy: -217, r: 26, fill: L.P.brilho, opacity: 0 }, corvoG);

// ---------- S5/S6/S7: quadros técnicos ----------
function quadroScene(a, b) { const c = cena(a, b); const q = L.quadro(c); return { c, q }; }
const Q5 = quadroScene(T.s5, T.s6);
L.manequim(Q5.q, 300, 900, 1.05);
const sh5 = g({ transform: 'translate(560 560)' }, Q5.q), sh5L = L.traco(sh5, 'M-150 -280 h300 v460 q0 60 -150 110 q-150 -50 -150 -110 Z'), em5 = L.traco(sh5, 'M-60 -60 v-70 h30 v25 h20 v-25 h20 v25 h20 v-25 h30 v70 h-30 v80 h-60 v-80 Z', '#e6c35a', 6);
const cota5 = L.cota(Q5.q, 790, 280, 790, 850, '1,2 m'); const peso5 = g({}, Q5.q), set5 = [0, 1].map(() => L.setaPeso(peso5)); const rot5 = L.rotulo(Q5.q, 560, 1010, '~10 kg');
const Q6 = quadroScene(T.s6, T.s7);
L.manequim(Q6.q, 470, 950, 1.25);
const arm6 = [L.traco(Q6.q, 'M380 360 Q470 330 560 360 L550 560 Q470 580 390 560 Z', '#9fe6ee', 7), L.traco(Q6.q, 'M330 340 q-50 20 -60 90 M610 340 q50 20 60 90', '#9fe6ee', 9), L.traco(Q6.q, 'M405 760 v170 M535 760 v170', '#9fe6ee', 16), L.traco(Q6.q, 'M395 570 h150', '#e6c35a', 8)];
const peso6 = g({}, Q6.q), set6 = [0, 1, 2].map(() => L.setaPeso(peso6)); const rot6 = L.rotulo(Q6.q, 470, 1020, '15 a 25 kg');
const Q7 = quadroScene(T.s7, T.s8);
const lobo7 = L.loboSilhueta(Q7.q, 470, 640, 1.2), linhas7 = g({ stroke: '#9fe6ee', 'stroke-width': 5, 'stroke-linecap': 'round' }, Q7.q), lin7 = Array.from({ length: 9 }, (_, i) => ({ e: el('line', {}, linhas7), y: 330 + i * 45, ph: R() }));
const rot7 = L.rotulo(Q7.q, 470, 930, '60 km/h', { size: 120 });
const vel7 = g({ transform: 'translate(470 820)' }, Q7.q); el('path', { d: 'M-160 0 A160 160 0 0 1 160 0', fill: 'none', stroke: 'rgba(255,255,255,0.3)', 'stroke-width': 10 }, vel7);
const ponteiro = el('line', { x1: 0, y1: 0, x2: -140, y2: 0, stroke: '#ffd400', 'stroke-width': 10, 'stroke-linecap': 'round' }, vel7);

// ---------- tela final ----------
const FIM = cena(T.fim, T.end);
el('rect', { width: 1080, height: 1920, fill: '#000' }, FIM);
const ftxt = (t, y, s, c) => { const e = el('text', { x: 540, y, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': s, fill: c }, FIM); e.textContent = t; return e; };
ftxt('PARTE 1', 700, 170, '#ffd400'); ftxt('A COROA DE VARNOR', 790, 70, '#fff'); ftxt('DE QUEM É O CORVO?', 1020, 88, '#fff');
[['A) DE UM AMIGO', 1150, '#ffd400'], ['B) DE UM INIMIGO', 1290, '#fff']].forEach(([t, y, c]) => { el('rect', { x: 230, y: y - 92, width: 620, height: 120, rx: 22, fill: 'none', stroke: '#ffd400', 'stroke-width': 6 }, FIM); ftxt(t, y, 76, c); });
ftxt('COMENTA AÍ', 1470, 58, '#b4b4b4');

// ---------- legendas ----------
const leg = L.legendas(L.svg, [
  [0.4, 1.9, [['TODO MUNDO', 0], ['FUGIU.', 1]]], [2.0, 3.9, [['MENOS', 0], ['ELE.', 1]]],
  [4.4, 6.8, [['BREJO CINZA PEGOU', 0], ['FOGO.', 1]]], [6.9, 9.6, [['A VILA INTEIRA', 0], ['CORREU.', 1]]],
  [10.4, 12.6, [['AS CRIATURAS', 0], ['DESCERAM.', 1]]], [12.7, 14.8, [['DEZENAS', 1], ['DELAS.', 0]]],
  [15.4, 18.7, [['O GUARDA DO PORTÃO', 0], ['FICOU.', 1]]],
  [19.6, 22.0, [['MAIS DE', 0], ['1 METRO.', 1]]], [22.1, 24.8, [['UNS', 0], ['10 QUILOS.', 1]]],
  [25.4, 28.6, [['15 A 25 QUILOS', 1], ['DE ARMADURA.', 0]]], [28.7, 31.4, [['E ELE AINDA DE', 0], ['PÉ.', 1]]],
  [31.8, 34.0, [['ELAS ERAM', 0], ['RÁPIDAS.', 1]]], [34.1, 37.8, [['UM LOBO CORRE A', 0], ['60 KM/H.', 1]]],
  [38.6, 40.9, [['TANQUE NÃO', 0], ['FOGE.', 1]]], [42.0, 44.4, [['TANQUE', 0], ['SEGURA!', 1]]],
  [45.2, 48.4, [['NINGUÉM', 0], ['PASSOU.', 1]]], [49.6, 52.0, [['AINDA DE', 0], ['PÉ.', 1]]], [52.1, 55.9, [['E ALGUÉM ESTAVA', 0], ['OLHANDO.', 1]]],
]);

// =====================================================================
window.DUR = T.end;
window.renderAt = (t) => {
  for (const c of cenas) c.style.display = t >= c.a && t < c.b ? '' : 'none';
  // closes
  for (const [C, a, b, cfg] of [[C1, T.s1, T.s2, { glowAt: 1.9, expr: 'serio', who: null }], [C8, T.s8, T.s9, { expr: 'bravo', who: 'V' }], [C10, T.s10, T.s11, { glowAt: 0.4, expr: 'bravo', who: null }]]) {
    if (t < a || t >= b) continue; const u = t - a;
    C.hb.setAttribute('transform', `translate(540 1100) scale(${1 + 0.03 * u}) translate(-540 -1100) translate(0 ${-6 * Math.sin(u * 2.4)})`);
    const lit = cfg.glowAt != null ? ease((u - cfg.glowAt) / 0.35) : 0;
    satClose.set(1 - 0.92 * lit);
    C.v.set({ expr: cfg.expr, boca: cfg.who ? boca(cfg.who, t) : 0, brilho: lit * (0.85 + 0.15 * Math.sin(t * 18)), piscar: lit > 0 ? 0 : (Math.sin(u * 2.1 + a) > 0.985 ? 1 : 0) });
    C.ch.set(u);
  }
  // S2
  if (t >= T.s2 && t < T.s3) {
    const u = t - T.s2; fogos2.forEach((f) => f.set(t));
    vila.setAttribute('transform', `translate(${-20 * u} 0)`);
    brs.forEach((b) => { const y = (b.y - u * b.v) % 1700; b.e.setAttribute('cx', b.x + 20 * Math.sin(u * 2 + b.ph)); b.e.setAttribute('cy', y < 0 ? y + 1700 : y); });
    ald.forEach((a) => { a.g.setAttribute('transform', `translate(${a.x0 + u * a.v} ${a.y}) scale(${a.s})`); a.set({ t }); });
  }
  // S3
  if (t >= T.s3 && t < T.s4) {
    const u = t - T.s3;
    olf.forEach((o) => o.gg.setAttribute('opacity', Math.sin(t * 1.7 + o.ph) > -0.8 ? 1 : 0));
    cri3.forEach((c) => { const k = ease(u / 5); c.g.setAttribute('transform', `translate(${c.x} ${c.y0 + k * 650}) scale(${c.s + k * 0.55})`); c.set({ t, anda: 1 }); });
  }
  // S4 / S9 / S11 (portão)
  if (t >= T.s4 && t < T.s5) { const u = t - T.s4; G4.heroiG.setAttribute('transform', `translate(540 1800) scale(${1.0 + 0.04 * u})`); G4.heroi.set({ expr: 'serio', piscar: u > 2.2 && u < 2.35 ? 1 : 0 }); G4.gato.set({ t, eriçado: 1 }); ch4.set(u); G4.fundo.querySelectorAll('g').length; }
  if (t >= T.s9 && t < T.s10) {
    const u = t - T.s9, st = t - SLAM, c = st < 0 ? -0.2 * ease(rel(t, T.s9, SLAM)) : ease(st / 0.12);
    const sh = st > 0 ? 14 * Math.exp(-st * 5) : 0;
    G9.c.setAttribute('transform', `translate(${sh * Math.sin(t * 90)} ${sh * Math.cos(t * 77)})`);
    G9.heroiG.setAttribute('transform', 'translate(540 1820) scale(1.08)'); G9.heroi.set({ crava: Math.max(0, c), expr: 'bravo', boca: boca('V', t) });
    G9.gato.set({ t, eriçado: 1 }); ch9.set(u);
    cri9.forEach((cr, i) => { cr.g.setAttribute('transform', `translate(${150 + i * 390} ${2050 + (i % 2) * 40}) scale(${1.3 + (i % 2) * 0.2}) scale(1 1)`); cr.set({ t, anda: 0.3 }); });
    fs.forEach((f) => { if (st < 0 || st > 0.9) { f.e.setAttribute('cx', -99); return; } f.e.setAttribute('cx', 400 + Math.cos(f.a) * f.v * st * (f.a > 1.57 ? -1 : 1) * 0.6); f.e.setAttribute('cy', 1760 - Math.sin(f.a) * f.v * st + 1400 * st * st); f.e.setAttribute('opacity', 1 - st); });
    flash.setAttribute('opacity', st > 0 ? 0.6 * Math.exp(-st * 7) : 0);
  }
  if (t >= T.s11 && t < T.fim) {
    const u = t - T.s11, k = ease(rel(t, T.s11 + 3, T.fim));
    G11.c.setAttribute('transform', `translate(540 960) scale(${1 + k * 1.3}) translate(${-540 - k * 310} ${-960 + k * 60})`);
    G11.heroiG.setAttribute('transform', 'translate(540 1800) scale(1.0)'); G11.heroi.set({ expr: 'serio', piscar: Math.sin(u * 2) > 0.98 ? 1 : 0 });
    G11.gato.set({ t });
    fum.forEach((f, i) => { const p = (u * 0.18 + f.ph + i * 0.1) % 1; f.e.setAttribute('cx', f.x + p * 120); f.e.setAttribute('cy', 1000 - p * 700); f.e.setAttribute('r', 40 + p * 140); f.e.setAttribute('opacity', Math.sin(p * Math.PI)); });
    corvoBrilho.setAttribute('opacity', t > 53.2 ? 0.9 * ease((t - 53.2) / 0.3) : 0);
  }
  // quadros
  if (t >= T.s5 && t < T.s6) { const u = t - T.s5; sh5L.set(u / 1.5); em5.set((u - 1.2) / 0.8); cota5.setAttribute('opacity', ease((u - 1.5) / 0.4)); const s = ease((u - 2.6) / 0.3); set5.forEach((a, i) => a.setAttribute('transform', `translate(${560 + (i ? 1 : -1) * 220} ${880 + 14 * Math.sin(t * 7 + i)}) scale(${s})`)); rot5.setAttribute('opacity', s); }
  if (t >= T.s6 && t < T.s7) { const u = t - T.s6; arm6.forEach((a, i) => a.set((u - i * 0.4) / 0.9)); const s = ease((u - 1.8) / 0.3); set6.forEach((a, i) => a.setAttribute('transform', `translate(${250 + i * 220} ${860 + 14 * Math.sin(t * 7 + i)}) scale(${s})`)); rot6.setAttribute('opacity', s); }
  if (t >= T.s7 && t < T.s8) {
    const u = t - T.s7; lobo7.setAttribute('transform', `translate(${470 + 10 * Math.sin(u * 20)} 640) scale(1.2)`);
    lin7.forEach((l, i) => { const p = (u * 2.2 + l.ph) % 1, x = 740 - p * 720; l.e.setAttribute('x1', x); l.e.setAttribute('x2', x + 160); l.e.setAttribute('y1', l.y); l.e.setAttribute('y2', l.y); l.e.setAttribute('opacity', u > 2.4 ? 1 : 0); });
    const k = ease((u - 2.6) / 1.2); ponteiro.setAttribute('transform', `rotate(${k * 150})`); rot7.setAttribute('opacity', ease((u - 2.6) / 0.3));
  }
  leg.set(t);
  return true;
};
L.pronto();

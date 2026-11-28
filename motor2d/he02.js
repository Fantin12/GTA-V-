// HORAS EXTRAS — T1·EP2 "A Toca dos Lobos" (2D, 2:30)
import * as H from './lib2.js';
import * as W from './lib3.js';
import * as L from './lib.js';
const { el, g, ease, clamp, rel, rng, grad } = L;
const lip = await (await fetch('/lipsync_he02.json')).json();
const boca = (who, t) => { const a = lip[who] || []; return a[Math.max(0, Math.min(a.length - 1, Math.floor(t * 30)))] || 0; };
const cenas = [];
const cena = (...rs) => { const c = g(); c.rs = rs; cenas.push(c); return c; };
const pisca = (t, ph = 0) => (Math.sin(t * 1.9 + ph) > 0.985 ? 1 : 0);
const texto = (parent, x, y, s, cor, txt, extra = {}) => { const e = el('text', { x, y, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': s, fill: cor, ...extra }, parent); e.textContent = txt; return e; };
const vinheta = (parent, op = 0.7) => el('rect', { width: 1080, height: 1920, fill: grad([[0, 'rgba(0,0,0,0)'], [0.6, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${op})`]], { radial: true, cx: 0.5, cy: 0.5, r: 0.75 }) }, parent);
const busto = (gg, s, y = 0) => gg.setAttribute('transform', `translate(540 1920) scale(${s}) translate(-540 ${-1920 + y})`);
const SALDO = 348.40;
const KILLS = [58, 62.5, 67];
const BLOQ = [86.6, 87.9, 89.2], MORTE = 93.6;
const ganho = (t) => (t >= MORTE ? 0 : KILLS.filter((k) => t >= k).length * 25);

// ---------- S0 resultado da votação ----------
const S0 = cena([8, 13]);
el('rect', { width: 1080, height: 1920, fill: '#06080c' }, S0);
texto(S0, 540, 520, 64, '#5ef0d8', 'EPISÓDIO ANTERIOR');
texto(S0, 540, 640, 84, '#fff', 'ELE LÊ O CONTRATO?');
const barras = [['A) SIM', 38, '#8a90a0'], ['B) NÃO', 62, '#ffd400']].map(([n, p, c], i) => {
  const gg = g({ transform: `translate(140 ${820 + i * 220})` }, S0);
  el('rect', { width: 800, height: 140, rx: 20, fill: 'rgba(255,255,255,0.06)' }, gg);
  const b = el('rect', { width: 0, height: 140, rx: 20, fill: c, opacity: 0.85 }, gg);
  const tn = el('text', { x: 30, y: 92, 'font-family': 'Anton', 'font-size': 64, fill: '#0a0a0a' }, gg); tn.textContent = n;
  const tp = el('text', { x: 770, y: 92, 'text-anchor': 'end', 'font-family': 'Anton', 'font-size': 64, fill: '#fff' }, gg);
  return { b, tp, p };
});
const dec0 = texto(S0, 540, 1380, 76, '#ffd400', 'A PLATEIA DECIDIU', { opacity: 0 });

// ---------- S1 gancho: a loba salta e a tela racha ----------
const S1 = cena([0, 8]);
const cav1 = W.caverna(S1, { fundo: true });
const alfa1g = g({}, S1), alfa1 = W.lobo(alfa1g, { alfa: true, seed: 3 });
const crack1 = W.rachadura(S1, 560, 880, 5);
const flash1 = el('rect', { width: 1080, height: 1920, fill: '#fff', opacity: 0 }, S1);
vinheta(S1, 0.85);

// ---------- S2 título ----------
const S2 = cena([13, 14.3]);
el('rect', { width: 1080, height: 1920, fill: '#06080c' }, S2);
const tit2 = g({}, S2);
texto(tit2, 540, 860, 190, '#ffd400', 'HORAS', { 'paint-order': 'stroke', stroke: '#3a2a00', 'stroke-width': 14 });
texto(tit2, 540, 1060, 190, '#ffffff', 'EXTRAS', { 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 14 });
texto(tit2, 540, 1190, 64, '#5ef0d8', 'T1 · EP2 — A TOCA DOS LOBOS');
const garra2 = g({ stroke: '#b01818', 'stroke-width': 26, 'stroke-linecap': 'round' }, S2);
const gs2 = [0, 1, 2].map((i) => L.traco(garra2, `M${250 + i * 110} 380 L${520 + i * 110} 1500`, '#b01818', 22));

// ---------- S3 cozinha ----------
const S3 = cena([14.3, 29]);
const coz = W.cozinha(S3);
const v3g = g({}, S3), v3 = H.vitorBusto(v3g);
const gato3g = g({}, S3), gato3 = L.brasa(gato3g);
const miau = g({ opacity: 0 }, S3); el('rect', { x: 620, y: 1240, width: 230, height: 100, rx: 50, fill: '#fff' }, miau); el('path', { d: 'M700 1335 l-30 50 l60 -40 Z', fill: '#fff' }, miau); texto(miau, 735, 1312, 60, '#e0782a', 'MIAU');
vinheta(S3, 0.6);
const hud3 = H.relogioHUD(S3), sal3 = H.saldoHUD(S3);

// ---------- S4 quarto + pixels ----------
const S4 = cena([29, 35.4]);
const quarto = H.quartoNoite(S4);
const cab4 = g({ transform: 'translate(560 1250) scale(0.5)' }, S4); const f4 = L.rosto(cab4, { pele: ['#e8a676', '#cf8656', '#b56f45'], cabelo: '#2a1a10', olhos: '#3a78c0', estilo: 'cachos', barba: 'rala', cicatriz: true, bravo: 0.2 });
el('path', { d: 'M300 1380 Q560 1320 1080 1360 L1080 1920 L280 1920 Z', fill: grad([[0, '#3a4a6a'], [1, '#1a2236']]) }, S4);
const gato4 = L.brasa(g({ transform: 'translate(700 1560) scale(0.85)' }, S4));
const hud4 = H.relogioHUD(S4), sal4 = H.saldoHUD(S4);
vinheta(S4, 0.6);
const pix4 = H.pixels(S4, 4);

// ---------- S5 vila: mural de missões ----------
const S5 = cena([35.4, 46.7]);
const vila = W.vilaMural(S5);
const her5g = g({}, S5), her5 = L.vitoriosoCorpo(her5g);
const pix5 = H.pixels(S5, 6);
const hudJ5 = H.hudJogo(S5), hud5 = H.relogioHUD(S5, { modo: 'jogo' }), sal5 = H.saldoHUD(S5, { rotulo: 'GANHO DA NOITE' });
const S5b = cena([46.7, 50]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#7ab8e8'], [1, '#c8a070']]) }, S5b);
const vit5g = g({}, S5b), vit5 = L.vitoriosoBusto(vit5g);
const r400 = texto(S5b, 540, 430, 160, '#3fd26a', 'R$ 400', { 'paint-order': 'stroke', stroke: '#0a3a1a', 'stroke-width': 14 });

// ---------- S6 entrada da toca: três lobos ----------
const S6 = cena([50, 74]);
const cav6 = W.caverna(S6);
const lobos6 = KILLS.map((k, i) => { const l = W.lobo(g({}, S6), { seed: i + 1 }); l.k = k; l.lado = i % 2 ? 1 : -1; return l; });
const her6g = g({}, S6), her6 = L.vitoriosoCorpo(her6g);
const flash6 = el('rect', { width: 1080, height: 1920, fill: '#ffe8a0', opacity: 0 }, S6);
const nums6 = H.numerosTempo(S6, '#3fd26a', '#0a3a1a');
const plat6 = H.plateia(S6, [['bia_gamer', 'agora sim, tanque!'], ['kaique.07', 'R$75 já kkk'], ['jp_lol', 'cuidado com a alfa'], ['dona_rosa', 'vai dormir menino']], 21);
vinheta(S6, 0.55);
const hudJ6 = H.hudJogo(S6), hud6 = H.relogioHUD(S6, { modo: 'jogo' }), sal6 = H.saldoHUD(S6, { rotulo: 'GANHO DA NOITE' });

// ---------- S7 fundo da toca: Garra-Velha ----------
const S7 = cena([74, 83], [85.3, 94]);
const cav7 = W.caverna(S7, { fundo: true });
const olhos7 = g({}, S7), ol7 = Array.from({ length: 8 }, (_, i) => { const gg = g({ transform: `translate(${120 + (i * 131) % 860} ${600 + (i * 97) % 500})` }, olhos7); for (const s of [-1, 1]) el('circle', { cx: s * 14, r: 8, fill: '#ffd040' }, gg); return gg; });
const alfa7g = g({}, S7), alfa7 = W.lobo(alfa7g, { alfa: true, seed: 3 });
const her7g = g({}, S7), her7 = L.vitoriosoCorpo(her7g);
const fais7 = g({ fill: '#ffd060' }, S7), fs7 = Array.from({ length: 30 }, (_, i) => ({ e: el('circle', { r: 5 }, fais7), a: (i / 30) * Math.PI * 2, v: 200 + (i % 5) * 80 }));
const red7 = el('rect', { width: 1080, height: 1920, fill: '#c01010', opacity: 0 }, S7);
const crack7 = W.rachadura(S7, 540, 1000, 9);
vinheta(S7, 0.8);
const hudJ7 = H.hudJogo(S7), hud7 = H.relogioHUD(S7, { modo: 'jogo' }), sal7 = H.saldoHUD(S7, { rotulo: 'GANHO DA NOITE' });
const S7b = cena([83, 85.3]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#1a1418'], [1, '#0c0a10']]) }, S7b);
const vit7g = g({}, S7b), vit7 = L.vitoriosoBusto(vit7g);
vinheta(S7b, 0.7);

// ---------- S8 flash: coração ----------
const S8 = cena([94, 97.6]);
const mon = W.monitorCardiaco(S8);
const fl8 = g({}, S8);
el('rect', { x: 90, y: 1200, width: 900, height: 230, rx: 24, fill: 'rgba(0,0,0,0.75)', stroke: '#3fff7a', 'stroke-width': 4 }, fl8);
texto(fl8, 540, 1290, 58, '#9fe6ee', 'O CORAÇÃO BATE');
texto(fl8, 540, 1390, 92, '#ffd400', '100 MIL VEZES POR DIA');

// ---------- S9 o dinheiro some ----------
const S9 = cena([97.6, 104]);
el('rect', { width: 1080, height: 1920, fill: '#050507' }, S9);
const moed = W.moedas(S9, 15, 8);
const g9 = g({}, S9);
el('rect', { x: 190, y: 560, width: 700, height: 240, rx: 24, fill: 'rgba(0,0,0,0.7)', stroke: '#ff5050', 'stroke-width': 6 }, g9);
texto(g9, 540, 640, 50, '#ff8a8a', 'GANHO DA NOITE');
const v9 = texto(g9, 540, 760, 120, '#fff', 'R$ 75,00');
const risco9 = el('line', { x1: 280, y1: 720, x2: 800, y2: 720, stroke: '#ff3030', 'stroke-width': 14, 'stroke-linecap': 'round' }, g9);
texto(S9, 540, 1500, 70, '#ff5050', 'PERDIDO NA MORTE', { 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 10 });

// ---------- S10 acordar 3:12 ----------
const S10 = cena([104, 120]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#141a2a'], [1, '#06080c']]) }, S10);
const desp10 = g({ transform: 'translate(260 520)' }, S10);
el('rect', { x: -170, y: -90, width: 340, height: 180, rx: 30, fill: '#1a1a1e' }, desp10);
texto(desp10, 0, 45, 120, '#e83a3a', '03:12');
const v10g = g({}, S10), v10 = H.vitorBusto(v10g, { macacao: false, curativo: true }); const sang10 = W.sangueNariz(v10g, 0);
const red10 = el('rect', { width: 1080, height: 1920, fill: '#c01010', opacity: 0 }, S10);
vinheta(S10, 0.7);
const cel10 = g({}, S10); el('rect', { width: 1080, height: 1920, fill: 'rgba(5,8,14,0.85)' }, cel10);
const ext10 = H.extrato(cel10, [[0, 'LOOT PERDIDO NA MORTE (R$ 75)'], [0, 'TAXA DE SERVIÇO']], SALDO, SALDO, '55a 04m 12d · −1 ANO');
const hud10 = H.relogioHUD(S10), sal10 = H.saldoHUD(S10);

// ---------- S11 cozinha de madrugada: a Cláusula 14 ----------
const S11 = cena([120, 139]);
const ctr = H.contrato(S11);
const lup = g({ opacity: 0 }, S11); el('circle', { cx: 0, cy: 0, r: 150, fill: 'rgba(255,255,255,0.08)', stroke: '#2a2a30', 'stroke-width': 18 }, lup); el('rect', { x: 100, y: 100, width: 40, height: 200, rx: 16, fill: '#2a2a30', transform: 'rotate(-45 120 200)' }, lup);
const S11b = g({}, S11);
const coz11 = W.cozinha(S11b);
el('rect', { width: 1080, height: 1920, fill: 'rgba(10,14,40,0.55)' }, S11b);
const v11g = g({}, S11b), v11 = H.vitorBusto(v11g, { macacao: false, curativo: true }); const sang11 = W.sangueNariz(v11g, 0.5);
const gato11 = L.brasa(g({ transform: 'translate(880 1500) scale(0.8)' }, S11b));
const cel11 = g({ transform: 'translate(780 1300) rotate(-8)' }, S11b);
el('rect', { x: -110, y: -200, width: 220, height: 400, rx: 26, fill: '#14161c' }, cel11); el('rect', { x: -95, y: -180, width: 190, height: 360, rx: 16, fill: '#e8eef4' }, cel11);
texto(cel11, 0, -60, 34, '#5a6070', 'LIGAR PARA'); texto(cel11, 0, 10, 62, '#1a2a44', 'MÃE'); el('circle', { cx: 0, cy: 110, r: 46, fill: '#3fd26a' }, cel11);
vinheta(S11b, 0.6);
const hud11 = H.relogioHUD(S11), sal11 = H.saldoHUD(S11);

// ---------- S12 votação ----------
const FIM = cena([139, 150.1]);
el('rect', { width: 1080, height: 1920, fill: '#000' }, FIM);
texto(FIM, 540, 560, 64, '#5ef0d8', 'HORAS EXTRAS · EP2');
texto(FIM, 540, 760, 92, '#fff', 'ELE CONTA PRA MÃE');
texto(FIM, 540, 870, 92, '#ffd400', 'SOBRE O CHIP?');
const opc = [['A) SIM', 1080], ['B) NÃO', 1240]].map(([t, y], i) => { const gg = g({}, FIM); el('rect', { x: 190, y: y - 90, width: 700, height: 120, rx: 22, fill: 'none', stroke: '#ffd400', 'stroke-width': 6 }, gg); texto(gg, 540, y, 80, i ? '#fff' : '#ffd400', t); return gg; });
texto(FIM, 540, 1430, 60, '#b4b4b4', 'A PLATEIA DECIDE · COMENTA AÍ');
const hudF = H.relogioHUD(FIM), salF = H.saldoHUD(FIM);

const corte = L.cortes(cenas);
// ---------- legendas ----------
const leg = L.legendas(L.svg, [
  [0.4, 4.5, [['QUANTO CUSTA', 0], ['MORRER?', 1]]],
  [8.6, 11.9, [['ELE NÃO LEU', 0], ['O CONTRATO.', 1]]],
  [17.0, 19.4, [['19H. 10 HORAS', 1], ['DE FÁBRICA.', 0]]], [19.5, 22.1, [['MIOJO EM PÉ,', 0], ['NA PIA.', 1]]],
  [24.0, 26.6, [['HOJE EU VOLTO', 0], ['COM DINHEIRO.', 1]]],
  [36.0, 39.0, [['MISSÃO SOLO:', 0], ['TOCA DOS LOBOS.', 1]]], [39.1, 42.6, [['RECOMPENSA:', 0], ['R$ 400.', 1]]],
  [43.2, 46.8, [['QUASE METADE', 0], ['DO ALUGUEL!', 1]]],
  [50.5, 52.6, [['TRÊS', 1], ['LOBOS.', 0]]], [52.7, 54.9, [['R$ 25', 1], ['CADA.', 0]]],
  [69.0, 72.0, [['900', 1], ['ESPECTADORES.', 0]]],
  [75.0, 77.6, [['A GARRA-VELHA.', 1]]], [77.7, 80.6, [['A LOBA ALFA.', 0], ['CAOLHA.', 1]]],
  [83.0, 85.3, [['PODE VIR QUE', 0], ['EU SEGURO!', 1]]],
  [86.0, 87.3, [['O PRIMEIRO.', 0]]], [87.4, 88.6, [['O SEGUNDO.', 0]]], [88.7, 90.0, [['O TERCEIRO.', 1]]],
  [91.5, 93.6, [['O QUARTO VEIO', 0], ['POR TRÁS.', 1]]],
  [98.0, 102.4, [['R$ 75 FICARAM NO', 0], ['CHÃO DA CAVERNA.', 1]]],
  [104.5, 107.4, [['QUE... QUE', 0], ['FOI ISSO?', 1]]],
  [108.0, 110.4, [['3:12.', 1], ['SANGUE NO NARIZ.', 0]]], [110.5, 113.3, [['UM ANO', 1], ['A MENOS.', 0]]],
  [114.0, 117.9, [['UMA NOITE INTEIRA.', 0], ['ZERO REAIS.', 1]]],
  [122.0, 124.8, [['MORTES NO', 0], ['AMBIENTE VARNOR...', 1]]], [124.9, 127.6, [['DEBITADAS DO', 0], ['TEMPO DE VIDA.', 1]]],
]);

// =====================================================================
window.DUR = 150;
window.renderAt = (t) => {
  for (const c of cenas) c.style.display = c.rs.some(([a, b]) => t >= a && t < b) ? '' : 'none';
  // S0
  if (t >= 8 && t < 13) { const t0 = t - 8; barras.forEach((b, i) => { const k = ease((t0 - 0.4 - i * 0.2) / 1.2); b.b.setAttribute('width', 8 * b.p * k); b.tp.textContent = Math.round(b.p * k) + '%'; }); dec0.setAttribute('opacity', ease((t0 - 2.0) / 0.4)); }
  // S1
  if (t < 8) {
    const u = t, k = ease(rel(t, 2.6, 4.8));
    alfa1g.setAttribute('transform', `translate(${100 + 340 * k} ${1500 - 300 * Math.sin(k * Math.PI) + 200 * k}) scale(${1.2 + 2.4 * k})`);
    alfa1.set({ t, pulo: k > 0 && k < 1 ? 1 : 0, rosna: 1, uiva: t > 0.4 && t < 2.4 ? ease((t - 0.4) / 0.4) : 0 });
    crack1.set(rel(t, 4.8, 5.4)); flash1.setAttribute('opacity', t > 4.8 ? 0.7 * Math.exp(-(t - 4.8) * 6) : 0);
    S1.setAttribute('transform', t > 4.8 && t < 5.4 ? `translate(${18 * Math.sin(t * 90)} ${12 * Math.cos(t * 70)})` : '');
  }
  // S2
  if (t >= 13 && t < 14.3) { const u = t - 13; tit2.setAttribute('opacity', ease(u / 0.4)); gs2.forEach((gg, i) => gg.set((u - 0.6 - i * 0.12) / 0.25)); }
  // S3
  if (t >= 14.3 && t < 29) {
    const u = t - 14.3; coz.set(t); busto(v3g, 0.86, 10 * Math.sin(u * 0.7));
    v3.set({ boca: boca('V', t), expr: t > 23.5 ? 'riso' : 'neutro', piscar: pisca(t) });
    gato3g.setAttribute('transform', `translate(${1180 - 360 * ease((t - 21.2) / 1.2)} 1840) scale(0.9)`); gato3.set({ t });
    miau.setAttribute('opacity', t > 22.4 && t < 24 ? 1 : 0);
    hud3.set({ texto: '56a 04m 12d', show: 1 }); sal3.set({ valor: SALDO, show: 1 });
  }
  // S4
  if (t >= 29 && t < 35.4) { const u = t - 29; quarto.set(u, '21:30'); f4.set({ piscar: u > 1.5 ? 1 : pisca(t), expr: 'neutro' }); gato4.set({ t }); hud4.set({ texto: '56a 04m 12d', show: 0.85 }); sal4.set({ valor: SALDO, show: 0.85 }); pix4.set(rel(t, 33.6, 35.4)); }
  // S5
  if (t >= 35.4 && t < 46.7) {
    const u = t - 35.4; pix5.set(1 - rel(t, 35.4, 36.4));
    const z = 1 + 0.5 * ease(rel(t, 38.5, 41)); vila.g.setAttribute('transform', `translate(680 820) scale(${z}) translate(-680 -820)`);
    her5g.setAttribute('transform', `translate(${300 - 40 * ease(rel(t, 38.5, 41))} 1880) scale(0.8)`); her5.set({ expr: 'serio', piscar: pisca(t) });
    vila.cartaz.setAttribute('transform', `translate(0 ${-6 * Math.abs(Math.sin(t * 3))})`);
    hudJ5.set({ nivel: 3 }); hud5.set({ texto: '56a 04m 12d', show: 1 }); sal5.set({ valor: 0, show: 1 });
  }
  if (t >= 46.7 && t < 50) { const u = t - 46.7; busto(vit5g, 1.02 + 0.02 * u); vit5.set({ expr: 'riso', boca: boca('V', t), piscar: pisca(t) }); r400.setAttribute('transform', `translate(540 430) scale(${1 + 0.06 * Math.sin(t * 6)}) translate(-540 -430)`); }
  // S6
  if (t >= 50 && t < 74) {
    let crava = 0;
    lobos6.forEach((l) => {
      const ini = l.k - 3.4, d = t - l.k, k = ease((t - ini) / 3.4), x = 540 + l.lado * (820 - 500 * k);
      l.g.style.display = t > ini && d < 1.4 ? '' : 'none'; l.g.setAttribute('opacity', d > 0.7 ? clamp(1 - (d - 0.7) / 0.7) : 1);
      l.g.setAttribute('transform', `translate(${x} 1840) scale(${-l.lado * 1.3} 1.3)`);
      l.set({ t, pulo: d > -0.5 && d < 0 ? 1 : 0, morto: d > 0, rosna: 1 });
      if (d > -0.15 && d < 0.35) crava = Math.max(crava, d < 0 ? 1 + d / 0.15 : 1 - d / 0.35);
    });
    her6g.setAttribute('transform', 'translate(540 1800) scale(0.9)'); her6.set({ crava: ease(crava), expr: 'bravo', piscar: pisca(t) });
    const ult = KILLS.filter((k) => t >= k).pop(), dk = ult ? t - ult : 9;
    flash6.setAttribute('opacity', dk < 0.3 ? 0.35 * (1 - dk / 0.3) : 0);
    S6.setAttribute('transform', dk < 0.25 ? `translate(${10 * Math.sin(t * 95)} ${8 * Math.cos(t * 80)})` : '');
    nums6.set(t, KILLS.map((k, i) => [k, 540 + (i % 2 ? 1 : -1) * 280, 1300, '+R$ 25']));
    plat6.g.style.display = t > 69 ? '' : 'none'; plat6.set(t - 70, t < 69 ? 0 : Math.round(312 + 588 * ease((t - 69) / 1.5)));
    hudJ6.set({ nivel: ult ? 4 : 3, hp: 1 - 0.08 * KILLS.filter((k) => t >= k).length, fadiga: 0.25 }); hud6.set({ texto: '56a 04m 12d', show: 1 });
    sal6.set({ valor: ganho(t), show: 1, deltaTxt: '+R$ 25', deltaK: dk < 1.2 ? 1 - dk / 1.2 : 0 });
  }
  // S7
  if ((t >= 74 && t < 83) || (t >= 85.3 && t < 94)) {
    ol7.forEach((o, i) => o.setAttribute('opacity', t < 80 && Math.sin(t * 2 + i * 1.7) > -0.6 ? 1 : 0));
    const sai = ease(rel(t, 75, 79));
    let ax = 1400 - 400 * sai, ay = 1780, pulo = 0, uiva = t > 80.6 && t < 82.6 ? 1 : 0;
    // bloqueios: a loba salta no escudo e recua
    for (const b of BLOQ) { const d = t - b; if (d > -0.45 && d < 0.4) { const k = d < 0 ? 1 + d / 0.45 : 1 - d / 0.4; ax -= 200 * k; pulo = 1; } }
    // o quarto ataque: some na escuridão e vem por trás (pela esquerda)
    const atras = t > 90.2;
    if (atras) { const k = ease(rel(t, 92.6, MORTE)); ax = -350 + 470 * k; ay = 1780 - 200 * Math.sin(k * Math.PI); pulo = k > 0 && k < 1 ? 1 : 0; }
    alfa7g.style.display = t > 89.9 && t < 92.6 ? 'none' : '';
    alfa7g.setAttribute('transform', `translate(${ax} ${ay}) scale(${atras ? 0.85 : -0.85} 0.85)`);
    alfa7.set({ t, pulo, uiva, rosna: 1 });
    let crava = 0; for (const b of BLOQ) { const d = t - b; if (d > -0.15 && d < 0.4) crava = Math.max(crava, d < 0 ? 1 + d / 0.15 : 1 - d / 0.4); }
    const dm = t - MORTE, cai = ease(dm / 0.5);
    her7g.setAttribute('transform', `translate(${400 + 60 * cai} 1800) rotate(${80 * cai}) scale(0.88)`);
    her7.set({ crava: ease(crava), expr: dm > 0 ? 'surpreso' : 'bravo', piscar: dm > 0.3 ? 1 : pisca(t) });
    const ultB = BLOQ.filter((b) => t >= b).pop(), db = ultB ? t - ultB : 9;
    fs7.forEach((f) => { if (db > 0.6) { f.e.setAttribute('cx', -99); return; } f.e.setAttribute('cx', 620 + Math.cos(f.a) * f.v * db); f.e.setAttribute('cy', 1350 + Math.sin(f.a) * f.v * db + 600 * db * db); f.e.setAttribute('opacity', 1 - db / 0.6); });
    S7.setAttribute('transform', db < 0.25 || (dm > 0 && dm < 0.4) ? `translate(${12 * Math.sin(t * 95)} ${9 * Math.cos(t * 80)})` : '');
    red7.setAttribute('opacity', dm > 0 ? 0.6 * Math.exp(-dm * 2) : 0); crack7.set(rel(t, MORTE, MORTE + 0.4));
    const nb = BLOQ.filter((b) => t >= b).length;
    hudJ7.set({ nivel: 4, hp: dm > 0 ? 0 : Math.max(0.05, 0.76 - 0.2 * nb), fadiga: 0.3 }); hud7.set({ texto: '56a 04m 12d', show: 1 });
    sal7.set({ valor: ganho(t), show: 1 });
  }
  if (t >= 83 && t < 85.3) { busto(vit7g, 1.04); vit7.set({ expr: 'bravo', boca: boca('V', t), piscar: 0 }); }
  // S8
  if (t >= 94 && t < 97.6) { mon.set(t, 96.4); fl8.setAttribute('opacity', t < 96.9 ? ease((t - 94.2) / 0.2) : 0); }
  // S9
  if (t >= 97.6 && t < 104) { moed.set(t - 97.8); v9.textContent = t < 100 ? 'R$ 75,00' : 'R$ 0,00'; risco9.setAttribute('opacity', t > 99.4 && t < 100 ? 1 : 0); v9.setAttribute('fill', t < 100 ? '#fff' : '#ff5050'); }
  // S10
  if (t >= 104 && t < 120) {
    const u = t - 104, choque = ease(u / 0.3);
    desp10.setAttribute('opacity', 0.8 + 0.2 * Math.sin(t * 2));
    busto(v10g, 0.96 + 0.06 * (1 - choque), 30 * Math.sin(Math.min(u, 1.5) * 20) * Math.exp(-u * 2));
    v10.set({ boca: boca('V', t), expr: t < 108 ? 'surpreso' : 'triste', piscar: pisca(t) }); sang10.setAttribute('opacity', ease((t - 105.5) / 1.2));
    const d = t - 111.4; red10.setAttribute('opacity', d > 0 ? 0.45 * Math.exp(-d * 2.5) : 0);
    hud10.set({ texto: d > 0 ? '55a 04m 12d' : '56a 04m 12d', show: 1, deltaTxt: '-1 ANO', deltaK: d > 0 && d < 3 ? 1 : 0, falha: d > 0 && d < 0.7, cor2: d > 0 ? '#ff4040' : null });
    cel10.style.display = t >= 113.8 ? '' : 'none'; ext10.set(rel(t, 114.1, 116.8));
    ext10.g.setAttribute('transform', `translate(540 ${1000 + 900 * (1 - ease((t - 113.8) / 0.4))})`);
    sal10.set({ valor: SALDO, show: 1, deltaTxt: '+R$ 0,00', deltaK: t > 116.8 ? 1 : 0, neg: true });
  }
  // S11
  if (t >= 120 && t < 139) {
    const leitura = t < 128.5; ctr.g.style.display = leitura ? '' : 'none'; S11b.style.display = leitura ? 'none' : '';
    const u = t - 120; ctr.g.setAttribute('transform', `translate(540 860) scale(${1 + 0.3 * ease(u / 7)}) translate(-540 -860)`); ctr.set((t - 122) / 2.5);
    lup.setAttribute('opacity', leitura ? 1 : 0); lup.setAttribute('transform', `translate(${380 + 260 * ease(rel(t, 122, 127))} ${960 + 20 * Math.sin(t * 2)})`);
    coz11.set(t); busto(v11g, 0.9 + 0.006 * (t - 128.5)); v11.set({ expr: 'triste', piscar: pisca(t), olharX: t > 133 ? 0.6 : 0 }); gato11.set({ t });
    cel11.setAttribute('opacity', ease((t - 132.5) / 0.6));
    hud11.set({ texto: '55a 04m 12d', show: 1, cor2: '#ff4040' }); sal11.set({ valor: SALDO, show: 1 });
  }
  // FIM
  if (t >= 139) { opc.forEach((o, i) => o.setAttribute('opacity', ease((t - 140 - i * 0.4) / 0.4))); hudF.set({ texto: '55a 04m 12d', show: 1, cor2: '#ff4040' }); salF.set({ valor: SALDO, show: 1 }); }
  corte.set(t);
  leg.set(t);
  return true;
};
L.pronto();

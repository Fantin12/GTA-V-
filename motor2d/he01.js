// HORAS EXTRAS — T1·EP1 "Renda Extra" (2D, 2:30)
import * as H from './lib2.js';
import * as L from './lib.js';
const { el, g, ease, clamp, rel, rng, grad } = L;
const lip = await (await fetch('/lipsync_he01.json')).json();
const boca = (who, t) => { const a = lip[who] || []; return a[Math.max(0, Math.min(a.length - 1, Math.floor(t * 30)))] || 0; };
const cenas = [];
const cena = (...rs) => { const c = g(); c.rs = rs; cenas.push(c); return c; };   // rs = [a,b] pares
const R = rng(77);
const pisca = (t, ph = 0) => (Math.sin(t * 1.9 + ph) > 0.985 ? 1 : 0);
const texto = (parent, x, y, s, cor, txt, extra = {}) => { const e = el('text', { x, y, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': s, fill: cor, ...extra }, parent); e.textContent = txt; return e; };
const vinheta = (parent, op = 0.7) => el('rect', { width: 1080, height: 1920, fill: grad([[0, 'rgba(0,0,0,0)'], [0.6, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${op})`]], { radial: true, cx: 0.5, cy: 0.5, r: 0.75 }) }, parent);
const KILLS = [96.8, 102.2, 103.2, 104.2, 105.2, 106.2, 107.2, 108.2, 109.2];
const minGanhos = (t) => KILLS.filter((k) => t >= k).length * 20;
const ganhoNoite = (t) => KILLS.filter((k) => t >= k).length * 5;
const SALDO0 = 312.40, SALDO1 = 348.40;

// ---------- S1 gancho: Vitor dormindo, relógio perde 1 ano ----------
const S1 = cena([0, 6.8]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#0e1424'], [1, '#05070c']]) }, S1);
H.luzCone(S1, 540, 0, 1100, 1500, 'rgba(120,160,255,0.12)');
const v1g = g({}, S1), v1 = H.vitorBusto(v1g, { macacao: true });
const ondas1 = g({ fill: 'none', stroke: '#5ef0d8', 'stroke-width': 4 }, S1), on1 = [0, 1, 2].map(() => el('circle', { cx: 540, cy: 700 }, ondas1));
vinheta(S1, 0.8);
const red1 = el('rect', { width: 1080, height: 1920, fill: '#c01010', opacity: 0 }, S1);
const hud1 = H.relogioHUD(S1), sal1 = H.saldoHUD(S1);

// ---------- S2 título ----------
const S2 = cena([6.8, 10.5]);
el('rect', { width: 1080, height: 1920, fill: '#06080c' }, S2);
const dig2 = g({ fill: 'rgba(94,240,216,0.10)', 'font-family': 'Anton', 'font-size': 60 }, S2);
for (let i = 0; i < 40; i++) { const e = el('text', { x: R() * 1080, y: R() * 1920 }, dig2); e.textContent = ['00:00', '56a', '+20min', '-1 ANO', '04:40'][i % 5]; }
const tit2 = g({}, S2);
texto(tit2, 540, 860, 190, '#ffd400', 'HORAS', { 'paint-order': 'stroke', stroke: '#3a2a00', 'stroke-width': 14 });
texto(tit2, 540, 1060, 190, '#ffffff', 'EXTRAS', { 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 14 });
texto(tit2, 540, 1190, 64, '#5ef0d8', 'T1 · EP1 — RENDA EXTRA');
const rel2 = g({ transform: 'translate(540 520)' }, S2);
el('circle', { r: 120, fill: 'none', stroke: '#ffd400', 'stroke-width': 12 }, rel2);
const pont2 = el('line', { x1: 0, y1: 0, x2: 0, y2: -95, stroke: '#ffd400', 'stroke-width': 10, 'stroke-linecap': 'round' }, rel2);
const pont2b = el('line', { x1: 0, y1: 0, x2: 60, y2: 0, stroke: '#fff', 'stroke-width': 12, 'stroke-linecap': 'round' }, rel2);

// ---------- S3 ônibus ----------
const S3 = cena([10.5, 14]);
const bus = H.onibus(S3);
const v3g = g({}, S3), v3 = H.vitorBusto(v3g);
const relogio3 = texto(S3, 860, 330, 70, '#ffd400', '05:00', { 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 10 });
vinheta(S3, 0.6);

// ---------- S4 fábrica (plano geral, Bráulio, Vitor) ----------
const S4 = cena([14, 25]);
const fab = H.fabrica(S4);
const fabDim = el('rect', { width: 1080, height: 1920, fill: 'rgba(10,14,18,0)' }, S4);
const fabPoeira = H.poeira(S4, 50, 8, 'rgba(255,200,150,0.25)');
const b4g = g({}, S4), b4 = H.brauilioBusto(b4g);
const v4g = g({}, S4), v4 = H.vitorBusto(v4g);
const turno4 = g({ transform: 'translate(60 260)' }, S4);
el('rect', { width: 420, height: 90, rx: 14, fill: 'rgba(0,0,0,0.6)', stroke: '#e8c030', 'stroke-width': 4 }, turno4);
const turnoTx = el('text', { x: 24, y: 64, 'font-family': 'Anton', 'font-size': 52, fill: '#e8c030' }, turno4);
vinheta(S4, 0.6);

// ---------- S5 hospital ----------
const S5 = cena([25, 37.5]);
const hosp = H.hospital(S5);
const mae = H.maeNaCama(S5);
const v5g = g({}, S5), v5 = H.vitorBusto(v5g);
const conta5 = g({}, S5);
el('rect', { x: 90, y: 540, width: 900, height: 600, rx: 30, fill: 'rgba(6,10,16,0.88)', stroke: '#ffd400', 'stroke-width': 6 }, conta5);
texto(conta5, 540, 640, 60, '#ffffff', 'CIRURGIA');
const conta5n = texto(conta5, 540, 810, 170, '#ffd400', 'R$ 0');
const conta5s = texto(conta5, 540, 930, 62, '#3fd26a', 'SALDO DELE: R$ 312,40');
const conta5b = texto(conta5, 540, 1060, 60, '#ff8a8a', '= 9 ANOS DE HORA EXTRA');
vinheta(S5, 0.55);

// ---------- S6 ponto de ônibus / anúncio ----------
const S6 = cena([37.5, 45]);
const ponto = H.pontoOnibus(S6);
const silh6 = g({ fill: '#08080c' }, S6);
el('circle', { cx: 300, cy: 1500, r: 90 }, silh6); el('path', { d: 'M150 1920 L170 1620 Q300 1560 430 1620 L450 1920 Z' }, silh6);
const chuva6 = L.chuva(S6, 90, 66);

// ---------- S7 clínica + flash + relógio aparece ----------
const S7 = cena([45, 49.3]);
const clin = H.clinica(S7);
const pag7 = texto(S7, 540, 680, 120, '#1a2a44', 'PÁG. 1/40');
const ass7 = L.traco(S7, 'M380 1420 q30 -60 60 0 t60 0 q20 -40 50 -10 t70 10 q30 -30 60 0', '#1a2a8a', 6);
const S7f = cena([49.3, 52.3]);
const q7 = L.quadro(S7f);
const cerebro = [L.traco(q7, 'M300 700 Q280 480 450 430 Q540 360 640 420 Q800 430 800 600 Q840 720 740 790 Q700 860 600 840 Q540 880 460 840 Q330 840 300 700 Z'),
  L.traco(q7, 'M420 520 q40 40 0 90 q-40 50 20 90 M560 450 q-30 70 30 120 q50 50 0 120 M680 520 q-40 50 10 100', '#9fe6ee', 5),
  L.traco(q7, 'M560 840 q10 80 -10 140', '#9fe6ee', 12)];
const rot7a = L.rotulo(q7, 540, 1150, '86 BILHÕES', { size: 120 });
const rot7b = L.rotulo(q7, 540, 1250, 'DE NEURÔNIOS', { cor: '#9fe6ee', size: 64 });
const neur = g({ fill: '#ffd400' }, q7), neu = Array.from({ length: 30 }, () => ({ e: el('circle', { r: 5, cx: 340 + R() * 420, cy: 460 + R() * 360 }, neur), ph: R() * 6 }));
const S7b = cena([52.3, 61]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#eef6fa'], [1, '#b8ccd8']]) }, S7b);
const v7g = g({}, S7b), v7 = H.vitorBusto(v7g, { curativo: true });
const branco7 = el('rect', { width: 1080, height: 1920, fill: '#fff', opacity: 1 }, S7b);
const hud7 = H.relogioHUD(S7b);
const seta7 = g({}, S7b); el('path', { d: 'M760 360 q-80 100 -200 120', fill: 'none', stroke: '#e83a3a', 'stroke-width': 10, 'stroke-linecap': 'round' }, seta7); el('path', { d: 'M760 360 l-40 10 l26 30 Z', fill: '#e83a3a' }, seta7);

// ---------- S8 quarto à noite, Brasa no peito ----------
const S8 = cena([61, 71.5]);
const quarto = H.quartoNoite(S8);
const cab8 = g({ transform: 'translate(560 1250) scale(0.5)' }, S8); const f8 = L.rosto(cab8, { pele: ['#e8a676', '#cf8656', '#b56f45'], cabelo: '#2a1a10', olhos: '#3a78c0', estilo: 'cachos', barba: 'rala', cicatriz: true, bravo: 0.2 });
el('path', { d: 'M300 1380 Q560 1320 1080 1360 L1080 1920 L280 1920 Z', fill: grad([[0, '#3a4a6a'], [1, '#1a2236']]) }, S8);   // coberta
const gato8g = g({}, S8), gato8 = L.brasa(gato8g);
const zz8 = g({ fill: '#9fe6ee', 'font-family': 'Anton' }, S8), zz = [0, 1, 2].map(() => { const e = el('text', { 'font-size': 60 }, zz8); e.textContent = 'z'; return e; });
const hud8 = H.relogioHUD(S8);
vinheta(S8, 0.6);
const pix8 = H.pixels(S8, 4);

// ---------- S9 chegada ao jogo: escolha de classe ----------
const S9 = cena([71.5, 81]);
const campo = H.campoDourado(S9);
const cards = ['MAGO', 'TANQUE', 'ARQUEIRO'].map((nm, i) => {
  const c = g({}, S9); el('rect', { x: -140, y: -220, width: 280, height: 440, rx: 24, fill: 'rgba(10,14,30,0.85)', stroke: '#c8d0e0', 'stroke-width': 5 }, c);
  const ic = g({ transform: 'translate(0 -60)' }, c);
  if (i === 0) { el('path', { d: 'M0 -110 L60 40 H-60 Z', fill: '#7a5ae8' }, ic); el('circle', { cy: 60, r: 26, fill: '#c8b0ff' }, ic); }
  if (i === 1) L.escudoTorre(ic, { s: 0.42 });
  if (i === 2) { el('path', { d: 'M-50 -100 Q60 0 -50 100', fill: 'none', stroke: '#c89a5a', 'stroke-width': 12 }, ic); el('line', { x1: -50, y1: -100, x2: -50, y2: 100, stroke: '#eee', 'stroke-width': 3 }, ic); el('line', { x1: -70, y1: 0, x2: 70, y2: 0, stroke: '#eee', 'stroke-width': 6 }, ic); }
  texto(c, 0, 170, 52, '#fff', nm);
  return { c, borda: c.firstChild, i };
});
const cls9 = texto(S9, 540, 520, 76, '#fff', 'ESCOLHA SUA CLASSE', { 'paint-order': 'stroke', stroke: '#000', 'stroke-width': 10 });
const heroi9g = g({}, S9), heroi9 = L.vitoriosoCorpo(heroi9g);
const luz9 = el('circle', { cx: 540, cy: 1250, r: 600, fill: L.P.brilho, opacity: 0 }, S9);
const hudJ9 = H.hudJogo(S9), hud9 = H.relogioHUD(S9, { modo: 'jogo' }), sal9 = H.saldoHUD(S9, { rotulo: 'GANHO DA NOITE' });
const pix9 = H.pixels(S9, 5);

// ---------- S10 ferreiro Bram ----------
const S10 = cena([81, 88.9]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#3a2418'], [1, '#140a06']]) }, S10);
el('rect', { x: 60, y: 300, width: 400, height: 500, rx: 200, fill: '#1a0e08' }, S10);
const forja = L.fogo(S10, 260, 760, 0.8, 9);
el('path', { d: 'M640 1560 h300 l-40 70 h-80 v120 h80 v60 h-260 v-60 h80 v-120 h-80 Z', fill: '#3a3a44' }, S10);        // bigorna
el('rect', { y: 1800, width: 1080, height: 120, fill: '#0e0806' }, S10);
const bram10g = g({}, S10), bram10 = L.bram(bram10g);
const esc10 = g({}, S10); L.escudoTorre(esc10, { s: 0.7 });
const rot10 = g({ opacity: 0 }, S10); el('rect', { x: 600, y: 860, width: 420, height: 100, rx: 16, fill: 'rgba(0,0,0,0.7)', stroke: '#c8d0e0', 'stroke-width': 4 }, rot10); texto(rot10, 810, 928, 50, '#c8d0e0', 'ESCUDO DE FERRO');
const fag10 = H.poeira(S10, 30, 12, 'rgba(255,170,60,0.7)');
vinheta(S10, 0.6);
const hudJ10 = H.hudJogo(S10);
const S10b = cena([88.9, 91.5]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#3a2418'], [1, '#140a06']]) }, S10b);
const vit10g = g({}, S10b), vit10 = L.vitoriosoBusto(vit10g);
vinheta(S10b, 0.6);

// ---------- S11/S12 porão: ratos + plateia ----------
const S11 = cena([91.5, 98], [101.6, 124]);
const por = H.porao(S11);
const ratos = KILLS.map((k, i) => { const r = H.rato(g({}, S11), i); r.k = k; r.lado = i % 2 ? 1 : -1; return r; });
const olhos11 = g({}, S11), ol11 = [[200, 1380], [860, 1400], [520, 1330]].map(([x, y]) => { const gg = g({ transform: `translate(${x} ${y})` }, olhos11); for (const s of [-1, 1]) el('circle', { cx: s * 16, r: 9, fill: '#ff3030' }, gg); return gg; });
const heroi11g = g({}, S11), heroi11 = L.vitoriosoCorpo(heroi11g);
const flash11 = el('rect', { width: 1080, height: 1920, fill: '#ffe8a0', opacity: 0 }, S11);
const nums11 = H.numerosTempo(S11, '#3fd26a', '#0a3a1a');
const painel = g({ opacity: 0 }, S11);
el('rect', { x: 140, y: 420, width: 800, height: 220, rx: 24, fill: 'rgba(10,14,30,0.9)', stroke: '#5ef0d8', 'stroke-width': 6 }, painel);
texto(painel, 540, 510, 60, '#5ef0d8', 'PAINEL DA PLATEIA');
const painelN = texto(painel, 540, 600, 64, '#fff', '312 ESPECTADORES');
const plat = H.plateia(S11, [['joao_47', 'tanque de primeira viagem kkk'], ['mari.gamer', 'vai pra floresta!'], ['dudu_tank', 'fica na vila, noob'], ['lu_streams', 'segura o escudo!!'], ['ana.b', 'ele vai morrer kkkk'], ['rafa_09', 'deixa ele farmar']], 3);
vinheta(S11, 0.5);
const hudJ11 = H.hudJogo(S11), hud11 = H.relogioHUD(S11, { modo: 'jogo' }), sal11 = H.saldoHUD(S11, { rotulo: 'GANHO DA NOITE' });
const S11b = cena([98, 101.6]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#2a1a12'], [1, '#120a06']]) }, S11b);
const vit11g = g({}, S11b), vit11 = L.vitoriosoBusto(vit11g);
const big11 = texto(S11b, 540, 470, 170, '#3fd26a', '+R$ 5', { 'paint-order': 'stroke', stroke: '#0a3a1a', 'stroke-width': 14 });
const hud11b = H.relogioHUD(S11b, { modo: 'jogo' }), sal11b = H.saldoHUD(S11b, { rotulo: 'GANHO DA NOITE' });

// ---------- S13 acordar ----------
const S13 = cena([124, 131.3]);
el('rect', { width: 1080, height: 1920, fill: grad([[0, '#2a2a40'], [1, '#0e0e18']]) }, S13);
const desp13 = g({ transform: 'translate(260 520)' }, S13);
el('rect', { x: -170, y: -90, width: 340, height: 180, rx: 30, fill: '#1a1a1e' }, desp13);
texto(desp13, 0, 45, 120, '#e83a3a', '04:40');
const v13g = g({}, S13), v13 = H.vitorBusto(v13g, { macacao: false, curativo: true });
vinheta(S13, 0.6);
const cel13 = g({}, S13); el('rect', { width: 1080, height: 1920, fill: 'rgba(5,8,14,0.85)' }, cel13);
const ext13 = H.extrato(cel13, [[45, '9 RATOS GIGANTES'], [-9, 'TAXA DE SERVIÇO (20%)']], SALDO0, SALDO1, '56a 04m 12d · sem perdas');
const hud13 = H.relogioHUD(S13), sal13 = H.saldoHUD(S13);

// ---------- S14 contrato ----------
const S14 = cena([131.3, 139]);
const ctr = H.contrato(S14);
const ctrRed = el('rect', { width: 1080, height: 1920, fill: 'rgba(160,0,0,0)' }, S14);
vinheta(S14, 0.8);

// ---------- S15 votação ----------
const FIM = cena([139, 150.1]);
el('rect', { width: 1080, height: 1920, fill: '#000' }, FIM);
texto(FIM, 540, 560, 64, '#5ef0d8', 'HORAS EXTRAS · EP1');
texto(FIM, 540, 760, 92, '#fff', 'ELE LÊ O CONTRATO');
texto(FIM, 540, 870, 92, '#fff', 'INTEIRO ANTES DE');
texto(FIM, 540, 980, 92, '#ffd400', 'DORMIR DE NOVO?');
const opc = [['A) SIM', 1180, '#ffd400'], ['B) NÃO, ESTÁ CANSADO DEMAIS', 1340, '#fff']].map(([t, y, c]) => { const gg = g({}, FIM); el('rect', { x: 90, y: y - 90, width: 900, height: 120, rx: 22, fill: 'none', stroke: '#ffd400', 'stroke-width': 6 }, gg); texto(gg, 540, y, t.length > 10 ? 58 : 80, c, t); return gg; });
texto(FIM, 540, 1530, 60, '#b4b4b4', 'A PLATEIA DECIDE · COMENTA AÍ');
const hudF = H.relogioHUD(FIM), salF = H.saldoHUD(FIM);

// ---------- legendas ----------
const leg = L.legendas(L.svg, [
  [0.5, 2.6, [['ELE DORME PRA', 0], ['TRABALHAR.', 1]]], [2.7, 6.3, [['CADA MORTE CUSTA', 0], ['VIDA DE VERDADE.', 1]]],
  [10.8, 13.9, [['5 DA MANHÃ.', 1], ['ÔNIBUS LOTADO.', 0]]], [14.0, 17.3, [['9 HORAS', 1], ['ENROLANDO COBRE.', 0]]],
  [18.0, 20.8, [['HORA EXTRA', 1], ['DE NOVO, VITOR!', 0]]], [21.2, 23.3, [['TÔ DENTRO,', 0], ['SEU BRÁULIO.', 1]]],
  [25.6, 28.0, [['FILHO...', 0]]], [28.1, 30.8, [['NÃO DÁ PRA', 0], ['ESPERAR MUITO.', 1]]],
  [34.6, 37.2, [['NOVE ANOS', 1], ['DE HORA EXTRA...', 0]]],
  [38.0, 40.4, [['MORFEU LABS!', 1], ['JOGUE DORMINDO.', 0]]], [40.5, 44.4, [['VIRA DINHEIRO', 1], ['DE VERDADE.', 0]]],
  [45.4, 49.2, [['40 PÁGINAS.', 1], ['SEM LER NENHUMA.', 0]]],
  [52.5, 55.6, [['UM RELÓGIO NO', 0], ['CANTO DA VISÃO.', 1]]], [55.7, 58.0, [['56 ANOS.', 1]]], [58.1, 60.8, [['A VIDA QUE', 0], ['RESTAVA.', 1]]],
  [61.4, 64.0, [['O BRASA SUBIU', 0], ['NO PEITO DELE.', 1]]], [64.1, 67.0, [['DESPERTADOR:', 0], ['4:40.', 1]]], [67.3, 69.7, [['SÓ UMAS', 0], ['HORINHAS.', 1]]],
  [72.0, 75.4, [['BEM-VINDO A', 0], ['VARNOR.', 1]]], [75.7, 77.5, [['A QUE', 0], ['AGUENTA MAIS.', 1]]], [77.8, 80.4, [['CLASSE:', 0], ['TANQUE.', 1]]],
  [81.3, 84.9, [['O FERREIRO TINHA UM', 0], ['ROSTO CONHECIDO.', 1]]], [85.2, 88.8, [['UM ESCUDO', 0], ['DE FERRO.', 1]]], [89.0, 91.4, [['SEU...', 0], ['BRÁULIO?', 1]]],
  [92.0, 94.7, [['RATOS', 1], ['GIGANTES.', 0]]], [94.8, 97.9, [['R$ 5', 1], ['POR RATO.', 0]]], [98.2, 101.6, [['R$ 5...', 1], ['POR UM RATO?!', 0]]],
  [102.0, 104.4, [['CADA MONSTRO,', 0], ['CADA BAÚ...', 1]]], [104.5, 106.4, [['VIRA', 0], ['DINHEIRO.', 1]]], [106.5, 109.3, [['DEPÓSITO QUANDO', 0], ['ACORDAR.', 1]]],
  [110.5, 115.0, [['312', 1], ['ESPECTADORES.', 0]]], [115.5, 119.7, [['E A PLATEIA TINHA', 0], ['OPINIÃO.', 1]]],
  [124.5, 126.6, [['4:40.', 1], ['O CELULAR VIBROU.', 0]]], [126.7, 128.6, [['R$ 45', 1], ['NA CONTA.', 0]]], [128.7, 131.2, [['MAIS QUE 2', 0], ['HORAS EXTRAS.', 1]]], [131.5, 135.2, [['ELE NÃO LEU A', 0], ['CLÁUSULA 14.', 1]]],
]);

// =====================================================================
const busto = (gg, s, y = 0) => gg.setAttribute('transform', `translate(540 1920) scale(${s}) translate(-540 ${-1920 + y})`);
window.DUR = 150;
window.renderAt = (t) => {
  for (const c of cenas) c.style.display = c.rs.some(([a, b]) => t >= a && t < b) ? '' : 'none';
  // S1
  if (t < 6.8) {
    const u = t, hit = 3.5, d = t - hit;
    busto(v1g, 1 + 0.02 * u, 40 * Math.sin(u * 0.8));
    v1.set({ piscar: 1, expr: d > 0 && d < 1.5 ? 'triste' : 'neutro', boca: 0 });
    on1.forEach((c, i) => { const p = (u * 0.5 + i / 3) % 1; c.setAttribute('r', 260 + p * 300); c.setAttribute('opacity', 0.5 * (1 - p)); });
    red1.setAttribute('opacity', d > 0 ? 0.55 * Math.exp(-d * 2.5) : 0);
    S1.setAttribute('transform', d > 0 && d < 0.6 ? `translate(${16 * Math.sin(t * 90)} 0)` : '');
    hud1.set({ texto: d > 0 ? '55a 04m 12d' : '56a 04m 12d', show: ease(u / 0.5), deltaTxt: '-1 ANO', deltaK: d > 0 && d < 2.5 ? 1 : 0, falha: d > 0 && d < 0.8, cor2: d > 0 ? '#ff4040' : null });
    sal1.set({ valor: SALDO0, show: ease((u - 0.3) / 0.5) * (d > 0 && d < 2.5 ? 0 : 1) });
  }
  // S2
  if (t >= 6.8 && t < 10.5) { const u = t - 6.8, k = ease(u / 0.5); tit2.setAttribute('transform', `translate(540 960) scale(${0.85 + 0.15 * k + 0.01 * u}) translate(-540 -960)`); tit2.setAttribute('opacity', k); pont2.setAttribute('transform', `rotate(${u * 360})`); pont2b.setAttribute('transform', `rotate(${u * 30 - 90})`); dig2.setAttribute('transform', `translate(0 ${-u * 40})`); }
  // S3
  if (t >= 10.5 && t < 14) { const u = t - 10.5; bus.set(u); busto(v3g, 0.78, 12 * Math.sin(t * 13) * Math.sin(t * 3)); v3.set({ piscar: (Math.sin(u * 1.2) > 0.4) ? 1 : 0, expr: 'neutro' }); }
  // S4
  if (t >= 14 && t < 25) {
    const u = t - 14; fab.set(u); fabPoeira.set(t);
    const fala = t >= 18; fabDim.setAttribute('fill', `rgba(10,14,18,${fala ? 0.45 : 0})`);
    S4.querySelector('g').setAttribute('transform', fala ? '' : `translate(540 1100) scale(${1 + u * 0.03}) translate(-540 -1100)`);
    b4g.style.display = t >= 18 && t < 20.9 ? '' : 'none'; v4g.style.display = t >= 20.9 ? '' : 'none';
    busto(b4g, 0.92); b4.set({ boca: boca('B', t), expr: 'riso', piscar: pisca(t) });
    busto(v4g, 0.92); v4.set({ boca: boca('V', t), expr: 'neutro', piscar: pisca(t, 2) });
    turno4.style.display = t < 18 ? '' : 'none'; turnoTx.textContent = `TURNO: ${Math.min(9, Math.floor(u * 2.6))}h`;
  }
  // S5
  if (t >= 25 && t < 37.5) {
    const u = t - 25; hosp.set(u);
    mae.g.style.display = t < 31 ? '' : 'none'; mae.set({ boca: boca('M', t), expr: 'triste', piscar: pisca(t) });
    mae.g.setAttribute('transform', `translate(540 1200) scale(${1 + u * 0.015}) translate(-540 -1200)`);
    conta5.style.display = t >= 31 && t < 34.5 ? '' : 'none';
    conta5n.textContent = 'R$ ' + Math.round(38000 * ease((t - 31) / 1.6)).toLocaleString('pt-BR');
    conta5s.setAttribute('opacity', ease((t - 32.4) / 0.3)); conta5b.setAttribute('opacity', ease((t - 33.4) / 0.3));
    v5g.style.display = t >= 34.5 ? '' : 'none'; busto(v5g, 0.95 + 0.02 * (t - 34.5)); v5.set({ boca: boca('V', t), expr: 'triste', piscar: pisca(t) });
  }
  // S6
  if (t >= 37.5 && t < 45) { const u = t - 37.5; ponto.set(t); ponto.g.setAttribute('transform', `translate(540 900) scale(${1 + u * 0.03}) translate(-540 -900)`); chuva6.set(u); }
  // S7
  if (t >= 45 && t < 49.3) { const u = t - 45; clin.set(t); pag7.textContent = `PÁG. ${Math.min(40, 1 + Math.floor(u * 11))}/40`; ass7.set((u - 3.2) / 0.8); }
  if (t >= 49.3 && t < 52.3) { const u = t - 49.3; cerebro.forEach((c, i) => c.set((u - i * 0.25) / 0.8)); neu.forEach((n) => n.e.setAttribute('opacity', u > 0.9 ? 0.5 + 0.5 * Math.sin(t * 12 + n.ph) : 0)); const s = ease((u - 1.0) / 0.3); rot7a.setAttribute('opacity', s); rot7b.setAttribute('opacity', s); }
  if (t >= 52.3 && t < 61) {
    const u = t - 52.3; branco7.setAttribute('opacity', 1 - ease(u / 1.2)); busto(v7g, 1.05 - 0.01 * u);
    v7.set({ piscar: u < 1.4 ? 1 : pisca(t), expr: u > 3 ? 'surpreso' : 'neutro', olharX: u > 3 ? 0.6 : 0 });
    const k = ease((u - 2.4) / 0.4); hud7.set({ texto: u < 2.9 ? '00a 00m 00d' : '56a 04m 12d', show: k, falha: u > 2.4 && u < 3.2 });
    seta7.setAttribute('opacity', u > 3.2 && u < 6 ? 1 : 0);
  }
  // S8
  if (t >= 61 && t < 71.5) {
    const u = t - 61; quarto.set(u, '21:47');
    f8.set({ piscar: t > 69.7 ? 1 : pisca(t), boca: boca('V', t), expr: 'neutro' });
    const k = ease((u - 0.5) / 1.6); gato8g.setAttribute('transform', `translate(${960 - 300 * k} ${1720 - 200 * Math.sin(k * Math.PI) - 120 * k}) scale(0.85 ${0.9 + 0.02 * Math.sin(t * 2)})`); gato8.set({ t });
    zz.forEach((z, i) => { const p = (t * 0.4 + i / 3) % 1; z.setAttribute('x', 640 + p * 140); z.setAttribute('y', 1150 - p * 260); z.setAttribute('opacity', t > 69 ? Math.sin(p * Math.PI) : 0); });
    hud8.set({ texto: '56a 04m 12d', show: 0.85 });
    pix8.set(rel(t, 69.8, 71.5));
  }
  // S9
  if (t >= 71.5 && t < 81) {
    const u = t - 71.5; campo.set(t); pix9.set(1 - rel(t, 71.5, 72.6));
    const show = t < 77.8; cls9.style.display = show ? '' : 'none';
    cards.forEach((c) => { const k = ease((t - 72.4 - c.i * 0.25) / 0.4), sel = c.i === 1 && t > 75.7; c.c.style.display = show ? '' : 'none'; c.c.setAttribute('transform', `translate(${210 + c.i * 330} ${1000 + 60 * (1 - k)}) scale(${(sel ? 1.15 : 1) * (0.8 + 0.2 * k)})`); c.c.setAttribute('opacity', sel || t < 75.7 ? k : 0.35); c.borda.setAttribute('stroke', sel ? '#ffd400' : '#c8d0e0'); c.borda.setAttribute('stroke-width', sel ? 10 : 5); });
    const h = ease((t - 77.8) / 0.6); heroi9g.style.display = t >= 77.8 ? '' : 'none';
    heroi9g.setAttribute('transform', `translate(540 1830) scale(${0.95 * h})`); heroi9.set({ expr: 'serio', piscar: pisca(t) });
    luz9.setAttribute('opacity', t >= 77.8 ? 0.9 * Math.exp(-(t - 77.8) * 2) : 0);
    hudJ9.g.setAttribute('opacity', ease((t - 78) / 0.5)); hudJ9.set({});
    hud9.set({ texto: '56a 04m 12d', show: ease((t - 78) / 0.5) }); sal9.set({ valor: 0, show: ease((t - 78.3) / 0.5) });
  }
  // S10
  if (t >= 81 && t < 88.9) {
    const u = t - 81; forja.set(t); fag10.set(t);
    bram10g.setAttribute('transform', `translate(340 1840) scale(${0.95 + 0.01 * u})`); bram10.set({ boca: boca('B', t), expr: t > 85 ? 'riso' : 'neutro', piscar: pisca(t) });
    const k = ease((t - 86.6) / 0.8); esc10.setAttribute('transform', `translate(${560 + 260 * k} ${1250 - 140 * Math.sin(k * Math.PI)}) rotate(${-20 + 20 * k})`); esc10.style.display = t > 86.2 ? '' : 'none';
    rot10.setAttribute('opacity', ease((t - 87.4) / 0.3)); hudJ10.set({});
  }
  if (t >= 88.9 && t < 91.5) { const u = t - 88.9; busto(vit10g, 1.02 + 0.02 * u); vit10.set({ expr: 'surpreso', boca: boca('V', t), piscar: pisca(t) }); }
  // S11 / S12
  if (t >= 91.5 && t < 124 && !(t >= 98 && t < 101.6)) {
    por.set(t);
    const zoom = t < 98 ? 1.0 + 0.02 * (t - 91.5) : 1;
    S11.querySelector('g').setAttribute('transform', `translate(540 1200) scale(${zoom}) translate(-540 -1200)`);
    let crava = 0;
    ratos.forEach((r) => {
      const d = t - r.k, ini = r.k - 1.3, k = ease((t - ini) / 1.3), x = 540 + r.lado * (700 - 430 * k);
      r.g.style.display = t > ini && d < 1.2 ? '' : 'none'; r.g.setAttribute('opacity', d > 0 ? clamp(1 - (d - 0.6) / 0.6) : 1);
      r.g.setAttribute('transform', `translate(${x} ${1780}) scale(${-r.lado * 1.5} 1.5)`); r.set({ t, morto: d > 0 });
      if (d > -0.15 && d < 0.35) crava = Math.max(crava, d < 0 ? 1 + d / 0.15 : 1 - d / 0.35);
    });
    ol11.forEach((o, i) => o.setAttribute('opacity', t < 96 && Math.sin(t * 2 + i * 2) > -0.7 ? 1 : 0));
    heroi11g.setAttribute('transform', 'translate(540 1800) scale(0.9)'); heroi11.set({ crava: ease(crava), expr: t > 110 ? 'serio' : 'bravo', piscar: pisca(t) });
    const ult = KILLS.filter((k) => t >= k).pop(), dk = ult ? t - ult : 9;
    flash11.setAttribute('opacity', dk < 0.3 ? 0.35 * (1 - dk / 0.3) : 0);
    S11.setAttribute('transform', dk < 0.25 ? `translate(${10 * Math.sin(t * 95)} ${8 * Math.cos(t * 80)})` : '');
    nums11.set(t, KILLS.map((k, i) => [k, 540 + (i % 2 ? 1 : -1) * 260, 1350, '+R$ 5']));
    const viewers = t < 110.5 ? 0 : Math.round(312 + Math.max(0, t - 115) * 23);
    painel.setAttribute('opacity', t > 110.5 && t < 115.2 ? ease((t - 110.5) / 0.3) : 0); painelN.textContent = '312 ESPECTADORES';
    plat.g.style.display = t > 114.6 ? '' : 'none'; plat.set(t - 115, viewers);
    const nivel = minGanhos(t) >= 120 ? 2 : 1;
    hudJ11.set({ nivel, hp: 1 - 0.04 * KILLS.filter((k) => t >= k).length, fadiga: 0.15 + 0.03 * KILLS.filter((k) => t >= k).length });
    const g0 = ult ? Math.max(0, 1 - dk / 1.2) : 0;
    hud11.set({ texto: '56a 04m 12d', show: 1 }); sal11.set({ valor: ganhoNoite(t), show: 1, deltaTxt: '+R$ 5', deltaK: g0 });
  }
  if (t >= 98 && t < 101.6) { const u = t - 98; busto(vit11g, 1.02 + 0.015 * u); vit11.set({ expr: 'riso', boca: boca('V', t), piscar: pisca(t) }); big11.setAttribute('transform', `translate(540 420) scale(${1 + 0.1 * Math.sin(t * 6)}) translate(-540 -420)`); hud11b.set({ texto: '56a 04m 12d', show: 1 }); sal11b.set({ valor: ganhoNoite(t), show: 1 }); }
  // S13
  if (t >= 124 && t < 131.3) {
    const u = t - 124; desp13.setAttribute('transform', `translate(${260 + (u < 1.5 ? 8 * Math.sin(t * 70) : 0)} 520)`);
    busto(v13g, 0.95 + 0.01 * u); v13.set({ piscar: u < 0.8 ? 1 : pisca(t), expr: u > 2.5 ? 'riso' : 'neutro' });
    cel13.style.display = t >= 126.4 ? '' : 'none'; const ke = rel(t, 126.6, 130.4); ext13.set(ke);
    ext13.g.setAttribute('transform', `translate(540 ${980 + 900 * (1 - ease((t - 126.4) / 0.4))})`);
    hud13.set({ texto: '56a 04m 12d', show: 1 }); const kd = ease(rel(t, 129.4, 130.4)); sal13.set({ valor: SALDO0 + (SALDO1 - SALDO0) * kd, show: 1, deltaTxt: '+R$ 36,00', deltaK: t > 129.4 ? 1 : 0 });
  }
  // S14
  if (t >= 131.3 && t < 139) {
    const u = t - 131.3, z = 1 + 0.25 * ease(u / 6);
    ctr.g.setAttribute('transform', `translate(540 860) scale(${z}) translate(-540 -860)`); ctr.set((u - 2.2) / 0.8);
    ctrRed.setAttribute('fill', `rgba(160,0,0,${0.25 * ease((u - 4) / 1.5) * (0.7 + 0.3 * Math.sin(t * 5))})`);
  }
  // FIM
  if (t >= 139) { opc.forEach((o, i) => o.setAttribute('opacity', ease((t - 140 - i * 0.4) / 0.4))); hudF.set({ texto: '56a 04m 12d', show: 1 }); salF.set({ valor: SALDO1, show: 1 }); }
  leg.set(t);
  return true;
};
L.pronto();

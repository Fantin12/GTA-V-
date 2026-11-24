// Prancha do elenco 2D: t<1 heróis; 1<=t<2 vilões e criaturas; 2<=t<3 expressões do Vitorioso.
import * as L from './lib.js';
const { el, g } = L;
const A = g(), B = g(), C = g();
for (const [grp, cor] of [[A, '#1c2a3a'], [B, '#20141a'], [C, '#1a2430']]) el('rect', { width: 1080, height: 1920, fill: cor }, grp);
const t1 = el('text', { x: 540, y: 200, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 110, fill: '#ffd400' }, A); t1.textContent = 'OS DO PORTÃO';
const t2 = el('text', { x: 540, y: 200, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 110, fill: '#ff5040' }, B); t2.textContent = 'INIMIGOS';
const t3 = el('text', { x: 540, y: 200, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 110, fill: '#ffd400' }, C); t3.textContent = 'EXPRESSÕES';
const vit = L.vitoriosoCorpo(g({ transform: 'translate(540 1700) scale(1.0)' }, A));
const lir = L.lira(g({ transform: 'translate(220 1650) scale(0.78)' }, A));
const bra = L.bram(g({ transform: 'translate(870 1660) scale(0.8)' }, A));
const cat = L.brasa(g({ transform: 'translate(760 1720) scale(0.6)' }, A));
const dra = L.draven(g({ transform: 'translate(330 1650) scale(0.9)' }, B));
const cr1 = L.criatura(g({ transform: 'translate(780 1650) scale(1.1)' }, B), 1);
const cr2 = L.criatura(g({ transform: 'translate(890 1780) scale(0.8)' }, B), 2);
const crv = L.corvo(g({ transform: 'translate(760 900) scale(1.2)' }, B));
const exprs = ['serio', 'bravo', 'riso', 'surpreso', 'triste', 'neutro'];
const faces = exprs.map((e, i) => { const f = L.rosto(g({ transform: `translate(${220 + (i % 2) * 640} ${520 + Math.floor(i / 2) * 520}) scale(0.62)` }, C), { pele: ['#e8a676', '#cf8656', '#b56f45'], cabelo: '#2a1a10', olhos: '#3a78c0', estilo: 'cachos', barba: 'rala', cicatriz: true });
  const tx = el('text', { x: 220 + (i % 2) * 640, y: 820 + Math.floor(i / 2) * 520, 'text-anchor': 'middle', 'font-family': 'Anton', 'font-size': 50, fill: '#fff' }, C); tx.textContent = e.toUpperCase(); return [f, e]; });
window.DUR = 3;
window.renderAt = (t) => {
  A.style.display = t < 1 ? '' : 'none'; B.style.display = t >= 1 && t < 2 ? '' : 'none'; C.style.display = t >= 2 ? '' : 'none';
  vit.set({ expr: 'serio' }); lir.set({ expr: 'riso' }); bra.set({ expr: 'neutro' }); dra.set({ expr: 'bravo' }); cat.set({ t });
  cr1.set({ t }); cr2.set({ t });
  faces.forEach(([f, e]) => f.set({ expr: e, boca: e === 'riso' ? 0.6 : e === 'bravo' ? 0.4 : 0 }));
  return true;
};
L.pronto();

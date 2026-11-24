// Elenco MMO de A Coroa de Varnor (todos originais): Draven + cavalo, Lira, Bram, orc de brasa, lobo cinzento.
import * as THREE from 'three';
import { mat, mesh, B, rand } from './personagens.js';

const ico = (r, d = 0) => new THREE.IcosahedronGeometry(r, d);
const glow = (r, g, b) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b) }); // HDR -> bloom

// cabeça humana genérica (rosto com olhos, sobrancelhas, nariz, boca)
function humanHead(parent, { skin, hairC, eye = 0x3a3a3a, y = 0.93, browAng = -0.2 }) {
  const head = new THREE.Group(); head.position.y = y; parent.add(head);
  const sk = mat(skin), hr = mat(hairC);
  mesh(B(0.19, 0.14, 0.19), sk, 0, -0.08, 0, head);
  mesh(ico(0.26, 2), sk, 0, 0.2, 0, head).scale.set(0.98, 1.08, 0.95);
  for (const s of [-1, 1]) {
    mesh(B(0.07, 0.045, 0.02), mat(0xf4efe8), s * 0.09, 0.24, 0.235, head);
    mesh(B(0.035, 0.04, 0.02), mat(eye, { roughness: 0.2 }), s * 0.09, 0.24, 0.245, head);
    mesh(B(0.11, 0.035, 0.035), hr, s * 0.09, 0.31, 0.235, head).rotation.z = s * browAng;
    mesh(ico(0.055), sk, s * 0.26, 0.2, 0, head);
  }
  mesh(B(0.06, 0.12, 0.08), sk, 0, 0.19, 0.255, head);
  mesh(B(0.1, 0.02, 0.02), mat(0x6a2a2a), 0, 0.08, 0.245, head);
  return { head, sk, hr };
}

// ---------------- LORDE DRAVEN (Corvos de Pedravale) ----------------
export function makeDraven({ mounted = false } = {}) {
  const black = mat(0x16171c, { metalness: 0.7, roughness: 0.35 }), silver = mat(0xb8bcc8, { metalness: 0.9, roughness: 0.25 });
  const fur = mat(0x4a4648), capeM = mat(0x0c0c10, { side: THREE.DoubleSide });
  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 1.0; g.add(hips);
  for (const s of [-1, 1]) {
    const l = new THREE.Group(); l.position.x = s * (mounted ? 0.42 : 0.16); if (mounted) { l.rotation.x = -1.2; l.rotation.z = s * 0.25; } hips.add(l);
    mesh(B(0.22, 0.55, 0.24), black, 0, -0.28, 0, l); mesh(B(0.24, 0.45, 0.26), black, 0, -0.72, 0, l);
    mesh(B(0.25, 0.05, 0.27), silver, 0, -0.5, 0, l); mesh(B(0.26, 0.1, 0.34), black, 0, -0.95, 0.04, l);
  }
  const torso = new THREE.Group(); hips.add(torso);
  mesh(B(0.66, 0.66, 0.4), black, 0, 0.45, 0, torso);
  mesh(B(0.68, 0.05, 0.42), silver, 0, 0.14, 0, torso); mesh(B(0.04, 0.55, 0.05), silver, 0, 0.45, 0.2, torso);
  // corvo prateado no peito
  for (const sd of [-1, 1]) { const w = mesh(B(0.17, 0.045, 0.03), silver, sd * 0.08, 0.56, 0.215, torso); w.rotation.z = sd * 0.45; } // asas abertas
  mesh(ico(0.035), silver, 0, 0.52, 0.22, torso); mesh(new THREE.ConeGeometry(0.02, 0.06, 3), silver, 0, 0.47, 0.22, torso).rotation.x = Math.PI; // corpo e cauda
  for (const s of [-1, 1]) {
    const p = mesh(ico(0.24), black, s * 0.44, 0.74, 0, torso); p.scale.set(1.1, 0.7, 1.1);
    for (let k = 0; k < 3; k++) mesh(new THREE.ConeGeometry(0.035, 0.16, 4), silver, s * (0.36 + k * 0.08), 0.88, 0, torso); // espinhos
    const arm = new THREE.Group(); arm.position.set(s * 0.44, 0.66, 0); arm.rotation.z = s * 0.08; torso.add(arm);
    mesh(B(0.19, 0.7, 0.21), black, 0, -0.38, 0, arm); mesh(B(0.2, 0.05, 0.22), silver, 0, -0.45, 0, arm);
    mesh(B(0.16, 0.14, 0.16), black, 0, -0.78, 0, arm);
  }
  for (let i = 0; i < 12; i++) mesh(ico(0.1), fur, Math.cos(i / 12 * Math.PI * 2) * 0.3, 0.8, Math.sin(i / 12 * Math.PI * 2) * 0.2, torso); // gola de pele
  const cape = new THREE.PlaneGeometry(1.0, 1.75, 2, 4); cape.translate(0, -0.87, 0);
  const cm = mesh(cape, capeM, 0, 0.82, -0.24, torso); cm.rotation.x = 0.1;
  const { head } = humanHead(torso, { skin: 0xd9c4b4, hairC: 0x0e0e12, eye: 0x9aa0a8, browAng: 0.25 });
  mesh(ico(0.27, 1), mat(0x0e0e12), 0, 0.3, -0.05, head).scale.set(1.02, 0.7, 1.0);  // cabelo penteado pra trás
  mesh(B(0.1, 0.1, 0.06), mat(0x0e0e12), 0, 0.0, 0.22, head);                      // cavanhaque
  mesh(new THREE.TorusGeometry(0.255, 0.018, 4, 12), silver, 0, 0.35, 0, head).rotation.x = Math.PI / 2; // diadema
  // espada longa na cintura
  mesh(B(0.05, 0.9, 0.04), silver, -0.36, -0.35, 0.12, torso).rotation.z = 0.15;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t) { torso.position.y = Math.sin(t * 1.8) * 0.01; head.rotation.y = 0.15 * Math.sin(t * 0.5); cm.rotation.x = 0.1 + 0.04 * Math.sin(t * 2.2); } };
}

// ---------------- CAVALO DE GUERRA ----------------
export function makeHorse() {
  const coat = mat(0x3a2a22), barding = mat(0x1c1c26), silver = mat(0xb8bcc8, { metalness: 0.9, roughness: 0.25 }), mane = mat(0x050505);
  const g = new THREE.Group();
  const body = mesh(B(0.75, 0.75, 1.8), coat, 0, 1.45, 0, g);
  mesh(B(0.8, 0.5, 1.7), barding, 0, 1.25, 0, g);                       // manta
  mesh(B(0.82, 0.08, 1.72), silver, 0, 1.0, 0, g);
  const neck = new THREE.Group(); neck.position.set(0, 1.65, 0.8); neck.rotation.x = 0.55; g.add(neck);
  mesh(B(0.42, 0.9, 0.5), coat, 0, 0.4, 0, neck);
  for (let i = 0; i < 6; i++) mesh(B(0.08, 0.14, 0.12), mane, 0, 0.1 + i * 0.14, -0.26, neck);
  const head = new THREE.Group(); head.position.set(0, 0.85, 0.0); head.rotation.x = 1.35; neck.add(head);
  mesh(B(0.34, 0.75, 0.38), coat, 0, 0.3, 0, head);
  mesh(B(0.36, 0.3, 0.4), silver, 0, 0.1, 0.02, head);                  // chanfro de aço
  for (const s of [-1, 1]) {
    mesh(new THREE.ConeGeometry(0.06, 0.18, 4), coat, s * 0.12, -0.12, -0.05, head).rotation.x = Math.PI;
    mesh(ico(0.035), glow(0.6, 0.6, 0.7), s * 0.18, 0.25, 0.1, head);
  }
  const legs = [];
  for (const [x, z] of [[-0.25, 0.7], [0.25, 0.7], [-0.25, -0.7], [0.25, -0.7]]) {
    const l = new THREE.Group(); l.position.set(x, 1.15, z); g.add(l);
    mesh(B(0.18, 0.6, 0.22), coat, 0, -0.3, 0, l); mesh(B(0.14, 0.5, 0.16), coat, 0, -0.82, 0, l);
    mesh(B(0.18, 0.12, 0.2), mat(0x2a2a2a), 0, -1.08, 0.01, l); legs.push(l);
  }
  const tail = mesh(B(0.12, 0.8, 0.12), mane, 0, 1.3, -0.95, g); tail.rotation.x = 0.4;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t, walk = 0) {
    body.position.y = 1.45 + Math.sin(t * 1.5) * 0.01 + walk * 0.03 * Math.abs(Math.sin(t * 5));
    neck.rotation.x = 0.55 + 0.05 * Math.sin(t * 0.8) + walk * 0.06 * Math.sin(t * 5);
    tail.rotation.z = 0.15 * Math.sin(t * 2);
    legs.forEach((l, i) => { l.rotation.x = walk * 0.45 * Math.sin(t * 5 + [0, Math.PI, Math.PI, 0][i]); });
  } };
}

// ---------------- LIRA (curandeira) ----------------
export function makeLira() {
  const robe = mat(0xe8e4d8), green = mat(0x3f7a4a), wood = mat(0x6a4a2a), hairC = 0x6a3a1e;
  const g = new THREE.Group();
  const skirt = mesh(new THREE.CylinderGeometry(0.22, 0.42, 1.0, 8), robe, 0, 0.5, 0, g);
  mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.08, 8), green, 0, 0.05, 0, g);
  const torso = new THREE.Group(); torso.position.y = 0.95; g.add(torso);
  mesh(B(0.48, 0.55, 0.3), robe, 0, 0.25, 0, torso); mesh(B(0.5, 0.08, 0.32), green, 0, 0.02, 0, torso);
  mesh(B(0.12, 0.5, 0.04), green, 0, 0.28, 0.16, torso);
  const { head } = humanHead(torso, { skin: 0xeab89a, hairC, eye: 0x3a6a3a, y: 0.72, browAng: -0.1 });
  head.scale.setScalar(0.92);
  mesh(ico(0.28, 1), mat(hairC), 0, 0.33, -0.08, head).scale.set(1.03, 0.72, 0.98);
  for (const sd of [-1, 1]) mesh(B(0.08, 0.42, 0.2), mat(hairC), sd * 0.25, 0.12, -0.1, head);  // mechas laterais
  const hairBack = mesh(B(0.44, 0.55, 0.12), mat(hairC), 0, 0.05, -0.24, head);                  // cabelo longo
  mesh(B(0.5, 0.12, 0.3), green, 0, -0.16, -0.1, head);                      // gola do manto (capuz abaixado)
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.3, 0.45, 0); torso.add(a);
    mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.55, 6), robe, 0, -0.27, 0, a); mesh(ico(0.06), mat(0xeab89a), 0, -0.58, 0, a); arms.push(a);
  }
  const staff = new THREE.Group(); staff.position.set(0.05, -0.58, 0.05); arms[1].add(staff);
  mesh(B(0.05, 1.7, 0.05), wood, 0, 0.3, 0, staff);
  const crystal = mesh(new THREE.OctahedronGeometry(0.1, 0), glow(0.6, 2.6, 1.0), 0, 1.25, 0, staff);
  arms[1].rotation.x = -0.35; arms[1].rotation.z = -0.1; arms[0].rotation.z = 0.15;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t) { torso.position.y = 0.95 + Math.sin(t * 2) * 0.01; crystal.rotation.y = t * 1.5; crystal.scale.setScalar(1 + 0.1 * Math.sin(t * 4)); } };
}

// ---------------- BRAM (ferreiro) ----------------
export function makeBram() {
  const shirt = mat(0x7a6a58), apron = mat(0x4a2e1c), skin = 0xd89a7a, beardC = 0xdedad2;
  const g = new THREE.Group(); g.scale.setScalar(0.95);
  const hips = new THREE.Group(); hips.position.y = 0.85; g.add(hips);
  for (const s of [-1, 1]) { const l = new THREE.Group(); l.position.x = s * 0.17; hips.add(l); mesh(B(0.22, 0.75, 0.24), mat(0x3a3028), 0, -0.4, 0, l); mesh(B(0.26, 0.12, 0.34), apron, 0, -0.8, 0.04, l); }
  const torso = new THREE.Group(); hips.add(torso);
  mesh(B(0.75, 0.7, 0.48), shirt, 0, 0.4, 0, torso).scale.set(1, 1, 1);
  mesh(ico(0.36, 1), shirt, 0, 0.15, 0.08, torso).scale.set(1.1, 0.8, 0.9);   // barriga
  mesh(B(0.62, 0.95, 0.06), apron, 0, 0.12, 0.3, torso);                  // avental
  const { head } = humanHead(torso, { skin, hairC: beardC, eye: 0x4a4a6a, y: 0.92, browAng: -0.35 });
  mesh(ico(0.2, 1), mat(beardC), 0, -0.02, 0.15, head).scale.set(1.25, 1.2, 0.8);   // barba branca cheia
  mesh(ico(0.12, 1), mat(beardC), 0, -0.2, 0.17, head).scale.set(1.2, 1.3, 0.7);
  for (const s of [-1, 1]) mesh(B(0.13, 0.05, 0.05), mat(beardC), s * 0.06, 0.12, 0.25, head).rotation.z = s * -0.3; // bigode
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.48, 0.65, 0); torso.add(a);
    mesh(B(0.22, 0.4, 0.22), shirt, 0, -0.2, 0, a); mesh(B(0.21, 0.36, 0.21), mat(skin), 0, -0.55, 0, a); mesh(B(0.18, 0.15, 0.18), mat(skin), 0, -0.78, 0, a); arms.push(a);
  }
  const hammer = new THREE.Group(); hammer.position.set(0, -0.8, 0.05); arms[1].add(hammer);
  mesh(B(0.05, 0.6, 0.05), mat(0x6a4a2a), 0, 0.1, 0, hammer); mesh(B(0.28, 0.14, 0.14), mat(0x3a3a40, { metalness: 0.7 }), 0, 0.4, 0, hammer);
  arms[1].rotation.x = -0.3;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t) { torso.position.y = Math.sin(t * 1.6) * 0.012; head.rotation.y = 0.2 * Math.sin(t * 0.6); } };
}

// ---------------- ORC DE BRASA ----------------
export function makeOrc() {
  const skin = mat(0x5a6a3a), skinDk = mat(0x48562e), leather = mat(0x3a2418), iron = mat(0x3a3a40, { metalness: 0.6 }), paint = mat(0x9a1a10), bone = mat(0xe6dcc0), hairM = mat(0x111111);
  const g = new THREE.Group(); g.scale.setScalar(1.15);
  const hips = new THREE.Group(); hips.position.y = 0.85; g.add(hips);
  const legs = [];
  for (const s of [-1, 1]) { const l = new THREE.Group(); l.position.x = s * 0.2; hips.add(l); mesh(B(0.27, 0.45, 0.28), leather, 0, -0.22, 0, l); mesh(B(0.24, 0.42, 0.25), skin, 0, -0.6, 0, l); mesh(B(0.3, 0.12, 0.38), leather, 0, -0.82, 0.05, l); legs.push(l); }
  const torso = new THREE.Group(); hips.add(torso);
  mesh(ico(0.52, 1), skin, 0, 0.5, 0, torso).scale.set(1.25, 1.0, 0.85);  // tronco largo
  mesh(B(0.12, 0.8, 0.06), leather, -0.15, 0.5, 0.36, torso).rotation.z = 0.5;   // alça
  for (let i = 0; i < 3; i++) mesh(B(0.3, 0.04, 0.02), paint, 0.2, 0.55 - i * 0.1, 0.42, torso);  // pintura de guerra
  mesh(B(0.75, 0.18, 0.5), leather, 0, 0.05, 0, torso);
  for (let i = 0; i < 5; i++) mesh(new THREE.ConeGeometry(0.03, 0.1, 4), bone, -0.2 + i * 0.1, 0.82, 0.33, torso).rotation.x = Math.PI; // colar de presas
  const sp = mesh(ico(0.25), iron, -0.6, 0.85, 0, torso); sp.scale.set(1, 0.7, 1);       // ombreira com espinhos
  for (let k = 0; k < 4; k++) mesh(new THREE.ConeGeometry(0.04, 0.22, 4), bone, -0.5 - k * 0.07, 1.02, (k - 1.5) * 0.08, torso);
  const head = new THREE.Group(); head.position.set(0, 1.05, 0.12); torso.add(head);
  mesh(ico(0.26, 1), skin, 0, 0.12, 0, head).scale.set(1.05, 0.95, 1);
  mesh(B(0.42, 0.18, 0.3), skinDk, 0, -0.04, 0.08, head);               // mandíbula
  for (const s of [-1, 1]) {
    mesh(new THREE.ConeGeometry(0.035, 0.16, 4), bone, s * 0.13, 0.08, 0.22, head);       // presas
    mesh(ico(0.03), glow(3, 1.6, 0.2), s * 0.09, 0.2, 0.22, head);                          // olhos âmbar
    mesh(B(0.12, 0.04, 0.04), skinDk, s * 0.09, 0.26, 0.21, head).rotation.z = s * 0.35;
    mesh(new THREE.ConeGeometry(0.06, 0.2, 4), skin, s * 0.27, 0.15, 0, head).rotation.z = s * -1.2; // orelhas pontudas
  }
  for (let i = 0; i < 6; i++) mesh(B(0.06, 0.12, 0.06), hairM, 0, 0.36, 0.12 - i * 0.07, head);     // moicano
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.6, 0.75, 0); torso.add(a);
    mesh(B(0.26, 0.42, 0.26), skin, 0, -0.22, 0, a); mesh(B(0.24, 0.4, 0.24), skin, 0, -0.62, 0, a);
    mesh(B(0.27, 0.16, 0.27), leather, 0, -0.55, 0, a); mesh(B(0.22, 0.18, 0.22), skinDk, 0, -0.88, 0, a); arms.push(a);
  }
  const axe = new THREE.Group(); axe.position.set(0, -0.9, 0.05); arms[1].add(axe);
  mesh(B(0.06, 1.1, 0.06), mat(0x4a3020), 0, 0.2, 0, axe);
  const blade = mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 6, 1, false, 0, Math.PI), iron, 0.0, 0.62, 0, axe); blade.rotation.z = Math.PI / 2;
  arms[1].rotation.x = -0.5; arms[0].rotation.z = 0.2;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t) { torso.position.y = Math.sin(t * 2.4) * 0.02; torso.rotation.x = 0.12; head.rotation.y = 0.25 * Math.sin(t * 0.9); } };
}

// ---------------- LOBO CINZENTO ----------------
export function makeWolf(seed = 3) {
  const R = rand(seed);
  const fur = mat(0x5a5a62), furDk = mat(0x34343c), furLt = mat(0x8a8a90), teeth = mat(0xf0ead8);
  const g = new THREE.Group();
  const body = new THREE.Group(); body.position.y = 0.75; g.add(body);
  mesh(ico(0.38, 1), fur, 0, 0.05, 0.25, body).scale.set(0.95, 1.0, 1.1);     // peito (ombros altos)
  mesh(ico(0.32, 1), furDk, 0, -0.02, -0.35, body).scale.set(0.85, 0.85, 1.3); // traseiro
  for (let i = 0; i < 7; i++) mesh(new THREE.ConeGeometry(0.06, 0.22, 4), furDk, 0, 0.38 - i * 0.03, 0.35 - i * 0.12, body).rotation.x = -0.5; // pelo eriçado
  mesh(ico(0.2), furLt, 0, -0.15, 0.48, body);                               // pelagem clara do peito
  const head = new THREE.Group(); head.position.set(0, 0.22, 0.65); body.add(head);
  mesh(ico(0.2, 1), fur, 0, 0, 0, head).scale.set(1, 0.9, 1);
  mesh(B(0.18, 0.14, 0.28), fur, 0, -0.04, 0.2, head);                       // focinho
  mesh(B(0.07, 0.05, 0.05), mat(0x111111), 0, 0.0, 0.34, head);              // nariz
  const jaw = mesh(B(0.14, 0.05, 0.22), furDk, 0, -0.13, 0.18, head);
  for (const s of [-1, 1]) {
    mesh(new THREE.ConeGeometry(0.07, 0.18, 4), furDk, s * 0.11, 0.2, -0.02, head);   // orelhas
    mesh(ico(0.035), glow(4, 0.35, 0.2), s * 0.08, 0.07, 0.15, head);                  // olhos vermelhos
    for (let k = 0; k < 2; k++) mesh(new THREE.ConeGeometry(0.015, 0.05, 3), teeth, s * (0.03 + k * 0.04), -0.1, 0.27 - k * 0.05, head).rotation.x = Math.PI; // dentes
  }
  const legs = [];
  for (const [x, z] of [[-0.16, 0.3], [0.16, 0.3], [-0.15, -0.4], [0.15, -0.4]]) {
    const l = new THREE.Group(); l.position.set(x, 0.65, z); g.add(l);
    mesh(B(0.12, 0.38, 0.14), fur, 0, -0.18, 0, l); mesh(B(0.09, 0.32, 0.1), furDk, 0, -0.48, 0, l); mesh(B(0.12, 0.06, 0.15), furDk, 0, -0.63, 0.02, l); legs.push(l);
  }
  const tail = new THREE.Group(); tail.position.set(0, 0.85, -0.7); g.add(tail);
  mesh(B(0.12, 0.12, 0.5), fur, 0, 0, -0.22, tail); mesh(B(0.1, 0.1, 0.2), furLt, 0, 0, -0.5, tail); tail.rotation.x = 0.5;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t, walk = 0) {
    const f = 8 * walk;
    legs.forEach((l, i) => { l.rotation.x = walk * 0.6 * Math.sin(t * 8 + (i === 0 || i === 3 ? 0 : Math.PI)); });
    body.position.y = 0.75 + Math.sin(t * 2.5) * 0.015 + walk * 0.04 * Math.abs(Math.sin(t * 8));
    jaw.rotation.x = 0.25 + 0.15 * Math.sin(t * 3);  // rosnando
    head.rotation.x = 0.15; tail.rotation.y = 0.2 * Math.sin(t * 2);
  } };
}

// ---------------- ELFO DE CINZA (encapuzado, misterioso) ----------------
export function makeElfoCinza() {
  const robe = mat(0x2a2236), robeDk = mat(0x1a1424), skin = mat(0x8a96a8), parch = mat(0xd8c8a0);
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.2, 0.45, 1.15, 8), robe, 0, 0.58, 0, g);
  const torso = new THREE.Group(); torso.position.y = 1.1; g.add(torso);
  mesh(B(0.46, 0.5, 0.3), robe, 0, 0.2, 0, torso);
  const hood = mesh(ico(0.3, 1), robeDk, 0, 0.62, -0.02, torso); hood.scale.set(1, 1.15, 1.05);
  mesh(new THREE.ConeGeometry(0.12, 0.3, 6), robeDk, 0, 0.88, -0.12, torso).rotation.x = -0.6;  // ponta do capuz
  mesh(ico(0.2, 1), mat(0x050508), 0, 0.58, 0.1, torso);                                          // rosto na sombra
  for (const s of [-1, 1]) mesh(ico(0.025), glow(2.2, 0.8, 4), s * 0.07, 0.6, 0.27, torso);        // olhos violeta
  const arms = [];
  for (const s of [-1, 1]) {
    const a = new THREE.Group(); a.position.set(s * 0.28, 0.4, 0); torso.add(a);
    mesh(new THREE.CylinderGeometry(0.07, 0.13, 0.55, 6), robe, 0, -0.27, 0, a); mesh(ico(0.055), skin, 0, -0.57, 0, a); arms.push(a);
  }
  const scroll = new THREE.Group(); scroll.position.set(0, -0.6, 0.06); arms[1].add(scroll);
  mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8), parch, 0, 0, 0, scroll).rotation.z = Math.PI / 2;
  mesh(B(0.04, 0.04, 0.04), mat(0x8a1010), 0, 0, 0.045, scroll);                                 // lacre
  arms[1].rotation.x = -1.0;
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { group: g, pose(t, reach = 0) { torso.position.y = 1.1 + Math.sin(t * 1.4) * 0.01; arms[1].rotation.x = -0.4 - 0.9 * reach; torso.rotation.x = 0.1; } };
}

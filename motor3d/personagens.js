// Personagens low-poly de A Coroa de Varnor, montados com formas simples.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function rand(seed) { // gerador determinístico
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const cache = {};
export function mat(color, opts = {}) {
  const k = color + JSON.stringify(opts);
  return cache[k] ||= new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.8, ...opts });
}
export function mesh(geo, m, x = 0, y = 0, z = 0, parent) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true; if (parent) parent.add(o); return o;
}
export const B = (w, h, d) => new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.22); // bordas chanfradas

// ---------------- VITORIOSO ----------------
export function makeHero() {
  const steel = mat(0x5e6676, { metalness: 0.55, roughness: 0.42 });
  const steelDk = mat(0x434a58, { metalness: 0.5, roughness: 0.48 });
  const gold = mat(0xc9962e, { metalness: 0.8, roughness: 0.35 });
  const skin = mat(0xe3a98a), hair = mat(0x2a1a12), beard = mat(0x5a3a2a);
  const cape = mat(0x6e1424, { side: THREE.DoubleSide }), leather = mat(0x4a2e1c);
  const eyeM = mat(0x1d4d8a, { roughness: 0.2 }); const eyeW = mat(0xf4efe8);

  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips);
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(s * 0.17, 0, 0); hips.add(leg);
    mesh(B(0.24, 0.5, 0.26), steel, 0, -0.25, 0, leg);
    mesh(B(0.26, 0.42, 0.28), steelDk, 0, -0.68, 0, leg);
    mesh(B(0.28, 0.12, 0.38), leather, 0, -0.9, 0.05, leg);
    mesh(B(0.27, 0.06, 0.29), gold, 0, -0.47, 0, leg);
    const knee = mesh(new THREE.IcosahedronGeometry(0.11, 0), steel, 0, -0.47, 0.13, leg); knee.scale.set(1.1, 0.9, 0.7);
    mesh(new THREE.IcosahedronGeometry(0.035, 0), gold, 0, -0.47, 0.21, leg);
    mesh(B(0.2, 0.3, 0.06), steel, 0, -0.68, 0.14, leg);                  // placa da canela
    mesh(B(0.3, 0.06, 0.18), steelDk, 0, -0.86, 0.17, leg);               // bico da bota
    legs.push(leg);
  }
  const torso = new THREE.Group(); torso.position.y = 0.05; hips.add(torso);
  mesh(B(0.62, 0.22, 0.38), leather, 0, 0.05, 0, torso);                // cinto
  mesh(B(0.12, 0.12, 0.05), gold, 0, 0.05, 0.2, torso);                 // fivela
  mesh(B(0.72, 0.62, 0.44), steel, 0, 0.45, 0, torso);                  // peitoral
  mesh(B(0.74, 0.06, 0.46), gold, 0, 0.18, 0, torso);
  mesh(B(0.5, 0.06, 0.46), gold, 0, 0.74, 0, torso);
  mesh(new THREE.IcosahedronGeometry(0.06, 0), gold, -0.18, 0.62, 0.23, torso); // broche
  mesh(B(0.08, 0.5, 0.06), steelDk, 0, 0.45, 0.22, torso);              // nervura central do peitoral
  for (const [x, y] of [[-0.3, 0.68], [0.3, 0.68], [-0.3, 0.24], [0.3, 0.24]]) mesh(new THREE.IcosahedronGeometry(0.025, 0), gold, x, y, 0.225, torso); // rebites
  for (let i = 0; i < 3; i++) {                                         // saiote de placas
    for (const s of [-1, 1]) {
      const pl = mesh(B(0.3, 0.14, 0.06), i % 2 ? steelDk : steel, s * 0.17, -0.1 - i * 0.11, 0.2 - i * 0.01, torso);
      pl.rotation.x = 0.12;
    }
  }
  for (const s of [-1, 1]) mesh(B(0.12, 0.14, 0.08), leather, s * 0.31, 0.02, 0.17, torso);   // bolsinhas no cinto
  for (const s of [-1, 1]) {                                            // ombreiras
    const p = mesh(new THREE.IcosahedronGeometry(0.24, 0), steelDk, s * 0.46, 0.72, 0, torso);
    p.scale.set(1.1, 0.75, 1.1);
    mesh(B(0.3, 0.05, 0.42), gold, s * 0.46, 0.62, 0, torso);
    const p2 = mesh(new THREE.IcosahedronGeometry(0.2, 0), steel, s * 0.5, 0.58, 0, torso); p2.scale.set(1.05, 0.55, 1.05);
  }
  // capa (com dobra) presa nos ombros
  const capeG = new THREE.Group(); capeG.position.set(0, 0.78, -0.24); torso.add(capeG);
  const capeGeo = new THREE.PlaneGeometry(0.95, 1.35, 4, 6); capeGeo.translate(0, -0.67, 0);
  const cp = capeGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const y = cp.getY(i), x = cp.getX(i);
    cp.setZ(i, -0.06 * Math.sin(x * 9) - 0.12 * (-y));
    if (y < -1.2 && Math.abs(Math.sin(x * 23)) > 0.6) cp.setY(i, y + 0.12); // ponta rasgada
  }
  capeGeo.computeVertexNormals();
  const capeM = mesh(capeGeo, cape, 0, 0, 0, capeG);
  mesh(new THREE.TorusGeometry(0.33, 0.07, 4, 8, Math.PI), cape, 0, 0.0, 0.18, capeG).rotation.x = Math.PI / 2;

  // cabeça
  const head = new THREE.Group(); head.position.y = 0.93; torso.add(head);
  mesh(B(0.2, 0.14, 0.2), skin, 0, -0.08, 0, head);                     // pescoço
  const skull = mesh(new THREE.IcosahedronGeometry(0.27, 2), skin, 0, 0.2, 0, head); skull.scale.set(1, 1.05, 0.95);
  mesh(B(0.22, 0.045, 0.05), beard, 0, -0.03, 0.22, head);                  // barba rala (queixo)
  for (const s of [-1, 1]) mesh(B(0.05, 0.16, 0.14), beard, s * 0.21, 0.08, 0.12, head);
  mesh(B(0.16, 0.025, 0.04), beard, 0, 0.13, 0.25, head);               // bigode fino
  mesh(B(0.12, 0.022, 0.02), mat(0x5a2020), 0, 0.065, 0.255, head);    // boca
  mesh(B(0.025, 0.03, 0.02), mat(0xc02020), -0.055, 0.05, 0.258, head);   // corte no lábio
  for (const s of [-1, 1]) {
    mesh(B(0.07, 0.045, 0.02), eyeW, s * 0.09, 0.24, 0.245, head);
    mesh(B(0.035, 0.04, 0.02), eyeM, s * 0.09, 0.24, 0.255, head);
    const brow = mesh(B(0.12, 0.04, 0.035), hair, s * 0.09, 0.315, 0.24, head); brow.rotation.z = s * -0.2;
    for (let k = 0; k < 3; k++) mesh(B(0.07, 0.06, 0.04), beard, s * (0.08 + k * 0.055), 0.03 + k * 0.035, 0.22 - k * 0.045, head); // barba no maxilar
    mesh(new THREE.IcosahedronGeometry(0.06, 0), skin, s * 0.27, 0.2, 0, head);   // orelhas
  }
  mesh(B(0.06, 0.13, 0.08), skin, 0, 0.19, 0.265, head);                     // nariz
  mesh(B(0.09, 0.04, 0.06), skin, 0, 0.13, 0.27, head);                      // ponta do nariz
  const R = rand(7);                                                     // cabelo cacheado
  for (let i = 0; i < 34; i++) {
    const a = R() * Math.PI * 2, r = R() * 0.2;
    const c = mesh(new THREE.IcosahedronGeometry(0.075 + R() * 0.03, 0), hair,
      Math.cos(a) * r, 0.42 + R() * 0.06 - r * 0.3, Math.sin(a) * r * 0.9 - 0.02, head);
    c.rotation.set(R() * 3, R() * 3, 0);
  }
  for (const s of [-1, 1]) mesh(B(0.06, 0.16, 0.3), hair, s * 0.25, 0.32, -0.02, head); // laterais baixas
  mesh(new THREE.IcosahedronGeometry(0.26, 1), hair, 0, 0.27, -0.09, head).scale.set(1.06, 0.88, 1.0); // nuca

  // braços
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(s * 0.46, 0.66, 0); torso.add(arm);
    mesh(B(0.2, 0.36, 0.22), steelDk, 0, -0.2, 0, arm);
    const fore = new THREE.Group(); fore.position.y = -0.4; arm.add(fore);
    mesh(B(0.2, 0.34, 0.22), steel, 0, -0.17, 0, fore);
    mesh(B(0.21, 0.05, 0.23), gold, 0, -0.02, 0, fore);
    mesh(B(0.24, 0.12, 0.25), steelDk, 0, -0.32, 0, fore);               // punho da manopla
    mesh(B(0.17, 0.15, 0.17), steel, 0, -0.43, 0.01, fore);               // mão fechada
    mesh(B(0.18, 0.04, 0.05), gold, 0, -0.4, 0.09, fore);                 // nós dos dedos
    arms.push({ arm, fore });
  }
  // escudo-torre com emblema de portão (braço esquerdo = s=-1)
  const shield = new THREE.Group(); shield.position.set(-0.05, -0.25, 0.22); arms[0].fore.add(shield);
  mesh(B(0.72, 1.12, 0.08), mat(0x4b4f58, { metalness: 0.5, roughness: 0.5 }), 0, 0, 0.06, shield);
  for (const [w, h, x, y] of [[0.78, 0.06, 0, 0.56], [0.78, 0.06, 0, -0.56], [0.06, 1.16, 0.37, 0], [0.06, 1.16, -0.37, 0]])
    mesh(B(w, h, 0.1), gold, x, y, 0.07, shield);
  for (let i = 0; i < 8; i++) for (const [x, y] of [[-0.33, -0.48 + i * 0.137], [0.33, -0.48 + i * 0.137]])
    mesh(new THREE.IcosahedronGeometry(0.02, 0), gold, x, y, 0.13, shield);  // rebites da borda
  const emb = mat(0x8a8f99, { metalness: 0.6, roughness: 0.4 });
  mesh(B(0.36, 0.26, 0.04), emb, 0, -0.08, 0.12, shield);
  mesh(B(0.12, 0.16, 0.05), mat(0x1c1e22), 0, -0.13, 0.13, shield);   // arco do portão
  for (const x of [-0.17, 0.17]) {
    mesh(B(0.1, 0.42, 0.04), emb, x, 0.02, 0.12, shield);
    for (const dx of [-0.035, 0.035]) mesh(B(0.03, 0.05, 0.04), emb, x + dx, 0.255, 0.12, shield);
  }
  // espada (mão direita)
  const sword = new THREE.Group(); sword.position.set(0, -0.4, 0.05); arms[1].fore.add(sword);
  mesh(B(0.05, 0.62, 0.02), mat(0xc8ccd4, { metalness: 0.9, roughness: 0.2 }), 0, -0.4, 0.06, sword);
  mesh(B(0.22, 0.04, 0.05), gold, 0, -0.08, 0.06, sword);
  mesh(B(0.045, 0.14, 0.045), leather, 0, 0.01, 0.06, sword);
  mesh(new THREE.IcosahedronGeometry(0.035, 0), gold, 0, 0.1, 0.06, sword);
  sword.rotation.x = -0.4;

  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });

  function pose(t, slam) {
    const breathe = Math.sin(t * 2.2) * 0.015;
    torso.position.y = 0.05 + breathe;
    capeG.rotation.x = 0.12 + 0.06 * Math.sin(t * 3.1) + 0.03 * Math.sin(t * 7.7);
    capeM.rotation.y = 0.05 * Math.sin(t * 2.3);
    head.rotation.y = 0.05 * Math.sin(t * 0.7);
    // escudo: guarda alta -> ergue (antecipação) -> crava no chão
    const a = t - (slam - 0.45);
    let lift, crouch;
    if (a < 0) { lift = 0; crouch = 0; }
    else if (a < 0.45) { const k = a / 0.45; lift = k; crouch = 0; }
    else { const k = Math.min(1, (a - 0.45) / 0.12); lift = 1 - k * 1.6; crouch = k; }
    const settle = a > 0.57 ? Math.exp(-(a - 0.57) * 6) : 1;
    crouch = Math.max(0, crouch) * (0.6 + 0.4 * settle);
    arms[0].arm.rotation.x = -0.35 - 0.9 * lift; arms[0].arm.rotation.z = 0.32;
    arms[0].fore.rotation.x = -0.75 + 0.2 * lift;
    arms[1].arm.rotation.x = -0.3 - 0.3 * lift; arms[1].arm.rotation.z = -0.15;
    hips.position.y = 0.95 - 0.22 * crouch;
    legs[0].rotation.x = -0.5 * crouch; legs[1].rotation.x = 0.4 * crouch;
    torso.rotation.x = 0.25 * crouch;
    head.rotation.x = -0.15 * crouch;
    shield.rotation.x = -(arms[0].arm.rotation.x + arms[0].fore.rotation.x + torso.rotation.x);
  }
  pose(0, 99);
  return { group: g, pose };
}

// ---------------- BRASA (gato laranja) ----------------
export function makeCat() {
  const fur = mat(0xe07a2a), stripe = mat(0xa8501a), white = mat(0xf2e6d8);
  const g = new THREE.Group(); g.scale.setScalar(0.85);
  const body = mesh(new THREE.IcosahedronGeometry(0.2, 1), fur, 0, 0.26, 0, g); body.scale.set(0.85, 0.85, 1.5);
  for (let i = 0; i < 4; i++) mesh(B(0.3, 0.035, 0.06), stripe, 0, 0.42 - Math.abs(i - 1.5) * 0.02, -0.18 + i * 0.12, g);
  const head = new THREE.Group(); head.position.set(0, 0.46, 0.27); g.add(head);
  mesh(new THREE.IcosahedronGeometry(0.15, 1), fur, 0, 0, 0, head).scale.set(1.15, 0.95, 1);
  mesh(new THREE.IcosahedronGeometry(0.08, 0), white, 0, -0.06, 0.1, head);
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.ConeGeometry(0.06, 0.14, 4), fur, s * 0.1, 0.15, 0, head); ear.rotation.z = s * -0.3;
    mesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshBasicMaterial({ color: 0xffb020 }), s * 0.06, 0.02, 0.13, head);
    mesh(B(0.08, 0.02, 0.02), stripe, s * 0.05, 0.11, 0.1, head);
  }
  mesh(new THREE.ConeGeometry(0.02, 0.03, 3), mat(0xd07070), 0, -0.03, 0.15, head).rotation.x = Math.PI / 2;
  const mouth = mesh(B(0.06, 0.03, 0.02), mat(0x3a1010), 0, -0.08, 0.14, head);
  for (const [x, z] of [[-0.1, 0.18], [0.1, 0.18], [-0.1, -0.18], [0.1, -0.18]])
    mesh(B(0.07, 0.2, 0.07), fur, x, 0.1, z, g);
  const tail = new THREE.Group(); tail.position.set(0, 0.32, -0.28); g.add(tail);
  const segs = [];
  let parent = tail;
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Group(); s.position.y = i ? 0.1 : 0; parent.add(s);
    mesh(B(0.06, 0.11, 0.06), i % 2 ? stripe : fur, 0, 0.05, 0, s); segs.push(s); parent = s;
  }
  function pose(t) {
    // pelo arrepiado (corpo arqueado) e rabo agitado, chiando
    body.scale.y = 0.85 + 0.05 * Math.sin(t * 9);
    tail.rotation.x = -0.4;
    segs.forEach((s, i) => { s.rotation.z = 0.35 * Math.sin(t * 6 + i * 0.8); s.rotation.x = -0.15; });
    head.rotation.y = 0.2 * Math.sin(t * 1.3);
    mouth.scale.y = 1 + 0.8 * Math.max(0, Math.sin(t * 2.5));
  }
  return { group: g, pose };
}

// ---------------- MONSTRO ----------------
export function makeMonster(R) {
  const skin = mat(0x2a2030), skin2 = mat(0x3a2a2a), horn = mat(0xd8ccb0);
  const eye = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.35, 0.25) }); // HDR -> brilha
  const g = new THREE.Group(); const sc = 1.0 + R() * 0.5; g.scale.setScalar(sc);
  const body = new THREE.Group(); body.position.y = 1.0; g.add(body);
  mesh(new THREE.IcosahedronGeometry(0.5, 0), R() > 0.5 ? skin : skin2, 0, 0.2, 0, body).scale.set(1.2, 1.0, 0.9);
  const head = new THREE.Group(); head.position.set(0, 0.75, 0.25); body.add(head);
  mesh(new THREE.IcosahedronGeometry(0.3, 0), skin, 0, 0, 0, head);
  for (const s of [-1, 1]) {
    const h = mesh(new THREE.ConeGeometry(0.07, 0.45, 4), horn, s * 0.22, 0.25, 0, head); h.rotation.z = s * -0.6;
    mesh(new THREE.IcosahedronGeometry(0.05, 0), eye, s * 0.11, 0.03, 0.26, head);
  }
  const limbs = [];
  for (const [x, y, len] of [[-0.55, 0.3, 0.9], [0.55, 0.3, 0.9], [-0.25, -0.35, 0.7], [0.25, -0.35, 0.7]]) {
    const l = new THREE.Group(); l.position.set(x, y, 0); body.add(l);
    mesh(B(0.2, len, 0.2), skin, 0, -len / 2, 0, l); limbs.push(l);
  }
  function pose(t, walking) {
    const w = walking ? 1 : 0.25, f = walking ? 7 : 2;
    body.position.y = 1.0 + 0.06 * Math.abs(Math.sin(t * f)) * w;
    limbs[0].rotation.x = 0.8 * Math.sin(t * f) * w - 0.4; limbs[1].rotation.x = -0.8 * Math.sin(t * f) * w - 0.4;
    limbs[2].rotation.x = -0.7 * Math.sin(t * f) * w; limbs[3].rotation.x = 0.7 * Math.sin(t * f) * w;
    body.rotation.x = 0.25; head.rotation.y = 0.2 * Math.sin(t * 1.1);
  }
  return { group: g, pose };
}

// ---------------- ALDEÃO (fugindo) ----------------
export function makeVillager(R) {
  const tunics = [0x6b5a3a, 0x5a6b4a, 0x7a4a3a, 0x4a5a7a, 0x8a7a5a];
  const skin = mat([0xe3a98a, 0xc98b6a, 0x9a6a4a][Math.floor(R() * 3)]);
  const tunic = mat(tunics[Math.floor(R() * tunics.length)]), pants = mat(0x3a3028), hairM = mat([0x2a1a12, 0x6a4a2a, 0x1a1a1a, 0x8a8a8a][Math.floor(R() * 4)]);
  const g = new THREE.Group(); g.scale.setScalar(0.85 + R() * 0.2);
  const hips = new THREE.Group(); hips.position.y = 0.8; g.add(hips);
  const legs = [];
  for (const s of [-1, 1]) { const l = new THREE.Group(); l.position.x = s * 0.12; hips.add(l); mesh(B(0.16, 0.8, 0.18), pants, 0, -0.4, 0, l); legs.push(l); }
  const torso = new THREE.Group(); hips.add(torso);
  mesh(B(0.46, 0.62, 0.3), tunic, 0, 0.3, 0, torso);
  const head = mesh(new THREE.IcosahedronGeometry(0.2, 1), skin, 0, 0.82, 0.02, torso);
  mesh(new THREE.IcosahedronGeometry(0.21, 1), hairM, 0, 0.87, -0.05, torso).scale.set(1.08, 0.85, 1.08);
  const arms = [];
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * 0.3, 0.55, 0); torso.add(a); mesh(B(0.13, 0.55, 0.14), tunic, 0, -0.27, 0, a); mesh(B(0.11, 0.1, 0.11), skin, 0, -0.58, 0, a); arms.push(a); }
  if (R() > 0.4) mesh(new THREE.IcosahedronGeometry(0.24, 0), mat(0x9a8a6a), 0, 0.45, -0.3, torso); // trouxa nas costas
  function pose(t) {
    const f = 10;
    legs[0].rotation.x = 0.8 * Math.sin(t * f); legs[1].rotation.x = -0.8 * Math.sin(t * f);
    arms[0].rotation.x = -0.7 * Math.sin(t * f); arms[1].rotation.x = 0.7 * Math.sin(t * f);
    hips.position.y = 0.8 + 0.05 * Math.abs(Math.cos(t * f)); torso.rotation.x = 0.25;
    head.rotation.y = 0.4 * Math.sin(t * 2); // olha pra trás com medo
  }
  return { group: g, pose };
}

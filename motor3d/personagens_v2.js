// Personagens v2: membros arredondados com articulações, armadura curva, capa com ondulação, rostos esculpidos
// com piscada e sincronia labial. API compatível: { group, pose(t, ...), face } .
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeFace, smat, blinkAt, rand } from './rosto.js';

function add(parent, geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
const RB = (w, h, d, r = 0.25) => new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * r);
const CAP = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14);
const SPH = (r) => new THREE.SphereGeometry(r, 24, 18);

// capa com ondulação por vértice
function makeCape(parent, w, h, m, y, z) {
  const geo = new THREE.PlaneGeometry(w, h, 10, 16); geo.translate(0, -h / 2, 0);
  const base = geo.attributes.position.array.slice();
  const cape = add(parent, geo, m, 0, y, z);
  return {
    mesh: cape,
    wave(t, wind = 1) {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = base[i * 3], yy = base[i * 3 + 1], d = -yy / h;            // 0 no ombro, 1 na barra
        let zz = -0.05 * Math.cos(x * 6) - 0.1 * d;                         // dobras + afastamento das costas
        zz -= wind * d * d * (0.06 * Math.sin(t * 3.1 + x * 4 + d * 3) + 0.03 * Math.sin(t * 7.3 + x * 9));
        p.setXYZ(i, x * (1 + 0.15 * d), yy, zz);
      }
      p.needsUpdate = true; geo.computeVertexNormals();
    },
  };
}

// membro com articulação: retorna { root, joint } — root gira no ombro/quadril, joint no cotovelo/joelho
function limb(parent, x, y, upperR, upperL, lowerR, lowerL, mUp, mLow, mJoint) {
  const root = new THREE.Group(); root.position.set(x, y, 0); parent.add(root);
  add(root, CAP(upperR, upperL), mUp, 0, -upperL / 2 - upperR * 0.4, 0);
  const joint = new THREE.Group(); joint.position.y = -upperL - upperR * 0.6; root.add(joint);
  add(joint, SPH(Math.max(upperR, lowerR) * 1.05), mJoint);
  add(joint, CAP(lowerR, lowerL), mLow, 0, -lowerL / 2 - lowerR * 0.4, 0);
  return { root, joint, end: -lowerL - lowerR };
}

// ================= VITORIOSO v2 =================
export function makeHeroV2({ cracked = false } = {}) {
  const steel = smat(0x7a8292, { metalness: 0.6, roughness: 0.46 });
  const steelDk = smat(0x4e5562, { metalness: 0.55, roughness: 0.5 });
  const gold = smat(0xd4a23a, { metalness: 0.9, roughness: 0.25 });
  const leather = smat(0x5a3820, { roughness: 0.75 }), cloth = smat(0x3a2a22, { roughness: 0.9 });
  const capeM = smat(0x7a1628, { side: THREE.DoubleSide, roughness: 0.85 });

  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.98; g.add(hips);
  // pernas
  const legs = [-1, 1].map((s) => {
    const L = limb(hips, s * 0.15, -0.02, 0.105, 0.3, 0.095, 0.3, cloth, cloth, steel);
    add(L.root, RB(0.24, 0.3, 0.2), steel, 0, -0.2, 0.03);                         // coxote
    add(L.root, RB(0.25, 0.04, 0.21), gold, 0, -0.06, 0.03);
    add(L.joint, SPH(0.035), gold, 0, 0, 0.11);                                    // rebite do joelho
    add(L.joint, RB(0.2, 0.3, 0.18), steel, 0, -0.2, 0.03);                        // greva
    add(L.joint, RB(0.24, 0.13, 0.36, 0.35), leather, 0, -0.46, 0.06);             // bota
    return L;
  });
  // tronco
  const torso = new THREE.Group(); torso.position.y = 0.02; hips.add(torso);
  add(torso, CAP(0.21, 0.12), cloth, 0, 0.18, 0).scale.set(1.25, 1, 0.9);        // abdômen
  const chest = add(torso, SPH(0.34), steel, 0, 0.52, 0.0); chest.scale.set(1.02, 0.9, 0.6); // peitoral curvo
  add(torso, RB(0.5, 0.36, 0.3, 0.3), steel, 0, 0.42, 0.04);                     // placa abdominal
  add(torso, new THREE.TorusGeometry(0.3, 0.018, 8, 40), gold, 0, 0.28, 0).scale.set(1.25, 0.75, 1);   // filete dourado
  const ridge = add(torso, CAP(0.025, 0.4), steelDk, 0, 0.52, 0.24); ridge.rotation.x = 0.12;
  add(torso, new THREE.TorusGeometry(0.2, 0.035, 8, 24), steelDk, 0, 0.83, 0).rotation.x = Math.PI / 2; // gola
  add(torso, new THREE.TorusGeometry(0.27, 0.04, 8, 32), leather, 0, 0.07, 0).scale.set(1.15, 1, 0.85); // cinto
  add(torso, RB(0.11, 0.1, 0.05), gold, 0, 0.07, 0.24);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const f = add(torso, RB(0.28, 0.12, 0.05), i % 2 ? steelDk : steel, s * 0.15, -0.05 - i * 0.1, 0.2 - i * 0.012); f.rotation.x = 0.15; }
  for (const s of [-1, 1]) {                                                       // ombreiras em camadas
    for (let k = 0; k < 3; k++) {
      const pl = add(torso, new THREE.SphereGeometry(0.2 - k * 0.02, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), k === 0 ? steel : steelDk, s * (0.4 + k * 0.03), 0.78 - k * 0.09, 0);
      pl.scale.set(1.05, 0.7, 1.05); pl.rotation.z = s * -0.35;
    }
    add(torso, new THREE.TorusGeometry(0.19, 0.012, 6, 24, Math.PI), gold, s * 0.4, 0.79, 0).rotation.set(0, Math.PI / 2, s * -0.35);
  }
  // capa
  const cape = makeCape(torso, 0.85, 1.35, capeM, 0.86, -0.24);
  // cabeça
  const head = new THREE.Group(); head.position.y = 1.15; torso.add(head);
  const face = makeFace({ skin: 0xe3a98a, hair: 0x2a1a12, beardColor: 0x6a4a38, eyes: 0x3a7ac0, beard: 'stubble', hairStyle: 'curly', jaw: 1.25, scar: true, seed: 7, brow: 0.06 });
  head.add(face.group);
  // braços
  const arms = [-1, 1].map((s) => {
    const A = limb(torso, s * 0.45, 0.72, 0.085, 0.27, 0.08, 0.24, cloth, cloth, steelDk);
    add(A.root, CAP(0.1, 0.18), steelDk, 0, -0.17, 0);                            // braçadeira
    const vam = add(A.joint, new THREE.CylinderGeometry(0.1, 0.085, 0.24, 16), steel, 0, -0.15, 0);
    add(A.joint, new THREE.TorusGeometry(0.1, 0.012, 6, 20), gold, 0, -0.04, 0).rotation.x = Math.PI / 2;
    const hand = new THREE.Group(); hand.position.y = A.end - 0.02; A.joint.add(hand);
    add(hand, RB(0.13, 0.13, 0.14, 0.35), steelDk, 0, -0.02, 0.01);               // manopla
    add(hand, RB(0.13, 0.06, 0.1, 0.4), steelDk, 0, -0.1, 0.04);                   // dedos fechados
    add(hand, CAP(0.025, 0.05), steelDk, s * -0.07, -0.04, 0.06).rotation.z = 0.6; // polegar
    return { ...A, hand };
  });
  // escudo-torre
  const shield = new THREE.Group(); shield.position.set(-0.02, -0.05, 0.16); arms[0].hand.add(shield);
  add(shield, RB(0.72, 1.12, 0.08, 0.3), smat(0x5a5f6a, { metalness: 0.65, roughness: 0.38 }), 0, 0, 0.06);
  for (const [w, h, x, y] of [[0.78, 0.06, 0, 0.56], [0.78, 0.06, 0, -0.56], [0.06, 1.16, 0.37, 0], [0.06, 1.16, -0.37, 0]]) add(shield, RB(w, h, 0.1), gold, x, y, 0.07);
  for (let i = 0; i < 8; i++) for (const x of [-0.33, 0.33]) add(shield, SPH(0.018), gold, x, -0.48 + i * 0.137, 0.12);
  const emb = smat(0x9aa0ac, { metalness: 0.7, roughness: 0.3 });
  add(shield, RB(0.36, 0.26, 0.04), emb, 0, -0.08, 0.12); add(shield, RB(0.12, 0.16, 0.05), smat(0x15161a), 0, -0.13, 0.13);
  for (const x of [-0.17, 0.17]) { add(shield, RB(0.1, 0.42, 0.04), emb, x, 0.02, 0.12); for (const dx of [-0.035, 0.035]) add(shield, RB(0.03, 0.05, 0.04), emb, x + dx, 0.255, 0.12); }
  if (cracked) [[-0.3, 0.42, 0.5], [-0.17, 0.3, -0.6], [-0.05, 0.12, 0.7], [0.07, -0.08, -0.5], [0.16, -0.27, 0.6], [0.27, -0.45, -0.4]]
    .forEach(([x, y, r]) => { add(shield, RB(0.22, 0.03, 0.03), smat(0x0a0a0c), x, y, 0.125).rotation.z = r; });
  // espada
  const sword = new THREE.Group(); sword.position.set(0, -0.06, 0.05); arms[1].hand.add(sword); sword.rotation.x = -0.4;
  add(sword, RB(0.055, 0.66, 0.02), smat(0xd0d4dc, { metalness: 0.95, roughness: 0.15 }), 0, -0.42, 0.06);
  add(sword, RB(0.22, 0.04, 0.05), gold, 0, -0.08, 0.06); add(sword, CAP(0.022, 0.12), leather, 0, 0.02, 0.06); add(sword, SPH(0.035), gold, 0, 0.11, 0.06);

  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const st = { mouth: 0 };
  function pose(t, slam = 999, extra = {}) {
    torso.position.y = 0.02 + Math.sin(t * 2.2) * 0.012;
    head.rotation.y = 0.06 * Math.sin(t * 0.7) + (extra.headYaw ?? 0);
    face.setBlink(blinkAt(t, 7)); face.setMouth(extra.mouth ?? 0); face.look(extra.eyeYaw ?? 0, 0);
    cape.wave(t, extra.wind ?? 1);
    const a = t - (slam - 0.45);
    let lift = 0, crouch = 0;
    if (a >= 0 && a < 0.45) lift = a / 0.45;
    else if (a >= 0.45) { const k = Math.min(1, (a - 0.45) / 0.12); lift = 1 - k * 1.6; crouch = k * (0.6 + 0.4 * (a > 0.57 ? Math.exp(-(a - 0.57) * 6) : 1)); }
    crouch = Math.max(0, crouch);
    const sit = extra.sit ?? 0;
    arms[0].root.rotation.set(-0.3 - 0.9 * lift, 0, 0.3); arms[0].joint.rotation.x = -0.9 + 0.25 * lift;
    arms[1].root.rotation.set(-0.25 - 0.3 * lift, 0, -0.12); arms[1].joint.rotation.x = -0.35;
    if (extra.fist) { arms[1].root.rotation.x = -0.5; arms[1].joint.rotation.x = -1.6 * extra.fist; }
    hips.position.y = 0.98 - 0.22 * crouch - 0.43 * sit;
    legs[0].root.rotation.x = -0.5 * crouch - 1.45 * sit; legs[0].joint.rotation.x = 0.7 * crouch + 1.45 * sit;
    legs[1].root.rotation.x = 0.3 * crouch - 1.45 * sit; legs[1].joint.rotation.x = 0.3 * crouch + 1.45 * sit;
    legs[0].root.rotation.z = -0.12 * sit; legs[1].root.rotation.z = 0.12 * sit;
    if (sit > 0) { for (const A of arms) { A.root.rotation.x = -0.75 * sit; A.joint.rotation.x = -0.7 * sit; } }
    torso.rotation.x = 0.22 * crouch; head.rotation.x = -0.15 * crouch;
    shield.rotation.x = -(arms[0].root.rotation.x + arms[0].joint.rotation.x + torso.rotation.x);
  }
  pose(0);
  return { group: g, pose, face, shield, sword };
}

// ================= LORDE DRAVEN v2 =================
export function makeDravenV2({ mounted = false } = {}) {
  const black = smat(0x2a2c34, { metalness: 0.6, roughness: 0.42 }), blackDk = smat(0x1a1b20, { metalness: 0.55, roughness: 0.5 });
  const silver = smat(0xc8ccd6, { metalness: 0.95, roughness: 0.18 }), fur = smat(0x5a5456, { roughness: 1 }), cloth = smat(0x1a1a20);
  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 1.0; g.add(hips);
  const legs = [-1, 1].map((s) => {
    const L = limb(hips, s * (mounted ? 0.4 : 0.15), -0.02, 0.1, 0.3, 0.095, 0.32, cloth, cloth, black);
    add(L.root, RB(0.23, 0.32, 0.2), black, 0, -0.2, 0.03); add(L.joint, RB(0.2, 0.32, 0.18), black, 0, -0.2, 0.03);
    add(L.joint, RB(0.24, 0.12, 0.34, 0.35), blackDk, 0, -0.48, 0.06); add(L.joint, RB(0.22, 0.03, 0.19), silver, 0, -0.05, 0.03);
    if (mounted) { L.root.rotation.set(-1.25, 0, s * 0.3); L.joint.rotation.x = 1.3; }
    return L;
  });
  const torso = new THREE.Group(); hips.add(torso);
  add(torso, CAP(0.2, 0.12), cloth, 0, 0.18, 0).scale.set(1.2, 1, 0.9);
  const chest = add(torso, SPH(0.33), black, 0, 0.53, 0); chest.scale.set(1.0, 0.92, 0.6);
  add(torso, RB(0.48, 0.36, 0.3, 0.3), black, 0, 0.42, 0.04);
  add(torso, new THREE.TorusGeometry(0.29, 0.016, 8, 40), silver, 0, 0.29, 0).scale.set(1.25, 0.75, 1);
  for (const sd of [-1, 1]) add(torso, RB(0.17, 0.04, 0.03), silver, sd * 0.08, 0.6, 0.235).rotation.z = sd * 0.45;   // corvo: asas
  add(torso, SPH(0.035), silver, 0, 0.56, 0.24); add(torso, new THREE.ConeGeometry(0.02, 0.06, 6), silver, 0, 0.5, 0.24).rotation.x = Math.PI;
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) { const pl = add(torso, new THREE.SphereGeometry(0.2 - k * 0.02, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), k ? blackDk : black, s * (0.4 + k * 0.03), 0.79 - k * 0.09, 0); pl.scale.set(1.05, 0.7, 1.05); pl.rotation.z = s * -0.35; }
    for (let k = 0; k < 3; k++) add(torso, new THREE.ConeGeometry(0.03, 0.16, 8), silver, s * (0.33 + k * 0.08), 0.9, 0);
  }
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; add(torso, SPH(0.08), fur, Math.cos(a) * 0.28, 0.86, Math.sin(a) * 0.19).scale.set(1, 0.8, 1); } // gola de pele
  const cape = makeCape(torso, 0.95, 1.6, smat(0x0e0e14, { side: THREE.DoubleSide, roughness: 0.8 }), 0.86, -0.24);
  const head = new THREE.Group(); head.position.y = 1.16; torso.add(head);
  const face = makeFace({ skin: 0xe0c2aa, hair: 0x101014, eyes: 0x8a94a0, beard: 'goatee', hairStyle: 'slick', brow: -0.28, jaw: 1.1, seed: 3 });
  head.add(face.group);
  add(head, new THREE.TorusGeometry(0.245, 0.01, 8, 40), silver, 0, 0.13, -0.01).rotation.x = Math.PI / 2 - 0.3;             // diadema na testa
  const arms = [-1, 1].map((s) => {
    const A = limb(torso, s * 0.44, 0.72, 0.085, 0.27, 0.08, 0.25, cloth, cloth, black);
    add(A.root, CAP(0.1, 0.18), black, 0, -0.17, 0); add(A.joint, new THREE.CylinderGeometry(0.1, 0.085, 0.24, 16), black, 0, -0.15, 0);
    add(A.joint, RB(0.13, 0.15, 0.14, 0.35), blackDk, 0, A.end - 0.04, 0.01);
    A.root.rotation.set(-0.2, 0, s * 0.12); A.joint.rotation.x = -0.4; return A;
  });
  add(torso, RB(0.05, 0.9, 0.04), silver, -0.36, -0.3, 0.14).rotation.z = 0.15;                                         // espada na bainha
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return {
    group: g, face,
    pose(t, extra = {}) {
      torso.position.y = Math.sin(t * 1.8) * 0.01; head.rotation.y = 0.12 * Math.sin(t * 0.5) + (extra.headYaw ?? 0); head.rotation.x = extra.headPitch ?? 0;
      face.setBlink(blinkAt(t, 3)); face.setMouth(extra.mouth ?? 0); cape.wave(t, 0.8);
    },
  };
}

// ================= LIRA v2 =================
export function makeLiraV2() {
  const robe = smat(0xece6d8, { roughness: 0.9 }), green = smat(0x3f7a4a, { roughness: 0.85 }), wood = smat(0x6a4a2a);
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.2, 0.42, 1.0, 24), robe, 0, 0.5, 0);
  add(g, new THREE.CylinderGeometry(0.425, 0.43, 0.08, 24), green, 0, 0.06, 0);
  const torso = new THREE.Group(); torso.position.y = 0.95; g.add(torso);
  add(torso, CAP(0.19, 0.25), robe, 0, 0.25, 0).scale.set(1.15, 1, 0.8);
  add(torso, new THREE.TorusGeometry(0.2, 0.035, 8, 24), green, 0, 0.04, 0).scale.set(1.15, 1, 0.8);
  add(torso, RB(0.1, 0.42, 0.03), green, 0, 0.3, 0.16);
  const cape = makeCape(torso, 0.7, 1.2, smat(0x2f6a3a, { side: THREE.DoubleSide, roughness: 0.85 }), 0.5, -0.17);
  const head = new THREE.Group(); head.position.y = 0.86; torso.add(head); head.scale.setScalar(0.93);
  const face = makeFace({ skin: 0xf0c0a0, hair: 0x7a3e1e, eyes: 0x3a8a4a, hairStyle: 'long', female: true, brow: 0.08, jaw: 0.85, seed: 11 });
  head.add(face.group);
  const arms = [-1, 1].map((s) => {
    const A = limb(torso, s * 0.27, 0.45, 0.07, 0.24, 0.06, 0.22, robe, robe, robe);
    add(A.joint, SPH(0.055), smat(0xf0c0a0), 0, A.end, 0); return A;
  });
  const staff = new THREE.Group(); staff.position.set(0, arms[1].end, 0.04); arms[1].joint.add(staff);
  add(staff, CAP(0.025, 1.6), wood, 0, 0.3, 0);
  const crystal = add(staff, new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 2.6, 1.0) }), 0, 1.25, 0);
  arms[1].root.rotation.set(-0.4, 0, -0.1); arms[1].joint.rotation.x = -0.5; arms[0].root.rotation.z = 0.12;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, face, pose(t, extra = {}) { torso.position.y = 0.95 + Math.sin(t * 2) * 0.01; crystal.rotation.y = t * 1.5; face.setBlink(blinkAt(t, 11)); face.setMouth(extra.mouth ?? 0); cape.wave(t, 0.6); head.rotation.y = extra.headYaw ?? 0; } };
}

// ================= BRAM v2 =================
export function makeBramV2() {
  const shirt = smat(0x86745e, { roughness: 0.9 }), apron = smat(0x4a2e1c, { roughness: 0.8 }), skinC = 0xd89a7a, skin = smat(skinC);
  const g = new THREE.Group();
  const hips = new THREE.Group(); hips.position.y = 0.88; g.add(hips);
  [-1, 1].forEach((s) => { const L = limb(hips, s * 0.16, 0, 0.11, 0.28, 0.1, 0.28, smat(0x3a3028), smat(0x3a3028), smat(0x3a3028)); add(L.joint, RB(0.24, 0.12, 0.34, 0.35), apron, 0, -0.42, 0.05); });
  const torso = new THREE.Group(); hips.add(torso);
  add(torso, SPH(0.36), shirt, 0, 0.42, 0.02).scale.set(1.2, 1.15, 0.95);                    // corpanzil
  add(torso, RB(0.6, 0.95, 0.05, 0.2), apron, 0, 0.3, 0.32);
  const head = new THREE.Group(); head.position.y = 1.0; torso.add(head);
  const face = makeFace({ skin: skinC, hair: 0xe0ddd5, beardColor: 0xe8e4dc, eyes: 0x5a5a7a, beard: 'full', hairStyle: 'bald', brow: -0.35, jaw: 1.2, seed: 21 });
  head.add(face.group);
  const arms = [-1, 1].map((s) => {
    const A = limb(torso, s * 0.47, 0.68, 0.1, 0.26, 0.095, 0.24, shirt, skin, shirt);
    add(A.joint, SPH(0.09), skin, 0, A.end, 0); return A;
  });
  const hammer = new THREE.Group(); hammer.position.set(0, arms[1].end, 0.05); arms[1].joint.add(hammer);
  add(hammer, CAP(0.025, 0.55), smat(0x6a4a2a), 0, 0.1, 0); add(hammer, RB(0.28, 0.14, 0.14), smat(0x3a3a40, { metalness: 0.8, roughness: 0.4 }), 0, 0.42, 0);
  arms[1].root.rotation.x = -0.3; arms[1].joint.rotation.x = -0.6;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, face, arms, pose(t, extra = {}) { torso.position.y = Math.sin(t * 1.6) * 0.012; head.rotation.y = 0.2 * Math.sin(t * 0.6) + (extra.headYaw ?? 0); face.setBlink(blinkAt(t, 21)); face.setMouth(extra.mouth ?? 0);
    if (extra.hammer !== undefined) { arms[1].root.rotation.x = -0.3 - 1.6 * extra.hammer; arms[1].joint.rotation.x = -0.6 - 0.6 * extra.hammer; } } };
}

// ================= ALDEÃO v2 =================
export function makeVillagerV2(R) {
  const tunic = smat([0x7b6a4a, 0x6a7b5a, 0x8a5a4a, 0x5a6a8a, 0x9a8a6a][Math.floor(R() * 5)], { roughness: 0.9 });
  const pants = smat(0x4a3a30), skinC = [0xe3a98a, 0xc98b6a, 0x9a6a4a][Math.floor(R() * 3)], skin = smat(skinC);
  const g = new THREE.Group(); g.scale.setScalar(0.86 + R() * 0.18);
  const hips = new THREE.Group(); hips.position.y = 0.8; g.add(hips);
  const legs = [-1, 1].map((s) => limb(hips, s * 0.11, 0, 0.075, 0.26, 0.07, 0.26, pants, pants, pants));
  legs.forEach((L) => add(L.joint, RB(0.15, 0.08, 0.24, 0.35), smat(0x3a2a1e), 0, -0.36, 0.04));
  const torso = new THREE.Group(); hips.add(torso);
  add(torso, CAP(0.2, 0.25), tunic, 0, 0.3, 0).scale.set(1.05, 1, 0.75);
  add(torso, new THREE.TorusGeometry(0.19, 0.025, 6, 20), smat(0x4a3020), 0, 0.12, 0).scale.set(1.05, 1, 0.75);
  const head = new THREE.Group(); head.position.y = 0.82; torso.add(head); head.scale.setScalar(0.85);
  const styles = ['slick', 'curly', 'long', 'bald'];
  const face = makeFace({ skin: skinC, hair: [0x2a1a12, 0x6a4a2a, 0x1a1a1a, 0x8a8a8a][Math.floor(R() * 4)], eyes: [0x4a3020, 0x2a5a8a, 0x3a6a3a][Math.floor(R() * 3)],
    hairStyle: styles[Math.floor(R() * 4)], beard: R() > 0.6 ? 'stubble' : null, female: R() > 0.55, seed: Math.floor(R() * 1000) });
  head.add(face.group);
  const arms = [-1, 1].map((s) => { const A = limb(torso, s * 0.25, 0.5, 0.06, 0.24, 0.055, 0.22, tunic, skin, tunic); add(A.joint, SPH(0.05), skin, 0, A.end, 0); return A; });
  if (R() > 0.5) add(torso, SPH(0.2), smat(0x9a8a6a), 0, 0.4, -0.25).scale.set(1, 0.9, 0.8);      // trouxa
  const seed = Math.floor(R() * 100);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, face, pose(t, f = 10, extra = {}) {
    const w = f > 0 ? 1 : 0;
    legs[0].root.rotation.x = 0.7 * Math.sin(t * f) * w; legs[1].root.rotation.x = -0.7 * Math.sin(t * f) * w;
    legs[0].joint.rotation.x = 0.5 * Math.max(0, -Math.sin(t * f)) * w; legs[1].joint.rotation.x = 0.5 * Math.max(0, Math.sin(t * f)) * w;
    arms[0].root.rotation.x = -0.6 * Math.sin(t * f) * w; arms[1].root.rotation.x = 0.6 * Math.sin(t * f) * w;
    arms[0].joint.rotation.x = arms[1].joint.rotation.x = -0.3;
    hips.position.y = 0.8 + 0.04 * Math.abs(Math.cos(t * f)) * w; torso.rotation.x = 0.2 * w;
    head.rotation.y = (extra.headYaw ?? 0.3 * Math.sin(t * 2) * w); face.setBlink(blinkAt(t, seed)); face.setMouth(extra.mouth ?? 0);
  } };
}

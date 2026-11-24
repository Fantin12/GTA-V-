// Rostos v2: cabeça esculpida e lisa, olhos com íris e pálpebras (piscam), boca que abre (sincronia labial),
// barba por cores de vértice e penteados. Tudo procedural e original.
import * as THREE from 'three';

const cache = {};
export function smat(color, opts = {}) {            // material liso (sem flat shading)
  const k = 's' + color + JSON.stringify(opts);
  return cache[k] ||= new THREE.MeshStandardMaterial({ color, roughness: 0.65, ...opts });
}
function add(parent, geo, m, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
}
export function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// piscada determinística: retorna 0..1 (1 = olho fechado)
export function blinkAt(t, seed = 1) {
  const period = 3.1 + (seed % 7) * 0.37, ph = (seed * 0.731) % period;
  const u = ((t + ph) % period) / 0.16;
  return u < 1 ? Math.sin(u * Math.PI) : 0;
}

/**
 * makeFace(opts) -> { group, setMouth(0..1), setBlink(0..1), look(yaw, pitch) }
 * opts: skin, hair, eyes, beard: null|'stubble'|'goatee'|'full', beardColor, hairStyle: 'curly'|'slick'|'long'|'bald'|'mohawk',
 *       brow (inclinação), jaw (largura), female, scar
 */
export function makeFace(o = {}) {
  const skinC = new THREE.Color(o.skin ?? 0xe3a98a), beardC = new THREE.Color(o.beardColor ?? o.hair ?? 0x2a1a12);
  const g = new THREE.Group();
  const jaw = o.jaw ?? 1.0, fem = o.female ? 1 : 0;

  // ---- cabeça esculpida ----
  const geo = new THREE.SphereGeometry(0.25, 48, 36);
  const p = geo.attributes.position, cols = [];
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const front = Math.max(0, z / 0.25);
    if (y < 0) { x *= 1 + (-y / 0.25) * 0.06 * jaw - fem * 0.05 * (-y / 0.25); z += front * (-y / 0.25) * 0.03; }   // maxilar e queixo
    if (y < -0.17) y = -0.17 + (y + 0.17) * 0.55;                                                                       // achata o queixo
    if (y > 0.03 && y < 0.09 && front > 0.75) z += 0.012 * (1 - fem);                                                   // arcada da sobrancelha
    if (Math.abs(y + 0.02) < 0.05 && front > 0.5 && Math.abs(x) > 0.08) z += 0.008;                                    // maçãs do rosto
    if (z < 0) z *= 0.92;                                                                                               // nuca
    p.setXYZ(i, x * 0.95, y * 1.17, z);
    // barba por cor de vértice
    let c = skinC.clone();
    const sm = (a, b, v) => { const k = Math.max(0, Math.min(1, (v - a) / (b - a))); return k * k * (3 - 2 * k); };
    const lowerK = sm(-0.02, -0.09, y) * sm(0.1, 0.45, front), lower = lowerK > 0.5;
    const chin = y < -0.1 && Math.abs(x) < 0.09 && front > 0.6, lip = y > -0.07 && y < -0.045 && Math.abs(x) < 0.06 && front > 0.85;
    if (o.beard === 'stubble') c.lerp(beardC, Math.max(lowerK * 0.5, lip ? 0.4 : 0));
    if (o.beard === 'goatee') c.lerp(beardC, Math.max(sm(0.11, 0.06, Math.abs(x)) * sm(-0.08, -0.13, y) * sm(0.4, 0.7, front) * 0.9, lip ? 0.8 : 0));
    // volume pintado: órbitas, sombra do nariz, bochechas rosadas, nariz, sob o queixo
    const red = new THREE.Color(0xd06060), dark = skinC.clone().multiplyScalar(0.62);
    const eyeD = Math.hypot(Math.abs(x) - 0.08, y - 0.03);
    if (front > 0.6) c.lerp(dark, sm(0.075, 0.035, eyeD) * 0.45);
    const cheekD = Math.hypot(Math.abs(x) - 0.12, y + 0.045);
    if (front > 0.4) c.lerp(red, sm(0.07, 0.0, cheekD) * 0.18);
    if (front > 0.85 && Math.abs(x) < 0.05 && y < -0.02 && y > -0.07) c.lerp(dark, 0.25);
    if (y < -0.15) c.lerp(dark, sm(-0.15, -0.2, y) * 0.5);
    if (o.beard === 'full' && (lower || lip)) c.lerp(beardC, 0.95);
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  add(g, geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), 0, 0, 0);
  const skin = smat(skinC.getHex());
  add(g, new THREE.CapsuleGeometry(0.1, 0.12, 6, 12), skin, 0, -0.27, -0.02);           // pescoço

  // nariz
  const nose = add(g, new THREE.CapsuleGeometry(0.028, 0.07, 6, 10), skin, 0, -0.005, 0.245); nose.rotation.x = -0.35;
  add(g, new THREE.SphereGeometry(0.035, 12, 10), skin, 0, -0.045, 0.262).scale.set(1.25, 0.8, 0.9);
  // orelhas
  for (const s of [-1, 1]) add(g, new THREE.SphereGeometry(0.05, 12, 10), skin, s * 0.245, 0.0, -0.01).scale.set(0.45, 1, 0.8);

  // olhos: branco + íris + pupila + brilho; pálpebras que fecham
  const lids = [], eyes = [];
  for (const s of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(s * 0.078, 0.035, 0.2); g.add(eye); eyes.push(eye);
    add(eye, new THREE.SphereGeometry(0.045, 24, 18), smat(0xf6f2ea, { roughness: 0.25 }));
    add(eye, new THREE.CircleGeometry(0.028, 24), smat(o.eyes ?? 0x2a5a9a, { roughness: 0.3 }), 0, 0, 0.0442);
    add(eye, new THREE.CircleGeometry(0.013, 16), smat(0x050505), 0, 0, 0.0446);
    add(eye, new THREE.CircleGeometry(0.0065, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.01, 0.011, 0.0449);
    const lid = new THREE.Group(); lid.position.copy(eye.position); g.add(lid);
    const shell = add(lid, new THREE.SphereGeometry(0.049, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), skin); shell.rotation.x = -0.25;
    lids.push(lid);
    // sobrancelha
    const brow = add(g, new THREE.CapsuleGeometry(0.014, 0.065, 4, 8), smat(o.hair ?? 0x2a1a12, { roughness: 0.9 }), s * 0.082, 0.1, 0.226);
    brow.rotation.z = Math.PI / 2 + s * (o.brow ?? 0.18); brow.scale.set(1, 1, 0.8);
  }
  // boca: interior escuro + lábios; o lábio de baixo desce com a fala
  const mouth = new THREE.Group(); mouth.position.set(0, -0.11, 0.222); g.add(mouth);
  const inside = add(mouth, new THREE.SphereGeometry(0.035, 16, 10), smat(0x3a1212), 0, -0.005, -0.008); inside.scale.set(1.6, 0.18, 0.5);
  const lipC = skinC.clone().lerp(new THREE.Color(0xb05050), 0.35).getHex();
  const upper = add(mouth, new THREE.CapsuleGeometry(0.012, 0.07, 4, 8), smat(lipC), 0, 0.012, 0.004); upper.rotation.z = Math.PI / 2;
  const lower = add(mouth, new THREE.CapsuleGeometry(0.014, 0.062, 4, 8), smat(lipC), 0, -0.015, 0.002); lower.rotation.z = Math.PI / 2;
  if (o.scar) add(mouth, new THREE.BoxGeometry(0.008, 0.02, 0.01), smat(0xa01818), -0.03, -0.018, 0.012);

  // ---- cabelo ----
  const hairM = smat(o.hair ?? 0x2a1a12, { roughness: 0.85 });
  const R = rand(o.seed ?? 5);
  const style = o.hairStyle ?? 'curly';
  if (style === 'curly') {
    add(g, new THREE.SphereGeometry(0.262, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM, 0, 0.05, -0.02).rotation.x = -0.42;
    for (let i = 0; i < 46; i++) {
      const a = R() * Math.PI * 2, el = 0.25 + R() * 0.95;            // distribui na calota
      const r = 0.26, x = Math.cos(a) * Math.sin(el) * r, y = Math.cos(el) * r * 1.1 + 0.04, z = Math.sin(a) * Math.sin(el) * r;
      if (z > 0.1 && y < 0.22) continue;                               // não cobre a testa/rosto
      add(g, new THREE.SphereGeometry(0.045 + R() * 0.025, 10, 8), hairM, x, y + 0.02, z - 0.01);
    }
    for (const s of [-1, 1]) add(g, new THREE.SphereGeometry(0.1, 12, 10), hairM, s * 0.2, 0.06, -0.04).scale.set(0.35, 0.8, 1.1); // laterais baixas
  } else if (style === 'slick') {
    add(g, new THREE.SphereGeometry(0.266, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM, 0, 0.05, -0.025).rotation.x = -0.45;
    for (let i = 0; i < 7; i++) { const st = add(g, new THREE.CapsuleGeometry(0.03, 0.3, 4, 8), hairM, -0.15 + i * 0.05, 0.25 - Math.abs(i - 3) * 0.012, -0.02); st.rotation.x = Math.PI / 2 + 0.35; }
  } else if (style === 'long') {
    add(g, new THREE.SphereGeometry(0.268, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, 0, 0.05, -0.02).rotation.x = -0.4;
    const back = add(g, new THREE.CapsuleGeometry(0.17, 0.32, 6, 14), hairM, 0, -0.17, -0.12); back.scale.set(1.35, 1, 0.55);
    for (const s of [-1, 1]) add(g, new THREE.CapsuleGeometry(0.05, 0.25, 4, 10), hairM, s * 0.22, -0.08, 0.03);
  } else if (style === 'bald') {
    for (const s of [-1, 1]) add(g, new THREE.SphereGeometry(0.1, 12, 10), hairM, s * 0.22, 0.0, -0.08).scale.set(0.4, 0.7, 1.2);
  } else if (style === 'mohawk') {
    for (let i = 0; i < 7; i++) add(g, new THREE.SphereGeometry(0.05, 10, 8), hairM, 0, 0.27 - Math.abs(i - 3) * 0.012, 0.15 - i * 0.055).scale.set(0.6, 1.4, 1);
  }
  if (o.beard === 'full') {
    const b = add(g, new THREE.SphereGeometry(0.17, 20, 14), smat(beardC.getHex(), { roughness: 0.9 }), 0, -0.2, 0.1); b.scale.set(1.25, 1.1, 0.8);
    add(g, new THREE.CapsuleGeometry(0.018, 0.09, 4, 8), smat(beardC.getHex()), 0, -0.085, 0.245).rotation.z = Math.PI / 2; // bigode
  }
  if (o.beard === 'stubble' || o.beard === 'goatee') {
    const m = add(g, new THREE.CapsuleGeometry(0.008, 0.07, 4, 8), smat(beardC.getHex(), { roughness: 0.9 }), 0, -0.088, 0.244); m.rotation.z = Math.PI / 2; // bigode fino
  }

  g.traverse((x) => { if (x.isMesh) x.castShadow = true; });
  for (const l of lids) l.children[0].rotation.x = -1.55;
  return {
    group: g,
    setMouth(v) { v = Math.max(0, Math.min(1, v)); inside.scale.y = 0.18 + v * 0.9; lower.position.y = -0.014 - v * 0.03; },
    setBlink(v) { for (const l of lids) l.children[0].rotation.x = -1.55 + Math.max(0, Math.min(1, v)) * 2.95; },
    look(yaw = 0, pitch = 0) { for (const e of eyes) e.rotation.set(pitch, yaw, 0); },
  };
}

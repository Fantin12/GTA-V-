// A Coroa de Varnor — EP1 "O Portão" — cena 3D low-poly feita 100% por código.
// window.renderAt(t) desenha o quadro exato do segundo t (render determinístico).
import * as THREE from 'three';
import { makeHero, makeCat, makeMonster, makeVillager, mat, rand } from './personagens.js';

const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1530);
scene.fog = new THREE.FogExp2(0x16234a, 0.028);
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);

// ---------- luz ----------
scene.add(new THREE.HemisphereLight(0x6a86d0, 0x2a1a0c, 0.9));
const moon = new THREE.DirectionalLight(0xb0c4ff, 1.6);
moon.position.set(-7, 12, -16);   // lua na frente do herói (lado da floresta)
const key = new THREE.PointLight(0xffa050, 14, 9, 1.5); key.position.set(1.6, 2.4, -5.0); scene.add(key); // tocha/fogo no rosto
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 });
scene.add(moon);

// ---------- chão ----------
const R = rand(42);
const groundGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
groundGeo.rotateX(-Math.PI / 2);
const gp = groundGeo.attributes.position;
for (let i = 0; i < gp.count; i++) {
  const x = gp.getX(i), z = gp.getZ(i);
  const road = Math.abs(x) < 1.6 ? 0 : 1;
  gp.setY(i, road * (R() * 0.25) + (z < -14 ? (-z - 14) * 0.35 : 0));
}
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, mat(0x23301c));
ground.receiveShadow = true;
scene.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 60), mat(0x4a3a28));
road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, 0); road.receiveShadow = true;
scene.add(road);

// ---------- portão + paliçada (z = 0) ----------
const wood = mat(0x5b3a22), woodDark = mat(0x3d2716), iron = mat(0x2b2b30);
function box(w, h, d, m, x, y, z, parent = scene) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b;
}
box(0.5, 4.2, 0.5, woodDark, -2.1, 2.1, 0);
box(0.5, 4.2, 0.5, woodDark, 2.1, 2.1, 0);
box(5.0, 0.45, 0.6, woodDark, 0, 4.0, 0);
box(5.4, 0.25, 1.0, wood, 0, 4.35, 0);
// portas abertas
for (const s of [-1, 1]) {
  const door = new THREE.Group();
  for (let i = 0; i < 4; i++) box(0.42, 3.4, 0.12, i % 2 ? wood : woodDark, s * (0.25 + i * 0.44), 1.75, 0, door);
  box(1.8, 0.18, 0.16, iron, s * 0.9, 2.7, 0.06, door);
  box(1.8, 0.18, 0.16, iron, s * 0.9, 0.9, 0.06, door);
  door.position.set(s * 1.85, 0, 0); door.rotation.y = s * -1.25;
  scene.add(door);
}
// paliçada com pontas
for (const s of [-1, 1]) for (let i = 0; i < 16; i++) {
  const x = s * (2.6 + i * 0.42), h = 2.6 + R() * 0.5;
  box(0.36, h, 0.36, i % 2 ? wood : woodDark, x, h / 2, R() * 0.1);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 4), woodDark);
  tip.position.set(x, h + 0.25, 0); tip.castShadow = true; scene.add(tip);
}

// ---------- vila em chamas (atrás do herói: z negativo... vila fica em z > 0) ----------
// Convenção: monstros vêm de z negativo (floresta); vila fica em z positivo, atrás da câmera inicial? Não:
// o herói está em z=-1.5 olhando para -z (floresta). Câmera inicial em -z olhando o herói => vila aparece atrás dele.
const fires = [];
const houseCols = [0x8a6a4a, 0x7a5c40, 0x95764f];
function house(x, z, rot, burning) {
  const g = new THREE.Group();
  box(2.4, 1.8, 2.0, mat(houseCols[Math.floor(R() * 3)]), 0, 0.9, 0, g);
  box(0.12, 1.8, 2.05, woodDark, -1.15, 0.9, 0, g); box(0.12, 1.8, 2.05, woodDark, 1.15, 0.9, 0, g);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.3, 4), mat(0x3a2418));
  roof.position.y = 2.45; roof.rotation.y = Math.PI / 4; roof.scale.set(1.0, 1, 0.85); roof.castShadow = true; g.add(roof);
  const win = box(0.4, 0.4, 0.05, new THREE.MeshBasicMaterial({ color: 0xffa040 }), 0.5, 1.1, 1.02, g);
  g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  if (burning) {
    const light = new THREE.PointLight(0xff7a22, 30, 14, 1.6);
    light.position.set(x, 3.2, z); scene.add(light);
    const flames = [];
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.35 + R() * 0.3, 1.2 + R() * 1.2, 5),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffb020 : 0xff5a10, transparent: true, opacity: 0.9 }));
      f.position.set(x + (R() - 0.5) * 1.8, 2.6 + R() * 0.6, z + (R() - 0.5) * 1.4);
      f.userData = { ph: R() * 10, base: f.scale.clone(), y: f.position.y };
      scene.add(f); flames.push(f);
    }
    fires.push({ light, flames, ph: R() * 10 });
  }
}
house(-4.5, 5, 0.3, true); house(4.8, 6, -0.4, true); house(-1.5, 9, 0.1, true);
house(6.5, 11, 0.6, false); house(-6.8, 10, -0.5, true); house(2.5, 13, 0.2, true);

// brasas subindo
const EMB = 260, embGeo = new THREE.BufferGeometry(), embBase = [];
for (let i = 0; i < EMB; i++) embBase.push([(R() - 0.5) * 18, R() * 8, 3 + R() * 12, 0.4 + R() * 0.8, R() * 10]);
embGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(EMB * 3), 3));
const embers = new THREE.Points(embGeo, new THREE.PointsMaterial({ color: 0xff9a3a, size: 0.09, transparent: true, opacity: 0.95 }));
scene.add(embers);

// ---------- floresta + morro (z negativo) ----------
for (let i = 0; i < 70; i++) {
  const x = (R() - 0.5) * 40, z = -16 - R() * 18;
  if (Math.abs(x) < 3 && z > -22) continue;
  const t = new THREE.Group();
  box(0.3, 1.2, 0.3, woodDark, 0, 0.6, 0, t);
  for (let k = 0; k < 3; k++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.3 - k * 0.3, 1.6, 6), mat(k % 2 ? 0x16301f : 0x10261a));
    c.position.y = 1.6 + k * 0.9; c.castShadow = true; t.add(c);
  }
  t.position.set(x, (-z - 14) * 0.35, z); t.scale.setScalar(1.2 + R() * 1.2); scene.add(t);
}

// olhos vermelhos escondidos na floresta
const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2020 });
const forestEyes = [];
for (let i = 0; i < 40; i++) {
  const x = (R() - 0.5) * 22, z = -17 - R() * 10, y = (-z - 14) * 0.35 + 0.8 + R() * 1.8;
  const pair = new THREE.Group();
  for (const s of [-0.09, 0.09]) { const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), eyeMat); e.position.x = s; pair.add(e); }
  pair.position.set(x, y, z); pair.userData.ph = R() * 10; scene.add(pair); forestEyes.push(pair);
}
// aldeões fugindo pela estrada (do portão para a vila)
const villagers = [];
for (let i = 0; i < 12; i++) {
  const v = makeVillager(R); v.x = (R() - 0.5) * 2.4; v.t0 = R() * 2.2; v.sp = 3 + R() * 1.2;
  scene.add(v.group); villagers.push(v);
}

// ---------- personagens ----------
const hero = makeHero();
hero.group.position.set(0, 0, -2.2);
hero.group.rotation.y = Math.PI; // olhando para a floresta (-z)
scene.add(hero.group);

const cat = makeCat();
cat.group.position.set(-0.62, 0, -1.7);
cat.group.rotation.y = Math.PI - 0.5;
scene.add(cat.group);

const monsters = [];
for (let i = 0; i < 34; i++) {
  const m = makeMonster(R);
  const row = Math.floor(i / 7);
  m.start = new THREE.Vector3((R() - 0.5) * 12, 0, -17 - row * 2.6 - R() * 2);
  m.speed = 1.3 + R() * 0.5; m.ph = R() * 10;
  scene.add(m.group); monsters.push(m);
}
function groundY(z) { return z < -14 ? (-z - 14) * 0.35 : 0; }

// faíscas do escudo
const SPK = 120, spkGeo = new THREE.BufferGeometry(), spkDir = [];
for (let i = 0; i < SPK; i++) {
  const a = R() * Math.PI * 2, up = 2 + R() * 5, out = 1.5 + R() * 4;
  spkDir.push([Math.cos(a) * out, up, Math.sin(a) * out * 0.6]);
}
spkGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(SPK * 3), 3));
const sparks = new THREE.Points(spkGeo, new THREE.PointsMaterial({ color: 0xffd060, size: 0.07, transparent: true }));
scene.add(sparks);
const slamLight = new THREE.PointLight(0xffb040, 0, 8, 1.5); scene.add(slamLight);
const hillLight = new THREE.PointLight(0x7f9cff, 0, 26, 1.2); hillLight.position.set(1, 7, -13); scene.add(hillLight); // luar no morro (tomada 2)

// ---------- linha do tempo ----------
export const DUR = 15.0;
const SLAM = 9.55;     // "ninguém passava"
// tomadas (segundos da narração)
const SHOTS = [0, 3.0, 6.0, 8.75, 11.4, 15.0];
const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);

function update(t) {
  // fogo
  for (const f of fires) {
    f.light.intensity = 26 + 10 * Math.sin(t * 13 + f.ph) * Math.sin(t * 7.3 + f.ph * 2);
    for (const fl of f.flames) {
      const s = 1 + 0.25 * Math.sin(t * 11 + fl.userData.ph);
      fl.scale.set(s, 1 + 0.35 * Math.sin(t * 9 + fl.userData.ph * 1.7), s);
      fl.rotation.y = t * 1.5 + fl.userData.ph;
    }
  }
  const ep = embGeo.attributes.position;
  embBase.forEach(([x, y, z, sp, ph], i) => {
    const yy = (y + t * sp * 1.6) % 9;
    ep.setXYZ(i, x + Math.sin(t * 1.3 + ph) * 0.6, yy, z + Math.cos(t + ph) * 0.4);
  });
  ep.needsUpdate = true;

  // herói: respira, ergue escudo, bate no chão
  hero.pose(t, SLAM);
  cat.pose(t);

  // monstros avançam (param antes do portão)
  for (const m of monsters) {
    const z = Math.min(m.start.z + Math.max(0, t - 2.6) * m.speed, -8.8 - Math.abs(m.start.x) * 0.25);
    m.group.position.set(m.start.x, groundY(z), z);
    m.pose(t + m.ph, z < -6.05);
  }

  // faíscas
  const st = t - SLAM, sp = spkGeo.attributes.position;
  const sx = hero.group.position.x - 0.35, sz = hero.group.position.z - 0.55;
  for (let i = 0; i < SPK; i++) {
    const [dx, dy, dz] = spkDir[i];
    if (st < 0 || st > 1.2) { sp.setXYZ(i, 0, -50, 0); continue; }
    sp.setXYZ(i, sx + dx * st, Math.max(0.02, dy * st - 4.9 * st * st), sz + dz * st);
  }
  sp.needsUpdate = true;
  sparks.material.opacity = st < 0 ? 0 : Math.max(0, 1 - st / 1.2);
  slamLight.position.set(sx, 0.5, sz);
  slamLight.intensity = st < 0 ? 0 : 60 * Math.exp(-st * 4);

  // aldeões
  for (const v of villagers) {
    const z = -1.6 + Math.max(0, t - v.t0) * v.sp;
    v.group.visible = t < SHOTS[1] && z < 14;
    v.group.position.set(v.x + Math.sin(z * 0.7 + v.x) * 0.3, 0, z);
    v.pose(t + v.t0 * 3);
  }
  hillLight.intensity = (t >= SHOTS[1] && t < SHOTS[2]) ? 55 : 0;
  for (const e of forestEyes) e.visible = Math.sin(t * 1.7 + e.userData.ph) > -0.85; // piscam

  // câmera por tomada
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const lerpV = (a, b, k) => a.clone().lerp(b, ease(k));
  let pos, look;
  if (t < SHOTS[1]) {            // 1: todo mundo fugiu — de trás/alto, aldeões vindo na direção da câmera
    const k = t / SHOTS[1];
    pos = lerpV(V(1.1, 2.0, 4.6), V(0.9, 1.8, 3.4), k); look = V(0, 1.5, -2.2);
  } else if (t < SHOTS[2]) {     // 2: criaturas descendo — da estrada olhando pro morro
    const k = (t - SHOTS[1]) / (SHOTS[2] - SHOTS[1]);
    pos = lerpV(V(-1.5, 1.6, -7.5), V(-0.8, 1.9, -9.5), k); look = lerpV(V(0, 3.2, -20), V(0, 2.6, -16), k);
  } else if (t < SHOTS[3]) {     // 3: um guarda... e o gato dele (rosto -> desce pro gato)
    const k = (t - SHOTS[2]) / (SHOTS[3] - SHOTS[2]);
    const kk = Math.max(0, (k - 0.5) / 0.5);
    pos = lerpV(V(-0.35, 2.0, -4.4), V(-0.95, 0.75, -3.4), kk); look = lerpV(V(-0.1, 1.95, -2.2), V(-0.62, 0.3, -1.7), kk);
  } else if (t < SHOTS[4]) {     // 4: ninguém passa — contra-plongée, batida do escudo
    const k = (t - SHOTS[3]) / (SHOTS[4] - SHOTS[3]);
    pos = lerpV(V(1.9, 0.55, -5.6), V(1.5, 0.6, -5.0), k); look = V(-0.2, 1.4, -2.2);
  } else if (t < 12.9) {         // 5a: ele não fugiu — rosto firme
    const k = (t - SHOTS[4]) / (12.9 - SHOTS[4]);
    pos = lerpV(V(0.5, 1.75, -5.2), V(0.4, 1.8, -4.4), k); look = V(0, 1.75, -2.2);
  } else {                       // 5b: ele ficou — de costas, a horda à frente
    const k = (t - 12.9) / (SHOTS[5] - 12.9);
    pos = lerpV(V(0.7, 2.7, 2.4), V(0.5, 2.4, 1.3), k); look = V(0, 1.3, -8);
  }
  camera.position.copy(pos);
  const sh = st > 0 ? 0.12 * Math.exp(-st * 5) : 0;
  camera.position.x += sh * Math.sin(t * 90); camera.position.y += sh * Math.cos(t * 77);
  camera.lookAt(look);
}

window.DUR = DUR;
window.renderAt = (t) => { update(t); renderer.render(scene, camera); return true; };
window.ready = true;

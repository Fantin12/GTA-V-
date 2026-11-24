// A Coroa de Varnor — EP2 "O Escudo Rachado" — amanhecer depois da batalha.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makeHero, makeCat, makeMonster, makeVillager, mat, rand } from './personagens.js';
import { makeDraven, makeHorse, makeElfoCinza } from './personagens_mmo.js';
import { makeComposer } from './posfx.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1080, H = 1920, SS = 1.5;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(SS);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xb09088, 0.018);                      // névoa da manhã
const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 300);
// reflexos de ambiente: faz o metal das armaduras brilhar em vez de ficar preto
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const R = rand(77);

// ---------- céu de amanhecer (gradiente) ----------
{
  const g = new THREE.SphereGeometry(200, 32, 16), cols = [], p = g.attributes.position;
  const top = new THREE.Color(0x3a5a9a), mid = new THREE.Color(0xe8a070), low = new THREE.Color(0xffd0a0);
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 200, c = y > 0.15 ? mid.clone().lerp(top, Math.min(1, (y - 0.15) / 0.5)) : low.clone().lerp(mid, Math.max(0, (y + 0.1) / 0.25));
    cols.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false })));
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.2, 1.2), fog: false }));
  sunDisc.position.set(60, 22, -180); sunDisc.lookAt(0, 0, 0); scene.add(sunDisc);
}

// ---------- luz ----------
scene.add(new THREE.HemisphereLight(0xa8bce8, 0x4a3a2a, 1.0));
const sun = new THREE.DirectionalLight(0xffb27a, 3.2);
sun.position.set(12, 7, -22); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 80 }); scene.add(sun);
const fill = new THREE.DirectionalLight(0x9ab0ff, 0.6); fill.position.set(-6, 5, 10); scene.add(fill);

// ---------- chão ----------
const groundY = (x, z) => (z < -14 ? (-z - 14) * 0.35 : 0) + (z > 30 ? (z - 30) * 0.25 : 0);
const groundGeo = new THREE.PlaneGeometry(120, 160, 60, 80); groundGeo.rotateX(-Math.PI / 2);
const gp = groundGeo.attributes.position, gcol = [];
for (let i = 0; i < gp.count; i++) {
  const x = gp.getX(i), z = gp.getZ(i), road = Math.abs(x) < 1.6 && z < 30 ? 0 : 1, v = R();
  gp.setY(i, road * R() * 0.25 + groundY(x, z) + (Math.abs(x + 26) < 9 && z > 30 ? Math.max(0, 6 - Math.hypot(x + 26, z - 48) * 0.5) : 0));
  const c = new THREE.Color().setHSL(0.22 + v * 0.06, 0.3 + v * 0.15, 0.16 + v * 0.06); gcol.push(c.r, c.g, c.b);
}
groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(gcol, 3)); groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
ground.position.z = 20; ground.receiveShadow = true; scene.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 46), mat(0x6a5238)); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.03, 8); road.receiveShadow = true; scene.add(road);

const wood = mat(0x6b4a2c), woodDark = mat(0x4a301c), burnt = mat(0x1e1814), iron = mat(0x2b2b30);
function box(w, h, d, m, x, y, z, parent = scene) {
  const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * 0.15), m);
  b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b;
}
// grama e pedras
{
  const N = 3200, grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.05, 0.4, 3), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), N);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(); let n = 0;
  while (n < N) {
    const x = (R() - 0.5) * 34, z = -13 + R() * 40; if (Math.abs(x) < 1.8) continue;
    q.setFromEuler(new THREE.Euler((R() - 0.5) * 0.5, R() * 3, (R() - 0.5) * 0.5)); const sc = 0.6 + R();
    m4.compose(new THREE.Vector3(x, 0.12, z), q, new THREE.Vector3(sc, sc, sc)); grass.setMatrixAt(n, m4);
    grass.setColorAt(n, c.setHSL(0.2 + R() * 0.08, 0.4, 0.18 + R() * 0.08)); n++;
  }
  grass.receiveShadow = true; scene.add(grass);
  for (let i = 0; i < 90; i++) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 + R() * 0.18, 0), mat(0x6a665e)); r.position.set((R() > 0.5 ? 1 : -1) * (1.4 + R() * 1.2), 0.04, -12 + R() * 34); r.rotation.set(R() * 3, R() * 3, R() * 3); r.scale.y = 0.6; r.castShadow = r.receiveShadow = true; scene.add(r); }
}

// ---------- portão (com marcas de batalha) e paliçada ----------
box(0.5, 4.2, 0.5, woodDark, -2.1, 2.1, 0); box(0.5, 4.2, 0.5, woodDark, 2.1, 2.1, 0);
box(5.0, 0.45, 0.6, woodDark, 0, 4.0, 0); box(5.4, 0.25, 1.0, wood, 0, 4.35, 0);
for (const s of [-1, 1]) {
  const door = new THREE.Group();
  for (let i = 0; i < 4; i++) box(0.42, 3.4, 0.12, i % 2 ? wood : woodDark, s * (0.25 + i * 0.44), 1.75, 0, door);
  box(1.8, 0.18, 0.16, iron, s * 0.9, 2.7, 0.06, door); box(1.8, 0.18, 0.16, iron, s * 0.9, 0.9, 0.06, door);
  for (let k = 0; k < 4; k++) { const sc = box(0.5, 0.05, 0.03, burnt, s * (0.6 + R()), 1 + R() * 2, -0.08, door); sc.rotation.z = R() * 2; } // arranhões
  door.position.set(s * 1.85, 0, 0); door.rotation.y = s * -1.25; scene.add(door);
}
for (const s of [-1, 1]) for (let i = 0; i < 16; i++) {
  const x = s * (2.6 + i * 0.42), h = 2.6 + R() * 0.5, broken = R() < 0.15;
  box(0.36, broken ? h * 0.5 : h, 0.36, i % 2 ? wood : woodDark, x, (broken ? h * 0.5 : h) / 2, R() * 0.1);
  if (!broken) { const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 4), woodDark); tip.position.set(x, h + 0.25, 0); tip.castShadow = true; scene.add(tip); }
}

// ---------- vila: casas queimadas fumegando + intactas ----------
function softTex(inner, outer) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const smokeMat = new THREE.SpriteMaterial({ map: softTex('rgba(90,84,84,0.6)', 'rgba(70,66,70,0)'), depthWrite: false });
const smokes = [];
function house(x, z, rot, burned) {
  const g = new THREE.Group();
  box(2.4, burned ? 1.3 : 1.8, 2.0, burned ? burnt : mat([0x9a7a5a, 0x8a6c50, 0xa5866a][Math.floor(R() * 3)]), 0, burned ? 0.65 : 0.9, 0, g);
  box(0.12, 1.8, 2.05, woodDark, -1.15, 0.9, 0, g); box(0.12, burned ? 1.1 : 1.8, 2.05, burned ? burnt : woodDark, 1.15, burned ? 0.55 : 0.9, 0, g);
  if (!burned) { const roof = new THREE.Mesh(new THREE.ConeGeometry(1.95, 1.3, 4), mat(0x5a3424)); roof.position.y = 2.45; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85); roof.castShadow = true; g.add(roof); }
  else for (let k = 0; k < 4; k++) { const b = box(0.12, 1.4, 0.12, burnt, -0.9 + k * 0.6, 1.6, (R() - 0.5), g); b.rotation.z = (R() - 0.5) * 1.2; } // vigas carbonizadas
  g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  if (burned) for (let i = 0; i < 6; i++) { const sp = new THREE.Sprite(smokeMat.clone()); sp.userData = { x: x + (R() - 0.5), z, ph: R(), sp: 0.4 + R() * 0.3 }; scene.add(sp); smokes.push(sp); }
}
house(-4.5, 5, 0.3, true); house(4.8, 6, -0.4, true); house(-1.5, 9.5, 0.1, false); house(6.5, 11, 0.6, false);
house(-6.8, 10, -0.5, true); house(2.8, 13.5, 0.2, false); house(-4, 15, 0.4, false); house(5, 17, -0.2, false);

// ---------- castelo de Pedravale ao longe (no morro) ----------
const castle = new THREE.Group();
{
  const stone = mat(0x7a7480), stoneDk = mat(0x5a5460), roofM = mat(0x22222c);
  box(9, 3, 0.8, stone, 0, 1.5, -3, castle); box(9, 3, 0.8, stone, 0, 1.5, 3, castle); box(0.8, 3, 6, stone, -4.5, 1.5, 0, castle); box(0.8, 3, 6, stone, 4.5, 1.5, 0, castle);
  for (const [x, z] of [[-4.5, -3], [4.5, -3], [-4.5, 3], [4.5, 3]]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 5, 8), stoneDk); t.position.set(x, 2.5, z); t.castShadow = true; castle.add(t);
    const r = new THREE.Mesh(new THREE.ConeGeometry(1.15, 1.8, 8), roofM); r.position.set(x, 5.9, z); castle.add(r);
  }
  box(3.5, 6, 3, stone, 0, 3, 0, castle);
  const kr = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.5, 4), roofM); kr.position.set(0, 7.2, 0); kr.rotation.y = Math.PI / 4; castle.add(kr);
  const flag = box(1.2, 0.8, 0.04, mat(0x101014, { side: THREE.DoubleSide }), 0.7, 9.0, 0, castle); box(0.06, 2, 0.06, iron, 0, 8.6, 0, castle);
  box(0.4, 0.3, 0.05, mat(0xc0c4cc, { metalness: 0.8 }), 0.7, 9.0, 0.03, castle);   // corvo prateado
  castle.userData.flag = flag;
}
castle.position.set(-26, 5.2, 68); castle.rotation.y = 0.5; scene.add(castle);

// ---------- floresta ----------
for (let i = 0; i < 70; i++) {
  const x = (R() - 0.5) * 44, z = -16 - R() * 18; if (Math.abs(x) < 3 && z > -22) continue;
  const t = new THREE.Group(); box(0.3, 1.2, 0.3, woodDark, 0, 0.6, 0, t);
  for (let k = 0; k < 3; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.3 - k * 0.3, 1.6, 6), mat(k % 2 ? 0x2a4a30 : 0x22402a)); c.position.y = 1.6 + k * 0.9; c.castShadow = true; t.add(c); }
  t.position.set(x, groundY(x, z), z); t.scale.setScalar(1.2 + R() * 1.2); scene.add(t);
}

// ---------- personagens ----------
const hero = makeHero({ cracked: true }); hero.group.position.set(0, 0, -2.2); hero.group.rotation.y = Math.PI; scene.add(hero.group);
const cat = makeCat(); scene.add(cat.group);
// monstros caídos espalhados à frente do portão
const fallen = [];
for (let i = 0; i < 16; i++) {
  const m = makeMonster(R); m.pose(0, false);
  m.group.traverse(o => { if (o.isMesh && o.material.isMeshBasicMaterial) o.material = mat(0x1a0808); }); // olhos apagados
  const sd = R() > 0.5 ? 1 : -1, x = sd * (1.3 + R() * 3.5), z = -3.6 - R() * 3.8;   // fora da estrada e longe da câmera
  m.group.position.set(x, 0.35, z); m.group.rotation.set(0, R() * 6, Math.PI / 2 * (R() > 0.5 ? 1 : -1));
  scene.add(m.group); fallen.push(m);
}
const catPerch = fallen[0]; catPerch.group.position.set(-1.4, 0.35, -4.2);
// aldeões saindo das casas e se juntando ao redor do herói
const villagers = [];
for (let i = 0; i < 16; i++) {
  const v = makeVillager(R);
  v.from = new THREE.Vector3((R() - 0.5) * 10, 0, 5 + R() * 10);
  let a = -0.3 + (i / 15) * (Math.PI + 0.6); if (Math.abs(Math.cos(a)) < 0.35) a += Math.cos(a) >= 0 ? -0.5 : 0.5; // deixa a estrada livre
  const r = 2.4 + R() * 0.8;
  v.to = new THREE.Vector3(Math.cos(a) * r, 0, -2.2 + Math.abs(Math.sin(a)) * r * 0.6 + 0.6);
  v.t0 = 5.6 + R() * 1.5; scene.add(v.group); villagers.push(v);
}
const horse = makeHorse(), draven = makeDraven({ mounted: true });
const rider = new THREE.Group(); rider.add(horse.group, draven.group); draven.group.position.y = 0.72; scene.add(rider);
const elfo = makeElfoCinza(); scene.add(elfo.group);

// ---------- linha do tempo (segundos da narração) ----------
export const DUR = 31.0;
const T = { recap: 0, pe: 3.0, vila: 6.0, lei: 8.0, defend: 12.0, lorde: 15.2, fala: 18.3, pensa: 24.0, gancho: 28.3, fim: 31.0 };
const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, k) => a.clone().lerp(b, ease(k));
const rel = (t, a, b) => (t - a) / (b - a);

function update(t) {
  for (const sp of smokes) {
    const u = (t * sp.userData.sp * 0.25 + sp.userData.ph) % 1;
    sp.position.set(sp.userData.x + u * 2.5 + Math.sin(u * 5) * 0.4, 1.4 + u * 9, sp.userData.z);
    sp.scale.setScalar(1 + u * 5); sp.material.opacity = Math.sin(u * Math.PI) * 0.7;
  }
  castle.userData.flag.rotation.y = 0.2 * Math.sin(t * 2);
  hero.pose(t, 999);
  hero.group.rotation.y = Math.PI - Math.PI * ease(rel(t, T.lorde + 1.2, T.lorde + 2.4)); // vira para encarar o lorde
  // Brasa lambendo a pata em cima de um monstro caído
  cat.group.position.set(-1.4, 0.72, -4.2); cat.group.rotation.y = 0.6; cat.pose(t * 0.3);
  // aldeões
  for (const v of villagers) {
    const k = Math.min(1, Math.max(0, (t - v.t0) / 4.5));
    v.group.visible = t > v.t0 - 0.01;
    const p = v.from.clone().lerp(v.to, ease(k)); v.group.position.copy(p);
    const dir = v.to.clone().sub(v.from); v.group.rotation.y = k < 1 ? Math.atan2(dir.x, dir.z) : Math.atan2(-p.x, -2.2 - p.z);
    v.pose(k < 1 ? t : 0, k < 1 ? 6 : 0);
  }
  // Draven chega pela estrada (vem da vila), aldeões abrem caminho
  const kr = Math.min(1, Math.max(0, (t - T.lorde + 0.5) / 4.0));
  let rz = 14 - 12.2 * ease(kr), rot = Math.PI + 0.75 * ease((kr - 0.6) / 0.4); // para meio de lado
  if (t > T.gancho) { rz = 1.8 + 6.2 * ease(rel(t, T.gancho, T.gancho + 1.6)); rot = 0; }  // vai embora e para no elfo
  rider.position.set(0.2, 0, rz); rider.rotation.y = rot;
  rider.visible = t > T.lorde - 0.5;
  const walking = (t > T.lorde - 0.5 && kr < 1) || (t > T.gancho && t < T.gancho + 1.6);
  horse.pose(t, walking ? 1 : 0); draven.pose(t);
  // Elfo de Cinza no gancho: espera na beira da estrada e estende o mapa
  elfo.group.visible = t > T.gancho;
  elfo.group.position.set(1.7, 0, 8.4); elfo.group.rotation.y = -Math.PI / 2;
  elfo.pose(t, ease(rel(t, T.gancho + 0.8, T.gancho + 1.8)));

  // ---------- câmera por tomada ----------
  let pos, look;
  if (t < T.vila) {                 // ainda de pé: frontal, câmera baixa subindo
    const k = rel(t, T.pe, T.vila);
    pos = lerpV(V(0.5, 1.0, -8.5), V(0.4, 1.7, -6.8), k); look = lerpV(V(0, 1.2, -2.2), V(0, 1.5, -2.2), k);
  } else if (t < T.lei) {           // a vila viu: por cima do ombro do herói, aldeões saindo
    const k = rel(t, T.vila, T.lei);
    pos = lerpV(V(-1.3, 2.9, -5.4), V(-1.1, 2.8, -4.8), k); look = V(0.5, 1.0, 6);
  } else if (t < T.defend) {        // lei do tributo: câmera sobe e mostra o castelo de Pedravale ao longe
    const k = rel(t, T.lei, T.defend);
    pos = lerpV(V(1.5, 2.5, -7), V(2.0, 5.5, -9), k); look = lerpV(V(0, 1.6, 2), V(-12, 6, 40), k);
  } else if (t < T.lorde) {         // Brejo Cinza se defendeu: a vila em volta do herói, de cima
    const k = rel(t, T.defend, T.lorde);
    const a = -Math.PI / 2 - 0.5 + k * 0.6;
    pos = V(Math.cos(a) * 7, 5 - k, -2.2 + Math.sin(a) * 7); look = V(0, 1.0, -1.0);
  } else if (t < T.fala) {          // o lorde chegou: câmera rente ao chão na estrada
    const k = rel(t, T.lorde, T.fala);
    pos = lerpV(V(0.0, 0.45, -1.0), V(0.0, 0.55, -0.5), k); look = V(0.2, 1.8, rz);
  } else if (t < T.pensa) {         // fala do Draven: de baixo pra cima (ponto de vista do herói)
    const k = rel(t, T.fala, T.pensa);
    pos = lerpV(V(-0.5, 1.15, -0.6), V(-0.45, 1.2, -0.25), k); look = V(0.3, 2.95, 1.8);
  } else if (t < T.gancho) {        // ele olhou pro lorde: close lento no rosto
    const k = rel(t, T.pensa, T.gancho);
    pos = lerpV(V(-0.15, 1.95, -0.1), V(-0.1, 1.9, -0.8), k); look = V(0, 1.88, -2.2);
  } else {                          // gancho: de longe, o elfo entrega o mapa ao lorde
    const k = rel(t, T.gancho, T.fim);
    pos = lerpV(V(-0.9, 1.5, 2.6), V(-0.8, 1.6, 3.4), k); look = V(1.0, 1.8, 8.3);
  }
  camera.position.copy(pos); camera.lookAt(look);
}

window.DUR = DUR;
const fx = makeComposer(renderer, scene, camera, W, H, SS, { bloom: 0.4 });
window.renderAt = (t) => { update(t); fx.render(t); return true; };
window.ready = true;

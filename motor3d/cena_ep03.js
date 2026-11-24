// A Coroa de Varnor — EP3 "A Promessa" (1 minuto) — a forja do Bram. Personagens v2 com boca sincronizada.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeCat, rand } from './personagens.js';
import { makeHeroV2, makeBramV2, makeVillagerV2 } from './personagens_v2.js';
import { smat } from './rosto.js';
import { makeComposer } from './posfx.js';

const W = 1080, H = 1920, SS = 1.5, FPS = 30;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(SS);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07060a);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.25;
scene.fog = new THREE.FogExp2(0x120c0a, 0.035);
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 100);
const R = rand(303);
const lip = await (await fetch('/lipsync_ep03.json')).json();
const mouthOf = (who, t) => { const a = lip[who]; if (!a) return 0; const i = Math.floor(t * FPS); return a[Math.min(a.length - 1, Math.max(0, i))] || 0; };

function box(w, h, d, m, x, y, z, parent = scene, r = 0.12) {
  const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(w, h, d) * r), m);
  b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b;
}
const stone = smat(0x4a4440, { roughness: 0.95 }), stoneDk = smat(0x2e2a28, { roughness: 1 }), wood = smat(0x5a3a22, { roughness: 0.85 }), woodDk = smat(0x3a2414), iron = smat(0x2a2a2e, { metalness: 0.7, roughness: 0.45 });

// ---------- sala da forja (x: -4..4, z: -3.5..3.5) ----------
box(9, 0.2, 8, stoneDk, 0, -0.1, 0);                                   // piso
for (let i = 0; i < 60; i++) box(0.5 + R() * 0.3, 0.03, 0.5 + R() * 0.3, R() > 0.5 ? stone : stoneDk, -4 + R() * 8, 0.01, -3.5 + R() * 7, scene, 0.3); // lajotas
box(9, 4.5, 0.3, wood, 0, 2.25, -3.6);                                 // parede do fundo
box(0.3, 4.5, 8, wood, -4.1, 2.25, 0);                                 // parede esquerda
box(0.3, 4.5, 3.6, wood, 4.1, 2.25, -1.8); box(0.3, 4.5, 3.4, wood, 4.1, 2.25, 2.3);          // parede direita: lados da janela
box(0.3, 1.75, 1.0, wood, 4.1, 0.875, 0.5); box(0.3, 1.65, 1.0, wood, 4.1, 3.67, 0.5);          // abaixo e acima da janela
for (let i = 0; i < 9; i++) box(0.18, 4.5, 0.1, woodDk, -4 + i, 2.25, -3.42);   // ripas
for (let k = 0; k < 4; k++) box(9, 0.22, 0.25, woodDk, 0, 4.2, -3 + k * 2);    // vigas do teto
// janela na parede direita (luz de dia/noite passa por ela)
const winMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.15, 0.2, 0.45) });
const win = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), winMat); win.position.set(8, 2.3, 0.5); win.rotation.y = -Math.PI / 2; scene.add(win);   // céu lá fora
box(0.08, 1.1, 0.08, woodDk, 4.1, 2.3, 0.5); box(0.08, 0.08, 1.0, woodDk, 4.1, 2.3, 0.5);
const winLight = new THREE.DirectionalLight(0x8aa0ff, 0.6); winLight.position.set(9, 4, 0.6); winLight.target.position.set(0, 0, 0.6); scene.add(winLight, winLight.target);

// forja: bloco de pedra, brasas brilhando, chaminé
box(2.2, 1.0, 1.4, stone, -2.2, 0.5, -2.7); box(2.4, 0.15, 1.6, stoneDk, -2.2, 1.05, -2.7);
const coalMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 1.4, 0.25) });
const coals = [];
for (let i = 0; i < 26; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 + R() * 0.05, 0), coalMat); c.position.set(-2.2 + (R() - 0.5) * 1.4, 1.17, -2.7 + (R() - 0.5) * 0.9); scene.add(c); coals.push(c); }
box(1.6, 3.2, 1.0, stoneDk, -2.2, 2.7, -3.0);                          // chaminé
const forgeLight = new THREE.PointLight(0xff8a3a, 22, 12, 1.4); forgeLight.position.set(-2.2, 1.6, -2.2);
forgeLight.castShadow = true; forgeLight.shadow.mapSize.set(1024, 1024); forgeLight.shadow.bias = -0.002; scene.add(forgeLight);
// bigorna
const anvil = new THREE.Group(); anvil.position.set(-0.3, 0, -0.8); scene.add(anvil);
box(0.5, 0.45, 0.4, woodDk, 0, 0.22, 0, anvil); box(0.3, 0.3, 0.25, iron, 0, 0.6, 0, anvil); box(0.9, 0.18, 0.32, iron, 0, 0.82, 0, anvil);
const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 12), iron); horn.rotation.z = Math.PI / 2; horn.position.set(0.62, 0.84, 0); horn.castShadow = true; anvil.add(horn);
// barril de têmpera, ferramentas, banco, baú com gaveta
const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.8, 20), wood); barrel.position.set(1.2, 0.4, -2.6); barrel.castShadow = true; scene.add(barrel);
const water = new THREE.Mesh(new THREE.CircleGeometry(0.32, 20), smat(0x1a2a3a, { roughness: 0.1, metalness: 0.3 })); water.rotation.x = -Math.PI / 2; water.position.set(1.2, 0.78, -2.6); scene.add(water);
for (let i = 0; i < 5; i++) { box(0.05, 0.6, 0.05, woodDk, 0.0 + i * 0.35, 2.4, -3.38); box(0.22, 0.1, 0.1, iron, 0.0 + i * 0.35, 2.75, -3.36); }  // martelos na parede
box(1.4, 0.1, 0.4, wood, 2.0, 0.5, 1.2); box(0.1, 0.5, 0.35, woodDk, 1.4, 0.25, 1.2); box(0.1, 0.5, 0.35, woodDk, 2.6, 0.25, 1.2);   // banco
const chest = new THREE.Group(); chest.position.set(-3.4, 0, 1.2); chest.rotation.y = Math.PI / 2; scene.add(chest);
box(1.2, 0.8, 0.6, woodDk, 0, 0.4, 0, chest); box(1.24, 0.06, 0.64, iron, 0, 0.8, 0, chest);
const drawer = box(1.0, 0.22, 0.55, wood, 0, 0.25, 0.04, chest);
// desenho da armadura dourada (textura feita no canvas)
const sketch = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 320; const g = c.getContext('2d');
  g.fillStyle = '#d8c49a'; g.fillRect(0, 0, 256, 320); g.strokeStyle = '#7a5a2a'; g.lineWidth = 3;
  g.fillStyle = '#e0b040'; g.beginPath(); g.moveTo(128, 70); g.lineTo(190, 100); g.lineTo(175, 220); g.lineTo(128, 250); g.lineTo(81, 220); g.lineTo(66, 100); g.closePath(); g.fill(); g.stroke(); // peitoral
  g.beginPath(); g.ellipse(60, 100, 30, 20, -0.3, 0, Math.PI * 2); g.fill(); g.stroke(); g.beginPath(); g.ellipse(196, 100, 30, 20, 0.3, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#fff2b0'; g.beginPath(); g.moveTo(103, 160); g.lineTo(108, 130); g.lineTo(118, 148); g.lineTo(128, 125); g.lineTo(138, 148); g.lineTo(148, 130); g.lineTo(153, 160); g.closePath(); g.fill(); g.stroke(); // coroa
  g.fillStyle = '#5a3a1a'; g.font = 'bold 18px serif'; g.fillText('O REI ESQUECIDO', 50, 295);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.56), new THREE.MeshStandardMaterial({ map: sketch, roughness: 0.9, emissive: 0x3a2a10, emissiveMap: sketch, emissiveIntensity: 0.0 }));
paper.rotation.x = -Math.PI / 2; paper.position.set(0, 0.37, 0); drawer.add(paper);

// ---------- personagens ----------
const hero = makeHeroV2(); scene.add(hero.group);
const bram = makeBramV2(); scene.add(bram.group);
const cat = makeCat(); scene.add(cat.group);
const oldShield = makeHeroV2({ cracked: true }).shield; scene.add(oldShield);       // escudo rachado como objeto solto
oldShield.position.set(0.35, 0.58, -1.2); oldShield.rotation.set(-0.25, -0.5, 0.05);
const hot = new THREE.Mesh(new RoundedBoxGeometry(0.72, 1.1, 0.06, 2, 0.02), new THREE.MeshStandardMaterial({ color: 0x3a2a20, emissive: 0xff5a10, emissiveIntensity: 0 }));
hot.rotation.x = -Math.PI / 2; hot.position.set(-0.3, 0.95, -0.8); scene.add(hot);  // aço em brasa na bigorna
const kids = [0, 1].map((i) => { const k = makeVillagerV2(rand(900 + i)); k.group.scale.setScalar(0.62); k.group.position.set(4.6, 1.3, 0.25 + i * 0.5); k.group.rotation.y = -Math.PI / 2; scene.add(k.group); return k; });

// partículas: faíscas e vapor
function softTex(inner, outer) { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const SPK = 90, spkGeo = new THREE.BufferGeometry(), spkDir = [];
for (let i = 0; i < SPK; i++) { const a = R() * Math.PI * 2; spkDir.push([Math.cos(a) * (1 + R() * 2.5), 1.5 + R() * 3, Math.sin(a) * (1 + R() * 2.5)]); }
spkGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(SPK * 3), 3));
const sparks = new THREE.Points(spkGeo, new THREE.PointsMaterial({ color: new THREE.Color(4, 2.4, 0.6), size: 0.05, map: softTex('rgba(255,255,255,1)', 'rgba(255,255,255,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(sparks);
const steam = []; const steamMat = new THREE.SpriteMaterial({ map: softTex('rgba(230,230,235,0.7)', 'rgba(230,230,235,0)'), depthWrite: false });
for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(steamMat.clone()); s.userData.ph = R(); scene.add(s); steam.push(s); }
const strikeLight = new THREE.PointLight(0xffb060, 0, 5, 1.5); strikeLight.position.set(-0.3, 1.2, -0.8); scene.add(strikeLight);

// ---------- linha do tempo ----------
export const DUR = 64.5;
const T = { gancho: 4, bram1: 8, noite: 13, v1: 18.8, b2: 23.8, v2: 28.1, riu: 34, sete: 39.3, nasceu: 47, vila: 53, segredo: 58.5, fim: 64.5 };
export const STRIKES = [4.6, 5.7, 6.8, 7.7, 39.6, 40.3, 41.0, 41.7, 42.4, 43.1, 43.8, 44.5, 45.2];
const ease = (x) => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, k) => a.clone().lerp(b, ease(k));
const rel = (t, a, b) => (t - a) / (b - a);
const lastStrike = (t) => { let s = -99; for (const x of STRIKES) if (x <= t) s = x; return s; };

function update(t) {
  // fogo da forja tremulando
  forgeLight.intensity = 20 + 5 * Math.sin(t * 11) * Math.sin(t * 6.7) + 3 * Math.sin(t * 23);
  coals.forEach((c, i) => c.scale.setScalar(1 + 0.15 * Math.sin(t * 5 + i)));
  // dia e noite pela janela durante a montagem
  const day = t > T.sete && t < T.nasceu ? 0.5 + 0.5 * Math.sin((t - T.sete) * 1.6) : (t >= T.nasceu && t < T.segredo ? 1 : 0);
  winMat.color.setRGB(0.08 + day * 0.75, 0.1 + day * 0.7, 0.3 + day * 0.55); winLight.intensity = 0.4 + day * 1.2; winLight.color.setRGB(0.6 + day * 0.4, 0.7 + day * 0.25, 1.0 - day * 0.15);

  // martelo / faíscas / aço em brasa
  const ls = lastStrike(t), st = t - ls;
  const montage = (t >= T.gancho && t < T.bram1) || (t >= T.sete && t < T.nasceu);
  hot.visible = montage; oldShield.visible = t >= T.bram1 && t < T.sete;
  hot.material.emissiveIntensity = montage ? 1.0 + 0.5 * Math.exp(-st * 3) : 0;
  const sp = spkGeo.attributes.position;
  for (let i = 0; i < SPK; i++) { const [dx, dy, dz] = spkDir[i]; if (st < 0 || st > 0.9 || !montage) { sp.setXYZ(i, 0, -50, 0); continue; } sp.setXYZ(i, -0.3 + dx * st * 0.6, 0.98 + Math.max(0, dy * st - 4.9 * st * st), -0.8 + dz * st * 0.6); }
  sp.needsUpdate = true; strikeLight.intensity = montage && st < 0.4 ? 8 * Math.exp(-st * 8) : 0;
  steam.forEach((s, i) => { const u = (t * 0.35 + s.userData.ph) % 1; const on = t > 45.2 && t < T.nasceu; s.visible = on; s.position.set(1.2 + Math.sin(u * 6 + i) * 0.2, 0.85 + u * 2, -2.6); s.scale.setScalar(0.4 + u * 1.4); s.material.opacity = Math.sin(u * Math.PI) * 0.8; });

  // Bram
  let hammer = 0;
  if (montage) hammer = st < 0 ? 0 : st < 0.12 ? 1 - st / 0.12 : Math.min(1, (st - 0.12) / 0.45);
  if (t >= T.b2 && t < T.v2 + 1) hammer = 1;                                  // para o martelo no ar
  bram.group.position.set(-0.3, 0, -0.05); bram.group.rotation.y = Math.PI;   // de frente para a bigorna
  let bramYaw = 0;
  if (t >= T.bram1 && t < T.noite) { bram.group.position.set(0.4, 0, -1.6); bram.group.rotation.y = -0.4; }           // examina o escudo
  if (t >= T.v1 && t < T.sete) { bram.group.position.set(-0.3, 0, -0.05); bram.group.rotation.y = Math.PI * 0.7; bramYaw = 0.3; } // olha pro herói
  const laugh = t > T.riu && t < T.riu + 1.6 ? 0.6 + 0.4 * Math.sin(t * 22) : 0;
  bram.pose(t, { hammer, mouth: Math.max(mouthOf('B', t), laugh * 0.7), headYaw: bramYaw });
  bram.group.visible = !(t >= T.noite && t < T.v1);

  // Vitorioso: sentado no banco -> levanta na promessa -> ergue o escudo novo
  const sit = t < T.v2 ? 1 : 1 - ease(rel(t, T.v2, T.v2 + 1.0));
  hero.group.position.set(2.0, 0, 1.25); hero.group.rotation.y = -Math.PI / 2 - 0.6;
  if (t >= T.v2) { hero.group.position.set(1.7, 0, 0.9); }
  hero.shield.visible = t >= T.nasceu;
  const lift = t >= T.nasceu ? ease(rel(t, T.nasceu + 0.5, T.nasceu + 2)) : 0;
  hero.pose(t, t >= T.nasceu ? T.nasceu + 0.45 + 99 : 999, { sit, mouth: mouthOf('V', t), wind: 0.25, eyeYaw: 0 });
  if (lift > 0) hero.group.rotation.y = -Math.PI / 2 - 0.6 + lift * 0.9;
  hero.group.visible = t < T.segredo;
  // Brasa dormindo encostado na bota
  cat.group.position.set(1.65, 0, 1.65); cat.group.rotation.set(0, 0.8, 0); cat.pose(t * 0.1); cat.group.visible = t < T.sete;
  // crianças espiando pela janela
  kids.forEach((k, i) => { k.group.visible = t >= T.vila && t < T.segredo; k.pose(t + i, 0, { headYaw: 0.2 * Math.sin(t * 1.5 + i) }); });
  // gaveta secreta
  const open = ease(rel(t, T.segredo + 1.2, T.segredo + 2.6));
  drawer.position.z = 0.04 + open * 0.5; paper.material.emissiveIntensity = open * 0.6;
  if (t >= T.segredo) { bram.group.position.set(-2.55, 0, 2.05); bram.group.rotation.y = -Math.PI / 2 - 0.5; bram.pose(t, { mouth: mouthOf('B', t), headYaw: 0 }); }

  // ---------- câmera ----------
  let pos, look, fov = 40;
  if (t < T.bram1) {                         // gancho: martelo em brasa, close baixo
    const k = rel(t, T.gancho, T.bram1); pos = lerpV(V(0.6, 1.0, -1.55), V(0.5, 0.97, -1.35), k); look = V(-0.3, 0.95, -0.8); fov = 36;
  } else if (t < T.noite) {                  // Bram examina o escudo rachado
    const k = rel(t, T.bram1, T.noite); pos = lerpV(V(1.2, 1.7, 0.6), V(1.0, 1.75, 0.2), k); look = V(0.4, 1.6, -1.6);
  } else if (t < T.v1) {                     // ele não conseguiu dormir: herói sentado + Brasa
    const k = rel(t, T.noite, T.v1); pos = lerpV(V(-0.4, 1.55, -0.4), V(-0.1, 1.5, -0.1), k); look = V(2.0, 1.05, 1.3);
  } else if (t < T.b2) {                     // fala do herói: close
    const k = rel(t, T.v1, T.b2); pos = lerpV(V(0.6, 1.62, 1.55), V(0.7, 1.6, 1.4), k); look = V(2.0, 1.6, 1.15); fov = 34;
  } else if (t < T.v2) {                     // Bram com o martelo no ar
    const k = rel(t, T.b2, T.v2); pos = lerpV(V(0.9, 1.6, -1.6), V(0.8, 1.65, -1.4), k); look = V(-0.3, 1.9, -0.05); fov = 36;
  } else if (t < T.riu) {                    // ele se levanta; a sombra cresce na parede
    const k = rel(t, T.v2, T.riu); pos = lerpV(V(-1.2, 1.3, 3.0), V(-1.0, 1.5, 3.2), k); look = V(1.8, 1.9, 0.5);
  } else if (t < T.sete) {                   // Bram ri... para de rir
    const k = rel(t, T.riu, T.sete); const kk = k < 0.5 ? 0 : 1;
    pos = kk ? V(0.45, 2.12, 0.15) : V(0.7, 1.75, -1.3); look = kk ? V(1.7, 2.1, 0.9) : V(-0.3, 1.85, -0.05); fov = kk ? 30 : 36;
  } else if (t < T.nasceu) {                 // montagem: cortes a cada ~2s
    const seg = Math.floor((t - T.sete) / 2) % 4;
    const shots = [[V(-0.2, 2.7, -2.1), V(-0.3, 0.9, -0.8)], [V(0.9, 1.35, -1.9), V(-0.3, 1.15, -0.5)], [V(0.5, 0.95, -1.5), V(-0.3, 0.95, -0.8)], [V(1.0, 2.3, 1.8), V(4.0, 2.3, 0.5)]];
    [pos, look] = shots[seg]; pos = pos.clone().add(V(0, 0, -0.08 * ((t - T.sete) % 2)));
  } else if (t < T.vila) {                   // revelação do escudo novo
    const k = rel(t, T.nasceu, T.vila); pos = lerpV(V(-0.4, 1.2, 3.2), V(-0.1, 1.4, 2.8), k); look = V(1.7, 1.45, 0.9);
  } else if (t < T.segredo) {                // crianças espiando pela janela
    const k = rel(t, T.vila, T.segredo); pos = lerpV(V(2.3, 1.95, 0.55), V(2.75, 2.0, 0.5), k); look = V(4.6, 2.1, 0.5);
  } else {                                   // gancho: a gaveta secreta
    const k = rel(t, T.segredo, T.fim); pos = lerpV(V(-1.6, 1.7, 0.2), V(-2.1, 1.35, 0.5), k); look = V(-2.9, 0.4, 1.2); fov = 38;
  }
  camera.fov = fov; camera.updateProjectionMatrix(); camera.position.copy(pos); camera.lookAt(look);
}

window.DUR = DUR;
const fx = makeComposer(renderer, scene, camera, W, H, SS, { bloom: 0.5 });
window.renderAt = (t) => { update(t); fx.render(t); return true; };
window.ready = true;

// Prancha v2: t<10 elenco; 10<=t<20 close do Vitorioso; t>=20 close do Draven; t>=30 aldeões.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeCat, mat, rand } from './personagens.js';
import { makeHeroV2, makeDravenV2, makeLiraV2, makeBramV2, makeVillagerV2 } from './personagens_v2.js';
import { makeComposer } from './posfx.js';
const W = 1080, H = 1920, SS = 1.5;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(SS);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1c2438); scene.fog = new THREE.Fog(0x1c2438, 14, 34);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
const camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 100);
scene.add(new THREE.HemisphereLight(0x8aa0d8, 0x2a1e14, 0.7));
const key = new THREE.DirectionalLight(0xffd8b0, 2.6); key.position.set(4, 7, 6); key.castShadow = true;
key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(key);
const fill = new THREE.DirectionalLight(0xffe8d8, 0.8); fill.position.set(-2, 2, 10); scene.add(fill);
const rim = new THREE.DirectionalLight(0x8fb0ff, 2.4); rim.position.set(-5, 4, -6); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.8, 0.3, 48), mat(0x3a3430)); floor.position.y = -0.15; floor.receiveShadow = true; scene.add(floor);
const hero = makeHeroV2(), lira = makeLiraV2(), bram = makeBramV2(), cat = makeCat(), draven = makeDravenV2();
hero.group.position.set(0, 0, 0.6); lira.group.position.set(-1.25, 0, -0.3); lira.group.rotation.y = 0.35; bram.group.position.set(1.35, 0, -0.4); bram.group.rotation.y = -0.35;
cat.group.position.set(0.75, 0, 1.5); cat.group.rotation.y = -0.4; draven.group.position.set(0, 0, 0); 
const R = rand(5), vill = [];
for (let i = 0; i < 4; i++) { const v = makeVillagerV2(R); v.group.position.set(-1.5 + i, 0, 0); vill.push(v); scene.add(v.group); }
scene.add(hero.group, lira.group, bram.group, cat.group, draven.group);
window.DUR = 40;
const fx = makeComposer(renderer, scene, camera, W, H, SS, { bloom: 0.4 });
window.renderAt = (t) => {
  const mode = t < 10 ? 0 : t < 20 ? 1 : t < 30 ? 2 : 3;
  hero.group.visible = lira.group.visible = bram.group.visible = cat.group.visible = mode <= 1;
  draven.group.visible = mode === 2; vill.forEach(v => v.group.visible = mode === 3);
  hero.pose(t, 999, { mouth: mode === 1 ? 0.5 + 0.5 * Math.sin(t * 9) : 0 }); lira.pose(t); bram.pose(t); cat.pose(t);
  draven.pose(t, { mouth: 0.4 }); vill.forEach((v, i) => v.pose(t + i, 0));
  if (mode === 0) { camera.fov = 34; camera.position.set(0.1, 1.7, 10.8); camera.lookAt(0, 0.95, 0); }
  if (mode === 1) { camera.fov = 30; camera.position.set(0.35, 2.15, 2.9); camera.lookAt(0.0, 2.02, 0.6); }
  if (mode === 2) { camera.fov = 30; camera.position.set(0.4, 2.1, 2.4); camera.lookAt(0, 2.05, 0); }
  if (mode === 3) { camera.fov = 34; camera.position.set(0, 1.4, 6.5); camera.lookAt(0, 1.0, 0); }
  camera.updateProjectionMatrix(); fx.render(t); return true;
};
window.ready = true;

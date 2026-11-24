// Prancha de personagens para aprovação. t < 10: heróis; t >= 10: vilões e monstros.
import * as THREE from 'three';
import { makeHero, makeCat, mat } from './personagens.js';
import { makeDraven, makeHorse, makeLira, makeBram, makeOrc, makeWolf } from './personagens_mmo.js';
import { makeComposer } from './posfx.js';

const W = 1080, H = 1920, SS = 1.5;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(SS);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1c2438); scene.fog = new THREE.Fog(0x1c2438, 12, 30);
const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 100);

scene.add(new THREE.HemisphereLight(0x8aa0d8, 0x2a1e14, 0.8));
const key = new THREE.DirectionalLight(0xffd2a0, 2.4); key.position.set(4, 7, 6); key.castShadow = true;
key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 }); scene.add(key);
const fill = new THREE.DirectionalLight(0xffe8d8, 0.9); fill.position.set(0, 2, 10); scene.add(fill); // luz de preenchimento frontal
const rim = new THREE.DirectionalLight(0x8fb0ff, 2.6); rim.position.set(-5, 4, -6); scene.add(rim);
const floor = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.8, 0.3, 24), mat(0x3a3430)); floor.position.y = -0.15; floor.receiveShadow = true; scene.add(floor);
const ring = new THREE.Mesh(new THREE.TorusGeometry(4.55, 0.05, 4, 48), mat(0xc9962e, { metalness: 0.8, roughness: 0.3 })); ring.rotation.x = Math.PI / 2; scene.add(ring);

const A = new THREE.Group(), Bg = new THREE.Group(); scene.add(A, Bg);
const put = (c, grp, x, z, ry, s = 1) => { c.group.position.set(x, 0, z); c.group.rotation.y = ry; c.group.scale.multiplyScalar(s); grp.add(c.group); return c; };
const hero = put(makeHero(), A, 0, 0.6, 0.05);
const cat = put(makeCat(), A, 0.75, 1.5, -0.4);
const lira = put(makeLira(), A, -1.25, -0.4, 0.35);
const bram = put(makeBram(), A, 1.35, -0.5, -0.35);
const horse = put(makeHorse(), Bg, 0.3, -1.4, 1.15);
const draven = put(makeDraven({ mounted: true }), Bg, 0.3, -1.4, 1.15);
draven.group.position.y = 0.72; // montado na sela
const orc = put(makeOrc(), Bg, -1.5, 0.9, 0.35);
const w1 = put(makeWolf(3), Bg, 1.4, 1.1, -0.7), w2 = put(makeWolf(9), Bg, 0.4, 2.1, -0.25);

window.DUR = 20;
const fx = makeComposer(renderer, scene, camera, W, H, SS);
window.renderAt = (t) => {
  const isA = t < 10; A.visible = isA; Bg.visible = !isA;
  for (const c of [hero]) c.pose(t, 99);
  cat.pose(t); lira.pose(t); bram.pose(t); draven.pose(t); horse.pose(t); orc.pose(t); w1.pose(t + 1); w2.pose(t + 2);
  if (isA) { camera.position.set(0.1, 1.7, 10.8); camera.lookAt(0, 0.75, 0); }
  else { camera.position.set(0.3, 2.3, 11.8); camera.lookAt(0, 1.15, -0.3); }
  fx.render(t); return true;
};
window.ready = true;

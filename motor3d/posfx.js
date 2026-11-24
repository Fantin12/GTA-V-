// Pós-processamento compartilhado: bloom, cor de cinema, vinheta e grão.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
export function makeComposer(renderer, scene, camera, W, H, SS, { bloom = 0.55 } = {}) {
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(SS); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), bloom, 0.55, 0.9));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time) * 43758.5453); }
      void main(){
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        float l = dot(c, vec3(0.299,0.587,0.114));
        c = mix(c * vec3(0.92,0.98,1.12), c * vec3(1.08,1.0,0.9), smoothstep(0.15,0.7,l));
        c = (c - 0.5) * 1.08 + 0.5;
        vec2 d = (vUv - 0.5) * vec2(1.0, 1.25);
        c *= mix(1.0, smoothstep(0.85, 0.25, length(d)), 0.7);
        c += (h(vUv * 1000.0) - 0.5) * 0.02;
        gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
      }`,
  });
  composer.addPass(grade);
  return { render(t) { grade.uniforms.time.value = t; composer.render(); } };
}

```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, countershade, mottle, scales } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dutch windmill",
  description: "Cozy Animal Crossing style Dutch windmill with a tapered brick tower, thatched cap, turning sails, door, windows and tulips.",
};

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const cap = b.joint("cap", { parent: base, at: [0, 3.1, 0], dir: [0, 1, 0] });
  const hub = b.joint("hub", { parent: cap, at: [0, 3.0, 0.75], dir: [0, 0, 1] });

  const BRICK = paint((p, n) => {
    const row = Math.floor(p.y / 0.1);
    const ang = Math.atan2(p.x, p.z);
    const col = Math.floor((ang * Math.hypot(p.x, p.z)) / 0.18 + (row % 2) * 0.5);
    const mortar = (p.y / 0.1 - row < 0.1) || (((ang * Math.hypot(p.x, p.z)) / 0.18 + (row % 2) * 0.5) % 1 < 0.06);
    const v = 0.5 + 0.5 * Math.sin(col * 12.9 + row * 78.2);
    const c = mix(mix("#d97a5a", "#e8946e", v), "#b86048", smoothstep(0.6, -0.4, n.y) * 0.4);
    return mortar ? mix(c, "#f6e6cc", 0.7) : c;
  });
  const WHITE = "#fff6e4";
  const WOOD = "#9a6a3e";
  const DARK = "#5a3a22";
  const THATCH = paint((p, n) => mix(mix("#d8b25a", "#b88e3c", noise(p, 0.12, 3)), "#f0d27a", smoothstep(0.4, 1, n.y) * 0.4));
  const GRASS = mottle("#8ed36a", "#74c158", { size: 0.5, seed: 2 });

  // grass mound
  b.lathe([[0, 0], [2.2, 0], [2.0, 0.12], [0, 0.18]], { at: [0, 0, 0], bone: base, color: GRASS, segments: 14 });
  // tower: stacked tapered frustums
  b.lathe([[0, 0.1], [1.45, 0.1], [1.45, 0.3], [1.3, 0.3], [0.85, 3.1], [0, 3.1]], { at: [0, 0, 0], bone: base, color: BRICK, segments: 10 });
  b.lathe([[0, 0.3], [1.52, 0.3], [1.52, 0.38], [0, 0.38]], { at: [0, 0, 0], bone: base, color: WHITE, segments: 10 });
  for (const y of [1.4, 2.4]) {
    const r = 1.3 - (y - 0.3) * 0.16;
    b.lathe([[0, 0], [r + 0.04, 0], [r + 0.04, 0.07], [0, 0.07]], { at: [0, y, 0], bone: base, color: WHITE, segments: 10 });
  }
  // door
  const doorFrame = b.part(new THREE.BoxGeometry(0.62, 0.95, 0.08), WHITE, { bone: base, at: [0, 0.82, 1.3] });
  b.part(new THREE.BoxGeometry(0.5, 0.85, 0.09), WOOD, { bone: base, at: [0, 0.78, 1.32] });
  b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.09, 8, 1, false, 0, Math.PI), WOOD, { bone: base, at: [0, 1.2, 1.32], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), "#f2c14e", { bone: base, at: [0.15, 0.75, 1.38] });
  b.part(new THREE.BoxGeometry(0.9, 0.08, 0.3), WHITE, { bone: base, at: [0, 0.34, 1.5] });
  // windows
  const win = svg(`<svg viewBox="0 0 40 50"><rect x="2" y="2" width="36" height="46" rx="14" fill="#8fd3f0" stroke="#fff6e4" stroke-width="4"/><path d="M20 2V48M2 26H38" stroke="#fff6e4" stroke-width="3"/><path d="M8 12Q12 8 16 10" stroke="#fff" stroke-width="2" fill="none"/></svg>`, { size: 128 });
  for (const [y, z] of [[1.7, 1.0], [2.6, 0.82]] as const) {
    b.part(new THREE.PlaneGeometry(0.4, 0.5), "#ffffff", { bone: base, at: [0, y, z], dir: [0, 0.16, 1], axis: "z", texture: win });
    for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.1, 0.4, 0.06), "#6aa8b8", { bone: base, at: [s * 0.3, y, z - 0.02], rotation: [-9, 0, 0] });
  }
  // stone path and tulips
  for (let i = 0; i < 4; i++) b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 7), "#cfc6b4", { bone: base, at: [Math.sin(i) * 0.1, 0.2, 1.8 + i * 0.35] });
  const r = rng(5);
  const cols = ["#ff7a9a", "#ffd24a", "#ff9a4a", "#ffffff"];
  for (let i = 0; i < 10; i++) {
    const a = 0.5 + i * 0.55, d = 1.7 + r() * 0.3;
    const x = Math.sin(a) * d, z = Math.cos(a) * d;
    if (z > 1.2 && Math.abs(x) < 0.5) continue;
    b.rod([x, 0.15, z], [x, 0.4, z], 0.015, "#4f9a3a", { bone: base });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), cols[i % 4], { bone: base, at: [x, 0.45, z], scale: [1, 1.2, 1] });
    b.part(new THREE.ConeGeometry(0.1, 0.1, 5), "#3f8a30", { bone: base, at: [x, 0.2, z + 0.06], rotation: [30, 0, 0] });
  }
  // cap
  b.lathe([[0, 0], [0.98, 0], [0.98, 0.1], [0.9, 0.12], [0.75, 0.7], [0.4, 1.1], [0, 1.3]], { at: [0, 0, 0], bone: cap, color: THATCH, segments: 10, smoothing: 1 });
  b.lathe([[0, 0], [1.0, 0], [1.0, 0.08], [0, 0.08]], { at: [0, 0, 0], bone: cap, color: DARK, segments: 10 });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), "#f2c14e", { bone: cap, at: [0, 1.32, 0] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), DARK, { bone: cap, at: [0, 1.45, 0] });
  // cap windows
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: cap, at: [0, 0.5, 0.82], dir: [0, 0.4, 1], axis: "z", texture: win });
  // axle housing
  b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 8), DARK, { bone: cap, at: [0, 0.55, 0.9], rotation: [90, 0, 0] });

  // sails
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), "#f2c14e", { bone: hub, at: [0, 0, 0.25], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.18, 8, 6), WOOD, { bone: hub, at: [0, 0, 0.35] });
  const sailTex = svg(`<svg viewBox="0 0 20 60"><rect width="20" height="60" fill="#fff6e4"/><path d="M0 10H20M0 20H20M0 30H20M0 40H20M0 50H20M10 0V60" stroke="#d8c8a8" stroke-width="1.2"/></svg>`, { size: 128 });
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + 0.4;
    const dx = Math.sin(a), dy = Math.cos(a);
    const beam = b.rod([0, 0, 0.3], [dx * 3.4, dy * 3.4, 0.3], 0.06, WOOD, { bone: hub });
    void beam;
    // lattice frame
    const mid = (t: number, o: number): [number, number, number] => [dx * t - dy * o, dy * t + dx * o, 0.32];
    const w = 0.5;
    const lat = (t0: number, t1: number, o: number) => b.rod(mid(t0, o), mid(t1, o), 0.025, DARK, { bone: hub });
    lat(0.7, 3.4, w); lat(0.7, 3.4, w * 2.2);
    lat(0.7, 0.7, 0);
    b.rod(mid(0.7, 0), mid(0.7, w * 2.2), 0.025, DARK, { bone: hub });
    b.rod(mid(3.4, 0), mid(3.4, w * 2.2), 0.025, DARK, { bone: hub });
    b.part(new THREE.PlaneGeometry(1.1, 2.7), "#ffffff", {
      bone: hub, at: mid(2.05, 0.6 * 1.0 + 0.5), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -a)), texture: sailTex,
    });
    b.part(new THREE.PlaneGeometry(1.1, 2.7), "#ffffff", {
      bone: hub, at: mid(2.05, 1.1), quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI, a)), texture: sailTex,
    });
    for (let j = 1; j <= 4; j++) b.rod(mid(0.7 + j * 0.6, 0.0), mid(0.7 + j * 0.6, w * 2.2), 0.015, DARK, { bone: hub });
  }
  // lit tower lamp
  glow(b.part(new THREE.BoxGeometry(0.16, 0.2, 0.05), "#ffcf6a", { bone: base, at: [0.55, 1.05, 1.28], rotation: [0, 25, 0] }), 1.2);
  void doorFrame; void countershade; void scales;
  return b.root;
}
```
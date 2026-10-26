```ts
import * as THREE from "three";
import { createBuilder, rng, paint, noise, smoothstep, mix, svg, along, frame } from "agentic-3js-builder";

export const meta = { name: "Dutch windmill", description: "Cozy Animal Crossing style Dutch windmill with brick base, thatched cap and spinning sails." };

export default function build() {
  const b = createBuilder({ name: "windmill" });
  const R = rng(5);
  const base = b.joint("base", { at: [0, 0, 0] });
  const capJ = b.joint("cap", { parent: base, at: [0, 3.3, 0], dir: [0, 1, 0] });
  const hub = b.joint("hub", { parent: capJ, at: [0, 3.5, 0.8], dir: [0, 0, 1], role: "hinge" });

  const BRICK = paint((p, n) => {
    const row = Math.floor(p.y / 0.12);
    const u = (Math.atan2(p.x, p.z) * 0.5 + (row % 2) * 0.05) / 0.09;
    const mortar = Math.abs(((p.y / 0.12) % 1) - 0.5) > 0.44 || Math.abs((u % 1) - 0.5) > 0.46;
    const v = noise(p, 0.1, 3);
    const c = mix("#d9805a", "#b8583c", v);
    return mortar ? "#f1dcc0" : mix(c, "#7fae6a", smoothstep(0.7, 0.2, p.y) * 0.0);
  });
  const THATCH = paint((p) => mix("#d9b45a", "#a8803a", noise(p, 0.12, 8) * 0.8 + (Math.sin(p.y * 60) * 0.1 + 0.1)));
  const WOOD = "#8a5a36", CREAM = "#fff1d6", SKY = "#7cc4e0", GREEN = "#6fb55a", STONE = "#b9b2a4";

  // stone plinth
  b.lathe([[0, 0], [1.75, 0], [1.75, 0.35], [1.6, 0.4], [0, 0.4]], { at: [0, 0, 0], bone: base, color: STONE, segments: 10 });
  // tapered tower
  b.lathe([[0, 0.4], [1.55, 0.4], [1.0, 3.3], [0, 3.3]], { at: [0, 0, 0], bone: base, color: BRICK, segments: 12 });
  // cream band
  b.lathe([[0, 1.9], [1.3, 1.9], [1.3, 2.0], [0, 2.0]], { at: [0, 0, 0], bone: base, color: CREAM, segments: 12 });
  // door
  b.part(new THREE.BoxGeometry(0.6, 1.0, 0.12), WOOD, { bone: base, at: [0, 0.9, 1.5] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 8, 1, false, 0, Math.PI), WOOD, { bone: base, at: [0, 1.4, 1.5], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), "#f2c14e", { bone: base, at: [0.18, 0.9, 1.58] });
  b.part(new THREE.BoxGeometry(0.9, 0.08, 0.3), CREAM, { bone: base, at: [0, 0.42, 1.62] });
  // windows
  const win = svg(`<svg viewBox="0 0 40 56"><rect x="2" y="2" width="36" height="52" rx="14" fill="#7cc4e0" stroke="#fff1d6" stroke-width="4"/><path d="M20 2V54M2 28H38" stroke="#fff1d6" stroke-width="3"/><path d="M8 12L16 6" stroke="#fff" stroke-width="3"/></svg>`, { size: 128 });
  for (const [y, rad, az] of [[2.5, 1.12, 0], [1.25, 1.35, 90], [1.25, 1.35, -90]] as number[][]) {
    const a = (az * Math.PI) / 180;
    b.part(new THREE.PlaneGeometry(0.4, 0.56), "#ffffff", { bone: base, at: [Math.sin(a) * rad, y, Math.cos(a) * rad], dir: [Math.sin(a), 0.1, Math.cos(a)], axis: "z", texture: win });
  }
  // balcony
  b.lathe([[1.15, 3.0], [1.45, 3.0], [1.45, 3.08], [1.15, 3.08]], { at: [0, 0, 0], bone: base, color: WOOD, segments: 12 });
  // flower boxes
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.5), WOOD, { bone: base, at: [s * 1.5, 0.95, 0.4] });
    for (let i = 0; i < 4; i++) b.part(new THREE.SphereGeometry(0.06, 6, 4), ["#ff7aa6", "#ffd84a", "#fff", "#ff9a5a"][i], { bone: base, at: [s * 1.5, 1.05, 0.22 + i * 0.12] });
  }

  // cap
  b.lathe([[0, 0], [1.15, 0], [1.1, 0.25], [0.6, 0.85], [0, 1.0]], { at: [0, 3.3, 0], bone: capJ, color: THATCH, segments: 10, smoothing: 1 });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), "#e85a4a", { bone: capJ, at: [0, 4.35, 0] });
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5), WOOD, { bone: capJ, at: [0, 4.2, 0] });

  // axle & hub
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8), WOOD, { bone: capJ, at: [0, 3.5, 0.9], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.2, 0.3, 8), "#e85a4a", { bone: hub, at: [0, 3.5, 1.4], dir: [0, 0, 1] });

  // sails
  const lattice = svg(`<svg viewBox="0 0 40 120"><rect x="1" y="1" width="38" height="118" fill="#fff1d6" stroke="#8a5a36" stroke-width="3"/><path d="M20 0V120M1 20H39M1 40H39M1 60H39M1 80H39M1 100H39" stroke="#c9a47a" stroke-width="2"/></svg>`, { size: 128 });
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    const dx = Math.sin(a), dy = Math.cos(a);
    b.rod([dx * 0.2, 3.5 + dy * 0.2, 1.45], [dx * 2.9, 3.5 + dy * 2.9, 1.45], 0.045, WOOD, { bone: hub });
    const cx = dx * 1.8 + Math.cos(a) * 0.3, cy = 3.5 + dy * 1.8 - Math.sin(a) * 0.3;
    b.part(new THREE.PlaneGeometry(0.5, 1.9), "#ffffff", { bone: hub, at: [cx, cy, 1.46], dir: [0, 0, 1], axis: "z", up: [dx, dy, 0], texture: lattice });
    b.part(new THREE.PlaneGeometry(0.5, 1.9), "#ffffff", { bone: hub, at: [cx, cy, 1.44], dir: [0, 0, -1], axis: "z", up: [dx, dy, 0], texture: lattice });
  }
  b.pose(hub, { axis: [0, 0, 1], deg: 12 });

  // tulips by the base
  for (let i = 0; i < 7; i++) {
    const x = -1.6 + i * 0.3 + R() * 0.1;
    b.rod([x, 0, 2.0], [x, 0.22, 2.0], 0.012, GREEN, { bone: base });
    b.part(new THREE.ConeGeometry(0.06, 0.14, 5), i % 2 ? "#ff6f8e" : "#ffd24a", { bone: base, at: [x, 0.3, 2.0] });
  }
  return b.root;
}
```
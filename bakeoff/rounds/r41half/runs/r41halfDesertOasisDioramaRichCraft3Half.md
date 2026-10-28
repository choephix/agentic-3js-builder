```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle, stripes, countershade, svg, noise, mix, smoothstep } from "agentic-3js-builder";

export const meta = { name: "desert oasis", description: "Low-poly whimsical oasis diorama with pond, palms, striped tents and camels." };

const SAND = "#f0cf8e", SAND2 = "#e3b66c", WATER = "#3fc7c9", GRASS = "#6fb04a", TRUNK = "#9a6a3a";
const LEAF = "#2f9a4a", LEAF2 = "#58bf57", CAMEL = "#c98f4f", CAMEL2 = "#a8703a", DARK = "#3b2616", ROCK = "#b98a62";

export default function build() {
  const b = createBuilder({ name: "oasis" });
  const R = rng(5);

  // ground island: layered disc
  const sandPaint = paint((p, n) => {
    const t = noise(p, 0.5, 3);
    return mix(SAND, SAND2, smoothstep(0.35, 0.7, t) * 0.8 + (n.y < 0.5 ? 0.2 : 0));
  });
  b.part(new THREE.CylinderGeometry(3.2, 2.9, 0.3, 14), sandPaint, { at: [0, -0.03, 0], flat: true });
  b.part(new THREE.CylinderGeometry(2.9, 2.5, 0.25, 14), SAND2, { at: [0, -0.15, 0], flat: true });
  // dunes
  for (const [x, z, r, h] of [[-2, -1.8, 0.9, 0.5], [2.1, -1.5, 1.1, 0.6], [-2.3, 1.2, 0.7, 0.35]] as number[][]) {
    const s = new THREE.SphereGeometry(r, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    b.part(s, sandPaint, { at: [x, 0.12, z], scale: [1, h / r, 1], flat: true });
  }

  // pond
  b.part(new THREE.CylinderGeometry(1.0, 1.05, 0.08, 12), GRASS, { at: [0, 0.14, 0.1], scale: [1.2, 1, 0.9], flat: true });
  const waterTex = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#3fc7c9"/><path d="M6 20 q10-8 20 0 t20 0 M14 44 q10-8 20 0 t20 0" stroke="#bff4f0" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`, { size: 128 });
  b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.04, 12), "#ffffff", { at: [0, 0.2, 0.1], scale: [1.2, 1, 0.9], texture: waterTex });
  // lily pads
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7;
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.015, 6), LEAF2, { at: [Math.cos(a) * 0.5, 0.235, 0.1 + Math.sin(a) * 0.35] });
  }
  // rocks
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.3;
    const s = 0.1 + R() * 0.1;
    b.part(new THREE.DodecahedronGeometry(s, 0), ROCK, { at: [Math.cos(a) * 1.25, 0.2, 0.1 + Math.sin(a) * 1.0], flat: true });
  }

  // palms
  const palm = (x: number, z: number, h: number, lean: number) => {
    const pts: number[][] = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      pts.push([x + lean * t * t, 0.15 + h * t, z]);
    }
    b.sweep(pts, [0.09, 0.05], { color: TRUNK, sides: 6, caps: "flat" });
    for (let i = 1; i < 5; i++) {
      const t = i / 5;
      b.part(new THREE.TorusGeometry(0.075 - t * 0.03, 0.012, 4, 6), "#7a4f28", { at: [x + lean * t * t, 0.15 + h * t, z], rotation: [90, 0, 0] });
    }
    const top = [x + lean, 0.15 + h, z];
    const N = 8;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const dx = Math.cos(a), dz = Math.sin(a);
      b.sweep([top, [top[0] + dx * 0.3, top[1] + 0.2, top[2] + dz * 0.3], [top[0] + dx * 0.6, top[1] + 0.05, top[2] + dz * 0.6], [top[0] + dx * 0.85, top[1] - 0.25, top[2] + dz * 0.85]],
        (t) => [0.14 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.15)) + 0.01, 0.012], { color: i % 2 ? LEAF : LEAF2, section: "box", caps: "point" });
    }
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      b.part(new THREE.SphereGeometry(0.06, 6, 4), "#8a4a1a", { at: [top[0] + Math.cos(a) * 0.08, top[1] - 0.08, top[2] + Math.sin(a) * 0.08] });
    }
  };
  palm(-0.9, -0.55, 1.5, -0.3);
  palm(0.95, -0.4, 1.8, 0.35);
  palm(-1.1, 0.9, 1.2, -0.2);
  palm(1.2, 0.95, 1.4, 0.3);
  // grass tufts
  for (let i = 0; i < 10; i++) {
    const a = R() * 6.28, r = 1.0 + R() * 0.3;
    b.part(new THREE.ConeGeometry(0.05, 0.2, 4), GRASS, { at: [Math.cos(a) * r * 1.2, 0.27, 0.1 + Math.sin(a) * r * 0.9] });
  }

  // tents
  const tent = (x: number, z: number, rot: number, c1: string, c2: string, s: number) => {
    const stripe = stripes(c1, c2, { size: 0.16, axis: "x", width: 0.5, wobble: 0 });
    b.part(new THREE.ConeGeometry(0.55 * s, 0.75 * s, 4), stripe, { at: [x, 0.15 + 0.375 * s, z], rotation: [0, rot + 45, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.4 * s, 4), DARK, { at: [x, 0.15 + 0.95 * s, z] });
    b.part(new THREE.ConeGeometry(0.07 * s, 0.15 * s, 4), "#ffd23f", { at: [x, 0.15 + 1.2 * s, z] });
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rot * Math.PI) / 180);
    const d = new THREE.Vector3(0, 0, 0.3 * s).applyQuaternion(q);
    b.part(new THREE.BoxGeometry(0.2 * s, 0.34 * s, 0.03), DARK, { at: [x + d.x, 0.15 + 0.17 * s, z + d.z], rotation: [0, rot, 0] });
    b.part(new THREE.CylinderGeometry(0.58 * s, 0.6 * s, 0.04, 4), "#8b3a2b", { at: [x, 0.16, z], rotation: [0, rot + 45, 0] });
  };
  tent(-1.7, -0.1, 25, "#d9452f", "#fff1d0", 1.1);
  tent(1.85, 0.2, -30, "#2f7fd0", "#fff1d0", 1.0);
  tent(0.2, -1.6, 5, "#f2a81d", "#fff1d0", 0.9);

  // camels
  const camel = (x: number, z: number, rot: number, sc: number) => {
    const hips = b.joint(`hips${x > 0 ? "R" : "L"}${z > 0 ? 1 : 0}`, { at: [x, 0.15 + 0.55 * sc, z] });
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rot * Math.PI) / 180);
    const P = (lx: number, ly: number, lz: number): [number, number, number] => {
      const v = new THREE.Vector3(lx * sc, ly * sc, lz * sc).applyQuaternion(q);
      return [x + v.x, 0.15 + v.y, z + v.z];
    };
    const o = { bone: hips };
    b.part(new THREE.BoxGeometry(0.32 * sc, 0.3 * sc, 0.7 * sc), CAMEL, { at: P(0, 0.55, 0), quat: q, ...o, flat: true });
    for (const hz of [-0.2, 0.2]) b.part(new THREE.ConeGeometry(0.12 * sc, 0.2 * sc, 5), CAMEL2, { at: P(0, 0.78, hz), quat: q, ...o, flat: true });
    b.sweep([P(0, 0.6, 0.3), P(0, 0.85, 0.42), P(0, 1.05, 0.5)], [0.07 * sc, 0.05 * sc], { color: CAMEL, sides: 6, ...o });
    b.part(new THREE.BoxGeometry(0.13 * sc, 0.15 * sc, 0.26 * sc), CAMEL, { at: P(0, 1.1, 0.6), quat: q, ...o, flat: true });
    b.part(new THREE.BoxGeometry(0.1 * sc, 0.07 * sc, 0.1 * sc), "#e0b27a", { at: P(0, 1.06, 0.76), quat: q, ...o });
    for (const s of [1, -1]) {
      b.part(new THREE.SphereGeometry(0.018 * sc, 5, 4), DARK, { at: P(s * 0.07, 1.14, 0.68), ...o });
      b.part(new THREE.ConeGeometry(0.025 * sc, 0.06 * sc, 4), CAMEL2, { at: P(s * 0.06, 1.2, 0.52), ...o });
      for (const lz of [-0.25, 0.25]) {
        b.rod(P(s * 0.12, 0.42, lz), P(s * 0.12, 0.02, lz), [0.045 * sc, 0.03 * sc], { color: CAMEL2, sides: 6, ...o });
        b.part(new THREE.BoxGeometry(0.07 * sc, 0.03 * sc, 0.09 * sc), DARK, { at: P(s * 0.12, 0.015, lz + 0.01), quat: q, ...o });
      }
    }
    b.sweep([P(0, 0.62, -0.35), P(0, 0.45, -0.45), P(0, 0.25, -0.45)], [0.03 * sc, 0.015 * sc], { color: DARK, sides: 5, ...o });
    // saddle blanket
    const blanket = stripes("#d9452f", "#ffd23f", { size: 0.06, axis: "z", width: 0.4, wobble: 0 });
    b.part(new THREE.BoxGeometry(0.4 * sc, 0.05 * sc, 0.3 * sc), blanket, { at: P(0, 0.72, 0), quat: q, ...o });
  };
  camel(0.9, 1.7, -60, 1);
  camel(-0.4, 1.9, 40, 0.9);
  camel(2.0, -1.2, 120, 0.8);

  return b.root;
}
```
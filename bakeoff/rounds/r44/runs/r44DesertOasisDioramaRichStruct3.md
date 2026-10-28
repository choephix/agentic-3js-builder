```ts
import * as THREE from "three";
import { createBuilder, frame, rng } from "agentic-3js-builder";
import { mottle, paint, noise, smoothstep, mix } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Whimsical Desert Oasis",
  description: "Low-poly desert oasis diorama: sand island, turquoise pond, leaning palms with coconuts, striped tents with lanterns, and two chunky camels.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "oasis", paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);

  const SAND = mottle("#f2cf8a", "#e8b86a", { size: 0.25, seed: 2 });
  const SAND_SIDE = paint((p) => mix("#c98f4e", "#a8703c", smoothstep(0, 0.2, p.y)));
  const ROCK = mottle("#b58a62", "#8d6646", { size: 0.12, seed: 4 });
  const WATER = paint((p) => (noise(p, 0.15, 3) > 0.6 ? "#7fe6e0" : "#37bfd0"));
  const TRUNK = "#8a5a36";
  const LEAF = svg(`<svg viewBox="0 0 32 96"><path d="M16 96 C0 60 2 24 16 0 C30 24 32 60 16 96Z" fill="#3fa65a" stroke="#256d3c" stroke-width="2"/><path d="M16 96 L16 6" stroke="#8fe08a" stroke-width="2"/></svg>`, { size: 128 });
  const STRIPE = (a: string, c: string) => svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${a}"/>${[0, 2, 4, 6].map((i) => `<rect x="${i * 8}" width="8" height="64" fill="${c}"/>`).join("")}</svg>`, { size: 64 });
  const FLAG = svg(`<svg viewBox="0 0 40 24"><path d="M0 0 L40 12 L0 24Z" fill="#ff5a6e"/></svg>`, { size: 64 });

  // island
  b.part(new THREE.CylinderGeometry(2.0, 1.7, 0.3, 14), SAND_SIDE, { bone: base, at: [0, 0.15, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.95, 2.0, 0.06, 14), SAND, { bone: base, at: [0, 0.33, 0], flat: true });
  const dunes: [number, number, number, number][] = [[-1.2, -1.0, 0.7, 0.3], [1.3, -0.9, 0.6, 0.22], [-1.4, 1.0, 0.5, 0.15]];
  for (const [x, z, r, h] of dunes)
    b.part(new THREE.SphereGeometry(r, 8, 5), SAND, { bone: base, at: [x, 0.34, z], scale: [1.2, h / r, 1], flat: true });

  // pond
  b.part(new THREE.CylinderGeometry(0.62, 0.66, 0.05, 12), "#d9b878", { bone: base, at: [0.0, 0.37, 0.1], scale: [1.2, 1, 1], flat: true });
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12), WATER, { bone: base, at: [0.0, 0.4, 0.1], scale: [1.2, 1, 1], flat: true });
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    b.part(new THREE.IcosahedronGeometry(0.08 + R() * 0.04, 0), ROCK, { bone: base, at: [Math.cos(a) * 0.78, 0.4, 0.1 + Math.sin(a) * 0.62], flat: true });
  }
  for (const [x, z] of [[0.2, 0.0], [-0.25, 0.25]] as [number, number][])
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 8), "#4fc060", { bone: base, at: [x, 0.425, z] });
  b.part(new THREE.SphereGeometry(0.035, 6, 4), "#ff8fb1", { bone: base, at: [0.2, 0.45, 0.0] });

  // palms
  const palm = (x: number, z: number, h: number, lean: number) => {
    const pts: V[] = [[x, 0.34, z], [x + lean * 0.4, 0.34 + h * 0.5, z], [x + lean, 0.34 + h, z]];
    b.sweep(pts, [0.09, 0.05], { color: TRUNK, bone: base, sides: 6 });
    const top = pts[2];
    for (let i = 0; i < 4; i++) {
      const y = 0.34 + h * (0.12 + i * 0.22);
      b.part(new THREE.TorusGeometry(0.08 - i * 0.008, 0.015, 4, 8), "#6e4426", { bone: base, at: [x + lean * (y - 0.34) / h * (y - 0.34) / h, y, z], rotation: [90, 0, 0] });
    }
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      fr.push(frame(top, [Math.cos(a), 0.7, Math.sin(a)]));
    }
    b.cards(fr, LEAF, { size: [0.3, 0.9], lean: 62, bend: 40, flow: (f) => [f.axis.x, -0.4, f.axis.z], bone: base, sink: 0.05, rng: R });
    for (let i = 0; i < 3; i++)
      b.part(new THREE.SphereGeometry(0.06, 6, 4), "#6b3f22", { bone: base, at: [top[0] + Math.cos(i * 2.1) * 0.08, top[1] - 0.08, top[2] + Math.sin(i * 2.1) * 0.08] });
  };
  palm(-0.8, -0.25, 1.3, 0.3);
  palm(0.85, -0.3, 1.1, -0.25);
  palm(0.5, 0.85, 0.9, 0.2);
  palm(-0.6, 0.7, 0.75, -0.2);

  // tents
  const tent = (x: number, z: number, yaw: number, a: string, c: string) => {
    const tex = STRIPE(a, c);
    b.part(new THREE.ConeGeometry(0.5, 0.6, 4, 1), "#ffffff", { bone: base, at: [x, 0.66, z], rotation: [0, 45 + yaw, 0], texture: tex });
    b.part(new THREE.BoxGeometry(0.62, 0.02, 0.62), "#a8433a", { bone: base, at: [x, 0.35, z], rotation: [0, yaw, 0] });
    const q = new THREE.Vector3(Math.sin(yaw * Math.PI / 180), 0, Math.cos(yaw * Math.PI / 180));
    b.part(new THREE.ConeGeometry(0.14, 0.32, 3), "#2b1c26", { bone: base, at: [x + q.x * 0.2, 0.52, z + q.z * 0.2], rotation: [0, yaw + 90, 0], scale: [1, 1, 0.3] });
    b.rod([x, 0.95, z], [x, 1.2, z], 0.015, { color: "#6e4426", bone: base });
    b.cards([frame([x, 1.2, z], [0, 1, 0])], FLAG, { size: [0.22, 0.13], lean: 90, flow: [1, 0, 0], bone: base, sink: 0 });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), "#ffcf5a", { bone: base, at: [x + q.x * 0.34, 0.5, z + q.z * 0.34] });
  };
  tent(-1.1, 0.1, 50, "#f6e6c8", "#e2574c");
  tent(1.2, 0.5, -40, "#f6e6c8", "#2a9ca8");

  // camels
  const FUR = "#d9a15f";
  const camel = (x: number, z: number, yaw: number) => {
    const J = (p: V): V => {
      const c = Math.cos(yaw * Math.PI / 180), s = Math.sin(yaw * Math.PI / 180);
      return [x + p[0] * c + p[2] * s, p[1], z - p[0] * s + p[2] * c];
    };
    const P = (g: THREE.BufferGeometry, col: string, p: V, sc?: V) => b.part(g, col, { bone: base, at: J(p), scale: sc, rotation: [0, yaw, 0], flat: true });
    P(new THREE.SphereGeometry(0.22, 8, 6), FUR, [0, 0.82, 0], [0.8, 0.8, 1.5]);
    P(new THREE.SphereGeometry(0.1, 6, 5), "#c98f4e", [0, 1.08, -0.1]);
    P(new THREE.SphereGeometry(0.1, 6, 5), "#c98f4e", [0, 1.08, 0.12]);
    b.sweep([J([0, 0.9, 0.3]), J([0, 1.2, 0.42]), J([0, 1.42, 0.5])], [0.09, 0.06], { color: FUR, bone: base, sides: 6 });
    P(new THREE.BoxGeometry(0.16, 0.15, 0.28), FUR, [0, 1.5, 0.6]);
    P(new THREE.BoxGeometry(0.17, 0.08, 0.1), "#e6bd80", [0, 1.46, 0.76]);
    for (const s of [1, -1]) {
      P(new THREE.SphereGeometry(0.022, 4, 3), "#2b1c26", [s * 0.07, 1.55, 0.7]);
      P(new THREE.ConeGeometry(0.03, 0.08, 4), FUR, [s * 0.07, 1.62, 0.5]);
    }
    for (const sx of [1, -1]) for (const sz of [1, -1]) {
      b.rod(J([sx * 0.12, 0.7, sz * 0.32]), J([sx * 0.12, 0.04, sz * 0.32]), [0.06, 0.04], { color: FUR, bone: base, sides: 5 });
      P(new THREE.BoxGeometry(0.1, 0.05, 0.12), "#8a5a36", [sx * 0.12, 0.04, sz * 0.34]);
    }
    b.sweep([J([0, 0.9, -0.34]), J([0, 0.75, -0.5]), J([0, 0.5, -0.5])], [0.03, 0.015], { color: "#c98f4e", bone: base, sides: 5 });
    P(new THREE.BoxGeometry(0.34, 0.03, 0.36), "#d94a5a", [0, 0.99, 0.0]);
    P(new THREE.BoxGeometry(0.36, 0.02, 0.06), "#ffcf5a", [0, 1.0, 0.0]);
  };
  camel(0.1, -0.75, 20);
  camel(-0.35, 1.2, -140);

  return b.root;
}
```
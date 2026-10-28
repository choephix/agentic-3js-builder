import * as THREE from "three";
import { createBuilder, rng, catmull, mottle, paint, mix, noise, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Whimsical Desert Oasis",
  description: "A low-poly desert oasis diorama: sandy dunes, a turquoise pond, leaning palms with coconuts, striped tents with lanterns, and two chunky camels.",
};

export default function build() {
  const b = createBuilder({ name: "oasis", paintSize: 1024 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const R = rng(7);

  const SAND = mottle("#f2cf86", "#e5b86a", { size: 0.35, seed: 2 });
  const SAND_D = "#d9a65a";
  const WATER = paint((p, n) => {
    if (n.y < 0.5) return "#e5b86a";
    const d = Math.hypot(p.x + 0.1, (p.z - 0.1) * 1.25);
    return mix("#3fd0d0", "#1d8fb8", smoothstep(0.1, 0.8, d) * 0.6 + noise(p, 0.15, 3) * 0.3);
  });
  const GREEN = "#3fae5a", GREEN_L = "#6fd06a", TRUNK = "#8a5a36", TRUNK_D = "#6b4026";
  const CAMEL = mottle("#d9a45e", "#c58c48", { size: 0.2, seed: 5 });
  const DARK = "#2b1d1a";

  const part = (g: THREE.BufferGeometry, c: any, at: number[], rot?: number[], scale?: number[]) =>
    b.part(g, c, { bone: base, at: at as any, rotation: rot as any, scale: scale as any, flat: true });
  const box = (w: number, h: number, d: number, c: any, at: number[], rot?: number[]) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, rot);
  const cyl = (rt: number, rb: number, h: number, s: number, c: any, at: number[], rot?: number[]) =>
    part(new THREE.CylinderGeometry(rt, rb, h, s), c, at, rot);
  const ball = (r: number, c: any, at: number[], sc?: number[]) =>
    part(new THREE.SphereGeometry(r, 7, 5), c, at, undefined, sc);

  // Ground: dune disc, pond bowl
  b.lathe([[0, 0], [1.9, 0], [1.9, 0.12], [1.5, 0.16], [0.9, 0.2], [0, 0.2]], { at: [0, 0, 0], segments: 14, color: SAND, bone: base });
  b.lathe([[0, 0.19], [0.55, 0.19], [0.58, 0.215], [0.5, 0.225], [0, 0.225]], { at: [-0.1, 0.0, 0.1], segments: 12, color: WATER, bone: base });
  b.lathe([[0.55, 0.19], [0.62, 0.2], [0.62, 0.23], [0.55, 0.23]], { at: [-0.1, 0, 0.1], segments: 12, color: "#9a8f7a", bone: base });
  for (let i = 0; i < 9; i++) {
    const a = i * 0.7;
    ball(0.06 + R() * 0.03, "#a89c86", [-0.1 + Math.cos(a) * 0.66, 0.23, 0.1 + Math.sin(a) * 0.55], [1, 0.7, 1]);
  }
  // dunes
  for (const [x, z, s] of [[1.2, -1.1, 0.7], [-1.3, -1.2, 0.6], [1.3, 1.1, 0.4]] as number[][])
    ball(s, SAND, [x, 0.18, z], [1.6, 0.35, 1.2]);
  // lily pads
  for (const [x, z] of [[0, 0.2], [-0.3, 0], [-0.15, 0.35]]) cyl(0.07, 0.07, 0.01, 7, GREEN_L, [x, 0.235, z]);

  const COCO = svg(`<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#5b3a1e"/></svg>`);
  void COCO;
  const palm = (x: number, z: number, h: number, lean: number, yaw: number) => {
    const pts: number[][] = [];
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const a = yaw;
      pts.push([x + Math.sin(a) * lean * t * t, 0.2 + h * t, z + Math.cos(a) * lean * t * t]);
    }
    b.sweep(catmull(pts as any), [0.05, 0.03], { color: TRUNK, bone: base, sides: 6 });
    for (let i = 1; i < 4; i++) {
      const p = pts[i];
      cyl(0.06 - i * 0.005, 0.06 - i * 0.005, 0.015, 6, TRUNK_D, p);
    }
    const top = pts[4];
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      const dx = Math.sin(a), dz = Math.cos(a);
      const e = [top[0] + dx * 0.38, top[1] - 0.12, top[2] + dz * 0.38];
      const m = [top[0] + dx * 0.2, top[1] + 0.1, top[2] + dz * 0.2];
      b.sweep(catmull([top, m, e] as any), [0.045, 0.01], { color: k % 2 ? GREEN : GREEN_L, bone: base, sides: 4, caps: "point" });
    }
    for (let k = 0; k < 3; k++) ball(0.04, "#5b3a1e", [top[0] + Math.sin(k * 2.1) * 0.05, top[1] - 0.05, top[2] + Math.cos(k * 2.1) * 0.05]);
  };
  palm(-0.75, 0.55, 0.9, 0.3, 1.0);
  palm(0.45, 0.6, 0.75, 0.25, -2.0);
  palm(-0.55, -0.35, 1.05, 0.25, 2.8);
  palm(0.3, -0.3, 0.6, 0.2, 0.2);

  // Tents
  const tent = (x: number, z: number, yaw: number, s: number, c1: string, c2: string) => {
    const TENT = paint((p, n) => (Math.floor((Math.atan2(p.z - z, p.x - x) + Math.PI) / (Math.PI / 4)) % 2 ? c1 : c2) as any);
    const l = b.lathe([[0, 0.34 * s], [0.4 * s, 0.0], [0.4 * s, 0.0], [0.38 * s, 0.0], [0, 0.34 * s]], { at: [x, 0.17, z], segments: 8, color: TENT, bone: base });
    void l;
    b.part(new THREE.ConeGeometry(0.42 * s, 0.4 * s, 8), TENT, { bone: base, at: [x, 0.17 + 0.2 * s, z], rotation: [0, yaw, 0], flat: true });
    cyl(0.01, 0.01, 0.2 * s, 4, TRUNK_D, [x, 0.17 + 0.5 * s, z]);
    part(new THREE.ConeGeometry(0.06 * s, 0.1 * s, 3), "#e84a4a", [x + 0.04 * s, 0.17 + 0.6 * s, z], [0, 0, -90]);
    // door
    part(new THREE.ConeGeometry(0.1 * s, 0.22 * s, 3), DARK, [x + Math.sin(yaw * Math.PI / 180) * 0.3 * s + 0.0, 0.17 + 0.1 * s, z + 0.33 * s], [0, 0, 0]);
    // lantern glow
    ball(0.03, "#ffd36a", [x + 0.2 * s, 0.17 + 0.05, z + 0.38 * s]);
  };
  tent(0.95, -0.2, 0, 1, "#e8503c", "#fff0d0");
  tent(0.45, -0.95, 20, 1.25, "#2f8fc0", "#fff0d0");
  tent(-1.1, -0.2, -10, 0.85, "#e8b030", "#fff0d0");

  // Camels
  const camel = (x: number, z: number, yaw: number, s: number) => {
    const g = new THREE.Group();
    void g;
    const rot = (dx: number, dy: number, dz: number) => {
      const c = Math.cos(yaw * Math.PI / 180), si = Math.sin(yaw * Math.PI / 180);
      return [x + (dx * c + dz * si) * s, 0.17 + dy * s, z + (-dx * si + dz * c) * s];
    };
    part(new THREE.SphereGeometry(0.17 * s, 8, 6), CAMEL, rot(0, 0.42, 0), [0, yaw, 0], [1, 0.9, 1.5]);
    ball(0.09 * s, CAMEL, rot(0, 0.64, -0.08).map((v, i) => v));
    ball(0.09 * s, CAMEL, rot(0, 0.64, 0.1));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const p = rot(sx * 0.1, 0.17, sz * 0.2);
      b.rod([p[0], p[1] + 0.1 * s, p[2]], [p[0], 0.17, p[2]], 0.03 * s, { color: CAMEL, bone: base, sides: 5 });
      cyl(0.035 * s, 0.035 * s, 0.03 * s, 5, DARK, [p[0], 0.185, p[2]]);
    }
    const n0 = rot(0, 0.5, 0.25), n1 = rot(0, 0.7, 0.35), n2 = rot(0, 0.82, 0.42);
    b.sweep(catmull([n0, n1, n2] as any), [0.06 * s, 0.04 * s], { color: CAMEL, bone: base, sides: 6 });
    const h = rot(0, 0.86, 0.5);
    part(new THREE.SphereGeometry(0.07 * s, 7, 5), CAMEL, h, undefined, [1, 0.9, 1.3]);
    ball(0.04 * s, "#e8c88a", rot(0, 0.83, 0.58));
    for (const sx of [-1, 1]) {
      ball(0.012 * s, DARK, rot(sx * 0.045, 0.89, 0.54));
      part(new THREE.ConeGeometry(0.02 * s, 0.05 * s, 4), CAMEL, rot(sx * 0.05, 0.94, 0.47));
    }
    // saddle blanket
    part(new THREE.BoxGeometry(0.3 * s, 0.03 * s, 0.22 * s), "#d83a5a", rot(0, 0.6, 0), [0, yaw, 0]);
    part(new THREE.BoxGeometry(0.32 * s, 0.02 * s, 0.06 * s), "#ffd36a", rot(0, 0.62, 0), [0, yaw, 0]);
    // tail
    b.rod(rot(0, 0.45, -0.25), rot(0, 0.3, -0.33), 0.012 * s, { color: CAMEL, bone: base, sides: 4 });
  };
  camel(-0.1, -0.7, 30, 1);
  camel(0.55, 0.95, -60, 0.85);

  return b.root;
}

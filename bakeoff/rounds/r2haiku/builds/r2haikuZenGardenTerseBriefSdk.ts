import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese garden",
  description:
    "A raked-gravel garden with a round pond, an arched plank bridge, a stone lantern, a cloud-pruned pine, rocks with moss, flowering shrubs and a bamboo fence.",
};

type P = [number, number, number];

const G = 0.27; // height of the raked gravel surface

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });
  const root = b.joint("garden", { at: [0, 0, 0] });
  const rand = rng(11);

  // Bake scale, rotation and position into the geometry, then add it as one part.
  const place = (
    g: THREE.BufferGeometry,
    at: P,
    color: string,
    o: { s?: P; rx?: number; ry?: number; rz?: number } = {},
  ) => {
    if (o.s) g.scale(o.s[0], o.s[1], o.s[2]);
    if (o.rx) g.rotateX(o.rx);
    if (o.ry) g.rotateY(o.ry);
    if (o.rz) g.rotateZ(o.rz);
    g.translate(at[0], at[1], at[2]);
    b.part(g, color, { at: [0, 0, 0], bone: root });
  };

  // ---------- Tray and gravel bed ----------
  place(new THREE.BoxGeometry(8, 0.25, 6), [0, 0.125, 0], "#4a3728");
  place(new THREE.BoxGeometry(7.7, 0.04, 5.7), [0, 0.25, 0], "#e7dfcc");

  // ---------- Raked rings around the main rock ----------
  const MAIN = { x: -0.9, z: 0.5 };
  for (const R of [0.95, 1.25, 1.55]) {
    const ring = new THREE.TorusGeometry(R, 0.018, 3, 40);
    ring.rotateX(Math.PI / 2);
    place(ring, [MAIN.x, G + 0.012, MAIN.z], "#cbbfa3");
  }

  // ---------- Pond ----------
  const PX = 1.2;
  const PZ = -0.5;
  const wall = new THREE.CylinderGeometry(1.5, 1.5, 0.06, 24, 1, true);
  place(wall, [PX, G + 0.03, PZ], "#6e6f6b");
  const rim = new THREE.RingGeometry(1.36, 1.6, 24);
  rim.rotateX(-Math.PI / 2);
  place(rim, [PX, G + 0.06, PZ], "#8d8b84");
  const water = new THREE.CircleGeometry(1.36, 24);
  water.rotateX(-Math.PI / 2);
  place(water, [PX, G + 0.035, PZ], "#2e7d8a");

  // ---------- Arched plank bridge across the pond (span along Z) ----------
  const R = 1.7; // half span
  const H = 0.55; // arch rise
  const N = 12;
  for (let i = 0; i < N; i++) {
    const a = (Math.PI * (i + 0.5)) / N;
    const n = Math.sqrt((R * Math.sin(a)) ** 2 + (H * Math.cos(a)) ** 2);
    const L = n * (Math.PI / N) * 1.25;
    const plank = new THREE.BoxGeometry(0.8, 0.06, L);
    plank.rotateX(Math.atan2(-H * Math.cos(a), -R * Math.sin(a)));
    place(plank, [PX, G + H * Math.sin(a) + 0.03, PZ + R * Math.cos(a)], "#9a6a42");
  }

  // ---------- Stone lantern (toro) ----------
  const LX = -2.3;
  const LZ = -0.9;
  const lantern = (g: THREE.BufferGeometry, y: number, c: string, o?: { s?: P; ry?: number }) =>
    place(g, [LX, G + y, LZ], c, o);
  lantern(new THREE.BoxGeometry(0.5, 0.08, 0.5), 0.04, "#8d8a80");
  lantern(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 6), 0.33, "#8d8a80");
  lantern(new THREE.BoxGeometry(0.36, 0.06, 0.36), 0.61, "#8d8a80");
  lantern(new THREE.BoxGeometry(0.34, 0.3, 0.34), 0.79, "#f4e7bf");
  lantern(new THREE.BoxGeometry(0.14, 0.2, 0.01), 0.79, "#4c4a47"); // lamp window frame
  // place() positions the window on the front face
  lantern(new THREE.BoxGeometry(0.4, 0.04, 0.4), 0.95, "#8d8a80");
  lantern(new THREE.ConeGeometry(0.42, 0.26, 4), 1.1, "#4c4a47", { ry: Math.PI / 4 });
  lantern(new THREE.SphereGeometry(0.05, 6, 4), 1.26, "#8d8a80");

  // ---------- Cloud-pruned pine ----------
  const TX = 2.0;
  const TZ = 1.9;
  const trunk = new THREE.CylinderGeometry(0.07, 0.14, 2.0, 7);
  place(trunk, [TX, G + 1.0, TZ], "#5b4232", { rz: -0.2 });
  const arm = new THREE.CylinderGeometry(0.035, 0.05, 0.9, 5);
  place(arm, [TX + 0.55, G + 1.65, TZ], "#5b4232", { rz: -1.2 });
  const pine = "#2f5f35";
  const pad = (r: number, s: P, at: P, c: string) =>
    place(new THREE.IcosahedronGeometry(r, 1), at, c, { s });
  pad(0.85, [1.35, 0.3, 1.0], [2.5, G + 2.25, TZ], pine);
  pad(0.55, [1.2, 0.35, 0.9], [1.75, G + 2.0, 1.75], "#376b3b");
  pad(0.5, [1.1, 0.35, 1.0], [3.3, G + 2.1, 2.05], "#376b3b");
  pad(0.45, [1.3, 0.3, 1.0], [2.7, G + 2.65, 1.7], "#4a8a4a");

  // ---------- Bamboo fence along the back ----------
  const FZ = -2.8;
  for (let i = 0; i <= 48; i++) {
    const x = -3.6 + i * 0.15;
    place(new THREE.CylinderGeometry(0.022, 0.022, 1.4, 6), [x, G + 0.7, FZ], "#c7ad6e");
  }
  place(new THREE.BoxGeometry(7.4, 0.05, 0.05), [0, G + 0.45, FZ], "#5a4630");
  place(new THREE.BoxGeometry(7.4, 0.05, 0.05), [0, G + 1.15, FZ], "#5a4630");

  // ---------- Rocks, with moss on two of them ----------
  const rocks = [
    { x: MAIN.x, z: MAIN.z, r: 0.55, sy: 0.95, ry: 0.4, c: "#7b786f", moss: true },
    { x: -1.9, z: 1.6, r: 0.32, sy: 0.7, ry: 1.1, c: "#5f5d58", moss: false },
    { x: -2.8, z: 0.5, r: 0.42, sy: 0.8, ry: 2.0, c: "#6f6c65", moss: false },
    { x: -0.3, z: -1.9, r: 0.5, sy: 0.6, ry: -0.7, c: "#5f5d58", moss: true },
    { x: 3.1, z: -1.5, r: 0.38, sy: 0.9, ry: 0.9, c: "#8a867c", moss: false },
  ];
  for (const k of rocks) {
    const cy = G + 0.55 * k.r * k.sy;
    place(new THREE.IcosahedronGeometry(k.r, 1), [k.x, cy, k.z], k.c, {
      s: [1, k.sy, 0.85],
      ry: k.ry,
    });
    if (k.moss) {
      place(
        new THREE.IcosahedronGeometry(k.r * 0.5, 1),
        [k.x + 0.05, cy + 0.9 * k.r * k.sy, k.z - 0.03],
        "#5d8a3c",
        { s: [1, 0.22, 1] },
      );
    }
  }

  // ---------- Stepping stones ----------
  for (const [x, z] of [
    [-0.2, 1.7],
    [0.45, 1.75],
    [1.0, 1.6],
  ]) {
    place(new THREE.CylinderGeometry(0.22, 0.25, 0.05, 8), [x, G + 0.025, z], "#8e8b82");
  }

  // ---------- Flowering shrubs ----------
  const shrubs: [number, number][] = [
    [-3.1, -1.7],
    [3.1, -0.2],
    [-1.9, -2.1],
  ];
  for (const [x, z] of shrubs) {
    const cy = G + 0.3;
    place(new THREE.IcosahedronGeometry(0.36, 1), [x, cy, z], "#3e6e3c", { s: [1.2, 0.85, 1] });
    for (let i = 0; i < 7; i++) {
      const th = rand() * Math.PI * 2;
      const ph = 0.4 + rand() * 0.9;
      const fx = x + 1.03 * 1.2 * 0.36 * Math.sin(ph) * Math.cos(th);
      const fy = cy + 1.03 * 0.85 * 0.36 * Math.cos(ph);
      const fz = z + 1.03 * 0.36 * Math.sin(ph) * Math.sin(th);
      place(new THREE.SphereGeometry(0.045, 5, 4), [fx, fy, fz], "#e88fa0");
    }
  }
}

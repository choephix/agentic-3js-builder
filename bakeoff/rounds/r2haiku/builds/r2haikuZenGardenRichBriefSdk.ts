import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese garden diorama",
  description:
    "Square garden base with a red arched bridge over a koi pond, a stone lantern, a cloud-pruned pine, a pink cherry tree dropping petals, raked gravel, mossy rocks and stepping stones.",
};

const G = 0.072; // height of the raked gravel top

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });
  const rand = rng(11);
  b.joint("root", { at: [0, 0, 0] });

  const put = (g: THREE.BufferGeometry, color: string, x: number, y: number, z: number) =>
    b.part(g, color, { at: [x, y, z] });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const ball = (r: number, ws = 9, hs = 6) => new THREE.SphereGeometry(r, ws, hs);
  const cyl = (rt: number, rb: number, h: number, seg: number) =>
    new THREE.CylinderGeometry(rt, rb, h, seg);
  const R = (lo: number, hi: number) => lo + (hi - lo) * rand();

  // ---------- Base and raked gravel ----------
  put(box(1.2, 0.06, 1.2), "#4a3425", 0, 0.03, 0);
  put(box(1.2, 0.012, 0.04), "#6b4a33", 0, 0.066, 0.58);
  put(box(1.2, 0.012, 0.04), "#6b4a33", 0, 0.066, -0.58);
  put(box(0.04, 0.012, 1.16), "#6b4a33", 0.58, 0.066, 0);
  put(box(0.04, 0.012, 1.16), "#6b4a33", -0.58, 0.066, 0);
  put(box(1.12, 0.012, 1.12), "#ece8df", 0, 0.066, 0);

  for (const r of [0.34, 0.4, 0.46, 0.52]) {
    const g = new THREE.TorusGeometry(r, 0.0035, 4, 80);
    g.rotateX(Math.PI / 2);
    g.scale(1, 1, 0.9);
    put(g, "#c9c2b3", 0, G, 0);
  }

  // ---------- Koi pond ----------
  const water = cyl(1, 1, 0.01, 28);
  water.scale(0.28, 1, 0.24);
  put(water, "#2c6a72", 0, G + 0.001, 0);

  const rimColors = ["#8e8c86", "#7a7c75", "#a19f97"];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = R(0.028, 0.04);
    const g = ball(r, 7, 5);
    g.scale(1.2, 0.6, 1);
    put(g, rimColors[i % 3], Math.cos(a) * 0.31, G + 0.008, Math.sin(a) * 0.265);
  }

  // Koi: flattened bodies with a patch on the back, tail pointing back along -Z.
  const koi = (x: number, z: number, h: number, body: string, patch: string) => {
    const place = (g: THREE.BufferGeometry, col: string, dy: number) => {
      g.rotateY(h);
      b.part(g, col, { at: [x, G + 0.012 + dy, z] });
    };
    const bd = ball(0.04, 10, 7);
    bd.scale(0.9, 0.36, 2.3);
    place(bd, body, 0);
    const pt = ball(0.036, 9, 6);
    pt.scale(0.78, 0.4, 1.9);
    place(pt, patch, 0.004);
    const tl = new THREE.ConeGeometry(0.022, 0.045, 5);
    tl.rotateX(-Math.PI / 2);
    tl.translate(0, 0, -0.1);
    place(tl, patch, 0);
  };
  koi(0.09, -0.07, 0.6, "#f4f1ea", "#f2772a");
  koi(-0.1, 0.05, -0.9, "#f2772a", "#fbf7ee");
  koi(0.02, 0.13, 2.5, "#f4f1ea", "#f2772a");

  // ---------- Red arched bridge spanning the pond along Z ----------
  const H = 0.2;
  const y0 = G + 0.03;
  const zA = -0.36;
  const zB = 0.36;
  const L = zB - zA;
  const yAt = (t: number) => y0 + H * 4 * t * (1 - t);
  const zAt = (t: number) => zA + L * t;
  const bp = (t: number, dx: number, dy: number): number[] => [dx, yAt(t) + dy, zAt(t)];

  const N = 12;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const slope = (H * 4 * (1 - 2 * t)) / L;
    const th = Math.atan(slope);
    const g = box(0.26, 0.02, (L / N) * 0.9);
    g.rotateX(-th);
    put(g, "#b8382c", 0, yAt(t), zAt(t));
  }

  // Handrails and posts on both sides.
  for (const side of [-0.12, 0.12]) {
    const rail: number[][] = [];
    for (let i = 0; i <= 10; i++) rail.push(bp(i / 10, side, 0.1));
    b.sweep(rail, 0.012, { color: "#9e2f25" });
    for (const t of [0.1, 0.3, 0.5, 0.7, 0.9]) {
      b.sweep([bp(t, side, 0), bp(t, side, 0.1)], 0.01, { color: "#9e2f25" });
    }
  }

  // ---------- Stepping stones leading to the bridge ----------
  const stones: [number, number][] = [
    [-0.14, 0.52],
    [-0.06, 0.455],
    [0.02, 0.395],
  ];
  for (const [x, z] of stones) {
    const g = cyl(0.05, 0.056, 0.018, 8);
    g.rotateY(R(0, Math.PI));
    put(g, "#8d8a82", x, G + 0.009, z);
  }

  // ---------- Stone lantern (tōrō) ----------
  const lx = -0.36;
  const lz = 0.22;
  const lp = (g: THREE.BufferGeometry, col: string, dx: number, dy: number, dz: number) =>
    put(g, col, lx + dx, G + dy, lz + dz);
  const stone = "#9a9891";
  lp(box(0.12, 0.03, 0.12), stone, 0, 0.015, 0);
  lp(cyl(0.035, 0.045, 0.09, 6), stone, 0, 0.075, 0);
  lp(box(0.1, 0.02, 0.1), stone, 0, 0.13, 0);
  lp(box(0.08, 0.07, 0.08), stone, 0, 0.175, 0);
  lp(box(0.045, 0.045, 0.012), "#ffd27a", 0, 0.175, 0.045);
  const roof = cyl(0.02, 0.095, 0.05, 4);
  roof.rotateY(Math.PI / 4);
  lp(roof, "#4b4a48", 0, 0.235, 0);
  lp(new THREE.ConeGeometry(0.012, 0.04, 6), "#4b4a48", 0, 0.28, 0);

  // ---------- Cloud-pruned pine ----------
  const px = 0.38;
  const pz = -0.24;
  b.sweep(
    [
      [px, G, pz],
      [px + 0.01, G + 0.2, pz + 0.01],
      [px - 0.01, G + 0.36, pz],
    ],
    0.022,
    { color: "#5b3f2c" },
  );
  const pads: [number, number, number, number][] = [
    [0, 0.2, 0, 0.13],
    [-0.15, 0.3, 0.05, 0.095],
    [0.14, 0.33, -0.06, 0.1],
    [0, 0.4, 0, 0.11],
    [-0.06, 0.5, 0.03, 0.08],
    [0.07, 0.54, -0.03, 0.065],
  ];
  for (const [dx, dy, dz, r] of pads) {
    b.sweep(
      [
        [px, G + dy * 0.65, pz],
        [px + dx, G + dy, pz + dz],
      ],
      0.009,
      { color: "#5b3f2c" },
    );
    const cx = px + dx;
    const cy = G + dy;
    const cz = pz + dz;
    const main = ball(r, 9, 6);
    main.scale(1.3, 0.5, 1.3);
    put(main, "#2d5d3b", cx, cy, cz);
    const puffA = ball(r * 0.6, 8, 5);
    puffA.scale(1.1, 0.6, 1.1);
    put(puffA, "#3f7548", cx - r * 0.5, cy + r * 0.25, cz + r * 0.35);
    const puffB = ball(r * 0.55, 8, 5);
    puffB.scale(1.1, 0.6, 1.1);
    put(puffB, "#3f7548", cx + r * 0.5, cy + r * 0.2, cz - r * 0.3);
  }

  // ---------- Cherry tree in full bloom ----------
  const cx = -0.38;
  const cz = -0.3;
  b.sweep(
    [
      [cx, G, cz],
      [cx + 0.02, G + 0.16, cz - 0.02],
      [cx - 0.02, G + 0.3, cz],
      [cx - 0.03, G + 0.34, cz + 0.01],
    ],
    0.028,
    { color: "#4a3328" },
  );
  const branches: number[][][] = [
    [
      [cx - 0.02, G + 0.3, cz],
      [cx - 0.13, G + 0.4, cz + 0.03],
      [cx - 0.25, G + 0.46, cz + 0.06],
    ],
    [
      [cx, G + 0.33, cz],
      [cx + 0.1, G + 0.42, cz - 0.06],
      [cx + 0.22, G + 0.47, cz - 0.1],
    ],
    [
      [cx - 0.03, G + 0.34, cz],
      [cx - 0.06, G + 0.46, cz - 0.12],
      [cx - 0.1, G + 0.55, cz - 0.2],
    ],
    [
      [cx - 0.01, G + 0.32, cz],
      [cx + 0.02, G + 0.5, cz + 0.1],
      [cx + 0.05, G + 0.58, cz + 0.16],
    ],
  ];
  for (const br of branches) b.sweep(br, 0.012, { color: "#4a3328" });

  const blossomColors = ["#f7bcd0", "#f29bb6", "#fde3ec"];
  for (let i = 0; i < 80; i++) {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const rr = Math.cbrt(rand());
    const x = cx + 0.2 * rr * Math.sin(ph) * Math.cos(th);
    const y = G + 0.5 + 0.14 * rr * Math.cos(ph);
    const z = cz + 0.2 * rr * Math.sin(ph) * Math.sin(th);
    put(ball(R(0.028, 0.046), 6, 5), blossomColors[i % 3], x, y, z);
  }

  // Falling petals: some settled on the gravel, some still in the air.
  for (let i = 0; i < 36; i++) {
    const g = new THREE.PlaneGeometry(0.024, 0.016);
    if (i % 2 === 0) {
      g.rotateX(-Math.PI / 2);
      g.rotateY(R(0, Math.PI));
      put(g, "#f7b3c6", R(-0.55, 0.5), G + 0.003, R(-0.55, 0.5));
    } else {
      g.rotateX(R(0, Math.PI));
      g.rotateY(R(0, Math.PI));
      put(g, "#f7b3c6", cx + R(-0.3, 0.3), G + R(0.15, 0.7), cz + R(-0.3, 0.3));
    }
  }

  // ---------- Mossy rocks ----------
  const rock = (x: number, z: number, r: number, sx: number, sz: number, rot: number) => {
    const body = ball(r, 9, 6);
    body.scale(sx, 0.7, sz);
    body.rotateY(rot);
    put(body, "#8b8a84", x, G + 0.2 * r, z);
    const moss = ball(r * 0.8, 9, 5);
    moss.scale(1.08 * sx, 0.38, 1.08 * sz);
    moss.rotateY(rot);
    put(moss, "#5e7d3a", x, G + 0.62 * r, z);
  };
  rock(0.3, 0.12, 0.05, 1.2, 1.0, 0.3);
  rock(-0.3, -0.14, 0.06, 1.0, 1.1, 1.0);
  rock(0.42, 0.1, 0.045, 1.1, 1.0, 2.0);
  rock(-0.22, -0.42, 0.055, 1.0, 1.2, 0.7);
  rock(0.24, -0.45, 0.04, 1.2, 1.0, 1.5);
  rock(-0.2, 0.34, 0.035, 1.0, 1.0, 0.2);

  return b.root;
}

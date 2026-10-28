import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Wizard's Bookshelf",
  "description": "A tall, crooked high-fantasy anime bookshelf of dark carved wood crammed with glowing tomes, scrolls, crystal orbs and dripping candles."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  woodDark: "#3a2418",
  woodMid: "#6b4528",
  woodLight: "#9a6a3a",
  gold: "#e8b830",
  goldDark: "#a67a1c",
  backPanel: "#2a1a3a",
  bookRed: "#a8283a",
  bookBlue: "#2d4fa8",
  bookGreen: "#2f7a52",
  bookPurple: "#6a3a9a",
  bookTeal: "#2a8a9a",
  bookCream: "#efe0b8",
  parchment: "#f2e2b4",
  parchmentDark: "#c9a96a",
  ribbon: "#d83a5a",
  orbTeal: "#4ff0ff",
  orbViolet: "#b06aff",
  runeGlow: "#7affd8",
  candleWax: "#f6ecd2",
  flame: "#ffb43a",
  flameCore: "#fff2a0",
  ink: "#1a1024",
};
const M = {
  floor: [0, 0, 0] as [number, number, number],
  plinthTop: [0, 0.14, 0] as [number, number, number],
  shelf1: [0, 0.42, 0] as [number, number, number],
  shelf2: [0, 0.85, 0] as [number, number, number],
  shelf3: [0, 1.28, 0] as [number, number, number],
  shelf4: [0, 1.7, 0] as [number, number, number],
  crownBase: [0, 2, 0] as [number, number, number],
  innerLeft: [0.84, 0, 0] as [number, number, number],
  innerRight: [-0.84, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // carcass
  (() => {
function buildCarcass({ b, P, M }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const WD = P.woodDark, WM = P.woodMid, WL = P.woodLight, G = P.gold, GD = P.goldDark;

  // plinth with feet
  box(1.8, 0.1, 0.5, WD, 0, 0.09, 0);
  box(1.84, 0.03, 0.52, WM, 0, 0.145, 0.0);
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.16, 0.08, 0.16, WM, sx * 0.8, 0.04, sz * 0.2);
    box(0.17, 0.015, 0.17, G, sx * 0.8, 0.085, sz * 0.2);
  }

  // side panels
  for (const s of [1, -1]) {
    const x = s * 0.87;
    box(0.06, 1.83, 0.5, WM, x, 1.055, 0);
    // front edge strips
    box(0.07, 1.83, 0.03, WL, x, 1.055, 0.235);
    box(0.012, 1.8, 0.012, G, s * 0.835, 1.055, 0.255);
    box(0.012, 1.8, 0.012, G, s * 0.905, 1.055, 0.255);
    // outer rune bands
    for (const y of [0.3, 1.0, 1.7]) {
      box(0.012, 0.05, 0.4, GD, s * 0.903, y, 0);
      for (let i = 0; i < 6; i++)
        glow(box(0.014, 0.03, 0.02, P.runeGlow, s * 0.91, y, -0.15 + i * 0.06), 1.2);
    }
    // corner posts
    box(0.09, 0.05, 0.52, WD, x, 0.2, 0);
  }

  // back panel
  box(1.68, 1.84, 0.03, P.backPanel, 0, 1.06, -0.22);
  for (let r = 0; r < 4; r++) {
    const y = 0.64 + r * 0.43;
    for (let i = 0; i < 12; i++) {
      const h = 0.025 + ((i * 7 + r * 3) % 4) * 0.01;
      glow(box(0.014, h, 0.006, P.runeGlow, -0.75 + i * 0.136, y, -0.2), 0.6);
      if (i % 3 == 0) glow(box(0.035, 0.012, 0.006, P.runeGlow, -0.75 + i * 0.136, y + 0.02, -0.2), 0.6);
    }
  }

  // shelves
  for (const sy of [M.shelf1[1], M.shelf2[1], M.shelf3[1], M.shelf4[1]]) {
    box(1.68, 0.04, 0.46, WL, 0, sy - 0.02, -0.01);
    box(1.68, 0.045, 0.02, WM, 0, sy - 0.025, 0.225);
    box(1.68, 0.012, 0.012, G, 0, sy - 0.01, 0.238);
    box(1.68, 0.01, 0.01, GD, 0, sy - 0.045, 0.235);
  }

  // top board + cornice
  box(1.68, 0.05, 0.48, WL, 0, 1.975, -0.01);
  box(1.86, 0.05, 0.5, WD, 0, 1.965, 0);
  box(1.9, 0.04, 0.5, WM, 0, 2 - 0.02 + 0.0, 0);
  box(1.9, 0.012, 0.012, G, 0, 1.985, 0.255);
  // dentil blocks
  for (let i = 0; i < 17; i++) box(0.05, 0.03, 0.03, WL, -0.8 + i * 0.1, 1.93, 0.245);
  // bottom bay kick trim
  box(1.68, 0.02, 0.02, G, 0, 0.165, 0.235);
}
    return buildCarcass;
  })(),
  // crown
  (() => {
function buildCrown({ b, P, M }: any) {
  const Y0 = M.crownBase[1];
  const wood = P.woodDark, mid = P.woodMid, light = P.woodLight, gold = P.gold, gd = P.goldDark;

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, Y0 + y, z] });

  // stepped arch base
  box(1.9, 0.05, 0.44, 0, 0.025, 0, wood);
  box(1.9, 0.015, 0.46, 0, 0.055, 0, gold);
  box(1.5, 0.07, 0.38, 0, 0.1, 0, mid);
  box(1.1, 0.07, 0.34, 0, 0.17, 0, wood);
  box(0.7, 0.07, 0.3, 0, 0.24, 0, mid);
  box(0.36, 0.05, 0.26, 0, 0.285, 0, wood);
  // gold step trim on the front
  for (const [w, y] of [[1.5, 0.138], [1.1, 0.208], [0.7, 0.278]] as [number, number][])
    box(w, 0.012, 0.012, 0, y, 0.19 - (w < 1 ? 0.04 : 0) , gold);
  // side wings
  for (const s of [1, -1]) {
    box(0.3, 0.12, 0.4, s * 0.72, 0.13, 0, mid);
    box(0.3, 0.01, 0.41, s * 0.72, 0.195, 0, gold);
    // finials
    b.part(new THREE.ConeGeometry(0.05, 0.17, 6), gold, { at: [s * 0.86, Y0 + 0.28, 0.0] });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), gd, { at: [s * 0.86, Y0 + 0.19, 0] });
    b.part(new THREE.ConeGeometry(0.03, 0.1, 6), light, { at: [s * 0.62, Y0 + 0.24, 0] });
    // carved rune notches
    for (let i = 0; i < 3; i++)
      box(0.03, 0.05, 0.012, s * (0.6 + i * 0.1), 0.13, 0.2, P.runeGlow);
    // tassels
    const tx = s * 0.8;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6), gold, { at: [tx, Y0 + 0.255, 0.2] });
    b.part(new THREE.BoxGeometry(0.03, 0.12, 0.012), P.ribbon, { at: [tx, Y0 + 0.19, 0.2] });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.012), P.ribbon, { at: [tx + s * 0.015, Y0 + 0.11, 0.2], rotation: [0, 0, 40] });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), gold, { at: [tx, Y0 + 0.1, 0.2] });
    b.part(new THREE.ConeGeometry(0.03, 0.07, 6), gd, { at: [tx, Y0 + 0.045, 0.2], rotation: [180, 0, 0] });
  }

  // gold crescent moon: ring + cut
  const moon = new THREE.Shape();
  moon.absarc(0, 0, 0.1, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0.05, 0.02, 0.085, 0, Math.PI * 2, true);
  moon.holes.push(hole);
  b.part(new THREE.ExtrudeGeometry(moon, { depth: 0.03, bevelEnabled: false, curveSegments: 14 }), gold,
    { at: [-0.08, Y0 + 0.2, 0.18] });

  // stars
  const star = (x: number, y: number, r: number) => {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    b.part(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), gold, { at: [x, Y0 + y, 0.18] });
  };
  star(0.14, 0.13, 0.04);
  star(0.3, 0.2, 0.03);
  star(-0.3, 0.12, 0.025);
  star(0.5, 0.12, 0.025);
  star(-0.5, 0.2, 0.03);

  // violet gem in gold setting at the centre top
  b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 8), gold, { at: [0, Y0 + 0.32, 0.0] });
  glow(b.part(new THREE.OctahedronGeometry(0.05, 0), P.orbViolet, { at: [0, Y0 + 0.24, 0.14], scale: [1, 1.2, 1] }), 1.5);
  b.part(new THREE.ConeGeometry(0.025, 0.06, 6), gold, { at: [-0.1, Y0 + 0.26, 0] });
  b.part(new THREE.ConeGeometry(0.025, 0.06, 6), gold, { at: [0.1, Y0 + 0.26, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.02, 0), P.runeGlow, { at: [0, Y0 + 0.12, 0.2] }), 1.2);
}
    return buildCrown;
  })(),
  // tomes
  (() => {
function buildTomes({ b, J, P, M }: any) {
  const R = rng(11);
  const cols = [P.bookRed, P.bookBlue, P.bookGreen, P.bookPurple, P.bookTeal];
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, 0, rz] });
  const gem = (x: number, y: number, z: number, c: string, r = 0.012) =>
    b.part(new THREE.OctahedronGeometry(r), c, { at: [x, y, z] });

  // Book: spine faces +Z. Base at y, centre x. Optionally tilted.
  const book = (x: number, base: number, w: number, h: number, d: number, c: string, z = 0, tilt = 0) => {
    const cy = base + h / 2;
    const rot = tilt * 180 / Math.PI;
    // page block
    b.part(new THREE.BoxGeometry(w * 0.82, h * 0.94, d * 0.9), P.bookCream, { at: [x, cy, z - 0.01], rotation: [0, 0, rot] });
    // cover shell (spine + covers)
    b.part(new THREE.BoxGeometry(w, h, d * 0.3), c, { at: [x, cy, z + d * 0.38], rotation: [0, 0, rot] });
    b.part(new THREE.BoxGeometry(0.01, h, d), c, { at: [x - w / 2, cy, z], rotation: [0, 0, rot] });
    b.part(new THREE.BoxGeometry(0.01, h, d), c, { at: [x + w / 2, cy, z], rotation: [0, 0, rot] });
    // gold bands on spine
    const s = Math.sin(tilt), co = Math.cos(tilt);
    for (const f of [0.25, 0.75]) {
      const oy = (f - 0.5) * h;
      b.part(new THREE.BoxGeometry(w * 1.04, 0.012, 0.012), P.gold, {
        at: [x - s * oy, cy + co * oy, z + d * 0.54], rotation: [0, 0, rot] });
    }
    if (R() < 0.5) gem(x, cy, z + d * 0.55, [P.orbTeal, P.orbViolet, P.ribbon][Math.floor(R() * 3)]);
  };

  // Shelf rows
  const row = (shelfY: number, x0: number, x1: number, maxH: number) => {
    let x = x0;
    while (x < x1 - 0.06) {
      const w = 0.04 + R() * 0.05, h = maxH * (0.6 + R() * 0.4), d = 0.26 + R() * 0.08;
      if (x + w > x1) break;
      book(x + w / 2, shelfY, w, h, d, cols[Math.floor(R() * cols.length)]);
      x += w + 0.004;
    }
    return x;
  };

  // Shelf 1 (y 0.42): giant chest tome on the left, tall tomes right
  const s1 = M.shelf1[1] + 0.025;
  box(0.62, 0.2, 0.34, P.bookPurple, -0.5, s1 + 0.1, 0.0);
  box(0.58, 0.17, 0.3, P.bookCream, -0.5, s1 + 0.1, -0.01);
  box(0.62, 0.2, 0.02, P.bookPurple, -0.5, s1 + 0.1, 0.17);
  box(0.6, 0.03, 0.36, P.goldDark, -0.5, s1 + 0.215, 0.0);
  box(0.5, 0.012, 0.26, P.runeGlow, -0.5, s1 + 0.235, 0.0);
  b.part(new THREE.TorusGeometry(0.07, 0.01, 5, 10), P.runeGlow, { at: [-0.5, s1 + 0.245, 0], rotation: [90, 0, 0] });
  box(0.05, 0.05, 0.02, P.gold, -0.5, s1 + 0.12, 0.185);
  gem(-0.5, s1 + 0.12, 0.2, P.orbViolet, 0.018);
  for (const sx of [-0.78, -0.22]) box(0.03, 0.2, 0.36, P.gold, sx, s1 + 0.1, 0);
  row(s1, -0.12, 0.83, 0.36);

  // Shelf 2 (y 0.85): books on the left half (x>0 side), leaning ones
  const s2 = M.shelf2[1] + 0.025;
  const e2 = row(s2, 0.08, 0.6, 0.33);
  book(e2 + 0.1, s2 + 0.005, 0.05, 0.3, 0.26, P.bookGreen, 0, -0.28);
  book(0.72, s2, 0.06, 0.31, 0.27, P.bookBlue);
  // flat stack
  book(0.26, s2, 0.3, 0.05, 0.24, P.bookRed, 0, 0);
  // Shelf 3 left side (x>0)
  const s3 = M.shelf3[1] + 0.025;
  const e3 = row(s3, 0.1, 0.6, 0.34);
  book(e3 + 0.09, s3 + 0.005, 0.05, 0.3, 0.26, P.bookTeal, 0, 0.3);
  // tilted stack at 3
  const sx = 0.72;
  book(sx, s3, 0.2, 0.05, 0.24, P.bookPurple);
  book(sx + 0.01, s3 + 0.05, 0.18, 0.05, 0.22, P.bookRed);
  book(sx - 0.01, s3 + 0.1, 0.16, 0.045, 0.2, P.bookGreen);
  // ribbon bookmarks and clasp
  box(0.014, 0.12, 0.004, P.ribbon, 0.2, s2 - 0.02, 0.15);
  box(0.014, 0.1, 0.004, P.ribbon, 0.62, s3 - 0.02, 0.15);
  box(0.03, 0.02, 0.01, P.gold, sx, s3 + 0.1, 0.12);
}
    return buildTomes;
  })(),
  // scrolls
  (() => {
function buildScrolls({ b, P }: any) {
  const R = rng(11);
  const Y0 = 0.85;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, dir });

  // rack frame: x from -0.82 to -0.12, three columns, two rows
  const x0 = -0.82, x1 = -0.12, rackY0 = Y0 + 0.01, rackH = 0.3, rz = -0.02, rd = 0.34;
  const cols = 3, rows = 2;
  const cw = (x1 - x0) / cols, rh = rackH / rows;
  box(x1 - x0, 0.02, rd, P.woodMid, (x0 + x1) / 2, rackY0 + 0.01, rz);
  box(x1 - x0, 0.025, rd, P.woodLight, (x0 + x1) / 2, rackY0 + rackH + 0.0125, rz);
  for (let i = 0; i <= cols; i++) {
    box(0.02, rackH, rd, P.woodMid, x0 + i * cw, rackY0 + rackH / 2, rz);
    box(0.024, 0.04, 0.02, P.gold, x0 + i * cw, rackY0 + rackH - 0.03, rz + rd / 2 + 0.005);
  }
  for (let j = 1; j < rows; j++) box(x1 - x0, 0.018, rd, P.woodMid, (x0 + x1) / 2, rackY0 + j * rh, rz);
  // gold trim on top front
  box(x1 - x0, 0.012, 0.01, P.gold, (x0 + x1) / 2, rackY0 + rackH + 0.01, rz + rd / 2 + 0.006);
  // rack back
  box(x1 - x0, rackH, 0.01, P.woodDark, (x0 + x1) / 2, rackY0 + rackH / 2, rz - rd / 2 + 0.01);

  // scrolls in pigeonholes
  const paper = [P.parchment, P.parchmentDark, P.bookCream];
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const cx = x0 + (i + 0.5) * cw;
      const cy = rackY0 + j * rh + rh / 2 + 0.005;
      const n = 1 + Math.floor(R() * 2);
      for (let k = 0; k < n; k++) {
        const ox = (k - (n - 1) / 2) * 0.07 + (R() - 0.5) * 0.01;
        const oy = (R() - 0.5) * 0.02;
        const r = 0.032 + R() * 0.008;
        const len = 0.3;
        const c = paper[(i + j + k) % 3];
        const at = [cx + ox, cy + oy - 0.01, rz];
        cyl(r, r, len, c, at, [0, 0, 1], 8);
        for (const s of [1, -1]) {
          cyl(0.012, 0.012, 0.03, P.gold, [at[0], at[1], rz + s * (len / 2 + 0.012)], [0, 0, 1], 6);
          b.part(new THREE.SphereGeometry(0.02, 6, 4), P.gold, { at: [at[0], at[1], rz + s * (len / 2 + 0.03)] });
        }
        // ribbon tie
        cyl(r + 0.004, r + 0.004, 0.018, P.ribbon, [at[0], at[1], rz + 0.07], [0, 0, 1], 8);
        // wax seal
        b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 8), P.bookRed, {
          at: [at[0], at[1] + r + 0.002, rz + 0.07],
          dir: [0, 1, 0],
        });
      }
    }

  // hanging unrolled scrolls over shelf edge (front)
  for (const [hx, hh] of [[-0.62, 0.12], [-0.3, 0.15]] as number[][]) {
    const zf = 0.2;
    const top = Y0 + 0.2;
    cyl(0.02, 0.02, 0.1, P.parchmentDark, [hx, top, zf - 0.02], [1, 0, 0], 8);
    box(0.09, hh, 0.008, P.parchment, hx, top - hh / 2, zf);
    cyl(0.015, 0.015, 0.1, P.parchmentDark, [hx, top - hh, zf + 0.005], [1, 0, 0], 8);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.014, 6, 4), P.gold, { at: [hx + s * 0.055, top - hh, zf + 0.005] });
    for (let k = 0; k < 4; k++) {
      const w = 0.03 + R() * 0.035;
      box(w, 0.008, 0.004, k % 2 ? P.runeGlow : P.bookTeal, hx + (R() - 0.5) * 0.02, top - 0.02 - k * (hh - 0.04) / 4, zf + 0.007);
    }
  }
  // loose scroll lying in front
  cyl(0.03, 0.03, 0.2, P.parchment, [-0.45, Y0 + 0.03, 0.12], [1, 0, 0.15], 8);
  cyl(0.032, 0.032, 0.02, P.ribbon, [-0.45, Y0 + 0.03, 0.12], [1, 0, 0.15], 8);

  // ink bottles
  const inks = [P.bookPurple, P.bookTeal];
  inks.forEach((c, i) => {
    const x = -0.06 + 0 - i * 0.07 - 0.0;
    const px = -0.1 - i * 0.07 + 0.0;
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.06, 8), c, { at: [px, Y0 + 0.03, 0.12 - i * 0.03] });
    cyl(0.014, 0.018, 0.03, P.woodDark, [px, Y0 + 0.075, 0.12 - i * 0.03], [0, 1, 0], 6);
    b.part(new THREE.SphereGeometry(0.012, 6, 4), P.ink, { at: [px, Y0 + 0.098, 0.12 - i * 0.03] });
    void x;
  });
  // quill
  cyl(0.003, 0.003, 0.22, P.bookCream, [-0.04, Y0 + 0.2 * 0 + 0.045, 0.18], [0.5, 0.3, 0.8], 5);
  b.part(new THREE.ConeGeometry(0.02, 0.14, 4), P.bookRed, { at: [-0.0, Y0 + 0.075, 0.25], dir: [0.5, 0.3, 0.8] });
  b.part(new THREE.CylinderGeometry(0.015, 0.002, 0.04, 5), P.ink, { at: [-0.08, Y0 + 0.02, 0.12], dir: [-0.5, -0.3, -0.8] });
}
    return buildScrolls;
  })(),
  // orbsCandles
  (() => {
function buildOrbsCandles({ b, J, P, M }: any) {
  const R = rng(11);
  const y3 = M.shelf3[1];
  const y4 = M.shelf4[1];

  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // ---------- big teal orb on gold claw stand (shelf3, right side, x<0) ----------
  const ox = -0.42, oz = 0.02;
  const base = y3 + 0.012;
  put(cyl(0.15, 0.17, 0.03, 10), P.goldDark, [ox, base + 0.015, oz]);
  put(cyl(0.1, 0.14, 0.04, 10), P.gold, [ox, base + 0.05, oz]);
  put(cyl(0.05, 0.07, 0.05, 8), P.gold, [ox, base + 0.095, oz]);
  const orbY = base + 0.27;
  const orbR = 0.17;
  // claws
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const cx = ox + Math.cos(a) * 0.12, cz = oz + Math.sin(a) * 0.12;
    b.rod([cx, base + 0.07, cz], [ox + Math.cos(a) * 0.145, orbY - 0.07, oz + Math.sin(a) * 0.145], 0.014, P.gold);
    put(sph(0.02, 6, 5), P.gold, [cx, base + 0.07, cz]);
    b.spike([ox + Math.cos(a) * 0.145, orbY - 0.07, oz + Math.sin(a) * 0.145], [-Math.cos(a) * 0.5, 0.8, -Math.sin(a) * 0.5], 0.06, 0.016, { color: P.gold });
  }
  glow(put(sph(orbR, 14, 10), P.orbTeal, [ox, orbY, oz]), 1.3);
  glow(put(sph(0.1, 10, 8), "#c8ffff", [ox, orbY, oz]), 1.6);
  // swirl rings
  const rings: [number, number, number][] = [[80, 0, 0.13], [20, 50, 0.145], [-30, 110, 0.12]];
  for (const [rx, rz, r] of rings) {
    glow(put(new THREE.TorusGeometry(r, 0.006, 5, 16), P.runeGlow, [ox, orbY, oz], { rotation: [rx, 0, rz] }), 1.5);
  }
  glow(put(sph(0.018, 6, 4), "#ffffff", [ox + 0.07, orbY + 0.09, oz + 0.1]), 2);

  // ---------- small violet orb on pedestal (shelf4, left, x>0) ----------
  const vx = 0.55, vz = 0.0;
  put(cyl(0.08, 0.09, 0.025, 8), P.goldDark, [vx, y4 + 0.0125, vz]);
  put(cyl(0.035, 0.055, 0.07, 8), P.gold, [vx, y4 + 0.06, vz]);
  put(cyl(0.065, 0.04, 0.02, 8), P.gold, [vx, y4 + 0.105, vz]);
  glow(put(sph(0.07, 12, 8), P.orbViolet, [vx, y4 + 0.18, vz]), 1.3);
  glow(put(sph(0.035, 8, 6), "#ead0ff", [vx, y4 + 0.18, vz]), 1.6);
  glow(put(new THREE.TorusGeometry(0.058, 0.004, 4, 12), "#e0b8ff", [vx, y4 + 0.18, vz], { rotation: [70, 0, 20] }), 1.5);

  // ---------- candle cluster with gold holder (shelf4, x ~ -0.1..-0.7) ----------
  put(cyl(0.3, 0.32, 0.025, 12), P.goldDark, [-0.35, y4 + 0.0125, 0.0]);
  put(cyl(0.28, 0.3, 0.015, 12), P.gold, [-0.35, y4 + 0.032, 0.0]);
  const candles: [number, number, number, number][] = [
    [-0.35, 0.0, 0.2, 0.04],
    [-0.22, 0.06, 0.15, 0.034],
    [-0.5, -0.04, 0.18, 0.036],
    [-0.14, -0.06, 0.12, 0.03],
    [-0.6, 0.07, 0.15, 0.03],
    [-0.4, 0.1, 0.1, 0.028],
  ];
  const wax = P.candleWax;
  candles.forEach(([x, z, h, r], i) => {
    const y0 = y4 + 0.04;
    put(cyl(r, r * 1.05, h, 8), wax, [x, y0 + h / 2, z]);
    put(cyl(r * 1.5, r * 1.6, 0.012, 8), P.gold, [x, y0 + 0.006, z]);
    // melt pool on top
    put(cyl(r * 1.1, r * 1.1, 0.01, 8), "#fff8e4", [x, y0 + h + 0.004, z]);
    // drips
    const nd = 2 + (i % 2);
    for (let k = 0; k < nd; k++) {
      const a = R() * Math.PI * 2;
      const dl = 0.04 + R() * Math.min(0.1, h * 0.5);
      const dx = x + Math.cos(a) * r * 0.95, dz = z + Math.sin(a) * r * 0.95;
      put(new THREE.BoxGeometry(0.016, dl, 0.016), wax, [dx, y0 + h - dl / 2, dz]);
      put(sph(0.011, 6, 4), wax, [dx, y0 + h - dl, dz]);
    }
    // wick
    put(cyl(0.003, 0.003, 0.025, 4), P.ink, [x, y0 + h + 0.017, z]);
    // flame
    const fy = y0 + h + 0.065;
    glow(put(new THREE.ConeGeometry(0.02, 0.07, 6), P.flame, [x, fy, z]), 1.6);
    glow(put(sph(0.02, 6, 5), P.flame, [x, fy - 0.025, z]), 1.6);
    glow(put(new THREE.ConeGeometry(0.01, 0.045, 5), P.flameCore, [x, fy - 0.008, z]), 2);
  });

  // ---------- floating sparkle diamonds ----------
  const sp: [number, number, number, string][] = [
    [-0.42, y3 + 0.62, 0.1, P.runeGlow],
    [-0.28, y3 + 0.5, -0.08, P.orbTeal],
    [-0.6, y3 + 0.55, 0.06, "#ffffff"],
    [0.45, y4 + 0.34, 0.08, P.orbViolet],
    [0.65, y4 + 0.3, -0.05, "#ead0ff"],
    [-0.2, y4 + 0.27, 0.05, P.flameCore],
    [-0.57, y4 + 0.27, 0.0, P.flame],
  ];
  sp.forEach(([x, y, z, c], i) => {
    const s = 0.018 + (i % 3) * 0.006;
    glow(put(new THREE.OctahedronGeometry(s, 0), c, [x, y, z], { scale: [1, 1.6, 1], rotation: [0, i * 30, 0] }), 1.8);
  });
}
    return buildOrbsCandles;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

```ts
import * as THREE from "three";
import { createBuilder, catmull, arc, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "1930s desktop typewriter in glossy racing green: four staggered rows of round chrome-rimmed keys with cream letters, a semicircle of type bars, platen with a half-typed sheet, chrome carriage return lever and a brass maker's badge.",
};

const GREEN = "#0e4a2d";
const DKGREEN = "#082e1c";
const CHROME = "#d3d9dc";
const BLACK = "#121414";
const BRASS = "#c9a227";
const PAPER = "#f2ebd6";
const INK = "#26262c";

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const root = b.joint("base", { at: [0, 0.1, 0] });
  const carriage = b.joint("carriage", { parent: root, at: [0, 0.262, -0.085], dir: [1, 0, 0], role: "hinge" });
  const lever = b.joint("returnLever", {
    parent: carriage,
    at: [0.18, 0.292, -0.09],
    dir: [0.6, 0.6, 0.3],
    role: "hinge",
  });

  // ---- main body: side profile (z, y) extruded across the width
  b.extrude(
    [
      [-0.2, 0],
      [0.21, 0],
      [0.21, 0.04],
      [0.03, 0.115],
      [-0.14, 0.115],
      [-0.14, 0.15],
      [-0.2, 0.15],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.34, bevel: 0.006, color: GREEN, bone: root },
  );
  // dark plinth strip and feet
  b.part(new THREE.BoxGeometry(0.346, 0.012, 0.41), DKGREEN, { at: [0, 0.006, 0.005], bone: root });
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.CylinderGeometry(0.016, 0.018, 0.012, 8), BLACK, {
        at: [sx * 0.15, 0.002, sz * 0.16],
        bone: root,
      });

  // side frames carrying the carriage
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.2, 0.12],
        [-0.2, 0.27],
        [-0.1, 0.295],
        [0.0, 0.255],
        [0.04, 0.12],
      ],
      { at: [s * 0.165, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: GREEN, bone: root },
    );
    // chrome trim on top of frame sides
    b.rod([s * 0.165, 0.256, 0.0], [s * 0.165, 0.296, -0.1], 0.0035, { color: CHROME, bone: root });
  }

  // chrome trim along keyboard edges
  b.rod([-0.17, 0.042, 0.212], [0.17, 0.042, 0.212], 0.0035, { color: CHROME, bone: root });
  b.rod([-0.17, 0.117, 0.03], [0.17, 0.117, 0.03], 0.003, { color: CHROME, bone: root });

  // ---- keys
  const n = [0, 0.923, 0.385];
  const basePt = (s: number, h: number, x: number): [number, number, number] => [
    x,
    0.04 + 0.385 * s + 0.923 * h,
    0.21 - 0.923 * s + 0.385 * h,
  ];
  const rows = ["ZXCVBNM,.", "ASDFGHJKL;", "QWERTYUIOP", "1234567890"];
  const stagger = [0.0125, 0.006, 0.0, -0.006];
  const texCache: Record<string, ReturnType<typeof svg>> = {};
  const letter = (c: string) =>
    (texCache[c] ??= svg(
      `<svg viewBox="0 0 32 32"><text x="16" y="25" font-size="24" text-anchor="middle" font-family="serif" font-weight="bold" fill="#f0e7c9">${c}</text></svg>`,
      { size: 64 },
    ));
  const rimGeo = new THREE.CylinderGeometry(0.0105, 0.0105, 0.012, 10);
  const capGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.0125, 10);
  const plane = new THREE.PlaneGeometry(0.0125, 0.0125);
  rows.forEach((row, r) => {
    const s = 0.05 + 0.027 * r;
    [...row].forEach((c, i) => {
      const x = (i - (row.length - 1) / 2) * 0.0245 + stagger[r];
      b.part(rimGeo, CHROME, { at: basePt(s, 0.005, x), dir: n, bone: root });
      b.part(capGeo, BLACK, { at: basePt(s, 0.0066, x), dir: n, bone: root });
      b.part(plane, "#ffffff", {
        at: basePt(s, 0.0132, x),
        dir: n,
        axis: "z",
        texture: letter(c),
        bone: root,
      });
    });
  });
  // space bar
  b.part(new THREE.BoxGeometry(0.13, 0.008, 0.017), CHROME, { at: basePt(0.012, 0.004, 0), dir: n, bone: root });

  // ---- type bar basket
  const C: [number, number] = [0, -0.05];
  const R = 0.082;
  const ringStart: [number, number, number] = [-0.085, 0.12, -0.05];
  b.sweep(arc([0, 0.12, -0.05], ringStart, [0, 1, 0], 180), 0.004, { color: CHROME, bone: root, sides: 8 });
  const N = 29;
  for (let i = 0; i < N; i++) {
    const a = ((-84 + (168 * i) / (N - 1)) * Math.PI) / 180;
    const pv: [number, number, number] = [Math.sin(a) * R, 0.12, C[1] + Math.cos(a) * R];
    const tip: [number, number, number] = [Math.sin(a) * 0.012, 0.215, C[1] + Math.cos(a) * 0.012];
    b.rod(pv, tip, 0.0013, { color: CHROME, bone: root, sides: 5 });
    b.part(new THREE.BoxGeometry(0.0045, 0.006, 0.003), CHROME, { at: tip, bone: root });
    b.part(new THREE.SphereGeometry(0.0028, 5, 4), BLACK, { at: pv, bone: root });
  }

  // ribbon spools on the back deck
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 12), CHROME, { at: [s * 0.095, 0.152, -0.168], bone: root });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.016, 10), BLACK, { at: [s * 0.095, 0.162, -0.168], bone: root });
    b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.02, 6), CHROME, { at: [s * 0.095, 0.17, -0.168], bone: root });
  }

  // ---- carriage: platen, axle, knobs, rails, bail
  const cy = 0.262;
  const cz = -0.085;
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.3, 14), BLACK, {
    at: [0, cy, cz],
    dir: [1, 0, 0],
    bone: carriage,
  });
  b.rod([-0.2, cy, cz], [0.2, cy, cz], 0.005, { color: CHROME, bone: carriage });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 12), CHROME, {
      at: [s * 0.153, cy, cz],
      dir: [1, 0, 0],
      bone: carriage,
    });
    b.part(new THREE.CylinderGeometry(0.023, 0.023, 0.02, 10), BLACK, {
      at: [s * 0.2, cy, cz],
      dir: [1, 0, 0],
      bone: carriage,
    });
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.006, 8), CHROME, {
      at: [s * 0.212, cy, cz],
      dir: [1, 0, 0],
      bone: carriage,
    });
    // bail arms
    b.rod([s * 0.14, 0.283, -0.05], [s * 0.14, 0.3, -0.1], 0.0018, { color: CHROME, bone: carriage });
  }
  b.rod([-0.14, 0.283, -0.05], [0.14, 0.283, -0.05], 0.002, { color: CHROME, bone: carriage });
  // carriage bar underneath
  b.part(new THREE.BoxGeometry(0.34, 0.012, 0.045), GREEN, { at: [0, 0.222, cz], bone: carriage });
  b.rod([-0.17, 0.2, -0.03], [0.17, 0.2, -0.03], 0.004, { color: CHROME, bone: carriage });

  // ---- paper, half typed
  const pc = { y: cy, z: cz, r: 0.0278 };
  const pts: number[][] = [];
  for (const deg of [20, 50, 90, 130, 160, 180]) {
    const a = (deg * Math.PI) / 180;
    pts.push([0, pc.y - pc.r * Math.sin(a), pc.z + pc.r * Math.cos(a)]);
  }
  pts.push([0, 0.31, pc.z - pc.r - 0.001], [0, 0.4, pc.z - pc.r - 0.006], [0, 0.46, pc.z - pc.r - 0.012]);
  const paperPaint = paint((p) => {
    if (p.y > 0.285 && p.y < 0.385 && p.z < -0.1) {
      const u = (p.y - 0.285) / 0.0085;
      const row = Math.floor(u);
      const f = u - row;
      const h = Math.abs(Math.sin(row * 12.9898) * 43758.5453) % 1;
      if (
        f > 0.2 &&
        f < 0.7 &&
        p.x > -0.085 &&
        p.x < 0.09 - 0.06 * h &&
        Math.sin(p.x * 260 + row * 7.3) > -0.55 &&
        Math.sin(p.x * 730 + row * 3.1) > -0.2
      )
        return INK;
    }
    return PAPER;
  });
  b.sweep(catmull(pts), () => [0.105, 0.0008], {
    section: "box",
    caps: "flat",
    color: paperPaint,
    bone: carriage,
  });

  // ---- carriage return lever
  b.sweep(catmull([[0.18, 0.292, -0.09], [0.206, 0.326, -0.075], [0.245, 0.343, -0.04]]), 0.004, {
    color: CHROME,
    bone: lever,
    sides: 6,
  });
  b.part(new THREE.SphereGeometry(0.0115, 8, 6), BLACK, { at: [0.25, 0.345, -0.036], bone: lever });

  // ---- brass maker's badge
  b.extrude(
    [
      [-0.034, -0.012],
      [0.034, -0.012],
      [0.034, 0.012],
      [-0.034, 0.012],
    ],
    { at: [0, 0.02, 0.211], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.004, bevel: 0.0012, smoothing: 2, color: BRASS, bone: root },
  );
  const badgeTex = svg(
    `<svg viewBox="0 0 112 36"><rect x="2" y="2" width="108" height="32" rx="8" fill="none" stroke="#4a3608" stroke-width="2.5"/><text x="56" y="23" font-size="17" text-anchor="middle" font-family="serif" font-weight="bold" letter-spacing="2" fill="#3a2a06">ARDEN</text></svg>`,
    { size: 224 },
  );
  b.part(new THREE.PlaneGeometry(0.058, 0.0187), "#ffffff", {
    at: [0, 0.02, 0.2135],
    dir: [0, 0, 1],
    axis: "z",
    texture: badgeTex,
    bone: root,
  });

  return b.root;
}
```
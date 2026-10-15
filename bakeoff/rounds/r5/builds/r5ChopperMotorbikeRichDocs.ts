import * as THREE from "three";
import { createBuilder, catmull, arc, svg, paint } from "../../../../src/index";

export const meta = {
  name: "Rally Hog Chopper",
  description:
    "Stylized hero-shooter custom chopper: raked springer-style fork, ape-hanger bars, orange teardrop tank with navy racing stripes and an emblem decal, V-twin with glowing cyan power cores, side-swept pipes, chunky spoked wheels and a cyan headlight.",
};

const ORANGE = "#f99e1a";
const ORANGE_D = "#c9710c";
const NAVY = "#1b2438";
const STEEL = "#2f3a52";
const STEEL_L = "#55637f";
const DARK = "#12151d";
const CHROME = "#c5cfe0";
const CHROME_D = "#7d8aa3";
const CYAN = "#3ee0ff";
const LENS = "#d9fbff";
const CREAM = "#f5ecd5";
const SEAT = "#4a3326";
const RED = "#ff4b2e";
const TIRE_A = "#262a35";
const TIRE_B = "#14161d";

type P3 = [number, number, number];
const P = (x: number, y: number, z: number): P3 => [x, y, z];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);

export default function build() {
  const b = createBuilder({ name: "chopper" });
  type J = ReturnType<typeof b.joint>;

  // ---------- key dimensions ----------
  const RF = 0.34; // front wheel radius
  const RR = 0.38; // rear wheel radius
  const H = V(0, 0.98, 0.35); // steering head
  const axleF = V(0, RF - 0.003, 0.85);
  const axleR = V(0, RR - 0.003, -1.05);
  const d = axleF.clone().sub(H);
  const forkLen = d.length();
  d.normalize(); // raked fork direction (down + forward)
  const pt = (k: number) => H.clone().addScaledVector(d, k);
  const legPt = (s: number, k: number) => pt(k).add(V(s * 0.115, 0, 0));

  // ---------- skeleton ----------
  const frameJ = b.joint("frame", { at: [0, 0.55, 0] });
  const fork = b.joint("fork", { parent: frameJ, at: H, dir: d });
  const bars = b.joint("handlebar", { parent: fork, at: pt(-0.1), dir: [0, 1, 0] });
  const wheelF = b.joint("wheelF", { parent: fork, at: axleF, dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: axleR, dir: [1, 0, 0] });

  const tread = paint((_p, _n, s) => (Math.floor(s[1] / 20) % 2 === 0 ? TIRE_A : TIRE_B));

  // ---------- wheels ----------
  function wheel(j: J, axle: THREE.Vector3, R: number, w: number, rimR: number, rotor: boolean) {
    const hw = w * 0.8;
    b.lathe(
      [
        [rimR - 0.03, -w * 0.95],
        [R - 0.05, -w],
        [R - 0.014, -w * 0.72],
        [R, -w * 0.42],
        [R, w * 0.42],
        [R - 0.014, w * 0.72],
        [R - 0.05, w],
        [rimR - 0.03, w * 0.95],
      ],
      { at: axle, axis: [1, 0, 0], segments: 28, color: tread, bone: j },
    );
    b.lathe(
      [
        [rimR - 0.055, -hw],
        [rimR, -hw],
        [rimR, hw],
        [rimR - 0.055, hw],
      ],
      { at: axle, axis: [1, 0, 0], segments: 28, color: CHROME, bone: j },
    );
    const hh = w;
    b.lathe(
      [
        [0, -hh],
        [0.055, -hh],
        [0.055, hh],
        [0, hh],
      ],
      { at: axle, axis: [1, 0, 0], segments: 10, color: STEEL, bone: j },
    );
    for (const s of [1, -1]) {
      b.lathe(
        [
          [rimR - 0.045, 0],
          [rimR - 0.012, 0],
          [rimR - 0.012, 0.008],
          [rimR - 0.045, 0.008],
        ],
        { at: axle.clone().add(V(s * hw, 0, 0)), axis: [s, 0, 0], segments: 28, color: CYAN, bone: j },
      );
      b.lathe(
        [
          [0, 0],
          [0.042, 0],
          [0.042, 0.012],
          [0.02, 0.022],
          [0, 0.022],
        ],
        { at: axle.clone().add(V(s * hh, 0, 0)), axis: [s, 0, 0], segments: 8, color: CYAN, bone: j },
      );
    }
    const len = rimR - 0.05 - 0.04;
    b.ring(j, { count: 6, radius: 0.05 }, (it) => {
      const g = cyl(0.018, 0.03, len, 6);
      g.translate(0, len / 2, 0);
      b.stick(g, STEEL, it, { embed: 0 });
    });
    if (rotor) {
      b.lathe(
        [
          [0.04, 0],
          [0.17, 0],
          [0.17, 0.008],
          [0.04, 0.008],
        ],
        { at: axle.clone().add(V(w - 0.01, 0, 0)), axis: [1, 0, 0], segments: 16, color: CHROME_D, bone: j },
      );
    }
  }
  wheel(wheelF, axleF, RF, 0.07, 0.27, true);
  wheel(wheelR, axleR, RR, 0.15, 0.29, false);

  // axles + nuts
  b.capsule(axleF.clone().add(V(-0.13, 0, 0)), axleF.clone().add(V(0.13, 0, 0)), 0.016, CHROME_D, { bone: fork });
  b.capsule(axleR.clone().add(V(-0.23, 0, 0)), axleR.clone().add(V(0.23, 0, 0)), 0.018, CHROME_D, { bone: frameJ });
  for (const s of [1, -1]) {
    b.part(cyl(0.032, 0.032, 0.02, 8), CYAN, { at: axleF.clone().add(V(s * 0.13, 0, 0)), dir: [1, 0, 0], bone: fork });
    b.part(cyl(0.034, 0.034, 0.02, 8), CYAN, { at: axleR.clone().add(V(s * 0.235, 0, 0)), dir: [1, 0, 0], bone: frameJ });
    b.part(new THREE.BoxGeometry(0.03, 0.12, 0.14), STEEL_L, { at: axleR.clone().add(V(s * 0.21, 0.01, 0)), bone: frameJ });
  }

  // ---------- fork ----------
  for (const s of [1, -1]) {
    b.capsule(legPt(s, -0.05), legPt(s, 0.42), 0.02, CHROME, { bone: fork });
    b.rod(legPt(s, 0.14), legPt(s, 0.4), 0.032, NAVY, { bone: fork });
    b.rod(legPt(s, 0.42), legPt(s, forkLen), 0.032, STEEL_L, { bone: fork });
    b.part(cyl(0.039, 0.039, 0.022, 8), CYAN, { at: legPt(s, 0.41), dir: d, bone: fork });
    b.part(cyl(0.036, 0.036, 0.02, 8), ORANGE, { at: legPt(s, 0.14), dir: d, bone: fork });
    // headlight brackets
    b.capsule(legPt(s, 0.12), V(s * 0.09, 0.9, 0.55), 0.011, CHROME_D, { bone: fork });
  }
  b.part(new THREE.BoxGeometry(0.3, 0.03, 0.09), STEEL_L, { at: pt(-0.07), dir: d, bone: fork });
  b.part(new THREE.BoxGeometry(0.28, 0.03, 0.08), STEEL_L, { at: pt(0.19), dir: d, bone: fork });
  b.part(cyl(0.03, 0.03, 0.03, 8), CYAN, { at: pt(-0.095), dir: d, bone: fork });
  b.part(cyl(0.042, 0.042, 0.24, 8), STEEL, { at: pt(0.06), dir: d, bone: frameJ });

  // front fender
  {
    const R = 0.385;
    const a = (35 * Math.PI) / 180;
    const path = arc(axleF, axleF.clone().add(V(0, R * Math.cos(a), R * Math.sin(a))), [-1, 0, 0], 60);
    b.sweep(path, () => [0.095, 0.012] as [number, number], {
      color: ORANGE,
      bone: fork,
      caps: "flat",
      sectors: [
        [-14, 14, NAVY],
        [14, 18, CREAM],
        [-18, -14, CREAM],
      ],
    });
  }

  // headlight
  {
    const Lc = V(0, 0.9, 0.56);
    b.lathe(
      [
        [0, -0.08],
        [0.06, -0.08],
        [0.09, -0.04],
        [0.09, 0.03],
        [0, 0.03],
      ],
      { at: Lc, axis: [0, 0, 1], segments: 12, color: ORANGE, bone: fork },
    );
    b.lathe(
      [
        [0.085, 0.03],
        [0.1, 0.03],
        [0.1, 0.05],
        [0.085, 0.05],
      ],
      { at: Lc, axis: [0, 0, 1], segments: 12, color: CHROME, bone: fork },
    );
    b.lathe(
      [
        [0, 0.04],
        [0.075, 0.04],
        [0.075, 0.06],
        [0.04, 0.085],
        [0, 0.09],
      ],
      { at: Lc, axis: [0, 0, 1], segments: 12, color: LENS, bone: fork },
    );
  }

  // ---------- handlebars (ape hangers) ----------
  for (const s of [1, -1]) {
    const bar = catmull([
      P(0, 1.08, 0.29),
      P(s * 0.12, 1.1, 0.285),
      P(s * 0.22, 1.2, 0.255),
      P(s * 0.29, 1.34, 0.2),
      P(s * 0.33, 1.44, 0.12),
      P(s * 0.33, 1.47, 0.0),
    ]);
    b.sweep(bar, (t: number) => (t > 0.82 ? 0.025 : 0.015), {
      bone: bars,
      sides: 8,
      color: (t: number) => (t > 0.82 ? ORANGE_D : CHROME),
    });
    // mirror
    const m0 = bar.at(0.68);
    const m1 = m0.clone().add(V(s * 0.02, 0.14, 0.04));
    b.capsule(m0, m1, 0.008, CHROME, { bone: bars });
    const md = V(0, 0.25, -1).normalize();
    const mc = m1.clone().add(V(0, 0.04, 0.01));
    b.part(cyl(0.05, 0.05, 0.02, 10), STEEL, { at: mc, dir: md, bone: bars });
    b.part(cyl(0.042, 0.042, 0.005, 10), "#9fe9ff", { at: mc.clone().addScaledVector(md, 0.0105), dir: md, bone: bars });
  }
  // gauge pod
  {
    const G = V(0, 1.115, 0.34);
    const gd = V(0, 0.6, -0.8).normalize();
    b.capsule(pt(-0.07), G, 0.012, CHROME_D, { bone: bars });
    b.part(cyl(0.055, 0.055, 0.04, 10), STEEL, { at: G, dir: gd, bone: bars });
    b.part(cyl(0.043, 0.043, 0.006, 10), CYAN, { at: G.clone().addScaledVector(gd, 0.0215), dir: gd, bone: bars });
  }

  // ---------- frame ----------
  const backbone = catmull([P(0, 0.93, 0.33), P(0, 0.8, 0.05), P(0, 0.68, -0.4), P(0, 0.62, -0.88)]);
  b.sweep(backbone, 0.032, { color: ORANGE_D, bone: frameJ });
  for (const s of [1, -1]) {
    b.capsule(pt(0.1), P(s * 0.13, 0.42, 0.2), 0.028, STEEL, { bone: frameJ });
    b.capsule(P(s * 0.13, 0.42, 0.2), P(s * 0.14, 0.34, -0.05), 0.028, STEEL, { bone: frameJ });
    b.capsule(P(s * 0.14, 0.34, -0.05), P(s * 0.15, 0.36, -0.42), 0.028, STEEL, { bone: frameJ });
    b.capsule(P(0, 0.7, -0.42), P(s * 0.15, 0.36, -0.42), 0.025, STEEL, { bone: frameJ });
    b.capsule(P(s * 0.15, 0.36, -0.42), P(s * 0.21, 0.37, -1.05), 0.024, STEEL, { bone: frameJ });
    b.capsule(P(0, 0.63, -0.88), P(s * 0.21, 0.38, -1.05), 0.022, STEEL, { bone: frameJ });
    // tank mounts
    b.capsule(P(0, 0.8, 0.05), P(0, 0.9, 0.05), 0.012, CHROME_D, { bone: frameJ });
    // forward pegs
    b.capsule(P(s * 0.13, 0.42, 0.2), P(s * 0.22, 0.3, 0.3), 0.016, CHROME_D, { bone: frameJ });
    b.part(cyl(0.022, 0.022, 0.14, 8), CHROME, { at: P(s * 0.27, 0.3, 0.3), dir: [1, 0, 0], bone: frameJ });
    b.part(cyl(0.032, 0.032, 0.02, 8), ORANGE, { at: P(s * 0.35, 0.3, 0.3), dir: [1, 0, 0], bone: frameJ });
  }

  // ---------- engine ----------
  const C = V(0, 0.46, -0.04);
  b.part(new THREE.BoxGeometry(0.3, 0.26, 0.36), STEEL_L, { at: C, bone: frameJ });
  b.part(new THREE.BoxGeometry(0.32, 0.05, 0.3), ORANGE, { at: C.clone().add(V(0, 0.1, -0.02)), bone: frameJ });
  b.part(new THREE.BoxGeometry(0.28, 0.2, 0.22), STEEL, { at: V(0, 0.4, -0.3), bone: frameJ });
  b.part(new THREE.BoxGeometry(0.26, 0.02, 0.46), STEEL, { at: V(0, 0.325, -0.06), bone: frameJ });
  b.part(new THREE.BoxGeometry(0.1, 0.01, 0.4), CYAN, { at: V(0, 0.314, -0.06), bone: frameJ });

  for (const s of [1, -1]) {
    const at = C.clone().add(V(s * 0.15, 0, 0.0));
    b.lathe(
      [
        [0, 0],
        [0.115, 0],
        [0.115, 0.022],
        [0.1, 0.03],
        [0, 0.03],
      ],
      { at, axis: [s, 0, 0], segments: 12, color: ORANGE, bone: frameJ },
    );
    b.lathe(
      [
        [0, 0.028],
        [0.07, 0.028],
        [0.07, 0.042],
        [0.035, 0.05],
        [0, 0.05],
      ],
      { at, axis: [s, 0, 0], segments: 12, color: CYAN, bone: frameJ },
    );
    // transmission cover stud
    b.part(cyl(0.05, 0.05, 0.02, 10), ORANGE_D, { at: V(s * 0.145, 0.4, -0.3), dir: [s, 0, 0], bone: frameJ });
  }

  // cylinders
  const fins: [number, number][] = [
    [0, 0],
    [0.1, 0],
  ];
  {
    let y = 0.02;
    for (let i = 0; i < 5; i++) {
      fins.push([0.105, y], [0.15, y + 0.005], [0.15, y + 0.02], [0.105, y + 0.025]);
      y += 0.04;
    }
    fins.push([0.1, y + 0.02], [0, y + 0.02]);
  }
  const cylinders: [THREE.Vector3, THREE.Vector3][] = [
    [C.clone().add(V(0, 0.09, 0.05)), V(0, 0.9, 0.42).normalize()],
    [C.clone().add(V(0, 0.09, -0.09)), V(0, 0.9, -0.42).normalize()],
  ];
  for (const [base, dir] of cylinders) {
    b.lathe(fins, { at: base, axis: dir, segments: 10, color: STEEL, bone: frameJ });
    b.part(new THREE.BoxGeometry(0.2, 0.09, 0.18), ORANGE, { at: base.clone().addScaledVector(dir, 0.265), dir, bone: frameJ });
    b.part(new THREE.BoxGeometry(0.13, 0.03, 0.12), NAVY, { at: base.clone().addScaledVector(dir, 0.315), dir, bone: frameJ });
    b.part(cyl(0.022, 0.022, 0.02, 8), CYAN, { at: base.clone().addScaledVector(dir, 0.335), dir, bone: frameJ });
  }

  // air cleaner (right side) with glowing hub
  {
    const at = V(-0.17, 0.64, -0.04);
    b.lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.12, 0.03],
        [0.12, 0.07],
        [0.08, 0.078],
        [0, 0.078],
      ],
      { at, axis: [-1, 0, 0], segments: 12, color: CHROME, bone: frameJ },
    );
    b.lathe(
      [
        [0, 0.07],
        [0.05, 0.07],
        [0.05, 0.085],
        [0, 0.09],
      ],
      { at, axis: [-1, 0, 0], segments: 10, color: CYAN, bone: frameJ },
    );
  }

  // exhaust pipes
  for (const s of [1, -1]) {
    const pipe = catmull([
      P(s * 0.11, 0.77, 0.14),
      P(s * 0.2, 0.68, 0.27),
      P(s * 0.28, 0.54, 0.26),
      P(s * 0.3, 0.47, 0.1),
      P(s * 0.3, 0.47, -0.5),
      P(s * 0.3, 0.5, -1.0),
    ]);
    const r = (t: number) => 0.03 + 0.02 * t;
    b.sweep(pipe, r, { color: CHROME, bone: frameJ, sides: 8 });
    b.sweep(pipe, (t: number) => r(t) + 0.012, { from: 0.45, to: 0.8, color: NAVY, bone: frameJ, sides: 8, caps: "flat" });
    b.along(pipe, 3, (at) =>
      b.part(cyl(r(at.t) + 0.016, r(at.t) + 0.016, 0.018, 8), CYAN, { frame: at, bone: frameJ }),
    );
    b.lathe(
      [
        [0.04, 0],
        [0.075, 0.14],
        [0.062, 0.14],
        [0.03, 0],
      ],
      { at: P(s * 0.3, 0.5, -1.0), axis: [0, 0.1, -1], segments: 10, color: ORANGE_D, bone: frameJ },
    );
    b.part(cyl(0.05, 0.05, 0.01, 8), CYAN, { at: P(s * 0.3, 0.505, -1.1), dir: [0, 0.1, -1], bone: frameJ });
  }

  // ---------- fuel tank ----------
  const tankPath = catmull([P(0, 1.0, 0.25), P(0, 0.99, 0.03), P(0, 0.95, -0.22)]);
  const tank = b.sweep(
    tankPath,
    (t: number) => {
      const k = Math.max(0.12, Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.7));
      return [0.155 * k, 0.13 * k] as [number, number];
    },
    {
      color: ORANGE,
      bone: frameJ,
      sides: 12,
      sectors: [
        [-9, 9, NAVY],
        [9, 13, CREAM],
        [-13, -9, CREAM],
        [140, 220, NAVY],
      ],
    },
  );
  const cap = b.surface(tank).ray([0, 1.6, 0.06], [0, -1, 0]);
  if (cap) {
    b.stick(cyl(0.038, 0.042, 0.025, 10), CHROME, cap, { embed: 0.3 });
    b.stick(cyl(0.022, 0.022, 0.035, 8), CYAN, cap, { embed: 0.3 });
  }
  const emblem = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#12151d" stroke="#f5ecd5" stroke-width="4"/><path d="M32 12 L52 44 L41 44 L32 29 L23 44 L12 44 Z" fill="#f99e1a"/><rect x="22" y="48" width="20" height="5" rx="2" fill="#3ee0ff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const hit = b.surface(tank).around([0, 0.97, 0.03]).at(s * 90, 0);
    if (hit) b.decal(tank, emblem, { at: hit, dir: [s, 0, 0], size: [0.13, 0.13] });
  }

  // ---------- seat ----------
  b.loft(
    [
      { at: P(0, 0.84, -0.26), w: 0.14, h: 0.07 },
      { at: P(0, 0.81, -0.4), w: 0.28, h: 0.08 },
      { at: P(0, 0.79, -0.57), w: 0.3, h: 0.08 },
      { at: P(0, 0.8, -0.76), w: 0.22, h: 0.07 },
    ],
    { color: SEAT, bone: frameJ },
  );
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.5), ORANGE_D, { at: P(0, 0.76, -0.5), bone: frameJ });

  // ---------- rear fender, tail ----------
  {
    const R = 0.415;
    const a = (30 * Math.PI) / 180;
    const path = arc(axleR, axleR.clone().add(V(0, R * Math.cos(a), R * Math.sin(a))), [-1, 0, 0], 90);
    b.sweep(path, () => [0.17, 0.014] as [number, number], {
      color: ORANGE,
      bone: frameJ,
      caps: "flat",
      sectors: [
        [-16, 16, NAVY],
        [16, 20, CREAM],
        [-20, -16, CREAM],
      ],
    });
  }
  {
    const g = new THREE.SphereGeometry(0.045, 8, 6);
    g.scale(1.4, 0.8, 0.9);
    b.part(g, RED, { at: P(0, 0.58, -1.43), bone: frameJ });
    const plate = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#f5ecd5"/><rect x="2" y="2" width="60" height="28" rx="3" fill="none" stroke="#1b2438" stroke-width="2"/><text x="32" y="23" font-size="17" font-weight="bold" text-anchor="middle" fill="#1b2438">RIDE-76</text></svg>`,
      { size: 256 },
    );
    b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", {
      at: P(0, 0.47, -1.45),
      dir: [0, 0, -1],
      axis: "z",
      texture: plate,
      bone: frameJ,
    });
    b.capsule(P(0, 0.56, -1.41), P(0, 0.5, -1.445), 0.008, CHROME_D, { bone: frameJ });
  }

  // sissy bar + pad
  for (const s of [1, -1]) {
    const sissy = catmull([P(s * 0.215, 0.4, -1.05), P(s * 0.22, 0.75, -1.08), P(s * 0.2, 1.0, -1.1), P(s * 0.13, 1.12, -1.13)]);
    b.sweep(sissy, 0.014, { color: CHROME, bone: frameJ });
  }
  b.capsule(P(-0.13, 1.12, -1.13), P(0.13, 1.12, -1.13), 0.014, CHROME, { bone: frameJ });
  b.part(new THREE.BoxGeometry(0.26, 0.2, 0.06), NAVY, { at: P(0, 1.0, -1.17), bone: frameJ });
  b.part(new THREE.BoxGeometry(0.2, 0.02, 0.065), ORANGE, { at: P(0, 1.06, -1.17), bone: frameJ });
  b.part(new THREE.BoxGeometry(0.04, 0.04, 0.07), CYAN, { at: P(0, 0.97, -1.17), bone: frameJ });

  return b.root;
}

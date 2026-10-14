import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Diner Jukebox",
  description:
    "1950s diner jukebox: a tall arch of glowing red, amber and teal tubes, chrome trim everywhere, a domed record window with a record stack, pick arm and turntable, rows of chrome selector buttons with title cards, a starburst speaker grille and a coin slot.",
};

type V3 = [number, number, number];
const PI = Math.PI;
const deg = (d: number) => (d * PI) / 180;

const C = {
  chromeHi: "#f6fafc",
  chrome: "#d3dbe0",
  chromeMid: "#aab6bf",
  chromeDk: "#79858f",
  cream: "#efe4c6",
  cream2: "#f8f1dc",
  navy: "#17213a",
  teal: "#168a88",
  tealBright: "#19e0d0",
  tealCore: "#b8fff5",
  tealDim: "#0f7a76",
  tealDeep: "#0b4f55",
  red: "#c9252b",
  redBright: "#ff3a2a",
  redCore: "#ff9a86",
  redDim: "#8e1f1d",
  amber: "#f5a623",
  amberBright: "#ffb21e",
  amberCore: "#fff1a8",
  amberDim: "#a8680f",
  amberPale: "#ffd966",
  vermilion: "#d8452b",
  black: "#17171a",
  groove: "#34343a",
  dark: "#2a2f38",
  darker: "#10151c",
  slat: "#222b36",
  plum: "#3b2230",
  glass: "#e9fbff",
  plinth: "#23212a",
  maroon: "#6e1d22",
  header: "#1b2230",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "jukebox" });
  type J = ReturnType<typeof b.joint>;

  // ---------------------------------------------------------------- skeleton
  const root = b.joint("root", { at: [0, 0, 0] });
  const sub = (name: string, at: V3, parent: J): J => {
    try {
      return b.joint(name, { at, parent });
    } catch {
      /* retry below */
    }
    try {
      return b.joint(name, { at, parent: (parent as any).name });
    } catch {
      /* fall through */
    }
    return parent;
  };
  const armPivot = sub("armPivot", [0.02, 1.22, 0.15], root);
  const turntable = sub("turntable", [0.155, 0.985, 0.15], root);
  const tonearm = sub("tonearm", [0.255, 0.998, 0.265], root);

  // ---------------------------------------------------------------- helpers
  const put = (g: THREE.BufferGeometry, color: string, at: V3, bone: J = root) =>
    b.part(g, color, { at, bone });

  const facet = (g: THREE.BufferGeometry) => {
    const n = g.index ? g.toNonIndexed() : g;
    n.computeVertexNormals();
    return n;
  };

  const box = (color: string, at: V3, sx: number, sy: number, sz: number, bone: J = root) =>
    put(new THREE.BoxGeometry(sx, sy, sz), color, at, bone);

  const cyl = (
    color: string,
    at: V3,
    r: number,
    h: number,
    seg: number,
    axis: "x" | "y" | "z" = "y",
    bone: J = root,
    rTop: number = r,
  ) => {
    const g = new THREE.CylinderGeometry(rTop, r, h, seg);
    if (axis === "z") g.rotateX(PI / 2);
    else if (axis === "x") g.rotateZ(-PI / 2);
    return put(facet(g), color, at, bone);
  };

  const ball = (color: string, at: V3, r: number, seg = 8, bone: J = root) =>
    put(facet(new THREE.SphereGeometry(r, seg, Math.max(3, seg >> 1))), color, at, bone);

  const orient = (g: THREE.BufferGeometry, dir: THREE.Vector3) => {
    const y = dir.clone().normalize();
    const h = Math.abs(y.y) > 0.98 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const x = new THREE.Vector3().crossVectors(h, y).normalize();
    const z = new THREE.Vector3().crossVectors(x, y);
    g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  };

  const rod = (
    color: string,
    a: V3,
    c: V3,
    r: number,
    seg = 6,
    bone: J = root,
    rEnd: number = r,
  ) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const d = B.clone().sub(A);
    const g = new THREE.CylinderGeometry(rEnd, r, d.length(), seg);
    orient(g, d);
    const m = A.clone().add(B).multiplyScalar(0.5);
    return put(facet(g), color, [m.x, m.y, m.z], bone);
  };

  const ext = (s: THREE.Shape, depth: number, curveSegments = 24) =>
    new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments });

  // arch outline centred on the arc centre; yBot is relative to it (negative)
  const archShape = (halfW: number, yBot: number, R: number) => {
    const s = new THREE.Shape();
    s.moveTo(-halfW, yBot);
    s.lineTo(halfW, yBot);
    s.lineTo(halfW, 0);
    s.absarc(0, 0, R, 0, PI, false);
    s.lineTo(-halfW, yBot);
    return s;
  };
  const archHole = (halfW: number, yBot: number, R: number) => {
    const p = new THREE.Path();
    p.moveTo(-halfW, yBot);
    p.lineTo(halfW, yBot);
    p.lineTo(halfW, 0);
    p.absarc(0, 0, R, 0, PI, false);
    p.lineTo(-halfW, yBot);
    return p;
  };

  const burst = (
    cx: number,
    cy: number,
    z: number,
    n: number,
    baseR: number,
    len: number,
    halfW: number,
    depth: number,
    colorAt: (i: number) => string,
    phase = 0,
  ) => {
    for (let i = 0; i < n; i++) {
      const s = new THREE.Shape();
      s.moveTo(0, baseR);
      s.lineTo(halfW, baseR + len * 0.32);
      s.lineTo(0, baseR + len);
      s.lineTo(-halfW, baseR + len * 0.32);
      const g = ext(s, depth, 1);
      g.rotateZ(phase + (i * 2 * PI) / n);
      put(g, colorAt(i), [cx, cy, z]);
    }
  };

  const yc = 1.14; // arch centre height

  // ---------------------------------------------------------------- cabinet
  const shell = archShape(0.46, 0.09 - yc, 0.46);
  shell.holes.push(archHole(0.3, 0.94 - yc, 0.3));
  put(ext(shell, 0.3), C.cream, [0, yc, 0]);
  put(ext(archShape(0.46, 0.09 - yc, 0.46), 0.36), C.cream, [0, yc, -0.36]);

  // plinth and base moulding
  box(C.plinth, [0, 0.045, -0.03], 0.84, 0.09, 0.6);
  box(C.chromeMid, [0, 0.1025, -0.02], 0.95, 0.025, 0.7);
  box(C.chromeHi, [0, 0.1165, -0.02], 0.95, 0.003, 0.7);
  box(C.red, [0, 0.045, 0.2715], 0.84, 0.012, 0.003);
  box(C.chrome, [0, 0.022, 0.2725], 0.8, 0.028, 0.004);

  // side panels
  for (const s of [-1, 1]) {
    const x = s * 0.4635;
    box(C.chrome, [x, 0.87, -0.03], 0.007, 0.014, 0.6);
    box(C.chrome, [x, 0.17, -0.03], 0.007, 0.014, 0.6);
    box(C.chrome, [x, 0.52, 0.27], 0.007, 0.714, 0.014);
    box(C.chrome, [x, 0.52, -0.33], 0.007, 0.714, 0.014);
    box(C.teal, [s * 0.4625, 0.52, -0.03], 0.005, 0.686, 0.586);
    // chrome speed lines
    const lines: [number, number, number, string][] = [
      [0.65, 0.46, 0.016, C.chromeHi],
      [0.595, 0.36, 0.012, C.chrome],
      [0.545, 0.26, 0.008, C.chromeMid],
    ];
    for (const [y, L, h, col] of lines) box(col, [s * 0.4655, y, 0.24 - L / 2], 0.006, h, L);
    box(C.red, [s * 0.4655, 0.43, 0.24 - 0.25], 0.006, 0.022, 0.5);
    box(C.cream2, [s * 0.4655, 0.36, 0.15], 0.006, 0.05, 0.05);
    ball(C.redBright, [s * 0.468, 0.36, 0.15], 0.012, 6);
  }

  // roof ribs, ridge, apex jewel
  for (const zr of [-0.3, -0.17, -0.04, 0.09]) {
    put(facet(new THREE.TorusGeometry(0.463, 0.0065, 4, 30, PI)), C.chrome, [0, yc, zr]);
    for (const s of [-1, 1]) rod(C.chrome, [s * 0.463, 0.875, zr], [s * 0.463, yc, zr], 0.0065, 4);
  }
  rod(C.chromeHi, [0, 1.602, -0.34], [0, 1.602, 0.29], 0.007, 4);
  cyl(C.chrome, [0, 1.592, 0.322], 0.026, 0.014, 10, "z");
  ball(C.redBright, [0, 1.592, 0.334], 0.018, 8);
  ball(C.redCore, [-0.006, 1.598, 0.348], 0.005, 4);

  // ---------------------------------------------------------------- arch fascia
  const plate = archShape(0.455, 0.9 - yc, 0.455);
  plate.holes.push(archHole(0.3, 0.94 - yc, 0.3));
  put(ext(plate, 0.01), C.navy, [0, yc, 0.3]);

  const tubes = [
    { r: 0.348, main: C.redBright, core: C.redCore, dim: C.redDim },
    { r: 0.388, main: C.amberBright, core: C.amberCore, dim: C.amberDim },
    { r: 0.428, main: C.tealBright, core: C.tealCore, dim: C.tealDim },
  ];
  const tr = 0.0155;
  for (const t of tubes) {
    // glow bands on the plate
    put(new THREE.RingGeometry(t.r - 0.02, t.r + 0.02, 28, 1, 0, PI), t.dim, [0, yc, 0.3115]);
    for (const s of [-1, 1]) {
      put(new THREE.PlaneGeometry(0.04, yc - 0.92), t.dim, [s * t.r, (0.92 + yc) / 2, 0.3115]);
    }
    // the glowing tube and its hot core
    put(facet(new THREE.TorusGeometry(t.r, tr, 6, 28, PI)), t.main, [0, yc, 0.325]);
    put(facet(new THREE.TorusGeometry(t.r, 0.0055, 4, 28, PI)), t.core, [0, yc, 0.3375]);
    for (const s of [-1, 1]) {
      rod(t.main, [s * t.r, 0.945, 0.325], [s * t.r, yc, 0.325], tr, 6);
      rod(t.core, [s * t.r, 0.955, 0.3375], [s * t.r, yc, 0.3375], 0.0055, 4);
      cyl(C.chromeMid, [s * t.r, 0.95, 0.325], tr + 0.004, 0.024, 8, "y");
    }
  }

  // chrome straps with rivets across the tubes
  const strapAt = (cx: number, cy: number, a: number) => {
    const g = new THREE.BoxGeometry(0.125, 0.012, 0.006);
    g.rotateZ(a);
    put(g, C.chrome, [cx, cy, 0.3445]);
  };
  for (const ad of [0, 36, 72, 108, 144, 180]) {
    const a = deg(ad);
    strapAt(Math.cos(a) * 0.392, yc + Math.sin(a) * 0.392, a);
    for (const t of tubes)
      ball(C.chromeHi, [Math.cos(a) * t.r, yc + Math.sin(a) * t.r, 0.349], 0.0075, 6);
  }
  for (const s of [-1, 1]) {
    strapAt(s * 0.392, 1.03, 0);
    for (const t of tubes) ball(C.chromeHi, [s * t.r, 1.03, 0.349], 0.0075, 6);
  }

  // outer chrome edge, bottom rail
  put(facet(new THREE.TorusGeometry(0.451, 0.008, 6, 28, PI)), C.chrome, [0, yc, 0.318]);
  for (const s of [-1, 1]) rod(C.chrome, [s * 0.451, 0.905, 0.318], [s * 0.451, yc, 0.318], 0.008, 6);
  box(C.chromeMid, [0, 0.9075, 0.316], 0.918, 0.025, 0.032);
  box(C.chromeHi, [0, 0.9215, 0.3325], 0.918, 0.003, 0.003);

  // window bezel
  put(facet(new THREE.TorusGeometry(0.311, 0.0125, 6, 28, PI)), C.chromeHi, [0, yc, 0.3175]);
  for (const s of [-1, 1]) rod(C.chromeHi, [s * 0.311, 0.945, 0.3175], [s * 0.311, yc, 0.3175], 0.0125, 6);
  rod(C.chromeHi, [-0.311, 0.945, 0.3175], [0.311, 0.945, 0.3175], 0.0125, 6);

  // ---------------------------------------------------------------- window interior
  const liner = archShape(0.3005, 0.94 - yc, 0.3005);
  liner.holes.push(archHole(0.285, 0.955 - yc, 0.285));
  put(ext(liner, 0.3), C.plum, [0, yc, 0]);

  const wall = (R: number, color: string, z: number) =>
    put(ext(archShape(R, 0.955 - yc, R), 0.004), color, [0, yc, z]);
  wall(0.298, C.vermilion, 0.0);
  wall(0.25, C.amber, 0.004);
  wall(0.2, C.amberPale, 0.008);
  wall(0.14, C.amberCore, 0.012);

  // glass glints (the dome)
  const glint = (R: number, a0: number, a1: number) => {
    const g = new THREE.TorusGeometry(R, 0.004, 3, 12, deg(a1 - a0));
    g.rotateZ(deg(a0));
    put(g, C.glass, [0, yc, 0.306]);
  };
  glint(0.268, 100, 152);
  glint(0.268, 158, 168);
  glint(0.235, 112, 132);
  glint(0.268, 24, 34);
  rod(C.glass, [-0.272, 0.985, 0.306], [-0.272, 1.075, 0.306], 0.004, 3);
  rod(C.glass, [-0.272, 1.09, 0.306], [-0.272, 1.105, 0.306], 0.004, 3);

  // mechanism floor
  box(C.dark, [0, 0.956, 0.15], 0.56, 0.032, 0.28);
  box(C.chrome, [0, 0.962, 0.292], 0.57, 0.022, 0.012);
  box(C.chromeHi, [0, 0.974, 0.292], 0.57, 0.003, 0.012);

  // record stack
  const sx = -0.135;
  const sz = 0.15;
  rod(C.chrome, [sx, 0.972, sz], [sx, 1.135, sz], 0.006, 6);
  cyl(C.chromeMid, [sx, 0.978, sz], 0.032, 0.012, 12, "y");
  const recCols = [C.black, C.red, C.black, C.teal, C.black, C.cream2];
  let topX = sx;
  let topZ = sz;
  for (let i = 0; i < 11; i++) {
    const y = 0.98875 + i * 0.0085;
    const dx = (((i * 37) % 7) - 3) * 0.0012;
    const dz = (((i * 53) % 5) - 2) * 0.0015;
    cyl(recCols[i % 6], [sx + dx, y, sz + dz], 0.098, 0.0075, 22, "y");
    topX = sx + dx;
    topZ = sz + dz;
  }
  cyl(C.red, [topX, 1.0785, topZ], 0.03, 0.002, 12, "y");
  cyl(C.cream2, [topX, 1.0795, topZ], 0.012, 0.002, 8, "y");
  for (const R of [0.05, 0.065, 0.08]) {
    const g = new THREE.TorusGeometry(R, 0.0013, 3, 24);
    g.rotateX(PI / 2);
    put(g, C.groove, [topX, 1.0782, topZ]);
  }

  // pick-up arm, riding armPivot, holding a lifted record
  const aj = armPivot;
  cyl(C.chromeMid, [0.02, 1.22, 0.15], 0.02, 0.03, 12, "y", aj);
  rod(C.chrome, [0.02, 0.975, 0.15], [0.02, 1.205, 0.15], 0.012, 8, root);
  rod(C.chrome, [0.02, 1.22, 0.15], [sx, 1.22, sz], 0.009, 6, aj);
  rod(C.chrome, [0.02, 1.22, 0.15], [0.075, 1.22, 0.15], 0.007, 6, aj);
  ball(C.redBright, [0.088, 1.22, 0.15], 0.017, 8, aj);
  rod(C.chrome, [sx, 1.22, sz], [sx, 1.17, sz], 0.007, 6, aj);
  box(C.chromeHi, [sx, 1.165, sz], 0.24, 0.012, 0.016, aj);
  for (const s of [-1, 1]) {
    box(C.chrome, [sx + s * 0.108, 1.14, sz], 0.012, 0.055, 0.02, aj);
    box(C.chromeMid, [sx + s * 0.1, 1.125, sz], 0.008, 0.02, 0.016, aj);
  }
  cyl(C.red, [sx, 1.125, sz], 0.098, 0.0075, 22, "y", aj);
  cyl(C.cream2, [sx, 1.1295, sz], 0.03, 0.002, 12, "y", aj);
  cyl(C.black, [sx, 1.1305, sz], 0.008, 0.002, 6, "y", aj);

  // turntable with a playing record
  const tx = 0.155;
  const tz = 0.15;
  cyl(C.chromeMid, [tx, 0.979, tz], 0.102, 0.012, 24, "y", turntable);
  cyl(C.teal, [tx, 0.9865, tz], 0.092, 0.003, 24, "y", turntable);
  cyl(C.black, [tx, 0.99, tz], 0.086, 0.004, 24, "y", turntable);
  cyl(C.cream2, [tx, 0.993, tz], 0.028, 0.002, 14, "y", turntable);
  cyl(C.redBright, [tx, 0.9935, tz], 0.012, 0.0025, 10, "y", turntable);
  cyl(C.chrome, [tx, 0.998, tz], 0.004, 0.012, 6, "y", turntable);
  for (const R of [0.045, 0.06, 0.074]) {
    const g = new THREE.TorusGeometry(R, 0.0013, 3, 24);
    g.rotateX(PI / 2);
    put(g, C.groove, [tx, 0.9922, tz], turntable);
  }

  // tonearm
  cyl(C.chromeMid, [0.255, 0.982, 0.265], 0.017, 0.02, 12, "y", tonearm);
  ball(C.chromeHi, [0.255, 0.998, 0.265], 0.012, 8, tonearm);
  rod(C.chrome, [0.255, 0.998, 0.265], [0.185, 0.998, 0.2], 0.005, 6, tonearm);
  ball(C.red, [0.183, 0.996, 0.198], 0.009, 6, tonearm);
  cyl(C.chromeHi, [0.183, 0.9905, 0.198], 0.0012, 0.007, 4, "y", tonearm, 0.004);
  rod(C.chrome, [0.255, 0.998, 0.265], [0.268, 0.998, 0.278], 0.006, 6, tonearm);
  ball(C.amberBright, [0.27, 0.998, 0.28], 0.011, 6, tonearm);

  // ---------------------------------------------------------------- speaker grille bay
  const gy = 0.345;
  box(C.darker, [0, gy, 0.304], 0.82, 0.42, 0.008);
  for (let i = 0; i < 36; i++) box(C.slat, [-0.3938 + i * 0.0225, gy, 0.3095], 0.006, 0.4, 0.003);

  // frame
  box(C.chrome, [0, 0.566, 0.312], 0.864, 0.022, 0.024);
  box(C.chrome, [0, 0.124, 0.312], 0.864, 0.022, 0.024);
  for (const s of [-1, 1]) {
    box(C.chrome, [s * 0.421, gy, 0.312], 0.022, 0.464, 0.024);
    box(C.chrome, [s * 0.4425, gy, 0.3095], 0.024, 0.45, 0.019);
    box(C.chromeHi, [s * 0.4505, gy, 0.3195], 0.004, 0.45, 0.002);
  }
  rod(C.amberBright, [-0.4, 0.5555, 0.3255], [0.4, 0.5555, 0.3255], 0.004, 4);
  rod(C.tealBright, [-0.4, 0.1345, 0.3255], [0.4, 0.1345, 0.3255], 0.004, 4);

  // big atomic starburst
  cyl(C.tealDeep, [0, gy, 0.3125], 0.19, 0.003, 32, "z");
  burst(0, gy, 0.3135, 16, 0.03, 0.16, 0.0085, 0.004, (i) => (i % 2 ? C.chrome : C.chromeHi));
  burst(0, gy, 0.314, 16, 0.035, 0.095, 0.0065, 0.003, () => C.amberBright, PI / 16);
  put(facet(new THREE.TorusGeometry(0.19, 0.004, 4, 32)), C.chrome, [0, gy, 0.3145]);
  cyl(C.red, [0, gy, 0.3165], 0.045, 0.006, 16, "z");
  put(facet(new THREE.TorusGeometry(0.05, 0.004, 4, 16)), C.chromeHi, [0, gy, 0.3185]);
  cyl(C.amberBright, [0, gy, 0.3195], 0.02, 0.008, 10, "z");
  ball(C.chromeHi, [0, gy, 0.3235], 0.007, 6);

  // small flanking starbursts
  for (const s of [-1, 1]) {
    const cx = s * 0.3;
    cyl(C.maroon, [cx, gy, 0.3125], 0.085, 0.003, 20, "z");
    burst(cx, gy, 0.3135, 8, 0.012, 0.075, 0.008, 0.003, () => C.amber);
    burst(cx, gy, 0.314, 8, 0.018, 0.05, 0.0055, 0.003, () => C.chromeHi, PI / 8);
    put(facet(new THREE.TorusGeometry(0.085, 0.003, 3, 20)), C.chrome, [cx, gy, 0.3145]);
    ball(C.chromeHi, [cx, gy, 0.3175], 0.011, 6);
    // corner sparkles
    for (const sy of [0.205, 0.485]) {
      burst(s * 0.36, sy, 0.3135, 4, 0, 0.045, 0.006, 0.003, () => C.chromeHi);
      burst(s * 0.36, sy, 0.3135, 4, 0, 0.028, 0.0045, 0.003, () => C.amberBright, PI / 4);
    }
  }

  // ---------------------------------------------------------------- selector deck
  const P2 = new THREE.Vector3(0, 0.625, 0.445);
  const P3 = new THREE.Vector3(0, 0.9, 0.315);
  const uF = P3.clone().sub(P2);
  const Lf = uF.length();
  uF.normalize();
  const nF = new THREE.Vector3(0, -uF.z, uF.y);
  const theta = Math.atan2(nF.y, nF.z); // face tilt from vertical

  const fpos = (u: number, v: number, w: number): V3 => [
    u,
    P2.y + uF.y * v + nF.y * w,
    P2.z + uF.z * v + nF.z * w,
  ];
  const fbox = (color: string, u: number, v: number, w: number, sx: number, sy: number, sz: number) => {
    const g = new THREE.BoxGeometry(sx, sy, sz);
    g.rotateX(-theta);
    return put(g, color, fpos(u, v, w));
  };
  const fcyl = (color: string, u: number, v: number, w: number, r: number, h: number, seg: number) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateX(PI / 2 - theta);
    return put(facet(g), color, fpos(u, v, w));
  };
  const fdome = (color: string, u: number, v: number, w: number, r: number, sq: number) => {
    const g = new THREE.SphereGeometry(r, 10, 4, 0, PI * 2, 0, PI / 2);
    g.scale(1, sq, 1);
    g.rotateX(PI / 2 - theta);
    return put(facet(g), color, fpos(u, v, w));
  };
  const fball = (color: string, u: number, v: number, w: number, r: number) =>
    ball(color, fpos(u, v, w), r, 6);

  // wedge body
  const wedge = new THREE.Shape();
  wedge.moveTo(0.3, 0.575);
  wedge.lineTo(0.445, 0.575);
  wedge.lineTo(0.445, 0.625);
  wedge.lineTo(0.315, 0.9);
  wedge.lineTo(0.3, 0.9);
  const wg = ext(wedge, 0.88, 1);
  wg.rotateY(-PI / 2);
  put(wg, C.cream, [0.44, 0, 0]);

  // chrome edges
  box(C.chromeMid, [0, 0.6, 0.4465], 0.89, 0.05, 0.004);
  box(C.red, [0, 0.6, 0.449], 0.8, 0.012, 0.002);
  rod(C.chrome, [-0.445, P3.y, P3.z + 0.003], [0.445, P3.y, P3.z + 0.003], 0.008, 6);
  for (const s of [-1, 1]) {
    rod(C.chrome, [s * 0.441, P2.y, P2.z], [s * 0.441, P3.y, P3.z], 0.007, 6);
  }

  // face plate
  fbox(C.teal, 0, 0.16, 0.0025, 0.8, 0.25, 0.005);
  fbox(C.red, 0, 0.0215, 0.003, 0.8, 0.017, 0.006);
  {
    const a = fpos(-0.44, 0.002, 0.004);
    const c = fpos(0.44, 0.002, 0.004);
    rod(C.chrome, a, c, 0.007, 6);
  }
  for (const s of [-1, 1]) fbox(C.chrome, s * 0.41, 0.15, 0.004, 0.012, 0.3, 0.008);

  // header strip of lamps
  fbox(C.header, -0.1, 0.262, 0.0065, 0.5, 0.022, 0.004);
  const lampCols = [C.redBright, C.amberBright, C.tealBright];
  for (let i = 0; i < 14; i++) fball(lampCols[i % 3], -0.33 + i * 0.0345, 0.262, 0.0105, 0.0055);

  // buttons and title cards
  const bandCols = [C.red, C.amber, C.teal, C.navy];
  const collarCols = [C.red, C.amberBright, C.teal];
  for (let r = 0; r < 2; r++) {
    const vc = r === 0 ? 0.222 : 0.128;
    const vb = r === 0 ? 0.178 : 0.084;
    for (let c = 0; c < 9; c++) {
      const u = -0.075 + (c - 4) * 0.0625;
      // card
      fbox(C.chromeMid, u, vc, 0.0065, 0.056, 0.032, 0.003);
      fbox(C.cream2, u, vc, 0.0085, 0.05, 0.026, 0.0015);
      fbox(bandCols[(c + r * 2) % 4], u, vc + 0.0095, 0.0098, 0.05, 0.007, 0.0012);
      const w1 = 0.026 + ((c * 7 + r * 3) % 4) * 0.004;
      const w2 = 0.016 + ((c * 5 + r * 2) % 4) * 0.005;
      fbox(C.dark, u - 0.022 + w1 / 2, vc + 0.0015, 0.0098, w1, 0.0028, 0.0012);
      fbox(C.dark, u - 0.022 + w2 / 2, vc - 0.0045, 0.0098, w2, 0.0028, 0.0012);
      fball(bandCols[(c + r * 2 + 1) % 4], u + 0.019, vc - 0.0045, 0.0102, 0.0027);
      // button
      fcyl(collarCols[(c + r) % 3], u, vb, 0.0085, 0.0215, 0.007, 12);
      fdome(C.chromeHi, u, vb, 0.011, 0.0165, 0.75);
      fball(C.white ?? "#ffffff", u - 0.0055, vb + 0.0055, 0.0205, 0.0033);
    }
  }

  // coin mechanism
  const cu = 0.3;
  fbox(C.chrome, cu, 0.16, 0.0065, 0.14, 0.24, 0.003);
  fbox(C.chromeMid, cu, 0.16, 0.008, 0.126, 0.226, 0.003);
  fcyl(C.chromeHi, cu, 0.262, 0.0095, 0.012, 0.003, 10);
  fball(C.redBright, cu, 0.262, 0.0115, 0.008);
  fbox(C.amberBright, cu, 0.2, 0.0095, 0.036, 0.086, 0.003);
  fbox(C.chromeDk, cu, 0.2, 0.0115, 0.028, 0.068, 0.003);
  fbox(C.black, cu, 0.2, 0.0135, 0.006, 0.05, 0.003);
  const coinSizes: [number, number, string][] = [
    [-1, 0.0105, C.red],
    [0, 0.0085, C.amberBright],
    [1, 0.0125, C.teal],
  ];
  for (const [k, rad, col] of coinSizes) {
    fcyl(col, cu + k * 0.037, 0.138, 0.0098, rad, 0.003, 10);
    fcyl(C.chromeHi, cu + k * 0.037, 0.138, 0.0112, rad * 0.6, 0.003, 10);
  }
  fbox(C.black, cu, 0.093, 0.0098, 0.06, 0.036, 0.003);
  fbox(C.chromeHi, cu, 0.103, 0.0125, 0.054, 0.013, 0.003);
  fbox(C.cream2, cu, 0.056, 0.0098, 0.07, 0.012, 0.003);
  fbox(C.dark, cu, 0.056, 0.0112, 0.05, 0.003, 0.002);

  // ---------------------------------------------------------------- rear panel
  box(C.darker, [0, 0.5, -0.3625], 0.62, 0.62, 0.004);
  box(C.chrome, [0, 0.82, -0.364], 0.66, 0.016, 0.006);
  box(C.chrome, [0, 0.18, -0.364], 0.66, 0.016, 0.006);
  for (const s of [-1, 1]) box(C.chrome, [s * 0.32, 0.5, -0.364], 0.016, 0.64, 0.006);
  for (let i = 0; i < 9; i++) box(C.dark, [0, 0.24 + i * 0.065, -0.3655], 0.58, 0.02, 0.004);

  return b.root;
}

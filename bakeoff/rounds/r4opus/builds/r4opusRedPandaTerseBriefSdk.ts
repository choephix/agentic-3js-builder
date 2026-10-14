import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Red Panda",
  description:
    "A stylized low-poly red panda rigged in a neutral standing rest pose. It has a faceted rust coat with tufted fur clumps, black legs and belly, and a white face mask with rust tear marks. The ears have white rims, the jaw is a separate piece that can open, and the tail is a fat ringed stack of rust and buff segments.",
};

type V = [number, number, number];
type E = { c: V; r: V };

const COL = {
  rust: "#c4511f",
  rustDeep: "#a53e16",
  rustLight: "#d9733a",
  face: "#d2672c",
  faceLight: "#e2823f",
  buff: "#e8b072",
  tailDark: "#4e2414",
  black: "#2a1712",
  blackSoft: "#3a2018",
  white: "#f6efe4",
  claw: "#e3d3bb",
  nose: "#141010",
  eye: "#1b0f0c",
  shine: "#ffffff",
  mouth: "#4a1a1a",
  tongue: "#e07a86",
  earBack: "#3a1a10",
  tear: "#9c3614",
};

// Flat-shaded (faceted) geometry for the low-poly look.
function facet(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const n = g.index ? g.toNonIndexed() : g;
  n.computeVertexNormals();
  return n;
}
function ellGeo(r: V, w = 10, h = 8): THREE.BufferGeometry {
  return facet(new THREE.SphereGeometry(1, w, h).scale(r[0], r[1], r[2]));
}
// Point on an ellipsoid from a unit-ish direction n (scaled by radii), pulled in by inset.
function onE(e: E, n: V, inset = 0): V {
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  const u: V = [n[0] / l, n[1] / l, n[2] / l];
  return [
    e.c[0] + u[0] * e.r[0] - u[0] * inset,
    e.c[1] + u[1] * e.r[1] - u[1] * inset,
    e.c[2] + u[2] * e.r[2] - u[2] * inset,
  ];
}
// Ray from centre along d hits the ellipsoid; pulled in by inset.
function surf(e: E, d: V, inset = 0): V {
  const t = 1 / Math.sqrt((d[0] / e.r[0]) ** 2 + (d[1] / e.r[1]) ** 2 + (d[2] / e.r[2]) ** 2);
  const len = Math.hypot(d[0], d[1], d[2]);
  const k = t - inset / len;
  return [e.c[0] + d[0] * k, e.c[1] + d[1] * k, e.c[2] + d[2] * k];
}
// Front-most z of an ellipsoid at (x, y).
function frontZ(e: E, x: number, y: number): number {
  const q = 1 - ((x - e.c[0]) / e.r[0]) ** 2 - ((y - e.c[1]) / e.r[1]) ** 2;
  return q <= 0 ? -Infinity : e.c[2] + e.r[2] * Math.sqrt(q);
}

export default function build() {
  const b: any = createBuilder({ name: "red_panda" });

  // ---------- deterministic randomness ----------
  const R: any = rng(1337);
  let s0 = 1337 >>> 0;
  const local = () => {
    s0 = (s0 + 0x6d2b79f5) >>> 0;
    let t = s0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rand = (): number => {
    let v: any;
    if (typeof R === "function") v = R();
    else if (R && typeof R.next === "function") v = R.next();
    else if (R && typeof R.random === "function") v = R.random();
    return typeof v === "number" && isFinite(v) && v >= 0 && v < 1 ? v : local();
  };
  const pick = <T,>(a: T[]): T => a[Math.min(a.length - 1, Math.floor(rand() * a.length))];

  const J = (name: string, at: V, parent: any, role: string) =>
    parent ? b.joint(name, { at, parent, role }) : b.joint(name, { at, role });
  const P = (geo: THREE.BufferGeometry, color: string, at: V, bone: any) =>
    b.part(geo, color, { at, bone });
  const EP = (e: E, color: string, bone: any, w = 10, h = 8) => P(ellGeo(e.r, w, h), color, e.c, bone);

  // ---------- skeleton ----------
  const hips = J("hips", [0, 0.25, -0.13], null, "spine");
  const spine = J("spine", [0, 0.255, -0.02], hips, "spine");
  const chest = J("chest", [0, 0.26, 0.09], spine, "spine");
  const neck = J("neck", [0, 0.3, 0.17], chest, "neck");
  const head = J("head", [0, 0.35, 0.23], neck, "head");
  const jaw = J("jaw", [0, 0.338, 0.305], head, "jaw");

  const tailPt = (t: number): V => [0, 0.245 + 0.05 * t + 0.03 * t * t, -0.26 - 0.46 * t];
  const tails: any[] = [];
  for (let k = 0; k <= 5; k++) {
    const t = k < 5 ? k / 5 : 1.08;
    tails.push(J(`tail${k + 1}`, tailPt(t), k === 0 ? hips : tails[k - 1], "tail"));
  }

  const H: E = { c: [0, 0.38, 0.27], r: [0.104, 0.086, 0.086] };

  const sides: [number, string][] = [
    [1, "L"],
    [-1, "R"],
  ];

  const legs: Record<string, any> = {};
  for (const [s, n] of sides) {
    const sh = J(`shoulder${n}`, [s * 0.07, 0.22, 0.11], chest, "leg");
    const el = J(`elbow${n}`, [s * 0.074, 0.13, 0.12], sh, "leg");
    const wr = J(`wrist${n}`, [s * 0.077, 0.045, 0.13], el, "leg");
    const hd = J(`hand${n}`, [s * 0.077, 0.015, 0.17], wr, "digit");
    const hp = J(`hip${n}`, [s * 0.075, 0.22, -0.15], hips, "leg");
    const kn = J(`knee${n}`, [s * 0.08, 0.14, -0.12], hp, "leg");
    const an = J(`ankle${n}`, [s * 0.082, 0.055, -0.16], kn, "leg");
    const ft = J(`foot${n}`, [s * 0.082, 0.015, -0.1], an, "digit");
    const earBase = surf(H, [s * 0.62, 0.78, -0.08], 0.012);
    const ear = J(`ear${n}`, earBase, head, "hinge");
    legs[n] = { sh, el, wr, hd, hp, kn, an, ft, ear, earBase };
  }

  // ---------- torso ----------
  const HIP: E = { c: [0, 0.25, -0.14], r: [0.115, 0.105, 0.15] };
  const CH: E = { c: [0, 0.255, 0.06], r: [0.105, 0.1, 0.15] };
  EP(HIP, COL.rust, hips, 12, 9);
  EP(CH, COL.rust, chest, 12, 9);
  EP({ c: [0, 0.205, -0.04], r: [0.092, 0.07, 0.21] }, COL.black, spine, 12, 8); // dark belly
  EP({ c: [0, 0.25, 0.15], r: [0.07, 0.07, 0.07] }, COL.black, chest); // chest bib
  EP({ c: [0, 0.3, 0.2], r: [0.06, 0.05, 0.06] }, COL.black, neck); // throat
  EP({ c: [0, 0.33, 0.16], r: [0.075, 0.065, 0.08] }, COL.rust, neck); // nape

  // fur clumps on the back
  const clump = (e: E, bone: any, count: number, cols: string[], elMin: number, elMax: number, azMin = -Math.PI, azMax = Math.PI) => {
    for (let i = 0; i < count; i++) {
      const az = azMin + rand() * (azMax - azMin);
      const el = elMin + rand() * (elMax - elMin);
      const n: V = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
      const sz = 0.016 + rand() * 0.016;
      const at = onE(e, n, sz * 0.45);
      const g = facet(new THREE.IcosahedronGeometry(sz, 0).rotateY(rand() * 6).rotateX(rand() * 6).scale(1, 0.7, 1));
      P(g, pick(cols), at, bone);
    }
  };
  const backCols = [COL.rust, COL.rustDeep, COL.rustLight, COL.rust];
  clump(HIP, hips, 30, backCols, 0.15, 1.35);
  clump(CH, chest, 24, backCols, 0.2, 1.35, -Math.PI, Math.PI);

  // jagged fur fringe where the rust back meets the black belly
  for (const [s] of sides) {
    for (let i = 0; i < 9; i++) {
      const z = -0.25 + i * 0.05;
      const e = z < -0.04 ? HIP : CH;
      const bone = z < -0.04 ? hips : chest;
      const az = Math.asin(Math.max(-0.95, Math.min(0.95, (z - e.c[2]) / e.r[2])));
      const el = -0.32;
      const n: V = [s * Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
      const at = onE(e, n, 0.012);
      const h = 0.036 + rand() * 0.012;
      const g = facet(
        new THREE.ConeGeometry(0.018, h, 5).translate(0, h / 2, 0).rotateZ(-s * (Math.PI - 0.38)).rotateY(s * 0.25)
      );
      P(g, i % 2 ? COL.rust : COL.rustDeep, at, bone);
    }
  }

  // ---------- tail: ringed stack ----------
  const NT = 12;
  for (let i = 0; i < NT; i++) {
    const t = i / (NT - 1);
    const rr = 0.048 + 0.022 * Math.sin(Math.PI * (0.15 + 0.75 * t)) - 0.01 * t;
    const col = i >= NT - 2 ? COL.tailDark : i % 2 === 0 ? COL.rust : COL.buff;
    const bone = tails[Math.min(5, Math.floor(t * 5 + 0.001))];
    P(ellGeo([rr, rr * 0.95, 0.046], 9, 7), col, tailPt(t), bone);
  }
  // fluffy tip
  {
    const tip = tailPt(1.04);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      const g = facet(
        new THREE.ConeGeometry(0.018, 0.05, 5)
          .translate(0, 0.025, 0)
          .rotateX(-1.27 + Math.sin(a) * 0.35)
          .rotateY(Math.cos(a) * 0.35)
      );
      P(g, COL.tailDark, [tip[0] + Math.cos(a) * 0.015, tip[1] + Math.sin(a) * 0.015, tip[2]], tails[5]);
    }
  }

  // ---------- legs ----------
  const cap = (r: number, len: number) => facet(new THREE.CapsuleGeometry(r, len, 2, 7));
  const toeXs = [-0.021, -0.007, 0.007, 0.021];
  for (const [s, n] of sides) {
    const L = legs[n];
    // front
    P(cap(0.036, 0.06), COL.black, [s * 0.072, 0.175, 0.115], L.sh);
    EP({ c: [s * 0.075, 0.225, 0.11], r: [0.045, 0.045, 0.05] }, COL.rustDeep, L.sh, 8, 6); // shoulder blend
    P(cap(0.03, 0.06), COL.black, [s * 0.075, 0.09, 0.125], L.el);
    EP({ c: [s * 0.077, 0.022, 0.145], r: [0.034, 0.024, 0.045] }, COL.black, L.wr, 9, 7);
    for (const tx of toeXs) {
      const x = s * 0.077 + tx;
      P(ellGeo([0.012, 0.011, 0.012], 7, 5), COL.blackSoft, [x, 0.012, 0.18], L.hd);
      P(facet(new THREE.ConeGeometry(0.0045, 0.016, 4).translate(0, 0.008, 0).rotateX(1.98)), COL.claw, [x, 0.012, 0.188], L.hd);
    }
    // hind
    EP({ c: [s * 0.082, 0.185, -0.145], r: [0.048, 0.065, 0.065] }, COL.black, L.hp, 9, 7);
    EP({ c: [s * 0.085, 0.22, -0.15], r: [0.045, 0.045, 0.055] }, COL.rustDeep, L.hp, 8, 6);
    P(cap(0.027, 0.05), COL.black, [s * 0.082, 0.1, -0.14], L.kn);
    EP({ c: [s * 0.082, 0.022, -0.125], r: [0.034, 0.024, 0.058] }, COL.black, L.an, 9, 7);
    for (const tx of toeXs) {
      const x = s * 0.082 + tx;
      P(ellGeo([0.011, 0.011, 0.012], 7, 5), COL.blackSoft, [x, 0.012, -0.074], L.ft);
      P(facet(new THREE.ConeGeometry(0.004, 0.014, 4).translate(0, 0.007, 0).rotateX(1.98)), COL.claw, [x, 0.012, -0.066], L.ft);
    }
  }

  // ---------- head ----------
  EP(H, COL.face, head, 12, 9);
  clump(H, head, 9, [COL.face, COL.faceLight, COL.rust], 0.75, 1.4, -2.4, 2.4);

  const MUZ: E = { c: [0, 0.348, 0.345], r: [0.042, 0.03, 0.042] };
  EP(MUZ, COL.white, head, 10, 7);
  const cheeks: Record<string, E> = {};
  for (const [s, n] of sides) {
    const C: E = { c: [s * 0.06, 0.35, 0.315], r: [0.042, 0.034, 0.034] };
    cheeks[n] = C;
    EP(C, COL.white, head, 9, 7);
  }
  const faceZ = (x: number, y: number, extra: E[] = []) =>
    Math.max(frontZ(H, x, y), frontZ(MUZ, x, y), ...extra.map((e) => frontZ(e, x, y)));

  // nose + philtrum
  P(ellGeo([0.016, 0.011, 0.012], 8, 6), COL.nose, [0, 0.362, 0.379], head);
  P(facet(new THREE.BoxGeometry(0.003, 0.014, 0.003)), COL.nose, [0, 0.346, faceZ(0, 0.346) - 0.001], head);

  // jaw (separate, can open)
  P(ellGeo([0.03, 0.01, 0.032], 8, 6), COL.mouth, [0, 0.333, 0.335], jaw);
  P(ellGeo([0.018, 0.006, 0.022], 7, 5), COL.tongue, [0, 0.331, 0.345], jaw);
  EP({ c: [0, 0.324, 0.34], r: [0.032, 0.016, 0.036] }, COL.white, jaw, 9, 7);

  for (const [s, n] of sides) {
    const C = cheeks[n];
    // eyes
    const ex = s * 0.042, ey = 0.39;
    const ez = faceZ(ex, ey) - 0.006;
    P(ellGeo([0.017, 0.018, 0.013], 9, 7), COL.eye, [ex, ey, ez], head);
    P(ellGeo([0.005, 0.005, 0.004], 6, 4), COL.shine, [ex + s * 0.004, ey + 0.007, ez + 0.01], head);
    P(ellGeo([0.0025, 0.0025, 0.002], 5, 4), COL.shine, [ex - s * 0.005, ey - 0.006, ez + 0.011], head);
    // white brows
    const bx = s * 0.036, by = 0.421;
    P(ellGeo([0.018, 0.01, 0.01], 8, 5), COL.white, [bx, by, faceZ(bx, by) - 0.004], head);
    // rust tear marks running from the eye to the mouth corner
    const tx = s * 0.047, ty = 0.357;
    P(
      facet(new THREE.SphereGeometry(1, 7, 5).scale(0.009, 0.026, 0.008).rotateZ(s * 0.22)),
      COL.tear,
      [tx, ty, faceZ(tx, ty, [C]) - 0.003],
      head
    );
    // cheek ruff tufts
    const tuftDefs: [V, number, number, string][] = [
      [[s * 0.093, 0.345, 0.31], 0.4, 0.3, COL.white],
      [[s * 0.088, 0.325, 0.3], 0.75, 0.25, COL.white],
      [[s * 0.096, 0.366, 0.295], 0.15, 0.35, COL.white],
      [[s * 0.098, 0.392, 0.255], 0.05, 0.5, COL.face],
      [[s * 0.094, 0.36, 0.24], 0.45, 0.6, COL.rust],
    ];
    for (const [at, tilt, back, col] of tuftDefs) {
      const g = facet(
        new THREE.ConeGeometry(0.016, 0.045, 5).translate(0, 0.0225, 0).rotateZ(-s * (Math.PI / 2 + tilt)).rotateY(s * back)
      );
      P(g, col, at, head);
    }
    // whiskers
    for (let k = 0; k < 3; k++) {
      const g = new THREE.CylinderGeometry(0.0011, 0.0005, 0.06, 3)
        .translate(0, 0.03, 0)
        .rotateZ(-s * (Math.PI / 2 - 0.25 + 0.2 * k))
        .rotateY(s * 0.3);
      P(g, COL.white, [s * 0.03, 0.35 - 0.006 * k, 0.367], head);
    }
    // ears: dark back, white rim, rust centre
    const L = legs[n];
    const eb: V = L.earBase;
    const earShape = (r: number, h: number, flat: number) =>
      facet(
        new THREE.ConeGeometry(r, h, 7).translate(0, h / 2, 0).scale(1, 1, flat).rotateX(-0.12).rotateZ(-s * 0.42)
      );
    P(earShape(0.037, 0.072, 0.45), COL.earBack, eb, L.ear);
    P(earShape(0.028, 0.056, 0.32), COL.white, [eb[0], eb[1] + 0.003, eb[2] + 0.01], L.ear);
    P(earShape(0.016, 0.036, 0.28), COL.face, [eb[0] - s * 0.002, eb[1] + 0.004, eb[2] + 0.016], L.ear);
  }

  // crown tufts
  for (let k = -1; k <= 1; k++) {
    const at = surf(H, [k * 0.25, 1, -0.15], 0.006);
    const g = facet(new THREE.ConeGeometry(0.012, 0.03, 5).translate(0, 0.015, 0).rotateX(-0.7).rotateZ(-k * 0.3));
    P(g, COL.faceLight, at, head);
  }

  return b.root;
}

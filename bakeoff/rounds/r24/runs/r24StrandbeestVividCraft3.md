```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { aim, catmull, createBuilder, mix, noise, paint, rng, smoothstep, svg } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest",
  description:
    "A Theo Jansen style wind walker: twelve Jansen-linkage legs on a crankshaft, pale yellow PVC tubes held with zip ties, PET-bottle pumps and two sail wings, standing on wet sand with a trail of footprints.",
};

// ---------------------------------------------------------------------------------------------------------------
// Jansen's "holy numbers" (units), solved as a planar linkage for any crank angle.

type P2 = [number, number];
type V3 = THREE.Vector3;
const L = { a: 38.0, b: 41.5, c: 39.3, d: 40.1, e: 55.8, f: 39.4, g: 36.7, h: 65.7, i: 49.0, j: 50.0, k: 61.9, l: 7.8, m: 15.0 };

function meet(p0: P2, r0: number, p1: P2, r1: number, sign: number): P2 {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const d = Math.max(Math.hypot(dx, dy), 1e-6);
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r0 * r0 - a * a, 0));
  const ux = dx / d;
  const uy = dy / d;
  return [p0[0] + a * ux + sign * h * -uy, p0[1] + a * uy + sign * h * ux];
}

function solve(thetaDeg: number): Record<string, P2> {
  const t = (thetaDeg * Math.PI) / 180;
  const A: P2 = [0, 0];
  const X: P2 = [L.a, L.l];
  const Y: P2 = [X[0] + L.m * Math.cos(t), X[1] + L.m * Math.sin(t)];
  const B = meet(A, L.b, Y, L.j, 1);
  const C = meet(A, L.d, Y, L.k, -1);
  const D = meet(B, L.e, C, L.c, 1);
  const E = meet(C, L.f, D, L.g, -1);
  const F = meet(D, L.h, E, L.i, -1);
  return { A, X, Y, B, C, D, E, F };
}

const BARS: [string, string, string][] = [
  ["m", "X", "Y"],
  ["b", "A", "B"],
  ["j", "Y", "B"],
  ["d", "A", "C"],
  ["k", "Y", "C"],
  ["e", "B", "D"],
  ["c", "C", "D"],
  ["f", "C", "E"],
  ["g", "D", "E"],
  ["h", "D", "F"],
  ["i", "E", "F"],
];

function segX(a: P2, b: P2, c: P2, d: P2) {
  const ccw = (p: P2, q: P2, r: P2) => (r[1] - p[1]) * (q[0] - p[0]) > (q[1] - p[1]) * (r[0] - p[0]);
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

/** Gives every bar of one leg a side-to-side layer so bars sharing a joint or crossing each other never collide. */
function layerize(P: Record<string, P2>): Record<string, number> {
  const conf = new Map<string, Set<string>>();
  for (const [n] of BARS) conf.set(n, new Set());
  for (let i = 0; i < BARS.length; i++)
    for (let j = i + 1; j < BARS.length; j++) {
      const [n1, a1, b1] = BARS[i];
      const [n2, a2, b2] = BARS[j];
      const share = a1 === a2 || a1 === b2 || b1 === a2 || b1 === b2;
      if (share || segX(P[a1], P[b1], P[a2], P[b2])) {
        conf.get(n1)!.add(n2);
        conf.get(n2)!.add(n1);
      }
    }
  const order = BARS.map((x) => x[0]).sort((u, v) => conf.get(v)!.size - conf.get(u)!.size);
  const lay: Record<string, number> = {};
  for (const n of order) {
    const used = new Set([...conf.get(n)!].filter((o) => o in lay).map((o) => lay[o]));
    lay[n] = [0, 1, -1, 2, -2].find((c) => !used.has(c)) ?? 0;
  }
  return lay;
}

// ---------------------------------------------------------------------------------------------------------------
// Palette, paints, textures

const WHITE = "#f4f1e4";
const BLACK = "#1b1c21";
const STEEL = "#6d737c";
const NUT = "#b7bcc4";
const RUBBER = "#26292f";
const AXLE = "#9aa1aa";
const HOSE = "#202226";
const STUB = "#8c929b";
const CORD = "#2a2722";
const ORANGE = "#ff8a1f";
const DENT = "#6a573d";
const RED_TAPE = "#d2382c";
const BOTTLE_PLASTIC = "#bfe5df";
const BOTTLE_FOOT = "#98c4bf";
const CAP_BLUE = "#2f6fbd";

const PVC = paint((p, n) => {
  const lit = smoothstep(-0.8, 0.9, n.y);
  let c = mix("#d8c465", "#f8ecad", 0.3 + 0.45 * lit + 0.25 * noise(p, 0.6, 3));
  c = mix(c, "#b9a249", smoothstep(0.62, 0.78, noise(p, 0.05, 8)) * 0.5);
  c = mix(c, "#a58c5f", smoothstep(0.75, 0.05, p.y) * (0.25 + 0.5 * noise(p, 0.09, 4)));
  return c;
});

const BAT = [0.3, 0.65, 1.0];
const CLOTH = paint((p, n, s) => {
  let c = mix("#f3eedb", "#dcd2b3", 0.55 * noise(p, 0.3, 2) + 0.3 * smoothstep(0.3, -0.6, n.y));
  for (const bu of BAT) {
    const d = Math.abs(s[0] - bu);
    if (d < 0.004 && Math.floor(s[1] / 0.012) % 2 === 0) c = mix(c, "#6f6650", 0.8);
    else if (d < 0.016) c = mix(c, "#c8bc9b", 0.35);
  }
  if (s[0] < 0.01) c = mix(c, "#9d9373", 0.6);
  return mix(c, "#cdb78a", smoothstep(0.5, 0.7, s[1]) * 0.35);
});

const SAND = paint((p, n) => {
  const d = Math.hypot(p.x / 1.95, (p.z + 0.25) / 1.55);
  const rip = Math.sin(p.z * 34 + noise(p, 0.5, 4) * 7);
  const wet = Math.min(1, 0.35 + 0.55 * smoothstep(0.35, 1.0, d) + 0.25 * noise(p, 0.35, 6));
  let c = mix("#c9ae7e", "#8a7351", wet);
  c = mix(c, "#6f5b3f", 0.14 * (0.5 + 0.5 * rip) * wet);
  c = mix(c, "#9fb0b3", smoothstep(0.66, 0.74, noise(p, 0.55, 9)) * 0.7);
  c = mix(c, "#e5e2d6", smoothstep(0.9, 1.0, d) * smoothstep(0.45, 0.7, noise(p, 0.12, 3)) * 0.8);
  return mix(c, "#55442e", smoothstep(0.3, -0.4, n.y) * 0.6);
});

const BOTTLE_P = paint((_p, _n, s) => {
  const h = s[0];
  if (h > 0.246) return CAP_BLUE;
  if (h > 0.05 && h < 0.16) return h > 0.095 && h < 0.115 ? "#2f78c4" : "#f4f6f4";
  if (h < 0.02) return BOTTLE_FOOT;
  return BOTTLE_PLASTIC;
});

function emblemSvg() {
  let legs = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const pt = (r: number, da: number) =>
      `${(50 + r * Math.cos(a + da)).toFixed(1)} ${(50 + r * Math.sin(a + da)).toFixed(1)}`;
    legs += `<path d="M${pt(8, 0)} L${pt(22, 0.22)} L${pt(33, -0.05)}" />`;
    legs += `<circle cx="${(50 + 22 * Math.cos(a + 0.22)).toFixed(1)}" cy="${(50 + 22 * Math.sin(a + 0.22)).toFixed(1)}" r="1.9" fill="#27456e" stroke="none"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#27456e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="40" stroke-width="1.6"/>
      ${legs}
    </g>
    <circle cx="50" cy="50" r="6" fill="#27456e"/><circle cx="50" cy="50" r="2.4" fill="#f3eedb"/>
    <g fill="#27456e"><circle cx="50" cy="8" r="2"/><circle cx="50" cy="92" r="2"/><circle cx="8" cy="50" r="2"/><circle cx="92" cy="50" r="2"/></g>
  </svg>`;
}

const tape = (txt: string) =>
  svg(
    `<svg viewBox="0 0 120 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4 L6 2 L116 5 L118 28 L112 30 L3 27 Z" fill="#eadcae" stroke="#c9b982" stroke-width="1.2"/>
      <text x="60" y="23" text-anchor="middle" font-family="Marker Felt, Comic Sans MS, cursive" font-size="19" font-weight="bold" fill="#1d2a52">${txt}</text>
    </svg>`,
    { size: 256 },
  );

// ---------------------------------------------------------------------------------------------------------------

const U = 0.0135; // meters per linkage unit
const R = 0.0125; // PVC tube radius
const LS = 0.027; // spacing between bar layers in a leg
const NLEG = 12;
const DX = 0.22;
const Z0 = -0.29;

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const QX = aim([1, 0, 0]);
const QID = new THREE.Quaternion();

export default function build() {
  const b = createBuilder({ name: "strandbeest", paintSize: 2048 });
  const rnd = rng(7);

  // ---- merged hardware bags ---------------------------------------------------------------------------------
  const bags = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, g: THREE.BufferGeometry) => {
    let a = bags.get(color);
    if (!a) bags.set(color, (a = []));
    a.push(g);
  };
  const mtx = new THREE.Matrix4();
  const one = new THREE.Vector3(1, 1, 1);
  const place = (g: THREE.BufferGeometry, pos: V3, q: THREE.Quaternion) => {
    mtx.compose(pos, q, one);
    g.applyMatrix4(mtx);
    return g;
  };
  const perp = (d: V3) => {
    const a = Math.abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    return a.cross(d).normalize();
  };
  /** A zip tie: a ring round a tube of radius `rad` and a small tail. */
  const tie = (color: string, pos: V3, dir: V3, rad = R, ang = 0) => {
    const d = dir.clone().normalize();
    put(color, place(new THREE.TorusGeometry(rad + 0.003, 0.0024, 3, 8), pos, aim(d, undefined, "z")));
    const u1 = perp(d);
    const u2 = d.clone().cross(u1);
    const rv = u1.clone().multiplyScalar(Math.cos(ang)).addScaledVector(u2, Math.sin(ang));
    const tv = u2.clone().multiplyScalar(Math.cos(ang)).addScaledVector(u1, -Math.sin(ang));
    put(
      color,
      place(
        new THREE.BoxGeometry(0.005, 0.017, 0.005),
        pos.clone().addScaledVector(rv, rad + 0.0075).addScaledVector(d, 0.002),
        aim(tv),
      ),
    );
  };
  const cylAlong = (color: string, r: number, h: number, seg: number, pos: V3, dir: V3, open = false) =>
    put(color, place(new THREE.CylinderGeometry(r, r, h, seg, 1, open), pos, aim(dir)));
  const tubeFrom = (a: V3, c: V3, r = R, color: string | typeof PVC = PVC) =>
    b.rod(a, c, r, { color, extend: 0.011, caps: "flat" });
  let tieCount = 0;
  const nextTie = () => (tieCount++ % 3 === 2 ? BLACK : WHITE);

  // ---- choose the crank phase so the most feet are planted -------------------------------------------------------
  let phi0 = 0;
  let bestScore = -1;
  for (let phi = 0; phi < 30; phi++) {
    const fs = Array.from({ length: NLEG }, (_, k) => solve(k * 150 + phi).F[1]);
    const mn = Math.min(...fs);
    const score = fs.filter((f) => f - mn <= 4.6).length + 0.01 * fs.filter((f) => f - mn <= 1).length;
    if (score > bestScore) {
      bestScore = score;
      phi0 = phi;
    }
  }
  const legSets = Array.from({ length: NLEG }, (_, k) => ({ k, x: (k - 5.5) * DX, P: solve(k * 150 + phi0) }));
  const minF = Math.min(...legSets.map((l) => l.P.F[1]));
  const YC = -0.008 + 0.055 - (minF - L.l) * U;
  const W = (xw: number, p: P2) => V(xw, YC + (p[1] - L.l) * U, Z0 - (p[0] - L.a) * U);

  // ---- frame nodes (y, z) -----------------------------------------------------------------------------------------
  const N: Record<string, [number, number]> = {
    C: [YC, Z0],
    P: [YC - L.l * U, Z0 + L.a * U],
    T: [YC + 0.7, Z0 + 0.42],
    R: [YC + 0.5, Z0 - 0.3],
  };
  const fnode = (fx: number, nm: string) => V(fx, N[nm][0], N[nm][1]);

  // ---- textures ------------------------------------------------------------------------------------------------------
  const EMBLEM = svg(emblemSvg(), { size: 384 });
  const TAPES: Record<string, THREE.Texture> = { e: tape("e 55.8"), h: tape("h 65.7"), k: tape("k 61.9") };
  const NAMEPLATE = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="98" height="58" rx="6" fill="#c7ccd1" stroke="#555b63" stroke-width="2"/>
      <circle cx="9" cy="9" r="2.6" fill="#7a8088"/><circle cx="91" cy="9" r="2.6" fill="#7a8088"/>
      <circle cx="9" cy="51" r="2.6" fill="#7a8088"/><circle cx="91" cy="51" r="2.6" fill="#7a8088"/>
      <text x="50" y="25" text-anchor="middle" font-family="serif" font-weight="bold" font-size="14" fill="#1e2530">ANIMARIS</text>
      <text x="50" y="39" text-anchor="middle" font-family="serif" font-size="9" fill="#1e2530">STRANDBEEST · No. 12</text>
      <text x="50" y="51" text-anchor="middle" font-family="sans-serif" font-size="6.5" fill="#39414d">WIND POWERED · 13 HOLY NUMBERS</text>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Legs
  const footDents: { x: number; z: number; big: boolean }[] = [];
  for (const { k, x, P } of legSets) {
    const lay = layerize(P);
    const nodeBars = (node: string) => BARS.filter((bb) => bb[1] === node || bb[2] === node).map((bb) => lay[bb[0]]);
    const dxSide = x >= 0 ? 1 : -1;

    BARS.forEach(([nm, na, nb], bi) => {
      const lx = x + lay[nm] * LS;
      const pa = W(lx, P[na]);
      const pb = W(lx, P[nb]);
      const sw = tubeFrom(pa, pb);
      const dir = pb.clone().sub(pa);
      const len = dir.length();
      dir.normalize();
      tie(nextTie(), pa.clone().addScaledVector(dir, 0.05), dir, R, bi + k);
      if ((bi + k) % 2 === 0) tie(nextTie(), pb.clone().addScaledVector(dir, -0.05), dir, R, bi * 2 + k);
      if (nm === "g" || nm === "c") {
        const mid = pa.clone().addScaledVector(dir, len * 0.5);
        cylAlong((k + bi) % 2 ? BLACK : RED_TAPE, R + 0.0016, 0.03, 8, mid, dir, true);
      }
      if (TAPES[nm]) {
        const f = V(dxSide, 0, 0);
        const mid = pa.clone().add(pb).multiplyScalar(0.5).addScaledVector(f, R);
        let r = dir.clone();
        let up = f.clone().cross(r);
        if (up.y < 0) {
          r = r.negate();
          up = f.clone().cross(r);
        }
        b.decal(sw, TAPES[nm], { at: mid, dir: f, up: up.normalize(), size: [0.085, 0.022], segments: 8 });
      }
    });

    // bolts through every free joint
    for (const node of ["B", "C", "D", "E", "F", "Y"]) {
      const ls = nodeBars(node);
      const lo = Math.min(...ls);
      const hi = Math.max(...ls);
      const xl = x + lo * LS - R;
      const xh = x + hi * LS + R;
      const p = (xx: number) => W(xx, P[node]);
      put(STEEL, place(new THREE.CylinderGeometry(0.0042, 0.0042, xh - xl + 0.019, 6), p((xl + xh) / 2), QX));
      for (const [face, sg] of [
        [xl, -1],
        [xh, 1],
      ] as [number, number][]) {
        put(NUT, place(new THREE.CylinderGeometry(0.0085, 0.0085, 0.0066, 6), p(face + sg * 0.0057), QX));
        put(NUT, place(new THREE.CylinderGeometry(0.0115, 0.0115, 0.0024, 8), p(face + sg * 0.0012), QX));
      }
    }
    // collars that keep the leg in place on the pivot rail (A) and the crank axle (X)
    for (const node of ["A", "X"]) {
      const ls = node === "A" ? nodeBars("A") : [lay.m];
      const xl = x + Math.min(...ls) * LS - R;
      const xh = x + Math.max(...ls) * LS + R;
      const rad = node === "A" ? 0.0165 : 0.0125;
      for (const e of [xl - 0.006, xh + 0.006]) cylAlong(BLACK, rad, 0.009, 8, W(e, P[node]), V(1, 0, 0));
    }

    // adjustable foot: steel stub in a rubber pad, reaching the sand if the foot is down
    const Fw = W(x, P.F);
    const diff = P.F[1] - minF;
    const planted = diff <= 4.6;
    const ext = planted ? diff * U : 0;
    const L0 = 0.035 + ext;
    b.rod(Fw, V(Fw.x, Fw.y - L0 + 0.004, Fw.z), 0.0065, { color: STUB, caps: "flat", sides: 6 });
    tie(WHITE, V(Fw.x, Fw.y - 0.02, Fw.z), V(0, -1, 0), 0.0065, k);
    const padC = V(Fw.x, Fw.y - L0 - 0.02 + 0.011, Fw.z);
    put(RUBBER, place(new THREE.CylinderGeometry(0.034, 0.037, 0.022, 8), padC, QID));
    if (planted) footDents.push({ x: Fw.x, z: Fw.z, big: true });
    for (let j = 1; j <= 3; j++) {
      const zf = Fw.z - 0.7 * j + (rnd() - 0.5) * 0.05;
      if (zf > -1.55) footDents.push({ x: Fw.x + (rnd() - 0.5) * 0.02, z: zf, big: false });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Frame: triangulated trusses between the leg planes, joined by long rails
  const FX = [-1.32, -0.88, -0.44, 0, 0.44, 0.88, 1.32];
  const EDGES: [string, string][] = [
    ["P", "C"],
    ["C", "R"],
    ["R", "T"],
    ["T", "P"],
    ["C", "T"],
  ];
  FX.forEach((fx, fi) => {
    EDGES.forEach(([a, c], ei) => {
      const pa = fnode(fx, a);
      const pc = fnode(fx, c);
      tubeFrom(pa, pc);
      const d = pc.clone().sub(pa).normalize();
      tie(nextTie(), pa.clone().addScaledVector(d, 0.055), d, R, fi + ei);
      tie(nextTie(), pc.clone().addScaledVector(d, -0.055), d, R, fi * 2 + ei);
    });
    for (const nm of ["P", "T", "R"]) tie(WHITE, fnode(fx, nm), V(1, 0, 0), R, fi);
    cylAlong(RUBBER, 0.0175, 0.045, 8, fnode(fx, "C"), V(1, 0, 0));
  });
  // rails
  tubeFrom(V(-1.46, N.P[0], N.P[1]), V(1.46, N.P[0], N.P[1]));
  tubeFrom(V(-1.4, N.T[0], N.T[1]), V(1.4, N.T[0], N.T[1]));
  tubeFrom(V(-1.4, N.R[0], N.R[1]), V(1.4, N.R[0], N.R[1]));
  b.rod(V(-1.58, YC, Z0), V(1.58, YC, Z0), 0.0085, { color: AXLE, caps: "flat", sides: 8 });
  for (const [nm, ex] of [
    ["P", 1.46],
    ["T", 1.4],
    ["R", 1.4],
  ] as [string, number][])
    for (const sg of [-1, 1]) cylAlong(BLACK, 0.0138, 0.012, 8, V(sg * (ex + 0.017), N[nm][0], N[nm][1]), V(1, 0, 0));
  // crank handle at the +x end of the axle
  const handleA = V(1.6, YC, Z0);
  const handleB = V(1.6, YC + 0.0, Z0 - 0.14);
  b.rod(handleA, handleB, 0.007, { color: AXLE, caps: "flat", sides: 6 });
  cylAlong(RED_TAPE, 0.016, 0.07, 8, V(1.6, YC, Z0 - 0.14), V(1, 0, 0));
  // top bracing
  for (let i = 0; i < FX.length - 1; i++) {
    const [a, c] = i % 2 === 0 ? ["T", "R"] : ["R", "T"];
    const pa = fnode(FX[i], a);
    const pc = fnode(FX[i + 1], c);
    b.rod(pa, pc, 0.01, { color: PVC, extend: 0.011, caps: "flat", sides: 6 });
    const d = pc.clone().sub(pa).normalize();
    tie(BLACK, pa.clone().addScaledVector(d, 0.05), d, 0.01, i);
    tie(WHITE, pc.clone().addScaledVector(d, -0.05), d, 0.01, i + 2);
  }
  // name tag hung from the top rail
  const tagC = V(0.03, N.T[0] - 0.1, N.T[1] + 0.02);
  b.part(new THREE.BoxGeometry(0.004, 0.06, 0.1), "#ffffff", { at: tagC, texture: NAMEPLATE });
  b.rod(V(0.03, N.T[0], N.T[1] + 0.02), V(0.03, N.T[0] - 0.07, N.T[1] + 0.02), 0.0025, {
    color: CORD,
    caps: "flat",
    sides: 4,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Bottles on the rear rail
  const bz = N.R[1] - 0.058;
  const bBottom = N.R[0] - 0.22;
  const BOTTLE: [number, number][] = [
    [0, 0],
    [0.034, 0],
    [0.043, 0.012],
    [0.043, 0.17],
    [0.036, 0.2],
    [0.016, 0.235],
    [0.0145, 0.262],
    [0, 0.262],
  ];
  const bxs: number[] = [];
  for (let i = 0; i < 12; i++) bxs.push((i - 5.5) * 0.22);
  bxs.forEach((bx, i) => {
    b.lathe(BOTTLE, { at: V(bx, bBottom, bz), segments: 8, color: BOTTLE_P });
    tie(WHITE, V(bx, N.R[0], bz), V(0, 1, 0), 0.043, i);
    tie(BLACK, V(bx, N.R[0], N.R[1]), V(1, 0, 0), R, i * 3);
  });
  const hosePts: number[][] = [[bxs[0] - 0.12, bBottom + 0.3, bz]];
  bxs.forEach((bx, i) => {
    hosePts.push([bx, bBottom + 0.274, bz]);
    if (i < bxs.length - 1) hosePts.push([(bx + bxs[i + 1]) / 2, bBottom + 0.325, bz]);
  });
  hosePts.push([bxs[bxs.length - 1] + 0.12, bBottom + 0.3, bz]);
  b.sweep(catmull(hosePts), 0.0035, { color: HOSE, caps: "round", sides: 5 });

  // ---------------------------------------------------------------------------------------------------------------
  // Sail wings
  const PHI = (15 * Math.PI) / 180;
  const cp = Math.cos(PHI);
  const sp = Math.sin(PHI);
  const WY = N.T[0] + 0.24;
  const ZLE = N.T[1] + 0.3;
  const wp = (s: number, u: number, v: number, w = 0) =>
    V(s * u * cp - s * sp * w, WY + u * sp + w * cp, ZLE - v);
  const WING: [number, number][] = [
    [0, 0],
    [1.3, 0],
    [1.37, 0.12],
    [1.36, 0.28],
    [1.2, 0.36],
    [1.0, 0.46],
    [0.82, 0.41],
    [0.65, 0.55],
    [0.47, 0.5],
    [0.3, 0.62],
    [0.15, 0.57],
    [0, 0.64],
  ];
  const BATEND = [0.62, 0.55, 0.46];
  const WS = -0.0145;
  // root spar and mast legs (shared by both wings)
  tubeFrom(wp(1, 0, 0, WS), wp(1, 0, 0.64, WS));
  tubeFrom(V(0, N.T[0], N.T[1]), wp(1, 0, 0.02, WS));
  tubeFrom(V(0, N.R[0], N.R[1]), wp(1, 0, 0.62, WS));
  for (const sg of [1, -1]) {
    const S = V(sg * cp, sp, 0);
    const Un = V(-sg * sp, cp, 0);
    b.extrude(WING, { at: wp(sg, 0, 0, 0), x: S, y: [0, 0, -1], thickness: 0.004, color: CLOTH });
    // leading spar, battens
    tubeFrom(wp(sg, 0, 0, WS), wp(sg, 1.3, 0, WS));
    BAT.forEach((u, i) => {
      const a = wp(sg, u, 0.0, WS);
      const c = wp(sg, u, BATEND[i] - 0.025, WS);
      b.rod(a, c, 0.009, { color: PVC, extend: 0.008, caps: "flat", sides: 6 });
      tie(nextTie(), wp(sg, u, 0.0, WS), V(0, 0, -1), 0.011, i);
      tie(WHITE, wp(sg, u, BATEND[i] - 0.06, WS), V(0, 0, -1), 0.009, i + 1);
    });
    for (const u of [0.15, 0.48, 0.82, 1.15]) tie(BLACK, wp(sg, u, 0, WS), S, R, u * 7);
    // struts down to the frame
    for (const fx of [0.44, 0.88]) {
      const u = fx / cp;
      b.rod(V(sg * fx, N.T[0], N.T[1]), wp(sg, u, 0.0, WS), 0.011, { color: PVC, extend: 0.011, caps: "flat", sides: 6 });
      tie(WHITE, V(sg * fx, N.T[0] + 0.08, N.T[1] + 0.03), V(0, 1, 0.3), 0.011, fx * 9);
    }
    b.rod(V(sg * 0.44, N.R[0], N.R[1]), wp(sg, 0.3, 0.58, WS), 0.01, { color: PVC, extend: 0.01, caps: "flat", sides: 6 });
    b.rod(V(sg * 0.88, N.R[0], N.R[1]), wp(sg, 1.0, 0.44, WS), 0.01, { color: PVC, extend: 0.01, caps: "flat", sides: 6 });
    // guy cords from the wing tip
    const tip = wp(sg, 1.3, 0, WS);
    b.rod(tip, V(sg * 1.32, N.T[0], N.T[1]), 0.0028, { color: CORD, caps: "flat", sides: 5 });
    b.rod(tip, V(sg * 1.32, N.R[0], N.R[1]), 0.0028, { color: CORD, caps: "flat", sides: 5 });
    // grommets along the trailing edge
    for (const [u, v] of [
      [0.3, 0.6],
      [0.65, 0.53],
      [1.0, 0.44],
    ]) {
      put("#c9a24a", place(new THREE.TorusGeometry(0.008, 0.0028, 3, 8), wp(sg, u, v, 0.0), aim(Un, undefined, "z")));
    }
    // emblem on both faces of the cloth
    const ec = wp(sg, 0.83, 0.22, 0);
    for (const face of [1, -1]) {
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
        at: ec.clone().addScaledVector(Un, face * 0.0045),
        dir: Un.clone().multiplyScalar(face),
        axis: "z",
        up: [0, 0, 1],
        texture: EMBLEM,
      });
    }
    // orange survey-tape streamer on the wing tip
    b.extrude(
      [
        [0, 0.012],
        [0.14, 0.022],
        [0.28, 0.006],
        [0.42, 0.022],
        [0.54, 0.004],
        [0.5, -0.016],
        [0.36, -0.002],
        [0.22, -0.014],
        [0.1, -0.003],
        [0, -0.012],
      ],
      { at: wp(sg, 1.3, 0, WS - 0.004), x: [0, 0, -1], y: [0, 1, 0], thickness: 0.002, color: ORANGE },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Footprint dents, then hardware bags
  for (const d of footDents) {
    const g = new THREE.CylinderGeometry(d.big ? 0.05 : 0.04, d.big ? 0.05 : 0.04, 0.004, 8);
    g.scale(1, 1, 1.3);
    put(DENT, place(g, V(d.x, 0.0004, d.z), QID));
  }

  // wet sand
  const outline: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const rr = 1 + 0.07 * Math.sin(3 * a + 1.1) + 0.05 * Math.sin(5 * a + 0.3) + (rnd() - 0.5) * 0.04;
    outline.push([1.95 * rr * Math.cos(a), -0.25 + 1.55 * rr * Math.sin(a)]);
  }
  b.extrude(outline, { at: [0, -0.015, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, smoothing: 1, color: SAND });

  for (const [color, geos] of bags) {
    const merged = mergeGeometries(geos, false);
    if (merged) b.part(merged, color, { at: [0, 0, 0], flat: true });
  }

  return b.root;
}
```
import * as THREE from "three";
import { createBuilder, catmull, mix, noise, paint, rgb, rng, smoothstep, svg } from "../../../../src/index";
import type { Joint, Part, Rgb } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging kinetic mobile in the manner of Alexander Calder: black wire arms balanced by true torque, " +
    "hung from a ceiling canopy and swivel. Flat painted sheet-metal forms in red, black, white, yellow and blue " +
    "carry chipped paint, bare steel edges and a few drawn marks, with a CA monogram on the red crescent. " +
    "Every pivot is its own joint, so the arms can turn.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and constants

const RED = "#d3281d";
const BLACK = "#18181c";
const WHITE = "#f0ece0";
const YELLOW = "#f1be1c";
const BLUE = "#1e4aa8";
const WIRE = "#222226";
const WRAP = "#34343a";
const EDGE = "#7d8088";

const EYE = 0.026; // from an arm's pivot wire up to the top of its hanging eye
const LOW = 0.5; // lowest point of the mobile above the floor
const TH = 0.005; // sheet metal thickness
const V3 = THREE.Vector3;
const UP = new V3(0, 1, 0);
const DEGR = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Flat sheet-metal outlines. Origin = the hanging point, shapes extend below it.

type Pt = [number, number] | [number, number, "sharp"];
type Shape = { pts: Pt[]; smoothing: number };

function signedArea(pts: Pt[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}
const ccw = (pts: Pt[]): Pt[] => (signedArea(pts) < 0 ? [...pts].reverse() : pts);

function ellipse(rx: number, ry: number, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    out.push([rx * Math.sin(th), -ry + ry * Math.cos(th)]);
  }
  return out;
}

function radial(fn: (th: number) => number, n: number, sx = 1, sy = 1): Pt[] {
  const raw: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const th = (i / n) * Math.PI * 2;
    const r = fn(th);
    raw.push([r * Math.cos(th) * sx, r * Math.sin(th) * sy]);
  }
  const top = Math.max(...raw.map((p) => p[1]));
  return raw.map(([x, y]) => [x, y - top] as Pt);
}

const angDiff = (a: number, b: number) => {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

function leafShape(w: number, h: number): Pt[] {
  const k = 6;
  const side: [number, number][] = [];
  for (let i = 1; i < k; i++) {
    const t = i / k;
    side.push([w * Math.sin(Math.PI * Math.pow(t, 0.8)), -h * t]);
  }
  const pts: Pt[] = [[0, 0, "sharp"]];
  for (const [x, y] of side) pts.push([x, y]);
  pts.push([0, -h, "sharp"]);
  for (let i = side.length - 1; i >= 0; i--) pts.push([-side[i][0], side[i][1]]);
  return pts;
}

const SHAPES: Record<string, (s: number) => Shape> = {
  disc: (s) => ({ pts: ellipse(s / 2, s / 2, 20), smoothing: 0 }),
  paddle: (s) => ({ pts: ellipse(s * 0.17, s * 0.5, 16), smoothing: 0 }),
  leaf: (s) => ({ pts: leafShape(s * 0.3, s), smoothing: 0 }),
  triangle: (s) => ({
    pts: [
      [0, 0],
      [s * 0.5, -s * 0.9],
      [-s * 0.5, -s * 0.9],
    ],
    smoothing: 1,
  }),
  kidney: (s) => ({
    pts: radial((th) => (s / 2) * (1 - 0.38 * Math.exp(-(angDiff(th, 0.4) ** 2) / 0.35)), 28, 1.25, 0.95),
    smoothing: 0,
  }),
  flower: (s) => ({ pts: radial((th) => (s / 2) * (1 + 0.26 * Math.cos(5 * (th - Math.PI / 2))), 30), smoothing: 0 }),
  star: (s) => ({
    pts: radial((th) => (s / 2) * (0.42 + 0.58 * Math.pow(Math.abs(Math.cos(2.5 * (th - Math.PI / 2))), 1.6)), 40),
    smoothing: 0,
  }),
  crescent: (s) => {
    const w = s * 0.5;
    const h1 = s * 0.62;
    const h2 = s * 0.2;
    const pts: Pt[] = [[-w, h2, "sharp"]];
    for (let i = -3; i <= 3; i++) {
      const u = i / 4;
      pts.push([w * u, h2 - h1 * (1 - u * u)]);
    }
    pts.push([w, h2, "sharp"]);
    for (let i = 3; i >= -3; i--) {
      const u = i / 4;
      pts.push([w * u, h2 - h2 * (1 - u * u)]);
    }
    return { pts, smoothing: 0 };
  },
};

function bbox(pts: Pt[]) {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

// ---------------------------------------------------------------------------------------------------------------
// Painted-by-place sheet metal: chipped enamel on the faces, bare steel on the cut edges.

type Deco = { kind: "dot" | "ring" | "split" | "bands"; color: string };
type DecoFn = (x: number, y: number) => string | null;

function decoFn(spec: Deco, pts: Pt[]): DecoFn {
  const bb = bbox(pts);
  const m = Math.min(bb.w, bb.h);
  switch (spec.kind) {
    case "dot":
      return (x, y) => (Math.hypot(x - bb.cx, y - bb.cy) < 0.2 * m ? spec.color : null);
    case "ring":
      return (x, y) => {
        const d = Math.hypot(x - bb.cx, y - bb.cy);
        return d < 0.17 * m || (d > 0.5 * m && d < 0.72 * m) ? spec.color : null;
      };
    case "split":
      return (x) => (x < bb.cx ? spec.color : null);
    default:
      return (x, y) => (Math.floor((x * 0.8 + y * 0.6) / 0.045) % 2 !== 0 ? spec.color : null);
  }
}

function coat(base: string, seed: number, thick: THREE.Vector3 | null, deco?: DecoFn) {
  const baseC = rgb(base);
  return paint((p, n, s) => {
    if (thick && Math.abs(n.dot(thick)) < 0.5) return mix(base, EDGE, 0.55);
    const d = deco ? deco(s[0], s[1]) : null;
    let c: Rgb = d ? rgb(d) : baseC;
    const k = noise(p, 0.1, seed);
    c = mix(c, k > 0.5 ? "#ffffff" : "#000000", Math.abs(k - 0.5) * 0.2);
    const chip = noise(p, 0.02, seed + 3);
    if (chip > 0.78) c = mix(c, "#8f8c86", smoothstep(0.78, 0.84, chip) * 0.75);
    c = mix(c, "#fff1d6", 0.07 * Math.max(n.y, 0));
    return c;
  });
}

// ---------------------------------------------------------------------------------------------------------------
// The mobile as a tree of balanced arms and hanging forms.

type DecalKey = "mono" | "spiral" | "dashes" | "target" | "flower";
type Base = { id: number; mass: number; T: THREE.Vector3 };
type LeafN = Base & {
  t: "leaf";
  shape: string;
  s: number;
  color: string;
  pts: Pt[];
  smoothing: number;
  yaw: number;
  tilt: number;
  roll: number;
  deco?: Deco;
  decal?: DecalKey;
  xd: THREE.Vector3;
  yd: THREE.Vector3;
  at: THREE.Vector3;
};
type BallN = Base & { t: "ball"; r: number; color: string; center: THREE.Vector3 };
type ArmN = Base & {
  t: "arm";
  L: number;
  yaw: number;
  A: N;
  B: N;
  dA: number;
  dB: number;
  bowL: number;
  bowY: number;
  P: THREE.Vector3;
  d: THREE.Vector3;
  a: number;
  c: number;
  EA: THREE.Vector3;
  EB: THREE.Vector3;
};
type N = LeafN | BallN | ArmN;

let nextId = 0;
const rand = rng(11);

function leaf(
  shape: string,
  s: number,
  color: string,
  yawDeg: number,
  tilt: number,
  rollDeg: number,
  extra: { deco?: Deco; decal?: DecalKey } = {},
): LeafN {
  const sh = SHAPES[shape](s);
  const pts = ccw(sh.pts);
  return {
    t: "leaf",
    id: nextId++,
    mass: Math.abs(signedArea(pts)) + 0.004,
    T: new V3(),
    shape,
    s,
    color,
    pts,
    smoothing: sh.smoothing,
    yaw: yawDeg * DEGR,
    tilt,
    roll: rollDeg * DEGR,
    deco: extra.deco,
    decal: extra.decal,
    xd: new V3(),
    yd: new V3(),
    at: new V3(),
  };
}

function ball(r: number, color: string): BallN {
  return { t: "ball", id: nextId++, mass: Math.PI * r * r * 1.3 + 0.002, T: new V3(), r, color, center: new V3() };
}

function arm(L: number, yawDeg: number, A: N, B: N, dA = 0.27, dB = 0.27): ArmN {
  return {
    t: "arm",
    id: nextId++,
    mass: A.mass + B.mass + 0.012,
    T: new V3(),
    L,
    yaw: yawDeg * DEGR,
    A,
    B,
    dA,
    dB,
    bowL: (rand() - 0.5) * 0.07,
    bowY: 0.012 + rand() * 0.02,
    P: new V3(),
    d: new V3(),
    a: 0,
    c: 0,
    EA: new V3(),
    EB: new V3(),
  };
}

const TREE: ArmN = arm(
  1.6,
  8,
  arm(
    1.0,
    -35,
    leaf("crescent", 0.5, RED, 20, 0.08, -10, { decal: "mono" }),
    arm(
      0.62,
      25,
      leaf("disc", 0.26, BLACK, -30, 0.1, 0, { deco: { kind: "ring", color: WHITE } }),
      arm(
        0.42,
        -60,
        ball(0.05, YELLOW),
        arm(
          0.3,
          40,
          leaf("leaf", 0.3, BLUE, 50, 0.1, 8, { deco: { kind: "split", color: WHITE } }),
          ball(0.035, RED),
          0.2,
          0.2,
        ),
        0.24,
        0.26,
      ),
      0.27,
      0.27,
    ),
    0.3,
    0.3,
  ),
  arm(
    0.95,
    60,
    arm(
      0.72,
      -25,
      leaf("flower", 0.24, YELLOW, -15, 0.06, 10, { decal: "flower" }),
      arm(
        0.46,
        75,
        leaf("triangle", 0.24, RED, 35, 0.08, -14, { deco: { kind: "dot", color: BLACK } }),
        leaf("star", 0.2, BLACK, -45, 0.05, 6, { deco: { kind: "dot", color: YELLOW } }),
        0.24,
        0.24,
      ),
      0.27,
      0.27,
    ),
    arm(
      0.66,
      -70,
      leaf("kidney", 0.36, BLUE, -25, 0.1, 12, { decal: "spiral" }),
      arm(
        0.4,
        20,
        leaf("paddle", 0.3, WHITE, 30, 0.05, -8, { decal: "dashes" }),
        leaf("disc", 0.17, WHITE, -55, 0.1, 0, { decal: "target" }),
        0.22,
        0.22,
      ),
      0.26,
      0.28,
    ),
    0.32,
    0.3,
  ),
  0.32,
  0.36,
);

/** Positions every node top-down from the hanging point `T`; returns the lowest y reached. */
function layout(n: N, T: THREE.Vector3): number {
  n.T = T.clone();
  if (n.t === "arm") {
    n.P = T.clone().add(new V3(0, -EYE, 0));
    // Torque balance: mA * a = mB * c.
    let a = (n.L * n.B.mass) / (n.A.mass + n.B.mass);
    a = Math.min(Math.max(a, 0.16 * n.L), 0.84 * n.L);
    n.a = a;
    n.c = n.L - a;
    n.d = new V3(Math.cos(n.yaw), 0, -Math.sin(n.yaw));
    n.EA = n.P.clone().addScaledVector(n.d, n.a).add(new V3(0, -0.004, 0));
    n.EB = n.P.clone().addScaledVector(n.d, -n.c).add(new V3(0, -0.004, 0));
    const ta = n.EA.clone().add(new V3(0, -n.dA, 0));
    const tb = n.EB.clone().add(new V3(0, -n.dB, 0));
    return Math.min(n.P.y - 0.01, layout(n.A, ta), layout(n.B, tb));
  }
  if (n.t === "ball") {
    n.center = T.clone().add(new V3(0, -(n.r + 0.004), 0));
    return n.center.y - n.r;
  }
  const q = new THREE.Quaternion()
    .setFromAxisAngle(UP, n.yaw)
    .multiply(new THREE.Quaternion().setFromAxisAngle(new V3(1, 0, 0), n.tilt))
    .multiply(new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), n.roll));
  n.xd = new V3(1, 0, 0).applyQuaternion(q);
  n.yd = new V3(0, 1, 0).applyQuaternion(q);
  n.at = T.clone().addScaledVector(n.yd, -0.017);
  let low = Infinity;
  for (const [px, py] of n.pts) low = Math.min(low, n.at.y + px * n.xd.y + py * n.yd.y);
  return low;
}

// ---------------------------------------------------------------------------------------------------------------
// Drawn marks

function spiralPath() {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const th = i * 0.18;
    const r = 3 + th * 1.9;
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(th)).toFixed(1)} ${(50 + r * Math.sin(th)).toFixed(1)}`;
  }
  return d;
}

function makeTextures() {
  const mono = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <text x="50" y="62" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="54" fill="${WHITE}">CA</text>
      <path d="M18 74 Q50 84 82 72" stroke="${WHITE}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M70 18 L78 8 L86 18Z" fill="${WHITE}"/>
    </svg>`,
    { size: 256 },
  );
  const spiral = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="${spiralPath()}" stroke="${WHITE}" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    { size: 256 },
  );
  const dashes = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="${BLACK}" stroke-width="7" stroke-linecap="round">
        <path d="M22 12 L78 12"/><path d="M14 28 L70 28"/><path d="M26 44 L84 44"/>
        <path d="M16 60 L72 60"/><path d="M24 76 L80 76"/><path d="M18 92 L66 92"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const target = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="${BLACK}"/>
      <circle cx="50" cy="50" r="35" fill="${WHITE}"/>
      <circle cx="50" cy="50" r="24" fill="${RED}"/>
      <circle cx="50" cy="50" r="11" fill="${BLACK}"/>
    </svg>`,
    { size: 256 },
  );
  let rays = "";
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    rays += `<path d="M${(50 + 24 * Math.cos(a)).toFixed(1)} ${(50 + 24 * Math.sin(a)).toFixed(1)} L${(50 + 40 * Math.cos(a)).toFixed(1)} ${(50 + 40 * Math.sin(a)).toFixed(1)}" />`;
  }
  const flower = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g stroke="${RED}" stroke-width="6" stroke-linecap="round">${rays}</g>
      <circle cx="50" cy="50" r="17" fill="${BLACK}"/>
      <circle cx="50" cy="50" r="7" fill="${YELLOW}"/>
    </svg>`,
    { size: 256 },
  );
  return { mono, spiral, dashes, target, flower };
}

// ---------------------------------------------------------------------------------------------------------------

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "calder_mobile" });
  const tex = makeTextures();

  const minY = layout(TREE, new V3(0, 0, 0));
  layout(TREE, new V3(0, LOW - minY, 0));
  const T0 = TREE.T;

  // ---- ceiling mount: canopy, hook, swivel, wire ----
  const ct = T0.y + 0.75;
  const mount = b.joint("mount", { at: [0, ct, 0] });
  b.lathe(
    [
      [0, 0],
      [0.025, 0],
      [0.03, 0.018],
      [0.09, 0.034],
      [0.09, 0.045],
      [0, 0.045],
    ],
    { at: [0, ct - 0.045, 0], bone: mount, color: coat(BLACK, 91, null), segments: 12, name: "canopy" },
  );
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), WRAP, { at: [0, ct - 0.046, 0], bone: mount });
  const y1 = ct - 0.045 - 0.028;
  b.part(new THREE.TorusGeometry(0.028, 0.0045, 4, 14), WIRE, { at: [0, y1, 0], bone: mount, name: "hookRing" });
  const y2 = y1 - 0.028 - 0.02;
  b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.04, 8), WRAP, { at: [0, y2, 0], bone: mount, name: "swivel" });
  b.part(new THREE.SphereGeometry(0.0125, 6, 4), WIRE, { at: [0, y2 + 0.02, 0], bone: mount });
  b.part(new THREE.SphereGeometry(0.0125, 6, 4), WIRE, { at: [0, y2 - 0.02, 0], bone: mount });
  const y3 = y2 - 0.02 - 0.022;
  b.part(new THREE.TorusGeometry(0.022, 0.0042, 4, 14), WIRE, {
    at: [0, y3, 0],
    rotation: [0, 90, 0],
    bone: mount,
    name: "swivelRing",
  });
  b.rod([0, y3 - 0.022, 0], T0, 0.0038, WIRE, { bone: mount, sides: 5, name: "suspension" });

  // ---- one node at a time ----
  function buildLeaf(n: LeafN, jt: Joint) {
    const thick = new V3().crossVectors(n.xd, n.yd).normalize();
    const fn = n.deco ? decoFn(n.deco, n.pts) : undefined;
    const sheet: Part = b.extrude(n.pts, {
      at: n.at,
      x: n.xd,
      y: n.yd,
      thickness: TH,
      bevel: 0.0015,
      smoothing: n.smoothing,
      color: coat(n.color, n.id * 7 + 1, thick, fn),
      bone: jt,
      name: `sheet${n.id}`,
    });
    // hanging eyelet
    b.part(new THREE.TorusGeometry(0.011, 0.0028, 4, 10), WIRE, {
      at: n.at.clone().addScaledVector(n.yd, 0.007),
      dir: thick,
      axis: "z",
      bone: jt,
      name: `eyelet${n.id}`,
    });

    const bb = bbox(n.pts);
    const place = (key: DecalKey) => {
      let t = tex.mono;
      let size = Math.min(bb.w, bb.h) * 0.55;
      let cx = bb.cx;
      let cy = bb.cy;
      let both = true;
      if (key === "mono") {
        t = tex.mono;
        size = 0.13;
        cx = 0;
        cy = -0.21 * n.s;
        both = false;
      } else if (key === "spiral") {
        t = tex.spiral;
        size = Math.min(bb.w, bb.h) * 0.62;
        cx = bb.cx - 0.02;
        both = true;
      } else if (key === "dashes") {
        t = tex.dashes;
        size = bb.w * 0.8;
        cy = bb.cy;
        both = true;
      } else if (key === "target") {
        t = tex.target;
        size = Math.min(bb.w, bb.h) * 0.78;
      } else {
        t = tex.flower;
        size = Math.min(bb.w, bb.h) * 0.6;
      }
      for (const side of both ? [1, -1] : [1]) {
        b.part(new THREE.PlaneGeometry(size, size), "#ffffff", {
          at: sheet.local([cx, cy, side * (TH / 2 + 0.0015)]),
          dir: side > 0 ? thick : thick.clone().negate(),
          axis: "z",
          up: n.yd,
          texture: t,
          bone: jt,
          name: `mark${n.id}`,
        });
      }
    };
    if (n.decal) place(n.decal);
  }

  function buildBall(n: BallN, jt: Joint) {
    b.part(new THREE.SphereGeometry(n.r, 10, 8), coat(n.color, n.id * 7 + 2, null), {
      at: n.center,
      bone: jt,
      flat: true,
      name: `ball${n.id}`,
    });
    b.part(new THREE.TorusGeometry(0.007, 0.002, 4, 8), WIRE, {
      at: n.center.clone().add(new V3(0, n.r + 0.002, 0)),
      dir: [Math.cos(n.id), 0, Math.sin(n.id)],
      axis: "z",
      bone: jt,
    });
  }

  function buildArm(n: ArmN, jt: Joint) {
    const { P, d, a, c } = n;
    const w = new V3(-d.z, 0, d.x);
    const curve = (s: number) => {
      const side = s >= 0 ? 1 : -1;
      const len = side > 0 ? a : c;
      const u = Math.min(Math.abs(s) / len, 1);
      const lat = side * n.bowL * Math.sin(Math.PI * u) * (side > 0 ? 1 : 0.8);
      const y = n.bowY * Math.sin(Math.PI * u) * (side > 0 ? 1 : -0.6) - 0.004 * u;
      return P.clone().addScaledVector(d, s).addScaledVector(w, lat).add(new V3(0, y, 0));
    };
    const hook = (sigma: number): THREE.Vector3[] => {
      const E = curve(sigma * (sigma > 0 ? a : c));
      const at = (along: number, up: number) => E.clone().addScaledVector(d, sigma * along).add(new V3(0, up, 0));
      return [at(0.014, 0), at(0.024, 0.012), at(0.018, 0.03), at(0.006, 0.032)];
    };
    const hookA = hook(1);
    const hookB = hook(-1);
    const pts: THREE.Vector3[] = [];
    for (let i = hookB.length - 1; i >= 0; i--) pts.push(hookB[i]);
    for (const u of [1, 0.75, 0.5, 0.25]) pts.push(curve(-c * u));
    pts.push(P.clone());
    for (const u of [0.25, 0.5, 0.75, 1]) pts.push(curve(a * u));
    for (const h of hookA) pts.push(h);
    b.sweep(catmull(pts), 0.006, { bone: jt, color: WIRE, sides: 5, name: `arm${n.id}` });

    // pivot eye and binding
    b.part(new THREE.TorusGeometry(0.011, 0.0028, 4, 10), WIRE, {
      at: P.clone().add(new V3(0, 0.013, 0)),
      dir: d,
      axis: "z",
      bone: jt,
      name: `pivotEye${n.id}`,
    });
    b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.024, 6), WRAP, { at: P, dir: d, bone: jt, name: `wrap${n.id}` });

    // hooks, stop beads and hanging wires
    for (const [E, h, child] of [
      [n.EA, hookA, n.A],
      [n.EB, hookB, n.B],
    ] as const) {
      b.part(new THREE.TorusGeometry(0.0085, 0.0022, 4, 8), WIRE, { at: E, dir: d, axis: "z", bone: jt });
      b.part(new THREE.SphereGeometry(0.0065, 6, 4), WRAP, { at: h[3], bone: jt });
      b.rod(E, child.T, 0.0035, WIRE, { bone: jt, sides: 5, name: `string${child.id}` });
    }
  }

  function buildNode(n: N, parent: Joint) {
    const jt = b.joint(`m${n.id}`, { parent, at: n.T, group: "mobile" });
    if (n.t === "arm") {
      buildArm(n, jt);
      buildNode(n.A, jt);
      buildNode(n.B, jt);
    } else if (n.t === "leaf") buildLeaf(n, jt);
    else buildBall(n, jt);
  }
  buildNode(TREE, mount);

  return b.root;
}

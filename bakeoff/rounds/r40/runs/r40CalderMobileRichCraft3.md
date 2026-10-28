```ts
import * as THREE from "three";
import { createBuilder, catmull, spiral, paint, mix, grain, svg } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description:
    "A large hanging kinetic mobile in the manner of Alexander Calder: a ceiling canopy, a balanced tree of black wire arms with S-curves, " +
    "hooked ends and wire-wrapped hangers, carrying painted sheet-metal shapes (leaf, crescent, star, amoeba, discs) in red, yellow, blue, black and white. " +
    "Arms are balanced by area, and every pivot is a named hinge joint so the whole mobile can turn.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const RED = "#d62a1c";
const YELLOW = "#f4b81a";
const BLUE = "#1d4ea6";
const BLACK = "#18181b";
const WHITE = "#f2eee3";
const WIRE = "#202024";
const CREAM = "#f3e4c0";
const CANOPY = "#e6e1d4";

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
type V3 = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const A = (v: V3): [number, number, number] => [v.x, v.y, v.z];

// ---------------------------------------------------------------------------------------------------------------
// Shape outlines (2D, metres, counter-clockwise)
type P2 = [number, number];
type Raw = Array<[number, number, boolean?]>;

function chaikin(raw: Raw, rounds: number): P2[] {
  let cur = raw.map((p) => ({ x: p[0], y: p[1], sharp: !!p[2] }));
  for (let r = 0; r < rounds; r++) {
    const n = cur.length;
    const next: typeof cur = [];
    cur.forEach((c, i) => {
      const p = cur[(i + n - 1) % n];
      const q = cur[(i + 1) % n];
      if (c.sharp) next.push(c);
      else {
        next.push({ x: c.x + (p.x - c.x) * 0.25, y: c.y + (p.y - c.y) * 0.25, sharp: false });
        next.push({ x: c.x + (q.x - c.x) * 0.25, y: c.y + (q.y - c.y) * 0.25, sharp: false });
      }
    });
    cur = next;
  }
  return cur.map((c) => [c.x, c.y] as P2);
}

const circle = (r: number, n: number, sx: number): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * TAU;
    return [Math.cos(a) * r * sx, Math.sin(a) * r] as P2;
  });

function outline(kind: string, size: number): P2[] {
  const sc = (pts: P2[]): P2[] => pts.map(([x, y]) => [x * size, y * size] as P2);
  switch (kind) {
    case "disc":
      return circle(size, 18, 1);
    case "oval":
      return circle(size, 20, 0.55);
    case "leaf":
      return sc(
        chaikin(
          [
            [0, -1, true],
            [0.5, -0.35],
            [0.55, 0.25],
            [0.2, 0.8],
            [0, 1, true],
            [-0.3, 0.55],
            [-0.6, -0.1],
            [-0.38, -0.62],
          ],
          2,
        ),
      );
    case "crescent": {
      const pts: P2[] = [];
      for (let i = 0; i <= 14; i++) {
        const a = (60 + (240 * i) / 14) * DEG;
        pts.push([Math.cos(a), Math.sin(a)]);
      }
      for (let i = 1; i <= 11; i++) {
        const a = (289.1 - (218.2 * i) / 12) * DEG;
        pts.push([0.2 + 0.917 * Math.cos(a), 0.917 * Math.sin(a)]);
      }
      return sc(pts);
    }
    case "amoeba": {
      const n = 26;
      return Array.from({ length: n }, (_, i) => {
        const a = (i / n) * TAU;
        const r = 1 + 0.2 * Math.sin(2 * a + 0.6) + 0.16 * Math.sin(3 * a + 2) + 0.08 * Math.sin(5 * a);
        return [Math.cos(a) * r * size * 1.1, Math.sin(a) * r * size * 0.88] as P2;
      });
    }
    case "star": {
      const pts: P2[] = [];
      for (let i = 0; i < 10; i++) {
        const a = (90 + i * 36) * DEG;
        const r = i % 2 === 0 ? 1 : 0.42;
        pts.push([Math.cos(a) * r * size, Math.sin(a) * r * size]);
      }
      return pts;
    }
  }
  throw new Error(`unknown shape ${kind}`);
}

// ---------------------------------------------------------------------------------------------------------------
// Specs
type Deco = "spiral" | "rings" | "dots" | "sig" | "veins";
interface ShapeSpec {
  t: "shape";
  kind: string;
  size: number;
  color: string;
  yaw: number;
  rot?: number;
  tilt?: number;
  deco?: Deco;
  dangle?: [number, number];
}
interface ArmSpec {
  t: "arm";
  len: number;
  yaw: number;
  a: [number, Spec];
  b: [number, Spec];
  amp?: number;
}
type Spec = ShapeSpec | ArmSpec;

const S = (kind: string, size: number, color: string, yaw: number, o: Partial<ShapeSpec> = {}): ShapeSpec => ({
  t: "shape",
  kind,
  size,
  color,
  yaw,
  ...o,
});
const Arm = (len: number, yaw: number, a: [number, Spec], b: [number, Spec], amp?: number): ArmSpec => ({
  t: "arm",
  len,
  yaw,
  a,
  b,
  amp,
});

// The tree: each arm is [drop, child] on both ends.
const redLeaf = S("leaf", 0.21, RED, 35, { tilt: 6, deco: "veins", dangle: [0.16, 0.022] });
const blackDisc = S("disc", 0.065, BLACK, -20);
const ringDisc = S("disc", 0.075, WHITE, 50, { deco: "rings" });
const armK = Arm(0.34, 40, [0.24, blackDisc], [0.34, ringDisc]);
const crescent = S("crescent", 0.12, YELLOW, -35, { rot: 20, tilt: -5 });
const armD = Arm(0.4, 120, [0.3, armK], [0.42, crescent]);
const armB = Arm(0.72, 55, [0.34, redLeaf], [0.2, armD]);

const spiralDisc = S("disc", 0.12, BLACK, 25, { deco: "spiral" });
const star = S("star", 0.1, YELLOW, -30, { rot: 8 });
const redDisc = S("disc", 0.085, RED, 60, { dangle: [0.14, 0.018] });
const armF = Arm(0.32, 140, [0.2, star], [0.3, redDisc]);
const armE = Arm(0.52, 60, [0.3, spiralDisc], [0.4, armF]);
const amoeba = S("amoeba", 0.16, BLUE, -15, { rot: 30, deco: "sig" });
const dotOval = S("oval", 0.14, WHITE, 40, { deco: "dots" });
const armG = Arm(0.5, 35, [0.32, amoeba], [0.42, dotOval]);
const armC = Arm(0.85, 110, [0.4, armE], [0.25, armG]);
const armA = Arm(1.15, 82, [0.28, armB], [0.5, armC]);

// ---------------------------------------------------------------------------------------------------------------
// Prepared shapes: hook point on the outline at the centroid's x, shifted to the origin
interface Prepared {
  pts: P2[];
  area: number;
  ox: number;
  oy: number;
  low: P2;
}
const prepCache = new Map<ShapeSpec, Prepared>();
function prepare(spec: ShapeSpec): Prepared {
  const hit = prepCache.get(spec);
  if (hit) return hit;
  let pts = outline(spec.kind, spec.size);
  if (spec.rot) {
    const c = Math.cos(spec.rot * DEG);
    const s = Math.sin(spec.rot * DEG);
    pts = pts.map(([x, y]) => [x * c - y * s, x * s + y * c] as P2);
  }
  const n = pts.length;
  let a2 = 0;
  let cxs = 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    const cr = x1 * y2 - x2 * y1;
    a2 += cr;
    cxs += (x1 + x2) * cr;
  }
  if (a2 < 0) {
    pts = pts.reverse();
    a2 = -a2;
    cxs = -cxs;
  }
  const cx = cxs / (3 * a2);
  let hy = -Infinity;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % n];
    if ((x1 - cx) * (x2 - cx) <= 0 && x1 !== x2) {
      const y = y1 + ((cx - x1) / (x2 - x1)) * (y2 - y1);
      if (y > hy) hy = y;
    }
  }
  if (!isFinite(hy)) hy = Math.max(...pts.map((p) => p[1]));
  const shifted = pts.map(([x, y]) => [x - cx, y - hy] as P2);
  let low = shifted[0];
  for (const p of shifted) if (p[1] < low[1]) low = p;
  const out = { pts: shifted, area: a2 / 2, ox: -cx, oy: -hy, low };
  prepCache.set(spec, out);
  return out;
}

const weight = (s: Spec): number => (s.t === "shape" ? prepare(s).area : weight(s.a[1]) + weight(s.b[1]) + 0.006);

// ---------------------------------------------------------------------------------------------------------------
// Layout
type LNode = LShape | LArm;
interface LShape {
  t: "shape";
  spec: ShapeSpec;
  H: V3;
  xAx: V3;
  yAx: V3;
  nAx: V3;
}
interface LArm {
  t: "arm";
  spec: ArmSpec;
  pivot: V3;
  dir: V3;
  perp: V3;
  lenA: number;
  lenB: number;
  f: number;
  endA: V3;
  endB: V3;
  a: LNode;
  b: LNode;
}

// ---------------------------------------------------------------------------------------------------------------
// Textures
function spiralTex() {
  let d = "M50 50";
  for (let i = 1; i <= 140; i++) {
    const a = (i / 140) * 3.4 * TAU;
    const r = 2 + (i / 140) * 44;
    d += ` L${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`;
  }
  return svg(
    `<svg viewBox="0 0 100 100"><path d="${d}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 384 },
  );
}
function ringsTex() {
  return svg(
    `<svg viewBox="0 0 100 100"><g fill="none" stroke="#111111" stroke-width="4.5">
      <circle cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="31"/><circle cx="50" cy="50" r="20"/></g>
      <circle cx="50" cy="50" r="7" fill="#111111"/></svg>`,
    { size: 256 },
  );
}
function dotsTex() {
  let dots = "";
  for (let r = 0; r < 6; r++) {
    const y = 12 + r * 15.2;
    for (let c = 0; c < 4; c++) {
      const x = 10 + c * 12 + (r % 2 ? 6 : 0);
      const e = ((x - 27.5) / 23) ** 2 + ((y - 50) / 44) ** 2;
      if (e < 0.95) dots += `<circle cx="${x}" cy="${y.toFixed(1)}" r="4.2" fill="#111111"/>`;
    }
  }
  return svg(`<svg viewBox="0 0 55 100">${dots}</svg>`, { size: 320 });
}
function sigTex() {
  return svg(
    `<svg viewBox="0 0 100 60"><g fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M44 12 A22 22 0 1 0 44 48"/><path d="M60 50 L77 10 L94 50 Z"/><path d="M67 36 L87 36"/></g></svg>`,
    { size: 256 },
  );
}
function veinsTex() {
  const X = (x: number) => ((x + 0.7) * 50).toFixed(1);
  const Y = (y: number) => ((1 - y) * 50).toFixed(1);
  let d = `M${X(0)} ${Y(-0.92)} L${X(0)} ${Y(0.85)}`;
  for (const y0 of [-0.7, -0.45, -0.2, 0.05, 0.3, 0.55]) {
    const reach = 0.33 * (1 - (y0 / 1.05) ** 2);
    for (const s of [-1, 1]) d += ` M${X(0)} ${Y(y0)} L${X(s * reach)} ${Y(y0 + 0.28)}`;
  }
  return svg(
    `<svg viewBox="0 0 70 100"><path d="${d}" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    { size: 320 },
  );
}

function lacquer(base: string, seed: number, thick: V3) {
  const lo = mix(base, "#000000", 0.1);
  const hi = mix(base, "#ffffff", 0.09);
  const edge = mix(base, "#000000", 0.35);
  const brush = grain(lo, hi, { size: 0.01, axis: [1, 0.25, 0], seed });
  return paint((_p, n) => (Math.abs(n.dot(thick)) < 0.6 ? edge : brush));
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "calder_mobile" });

  // ---- layout pass (positions relative to the canopy hook at y = 0)
  let minY = 0;
  const track = (p: V3) => {
    if (p.y < minY) minY = p.y;
  };
  function layout(spec: Spec, H: V3): LNode {
    if (spec.t === "shape") {
      const pr = prepare(spec);
      const yaw = spec.yaw * DEG;
      const tilt = (spec.tilt ?? 0) * DEG;
      const xAx = V(Math.cos(yaw), 0, -Math.sin(yaw));
      const nh = V(Math.sin(yaw), 0, Math.cos(yaw));
      const yAx = UP.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(nh, Math.sin(tilt));
      const nAx = xAx.clone().cross(yAx).normalize();
      for (const [u, v] of pr.pts) track(H.clone().addScaledVector(xAx, u).addScaledVector(yAx, v));
      if (spec.dangle) {
        const low = H.clone().addScaledVector(xAx, pr.low[0]).addScaledVector(yAx, pr.low[1]);
        track(low.clone().addScaledVector(UP, -(spec.dangle[0] + spec.dangle[1] * 2)));
      }
      return { t: "shape", spec, H, xAx, yAx, nAx };
    }
    const pivot = H.clone().addScaledVector(UP, -0.03);
    const yaw = spec.yaw * DEG;
    const dir = V(Math.sin(yaw), 0, Math.cos(yaw));
    const perp = V(Math.cos(yaw), 0, -Math.sin(yaw));
    const wa = weight(spec.a[1]);
    const wb = weight(spec.b[1]);
    const f = Math.min(0.75, Math.max(0.25, wb / (wa + wb)));
    const lenA = spec.len * f;
    const lenB = spec.len * (1 - f);
    const endA = pivot.clone().addScaledVector(dir, -lenA);
    const endB = pivot.clone().addScaledVector(dir, lenB);
    const ca = layout(spec.a[1], endA.clone().addScaledVector(UP, -spec.a[0]));
    const cb = layout(spec.b[1], endB.clone().addScaledVector(UP, -spec.b[0]));
    return { t: "arm", spec, pivot, dir, perp, lenA, lenB, f, endA, endB, a: ca, b: cb };
  }
  const tree = layout(armA, V(0, -0.34, 0));
  const SH = V(0, -minY, 0);
  const P = (v: V3) => v.clone().add(SH);
  const T = SH.y; // canopy hook height

  // ---- textures
  const TEX = {
    spiral: spiralTex(),
    rings: ringsTex(),
    dots: dotsTex(),
    sig: sigTex(),
    veins: veinsTex(),
  };

  // ---- small helpers
  const eyelet = (at: V3, axis: V3, up: V3, bone: Joint, r = 0.011) =>
    b.part(new THREE.TorusGeometry(r, 0.0028, 5, 10), WIRE, { at, bone, dir: A(axis), axis: "z", up: A(up) });
  const hangWire = (from: V3, to: V3, bone: Joint) => b.rod(from, to, 0.0028, WIRE, { bone, sides: 6 });
  const wrap = (top: V3, bottom: V3, bone: Joint, turns = 2.5, r = 0.0055) => {
    const axis = bottom.clone().sub(top);
    b.sweep(spiral(top, top.clone().add(V(r, 0, 0)), axis, { turns, pitch: axis.length() / turns }), 0.0021, {
      color: WIRE,
      bone,
      sides: 4,
      detail: 0.6,
    });
  };

  // ---- skeleton root + canopy
  const mount = b.joint("mount", { at: [0, T, 0], dir: [0, 1, 0], group: "mount" });
  b.lathe(
    [
      [0, 0],
      [0.085, 0],
      [0.085, 0.012],
      [0.035, 0.03],
      [0, 0.03],
    ],
    { at: [0, T, 0], color: CANOPY, bone: mount, segments: 16 },
  );
  b.lathe(
    [
      [0, 0.03],
      [0.12, 0.03],
      [0.12, 0.036],
      [0, 0.036],
    ],
    { at: [0, T, 0], color: CANOPY, bone: mount, segments: 16 },
  );
  eyelet(V(0, T - 0.01, 0), V(1, 0, 0), UP, mount, 0.012);

  let armN = 0;
  let plateN = 0;

  function buildNode(l: LNode, parentJ: Joint, from: V3) {
    if (l.t === "shape") {
      const spec = l.spec;
      const pr = prepare(spec);
      const idx = ++plateN;
      const H = P(l.H);
      const j = b.joint(`plate${idx}`, { parent: parentJ, at: H, role: "hinge", group: "plates" });
      const thick = 0.007;
      b.extrude(pr.pts, {
        at: H,
        x: A(l.xAx),
        y: A(l.yAx),
        thickness: thick,
        color: lacquer(spec.color, idx * 7 + 3, l.nAx),
        bone: j,
      });
      // hanger: ring through the plate, wire and wraps
      eyelet(H.clone().addScaledVector(l.yAx, 0.006), l.nAx, l.yAx, j);
      const attach = H.clone().addScaledVector(UP, 0.018);
      hangWire(from, attach, j);
      wrap(from.clone(), from.clone().addScaledVector(UP, -0.035), j);
      wrap(attach.clone().addScaledVector(UP, 0.05), attach.clone().addScaledVector(UP, 0.006), j);

      // painted drawings on both faces
      if (spec.deco) {
        const s = spec.size;
        const def = {
          spiral: { tex: TEX.spiral, w: 1.9 * s, h: 1.9 * s, tint: WHITE, both: true },
          rings: { tex: TEX.rings, w: 1.94 * s, h: 1.94 * s, tint: "#ffffff", both: true },
          dots: { tex: TEX.dots, w: 1.1 * s, h: 2 * s, tint: "#ffffff", both: true },
          sig: { tex: TEX.sig, w: 0.75 * s, h: 0.45 * s, tint: "#ffffff", both: false },
          veins: { tex: TEX.veins, w: 1.4 * s, h: 2 * s, tint: CREAM, both: true },
        }[spec.deco];
        const c = H.clone().addScaledVector(l.xAx, pr.ox).addScaledVector(l.yAx, pr.oy);
        const faces = def.both ? [1, -1] : [1];
        for (const side of faces) {
          const nrm = l.nAx.clone().multiplyScalar(side);
          b.part(new THREE.PlaneGeometry(def.w, def.h), def.tint, {
            at: c.clone().addScaledVector(nrm, thick / 2 + 0.0015),
            dir: A(nrm),
            axis: "z",
            up: A(l.yAx),
            texture: def.tex,
            bone: j,
          });
        }
      }

      // small dangling bob
      if (spec.dangle) {
        const low = H.clone().addScaledVector(l.xAx, pr.low[0]).addScaledVector(l.yAx, pr.low[1]);
        const [len, r] = spec.dangle;
        const ball = low.clone().addScaledVector(UP, -(len + r));
        b.rod(low, ball, 0.0024, WIRE, { bone: j, sides: 5 });
        wrap(low.clone().addScaledVector(UP, -0.005), low.clone().addScaledVector(UP, -0.035), j, 2, 0.005);
        b.part(new THREE.SphereGeometry(r, 8, 6), BLACK, { at: ball, bone: j });
      }
      return;
    }

    // ---- arm
    const idx = ++armN;
    const pivot = P(l.pivot);
    const j = b.joint(`arm${idx}`, { parent: parentJ, at: pivot, role: "hinge", group: "arms" });
    const len = l.spec.len;
    const amp = (l.spec.amp ?? 0.05) * len * (idx % 2 ? 1 : -1);
    const f = l.f;
    const us = [0, 0.25 * f, 0.5 * f, 0.75 * f, f, f + 0.25 * (1 - f), f + 0.5 * (1 - f), f + 0.75 * (1 - f), 1];
    const aPt = P(l.endA);
    const pts = us.map((u) => {
      const off = u <= f ? amp * Math.sin((Math.PI * u) / f) : -amp * Math.sin((Math.PI * (u - f)) / (1 - f));
      return aPt.clone().addScaledVector(l.dir, u * len).addScaledVector(l.perp, off);
    });
    b.sweep(catmull(pts), 0.0046, { color: WIRE, bone: j, sides: 6 });
    // incoming wire, pivot collar
    const attach = pivot.clone().addScaledVector(UP, 0.012);
    hangWire(from, attach, j);
    wrap(from.clone(), from.clone().addScaledVector(UP, -0.035), j);
    wrap(attach.clone().addScaledVector(UP, 0.05), attach.clone().addScaledVector(UP, 0.008), j);
    eyelet(pivot.clone().addScaledVector(UP, 0.01), l.perp, UP, j, 0.01);
    b.part(new THREE.SphereGeometry(0.008, 6, 4), WIRE, { at: pivot, bone: j });
    // hooked ends carrying the children
    const ends: Array<[V3, V3, LNode]> = [
      [l.endA, l.dir.clone().negate(), l.a],
      [l.endB, l.dir.clone(), l.b],
    ];
    for (const [end, out, child] of ends) {
      const e = P(end);
      eyelet(e.clone().addScaledVector(out, 0.009).addScaledVector(UP, -0.003), l.perp, UP, j, 0.012);
      b.part(new THREE.SphereGeometry(0.006, 6, 4), WIRE, { at: e, bone: j });
      const hook = e.clone().addScaledVector(out, 0.009).addScaledVector(UP, -0.014);
      buildNode(child, j, hook);
    }
  }

  buildNode(tree, mount, V(0, T - 0.02, 0));
  return b.root;
}
```
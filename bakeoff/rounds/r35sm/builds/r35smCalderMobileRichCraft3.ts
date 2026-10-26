import * as THREE from "three";
import { createBuilder, mottle, mix, svg } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "A balanced, multi-tier hanging mobile in the manner of Alexander Calder: thin black wire arms with gouache-painted flat shapes in red, yellow, blue, white and black.",
};

// ---------------------------------------------------------------- palette
const WIRE = "#17171b";
const RED = "#d8281e";
const YELLOW = "#f2bf1b";
const BLUE = "#1f4fa8";
const WHITE = "#f3efe4";
const BLACK = "#1b1b20";

// Flat gouache look: faint brush mottling in a slightly darker tone of the colour.
const gouache = (c: string, seed: number) =>
  mottle(c, mix(c, "#000000", 0.17), { size: 0.045, contrast: 0.7, seed });

// ---------------------------------------------------------------- textures
const RINGS = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="#f3efe4"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="#17171b" stroke-width="4"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#1f4fa8" stroke-width="5"/>
    <circle cx="50" cy="50" r="19" fill="none" stroke="#17171b" stroke-width="4"/>
    <circle cx="50" cy="50" r="8" fill="#d8281e"/>
  </svg>`,
  { size: 256 },
);
const DOTS = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="#f2bf1b"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#d8281e" stroke-width="3"/>
    <g fill="#17171b">
      <circle cx="50" cy="22" r="6"/><circle cx="26" cy="40" r="5"/><circle cx="74" cy="40" r="5"/>
      <circle cx="35" cy="68" r="6"/><circle cx="65" cy="68" r="6"/><circle cx="50" cy="48" r="4"/>
    </g>
  </svg>`,
  { size: 256 },
);
const STARS = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill="#1b1b20"/>
    <path d="M50 14 L58 40 L86 40 L63 56 L72 84 L50 67 L28 84 L37 56 L14 40 L42 40Z" fill="#f3efe4"/>
    <circle cx="50" cy="50" r="7" fill="#d8281e"/>
  </svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------- tree description
type Pt = [number, number] | [number, number, "sharp"];
type Kind = "disc" | "oval" | "leaf" | "crescent" | "kidney" | "amoeba" | "triangle";
type ShapeNode = {
  t: "shape";
  kind: Kind;
  s: number;
  color: string;
  yaw: number;
  seed: number;
  tex?: THREE.Texture;
};
type ArmNode = { t: "arm"; yaw: number; tilt: number; hangs: [number, number, Node][] };
type Node = ShapeNode | ArmNode;

const S = (kind: Kind, s: number, color: string, yaw = 0, seed = 1, tex?: THREE.Texture): ShapeNode => ({
  t: "shape",
  kind,
  s,
  color,
  yaw,
  seed,
  tex,
});
const A = (yaw: number, tilt: number, hangs: [number, number, Node][]): ArmNode => ({ t: "arm", yaw, tilt, hangs });

// ---------------------------------------------------------------- outlines
function polar(n: number, rx: number, ry: number, f: (a: number) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = f(a);
    out.push([Math.cos(a) * rx * r, Math.sin(a) * ry * r]);
  }
  return out;
}

function crescent(R: number): Pt[] {
  const A0 = (130 * Math.PI) / 180;
  const c = -0.5 * R;
  const tx = R * Math.cos(A0);
  const ty = R * Math.sin(A0);
  const r = Math.hypot(tx - c, ty);
  const ta = Math.atan2(ty, tx - c);
  const pts: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = -A0 + (2 * A0 * i) / n;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  for (let i = 1; i < n; i++) {
    const a = ta - (2 * ta * i) / n;
    pts.push([c + r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

function outline(kind: Kind, s: number): { pts: Pt[]; smoothing: number } {
  switch (kind) {
    case "disc":
      return { pts: polar(18, s, s, () => 1), smoothing: 0 };
    case "oval":
      return { pts: polar(18, s * 0.62, s * 1.15, () => 1), smoothing: 0 };
    case "leaf":
      return {
        pts: [
          [0, -1.3 * s, "sharp"],
          [0.55 * s, -0.35 * s],
          [0.6 * s, 0.45 * s],
          [0, 1.3 * s, "sharp"],
          [-0.5 * s, 0.5 * s],
          [-0.35 * s, -0.4 * s],
        ],
        smoothing: 2,
      };
    case "crescent":
      return { pts: crescent(s), smoothing: 0 };
    case "kidney":
      return {
        pts: polar(22, s * 1.2, s * 0.85, (a) => 1 - 0.4 * Math.pow(Math.max(0, Math.sin(a)), 8)),
        smoothing: 0,
      };
    case "amoeba":
      return {
        pts: polar(24, s, s, (a) => 1 + 0.25 * Math.sin(3 * a + 1) + 0.12 * Math.sin(5 * a)),
        smoothing: 0,
      };
    case "triangle":
      return {
        pts: [
          [-s, -0.8 * s],
          [s, -0.8 * s],
          [0.15 * s, 1.0 * s],
        ],
        smoothing: 1,
      };
  }
}

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "calder_mobile" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const bead = (p: THREE.Vector3, r = 0.005) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), WIRE, { at: p, flat: true });

  function buildShape(n: ShapeNode, top: THREE.Vector3) {
    const { pts, smoothing } = outline(n.kind, n.s);
    const maxY = Math.max(...pts.map((p) => p[1]));
    const center = top.clone().sub(V(0, maxY, 0));
    const c = Math.cos(n.yaw);
    const s = Math.sin(n.yaw);
    const T = 0.007;
    b.extrude(pts, {
      at: center,
      x: [c, 0, -s],
      thickness: T,
      bevel: 0.0018,
      smoothing,
      color: gouache(n.color, n.seed),
    });
    bead(top, 0.0055);
    if (n.tex) {
      const nrm = V(s, 0, c);
      for (const sign of [1, -1]) {
        b.part(new THREE.CircleGeometry(n.s * 0.985, 24), "#ffffff", {
          at: center.clone().addScaledVector(nrm, sign * (T / 2 + 0.0008)),
          dir: nrm.clone().multiplyScalar(sign),
          axis: "z",
          texture: n.tex,
        });
      }
    }
  }

  function buildArm(n: ArmNode, top: THREE.Vector3) {
    const c = Math.cos(n.yaw);
    const s = Math.sin(n.yaw);
    const ds = n.hangs.map((h) => h[0]);
    const lo = Math.min(0, ...ds) - 0.05;
    const hi = Math.max(0, ...ds) + 0.05;
    const span = hi - lo;
    // a point on the wire arm at signed distance d from the pivot, with a gentle S-bow
    const armPoint = (d: number) => {
      const u = (d - lo) / span;
      const bow = 0.014 * Math.sin(u * Math.PI * 2);
      return V(top.x + c * d + s * bow, top.y - n.tilt * d + 0.012 * Math.sin(u * Math.PI), top.z - s * d + c * bow);
    };
    const pathPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) pathPts.push(armPoint(lo + (span * i) / 8));
    b.sweep(pathPts.map((p) => [p.x, p.y, p.z]), 0.0036, { color: WIRE, sides: 5, caps: "round" });
    bead(pathPts[0], 0.0065);
    bead(pathPts[8], 0.0065);
    // pivot loop
    b.part(new THREE.TorusGeometry(0.011, 0.0028, 4, 8), WIRE, { at: armPoint(0), rotation: [0, (n.yaw * 180) / Math.PI, 0] });
    for (const [d, drop, child] of n.hangs) {
      const p = armPoint(d);
      const q = p.clone().sub(V(0, drop, 0));
      b.rod(p, q, 0.0024, WIRE, { sides: 4 });
      bead(p, 0.0055);
      if (child.t === "shape") buildShape(child, q);
      else buildArm(child, q);
    }
  }

  // the mobile itself
  const armE = A(1.25, -0.05, [
    [-0.2, 0.2, S("disc", 0.075, YELLOW, 0.3, 4, DOTS)],
    [0.21, 0.32, S("triangle", 0.085, RED, 0.9, 5)],
  ]);
  const armB = A(-0.5, -0.07, [
    [-0.3, 0.22, S("disc", 0.105, RED, 0.2, 2)],
    [0.0, 0.0, S("disc", 0.0001, WIRE, 0, 9)],
    [0.24, 0.36, armE],
  ].filter((h) => (h[2] as Node).t === "arm" || (h[2] as ShapeNode).s > 0.01) as [number, number, Node][]);
  const armD = A(-0.2, 0.08, [
    [-0.24, 0.3, S("crescent", 0.12, YELLOW, 0.5, 6)],
    [0.26, 0.2, S("disc", 0.055, BLACK, 0, 7, STARS)],
  ]);
  const armC = A(0.9, 0.05, [
    [-0.38, 0.28, armD],
    [0.42, 0.6, S("amoeba", 0.125, BLUE, 0.6, 8)],
    [0.08, 0.34, S("kidney", 0.07, WHITE, -0.7, 10)],
  ]);
  const armA = A(0.25, 0.05, [
    [-0.64, 0.34, armB],
    [0.82, 0.3, armC],
    [0.22, 0.95, S("disc", 0.125, WHITE, 0, 3, RINGS)],
    [-0.15, 0.55, S("leaf", 0.1, BLACK, 0.4, 11)],
  ]);

  const top = V(0, 2.0, 0);
  buildArm(armA, top);

  // ceiling hook and suspension wire
  const hookY = top.y + 0.26;
  b.rod(V(0, hookY - 0.03, 0), top, 0.0026, WIRE, { sides: 4 });
  b.part(new THREE.TorusGeometry(0.035, 0.0055, 6, 14), WIRE, { at: V(0, hookY, 0), rotation: [0, 25, 0] });
  b.part(new THREE.TorusGeometry(0.014, 0.004, 5, 10), WIRE, { at: V(0, hookY - 0.04, 0), rotation: [0, 115, 0] });
  b.part(new THREE.CylinderGeometry(0.01, 0.014, 0.02, 8), WIRE, { at: V(0, hookY + 0.04, 0) });

  // rest on y = 0 (the lowest shape touches the floor line)
  const box = new THREE.Box3().setFromObject(b.root, true);
  b.root.position.y -= box.min.y;
  return b.root;
}

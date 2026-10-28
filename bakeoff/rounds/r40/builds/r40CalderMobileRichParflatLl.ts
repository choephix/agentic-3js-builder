import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Hanging Mobile",
  "description": "A Calder-style hanging mobile: a ceiling hook and wire hang a three-tier balanced arrangement of black, red, yellow, blue and white sheet-metal leaves on thin wire arms."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wire: "#141414",
  black: "#1a1a1d",
  red: "#d9261c",
  yellow: "#f2c10f",
  blue: "#1f4fb8",
  white: "#f3efe6",
  orange: "#e8731a",
  ceiling: "#6b6b6b",
};
const M = {
  hook: [0, 1.9, 0] as [number, number, number],
  tier1Pivot: [0, 1.55, 0] as [number, number, number],
  tier1Left: [0.9, 1.55, 0] as [number, number, number],
  tier1Right: [-0.9, 1.55, 0] as [number, number, number],
  tier2Pivot: [-0.7, 1.05, 0] as [number, number, number],
  tier3Pivot: [0.55, 0.95, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // topTier
  (() => {
function buildTopTier({ b, J, P, M }: any) {
  const WIRE = P.wire, RED = P.red, WHITE = P.white, BLACK = P.black, ORANGE = P.orange, CEIL = P.ceiling;

  const wire = (a: number[], c: number[], r = 0.006, col = WIRE) =>
    b.rod(a, c, r, col, { sides: 6 });

  const eyelet = (p: number[], dir: number[], r = 0.018) =>
    b.part(new THREE.TorusGeometry(r, 0.004, 5, 12), WIRE, { at: p, dir, axis: "z" });

  // ceiling cap plate, hook ring
  b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.015, 16), CEIL, { at: [0, 1.8925, 0] });
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.02, 10), BLACK, { at: [0, 1.875, 0] });
  b.part(new THREE.TorusGeometry(0.03, 0.007, 6, 14), BLACK, { at: [0, 1.845, 0], dir: [1, 0, 0], axis: "z" });
  eyelet([0, 1.805, 0], [0, 0, 1], 0.016);

  // suspension wire
  wire([0, 1.8, 0], [0, 1.57, 0], 0.006);
  eyelet([0, 1.56, 0], [1, 0, 0], 0.014);

  // tier 1 arm with slight tilt
  const L = [0.9, 1.56, 0], R = [-0.9, 1.54, 0];
  wire([0, 1.55, 0], L, 0.006);
  wire([0, 1.55, 0], R, 0.006);
  b.part(new THREE.SphereGeometry(0.014, 8, 6), WIRE, { at: [0, 1.55, 0] });

  // left end (+X): eyelet, drop wire, red disc
  eyelet(L, [0, 0, 1], 0.016);
  wire([0.9, 1.545, 0], [0.9, 1.5, 0], 0.005);
  b.part(new THREE.SphereGeometry(0.01, 6, 4), WIRE, { at: [0.9, 1.5, 0] });
  // wire continuing down to tier 3 (toward x=0.55, y=0.95) - offset wire
  wire([0.9, 1.54, 0], [0.9, 1.5, 0], 0.005);
  wire([0.3, 1.552, 0], [0.3, 1.52, 0], 0.005);
  // stem to tier 3 hangs from a point on the arm
  const t3 = [0.55, 1.554, 0];
  eyelet(t3, [0, 0, 1], 0.012);
  wire(t3, [0.55, 1.35, 0], 0.005);
  wire([0.55, 1.35, 0], [0.55, 1.0, 0], 0.005);

  // red disc leaf (yaw'd), hangs on short wire
  const yaw = 0.5;
  const dc = [0.9, 1.4, 0];
  wire([0.9, 1.5, 0], [0.9, 1.455, 0], 0.005);
  const disc = new THREE.CylinderGeometry(0.17, 0.17, 0.012, 28);
  b.part(disc, RED, { at: dc, rotation: [90, 0, 0] , quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, yaw, "ZYX")) });
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0));
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const ux = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  const place = (g: THREE.BufferGeometry, col: string, ox: number, oy: number, off: number) => {
    const p = new THREE.Vector3(...dc).addScaledVector(ux, ox).addScaledVector(n, off);
    p.y += oy;
    b.part(g, col, { at: [p.x, p.y, p.z], quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, yaw, 0, "YXZ")) });
  };
  // disc geometry orientation: rotate cylinder so its axis faces n
  const faceQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  const face = (g: THREE.BufferGeometry, col: string, ox: number, oy: number, off: number) => {
    const p = new THREE.Vector3(...dc).addScaledVector(ux, ox).addScaledVector(n, off);
    p.y += oy;
    b.part(g, col, { at: [p.x, p.y, p.z], quat: faceQ });
  };
  // black rim sliver (back) and white dot (front)
  face(new THREE.CylinderGeometry(0.175, 0.175, 0.006, 28), BLACK, 0, 0, -0.004);
  face(new THREE.CylinderGeometry(0.17, 0.17, 0.014, 28), RED, 0, 0, 0.0);
  face(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 16), WHITE, 0.07, 0.06, 0.008);
  for (const [ox, oy] of [[-0.09, -0.07], [-0.12, 0.02], [-0.05, 0.1]])
    face(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6), BLACK, ox, oy, 0.008);
  eyelet([0.9, 1.455, 0], [Math.cos(yaw + 1.57), 0, -Math.sin(yaw + 1.57)].map((v) => v) as number[], 0.01);

  // right end (-X): eyelet, orange counterweight, drop wire to tier 2
  eyelet(R, [0, 0, 1], 0.016);
  wire([-0.9, 1.53, 0], [-0.9, 1.1, 0], 0.005);
  wire([-0.9, 1.54, 0], [-1.0, 1.54, 0], 0.005);
  b.part(new THREE.SphereGeometry(0.045, 12, 8), ORANGE, { at: [-1.04, 1.54, 0] });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 6), BLACK, { at: [-0.99, 1.54, 0], dir: [1, 0, 0] });
  b.part(new THREE.SphereGeometry(0.01, 6, 4), WIRE, { at: [-0.9, 1.1, 0] });
}
    return buildTopTier;
  })(),
  // leftTier
  (() => {
function buildLeftTier({ b, J, P, M }: any) {
  const WIRE = P.wire, BLACK = P.black, RED = P.red, YEL = P.yellow;
  const r = rng(11);
  void r; void frame; void J;

  const rod = (a: number[], c: number[], rad = 0.006, col = WIRE) =>
    b.rod(a, c, rad, col, { sides: 6, caps: "flat" });

  const eyelet = (p: number[], rad = 0.014, yaw = 0) =>
    b.part(new THREE.TorusGeometry(rad, 0.0035, 5, 10), WIRE, {
      at: p,
      rotation: [0, yaw, 0],
    });

  // leaf: extruded outline, hanging in the XZ-ish plane yawed about Y
  const leaf = (outline: any[], at: number[], yaw: number, color: string, th = 0.012) => {
    const c = Math.cos((yaw * Math.PI) / 180), s = Math.sin((yaw * Math.PI) / 180);
    return b.extrude(outline, {
      at,
      x: [c, 0, -s],
      y: [0, 1, 0],
      thickness: th,
      bevel: 0.002,
      smoothing: 2,
      color,
    });
  };

  const px = M.tier2Pivot[0], py = M.tier2Pivot[1];
  const topPt = [M.tier1Right[0], M.tier1Right[1], 0];

  // hanging wire from tier1Right to the arm centre, gently bent
  const mid = [px - 0.1, 1.3, 0.02];
  b.sweep(b.catmull ? undefined : [topPt, mid, [px, py + 0.02, 0]], 0.006, { color: WIRE, sides: 6 });
  eyelet(topPt, 0.016, 90);
  eyelet([px, py + 0.02, 0], 0.014, 90);

  // arm: bent wire from left end to right end
  const ends = [
    [px + 0.4, py - 0.03, -0.18],
    [px + 0.2, py - 0.01, -0.07],
    [px, py, 0],
    [px - 0.2, py + 0.015, 0.1],
    [px - 0.4, py + 0.04, 0.22],
  ];
  for (let i = 0; i < ends.length - 1; i++) rod(ends[i], ends[i + 1]);
  for (const p of ends) b.part(new THREE.SphereGeometry(0.008, 6, 4), WIRE, { at: p });

  // red counterweight at +X end
  const cw = ends[0];
  eyelet([cw[0], cw[1] - 0.012, cw[2]], 0.01);
  rod([cw[0], cw[1] - 0.01, cw[2]], [cw[0], cw[1] - 0.09, cw[2]], 0.004);
  b.part(new THREE.SphereGeometry(0.045, 10, 8), RED, { at: [cw[0], cw[1] - 0.135, cw[2]] });

  // black teardrop, on the -X end
  const e1 = ends[4];
  const stem1 = 0.32;
  eyelet([e1[0], e1[1] - 0.012, e1[2]], 0.01);
  rod([e1[0], e1[1] - 0.01, e1[2]], [e1[0], e1[1] - stem1, e1[2]], 0.004);
  const tear = [
    [0, 0.0, "sharp"], [0.05, -0.1], [0.1, -0.2], [0.09, -0.3], [0.04, -0.37],
    [-0.03, -0.36], [-0.08, -0.28], [-0.07, -0.16], [-0.03, -0.06],
  ];
  const t0 = [e1[0], e1[1] - stem1, e1[2]];
  leaf(tear, t0, 35, BLACK);
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 8), P.white, {
    at: [t0[0] + 0.01, t0[1] - 0.16, t0[2] + 0.008], rotation: [90, 35, 0],
  });

  // yellow oval, hanging from arm at x offset
  const e2 = [px - 0.12, py + 0.012, 0.05];
  const stem2 = 0.2;
  eyelet([e2[0], e2[1] - 0.012, e2[2]], 0.01, 90);
  rod([e2[0], e2[1] - 0.01, e2[2]], [e2[0], e2[1] - stem2, e2[2]], 0.004);
  const oval: any[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    oval.push([0.17 * Math.cos(a) * (1 + 0.1 * Math.sin(a)), -0.1 + 0.1 * Math.sin(a)]);
  }
  const y0 = [e2[0], e2[1] - stem2, e2[2]];
  leaf(oval, y0, -50, YEL);
  // black dot on the yellow leaf, both faces
  for (const sd of [1, -1]) {
    const yaw = (-50 * Math.PI) / 180;
    const nx = Math.sin(yaw), nz = Math.cos(yaw);
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 10), BLACK, {
      at: [y0[0] + 0.04 + sd * nx * 0.008, y0[1] - 0.1, y0[2] + sd * nz * 0.008],
      rotation: [90, -50, 0],
    });
  }
}
    return buildLeftTier;
  })(),
  // rightTier
  (() => {
function buildRightTier({ b, J, P, M }: any) {
  const WIRE = P.wire, BLACK = P.black, BLUE = P.blue, WHITE = P.white, YEL = P.yellow, RED = P.red;
  const r = rng(11);
  const cyl = (a: number[], c: number[], rad: number, col: string) =>
    b.rod(a, c, rad, col);
  const eye = (p: number[], rad = 0.014) =>
    b.part(new THREE.TorusGeometry(rad, 0.004, 5, 10), WIRE, { at: p, dir: [0, 0, 1], axis: "z" });
  const ball = (p: number[], rad: number, col: string) =>
    b.part(new THREE.SphereGeometry(rad, 10, 7), col, { at: p });

  // hanging wire from tier1Left down to tier3Pivot
  const top = [0.9, 1.4, 0];
  const piv = [0.55, 0.95, 0];
  eye([0.9, 1.395, 0]);
  cyl([0.9, 1.4, 0], [0.9, 1.3, 0], 0.005, WIRE);
  cyl([0.9, 1.3, 0], [0.55, 1.0, 0], 0.005, WIRE);
  eye([0.55, 1.0, 0]);
  cyl([0.55, 1.0, 0], piv, 0.006, WIRE);

  // arm: x from 0.1 to 1.05, gentle bend
  const A = [1.05, 0.93, 0.05], B = [0.55, 0.95, 0], C = [0.1, 0.97, -0.05];
  cyl(A, B, 0.006, WIRE);
  cyl(B, C, 0.006, WIRE);
  for (const p of [A, B, C]) eye(p, 0.012);

  // extruded leaf helper
  const leaf = (outline: any[], at: number[], yaw: number, thick: number, col: string) => {
    const part = b.extrude(outline, { at, x: [Math.cos(yaw), 0, -Math.sin(yaw)], thickness: thick, bevel: 0.002, smoothing: 2, color: col });
    return part;
  };

  // blue crescent at the near end, long stem
  const sA = [1.05, 0.93, 0.05];
  cyl(sA, [1.05, 0.62, 0.05], 0.004, WIRE);
  eye([1.05, 0.62, 0.05], 0.011);
  const cres: any[] = [];
  const R1 = 0.2, R2 = 0.14;
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * (0.1 + 0.8 * i / 8);
    cres.push([Math.cos(a) * R1 * 1, -Math.sin(a) * R1]);
  }
  for (let i = 8; i >= 0; i--) {
    const a = Math.PI * (0.1 + 0.8 * i / 8);
    cres.push([Math.cos(a) * R2, -Math.sin(a) * R2 * 0.55 + 0.04]);
  }
  leaf(cres.map((p: number[]) => [p[0], p[1] + 0.2] as [number, number]), [1.05, 0.42, 0.05], 0.5, 0.012, BLUE);
  // red dot on blue leaf
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), RED, { at: [1.05 + 0.1, 0.49, 0.05 - 0.058], dir: [Math.sin(0.5), 0, Math.cos(0.5)] });

  // small white disc, short stem at centre
  cyl(B, [0.55, 0.72, 0.0], 0.004, WIRE);
  eye([0.55, 0.72, 0], 0.01);
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 18), WHITE, { at: [0.55, 0.62, 0.02], dir: [0.3, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8), BLACK, { at: [0.55 + 0.015, 0.63, 0.03], dir: [0.3, 0, 1] });

  // black fan leaf on far end, medium stem, different yaw
  cyl(C, [0.1, 0.72, -0.05], 0.004, WIRE);
  eye([0.1, 0.72, -0.05], 0.011);
  const fan: any[] = [[0, 0]];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI * (1.15 + 0.7 * i / 8) ;
    fan.push([Math.cos(a) * 0.22, Math.sin(a) * 0.3 + 0.0]);
  }
  leaf(fan.map((p: number[]) => [p[0], p[1] - 0.0] as [number, number]).map((p: [number, number]) => [p[0], p[1] + 0.0] as [number, number]), [0.1, 0.72 + 0.02, -0.05], -0.7, 0.012, BLACK);
  // rivets on fan
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.008, 6, 4), WHITE, { at: [0.1 + (i - 1) * 0.05, 0.5 - Math.abs(i - 1) * 0.02, -0.05 + 0.01 * (i - 1)] });

  // yellow counterweight ball at far near end
  cyl(A, [1.08, 0.93, 0.05], 0.005, WIRE);
  ball([1.09, 0.93, 0.05], 0.035, YEL);
  r();
}
    return buildRightTier;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

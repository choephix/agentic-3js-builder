```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse",
  description:
    "A wooden treehouse on a leaning oak: plank deck, pitched red roof with gables and a chimney, glowing windows with shutters and flower boxes, a ladder, lanterns, a flag, a birdhouse and a rope swing.",
};

type V = [number, number, number];

const COL = {
  grass: "#7cc85a",
  lawn: "#94d469",
  stone: "#b9b2a2",
  root: "#5b3d26",
  bark: "#6e4b2d",
  barkDark: "#4a3120",
  leafDeep: "#2f7d3a",
  leafMid: "#4fa84a",
  leafLight: "#8fd45c",
  leafGold: "#c9e46a",
  plank: "#d9a066",
  plankDark: "#bd834a",
  wall: "#efc086",
  trim: "#fbf1dc",
  roof: "#c8473b",
  roofDark: "#8f2f2a",
  glow: "#ffd966",
  shutter: "#2a9d8f",
  door: "#2a7fa8",
  pot: "#e0704f",
  pink: "#ff8fb1",
  yellow: "#ffd23f",
  flag: "#e63946",
  metal: "#3d3d46",
  gold: "#f4c542",
  rope: "#d8b57a",
  ladder: "#8c5a2b",
  birdhouse: "#e9a23b",
} as const;

// Matrix that takes +Y to `dir` (unit length) and moves the origin to `at`.
function axisMatrix(dir: THREE.Vector3, at: THREE.Vector3): THREE.Matrix4 {
  const ref = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const x = new THREE.Vector3().crossVectors(ref, dir).normalize();
  const z = new THREE.Vector3().crossVectors(x, dir).normalize();
  return new THREE.Matrix4().makeBasis(x, dir, z).setPosition(at);
}

// Bakes an Euler turn, then a move, into a geometry (model space).
function place<G extends THREE.BufferGeometry>(geo: G, pos: V, rot: V = [0, 0, 0]): G {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(pos[0], pos[1], pos[2]),
    q,
    new THREE.Vector3(1, 1, 1),
  );
  geo.applyMatrix4(m);
  return geo;
}

// Triangular flag that hangs off a pole on the +Y/Z plane; tipX picks the side.
function pennant(tipX: number): THREE.ExtrudeGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, 0.5);
  s.lineTo(tipX, 0.25);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
}

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  b.joint("root", { at: [0, 0, 0] });

  const box = (w: number, h: number, d: number, color: string, pos: V, rot: V = [0, 0, 0]) =>
    b.part(place(new THREE.BoxGeometry(w, h, d), pos, rot), color);

  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, pos: V, rot: V = [0, 0, 0]) =>
    b.part(place(new THREE.CylinderGeometry(rt, rb, h, seg), pos, rot), color);

  const cone = (r: number, h: number, seg: number, color: string, pos: V, rot: V = [0, 0, 0]) =>
    b.part(place(new THREE.ConeGeometry(r, h, seg), pos, rot), color);

  const blob = (r: number, s: V, color: string, pos: V, detail = 1) => {
    const g = new THREE.IcosahedronGeometry(r, detail).scale(s[0], s[1], s[2]);
    b.part(place(g, pos), color);
  };

  // A straight tapered stick from a to c (r0 at a, r1 at c).
  const beam = (a: V, c: V, r0: number, r1: number, color: string, seg = 6) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const C = new THREE.Vector3(c[0], c[1], c[2]);
    const d = new THREE.Vector3().subVectors(C, A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1);
    g.applyMatrix4(axisMatrix(d.normalize(), A.clone().add(C).multiplyScalar(0.5)));
    b.part(g, color);
  };

  // ---------- ground ----------
  cyl(5.8, 6.0, 0.2, 28, COL.grass, [0, -0.05, 0]);
  cyl(3.3, 3.3, 0.02, 28, COL.lawn, [0, 0.065, 0.4]);

  const stones: [number, number][] = [
    [1.55, 4.35],
    [1.4, 5.05],
    [1.25, 5.6],
  ];
  for (const [x, z] of stones) cyl(0.3, 0.32, 0.08, 7, COL.stone, [x, 0.04, z]);

  const tufts: [number, number][] = [
    [-2.6, 3.0],
    [-3.3, 1.3],
    [-1.9, 4.2],
    [2.9, 3.2],
    [3.2, 0.2],
    [-3.4, -2.4],
    [2.2, -3.3],
  ];
  for (const [x, z] of tufts) cone(0.12, 0.32, 5, COL.leafLight, [x, 0.16, z]);

  blob(0.75, [1.1, 0.8, 1], COL.leafDeep, [-3.2, 0.55, 0.3], 0);
  blob(0.65, [1, 0.9, 1], COL.leafMid, [3.0, 0.5, -1.6], 0);
  blob(0.5, [1, 0.85, 1], COL.leafLight, [3.1, 0.4, 1.4], 0);

  // ---------- tree ----------
  // Leaning trunk, flared base, roots.
  beam([0, 0, -1.2], [0.25, 7.4, -1.35], 0.56, 0.36, COL.bark, 10);
  cyl(0.64, 0.8, 0.5, 10, COL.root, [0, 0.2, -1.2]);
  beam([0.3, 0.2, -1.2], [1.3, 0.05, -1.25], 0.2, 0.05, COL.root);
  beam([-0.3, 0.2, -1.2], [-1.25, 0.05, -1.15], 0.2, 0.05, COL.root);
  beam([0, 0.2, -0.9], [0.1, 0.05, -0.2], 0.18, 0.05, COL.root);
  beam([0, 0.2, -1.5], [0.05, 0.05, -2.2], 0.18, 0.05, COL.root);
  // Knothole on the front of the trunk.
  cyl(0.1, 0.1, 0.06, 8, COL.barkDark, [0.1, 3.0, -0.78], [Math.PI / 2, 0, 0]);

  // Branches: two reach out, two climb into the canopy, two carry the deck.
  beam([0.1, 5.4, -1.3], [-3.1, 6.6, -1.7], 0.26, 0.1, COL.bark, 7);
  beam([0.2, 5.7, -1.35], [2.6, 7.0, -1.8], 0.24, 0.08, COL.bark, 7);
  beam([0.25, 6.8, -1.35], [-0.9, 8.7, -2.4], 0.2, 0.06, COL.bark);
  beam([0.25, 7.0, -1.4], [1.2, 8.8, -2.2], 0.18, 0.05, COL.bark);
  beam([0.1, 3.2, -1.25], [2.7, 3.7, -2.0], 0.2, 0.09, COL.bark);
  beam([-0.1, 3.1, -1.25], [-2.6, 3.6, -1.9], 0.2, 0.09, COL.bark);

  // Canopy: stacked low-poly foliage in four greens and a gold highlight.
  blob(1.9, [1.1, 0.9, 1.05], COL.leafMid, [0.2, 9.5, -1.4]);
  blob(1.45, [1, 0.95, 1], COL.leafDeep, [-1.5, 8.7, -1.9]);
  blob(1.5, [1, 1, 1], COL.leafMid, [1.6, 8.6, -1.7]);
  blob(1.7, [1.1, 1, 1], COL.leafDeep, [0.0, 7.9, -3.0]);
  blob(1.2, [1, 1, 1], COL.leafMid, [-2.8, 6.8, -2.1]);
  blob(1.25, [1, 1, 1], COL.leafLight, [2.8, 6.6, -2.3]);
  blob(1.05, [1, 1, 1], COL.leafLight, [-0.7, 10.2, -0.6]);
  blob(1.0, [1, 1, 1], COL.leafGold, [1.1, 10.1, -2.5]);
  blob(0.95, [1, 1, 1], COL.leafDeep, [2.6, 5.2, -1.0]);
  blob(1.2, [1, 1, 1], COL.leafDeep, [-1.2, 6.9, -3.2]);
  blob(0.85, [1, 1, 1], COL.leafLight, [-2.5, 7.6, 0.2]);
  blob(0.8, [1, 1, 1], COL.leafMid, [2.5, 7.9, 0.6]);

  // Birdhouse on a bracket on the trunk.
  beam([0.5, 1.95, -1.22], [0.95, 1.95, -1.2], 0.035, 0.03, COL.barkDark, 5);
  box(0.34, 0.32, 0.34, COL.birdhouse, [1.1, 2.15, -1.2]);
  cone(0.28, 0.16, 4, COL.roofDark, [1.1, 2.39, -1.2], [0, Math.PI / 4, 0]);
  cyl(0.07, 0.07, 0.04, 8, COL.barkDark, [1.1, 2.2, -1.03], [Math.PI / 2, 0, 0]);

  // ---------- deck ----------
  const pw = 4.4 / 7;
  for (let i = 0; i < 7; i++) {
    box(pw - 0.03, 0.2, 3.8, i % 2 ? COL.plankDark : COL.plank, [-2.2 + pw * (i + 0.5), 3.5, 0.3]);
  }
  for (const z of [-1.3, 0.3, 1.9]) box(4.2, 0.14, 0.16, COL.barkDark, [0, 3.3, z]);

  // Railings: cream posts with a top rail and a mid rail.
  const rail = (a: V, c: V) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const C = new THREE.Vector3(c[0], c[1], c[2]);
    const n = Math.max(1, Math.round(A.distanceTo(C) / 0.9));
    for (let i = 0; i <= n; i++) {
      const p = A.clone().lerp(C, i / n);
      beam([p.x, 3.5, p.z], [p.x, 4.55, p.z], 0.04, 0.04, COL.trim);
    }
    beam([A.x, 4.55, A.z], [C.x, 4.55, C.z], 0.035, 0.035, COL.trim);
    beam([A.x, 4.1, A.z], [C.x, 4.1, C.z], 0.025, 0.025, COL.trim);
  };
  rail([2.12, 3.6, -1.5], [2.12, 3.6, 2.12]);
  rail([-2.12, 3.6, -1.5], [-2.12, 3.6, 2.12]);
  rail([-2.12, 3.6, 2.12], [-0.65, 3.6, 2.12]);

  // Ladder leaning from the deck edge to the lawn, with rungs.
  for (const x of [1.5, 1.9]) beam([x, 3.72, 2.25], [x, 0, 3.75], 0.035, 0.035, COL.ladder);
  for (let k = 0; k < 7; k++) {
    const t = 0.12 + k * 0.13;
    const y = 3.72 * (1 - t);
    const z = 2.25 + 1.5 * t;
    beam([1.5, y, z], [1.9, y, z], 0.025, 0.025, COL.ladder);
  }

  // Potted plants on the deck.
  const pot = (x: number, z: number) => {
    cyl(0.2, 0.25, 0.32, 8, COL.pot, [x, 3.76, z]);
    blob(0.24, [1, 0.8, 1], COL.leafMid, [x, 4.15, z]);
    blob(0.14, [1, 1, 1], COL.pink, [x - 0.1, 4.33, z + 0.06], 0);
  };
  pot(-1.85, 1.8);
  pot(1.8, -1.0);

  // ---------- house ----------
  box(3.3, 0.22, 2.2, COL.plankDark, [0, 3.71, 0.55]);
  box(3.2, 2.3, 2.1, COL.wall, [0, 4.75, 0.55]);
  for (const x of [-1.6, 1.6]) {
    for (const z of [-0.5, 1.6]) box(0.12, 2.3, 0.12, COL.trim, [x, 4.75, z]);
  }

  // Pitched roof: two slabs, shingle rows, ridge cap, eave trim, chimney.
  const RUN = 1.85;
  const RISE = 1.25;
  const EAVE = 5.85;
  const RD = 2.5;
  const RZ = 0.55;
  const th = Math.atan2(RISE, RUN);
  const slope = Math.hypot(RUN, RISE);
  for (const s of [1, -1]) {
    const cx = (s * RUN) / 2;
    const cy = EAVE + RISE / 2;
    const rz = -s * th;
    box(slope + 0.04, 0.14, RD, COL.roof, [cx, cy, RZ], [0, 0, rz]);
    for (const off of [-0.7, 0, 0.7]) {
      const px = cx + off * s * Math.cos(th) + 0.085 * s * Math.sin(th);
      const py = cy - off * Math.sin(th) + 0.085 * Math.cos(th);
      box(0.06, 0.03, RD - 0.1, COL.roofDark, [px, py, RZ], [0, 0, rz]);
    }
    box(0.08, 0.2, RD, COL.trim, [s * (RUN + 0.02), EAVE - 0.03, RZ]);
  }
  box(0.26, 0.12, RD + 0.04, COL.roofDark, [0, EAVE + RISE + 0.07, RZ]);
  box(0.3, 1.0, 0.3, COL.stone, [-0.75, 6.9, 0.2]);
  box(0.38, 0.08, 0.38, COL.roofDark, [-0.75, 7.44, 0.2]);

  // Gable ends: cream triangles, extruded from the outline.
  const gable = (z: number) => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, 0);
    s.lineTo(1.6, 0);
    s.lineTo(0, 1.2);
    s.closePath();
    b.part(place(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }), [0, 5.9, z]), COL.trim);
  };
  gable(1.6);
  gable(-0.58);
  // Round attic vent with a glowing centre in the front gable.
  cyl(0.2, 0.2, 0.1, 12, COL.roofDark, [0, 6.5, 1.68], [Math.PI / 2, 0, 0]);
  cyl(0.14, 0.14, 0.04, 12, COL.glow, [0, 6.5, 1.74], [Math.PI / 2, 0, 0]);

  // Front door, boards, knob, awning and lanterns.
  box(0.84, 1.8, 0.06, COL.trim, [0, 4.5, 1.63]);
  box(0.66, 1.7, 0.06, COL.door, [0, 4.45, 1.66]);
  box(0.56, 0.05, 0.03, COL.trim, [0, 4.1, 1.7]);
  box(0.56, 0.05, 0.03, COL.trim, [0, 4.8, 1.7]);
  b.part(place(new THREE.SphereGeometry(0.05, 8, 6), [0.22, 4.45, 1.73]), COL.gold);

  box(1.15, 0.07, 0.6, COL.roof, [0, 5.62, 1.9], [0.3, 0, 0]);
  for (const x of [-0.4, 0.4]) {
    beam([x, 5.6, 2.0], [x, 5.29, 2.0], 0.012, 0.012, COL.metal, 4);
    cyl(0.09, 0.12, 0.22, 6, COL.glow, [x, 5.1, 2.0]);
    cone(0.13, 0.08, 6, COL.metal, [x, 5.25, 2.0]);
  }

  // Front windows: glowing glass, cream frames and mullions, teal shutters, flower boxes.
  for (const x of [-1.0, 1.0]) {
    box(0.7, 0.88, 0.08, COL.trim, [x, 4.75, 1.62]);
    box(0.56, 0.66, 0.06, COL.glow, [x, 4.75, 1.67]);
    box(0.035, 0.66, 0.03, COL.trim, [x, 4.75, 1.72]);
    box(0.56, 0.035, 0.03, COL.trim, [x, 4.75, 1.72]);
    box(0.14, 0.88, 0.05, COL.shutter, [x * 1.5, 4.75, 1.67]);
    box(0.14, 0.88, 0.05, COL.shutter, [x * 0.5, 4.75, 1.67]);
    box(0.7, 0.16, 0.22, COL.pot, [x, 4.22, 1.72]);
    const flowers: [number, string][] = [
      [-0.22, COL.pink],
      [0, COL.yellow],
      [0.22, COL.pink],
    ];
    for (const [dx, c] of flowers) blob(0.09, [1, 1, 1], c, [x + dx, 4.37, 1.8], 0);
  }

  // Side walls: a round porthole on the left, a shuttered window on the right.
  cyl(0.26, 0.26, 0.08, 14, COL.trim, [1.63, 5.0, 0.55], [0, 0, Math.PI / 2]);
  cyl(0.18, 0.18, 0.06, 14, COL.glow, [1.66, 5.0, 0.55], [0, 0, Math.PI / 2]);

  box(0.08, 0.88, 0.7, COL.trim, [-1.63, 4.75, 0.2]);
  box(0.06, 0.66, 0.56, COL.glow, [-1.66, 4.75, 0.2]);
  box(0.03, 0.88, 0.14, COL.shutter, [-1.67, 4.75, -0.3]);
  box(0.03, 0.88, 0.14, COL.shutter, [-1.67, 4.75, 0.7]);

  // Back window.
  box(0.8, 0.88, 0.08, COL.trim, [0, 4.75, -0.54]);
  box(0.56, 0.66, 0.06, COL.glow, [0, 4.75, -0.58]);

  // ---------- rope swing ----------
  box(0.6, 0.06, 0.34, COL.plank, [-3.0, 4.35, -1.2]);
  beam([-2.6, 6.375, -1.625], [-2.8, 4.38, -1.2], 0.02, 0.02, COL.rope, 4);
  beam([-3.0, 6.563, -1.688], [-3.2, 4.38, -1.2], 0.02, 0.02, COL.rope, 4);

  // ---------- flag ----------
  beam([0, 7.0, 0.55], [0, 8.9, 0.55], 0.035, 0.03, COL.metal);
  b.part(place(new THREE.SphereGeometry(0.06, 8, 6), [0, 8.92, 0.55]), COL.gold);
  b.part(place(pennant(0.9), [0, 8.15, 0.55]), COL.flag);
  b.part(place(pennant(-0.9), [0, 8.15, 0.55], [0, Math.PI, 0]), COL.flag);

  return b.root;
}
```
```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Treehouse Diorama",
  description: "A cozy oak treehouse on a round grassy base, with a red-roofed cabin, rope ladder, swing, lantern, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const rand = rng(11);

  // Root joint: the whole diorama is static props, so one root carries everything.
  b.joint("base", { at: [0, 0, 0] });

  // ---- helpers -----------------------------------------------------------
  const box = (w: number, h: number, d: number, color: string, at: number[], rot: number[] = [0, 0, 0]) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
    return b.part(g, color, { at });
  };

  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], rot: number[] = [0, 0, 0]) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
    return b.part(g, color, { at });
  };

  const sphere = (r: number, color: string, at: number[]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at });

  // Leafy clump: a jittered icosahedron, squashed a little.
  const blob = (r: number, sx: number, sy: number, sz: number, color: string, at: number[]) => {
    const g = new THREE.IcosahedronGeometry(r, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const j = 1 + 0.14 * (rand() - 0.5);
      pos.setXYZ(i, pos.getX(i) * j * sx, pos.getY(i) * j * sy, pos.getZ(i) * j * sz);
    }
    g.computeVertexNormals();
    return b.part(g, color, { at });
  };

  // Trunk radius as a function of height (tapered frustum from y 0.5 to 3.4).
  const trunkR = (y: number) => 0.56 - (y - 0.5) * (0.22 / 2.9);

  // ---- grassy round base -------------------------------------------------
  cyl(2.5, 2.65, 0.5, 28, "#7a5233", [0, 0.25, 0]);
  cyl(2.5, 2.5, 0.12, 28, "#6fb84a", [0, 0.56, 0]);

  // Grass tufts and little flowers.
  const grassCols = ["#5aa53a", "#7cc24f", "#4f9a33"];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.4 + rand() * 1.9;
    const x = Math.cos(a) * rr;
    const z = Math.sin(a) * rr;
    if (Math.hypot(x, z) < 0.7) continue;
    cyl(0.0, 0.05, 0.2, 4, grassCols[i % grassCols.length], [x, 0.72, z]);
  }
  const flowerCols = ["#ffd23f", "#ff7fb0", "#ffffff", "#c58cff"];
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const rr = 0.9 + rand() * 1.3;
    sphere(0.045, flowerCols[i % flowerCols.length], [Math.cos(a) * rr, 0.7, Math.sin(a) * rr]);
  }

  // ---- tree trunk, bark bands and roots ----------------------------------
  cyl(0.34, 0.56, 2.9, 10, "#6b4a2b", [0, 1.95, 0]);
  for (const y of [1.0, 1.8, 2.6]) {
    const r = trunkR(y) + 0.02;
    cyl(r, r, 0.1, 10, "#4f3520", [0, y, 0]);
  }
  b.sweep([[0, 0.9, 0], [0.4, 0.56, 0.5], [0.72, 0.5, 0.72]], 0.12, { color: "#6b4a2b" });
  b.sweep([[0, 0.9, 0], [-0.5, 0.56, -0.3], [-0.82, 0.5, -0.52]], 0.12, { color: "#6b4a2b" });
  b.sweep([[0, 0.9, 0], [0.1, 0.56, -0.7], [0.1, 0.5, -0.95]], 0.1, { color: "#6b4a2b" });

  // ---- main limbs --------------------------------------------------------
  const limbCol = "#6b4a2b";
  b.sweep([[0, 3.0, 0], [-0.8, 3.4, -0.2], [-1.6, 4.0, -0.6], [-2.0, 4.4, -0.8]], 0.2, { color: limbCol });
  b.sweep([[0, 3.1, 0], [0.9, 3.9, -0.9], [1.9, 4.4, -1.0]], 0.2, { color: limbCol });
  b.sweep([[0, 3.2, 0], [0.2, 4.0, -0.6], [0.4, 5.0, -0.9]], 0.2, { color: limbCol });
  b.sweep([[0, 2.9, 0], [-0.3, 3.2, 0.9], [-0.9, 3.9, 1.6]], 0.16, { color: limbCol });
  b.sweep([[0, 3.2, 0], [-0.5, 4.3, -1.3], [-0.9, 5.0, -1.9]], 0.14, { color: limbCol });

  // ---- leafy crown (mostly behind and around the cabin) ------------------
  const leafA = "#3f8f3a", leafB = "#58a84a", leafC = "#2f7534";
  blob(0.9, 1.1, 0.85, 1.0, leafA, [-1.8, 4.5, -0.7]);
  blob(1.0, 1.0, 0.9, 1.0, leafB, [-0.6, 5.0, -0.5]);
  blob(1.0, 1.05, 0.85, 1.0, leafA, [0.8, 5.0, -0.5]);
  blob(0.85, 1.0, 0.9, 1.0, leafC, [1.9, 4.5, -0.9]);
  blob(0.9, 1.0, 1.0, 1.0, leafB, [0.0, 5.7, 0.2]);
  blob(0.7, 1.0, 0.9, 1.0, leafA, [-2.3, 3.9, 0.1]);
  blob(0.75, 1.0, 0.85, 1.0, leafC, [0.3, 5.0, -1.5]);
  blob(0.6, 1.0, 0.9, 1.0, leafB, [-1.2, 3.8, 1.2]);
  blob(0.55, 1.0, 0.9, 1.0, leafA, [2.2, 3.7, 0.6]);
  blob(0.5, 1.0, 0.9, 1.0, leafB, [-0.3, 3.5, -1.3]);

  // ---- treehouse platform -----------------------------------------------
  const wood = "#a9743f";
  box(2.3, 0.12, 1.9, wood, [0.5, 2.95, 0.3]);
  for (let i = 0; i < 6; i++) {
    box(0.09, 0.02, 1.9, "#8a5a2e", [-0.5 + i * 0.4, 3.02, 0.3]);
  }

  // ---- cabin walls -------------------------------------------------------
  const cream = "#e9d2a6";
  box(1.6, 1.3, 1.5, cream, [0.5, 3.6, 0.3]);
  for (let i = 0; i < 6; i++) {
    box(0.04, 1.2, 0.02, "#c4995f", [-0.2 + i * 0.25, 3.6, 1.06]);
  }
  // Door with a little handle.
  box(0.4, 0.9, 0.04, "#5b3a22", [0.1, 3.5, 1.07]);
  sphere(0.035, "#f2c230", [0.23, 3.5, 1.1]);

  // Round window with frame, glass and cross.
  cyl(0.18, 0.18, 0.02, 16, "#bfe8ff", [0.9, 3.9, 1.09], [Math.PI / 2, 0, 0]);
  b.part(new THREE.TorusGeometry(0.22, 0.04, 6, 16), "#8a5a2e", { at: [0.9, 3.9, 1.1] });
  box(0.34, 0.03, 0.02, cream, [0.9, 3.9, 1.1]);
  box(0.03, 0.34, 0.02, cream, [0.9, 3.9, 1.1]);

  // Gable ends.
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-0.8, 0);
  gableShape.lineTo(0.8, 0);
  gableShape.lineTo(0, 0.65);
  gableShape.closePath();
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.04, bevelEnabled: false });
  b.part(gableGeo, cream, { at: [0.5, 4.25, 1.05] });
  b.part(gableGeo, cream, { at: [0.5, 4.25, -0.49] });

  // ---- red shingle roof --------------------------------------------------
  const roofRed = "#b8322b";
  const slopeAng = Math.atan(0.6 / 1.0);
  box(1.25, 0.08, 1.9, roofRed, [1.0, 4.575, 0.3], [0, 0, -slopeAng]);
  box(1.25, 0.08, 1.9, roofRed, [0.0, 4.575, 0.3], [0, 0, slopeAng]);
  // Shingle courses as lighter lines across the slopes.
  for (let i = 0; i < 4; i++) {
    const t = 0.2 + i * 0.2;
    box(0.06, 0.1, 1.8, "#d9584e", [0.5 + 0.5 * t * 2 - 0.5, 4.9 - 0.65 * t, 0.3], [0, 0, -slopeAng]);
    box(0.06, 0.1, 1.8, "#d9584e", [0.5 - 0.5 * t * 2 + 0.5, 4.9 - 0.65 * t, 0.3], [0, 0, slopeAng]);
  }
  // Eave trim.
  box(1.8, 0.06, 0.08, cream, [0.5, 4.22, 1.27]);
  box(1.8, 0.06, 0.08, cream, [0.5, 4.22, -0.67]);

  // Pennant flag on a pole at the ridge.
  cyl(0.02, 0.02, 0.9, 6, "#5a3a20", [0.5, 5.35, 0.3]);
  const flagShape = new THREE.Shape();
  flagShape.moveTo(0, 0);
  flagShape.lineTo(0.6, 0.12);
  flagShape.lineTo(0, 0.24);
  flagShape.closePath();
  b.part(new THREE.ExtrudeGeometry(flagShape, { depth: 0.015, bevelEnabled: false }), "#e8453c", {
    at: [0.51, 5.45, 0.3],
  });

  // ---- lantern on a post by the door -------------------------------------
  cyl(0.03, 0.03, 0.6, 6, "#5a3a20", [-0.45, 3.31, 1.15]);
  box(0.2, 0.26, 0.2, "#ffd36b", [-0.45, 3.66, 1.15]);
  const capGeo = new THREE.ConeGeometry(0.17, 0.12, 4);
  capGeo.rotateY(Math.PI / 4);
  b.part(capGeo, "#3a2a1e", { at: [-0.45, 3.85, 1.15] });
  sphere(0.03, "#3a2a1e", [-0.45, 3.93, 1.15]);

  // ---- rope ladder from the platform to the ground -----------------------
  const ropeCol = "#c9a46a";
  b.sweep([[-0.45, 3.0, 1.25], [-0.45, 1.8, 1.6], [-0.45, 0.6, 1.9]], 0.02, { color: ropeCol });
  b.sweep([[-0.05, 3.0, 1.25], [-0.05, 1.8, 1.6], [-0.05, 0.6, 1.9]], 0.02, { color: ropeCol });
  for (let i = 0; i < 7; i++) {
    const t = (i + 0.5) / 7;
    const y = 3.0 + (0.6 - 3.0) * t;
    const z = 1.25 + 0.65 * t;
    box(0.5, 0.04, 0.05, "#a9743f", [-0.25, y, z]);
  }

  // ---- wooden swing hanging from a branch --------------------------------
  const anchor = [-1.6, 4.0, -0.6];
  b.sweep([anchor, [-1.78, 3.1, -0.6], [-1.95, 2.25, -0.6]], 0.02, { color: ropeCol });
  b.sweep([anchor, [-1.42, 3.1, -0.6], [-1.25, 2.25, -0.6]], 0.02, { color: ropeCol });
  box(0.7, 0.08, 0.35, "#c9824a", [-1.6, 2.2, -0.6]);
  box(0.7, 0.04, 0.05, "#8a5a2e", [-1.6, 2.32, -0.42]);

  // ---- mushrooms at the foot of the tree ---------------------------------
  const mushrooms: number[][] = [
    [0.95, 0.5, -0.5],
    [1.1, 0.5, -0.95],
    [-0.8, 0.5, 0.9],
    [-0.6, 0.5, -0.95],
  ];
  for (const [mx, my, mz] of mushrooms) {
    cyl(0.04, 0.05, 0.18, 8, "#f1e6cf", [mx, my + 0.09, mz]);
    const capG = new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    capG.scale(1, 0.6, 1);
    b.part(capG, "#d8413a", { at: [mx, my + 0.18, mz] });
    sphere(0.025, "#fff4e0", [mx + 0.06, my + 0.27, mz + 0.03]);
    sphere(0.02, "#fff4e0", [mx - 0.05, my + 0.25, mz - 0.05]);
  }

  // ---- bicycle leaning in the grass --------------------------------------
  const x0 = 1.55, zc = 0.9;
  const hubR = [x0, 0.83, zc - 0.5];
  const hubF = [x0, 0.83, zc + 0.5];
  const bb = [x0, 0.83, zc - 0.05];
  const seatTop = [x0, 1.2, zc - 0.25];
  const head = [x0, 1.15, zc + 0.33];
  const barTop = [x0, 1.3, zc + 0.4];
  const frame = "#2f7fd1";
  b.sweep([bb, seatTop], 0.025, { color: frame });
  b.sweep([seatTop, head], 0.025, { color: frame });
  b.sweep([head, bb], 0.025, { color: frame });
  b.sweep([bb, hubR], 0.025, { color: frame });
  b.sweep([seatTop, hubR], 0.02, { color: frame });
  b.sweep([head, hubF], 0.025, { color: frame });
  b.sweep([head, barTop], 0.02, { color: "#333333" });
  b.sweep([[x0, 1.32, zc + 0.36], [x0, 1.3, zc + 0.4], [x0, 1.32, zc + 0.44]], 0.015, { color: "#333333" });
  for (const hub of [hubR, hubF]) {
    const wg = new THREE.TorusGeometry(0.33, 0.025, 6, 20);
    wg.rotateY(Math.PI / 2);
    b.part(wg, "#222222", { at: hub });
  }
  const chainG = new THREE.TorusGeometry(0.1, 0.015, 4, 14);
  chainG.rotateY(Math.PI / 2);
  b.part(chainG, "#777777", { at: bb });
  box(0.22, 0.05, 0.12, "#3b2a1e", [x0, 1.25, zc - 0.25]);

  return b.root;
}
```
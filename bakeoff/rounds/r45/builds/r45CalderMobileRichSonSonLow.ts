import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Mobile in Red, Yellow, Blue and Black",
  "description": "A hanging abstract mobile in the manner of Alexander Calder: thin black wire arms in three balanced tiers, each arm hung from the end of another, carrying flat painted sheet-metal discs, leaves and a bean in primary red, yellow, blue, black and white."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wire: "#1b1b1e",
  wireHighlight: "#4a4a50",
  cap: "#8c8a84",
  capDark: "#5d5c58",
  red: "#d92b1f",
  redDark: "#9c1a12",
  redLight: "#f26a55",
  yellow: "#f4b800",
  yellowDark: "#b88400",
  yellowLight: "#ffdf6a",
  blue: "#1f4fb0",
  blueDark: "#14306e",
  blueLight: "#5c8be0",
  black: "#141416",
  blackLight: "#3a3a40",
  white: "#f3efe6",
};
const M = {
  ceilingCap: [0, 2.65, 0] as [number, number, number],
  hookEye: [0, 2.5, 0] as [number, number, number],
  arm1Pivot: [0, 2.25, 0] as [number, number, number],
  arm1EndLeft: [0.6, 2.25, 0] as [number, number, number],
  arm1EndRight: [-0.95, 2.25, 0] as [number, number, number],
  arm2Pivot: [0.6, 1.7, 0] as [number, number, number],
  arm2EndBack: [0.215, 1.7, -0.32] as [number, number, number],
  arm2EndFront: [1.293, 1.7, 0.576] as [number, number, number],
  arm3Pivot: [-0.95, 1.55, 0] as [number, number, number],
  arm3EndShort: [-1.428, 1.55, 0.275] as [number, number, number],
  arm3EndLong: [-0.384, 1.55, -0.325] as [number, number, number],
  arm4Pivot: [1.29, 0.9, 0.58] as [number, number, number],
  arm4EndBack: [0.91, 0.9, 0.72] as [number, number, number],
  arm4EndFront: [1.76, 0.9, 0.41] as [number, number, number],
  arm5Pivot: [-0.38, 0.75, -0.33] as [number, number, number],
  arm5EndBack: [-0.58, 0.75, -0.68] as [number, number, number],
  arm5EndFront: [-0.205, 0.75, -0.03] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // crown
  (() => {
function buildCrown({ b, J, P, M }: Ctx) {
  const W = P.wire;
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const wire = (a: number[], c: number[], r: number, bone: any, col = W) =>
    b.rod(v(a[0], a[1], a[2]), v(c[0], c[1], c[2]), r, col, { bone, sides: 6, caps: "flat" });

  const loop = (at: number[], bone: any, rad = 0.015, axis: number[] = [0, 0, 1]) =>
    b.part(new THREE.TorusGeometry(rad, 0.0028, 5, 10), W, { at, bone, dir: axis, axis: "z" });

  const bead = (at: number[], bone: any, r = 0.02, col = P.black) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at, bone });

  const knot = (at: number[], bone: any) => b.part(new THREE.SphereGeometry(0.008, 6, 4), W, { at, bone });

  // Ceiling cap
  const cx = M.ceilingCap;
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 20), P.cap, { at: [cx[0], cx[1] + 0.02, cx[2]], bone: J.mobile });
  b.part(new THREE.CylinderGeometry(0.083, 0.083, 0.012, 20), P.capDark, { at: [cx[0], cx[1] + 0.006, cx[2]], bone: J.mobile });
  b.part(new THREE.TorusGeometry(0.07, 0.004, 5, 20), P.capDark, { at: [cx[0], cx[1] + 0.041, cx[2]], bone: J.mobile, dir: [0, 1, 0], axis: "z" });
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 6), P.wireHighlight, { at: [s * 0.045, cx[1] + 0.044, 0], bone: J.mobile });
  // hook and eye
  wire([0, 2.65, 0], [0, 2.54, 0], 0.005, J.mobile);
  loop(M.hookEye, J.mobile, 0.02, [1, 0, 0]);
  wire([0, 2.48, 0], [0, 2.265, 0], 0.004, J.mobile);
  knot([0, 2.3, 0], J.mobile);
  loop([0, 2.26, 0], J.arm1, 0.015, [1, 0, 0]);
  knot([0, 2.25, 0], J.arm1);

  // Arm1
  const L = M.arm1EndLeft, R = M.arm1EndRight;
  wire(R, L, 0.006, J.arm1);
  b.rod(v(-0.9, 2.254, 0), v(0.55, 2.254, 0), 0.0015, P.wireHighlight, { bone: J.arm1, sides: 4, caps: "flat" });
  for (const e of [L, R]) {
    bead(e, J.arm1);
    loop([e[0], e[1] - 0.012, e[2]], J.arm1, 0.015, [1, 0, 0]);
    knot([e[0], e[1] - 0.03, e[2]], J.arm1);
  }
  wire([L[0], L[1] - 0.025, L[2]], M.arm2Pivot, 0.004, J.arm1);
  wire([R[0], R[1] - 0.025, R[2]], M.arm3Pivot, 0.004, J.arm1);
  loop([M.arm2Pivot[0], M.arm2Pivot[1] + 0.012, 0], J.arm1, 0.015, [1, 0, 0]);
  loop([M.arm3Pivot[0], M.arm3Pivot[1] + 0.012, 0], J.arm1, 0.015, [1, 0, 0]);

  // Black leaf at x -0.35
  const lx = -0.35;
  b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 8, Math.PI * 1.5), W, { at: [lx, 2.24, 0], bone: J.arm1, dir: [1, 0, 0], axis: "z" });
  wire([lx, 2.235, 0], [lx, 1.93, 0], 0.003, J.arm1);
  loop([lx, 1.925, 0], J.arm1, 0.01, [1, 0, 0]);
  const leaf: [number, number, string?][] = [
    [0, 0], [0.05, -0.04], [0.05, -0.12], [0, -0.22], [-0.05, -0.12], [-0.05, -0.04],
  ];
  const pts = leaf.map(([x, y]) => [x, y] as [number, number]);
  const shape = (col: string, th: number, sc = 1, z = 0, bev = 0.002) =>
    b.extrude(pts.map(([x, y]) => [x * sc, y * sc]), {
      at: [lx, 1.92, z], x: [1, 0, 0], thickness: th, bevel: bev, smoothing: 2, color: col, bone: J.arm1,
    });
  const lf = shape(P.black, 0.012);
  b.pose; // roll applied via sliver placement below
  const roll = (p: any) => { p.mesh.rotation.z = 0; };
  roll(lf);
  b.extrude(
    [[0.0, -0.02], [0.012, -0.05], [0.012, -0.13], [0.0, -0.19], [0.004, -0.12], [0.004, -0.05]],
    { at: [lx + 0.02, 1.92, 0.007], x: [1, 0, 0], thickness: 0.003, color: P.blackLight, bone: J.arm1 },
  );

  // White disc at x 0.25
  const wx = 0.25;
  b.part(new THREE.TorusGeometry(0.01, 0.003, 5, 8, Math.PI * 1.5), W, { at: [wx, 2.24, 0], bone: J.arm1, dir: [1, 0, 0], axis: "z" });
  wire([wx, 2.235, 0], [wx, 2.0, 0], 0.003, J.arm1);
  loop([wx, 2.0, 0], J.arm1, 0.01, [1, 0, 0]);
  const tilt = (25 * Math.PI) / 180;
  const dc = [wx, 1.945, 0];
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 16), P.white, {
    at: dc, bone: J.arm1, rotation: [90, 0, 25],
  });
  b.part(new THREE.TorusGeometry(0.048, 0.0025, 4, 16), "#cfc9bb", {
    at: dc, bone: J.arm1, rotation: [0, 0, 25],
  });
  b.part(new THREE.SphereGeometry(0.008, 5, 4), P.wireHighlight, { at: [wx, 1.994, 0.006], bone: J.arm1 });
  void tilt; void frame; void rng;
}
    return buildCrown;
  })(),
  // branchLeftUpper
  (() => {
function buildBranchLeftUpper({ b, J, P, M }: Ctx) {
  const bone = J.arm2;
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const wire = (a: number[], c: number[], r: number, col = P.wire) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const bead = (p: number[], r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at: p });
  const loop = (p: number[], r = 0.015) =>
    b.part(new THREE.TorusGeometry(r, 0.003, 5, 10), P.wire, { bone, at: p, dir: [0, 0, 1], axis: "z" });

  const piv = M.arm2Pivot;
  const back = M.arm2EndBack;
  const front = M.arm2EndFront;

  // top loop and knot
  loop([piv[0], piv[1] + 0.02, piv[2]]);
  bead([piv[0], piv[1] + 0.038, piv[2]], 0.007, P.wireHighlight);
  bead(piv, 0.01, P.wire);

  // arm
  wire(back, front, 0.006);
  const dirv = V(front).sub(V(back)).normalize();
  wire(
    [back[0] + dirv.x * 0.1, back[1] + 0.004, back[2] + dirv.z * 0.1],
    [front[0] - dirv.x * 0.1, front[1] + 0.004, front[2] - dirv.z * 0.1],
    0.002,
    P.wireHighlight,
  );
  for (const [e, s] of [[back, -1], [front, 1]] as const) {
    const p = [e[0] + dirv.x * 0.02 * s, e[1], e[2] + dirv.z * 0.02 * s];
    bead(p, 0.017, P.black);
    loop([e[0], e[1] - 0.015, e[2]]);
  }

  // red disc hanging from back end
  const hookY = back[1] - 0.4;
  wire([back[0], back[1] - 0.015, back[2]], [back[0], hookY + 0.02, back[2]], 0.004);
  // hook
  b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 10, Math.PI * 1.5), P.wire, {
    bone, at: [back[0], hookY + 0.012, back[2]], dir: [0, 0, 1], axis: "z",
  });
  const R = 0.2;
  const cy = 1.1;
  const cz = back[2];
  const tilt = new THREE.Euler(THREE.MathUtils.degToRad(25), THREE.MathUtils.degToRad(-30), 0);
  const q = new THREE.Quaternion().setFromEuler(tilt);
  const discAt = [back[0], cy, cz];
  const place = (g: THREE.BufferGeometry, col: string, local: number[]) => {
    const o = new THREE.Vector3(local[0], local[1], local[2]).applyQuaternion(q);
    return b.part(g, col, { bone, at: [discAt[0] + o.x, discAt[1] + o.y, discAt[2] + o.z], quat: q });
  };
  const cyl = (r: number, t: number, seg = 20) => {
    const g = new THREE.CylinderGeometry(r, r, t, seg);
    g.rotateX(Math.PI / 2);
    return g;
  };
  place(cyl(R, 0.012), P.red, [0, 0, 0]);
  // rim strip
  place(new THREE.TorusGeometry(R, 0.007, 4, 20), P.redDark, [0, 0, 0]);
  // printed ring
  place(new THREE.TorusGeometry(R * 0.6, 0.0025, 4, 20), P.redDark, [0, 0, 0.007]);
  place(new THREE.TorusGeometry(R * 0.6, 0.0025, 4, 20), P.redDark, [0, 0, -0.007]);
  // highlight crescent
  const cres = new THREE.TorusGeometry(R * 0.82, 0.009, 4, 12, Math.PI * 0.6);
  cres.rotateZ(Math.PI * 0.2);
  place(cres, P.redLight, [0, 0, 0.007]);
  // eyelet
  place(new THREE.TorusGeometry(0.012, 0.003, 5, 10), P.black, [0, R + 0.008, 0]);
  // hanging wire from hook to eyelet
  const top = new THREE.Vector3(0, R + 0.012, 0).applyQuaternion(q);
  wire([back[0], hookY + 0.02, back[2]], [discAt[0] + top.x, discAt[1] + top.y, discAt[2] + top.z], 0.003);

  // long wire from front end
  wire([front[0], front[1] - 0.015, front[2]], [M.arm4Pivot[0], M.arm4Pivot[1] + 0.02, M.arm4Pivot[2]], 0.004);
  loop([M.arm4Pivot[0], M.arm4Pivot[1] + 0.02, M.arm4Pivot[2]]);

  // blue ball a third toward back
  const t = V(back).lerp(V(front), 0.33);
  loop([t.x, t.y - 0.012, t.z], 0.01);
  wire([t.x, t.y - 0.01, t.z], [t.x, t.y - 0.25 + 0.06, t.z], 0.003);
  const by = t.y - 0.25;
  b.part(new THREE.SphereGeometry(0.06, 10, 8), P.blue, { bone, at: [t.x, by, t.z] });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.blueLight, { bone, at: [t.x + 0.02, by + 0.035, t.z + 0.025] });
}
    return buildBranchLeftUpper;
  })(),
  // branchLeftLower
  (() => {
function buildBranchLeftLower({ b, J, P, M }: Ctx) {
  const bone = J.arm4;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const pivot = M.arm4Pivot;
  const back = M.arm4EndBack;
  const front = M.arm4EndFront;

  const wire = (a: number[], c: number[], r = 0.004, col = P.wire) =>
    b.rod(a, c, r, col, { bone, sides: 6 });
  const loop = (at: number[], rad = 0.015) => {
    b.part(new THREE.TorusGeometry(rad, 0.0025, 5, 10), P.wire, { bone, at, dir: [1, 0, 0], axis: "z" });
  };
  const bead = (at: number[], r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at });

  // pivot loop and knot
  loop([pivot[0], pivot[1] + 0.02, pivot[2]]);
  bead([pivot[0], pivot[1] + 0.037, pivot[2]], 0.006, P.wire);
  wire([pivot[0], pivot[1] + 0.005, pivot[2]], [pivot[0], pivot[1], pivot[2]], 0.004);

  // arm rod
  b.rod(back, front, 0.006, P.wire, { bone, sides: 8 });
  // highlight sliver on arm
  b.rod(
    [back[0] + 0.02, back[1] + 0.005, back[2] - 0.006],
    [front[0] - 0.02, front[1] + 0.005, front[2] - 0.002],
    0.0015, P.wireHighlight, { bone, sides: 4 },
  );
  for (const e of [back, front]) {
    loop([e[0], e[1] - 0.012, e[2]], 0.013);
    bead([e[0], e[1], e[2]], 0.014, P.wire);
  }
  // arm pivot ring on arm centre
  const mid = V((back[0] + front[0]) / 2, 0.9, (back[2] + front[2]) / 2);
  loop([mid.x, mid.y + 0.012, mid.z], 0.012);

  // ---- black leaf ----
  const top = [back[0], back[1] - 0.3, back[2]];
  wire([back[0], back[1] - 0.025, back[2]], top, 0.004);
  bead([back[0], back[1] - 0.12, back[2]], 0.007, P.white);
  // hook at top
  b.part(new THREE.TorusGeometry(0.01, 0.0025, 5, 10, Math.PI * 1.5), P.wire, {
    bone, at: [top[0], top[1] - 0.006, top[2]], dir: [1, 0, 0], axis: "z",
  });
  const L = 0.5, W = 0.2;
  const leafOutline: [number, number][] = [
    [0, 0], [0.05, -0.1], [0.09, -0.25], [0.1, -0.35], [0.06, -0.44], [0, -0.5],
    [-0.06, -0.44], [-0.1, -0.35], [-0.09, -0.25], [-0.05, -0.1],
  ].map(([x, y]) => [x * (W / 0.2), y * (L / 0.5)] as [number, number]);
  const leafTop = V(top[0], top[1] - 0.012, top[2]);
  const roll = (30 * Math.PI) / 180;
  const leafQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.12, -0.35, roll));
  const place = (u: number, v: number, w: number) =>
    V(u, v, w).applyQuaternion(leafQuat).add(leafTop).toArray() as number[];

  const geo = (pts: [number, number][], t: number) => {
    const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1, curveSegments: 4 });
    g.translate(0, 0, -t / 2);
    return g;
  };
  b.part(geo(leafOutline, 0.012), P.black, { bone, at: leafTop.toArray(), quat: leafQuat });
  // highlight sliver along right edge
  const sliver: [number, number][] = [
    [0.05, -0.1], [0.09, -0.25], [0.1, -0.35], [0.085, -0.36], [0.075, -0.25], [0.04, -0.11],
  ];
  b.part(geo(sliver, 0.002), P.blackLight, { bone, at: place(0, 0, 0.007), quat: leafQuat });
  // vein line (white), both faces
  for (const z of [0.0072, -0.0072]) {
    b.part(new THREE.BoxGeometry(0.003, 0.38, 0.002), P.white, { bone, at: place(0, -0.25, z), quat: leafQuat });
  }
  // small side veins
  for (let i = 0; i < 4; i++) {
    const y = -0.14 - i * 0.07;
    for (const sd of [1, -1]) {
      const q = leafQuat.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, sd * -0.8)));
      b.part(new THREE.BoxGeometry(0.002, 0.05, 0.002), P.white, { bone, at: place(sd * 0.022, y, 0.0072), quat: q });
    }
  }
  // eyelet
  b.part(new THREE.TorusGeometry(0.007, 0.002, 5, 8), P.wire, { bone, at: place(0, -0.008, 0), quat: leafQuat });

  // ---- red ball ----
  const bt = [front[0], front[1] - 0.2, front[2]];
  wire([front[0], front[1] - 0.025, front[2]], bt, 0.004);
  bead([front[0], front[1] - 0.09, front[2]], 0.012, P.white);
  const bc = [front[0], 0.55, front[2]];
  b.part(new THREE.SphereGeometry(0.1, 14, 10), P.red, { bone, at: bc });
  b.part(new THREE.SphereGeometry(0.101, 14, 5, 0, Math.PI * 2, Math.PI * 0.68, Math.PI * 0.32), P.redDark, { bone, at: bc });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), P.redLight, { bone, at: [bc[0] + 0.035, bc[1] + 0.055, bc[2] + 0.055] });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.redLight, { bone, at: [bc[0] + 0.055, bc[1] + 0.035, bc[2] + 0.06] });
  // wire to ball top and hook
  wire([front[0], front[1] - 0.2, front[2]], [bc[0], bc[1] + 0.1, bc[2]], 0.004);
  b.part(new THREE.TorusGeometry(0.008, 0.0025, 5, 8), P.wire, { bone, at: [bc[0], bc[1] + 0.105, bc[2]], dir: [1, 0, 0], axis: "z" });
}
    return buildBranchLeftLower;
  })(),
  // branchRight
  (() => {
function buildBranchRight({ b, J, P, M }: Ctx) {
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const WR = 0.004;

  const wire = (a: number[], c: number[], bone: any, r = WR, col = P.wire) =>
    b.rod(a, c, r, col, { bone, sides: 6 });

  const loop = (at: number[], bone: any, dir: number[] = [0, 0, 1]) => {
    b.part(new THREE.TorusGeometry(0.015, 0.0025, 4, 8), P.wire, { bone, at, dir, axis: "z" });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), P.wireHighlight, { bone, at: [at[0], at[1] + 0.016, at[2]] });
  };

  const bead = (at: number[], bone: any, r = 0.02, col = P.black) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at });

  const outlineExtrude = (
    pts: any[], at: number[], bone: any, color: string, roll: number, tilt: number, yaw: number, th = 0.012,
  ) => {
    const part = b.extrude(pts, { at, x: [1, 0, 0], y: [0, 1, 0], thickness: th, bevel: 0.002, smoothing: 2, color, bone });
    part.mesh.rotation.set(0, 0, 0);
    part.mesh.rotateY(yaw);
    part.mesh.rotateX(tilt);
    part.mesh.rotateZ(roll);
    return part;
  };

  // ---- arm3 ----
  const p3 = M.arm3Pivot, s3 = M.arm3EndShort, l3 = M.arm3EndLong;
  loop(p3, J.arm3);
  wire(s3, l3, J.arm3, 0.006);
  b.part(new THREE.SphereGeometry(0.012, 5, 4), P.wireHighlight, { bone: J.arm3, at: [p3[0], p3[1] + 0.03, p3[2]] });
  bead(s3, J.arm3, 0.02);
  bead(l3, J.arm3, 0.02);
  loop([s3[0], s3[1] - 0.015, s3[2]], J.arm3);
  loop([l3[0], l3[1] - 0.015, l3[2]], J.arm3);

  // ---- yellow bean ----
  const beanTop = [s3[0], s3[1] - 0.4, s3[2]];
  wire([s3[0], s3[1] - 0.03, s3[2]], beanTop, J.arm3);
  b.part(new THREE.TorusGeometry(0.01, 0.002, 4, 8), P.wire, { bone: J.arm3, at: [beanTop[0], beanTop[1] - 0.008, beanTop[2]], dir: [1, 0, 0], axis: "z" });
  const bean = (s: number, d: number): any[] => {
    // kidney outline, hung from top; local y downward
    const o: any[] = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rx = 0.2 * s, ry = 0.1 * s;
      let x = Math.cos(a) * rx;
      let y = Math.sin(a) * ry - 0.1 * s;
      y += 0.035 * s * Math.cos(2 * a + 0) * 0 - 0.05 * s * Math.exp(-((x / (0.08 * s)) ** 2)) * (Math.sin(a) > 0 ? 1 : 0) * d;
      o.push([x, y]);
    }
    return o;
  };
  const bAt = [beanTop[0], beanTop[1] - 0.012, beanTop[2]];
  const yaw3 = -0.5;
  outlineExtrude(bean(1.18, 1), bAt, J.arm3, P.yellowDark, 0.61, 0.15, yaw3, 0.016);
  const front = outlineExtrude(bean(1.1, 1), [bAt[0], bAt[1] - 0.001, bAt[2]], J.arm3, P.yellow, 0.61, 0.15, yaw3, 0.02);
  void front;
  // highlight sliver
  const hl = [[-0.12, -0.08], [0.0, -0.06], [0.1, -0.09], [0.0, -0.075], [-0.1, -0.095]];
  outlineExtrude(hl, [bAt[0], bAt[1] - 0.01, bAt[2]], J.arm3, P.yellowLight, 0.61, 0.15, yaw3, 0.024);
  b.part(new THREE.TorusGeometry(0.008, 0.002, 4, 8), P.black, { bone: J.arm3, at: [bAt[0], bAt[1] + 0.003, bAt[2]], dir: [0, 0, 1], axis: "z" });

  // ---- wire down to arm5 ----
  wire([l3[0], l3[1] - 0.03, l3[2]], [M.arm5Pivot[0], M.arm5Pivot[1] + 0.016, M.arm5Pivot[2]], J.arm3);
  const p5 = M.arm5Pivot, b5 = M.arm5EndBack, f5 = M.arm5EndFront;
  loop(p5, J.arm5);

  // ---- arm5 ----
  wire(b5, f5, J.arm5, 0.006);
  bead(b5, J.arm5, 0.018);
  bead(f5, J.arm5, 0.018);
  loop([b5[0], b5[1] - 0.015, b5[2]], J.arm5);
  loop([f5[0], f5[1] - 0.015, f5[2]], J.arm5);

  // ---- blue disc ----
  const R = 0.27;
  const dTop = [b5[0], b5[1] - 0.2, b5[2]];
  wire([b5[0], b5[1] - 0.03, b5[2]], dTop, J.arm5);
  const dAt = [dTop[0], dTop[1] - 0.012, dTop[2]];
  b.part(new THREE.TorusGeometry(0.012, 0.0025, 4, 8), P.black, { bone: J.arm5, at: [dTop[0], dTop[1] - 0.004, dTop[2]], dir: [1, 0, 0], axis: "z" });
  const circ = (r: number, cy: number, n = 24) => {
    const o: any[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.push([Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return o;
  };
  const yawD = 1.0, tiltD = 0.35;
  outlineExtrude(circ(R, -R, 24), dAt, J.arm5, P.blueDark, 0.2, tiltD, yawD, 0.016);
  outlineExtrude(circ(R - 0.015, -R, 24), [dAt[0], dAt[1], dAt[2]], J.arm5, P.blue, 0.2, tiltD, yawD, 0.022);
  // highlight crescent
  const cres: any[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = 2.3 - (i / 6) * 1.2;
    cres.push([Math.cos(a) * (R - 0.04), -R + Math.sin(a) * (R - 0.04)]);
  }
  for (let i = 6; i >= 0; i--) {
    const a = 2.3 - (i / 6) * 1.2;
    cres.push([Math.cos(a) * (R - 0.09), -R + Math.sin(a) * (R - 0.09) - 0.0]);
  }
  outlineExtrude(cres, dAt, J.arm5, P.blueLight, 0.2, tiltD, yawD, 0.026);
  // printed ring
  outlineExtrude(circ(0.12, -R, 16), dAt, J.arm5, P.blueDark, 0.2, tiltD, yawD, 0.024);
  outlineExtrude(circ(0.1, -R, 16), dAt, J.arm5, P.blue, 0.2, tiltD, yawD, 0.0245);

  // ---- small black leaf ----
  const lTop = [f5[0], f5[1] - 0.35, f5[2]];
  wire([f5[0], f5[1] - 0.03, f5[2]], lTop, J.arm5);
  b.part(new THREE.TorusGeometry(0.01, 0.002, 4, 8), P.wire, { bone: J.arm5, at: [lTop[0], lTop[1] - 0.006, lTop[2]], dir: [1, 0, 0], axis: "z" });
  const leaf = (len: number, w: number, k = 1): any[] => {
    const o: any[] = [[0, 0, "sharp"]];
    const n = 5;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      o.push([w * k * Math.sin(Math.PI * t) * (1 - 0.3 * t), -len * t]);
    }
    o.push([0, -len, "sharp"]);
    for (let i = n - 1; i >= 1; i--) {
      const t = i / n;
      o.push([-w * k * Math.sin(Math.PI * t) * (1 - 0.3 * t), -len * t]);
    }
    return o;
  };
  const lAt = [lTop[0], lTop[1] - 0.01, lTop[2]];
  outlineExtrude(leaf(0.3, 0.06), lAt, J.arm5, P.black, -0.35, 0.1, 0.6, 0.014);
  outlineExtrude([[0.0, -0.03], [0.02, -0.1], [0.025, -0.2], [0.012, -0.2], [0.008, -0.1]], lAt, J.arm5, P.blackLight, -0.35, 0.1, 0.6, 0.018);
}
    return buildBranchRight;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  J["mobile"] = b.joint("mobile", { at: [0,2.6,0], dir: [0,1,0], role: "spine" });
  J["arm1"] = b.joint("arm1", { parent: J["mobile"], at: [0,2.25,0], dir: [1,0,0], role: "hinge", group: "crown" });
  J["arm2"] = b.joint("arm2", { parent: J["arm1"], at: [0.6,1.7,0], dir: [0.77,0,0.64], role: "hinge", group: "branchLeft" });
  J["arm3"] = b.joint("arm3", { parent: J["arm1"], at: [-0.95,1.55,0], dir: [0.87,0,-0.5], role: "hinge", group: "branchRight" });
  J["arm4"] = b.joint("arm4", { parent: J["arm2"], at: [1.29,0.9,0.58], dir: [0.94,0,-0.34], role: "hinge", group: "branchLeft" });
  J["arm5"] = b.joint("arm5", { parent: J["arm3"], at: [-0.38,0.75,-0.33], dir: [0.5,0,0.87], role: "hinge", group: "branchRight" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

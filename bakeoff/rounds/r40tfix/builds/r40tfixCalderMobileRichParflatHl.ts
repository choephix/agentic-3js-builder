import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Hanging Mobile",
  "description": "A Calder-style hanging mobile: black wire arms nested five tiers deep, balanced on solder knots, carrying flat painted sheet-metal discs and leaves in red, blue, yellow, black and white."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wire: "#2a2a2e",
  wireHighlight: "#6b6b72",
  solder: "#b88a3a",
  ceiling: "#d8d2c4",
  ceilingEdge: "#a8a194",
  red: "#d92b22",
  redDeep: "#9f1c17",
  blue: "#1f4fb0",
  blueDeep: "#163a85",
  yellow: "#f4c20d",
  yellowDeep: "#c99a08",
  black: "#17171a",
  blackDeep: "#0a0a0c",
  white: "#f3efe4",
  whiteDeep: "#cfc9b8",
};
const M = {
  ceilingPlate: [0, 2.4, 0] as [number, number, number],
  hookEye: [0, 2.3, 0] as [number, number, number],
  armAPivot: [0, 1.95, 0] as [number, number, number],
  armAEndR: [0.95, 1.95, 0.2] as [number, number, number],
  armAEndL: [-0.7, 1.95, -0.15] as [number, number, number],
  pivotB: [0.95, 1.4, 0.2] as [number, number, number],
  armBEnd1: [0.55, 1.4, 0.44] as [number, number, number],
  armBEnd2: [1.3, 1.4, -0.01] as [number, number, number],
  redDiscTop: [1.3, 1.1, -0.01] as [number, number, number],
  redDiscCenter: [1.3, 0.8, -0.01] as [number, number, number],
  pivotD: [0.55, 1, 0.44] as [number, number, number],
  armDEnd1: [0.25, 1, 0.34] as [number, number, number],
  armDEnd2: [0.85, 1, 0.55] as [number, number, number],
  leafBlackTop: [0.25, 0.88, 0.34] as [number, number, number],
  discYellowTop: [0.85, 0.9, 0.55] as [number, number, number],
  discYellowCenter: [0.85, 0.75, 0.55] as [number, number, number],
  pivotC: [-0.7, 1.2, -0.15] as [number, number, number],
  armCEnd1: [-1.5, 1.2, 0.25] as [number, number, number],
  armCEnd2: [-0.3, 1.2, -0.35] as [number, number, number],
  leafBlueTop: [-1.5, 0.85, 0.25] as [number, number, number],
  pivotE: [-0.3, 0.85, -0.35] as [number, number, number],
  armEEnd1: [-0.65, 0.85, -0.24] as [number, number, number],
  armEEnd2: [0.1, 0.85, -0.48] as [number, number, number],
  discWhiteTop: [-0.65, 0.7, -0.24] as [number, number, number],
  dropBlackTop: [0.1, 0.55, -0.48] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // crown
  (() => {
function buildCrown({ b, J, P, M }: Ctx) {
  const V = (p: number[], dx = 0, dy = 0, dz = 0): [number, number, number] => [p[0] + dx, p[1] + dy, p[2] + dz];

  const knot = (at: [number, number, number], bone: any, r = 0.016) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), P.solder, { at, bone });

  const hook = (at: [number, number, number], bone: any, r = 0.022, dir: [number, number, number] = [0, 0, 1]) =>
    b.part(new THREE.TorusGeometry(r, 0.004, 5, 12), P.wire, { at, bone, dir, axis: "z" });

  const wire = (a: any, c: any, r: number, bone: any, color = P.wire) => b.rod(a, c, r, color, { bone, sides: 6 });

  // Ceiling canopy
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.1, -0.012],
      [0.075, -0.03],
      [0.03, -0.04],
      [0, -0.04],
    ],
    { at: [0, 2.4, 0], bone: J.mobile, color: P.ceiling, segments: 24 },
  );
  b.part(new THREE.TorusGeometry(0.1, 0.007, 6, 28), P.ceilingEdge, {
    at: [0, 2.395, 0],
    bone: J.mobile,
    dir: [0, 1, 0],
    axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 8), P.ceilingEdge, { at: [0, 2.355, 0], bone: J.mobile });
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 6), P.wireHighlight, { at: [0, 2.35, 0], bone: J.mobile });

  // Hook eye and suspension wire
  hook(M.hookEye as any, J.mobile, 0.03, [1, 0, 0]);
  const top = V(M.hookEye, 0, -0.03);
  const piv = M.armAPivot as any;
  wire(top, piv, 0.0055, J.mobile);
  wire(V(M.hookEye, 0.004, -0.03), V(piv, 0.004, 0.02), 0.0015, J.mobile, P.wireHighlight);
  knot(top as any, J.mobile, 0.014);
  knot(V(piv, 0, 0.03), J.armA, 0.018);

  // Arm A
  const L = M.armAEndL as any;
  const R = M.armAEndR as any;
  wire(L, R, 0.0065, J.armA);
  wire(V(L, 0, 0.007), V(R, 0, 0.007), 0.0015, J.armA, P.wireHighlight);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 8), P.solder, { at: piv, bone: J.armA, dir: [1, 0, 0.2] });
  knot(piv, J.armA, 0.02);
  hook(R, J.armA, 0.022, [1, 0, 0.2]);
  hook(L, J.armA, 0.022, [1, 0, 0.2]);
  knot(R, J.armA, 0.014);
  knot(L, J.armA, 0.014);

  // Black bead counterweight near short end
  const bt = 0.12;
  const bead: [number, number, number] = [
    L[0] + (R[0] - L[0]) * bt,
    L[1] + (R[1] - L[1]) * bt,
    L[2] + (R[2] - L[2]) * bt,
  ];
  b.part(new THREE.SphereGeometry(0.03, 10, 8), P.black, { at: bead, bone: J.armA });
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.wireHighlight, { at: V(bead, 0.01, 0.015, 0.014), bone: J.armA });

  // Drops
  const drop = (from: any, to: any, bone: any) => {
    const a = V(from, 0, -0.03);
    const c = V(to, 0, 0.03);
    hook(V(from, 0, -0.022), bone, 0.02, [1, 0, 0.2]);
    wire(a, c, 0.0045, bone);
    wire(V(a, 0.004, 0, 0), V(c, 0.004, 0, 0), 0.0012, bone, P.wireHighlight);
    knot(V(from, 0, -0.045), bone, 0.011);
    knot(V(to, 0, 0.035), bone, 0.013);
  };
  drop(R, M.pivotB, J.armA);
  drop(L, M.pivotC, J.armA);
}
    return buildCrown;
  })(),
  // branchB
  (() => {
function buildBranchB({ b, J, P, M }: Ctx) {
  const WIRE = P.wire, HI = P.wireHighlight, SOL = P.solder;
  const arm = J.armB, disc = J.redDisc;
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  const knot = (p: number[], r: number, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), SOL, { bone, at: p });
  const loop = (p: number[], bone: any, r = 0.016, dir: number[] = [1, 0, 0]) =>
    b.part(new THREE.TorusGeometry(r, 0.004, 5, 12), WIRE, { bone, at: p, dir, axis: "z" });
  const wire = (a: number[], c: number[], bone: any, r = 0.0055) => {
    b.rod(a, c, r, WIRE, { bone, sides: 6 });
    const m = [(a[0] + c[0]) / 2 + 0.006, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2 + 0.006];
    const d = V(c).sub(V(a)).multiplyScalar(0.36);
    b.rod(V(m).sub(d), V(m).add(d), 0.0016, HI, { bone, sides: 4 });
  };

  // Arm B rod
  const e1 = M.armBEnd1, e2 = M.armBEnd2, pv = M.pivotB;
  wire(e1, e2, arm, 0.006);
  knot(pv, 0.016, arm);
  // loop at pivot taking crown wire
  loop([pv[0], pv[1] + 0.02, pv[2]], arm, 0.017, [0, 0, 1]);
  // end hook loops
  loop([e1[0] - 0.006, e1[1] - 0.008, e1[2] + 0.002], arm, 0.013, [0, 0, 1]);
  loop([e2[0] + 0.006, e2[1] - 0.008, e2[2] - 0.002], arm, 0.013, [0, 0, 1]);
  knot(e1, 0.009, arm);
  knot(e2, 0.009, arm);

  // Drop to arm D
  const dTop = [e1[0], e1[1] - 0.012, e1[2]];
  const dBot = [M.pivotD[0], M.pivotD[1] + 0.03, M.pivotD[2]];
  wire(dTop, dBot, arm);
  loop([dBot[0], dBot[1] - 0.004, dBot[2]], arm, 0.015, [1, 0, 0]);
  knot([dTop[0], dTop[1] - 0.01, dTop[2]], 0.007, arm);

  // Drop to red disc
  const rTop = M.redDiscTop;
  wire([e2[0], e2[1] - 0.012, e2[2]], [rTop[0], rTop[1] + 0.02, rTop[2]], arm);
  loop([rTop[0], rTop[1] + 0.014, rTop[2]], disc, 0.016, [0, 0, 1]);
  knot([rTop[0], rTop[1] + 0.03, rTop[2]], 0.007, arm);

  // Red disc, yawed 50 degrees, slight tilt
  const C = M.redDiscCenter;
  const yaw = 50 * Math.PI / 180;
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.05, yaw, 0.04, "YXZ"));
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
  const at = (x: number, y: number, z: number) =>
    V(C).add(new THREE.Vector3(x, y, z).applyQuaternion(q));
  const ring = (r: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 28; i++) pts.push([r * Math.cos(i / 28 * 6.2832), r * Math.sin(i / 28 * 6.2832)]);
    return pts;
  };
  const ex = new THREE.Vector3(1, 0, 0).applyQuaternion(q).toArray();
  const ey = new THREE.Vector3(0, 1, 0).applyQuaternion(q).toArray();
  b.extrude(ring(0.285), { at: at(0, 0, -0.012).toArray(), x: ex, y: ey, thickness: 0.015, bevel: 0.003, color: P.redDeep, bone: disc });
  b.extrude(ring(0.28), { at: at(0, 0, 0.0).toArray(), x: ex, y: ey, thickness: 0.015, bevel: 0.003, color: P.red, bone: disc });

  // white dot ring
  const front = 0.0095;
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.005, 8), P.white, {
      bone: disc, at: at(0.22 * Math.cos(a), 0.22 * Math.sin(a), front).toArray(), dir: n.toArray(),
    });
  }
  // black quarter-circle wedge near centre
  const wedge: [number, number, string?][] = [[0, 0]];
  for (let i = 0; i <= 8; i++) {
    const a = i / 8 * Math.PI / 2;
    wedge.push([0.11 * Math.cos(a), 0.11 * Math.sin(a)]);
  }
  b.extrude(wedge as any, { at: at(-0.04, -0.04, front).toArray(), x: ex, y: ey, thickness: 0.004, color: P.black, bone: disc });
  // wire-through eye at top of disc
  b.part(new THREE.TorusGeometry(0.012, 0.0035, 5, 10), WIRE, { bone: disc, at: at(0, 0.285, 0).toArray(), dir: n.toArray(), axis: "z" });
}
    return buildBranchB;
  })(),
  // branchD
  (() => {
function buildBranchD({ b, J, P, M }: Ctx) {
  const armD = J.armD, leafJ = J.leafBlack, discJ = J.discYellow;
  const e1 = M.armDEnd1, e2 = M.armDEnd2, pv = M.pivotD;
  const r = rng(11);

  const knot = (p: number[], bone: any, rad = 0.012) =>
    b.part(new THREE.SphereGeometry(rad, 8, 6), P.solder, { bone, at: p });
  const loop = (p: number[], bone: any, rad = 0.014, yaw = 0) =>
    b.part(new THREE.TorusGeometry(rad, 0.0035, 5, 12), P.wire, {
      bone, at: p, rotation: [0, yaw, 0],
    });
  const wire = (a: number[], c: number[], bone: any, rad = 0.0055) =>
    b.rod(a, c, rad, P.wire, { bone });

  // arm rod, pivot loop, ends
  wire(e1, e2, armD, 0.0065);
  b.rod([e1[0] + 0.03, e1[1] + 0.004, e1[2] + 0.003], [e2[0] - 0.03, e2[1] + 0.004, e2[2] - 0.003], 0.0016, P.wireHighlight, { bone: armD });
  knot(pv, armD, 0.016);
  loop([pv[0], pv[1] + 0.03, pv[2]], armD, 0.02, 90);
  wire([pv[0], pv[1] + 0.012, pv[2]], [pv[0], pv[1] + 0.035, pv[2]], armD, 0.004);
  for (const e of [e1, e2]) {
    knot(e, armD, 0.011);
    loop([e[0], e[1] - 0.015, e[2]], armD, 0.012, 90);
  }

  // helper: shape assembly with deep plate behind
  const plate = (outline: any[], at: number[], bone: any, yaw: number, tilt: number, main: string, deep: string, th: number, big = 1.0) => {
    const q = new THREE.Euler(tilt * Math.PI / 180, yaw * Math.PI / 180, 0.03, "YXZ");
    const qq = new THREE.Quaternion().setFromEuler(q);
    const xd = new THREE.Vector3(1, 0, 0).applyQuaternion(qq);
    const yd = new THREE.Vector3(0, 1, 0).applyQuaternion(qq);
    const zd = new THREE.Vector3(0, 0, 1).applyQuaternion(qq);
    const back = new THREE.Vector3(...at).addScaledVector(zd, -0.004);
    b.extrude(outline, { at: back.toArray(), x: xd.toArray(), y: yd.toArray(), thickness: th, bevel: 0.002, color: deep, bone });
    const top = b.extrude(outline.map((p: any) => [p[0] * 0.97, p[1] * 0.97 + (p[1] > 0 ? 0 : 0)]), {
      at: new THREE.Vector3(...at).addScaledVector(zd, 0.004).toArray(), x: xd.toArray(), y: yd.toArray(), thickness: th, bevel: 0.002, color: main, bone,
    });
    return { xd, yd, zd, qq };
  };
  const onFace = (g: THREE.BufferGeometry, col: string, at: number[], f: any, u: number, v: number, z: number, bone: any, rollDeg = 0) => {
    const p = new THREE.Vector3(...at).addScaledVector(f.xd, u).addScaledVector(f.yd, v).addScaledVector(f.zd, z);
    return b.part(g, col, { bone, at: p.toArray(), quat: f.qq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, rollDeg * Math.PI / 180))) });
  };

  // ---- black leaf ----
  const lt = M.leafBlackTop;
  const H = 0.48, W = 0.1;
  const dropL = 0.1;
  wire([e1[0], e1[1] - 0.025, e1[2]], [lt[0], lt[1] + 0.0, lt[2]], leafJ, 0.0045);
  loop([lt[0], lt[1] - 0.004, lt[2]], leafJ, 0.012, 90);
  const lc = [lt[0], lt[1] - 0.012 - H / 2, lt[2]];
  const leaf: any[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    leaf.push([W * Math.sin(Math.PI * t) * (1 - 0.25 * t), H / 2 - H * t, t === 0 ? "sharp" : undefined]);
  }
  const left: any[] = [];
  for (let i = n - 1; i >= 1; i--) {
    const t = i / n;
    left.push([-W * Math.sin(Math.PI * t) * (1 - 0.25 * t), H / 2 - H * t]);
  }
  const lo = [[0, H / 2, "sharp"], ...leaf.slice(1, n).map((p) => [p[0], p[1]]), [0, -H / 2, "sharp"], ...left.reverse().reverse()];
  const lf = plate(lo.map((p) => (p[2] ? [p[0], p[1], "sharp"] : [p[0], p[1]])), lc, leafJ, 70, 3, P.black, P.blackDeep, 0.014);
  onFace(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 12), P.white, lc, lf, 0, 0, 0.012, leafJ);
  onFace(new THREE.BoxGeometry(0.008, 0.3, 0.004), P.white, lc, lf, 0, 0.0, 0.0115, leafJ, 0);

  // ---- yellow disc ----
  const yt = M.discYellowTop;
  const R = 0.15;
  wire([e2[0], e2[1] - 0.025, e2[2]], yt, discJ, 0.0045);
  loop([yt[0], yt[1] - 0.004, yt[2]], discJ, 0.012, 90);
  const yc = [yt[0], yt[1] - 0.012 - R, yt[2]];
  const circ: any[] = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    circ.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  const yf = plate(circ, yc, discJ, -30, 4, P.yellow, P.yellowDeep, 0.014);
  // quarter-circle wedge
  const wedge: any[] = [[0, 0, "sharp"]];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    wedge.push([0.085 * Math.cos(a), 0.085 * Math.sin(a)]);
  }
  const wp = new THREE.Vector3(...yc).addScaledVector(yf.zd, 0.0125);
  b.extrude(wedge, { at: wp.toArray(), x: yf.xd.toArray(), y: yf.yd.toArray(), thickness: 0.003, color: P.black, bone: discJ });
  onFace(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 8), P.black, yc, yf, -0.075, -0.07, 0.0125, discJ);
}
    return buildBranchD;
  })(),
  // branchC
  (() => {
function buildBranchC({ b, J, P, M }: Ctx) {
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const wireR = 0.006;

  const knot = (p: THREE.Vector3 | number[], r = 0.016, bone: any = J.armC) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), P.solder, { bone, at: p as any });

  const hook = (p: THREE.Vector3 | number[], bone: any, dirv: number[] = [0, 0, 1], r = 0.016) =>
    b.part(new THREE.TorusGeometry(r, 0.0035, 5, 12), P.wire, { bone, at: p as any, dir: dirv as any, axis: "z" });

  const wire = (a: THREE.Vector3 | number[], c: THREE.Vector3 | number[], r = wireR, bone: any = J.armC) =>
    b.rod(a as any, c as any, r, P.wire, { bone, sides: 6 } as any);

  // Arm C
  const e1 = V(M.armCEnd1), e2 = V(M.armCEnd2), pv = V(M.pivotC);
  wire(e1, e2, 0.007);
  const hl = (a: THREE.Vector3, c: THREE.Vector3) => {
    const o = new THREE.Vector3(0, 0.004, 0.004);
    b.rod(a.clone().add(o), c.clone().add(o), 0.0016, P.wireHighlight, { bone: J.armC, sides: 4 } as any);
  };
  hl(e1, e2);
  for (const p of [e1, e2, pv]) knot(p, 0.017);
  hook(e1, J.armC, [1, 0, -0.5]);
  hook(e2, J.armC, [1, 0, -0.5]);
  // loop at pivot taking crown wire
  hook(pv.clone().add(new THREE.Vector3(0, 0.03, 0)), J.armC, [1, 0, 0.5], 0.02);
  knot(pv.clone().add(new THREE.Vector3(0, 0.055, 0)), 0.009);
  // mid collars
  const m1 = e1.clone().lerp(pv, 0.5);
  knot(m1, 0.01);

  // drop to pivotE
  const pe = V(M.pivotE);
  const eTop = pe.clone().add(new THREE.Vector3(0, 0.06, 0));
  hook(e2.clone().add(new THREE.Vector3(0, -0.03, 0)), J.armC, [1, 0, -0.5]);
  wire(e2.clone().add(new THREE.Vector3(0, -0.045, 0)), eTop.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.005);
  hook(eTop, J.armC, [1, 0, -0.5], 0.02);
  knot(eTop.clone().add(new THREE.Vector3(0, 0.03, 0)), 0.01);

  // drop to leaf
  const lt = V(M.leafBlueTop);
  hook(e1.clone().add(new THREE.Vector3(0, -0.03, 0)), J.armC, [1, 0, -0.5]);
  wire(e1.clone().add(new THREE.Vector3(0, -0.045, 0)), lt.clone().add(new THREE.Vector3(0, 0.02, 0)), 0.005);
  knot(lt.clone().add(new THREE.Vector3(0, 0.05, 0)), 0.01, J.leafBlue);
  hook(lt, J.leafBlue, [1, 0, 0], 0.018);

  // leaf plate: kidney-ish leaf hanging below leafBlueTop
  const H = 0.55, W = 0.34;
  const top = lt.y - 0.02;
  const outline: any[] = [
    [0, 0, "sharp"], [0.12, -0.06], [W / 2, -0.2], [W / 2 - 0.02, -0.38], [0.08, -0.5],
    [0, -H, "sharp"], [-0.1, -0.48], [-W / 2 + 0.03, -0.32], [-W / 2 + 0.02, -0.16], [-0.1, -0.05],
  ];
  const yaw = 20 * Math.PI / 180;
  const xdir: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const nrm = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const at = new THREE.Vector3(lt.x, top, lt.z);
  b.extrude(outline, { at: at.clone().addScaledVector(nrm, -0.004).toArray() as any, x: xdir, thickness: 0.018, bevel: 0.003, smoothing: 1, color: P.blueDeep, bone: J.leafBlue } as any);
  const plate = b.extrude(outline.map((p) => (p[2] ? [p[0] * 0.96, p[1] * 0.96 - 0.01, p[2]] : [p[0] * 0.96, p[1] * 0.96 - 0.01])) as any, { at: at.clone().addScaledVector(nrm, 0.006).toArray() as any, x: xdir, thickness: 0.016, bevel: 0.003, smoothing: 1, color: P.blue, bone: J.leafBlue } as any);

  // stripe and dots on front face
  const face = (u: number, v: number, o = 0.016) =>
    at.clone().addScaledVector(new THREE.Vector3(...xdir), u).add(new THREE.Vector3(0, v, 0)).addScaledVector(nrm, o);
  const stripe = [[-0.07, -0.12], [0.02, -0.22], [0.06, -0.33], [0.0, -0.43]];
  for (let i = 0; i < stripe.length - 1; i++) {
    b.rod(face(stripe[i][0], stripe[i][1]), face(stripe[i + 1][0], stripe[i + 1][1]), 0.009, P.white, { bone: J.leafBlue, sides: 5 } as any);
  }
  const rg = rng(5);
  const dots = [[0.08, -0.2], [0.09, -0.32], [-0.08, -0.3], [-0.04, -0.4]];
  for (const d of dots) {
    b.part(new THREE.SphereGeometry(0.014 + rg() * 0.006, 6, 4), P.white, { bone: J.leafBlue, at: face(d[0], d[1], 0.017) as any, scale: [1, 1, 0.4] } as any);
  }
  void frame; void plate;
}
    return buildBranchC;
  })(),
  // branchE
  (() => {
function buildBranchE({ b, J, P, M }: Ctx) {
  const r = rng(5);
  const wireR = 0.006;
  const knot = (p: number[], s = 0.014, bone: any = J.armE) =>
    b.part(new THREE.SphereGeometry(s, 8, 6), P.solder, { bone, at: p as any });
  const hook = (p: number[], bone: any, rad = 0.016) =>
    b.part(new THREE.TorusGeometry(rad, 0.003, 5, 12), P.wire, { bone, at: p as any, dir: [1, 0, 0], axis: "z" });

  // Arm E rod
  const a = M.armEEnd1, c = M.armEEnd2, pv = M.pivotE;
  b.rod(a, c, wireR, P.wire, { bone: J.armE });
  // gleam
  const hl = (p: number[]) => [p[0], p[1] + 0.005, p[2]];
  b.rod(hl(a), hl(c), 0.0015, P.wireHighlight, { bone: J.armE });
  knot(pv, 0.016);
  knot(a, 0.011);
  knot(c, 0.011);
  hook([pv[0], pv[1] + 0.02, pv[2]], J.armE, 0.02);
  hook(a, J.armE, 0.014);
  hook(c, J.armE, 0.014);
  // upper wire stub from pivot loop
  b.rod([pv[0], pv[1] + 0.02, pv[2]], [pv[0], pv[1] + 0.1, pv[2]], wireR * 0.8, P.wire, { bone: J.armE });
  // red bead near pivot
  const t = 0.3;
  const bp = [pv[0] + (a[0] - pv[0]) * t, pv[1], pv[2] + (a[2] - pv[2]) * t];
  b.part(new THREE.SphereGeometry(0.022, 10, 8), P.red, { bone: J.armE, at: bp as any });

  // drop helper
  const drop = (from: number[], to: number[], bone: any) => {
    b.rod(from, to, wireR, P.wire, { bone });
    hook([from[0], from[1] - 0.015, from[2]], bone, 0.013);
    hook([to[0], to[1] + 0.012, to[2]], bone, 0.013);
    knot(to, 0.009, bone);
  };

  const yawQ = (deg: number, tilt: number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler((tilt * Math.PI) / 180, (deg * Math.PI) / 180, 0.03));
  const plate = (outline: any[], at: number[], yaw: number, tilt: number, th: number, col: string, deepCol: string, bone: any, scale = 1.0) => {
    const q = yawQ(yaw, tilt);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    const x = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
    const y = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
    const deepOutline = outline.map((p) => [p[0] * 1.03, p[1] * 1.03 - (p[1] > 0 ? 0 : 0.002)]);
    const at3 = new THREE.Vector3(...(at as [number, number, number]));
    const deepAt = at3.clone().addScaledVector(fwd, -0.004 - th / 2);
    b.extrude(deepOutline as any, { at: deepAt.toArray() as any, x: x.toArray() as any, y: y.toArray() as any, thickness: th, bevel: 0.002, color: deepCol, bone });
    b.extrude(outline as any, { at: at3.toArray() as any, x: x.toArray() as any, y: y.toArray() as any, thickness: th, bevel: 0.002, color: col, bone });
    return { fwd, x, y, at: at3, th };
  };
  const circle = (rad: number, n = 20) =>
    Array.from({ length: n }, (_, i) => [Math.cos((i / n) * 6.2832) * rad, Math.sin((i / n) * 6.2832) * rad]);

  // White disc
  const wt = M.discWhiteTop;
  const wr = 0.12;
  drop([a[0], a[1] - 0.012, a[2]], wt, J.discWhite);
  const wc = [wt[0], wt[1] - 0.012 - wr, wt[2]];
  const w = plate(circle(wr), wc, 40, 3, 0.012, P.white, P.whiteDeep, J.discWhite);
  const face = w.at.clone().addScaledVector(w.fwd, 0.006 + 0.001);
  b.part(new THREE.TorusGeometry(0.075, 0.007, 5, 20), P.black, {
    bone: J.discWhite, at: face.toArray() as any, dir: w.fwd.toArray() as any, axis: "z",
  });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 10), P.black, {
    bone: J.discWhite, at: face.toArray() as any, dir: w.fwd.toArray() as any, axis: "y",
  });
  // hang hole hook on disc top
  b.part(new THREE.SphereGeometry(0.008, 6, 4), P.solder, { bone: J.discWhite, at: [wt[0], wt[1] - 0.01, wt[2]] });

  // Black teardrop
  const dt = M.dropBlackTop;
  drop([c[0], c[1] - 0.012, c[2]], dt, J.dropBlack);
  const H = 0.3, W = 0.085;
  const tear: number[][] = [[0, 0.0]];
  const n = 16;
  // round end at bottom, pointed top (y from 0 top down)
  const pts: number[][] = [[0, 0, ]];
  const cy = -(H - W);
  for (let i = 0; i <= n; i++) {
    const ang = Math.PI * 0.12 + (i / n) * (Math.PI * 2 - Math.PI * 0.24);
    pts.push([Math.sin(ang) * W, cy - Math.cos(ang) * W * 1.0 * -1 * -1 + 0]);
  }
  // build clean outline: apex then circle going around bottom
  const outline: any[] = [[0, 0, "sharp"]];
  for (let i = 0; i <= 14; i++) {
    const ang = -Math.PI * 0.42 + (i / 14) * (Math.PI * 1.84) ;
    outline.push([-Math.sin(ang + Math.PI * 0) * W * -1, cy - Math.cos(ang) * W * -1 * -1 - 0]);
  }
  // fall back to a simple hand-made teardrop for safety
  const td: any[] = [
    [0, 0, "sharp"], [0.035, -0.06], [0.07, -0.12], [W, -0.19], [0.075, -0.25], [0.04, -0.295],
    [0, -H], [-0.04, -0.295], [-0.075, -0.25], [-W, -0.19], [-0.07, -0.12], [-0.035, -0.06],
  ];
  const tc = [dt[0], dt[1] - 0.012, dt[2]];
  const d = plate(td, tc, -60, 3, 0.014, P.black, P.blackDeep, J.dropBlack);
  const df = d.at.clone().addScaledVector(d.y, -0.19).addScaledVector(d.fwd, 0.007 + 0.001);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 10), P.white, {
    bone: J.dropBlack, at: df.toArray() as any, dir: d.fwd.toArray() as any, axis: "y",
  });
  r();
}
    return buildBranchE;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  J["mobile"] = b.joint("mobile", { at: [0,2.35,0], dir: [0,1,0], role: "spine" });
  J["armA"] = b.joint("armA", { parent: J["mobile"], at: [0,1.95,0], dir: [1,0,0.2], role: "hinge", group: "armA" });
  J["armB"] = b.joint("armB", { parent: J["armA"], at: [0.95,1.4,0.2], dir: [0.7,0,-0.42], role: "hinge", group: "branchB" });
  J["redDisc"] = b.joint("redDisc", { parent: J["armB"], at: [1.3,1.1,-0.01], dir: [0,-1,0], role: "hinge", group: "branchB" });
  J["armD"] = b.joint("armD", { parent: J["armB"], at: [0.55,1,0.44], dir: [0.6,0,0.21], role: "hinge", group: "branchD" });
  J["leafBlack"] = b.joint("leafBlack", { parent: J["armD"], at: [0.25,0.88,0.34], dir: [0,-1,0], role: "hinge", group: "branchD" });
  J["discYellow"] = b.joint("discYellow", { parent: J["armD"], at: [0.85,0.9,0.55], dir: [0,-1,0], role: "hinge", group: "branchD" });
  J["armC"] = b.joint("armC", { parent: J["armA"], at: [-0.7,1.2,-0.15], dir: [-0.8,0,0.4], role: "hinge", group: "branchC" });
  J["leafBlue"] = b.joint("leafBlue", { parent: J["armC"], at: [-1.5,0.85,0.25], dir: [0,-1,0], role: "hinge", group: "branchC" });
  J["armE"] = b.joint("armE", { parent: J["armC"], at: [-0.3,0.85,-0.35], dir: [0.4,0,-0.13], role: "hinge", group: "branchE" });
  J["discWhite"] = b.joint("discWhite", { parent: J["armE"], at: [-0.65,0.7,-0.24], dir: [0,-1,0], role: "hinge", group: "branchE" });
  J["dropBlack"] = b.joint("dropBlack", { parent: J["armE"], at: [0.1,0.55,-0.48], dir: [0,-1,0], role: "hinge", group: "branchE" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

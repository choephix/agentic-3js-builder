import * as THREE from "three";
import { createBuilder, type Builder, type Joint, aim, rng, catmull } from "../../../../src/index";
import { gearGeometry } from "../../../../kits/clockwork";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Strandbeest Windwalker",
  "description": "A Theo Jansen-style kinetic beach creature: yellow PVC-tube lattice body on two crankshafts, eight Jansen-linkage legs, bottle-and-cloth wind wings, a bottle-eyed head with a split jaw and a windvane tail."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  pvcYellow: "#e8c32a",
  pvcYellowDark: "#b8921a",
  pvcYellowLight: "#f6dc62",
  jointBlack: "#25262c",
  zipBlack: "#15161a",
  tapeBlue: "#2a6fb0",
  steel: "#8d949e",
  brass: "#c79b3a",
  bottleBlue: "#a8d8e8",
  bottleBlueDeep: "#6fb4cf",
  capBlue: "#2d7fb8",
  capOrange: "#f08a24",
  sailWhite: "#f4f1e6",
  sailShade: "#dcdccf",
  rope: "#c9a66b",
  sandPad: "#d9c18e",
  sandDark: "#b89e68",
  eyeWhite: "#fff6d8",
  pupil: "#1b1d22",
  accentRed: "#d9482b",
};
const M = {
  crankF: [0, 1.2, 1] as [number, number, number],
  crankR: [0, 1.2, -1] as [number, number, number],
  pivotF: [0, 1.28, 0.62] as [number, number, number],
  pivotR: [0, 1.28, -1.38] as [number, number, number],
  railL: [0.25, 1.45, 0] as [number, number, number],
  railR: [-0.25, 1.45, 0] as [number, number, number],
  spineTop: [0, 1.95, 0] as [number, number, number],
  wingRootL: [0.45, 1.95, 0] as [number, number, number],
  wingRootR: [-0.45, 1.95, 0] as [number, number, number],
  wingTipL: [1.3, 2.25, 0] as [number, number, number],
  wingTipR: [-1.3, 2.25, 0] as [number, number, number],
  headBase: [0, 1.65, 1.75] as [number, number, number],
  tailBase: [0, 1.65, -1.75] as [number, number, number],
  bellyBankCenter: [0, 1.25, 0] as [number, number, number],
  legPlaneXs: [0.5, 1, -0.5, -1] as number[],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // frame
  (() => {
function buildFrame({ b, J, P, M }: any) {
  const body = J.body;
  const crankF = J.crankF;
  const crankR = J.crankR;
  const R = rng(11);

  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const ONE = new THREE.Vector3(1, 1, 1);

  // ---------------------------------------------------------------------------------------------
  // Merge buckets: many small static pieces of one colour on one bone become one part.
  type Bucket = { geos: THREE.BufferGeometry[]; color: string; bone: any };
  const buckets = new Map<string, Bucket>();
  const put = (
    geo: THREE.BufferGeometry,
    color: string,
    bone: any,
    pos: THREE.Vector3,
    quat?: THREE.Quaternion,
    scale?: THREE.Vector3,
  ) => {
    const m = new THREE.Matrix4().compose(pos, quat ?? new THREE.Quaternion(), scale ?? ONE);
    geo.applyMatrix4(m);
    const key = `${bone.name}|${color}`;
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { geos: [], color, bone }));
    bk.geos.push(geo);
  };

  // ---------------------------------------------------------------------------------------------
  // Helpers
  const rod = (a: number[], to: number[], r: number, color: string = P.pvcYellow, bone: any = body, sides = 6) =>
    b.rod(a, to, r, color, { bone, sides });

  const ball = (p: number[], r = 0.045, color: string = P.jointBlack, bone: any = body) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, bone, V(p));

  const ring = (p: number[], dir: number[], rad: number, len: number, color: string, bone: any = body) =>
    put(new THREE.CylinderGeometry(rad, rad, len, 8, 1), color, bone, V(p), aim(V(dir).normalize()));

  const tape = (p: number[], dir: number[], tubeR: number, len = 0.05, color: string = P.tapeBlue, bone: any = body) =>
    ring(p, dir, tubeR + 0.005, len, color, bone);

  // zip tie: thin black ring with a little locking head on one side
  const tie = (p: number[], dir: number[], tubeR: number, bone: any = body) => {
    const d = V(dir).normalize();
    ring(p, [d.x, d.y, d.z], tubeR + 0.006, 0.012, P.zipBlack, bone);
    const ref = Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const perp = new THREE.Vector3().crossVectors(d, ref).normalize().applyAxisAngle(d, R() * Math.PI * 2);
    put(
      new THREE.BoxGeometry(0.018, 0.014, 0.018),
      P.zipBlack,
      bone,
      V(p).addScaledVector(perp, tubeR + 0.009),
      aim(d),
    );
  };
  const tiePair = (p: number[], dir: number[], tubeR: number, gap: number, bone: any = body) => {
    const d = V(dir).normalize();
    for (const k of [-1, 1]) {
      const q = V(p).addScaledVector(d, k * gap);
      tie([q.x, q.y, q.z], dir, tubeR, bone);
    }
  };
  const lerp3 = (a: number[], c: number[], t: number) => [
    a[0] + (c[0] - a[0]) * t,
    a[1] + (c[1] - a[1]) * t,
    a[2] + (c[2] - a[2]) * t,
  ];
  const dirOf = (a: number[], c: number[]) => {
    const d = V(c).sub(V(a)).normalize();
    return [d.x, d.y, d.z];
  };

  // ---------------------------------------------------------------------------------------------
  // Coordinates
  const RAIL_X = 0.25;
  const RAIL_Y = 1.45;
  const SPINE_Y = 1.95;
  const railPt = (s: number, z: number) => [s * RAIL_X, RAIL_Y, z];
  const spinePt = (z: number) => [0, SPINE_Y, z];
  const railNodesZ = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];
  const spineNodesZ = [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25];

  // (1) lower rails
  for (const s of [1, -1]) {
    rod(railPt(s, -1.7), railPt(s, 1.7), 0.03, P.pvcYellow, body, 8);
    for (const z of [-1.7, 1.7]) ball(railPt(s, z), 0.045);
    for (let k = 0; k < 6; k++) tape(railPt(s, -1.25 + 0.5 * k), [0, 0, 1], 0.03, 0.06);
    for (const z of railNodesZ) {
      ball(railPt(s, z), 0.045);
      tiePair(railPt(s, z), [0, 0, 1], 0.03, 0.075);
    }
  }

  // (2) spine
  rod(spinePt(-1.5), spinePt(1.5), 0.03, P.pvcYellow, body, 8);
  for (const z of [-1.5, 1.5]) ball(spinePt(z), 0.045);
  for (const z of spineNodesZ) {
    ball(spinePt(z), 0.045);
    tiePair(spinePt(z), [0, 0, 1], 0.03, 0.075);
  }
  for (const z of [-1.0, 0, 1.0]) tape(spinePt(z), [0, 0, 1], 0.03, 0.06);

  // (3) zig-zag W lattice: 12 braces per side
  for (const s of [1, -1]) {
    const pts: number[][] = [];
    for (let i = 0; i <= 12; i++) {
      const z = -1.5 + 0.25 * i;
      pts.push(i % 2 === 0 ? railPt(s, z) : spinePt(z));
    }
    for (let i = 0; i < 12; i++) {
      rod(pts[i], pts[i + 1], 0.02, P.pvcYellow, body, 6);
      if (i % 4 === 1) tape(lerp3(pts[i], pts[i + 1], 0.5), dirOf(pts[i], pts[i + 1]), 0.02, 0.045);
      if (i % 2 === 0) tie(lerp3(pts[i], pts[i + 1], 0.22), dirOf(pts[i], pts[i + 1]), 0.02);
    }
  }

  // cross-ties between the rails at every rail node, with centre balls
  for (const z of railNodesZ) {
    rod([-RAIL_X, RAIL_Y, z], [RAIL_X, RAIL_Y, z], 0.02, P.pvcYellow, body, 6);
    ball([0, RAIL_Y, z], 0.036);
    tape([0, RAIL_Y, z + 0.0], [1, 0, 0], 0.02, 0.04);
  }
  for (const z of [-1.7, 1.7]) {
    rod([-RAIL_X, RAIL_Y, z], [RAIL_X, RAIL_Y, z], 0.02, P.pvcYellow, body, 6);
    ball([0, RAIL_Y, z], 0.036);
  }
  // floor-plane diagonals
  for (let k = 0; k < railNodesZ.length - 1; k++) {
    const s = k % 2 === 0 ? 1 : -1;
    rod(railPt(s, railNodesZ[k]), railPt(-s, railNodesZ[k + 1]), 0.015, P.pvcYellowDark, body, 6);
  }
  // king posts from cross-ties up to the spine
  for (const z of [-1.0, 0, 1.0]) {
    rod([0, RAIL_Y, z], [0, SPINE_Y, z], 0.02, P.pvcYellowLight, body, 6);
    ball([0, SPINE_Y, z], 0.04);
    tie([0, 1.7, z], [0, 1, 0], 0.02);
  }
  // spine end flare
  for (const e of [1, -1])
    for (const s of [1, -1]) rod(spinePt(e * 1.5), railPt(s, e * 1.5), 0.02, P.pvcYellow, body, 6);

  // (4) converging truss to the head and tail mounts
  const ends: [number, number[]][] = [
    [1, M.headBase],
    [-1, M.tailBase],
  ];
  for (const [e, mount] of ends) {
    for (const s of [1, -1]) rod(railPt(s, e * 1.7), mount, 0.025, P.pvcYellow, body, 8);
    rod(spinePt(e * 1.5), mount, 0.025, P.pvcYellow, body, 8);
    ball(mount, 0.055);
    const mid = lerp3(spinePt(e * 1.5), mount, 0.5);
    tape(mid, dirOf(spinePt(e * 1.5), mount), 0.025, 0.05, P.accentRed);
    for (const s of [1, -1]) {
      const rm = lerp3(railPt(s, e * 1.7), mount, 0.45);
      tie(rm, dirOf(railPt(s, e * 1.7), mount), 0.025);
    }
  }

  // (5) crankshafts, bearings, posts
  const cranks: [any, number][] = [
    [crankF, M.crankF[2]],
    [crankR, M.crankR[2]],
  ];
  const sprocket = gearGeometry({ teeth: 20, radius: 0.1, thickness: 0.024, bore: 0.02, holes: 5 });
  void sprocket;
  for (const [cb, z] of cranks) {
    rod([-1.22, 1.2, z], [1.22, 1.2, z], 0.025, P.steel, cb, 8);
    for (const s of [1, -1]) {
      // brass end knob and collar
      put(new THREE.SphereGeometry(0.035, 8, 6), P.brass, cb, V([s * 1.21, 1.2, z]));
      put(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), P.brass, cb, V([s * 1.165, 1.2, z]), aim([1, 0, 0]));
      // steel collars each side of the bearing
      for (const x of [0.18, 0.32])
        put(new THREE.CylinderGeometry(0.036, 0.036, 0.02, 8), P.steel, cb, V([s * x, 1.2, z]), aim([1, 0, 0]));
      // red tape ring at the shaft centre, either side of the sprocket
      put(new THREE.CylinderGeometry(0.031, 0.031, 0.03, 8), P.accentRed, cb, V([s * 0.05, 1.2, z]), aim([1, 0, 0]));
      // bearing block, post, and braces to the rail
      put(new THREE.BoxGeometry(0.09, 0.12, 0.12), P.jointBlack, body, V([s * RAIL_X, 1.2, z]));
      rod([s * RAIL_X, 1.25, z], railPt(s, z), 0.02, P.pvcYellow, body, 6);
      for (const dz of [-0.5, 0.5]) rod([s * RAIL_X, 1.23, z], railPt(s, z + dz), 0.018, P.pvcYellowDark, body, 6);
      tape([s * RAIL_X, 1.34, z], [0, 1, 0], 0.02, 0.04);
      tie([s * RAIL_X, 1.39, z], [0, 1, 0], 0.02);
    }
    b.part(gearGeometry({ teeth: 20, radius: 0.1, thickness: 0.024, bore: 0.02, holes: 5 }), P.steel, {
      bone: cb,
      at: [0, 1.2, z],
      dir: [1, 0, 0],
    });
  }

  // (6) pivot axles
  const pivots = [M.pivotF[2], M.pivotR[2]];
  for (const z of pivots) {
    rod([-1.12, 1.28, z], [1.12, 1.28, z], 0.02, P.pvcYellow, body, 6);
    for (const s of [1, -1]) {
      put(new THREE.CylinderGeometry(0.027, 0.027, 0.035, 8), P.pvcYellowDark, body, V([s * 1.125, 1.28, z]), aim([1, 0, 0]));
      rod([s * RAIL_X, 1.28, z], railPt(s, z), 0.02, P.pvcYellow, body, 6);
      ball([s * RAIL_X, 1.28, z], 0.036);
      ball(railPt(s, z), 0.036);
    }
    for (const x of M.legPlaneXs as number[]) {
      tape([x, 1.28, z], [1, 0, 0], 0.02, 0.05);
      tiePair([x, 1.28, z], [1, 0, 0], 0.02, 0.04);
    }
  }

  // (7) drive chain loop in the plane x = 0 between the sprockets
  const CR = 0.105;
  const zF = M.crankF[2];
  const zR = M.crankR[2];
  type Link = { p: THREE.Vector3; d: THREE.Vector3 };
  const links: Link[] = [];
  const N = 46;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    links.push({ p: V([0, 1.2 + CR, zF - t * (zF - zR)]), d: V([0, 0, -1]) });
  }
  const m = 8;
  for (let j = 0; j < m; j++) {
    const ph = ((j + 0.5) / m) * Math.PI;
    links.push({
      p: V([0, 1.2 + CR * Math.cos(ph), zR - CR * Math.sin(ph)]),
      d: V([0, -Math.sin(ph), -Math.cos(ph)]),
    });
  }
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    links.push({ p: V([0, 1.2 - CR, zR + t * (zF - zR)]), d: V([0, 0, 1]) });
  }
  for (let j = 0; j < m; j++) {
    const ph = ((j + 0.5) / m) * Math.PI;
    links.push({
      p: V([0, 1.2 - CR * Math.cos(ph), zF + CR * Math.sin(ph)]),
      d: V([0, Math.sin(ph), Math.cos(ph)]),
    });
  }
  links.forEach((l, i) => {
    const outer = i % 2 === 0;
    put(
      new THREE.BoxGeometry(outer ? 0.022 : 0.012, 0.036, outer ? 0.011 : 0.014),
      outer ? P.zipBlack : P.steel,
      body,
      l.p,
      aim(l.d),
    );
  });

  // (8) sail-mast stubs with hinge blocks at the wing roots
  const rootL = M.wingRootL;
  for (const s of [1, -1]) {
    const root = [s * rootL[0], rootL[1], rootL[2]];
    const base = [s * 0.22, 1.87, 0];
    rod(spinePt(0), base, 0.025, P.pvcYellow, body, 6);
    rod(base, root, 0.03, P.pvcYellow, body, 8);
    rod(railPt(s, 0), base, 0.02, P.pvcYellowLight, body, 6);
    ball(base, 0.04);
    tape(lerp3(base, root, 0.45), dirOf(base, root), 0.03, 0.045);
    tie(lerp3(base, root, 0.75), dirOf(base, root), 0.03);
    tie(lerp3(railPt(s, 0), base, 0.5), [0, 1, 0], 0.02);
    // hinge block, aligned with the wing dihedral, and a brass pin
    const wd = V([s * 0.86, 0.35, 0]).normalize();
    put(new THREE.BoxGeometry(0.05, 0.1, 0.16), P.jointBlack, body, V(root), aim(wd));
    put(new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8), P.brass, body, V(root), aim([0, 0, 1]));
    for (const z of [-0.115, 0.115])
      put(new THREE.SphereGeometry(0.02, 6, 4), P.brass, body, V([root[0], root[1], z]));
  }

  // ---------------------------------------------------------------------------------------------
  // Flush merged parts
  for (const [key, bk] of buckets) {
    const merged = mergeGeometries(bk.geos, false);
    if (!merged) throw new Error(`frame: could not merge ${key}`);
    b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], flat: true, name: `frame.${key}`, group: "frame" });
  }
}
    return buildFrame;
  })(),
  // legsFront
  (() => {
function buildLegsFront({ b, J, P }: Ctx) {
  // ---- leg-local linkage (u = world z offset, v = world y offset from y = 1.2) ----
  const N: Record<string, [number, number]> = {
    C: [0, 0],
    Cp: [0.1, -0.11],
    P: [-0.38, 0.08],
    A: [-0.35, -0.33],
    D: [-0.62, -0.17],
    K: [-0.52, -0.6],
    E: [0.18, -0.62],
    F: [-0.14, -0.91],
    T: [0.12, -1.12],
  };
  const LAYER = 0.04;

  // ---- merged small parts: one part per bone and colour ----
  type Acc = { geos: THREE.BufferGeometry[]; bone: string; color: string };
  const acc = new Map<string, Acc>();
  const put = (geo: THREE.BufferGeometry, color: string, bone: string) => {
    const key = bone + "|" + color;
    let a = acc.get(key);
    if (!a) acc.set(key, (a = { geos: [], bone, color }));
    a.geos.push(geo);
  };
  const ball = (r: number, p: number[], color: string, bone: string) =>
    put(new THREE.SphereGeometry(r, 8, 6).translate(p[0], p[1], p[2]), color, bone);
  const cylX = (r: number, len: number, p: number[], color: string, bone: string, sides = 10) =>
    put(new THREE.CylinderGeometry(r, r, len, sides).rotateZ(Math.PI / 2).translate(p[0], p[1], p[2]), color, bone);

  // a thin tie / ring whose axis follows a rod direction in the (z, y) plane
  const ringOn = (
    kind: "box" | "cyl",
    size: number[],
    p: number[],
    dz: number,
    dy: number,
    color: string,
    bone: string,
  ) => {
    let g: THREE.BufferGeometry;
    if (kind === "box") g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    else g = new THREE.CylinderGeometry(size[0], size[0], size[1], 10).rotateX(Math.PI / 2);
    g.rotateX(Math.atan2(-dy, dz)).translate(p[0], p[1], p[2]);
    put(g, color, bone);
  };

  const legs = [
    { side: "L", idx: 0, x: 0.5 },
    { side: "L", idx: 1, x: 1.0 },
    { side: "R", idx: 0, x: -0.5 },
    { side: "R", idx: 1, x: -1.0 },
  ];

  for (const leg of legs) {
    const { x } = leg;
    const s = Math.sign(x);
    const hipName = `hipF${leg.side}${leg.idx}`;
    const shankName = `shankF${leg.side}${leg.idx}`;
    const hip = J[hipName];
    const shank = J[shankName];
    const bn = { h: hipName, s: shankName } as const;
    const bj = { h: hip, s: shank } as const;

    const w = (k: string, layer = 0): number[] => [x + s * LAYER * layer, 1.2 + N[k][1], 1.0 + N[k][0]];
    const lerp3 = (a: number[], c: number[], t: number) => [
      a[0] + (c[0] - a[0]) * t,
      a[1] + (c[1] - a[1]) * t,
      a[2] + (c[2] - a[2]) * t,
    ];

    // F lies on the K-T line: split the shank there
    const rods: { a: string; c: string; layer: number; bone: "h" | "s"; r: number; color: string }[] = [
      { a: "C", c: "Cp", layer: 1, bone: "h", r: 0.022, color: P.brass },
      { a: "P", c: "A", layer: 0, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "Cp", c: "A", layer: 1, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "P", c: "D", layer: 0, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "A", c: "D", layer: 0, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "D", c: "K", layer: 0, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "A", c: "K", layer: 0, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "Cp", c: "E", layer: 1, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "A", c: "E", layer: 0, bone: "h", r: 0.018, color: P.pvcYellow },
      { a: "K", c: "F", layer: 0, bone: "h", r: 0.022, color: P.pvcYellowLight },
      { a: "F", c: "T", layer: 0, bone: "s", r: 0.022, color: P.pvcYellowLight },
      { a: "E", c: "F", layer: 1, bone: "s", r: 0.018, color: P.pvcYellow },
      { a: "E", c: "T", layer: 1, bone: "s", r: 0.018, color: P.pvcYellow },
    ];

    for (const r of rods) {
      const pa = w(r.a, r.layer);
      const pc = w(r.c, r.layer);
      b.rod(pa, pc, r.r, r.color, { bone: bj[r.bone], caps: "flat" });
      // zip ties near both ends of longer rods
      const dz = pc[2] - pa[2];
      const dy = pc[1] - pa[1];
      const len = Math.hypot(dz, dy);
      if (len > 0.2) {
        const ez = dz / len;
        const ey = dy / len;
        for (const d of [0.095, len - 0.095]) {
          const p = [pa[0], pa[1] + ey * d, pa[2] + ez * d];
          ringOn("box", [0.055, 0.055, 0.012], p, ez, ey, P.zipBlack, bn[r.bone]);
        }
      }
    }

    // ball joints at every node
    const big = new Set(["P", "Cp", "K"]);
    for (const k of Object.keys(N)) {
      if (k === "C") continue;
      const owner = k === "F" || k === "T" ? "s" : "h";
      ball(big.has(k) ? 0.04 : 0.032, w(k), P.jointBlack, bn[owner]);
    }
    // outer-layer balls and steel pins linking the two layers
    for (const k of ["Cp", "A", "E", "F", "T"]) {
      const owner = k === "F" || k === "T" ? "s" : "h";
      ball(0.028, w(k, 1), P.jointBlack, bn[owner]);
      if (k !== "Cp") cylX(0.01, LAYER + 0.03, lerp3(w(k, 0), w(k, 1), 0.5), P.steel, bn[owner], 6);
    }

    // crank hub on the shaft + brass pin
    cylX(0.06, 0.08, [x + s * 0.02, 1.2, 1.0], P.steel, bn.h, 12);
    cylX(0.03, 0.02, [x + s * 0.07, 1.2, 1.0], P.brass, bn.h, 8);
    cylX(0.014, 0.13, [x + s * 0.02, w("Cp")[1], w("Cp")[2]], P.brass, bn.h, 8);
    cylX(0.026, 0.016, [x + s * 0.082, w("Cp")[1], w("Cp")[2]], P.brass, bn.h, 8);

    // ties at pivot / hub nodes (small blocks wrapped on the balls)
    for (const k of ["P", "K", "D", "A"]) {
      const p = w(k);
      put(new THREE.BoxGeometry(0.07, 0.016, 0.016).translate(p[0], p[1] + 0.04, p[2]), P.zipBlack, bn.h);
    }

    // ---- foot ----
    const T = w("T");
    ball(0.08, T, P.sandPad, bn.s);
    put(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 10).translate(T[0], 0.015, T[2]), P.sandDark, bn.s);
    put(new THREE.CylinderGeometry(0.052, 0.062, 0.03, 10).translate(T[0], 0.035, T[2]), P.sandDark, bn.s);

    // shank direction T -> F (in z, y)
    const Fp = w("F");
    const sdz = Fp[2] - T[2];
    const sdy = Fp[1] - T[1];
    const sl = Math.hypot(sdz, sdy);
    const uz = sdz / sl;
    const uy = sdy / sl;
    const along = (d: number) => [x, T[1] + uy * d, T[2] + uz * d];
    ringOn("cyl", [0.036, 0.034], along(0.115), uz, uy, P.capOrange, bn.s);
    ringOn("cyl", [0.03, 0.075], along(0.225), uz, uy, P.tapeBlue, bn.s);
    ringOn("cyl", [0.026, 0.012], along(0.285), uz, uy, P.zipBlack, bn.s);
  }

  for (const a of acc.values()) {
    const merged = mergeGeometries(a.geos);
    if (merged) b.part(merged, a.color, { bone: J[a.bone], at: [0, 0, 0] });
  }
}
    return buildLegsFront;
  })(),
  // legsRear
  (() => {
function buildLegsRear({ b, J, P }: Ctx) {
  // Leg-local (u, v) -> world: [x, 1.2 + v, -1.0 + u]
  const N: Record<string, [number, number]> = {
    C: [0, 0],
    Cp: [0.1, -0.11],
    P: [-0.38, 0.08],
    A: [-0.35, -0.33],
    D: [-0.62, -0.17],
    K: [-0.52, -0.6],
    E: [0.18, -0.62],
    F: [-0.14, -0.91],
    T: [0.12, -1.12],
  };

  // Merge geometry per (bone, colour) to stay inside the part budget.
  const bins = new Map<string, { bone: any; color: string; geos: THREE.BufferGeometry[] }>();
  const add = (bone: any, color: string, geo: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    let bin = bins.get(key);
    if (!bin) bins.set(key, (bin = { bone, color, geos: [] }));
    bin.geos.push(geo);
  };

  const rodGeo = (a: THREE.Vector3, c: THREE.Vector3, r: number) => {
    const d = c.clone().sub(a);
    const g = new THREE.CylinderGeometry(r, r, d.length(), 7, 1, false);
    g.applyQuaternion(aim(d));
    const m = a.clone().add(c).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    return g;
  };
  const ball = (p: THREE.Vector3, r: number) => {
    const g = new THREE.SphereGeometry(r, 6, 4);
    g.translate(p.x, p.y, p.z);
    return g;
  };
  const collar = (a: THREE.Vector3, c: THREE.Vector3, t: number) => {
    const d = c.clone().sub(a);
    const g = new THREE.BoxGeometry(0.052, 0.012, 0.052);
    g.applyQuaternion(aim(d));
    const p = a.clone().lerp(c, t);
    g.translate(p.x, p.y, p.z);
    return g;
  };
  const along = (p: THREE.Vector3, dir: THREE.Vector3, g: THREE.BufferGeometry) => {
    g.applyQuaternion(aim(dir));
    g.translate(p.x, p.y, p.z);
    return g;
  };

  const planes: [number, string, number][] = [
    [0.5, "L", 0],
    [1.0, "L", 1],
    [-0.5, "R", 0],
    [-1.0, "R", 1],
  ];

  for (const [x, side, i] of planes) {
    const s = x > 0 ? 1 : -1;
    const off = 0.04 * s;
    const hip = J[`hipR${side}${i}`];
    const shank = J[`shankR${side}${i}`];
    const pt = (n: string, outer = false) =>
      new THREE.Vector3(x + (outer ? off : 0), 1.2 + N[n][1], -1.0 + N[n][0]);

    // rods: name, from, to, radius, colour, outer layer, bone
    type Rod = [string, string, string, number, string, boolean, any];
    const Y = P.pvcYellow;
    const rods: Rod[] = [
      ["crank", "C", "Cp", 0.022, P.brass, true, hip],
      ["PA", "P", "A", 0.018, Y, false, hip],
      ["CpA", "Cp", "A", 0.018, Y, true, hip],
      ["PD", "P", "D", 0.018, Y, false, hip],
      ["AD", "A", "D", 0.018, Y, false, hip],
      ["DK", "D", "K", 0.018, Y, false, hip],
      ["AK", "A", "K", 0.018, Y, false, hip],
      ["CpE", "Cp", "E", 0.018, Y, true, hip],
      ["AE", "A", "E", 0.018, Y, false, hip],
      ["KF", "K", "F", 0.022, P.pvcYellowLight, false, hip],
      ["FT", "F", "T", 0.022, P.pvcYellowLight, false, shank],
      ["EF", "E", "F", 0.018, Y, true, shank],
      ["ET", "E", "T", 0.018, Y, true, shank],
    ];
    const ends: Record<string, [THREE.Vector3, THREE.Vector3]> = {};
    for (const [name, a, c, r, col, outer, bone] of rods) {
      const pa = pt(a, outer);
      const pc = pt(c, outer);
      ends[name] = [pa, pc];
      add(bone, col, rodGeo(pa, pc, r));
    }

    // zip-tie collars on rods
    const ties: [string, number][] = [
      ["PA", 0.2], ["PD", 0.2], ["AD", 0.5], ["DK", 0.5], ["AK", 0.55],
      ["CpA", 0.5], ["CpE", 0.5], ["AE", 0.5], ["KF", 0.5], ["EF", 0.5],
    ];
    for (const [name, t] of ties) {
      const bone = rods.find((r) => r[0] === name)![6];
      add(bone, P.zipBlack, collar(ends[name][0], ends[name][1], t));
    }

    // ball joints on the plane layer
    const hipNodes: [string, number][] = [["P", 0.04], ["A", 0.032], ["D", 0.032], ["K", 0.04]];
    for (const [n, r] of hipNodes) add(hip, P.jointBlack, ball(pt(n), r));
    add(shank, P.jointBlack, ball(pt("E"), 0.032));
    add(shank, P.jointBlack, ball(pt("F"), 0.032));
    // outer layer balls
    add(hip, P.jointBlack, ball(pt("Cp", true), 0.04));
    add(hip, P.jointBlack, ball(pt("A", true), 0.028));
    add(shank, P.jointBlack, ball(pt("E", true), 0.028));
    add(shank, P.jointBlack, ball(pt("F", true), 0.028));
    add(hip, P.jointBlack, ball(pt("C", true), 0.03));

    // pins bridging layers
    add(hip, P.brass, rodGeo(pt("Cp"), pt("Cp").add(new THREE.Vector3(0.08 * s, 0, 0)), 0.014));
    add(hip, P.steel, rodGeo(pt("A"), pt("A", true), 0.012));
    add(shank, P.steel, rodGeo(pt("E"), pt("E", true), 0.012));
    add(shank, P.steel, rodGeo(pt("F"), pt("F", true), 0.012));

    // crank hub disc on the crankshaft, and brass bolt
    const xAxis = new THREE.Vector3(1, 0, 0);
    const hub = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12, 1, false);
    add(hip, P.steel, along(pt("C").add(new THREE.Vector3(0.025 * s, 0, 0)), xAxis, hub));
    const bolt = new THREE.CylinderGeometry(0.016, 0.016, 0.02, 6, 1, false);
    add(hip, P.brass, along(pt("C").add(new THREE.Vector3(0.075 * s, 0, 0)), xAxis, bolt));

    // foot
    const T = pt("T");
    const d = pt("T").sub(pt("F")).normalize();
    const foot = new THREE.SphereGeometry(0.08, 8, 6);
    foot.translate(T.x, T.y, T.z);
    add(shank, P.sandPad, foot);
    const pad = new THREE.CylinderGeometry(0.068, 0.072, 0.024, 8, 1, false);
    pad.translate(T.x, 0.012, T.z);
    add(shank, P.sandDark, pad);
    const cap = new THREE.CylinderGeometry(0.03, 0.04, 0.035, 8, 1, false); // narrow end up the shank
    add(shank, P.capBlue, along(T.clone().addScaledVector(d, -0.105), d, cap.rotateX(Math.PI)));
    const tape = new THREE.CylinderGeometry(0.03, 0.03, 0.07, 8, 1, false);
    add(shank, P.tapeBlue, along(T.clone().addScaledVector(d, -0.17), d, tape));
  }

  for (const { bone, color, geos } of bins.values()) {
    const merged = mergeGeometries(geos);
    if (!merged) throw new Error("legsRear: merge failed");
    b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name: `legsRear.${bone.name}.${color}` });
  }
}
    return buildLegsRear;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P }: Ctx) {
  const R = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP_Y = V(0, 1, 0);
  const ONE = V(1, 1, 1);

  // ---- merge collector: one part per bone and colour -------------------------------------------------
  const buckets = new Map<string, { geos: THREE.BufferGeometry[]; color: string; bone: any }>();
  const put = (g: THREE.BufferGeometry, color: string, bone: any) => {
    const h = g.index ? g.toNonIndexed() : g;
    for (const name of Object.keys(h.attributes)) {
      if (name !== "position" && name !== "normal") h.deleteAttribute(name);
    }
    const key = `${bone.name}|${color}`;
    let e = buckets.get(key);
    if (!e) buckets.set(key, (e = { geos: [], color, bone }));
    e.geos.push(h);
  };

  // place a geometry whose axis is +Y so that it points along dir, centred on pos
  const orient = (g: THREE.BufferGeometry, pos: THREE.Vector3, dir: THREE.Vector3) => {
    const q = new THREE.Quaternion().setFromUnitVectors(UP_Y, dir.clone().normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(pos, q, ONE));
    return g;
  };
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any, sides = 6) => {
    const len = a.distanceTo(c);
    const g = new THREE.CylinderGeometry(r, r, len, sides, 1, false);
    put(orient(g, a.clone().add(c).multiplyScalar(0.5), c.clone().sub(a)), color, bone);
  };
  const ball = (p: THREE.Vector3, r: number, bone: any, big = false) => {
    const g = big ? new THREE.SphereGeometry(r, 8, 6) : new THREE.SphereGeometry(r, 6, 4);
    g.translate(p.x, p.y, p.z);
    put(g, P.jointBlack, bone);
  };
  const ring = (
    p: THREE.Vector3,
    dir: THREE.Vector3,
    r: number,
    h: number,
    color: string,
    bone: any,
    sides = 8,
  ) => {
    const g = new THREE.CylinderGeometry(r, r, h, sides, 1, true);
    put(orient(g, p, dir), color, bone);
  };

  for (const s of [1, -1]) {
    const inner = s > 0 ? J.sailL : J.sailR;
    const outer = s > 0 ? J.sailTipL : J.sailTipR;
    const root = V(s * 0.45, 1.95, 0);
    const tip = V(s * 1.3, 2.25, 0);
    const span = tip.clone().sub(root);
    const sd = span.clone().normalize();
    const nrm = V(-s * sd.y, s * sd.x, 0);
    const W = (f: number, z: number, lift = 0) =>
      root.clone().addScaledVector(span, f).add(V(0, 0, z)).addScaledVector(nrm, lift);
    const boneAt = (f: number) => (f < 0.5 ? inner : outer);
    const zAxis = V(0, 0, 1);

    // ---- frame of the wing: spars, edges, rib -----------------------------------------------------------
    rod(W(0, -1.4), W(0, 1.4), 0.025, P.pvcYellow, inner, 8);
    rod(W(1, -1.4), W(1, 1.4), 0.025, P.pvcYellow, outer, 8);
    for (const z of [-1.4, 1.4]) {
      rod(W(0, z), W(0.5, z), 0.022, P.pvcYellow, inner);
      rod(W(0.5, z), W(1, z), 0.022, P.pvcYellow, outer);
      ball(W(0, z), 0.045, inner, true);
      ball(W(1, z), 0.045, outer, true);
      ball(W(0.5, z), 0.035, inner);
      // tape rings on the edge tubes either side of the hinge ball
      ring(W(0.25, z), sd, 0.027, 0.04, P.tapeBlue, inner, 6);
      ring(W(0.75, z), sd, 0.027, 0.04, P.tapeBlue, outer, 6);
    }
    // centre rib
    rod(W(0, 0), W(0.5, 0), 0.016, P.pvcYellowLight, inner);
    rod(W(0.5, 0), W(1, 0), 0.016, P.pvcYellowLight, outer);
    ball(W(0, 0), 0.035, inner);
    ball(W(0.5, 0), 0.03, inner);
    ball(W(1, 0), 0.035, outer);

    // tape rings on the spars at the gaps between bottles
    for (const z of [-1.2, -0.6, 0, 0.6, 1.2]) ring(W(1, z), zAxis, 0.031, 0.045, P.tapeBlue, outer, 6);
    for (const z of [-0.6, 0.6]) ring(W(0, z), zAxis, 0.031, 0.045, P.tapeBlue, inner, 6);
    // brass collars flanking the hinge at the root
    for (const z of [-0.2, 0.2]) {
      const g = new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8, 1, false);
      put(orient(g, W(0, z), zAxis), P.brass, inner);
    }

    // ---- bottles ---------------------------------------------------------------------------------------
    const innerPts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.072, 0),
      new THREE.Vector2(0.085, 0.03),
      new THREE.Vector2(0.085, 0.42),
      new THREE.Vector2(0, 0.42),
    ];
    const outerPts = [
      new THREE.Vector2(0, 0.42),
      new THREE.Vector2(0.085, 0.42),
      new THREE.Vector2(0.085, 0.5),
      new THREE.Vector2(0.058, 0.6),
      new THREE.Vector2(0.032, 0.66),
      new THREE.Vector2(0.032, 0.74),
      new THREE.Vector2(0, 0.74),
    ];
    for (let i = 0; i < 14; i++) {
      const zc = -1.3 + 0.2 * i;
      const base = W(0, zc, 0.015).addScaledVector(sd, 0.03);
      const at = (y: number) => base.clone().addScaledVector(sd, y);

      put(orient(new THREE.LatheGeometry(innerPts, 8), base, sd), P.bottleBlue, inner);
      put(orient(new THREE.LatheGeometry(outerPts, 8), base, sd), P.bottleBlue, outer);

      // deep shoulder ring and alternating cap
      ring(at(0.5), sd, 0.0885, 0.02, P.bottleBlueDeep, outer);
      const cap = new THREE.CylinderGeometry(0.034, 0.038, 0.07, 8, 1, false);
      put(orient(cap, at(0.775), sd), i % 2 === 0 ? P.capBlue : P.capOrange, outer);

      // rope lashing + zip ties at the root spar
      ring(at(0.06), sd, 0.0885, 0.02, P.rope, inner);
      for (const sign of [1, -1]) {
        const t = new THREE.BoxGeometry(0.016, 0.022, 0.014);
        put(orient(t, at(0.06).addScaledVector(nrm, sign * 0.09), sd), P.zipBlack, inner);
      }
      // rope lashing + zip tie at the neck, and a cord down to the tip spar
      ring(at(0.7), sd, 0.037, 0.022, P.rope, outer);
      const tie = new THREE.BoxGeometry(0.012, 0.016, 0.012);
      const ang = (R() - 0.5) * 0.6;
      put(
        orient(tie, at(0.7).addScaledVector(nrm, 0.04 * Math.cos(ang)).addScaledVector(zAxis, 0.04 * Math.sin(ang)), sd),
        P.zipBlack,
        outer,
      );
      const cord = new THREE.BoxGeometry(0.02, 0.1, 0.02);
      put(orient(cord, at(0.83), sd), P.rope, outer);
    }

    // ---- sail-cloth triangles between neighbouring bottle necks, tied to the tip spar ----------------------
    const basis = new THREE.Matrix4().makeBasis(V(0, 0, s), sd, nrm);
    for (let i = 0; i < 13; i++) {
      const zm = -1.2 + 0.2 * i;
      const apex = 0.56 + 0.06 * R();
      const shape = new THREE.Shape();
      shape.moveTo(-0.065, 0.87);
      shape.lineTo(0.065, 0.87);
      shape.lineTo(0, apex);
      shape.closePath();
      const m = basis.clone().setPosition(W(0, zm, 0.015));
      const top = new THREE.ExtrudeGeometry(shape, { depth: 0.005, bevelEnabled: false });
      top.applyMatrix4(m);
      put(top, P.sailWhite, outer);
      const low = new THREE.ExtrudeGeometry(shape, { depth: 0.005, bevelEnabled: false });
      low.translate(0, 0, -0.005);
      low.applyMatrix4(m);
      put(low, P.sailShade, outer);
    }

    // ---- accentRed pennant streaming back from the leading tip corner ------------------------------------
    const flag: [number, number][] = [
      [0, 0.01],
      [0.95, -0.08],
      [0, -0.2],
    ];
    b.extrude(flag, {
      at: [s * 1.3, 2.24, 1.4],
      x: [0, 0, -1],
      thickness: 0.01,
      color: P.accentRed,
      bone: outer,
    });
    const stripe: [number, number][] = [
      [0.12, -0.075],
      [0.6, -0.095],
      [0.6, -0.115],
      [0.12, -0.1],
    ];
    b.extrude(stripe, {
      at: [s * 1.3, 2.24, 1.4],
      x: [0, 0, -1],
      thickness: 0.016,
      color: P.sailWhite,
      bone: outer,
    });
  }

  // ---- flush merged geometry into the builder ---------------------------------------------------------
  let n = 0;
  for (const e of buckets.values()) {
    const merged = mergeGeometries(e.geos, false);
    if (!merged) continue;
    b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], flat: true, name: `sailsMerged${n++}` });
  }
}
    return buildSails;
  })(),
  // headTail
  (() => {
function buildHeadTail({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => new THREE.Vector3().lerpVectors(a, c, t);
  const R = rng(11);
  void R;

  // ---------- helpers ----------
  const ball = (p: THREE.Vector3, r: number, bone: any, color = P.jointBlack) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p, bone });

  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, bone: any, r1?: number) =>
    b.rod(a, c, r1 === undefined ? r : [r, r1], color, { bone, sides: 6, caps: "flat" });

  const ring = (
    at: THREE.Vector3,
    dir: THREE.Vector3 | number[],
    rad: number,
    tube: number,
    color: string,
    bone: any,
  ) =>
    b.part(new THREE.TorusGeometry(rad, tube, 5, 12), color, {
      at,
      dir,
      axis: "z",
      bone,
    } as any);

  // a zip tie / tape wrap around a rod a->c at fraction t
  const wrapOn = (a: THREE.Vector3, c: THREE.Vector3, t: number, rad: number, tube: number, color: string, bone: any) =>
    ring(lerpV(a, c, t), c.clone().sub(a).normalize(), rad, tube, color, bone);

  // bottle: lathe body + cap, base at `at`, running along `axis`
  const bottle = (
    at: THREE.Vector3,
    axis: THREE.Vector3,
    r: number,
    len: number,
    capLen: number,
    bodyColor: string,
    capColor: string,
    bone: any,
  ) => {
    const L = len - capLen;
    const outline: [number, number][] = [
      [0, 0],
      [r * 0.88, 0],
      [r, L * 0.06],
      [r, L * 0.66],
      [r * 0.42, L * 0.9],
      [r * 0.34, L],
      [0, L],
    ];
    b.lathe(outline, { at, axis, segments: 8, color: bodyColor, bone });
    const capAt = at.clone().addScaledVector(axis, L + capLen / 2 - 0.002);
    b.part(new THREE.CylinderGeometry(r * 0.4, r * 0.4, capLen, 8), capColor, {
      at: capAt,
      dir: axis,
      bone,
    });
  };

  // ================= HEAD =================
  const head = J.head;
  const jaw = J.jaw;
  const HB = V(M.headBase[0], M.headBase[1], M.headBase[2]);

  const top = V(0, 1.83, 1.88);
  const bot = V(0, 1.53, 1.9);
  const sideL = V(0.09, 1.68, 1.87);
  const sideR = V(-0.09, 1.68, 1.87);
  const front = V(0, 1.68, 2.0);
  const skullNodes = [top, sideL, bot, sideR];

  // skull diamond frame
  ball(HB, 0.04, head);
  for (const n of skullNodes) rod(HB, n, 0.025, P.pvcYellow, head);
  for (let i = 0; i < 4; i++) {
    rod(skullNodes[i], skullNodes[(i + 1) % 4], 0.025, P.pvcYellow, head);
    rod(skullNodes[i], front, 0.02, P.pvcYellow, head);
  }
  for (const n of skullNodes) ball(n, 0.032, head);
  ball(front, 0.034, head);

  // zip ties on the base rods
  for (const n of skullNodes) wrapOn(HB, n, 0.5, 0.03, 0.006, P.zipBlack, head);

  // accentRed tape band across the skull: a diamond ring matching the frame
  b.part(new THREE.TorusGeometry(0.162, 0.014, 5, 4), P.accentRed, {
    at: V(0, 1.68, 1.875),
    dir: [0, 0, 1],
    axis: "z",
    scale: [0.56, 1, 1],
    bone: head,
  } as any);

  // muzzle: rigid upper jaw bottle, cap at tip
  const zAxis = V(0, 0, 1);
  bottle(V(0, 1.68, 1.99), zAxis, 0.065, 0.2, 0.04, P.bottleBlue, P.capOrange, head);
  rod(front, V(0, 1.68, 2.05), 0.02, P.pvcYellowDark, head);
  ring(V(0, 1.68, 2.0), zAxis, 0.066, 0.01, P.bottleBlueDeep, head);
  ring(V(0, 1.68, 2.075), zAxis, 0.064, 0.007, P.rope, head);
  ring(V(0, 1.68, 2.125), zAxis, 0.05, 0.006, P.rope, head);

  // eyes, brows and feelers
  for (const s of [1, -1]) {
    const sNode = s > 0 ? sideL : sideR;
    const eye = V(s * 0.13, 1.72, 1.9);
    rod(sNode, eye, 0.016, P.pvcYellowDark, head);
    b.part(new THREE.SphereGeometry(0.07, 10, 8), P.eyeWhite, { at: eye, bone: head });
    const d = V(s * 0.8, 0.1, 0.6).normalize();
    b.part(new THREE.SphereGeometry(0.04, 8, 6), P.pupil, {
      at: eye.clone().addScaledVector(d, 0.064),
      dir: d,
      axis: "z",
      scale: [1, 1, 0.35],
      bone: head,
    } as any);
    b.part(new THREE.SphereGeometry(0.01, 6, 4), P.eyeWhite, {
      at: eye.clone().addScaledVector(V(s * 0.7, 0.45, 0.6).normalize(), 0.076),
      bone: head,
    });
    const ringN = V(s, 0.15, 0.4).normalize();
    ring(eye.clone().addScaledVector(ringN, -0.03), ringN, 0.066, 0.009, P.tapeBlue, head);
    // brow cap
    b.part(new THREE.CylinderGeometry(0.035, 0.042, 0.032, 8), P.capOrange, {
      at: V(s * 0.13, 1.8, 1.9),
      dir: [s * 0.25, 1, 0.3],
      bone: head,
    });
    // feeler swept up and forward
    const f0 = V(s * 0.13, 1.815, 1.9);
    const f1 = V(s * 0.17, 1.9, 2.0);
    const f2 = V(s * 0.2, 1.96, 2.13);
    b.sweep(catmull([f0, f1, f2]), [0.012, 0.008], { color: P.pvcYellowLight, bone: head, sides: 6 });
    ball(f2, 0.02, head);
  }

  // lower jaw (on the jaw joint, hinge at [0,1.6,1.95])
  for (const s of [1, -1]) {
    const hinge = V(s * 0.06, 1.6, 1.95);
    const sNode = s > 0 ? sideL : sideR;
    rod(sNode, hinge, 0.018, P.pvcYellowDark, head);
    ball(hinge, 0.026, jaw);
    const tip = V(s * 0.05, 1.57, 2.12);
    rod(hinge, tip, 0.02, P.pvcYellow, jaw);
    ball(tip, 0.024, jaw);
  }
  rod(V(0.05, 1.57, 2.12), V(-0.05, 1.57, 2.12), 0.014, P.pvcYellow, jaw);
  bottle(V(0, 1.572, 2.0), zAxis, 0.036, 0.17, 0.035, P.bottleBlue, P.capBlue, jaw);
  ring(V(0, 1.572, 2.05), zAxis, 0.04, 0.005, P.rope, jaw);

  // ================= TAIL =================
  const T0 = V(M.tailBase[0], M.tailBase[1], M.tailBase[2]);
  const T1 = V(0, 1.7, -1.95);
  const T2 = V(0, 1.72, -2.1);
  const T3 = V(0, 1.74, -2.2);
  const tj = [J.tail1, J.tail2, J.tail3];
  const pts = [T0, T1, T2, T3];
  const radii: [number, number][] = [
    [0.03, 0.025],
    [0.025, 0.02],
    [0.02, 0.015],
  ];
  for (let i = 0; i < 3; i++) {
    rod(pts[i], pts[i + 1], radii[i][0], P.pvcYellow, tj[i], radii[i][1]);
    wrapOn(pts[i], pts[i + 1], 0.55, radii[i][0] + 0.008, 0.006, P.zipBlack, tj[i]);
    ball(pts[i], 0.04 - i * 0.005, tj[i]);
  }
  ball(T3, 0.024, J.tail3);
  wrapOn(T0, T1, 0.25, 0.036, 0.007, P.tapeBlue, J.tail1);
  wrapOn(T1, T2, 0.25, 0.03, 0.007, P.tapeBlue, J.tail2);

  // little feather rods at the first knuckle
  for (const s of [1, -1]) {
    const tip = V(s * 0.13, 1.74, -2.06);
    rod(T1, tip, 0.012, P.pvcYellowLight, J.tail2, 0.009);
    ball(tip, 0.02, J.tail2);
  }

  // windvane: white triangle with red edging
  b.extrude(
    [
      [0, 0],
      [0.18, 0],
      [0.18, 0.24],
    ],
    {
      at: V(0, 1.745, -2.02),
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.01,
      color: P.sailWhite,
      bone: J.tail3,
    },
  );
  const vFront = V(0, 1.745, -2.02);
  const vTop = V(0, 1.985, -2.2);
  const vRearBot = V(0, 1.745, -2.2);
  rod(vFront, vTop, 0.008, P.accentRed, J.tail3);
  rod(vRearBot, vTop, 0.008, P.accentRed, J.tail3);
  ball(vTop, 0.014, J.tail3, P.accentRed);

  // ================= BELLY BANK =================
  const body = J.body;
  const zcs = [-0.42, -0.14, 0.14, 0.42];
  const negZ = V(0, 0, -1);
  for (const s of [1, -1]) {
    const x = s * 0.14;
    for (const zc of zcs) {
      bottle(V(x, 1.25, zc + 0.135), negZ, 0.07, 0.27, 0.04, P.bottleBlue, P.capBlue, body);
      ring(V(x, 1.25, zc), zAxis, 0.073, 0.007, P.rope, body);
      // strap up to the rail
      rod(V(x, 1.31, zc), V(s * 0.25, 1.44, zc), 0.01, P.rope, body);
    }
    // manifold hose under the row, with drops from the end caps
    rod(V(x, 1.15, -0.57), V(x, 1.15, 0.29), 0.01, P.zipBlack, body);
    rod(V(x, 1.25, -0.555), V(x, 1.15, -0.555), 0.008, P.zipBlack, body);
    rod(V(x, 1.25, 0.285), V(x, 1.15, 0.285), 0.008, P.zipBlack, body);
    // cross hose to the pump
    rod(V(x, 1.15, -0.15), V(s * 0.04, 1.17, -0.15), 0.009, P.zipBlack, body);
  }

  // steel pump between the rows
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8), P.steel, {
    at: V(0, 1.17, -0.15),
    dir: [0, 0, 1],
    bone: body,
  });
  for (const dz of [0.105, -0.105]) {
    b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 8), P.brass, {
      at: V(0, 1.17, -0.15 + dz),
      dir: [0, 0, 1],
      bone: body,
    });
  }
  rod(V(0, 1.2, -0.15), V(0, 1.3, -0.15), 0.01, P.steel, body);
  rod(V(0.05, 1.3, -0.15), V(-0.05, 1.3, -0.15), 0.011, P.accentRed, body);
}
    return buildHeadTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "strandbeestWindwalker" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.5,0], dir: [0,0,1], role: "spine" });
  J["crankF"] = b.joint("crankF", { parent: J["body"], at: [0,1.2,1], dir: [1,0,0], role: "hinge", group: "frame" });
  J["crankR"] = b.joint("crankR", { parent: J["body"], at: [0,1.2,-1], dir: [1,0,0], role: "hinge", group: "frame" });
  J["hipFL0"] = b.joint("hipFL0", { parent: J["body"], at: [0.5,1.28,0.62], dir: [0,-0.97,0.24], role: "leg", group: "legsFront" });
  J["shankFL0"] = b.joint("shankFL0", { parent: J["hipFL0"], at: [0.5,0.29,0.86], dir: [0,-0.63,0.78], role: "leg", group: "legsFront" });
  J["hipFL1"] = b.joint("hipFL1", { parent: J["body"], at: [1,1.28,0.62], dir: [0,-0.97,0.24], role: "leg", group: "legsFront" });
  J["shankFL1"] = b.joint("shankFL1", { parent: J["hipFL1"], at: [1,0.29,0.86], dir: [0,-0.63,0.78], role: "leg", group: "legsFront" });
  J["hipFR0"] = b.joint("hipFR0", { parent: J["body"], at: [-0.5,1.28,0.62], dir: [0,-0.97,0.24], role: "leg", group: "legsFront" });
  J["shankFR0"] = b.joint("shankFR0", { parent: J["hipFR0"], at: [-0.5,0.29,0.86], dir: [0,-0.63,0.78], role: "leg", group: "legsFront" });
  J["hipFR1"] = b.joint("hipFR1", { parent: J["body"], at: [-1,1.28,0.62], dir: [0,-0.97,0.24], role: "leg", group: "legsFront" });
  J["shankFR1"] = b.joint("shankFR1", { parent: J["hipFR1"], at: [-1,0.29,0.86], dir: [0,-0.63,0.78], role: "leg", group: "legsFront" });
  J["hipRL0"] = b.joint("hipRL0", { parent: J["body"], at: [0.5,1.28,-1.38], dir: [0,-0.97,0.24], role: "leg", group: "legsRear" });
  J["shankRL0"] = b.joint("shankRL0", { parent: J["hipRL0"], at: [0.5,0.29,-1.14], dir: [0,-0.63,0.78], role: "leg", group: "legsRear" });
  J["hipRL1"] = b.joint("hipRL1", { parent: J["body"], at: [1,1.28,-1.38], dir: [0,-0.97,0.24], role: "leg", group: "legsRear" });
  J["shankRL1"] = b.joint("shankRL1", { parent: J["hipRL1"], at: [1,0.29,-1.14], dir: [0,-0.63,0.78], role: "leg", group: "legsRear" });
  J["hipRR0"] = b.joint("hipRR0", { parent: J["body"], at: [-0.5,1.28,-1.38], dir: [0,-0.97,0.24], role: "leg", group: "legsRear" });
  J["shankRR0"] = b.joint("shankRR0", { parent: J["hipRR0"], at: [-0.5,0.29,-1.14], dir: [0,-0.63,0.78], role: "leg", group: "legsRear" });
  J["hipRR1"] = b.joint("hipRR1", { parent: J["body"], at: [-1,1.28,-1.38], dir: [0,-0.97,0.24], role: "leg", group: "legsRear" });
  J["shankRR1"] = b.joint("shankRR1", { parent: J["hipRR1"], at: [-1,0.29,-1.14], dir: [0,-0.63,0.78], role: "leg", group: "legsRear" });
  J["sailL"] = b.joint("sailL", { parent: J["body"], at: [0.45,1.95,0], dir: [0.86,0.35,0], role: "wing", group: "sails" });
  J["sailTipL"] = b.joint("sailTipL", { parent: J["sailL"], at: [0.88,2.1,0], dir: [0.86,0.35,0], role: "wing", group: "sails" });
  J["sailR"] = b.joint("sailR", { parent: J["body"], at: [-0.45,1.95,0], dir: [-0.86,0.35,0], role: "wing", group: "sails" });
  J["sailTipR"] = b.joint("sailTipR", { parent: J["sailR"], at: [-0.88,2.1,0], dir: [-0.86,0.35,0], role: "wing", group: "sails" });
  J["head"] = b.joint("head", { parent: J["body"], at: [0,1.65,1.75], dir: [0,0.1,1], role: "head", group: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,1.6,1.95], dir: [0,-0.05,1], role: "jaw", group: "head" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,1.65,-1.75], dir: [0,0.1,-1], role: "tail", group: "head" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,1.7,-1.95], dir: [0,0.1,-1], role: "tail", group: "head" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,1.72,-2.1], dir: [0,0.1,-1], role: "tail", group: "head" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

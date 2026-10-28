import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Hanging Mobile",
  "description": "A Calder-style kinetic mobile: a ceiling hook and wire hang a balanced tree of black rods, each ending in a flat painted organic shape in primary colours."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wire: "#111111",
  red: "#d92b1f",
  blue: "#1f4fb8",
  yellow: "#f2c314",
  white: "#f5f1e6",
  black: "#1a1a1a",
  ceiling: "#6b6b6b",
};
const M = {
  hook: [0, 2.2, 0] as [number, number, number],
  mainRod: [0, 1.75, 0] as [number, number, number],
  rodRight: [0.55, 1.3, 0.1] as [number, number, number],
  rodLeft: [-0.55, 1.45, -0.1] as [number, number, number],
  rodLow: [0, 0.9, 0.2] as [number, number, number],
  subRodLeft: [-0.95, 0.95, -0.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // topAssembly
  (() => {
function buildTopAssembly({ b, J, P, M }: Ctx) {
  const WIRE = P.wire;
  const ROD = P.black;
  const PLATE = P.ceiling;

  const [hx, hy, hz] = M.hook;
  const rodY = M.mainRod[1];
  const ROD_HALF = 0.6;
  const ROD_R = 0.009;
  const WIRE_R = 0.0035;
  const RING_R = 0.014;

  // ---- small helpers ----------------------------------------------------
  const wire = (a: number[], c: number[], r = WIRE_R) => b.rod(a, c, r, WIRE);

  // closed eye ring in a vertical plane; rotY = 0 faces Z, 90 faces X
  const eye = (at: number[], radius: number, tube: number, rotY: number, color = WIRE) =>
    b.part(new THREE.TorusGeometry(radius, tube, 6, 14), color, { at, rotation: [0, rotY, 0] });

  // collar ring wrapped round the rod (axis along X)
  const wrap = (x: number) => eye([x, rodY, 0], RING_R, 0.003, 90);

  // little open hook at the bottom of a wire
  const hook = (at: number[]) =>
    b.part(new THREE.TorusGeometry(0.012, 0.003, 6, 12, Math.PI * 1.6), WIRE, {
      at: [at[0], at[1] + 0.012, at[2]],
      rotation: [0, 0, -54],
    });

  // small crimp sleeve on a wire at fraction t
  const crimp = (a: number[], c: number[], t: number) => {
    const p = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.022, 8), ROD, { at: p, dir: d });
  };

  // ---- ceiling plate (canopy) ------------------------------------------
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.11, -0.012],
      [0.062, -0.03],
      [0.024, -0.046],
      [0, -0.046],
    ],
    { at: [hx, hy, hz], segments: 16, color: PLATE },
  );
  // rim bead and bolt heads on the underside
  b.part(new THREE.TorusGeometry(0.108, 0.004, 5, 24), WIRE, { at: [hx, hy - 0.012, hz], rotation: [90, 0, 0] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 6), WIRE, {
      at: [hx + Math.cos(a) * 0.085, hy - 0.016, hz + Math.sin(a) * 0.085],
    });
  }

  // ---- hook, swivel and top wire ---------------------------------------
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8), WIRE, { at: [hx, hy - 0.07, hz] });
  const eye1y = hy - 0.12;
  eye([hx, eye1y, hz], 0.025, 0.005, 0);
  const eye2y = eye1y - 0.045;
  eye([hx, eye2y, hz], 0.025, 0.005, 90);
  const topStart = [hx, eye2y - 0.025, hz];

  // top eye sits on the rod collar
  const topEyeY = rodY + RING_R + 0.016;
  wire(topStart, [0, topEyeY + 0.014, 0]);
  crimp(topStart, [0, topEyeY + 0.014, 0], 0.35);
  eye([0, topEyeY, 0], 0.014, 0.003, 0);

  // ---- main rod ---------------------------------------------------------
  b.capsule([-ROD_HALF, rodY, 0], [ROD_HALF, rodY, 0], ROD_R, ROD);
  // centre collar and end bands
  b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.03, 8), WIRE, { at: [0, rodY, 0], dir: [1, 0, 0] });
  for (const x of [-ROD_HALF + 0.02, ROD_HALF - 0.02])
    b.part(new THREE.CylinderGeometry(0.0115, 0.0115, 0.012, 8), WIRE, { at: [x, rodY, 0], dir: [1, 0, 0] });
  // left end bead
  b.part(new THREE.SphereGeometry(0.014, 8, 6), WIRE, { at: [-ROD_HALF - 0.004, rodY, 0] });

  // counterweight ball at the right end
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.014, 8), WIRE, { at: [ROD_HALF + 0.004, rodY, 0], dir: [1, 0, 0] });
  b.part(new THREE.SphereGeometry(0.04, 12, 8), ROD, { at: [ROD_HALF + 0.04, rodY, 0] });
  b.part(new THREE.SphereGeometry(0.009, 6, 4), P.white, { at: [ROD_HALF + 0.062, rodY + 0.022, 0.026] });

  // ---- three drop wires -------------------------------------------------
  const drops: { x: number; mount: number[] }[] = [
    { x: M.rodRight[0], mount: M.rodRight },
    { x: M.rodLeft[0], mount: M.rodLeft },
    { x: 0, mount: M.rodLow },
  ];
  for (const d of drops) {
    if (d.x !== 0) wrap(d.x);
    // centre drop hangs from an eye below the collar
    let start: number[];
    if (d.x === 0) {
      eye([0, rodY - 0.03, 0], 0.014, 0.003, 0);
      start = [0, rodY - 0.044, 0];
    } else {
      start = [d.x, rodY - RING_R, 0];
    }
    const end = [d.mount[0], d.mount[1] + 0.035, d.mount[2]];
    wire(start, end);
    crimp(start, end, 0.12);
    crimp(start, end, 0.88);
    // bridge the wire end down to the mount, with its hook
    wire(end, d.mount);
    hook(d.mount);
  }

  // tiny bead on the centre wire for character
  b.part(new THREE.SphereGeometry(0.012, 8, 6), P.red, {
    at: [0, rodY - 0.044 - 0.06, 0.0005],
  });
}
    return buildTopAssembly;
  })(),
  // rightBranch
  (() => {
function buildRightBranch({ b, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const WIRE = P.wire;
  const BLACK = P.black;
  const RED = P.red;
  const WHITE = P.white;
  const DARKRED = "#9e1a12";
  const r = rng(11);

  // ---------- helpers ----------
  const wire = (a: THREE.Vector3, c: THREE.Vector3, rad = 0.0035) => b.rod(a, c, rad, WIRE);

  // A small round loop: torus whose plane faces `axisDir`
  const loop = (at: THREE.Vector3, axisDir: THREE.Vector3, R = 0.014, tube = 0.0032) =>
    b.part(new THREE.TorusGeometry(R, tube, 6, 14), WIRE, { at, dir: axisDir, axis: "z" });

  // ---------- rod layout (pivot on the mount, unequal arms: short near, long far) ----------
  const pivot = V(...(M.rodRight as [number, number, number]));
  const d = V(0.3, 0, 0.1);
  const near = pivot.clone().addScaledVector(d, -1.0); // ~ (0.25, 1.3, 0.0)
  const far = pivot.clone().addScaledVector(d, 1.9); // ~ (1.12, 1.3, 0.29)
  const rodDir = far.clone().sub(near).normalize();
  const perp = V(-rodDir.z, 0, rodDir.x).normalize(); // horizontal, across the rod

  // the rod and its end beads
  b.capsule(near, far, 0.0085, WIRE);
  b.part(new THREE.SphereGeometry(0.016, 8, 6), WIRE, { at: far.clone().addScaledVector(rodDir, 0.012) });
  b.part(new THREE.SphereGeometry(0.014, 8, 6), WIRE, { at: near.clone().addScaledVector(rodDir, -0.01) });

  // ---------- pivot hook: collar around the rod, a hook loop above and a short wire stub ----------
  loop(pivot.clone(), rodDir, 0.015);
  loop(pivot.clone().add(V(0, 0.027, 0)), perp, 0.013);
  wire(pivot.clone().add(V(0, 0.036, 0)), pivot.clone().add(V(0, 0.048, 0)));

  // ---------- far end: collar, hanging loop, long wire, leaf ----------
  loop(far.clone(), rodDir, 0.015);
  const farHook = far.clone().add(V(0, -0.027, 0));
  loop(farHook, perp, 0.013);

  const leafTop = V(far.x, 0.93, far.z);
  wire(farHook.clone().add(V(0, -0.012, 0)), leafTop.clone().add(V(0, 0.012, 0)));

  // leaf orientation: yawed so it reads from several sides, slightly leaning for hand-cut character
  const yaw = THREE.MathUtils.degToRad(35);
  const lx = V(Math.cos(yaw), 0, Math.sin(yaw));
  const ly = V(0.06, 1, 0.1);
  ly.addScaledVector(lx, -ly.dot(lx)).normalize();

  const T = 0.012;
  const leaf = b.extrude(
    [
      [0, 0, "sharp"],
      [0.09, -0.05],
      [0.17, -0.17],
      [0.17, -0.3],
      [0.09, -0.43],
      [0, -0.5, "sharp"],
      [-0.09, -0.41],
      [-0.16, -0.28],
      [-0.15, -0.14],
      [-0.07, -0.05],
    ],
    { at: leafTop, x: lx, y: ly, thickness: T, bevel: 0.002, smoothing: 2, color: RED },
  );

  // eyelet where the wire meets the leaf
  b.part(new THREE.TorusGeometry(0.011, 0.003, 6, 12), WIRE, {
    at: leaf.local([0, 0.004, 0]),
    dir: leaf.dir([0, 0, 1]),
    axis: "z",
  });

  // midrib and veins, on both faces
  const halfW = (v: number) => 0.15 * Math.sin((Math.PI * -v) / 0.5) * 0.8;
  for (const sz of [1, -1]) {
    const zz = sz * (T / 2 + 0.0015);
    b.rod(leaf.local([0, -0.035, zz]), leaf.local([0, -0.46, zz]), 0.0045, DARKRED);
    for (let k = 0; k < 4; k++) {
      const v = -0.12 - k * 0.075;
      const ve = v - 0.06;
      for (const sx of [1, -1]) {
        const ex = sx * halfW(ve) * 0.62;
        b.rod(leaf.local([0, v, zz]), leaf.local([ex, ve, zz]), 0.003, DARKRED);
      }
    }
    // tiny white circle accent (with a small red centre dot), both faces
    const spot = leaf.local([0.045, -0.2, sz * (T / 2 + 0.002)]);
    const n = leaf.dir([0, 0, sz]);
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 18), WHITE, { at: spot, dir: n });
    const dot = leaf.local([0.045, -0.2, sz * (T / 2 + 0.0045)]);
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.003, 10), RED, { at: dot, dir: n });
  }

  // ---------- near end: short wire and small black disc ----------
  const nearHook = near.clone().add(V(0, -0.027, 0));
  loop(near.clone(), rodDir, 0.014);
  loop(nearHook, perp, 0.012);

  const discR = 0.07;
  const discC = V(near.x - 0.02, 1.095, near.z - 0.01);
  const discN = V(0.25, 0.15, 1).normalize();
  const discUp = V(0, 1, 0).addScaledVector(discN, -discN.y).normalize();
  const discTop = discC.clone().addScaledVector(discUp, discR);

  wire(nearHook.clone().add(V(0, -0.012, 0)), discTop.clone().addScaledVector(discUp, 0.01));
  b.part(new THREE.CylinderGeometry(discR, discR, 0.012, 22), BLACK, { at: discC, dir: discN });
  b.part(new THREE.TorusGeometry(0.009, 0.0028, 6, 12), WIRE, {
    at: discTop.clone().addScaledVector(discUp, 0.002),
    dir: discN,
    axis: "z",
  });
  // small white pin-dot highlight on the black disc, both faces
  for (const sz of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 8), WHITE, {
      at: discC.clone().addScaledVector(discN, sz * 0.007).addScaledVector(discUp, -0.02),
      dir: discN.clone().multiplyScalar(sz),
    });
  }

  // tiny hand-made kink: a small bead on the long wire for character
  const wl = leafTop.clone().lerp(farHook, 0.45 + 0.05 * r());
  b.part(new THREE.SphereGeometry(0.008, 6, 4), WIRE, { at: wl });
}
    return buildRightBranch;
  })(),
  // leftBranch
  (() => {
type BranchCtx = {
  b: Builder;
  J: Record<string, unknown>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildLeftBranch({ b, P, M }: BranchCtx) {
  const G = "leftBranch";
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const UP = V(0, 1, 0);
  const rand = rng(1957);

  // ---------- small helpers ----------
  const wire = (a: THREE.Vector3, c: THREE.Vector3) => b.rod(a, c, 0.0035, P.wire, { sides: 6, group: G });

  const ring = (at: THREE.Vector3, dir: THREE.Vector3, r: number, t: number, color: string) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 12), color, { at, dir, axis: "z", group: G });

  const bead = (at: THREE.Vector3, r: number, color: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, group: G });

  // Loop that hangs below a rod point: collar round the rod plus a hook ring. Returns the hook's bottom point.
  const hangLoop = (top: THREE.Vector3, rodDir: THREE.Vector3) => {
    ring(top, rodDir, 0.015, 0.0035, P.black);
    const normal = rodDir.clone().cross(UP).normalize();
    ring(top.clone().add(V(0, -0.0265, 0)), normal, 0.011, 0.003, P.wire);
    return top.clone().add(V(0, -0.04, 0));
  };

  // Loop that rises above a rod point so a wire can hook into it. Returns the loop's top point.
  const upLoop = (at: THREE.Vector3, rodDir: THREE.Vector3) => {
    ring(at, rodDir, 0.015, 0.0035, P.black);
    const normal = rodDir.clone().cross(UP).normalize();
    ring(at.clone().add(V(0, 0.0265, 0)), normal, 0.011, 0.003, P.wire);
    return at.clone().add(V(0, 0.04, 0));
  };

  // A roughly round hand-cut outline, hanging below its top point (0,0).
  const disc = (r: number, n: number, wob: number): [number, number][] => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const k = 1 + (rand() - 0.5) * wob;
      pts.push([Math.cos(t) * r * k, Math.sin(t) * r * k - r]);
    }
    return pts;
  };

  // Kidney bean with a notch at the top, notch bottom at (0,0).
  const kidney = (a: number, h: number): [number, number][] => {
    const pts: [number, number][] = [];
    const n = 28;
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const m = 1 - 0.4 * Math.exp(-((t - Math.PI / 2) ** 2) / 0.18);
      const w = 1 + (rand() - 0.5) * 0.03;
      const sag = 0.05 * Math.cos(t) * Math.cos(t) * 0; // keep symmetric silhouette, bean comes from the notch
      pts.push([a * m * Math.cos(t) * w * (1 + 0.1 * Math.sin(t)), h * m * Math.sin(t) * w - h * 0.6 + sag]);
    }
    return pts;
  };

  type Placed = { q: THREE.Quaternion; x: THREE.Vector3; y: THREE.Vector3; n: THREE.Vector3; at: THREE.Vector3 };

  // Thin flat shape hanging from `at`, yawed and tilted a little for hand-cut character, with an eyelet on top.
  const hangShape = (
    outline: [number, number][],
    at: THREE.Vector3,
    yawDeg: number,
    tiltXDeg: number,
    tiltZDeg: number,
    color: string,
  ): Placed => {
    const d = THREE.MathUtils.degToRad;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(d(tiltXDeg), d(yawDeg), d(tiltZDeg), "YXZ"));
    const x = V(1, 0, 0).applyQuaternion(q);
    const y = V(0, 1, 0).applyQuaternion(q);
    const n = V(0, 0, 1).applyQuaternion(q);
    b.extrude(outline, {
      at,
      x: x.toArray() as [number, number, number],
      y: y.toArray() as [number, number, number],
      thickness: 0.012,
      bevel: 0.003,
      color,
      group: G,
    });
    // eyelet sitting in the shape's plane
    b.part(new THREE.TorusGeometry(0.012, 0.003, 5, 12), P.wire, {
      at: at.clone().addScaledVector(y, 0.0125),
      quat: q,
      group: G,
    });
    return { q, x, y, n, at };
  };

  const eyeletTop = (s: Placed) => s.at.clone().addScaledVector(s.y, 0.0275);

  // Small flat dot seated on both faces of a shape.
  const dot = (s: Placed, u: number, v: number, r: number, color: string) => {
    const circle: [number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const t = (i / 12) * Math.PI * 2;
      circle.push([Math.cos(t) * r, Math.sin(t) * r]);
    }
    for (const side of [1, -1]) {
      const pt = s.at.clone().addScaledVector(s.x, u).addScaledVector(s.y, v).addScaledVector(s.n, side * 0.0075);
      b.extrude(circle, {
        at: pt,
        x: s.x.toArray() as [number, number, number],
        y: s.y.toArray() as [number, number, number],
        thickness: 0.004,
        color,
        group: G,
      });
    }
  };

  // ---------- main left rod (at rodLeft) ----------
  const L = V(-0.97, M.rodLeft[1], -0.14);
  const R = V(-0.27, M.rodLeft[1], -0.06);
  const rodDir = R.clone().sub(L).normalize();
  b.capsule(L, R, 0.011, P.black, { sides: 8, group: G });
  bead(L.clone().addScaledVector(rodDir, -0.012), 0.0145, P.black);
  bead(R.clone().addScaledVector(rodDir, 0.012), 0.0145, P.black);

  // suspension point on the rod, at the spec's mount x
  const tMount = (M.rodLeft[0] - L.x) / (R.x - L.x);
  const mountPt = L.clone().lerp(R, tMount);
  const mountTop = upLoop(mountPt, rodDir);
  wire(mountTop, mountTop.clone().add(V(0, 0.07, 0)));

  // ---------- blue kidney on a long wire, from the +X end ----------
  const kHook = hangLoop(R.clone(), rodDir);
  const K = V(R.x, 0.5, R.z);
  const kid = hangShape(kidney(0.2, 0.12), K, 65, 4, -7, P.blue);
  wire(kHook, eyeletTop(kid));
  dot(kid, 0.07, -0.13, 0.024, P.white);
  dot(kid, -0.08, -0.1, 0.014, P.yellow);

  // ---------- sub-rod at subRodLeft, hung from the -X end ----------
  const SC = V(L.x, M.subRodLeft[1], L.z);
  const sd = THREE.MathUtils.degToRad(30);
  const subDir = V(Math.cos(sd), 0, Math.sin(sd));
  const half = 0.24;
  const A = SC.clone().addScaledVector(subDir, -half);
  const B = SC.clone().addScaledVector(subDir, half);
  b.capsule(A, B, 0.009, P.black, { sides: 8, group: G });
  bead(A.clone().addScaledVector(subDir, -0.01), 0.012, P.black);
  bead(B.clone().addScaledVector(subDir, 0.01), 0.012, P.black);

  const lHook = hangLoop(L.clone(), rodDir);
  const subTop = upLoop(SC, subDir);
  wire(lHook, subTop);

  // yellow disc: short wire from the outer end
  const aHook = hangLoop(A.clone(), subDir);
  const Y = V(A.x, 0.77, A.z);
  const yel = hangShape(disc(0.11, 20, 0.07), Y, 50, -5, 6, P.yellow);
  wire(aHook, eyeletTop(yel));
  dot(yel, 0.0, -0.11, 0.032, P.red);

  // white disc: much longer wire from the inner end
  const bHook = hangLoop(B.clone(), subDir);
  const W = V(B.x, 0.44, B.z);
  const wht = hangShape(disc(0.075, 18, 0.08), W, -35, 6, -5, P.white);
  wire(bHook, eyeletTop(wht));
  dot(wht, 0.0, -0.075, 0.02, P.black);

  // small black bead knots on the long wires for rhythm
  bead(kHook.clone().add(V(0, -0.22, 0)), 0.009, P.black);
  bead(bHook.clone().add(V(0, -0.2, 0)), 0.008, P.black);
}
    return buildLeftBranch;
  })(),
  // lowBranch
  (() => {
function buildLowBranch({ b, P }: Ctx) {
  const rand = rng(40);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const ROD_R = 0.009;
  const WIRE_R = 0.003;
  const YAW = 40 * (Math.PI / 180);

  // Rod frame: rodLow mount, turned 40 degrees about Y.
  const c = V(0, 0.9, 0.2);
  const d = V(Math.cos(YAW), 0, -Math.sin(YAW));
  const nrm = V(Math.sin(YAW), 0, Math.cos(YAW)); // horizontal, perpendicular to the rod
  const half = 0.5;
  const endA = c.clone().addScaledVector(d, half); // teardrop end
  const endB = c.clone().addScaledVector(d, -half); // red circle end

  // ---------- helpers ----------
  const ring = (at: THREE.Vector3, r: number, tube: number, normal: THREE.Vector3, color: string) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 12), color, { at, dir: normal, axis: "z" });

  const hookArc = (at: THREE.Vector3, r: number, normal: THREE.Vector3, color: string) =>
    // an open little hook: three-quarter torus, gap at the top
    b.part(new THREE.TorusGeometry(r, 0.0032, 5, 10, Math.PI * 1.5), color, {
      at,
      dir: normal,
      axis: "z",
      rotation: [0, 0, 0],
    });

  const wire = (a: THREE.Vector3, z: THREE.Vector3) => b.rod(a, z, WIRE_R, P.wire, { sides: 5 });

  // Shape frame: x runs along the drawing, y up, both tilted slightly for a hand-cut feel.
  const frameFor = (yawDeg: number, pitch: number, roll: number) => {
    const yaw = yawDeg * (Math.PI / 180);
    const x = V(Math.cos(yaw), 0, -Math.sin(yaw));
    const y = V(0, 1, 0);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, 0, roll));
    x.applyQuaternion(q);
    y.applyQuaternion(q);
    return { x, y };
  };

  const flat = (
    outline: any[],
    at: THREE.Vector3,
    f: { x: THREE.Vector3; y: THREE.Vector3 },
    color: string,
    thickness = 0.012,
    smoothing = 0,
  ) => b.extrude(outline, { at, x: f.x, y: f.y, thickness, bevel: 0.002, smoothing, color });

  const circleOutline = (r: number, n = 18) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([r * Math.sin(a), r * Math.cos(a)]);
    }
    return pts;
  };

  // Hanging joint: rod loop + hook at a rod point, wire down to an eyelet on a shape.
  // Returns nothing; shape top point is given.
  const hangFromRod = (rodPoint: THREE.Vector3, shapeTop: THREE.Vector3) => {
    // loop encircling the rod, hanging beneath it
    ring(rodPoint.clone().add(V(0, -0.016, 0)), 0.016, 0.0035, nrm, P.wire);
    const loopBottom = rodPoint.clone().add(V(0, -0.033, 0));
    // tiny hook below the loop
    hookArc(loopBottom.clone().add(V(0, -0.008, 0)), 0.008, nrm, P.wire);
    const eyeletC = shapeTop.clone().add(V(0, 0.011, 0));
    wire(loopBottom.clone().add(V(0, -0.012, 0)), eyeletC.clone().add(V(0, 0.011, 0)));
    ring(eyeletC, 0.0075, 0.003, nrm, P.wire);
  };

  // ---------- the rod ----------
  b.capsule(endB, endA, ROD_R, P.wire, { sides: 6 });
  for (const e of [endA, endB]) {
    b.part(new THREE.SphereGeometry(0.0165, 8, 6), P.wire, { at: e });
  }
  // small collars on the rod where the wires hang
  for (const t of [-0.5, 0, 0.5]) {
    b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.012, 8), P.wire, {
      at: c.clone().addScaledVector(d, t * 0.98),
      dir: d,
    });
  }

  // centre suspension: loop + hook on top where the topAssembly wire arrives
  ring(c.clone().add(V(0, 0.026, 0)), 0.018, 0.0038, nrm, P.wire);
  hookArc(c.clone().add(V(0, 0.056, 0)), 0.0095, nrm, P.wire).mesh.rotation.z += Math.PI;
  b.rod(c.clone().add(V(0, 0.0, 0)), c.clone().add(V(0, 0.046, 0)), WIRE_R, P.wire, { sides: 5 });

  // ---------- black teardrop (end A) ----------
  {
    const wireLen = 0.17;
    const top = endA.clone().add(V(0, -0.033 - 0.012 - 0.012 - wireLen, 0));
    const f = frameFor(YAW * (180 / Math.PI) + 55, 0.06, 0.08);
    const h = 0.31;
    const R = 0.13;
    const beta = Math.acos(R / h);
    const out: any[] = [[0, 0, "sharp"]];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const phi = beta + ((Math.PI * 2 - 2 * beta) * i) / steps;
      out.push([R * Math.sin(phi), -h + R * Math.cos(phi)]);
    }
    flat(out, top, f, P.black, 0.012, 1);
    hangFromRod(endA, top);
    // small white dot accent on the drop
    const dotAt = top.clone().addScaledVector(f.y, -h + 0.03).addScaledVector(f.x, 0.035);
    flat(circleOutline(0.026, 12), dotAt, f, P.white, 0.018);
    // thin white rim line near the tip
    const tipAt = top.clone().addScaledVector(f.y, -0.1);
    flat(
      [
        [-0.016, 0.006],
        [0.016, 0.006],
        [0.016, -0.006],
        [-0.016, -0.006],
      ],
      tipAt,
      f,
      P.white,
      0.016,
    );
  }

  // ---------- red circle with yellow centre dot (end B) ----------
  {
    const wireLen = 0.30;
    const R = 0.16;
    const top = endB.clone().add(V(0, -0.033 - 0.012 - 0.012 - wireLen, 0));
    const f = frameFor(YAW * (180 / Math.PI) + 100, -0.05, -0.07);
    flat(circleOutline(R, 20), top.clone().addScaledVector(f.y, -R), f, P.red, 0.012);
    hangFromRod(endB, top);
    // yellow centre dot, a bit thicker so it shows on both faces
    const centre = top.clone().addScaledVector(f.y, -R);
    flat(circleOutline(0.05, 14), centre, f, P.yellow, 0.02);
    // tiny black pupil in the dot
    flat(circleOutline(0.016, 10), centre, f, P.black, 0.026);
    // the stray jitter keeps the hand-cut feel
    void rand();
  }

  // ---------- white crescent on a short wire from the centre ----------
  {
    const wireLen = 0.13;
    const top = c.clone().add(V(0, -0.033 - 0.012 - 0.012 - wireLen, 0));
    const f = frameFor(YAW * (180 / Math.PI) - 35, 0.05, 0.12);
    const R = 0.115;
    const dx = 0.5 * R;
    const ri = Math.hypot(Math.cos((55 * Math.PI) / 180) * R - dx, Math.sin((55 * Math.PI) / 180) * R);
    const tipAng = Math.atan2(Math.sin((55 * Math.PI) / 180) * R, Math.cos((55 * Math.PI) / 180) * R - dx);
    const out: [number, number][] = [];
    const n1 = 9;
    const a0 = (55 * Math.PI) / 180;
    const a1 = (305 * Math.PI) / 180;
    for (let i = 0; i <= n1; i++) {
      const a = a0 + ((a1 - a0) * i) / n1;
      out.push([R * Math.cos(a), -R + R * Math.sin(a)]);
    }
    const b0 = Math.PI * 2 - tipAng; // lower tip on the inner circle
    const b1 = tipAng; // upper tip
    const n2 = 7;
    for (let i = 1; i < n2; i++) {
      const a = b0 + ((b1 - b0) * i) / n2;
      out.push([dx + ri * Math.cos(a), -R + ri * Math.sin(a)]);
    }
    flat(out, top, f, P.white, 0.012);
    hangFromRod(c, top);
  }
}
    return buildLowBranch;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

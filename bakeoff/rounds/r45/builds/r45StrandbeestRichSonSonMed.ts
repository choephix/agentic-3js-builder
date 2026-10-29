import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Strandbeest Windwalker",
  "description": "A Theo Jansen–style kinetic beach creature: twelve Holy-Number-linkage legs of yellow PVC conduit walk on a crankshaft, driven by a bank of soda-bottle wind muscles and a pair of sail wings on a central mast."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  tube: "#f2c21b",
  tubeShade: "#d9a40f",
  tubeLight: "#ffdd55",
  connector: "#1c1c20",
  connectorGrey: "#3a3b42",
  zipTie: "#f4f4f0",
  steel: "#8d9199",
  steelDark: "#5d626b",
  rubber: "#2a2a2e",
  bottleClear: "#bfe6f0",
  bottleGreen: "#7fc79a",
  capBlue: "#2d6fd6",
  capRed: "#d6402d",
  label: "#f3f3ee",
  sail: "#ece9dd",
  sailTint: "#cfe3e8",
  rib: "#c9a36a",
  rope: "#d8c9a0",
  pennant: "#d8452e",
};
const M = {
  axleCentre: [0, 1.35, 0] as [number, number, number],
  axleEndL: [1.78, 1.35, 0] as [number, number, number],
  axleEndR: [-1.78, 1.35, 0] as [number, number, number],
  beamFront: [0, 1.44, 0.46] as [number, number, number],
  beamRear: [0, 1.44, -0.46] as [number, number, number],
  ridgeCentre: [0, 1.66, 0] as [number, number, number],
  mastBase: [0, 1.66, 0] as [number, number, number],
  mastTop: [0, 3, 0] as [number, number, number],
  yardCentre: [0, 2.75, 0] as [number, number, number],
  bankFloor: [0, 1.69, 0] as [number, number, number],
  manifoldLine: [0, 2.1, 0] as [number, number, number],
  feelerRootL: [0.5, 1.66, 0.46] as [number, number, number],
  feelerRootR: [-0.5, 1.66, 0.46] as [number, number, number],
  stanceFront_A: [0, 1.44, 0.46] as [number, number, number],
  stanceFront_P: [0, 1.223, 0.127] as [number, number, number],
  stanceFront_B: [0, 1.06, 0.64] as [number, number, number],
  stanceFront_C: [0, 1.36, 0.9] as [number, number, number],
  stanceFront_D: [0, 0.84, 1] as [number, number, number],
  stanceFront_E: [0, 0.64, 0.55] as [number, number, number],
  stanceFront_F: [0, 0.07, 0.78] as [number, number, number],
  liftFront_A: [0, 1.44, 0.46] as [number, number, number],
  liftFront_P: [0, 1.477, -0.127] as [number, number, number],
  liftFront_B: [0, 1.1, 0.5] as [number, number, number],
  liftFront_C: [0, 1.4, 0.84] as [number, number, number],
  liftFront_D: [0, 0.98, 0.92] as [number, number, number],
  liftFront_E: [0, 0.8, 0.46] as [number, number, number],
  liftFront_F: [0, 0.29, 0.74] as [number, number, number],
  legPlaneX: [-1.35, -0.81, -0.27, 0.27, 0.81, 1.35] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // frame
  (() => {
function buildFrame({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const body = J.body;
  const crank = J.crank;
  const XL = 1.72;
  const stations = [-1.64, -1.08, -0.54, 0, 0.54, 1.08, 1.64];
  const yellows = [P.tube, P.tubeShade];

  const node = (p: number[], r = 0.04, color = P.connector, bone = body) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at: p });
  const tie = (p: number[], r = 0.04, axis: number[] = [1, 0, 0]) =>
    b.part(new THREE.TorusGeometry(r, 0.007, 4, 10), P.zipTie, { bone: body, at: p, dir: axis, axis: "z" });
  const rod = (a: number[], c: number[], r: number, color: string, bone = body) =>
    b.rod(a, c, r, color, { bone, sides: 6 });

  // crankshaft
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 3.56, 10), P.steel, {
    bone: crank, at: [0, 1.35, 0], dir: [1, 0, 0],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 8, 6), P.connector, { bone: crank, at: [s * 1.78, 1.35, 0] });
  }
  for (const x of [-1.64, 0, 1.64]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 12), P.connectorGrey, {
      bone: body, at: [x, 1.35, 0], dir: [1, 0, 0],
    });
  }

  // crank arms
  const xs = [-1.35, -0.81, -0.27, 0.27, 0.81, 1.35];
  xs.forEach((xk, k) => {
    const even = k % 2 === 0;
    const fx = xk + 0.05;
    const rx = xk - 0.05;
    const fP = even ? [fx, 1.223, 0.127] : [fx, 1.477, -0.127];
    const rP = even ? [rx, 1.477, 0.127] : [rx, 1.223, -0.127];
    for (const [px, P2] of [[fx, fP], [rx, rP]] as [number, number[]][]) {
      const ax = [px, 1.35, 0];
      rod(ax, P2, 0.02, P.steelDark, crank);
      b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.016, 12), P.steel, {
        bone: crank, at: ax, dir: [1, 0, 0],
      });
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), P.steel, {
        bone: crank, at: [P2[0] + (px > xk ? 0.02 : -0.02), P2[1], P2[2]], dir: [1, 0, 0],
      });
    }
  });

  // main beams
  rod([-XL, 1.44, 0.46], [XL, 1.44, 0.46], 0.03, P.tube);
  rod([-XL, 1.44, -0.46], [XL, 1.44, -0.46], 0.03, P.tube);
  rod([-XL, 1.66, 0], [XL, 1.66, 0], 0.03, P.tubeShade);
  for (const s of [1, -1]) {
    node([s * XL, 1.44, 0.46], 0.04);
    node([s * XL, 1.44, -0.46], 0.04);
    node([s * XL, 1.66, 0], 0.04);
  }

  // tent triangles
  stations.forEach((x, i) => {
    const c = yellows[i % 2];
    for (const s of [1, -1]) {
      rod([x, 1.44, s * 0.46], [x, 1.66, 0], 0.02, c);
      node([x, 1.44, s * 0.46], 0.035);
      tie([x, 1.44, s * 0.46], 0.04);
    }
    rod([x, 1.44, 0.46], [x, 1.44, -0.46], 0.016, P.tubeLight);
    node([x, 1.66, 0], 0.04);
    tie([x, 1.66, 0], 0.045);
  });

  // longitudinal braces (end to ridge) and x-bracing in outer bays
  for (const s of [1, -1]) {
    for (const z of [0.46, -0.46]) {
      rod([s * XL, 1.44, z], [s * 1.64, 1.66, 0], 0.012, P.tubeLight);
    }
  }
  for (const [x0, x1] of [[-1.64, -1.08], [1.08, 1.64]]) {
    for (const z of [0.46, -0.46]) {
      rod([x0, 1.44, z], [x1, 1.66, 0], 0.012, P.tubeShade);
      rod([x1, 1.44, z], [x0, 1.66, 0], 0.012, P.tubeShade);
    }
    rod([x0, 1.44, 0.46], [x1, 1.44, -0.46], 0.012, P.tubeShade);
    rod([x0, 1.44, -0.46], [x1, 1.44, 0.46], 0.012, P.tubeShade);
  }

  // end bearing plates
  for (const s of [1, -1]) {
    const x = s * 1.64;
    const ax = [x, 1.35, 0];
    rod(ax, [x, 1.44, 0.46], 0.018, P.steelDark);
    rod(ax, [x, 1.44, -0.46], 0.018, P.steelDark);
    rod(ax, [x, 1.66, 0], 0.018, P.steelDark);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, { bone: body, at: [x + s * 0.05, 1.35, 0], dir: [1, 0, 0] });
    tie([x, 1.4, 0.2], 0.03, [0, 1, 0.3]);
    tie([x, 1.4, -0.2], 0.03, [0, 1, -0.3]);
  }

  // feelers
  for (const s of [1, -1]) {
    const root = [s * 0.5, 1.66, 0.46];
    const path = [root, [s * 0.54, 1.85, 0.7], [s * 0.6, 2.0, 0.92], [s * 0.62, 1.95, 1.05]];
    const curve = new THREE.CatmullRomCurve3(path.map((p) => new THREE.Vector3(...p)));
    const pts = curve.getPoints(14);
    for (let i = 0; i < pts.length - 1; i++) {
      const t = i / pts.length;
      const r = 0.012 - 0.004 * t;
      const a = pts[i];
      const c = pts[i + 1];
      rod([a.x, a.y, a.z], [c.x, c.y, c.z], r, i % 2 ? P.tube : P.tubeShade);
    }
    node(root, 0.035);
    // spring coil bumps near the root
    for (let i = 0; i < 4; i++) {
      const p = curve.getPoint(0.1 + i * 0.05);
      b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), P.steel, {
        bone: body, at: [p.x, p.y, p.z], dir: curve.getTangent(0.1 + i * 0.05).toArray(), axis: "z",
      });
    }
    const t1 = curve.getPoint(0.2);
    tie([t1.x, t1.y, t1.z], 0.02, curve.getTangent(0.2).toArray());
    b.part(new THREE.SphereGeometry(0.04, 8, 6), P.capBlue, { bone: body, at: [s * 0.62, 1.95, 1.05] });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), P.zipTie, { bone: body, at: [s * 0.62 + s * 0.015, 1.97, 1.085] });
    // steel stay from front eave beam
    rod([s * 0.62, 1.44, 0.46], [s * 0.56, 1.88, 0.8], 0.006, P.steel);
    node([s * 0.62, 1.44, 0.46], 0.03, P.connectorGrey);
  }

  // small bolts along beams
  for (let i = 0; i < 8; i++) {
    const x = -1.5 + i * 0.43 + R() * 0.03;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), P.steel, { bone: body, at: [x, 1.66, 0], dir: [0, 0, 1] });
  }
}
    return buildFrame;
  })(),
  // legsFront
  (() => {
function buildLegsFront({ b, J, P, M }: Ctx) {
  const XK = [-1.35, -0.81, -0.27, 0.27, 0.81, 1.35];
  const STANCE: Record<string, [number, number]> = {
    A: [0.46, 1.44], B: [0.64, 1.06], C: [0.9, 1.36], D: [1.0, 0.84],
    E: [0.55, 0.64], F: [0.78, 0.07], P: [0.127, 1.223],
  };
  const LIFT: Record<string, [number, number]> = {
    A: [0.46, 1.44], B: [0.5, 1.1], C: [0.84, 1.4], D: [0.92, 0.98],
    E: [0.46, 0.8], F: [0.74, 0.29], P: [-0.127, 1.477],
  };
  const RODS: [string, string, number][] = [
    ["A", "B", -1], ["A", "C", 1], ["P", "B", -1], ["B", "C", 1], ["B", "D", -1],
    ["C", "D", 1], ["B", "E", 1], ["D", "E", -1], ["E", "F", 1], ["D", "F", -1],
  ];
  const R = 0.014;
  const bone = J.body;
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);
  const cylX = (r: number, l: number, n = 8) => new THREE.CylinderGeometry(r, r, l, n);

  XK.forEach((xk, k) => {
    const pose = k % 2 === 0 ? STANCE : LIFT;
    const px = xk + 0.05;
    const pt = (n: string, dx = 0): [number, number, number] => [px + dx, pose[n][1], pose[n][0]];

    // rods
    for (const [a, c, s] of RODS) {
      const dx = s * 0.015;
      b.rod(pt(a, dx), pt(c, dx), R, s < 0 ? P.tube : P.tubeShade, { bone });
      // zip-tie rings at rod ends
      for (const [end, other] of [[a, c], [c, a]] as const) {
        const e = new THREE.Vector3(...pt(end, dx));
        const o = new THREE.Vector3(...pt(other, dx));
        const d = o.clone().sub(e).normalize();
        const at = e.clone().addScaledVector(d, 0.05);
        b.part(new THREE.TorusGeometry(R * 1.2, 0.004, 4, 8), P.zipTie, { bone, at: [at.x, at.y, at.z], dir: [d.x, d.y, d.z], axis: "z" });
      }
    }

    // nodes + bolts
    for (const n of ["A", "B", "C", "D", "E", "F", "P"]) {
      const p = pt(n);
      b.part(sph(0.026), P.connector, { bone, at: p });
      b.part(cylX(0.009, 0.1, 6), P.steel, { bone, at: p, dir: [1, 0, 0] });
      for (const sx of [-1, 1])
        b.part(cylX(0.014, 0.008, 6), P.steelDark, { bone, at: [p[0] + sx * 0.05, p[1], p[2]], dir: [1, 0, 0] });
    }

    // hinge sleeve at A
    const A = pt("A");
    b.part(cylX(0.04, 0.07, 10), P.connectorGrey, { bone, at: A, dir: [1, 0, 0] });
    // collar at P
    const Pp = pt("P");
    b.part(cylX(0.036, 0.05, 10), P.connectorGrey, { bone, at: [Pp[0] + 0.03, Pp[1], Pp[2]], dir: [1, 0, 0] });

    // ankle collar
    const F = pt("F");
    const E = pt("E");
    const dir = new THREE.Vector3(F[0] - E[0], F[1] - E[1], F[2] - E[2]).normalize();
    const col = new THREE.Vector3(...F).addScaledVector(dir, -0.07);
    b.part(cylX(0.026, 0.05, 8), P.tubeLight, { bone, at: [col.x, col.y, col.z], dir: [dir.x, dir.y, dir.z] });

    // foot pad
    const fy = F[1] - 0.07 + 0.0225;
    b.part(new THREE.BoxGeometry(0.07, 0.045, 0.26), P.rubber, { bone, at: [px, fy, F[2] + 0.03] });
    // toe wedge
    const wedge = new THREE.CylinderGeometry(0.0225, 0.0225, 0.07, 3);
    b.part(wedge, P.rubber, { bone, at: [px, fy, F[2] + 0.175], dir: [1, 0, 0], rotation: [30, 0, 0] });
    // stem from ankle node to pad
    b.rod(F, [px, F[1] - 0.045, F[2]], 0.012, P.connectorGrey, { bone });

    // highlight on shin
    b.rod(pt("E", -0.015), pt("F", -0.015), 0.005, P.tubeLight, { bone, });
  });
}
    return buildLegsFront;
  })(),
  // legsRear
  (() => {
function buildLegsRear({ b, J, P, M }: Ctx) {
  const bone = J.body;
  type V = [number, number];
  const STANCE: Record<string, V> = {
    A: [0.46, 1.44], B: [0.64, 1.06], C: [0.9, 1.36], D: [1.0, 0.84], E: [0.55, 0.64], F: [0.78, 0.07], P: [0.127, 1.223],
  };
  const LIFT: Record<string, V> = {
    A: [0.46, 1.44], B: [0.5, 1.1], C: [0.84, 1.4], D: [0.92, 0.98], E: [0.46, 0.8], F: [0.74, 0.29], P: [-0.127, 1.477],
  };
  const rods: [string, string][] = [
    ["A", "B"], ["A", "C"], ["P", "B"], ["B", "C"], ["B", "D"], ["C", "D"], ["B", "E"], ["D", "E"], ["E", "F"], ["D", "F"],
  ];
  const mainSet = new Set(["A-B", "P-B", "B-D", "D-E", "D-F"]);
  const R = 0.014;
  const rnd = rng(11);

  const pt = (pose: Record<string, V>, k: string, x: number): [number, number, number] => [x, pose[k][1], -pose[k][0]];

  for (let k = 0; k < 6; k++) {
    const xk = (k - 2.5) * 0.54 - 0.05;
    const pose = k % 2 === 0 ? LIFT : STANCE;
    const stance = pose === STANCE;

    for (const [a, c] of rods) {
      const main = mainSet.has(`${a}-${c}`);
      const dx = main ? -0.015 : 0.015;
      const pa = pt(pose, a, xk + dx);
      const pc = pt(pose, c, xk + dx);
      b.rod(pa, pc, R, main ? P.tube : P.tubeShade, { bone });
      // zip-ties near each rod end
      for (const t of [0.07, 0.93]) {
        const p: [number, number, number] = [
          pa[0] + (pc[0] - pa[0]) * t, pa[1] + (pc[1] - pa[1]) * t, pa[2] + (pc[2] - pa[2]) * t,
        ];
        b.part(new THREE.TorusGeometry(R + 0.003, 0.0035, 4, 8), P.zipTie, {
          bone, at: p, dir: [pc[0] - pa[0], pc[1] - pa[1], pc[2] - pa[2]], axis: "z",
        });
      }
    }
    // light highlight on long shin
    {
      const pa = pt(pose, "E", xk + 0.015);
      const pc = pt(pose, "F", xk + 0.015);
      b.rod([pa[0] + 0.012, pa[1], pa[2]], [pc[0] + 0.012, pc[1], pc[2]], 0.004, P.tubeLight, { bone });
    }

    // nodes + bolts
    for (const n of ["A", "B", "C", "D", "E", "F", "P"]) {
      const p = pt(pose, n, xk);
      b.part(new THREE.SphereGeometry(0.026, 8, 6), P.connector, { bone, at: p });
      b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.085, 6), P.steel, { bone, at: p, dir: [1, 0, 0] });
      for (const s of [1, -1])
        b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 6), P.steelDark, {
          bone, at: [p[0] + s * 0.044, p[1], p[2]], dir: [1, 0, 0],
        });
    }

    // pivot sleeve at A on beamRear
    const A = pt(pose, "A", xk);
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 10), P.connectorGrey, { bone, at: A, dir: [1, 0, 0] });
    // collar at P
    const Pp = pt(pose, "P", xk);
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 10), P.connectorGrey, { bone, at: Pp, dir: [1, 0, 0] });

    // ankle collar
    const F = pt(pose, "F", xk);
    b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.05, 8), P.tubeLight, {
      bone, at: [F[0], F[1] + 0.04, F[2]], dir: [0, 1, 0],
    });

    // foot pad: bottom at F.y-0.07, centre z toward -Z
    const padY = F[1] - 0.07 + 0.0225;
    const padZ = F[2] - 0.03;
    b.part(new THREE.BoxGeometry(0.07, 0.045, 0.26), P.rubber, { bone, at: [xk, padY, padZ] });
    // toe wedge toward -Z
    b.part(new THREE.CylinderGeometry(0.0225, 0.0225, 0.07, 3), P.rubber, {
      bone, at: [xk, padY, padZ - 0.14], dir: [1, 0, 0],
    });
    // tread stripes on the pad
    for (let i = -2; i <= 2; i++)
      b.part(new THREE.BoxGeometry(0.074, 0.006, 0.014), P.connectorGrey, {
        bone, at: [xk, padY - 0.0225 + (stance ? 0.0 : 0.0) + 0.001, padZ + i * 0.045],
      });
    // post from ankle to pad
    b.rod([xk, F[1], F[2]], [xk, padY + 0.0225, padZ + 0.03], 0.012, P.tubeShade, { bone });
  }
}
    return buildLegsRear;
  })(),
  // windBank
  (() => {
function buildWindBank({ b, J, P, M }: Ctx) {
  const bone = J.bank;
  const R = rng(11);
  const FLOOR = 1.69;
  const H = 0.33;
  const xs: number[] = [];
  for (let i = 0; i < 12; i++) {
    const x = -1.5 + i * 0.25;
    xs.push(x);
  }
  // pitch 0.25 from -1.5 to 1.5 gives 13 slots; skip |x|<0.14 -> 12 slots (drop x=0)
  const slots = [] as number[];
  for (let i = 0; i <= 12; i++) {
    const x = -1.5 + i * 0.25;
    if (Math.abs(x) >= 0.14) slots.push(x);
  }

  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a, c, r, col, { bone, sides: 6 } as any);
  const ball = (p: number[], r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at: p as any, flat: true });
  const box = (p: number[], s: number[], col: string) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: p as any });
  const cyl = (p: number[], r: number, h: number, col: string, axis: "x" | "y" = "y", seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, {
      bone,
      at: p as any,
      dir: axis === "x" ? [1, 0, 0] : [0, 1, 0],
    });

  const bottleProfile: [number, number][] = [
    [0, 0],
    [0.04, 0],
    [0.052, 0.015],
    [0.052, 0.17],
    [0.046, 0.22],
    [0.03, 0.27],
    [0.02, 0.3],
    [0.02, 0.33],
    [0, 0.33],
  ];

  const manifoldY = 2.1;
  const baseY = FLOOR + 0.02;

  for (const z of [0.2, -0.2]) {
    // cradle rail
    rod([-1.62, FLOOR, z], [1.62, FLOOR, z], 0.016, P.tube);
    // posts down to ridge
    for (const px of [-1.5, -0.75, 0.75, 1.5]) {
      cyl([px, FLOOR - 0.0, z * 0.5], 0.015, 0.03, P.tubeShade, "y", 6);
      rod([px, FLOOR, z], [px, FLOOR - 0.02, z * 0.4], 0.012, P.tubeShade);
    }
    // manifold
    rod([-1.5, manifoldY, z], [1.5, manifoldY, z], 0.018, P.tubeLight);
    ball([-1.5, manifoldY, z], 0.026, P.connector);
    ball([1.5, manifoldY, z], 0.026, P.connector);

    slots.forEach((x, i) => {
      const glass = i % 2 === 0 ? P.bottleClear : P.bottleGreen;
      const cap = i % 2 === 0 ? P.capBlue : P.capRed;
      // base cup
      b.lathe(
        [
          [0, 0],
          [0.058, 0],
          [0.058, 0.02],
          [0, 0.02],
        ],
        { at: [x, baseY - 0.02, z], color: P.steelDark, bone, segments: 10 },
      );
      b.lathe(bottleProfile, { at: [x, baseY, z], color: glass, bone, segments: 10 });
      // label band
      b.lathe(
        [
          [0.05, 0],
          [0.055, 0],
          [0.055, 0.07],
          [0.05, 0.07],
        ],
        { at: [x, baseY + 0.07, z], color: P.label, bone, segments: 10 },
      );
      // cap
      cyl([x, baseY + H + 0.015, z], 0.026, 0.03, cap, "y", 8);
      // valve + pipe to manifold
      const top = baseY + H + 0.03;
      rod([x, top, z], [x, manifoldY, z], 0.008, P.connectorGrey);
      box([x, top + 0.07 + R() * 0.0, z], [0.04, 0.035, 0.04], P.connector);
      ball([x, manifoldY, z], 0.02, P.connector);
      // zip-tie
      cyl([x, manifoldY - 0.1 - 0.0, z], 0.011, 0.01, P.tubeShade, "y", 6);
    });

    // cross tubes of the cradle every 0.5 handled below once
  }

  // cradle cross tubes
  for (let x = -1.5; x <= 1.51; x += 0.5) {
    rod([x, FLOOR, -0.2], [x, FLOOR, 0.2], 0.014, P.tubeShade);
    ball([x, FLOOR, 0.2], 0.02, P.connector);
    ball([x, FLOOR, -0.2], 0.02, P.connector);
  }

  // manifold cross links at x=+-1.5
  for (const x of [1.5, -1.5]) {
    rod([x, manifoldY, -0.2], [x, manifoldY, 0.2], 0.012, P.tubeLight);
    box([x, manifoldY + 0.03, 0], [0.05, 0.04, 0.05], P.connector);
  }

  // bike-pump cylinders at the ends
  for (const s of [1, -1]) {
    cyl([s * 1.6, 1.9, 0], 0.04, 0.3, P.steelDark, "y", 10);
    cyl([s * 1.6, 2.07, 0], 0.045, 0.02, P.connector, "y", 10);
    rod([s * 1.6, 2.07, 0], [s * 1.6, 2.16, 0], 0.01, P.steel);
    ball([s * 1.6, 2.16, 0], 0.02, P.connector);
    rod([s * 1.6, 1.75, 0], [s * 1.6, 1.69, 0], 0.01, P.steel);
    // hose from pump to manifold
    rod([s * 1.6, 2.0, 0], [s * 1.5, manifoldY, 0.2], 0.008, P.connectorGrey);
    rod([s * 1.6, 2.0, 0], [s * 1.5, manifoldY, -0.2], 0.008, P.connectorGrey);
  }
}
    return buildWindBank;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const TUBE = P.tube, SHADE = P.tubeShade;
  const conn = P.connector;

  // ---- mast ----
  const mastBase: [number, number, number] = [0, 1.66, 0];
  const collarY = 2.3;
  b.rod(mastBase, [0, collarY, 0], 0.03, TUBE, { bone: J.mast });
  b.rod([0, collarY, 0], [0, 3.0, 0], 0.026, SHADE, { bone: J.mast });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.07, 10), conn, { bone: J.mast, at: [0, collarY, 0] });
  for (const dy of [-0.06, 0.06])
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10), P.zipTie, { bone: J.mast, at: [0, collarY + dy, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10), P.connectorGrey, { bone: J.mast, at: [0, 1.7, 0] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), conn, { bone: J.mast, at: [0, 3.0, 0] });
  b.spike([0, 3.02, 0], [0, 1, 0], 0.12, 0.022, { color: P.steel, bone: J.mast });

  // ---- yard ----
  b.rod([-1.7, 2.75, 0], [1.7, 2.75, 0], 0.02, TUBE, { bone: J.yard });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), conn, { bone: J.yard, at: [0, 2.75, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 8, 6), conn, { bone: J.yard, at: [s * 1.7, 2.75, 0] });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), P.zipTie, {
      bone: J.yard, at: [s * 1.55, 2.75, 0], dir: [1, 0, 0],
    });
  }

  // ---- sails ----
  for (const s of [1, -1]) {
    // upper panel outline (x along outward, y up relative to the yard at 2.75)
    const upper: [number, number][] = [
      [0.06, 0.0], [0.9, 0.02], [1.7, 0.0], [1.6, -0.45], [1.0, -0.38], [0.5, -0.33], [0.06, -0.3],
    ];
    const outline = upper.map(([x, y]) => [x, y] as [number, number]);
    for (const z of [0.05, -0.05]) {
      b.extrude(outline, {
        at: [0, 2.75, z], x: [s, 0, 0], thickness: 0.008,
        color: z > 0 ? P.sail : P.sailTint, bone: J.yard, smoothing: 0,
      });
    }
    // lower panel
    const lower: [number, number][] = [[0.1, 0], [1.2, 0], [1.5, 0.12], [1.2, 0.25], [0.1, 0.25]];
    b.extrude(lower, {
      at: [0, 2.3, 0.0], x: [s, 0, 0], thickness: 0.008, color: P.sailTint, bone: J.yard,
    });
    // ribs
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const tip: [number, number, number] = [s * (0.9 + 0.8 * t), 2.75 - 0.05 - 0.4 * t, 0.0];
      const root: [number, number, number] = [s * 0.06, 2.75, 0];
      b.rod(root, tip, 0.01, i % 2 ? SHADE : TUBE, { bone: J.yard });
      b.part(new THREE.SphereGeometry(0.022, 6, 5), P.rib, { bone: J.yard, at: tip });
      const ey: [number, number, number] = [
        s * (0.06 + (tip[0] * s - 0.06) * 0.6), 2.75 + (tip[1] - 2.75) * 0.6, 0.058,
      ];
      b.part(new THREE.SphereGeometry(0.012, 5, 4), conn, { bone: J.yard, at: ey });
    }
    // stays
    b.rod([0, 3.0, 0], [s * 1.7, 2.75, 0], 0.006, P.rope, { bone: J.mast });
    b.rod([s * 1.7, 2.75, 0], [s * 1.64, 1.66, 0.46], 0.006, P.rope, { bone: J.mast });
    b.rod([s * 1.7, 2.75, 0], [s * 1.64, 1.66, -0.46], 0.006, P.rope, { bone: J.mast });
    // lower sail hanging line
    b.rod([s * 0.1, 2.3, 0], [s * 1.5, 2.42, 0], 0.006, P.rope, { bone: J.yard });
  }
  b.rod([0, 2.9, 0], [0, 1.9, 0.5], 0.006, P.rope, { bone: J.mast });
  b.part(new THREE.SphereGeometry(0.02, 6, 5), conn, { bone: J.mast, at: [0, 1.9, 0.5] });

  // ---- pennant + vane ----
  b.rod([0, 3.0, 0], [0, 3.1, 0], 0.005, P.steelDark, { bone: J.mast });
  b.extrude([[0, 0], [0.3, -0.04], [0, -0.1]], {
    at: [0.0, 3.09, 0.01], x: [0, 0, -1], thickness: 0.006, color: P.pennant, bone: J.mast,
  });
  b.rod([0, 2.96, 0.0], [0, 2.96, 0.14], 0.007, P.steel, { bone: J.mast });
  b.spike([0, 2.96, 0.14], [0, 0, 1], 0.07, 0.02, { color: P.steel, bone: J.mast });
  b.extrude([[0, 0], [-0.06, 0.04], [-0.06, -0.04]], {
    at: [0, 2.96, 0], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.005, color: P.steel, bone: J.mast,
  });
  void R; void frame; void M;
}
    return buildSails;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "strandbeestWindwalker" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.35,0], dir: [0,1,0], role: "spine" });
  J["crank"] = b.joint("crank", { parent: J["body"], at: [0,1.35,0], dir: [1,0,0], role: "hinge", group: "drive" });
  J["bank"] = b.joint("bank", { parent: J["body"], at: [0,1.69,0], dir: [0,1,0], role: "spine", group: "bank" });
  J["mast"] = b.joint("mast", { parent: J["body"], at: [0,1.66,0], dir: [0,1,0], role: "spine", group: "sails" });
  J["yard"] = b.joint("yard", { parent: J["mast"], at: [0,2.75,0], dir: [1,0,0], role: "hinge", group: "sails" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

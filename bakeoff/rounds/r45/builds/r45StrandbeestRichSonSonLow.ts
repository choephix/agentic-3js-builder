import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Strandbeest Wind Walker",
  "description": "A Theo Jansen-style kinetic sculpture: a yellow PVC-tube beach creature on eight Holy-Number linkage legs, with crank axles, bottle lungs on its back, and cream wind sails on a mast."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  pvcYellow: "#f2c230",
  pvcYellowDark: "#c99a18",
  pvcYellowLight: "#ffe27a",
  elbowInk: "#2a2a30",
  zipWhite: "#f4f4ee",
  axleSteel: "#8b8f98",
  steelDark: "#555a64",
  brass: "#c8923a",
  sailCream: "#f1e6c8",
  sailShade: "#d9c9a0",
  rope: "#b08a56",
  bottleBlue: "#6fb7d6",
  bottleGreen: "#8fcf9a",
  capOrange: "#e4572e",
  pennantRed: "#d93a2b",
  rubber: "#2b2b30",
  teal: "#2c8f9e",
  eyeWhite: "#f7f7f2",
};
const M = {
  hipL1: [0.62, 1.15, 1.5] as [number, number, number],
  hipL2: [0.85, 1.15, 0.5] as [number, number, number],
  hipL3: [0.62, 1.15, -0.5] as [number, number, number],
  hipL4: [0.85, 1.15, -1.5] as [number, number, number],
  hipR1: [-0.62, 1.15, 1.5] as [number, number, number],
  hipR2: [-0.85, 1.15, 0.5] as [number, number, number],
  hipR3: [-0.62, 1.15, -0.5] as [number, number, number],
  hipR4: [-0.85, 1.15, -1.5] as [number, number, number],
  pivotAxle1: [0, 1.15, 1.5] as [number, number, number],
  pivotAxle2: [0, 1.15, 0.5] as [number, number, number],
  pivotAxle3: [0, 1.15, -0.5] as [number, number, number],
  pivotAxle4: [0, 1.15, -1.5] as [number, number, number],
  crankAxle1: [0, 1.07, 1.2] as [number, number, number],
  crankAxle2: [0, 1.07, 0.2] as [number, number, number],
  crankAxle3: [0, 1.07, -0.8] as [number, number, number],
  crankAxle4: [0, 1.07, -1.8] as [number, number, number],
  frameRailL: [0.38, 1.22, 0] as [number, number, number],
  frameRailR: [-0.38, 1.22, 0] as [number, number, number],
  rackTop: [0, 1.4, 0] as [number, number, number],
  noseRoot: [0, 1.2, 1.95] as [number, number, number],
  noseTip: [0, 1.15, 2.6] as [number, number, number],
  mastBase: [0, 1.3, -1.4] as [number, number, number],
  mastTop: [0, 2.45, -1.55] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // frameNose
  (() => {
function buildFrameNose({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const tube = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string, bone: any = J.body) =>
    b.rod(a, c, r, col, { bone, sides: 8, caps: "flat" });

  const ball = (p: THREE.Vector3, r: number, col: string, bone: any = J.body) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at: p });

  const tie = (p: THREE.Vector3, dir: THREE.Vector3, bone: any = J.body) =>
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), P.zipWhite, { bone, at: p, dir });

  const joint = (p: THREE.Vector3) => ball(p, 0.032, P.elbowInk);

  // Side rails
  for (const s of [1, -1]) {
    tube(V(s * 0.38, 1.22, -2.0), V(s * 0.38, 1.22, 1.95), 0.035, P.pvcYellow);
    tube(V(s * 0.38, 1.205, -2.0), V(s * 0.38, 1.205, 1.95), 0.012, P.pvcYellowLight);
  }
  // Keel
  tube(V(0, 1.0, -1.9), V(0, 1.0, 1.9), 0.035, P.pvcYellowDark);

  // Zig-zag bracing between rails and keel
  const zs = [-1.9, -1.45, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 1.9];
  for (const s of [1, -1]) {
    for (let i = 0; i < zs.length; i++) {
      const z = zs[i];
      const top = V(s * 0.38, 1.22, z);
      const bot = V(0, 1.0, z);
      tube(top, bot, 0.022, P.pvcYellow);
      joint(top);
      joint(bot);
      if (i < zs.length - 1) {
        const nz = zs[i + 1];
        const a = i % 2 ? top : bot;
        const c = i % 2 ? V(0, 1.0, nz) : V(s * 0.38, 1.22, nz);
        tube(a, c, 0.02, P.pvcYellowDark);
      }
      if (i % 2 === 0) tie(V(s * 0.19, 1.11, z), V(s * 0.38, 0.22, 0).normalize());
    }
  }

  // Cross tubes with pillow blocks at pivot stations
  for (const key of ["pivotAxle1", "pivotAxle2", "pivotAxle3", "pivotAxle4"]) {
    const z = M[key][2];
    tube(V(-0.38, 1.22, z), V(0.38, 1.22, z), 0.03, P.pvcYellow);
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.steelDark, { bone: J.body, at: V(s * 0.38, 1.15, z) });
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), P.axleSteel, {
        bone: J.body,
        at: V(s * 0.38, 1.15, z),
        dir: [1, 0, 0],
      });
      joint(V(s * 0.38, 1.22, z));
    }
  }
  // Crank bearing blocks on the keel posts
  for (const key of ["crankAxle1", "crankAxle2", "crankAxle3", "crankAxle4"]) {
    const z = M[key][2];
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.08, 0.08, 0.1), P.steelDark, { bone: J.body, at: V(s * 0.3, 1.07, z) });
      tube(V(s * 0.3, 1.07, z), V(s * 0.38, 1.22, z), 0.018, P.pvcYellowDark);
    }
  }

  // Rail end elbows
  for (const s of [1, -1]) {
    joint(V(s * 0.38, 1.22, -2.0));
    joint(V(s * 0.38, 1.22, 1.95));
  }
  tube(V(-0.38, 1.22, -2.0), V(0.38, 1.22, -2.0), 0.03, P.pvcYellow);
  tube(V(-0.38, 1.22, 1.9), V(0.38, 1.22, 1.9), 0.03, P.pvcYellow);

  // Nose prow: two converging tubes
  const root = V(0, 1.2, 1.95);
  const tip = V(0, 1.15, 2.6);
  for (const s of [1, -1]) {
    b.sweep([V(s * 0.38, 1.22, 1.9), V(s * 0.2, 1.2, 2.2), V(s * 0.03, 1.16, 2.57)], [0.035, 0.018], {
      bone: J.head,
      color: P.pvcYellow,
      sides: 8,
    });
    joint(V(s * 0.2, 1.2, 2.2));
  }
  tube(V(-0.2, 1.2, 2.2), V(0.2, 1.2, 2.2), 0.02, P.pvcYellowDark, J.head);
  tube(root, tip, 0.015, P.pvcYellowDark, J.head);
  ball(tip, 0.04, P.elbowInk, J.head);
  tie(V(0.12, 1.19, 2.3), V(0, 0, 1), J.head);
  tie(V(-0.12, 1.19, 2.3), V(0, 0, 1), J.head);

  // Bottle eyes
  for (const s of [1, -1]) {
    const c = V(s * 0.3, 1.38, 2.05);
    tube(V(s * 0.3, 1.22, 1.95), V(s * 0.3, 1.3, 2.02), 0.02, P.pvcYellow, J.head);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 12), P.eyeWhite, { bone: J.head, at: c, dir: [0, 0, 1] });
    b.part(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.eyeWhite, {
      bone: J.head,
      at: V(s * 0.3, 1.38, 2.13),
      dir: [0, 0, 1],
    });
    b.part(new THREE.TorusGeometry(0.075, 0.015, 6, 14), P.teal, {
      bone: J.head,
      at: V(s * 0.3, 1.38, 2.2),
      dir: [0, 0, 1],
      axis: "z",
    });
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), P.rubber, {
      bone: J.head,
      at: V(s * 0.3, 1.38, 2.225),
      dir: [0, 0, 1],
    });
    tie(V(s * 0.3, 1.38, 1.99), V(0, 0, 1), J.head);
  }

  // Wind vane spinner
  const vb = V(0, 1.24, 2.35);
  tube(V(0, 1.2, 2.35), V(0, 1.55, 2.35), 0.012, P.brass, J.head);
  ball(V(0, 1.55, 2.35), 0.025, P.brass, J.head);
  for (const a of [0, 1, 2, 3]) {
    const ang = (a * Math.PI) / 2 + 0.3;
    const e = V(Math.cos(ang) * 0.14, 1.55 + Math.sin(ang) * 0.14, 2.37);
    tube(V(0, 1.55, 2.37), e, 0.007, P.brass, J.head);
    ball(e, 0.02, P.rubber, J.head);
  }

  // Rack/mast foot saddles on rails
  for (const s of [1, -1]) {
    for (const z of [0.9, -0.9, -1.4]) {
      b.part(new THREE.BoxGeometry(0.09, 0.05, 0.14), P.pvcYellowDark, { bone: J.body, at: V(s * 0.38, 1.27, z) });
    }
    tie(V(s * 0.38, 1.22, 1.2 + R() * 0.2), V(0, 0, 1));
  }
}
    return buildFrameNose;
  })(),
  // legsFront
  (() => {
function buildLegsFront({ b, J, P, M }: any) {
  const R = rng(5);
  const N: Record<string, [number, number]> = {
    P: [0, 0], C: [-0.3, -0.08], K: [-0.3, -0.26], A: [-0.42, 0.22],
    B: [-0.8, -0.14], D: [-0.46, -0.5], E: [-0.1, -0.46], F: [0.05, -1.11],
  };
  const links = ["CK", "PA", "KA", "AB", "KB", "BD", "PE", "ED", "DF", "EF"];
  const long = new Set(["BD", "DF", "AB", "EF"]);
  const stations: [number, number, number][] = [[1, 1.5, 0.62], [2, 0.5, 0.85]];

  for (const [, hz, px] of stations) {
    for (const s of [1, -1]) {
      const bone = s > 0 ? (hz > 1 ? J.legL1 : J.legL2) : (hz > 1 ? J.legR1 : J.legR2);
      const pos = (k: string, o = 0): [number, number, number] => [
        s * (px + o), 1.15 + N[k][1], hz + N[k][0],
      ];
      for (const l of links) {
        for (const o of [-0.03, 0.03]) {
          const col = long.has(l) && l[0] === "B" ? P.pvcYellowDark : P.pvcYellow;
          b.rod(pos(l[0], o), pos(l[1], o), 0.022, col, { bone });
        }
      }
      for (const k of Object.keys(N)) {
        b.rod(pos(k, -0.03), pos(k, 0.03), 0.014, P.steelDark, { bone });
        b.part(new THREE.SphereGeometry(k === "F" ? 0.034 : 0.03, 8, 6), P.elbowInk, { bone, at: pos(k) });
        for (const o of [-0.045, 0.045])
          b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.012, 8), P.steelDark, {
            bone, at: pos(k, o), dir: [1, 0, 0],
          });
      }
      // brass bushing at K
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), P.brass, { bone, at: pos("K"), dir: [1, 0, 0] });
      // zip ties
      for (const [k, kk] of [["A", "B"], ["D", "E"], ["B", "D"], ["P", "A"]]) {
        const a = pos(k), c = pos(kk);
        const m: [number, number, number] = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
        b.part(new THREE.TorusGeometry(0.03, 0.006, 5, 10), P.zipWhite, {
          bone, at: m, dir: [a[0] - c[0], a[1] - c[1], a[2] - c[2]], axis: "z",
        });
      }
      // dark yellow band where long links cross
      const bd = pos("B"), dd = pos("D");
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 8), P.pvcYellowDark, {
        bone, at: [bd[0], (bd[1] + dd[1]) / 2 + 0.05, (bd[2] + dd[2]) / 2], dir: [1, 0, 0],
      });
      // foot
      const f = pos("F");
      b.part(new THREE.SphereGeometry(0.05, 10, 8), P.rubber, { bone, at: [f[0], 0.04, f[2]] });
      b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.025, 8), P.capOrange, { bone, at: [f[0], 0.085, f[2]] });
      b.part(new THREE.TorusGeometry(0.036, 0.01, 6, 10), P.brass, {
        bone, at: [f[0], 0.105, f[2]], dir: [0, 1, 0], axis: "z",
      });
    }
  }
}
    return buildLegsFront;
  })(),
  // legsRear
  (() => {
function buildLegsRear({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const NODES: Record<string, [number, number]> = {
    P: [0, 0], C: [-0.3, -0.08], K: [-0.3, -0.26], A: [-0.42, 0.22],
    B: [-0.8, -0.14], D: [-0.46, -0.5], E: [-0.1, -0.46], F: [0.05, -1.11],
  };
  const LINKS = ["PA", "KA", "AB", "KB", "BD", "PE", "ED", "DF", "EF", "CK"];
  const stations: [number, number][] = [[-0.5, 0.62], [-1.5, 0.85]];
  const sphere = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r: number, l: number, s = 8) => new THREE.CylinderGeometry(r, r, l, s);

  for (const side of [1, -1]) {
    stations.forEach(([hipZ, px], si) => {
      const bone = J[`leg${side > 0 ? "L" : "R"}${si + 3}`];
      const pos = (n: string, off = 0): [number, number, number] => {
        const [u, v] = NODES[n];
        return [side * (px + off), 1.15 + v, hipZ + u];
      };
      // double rods
      for (const l of LINKS) {
        for (const o of [-0.03, 0.03]) {
          b.rod(pos(l[0], o), pos(l[1], o), 0.022, P.pvcYellow, { bone, sides: 8 });
        }
      }
      // nodes
      for (const n of Object.keys(NODES)) {
        b.part(sphere(0.03), P.elbowInk, { bone, at: pos(n, 0.045) });
        b.part(sphere(0.03), P.elbowInk, { bone, at: pos(n, -0.045) });
        b.part(cyl(0.012, 0.1, 6), P.steelDark, { bone, at: pos(n), dir: [1, 0, 0] });
        if (n === "C" || n === "P") {
          b.part(cyl(0.02, 0.14, 8), P.axleSteel, { bone, at: pos(n), dir: [1, 0, 0] });
        }
      }
      // brass bushing on K
      b.part(cyl(0.032, 0.05, 8), P.brass, { bone, at: pos("K", 0.045), dir: [1, 0, 0] });
      b.part(cyl(0.032, 0.05, 8), P.brass, { bone, at: pos("K", -0.045), dir: [1, 0, 0] });
      // dark band where long links cross
      for (const o of [-0.03, 0.03]) {
        const a = pos("B", o), d = pos("D", o);
        b.part(cyl(0.026, 0.04, 8), P.pvcYellowDark, {
          bone, at: [(a[0] + d[0]) / 2, (a[1] + d[1]) / 2, (a[2] + d[2]) / 2],
          dir: [0, d[1] - a[1], d[2] - a[2]],
        });
      }
      // grip band on P-A
      for (const o of [-0.03, 0.03]) {
        const a = pos("P", o), c = pos("A", o);
        for (let i = 0; i < 3; i++) {
          const t = 0.2 + i * 0.12;
          b.part(cyl(0.028, 0.035, 8), P.rope, {
            bone,
            at: [a[0], a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t],
            dir: [0, c[1] - a[1], c[2] - a[2]],
          });
        }
      }
      // zip ties
      for (const n of ["A", "B", "D", "E"]) {
        const p = pos(n, 0);
        b.part(new THREE.TorusGeometry(0.04, 0.005, 4, 10), P.zipWhite, {
          bone, at: [p[0], p[1], p[2]], dir: [1, 0, 0], axis: "z",
        });
      }
      // foot
      const f = pos("F", 0);
      b.part(sphere(0.05, 10, 8), P.rubber, { bone, at: [f[0], 0.04, f[2]] });
      b.part(cyl(0.04, 0.03, 8), P.capOrange, { bone, at: [f[0], 0.09, f[2]] });
      b.part(cyl(0.035, 0.03, 8), P.brass, { bone, at: [f[0], 0.12, f[2]] });
      // spacer bolts at F
      b.part(cyl(0.01, 0.07, 6), P.steelDark, { bone, at: [f[0], 0.1, f[2]], dir: [1, 0, 0] });
    });
  }
}
    return buildLegsRear;
  })(),
  // driveline
  (() => {
function buildDriveline({ b, J, P, M }: Ctx) {
  const X = 0.95;
  const R = rng(5);
  const cyl = (r: number, h: number, n = 10) => new THREE.CylinderGeometry(r, r, h, n);
  // axis-aligned cylinders: along X, along Z
  const alongX = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(geo, color, { bone, at, dir: [1, 0, 0] });
  const alongZ = (geo: THREE.BufferGeometry, color: string, at: number[], bone: any) =>
    b.part(geo, color, { bone, at, dir: [0, 0, 1] });
  const stations = [1.5, 0.5, -0.5, -1.5];
  const planeXs = [0.62, 0.85, 0.62, 0.85];

  for (let i = 0; i < 4; i++) {
    const pv = M["pivotAxle" + (i + 1)];
    const cr = M["crankAxle" + (i + 1)];
    const cj = J["crank" + (i + 1)];
    // pivot axle
    alongX(cyl(0.022, 2 * X), P.axleSteel, pv, J.body);
    // crank axle
    alongX(cyl(0.022, 2 * X), P.axleSteel, cr, cj);
    for (const s of [1, -1]) {
      // collars & end caps
      for (const [bone, m, ex] of [[J.body, pv, 0], [cj, cr, 0]] as any[]) {
        alongX(cyl(0.04, 0.04), P.brass, [s * (X - 0.03), m[1], m[2]], bone);
        alongX(cyl(0.035, 0.03, 6), P.steelDark, [s * (X + 0.015), m[1], m[2]], bone);
        alongX(cyl(0.028, 0.02, 8), P.axleSteel, [s * (X + 0.04), m[1], m[2]], bone);
      }
      // crank arms at leg planes (double plane +-0.03)
      for (const d of [-0.03, 0.03]) {
        const x = s * planeXs[i] + d;
        b.rod([x, cr[1], cr[2]], [x, cr[1] - 0.18, cr[2]], 0.02, P.brass, { bone: cj });
        alongX(cyl(0.035, 0.012, 12), P.brass, [x, cr[1], cr[2]], cj);
        alongX(cyl(0.022, 0.05, 8), P.steelDark, [x, cr[1] - 0.18, cr[2]], cj);
      }
    }
    // cog discs between rails
    for (const x of [-0.2, 0.2]) {
      alongX(cyl(0.09, 0.025, 12), P.axleSteel, [x, cr[1], cr[2]], cj);
      alongX(cyl(0.035, 0.035, 8), P.steelDark, [x, cr[1], cr[2]], cj);
    }
  }

  // bottle rack: 2 rows of 5 per side
  const zs = [1.4, 0.95, 0.5, 0.05, -0.4];
  for (const s of [1, -1]) {
    for (let row = 0; row < 2; row++) {
      const x = s * (0.3 + row * 0.18);
      const y = 1.55 + row * 0.04;
      zs.forEach((z, k) => {
        const col = (k + row) % 2 ? P.bottleGreen : P.bottleBlue;
        const body = alongZ(cyl(0.065, 0.34, 10), col, [x, y, z], J.body);
        b.part(new THREE.ConeGeometry(0.065, 0.08, 10), col, { bone: J.body, at: [x, y, z + 0.21], dir: [0, 0, 1] });
        alongZ(cyl(0.025, 0.04, 8), P.capOrange, [x, y, z + 0.27], J.body);
        // cradle
        b.part(new THREE.BoxGeometry(0.16, 0.025, 0.04), P.pvcYellow, { bone: J.body, at: [x, y - 0.075, z - 0.08] });
        b.part(new THREE.BoxGeometry(0.15, 0.015, 0.012), P.zipWhite, { bone: J.body, at: [x, y + 0.062, z - 0.08] });
        // piston rod
        alongZ(cyl(0.008, 0.16, 6), P.axleSteel, [x, y, z + 0.37], J.body);
        // hose to crank axle
        if (row === 0 && k < 4) {
          const cz = M["crankAxle" + (k + 1)][2];
          b.rod([x, y - 0.07, z + 0.27], [s * 0.25, 1.1, cz], 0.008, P.teal, { bone: J.body });
        }
      });
    }
    // cradle rails along z
    for (const row of [0, 1])
      alongZ(cyl(0.018, 1.95, 8), P.pvcYellow, [s * (0.3 + row * 0.18), 1.46, 0.5], J.body);
  }
  void R; void frame;
}
    return buildDriveline;
  })(),
  // sailRig
  (() => {
function buildSailRig({ b, J, P, M }: Ctx) {
  const bone = J.mast;
  const R = rng(5);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const base = V(0, 1.3, -1.4);
  const top = V(0, 2.45, -1.55);

  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, col: string) =>
    b.rod(a, c, r, col, { bone, sides: 6 } as any);
  const ball = (p: THREE.Vector3, r: number, col: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { bone, at: p });
  const box = (p: THREE.Vector3, s: [number, number, number], col: string) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: p });
  const zip = (p: THREE.Vector3, r: number) =>
    b.part(new THREE.CylinderGeometry(r, r, 0.012, 8), P.zipWhite, { bone, at: p, dir: [0, 1, 0.1] });

  // mast
  rod(base, top, 0.04, P.pvcYellow);
  box(V(0, 1.33, -1.4), [0.22, 0.07, 0.22], P.pvcYellowDark);
  box(V(0, 1.4, -1.41), [0.16, 0.08, 0.16], P.elbowInk);
  for (const t of [0.25, 0.55, 0.85]) {
    const p = base.clone().lerp(top, t);
    ball(p, 0.06, P.elbowInk);
    zip(p.clone().add(V(0, 0.08, 0)), 0.05);
  }
  ball(top, 0.055, P.brass);
  b.part(new THREE.ConeGeometry(0.03, 0.12, 8), P.brass, { bone, at: top.clone().add(V(0, 0.08, 0)) });

  // pennant
  const sp = top.clone().add(V(0, 0.02, 0));
  rod(sp, sp.clone().add(V(0, 0, -0.25)), 0.012, P.pvcYellow);
  b.extrude([[0, 0.05], [0.4, 0.015], [0.4, -0.015], [0, -0.05]], {
    at: sp.clone().add(V(0, 0.03, -0.25)), x: [0, 0, -1], thickness: 0.006, color: P.pennantRed, bone,
  } as any);
  box(sp.clone().add(V(0, 0.03, -0.3)), [0.01, 0.02, 0.01], P.brass);

  for (const s of [1, -1]) {
    const tip = V(s * 0.98, 1.75, -1.2);
    const tail = V(s * 0.95, 1.65, -2.6);
    const m0 = top.clone().add(V(0, -0.1, 0));
    // spars
    rod(m0, tip, 0.024, P.pvcYellow);
    rod(m0, tail, 0.022, P.pvcYellow);
    rod(tip, tail, 0.02, P.pvcYellow);
    ball(tip, 0.035, P.elbowInk);
    ball(tail, 0.035, P.elbowInk);
    // sail panel: two triangles via slab
    const sail = b.slab([m0.clone().add(V(0, -0.03, 0)), tip.clone().add(V(0, -0.03, 0)), tail.clone().add(V(0, -0.03, 0))], {
      color: P.sailCream, thickness: 0.01, bone,
    });
    // shade band near root
    const q = (t: number) => m0.clone().lerp(tip, t);
    const w = (t: number) => m0.clone().lerp(tail, t);
    b.slab([m0.clone().add(V(0, -0.04, 0)), q(0.3).add(V(0, -0.04, 0)), w(0.3).add(V(0, -0.04, 0))], {
      color: P.sailShade, thickness: 0.012, bone,
    });
    // battens
    for (let i = 1; i <= 4; i++) {
      const t = i / 5;
      rod(m0.clone().lerp(tip, t * 0.9).add(V(0, -0.03, 0)), m0.clone().lerp(tail, t * 0.9).add(V(0, -0.03, 0)), 0.012, P.pvcYellowLight);
    }
    // seam strips
    for (const t of [0.45, 0.7]) {
      rod(m0.clone().lerp(tip, t).add(V(0, -0.015, 0)), m0.clone().lerp(tail, t).add(V(0, -0.015, 0)), 0.005, P.sailShade);
    }
    // grommets
    for (let i = 1; i < 6; i++) {
      ball(tip.clone().lerp(tail, i / 6).add(V(0, -0.02, 0)), 0.012, P.brass);
    }
    // rigging
    rod(top, V(s * 0.38, 1.22, -1.9), 0.006, P.rope);
    rod(top, V(s * 0.38, 1.22, -0.8), 0.006, P.rope);
    rod(top, tip, 0.006, P.rope);
    rod(top, tail, 0.006, P.rope);
    // float
    rod(tip, tip.clone().add(V(0, -0.1, 0)), 0.006, P.rope);
    const fp = tip.clone().add(V(0, -0.22, 0));
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8), P.bottleBlue, { bone, at: fp });
    b.part(new THREE.ConeGeometry(0.05, 0.06, 8), P.bottleBlue, { bone, at: fp.clone().add(V(0, 0.13, 0)) });
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 8), P.capOrange, { bone, at: fp.clone().add(V(0, 0.18, 0)) });
    zip(tip.clone().add(V(0, -0.02, 0)), 0.03);
    // jib
    const jt = V(s * 0.0, 2.3, -1.5);
  }
  // jib sail
  const jTop = base.clone().lerp(top, 0.9);
  const jBot = V(0, 1.45, -0.7);
  const jFoot = V(0, 1.45, -1.38);
  b.slab([jTop.clone().add(V(0, 0, 0.04)), jBot, jFoot], { color: P.sailCream, thickness: 0.01, bone });
  rod(jTop, jBot, 0.012, P.rope);
  rod(jBot, jFoot, 0.014, P.pvcYellow);
  ball(jBot, 0.02, P.brass);
  rod(jBot, V(0, 1.22, -0.8), 0.006, P.rope);

  // rear arch
  const aL = V(0.9, 1.3, -2.6), aR = V(-0.9, 1.3, -2.6), aTop = V(0, 1.95, -2.6);
  rod(aL, V(0.45, 1.85, -2.6), 0.025, P.pvcYellow);
  rod(V(0.45, 1.85, -2.6), aTop, 0.025, P.pvcYellow);
  rod(aR, V(-0.45, 1.85, -2.6), 0.025, P.pvcYellow);
  rod(V(-0.45, 1.85, -2.6), aTop, 0.025, P.pvcYellow);
  for (const p of [aL, aR, V(0.45, 1.85, -2.6), V(-0.45, 1.85, -2.6), aTop]) ball(p, 0.04, P.elbowInk);
  rod(aTop, V(0, 2.3, -1.6), 0.008, P.rope);
  void R; void frame; void M;
}
    return buildSailRig;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "strandbeestWindWalker" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.15,0], dir: [0,0,1], role: "spine" });
  J["head"] = b.joint("head", { parent: J["body"], at: [0,1.2,1.95], dir: [0,0,1], role: "head", group: "body" });
  J["mast"] = b.joint("mast", { parent: J["body"], at: [0,1.3,-1.4], dir: [0,1,0], role: "hinge", group: "sail" });
  J["crank1"] = b.joint("crank1", { parent: J["body"], at: [0,1.07,1.2], dir: [1,0,0], role: "hinge", group: "drive" });
  J["crank2"] = b.joint("crank2", { parent: J["body"], at: [0,1.07,0.2], dir: [1,0,0], role: "hinge", group: "drive" });
  J["crank3"] = b.joint("crank3", { parent: J["body"], at: [0,1.07,-0.8], dir: [1,0,0], role: "hinge", group: "drive" });
  J["crank4"] = b.joint("crank4", { parent: J["body"], at: [0,1.07,-1.8], dir: [1,0,0], role: "hinge", group: "drive" });
  J["legL1"] = b.joint("legL1", { parent: J["body"], at: [0.62,1.15,1.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legL2"] = b.joint("legL2", { parent: J["body"], at: [0.85,1.15,0.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legL3"] = b.joint("legL3", { parent: J["body"], at: [0.62,1.15,-0.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legL4"] = b.joint("legL4", { parent: J["body"], at: [0.85,1.15,-1.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legR1"] = b.joint("legR1", { parent: J["body"], at: [-0.62,1.15,1.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legR2"] = b.joint("legR2", { parent: J["body"], at: [-0.85,1.15,0.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legR3"] = b.joint("legR3", { parent: J["body"], at: [-0.62,1.15,-0.5], dir: [0,-1,0], role: "leg", group: "legs" });
  J["legR4"] = b.joint("legR4", { parent: J["body"], at: [-0.85,1.15,-1.5], dir: [0,-1,0], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

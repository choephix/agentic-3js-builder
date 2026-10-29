import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "../../../../src/index";

export const meta = {
  "name": "Chibi Axolotl",
  "description": "A chibi axolotl with a big round head, three frilly pink gill stalks on each cheek, a wide smiling face, stubby legs and a long finned tail."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  blushBody: "#ffc0ac",
  blushTop: "#ffd8c6",
  belly: "#ffeee2",
  gillPink: "#ff7d9e",
  gillDeep: "#e04f78",
  gillTip: "#ffb0c2",
  tailFin: "#ff9fb0",
  tailFinEdge: "#ffd0d8",
  eyeInk: "#2a1a24",
  eyeGlow: "#ffffff",
  mouthLine: "#8c4a5e",
  cheekBlush: "#ff9a8a",
  nostril: "#e3768f",
  toe: "#ffd7c7",
  shadeUnder: "#f0a48e",
};
const M = {
  neckBase: [0, 0.3, 0.16] as [number, number, number],
  tailBase: [0, 0.26, -0.16] as [number, number, number],
  shoulderL: [0.14, 0.24, 0.12] as [number, number, number],
  shoulderR: [-0.14, 0.24, 0.12] as [number, number, number],
  hipL: [0.14, 0.24, -0.1] as [number, number, number],
  hipR: [-0.14, 0.24, -0.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const jaw = J.jaw;
  const C = [0, 0.32, 0.30] as const;

  const sph = (w: number, h: number, d: number, seg = 14) => {
    const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 4));
    g.scale(w, h, d);
    return g;
  };
  const put = (geo: THREE.BufferGeometry, color: string, at: number[], extra: any = {}) =>
    b.part(geo, color, { bone: head, at, ...extra });

  // skull
  put(sph(0.21, 0.18, 0.17, 16), P.blushBody, [C[0], C[1], C[2]]);
  // crown cap
  put(sph(0.19, 0.12, 0.15, 14), P.blushTop, [0, 0.4, 0.29]);
  // back shade crescent
  put(sph(0.17, 0.13, 0.05, 12), P.shadeUnder, [0, 0.27, 0.15]);
  // snout
  put(sph(0.12, 0.085, 0.09, 12), P.blushBody, [0, 0.28, 0.4]);

  // nose
  for (const s of [1, -1]) put(sph(0.011, 0.008, 0.008, 6), P.nostril, [s * 0.025, 0.305, 0.485]);

  // eyes
  for (const s of [1, -1]) {
    const ex = s * 0.1;
    put(sph(0.04, 0.047, 0.015, 12), P.eyeInk, [ex, 0.31, 0.435], { dir: [s * 0.3, 0, 1], axis: "z" });
    put(sph(0.012, 0.014, 0.006, 6), P.eyeGlow, [ex - s * 0.012, 0.325, 0.447]);
    put(sph(0.006, 0.006, 0.004, 5), P.eyeGlow, [ex + s * 0.012, 0.293, 0.447]);
    // lid line
    put(new THREE.BoxGeometry(0.07, 0.007, 0.006), P.eyeInk, [ex, 0.36, 0.43], { rotation: [0, 0, s * -12] });
    // blush
    put(sph(0.035, 0.022, 0.008, 10), P.cheekBlush, [s * 0.15, 0.245, 0.4], { dir: [s * 0.6, 0, 1], axis: "z" });
  }

  // mouth smile: arcs of small segments
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const x0 = s * (0.01 + i * 0.022);
      const y = 0.25 - Math.pow(i * 0.022, 2) * -6 + 0;
      const yy = 0.248 + i * 0.004;
      put(new THREE.BoxGeometry(0.026, 0.006, 0.006), P.mouthLine, [x0, yy, 0.48 - i * 0.012], {
        rotation: [0, 0, s * 12],
      });
      void y;
    }
    put(new THREE.BoxGeometry(0.006, 0.014, 0.006), P.mouthLine, [s * 0.096, 0.262, 0.435]);
  }

  // jaw
  b.part(sph(0.095, 0.05, 0.08, 12), P.blushBody, { bone: jaw, at: [0, 0.225, 0.37] });
  b.part(sph(0.07, 0.03, 0.05, 10), P.belly, { bone: jaw, at: [0, 0.205, 0.38] });

  // gills
  const r = rng(5);
  for (const s of [1, -1]) {
    const angs = [30, 90, 150];
    angs.forEach((a, k) => {
      const len = k === 1 ? 0.17 : 0.13;
      const az = (a * Math.PI) / 180;
      // direction: outward in x, back/forward by angle, slightly up
      const dz = Math.cos(az) * 0.5 - 0.25;
      const dy = 0.15 + (k === 0 ? 0.25 : k === 2 ? -0.1 : 0.08);
      const dir = new THREE.Vector3(s * 1, dy, dz).normalize();
      const base = new THREE.Vector3(s * 0.185, 0.34 + (k - 1) * -0.0, 0.26 + (1 - k) * 0.04);
      base.y = 0.34 + (k === 0 ? 0.03 : k === 2 ? -0.03 : 0);
      const tip = base.clone().addScaledVector(dir, len);
      const mid = base.clone().addScaledVector(dir, len * 0.4);
      b.rod(base.toArray(), mid.toArray(), [0.017, 0.013], P.gillDeep, { bone: head });
      b.rod(mid.toArray(), tip.toArray(), [0.013, 0.006], P.gillPink, { bone: head });
      // frilly lobes
      const n = 6;
      for (let i = 0; i < n; i++) {
        const t = 0.25 + (i / n) * 0.7;
        const p = base.clone().addScaledVector(dir, len * t);
        const side = i % 2 ? 1 : -1;
        const perp = new THREE.Vector3(0, 1, 0).cross(dir).normalize().multiplyScalar(side);
        const up = new THREE.Vector3(0, side * 0.6 + 0.4, 0);
        const lobeDir = perp.clone().add(up).normalize();
        const l = 0.045 * (1 - t * 0.5) + r() * 0.008;
        const e = p.clone().addScaledVector(lobeDir, l);
        b.rod(p.toArray(), e.toArray(), [0.007, 0.003], i % 2 ? P.gillPink : P.gillTip, { bone: head });
        put(sph(0.007, 0.007, 0.007, 5), P.gillTip, e.toArray());
      }
      put(sph(0.012, 0.012, 0.012, 6), P.gillTip, tip.toArray());
    });
  }
}
    return buildHead;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: any) {
  const R = rng(11);
  const bone = J.body;

  // Main torso: loft from rump to chest, widest just behind mid
  const stations = [
    { at: [0, 0.26, -0.17], w: 0.26, h: 0.24 },
    { at: [0, 0.255, -0.08], w: 0.35, h: 0.29 },
    { at: [0, 0.25, 0.02], w: 0.38, h: 0.31 },
    { at: [0, 0.26, 0.11], w: 0.35, h: 0.3 },
    { at: [0, 0.28, 0.17], w: 0.3, h: 0.27 },
  ];
  b.loft(stations, { bone, color: P.blushBody });

  // Lighter crown along the back
  b.loft(
    stations.map((s) => ({ at: [0, s.at[1] + s.h * 0.2, s.at[2]], w: s.w * 0.7, h: s.h * 0.7 })),
    { bone, color: P.blushTop },
  );

  // Belly underside
  b.loft(
    stations.map((s) => ({ at: [0, s.at[1] - s.h * 0.3, s.at[2]], w: s.w * 0.82, h: s.h * 0.42 })),
    { bone, color: P.belly },
  );

  // Shade band at the very bottom
  b.loft(
    stations.slice(1, 4).map((s) => ({ at: [0, s.at[1] - s.h * 0.5 + 0.01, s.at[2]], w: s.w * 0.5, h: 0.03 })),
    { bone, color: P.shadeUnder },
  );

  // Belly ridge line from chest to rump
  for (let i = 0; i < 6; i++) {
    const z = 0.14 - i * 0.055;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), P.belly, {
      bone,
      at: [0, 0.095 + (i === 0 ? 0.03 : 0) + 0.02 + i * 0.0, z],
      scale: [0.7, 0.5, 1.6],
    });
  }

  // Leg pad bumps at the mounts
  for (const m of [M.shoulderL, M.shoulderR, M.hipL, M.hipR]) {
    const s = Math.sign(m[0]);
    b.part(new THREE.SphereGeometry(0.06, 10, 8), P.blushBody, {
      bone,
      at: [m[0] * 0.95, m[1] - 0.02, m[2]],
      scale: [0.9, 1, 1],
    });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), P.shadeUnder, {
      bone,
      at: [m[0] + s * 0.02, m[1] - 0.07, m[2]],
      scale: [1, 0.5, 1],
    });
  }

  // Freckles on back and sides
  for (let i = 0; i < 8; i++) {
    const z = -0.14 + R() * 0.3;
    const a = (R() - 0.5) * 2.0; // angle from top
    const rx = 0.17,
      ry = 0.15;
    const x = Math.sin(a) * rx * 0.97;
    const y = 0.255 + Math.cos(a) * ry * 0.97;
    b.part(new THREE.SphereGeometry(0.011 + R() * 0.005, 6, 4), i % 2 ? P.shadeUnder : P.blushTop, {
      bone,
      at: [x, y, z],
      scale: [1, 0.6, 1],
    });
  }
}
    return buildBody;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const legs: [string, number, number, number][] = [
    ["legFL", 1, M.shoulderL[2], 1],
    ["legFR", -1, M.shoulderR[2], 1],
    ["legHL", 1, M.hipL[2], -1],
    ["legHR", -1, M.hipR[2], -1],
  ];
  for (const [name, s, z] of legs.map((l) => [l[0], l[1], l[2]] as [string, number, number])) {
    const bone = J[name];
    const hx = s * 0.14;
    const fx = s * 0.17;
    const top: [number, number, number] = [hx, 0.25, z];
    const ankle: [number, number, number] = [fx, 0.075, z];
    b.capsule(top, ankle, [0.045, 0.036], P.blushBody, { bone });
    // shaded ankle crease
    b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 10), P.shadeUnder, {
      bone,
      at: [fx, 0.082, z],
      dir: [0, 1, 0],
      axis: "z",
    });
    // foot dome: half sphere sitting on y=0
    b.part(new THREE.SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.blushBody, {
      bone,
      at: [fx, 0, z + 0.012],
      scale: [1, 0.85, 1.25],
    });
    // front toes
    for (let i = -1; i <= 1; i++) {
      const len = i === 0 ? 0.04 : 0.032;
      const a = (i * 20 * Math.PI) / 180;
      const base = new THREE.Vector3(fx + Math.sin(a) * 0.03, 0.017, z + 0.05 + Math.cos(a) * 0.01);
      const tip = new THREE.Vector3(base.x + Math.sin(a) * len, 0.017, base.z + Math.cos(a) * len);
      b.capsule(base, tip, 0.0165, P.toe, { bone });
    }
    // rear toe nubs
    for (const k of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.016, 6, 4), P.toe, {
        bone,
        at: [fx + k * 0.026, 0.016, z - 0.04 + R() * 0.004],
      });
    }
    // sole shading
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.006, 8), P.shadeUnder, {
      bone,
      at: [fx, 0.003, z + 0.008],
    });
  }
}
    return buildLegs;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: any) {
  const rand = rng(11);
  const chain = [J.tail1, J.tail2, J.tail3];
  const Y = 0.26;
  // spine path (centreline) from the body rump to the tip
  const pts: number[][] = [
    [0, Y, -0.12],
    [0, Y, -0.24],
    [0, Y - 0.005, -0.38],
    [0, Y, -0.52],
    [0, Y + 0.005, -0.62],
  ];
  const path = catmull(pts);
  const R = (t: number) => 0.135 * (1 - t) * (1 - 0.35 * t) + 0.012;
  b.sweep(path, R, {
    bone: chain,
    color: P.blushBody,
    sectors: [[125, 235, P.belly, 0.08, 1]],
    bands: [[0.1, P.shadeUnder], [1, P.blushBody]],
  });

  // fin profile helper: height as a function of t along the tail
  const dorsalH = (t: number) => Math.sin(Math.PI * Math.min(1, t * 1.05)) * 0.09 * (1 - 0.15 * t) + 0.01 * (1 - t);
  const ventralH = (t: number) => dorsalH(t) * 0.5;
  const zAt = (t: number) => -0.1 - t * 0.52;
  const rAt = (t: number) => R(t) * 0.92;

  const N = 14;
  const buildFin = (sign: number, hf: (t: number) => number, t0: number) => {
    const edge: number[][] = [];
    const root: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const t = t0 + ((1 - t0) * i) / N;
      const z = zAt(t);
      const base = Y + sign * rAt(t);
      root.push([0, base, z]);
      edge.push([0, base + sign * (hf(t) + 0.005), z]);
    }
    b.membrane(root, edge, {
      color: P.tailFin,
      thickness: 0.008,
      bone: J.tail2,
      rows: 3,
    });
    // rim trim
    b.sweep(catmull(edge), 0.006, { color: P.tailFinEdge, bone: J.tail2, caps: "round" });
    // crease lines
    for (let k = 1; k <= 4; k++) {
      const t = t0 + ((1 - t0) * k) / 5;
      const z = zAt(t);
      const base = Y + sign * rAt(t);
      b.rod([0, base + sign * 0.004, z], [0, base + sign * (hf(t) * 0.92), z - 0.01], 0.0032, P.tailFinEdge, {
        bone: t > 0.6 ? J.tail3 : J.tail2,
      });
    }
  };
  buildFin(1, dorsalH, 0.0);
  buildFin(-1, ventralH, 0.05);

  // rounded paddle at the tip joining crests
  b.part(new THREE.SphereGeometry(0.03, 8, 6), P.tailFin, {
    bone: J.tail3,
    at: [0, Y + 0.005, -0.62],
    scale: [0.3, 1.1, 1.4],
  });

  // freckles on top
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.15 + rand() * 0.03;
    const z = zAt(t) + 0.02;
    b.part(new THREE.SphereGeometry(0.009, 6, 4), P.shadeUnder, {
      bone: t > 0.5 ? J.tail3 : J.tail2,
      at: [(rand() - 0.5) * 0.03, Y + rAt(t) * 0.97, z],
      scale: [1, 0.5, 1],
    });
  }
}
    return buildTail;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.26,0], dir: [0,0.2,1], role: "spine" });
  J["neck"] = b.joint("neck", { parent: J["body"], at: [0,0.29,0.12], dir: [0,0.3,1], role: "neck" });
  J["head"] = b.joint("head", { parent: J["neck"], at: [0,0.3,0.24], dir: [0,0.25,1], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["head"], at: [0,0.24,0.3], dir: [0,0.1,1], role: "jaw" });
  J["tail1"] = b.joint("tail1", { parent: J["body"], at: [0,0.26,-0.16], dir: [0,0,-1], role: "tail" });
  J["tail2"] = b.joint("tail2", { parent: J["tail1"], at: [0,0.25,-0.36], dir: [0,0.05,-1], role: "tail" });
  J["tail3"] = b.joint("tail3", { parent: J["tail2"], at: [0,0.25,-0.52], dir: [0,0.1,-1], role: "tail" });
  J["legFL"] = b.joint("legFL", { parent: J["body"], at: [0.14,0.24,0.12], dir: [0,-1,0], role: "leg" });
  J["legFR"] = b.joint("legFR", { parent: J["body"], at: [-0.14,0.24,0.12], dir: [0,-1,0], role: "leg" });
  J["legHL"] = b.joint("legHL", { parent: J["body"], at: [0.14,0.24,-0.1], dir: [0,-1,0], role: "leg" });
  J["legHR"] = b.joint("legHR", { parent: J["body"], at: [-0.14,0.24,-0.1], dir: [0,-1,0], role: "leg" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, frame, offset, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Standing Mobile",
  "description": "A Calder-style standing mobile: a black pedestal and curving stem carry a crown of sweeping wire arms from which three tiers of flat red, orange, yellow, white and black sheet-metal shapes hang in balanced suspension."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wire: "#17171a",
  sheetBlack: "#232327",
  pedestal: "#26262b",
  white: "#f5efe3",
  red: "#d63a2b",
  orange: "#e9742e",
  yellow: "#f3b71f",
  cerulean: "#2f6fb2",
};
const M = {
  mastTop: [0, 2, 0] as [number, number, number],
  hookL: [0.55, 1.94, 0.2] as [number, number, number],
  hookR: [-0.5, 1.8, -0.1] as [number, number, number],
  pivotA: [0.85, 1.45, 0.3] as [number, number, number],
  pivotB: [-0.8, 1.25, -0.05] as [number, number, number],
  pivotC: [0.55, 0.85, 0.15] as [number, number, number],
  pivotD: [-0.45, 0.7, -0.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // pedestal
  (() => {
function buildPedestal({ b, J, P, M }: Ctx) {
  const bone = J.stem;

  // Foot: lathe disc with rounded lip and shallow dome top
  b.lathe(
    [
      [0, 0],
      [0.38, 0],
      [0.415, 0.012],
      [0.42, 0.03],
      [0.405, 0.055],
      [0.33, 0.062],
      [0.2, 0.07],
      [0, 0.078],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 28, bone, color: P.pedestal },
  );

  // Collar disc
  b.part(new THREE.CylinderGeometry(0.16, 0.17, 0.05, 20), P.pedestal, {
    bone,
    at: [0, 0.098, 0],
  });
  // White inlay ring around the collar rim
  b.part(new THREE.TorusGeometry(0.158, 0.002, 4, 32), P.white, {
    bone,
    at: [0, 0.124, 0],
    rotation: [90, 0, 0],
  });

  // Stem: gentle S-curve
  const stemPath = catmull([
    [0, 0.12, 0],
    [0.025, 0.7, 0],
    [-0.02, 1.35, 0.02],
    [0, 2.0, 0],
  ]);
  b.sweep(stemPath, [0.024, 0.015], { bone, color: P.wire, sides: 8 });

  // Side twig near the base
  b.rod([0.03, 0.5, 0], [0.2, 0.52, 0.05], 0.008, P.wire, { bone });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.wire, { bone, at: [0.03, 0.5, 0] });

  // Tiny white oval leaf
  b.extrude(
    [
      [0, 0],
      [0.05, 0.05],
      [0, 0.16],
      [-0.05, 0.05],
    ],
    {
      at: [0.2, 0.49, 0.05],
      x: [1, 0, 0],
      y: [0, 1, 0.35],
      thickness: 0.02,
      smoothing: 2,
      color: P.white,
      bone,
    },
  );

  // Terminal hook: upturned half-torus at mastTop
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 12, Math.PI), P.wire, {
    bone,
    at: [M.mastTop[0], M.mastTop[1] - 0.004, M.mastTop[2]],
    rotation: [0, 0, 180],
  });
}
    return buildPedestal;
  })(),
  // armature
  (() => {
function buildArmature({ b, J, P, M }: Ctx) {
  const bone = J.stem;
  const top = M.mastTop;
  const hookL = M.hookL;
  const hookR = M.hookR;

  // Left arm: rises, then curves out left-forward to hookL
  const armL = catmull([
    top,
    [0.12, 2.06, 0.04],
    [0.3, 2.04, 0.1],
    [hookL[0] - 0.04, hookL[1] + 0.01, hookL[2] - 0.02],
    [hookL[0], hookL[1] + 0.02, hookL[2]],
  ]);
  b.sweep(armL, [0.014, 0.01], { color: P.wire, bone, sides: 8 });

  // Right arm: rises, then curves out right-back to hookR
  const armR = catmull([
    top,
    [-0.14, 2.07, -0.03],
    [-0.32, 1.99, -0.07],
    [hookR[0] + 0.04, hookR[1] + 0.06, hookR[2] - 0.01],
    [hookR[0], hookR[1] + 0.02, hookR[2]],
  ]);
  b.sweep(armR, [0.013, 0.01], { color: P.wire, bone, sides: 8 });

  // Central branch to finial
  const branch = catmull([top, [0.015, 2.05, 0.0], [-0.01, 2.09, 0.008], [0, 2.12, 0.01]]);
  b.sweep(branch, [0.011, 0.007], { color: P.wire, bone, sides: 8 });

  // Yellow triangle finial
  const s = 0.09;
  const h = s * 0.866;
  b.extrude(
    [
      [-s / 2, 0],
      [s / 2, 0],
      [0, h],
    ],
    { at: [0, 2.115, 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: P.yellow, bone },
  );

  // Terminal hook of the stem: small upturned half torus
  b.part(new THREE.TorusGeometry(0.018, 0.005, 6, 10, Math.PI), P.wire, {
    at: [0, 2.0, 0],
    bone,
    rotation: [0, 0, 180],
  });

  // Attachment rings at hooks, vertical planes facing the drop direction
  const ringL = b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 14), P.wire, {
    at: [hookL[0], hookL[1] - 0.012, hookL[2]],
    bone,
    rotation: [0, 25, 0],
  });
  const ringR = b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 14), P.wire, {
    at: [hookR[0], hookR[1] - 0.012, hookR[2]],
    bone,
    rotation: [0, -20, 0],
  });
  void ringL;
  void ringR;

  // Spacer spheres at mid-span of the arms
  const mids = [armL.at(0.5), armR.at(0.5)];
  for (const p of mids) {
    b.part(new THREE.SphereGeometry(0.012, 8, 6), P.wire, { at: [p.x, p.y, p.z], bone });
  }
}
    return buildArmature;
  })(),
  // canopy
  (() => {
function buildCanopy({ b, J, P, M }: any) {
  const WIRE = P.wire;
  const ring = (at: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 12), WIRE, { bone, at, dir: [1, 0, 0], axis: "z" });
  const ball = (at: number[], bone: any, r = 0.012) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), WIRE, { bone, at });

  // a shape: outline in meters, hung at `at`, facing along normal `n`, tied by a twig to wire point `tie`
  const shape = (outline: any[], color: string, at: number[], n: number[], thick: number, tie: number[], bone: any, roll = 0) => {
    const up = [Math.sin(roll), Math.cos(roll), 0];
    const x = new THREE.Vector3(...up).cross(new THREE.Vector3(...n)).normalize();
    const y = new THREE.Vector3(...n).cross(x).normalize();
    // centre the outline on `at`
    const part = b.extrude(outline, {
      at, x: [x.x, x.y, x.z], y: [y.x, y.y, y.z], thickness: thick, bevel: 0.003, smoothing: 2, color, bone,
    });
    // twig from wire to the top of the shape
    const top = [at[0], at[1] + 0.02, at[2]];
    b.sweep(catmull([tie, [(tie[0] + top[0]) / 2, (tie[1] + top[1]) / 2 + 0.015, (tie[2] + top[2]) / 2], top]), 0.006, { color: WIRE, bone });
    ball(tie, bone);
    return part;
  };

  const leaf = (w: number, h: number): any[] => [
    [0, -h / 2], [w * 0.5, -h * 0.1], [w * 0.2, h * 0.35], [-w * 0.05, h / 2], [-w * 0.5, h * 0.1],
  ];
  const petal = (w: number, h: number): any[] => [
    [0, -h / 2], [w / 2, -h * 0.05], [w * 0.3, h * 0.4], [-w * 0.3, h * 0.4], [-w / 2, -h * 0.05],
  ];
  const fan = (w: number, h: number): any[] => [
    [0, -h / 2], [w / 2, h * 0.1], [w * 0.25, h / 2], [-w * 0.25, h / 2], [-w / 2, h * 0.1],
  ];
  const disc = (r: number, n = 14): any[] =>
    Array.from({ length: n }, (_, i) => [Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]);

  const hl = M.hookL, hr = M.hookR, pa = M.pivotA, pb = M.pivotB;

  // left drop
  b.sweep(catmull([hl, [0.62, 1.75, 0.22], pa]), 0.01, { color: WIRE, bone: J.pivotL });
  ring(pa, J.pivotL);
  shape(leaf(0.34, 0.5), P.sheetBlack, [0.78, 1.5, 0.26], [0.42, 0, 0.9], 0.03, [0.7, 1.72, 0.235], J.pivotL, 0.1);
  shape(petal(0.2, 0.28), P.red, [0.58, 1.7, 0.12], [-0.15, 0.1, 0.98], 0.025, [0.6, 1.8, 0.2], J.pivotL, -0.25);

  // right drop
  b.sweep(catmull([hr, [-0.62, 1.5, -0.03], pb]), 0.01, { color: WIRE, bone: J.pivotR });
  ring(pb, J.pivotR);
  shape(fan(0.3, 0.4), P.white, [-0.55, 1.5, -0.02], [0.4, 0, 0.85], 0.028, [-0.6, 1.58, -0.03], J.pivotR, 0.15);
  shape(disc(0.09), P.orange, [-0.4, 1.66, 0.02], [0.1, 0.05, 1], 0.03, [-0.55, 1.62, -0.03], J.pivotR);
  ball([-0.62, 1.5, -0.03], J.pivotR);
  ball([0.62, 1.75, 0.22], J.pivotL);
}
    return buildCanopy;
  })(),
  // midSwags
  (() => {
function buildMidSwags({ b, J, P, M }: Ctx) {
  const WIRE = P.wire;
  const ring = (at: number[], bone: any, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 12), WIRE, { bone, at, rotation: rot });
  const ball = (at: number[], bone: any) =>
    b.part(new THREE.SphereGeometry(0.01, 6, 4), WIRE, { bone, at });

  // Left branch (hangs from pivotA)
  b.sweep(
    catmull([M.pivotA, [0.7, 1.15, 0.35], [0.6, 1.02, 0.33], M.pivotC]),
    0.009,
    { color: WIRE, bone: J.pivotA },
  );
  ring([M.pivotC[0], M.pivotC[1] - 0.012, M.pivotC[2]], J.pivotA, [0, 90, 0]);

  // Orange leaf on forward twig
  b.sweep(catmull([[0.7, 1.15, 0.35], [0.72, 1.12, 0.41], [0.72, 1.07, 0.45]]), 0.006, { color: WIRE, bone: J.pivotA });
  ball([0.7, 1.15, 0.35], J.pivotA);
  const leaf = [
    [0, 0.21], [0.15, 0.02], [0.09, -0.21], [-0.12, -0.12], [-0.14, 0.05],
  ] as any;
  b.extrude(leaf, {
    at: [0.72, 0.92, 0.45], x: [1, 0, 0], y: [0, 1, 0],
    thickness: 0.03, smoothing: 2, color: P.orange, bone: J.pivotA,
  });
  b.sweep(catmull([[0.72, 1.07, 0.45], [0.72, 1.0, 0.45], [0.72, 0.95, 0.45]]), 0.005, { color: WIRE, bone: J.pivotA });

  // Black triangle on backward twig
  b.sweep(catmull([[0.6, 1.02, 0.33], [0.54, 1.06, 0.22], [0.48, 1.13, 0.12]]), 0.006, { color: WIRE, bone: J.pivotA });
  ball([0.6, 1.02, 0.33], J.pivotA);
  const tri = [[0, 0.09], [0.08, -0.05], [-0.08, -0.05]] as any;
  b.extrude(tri, {
    at: [0.48, 1.03, 0.12], x: [0.77, 0, 0.64], y: [0, 1, 0],
    thickness: 0.025, color: P.sheetBlack, bone: J.pivotA,
  });

  // Right branch (hangs from pivotB)
  b.sweep(
    catmull([M.pivotB, [-0.6, 1.0, 0.0], M.pivotD]),
    0.009,
    { color: WIRE, bone: J.pivotB },
  );
  ring([M.pivotD[0], M.pivotD[1] - 0.012, M.pivotD[2]], J.pivotB, [0, 90, 0]);

  // Yellow half-moon
  b.sweep(catmull([[-0.6, 1.0, 0.0], [-0.57, 0.99, 0.01], [-0.55, 0.97, 0.02]]), 0.006, { color: WIRE, bone: J.pivotB });
  ball([-0.6, 1.0, 0.0], J.pivotB);
  const moon = [
    [-0.13, 0.15], [0, 0.17], [0.13, 0.15], [0.07, 0.0], [0, -0.1], [-0.07, 0.0],
  ] as any;
  b.extrude(moon, {
    at: [-0.55, 0.8, 0.02], x: [1, 0.1, 0], y: [-0.1, 1, 0],
    thickness: 0.028, smoothing: 2, color: P.yellow, bone: J.pivotB,
  });
  b.sweep(catmull([[-0.55, 0.97, 0.02], [-0.55, 0.93, 0.02], [-0.55, 0.92, 0.02]]), 0.005, { color: WIRE, bone: J.pivotB });

  // Red disc
  b.sweep(catmull([[-0.8, 1.25, -0.05], [-0.84, 1.17, -0.12], [-0.85, 1.14, -0.18]]), 0.006, { color: WIRE, bone: J.pivotB });
  ball([-0.8, 1.25, -0.05], J.pivotB);
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 16), P.red, {
    bone: J.pivotB, at: [-0.85, 1.08, -0.18], dir: [-0.5, 0.1, 0.85],
  });
  ball([-0.6, 1.0, 0.0], J.pivotB);
}
    return buildMidSwags;
  })(),
  // finials
  (() => {
function buildFinials({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const wire = P.wire;

  // flat cutout helper: outline in local shape coords, placed at a point, tilted about Y and roll
  const cut = (
    outline: any[],
    color: string,
    at: number[],
    th: number,
    yawDeg: number,
    rollDeg: number,
    bone: any,
  ) => {
    const yaw = (yawDeg * Math.PI) / 180;
    const roll = (rollDeg * Math.PI) / 180;
    const x: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
    const y: [number, number, number] = [Math.sin(roll) * Math.cos(yaw), Math.cos(roll), -Math.sin(roll) * Math.sin(yaw)];
    return b.extrude(outline, { at, x, y, thickness: th, bevel: th * 0.15, smoothing: 2, color, bone });
  };
  const ball = (p: number[], r: number, color: string, bone: any) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at: p, bone });
  const ring = (p: number[], bone: any) =>
    b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 14), wire, { at: p, bone, rotation: [0, 90, 0] });
  const disc = (p: number[], r: number, th: number, color: string, yaw: number, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, th, 20), color, {
      at: p,
      bone,
      dir: [Math.sin((yaw * Math.PI) / 180), 0, Math.cos((yaw * Math.PI) / 180)],
    });

  const C = J.pivotC;
  const D = J.pivotD;

  // ---------- Right cluster (from pivotC) ----------
  const cpos = M.pivotC;
  b.sweep(
    [cpos, [cpos[0] + 0.03, 0.72, 0.17], [0.54, 0.6, 0.18], [0.55, 0.55, 0.18]],
    0.008,
    { color: wire, bone: C },
  );
  ring([cpos[0], cpos[1] + 0.012, cpos[2]], C);
  // balance arm
  b.sweep([[0.42, 0.52, 0.16], [0.55, 0.54, 0.2], [0.72, 0.5, 0.24]], 0.008, { color: wire, bone: C });
  ball([0.55, 0.55, 0.18], 0.012, wire, C);
  ball([0.4, 0.52, 0.16], 0.05, wire, C); // counterweight
  // twig down to blob leaf
  b.sweep([[0.55, 0.54, 0.2], [0.555, 0.5, 0.2], [0.55, 0.47, 0.2]], 0.006, { color: wire, bone: C });
  const blob: any[] = [
    [-0.2, 0.0], [-0.18, 0.1], [-0.05, 0.17], [0.12, 0.15], [0.2, 0.02], [0.14, -0.1], [0.0, -0.17], [-0.14, -0.1],
  ];
  cut(blob, P.sheetBlack, [0.55, 0.43, 0.2], 0.032, 0, 15, C);
  // twig to white disc
  b.sweep([[0.68, 0.51, 0.23], [0.7, 0.57, 0.28], [0.7, 0.6, 0.3]], 0.006, { color: wire, bone: C });
  ball([0.68, 0.51, 0.23], 0.01, wire, C);
  disc([0.7, 0.67, 0.3], 0.06, 0.02, P.white, 20, C);

  // ---------- Left cluster (from pivotD) ----------
  const dpos = M.pivotD;
  b.sweep(
    [dpos, [-0.46, 0.62, -0.09], [-0.42, 0.52, -0.07], [-0.4, 0.45, -0.06]],
    0.008,
    { color: wire, bone: D },
  );
  ring([dpos[0], dpos[1] + 0.012, dpos[2]], D);
  ball([-0.4, 0.45, -0.06], 0.012, wire, D);
  const petal: any[] = [
    [0, -0.17, "sharp"], [0.12, -0.06], [0.15, 0.06], [0.06, 0.15], [-0.04, 0.16], [-0.13, 0.05], [-0.1, -0.07],
  ];
  cut(petal, P.red, [-0.42, 0.4, -0.04], 0.03, 30, -8, D);
  // twig to yellow triangle
  b.sweep([[-0.45, 0.62, -0.09], [-0.52, 0.58, -0.12], [-0.57, 0.55, -0.14]], 0.006, { color: wire, bone: D });
  ball([-0.45, 0.62, -0.09], 0.01, wire, D);
  const tri: any[] = [[-0.07, -0.06, "sharp"], [0.07, -0.06, "sharp"], [0, 0.07, "sharp"]];
  cut(tri, P.yellow, [-0.58, 0.46, -0.14], 0.02, -25, 12, D);
  // cerulean disc
  b.sweep([[-0.42, 0.55, -0.06], [-0.34, 0.56, -0.02], [-0.28, 0.55, 0.0]], 0.006, { color: wire, bone: D });
  disc([-0.28, 0.5, 0.02], 0.045, 0.02, P.cerulean, 10, D);
}
    return buildFinials;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  J["stem"] = b.joint("stem", { at: [0,0.16,0], dir: [0,1,0], role: "spine" });
  J["pivotL"] = b.joint("pivotL", { parent: J["stem"], at: [0.55,1.94,0.2], dir: [0,-1,0], role: "hinge" });
  J["pivotR"] = b.joint("pivotR", { parent: J["stem"], at: [-0.5,1.8,-0.1], dir: [0,-1,0], role: "hinge" });
  J["pivotA"] = b.joint("pivotA", { parent: J["pivotL"], at: [0.85,1.45,0.3], dir: [0,-1,0], role: "hinge" });
  J["pivotB"] = b.joint("pivotB", { parent: J["pivotR"], at: [-0.8,1.25,-0.05], dir: [0,-1,0], role: "hinge" });
  J["pivotC"] = b.joint("pivotC", { parent: J["pivotA"], at: [0.55,0.85,0.15], dir: [0,-1,0], role: "hinge" });
  J["pivotD"] = b.joint("pivotD", { parent: J["pivotB"], at: [-0.45,0.7,-0.1], dir: [0,-1,0], role: "hinge" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

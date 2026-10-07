import * as THREE from "three";
import type { Builder, OutlinePoint } from "../src/builder";
import { createBuilder } from "../src/builder";
import type { JointRef } from "../src/context";
import { DEG } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Pegasus",
  description:
    "A horse-sized pegasus standing with its wings raised and spread: a faceted white body with a lavender belly, a sky, lilac and pink mane and tail, feathered fetlocks, a blue blanket with gold trim, a flower garland, a gold bead collar and a gold circlet.",
  style: "low-poly",
  commit: "b816db2",
};

type P3 = [number, number, number];

const V = THREE.Vector3;
const X = new V(1, 0, 0);
const UPV = new V(0, 1, 0);

// Palette: flat colours only, the low-poly look comes from the facets.
const COAT = "#f8f4ec";
const BELLY = "#e9e2f5";
const MUZZLE = "#f6b9cc";
const NOSTRIL = "#b4577e";
const INNER_EAR = "#ffb3c9";
const EYE = "#2a1f4d";
const SHINE = "#ffffff";
const GOLD = "#f7c948";
const HOOF = "#e0b048";
const MANE = ["#7fd3ff", "#c4a7ff", "#ff9ccc", "#9ff0d6"];
const WING_A = "#fff9ee";
const WING_B = "#e6d9ff";
const WING_C = "#b8e7ff";
const WING_D = "#7db9ff";
const WING_E = "#ffb4da";
const MEMBRANE = "#ece4ff";
const MEMBRANE_D = "#d8cbf8";
const BLUE = "#3f6fd3";
const GEM = "#66e0ff";
const FLOWER_PINK = "#ff8fb8";
const FLOWER_YEL = "#ffe36b";
const LEAF = "#7fdc9a";

// Piecewise-linear profile over t: keys are [t, value] or [t, rx, ry] (ry defaults to rx).
function ramp(keys: number[][]) {
  return (t: number): [number, number] => {
    let i = 1;
    while (i < keys.length - 1 && t > keys[i][0]) i++;
    const [t0, a0, b0 = a0] = keys[i - 1];
    const [t1, a1, b1 = a1] = keys[i];
    const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    return [a0 + (a1 - a0) * u, b0 + (b1 - b0) * u];
  };
}

// Faceted leaf / blade outline: x along its length from the root, y across.
function leaf(L: number, w: number): OutlinePoint[] {
  return [
    [0, -0.2 * w],
    [0.2 * L, -0.9 * w],
    [0.55 * L, -w],
    [0.85 * L, -0.55 * w],
    [L, 0, "sharp"],
    [0.85 * L, 0.5 * w],
    [0.55 * L, 0.95 * w],
    [0.2 * L, 0.85 * w],
    [0, 0.2 * w],
  ];
}

// The tip third of a leaf, drawn as its own overlay in a second colour.
function tipLeaf(L: number, w: number): OutlinePoint[] {
  return [
    [0.45 * L, -0.7 * w],
    [0.8 * L, -0.8 * w],
    [L, 0, "sharp"],
    [0.8 * L, 0.7 * w],
    [0.45 * L, 0.7 * w],
  ];
}

// A flat blade: `flow` runs along its length, `across` is the thickness direction (made square to flow).
function plate(
  b: Builder,
  outline: OutlinePoint[],
  at: THREE.Vector3,
  flow: THREE.Vector3,
  across: THREE.Vector3,
  thickness: number,
  color: string,
  bone: JointRef,
) {
  const x = flow.clone().normalize();
  const th = across.clone().addScaledVector(x, -across.dot(x)).normalize();
  const y = th.clone().cross(x).normalize();
  return b.extrude(outline, { at, x, y, thickness, color, bone });
}

// Chest, neck and head: the spine runs from the hips up to the chest, the neck rises to the head joint.
const SPINE: P3[] = [
  [0, 1.27, -0.72],
  [0, 1.28, -0.38],
  [0, 1.3, -0.04],
  [0, 1.34, 0.28],
  [0, 1.38, 0.46],
];
const NECK: P3[] = [
  [0, 1.4, 0.44],
  [0, 1.6, 0.61],
  [0, 1.8, 0.78],
  [0, 1.9, 0.9],
];
const TAIL: P3[] = [
  [0, 1.44, -0.8],
  [0, 1.34, -1.02],
  [0, 1.1, -1.16],
  [0, 0.8, -1.2],
  [0, 0.52, -1.14],
];
const FRONT_LEG: P3[] = [
  [0.16, 1.1, 0.42],
  [0.17, 0.82, 0.42],
  [0.17, 0.46, 0.45],
  [0.17, 0.12, 0.45],
  [0.17, 0.05, 0.47],
];
const HIND_LEG: P3[] = [
  [0.15, 1.2, -0.6],
  [0.19, 0.86, -0.42],
  [0.16, 0.46, -0.8],
  [0.16, 0.12, -0.8],
  [0.16, 0.05, -0.82],
];
// Left wing, shoulder to hand tip, raised in a spread V; the right wing is the mirror image.
const WING_PTS = [new V(0.18, 1.62, 0.22), new V(0.62, 2.12, 0.02), new V(1.2, 2.56, -0.22), new V(1.72, 2.62, -0.5)];
const TRAILING = [new V(0.2, 1.46, -0.55), new V(0.62, 1.95, -0.6), new V(1.15, 2.42, -0.62), new V(1.72, 2.62, -0.5)];
const CHORD = new V(0, -0.05, -1);

const bodyR = ramp([
  [0, 0.2, 0.27],
  [0.3, 0.27, 0.34],
  [0.65, 0.27, 0.34],
  [0.9, 0.23, 0.3],
  [1, 0.2, 0.25],
]);
const neckR = ramp([
  [0, 0.17, 0.2],
  [0.5, 0.14, 0.16],
  [1, 0.085, 0.095],
]);
const tailR = ramp([
  [0, 0.075],
  [0.5, 0.055],
  [1, 0.03],
]);
const legR = ramp([
  [0, 0.085],
  [0.22, 0.07],
  [0.4, 0.055],
  [0.61, 0.04],
  [0.8, 0.036],
  [0.93, 0.032],
  [1, 0.03],
]);
const wingR = ramp([
  [0, 0.06],
  [0.5, 0.045],
  [0.7, 0.03],
  [1, 0.02],
]);

// Head frame: S0 is the head joint at the top of the neck, D points out of the muzzle, UP is its crown side.
const S0 = new V(...NECK[3]);
const D = new V(0, -0.35, 0.94).normalize();
const UP = new V(0, D.z, -D.y).normalize();
// Head-local point: a along the head axis, u up, x to the model's left.
const H = (a: number, u: number, x = 0) =>
  S0.clone().addScaledVector(D, a).addScaledVector(UP, u).addScaledVector(X, x);
// Ear direction: up and a little out to the side, leaning back.
const earDir = (s: number) => UP.clone().multiplyScalar(0.85).addScaledVector(D, -0.25).addScaledVector(X, s * 0.35);

export default function build() {
  const b = createBuilder({ name: "pegasus" });

  // ---- skeleton
  const hips = b.joint("hips", { at: SPINE[0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain("spine", catmull(SPINE), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull(NECK), {
    parent: spine.joints[3],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[2], at: S0, dir: D, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: H(0.04, -0.1), dir: D, role: "jaw" });
  const tail = b.chain("tail", catmull(TAIL), {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });
  const ears: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    ears[side] = b.joint(`ear${side}`, { parent: head, at: H(-0.05, 0.09, s * 0.06), dir: earDir(s), role: "hinge" });
  }

  // ---- body: the spine tube, belly tint, a blue blanket over the back with gold studs
  b.sweep(spine, bodyR, { color: COAT, sectors: [[135, 225, BELLY]], smooth: false });
  b.sweep(
    spine,
    (t) => {
      const [rx, ry] = bodyR(t);
      return [rx + 0.012, ry + 0.012];
    },
    { from: 0.3, to: 0.6, color: BLUE, sides: 12, smooth: false },
  );
  for (const s of [1, -1]) {
    b.along(
      spine,
      4,
      (p) => {
        const [rx, ry] = bodyR(p.t);
        b.part(new THREE.IcosahedronGeometry(0.022, 0), GOLD, {
          bone: p.bone,
          at: p.at.clone().addScaledVector(X, s * (rx + 0.012)).addScaledVector(UPV, ry * 0.25),
          flat: true,
        });
      },
      { from: 0.3, to: 0.6 },
    );
  }

  // ---- neck: gold bead collar at the base, flower garland, mane
  b.sweep(neck, neckR, { color: COAT, smooth: false });
  b.ring(neck.at(0.1), { count: 14, radius: 0.2 }, (item) => {
    b.part(new THREE.IcosahedronGeometry(0.014, 0), GOLD, { frame: item, flat: true });
  });
  b.ring(neck.at(0.42), { count: 12, radius: 0.18 }, (item) => {
    const kind = item.i % 3;
    const color = kind === 0 ? FLOWER_PINK : kind === 1 ? FLOWER_YEL : LEAF;
    b.part(new THREE.IcosahedronGeometry(kind === 2 ? 0.02 : 0.03, 0), color, { frame: item, flat: true });
  });
  for (let i = 0; i < 14; i++) {
    const t = 0.07 + i * 0.06;
    const cp = neck.at(t);
    const tan = cp.tangent.clone().normalize();
    const dor = new V(0, tan.z, -tan.y).normalize();
    const ry = neckR(t)[1];
    for (const k of [-1, 0, 1]) {
      const at = cp.at.clone().addScaledVector(dor, ry * 0.85).addScaledVector(X, k * 0.03);
      const flow = tan.clone().multiplyScalar(-0.75).addScaledVector(dor, 0.65);
      plate(b, leaf(0.24, 0.055), at, flow, X, 0.018, MANE[(i + k + 1) % MANE.length], cp.bone);
    }
  }
  // Forelock falls forward over the crown.
  for (const k of [-1, 0, 1]) {
    const flow = D.clone().multiplyScalar(0.6).addScaledVector(UP, -0.8);
    plate(b, leaf(0.12, 0.03), H(0.0, 0.12, k * 0.03), flow, X, 0.012, MANE[k + 1], head);
  }

  // ---- head: skull, muzzle, jaw, eyes, ears, circlet
  b.loft(
    [
      [-0.08, 0.02, 0.12, 0.15],
      [0.04, 0.02, 0.15, 0.17],
      [0.2, 0.0, 0.13, 0.14],
      [0.34, -0.02, 0.1, 0.105],
    ].map(([a, u, w, h]) => ({ at: H(a, u), w, h })),
    { bone: head, color: COAT, smooth: false },
  );
  b.loft(
    [
      [0.34, -0.02, 0.1, 0.105],
      [0.47, -0.03, 0.085, 0.085],
      [0.56, -0.035, 0.07, 0.07],
      [0.6, -0.035, 0.06, 0.06],
    ].map(([a, u, w, h]) => ({ at: H(a, u), w, h })),
    { bone: head, color: MUZZLE, smooth: false },
  );
  b.loft(
    [
      [0.04, -0.1, 0.1, 0.07],
      [0.26, -0.09, 0.085, 0.05],
      [0.46, -0.07, 0.065, 0.035],
    ].map(([a, u, w, h]) => ({ at: H(a, u), w, h })),
    { bone: jaw, color: COAT, smooth: false },
  );
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.026, 6, 4), EYE, { bone: head, at: H(0.06, 0.035, s * 0.072), flat: true });
    b.part(new THREE.SphereGeometry(0.008, 4, 3), SHINE, { bone: head, at: H(0.07, 0.045, s * 0.09), flat: true });
    b.part(new THREE.SphereGeometry(0.012, 4, 3), NOSTRIL, { bone: head, at: H(0.575, -0.03, s * 0.025), flat: true });
    const earBase = H(-0.05, 0.09, s * 0.06);
    plate(
      b,
      [
        [0, -0.04],
        [0.06, -0.035],
        [0.13, -0.01],
        [0.15, 0, "sharp"],
        [0.13, 0.01],
        [0.06, 0.035],
        [0, 0.04],
      ],
      earBase,
      earDir(s),
      D,
      0.012,
      COAT,
      ears[side],
    );
    plate(
      b,
      [
        [0, -0.02],
        [0.06, -0.018],
        [0.1, 0, "sharp"],
        [0.06, 0.018],
        [0, 0.02],
      ],
      earBase.clone().addScaledVector(D, 0.007),
      earDir(s),
      D,
      0.005,
      INNER_EAR,
      ears[side],
    );
  }
  const circlet: THREE.Vector3[] = [];
  for (let deg = -110; deg <= 110; deg += 22) {
    const th = deg * DEG;
    circlet.push(H(0.04, 0.02 + 0.095 * Math.cos(th), 0.095 * Math.sin(th)));
  }
  b.sweep(catmull(circlet), 0.008, { bone: head, color: GOLD, sides: 6, smooth: false });
  b.part(new THREE.IcosahedronGeometry(0.017, 0), GEM, { bone: head, at: H(0.04, 0.135), flat: true });

  // ---- legs: chains, cannon tubes, knee and fetlock lumps, feathered fetlocks, hooves
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fl = FRONT_LEG.map((p) => [s * p[0], p[1], p[2]] as P3);
    const fore = b.chain(`legF${side}`, polyline(fl), {
      parent: spine.joints[3],
      names: [`shoulderF${side}`, `elbowF${side}`, `kneeF${side}`, `fetlockF${side}`, `hoofF${side}`],
      role: "leg",
    });
    const hl = HIND_LEG.map((p) => [s * p[0], p[1], p[2]] as P3);
    const hind = b.chain(`legH${side}`, polyline(hl), {
      parent: hips,
      names: [`hipH${side}`, `stifleH${side}`, `hockH${side}`, `fetlockH${side}`, `hoofH${side}`],
      role: "leg",
    });
    for (const [leg, pts] of [
      [fore, fl],
      [hind, hl],
    ] as const) {
      b.sweep(leg, legR, { color: COAT, sides: 6, smooth: false });
      b.part(new THREE.IcosahedronGeometry(0.05, 0), COAT, { bone: leg.joints[2], at: pts[2], flat: true });
      b.part(new THREE.IcosahedronGeometry(0.04, 0), COAT, { bone: leg.joints[3], at: pts[3], flat: true });
      const f = new V(...pts[3]);
      for (const k of [-1, 0, 1]) {
        plate(
          b,
          leaf(0.16, 0.055),
          f.clone().addScaledVector(X, k * 0.03).addScaledVector(new V(0, 0, 1), 0.01),
          new V(0, -0.6, -0.8),
          X,
          0.01,
          k === 0 ? WING_B : COAT,
          leg.joints[3],
        );
      }
      b.lathe(
        [
          [0, 0],
          [0.046, 0],
          [0.05, 0.03],
          [0.04, 0.07],
          [0, 0.07],
        ],
        { at: [pts[4][0], 0, pts[4][2]], segments: 8, color: HOOF, bone: leg.joints[4] },
      );
    }
  }

  // ---- tail: a tube with flowing blades on both sides
  b.sweep(tail, tailR, { color: COAT, sides: 6, smooth: false });
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.1;
    const cp = tail.at(t);
    const tan = cp.tangent.clone().normalize();
    for (const k of [-1, 1]) {
      plate(
        b,
        leaf(0.3, 0.07),
        cp.at.clone().addScaledVector(X, k * 0.045),
        tan.clone(),
        X,
        0.016,
        MANE[(i + (k > 0 ? 1 : 0)) % MANE.length],
        cp.bone,
      );
    }
  }

  // ---- wings: arm bones, membrane, primaries, secondaries, tertials, coverts, gold wrist band
  for (const s of [1, -1]) {
    const m = (p: THREE.Vector3) => new V(s * p.x, p.y, p.z);
    const side = s > 0 ? "L" : "R";
    const W = WING_PTS;
    const wing = b.chain(`wing${side}`, catmull(W.map(m)), {
      parent: spine.joints[2],
      names: [`wingArm${side}`, `wingFore${side}`, `wingWrist${side}`, `wingHand${side}`],
      role: "wing",
    });
    const [arm, fore, wrist, hand] = wing.joints;
    b.sweep(wing, wingR, { color: COAT, sides: 6, smooth: false });
    b.part(new THREE.IcosahedronGeometry(0.04, 0), COAT, { bone: wrist, at: m(W[2]), flat: true });
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10), GOLD, {
      bone: wrist,
      at: m(W[2]),
      dir: m(W[2].clone().sub(W[1])),
      axis: "z",
      flat: true,
    });
    const mid = W.map((p, k) => p.clone().lerp(TRAILING[k], 0.5));
    b.membrane(wing, polyline(mid.map(m)), { color: MEMBRANE, thickness: 0.012 });
    b.membrane(polyline(mid.map(m)), polyline(TRAILING.map(m)), { color: MEMBRANE_D, thickness: 0.012, bone: fore });

    // Wing plane in left-frame coordinates: normal n, hand direction and chord within the plane.
    const n = W[3].clone().sub(W[0]).cross(CHORD).normalize();
    if (n.y < 0) n.negate();
    const proj = (v: THREE.Vector3) => v.clone().addScaledVector(n, -v.dot(n)).normalize();
    const Hp = proj(W[3].clone().sub(W[2]));
    const Cp = proj(CHORD);

    // Primaries fan from the hand, bases lilac to blue, tips sky and pink.
    for (let i = 0; i < 10; i++) {
      const R = W[2].clone().lerp(W[3], 0.12 + 0.088 * i).addScaledVector(n, 0.012);
      const a = (2 + 3.6 * i) * DEG;
      const Dir = Hp.clone().multiplyScalar(Math.cos(a)).addScaledVector(Cp, Math.sin(a));
      const Len = 0.46 + 0.024 * i;
      const base = i < 3 ? WING_B : i < 7 ? WING_C : WING_D;
      plate(b, leaf(Len, 0.09), m(R), m(Dir), m(n), 0.012, base, hand);
      plate(b, tipLeaf(Len, 0.09), m(R), m(Dir), m(n), 0.016, i < 6 ? WING_C : WING_E, hand);
    }
    // Secondaries lie along the forearm and trail back over the membrane, in two staggered rows.
    for (let j = 0; j < 10; j++) {
      const R = W[1].clone().lerp(W[2], 0.04 + 0.1 * j).addScaledVector(n, 0.01);
      const Dir = Cp.clone().multiplyScalar(0.88).addScaledVector(Hp, 0.22).normalize();
      plate(b, leaf(0.6, 0.13), m(R), m(Dir), m(n), 0.012, [WING_A, WING_B, WING_C][j % 3], fore);
    }
    for (let j = 0; j < 8; j++) {
      const R = W[1].clone().lerp(W[2], 0.1 + 0.11 * j).addScaledVector(n, 0.025);
      const Dir = Cp.clone().multiplyScalar(0.92).addScaledVector(Hp, 0.18).normalize();
      plate(b, leaf(0.42, 0.11), m(R), m(Dir), m(n), 0.012, j % 2 ? WING_D : WING_E, fore);
    }
    // Tertials sweep back from the arm over the body.
    for (let k = 0; k < 5; k++) {
      const R = W[0].clone().lerp(W[1], 0.2 + 0.14 * k).addScaledVector(n, 0.005);
      const Dir = Cp.clone().multiplyScalar(0.97).addScaledVector(Hp, 0.05).normalize();
      plate(b, leaf(0.7, 0.11), m(R), m(Dir), m(n), 0.012, k % 2 ? WING_A : WING_B, arm);
    }
    // Coverts overlap the arm and forearm.
    for (let k = 0; k < 8; k++) {
      const R = W[0].clone().lerp(W[1], 0.12 + 0.11 * k).addScaledVector(n, 0.03);
      const Dir = Cp.clone().multiplyScalar(0.95).addScaledVector(Hp, 0.1).normalize();
      plate(b, leaf(0.26, 0.08), m(R), m(Dir), m(n), 0.012, k % 2 ? WING_C : WING_A, arm);
    }
    for (let k = 0; k < 7; k++) {
      const R = W[1].clone().lerp(W[2], 0.1 + 0.13 * k).addScaledVector(n, 0.035);
      const Dir = Cp.clone().multiplyScalar(0.95).addScaledVector(Hp, 0.15).normalize();
      plate(b, leaf(0.22, 0.07), m(R), m(Dir), m(n), 0.012, k % 2 ? WING_A : WING_B, fore);
    }
  }

  return b.root;
}

import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, polyline } from "../src/path";
import { countershade, mottle, paint, spots } from "../src/paint";

export const meta = {
  name: "Strawberry Poison Dart Frog on a Leaf",
  description:
    "A strawberry poison dart frog (Oophaga pumilio) crouched on a broad rainforest leaf: red coat with dark freckles, cream belly, cobalt limbs with yellow toe pads, big eyes with gold irises. Built to real size (about 3 cm long, leaf about 15 cm).",
  style: "whimsical low-poly mix",
  commit: "b816db2",
};

// Palette: flat colours for the structure, paints for the coat, leaf and limbs.
const RED = "#e8261c";
const FRECKLE = "#2a1446";
const BELLY = "#ffe2a8";
const BLUE = "#2e5fe6";
const BLUE_DEEP = "#1d3fae";
const PAD = "#ffd84a";
const IRIS = "#ffa136";
const INK = "#130b1c";
const WHITE = "#ffffff";
const DEW = "#c4ecff";
const STEM = "#3d8a3a";
const LEAF_TOP = "#2fa34b";
const LEAF_DEEP = "#1f7a3a";
const LEAF_VEIN = "#b9f27d";
const LEAF_EDGE = "#25873f";
const LEAF_UNDER = "#7fd06a";

// Coat: red with fine freckles, cream underside (countershaded).
const COAT = countershade(spots(RED, FRECKLE, { size: 0.0045, amount: 0.16, seed: 7 }), BELLY, {
  level: -0.2,
  soft: 0.15,
});
const LEG = mottle(BLUE, BLUE_DEEP, { size: 0.004, contrast: 0.4, seed: 3 });

// Leaf veins from the outline's own coordinates: s = [x, z] in metres.
const VEIN_Z = [-0.05, -0.024, 0.002, 0.028, 0.052];
function onVein(x: number, z: number): boolean {
  const ax = Math.abs(x);
  if (ax < 0.0009 && z > -0.07 && z < 0.072) return true; // midrib
  if (ax > 0.034) return false;
  for (const k of VEIN_Z) {
    const d = Math.abs(z - k - (ax / 0.03) * 0.04) / 1.67;
    if (d < 0.0006 && ax > 0.0015 && z > k) return true;
  }
  return false;
}
const leafTop = mottle(LEAF_TOP, LEAF_DEEP, { size: 0.014, contrast: 0.5, seed: 11 });
const leafPaint = paint((_p, n, s) => {
  if (Math.abs(n.y) < 0.5) return LEAF_EDGE;
  if (onVein(s[0], s[1])) return LEAF_VEIN;
  return n.y < 0 ? LEAF_UNDER : leafTop;
});

// Piecewise-linear profile over the body's own t.
function keyed(keys: [number, number][]): (t: number) => number {
  return (t: number) => {
    for (let i = 1; i < keys.length; i++) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      if (t <= t1) return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
    }
    return keys[keys.length - 1][1];
  };
}
// Wide, flat-backed body: the sideways radius is about twice the height.
const bodyRx = keyed([
  [0, 0.006],
  [0.25, 0.0086],
  [0.5, 0.0098],
  [0.76, 0.0096],
  [0.9, 0.0082],
  [1, 0.0064],
]);
const bodyRy = keyed([
  [0, 0.0034],
  [0.25, 0.0044],
  [0.5, 0.0048],
  [0.76, 0.0046],
  [0.9, 0.004],
  [1, 0.0032],
]);

type V = [number, number, number];

// Point `k` metres from p along the floor direction d, at height y.
function along(p: V, d: [number, number], k: number, y: number): V {
  const L = Math.hypot(d[0], d[1]);
  return [p[0] + (d[0] / L) * k, y, p[2] + (d[1] / L) * k];
}

export default function build() {
  const b = createBuilder({ name: "poisonDartFrog" });
  // Root joint at the rump. The leaf and petiole ride it, so they need a bone.
  const hips = b.joint("hips", { at: [0, 0.0074, -0.014], role: "spine" });

  // Leaf: a flat slab in the XZ plane, its underside on the floor (y = 0).
  b.extrude(
    [
      [0, -0.072, "sharp"],
      [0.02, -0.05],
      [0.033, -0.02],
      [0.036, 0.01],
      [0.027, 0.042],
      [0.01, 0.066],
      [0, 0.08, "sharp"],
      [-0.01, 0.066],
      [-0.027, 0.042],
      [-0.036, 0.01],
      [-0.033, -0.02],
      [-0.02, -0.05],
    ],
    {
      at: [0, 0.0015, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.003,
      bevel: 0.0008,
      smoothing: 2,
      color: leafPaint,
      name: "leaf",
      bone: hips,
    },
  );

  // Petiole running off the leaf base along the floor.
  b.sweep(
    polyline([
      [0, 0.0014, -0.068],
      [0.0004, 0.0014, -0.082],
      [0.001, 0.0014, -0.096],
    ]),
    0.0011,
    { sides: 6, color: STEM, name: "petiole", bone: hips },
  );

  // Skeleton: a spine chain from the rump up to the snout.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.0074, -0.0095],
      [0, 0.008, -0.0045],
      [0, 0.008, 0.0],
      [0, 0.0079, 0.004],
      [0, 0.0077, 0.0068],
      [0, 0.0072, 0.0098],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "neck", "head"], role: "spine" },
  );

  // Body: one faceted tube, wide and flat-backed, with a blunt snout.
  const body = b.sweep(spine, (t) => [bodyRx(t), bodyRy(t)], {
    sides: 8,
    smooth: false,
    color: COAT,
    name: "body",
  });

  // Lower jaw, hinged under the head; the mouth line rides it.
  const head = spine.joints[4];
  const jaw = b.joint("jaw", {
    parent: head,
    at: body.at(0.84, 180).at,
    aim: body.at(1, 180).at,
    role: "jaw",
  });
  const mouthT = [0.84, 0.88, 0.92, 0.96];
  const mouthDeg = [105, 122, 139, 156];
  const mouthRight = mouthT.map((t, i) => body.at(t, mouthDeg[i], 0.0004).at);
  const mouthLeft = mouthT.map((t, i) => body.at(t, 360 - mouthDeg[i], 0.0004).at).reverse();
  const mouthTip = body.at(1, 180, 0.0004).at;
  b.sweep(polyline([...mouthRight, mouthTip, ...mouthLeft]), 0.0009, {
    bone: jaw,
    sides: 5,
    color: INK,
    name: "mouth",
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eyes: big bulging eyes on the top of the head, gold irises on their fronts and a glint.
    const eyeDeg = s > 0 ? 298 : 62;
    const eyeSurface = body.at(0.865, eyeDeg, 0);
    const eyeColour = paint((_p, n) => (n.z > 0.72 ? IRIS : INK));
    b.part(new THREE.SphereGeometry(0.0034, 7, 5), eyeColour, {
      frame: eyeSurface.moved([0, 0.0018, 0]),
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.0011, 5, 4), WHITE, {
      frame: eyeSurface.moved([0, 0.004, 0.0026]),
      name: `catchlight${side}`,
    });

    // Nostril dot on the snout.
    b.part(new THREE.SphereGeometry(0.0005, 4, 3), INK, {
      frame: body.at(0.985, s > 0 ? 330 : 30, 0).moved([0, 0.0002, 0]),
      name: `nostril${side}`,
    });

    // Front leg: shoulder on spine3, elbow, wrist, hand tip; four digits fan from the hand.
    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.0062, 0.0068, 0.003],
        [s * 0.0105, 0.0052, 0.005],
        [s * 0.0112, 0.004, 0.0075],
        [s * 0.0118, 0.004, 0.0098],
      ]),
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    b.sweep(arm, (t) => 0.0017 - 0.0005 * t, { sides: 6, color: LEG, name: `armTube${side}` });
    const hand = arm.tip;
    if (!hand) throw new Error("front leg has no hand joint");
    const handP: V = [s * 0.0118, 0.004, 0.0098];
    const FINGERS: [number, number, number][] = [
      [0.9, 0.3, 0.003],
      [0.6, 0.8, 0.003],
      [0.25, 0.97, 0.0029],
      [-0.25, 0.97, 0.0026],
    ];
    FINGERS.forEach(([dx, dz, len], k) => {
      const d: [number, number] = [s * dx, dz];
      const f = b.chain(
        `finger${k}${side}`,
        polyline([handP, along(handP, d, len * 0.5, 0.004), along(handP, d, len, 0.0039)]),
        { parent: hand, names: [`f${k}${side}a`, `f${k}${side}b`, `f${k}${side}c`], role: "digit" },
      );
      b.sweep(f, 0.00055, { sides: 5, color: LEG, name: `finger${k}${side}` });
      const tip = f.tip;
      if (!tip) throw new Error("finger has no tip joint");
      b.part(new THREE.SphereGeometry(0.0009, 6, 4), PAD, {
        bone: tip,
        at: along(handP, d, len, 0.0039),
        name: `fingerPad${k}${side}`,
      });
    });

    // Hind leg: a fat thigh from the hip on spine1, knee out, ankle, foot tip; four toes fan from the foot.
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.0062, 0.007, -0.0088],
        [s * 0.013, 0.0058, -0.004],
        [s * 0.0112, 0.0048, -0.008],
        [s * 0.01, 0.0042, -0.0118],
      ]),
      {
        parent: spine.joints[0],
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
        role: "leg",
      },
    );
    b.sweep(leg, (t) => 0.004 - 0.0022 * t, { sides: 6, color: LEG, name: `legTube${side}` });
    const foot = leg.tip;
    if (!foot) throw new Error("hind leg has no foot joint");
    const footP: V = [s * 0.01, 0.0042, -0.0118];
    const TOES: [number, number, number][] = [
      [0.95, -0.25, 0.003],
      [0.55, -0.85, 0.0029],
      [-0.45, -0.9, 0.0029],
      [-0.9, -0.45, 0.0027],
    ];
    TOES.forEach(([dx, dz, len], k) => {
      const d: [number, number] = [s * dx, dz];
      const t = b.chain(
        `toe${k}${side}`,
        polyline([footP, along(footP, d, len * 0.5, 0.0041), along(footP, d, len, 0.0039)]),
        { parent: foot, names: [`t${k}${side}a`, `t${k}${side}b`, `t${k}${side}c`], role: "digit" },
      );
      b.sweep(t, 0.0005, { sides: 5, color: LEG, name: `toe${k}${side}` });
      const tip = t.tip;
      if (!tip) throw new Error("toe has no tip joint");
      b.part(new THREE.SphereGeometry(0.0009, 6, 4), PAD, {
        bone: tip,
        at: along(footP, d, len, 0.0039),
        name: `toePad${k}${side}`,
      });
    });
  }

  // Dew beads on the leaf: small glassy domes resting on the leaf top.
  const dew: V[] = [
    [0.016, 0.0041, -0.04],
    [-0.019, 0.0041, 0.03],
    [0.007, 0.0041, 0.058],
    [-0.006, 0.0041, -0.058],
  ];
  dew.forEach((p, i) =>
    b.part(new THREE.SphereGeometry(0.0012, 6, 4), DEW, { at: p, name: `dew${i}` }),
  );

  return b.root;
}

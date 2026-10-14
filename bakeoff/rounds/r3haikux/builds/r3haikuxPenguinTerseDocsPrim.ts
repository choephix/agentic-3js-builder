import * as THREE from "three";
import { catmull, createBuilder, paint } from "../../../../src/index";

export const meta = {
  name: "penguin",
  description: "A plump black-and-white penguin with an orange beak, webbed feet and cheek patches, rigged for posing.",
};

// Palette
const INK = "#1d2330"; // back, flippers, tail, head
const SNOW = "#f4f1ea"; // belly, eye whites
const BEAK = "#ff9d2a";
const FOOT = "#ff7d1e"; // legs and webbed feet
const CHEEK = "#ffc23d"; // cheek patches

// Smooth [rx, ry] lookup keyed on chain t. Keys are [t, rx, ry].
function keyed(keys: number[][]) {
  return (t: number): [number, number] => {
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0] || i === keys.length - 1) {
        const [t0, a0, b0] = keys[i - 1];
        const [t1, a1, b1] = keys[i];
        const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
        const k = u * u * (3 - 2 * u);
        return [a0 + (a1 - a0) * k, b0 + (b1 - b0) * k];
      }
    }
    return [keys[0][1], keys[0][2]];
  };
}

// Egg-shaped torso: widest at the chest, rounded at the hips, narrow at the neck
const torso = keyed([
  [0, 0.08, 0.075],
  [0.22, 0.118, 0.1],
  [0.5, 0.135, 0.118],
  [0.8, 0.118, 0.1],
  [1, 0.066, 0.062],
]);

// Flat paddle flipper: thin sideways, wide front to back, pointed tip
const flipper = keyed([
  [0, 0.022, 0.034],
  [0.3, 0.015, 0.042],
  [0.7, 0.011, 0.034],
  [0.9, 0.007, 0.02],
  [1, 0.003, 0.005],
]);

// Head geometry and face paint
const HEAD: [number, number, number] = [0, 0.71, 0.05];
const HEAD_R = 0.1;
const headC = new THREE.Vector3(...HEAD);
const onHead = (dir: [number, number, number]) =>
  new THREE.Vector3(...dir).normalize().multiplyScalar(HEAD_R).add(headC);

const eyes = [1, -1].map((s) => ({
  ring: onHead([s * 0.6, 0.2, 0.76]),
  pupil: onHead([s * 0.56, 0.16, 0.8]),
  glint: onHead([s * 0.55, 0.2, 0.81]),
}));

const headCoat = paint((p, n) => {
  for (const e of eyes) {
    if (p.distanceTo(e.glint) < 0.0045) return SNOW;
    if (p.distanceTo(e.pupil) < 0.014) return INK;
    if (p.distanceTo(e.ring) < 0.027) return SNOW;
  }
  // Oval orange cheek patch on each side, behind the eye
  const u = (p.z - 0.035) / 0.06;
  const v = (p.y - 0.705) / 0.032;
  if (Math.abs(n.x) > 0.5 && u * u + v * v < 1) return CHEEK;
  return INK;
});

// Black back, white front
const coat = paint((_p, n) => (n.z > 0.3 ? SNOW : INK));

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Torso: a spine chain that the body is skinned over as one smooth egg
  const hips = b.joint("hips", { at: [0, 0.27, -0.01], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.27, -0.01],
      [0, 0.42, 0],
      [0, 0.56, 0.02],
      [0, 0.66, 0.04],
    ]),
    { parent: hips, names: ["back", "chest", "neck"], role: "spine" },
  );
  b.sweep(spine, torso, { color: coat, sides: 10 });

  // Head, with an upper beak fixed to it and a lower beak on a hinged jaw
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: HEAD, role: "head" });
  b.part(new THREE.SphereGeometry(HEAD_R, 14, 10), headCoat, { bone: head });

  b.extrude(
    [
      [0, 0.024],
      [0.07, 0.02],
      [0.12, -0.004, "sharp"],
      [0.07, -0.014],
      [0, -0.014],
    ],
    {
      at: [0, 0.69, 0.08],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.032,
      bevel: 0.004,
      smoothing: 1,
      color: BEAK,
      bone: head,
    },
  );

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.674, 0.08],
    aim: [0, 0.674, 0.22],
    role: "jaw",
  });
  b.extrude(
    [
      [0, 0],
      [0.07, 0],
      [0.115, -0.008, "sharp"],
      [0.07, -0.02],
      [0, -0.02],
    ],
    {
      at: [0, 0.674, 0.08],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.028,
      bevel: 0.004,
      smoothing: 1,
      color: BEAK,
      bone: jaw,
    },
  );

  // Short stiff tail fan at the back
  const tail = b.chain("tail", [[0, 0.25, -0.05], [0, 0.22, -0.13]], {
    parent: hips,
    names: ["tail1", "tailTip"],
    role: "tail",
  });
  b.extrude(
    [
      [0, 0.05],
      [-0.08, 0.005],
      [-0.1, -0.05, "sharp"],
      [0, -0.035],
    ],
    {
      at: [0, 0.25, -0.05],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.03,
      bevel: 0.004,
      color: INK,
      bone: tail.joints[0],
    },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Legs: thin tarsus from the hip down to the ankle
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.07, 0.25, -0.02],
        [s * 0.075, 0.13, 0],
        [s * 0.07, 0.02, 0.02],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(leg, [0.02, 0.014], { color: FOOT, sides: 8 });

    // Flat webbed foot lying on the floor, three toes pointing forward
    b.extrude(
      [
        [-0.03, -0.035],
        [0.03, -0.035],
        [0.045, 0],
        [0.05, 0.035, "sharp"],
        [0.018, 0.02],
        [0, 0.07, "sharp"],
        [-0.018, 0.02],
        [-0.05, 0.035, "sharp"],
        [-0.045, 0],
      ],
      {
        at: [s * 0.07, 0.006, 0.02],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        color: FOOT,
        bone: leg.tip!,
      },
    );

    // Flipper: a bendable chain with a paddle-shaped skin
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.1, 0.6, 0],
        [s * 0.165, 0.47, 0],
        [s * 0.2, 0.34, -0.02],
        [s * 0.215, 0.2, -0.05],
      ]),
      {
        parent: neck,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `flipper${side}`],
        role: "wing",
      },
    );
    b.sweep(wing, flipper, { color: INK, sides: 8, caps: { start: "round", end: "point" } });
  }

  return b.root;
}

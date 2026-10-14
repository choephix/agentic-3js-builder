import * as THREE from "three";
import { createBuilder, rng, bezier, catmull, spiral, stripes } from "../../../../src/index";

export const meta = {
  name: "seahorse",
  description: "A sunny yellow seahorse with a dorsal fin and big curious eyes, its curled tail wrapped around a seagrass strand.",
};

const YELLOW = "#ffc928";
const GOLD = "#e8a300";
const DARK = "#4a3210";
const WHITE = "#fffaf0";
const SCLERA = "#fffdf2";
const PUPIL = "#1b1410";
const GRASS = "#3d9a4a";
const GRASS_DK = "#2a7038";
const FIN = "#fff0b8";

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // Skeleton: root at the hips, a spine chain up to the neck tip, the head on the neck,
  // a lower jaw on the head, and a tail that curls round the seagrass.
  const hips = b.joint("hips", { at: [0, 0.1, 0], aim: [0, 0.16, 0.01], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.1, 0],
      [0, 0.16, 0.01],
      [0, 0.22, 0.03],
      [0, 0.27, 0.05],
      [0, 0.31, 0.08],
      [0, 0.345, 0.115],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4", "spine5", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.tip ?? hips, at: [0, 0.345, 0.115], dir: [0, -0.2, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.34, 0.16], aim: [0, 0.31, 0.3], role: "jaw" });

  const tailPath = bezier([0, 0.1, 0], [0, 0.085, -0.02], [0, 0.075, -0.05], [0, 0.1, -0.065]).concat(
    spiral([0, 0.1, -0.11], [0, 0.1, -0.065], [0, 1, 0], { turns: 1.25, r1: 0.03, pitch: 0.03 }),
  );
  const tail = b.chain("tail", tailPath, { parent: hips, count: 8, role: "tail" });

  // Ridged body: yellow with thin dark bands running round it.
  const bandPaint = stripes(YELLOW, DARK, { size: 0.04, axis: "y", width: 0.15 });
  const bodyR = (t: number) => 0.022 + 0.026 * Math.sin(Math.PI * Math.min(1, t / 0.8));
  const trunk = b.sweep(spine, bodyR, { color: bandPaint });

  // Bony plates along both flanks.
  for (let i = 0; i < 7; i++) {
    const t = 0.14 + i * 0.1;
    for (const deg of [90, -90]) {
      b.stick(new THREE.BoxGeometry(0.012, 0.01, 0.02), GOLD, trunk.at(t, deg), { embed: 0.3 });
    }
  }

  // A few white freckles scattered over the body.
  const skin = b.surface(trunk);
  for (const h of skin.scatter(18, { rng: rng(7), minDist: 0.035 })) {
    b.stick(new THREE.SphereGeometry(0.0045, 6, 4), WHITE, h, { embed: 0.4 });
  }

  // Curled tail in yellow with the same banding.
  b.sweep(tail, (t: number) => 0.02 - 0.014 * t, { color: bandPaint });

  // Head: a rounded skull, big eyes, and a crown of small spikes.
  b.part(new THREE.SphereGeometry(0.046, 14, 10), bandPaint, {
    bone: head,
    at: [0, 0.36, 0.12],
    scale: [0.92, 1, 1.05],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.026, 10, 8), SCLERA, { bone: head, at: [s * 0.036, 0.365, 0.135] });
    b.part(new THREE.SphereGeometry(0.013, 8, 6), PUPIL, { bone: head, at: [s * 0.056, 0.362, 0.148] });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), WHITE, { bone: head, at: [s * 0.064, 0.37, 0.158] });
  }
  const crownBases: [number, number, number][] = [
    [0, 0.3926, 0.1352],
    [0, 0.396, 0.12],
    [0, 0.3926, 0.1048],
    [0, 0.3831, 0.0924],
  ];
  const crownLen = [0.035, 0.045, 0.04, 0.03];
  crownBases.forEach((base, i) => {
    b.spike(base, [0, 1, -0.4], crownLen[i], 0.007, { color: GOLD, bone: head });
  });

  // Tube snout (upper) and a separate lower jaw.
  b.sweep(
    bezier([0, 0.355, 0.15], [0, 0.34, 0.19], [0, 0.325, 0.24], [0, 0.31, 0.29]),
    [0.017, 0.008],
    { bone: head, color: bandPaint },
  );
  b.sweep(
    bezier([0, 0.34, 0.15], [0, 0.33, 0.19], [0, 0.322, 0.24], [0, 0.315, 0.29]),
    [0.012, 0.006],
    { bone: jaw, color: GOLD },
  );

  // Delicate dorsal fin on the back, with a few dark rays.
  const fin = b.extrude(
    [
      [0, 0],
      [0.05, 0.02],
      [0.078, 0.1],
      [0.066, 0.18],
      [0.03, 0.23],
      [0, 0.24],
    ],
    {
      at: [0, 0.12, -0.025],
      x: [0, 0, -1],
      y: [0, 1, 0.35],
      thickness: 0.004,
      bevel: 0.0012,
      smoothing: 2,
      color: FIN,
    },
  );
  const rays: [number, number, number, number][] = [
    [0, 0.03, 0.05, 0.03],
    [0, 0.09, 0.072, 0.1],
    [0, 0.15, 0.062, 0.165],
    [0, 0.2, 0.034, 0.22],
  ];
  for (const [u0, v0, u1, v1] of rays) {
    b.rod(fin.local([u0, v0, 0]), fin.local([u1, v1, 0]), 0.0012, { color: DARK });
  }

  // Seagrass strand rising from the floor, with the tail wrapped round it.
  b.extrude(
    [
      [-0.011, 0],
      [0.013, 0.16],
      [0.005, 0.36],
      [0, 0.46, "sharp"],
      [-0.005, 0.3],
      [-0.012, 0.12],
    ],
    { at: [0, 0, -0.11], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.004, 0.001], bevel: 0.0008, color: GRASS, bone: hips },
  );
  b.extrude(
    [
      [-0.01, 0],
      [-0.015, 0.15],
      [-0.005, 0.34],
      [0.004, 0.44, "sharp"],
      [0.007, 0.28],
      [0.011, 0.12],
    ],
    { at: [0, 0, -0.11], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: GRASS_DK, bone: hips },
  );
  b.extrude(
    [
      [-0.008, 0],
      [0.01, 0.2],
      [0, 0.3, "sharp"],
      [-0.008, 0.14],
    ],
    { at: [0, 0, -0.11], x: [0.7, 0, 0.7], y: [0, 1, 0], thickness: 0.003, color: GRASS, bone: hips },
  );

  return b.root;
}

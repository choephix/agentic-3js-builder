```ts
import * as THREE from "three";
import { countershade, createBuilder, gradient, mix, mottle, paint, resolve, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox",
  description:
    "A fennec fox at rest: sand coat, cream face and belly, huge upright ears lined with cream, a bushy tail with a black tip.",
};

// Palette.
const SAND = "#e4b27c";
const SAND_DEEP = "#c98a52";
const CREAM = "#fdf1de";
const INK = "#20160f";
const TIP = "#2b1d14";
const GLINT = "#fff9ef";

// Fur: sand mottled a little, countershaded so the underside is cream.
const fur = mottle(SAND, SAND_DEEP, { size: 0.035, contrast: 0.6, seed: 3 });
const coat = countershade(fur, CREAM, { level: -0.2, soft: 0.45 });
// Head: sand over the skull, cream across the muzzle and under the jaw.
const headCoat = countershade(gradient(fur, CREAM, [0, 0.3, 0.27], [0, 0.3, 0.335]), CREAM, {
  level: -0.25,
  soft: 0.45,
});
// Paws: cream socks fading up into the leg.
const sock = gradient(CREAM, fur, [0, 0.03, 0], [0, 0.085, 0]);
// Tail: fur, then a black tip over the last fifth.
const tailCoat = paint((p, n, s) => mix(resolve(coat, p, n), TIP, smoothstep(0.78, 0.86, s[0])));
// Ears: cream on the face-forward side (the cupped inside), sand on the back.
const earCoat = paint((_p, n) => (n.z > 0.2 ? CREAM : fur));

// One ear: a tall rounded triangle, wide at the base, drawn in its own plane (x across, y up it).
const EAR = [
  [-0.034, 0, "sharp"],
  [0.034, 0, "sharp"],
  [0.03, 0.06],
  [0.017, 0.12],
  [0, 0.15],
  [-0.017, 0.12],
  [-0.03, 0.06],
];

export default function fennec() {
  const b = createBuilder({ name: "fennec", paintSize: 2048 });

  // Skeleton: a pelvis root, the spine from rump to chest, neck, head and a hinged jaw, ears on the skull,
  // four legs, and a tail from the rump.
  b.joint("hips", { at: [0, 0.22, -0.06] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.218, -0.11],
      [0, 0.224, -0.01],
      [0, 0.23, 0.09],
    ],
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.23, 0.09],
      [0, 0.265, 0.15],
      [0, 0.292, 0.2],
    ],
    { parent: "chest", names: ["neck1", "neck2", "head"], role: "neck" },
  );

  // Body: a slim torso, a little broader at the chest.
  b.sweep(spine, (t: number): [number, number] => [0.046 + 0.008 * t, 0.05 + 0.007 * Math.sin(Math.PI * t)], {
    name: "torso",
    color: coat,
    sides: 10,
  });
  b.sweep(neck, (t: number) => 0.041 - 0.012 * t, { name: "neck", color: coat, sides: 8 });

  // Head: four stations from a wide skull to a narrow nose, skinned to the head joint.
  const skull = b.loft(
    [
      { at: [0, 0.29, 0.22], w: 0.1, h: 0.09 },
      { at: [0, 0.287, 0.265], w: 0.09, h: 0.082 },
      { at: [0, 0.281, 0.31], w: 0.06, h: 0.05 },
      { at: [0, 0.276, 0.345], w: 0.026, h: 0.026 },
    ],
    { name: "skull", color: headCoat, bone: "head", sides: 12 },
  );

  // Lower jaw: its own joint, hinged at the back of the mouth, so it can open.
  b.joint("jaw", { parent: "head", at: [0, 0.256, 0.235], dir: [0, 0, 1], role: "jaw" });
  b.sweep(
    [
      [0, 0.256, 0.235],
      [0, 0.247, 0.29],
      [0, 0.25, 0.33],
    ],
    (t: number): [number, number] => [0.016 - 0.007 * t, 0.011 - 0.003 * t],
    { name: "jawLower", color: CREAM, bone: "jaw", sides: 8 },
  );

  // Ears: huge and upright, each on its own joint so it can flick. Extruded plates, thick at the base, thin at the tip.
  for (const side of [1, -1] as const) {
    const k = side > 0 ? "L" : "R";
    const base: [number, number, number] = [side * 0.03, 0.327, 0.2];
    b.joint(`ear${k}`, { parent: "head", at: base, dir: [side * 0.3, 1, 0], role: "hinge" });
    b.extrude(EAR, {
      name: `ear${k}`,
      color: earCoat,
      at: base,
      x: [side * 0.707, 0, -0.707],
      y: [side * 0.3, 1, 0],
      thickness: [0.012, 0.004],
      bevel: 0.003,
      smoothing: 1,
      bone: `ear${k}`,
    });
  }

  // Legs: long and slim. The front legs hang from the chest; the hind legs hang from the hips and bend back at the hock.
  for (const side of [1, -1] as const) {
    const k = side > 0 ? "L" : "R";
    const fx = side * 0.046;
    const fore = b.chain(
      `fore${k}`,
      [
        [fx, 0.215, 0.085],
        [fx, 0.115, 0.088],
        [fx, 0.035, 0.094],
        [fx, 0.011, 0.126],
      ],
      { parent: "chest", names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `pawF${k}`], role: "leg" },
    );
    b.sweep(fore, (t: number) => 0.02 - 0.009 * t, { name: `foreLeg${k}`, color: sock, sides: 8 });

    const hx = side * 0.05;
    const hind = b.chain(
      `hind${k}`,
      [
        [hx, 0.218, -0.1],
        [hx, 0.13, -0.072],
        [hx, 0.045, -0.112],
        [hx, 0.011, -0.088],
      ],
      { parent: "hips", names: [`hip${k}`, `knee${k}`, `hock${k}`, `pawH${k}`], role: "leg" },
    );
    b.sweep(hind, (t: number) => 0.026 - 0.015 * t, { name: `hindLeg${k}`, color: sock, sides: 8 });
  }

  // Tail: a long brush from the rump, fullest a third of the way along, its last fifth black.
  const tail = b.chain(
    "tail",
    [
      [0, 0.218, -0.11],
      [0, 0.222, -0.16],
      [0, 0.23, -0.21],
      [0, 0.24, -0.26],
      [0, 0.25, -0.31],
    ],
    { parent: "spine1", names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(
    tail,
    (t: number): [number, number] => {
      const r = 0.03 + 0.02 * Math.sin(Math.PI * t ** 0.7);
      return [r, r * 0.9];
    },
    { name: "tail", color: tailCoat, sides: 10 },
  );

  // Face: big dark eyes with a glint, a black nose, dark whiskers. Eyes and nose sit on the skull's real surface.
  const face = b.surface(skull);
  for (const side of [1, -1] as const) {
    const eye = face.nearest([side * 0.04, 0.297, 0.272]);
    b.stick(new THREE.SphereGeometry(0.0125, 12, 9), INK, eye, {
      name: side > 0 ? "eyeL" : "eyeR",
      embed: 0.35,
      scale: [1, 0.6, 1],
    });
    const glint = eye.at.addScaledVector(eye.n, 0.0105).add(new THREE.Vector3(side * 0.0025, 0.0035, 0.0035));
    b.part(new THREE.SphereGeometry(0.0035, 8, 6), GLINT, {
      name: side > 0 ? "glintL" : "glintR",
      at: glint,
      bone: "head",
    });
  }
  const nose = face.nearest([0, 0.276, 0.36]);
  b.stick(new THREE.SphereGeometry(0.0115, 10, 8), INK, nose, {
    name: "nose",
    embed: 0.45,
    scale: [1.2, 0.8, 1],
  });
  for (const side of [1, -1]) {
    b.rod([side * 0.02, 0.276, 0.318], [side * 0.088, 0.266, 0.405], 0.0011, {
      name: "whisker",
      color: INK,
      bone: "head",
    });
    b.rod([side * 0.02, 0.27, 0.322], [side * 0.082, 0.254, 0.39], 0.0011, {
      name: "whisker",
      color: INK,
      bone: "head",
    });
  }

  return b.root;
}
```
import * as THREE from "three";
import { catmull, createBuilder, frame, interpolate, mix, noise, paint, rgb, rng, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description: "A male lion in a neutral rest pose: tawny coat, dark mane, amber eyes, fangs and a jaw that opens.",
};

// Paint colours, parsed once so the bake stays quick.
const TAWNY = rgb("#c4884a");
const TAWNY_DEEP = rgb("#8c5626");
const CREAM = rgb("#eedcb4");
const PAW = rgb("#56361d");
const MANE_DARK = rgb("#44270f");
const MANE_LIGHT = rgb("#7e4d23");

// Solid colours.
const EYE = "#e9a22f";
const PUPIL = "#120b06";
const NOSE = "#2a1a12";
const DOTS = "#5b3619";
const TEETH = "#f6efdc";
const THROAT = "#3d1915";

/** Tawny coat: mottled fur, darker over the back, pale underneath, cream muzzle, dark feet. */
const coat = paint((p, n) => {
  let c = mix(TAWNY, TAWNY_DEEP, smoothstep(0.45, 0.72, noise(p, 0.06, 3)) * 0.55);
  c = mix(c, TAWNY_DEEP, smoothstep(0.35, 1, n.y) * 0.28);
  c = mix(c, CREAM, (1 - smoothstep(-0.45, 0.2, n.y)) * 0.7);
  c = mix(c, CREAM, smoothstep(1.02, 1.12, p.z) * 0.85);
  return mix(c, PAW, smoothstep(0.14, 0.02, p.y) * 0.6);
});

/** The mane: deep brown with lighter strands. */
const mane = paint((p) => mix(MANE_DARK, MANE_LIGHT, smoothstep(0.42, 0.7, noise(p, 0.045, 21)) * 0.8));

// Radius profiles: torso (source t of the spine), neck (source t of the neck).
const TORSO_T = [0, 0.35, 0.7, 1];
const TORSO_RX = [0.15, 0.15, 0.165, 0.175];
const TORSO_RY = [0.175, 0.16, 0.185, 0.2];
const NECK_T = [0, 0.5, 1];
const NECK_RX = [0.15, 0.13, 0.115];
const NECK_RY = [0.17, 0.14, 0.125];

export default function lion() {
  const b = createBuilder({ name: "lion", detail: 1, paintSize: 1024 });

  // ---- Skeleton: pelvis at the root, spine ending in the chest, neck and head, tail, four legs.
  const pelvis = b.joint("pelvis", { at: [0, 0.98, -0.44] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.36],
      [0, 1.0, -0.08],
      [0, 1.03, 0.2],
      [0, 1.06, 0.42],
    ]),
    { parent: pelvis, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const [, , spine3, chest] = spine.joints;

  // Torso: one smooth tube bending with the spine.
  b.sweep(
    spine,
    (t: number): [number, number] => [interpolate(TORSO_T, TORSO_RX, t), interpolate(TORSO_T, TORSO_RY, t)],
    { color: coat, name: "torso" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.06, 0.42],
      [0, 1.17, 0.6],
      [0, 1.27, 0.8],
    ]),
    { parent: chest, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  b.sweep(
    neck,
    (t: number): [number, number] => [interpolate(NECK_T, NECK_RX, t), interpolate(NECK_T, NECK_RY, t)],
    { color: coat, name: "neck" },
  );
  const head = neck.joints[2];

  // Tail: hangs from the rump, curls up at the tip, ends in a dark tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.96, -0.5],
      [0, 0.9, -0.8],
      [0, 0.62, -0.98],
      [0, 0.34, -1.04],
      [0, 0.16, -0.98],
    ]),
    { parent: pelvis, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );
  b.sweep(tail, [0.05, 0.036, 0.028], { color: coat, name: "tail" });
  const tip = tail.joints[4];
  b.part(new THREE.SphereGeometry(0.058, b.segments(12), b.segments(9)), mane, {
    at: [0, 0.16, -0.98],
    bone: tip,
    scale: [1, 1.2, 1],
    name: "tailTuft",
  });
  b.ring(tip, { count: 11, radius: 0.03, tilt: 40 }, (item) => {
    b.spike(item, item, 0.075, 0.02, { color: mane, bone: tip });
  });

  // ---- Legs: a tube per leg, a flattened paw with toe beads at the tip joint.
  const addLeg = (side: "L" | "R", s: number) => {
    const fore = b.chain(
      `foreleg${side}`,
      [
        [s * 0.16, 1.0, 0.3],
        [s * 0.18, 0.5, 0.26],
        [s * 0.16, 0.13, 0.36],
        [s * 0.16, 0.03, 0.42],
      ],
      { parent: spine3, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${side}`], role: "leg" },
    );
    b.sweep(fore, [0.1, 0.075, 0.05, 0.043], { color: coat, name: `foreleg${side}` });
    const paw = fore.joints[3];
    b.part(new THREE.SphereGeometry(0.075, b.segments(14), b.segments(10)), coat, {
      at: [s * 0.16, 0.035, 0.45],
      bone: paw,
      scale: [1, 0.5, 1.3],
      name: `forepaw${side}`,
    });
    for (const dx of [-0.04, 0, 0.04])
      b.part(new THREE.SphereGeometry(0.03, b.segments(9), b.segments(7)), coat, {
        at: [s * 0.16 + dx, 0.024, 0.535],
        bone: paw,
        scale: [1, 0.75, 0.85],
        name: `toe${side}`,
      });

    const hind = b.chain(
      `hindleg${side}`,
      [
        [s * 0.17, 0.94, -0.42],
        [s * 0.2, 0.5, -0.36],
        [s * 0.16, 0.2, -0.56],
        [s * 0.15, 0.05, -0.5],
      ],
      { parent: pelvis, names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`], role: "leg" },
    );
    b.sweep(hind, [0.12, 0.085, 0.058, 0.045], { color: coat, name: `hindleg${side}` });
    const ankle = hind.joints[3];
    b.part(new THREE.SphereGeometry(0.075, b.segments(14), b.segments(10)), coat, {
      at: [s * 0.15, 0.035, -0.46],
      bone: ankle,
      scale: [1, 0.5, 1.3],
      name: `hindpaw${side}`,
    });
    for (const dx of [-0.04, 0, 0.04])
      b.part(new THREE.SphereGeometry(0.03, b.segments(9), b.segments(7)), coat, {
        at: [s * 0.15 + dx, 0.024, -0.37],
        bone: ankle,
        scale: [1, 0.75, 0.85],
        name: `toe${side}`,
      });
  };
  addLeg("L", 1);
  addLeg("R", -1);

  // ---- Head: a lofted skull and muzzle on the head joint.
  const skull = b.loft(
    [
      { at: [0, 1.26, 0.84], w: 0.2, h: 0.22 },
      { at: [0, 1.28, 0.96], w: 0.28, h: 0.27 },
      { at: [0, 1.27, 1.07], w: 0.29, h: 0.25 },
      { at: [0, 1.22, 1.16], w: 0.19, h: 0.17 },
      { at: [0, 1.2, 1.25], w: 0.12, h: 0.12 },
    ],
    { color: coat, name: "skull", bone: head },
  );
  const face = b.surface(skull);

  // Lower jaw on its own joint, hinged at the back of the mouth.
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.14, 0.96], dir: [0, -0.12, 1], role: "jaw" });
  b.loft(
    [
      { at: [0, 1.14, 0.95], w: 0.15, h: 0.12 },
      { at: [0, 1.12, 1.07], w: 0.13, h: 0.085 },
      { at: [0, 1.1, 1.17], w: 0.085, h: 0.065 },
    ],
    { color: coat, name: "jaw", bone: jaw },
  );

  // Dark inside of the mouth, visible when the jaw opens.
  b.part(new THREE.SphereGeometry(0.06, b.segments(12), b.segments(8)), THROAT, {
    at: [0, 1.125, 1.02],
    bone: head,
    scale: [1.2, 0.5, 2],
    name: "throat",
  });

  // Fangs: upper ones hang from the skull, lower ones rise from the jaw.
  for (const s of [1, -1]) {
    b.spike([s * 0.05, 1.17, 1.1], [0, -1, 0], 0.05, 0.012, { color: TEETH, bone: head, name: "fangUpper" });
    b.spike([s * 0.045, 1.12, 1.1], [0, 1, 0], 0.045, 0.011, { color: TEETH, bone: jaw, name: "fangLower" });
  }

  // Eyes, pupils, ears, whisker dots and nose, all seated on the real skull surface.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const eyeHit = face.ray([s * 0.085, 1.31, 2], [0, 0, -1]) ?? face.nearest([s * 0.085, 1.31, 1.1]);
    const eye = b.stick(new THREE.SphereGeometry(0.032, b.segments(14), b.segments(10)), EYE, eyeHit, {
      embed: 0.25,
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.014, b.segments(10), b.segments(8)), PUPIL, {
      frame: eye,
      at: eye.local([0, 0.024, 0]),
      name: `pupil${side}`,
    });

    const pad = face.ray([s * 0.09, 1.18, 2], [0, 0, -1]) ?? face.nearest([s * 0.09, 1.18, 1.2]);
    b.stick(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), DOTS, pad, {
      embed: 0.4,
      name: `whiskerDot${side}`,
    });

    const ear = face.ray([s * 0.1, 2, 1.0], [0, -1, 0]) ?? face.nearest([s * 0.1, 1.38, 1.0]);
    b.stick(new THREE.SphereGeometry(0.045, b.segments(12), b.segments(8)), coat, ear, {
      embed: 0.4,
      scale: [1, 0.75, 0.9],
      name: `ear${side}`,
    });
  }

  const nose = face.ray([0, 1.2, 2], [0, 0, -1]) ?? face.nearest([0, 1.2, 1.3]);
  b.stick(new THREE.SphereGeometry(0.05, b.segments(14), b.segments(10)), NOSE, nose, {
    embed: 0.35,
    scale: [1.3, 0.85, 1],
    name: "nose",
  });

  // ---- Mane: two staggered rings of tapered tufts around the back of the head and neck, leaning backward.
  const ruff = frame(head, [0, -0.2, -1]);
  const random = rng(7);
  b.ring(ruff, { count: 22, radius: 0.1, tilt: 40 }, (item) => {
    b.spike(item, item, 0.2 + 0.06 * random(), 0.055, { color: mane, bone: head, name: "mane" });
  });
  b.ring(ruff, { count: 28, radius: 0.13, tilt: 58, fromDeg: 6 }, (item) => {
    b.spike(item, item, 0.25 + 0.07 * random(), 0.06, { color: mane, bone: head, name: "mane" });
  });

  // Open the jaw slightly: a readable, slightly snarling rest pose.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}

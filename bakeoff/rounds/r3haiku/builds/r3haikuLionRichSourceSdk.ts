import * as THREE from "three";
import { catmull, createBuilder, frame, mix, noise, paint, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Resting lion",
  description:
    "An old lion resting on his haunches with his head held high: a golden-to-chocolate mane, a tawny coat with a cream belly and muzzle, amber eyes, a scarred brow and a tufted tail.",
};

const TAWNY = "#b97d3c";
const DEEP = "#7b4b23";
const CREAM = "#f2e0bb";
const BLOND = "#e9c774";
const CHOCOLATE = "#4b2713";
const AMBER = "#e8a01f";
const NOSE = "#140d0a";
const SCAR = "#b8685c";
const TUFT = "#2a1709";

/** Face centre: the mane runs from blond here to chocolate at its outer edge. */
const FACE = new THREE.Vector3(0, 1.0, 0.93);

/** Tawny coat, mottled, with a cream underside. */
const coat = paint((p, n) => {
  const belly = smoothstep(-0.55, -0.1, n.y);
  const base = mix(DEEP, TAWNY, noise(p, 0.22, 3));
  return mix(CREAM, base, belly);
});

/** Golden blond at the face, darkening to chocolate toward the edges of the mane. */
const mane = paint((p) => mix(BLOND, CHOCOLATE, smoothstep(0.2, 0.42, p.distanceTo(FACE))));

export default function lion() {
  const b = createBuilder({ name: "lion", paintSize: 1024 });

  // Hair tufts: a tapered drawing and a ragged one, tinted by the paint or colour given to the cards.
  const tuftA = svg(
    '<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 100 C6 74 2 36 20 0 C38 36 34 74 20 100Z" fill="#ffffff"/></svg>',
  );
  const tuftB = svg(
    '<svg viewBox="0 0 40 100" xmlns="http://www.w3.org/2000/svg"><path d="M20 100 C4 80 10 60 4 40 C14 30 10 14 20 0 C30 14 26 30 36 40 C30 60 36 80 20 100Z" fill="#ffffff"/></svg>',
  );

  // Root bone.
  b.joint("body", { at: [0, 0.5, -0.2], dir: [0, 0, 1] });

  // Spine: hindquarters on the ground, chest raised.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.55],
      [0, 0.54, -0.2],
      [0, 0.6, 0.1],
      [0, 0.66, 0.38],
    ]),
    { parent: "body", role: "spine", names: ["hips", "waist", "back", "chest"] },
  );
  b.sweep(spine, (t) => [0.19 + 0.03 * Math.sin(Math.PI * t), 0.2 + 0.03 * Math.sin(Math.PI * t)], {
    color: coat,
    sides: 12,
    name: "body",
  });

  // Neck rising to a high head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.66, 0.38],
      [0, 0.84, 0.56],
      [0, 0.98, 0.76],
    ]),
    { parent: "chest", role: "neck", names: ["neck1", "neck2", "head"] },
  );
  b.sweep(neck, (t) => 0.12 - 0.02 * t, { color: coat, sides: 10, name: "neck" });

  // Skull, muzzle, nose and jaw.
  const sphere = (detail = 1) => new THREE.SphereGeometry(1, b.segments(14, detail), b.segments(10, detail));
  b.part(sphere(), coat, { at: [0, 1.0, 0.8], scale: [0.14, 0.13, 0.15], bone: "head", name: "skull" });
  b.capsule(
    [0, 0.97, 0.84],
    [0, 0.95, 1.0],
    [0.075, 0.065],
    { color: CREAM, bone: "head", name: "muzzle" },
  );
  b.part(sphere(0.8), NOSE, { at: [0, 0.975, 1.05], scale: [0.06, 0.042, 0.04], bone: "head", name: "nose" });

  b.joint("jaw", { parent: "head", at: [0, 0.9, 0.86], dir: [0, -0.25, 1], role: "jaw" });
  b.capsule([0, 0.9, 0.86], [0, 0.87, 0.98], [0.05, 0.042], { color: CREAM, bone: "jaw", name: "chin" });

  // Amber eyes with dark pupils, and a scar through the left (+X) brow.
  for (const side of [1, -1]) {
    const x = side * 0.06;
    b.part(sphere(0.8), AMBER, { at: [x, 1.03, 0.925], scale: [0.024, 0.024, 0.02], bone: "head", name: "eye" });
    b.part(sphere(0.6), NOSE, { at: [x, 1.03, 0.945], scale: [0.011, 0.017, 0.01], bone: "head", name: "pupil" });
  }
  b.capsule([0.035, 1.07, 0.915], [0.1, 1.05, 0.885], 0.008, { color: SCAR, bone: "head", name: "scar" });

  // Rounded ears, set into the mane.
  for (const side of [1, -1])
    b.part(sphere(0.8), coat, { at: [side * 0.1, 1.12, 0.78], scale: [0.045, 0.04, 0.025], bone: "head", name: "ear" });

  // Mane: an inner ring of golden tufts round the face and a loose outer ring down the neck.
  const innerRing = b.ring(frame([0, 1.0, 0.76], [0, 0, 1]), { count: 28, radius: 0.15, tilt: -12 });
  b.cards(innerRing.items, [tuftA, tuftB], {
    size: [0.12, 0.2],
    lean: 0,
    bend: 35,
    flow: [0, -0.2, -1],
    cross: true,
    vary: 0.2,
    spin: 25,
    color: mane,
    bone: "head",
    name: "mane",
  });
  const outerRing = b.ring(frame([0, 0.98, 0.6], [0, 0, 1]), { count: 34, radius: 0.24, tilt: -20 });
  b.cards(outerRing.items, [tuftA, tuftB], {
    size: [0.14, 0.26],
    lean: 0,
    bend: 45,
    flow: [0, -0.3, -1],
    cross: true,
    vary: 0.25,
    spin: 30,
    color: mane,
    bone: "chest",
    name: "mane",
  });

  // Front legs stretched forward on the ground, with padded paws.
  for (const [side, L] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const x = side * 0.15;
    const arm = b.chain(
      `arm${L}`,
      catmull([
        [x, 0.6, 0.42],
        [x, 0.2, 0.56],
        [x, 0.07, 0.8],
        [x, 0.035, 0.95],
      ]),
      {
        parent: "chest",
        role: "leg",
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`],
      },
    );
    b.sweep(arm, (t) => 0.075 - 0.03 * t, { color: coat, sides: 8, name: `foreleg${L}` });
    b.part(sphere(), coat, {
      at: [x, 0.035, 0.97],
      scale: [0.085, 0.045, 0.095],
      bone: `paw${L}`,
      name: "paw",
    });
  }

  // Hind legs folded under: a haunch on the ground and a flat hind foot.
  for (const [side, L] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const x = side * 0.19;
    const leg = b.chain(
      `hind${L}`,
      catmull([
        [x, 0.32, -0.5],
        [x * 1.05, 0.2, -0.22],
        [x, 0.06, -0.12],
        [x, 0.035, -0.02],
      ]),
      {
        parent: "hips",
        role: "leg",
        names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      },
    );
    b.sweep(leg, (t) => 0.07 - 0.02 * t, { color: coat, sides: 8, name: `hindleg${L}` });
    b.part(sphere(), coat, {
      at: [x, 0.2, -0.5],
      scale: [0.17, 0.2, 0.23],
      bone: `hip${L}`,
      name: "haunch",
    });
    b.part(sphere(), coat, {
      at: [x, 0.035, -0.02],
      scale: [0.09, 0.045, 0.08],
      bone: `foot${L}`,
      name: "hindpaw",
    });
  }

  // Long tail curling onto the ground, ending in a dark tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.46, -0.72],
      [0, 0.42, -0.98],
      [0.02, 0.27, -1.2],
      [0.03, 0.13, -1.36],
      [0.04, 0.06, -1.46],
    ]),
    {
      parent: "hips",
      role: "tail",
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    },
  );
  b.sweep(tail, (t) => 0.05 - 0.025 * t, { color: coat, sides: 8, name: "tail" });
  const tuftRing = b.ring(tail.at(1), { count: 10, radius: 0.03, tilt: -25 });
  b.cards(tuftRing.items, [tuftA, tuftB], {
    size: [0.09, 0.13],
    lean: 10,
    bend: 20,
    cross: true,
    color: TUFT,
    bone: "tailTip",
    name: "tuft",
  });

  return b.root;
}

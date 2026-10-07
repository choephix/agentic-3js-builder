import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Sweep } from "../src/sweep";
import type { OutlinePoint } from "../src/outline";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { countershade, gradient, mottle, paint, stripes } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Capybara with a Songbird",
  description:
    "A placid capybara in a flower garland, with a teal and coral songbird perched on its head. Soft rounded masses, warm brown fur, cream chin and belly, blossoms and grass tufts underfoot.",
  style: "whimsical",
  commit: "b816db2",
};

// Palette: warm capybara browns, cream undersides, and a bright songbird.
const COAT = "#8f5d36";
const COAT_LIGHT = "#b98454";
const COAT_DARK = "#5b3a22";
const CREAM = "#f3dca9";
const NOSE = "#3b2418";
const INK = "#1d140f";
const HOOF = "#3a2a20";
const BLUSH = "#ef8f86";
const EAR_IN = "#d9977a";
const TEAL = "#2aa79b";
const TEAL_DARK = "#1d7a74";
const CORAL = "#ff7f50";
const YELLOW = "#ffd23f";
const PINK = "#ff8fb1";
const LEAF = "#5fb85a";
const GRASS = "#7cc45e";
const BEAK_LEG = "#e8962e";
const WHITE = "#fffaf0";

// Drawings are white, so the card colour tints them: fur tufts, grass blades and a blossom on a stem.
const TUFT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 63 C9 46 6 26 16 2 C21 24 24 44 16 63 Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const BLADES = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64"><path d="M6 63 Q9 32 2 6 Q16 30 14 63 Z" fill="#ffffff"/><path d="M20 63 Q18 26 24 0 Q29 28 26 63 Z" fill="#ffffff"/><path d="M34 63 Q33 34 40 12 Q44 36 42 63 Z" fill="#ffffff"/></svg>`,
  { size: 192 },
);
const BLOSSOM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 63 Q15 42 16 24" stroke="#ffffff" stroke-width="2.4" fill="none" stroke-linecap="round"/><g fill="#ffffff"><circle cx="16" cy="12" r="4.2"/><circle cx="16" cy="6" r="4.4"/><circle cx="21.7" cy="10.1" r="4.4"/><circle cx="19.5" cy="17.1" r="4.4"/><circle cx="12.5" cy="17.1" r="4.4"/><circle cx="10.3" cy="10.1" r="4.4"/></g></svg>`,
  { size: 128 },
);

// Outlines are drawn with x = forward (+Z) and y = up, so they lie in the side plane.
const WING: OutlinePoint[] = [
  [0.03, 0.05],
  [-0.02, 0.065],
  [-0.07, 0.055],
  [-0.12, 0.0, "sharp"],
  [-0.1, -0.035],
  [-0.06, -0.055],
  [-0.025, -0.075],
  [0.02, -0.04],
];
const TAIL: OutlinePoint[] = [
  [0.02, 0.03],
  [-0.05, 0.05],
  [-0.11, 0.035],
  [-0.16, 0.0, "sharp"],
  [-0.12, -0.03],
  [-0.06, -0.035],
  [0.02, -0.015],
];

// Paints: a countershaded coat, a warmer head, and a bird with a coral breast.
const coat = countershade(mottle(COAT, COAT_LIGHT, { size: 0.16, seed: 4 }), CREAM, { level: -0.2 });
const headCoat = countershade(mottle(COAT_DARK, COAT, { size: 0.1, seed: 9 }), CREAM, { level: -0.1 });
const legCoat = gradient(COAT, HOOF, [0, 0.24, 0], [0, 0.04, 0]);
const birdBody = paint((p, n) => (n.z > 0.35 && p.y < 0.8 ? CORAL : TEAL));
const birdWingPaint = stripes(TEAL, TEAL_DARK, { size: 0.03, axis: "z", seed: 2 });
const birdTailPaint = paint((p) => (p.z < 0.38 ? YELLOW : TEAL_DARK));

export default function build() {
  const b = createBuilder({ name: "capybaraSongbird", detail: 1.2 });

  // Skeleton: hips, a three-joint spine, head and jaw, a stub tail, four legs.
  const hips = b.joint("hips", { at: [0, 0.41, -0.3], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.41, -0.3],
      [0, 0.41, -0.02],
      [0, 0.44, 0.22],
      [0, 0.49, 0.42],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.47, 0.52], dir: [0, -0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.4, 0.52], dir: [0, -0.2, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.45, -0.42],
      [0, 0.47, -0.48],
      [0, 0.49, -0.53],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.045, 0.03], { color: coat });

  // Body: a barrel of stations, skinned over the spine.
  const body = b.loft(
    [
      { at: [0, 0.42, -0.3], w: 0.34, h: 0.3 },
      { at: [0, 0.41, -0.2], w: 0.44, h: 0.36 },
      { at: [0, 0.4, -0.02], w: 0.48, h: 0.4 },
      { at: [0, 0.41, 0.16], w: 0.46, h: 0.38 },
      { at: [0, 0.44, 0.32], w: 0.38, h: 0.34 },
      { at: [0, 0.48, 0.42], w: 0.28, h: 0.28 },
    ],
    { bone: [hips, spine], color: coat },
  );

  // Head: broad, blunt and low, with a flat snout.
  const skull = b.loft(
    [
      { at: [0, 0.47, 0.42], w: 0.26, h: 0.25 },
      { at: [0, 0.47, 0.52], w: 0.31, h: 0.28 },
      { at: [0, 0.45, 0.63], w: 0.29, h: 0.25 },
      { at: [0, 0.42, 0.72], w: 0.26, h: 0.21 },
      { at: [0, 0.41, 0.76], w: 0.21, h: 0.18 },
    ],
    { bone: head, color: headCoat },
  );
  // Chin: a cream lower jaw on its own joint, so the mouth can open.
  b.loft(
    [
      { at: [0, 0.38, 0.46], w: 0.22, h: 0.1 },
      { at: [0, 0.36, 0.58], w: 0.22, h: 0.1 },
      { at: [0, 0.35, 0.68], w: 0.18, h: 0.08 },
    ],
    { bone: jaw, color: CREAM },
  );

  const headSurf = b.surface(skull);
  const bodySurf = b.surface(body);

  // Eyes: round and set high on the sides of the head, with a glint on each eye's upper front.
  const eyes = [1, -1].map((s) => {
    const hit = headSurf.nearest([s * 0.12, 0.56, 0.6]);
    const c = hit.at.clone();
    const g = c.clone().addScaledVector(hit.n, 0.022).add(new THREE.Vector3(0, 0.01, 0));
    b.part(new THREE.SphereGeometry(0.026, 12, 8), INK, { bone: head, at: [c.x, c.y, c.z] });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), WHITE, { bone: head, at: [g.x, g.y, g.z] });
    return hit;
  });

  // Rounded ears on the top-back of the head, each on a hinge joint, with a flower on the right one.
  const earHits = [1, -1].map((s) => {
    const hit = headSurf.nearest([s * 0.1, 0.6, 0.46]);
    const ear = b.joint(s > 0 ? "earL" : "earR", { parent: head, at: hit, role: "hinge" });
    b.stick(new THREE.SphereGeometry(0.05, 12, 8).scale(1, 0.32, 1), COAT_DARK, hit, { embed: 0.2, bone: ear });
    b.stick(new THREE.SphereGeometry(0.03, 8, 6).scale(1, 0.25, 1), EAR_IN, hit.moved([0, 0.012, 0]), {
      embed: 0.2,
      bone: ear,
    });
    return hit;
  });
  b.stick(new THREE.SphereGeometry(0.028, 8, 6).scale(1, 0.35, 1), PINK, earHits[1].moved([0.02, 0.014, 0.03]), {
    embed: 0.1,
    bone: head,
  });

  // Rosy cheeks, a nose pad with two nostrils, and a little smile drawn on the snout.
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.03, 10, 6).scale(1, 0.3, 1), BLUSH, headSurf.nearest([s * 0.14, 0.38, 0.6]), {
      embed: 0.2,
      bone: head,
    });
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), NOSE, headSurf.nearest([s * 0.035, 0.46, 0.8]), {
      embed: 0.3,
      bone: head,
    });
  }
  b.stick(new THREE.SphereGeometry(0.045, 12, 8).scale(1.3, 0.45, 0.9), NOSE, headSurf.nearest([0, 0.43, 0.8]), {
    embed: 0.2,
    bone: head,
  });
  const mouth = headSurf.drape(
    catmull([
      [-0.1, 0.4, 0.6],
      [-0.06, 0.36, 0.7],
      [0, 0.35, 0.74],
      [0.06, 0.36, 0.7],
      [0.1, 0.4, 0.6],
    ]),
    { lift: 0.003 },
  );
  b.sweep(mouth, 0.008, { color: NOSE, sides: 6 });

  // Legs: a hip, knee, ankle and foot chain on each leg, with a rounded hoof pad and three toenails.
  const legSweeps: Sweep[] = [];
  const leg = (tag: string, parent: typeof hips, pts: number[][]) => {
    const chain = b.chain(`leg${tag}`, catmull(pts), {
      parent,
      names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `foot${tag}`],
      role: "leg",
    });
    legSweeps.push(b.sweep(chain, [0.1, 0.07, 0.05, 0.045], { color: legCoat }));
    return chain;
  };
  const hoof = (foot: typeof hips, x: number, z: number) => {
    b.part(new THREE.SphereGeometry(0.06, 12, 8).scale(1, 0.5, 1.25), legCoat, { bone: foot, at: [x, 0.03, z] });
    for (const d of [-0.028, 0, 0.028]) {
      b.part(new THREE.SphereGeometry(0.013, 6, 4).scale(1, 0.7, 0.8), HOOF, {
        bone: foot,
        at: [x + d, 0.03, z + 0.07],
      });
    }
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = 0.15 * s;
    const front = leg(`F${side}`, spine.joints[2], [
      [x, 0.34, 0.2],
      [x, 0.19, 0.22],
      [x, 0.07, 0.24],
      [x, 0.03, 0.29],
    ]);
    hoof(front.joints[3], x, 0.29);
    const hind = leg(`H${side}`, hips, [
      [x, 0.36, -0.24],
      [x, 0.19, -0.22],
      [x, 0.07, -0.25],
      [x, 0.03, -0.2],
    ]);
    hoof(hind.joints[3], x, -0.2);
  }

  // Leg fur: short tufts on the lower legs, coloured by the leg paint at each root.
  const legSurf = b.surface(legSweeps);
  b.cards(legSurf.scatter(160, { rng: rng(10), minDist: 0.026, filter: (h) => h.at.y > 0.12 && h.at.y < 0.3 && h.n.y > -0.3 }), TUFT, {
    size: [0.024, 0.04],
    lean: 35,
    bend: 15,
    vary: 0.25,
    rng: rng(11),
    color: legCoat,
  });

  // Fur: tufts scattered over the coat, combed back, and a finer set on the head away from the eyes.
  const fur = bodySurf.scatter(520, { rng: rng(3), minDist: 0.034, filter: (h) => h.n.y > -0.85 });
  b.cards(fur, TUFT, { size: [0.032, 0.065], lean: 50, bend: 25, vary: 0.3, rng: rng(4), color: coat });
  const headFur = headSurf.scatter(160, {
    rng: rng(5),
    minDist: 0.026,
    filter: (h) => h.n.y > -0.4 && h.at.z < 0.7 && eyes.every((e) => h.at.distanceTo(e.at) > 0.08),
  });
  b.cards(headFur, TUFT, { size: [0.024, 0.045], lean: 50, bend: 20, vary: 0.3, rng: rng(6), color: headCoat });

  // Flower garland round the neck: pink and yellow blooms with leaves between them, on a ring cut through the body.
  const garland = bodySurf.loop([0, 0.48, 0.34], { dir: [0, 0, 1], lift: 0.02 });
  b.sweep(garland, 0.012, { color: LEAF });
  let k = 0;
  b.along(garland, 21, (at) => {
    const i = k++ % 3;
    if (i === 2) {
      b.part(new THREE.SphereGeometry(0.02, 6, 4).scale(1.4, 0.35, 0.8), LEAF, { at });
    } else {
      b.part(new THREE.SphereGeometry(0.03, 8, 6).scale(1, 0.4, 1), i === 0 ? PINK : YELLOW, { at });
    }
  });

  // Songbird: a teal back and a coral breast on a spine that rides the head, with folded wings, a fan tail and two legs gripping the head.
  const birdSpine = b.chain(
    "birdSpine",
    catmull([
      [0, 0.7, 0.44],
      [0, 0.72, 0.51],
      [0, 0.78, 0.58],
      [0, 0.85, 0.64],
    ]),
    { parent: head, names: ["birdRump", "birdBack", "birdChest"], role: "spine" },
  );
  const birdHead = b.joint("birdHead", { parent: birdSpine.joints[2], at: [0, 0.85, 0.64], dir: [0, -0.1, 1], role: "head" });
  const birdBodySweep = b.sweep(birdSpine, [0.02, 0.05, 0.056, 0.04], { color: birdBody });
  b.cards(b.surface(birdBodySweep).scatter(90, { rng: rng(8), minDist: 0.013, filter: (h) => h.at.y < 0.84 }), TUFT, {
    size: [0.013, 0.026],
    lean: 25,
    bend: 15,
    vary: 0.2,
    rng: rng(9),
    color: birdBody,
  });
  b.part(new THREE.SphereGeometry(0.046, 12, 9), TEAL, { bone: birdHead, at: [0, 0.85, 0.64] });
  for (const x of [-0.012, 0, 0.012]) {
    b.spike([x, 0.875, 0.63], [x * 4, 1, -0.6], 0.05 - Math.abs(x) * 0.8, 0.011, { color: TEAL_DARK, bone: birdHead });
  }
  b.spike([0, 0.845, 0.67], [0, -0.2, 1], 0.04, 0.014, { color: YELLOW, bone: birdHead });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 8, 6), INK, {
      bone: birdHead,
      at: birdHead.local({ left: s * 0.021, up: 0.008, forward: 0.036 }),
    });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), WHITE, {
      bone: birdHead,
      at: birdHead.local({ left: s * 0.024, up: 0.012, forward: 0.044 }),
    });
  }
  for (const s of [1, -1]) {
    const wing = b.joint(s > 0 ? "birdWingL" : "birdWingR", {
      parent: birdSpine.joints[1],
      at: [s * 0.03, 0.74, 0.53],
      dir: [0, -0.35, -1],
      role: "wing",
    });
    b.extrude(WING, {
      at: [s * 0.036, 0.74, 0.53],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: birdWingPaint,
      bone: wing,
    });
  }
  const birdTail = b.joint("birdTail", { parent: birdSpine.joints[0], at: [0, 0.7, 0.44], dir: [0, 0.2, -1], role: "tail" });
  b.extrude(TAIL, { at: [0, 0.7, 0.44], thickness: 0.01, bevel: 0.003, smoothing: 1, color: birdTailPaint, bone: birdTail });

  // Bird feet stand on the head surface: each ankle and toe is the first hit straight down.
  const surfaceY = (x: number, z: number) => {
    const hit = headSurf.ray([x, 1, z], [0, -1, 0]);
    if (!hit) throw new Error(`no head surface under (${x}, ${z})`);
    return hit.at.y;
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.022;
    const legBird = b.chain(
      `birdLeg${side}`,
      catmull([
        [x, 0.7, 0.48],
        [x, 0.66, 0.51],
        [x, surfaceY(x, 0.55) + 0.004, 0.55],
        [x, surfaceY(x, 0.61) + 0.004, 0.61],
      ]),
      { parent: birdSpine.joints[1], names: [`birdHip${side}`, `birdKnee${side}`, `birdAnkle${side}`, `birdFoot${side}`], role: "leg" },
    );
    b.sweep(legBird, [0.009, 0.007, 0.006, 0.006], { color: BEAK_LEG, sides: 6 });
  }

  // Meadow: grass clumps beside the body, with pink blossoms on stems among them.
  const rg = rng(21);
  const tufts = Array.from({ length: 16 }, (_, i) => {
    const x = (i % 2 ? 1 : -1) * (0.28 + rg() * 0.22);
    const z = -0.45 + rg() * 0.9;
    return frame([x, 0, z], [0, 1, 0]);
  });
  b.cards(tufts, BLADES, { size: [0.06, 0.14], lean: 8, bend: 12, vary: 0.3, rng: rng(22), color: GRASS, bone: hips });
  const blossoms = Array.from({ length: 6 }, (_, i) => {
    const x = (i % 2 ? -1 : 1) * (0.36 + rg() * 0.2);
    const z = -0.4 + rg() * 0.8;
    return frame([x, 0, z], [0, 1, 0]);
  });
  b.cards(blossoms, BLOSSOM, { size: [0.05, 0.11], lean: 0, bend: 6, vary: 0.2, rng: rng(23), color: PINK, bone: hips });

  return b.root;
}

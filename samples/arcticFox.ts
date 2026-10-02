import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { countershade, gradient, mottle, stripes } from "../src/paint";
import { svg } from "../src/texture";

const IVORY = "#f7f5ee";
const SNOW = "#ffffff";
const ICE = "#b9cde0";
const SHADOW = "#849ab4";
const INK = "#26364a";
const NOSE = "#182333";
const ROSE = "#e99aa9";
const BERRY = "#8e4c75";
const PLUM = "#563b69";
const PAW = "#6b506e";
const EYE = "#1f3147";
const CATCH = "#fff9dc";
const COAT = countershade(mottle(IVORY, ICE, { size: 0.14, contrast: 0.52, seed: 19 }), SHADOW, {
  level: -0.16,
  soft: 0.35,
});
const TAIL_COAT = gradient(COAT, SNOW, [0, 0.35, -0.1], [0, 0.68, -0.78]);
const SCARF = stripes(BERRY, PLUM, { size: 0.075, axis: "y", width: 0.32, wobble: 0.12, seed: 4 });
const TUFT = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 62 L5 16 L12 25 L16 2 L20 25 L28 15 L30 62 Z" fill="white"/>
    <path d="M7 59 L10 31 M25 59 L22 31" stroke="#bdd0e1" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

export const meta = {
  name: "Arctic Fox in Winter Coat",
  description: "A plush, bright-eyed arctic fox with a cloud tail, tiny toes, and a berry-striped winter scarf.",
  style: "whimsical",
  commit: "07503e3",
};

export default function build() {
  const b = createBuilder({ name: "arcticFox", detail: 1.05, paintSize: 1024 });

  const hips = b.joint("hips", { at: [0, 0.43, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      hips.at,
      [0, 0.46, -0.08],
      [0, 0.5, 0.1],
      [0, 0.56, 0.28],
      [0, 0.64, 0.4],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "chest", "shoulder", "neckBase"],
      role: "spine",
    },
  );
  const torso = b.sweep(spine, (t) => 0.205 - 0.055 * t, {
    color: COAT,
    shift: (t) => [0, -0.02 + 0.008 * t],
    section: { ngon: 8 },
    caps: "round",
    name: "winterCoat",
    group: "body",
  });

  const head = b.joint("head", {
    parent: spine.joints[4],
    at: [0, 0.69, 0.48],
    dir: [0, -0.04, 1],
    role: "head",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(1, 14, 10), COAT, {
    bone: head,
    at: head.at,
    scale: [0.17, 0.16, 0.18],
    name: "roundedHead",
    group: "head",
  });

  b.sweep(
    catmull([
      [0, 0.68, 0.56],
      [0, 0.67, 0.7],
      [0, 0.66, 0.8],
    ]),
    [0.105, 0.06],
    { bone: head, color: SNOW, section: { ngon: 8 }, caps: "round", name: "muzzle", group: "face" },
  );
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.075 }),
    aim: head.local({ forward: 0.32, down: 0.105 }),
    role: "jaw",
    group: "face",
  });
  b.sweep(
    bezier(jaw.at, [0, 0.61, 0.73], [0, 0.61, 0.8], [0, 0.625, 0.84]),
    [0.058, 0.018],
    { bone: jaw, color: SNOW, section: { ngon: 8 }, caps: "round", name: "lowerJaw", group: "face" },
  );
  b.sweep(
    bezier([0, 0.625, 0.812], [0, 0.622, 0.828], [0, 0.62, 0.837]),
    [0.012, 0],
    { bone: jaw, color: INK, caps: "point", name: "mouthLine", group: "face" },
  );
  b.part(new THREE.SphereGeometry(1, 10, 7), NOSE, {
    bone: head,
    at: [0, 0.655, 0.838],
    scale: [0.035, 0.027, 0.03],
    name: "softNose",
    group: "face",
  });

  for (const s of [-1, 1]) {
    const ear = b.joint(`ear${s < 0 ? "R" : "L"}`, {
      parent: head,
      at: head.local([s * 0.105, 0.01, 0.12]),
      dir: [s * 0.12, 0.08, 0.18],
      role: "hinge",
      group: "ears",
    });
    b.extrude(
      [
        [-0.072, 0, "sharp"],
        [0.07, 0, "sharp"],
        [0.022, 0.2, "sharp"],
      ],
      {
        at: ear.at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: COAT,
        bone: ear,
        name: `earOuter${s < 0 ? "R" : "L"}`,
        group: "ears",
      },
    );
    b.extrude(
      [
        [-0.04, 0.018, "sharp"],
        [0.04, 0.018, "sharp"],
        [0.018, 0.145, "sharp"],
      ],
      {
        at: ear.at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.039,
        bevel: 0.004,
        color: ROSE,
        bone: ear,
        name: `earInner${s < 0 ? "R" : "L"}`,
        group: "ears",
      },
    );
  }

  for (const s of [-1, 1]) {
    const eyeAt = head.local([s * 0.095, 0.115, 0.055]);
    b.part(new THREE.SphereGeometry(1, 10, 7), EYE, {
      bone: head,
      at: eyeAt,
      scale: [0.031, 0.026, 0.032],
      name: `eye${s < 0 ? "R" : "L"}`,
      group: "face",
    });
    b.part(new THREE.SphereGeometry(1, 7, 5), CATCH, {
      bone: head,
      at: head.local([s * 0.098, 0.139, 0.072]),
      scale: [0.008, 0.006, 0.009],
      name: `eyeGlint${s < 0 ? "R" : "L"}`,
      group: "face",
    });
    const cheek = head.local([s * 0.135, 0.055, -0.005]);
    for (let i = 0; i < 3; i++) {
      b.spike(
        cheek,
        head.local([s * (0.16 + i * 0.012), -0.02 + i * 0.035, -0.02 - i * 0.016]),
        null,
        0.027 - i * 0.004,
        { bone: head, color: SNOW, caps: "point", name: `cheekTuft${s < 0 ? "R" : "L"}${i}`, group: "face" },
      );
    }
  }

  const bodySurface = b.surface(torso);
  const tuftHits = bodySurface.scatter(42, {
    rng: rng(31),
    minDist: 0.05,
    filter: (h) => h.n.y > -0.05 && h.at.z < 0.34,
  });
  b.cards(tuftHits, TUFT, {
    size: [0.028, 0.075],
    lean: 62,
    bend: 22,
    vary: 0.3,
    rng: rng(32),
    color: COAT,
    group: "softFur",
  });
  const ruffHits = bodySurface.scatter(18, {
    rng: rng(33),
    minDist: 0.045,
    filter: (h) => h.at.z > 0.2 && h.n.y > -0.45,
  });
  b.cards(ruffHits, TUFT, {
    size: [0.032, 0.082],
    lean: 55,
    bend: 18,
    vary: 0.24,
    rng: rng(34),
    color: SNOW,
    group: "neckRuff",
  });

  const tail = b.chain(
    "tail",
    catmull([
      hips.at,
      [0, 0.39, -0.4],
      [0, 0.45, -0.62],
      [0, 0.56, -0.8],
      [0, 0.65, -0.9],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tailMid", "tailLift", "tailTip"],
      role: "tail",
    },
  );
  const tailTube = b.sweep(tail, (t) => 0.135 - 0.11 * t, {
    color: TAIL_COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "plumeTail",
    group: "tail",
  });
  const tailFur = b.surface(tailTube).scatter(34, {
    rng: rng(41),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.15,
  });
  b.cards(tailFur, TUFT, {
    size: [0.03, 0.095],
    lean: 68,
    bend: 30,
    vary: 0.28,
    rng: rng(42),
    color: TAIL_COAT,
    group: "tailFur",
  });

  const legData = [
    { side: -1, name: "frontR", root: [-0.13, 0.49, 0.27] as [number, number, number], foot: [-0.15, 0.048, 0.32] as [number, number, number], bend: [0, 0, 1] as [number, number, number] },
    { side: 1, name: "frontL", root: [0.13, 0.49, 0.27] as [number, number, number], foot: [0.15, 0.048, 0.32] as [number, number, number], bend: [0, 0, 1] as [number, number, number] },
    { side: -1, name: "hindR", root: [-0.14, 0.43, -0.18] as [number, number, number], foot: [-0.17, 0.048, -0.3] as [number, number, number], bend: [0, 0, -1] as [number, number, number] },
    { side: 1, name: "hindL", root: [0.14, 0.43, -0.18] as [number, number, number], foot: [0.17, 0.048, -0.3] as [number, number, number], bend: [0, 0, -1] as [number, number, number] },
  ];
  for (const leg of legData) {
    const points = [
      leg.root,
      [leg.root[0] * 1.08, 0.28, leg.root[2] + (leg.name.startsWith("front") ? 0.035 : -0.08)] as [number, number, number],
      [leg.foot[0] * 0.96, 0.13, leg.foot[2] + (leg.name.startsWith("front") ? -0.015 : 0.04)] as [number, number, number],
      leg.foot,
    ];
    const chain = b.chain(leg.name, points, {
      parent: leg.name.startsWith("front") ? spine.joints[2] : hips,
      names: [`${leg.name}Hip`, `${leg.name}Knee`, `${leg.name}Ankle`, `${leg.name}Paw`],
      role: "leg",
      contact: leg.foot,
    });
    b.sweep(chain, (t) => 0.072 - 0.026 * t, {
      color: COAT,
      section: { ngon: 6 },
      skin: "smooth",
      caps: "round",
      group: "legs",
      name: `${leg.name}FurLeg`,
    });
    const pawJoint = chain.tip;
    if (!pawJoint) continue;
    b.part(new THREE.SphereGeometry(1, 10, 7), SNOW, {
      bone: pawJoint,
      at: pawJoint.at,
      scale: [0.09, 0.048, 0.11],
      name: `${leg.name}Paw`,
      group: "paws",
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), PAW, {
      bone: pawJoint,
      at: pawJoint.local([0, -0.035, 0.055]),
      scale: [0.045, 0.012, 0.052],
      name: `${leg.name}Pad`,
      group: "paws",
    });
    for (let toe = -1; toe <= 1; toe++) {
      const toeRoot = pawJoint.at;
      const toeTip = [toeRoot.x + toe * 0.032, 0.045, toeRoot.z + 0.06] as [number, number, number];
      const toeChain = b.chain(`${leg.name}Toe${toe + 2}`, [toeRoot, toeTip], {
        parent: pawJoint,
        names: [`${leg.name}Toe${toe + 2}`],
        role: "digit",
      });
      b.sweep(toeChain, [0.016, 0.005], {
        color: PAW,
        section: { ngon: 6 },
        caps: "round",
        group: "digits",
      });
    }
  }

  const collar = catmull(
    [
      [0.13, 0.6, 0.4],
      [0.1, 0.69, 0.43],
      [-0.1, 0.69, 0.43],
      [-0.13, 0.6, 0.4],
    ],
    { closed: true },
  );
  b.sweep(collar, 0.028, { color: SCARF, bone: spine.joints[4], group: "scarf", name: "scarfCollar" });
  b.sweep(
    catmull([
      [0.065, 0.62, 0.52],
      [0.075, 0.5, 0.5],
      [0.055, 0.34, 0.48],
    ]),
    [0.038, 0.023],
    { color: SCARF, bone: spine.joints[4], section: { ngon: 6 }, caps: "round", group: "scarf", name: "scarfTailA" },
  );
  b.sweep(
    catmull([
      [-0.035, 0.62, 0.52],
      [-0.06, 0.51, 0.48],
      [-0.045, 0.37, 0.45],
    ]),
    [0.038, 0.023],
    { color: SCARF, bone: spine.joints[4], section: { ngon: 6 }, caps: "round", group: "scarf", name: "scarfTailB" },
  );
  for (const s of [-1, 1]) {
    b.sweep(
      bezier([s * 0.07, 0.35, 0.48], [s * 0.09, 0.31, 0.49], [s * 0.08, 0.285, 0.49]),
      [0.009, 0.002],
      { color: CATCH, bone: spine.joints[4], caps: "point", group: "scarf", name: `scarfFringe${s < 0 ? "R" : "L"}` },
    );
  }

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.rod(
        [s * 0.02, 0.65, 0.835],
        [s * (0.16 + i * 0.025), 0.64 + i * 0.02, 0.8 - i * 0.045],
        0.0035,
        { color: SNOW, bone: head, group: "whiskers", name: `whisker${s < 0 ? "R" : "L"}${i}` },
      );
    }
  }

  b.decal(torso, svg(`<svg viewBox="0 0 64 64"><path d="M32 3 L61 29 L45 28 L53 61 L32 48 L11 61 L19 28 L3 29 Z" fill="white" opacity=".9"/></svg>`, { size: 128 }), {
    at: [0, 0.55, 0.275],
    dir: [0, 0.2, 1],
    size: [0.2, 0.22],
    lift: 0.004,
    color: SNOW,
    segments: 5,
    bone: spine.joints[2],
    name: "snowflakeChest",
    group: "markings",
  });

  return b.root;
}

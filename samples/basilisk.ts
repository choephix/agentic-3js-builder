import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull } from "../src/path";
import { cellPaint, pixelArt, snapColor } from "../kits/pixel";

const TEXEL = 0.018;

const PALE_GREEN = snapColor("#92b642", 32);
const GREEN = snapColor("#4d7628", 32);
const DEEP_GREEN = snapColor("#263d1d", 32);
const BELLY = snapColor("#bdc66a", 32);
const GOLD = snapColor("#d3a53f", 32);
const GOLD_DARK = snapColor("#71511e", 32);
const BONE = snapColor("#e1d39a", 32);
const CLAW = snapColor("#f0e2b1", 32);
const EYE_GOLD = snapColor("#e6bb37", 32);
const INK = snapColor("#090b0b", 32);
const MOUTH = snapColor("#351722", 32);
const TONGUE = snapColor("#d25c63", 32);

const SKIN = cellPaint(TEXEL, (c) => {
  const belly = c.n.y < -0.25 || (c.axis === 1 && c.v % 7 < 3);
  const shade = 0.36 + 0.2 * c.n.y + 0.16 * (c.random(7) - 0.5);
  if (c.random(19) < 0.028) return DEEP_GREEN;
  if (belly) return c.pick([GOLD_DARK, BELLY, PALE_GREEN], 0.3 + shade * 0.5);
  return c.pick([DEEP_GREEN, GREEN, PALE_GREEN], 0.33 + shade * 0.65);
}, { dither: true });

const HORN = cellPaint(TEXEL * 0.8, (c) => c.pick([GOLD_DARK, GOLD, BONE], 0.35 + c.n.y * 0.35));
const METAL = cellPaint(TEXEL, (c) => c.pick([GOLD_DARK, GOLD, BONE], 0.3 + c.n.y * 0.45));

const EYE = pixelArt(
  [
    "kkkkkkkk",
    "kggggggk",
    "kgwwwwgk",
    "kgwyywgk",
    "kgwykwgk",
    "kgwyywgk",
    "kggggggk",
    "kkkkkkkk",
  ],
  { k: INK, g: GOLD_DARK, w: EYE_GOLD, y: "#fff3a4" },
);

const SCALE_MARK = pixelArt(
  [
    "..dd..dd..",
    ".dd..dd...",
    "dd..dd..dd",
    ".dd..dd...",
  ],
  { d: GOLD_DARK },
);

export const meta = {
  name: "Basilisk",
  description: "A pixel-art basilisk: an eight-legged serpent lizard king with a crown of horns, a jeweled gaze, and a forked tongue.",
  style: "pixel art",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "basilisk", detail: 1, paintSize: 2048 });

  // Skeleton first: a long low spine, a separately hinged jaw, a tapering tail, and four pairs of legs.
  const pelvis = b.joint("pelvis", { at: [0, 0.76, -0.62], role: "spine" });
  const spinePath = catmull([
    [0, 0.76, -0.62],
    [0, 0.79, -0.18],
    [0, 0.83, 0.28],
    [0, 0.94, 0.68],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spine1", "spine2", "shoulder", "neckBase"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip!,
    at: [0, 1.05, 0.86],
    dir: [0, 0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.15, -0.11]),
    dir: [0, 0.96, -0.22],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain("tail", catmull([
    [0, 0.76, -0.62],
    [0.08, 0.68, -1.06],
    [-0.08, 0.56, -1.52],
    [0.02, 0.39, -1.92],
    [0.18, 0.22, -2.24],
  ]), {
    parent: pelvis,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legs = [];
  const rows = [-0.38, -0.08, 0.22, 0.46];
  for (let row = 0; row < rows.length; row += 1) {
    const z = rows[row];
    const parent = spine.joints[Math.min(spine.joints.length - 1, row)];
    for (const side of [1, -1]) {
      const suffix = side === 1 ? "R" : "L";
      const bend = side * (row % 2 === 0 ? 0.06 : -0.05);
      const leg = b.chain(`leg${suffix}${row + 1}`, catmull([
        [side * 0.27, 0.76 + row * 0.025, z],
        [side * 0.43, 0.50, z + bend],
        [side * 0.58, 0.20, z + bend * 1.3],
        [side * 0.64, 0.06, z + bend * 1.45 + (row - 1.5) * 0.025],
      ]), {
        parent,
        names: [`hip${suffix}${row + 1}`, `knee${suffix}${row + 1}`, `ankle${suffix}${row + 1}`, `foot${suffix}${row + 1}`],
        role: "leg",
      });
      legs.push({ side, row, chain: leg });
    }
  }

  // Primary body volumes use very low-sided sweeps: silhouettes stay chunky while the cell paint supplies pixel texture.
  const body = b.sweep(spine, (t) => 0.31 - 0.07 * t, {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "body",
    group: "body",
    sectors: [[125, 235, BELLY]],
  });
  const tailTube = b.sweep(tail, (t) => 0.22 * (1 - t) + 0.025, {
    color: SKIN,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "tail",
    group: "tail",
    sectors: [[125, 235, BELLY]],
  });

  for (const { side, row, chain } of legs) {
    b.sweep(chain, [0.11, 0.058], {
      color: SKIN,
      section: { ngon: 5 },
      caps: "round",
      name: `leg${side === 1 ? "R" : "L"}${row + 1}`,
      group: "legs",
      sectors: [[110, 250, BELLY]],
    });

    const foot = chain.tip!;
    // Three splayed digits per foot give the silhouette its unmistakable eight-legged read.
    for (let digit = -1; digit <= 1; digit += 1) {
      const toeName = `toe${side === 1 ? "R" : "L"}${row + 1}${digit + 2}`;
      const toeChain = b.chain(toeName, [
        foot.at,
        [foot.at.x + side * 0.095, 0.048, foot.at.z + digit * 0.055],
      ], {
        parent: foot,
        names: [toeName, `${toeName}Tip`],
        role: "digit",
      });
      b.sweep(toeChain, [0.032, 0], {
        color: SKIN,
        section: { ngon: 4 },
        caps: "point",
        name: `${toeName}Tube`,
        group: "digits",
      });
      b.spike(toeChain.tip!, toeChain.tip!, 0.045, 0.012, {
        color: CLAW,
        name: `${toeName}Claw`,
        group: "digits",
      });
      // A tiny gold scale at each ankle breaks up the long green legs.
      b.part(new THREE.BoxGeometry(0.09, 0.055, 0.035), METAL, {
        bone: chain.joints[Math.min(1, chain.joints.length - 1)],
        at: chain.joints[Math.min(1, chain.joints.length - 1)].local([0, 0, 0]),
        rotation: [0, 0, side * 18],
        name: `ankleBand${side === 1 ? "R" : "L"}${row + 1}`,
        group: "ornament",
      });
    }
  }

  // Head and snout are deliberately boxy, with painted planes for eyes and cheek scales.
  b.part(new THREE.BoxGeometry(0.52, 0.38, 0.48), SKIN, {
    bone: head,
    at: head.local([0, 0.10, 0.01]),
    flat: true,
    name: "skull",
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.40, 0.20, 0.34), SKIN, {
    bone: head,
    at: head.local([0, 0.33, -0.03]),
    flat: true,
    name: "upperSnout",
    group: "head",
  });
  b.part(new THREE.BoxGeometry(0.39, 0.13, 0.31), MOUTH, {
    bone: jaw,
    at: jaw.local([0, 0.16, 0.01]),
    flat: true,
    name: "lowerMouth",
    group: "jaw",
  });

  for (const side of [1, -1]) {
    const eyeAt = head.local([side * 0.19, 0.36, 0.13]);
    b.part(new THREE.BoxGeometry(0.115, 0.10, 0.018), "#ffffff", {
      bone: head,
      texture: EYE,
      at: eyeAt,
      dir: [0, 0, 1],
      axis: "z",
      name: `eye${side === 1 ? "R" : "L"}`,
      group: "face",
    });
    const cheekAt = head.local([side * 0.27, 0.30, -0.03]);
    b.part(new THREE.BoxGeometry(0.13, 0.11, 0.012), "#ffffff", {
      bone: head,
      texture: SCALE_MARK,
      at: cheekAt,
      dir: [side, 0, 0],
      axis: "z",
      name: `cheek${side === 1 ? "R" : "L"}`,
      group: "face",
    });
    // Crown horns flare sideways and backward from the skull.
    const hornRoot = head.moved([side * 0.16, 0.02, 0.18]);
    b.spike(hornRoot, [side * 0.62, -0.04, 0.75], 0.28, 0.055, {
      color: HORN,
      name: `crownHorn${side === 1 ? "R" : "L"}A`,
      group: "crown",
    });
    b.spike(head.moved([side * 0.11, -0.03, 0.22]), [side * 0.26, 0.02, 0.95], 0.25, 0.043, {
      color: HORN,
      name: `crownHorn${side === 1 ? "R" : "L"}B`,
      group: "crown",
    });

    // Two nostril pixels and four jaw teeth keep the face readable at thumbnail scale.
    b.part(new THREE.BoxGeometry(0.026, 0.022, 0.014), INK, {
      bone: head,
      at: head.local([side * 0.10, 0.46, 0.015]),
      dir: [0, 0, 1],
      axis: "z",
      name: `nostril${side === 1 ? "R" : "L"}`,
      group: "face",
    });
    for (const toothZ of [0.09, 0.20]) {
      b.spike(jaw.moved([side * (0.10 + (toothZ - 0.09) * 0.2), toothZ, 0.07]), [0, 0, -1], 0.07, 0.014, {
        color: CLAW,
        name: `tooth${side === 1 ? "R" : "L"}${toothZ}`,
        group: "jaw",
      });
    }
  }

  // A pixelated royal crest rides the back from pelvis to the neck.
  const crest = body.line(0);
  b.along(crest, 9, (at) => b.spike(at, at, 0.10 + 0.06 * (1 - at.t), 0.035, {
    color: HORN,
    name: `backSpine${Math.round(at.t * 100)}`,
    group: "crest",
  }));
  b.along(tailTube.line(0), 7, (at) => b.spike(at, at, 0.08 * (1 - at.t), 0.025, {
    color: HORN,
    name: `tailSpine${Math.round(at.t * 100)}`,
    group: "crest",
  }));

  // Forked tongue hangs just beyond the opened mouth.
  b.sweep(catmull([
    [0, 1.08, 1.18],
    [0, 1.06, 1.32],
    [0, 1.04, 1.46],
  ]), [0.018, 0.006], {
    bone: jaw,
    color: TONGUE,
    section: { ngon: 4 },
    caps: { start: "round", end: "point" },
    name: "tongue",
    group: "jaw",
  });
  for (const side of [-1, 1]) {
    b.spike([0, 1.04, 1.43], [side, -0.05, 0.08], 0.085, 0.006, {
      bone: jaw,
      color: TONGUE,
      name: `tongueFork${side === 1 ? "R" : "L"}`,
      group: "jaw",
    });
  }

  // A handful of large gold scales are separate pixel-painted plates, so the kingly motif reads from the side.
  for (const side of [1, -1]) {
    for (let i = 0; i < 5; i += 1) {
      const z = -0.42 + i * 0.22;
      b.part(new THREE.BoxGeometry(0.035, 0.14, 0.13), METAL, {
        bone: spine.joints[Math.min(spine.joints.length - 1, Math.floor(i / 2))],
        at: [side * (0.285 + 0.015 * (i % 2)), 0.76 + 0.015 * i, z],
        rotation: [0, side * 12, side * 8],
        name: `royalScale${side === 1 ? "R" : "L"}${i}`,
        group: "ornament",
      });
    }
  }

  return b.root;
}

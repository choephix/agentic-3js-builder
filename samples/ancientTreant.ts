import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";
import { rng } from "../src/math";
import { grain, mottle, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

const BARK_DARK = "#241711";
const BARK = "#513323";
const BARK_MID = "#70462b";
const BARK_LIGHT = "#a36b3d";
const HEART = "#b97a45";
const MOSS = "#3f5929";
const MOSS_LIGHT = "#7d9f3e";
const GOLD = "#b8893a";
const GOLD_LIGHT = "#e0bd64";
const EYE = "#ffb52f";
const SHADOW = "#160d09";

const bark = grain(mottle(BARK, BARK_MID, { size: 0.34, contrast: 0.7, seed: 19 }), BARK_LIGHT, {
  size: 0.11,
  axis: [0, 1, 0],
  seed: 7,
});
const branchBark = grain(mottle(BARK_DARK, BARK, { size: 0.24, contrast: 0.65, seed: 31 }), BARK_LIGHT, {
  size: 0.1,
  axis: [0, 1, 0],
  seed: 12,
});
const rootBark = grain(mottle(BARK_DARK, BARK_MID, { size: 0.28, contrast: 0.8, seed: 44 }), HEART, {
  size: 0.14,
  axis: [0, 1, 0],
  seed: 18,
});
const goldPatina = paint((_p, n, s) => (n.y > 0.45 && s[0] > 0.35 ? GOLD_LIGHT : GOLD));

const mossTexture = svg(
  `<svg viewBox="0 0 64 128">
    <path d="M32 128C16 105 14 85 20 66C23 55 17 39 25 27C31 18 39 14 43 4C52 22 45 39 51 51C58 66 52 91 39 109Z" fill="#7d9f3e"/>
    <path d="M32 126C31 97 33 66 39 30" stroke="#cad76f" stroke-width="5" fill="none"/>
    <path d="M31 86L18 69M34 73L49 57M32 101L47 84" stroke="#52712e" stroke-width="4" fill="none"/>
  </svg>`,
  { size: 128 },
);
const runeTexture = svg(
  `<svg viewBox="0 0 128 180">
    <path d="M64 8L74 54L108 32L86 72L119 93L80 101L98 151L64 123L30 151L48 101L9 93L42 72L20 32L54 54Z" fill="none" stroke="#66d66a" stroke-width="9" stroke-linejoin="round"/>
    <circle cx="64" cy="91" r="14" fill="#b6ff83"/>
  </svg>`,
  { size: 256 },
);

export const meta = {
  name: "Ancient Treant",
  description: "A towering bark-armored tree guardian with root feet, amber eyes, mossy crown and a living rune-heart.",
  style: "Blizzard/Warcraft",
  commit: "e503085",
};

export default function build() {
  const b = createBuilder({ name: "ancientTreant", detail: 1.1, paintSize: 1024 });

  // Skeleton first: a single rooted spine, four root toes, two branch-arms, a jaw and crown fans.
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.38, 0.01],
      [-0.02, 1.92, 0.02],
      [0.02, 2.43, 0.03],
      [0, 2.86, 0.06],
      [0, 3.15, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4", "neck"], role: "spine", count: 5 },
  );
  const head = b.joint("head", { parent: spine.joints[spine.joints.length - 1], at: [0, 3.28, 0.12], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 3.12, 0.29], dir: [0, -0.16, 1], role: "jaw" });

  const legs: Chain[] = [];
  const arms: Chain[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    legs.push(
      b.chain(
        `leg${side}`,
        catmull([
          [s * 0.22, 1.02, 0.02],
          [s * 0.38, 0.71, 0.02],
          [s * 0.52, 0.36, 0.08],
          [s * 0.68, 0.16, 0.18],
        ]),
        { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`], role: "leg", count: 4 },
      ),
    );
    arms.push(
      b.chain(
        `arm${side}`,
        catmull([
          [s * 0.42, 2.48, 0.02],
          [s * 0.78, 2.35, 0.05],
          [s * 1.11, 2.10, 0.1],
          [s * 1.43, 1.86, 0.18],
        ]),
        { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`], role: "arm", count: 4 },
      ),
    );
  }

  const crownBranches = [
    b.chain("crownL", catmull([[0.02, 3.26, 0.04], [0.38, 3.52, 0.05], [0.75, 3.73, 0.02], [0.98, 3.94, 0.1]]), {
      parent: head,
      names: ["crownL1", "crownL2", "crownL3"],
      role: "fan",
      count: 3,
    }),
    b.chain("crownR", catmull([[-0.02, 3.27, 0.04], [-0.37, 3.55, 0.08], [-0.74, 3.75, 0.04], [-0.94, 3.95, 0.12]]), {
      parent: head,
      names: ["crownR1", "crownR2", "crownR3"],
      role: "fan",
      count: 3,
    }),
    b.chain("crownTop", catmull([[0, 3.34, 0.06], [0.05, 3.63, 0.04], [-0.02, 3.9, 0.02], [0.12, 4.16, 0.05]]), {
      parent: head,
      names: ["crownTop1", "crownTop2", "crownTop3"],
      role: "fan",
      count: 3,
    }),
  ];

  // Main carved trunk and all branch tubes.
  const trunk = b.sweep(spine, (t) => 0.39 - t * 0.15, {
    color: bark,
    section: { ngon: 9 },
    caps: "round",
    name: "ancientTrunk",
    group: "trunk",
  });
  for (const [i, leg] of legs.entries()) {
    b.sweep(leg, (t) => 0.2 - t * 0.09, {
      color: rootBark,
      section: { ngon: 7 },
      caps: "round",
      name: `rootLeg${i}`,
      group: "roots",
    });
  }
  for (const [i, arm] of arms.entries()) {
    b.sweep(arm, (t) => 0.145 - t * 0.085, {
      color: branchBark,
      section: { ngon: 7 },
      caps: "round",
      name: `branchArm${i}`,
      group: "arms",
    });
  }
  for (const branch of crownBranches) {
    b.sweep(branch, (t) => 0.12 - t * 0.075, {
      color: branchBark,
      section: { ngon: 7 },
      caps: "round",
      group: "crown",
    });
  }

  const headWood = b.part(new THREE.SphereGeometry(0.46, 12, 9), bark, {
    bone: head,
    at: head.at,
    scale: [1.08, 1.18, 1.05],
    name: "knottedHead",
    group: "head",
  });
  const brow = b.part(new THREE.SphereGeometry(0.46, 10, 7), branchBark, {
    bone: head,
    at: head.local({ forward: 0.04, up: 0.02 }),
    scale: [1.08, 0.72, 0.88],
    name: "browMass",
    group: "head",
  });
  void brow;
  const lowerJaw = b.sweep(
    catmull([
      [0, 3.11, 0.27],
      [0, 3.04, 0.39],
      [0, 3.02, 0.58],
    ]),
    [0.17, 0.055],
    { bone: jaw, color: BARK_DARK, section: { ngon: 7 }, caps: "round", name: "lowerJaw", group: "face" },
  );
  const mouthGap = b.sweep(
    [head.local({ forward: 0.25, down: 0.1 }), head.local({ forward: 0.49, down: 0.12 })],
    0.018,
    { bone: jaw, color: SHADOW, section: { ngon: 6 }, caps: "flat", name: "mouthGap", group: "face" },
  );
  void lowerJaw;
  void mouthGap;

  // Root toes and hand digits make the stance read as a living tree rather than a statue.
  for (const [i, leg] of legs.entries()) {
    const s = i === 0 ? 1 : -1;
    const foot = leg.joints[leg.joints.length - 1];
    for (let j = 0; j < 3; j++) {
      const spread = (j - 1) * 0.14;
      const toeName = `toe${s > 0 ? "L" : "R"}${j + 1}`;
      const toe = b.chain(
        toeName,
        catmull([
          [s * (0.72 + j * 0.025), 0.07, 0.22 + spread],
          [s * (0.88 + j * 0.03), 0.01, 0.26 + spread * 1.2],
        ]),
        { parent: foot, names: [`${toeName}Base`, `${toeName}Tip`], role: "digit", count: 2 },
      );
      b.sweep(toe, [0.075, 0.012], { color: rootBark, section: { ngon: 6 }, caps: "round", group: "toes" });
    }
  }
  for (const [i, arm] of arms.entries()) {
    const hand = arm.joints[arm.joints.length - 1];
    const s = i === 0 ? 1 : -1;
    for (let j = 0; j < 3; j++) {
      const digit = b.chain(
        `finger${s > 0 ? "L" : "R"}${j + 1}`,
        catmull([
          hand.at,
          [s * (1.49 + j * 0.025), 1.83 + j * 0.035, 0.23 + (j - 1) * 0.1],
          [s * (1.58 + j * 0.03), 1.77 + j * 0.04, 0.34 + (j - 1) * 0.13],
        ]),
        { parent: hand, names: [`finger${s > 0 ? "L" : "R"}${j + 1}Base`, `finger${s > 0 ? "L" : "R"}${j + 1}Tip`], role: "digit", count: 2 },
      );
      b.sweep(digit, [0.045, 0.009], { color: branchBark, section: { ngon: 6 }, caps: "round", group: "fingers" });
    }
  }

  // Knots, shoulder bark collars, and chunky Warcraft-like carved gold fasteners.
  for (const t of [0.16, 0.31, 0.48, 0.68, 0.84]) {
    const at = spine.at(t);
    b.ring(at, { count: 8, radius: 0.3 - t * 0.06, fromDeg: 0, toDeg: 360 }, (item) => {
      if (item.i % 2 === 0) b.spike(item, item, 0.045, 0.018, { color: BARK_LIGHT, group: "barkKnots" });
    });
  }
  for (const [i, arm] of arms.entries()) {
    const cuff = arm.at(0.68);
    b.ring(cuff, { count: 10, radius: 0.12 }, (item) => {
      b.part(new THREE.SphereGeometry(0.025, 6, 4), goldPatina, { at: item.at, bone: item.bone, group: `wristCuff${i}` });
    });
  }
  for (const [i, leg] of legs.entries()) {
    const ankle = leg.at(0.72);
    b.ring(ankle, { count: 9, radius: 0.1 }, (item) => {
      if (item.i % 2 === 0) b.part(new THREE.SphereGeometry(0.022, 6, 4), GOLD, { at: item.at, bone: item.bone, group: `rootStuds${i}` });
    });
  }

  // Crown leaves and moss cards, concentrated on upper-facing bark so the silhouette stays readable.
  const mossHits = b.surface([trunk, headWood, ...crownBranches.map((branch) => branch.joints)]).scatter(52, {
    rng: rng(2026),
    minDist: 0.08,
    filter: (hit) => hit.n.y > 0.12 || hit.at.z < -0.15,
  });
  b.cards(mossHits, mossTexture, {
    size: [0.07, 0.16],
    lean: 38,
    bend: 18,
    vary: 0.35,
    spin: 35,
    cross: true,
    rng: rng(77),
    color: MOSS_LIGHT,
    group: "mossTufts",
  });

  for (const branch of crownBranches) {
    const tips = [0.65, 0.82, 0.96].map((t) => branch.at(t));
    b.cards(tips, mossTexture, {
      size: [0.11, 0.24],
      lean: 18,
      bend: 22,
      vary: 0.2,
      cross: true,
      rng: rng(500 + tips.length),
      color: MOSS,
      group: "crownLeaves",
    });
  }

  // Face: oversized sockets, amber glowing eyes, and bark tusks.
  for (const s of [1, -1]) {
    const socket = b.part(new THREE.SphereGeometry(0.12, 8, 6), SHADOW, {
      bone: head,
      at: head.local({ left: s * 0.18, forward: 0.29, up: 0.07 }),
      scale: [1.1, 0.88, 0.7],
      name: `eyeSocket${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    const eye = b.part(new THREE.SphereGeometry(0.073, 10, 8), EYE, {
      bone: head,
      at: head.local({ left: s * 0.18, forward: 0.355, up: 0.07 }),
      name: `amberEye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    glow(eye, 2.2);
    b.part(new THREE.SphereGeometry(0.027, 8, 6), SHADOW, {
      bone: head,
      at: head.local({ left: s * 0.185, forward: 0.416, up: 0.075 }),
      name: `eyePupil${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    const tusk = b.spike(
      head.local({ left: s * 0.19, forward: 0.43, down: 0.03 }),
      [0, -1, 0.15],
      0.18,
      0.045,
      { bone: head, color: HEART, group: "tusks" },
    );
    void socket;
    void tusk;
  }

  // A glowing heart-rune is carved into the front of the trunk.
  const rune = b.decal(trunk, runeTexture, {
    at: [0, 1.92, 0.315],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.26, 0.37],
    lift: 0.012,
    segments: 8,
    name: "heartRune",
    group: "magic",
  });
  glow(rune, 1.7);

  // Broad moss plates sit in the deep bark furrows, while gold chips sell the hand-painted trim.
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.16, 0.34, 7), MOSS, {
      bone: spine.joints[1],
      at: [s * 0.22, 1.65, -0.18],
      dir: [s * 0.4, 0.35, -1],
      name: `mossShoulder${s > 0 ? "L" : "R"}`,
      group: "mossArmor",
    });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.25, 0.12, 8), goldPatina, {
      bone: spine.joints[2],
      at: [s * 0.45, 2.48, 0.02],
      rotation: [0, 0, s * 18],
      name: `shoulderPlate${s > 0 ? "L" : "R"}`,
      group: "trim",
    });
    b.spike(
      head.local({ left: s * 0.2, forward: 0.25, up: 0.18 }),
      [0, 0.55, 0.16],
      0.16,
      0.045,
      { bone: head, color: BARK_LIGHT, group: "browRidges" },
    );
  }
  for (const t of [0.28, 0.55, 0.78]) {
    const p = spine.at(t).moved([0, 0.02, 0.26]);
    b.part(new THREE.BoxGeometry(0.11, 0.05, 0.025), goldPatina, {
      bone: p.bone,
      at: p.at,
      dir: [0, 0, 1],
      name: `trunkPlate${Math.round(t * 100)}`,
      group: "trim",
    });
  }

  return b.root;
}

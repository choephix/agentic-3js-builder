import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { cellPaint, pixelArt, stepped } from "../kits/pixel";
import { catmull, polyline } from "../src/path";

export const meta = {
  name: "NES Goblin Shaman",
  description:
    "A hunched 8-bit goblin shaman with a patched robe, bone-and-feather headdress, bead charms, snaggle teeth, and a skull-topped crooked staff.",
  builtBy: "GPT-6 Astra",
};

const TEXEL = 0.02;
const INK = "#171322";
const SKIN_DARK = "#37513b";
const SKIN = "#5d7d4a";
const SKIN_LIGHT = "#9aaa5c";
const ROBE_DARK = "#3f294e";
const ROBE = "#674067";
const ROBE_LIGHT = "#96714d";
const BONE_DARK = "#927e55";
const BONE = "#d8c58b";
const FEATHER = "#3a6381";
const FEATHER_LIGHT = "#6da0a0";
const WOOD_DARK = "#3b241b";
const WOOD = "#785137";
const GEM = "#d36d49";
const GEM_LIGHT = "#f1b05e";
const BEAD_RED = "#b84843";
const BEAD_BLUE = "#4d7391";
const BEAD_GOLD = "#c49a54";

const skinPaint = cellPaint(TEXEL, (c) => (c.n.y > 0.45 ? SKIN_LIGHT : c.n.y < -0.35 ? SKIN_DARK : SKIN));
const skinShadowPaint = cellPaint(TEXEL, (c) => (c.n.y > 0.35 ? SKIN : SKIN_DARK));
const robePaint = cellPaint(TEXEL, (c) => (c.n.y > 0.45 ? ROBE_LIGHT : c.n.y < -0.2 ? ROBE_DARK : ROBE));
const robePatchPaint = cellPaint(TEXEL, (c) => (c.u + c.v) % 3 === 0 ? ROBE_LIGHT : ROBE_DARK);
const bonePaint = cellPaint(TEXEL, (c) => (c.n.y > 0.25 ? BONE : BONE_DARK));
const skullPaint = cellPaint(TEXEL, (c) => (c.n.z > -0.25 || c.n.y > 0.35 ? BONE : BONE_DARK));
const woodPaint = cellPaint(TEXEL, (c) => (c.n.y > 0.5 ? WOOD : WOOD_DARK));
const gemPaint = cellPaint(TEXEL, (c) => (c.n.y > 0.25 ? GEM_LIGHT : GEM));

const PATCH = pixelArt(
  [
    "rrr..rrr",
    "rbbrrbbr",
    "rbbbbbb r".replace(" ", ""),
    ".brrrrb.",
    "..rrrr..",
    ".brrrrb.",
    "rbbbbbb r".replace(" ", ""),
    "rrr..rrr",
  ],
  { r: ROBE, b: ROBE_LIGHT },
);
const RUNE = pixelArt(
  [
    "........",
    "...gg...",
    "..g..g..",
    ".g....g.",
    ".g....g.",
    "..g..g..",
    "...gg...",
    "........",
  ],
  { g: GEM_LIGHT },
);
const EYE = pixelArt(
  [
    "kkkkkk",
    "kggggk",
    "kg..gk",
    "kg..gk",
    "kggggk",
    "kkkkkk",
  ],
  { k: INK, g: GEM_LIGHT },
);


export default function build() {
  const b = createBuilder({ name: "nesGoblinShaman", detail: 0.72, paintSize: 1024 });

  // Skeleton first: a compact, hunched humanoid in a neutral rest pose.
  const hips = b.joint("hips", { at: [0, 0.56, -0.03], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.56, -0.03],
      [0, 0.67, -0.01],
      [0, 0.77, 0.055],
      [0, 0.84, 0.12],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      chest.at,
      [0, 0.89, 0.145],
      [0, 0.94, 0.17],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck", group: "head" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.94, 0.17],
    dir: [0, -0.1, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, -0.035, 0.055]),
    aim: head.local([0, -0.07, 0.24]),
    role: "jaw",
    group: "head",
  });

  const limbSides = [
    { s: 1, side: "L" },
    { s: -1, side: "R" },
  ] as const;
  for (const { s, side } of limbSides) {
    const legRoot: [number, number, number] = [s * 0.11, 0.55, -0.02];
    const footTarget: [number, number, number] = [s * 0.13, 0.07, 0.09];
    const points = limb(legRoot, footTarget, [0.2, 0.2, 0.14], [[0, 0, 1], [0, 0, -1]], { sole: [0, 0, 1] });
    const leg = b.chain(`leg${side}`, points, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      group: `leg${side}`,
      contact: [s * 0.13, 0, 0.14],
    });
    b.sweep(leg, (t) => [0.07 - 0.028 * t, 0.075 - 0.03 * t], { color: skinShadowPaint, section: "box", group: `leg${side}` });
    b.capsule(leg.joints[2].at, [s * 0.13, 0.065, 0.13], [0.05, 0.035], { bone: leg.joints[2], color: skinPaint, section: "box", group: `leg${side}` });
    for (let ti = -1; ti <= 1; ti++) {
      const toeBase: [number, number, number] = [s * (0.13 + ti * 0.025), 0.055, 0.16];
      b.sweep(polyline([toeBase, [toeBase[0], 0.008, 0.21 + Math.abs(ti) * 0.008]]), [0.018, 0.008], {
        bone: leg.joints[2],
        color: skinPaint,
        section: "box",
        caps: "point",
        group: `leg${side}`,
      });
    }

    const shoulder: [number, number, number] = [s * 0.205, 0.805, 0.105];
    const elbow: [number, number, number] = [s * 0.34, 0.77, 0.13];
    const wrist: [number, number, number] = [s * 0.47, 0.73, 0.15];
    const palm: [number, number, number] = [s * 0.51, 0.72, 0.16];
    const arm = b.chain(`arm${side}`, polyline([shoulder, elbow, wrist, palm]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    b.sweep(arm, (t) => [0.047 - 0.018 * t, 0.052 - 0.02 * t], { color: skinPaint, section: "box", group: `arm${side}` });
    b.part(new THREE.BoxGeometry(0.08, 0.055, 0.07), skinPaint, { at: arm.joints[2].local([0, 0.02, 0]), bone: arm.joints[2], group: `arm${side}` });
    for (let fi = 0; fi < 3; fi++) {
      const fingerStart = arm.joints[2].local([(fi - 1) * 0.022, 0.04, 0.035]);
      b.spike(fingerStart, [s * 0.9, -0.1 + fi * 0.06, 0.45], 0.07, 0.011, {
        bone: arm.joints[2],
        color: skinPaint,
        group: `arm${side}`,
      });
    }
  }

  // The robe is deliberately broad and boxy, with stepped hem and patch panels.
  b.loft(
    [
      { at: [0, 0.51, -0.04], w: 0.28, h: 0.22 },
      { at: [0, 0.63, 0.0], w: 0.33, h: 0.25 },
      { at: [0, 0.75, 0.05], w: 0.31, h: 0.24 },
      { at: [0, 0.83, 0.1], w: 0.26, h: 0.2 },
    ],
    { bone: [hips, spine.joints[0], spine.joints[1], chest], color: robePaint, section: "box", group: "robe" },
  );
  const hem = stepped(
    [[-7, 7], [-8, 8], [-8, 8], [-7, 7], [-6, 6], [-5, 5], [-4, 4]],
    TEXEL,
    { rows: true, start: -0.07 },
  );
  b.extrude(hem, { at: [0, 0.45, 0.01], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, color: robePatchPaint, bone: hips, group: "robe" });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.11, 0.12, 0.012), "#ffffff", {
      texture: PATCH,
      bone: chest,
      at: [s * 0.13, 0.69, 0.205],
      group: "robe",
    });
    b.part(new THREE.BoxGeometry(0.09, 0.09, 0.01), "#ffffff", {
      texture: RUNE,
      bone: chest,
      at: [s * 0.1, 0.78, 0.18],
      group: "robe",
    });
  }

  // Long nose, separate upper skull and open lower jaw.
  b.loft(
    [
      { at: head.local([0, 0.01, -0.04]), w: 0.2, h: 0.18 },
      { at: head.local([0, 0.01, 0.08]), w: 0.18, h: 0.16 },
      { at: head.local([0, -0.005, 0.2]), w: 0.13, h: 0.12 },
    ],
    { bone: head, color: skinPaint, section: "box", group: "head" },
  );
  b.spike(head.local([0, 0.0, 0.12]), head.dir([0, -0.05, 1]), 0.17, 0.042, { bone: head, color: skinPaint, group: "head" });
  b.loft(
    [
      { at: jaw.local([0, -0.01, 0]), w: 0.16, h: 0.07 },
      { at: jaw.local([0, -0.005, 0.1]), w: 0.13, h: 0.055 },
      { at: jaw.local([0, 0.0, 0.22]), w: 0.08, h: 0.04 },
    ],
    { bone: jaw, color: skinShadowPaint, section: "box", group: "head" },
  );
  b.sweep(polyline([jaw.local([0, 0.018, 0.03]), jaw.local([0, 0.018, 0.2])]), 0.022, { bone: jaw, color: INK, section: "box", group: "head" });
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = 0.08 + i * 0.045;
      b.spike(head.local([s * (0.032 + (2 - i) * 0.012), -0.03, z]), [0, -1, 0], 0.028 - i * 0.004, 0.008, {
        bone: head,
        color: bonePaint,
        group: "head",
      });
      b.spike(jaw.local([s * (0.026 + (2 - i) * 0.009), 0.024, z]), [0, 1, 0], 0.022 - i * 0.003, 0.007, {
        bone: jaw,
        color: bonePaint,
        group: "head",
      });
    }
    b.part(new THREE.BoxGeometry(0.034, 0.034, 0.012), "#ffffff", {
      texture: EYE,
      bone: head,
      at: head.local([s * 0.08, 0.055, 0.075]),
      dir: head.dir([s * 0.7, 0.05, 1]),
      axis: "z",
      group: "head",
    });
  }

  // Big stepped ears, bone brow, and a crown of five feather plates.
  const ear = stepped([[0, 3], [0, 5], [1, 6], [2, 7], [3, 6], [4, 5]], TEXEL, { rows: true });
  for (const s of [-1, 1]) {
    b.extrude(ear, {
      at: head.local([s * 0.105, -0.035, 0.015]),
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.022,
      color: skinPaint,
      bone: head,
      group: "head",
    });
    b.sweep(polyline([head.local([s * 0.045, 0.055, 0.1]), head.local([s * 0.105, 0.07, 0.1])]), 0.012, {
      bone: head,
      color: bonePaint,
      section: "box",
      group: "head",
    });
  }
  const feather = stepped([[0, 4], [0, 6], [1, 7], [2, 8], [3, 7], [4, 5], [3, 5]], TEXEL, { rows: true });
  for (let i = -2; i <= 2; i++) {
    b.extrude(feather, {
      at: head.local([i * 0.055, -0.065 - Math.abs(i) * 0.01, 0.12]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      color: i % 2 ? FEATHER : FEATHER_LIGHT,
      bone: head,
      group: "headdress",
    });
  }
  b.sweep(polyline([head.local([-0.13, -0.08, 0.11]), head.local([0.13, -0.08, 0.11])]), 0.014, {
    bone: head,
    color: bonePaint,
    section: "box",
    group: "headdress",
  });

  // Bead necklace and hanging bone charms.
  const necklace = catmull([
    [0, 0.79, 0.19],
    [-0.12, 0.72, 0.19],
    [-0.2, 0.63, 0.16],
    [0, 0.57, 0.18],
    [0.2, 0.63, 0.16],
    [0.12, 0.72, 0.19],
    [0, 0.79, 0.19],
  ]);
  b.sweep(necklace, 0.009, { bone: [hips, spine.joints[0], chest], color: bonePaint, section: "box", group: "jewelry" });
  for (let i = 0; i < 9; i++) {
    const p = necklace.at(i / 8);
    b.part(new THREE.BoxGeometry(0.028, 0.028, 0.028), i % 3 === 0 ? BEAD_RED : i % 3 === 1 ? BEAD_BLUE : BEAD_GOLD, {
      at: p,
      bone: hips,
      group: "jewelry",
    });
  }
  for (const s of [-1, 1]) {
    b.spike([s * 0.09, 0.61, 0.2], [0, -1, 0], 0.1, 0.018, { bone: hips, color: bonePaint, group: "jewelry" });
  }

  // Patched belt, pouches, and a little hanging charm.
  b.sweep(polyline([[-0.18, 0.6, 0.14], [0, 0.57, 0.18], [0.18, 0.6, 0.14]]), 0.018, {
    bone: hips,
    color: woodPaint,
    section: "box",
    group: "gear",
  });
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.08, 0.09, 0.06), robePatchPaint, { bone: hips, at: [s * 0.2, 0.55, 0.14], group: "gear" });
    b.part(new THREE.BoxGeometry(0.06, 0.06, 0.008), "#ffffff", { texture: PATCH, bone: hips, at: [s * 0.2, 0.56, 0.173], group: "gear" });
  }
  b.spike([0, 0.56, 0.19], [0, -1, 0], 0.11, 0.014, { bone: hips, color: bonePaint, group: "gear" });
  b.part(new THREE.BoxGeometry(0.04, 0.04, 0.04), gemPaint, { bone: hips, at: [0, 0.43, 0.19], group: "gear" });

  // Crooked staff in the right hand: a faceted wood crook with a glowing skull idol.
  const staffPath = catmull([
    [-0.5, 0.03, -0.005],
    [-0.48, 0.24, 0.0],
    [-0.47, 0.48, 0.03],
    [-0.45, 0.69, 0.08],
    [-0.48, 0.83, 0.12],
    [-0.41, 0.9, 0.14],
  ]);
  b.sweep(staffPath, [0.027, 0.02], { bone: hips, color: woodPaint, section: { ngon: 5 }, caps: "flat", group: "staff" });
  const skull = [-0.41, 0.9, 0.14] as const;
  b.part(new THREE.BoxGeometry(0.12, 0.1, 0.09), skullPaint, { bone: hips, at: skull, group: "staff" });
  b.part(new THREE.BoxGeometry(0.1, 0.05, 0.08), skullPaint, { bone: hips, at: [-0.41, 0.84, 0.14], group: "staff" });
  b.part(new THREE.BoxGeometry(0.035, 0.07, 0.085), skullPaint, { bone: hips, at: [-0.465, 0.89, 0.14], group: "staff" });
  b.part(new THREE.BoxGeometry(0.035, 0.07, 0.085), skullPaint, { bone: hips, at: [-0.355, 0.89, 0.14], group: "staff" });
  b.spike([-0.41, 0.895, 0.19], [0, 0, 1], 0.035, 0.014, { bone: hips, color: skullPaint, group: "staff" });
  for (const x of [-0.435, -0.385]) {
    b.part(new THREE.BoxGeometry(0.02, 0.028, 0.012), gemPaint, { bone: hips, at: [x, 0.92, 0.19], group: "staff" });
  }
  for (const x of [-0.44, -0.415, -0.39]) {
    b.spike([x, 0.85, 0.17], [0, -1, 0], 0.035, 0.006, { bone: hips, color: bonePaint, group: "staff" });
  }
  for (let i = 0; i < 4; i++) {
    const p = [-0.44 + i * 0.025, 0.76 - i * 0.015, 0.13] as [number, number, number];
    b.part(new THREE.BoxGeometry(0.028, 0.028, 0.028), i % 2 ? BEAD_RED : BEAD_GOLD, { at: new THREE.Vector3(...p), bone: hips, group: "staff" });
  }

  return b.root;
}

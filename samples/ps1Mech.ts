import * as THREE from "three";
import { createBuilder, Builder } from "../src/builder";
import type { Fill, JointRef } from "../src/context";
import { cellPaint, pixelArt } from "../kits/pixel";

export const meta = {
  name: "PS1 Bipedal Mech",
  description:
    "A six-metre PlayStation 1-era bipedal walker with a cockpit canopy, digitigrade legs, missile pod, arm cannon, claw, warning decals and a grime-baked pixel palette.",
  builtBy: "GPT-6 Astra",
};

const DEG = Math.PI / 180;
const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

const BLACK = "#101418";
const RUBBER = "#20262b";
const ARMOR_DARK = "#394247";
const ARMOR_MID = "#68727a";
const ARMOR_LIGHT = "#89939a";
const STEEL = "#9ca4a8";
const ORANGE = "#d97a22";
const YELLOW = "#f0c332";
const CANOPY_LIT = "#4a9cab";
const GLOW = "#f5d95a";
const WHITE = "#e2dbbb";

// One deliberately chunky 8 cm paint cell is used everywhere the machine has painted armour.
// Dark seams, edge wear and random oil flecks are baked into the shared paint sheet.
const ARMOR = cellPaint(0.08, (c) => {
  const seam = Math.abs(c.u) % 8 === 0 || Math.abs(c.v) % 9 === 0;
  if (seam) return BLACK;
  if (c.random(19) < 0.035) return ARMOR_DARK;
  const light = 0.34 + 0.22 * Math.max(0, c.n.y) + 0.08 * c.random(7);
  return c.pick([ARMOR_DARK, ARMOR_MID, ARMOR_LIGHT], light);
}, { dither: true });

const ARMOR_SCRAPED = cellPaint(0.08, (c) => {
  if (Math.abs(c.u + c.v) % 11 === 0) return ORANGE;
  if (c.random(4) < 0.05) return BLACK;
  return c.pick([ARMOR_DARK, ARMOR_MID, STEEL], 0.32 + 0.28 * Math.max(0, c.n.y));
}, { dither: true });

const HAZARD = pixelArt(
  [
    "yykkkyykkkyykkkyy",
    "yykkkyykkkyykkkyy",
    "kkkyykkkyykkkyykk",
    "kkkyykkkyykkkyykk",
    "yykkkyykkkyykkkyy",
    "yykkkyykkkyykkkyy",
    "kkkyykkkyykkkyykk",
    "kkkyykkkyykkkyykk",
  ],
  { y: YELLOW, k: BLACK },
);

const UNIT07 = pixelArt(
  [
    "kkkkkkkkkkkkkk",
    "kwwwwkkkwwwwwk",
    "kkkkwkkkwwwwwk",
    "kkkwkkkkkkkkwk",
    "kkwkkkkkkkkkwk",
    "kwkkkkkkkkkkwk",
    "kwwwwwkkkwwwwk",
    "kkkkkkkkkkkkkk",
  ],
  { k: BLACK, w: WHITE },
);

const CANOPY_TEXTURE = pixelArt(
  [
    "kkkkkkkk",
    "kcccccck",
    "kcccccck",
    "kcccccck",
    "kcccccck",
    "kkkkkkkk",
  ],
  { k: BLACK, c: CANOPY_LIT },
);

const LENS_TEXTURE = pixelArt(
  [
    "kkkkkkkk",
    "kggggggk",
    "kggwwggk",
    "kggggggk",
    "kggggggk",
    "kggggggk",
    "kggggggk",
    "kkkkkkkk",
  ],
  { k: BLACK, g: GLOW, w: WHITE },
);

function box(
  b: Builder,
  bone: JointRef,
  at: [number, number, number],
  size: [number, number, number],
  color: Fill,
  group: string,
  rotation?: [number, number, number],
) {
  return b.part(new THREE.BoxGeometry(...size), color, { bone, at, rotation, group });
}

export default function build() {
  const b = createBuilder({ name: "ps1Mech", detail: 0.62, paintSize: 1024 });

  // Skeleton first: the hip-to-torso twist is explicit, while each limb is a readable mechanical chain.
  const hips = b.joint("hips", { at: [0, 2.22, 0], dir: [0, 1, 0], role: "spine", group: "torso" });
  const torsoTwist = b.joint("torsoTwist", {
    parent: hips,
    at: [0, 2.75, 0.01],
    dir: [0, 1, 0],
    role: "spine",
    group: "torso",
  });
  const spine = b.chain(
    "spine",
    [
      [0, 2.74, 0.01],
      [0, 3.25, 0.03],
      [0, 3.78, 0.04],
      [0, 4.32, 0.06],
      [0, 4.62, 0.08],
    ],
    { parent: torsoTwist, names: ["spine1", "spine2", "chest", "collar"], role: "spine", group: "torso" },
  );
  const [, spine2, chest, collar] = spine.joints;
  const neck = b.joint("neck", { parent: collar, at: [0, 4.62, 0.08], aim: [0, 4.9, 0.12], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 4.94, 0.12], dir: [0, 1, 0], role: "head", group: "head" });
  const canopyHinge = b.joint("canopyHinge", {
    parent: head,
    at: [0, 4.92, 0.22],
    aim: [0, 5.2, 0.3],
    role: "hinge",
    group: "head",
  });

  const legs = SIDES.map(([s, side]) => {
    const chain = b.chain(
      `leg${side}`,
      [
        [s * 0.43, 2.2, -0.02],
        [s * 0.52, 1.37, 0.18],
        [s * 0.45, 0.7, -0.12],
        [s * 0.48, 0.24, 0.1],
        [s * 0.48, 0.12, 0.43],
      ],
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
        role: "leg",
        group: `leg${side}`,
        contact: [s * 0.48, 0, 0.46],
      },
    );
    return { s, side, chain };
  });

  const arms = SIDES.map(([s, side]) => {
    const clavicle = b.joint(`clavicle${side}`, {
      parent: chest,
      at: [s * 0.34, 4.27, 0.03],
      aim: [s * 0.76, 4.18, 0.05],
      role: "arm",
      group: `arm${side}`,
    });
    const chain = b.chain(
      `arm${side}`,
      [
        [s * 0.74, 4.18, 0.05],
        [s * 1.12, 3.82, 0.16],
        [s * 1.48, 3.65, 0.38],
        [s * 1.7, 3.68, 0.63],
      ],
      {
        parent: clavicle,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        group: `arm${side}`,
      },
    );
    return { s, side, clavicle, chain, shoulder: chain.joints[0], elbow: chain.joints[1], wrist: chain.joints[2] };
  });

  // Torso shell and belt: a single faceted silhouette, then deliberately separate PS1 armour slabs.
  b.loft(
    [
      { at: [0, 2.13, 0], w: 0.9, h: 0.38 },
      { at: [0, 2.72, 0.02], w: 1.02, h: 0.58 },
      { at: [0, 3.35, 0.04], w: 1.15, h: 0.7 },
      { at: [0, 4.02, 0.05], w: 1.35, h: 0.72 },
      { at: [0, 4.52, 0.08], w: 1.12, h: 0.42 },
    ],
    { bone: [hips, torsoTwist, spine], color: ARMOR, section: { ngon: 6 }, group: "torso", name: "torsoShell" },
  );
  box(b, hips, [0, 2.18, 0.33], [0.88, 0.22, 0.08], ARMOR_LIGHT, "torso");
  box(b, hips, [0, 2.18, 0.385], [0.48, 0.08, 0.025], YELLOW, "torso");
  box(b, spine2, [0, 3.44, 0.39], [0.78, 0.4, 0.055], ARMOR_SCRAPED, "torso", [8 * DEG, 0, 0]);
  box(b, chest, [0, 4.0, 0.43], [0.78, 0.42, 0.06], ARMOR_LIGHT, "torso", [8 * DEG, 0, 0]);
  box(b, chest, [0, 3.99, 0.47], [0.28, 0.23, 0.025], BLACK, "torso");
  box(b, chest, [0, 3.99, 0.49], [0.13, 0.11, 0.018], GLOW, "torso");
  box(b, hips, [0, 2.45, 0.34], [0.56, 0.08, 0.026], BLACK, "torso");

  // Cockpit collar and canopy. The pixel texture is intentionally tiny and visibly blocky.
  box(b, collar, [0, 4.63, 0.06], [0.7, 0.22, 0.55], RUBBER, "head");
  b.part(new THREE.BoxGeometry(0.7, 0.42, 0.58), "#ffffff", {
    texture: CANOPY_TEXTURE,
    bone: canopyHinge,
    at: [0, 4.91, 0.24],
    group: "head",
  });
  box(b, canopyHinge, [0, 5.13, 0.23], [0.76, 0.06, 0.62], ARMOR_MID, "head", [-9 * DEG, 0, 0]);
  box(b, canopyHinge, [0, 4.72, 0.28], [0.76, 0.06, 0.62], BLACK, "head", [9 * DEG, 0, 0]);
  box(b, canopyHinge, [0, 4.95, 0.55], [0.7, 0.4, 0.05], ARMOR_DARK, "head", [0, 0, 0]);
  b.part(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", {
    texture: UNIT07,
    bone: chest,
    at: [0, 3.65, 0.49],
    dir: [0, 0, 1],
    axis: "z",
    group: "torso",
  });

  // Head sensor band, glowing lens and twin antennae.
  box(b, head, [0, 5.08, 0.18], [0.72, 0.16, 0.44], ARMOR_DARK, "head");
  b.part(new THREE.BoxGeometry(0.38, 0.16, 0.025), "#ffffff", {
    texture: LENS_TEXTURE,
    bone: head,
    at: [0, 5.06, 0.415],
    group: "head",
  });
  for (const s of [-1, 1] as const) {
    b.rod([s * 0.25, 5.16, 0.12], [s * 0.35, 5.68, 0.1], 0.018, { bone: head, color: STEEL, sides: 5, group: "head" });
    b.spike([s * 0.35, 5.66, 0.1], [s * 0.05, 0.22, 0.04], 0.34, 0.035, { bone: head, color: ORANGE, sides: 5, group: "head" });
  }

  // Digitigrade legs: dark joint blocks, armour tubes and oversized planted feet.
  for (const { s, side, chain } of legs) {
    b.sweep(chain, (t) => 0.155 - 0.035 * t, {
      bone: chain,
      color: ARMOR,
      section: { ngon: 6 },
      skin: "rigid",
      caps: "flat",
      group: `leg${side}`,
      name: `legArmor${side}`,
    });
    const [, knee, hock, ankle] = chain.joints;
    b.part(new THREE.SphereGeometry(0.22, 6, 4), RUBBER, { bone: knee, at: knee.at, group: `leg${side}` });
    b.part(new THREE.BoxGeometry(0.38, 0.28, 0.3), ARMOR_LIGHT, {
      bone: knee,
      at: [s * 0.52, 1.34, 0.25],
      rotation: [-15 * DEG, 0, 0],
      group: `leg${side}`,
    });
    box(b, hock, [s * 0.45, 0.69, -0.18], [0.3, 0.26, 0.25], BLACK, `leg${side}`);
    box(b, ankle, [s * 0.48, 0.26, 0.11], [0.34, 0.18, 0.3], ARMOR_DARK, `leg${side}`);
    box(b, ankle, [s * 0.48, 0.14, 0.44], [0.58, 0.22, 0.7], ARMOR_SCRAPED, `leg${side}`, [5 * DEG, 0, 0]);
    box(b, ankle, [s * 0.48, 0.035, 0.46], [0.62, 0.07, 0.72], BLACK, `leg${side}`);
    box(b, ankle, [s * 0.48, 0.16, 0.78], [0.58, 0.1, 0.06], YELLOW, `leg${side}`);
  }

  // Shoulder architecture. The L pod uses a pixel hazard wrap and four low-poly missile tubes.
  for (const arm of arms) {
    box(b, arm.shoulder, [arm.s * 0.78, 4.29, 0.02], [0.48, 0.42, 0.58], ARMOR, `arm${arm.side}`, [0, 0, arm.s * 8 * DEG]);
    b.part(new THREE.BoxGeometry(0.5, 0.12, 0.6), "#ffffff", {
      texture: HAZARD,
      bone: arm.shoulder,
      at: [arm.s * 0.78, 4.5, 0.02],
      group: `arm${arm.side}`,
    });
  }
  const podBone = arms.find((a) => a.s === 1)!.shoulder;
  box(b, podBone, [1.08, 4.7, 0.08], [0.5, 0.48, 0.85], ARMOR_DARK, "weaponPod", [-5 * DEG, 0, 0]);
  b.part(new THREE.BoxGeometry(0.52, 0.22, 0.8), "#ffffff", {
    texture: HAZARD,
    bone: podBone,
    at: [1.08, 4.72, 0.13],
    group: "weaponPod",
  });
  for (const x of [0.91, 1.08, 1.25, 1.42]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.7, 6), BLACK, {
      bone: podBone,
      at: [x, 4.7, 0.43],
      dir: [0, 0, 1],
      group: "weaponPod",
    });
    b.part(new THREE.ConeGeometry(0.08, 0.18, 6), ORANGE, {
      bone: podBone,
      at: [x, 4.7, 0.86],
      dir: [0, 0, 1],
      group: "weaponPod",
    });
  }

  // Right arm: chunky arm cannon held forward, with a hot muzzle and rear vent.
  const cannon = arms.find((a) => a.s === -1)!;
  const cannonBone = cannon.wrist;
  box(b, cannon.elbow, [-1.12, 3.82, 0.22], [0.28, 0.35, 0.42], ARMOR_LIGHT, "armR", [0, -16 * DEG, 0]);
  box(b, cannonBone, [-1.53, 3.67, 0.48], [0.36, 0.35, 0.7], ARMOR_DARK, "weaponCannon", [0, -10 * DEG, 0]);
  b.part(new THREE.CylinderGeometry(0.15, 0.2, 0.7, 6), ARMOR_MID, {
    bone: cannonBone,
    at: [-1.53, 3.67, 0.88],
    dir: [0, 0, 1],
    group: "weaponCannon",
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 6), GLOW, {
    bone: cannonBone,
    at: [-1.53, 3.67, 1.25],
    dir: [0, 0, 1],
    group: "weaponCannon",
  });
  b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 8), ORANGE, {
    bone: cannonBone,
    at: [-1.53, 3.67, 0.61],
    rotation: [90 * DEG, 0, 0],
    group: "weaponCannon",
  });

  // Left arm: open mechanical claw, three tapered fingers extended toward the viewer.
  const claw = arms.find((a) => a.s === 1)!;
  box(b, claw.wrist, [1.7, 3.68, 0.67], [0.34, 0.3, 0.28], ARMOR_LIGHT, "armL");
  for (const dx of [-0.13, 0, 0.13]) {
    b.spike([1.7 + dx, 3.68, 0.82], [dx * 0.8, 0.05, 0.95], 0.42, 0.065, {
      bone: claw.wrist,
      color: STEEL,
      sides: 5,
      group: "weaponClaw",
    });
  }
  b.part(new THREE.SphereGeometry(0.08, 6, 4), GLOW, { bone: claw.wrist, at: [1.7, 3.7, 0.82], group: "weaponClaw" });

  // Small back radiator fins and hardpoint bolts make the silhouette readable from behind.
  for (const s of [-1, 1] as const) {
    b.extrude(
      [[0, 0], [0.28, 0], [0.22, 0.66], [0.1, 0.82, "sharp"], [0, 0.56]],
      { at: [s * 0.42, 3.28, -0.43], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.06, color: ARMOR_DARK, bone: spine2, group: "back" },
    );
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), YELLOW, {
      bone: spine2,
      at: [s * 0.43, 3.65, -0.5],
      dir: [0, 0, -1],
      group: "back",
    });
  }

  return b.root;
}

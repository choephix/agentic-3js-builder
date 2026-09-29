import { BoxGeometry, ConeGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { cellPaint, pixelArt, snapColor, stepped } from "../kits/pixel";

export const meta = {
  name: "SNES Red Dragon",
  description: "A four-legged, horned red dragon in chunky 16-bit pixel-art primitives, with cream belly plates, bat wings and a spade tail.",
  builtBy: "GPT-6 Astra",
};

const TEXEL = 0.045;
const DEEP = snapColor("#24121d", 32);
const INK = snapColor("#3b1822", 32);
const RED_DARK = snapColor("#762331", 32);
const RED = snapColor("#b7353f", 32);
const RED_LIGHT = snapColor("#d95448", 32);
const RED_HI = snapColor("#ed7957", 32);
const WING_DARK = snapColor("#4b1b2d", 32);
const WING = snapColor("#812743", 32);
const WING_LIGHT = snapColor("#a9404e", 32);
const CREAM_DARK = snapColor("#9b704b", 32);
const CREAM = snapColor("#d9b878", 32);
const CREAM_LIGHT = snapColor("#f1d99a", 32);
const HORN = snapColor("#e3c891", 32);
const HORN_DARK = snapColor("#8b6548", 32);
const EYE_GOLD = snapColor("#f0bd42", 32);
const WHITE = "#ffffff";

const SKIN_RAMP = [DEEP, RED_DARK, RED, RED_LIGHT, RED_HI] as const;
const WING_RAMP = [DEEP, WING_DARK, WING, WING_LIGHT] as const;
const BELLY_RAMP = [CREAM_DARK, CREAM, CREAM_LIGHT] as const;
const HORN_RAMP = [HORN_DARK, HORN, CREAM_LIGHT] as const;

const skin = cellPaint(TEXEL, (c) => {
  const light = 0.38 + c.n.y * 0.32 + 0.16 * Math.sin(c.at.z * 5.5) + 0.08 * (c.random(7) - 0.5);
  return c.pick(SKIN_RAMP, light);
}, { dither: true });
const wingPaint = cellPaint(TEXEL, (c) => c.pick(WING_RAMP, 0.28 + c.n.y * 0.25 + 0.12 * (c.random(3) - 0.5)), { dither: true });
const bellyPaint = cellPaint(TEXEL, (c) => c.pick(BELLY_RAMP, 0.55 + c.n.y * 0.22), { dither: true });
const hornPaint = cellPaint(TEXEL, (c) => c.pick(HORN_RAMP, 0.48 + c.n.y * 0.25), { dither: true });
const inkPaint = cellPaint(TEXEL, (c) => c.pick([DEEP, INK, RED_DARK], 0.42 + c.n.y * 0.25), { dither: true });

const EYE = pixelArt(
  [
    "........",
    "..kkkk..",
    ".kggggk.",
    ".kgwwgk.",
    ".kgwygk.",
    ".kggggk.",
    "..kkkk..",
    "........",
  ],
  { k: DEEP, g: EYE_GOLD, w: CREAM_LIGHT, y: "#fff4b0" },
);

const SPINE = stepped(
  [[0, 2], [0, 3], [0, 4], [0, 4], [0, 3], [0, 2]],
  TEXEL,
  { rows: true },
);
const SPADE = stepped(
  [[0, 2], [0, 4], [0, 5], [0, 4], [0, 2]],
  TEXEL,
  { rows: true },
);

export default function build() {
  const b = createBuilder({ name: "snesRedDragon", paintSize: 2048, detail: 0.9 });
  const hips = b.joint("hips", { at: [0, 1.58, -0.72], role: "spine", group: "body" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.58, -0.72],
      [0, 1.52, -1.25],
      [0, 1.38, -1.9],
      [0, 1.32, -3.1],
      [0, 1.1, -3.65],
    ]),
    { parent: hips, count: 5, names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"], role: "tail", group: "tail" },
  );
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.58, -0.72],
      [0, 1.68, -0.25],
      [0, 1.79, 0.2],
      [0, 1.95, 0.62],
    ]),
    { parent: hips, count: 4, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine", group: "body" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.at(1),
      [0, 2.02, 0.83],
      [0, 2.13, 1.06],
      [0, 2.2, 1.23],
    ]),
    { parent: spine.joints[spine.joints.length - 1], count: 3, names: ["neck1", "neck2", "neck3"], role: "neck", group: "body" },
  );

  const bodyPath = catmull([
    [0, 1.1, -3.65],
    [0, 1.32, -3.1],
    [0, 1.58, -0.72],
    [0, 1.79, 0.2],
    [0, 1.95, 0.62],
    [0, 2.13, 1.06],
    [0, 2.2, 1.23],
  ]);
  const body = b.sweep(bodyPath, (t) => {
    if (t < 0.18) return 0.045 + t * 0.72;
    if (t < 0.42) return 0.19 + (t - 0.18) * 0.14;
    if (t < 0.75) return 0.235 - (t - 0.42) * 0.07;
    return 0.212 - (t - 0.75) * 0.23;
  }, {
    bone: [tail, hips, spine, neck],
    color: skin,
    section: { ngon: 8 },
    caps: "round",
    sectors: [[118, 242, bellyPaint]],
    group: "body",
    name: "continuousBody",
  });

  // Cream belly plates sit proud of the body as a readable row of square SNES tiles.
  for (let i = 0; i < 7; i++) {
    const t = 0.42 + i * 0.065;
    const plate = body.at(t, 180, 0.012);
    b.stick(new BoxGeometry(0.26 - i * 0.012, 0.045, 0.2), bellyPaint, plate, {
      embed: 0.32,
      group: "belly",
      name: `bellyPlate${i}`,
    });
  }

  // Square dorsal ridges follow the skin from tail root to neck.
  b.along(body, 12, (at) => {
    if (at.t > 0.1 && at.t < 0.88) {
      const size = 0.18 + 0.08 * Math.sin(Math.PI * (at.t - 0.1) / 0.78);
      b.spike(at, at, size, 0.038, { color: hornPaint, group: "spines", name: "dorsalSpine" });
    }
  }, { from: 0.08, to: 0.9 });

  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: [0, 0.02, 1], role: "head", group: "head" });
  b.sweep(catmull([
    head.at,
    head.local([0, 0.18, 0.02]),
    head.local([0, 0.38, 0.03]),
  ]), (t) => 0.19 - t * 0.055, {
    bone: head,
    color: skin,
    section: { ngon: 6 },
    caps: "round",
    group: "head",
    name: "skull",
  });
  b.part(new BoxGeometry(0.34, 0.2, 0.3), skin, {
    bone: head,
    at: head.local([0, 0.36, 0.01]),
    group: "head",
    name: "muzzleBlock",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local([0, 0.02, -0.1]),
    dir: head.dir([0, -0.22, 1]),
    role: "jaw",
    group: "jaw",
  });
  b.sweep(catmull([jaw.at, jaw.local([0, 0.17, 0]), jaw.local([0, 0.34, 0])]), [0.13, 0.045], {
    bone: jaw,
    color: bellyPaint,
    section: { ngon: 6 },
    caps: "round",
    group: "jaw",
    name: "lowerJaw",
  });
  b.pose(jaw, { axis: head.dir([1, 0, 0]), deg: -16 });

  for (const s of [1, -1]) {
    const eye = head.local([s * 0.13, 0.23, 0.075]);
    b.part(new SphereGeometry(0.058, 8, 6), WHITE, {
      texture: EYE,
      bone: head,
      at: eye,
      group: "face",
      name: s > 0 ? "eyeL" : "eyeR",
    });
    const hornBase = head.local([s * 0.12, 0.1, 0.16]);
    const hornTip = head.local([s * 0.25, -0.02, 0.46]);
    b.spike(hornBase, hornTip, null, 0.065, { color: hornPaint, bone: head, group: "horns", name: "browHorn" });
    const rearBase = head.local([s * 0.1, -0.02, 0.15]);
    const rearTip = head.local([s * 0.2, -0.2, 0.4]);
    b.spike(rearBase, rearTip, null, 0.05, { color: hornPaint, bone: head, group: "horns", name: "rearHorn" });
    for (const z of [0.02, 0.075]) {
      const tooth = head.local([s * 0.1, 0.4, z]);
      b.part(new ConeGeometry(0.028, 0.12, 4), hornPaint, {
        bone: head,
        at: tooth,
        dir: [0, -1, 0],
        group: "teeth",
        name: "upperTooth",
      });
    }
    const lowerTooth = jaw.local([s * 0.085, 0.25, 0.02]);
    b.part(new ConeGeometry(0.023, 0.1, 4), hornPaint, {
      bone: jaw,
      at: lowerTooth,
      dir: [0, 1, 0],
      group: "teeth",
      name: "lowerTooth",
    });
  }
  b.part(new BoxGeometry(0.08, 0.035, 0.16), inkPaint, {
    bone: head,
    at: head.local([0, 0.42, -0.015]),
    group: "face",
    name: "mouthLine",
  });

  // Four planted, three-segment legs, with splayed pixel claws.
  const legSpecs = [
    [1, 0.52, 0.5, "FL"],
    [-1, 0.52, 0.5, "FR"],
    [1, -0.62, -0.55, "HL"],
    [-1, -0.62, -0.55, "HR"],
  ] as const;
  for (const [s, z, footZ, label] of legSpecs) {
    const root = [s * 0.54, 1.52, z] as const;
    const target = [s * 0.62, 0.08, footZ + 0.12] as const;
    const points = limb(root, target, [0.52, 0.52, 0.43], [[0, 0, 1], [0, 0, -1]]);
    const leg = b.chain(`leg${label}`, points, {
      parent: hips,
      names: [`hip${label}`, `knee${label}`, `hock${label}`],
      role: "leg",
      group: "legs",
      contact: target,
    });
    b.sweep(leg, [0.14, 0.075], {
      color: skin,
      section: { ngon: 6 },
      caps: "round",
      group: "legs",
      name: `legTube${label}`,
    });
    const foot = leg.at(1);
    for (const dx of [-0.075, 0, 0.075]) {
      const base = foot.local([dx, -0.025, 0.01]);
      const tip = foot.local([dx * 1.15, -0.055, 0.16]);
      b.spike(base, tip, null, 0.027, { color: hornPaint, group: "claws", name: `claw${label}` });
    }
  }

  // Each wing is a low-poly arm plus three bat fingers and two membrane panels.
  for (const [s, label] of [[1, "L"], [-1, "R"]] as const) {
    const shoulder = [s * 0.2, 1.9, 0.28] as const;
    const elbow = [s * 0.72, 2.2, 0.18] as const;
    const wrist = [s * 1.18, 2.02, -0.02] as const;
    const arm = b.chain(`wingArm${label}`, polyline([shoulder, elbow, wrist]), {
      parent: hips,
      names: [`shoulder${label}`, `elbow${label}`],
      role: "wing",
      group: "wings",
    });
    b.sweep(arm, [0.095, 0.055], { color: skin, section: { ngon: 6 }, caps: "round", group: "wings", name: `wingArmTube${label}` });
    const tips = [
      [s * 2.22, 2.16, -0.18],
      [s * 2.02, 1.84, -0.58],
      [s * 1.72, 1.58, -0.72],
    ] as const;
    const fingers = tips.map((tip, i) => {
      const chain = b.chain(`wingFinger${label}${i + 1}`, polyline([wrist, tip]), {
        parent: arm.joints[1],
        names: [`finger${label}${i + 1}`],
        role: "digit",
        group: "wings",
      });
      b.sweep(chain, [0.032, 0.012], { color: hornPaint, section: { ngon: 5 }, caps: "point", group: "wings", name: `wingFingerTube${label}` });
      return chain;
    });
    b.membrane(arm, fingers[0], { color: wingPaint, thickness: 0.018, rows: 5, cols: 7, scallop: 0.035, group: "wings", name: `wingMembraneTop${label}` });
    b.membrane(fingers[0], fingers[1], { color: wingPaint, thickness: 0.018, rows: 4, cols: 6, scallop: 0.045, group: "wings", name: `wingMembraneMid${label}` });
    b.membrane(fingers[1], fingers[2], { color: wingPaint, thickness: 0.018, rows: 4, cols: 5, scallop: 0.05, group: "wings", name: `wingMembraneLow${label}` });
    for (const finger of fingers) {
      b.along(finger, 3, (at) => b.spike(at, at, 0.06, 0.018, { color: hornPaint, group: "wingRibs", name: `wingRib${label}` }));
    }
  }

  b.extrude(SPINE, {
    at: tail.at(1),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    bevel: 0,
    color: wingPaint,
    bone: tail.joints[tail.joints.length - 1],
    group: "tail",
    name: "tailSpade",
  });
  b.extrude(SPADE, {
    at: head.local([0, -0.12, 0.14]),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.045,
    color: skin,
    bone: head,
    group: "head",
    name: "headCrest",
  });


  void rng(19);
  return b.root;
}

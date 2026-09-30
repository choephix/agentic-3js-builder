import { BoxGeometry, PlaneGeometry, SphereGeometry, TorusGeometry } from "three";
import { createBuilder } from "../src/builder";
import { cellPaint, pixelArt } from "../kits/pixel";
import { polyline } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Fill } from "../src/context";

export const meta = {
  name: "VGA Skeleton Warrior",
  description:
    "A 1.8 m DOS VGA pixel-art skeleton warrior with glowing sockets, rusted helmet, exposed ribcage, shield, notched sword, chainmail scraps and torn tabard.",
  builtBy: "GPT-6 Astra",
};

type V3 = [number, number, number];
const U = 0.02;

// A deliberately small 256-colour-era ramp: hard cells do the work of dithering and texture.
const BONE_RAMP = ["#34343a", "#65656a", "#9b9a93", "#d0c7ac", "#eee0b9"] as const;
const BONE_DARK = "#4b4640";
const SOCKET = "#11131b";
const GLOW = "#65f2d2";
const GLOW_DARK = "#218f8a";
const RUST_RAMP = ["#24191b", "#503038", "#81433b", "#a95e3f", "#d1874c"] as const;
const STEEL_RAMP = ["#1a2029", "#39424d", "#596674", "#89939a", "#b6b3a1"] as const;
const MAIL_RAMP = ["#20252c", "#3d474d", "#697277", "#a3a49a"] as const;
const TABARD_RAMP = ["#202040", "#34376b", "#515b9b", "#7676b8"] as const;
const LEATHER = "#382522";
const LEATHER_HI = "#70402f";
const EMBLEM_GOLD = "#d0a447";
const EMBLEM_DARK = "#46322c";
const SHIELD_RAMP = ["#2d343a", "#56605d", "#7b7767", "#a39b78"] as const;

const BONE = cellPaint(U, (c) => c.pick(BONE_RAMP, 0.46 + 0.28 * c.n.y + 0.15 * c.random(3)), { dither: true });
const RUST = cellPaint(U, (c) => c.pick(RUST_RAMP, 0.35 + 0.30 * c.n.y + 0.22 * c.random(7)), { dither: true });
const STEEL = cellPaint(U, (c) => c.pick(STEEL_RAMP, 0.32 + 0.28 * c.n.y + 0.12 * c.random(5)), { dither: true });
const MAIL = cellPaint(U, (c) => c.pick(MAIL_RAMP, 0.32 + 0.25 * c.n.y + 0.12 * c.random(9)), { dither: true });
const TABARD = cellPaint(U, (c) => c.pick(TABARD_RAMP, 0.38 + 0.20 * c.n.y + 0.18 * c.random(11)), { dither: true });
const SHIELD = cellPaint(U, (c) => c.pick(SHIELD_RAMP, 0.36 + 0.28 * c.n.y + 0.12 * c.random(13)), { dither: true });

const EYE_TEX = pixelArt(
  [
    "..kkkk..",
    ".kggggk.",
    "kggwwggk",
    "kggggggk",
    ".kggggk.",
    "..kkkk..",
  ],
  { k: SOCKET, g: GLOW_DARK, w: GLOW },
);
const SHIELD_EMBLEM = pixelArt(
  [
    "......gg......",
    ".....gggg.....",
    "....ggkkgg....",
    "...ggkkkkgg...",
    "..ggkkkkkkgg..",
    ".ggkkkkkkkkgg.",
    "ggkkkkkkkkkkgg",
    ".ggkkkkkkkkgg.",
    "..ggkkkkkkgg..",
    "...ggkkkkgg...",
    "....ggkkgg....",
    ".....gggg.....",
    "......gg......",
    "......gg......",
  ],
  { k: EMBLEM_DARK, g: EMBLEM_GOLD },
);

const sides = [
  [1, "L"],
  [-1, "R"],
] as const;

export default function build() {
  const b = createBuilder({ name: "vgaSkeletonWarrior", paintSize: 1024, detail: 0.8 });

  // ----------------------------------------------------------------------------------------------- skeleton first
  const hips = b.joint("hips", { at: [0, 0.9, 0], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.9, 0],
      [0, 1.1, -0.01],
      [0, 1.29, 0.01],
      [0, 1.45, 0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.45, 0.02], aim: [0, 1.58, 0.04], role: "neck", group: "head" });
  const head = b.joint("head", { parent: neck, at: [0, 1.58, 0.04], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.49, 0.14],
    aim: [0, 1.49, 0.3],
    role: "jaw",
    group: "head",
  });

  const arms = sides.map(([s, side]) => {
    const arm = b.chain(
      `arm${side}`,
      polyline([
        [s * 0.16, 1.4, 0.01],
        [s * 0.4, 1.38, 0.02],
        [s * 0.68, 1.34, 0.06],
        [s * 0.76, 1.33, 0.07],
      ]),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "arm",
        group: `arm${side}`,
      },
    );
    return { s, side, chain: arm, shoulder: arm.joints[0], elbow: arm.joints[1], wrist: arm.joints[2] };
  });

  const legs = sides.map(([s, side]) => {
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.14, 0.9, 0],
        [s * 0.16, 0.62, 0.02],
        [s * 0.17, 0.25, 0.03],
        [s * 0.17, 0.09, 0.12],
        [s * 0.17, 0.05, 0.23],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toe${side}`],
        role: "leg",
        contact: [s * 0.17, 0, 0.22],
        group: `leg${side}`,
      },
    );
    return { s, side, chain: leg };
  });

  // ----------------------------------------------------------------------------------------------- helper geometry
  const rod = (a: V3, z: V3, r: number, color: Fill, bone: Joint, group: string) =>
    b.rod(a, z, r, { bone, color, sides: 6, group });
  const box = (size: V3, at: V3, color: Fill, bone: Joint, group: string, rotation?: V3) =>
    b.part(new BoxGeometry(...size), color, { bone, at, group, rotation });

  // ----------------------------------------------------------------------------------------------- skeleton volumes
  b.sweep(spine, [0.075, 0.065], { color: BONE, sides: 6, group: "skeleton" });
  box([0.3, 0.12, 0.2], [0, 0.91, 0], BONE, hips, "pelvis");
  for (let i = 0; i < 4; i++) {
    const y = 1.13 + i * 0.095;
    rod([0, y, 0.06], [0, y, 0.16], 0.015, BONE, chest, "ribs");
    for (const s of [-1, 1] as const) {
      b.sweep(
        polyline([
          [0, y, 0.12],
          [s * 0.12, y + 0.012, 0.13],
          [s * (0.22 + i * 0.012), y - 0.006, 0.08],
          [s * (0.28 + i * 0.014), y - 0.025, 0.01],
        ]),
        0.015,
        { color: BONE, bone: chest, sides: 6, caps: "round", group: "ribs" },
      );
    }
  }
  // Vertebra knobs and clavicles make the spine read even in the side shot.
  for (let i = 0; i < 5; i++) box([0.08, 0.045, 0.07], [0, 0.96 + i * 0.105, -0.07], BONE_DARK, spine.joints[Math.min(2, i > 2 ? 2 : i)], "spine");
  rod([-0.02, 1.42, 0.05], [-0.22, 1.39, 0.03], 0.018, BONE, chest, "clavicle");
  rod([0.02, 1.42, 0.05], [0.22, 1.39, 0.03], 0.018, BONE, chest, "clavicle");

  for (const { s, side, chain, wrist } of arms) {
    b.sweep(chain, [0.045, 0.032], { color: BONE, sides: 6, caps: "round", group: `arm${side}` });
    box([0.1, 0.08, 0.11], [s * 0.7, 1.34, 0.07], BONE, wrist, `hand${side}`);
    for (let i = 0; i < 4; i++) {
      const y = 1.32 + i * 0.012;
      b.sweep(
        polyline([
          [s * 0.72, y, 0.08],
          [s * (0.78 + i * 0.012), y - 0.01, 0.1 + i * 0.004],
          [s * (0.83 + i * 0.014), y - 0.02, 0.11 + i * 0.006],
        ]),
        [0.012, 0.006],
        { color: BONE, bone: wrist, sides: 5, caps: "round", group: `fingers${side}` },
      );
    }
    b.sweep(polyline([[s * 0.69, 1.37, 0.1], [s * 0.75, 1.42, 0.16], [s * 0.79, 1.44, 0.18]]), [0.014, 0.006], {
      color: BONE,
      bone: wrist,
      sides: 5,
      caps: "round",
      group: `thumb${side}`,
    });
  }
  for (const { s, side, chain } of legs) {
    b.sweep(chain, [0.052, 0.038], { color: BONE, sides: 6, caps: "round", group: `leg${side}` });
    box([0.08, 0.05, 0.16], [s * 0.17, 0.025, 0.18], BONE, chain.joints[3], `foot${side}`);
    for (const dz of [-0.04, 0, 0.04]) rod([s * 0.17, 0.045, 0.24], [s * 0.17 + dz * 0.2, 0.04, 0.3 + dz], 0.009, BONE, chain.joints[3], `toes${side}`);
  }

  // ----------------------------------------------------------------------------------------------- skull, jaw and helmet
  b.part(new SphereGeometry(1, 8, 6), BONE, { bone: head, at: [0, 1.63, 0.07], scale: [0.155, 0.15, 0.145], group: "skull" });
  box([0.22, 0.11, 0.075], [0, 1.59, 0.19], BONE, head, "face");
  box([0.2, 0.055, 0.12], [0, 1.49, 0.18], BONE, jaw, "jaw");
  box([0.14, 0.028, 0.018], [0, 1.505, 0.245], SOCKET, jaw, "mouth");
  for (const x of [-0.075, -0.045, -0.015, 0.015, 0.045, 0.075]) {
    box([0.02, 0.026, 0.025], [x, 1.537, 0.237], BONE, head, "upperTeeth");
    box([0.02, 0.018, 0.025], [x, 1.516, 0.241], BONE, jaw, "lowerTeeth");
  }
  box([0.024, 0.045, 0.014], [0, 1.599, 0.235], SOCKET, head, "noseAperture");
  for (const s of [-1, 1] as const) {
    box([0.066, 0.052, 0.018], [s * 0.067, 1.65, 0.214], SOCKET, head, "eyeSocket");
    b.part(new PlaneGeometry(0.08, 0.06), "#ffffff", {
      bone: head,
      at: [s * 0.067, 1.65, 0.23],
      texture: EYE_TEX,
      group: "eyeGlow",
    });
  }
  // Rusted, dented kettle helmet: faceted dome, broad square brim and cheek guards.
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.16, 0.025],
      [0.145, 0.055],
      [0.12, 0.075],
      [0.08, 0.085],
      [0, 0.08],
    ],
    { at: [0, 1.72, 0.07], segments: 8, bone: head, color: RUST, group: "helmet" },
  );
  box([0.32, 0.035, 0.22], [0, 1.715, 0.07], RUST, head, "helmet");
  for (const s of [-1, 1] as const) {
    box([0.045, 0.11, 0.13], [s * 0.14, 1.65, 0.08], RUST, head, "helmetCheek");
    box([0.035, 0.012, 0.07], [s * 0.08, 1.78, 0.2], BONE_DARK, head, "helmetDent", [0.1 * s, 0.2 * s, 0]);
  }

  // ----------------------------------------------------------------------------------------------- mail, tabard and belts
  for (let i = 0; i < 7; i++) {
    const s = i % 2 ? -1 : 1;
    const x = s * (0.25 + (i % 3) * 0.035);
    const y = 1.39 - Math.floor(i / 2) * 0.045;
    b.part(new TorusGeometry(0.032, 0.006, 4, 8), MAIL, { bone: chest, at: [x, y, 0.045], group: "chainmail" });
    b.part(new TorusGeometry(0.032, 0.006, 4, 8), MAIL, {
      bone: chest,
      at: [x + s * 0.025, y - 0.022, 0.04],
      rotation: [90, 0, 0],
      group: "chainmail",
    });
  }
  box([0.32, 0.045, 0.23], [0, 0.96, 0.005], LEATHER, hips, "belt");
  box([0.07, 0.065, 0.028], [0, 0.96, 0.13], EMBLEM_GOLD, hips, "buckle");
  b.extrude(
    [
      [-0.14, 0.25],
      [0.14, 0.25],
      [0.18, 0.08],
      [0.16, -0.16],
      [0.1, -0.27],
      [0.03, -0.21],
      [-0.03, -0.3],
      [-0.1, -0.23],
      [-0.18, -0.27],
      [-0.17, 0.02],
    ],
    { at: [0, 0.7, 0.14], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, color: TABARD, bone: hips, group: "tornTabard" },
  );
  box([0.065, 0.47, 0.02], [-0.15, 1.21, 0.165], TABARD, chest, "tornTabardStrap");

  // ----------------------------------------------------------------------------------------------- shield on the model's left (+X)
  b.extrude(
    [
      [0, 0.2],
      [0.11, 0.16],
      [0.16, 0.05],
      [0.14, -0.16],
      [0.06, -0.25],
      [0, -0.3],
      [-0.06, -0.25],
      [-0.14, -0.16],
      [-0.16, 0.05],
      [-0.11, 0.16],
    ],
    { at: [0.83, 1.34, 0.16], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, bevel: 0.004, color: SHIELD, bone: arms[0].wrist, group: "shield" },
  );
  b.part(new PlaneGeometry(0.28, 0.28), "#ffffff", {
    bone: arms[0].wrist,
    at: [0.83, 1.34, 0.181],
    texture: SHIELD_EMBLEM,
    group: "shieldEmblem",
  });
  rod([0.73, 1.32, 0.12], [0.92, 1.32, 0.12], 0.012, LEATHER, arms[0].wrist, "shieldGrip");

  // ----------------------------------------------------------------------------------------------- notched sword on the model's right (-X)
  b.extrude(
    [
      [-0.028, -0.08],
      [0.028, -0.08],
      [0.032, 0.1],
      [0.02, 0.15],
      [0.032, 0.2],
      [0.018, 0.25],
      [0.028, 0.46],
      [-0.028, 0.46],
      [-0.02, 0.27],
      [-0.036, 0.22],
      [-0.021, 0.16],
      [-0.036, 0.1],
    ],
    { at: [-0.78, 1.31, 0.12], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.002, color: STEEL, bone: arms[1].wrist, group: "notchedSword" },
  );
  rod([-0.88, 1.27, 0.1], [-0.68, 1.27, 0.1], 0.014, STEEL, arms[1].wrist, "swordGuard");
  rod([-0.78, 1.18, 0.1], [-0.78, 1.27, 0.1], 0.018, LEATHER_HI, arms[1].wrist, "swordGrip");
  box([0.045, 0.06, 0.045], [-0.78, 1.16, 0.1], BONE_DARK, arms[1].wrist, "swordPommel");
  rod([-0.78, 1.36, 0.14], [-0.78, 1.7, 0.14], 0.006, BONE_DARK, arms[1].wrist, "bladeFuller");

  return b.root;
}

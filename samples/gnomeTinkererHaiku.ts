import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { catmull } from "../src/path";
import { grain, spots, stripes } from "../src/paint";

export const meta = {
  name: "Gnome Tinkerer",
  description:
    "A stout gnome inventor in a polka-dot pointed hat and pushed-up brass goggles, a wrench in one mitt, a clockwork songbird on his shoulder and a green backpack full of steam gadgets.",
  style: "whimsical low-poly mix",
  commit: "b816db2",
};

type V = [number, number, number];

const DEG = Math.PI / 180;

const Ico = THREE.IcosahedronGeometry;
const Box = THREE.BoxGeometry;
const Cone = THREE.ConeGeometry;
const Cyl = THREE.CylinderGeometry;
const Torus = THREE.TorusGeometry;

// Piecewise-linear lookup over keys [t, a, b]; col picks the value column.
function keyed(keys: number[][], t: number, col: number): number {
  if (t <= keys[0][0]) return keys[0][col];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const u = (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      return keys[i - 1][col] + (keys[i][col] - keys[i - 1][col]) * u;
    }
  }
  return keys[keys.length - 1][col];
}

// Palette: cheerful, one hue per garment, brass for every gadget.
const SKIN = "#f2b48c";
const NOSE = "#ef8a74";
const CHEEK = "#f7897f";
const FRECKLE = "#c8674f";
const EYE = "#fffaf0";
const INK = "#2a1d2b";
const HAIR = "#c65a2e";
const BEARD = "#f7f0e1";
const BEARD_SHADE = "#dccfb6";
const HAT_P = spots("#1f7f7a", "#ffd65c", { size: 0.09, amount: 0.3 });
const HAT_BRIM = "#17605f";
const BAND = "#f2c14e";
const JACKET = "#e8733f";
const JACKET_LIGHT = "#f29a5e";
const VEST = "#2a9d8f";
const PANTS = "#3f5fb0";
const BOOT = "#5b3521";
const SOLE = "#2b1a12";
const LEATHER = "#8c5a36";
const LEATHER_DARK = "#5e3a22";
const APRON = "#9a6440";
const GLOVE = "#7b4b2a";
const BRASS = "#f0b540";
const COPPER = "#c97a3e";
const STEEL = "#b9c6cf";
const IRON = "#4c5366";
const RED = "#e0463c";
const GLASS = "#8ff0ff";
const GREEN_LIQ = "#6dff7a";
const FACE = "#fff6dc";
const BULB = "#ffe27a";
const BIRD = "#e7a04a";
const STEAM = "#f7fbff";
const STEAM_SHADE = "#d6e3f0";
const PACK_P = grain("#4f9a5a", "#3b7a48", { size: 0.03, axis: "y" });
const PACK_DARK = "#2f6b41";
const PACK_LIGHT = "#6fb36e";
const STRAP = "#7a4f2e";
const SCARF = stripes("#f2c14e", "#d9423a", { size: 0.05 });

// Torso radii [t, rx, ry] by source t along the spine: hips, paunch, waist, barrel chest, shoulders.
const TORSO: number[][] = [
  [0, 0.135, 0.11],
  [0.2, 0.15, 0.13],
  [0.45, 0.13, 0.105],
  [0.8, 0.16, 0.12],
  [1, 0.14, 0.1],
];
// Leg and arm taper keys [t, r].
const LEG: number[][] = [
  [0, 0.095],
  [0.5, 0.072],
  [0.85, 0.055],
  [1, 0.05],
];
const ARM: number[][] = [
  [0, 0.05],
  [0.5, 0.045],
  [1, 0.04],
];

const APRON_OUTLINE: OutlinePoint[] = [
  [-0.085, 0.12],
  [0.085, 0.12],
  [0.11, -0.02],
  [0.13, -0.13],
  [-0.13, -0.13],
  [-0.11, -0.02],
];

export default function build() {
  const b = createBuilder({ name: "gnomeTinkerer" });
  type Fill = Parameters<typeof b.part>[1];
  type PartOpts = NonNullable<Parameters<typeof b.part>[2]>;

  // One rigid part on a bone; rot is XYZ degrees, dir aims the geometry's Y axis.
  const put = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: V, rot?: V, scale?: V | number, dir?: V) => {
    const o: PartOpts = { bone, at, flat: true };
    if (rot) o.rotation = rot;
    if (scale !== undefined) o.scale = scale;
    if (dir) o.dir = dir;
    return b.part(geo, color, o);
  };

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.44, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.44, 0], [0, 0.56, 0], [0, 0.66, 0], [0, 0.76, 0]]), {
    parent: hips,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", catmull([[0, 0.76, 0], [0, 0.8, 0], [0, 0.84, 0]]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.84, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.8, 0.03], role: "jaw" });
  const gear = b.joint("gear", { parent: chest, at: [0.2, 0.7, -0.2], aim: [1.2, 0.7, -0.2], role: "hinge" });

  // ---- Torso, hips, neck ---------------------------------------------------
  const torso = b.sweep(spine, (t) => [keyed(TORSO, t, 1), keyed(TORSO, t, 2)], { color: JACKET });
  const torsoSkin = b.surface(torso);
  b.sweep(spine, (t) => [keyed(TORSO, t, 1) + 0.008, keyed(TORSO, t, 2) + 0.006], {
    from: 0.4,
    to: 0.9,
    color: VEST,
  });
  b.sweep(neck, [0.05, 0.045], { color: SKIN });
  put(new Ico(1, 1), PANTS, hips, [0, 0.42, 0], undefined, [0.14, 0.09, 0.115]);

  // Belt, buckle and the collar scarf, all riding the torso surface.
  const beltLoop = torsoSkin.loop([0, 0.47, 0], { dir: [0, 1, 0], lift: 0.01 });
  b.sweep(beltLoop, 0.017, { color: LEATHER_DARK });
  const buckleHit = torsoSkin.around([0, 0.47, 0]).at(0, 0);
  if (buckleHit) b.stick(new Box(0.05, 0.016, 0.04), BRASS, buckleHit);
  const scarfLoop = torsoSkin.loop([0, 0.75, 0], { dir: [0, 1, 0], lift: 0.012 });
  b.sweep(scarfLoop, 0.028, { color: SCARF });

  // Apron with two pockets, a pencil and a brass watch on the vest.
  b.extrude(APRON_OUTLINE, {
    at: [0, 0.55, 0.12],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.003,
    color: APRON,
    bone: spine.joints[1],
  });
  put(new Box(0.07, 0.06, 0.008), LEATHER_DARK, spine.joints[1], [0, 0.5, 0.132]);
  put(new Box(0.03, 0.03, 0.008), LEATHER_DARK, spine.joints[1], [0.06, 0.6, 0.131]);
  put(new Cyl(0.007, 0.007, 0.07, 5), RED, spine.joints[1], [0.025, 0.55, 0.14], [0, 0, -12]);
  put(new Cyl(0.02, 0.02, 0.008, 8), BRASS, chest, [0.11, 0.71, 0.1], [90, 0, 0]);

  // ---- Head ------------------------------------------------------------------
  const skull = put(new Ico(1, 2), SKIN, head, [0, 0.9, 0], undefined, [0.18, 0.19, 0.18]);
  const skin = b.surface(skull);
  const goggleStrap = skin.loop([0, 0.99, 0], { dir: [0, 1, 0], lift: 0.008 });
  b.sweep(goggleStrap, 0.01, { color: LEATHER_DARK });
  put(new Ico(1, 1), NOSE, head, [0, 0.86, 0.185], undefined, [0.05, 0.058, 0.06]);
  put(new Ico(0.1, 1), BEARD, head, [0, 0.82, 0.16], undefined, [0.15, 0.035, 0.05]);
  put(new Ico(0.03, 1), HAIR, head, [0, 0.88, -0.14], undefined, [1.3, 0.9, 0.7]);
  put(new Cyl(0.2, 0.2, 0.03, 8), BAND, head, [0, 1.08, 0]);
  put(new Cone(0.19, 0.26, 8), HAT_P, head, [0, 1.19, 0], [0, 0, 10]);
  put(new Ico(0.035, 1), BAND, head, [-0.023, 1.335, 0]);
  put(new Cyl(0.26, 0.27, 0.03, 12), HAT_BRIM, head, [0, 1.06, 0]);
  put(new Cyl(0.035, 0.035, 0.012, 8), BRASS, head, [0, 1.08, 0.205], [90, 0, 0]);
  put(new Cyl(0.014, 0.014, 0.014, 6), GLASS, head, [0, 1.08, 0.214], [90, 0, 0]);
  put(new Cyl(0.008, 0.008, 0.12, 5), RED, head, [-0.2, 1.12, 0.03], [0, 0, 20]);
  put(new Cone(0.008, 0.02, 5), BULB, head, [-0.218, 1.2, 0.03], [0, 0, 20]);
  // Three steam vials stand on the pack lid under the brim.
  for (const [vx, vz] of [
    [-0.07, -0.19],
    [-0.02, -0.22],
    [0.03, -0.19],
  ]) {
    put(new Cyl(0.014, 0.014, 0.08, 7), GLASS, chest, [vx, 0.93, vz]);
    put(new Cyl(0.01, 0.01, 0.05, 7), GREEN_LIQ, chest, [vx, 0.915, vz]);
    put(new Cyl(0.016, 0.016, 0.012, 7), BRASS, chest, [vx, 0.978, vz]);
  }

  for (const s of [1, -1]) {
    // Ears, eyes, goggles, cheeks, freckles and hair.
    put(new Cone(0.035, 0.11, 5), SKIN, head, [0.16 * s, 0.9, 0], [0, 0, -70 * s]);
    put(new Ico(0.032, 0), EYE, head, [0.065 * s, 0.9, 0.15]);
    put(new Ico(0.017, 0), INK, head, [0.065 * s, 0.9, 0.18]);
    put(new Torus(0.055, 0.014, 5, 10), BRASS, head, [0.068 * s, 0.99, 0.158], [-30, 0, 0]);
    put(new Cyl(0.042, 0.042, 0.012, 8), GLASS, head, [0.068 * s, 0.99, 0.163], [60, 0, 0]);
    put(new Ico(0.035, 1), CHEEK, head, [0.095 * s, 0.84, 0.15], undefined, [1, 0.7, 0.35]);
    for (const [az, el] of [
      [32, -16],
      [40, -22],
      [26, -25],
    ]) {
      const dot = skin.around([0, 0.9, 0]).at(az * s, el);
      if (dot) b.stick(new Ico(0.008, 0), FRECKLE, dot, { embed: 0.3 });
    }
    put(new Ico(0.04, 1), HAIR, head, [0.17 * s, 0.9, -0.03], undefined, [0.6, 0.9, 0.8]);
  }

  // ---- Beard, lobed, on the jaw bone ---------------------------------------
  put(new Ico(1, 1), BEARD, jaw, [0, 0.745, 0.11], undefined, [0.095, 0.075, 0.085]);
  put(new Ico(1, 1), BEARD, jaw, [0, 0.675, 0.125], undefined, [0.085, 0.07, 0.075]);
  put(new Ico(1, 1), BEARD_SHADE, jaw, [0, 0.615, 0.13], undefined, [0.065, 0.06, 0.06]);
  put(new Cone(0.035, 0.08, 6), BEARD_SHADE, jaw, [0, 0.56, 0.13], [180, 0, 0]);
  put(new Ico(0.016, 0), BRASS, jaw, [0, 0.62, 0.2]);

  // ---- Arms and legs --------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const x = 0.1 * s;
    const leg = b.chain(`leg${L}`, catmull([[x, 0.44, 0], [x, 0.27, 0.02], [x, 0.11, 0], [x, 0.04, 0.1]]), {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
      role: "leg",
    });
    const legSweep = b.sweep(leg, (t) => keyed(LEG, t, 1), { color: PANTS });
    const legSkin = b.surface(legSweep);
    const ankle = leg.joints[2];
    const foot = leg.joints[3];
    put(new Box(0.11, 0.12, 0.1), BOOT, ankle, [x, 0.1, 0]);
    put(new Box(0.12, 0.02, 0.11), LEATHER, ankle, [x, 0.16, 0]);
    put(new Box(0.11, 0.08, 0.06), BOOT, ankle, [x, 0.04, -0.03]);
    put(new Box(0.03, 0.02, 0.01), BRASS, ankle, [x, 0.1, 0.056]);
    put(new Ico(0.055, 1), BOOT, foot, [x, 0.04, 0.1], undefined, [1, 0.8, 1.5]);
    put(new Box(0.11, 0.02, 0.19), SOLE, foot, [x, 0.01, 0.07]);
    const kneePatch = legSkin.around([x, 0.27, 0.02]).at(0, 0);
    if (kneePatch) b.stick(new Box(0.075, 0.014, 0.06), LEATHER, kneePatch);

    const arm = b.chain(
      `arm${L}`,
      catmull([[0.17 * s, 0.71, 0], [0.24 * s, 0.57, 0.03], [0.25 * s, 0.47, 0.08], [0.25 * s, 0.41, 0.14]]),
      {
        parent: chest,
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
        role: "arm",
      },
    );
    b.sweep(arm, (t) => keyed(ARM, t, 1), { color: JACKET });
    const shoulder = arm.joints[0];
    const wrist = arm.joints[2];
    const hand = arm.joints[3];
    put(new Ico(0.075, 1), JACKET_LIGHT, shoulder, [0.165 * s, 0.715, 0], undefined, [1, 0.8, 1.05]);
    put(new Ico(0.012, 0), BRASS, shoulder, [0.19 * s, 0.73, 0.03]);
    put(new Cyl(0.05, 0.05, 0.026, 8), BRASS, wrist, [0.2485 * s, 0.4845, 0.0715], undefined, undefined, [0.1, -1, 0.5]);
    put(new Ico(0.075, 1), GLOVE, hand, [0.25 * s, 0.4, 0.15], undefined, [1, 0.9, 1.15]);
    put(new Ico(0.032, 1), GLOVE, hand, [0.32 * s, 0.42, 0.15]);
    if (s < 0) {
      // A wrench in the right mitt.
      put(new Box(0.022, 0.2, 0.018), STEEL, hand, [-0.25, 0.22, 0.15], [0, 0, -6]);
      put(new Torus(0.035, 0.012, 5, 8), STEEL, hand, [-0.25, 0.1, 0.15]);
    }
    if (s > 0) {
      // A clockwork songbird perched on the left shoulder.
      put(new Ico(0.05, 1), BIRD, shoulder, [0.19, 0.8, -0.01], undefined, [0.8, 1, 1.2]);
      put(new Ico(0.03, 1), BIRD, shoulder, [0.19, 0.845, 0.03]);
      put(new Cone(0.012, 0.03, 4), COPPER, shoulder, [0.19, 0.84, 0.06], [90, 0, 0]);
      put(new Box(0.025, 0.012, 0.08), BIRD, shoulder, [0.19, 0.8, -0.08], [-12, 0, 0]);
      put(new Cyl(0.006, 0.006, 0.03, 5), COPPER, shoulder, [0.19, 0.74, 0.0]);
    }
  }

  // ---- Belt pouch with a screwdriver ----------------------------------------
  put(new Box(0.075, 0.07, 0.05), LEATHER, hips, [0.16, 0.41, 0.02]);
  put(new Box(0.08, 0.03, 0.056), LEATHER_DARK, hips, [0.16, 0.452, 0.02]);
  put(new Box(0.02, 0.018, 0.01), BRASS, hips, [0.16, 0.44, 0.05]);
  put(new Cyl(0.013, 0.013, 0.05, 6), RED, hips, [0.16, 0.54, 0.02], [0, 0, -8]);
  put(new Box(0.008, 0.07, 0.008), STEEL, hips, [0.165, 0.48, 0.02], [0, 0, -8]);

  // ---- Backpack, steam funnel and gadgets (on the chest bone) --------------
  put(new Ico(1, 2), PACK_P, chest, [0, 0.7, -0.2], undefined, [0.19, 0.21, 0.09]);
  put(new Ico(1, 1), PACK_DARK, chest, [0, 0.86, -0.2], undefined, [0.165, 0.05, 0.085]);
  put(new Ico(1, 1), PACK_LIGHT, chest, [0.02, 0.58, -0.29], undefined, [0.11, 0.1, 0.02]);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [0.1 * s, 0.86, -0.2],
        [0.12 * s, 0.8, -0.06],
        [0.12 * s, 0.78, 0],
        [0.09 * s, 0.7, 0.1],
        [0.085 * s, 0.62, 0.14],
      ]),
      0.013,
      { bone: chest, color: STRAP },
    );
  }
  put(new Box(0.03, 0.04, 0.012), BRASS, chest, [0.085, 0.6, 0.15]);
  put(new Box(0.03, 0.04, 0.012), BRASS, chest, [-0.085, 0.6, 0.15]);
  put(new Cyl(0.025, 0.035, 0.13, 7), COPPER, chest, [0.13, 0.93, -0.2]);
  put(new Cyl(0.042, 0.03, 0.02, 7), BRASS, chest, [0.13, 0.99, -0.2]);
  put(new Ico(0.04, 1), STEAM, chest, [0.14, 1.04, -0.3]);
  put(new Ico(0.032, 1), STEAM_SHADE, chest, [0.1, 1.09, -0.33]);
  put(new Ico(0.026, 1), STEAM, chest, [0.155, 1.12, -0.35]);
  b.rod([-0.1, 0.87, -0.2], [-0.13, 1.0, -0.28], [0.007, 0.004], { color: COPPER, bone: chest });
  put(new Ico(0.03, 1), BULB, chest, [-0.13, 1.02, -0.28]);
  // Windup crank on the left flank.
  put(new Cyl(0.012, 0.012, 0.05, 6), IRON, chest, [-0.2, 0.66, -0.2], [0, 0, 90]);
  put(new Box(0.012, 0.05, 0.012), IRON, chest, [-0.23, 0.68, -0.2]);
  put(new Ico(0.018, 1), BRASS, chest, [-0.23, 0.715, -0.2]);
  // Pressure gauge on the back.
  put(new Cyl(0.045, 0.045, 0.02, 8), BRASS, chest, [-0.06, 0.74, -0.3], [90, 0, 0]);
  put(new Cyl(0.034, 0.034, 0.022, 8), FACE, chest, [-0.06, 0.74, -0.31], [90, 0, 0]);
  put(new Box(0.006, 0.026, 0.004), RED, chest, [-0.06, 0.745, -0.322], [0, 0, 35]);
  // Brass cog on the right flank, on its own hinge.
  put(new Cyl(0.045, 0.045, 0.026, 8), COPPER, gear, [0.2, 0.7, -0.2], [0, 0, 90]);
  put(new Cyl(0.02, 0.02, 0.03, 6), BRASS, gear, [0.2, 0.7, -0.2], [0, 0, 90]);
  for (let i = 0; i < 8; i++) {
    const th = i * 45;
    const ty = 0.7 + 0.063 * Math.cos(th * DEG);
    const tz = -0.2 + 0.063 * Math.sin(th * DEG);
    put(new Box(0.02, 0.03, 0.022), BRASS, gear, [0.2, ty, tz], [th, 0, 0]);
  }

  return b.root;
}

import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  rng,
  limb,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith at Anvil",
  description:
    "A broad, battle-scarred Warcraft-style dwarf blacksmith with a braided beard, iron apron, hammer, glowing forge, and a massive anvil.",
};

const STEEL = "#48505c";
const DARK_STEEL = "#202936";
const EDGE = "#8793a2";
const IRON = "#302d31";
const IRON_HI = "#565158";
const BRASS = "#bd7b25";
const BRASS_HI = "#f0bd55";
const LEATHER = "#60351f";
const LEATHER_DARK = "#321b15";
const RED = "#8d2b25";
const TUNIC = "#31515b";
const TUNIC_DARK = "#1c3039";
const WOOD = "#704326";
const SKIN_LIT = "#d29362";
const SKIN_SHADOW = "#8f4f39";
const SKIN = cel(SKIN_LIT, SKIN_SHADOW);
const COAT = cel("#397080", "#1d3b48");
const COAT_EDGE = furEdge(COAT, "#16252e", {
  level: -0.15,
  teeth: 0.18,
  period: 0.045,
  ink: INK,
  inkWidth: 0.025,
});
const BEARD = cel("#4b3022", "#1d1515");
const BEARD_LIGHT = cel("#936039", "#42251d");
const RED_CEL = cel(RED, "#421d24");
const FIRE = "#ff9b2e";
const FIRE_HOT = "#ffe28a";
const EYE_TEX = animeEye({
  iris: "#62d6e5",
  irisLight: "#d9ffff",
  irisDark: "#183d65",
  blush: false,
  brow: true,
  size: 256,
});

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function sphere(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  at: [number, number, number],
  color: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    bone,
    name,
    flat: true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  length: number,
  at: [number, number, number],
  dir: [number, number, number],
  color: any,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
    at,
    dir,
    bone,
    name,
    flat: true,
  });
}

function rivetRow(
  b: ReturnType<typeof createBuilder>,
  y: number,
  z: number,
  xs: number[],
  color = BRASS_HI,
  bone?: any,
) {
  for (const x of xs) sphere(b, 0.018, [x, y, z], color, bone, "apron.rivet");
}

function braid(
  b: ReturnType<typeof createBuilder>,
  side: number,
  bone: any,
  z = 0.17,
) {
  const x = side * 0.125;
  const p1: [number, number, number] = [x, 1.63, z];
  const p2: [number, number, number] = [x + side * 0.018, 1.49, z + 0.025];
  const p3: [number, number, number] = [x - side * 0.018, 1.36, z + 0.02];
  b.sweep(catmull([p1, p2, p3]), [0.052, 0.035], {
    color: BEARD_LIGHT,
    bone,
    section: { ngon: 6 },
    name: `beard.braid${side}`,
  });
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const x2 = x + side * (0.018 * Math.sin(i * 2.2));
    const y2 = 1.59 - i * 0.075;
    sphere(b, 0.045, [x2, y2, z + 0.035], i % 2 ? BEARD : BEARD_LIGHT, bone, "beard.braidBead");
  }
}

export default function build() {
  const b = createBuilder({ name: "dwarf-blacksmith", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: compact dwarf proportions, feet planted and arms readable.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.92, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, 0],
      [0, 1.16, 0],
      [0, 1.38, 0],
      [0, 1.56, 0],
    ]),
    {
      parent: hips,
      names: ["pelvis", "torso", "chest", "neckBase"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.joints[3],
    at: [0, 1.72, 0.03],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.64, 0.13],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const legL = b.chain(
    "legL",
    limb(
      [0.17, 0.91, -0.01],
      [0.18, 0.105, 0.13],
      [0.28, 0.29, 0.19],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    ),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.18, 0, 0.13],
    },
  );

  const legR = b.chain(
    "legR",
    limb(
      [-0.17, 0.91, -0.01],
      [-0.18, 0.105, 0.13],
      [0.28, 0.29, 0.19],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    ),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.18, 0, 0.13],
    },
  );

  const armL = b.chain(
    "armL",
    catmull([
      [0.28, 1.43, 0.03],
      [0.43, 1.25, 0.12],
      [0.54, 1.03, 0.28],
      [0.57, 0.95, 0.34],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
    },
  );

  const armR = b.chain(
    "armR",
    catmull([
      [-0.28, 1.43, 0.03],
      [-0.43, 1.27, 0.08],
      [-0.48, 1.12, 0.27],
      [-0.46, 1.04, 0.39],
    ]),
    {
      parent: spine.joints[2],
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
    },
  );

  // ---------------------------------------------------------------------------
  // Legs, boots, and the deliberately oversized dwarf silhouette.
  // ---------------------------------------------------------------------------
  b.sweep(legL, (t) => 0.09 - t * 0.025, {
    color: COAT_EDGE,
    section: { ngon: 6 },
    name: "legL.sweep",
  });
  b.sweep(legR, (t) => 0.09 - t * 0.025, {
    color: COAT_EDGE,
    section: { ngon: 6 },
    name: "legR.sweep",
  });

  box(b, [0.18, 0.18, 0.26], [0.18, 0.11, 0.13], LEATHER_DARK, legL.joints[2], "bootL");
  box(b, [0.18, 0.18, 0.26], [-0.18, 0.11, 0.13], LEATHER_DARK, legR.joints[2], "bootR");
  box(b, [0.205, 0.07, 0.27], [0.18, 0.19, 0.14], LEATHER, legL.joints[2], "bootL.top");
  box(b, [0.205, 0.07, 0.27], [-0.18, 0.19, 0.14], LEATHER, legR.joints[2], "bootR.top");
  box(b, [0.19, 0.035, 0.285], [0.18, 0.22, 0.14], BRASS, legL.joints[2], "bootL.cuff");
  box(b, [0.19, 0.035, 0.285], [-0.18, 0.22, 0.14], BRASS, legR.joints[2], "bootR.cuff");
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      sphere(b, 0.014, [s * 0.18, 0.095, 0.04 + i * 0.06], BRASS_HI, s > 0 ? legL.joints[2] : legR.joints[2], "boot.stud");
    }
  }

  // ---------------------------------------------------------------------------
  // Torso, belt, apron and layered shoulder armor.
  // ---------------------------------------------------------------------------
  b.sweep(spine, (t) => (t < 0.3 ? 0.23 : t < 0.8 ? 0.29 : 0.22), {
    color: COAT_EDGE,
    section: "circle",
    sides: 8,
    name: "barrel.torso",
  });

  box(b, [0.56, 0.46, 0.19], [0, 1.18, -0.01], TUNIC_DARK, spine.joints[1], "tunic.back");
  box(b, [0.55, 0.42, 0.22], [0, 1.24, 0.18], COAT, spine.joints[1], "tunic.front");
  box(b, [0.62, 0.10, 0.25], [0, 0.94, 0.1], LEATHER_DARK, hips, "belt");
  box(b, [0.63, 0.07, 0.255], [0, 0.99, 0.115], LEATHER, hips, "belt.highlight");
  box(b, [0.13, 0.13, 0.045], [0, 0.98, 0.245], BRASS_HI, hips, "belt.buckle");
  box(b, [0.085, 0.085, 0.025], [0, 0.98, 0.27], BRASS, hips, "belt.buckleInset");

  const apron = b.part(
    new THREE.BoxGeometry(0.38, 0.48, 0.035),
    LEATHER,
    { at: [0, 1.19, 0.29], bone: spine.joints[1], name: "heavy leather apron" },
  );
  box(b, [0.40, 0.045, 0.045], [0, 1.43, 0.30], BRASS, spine.joints[2], "apron.neckTrim");
  box(b, [0.42, 0.045, 0.045], [0, 0.97, 0.30], LEATHER_DARK, hips, "apron.bottomTrim");
  rivetRow(b, 1.37, 0.32, [-0.14, 0.14], BRASS_HI, spine.joints[1]);
  rivetRow(b, 1.16, 0.32, [-0.14, 0.14], BRASS_HI, spine.joints[1]);
  rivetRow(b, 1.02, 0.32, [-0.14, 0.14], BRASS_HI, spine.joints[1]);

  for (const s of [-1, 1]) {
    const shoulder = s > 0 ? armL.joints[0] : armR.joints[0];
    box(b, [0.18, 0.16, 0.28], [s * 0.34, 1.43, 0.02], STEEL, shoulder, "shoulder.pauldron");
    box(b, [0.20, 0.035, 0.30], [s * 0.34, 1.52, 0.02], EDGE, shoulder, "shoulder.rim");
    sphere(b, 0.035, [s * 0.34, 1.43, 0.175], BRASS_HI, shoulder, "shoulder.rivet");
  }

  // ---------------------------------------------------------------------------
  // Arms, gauntlets, chunky hands and forge-working posture.
  // ---------------------------------------------------------------------------
  b.sweep(armL, (t) => 0.085 - t * 0.025, {
    color: COAT_EDGE,
    section: { ngon: 6 },
    name: "armL.sweep",
  });
  b.sweep(armR, (t) => 0.085 - t * 0.025, {
    color: COAT_EDGE,
    section: { ngon: 6 },
    name: "armR.sweep",
  });

  for (const s of [-1, 1]) {
    const arm = s > 0 ? armL : armR;
    const wrist = s > 0 ? [0.57, 0.95, 0.34] : [-0.46, 1.04, 0.39];
    cylinder(b, 0.075, 0.15, [wrist[0], wrist[1], wrist[2]], [s * 0.2, 0.15, 1], STEEL, arm.joints[2], "gauntlet");
    sphere(b, 0.095, [wrist[0], wrist[1] - 0.03, wrist[2] + 0.05], SKIN, arm.joints[3], "hand");
    for (let i = 0; i < 3; i++) {
      b.sweep(
        [
          [wrist[0] + s * (i - 1) * 0.032, wrist[1] - 0.055, wrist[2] + 0.09],
          [wrist[0] + s * (i - 1) * 0.042, wrist[1] - 0.07, wrist[2] + 0.16],
        ],
        [0.022, 0.012],
        { color: SKIN, bone: arm.joints[3], name: "finger" },
      );
    }
    sphere(b, 0.018, [wrist[0] - s * 0.06, wrist[1] - 0.02, wrist[2] + 0.045], SKIN_SHADOW, arm.joints[3], "thumb");
  }

  // ---------------------------------------------------------------------------
  // Head, helmet, ears, face, nose, eyebrows and a huge braided beard.
  // ---------------------------------------------------------------------------
  const skull = sphere(b, 0.27, [0, 1.72, 0.06], SKIN, head, "skull");
  sphere(b, 0.225, [0, 1.64, 0.17], SKIN, jaw, "jaw.volume");
  box(b, [0.28, 0.13, 0.14], [0, 1.61, 0.25], SKIN_SHADOW, jaw, "muzzle");
  sphere(b, 0.07, [0, 1.62, 0.325], "#3b2425", jaw, "nose");
  box(b, [0.13, 0.018, 0.018], [0, 1.56, 0.335], INK, jaw, "mouth.line");

  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const eyeHit = faceSurface.around([0, 1.72, 0.06]).at(s * 25, 8);
    if (eyeHit) {
      b.decal(faceSurface, EYE_TEX, {
        at: eyeHit,
        size: [0.095, 0.12],
        mirror: s > 0,
        lift: 0.004,
        name: "large blue eye",
      });
    }
  }

  box(b, [0.14, 0.045, 0.04], [0.105, 1.81, 0.255], BEARD, head, "browL");
  box(b, [0.14, 0.045, 0.04], [-0.105, 1.81, 0.255], BEARD, head, "browR");
  for (const s of [-1, 1]) {
    sphere(b, 0.095, [s * 0.235, 1.75, 0.06], SKIN, head, "ear");
    cylinder(b, 0.025, 0.035, [s * 0.235, 1.75, 0.13], [0, 0, 1], BRASS, head, "ear.ring");
  }

  // Helmet bowl, brow plate, horns and crest.
  b.lathe(
    [
      [0, 0],
      [0.23, 0],
      [0.27, 0.04],
      [0.25, 0.18],
      [0.18, 0.27],
      [0, 0.30],
    ],
    {
      at: [0, 1.72, 0.035],
      bone: head,
      color: DARK_STEEL,
      segments: 10,
      name: "iron helmet",
    },
  );
  box(b, [0.56, 0.065, 0.10], [0, 1.80, 0.235], STEEL, head, "helmet.brow");
  box(b, [0.49, 0.025, 0.035], [0, 1.835, 0.285], EDGE, head, "helmet.browEdge");
  for (const s of [-1, 1]) {
    b.spike([s * 0.22, 1.88, 0.04], [s * 0.4, 0.18, -0.04], 0.23, 0.07, {
      color: STEEL,
      bone: head,
      name: "helmet horn",
    });
    sphere(b, 0.026, [s * 0.14, 1.90, 0.20], BRASS_HI, head, "helmet rivet");
  }
  b.extrude(
    [
      [-0.10, 0],
      [0.10, 0],
      [0.075, 0.20],
      [0, 0.28, "sharp"],
      [-0.075, 0.20],
    ],
    {
      at: [0, 1.84, -0.12],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      color: RED_CEL,
      bone: head,
      name: "helmet red crest",
    },
  );

  // Beard silhouette and moustache.
  b.sweep(
    catmull([
      [0, 1.68, 0.23],
      [0, 1.53, 0.245],
      [0, 1.35, 0.20],
      [0, 1.18, 0.10],
    ]),
    [0.20, 0.055],
    { color: BEARD, bone: jaw, section: "circle", sides: 7, name: "heroic beard" },
  );
  for (const s of [-1, 1]) {
    b.spike([s * 0.08, 1.67, 0.285], [s * 0.22, 1.61, 0.33], undefined, 0.06, {
      color: BEARD_LIGHT,
      bone: jaw,
      name: "moustache",
    });
    braid(b, s, jaw);
  }
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.045;
    b.spike([x, 1.40 - Math.abs(x) * 0.35, 0.22], [x * 1.18, 1.24 - Math.abs(x) * 0.25, 0.16], null, 0.032, {
      color: i % 2 ? BEARD_LIGHT : BEARD,
      bone: jaw,
      name: "beard tuft",
    });
  }

  // ---------------------------------------------------------------------------
  // Hammer in the right hand: leather grip, brass collars, steel head.
  // ---------------------------------------------------------------------------
  b.rod([-0.46, 1.04, 0.39], [-0.29, 1.29, 0.50], 0.027, {
    color: LEATHER,
    bone: armR.tip,
    name: "hammer handle",
  });
  cylinder(b, 0.035, 0.045, [-0.44, 1.07, 0.41], [0.55, 0.8, 0.25], BRASS, armR.tip, "hammer grip collar");
  cylinder(b, 0.035, 0.045, [-0.31, 1.26, 0.49], [0.55, 0.8, 0.25], BRASS, armR.tip, "hammer neck collar");
  box(b, [0.22, 0.13, 0.15], [-0.27, 1.36, 0.54], DARK_STEEL, armR.tip, "hammer head");
  box(b, [0.24, 0.035, 0.17], [-0.27, 1.43, 0.54], EDGE, armR.tip, "hammer top edge");
  cylinder(b, 0.055, 0.18, [-0.27, 1.36, 0.54], [1, 0, 0], STEEL, armR.tip, "hammer face");
  sphere(b, 0.035, [-0.38, 1.36, 0.54], EDGE, armR.tip, "hammer cheek");

  // ---------------------------------------------------------------------------
  // Anvil to the dwarf's left: horn, hardy hole, layered base and rivets.
  // ---------------------------------------------------------------------------
  const anvilBone = hips;
  box(b, [0.48, 0.14, 0.38], [0.70, 0.56, 0.38], IRON, anvilBone, "anvil base");
  box(b, [0.38, 0.12, 0.30], [0.70, 0.68, 0.38], IRON_HI, anvilBone, "anvil waist");
  box(b, [0.64, 0.13, 0.30], [0.70, 0.79, 0.38], STEEL, anvilBone, "anvil face");
  box(b, [0.58, 0.035, 0.27], [0.70, 0.865, 0.38], EDGE, anvilBone, "anvil polished face");
  b.spike([0.88, 0.84, 0.38], [1.25, 0.84, 0.38], null, 0.12, {
    color: STEEL,
    bone: anvilBone,
    name: "anvil horn",
  });
  cylinder(b, 0.045, 0.04, [0.57, 0.895, 0.38], [0, 1, 0], DARK_STEEL, anvilBone, "hardy hole");
  cylinder(b, 0.028, 0.045, [0.82, 0.895, 0.45], [0, 1, 0], DARK_STEEL, anvilBone, "pritchel hole");
  for (const x of [0.48, 0.92]) {
    sphere(b, 0.025, [x, 0.77, 0.21], BRASS_HI, anvilBone, "anvil rivet");
    sphere(b, 0.025, [x, 0.77, 0.55], BRASS_HI, anvilBone, "anvil rivet");
  }

  // ---------------------------------------------------------------------------
  // Compact forge behind him, with bellows, chimney stones and glowing coals.
  // ---------------------------------------------------------------------------
  box(b, [0.52, 0.36, 0.40], [-0.64, 0.28, -0.26], IRON, hips, "forge hearth");
  box(b, [0.58, 0.08, 0.46], [-0.64, 0.48, -0.26], DARK_STEEL, hips, "forge rim");
  box(b, [0.40, 0.08, 0.28], [-0.64, 0.55, -0.25], RED, hips, "coal bed");
  for (let i = 0; i < 9; i++) {
    const x = -0.78 + (i % 3) * 0.13;
    const z = -0.34 + Math.floor(i / 3) * 0.09;
    const ember = sphere(b, 0.035, [x, 0.615, z], i % 3 ? FIRE : FIRE_HOT, hips, "glowing coal");
    glow(ember, i % 3 ? 1.8 : 2.5);
  }
  box(b, [0.18, 0.55, 0.18], [-0.64, 0.86, -0.26], DARK_STEEL, hips, "forge chimney");
  box(b, [0.24, 0.08, 0.24], [-0.64, 1.16, -0.26], IRON, hips, "chimney cap");
  box(b, [0.44, 0.23, 0.18], [-0.98, 0.38, -0.22], LEATHER, hips, "bellows");
  box(b, [0.18, 0.08, 0.22], [-0.76, 0.38, -0.22], WOOD, hips, "bellows nozzle");
  b.rod([-1.20, 0.43, -0.22], [-0.98, 0.43, -0.22], 0.018, { color: WOOD, bone: hips, name: "bellows handle" });

  // Hanging tools and small blacksmith details.
  for (let i = 0; i < 4; i++) {
    const x = -0.92 + i * 0.18;
    cylinder(b, 0.012, 0.28, [x, 1.12, -0.62], [0, 1, 0], LEATHER_DARK, hips, "tool hanger");
    box(b, [0.07, 0.10, 0.045], [x, 0.94, -0.62], i % 2 ? STEEL : BRASS, hips, "hanging tool");
  }

  // A few crisp metal seams on the apron and armor make the silhouette read at distance.
  b.sweep(
    catmull([
      [-0.19, 1.31, 0.325],
      [-0.19, 1.10, 0.325],
      [-0.15, 1.00, 0.325],
    ]),
    0.009,
    { color: BRASS_HI, bone: spine.joints[1], name: "apron seamL" },
  );
  b.sweep(
    catmull([
      [0.19, 1.31, 0.325],
      [0.19, 1.10, 0.325],
      [0.15, 1.00, 0.325],
    ]),
    0.009,
    { color: BRASS_HI, bone: spine.joints[1], name: "apron seamR" },
  );

  return b.root;
}

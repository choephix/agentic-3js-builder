import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  countershade,
  gradient,
  svg,
} from "../../../../src/index";
import { cel, furEdge, INK, animeEye } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith at the Anvil",
  description:
    "A chunky Warcraft-style dwarf smith with braided beard, riveted apron, horned helmet, glowing forge runes, hammer, and a heavy low-poly anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const SKIN = cel("#c8875d", "#713f39");
  const SKIN_LIGHT = cel("#e0a176", "#8b4f43");
  const HAIR = cel("#342321", "#160f15");
  const HAIR_HI = cel("#5a382d", "#24161b");
  const RED = cel("#9d2f25", "#501b27");
  const TUNIC = furEdge(cel("#4b3030", "#251a27"), cel("#241f29", "#151522"), {
    level: -0.15,
    teeth: 0.12,
    period: 0.09,
    along: [1, 0, 0],
  });
  const LEATHER = cel("#633b25", "#2c1a1b");
  const LEATHER_LIGHT = cel("#92562c", "#472723");
  const APRON = cel("#263b45", "#12232e");
  const APRON_EDGE = cel("#b87936", "#573322");
  const BRASS = cel("#d39435", "#70411f");
  const BRASS_LIGHT = cel("#f1c05a", "#8c4c22");
  const STEEL = cel("#8796a0", "#394550");
  const STEEL_DARK = cel("#4a5663", "#202936");
  const IRON = cel("#242a32", "#11151d");
  const FIRE = "#ff7b22";
  const FIRE_HOT = "#ffe17a";
  const INK_DARK = "#1a1119";

  const rand = rng(17);

  const eyeTexture = animeEye({
    iris: "#7cbdce",
    irisLight: "#e8ffff",
    blush: false,
    brow: true,
    size: 256,
  });

  const runeTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="43" fill="#27131c" stroke="#f27b31" stroke-width="5"/>
      <path d="M50 12 L57 39 L84 50 L57 58 L50 88 L42 58 L16 50 L42 39 Z"
        fill="none" stroke="#ffd76a" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="8" fill="#fff0a0"/>
    </svg>`,
    { size: 192 },
  );

  const apronTexture = svg(
    `<svg viewBox="0 0 128 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="160" fill="#223641"/>
      <path d="M15 10H113M8 28H120M8 46H120M8 64H120M8 82H120M8 100H120M8 118H120M8 136H120M8 154H120"
        stroke="#3f5960" stroke-width="3"/>
      <path d="M18 0V160M38 0V160M58 0V160M78 0V160M98 0V160M118 0V160"
        stroke="#172832" stroke-width="3"/>
      <path d="M12 13 Q64 4 116 13" fill="none" stroke="#e2a54b" stroke-width="5"/>
      <path d="M17 150 Q64 158 111 150" fill="none" stroke="#e2a54b" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const hammerTexture = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="5" width="20" height="118" rx="8" fill="#9e5c2d"/>
      <path d="M23 15H41M23 35H41M23 55H41M23 75H41M23 95H41M23 115H41"
        stroke="#e0a04e" stroke-width="4"/>
      <circle cx="32" cy="18" r="5" fill="#26151a"/>
      <circle cx="32" cy="112" r="5" fill="#26151a"/>
    </svg>`,
    { size: 128 },
  );

  const hips = b.joint("hips", { at: [0, 0.78, 0], role: "spine" });
  const spinePath = catmull([
    [0, 0.78, 0],
    [0, 1.02, 0.01],
    [0, 1.28, 0.02],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["pelvis", "chest", "neckBase"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const neckBase = spine.tip!;
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.28, 0.02],
      [0, 1.39, 0.04],
      [0, 1.48, 0.07],
    ]),
    {
      parent: neckBase,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );
  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.51, 0.08],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.42, 0.18],
    dir: [0, 0.12, 1],
    role: "jaw",
    group: "face",
  });

  const shoulderL = b.joint("shoulderL", {
    parent: chest,
    at: [0.19, 1.21, 0.01],
    dir: [0.45, -0.05, 0.15],
    role: "arm",
  });
  const shoulderR = b.joint("shoulderR", {
    parent: chest,
    at: [-0.19, 1.21, 0.01],
    dir: [-0.45, -0.05, 0.15],
    role: "arm",
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.19, 1.21, 0.01],
      [0.34, 1.04, 0.08],
      [0.39, 0.86, 0.18],
      [0.38, 0.78, 0.27],
    ]),
    {
      parent: shoulderL,
      names: ["elbowL", "forearmL", "handL"],
      role: "arm",
    },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.19, 1.21, 0.01],
      [-0.34, 1.08, 0.08],
      [-0.43, 0.95, 0.23],
      [-0.49, 1.10, 0.36],
    ]),
    {
      parent: shoulderR,
      names: ["elbowR", "forearmR", "handR"],
      role: "arm",
    },
  );

  const legL = b.chain(
    "legL",
    polyline([
      [0.14, 0.75, 0],
      [0.18, 0.48, 0.01],
      [0.17, 0.22, 0.07],
      [0.17, 0.12, 0.18],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.17, 0, 0.2],
    },
  );
  const legR = b.chain(
    "legR",
    polyline([
      [-0.14, 0.75, 0],
      [-0.18, 0.48, 0.01],
      [-0.17, 0.22, 0.07],
      [-0.17, 0.12, 0.18],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.17, 0, 0.2],
    },
  );

  // Main body and limbs.
  b.sweep(spine, [0.25, 0.31, 0.27], {
    color: TUNIC,
    section: "box",
    sides: 8,
    caps: "round",
    name: "chunkyTunic",
    group: "body",
  });
  b.sweep(neck, [0.13, 0.15], {
    color: SKIN,
    section: { ngon: 7 },
    name: "neckFlesh",
  });
  b.sweep(armL, [0.105, 0.075], {
    color: TUNIC,
    section: { ngon: 6 },
    name: "sleeveL",
  });
  b.sweep(armR, [0.105, 0.075], {
    color: TUNIC,
    section: { ngon: 6 },
    name: "sleeveR",
  });
  b.sweep(legL, [0.13, 0.095], {
    color: LEATHER,
    section: { ngon: 6 },
    name: "trouserL",
  });
  b.sweep(legR, [0.13, 0.095], {
    color: LEATHER,
    section: { ngon: 6 },
    name: "trouserR",
  });

  b.part(new THREE.SphereGeometry(0.24, 10, 7), SKIN, {
    bone: head,
    at: [0, 1.55, 0.08],
    scale: [1, 0.96, 0.92],
    name: "broadHead",
    group: "head",
  });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), SKIN_LIGHT, {
    bone: jaw,
    at: [0, 1.43, 0.2],
    scale: [1.12, 0.68, 0.85],
    name: "squareJaw",
    group: "face",
  });

  // Ears, nose, eyes, brows.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 7, 5), SKIN_LIGHT, {
      bone: head,
      at: [s * 0.215, 1.56, 0.08],
      scale: [0.55, 1.15, 0.72],
      name: `ear${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.decal(head, eyeTexture, {
      at: [s * 0.092, 1.61, 0.285],
      dir: [0, 0.03, 1],
      up: [0, 1, 0],
      size: [0.105, 0.135],
      mirror: s > 0,
      lift: 0.004,
      name: `eyeDecal${s > 0 ? "L" : "R"}`,
      group: "face",
    });
    b.part(new THREE.CapsuleGeometry(0.018, 0.075, 4, 7), HAIR, {
      bone: head,
      at: [s * 0.105, 1.72, 0.24],
      dir: [s * 0.25, 0.08, -0.9],
      name: `brow${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  b.part(new THREE.ConeGeometry(0.09, 0.13, 7), SKIN_LIGHT, {
    bone: head,
    at: [0, 1.56, 0.285],
    dir: [0, -0.15, 1],
    name: "bulbousNose",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.035, 7, 5), INK_DARK, {
    bone: head,
    at: [-0.035, 1.545, 0.35],
    name: "nostrilL",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.035, 7, 5), INK_DARK, {
    bone: head,
    at: [0.035, 1.545, 0.35],
    name: "nostrilR",
    group: "face",
  });

  // Immense beard: central mass, cheek wedges, and three braids.
  b.part(new THREE.ConeGeometry(0.19, 0.34, 8), HAIR, {
    bone: jaw,
    at: [0, 1.30, 0.13],
    dir: [0, -1, 0.18],
    name: "beardMass",
    group: "beard",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.11, 0.25, 7), HAIR_HI, {
      bone: jaw,
      at: [s * 0.125, 1.39, 0.13],
      dir: [s * 0.35, -0.72, 0.15],
      name: `cheekBeard${s > 0 ? "L" : "R"}`,
      group: "beard",
    });
  }
  const braid = (side: number, z: number, name: string) => {
    const pts = [
      [side * 0.055, 1.34, z],
      [side * 0.065, 1.20, z + 0.015],
      [side * 0.055, 1.07, z + 0.02],
      [side * 0.04, 0.96, z + 0.03],
    ] as number[][];
    const c = b.chain(name, polyline(pts), {
      parent: jaw,
      names: [`${name}1`, `${name}2`, `${name}3`],
      role: "digit",
    });
    b.sweep(c, 0.043, {
      color: HAIR_HI,
      section: { ngon: 6 },
      bands: [
        [0.18, HAIR],
        [0.37, HAIR_HI],
        [0.56, HAIR],
        [0.75, HAIR_HI],
        [1, HAIR],
      ],
      name,
      group: "beard",
    });
    for (let i = 0; i < 3; i++) {
      const p = c.at((i + 0.35) / 3);
      b.part(new THREE.TorusGeometry(0.045, 0.008, 5, 8), BRASS, {
        bone: p.bone,
        at: p.at,
        dir: p.tangent,
        name: `${name}Band${i}`,
        group: "beard",
      });
    }
  };
  braid(1, 0.19, "braidL");
  braid(-1, 0.19, "braidR");
  braid(0.0, 0.25, "braidCenter");

  // Helmet bowl, rim, nose guard, horns and crest.
  b.part(
    new THREE.SphereGeometry(0.285, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    STEEL_DARK,
    {
      bone: head,
      at: [0, 1.66, 0.04],
      scale: [1.05, 0.68, 0.98],
      name: "helmetBowl",
      group: "helmet",
    },
  );
  b.part(new THREE.CylinderGeometry(0.29, 0.31, 0.055, 10), BRASS, {
    bone: head,
    at: [0, 1.58, 0.04],
    name: "helmetRim",
    group: "helmet",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.29, 0.16), BRASS_LIGHT, {
    bone: head,
    at: [0, 1.57, 0.275],
    name: "noseGuard",
    group: "helmet",
  });
  for (const s of [1, -1]) {
    const horn = b.sprout(
      `horn${s > 0 ? "L" : "R"}`,
      head.local([s * 0.22, 0.08, 0]),
      catmull([
        [s * 0.22, 1.72, 0],
        [s * 0.32, 1.78, -0.01],
        [s * 0.40, 1.72, -0.02],
        [s * 0.44, 1.62, 0.02],
      ]),
      [0.055, 0.008],
      {
        count: 0,
        color: BRASS_LIGHT,
        caps: { start: "round", end: "point" },
        group: "helmet",
      },
    );
    void horn;
  }
  b.part(
    new THREE.ConeGeometry(0.075, 0.21, 6),
    RED,
    {
      bone: head,
      at: [0, 1.88, -0.005],
      dir: [0, 1, 0],
      name: "helmetPlume",
      group: "helmet",
    },
  );

  // Belt, buckle, shoulder guards and apron.
  b.sweep(
    polyline([
      [-0.26, 0.91, 0],
      [-0.26, 0.91, 0.12],
      [0.26, 0.91, 0.12],
      [0.26, 0.91, 0],
      [-0.26, 0.91, 0],
    ], { closed: true }),
    0.035,
    { color: LEATHER_LIGHT, caps: "round", name: "belt", group: "costume" },
  );
  b.part(new THREE.BoxGeometry(0.13, 0.13, 0.045), BRASS_LIGHT, {
    bone: hips,
    at: [0, 0.91, 0.16],
    name: "beltBuckle",
    group: "costume",
  });
  b.part(new THREE.BoxGeometry(0.17, 0.17, 0.07), STEEL, {
    bone: chest,
    at: [0.23, 1.19, 0.02],
    dir: [0.3, 0.2, 1],
    name: "shoulderGuardL",
    group: "armor",
  });
  b.part(new THREE.BoxGeometry(0.17, 0.17, 0.07), STEEL, {
    bone: chest,
    at: [-0.23, 1.19, 0.02],
    dir: [-0.3, 0.2, 1],
    name: "shoulderGuardR",
    group: "armor",
  });
  b.part(new THREE.BoxGeometry(0.48, 0.58, 0.045), APRON, {
    bone: chest,
    at: [0, 0.99, 0.285],
    texture: apronTexture,
    scale: [1, 1, 1],
    name: "smithApron",
    group: "costume",
  });
  for (const x of [-0.20, 0.20]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.58, 6), APRON_EDGE, {
      bone: chest,
      at: [x, 1.0, 0.315],
      name: "apronEdge",
      group: "costume",
    });
  }
  for (const y of [0.83, 0.98, 1.13]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), BRASS_LIGHT, {
      bone: chest,
      at: [0, y, 0.325],
      name: "apronStud",
      group: "costume",
    });
  }

  // Hands and thick fingers.
  for (const s of [1, -1]) {
    const hand = (s > 0 ? armL.tip : armR.tip)!;
    b.part(new THREE.SphereGeometry(0.095, 8, 6), SKIN_LIGHT, {
      bone: hand,
      at: hand.at,
      scale: [1.1, 0.85, 1.1],
      name: `fist${s > 0 ? "L" : "R"}`,
      group: "hands",
    });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.CapsuleGeometry(0.018, 0.07, 4, 6), SKIN, {
        bone: hand,
        at: [hand.at.x + i * 0.025, hand.at.y - 0.015, hand.at.z + 0.07],
        dir: [0, -0.25, 1],
        name: `finger${s > 0 ? "L" : "R"}${i}`,
        group: "hands",
      });
    }
  }

  // Boots with broad soles.
  for (const s of [1, -1]) {
    const foot = (s > 0 ? legL.tip : legR.tip)!;
    b.part(new THREE.BoxGeometry(0.22, 0.16, 0.34), IRON, {
      bone: foot,
      at: [s * 0.17, 0.09, 0.17],
      name: `boot${s > 0 ? "L" : "R"}`,
      group: "boots",
    });
    b.part(new THREE.BoxGeometry(0.25, 0.035, 0.37), BRASS, {
      bone: foot,
      at: [s * 0.17, 0.012, 0.18],
      name: `bootSole${s > 0 ? "L" : "R"}`,
      group: "boots",
    });
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.20, 6), BRASS_LIGHT, {
      bone: foot,
      at: [s * 0.17, 0.1, 0.34],
      dir: [0, 0, 1],
      name: `bootToeRivet${s > 0 ? "L" : "R"}`,
      group: "boots",
    });
  }

  // Anvil: a clear hero prop in front of the dwarf.
  const anvilBase = [0, 0.23, 0.44] as const;
  b.part(new THREE.BoxGeometry(0.55, 0.18, 0.34), IRON, {
    bone: hips,
    at: [0, 0.25, 0.44],
    name: "anvilFoot",
    group: "anvil",
  });
  b.part(new THREE.BoxGeometry(0.31, 0.34, 0.22), STEEL_DARK, {
    bone: hips,
    at: [0, 0.48, 0.44],
    name: "anvilWaist",
    group: "anvil",
  });
  b.part(new THREE.BoxGeometry(0.68, 0.16, 0.34), STEEL, {
    bone: hips,
    at: [0, 0.72, 0.44],
    name: "anvilFace",
    group: "anvil",
  });
  b.part(new THREE.ConeGeometry(0.16, 0.34, 4), STEEL_DARK, {
    bone: hips,
    at: [0.43, 0.72, 0.44],
    dir: [1, 0, 0],
    name: "anvilHorn",
    group: "anvil",
  });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.18, 8), IRON, {
    bone: hips,
    at: [-0.16, 0.83, 0.44],
    name: "anvilHardyHole",
    group: "anvil",
  });
  const rune = b.part(new THREE.CircleGeometry(0.115, 16), FIRE, {
    bone: hips,
    at: [0, 0.808, 0.44],
    dir: [0, 1, 0],
    axis: "z",
    texture: runeTexture,
    name: "anvilRune",
    group: "anvil",
  });
  glow(rune, 1.5);
  b.part(new THREE.TorusGeometry(0.13, 0.012, 5, 12), BRASS_LIGHT, {
    bone: hips,
    at: [0, 0.815, 0.44],
    dir: [0, 1, 0],
    name: "anvilRuneRim",
    group: "anvil",
  });

  // Hammer held aloft in the dwarf's right hand, with a warm forge spark.
  b.part(new THREE.CylinderGeometry(0.035, 0.045, 0.62, 8), LEATHER_LIGHT, {
    bone: armR.tip,
    at: [-0.49, 1.35, 0.41],
    dir: [0.16, 0.96, 0.18],
    texture: hammerTexture,
    name: "hammerHandle",
    group: "hammer",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.19, 0.16), STEEL_DARK, {
    bone: armR.tip,
    at: [-0.39, 1.67, 0.48],
    dir: [0.16, 0.96, 0.18],
    name: "hammerHead",
    group: "hammer",
  });
  b.part(new THREE.BoxGeometry(0.31, 0.055, 0.21), STEEL, {
    bone: armR.tip,
    at: [-0.39, 1.72, 0.48],
    dir: [0.16, 0.96, 0.18],
    name: "hammerFace",
    group: "hammer",
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = [-0.08 + Math.cos(a) * 0.12, 0.87 + Math.sin(a) * 0.09, 0.45] as const;
    const spark = b.part(new THREE.SphereGeometry(0.018 + (i % 2) * 0.008, 6, 4), FIRE_HOT, {
      bone: hips,
      at: p,
      name: "forgeSpark",
      group: "forge",
    });
    glow(spark, 2.2);
  }

  // Small rivets and decorative studs keep the silhouette rich without losing the blocky puppet style.
  const studPositions = [
    [-0.24, 1.23, 0.09],
    [0.24, 1.23, 0.09],
    [-0.20, 0.76, 0.16],
    [0.20, 0.76, 0.16],
    [-0.27, 0.52, 0.09],
    [0.27, 0.52, 0.09],
  ];
  for (const p of studPositions) {
    b.part(new THREE.SphereGeometry(0.022, 6, 4), BRASS_LIGHT, {
      bone: chest,
      at: p,
      name: "armorStud",
      group: "details",
    });
  }

  // A few low-poly beard and helmet accent blades.
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.035, 0.16, 5), HAIR_HI, {
      bone: head,
      at: [s * 0.19, 1.40, 0.16],
      dir: [s * 0.35, -0.9, 0.15],
      name: "beardTuft",
      group: "beard",
    });
    b.part(new THREE.BoxGeometry(0.035, 0.12, 0.18), BRASS, {
      bone: head,
      at: [s * 0.255, 1.64, 0.03],
      dir: [s * 0.4, 0.2, 0.8],
      name: "helmetCheekPlate",
      group: "helmet",
    });
  }

  return b.root;
}

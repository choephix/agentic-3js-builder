```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  line,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";
import {
  animeEye,
  cel,
  furEdge,
  INK,
} from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dwarf Blacksmith at Anvil",
  description:
    "A stout, broad-shouldered Warcraft-inspired dwarf blacksmith with braided beard, horned helmet, leather apron, hammer, anvil, forge coals, tools, and warm forged-metal details.",
};

const STEEL = cel("#68727b", "#303943");
const DARK_STEEL = cel("#343b43", "#171b20");
const IRON = cel("#4b4b4a", "#242426");
const BRASS = cel("#d79b35", "#754219");
const GOLD = cel("#f1c85a", "#9b591e");
const LEATHER = cel("#713c23", "#321b17");
const LEATHER_LIT = cel("#a95e2e", "#4c231a");
const RED = cel("#bd3a26", "#5c1719");
const SKIN = cel("#d38c63", "#743f38");
const SKIN_LIGHT = cel("#efb080", "#8d4d3c");
const BEARD = cel("#463027", "#191619");
const HAIR = cel("#2d2422", "#111014");
const CREAM = cel("#e6c39a", "#8e624e");
const APRON = furEdge("#45352b", "#211a1a", {
  by: "position",
  axis: [0, 1, 0],
  level: 0.45,
  teeth: 0.035,
  period: 0.055,
  ink: INK,
  inkWidth: 0.004,
});
const FIRE = "#ff692b";
const FIRE_YELLOW = "#ffd15a";
const COAL = "#242126";

const eyeTex = animeEye({ iris: "#68d0c9", size: 384 });
const beardTex = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 2C10 8 8 27 13 45c3 13 7 30 19 47 12-17 16-34 19-47C56 27 54 8 32 2Z" fill="#ddd" stroke="#171217" stroke-width="5"/>
    <path d="M17 25Q32 35 47 25M14 38Q32 50 50 38M17 52Q32 63 47 52M22 66Q32 76 42 66" fill="none" stroke="#777" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);
const apronTex = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 8H118M8 25H120M6 43H122M5 61H123M4 79H124M3 97H125M2 115H126" stroke="#c99b58" stroke-width="3" opacity=".7"/>
    <path d="M18 0V128M39 0V128M60 0V128M81 0V128M102 0V128" stroke="#171313" stroke-width="2" opacity=".45"/>
    <path d="M31 30l12 10-12 10 12 10-12 10 12 10" fill="none" stroke="#e8bd68" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);
const emblemTex = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 8L60 36 91 38 67 56 75 87 50 69 25 87 33 56 9 38 40 36Z" fill="#f6c849" stroke="#291714" stroke-width="6"/>
    <circle cx="50" cy="48" r="11" fill="#a52c1e" stroke="#291714" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);
const fireTex = svg(
  `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
    <path d="M31 94C8 83 12 60 28 47c-4-14 8-27 12-39 15 22 25 36 13 53 7 14-4 28-22 33Z" fill="#ff7b21"/>
    <path d="M33 83C22 73 28 61 38 54c-2-8 3-13 7-19 8 17 8 28-1 37 2 7-3 11-11 11Z" fill="#ffe06a"/>
  </svg>`,
  { size: 128 },
);
const runeTex = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 77L38 18l44 62M28 53h39M56 18l-6 61M16 84h68" fill="none" stroke="#ffe8a0" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "dwarf-blacksmith", detail: 1 });

  // Skeleton first: compact, readable neutral pose.
  const pelvis = b.joint("pelvis", { at: [0, 0.82, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, 0],
      [0, 1.00, 0.01],
      [0, 1.18, 0.02],
      [0, 1.31, 0.04],
    ]),
    { parent: pelvis, names: ["waist", "chest", "neck"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.43, 0.08],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.365, 0.145],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "face",
  });

  const legs: any[] = [];
  const arms: any[] = [];
  for (const s of [1, -1]) {
    const hip = [s * 0.19, 0.79, 0.0] as [number, number, number];
    const foot = [s * 0.22, 0.12, 0.12] as [number, number, number];
    const lp = limb(hip, foot, [0.29, 0.27, 0.18], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, lp, {
      parent: pelvis,
      names: [s > 0 ? "hipL" : "hipR", s > 0 ? "kneeL" : "kneeR", s > 0 ? "ankleL" : "ankleR"],
      role: "leg",
      contact: foot,
    });
    legs.push(leg);

    const shoulder = [s * 0.28, 1.22, 0.04] as [number, number, number];
    const hand = [s * 0.47, 0.84, 0.27] as [number, number, number];
    const ap = limb(shoulder, hand, [0.25, 0.25, 0.22], [[0, 0, 1], [0, 0, 1]]);
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, ap, {
      parent: spine.joints[1],
      names: [s > 0 ? "shoulderL" : "shoulderR", s > 0 ? "elbowL" : "elbowR", s > 0 ? "handL" : "handR"],
      role: "arm",
    });
    arms.push(arm);
  }

  const bodyPaint = paint((p, n) => (p.y < 0.93 ? LEATHER : n.y > 0.35 ? "#72513b" : "#382720"));
  const body = b.sweep(spine, (t) => 0.25 - t * 0.045, {
    color: bodyPaint,
    section: "box",
    sides: 8,
    group: "body",
  });

  // Feet, legs, boots, and brass buckles.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const leg = legs[i];
    b.sweep(leg, [0.105, 0.08], {
      color: STEEL,
      section: "box",
      skin: "smooth",
      group: "legs",
    });
    b.part(new THREE.SphereGeometry(0.13, 8, 6), LEATHER, {
      bone: leg.tip,
      at: [s * 0.22, 0.105, 0.12],
      scale: [1.2, 0.7, 1.45],
      group: "boots",
    });
    b.part(new THREE.BoxGeometry(0.19, 0.045, 0.035), BRASS, {
      bone: leg.joints[1],
      at: [s * 0.21, 0.41, 0.065],
      group: "buckles",
    });
    for (const z of [0.07, 0.13, 0.19]) {
      b.part(new THREE.ConeGeometry(0.022, 0.075, 6), DARK_STEEL, {
        bone: leg.tip,
        at: [s * (0.17 + (z - 0.13) * 0.4), 0.13, z],
        dir: [0, 0, 1],
        group: "boot-rivets",
      });
    }
  }

  // Arms and chunky hands.
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const arm = arms[i];
    b.sweep(arm, [0.105, 0.075], {
      color: LEATHER_LIT,
      section: "box",
      group: "arms",
    });
    b.part(new THREE.SphereGeometry(0.105, 8, 6), SKIN, {
      bone: arm.tip,
      at: [s * 0.47, 0.84, 0.27],
      scale: [1.05, 0.82, 0.9],
      group: "hands",
    });
    for (let j = -1; j <= 1; j++) {
      const p = [s * (0.47 + j * 0.032), 0.81, 0.34] as [number, number, number];
      b.part(new THREE.CapsuleGeometry(0.016, 0.065, 4, 6), SKIN_LIGHT, {
        bone: arm.tip,
        at: p,
        dir: [0, 0, 1],
        group: "fingers",
      });
    }
    b.part(new THREE.TorusGeometry(0.11, 0.018, 6, 10), BRASS, {
      bone: arm.joints[0],
      at: [s * 0.29, 1.19, 0.04],
      rotation: [0, 0, 90],
      group: "arm-rings",
    });
  }

  // Head, ears, nose, brows, eyes, jaw.
  const skull = b.part(new THREE.SphereGeometry(0.245, 12, 9), SKIN, {
    bone: head,
    at: [0, 1.43, 0.08],
    scale: [1.03, 0.96, 0.95],
    group: "face",
  });
  const face = b.surface(skull);
  for (const s of [1, -1]) {
    const cheek = face.around([0, 1.43, 0.08]).at(s * 42, 2)!;
    b.stick(new THREE.SphereGeometry(0.1, 8, 6), SKIN_LIGHT, cheek, {
      embed: 0.45,
      scale: [1, 0.85, 0.7],
      group: "cheeks",
    });
    const eye = face.around([0, 1.43, 0.08]).at(s * 27, 8)!;
    b.decal(face, eyeTex, {
      at: eye,
      size: [0.095, 0.13],
      mirror: s > 0,
      lift: 0.004,
      group: "eyes",
    });
    b.part(new THREE.CapsuleGeometry(0.018, 0.1, 4, 6), HAIR, {
      bone: head,
      at: [s * 0.19, 1.52, 0.12],
      rotation: [0, s * 22, s * 12],
      group: "brows",
    });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), SKIN_LIGHT, {
      bone: head,
      at: [s * 0.07, 1.405, 0.294],
      scale: [0.8, 0.65, 0.75],
      group: "nose",
    });
    b.part(new THREE.CapsuleGeometry(0.018, 0.07, 4, 6), INK, {
      bone: head,
      at: [s * 0.055, 1.392, 0.349],
      dir: [0, 0, 1],
      group: "nostrils",
    });
    b.part(new THREE.SphereGeometry(0.085, 8, 5), SKIN, {
      bone: head,
      at: [s * 0.245, 1.43, 0.06],
      scale: [0.55, 1, 0.7],
      group: "ears",
    });
  }

  // Moustache, enormous braided beard, and beard ornaments.
  b.sweep(catmull([
    [-0.02, 1.38, 0.31],
    [-0.10, 1.365, 0.35],
    [-0.19, 1.39, 0.30],
  ]), [0.038, 0.012], { bone: jaw, color: BEARD, caps: "round", group: "moustache" });
  b.sweep(catmull([
    [0.02, 1.38, 0.31],
    [0.10, 1.365, 0.35],
    [0.19, 1.39, 0.30],
  ]), [0.038, 0.012], { bone: jaw, color: BEARD, caps: "round", group: "moustache" });
  const beard = b.sweep(catmull([
    [0, 1.35, 0.27],
    [0, 1.20, 0.30],
    [0, 1.02, 0.24],
    [0, 0.91, 0.16],
  ]), [0.19, 0.14, 0.09, 0.025], {
    bone: jaw,
    color: BEARD,
    section: { ngon: 7 },
    group: "beard",
  });
  for (const s of [1, -1]) {
    const braid = b.sweep(catmull([
      [s * 0.105, 1.28, 0.29],
      [s * 0.15, 1.18, 0.31],
      [s * 0.145, 1.06, 0.27],
      [s * 0.10, 0.96, 0.20],
    ]), [0.045, 0.035, 0.025, 0.008], {
      bone: jaw,
      color: CREAM,
      group: "braids",
    });
    for (const t of [0.22, 0.48, 0.74]) {
      const q = braid.at(t);
      b.stick(new THREE.TorusGeometry(0.043, 0.009, 5, 8), GOLD, q, {
        embed: 0.5,
        group: "braid-bands",
      });
    }
  }
  b.stick(new THREE.ConeGeometry(0.055, 0.13, 7), GOLD, beard.at(1), {
    embed: 0.3,
    group: "beard-cap",
  });

  // Horned iron helmet and crest.
  b.part(new THREE.SphereGeometry(0.27, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.58), DARK_STEEL, {
    bone: head,
    at: [0, 1.48, 0.04],
    scale: [1.08, 0.82, 1.02],
    group: "helmet",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.24, 0.43), STEEL, {
    bone: head,
    at: [0, 1.53, 0.02],
    group: "helmet-ridge",
  });
  for (const s of [1, -1]) {
    b.sweep(catmull([
      [s * 0.19, 1.55, 0.01],
      [s * 0.30, 1.65, -0.01],
      [s * 0.34, 1.77, 0.05],
    ]), [0.055, 0.035, 0.008], {
      bone: head,
      color: CREAM,
      caps: { end: "point", start: "round" },
      group: "horns",
    });
    b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, {
      bone: head,
      at: [s * 0.23, 1.59, 0.10],
      group: "helmet-rivets",
    });
  }

  // Belt, apron, shoulder plates.
  b.sweep(catmull([
    [-0.24, 1.02, 0.03],
    [0, 1.00, 0.25],
    [0.24, 1.02, 0.03],
  ]), 0.035, { bone: pelvis, color: LEATHER, group: "belt" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.035, 0.15), GOLD, {
      bone: pelvis,
      at: [s * 0.20, 1.01, 0.235],
      group: "belt-buckles",
    });
    b.part(new THREE.SphereGeometry(0.10, 8, 5), STEEL, {
      bone: spine.joints[1],
      at: [s * 0.29, 1.22, 0.04],
      scale: [1.2, 0.42, 1.1],
      group: "shoulder-plates",
    });
  }
  b.part(new THREE.BoxGeometry(0.43, 0.45, 0.035), APRON, {
    bone: pelvis,
    at: [0, 1.00, 0.247],
    texture: apronTex,
    group: "apron",
  });
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", {
    bone: pelvis,
    at: [0, 1.12, 0.269],
    dir: [0, 0, 1],
    axis: "z",
    texture: emblemTex,
    group: "apron-emblem",
  });
  for (const x of [-0.14, 0.14]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 6), GOLD, {
      bone: pelvis,
      at: [x, 0.88, 0.275],
      rotation: [90, 0, 0],
      group: "apron-tools",
    });
  }

  // Anvil: blocky base, waist, face, horn and decorative rivets.
  const anvilBone = pelvis;
  b.part(new THREE.BoxGeometry(0.48, 0.17, 0.36), IRON, {
    bone: anvilBone,
    at: [0, 0.53, 0.50],
    group: "anvil",
  });
  b.part(new THREE.BoxGeometry(0.28, 0.33, 0.22), DARK_STEEL, {
    bone: anvilBone,
    at: [0, 0.32, 0.50],
    group: "anvil",
  });
  b.part(new THREE.BoxGeometry(0.54, 0.09, 0.42), STEEL, {
    bone: anvilBone,
    at: [0, 0.66, 0.50],
    group: "anvil-face",
  });
  b.sweep(catmull([
    [0, 0.67, 0.68],
    [0, 0.67, 0.82],
    [0, 0.67, 0.98],
  ]), [0.10, 0.045, 0.004], {
    bone: anvilBone,
    color: STEEL,
    group: "anvil-horn",
    caps: { end: "point", start: "flat" },
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, {
      bone: anvilBone,
      at: [s * 0.22, 0.65, 0.50],
      group: "anvil-rivets",
    });
  }

  // Hammer held over the anvil: wooden haft, steel head, brass cap.
  const hammerPath = catmull([
    [0.47, 0.84, 0.29],
    [0.54, 1.04, 0.38],
    [0.58, 1.27, 0.47],
  ]);
  b.sweep(hammerPath, [0.028, 0.025], {
    bone: arms[0].tip,
    color: LEATHER_LIT,
    group: "hammer-haft",
  });
  b.part(new THREE.BoxGeometry(0.30, 0.15, 0.18), STEEL, {
    bone: arms[0].tip,
    at: [0.58, 1.34, 0.49],
    group: "hammer-head",
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.20, 8), GOLD, {
    bone: arms[0].tip,
    at: [0.58, 1.34, 0.49],
    rotation: [0, 0, 90],
    group: "hammer-band",
  });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), GOLD, {
    bone: arms[0].tip,
    at: [0.58, 1.20, 0.45],
    group: "hammer-pommel",
  });

  // Compact forge behind the anvil, with glowing coals and a chimney.
  b.part(new THREE.BoxGeometry(0.72, 0.38, 0.44), DARK_STEEL, {
    bone: pelvis,
    at: [0, 0.25, -0.36],
    group: "forge",
  });
  b.part(new THREE.BoxGeometry(0.56, 0.08, 0.34), IRON, {
    bone: pelvis,
    at: [0, 0.47, -0.34],
    group: "forge-rim",
  });
  for (const x of [-0.18, -0.06, 0.07, 0.19]) {
    const coal = b.part(new THREE.IcosahedronGeometry(0.055, 0), COAL, {
      bone: pelvis,
      at: [x, 0.52, -0.34 + (Math.abs(x) * 0.3)],
      group: "coals",
    });
    glow(coal, 0.35);
  }
  const flame = b.part(new THREE.PlaneGeometry(0.25, 0.30), FIRE, {
    bone: pelvis,
    at: [0, 0.68, -0.34],
    dir: [0, 0, 1],
    axis: "z",
    texture: fireTex,
    group: "forge-flame",
  });
  glow(flame, 2.2);
  b.part(new THREE.CylinderGeometry(0.19, 0.24, 0.48, 8), IRON, {
    bone: pelvis,
    at: [0, 0.91, -0.36],
    group: "chimney",
  });
  b.part(new THREE.TorusGeometry(0.20, 0.025, 6, 10), GOLD, {
    bone: pelvis,
    at: [0, 1.14, -0.36],
    rotation: [90, 0, 0],
    group: "chimney-rim",
  });

  // Tool rack and hanging tongs.
  b.part(new THREE.BoxGeometry(0.78, 0.07, 0.07), LEATHER, {
    bone: pelvis,
    at: [0, 0.91, -0.67],
    group: "tool-rack",
  });
  for (const x of [-0.29, -0.15, 0, 0.15, 0.29]) {
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 6), GOLD, {
      bone: pelvis,
      at: [x, 0.79, -0.67],
      group: "rack-hooks",
    });
  }
  b.sweep(catmull([
    [-0.24, 0.82, -0.67],
    [-0.24, 0.64, -0.67],
    [-0.17, 0.53, -0.64],
  ]), 0.018, { bone: pelvis, color: STEEL, group: "tongs" });
  b.sweep(catmull([
    [0.16, 0.82, -0.67],
    [0.16, 0.65, -0.67],
    [0.24, 0.53, -0.64],
  ]), 0.016, { bone: pelvis, color: BRASS, group: "poker" });

  // Runes on the anvil and tiny forge sparks.
  const rune = b.part(new THREE.PlaneGeometry(0.20, 0.13), "#fff5b8", {
    bone: pelvis,
    at: [0, 0.712, 0.50],
    dir: [0, 1, 0],
    axis: "z",
    texture: runeTex,
    group: "anvil-rune",
  });
  glow(rune, 0.8);
  for (const p of [
    [0.18, 0.78, 0.48],
    [-0.12, 0.84, 0.54],
    [0.07, 0.92, 0.43],
    [-0.20, 0.72, 0.42],
    [0.24, 0.88, 0.58],
  ] as [number, number, number][]) {
    const spark = b.part(new THREE.OctahedronGeometry(0.012, 0), FIRE_YELLOW, {
      bone: pelvis,
      at: p,
      group: "sparks",
    });
    glow(spark, 2.5);
  }

  // A few broad angular fur/hair tufts on the back of the helmet and beard.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.ConeGeometry(0.025, 0.13 + i * 0.012, 5), HAIR, {
        bone: head,
        at: [s * (0.18 + i * 0.025), 1.52 - i * 0.045, -0.13],
        rotation: [s * 18, 0, s * 12],
        group: "hair-tufts",
      });
    }
  }

  // Ensure a clearly grounded silhouette with little floor-contact iron feet.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.27, 0.035, 0.34), DARK_STEEL, {
      bone: pelvis,
      at: [s * 0.36, 0.018, -0.36],
      group: "forge-feet",
    });
  }

  return b.root;
}
```
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  line,
  rng,
  paint,
  countershade,
  gradient,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a braided beard, horned helmet, leather apron, hammer, and a riveted anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const SKIN = cel("#d28b55", "#8d4c36");
  const SKIN_LIGHT = cel("#f0b477", "#aa6044");
  const BEARD = cel("#473329", "#211b1d");
  const BEARD_TIP = cel("#76503b", "#342329");
  const HAIR = cel("#33262a", "#17151b");
  const HELMET = cel("#43515c", "#202832");
  const HELMET_EDGE = cel("#a8894d", "#654c2f");
  const LEATHER = cel("#633c29", "#302027");
  const APRON = furEdge("#252b31", "#10151c", {
    axis: [0, 1, 0],
    by: "position",
    level: 0.88,
    teeth: 0.025,
    period: 0.045,
    ink: "#111017",
    inkWidth: 0.006,
  });
  const TROUSER = cel("#303b4a", "#171d2b");
  const BOOT = cel("#34251f", "#171319");
  const IRON = cel("#525861", "#252a31");
  const IRON_EDGE = cel("#aeb2ae", "#555d61");
  const BRASS = cel("#d19b43", "#744723");
  const EMBER = "#ff7a24";
  const HAMMER_HEAD = cel("#66727a", "#252d36");

  const eyeTexture = animeEye({
    iris: "#55b9d2",
    irisLight: "#caeff1",
    irisDark: "#244a73",
    ink: INK,
    blush: "#d96558",
    size: 384,
  });

  const runeTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="18" fill="#171b22"/>
      <path d="M64 14 L77 44 L108 49 L84 70 L90 105 L64 88 L38 105 L44 70 L20 49 L51 44 Z"
        fill="none" stroke="#ffc46a" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="64" cy="61" r="10" fill="#ff7b28"/>
    </svg>`,
    { size: 192 },
  );

  // -------------------- skeleton --------------------

  const hips = b.joint("hips", {
    at: [0, 0.83, 0],
    dir: [0, 0.35, 0.05],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.83, 0],
      [0, 1.05, 0.015],
      [0, 1.28, 0.02],
      [0, 1.43, 0.06],
    ]),
    { parent: hips, names: ["pelvis", "waist", "chest", "shoulder"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.06],
      [0, 1.52, 0.075],
      [0, 1.59, 0.09],
    ]),
    { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.63, 0.105],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.555, 0.22],
    dir: [0, -0.02, 0.6],
    role: "jaw",
    group: "head",
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.23, 1.39, 0.05],
      [0.38, 1.28, 0.08],
      [0.48, 1.08, 0.15],
      [0.42, 0.94, 0.31],
    ]),
    { parent: spine.tip, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.23, 1.39, 0.05],
      [-0.37, 1.27, 0.09],
      [-0.46, 1.07, 0.16],
      [-0.38, 0.95, 0.31],
    ]),
    { parent: spine.tip, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  const legL = b.chain(
    "legL",
    catmull([
      [0.15, 0.79, 0],
      [0.19, 0.53, 0.035],
      [0.18, 0.24, 0.08],
      [0.2, 0.105, 0.18],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.2, 0, 0.18],
    },
  );
  const legR = b.chain(
    "legR",
    catmull([
      [-0.15, 0.79, 0],
      [-0.19, 0.53, 0.035],
      [-0.18, 0.24, 0.08],
      [-0.2, 0.105, 0.18],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.2, 0, 0.18],
    },
  );

  // -------------------- body --------------------

  const coat = countershade(
    paint((p, n) => (p.y < 0.99 ? "#b7653e" : "#d58a4b")),
    "#f3bd82",
    { level: -0.15, soft: 0.3 },
  );

  b.sweep(spine, (t) => 0.22 - t * 0.035, {
    color: coat,
    section: "box",
    sides: 8,
    caps: "round",
    group: "body",
  });

  b.sweep(neck, [0.16, 0.13], {
    color: SKIN,
    section: "circle",
    sides: 8,
    group: "body",
  });

  b.part(new THREE.SphereGeometry(0.22, 12, 8), SKIN, {
    bone: head,
    at: [0, 1.62, 0.12],
    scale: [1.0, 1.02, 1.05],
    group: "head",
    name: "broadHead",
  });

  // nose, ears, cheeks
  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN_LIGHT, {
    bone: head,
    at: [0, 1.58, 0.315],
    scale: [1.15, 0.72, 0.9],
    group: "face",
    name: "squareNose",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.105, 8, 6), SKIN, {
      bone: head,
      at: [s * 0.205, 1.68, 0.09],
      scale: [0.65, 1.0, 0.72],
      group: "face",
      name: `ear${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN_LIGHT, {
      bone: head,
      at: [s * 0.19, 1.61, 0.245],
      scale: [0.72, 0.75, 0.8],
      group: "face",
      name: `cheek${s > 0 ? "L" : "R"}`,
    });
  }

  // Eyes are deliberately oversized and close to the front.
  const faceSurface = b.surface(b.root);
  for (const s of [1, -1]) {
    b.decal(b.root, eyeTexture, {
      bone: head,
      at: [s * 0.095, 1.67, 0.318],
      dir: [0, 0.08, 1],
      up: [0, 1, 0],
      size: [0.105, 0.14],
      mirror: s > 0,
      lift: 0.006,
      name: `eye${s > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Separate lower jaw and a dark open mouth slit.
  b.part(new THREE.SphereGeometry(0.16, 10, 6), SKIN, {
    bone: jaw,
    at: [0, 1.535, 0.235],
    scale: [1.12, 0.5, 0.9],
    group: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.17, 0.035, 0.012), INK, {
    bone: jaw,
    at: [0, 1.565, 0.318],
    group: "jaw",
    name: "mouthOpening",
  });

  // Beard: broad silhouette plus hanging braids.
  b.sweep(
    catmull([
      [0, 1.57, 0.27],
      [0, 1.47, 0.30],
      [0, 1.34, 0.27],
      [0, 1.22, 0.18],
    ]),
    [0.19, 0.11],
    { bone: jaw, color: BEARD, section: "box", sides: 8, group: "beard" },
  );
  for (const s of [1, -1]) {
    const braid = catmull([
      [s * 0.105, 1.48, 0.29],
      [s * 0.14, 1.36, 0.31],
      [s * 0.145, 1.22, 0.28],
      [s * 0.12, 1.12, 0.21],
    ]);
    b.sweep(braid, [0.045, 0.018], {
      bone: jaw,
      color: BEARD_TIP,
      section: "circle",
      sides: 6,
      group: "beard",
    });
    for (let i = 0; i < 4; i++) {
      const t = 0.12 + i * 0.24;
      const p = braid.at(t);
      b.part(new THREE.TorusGeometry(0.043, 0.008, 5, 8), BRASS, {
        bone: jaw,
        at: p,
        dir: braid.tangentAt(t),
        group: "beard",
        name: `beardBand${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // -------------------- helmet --------------------

  b.part(new THREE.CylinderGeometry(0.245, 0.265, 0.075, 10), HELMET_EDGE, {
    bone: head,
    at: [0, 1.79, 0.07],
    group: "helmet",
    name: "helmetBrim",
  });
  b.part(new THREE.SphereGeometry(0.245, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58), HELMET, {
    bone: head,
    at: [0, 1.78, 0.055],
    group: "helmet",
    name: "helmetDome",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.052, 0.19, 6), HELMET_EDGE, {
      bone: head,
      at: [s * 0.19, 1.82, 0.015],
      dir: [s * 0.22, 0.45, -0.08],
      group: "helmet",
      name: `helmetHorn${s > 0 ? "L" : "R"}`,
    });
  }
  b.part(new THREE.BoxGeometry(0.035, 0.15, 0.012), BRASS, {
    bone: head,
    at: [0, 1.78, 0.285],
    group: "helmet",
    name: "helmetNoseGuard",
  });

  // -------------------- torso clothing --------------------

  b.part(new THREE.BoxGeometry(0.37, 0.43, 0.26), APRON, {
    bone: spine.joints[1],
    at: [0, 1.19, 0.17],
    group: "clothing",
    name: "leatherApron",
  });
  b.part(new THREE.BoxGeometry(0.41, 0.045, 0.29), LEATHER, {
    bone: spine.joints[1],
    at: [0, 1.39, 0.05],
    group: "clothing",
    name: "apronStrap",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.39, 6), BRASS, {
      bone: spine.joints[1],
      at: [s * 0.15, 1.2, 0.305],
      dir: [0, 0, 1],
      group: "clothing",
      name: `apronStitch${s > 0 ? "L" : "R"}`,
    });
  }

  // -------------------- arms and hands --------------------

  b.sweep(armL, [0.095, 0.065], { color: SKIN, section: "box", group: "arms" });
  b.sweep(armR, [0.095, 0.065], { color: SKIN, section: "box", group: "arms" });
  for (const [s, arm] of [
    [1, armL],
    [-1, armR],
  ] as const) {
    b.part(new THREE.SphereGeometry(0.09, 8, 6), SKIN_LIGHT, {
      bone: arm.tip,
      at: arm.tip.at,
      scale: [1.1, 0.8, 1.2],
      group: "hands",
      name: `fist${s > 0 ? "L" : "R"}`,
    });
    for (let i = -1; i <= 1; i++) {
      const p = arm.tip.local([i * 0.035, 0.035, 0.09]);
      b.part(new THREE.SphereGeometry(0.027, 6, 4), SKIN_LIGHT, {
        bone: arm.tip,
        at: p,
        group: "hands",
        name: `finger${s > 0 ? "L" : "R"}${i + 1}`,
      });
    }
  }

  // -------------------- legs and boots --------------------

  b.sweep(legL, [0.12, 0.09], { color: TROUSER, section: "box", group: "legs" });
  b.sweep(legR, [0.12, 0.09], { color: TROUSER, section: "box", group: "legs" });
  for (const [s, leg] of [
    [1, legL],
    [-1, legR],
  ] as const) {
    b.part(new THREE.BoxGeometry(0.22, 0.15, 0.34), BOOT, {
      bone: leg.tip,
      at: [s * 0.2, 0.105, 0.2],
      group: "boots",
      name: `boot${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.23, 0.035, 0.36), HELMET_EDGE, {
      bone: leg.tip,
      at: [s * 0.2, 0.18, 0.205],
      group: "boots",
      name: `bootRim${s > 0 ? "L" : "R"}`,
    });
  }

  // -------------------- anvil --------------------

  const anvil = b.joint("anvil", {
    at: [0.68, 0.02, 0.36],
    dir: [0, 1, 0],
    role: "hinge",
    group: "prop",
  });

  b.part(new THREE.BoxGeometry(0.55, 0.1, 0.25), IRON, {
    bone: anvil,
    at: [0.68, 0.92, 0.36],
    group: "anvil",
    name: "anvilFace",
  });
  b.part(new THREE.BoxGeometry(0.36, 0.22, 0.18), IRON, {
    bone: anvil,
    at: [0.68, 0.76, 0.36],
    group: "anvil",
    name: "anvilWaist",
  });
  b.part(new THREE.BoxGeometry(0.58, 0.12, 0.34), IRON, {
    bone: anvil,
    at: [0.68, 0.59, 0.36],
    group: "anvil",
    name: "anvilFoot",
  });
  b.part(new THREE.ConeGeometry(0.17, 0.28, 4), IRON_EDGE, {
    bone: anvil,
    at: [0.98, 0.89, 0.36],
    dir: [1, 0, 0],
    group: "anvil",
    name: "anvilHorn",
  });
  b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 8), EMBER, {
    bone: anvil,
    at: [0.58, 0.982, 0.36],
    dir: [0, 1, 0],
    group: "anvil",
    name: "hotWorkPiece",
  });

  // Hammer held diagonally above the anvil.
  const hammerLine = line([0.42, 1.06, 0.34], [0.7, 1.52, 0.22]);
  b.rod(hammerLine.at, hammerLine.end, 0.025, LEATHER, {
    bone: armL.tip,
    caps: "round",
    group: "hammer",
  });
  b.part(new THREE.BoxGeometry(0.25, 0.14, 0.14), HAMMER_HEAD, {
    bone: armL.tip,
    at: [0.7, 1.52, 0.22],
    dir: hammerLine.tangentAt(1),
    group: "hammer",
    name: "hammerHead",
  });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.17, 8), BRASS, {
    bone: armL.tip,
    at: [0.7, 1.52, 0.22],
    dir: hammerLine.tangentAt(1),
    group: "hammer",
    name: "hammerBand",
  });

  // A small engraved maker's emblem on the apron.
  b.part(new THREE.PlaneGeometry(0.11, 0.11), "#ffffff", {
    bone: spine.joints[1],
    at: [0, 1.17, 0.305],
    dir: [0, 0, 1],
    axis: "z",
    texture: runeTexture,
    group: "clothing",
    name: "apronRune",
  });

  return b.root;
}

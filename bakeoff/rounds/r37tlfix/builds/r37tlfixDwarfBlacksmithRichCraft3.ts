import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
  svg,
} from "../../../../src/index";
import {
  animeEye,
  cel,
  furEdge,
  INK,
} from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description:
    "A chunky Warcraft-inspired dwarf smith with a braided beard, horned helmet, leather apron, hammer, and a riveted anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf_blacksmith", detail: 1 });

  const SKIN = cel("#d99562", "#8b493b");
  const SKIN_LIGHT = cel("#f0b47a", "#a95b43");
  const HAIR = cel("#30201d", "#120f16");
  const BEARD = furEdge(HAIR, "#171016", {
    level: 0.12,
    teeth: 0.12,
    period: 0.045,
    along: [1, 0, 0],
    ink: "#0b0910",
    inkWidth: 0.025,
  });
  const RED = cel("#a9362d", "#551e29");
  const LEATHER = cel("#6e3526", "#321b20");
  const APRON = cel("#253e4b", "#15212e");
  const BRASS = cel("#e0a83c", "#765021");
  const STEEL = cel("#8793a1", "#343b4a");
  const DARK_STEEL = cel("#424c5c", "#171d2b");
  const WOOD = cel("#77432e", "#351e22");
  const EYE = animeEye({ iris: "#4ed0d8", brow: true, blush: false });

  const box = (w: number, h: number, d: number) =>
    new THREE.BoxGeometry(w, h, d);
  const sphere = (r: number, ws = 10, hs = 7) =>
    new THREE.SphereGeometry(r, ws, hs);
  const cyl = (r: number, h: number, sides = 8) =>
    new THREE.CylinderGeometry(r, r, h, sides);
  const cone = (r: number, h: number, sides = 8) =>
    new THREE.ConeGeometry(r, h, sides);

  // ------------------------------------------------------------------------------------------
  // Skeleton first: one compact spine, broad shoulders, two planted legs, and articulated arms.
  // ------------------------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.78, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, 0],
      [0, 1.02, 0.01],
      [0, 1.25, 0.02],
      [0, 1.43, 0.04],
    ]),
    {
      parent: hips,
      names: ["waist", "chest", "neck"],
      role: "spine",
    },
  );

  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 1.48, 0.07],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 0.18],
    dir: [0, 0.08, 1],
    role: "jaw",
    group: "face",
  });

  const legL = b.chain(
    "legL",
    limb([0.19, 0.76, 0], [0.2, 0.12, 0.04], [0.28, 0.28, 0.18], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL"],
      role: "leg",
      contact: [0.2, 0, 0.04],
    },
  );

  const legR = b.chain(
    "legR",
    limb([-0.19, 0.76, 0], [-0.2, 0.12, 0.04], [0.28, 0.28, 0.18], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR"],
      role: "leg",
      contact: [-0.2, 0, 0.04],
    },
  );

  const armL = b.chain(
    "armL",
    limb([0.31, 1.28, 0.01], [0.52, 0.86, 0.27], [0.23, 0.27], [
      [0, 0, 1],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderL", "elbowL", "handL"],
      role: "arm",
    },
  );

  const armR = b.chain(
    "armR",
    limb([-0.31, 1.28, 0.01], [-0.48, 0.91, 0.3], [0.23, 0.27], [
      [0, 0, 1],
    ]),
    {
      parent: spine.joints[1],
      names: ["shoulderR", "elbowR", "handR"],
      role: "arm",
    },
  );

  // ------------------------------------------------------------------------------------------
  // Body, boots, and clothing silhouette.
  // ------------------------------------------------------------------------------------------

  const torsoPath = catmull([
    [0, 0.76, 0],
    [0, 0.98, 0.01],
    [0, 1.22, 0.035],
    [0, 1.39, 0.05],
  ]);

  const torso = b.sweep(torsoPath, (t) => 0.24 + 0.08 * t, {
    bone: spine,
    color: furEdge(APRON, RED, {
      by: "position",
      axis: [0, 0, 1],
      level: 0.17,
      teeth: 0.04,
      period: 0.09,
      along: [1, 0, 0],
    }),
    section: "box",
    sides: 8,
    caps: "round",
    name: "broad_apron_torso",
    group: "body",
  });

  b.part(box(0.52, 0.09, 0.42), LEATHER, {
    bone: hips,
    at: [0, 0.81, -0.015],
    name: "belt",
    group: "clothing",
  });

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    b.sweep(leg, [0.115, 0.095], {
      color: RED,
      section: "box",
      caps: "round",
      name: s > 0 ? "trouserL" : "trouserR",
      group: "clothing",
    });
    b.part(sphere(0.14, 8, 6), DARK_STEEL, {
      bone: leg.tip,
      at: s > 0 ? [0.2, 0.11, 0.055] : [-0.2, 0.11, 0.055],
      scale: [1.2, 0.7, 1.55],
      name: s > 0 ? "iron_bootL" : "iron_bootR",
      group: "boots",
    });
    b.part(box(0.17, 0.035, 0.22), STEEL, {
      bone: leg.tip,
      at: s > 0 ? [0.2, 0.16, 0.16] : [-0.2, 0.16, 0.16],
      name: s > 0 ? "boot_toeL" : "boot_toeR",
      group: "boots",
    });
  }

  // Apron front, heavy bib, and neck ring.
  b.part(box(0.42, 0.55, 0.035), APRON, {
    bone: spine.joints[1],
    at: [0, 1.08, 0.255],
    name: "smith_apron",
    group: "clothing",
  });
  b.part(box(0.46, 0.045, 0.05), BRASS, {
    bone: hips,
    at: [0, 0.86, 0.265],
    name: "apron_belt_plate",
    group: "clothing",
  });
  b.part(cyl(0.25, 0.065, 12), LEATHER, {
    bone: spine.tip,
    at: [0, 1.38, 0.04],
    dir: [0, 1, 0],
    name: "neck_collar",
    group: "clothing",
  });

  // Rivets and belt studs.
  for (const x of [-0.2, -0.1, 0, 0.1, 0.2]) {
    b.part(sphere(0.018, 6, 4), BRASS, {
      bone: hips,
      at: [x, 0.86, 0.292],
      name: "belt_rivet",
      group: "rivets",
    });
  }

  // ------------------------------------------------------------------------------------------
  // Head and face: settle this before the helmet, beard, and accessories.
  // ------------------------------------------------------------------------------------------

  const skull = b.part(sphere(0.265, 12, 9), SKIN, {
    bone: head,
    at: [0, 1.51, 0.09],
    scale: [1.05, 0.98, 0.96],
    name: "dwarf_skull",
    group: "face",
  });

  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = faceSurface.around([0, 1.51, 0.09]).at(s * 38, 4);
    if (hit) {
      b.decal(faceSurface, EYE, {
        at: hit,
        size: [0.105, 0.14],
        mirror: s > 0,
        lift: 0.004,
        name: s > 0 ? "eyeL" : "eyeR",
        group: "face",
      });
    }
  }

  // Nose, ears, cheeks, and expressive brow blocks.
  b.part(cone(0.09, 0.14, 7), SKIN_LIGHT, {
    bone: head,
    at: [0, 1.48, 0.32],
    dir: [0, 0, 1],
    name: "large_nose",
    group: "face",
  });
  for (const s of [1, -1]) {
    b.part(sphere(0.075, 8, 6), SKIN, {
      bone: head,
      at: [s * 0.245, 1.51, 0.08],
      scale: [0.65, 1.1, 0.75],
      name: s > 0 ? "earL" : "earR",
      group: "face",
    });
    b.part(box(0.11, 0.035, 0.055), HAIR, {
      bone: head,
      at: [s * 0.105, 1.61, 0.285],
      dir: [0, 0, 1],
      rotation: [s * 8, s * 5, s * 12],
      name: s > 0 ? "browL" : "browR",
      group: "face",
    });
    b.part(sphere(0.105, 8, 6), SKIN_LIGHT, {
      bone: jaw,
      at: [s * 0.1, 1.405, 0.215],
      scale: [1.0, 0.75, 0.7],
      name: s > 0 ? "cheekL" : "cheekR",
      group: "face",
    });
  }

  // Openable lower jaw and enormous blocky beard.
  b.part(box(0.28, 0.09, 0.19), SKIN, {
    bone: jaw,
    at: [0, 1.385, 0.205],
    name: "lower_jaw",
    group: "jaw",
  });
  b.part(cone(0.23, 0.43, 8), BEARD, {
    bone: jaw,
    at: [0, 1.27, 0.19],
    dir: [0, -1, 0.12],
    scale: [1, 1, 0.72],
    name: "hero_beard",
    group: "beard",
  });
  b.part(sphere(0.18, 8, 6), BEARD, {
    bone: jaw,
    at: [0, 1.38, 0.17],
    scale: [1.35, 0.72, 0.8],
    name: "moustache",
    group: "beard",
  });

  // Braided beard strands: chunky repeated primitives rather than smooth hair.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(sphere(0.047, 7, 5), HAIR, {
        bone: jaw,
        at: [s * (0.065 + i * 0.036), 1.31 - i * 0.045, 0.25],
        scale: [1.05, 0.8, 0.7],
        name: s > 0 ? "beard_braidL" : "beard_braidR",
        group: "beard",
      });
    }
  }

  // ------------------------------------------------------------------------------------------
  // Helmet: iron bowl, brass rim, broad horns and a red plume.
  // ------------------------------------------------------------------------------------------

  b.part(new THREE.SphereGeometry(0.31, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.58), DARK_STEEL, {
    bone: head,
    at: [0, 1.63, 0.01],
    scale: [1.05, 0.8, 0.98],
    name: "iron_helmet",
    group: "helmet",
  });
  b.part(cyl(0.32, 0.055, 12), BRASS, {
    bone: head,
    at: [0, 1.545, 0.03],
    name: "helmet_rim",
    group: "helmet",
  });
  b.part(box(0.09, 0.38, 0.055), BRASS, {
    bone: head,
    at: [0, 1.62, 0.29],
    name: "helmet_nose_guard",
    group: "helmet",
  });
  for (const s of [1, -1]) {
    const horn = catmull([
      [s * 0.22, 1.67, 0],
      [s * 0.32, 1.78, -0.015],
      [s * 0.42, 1.84, 0.07],
    ]);
    b.sweep(horn, [0.07, 0.012], {
      bone: head,
      color: BRASS,
      caps: { start: "round", end: "point" },
      name: s > 0 ? "hornL" : "hornR",
      group: "helmet",
    });
  }
  b.sweep(
    catmull([
      [0, 1.82, -0.04],
      [0, 1.98, -0.015],
      [0.05, 2.08, 0.02],
    ]),
    [0.1, 0.025],
    {
      bone: head,
      color: RED,
      caps: { start: "round", end: "point" },
      name: "helmet_plume",
      group: "helmet",
    },
  );

  // ------------------------------------------------------------------------------------------
  // Arms, gauntlets, and the raised smithing hammer.
  // ------------------------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    b.sweep(arm, [0.105, 0.075], {
      color: RED,
      section: "box",
      caps: "round",
      name: s > 0 ? "sleeveL" : "sleeveR",
      group: "arms",
    });
    b.part(cyl(0.115, 0.13, 8), STEEL, {
      bone: arm.tip,
      at: s > 0 ? [0.52, 0.86, 0.27] : [-0.48, 0.91, 0.3],
      dir: [0, 0, 1],
      name: s > 0 ? "gauntletL" : "gauntletR",
      group: "arms",
    });
    for (let i = 0; i < 3; i++) {
      b.part(sphere(0.027, 6, 4), BRASS, {
        bone: arm.tip,
        at:
          s > 0
            ? [0.52 + (i - 1) * 0.055, 0.86, 0.34]
            : [-0.48 + (i - 1) * 0.055, 0.91, 0.37],
        name: "gauntlet_rivet",
        group: "rivets",
      });
    }
  }

  // Hammer held in the left hand, angled toward the anvil.
  const hammerHandle = b.rod(
    [-0.48, 0.91, 0.31],
    [-0.39, 1.48, 0.31],
    0.035,
    WOOD,
    {
      bone: armR.tip!,
      caps: "round",
      name: "hammer_handle",
      group: "hammer",
    },
  );
  b.part(box(0.34, 0.16, 0.16), DARK_STEEL, {
    bone: armR.tip,
    at: [-0.39, 1.52, 0.31],
    dir: [1, 0.1, 0],
    name: "hammer_head",
    group: "hammer",
  });
  b.part(cone(0.08, 0.14, 8), STEEL, {
    bone: armR.tip,
    at: [-0.57, 1.52, 0.31],
    dir: [-1, 0, 0],
    name: "hammer_peen",
    group: "hammer",
  });
  b.part(sphere(0.045, 7, 5), BRASS, {
    bone: armR.tip,
    at: [-0.39, 1.52, 0.31],
    name: "hammer_pommel",
    group: "hammer",
  });

  // ------------------------------------------------------------------------------------------
  // Anvil: squat stone/iron base, waist, horn, face plate, hardy hole, and rivets.
  // ------------------------------------------------------------------------------------------

  const anvilX = 0.82;
  const anvilZ = 0.12;

  b.part(box(0.42, 0.16, 0.34), DARK_STEEL, {
    at: [anvilX, 0.08, anvilZ],
    name: "anvil_foot",
    group: "anvil",
  });
  b.part(box(0.29, 0.34, 0.24), DARK_STEEL, {
    at: [anvilX, 0.29, anvilZ],
    name: "anvil_stem",
    group: "anvil",
  });
  b.part(box(0.52, 0.15, 0.32), STEEL, {
    at: [anvilX, 0.535, anvilZ],
    name: "anvil_face",
    group: "anvil",
  });
  b.part(cone(0.16, 0.38, 8), STEEL, {
    at: [anvilX + 0.34, 0.55, anvilZ],
    dir: [1, 0, 0],
    scale: [1, 0.8, 0.8],
    name: "anvil_horn",
    group: "anvil",
  });
  b.part(cyl(0.045, 0.018, 8), INK, {
    at: [anvilX - 0.08, 0.62, anvilZ + 0.02],
    dir: [0, 1, 0],
    name: "hardy_hole",
    group: "anvil",
  });
  for (const x of [anvilX - 0.18, anvilX + 0.18]) {
    b.part(sphere(0.025, 6, 4), BRASS, {
      at: [x, 0.16, anvilZ + 0.18],
      name: "anvil_rivet",
      group: "anvil",
    });
  }

  // A few stylized hot sparks hovering above the anvil.
  const sparkTexture = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 2 L19 28 L30 34 L19 38 L16 62 L13 38 L2 34 L13 28Z" fill="#fff3a0"/><path d="M16 8 L17 28 L24 34 L17 35Z" fill="#ff8a28"/></svg>`,
    { size: 64 },
  );
  b.cards(
    [
      { at: [0.74, 0.7, 0.18], axis: [0, 1, 0] },
      { at: [0.94, 0.78, 0.1], axis: [0, 1, 0] },
      { at: [0.68, 0.86, 0.06], axis: [0, 1, 0] },
    ] as any,
    sparkTexture,
    {
      size: [0.045, 0.09],
      lean: 0,
      cross: true,
      color: "#ffb52e",
      group: "sparks",
    },
  );

  // Small shoulder studs complete the readable Warcraft silhouette.
  for (const s of [1, -1]) {
    b.part(sphere(0.12, 8, 5), STEEL, {
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
      at: [s * 0.31, 1.3, 0.02],
      scale: [1.25, 0.7, 1.0],
      name: s > 0 ? "pauldronL" : "pauldronR",
      group: "armor",
    });
    b.part(sphere(0.025, 6, 4), BRASS, {
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
      at: [s * 0.31, 1.34, 0.11],
      name: "pauldron_rivet",
      group: "armor",
    });
  }

  return b.root;
}

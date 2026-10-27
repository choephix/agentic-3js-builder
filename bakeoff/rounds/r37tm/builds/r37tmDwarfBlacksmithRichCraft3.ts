import * as THREE from "three";
import {
  createBuilder,
  catmull,
  rng,
  paint,
  mottle,
  countershade,
  gradient,
  svg,
  frame,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ironbeard Blacksmith",
  description:
    "A chunky Warcraft-style dwarf blacksmith with a braided beard, leather apron, raised hammer, glowing forge coals, and a heavily riveted anvil.",
};

export default function build() {
  const b = createBuilder({ name: "ironbeard", detail: 1 });

  const IRON = "#24252d";
  const IRON_L = "#555965";
  const STEEL = cel("#7d8795", "#343944");
  const DARK_STEEL = cel("#373b46", "#171922");
  const BRASS = cel("#d29a37", "#68451e");
  const GOLD = cel("#f0c45c", "#896021");
  const LEATHER = furEdge("#6f301a", "#30150f", {
    by: "position",
    axis: [0, 1, 0],
    level: 0.55,
    teeth: 0.025,
    period: 0.045,
    along: [1, 0, 0],
    ink: "#24100c",
    inkWidth: 0.003,
  });
  const LEATHER_DARK = cel("#3a1b15", "#160b0a");
  const SKIN = cel("#d98e58", "#713c31");
  const SKIN_LIGHT = cel("#f2b878", "#8d4c38");
  const HAIR = cel("#241b1d", "#0d0a0d");
  const HAIR_HI = cel("#493137", "#171015");
  const APRON = furEdge("#263b43", "#111c22", {
    by: "position",
    axis: [0, 1, 0],
    level: 0.4,
    teeth: 0.018,
    period: 0.035,
    along: [1, 0, 0],
    ink: "#0b1014",
    inkWidth: 0.002,
  });
  const COAL = "#ff6b26";
  const FIRE = "#ffbd3d";

  const coat = countershade(
    mottle("#72503c", "#3c2928", { size: 0.16, contrast: 1.2, seed: 17 }),
    "#271d20",
    { level: -0.2, soft: 0.35 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton first: one readable humanoid rig with named chains and roles.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.66, 0],
    dir: [0, 1, 0.05],
    role: "spine",
    group: "body",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, 0],
      [0, 0.82, 0.01],
      [0, 1.01, 0.015],
      [0, 1.12, 0.02],
    ]),
    {
      parent: hips,
      names: ["spine1", "chest", "neck"],
      role: "spine",
      group: "body",
    },
  );
  const chest = spine.joints[1];
  const neck = spine.tip;

  const head = b.joint("head", {
    parent: neck,
    at: [0, 1.19, 0.035],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.145, 0.12],
    dir: [0, 0.12, 1],
    role: "jaw",
    group: "head",
  });

  const legL = b.chain(
    "legL",
    [
      [0.2, 0.65, 0],
      [0.23, 0.39, 0.015],
      [0.2, 0.16, 0.04],
      [0.2, 0.075, 0.12],
    ],
    {
      parent: hips,
      names: ["hipL", "kneeL", "ankleL", "footL"],
      role: "leg",
      contact: [0.2, 0, 0.12],
      group: "legs",
    },
  );
  const legR = b.chain(
    "legR",
    [
      [-0.2, 0.65, 0],
      [-0.23, 0.39, 0.015],
      [-0.2, 0.16, 0.04],
      [-0.2, 0.075, 0.12],
    ],
    {
      parent: hips,
      names: ["hipR", "kneeR", "ankleR", "footR"],
      role: "leg",
      contact: [-0.2, 0, 0.12],
      group: "legs",
    },
  );

  const armL = b.chain(
    "armL",
    [
      [0.28, 1.02, 0.02],
      [0.43, 0.9, 0.09],
      [0.34, 0.72, 0.26],
      [0.25, 0.65, 0.34],
    ],
    {
      parent: chest,
      names: ["shoulderL", "elbowL", "wristL", "handL"],
      role: "arm",
      group: "arms",
    },
  );
  const armR = b.chain(
    "armR",
    [
      [-0.28, 1.02, 0.02],
      [-0.43, 0.91, 0.06],
      [-0.37, 0.8, 0.23],
      [-0.27, 0.73, 0.31],
    ],
    {
      parent: chest,
      names: ["shoulderR", "elbowR", "wristR", "handR"],
      role: "arm",
      group: "arms",
    },
  );

  // ---------------------------------------------------------------------------
  // Body: short, broad, low-poly dwarf proportions.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.205 - t * 0.035, {
    color: coat,
    section: { ngon: 8 },
    sides: 8,
    group: "body",
  });

  b.part(new THREE.SphereGeometry(0.24, 10, 7), coat, {
    bone: hips,
    at: [0, 0.69, 0],
    scale: [1.05, 0.72, 0.82],
    flat: true,
    group: "body",
    name: "round_belly",
  });

  b.part(new THREE.SphereGeometry(0.28, 12, 8), SKIN, {
    bone: head,
    at: [0, 1.235, 0.07],
    scale: [0.92, 0.95, 0.92],
    flat: true,
    group: "head",
    name: "skull",
  });

  const skull = b.root.getObjectByName("head") ?? b.root;
  const skullSurface = b.surface(skull);

  // Neck ruff and shoulder pads.
  b.sweep(
    catmull([
      [-0.18, 1.06, 0.015],
      [0, 1.12, -0.005],
      [0.18, 1.06, 0.015],
    ]),
    0.06,
    { color: HAIR, caps: "round", group: "body", name: "neck_ruff" },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.13, 8, 5), LEATHER_DARK, {
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
      at: [s * 0.3, 1.01, 0.02],
      scale: [1.22, 0.72, 1.05],
      flat: true,
      group: "armor",
      name: `shoulder_pad_${s > 0 ? "L" : "R"}`,
    });
    b.sweep(
      s > 0 ? armL : armR,
      [0.075, 0.055],
      { color: SKIN, section: { ngon: 6 }, group: "arms" },
    );
  }

  // Legs and heavy boots.
  b.sweep(legL, [0.105, 0.075], {
    color: coat,
    section: { ngon: 6 },
    group: "legs",
  });
  b.sweep(legR, [0.105, 0.075], {
    color: coat,
    section: { ngon: 6 },
    group: "legs",
  });

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    b.part(new THREE.SphereGeometry(0.105, 8, 5), LEATHER_DARK, {
      bone: leg.tip,
      at: [s * 0.2, 0.065, 0.105],
      scale: [1.25, 0.55, 1.55],
      flat: true,
      group: "boots",
      name: `boot_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.BoxGeometry(0.18, 0.045, 0.025), BRASS, {
      bone: leg.tip,
      at: [s * 0.2, 0.095, 0.12],
      group: "boots",
      name: `boot_buckle_${s > 0 ? "L" : "R"}`,
    });
  }

  // Apron, belt, buckle, straps.
  b.part(new THREE.BoxGeometry(0.32, 0.43, 0.025), APRON, {
    bone: chest,
    at: [0, 0.82, 0.205],
    scale: [1, 1, 1],
    group: "clothing",
    name: "blacksmith_apron",
  });
  b.sweep(
    catmull([
      [-0.21, 0.72, 0.17],
      [0, 0.69, 0.22],
      [0.21, 0.72, 0.17],
    ]),
    0.025,
    { color: LEATHER_DARK, caps: "flat", group: "clothing", name: "belt" },
  );
  b.part(new THREE.BoxGeometry(0.085, 0.095, 0.035), GOLD, {
    bone: hips,
    at: [0, 0.71, 0.225],
    group: "clothing",
    name: "belt_buckle",
  });
  b.part(new THREE.BoxGeometry(0.045, 0.24, 0.018), LEATHER_DARK, {
    bone: chest,
    at: [-0.16, 0.91, 0.215],
    rotation: [0, 0, -18],
    group: "clothing",
    name: "apron_strap_L",
  });
  b.part(new THREE.BoxGeometry(0.045, 0.24, 0.018), LEATHER_DARK, {
    bone: chest,
    at: [0.16, 0.91, 0.215],
    rotation: [0, 0, 18],
    group: "clothing",
    name: "apron_strap_R",
  });

  // ---------------------------------------------------------------------------
  // Face settled first: ears, nose, eyes, brows, moustache, open jaw and beard.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.105, 8, 5), SKIN, {
      bone: head,
      at: [s * 0.205, 1.235, 0.045],
      scale: [0.58, 0.85, 0.42],
      flat: true,
      group: "face",
      name: `ear_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.045, 7, 5), HAIR, {
      bone: head,
      at: [s * 0.21, 1.24, 0.082],
      scale: [0.8, 1.0, 0.45],
      group: "face",
      name: `ear_hair_${s > 0 ? "L" : "R"}`,
    });
  }

  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN_LIGHT, {
    bone: head,
    at: [0, 1.215, 0.29],
    scale: [0.95, 0.8, 0.8],
    flat: true,
    group: "face",
    name: "big_nose",
  });
  b.part(new THREE.SphereGeometry(0.042, 7, 5), INK, {
    bone: head,
    at: [0, 1.215, 0.348],
    scale: [1.15, 0.65, 0.55],
    group: "face",
    name: "nose_shadow",
  });

  const EYE = animeEye({ iris: "#65d7e6", blush: "#c55353", size: 384 });
  for (const s of [1, -1]) {
    const hit = skullSurface.around([0, 1.235, 0.07]).at(s * 31, 5);
    if (hit) {
      b.decal(skullSurface, EYE, {
        at: hit,
        size: [0.105, 0.135],
        lift: 0.004,
        mirror: s > 0,
        group: "face",
        name: `eye_${s > 0 ? "L" : "R"}`,
      });
    }
    b.part(new THREE.BoxGeometry(0.11, 0.025, 0.022), HAIR, {
      bone: head,
      at: [s * 0.095, 1.305, 0.27],
      rotation: [0, 0, s * -12],
      group: "face",
      name: `brow_${s > 0 ? "L" : "R"}`,
    });
  }

  // Open lower jaw and spectacular angular beard.
  b.part(new THREE.BoxGeometry(0.18, 0.065, 0.08), SKIN, {
    bone: jaw,
    at: [0, 1.135, 0.24],
    group: "face",
    name: "lower_jaw",
  });
  b.part(new THREE.BoxGeometry(0.13, 0.018, 0.065), INK, {
    bone: jaw,
    at: [0, 1.152, 0.285],
    group: "face",
    name: "open_mouth",
  });

  b.part(new THREE.SphereGeometry(0.16, 9, 6), HAIR, {
    bone: head,
    at: [0, 1.14, 0.17],
    scale: [1.05, 0.75, 0.7],
    flat: true,
    group: "beard",
    name: "beard_mass",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.075, 0.25, 7), HAIR_HI, {
      bone: head,
      at: [s * 0.12, 1.06, 0.19],
      dir: [s * 0.12, -0.22, 0.08],
      group: "beard",
      name: `beard_point_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.048, 7, 5), HAIR_HI, {
      bone: head,
      at: [s * 0.075, 1.19, 0.275],
      scale: [1.2, 0.45, 0.75],
      group: "beard",
      name: `moustache_${s > 0 ? "L" : "R"}`,
    });
  }

  // Braids: three chunky links each side.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p: [number, number, number] = [
        s * (0.105 + i * 0.018),
        1.08 - i * 0.065,
        0.09 - i * 0.008,
      ];
      b.part(new THREE.SphereGeometry(0.042, 7, 5), HAIR_HI, {
        bone: head,
        at: p,
        scale: [1.0, 1.18, 0.82],
        rotation: [0, 0, s * i * 18],
        group: "beard",
        name: `braid_${s > 0 ? "L" : "R"}_${i}`,
      });
    }
    b.part(new THREE.ConeGeometry(0.055, 0.075, 6), BRASS, {
      bone: head,
      at: [s * 0.16, 0.86, 0.07],
      dir: [0, -1, 0],
      group: "beard",
      name: `braid_bead_${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Helmet and goggles.
  // ---------------------------------------------------------------------------

  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.225, 0.035],
      [0.19, 0.12],
      [0.13, 0.19],
      [0, 0.21],
    ],
    {
      at: [0, 1.31, 0.01],
      bone: head,
      segments: 10,
      color: DARK_STEEL,
      group: "helmet",
      name: "iron_cap",
    },
  );
  b.part(new THREE.BoxGeometry(0.48, 0.055, 0.27), IRON, {
    bone: head,
    at: [0, 1.255, 0.055],
    group: "helmet",
    name: "helmet_brim",
  });
  b.part(new THREE.BoxGeometry(0.035, 0.2, 0.04), BRASS, {
    bone: head,
    at: [0, 1.36, 0.19],
    group: "helmet",
    name: "helmet_crest",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 8), BRASS, {
      bone: head,
      at: [s * 0.115, 1.275, 0.305],
      dir: [0, 0, 1],
      group: "helmet",
      name: `goggle_mount_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.TorusGeometry(0.045, 0.009, 5, 10), GOLD, {
      bone: head,
      at: [s * 0.115, 1.275, 0.32],
      rotation: [0, 0, 0],
      group: "helmet",
      name: `goggle_${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.03, 7, 5), "#4bd5d8", {
      bone: head,
      at: [s * 0.115, 1.275, 0.325],
      group: "helmet",
      name: `goggle_lens_${s > 0 ? "L" : "R"}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Arms and hands: one hand grips the hammer, the other rests by the anvil.
  // ---------------------------------------------------------------------------

  b.sweep(armL, [0.075, 0.05], {
    color: SKIN,
    section: { ngon: 6 },
    group: "arms",
  });
  b.sweep(armR, [0.075, 0.05], {
    color: SKIN,
    section: { ngon: 6 },
    group: "arms",
  });
  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    b.part(new THREE.SphereGeometry(0.075, 8, 5), SKIN_LIGHT, {
      bone: arm.tip,
      at: [s * 0.25, 0.65 + (s < 0 ? 0.08 : 0), 0.34],
      scale: [1.0, 0.8, 1.18],
      group: "hands",
      name: `hand_${s > 0 ? "L" : "R"}`,
    });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.CapsuleGeometry(0.012, 0.055, 4, 6), SKIN_LIGHT, {
        bone: arm.tip,
        at: [s * (0.25 + (i - 1) * 0.025), 0.61, 0.37 + i * 0.012],
        dir: [0, -0.35, 0.94],
        group: "hands",
        name: `finger_${s > 0 ? "L" : "R"}_${i}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Hammer, anvil, workbench and forge glow.
  // ---------------------------------------------------------------------------

  const hammerHandle = b.rod(
    [-0.27, 0.73, 0.33],
    [-0.36, 1.03, 0.42],
    0.025,
    { color: LEATHER_DARK, section: { ngon: 6 }, group: "tool", name: "hammer_handle" },
  );
  b.part(new THREE.BoxGeometry(0.27, 0.11, 0.13), STEEL, {
    at: [-0.39, 1.08, 0.44],
    rotation: [0, 0, -18],
    group: "tool",
    name: "hammer_head",
  });
  b.part(new THREE.BoxGeometry(0.05, 0.135, 0.145), DARK_STEEL, {
    at: [-0.51, 1.08, 0.44],
    rotation: [0, 0, -18],
    group: "tool",
    name: "hammer_face",
  });
  b.part(new THREE.SphereGeometry(0.025, 7, 5), BRASS, {
    at: [-0.39, 1.08, 0.51],
    group: "tool",
    name: "hammer_rivet",
  });

  // Anvil pedestal.
  b.part(new THREE.BoxGeometry(0.34, 0.33, 0.31), IRON, {
    at: [0.26, 0.17, 0.4],
    group: "anvil",
    name: "anvil_stump",
  });
  b.part(new THREE.BoxGeometry(0.43, 0.08, 0.42), DARK_STEEL, {
    at: [0.26, 0.38, 0.4],
    group: "anvil",
    name: "anvil_shoulder",
  });
  b.part(new THREE.BoxGeometry(0.31, 0.09, 0.21), STEEL, {
    at: [0.26, 0.465, 0.4],
    group: "anvil",
    name: "anvil_face",
  });
  b.part(new THREE.ConeGeometry(0.11, 0.25, 6), STEEL, {
    at: [0.26, 0.48, 0.57],
    dir: [0, 0, 1],
    group: "anvil",
    name: "anvil_horn",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 6), BRASS, {
      at: [0.26 + s * 0.16, 0.445, 0.4],
      dir: [0, 1, 0],
      group: "anvil",
      name: `anvil_rivet_${s}`,
    });
  }

  // Low workbench behind the character.
  b.part(new THREE.BoxGeometry(0.85, 0.12, 0.46), LEATHER_DARK, {
    at: [0, 0.48, -0.18],
    group: "prop",
    name: "workbench_top",
  });
  for (const x of [-0.34, 0.34]) {
    b.part(new THREE.BoxGeometry(0.09, 0.48, 0.09), LEATHER_DARK, {
      at: [x, 0.23, -0.18],
      group: "prop",
      name: "bench_leg",
    });
  }

  // Compact forge brazier with four glowing coals.
  b.part(new THREE.CylinderGeometry(0.19, 0.15, 0.22, 8), IRON, {
    at: [-0.48, 0.11, -0.05],
    group: "forge",
    name: "forge_brazier",
  });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.025, 8), IRON_L, {
    at: [-0.48, 0.235, -0.05],
    group: "forge",
    name: "forge_rim",
  });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const coal = b.part(new THREE.SphereGeometry(0.04, 7, 5), i % 2 ? COAL : FIRE, {
      at: [-0.48 + Math.cos(a) * 0.075, 0.27 + (i % 2) * 0.018, -0.05 + Math.sin(a) * 0.075],
      group: "forge",
      name: `coal_${i}`,
    });
    glow(coal, i % 2 ? 1.8 : 2.4);
  }

  // Apron emblem: a small glowing-free engraved anvil sigil.
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M12 42h40v8H12zM20 37h24l-4-9H24zM29 10h7v18h-7z" fill="#e4b44f"/>
      <path d="M18 52h28" stroke="#17151b" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.105, 0.105), "#ffffff", {
    bone: chest,
    at: [0, 0.84, 0.222],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM,
    group: "clothing",
    name: "apron_sigil",
  });

  // A few beard and apron seams for the hand-built puppet silhouette.
  for (const y of [0.77, 0.84, 0.91]) {
    b.part(new THREE.BoxGeometry(0.26, 0.008, 0.006), "#6f9a9c", {
      bone: chest,
      at: [0, y, 0.222],
      group: "clothing",
      name: "apron_stitch",
    });
  }

  // Tiny brass shoulder studs and boot studs.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, {
        at: [s * (0.26 + i * 0.035), 1.045, 0.135],
        group: "armor",
        name: `shoulder_stud_${s}_${i}`,
      });
    }
  }

  return b.root;
}

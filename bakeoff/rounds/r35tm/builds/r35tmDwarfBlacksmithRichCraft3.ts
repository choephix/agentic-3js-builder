import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  line,
  limb,
  rng,
  svg,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dwarf Blacksmith at Anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith in a leather apron, hammer raised over a riveted anvil beside a glowing forge.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf_blacksmith", detail: 1 });

  const IRON = cel("#353944", "#171a25");
  const IRON_HI = cel("#687080", "#292d3a");
  const STEEL = cel("#aeb8c2", "#4f5966");
  const BRASS = cel("#c68a32", "#714015");
  const GOLD = cel("#efbd4f", "#9d5c1c");
  const SKIN = cel("#d8905c", "#793b32");
  const SKIN_LIGHT = cel("#f1b47a", "#a8543b");
  const HAIR = cel("#55372c", "#241a1c");
  const HAIR_HI = cel("#8a5940", "#3b2525");
  const LEATHER = furEdge("#783d27", "#3a1d1d", {
    axis: [0, 1, 0],
    level: -0.02,
    teeth: 0.05,
    period: 0.08,
    ink: "#2b1518",
    inkWidth: 0.025,
  });
  const APRON = cel("#4b302d", "#211a22");
  const RED = cel("#c33a2e", "#601d29");
  const FIRE = "#ff9b25";
  const FIRE_CORE = "#fff0a4";
  const EMBER = "#ff4e1f";
  const WOOD = cel("#764429", "#321d20");
  const DARK_WOOD = cel("#43271f", "#21171b");
  const EYE = animeEye({
    iris: "#6ed4cf",
    irisLight: "#d6fff0",
    irisDark: "#173f55",
    brow: true,
    blush: "#d95c58",
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact, broad-shouldered neutral rest pose.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.83, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.83, 0],
      [0, 1.05, 0.015],
      [0, 1.27, 0.015],
      [0, 1.43, 0.02],
    ]),
    {
      parent: hips,
      names: ["pelvis", "waist", "chest", "shoulders"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.42, 0.025],
      [0, 1.53, 0.035],
      [0, 1.61, 0.07],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.66, 0.1],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.59, 0.16],
    aim: [0, 1.56, 0.38],
    role: "jaw",
    group: "head",
  });

  const armLPoints = limb(
    [0.31, 1.37, 0.025],
    [0.43, 1.02, 0.43],
    [0.23, 0.28, 0.24],
    [
      [0, -1, 0.6],
      [0, 0.3, 1],
    ],
  );
  const armRPoints = limb(
    [-0.31, 1.37, 0.025],
    [-0.44, 1.08, 0.34],
    [0.23, 0.27, 0.22],
    [
      [0, -1, 0.6],
      [0, 0.3, 1],
    ],
  );

  const armL = b.chain("armL", armLPoints, {
    parent: spine.joints[3],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", armRPoints, {
    parent: spine.joints[3],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const legLPoints = limb(
    [0.19, 0.82, 0],
    [0.22, 0.13, 0.09],
    [0.28, 0.31, 0.28],
    [
      [0, 0, -1],
      [0, 0, 1],
    ],
    { sole: [0, 0, 1] },
  );
  const legRPoints = limb(
    [-0.19, 0.82, 0],
    [-0.22, 0.13, 0.09],
    [0.28, 0.31, 0.28],
    [
      [0, 0, -1],
      [0, 0, 1],
    ],
    { sole: [0, 0, 1] },
  );

  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.22, 0, 0.14],
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.22, 0, 0.14],
  });

  // ---------------------------------------------------------------------------
  // Reusable primitive helpers.
  // ---------------------------------------------------------------------------

  const sphere = (
    at: [number, number, number],
    scale: [number, number, number],
    color: any,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(1, 10, 7), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
    });

  const box = (
    at: [number, number, number],
    size: [number, number, number],
    color: any,
    bone?: any,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
      name,
    });

  const rod = (
    a: any,
    c: any,
    radius: number,
    color: any,
    bone?: any,
    name?: string,
  ) => b.rod(a, c, radius, { color, bone, section: { ngon: 6 }, name });

  const tuft = (
    at: any,
    dir: [number, number, number],
    length: number,
    radius: number,
    color: any,
    bone?: any,
  ) => b.spike(at, dir, length, radius, { color, bone, caps: "point" });

  const rivet = (at: [number, number, number], bone?: any, color = GOLD) =>
    b.part(new THREE.SphereGeometry(0.018, 7, 5), color, {
      at,
      bone,
      scale: [1, 0.7, 1],
      flat: true,
      name: "rivet",
    });

  // ---------------------------------------------------------------------------
  // Feet, legs, belt and torso.
  // ---------------------------------------------------------------------------

  b.sweep(legL, [0.105, 0.075], {
    color: LEATHER,
    section: { ngon: 6 },
    caps: "round",
    name: "legL_skin",
  });
  b.sweep(legR, [0.105, 0.075], {
    color: LEATHER,
    section: { ngon: 6 },
    caps: "round",
    name: "legR_skin",
  });

  box([0.22, 0.105, 0.16], [0.25, 0.14, 0.38], DARK_WOOD, legL.tip, [0, 0, 0], "bootL");
  box([-0.22, 0.105, 0.16], [0.25, 0.14, 0.38], DARK_WOOD, legR.tip, [0, 0, 0], "bootR");
  box([0.22, 0.18, 0.31], [0.26, 0.09, 0.09], BRASS, legL.tip, [0, 0, 0], "boot_buckleL");
  box([-0.22, 0.18, 0.31], [0.26, 0.09, 0.09], BRASS, legR.tip, [0, 0, 0], "boot_buckleR");

  b.sweep(spine, (t) => 0.23 + 0.05 * Math.sin(t * Math.PI), {
    color: LEATHER,
    section: { ngon: 8 },
    caps: "round",
    name: "stocky_torso",
  });

  box([0, 1.12, 0.12], [0.54, 0.48, 0.07], APRON, spine.joints[1], [0, 0, 0], "apron_body");
  box([0, 0.92, 0.15], [0.57, 0.075, 0.08], BRASS, hips, [0, 0, 0], "belt");
  for (const s of [1, -1]) {
    rivet([s * 0.21, 0.92, 0.195], hips);
    rivet([s * 0.08, 0.92, 0.195], hips);
  }

  // Broad apron bib and lower split leather skirt.
  b.extrude(
    [
      [-0.23, -0.24],
      [0.23, -0.24],
      [0.25, 0.2],
      [0.18, 0.3],
      [-0.18, 0.3],
      [-0.25, 0.2],
    ],
    {
      at: [0, 0.98, 0.205],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: APRON,
      bone: hips,
      name: "apron_bib",
    },
  );
  for (const s of [1, -1]) {
    box([s * 0.15, 0.73, 0.12], [0.19, 0.27, 0.055], APRON, hips, [0, 0, 0], "apron_flap");
    rivet([s * 0.15, 0.82, 0.16], hips);
  }

  // ---------------------------------------------------------------------------
  // Arms, bracers and chunky hands.
  // ---------------------------------------------------------------------------

  b.sweep(armL, [0.095, 0.065], {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "armL_skin",
  });
  b.sweep(armR, [0.095, 0.065], {
    color: SKIN,
    section: { ngon: 6 },
    caps: "round",
    name: "armR_skin",
  });

  for (const [s, arm] of [
    [1, armL],
    [-1, armR],
  ] as const) {
    box([s * 0.38, 1.17, 0.22], [0.13, 0.16, 0.13], IRON, arm.joints[1], [0, 0, 0], "bracer");
    rivet([s * 0.38, 1.2, 0.293], arm.joints[1], GOLD);
    sphere([s * 0.44, 1.02, 0.43], [0.105, 0.09, 0.11], SKIN_LIGHT, arm.tip, "hand");
    for (let i = -1; i <= 1; i++) {
      tuft(
        [s * (0.44 + i * 0.04), 1.0, 0.5],
        [0, 0.1, 1],
        0.09,
        0.025,
        SKIN_LIGHT,
        arm.tip,
      );
    }
  }

  // Shoulder plates.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), IRON_HI, {
      at: [s * 0.34, 1.39, 0.03],
      bone: s > 0 ? armL.joints[0] : armR.joints[0],
      scale: [0.16, 0.13, 0.17],
      flat: true,
      name: "shoulder_plate",
    });
    rivet([s * 0.34, 1.43, 0.17], s > 0 ? armL.joints[0] : armR.joints[0], GOLD);
  }

  // ---------------------------------------------------------------------------
  // Head: settle the face before helmet, beard and other silhouette pieces.
  // ---------------------------------------------------------------------------

  const skull = sphere([0, 1.68, 0.12], [0.31, 0.32, 0.29], SKIN, head, "skull");
  const skullSurface = b.surface(skull);

  const muzzle = sphere([0, 1.58, 0.34], [0.25, 0.17, 0.19], SKIN_LIGHT, jaw, "muzzle");
  const nose = sphere([0, 1.62, 0.505], [0.095, 0.08, 0.07], "#5a2b2d", jaw, "nose");

  for (const s of [1, -1]) {
    const eyeHit = skullSurface.around([0, 1.68, 0.12]).at(s * 38, 4);
    if (eyeHit) {
      b.decal(skullSurface, EYE, {
        at: eyeHit,
        size: [0.115, 0.14],
        mirror: s > 0,
        lift: 0.008,
        name: "bright_eye",
        group: "face",
      });
    }
    sphere([s * 0.255, 1.77, 0.18], [0.08, 0.075, 0.08], HAIR, head, "brow");
    // Ear disks with brass earrings.
    sphere([s * 0.29, 1.7, 0.08], [0.105, 0.14, 0.055], SKIN, head, "ear");
    b.part(new THREE.TorusGeometry(0.035, 0.009, 6, 10), GOLD, {
      at: [s * 0.32, 1.62, 0.08],
      bone: head,
      rotation: [Math.PI / 2, 0, 0],
      flat: true,
      name: "earring",
    });
  }

  // Openable lower jaw and beard mass.
  b.sweep(
    catmull([
      [0, 1.55, 0.25],
      [0, 1.48, 0.29],
      [0, 1.44, 0.19],
    ]),
    [0.22, 0.08],
    { color: HAIR, bone: jaw, section: { ngon: 6 }, name: "beard_mass" },
  );
  for (const s of [1, -1]) {
    const beardPath = catmull([
      [s * 0.08, 1.54, 0.28],
      [s * 0.14, 1.42, 0.34],
      [s * 0.11, 1.27, 0.24],
    ]);
    b.sweep(beardPath, [0.075, 0.018], {
      color: HAIR_HI,
      bone: jaw,
      caps: { start: "round", end: "point" },
      name: "braided_beard",
    });
    for (let i = 0; i < 3; i++) {
      sphere([s * (0.08 + i * 0.025), 1.49 - i * 0.09, 0.34 - i * 0.015], [0.045, 0.055, 0.04], GOLD, jaw, "beard_bead");
    }
  }

  // Mustache swept into two pointed tufts.
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.015, 1.62, 0.47],
        [s * 0.09, 1.61, 0.48],
        [s * 0.16, 1.57, 0.43],
      ]),
      [0.045, 0.009],
      { color: HAIR, bone: jaw, caps: "point", name: "mustache" },
    );
  }

  // ---------------------------------------------------------------------------
  // Helmet, crest, horns and metal details.
  // ---------------------------------------------------------------------------

  b.lathe(
    [
      [0, -0.14],
      [0.22, -0.14],
      [0.31, -0.04],
      [0.3, 0.08],
      [0.24, 0.18],
      [0, 0.2],
    ],
    {
      at: [0, 1.73, 0.07],
      axis: [0, 1, 0],
      segments: 12,
      color: IRON_HI,
      bone: head,
      name: "helmet_dome",
    },
  );
  box([0, 1.62, 0.28], [0.67, 0.075, 0.16], IRON, head, [0, 0, 0], "helmet_brow");
  box([0, 1.68, 0.35], [0.42, 0.08, 0.08], BRASS, head, [0, 0, 0], "helmet_band");
  for (const s of [1, -1]) {
    rivet([s * 0.23, 1.68, 0.4], head);
    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.1, 0.18],
        [0.035, 0.29],
        [0, 0.29],
      ],
      {
        at: [s * 0.22, 1.76, 0.05],
        x: [s, 0, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: RED,
        bone: head,
        name: "helmet_plume",
      },
    );
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.27, 1.78, 0.08], [s * 0.18, 0.1, -0.02], 0.24, 0.055, {
      color: BRASS,
      bone: head,
      name: "helmet_horn",
    });
  }

  // ---------------------------------------------------------------------------
  // Hammer: left hand grips the haft, right hand braces over the anvil.
  // ---------------------------------------------------------------------------

  const hammerGrip = [0.44, 1.03, 0.5] as [number, number, number];
  const hammerHead = [0.4, 1.3, 0.55] as [number, number, number];
  rod(hammerGrip, hammerHead, 0.025, WOOD, armL.tip, "hammer_haft");
  box(hammerHead, [0.28, 0.18, 0.16], IRON_HI, armL.tip, [0.18, 0, -0.12], "hammer_head");
  box([0.4, 1.3, 0.63], [0.18, 0.11, 0.08], STEEL, armL.tip, [0.18, 0, -0.12], "hammer_face");
  box([0.4, 1.3, 0.46], [0.16, 0.12, 0.08], STEEL, armL.tip, [0.18, 0, -0.12], "hammer_peen");
  for (const z of [0.48, 0.59]) rivet([0.27, 1.3, z], armL.tip, GOLD);

  // ---------------------------------------------------------------------------
  // Anvil: broad feet, waist, face plate, horn, hardy hole and rivets.
  // ---------------------------------------------------------------------------

  const anvilBone = hips;
  box([0, 0.48, 0.58], [0.52, 0.12, 0.36], IRON_HI, anvilBone, [0, 0, 0], "anvil_face");
  box([0, 0.37, 0.58], [0.3, 0.17, 0.22], IRON, anvilBone, [0, 0, 0], "anvil_waist");
  box([0, 0.16, 0.58], [0.48, 0.18, 0.32], IRON, anvilBone, [0, 0, 0], "anvil_base");
  b.spike([0.25, 0.48, 0.58], [0.9, 0.1, 0], 0.34, 0.095, {
    color: IRON_HI,
    bone: anvilBone,
    name: "anvil_horn",
  });
  box([0, 0.555, 0.58], [0.075, 0.018, 0.075], "#10131b", anvilBone, [0, 0, 0], "hardy_hole");
  for (const x of [-0.19, 0.19]) {
    box([x, 0.075, 0.58], [0.16, 0.1, 0.22], IRON, anvilBone, [0, 0, 0], "anvil_foot");
    rivet([x, 0.15, 0.75], anvilBone, STEEL);
    rivet([x, 0.15, 0.41], anvilBone, STEEL);
  }
  for (const x of [-0.2, 0.2]) rivet([x, 0.555, 0.7], anvilBone, GOLD);

  // ---------------------------------------------------------------------------
  // Forge brazier and fire behind the anvil.
  // ---------------------------------------------------------------------------

  box([-0.62, 0.3, 0.16], [0.46, 0.08, 0.42], IRON, hips, [0, 0, 0], "forge_rim");
  box([-0.62, 0.13, 0.16], [0.3, 0.3, 0.27], IRON, hips, [0, 0, 0], "forge_brazier");
  for (const x of [-0.78, -0.46]) {
    box([x, 0.06, 0.16], [0.08, 0.12, 0.12], IRON, hips, [0, 0, 0], "forge_foot");
  }
  for (const x of [-0.75, -0.62, -0.49]) {
    const coal = sphere([x, 0.37, 0.16], [0.09, 0.045, 0.08], EMBER, hips, "coal");
    glow(coal, 1.8);
  }
  const flameTex = svg(
    `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 137C12 128 12 93 38 70C31 45 49 20 67 4C66 35 88 52 87 82C106 111 82 137 50 137Z" fill="#ff6b1e"/>
      <path d="M51 126C30 117 32 96 50 78C48 61 58 47 66 36C68 61 80 77 74 98C71 115 62 124 51 126Z" fill="#ffd34e"/>
    </svg>`,
    { size: 128 },
  );
  b.cards(
    [
      frame([-0.62, 0.38, 0.16], [0, 1, 0]),
      frame([-0.55, 0.38, 0.16], [0, 1, 0]),
      frame([-0.69, 0.38, 0.16], [0, 1, 0]),
    ],
    flameTex,
    {
      size: [0.16, 0.28],
      lean: 8,
      bend: 18,
      color: FIRE,
      cross: true,
      sink: 0.03,
      rng: rng(22),
      name: "forge_flames",
    },
  );

  // Bellows and a hanging tool rack.
  box([-0.93, 0.34, 0.02], [0.23, 0.22, 0.38], WOOD, hips, [0.15, 0, 0], "bellows");
  box([-0.93, 0.43, 0.22], [0.15, 0.035, 0.08], LEATHER, hips, [0, 0, 0], "bellows_grip");
  rod([-0.93, 0.2, 0.03], [-0.93, 0.06, 0.03], 0.018, WOOD, hips, "bellows_leg");

  const rack = b.chain(
    "rack",
    [
      [-0.85, 1.08, -0.08],
      [-0.85, 1.42, -0.08],
    ],
    { parent: hips, names: ["rackPost"], role: "fan" },
  );
  b.sweep(rack, 0.025, { color: WOOD, name: "tool_rack" });
  for (const z of [-0.18, -0.02, 0.14]) {
    rod([-0.88, 1.28, z], [-0.58, 1.28, z], 0.012, WOOD, hips, "rack_bar");
    tuft([-0.58, 1.28, z], [0, -1, 0], 0.22, 0.028, STEEL, hips);
  }

  // Loose sparks around the forge add the magical Warcraft readability.
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const p: [number, number, number] = [
      -0.62 + Math.cos(a) * (0.12 + (i % 3) * 0.03),
      0.46 + (i % 4) * 0.08,
      0.16 + Math.sin(a) * (0.12 + (i % 2) * 0.035),
    ];
    const spark = sphere(p, [0.012, 0.02, 0.012], FIRE_CORE, hips, "spark");
    glow(spark, 2.2);
  }

  return b.root;
}

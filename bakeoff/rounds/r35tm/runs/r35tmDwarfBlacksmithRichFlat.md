```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "agentic-3js-builder";
import { cel, animeEye, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Dwarf Blacksmith at Anvil",
  description: "A broad, heavily bearded Warcraft-style dwarf blacksmith beside his anvil, gripping a raised hammer.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const IRON = cel("#39434b", "#171c24");
  const DARK_IRON = cel("#202932", "#0c1016");
  const STEEL = cel("#788895", "#35424c");
  const BRASS = cel("#d28d28", "#704016");
  const GOLD = cel("#f0bd43", "#9b5b16");
  const LEATHER = cel("#6b301d", "#321713");
  const LEATHER_L = cel("#9b5129", "#4d2418");
  const CLOTH = cel("#3d5272", "#1c2944");
  const CLOTH_L = cel("#718bb0", "#354d70");
  const SKIN = cel("#b56f48", "#67372c");
  const SKIN_L = cel("#d59565", "#884b35");
  const HAIR = cel("#4b2c25", "#1b1418");
  const BEARD = cel("#64402e", "#271b1b");
  const BEARD_L = cel("#94603c", "#412722");
  const CREAM = cel("#d7b878", "#765d40");
  const FIRE = "#ff6a1c";
  const HOT = "#ffd15a";
  const WOOD = cel("#70401f", "#2b1b18");
  const INKISH = INK;

  const box = (size: [number, number, number], color: any, at: [number, number, number], bone?: any, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, { at, bone, rotation, flat: true });

  const sphere = (r: number, color: any, at: [number, number, number], bone?: any, scale?: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { at, bone, scale, flat: true });

  const cyl = (r: number, h: number, color: any, at: [number, number, number], dir: [number, number, number], bone?: any, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r * 0.96, h, sides), color, { at, dir, bone, flat: true });

  const bead = (at: [number, number, number], color = BRASS, r = 0.018, bone?: any) =>
    sphere(r, color, at, bone);

  // ---------------------------------------------------------------------------
  // Skeleton: compact dwarf proportions, feet planted wide and stable.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.79, 0], role: "spine" });

  const legLPoints = limb([0.21, 0.78, -0.01], [0.25, 0.13, 0.12], [0.30, 0.29], [[0, 0, 1]]);
  const legRPoints = limb([-0.21, 0.78, -0.01], [-0.25, 0.13, 0.12], [0.30, 0.29], [[0, 0, 1]]);
  const legL = b.chain("legL", legLPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
    contact: [0.25, 0, 0.12],
  });
  const legR = b.chain("legR", legRPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
    contact: [-0.25, 0, 0.12],
  });

  const spine = b.chain("spine", catmull([
    [0, 0.72, 0],
    [0, 1.00, 0],
    [0, 1.28, 0.02],
    [0, 1.47, 0.02],
  ]), { parent: hips, names: ["waist", "belly", "chest", "shoulder"], role: "spine" });

  const neck = b.chain("neck", catmull([
    [0, 1.45, 0.02],
    [0, 1.57, 0.04],
    [0, 1.67, 0.06],
  ]), { parent: spine.tip, names: ["neck", "neckTip"], role: "neck" });

  const head = b.joint("head", { parent: neck.tip, at: [0, 1.68, 0.08], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.57, 0.18], dir: [0, 0.18, 1], role: "jaw", group: "face" });

  const armLPoints = limb([0.38, 1.39, 0.02], [0.70, 1.15, 0.35], [0.29, 0.28], [[0, 0, 1]]);
  const armRPoints = limb([-0.38, 1.39, 0.02], [-0.66, 1.22, 0.28], [0.29, 0.28], [[0, 0, 1]]);
  const armL = b.chain("armL", armLPoints, {
    parent: spine.joints[3],
    names: ["shoulderL", "elbowL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", armRPoints, {
    parent: spine.joints[3],
    names: ["shoulderR", "elbowR", "handR"],
    role: "arm",
  });

  // ---------------------------------------------------------------------------
  // Boots and legs.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const leg = s > 0 ? legL : legR;
    const footX = s * 0.25;
    b.sweep(leg, (t) => 0.095 - t * 0.018, {
      color: LEATHER,
      section: { ngon: 6 },
      caps: "round",
      name: `leg${s}Leather`,
      group: "legs",
    });

    box([0.22, 0.12, 0.34], LEATHER, [footX, 0.095, 0.17], leg.tip);
    box([0.23, 0.035, 0.36], LEATHER_L, [footX, 0.153, 0.17], leg.tip);
    box([0.19, 0.075, 0.12], BRASS, [footX, 0.17, 0.045], leg.tip);

    cyl(0.112, 0.045, BRASS, [footX, 0.47, 0.03], [0, 1, 0], leg.joints[1], 8);
    for (let i = 0; i < 5; i++)
      bead([footX + (i - 2) * 0.035, 0.49, 0.095], GOLD, 0.014, leg.joints[1]);
  }

  // ---------------------------------------------------------------------------
  // Torso, tunic, belt, apron, shoulders and armor.
  // ---------------------------------------------------------------------------

  b.sweep(spine, (t) => 0.19 - t * 0.025, {
    color: CLOTH,
    section: { ngon: 8 },
    caps: "round",
    name: "heavyTunic",
    group: "body",
  });

  box([0.48, 0.22, 0.28], CLOTH_L, [0, 1.18, 0.045], spine.joints[1]);
  box([0.43, 0.22, 0.24], LEATHER_L, [0, 0.98, 0.10], spine.joints[1]);
  box([0.52, 0.075, 0.31], LEATHER, [0, 1.04, 0.13], spine.joints[1]);
  box([0.10, 0.09, 0.06], GOLD, [0, 1.04, 0.30], spine.joints[1]);
  sphere(0.035, GOLD, [0, 1.04, 0.34], spine.joints[1]);

  // Apron panel and its chunky brass rivets.
  box([0.28, 0.39, 0.035], LEATHER_L, [0, 0.91, 0.235], spine.joints[1]);
  box([0.23, 0.30, 0.012], CREAM, [0, 0.91, 0.257], spine.joints[1]);
  for (const x of [-0.105, 0.105])
    for (const y of [0.76, 0.91, 1.06])
      bead([x, y, 0.27], BRASS, 0.014, spine.joints[1]);

  for (const s of [1, -1]) {
    const arm = s > 0 ? armL : armR;
    b.sweep(arm, (t) => 0.085 - t * 0.025, {
      color: CLOTH,
      section: { ngon: 6 },
      caps: "round",
      name: `arm${s}Sleeve`,
      group: "arms",
    });
    sphere(0.105, STEEL, [s * 0.40, 1.38, 0.035], spine.joints[3]);
    box([0.20, 0.10, 0.17], STEEL, [s * 0.40, 1.40, 0.08], spine.joints[3], [0, 0, s * 0.18]);
    for (let i = 0; i < 3; i++)
      bead([s * (0.35 + i * 0.05), 1.44, 0.15], GOLD, 0.015, spine.joints[3]);

    sphere(0.10, SKIN, [s * 0.70, 1.15 + (s > 0 ? 0 : 0.03), 0.35], arm.tip);
    for (let i = 0; i < 4; i++)
      b.sweep(catmull([
        [s * (0.70 + i * 0.018), 1.13, 0.39],
        [s * (0.73 + i * 0.018), 1.10, 0.44],
      ]), [0.018, 0.008], { color: SKIN_L, bone: arm.tip, caps: "round", name: `finger${s}_${i}` });
  }

  // ---------------------------------------------------------------------------
  // Head, nose, ears, eyes, brows and monumental beard.
  // ---------------------------------------------------------------------------

  const skull = sphere(0.245, SKIN, [0, 1.78, 0.10], head, [1.0, 1.06, 0.91]);
  sphere(0.17, HAIR, [0, 1.94, 0.035], head, [1.15, 0.55, 0.85]);
  sphere(0.18, SKIN_L, [0, 1.70, 0.255], head, [1.05, 0.70, 0.55]);
  sphere(0.065, SKIN, [0, 1.70, 0.34], head, [1.1, 0.8, 0.8]);
  sphere(0.045, INKISH, [0, 1.68, 0.385], head);

  for (const s of [1, -1]) {
    // Round ears with brass cuffs.
    sphere(0.105, SKIN, [s * 0.235, 1.81, 0.08], head, [0.72, 1, 0.48]);
    sphere(0.067, SKIN_L, [s * 0.247, 1.81, 0.09], head, [0.72, 1, 0.42]);
    cyl(0.078, 0.026, BRASS, [s * 0.255, 1.81, 0.10], [1, 0, 0], head, 8);
    box([0.055, 0.035, 0.025], HAIR, [s * 0.18, 1.96, 0.18], head, [0, 0, s * 0.2]);
  }

  const EYE = animeEye({ iris: "#55c7d9", size: 256, brow: true });
  const faceSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = faceSurface.around([0, 1.78, 0.10]).at(s * 35, 4);
    if (eyeHit)
      b.decal(faceSurface, EYE, {
        at: eyeHit,
        size: [0.105, 0.13],
        mirror: s > 0,
        lift: 0.006,
        name: `eye${s}`,
        group: "face",
      });
    // Eyebrow ridges and cheek scars.
    b.sweep(catmull([
      [s * 0.08, 1.88, 0.31],
      [s * 0.16, 1.91, 0.30],
      [s * 0.21, 1.87, 0.25],
    ]), [0.026, 0.014], { color: HAIR, bone: head, caps: "round", name: `brow${s}` });
    b.sweep(catmull([
      [s * 0.15, 1.70, 0.31],
      [s * 0.19, 1.67, 0.32],
    ]), 0.009, { color: INKISH, bone: head, caps: "flat", name: `scar${s}` });
  }

  // Beard mass, moustache and separate blocky locks.
  sphere(0.20, BEARD, [0, 1.57, 0.18], jaw, [1.05, 1.0, 0.72]);
  box([0.28, 0.16, 0.10], BEARD_L, [0, 1.51, 0.23], jaw);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (0.035 + i * 0.045);
      const y = 1.45 - i * 0.045;
      const z = 0.24 + i * 0.012;
      b.sweep(catmull([
        [x, 1.63 - i * 0.012, z],
        [x * 1.08, y + 0.05, z + 0.02],
        [x * 1.12, y - 0.05, z - 0.015],
      ]), [0.035 - i * 0.004, 0.012], {
        color: i % 2 ? BEARD : BEARD_L,
        bone: jaw,
        caps: "round",
        name: `beardLock${s}_${i}`,
      });
      bead([x * 1.12, y - 0.08, z - 0.018], GOLD, 0.012, jaw);
    }
  }
  for (const s of [1, -1])
    b.sweep(catmull([
      [s * 0.01, 1.68, 0.33],
      [s * 0.075, 1.66, 0.35],
      [s * 0.12, 1.69, 0.32],
    ]), [0.027, 0.012], { color: BEARD_L, bone: jaw, caps: "round", name: `moustache${s}` });

  // ---------------------------------------------------------------------------
  // Helmet, horns, crest, braids and facial ornament.
  // ---------------------------------------------------------------------------

  b.lathe([
    [0, 0], [0.18, 0], [0.23, 0.04], [0.22, 0.13], [0.15, 0.23], [0, 0.27],
  ], { at: [0, 1.91, 0.05], bone: head, color: IRON, segments: 10, name: "ironHelmet" });

  box([0.38, 0.045, 0.10], STEEL, [0, 1.79, 0.27], head);
  for (const s of [1, -1]) {
    cyl(0.035, 0.17, BRASS, [s * 0.18, 1.91, 0.08], [0, 1, 0], head, 6);
    b.spike([s * 0.19, 2.00, 0.07], [s * 0.15, 0.12, -0.01], null, 0.045, { color: GOLD, bone: head, name: `helmetHorn${s}` });
    for (let i = 0; i < 4; i++)
      bead([s * (0.245 - i * 0.012), 1.89 + i * 0.028, 0.22], BRASS, 0.012, head);
  }
  const crest = b.extrude([[0, 0], [0.09, 0.05], [0.07, 0.20], [0, 0.27], [-0.07, 0.20], [-0.09, 0.05]], {
    at: [0, 1.94, -0.01],
    x: [1, 0, 0],
    thickness: 0.025,
    bevel: 0.005,
    color: CLOTH_L,
    bone: head,
    name: "helmetCrest",
  });
  bead([0, 2.08, 0.01], GOLD, 0.022, head);

  for (const s of [1, -1]) {
    const braidPath = catmull([
      [s * 0.18, 1.55, 0.05],
      [s * 0.24, 1.35, 0.00],
      [s * 0.20, 1.17, 0.03],
      [s * 0.15, 1.04, 0.08],
    ]);
    b.sweep(braidPath, 0.026, { color: HAIR, bone: spine.joints[3], caps: "round", name: `braid${s}`, group: "hair" });
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const p = braidPath.at(t);
      sphere(0.032, i % 2 ? HAIR : BEARD_L, [p.x, p.y, p.z + 0.018], spine.joints[3], [1, 0.75, 0.8]);
    }
    bead([s * 0.15, 1.02, 0.08], GOLD, 0.028, spine.joints[3]);
  }

  // ---------------------------------------------------------------------------
  // Raised blacksmith hammer, held in the character's right hand.
  // ---------------------------------------------------------------------------

  const hammerHand = armR.tip;
  const hammerGrip = [-0.70, 1.27, 0.42] as [number, number, number];
  const hammerTop = [-0.77, 1.78, 0.45] as [number, number, number];
  b.sweep(catmull([hammerGrip, [-0.73, 1.48, 0.43], hammerTop]), [0.035, 0.028], {
    color: WOOD,
    bone: hammerHand,
    caps: "round",
    name: "hammerWoodHandle",
  });
  box([0.31, 0.16, 0.18], DARK_IRON, [-0.77, 1.83, 0.45], hammerHand, [0, 0, 0.12]);
  box([0.24, 0.19, 0.23], STEEL, [-0.77, 1.82, 0.45], hammerHand, [0, 0, 0.12]);
  box([0.34, 0.045, 0.20], BRASS, [-0.77, 1.91, 0.45], hammerHand, [0, 0, 0.12]);
  for (const x of [-0.88, -0.66])
    bead([x, 1.86, 0.55], GOLD, 0.018, hammerHand);

  // ---------------------------------------------------------------------------
  // Anvil: broad waist, feet, horn and glowing workpiece.
  // ---------------------------------------------------------------------------

  const anvilBone = b.joint("anvil", { at: [0.82, 0.35, 0.02], dir: [0, 1, 0], role: "hinge", group: "prop" });
  box([0.62, 0.12, 0.30], DARK_IRON, [0.82, 0.78, 0.02], anvilBone);
  box([0.48, 0.25, 0.22], IRON, [0.82, 0.60, 0.02], anvilBone);
  box([0.30, 0.25, 0.18], DARK_IRON, [0.82, 0.38, 0.02], anvilBone);
  for (const s of [1, -1]) {
    box([0.15, 0.16, 0.22], IRON, [0.82 + s * 0.18, 0.13, 0.02], anvilBone);
    box([0.12, 0.10, 0.28], STEEL, [0.82 + s * 0.19, 0.075, 0.02], anvilBone);
  }
  b.spike([1.12, 0.78, 0.02], [0.32, 0, 0], null, 0.13, { color: STEEL, bone: anvilBone, name: "anvilHorn" });
  box([0.12, 0.035, 0.16], STEEL, [0.82, 0.86, 0.02], anvilBone);
  for (const x of [0.60, 0.72, 0.92, 1.04])
    bead([x, 0.86, 0.13], GOLD, 0.018, anvilBone);

  // Hot horseshoe-like workpiece and sparks.
  box([0.16, 0.035, 0.08], HOT, [0.82, 0.90, 0.03], anvilBone);
  box([0.11, 0.025, 0.055], FIRE, [0.82, 0.925, 0.03], anvilBone);
  for (const p of [
    [0.66, 1.02, 0.04], [0.94, 1.08, 0.02], [0.72, 1.16, 0.05],
    [1.02, 1.12, 0.04], [0.58, 1.07, 0.02],
  ] as [number, number, number][]) {
    sphere(0.014, HOT, p, anvilBone);
    b.spike(p, [p[0] - 0.02, p[1] + 0.07, p[2]], null, 0.006, { color: FIRE, bone: anvilBone, name: "spark" });
  }

  // Small forge behind the anvil, kept subordinate to the hero.
  const forge = b.joint("forge", { at: [1.18, 0.30, -0.30], dir: [0, 1, 0], role: "spine", group: "prop" });
  box([0.52, 0.42, 0.40], DARK_IRON, [1.18, 0.38, -0.30], forge);
  box([0.42, 0.08, 0.32], STEEL, [1.18, 0.62, -0.30], forge);
  box([0.29, 0.18, 0.025], FIRE, [1.18, 0.70, -0.08], forge);
  for (const x of [1.05, 1.18, 1.31]) {
    sphere(0.035, HOT, [x, 0.72, -0.08], forge);
    sphere(0.022, FIRE, [x, 0.77, -0.08], forge);
  }
  cyl(0.09, 0.42, DARK_IRON, [1.18, 0.85, -0.30], [0, 1, 0], forge, 8);
  box([0.08, 0.04, 0.08], BRASS, [1.18, 0.70, -0.08], forge);

  // A few engraved belt marks and shoulder symbols.
  for (const s of [1, -1]) {
    box([0.025, 0.11, 0.018], GOLD, [s * 0.34, 1.28, 0.20], spine.joints[2]);
    box([0.08, 0.018, 0.018], GOLD, [s * 0.34, 1.30, 0.215], spine.joints[2]);
  }

  // Ensure all loose decorative pieces remain part of the returned builder tree.
  void rng;
  void crest;
  return b.root;
}
```
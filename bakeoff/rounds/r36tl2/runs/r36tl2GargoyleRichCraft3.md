```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  mottle,
  countershade,
  svg,
  rng,
} from "agentic-3js-builder";
import { cel, furEdge, animeEye, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with folded wings, horns, claws, tail, and glowing carved eyes.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE_DARK = "#35343a";
  const STONE = "#65646b";
  const STONE_LIGHT = "#929099";
  const STONE_SHADOW = "#292932";
  const EYE_GLOW = "#f5b64d";
  const CLAW = "#24232b";
  const MOSS = "#52604b";
  const LEDGE = "#46454d";

  const stone = mottle(
    cel(STONE_LIGHT, STONE_DARK, { threshold: 0.05 }),
    cel(STONE, STONE_SHADOW, { threshold: -0.15 }),
    { size: 0.18, contrast: 1.8, seed: 23 },
  );
  const bellyStone = countershade(stone, cel("#45444c", "#25242c"), { level: 0.1, soft: 0.2 });
  const wingStone = cel("#76747d", "#3a3943", { threshold: 0.0 });
  const mossStone = mottle(MOSS, "#303b31", { size: 0.09, seed: 44 });

  // Skeleton first: one root, spine, neck, head, jaw, legs, arms, tail and wing hinges.
  const hips = b.joint("hips", { at: [0, 1.13, 0], role: "spine" });

  const spinePath = catmull([
    [0, 1.13, 0],
    [0, 1.30, 0.12],
    [0, 1.48, 0.24],
    [0, 1.65, 0.34],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4"],
    role: "spine",
  });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.65, 0.34],
      [0, 1.79, 0.43],
      [0, 1.92, 0.54],
    ]),
    { parent: spine.tip, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.98, 0.57],
    dir: [0, 0.05, 1],
    role: "head",
    group: "face",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.90, 0.69],
    dir: [0, -0.15, 1],
    role: "jaw",
    group: "face",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.20, -0.08],
      [0, 1.08, -0.34],
      [0, 0.91, -0.65],
      [0, 0.73, -0.99],
      [0, 0.77, -1.27],
      [0, 0.93, -1.46],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"], role: "tail" },
  );

  const legL = limb([0.23, 1.16, -0.02], [0.42, 0.25, 0.16], [0.34, 0.37, 0.25], [[0, 0, 1], [0, 0, -1]]);
  const legR = limb([-0.23, 1.16, -0.02], [-0.42, 0.25, 0.16], [0.34, 0.37, 0.25], [[0, 0, 1], [0, 0, -1]]);
  const hindL = b.chain("legL", legL, { parent: hips, names: ["hipL", "kneeL", "ankleL"], role: "leg", contact: [0.42, 0, 0.16] });
  const hindR = b.chain("legR", legR, { parent: hips, names: ["hipR", "kneeR", "ankleR"], role: "leg", contact: [-0.42, 0, 0.16] });

  const armL = b.chain("armL", catmull([[0.29, 1.54, 0.25], [0.55, 1.31, 0.34], [0.70, 1.02, 0.47]]), {
    parent: spine.joints[2], names: ["shoulderL", "elbowL", "wristL"], role: "arm",
  });
  const armR = b.chain("armR", catmull([[-0.29, 1.54, 0.25], [-0.55, 1.31, 0.34], [-0.70, 1.02, 0.47]]), {
    parent: spine.joints[2], names: ["shoulderR", "elbowR", "wristR"], role: "arm",
  });

  const wingL = b.chain("wingL", catmull([[0.32, 1.57, 0.14], [0.67, 1.80, 0.02], [1.03, 1.92, -0.10], [1.34, 1.73, -0.25]]), {
    parent: spine.joints[2], names: ["wingL", "wingL2", "wingL3", "wingLtip"], role: "wing",
  });
  const wingR = b.chain("wingR", catmull([[-0.32, 1.57, 0.14], [-0.67, 1.80, 0.02], [-1.03, 1.92, -0.10], [-1.34, 1.73, -0.25]]), {
    parent: spine.joints[2], names: ["wingR", "wingR2", "wingR3", "wingRtip"], role: "wing",
  });

  // Simple ledge: the only scenery, broad enough to frame the crouching silhouette.
  b.part(new THREE.BoxGeometry(1.72, 0.18, 0.92), LEDGE, {
    at: [0, 0.09, 0.08],
    name: "cathedral_ledge",
  });
  b.part(new THREE.BoxGeometry(1.42, 0.12, 0.22), mossStone, {
    at: [0, 0.22, -0.28],
    name: "mossy_ledge_cap",
  });
  for (const x of [-0.62, -0.31, 0, 0.31, 0.62]) {
    b.part(new THREE.BoxGeometry(0.16, 0.16, 0.08), STONE_DARK, {
      at: [x, 0.22, 0.46],
      name: "ledge_rib",
    });
  }

  // Main body and belly, built as broad low-poly sweeps.
  b.sweep(spine, (t) => 0.27 - 0.055 * t, {
    bone: spine,
    color: stone,
    sides: 8,
    section: "box",
    caps: "round",
    name: "carved_torso",
  });
  b.sweep(spinePath, (t) => 0.30 - 0.06 * t, {
    bone: spine,
    color: bellyStone,
    sectors: [[115, 245, bellyStone]],
    sides: 8,
    name: "stone_belly",
  });
  b.sweep(neck, [0.18, 0.14], { bone: neck, color: stone, sides: 7, name: "thick_neck" });

  // Head, muzzle, split jaw and nose.
  b.part(new THREE.SphereGeometry(0.28, 10, 7), stone, {
    bone: head,
    at: [0, 1.99, 0.60],
    scale: [1.0, 0.88, 1.05],
    name: "gargoyle_skull",
  });
  b.part(new THREE.BoxGeometry(0.26, 0.18, 0.28), bellyStone, {
    bone: head,
    at: [0, 1.91, 0.82],
    name: "muzzle",
  });
  b.part(new THREE.BoxGeometry(0.18, 0.055, 0.20), CLAW, {
    bone: jaw,
    at: [0, 1.865, 0.93],
    name: "open_mouth",
  });
  b.part(new THREE.SphereGeometry(0.065, 7, 5), STONE_SHADOW, {
    bone: head,
    at: [0, 1.95, 0.98],
    name: "nose",
  });

  // Eyes as glowing illustrated decals, plus heavy stone brows.
  const skullSurface = b.surface(b.root);
  const eyeTexture = animeEye({ iris: EYE_GLOW, ink: INK, blush: false, brow: false, size: 256 });
  for (const s of [-1, 1]) {
    const eyeAt = [s * 0.115, 2.025, 0.805] as [number, number, number];
    b.decal(b.root, eyeTexture, {
      at: eyeAt,
      dir: [0, 0.18, 1],
      up: [0, 1, 0],
      size: [0.105, 0.13],
      lift: 0.012,
      mirror: s > 0,
      name: s < 0 ? "eyeR_glow" : "eyeL_glow",
    });
    b.part(new THREE.BoxGeometry(0.18, 0.055, 0.12), stoneShadow(), {
      bone: head,
      at: [s * 0.105, 2.125, 0.76],
      rotation: [0, s * 18, s * 10],
      name: "heavy_brow",
    });
  }

  function stoneShadow() {
    return STONE_SHADOW;
  }

  // Horns, ear fins, cheek ridges.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.16, 2.16, 0.55],
        [s * 0.23, 2.36, 0.42],
        [s * 0.18, 2.49, 0.30],
      ]),
      [0.075, 0.008],
      { bone: head, color: STONE_DARK, caps: { start: "round", end: "point" }, sides: 7, name: "curved_horn" },
    );
    b.extrude(
      [[0, 0], [0.13, 0.04], [0.10, 0.23], [0.025, 0.34, "sharp"]],
      { at: [s * 0.23, 2.08, 0.54], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.045, bevel: 0.01, color: stone, bone: head, name: "pointed_ear" },
    );
    b.sweep([[s * 0.19, 1.99, 0.75], [s * 0.30, 1.91, 0.72], [s * 0.35, 1.83, 0.66]], [0.045, 0.018], {
      bone: head, color: STONE_DARK, sides: 6, name: "cheek_ridge",
    });
  }

  // Legs and huge gripping claws.
  for (const [s, leg] of [[1, hindL], [-1, hindR]] as const) {
    b.sweep(leg, [0.13, 0.105, 0.075], { bone: leg, color: stone, sides: 7, name: "powerful_hind_leg" });
    const foot = leg.tip;
    b.part(new THREE.SphereGeometry(0.13, 8, 5), bellyStone, { bone: foot, at: foot.at, name: "knuckled_foot" });
    for (let i = -1; i <= 1; i++) {
      const toeBase = [s * (0.42 + i * 0.055), 0.245, 0.28 + Math.abs(i) * 0.018] as [number, number, number];
      const toeTip = [toeBase[0] + s * (i * 0.045), 0.055, toeBase[2] + 0.16] as [number, number, number];
      b.sweep([toeBase, toeTip], [0.035, 0.006], { bone: foot, color: CLAW, caps: { start: "round", end: "point" }, sides: 6, name: "talon" });
    }
  }

  // Long dangling forearms and stone hands.
  for (const [s, arm] of [[1, armL], [-1, armR]] as const) {
    b.sweep(arm, [0.09, 0.065], { bone: arm, color: stone, sides: 7, name: "forearm" });
    b.part(new THREE.SphereGeometry(0.105, 8, 5), bellyStone, { bone: arm.tip, at: arm.tip.at, name: "clawed_hand" });
    for (let i = -1; i <= 1; i++) {
      b.spike(
        [arm.tip.at.x + i * 0.035, arm.tip.at.y - 0.01, arm.tip.at.z + 0.03],
        [0, -0.4, 0.9],
        0.15,
        0.018,
        { bone: arm.tip, color: CLAW, name: "finger_claw" },
      );
    }
  }

  // Wings: heavy stone fingers with stretched membranes, deliberately spread in a neutral readable pose.
  for (const [s, wing] of [[1, wingL], [-1, wingR]] as const) {
    b.sweep(wing, [0.11, 0.06, 0.025], { bone: wing, color: wingStone, sides: 6, name: "wing_bones" });
    const root = wing.at(0.0);
    const mid = wing.at(0.5);
    const tip = wing.at(1.0);
    const lower = [s * 0.92, 1.36, -0.10] as [number, number, number];
    b.membrane(
      catmull([root.at, mid.at, tip.at]),
      catmull([root.at, [s * 0.77, 1.47, -0.02], lower, [s * 1.20, 1.45, -0.22]]),
      { color: wingStone, thickness: 0.018, rows: 4, cols: 8, scallop: 0.16, name: "wing_membrane" },
    );
    for (let i = 0; i < 4; i++) {
      const p = wing.at(i / 3);
      b.spike(p, [s * 0.18, 0.22, -0.14], 0.18 - i * 0.025, 0.025, {
        bone: p.bone,
        color: STONE_DARK,
        name: "wing_spine",
      });
    }
  }

  // Tail, segmented and tipped like a devilish stone whip.
  b.sweep(tail, (t) => 0.105 * (1 - t) + 0.025, {
    bone: tail,
    color: stone,
    sides: 7,
    caps: { start: "round", end: "point" },
    name: "curling_tail",
  });
  for (let i = 1; i < 6; i++) {
    const p = tail.at(i / 6);
    b.stick(new THREE.CylinderGeometry(0.12 - i * 0.015, 0.12 - i * 0.015, 0.025, 6), STONE_DARK, p, {
      embed: 0.35,
      name: "tail_carved_ring",
    });
  }

  // Broad stone claws on the ledge and a few mossy carved chips.
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.065, 0.18, 6), CLAW, {
      at: [s * 0.55, 0.28, 0.22],
      rotation: [Math.PI / 2, 0, 0],
      name: "ledge_grip",
    });
  }
  for (const p of [[-0.55, 0.29, -0.25], [0.22, 0.29, -0.31], [0.58, 0.29, -0.18]]) {
    b.part(new THREE.DodecahedronGeometry(0.045, 0), mossStone, { at: p, name: "moss_chunk" });
  }

  // Tiny gothic rune plaques on the ledge front, carried as crisp SVG decals.
  const rune = svg(`<svg viewBox="0 0 64 64"><path d="M12 54L22 10L32 54M17 36H37M42 10V54M42 10L54 24L42 34L54 54" fill="none" stroke="#d6b36a" stroke-width="5" stroke-linejoin="round"/></svg>`, { size: 128 });
  for (const x of [-0.42, 0.42]) {
    b.part(new THREE.PlaneGeometry(0.16, 0.16), "#d6b36a", {
      at: [x, 0.12, 0.546],
      dir: [0, 0, 1],
      axis: "z",
      texture: rune,
      name: "gothic_rune",
    });
  }

  return b.root;
}
```
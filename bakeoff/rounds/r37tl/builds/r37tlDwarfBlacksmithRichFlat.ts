import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Blacksmith at the Anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a braided beard, horned helmet, leather apron, hammer, glowing forge tongs, and a heavy riveted anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarfBlacksmith", detail: 1 });

  const SKIN = cel("#d8915b", "#713d32");
  const SKIN_DARK = cel("#a9563d", "#542b2d");
  const HAIR = cel("#4b261e", "#24151a");
  const HAIR_LIGHT = cel("#75402a", "#3b211f");
  const STEEL = cel("#536170", "#202938");
  const STEEL_LIGHT = cel("#91a5ad", "#43515d");
  const IRON = "#292735";
  const BRASS = cel("#c78a32", "#66401f");
  const GOLD = "#efbd55";
  const LEATHER = cel("#713b29", "#351d20");
  const LEATHER_LIGHT = cel("#a66036", "#522a25");
  const APRON = cel("#354c50", "#1c2b35");
  const CLOTH = cel("#8b302d", "#421b27");
  const CREAM = cel("#ead0a0", "#937456");
  const FIRE = "#ff8a24";
  const FIRE_YELLOW = "#ffe06b";
  const EYE = animeEye({ iris: "#55c9d2", brow: true, blush: false });

  const box = (
    size: [number, number, number],
    color: any,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (bevel > 0) {
      // subtle chunky bevel impression with a second trim layer
      b.part(g, color, { at, bone, flat: true });
    } else {
      b.part(g, color, { at, bone, flat: true });
    }
  };

  const sphere = (
    radius: number,
    color: any,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    scale?: [number, number, number],
  ) => {
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      flat: true,
    });
  };

  const cyl = (
    radius: number,
    length: number,
    color: any,
    at: THREE.Vector3 | [number, number, number],
    dir: [number, number, number],
    bone?: any,
    sides = 8,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, length, sides), color, {
      at,
      dir,
      bone,
      flat: true,
    });
  };

  // ---------------------------------------------------------------------------
  // Skeleton first: stout spine, neck, head, jaw, arms and legs.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 0.78, 0], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.78, 0],
      [0, 1.00, 0.015],
      [0, 1.18, 0.02],
    ]),
    { parent: hips, names: ["spine", "chest", "shoulders"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.18, 0.02],
      [0, 1.29, 0.045],
      [0, 1.38, 0.08],
    ]),
    { parent: spine.tip, names: ["neck", "neckTop", "head"], role: "neck" },
  );

  const head = neck.tip;
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.355, 0.19],
    dir: [0, -0.08, 1],
    role: "jaw",
  });

  const leftArmPts = limb(
    [0.29, 1.15, 0.02],
    [0.48, 0.82, 0.36],
    [0.27, 0.30, 0.22],
    [[1, -0.2, 0], [1, 0.2, 0]],
  );
  const rightArmPts = limb(
    [-0.29, 1.15, 0.02],
    [-0.52, 0.91, 0.43],
    [0.27, 0.28, 0.23],
    [[-1, -0.2, 0], [-1, 0.2, 0]],
  );
  const armL = b.chain("armL", leftArmPts, {
    parent: spine.tip,
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", rightArmPts, {
    parent: spine.tip,
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const legL = b.chain(
    "legL",
    [
      [0.17, 0.76, 0],
      [0.21, 0.46, 0.02],
      [0.19, 0.18, 0.10],
      [0.20, 0.095, 0.22],
    ],
    { parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.2, 0, 0.22] },
  );
  const legR = b.chain(
    "legR",
    [
      [-0.17, 0.76, 0],
      [-0.21, 0.46, 0.02],
      [-0.19, 0.18, 0.10],
      [-0.20, 0.095, 0.22],
    ],
    { parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.2, 0, 0.22] },
  );

  // ---------------------------------------------------------------------------
  // Body and clothing: barrel chest, belt, apron and shoulder armor.
  // ---------------------------------------------------------------------------

  b.sweep(spine, [0.28, 0.25], {
    color: cel("#5a3a31", "#2d2025"),
    section: { ngon: 8 },
    caps: "round",
  });

  box([0.48, 0.31, 0.36], APRON, [0, 0.94, 0.225], spine.joints[0]);
  box([0.39, 0.30, 0.025], LEATHER_LIGHT, [0, 0.94, 0.415], spine.joints[0]);
  box([0.45, 0.055, 0.39], LEATHER, [0, 0.81, 0.02], hips);
  for (const x of [-0.18, -0.06, 0.06, 0.18])
    sphere(0.022, GOLD, [x, 0.81, 0.225], hips);

  // apron straps and large brass buckle
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.16, 1.13, 0.23],
      [s * 0.16, 0.84, 0.245],
      0.026,
      LEATHER_LIGHT,
      { bone: spine.tip },
    );
    cyl(0.035, 0.018, GOLD, [s * 0.16, 1.03, 0.265], [0, 0, 1], spine.tip, 6);
  }
  box([0.14, 0.12, 0.035], BRASS, [0, 0.82, 0.255], hips);
  box([0.065, 0.045, 0.012], IRON, [0, 0.82, 0.279], hips);

  // shoulder pauldrons
  for (const s of [-1, 1]) {
    sphere(0.17, STEEL, [s * 0.31, 1.16, 0.02], spine.tip, [1.25, 0.65, 1.0]);
    box([0.17, 0.075, 0.17], STEEL_LIGHT, [s * 0.35, 1.20, 0.02], spine.tip);
    for (let i = 0; i < 3; i++)
      sphere(0.018, GOLD, [s * (0.29 + i * 0.055), 1.16, 0.145], spine.tip);
  }

  // ---------------------------------------------------------------------------
  // Legs, boots and buckles.
  // ---------------------------------------------------------------------------

  b.sweep(legL, [0.115, 0.13], { color: LEATHER, section: { ngon: 6 } });
  b.sweep(legR, [0.115, 0.13], { color: LEATHER, section: { ngon: 6 } });

  for (const s of [-1, 1]) {
    box([0.19, 0.22, 0.23], LEATHER_LIGHT, [s * 0.19, 0.27, 0.06], s > 0 ? legL.joints[1] : legR.joints[1]);
    box([0.23, 0.12, 0.34], STEEL, [s * 0.20, 0.08, 0.17], s > 0 ? legL.tip : legR.tip);
    box([0.13, 0.07, 0.025], GOLD, [s * 0.20, 0.17, 0.19], s > 0 ? legL.joints[1] : legR.joints[1]);
    box([0.25, 0.035, 0.36], IRON, [s * 0.20, 0.025, 0.18], s > 0 ? legL.tip : legR.tip);
  }

  // ---------------------------------------------------------------------------
  // Head, ears, helmet, nose, eyes and magnificent beard.
  // ---------------------------------------------------------------------------

  sphere(0.235, SKIN, [0, 1.48, 0.13], head, [1.02, 1.0, 0.88]);
  // ears
  for (const s of [-1, 1]) {
    sphere(0.095, SKIN_DARK, [s * 0.22, 1.49, 0.115], head, [0.55, 1, 0.65]);
    sphere(0.055, CREAM, [s * 0.235, 1.49, 0.135], head, [0.5, 1, 0.55]);
  }

  // nose and cheek planes
  sphere(0.072, SKIN_DARK, [0, 1.435, 0.345], head, [1.0, 0.8, 0.8]);
  sphere(0.16, HAIR, [0, 1.35, 0.19], jaw, [1.15, 0.8, 0.78]);
  sphere(0.12, HAIR_LIGHT, [0, 1.27, 0.22], jaw, [1.2, 0.75, 0.75]);

  // beard braids
  for (const s of [-1, 1]) {
    const braid = catmull([
      [s * 0.095, 1.37, 0.25],
      [s * 0.12, 1.25, 0.28],
      [s * 0.10, 1.12, 0.29],
      [s * 0.14, 1.04, 0.31],
    ]);
    b.sweep(braid, (t) => 0.045 * (1 - t * 0.55), {
      color: HAIR_LIGHT,
      sides: 7,
      caps: "round",
    });
    for (let i = 0; i < 5; i++) {
      const t = i / 5;
      const p = braid.at(t);
      sphere(0.048 - i * 0.004, HAIR, p, head);
    }
  }
  // moustache
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [0, 1.405, 0.33],
        [s * 0.075, 1.40, 0.35],
        [s * 0.14, 1.37, 0.32],
      ]),
      [0.035, 0.008],
      { color: HAIR, caps: "round" },
    );
  }

  // eyes as decals on the front of the head
  for (const s of [-1, 1]) {
    b.decal(head, EYE, {
      at: [s * 0.095, 1.505, 0.345],
      dir: [0, 0, 1],
      size: [0.105, 0.125],
      mirror: s > 0,
      lift: 0.006,
      bone: head,
    });
  }

  // helmet cap, rim, horns and crest
  b.lathe(
    [
      [0, 1.48],
      [0.17, 1.48],
      [0.205, 1.51],
      [0.19, 1.64],
      [0.13, 1.73],
      [0, 1.76],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], color: STEEL, bone: head, segments: 10 },
  );
  b.sweep(
    catmull([
      [-0.21, 1.51, 0.02],
      [0, 1.47, 0.22],
      [0.21, 1.51, 0.02],
    ]),
    0.026,
    { color: GOLD, caps: "round", bone: head },
  );
  for (const s of [-1, 1]) {
    b.spike([s * 0.17, 1.65, 0.01], [s * 0.25, 1.82, -0.01], null, 0.052, {
      color: STEEL_LIGHT,
      bone: head,
    });
    b.spike([s * 0.11, 1.72, 0.01], [s * 0.16, 1.84, 0.02], null, 0.032, {
      color: GOLD,
      bone: head,
    });
  }

  // ---------------------------------------------------------------------------
  // Arms, gauntlets, hands and hammer.
  // ---------------------------------------------------------------------------

  b.sweep(armL, [0.105, 0.075], { color: LEATHER_LIGHT, section: { ngon: 6 } });
  b.sweep(armR, [0.105, 0.075], { color: LEATHER_LIGHT, section: { ngon: 6 } });

  for (const s of [-1, 1]) {
    const arm = s > 0 ? armL : armR;
    box([0.15, 0.15, 0.17], STEEL, [s * 0.47, 0.84, 0.36], arm.tip);
    box([0.17, 0.055, 0.18], STEEL_LIGHT, [s * 0.47, 0.91, 0.405], arm.tip);
    sphere(0.085, SKIN, [s * 0.48, 0.76, 0.40], arm.tip);
    for (let i = -1; i <= 1; i++)
      b.spike([s * (0.48 + i * 0.035), 0.76, 0.43], [s * (0.48 + i * 0.035), 0.71, 0.45], null, 0.014, {
        color: SKIN,
        bone: arm.tip,
      });
  }

  // Hammer held in the left hand, raised slightly over the anvil.
  const hammerHead = [0.70, 0.88, 0.47] as [number, number, number];
  const hammerGrip = [0.49, 0.76, 0.41] as [number, number, number];
  b.rod(hammerGrip, hammerHead, 0.027, HAIR, { bone: armL.tip });
  box([0.22, 0.16, 0.14], STEEL, [0.72, 0.91, 0.47], armL.tip);
  box([0.25, 0.055, 0.17], STEEL_LIGHT, [0.72, 0.995, 0.47], armL.tip);
  cyl(0.045, 0.18, GOLD, [0.72, 0.91, 0.47], [1, 0, 0], armL.tip, 8);
  sphere(0.035, FIRE_YELLOW, [0.72, 1.10, 0.47], armL.tip);

  // ---------------------------------------------------------------------------
  // Heavy anvil and forge props, kept simpler than the hero character.
  // ---------------------------------------------------------------------------

  const anvilBone = b.joint("anvilRoot", { at: [0, 0.02, 0.72], role: "hinge" });
  box([0.55, 0.12, 0.32], IRON, [0, 0.83, 0.72], anvilBone);
  box([0.40, 0.10, 0.27], STEEL_LIGHT, [0, 0.92, 0.72], anvilBone);
  box([0.30, 0.07, 0.23], STEEL, [0, 0.99, 0.72], anvilBone);
  box([0.18, 0.34, 0.18], IRON, [0, 0.62, 0.72], anvilBone);
  box([0.46, 0.12, 0.26], IRON, [0, 0.43, 0.72], anvilBone);
  box([0.66, 0.08, 0.18], STEEL, [0, 0.36, 0.72], anvilBone);
  for (const x of [-0.22, 0.22])
    sphere(0.035, GOLD, [x, 0.86, 0.56], anvilBone);

  // anvil horn
  b.spike([0.24, 0.95, 0.72], [0.59, 0.95, 0.72], null, 0.105, {
    color: STEEL,
    bone: anvilBone,
  });

  // forge basin to the right
  box([0.52, 0.18, 0.42], IRON, [0.78, 0.14, 0.55]);
  box([0.58, 0.06, 0.48], STEEL, [0.78, 0.25, 0.55]);
  sphere(0.17, FIRE, [0.78, 0.31, 0.55], undefined, [1.2, 0.45, 1.0]);
  sphere(0.10, FIRE_YELLOW, [0.78, 0.35, 0.55], undefined, [1.0, 0.4, 0.9]);
  for (const p of [
    [0.64, 0.42, 0.52],
    [0.91, 0.45, 0.57],
    [0.78, 0.51, 0.55],
    [0.72, 0.48, 0.63],
  ] as [number, number, number][]) {
    sphere(0.018, FIRE_YELLOW, p);
  }

  // tongs leaning against the forge
  b.rod([0.94, 0.28, 0.60], [1.12, 0.66, 0.64], 0.018, IRON);
  b.rod([1.02, 0.31, 0.57], [1.21, 0.66, 0.64], 0.018, IRON);
  b.spike([1.12, 0.66, 0.64], [1.20, 0.78, 0.64], null, 0.022, { color: IRON });
  b.spike([1.21, 0.66, 0.64], [1.29, 0.78, 0.64], null, 0.022, { color: IRON });

  // loose ingot and a few floor sparks
  box([0.18, 0.07, 0.09], GOLD, [0.35, 0.055, 0.92]);
  box([0.14, 0.06, 0.08], STEEL_LIGHT, [-0.39, 0.055, 0.85]);
  for (const p of [
    [0.47, 0.035, 0.54],
    [0.59, 0.035, 0.48],
    [0.96, 0.035, 0.45],
    [0.91, 0.035, 0.76],
  ] as [number, number, number][]) {
    sphere(0.012, FIRE_YELLOW, p);
  }

  return b.root;
}

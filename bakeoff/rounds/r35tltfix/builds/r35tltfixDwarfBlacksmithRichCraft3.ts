import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "dwarf blacksmith at anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with braided beard, helmet, leather apron, hammer, forge and a heavy anvil.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf_blacksmith", detail: 1 });

  const SKIN = cel("#c9875d", "#713d38");
  const SKIN_LIGHT = cel("#e4a875", "#8f5147");
  const RED = cel("#9e3027", "#471b25");
  const LEATHER = cel("#51301f", "#24151a");
  const LEATHER_L = cel("#8b5930", "#3d241f");
  const IRON = cel("#4a5059", "#20252d");
  const IRON_HI = cel("#87909a", "#3a414b");
  const BRASS = cel("#d59d35", "#67431f");
  const GOLD = "#ffd873";
  const BEARD = cel("#613d2d", "#281d21");
  const BEARD_HI = cel("#946243", "#3d2928");
  const WHITE = "#fff2d2";
  const BOOT = cel("#302329", "#17131a");
  const FIRE = "#ff8b25";
  const COAL = "#e3321f";

  const box = (
    size: [number, number, number],
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone?: any,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: THREE.Vector3 | [number, number, number],
    color: any,
    bone?: any,
    scale?: [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      bone,
      scale,
      flat: true,
    });

  const capsule = (a: any, c: any, radius: number, color: any, bone?: any) =>
    b.capsule(a, c, radius, { color, bone, sides: 7 });

  // Skeleton first: compact, broad, readable heroic proportions.
  const hips = b.joint("hips", {
    at: [0, 0.82, 0],
    dir: [0, 1, 0.08],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, 0],
      [0, 1.05, 0.02],
      [0, 1.28, 0.04],
    ]),
    { parent: hips, names: ["pelvis", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.28, 0.04],
      [0, 1.42, 0.08],
      [0, 1.53, 0.13],
    ]),
    { parent: spine.joints[1], names: ["neck", "neckTop"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.58, 0.15],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.49, 0.24],
    dir: [0, -0.03, 1],
    role: "jaw",
    group: "head",
  });

  const legL = b.chain(
    "legL",
    limb([0.19, 0.79, 0], [0.23, 0.16, 0.1], [0.34, 0.31, 0.23], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    { parent: hips, names: ["hipL", "kneeL", "ankleL"], role: "leg", contact: [0.23, 0, 0.1] },
  );
  const legR = b.chain(
    "legR",
    limb([-0.19, 0.79, 0], [-0.23, 0.16, 0.1], [0.34, 0.31, 0.23], [
      [0, 0, 1],
      [0, 0, -1],
    ]),
    { parent: hips, names: ["hipR", "kneeR", "ankleR"], role: "leg", contact: [-0.23, 0, 0.1] },
  );

  const armL = b.chain(
    "armL",
    catmull([
      [0.42, 1.27, 0.06],
      [0.56, 1.16, 0.22],
      [0.51, 0.91, 0.47],
      [0.42, 0.77, 0.62],
    ]),
    { parent: spine.joints[1], names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.42, 1.27, 0.06],
      [-0.56, 1.16, 0.22],
      [-0.48, 0.92, 0.5],
      [-0.35, 0.76, 0.65],
    ]),
    { parent: spine.joints[1], names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  // Body, apron, belt and boots.
  b.sweep(spine, (t) => 0.27 - t * 0.035, {
    color: RED,
    section: { ngon: 8 },
    sectors: [[110, 250, LEATHER]],
  });
  b.sweep(neck, [0.17, 0.13], { color: SKIN, section: { ngon: 8 } });

  box([0.62, 0.17, 0.26], [0, 1.08, 0.27], LEATHER, spine.joints[1]);
  box([0.56, 0.48, 0.06], [0, 1.05, 0.31], LEATHER_L, spine.joints[1]);
  b.sweep(
    catmull([
      [-0.32, 1.2, 0.08],
      [0, 1.2, 0.22],
      [0.32, 1.2, 0.08],
      [-0.32, 1.2, 0.08],
    ], { closed: true }),
    0.035,
    { color: BRASS, bone: spine.joints[1] },
  );

  for (const s of [-1, 1]) {
    b.sweep(s > 0 ? legL : legR, [0.14, 0.105], {
      color: BOOT,
      skin: "rigid",
      section: { ngon: 6 },
    });
    sphere(0.13, [s * 0.23, 0.13, 0.1], BOOT);
    box([0.19, 0.08, 0.32], [s * 0.23, 0.075, 0.2], BOOT);
    box([0.22, 0.045, 0.14], [s * 0.23, 0.125, 0.36], IRON);
  }

  // Arms, bracers, large mitten-like hands.
  b.sweep(armL, [0.105, 0.075], { color: RED, section: { ngon: 7 } });
  b.sweep(armR, [0.105, 0.075], { color: RED, section: { ngon: 7 } });
  for (const s of [-1, 1]) {
    const a = s > 0 ? armL : armR;
    const hand = a.joints[a.joints.length - 1];
    b.sweep(
      catmull([
        a.at(0.72).at,
        a.at(0.86).at,
        a.at(1).at,
      ]),
      [0.09, 0.065],
      { color: LEATHER_L, bone: a.tip, section: { ngon: 6 } },
    );
    sphere(0.105, hand.at, SKIN_LIGHT, hand, [1, 0.8, 1.1]);
    for (let i = 0; i < 3; i++) {
      const p = hand.local([s * (0.045 + i * 0.035), 0.04, 0.02]);
      b.spike(p, [0, 0, 1], 0.075, 0.018, { color: SKIN, bone: hand });
    }
  }

  // Head and expressive face, built before helmet.
  const skull = sphere(0.31, [0, 1.59, 0.19], SKIN, head, [1.03, 1.0, 0.9]);
  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const eye = sphere(0.066, [s * 0.115, 1.65, 0.445], WHITE, head, [0.85, 1, 0.45]);
    sphere(0.032, [s * 0.115, 1.65, 0.48], INK, head);
    sphere(0.012, [s * 0.102, 1.673, 0.505], WHITE, head);
    // Strong angular brows.
    box([0.16, 0.035, 0.045], [s * 0.11, 1.745, 0.44], BEARD, head, [0, 0, s * -0.22]);
  }

  // Nose, ears and open lower jaw.
  sphere(0.095, [0, 1.575, 0.47], SKIN_LIGHT, head, [1.0, 0.8, 0.8]);
  for (const s of [-1, 1]) {
    sphere(0.12, [s * 0.29, 1.59, 0.17], SKIN, head, [0.55, 1, 0.7]);
    sphere(0.065, [s * 0.3, 1.59, 0.225], SKIN_LIGHT, head);
  }
  b.sweep(
    catmull([
      [-0.14, 1.51, 0.39],
      [0, 1.47, 0.48],
      [0.14, 1.51, 0.39],
    ]),
    0.018,
    { color: INK, bone: jaw },
  );
  box([0.26, 0.075, 0.2], [0, 1.45, 0.34], SKIN, jaw);
  box([0.18, 0.025, 0.11], [0, 1.475, 0.45], INK, jaw);

  // Massive braided beard: broad silhouette plus layered pointed tufts.
  b.sweep(
    catmull([
      [0, 1.54, 0.27],
      [0, 1.37, 0.36],
      [0, 1.18, 0.25],
    ]),
    [0.22, 0.09],
    { color: BEARD, bone: head, section: { ngon: 7 } },
  );
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (0.055 + i * 0.045);
      const y = 1.46 - i * 0.065;
      b.spike([x, y, 0.38 + i * 0.012], [x * 0.35, -0.22, 0.06], 0.18, 0.055, {
        color: i % 2 ? BEARD_HI : BEARD,
        bone: head,
      });
    }
    b.sweep(
      catmull([
        [s * 0.1, 1.51, 0.4],
        [s * 0.13, 1.36, 0.42],
        [s * 0.2, 1.2, 0.32],
      ]),
      0.018,
      { color: BRASS, bone: head },
    );
  }

  // Helmet with horns, cheek guards and rivets.
  b.lathe(
    [
      [0, 0],
      [0.28, 0],
      [0.31, 0.06],
      [0.29, 0.19],
      [0.22, 0.27],
      [0, 0.3],
    ],
    { at: [0, 1.7, 0.14], axis: [0, 1, 0], bone: head, segments: 10, color: IRON },
  );
  box([0.43, 0.06, 0.12], [0, 1.55, 0.38], IRON_HI, head);
  for (const s of [-1, 1]) {
    b.spike([s * 0.23, 1.78, 0.14], [s * 0.22, 0.28, -0.02], 0.27, 0.07, {
      color: IRON,
      bone: head,
    });
    box([0.09, 0.28, 0.16], [s * 0.25, 1.49, 0.18], IRON, head);
    sphere(0.025, [s * 0.25, 1.57, 0.29], BRASS, head);
  }
  box([0.07, 0.16, 0.035], [0, 1.76, 0.43], BRASS, head);

  // Anvil: chunky stone/iron pedestal directly in front of the dwarf.
  box([0.56, 0.42, 0.5], [0, 0.28, 0.67], IRON, undefined);
  box([0.72, 0.16, 0.46], [0, 0.57, 0.67], IRON_HI);
  box([0.48, 0.12, 0.31], [0, 0.7, 0.67], IRON);
  const horn = b.sweep(
    catmull([
      [0.23, 0.69, 0.67],
      [0.42, 0.7, 0.69],
      [0.62, 0.67, 0.7],
    ]),
    [0.11, 0.015],
    { color: IRON_HI, caps: { start: "flat", end: "point" }, section: { ngon: 7 } },
  );
  b.sweep(
    catmull([
      [-0.25, 0.69, 0.67],
      [-0.42, 0.7, 0.69],
    ]),
    [0.1, 0.03],
    { color: IRON_HI, caps: "flat" },
  );
  for (const x of [-0.28, 0, 0.28]) sphere(0.025, [x, 0.67, 0.55], BRASS);

  // Hammer held over the anvil.
  const hammerHead = box(
    [0.34, 0.18, 0.16],
    [-0.37, 0.96, 0.69],
    IRON_HI,
    armR.joints[armR.joints.length - 1],
  );
  b.sweep(
    catmull([
      [-0.37, 0.82, 0.7],
      [-0.31, 0.62, 0.72],
      [-0.24, 0.47, 0.73],
    ]),
    0.035,
    { color: LEATHER_L, bone: armR.joints[armR.joints.length - 1], section: { ngon: 6 } },
  );
  box([0.38, 0.045, 0.045], [-0.37, 0.96, 0.69], BRASS, armR.tip);
  sphere(0.045, [-0.37, 0.96, 0.69], IRON, armR.tip, [1, 0.7, 1]);

  // Small forge behind the anvil, glowing coals and stylized flames.
  box([0.72, 0.3, 0.48], [0, 0.18, -0.28], IRON);
  box([0.54, 0.07, 0.34], [0, 0.36, -0.28], IRON_HI);
  for (const x of [-0.16, -0.05, 0.08, 0.2]) {
    const coal = sphere(0.045, [x, 0.41, -0.28], COAL);
    glow(coal, 1.8);
  }
  for (const x of [-0.14, 0, 0.14]) {
    const flame = b.spike([x, 0.43, -0.28], [x * 0.4, 0.32, 0], 0.28, 0.055, {
      color: FIRE,
    });
    glow(flame, 1.5);
  }

  // A few deliberate rivets and belt pouches finish the silhouette.
  for (const s of [-1, 1]) {
    box([0.12, 0.16, 0.13], [s * 0.29, 1.07, 0.3], LEATHER_L, spine.joints[1]);
    sphere(0.022, [s * 0.29, 1.13, 0.37], BRASS, spine.joints[1]);
  }
  for (let i = 0; i < 5; i++) {
    sphere(0.018, [-0.24 + i * 0.12, 1.17, 0.36], BRASS, spine.joints[1]);
  }

  // Ensure the resting silhouette reads as a working, grounded character.
  b.pose(jaw, { axis: [1, 0, 0], deg: -8 });

  return b.root;
}

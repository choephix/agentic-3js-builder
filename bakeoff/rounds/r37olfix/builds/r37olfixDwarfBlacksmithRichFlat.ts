import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description:
    "A chunky Warcraft-inspired dwarf blacksmith with a braided beard, leather apron, hammer, glowing forge-hot anvil, and heavy ironwork details.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf-blacksmith", detail: 1 });

  const SKIN = cel("#d59462", "#713d32");
  const SKIN_LIGHT = cel("#f0b477", "#9b5540");
  const HAIR = cel("#5b3022", "#24151a");
  const BEARD = furEdge(HAIR, "#28191a", {
    axis: [0, 1, 0],
    level: -0.05,
    teeth: 0.13,
    period: 0.045,
    along: [1, 0, 0],
  });
  const RED = cel("#8f241c", "#42151c");
  const LEATHER = cel("#71351f", "#28151d");
  const APRON = cel("#302c2d", "#15151b");
  const IRON = cel("#393b43", "#171920");
  const DARK_IRON = "#171820";
  const STEEL = cel("#8e96a3", "#343945");
  const BRASS = cel("#d39b3d", "#68431e");
  const GOLD = cel("#f2c65d", "#895b22");
  const WOOD = cel("#6e3c24", "#2b1a18");
  const FIRE = "#ff7028";
  const FIRE_LIGHT = "#ffd36a";
  const EYE = animeEye({ iris: "#6ed5ff", blush: false, brow: true });

  const box = (size: [number, number, number], color: any, at: any, bone: any, name?: string) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      name,
      flat: true,
    });

  const sphere = (r: number, color: any, at: any, bone: any, name?: string, scale?: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, {
      at,
      bone,
      name,
      scale,
      flat: true,
    });

  const cyl = (
    r: number,
    h: number,
    color: any,
    at: any,
    bone: any,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 8), color, {
      at,
      bone,
      dir,
      name,
      flat: true,
    });

  // ---------------------------------------------------------------------------
  // Skeleton first: one readable neutral rest pose, feet planted on the floor.
  // ---------------------------------------------------------------------------

  const pelvis = b.joint("pelvis", { at: [0, 0.88, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.82, 0],
      [0, 1.08, 0.01],
      [0, 1.34, 0.02],
    ]),
    { parent: pelvis, names: ["spineLower", "spineUpper", "chest"], role: "spine" },
  );
  const chest = spine.tip!;
  const neck = b.chain(
    "neck",
    [
      [0, 1.34, 0.02],
      [0, 1.51, 0.04],
      [0, 1.63, 0.08],
    ],
    { parent: chest, names: ["neck", "neckTop", "head"], role: "neck" },
  );
  const head = neck.tip!;

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.54, 0.27],
    dir: [0, -0.12, 1],
    role: "jaw",
  });

  const legPointsL = limb([0.17, 0.82, 0], [0.18, 0.14, 0.08], [0.28, 0.3, 0.2], [
    [0, 0, 1],
    [0, 0, -1],
  ]);
  const legPointsR = limb([-0.17, 0.82, 0], [-0.18, 0.14, 0.08], [0.28, 0.3, 0.2], [
    [0, 0, 1],
    [0, 0, -1],
  ]);
  const legL = b.chain("legL", legPointsL, {
    parent: pelvis,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.18, 0, 0.08],
  });
  const legR = b.chain("legR", legPointsR, {
    parent: pelvis,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.18, 0, 0.08],
  });

  const armL = b.chain(
    "armL",
    [
      [0.27, 1.32, 0.03],
      [0.48, 1.22, 0.08],
      [0.62, 1.03, 0.18],
      [0.72, 0.91, 0.28],
    ],
    { parent: chest, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    [
      [-0.27, 1.32, 0.03],
      [-0.48, 1.22, 0.08],
      [-0.62, 1.03, 0.18],
      [-0.72, 0.91, 0.28],
    ],
    { parent: chest, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  const hammerHandle = b.chain(
    "hammerHandle",
    [
      [0.72, 0.91, 0.28],
      [0.79, 1.1, 0.34],
      [0.83, 1.31, 0.39],
    ],
    { parent: armL.tip!, names: ["hammerGrip", "hammerMid", "hammerHead"], role: "arm" },
  );

  // ---------------------------------------------------------------------------
  // Feet, legs, pelvis and barrel chest.
  // ---------------------------------------------------------------------------

  b.sweep(legL, (t) => 0.105 - t * 0.025, {
    color: LEATHER,
    section: { ngon: 6 },
    name: "legL",
  });
  b.sweep(legR, (t) => 0.105 - t * 0.025, {
    color: LEATHER,
    section: { ngon: 6 },
    name: "legR",
  });

  box([0.22, 0.12, 0.37], DARK_IRON, [0.18, 0.08, 0.13], legL.tip, "bootL");
  box([0.22, 0.12, 0.37], DARK_IRON, [-0.18, 0.08, 0.13], legR.tip, "bootR");
  box([0.22, 0.045, 0.39], BRASS, [0.18, 0.145, 0.13], legL.tip, "bootSoleL");
  box([0.22, 0.045, 0.39], BRASS, [-0.18, 0.145, 0.13], legR.tip, "bootSoleR");

  b.sweep(spine, [0.29, 0.35], {
    color: RED,
    section: "box",
    name: "barrelBody",
  });
  sphere(0.32, LEATHER, [0, 0.87, -0.01], pelvis, "beltBody", [1.1, 0.65, 0.9]);

  // Belt and large brass buckle.
  b.sweep(
    catmull([
      [-0.28, 0.91, 0],
      [0, 0.91, 0.28],
      [0.28, 0.91, 0],
      [0, 0.91, -0.25],
    ], { closed: true }),
    0.035,
    { color: DARK_IRON, name: "belt" },
  );
  box([0.13, 0.14, 0.035], GOLD, [0, 0.91, 0.305], pelvis, "buckle");
  box([0.07, 0.07, 0.025], DARK_IRON, [0, 0.91, 0.328], pelvis, "buckleInset");

  // Broad shoulders and arms.
  sphere(0.16, RED, [0.28, 1.3, 0.03], chest, "shoulderPadL", [1, 0.9, 1.1]);
  sphere(0.16, RED, [-0.28, 1.3, 0.03], chest, "shoulderPadR", [1, 0.9, 1.1]);
  b.sweep(armL, [0.11, 0.075], { color: LEATHER, section: { ngon: 6 }, name: "armL" });
  b.sweep(armR, [0.11, 0.075], { color: LEATHER, section: { ngon: 6 }, name: "armR" });
  sphere(0.105, SKIN_LIGHT, armL.tip!.at, armL.tip!, "fistL", [1.1, 0.9, 1.15]);
  sphere(0.105, SKIN_LIGHT, armR.tip!.at, armR.tip!, "fistR", [1.1, 0.9, 1.15]);

  // Finger blocks on the free hand.
  for (let i = -1; i <= 1; i++) {
    b.part(new THREE.CapsuleGeometry(0.025, 0.1, 3, 6), SKIN, {
      at: [0.72 + i * 0.04, 0.85, 0.34],
      bone: armL.tip,
      dir: [0.1, -0.25, 1],
      name: `fingerL${i + 2}`,
      flat: true,
    });
  }

  // ---------------------------------------------------------------------------
  // Apron, chest straps and smithing details.
  // ---------------------------------------------------------------------------

  box([0.43, 0.54, 0.035], APRON, [0, 1.08, 0.315], chest, "apron");
  box([0.48, 0.045, 0.05], BRASS, [0, 1.33, 0.326], chest, "apronTop");
  box([0.055, 0.055, 0.025], GOLD, [0.17, 1.18, 0.345], chest, "apronRivetL");
  box([0.055, 0.055, 0.025], GOLD, [-0.17, 1.18, 0.345], chest, "apronRivetR");
  b.rod([0.18, 1.38, 0.23], [0.18, 0.9, 0.34], 0.024, BRASS, { bone: chest, name: "strapL" });
  b.rod([-0.18, 1.38, 0.23], [-0.18, 0.9, 0.34], 0.024, BRASS, { bone: chest, name: "strapR" });

  // Tool pouch.
  box([0.2, 0.18, 0.12], LEATHER, [0.23, 0.82, 0.28], pelvis, "toolPouch");
  box([0.21, 0.035, 0.025], BRASS, [0.23, 0.91, 0.345], pelvis, "pouchBuckle");

  // ---------------------------------------------------------------------------
  // Head, ears, nose, eyes, brows and enormous braided beard.
  // ---------------------------------------------------------------------------

  sphere(0.285, SKIN, [0, 1.64, 0.1], head, "head", [1.02, 1.05, 0.92]);
  sphere(0.205, SKIN_LIGHT, [0, 1.59, 0.285], head, "muzzle", [1.1, 0.82, 0.72]);
  sphere(0.07, "#4a201c", [0, 1.6, 0.45], head, "nose", [1.2, 0.75, 0.8]);

  for (const s of [-1, 1]) {
    sphere(0.11, SKIN, [s * 0.27, 1.68, 0.08], head, `ear${s}`, [0.65, 1.1, 0.75]);
    box([0.035, 0.11, 0.08], HAIR, [s * 0.285, 1.69, 0.1], head, `earHair${s}`);
  }

  for (const s of [-1, 1]) {
    b.decal(head, EYE, {
      at: [s * 0.115, 1.7, 0.326],
      dir: [0, 0.08, 1],
      size: [0.12, 0.15],
      mirror: s > 0,
      lift: 0.004,
      name: `eye${s}`,
    });
    box([0.13, 0.035, 0.035], HAIR, [s * 0.12, 1.795, 0.32], head, `brow${s}`);
  }

  // Hair cap and side locks.
  sphere(0.29, HAIR, [0, 1.82, 0.04], head, "hairCap", [1.05, 0.45, 0.95]);
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.24, 1.78, 0.1],
        [s * 0.31, 1.62, 0.13],
        [s * 0.28, 1.47, 0.2],
      ]),
      [0.07, 0.025],
      { color: HAIR, bone: head, name: `sideburn${s}` },
    );
  }

  // Big segmented beard, root-to-tip silhouette.
  b.sweep(
    catmull([
      [0, 1.55, 0.28],
      [0, 1.42, 0.34],
      [0, 1.22, 0.32],
      [0, 1.07, 0.22],
      [0, 1.0, 0.11],
    ]),
    (t) => 0.17 * (1 - t * 0.72),
    { color: BEARD, bone: jaw, section: { ngon: 6 }, name: "heroicBeard" },
  );
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.1, 1.52, 0.31],
        [s * 0.17, 1.38, 0.34],
        [s * 0.15, 1.2, 0.27],
      ]),
      [0.07, 0.025],
      { color: HAIR, bone: jaw, name: `beardFlare${s}` },
    );
  }
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.055;
    b.sweep(
      catmull([
        [x, 1.43, 0.405],
        [x * 1.25, 1.28, 0.43],
        [x * 0.7, 1.09, 0.3],
      ]),
      0.018,
      { color: GOLD, bone: jaw, name: `beardTie${i}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Helmet, horns, crest and goggles.
  // ---------------------------------------------------------------------------

  b.lathe(
    [
      [0, 0],
      [0.24, 0],
      [0.29, 0.05],
      [0.28, 0.13],
      [0.22, 0.22],
      [0, 0.25],
    ],
    { at: [0, 1.84, 0.03], bone: head, color: DARK_IRON, segments: 10, name: "smithHelmet" },
  );
  box([0.42, 0.055, 0.34], STEEL, [0, 1.78, 0.17], head, "helmetBrim");
  box([0.07, 0.23, 0.06], RED, [0, 1.96, 0.01], head, "helmetCrest");
  for (const s of [-1, 1]) {
    b.spike([s * 0.22, 1.88, 0.02], [s * 0.25, 0.15, -0.15], 0.2, 0.045, {
      color: BRASS,
      bone: head,
      name: `helmetRivet${s}`,
    });
  }

  // Goggles resting above the eyes.
  for (const s of [-1, 1]) {
    cyl(0.07, 0.025, BRASS, [s * 0.115, 1.81, 0.32], head, [0, 0, 1], `goggle${s}`);
    cyl(0.047, 0.028, FIRE_LIGHT, [s * 0.115, 1.81, 0.341], head, [0, 0, 1], `goggleGlass${s}`);
  }
  b.rod([-0.115, 1.81, 0.35], [0.115, 1.81, 0.35], 0.012, BRASS, { bone: head, name: "goggleBridge" });

  // ---------------------------------------------------------------------------
  // Hammer held in the left hand.
  // ---------------------------------------------------------------------------

  b.sweep(hammerHandle, [0.035, 0.024], {
    color: WOOD,
    bone: armL.tip,
    caps: "round",
    name: "hammerHandle",
  });
  box([0.27, 0.16, 0.19], DARK_IRON, [0.83, 1.39, 0.42], hammerHandle.tip, "hammerHead");
  box([0.33, 0.045, 0.22], STEEL, [0.83, 1.485, 0.42], hammerHandle.tip, "hammerTop");
  box([0.28, 0.04, 0.23], BRASS, [0.83, 1.31, 0.42], hammerHandle.tip, "hammerBand");

  // ---------------------------------------------------------------------------
  // Anvil: staged beside him, scaled as a believable blacksmith prop.
  // ---------------------------------------------------------------------------

  const anvilBone = b.joint("anvil", { at: [0.92, 0.48, 0.28], dir: [0, 1, 0], role: "hinge" });
  box([0.58, 0.16, 0.34], DARK_IRON, [0.92, 0.77, 0.28], anvilBone, "anvilFace");
  box([0.42, 0.16, 0.31], IRON, [0.92, 0.61, 0.28], anvilBone, "anvilShoulder");
  box([0.27, 0.27, 0.25], IRON, [0.92, 0.4, 0.28], anvilBone, "anvilWaist");
  box([0.48, 0.08, 0.36], DARK_IRON, [0.92, 0.22, 0.28], anvilBone, "anvilFoot");
  box([0.16, 0.08, 0.13], STEEL, [0.92, 0.88, 0.28], anvilBone, "anvilHorn");
  b.spike([1.18, 0.79, 0.28], [1, 0.12, 0], 0.25, 0.075, {
    color: STEEL,
    bone: anvilBone,
    name: "anvilHorn",
  });

  // Orange forge-hot face and decorative rivets.
  box([0.43, 0.018, 0.23], FIRE, [0.92, 0.858, 0.28], anvilBone, "hotAnvilFace");
  box([0.27, 0.025, 0.13], FIRE_LIGHT, [0.92, 0.877, 0.28], anvilBone, "hotSpot");
  for (const x of [0.73, 1.11]) {
    sphere(0.025, BRASS, [x, 0.87, 0.41], anvilBone, "anvilRivet");
    sphere(0.025, BRASS, [x, 0.87, 0.15], anvilBone, "anvilRivet");
  }

  // A few sparks hovering directly above the glowing work surface.
  const sparks: [number, number, number][] = [
    [0.82, 1.02, 0.31],
    [1.03, 1.08, 0.28],
    [1.13, 1.18, 0.3],
    [0.91, 1.23, 0.29],
    [1.2, 1.3, 0.29],
  ];
  sparks.forEach((p, i) => {
    b.spike(p, [0.1 * (i % 2 ? 1 : -1), 1, 0], 0.07 + i * 0.008, 0.012, {
      color: i % 2 ? FIRE_LIGHT : FIRE,
      bone: anvilBone,
      name: `spark${i}`,
    });
  });

  // Small tongs laid across the apron side.
  b.rod([0.38, 0.86, 0.37], [0.72, 0.94, 0.42], 0.012, STEEL, {
    bone: pelvis,
    name: "tongsA",
  });
  b.rod([0.38, 0.86, 0.37], [0.67, 0.84, 0.41], 0.012, STEEL, {
    bone: pelvis,
    name: "tongsB",
  });
  sphere(0.028, BRASS, [0.38, 0.86, 0.37], pelvis, "tongsPivot");

  return b.root;
}

import * as THREE from "three";
import { createBuilder, rng, catmull, limb, frame } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Dwarf Blacksmith at an Anvil",
  description: "A chunky Warcraft-inspired dwarf smith with braided beard, hammer, glowing forge anvil, and heavy armor.",
};

export default function build() {
  const b = createBuilder({ name: "dwarf_blacksmith", detail: 1 });

  const SKIN = cel("#c98250", "#713b35");
  const SKIN_LIGHT = cel("#e0a06b", "#8f4d3f");
  const HAIR = cel("#4a241b", "#21131a");
  const HAIR_LIGHT = cel("#76402a", "#30202a");
  const BEARD = furEdge(HAIR_LIGHT, HAIR, {
    by: "position",
    axis: [0, 1, 0],
    level: 1.05,
    teeth: 0.12,
    period: 0.07,
    ink: INK,
    inkWidth: 0.012,
  });
  const LEATHER = cel("#633b27", "#2d2022");
  const RED = cel("#a52e27", "#4d1d2a");
  const STEEL = cel("#6d7785", "#252c3d");
  const STEEL_BRIGHT = cel("#b5c4c8", "#566274");
  const BRASS = cel("#d19a3d", "#68451e");
  const GOLD = cel("#f3c35b", "#956221");
  const BOOT = cel("#34251f", "#16151d");
  const INK2 = "#17131d";
  const FIRE = "#ff7b24";
  const EMBER = "#ffd35a";

  const sphere = (r: number, at: any, color: any, bone?: any, scale?: any, name?: string) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, {
      at,
      bone,
      scale,
      name,
      flat: true,
    });

  const box = (size: [number, number, number], at: any, color: any, bone?: any, name?: string, rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      rotation,
      name,
      flat: true,
    });

  const tube = (a: any, z: any, r: number, color: any, bone?: any, name?: string) =>
    b.capsule(a, z, r, { color, bone, section: { ngon: 8 }, name });

  // Skeleton first: broad, sturdy dwarf proportions.
  const pelvis = b.joint("pelvis", { at: [0, 0.86, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.86, 0],
      [0, 1.12, 0.01],
      [0, 1.38, 0.02],
      [0, 1.58, 0.04],
    ]),
    { parent: pelvis, names: ["spineLow", "spineMid", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.58, 0.04],
      [0, 1.69, 0.08],
      [0, 1.78, 0.12],
    ]),
    { parent: spine.tip, names: ["neck", "neckTop"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.82, 0.14],
    dir: [0, 0.12, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.69, 0.29],
    dir: [0, -0.08, 1],
    role: "jaw",
    group: "face",
  });

  const armL = b.chain(
    "armL",
    catmull([
      [0.27, 1.48, 0.04],
      [0.48, 1.38, 0.08],
      [0.59, 1.16, 0.18],
      [0.62, 0.98, 0.34],
    ]),
    { parent: spine.joints[2], names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm" },
  );
  const armR = b.chain(
    "armR",
    catmull([
      [-0.27, 1.48, 0.04],
      [-0.47, 1.38, 0.08],
      [-0.56, 1.18, 0.23],
      [-0.52, 1.02, 0.38],
    ]),
    { parent: spine.joints[2], names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm" },
  );

  const legL = b.chain(
    "legL",
    limb([0.16, 0.84, 0], [0.22, 0.16, 0.08], [0.3, 0.3, 0.2], [[0, 0, 1], [0, 0, -1]]),
    { parent: pelvis, names: ["hipL", "kneeL", "ankleL"], role: "leg", contact: [0.22, 0, 0.08] },
  );
  const legR = b.chain(
    "legR",
    limb([-0.16, 0.84, 0], [-0.22, 0.16, 0.08], [0.3, 0.3, 0.2], [[0, 0, 1], [0, 0, -1]]),
    { parent: pelvis, names: ["hipR", "kneeR", "ankleR"], role: "leg", contact: [-0.22, 0, 0.08] },
  );

  // Boots and legs.
  for (const [s, leg] of [[1, legL], [-1, legR]] as const) {
    tube(leg.at(0), leg.at(0.62), 0.12, LEATHER, undefined, `thigh${s}`);
    tube(leg.at(0.58), leg.at(1), 0.105, BOOT, undefined, `bootLeg${s}`);
    box([0.22, 0.14, 0.34], leg.at(1).clone().add(new THREE.Vector3(0, -0.025, 0.045)), BOOT, leg.tip, `boot${s}`);
    box([0.18, 0.075, 0.1], leg.at(1).clone().add(new THREE.Vector3(0, 0.055, 0.16)), BRASS, leg.tip, `bootTrim${s}`);
    box([0.27, 0.12, 0.16], leg.at(0.18), RED, leg.joints[0], `kilt${s}`);
  }

  // Torso, belly, belt and shoulder armor.
  b.sweep(spine, (t) => 0.25 - t * 0.035, {
    color: LEATHER,
    section: "box",
    sides: 8,
    name: "barrel_torso",
  });
  box([0.5, 0.15, 0.22], [0, 1.43, 0.23], RED, spine.joints[2], "tunicChest");
  b.sweep(b.surface(b.root).drape(catmull([
    [-0.31, 1.34, 0.02],
    [0, 1.29, 0.24],
    [0.31, 1.34, 0.02],
  ])), 0.025, { color: BRASS, name: "belt" });
  for (const s of [1, -1]) {
    sphere(0.17, [s * 0.27, 1.49, 0.02], STEEL, spine.joints[2], [1.2, 0.55, 0.8], `pauldron${s}`);
    sphere(0.04, [s * 0.27, 1.52, 0.14], GOLD, spine.joints[2], undefined, `pauldronRivet${s}`);
  }
  box([0.46, 0.045, 0.05], [0, 1.16, 0.27], GOLD, pelvis, "beltBuckle");
  box([0.25, 0.22, 0.04], [0, 1.16, 0.296], RED, pelvis, "beltGem");

  // Arms and plated cuffs.
  for (const [s, arm] of [[1, armL], [-1, armR]] as const) {
    tube(arm.at(0), arm.at(0.52), 0.095, STEEL, undefined, `upperArm${s}`);
    tube(arm.at(0.5), arm.at(1), 0.075, SKIN, undefined, `forearm${s}`);
    sphere(0.11, arm.tip.at, SKIN_LIGHT, arm.tip, [1, 0.8, 1.1], `fist${s}`);
    b.ring(arm.at(0.72), { count: 6, radius: 0.081, fromDeg: 0, toDeg: 300 }, (p) =>
      b.spike(p, p, 0.025, 0.012, { color: BRASS, name: `cuffStud${s}` }),
    );
    for (let i = 0; i < 3; i++)
      tube(
        arm.tip.at.clone().add(new THREE.Vector3(s * (i - 1) * 0.032, -0.035, 0.05)),
        arm.tip.at.clone().add(new THREE.Vector3(s * (i - 1) * 0.04, -0.035, 0.105)),
        0.012,
        SKIN_LIGHT,
        arm.tip,
        `finger${s}_${i}`,
      );
  }

  // Head, ears, nose, brows.
  sphere(0.29, head.at, SKIN, head, [1.0, 0.92, 0.9], "head");
  sphere(0.13, [0.265, 1.83, 0.13], SKIN_LIGHT, head, [0.7, 1.0, 0.8], "earL");
  sphere(0.13, [-0.265, 1.83, 0.13], SKIN_LIGHT, head, [0.7, 1.0, 0.8], "earR");
  sphere(0.065, [0, 1.75, 0.405], SKIN_LIGHT, head, [1.15, 0.8, 0.7], "nose");
  box([0.36, 0.06, 0.08], [0, 1.98, 0.13], HAIR, head, "browHair", [0.12, 0, 0]);
  sphere(0.33, [0, 1.95, 0.03], HAIR, head, [1.05, 0.55, 0.75], "hairCap");

  // Big readable eyes with decals.
  const eyeTex = animeEye({ iris: "#3cd4e8", blush: false, brow: false, size: 256 });
  const faceSurface = b.surface(b.root);
  for (const s of [1, -1]) {
    b.decal(faceSurface, eyeTex, {
      at: [s * 0.115, 1.84, 0.39],
      dir: [0, 0, 1],
      size: [0.105, 0.13],
      mirror: s > 0,
      lift: 0.008,
      bone: head,
      name: `eye${s}`,
    });
  }

  // Massive braided beard: central mass plus layered braid segments.
  sphere(0.205, [0, 1.66, 0.28], BEARD, jaw, [1.18, 1.05, 0.75], "beardMass");
  box([0.34, 0.11, 0.14], [0, 1.72, 0.39], HAIR_LIGHT, jaw, "moustache");
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Vector3(s * (0.075 + i * 0.012), 1.61 - i * 0.105, 0.34 + i * 0.025);
      sphere(0.095 - i * 0.012, p, BEARD, jaw, [0.8, 1.0, 0.75], `beardRuff${s}_${i}`);
      sphere(0.03, p.clone().add(new THREE.Vector3(0, -0.015, 0.067)), GOLD, jaw, undefined, `beardBead${s}_${i}`);
    }
    tube(
      [s * 0.09, 1.57, 0.37],
      [s * 0.055, 1.17, 0.39],
      0.055,
      BEARD,
      jaw,
      `braid${s}`,
    );
    for (let i = 0; i < 5; i++)
      sphere(0.062, [s * (0.09 - i * 0.008), 1.53 - i * 0.078, 0.42], HAIR_LIGHT, jaw, [1, 0.75, 0.65], `braidKnot${s}_${i}`);
  }
  sphere(0.14, [0, 1.26, 0.39], HAIR, jaw, [0.75, 1.25, 0.65], "beardPoint");

  // Horned blacksmith helmet and crest.
  b.lathe(
    [[0, 0], [0.25, 0], [0.29, 0.07], [0.27, 0.17], [0.19, 0.25], [0, 0.28]],
    { at: [0, 1.93, 0.02], axis: [0, 1, 0], color: STEEL, bone: head, segments: 10, name: "helmet" },
  );
  for (const s of [1, -1]) {
    b.spike([s * 0.22, 2.04, 0.02], [s * 0.34, 2.23, -0.02], null, 0.065, {
      color: BRASS,
      bone: head,
      name: `helmetHorn${s}`,
    });
    box([0.035, 0.19, 0.25], [s * 0.24, 1.88, 0.12], STEEL_BRIGHT, head, `helmetSide${s}`);
  }
  box([0.56, 0.055, 0.04], [0, 1.82, 0.34], BRASS, head, "helmetBrow");

  // Hammer in the raised left hand.
  const hammerGrip = [0.74, 1.15, 0.43];
  tube(armL.tip.at, hammerGrip, 0.035, LEATHER, armL.tip, "hammerHandleGrip");
  tube(hammerGrip, [0.77, 1.72, 0.48], 0.035, HAIR, armL.tip, "hammerHandle");
  box([0.28, 0.2, 0.18], [0.77, 1.82, 0.48], STEEL, armL.tip, "hammerHead");
  box([0.22, 0.08, 0.2], [0.77, 1.82, 0.58], STEEL_BRIGHT, armL.tip, "hammerFace");
  box([0.06, 0.24, 0.24], [0.77, 1.82, 0.48], BRASS, armL.tip, "hammerBand");

  // Anvil in front, large but subordinate to the character.
  box([0.5, 0.16, 0.28], [0, 0.78, 0.57], STEEL, undefined, "anvilTop");
  box([0.3, 0.2, 0.22], [0, 0.62, 0.57], STEEL, undefined, "anvilWaist");
  box([0.47, 0.12, 0.3], [0, 0.47, 0.57], STEEL, undefined, "anvilBase");
  box([0.18, 0.045, 0.08], [0.29, 0.82, 0.57], STEEL_BRIGHT, undefined, "anvilHorn");
  box([0.12, 0.035, 0.31], [0, 0.872, 0.57], BRASS, undefined, "anvilTopInlay");
  for (const x of [-0.18, 0.18])
    sphere(0.035, [x, 0.52, 0.57], GOLD, undefined, undefined, "anvilRivet");

  // Small glowing forge coals beneath the anvil, giving the scene a strong focal accent.
  for (let i = 0; i < 9; i++) {
    const x = -0.22 + (i % 3) * 0.22;
    const z = 0.42 + Math.floor(i / 3) * 0.11;
    const coal = sphere(0.035, [x, 0.89, z], i % 2 ? FIRE : EMBER, undefined, undefined, "hotCoal");
    const mat = (coal as any).mesh?.material;
    if (mat) {
      mat.emissive = new THREE.Color(i % 2 ? FIRE : EMBER);
      mat.emissiveIntensity = 1.6;
    }
  }

  // A few characteristic forging sparks rising beside the hammer.
  const sparkPoints = [
    [0.95, 1.62, 0.53],
    [1.03, 1.76, 0.51],
    [0.9, 1.9, 0.54],
    [1.12, 1.87, 0.52],
    [0.98, 2.02, 0.55],
  ];
  for (const p of sparkPoints) {
    const spark = sphere(0.018, p, EMBER, undefined, undefined, "spark");
    const mat = (spark as any).mesh?.material;
    if (mat) {
      mat.emissive = new THREE.Color(EMBER);
      mat.emissiveIntensity = 2;
    }
  }

  return b.root;
}

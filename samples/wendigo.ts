import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Chain } from "../src/skeleton";
import { rng } from "../src/math";
import { bezier, catmull } from "../src/path";
import { glow } from "../kits/glow";
import { cel, furEdge, INK } from "../kits/toon";
import { svg } from "../src/texture";
const BONE = cel("#d9d0bf", "#766676");
const BONE_HI = cel("#f2e8d0", "#aa8290");
const FUR = cel(furEdge("#332542", "#171321", { level: -0.12, teeth: 0.18, period: 0.055, ink: INK }));
const FUR_LIGHT = cel("#56395d", "#241b31");
const ANTLER = cel("#5c332e", "#281a25");
const ANTLER_RIDGE = cel("#a15b48", "#54273b");
const CLOTH = cel("#241a37", "#100d1b");
const RIB = cel("#c1a8a4", "#62475d");
const METAL = cel("#6d596f", "#30263e");
const MOUTH = "#120c18";
const GLOW_RED = "#ff466f";
const GLOW_CYAN = "#66eaff";

const FUR_TUFT = svg(
  `<svg viewBox="0 0 32 64"><path d="M2 2 L16 62 L30 2 L21 16 L16 7 L11 16 Z" fill="#d8bdd0"/><path d="M8 8 L16 54 L24 8 L19 20 L16 14 L13 20 Z" fill="#72506d"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 5 L40 24 L59 32 L40 40 L32 59 L24 40 L5 32 L24 24 Z" fill="none" stroke="#ffffff" stroke-width="6"/><path d="M32 17 L36 28 L47 32 L36 36 L32 47 L28 36 L17 32 L28 28 Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);

export const meta = {
  name: "Wendigo",
  description: "A gaunt antlered skull-faced beast with rune-lit eyes, ragged fur, and a hunter's silhouette.",
  style: "high-fantasy anime dark fantasy",
  commit: "67d30d1",
};

export default function build() {
  const b = createBuilder({ name: "wendigo", detail: 1.1, paintSize: 2048 });

  // Skeleton first: an elongated biped with a readable rest pose.
  const hips = b.joint("hips", { at: [0, 1.27, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.27, 0],
      [0, 1.52, 0.01],
      [0, 1.78, 0.025],
      [0, 2.00, 0.04],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest", "shoulders"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      spine.tip!,
      [0, 2.16, 0.06],
      [0, 2.34, 0.09],
    ]),
    { parent: spine.tip!, names: ["neckBase", "neck", "neckTip"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.tip!, at: [0, 2.51, 0.13], dir: [0, 0.08, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.39, 0.24], dir: [0, -0.12, 1], role: "jaw", group: "head" });

  const armChains: Record<"L" | "R", Chain> = {} as Record<"L" | "R", Chain>;
  const legChains: Record<"L" | "R", Chain> = {} as Record<"L" | "R", Chain>;
  for (const side of [1, -1] as const) {
    const s = side > 0 ? "L" : "R";
    armChains[s] = b.chain(
      `arm${s}`,
      catmull([
        [side * 0.25, 1.96, 0.01],
        [side * 0.49, 1.79, 0.03],
        [side * 0.66, 1.54, 0.10],
        [side * 0.72, 1.37, 0.18],
      ]),
      { parent: spine.tip!, names: [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `hand${s}`], role: "arm" },
    );
    const leg = b.chain(
      `leg${s}`,
      catmull([
        [side * 0.17, 1.25, 0.00],
        [side * 0.23, 0.86, 0.08],
        [side * 0.27, 0.42, 0.16],
        [side * 0.29, 0.14, 0.27],
      ]),
      { parent: hips, names: [`hip${s}`, `knee${s}`, `ankle${s}`, `foot${s}`], role: "leg", contact: [side * 0.29, 0.0, 0.27] },
    );
    legChains[s] = leg;
  }
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.30, -0.18],
      [0, 1.05, -0.35],
      [0, 0.77, -0.52],
      [0, 0.48, -0.68],
    ]),
    { parent: hips, names: ["tailBase", "tailMid", "tailTip"], role: "tail" },
  );

  // Core body: narrow waist, swollen shoulders, and a long throat.
  const torso = b.sweep(spine, (t) => 0.29 - 0.055 * t, {
    section: { ngon: 8 },
    color: FUR,
    caps: "round",
    name: "torso",
    group: "body",
  });
  b.sweep(neck, [0.19, 0.12], { section: { ngon: 7 }, color: FUR_LIGHT, caps: "round", name: "neckFur", group: "body" });
  b.sweep(tail, [0.12, 0.018], { section: { ngon: 7 }, color: FUR, caps: { start: "round", end: "point" }, name: "tailFur", group: "body" });
  b.part(new THREE.SphereGeometry(0.27, 10, 7), FUR, { bone: hips, at: hips.at, scale: [1.05, 0.74, 0.88], name: "pelvis", group: "body", flat: true });

  // Shoulder blades, sternum and a three-tier rib cage.
  for (const side of [1, -1] as const) {
    b.part(new THREE.SphereGeometry(0.15, 8, 6), FUR_LIGHT, {
      bone: spine.tip!,
      at: [side * 0.26, 1.96, 0.01],
      scale: [1.15, 0.75, 1.05],
      name: `shoulderMass${side > 0 ? "L" : "R"}`,
      group: "body",
      flat: true,
    });
  }
  b.sweep(bezier([0, 1.35, 0.25], [0, 1.58, 0.29], [0, 1.82, 0.28], [0, 2.00, 0.22]), 0.027, {
    bone: spine.joints[2],
    color: BONE,
    caps: "round",
    name: "sternum",
    group: "bones",
  });
  for (const y of [1.55, 1.70, 1.85]) {
    b.sweep(
      catmull([
        [-0.05, y, 0.27],
        [-0.25, y, 0.25],
        [-0.36, y, 0.10],
        [-0.29, y, -0.01],
      ]),
      0.021,
      { bone: spine.joints[2], color: RIB, caps: "round", name: `ribL${y}`, group: "bones" },
    );
    b.sweep(
      catmull([
        [0.05, y, 0.27],
        [0.25, y, 0.25],
        [0.36, y, 0.10],
        [0.29, y, -0.01],
      ]),
      0.021,
      { bone: spine.joints[2], color: RIB, caps: "round", name: `ribR${y}`, group: "bones" },
    );
  }

  // A ragged ruff and fur cards break up the clean primitive tubes.
  b.ring(neck.joints[0], { count: 11, radius: 0.205, fromDeg: 0, toDeg: 360, role: "fan", name: "ruff" }, (at) =>
    b.spike(at, at, 0.16, 0.035, { color: FUR_LIGHT, caps: "point", group: "fur" }),
  );
  const torsoSurface = b.surface(torso);
  const furHits = torsoSurface.scatter(42, {
    rng: rng(17),
    minDist: 0.075,
    filter: (h) => h.n.y > -0.4 && h.at.y > 1.35,
  });
  b.cards(furHits, FUR_TUFT, {
    size: [0.052, 0.14],
    lean: 70,
    bend: 25,
    vary: 0.28,
    rng: rng(18),
    color: FUR_LIGHT,
    cross: true,
    group: "fur",
  });

  // A torn mantle trails behind the shoulders, giving the silhouette a dark-fantasy sweep.
  for (const side of [1, -1] as const) {
    b.extrude(
      [
        [-0.18, 0.18],
        [0.18, 0.18],
        [0.15, -0.22],
        [0.05, -0.46, "sharp"],
        [-0.04, -0.30, "sharp"],
        [-0.16, -0.40, "sharp"],
      ],
      {
        at: [side * 0.20, 1.94, -0.18],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: [0.024, 0.008],
        bevel: 0.006,
        smoothing: 1,
        color: CLOTH,
        bone: spine.tip!,
        name: `tornMantle${side > 0 ? "L" : "R"}`,
        group: "cloth",
      },
    );
  }


  // Skull and jaw are separate, so the jaw hinge flexes in the rig.
  const skull = b.part(new THREE.SphereGeometry(0.34, 14, 10), BONE, {
    bone: head,
    at: head.at,
    scale: [0.84, 1.05, 0.94],
    name: "skull",
    group: "head",
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.22, 10, 7), BONE_HI, {
    bone: jaw,
    at: [0, 2.37, 0.29],
    scale: [0.90, 0.48, 1.2],
    name: "lowerJaw",
    group: "head",
    flat: true,
  });
  b.sweep(bezier([0, 2.46, 0.31], [0, 2.44, 0.44], [0, 2.42, 0.56]), [0.16, 0.075], {
    bone: jaw,
    section: { ngon: 6 },
    color: BONE_HI,
    caps: { start: "round", end: "flat" },
    name: "muzzle",
    group: "head",
  });
  b.sweep(catmull([[0, 2.43, 0.48], [0, 2.41, 0.55], [0, 2.39, 0.60]]), 0.014, {
    bone: jaw,
    color: INK,
    caps: "round",
    name: "mouthSeam",
    group: "head",
  });
  // Hollow sockets, glowing slit eyes, and a small rune on the brow.
  for (const side of [1, -1] as const) {
    const sx = side > 0 ? "L" : "R";
    b.part(new THREE.SphereGeometry(0.085, 10, 6), MOUTH, {
      bone: head,
      at: [side * 0.145, 2.54, 0.315],
      scale: [1.2, 0.78, 0.42],
      name: `eyeSocket${sx}`,
      group: "head",
      flat: true,
    });
    glow(
      b.part(new THREE.SphereGeometry(0.031, 8, 5), GLOW_RED, {
        bone: head,
        at: [side * 0.145, 2.535, 0.35],
        scale: [1.8, 0.44, 0.35],
        name: `eyeGlow${sx}`,
        group: "head",
        flat: true,
      }),
      2.2,
    );
    b.sweep(bezier([side * 0.21, 2.61, 0.30], [side * 0.15, 2.65, 0.34], [side * 0.08, 2.61, 0.31]), 0.018, {
      bone: head,
      color: INK,
      caps: "round",
      name: `brow${sx}`,
      group: "head",
    });
  }
  glow(
    b.decal(skull, RUNE, { at: [0, 2.72, 0.16], dir: [0, 0.62, 0.78], size: [0.095, 0.095], lift: 0.006, name: "browRune", group: "head" }),
    1.4,
  );

  // Teeth: uneven, deliberate primitive cones in the separate jaw spaces.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.055;
    b.spike([x, 2.43, 0.53], [0, -1, 0.05], 0.09 + (i % 2) * 0.025, 0.021, { bone: head, color: BONE_HI, group: "teeth", name: `upperFang${i}` });
    if (i < 4) {
      b.spike([x + 0.025, 2.39, 0.54], [0, 1, 0.04], 0.068 + ((i + 1) % 2) * 0.02, 0.018, { bone: jaw, color: BONE_HI, group: "teeth", name: `lowerFang${i}` });
    }
  }

  // Antlers: a main swept tine plus four smaller branches per side.
  for (const side of [1, -1] as const) {
    const sx = side > 0 ? "L" : "R";
    const root = [side * 0.19, 2.74, 0.08] as [number, number, number];
    const mainPath = catmull([
      root,
      [side * 0.28, 2.92, 0.05],
      [side * 0.39, 3.10, -0.01],
      [side * 0.43, 3.30, -0.05],
      [side * 0.37, 3.48, 0.00],
    ]);
    const antler = b.sprout(`antler${sx}`, b.surface(skull).around(head.at).at(side * 38, 58)!, mainPath, [0.058, 0.012], {
      count: 4,
      names: [`antler${sx}Base`, `antler${sx}Mid1`, `antler${sx}Mid2`, `antler${sx}Tip`],
      role: "fan",
      color: ANTLER,
      caps: { start: "round", end: "point" },
      group: "antlers",
    });
    for (let i = 0; i < 4; i++) {
      const t = 0.26 + i * 0.16;
      const at = antler.sweep.at(t, 0);
      const tip = [side * (0.34 + i * 0.04), 2.92 + i * 0.105, 0.02 + i * 0.025] as [number, number, number];
      b.sprout(`tine${sx}${i}`, at, bezier(at.at, [side * (0.46 + i * 0.035), at.at.y + 0.08, 0.05], tip), [0.032, 0.006], {
        count: 0,
        role: "fan",
        color: ANTLER_RIDGE,
        caps: { start: "round", end: "point" },
        group: "antlers",
      });
    }
    for (let i = 0; i < 6; i++) {
      const ridge = antler.sweep.at(0.16 + i * 0.12, 180);
      b.spike(ridge, ridge, 0.042, 0.012, { color: ANTLER_RIDGE, caps: "point", group: "antlers", name: `antlerRidge${sx}${i}` });
    }
  }

  // Long limbs and deliberate bone plates.
  for (const side of [1, -1] as const) {
    const sx = side > 0 ? "L" : "R";
    const arm = armChains[sx];
    const leg = legChains[sx];
    b.sweep(arm, (t) => 0.115 - 0.045 * t, { section: { ngon: 6 }, color: FUR, caps: "round", name: `armFur${sx}`, group: "limbs" });
    b.sweep(leg, (t) => 0.145 - 0.07 * t, { section: { ngon: 6 }, color: FUR, caps: "round", name: `legFur${sx}`, group: "limbs" });
    b.part(new THREE.SphereGeometry(0.105, 8, 6), BONE, { bone: arm.joints[1], at: arm.joints[1].at, scale: [1.2, 0.7, 1.0], name: `elbowPlate${sx}`, group: "bones", flat: true });
    b.part(new THREE.SphereGeometry(0.13, 8, 6), BONE, { bone: leg.joints[1], at: leg.joints[1].at, scale: [1.0, 0.78, 1.1], name: `kneePlate${sx}`, group: "bones", flat: true });
    b.part(new THREE.SphereGeometry(0.10, 8, 6), BONE_HI, { bone: arm.tip!, at: arm.tip!.at, scale: [1.15, 0.75, 1.1], name: `handBone${sx}`, group: "bones", flat: true });
    b.part(new THREE.SphereGeometry(0.13, 8, 6), BONE_HI, { bone: leg.tip!, at: leg.tip!.at, scale: [1.15, 0.55, 1.55], name: `footBone${sx}`, group: "bones", flat: true });

    // Four spread finger claws and three grounded toe claws.
    for (let i = 0; i < 4; i++) {
      const x = side * (0.67 + i * 0.035);
      const target = [x + side * (0.04 + i * 0.018), 1.27 - i * 0.008, 0.34 + i * 0.035] as [number, number, number];
      b.sprout(`finger${sx}${i}`, arm.tip!, target, [0.025, 0.006], { count: 0, role: "digit", color: BONE_HI, caps: { start: "round", end: "point" }, group: "claws" });
    }
    for (let i = 0; i < 3; i++) {
      const target = [side * (0.22 + i * 0.075), 0.005, 0.48 + i * 0.045] as [number, number, number];
      b.sprout(`toe${sx}${i}`, leg.tip!, target, [0.036, 0.007], { count: 0, role: "digit", color: BONE_HI, caps: { start: "round", end: "point" }, group: "claws" });
    }
  }

  // Ragged loincloth and cold iron ornaments.
  b.extrude(
    [
      [-0.26, 0.18],
      [0.26, 0.18],
      [0.20, -0.35],
      [0.05, -0.23, "sharp"],
      [-0.12, -0.42, "sharp"],
      [-0.20, -0.22, "sharp"],
    ],
    { at: [0, 1.30, 0.20], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.028, bevel: 0.008, smoothing: 1, color: CLOTH, bone: hips, name: "loincloth", group: "cloth" },
  );
  b.sweep(catmull([[-0.30, 1.48, 0.10], [0, 1.43, 0.31], [0.30, 1.48, 0.10]], { closed: false }), 0.018, {
    bone: hips,
    color: METAL,
    caps: "round",
    name: "waistChain",
    group: "cloth",
  });
  for (const side of [1, -1] as const) {
    const hit = b.surface(torso).around([0, 1.55, 0]).at(side * 90, 0);
    if (hit) b.stick(new THREE.BoxGeometry(0.08, 0.10, 0.025), METAL, hit, { embed: 0.25, name: `chainCharm${side > 0 ? "L" : "R"}`, group: "cloth" });
  }

  // A few icy blue scars/runes on the ribs and shins.
  for (const side of [1, -1] as const) {
    const sx = side > 0 ? "L" : "R";
    glow(
      b.part(new THREE.BoxGeometry(0.018, 0.15, 0.008), GLOW_CYAN, {
        bone: spine.joints[2],
        at: [side * 0.28, 1.72, 0.285],
        rotation: [0, side * 18, side * 12],
        name: `ribRune${sx}`,
        group: "magic",
      }),
      1.3,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.016, 0.12, 0.008), GLOW_CYAN, {
        bone: legChains[sx].joints[2],
        at: [side * 0.27, 0.40, 0.23],
        rotation: [0, side * 22, 0],
        name: `shinRune${sx}`,
        group: "magic",
      }),
      1.15,
    );
  }

  // Small ink creases at the skull and claws keep the anime silhouette legible.
  b.sweep(catmull([[-0.29, 2.60, 0.22], [-0.18, 2.72, 0.24], [0, 2.77, 0.18], [0.18, 2.72, 0.24], [0.29, 2.60, 0.22]]), 0.009, {
    bone: head,
    color: INK,
    caps: "round",
    name: "crownCrease",
    group: "head",
  });
  return b.root;
}

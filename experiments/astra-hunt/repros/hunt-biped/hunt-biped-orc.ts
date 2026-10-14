import * as THREE from "three";
import { createBuilder, Builder } from "../../../../src/builder";
import { limb } from "../../../../src/ik";
import { polyline } from "../../../../src/path";
import type { Chain, Joint } from "../../../../src/skeleton";
import type { Part } from "../../../../src/parts";
import type { Sweep } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";

export const debug: {
  b?: Builder;
  chest?: Joint;
  spine?: Chain;
  armR?: Chain;
  handR?: Joint;
  weaponBone?: Joint;
  torso?: Sweep;
  belt?: Sweep;
  strap?: Sweep;
  chestDecal?: Part;
  jawDecal?: Part;
  feet?: THREE.Vector3[];
} = {};

const SKIN = "#5f8138";
const SKIN_D = "#3c5429";
const LEATHER = "#5b3120";
const STEEL = "#9da9b6";
const STEEL_D = "#4a5665";
const CLOTH = "#7d1f25";
const GOLD = "#d8a631";

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#d8a631" d="M32 3 39 24 61 25 44 38 50 60 32 47 14 60 20 38 3 25 25 24Z"/></svg>`,
  { size: 128 },
);
const JAW_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 32"><path fill="#221611" d="M4 4h72v24H4z"/><path fill="#d8a631" d="m16 5 5 8 9 1-7 6 2 8-9-5-9 5 2-8-7-6 9-1zM56 5l5 8 9 1-7 6 2 8-9-5-9 5 2-8-7-6 9-1z"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "armedOrc", detail: 0.7 });
  debug.b = b;

  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 0.98, 0],
      [0, 1.18, 0],
      [0, 1.42, 0.01],
      [0, 1.6, 0.03],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest", "chestTip"], role: "spine" },
  );
  const chest = spine.joints[2];
  const chestTip = spine.tip!;
  debug.spine = spine;
  debug.chest = chest;

  const torso = b.loft(
    [
      { at: [0, 0.98, 0], w: 0.56, h: 0.34 },
      { at: [0, 1.23, 0], w: 0.66, h: 0.46 },
      { at: [0, 1.48, 0.02], w: 0.72, h: 0.4 },
      { at: [0, 1.65, 0.03], w: 0.42, h: 0.24 },
    ],
    { bone: spine, color: SKIN, sides: 8, caps: { start: "round", end: "round" }, name: "torso" },
  );
  debug.torso = torso;

  const neck = b.joint("neck", { parent: chestTip, at: [0, 1.72, 0.03], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.86, 0.04], dir: [0, 1, 0], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.8, 0.14], aim: [0, 1.73, 0.24], role: "jaw", group: "head" });
  b.part(new THREE.SphereGeometry(0.2, b.segments(12), b.segments(8)), SKIN, {
    bone: head,
    at: [0, 1.86, 0.04],
    scale: [1, 1.15, 0.9],
    flat: true,
    name: "orcHead",
    group: "head",
  });
  const jawPart = b.part(new THREE.SphereGeometry(0.15, b.segments(10), b.segments(6)), SKIN_D, {
    bone: jaw,
    at: [0, 1.78, 0.15],
    scale: [1.1, 0.55, 0.9],
    flat: true,
    name: "jaw",
    group: "head",
  });
  b.lathe(
    [
      [0, -0.1],
      [0.22, -0.08],
      [0.27, 0.04],
      [0.21, 0.18],
      [0.12, 0.25],
      [0, 0.27],
    ],
    { at: [0, 1.88, 0.04], bone: head, color: STEEL_D, segments: b.segments(10), name: "helmet", group: "head" },
  );
  debug.chestDecal = b.decal(torso, EMBLEM, {
    at: [0, 1.34, 0.34],
    dir: [0, 0, 1],
    size: [0.18, 0.18],
    segments: [8, 8],
    lift: 0.003,
    name: "chestEmblem",
    group: "decal",
  });
  debug.jawDecal = b.decal(jawPart, JAW_MARK, {
    at: [0, 1.77, 0.27],
    dir: [0, 0, 1],
    size: [0.12, 0.045],
    segments: [8, 3],
    lift: 0.003,
    bone: jaw,
    name: "jawMark",
    group: "decal",
  });

  debug.belt = b.sweep(b.surface(torso).loop([0, 1.28, 0], { lift: 0.012 }), 0.025, {
    color: LEATHER,
    sides: 6,
    smooth: false,
    name: "belt",
    group: "clothing",
  });
  debug.strap = b.sweep(
    b.surface(torso).drape(
      polyline([
        [0.3, 1.56, 0.36],
        [0.16, 1.3, 0.38],
        [-0.2, 1.03, 0.3],
      ]),
      { lift: 0.014 },
    ),
    0.018,
    { color: CLOTH, sides: 5, smooth: false, name: "shoulderStrap", group: "clothing" },
  );

  const feet: THREE.Vector3[] = [];
  let handR: Joint | undefined;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.18, 1.0, 0] as const;
    const foot = [s * 0.2, 0.055, 0.16] as const;
    const legPts = limb(hip, foot, [0.43, 0.42, 0.35], [[s * 0.2, 0, -0.8], [s * 0.2, 0, -0.8]]);
    if (legPts.at(-1)!.distanceTo(new THREE.Vector3(...foot)) > 1e-3) throw new Error(`leg ${side} too short`);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`thigh${side}`, `shin${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: foot,
    });
    b.sweep(leg, [0.11, 0.085, 0.065, 0.052], { color: SKIN, sides: 8, smooth: false, name: `leg${side}` });
    b.part(new THREE.SphereGeometry(0.07, b.segments(8), b.segments(5)), STEEL_D, {
      bone: leg.tip!,
      at: [foot[0], foot[1], foot[2]],
      scale: [1.2, 0.5, 1.5],
      name: `boot${side}`,
      group: "boots",
    });
    feet.push(new THREE.Vector3(...foot));

    const shoulder = [s * 0.38, 1.51, 0.02] as const;
    const hand = [s * 0.72, 1.3, 0.2] as const;
    const armPts = limb(shoulder, hand, [0.3, 0.3, 0.24], [[s * 0.5, 0, 0.5], [s * 0.5, 0, 0.5]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.075, 0.06, 0.045, 0.04], { color: SKIN, sides: 8, smooth: false, name: `arm${side}` });
    const handJ = arm.tip!;
    b.part(new THREE.SphereGeometry(0.05, b.segments(8), b.segments(6)), SKIN, {
      bone: handJ,
      at: handJ.at,
      scale: [1, 0.8, 1],
      name: `palm${side}`,
      group: `hand${side}`,
    });
    const finger = b.chain(
      `fingers${side}`,
      polyline([
        [s * 0.72, 1.3, 0.2],
        [s * 0.72, 1.23, 0.25],
        [s * 0.72, 1.17, 0.25],
      ]),
      { parent: handJ, names: [`finger${side}1`, `finger${side}2`, `finger${side}Tip`], role: "digit", group: `hand${side}` },
    );
    b.sweep(finger, 0.017, { color: SKIN, sides: 6, smooth: false, name: `finger${side}`, group: `hand${side}` });
    const thumb = b.chain(
      `thumb${side}`,
      polyline([
        [s * 0.72, 1.31, 0.18],
        [s * 0.78, 1.28, 0.22],
      ]),
      { parent: handJ, names: [`thumb${side}`], role: "digit", group: `hand${side}` },
    );
    b.sweep(thumb, 0.018, { color: SKIN_D, sides: 6, smooth: false, name: `thumb${side}`, group: `hand${side}` });
    if (side === "R") {
      handR = handJ;
      debug.armR = arm;
      debug.handR = handJ;
    }
  }
  if (!handR) throw new Error("right hand was not built");
 
  const weaponBone = b.joint("swordGrip", {
    parent: handR,
    at: handR.at,
    dir: [0, 1, 0],
    role: "hinge",
    group: "weapon",
  });
  debug.weaponBone = weaponBone;
  const gripAt = weaponBone.local([0, 0.12, 0]);
  const guardAt = weaponBone.local([0, 0.26, 0]);
  const bladeAt = weaponBone.local([0, 0.68, 0]);
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.26, b.segments(8)), LEATHER, {
    bone: weaponBone,
    at: gripAt,
    name: "weaponGrip",
    group: "weapon",
  });
  b.part(new THREE.BoxGeometry(0.08, 0.025, 0.42), GOLD, {
    bone: weaponBone,
    at: guardAt,
    name: "weaponGuard",
    group: "weapon",
  });
  b.part(new THREE.BoxGeometry(0.055, 0.8, 0.018), STEEL, {
    bone: weaponBone,
    at: bladeAt,
    name: "weaponBlade",
    group: "weapon",
  });

  debug.feet = feet;
  return b.root;
}


import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { countershade, grain, mottle } from "../src/paint";
import { catmull, bezier } from "../src/path";
import { limb } from "../src/ik";

const SKIN = countershade("#9b6b4b", "#54372f", { level: -0.22 });
const COAT = countershade("#354968", "#18243a", { level: -0.18 });
const LEATHER = mottle("#623f2c", "#2b1b18", { size: 0.06, contrast: 0.45, seed: 14 });
const BEARD = grain("#4a2b22", "#1a1010", { size: 0.035, axis: "y", seed: 9 });
const BEARD_HI = grain("#704332", "#2b1714", { size: 0.028, axis: "y", seed: 12 });
const WOOD = grain("#6f4028", "#2a1715", { size: 0.11, axis: "z", seed: 31 });

const IRON = "#232b34";
const IRON_HI = "#5e6972";
const BRONZE = "#a66b32";
const BRONZE_HI = "#d69b4e";
const BRONZE_PAINT = countershade("#a66b32", "#553019", { level: -0.1 });
const AMMO = "#d4a44b";
const BOOT = "#29251f";
const GLOVE = "#3e2b24";
const EYE = "#15202b";
const IRIS = "#68b9c7";

export const meta = {
  name: "Dwarf Rifleman",
  description: "A broad-shouldered dwarf marksman with a braided beard, battered helm, and an oversized blunderbuss.",
  style: "Blizzard/Warcraft",
  commit: "9555ebf",
};

export default function build() {
  const b = createBuilder({ name: "dwarfRifleman", detail: 0.9 });

  // Skeleton first: a compact but fully readable humanoid rig.
  const hips = b.joint("hips", { at: [0, 0.78, 0], role: "spine" });
  const spine = b.chain("spine", catmull([
    [0, 0.78, 0],
    [0, 1.02, 0.015],
    [0, 1.25, 0.035],
  ]), { parent: hips, names: ["pelvis", "chest", "shoulderRoot"], role: "spine" });
  const neck = b.chain("neck", catmull([
    [0, 1.25, 0.035],
    [0, 1.39, 0.06],
    [0, 1.48, 0.09],
  ]), { parent: spine.tip!, names: ["neckBase", "neckTop", "neckTip"], role: "neck" });
  const head = b.joint("head", { parent: neck.tip!, at: [0, 1.53, 0.12], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.08, down: 0.075 }), aim: head.local({ forward: 0.28, down: 0.055 }), role: "jaw", group: "head" });

  const legL = b.chain("legL", limb([0.17, 0.77, 0], [0.18, 0.073, 0.12], [0.34, 0.30, 0.23], [[0, 0, 1], [0, 0, -1]]), {
    parent: hips, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.18, 0, 0.16],
  });
  const legR = b.chain("legR", limb([-0.17, 0.77, 0], [-0.18, 0.073, 0.12], [0.34, 0.30, 0.23], [[0, 0, 1], [0, 0, -1]]), {
    parent: hips, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.18, 0, 0.16],
  });

  const armL = b.chain("armL", limb([0.29, 1.23, 0.04], [0.22, 1.10, 0.48], [0.26, 0.27, 0.17], [[0, 0, 1], [0, 0, 1]]), {
    parent: spine.tip!, names: ["shoulderL", "elbowL", "wristL", "handL"], role: "arm",
  });
  const armR = b.chain("armR", limb([-0.29, 1.23, 0.04], [-0.11, 1.08, 0.39], [0.26, 0.25, 0.16], [[0, 0, 1], [0, 0, 1]]), {
    parent: spine.tip!, names: ["shoulderR", "elbowR", "wristR", "handR"], role: "arm",
  });

  // Torso and limbs: blocky, faceted, with painted light on the broad masses.
  const torso = b.sweep(spine, (t) => 0.29 - t * 0.035, {
    color: COAT, section: { ngon: 8 }, sides: 8, caps: "round", group: "body", name: "coatTorso",
  });
  b.sweep(neck, [0.14, 0.11], { color: SKIN, section: { ngon: 8 }, group: "body", name: "neckSkin" });
  b.part(new THREE.SphereGeometry(0.24, 8, 5), IRON, {
    bone: spine.tip!, at: [0, 1.13, 0.27], scale: [1.05, 0.78, 0.22], group: "armor", name: "chestPlate",
  });
  for (const x of [-0.14, 0.14]) {
    for (const y of [1.05, 1.20]) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BRONZE_HI, { bone: spine.tip!, at: [x, y, 0.34], group: "armor", name: "chestRivet" });
    }
  }
  for (const [chain, side] of [[legL, 1], [legR, -1]] as const) {
    b.sweep(chain, [0.105, 0.072], { color: COAT, section: { ngon: 7 }, group: "limbs", name: side > 0 ? "legLCoat" : "legRCoat" });
    b.part(new THREE.SphereGeometry(0.11, 8, 6), IRON, {
      bone: chain.joints[1], at: chain.joints[1].at, scale: [1.15, 0.65, 1.15], group: "armor", name: side > 0 ? "kneeLPad" : "kneeRPad",
    });
    b.frustumBox(chain.joints[2].at, chain.tip!.at, [0.13, 0.12], [0.15, 0.13], { bone: chain.tip!, color: BOOT, group: "boots", name: side > 0 ? "bootL" : "bootR" });
    b.part(new THREE.BoxGeometry(0.18, 0.11, 0.29), BOOT, {
      bone: chain.tip!, at: chain.tip!.local({ forward: 0.07, down: 0.015 }), group: "boots", name: side > 0 ? "soleL" : "soleR",
    });
  }
  for (const [chain, side] of [[armL, 1], [armR, -1]] as const) {
    b.sweep(chain, [0.085, 0.06], { color: COAT, section: { ngon: 7 }, group: "limbs", name: side > 0 ? "sleeveL" : "sleeveR" });
    b.part(new THREE.SphereGeometry(0.09, 8, 6), GLOVE, { bone: chain.tip!, at: chain.tip!.at, scale: [1.0, 0.8, 1.1], group: "hands", name: side > 0 ? "gloveL" : "gloveR" });
  }

  // Head, ears, eyes and a separate lower jaw for rigging.
  b.part(new THREE.SphereGeometry(0.5, 10, 8), SKIN, {
    bone: head, at: head.local({ forward: 0.065, up: 0.015 }), scale: [0.275, 0.285, 0.27], group: "head", name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.46, 9, 7), SKIN, {
    bone: jaw, at: jaw.at, scale: [0.245, 0.12, 0.225], group: "head", name: "lowerJaw",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.072, 8, 6), SKIN, {
      bone: head, at: head.local({ left: s * 0.25, up: 0.01, forward: 0.055 }), scale: [0.8, 1.15, 0.7], group: "head", name: s > 0 ? "earL" : "earR",
    });
    const eyeAt = head.local({ left: s * 0.112, up: 0.065, forward: 0.245 });
    b.part(new THREE.SphereGeometry(0.043, 8, 6), EYE, { bone: head, at: eyeAt, group: "face", name: s > 0 ? "eyeL" : "eyeR" });
    b.part(new THREE.SphereGeometry(0.022, 6, 4), IRIS, { bone: head, at: head.local({ left: s * 0.112, up: 0.065, forward: 0.282 }), group: "face", name: s > 0 ? "irisL" : "irisR" });
    b.sweep(bezier(
      head.local({ left: s * 0.18, up: 0.12, forward: 0.21 }),
      head.local({ left: s * 0.12, up: 0.14, forward: 0.24 }),
      head.local({ left: s * 0.055, up: 0.12, forward: 0.25 }),
    ), [0.024, 0.01], { bone: head, color: BEARD, caps: "round", group: "face", name: s > 0 ? "browL" : "browR" });
  }
  b.part(new THREE.SphereGeometry(0.075, 8, 6), SKIN, { bone: head, at: head.local({ down: 0.01, forward: 0.29 }), scale: [0.85, 0.9, 1.15], group: "face", name: "nose" });

  // Helmet with brim, dome, cheek guards and warm metal rivets.
  b.part(new THREE.CylinderGeometry(0.34, 0.31, 0.075, 10), BRONZE_PAINT, { bone: head, at: head.local({ up: 0.17 }), group: "helmet", name: "helmetBrim" });
  b.part(new THREE.SphereGeometry(0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58), BRONZE_PAINT, {
    bone: head, at: head.local({ up: 0.17 }), group: "helmet", name: "helmetDome",
  });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.07, 0.24, 0.16), BRONZE_PAINT, {
      bone: head, at: head.local({ left: s * 0.245, down: 0.01, forward: 0.06 }), group: "helmet", name: s > 0 ? "cheekGuardL" : "cheekGuardR",
    });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.016, 6, 4), BRONZE_HI, {
        bone: head, at: head.local({ left: s * 0.285, down: -0.06 + i * 0.06, forward: 0.1 }), group: "helmet", name: s > 0 ? `helmRivetL${i}` : `helmRivetR${i}`,
      });
    }
  }
  b.part(new THREE.BoxGeometry(0.22, 0.06, 0.03), BRONZE_HI, { bone: head, at: head.local({ up: 0.19, forward: 0.255 }), group: "helmet", name: "helmetNoseRidge" });

  // Beard: a heavy front mass, twin moustache curls, and two articulated braids.
  const beardPath = catmull([
    head.local({ forward: 0.2, down: 0.02 }),
    head.local({ forward: 0.29, down: 0.09 }),
    head.local({ forward: 0.31, down: 0.20 }),
    head.local({ forward: 0.28, down: 0.31 }),
  ]);
  b.sweep(beardPath, [0.145, 0.055], { bone: jaw, color: BEARD, section: { ngon: 7 }, caps: "round", group: "beard", name: "beardMass" });
  for (const s of [1, -1]) {
    b.sweep(bezier(
      head.local({ left: s * 0.03, down: 0.01, forward: 0.285 }),
      head.local({ left: s * 0.09, down: 0.01, forward: 0.33 }),
      head.local({ left: s * 0.16, down: 0.045, forward: 0.30 }),
    ), [0.045, 0.014], { bone: head, color: BEARD_HI, caps: "round", group: "beard", name: s > 0 ? "moustacheL" : "moustacheR" });
    const braid = b.sweep(catmull([
      head.local({ left: s * 0.15, down: 0.08, forward: 0.24 }),
      head.local({ left: s * 0.18, down: 0.22, forward: 0.25 }),
      head.local({ left: s * 0.17, down: 0.38, forward: 0.29 }),
      head.local({ left: s * 0.13, down: 0.48, forward: 0.33 }),
    ]), [0.045, 0.014], { bone: jaw, color: BEARD_HI, section: { ngon: 6 }, caps: "round", group: "beard", name: s > 0 ? "braidL" : "braidR" });
    b.along(braid, 4, (at) => b.part(new THREE.SphereGeometry(0.029, 6, 4), BRONZE_HI, { frame: at, group: "beard", name: s > 0 ? "braidBeadL" : "braidBeadR" }));
  }

  // Belt, harness and ammunition details.
  const belt = b.surface(torso).loop(spine.joints[0], { lift: 0.018 });
  b.sweep(belt, 0.028, { color: LEATHER, section: { ngon: 6 }, group: "gear", name: "belt" });
  b.part(new THREE.BoxGeometry(0.13, 0.14, 0.045), BRONZE_HI, { bone: hips, at: [0, 0.93, 0.30], group: "gear", name: "beltBuckle" });
  const harness = b.sweep(catmull([[0.25, 1.3, 0.22], [-0.1, 1.15, 0.28], [-0.24, 0.96, 0.25]]), 0.018, { bone: hips, color: LEATHER, caps: "round", group: "gear", name: "crossHarness" });
  b.along(harness, 5, (at) => b.part(new THREE.SphereGeometry(0.022, 6, 4), BRONZE_HI, { frame: at, group: "gear", name: "harnessRivet" }));
  b.along(harness, 7, (at) => b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.045, 6), AMMO, { frame: at, group: "gear", name: "ammoRound" }));
  const pouchAt = hips.local({ left: 0.23, down: 0.02, forward: 0.24 });
  b.part(new THREE.BoxGeometry(0.16, 0.19, 0.13), LEATHER, { bone: hips, at: pouchAt, group: "gear", name: "ammoPouch" });
  b.part(new THREE.BoxGeometry(0.13, 0.035, 0.14), BRONZE, { bone: hips, at: hips.local({ left: 0.23, down: -0.12, forward: 0.31 }), group: "gear", name: "pouchFlap" });

  // Oversized blunderbuss: wooden stock, iron barrel, flared muzzle and trigger hardware.
  const stockA = armR.tip!.local({ back: 0.15, down: 0.02 });
  const stockB = armR.tip!.local({ forward: 0.40, up: 0.03 });
  b.frustumBox(stockA, stockB, [0.095, 0.085], [0.07, 0.07], { bone: armR.tip!, color: WOOD, group: "blunderbuss", name: "rifleStock" });
  const barrelA = [0, 1.15, 0.43] as [number, number, number];
  const barrelB = [0, 1.19, 1.12] as [number, number, number];
  b.frustumBox(barrelA, barrelB, [0.07, 0.07], [0.15, 0.15], { bone: armR.tip!, color: IRON, group: "blunderbuss", name: "rifleBarrel" });
  b.part(new THREE.TorusGeometry(0.145, 0.022, 6, 10), BRONZE_HI, { bone: armR.tip!, at: barrelB, dir: [0, 0, 1], group: "blunderbuss", name: "muzzleBand" });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 10), IRON_HI, { bone: armR.tip!, at: [0, 1.19, 1.125], dir: [0, 0, 1], group: "blunderbuss", name: "muzzleFace" });
  b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.018, 10), EYE, { bone: armR.tip!, at: [0, 1.19, 1.137], dir: [0, 0, 1], group: "blunderbuss", name: "muzzleBore" });
  b.frustumBox([0, 1.13, 0.33], [0, 1.14, 0.49], [0.06, 0.04], [0.035, 0.03], { bone: armR.tip!, color: IRON_HI, group: "blunderbuss", name: "triggerGuard" });
  b.part(new THREE.SphereGeometry(0.026, 6, 4), BRONZE_HI, { bone: armR.tip!, at: [0, 1.12, 0.42], group: "blunderbuss", name: "trigger" });
  b.part(new THREE.BoxGeometry(0.035, 0.12, 0.05), IRON_HI, { bone: armR.tip!, at: [0, 1.18, 0.78], group: "blunderbuss", name: "frontSight" });
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.13), BRONZE, { bone: armR.tip!, at: [0, 1.18, 0.62], group: "blunderbuss", name: "barrelBand" });
  for (const x of [-0.11, 0.11]) {
    b.part(new THREE.SphereGeometry(0.018, 6, 4), BRONZE_HI, { bone: armR.tip!, at: [x, 1.19, 0.64], group: "blunderbuss", name: "barrelRivet" });
  }

  // Small silhouette accents: shoulder plates and boot buckles.
  for (const s of [1, -1]) {
    const shoulder = s > 0 ? armL.joints[0] : armR.joints[0];
    b.part(new THREE.SphereGeometry(0.14, 8, 5), IRON, { bone: shoulder, at: shoulder.at, scale: [1.35, 0.58, 1.2], group: "armor", name: s > 0 ? "pauldronL" : "pauldronR" });
    b.part(new THREE.BoxGeometry(0.09, 0.035, 0.045), BRONZE_HI, { bone: shoulder, at: shoulder.local({ down: -0.08, forward: 0.08 }), group: "armor", name: s > 0 ? "pauldronRidgeL" : "pauldronRidgeR" });
  }

  return b.root;
}

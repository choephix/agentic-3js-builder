import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { PointInput } from "../src/math";
import { bezier, catmull, polyline } from "../src/path";
import type { Chain, Joint } from "../src/skeleton";
import { countershade, mottle, patches } from "../src/paint";
import { glow } from "../kits/glow";

const FLESH = "#873e45";
const FLESH_DARK = "#4b2029";
const FLESH_LIGHT = "#b86a68";
const SEAM = "#24141a";
const BONE = "#d9c5a1";
const BONE_DARK = "#74614e";
const IRON = "#26313a";
const IRON_EDGE = "#8a7460";
const EYE = "#f6a13a";
const MOUTH = "#180d12";

export const meta = {
  name: "Stitched Abomination",
  description: "A hulking stitched flesh golem, held together by iron hooks, hanging chains, and crude bone staples.",
  style: "Blizzard/Warcraft",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "stitchedAbomination", detail: 1 });
  const flesh = countershade(mottle(FLESH, FLESH_LIGHT, { size: 0.18, contrast: 0.5, seed: 19 }), FLESH_DARK, { level: -0.12 });
  const patchFlesh = patches(flesh, FLESH_LIGHT, { size: 0.34, gap: 0.025, seed: 8 });
  const stitchPath = (a: PointInput, c: PointInput, bone: Joint) => {
    b.rod(a, c, 0.012, { color: SEAM, bone });
  };

  // Skeleton first: one heavy spine, a hinged jaw, four limbs, and articulated digits.
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.98, 0], [0, 1.30, 0.01], [0, 1.62, 0.02]], { tension: 0.35 }), {
    parent: hips,
    names: ["spineLower", "spineUpper", "chest"],
    role: "spine",
  });
  const spineTop = spine.joints[spine.joints.length - 1];
  const neck = b.chain("neck", catmull([[0, 1.62, 0.02], [0, 1.80, 0.08], [0, 1.94, 0.17]], { tension: 0.25 }), {
    parent: spineTop,
    names: ["neckBase", "neckTop", "throat"],
    role: "neck",
  });
  const neckTop = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckTop, at: [0, 2.05, 0.24], dir: [0, 0.08, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.91, 0.38], aim: [0, 1.84, 0.62], role: "jaw" });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  const armPoints = (s: number) => [[s * 0.40, 1.59, 0.02], [s * 0.68, 1.43, 0.07], [s * 0.88, 1.17, 0.16], [s * 1.02, 1.04, 0.28]];
  const legPoints = (s: number) => [[s * 0.25, 0.98, -0.01], [s * 0.30, 0.58, 0.10], [s * 0.27, 0.22, 0.20], [s * 0.27, 0.13, 0.38]];
  const arms = new Map<number, Chain>();
  const legs = new Map<number, Chain>();
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = b.chain(`arm${side}`, catmull(armPoints(s), { tension: 0.15 }), {
      parent: spineTop,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
    });
    const leg = b.chain(`leg${side}`, catmull(legPoints(s), { tension: 0.12 }), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.27, 0.02, 0.38],
    });
    arms.set(s, arm);
    legs.set(s, leg);

    // Three oversized, individually riggable fingers on each hand.
    for (let f = 0; f < 3; f++) {
      const fx = (f - 1) * 0.075;
      const finger = b.chain(`finger${side}${f + 1}`, [[s * (1.00 + fx), 1.03, 0.32], [s * (1.10 + fx * 1.15), 0.95 - f * 0.025, 0.44], [s * (1.17 + fx * 1.35), 0.88 - f * 0.035, 0.52]], {
        parent: arm.joints[arm.joints.length - 1],
        names: [`digit${side}${f + 1}a`, `digit${side}${f + 1}b`, `digit${side}${f + 1}tip`],
        role: "digit",
      });
      b.sweep(finger, [0.045, 0.025], { color: flesh, section: { ngon: 6 }, caps: "round", group: "fingers" });
    }
  }

  // Main body: broad, faceted masses with a heavy belly and a hunched shoulder block.
  const torso = b.sweep(spine, (t) => [0.34 + 0.13 * Math.sin(Math.PI * t), 0.40 + 0.08 * Math.sin(Math.PI * t)], {
    color: patchFlesh,
    section: { ngon: 8 },
    shift: (t) => [0, -0.04 - 0.04 * Math.sin(Math.PI * t)],
    group: "flesh",
    name: "stitchedTorso",
  });
  const chest = spineTop;
  b.part(new THREE.SphereGeometry(0.43, 8, 6), flesh, { bone: chest, at: [0, 1.62, 0.03], scale: [1.17, 0.84, 0.98], name: "shoulderMass" });
  b.part(new THREE.SphereGeometry(0.36, 8, 6), flesh, { bone: hips, at: [0, 1.02, -0.03], scale: [1.12, 0.78, 0.90], name: "pelvisMass" });
  b.sweep(neck, [0.19, 0.27], { color: flesh, section: { ngon: 7 }, group: "flesh", name: "thickNeck" });

  // Limbs are intentionally chunky and uneven, with darker undersides and pale scar tissue.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = arms.get(s)!;
    const leg = legs.get(s)!;
    b.sweep(arm, (t) => [0.16 - 0.055 * t, 0.20 - 0.07 * t], {
      color: flesh,
      section: { ngon: 6 },
      sectors: [[115, 245, FLESH_DARK], [-55, 55, FLESH_LIGHT]],
      group: `arm${side}`,
      name: `armFlesh${side}`,
    });
    b.sweep(leg, (t) => [0.21 - 0.08 * t, 0.24 - 0.10 * t], {
      color: flesh,
      section: { ngon: 7 },
      sectors: [[110, 250, FLESH_DARK], [-50, 50, FLESH_LIGHT]],
      group: `leg${side}`,
      name: `legFlesh${side}`,
    });
    const armTip = arm.joints[arm.joints.length - 1];
    const legTip = leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.18, 7, 5), flesh, { bone: armTip, at: armTip.at, scale: [1.15, 0.9, 1.2], name: `fist${side}` });
    b.frustumBox(legTip.at, [s * 0.31, 0.16, 0.50], [0.19, 0.19], [0.15, 0.14], { bone: legTip, color: flesh, name: `footBlock${side}` });

    // Bone staples across each elbow, knee, and wrist.
    for (const [joint, label] of [[arm.joints[1], "elbow"], [arm.joints[2], "wrist"], [leg.joints[1], "knee"], [leg.joints[2], "ankle"]] as const) {
      const ring = b.ring(joint, { count: 5, radius: 0.015, fromDeg: 18, toDeg: 342 });
      for (const item of ring.items) b.spike(item, item, 0.075, 0.012, { color: BONE, group: `${label}Staples` });
    }
  }

  // Head, jaw, and a mouth cavity that remains separate so the jaw hinge reads.
  b.part(new THREE.SphereGeometry(0.31, 8, 6), flesh, { bone: head, at: head.at, scale: [1.08, 1.12, 1.18], name: "stitchedHead" });
  b.part(new THREE.BoxGeometry(0.34, 0.13, 0.26), MOUTH, { bone: jaw, at: [0, 1.88, 0.48], scale: [1.15, 1, 1.3], name: "mouthCavity" });
  b.part(new THREE.BoxGeometry(0.40, 0.10, 0.18), flesh, { bone: jaw, at: [0, 1.90, 0.53], scale: [1.1, 1, 1], name: "lowerJaw" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.085, 8, 5), MOUTH, { bone: head, at: [s * 0.13, 2.10, 0.555], scale: [1.35, 1.1, 0.38], name: `eyeSocket${s > 0 ? "L" : "R"}` });
    const eye = b.part(new THREE.SphereGeometry(0.064, 8, 5), EYE, { bone: head, at: [s * 0.13, 2.10, 0.585], scale: [1, 1, 0.55], name: `glowingEye${s > 0 ? "L" : "R"}` });
    glow(eye, 2.2);
    b.ring(eye, { count: 7, radius: 0.075, fromDeg: -70, toDeg: 70 }, (lash) => b.spike(lash, lash, 0.055, 0.009, { color: BONE_DARK, group: "eyeStaples" }));
  }
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.065;
    b.spike([x, 1.96, 0.56], [x, 1.89, 0.62], null, 0.025, { color: BONE, bone: jaw, group: "teeth", name: `tooth${i + 1}` });
  }

  // Broad pale scar plates and seams break up the flesh into sewn-together slabs.
  const scar = b.extrude([[-0.13, 0], [0.13, 0], [0.18, 0.10], [0.08, 0.26], [-0.08, 0.26], [-0.18, 0.10]], {
    at: [0, 1.31, 0.39], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.008, color: FLESH_LIGHT, bone: spine.joints[1], name: "sternumPatch",
  });
  b.stick(new THREE.BoxGeometry(0.035, 0.20, 0.025), BONE_DARK, scar.moved([0, 0.02, 0.02]), { embed: 0.1, name: "sternumPin" });
  const seamLines: Array<[number[], number[]]> = [
    [[-0.24, 1.53, 0.39], [0.24, 1.53, 0.39]],
    [[-0.31, 1.27, 0.37], [0.30, 1.27, 0.37]],
    [[-0.27, 1.06, 0.30], [0.24, 1.06, 0.30]],
    [[-0.13, 1.78, 0.32], [0.13, 1.78, 0.32]],
    [[-0.16, 2.00, 0.47], [0.16, 2.00, 0.47]],
  ];
  for (const [a, c] of seamLines) stitchPath(a, c, chest);
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const y = 0.79 + i * 0.13;
      const z = 0.22 + (i % 2) * 0.035;
      b.rod([s * (0.25 + 0.025 * (i % 2)), y, z], [s * (0.35 + 0.02 * (i % 2)), y + 0.055, z + 0.012], 0.010, { color: SEAM, bone: hips, group: "bellyStitches" });
    }
  }

  // Crude metal shoulder hooks with heavy chains dropping from them.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hookBase = [s * 0.48, 1.83, 0.16] as [number, number, number];
    const hookCurve = bezier(hookBase, [s * 0.65, 1.97, 0.23], [s * 0.72, 1.75, 0.25], [s * 0.59, 1.60, 0.24]);
    b.sweep(hookCurve, [0.038, 0], { color: IRON_EDGE, caps: { start: "round", end: "point" }, bone: chest, group: "hooks", name: `shoulderHook${side}` });
    const chainPoints = [[s * 0.60, 1.63, 0.24], [s * 0.61, 1.35, 0.27], [s * 0.67, 1.09, 0.30], [s * 0.73, 0.83, 0.33]] as [number, number, number][];
    const chainPath = polyline(chainPoints);
    b.sweep(chainPath, 0.018, { color: IRON, section: { ngon: 6 }, caps: "round", bone: chest, group: "chains", name: `hangingChain${side}` });
    for (let i = 0; i < 6; i++) {
      const p = chainPath.at(i / 5);
      b.part(new THREE.TorusGeometry(0.053, 0.014, 5, 8), IRON_EDGE, { bone: chest, at: p, rotation: [0, 90 * (i % 2), 18 * s], name: `chainLink${side}${i + 1}` });
    }
  }

  // A belt of iron plates and rivets cinches the abdomen; a hook hangs from its front.
  const belt = b.surface(torso).loop([0, 1.14, 0.02], { dir: [0, 1, 0], lift: 0.015 });
  b.sweep(belt, 0.026, { color: IRON, caps: "none", group: "ironBelt", name: "waistBelt" });
  b.along(belt, 12, (at) => b.part(new THREE.SphereGeometry(0.028, 6, 4), IRON_EDGE, { at, name: "beltRivet" }));
  const bellyHook = bezier([0, 1.13, 0.39], [0.02, 1.04, 0.49], [0.02, 0.83, 0.48], [0.10, 0.73, 0.40]);
  b.sweep(bellyHook, [0.035, 0], { color: IRON_EDGE, caps: { start: "round", end: "point" }, bone: hips, group: "hooks", name: "bellyHook" });

  // Nails, bolts, and small scars sell the hand-painted, assembled construction.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const at = [s * (0.30 + (i % 2) * 0.09), 1.44 - i * 0.10, 0.35] as [number, number, number];
      b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.018, 6), IRON_EDGE, { bone: chest, at, rotation: [90, 0, 0], name: `chestRivet${sideIndex(s)}${i}` });
    }
  }
  for (let i = 0; i < 6; i++) {
    const y = 1.72 + i * 0.045;
    b.rod([-0.10, y, 0.34], [0.10, y + 0.018, 0.34], 0.008, { color: BONE_DARK, bone: head, group: "faceStitches" });
  }

  return b.root;
}

function sideIndex(s: number) {
  return s > 0 ? "L" : "R";
}

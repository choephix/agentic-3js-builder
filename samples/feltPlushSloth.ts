import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { offset, rng } from "../src/math";
import { countershade, grain, mottle, paint } from "../src/paint";
import { arc, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Felt Plush Sloth",
  description:
    "A needle-felted wool sloth toy hanging upside down from a branch by all four hooked claws, with button eyes, stitched seams and a leaf in its mouth.",
};

// Muted pastel wool palette.
const ECRU = "#d9cbae";
const BACK = "#a89a80";
const PATCH = "#5f4f3d";
const BUTTON = "#33291f";
const NOSE = "#453729";
const MOUTH_LINE = "#4a3d2f";
const CLAW = "#6e6154";
const THREAD = "#efe3c8";
const SEAM = "#6b5c48";
const BLUSH = "#d9a08e";
const HIGHLIGHT = "#fdf6e8";
const LEAF = "#8fae6d";
const STEM = "#6f8f52";
const ENDGRAIN = "#a0805a";
const BARKDARK = "#6b5844";

export default function build() {
  // paintSize 2048: the fine fibre streaks need the texel density.
  const b = createBuilder({ name: "feltPlushSloth", paintSize: 2048 });

  // --- Wool paints. Fibre streaks (~8mm grain) over cloudy mottle blobs;
  // shared seeds so the pattern runs on across body, limbs and head.
  // The belly faces UP toward the branch, so countershade puts pale up.
  const bellyP = grain(mottle(ECRU, "#c9bb9e", { size: 0.05, seed: 2 }), "#b0a088", {
    size: 0.008,
    seed: 4,
  });
  const backP = grain(mottle(BACK, "#94876f", { size: 0.05, seed: 2 }), "#746552", {
    size: 0.008,
    seed: 5,
  });
  const coat = countershade(bellyP, backP, { level: 0.1 });
  const barkH = grain("#7d6549", "#5d4a36", { size: 0.03, axis: "x", seed: 6 });
  const barkV = grain("#7d6549", "#5d4a36", { size: 0.03, axis: "y", seed: 6 });
  const leafP = grain(LEAF, "#7a9a5c", { size: 0.006, axis: "z", seed: 8 });
  // Fibre flecks: sparse tiny pale dashes scattered through the coat.
  const fleck = paint((p, n) => {
    const h =
      Math.abs(
        Math.sin(
          Math.floor(p.x / 0.006) * 12.9898 + Math.floor(p.y / 0.006) * 78.233 + Math.floor(p.z / 0.006) * 37.719,
        ) * 43758.5453,
      ) % 1;
    return h > 0.94 && n.y < 0.4 ? "#e8dcc0" : coat.at(p, n);
  });
  // Patch felt: subtle horizontal fibre lay so the patches read softer.
  const patchP = grain(PATCH, "#6d5d49", { size: 0.004, axis: "z", seed: 9 });

  // Branch contract: axis along X at y = 1.30, z = 0.03, radius 0.05.
  const BR = 1.3;
  const BZ = 0.03;
  // Trunk: one chain from tail root to head so the whole torso is smooth.
  // The chain's first joint is the root; keep its position as the pelvis.
  const pelvis = b.joint("hips", { at: [0, 1.0, -0.26] });
  const trunkPts = limb([0, 1.0, -0.26], [0, 1.03, 0.18], [0.24, 0.24], [[0, 0, 1]]);
  if (trunkPts[trunkPts.length - 1].distanceTo(new THREE.Vector3(0, 1.03, 0.18)) > 1e-3)
    throw new Error("trunk too short");
  const trunk = b.chain("trunk", trunkPts, {
    parent: pelvis,
    names: ["spine", "chest"],
    role: "spine",
  });
  const chest = trunk.joints[1];
  const neck = b.chain(
    "neck",
    [
      [0, 1.03, 0.18],
      [0, 1.025, 0.26],
    ],
    { parent: chest, names: ["neck", "head"], role: "neck" },
  );
  const head = neck.joints[1];
  const jawJ = b.joint("jaw", {
    parent: head,
    at: [0, 0.945, 0.3],
    dir: [0, -0.35, 1],
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    [
      [0, 1.0, -0.26],
      [0, 0.972, -0.3],
      [0, 0.958, -0.315],
    ],
    { parent: pelvis, names: ["tailBase", "tailTip"], role: "tail" },
  );

  // Long shaggy arms: shoulder -> elbow -> wrist up to the branch front face.
  // Legs: hip -> knee -> ankle up to the branch back face.
  const arms = [];
  const legs = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armPts = limb([s * 0.11, 1.01, -0.02], [s * 0.29, BR + 0.01, 0.08], [0.26, 0.24], [[s * 0.6, -0.2, -1]]);
    if (armPts[armPts.length - 1].distanceTo(new THREE.Vector3(s * 0.29, BR + 0.01, 0.08)) > 1e-3)
      throw new Error("arm too short");
    arms.push(
      b.chain("arm" + side, armPts, {
        parent: chest,
        names: ["shoulder" + side, "elbow" + side, "wrist" + side],
        role: "arm",
      }),
    );
    const legPts = limb([s * 0.08, 0.99, -0.2], [s * 0.22, BR + 0.005, -0.02], [0.22, 0.2], [[s * 0.4, -0.3, 1]]);
    if (legPts[legPts.length - 1].distanceTo(new THREE.Vector3(s * 0.22, BR + 0.005, -0.02)) > 1e-3)
      throw new Error("leg too short");
    legs.push(
      b.chain("leg" + side, legPts, {
        parent: pelvis,
        names: ["hip" + side, "knee" + side, "ankle" + side],
        role: "leg",
      }),
    );
  }

  // Toe hooks: three short digit chains per paw arc over the branch top and
  // curl down its back face, so the tips bury in the branch.
  const toeChains = [];
  const pawKinds = ["HandL", "HandR", "FootL", "FootR"];
  const pawTips = [arms[0].tip!, arms[1].tip!, legs[0].tip!, legs[1].tip!];
  for (const [pi, tip] of pawTips.entries()) {
    for (let i = 0; i < 3; i++) {
      const tag = pawKinds[pi] + (i + 1);
      const root: [number, number, number] = [tip.at.x + (i - 1) * 0.02, tip.at.y - 0.004, tip.at.z + (i - 1) * 0.004];
      const over: [number, number, number] = [tip.at.x + (i - 1) * 0.022, BR + 0.058, BZ + 0.002];
      const tipP: [number, number, number] = [tip.at.x + (i - 1) * 0.022, BR - 0.01, BZ - 0.05];
      toeChains.push(
        b.chain("toe" + tag, [root, over, tipP], {
          parent: tip,
          names: ["toe" + tag, "claw" + tag],
          role: "digit",
        }),
      );
    }
  }

  // ============ Body, tail, limbs ============
  const body = b.sweep(
    catmull([
      [0, 1.0, -0.27],
      [0, 1.005, -0.14],
      [0, 1.02, -0.01],
      [0, 1.028, 0.1],
      [0, 1.03, 0.17],
    ]),
    [0.055, 0.115, 0.125, 0.115, 0.095, 0.07],
    { bone: [trunk, neck, head], color: fleck, sides: 12 },
  );
  b.sweep(tail, [0.03, 0.022, 0.012], { color: fleck });
  const limbSweeps = [];
  for (const chain of [...arms, ...legs])
    limbSweeps.push(b.sweep(chain, [0.068, 0.055, 0.044], { color: fleck, sides: 10 }));
  // Claws: wool at the base, dark hook where they wrap the branch. A steeper
  // taper keeps the tips slim so they disappear behind the branch.
  for (const chain of toeChains)
    b.sweep(chain, [0.016, 0.01, 0.0035], {
      color: fleck,
      bands: [
        [0.35, fleck],
        [1, CLAW],
      ],
      sides: 8,
    });

  // ============ Head: round sleepy face, separate lower jaw ============
  const skull = b.sweep(
    catmull([
      [0, 1.028, 0.24],
      [0, 1.01, 0.315],
      [0, 0.982, 0.355],
      [0, 0.955, 0.355],
    ]),
    [0.085, 0.105, 0.1, 0.062],
    { bone: head, color: fleck, sides: 12 },
  );
  // Lower jaw: a separate chin under the skull so the mouth can open.
  b.sweep(
    [
      [0, 0.958, 0.305],
      [0, 0.942, 0.335],
      [0, 0.94, 0.352],
    ],
    [0.03, 0.024, 0.014],
    { bone: jawJ, color: fleck },
  );

  const face = b.surface(skull);
  const faceC = [0, 0.995, 0.35] as [number, number, number];

  // Dark eye patches with real button eyes: glossy domes with a thread
  // shank ring and a pale catchlight dot so they read as sewn buttons.
  for (const s of [1, -1]) {
    const patchHit = face.around(faceC).at(s * 26, 2)!;
    const patchGeo = new THREE.SphereGeometry(0.038, 10, 8);
    patchGeo.scale(0.78, 1.1, 0.45);
    const patch = b.stick(patchGeo, patchP, patchHit, { embed: 0.35, spin: s * -18 });
    const shankGeo = new THREE.TorusGeometry(0.0105, 0.0035, 6, 14);
    b.stick(shankGeo, THREAD, patch.moved([0, 0.004, 0.024]), { embed: 0.25 });
    const btnGeo = new THREE.SphereGeometry(0.014, 14, 10);
    btnGeo.scale(1, 1, 0.55);
    const btn = b.stick(btnGeo, BUTTON, patch.moved([0, 0.004, 0.025]), { embed: 0.35 });
    b.part(new THREE.SphereGeometry(0.0032, 6, 5), HIGHLIGHT, { at: btn.local([0.004, 0.005, 0.005]) });
    // Sleepy lid: a felt fold lapping the top of the patch.
    const lidHit = face.around(faceC).at(s * 32, 27)!;
    const lidGeo = new THREE.SphereGeometry(0.027, 8, 6);
    lidGeo.scale(1.2, 0.5, 0.6);
    b.stick(lidGeo, fleck, lidHit, { embed: 0.45 });
    // Blush dot below the patch.
    const blushHit = face.around(faceC).at(s * 55, -8)!;
    const blushGeo = new THREE.SphereGeometry(0.013, 8, 6);
    blushGeo.scale(1, 0.7, 0.5);
    b.stick(blushGeo, BLUSH, blushHit, { embed: 0.5 });
    // Tiny ear tuft high on the side.
    const earHit = face.around(faceC).at(s * 115, 30)!;
    const earGeo = new THREE.SphereGeometry(0.028, 8, 6);
    earGeo.scale(0.7, 0.9, 0.6);
    b.stick(earGeo, fleck, earHit, { embed: 0.5 });
  }

  // Nose at the muzzle front, smile draped below it.
  const noseHit = face.around(faceC).at(0, -22)!;
  const noseGeo = new THREE.SphereGeometry(0.021, 10, 8);
  noseGeo.scale(1.15, 0.8, 0.7);
  b.stick(noseGeo, NOSE, noseHit, { embed: 0.35 });
  const smilePath = face.drape(arc([0, 0.945, 0.345], [-0.032, 0.949, 0.336], [0, 0, 1], 180), { lift: 0.002 });
  b.sweep(smilePath, 0.0032, { color: MOUTH_LINE });

  // Small felt leaf tucked in the mouth corner, riding the jaw.
  const leafHit = face.around(faceC).at(-30, -27)!;
  const leafAt = offset(leafHit.at, leafHit.n, -0.004);
  b.extrude(
    [
      [0, 0],
      [0.026, 0.008],
      [0.04, 0.032],
      [0.018, 0.06],
      [-0.005, 0.066],
      [-0.02, 0.036],
      [-0.016, 0.01],
    ],
    {
      at: leafAt,
      x: [1, -0.4, 0.3],
      y: [-0.2, 0.7, 0.7],
      thickness: 0.004,
      smoothing: 1,
      color: leafP,
      bone: jawJ,
    },
  );
  b.rod(offset(leafAt, [0.6, -0.4, 0.4], 0.004), offset(leafAt, [0.6, -0.4, 0.4], 0.04), 0.004, {
    color: STEM,
    bone: jawJ,
  });

  // ============ Belly seam with running-stitch knots ============
  const seamPath = b.surface(body).drape(
    catmull([
      [0, 1.14, -0.22],
      [0, 1.142, -0.06],
      [0, 1.14, 0.08],
    ]),
    { lift: 0.001 },
  );
  b.sweep(seamPath, 0.003, { color: SEAM });
  const stitchGeos: THREE.BufferGeometry[] = [];
  b.along(seamPath, 9, (pp) => {
    const g = new THREE.SphereGeometry(0.0042, 6, 5);
    g.translate(pp.at.x, pp.at.y + 0.0035, pp.at.z);
    stitchGeos.push(g);
  });
  b.part(mergeGeometries(stitchGeos)!, THREAD, { at: [0, 0, 0] });

  // ============ Scenery: branch on two posts ============
  // Plain scenery on the root: no bone, so the flex tests never move it.
  b.rod([-0.55, BR, BZ], [0.55, BR, BZ], 0.05, {
    color: barkH,
    bands: [
      [0.03, ENDGRAIN],
      [0.97, barkH],
      [1, ENDGRAIN],
    ],
    sides: 10,
  });
  for (const s of [1, -1]) {
    b.rod([s * 0.45, 0, BZ], [s * 0.45, 1.28, BZ], 0.035, { color: barkV });
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 12), BARKDARK, { at: [s * 0.45, 0.0125, BZ] });
  }
  // One cut twig above the branch.
  b.spike([-0.2, 1.34, BZ], [-0.22, 1.42, 0.02], null, 0.018, { color: barkV });

  // ============ Shaggy fur cards ============
  const strand = svg(
    `<svg viewBox="0 0 32 64"><path d="M13 64 Q11 42 14 22 Q15 10 17 2 Q19 10 19 22 Q20 42 21 64 Z" fill="#ffffff"/><path d="M7 64 Q7 50 9 38 Q10 48 11 64 Z" fill="#ffffff"/><path d="M22 64 Q22 50 24 40 Q25 50 25 64 Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const cardOpts = {
    lean: 62,
    bend: 38,
    flow: [0, -1, -0.3] as [number, number, number],
    vary: 0.5,
    spin: 20,
    color: coat,
  };
  b.cards(b.surface(body).scatter(300, { rng: rng(11), minDist: 0.018 }), strand, {
    ...cardOpts,
    size: [0.022, 0.055],
    rng: rng(12),
  });
  b.cards(b.surface(limbSweeps).scatter(220, { rng: rng(13), minDist: 0.02 }), strand, {
    ...cardOpts,
    size: [0.02, 0.048],
    rng: rng(14),
  });
  b.cards(
    b.surface(skull).scatter(130, { rng: rng(15), minDist: 0.012, filter: (h) => h.n.y > -0.35 || h.at.y < 1.0 }),
    strand,
    { ...cardOpts, size: [0.018, 0.038], rng: rng(16) },
  );

  return b.root;
}

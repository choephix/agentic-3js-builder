import * as THREE from "three";
import { catmull, createBuilder, limb, mottle, noise, paint } from "../../../../src/index";

export const meta = {
  name: "koala",
  description: "A stylized koala sitting upright with huge round ears and a black nose, holding a sprig of eucalyptus.",
};

// Palette
const FUR = "#9ca2a7";
const FUR_DARK = "#7b8288";
const CREAM = "#efe9dd";
const NOSE = "#1d1e22";
const EYE = "#0e0f11";
const GLINT = "#ffffff";
const CLAW = "#2a2b30";
const STEM = "#7d6b4d";
const LEAF = "#86ad93";
const LEAF_DARK = "#5f8670";

// Grey fur with a cream chest, a pale chin, and a soft mottle.
const grey = mottle(FUR, FUR_DARK, { size: 0.09, contrast: 0.35, seed: 4 });
const coat = paint((p, n) => {
  const wobble = (noise(p, 0.05, 7) - 0.5) * 0.4;
  if (p.y > 0.18 && p.y < 0.42 && n.z + wobble > 0.35) return CREAM; // chest and belly
  if (p.y > 0.6 && p.y < 0.69 && n.z + wobble > 0.55) return CREAM; // pale chin
  return grey;
});

// Ears: cream top, grey rim.
const earPaint = paint((_p, _n, s) => (s[0] > 0.045 ? CREAM : grey));

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Skeleton: hips, spine, neck, a jawed head, two arms and two legs.
  const hips = b.joint("hips", { at: [0, 0.12, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.12, -0.02],
      [0, 0.24, 0],
      [0, 0.36, 0.02],
      [0, 0.47, 0.03],
    ]),
    { parent: hips, names: ["waist", "back", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.47, 0.03],
      [0, 0.55, 0.055],
      [0, 0.61, 0.08],
    ]),
    { parent: chest, names: ["neckLo", "neckHi", "head"], role: "neck" },
  );
  const head = neck.tip!;
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.63, 0.12], aim: [0, 0.62, 0.21], role: "jaw" });

  // Torso: a loft that bulges at the haunches and narrows toward the shoulders.
  b.loft(
    [
      { at: [0, 0.13, -0.02], w: 0.3, h: 0.26 },
      { at: [0, 0.24, 0], w: 0.34, h: 0.3 },
      { at: [0, 0.36, 0.02], w: 0.3, h: 0.28 },
      { at: [0, 0.46, 0.03], w: 0.27, h: 0.25 },
    ],
    { bone: [hips, spine], color: coat },
  );
  b.sweep(neck, [0.085, 0.072], { color: coat });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), CREAM, { bone: hips, at: [0, 0.1, -0.17] }); // tiny tail tuft

  // Head: a big, wide sphere, with a pale chin on the lower jaw.
  const HC: [number, number, number] = [0, 0.7, 0.1];
  const headPart = b.part(new THREE.SphereGeometry(0.125, 16, 12).scale(1.1, 0.92, 0.98), coat, {
    bone: head,
    at: HC,
  });
  const face = b.surface(headPart);
  b.capsule(jaw, [0, 0.615, 0.215], 0.036, { color: coat });

  // Ears: big puffy discs on the upper sides of the head.
  for (const s of [1, -1]) {
    const hit = face.around(HC).at(s * 70, 40);
    if (!hit) continue;
    b.lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.086, 0.025],
        [0.07, 0.06],
        [0, 0.068],
      ],
      { at: hit.moved([0, -0.03, 0]), axis: hit.axis, smoothing: 1, color: earPaint },
    );
  }

  // Eyes: dark beads with a small glint.
  for (const s of [1, -1]) {
    const hit = face.around(HC).at(s * 24, 16);
    if (!hit) continue;
    const eye = b.stick(new THREE.SphereGeometry(0.024, 10, 8), EYE, hit, { embed: 0.4 });
    const glint = b.surface(eye).around().at(s * 35, 40);
    if (glint) b.stick(new THREE.SphereGeometry(0.007, 6, 4), GLINT, glint, { embed: 0.25 });
  }

  // Nose: a big, flat, black dome on the front of the face.
  const nose = face.around(HC).at(0, 4);
  if (nose) b.stick(new THREE.SphereGeometry(0.04, 12, 8).scale(1.15, 0.7, 0.9), NOSE, nose, { embed: 0.3 });

  // Arms, hands, legs and feet, mirrored left and right.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Legs: thighs forward, shins dropping to the ground, feet flat on the floor.
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.115, 0.15, 0],
        [s * 0.15, 0.075, 0.18],
        [s * 0.13, 0.07, 0.29],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, [0.075, 0.052], { color: coat });
    const foot = leg.tip!;
    b.sweep([foot, [s * 0.13, 0.03, 0.4]], (t) => [0.055 - 0.005 * t, 0.03], { color: coat, bone: foot });
    for (const dx of [-0.03, 0, 0.03]) {
      b.spike([s * 0.13 + dx, 0.035, 0.415], [0, 0.45, 1], 0.03, 0.007, { color: CLAW, bone: foot });
    }

    // Arms: the left paw rests on the belly, the right one holds a sprig.
    const hand: [number, number, number] = s > 0 ? [0.1, 0.26, 0.19] : [-0.1, 0.36, 0.22];
    const pawEnd: [number, number, number] = s > 0 ? [0.1, 0.25, 0.235] : [-0.1, 0.35, 0.26];
    const arm = b.chain(`arm${L}`, limb([s * 0.13, 0.4, 0], hand, [0.14, 0.12], [[s, -0.6, -0.2]]), {
      parent: chest,
      names: [`shoulder${L}`, `elbow${L}`, `hand${L}`],
      role: "arm",
    });
    b.sweep(arm, [0.05, 0.038], { color: coat });
    const paw = arm.tip!;
    b.capsule(paw, pawEnd, 0.04, { color: coat });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike([pawEnd[0] + dx, pawEnd[1] - 0.005, pawEnd[2] + 0.02], [0, 0.2, 1], 0.02, 0.005, {
        color: CLAW,
        bone: paw,
      });
    }

    // The sprig rises from the right paw, with leaves spiralling round the stem.
    if (s < 0) {
      const sprig = catmull([paw, [-0.17, 0.48, 0.3], [-0.2, 0.58, 0.29], [-0.19, 0.67, 0.25]]);
      b.sweep(sprig, [0.01, 0.006], { color: STEM });
      b.along(sprig, 7, (at) => {
        const a = 0.6 + at.t * 8.5;
        const out = at.dir([Math.cos(a), 0, Math.sin(a)]); // across the stem
        const up = at.dir([0, 1, 0]); // along the stem
        const x = out.clone().multiplyScalar(0.75).addScaledVector(up, 0.66); // leaf runs out and up
        const y = out.clone().multiplyScalar(-0.66).addScaledVector(up, 0.75); // width across the leaf
        b.extrude(
          [
            [0, 0, "sharp"],
            [0.024, 0.011],
            [0.07, 0, "sharp"],
            [0.024, -0.011],
          ],
          { at, x, y, thickness: 0.002, smoothing: 2, color: at.t > 0.5 ? LEAF : LEAF_DARK },
        );
      });
    }
  }

  return b.root;
}

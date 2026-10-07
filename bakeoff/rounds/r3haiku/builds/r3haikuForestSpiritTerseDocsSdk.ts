import * as THREE from "three";
import { createBuilder, catmull, frame, limb, mottle, patches, rng, svg } from "../../../../src/index";

export const meta = {
  name: "forest spirit",
  description: "A tall antlered wood spirit: mossy bark body, leaf mantle, glowing core and eyes.",
};

const BARK = "#6e4b2c";
const BARK_DARK = "#3d2a19";
const MOSS = "#5f9c3f";
const ANTLER = "#e4d6b0";
const GLOW = "#8ff7e6";
const PUPIL = "#0d1f1c";
const LEAF_DARK = "#2f6b33";
const LEAF = "#7fd36b";
const MUSH = "#efe3c8";

const EYE_SVG = `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="20" rx="31" ry="19" fill="#8ff7e6"/>
  <ellipse cx="36" cy="20" rx="8" ry="15" fill="#0d1f1c"/>
</svg>`;

const LEAF_SVG = `<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 2 C58 26 60 66 32 94 C4 66 6 26 32 2Z" fill="#ffffff"/>
  <path d="M32 8 L32 88" stroke="#9a9a9a" stroke-width="3" fill="none"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // Paints: bark with moss patches, leaves tinted by a green paint.
  const bark = mottle(BARK, BARK_DARK, { size: 0.2, seed: 4 });
  const body = patches(bark, MOSS, { size: 0.32, seed: 2 });
  const leafPaint = mottle(LEAF_DARK, LEAF, { size: 0.06, seed: 5 });

  const eyeTex = svg(EYE_SVG, { size: 128 });
  const leafTex = svg(LEAF_SVG, { size: 256 });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.94, 0], aim: [0, 1.2, 0] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.2, 0.01],
      [0, 1.4, 0.02],
      [0, 1.56, 0.03],
    ]),
    { parent: hips, names: ["pelvis", "waist", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.56, 0.03],
      [0, 1.68, 0.05],
      [0, 1.76, 0.06],
    ]),
    { parent: chest, names: ["neckLow", "neckHigh"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 1.76, 0.06],
    aim: [0, 1.96, 0.07],
    role: "head",
  });

  // ---- Torso and neck ---------------------------------------------------------
  const torso = b.loft(
    [
      { at: spine.at(0).at, w: 0.3, h: 0.22 },
      { at: spine.at(0.35).at, w: 0.22, h: 0.17 },
      { at: spine.at(0.7).at, w: 0.34, h: 0.24 },
      { at: spine.at(1).at, w: 0.27, h: 0.2 },
    ],
    { bone: spine, color: body },
  );

  b.sweep(neck, [0.075, 0.065], { color: body });

  // ---- Head ---------------------------------------------------------------------
  const hd = (left: number, up: number, forward: number) => head.local({ left, up, forward });

  const skull = b.loft(
    [
      { at: hd(0, 0.0, 0), w: 0.13, h: 0.13 },
      { at: hd(0, 0.1, 0.005), w: 0.2, h: 0.2 },
      { at: hd(0, 0.2, 0), w: 0.25, h: 0.22 },
      { at: hd(0, 0.28, -0.01), w: 0.2, h: 0.17 },
      { at: hd(0, 0.33, -0.02), w: 0.07, h: 0.07 },
    ],
    { bone: head, color: body },
  );

  // Dark carved smile on the front of the face.
  b.sweep(
    catmull([hd(-0.05, 0.085, 0.1), hd(0, 0.07, 0.11), hd(0.05, 0.085, 0.1)]),
    0.008,
    { bone: head, color: PUPIL },
  );

  // Glowing eyes, decals seated on the curved skull.
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: hd(s * 0.05, 0.15, 0.1),
      dir: [0, 0, 1],
      size: [0.07, 0.045],
      mirror: s > 0,
      bone: head,
    });
  }

  // Branching antlers rising from the skull.
  for (const s of [1, -1]) {
    const at = (x: number, y: number, z: number) => head.local({ left: s * x, up: y, forward: z });

    b.sweep(
      catmull([at(0.08, 0.16, 0), at(0.12, 0.3, -0.01), at(0.2, 0.42, -0.05), at(0.25, 0.5, -0.09)]),
      (t: number) => 0.034 * (1 - t) + 0.01,
      { bone: head, color: ANTLER, caps: { start: "round", end: "point" } },
    );
    b.sweep(
      catmull([at(0.12, 0.3, 0), at(0.24, 0.34, 0.02), at(0.33, 0.38, 0.03)]),
      [0.018, 0.005],
      { bone: head, color: ANTLER, caps: { start: "round", end: "point" } },
    );
    b.sweep(
      catmull([at(0.2, 0.42, -0.05), at(0.29, 0.46, -0.02), at(0.34, 0.54, 0)]),
      [0.016, 0.004],
      { bone: head, color: ANTLER, caps: { start: "round", end: "point" } },
    );
  }

  // Leaf crown on top of the skull.
  const crownHits = b
    .surface(skull)
    .scatter(16, { rng: rng(21), minDist: 0.05, filter: (h) => h.n.y > 0.35 });
  b.cards(crownHits, leafTex, {
    size: [0.06, 0.1],
    lean: 35,
    bend: 15,
    vary: 0.3,
    rng: rng(22),
    color: leafPaint,
  });

  // ---- Arms and hands ----------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const armPts = limb([s * 0.2, 1.42, 0], [s * 0.62, 1.08, 0.14], [0.36, 0.34], [[0, -1, 0]]);
    const arm = b.chain(`arm${side}`, armPts, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, [0.058, 0.034], { color: body });

    const wrist = arm.joints[2];
    b.capsule([s * 0.62, 1.08, 0.14], [s * 0.74, 1.0, 0.2], 0.05, { color: BARK_DARK, bone: wrist });

    // Leaf fingers fanning off the hand.
    const fingers = [-1, 0, 1].map((k) =>
      frame(wrist.moved({ left: s * 0.08, forward: k * 0.02, up: k * 0.02 }), [s, k * 0.3, 0.3]),
    );
    b.cards(fingers, leafTex, { size: 0.12, lean: 30, bend: 10, color: leafPaint });
  }

  // ---- Legs and roots-for-feet -----------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const legPts = limb([s * 0.12, 0.98, 0], [s * 0.14, 0.07, 0.03], [0.5, 0.46], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.09, 0.05], { color: body });

    // Root-like foot resting on the floor.
    b.capsule([s * 0.14, 0.07, -0.02], [s * 0.14, 0.07, 0.1], 0.07, {
      color: BARK_DARK,
      bone: leg.joints[2],
    });
  }

  // ---- Torso details -------------------------------------------------------------------
  // Leaf mantle scattered across the upper body.
  const torsoHits = b
    .surface(torso)
    .scatter(44, { rng: rng(7), minDist: 0.075, filter: (h) => h.n.y > -0.3 });
  b.cards(torsoHits, leafTex, {
    size: [0.08, 0.13],
    lean: 55,
    bend: 25,
    vary: 0.3,
    rng: rng(9),
    color: leafPaint,
  });

  // A mushroom growing on the left shoulder.
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.03],
      [0.11, 0.05],
      [0.13, 0.09],
      [0.09, 0.115],
      [0, 0.12],
    ],
    { at: [0.14, 1.46, -0.06], bone: chest, smoothing: 1, color: MUSH },
  );

  // Glowing core in the chest, seated on the front surface.
  const coreHit = b.surface(torso).ray([0, 1.3, 1], [0, 0, -1]);
  if (coreHit) {
    b.stick(new THREE.SphereGeometry(0.045, 8, 6), GLOW, coreHit, { embed: 0.3 });
  }

  return b.root;
}

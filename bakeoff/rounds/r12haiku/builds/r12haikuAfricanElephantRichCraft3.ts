import * as THREE from "three";
import {
  bezier,
  catmull,
  cells,
  createBuilder,
  limb,
  mix,
  noise,
  paint,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";
import type { Joint, Rgb } from "../../../../src/index";

export const meta = {
  name: "African bush elephant",
  description:
    "An adult African bush elephant at rest, about 3 m at the shoulder: dusty wrinkled hide, big fan-shaped ears, a long trunk, ivory tusks and a tasselled tail.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const HIDE = "#77695c";
const HIDE_DARK = "#4f453d";
const SEAM = "#2f2823";
const OCHRE = "#a8693c";
const BELLY = "#948577";
const MUD = "#5b4733";
const NAIL = "#e4d9c2";
const IVORY_BASE = "#efe5cb";
const IVORY_SHADE = "#c4af84";
const EAR_BASE = "#8d7e74";
const EAR_INNER = "#c79c94";
const VEIN = "#5a3c38";
const JAW = "#8e7f70";
const HAIR = "#3a2e25";
const INK = "#1b1512";

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Grey-brown hide: dark plate seams, ochre dust on upward faces, paler belly, mud at the feet. */
const SKIN = paint((p, n) => {
  const grain = noise(p, 0.06, 9);
  let c: Rgb = mix(HIDE_DARK, HIDE, smoothstep(0.3, 0.7, noise(p, 0.5, 3) * 0.7 + grain * 0.3));
  const plate = cells(p, 0.16, 11);
  c = mix(c, SEAM, (1 - smoothstep(0, 0.07, plate.d2 - plate.d1)) * 0.75);
  const dust = smoothstep(0.5, 0.72, noise(p, 0.7, 31)) * smoothstep(-0.2, 0.5, n.y);
  c = mix(c, OCHRE, dust * 0.55);
  c = mix(c, BELLY, smoothstep(-0.1, -0.8, n.y) * 0.45);
  c = mix(c, MUD, smoothstep(0.5, 0.08, p.y) * (0.4 + 0.4 * grain));
  return c;
});

/** Thin ears: pinkish inside, darker outside, with a fine vein network drawn on the outline's own coordinates. */
const EAR = paint((p, n, s) => {
  const inner = smoothstep(0.3, 0.8, -Math.sign(p.x) * n.x);
  let c: Rgb = mix(EAR_BASE, EAR_INNER, inner * 0.8);
  const v = cells(new THREE.Vector3(s[0], s[1], 0), 0.1, 4);
  const vein = (1 - smoothstep(0, 0.06, v.d2 - v.d1)) * (0.4 + 0.4 * inner);
  c = mix(c, VEIN, vein);
  return c;
});

/** Tusks: ivory with faint growth rings and a yellower tip. */
const IVORY = paint((_p, _n, s) => {
  const rings = smoothstep(0.55, 0.9, Math.abs(Math.sin(s[0] * 30)));
  const tip = smoothstep(0.85, 1, s[0]);
  return mix(IVORY_BASE, IVORY_SHADE, rings * 0.35 + tip * 0.3);
});

// ---------------------------------------------------------------------------------------------------------------
// Ear outline: a fan, origin at the attachment point, u runs forward (+Z), v runs up.

const EAR_SHAPE: [number, number][] = [
  [-0.62, 0.02],
  [-0.5, 0.26],
  [-0.18, 0.34],
  [0.2, 0.3],
  [0.5, 0.12],
  [0.66, -0.2],
  [0.68, -0.58],
  [0.58, -0.92],
  [0.36, -1.14],
  [0.02, -1.24],
  [-0.3, -1.18],
  [-0.52, -0.96],
  [-0.64, -0.6],
  [-0.68, -0.25],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "african-bush-elephant" });

  // ---- Drawings -----------------------------------------------------------------------------------------------

  // A dark lidded eye with a brown iris, a tall pupil and a hard highlight.
  const EYE = svg(
    `<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="22" rx="31" ry="21" fill="#3b2f27"/>
      <ellipse cx="32" cy="23" rx="22" ry="15" fill="#6b4f36"/>
      <ellipse cx="32" cy="27" rx="20" ry="9" fill="#4a3424"/>
      <ellipse cx="33" cy="22" rx="8.5" ry="9" fill="${INK}"/>
      <circle cx="28.5" cy="17.5" r="2.6" fill="#ffffff"/>
      <path d="M4 16 Q32 2 60 16" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // Sparse bristles, drawn in greys so the part colour tints them.
  const BRISTLE = svg(
    `<svg viewBox="0 0 12 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 40 Q5 20 7 1" stroke="#333" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M3 40 Q2 24 1 12" stroke="#555" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M9 40 Q10 26 11 16" stroke="#555" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 96 },
  );

  // A tail tassel: a bundle of tapering dark strands.
  const TASSEL = svg(
    `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 64 Q4 30 9 2" stroke="#555" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M8 64 Q9 30 12 0" stroke="#2a2a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M13 64 Q13 34 14 1" stroke="#4a4a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M18 64 Q17 32 15 3" stroke="#333" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M21 64 Q19 40 17 10" stroke="#555" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );

  // ---- Skeleton -----------------------------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 2.15, -1.1], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.2, -1.7],
      [0, 2.15, -1.1],
      [0, 2.1, -0.1],
      [0, 2.1, 0.8],
      [0, 2.35, 1.25],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.35, 1.25],
      [0, 2.55, 1.5],
      [0, 2.75, 1.72],
    ]),
    { parent: spine.joints[3], names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.75, 1.72],
    aim: [0, 2.7, 2.6],
    role: "head",
  });

  const jaw = b.joint("jaw", { parent: head, at: [0, 2.22, 2.42], aim: [0, 2.05, 2.9], role: "jaw" });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.3, 2.45],
      [0, 2.05, 2.95],
      [0, 1.55, 3.2],
      [0, 1.0, 3.25],
      [0, 0.55, 3.12],
      [0, 0.36, 2.9],
    ]),
    {
      parent: head,
      names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunkTip"],
      role: "tentacle",
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.42, -1.7],
      [0, 2.0, -2.05],
      [0, 1.5, -2.2],
      [0, 1.0, -2.18],
      [0, 0.7, -2.1],
    ]),
    { parent: spine.joints[0], names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- Body, neck and head -----------------------------------------------------------------------------------

  // Rump to neck: a broad barrel with a dipped back and a deep belly, sitting on the spine and neck bones.
  b.loft(
    [
      { at: [0, 2.25, -1.78], w: 0.9, h: 1.2 },
      { at: [0, 2.2, -1.45], w: 1.5, h: 1.55 },
      { at: [0, 2.15, -1.1], w: 1.72, h: 1.72 },
      { at: [0, 2.1, -0.1], w: 1.9, h: 1.8 },
      { at: [0, 2.1, 0.8], w: 1.72, h: 1.75 },
      { at: [0, 2.35, 1.25], w: 1.15, h: 1.3 },
      { at: [0, 2.7, 1.6], w: 0.95, h: 1.0 },
    ],
    { bone: [spine, neck], color: SKIN, caps: { start: "flat", end: "round" } },
  );

  // Head: a domed skull with a broad forehead, tapering into the trunk's root.
  const skull = b.loft(
    [
      { at: [0, 2.75, 1.5], w: 0.98, h: 1.02 },
      { at: [0, 2.86, 1.92], w: 1.1, h: 1.0 },
      { at: [0, 2.8, 2.3], w: 1.12, h: 0.98 },
      { at: [0, 2.6, 2.6], w: 0.9, h: 0.9 },
      { at: [0, 2.38, 2.78], w: 0.6, h: 0.56 },
    ],
    { bone: head, color: SKIN },
  );

  // Lower jaw and chin, under the trunk root.
  b.loft(
    [
      { at: [0, 2.12, 2.45], w: 0.5, h: 0.3 },
      { at: [0, 2.04, 2.7], w: 0.42, h: 0.26 },
      { at: [0, 2.0, 2.86], w: 0.22, h: 0.16 },
    ],
    { bone: jaw, color: JAW },
  );

  // A dark mouth line where the chin meets the trunk.
  b.sweep(
    catmull([
      [-0.14, 2.12, 2.68],
      [0, 2.1, 2.8],
      [0.14, 2.12, 2.68],
    ]),
    0.012,
    { bone: jaw, color: INK },
  );

  // Eyes: small, deep-set on the sides of the skull, in front of the ears.
  for (const s of [1, -1]) {
    b.decal(skull, EYE, {
      at: [s * 0.5, 2.8, 2.3],
      dir: [s, 0, 0],
      size: [0.09, 0.062],
    });
  }

  // Sparse bristles on the crown.
  const crown = b
    .surface(skull)
    .scatter(34, { rng: rng(7), minDist: 0.07, filter: (h) => h.n.y > 0.5 });
  b.cards(crown, BRISTLE, {
    size: [0.035, 0.1],
    lean: 30,
    flow: [0, 0.3, -1],
    vary: 0.3,
    rng: rng(8),
    color: HAIR,
    sink: 0.2,
  });

  // ---- Ears -------------------------------------------------------------------------------------------------

  // Big fan-shaped ears hanging from the sides of the head, tilted outward at the bottom.
  for (const s of [1, -1]) {
    b.extrude(EAR_SHAPE, {
      at: [s * 0.5, 2.95, 1.5],
      x: [0, 0, 1],
      y: [-s * 0.27, 0.963, 0],
      thickness: [0.03, 0.08],
      bevel: 0.012,
      color: EAR,
      bone: head,
    });
  }

  // ---- Trunk ------------------------------------------------------------------------------------------------

  b.sweep(trunk, (t) => 0.24 - 0.17 * t, { color: SKIN });

  // Two fingers at the trunk tip.
  const trunkTip = trunk.tip ?? trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.036, 7, 5), SKIN, {
      bone: trunkTip,
      at: [s * 0.03, 0.34, 2.97],
    });
  }

  // ---- Tusks ------------------------------------------------------------------------------------------------

  // Long ivory tusks sweeping out from the upper jaw, then curling up at the tips.
  for (const s of [1, -1]) {
    const path = bezier(
      [s * 0.2, 2.3, 2.6],
      [s * 0.44, 2.05, 3.0],
      [s * 0.62, 1.7, 3.2],
      [s * 0.56, 1.62, 3.45],
    );
    b.sweep(path, (t) => 0.065 - 0.05 * t, {
      bone: head,
      color: IVORY,
      caps: { start: "round", end: "point" },
    });
  }

  // ---- Tail -------------------------------------------------------------------------------------------------

  b.sweep(tail, (t) => 0.11 - 0.07 * t, { color: SKIN });

  // A tassel of dark hair at the tail tip.
  const tassel = b.ring(tail.at(0.97), { count: 12, radius: 0.045, tilt: 30 });
  b.cards(tassel.items, TASSEL, {
    size: [0.05, 0.3],
    lean: 20,
    flow: [0, -1, 0],
    cross: true,
    vary: 0.2,
    rng: rng(9),
    color: HAIR,
  });

  // ---- Legs and feet ----------------------------------------------------------------------------------------

  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const kind = front ? "F" : "H";
    const root: [number, number, number] = front ? [s * 0.5, 2.2, 0.8] : [s * 0.5, 2.1, -1.1];
    const foot: [number, number, number] = front ? [s * 0.5, 0.2, 0.9] : [s * 0.5, 0.2, -0.92];
    const pts = limb(root, foot, front ? [1.08, 1.0] : [1.0, 0.95], [front ? [0, 0, -1] : [0, 0, 1]]);
    const base = front ? ["shoulder", "elbow", "foot"] : ["hip", "knee", "foot"];
    const chain = b.chain(`leg${kind}${side}`, pts, {
      parent: front ? spine.joints[3] : spine.joints[1],
      names: base.map((n) => `${n}${kind}${side}`),
      role: "leg",
    });

    // Pillar leg: broad at the top, narrowing into the foot.
    b.sweep(chain, (t) => (front ? 0.42 - 0.15 * t : 0.4 - 0.14 * t), {
      color: SKIN,
      caps: { start: "round", end: "flat" },
    });

    // A round, flat-bottomed foot on the tip joint.
    const footJoint: Joint = chain.tip ?? chain.joints[chain.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.26, 0.3, 0.2, 14), SKIN, {
      bone: footJoint,
      at: [footJoint.at.x, 0.1, footJoint.at.z],
    });

    // Toenails in an arc across the front of the foot.
    const toes = front ? 5 : 4;
    for (let i = 0; i < toes; i++) {
      const a = (i - (toes - 1) / 2) * (front ? 0.36 : 0.42);
      const nail = new THREE.SphereGeometry(0.045, 7, 5).scale(1, 1, 0.5).rotateY(a);
      b.part(nail, NAIL, {
        bone: footJoint,
        at: [footJoint.at.x + 0.285 * Math.sin(a), 0.06, footJoint.at.z + 0.285 * Math.cos(a)],
      });
    }
  };

  for (const s of [1, -1]) {
    leg(s, true);
    leg(s, false);
  }

  return b.root;
}

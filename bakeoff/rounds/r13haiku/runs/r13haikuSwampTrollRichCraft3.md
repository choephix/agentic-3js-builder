```ts
// Swamp troll: a hunched bog brute in teal, moss-mottled hide with a pale belly. It has long tusks, a bone-spiked
// olive mohawk, glowing amber eyes and war-paint, and wears a bone necklace, a belt of bone charms, a loincloth and
// a skull pendant. Blizzard-style proportions: a big head, long arms, heavy shoulders and a bold silhouette.
import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  frame,
  grain,
  limb,
  lerp,
  mix,
  mottle,
  noise,
  paint,
  rng,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import type { ColorInput, JointRef, PointInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Swamp troll",
  description:
    "A hunched swamp troll with tusks, a bone-spiked mohawk, glowing eyes and a necklace, belt and skull pendant of bone fetishes.",
};

/** An outline for extrude: plain corners and "sharp" ones. */
type Outline = ([number, number] | [number, number, "sharp"])[];

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN_LIGHT = "#6aa98c";
const SKIN_DEEP = "#24483c";
const SKIN_BELLY = "#b4cc9c";
const SKIN_SHADOW = "#2a5548";
const MOSS_GREEN = "#587a26";
const MUD = "#4a3a22";
const BONE_LIGHT = "#efe3c4";
const BONE_DARK = "#c9b48a";
const IVORY = "#f5ecd2";
const IVORY_STAIN = "#c8a862";
const OLIVE = "#5b5a25";
const OCHRE = "#c48b2c";
const HIDE = "#6e4c2c";
const HIDE_DARK = "#3f2a18";
const CORD = "#5e4526";
const CLAW = "#2a2722";
const MOUTH = "#2a0c10";
const WART = "#2c4a1f";
const WOOD = "#4a3420";
const EAR_DEEP = "#2d6250";

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Mottled teal hide: deep in the creases, lit on top, paler underneath, lichen on the upward faces, mud at the feet. */
const SKIN = paint((p, n) => {
  const blotch = noise(p, 0.16, 3) * 0.7 + noise(p, 0.035, 8) * 0.3;
  let c = mix(SKIN_DEEP, SKIN_LIGHT, smoothstep(0.3, 0.7, blotch));
  c = mix(c, SKIN_BELLY, smoothstep(0.1, -0.6, n.y) * 0.45);
  c = mix(c, MOSS_GREEN, smoothstep(0.55, 0.8, noise(p, 0.09, 21)) * smoothstep(0.3, 0.9, n.y) * 0.8);
  c = mix(c, MUD, smoothstep(0.34, 0.04, p.y) * 0.7);
  return c;
});

/** Bone with a soft mottling of age and grime. */
const BONE = mottle(BONE_LIGHT, BONE_DARK, { size: 0.05, contrast: 0.6, seed: 4 });
/** Tusks and charm teeth: ivory that yellows toward the grain. */
const IVORY_PAINT = grain(IVORY, IVORY_STAIN, { size: 0.012, axis: "y", seed: 2 });
/** Mohawk hair: olive streaks, with bone-tipped blades near the top. */
const MOHAWK_HAIR = grain(OLIVE, OCHRE, { size: 0.02, axis: "y", seed: 6 });
const MOHAWK = paint((p) => (p.y > 2.62 ? BONE_LIGHT : MOHAWK_HAIR));
/** Hide for the belt, pouch and loincloth. */
const HIDEP = mottle(HIDE, HIDE_DARK, { size: 0.06, seed: 8 });

// ---------------------------------------------------------------------------------------------------------------
// Drawings (textures)

/** A glowing amber eye with a black slit and a hard highlight. */
const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="al"><path d="M3 20 Q32 -6 61 20 Q32 46 3 20Z"/></clipPath></defs>
  <path d="M1 20 Q32 -8 63 20 Q32 48 1 20Z" fill="#100a08"/>
  <g clip-path="url(#al)">
    <rect x="0" y="0" width="64" height="40" fill="#ffc53a"/>
    <rect x="0" y="22" width="64" height="18" fill="#e27a18"/>
    <rect x="0" y="0" width="64" height="9" fill="#8a5a12"/>
    <path d="M14 14 Q22 8 30 13" stroke="#fff3c0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M32 3 Q38 20 32 37 Q26 20 32 3Z" fill="#0a0604"/>
  </g>
  <circle cx="23" cy="17" r="2.6" fill="#fffbe6"/>
</svg>`,
  { size: 256 },
);

/** Tribal war-paint chevrons in plum, ochre and red, drawn on transparent so the hide shows between them. */
const WARPAINT = svg(
  `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 44 L17 16 L27 32 L37 12 L61 42" fill="none" stroke="#2b1709" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M9 46 L21 27 L31 38" fill="none" stroke="#d6a038" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M44 36 L50 26 L56 36" fill="none" stroke="#b33a22" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="36" cy="30" r="2.4" fill="#d6a038"/>
</svg>`,
  { size: 256 },
);

/** Hanging swamp moss: strands that are wide at the root (the drawing's bottom) and thin at the tips. */
const MOSS = svg(
  `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 96 C3 70 9 50 6 28 C5 16 9 8 7 2" fill="none" stroke="#3c5a1c" stroke-width="5" stroke-linecap="round"/>
  <path d="M15 96 C13 66 19 44 16 22 C15 12 18 6 16 0" fill="none" stroke="#4f7424" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M25 96 C24 72 28 52 25 34 C24 24 26 14 25 8" fill="none" stroke="#33501a" stroke-width="5" stroke-linecap="round"/>
  <path d="M14 88 C12 66 16 50 14 36" fill="none" stroke="#9ac24a" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M4 84 C2 66 6 54 4 40" fill="none" stroke="#7aa53a" stroke-width="1.6" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

/** The loincloth: hide with a zig-zag gold border, a red sigil and a fringed hem cut away at the bottom. */
const CLOTH = svg(
  `<svg viewBox="0 0 64 70" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 0 H62 V48 Q48 56 46 70 Q41 58 36 66 Q32 56 28 70 Q24 58 19 66 Q14 56 10 70 Q5 60 2 48 Z" fill="#6e4a2a"/>
  <path d="M4 6 L10 12 L16 6 L22 12 L28 6 L34 12 L40 6 L46 12 L52 6 L58 12 L62 8" fill="none" stroke="#d6a038" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M2 30 H62" stroke="#3a2412" stroke-width="2"/>
  <path d="M6 40 L16 40 M48 40 L58 40" stroke="#d6a038" stroke-width="1.6"/>
  <circle cx="32" cy="22" r="6" fill="none" stroke="#b33a22" stroke-width="2.4"/>
  <path d="M32 16 V28 M26 22 H38" stroke="#b33a22" stroke-width="2"/>
</svg>`,
  { size: 256 },
);

/** Carved runes for the bone bracers: dark sigils cut into pale bone. */
const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 10 V54 M14 10 L40 22 L14 34 M30 40 L50 52 M42 12 L56 20 L42 30 M36 30 V54" fill="none" stroke="#4b2e12" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  { size: 128 },
);

/** A carved skull for the pendant. */
const SKULL = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 4 C15 4 8 17 8 30 C8 40 14 45 20 47 V58 H44 V47 C50 45 56 40 56 30 C56 17 49 4 32 4Z" fill="#f4ead0" stroke="#4b3418" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M16 27 Q23 19 30 27 Q23 35 16 27Z" fill="#1a120c"/>
  <path d="M48 27 Q41 19 34 27 Q41 35 48 27Z" fill="#1a120c"/>
  <path d="M32 36 L27 45 H37 Z" fill="#1a120c"/>
  <path d="M26 50 V58 M32 50 V58 M38 50 V58" stroke="#4b3418" stroke-width="2"/>
</svg>`,
  { size: 192 },
);

/** Three old claw scars: pale slashes with a dark edge. */
const SCAR = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 14 L30 50 M22 10 L42 46 M34 14 L54 50" stroke="#1d3a2e" stroke-width="5" stroke-linecap="round"/>
  <path d="M10 14 L30 50 M22 10 L42 46 M34 14 L54 50" stroke="#d8c39a" stroke-width="2.4" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------
// Shapes

/** A pointed ear: outward is +x, up is +y. */
const EAR_OUT: Outline = [
  [-0.04, -0.07],
  [0.1, -0.08],
  [0.26, -0.06],
  [0.4, 0.0, "sharp"],
  [0.26, 0.06],
  [0.12, 0.09],
  [-0.04, 0.08],
];
/** The dark inner ear, a smaller pointed lobe on the front of the ear. */
const EAR_IN: Outline = [
  [0.0, -0.035],
  [0.12, -0.04],
  [0.24, -0.02],
  [0.31, 0.0, "sharp"],
  [0.22, 0.03],
  [0.1, 0.045],
  [0.0, 0.04],
];
/** A splayed foot: forward is +x, up is +y. Heel at the back, toes at the front. */
const FOOT: Outline = [
  [-0.12, 0.0],
  [0.22, 0.0],
  [0.28, 0.06],
  [0.24, 0.13],
  [0.08, 0.15],
  [-0.1, 0.14],
];
/** One mohawk blade: a triangle that leans back to a bone-hard point. */
const fin = (h: number): Outline => [
  [-0.07, 0],
  [0.07, 0],
  [-0.05, h, "sharp"],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "swamp-troll" });

  /** A bone: a shaft with a knob at each end, all on one bone. */
  const fetishBone = (a: PointInput, c: PointInput, r: number, color: ColorInput, bone?: JointRef) => {
    const o = bone ? { bone } : {};
    b.capsule(a, c, r, color, o);
    b.part(new THREE.SphereGeometry(r * 1.7, 6, 5), color, { at: a, ...o });
    b.part(new THREE.SphereGeometry(r * 1.7, 6, 5), color, { at: c, ...o });
  };

  // ---- skeleton -------------------------------------------------------------------------------------------

  const hips = b.joint("hips", { at: [0, 1.1, 0], role: "spine", group: "body" });

  const spinePath = catmull([
    [0, 1.1, 0],
    [0, 1.4, 0.03],
    [0, 1.7, 0.07],
    [0, 1.98, 0.1],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["waist", "chest", "upper"],
    role: "spine",
    group: "body",
  });
  const upper = spine.joints[2];

  const neck = b.chain("neck", catmull([[0, 1.96, 0.1], [0, 2.12, 0.22], [0, 2.22, 0.33]]), {
    parent: upper,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "head",
  });

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.24, 0.36],
    dir: [0, -0.12, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.04 }),
    aim: head.local({ forward: 0.34, up: -0.14 }),
    role: "jaw",
    group: "head",
  });

  // Arms and legs: the limb solver places each hand and foot exactly, with the elbow back and the knee forward.
  const arms = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const A = limb([s * 0.3, 1.86, 0.06], [s * 0.62, 0.95, 0.3], [0.62, 0.56], [0, 0, -1]);
    const chain = b.chain(`arm${side}`, A, {
      parent: upper,
      names: [`upperArm${side}`, `forearm${side}`, `hand${side}`],
      role: "arm",
      group: "arms",
    });
    return { s, side, A, chain };
  });

  const legs = [1, -1].map((s) => {
    const side = s > 0 ? "L" : "R";
    const P = limb([s * 0.2, 1.1, 0], [s * 0.24, 0.12, 0.06], [0.56, 0.52], [0, 0, 1]);
    const chain = b.chain(`leg${side}`, P, {
      parent: hips,
      names: [`thigh${side}`, `shin${side}`, `ankle${side}`],
      role: "leg",
      group: "legs",
    });
    return { s, side, P, chain };
  });

  // ---- torso ----------------------------------------------------------------------------------------------

  // A barrel chest that narrows to the hips, with the chest broadest near the top.
  const torso = b.loft(
    [
      [0.0, 0.4, 0.26],
      [0.22, 0.44, 0.3],
      [0.5, 0.52, 0.4],
      [0.76, 0.6, 0.44],
      [0.95, 0.56, 0.38],
      [1.0, 0.42, 0.3],
    ].map(([t, w, h]) => ({ at: spinePath.at(t), w, h })),
    { bone: [hips, spine], color: SKIN, sides: 10 },
  );
  const torsoSurf = b.surface(torso);

  // A pot belly that hangs over the belt.
  b.part(new THREE.SphereGeometry(0.27, 12, 9), SKIN, {
    at: [0, 1.36, 0.14],
    bone: hips,
    scale: [1.02, 0.92, 0.8],
  });

  // Heavy shoulder masses, each crowned with three bone spikes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.2, 12, 9), SKIN, {
      at: [s * 0.3, 1.86, 0.06],
      bone: upper,
      scale: [0.95, 0.85, 1.0],
    });
    for (let i = 0; i < 3; i++) {
      b.spike([s * (0.26 + i * 0.04), 1.98 - i * 0.01, 0.02 + i * 0.03], [s * 0.5, 0.9, -0.2], 0.2 - i * 0.03, 0.03, {
        color: BONE,
        bone: upper,
      });
    }
  }

  // Neck: a thick column, already jointed to the chest and the head.
  b.sweep(neck, [0.15, 0.13, 0.12], { color: SKIN });

  // Dorsal bone spikes down the back, each set on the back surface and pointing up and out.
  for (const y of [1.3, 1.45, 1.6, 1.75, 1.88]) {
    const h = torsoSurf.ray([0, y, -3], [0, 0, 1]);
    if (h) b.spike(h, [0, 0.45, -1], 0.13 - (y - 1.3) * 0.02, 0.02, { color: BONE });
  }

  // Warts and knobs scattered over the hide.
  const warts = torsoSurf.scatter(34, { rng: rng(21), minDist: 0.09, filter: (h) => h.at.y > 1.15 });
  for (const h of warts) b.stick(new THREE.ConeGeometry(0.02, 0.045, 5), WART, h, { embed: 0.3 });

  // Moss hanging from the shoulders and down the back.
  const mossHits = torsoSurf.scatter(60, {
    rng: rng(11),
    minDist: 0.1,
    filter: (h) => h.at.y > 1.5 && (h.n.y > 0.25 || h.n.z < -0.45),
  });
  b.cards(
    mossHits.map((h) => frame(h, [0, 1, 0])),
    MOSS,
    { size: [0.08, 0.34], lean: 180, bend: 16, vary: 0.3, cross: true, rng: rng(12), color: "#ffffff" },
  );

  // Claw scars across the chest.
  const scarHit = torsoSurf.ray([0.14, 1.72, 3], [0, 0, -1]);
  if (scarHit) b.decal(torso, SCAR, { at: scarHit, size: [0.12, 0.12], group: "body" });

  // ---- head -----------------------------------------------------------------------------------------------

  const headLoft = b.loft(
    [
      { at: head.local({ back: 0.12 }), w: 0.24, h: 0.24 },
      { at: head.local({ up: 0.1 }), w: 0.34, h: 0.3 },
      { at: head.local({ forward: 0.05, up: 0.17 }), w: 0.36, h: 0.28 },
      { at: head.local({ forward: 0.17, up: 0.13 }), w: 0.34, h: 0.26 },
      { at: head.local({ forward: 0.24, up: 0.02 }), w: 0.3, h: 0.24 },
      { at: head.local({ forward: 0.32, up: -0.02 }), w: 0.2, h: 0.18 },
      { at: head.local({ forward: 0.36, up: -0.01 }), w: 0.12, h: 0.14 },
    ],
    { bone: head, color: SKIN, sides: 10 },
  );
  const hs = b.surface(headLoft);

  // The lower jaw, jointed so it can open.
  b.loft(
    [
      { at: head.local({ forward: 0.12, up: -0.03 }), w: 0.26, h: 0.12 },
      { at: head.local({ forward: 0.24, up: -0.09 }), w: 0.26, h: 0.11 },
      { at: head.local({ forward: 0.33, up: -0.1 }), w: 0.17, h: 0.1 },
    ],
    { bone: jaw, color: SKIN, sides: 10 },
  );

  // A broad nose.
  b.part(new THREE.SphereGeometry(0.055, 10, 8), SKIN, {
    at: head.local({ forward: 0.35, up: 0.03 }),
    bone: head,
    scale: [1.25, 0.9, 1.0],
  });

  // Heavy brow ridges.
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        head.local({ left: s * 0.2, forward: 0.12, up: 0.14 }),
        head.local({ left: s * 0.13, forward: 0.22, up: 0.19 }),
        head.local({ left: s * 0.03, forward: 0.22, up: 0.16 }),
      ),
      [0.032, 0.022],
      { bone: head, color: SKIN_SHADOW },
    );
  }

  // Big amber eyes: glowing drawings conformed to the brow.
  for (const s of [1, -1]) {
    const eye = hs.ray([s * 0.1, 2.36, 3], [0, 0, -1]);
    if (eye) {
      glow(
        b.decal(headLoft, EYE, {
          at: eye,
          size: [0.11, 0.07],
          mirror: s < 0,
          group: "head",
          name: s > 0 ? "eyeL" : "eyeR",
        }),
        1.3,
      );
    }
  }

  // War-paint on each cheek, drawn on the side of the head.
  for (const s of [1, -1]) {
    const hit = hs.ray([s * 3, 2.27, 0.5], [-s, 0, 0]);
    if (hit) b.decal(headLoft, WARPAINT, { at: hit, size: [0.16, 0.12], group: "head" });
  }

  // Ears: pointed, flat, with a dark inner lobe and a bone hoop through the lobe.
  for (const s of [1, -1]) {
    b.extrude(EAR_OUT, {
      at: head.local({ left: s * 0.12, up: 0.06 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.04,
      bevel: 0.01,
      smoothing: 1,
      color: SKIN,
      bone: head,
    });
    b.extrude(EAR_IN, {
      at: head.local({ left: s * 0.12, up: 0.06, forward: 0.024 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.01,
      smoothing: 1,
      color: EAR_DEEP,
      bone: head,
    });
    b.part(new THREE.TorusGeometry(0.028, 0.007, 6, 10), BONE, {
      at: head.local({ left: s * 0.22, up: -0.02 }),
      bone: head,
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // Tusks: long lower tusks curl up from the jaw, short upper ones hang down from the lip.
  for (const s of [1, -1]) {
    b.sweep(
      bezier(
        head.local({ left: s * 0.1, forward: 0.3, up: -0.02 }),
        head.local({ left: s * 0.12, forward: 0.36, up: 0.05 }),
        head.local({ left: s * 0.11, forward: 0.33, up: 0.16 }),
      ),
      [0.034, 0],
      { bone: jaw, color: IVORY_PAINT, caps: { start: "round", end: "point" } },
    );
    b.sweep(
      bezier(
        head.local({ left: s * 0.085, forward: 0.3, up: -0.04 }),
        head.local({ left: s * 0.1, forward: 0.36, up: -0.09 }),
        head.local({ left: s * 0.1, forward: 0.38, up: -0.14 }),
      ),
      [0.022, 0],
      { bone: head, color: IVORY_PAINT, caps: { start: "round", end: "point" } },
    );
  }

  // The dark gap where the mouth closes.
  b.sweep(
    catmull([
      head.local({ left: -0.1, forward: 0.28, up: -0.03 }),
      head.local({ forward: 0.37, up: -0.03 }),
      head.local({ left: 0.1, forward: 0.28, up: -0.03 }),
    ]),
    0.011,
    { bone: head, color: MOUTH },
  );

  // ---- mohawk ---------------------------------------------------------------------------------------------

  const crest = catmull([
    head.local({ forward: 0.2, up: 0.3 }),
    head.local({ forward: 0.0, up: 0.36 }),
    head.local({ back: 0.12, up: 0.32 }),
    head.local({ back: 0.24, up: 0.14 }),
  ]);
  b.sweep(crest, [0.05, 0.045, 0.035, 0.02], { bone: head, color: MOHAWK });

  // Blades stand up from the crest, each set on the skull with a ray from above.
  const FINS: [number, number][] = [
    [0.52, 0.16],
    [0.44, 0.21],
    [0.36, 0.25],
    [0.28, 0.26],
    [0.2, 0.22],
    [0.12, 0.17],
  ];
  for (const [z, h] of FINS) {
    const hit = hs.ray([0, 4, z], [0, -1, 0]);
    if (hit) {
      b.extrude(fin(h), {
        at: hit.moved([0, -0.012, 0]),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.026,
        bevel: 0.006,
        color: MOHAWK,
        bone: head,
      });
    }
  }

  // Bone pins stuck through the mohawk.
  fetishBone(head.local({ forward: 0.12, up: 0.3 }), head.local({ forward: 0.24, up: 0.44 }), 0.011, BONE, head);
  fetishBone(head.local({ forward: 0.02, up: 0.34 }), head.local({ back: 0.06, up: 0.5 }), 0.009, BONE, head);

  // ---- necklace and pendant -------------------------------------------------------------------------------

  // A ring of beads and teeth round the neck.
  b.ring(frame([0, 2.0, 0.13], [0, 1, 0.3]), { count: 16, radius: 0.175, group: "necklace" }, (item) => {
    if (item.i % 4 === 0) b.stick(new THREE.ConeGeometry(0.02, 0.06, 6), IVORY_PAINT, item, { embed: 0.25 });
    else b.stick(new THREE.SphereGeometry(0.02, 6, 5), item.i % 2 ? WOOD : BONE, item, { embed: 0.3 });
  });

  // The skull pendant on a cord, with the carved face drawn on it.
  b.sweep(
    catmull([
      [0, 1.98, 0.3],
      [0, 1.82, 0.36],
      [0, 1.72, 0.36],
    ]),
    0.006,
    { color: CORD, bone: spine.joints[1] },
  );
  const pendant = b.part(new THREE.SphereGeometry(0.085, 14, 10), BONE, {
    at: [0, 1.62, 0.31],
    bone: spine.joints[1],
    scale: [0.92, 1.1, 0.78],
  });
  const pendantHit = b.surface(pendant).ray([0, 1.62, 2], [0, 0, -1]);
  if (pendantHit) b.decal(pendant, SKULL, { at: pendantHit, size: [0.13, 0.13], group: "body" });

  // ---- belt, pouch and loincloth --------------------------------------------------------------------------

  const belt = torsoSurf.loop([0, 1.2, 0], { lift: 0.022 });
  b.sweep(belt, 0.026, { color: HIDEP });

  // Charms hang from the belt: bones, teeth and carved skulls-on-cord, all round it.
  let charm = 0;
  b.along(belt, 8, (at) => {
    const n = charm++;
    const drop = at.local({ down: 0.1 + (n % 2) * 0.05 });
    const end = at.local({ down: 0.2 + (n % 2) * 0.05 });
    b.rod(at, drop, 0.004, CORD, { bone: hips });
    if (n % 3 === 0) fetishBone(drop, end, 0.011, BONE, hips);
    else if (n % 3 === 1) b.spike(drop, [0, -1, 0.15], 0.1, 0.017, { color: IVORY_PAINT, bone: hips });
    else b.part(new THREE.SphereGeometry(0.026, 7, 5), WOOD, { at: end, bone: hips, scale: [1, 1.2, 1] });
  });

  // A hide pouch on the hip.
  b.part(new THREE.BoxGeometry(0.13, 0.11, 0.08), HIDEP, { at: [0.22, 1.08, 0.2], bone: hips });
  fetishBone([0.22, 1.12, 0.25], [0.22, 1.17, 0.28], 0.008, BONE, hips);

  // A fringed loincloth, drawn on a plane so its hem is cut away.
  b.part(new THREE.PlaneGeometry(0.46, 0.5), "#ffffff", {
    texture: CLOTH,
    at: [0, 0.95, 0.22],
    dir: [0, 0, 1],
    axis: "z",
    bone: hips,
  });

  // ---- arms -----------------------------------------------------------------------------------------------

  for (const arm of arms) {
    const { s, A } = arm;
    const tube = b.sweep(arm.chain, [0.13, 0.115, 0.135, 0.09], { color: SKIN });
    const hand = arm.chain.tip!;

    // A big fist, four knuckle-walking fingers with claws, and a thumb.
    b.part(new THREE.SphereGeometry(0.12, 10, 8), SKIN, {
      at: hand.local({ down: 0.06, forward: 0.02 }),
      bone: hand,
      scale: [1.1, 0.95, 1.15],
    });
    for (let i = 0; i < 4; i++) {
      const x = -0.06 + i * 0.04;
      const base = hand.local({ left: x, down: 0.05, forward: 0.06 });
      const mid = hand.local({ left: x * 1.05, down: 0.12, forward: 0.12 });
      const tip = hand.local({ left: x * 1.05, down: 0.14, forward: 0.2 });
      b.part(new THREE.SphereGeometry(0.03, 7, 5), SKIN, { at: base, bone: hand });
      b.sweep(bezier(base, mid, tip), [0.028, 0.02], { bone: hand, color: SKIN });
      b.spike(tip, [0, -0.5, 1], 0.06, 0.014, { color: CLAW, bone: hand });
    }
    const thumbA = hand.local({ left: -s * 0.09, down: 0.04, forward: 0.06 });
    const thumbB = hand.local({ left: -s * 0.14, down: 0.08, forward: 0.14 });
    b.capsule(thumbA, thumbB, 0.03, SKIN, { bone: hand });
    b.spike(thumbB, [-s * 0.3, -0.2, 1], 0.05, 0.013, { color: CLAW, bone: hand });

    // A bone bracer with runes cut into it, wrapped round the forearm near the wrist.
    const armSurf = b.surface(tube);
    const cuff = armSurf.loop(lerp(A[1], A[2], 0.8), { dir: A[2].clone().sub(A[1]), lift: 0.02 });
    b.sweep(cuff, 0.02, { color: BONE });
    for (const f of [0.6, 0.78]) {
      b.decal(tube, RUNE, {
        at: armSurf.nearest(lerp(A[1], A[2], f).add(new THREE.Vector3(0, 0, 0.1))),
        size: [0.05, 0.05],
      });
    }

    // Tribal war-paint on the upper arm.
    const paintHit = armSurf.nearest(lerp(A[0], A[1], 0.5).add(new THREE.Vector3(0, 0, 0.12)));
    b.decal(tube, WARPAINT, { at: paintHit, size: [0.12, 0.09], group: "arms" });
  }

  // ---- legs -----------------------------------------------------------------------------------------------

  for (const leg of legs) {
    const { P } = leg;
    const tube = b.sweep(leg.chain, [0.16, 0.11, 0.13, 0.085], { color: SKIN });
    const ankle = leg.chain.tip!;

    // A splayed foot with three claws at the toes.
    b.extrude(FOOT, {
      at: ankle.local({ down: 0.12 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.15,
      bevel: 0.018,
      smoothing: 1,
      color: SKIN,
      bone: ankle,
    });
    for (const x of [-0.07, 0, 0.07]) {
      const toe = ankle.local({ left: x, forward: 0.26, down: 0.05 });
      b.spike(toe, [0, -0.3, 1], 0.07, 0.014, { color: CLAW, bone: ankle });
    }

    // Rope wraps round the shin, with a knot where they start.
    const legSurf = b.surface(tube);
    for (const f of [0.3, 0.62]) {
      const wrap = legSurf.loop(lerp(P[1], P[2], f), { dir: P[2].clone().sub(P[1]), lift: 0.016 });
      b.sweep(wrap, 0.013, { color: CORD });
    }
    b.part(new THREE.SphereGeometry(0.03, 7, 5), CORD, {
      at: lerp(P[1], P[2], 0.3).add(new THREE.Vector3(0, 0, 0.1)),
      bone: leg.chain.joints[1],
    });
  }

  // ---- mouth and tusks finished -----------------------------------------------------------------------------

  // Four small teeth along the top of the lower jaw.
  for (const x of [-0.06, -0.02, 0.02, 0.06]) {
    b.spike(jaw.local({ left: x, forward: 0.2, up: 0.0 }), [0, 1, 0.2], 0.03, 0.01, {
      color: IVORY_PAINT,
      bone: jaw,
    });
  }

  return b.root;
}
```
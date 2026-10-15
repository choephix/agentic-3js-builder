// Cyborg support medic with a healing staff: Overwatch-style polished sci-fi hero.
// Colour blocking: warm white armour + deep navy undersuit + gunmetal cyber parts, one strong accent (healing green).
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { lerp, offset } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, grain, mottle, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic: white-and-navy armour, exposed gunmetal left arm and shin, a glowing healing core, a backpack emitter and a staff with a green healing orb.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type Vec = THREE.Vector3;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const rot = (v: Vec, axis: Vec, deg: number) => v.clone().applyAxisAngle(axis.clone().normalize(), rad(deg));
/** Swing direction `d` toward `target` by `deg` degrees. */
const toward = (d: Vec, target: Vec, deg: number) => rot(d, d.clone().cross(target), deg);
const perp = (axis: Vec): [Vec, Vec] => {
  const a = axis.clone().normalize();
  const ref = Math.abs(a.z) < 0.9 ? V(0, 0, 1) : V(1, 0, 0);
  const u = a.clone().cross(ref).normalize();
  const w = a.clone().cross(u).normalize();
  return [u, w];
};
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const sph = (r: number, w = 10, h = 7) => new THREE.SphereGeometry(r, w, h);
const cyl = (r0: number, r1: number, h: number, seg = 8) => new THREE.CylinderGeometry(r0, r1, h, seg);

// ------------------------------------------------------------------------------------------------ palette
const ACCENT = "#1fd18a"; // painted trim
const GLOW = "#62ffc2"; // self-lit healing light
const SOLE = "#1f252d";
const LIP = "#a9524f";

const ARMOR = countershade(
  mottle("#f6f8f9", "#e7ecef", { size: 0.14, contrast: 0.6, seed: 3 }),
  mottle("#c2ccd6", "#b0bdc9", { size: 0.1, contrast: 0.6, seed: 4 }),
  { level: -0.12, soft: 0.7 },
);
const NAVY = countershade(mottle("#33496b", "#2b3f5d", { size: 0.12, contrast: 0.7, seed: 5 }), "#1a2640", {
  level: -0.15,
  soft: 0.65,
});
const NAVY_DK = countershade("#232f46", "#141c2e", { level: -0.1, soft: 0.6 });
const GUN = countershade(grain("#6d7683", "#5a6370", { size: 0.01, axis: "y", seed: 2 }), "#363d48", {
  level: -0.1,
  soft: 0.6,
});
const STEEL = countershade(grain("#b9c3ce", "#939eab", { size: 0.008, axis: "y", seed: 7 }), "#5b6571", {
  level: -0.1,
  soft: 0.6,
});
const SKIN = countershade(mottle("#c98c62", "#c28359", { size: 0.06, contrast: 0.7, seed: 8 }), "#a06745", {
  level: -0.1,
  soft: 0.7,
});
const HAIR = countershade(grain("#2d2c40", "#43425e", { size: 0.01, axis: "y", seed: 6 }), "#15141f", {
  level: 0,
  soft: 0.6,
});
const GRIP = stripes(NAVY_DK, "#38455f", { size: 0.011, axis: "y", width: 0.5, wobble: 0.1, seed: 4 });
const BOOT = countershade(mottle("#2f3a52", "#283249", { size: 0.1, seed: 12 }), "#171e30", { level: -0.1, soft: 0.6 });

// ------------------------------------------------------------------------------------------------ drawings
const px = (u: number) => u.toFixed(1);
// Chest plate panel lines; 1 unit = 1 mm, origin top-left of the plate's outline box (0.37 x 0.27 m).
const CHEST_LINES = svg(
  `<svg viewBox="0 0 370 270">
    <g fill="none" stroke="#7d8b99" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M185 130 V262"/><path d="M185 150 L110 122 L38 134"/><path d="M185 150 L260 122 L332 134"/>
      <path d="M110 214 L185 186 L260 214"/><path d="M62 74 L108 100"/><path d="M308 74 L262 100"/>
    </g>
    <g fill="none" stroke="${ACCENT}" stroke-width="6" stroke-linecap="round">
      <path d="M68 96 L132 112"/><path d="M302 96 L238 112"/><path d="M84 168 L124 184"/><path d="M286 168 L246 184"/>
    </g>
    <g fill="#a9b6c2" stroke="#5a6672" stroke-width="1.6">
      <circle cx="58" cy="62" r="4.5"/><circle cx="312" cy="62" r="4.5"/><circle cx="34" cy="146" r="4.5"/>
      <circle cx="336" cy="146" r="4.5"/><circle cx="98" cy="218" r="4.5"/><circle cx="272" cy="218" r="4.5"/>
      <circle cx="185" cy="250" r="4.5"/>
    </g>
    <text x="108" y="246" font-family="sans-serif" font-weight="bold" font-size="17" fill="#6b7886">AID-07</text>
    <g stroke="#6b7886" stroke-width="3"><path d="M236 234 l10 -12 M250 234 l10 -12 M264 234 l10 -12"/></g>
  </svg>`,
  { size: 740 },
);
const PLUS = svg(
  `<svg viewBox="0 0 32 32">
    <rect x="3" y="3" width="26" height="26" rx="6" fill="#f1f5f7" stroke="${ACCENT}" stroke-width="2"/>
    <rect x="13" y="7" width="6" height="18" rx="1.5" fill="${ACCENT}"/>
    <rect x="7" y="13" width="18" height="6" rx="1.5" fill="${ACCENT}"/>
  </svg>`,
  { size: 128 },
);
const VENTS = svg(
  `<svg viewBox="0 0 64 64">
    <rect x="2" y="2" width="60" height="60" rx="5" fill="#3a424d" stroke="#232932" stroke-width="2"/>
    ${[10, 19, 28, 37, 46, 55].map((y) => `<rect x="9" y="${y - 3}" width="46" height="5" rx="2" fill="#12161c"/>`).join("")}
  </svg>`,
  { size: 128 },
);
const HEXPLATE = svg(
  `<svg viewBox="0 0 64 96">
    <rect width="64" height="96" fill="#58616e"/>
    ${Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => {
        const cx = 8 + c * 16 + (r % 2) * 8;
        const cy = 8 + r * 15;
        return `<path d="M${px(cx)} ${px(cy - 8)} l7 4 v8 l-7 4 l-7 -4 v-8 z" fill="#646e7b" stroke="#2f363f" stroke-width="1.6"/>`;
      }).join(""),
    ).join("")}
    <path d="M4 90 H60" stroke="${GLOW}" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);
const FOREARM_PANEL = svg(
  `<svg viewBox="0 0 48 128">
    <rect x="3" y="3" width="42" height="122" rx="6" fill="#4a535f" stroke="#262d36" stroke-width="2"/>
    <path d="M24 12 V116" stroke="#2b323b" stroke-width="2"/>
    <path d="M9 30 H39 M9 64 H39 M9 98 H39" stroke="#2b323b" stroke-width="2"/>
    <rect x="12" y="38" width="24" height="5" rx="2" fill="${GLOW}"/>
    <rect x="12" y="72" width="24" height="5" rx="2" fill="${GLOW}"/>
    <circle cx="9" cy="10" r="2.2" fill="#8e99a6"/><circle cx="39" cy="10" r="2.2" fill="#8e99a6"/>
    <circle cx="9" cy="118" r="2.2" fill="#8e99a6"/><circle cx="39" cy="118" r="2.2" fill="#8e99a6"/>
  </svg>`,
  { size: 192 },
);
const GAUGE = svg(
  `<svg viewBox="0 0 16 128">
    <rect x="6" y="0" width="4" height="128" fill="#2a323c"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${i % 4 === 0 ? 1 : 3}" y="${4 + i * 7.6}" width="${i % 4 === 0 ? 14 : 10}" height="2.2" fill="#8c98a6"/>`).join("")}
    <rect x="6" y="40" width="4" height="60" fill="${ACCENT}"/>
  </svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 64 32">
    <rect x="1" y="1" width="62" height="30" rx="4" fill="#f1f5f7" stroke="#8a97a4" stroke-width="1.6"/>
    <rect x="3" y="3" width="10" height="26" rx="2" fill="${ACCENT}"/>
    <text x="17" y="23" font-family="sans-serif" font-weight="bold" font-size="18" fill="#2b3f5d">M-07</text>
  </svg>`,
  { size: 256 },
);
const EYE_R = svg(
  `<svg viewBox="0 0 60 34">
    <defs><clipPath id="a"><path d="M2 21 Q16 5 31 5 Q47 6 58 20 Q46 31 30 30 Q14 30 2 21 Z"/></clipPath></defs>
    <path d="M2 21 Q16 5 31 5 Q47 6 58 20 Q46 31 30 30 Q14 30 2 21 Z" fill="#f4eee9"/>
    <g clip-path="url(#a)">
      <circle cx="32" cy="18" r="12" fill="#6a3f27"/>
      <circle cx="32" cy="22" r="9" fill="#8d5a36"/>
      <circle cx="32" cy="18" r="5.5" fill="#1b0f0d"/>
      <path d="M0 0 H60 V9 Q30 4 0 9 Z" fill="#00000030"/>
    </g>
    <circle cx="27" cy="13" r="2.6" fill="#fff"/><circle cx="36" cy="22" r="1.3" fill="#fff"/>
    <path d="M1 22 Q14 3 31 3 Q48 4 59 20" stroke="#24150f" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M1 22 Q-1 18 0 14" stroke="#24150f" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M7 13 Q30 -2 54 11" stroke="#8a5a3f" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M6 24 Q30 33 56 22" stroke="#8a5a3f" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </svg>`,
  { size: 512 },
);
const EYE_CYBER = svg(
  `<svg viewBox="0 0 60 34">
    <path d="M2 21 Q16 5 31 5 Q47 6 58 20 Q46 31 30 30 Q14 30 2 21 Z" fill="#0f141a"/>
    <circle cx="32" cy="18" r="11.5" fill="none" stroke="${GLOW}" stroke-width="2.6"/>
    <circle cx="32" cy="18" r="7" fill="#1b4d3d"/>
    <circle cx="32" cy="18" r="4" fill="${GLOW}"/>
    <path d="M32 3 V9 M32 27 V31 M14 18 H19 M45 18 H50" stroke="${GLOW}" stroke-width="2"/>
    <circle cx="28" cy="14" r="1.8" fill="#fff"/>
  </svg>`,
  { size: 512 },
);
const CYBER_PLATE = svg(
  `<svg viewBox="0 0 80 100">
    <path d="M10 8 L58 2 L76 20 L74 52 L58 66 L40 94 L26 82 L6 60 L2 30 Z" fill="#e8edf0" stroke="#7d8b99" stroke-width="2"/>
    <path d="M22 30 Q40 16 60 28 L66 46 Q46 62 22 54 Z" fill="#222a34" stroke="#0f141a" stroke-width="1.5"/>
    <path d="M10 8 L22 30 M58 2 L60 28 M74 52 L66 46 M40 94 L46 60" stroke="#7d8b99" stroke-width="1.6" fill="none"/>
    <path d="M8 62 L28 74 L40 90" stroke="${ACCENT}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="12" r="2.6" fill="#a2afbb"/><circle cx="14" cy="50" r="2.4" fill="#a2afbb"/>
  </svg>`,
  { size: 320 },
);
const BROW = svg(
  `<svg viewBox="0 0 60 16"><path d="M1 12 Q16 2 34 3 Q50 4 59 9 Q40 6 26 8 Q12 10 1 12 Z" fill="#251912"/></svg>`,
  { size: 256 },
);
const NOSE_MOUTH = svg(
  `<svg viewBox="0 0 60 80">
    <path d="M30 6 Q27 22 25 34 Q22 40 25 43 Q30 46 35 43 Q38 40 35 34 Q33 22 30 6" fill="none" stroke="#a46a48" stroke-width="1.6" stroke-linecap="round" opacity="0.7"/>
    <path d="M23 42 Q25 46 28 45 M37 42 Q35 46 32 45" stroke="#6a3b2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M30 47 V56" stroke="#a46a48" stroke-width="1.6" opacity="0.6"/>
    <path d="M14 63 Q22 55 30 58 Q38 55 46 63 Q30 67 14 63 Z" fill="${LIP}"/>
    <path d="M15 63 Q30 74 45 63 Q30 69 15 63 Z" fill="#bd665f"/>
    <path d="M14 63 Q30 68 46 63" stroke="#4d2320" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M30 76 q3 0 4 2" stroke="#a46a48" stroke-width="1.4" fill="none" opacity="0.6"/>
  </svg>`,
  { size: 384 },
);

export default function build() {
  const b = createBuilder({ name: "cyborgMedic" });

  // ============================================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.93, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.95, 0],
      [0, 1.1, 0],
      [0, 1.27, 0.012],
      [0, 1.45, 0.005],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.45, 0.005],
      [0, 1.54, 0.02],
      [0, 1.61, 0.045],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.61, 0.045], dir: [0, 1, 0.12], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.625, 0.0], aim: [0, 1.6, 0.08], role: "jaw" });

  // ============================================================================================ torso
  const torso = b.loft(
    [
      { at: [0, 0.9, 0], w: 0.27, h: 0.19 },
      { at: [0, 0.98, 0], w: 0.31, h: 0.2 },
      { at: [0, 1.1, 0], w: 0.27, h: 0.185 },
      { at: [0, 1.26, 0.012], w: 0.31, h: 0.205 },
      { at: [0, 1.38, 0.015], w: 0.36, h: 0.22 },
      { at: [0, 1.46, 0.005], w: 0.3, h: 0.17 },
    ],
    { bone: [hips, spine], color: NAVY, sides: 10, name: "torso" },
  );

  // chest breastplate, bevelled, with panel-line drawing and a glowing core
  const chestOutline: OutlinePoint[] = [
    [0, 0.06, "sharp"],
    [-0.075, 0.115, "sharp"],
    [-0.17, 0.085],
    [-0.185, 0],
    [-0.15, -0.08],
    [-0.085, -0.135],
    [0, -0.155, "sharp"],
    [0.085, -0.135],
    [0.15, -0.08],
    [0.185, 0],
    [0.17, 0.085],
    [0.075, 0.115, "sharp"],
  ];
  b.extrude(chestOutline, {
    at: [0, 1.33, 0.095],
    x: [1, 0, 0],
    thickness: 0.07,
    bevel: 0.012,
    smoothing: 1,
    color: ARMOR,
    bone: chest,
    name: "breastplate",
  });
  b.part(new THREE.PlaneGeometry(0.37, 0.27), "#ffffff", {
    at: [0, 1.31, 0.1318],
    dir: [0, 0, 1],
    axis: "z",
    texture: CHEST_LINES,
    bone: chest,
    name: "chestLines",
  });
  // core housing
  b.lathe(
    [
      [0, 0],
      [0.052, 0],
      [0.058, 0.008],
      [0.058, 0.02],
      [0.046, 0.026],
      [0, 0.026],
    ],
    { at: [0, 1.358, 0.13], axis: [0, 0.05, 1], segments: 6, color: GUN, bone: chest, name: "coreHousing" },
  );
  glow(
    b.part(cyl(0.036, 0.036, 0.012, 6), GLOW, {
      at: [0, 1.358, 0.158],
      dir: [0, 0.05, 1],
      bone: chest,
      name: "coreGlow",
    }),
    1.6,
  );
  b.part(cyl(0.015, 0.015, 0.006, 6), "#ffffff", { at: [0, 1.358, 0.166], dir: [0, 0.05, 1], bone: chest, name: "coreHot" });
  // abdomen plates and obliques
  for (let i = 0; i < 3; i++) {
    const y = 1.2 - i * 0.05;
    const w = 0.15 - i * 0.012;
    b.part(box(w, 0.036, 0.04), ARMOR, { at: [0, y, 0.105 - i * 0.003], bone: spine.joints[1], name: "abPlate" });
    b.part(box(w * 0.55, 0.008, 0.012), ACCENT, { at: [0, y - 0.016, 0.127 - i * 0.003], bone: spine.joints[1], name: "abTrim" });
  }
  for (const s of [1, -1]) {
    // side ribs: gunmetal flexible bands where the suit shows
    for (let i = 0; i < 4; i++)
      b.part(box(0.04, 0.012, 0.14), GUN, {
        at: [s * 0.137, 1.15 + i * 0.026, 0.005],
        bone: spine.joints[1],
        rotation: [0, 0, s * -6],
        name: "rib",
      });
    // lat vents
    b.part(new THREE.PlaneGeometry(0.06, 0.06), "#ffffff", {
      at: [s * 0.1405, 1.33, -0.02],
      dir: [s, 0, 0],
      axis: "z",
      texture: VENTS,
      bone: chest,
      name: "sideVent",
    });
  }

  // back plate and pack mount
  b.extrude(chestOutline, {
    at: [0, 1.33, -0.09],
    x: [-1, 0, 0],
    thickness: 0.05,
    bevel: 0.01,
    smoothing: 1,
    color: ARMOR,
    bone: chest,
    name: "backplate",
  });

  // ---- belt: follows the built torso
  const skin = b.surface(torso);
  const beltPath = skin.loop([0, 1.03, 0], { lift: 0.008 });
  b.sweep(beltPath, (_t) => [0.026, 0.014], { color: GUN, section: "box", bone: spine.joints[0], name: "belt" });
  b.along(skin.loop([0, 1.03, 0], { lift: 0.022 }), 12, (at) =>
    b.part(box(0.016, 0.02, 0.01), STEEL, { at, bone: spine.joints[0], name: "beltStud" }),
  );
  b.part(box(0.07, 0.056, 0.02), STEEL, { at: [0, 1.03, 0.108], bone: spine.joints[0], name: "buckle" });
  b.part(box(0.046, 0.034, 0.012), ARMOR, { at: [0, 1.03, 0.12], bone: spine.joints[0], name: "buckleFace" });
  glow(b.part(box(0.024, 0.008, 0.006), GLOW, { at: [0, 1.03, 0.127], bone: spine.joints[0], name: "buckleLight" }), 1.2);

  // ---- pelvis: front tasset, side plates, pouches, vial rack
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.095, 1.0, 0.098], [s * 0.115, 0.79, 0.092], [0.125, 0.034], [0.1, 0.03], {
      color: ARMOR,
      bone: hips,
      name: "tasset",
    });
    b.part(box(0.1, 0.008, 0.01), ACCENT, { at: [s * 0.1, 0.9, 0.116], bone: hips, name: "tassetTrim" });
    b.extrude(
      [
        [-0.05, 0.06],
        [0.05, 0.06],
        [0.075, 0],
        [0.05, -0.08],
        [-0.05, -0.08],
        [-0.075, 0],
      ],
      {
        at: [s * 0.152, 0.96, 0.0],
        x: [0, 0, 1],
        thickness: 0.026,
        bevel: 0.007,
        color: ARMOR,
        bone: hips,
        name: "hipPlate",
      },
    );
    b.part(box(0.01, 0.1, 0.06), ACCENT, { at: [s * 0.168, 0.96, 0.0], bone: hips, name: "hipStripe" });
  }
  // right hip: two medkit pouches
  b.part(box(0.07, 0.1, 0.1), GUN, { at: [-0.19, 0.95, 0.045], bone: hips, name: "pouch" });
  b.part(box(0.076, 0.03, 0.106), ARMOR, { at: [-0.19, 0.985, 0.045], bone: hips, name: "pouchLid" });
  b.part(new THREE.PlaneGeometry(0.044, 0.044), "#ffffff", {
    at: [-0.2265, 0.945, 0.045],
    dir: [-1, 0, 0],
    axis: "z",
    texture: PLUS,
    bone: hips,
    name: "pouchPlus",
  });
  b.part(box(0.05, 0.075, 0.07), GUN, { at: [-0.19, 0.95, -0.065], bone: hips, name: "pouchBack" });
  b.part(box(0.056, 0.025, 0.076), ARMOR, { at: [-0.19, 0.98, -0.065], bone: hips, name: "pouchBackLid" });
  // left hip: vial rack
  b.part(box(0.05, 0.1, 0.11), GUN, { at: [0.19, 0.95, 0.04], bone: hips, name: "vialRack" });
  for (let i = 0; i < 3; i++) {
    glow(
      b.capsule([0.19, 0.915, 0.012 + i * 0.03], [0.19, 0.99, 0.012 + i * 0.03], 0.0105, GLOW, {
        bone: hips,
        sides: 6,
        name: "vial",
      }),
      1.1,
    );
    b.part(cyl(0.013, 0.013, 0.012, 6), STEEL, { at: [0.19, 1.003, 0.012 + i * 0.03], bone: hips, name: "vialCap" });
  }
  b.part(new THREE.PlaneGeometry(0.1, 0.05), "#ffffff", {
    at: [0.2155, 0.93, 0.04],
    dir: [1, 0, 0],
    axis: "z",
    texture: LABEL,
    bone: hips,
    name: "hipLabel",
  });

  // ---- collar and neck
  b.lathe(
    [
      [0.052, 0],
      [0.074, 0],
      [0.082, 0.016],
      [0.07, 0.05],
      [0.058, 0.064],
      [0.05, 0.06],
      [0.052, 0.022],
    ],
    { at: [0, 1.445, 0.0], axis: [0, 1, 0.12], color: NAVY_DK, bone: chest, segments: 10, name: "collar" },
  );
  b.lathe(
    [
      [0.075, 0],
      [0.087, 0.004],
      [0.087, 0.016],
      [0.075, 0.02],
    ],
    { at: [0, 1.47, 0.0], axis: [0, 1, 0.12], color: ACCENT, bone: chest, segments: 10, name: "collarTrim" },
  );
  b.sweep(
    catmull([
      [0, 1.45, 0.005],
      [0, 1.54, 0.02],
      [0, 1.62, 0.046],
    ]),
    [0.043, 0.04, 0.038],
    { bone: neck, color: SKIN, sides: 8, name: "neckTube" },
  );
  // exposed cyber cable on the left of the neck
  b.sweep(
    catmull([
      [0.05, 1.47, 0.0],
      [0.052, 1.54, 0.01],
      [0.058, 1.6, 0.0],
    ]),
    0.0065,
    { bone: neck.joints[0], color: GUN, sides: 5, name: "neckCable" },
  );
  glow(
    b.sweep(
      catmull([
        [0.052, 1.49, 0.012],
        [0.054, 1.54, 0.02],
        [0.058, 1.58, 0.012],
      ]),
      0.0035,
      { bone: neck.joints[0], color: GLOW, sides: 4, name: "neckGlow" },
    ),
    1.2,
  );

  // ============================================================================================ head
  const SK = V(0, 1.675, 0.02);
  const skull = b.part(sph(1, 16, 12), SKIN, {
    at: SK,
    bone: head,
    scale: [0.073, 0.09, 0.085],
    name: "skull",
  });
  const jawMesh = b.part(sph(1, 12, 8), SKIN, {
    at: [0, 1.606, 0.04],
    bone: jaw,
    scale: [0.058, 0.036, 0.066],
    name: "jawMesh",
  });
  const face = b.surface([skull, jawMesh]);
  // eyes
  b.decal(face, EYE_R, { at: [-0.031, 1.692, 0.1], dir: [0, 0, 1], size: [0.04, 0.0227], name: "eyeR" });
  glow(
    b.decal(face, EYE_CYBER, {
      at: [0.031, 1.692, 0.1],
      dir: [0, 0, 1],
      size: [0.04, 0.0227],
      lift: 0.003,
      name: "eyeCyber",
    }),
    1.5,
  );
  for (const s of [1, -1])
    b.decal(face, BROW, {
      at: [s * 0.032, 1.716, 0.095],
      dir: [0, 0, 1],
      size: [0.04, 0.0107],
      mirror: s < 0,
      name: "brow",
    });
  b.decal(face, NOSE_MOUTH, { at: [0, 1.65, 0.1], dir: [0, 0, 1], size: [0.05, 0.0667], name: "noseMouth" });
  // cyber cheek plate on the left half of the face
  b.decal(face, CYBER_PLATE, {
    at: [0.047, 1.672, 0.092],
    dir: [0.55, 0, 1],
    size: [0.062, 0.078],
    lift: 0.0045,
    mirror: false,
    name: "cyberPlate",
  });
  // ears: skin on the right, cyber ear-piece on the left
  b.part(sph(1, 8, 6), SKIN, { at: [-0.072, 1.668, 0.01], bone: head, scale: [0.01, 0.024, 0.018], name: "earR" });
  b.part(cyl(0.03, 0.03, 0.016, 10), GUN, { at: [0.074, 1.668, 0.012], dir: [1, 0, 0], bone: head, name: "earPiece" });
  b.part(cyl(0.02, 0.02, 0.008, 10), ARMOR, { at: [0.083, 1.668, 0.012], dir: [1, 0, 0], bone: head, name: "earCap" });
  glow(b.part(cyl(0.011, 0.011, 0.004, 8), GLOW, { at: [0.0885, 1.668, 0.012], dir: [1, 0, 0], bone: head, name: "earLight" }), 1.4);
  b.rod([0.078, 1.69, 0.0], [0.07, 1.77, -0.03], 0.0035, STEEL, { bone: head, sides: 5, name: "antenna" });
  glow(b.part(sph(0.007, 6, 4), GLOW, { at: [0.07, 1.775, -0.03], bone: head, name: "antennaTip" }), 1.5);

  // hair: cap tilted back, bangs, undercut ponytail
  b.part(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, 1.62), HAIR, {
    at: [0, 1.677, 0.014],
    bone: head,
    scale: [0.079, 0.097, 0.093],
    rotation: [-31, 0, 0],
    name: "hairCap",
  });
  const scalp = b.surface(skull);
  const lockDirs = [-52, -34, -16, 2, 20, 38, 54];
  for (const az of lockDirs) {
    const dir = az < 0 ? 1 : -1;
    const h0 = scalp.around(SK).at(az, 50)!;
    const h1 = scalp.around(SK).at(az + dir * 8, 38)!;
    const h2 = scalp.around(SK).at(az + dir * 18, 26)!;
    b.sweep(catmull([offset(h0, h0, 0.014), offset(h1, h1, 0.02), offset(h2, h2, 0.012)]), [0.017, 0.0], {
      bone: head,
      color: HAIR,
      sides: 5,
      caps: { start: "round", end: "point" },
      name: "bang",
    });
  }
  const pony = b.chain(
    "pony",
    catmull([
      [0, 1.765, -0.075],
      [0, 1.81, -0.15],
      [0, 1.78, -0.225],
      [0, 1.68, -0.27],
      [0, 1.57, -0.275],
    ]),
    { parent: head, names: ["pony1", "pony2", "pony3", "pony4"], role: "tail" },
  );
  b.sweep(pony, [0.026, 0.05, 0.054, 0.04, 0.022, 0.003], { color: HAIR, sides: 8, name: "ponytail" });
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.018, 1.772, -0.085],
        [s * 0.05, 1.8, -0.15],
        [s * 0.052, 1.75, -0.23],
        [s * 0.03, 1.65, -0.27],
        [s * 0.012, 1.55, -0.272],
      ]),
      [0.016, 0.03, 0.03, 0.02, 0.003],
      { bone: pony.joints, color: HAIR, sides: 6, name: "ponyStrand" },
    );
  b.lathe(
    [
      [0.03, 0],
      [0.044, 0.004],
      [0.044, 0.026],
      [0.03, 0.03],
    ],
    {
      at: [0, 1.757, -0.083],
      axis: [0, 0.55, -0.85],
      color: ACCENT,
      bone: head,
      segments: 8,
      name: "hairTie",
    },
  );
  // undercut shave patch is suggested by a plain skin sphere behind the left ear
  b.part(sph(1, 8, 6), NAVY_DK, { at: [0.05, 1.745, -0.06], bone: head, scale: [0.012, 0.012, 0.012], name: "hairPin" });

  // ============================================================================================ arms
  const staffX = -0.5;
  const staffZ = 0.17;
  const armData: Record<string, { sh: Vec; E: Vec; W: Vec; H: Vec; D: Vec; chain: ReturnType<typeof b.chain> }> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = V(s * 0.205, 1.42, 0);
    const W = s > 0 ? V(0.42, 0.92, 0.09) : V(-0.45, 1.05, 0.1);
    const pts = limb(sh, W, [0.3, 0.26], [s > 0 ? [0, -0.15, -1] : [-0.3, -0.2, -1]]);
    const E = pts[1];
    const D = W.clone().sub(E).normalize();
    const H = W.clone().addScaledVector(D, 0.1);
    const chain = b.chain(`arm${side}`, polyline([V(s * 0.045, 1.43, 0), sh, E, W, H]), {
      parent: chest,
      names: [`clavicle${side}`, `shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    armData[side] = { sh, E, W, H, D, chain };
  }

  // ---- fingers
  function fingerPts(root: Vec, d0: Vec, curlDir: Vec, curls: number[], lens: number[]) {
    const axis = d0.clone().cross(curlDir).normalize();
    const pts = [root.clone()];
    let d = d0.clone().normalize();
    let p = root.clone();
    for (let i = 0; i < lens.length; i++) {
      d = rot(d, axis, curls[i]);
      p = p.clone().addScaledVector(d, lens[i]);
      pts.push(p);
    }
    return pts;
  }

  // ---------------- left arm: cybernetic
  {
    const { sh, E, W, D, chain } = armData.L;
    const [clav, shoulder, elbow, wrist] = chain.joints;
    const s = 1;
    // clavicle bridge
    b.capsule([0.045, 1.43, 0], sh, 0.04, { bone: clav, color: NAVY, sides: 8, name: "clavicleSkin" });
    // upper arm + forearm core
    b.sweep(polyline([sh, E, W]), [0.052, 0.05, 0.046, 0.04, 0.034], {
      bone: [shoulder, elbow, wrist],
      color: GUN,
      sides: 8,
      name: "cyberArm",
    });
    const ua = E.clone().sub(sh);
    const fa = W.clone().sub(E);
    const uaDir = ua.clone().normalize();
    // segment rings, upper arm
    for (const t of [0.25, 0.45, 0.65]) {
      const c = lerp(sh, E, t);
      b.rod(c, c.clone().addScaledVector(uaDir, 0.022), 0.058, STEEL, { bone: shoulder, sides: 8, name: "uaRing" });
      glow(
        b.rod(c.clone().addScaledVector(uaDir, 0.022), c.clone().addScaledVector(uaDir, 0.03), 0.0575, GLOW, {
          bone: shoulder,
          sides: 8,
          name: "uaGlow",
        }),
        1.1,
      );
    }
    // upper arm armour plates, four around, shorter on the inner side
    const [u1, w1] = perp(uaDir);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const dir = u1.clone().multiplyScalar(Math.cos(a)).addScaledVector(w1, Math.sin(a));
      b.frustumBox(
        lerp(sh, E, 0.12).addScaledVector(dir, 0.056),
        lerp(sh, E, 0.9).addScaledVector(dir, 0.05),
        [0.03, 0.012],
        [0.026, 0.012],
        { up: dir, color: k % 2 ? STEEL : GUN, bone: shoulder, name: "uaPlate" },
      );
    }
    // piston along the outer upper arm
    const outerU = V(1, 0, 0.0).sub(uaDir.clone().multiplyScalar(uaDir.x)).normalize();
    b.rod(
      lerp(sh, E, 0.18).addScaledVector(outerU, 0.075),
      lerp(sh, E, 0.55).addScaledVector(outerU, 0.075),
      0.013,
      STEEL,
      { bone: shoulder, sides: 6, name: "pistonSleeve" },
    );
    b.rod(
      lerp(sh, E, 0.5).addScaledVector(outerU, 0.075),
      lerp(sh, E, 0.9).addScaledVector(outerU, 0.075),
      0.007,
      "#d4dbe2",
      { bone: elbow, sides: 6, name: "pistonRod" },
    );
    // elbow ball joint
    b.part(sph(0.058, 10, 7), STEEL, { at: E, bone: elbow, name: "elbowBall" });
    for (const k of [1, -1])
      b.part(cyl(0.04, 0.04, 0.02, 8), GUN, {
        at: E.clone().addScaledVector(V(0, 0, 1).cross(fa.clone().normalize()).normalize(), k * 0.055),
        dir: V(0, 0, 1).cross(fa.clone().normalize()),
        bone: elbow,
        name: "elbowDisc",
      });
    glow(b.part(sph(0.02, 6, 4), GLOW, { at: E.clone().add(V(0.052, 0, -0.012)), bone: elbow, name: "elbowGlow" }), 1.4);
    // forearm plating
    const [u2, w2] = perp(fa);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const dir = u2.clone().multiplyScalar(Math.cos(a)).addScaledVector(w2, Math.sin(a));
      b.frustumBox(
        lerp(E, W, 0.18).addScaledVector(dir, 0.044),
        lerp(E, W, 0.88).addScaledVector(dir, 0.035),
        [0.05, 0.016],
        [0.04, 0.014],
        { up: dir, color: k % 2 ? ARMOR : GUN, bone: elbow, name: "faPlate" },
      );
    }
    // forearm panel drawing facing outward
    const outerF = V(1, 0.15, 0.3).sub(fa.clone().normalize().multiplyScalar(0.3)).normalize();
    b.part(new THREE.PlaneGeometry(0.036, 0.1), "#ffffff", {
      at: lerp(E, W, 0.5).addScaledVector(outerF, 0.062),
      dir: outerF,
      axis: "z",
      up: fa,
      texture: FOREARM_PANEL,
      bone: elbow,
      name: "faPanel",
    });
    // forearm glow rings
    for (const t of [0.12, 0.92]) {
      const c = lerp(E, W, t);
      glow(
        b.rod(c, c.clone().addScaledVector(fa.clone().normalize(), 0.008), 0.05 - t * 0.012, GLOW, {
          bone: elbow,
          sides: 8,
          name: "faRing",
        }),
        1.1,
      );
    }
    // wrist cuff
    b.rod(W.clone().addScaledVector(D, -0.03), W.clone().addScaledVector(D, 0.025), 0.044, STEEL, {
      bone: wrist,
      sides: 8,
      name: "wristCuff",
    });
    // hand: palm, knuckle plate, fingers
    const curlDir = V(-1, 0, 0).sub(D.clone().multiplyScalar(-D.x)).normalize();
    const front = V(0, 0, 1).sub(D.clone().multiplyScalar(D.z)).normalize();
    b.part(box(0.034, 0.09, 0.078), GUN, {
      at: W.clone().addScaledVector(D, 0.062),
      dir: D,
      bone: wrist,
      name: "palm",
    });
    b.part(box(0.012, 0.07, 0.07), STEEL, {
      at: W.clone().addScaledVector(D, 0.058).addScaledVector(curlDir, -0.02),
      dir: D,
      bone: wrist,
      name: "handBack",
    });
    glow(
      b.part(box(0.004, 0.02, 0.03), GLOW, {
        at: W.clone().addScaledVector(D, 0.058).addScaledVector(curlDir, -0.027),
        dir: D,
        bone: wrist,
        name: "handGlow",
      }),
      1.2,
    );
    const rootBase = W.clone().addScaledVector(D, 0.106);
    const offs = [0.029, 0.01, -0.01, -0.029];
    const lensSet = [
      [0.03, 0.022, 0.019],
      [0.034, 0.025, 0.021],
      [0.032, 0.023, 0.02],
      [0.025, 0.018, 0.016],
    ];
    const names = ["index", "middle", "ring", "pinky"];
    for (let i = 0; i < 4; i++) {
      const root = rootBase.clone().addScaledVector(front, offs[i]);
      const d0 = rot(D, curlDir, -(i - 1.5) * 5.5);
      const pts = fingerPts(root, d0, curlDir, [12 + i * 2, 18 + i * 2, 20 + i * 2], lensSet[i]);
      const ch = b.chain(`${names[i]}${s > 0 ? "L" : "R"}`, polyline(pts), {
        parent: wrist,
        names: [1, 2, 3].map((n) => `${names[i]}${n}L`),
        role: "digit",
      });
      b.sweep(ch, [0.0105 - i * 0.0008, 0.0085 - i * 0.0006, 0.0065], {
        color: i % 2 ? GUN : STEEL,
        section: "box",
        caps: "flat",
        name: `finger${i}`,
      });
      for (const j of [0, 1]) b.part(sph(0.0095 - i * 0.0006, 6, 4), STEEL, { at: pts[j + 1], bone: ch.joints[j], name: "knuckle" });
      b.part(box(0.011, 0.007, 0.011), ACCENT, { at: pts[3], bone: ch.joints[2], name: "fingertip" });
    }
    const tRoot = W.clone().addScaledVector(D, 0.045).addScaledVector(front, 0.04).addScaledVector(curlDir, 0.004);
    const tD = toward(D, front, 38);
    const tPts = fingerPts(tRoot, tD, curlDir, [14, 20], [0.032, 0.026]);
    const thumb = b.chain("thumbL", polyline(tPts), { parent: wrist, names: ["thumb1L", "thumb2L"], role: "digit" });
    b.sweep(thumb, [0.012, 0.01, 0.0075], { color: GUN, section: "box", caps: "flat", name: "thumb" });
    b.part(sph(0.011, 6, 4), STEEL, { at: tPts[1], bone: thumb.joints[0], name: "knuckle" });
    b.part(box(0.012, 0.008, 0.012), ACCENT, { at: tPts[2], bone: thumb.joints[1], name: "fingertip" });

    // shoulder: layered pauldron, taller on the cyborg side
    const sAxis = V(s * 0.45, 1, 0);
    b.lathe(
      [
        [0, 0.092],
        [0.05, 0.088],
        [0.088, 0.066],
        [0.112, 0.028],
        [0.118, -0.004],
        [0.104, -0.02],
        [0, -0.02],
      ],
      { at: sh.clone().add(V(s * 0.022, 0.044, 0)), axis: sAxis, color: ARMOR, bone: shoulder, segments: 10, smoothing: 1, name: "pauldron" },
    );
    b.lathe(
      [
        [0.104, -0.008],
        [0.124, -0.012],
        [0.124, 0.004],
        [0.106, 0.008],
      ],
      { at: sh.clone().add(V(s * 0.022, 0.044, 0)), axis: sAxis, color: ACCENT, bone: shoulder, segments: 10, name: "pauldronTrim" },
    );
    b.lathe(
      [
        [0, 0.03],
        [0.04, 0.028],
        [0.058, 0.012],
        [0.058, 0],
        [0, 0],
      ],
      { at: sh.clone().add(V(s * 0.044, 0.116, 0)), axis: sAxis, color: ARMOR, bone: shoulder, segments: 8, name: "pauldronCap" },
    );
    b.part(new THREE.PlaneGeometry(0.06, 0.03), "#ffffff", {
      at: sh.clone().add(V(s * 0.095, 0.095, 0.0)),
      dir: [0.75, 0.55, 0.0],
      axis: "z",
      up: [0, 0, 1],
      texture: LABEL,
      bone: shoulder,
      name: "pauldronLabel",
    });
    // hex-plated panel on the inner upper arm
    b.part(new THREE.PlaneGeometry(0.04, 0.09), "#ffffff", {
      at: lerp(sh, E, 0.4).addScaledVector(V(-1, 0, 0.0), 0.054),
      dir: [-1, 0, 0],
      axis: "z",
      texture: HEXPLATE,
      bone: shoulder,
      name: "hexPlate",
    });
  }

  // ---------------- right arm: suited, holding the staff
  {
    const { sh, E, W, D, chain } = armData.R;
    const [clav, shoulder, elbow, wrist] = chain.joints;
    const s = -1;
    b.capsule([-0.045, 1.43, 0], sh, 0.04, { bone: clav, color: NAVY, sides: 8, name: "clavicleSkin" });
    b.sweep(polyline([sh, E, W]), [0.056, 0.052, 0.047, 0.042, 0.036, 0.034], {
      bone: [shoulder, elbow, wrist],
      color: NAVY,
      sides: 8,
      name: "sleeve",
    });
    const fa = W.clone().sub(E);
    const faDir = fa.clone().normalize();
    const uaDir = E.clone().sub(sh).normalize();
    // bicep band
    b.rod(lerp(sh, E, 0.6), lerp(sh, E, 0.72), 0.06, ARMOR, { bone: shoulder, sides: 8, name: "bicepBand" });
    glow(b.rod(lerp(sh, E, 0.72), lerp(sh, E, 0.745), 0.0605, GLOW, { bone: shoulder, sides: 8, name: "bicepGlow" }), 1.1);
    // elbow cop
    b.part(sph(0.058, 10, 7), ARMOR, { at: E, bone: elbow, scale: [1, 1.05, 1.0], name: "elbowPad" });
    b.rod(E.clone().addScaledVector(uaDir, -0.01), E.clone().addScaledVector(uaDir, -0.03), 0.052, ACCENT, {
      bone: elbow,
      sides: 8,
      name: "elbowRing",
    });
    // vambrace: three plates + accent rings
    const [u2, w2] = perp(fa);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      const dir = u2.clone().multiplyScalar(Math.cos(a)).addScaledVector(w2, Math.sin(a));
      b.frustumBox(
        lerp(E, W, 0.22).addScaledVector(dir, 0.046),
        lerp(E, W, 0.9).addScaledVector(dir, 0.038),
        [0.056, 0.016],
        [0.044, 0.014],
        { up: dir, color: ARMOR, bone: elbow, name: "vambrace" },
      );
    }
    for (const t of [0.2, 0.55, 0.9]) {
      const c = lerp(E, W, t);
      b.rod(c, c.clone().addScaledVector(faDir, 0.01), 0.056 - t * 0.014, ACCENT, { bone: elbow, sides: 8, name: "vamRing" });
    }
    // shoulder pauldron, plain and big
    const sAxis = V(s * 0.45, 1, 0);
    b.lathe(
      [
        [0, 0.092],
        [0.05, 0.088],
        [0.088, 0.066],
        [0.112, 0.028],
        [0.118, -0.004],
        [0.104, -0.02],
        [0, -0.02],
      ],
      { at: sh.clone().add(V(s * 0.022, 0.044, 0)), axis: sAxis, color: ARMOR, bone: shoulder, segments: 10, smoothing: 1, name: "pauldron" },
    );
    b.lathe(
      [
        [0.104, -0.008],
        [0.124, -0.012],
        [0.124, 0.004],
        [0.106, 0.008],
      ],
      { at: sh.clone().add(V(s * 0.022, 0.044, 0)), axis: sAxis, color: ACCENT, bone: shoulder, segments: 10, name: "pauldronTrim" },
    );
    // two accent stripes over the dome
    for (const az of [-12, 12])
      b.rod(
        sh.clone().add(V(s * 0.05, 0.126, az * 0.0035)),
        sh.clone().add(V(s * 0.18, 0.056, az * 0.0045)),
        0.0042,
        ACCENT,
        { bone: shoulder, sides: 4, name: "pauldronStripe" },
      );
    b.part(new THREE.PlaneGeometry(0.06, 0.03), "#ffffff", {
      at: sh.clone().add(V(s * 0.09, 0.098, 0.0)),
      dir: [-0.75, 0.55, 0.0],
      axis: "z",
      up: [0, 0, 1],
      texture: LABEL,
      bone: shoulder,
      name: "pauldronLabel",
    });
    // glove
    const palmC = V(-0.488, 0.995, 0.122);
    b.rod(W.clone().addScaledVector(D, -0.03), W.clone().addScaledVector(D, 0.02), 0.04, NAVY_DK, {
      bone: wrist,
      sides: 8,
      name: "gloveCuff",
    });
    b.part(box(0.034, 0.1, 0.05), NAVY_DK, { at: palmC, bone: wrist, name: "palm" });
    // fingers wrapped round the staff
    const rho = 0.027;
    const ys = [1.032, 1.008, 0.984, 0.96];
    const fingerNames = ["index", "middle", "ring", "pinky"];
    const turn = [
      [-70, 0, 70, 138],
      [-70, 0, 72, 142],
      [-70, 2, 74, 140],
      [-70, 4, 74, 132],
    ];
    for (let i = 0; i < 4; i++) {
      const pts = turn[i].map((th, k) =>
        V(staffX + rho * Math.cos(rad(th)), ys[i] - k * 0.0015, staffZ + rho * Math.sin(rad(th))),
      );
      const ch = b.chain(`${fingerNames[i]}R`, polyline(pts), {
        parent: wrist,
        names: [1, 2, 3].map((n) => `${fingerNames[i]}${n}R`),
        role: "digit",
      });
      b.sweep(ch, [0.0105 - i * 0.0007, 0.0092 - i * 0.0006, 0.0072], { color: NAVY_DK, sides: 6, name: `rfinger${i}` });
      b.part(sph(0.007, 6, 4), SKIN, { at: pts[3], bone: ch.joints[2], name: "fingertipSkin" });
    }
    const thumbPts = [-62, 18, 78].map((th, k) => V(staffX + 0.032 * Math.cos(rad(th)), 1.062 + k * 0.0, staffZ + 0.032 * Math.sin(rad(th))));
    const thumbR = b.chain("thumbR", polyline(thumbPts), { parent: wrist, names: ["thumb1R", "thumb2R"], role: "digit" });
    b.sweep(thumbR, [0.0125, 0.0105, 0.008], { color: NAVY_DK, sides: 6, name: "rthumb" });
    b.part(sph(0.0075, 6, 4), SKIN, { at: thumbPts[2], bone: thumbR.joints[1], name: "thumbTip" });
    // knuckle plate and wrist accent
    b.part(box(0.01, 0.075, 0.03), ARMOR, { at: V(-0.4665, 0.998, 0.1305).add(V(0, 0, 0)), bone: wrist, name: "backOfHand" });
  }

  // ============================================================================================ legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = V(s * 0.09, 0.92, 0);
    const ankleP = V(s * 0.095, 0.085, -0.005);
    const pts = limb(hipP, ankleP, [0.44, 0.42], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, polyline(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.095, 0, 0.05],
    });
    const [hipJ, kneeJ, ankleJ] = leg.joints;
    const toe = b.joint(`toe${side}`, {
      parent: ankleJ,
      at: [s * 0.095, 0.04, 0.115],
      aim: [s * 0.095, 0.035, 0.2],
      role: "hinge",
    });
    const cyber = s > 0;
    b.sweep(leg, [0.084, 0.087, 0.08, 0.07, 0.061, 0.052, 0.047, 0.042, 0.038], {
      bone: leg,
      color: NAVY,
      bands: cyber
        ? [
            [0.51, NAVY],
            [1, GUN],
          ]
        : undefined,
      sides: 8,
      name: "legTube",
    });
    // thigh armour: front plate, two side fins, glow stripe
    b.frustumBox([s * 0.092, 0.86, 0.062], [s * 0.098, 0.6, 0.058], [0.1, 0.036], [0.082, 0.032], {
      color: ARMOR,
      bone: hipJ,
      name: "thighPlate",
    });
    glow(b.rod([s * 0.092, 0.84, 0.084], [s * 0.098, 0.64, 0.078], 0.0045, GLOW, { bone: hipJ, sides: 4, name: "thighGlow" }), 1.1);
    for (const k of [1, -1])
      b.frustumBox([s * 0.092 + k * 0.058, 0.84, 0.02], [s * 0.098 + k * 0.048, 0.62, 0.02], [0.024, 0.07], [0.02, 0.06], {
        color: k * s > 0 ? ARMOR : NAVY_DK,
        bone: hipJ,
        name: "thighSide",
      });
    // knee pad
    b.extrude(
      [
        [-0.05, 0.04],
        [0.05, 0.04],
        [0.058, -0.01],
        [0, -0.065, "sharp"],
        [-0.058, -0.01],
      ],
      {
        at: [s * 0.1, 0.5, 0.082],
        x: [1, 0, 0],
        thickness: 0.036,
        bevel: 0.01,
        smoothing: 1,
        color: ARMOR,
        bone: kneeJ,
        name: "kneePad",
      },
    );
    b.extrude(
      [
        [-0.026, 0.016],
        [0.026, 0.016],
        [0.03, 0],
        [0, -0.034, "sharp"],
        [-0.03, 0],
      ],
      {
        at: [s * 0.1, 0.505, 0.1015],
        x: [1, 0, 0],
        thickness: 0.008,
        color: ACCENT,
        bone: kneeJ,
        name: "kneeInlay",
      },
    );
    b.part(cyl(0.032, 0.032, 0.02, 8), GUN, { at: [s * 0.158, 0.495, 0.015], dir: [1, 0, 0], bone: kneeJ, name: "kneeDisc" });
    b.part(cyl(0.02, 0.02, 0.008, 8), s > 0 ? STEEL : ACCENT, { at: [s * 0.17, 0.495, 0.015], dir: [1, 0, 0], bone: kneeJ, name: "kneeCap" });
    // shin
    if (!cyber) {
      b.frustumBox([s * 0.098, 0.43, 0.052], [s * 0.096, 0.14, 0.036], [0.082, 0.04], [0.066, 0.036], {
        color: ARMOR,
        bone: kneeJ,
        name: "shinGuard",
      });
      glow(b.rod([s * 0.098, 0.41, 0.075], [s * 0.096, 0.17, 0.058], 0.0045, GLOW, { bone: kneeJ, sides: 4, name: "shinGlow" }), 1.1);
      b.frustumBox([s * 0.096, 0.4, -0.04], [s * 0.095, 0.17, -0.04], [0.07, 0.03], [0.054, 0.026], {
        color: NAVY_DK,
        bone: kneeJ,
        name: "calfGuard",
      });
    } else {
      // exposed hydraulic shin
      const a = V(s * 0.095, 0.43, 0.0);
      const c = V(s * 0.096, 0.14, -0.005);
      for (const k of [1, -1]) {
        b.rod(a.clone().add(V(k * 0.032, 0, 0.044)), c.clone().add(V(k * 0.026, 0, 0.036)), 0.011, STEEL, { bone: kneeJ, sides: 6, name: "shinStrut" });
      }
      b.rod(a.clone().add(V(0, 0, -0.05)), lerp(a, c, 0.6).add(V(0, 0, -0.045)), 0.02, STEEL, { bone: kneeJ, sides: 8, name: "pistonSleeveLeg" });
      b.rod(lerp(a, c, 0.55).add(V(0, 0, -0.045)), c.clone().add(V(0, 0.03, -0.04)), 0.01, "#d4dbe2", { bone: ankleJ, sides: 6, name: "pistonRodLeg" });
      for (const t of [0.12, 0.3, 0.48, 0.66, 0.84]) {
        const p = lerp(a, c, t);
        b.rod(p.clone().add(V(0, 0.0, 0)), p.clone().add(V(0, -0.016, 0)), 0.055 - t * 0.012, STEEL, { bone: kneeJ, sides: 8, name: "shinRing" });
      }
      glow(b.rod(lerp(a, c, 0.38), lerp(a, c, 0.4), 0.0545, GLOW, { bone: kneeJ, sides: 8, name: "shinGlowRing" }), 1.1);
      b.frustumBox(V(s * 0.098, 0.4, 0.05), V(s * 0.096, 0.2, 0.04), [0.07, 0.022], [0.056, 0.02], { color: ARMOR, bone: kneeJ, name: "shinFront" });
      b.part(new THREE.PlaneGeometry(0.05, 0.1), "#ffffff", {
        at: [s * 0.152, 0.3, 0.0],
        dir: [1, 0, 0],
        axis: "z",
        texture: HEXPLATE,
        bone: kneeJ,
        name: "shinHex",
      });
    }

    // boot
    const x = s * 0.095;
    b.frustumBox([x, 0.285, -0.012], [x, 0.09, -0.012], [0.112, 0.118], [0.1, 0.106], { color: BOOT, bone: ankleJ, name: "bootShaft" });
    b.rod([x, 0.285, -0.012], [x, 0.265, -0.012], 0.074, ACCENT, { bone: ankleJ, sides: 8, name: "bootTrim" });
    b.rod([x, 0.255, -0.012], [x, 0.235, -0.012], 0.068, ARMOR, { bone: ankleJ, sides: 8, name: "bootCuff" });
    b.frustumBox([x, 0.058, -0.06], [x, 0.058, 0.115], [0.108, 0.064], [0.1, 0.056], { color: BOOT, bone: ankleJ, name: "bootFoot" });
    b.frustumBox([x, 0.05, 0.12], [x, 0.046, 0.19], [0.098, 0.052], [0.084, 0.036], { color: BOOT, bone: toe, name: "bootToe" });
    b.part(sph(1, 8, 6), ARMOR, { at: [x, 0.05, 0.185], scale: [0.05, 0.028, 0.034], bone: toe, name: "toeCap" });
    b.part(box(0.122, 0.024, 0.28), SOLE, { at: [x, 0.012, 0.045], bone: ankleJ, name: "sole" });
    glow(b.part(box(0.125, 0.005, 0.2), GLOW, { at: [x, 0.0262, 0.02], bone: ankleJ, name: "soleGlow" }), 1.0);
    b.part(box(0.1, 0.06, 0.05), ARMOR, { at: [x, 0.03, -0.065], bone: ankleJ, name: "heelCup" });
    b.part(box(0.102, 0.016, 0.07), GUN, { at: [x, 0.1, 0.07], bone: ankleJ, name: "instepStrap" });
    b.part(box(0.102, 0.016, 0.07), GUN, { at: [x, 0.082, 0.085], bone: ankleJ, rotation: [-12, 0, 0], name: "instepStrap" });
    b.part(box(0.01, 0.07, 0.07), ACCENT, { at: [x + s * 0.054, 0.062, 0.02], bone: ankleJ, name: "bootStripe" });
    for (const k of [-0.03, 0.0, 0.03])
      b.part(sph(0.007, 5, 4), STEEL, { at: [x + s * 0.0535, 0.14 + k * 0.5, -0.012 + k * 0.4], bone: ankleJ, name: "bootRivet" });
    // ankle joint disc
    b.part(cyl(0.03, 0.03, 0.012, 8), GUN, { at: [x + s * 0.062, 0.11, -0.012], dir: [1, 0, 0], bone: ankleJ, name: "ankleDisc" });
  }

  // ============================================================================================ backpack emitter
  b.frustumBox([0, 1.15, -0.19], [0, 1.45, -0.19], [0.27, 0.13], [0.3, 0.15], { color: ARMOR, bone: chest, name: "packBody" });
  b.frustumBox([0, 1.12, -0.17], [0, 1.18, -0.17], [0.2, 0.1], [0.24, 0.1], { color: GUN, bone: chest, name: "packBase" });
  b.part(box(0.31, 0.012, 0.16), ACCENT, { at: [0, 1.335, -0.19], bone: chest, name: "packStripe" });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [0, 1.25, -0.2655],
    dir: [0, 0, -1],
    axis: "z",
    texture: VENTS,
    bone: chest,
    name: "packVents",
  });
  for (const s of [1, -1]) {
    // glowing healing canisters on the sides
    b.rod([s * 0.115, 1.17, -0.255], [s * 0.115, 1.455, -0.255], 0.022, GUN, { bone: chest, sides: 8, name: "canisterHousing" });
    glow(b.capsule([s * 0.115, 1.2, -0.262], [s * 0.115, 1.43, -0.262], 0.0165, GLOW, { bone: chest, sides: 8, name: "canister" }), 1.3);
    for (const y of [1.2, 1.31, 1.43])
      b.rod([s * 0.115, y, -0.255], [s * 0.115, y + 0.014, -0.255], 0.028, STEEL, { bone: chest, sides: 8, name: "canisterBand" });
    // exhaust cones
    b.rod([s * 0.065, 1.16, -0.19], [s * 0.065, 1.09, -0.19], [0.035, 0.022], GUN, { bone: chest, sides: 8, name: "exhaust" });
    glow(b.rod([s * 0.065, 1.09, -0.19], [s * 0.065, 1.085, -0.19], 0.02, GLOW, { bone: chest, sides: 8, name: "exhaustGlow" }), 1.3);
    // emitter fins: angular wings that give the back its silhouette
    b.extrude(
      [
        [0, 0],
        [0.07, 0.04],
        [0.2, 0.2],
        [0.17, 0.24, "sharp"],
        [0.06, 0.12],
        [0, 0.1],
      ],
      {
        at: [s * 0.15, 1.38, -0.2],
        x: [s * 0.55, 0, -0.1],
        y: [s * 0.5, 0.85, 0],
        thickness: 0.016,
        bevel: 0.005,
        color: ARMOR,
        bone: chest,
        name: "packFin",
      },
    );
    b.extrude(
      [
        [0.02, 0.02],
        [0.09, 0.06],
        [0.19, 0.19],
        [0.16, 0.21, "sharp"],
        [0.075, 0.115],
      ],
      {
        at: [s * 0.15, 1.38, -0.2],
        x: [s * 0.55, 0, -0.1],
        y: [s * 0.5, 0.85, 0],
        thickness: 0.004,
        color: ACCENT,
        bone: chest,
        name: "packFinInlay",
      },
    );
    // top intake
    b.part(box(0.07, 0.03, 0.09), GUN, { at: [s * 0.06, 1.465, -0.19], bone: chest, name: "intake" });
    b.part(box(0.05, 0.005, 0.06), "#0f141a", { at: [s * 0.06, 1.482, -0.19], bone: chest, name: "intakeSlot" });
  }
  // pack status light bar
  glow(b.part(box(0.1, 0.012, 0.006), GLOW, { at: [0, 1.425, -0.267], bone: chest, name: "packLight" }), 1.4);
  b.part(new THREE.PlaneGeometry(0.06, 0.03), "#ffffff", {
    at: [0, 1.38, -0.2665],
    dir: [0, 0, -1],
    axis: "z",
    texture: LABEL,
    bone: chest,
    name: "packLabel",
  });
  // cable from the pack to the cyborg shoulder and arm
  b.sweep(
    catmull([
      [0.14, 1.36, -0.2],
      [0.2, 1.4, -0.11],
      [0.215, 1.45, -0.02],
      [0.2, 1.4, 0.06],
    ]),
    0.0085,
    { bone: chest, color: GUN, sides: 5, name: "powerCable" },
  );
  glow(
    b.sweep(
      catmull([
        [0.142, 1.37, -0.202],
        [0.2, 1.412, -0.112],
        [0.216, 1.455, -0.02],
      ]),
      0.0035,
      { bone: chest, color: GLOW, sides: 4, name: "cableGlow" },
    ),
    1.2,
  );

  // ============================================================================================ healing staff
  const staff = b.joint("staff", { parent: armData.R.chain.joints[3], at: [staffX, 0.0, staffZ], aim: [staffX, 1.0, staffZ] });
  const SX = staffX;
  const SZ = staffZ;
  const at = (y: number, dx = 0, dz = 0): [number, number, number] => [SX + dx, y, SZ + dz];
  // ferrule and lower shaft
  b.rod(at(0.0), at(0.075), [0.009, 0.0195], GUN, { bone: staff, sides: 8, name: "ferrule" });
  b.rod(at(0.075), at(0.095), 0.0225, STEEL, { bone: staff, sides: 8, name: "ferruleRing" });
  const shaftLow = b.rod(at(0.095), at(0.88), 0.0148, STEEL, { bone: staff, sides: 8, name: "shaftLow" });
  glow(b.rod(at(0.13), at(0.134), 0.0152, GLOW, { bone: staff, sides: 8, name: "shaftGlowLow" }), 1.1);
  for (const y of [0.3, 0.5, 0.7]) b.rod(at(y), at(y + 0.018), 0.0185, GUN, { bone: staff, sides: 8, name: "shaftBand" });
  b.decal(shaftLow, GAUGE, { at: at(0.58, 0, 0.0146), dir: [0, 0, 1], size: [0.02, 0.16], name: "shaftGauge" });
  // grip
  b.rod(at(0.88), at(1.1), 0.0178, GRIP, { bone: staff, sides: 8, name: "grip" });
  b.rod(at(0.865), at(0.885), 0.0225, ACCENT, { bone: staff, sides: 8, name: "gripRingLow" });
  b.rod(at(1.1), at(1.12), 0.0225, ACCENT, { bone: staff, sides: 8, name: "gripRingHigh" });
  // upper shaft
  b.rod(at(1.12), at(1.58), 0.0155, ARMOR, { bone: staff, sides: 8, name: "shaftHigh" });
  for (const y of [1.22, 1.32, 1.42, 1.52])
    glow(b.rod(at(y), at(y + 0.01), 0.017, GLOW, { bone: staff, sides: 8, name: "shaftGlow" }), 1.2);
  for (const y of [1.27, 1.37, 1.47]) b.rod(at(y), at(y + 0.025), 0.0175, GUN, { bone: staff, sides: 8, name: "shaftSleeve" });
  // cradle collar and orb mount
  b.lathe(
    [
      [0.0, 0],
      [0.022, 0],
      [0.04, 0.012],
      [0.046, 0.034],
      [0.032, 0.056],
      [0.02, 0.07],
      [0.0, 0.07],
    ],
    { at: at(1.57), axis: [0, 1, 0], color: ARMOR, bone: staff, segments: 10, smoothing: 1, name: "cradleCollar" },
  );
  b.lathe(
    [
      [0.04, 0.026],
      [0.054, 0.03],
      [0.054, 0.04],
      [0.042, 0.042],
    ],
    { at: at(1.57), axis: [0, 1, 0], color: ACCENT, bone: staff, segments: 10, name: "cradleTrim" },
  );
  const orbY = 1.78;
  // three curved prongs holding the orb
  for (let k = 0; k < 3; k++) {
    const a = (k * 2 * Math.PI) / 3 + Math.PI / 2;
    const cs = Math.cos(a);
    const sn = Math.sin(a);
    const P = (r: number, y: number): [number, number, number] => [SX + cs * r, y, SZ + sn * r];
    b.sweep(catmull([P(0.028, 1.625), P(0.085, 1.68), P(0.118, 1.76), P(0.1, 1.85), P(0.045, 1.915)]), [0.017, 0.013, 0.012, 0.011, 0.004], {
      bone: staff,
      color: ARMOR,
      sides: 6,
      caps: { start: "flat", end: "point" },
      name: "prong",
    });
  }
  // orb, inner core and orbiting rings
  glow(b.part(sph(0.07, 12, 8), GLOW, { at: at(orbY), bone: staff, name: "orb" }), 1.6);
  glow(b.part(sph(0.036, 8, 6), "#ffffff", { at: at(orbY), bone: staff, name: "orbCore" }), 2.0);
  for (const [tx, tz] of [
    [62, 0],
    [-35, 70],
  ])
    glow(
      b.part(new THREE.TorusGeometry(0.095, 0.0042, 5, 28), GLOW, {
        at: at(orbY),
        rotation: [tx, 0, tz],
        bone: staff,
        name: "orbRing",
      }),
      1.4,
    );
  b.spike(at(1.9), [0, 1, 0], 0.085, 0.015, { bone: staff, color: ARMOR, sides: 6, name: "finial" });
  b.part(sph(0.012, 6, 4), ACCENT, { at: at(1.992), bone: staff, name: "finialTip" });
  // dangling charm and strap on the staff
  b.sweep(
    catmull([at(1.12, 0, 0.02), at(1.06, 0.03, 0.05), at(0.99, 0.045, 0.045), at(0.93, 0.045, 0.05)]),
    0.0045,
    { bone: staff, color: NAVY_DK, sides: 4, name: "staffStrap" },
  );
  glow(b.capsule(at(0.925, 0.045, 0.05), at(0.89, 0.045, 0.05), 0.011, GLOW, { bone: staff, sides: 6, name: "charm" }), 1.2);

  return b.root;
}

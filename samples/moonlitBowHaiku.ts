import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import { cel, INK, inkLines } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Moonlit Elven Longbow",
  description:
    "A strung elven longbow of pale lacquered wood with an indigo leather grip, gold wire wraps, a moonstone set in the riser, teal silk ribbons and a leaf finial, standing on a carved marble plinth with a glowing rune ring. About 1.9 m tall.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// Palette: one cel per surface colour (a lit tone and a hard, hue-shifted shadow tone).
const LACQUER = cel(inkLines("#f6ead0", { levels: [0], axis: [0, 0, 1], width: 0.1, ink: INK }), "#dcc2b0");
const GOLD = cel("#ffd66b", "#c98a2e");
const GRIP = cel("#2f3f8f", "#1b2459");
const TEAL = cel("#4fd1c5", "#23808c");
const PALE_TEAL = cel("#b4f4ea", "#5fb7bf");
const SILVER = cel("#f6f9ff", "#a9b9dd");
const INDIGO = cel("#2b3677", "#1a2150");
const MARBLE = cel("#f3eefa", "#b9a6d2");
const MOON = "#c9f6ff"; // self-lit flat colour (glow kit)

// Limb surface: lacquer with a row of gold beads along the front face (the +z broad face).
const LIMB = paint((_p, n, s) => (n.z > 0.7 && (s[0] * 24) % 1 < 0.3 ? GOLD : LACQUER));

// Plinth: indigo foot, gold bands, marble drum with gold pinstripes.
const PLINTH = paint((_p, _n, s) => {
  const h = s[0];
  if (h < 0.034) return INDIGO;
  if (h < 0.04 || (h > 0.086 && h < 0.094)) return GOLD;
  return Math.abs(((s[1] / 30) % 1) - 0.5) < 0.05 ? GOLD : MARBLE;
});

// Section of the stave along its length: [thickness, width] half extents as sweep [rx, ry].
// rx runs across the bow (binormal, z), ry runs in the bow's plane (x): the limbs are broad
// and face the viewer. Fullest at the grip (t = 0.5), tapering to the nocks at t = 0 and 1.
function bowRadius(t: number): [number, number] {
  const d = Math.abs(t - 0.5) * 2; // 0 at the grip, 1 at the tips
  const w = Math.pow(1 - d, 1.5);
  return [0.0075 + 0.0105 * w + 0.0035 * Math.pow(1 - d, 6), 0.011 + 0.02 * w];
}

// The bow centreline, upper nock to lower nock, lying in the x-y plane the model faces.
// Symmetric about the grip at y = 0.99. The string sits at x = -0.205 (the archer's side),
// and the limbs recurve toward it as the string pulls them.
const BOW = catmull([
  [-0.205, 1.85, 0],
  [-0.185, 1.8, 0],
  [-0.14, 1.67, 0],
  [-0.085, 1.5, 0],
  [-0.03, 1.3, 0],
  [0, 1.1, 0],
  [0, 0.99, 0],
  [0, 0.88, 0],
  [-0.03, 0.68, 0],
  [-0.085, 0.48, 0],
  [-0.14, 0.31, 0],
  [-0.185, 0.18, 0],
  [-0.205, 0.13, 0],
]);

const STRING_X = -0.205;
const PLINTH_C: [number, number, number] = [-0.09, 0, 0];
const LEAF: OutlinePoint[] = [
  [0, 0],
  [0.022, 0.018],
  [0.016, 0.05],
  [0, 0.09, "sharp"],
  [-0.016, 0.05],
  [-0.022, 0.018],
];
const PLINTH_PROFILE: OutlinePoint[] = [
  [0, 0],
  [0.215, 0],
  [0.222, 0.012],
  [0.222, 0.024],
  [0.2, 0.032],
  [0.176, 0.04],
  [0.166, 0.052],
  [0.166, 0.092],
  [0.178, 0.1],
  [0.182, 0.108],
  [0, 0.108],
];
const CUP_PROFILE: OutlinePoint[] = [
  [0, 0],
  [0.034, 0],
  [0.038, 0.01],
  [0.03, 0.024],
  [0.024, 0.03],
  [0, 0.03],
];
const BEAD_PROFILE: OutlinePoint[] = [
  [0, 0],
  [0.009, 0],
  [0.011, 0.012],
  [0.007, 0.024],
  [0, 0.028],
];

// Rune ring: a glowing circle with radial ticks and a crescent at the centre.
const ticks = Array.from(
  { length: 12 },
  (_, i) => `<path d="M128 22 L128 40 M128 31 L138 36" transform="rotate(${i * 30} 128 128)"/>`,
).join("");
const RUNE = svg(
  `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="116" fill="none" stroke="${MOON}" stroke-width="7"/>
    <circle cx="128" cy="128" r="98" fill="none" stroke="#7fd8ff" stroke-width="3.5"/>
    <g fill="none" stroke="${MOON}" stroke-width="5" stroke-linecap="round">${ticks}</g>
    <path d="M128 92 A36 36 0 1 0 164 128 A28 28 0 1 1 128 92 Z" fill="${MOON}"/>
  </svg>`,
  { size: 512 },
);

// Moonflower: five petals and a gold heart, drawn flat on the plinth top.
const petals = Array.from(
  { length: 5 },
  (_, i) =>
    `<ellipse cx="32" cy="15" rx="10" ry="15" fill="#ffe3f1" stroke="#e98fbb" stroke-width="2.2" transform="rotate(${i * 72} 32 32)"/>`,
).join("");
const FLOWER = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${petals}<circle cx="32" cy="32" r="6" fill="#ffd66b"/></svg>`,
  { size: 128 },
);

// Moon-glyph inked on each limb's front face.
const GLYPH = svg(
  `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 4 A12 12 0 1 0 28 16 A9 9 0 1 1 16 4 Z" fill="${MOON}"/><circle cx="25" cy="7" r="2" fill="${MOON}"/><circle cx="7" cy="25" r="1.6" fill="${MOON}"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "moonlitBowHaiku", detail: 1.5 });
  const bow = b.joint("bow", { at: [0, 0.99, 0] });

  // The bow: one continuous lacquered stave with a leather grip band at its middle.
  b.sweep(BOW, bowRadius, {
    color: LIMB,
    bands: [
      [0.46, LIMB],
      [0.54, GRIP],
      [1, LIMB],
    ],
  });

  // Gold wire wraps round the limbs and the grip collars.
  for (const t of [0.07, 0.15, 0.23, 0.31, 0.39, 0.46, 0.54, 0.61, 0.69, 0.77, 0.85, 0.93]) {
    const [rx, ry] = bowRadius(t);
    const R = Math.max(rx, ry) + 0.0032;
    b.part(new THREE.TorusGeometry(R, 0.0026, 5, 14), GOLD, {
      bone: bow,
      at: BOW.at(t),
      dir: BOW.tangentAt(t),
      axis: "z",
      up: [0, 0, 1],
    });
  }

  // Glowing moon-glyphs on the front face of each limb.
  const glyphFrames = [0.22, 0.34, 0.66, 0.78].map((t) => {
    const p = BOW.at(t);
    return frame([p.x, p.y, bowRadius(t)[0] + 0.002], [0, 0, 1]);
  });
  glow(b.cards(glyphFrames, GLYPH, { size: 0.03, lean: 90, flow: [0, -1, 0], rng: rng(9), vary: 0.1 }), 1.3);

  // Moonstone set in the front of the riser, with a gold bezel and four prongs.
  const gem = b.part(new THREE.SphereGeometry(0.016, 14, 10).scale(1, 1.25, 0.8), MOON, {
    bone: bow,
    at: [0, 0.99, 0.026],
  });
  glow(gem, 1.6);
  b.part(new THREE.TorusGeometry(0.0235, 0.0042, 6, 16), GOLD, { bone: bow, at: [0, 0.99, 0.022] });
  b.ring(frame([0, 0.99, 0.022], [0, 0, 1]), { count: 4, radius: 0.0235 }, (item) =>
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), GOLD, { bone: bow, at: item }),
  );

  // Upper nock: a gold leaf finial continuing the upper limb, on a gold nock ring.
  const tipDir = BOW.tangentAt(0).negate().normalize();
  b.extrude(LEAF, {
    at: BOW.at(0),
    x: [1, 0, 0],
    y: tipDir,
    thickness: 0.0055,
    bevel: 0.0018,
    smoothing: 2,
    color: GOLD,
    bone: bow,
  });
  b.part(new THREE.SphereGeometry(0.0055, 8, 6), GOLD, { bone: bow, at: BOW.at(0) });
  b.part(new THREE.TorusGeometry(0.0125, 0.0028, 6, 12), GOLD, {
    bone: bow,
    at: BOW.at(0),
    dir: tipDir,
    axis: "z",
    up: [0, 0, 1],
  });

  // Bowstring from nock to nock, with a teal serving at the centre.
  b.sweep(
    polyline([
      [STRING_X, 1.85, 0],
      [STRING_X, 0.13, 0],
    ]),
    0.0032,
    { color: SILVER, caps: "round" },
  );
  b.sweep(
    polyline([
      [STRING_X, 1.0, 0],
      [STRING_X, 0.94, 0],
    ]),
    0.0058,
    { color: TEAL, caps: "round" },
  );

  // Two silk ribbons tied to the grip, streaming out to the model's left.
  const ribbonA = bezier([0, 0.9, 0], [0.05, 0.82, 0], [0.12, 0.7, 0], [0.16, 0.54, 0]);
  const ribbonB = bezier([0.005, 1.04, 0], [0.07, 1.0, 0], [0.13, 0.93, 0], [0.15, 0.82, 0]);
  b.sweep(ribbonA, (t) => [0.0009, 0.016 - 0.005 * t], {
    color: TEAL,
    bands: [
      [0.88, TEAL],
      [0.93, GOLD],
      [1, TEAL],
    ],
  });
  b.sweep(ribbonB, (t) => [0.0009, 0.014 - 0.004 * t], {
    color: PALE_TEAL,
    bands: [
      [0.88, PALE_TEAL],
      [0.93, GOLD],
      [1, PALE_TEAL],
    ],
  });
  // Tassel beads at the ribbon ends glow like moonstone.
  for (const rib of [ribbonA, ribbonB]) {
    glow(b.lathe(BEAD_PROFILE, { at: rib.at(1), bone: bow, color: MOON }), 1.2);
  }

  // The plinth: a carved marble drum on an indigo foot, with a socket cup for the lower nock.
  b.lathe(PLINTH_PROFILE, { at: PLINTH_C, bone: bow, color: PLINTH, smoothing: 1 });
  b.part(new THREE.TorusGeometry(0.178, 0.0044, 6, 40), GOLD, {
    bone: bow,
    at: [PLINTH_C[0], 0.1, PLINTH_C[2]],
    rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.2, 0.0045, 6, 40), GOLD, {
    bone: bow,
    at: [PLINTH_C[0], 0.032, PLINTH_C[2]],
    rotation: [90, 0, 0],
  });
  b.lathe(CUP_PROFILE, { at: [STRING_X, 0.108, 0], bone: bow, color: GOLD });
  glow(
    b.part(new THREE.CircleGeometry(0.15, 48), "#ffffff", {
      bone: bow,
      at: [PLINTH_C[0], 0.1095, PLINTH_C[2]],
      rotation: [-90, 0, 0],
      texture: RUNE,
    }),
  );

  // A few moonflowers scattered flat on the plinth top.
  const flowerFrames = [30, 120, 210, 300].map((deg) => {
    const a = (deg * Math.PI) / 180;
    return frame([PLINTH_C[0] + 0.135 * Math.cos(a), 0.111, PLINTH_C[2] + 0.135 * Math.sin(a)], [0, 1, 0]);
  });
  b.cards(flowerFrames, FLOWER, {
    size: 0.055,
    lean: 90,
    flow: (_f, i) => [Math.cos(i), 0, Math.sin(i)],
    mirror: true,
    vary: 0.2,
    rng: rng(5),
  });

  return b.root;
}

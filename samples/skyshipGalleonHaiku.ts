import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { catmull, spiral } from "../src/path";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK, zigzag } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Sky Galleon",
  description:
    "A flying sky galleon about 19 m long, hovering 0.5 m above the ground: a crimson hull with a navy belly, a gold zigzag band and gunports, three billowing square sails with sun emblems, two side pusher propellers on gold-banded pods, a helm wheel on the stern cabin and a glowing lift crystal slung under the keel.",
  style: "high-fantasy anime",
  commit: "b816db2",
};

// Palette: one flat colour per surface, cel-shaded through kits/toon.
const CRIMSON = "#b8323f";
const NAVY = "#2b3f8c";
const GOLD = "#f3c24f";
const CREAM = "#f7ecd3";
const SAIL_SHADE = "#e4d4b2";
const DECK = "#d9a264";
const PLANK_SEAM = "#6b3f22";
const WOOD = "#8a5530";
const MAST = "#6e4226";
const ROPE = "#dcc397";
const BRASS = "#d69b45";
const IRON = "#4a4f66";
const STREAM = "#e0475a";
const BLADE = "#e9b25c";
const CRATE = "#a8703f";
const CRATE_SEAM = "#5a3520";
const BARREL = "#9a6436";
const CRYSTAL = "#9ff4ff";
const LANTERN = "#ffd47a";
const WINDOW = "#ffd98a";

/** Half the deck's width at a given z (the deck tapers from stern to bow). */
const deckHW = (z: number) => 1.7 - ((z + 6.6) * 0.4) / 12.8;
/** Gunport centres along the hull side. */
const PORT_Z = [-2.8, -0.4, 2.0, 4.4];

/** A sail yard: height, and half its width. */
type Yard = { y: number; hw: number };

/** A yard or sail edge: straight across at height y, bellied forward by `bulge` at its middle. */
const yardCurve = (y: number, z: number, hw: number, bulge: number) =>
  catmull([-1, -0.5, 0, 0.5, 1].map((u) => [u * hw, y, z + bulge * Math.sin(((u + 1) * Math.PI) / 2)]));

// Hull: crimson upper hull, navy belly, a gold zigzag band, a fine gold line, gold rail band and gunports.
const hullPaint = paint((p) => {
  const y = p.y;
  if (Math.abs(p.x) > 1.0 && y > 3.0 && y < 3.38) {
    const dz = Math.min(...PORT_Z.map((zc) => Math.abs(p.z - zc)));
    if (dz < 0.2) return INK;
    if (dz < 0.27) return GOLD;
  }
  if (y < 1.7) return NAVY;
  if (y < 1.84) return GOLD;
  if (y < 3.94) {
    if (Math.abs(y - (2.9 + 0.12 * zigzag(p.z / 0.9))) < 0.035) return GOLD;
    if (Math.abs(y - 3.62) < 0.025) return GOLD;
    return CRIMSON;
  }
  if (y < 4.06) return GOLD;
  return CREAM;
});

const HULL = cel(hullPaint);
const NAVY_C = cel(NAVY);
const CRIMSON_C = cel(CRIMSON);
const GOLD_C = cel(GOLD);
const WOOD_C = cel(WOOD);
const MAST_C = cel(MAST);
const ROPE_C = cel(ROPE);
const BRASS_C = cel(BRASS);
const IRON_C = cel(IRON);
const STREAM_C = cel(STREAM);
const BLADE_C = cel(paint((_p, _n, s) => (s[1] > 1.0 ? CRIMSON : BLADE)));
const DECK_C = cel(paint((p) => (p.x / 0.3 - Math.floor(p.x / 0.3) < 0.05 ? PLANK_SEAM : DECK)));
const CABIN_C = cel(paint((p) => (Math.abs(p.y - 4.42) < 0.08 || Math.abs(p.y - 6.0) < 0.07 ? GOLD : CREAM)));
const CRATE_C = cel(paint((p) => (p.y / 0.2 - Math.floor(p.y / 0.2) < 0.06 ? CRATE_SEAM : CRATE)));
const BARREL_C = cel(
  paint((_p, _n, s) => (Math.abs(s[0] - 0.12) < 0.03 || Math.abs(s[0] - 0.66) < 0.03 ? BRASS : BARREL)),
);

// Runes that orbit the lift crystal: a glowing diamond, ring and cross.
const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="${CRYSTAL}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 8 L52 32 L32 56 L12 32 Z"/><circle cx="32" cy="32" r="8"/><path d="M32 24 V14 M32 40 V50 M24 32 H14 M40 32 H50"/></g></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "skyshipGalleonHaiku" });
  const root = b.joint("hull", { at: [0, 2.6, 0] });

  // Hull: a loft from the flat stern to a pointed bow, 14 sides so the belly reads round.
  b.loft(
    [
      { at: [0, 2.8, -7.6], w: 2.6, h: 2.6 },
      { at: [0, 2.6, -6.0], w: 3.6, h: 3.2 },
      { at: [0, 2.6, -2.0], w: 4.2, h: 3.4 },
      { at: [0, 2.6, 2.0], w: 4.2, h: 3.4 },
      { at: [0, 2.5, 5.5], w: 3.2, h: 3.0 },
      { at: [0, 2.3, 7.6], w: 1.8, h: 2.0 },
      { at: [0, 2.2, 8.6], w: 0.5, h: 0.9 },
    ],
    { bone: root, color: HULL, sides: 14, caps: { start: "flat", end: "point" } },
  );

  // Keel: the spine the lift crystal hangs from.
  b.frustumBox([0, 1.0, -6.4], [0, 1.0, 6.6], [0.5, 0.3], [0.4, 0.26], { bone: root, color: NAVY_C });

  // Deck with plank seams.
  b.frustumBox([0, 4.2, -6.6], [0, 4.2, 6.2], [3.4, 0.22], [2.6, 0.22], { bone: root, color: DECK_C });

  // Stern cabin, roof and gold roof band, lit windows framed in gold.
  b.frustumBox([0, 5.2, -6.8], [0, 5.2, -3.0], [2.6, 1.8], [2.5, 1.8], { bone: root, color: CABIN_C });
  b.frustumBox([0, 6.2, -7.0], [0, 6.2, -2.8], [2.9, 0.22], [2.9, 0.22], { bone: root, color: CRIMSON_C });
  b.frustumBox([0, 6.07, -7.02], [0, 6.07, -2.78], [2.96, 0.06], [2.96, 0.06], { bone: root, color: GOLD_C });
  for (const x of [-0.8, 0, 0.8]) {
    b.part(new THREE.BoxGeometry(0.62, 0.66, 0.03), GOLD_C, { bone: root, at: [x, 5.35, -3.01] });
    glow(b.part(new THREE.BoxGeometry(0.5, 0.54, 0.02), WINDOW, { bone: root, at: [x, 5.35, -2.99] }), 1.4);
  }
  for (const x of [-0.5, 0.5]) {
    b.part(new THREE.BoxGeometry(0.62, 0.66, 0.03), GOLD_C, { bone: root, at: [x, 5.35, -6.81] });
    glow(b.part(new THREE.BoxGeometry(0.5, 0.54, 0.02), WINDOW, { bone: root, at: [x, 5.35, -6.83] }), 1.4);
  }
  for (const s of [1, -1]) {
    for (const z of [-5.7, -4.2]) {
      b.part(new THREE.BoxGeometry(0.03, 0.66, 0.62), GOLD_C, { bone: root, at: [s * 1.3, 5.35, z] });
      glow(b.part(new THREE.BoxGeometry(0.02, 0.54, 0.5), WINDOW, { bone: root, at: [s * 1.33, 5.35, z] }), 1.4);
    }
  }

  // Gilded stern: two gold scrolls on the flat stern face.
  for (const s of [1, -1]) {
    b.sweep(
      spiral([s * 0.5, 3.4, -7.66], [s * 0.5, 3.75, -7.66], [0, 0, -1], { turns: s * 1.3, r1: 0.12 }),
      [0.03, 0.02],
      { color: GOLD_C, bone: root },
    );
  }

  // Lift crystal slung under the keel, glowing, ringed by floating runes.
  glow(
    b.lathe(
      [
        [0, 0],
        [0.3, 0.14],
        [0.56, 0.3],
        [0.68, 0.46],
        [0.62, 0.6],
        [0.4, 0.74],
        [0, 0.8],
      ],
      { at: [0, 0.5, 0], axis: [0, 1, 0], segments: 8, color: CRYSTAL, bone: root },
    ),
    1.6,
  );
  const cradle: number[][] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    cradle.push([0.62 * Math.cos(a), 0.86, 0.62 * Math.sin(a)]);
  }
  b.sweep(catmull(cradle, { closed: true }), 0.035, { color: BRASS_C, bone: root });
  for (const s of [1, -1]) b.rod([s * 0.62, 0.86, 0], [s * 0.22, 0.9, 0], 0.03, { color: BRASS_C, bone: root });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const dir = [Math.cos(a), 0, Math.sin(a)];
    const at = [0.95 * dir[0], 0.88, 0.95 * dir[2]];
    glow(
      b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
        bone: root,
        at,
        dir,
        axis: "z",
        up: [0, 1, 0],
        texture: RUNE,
      }),
      1.4,
    );
  }

  // Gunports: cannon barrels poke out of the hull at each port, with brass collars.
  for (const s of [1, -1]) {
    for (const z of PORT_Z) {
      b.rod([s * 1.4, 3.2, z], [s * 2.85, 3.2, z], [0.13, 0.1], { color: IRON_C, bone: root });
      b.rod([s * 2.8, 3.2, z], [s * 2.94, 3.2, z], 0.15, { color: BRASS_C, bone: root });
      b.rod([s * 1.9, 3.2, z], [s * 2.02, 3.2, z], 0.17, { color: BRASS_C, bone: root });
    }
  }

  // Gold rails with wooden posts, around the deck.
  for (const s of [1, -1]) {
    b.rod([s * deckHW(-6.3), 5.15, -6.3], [s * deckHW(5.9), 5.15, 5.9], 0.045, { color: GOLD_C, bone: root });
    b.rod([s * deckHW(-6.3), 4.7, -6.3], [s * deckHW(5.9), 4.7, 5.9], 0.025, { color: WOOD_C, bone: root });
    for (let k = 0; k < 13; k++) {
      const z = -6.2 + k;
      b.rod([s * deckHW(z), 4.31, z], [s * deckHW(z), 5.15, z], 0.04, { color: WOOD_C, bone: root });
    }
  }

  // Stern helm: a hinged wheel on a pedestal above the cabin roof.
  const helm = b.joint("helm", { parent: root, at: [0, 7.0, -7.3], dir: [0, 0, -1], role: "hinge" });
  const rim: number[][] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    rim.push([0.5 * Math.cos(a), 7.0 + 0.5 * Math.sin(a), -7.3]);
  }
  b.sweep(catmull(rim, { closed: true }), 0.035, { color: WOOD_C, bone: helm });
  for (const p of rim) b.rod([0, 7.0, -7.3], p, 0.022, { color: WOOD_C, bone: helm });
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.12, 0.05],
      [0.06, 0.1],
      [0, 0.1],
    ],
    { at: [0, 7.0, -7.3], axis: [0, 0, -1], segments: 8, color: BRASS_C, bone: helm },
  );
  b.rod([0, 6.3, -6.9], [0, 6.95, -7.25], 0.07, { color: WOOD_C, bone: root });

  // Rudder: a hinged crimson plate at the stern, turning about the vertical.
  const rudder = b.joint("rudder", { parent: root, at: [0, 2.6, -7.5], dir: [0, 1, 0], role: "hinge" });
  b.extrude(
    [
      [0.3, 1.2],
      [-0.25, 1.1],
      [-0.95, -0.2],
      [-0.8, -1.2, "sharp"],
      [-0.35, -1.25],
      [0.0, -0.6],
    ],
    { at: rudder, thickness: 0.16, bevel: 0.04, color: CRIMSON_C, bone: rudder },
  );

  // Tailplanes: swept navy fins.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [1.5, -0.1],
        [2.6, -0.55, "sharp"],
        [2.4, -1.25],
        [0, -1.45],
      ],
      { at: [0, 3.0, -6.4], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.03, color: NAVY_C, bone: root },
    );
  }

  // Side pods with pusher propellers on hinged joints, linked to the hull by struts.
  for (const s of [1, -1]) {
    const podX = s * 3.5;
    b.loft(
      [
        { at: [podX, 3.0, -5.6], w: 0.66, h: 0.66 },
        { at: [podX, 3.0, -4.2], w: 0.94, h: 0.94 },
        { at: [podX, 3.0, -2.0], w: 1.0, h: 1.0 },
        { at: [podX, 3.0, -0.2], w: 0.94, h: 0.94 },
        { at: [podX, 3.0, 0.6], w: 0.5, h: 0.5 },
      ],
      { bone: root, color: NAVY_C, sides: 12 },
    );
    for (const z of [-4.8, -1.0]) {
      b.rod([podX, 3.0, z], [podX, 3.0, z + 0.15], z < -2 ? 0.46 : 0.56, { color: GOLD_C, bone: root });
    }
    glow(b.part(new THREE.BoxGeometry(0.22, 0.03, 0.9), CRYSTAL, { bone: root, at: [podX, 3.47, -2.6] }), 1.2);
    for (const z of [-4.2, -1.6]) {
      b.rod([s * 1.6, 3.0, z], [podX - s * 0.2, 3.0, z], 0.1, { color: WOOD_C, bone: root });
    }

    const prop = b.joint(s > 0 ? "propL" : "propR", {
      parent: root,
      at: [podX, 3.0, -5.7],
      dir: [0, 0, 1],
      role: "hinge",
    });
    for (let k = 0; k < 3; k++) {
      const a = (k * 2 * Math.PI) / 3;
      const r: [number, number, number] = [Math.sin(a), Math.cos(a), 0];
      const t: [number, number, number] = [Math.cos(a), -Math.sin(a), 0];
      b.extrude(
        [
          [-0.12, 0.02],
          [0.14, 0.02],
          [0.17, 0.7],
          [0.12, 1.15],
          [0.0, 1.32, "sharp"],
          [-0.1, 1.12],
          [-0.15, 0.6],
        ],
        { at: prop, x: t, y: r, thickness: 0.05, bevel: 0.012, smoothing: 1, color: BLADE_C, bone: prop },
      );
    }
    b.lathe(
      [
        [0, 0],
        [0.42, 0],
        [0.4, 0.08],
        [0.2, 0.3],
        [0, 0.36],
      ],
      { at: [podX, 3.0, -5.45], axis: [0, 0, -1], segments: 10, color: BRASS_C, bone: prop },
    );
  }

  // Bowsprit with a gold tip, and gold scrolls on each bow side.
  b.rod([0, 3.5, 6.4], [0, 4.3, 10.4], [0.16, 0.06], { color: WOOD_C, bone: root });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), GOLD_C, { bone: root, at: [0, 4.3, 10.4] });
  for (const s of [1, -1]) {
    b.sweep(
      spiral([s * 1.32, 2.9, 6.4], [s * 1.32, 2.9, 6.7], [s, 0, 0], { turns: s * 1.2, r1: 0.14 }),
      [0.03, 0.02],
      { color: GOLD_C, bone: root },
    );
  }

  // Deck dressing: a rope coil, crates, barrels and lanterns.
  b.sweep(spiral([-0.9, 4.36, 3.4], [-0.77, 4.36, 3.4], [0, 1, 0], { turns: 3, pitch: 0.025 }), 0.018, {
    color: ROPE_C,
    bone: root,
  });
  b.part(new THREE.BoxGeometry(0.7, 0.6, 0.7), CRATE_C, { bone: root, at: [-0.9, 4.61, -2.4] });
  b.part(new THREE.BoxGeometry(0.7, 0.6, 0.7), CRATE_C, { bone: root, at: [-0.9, 5.21, -2.4] });
  b.part(new THREE.BoxGeometry(0.6, 0.5, 0.6), CRATE_C, { bone: root, at: [0.9, 4.56, 1.1] });
  for (const [x, z] of [
    [0.9, -2.4],
    [0.45, -1.8],
  ] as const) {
    b.lathe(
      [
        [0, 0],
        [0.22, 0],
        [0.27, 0.1],
        [0.3, 0.4],
        [0.27, 0.72],
        [0.22, 0.8],
        [0, 0.8],
      ],
      { at: [x, 4.31, z], segments: 10, color: BARREL_C, bone: root },
    );
  }
  for (const [x, z] of [
    [-1.2, -2.4],
    [1.2, -2.4],
    [-1.0, 5.2],
    [1.0, 5.2],
  ] as const) {
    glow(
      b.lathe(
        [
          [0, 0],
          [0.11, 0],
          [0.14, 0.15],
          [0.1, 0.3],
          [0, 0.32],
        ],
        { at: [x, 4.31, z], segments: 8, color: LANTERN, bone: root },
      ),
      1.5,
    );
    b.lathe(
      [
        [0, 0.3],
        [0.12, 0.3],
        [0.12, 0.34],
        [0.05, 0.42],
        [0, 0.44],
      ],
      { at: [x, 4.31, z], segments: 8, color: BRASS_C, bone: root },
    );
  }

  // Masts. Each mast carries its yards, sails, gold collars and shrouds.
  const rig = (
    z: number,
    yards: readonly Yard[],
    bulge: number,
    base: number,
    top: number,
    r0: number,
    shrouds: boolean,
  ) => {
    b.rod([0, base, z], [0, top, z], [r0, r0 * 0.6], { color: MAST_C, bone: root });
    for (const yd of yards) {
      b.sweep(yardCurve(yd.y, z, yd.hw, bulge), 0.07, { color: GOLD_C, bone: root });
      b.rod([0, yd.y - 0.14, z], [0, yd.y + 0.14, z], r0 * 1.25, { color: GOLD_C, bone: root });
      b.rod([0, yd.y, z], [0, yd.y, z + bulge], 0.06, { color: GOLD_C, bone: root });
      for (const s of [1, -1]) {
        b.part(new THREE.SphereGeometry(0.11, 8, 6), BRASS_C, { bone: root, at: [s * yd.hw, yd.y, z] });
      }
    }
    for (let i = 0; i + 1 < yards.length; i++) {
      const lo = yards[i];
      const hi = yards[i + 1];
      const cy = (lo.y + hi.y) / 2;
      const R = (hi.y - lo.y) * 0.22;
      // Sail: crimson border, a gold-rayed sun roundel in the middle, cream cloth with a pale shadow side.
      const sailCloth = cel(
        paint((p, _n, s) => {
          if (s[0] < 0.04 || s[0] > 0.96 || s[1] < 0.05 || s[1] > 0.95) return CRIMSON;
          const dy = p.y - cy;
          const r = Math.hypot(p.x, dy) / R;
          if (r < 0.12) return GOLD;
          if (r < 0.5) return Math.abs(Math.sin(6 * Math.atan2(dy, p.x))) > 0.82 ? GOLD : CRIMSON;
          if (r < 0.58) return GOLD;
          return CREAM;
        }),
        SAIL_SHADE,
      );
      b.membrane(yardCurve(hi.y, z, hi.hw, bulge), yardCurve(lo.y, z, lo.hw, bulge), {
        color: sailCloth,
        thickness: 0.04,
        rows: 6,
        cols: 12,
        bone: root,
      });
    }
    if (shrouds) {
      const low = yards[0];
      for (const s of [1, -1]) {
        b.rod([s * low.hw, low.y, z], [s * (deckHW(z) - 0.05), 5.1, z], 0.022, { color: ROPE_C, bone: root });
      }
    }
  };
  rig(
    -0.6,
    [
      { y: 6.0, hw: 2.6 },
      { y: 10.4, hw: 2.2 },
      { y: 13.6, hw: 1.7 },
    ],
    0.9,
    4.31,
    16.0,
    0.2,
    true,
  );
  rig(
    4.0,
    [
      { y: 6.0, hw: 2.2 },
      { y: 9.7, hw: 1.8 },
      { y: 12.4, hw: 1.4 },
    ],
    0.8,
    4.31,
    13.4,
    0.18,
    true,
  );
  rig(
    -4.6,
    [
      { y: 8.4, hw: 1.6 },
      { y: 10.9, hw: 1.2 },
    ],
    0.6,
    6.3,
    12.4,
    0.15,
    false,
  );

  // Crow's nest, masthead beacon, pennants and streamers.
  b.lathe(
    [
      [0, 0],
      [0.72, 0],
      [0.7, 0.2],
      [0.56, 0.36],
      [0, 0.4],
    ],
    { at: [0, 14.3, -0.6], segments: 10, color: WOOD_C, bone: root },
  );
  glow(b.part(new THREE.SphereGeometry(0.24, 10, 8), CRYSTAL, { bone: root, at: [0, 16.3, -0.6] }), 1.8);
  for (const [z, y, len] of [
    [-0.6, 15.8, 1.8],
    [4.0, 13.2, 1.3],
    [-4.6, 12.2, 1.0],
  ] as const) {
    b.extrude(
      [
        [0, 0],
        [len, -0.18],
        [len * 0.85, -0.45],
        [0, -0.7],
      ],
      { at: [0, y, z], thickness: 0.035, bevel: 0.01, color: CRIMSON_C, bone: root },
    );
  }
  for (const s of [1, -1]) {
    for (const [z0, y0] of [
      [-0.6, 15.4],
      [4.0, 12.9],
    ] as const) {
      b.sweep(
        catmull([
          [0, y0, z0],
          [0.7 * s, y0 + 0.1, z0 + 0.6],
          [1.5 * s, y0 - 0.5, z0 + 1.5],
          [2.2 * s, y0 - 0.1, z0 + 2.6],
          [2.6 * s, y0 - 0.9, z0 + 3.6],
        ]),
        (t) => 0.1 - 0.07 * t,
        { color: STREAM_C, bone: root },
      );
    }
  }

  return b.root;
}

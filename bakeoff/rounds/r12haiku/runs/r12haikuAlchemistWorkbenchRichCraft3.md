```ts
import * as THREE from "three";
import { catmull, createBuilder, frame, grain, rng, svg } from "agentic-3js-builder";
import type { Fill, Frame } from "agentic-3js-builder";
import { cel, inkLines } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A turned oak workbench with glowing potions, a brass balance, open and stacked books, a mortar and drying herbs, cel-shaded in a Genshin Impact style.",
};

type P = [number, number, number];
type Profile = [number, number][];
/** A placement on the bench: position, and a turn about +Y in degrees. */
type Pose = { x: number; y: number; z: number; yaw: number };

const DEG = Math.PI / 180;
const TOP = 0.92; // bench top surface
const SHELF_Y = 1.315; // back shelf top surface
const BEAM_Y = 1.25; // balance beam height
const UP = new THREE.Vector3(0, 1, 0);
const RIGHT = new THREE.Vector3(1, 0, 0);

/** Lays a plane flat on a surface (drawing top toward −Z), turned `yawDeg` about +Y. */
function flatQuat(yawDeg: number) {
  return new THREE.Quaternion()
    .setFromAxisAngle(UP, yawDeg * DEG)
    .multiply(new THREE.Quaternion().setFromAxisAngle(RIGHT, -Math.PI / 2));
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** Gilded alchemy emblem for the front apron. */
const EMBLEM = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 20H42M78 20H116" stroke="#3b2412" stroke-width="5" stroke-linecap="round"/>
  <path d="M4 20H42M78 20H116" stroke="#ffd676" stroke-width="2" stroke-linecap="round"/>
  <circle cx="60" cy="20" r="16" fill="#2b8a8e" stroke="#3b2412" stroke-width="5"/>
  <circle cx="60" cy="20" r="16" fill="none" stroke="#ffd676" stroke-width="2"/>
  <path d="M60 9L68 20L60 31L52 20Z" fill="#ff5fa2" stroke="#3b2412" stroke-width="3"/>
  <circle cx="60" cy="20" r="2.4" fill="#ffe9a0"/>
  <path d="M42 20L46 16L50 20L46 24Z M70 20L74 16L78 20L74 24Z" fill="#ffd676" stroke="#3b2412" stroke-width="1.5"/>
</svg>`,
  { size: 512 },
);

/** Paper label for the flasks: a fire sign in a ring. */
const LABEL = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="54" height="54" rx="8" fill="#fbf0d0" stroke="#4a2c18" stroke-width="3"/>
  <rect x="8" y="8" width="44" height="44" rx="5" fill="none" stroke="#d9a548" stroke-width="1.6"/>
  <circle cx="30" cy="27" r="11" fill="none" stroke="#c2306e" stroke-width="3"/>
  <path d="M30 19L37 31H23Z" fill="#c2306e"/>
  <path d="M21 43H39M25 48H35" stroke="#4a2c18" stroke-width="2.4" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

/** Gold tooling on a book cover, transparent around the frame. */
const COVER = svg(
  `<svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke-linejoin="round">
    <rect x="10" y="10" width="120" height="80" rx="6" stroke="#3b2412" stroke-width="6"/>
    <rect x="10" y="10" width="120" height="80" rx="6" stroke="#ffd676" stroke-width="2.4"/>
    <rect x="18" y="18" width="104" height="64" rx="3" stroke="#ffd676" stroke-width="1.6"/>
    <circle cx="70" cy="50" r="18" stroke="#3b2412" stroke-width="5"/>
    <circle cx="70" cy="50" r="18" stroke="#ffd676" stroke-width="2.2"/>
    <path d="M70 38L76 50L70 62L64 50Z" stroke="#ffd676" stroke-width="2"/>
  </g>
</svg>`,
  { size: 256 },
);

const PAGE_LINES = Array.from({ length: 9 }, (_, i) => `<path d="M14 ${20 + i * 8}H${86 - (i % 3) * 9}"/>`).join("");
/** A written page: ink lines and a small circle diagram. Opaque parchment. */
const PAGE = svg(
  `<svg viewBox="0 0 100 145" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="145" fill="#f6e8c3"/>
  <rect x="6" y="6" width="88" height="133" fill="none" stroke="#b08a4e" stroke-width="2"/>
  <g stroke="#5b3d8c" stroke-width="1.8" stroke-linecap="round">${PAGE_LINES}</g>
  <circle cx="50" cy="114" r="16" fill="none" stroke="#c2306e" stroke-width="2.2"/>
  <path d="M50 102L60 120H40Z" fill="none" stroke="#2b8a8e" stroke-width="2"/>
</svg>`,
  { size: 512 },
);

/** A broad dried sage leaf with a light midrib. */
const LEAF = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 62C4 46 2 26 20 2C38 26 36 46 20 62Z" fill="#7cbf52" stroke="#24471f" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 58V12" stroke="#d4f59a" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 30L10 22M20 40L31 31M20 48L11 41M20 22L30 14" stroke="#3f8035" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 192 },
);

const SPRIG_FLOWERS = Array.from(
  { length: 7 },
  (_, i) =>
    `<ellipse cx="${i % 2 ? 15 : 9}" cy="${12 + i * 4.2}" rx="3.4" ry="2.2" fill="#a77be6" stroke="#3a2466" stroke-width="1"/>`,
).join("");
/** A lavender-like sprig: a stem, two small leaves and a column of violet flowers. */
const SPRIG = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 63V8" stroke="#4d6b2a" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 58Q4 54 3 46Q10 48 12 56Z" fill="#6fae4a" stroke="#2f5a26" stroke-width="1"/>
  <path d="M12 52Q20 48 21 40Q14 42 12 50Z" fill="#6fae4a" stroke="#2f5a26" stroke-width="1"/>
  ${SPRIG_FLOWERS}
</svg>`,
  { size: 128 },
);

/** A four-point star for the sparkles over the flasks. */
const STAR = svg(
  `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 1L24 16L39 20L24 24L20 39L16 24L1 20L16 16Z" fill="#fff3a0" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="20" cy="20" r="3.4" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

const PANEL_DIAMONDS = (() => {
  let d = "";
  for (let i = 0; i <= 4; i++)
    for (let j = 0; j <= 2; j++) {
      const cx = i * 35 + (j % 2) * 17.5;
      const cy = j * 40;
      d += `M${cx} ${cy - 18}L${cx + 18} ${cy}L${cx} ${cy + 18}L${cx - 18} ${cy}Z`;
    }
  return d;
})();
/** The jade-teal back panel with a gold diamond lattice and a medallion. Opaque. */
const PANEL = svg(
  `<svg viewBox="0 0 140 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="140" height="80" fill="#2f7f83"/>
  <path d="${PANEL_DIAMONDS}" fill="none" stroke="#e8c26a" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="70" cy="40" r="22" fill="#1d5b60" stroke="#ffd676" stroke-width="2.6"/>
  <path d="M70 26L76 40L70 54L64 40Z" fill="#ffd676"/>
</svg>`,
  { size: 512 },
);

// ---------------------------------------------------------------------------------------------------------------
// Paints and colours

const WOOD_L = "#cf9352";
const WOOD_D = "#8a5430";
const TOP_WOOD = cel(grain(WOOD_L, WOOD_D, { size: 0.06, axis: "x", seed: 4 }));
const POST_WOOD = cel(grain(WOOD_L, WOOD_D, { size: 0.05, axis: "y", seed: 8 }));
const DARK_WOOD = cel(grain("#9a5c34", "#5a3118", { size: 0.05, axis: "x", seed: 12 }));
const TURNED = inkLines(POST_WOOD, { levels: [0], axis: [0, 0, 1], width: 0.14 });
const STONE = inkLines(cel("#e6dccb", "#a99c84"), { levels: [0], axis: [0, 1, 0], width: 0.12 });
const GILT = cel("#ffd66b", "#c98a3c");
const BRASS = cel("#eab45a", "#a86f2c");
const TEAL_LEATHER = cel("#2e9196", "#1f5f74");
const CRIMSON = cel("#c4475a", "#7d2440");
const VIOLET_BOOK = cel("#7756cc", "#43307e");
const OCHRE = cel("#d69a3e", "#8d5a22");

const MAGENTA = "#ff3d9a";
const CYAN = "#3fe6ff";
const GOLD_LIQ = "#ffc83d";
const GREEN_LIQ = "#8dff5c";
const VIOLET_LIQ = "#b58cff";
const CORK = "#c58d55";
const TWINE = "#d7b67c";
const STEM = "#5f8a3a";
const INK_POT = "#2d4bb8";
const PAGE_CREAM = "#f6ecd2";
const RIBBON = "#c4475a";

// ---------------------------------------------------------------------------------------------------------------
// Profiles (radius along x, height along y; each closes back to the axis or is a ring)

const LEG: Profile = [
  [0, 0],
  [0.052, 0],
  [0.058, 0.022],
  [0.04, 0.05],
  [0.03, 0.1],
  [0.034, 0.18],
  [0.052, 0.3],
  [0.036, 0.4],
  [0.03, 0.5],
  [0.042, 0.62],
  [0.038, 0.7],
  [0.046, 0.8],
  [0.048, 0.86],
  [0.038, 0.87],
  [0, 0.87],
];
const FLASK: Profile = [
  [0, 0],
  [0.07, 0],
  [0.086, 0.05],
  [0.092, 0.1],
  [0.078, 0.14],
  [0.036, 0.17],
  [0.03, 0.2],
  [0, 0.2],
];
const CONE: Profile = [
  [0, 0],
  [0.07, 0],
  [0.09, 0.08],
  [0.032, 0.19],
  [0.03, 0.25],
  [0, 0.25],
];
const VIAL: Profile = [
  [0, 0],
  [0.04, 0],
  [0.043, 0.012],
  [0.043, 0.2],
  [0.035, 0.232],
  [0.024, 0.25],
  [0, 0.25],
];
const JAR: Profile = [
  [0, 0],
  [0.06, 0],
  [0.075, 0.05],
  [0.079, 0.11],
  [0.07, 0.13],
  [0, 0.13],
];
const LID: Profile = [
  [0, 0],
  [0.074, 0],
  [0.078, 0.018],
  [0, 0.018],
];
const MORTAR: Profile = [
  [0, 0],
  [0.06, 0],
  [0.085, 0.04],
  [0.1, 0.1],
  [0.095, 0.112],
  [0.08, 0.112],
  [0.065, 0.08],
  [0.04, 0.05],
  [0, 0.05],
];
const PASTE: Profile = [
  [0, 0],
  [0.034, 0],
  [0.036, 0.012],
  [0, 0.012],
];
const BALANCE_BASE: Profile = [
  [0, 0],
  [0.085, 0],
  [0.09, 0.012],
  [0.06, 0.03],
  [0, 0.03],
];
const COLUMN: Profile = [
  [0, 0],
  [0.022, 0],
  [0.022, 0.24],
  [0.012, 0.27],
  [0.03, 0.3],
  [0.009, 0.31],
  [0, 0.31],
];
const PAN: Profile = [
  [0, 0],
  [0.074, 0],
  [0.078, 0.012],
  [0, 0.012],
];
const INK_BODY: Profile = [
  [0, 0],
  [0.04, 0],
  [0.045, 0.03],
  [0.036, 0.058],
  [0, 0.058],
];

function scaled(p: Profile, k: number): Profile {
  return p.map(([x, y]) => [x * k, y * k] as [number, number]);
}
/** A cork stopper for a neck of radius `r`. */
function cork(r: number): Profile {
  return [
    [0, 0],
    [r + 0.003, 0],
    [r + 0.004, 0.014],
    [r * 0.9, 0.03],
    [0, 0.03],
  ];
}
/** A closed ring away from the axis (a gilt collar or a rim band). */
function ring(r: number, w: number, h: number): Profile {
  return [
    [r, 0],
    [r + w, 0],
    [r + w, h],
    [r, h],
  ];
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "alchemist-workbench" });
  const bench = b.joint("bench", { at: [0, 0, 0] });
  const on = { bone: bench };

  /** Turns a point on a pose's local frame (x right, y up, z forward) into model space. */
  const lp = (p: Pose, x: number, y: number, z: number): P => {
    const a = p.yaw * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [p.x + x * c + z * s, p.y + y, p.z - x * s + z * c];
  };

  const cube = (size: P, color: Fill, at: P, yaw = 0) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { ...on, at, rotation: [0, yaw, 0] });
  const turn = (profile: Profile, color: Fill, at: P, segments = 12) =>
    b.lathe(profile, { ...on, at, color, segments });
  /** A drawing on a wall-like surface facing +Z. */
  const wall = (size: [number, number], tex: THREE.Texture, at: P) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      ...on,
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture: tex,
    });
  /** A drawing lying flat, facing up, turned `yawDeg` about +Y. */
  const floor = (size: [number, number], tex: THREE.Texture, at: P, yawDeg = 0) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      ...on,
      at,
      quat: flatQuat(yawDeg),
      texture: tex,
    });

  // -------------------------------------------------------------------------------------------------------------
  // Potions: a glowing liquid body, a stopper or lid, a label, a gloss, and sparkles above.

  type Spec = {
    x: number;
    y: number;
    z: number;
    profile: Profile;
    liquid: string;
    neck: number;
    glow?: number;
    collar?: number;
    lid?: boolean;
    label?: { y: number; r: number; size: number };
    stars?: number;
  };

  const potion = (s: Spec) => {
    const top = Math.max(...s.profile.map((q) => q[1]));
    const R = Math.max(...s.profile.map((q) => q[0]));
    const body = glow(turn(s.profile, s.liquid, [s.x, s.y, s.z]), s.glow ?? 1.3);
    if (s.lid) turn(LID, GILT, [s.x, s.y + top, s.z]);
    else turn(cork(s.neck), CORK, [s.x, s.y + top - 0.004, s.z]);
    if (s.collar) turn(ring(s.neck + 0.004, 0.012, 0.014), GILT, [s.x, s.y + s.collar, s.z]);
    if (s.label)
      b.decal(body, LABEL, {
        ...on,
        at: [s.x, s.y + s.label.y, s.z + s.label.r - 0.005],
        dir: [0, 0, 1],
        size: [s.label.size, s.label.size],
      });
    const gloss = b.surface(body).nearest([s.x - R * 0.55, s.y + top * 0.45, s.z + R * 0.8]);
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), "#ffffff", gloss, { embed: 0.3 });
    if (s.stars) {
      const sparks: Frame[] = [];
      for (let i = 0; i < s.stars; i++)
        sparks.push(frame([s.x + (i - (s.stars - 1) / 2) * 0.06, s.y + top + 0.08 + i * 0.03, s.z + 0.02], [0, 1, 0]));
      glow(b.cards(sparks, STAR, { size: 0.035, lean: 0 }), 2.2);
    }
  };

  // -------------------------------------------------------------------------------------------------------------
  // Books

  /** A closed book: boards, a recessed block of pages, a spine, and gold tooling on the top board. */
  const book = (p: Pose, w: number, h: number, d: number, cover: Fill, tooled: boolean) => {
    cube([w, 0.006, d], cover, lp(p, 0, h - 0.003, 0), p.yaw);
    cube([w, 0.006, d], cover, lp(p, 0, 0.003, 0), p.yaw);
    cube([0.012, h, d], cover, lp(p, -w / 2 + 0.006, h / 2, 0), p.yaw);
    cube([w - 0.02, h - 0.012, d - 0.008], PAGE_CREAM, lp(p, 0, h / 2, 0), p.yaw);
    if (tooled) floor([w * 0.72, d * 0.72], COVER, lp(p, 0, h + 0.0015, 0), p.yaw);
  };

  // -------------------------------------------------------------------------------------------------------------
  // Hanging herb bundles from the rail

  const bundle = (x: number, seed: number, leaf: THREE.Texture) => {
    const r = rng(seed);
    const tie: P = [x, 1.6, -0.22];
    b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 8), TWINE, { ...on, at: [x, 1.62, -0.22] });
    const leaves: Frame[] = [];
    const n = 5 + Math.floor(r() * 2);
    for (let k = 0; k < n; k++) {
      const ang = r() * Math.PI * 2;
      const spread = 0.012 + r() * 0.03;
      const len = 0.17 + r() * 0.05;
      const tip: P = [x + Math.cos(ang) * spread, 1.6 - len, -0.22 + Math.sin(ang) * spread];
      const stem = b.rod(tie, tip, 0.0042, STEM, on);
      leaves.push(...b.along(stem, 5, () => {}, { from: 0.3, to: 1 }));
    }
    b.cards(leaves, leaf, {
      size: [0.05, 0.08],
      lean: 38,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      bend: 18,
      vary: 0.25,
      rng: rng(seed + 1),
    });
  };

  // -------------------------------------------------------------------------------------------------------------
  // The frame: four turned legs, the top, aprons, stretchers and a lower shelf

  for (const [x, z] of [
    [-0.69, -0.3],
    [0.69, -0.3],
    [-0.69, 0.3],
    [0.69, 0.3],
  ])
    turn(LEG, TURNED, [x, 0, z], 10);

  cube([1.56, 0.05, 0.72], TOP_WOOD, [0, 0.895, 0]);
  cube([1.5, 0.02, 0.016], GILT, [0, 0.9, 0.358]);
  cube([1.5, 0.02, 0.016], GILT, [0, 0.9, -0.358]);

  cube([1.36, 0.13, 0.03], DARK_WOOD, [0, 0.805, 0.3]);
  cube([1.36, 0.13, 0.03], DARK_WOOD, [0, 0.805, -0.3]);
  cube([0.03, 0.13, 0.6], DARK_WOOD, [-0.69, 0.805, 0]);
  cube([0.03, 0.13, 0.6], DARK_WOOD, [0.69, 0.805, 0]);
  wall([0.3, 0.1], EMBLEM, [0, 0.805, 0.318]);
  for (const x of [-0.6, 0.6])
    b.part(new THREE.SphereGeometry(0.014, 8, 6), GILT, { ...on, at: [x, 0.805, 0.32] });
  for (const x of [-0.42, 0.42])
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8), GILT, {
      ...on,
      at: [x, 0.8, 0.322],
      rotation: [90, 0, 0],
    });

  cube([1.38, 0.04, 0.04], POST_WOOD, [0, 0.2, 0.3]);
  cube([1.38, 0.04, 0.04], POST_WOOD, [0, 0.2, -0.3]);
  cube([0.04, 0.04, 0.6], POST_WOOD, [-0.69, 0.2, 0]);
  cube([0.04, 0.04, 0.6], POST_WOOD, [0.69, 0.2, 0]);
  cube([1.36, 0.03, 0.56], POST_WOOD, [0, 0.36, 0]);

  // Lower shelf: a magenta vial and two closed books.
  potion({
    x: -0.5,
    y: 0.375,
    z: 0.1,
    profile: VIAL,
    liquid: MAGENTA,
    neck: 0.024,
    glow: 1.2,
    label: { y: 0.12, r: 0.042, size: 0.034 },
  });
  book({ x: 0.3, y: 0.375, z: 0.05, yaw: 12 }, 0.2, 0.05, 0.14, VIOLET_BOOK, false);
  book({ x: 0.32, y: 0.425, z: 0.04, yaw: -8 }, 0.19, 0.04, 0.13, TEAL_LEATHER, false);

  // -------------------------------------------------------------------------------------------------------------
  // The back: a jade panel, uprights, a crossbar with finials, a shelf with brackets, and the herb rail

  cube([1.44, 0.8, 0.02], DARK_WOOD, [0, 1.32, -0.33]);
  wall([1.4, 0.8], PANEL, [0, 1.32, -0.316]);
  for (const x of [-0.72, 0.72]) cube([0.07, 0.8, 0.06], TOP_WOOD, [x, 1.32, -0.25]);
  cube([1.56, 0.06, 0.07], TOP_WOOD, [0, 1.72, -0.25]);
  for (const x of [-0.72, 0.72])
    b.part(new THREE.SphereGeometry(0.04, 10, 8), GILT, { ...on, at: [x, 1.78, -0.25] });
  cube([1.44, 0.03, 0.24], TOP_WOOD, [0, 1.3, -0.2]);
  for (const x of [-0.66, 0.66]) cube([0.04, 0.05, 0.2], DARK_WOOD, [x, 1.265, -0.2]);

  b.rod([-0.7, 1.62, -0.22], [0.7, 1.62, -0.22], 0.014, DARK_WOOD, on);
  bundle(-0.56, 11, LEAF);
  bundle(-0.22, 23, SPRIG);
  bundle(0.14, 37, LEAF);
  bundle(0.5, 41, SPRIG);

  // Back shelf: a violet vial, a small green flask and two books.
  potion({
    x: -0.39,
    y: SHELF_Y,
    z: -0.2,
    profile: scaled(VIAL, 0.85),
    liquid: VIOLET_LIQ,
    neck: 0.02,
    glow: 1.4,
    label: { y: 0.1, r: 0.034, size: 0.03 },
    stars: 1,
  });
  potion({
    x: -0.04,
    y: SHELF_Y,
    z: -0.2,
    profile: scaled(FLASK, 0.7),
    liquid: GREEN_LIQ,
    neck: 0.021,
    collar: 0.123,
    glow: 1.4,
    label: { y: 0.07, r: 0.06, size: 0.04 },
  });
  book({ x: 0.36, y: SHELF_Y, z: -0.2, yaw: 6 }, 0.2, 0.05, 0.15, OCHRE, true);
  book({ x: 0.36, y: SHELF_Y + 0.05, z: -0.2, yaw: -4 }, 0.18, 0.04, 0.14, CRIMSON, true);

  // -------------------------------------------------------------------------------------------------------------
  // The bench top

  // Flasks and a jar along the back row.
  potion({
    x: -0.6,
    y: TOP,
    z: -0.2,
    profile: FLASK,
    liquid: MAGENTA,
    neck: 0.03,
    glow: 1.4,
    collar: 0.176,
    label: { y: 0.1, r: 0.09, size: 0.05 },
    stars: 2,
  });
  potion({
    x: -0.34,
    y: TOP,
    z: -0.22,
    profile: CONE,
    liquid: CYAN,
    neck: 0.032,
    glow: 1.5,
    label: { y: 0.05, r: 0.078, size: 0.045 },
    stars: 1,
  });
  potion({
    x: -0.1,
    y: TOP,
    z: -0.2,
    profile: VIAL,
    liquid: GOLD_LIQ,
    neck: 0.024,
    glow: 1.5,
    label: { y: 0.12, r: 0.042, size: 0.034 },
    stars: 1,
  });
  potion({
    x: 0.14,
    y: TOP,
    z: -0.2,
    profile: JAR,
    liquid: GREEN_LIQ,
    neck: 0,
    lid: true,
    glow: 1.3,
    label: { y: 0.065, r: 0.077, size: 0.06 },
    stars: 1,
  });

  // An ink pot with a gilt rim.
  turn(INK_BODY, INK_POT, [0.42, TOP, -0.2]);
  turn(ring(0.04, 0.008, 0.01), GILT, [0.42, TOP + 0.05, -0.2]);

  // The balance scale, front left.
  const SX = -0.42;
  const SZ = 0.08;
  const PAN_Y = BEAM_Y - 0.16;
  turn(BALANCE_BASE, BRASS, [SX, TOP, SZ]);
  turn(COLUMN, BRASS, [SX, TOP + 0.03, SZ]);
  b.part(new THREE.SphereGeometry(0.022, 10, 8), GILT, { ...on, at: [SX, 1.26, SZ] });
  b.rod([SX - 0.17, BEAM_Y, SZ], [SX + 0.17, BEAM_Y, SZ], 0.008, BRASS, on);
  for (const side of [-1, 1]) {
    const px = SX + side * 0.17;
    b.part(new THREE.SphereGeometry(0.012, 8, 6), GILT, { ...on, at: [px, BEAM_Y, SZ] });
    turn(PAN, BRASS, [px, PAN_Y, SZ]);
    for (let k = 0; k < 3; k++) {
      const ang = k * 120 * DEG + (side > 0 ? 60 * DEG : 0);
      const rim: P = [px + Math.cos(ang) * 0.07, PAN_Y + 0.012, SZ + Math.sin(ang) * 0.07];
      b.rod([px, BEAM_Y, SZ], rim, 0.003, BRASS, on);
    }
  }
  for (let k = 0; k < 3; k++)
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), GILT, {
      ...on,
      at: [SX - 0.17, PAN_Y + 0.015 + k * 0.006, SZ],
    });
  glow(
    b.part(new THREE.OctahedronGeometry(0.02), CYAN, { ...on, at: [SX + 0.17, PAN_Y + 0.035, SZ] }),
    1.6,
  );

  // The mortar and pestle, front centre, with glowing paste.
  const MX = 0.18;
  const MZ = 0.14;
  turn(MORTAR, STONE, [MX, TOP, MZ], 14);
  glow(turn(PASTE, GREEN_LIQ, [MX, TOP + 0.052, MZ]), 1.2);
  b.capsule([MX - 0.02, TOP + 0.075, MZ - 0.01], [MX + 0.07, TOP + 0.13, MZ + 0.05], [0.018, 0.012], STONE, on);

  // The open book, front right, with a ribbon over the edge.
  const OPEN: Pose = { x: 0.5, y: TOP, z: 0.07, yaw: 12 };
  cube([0.165, 0.012, 0.22], TEAL_LEATHER, lp(OPEN, -0.086, 0.006, 0), OPEN.yaw);
  cube([0.165, 0.012, 0.22], TEAL_LEATHER, lp(OPEN, 0.086, 0.006, 0), OPEN.yaw);
  cube([0.15, 0.012, 0.2], PAGE_CREAM, lp(OPEN, -0.082, 0.018, 0), OPEN.yaw);
  cube([0.15, 0.012, 0.2], PAGE_CREAM, lp(OPEN, 0.082, 0.018, 0), OPEN.yaw);
  floor([0.14, 0.19], PAGE, lp(OPEN, -0.082, 0.0255, 0), OPEN.yaw);
  floor([0.14, 0.19], PAGE, lp(OPEN, 0.082, 0.0255, 0), OPEN.yaw);
  cube([0.012, 0.002, 0.12], RIBBON, lp(OPEN, 0.05, 0.027, 0.07), OPEN.yaw);

  // The stacked books, back right.
  book({ x: 0.62, y: TOP, z: -0.2, yaw: 4 }, 0.17, 0.035, 0.12, CRIMSON, true);
  book({ x: 0.62, y: TOP + 0.035, z: -0.2, yaw: -6 }, 0.16, 0.03, 0.115, TEAL_LEATHER, true);
  book({ x: 0.62, y: TOP + 0.065, z: -0.2, yaw: 10 }, 0.165, 0.04, 0.125, OCHRE, true);

  // Loose herbs across the front left corner.
  const sprig: P[] = [
    [-0.22, TOP + 0.005, 0.27],
    [-0.12, TOP + 0.006, 0.3],
    [-0.02, TOP + 0.005, 0.285],
  ];
  b.sweep(catmull(sprig), 0.0035, { ...on, color: STEM });
  const lying: Frame[] = [
    [-0.2, 0.28],
    [-0.14, 0.295],
    [-0.07, 0.29],
    [-0.02, 0.27],
  ].map(([x, z]) => frame([x, TOP + 0.008, z], [0, 1, 0]));
  b.cards(lying, LEAF, {
    size: [0.045, 0.07],
    lean: 90,
    flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)],
    vary: 0.2,
    rng: rng(7),
  });

  return b.root;
}
```
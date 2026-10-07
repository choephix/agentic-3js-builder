import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame, type Frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { grain, mottle } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { cel, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cluttered alchemist's workbench: glowing round and conical flasks, a brass balance scale, an open spellbook with a scroll, a stone mortar under a floating crystal, herb pots, a stacked tome pile, a back shelf of jars and potions, hanging herb bundles, gold filigree and tassels.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type V = [number, number, number];
type Fill = string | Paint;
type Outline = OutlinePoint[];

// Palette: cel-shaded lit / hue-shifted shadow pairs (kits/toon) and flat glow colours (kits/glow).
const WOOD = cel(grain("#d69456", "#b06a40", { size: 0.04, axis: "x" }), "#7d4433");
const WOOD_DARK = cel(grain("#9a5a3a", "#744029", { size: 0.03, axis: "x" }), "#5a2f2a");
const GOLD = cel("#ffd66b", "#d6923f");
const IVORY = cel("#fff3d6", "#f0cf9e");
const GLASS = cel("#e6fbff", "#9ccde6");
const STONE = cel(mottle("#c9c2dc", "#a39cb8", { size: 0.1 }), "#7f7898");
const CLAY = cel("#eb9466", "#b8603e");
const PLUM = cel("#8a5cd0", "#5b3495");
const TEAL = cel("#34cdb8", "#1f8f8a");
const CRIMSON = cel("#e4506a", "#a72d46");
const CORK = cel("#d9a46a", "#a06a3e");
const LEAF_CEL = cel("#5fd47a", "#2f9a55");
const G_TEAL = "#5ef2e0";
const G_PINK = "#ff7ad9";
const G_GOLD = "#ffd66b";
const G_VIOLET = "#b48cff";
const G_LIME = "#a6ff8a";

// Outlines. Each bulb is a solid liquid lathe (a glowing potion); the glass is only the neck ring and lip.
const ROUND_GLASS: Outline = [
  [0, 0.165],
  [0.04, 0.165],
  [0.04, 0.19],
  [0.05, 0.23],
  [0.03, 0.23],
  [0.028, 0.19],
  [0.028, 0.17],
  [0, 0.17],
];
const ROUND_LIQ: Outline = [
  [0, 0],
  [0.09, 0],
  [0.1, 0.05],
  [0.1, 0.1],
  [0.06, 0.15],
  [0.04, 0.17],
  [0, 0.17],
];
const CONICAL_GLASS: Outline = [
  [0, 0.195],
  [0.038, 0.195],
  [0.04, 0.2],
  [0.05, 0.25],
  [0.03, 0.25],
  [0.028, 0.2],
  [0, 0.2],
];
const CONICAL_LIQ: Outline = [
  [0, 0],
  [0.095, 0],
  [0.04, 0.2],
  [0, 0.2],
];
const MORTAR: Outline = [
  [0, 0],
  [0.09, 0],
  [0.12, 0.07],
  [0.135, 0.12],
  [0.13, 0.135],
  [0.115, 0.135],
  [0.105, 0.12],
  [0.085, 0.05],
  [0, 0.05],
];
const POT: Outline = [
  [0, 0],
  [0.06, 0],
  [0.085, 0.05],
  [0.1, 0.12],
  [0.105, 0.15],
  [0.08, 0.15],
  [0.08, 0.13],
  [0, 0.13],
];
const JAR: Outline = [
  [0, 0],
  [0.05, 0],
  [0.06, 0.03],
  [0.06, 0.1],
  [0.04, 0.12],
  [0.04, 0.14],
  [0, 0.14],
];
const INK_POT: Outline = [
  [0, 0],
  [0.045, 0],
  [0.05, 0.03],
  [0.05, 0.07],
  [0.035, 0.08],
  [0, 0.08],
];
const PAN: Outline = [
  [0, 0],
  [0.085, 0],
  [0.095, 0.02],
  [0.09, 0.03],
  [0, 0.02],
];
const FEATHER: Outline = [
  [0, 0],
  [0.02, 0.06],
  [0.012, 0.14],
  [0, 0.17],
  [-0.012, 0.12],
  [-0.004, 0.04],
];

// Textures: SVG drawings carry the fine detail (gold filigree, herbs, runes, tassels, sign).
const FILIGREE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffd66b" stroke-width="2.6" stroke-linecap="round">
<path d="M4 32 C4 14 22 12 26 26 C29 36 18 40 16 30 C14 22 24 20 26 28"/>
<path d="M60 32 C60 14 42 12 38 26 C35 36 46 40 48 30 C50 22 40 20 38 28"/>
<path d="M32 4 C40 4 44 12 32 16 C20 20 24 28 32 28"/>
<path d="M32 60 C24 60 20 52 32 48 C44 44 40 36 32 36"/>
<circle cx="32" cy="32" r="5"/></g></svg>`,
  { size: 256 },
);
const LEAF = svg(
  `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 1 C29 16 30 42 16 63 C2 42 3 16 16 1Z" fill="#5fd47a"/>
<path d="M16 6 L16 58" stroke="#2f9a55" stroke-width="2" fill="none"/>
<path d="M16 22 L24 16 M16 34 L8 28 M16 44 L24 38" stroke="#2f9a55" stroke-width="1.6" fill="none"/></svg>`,
  { size: 128 },
);
const SPRIG = svg(
  `<svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="16" width="2" height="24" fill="#3e9a5a"/>
<circle cx="16" cy="8" r="6" fill="#b48cff"/><circle cx="9" cy="16" r="5" fill="#c9a6ff"/><circle cx="23" cy="16" r="5" fill="#9b72ff"/>
<circle cx="16" cy="6" r="2" fill="#fff3d6"/></svg>`,
  { size: 128 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 16 48" xmlns="http://www.w3.org/2000/svg"><path d="M8 0 L8 14" stroke="#ffd66b" stroke-width="2"/>
<path d="M3 14 L13 14 L12 20 L4 20Z" fill="#ffd66b"/>
<path d="M5 20 L4 48 M8 20 L8 48 M11 20 L12 48" stroke="#e4506a" stroke-width="2"/></svg>`,
  { size: 128 },
);
const RUG = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="98" height="58" rx="3" fill="#7a3f9e"/>
<rect x="4" y="4" width="92" height="52" fill="none" stroke="#ffd66b" stroke-width="2"/>
<rect x="8" y="8" width="84" height="44" fill="none" stroke="#b48cff" stroke-width="1"/>
<g fill="#ffd66b"><path d="M12 30 L16 26 L20 30 L16 34Z"/><path d="M88 30 L84 26 L80 30 L84 34Z"/>
<path d="M50 4 L54 8 L50 12 L46 8Z"/><path d="M50 56 L54 52 L50 48 L46 52Z"/></g>
<path d="M24 14 Q36 22 24 30 Q12 38 24 46" fill="none" stroke="#5ef2e0" stroke-width="1"/>
<path d="M76 14 Q64 22 76 30 Q88 38 76 46" fill="none" stroke="#5ef2e0" stroke-width="1"/></svg>`,
  { size: 512 },
);
const RUNE_GLOW = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="44" fill="none" stroke="#ffd66b" stroke-width="2.4"/>
<circle cx="50" cy="50" r="36" fill="none" stroke="#5ef2e0" stroke-width="1.6"/>
<path d="M50 18 L76 66 L24 66 Z" fill="none" stroke="#5ef2e0" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M50 6 L50 12 M50 88 L50 94 M6 50 L12 50 M88 50 L94 50" stroke="#ffd66b" stroke-width="2"/>
<circle cx="50" cy="50" r="5" fill="#ff7ad9"/></svg>`,
  { size: 256 },
);
const MEDAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#ffd66b"/>
<circle cx="50" cy="50" r="38" fill="#34cdb8"/>
<circle cx="50" cy="50" r="31" fill="none" stroke="#fff3d6" stroke-width="2"/>
<path d="M50 24 L70 62 L30 62 Z" fill="none" stroke="#fff3d6" stroke-width="3" stroke-linejoin="round"/>
<circle cx="50" cy="52" r="5" fill="#ff7ad9"/></svg>`,
  { size: 256 },
);
const PAGE = svg(
  `<svg viewBox="0 0 34 20" xmlns="http://www.w3.org/2000/svg"><rect width="34" height="20" fill="#fff3d6"/>
<g stroke="#7a4fb8" stroke-width="0.9" stroke-linecap="round">
<path d="M3 4 H14 M3 7 H13 M3 10 H14 M3 13 H12 M3 16 H14"/>
<path d="M20 4 H31 M20 7 H30 M20 10 H31 M20 13 H29 M20 16 H31"/></g>
<circle cx="17" cy="10" r="2.2" fill="none" stroke="#e4506a" stroke-width="0.8"/></svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="62" height="38" rx="4" fill="#34cdb8"/>
<rect x="4" y="4" width="56" height="32" fill="none" stroke="#ffd66b" stroke-width="2"/>
<path d="M32 9 L41 31 L23 31Z" fill="none" stroke="#fff3d6" stroke-width="2"/>
<circle cx="32" cy="22" r="3" fill="#ff7ad9"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const root = b.joint("bench", { at: [0, 0, 0] });

  // Moving parts: the scale beam, the cabinet door and a hanging sign.
  const beamJ = b.joint("scaleBeam", { parent: root, at: [0, 1.38, -0.05], dir: [1, 0, 0], role: "hinge" });
  const doorJ = b.joint("cabinetDoor", { parent: root, at: [-0.86, 0.45, 0.335], dir: [0, 1, 0], role: "hinge" });
  const signJ = b.joint("hangingSign", { parent: root, at: [0.7, 1.68, -0.08], dir: [0, -1, 0], role: "hinge" });

  const box = (size: V, at: V, color: Fill, bone = root, rotation: V = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone, at, rotation });
  const cyl = (rt: number, rb: number, h: number, at: V, color: Fill, rotation: V = [0, 0, 0], bone = root) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, 14), color, { bone, at, rotation });
  const ball = (r: number, at: V, color: Fill, bone = root, scale: V = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { bone, at, scale });
  const turned = (pts: Outline, at: V, color: Fill, bone = root) => b.lathe(pts, { at, bone, color, segments: 12 });
  const rod = (a: V, c: V, r: number, color: Fill, bone = root) => b.rod(a, c, r, { color, bone });

  // A round or conical flask: hollow glass, a glowing liquid inside, a cork in the neck.
  const flask = (at: V, s: number, liquid: string, glass = ROUND_GLASS, liq = ROUND_LIQ) => {
    const neckTop = Math.max(...glass.map((p) => p[1])) * s;
    turned(glass.map((p) => [p[0] * s, p[1] * s] as OutlinePoint), at, GLASS);
    glow(turned(liq.map((p) => [p[0] * s, p[1] * s] as OutlinePoint), at, liquid));
    cyl(0.034 * s, 0.034 * s, 0.03 * s, [at[0], at[1] + neckTop - 0.01 * s, at[2]], CORK);
  };
  // A solid stoneware jar with a gold lid.
  const jar = (at: V, color: Fill) => {
    turned(JAR, at, color);
    cyl(0.046, 0.046, 0.02, [at[0], at[1] + 0.15, at[2]], GOLD);
  };
  // A stacked book: cover, cream page block on the fore-edge, gold clasp.
  const book = (x: number, y: number, z: number, w: number, t: number, h: number, cover: Fill) => {
    box([w, t, h], [x, y + t / 2, z], cover);
    box([w * 0.96, t * 0.7, 0.01], [x, y + t / 2, z + h / 2 + 0.004], IVORY);
    box([w * 0.2, t * 1.02, 0.012], [x + w * 0.3, y + t / 2, z + h / 2 + 0.006], GOLD);
  };
  // Leaves or sprigs standing out of a pot top.
  const bush = (x: number, y: number, z: number, n: number, seed: number, tex: THREE.Texture) => {
    const r = rng(seed);
    const fr: Frame[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.5;
      const sp = 0.3 + r() * 0.4;
      fr.push(frame([x + Math.cos(a) * 0.03, y, z + Math.sin(a) * 0.03], [Math.cos(a) * sp, 1, Math.sin(a) * sp]));
    }
    b.cards(fr, tex, { size: [0.06, 0.13], lean: 8, vary: 0.25, rng: rng(seed + 1), bone: root });
  };

  // ---- Bench body -------------------------------------------------------
  box([1.94, 0.06, 0.78], [0, 0.89, 0], WOOD); // top
  rod([-0.96, 0.875, 0.4], [0.96, 0.875, 0.4], 0.01, GOLD); // gold front trim
  ball(0.016, [-0.96, 0.89, 0.4], GOLD);
  ball(0.016, [0.96, 0.89, 0.4], GOLD);
  for (const s of [1, -1]) {
    for (const z of [0.3, -0.3]) {
      box([0.08, 0.86, 0.08], [s * 0.88, 0.43, z], WOOD_DARK); // legs
      box([0.12, 0.04, 0.12], [s * 0.88, 0.02, z], GOLD); // gold feet
    }
    box([0.05, 0.06, 0.6], [s * 0.88, 0.22, 0], WOOD); // side stretchers
  }
  for (const z of [0.3, -0.3]) box([1.84, 0.06, 0.05], [0, 0.22, z], WOOD); // rails
  // Tassels hanging from the front trim.
  const tassels: Frame[] = [];
  for (const x of [-0.8, -0.5, -0.2, 0.1, 0.4, 0.7]) tassels.push(frame([x, 0.85, 0.4], [0, 1, 0]));
  b.cards(tassels, TASSEL, { size: [0.035, 0.12], lean: 180, flow: [0, 0, 1], bone: root });

  // Left cabinet with a hinged door carrying a filigree plate.
  box([0.42, 0.46, 0.6], [-0.66, 0.65, 0], WOOD_DARK);
  box([0.4, 0.4, 0.02], [-0.66, 0.65, 0.335], WOOD, doorJ);
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    bone: doorJ,
    at: [-0.66, 0.65, 0.347],
    dir: [0, 0, 1],
    axis: "z",
    texture: FILIGREE,
  });
  ball(0.014, [-0.5, 0.65, 0.36], GOLD, doorJ);

  // Right drawer block with two drawers and gold pulls.
  box([0.82, 0.2, 0.62], [0.45, 0.78, 0], WOOD_DARK);
  for (const x of [0.25, 0.66]) {
    box([0.38, 0.15, 0.02], [x, 0.78, 0.325], WOOD);
    ball(0.014, [x, 0.78, 0.345], GOLD);
    box([0.08, 0.025, 0.006], [x, 0.84, 0.337], GOLD);
  }

  // Glowing rune circle laid on the rug centre (self-lit, so it reads in any light).
  glow(b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", { bone: root, at: [0, 0.008, 0.1], dir: [0, 1, 0], axis: "z", texture: RUNE_GLOW }));

  // Woven rug on the floor.
  b.part(new THREE.PlaneGeometry(1.9, 1.14), "#ffffff", {
    bone: root,
    at: [0, 0.004, 0.1],
    dir: [0, 1, 0],
    axis: "z",
    texture: RUG,
  });

  // ---- Balance scale ----------------------------------------------------
  turned(
    [
      [0, 0],
      [0.09, 0],
      [0.1, 0.02],
      [0.06, 0.035],
      [0, 0.035],
    ],
    [0, 0.92, -0.05],
    GOLD,
  );
  cyl(0.018, 0.018, 0.425, [0, 1.1675, -0.05], GOLD);
  ball(0.026, [0, 1.38, -0.05], GOLD, beamJ);
  rod([-0.22, 1.38, -0.05], [0.22, 1.38, -0.05], 0.012, GOLD, beamJ);
  for (const s of [1, -1]) {
    const ex = s * 0.22;
    ball(0.02, [ex, 1.38, -0.05], GOLD, beamJ);
    rod([ex, 1.38, -0.05], [ex, 1.1, -0.13], 0.004, GOLD, beamJ);
    rod([ex, 1.38, -0.05], [ex, 1.1, 0.03], 0.004, GOLD, beamJ);
    turned(PAN, [ex, 1.1, -0.05], GOLD, beamJ);
  }
  glow(ball(0.024, [0.22, 1.13, -0.05], G_GOLD, beamJ, [1, 1.4, 1]));
  ball(0.03, [-0.22, 1.135, -0.05], LEAF_CEL, beamJ);

  // ---- Left work area ---------------------------------------------------
  flask([-0.72, 0.92, 0.04], 1.0, G_TEAL);
  flask([-0.5, 0.92, -0.12], 0.9, G_PINK, CONICAL_GLASS, CONICAL_LIQ);
  flask([-0.86, 0.92, 0.27], 0.5, G_GOLD);
  flask([-0.74, 0.92, 0.28], 0.5, G_LIME);
  flask([-0.62, 0.92, 0.27], 0.5, G_VIOLET);

  // Stacked tomes at the back left.
  book(-0.8, 0.92, -0.2, 0.22, 0.04, 0.16, PLUM);
  book(-0.8, 0.96, -0.2, 0.2, 0.03, 0.15, TEAL);
  book(-0.81, 0.99, -0.2, 0.16, 0.035, 0.14, CRIMSON);
  // A tome pile beside the scale.
  book(0.3, 0.92, -0.22, 0.2, 0.04, 0.15, CRIMSON);
  book(0.31, 0.96, -0.22, 0.18, 0.03, 0.14, PLUM);

  // Open spellbook on the front centre.
  box([0.38, 0.02, 0.26], [-0.145, 0.93, 0.2], PLUM);
  box([0.16, 0.012, 0.22], [-0.235, 0.945, 0.2], IVORY);
  box([0.16, 0.012, 0.22], [-0.055, 0.945, 0.2], IVORY);
  b.part(new THREE.PlaneGeometry(0.34, 0.2), "#ffffff", {
    bone: root,
    at: [-0.145, 0.956, 0.2],
    dir: [0, 1, 0],
    axis: "z",
    texture: PAGE,
  });

  // Rolled scroll at the back.
  b.capsule([-0.33, 0.945, -0.22], [-0.25, 0.945, -0.22], 0.024, { color: IVORY, bone: root });
  cyl(0.026, 0.026, 0.01, [-0.33, 0.945, -0.22], GOLD, [0, 0, 90]);
  cyl(0.026, 0.026, 0.01, [-0.25, 0.945, -0.22], GOLD, [0, 0, 90]);

  // Ink pot and quill.
  turned(INK_POT, [0.12, 0.92, 0.22], PLUM);
  turned(
    [
      [0, 0],
      [0.03, 0],
      [0.03, 0.004],
      [0, 0.004],
    ],
    [0.12, 0.996, 0.22],
    INK,
  );
  rod([0.12, 0.98, 0.22], [0.2, 1.14, 0.26], 0.004, IVORY);
  b.extrude(FEATHER, { at: [0.2, 1.14, 0.26], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: IVORY, bone: root });

  // ---- Centre right: mortar, crystal, alembic, herbs, candle -----------
  turned(MORTAR, [0.5, 0.92, 0.05], STONE);
  b.capsule([0.52, 0.95, 0.04], [0.56, 1.12, 0.07], 0.025, { color: WOOD, bone: root });
  glow(b.part(new THREE.OctahedronGeometry(0.05), G_PINK, { bone: root, at: [0.5, 1.26, 0.05], scale: [0.8, 1.4, 0.8] }));
  b.part(new THREE.TorusGeometry(0.1, 0.007, 6, 20), GOLD, { bone: root, at: [0.5, 1.26, 0.05], rotation: [90, 0, 0] });
  glow(ball(0.014, [0.6, 1.3, 0.05], G_VIOLET));

  flask([0.66, 0.92, -0.2], 1.0, G_GOLD);
  flask([0.86, 0.92, -0.2], 0.6, G_VIOLET);
  b.sweep(
    catmull([
      [0.66, 1.17, -0.2],
      [0.7, 1.27, -0.2],
      [0.8, 1.25, -0.2],
      [0.86, 1.09, -0.2],
    ]),
    0.011,
    { color: GOLD, bone: root },
  );

  turned(POT, [0.8, 0.92, 0.22], CLAY);
  cyl(0.075, 0.075, 0.02, [0.8, 1.045, 0.22], WOOD_DARK);
  bush(0.8, 1.05, 0.22, 14, 21, LEAF);
  bush(0.8, 1.05, 0.22, 5, 33, SPRIG);

  cyl(0.022, 0.022, 0.12, [0.9, 0.98, 0.02], IVORY);
  glow(ball(0.016, [0.9, 1.07, 0.02], G_GOLD, root, [1, 1.8, 1]));

  // ---- Back wall: panel, crown, three shelves ---------------------------
  box([1.9, 1.0, 0.04], [0, 1.42, -0.36], WOOD_DARK);
  box([1.98, 0.06, 0.08], [0, 1.94, -0.34], GOLD);
  for (const y of [1.14, 1.42, 1.7]) {
    box([1.8, 0.035, 0.26], [0, y, -0.22], WOOD);
    rod([-0.9, y, -0.088], [0.9, y, -0.088], 0.008, GOLD);
  }

  // Shelf 1: jars and small flasks.
  const s1 = 1.1575;
  flask([-0.7, s1, -0.2], 0.6, G_LIME);
  jar([-0.56, s1, -0.2], CLAY);
  flask([-0.42, s1, -0.2], 0.5, G_PINK);
  jar([-0.3, s1, -0.2], PLUM);
  flask([-0.16, s1, -0.2], 0.7, G_TEAL);
  jar([0.55, s1, -0.2], CLAY);
  jar([0.68, s1, -0.2], TEAL);

  // Shelf 2: books, a crystal, a potted sprig.
  const s2 = 1.4375;
  book(-0.7, s2, -0.2, 0.22, 0.04, 0.16, PLUM);
  book(-0.7, s2 + 0.04, -0.2, 0.2, 0.03, 0.15, TEAL);
  book(0.1, s2, -0.2, 0.18, 0.05, 0.15, CRIMSON);
  glow(ball(0.04, [0.45, s2 + 0.05, -0.2], G_VIOLET));
  turned(JAR, [0.62, s2, -0.2], CLAY);
  bush(0.62, s2 + 0.14, -0.2, 6, 45, SPRIG);

  // Shelf 3: jars, and herb bundles hanging from its front lip.
  const s3 = 1.7175;
  jar([-0.6, s3, -0.2], WOOD_DARK);
  jar([-0.45, s3, -0.2], CLAY);
  jar([-0.3, s3, -0.2], TEAL);
  // Herb bundles hanging from the shelf-3 lip, each with a gold tie.
  for (const x of [-0.5, -0.25, 0.0, 0.25]) {
    const hangs: Frame[] = [];
    for (let i = 0; i < 4; i++) hangs.push(frame([x + (i - 1.5) * 0.014, s3, -0.1 + (i % 2) * 0.012], [0, 1, 0]));
    b.cards(hangs, LEAF, { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1], bone: root });
    b.part(new THREE.TorusGeometry(0.02, 0.005, 6, 10), GOLD, { bone: root, at: [x, s3 - 0.03, -0.1], rotation: [90, 0, 0] });
  }

  // Glowing medallion on the back panel.
  glow(b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: root, at: [0, 1.8, -0.335], dir: [0, 0, 1], axis: "z", texture: MEDAL }));

  // Hanging sign on a hinge.
  for (const dx of [-0.09, 0.09]) rod([0.7 + dx, 1.68, -0.08], [0.7 + dx, 1.62, -0.07], 0.004, GOLD, signJ);
  b.part(new THREE.PlaneGeometry(0.22, 0.14), "#ffffff", {
    bone: signJ,
    at: [0.7, 1.55, -0.07],
    dir: [0, 0, 1],
    axis: "z",
    texture: SIGN,
  });

  // Back of the wall panel: vertical battens and cross-braces, so the rear reads as built.
  for (const x of [-0.7, -0.25, 0.25, 0.7]) box([0.09, 1.0, 0.03], [x, 1.42, -0.39], WOOD);
  box([1.8, 0.07, 0.03], [0, 1.2, -0.39], WOOD_DARK);
  box([1.8, 0.07, 0.03], [0, 1.66, -0.39], WOOD_DARK);
  for (const x of [-0.7, 0.7]) ball(0.02, [x, 1.2, -0.41], GOLD);
  for (const x of [-0.7, 0.7]) ball(0.02, [x, 1.66, -0.41], GOLD);

  // Floor clutter: a herb basket with a gold band, and a potion beside it.
  turned(
    [
      [0, 0],
      [0.14, 0],
      [0.17, 0.2],
      [0.175, 0.23],
      [0.155, 0.23],
      [0.15, 0.2],
      [0.12, 0.05],
      [0, 0.05],
    ],
    [0.7, 0, 0.6],
    WOOD,
  );
  b.part(new THREE.TorusGeometry(0.165, 0.008, 6, 20), GOLD, { bone: root, at: [0.7, 0.1, 0.6], rotation: [90, 0, 0] });
  bush(0.7, 0.2, 0.6, 9, 77, LEAF);
  flask([0.5, 0, 0.66], 0.5, G_LIME);

  // Glowing shards by the mortar.
  const shards: [number, number, string][] = [
    [0.36, 0.2, G_TEAL],
    [0.38, 0.27, G_PINK],
    [0.33, 0.27, G_GOLD],
  ];
  for (const [x, z, c] of shards) {
    glow(b.part(new THREE.OctahedronGeometry(0.02), c, { bone: root, at: [x, 0.94, z], rotation: [20, 0, 35] }));
  }

  // Gold edge trims on the back panel, scrolls on shelf 2, drawer labels.
  for (const x of [-0.93, 0.93]) rod([x, 0.94, -0.33], [x, 1.9, -0.33], 0.01, GOLD);
  for (const z of [-0.26, -0.17]) b.capsule([0.28, s2 + 0.03, z], [0.38, s2 + 0.03, z], 0.02, { color: IVORY, bone: root });
  for (const x of [0.25, 0.66]) box([0.12, 0.05, 0.005], [x, 0.74, 0.337], IVORY);

  return b.root;
}

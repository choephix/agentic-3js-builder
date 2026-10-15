import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { rng } from "../../../../src/math";
import { grain, mottle, paint, scales, stripes } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lantern Shrine",
  description:
    "Roadside hokora shrine with a vermilion torii, paired stone lanterns, kitsune guardians, sake and fruit offerings, ema rack and a sakura, in cel-shaded Genshin Impact style with glowing paper lanterns and a rune circle.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type N3 = [number, number, number];

// ---------- palette ----------
const VERM = cel("#e63f2a");
const VERM_D = cel("#b92a25");
const WOOD = cel(grain("#b9824c", "#a06c3d", { size: 0.04, axis: "y" }));
const WOOD_L = cel(grain("#d9a870", "#c8955c", { size: 0.04, axis: "x" }));
const DARK = cel("#40303f");
const CREAM = cel("#fff2d6", "#e9cfa8");
const GOLD = cel("#ffcf4a", "#d9962a");
const STONE = cel(mottle("#cfcbc2", "#b4bea4", { size: 0.22, seed: 3 }), "#8e93a3");
const STONE_D = cel(mottle("#b3b0aa", "#98a38f", { size: 0.2, seed: 5 }), "#7a7f92");
const FLAG = cel(scales("#cdc9c0", "#8f8d92", { size: 0.22, seed: 2 }), "#8e93a3");
const ROOF = cel(stripes("#2f8f93", "#1f6f7d", { size: 0.07, axis: "x" }), "#1f5d78");
const MOSS = cel(mottle("#6fae52", "#4f8f46", { size: 0.18, seed: 8 }));
const SAKURA1 = cel("#ffc3d8", "#e598c4");
const SAKURA2 = cel("#ffa9c9", "#dd88b8");
const SAKURA3 = cel("#ffe0ea", "#f1b9d6");
const BARK = cel(grain("#7a5242", "#583a45", { size: 0.04, axis: "y" }));
const LEAF1 = cel("#7bc15a", "#3f9a5c");
const LEAF2 = cel("#58a84c", "#2f8856");
const HYD1 = cel("#9db8ff", "#7a8ee0");
const HYD2 = cel("#c9a6ff", "#9a7fe0");
const RICE = cel("#fffaf0", "#e5dcea");
const ORANGE = cel("#ff9a2e", "#e0602a");
const BRONZE = cel("#c28a43", "#8a5a3a");
const SAKE = cel("#9fe0d6", "#6cb7c4");
const ROPE = cel(
  paint((_p, _n, s) => ((((s[1] - 720 * s[0]) % 90) + 90) % 90 < 40 ? "#fff2d6" : "#d9b97a")),
  "#a98a62",
);
const PAPER = cel("#ffffff", "#d8dcf5");
const RED_ROPE = cel(
  paint((_p, _n, s) => ((((s[1] - 900 * s[0]) % 90) + 90) % 90 < 45 ? "#e63f2a" : "#fff2d6")),
  "#a43030",
);
const LAMP = "#ff8a3d";
const LAMP2 = "#ffc65c";
const FLAME = "#ffd86b";
const CYAN = "#7ffff0";
const GOLD_FLAT = "#ffcf4a";

// ---------- drawings ----------
const PLAQUE = svg(
  `<svg viewBox="0 0 100 80"><rect x="2" y="2" width="96" height="76" rx="6" fill="#40303f"/>
  <rect x="7" y="7" width="86" height="66" rx="4" fill="none" stroke="#ffcf4a" stroke-width="3"/>
  <circle cx="50" cy="40" r="19" fill="none" stroke="#ffcf4a" stroke-width="4"/>
  <path d="M50 18 L50 62 M31 40 L69 40 M36 26 L64 54 M64 26 L36 54" stroke="#ffcf4a" stroke-width="3" fill="none"/>
  <circle cx="50" cy="40" r="6" fill="#e63f2a"/></svg>`,
  { size: 256 },
);
const DOOR = svg(
  `<svg viewBox="0 0 40 64"><rect width="40" height="64" fill="#c8382a"/>
  <rect x="2" y="2" width="36" height="60" fill="none" stroke="#ffcf4a" stroke-width="2"/>
  <g stroke="#f5b84a" stroke-width="1.4" fill="none">
  <path d="M8 6V40M14 6V40M20 6V40M26 6V40M32 6V40M5 12H35M5 20H35M5 28H35M5 36H35"/></g>
  <rect x="5" y="42" width="30" height="17" fill="#a82a24" stroke="#ffcf4a" stroke-width="1.2"/>
  <circle cx="20" cy="50.5" r="5" fill="none" stroke="#ffcf4a" stroke-width="1.6"/>
  <circle cx="20" cy="50.5" r="1.6" fill="#ffcf4a"/>
  <circle cx="4" cy="4" r="1.6" fill="#ffcf4a"/><circle cx="36" cy="4" r="1.6" fill="#ffcf4a"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 40 30"><rect width="40" height="30" rx="2" fill="#fff6e0"/>
  <rect x="0" y="0" width="40" height="5" fill="#e63f2a"/><rect x="0" y="25" width="40" height="5" fill="#e63f2a"/>
  <circle cx="20" cy="15" r="7.5" fill="none" stroke="#40303f" stroke-width="2"/>
  <path d="M20 8V22M13 15H27" stroke="#40303f" stroke-width="2"/></svg>`,
  { size: 128 },
);
const RUNE = svg(
  `<svg viewBox="0 0 200 200" fill="none" stroke="#7ffff0" stroke-width="2.4">
  <circle cx="100" cy="100" r="96"/><circle cx="100" cy="100" r="86" stroke-width="1.4"/>
  <circle cx="100" cy="100" r="58"/><path d="M100 42L142 130L58 130Z" stroke-width="2"/>
  <path d="M100 158L58 70L142 70Z" stroke-width="2"/>
  <g stroke-width="3"><path d="M100 6V14M100 186V194M6 100H14M186 100H194M33 33L39 39M167 33L161 39M33 167L39 161M167 167L161 161"/></g>
  <circle cx="100" cy="100" r="9" fill="#7ffff0"/></svg>`,
  { size: 512 },
);
function ema(kind: number) {
  const pics = [
    `<circle cx="30" cy="31" r="9" fill="#ff8fb4"/><path d="M30 20V42M19 31H41" stroke="#fff" stroke-width="3"/>`,
    `<path d="M14 40L22 20L30 32L38 20L46 40Z" fill="#e8742a" stroke="#40303f" stroke-width="2"/><circle cx="25" cy="34" r="1.8" fill="#40303f"/><circle cx="35" cy="34" r="1.8" fill="#40303f"/>`,
    `<path d="M30 18L34 28L45 28L36 35L40 46L30 39L20 46L24 35L15 28L26 28Z" fill="#ffcf4a" stroke="#40303f" stroke-width="2"/>`,
  ];
  return svg(
    `<svg viewBox="0 0 60 48"><polygon points="3,47 3,17 30,2 57,17 57,47" fill="#e2b27a" stroke="#7a4f2f" stroke-width="3"/>
    <polygon points="8,43 8,19 30,7 52,19 52,43" fill="#fbe6c2"/>${pics[kind % 3]}
    <circle cx="30" cy="6" r="2" fill="#7a4f2f"/></svg>`,
    { size: 128 },
  );
}
const EMA = [ema(0), ema(1), ema(2)];

// ---------- build ----------
export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lanternShrine", paintSize: 2048 });
  const R = rng(11);
  const Y0 = 0.08;

  const box = (w: number, h: number, d: number, c: Fill, x: number, y: number, z: number, rot?: N3) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, rot ? { at: [x, y + h / 2, z], rotation: rot } : { at: [x, y + h / 2, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Fill, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y + h / 2, z] });
  const ball = (r: number, c: Fill, x: number, y: number, z: number, sc?: N3, ws = 8, hs = 6) =>
    b.part(new THREE.SphereGeometry(r, ws, hs), c, sc ? { at: [x, y, z], scale: sc } : { at: [x, y, z] });
  const ring = (r: number, t: number, c: Fill, x: number, y: number, z: number, rot: N3, seg = 12) =>
    b.part(new THREE.TorusGeometry(r, t, 4, seg), c, { at: [x, y, z], rotation: rot });
  const lat = (outline: Array<[number, number]>, c: Fill, x: number, y: number, z: number, seg = 10) =>
    b.lathe(outline, { at: [x, y, z], color: c, segments: seg });

  // ---- ground platform ----
  box(3.8, Y0, 4.6, FLAG, 0, 0, 0.6);
  box(3.9, 0.1, 0.1, STONE, 0, 0, 2.95);
  box(3.9, 0.1, 0.1, STONE, 0, 0, -1.75);
  box(0.1, 0.1, 4.6, STONE, 1.9, 0, 0.6);
  box(0.1, 0.1, 4.6, STONE, -1.9, 0, 0.6);
  // moss tufts on the rim
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    ball(0.07 + R() * 0.05, MOSS, side * 1.9, 0.09, -1.6 + i * 0.45, [1.3, 0.5, 1.2], 6, 4);
  }
  // path pavers
  for (const [z, w] of [[2.55, 0.8], [2.2, 0.6], [0.7, 0.62]] as Array<[number, number]>) {
    box(w, 0.03, 0.34, STONE, 0, Y0, z);
    box(w - 0.1, 0.012, 0.24, STONE_D, 0, Y0 + 0.03, z);
  }
  // rune circle (glowing)
  glow(
    b.part(new THREE.PlaneGeometry(1.2, 1.2), "#ffffff", { at: [0, Y0 + 0.004, 1.45], rotation: [-90, 0, 0], texture: RUNE }),
    1.2,
  );

  // ---- hokora shrine ----
  const SZ = -0.8;
  box(1.5, 0.09, 0.55, STONE, 0, Y0, SZ + 0.9);
  box(1.3, 0.09, 0.4, STONE, 0, Y0 + 0.09, SZ + 0.78);
  box(1.5, 0.1, 1.2, STONE_D, 0, Y0 + 0.18, SZ);
  box(1.4, 0.07, 1.1, WOOD_L, 0, Y0 + 0.28, SZ);
  const FL = Y0 + 0.35; // wooden floor top
  const WH = 0.82;
  // pillars and plinth blocks
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.14, 0.05, 0.14, STONE, sx * 0.55, FL, SZ + sz * 0.42);
      cyl(0.055, 0.06, WH - 0.05, 8, VERM, sx * 0.55, FL + 0.05, SZ + sz * 0.42);
      cyl(0.065, 0.065, 0.04, 8, GOLD, sx * 0.55, FL + WH - 0.06, SZ + sz * 0.42);
    }
  // walls
  box(1.06, WH - 0.1, 0.05, WOOD, 0, FL + 0.05, SZ - 0.42);
  for (const sx of [1, -1]) box(0.05, WH - 0.1, 0.8, WOOD, sx * 0.55, FL + 0.05, SZ);
  // vertical batten lines on walls
  for (let i = -3; i <= 3; i++) box(0.015, WH - 0.1, 0.012, DARK, i * 0.15, FL + 0.05, SZ - 0.452);
  // doors, frame
  box(0.98, 0.07, 0.07, VERM_D, 0, FL + WH - 0.12, SZ + 0.4);
  box(0.98, 0.05, 0.07, VERM_D, 0, FL + 0.04, SZ + 0.4);
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.4, 0.58, 0.035), "#ffffff", { at: [sx * 0.21, FL + 0.43, SZ + 0.4], texture: DOOR });
    ball(0.016, GOLD, sx * 0.03, FL + 0.43, SZ + 0.43, undefined, 6, 4);
  }
  box(0.03, 0.6, 0.05, GOLD, 0, FL + 0.14, SZ + 0.42);
  // tie beam, eave
  box(1.34, 0.08, 0.08, VERM_D, 0, FL + WH - 0.06, SZ + 0.42);
  box(1.34, 0.08, 0.08, VERM_D, 0, FL + WH - 0.06, SZ - 0.42);
  for (const sx of [1, -1]) box(0.08, 0.08, 1.0, VERM_D, sx * 0.55, FL + WH - 0.06, SZ);
  box(1.2, 0.05, 0.05, GOLD, 0, FL + WH - 0.14, SZ + 0.455);
  // brackets
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.1, 0.07, 0.1, GOLD, sx * 0.6, FL + WH - 0.1, SZ + sz * 0.47, [0, 0, 0]);
      box(0.06, 0.06, 0.1, VERM, sx * 0.72, FL + WH - 0.04, SZ + sz * 0.5);
    }
  // roof panels
  const RY = FL + WH + 0.02;
  const ang = 27;
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.95, 0.05, 1.42), ROOF, {
      at: [sx * 0.42, RY + 0.22, SZ],
      rotation: [0, 0, -sx * ang],
    });
    // fascia boards along the eaves
    b.part(new THREE.BoxGeometry(0.06, 0.1, 1.46), DARK, {
      at: [sx * 0.42 + sx * Math.cos((ang * Math.PI) / 180) * 0.47, RY + 0.22 - Math.sin((ang * Math.PI) / 180) * 0.47, SZ],
      rotation: [0, 0, -sx * ang],
    });
    // gold ridge chigi (crossed finials)
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.34), GOLD, { at: [0, RY + 0.52, SZ + sx * 0.74], rotation: [0, 0, 0] });
  }
  box(0.14, 0.07, 1.5, GOLD, 0, RY + 0.42, SZ);
  for (const sz of [1, -1]) {
    b.rod([-0.1, RY + 0.52, SZ + sz * 0.76], [0.1, RY + 0.8, SZ + sz * 0.76], 0.018, GOLD);
    b.rod([0.1, RY + 0.52, SZ + sz * 0.76], [-0.1, RY + 0.8, SZ + sz * 0.76], 0.018, GOLD);
    // gable triangles
    b.extrude(
      [
        [-0.6, 0],
        [0.6, 0],
        [0, 0.34],
      ],
      { at: [0, RY + 0.04, SZ + sz * 0.7], x: [1, 0, 0], thickness: 0.04, color: CREAM },
    );
    ball(0.035, GOLD, 0, RY + 0.17, SZ + sz * 0.73, undefined, 6, 4);
  }
  // tile row dots on roof
  for (const sx of [1, -1])
    for (let i = 0; i < 5; i++)
      box(0.1, 0.012, 0.03, GOLD, sx * (0.12 + i * 0.16), RY + 0.34 - i * 0.073 + 0.0, SZ + 0.73, [0, 0, -sx * ang]);

  // bell, rope
  const BZ = SZ + 0.78;
  box(0.18, 0.04, 0.05, DARK, 0, FL + WH - 0.18, BZ);
  ball(0.075, GOLD, 0, FL + WH - 0.28, BZ, [1, 0.95, 1], 10, 7);
  cyl(0.02, 0.02, 0.05, 6, GOLD, 0, FL + WH - 0.22, BZ);
  b.sweep([[0, FL + WH - 0.34, BZ], [0.0, FL + 0.38, BZ + 0.08], [0, FL + 0.12, BZ + 0.2]], 0.018, RED_ROPE, { caps: "round" });
  ball(0.03, GOLD, 0, FL + 0.12, BZ + 0.2, undefined, 6, 4);

  // shimenawa across the front
  const rp: N3[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    rp.push([-0.62 + t * 1.24, FL + WH - 0.02 - 0.09 * Math.sin(t * Math.PI), SZ + 0.52]);
  }
  b.sweep(rp, 0.03, ROPE, { caps: "round" });
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5.0;
    const x = -0.62 + t * 1.24;
    const y = FL + WH - 0.02 - 0.09 * Math.sin(t * Math.PI);
    for (let k = 0; k < 3; k++)
      box(0.07, 0.07, 0.008, PAPER, x + (k % 2 ? 0.012 : -0.012), y - 0.07 - k * 0.07, SZ + 0.52, [0, 0, k % 2 ? 18 : -18]);
  }
  for (const sx of [1, -1]) {
    // small hanging lanterns at the eaves
    lantern(sx * 0.62, FL + WH - 0.08, SZ + 0.55, 0.5);
  }
  // saisen offering box
  const SB = SZ + 1.35;
  box(0.7, 0.3, 0.36, WOOD, 0, Y0, SB);
  box(0.76, 0.04, 0.42, DARK, 0, Y0 + 0.3, SB);
  for (let i = 0; i < 5; i++) box(0.62, 0.014, 0.035, VERM_D, 0, Y0 + 0.34, SB - 0.12 + i * 0.06);
  for (let i = -3; i <= 3; i++) box(0.012, 0.28, 0.014, DARK, i * 0.1, Y0 + 0.01, SB + 0.185);
  box(0.74, 0.035, 0.04, GOLD, 0, Y0 + 0.26, SB + 0.185);
  box(0.74, 0.03, 0.4, DARK, 0, Y0, SB);
  for (let i = 0; i < 5; i++)
    cyl(0.026, 0.026, 0.006, 8, GOLD, -0.3 + i * 0.14 + R() * 0.03, Y0 + 0.345, SB + 0.19 + R() * 0.03);

  // incense burner
  const IX = 0.58;
  const IZ = SZ + 1.3;
  lat(
    [[0, 0.06], [0.07, 0.06], [0.09, 0.1], [0.09, 0.17], [0.075, 0.2], [0.065, 0.19], [0.07, 0.11], [0, 0.11]],
    BRONZE,
    IX,
    Y0,
    IZ,
    8,
  );
  for (const a of [0, 120, 240]) {
    const rr = (a * Math.PI) / 180;
    b.rod([IX + Math.sin(rr) * 0.06, Y0 + 0.07, IZ + Math.cos(rr) * 0.06], [IX + Math.sin(rr) * 0.08, Y0, IZ + Math.cos(rr) * 0.08], 0.012, BRONZE);
  }
  cyl(0.065, 0.065, 0.012, 8, "#d8d2c8", IX, Y0 + 0.16, IZ);
  for (let i = 0; i < 4; i++) {
    const ix = IX - 0.03 + i * 0.02;
    b.rod([ix, Y0 + 0.17, IZ], [ix + 0.02, Y0 + 0.32, IZ - 0.02], 0.004, "#8a5a3a");
    glow(ball(0.008, "#ff6a3a", ix + 0.02, Y0 + 0.325, IZ - 0.02, undefined, 5, 3), 1.4);
  }

  // offerings on the steps
  const OS = Y0 + 0.18;
  // fruit plate
  cyl(0.11, 0.08, 0.025, 8, CREAM, -0.45, OS - 0.01, SZ + 0.78);
  for (const [dx, dz] of [[0, 0], [0.06, 0.04], [-0.05, 0.05]] as Array<[number, number]>)
    ball(0.045, ORANGE, -0.45 + dx, OS + 0.05, SZ + 0.78 + dz, undefined, 7, 5);
  cyl(0.008, 0.008, 0.03, 4, LEAF1, -0.45, OS + 0.085, SZ + 0.78);
  // rice bowls and sake cups
  for (const sx of [0.3, 0.5]) {
    lat([[0, 0], [0.04, 0], [0.065, 0.06], [0.07, 0.065], [0.06, 0.065], [0.035, 0.015], [0, 0.015]], CREAM, sx - 0.0, OS - 0.01 + 0.02, SZ + 0.77, 8);
    ball(0.055, RICE, sx, OS + 0.045, SZ + 0.77, [1, 0.5, 1], 8, 5);
  }
  // candles
  for (const sx of [1, -1]) {
    cyl(0.025, 0.03, 0.09, 6, "#fff8e8", sx * 0.62, OS - 0.01, SZ + 0.8);
    glow(
      lat([[0, 0], [0.014, 0.01], [0.012, 0.04], [0, 0.06]], FLAME, sx * 0.62, OS + 0.08, SZ + 0.8, 6),
      1.5,
    );
  }

  // ---- torii ----
  const TZ = 2.55;
  const TX = 1.05;
  const PH = 2.45;
  for (const sx of [1, -1]) {
    box(0.4, 0.08, 0.4, STONE, sx * TX, Y0, TZ);
    cyl(0.17, 0.17, 0.3, 8, DARK, sx * TX, Y0 + 0.08, TZ);
    lat([[0, 0], [0.145, 0], [0.115, PH], [0, PH]], VERM, sx * TX, Y0 + 0.38, TZ, 10);
    ring(0.14, 0.014, GOLD, sx * TX, Y0 + 0.4, TZ, [90, 0, 0], 10);
    ring(0.12, 0.012, GOLD, sx * TX, Y0 + 2.3, TZ, [90, 0, 0], 10);
  }
  const TT = Y0 + 0.38 + PH - 0.3; // top of pillar area for beams
  // nuki
  box(2.7, 0.12, 0.1, VERM, 0, Y0 + 1.95, TZ);
  box(2.7, 0.025, 0.11, GOLD, 0, Y0 + 2.0 + 0.1, TZ);
  for (const sx of [1, -1]) {
    box(0.08, 0.16, 0.14, GOLD, sx * 1.37, Y0 + 1.93, TZ);
    box(0.04, 0.12, 0.12, VERM_D, sx * TX, Y0 + 1.95, TZ);
  }
  // gakuzuka
  box(0.14, 0.4, 0.14, VERM, 0, Y0 + 2.07, TZ);
  b.part(new THREE.BoxGeometry(0.48, 0.38, 0.06), "#ffffff", { at: [0, Y0 + 2.28, TZ + 0.11], texture: PLAQUE });
  b.part(new THREE.BoxGeometry(0.48, 0.38, 0.06), "#ffffff", { at: [0, Y0 + 2.28, TZ - 0.11], texture: PLAQUE });
  box(0.56, 0.05, 0.1, GOLD, 0, Y0 + 2.46, TZ + 0.0);
  // shimaki + kasagi
  box(3.0, 0.1, 0.24, DARK, 0, TT - 0.02 - 0.05, TZ);
  box(3.0, 0.03, 0.26, GOLD, 0, TT - 0.12, TZ);
  b.extrude(
    [
      [-1.75, 0.12],
      [-1.35, 0.0],
      [1.35, 0.0],
      [1.75, 0.12],
      [1.75, 0.2],
      [1.35, 0.1],
      [-1.35, 0.1],
      [-1.75, 0.2],
    ],
    { at: [0, TT + 0.0, TZ], x: [1, 0, 0], thickness: 0.34, color: DARK, bevel: 0.01 },
  );
  b.extrude(
    [
      [-1.75, 0.2],
      [-1.35, 0.1],
      [1.35, 0.1],
      [1.75, 0.2],
      [1.75, 0.24],
      [1.35, 0.14],
      [-1.35, 0.14],
      [-1.75, 0.24],
    ],
    { at: [0, TT + 0.0, TZ], x: [1, 0, 0], thickness: 0.38, color: DARK },
  );
  for (const sx of [1, -1]) {
    box(0.04, 0.2, 0.36, GOLD, sx * 1.76, TT + 0.14, TZ);
    ball(0.045, GOLD, sx * 1.0, TT + 0.15, TZ + 0.2, undefined, 6, 4);
  }
  // hanging lanterns
  for (const x of [-0.7, 0, 0.7]) lantern(x, Y0 + 1.95, TZ + 0.0, 1);

  // ---- stone lanterns ----
  toro(1.35, 0.35);
  toro(-1.35, 0.35);

  // ---- kitsune guardians ----
  fox(0.9, 0.55);
  fox(-0.9, 0.55);

  // ---- ema rack ----
  const EX = -1.4;
  const EZ = 1.55;
  for (const sx of [1, -1]) {
    b.rod([EX + sx * 0.5, Y0, EZ], [EX + sx * 0.5, Y0 + 1.25, EZ], 0.04, WOOD);
    box(0.14, 0.04, 0.14, STONE, EX + sx * 0.5, Y0, EZ);
  }
  box(1.2, 0.06, 0.08, VERM_D, EX, Y0 + 1.2, EZ);
  box(1.3, 0.04, 0.2, DARK, EX, Y0 + 1.27, EZ, [8, 0, 0]);
  b.rod([EX - 0.5, Y0 + 0.62, EZ], [EX + 0.5, Y0 + 0.62, EZ], 0.015, WOOD);
  for (let i = 0; i < 7; i++) {
    const x = EX - 0.48 + i * 0.16;
    const row = i % 2;
    b.rod([x, Y0 + 1.19, EZ + 0.03], [x, Y0 + 1.08 - row * 0.4, EZ + 0.03], 0.004, ROPE);
    b.part(new THREE.BoxGeometry(0.15, 0.12, 0.012), "#ffffff", {
      at: [x, Y0 + 1.02 - row * 0.4, EZ + 0.04],
      rotation: [0, 0, (R() - 0.5) * 14],
      texture: EMA[i % 3],
    });
  }
  // ---- sake barrels ----
  const KX = 1.5;
  const KZ = 1.65;
  for (const [dx, dz] of [[0, 0], [0.5, 0.05]] as Array<[number, number]>) barrel(KX + dx - 0.2, KZ + dz, 1);
  barrel(KX + 0.05, KZ + 0.02, 1.0, 0.4);
  box(0.9, 0.04, 0.45, DARK, KX + 0.05, Y0, KZ);
  // ---- offering table ----
  const TBX = 1.2;
  const TBZ = 0.95;
  box(0.75, 0.05, 0.45, WOOD_L, TBX, Y0 + 0.4, TBZ);
  box(0.8, 0.03, 0.5, VERM_D, TBX, Y0 + 0.45, TBZ);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.05, 0.4, 0.05, WOOD, TBX + sx * 0.32, Y0, TBZ + sz * 0.18);
  const TY = Y0 + 0.48;
  // kagami mochi
  ball(0.08, RICE, TBX - 0.22, TY + 0.03, TBZ, [1, 0.45, 1], 8, 5);
  ball(0.055, RICE, TBX - 0.22, TY + 0.09, TBZ, [1, 0.5, 1], 8, 5);
  ball(0.03, ORANGE, TBX - 0.22, TY + 0.14, TBZ, undefined, 6, 4);
  box(0.2, 0.025, 0.2, WOOD_L, TBX - 0.22, TY, TBZ);
  // tokkuri
  for (const dx of [0.0, 0.09]) {
    lat(
      [[0, 0], [0.04, 0], [0.05, 0.05], [0.04, 0.11], [0.022, 0.14], [0.026, 0.17], [0.018, 0.17], [0, 0.17]],
      SAKE,
      TBX + 0.05 + dx,
      TY,
      TBZ - 0.08,
      8,
    );
    ring(0.04, 0.005, DARK, TBX + 0.05 + dx, TY + 0.06, TBZ - 0.08, [90, 0, 0], 8);
  }
  // cups
  for (const dz of [0.04, 0.12])
    lat([[0, 0], [0.025, 0], [0.038, 0.035], [0.034, 0.035], [0.02, 0.006], [0, 0.006]], CREAM, TBX + 0.1, TY, TBZ + dz, 8);
  // oranges on a sanbo
  box(0.14, 0.05, 0.14, WOOD_L, TBX + 0.27, TY, TBZ + 0.04);
  box(0.2, 0.015, 0.2, WOOD_L, TBX + 0.27, TY + 0.05, TBZ + 0.04);
  for (const [dx, dz] of [[-0.04, -0.03], [0.04, -0.02], [0, 0.04]] as Array<[number, number]>)
    ball(0.04, ORANGE, TBX + 0.27 + dx, TY + 0.1, TBZ + 0.04 + dz, undefined, 7, 5);
  // candle on table
  cyl(0.02, 0.025, 0.1, 6, "#fff8e8", TBX - 0.05, TY, TBZ + 0.14);
  glow(lat([[0, 0], [0.013, 0.01], [0.011, 0.04], [0, 0.06]], FLAME, TBX - 0.05, TY + 0.1, TBZ + 0.14, 6), 1.5);

  // ---- sakura tree ----
  b.sweep(
    [[-1.0, Y0 - 0.02, -1.2], [-0.95, 0.7, -1.25], [-1.12, 1.35, -1.3], [-1.0, 1.85, -1.3]],
    [0.14, 0.06],
    BARK,
    { caps: "round", sides: 8 },
  );
  const CC: N3 = [-1.0, 2.15, -1.3];
  b.rod([-1.1, 1.4, -1.3], [-0.6, 1.95, -1.15], [0.05, 0.025], BARK);
  b.rod([-1.1, 1.5, -1.3], [-1.55, 2.0, -1.4], [0.05, 0.025], BARK);
  b.rod([-1.0, 1.8, -1.3], [-0.95, 2.35, -1.5], [0.045, 0.02], BARK);
  const pinks = [SAKURA1, SAKURA2, SAKURA3];
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.25 + R() * 0.55;
    ball(
      0.26 + R() * 0.16,
      pinks[i % 3],
      CC[0] + Math.cos(a) * rr * 1.2,
      CC[1] + (R() - 0.3) * 0.5,
      CC[2] + Math.sin(a) * rr * 0.9,
      [1, 0.8, 1],
      7,
      5,
    );
  }
  // fallen petals
  for (let i = 0; i < 22; i++) {
    const x = -1.7 + R() * 2.4;
    const z = -1.6 + R() * 3.6;
    box(0.035, 0.004, 0.022, pinks[i % 3], x, Y0, z, [0, R() * 180, 0]);
  }

  // ---- bushes ----
  bush(1.45, -1.25, 1.0, HYD1, LEAF2);
  bush(0.85, -1.5, 0.8, HYD2, LEAF1);
  bush(1.6, 2.65, 0.8, HYD2, LEAF2);
  bush(-1.65, 2.65, 0.75, HYD1, LEAF1);
  bush(-1.65, 0.9, 0.55, HYD2, LEAF2);
  // grass clumps
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (0.6 + R() * 1.1);
    const z = -1.5 + R() * 4.2;
    if (Math.abs(x) < 0.7 && z > -0.2) continue;
    for (let k = 0; k < 4; k++)
      b.spike([x + (k - 1.5) * 0.015, Y0, z], [(k - 1.5) * 0.25, 1, (R() - 0.5) * 0.3], 0.14 + R() * 0.07, 0.012, k % 2 ? LEAF1 : LEAF2, {
        sides: 3,
      });
  }

  // stone path accents: tiny glowing wisps near lanterns
  for (const sx of [1, -1]) {
    glow(ball(0.03, CYAN, sx * 1.35, Y0 + 0.02, 0.8, [1, 0.4, 1], 5, 3), 1.2);
  }

  // ---------- local builders (hoisted) ----------
  function lantern(x: number, yTop: number, z: number, s: number) {
    cyl(0.015 * s, 0.015 * s, 0.07 * s, 5, DARK, x, yTop - 0.07 * s, z);
    cyl(0.07 * s, 0.09 * s, 0.025 * s, 8, GOLD, x, yTop - 0.1 * s, z);
    const y = yTop - 0.4 * s;
    glow(
      lat(
        [[0, 0], [0.07 * s, 0], [0.13 * s, 0.06 * s], [0.15 * s, 0.15 * s], [0.13 * s, 0.24 * s], [0.07 * s, 0.3 * s], [0, 0.3 * s]],
        LAMP,
        x,
        y,
        z,
        10,
      ),
      1.2,
    );
    glow(ball(0.07 * s, LAMP2, x, y + 0.15 * s, z, undefined, 6, 4), 1.4);
    for (const h of [0.06, 0.15, 0.24]) {
      const rr = h < 0.1 ? 0.125 : h < 0.2 ? 0.152 : 0.128;
      ring(rr * s, 0.006 * s, DARK, x, y + h * s, z, [90, 0, 0], 10);
    }
    cyl(0.075 * s, 0.1 * s, 0.03 * s, 8, GOLD, x, y - 0.025 * s, z);
    cyl(0.07 * s, 0.07 * s, 0.025 * s, 8, GOLD, x, y + 0.3 * s, z);
    // tassel
    b.rod([x, y - 0.025 * s, z], [x, y - 0.11 * s, z], 0.006 * s, VERM);
    ball(0.014 * s, VERM, x, y - 0.12 * s, z, [1, 1.4, 1], 5, 4);
    b.spike([x, y - 0.12 * s, z], [0, -1, 0], 0.07 * s, 0.014 * s, GOLD, { sides: 4 });
  }

  function toro(x: number, z: number) {
    box(0.5, 0.06, 0.5, STONE_D, x, Y0, z);
    lat([[0, 0], [0.2, 0], [0.2, 0.05], [0.12, 0.1], [0.12, 0.5], [0.17, 0.56], [0.17, 0.62], [0, 0.62]], STONE, x, Y0 + 0.06, z, 6);
    const FB = Y0 + 0.06 + 0.62;
    box(0.36, 0.04, 0.36, STONE, x, FB, z);
    // firebox with glowing windows
    box(0.3, 0.3, 0.3, STONE, x, FB + 0.04, z);
    glow(b.part(new THREE.BoxGeometry(0.14, 0.16, 0.32), LAMP2, { at: [x, FB + 0.19, z] }), 1.3);
    glow(b.part(new THREE.BoxGeometry(0.32, 0.16, 0.14), LAMP2, { at: [x, FB + 0.19, z] }), 1.3);
    for (const [dx, dz] of [[0.165, 0], [-0.165, 0], [0, 0.165], [0, -0.165]] as Array<[number, number]>) {
      b.part(new THREE.BoxGeometry(dx === 0 ? 0.18 : 0.02, 0.02, dz === 0 ? 0.18 : 0.02), STONE_D, { at: [x + dx, FB + 0.27, z + dz] });
      b.part(new THREE.BoxGeometry(dx === 0 ? 0.18 : 0.02, 0.02, dz === 0 ? 0.18 : 0.02), STONE_D, { at: [x + dx, FB + 0.11, z + dz] });
    }
    box(0.4, 0.04, 0.4, STONE, x, FB + 0.34, z);
    lat(
      [[0, 0], [0.34, 0], [0.37, 0.025], [0.3, 0.06], [0.2, 0.16], [0.07, 0.2], [0, 0.2]],
      STONE,
      x,
      FB + 0.38,
      z,
      6,
    );
    ring(0.3, 0.012, GOLD, x, FB + 0.41, z, [90, 0, 0], 6);
    // jewel
    lat([[0, 0], [0.05, 0], [0.065, 0.04], [0.04, 0.09], [0, 0.14]], STONE, x, FB + 0.58, z, 8);
    ball(0.028, GOLD, x, FB + 0.74, z, [1, 1.3, 1], 6, 4);
    // moss at the base
    ball(0.07, MOSS, x + 0.14, Y0 + 0.07, z + 0.16, [1.4, 0.5, 1.2], 6, 4);
    ball(0.06, MOSS, x - 0.2, Y0 + 0.07, z - 0.1, [1.2, 0.5, 1.2], 6, 4);
  }

  function fox(x: number, z: number) {
    const sx = x > 0 ? 1 : -1;
    const T = Y0 + 0.2;
    box(0.5, 0.14, 0.5, STONE_D, x, Y0, z);
    box(0.44, 0.06, 0.44, STONE, x, Y0 + 0.14, z);
    ball(0.17, STONE, x, T + 0.15, z - 0.07, [0.9, 1.0, 1.1]);
    ball(0.13, STONE, x, T + 0.3, z + 0.03, [0.9, 1.3, 1]);
    for (const dx of [1, -1]) {
      cyl(0.035, 0.04, 0.26, 6, STONE, x + dx * 0.06, T, z + 0.12);
      box(0.06, 0.03, 0.08, STONE, x + dx * 0.06, T, z + 0.15);
      ball(0.1, STONE_D, x + dx * 0.13, T + 0.1, z - 0.08, [0.45, 1, 1], 6, 4);
    }
    ball(0.1, STONE, x, T + 0.53, z + 0.1, [1.05, 0.95, 1]);
    b.spike([x, T + 0.5, z + 0.15], [0, -0.1, 1], 0.14, 0.055, STONE, { sides: 6 });
    ball(0.016, DARK, x, T + 0.49, z + 0.3, undefined, 5, 4);
    for (const dx of [1, -1]) {
      b.spike([x + dx * 0.06, T + 0.6, z + 0.08], [dx * 0.2, 1, -0.15], 0.13, 0.04, STONE, { sides: 4 });
      b.spike([x + dx * 0.06, T + 0.61, z + 0.095], [dx * 0.2, 1, -0.15], 0.08, 0.022, VERM, { sides: 4 });
      glow(ball(0.015, GOLD_FLAT, x + dx * 0.05, T + 0.56, z + 0.18, undefined, 5, 4), 1.2);
      b.rod([x + dx * 0.035, T + 0.505, z + 0.2], [x + dx * 0.12, T + 0.5, z + 0.3], 0.004, STONE_D);
    }
    ring(0.085, 0.024, VERM, x, T + 0.44, z + 0.08, [70, 0, 0], 8);
    ball(0.024, GOLD, x, T + 0.4, z + 0.16, undefined, 6, 4);
    ring(0.016, 0.004, DARK, x, T + 0.4, z + 0.16, [0, 0, 0], 5);
    box(0.16, 0.07, 0.01, VERM, x, T + 0.3, z + 0.145);
    b.sweep(
      [
        [x + sx * 0.05, T + 0.08, z - 0.2],
        [x + sx * 0.2, T + 0.1, z - 0.27],
        [x + sx * 0.25, T + 0.3, z - 0.28],
        [x + sx * 0.18, T + 0.46, z - 0.22],
      ],
      [0.07, 0.025],
      STONE,
      { caps: "round", sides: 6 },
    );
  }

  function barrel(x: number, z: number, s: number, lift = 0) {
    const y = Y0 + 0.04 + lift;
    lat([[0, 0], [0.19 * s, 0], [0.23 * s, 0.14 * s], [0.23 * s, 0.26 * s], [0.19 * s, 0.4 * s], [0, 0.4 * s]], WOOD, x, y, z, 12);
    for (const h of [0.05, 0.35]) cyl(0.2 * s, 0.2 * s, 0.025 * s, 12, DARK, x, y + h * s - 0.012 * s, z);
    ring(0.235 * s, 0.008 * s, GOLD, x, y + 0.2 * s, z, [90, 0, 0], 12);
    cyl(0.17 * s, 0.17 * s, 0.015 * s, 12, WOOD_L, x, y + 0.4 * s, z);
    b.part(new THREE.PlaneGeometry(0.22 * s, 0.17 * s), "#ffffff", { at: [x, y + 0.2 * s, z + 0.235 * s], dir: [0, 0, 1], axis: "z", texture: LABEL });
    // straw rope
    ring(0.2 * s, 0.01 * s, ROPE, x, y + 0.43 * s, z, [90, 0, 0], 10);
  }

  function bush(x: number, z: number, s: number, flower: Fill, leaf: Fill) {
    ball(0.28 * s, leaf, x, Y0 + 0.2 * s, z, [1.2, 0.9, 1.1], 7, 5);
    ball(0.2 * s, leaf, x + 0.2 * s, Y0 + 0.14 * s, z + 0.1 * s, [1, 0.9, 1], 6, 4);
    ball(0.2 * s, leaf, x - 0.2 * s, Y0 + 0.14 * s, z - 0.05 * s, [1, 0.9, 1], 6, 4);
    for (let i = 0; i < 8; i++) {
      const a = R() * Math.PI * 2;
      const e = 0.25 + R() * 0.6;
      ball(
        0.07 * s,
        flower,
        x + Math.cos(a) * 0.27 * s * e * 1.3,
        Y0 + 0.2 * s + 0.2 * s * (1 - e * 0.5),
        z + Math.sin(a) * 0.27 * s * e * 1.2,
        undefined,
        5,
        4,
      );
    }
  }

  return b.root;
}

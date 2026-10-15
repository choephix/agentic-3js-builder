import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded alchemist's workbench with glowing elemental potions, books, a brass balance, mortar and pestle, hanging herbs and jars, in a Genshin Impact style.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

// ---------- palette ----------
const GOLD = "#f0b947";
const GOLD_D = "#b9812f";
const CREAM = "#fff1d0";
const PAGE = "#f6e3b4";
const NAVY = "#2d4375";
const RED = "#c9473f";
const TEAL = "#2fb5a8";
const PLUM = "#6c4a8f";
const IRON = "#5d6b82";
const GLASS = "#d3f1f1";
const CORK = "#c58f5a";
const LEAF = "#58b34a";
const CYAN = "#37d6c9";
const VIOLET = "#a374ff";
const AMBER = "#ffb23d";
const PINK = "#ff74aa";
const GREEN = "#7be75f";
const WOODD = "#7a4a35";

// ---------- paints ----------
const WOOD_X = cel(grain("#bd7f49", "#a76d3d", { size: 0.05, axis: "x", seed: 2 }), "#7d4c37");
const WOOD_Y = cel(grain("#b0733f", "#9b6335", { size: 0.04, axis: "y", seed: 5 }), "#764632");
const WOOD_DARK = cel(grain("#8a5538", "#794830", { size: 0.04, axis: "x", seed: 9 }), "#573225");
const STONE = cel(mottle("#c4bdd6", "#aaa2c2", { size: 0.04, seed: 3 }), "#7d76a0");
const CLAY = cel(mottle("#d9835a", "#c8734c", { size: 0.05, seed: 4 }), "#a24f4c");
const BARREL = cel(grain("#a86b3c", "#955a30", { size: 0.03, axis: "y", seed: 6 }), "#6e3f2c");
const SACK = cel(mottle("#e2c88a", "#d4b676", { size: 0.05, seed: 8 }), "#b08a62");

const topGrain = grain("#c0834c", "#ab7040", { size: 0.05, axis: "x", seed: 1 });
const TOP = cel(
  paint((p, n) => {
    if (n.y > 0.5) {
      if (Math.hypot(p.x - 0.62, p.z - 0.34) < 0.06) return "#6d4a6a";
      if (Math.hypot(p.x + 0.8, p.z - 0.33) < 0.035) return "#4a2d28";
      if (Math.hypot(p.x - 0.1, p.z - 0.36) < 0.03) return "#3d6f9a";
    }
    return topGrain;
  }),
  "#7d4c37",
);

const RUG = paint((p, n) => {
  if (n.y < 0.5) return "#6b4350";
  const e = Math.min(1.25 - Math.abs(p.x), 0.8 - Math.abs(p.z));
  if (e < 0.05) return "#e8b84a";
  if (e < 0.08) return "#2d4375";
  if (e < 0.11) return "#fff1d0";
  if (e < 0.16) return "#9c3d4a";
  const a = Math.abs(p.x) + Math.abs(p.z);
  const d = (((a % 0.22) + 0.22) % 0.22) / 0.22;
  const d2 = (((Math.abs(p.x) - Math.abs(p.z) + 4) % 0.22) + 0.22) % 0.22;
  if (d < 0.1 || d2 / 0.22 < 0.1) return "#e8b84a";
  return Math.floor(Math.abs(p.x) / 0.22 + Math.abs(p.z) / 0.22) % 2 ? "#3a5a99" : "#b44a55";
});

// ---------- drawings ----------
const RUNES = svg(
  `<svg viewBox="0 0 200 200">
  <g fill="none" stroke="#f0c25a" stroke-width="2.4">
    <circle cx="100" cy="100" r="94"/><circle cx="100" cy="100" r="84" stroke-dasharray="6 4"/>
    <circle cx="100" cy="100" r="58"/>
    <polygon points="100,42 150,129 50,129"/><polygon points="100,158 50,71 150,71"/>
  </g>
  <g fill="none" stroke="#46e3d3" stroke-width="2.4">
    <circle cx="100" cy="100" r="22"/><path d="M100 78 L100 122 M78 100 L122 100"/>
  </g>
  <g fill="#f0c25a">
    <circle cx="100" cy="6" r="5"/><circle cx="100" cy="194" r="5"/><circle cx="6" cy="100" r="5"/><circle cx="194" cy="100" r="5"/>
    <circle cx="34" cy="34" r="3.5"/><circle cx="166" cy="34" r="3.5"/><circle cx="34" cy="166" r="3.5"/><circle cx="166" cy="166" r="3.5"/>
  </g>
  <g stroke="#f0c25a" stroke-width="2.4" fill="none">
    <path d="M96 22 l8 0 M100 18 l0 8"/><path d="M96 178 l8 0"/><path d="M22 96 l0 8 M18 100 l8 0"/><path d="M178 96 l0 8 M174 100 l8 0"/>
  </g></svg>`,
  { size: 1024 },
);

const EMBLEM = svg(
  `<svg viewBox="0 0 100 140">
  <rect x="5" y="5" width="90" height="130" rx="4" fill="none" stroke="#f0b947" stroke-width="3"/>
  <rect x="12" y="12" width="76" height="116" rx="2" fill="none" stroke="#f0b947" stroke-width="1.6"/>
  <circle cx="50" cy="70" r="26" fill="none" stroke="#f0b947" stroke-width="3"/>
  <path d="M50 38 L58 70 L50 102 L42 70 Z" fill="#f0b947"/>
  <path d="M18 70 L50 62 L82 70 L50 78 Z" fill="#fff1d0"/>
  <circle cx="50" cy="70" r="6" fill="#2fb5a8"/>
  <path d="M20 20 l10 0 M20 20 l0 10 M80 20 l-10 0 M80 20 l0 10 M20 120 l10 0 M20 120 l0 -10 M80 120 l-10 0 M80 120 l0 -10" stroke="#fff1d0" stroke-width="2.4" fill="none"/>
  </svg>`,
  { size: 256 },
);

function labelSvg(sym: string, col: string) {
  return svg(
    `<svg viewBox="0 0 40 50">
    <rect x="2" y="2" width="36" height="46" rx="4" fill="#fff1d0" stroke="#b9812f" stroke-width="2.4"/>
    <rect x="6" y="6" width="28" height="38" rx="2" fill="none" stroke="#e8b84a" stroke-width="1.4"/>
    ${sym.replace(/COL/g, col)}
    </svg>`,
    { size: 128 },
  );
}
const LABEL_DROP = labelSvg(`<path d="M20 12 C28 24 30 28 20 38 C10 28 12 24 20 12 Z" fill="COL"/><circle cx="17" cy="28" r="2" fill="#fff"/>`, "#2fb5a8");
const LABEL_FLAME = labelSvg(`<path d="M20 11 C26 20 30 24 26 33 C24 38 16 38 14 33 C10 26 18 22 20 11 Z" fill="COL"/><path d="M20 24 C23 28 24 31 20 34 C16 31 17 28 20 24 Z" fill="#fff1d0"/>`, "#e0603c");
const LABEL_LEAF = labelSvg(`<path d="M12 36 C10 18 24 10 30 12 C32 24 24 36 12 36 Z" fill="COL"/><path d="M13 35 L26 18" stroke="#fff1d0" stroke-width="2" fill="none"/>`, "#58b34a");
const LABEL_STAR = labelSvg(`<path d="M20 10 L23 21 L34 24 L23 27 L20 38 L17 27 L6 24 L17 21 Z" fill="COL"/>`, "#8a5dd6");
const LABELS = [LABEL_DROP, LABEL_FLAME, LABEL_LEAF, LABEL_STAR];

const DRAWER = svg(
  `<svg viewBox="0 0 160 50">
  <rect x="3" y="3" width="154" height="44" rx="5" fill="none" stroke="#f0b947" stroke-width="3"/>
  <rect x="9" y="9" width="142" height="32" rx="3" fill="none" stroke="#e8b84a" stroke-width="1.5"/>
  <path d="M14 25 C24 12 34 38 44 25 M146 25 C136 12 126 38 116 25" fill="none" stroke="#f0b947" stroke-width="2.6"/>
  <circle cx="80" cy="25" r="3" fill="none" stroke="#46e3d3" stroke-width="2"/>
  <path d="M60 25 L72 25 M88 25 L100 25" stroke="#f0b947" stroke-width="2.4"/>
  </svg>`,
  { size: 512 },
);

function pageSvg(left: boolean) {
  let body = "";
  if (left) {
    body += `<circle cx="50" cy="38" r="26" fill="none" stroke="#7a5a3a" stroke-width="2.6"/>
    <polygon points="50,18 68,50 32,50" fill="none" stroke="#2fb5a8" stroke-width="2.6"/>
    <circle cx="50" cy="38" r="5" fill="#c9473f"/>`;
    for (let i = 0; i < 6; i++) body += `<path d="M12 ${78 + i * 9} L${i % 3 === 2 ? 70 : 88} ${78 + i * 9}" stroke="#7a5a3a" stroke-width="2.6"/>`;
  } else {
    body += `<rect x="12" y="12" width="20" height="20" fill="#c9473f"/><path d="M17 17 L27 27 M27 17 L17 27" stroke="#f0b947" stroke-width="2.4"/>`;
    for (let i = 0; i < 11; i++) body += `<path d="M${i < 3 ? 38 : 12} ${16 + i * 10} L${i % 4 === 3 ? 66 : 88} ${16 + i * 10}" stroke="#7a5a3a" stroke-width="2.6"/>`;
    body += `<path d="M70 128 l8 -8 l8 8 z" fill="#58b34a"/>`;
  }
  return svg(`<svg viewBox="0 0 100 140">${body}</svg>`, { size: 256 });
}
const PAGE_L = pageSvg(true);
const PAGE_R = pageSvg(false);

const LEAF_A = svg(
  `<svg viewBox="0 0 40 80">
  <path d="M20 80 L20 12" stroke="#2f7a3a" stroke-width="3" fill="none"/>
  <path d="M20 20 C6 18 2 6 4 2 C16 4 22 12 20 20 Z" fill="#58b34a"/><path d="M20 20 C34 18 38 6 36 2 C24 4 18 12 20 20 Z" fill="#7be75f"/>
  <path d="M20 42 C4 40 0 28 2 24 C16 26 22 34 20 42 Z" fill="#7be75f"/><path d="M20 38 C36 36 40 24 38 20 C24 22 18 30 20 38 Z" fill="#58b34a"/>
  <path d="M20 62 C6 60 2 50 4 46 C16 48 22 54 20 62 Z" fill="#58b34a"/><path d="M20 58 C34 56 38 46 36 42 C24 44 18 50 20 58 Z" fill="#7be75f"/>
  <path d="M20 14 C16 8 18 3 20 0 C22 3 24 8 20 14 Z" fill="#9cf27d"/>
  </svg>`,
  { size: 192 },
);
const LAVENDER = svg(
  `<svg viewBox="0 0 24 80">
  <path d="M12 80 L12 14" stroke="#4f8f4a" stroke-width="2.6" fill="none"/>
  <path d="M12 60 C4 56 2 48 4 46 C10 48 12 54 12 60 Z" fill="#6fc35a"/><path d="M12 52 C20 48 22 40 20 38 C14 40 12 46 12 52 Z" fill="#6fc35a"/>
  <ellipse cx="12" cy="8" rx="3.6" ry="5" fill="#a374ff"/><ellipse cx="9" cy="16" rx="3.4" ry="4.6" fill="#8a5dd6"/><ellipse cx="15" cy="16" rx="3.4" ry="4.6" fill="#b48aff"/>
  <ellipse cx="9" cy="25" rx="3.4" ry="4.6" fill="#a374ff"/><ellipse cx="15" cy="25" rx="3.4" ry="4.6" fill="#8a5dd6"/>
  <ellipse cx="12" cy="33" rx="3.4" ry="4.6" fill="#b48aff"/>
  </svg>`,
  { size: 192 },
);
const SUNBLOOM = svg(
  `<svg viewBox="0 0 30 80">
  <path d="M15 80 L15 22" stroke="#4f8f4a" stroke-width="2.6" fill="none"/>
  <path d="M15 56 C4 54 2 44 4 40 C12 42 15 48 15 56 Z" fill="#58b34a"/>
  <g fill="#ffb23d"><ellipse cx="15" cy="7" rx="3.4" ry="6"/><ellipse cx="23" cy="13" rx="3.4" ry="6" transform="rotate(60 23 13)"/><ellipse cx="7" cy="13" rx="3.4" ry="6" transform="rotate(-60 7 13)"/><ellipse cx="22" cy="24" rx="3.4" ry="6" transform="rotate(120 22 24)"/><ellipse cx="8" cy="24" rx="3.4" ry="6" transform="rotate(-120 8 24)"/><ellipse cx="15" cy="29" rx="3.4" ry="6"/></g>
  <circle cx="15" cy="18" r="5.5" fill="#8a4b2a"/>
  </svg>`,
  { size: 192 },
);
const TASSEL = svg(
  `<svg viewBox="0 0 20 60">
  <circle cx="10" cy="6" r="5" fill="#f0b947" stroke="#b9812f" stroke-width="1.4"/>
  <path d="M5 12 L15 12 L17 24 L3 24 Z" fill="#c9473f"/><path d="M3 24 L17 24" stroke="#f0b947" stroke-width="2.4"/>
  <g stroke="#e0554a" stroke-width="2.6"><path d="M4 25 L3 58"/><path d="M7 25 L7 60"/><path d="M10 25 L10 60"/><path d="M13 25 L13 60"/><path d="M16 25 L17 58"/></g>
  <g stroke="#f0b947" stroke-width="2"><path d="M5 50 L15 50"/></g>
  </svg>`,
  { size: 128 },
);
const FEATHER = svg(
  `<svg viewBox="0 0 30 100">
  <path d="M15 100 L15 2" stroke="#fff1d0" stroke-width="2.4" fill="none"/>
  <path d="M15 4 C34 24 30 62 15 90 C0 62 -4 24 15 4 Z" fill="#2fb5a8"/>
  <path d="M15 12 C26 28 24 60 15 84 Z" fill="#46e3d3"/>
  <path d="M15 100 L15 2" stroke="#fff1d0" stroke-width="2" fill="none"/>
  </svg>`,
  { size: 192 },
);
const GLINT = svg(
  `<svg viewBox="0 0 20 60"><path d="M10 6 L10 40" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="10" cy="52" r="3" fill="#ffffff"/></svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "alchemistWorkbench" });
  const R = rng(7);
  const T = 0.92;
  const RAD = Math.PI / 180;

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: any, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const lathe = (pts: Array<[number, number]>, x: number, y: number, z: number, color: any, seg = 10) =>
    b.lathe(pts, { at: [x, y, z], segments: seg, color });
  const ring = (r: number, tube: number, x: number, y: number, z: number, color: any, rot: number[] = [90, 0, 0], sides = 12) =>
    b.part(new THREE.TorusGeometry(r, tube, 4, sides), color, { at: [x, y, z], rotation: rot });
  const ball = (r: number, x: number, y: number, z: number, color: any, sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { at: [x, y, z], scale: sc });
  const cyl = (rt: number, rb: number, h: number, x: number, y: number, z: number, color: any, seg = 8, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], rotation: rot });

  // ---------- floor rug ----------
  box(2.5, 0.012, 1.6, 0, 0.006, 0.05, RUG);

  // ---------- legs, frame, shelf ----------
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.9;
      const z = sz * 0.36;
      box(0.1, 0.86, 0.1, x, 0.43, z, WOOD_Y);
      box(0.115, 0.035, 0.115, x, 0.0175, z, GOLD_D);
      box(0.115, 0.02, 0.115, x, 0.6, z, GOLD);
      box(0.108, 0.03, 0.108, x, 0.2, z, WOOD_DARK);
      box(0.012, 0.3, 0.003, x, 0.42, z + sz * 0.052, GOLD_D);
      ball(0.028, x, 0.84, z, GOLD);
    }
  for (const sz of [1, -1]) box(1.8, 0.05, 0.05, 0, 0.2, sz * 0.36, WOOD_DARK);
  for (const sx of [1, -1]) box(0.05, 0.05, 0.72, sx * 0.9, 0.2, 0, WOOD_DARK);
  box(1.76, 0.03, 0.68, 0, 0.215, 0, WOOD_X);
  box(1.78, 0.012, 0.012, 0, 0.23, 0.34, GOLD);
  const SH = 0.23;

  // ---------- carcass and drawers ----------
  box(1.7, 0.24, 0.7, 0, 0.74, 0, WOOD_DARK);
  box(1.78, 0.02, 0.02, 0, 0.865, 0.355, GOLD);
  box(1.78, 0.02, 0.02, 0, 0.615, 0.355, GOLD_D);
  for (const x of [-0.6, 0, 0.6]) {
    box(0.56, 0.17, 0.03, x, 0.74, 0.36, WOOD_X);
    b.part(new THREE.PlaneGeometry(0.5, 0.156), "#ffffff", {
      at: [x, 0.74, 0.3765],
      dir: [0, 0, 1],
      axis: "z",
      texture: DRAWER,
    });
    box(0.05, 0.03, 0.006, x, 0.72, 0.378, GOLD_D);
    cyl(0.006, 0.006, 0.03, x, 0.76, 0.385, GOLD, 6, [90, 0, 0]);
    ball(0.02, x, 0.76, 0.4, GOLD);
    box(0.006, 0.014, 0.004, x, 0.718, 0.382, INK);
  }

  // ---------- tabletop ----------
  box(1.98, 0.06, 0.86, 0, 0.89, 0, TOP);
  for (const sz of [1, -1]) {
    box(1.9, 0.0025, 0.014, 0, T + 0.001, sz * 0.4, GOLD);
    box(1.9, 0.0025, 0.006, 0, T + 0.001, sz * 0.375, GOLD_D);
  }
  for (const sx of [1, -1]) {
    box(0.014, 0.0025, 0.8, sx * 0.94, T + 0.001, 0, GOLD);
    box(0.006, 0.0025, 0.75, sx * 0.915, T + 0.001, 0, GOLD_D);
  }
  box(1.99, 0.014, 0.012, 0, 0.912, 0.43, GOLD_D);
  b.part(new THREE.PlaneGeometry(0.64, 0.64), "#ffffff", {
    at: [0, T + 0.004, 0.05],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    axis: "z",
    texture: RUNES,
  });

  // ---------- book ----------
  const book = (cx: number, y0: number, cz: number, w: number, h: number, d: number, rot: number, cover: string, emblem: boolean) => {
    const c = Math.cos(rot * RAD);
    const s = Math.sin(rot * RAD);
    const L = (lx: number, ly: number, lz: number, sw: number, sh: number, sd: number, col: any) =>
      box(sw, sh, sd, cx + lx * c + lz * s, y0 + ly, cz - lx * s + lz * c, col, [0, rot, 0]);
    L(0, 0.005, 0, w, 0.01, d, cover);
    L(0, h - 0.005, 0, w, 0.01, d, cover);
    L(-w / 2 + 0.008, h / 2, 0, 0.016, h, d, cover);
    L(0.006, h / 2, 0, w - 0.03, h - 0.02, d - 0.02, PAGE);
    L(0.006, h / 2, 0, w - 0.032, 0.003, d - 0.018, "#e3c98e");
    for (const bz of [-0.3, 0, 0.3]) L(-w / 2 + 0.008, h / 2, bz * d, 0.021, h + 0.004, 0.012, GOLD);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) {
        L(sx * (w / 2 - 0.022) + (sx < 0 ? 0.01 : 0), h - 0.003, sz * (d / 2 - 0.022), 0.04, 0.012, 0.04, GOLD);
        L(sx * (w / 2 - 0.022) + (sx < 0 ? 0.01 : 0), 0.003, sz * (d / 2 - 0.022), 0.04, 0.012, 0.04, GOLD_D);
      }
    if (emblem) {
      const m = Math.min(w, d * 0.7);
      b.part(new THREE.PlaneGeometry(m * 0.8, m * 0.8 * 1.4), "#ffffff", {
        at: [cx + 0.01 * c, y0 + h + 0.0025, cz - 0.01 * s],
        dir: [0, 1, 0],
        up: [-s, 0, -c],
        axis: "z",
        texture: EMBLEM,
      });
    }
  };

  // stack of three books, with a crystal and ribbon
  book(-0.74, T, -0.06, 0.24, 0.06, 0.33, 8, NAVY, true);
  book(-0.74, T + 0.06, -0.06, 0.21, 0.05, 0.29, -14, RED, true);
  book(-0.74, T + 0.11, -0.06, 0.18, 0.045, 0.25, 22, TEAL, true);
  ring(0.03, 0.006, -0.74, T + 0.158, -0.06, GOLD, [90, 0, 0], 10);
  glow(
    b.part(new THREE.OctahedronGeometry(0.035), CYAN, { at: [-0.74, T + 0.21, -0.06], scale: [0.65, 1.5, 0.65] }),
    1.1,
  );
  glow(b.part(new THREE.OctahedronGeometry(0.02), "#8ff3e8", { at: [-0.68, T + 0.185, -0.03], scale: [0.6, 1.3, 0.6], rotation: [0, 0, 20] }), 1);
  b.rod([-0.62, T + 0.1, 0.07], [-0.6, T + 0.01, 0.12], 0.007, RED, { sides: 4 });
  box(0.02, 0.006, 0.05, -0.6, T + 0.004, 0.14, RED, [0, 20, 0]);

  // open book on a stand
  {
    const ox = -0.34;
    const oz = 0.24;
    box(0.5, 0.022, 0.3, ox, T + 0.011, oz, NAVY);
    box(0.51, 0.006, 0.31, ox, T + 0.003, oz, GOLD_D);
    for (const sx of [1, -1]) {
      const a = sx > 0 ? 6 : -6;
      const cx = ox + sx * 0.115;
      const cy = T + 0.022 + 0.02;
      box(0.23, 0.03, 0.27, cx, cy, oz, PAGE, [0, 0, a]);
      box(0.23, 0.008, 0.27, cx, cy - 0.02, oz, "#e3c98e", [0, 0, a]);
      const nx = -Math.sin(a * RAD);
      const ny = Math.cos(a * RAD);
      b.part(new THREE.PlaneGeometry(0.19, 0.19 * 1.4), "#ffffff", {
        at: [cx + nx * 0.0175, cy + ny * 0.0175, oz],
        dir: [nx, ny, 0],
        up: [0, 0, -1],
        axis: "z",
        texture: sx > 0 ? PAGE_R : PAGE_L,
      });
    }
    box(0.014, 0.034, 0.27, ox, T + 0.036, oz, WOODD);
    b.rod([ox + 0.2, T + 0.05, oz + 0.1], [ox + 0.24, T + 0.024, oz + 0.15], 0.005, GOLD, { sides: 4 });
    ball(0.012, ox + 0.24, T + 0.026, oz + 0.15, GOLD);
  }

  // inkwell and quill
  {
    const x = 0.0;
    const z = 0.34;
    lathe([[0, 0], [0.04, 0], [0.05, 0.02], [0.045, 0.05], [0.025, 0.065], [0.025, 0.08], [0, 0.08]], x, T, z, INK, 8);
    ring(0.03, 0.005, x, T + 0.07, z, GOLD, [90, 0, 0], 8);
    b.rod([x + 0.01, T + 0.075, z], [x + 0.1, T + 0.27, z - 0.04], 0.004, CREAM, { sides: 4 });
    b.cards([frame([x + 0.04, T + 0.15, z - 0.016], [0.45, 1, -0.2])], FEATHER, {
      size: [0.06, 0.2],
      lean: 8,
      flow: [0, 0, 1],
      mirror: false,
    });
  }

  // weights
  [0.02, 0.026, 0.032, 0.038].forEach((r, i) => {
    const x = 0.12 + i * 0.075;
    cyl(r * 0.8, r, r * 1.4, x, T + r * 0.7, 0.34, i % 2 ? GOLD : "#d99a3a", 8);
    ball(r * 0.4, x, T + r * 1.4 + r * 0.25, 0.34, GOLD_D);
  });

  // ---------- balance scales ----------
  {
    const sx = 0;
    const sz = -0.08;
    lathe([[0, 0], [0.1, 0], [0.115, 0.015], [0.08, 0.035], [0.04, 0.06], [0.022, 0.1], [0, 0.1]], sx, T, sz, GOLD, 10);
    ring(0.108, 0.006, sx, T + 0.018, sz, GOLD_D, [90, 0, 0], 10);
    b.rod([sx, T + 0.08, sz], [sx, T + 0.4, sz], [0.018, 0.012], GOLD, { sides: 6 });
    ring(0.03, 0.007, sx, T + 0.24, sz, GOLD_D, [0, 0, 0], 8);
    ring(0.022, 0.006, sx, T + 0.3, sz, GOLD_D, [0, 90, 0], 8);
    ball(0.03, sx, T + 0.42, sz, GOLD);
    glow(b.part(new THREE.OctahedronGeometry(0.018), CYAN, { at: [sx, T + 0.46, sz], scale: [0.7, 1.4, 0.7] }), 1);
    const yA = T + 0.43;
    const yB = T + 0.395;
    b.rod([sx - 0.26, yA, sz], [sx + 0.26, yB, sz], 0.009, GOLD, { sides: 6 });
    for (const [ex, ey] of [[-0.26, yA], [0.26, yB]]) {
      ball(0.016, sx + ex, ey, sz, GOLD);
      b.spike([sx + ex, ey + 0.01, sz], [0, 1, 0], 0.035, 0.008, GOLD_D, { sides: 5 });
      const py = ey - 0.27;
      lathe([[0, 0], [0.1, 0.03], [0.115, 0.05], [0.108, 0.05], [0.095, 0.036], [0, 0.012]], sx + ex, py, sz, GOLD, 10);
      ring(0.113, 0.004, sx + ex, py + 0.05, sz, GOLD_D, [90, 0, 0], 10);
      for (let k = 0; k < 3; k++) {
        const a = (90 + k * 120) * RAD;
        b.rod(
          [sx + ex, ey - 0.005, sz],
          [sx + ex + 0.108 * Math.cos(a), py + 0.05, sz + 0.108 * Math.sin(a)],
          0.003,
          GOLD_D,
          { sides: 4 },
        );
      }
      if (ex > 0) {
        for (let k = 0; k < 3; k++)
          cyl(0.03, 0.034, 0.012, sx + ex + (k - 1) * 0.012, py + 0.022 + k * 0.012, sz + (k - 1) * 0.01, k % 2 ? GOLD : "#d99a3a", 10);
      } else {
        glow(b.part(new THREE.OctahedronGeometry(0.035), PINK, { at: [sx + ex, py + 0.065, sz], scale: [0.8, 1.2, 0.8] }), 1.1);
        ball(0.025, sx + ex + 0.05, py + 0.03, sz + 0.03, LEAF, [1.2, 0.6, 1]);
        ball(0.02, sx + ex - 0.045, py + 0.028, sz - 0.03, GREEN, [1.2, 0.6, 1]);
      }
    }
  }

  // ---------- bottles ----------
  type Pts = Array<[number, number]>;
  type Spec = { body: Pts; neck: Pts; ny: number; cork: number; ly: number; lr: number };
  const ROUND: Spec = {
    body: [[0, 0], [0.045, 0], [0.06, 0.02], [0.065, 0.06], [0.055, 0.1], [0.03, 0.125], [0, 0.125]],
    neck: [[0, 0.125], [0.032, 0.125], [0.022, 0.15], [0.022, 0.2], [0.028, 0.21], [0, 0.21]],
    ny: 0.21,
    cork: 0.02,
    ly: 0.055,
    lr: 0.065,
  };
  const VIAL: Spec = {
    body: [[0, 0], [0.03, 0], [0.034, 0.01], [0.034, 0.14], [0.022, 0.17], [0, 0.17]],
    neck: [[0, 0.17], [0.024, 0.17], [0.02, 0.19], [0.02, 0.23], [0.025, 0.24], [0, 0.24]],
    ny: 0.24,
    cork: 0.016,
    ly: 0.08,
    lr: 0.034,
  };
  const FLASK: Spec = {
    body: [[0, 0], [0.07, 0], [0.075, 0.012], [0.05, 0.07], [0.03, 0.11], [0, 0.11]],
    neck: [[0, 0.11], [0.032, 0.11], [0.022, 0.13], [0.022, 0.2], [0.03, 0.21], [0, 0.21]],
    ny: 0.21,
    cork: 0.02,
    ly: 0.03,
    lr: 0.073,
  };
  const SQUAT: Spec = {
    body: [[0, 0], [0.07, 0], [0.09, 0.03], [0.09, 0.06], [0.05, 0.1], [0, 0.1]],
    neck: [[0, 0.1], [0.045, 0.1], [0.03, 0.12], [0.03, 0.16], [0.036, 0.17], [0, 0.17]],
    ny: 0.17,
    cork: 0.026,
    ly: 0.045,
    lr: 0.09,
  };
  let li = 0;
  const bottle = (spec: Spec, x: number, y: number, z: number, liquid: string, tassel = false) => {
    const body = lathe(spec.body, x, y, z, liquid, 10);
    glow(body, 0.8);
    lathe(spec.neck, x, y, z, GLASS, 10);
    const top = spec.neck[spec.neck.length - 2][1];
    ring(spec.neck[spec.neck.length - 4][0] + 0.004, 0.005, x, y + top - 0.045, z, GOLD, [90, 0, 0], 8);
    cyl(spec.cork * 0.9, spec.cork * 1.15, 0.035, x, y + spec.ny - 0.003, z, CORK, 8);
    b.decal(body, LABELS[li++ % LABELS.length], {
      at: [x, y + spec.ly, z + spec.lr],
      dir: [0, 0, 1],
      size: [Math.min(0.06, spec.lr * 0.9), Math.min(0.075, spec.lr * 1.1)],
    });
    if (tassel)
      b.cards([frame([x, y + spec.ny - 0.06, z + spec.neck[3][0] + 0.004], [0, 1, 0])], TASSEL, {
        size: [0.03, 0.1],
        lean: 180,
        flow: [0, 0, 1],
      });
  };
  bottle(ROUND, 0.56, T, -0.22, CYAN, true);
  bottle(SQUAT, 0.74, T, -0.22, VIOLET);
  bottle(VIAL, 0.9, T, -0.2, PINK, true);
  bottle(FLASK, 0.7, T, 0.08, AMBER);
  bottle(ROUND, 0.9, T, -0.04, GREEN);

  // flask tripod burner and motes
  for (let k = 0; k < 4; k++) {
    glow(ball(0.008 + R() * 0.006, 0.7 + (R() - 0.5) * 0.08, T + 0.26 + k * 0.05, 0.08 + (R() - 0.5) * 0.06, "#ffe29a"), 1);
  }

  // vial rack
  {
    const x = 0.86;
    const z = 0.3;
    box(0.24, 0.025, 0.09, x, T + 0.0125, z, WOOD_DARK);
    box(0.24, 0.12, 0.014, x, T + 0.07, z - 0.04, WOOD_X);
    box(0.24, 0.012, 0.09, x, T + 0.1, z, WOOD_X);
    [VIOLET, CYAN, AMBER].forEach((c, i) => {
      const vx = x - 0.07 + i * 0.07;
      glow(b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 7), c, { at: [vx, T + 0.075, z + 0.005] }), 0.8);
      cyl(0.012, 0.014, 0.03, vx, T + 0.14, z + 0.005, CORK, 6);
    });
    box(0.24, 0.006, 0.094, x, T + 0.02, z, GOLD_D);
  }

  // ---------- mortar and pestle ----------
  {
    const x = 0.4;
    const z = 0.22;
    lathe([[0, 0], [0.06, 0], [0.075, 0.02], [0.1, 0.09], [0.1, 0.1], [0.092, 0.1], [0.066, 0.055], [0, 0.05]], x, T, z, STONE, 10);
    ring(0.097, 0.005, x, T + 0.1, z, GOLD, [90, 0, 0], 10);
    box(0.13, 0.014, 0.01, x, T + 0.012, z + 0.07, GOLD_D);
    for (let k = 0; k < 6; k++) {
      ball(0.012 + R() * 0.008, x + (R() - 0.5) * 0.09, T + 0.058, z + (R() - 0.5) * 0.09, k % 2 ? LEAF : GREEN, [1, 0.6, 1]);
    }
    b.capsule([x - 0.01, T + 0.07, z + 0.01], [x + 0.1, T + 0.3, z - 0.02], [0.016, 0.022], STONE);
    ring(0.02, 0.005, x + 0.08, T + 0.26, z - 0.015, GOLD, [75, 0, 20], 8);
  }

  // ---------- herb pot ----------
  {
    const x = -0.52;
    const z = -0.26;
    const pot = lathe([[0, 0], [0.07, 0], [0.09, 0.14], [0.105, 0.14], [0.105, 0.17], [0.085, 0.17], [0, 0.15]], x, T, z, CLAY, 10);
    ring(0.097, 0.006, x, T + 0.145, z, GOLD, [90, 0, 0], 10);
    b.decal(pot, LABEL_LEAF, { at: [x, T + 0.07, z + 0.085], dir: [0, 0, 1], size: [0.05, 0.062] });
    const hits: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4;
      const rr = 0.012 + (i % 4) * 0.014;
      hits.push(frame([x + Math.cos(a) * rr, T + 0.15, z + Math.sin(a) * rr], [0, 1, 0]));
    }
    b.cards(hits, [LEAF_A, SUNBLOOM], {
      size: [0.085, 0.2],
      lean: 28,
      bend: 20,
      flow: (_f, i) => [Math.cos(i * 2.4), 0, Math.sin(i * 2.4)],
      vary: 0.25,
      rng: rng(11),
      cross: true,
    });
  }

  // ---------- candle ----------
  {
    const x = 0.2;
    const z = -0.3;
    lathe([[0, 0], [0.05, 0], [0.055, 0.012], [0.03, 0.02], [0.012, 0.03], [0, 0.03]], x, T, z, GOLD, 8);
    cyl(0.016, 0.018, 0.12, x, T + 0.09, z, CREAM, 8);
    ball(0.012, x + 0.015, T + 0.115, z + 0.01, CREAM, [0.6, 1.4, 0.6]);
    glow(b.spike([x, T + 0.15, z], [0, 1, 0], 0.045, 0.011, "#ffcf5a", { sides: 6 }), 1.4);
    glow(b.spike([x, T + 0.15, z], [0, 1, 0], 0.025, 0.006, "#fff4c0", { sides: 5 }), 1.6);
    ball(0.025, x, T + 0.16, z, "#ffe9a0", [1.2, 1.8, 1.2]);
  }

  // ---------- back rack: posts, bar, shelf ----------
  const BZ = -0.38;
  for (const sx of [1, -1]) {
    box(0.06, 1.14, 0.06, sx * 0.93, 1.49, BZ + 0.03, WOOD_Y);
    box(0.075, 0.03, 0.075, sx * 0.93, T + 0.015, BZ + 0.03, GOLD_D);
    box(0.075, 0.02, 0.075, sx * 0.93, 1.3, BZ + 0.03, GOLD);
    b.spike([sx * 0.93, 2.06, BZ + 0.03], [0, 1, 0], 0.09, 0.03, GOLD, { sides: 6 });
    ball(0.03, sx * 0.93, 2.06, BZ + 0.03, GOLD);
    b.rod([sx * 0.9, 1.08, BZ + 0.05], [sx * 0.76, 1.285, BZ + 0.05], 0.014, GOLD_D, { sides: 6 });
  }
  b.rod([-0.96, 2.0, BZ + 0.03], [0.96, 2.0, BZ + 0.03], 0.024, WOOD_DARK, { sides: 8 });
  for (const sx of [1, -1]) ball(0.03, sx * 0.97, 2.0, BZ + 0.03, GOLD);
  box(1.8, 0.03, 0.2, 0, 1.3, BZ + 0.1, WOOD_X);
  box(1.8, 0.014, 0.012, 0, 1.3, BZ + 0.208, GOLD);
  box(1.8, 0.006, 0.006, 0, 1.315, BZ + 0.2, GOLD_D);

  // hanging herb bundles
  [-0.78, -0.5, -0.22, 0.06, 0.34, 0.62, 0.84].forEach((x, i) => {
    const y = 2.0;
    b.rod([x, y, BZ + 0.03], [x, y - 0.06, BZ + 0.03], 0.004, CREAM, { sides: 4 });
    ring(0.014, 0.004, x, y - 0.065, BZ + 0.03, RED, [90, 0, 0], 8);
    const fr = [-1, 0, 1].map((k) => frame([x + k * 0.016, y - 0.07, BZ + 0.03 + (k % 2) * 0.008], [0, 1, 0]));
    b.cards(fr, i % 3 === 0 ? [LAVENDER] : i % 3 === 1 ? [LEAF_A, SUNBLOOM] : [LEAF_A, LAVENDER], {
      size: [0.1, 0.27],
      lean: 180,
      flow: [0, 0, 1],
      vary: 0.2,
      rng: rng(20 + i),
      cross: true,
      bend: 10,
    });
  });
  for (const sx of [1, -1])
    b.cards([frame([sx * 0.9, 1.99, BZ + 0.075], [0, 1, 0])], TASSEL, { size: [0.05, 0.22], lean: 180, flow: [0, 0, 1] });

  // shelf jars, scroll, crystals
  const jar = (x: number, liquid: string) => {
    const y = 1.315;
    const z = BZ + 0.1;
    const body = lathe([[0, 0], [0.06, 0], [0.07, 0.02], [0.07, 0.14], [0.06, 0.16], [0.06, 0.17], [0, 0.17]], x, y, z, liquid, 10);
    glow(body, 0.6);
    lathe([[0, 0.17], [0.067, 0.17], [0.067, 0.2], [0.03, 0.21], [0, 0.21]], x, y, z, GOLD, 10);
    ball(0.016, x, y + 0.222, z, GOLD_D);
    ring(0.068, 0.005, x, y + 0.17, z, GOLD_D, [90, 0, 0], 10);
    b.decal(body, LABELS[li++ % LABELS.length], { at: [x, y + 0.08, z + 0.07], dir: [0, 0, 1], size: [0.055, 0.07] });
  };
  jar(-0.74, GREEN);
  jar(-0.58, AMBER);
  jar(-0.42, CYAN);
  jar(-0.26, PINK);
  jar(-0.1, VIOLET);
  // scroll
  cyl(0.026, 0.026, 0.26, 0.2, 1.345, BZ + 0.1, PAGE, 8, [0, 0, 90]);
  for (const s of [1, -1]) cyl(0.018, 0.018, 0.012, 0.2 + s * 0.133, 1.345, BZ + 0.1, WOODD, 8, [0, 0, 90]);
  cyl(0.028, 0.028, 0.02, 0.2, 1.345, BZ + 0.1, RED, 8, [0, 0, 90]);
  ball(0.018, 0.2, 1.345, BZ + 0.125, GOLD, [1, 1, 0.5]);
  // crystal cluster
  [[0.42, 0.16, 0], [0.37, 0.1, 18], [0.47, 0.1, -16]].forEach(([x, h, rz], i) => {
    glow(
      b.part(new THREE.OctahedronGeometry(0.035), i === 0 ? VIOLET : "#c3a3ff", {
        at: [x, 1.315 + h * 0.5, BZ + 0.1],
        scale: [0.7, h / 0.035 * 0.5, 0.7],
        rotation: [0, 20 * i, rz],
      }),
      1.1,
    );
  });
  ring(0.07, 0.012, 0.42, 1.322, BZ + 0.1, GOLD_D, [90, 0, 0], 8);
  // small books on shelf
  book(0.72, 1.315, BZ + 0.1, 0.15, 0.05, 0.18, 12, PLUM, false);
  book(0.72, 1.365, BZ + 0.1, 0.13, 0.04, 0.16, -8, TEAL, true);
  box(0.02, 0.1, 0.02, 0.86, 1.365, BZ + 0.1, GOLD);
  glow(ball(0.025, 0.86, 1.43, BZ + 0.1, CYAN), 1.2);

  // ---------- lower shelf ----------
  {
    const cols = [NAVY, RED, TEAL, PLUM, "#a85a2e", NAVY, "#3f8f6a"];
    cols.forEach((c, i) => {
      const h = 0.2 + (i % 3) * 0.04;
      const x = -0.82 + i * 0.058;
      const lean = i === 6 ? 12 : 0;
      box(0.052, h, 0.2, x + (i === 6 ? 0.02 : 0), SH + h / 2, -0.1, c, [0, 0, -lean]);
      if (i < 6) {
        box(0.054, 0.012, 0.006, x, SH + h * 0.8, 0.0, GOLD);
        box(0.054, 0.008, 0.006, x, SH + h * 0.25, 0.0, GOLD);
        box(0.03, 0.04, 0.004, x, SH + h * 0.52, 0.002, CREAM);
      }
    });
    // barrel
    const bx = -0.2;
    const bz = -0.05;
    lathe([[0, 0], [0.1, 0], [0.12, 0.07], [0.13, 0.15], [0.12, 0.24], [0.1, 0.3], [0, 0.3]], bx, SH, bz, BARREL, 10);
    for (const hy of [0.07, 0.23]) ring(0.123, 0.007, bx, SH + hy, bz, IRON, [90, 0, 0], 10);
    cyl(0.1, 0.1, 0.012, bx, SH + 0.296, bz, WOOD_DARK, 10);
    b.decal(box(0.01, 0.01, 0.01, 0, -5, 0, WOODD), LABEL_FLAME, { at: [bx, SH + 0.15, bz + 0.13], dir: [0, 0, 1], size: [0.01, 0.01] });
    // sack
    const kx = 0.22;
    lathe([[0, 0], [0.14, 0], [0.17, 0.1], [0.15, 0.22], [0.06, 0.3], [0.05, 0.34], [0.09, 0.38], [0, 0.36]], kx, SH, -0.05, SACK, 9);
    ring(0.056, 0.008, kx, SH + 0.31, -0.05, RED, [90, 0, 0], 8);
    b.cards([frame([kx, SH + 0.34, -0.05], [0, 1, 0])], TASSEL, { size: [0.03, 0.08], lean: 150, flow: [0, 0, 1] });
    // big jug
    const jx = 0.62;
    lathe([[0, 0], [0.09, 0], [0.13, 0.08], [0.13, 0.16], [0.07, 0.26], [0.045, 0.3], [0.05, 0.34], [0, 0.34]], jx, SH, -0.05, TEAL, 10);
    ring(0.05, 0.007, jx, SH + 0.3, -0.05, GOLD, [90, 0, 0], 8);
    cyl(0.04, 0.05, 0.04, jx, SH + 0.35, -0.05, CORK, 8);
    ring(0.07, 0.012, jx + 0.12, SH + 0.2, -0.05, TEAL, [0, 0, 0], 8);
    box(0.1, 0.012, 0.01, jx, SH + 0.1, 0.085, GOLD);
    // crate with herbs
    const cx = 0.88;
    box(0.2, 0.012, 0.2, cx, SH + 0.006, 0.1, WOOD_DARK);
    for (const sx of [1, -1]) box(0.012, 0.12, 0.2, cx + sx * 0.094, SH + 0.06, 0.1, WOOD_X);
    for (const sz of [1, -1]) box(0.2, 0.12, 0.012, cx, SH + 0.06, 0.1 + sz * 0.094, WOOD_X);
    for (let k = 0; k < 5; k++) ball(0.04, cx + (R() - 0.5) * 0.1, SH + 0.1, 0.1 + (R() - 0.5) * 0.1, k % 2 ? AMBER : "#e0603c", [1, 0.9, 1]);
  }

  return b.root;
}

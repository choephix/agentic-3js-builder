import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  createBuilder,
  frame,
  rng,
  offset,
  bezier,
  catmull,
  limb,
  DEG,
  paint,
  countershade,
  gradient,
  mottle,
  spots,
  scales,
  patches,
  noise,
  cells,
  mix,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled, gearTrain, gaugeTexture } from "../../../../kits/clockwork";

export const meta = {
  name: "Hen-Legged Wandering House",
  description:
    "A ramshackle patchwork house-machine on two huge chicken legs: a rooster-comb roof, beak porch with a drop-ramp jaw, glowing eye windows, a stone tower with a rooster weathervane, a copper boiler, side gear trains, a peacock-eyed tail fan, lanterns, bunting and laundry.",
};

// ------------------------------------------------------------------------------------------------------------
// Palette (flat colours)
const IRON_D = "#2f2c30";
const WOOD_D = "#4a3425";
const TEAL = "#3f8a82";
const TEAL_D = "#2c5e5b";
const RED = "#b8362a";
const RED_D = "#7e1f1a";
const AMBER = "#ffb340";
const CLAW = "#4b3a2e";
const SMOKE_A = "#dcd7cf";
const SMOKE_B = "#bdb7b0";
const BRASSF = "#c89a3c";
const SCUTE = "#7a561c";
const DARK_RED = "#5a1612";
const BEAK_D = "#2a1810";
const STONE_T = "#6d6a63";
const WHITE = "#ffffff";

type C3 = readonly [number, number, number];

// ------------------------------------------------------------------------------------------------------------
// Metals
const BRASS = metal("brass", { verdigris: 0.25 });
const IRONM = metal("iron", { tarnish: 0.5 });
const COPPER = metal("copper", { verdigris: 0.55, tarnish: 0.4 });
const STEELM = metal("steel");
const BLUEDM = metal("blued");
const HULLP_IRON = panelled(metal("iron", { tarnish: 0.6, seed: 4 }), { size: 0.6, rivets: 0.09 });

// ------------------------------------------------------------------------------------------------------------
// Paints
const WOODS = ["#8a6a45", "#7a5a3a", "#9a7650", "#6f5236", "#a88458", "#5f4630"];

const WALL = paint((p, n) => {
  const rowH = 0.3;
  const r = p.y / rowH;
  const row = Math.floor(r);
  const f = r - row;
  const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
  const cell = cells(p, 1.3, 4);
  const pick = (Math.abs(row) * 2 + Math.floor(cell.id * 6)) % 6;
  const stag = (u + row * 0.47) / 1.15;
  const fs = stag - Math.floor(stag);
  if (f < 0.09 || fs < 0.018) return "#24170f";
  return mix(WOODS[pick], "#3b2a1c", 0.35 * noise(p, 0.12, 2) + 0.3 * (1 - smoothstep(4.2, 5.6, p.y)));
});

const GABLE = paint((p) => {
  const u = p.x / 0.22;
  const k = Math.floor(u);
  const f = u - k;
  if (f < 0.08) return "#24170f";
  return mix(WOODS[(Math.abs(k) * 3) % 6], "#3b2a1c", 0.3 * noise(p, 0.2, 7));
});

const DECK = paint((p) => {
  const u = p.x / 0.24;
  const k = Math.floor(u);
  const f = u - k;
  if (f < 0.06) return "#2c2018";
  return mix(WOODS[Math.abs(k) % 4], "#5a4026", 0.5 * noise(p, 0.25, 3));
});

const HULLP = paint((_p, n) => (n.y > 0.7 ? DECK : HULL_IRON));

function roofPaint(colors: string[], seed: number, col: (p: THREE.Vector3) => number, gable: boolean) {
  const patch = patches("#352826", colors, { size: 0.9, gap: 0.04, seed });
  return paint((p, n) => {
    if (gable && Math.abs(n.z) > 0.75) return GABLE;
    const base = patch.at(p, n);
    const r = p.y / 0.2;
    const row = Math.floor(r);
    const f = r - row;
    const c = col(p) + (row % 2) * 0.5;
    const fc = c - Math.floor(c);
    let k = 0.74 + 0.3 * f;
    if (f < 0.1 || fc < 0.05) k *= 0.6;
    let out: C3 = [Math.min(base[0] * k, 1), Math.min(base[1] * k, 1), Math.min(base[2] * k, 1)];
    if (n.y > 0.55 && noise(p, 0.45, seed + 3) > 0.64) out = mix(out, "#5d7a3a", 0.7);
    return out;
  });
}
const ROOF_MAIN = roofPaint(["#8c4a36", "#4b7f7a", "#c19a4c", "#5f6672", "#7a3b3b"], 3, (p) => p.z / 0.35, true);
const ROOF_ANNEX = roofPaint(["#4b6f93", "#5f6672", "#7f9a6a", "#8c4a36"], 9, (p) => p.z / 0.35, true);
const ROOF_TOWER = roofPaint(
  ["#3f8a82", "#2c5e5b", "#4f9a8f", "#6b8f6a"],
  5,
  (p) => Math.atan2(p.x - 1.9, p.z + 1.5) * 2.9,
  false,
);

const STONEP = scales(["#8d8a80", "#7b7870", "#9a968a", "#85827a"], "#4f4c47", { size: 0.3, width: 0.16, seed: 2 });

const BRICK = paint((p, n) => {
  if (n.y > 0.7) return "#2d2623";
  const u = p.x + p.z;
  const row = Math.floor(p.y / 0.1);
  const col = (u + (row % 2) * 0.12) / 0.24;
  const fy = p.y / 0.1 - row;
  const fx = col - Math.floor(col);
  if (fy < 0.14 || fx < 0.08) return "#b9a98c";
  const id = Math.abs(Math.floor(col) * 7 + row * 13) % 5;
  const c = mix("#9b4a35", "#c2694a", id / 4);
  return mix(c, "#2a2220", 0.7 * smoothstep(9.2, 10.1, p.y));
});

const PLUMAGE = countershade(
  spots(mottle("#9c5b33", "#7d4528", { size: 0.4, seed: 2 }), "#f0d9a8", { size: 0.14, amount: 0.4, seed: 3 }),
  "#c08a58",
  { level: -0.4 },
);
const TARSUS = scales(["#d9a93c", "#c8952f", "#e0b650"], "#6a4a16", { size: 0.1, width: 0.18, seed: 5 });
const BEAK_P = gradient(countershade("#f2b83e", "#d98a2b"), "#a85a1c", [0, 6.8, 2.4], [0, 6.8, 3.3]);
const COMB_P = gradient("#8f1d1d", "#e0452f", [0, 9.3, 0], [0, 10.2, 0]);
const RAMP_P = paint((p, n) => (n.y > 0.6 ? DECK : (BEAK_P.at(p, n) as C3)));

function featherPaint(len: number) {
  return paint((_p, _n, s) => {
    const [x, y] = s;
    const t = x / len;
    if (Math.abs(y) < 0.016 && t > 0.03) return "#efe3b4";
    const d = Math.hypot(x - len * 0.8, y);
    if (d < 0.04) return "#15244a";
    if (d < 0.08) return "#2f8f8a";
    if (d < 0.12) return "#e0b13a";
    if (d < 0.15) return "#1f5a50";
    let c: C3 =
      t < 0.35 ? mix("#b4552a", "#d58a2f", t / 0.35) : mix("#d58a2f", "#2f8068", smoothstep(0.35, 0.7, t));
    if (Math.sin(x * 26 - Math.abs(y) * 36) > 0.75) c = mix(c, "#102a24", 0.16);
    return c;
  });
}

// ------------------------------------------------------------------------------------------------------------
// Textures
const TUFT_A = svg(
  `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 79 C4 62 3 30 21 3 Q24 0 27 3 C45 30 44 62 24 79Z" fill="#9a5a30" stroke="#3a2214" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M24 74 L24 10" stroke="#3a2214" stroke-width="2" fill="none"/>
  <path d="M24 62 L11 46 M24 54 L37 38 M24 44 L13 29 M24 34 L34 20" stroke="#d3995b" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M17 20 Q24 8 31 20" fill="#f2dcae" opacity="0.8"/></svg>`,
  { size: 128 },
);
const TUFT_B = svg(
  `<svg viewBox="0 0 48 80" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 79 C6 64 5 32 22 4 Q24 1 26 4 C43 32 42 64 24 79Z" fill="#e9d3a2" stroke="#4a2c18" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M24 74 L24 10" stroke="#4a2c18" stroke-width="2" fill="none"/>
  <path d="M12 52 Q24 44 36 52 M13 38 Q24 30 35 38 M16 24 Q24 17 32 24" stroke="#7a4b2a" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>`,
  { size: 128 },
);
const GRASS = svg(
  `<svg viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 48 Q8 24 2 6 Q14 18 14 48Z M15 48 Q16 20 14 2 Q26 16 24 48Z M24 48 Q28 24 36 8 Q38 28 32 48Z" fill="#6c8a3a" stroke="#2f4a1c" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M19 46 Q20 26 17 10" stroke="#a6c25c" stroke-width="1.8" fill="none"/></svg>`,
  { size: 96 },
);
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="i" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#fff0a0"/><stop offset="0.6" stop-color="#ffb02e"/><stop offset="1" stop-color="#d9631a"/></radialGradient></defs>
  <circle cx="50" cy="50" r="49" fill="#2a1a10"/>
  <circle cx="50" cy="50" r="45" fill="url(#i)"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="#c4561a" stroke-width="1.6" stroke-dasharray="3 4"/>
  <ellipse cx="50" cy="52" rx="19" ry="23" fill="#150c10"/>
  <circle cx="39" cy="38" r="9" fill="#ffffff"/><circle cx="61" cy="64" r="4" fill="#ffffff" opacity="0.8"/></svg>`,
  { size: 192 },
);
const DOOR = svg(
  `<svg viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 100 L2 34 A28 28 0 0 1 58 34 L58 100Z" fill="#5d5448" stroke="#2b2520" stroke-width="2.5"/>
  <path d="M6 100 L6 35 A24 24 0 0 1 54 35 L54 100Z" fill="#6b4a2d" stroke="#2a1b10" stroke-width="2"/>
  <path d="M15 100 V16 M23 100 V12 M30 100 V11 M37 100 V12 M45 100 V16" stroke="#2a1b10" stroke-width="1.6"/>
  <rect x="6" y="52" width="48" height="5" fill="#2f2b2e"/><rect x="6" y="80" width="48" height="5" fill="#2f2b2e"/>
  <g fill="#c89a3c"><circle cx="10" cy="54.5" r="1.5"/><circle cx="50" cy="54.5" r="1.5"/><circle cx="10" cy="82.5" r="1.5"/><circle cx="50" cy="82.5" r="1.5"/></g>
  <circle cx="30" cy="32" r="9" fill="#ffc760" stroke="#c89a3c" stroke-width="2.2"/><path d="M30 23 V41 M21 32 H39" stroke="#6b4a2d" stroke-width="1.6"/>
  <circle cx="45" cy="68" r="3.6" fill="none" stroke="#c89a3c" stroke-width="1.8"/>
  <path d="M26 2 H34 L32 9 H28Z" fill="#8d8a80" stroke="#2b2520" stroke-width="1.2"/></svg>`,
  { size: 256 },
);
const WINDOW = svg(
  `<svg viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a6"/><stop offset="1" stop-color="#ffab3d"/></linearGradient></defs>
  <rect x="2" y="2" width="44" height="52" rx="3" fill="#4a3322" stroke="#24160c" stroke-width="2"/>
  <rect x="7" y="7" width="34" height="42" fill="url(#g)"/>
  <path d="M24 7 V49 M7 28 H41" stroke="#4a3322" stroke-width="2.6"/>
  <path d="M7 7 Q14 22 8 49 H7Z M41 7 Q34 22 40 49 H41Z" fill="#c44a3a" opacity="0.85"/>
  <path d="M28 49 L28 40 L33 40 L33 49Z" fill="#6b3a2a"/><path d="M30.5 40 Q26 33 30 30 Q31 36 34 31 Q36 36 30.5 40Z" fill="#3f7a3a"/>
  <rect x="0" y="52" width="48" height="8" rx="2" fill="#6e4f33" stroke="#24160c" stroke-width="1.6"/></svg>`,
  { size: 192 },
);
const PORTHOLE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="p" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="#fff0b0"/><stop offset="1" stop-color="#ff9f33"/></radialGradient></defs>
  <circle cx="32" cy="32" r="31" fill="#b88a34" stroke="#4a3010" stroke-width="2"/>
  <circle cx="32" cy="32" r="24" fill="url(#p)" stroke="#4a3010" stroke-width="2.4"/>
  <path d="M32 8 V56 M8 32 H56" stroke="#7a5418" stroke-width="3"/>
  <g fill="#e9c66a"><circle cx="32" cy="4.5" r="1.8"/><circle cx="32" cy="59.5" r="1.8"/><circle cx="4.5" cy="32" r="1.8"/><circle cx="59.5" cy="32" r="1.8"/></g>
  <ellipse cx="22" cy="21" rx="6" ry="3" fill="#ffffff" opacity="0.7" transform="rotate(-35 22 21)"/></svg>`,
  { size: 160 },
);
const SIGN = svg(
  `<svg viewBox="0 0 120 50" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="116" height="46" rx="5" fill="#7a5a3a" stroke="#2a1b10" stroke-width="3"/>
  <rect x="7" y="7" width="106" height="36" rx="3" fill="none" stroke="#e2b64a" stroke-width="1.6"/>
  <text x="70" y="31" text-anchor="middle" font-family="serif" font-weight="bold" font-size="17" fill="#f3e2b0" stroke="#2a1b10" stroke-width="0.6">THE ROOST</text>
  <ellipse cx="24" cy="27" rx="10" ry="7.5" fill="#d9782f" stroke="#2a1b10" stroke-width="1.6"/>
  <circle cx="31" cy="19" r="4.6" fill="#d9782f" stroke="#2a1b10" stroke-width="1.6"/><path d="M35 19 L40 21 L35 22Z" fill="#e8b43a"/>
  <path d="M28 14 Q30 9 32 14 Q34 10 34 15" fill="#c8302a"/><circle cx="32.5" cy="18" r="1" fill="#1a1018"/></svg>`,
  { size: 256 },
);
const BANNER = svg(
  `<svg viewBox="0 0 40 110" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 108 L38 108 L38 6 L20 28 L2 6Z" fill="#c9462f" stroke="#f0dfae" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M7 108 V30 M33 108 V30" stroke="#f0dfae" stroke-width="1.4" stroke-dasharray="4 3"/>
  <circle cx="20" cy="78" r="10" fill="#f3c24a" stroke="#6a2a10" stroke-width="1.6"/>
  <path d="M20 62 V66 M20 90 V94 M4 78 H8 M32 78 H36 M9 67 L12 70 M31 67 L28 70 M9 89 L12 86 M31 89 L28 86" stroke="#f3c24a" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M10 50 Q15 44 20 50 T30 50" stroke="#f0dfae" stroke-width="2" fill="none"/></svg>`,
  { size: 160 },
);
const flagTex = (fill: string, trim: string) =>
  svg(
    `<svg viewBox="0 0 36 40" xmlns="http://www.w3.org/2000/svg">
  <path d="M1 39 L35 39 L18 3Z" fill="${fill}" stroke="#2a1b10" stroke-width="2" stroke-linejoin="round"/>
  <path d="M7 35 L29 35 L18 12Z" fill="none" stroke="${trim}" stroke-width="1.4" stroke-dasharray="3 2"/>
  <circle cx="18" cy="29" r="2.4" fill="${trim}"/></svg>`,
    { size: 96 },
  );
const FLAG_R = flagTex("#c9462f", "#f0dfae");
const FLAG_O = flagTex("#e0a73c", "#6a2a10");
const FLAG_T = flagTex("#3f8a82", "#f0dfae");
const SHIRT = svg(
  `<svg viewBox="0 0 60 64" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,64) scale(1,-1)">
  <path d="M18 4 L4 14 L10 26 L16 22 L16 60 L44 60 L44 22 L50 26 L56 14 L42 4 Q30 14 18 4Z" fill="#dfe6ee" stroke="#3a4a5e" stroke-width="2" stroke-linejoin="round"/>
  <path d="M16 30 H44 M16 40 H44 M16 50 H44" stroke="#5b82b8" stroke-width="3"/></g></svg>`,
  { size: 128 },
);
const SHEET = svg(
  `<svg viewBox="0 0 60 64" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 62 L56 62 L56 2 L4 2Z" fill="#efe6cc" stroke="#6a5a40" stroke-width="2"/>
  <rect x="6" y="40" width="22" height="20" fill="#7fa3a0"/><rect x="32" y="8" width="22" height="18" fill="#d9a85a"/><rect x="30" y="30" width="24" height="30" fill="#c9786a" opacity="0.8"/>
  <path d="M6 28 H54 M30 4 V60" stroke="#6a5a40" stroke-width="1.2" stroke-dasharray="3 2"/></svg>`,
  { size: 128 },
);
const GAUGE = gaugeTexture({ needle: 50, label: "STEAM" });

// ------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "hen-legged-house", paintSize: 2048 });
  const R = rng(7);
  const PT = 4.2; // platform top
  const RY = 7.7; // roof base
  const PEAK = 1.7;

  const hull = b.joint("hull", { at: [0, 3.9, 0], role: "spine" });
  type J = typeof hull;
  const TC = [1.9, PT, -1.5];
  const TH = 4.8;
  const towerJ = b.joint("tower", { parent: hull, at: TC, dir: [0, 1, 0] });
  const tail1 = b.joint("tail1", { parent: hull, at: [0, 5.0, -2.9], dir: [0, 0.55, -1], role: "tail" });

  // ---- helpers
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: hull, at, ...o });
  const bucket = (color: any, bone: J = hull) => {
    const geos: THREE.BufferGeometry[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    return {
      add(geo: THREE.BufferGeometry, pos: number[], rot: number[] = [0, 0, 0], scl: number[] = [1, 1, 1]) {
        e.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG);
        q.setFromEuler(e);
        m.compose(new THREE.Vector3(pos[0], pos[1], pos[2]), q, new THREE.Vector3(scl[0], scl[1], scl[2]));
        const g = geo.index ? geo.toNonIndexed() : geo.clone();
        g.applyMatrix4(m);
        geos.push(g);
      },
      flush() {
        if (geos.length) b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
      },
    };
  };
  const timber = bucket(WOOD_D);
  const posts = bucket(WOOD_D);
  const rivets = bucket(BRASSF);
  const bolts = bucket(IRONM);
  const towerPosts = bucket(WOOD_D, towerJ);
  const towerRings = bucket(IRONM, towerJ);

  const win = (at: number[], dir: number[], w: number, h: number, tex: THREE.Texture, round = false) => {
    b.part(new THREE.BoxGeometry(w + 0.14, round ? w + 0.14 : h + 0.14, 0.07), WOOD_D, { bone: hull, at, dir, axis: "z" });
    glow(
      b.part(round ? new THREE.CircleGeometry(w / 2, 24) : new THREE.PlaneGeometry(w, h), WHITE, {
        bone: hull,
        at: offset(at, dir, 0.045),
        dir,
        axis: "z",
        texture: tex,
      }),
      1.1,
    );
  };

  const lantern = (x: number, y: number, z: number, color: string, size = 0.2, drop = 0.4) => {
    b.rod([x, y, z], [x, y - drop, z], 0.014, IRON_D, { bone: hull });
    const cy = y - drop - size * 1.2;
    glow(b.part(new THREE.SphereGeometry(size, 8, 6), color, { bone: hull, at: [x, cy, z], scale: [1, 1.25, 1] }), 1.4);
    b.part(new THREE.ConeGeometry(size * 1.1, size * 0.8, 8), IRON_D, { bone: hull, at: [x, cy + size * 1.5, z] });
    b.part(new THREE.CylinderGeometry(size * 0.6, size * 0.5, size * 0.3, 8), IRON_D, { bone: hull, at: [x, cy - size * 1.3, z] });
    b.spike([x, cy - size * 1.4, z], [0, -1, 0], size * 1.4, size * 0.16, { bone: hull, color: AMBER });
  };

  // =========================================================================================================
  // PLATFORM
  b.loft(
    [
      { at: [0, 3.9, -2.8], w: 3.4, h: 0.6 },
      { at: [0, 3.9, -2.2], w: 5.0, h: 0.6 },
      { at: [0, 3.9, 0], w: 5.6, h: 0.6 },
      { at: [0, 3.9, 1.9], w: 5.2, h: 0.6 },
      { at: [0, 3.9, 2.8], w: 2.4, h: 0.6 },
    ],
    { bone: hull, color: HULLP },
  );

  // =========================================================================================================
  // LEGS
  const legSweeps: any[] = [];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = new THREE.Vector3(s * 1.3, 3.8, 0.1);
    const footP = new THREE.Vector3(s * 1.3, 0.17, 0.4);
    const pts = limb(hipP, footP, [1.5, 1.75, 1.7], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hull,
      role: "leg",
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      contact: [s * 1.3, 0, 0.4],
    });
    const L = [0, 1, 2].map((i) => pts[i].distanceTo(pts[i + 1]));
    const tot = L[0] + L[1] + L[2];
    const tK = L[0] / tot;
    const tH = (L[0] + L[1]) / tot;
    const rad = (t: number) => {
      if (t < tK) return 0.52 - 0.06 * (t / tK);
      if (t < tH) return 0.46 - 0.17 * ((t - tK) / (tH - tK));
      const u = Math.min(1, (t - tH) / 0.07);
      return 0.29 - 0.12 * u - 0.02 * Math.max(0, (t - tH - 0.07) / 0.3);
    };
    const sw = b.sweep(leg, rad, {
      sides: 10,
      bands: [
        [tH + 0.02, PLUMAGE],
        [1, TARSUS],
      ],
    });
    legSweeps.push(sw);
    const hits = b.surface(sw).scatter(46, {
      rng: rng(11 + (s > 0 ? 1 : 2)),
      minDist: 0.2,
      filter: (h) => h.at.y > pts[2].y - 0.1,
    });
    b.cards(hits, [TUFT_A, TUFT_B], {
      size: [0.36, 0.62],
      lean: 50,
      flow: [0, -1, -0.15],
      bend: 20,
      vary: 0.3,
      rng: rng(5 + (s > 0 ? 0 : 3)),
      cross: true,
    });

    // hip socket
    b.part(new THREE.CylinderGeometry(0.78, 0.78, 0.14, 10), IRONM, { bone: hull, at: [s * 1.3, 3.6, 0.3] });
    b.part(new THREE.TorusGeometry(0.6, 0.09, 6, 14), BRASS, { bone: hull, at: [s * 1.3, 3.55, 0.3], dir: [0, 1, 0], axis: "z" });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      bolts.add(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), [s * 1.3 + Math.sin(a) * 0.7, 3.5, 0.3 + Math.cos(a) * 0.7]);
    }

    // ankle, toes, claws
    const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.2, 8, 6), TARSUS, { bone: ankle, at: pts[3] });
    const toeSet = [
      { a: -0.52, l: 1.05, r: 0.15 },
      { a: 0, l: 1.3, r: 0.15 },
      { a: 0.52, l: 1.05, r: 0.15 },
      { a: Math.PI, l: 0.65, r: 0.13 },
    ];
    toeSet.forEach((t, k) => {
      const d = new THREE.Vector3(Math.sin(t.a), 0, Math.cos(t.a));
      const base = new THREE.Vector3(pts[3].x, 0.16, pts[3].z);
      const pm = base.clone().addScaledVector(d, t.l * 0.5);
      pm.y = 0.145;
      const pe = base.clone().addScaledVector(d, t.l);
      pe.y = 0.105;
      const nm = `toe${k}${side}`;
      const toe = b.chain(nm, [base, pm, pe], {
        parent: ankle,
        role: "digit",
        names: [`${nm}a`, `${nm}b`, `${nm}c`],
      });
      const tsw = b.sweep(toe, [t.r, t.r * 0.58], { color: TARSUS, sides: 6 });
      b.along(tsw, 3, (at) => b.stick(new THREE.BoxGeometry(0.22, 0.03, 0.05), SCUTE, at, { embed: 0.5 }));
      const c1 = pe.clone().addScaledVector(d, 0.22);
      const c2 = pe.clone().addScaledVector(d, 0.42);
      c2.y = 0.045;
      b.sweep(bezier(pe, c1, c2), [0.095, 0], { bone: toe.tip ?? toe.joints[toe.joints.length - 1], color: CLAW, sides: 6 });
    });
    // spur
    const sp = pts[2].clone().lerp(pts[3], 0.35);
    sp.z -= 0.14;
    b.spike(sp, [0, -0.5, -1], 0.32, 0.075, { bone: leg.joints[2], color: CLAW });
  }

  // =========================================================================================================
  // HALL
  const HY = PT + 1.7;
  box(3.6, 3.4, 3.4, WALL, [0, HY, 0]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) timber.add(new THREE.BoxGeometry(0.22, 3.5, 0.22), [sx * 1.8, HY, sz * 1.7]);
  for (const y of [PT + 1.2, PT + 2.5]) {
    timber.add(new THREE.BoxGeometry(3.7, 0.14, 0.1), [0, y, 1.72]);
    timber.add(new THREE.BoxGeometry(3.7, 0.14, 0.1), [0, y, -1.72]);
    timber.add(new THREE.BoxGeometry(0.1, 0.14, 3.5), [1.82, y, 0]);
    timber.add(new THREE.BoxGeometry(0.1, 0.14, 3.5), [-1.82, y, 0]);
  }
  timber.add(new THREE.BoxGeometry(3.9, 0.16, 3.7), [0, RY - 0.08, 0]);
  for (const s of [1, -1]) {
    timber.add(new THREE.BoxGeometry(0.1, 1.9, 0.08), [s * 1.25, 5.15, 1.73], [0, 0, s * 28]);
    timber.add(new THREE.BoxGeometry(0.1, 2.2, 0.08), [s * 0.8, 5.3, -1.73], [0, 0, -s * 22]);
  }
  // metal patches
  const plate = (x: number, y: number, w: number, h: number, color: any) => {
    box(w, h, 0.05, color, [x, y, 1.74]);
    for (const dx of [-1, 1])
      for (const dy of [-1, 1]) rivets.add(new THREE.SphereGeometry(0.03, 5, 4), [x + (dx * (w - 0.1)) / 2, y + (dy * (h - 0.1)) / 2, 1.77]);
  };
  plate(-1.45, 4.6, 0.5, 0.42, COPPER);
  plate(1.5, 4.55, 0.42, 0.62, STEELM);
  plate(1.45, 6.0, 0.5, 0.4, BLUEDM);

  // windows on hall sides + back
  const winL = [
    [1.8, 5.4, 0.75],
    [1.8, 6.85, 0.75],
  ];
  for (const [x, y, z] of winL) win([x, y, z], [1, 0, 0], 0.7, y > 6 ? 0.8 : 1.0, WINDOW);
  for (const y of [5.4, 6.85]) win([-1.8, y, 1.25], [-1, 0, 0], 0.7, y > 6 ? 0.8 : 1.0, WINDOW);
  win([0.2, 6.0, -1.7], [0, 0, -1], 0.8, 1.0, WINDOW);
  win([-1.0, 6.9, -1.7], [0, 0, -1], 0.6, 0.75, WINDOW);
  for (const z of [0.25, 1.25]) box(0.07, 1.0, 0.3, TEAL, [1.86, 5.4, z]);

  // =========================================================================================================
  // MAIN ROOF + COMB
  const roof = b.extrude(
    [
      [-2.1, 0, "sharp"],
      [0.1, PEAK, "sharp"],
      [2.1, 0, "sharp"],
    ],
    { at: [0, RY, 0], x: [1, 0, 0], thickness: 3.9, color: ROOF_MAIN, bone: hull },
  );
  for (const z of [1.97, -1.97]) {
    b.rod([-2.12, RY, z], [0.1, RY + PEAK, z], 0.06, WOOD_D, { bone: hull });
    b.rod([2.12, RY, z], [0.1, RY + PEAK, z], 0.06, WOOD_D, { bone: hull });
  }
  b.extrude(
    [
      [-1.9, 0],
      [-1.9, 0.3],
      [-1.6, 0.55],
      [-1.3, 0.3],
      [-1.0, 0.7],
      [-0.7, 0.35],
      [-0.3, 0.8],
      [0, 0.4],
      [0.35, 0.85],
      [0.7, 0.4],
      [1.1, 0.7],
      [1.4, 0.3],
      [1.7, 0.5],
      [1.9, 0.15],
      [1.9, 0],
    ],
    { at: [0.1, RY + PEAK - 0.08, 0], x: [0, 0, 1], thickness: 0.2, color: COMB_P, bone: hull },
  );
  // attic round window on gable
  b.part(new THREE.TorusGeometry(0.45, 0.06, 6, 18), BRASS, { bone: hull, at: [0.1, RY + 0.8, 1.97] });
  glow(
    b.part(new THREE.CircleGeometry(0.42, 24), WHITE, { bone: hull, at: [0.1, RY + 0.8, 1.985], dir: [0, 0, 1], axis: "z", texture: PORTHOLE }),
    1.1,
  );
  // moss tufts on roof
  const tufts = b.surface(roof).scatter(34, { rng: rng(21), minDist: 0.35, filter: (h) => h.n.y > 0.6 });
  b.cards(tufts, GRASS, { size: [0.22, 0.3], lean: 8, vary: 0.35, rng: rng(22), cross: true });

  // =========================================================================================================
  // FACE: eyes, lids, beak, door, jaw
  for (const s of [1, -1]) {
    const ex = s * 1.15;
    b.part(new THREE.TorusGeometry(0.44, 0.06, 6, 18), BRASS, { bone: hull, at: [ex, 6.8, 1.72] });
    glow(
      b.part(new THREE.CircleGeometry(0.42, 24), WHITE, { bone: hull, at: [ex, 6.8, 1.722], dir: [0, 0, 1], axis: "z", texture: EYE }),
      0.9,
    );
    const lid: [number, number][] = [];
    for (let d = 15; d <= 165; d += 15) lid.push([0.52 * Math.cos(d * DEG), 0.52 * Math.sin(d * DEG)]);
    const a = -s * 0.15;
    b.extrude(lid, {
      at: [ex, 6.8 + 0.03, 1.78],
      x: [Math.cos(a), Math.sin(a), 0],
      y: [-Math.sin(a), Math.cos(a), 0],
      thickness: 0.1,
      color: TEAL_D,
      bone: hull,
    });
    // lashes
    for (let k = 0; k < 3; k++)
      b.spike([ex + s * (0.22 + k * 0.12), 7.12 - k * 0.04, 1.82], [s * (0.5 + k * 0.3), 0.8, 0.2], 0.2, 0.025, { bone: hull, color: IRON_D });
  }
  const upperBeak = b.part(new THREE.ConeGeometry(0.68, 1.5, 4), BEAK_P, {
    bone: hull,
    at: [0, 6.85, 2.4],
    dir: [0, 0, 1],
    scale: [1, 1, 0.62],
  });
  const beakSurf = b.surface(upperBeak);
  for (const s of [1, -1]) {
    const hit = beakSurf.around([0, 6.85, 2.4]).at(s * 38, 22);
    if (hit) b.stick(new THREE.SphereGeometry(0.06, 6, 4), BEAK_D, hit, { embed: 0.4, scale: [1.5, 0.8, 1] });
  }
  // door
  b.part(new THREE.PlaneGeometry(1.32, 2.2), WHITE, { bone: hull, at: [0, PT + 1.1, 1.715], dir: [0, 0, 1], axis: "z", texture: DOOR });
  box(1.6, 0.1, 0.45, STONE_T, [0, PT + 0.05, 1.95]);

  // lower beak = drop ramp jaw
  const RAMP = 14 * DEG;
  const rd = new THREE.Vector3(0, -Math.sin(RAMP), Math.cos(RAMP));
  const hinge = new THREE.Vector3(0, PT - 0.12, 2.72);
  const jaw = b.joint("jaw", { parent: hull, at: hinge, dir: rd, role: "jaw" });
  const at = (d: number) => hinge.clone().addScaledVector(rd, d);
  b.loft(
    [
      { at: at(0.05), w: 1.7, h: 0.18 },
      { at: at(0.9), w: 1.3, h: 0.18 },
      { at: at(1.7), w: 0.7, h: 0.22 },
    ],
    { bone: jaw, color: RAMP_P },
  );
  for (let d = 0.3; d < 1.65; d += 0.28) {
    const wd = 1.7 - (d / 1.7) * 1.0;
    b.part(new THREE.BoxGeometry(wd * 0.85, 0.05, 0.05), WOOD_D, { bone: jaw, at: offset(at(d), [0, 1, 0], 0.1), dir: rd });
  }
  for (const s of [1, -1]) {
    // lamp posts + chains to ramp
    const px = s * 1.25;
    box(0.1, 1.6, 0.1, WOOD_D, [px, PT + 0.8, 2.55]);
    lantern(px, PT + 1.7, 2.55, s > 0 ? AMBER : AMBER, 0.17, 0.3);
    const tip = at(1.65).add(new THREE.Vector3(s * 0.3, 0.1, 0));
    const top = new THREE.Vector3(px, PT + 1.2, 2.55);
    const mid = top.clone().lerp(tip, 0.5);
    mid.y -= 0.18;
    b.sweep(catmull([top, mid, tip]), 0.025, { bone: hull, color: IRON_D, sides: 4 });
    // wattle lanterns
    lantern(s * 0.55, 3.62, 2.4, RED, 0.2, 0.3);
  }

  // =========================================================================================================
  // ANNEX
  const ANX = -2.4;
  box(1.3, 2.0, 2.0, WALL, [ANX, PT + 1.0, -0.4]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) timber.add(new THREE.BoxGeometry(0.16, 2.1, 0.16), [ANX + sx * 0.65, PT + 1.0, -0.4 + sz * 1.0]);
  b.extrude(
    [
      [-0.95, 0, "sharp"],
      [0, 0.9, "sharp"],
      [0.95, 0, "sharp"],
    ],
    { at: [ANX, PT + 2.0, -0.4], x: [1, 0, 0], thickness: 2.3, color: ROOF_ANNEX, bone: hull },
  );
  win([ANX - 0.67, PT + 1.0, -0.4], [-1, 0, 0], 0.7, 0.85, WINDOW);
  // sign
  box(1.0, 0.5, 0.06, "#7a5a3a", [ANX, PT + 1.15, 0.62]);
  b.part(new THREE.PlaneGeometry(0.98, 0.41), WHITE, { bone: hull, at: [ANX, PT + 1.15, 0.665], dir: [0, 0, 1], axis: "z", texture: SIGN });
  b.rod([ANX - 0.4, PT + 1.4, 0.64], [ANX - 0.4, PT + 1.7, 0.64], 0.015, IRON_D, { bone: hull });
  b.rod([ANX + 0.4, PT + 1.4, 0.64], [ANX + 0.4, PT + 1.7, 0.64], 0.015, IRON_D, { bone: hull });
  // banner on annex ridge
  b.rod([ANX, PT + 2.8, 0.5], [ANX, PT + 4.3, 0.5], 0.03, WOOD_D, { bone: hull });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), BRASS, { bone: hull, at: [ANX, PT + 4.34, 0.5] });
  b.cards([frame([ANX, PT + 4.1, 0.5], [0, 0, -1])], BANNER, { size: [0.42, 1.3], lean: 0, flow: [1, 0, 0], bone: hull });

  // =========================================================================================================
  // TOWER
  const tower = b.lathe(
    [
      [0, 0],
      [1.0, 0],
      [1.0, 0.12],
      [0.9, 0.25],
      [0.86, TH - 0.55],
      [0.98, TH - 0.32],
      [1.06, TH - 0.12],
      [1.06, TH],
      [0, TH],
    ],
    { at: TC, segments: 14, color: STONEP, bone: towerJ },
  );
  b.lathe(
    [
      [0, 0],
      [1.4, 0],
      [1.3, 0.18],
      [0.8, 0.6],
      [0.45, 1.15],
      [0.2, 1.7],
      [0, 2.05],
    ],
    { at: [TC[0], TC[1] + TH, TC[2]], segments: 14, color: ROOF_TOWER, bone: towerJ, smoothing: 1 },
  );
  // balcony
  const BY = PT + TH - 1.0;
  b.lathe(
    [
      [0, -0.12],
      [1.55, -0.12],
      [1.55, 0.05],
      [0, 0.05],
    ],
    { at: [TC[0], BY, TC[2]], segments: 14, color: DECK, bone: towerJ },
  );
  const rimTop = BY + 0.85;
  const balconyPts: number[][] = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const x = TC[0] + Math.sin(a) * 1.42;
    const z = TC[2] + Math.cos(a) * 1.42;
    towerPosts.add(new THREE.BoxGeometry(0.07, 0.85, 0.07), [x, BY + 0.43, z]);
    balconyPts.push([x, rimTop, z]);
  }
  towerRings.add(new THREE.TorusGeometry(1.42, 0.04, 5, 24), [TC[0], rimTop, TC[2]], [90, 0, 0]);
  towerRings.add(new THREE.TorusGeometry(1.42, 0.025, 5, 24), [TC[0], BY + 0.45, TC[2]], [90, 0, 0]);
  // bunting around the balcony
  const buntFrames: ReturnType<typeof frame>[] = [];
  for (let k = 0; k < 12; k++) {
    const a = balconyPts[k];
    const c = balconyPts[(k + 1) % 12];
    const mid = [(a[0] + c[0]) / 2, rimTop - 0.2, (a[2] + c[2]) / 2];
    const mm = [mid[0] + (mid[0] - TC[0]) * 0.06, mid[1], mid[2] + (mid[2] - TC[2]) * 0.06];
    const p = catmull([a, mm, c]);
    b.sweep(p, 0.012, { bone: towerJ, color: IRON_D, sides: 4 });
    for (let i = 0; i < 3; i++) buntFrames.push(frame(p.at((i + 0.5) / 3), [0, 1, 0]));
  }
  b.cards(buntFrames, [FLAG_R, FLAG_O, FLAG_T], { size: [0.26, 0.34], lean: 180, flow: [0, 0, 1], rng: rng(31), bone: towerJ });
  // porthole decals
  const towerSurf = b.surface(tower);
  const portholes: [number, number][] = [
    [50, 1.5],
    [60, 2.9],
    [-130, 2.2],
  ];
  for (const [az, h] of portholes) {
    const hit = towerSurf.around([TC[0], TC[1] + h, TC[2]]).at(az, 0);
    if (hit) glow(b.decal(tower, PORTHOLE, { at: hit, size: [0.6, 0.6], segments: 8, bone: towerJ }), 1.1);
  }
  // weathervane
  const vane = b.joint("vane", { parent: towerJ, at: [TC[0], TC[1] + TH + 1.95, TC[2]], dir: [0, 1, 0], role: "hinge" });
  const vy = TC[1] + TH + 1.95;
  b.rod([TC[0], vy - 0.1, TC[2]], [TC[0], vy + 1.0, TC[2]], 0.03, IRON_D, { bone: vane });
  b.rod([TC[0] - 0.5, vy + 0.4, TC[2]], [TC[0] + 0.5, vy + 0.4, TC[2]], 0.02, IRON_D, { bone: vane });
  b.rod([TC[0], vy + 0.4, TC[2] - 0.5], [TC[0], vy + 0.4, TC[2] + 0.5], 0.02, IRON_D, { bone: vane });
  const rooster: [number, number][] = [
    [-0.35, 0.05],
    [0.0, -0.05],
    [0.28, 0.0],
    [0.4, 0.12],
    [0.42, 0.3],
    [0.46, 0.42],
    [0.58, 0.46],
    [0.62, 0.5],
    [0.46, 0.56],
    [0.46, 0.66],
    [0.4, 0.72],
    [0.36, 0.66],
    [0.32, 0.74],
    [0.28, 0.66],
    [0.28, 0.5],
    [0.22, 0.3],
    [0.05, 0.2],
    [-0.2, 0.4],
    [-0.38, 0.62],
    [-0.44, 0.35],
    [-0.46, 0.2],
  ].map(([x, y]) => [x * 0.8, y * 0.8] as [number, number]);
  b.extrude(rooster, { at: [TC[0], vy + 0.95, TC[2]], x: [0, 0, 1], thickness: 0.035, color: BRASS, bone: vane });

  // =========================================================================================================
  // CHIMNEY + SMOKE
  const CX = -0.9;
  const CZ = 0.4;
  box(0.62, 2.1, 0.62, BRICK, [CX, 8.95, CZ]);
  box(0.84, 0.14, 0.84, STONE_T, [CX, 10.07, CZ]);
  for (const dx of [-0.17, 0.17]) b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.34, 8), RED_D, { bone: hull, at: [CX + dx, 10.3, CZ] });
  for (let k = 0; k < 6; k++)
    b.part(new THREE.IcosahedronGeometry(0.28 + k * 0.1, 1), k % 2 ? SMOKE_B : SMOKE_A, {
      bone: hull,
      at: [CX - 0.15 * k - 0.1, 10.7 + 0.58 * k, CZ - 0.28 * k],
      flat: true,
    });

  // =========================================================================================================
  // BOILER + PIPE
  const BX = -1.1;
  const BZ = -2.2;
  const BYc = PT + 0.5;
  b.lathe(
    [
      [0, -1.4],
      [0.36, -1.36],
      [0.5, -1.15],
      [0.5, 1.15],
      [0.36, 1.36],
      [0, 1.4],
    ],
    { at: [BX, BYc, BZ], axis: [1, 0, 0], segments: 12, color: COPPER, bone: hull },
  );
  for (const dx of [-0.85, 0, 0.85])
    b.part(new THREE.TorusGeometry(0.51, 0.035, 5, 14), BRASS, { bone: hull, at: [BX + dx, BYc, BZ], dir: [1, 0, 0], axis: "z" });
  for (const dx of [-0.8, 0.8]) box(0.4, 0.3, 0.9, WOOD_D, [BX + dx, PT + 0.15, BZ]);
  // gauge on top-back
  const gN = new THREE.Vector3(0, 0.7, -0.7).normalize();
  const gP = new THREE.Vector3(BX + 0.9, BYc, BZ).addScaledVector(gN, 0.48);
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 14), BRASS, { bone: hull, at: gP, dir: gN });
  b.part(new THREE.CircleGeometry(0.135, 20), WHITE, { bone: hull, at: offset(gP, gN, 0.045), dir: gN, axis: "z", texture: GAUGE });
  // safety valve
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 8), BRASS, { bone: hull, at: [BX - 0.6, BYc + 0.6, BZ] });
  b.part(new THREE.SphereGeometry(0.11, 7, 5), RED, { bone: hull, at: [BX - 0.6, BYc + 0.82, BZ] });
  // stovepipe
  const pipePath = catmull([
    [-1.4, PT + 0.9, BZ],
    [-1.4, PT + 2.6, BZ],
    [-1.45, PT + 3.9, BZ - 0.05],
    [-1.25, PT + 4.5, BZ - 0.1],
  ]);
  b.sweep(pipePath, 0.13, { bone: hull, color: IRONM, sides: 8 });
  b.along(pipePath, 5, (p) => b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.07, 8), BRASS, { bone: hull, frame: p }));
  b.part(new THREE.ConeGeometry(0.28, 0.25, 8), IRON_D, { bone: hull, at: [-1.25, PT + 4.72, BZ - 0.1] });
  // laundry
  {
    const a = [-1.43, 7.0, -2.25];
    const c = [1.15, 7.0, -2.25];
    const mid = [-0.1, 6.85, -2.25];
    const p = catmull([a, mid, c]);
    b.sweep(p, 0.012, { bone: hull, color: IRON_D, sides: 4 });
    const fr: ReturnType<typeof frame>[] = [];
    for (let i = 0; i < 5; i++) fr.push(frame(p.at((i + 0.7) / 5.4), [0, 1, 0]));
    b.cards(fr, [SHIRT, SHEET, SHIRT], { size: [0.55, 0.65], lean: 180, flow: [0, 0, 1], rng: rng(41), vary: 0.15, bone: hull });
  }

  // =========================================================================================================
  // TAIL FAN
  box(0.5, 1.1, 0.3, IRONM, [0, 4.75, -2.85]);
  b.part(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 12), BRASS, { bone: tail1, at: [0, 5.1, -2.98], dir: [0, 0.4, -1] });
  const featherCache = new Map<number, ReturnType<typeof featherPaint>>();
  for (let i = -4; i <= 4; i++) {
    const phi = i * 15.5 * DEG;
    const len = 3.0 - 0.14 * Math.abs(i);
    if (!featherCache.has(len)) featherCache.set(len, featherPaint(len));
    const dir = new THREE.Vector3(Math.sin(phi), Math.cos(phi) * 0.9 + 0.1, -0.35).normalize();
    const yd = new THREE.Vector3(0, 0, 1).cross(dir).normalize();
    const prof: [number, number][] = [
      [0.1, 0.1],
      [0.3, 0.25],
      [0.55, 0.3],
      [0.75, 0.27],
      [0.88, 0.2],
    ];
    const outline: any[] = [[0, 0, "sharp"]];
    for (const [t, hw] of prof) outline.push([t * len, hw]);
    outline.push([len, 0, "sharp"]);
    for (let k = prof.length - 1; k >= 0; k--) outline.push([prof[k][0] * len, -prof[k][1]]);
    b.extrude(outline, {
      at: [i * 0.03, 5.1, -3.0 - (Math.abs(i) % 2) * 0.05],
      x: dir,
      y: yd,
      thickness: 0.05,
      smoothing: 1,
      color: featherCache.get(len)!,
      bone: tail1,
    });
  }

  // =========================================================================================================
  // GEAR TRAINS on the platform flanks
  for (const s of [1, -1]) {
    gearTrain(b, {
      at: [s * 2.86, 3.85, 0.3],
      axis: [s, 0, 0],
      up: [0, 1, 0],
      module: 0.05,
      spin: s > 0 ? "gearL" : "gearR",
      bone: hull,
      gears: [
        { teeth: 28, spokes: 6, bore: 0.04 },
        { teeth: 14, angle: s * 70 + 20 },
        { teeth: 20, on: 1, shift: 0.12, holes: 4, color: metal("gilt") },
      ],
    });
  }

  // =========================================================================================================
  // RAILINGS
  const rail = (pts: number[][]) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const c = pts[i + 1];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const n = Math.max(1, Math.round(len / 0.55));
      for (let k = 0; k <= n; k++) {
        if (k === 0 && i > 0) continue;
        const t = k / n;
        posts.add(new THREE.BoxGeometry(0.07, 0.9, 0.07), [a[0] + (c[0] - a[0]) * t, PT + 0.45, a[1] + (c[1] - a[1]) * t]);
      }
      b.rod([a[0], PT + 0.9, a[1]], [c[0], PT + 0.9, c[1]], 0.04, WOOD_D, { bone: hull });
      b.rod([a[0], PT + 0.5, a[1]], [c[0], PT + 0.5, c[1]], 0.025, WOOD_D, { bone: hull });
    }
  };
  rail([[2.4, -0.4], [2.4, 1.6], [1.25, 2.55]]);
  rail([[-2.4, 0.9], [-2.4, 1.6], [-1.25, 2.55]]);

  // =========================================================================================================
  timber.flush();
  posts.flush();
  rivets.flush();
  bolts.flush();
  towerPosts.flush();
  towerRings.flush();

  return b.root;
}

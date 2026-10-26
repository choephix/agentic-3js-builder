import * as THREE from "three";
import { type Builder, createBuilder, paint, mix, noise, cells, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Baba Yaga's Hut",
  description: "Slavic folk-art log hut standing on two giant chicken legs, with a carved horse-head ridge, painted shingles and a smoking chimney.",
};

// ---- palette (top level so stage 2 can use the names)
export const LOG = "#8a5a2b";
export const LOG_DARK = "#5e3a1c";
export const LOG_END = "#e0b072";
export const ROOF_A = "#2f7d6d";
export const ROOF_B = "#c8402e";
export const TRIM_RED = "#c8281e";
export const TRIM_BLUE = "#2457a6";
export const CREAM = "#f2e3b8";
export const SUN = "#f6c026";
export const LEG = "#e0a824";
export const LEG_DARK = "#b57a14";
export const TALON = "#4a3b2c";
export const FEATHER = "#a3552a";
export const FEATHER2 = "#d98a3a";
export const STONE = "#8b8b86";
export const STONE_DARK = "#66665f";
export const SMOKE = "#cfd3d6";
export const DOOR = "#7c2a1c";
export const GLASS = "#3a2a4a";
export const PLANK = "#6f4624";

const LOG_PAINT = paint((p, n) => {
  let c = mix(LOG, LOG_DARK, 0.15 + 0.5 * smoothstep(0.45, 0.8, noise(new THREE.Vector3(p.x * 0.15, p.y * 9, p.z * 0.15), 0.1, 3)));
  const crack = noise(new THREE.Vector3(p.x * 3, p.y * 40, p.z * 3), 0.1, 8);
  if (crack > 0.72) c = mix(c, LOG_DARK, 0.8);
  const soot = smoothstep(0.2, 1.8, p.x - p.z * 0.5) * 0.5;
  c = mix(c, "#2a1c12", soot * smoothstep(3.0, 5.0, p.y + 1));
  const moss = smoothstep(0.4, 0.9, n.y) * smoothstep(0.45, 0.65, noise(p, 0.25, 5));
  return mix(c, "#5d8a3a", moss * 0.85);
});
const SHINGLE_PAINT = paint((_p, _n, s) => {
  const rows = 6;
  const v = s[1] * rows;
  const row = Math.floor(v);
  const fv = v - row;
  const cols = 9;
  const u = s[0] * cols + (row % 2 ? 0.5 : 0);
  const fu = u - Math.floor(u);
  const base = row % 2 ? ROOF_B : ROOF_A;
  const scallop = fv < 0.45 * Math.sqrt(Math.max(0, 1 - (2 * fu - 1) ** 2)) + 0.1;
  let c = mix(base, base === ROOF_A ? "#1f5a4e" : "#962a1e", scallop ? 0 : 0.35);
  const edge = Math.abs(fv - (0.45 * Math.sqrt(Math.max(0, 1 - (2 * fu - 1) ** 2)) + 0.1));
  if (edge < 0.05) c = mix(c, CREAM, 0.9);
  const dx = fu - 0.5, dy = fv - 0.75;
  if (dx * dx + dy * dy < 0.012) c = mix(c, CREAM, 0.9);
  return c;
});
const LEG_PAINT = paint((p, n) => {
  const c = cells(new THREE.Vector3(p.x, p.y * 1.6, p.z), 0.11, 4);
  const e = c.d2 - c.d1;
  let col = mix(LEG, LEG_DARK, 0.25 + 0.5 * c.id);
  col = mix(LEG_DARK, col, smoothstep(0.03, 0.14, e));
  col = mix(col, "#f3d072", 0.5 * smoothstep(0.3, 0.8, n.y) * smoothstep(0.1, 0.3, e));
  for (const jy of [0.85, 1.45, 0.15]) {
    const w = Math.abs(p.y - jy);
    if (w < 0.1 && Math.sin(p.y * 160) > 0.2) col = mix(col, LEG_DARK, 0.7 * (1 - w / 0.1));
  }
  return col;
});
const DOOR_TEX = svg(
  `<svg viewBox="0 0 84 140" xmlns="http://www.w3.org/2000/svg">
  <rect width="84" height="140" fill="${DOOR}"/>
  <path d="M28 0V140M56 0V140" stroke="#3a120c" stroke-width="2.5"/>
  <path d="M0 22H84M0 118H84" stroke="#3a120c" stroke-width="2"/>
  <path d="M10 130 C4 100 24 96 14 70 C8 52 28 50 20 30" stroke="${TRIM_BLUE}" stroke-width="3" fill="none"/>
  <path d="M74 130 C80 100 60 96 70 70 C76 52 56 50 64 30" stroke="${TRIM_BLUE}" stroke-width="3" fill="none"/>
  <g fill="${SUN}"><circle cx="8" cy="98" r="4"/><circle cx="76" cy="98" r="4"/><circle cx="18" cy="60" r="4"/><circle cx="66" cy="60" r="4"/><circle cx="20" cy="32" r="4"/><circle cx="64" cy="32" r="4"/></g>
  <g stroke="#1d3a78" stroke-width="1.5" fill="none"><path d="M12 112 q-9 -2 -6 -10 M72 112 q9 -2 6 -10"/></g>
  <path d="M42 100 C30 96 28 84 36 78 C44 72 40 62 46 56 C52 50 58 56 52 62 C56 68 54 74 50 76 C58 84 54 96 42 100Z" fill="${SUN}" stroke="#7a2a10" stroke-width="1.5"/>
  <path d="M40 98 C32 108 28 118 34 126 M44 98 C46 110 52 118 58 124 M42 98 C42 112 42 120 40 130" stroke="${TRIM_RED}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M46 56 L54 52 L47 60Z" fill="#7a2a10"/><circle cx="48" cy="60" r="1.6" fill="#1a0f08"/>
  <path d="M36 80 C28 74 24 66 28 60 M50 80 C58 76 62 68 58 62" stroke="${TRIM_BLUE}" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 256 },
);

export const REQUESTS = [
  {
    id: "doorCarving", kind: "add", part: "door",
    what: "Carved folk-art door surround: a painted platband arch in TRIM_RED and TRIM_BLUE with scalloped top, iron strap hinges, a ring handle, and a small skull with glowing SUN eyes above the lintel.",
    at: [0, 3.1, 1.36], normal: [0, 0, 1], bone: null, room: [1.2, 1.7, 0.2],
  },
  {
    id: "gableSun", kind: "add", part: "gable",
    what: "Slavic sun emblem in the front gable: a SUN disc with a CREAM ring, 12 triangular rays alternating TRIM_RED and SUN, and a small carved face in the middle.",
    at: [0, 4.75, 1.36], normal: [0, 0, 1], bone: null, room: [1.3, 1.0, 0.2],
  },
  {
    id: "konekDetail", kind: "add", part: "ridgeHorse",
    what: "Details for the carved horse-head (konek) on the front ridge: a mane of five overlapping carved blades in TRIM_RED to SUN, a round eye, nostril, bridle in TRIM_BLUE and a small tassel.",
    at: [0, 5.95, 1.95], normal: [0, 0, 1], bone: null, room: [0.5, 0.8, 1.0],
  },
  {
    id: "windowFrames", kind: "add", part: "windowFront",
    what: "Pair of front windows: carved platbands (TRIM_RED outline, TRIM_BLUE pierced inner trim, CREAM highlights), shutters opened outward with painted flowers, a warm glowing glass pane with a cross mullion. Mirrored on x.",
    at: [0.85, 3.4, 1.34], normal: [0, 0, 1], bone: null, room: [0.9, 0.9, 0.2],
  },
  {
    id: "eaveFringe", kind: "add", part: "pelmet",
    what: "Lace-like carved eave fringe under the front roof edge: a row of pierced pendants and small CREAM discs with TRIM_RED dots, repeating the sun motif.",
    at: [0, 4.0, 1.4], normal: [0, 0, 1], bone: null, room: [3.0, 0.4, 0.3],
  },
  {
    id: "chimneySmoke", kind: "add", part: "chimney",
    what: "Chimney finish: a rooster-topped cap, brick courses in STONE_DARK, and a curling column of SMOKE puffs rising and growing, with a few glowing orange embers.",
    at: [0.7, 5.8, -0.4], normal: [0, 1, 0], bone: null, room: [0.7, 1.8, 0.7],
  },
  {
    id: "herbBundles", kind: "add", part: "pelmet",
    what: "Bundles of dried herbs, mushrooms strings and garlic braids hanging from the side eave on the left, tied with TRIM_RED twine, in muted greens and ochres.",
    at: [-1.3, 4.0, 0.5], normal: [-1, 0, 0], bone: null, room: [0.5, 0.9, 1.6],
  },
  {
    id: "talonsAndSpurs", kind: "add", part: "toe",
    what: "Heavier talon detail on both feet: segmented toe knuckles, dark ridge scutes on top of each toe, and a sharp backward hock spur in TALON colour.",
    at: [0.8, 0.1, 0.5], normal: [0, 1, 0], bone: null, room: [1.0, 0.4, 1.0],
  },
  {
    id: "platformBones", kind: "add", part: "platform",
    what: "Bone and skull trim along the front edge of the platform: small skulls on short stakes at the corners, a row of rib-bone pickets between them in CREAM with dark eye sockets.",
    at: [0, 2.55, 1.55], normal: [0, 0, 1], bone: null, room: [3.0, 0.5, 0.3],
  },
  {
    id: "logPaint", kind: "texture", part: "wallLog",
    what: "Weathered log texture: horizontal grain and ring cracks in LOG_DARK on LOG, moss patches on top faces, darker soot near the chimney side.",
  },
  {
    id: "shingles", kind: "texture", part: "roofBoard",
    what: "Painted scalloped shingle pattern on the roof boards, alternating ROOF_A teal and ROOF_B red rows with CREAM edge lines and small dot rosettes.",
  },
  {
    id: "legScales", kind: "texture", part: "leg",
    what: "Chicken-leg scales: overlapping rounded scutes in LEG and LEG_DARK with pale highlights, wrinkled skin near the joints.",
  },
  {
    id: "doorPaint", kind: "texture", part: "door",
    what: "Folk-art painted door: DOOR red base with TRIM_BLUE and SUN floral vines and a firebird motif, plank seams in dark.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export default function build() {
  const b = createBuilder({ name: "babaYagaHut" });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

  // ---------- chicken legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const path = [
      [s * 0.7, 2.05, 0],
      [s * 0.76, 1.45, -0.2],
      [s * 0.8, 0.8, -0.28],
      [s * 0.8, 0.12, 0.05],
    ];
    const leg = b.sweep(path.map((p) => p), [0.15, 0.09], { color: LEG_PAINT, name: "leg" + side, sides: 8 });
    // thigh feathers
    b.part(sph(0.34, 10, 8), FEATHER, { at: [s * 0.7, 2.0, 0], name: "thigh" });
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 + r * 0.35;
        const rad = 0.3 - r * 0.04;
        const base = new THREE.Vector3(s * 0.7 + Math.cos(a) * rad, 1.95 - r * 0.2, Math.sin(a) * rad);
        const tip = base.clone().add(new THREE.Vector3(Math.cos(a) * 0.1, -0.5 + r * 0.05, Math.sin(a) * 0.1));
        b.spike(base, tip, null, 0.1, { color: r ? FEATHER2 : FEATHER, name: "feather" });
      }
    // hock knob + spur
    b.part(sph(0.13), LEG_DARK, { at: [s * 0.8, 0.85, -0.3], name: "hock" });
    b.spike([s * 0.8, 0.8, -0.38], [s * 0.8, 0.62, -0.75], null, 0.06, { color: TALON, name: "spur" });
    // scales down the front of the leg
    const crv = leg.curve();
    for (let i = 0; i < 6; i++) {
      const t = 0.18 + i * 0.13;
      const p = crv.at(t);
      b.part(box(0.2, 0.05, 0.12), i % 2 ? LEG_DARK : "#c78f1b", {
        at: [p.x, p.y, p.z + 0.1 - 0.03 * (1 - t)],
        rotation: [-12, 0, 0],
        name: "scute",
      });
    }
    // toes
    const foot = new THREE.Vector3(s * 0.8, 0.09, 0.05);
    b.part(sph(0.13), LEG_DARK, { at: [foot.x, foot.y + 0.02, foot.z], name: "ankle" });
    for (const a of [-38, 0, 38]) {
      const r = (a * Math.PI) / 180;
      const d = new THREE.Vector3(Math.sin(r), 0, Math.cos(r));
      const end = foot.clone().addScaledVector(d, 0.65);
      b.capsule(foot, end, [0.095, 0.07], { color: LEG, name: "toe" });
      b.part(sph(0.085), LEG_DARK, { at: [foot.x + d.x * 0.3, 0.1, foot.z + d.z * 0.3], name: "knuckle" });
      b.spike(end, [d.x, -0.35, d.z], 0.3, 0.075, { color: TALON, name: "talon" });
    }
    const back = foot.clone().add(new THREE.Vector3(0, 0, -0.45));
    b.capsule(foot, back, [0.09, 0.065], { color: LEG, name: "toe" });
    b.spike(back, [0, -0.3, -1], 0.28, 0.07, { color: TALON, name: "talon" });
  }

  // ---------- platform
  b.part(box(3.1, 0.2, 2.9), PLANK, { at: [0, 2.3, 0], name: "platform" });
  b.part(box(3.2, 0.06, 3.0), LOG_DARK, { at: [0, 2.2, 0], name: "platformSkirt" });

  // ---------- log walls
  for (let i = 0; i < 6; i++) {
    const y = 2.56 + i * 0.3;
    for (const z of [1.1, -1.1]) {
      b.part(cyl(0.16, 2.8), LOG_PAINT, { at: [0, y, z], dir: [1, 0, 0], name: "wallLog" });
      for (const x of [1.4, -1.4]) b.part(cyl(0.125, 0.04), LOG_END, { at: [x, y, z], dir: [1, 0, 0], name: "logEnd" });
    }
    for (const x of [1.2, -1.2]) {
      b.part(cyl(0.16, 2.6), LOG_PAINT, { at: [x, y + 0.15, 0], dir: [0, 0, 1], name: "wallLog" });
      for (const z of [1.3, -1.3]) b.part(cyl(0.125, 0.04), LOG_END, { at: [x, y + 0.15, z], dir: [0, 0, 1], name: "logEnd" });
    }
  }
  // inner core to hide gaps
  b.part(box(2.3, 1.8, 2.1), LOG_DARK, { at: [0, 3.35, 0], name: "core" });

  // door (plain panel, details requested)
  b.part(box(0.84, 1.4, 0.06), DOOR, { at: [0, 3.1, 1.3], name: "door" });
  b.part(new THREE.PlaneGeometry(0.84, 1.4), "#ffffff", {
    at: [0, 3.1, 1.334], dir: [0, 0, 1], axis: "z", texture: DOOR_TEX, name: "door",
  });
  b.part(box(1.0, 0.1, 0.07), TRIM_RED, { at: [0, 3.85, 1.31], name: "doorLintel" });
  for (const s of [1, -1]) b.part(box(0.08, 1.4, 0.07), TRIM_RED, { at: [s * 0.46, 3.1, 1.31], name: "doorJamb" });
  // front windows (plain)
  for (const s of [1, -1]) {
    b.part(box(0.5, 0.5, 0.05), TRIM_BLUE, { at: [s * 0.85, 3.4, 1.29], name: "windowFront" });
    glow(b.part(box(0.36, 0.36, 0.04), "#f7b84a", { at: [s * 0.85, 3.4, 1.32], name: "windowPane" }), 0.8);
  }

  // ---------- gables
  for (const z of [1.25, -1.25]) {
    b.extrude(
      [[-1.45, 0], [1.45, 0], [0, 1.3]],
      { at: [0, 4.2, z], x: [1, 0, 0], thickness: 0.12, color: LOG, name: "gable" },
    );
    b.part(box(1.0, 0.04, 0.04), LOG_DARK, { at: [0, 4.22, z + Math.sign(z) * 0.07], name: "gableSill" });
  }

  // ---------- roof
  const ang = (Math.atan2(1.45, 1.8) * 180) / Math.PI;
  const rowLen = (Math.hypot(1.8, 1.45) / 8) * 1.3;
  for (const s of [1, -1])
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      b.part(box(rowLen, 0.07, 3.1), SHINGLE_PAINT, {
        at: [s * 1.8 * (1 - t), 4.1 + 1.45 * t + 0.04, 0],
        rotation: [0, 0, -s * ang],
        name: "roofBoard",
      });
    }
  b.part(cyl(0.11, 3.3, 8), TRIM_RED, { at: [0, 5.6, 0], dir: [0, 0, 1], name: "ridge" });
  // eave lips
  for (const s of [1, -1])
    b.part(cyl(0.06, 3.1, 6), CREAM, { at: [s * 1.86, 4.07, 0], dir: [0, 0, 1], name: "eaveLip" });

  // carved horse heads on the ridge ends
  const horse = [[0, 0], [0.45, 0], [0.5, 0.25], [0.75, 0.5], [0.72, 0.64], [0.45, 0.62], [0.18, 0.45]] as [number, number][];
  for (const f of [1, -1]) {
    b.extrude(horse, {
      at: [0, 5.62, f * 1.55], x: [0, 0, f], thickness: 0.1, bevel: 0.015, smoothing: 1,
      color: ROOF_B, name: "ridgeHorse",
    });
    b.part(sph(0.035, 6, 4), "#1a0f08", { at: [0.07, 6.1, f * 2.0], name: "horseEye" });
    b.part(sph(0.035, 6, 4), "#1a0f08", { at: [-0.07, 6.1, f * 2.0], name: "horseEye" });
  }

  // ---------- eave pelmet
  b.part(box(3.0, 0.14, 0.08), TRIM_RED, { at: [0, 4.17, 1.33], name: "pelmet" });
  for (let i = 0; i < 9; i++)
    b.part(cyl(0.1, 0.05, 10), i % 2 ? CREAM : TRIM_BLUE, {
      at: [-1.2 + i * 0.3, 4.05, 1.33], dir: [0, 0, 1], name: "pelmet",
    });

  // ---------- chimney
  b.part(box(0.45, 1.2, 0.45), STONE, { at: [0.7, 5.0, -0.4], name: "chimney" });
  b.part(box(0.55, 0.1, 0.55), STONE_DARK, { at: [0.7, 5.65, -0.4], name: "chimneyCap" });
  for (let i = 0; i < 4; i++)
    b.part(sph(0.16 + i * 0.05, 8, 6), SMOKE, {
      at: [0.7 + i * 0.14, 6.0 + i * 0.32, -0.4 - i * 0.06], name: "smoke",
    });

  // ---------- small hut-front bits: plank porch step under door
  b.part(box(1.0, 0.08, 0.35), PLANK, { at: [0, 2.44, 1.55], name: "stepBoard" });

  for (const add of STAGE2) add(b);
  return b.root;
}

// ---------------------------------------------------------------------------------------------------------------
// Stage 2: one function per add call, run on stage 1's builder by the STAGE2 loop in build().

// add1
STAGE2.push(
  (() => {
function addDoorCarving(b: Builder) {
  const Z = 1.345;
  const IRON = "#2b2622";
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);
  const front = { dir: [0, 0, 1] as [number, number, number], axis: "z" as const };

  // door painting: vines, firebird-ish flowers, plank seams
  const doorTex = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 78 C20 60 44 50 32 32 C24 20 40 12 32 4" stroke="#2457a6" stroke-width="3" fill="none"/>
      <path d="M32 62 C18 58 14 48 18 40 M32 48 C46 44 50 34 46 26" stroke="#2457a6" stroke-width="2.5" fill="none"/>
      <circle cx="18" cy="40" r="5" fill="#f6c026"/><circle cx="46" cy="26" r="5" fill="#f6c026"/>
      <circle cx="18" cy="40" r="2" fill="#c8281e"/><circle cx="46" cy="26" r="2" fill="#c8281e"/>
      <path d="M32 18 L24 26 L32 22 L40 26Z" fill="#f6c026"/>
      <circle cx="32" cy="30" r="4" fill="#f2e3b8"/>
      <path d="M22 70 q-8 -6 -4 -14 M42 70 q8 -6 4 -14" stroke="#2457a6" stroke-width="2.5" fill="none"/>
      <path d="M21 0V80M43 0V80" stroke="#3a1008" stroke-width="1.5" opacity="0.7"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 1.36), "#ffffff", { at: [0, 3.1, 1.337], ...front, texture: doorTex, name: "doorPaint" });

  // platband: jambs inner stripes + arch
  for (const s of [1, -1]) {
    b.part(box(0.07, 1.45, 0.05), TRIM_BLUE, { at: [s * 0.52, 3.1, Z], name: "platbandSide" });
    b.part(box(0.045, 1.45, 0.05), CREAM, { at: [s * 0.58, 3.1, Z - 0.005], name: "platbandEdge" });
    for (let i = 0; i < 6; i++)
      b.part(box(0.05, 0.05, 0.03), i % 2 ? TRIM_RED : SUN, { at: [s * 0.52, 2.5 + i * 0.25, Z + 0.03], rotation: [0, 0, 45], name: "platbandDiamond" });
  }
  // scalloped arch over lintel
  b.part(box(1.22, 0.07, 0.05), TRIM_BLUE, { at: [0, 3.93, Z], name: "archBase" });
  const n = 7;
  for (let i = 0; i < n; i++) {
    const x = -0.51 + (i * 1.02) / (n - 1);
    const y = 3.97 + 0.1 * Math.cos(((x / 0.6) * Math.PI) / 2);
    b.part(cyl(0.09, 0.05, 10), i % 2 ? TRIM_RED : TRIM_BLUE, { at: [x, y, Z], ...front, name: "scallop" });
    b.part(cyl(0.035, 0.06, 8), i % 2 ? SUN : CREAM, { at: [x, y, Z + 0.005], ...front, name: "scallopDot" });
  }
  // strap hinges
  for (const y of [2.62, 3.5]) {
    for (const s of [1, -1]) {
      b.part(box(0.4, 0.045, 0.02), IRON, { at: [s * 0.2, y, 1.34], name: "strapHinge" });
      b.part(box(0.4, 0.045, 0.02), IRON, { at: [s * 0.2, y, 1.34], name: "strapHinge" });
    }
    b.part(cyl(0.035, 0.03, 8), IRON, { at: [-0.38, y, 1.355], ...front, name: "hingeRivet" });
    b.part(cyl(0.035, 0.03, 8), IRON, { at: [0.38, y, 1.355], ...front, name: "hingeRivet" });
    b.part(new THREE.ConeGeometry(0.04, 0.12, 4), IRON, { at: [-0.4, y, 1.345], rotation: [0, 0, 90], name: "hingeTip" });
  }
  // ring handle
  b.part(cyl(0.04, 0.03, 8), IRON, { at: [0.28, 3.05, 1.35], ...front, name: "handlePlate" });
  b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10), IRON, { at: [0.28, 2.99, 1.37], name: "handleRing" });
  b.part(box(0.16, 0.2, 0.02), IRON, { at: [0.28, 3.05, 1.34], name: "handleBack" });

  // skull above lintel
  const sy = 4.06, sz = 1.38;
  b.part(sph(0.12), CREAM, { at: [0, sy + 0.05, sz], name: "skullCranium" });
  b.part(box(0.14, 0.07, 0.1), CREAM, { at: [0, sy - 0.06, sz + 0.0], name: "skullJaw" });
  for (const s of [1, -1]) {
    b.part(sph(0.04), "#120a08", { at: [s * 0.05, sy + 0.04, sz + 0.09], name: "skullSocket" });
    glow(b.part(sph(0.024), SUN, { at: [s * 0.05, sy + 0.04, sz + 0.115], name: "skullEye" }), 2);
  }
  b.part(new THREE.ConeGeometry(0.02, 0.04, 3), "#120a08", { at: [0, sy - 0.01, sz + 0.12], rotation: [180, 0, 0], name: "skullNose" });
  for (let i = -2; i <= 2; i++)
    b.part(box(0.015, 0.05, 0.015), "#120a08", { at: [i * 0.027, sy - 0.1, sz + 0.05], name: "skullTooth" });
  // small horns of red either side
  for (const s of [1, -1])
    b.part(new THREE.ConeGeometry(0.03, 0.14, 5), TRIM_RED, { at: [s * 0.17, sy + 0.02, sz - 0.03], rotation: [0, 0, -s * 70], name: "skullFlourish" });
}
    return addDoorCarving;
  })(),
);
// add2
STAGE2.push(
  (() => {
function addGableSun(b: Builder) {
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const INK = "#2a140c";
  const NAVY = "#1b2a52";

  // ---------- gable sun emblem (front gable surface at z ~ 1.31)
  const cx = 0, cy = 4.75, z0 = 1.33;
  const rays = 12;
  let rayMarkup = "";
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2;
    const c = i % 2 ? SUN : TRIM_RED;
    const p = (r: number, da: number) =>
      `${(50 + Math.sin(a + da) * r).toFixed(2)},${(50 - Math.cos(a + da) * r).toFixed(2)}`;
    rayMarkup += `<polygon points="${p(32, -0.2)} ${p(49, 0)} ${p(32, 0.2)}" fill="${c}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
  }
  const tex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${rayMarkup}
      <circle cx="50" cy="50" r="33" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>
      <circle cx="50" cy="50" r="28" fill="${SUN}" stroke="${TRIM_RED}" stroke-width="2.5"/>
      <g stroke="${TRIM_RED}" stroke-width="1.2" fill="none">
        ${Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return `<circle cx="${(50 + Math.sin(a) * 30.5).toFixed(1)}" cy="${(50 - Math.cos(a) * 30.5).toFixed(1)}" r="0.9" fill="${TRIM_RED}"/>`;
        }).join("")}
      </g>
      <path d="M38 40 Q43 36 47 40 M53 40 Q57 36 62 40" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="42.5" cy="45" rx="3" ry="2.2" fill="${INK}"/>
      <ellipse cx="57.5" cy="45" rx="3" ry="2.2" fill="${INK}"/>
      <path d="M50 46 L47 55 L53 55 Z" fill="${LEG_DARK}" stroke="${INK}" stroke-width="1"/>
      <path d="M41 62 Q50 70 59 62" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="37" cy="55" r="4" fill="${TRIM_RED}" opacity="0.6"/>
      <circle cx="63" cy="55" r="4" fill="${TRIM_RED}" opacity="0.6"/>
    </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(1.3, 1.3), "#ffffff", {
    at: [cx, cy, z0 + 0.03], dir: [0, 0, 1], axis: "z", texture: tex, name: "gableSunDisc",
  });
  // backing disc + raised rim
  b.part(new THREE.CylinderGeometry(0.43, 0.43, 0.03, 20), TRIM_BLUE, {
    at: [cx, cy, z0 + 0.005], dir: [0, 0, 1], name: "gableSunBack",
  });
  b.part(new THREE.TorusGeometry(0.4, 0.025, 6, 20), CREAM, {
    at: [cx, cy, z0 + 0.045], name: "gableSunRim",
  });
  // carved nose boss and glowing eyes
  b.part(sph(0.04, 6, 4), LEG_DARK, { at: [cx, cy - 0.02, z0 + 0.06], name: "gableSunNose" });
  for (const s of [1, -1])
    glow(b.part(sph(0.025, 6, 4), SUN, { at: [s * 0.065, cy + 0.04, z0 + 0.06], name: "gableSunEye" }), 0.8);

  // ---------- konek (horse head) details; front horse at z = 1.55, faces +Z, extrude x:[0,0,1]
  // outline x runs along +Z; horse spans z 1.55..2.3, y 5.62..6.3
  const hz = (u: number) => 1.55 + u;
  const hy = (v: number) => 5.62 + v;
  // mane: five overlapping blades along the neck back edge
  const maneCols = [TRIM_RED, "#e0661f", SUN, "#e0661f", TRIM_RED];
  for (let i = 0; i < 5; i++) {
    const u = 0.12 + i * 0.1;
    const v = 0.5 + (u > 0.3 ? 0.0 : 0) - i * 0.02;
    b.extrude(
      [[0, 0], [0.08, 0.02], [0.14, 0.16], [0.1, 0.3, "sharp"], [0.02, 0.14]],
      {
        at: [0, hy(v - 0.03), hz(u - 0.15)], x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.07, bevel: 0.008, smoothing: 1, color: maneCols[i], name: "konekMane",
      },
    );
  }
  // eye (both sides of the thin head)
  for (const s of [1, -1]) {
    b.part(sph(0.045, 8, 6), CREAM, { at: [s * 0.055, hy(0.52), hz(0.58)], name: "konekEye" });
    b.part(sph(0.025, 6, 4), INK, { at: [s * 0.085, hy(0.52), hz(0.6)], name: "konekPupil" });
    // nostril
    b.part(sph(0.028, 6, 4), INK, { at: [s * 0.055, hy(0.58), hz(0.71)], name: "konekNostril" });
    // bridle straps
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.3), TRIM_BLUE, {
      at: [s * 0.055, hy(0.52), hz(0.52)], rotation: [0, 0, 0], name: "konekBridle",
    });
    b.part(new THREE.BoxGeometry(0.02, 0.04, 0.28), TRIM_BLUE, {
      at: [s * 0.055, hy(0.62), hz(0.5)], name: "konekBridle",
    });
    // brass-like cheek ring
    b.part(new THREE.TorusGeometry(0.03, 0.008, 5, 8), SUN, {
      at: [s * 0.058, hy(0.4), hz(0.5)], dir: [s, 0, 0], axis: "z", name: "konekRing",
    });
  }
  // noseband across the muzzle
  b.part(new THREE.BoxGeometry(0.13, 0.04, 0.04), TRIM_BLUE, { at: [0, hy(0.6), hz(0.66)], name: "konekNoseband" });
  // forelock tuft
  b.spike([0, hy(0.66), hz(0.4)], [0, hy(0.88), hz(0.36)], null, 0.035, { color: TRIM_RED, name: "konekForelock" });
  // tassel hanging from the bridle ring on the left
  b.rod([0.075, hy(0.4), hz(0.5)], [0.075, hy(0.3), hz(0.5)], 0.007, { color: SUN, name: "konekTasselCord" });
  b.part(sph(0.03, 6, 4), TRIM_RED, { at: [0.075, hy(0.3), hz(0.5)], name: "konekTasselKnob" });
  for (let i = -1; i <= 1; i++)
    b.spike([0.075 + i * 0.012, hy(0.29), hz(0.5)], [0.075 + i * 0.016, hy(0.14), hz(0.5)], null, 0.012, {
      color: i ? SUN : TRIM_RED, name: "konekTasselThread",
    });
}
    return addGableSun;
  })(),
);
// add3
STAGE2.push(
  (() => {
function addWindowFrames(b: Builder) {
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const PINK = "#e86a8a";
  const LEAF = "#3f8f4a";

  const flower = svg(
    `<svg viewBox="0 0 64 128">
      <rect x="0" y="0" width="64" height="128" fill="#2457a6"/>
      <rect x="3" y="3" width="58" height="122" fill="none" stroke="#f2e3b8" stroke-width="3"/>
      <path d="M32 120 C26 90 38 70 32 40" stroke="#3f8f4a" stroke-width="3" fill="none"/>
      <path d="M32 95 C18 90 14 80 16 74 C26 76 30 84 32 95Z M32 80 C46 76 50 66 48 60 C38 62 34 70 32 80Z" fill="#3f8f4a"/>
      <g fill="#e86a8a"><circle cx="32" cy="22" r="8"/><circle cx="20" cy="30" r="8"/><circle cx="44" cy="30" r="8"/><circle cx="24" cy="42" r="8"/><circle cx="40" cy="42" r="8"/></g>
      <circle cx="32" cy="32" r="6" fill="#f6c026"/>
      <g fill="#c8281e"><circle cx="20" cy="104" r="5"/><circle cx="44" cy="110" r="5"/></g>
    </svg>`,
    { size: 128 },
  );

  const mullion = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#f7b84a"/>
      <rect x="29" y="0" width="6" height="64" fill="#5e3a1c"/><rect x="0" y="29" width="64" height="6" fill="#5e3a1c"/>
      <circle cx="16" cy="16" r="5" fill="#ffe6a0"/></svg>`,
    { size: 64 },
  );

  for (const s of [1, -1]) {
    const cx = s * 0.85;
    const cy = 3.4;
    const z = 1.33;
    // red outer platband
    b.part(box(0.78, 0.07, 0.05), TRIM_RED, { at: [cx, cy + 0.34, z], name: "wfTop" });
    b.part(box(0.78, 0.07, 0.05), TRIM_RED, { at: [cx, cy - 0.34, z], name: "wfBottom" });
    for (const t of [1, -1]) {
      b.part(box(0.07, 0.68, 0.05), TRIM_RED, { at: [cx + t * 0.355, cy, z], name: "wfSide" });
      // blue inner pierced trim
      b.part(box(0.045, 0.52, 0.05), TRIM_BLUE, { at: [cx + t * 0.28, cy, z + 0.01], name: "wfInner" });
    }
    b.part(box(0.6, 0.045, 0.05), TRIM_BLUE, { at: [cx, cy + 0.27, z + 0.01], name: "wfInnerTop" });
    b.part(box(0.6, 0.045, 0.05), TRIM_BLUE, { at: [cx, cy - 0.27, z + 0.01], name: "wfInnerBot" });
    // scalloped crown: cream discs along the top
    for (let i = 0; i < 5; i++)
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), i % 2 ? CREAM : SUN, {
        at: [cx - 0.28 + i * 0.14, cy + 0.41, z], dir: [0, 0, 1], name: "wfScallop",
      });
    // gable peak of platband
    b.extrude([[-0.4, 0], [0.4, 0], [0, 0.16]], {
      at: [cx, cy + 0.455, z - 0.02], x: [1, 0, 0], thickness: 0.05, color: TRIM_RED, name: "wfPeak",
    });
    b.part(new THREE.CircleGeometry(0.03, 8), SUN, { at: [cx, cy + 0.5, z + 0.035], dir: [0, 0, 1], axis: "z", name: "wfPeakDot" });
    // pendants below sill
    for (let i = 0; i < 4; i++)
      b.part(new THREE.ConeGeometry(0.04, 0.1, 6), CREAM, {
        at: [cx - 0.24 + i * 0.16, cy - 0.43, z], dir: [0, -1, 0], name: "wfPendant",
      });
    // glowing pane with mullion texture
    glow(
      b.part(new THREE.PlaneGeometry(0.46, 0.46), "#ffffff", {
        at: [cx, cy, z + 0.025], dir: [0, 0, 1], axis: "z", texture: mullion, name: "wfPane",
      }),
      0.9,
    );
    // sill
    b.part(box(0.9, 0.05, 0.14), CREAM, { at: [cx, cy - 0.4, z + 0.04], name: "wfSill" });
    // shutter swung outward, hinged on outer edge
    const hx = cx + s * 0.4;
    const sh = b.part(box(0.04, 0.62, 0.3), TRIM_BLUE, {
      at: [hx + s * 0.0, cy, z + 0.17],
      name: "wfShutter",
    });
    b.part(new THREE.PlaneGeometry(0.28, 0.58), "#ffffff", {
      at: [hx + s * 0.025, cy, z + 0.17], dir: [s, 0, 0], axis: "z", texture: flower, name: "wfShutterArt",
    });
    // hinge pins
    for (const dy of [0.22, -0.22])
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.07, 6), TALON, { at: [hx, cy + dy, z + 0.02], name: "wfHinge" });
    // flower box under window
    b.part(box(0.5, 0.08, 0.1), PLANK, { at: [cx, cy - 0.5, z + 0.08], name: "wfPlanter" });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.045, 6, 5), i % 2 ? PINK : SUN, { at: [cx - 0.18 + i * 0.12, cy - 0.43, z + 0.1], name: "wfBloom" });
      b.part(new THREE.SphereGeometry(0.035, 5, 4), LEAF, { at: [cx - 0.18 + i * 0.12, cy - 0.47, z + 0.1], name: "wfLeaf" });
    }
    void sh;
  }
}
    return addWindowFrames;
  })(),
);
// add4
STAGE2.push(
  (() => {
function addEaveFringe(b: Builder) {
  const r = rng(24);
  const EMBER = "#ff8a2a";
  const BRICK = "#7a4a3a";
  const sph = (rad: number, w = 8, h = 6) => new THREE.SphereGeometry(rad, w, h);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rad: number, h: number, n = 8) => new THREE.CylinderGeometry(rad, rad, h, n);

  // ---------- eave fringe: sun-motif disc texture
  const sunTex = svg(
    `<svg viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#f2e3b8" stroke="#5e3a1c" stroke-width="3"/>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#c8281e" stroke-width="3"/>
      <circle cx="32" cy="32" r="8" fill="#c8281e"/>
      <g fill="#c8281e"><circle cx="32" cy="9" r="3"/><circle cx="32" cy="55" r="3"/><circle cx="9" cy="32" r="3"/><circle cx="55" cy="32" r="3"/></g>
    </svg>`,
    { size: 128 },
  );
  const pendTex = svg(
    `<svg viewBox="0 0 40 64">
      <path d="M2 2 H38 V34 Q38 62 20 62 Q2 62 2 34 Z" fill="#2457a6" stroke="#5e3a1c" stroke-width="3"/>
      <circle cx="20" cy="22" r="6" fill="#f2e3b8"/>
      <circle cx="20" cy="42" r="5" fill="#f2e3b8"/>
      <circle cx="20" cy="22" r="2.5" fill="#c8281e"/>
      <circle cx="20" cy="42" r="2" fill="#c8281e"/>
    </svg>`,
    { size: 128 },
  );

  const n = 10;
  for (let i = 0; i < n; i++) {
    const x = -1.35 + (i * 2.7) / (n - 1);
    // pendants hang from the pelmet board
    b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
      at: [x, 3.88, 1.375], dir: [0, 0, 1], axis: "z", texture: pendTex, name: "fringePendant",
    });
    b.part(new THREE.PlaneGeometry(0.2, 0.32), "#ffffff", {
      at: [x, 3.88, 1.36], dir: [0, 0, -1], axis: "z", texture: pendTex, name: "fringePendantBack",
    });
    if (i < n - 1) {
      const mx = x + 0.15;
      b.part(new THREE.CircleGeometry(0.075, 12), "#ffffff", {
        at: [mx, 4.0, 1.378], dir: [0, 0, 1], axis: "z", texture: sunTex, name: "fringeDisc",
      });
      b.part(sph(0.025, 6, 4), CREAM, { at: [mx, 3.9, 1.375], name: "fringeBead" });
    }
  }
  b.part(box(2.9, 0.03, 0.05), TRIM_BLUE, { at: [0, 3.99, 1.37], name: "fringeRail" });

  // ---------- chimney finish
  const cx = 0.7, cz = -0.4;
  // brick courses
  for (let i = 0; i < 5; i++) {
    const y = 4.5 + i * 0.22;
    b.part(box(0.48, 0.03, 0.48), STONE_DARK, { at: [cx, y, cz], name: "brickCourse" });
    for (let k = 0; k < 3; k++) {
      const off = -0.15 + k * 0.15 + (i % 2) * 0.07;
      b.part(box(0.015, 0.2, 0.465), STONE_DARK, { at: [cx + off, y + 0.11, cz], name: "brickJoint" });
    }
  }
  // collar and cap
  b.part(box(0.6, 0.07, 0.6), STONE_DARK, { at: [cx, 5.74, cz], name: "chimneyCollar" });
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
    b.part(box(0.08, 0.14, 0.08), STONE, { at: [cx + dx * 0.24, 5.84, cz + dz * 0.24], name: "chimneyPost" });
  b.part(box(0.58, 0.05, 0.58), STONE, { at: [cx, 5.94, cz], name: "chimneyLid" });

  // rooster on top
  const rx = cx, rz = cz, ry = 6.0;
  b.part(sph(0.11, 8, 6), TRIM_RED, { at: [rx, ry + 0.1, rz], name: "roosterBody" });
  b.part(sph(0.06, 8, 6), TRIM_RED, { at: [rx, ry + 0.24, rz + 0.1], name: "roosterHead" });
  b.part(new THREE.ConeGeometry(0.03, 0.09, 6), SUN, { at: [rx, ry + 0.23, rz + 0.18], dir: [0, 0, 1], name: "roosterBeak" });
  b.part(box(0.02, 0.07, 0.07), TRIM_RED, { at: [rx, ry + 0.3, rz + 0.1], name: "roosterComb" });
  for (let k = 0; k < 3; k++)
    b.spike([rx, ry + 0.12, rz - 0.08], [rx, ry + 0.3 + k * 0.05, rz - 0.22 - k * 0.04], null, 0.035, {
      color: [SUN, TRIM_BLUE, TRIM_RED][k], name: "roosterTail",
    });
  b.part(sph(0.015, 4, 3), "#1a0f08", { at: [rx + 0.05, ry + 0.26, rz + 0.13], name: "roosterEye" });
  b.part(sph(0.015, 4, 3), "#1a0f08", { at: [rx - 0.05, ry + 0.26, rz + 0.13], name: "roosterEye" });

  // smoke column, curling and growing (replace stage-1 feel with more puffs further up)
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const rad = 0.13 + t * 0.2;
    b.part(sph(rad, 8, 6), t > 0.6 ? "#e2e5e7" : SMOKE, {
      at: [cx + Math.sin(t * 5) * 0.25 + 0.1, 6.45 + t * 1.5, cz - 0.1 - t * 0.2 + Math.cos(t * 5) * 0.1],
      name: "smokePuff",
    });
  }
  // embers
  for (let i = 0; i < 5; i++) {
    glow(
      b.part(sph(0.018, 4, 3), EMBER, {
        at: [cx + (r() - 0.5) * 0.4, 6.3 + r() * 0.9, cz + (r() - 0.5) * 0.4],
        name: "ember",
      }),
      2,
    );
  }
}
    return addEaveFringe;
  })(),
);
// add5
STAGE2.push(
  (() => {
function addHerbBundles(b: Builder) {
  const R = rng(25);
  const HERB_G = "#5f7a3a";
  const HERB_G2 = "#7d8f4a";
  const OCHRE = "#b88a3a";
  const GARLIC = "#efe6d0";
  const MUSH = "#a8774a";

  const sph = (r: number, w = 6, h = 5) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, h: number, n = 6) => new THREE.ConeGeometry(r, h, n);
  const cyl = (r: number, h: number, n = 6) => new THREE.CylinderGeometry(r, r, h, n);

  const leaf = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 62 Q2 36 16 2 Q30 36 16 62Z" fill="#6d8a40" stroke="#2f4a22" stroke-width="2.5"/><path d="M16 60 L16 10" stroke="#a9c06a" stroke-width="2.5"/></svg>`,
    { size: 128 },
  );

  const X = -1.9; // hang line under the left eave
  const Y = 4.0;

  // horizontal drying rail along the eave
  b.part(cyl(0.025, 1.5), "#5e3a1c", { at: [X + 0.02, Y - 0.04, 0.5], dir: [0, 0, 1], name: "herbRail" });
  for (const z of [-0.2, 1.2])
    b.part(cyl(0.02, 0.1), "#5e3a1c", { at: [X + 0.02, Y - 0.02, z], name: "herbRailPeg" });

  const twine = (x: number, y: number, z: number) =>
    b.part(new THREE.TorusGeometry(0.04, 0.012, 4, 8), TRIM_RED, { at: [x, y, z], dir: [0, 1, 0], name: "herbTwine" });

  // herb bunches hanging upside down
  const bunches: [number, number, string][] = [
    [-0.05, 0.4, HERB_G],
    [0.2, 0.34, HERB_G2],
    [0.45, 0.42, OCHRE],
  ];
  bunches.forEach(([dz, len, col], i) => {
    const z = 0.0 + dz * 1.0 + i * 0.1;
    b.part(cyl(0.008, 0.12, 4), "#4a3b2c", { at: [X, Y - 0.1, z], name: "herbString" });
    b.part(cone(0.07, len, 6), col, { at: [X, Y - 0.14 - len / 2, z], rotation: [180, 0, 0], name: "herbBunch" });
    twine(X, Y - 0.17, z);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      b.part(cone(0.025, 0.18, 4), k % 2 ? HERB_G2 : HERB_G, {
        at: [X + Math.cos(a) * 0.05, Y - 0.14 - len - 0.02, z + Math.sin(a) * 0.05],
        rotation: [180 + Math.sin(a) * 25, 0, -Math.cos(a) * 25],
        name: "herbTip",
      });
    }
    void leaf;
  });

  // mushroom string
  const mz0 = 0.75;
  const mp: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) mp.push(new THREE.Vector3(X, Y - 0.1 - i * 0.015 + Math.sin(i) * 0.01, mz0 + i * 0.12));
  b.sweep(mp, 0.008, { color: "#4a3b2c", caps: "round", name: "mushString" });
  for (let i = 0; i < 6; i++) {
    const p = mp[i];
    b.part(sph(0.06, 7, 4), MUSH, { at: [p.x, p.y - 0.12 - R() * 0.04, p.z], scale: [1, 0.6, 1], name: "mushCap" });
    b.part(cyl(0.02, 0.1, 5), CREAM, { at: [p.x, p.y - 0.06, p.z], name: "mushStem" });
    b.part(sph(0.012, 4, 3), "#e8d3a8", { at: [p.x + 0.02, p.y - 0.09, p.z + 0.03], name: "mushSpot" });
  }

  // garlic braid
  const gz = 1.0 + 0.3;
  const gx = X - 0.02;
  b.part(cyl(0.012, 0.65, 5), "#c9b27a", { at: [gx, Y - 0.4, gz], name: "garlicStem" });
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    b.part(sph(0.055, 7, 5), GARLIC, {
      at: [gx, Y - 0.2 - i * 0.09, gz + side * 0.04],
      scale: [1, 0.85, 1],
      name: "garlicBulb",
    });
    b.part(cone(0.03, 0.05, 5), "#d8cfae", {
      at: [gx, Y - 0.14 - i * 0.09, gz + side * 0.04],
      name: "garlicTop",
    });
  }
  twine(gx, Y - 0.12, gz);
  b.part(new THREE.BoxGeometry(0.04, 0.12, 0.012), TRIM_RED, { at: [gx, Y - 0.74, gz], name: "garlicRibbon" });

  // extra: strung red peppers / berries at the end of the rail
  for (let i = 0; i < 4; i++) {
    b.part(sph(0.035, 6, 4), "#b5321f", {
      at: [X, Y - 0.12 - i * 0.07, -0.15 + (i % 2) * 0.02],
      scale: [0.8, 1.2, 0.8],
      name: "pepper",
    });
  }
  b.part(cyl(0.006, 0.3, 4), "#4a3b2c", { at: [X, Y - 0.17, -0.15], name: "pepperString" });
}
    return addHerbBundles;
  })(),
);
// add6
STAGE2.push(
  (() => {
function addTalonsAndSpurs(b: Builder) {
  const sph = (r: number) => new THREE.SphereGeometry(r, 6, 4);
  const BONE_SHADOW = "#c9b88a";
  const SOCKET = "#1a0f0a";

  // ---- feet: segmented knuckles, ridge scutes, heel spur (feet at z=0.05, toes ahead to z~0.7)
  for (const s of [1, -1]) {
    const fx = s * 0.8;
    for (const a of [-38, 0, 38]) {
      const r = (a * Math.PI) / 180;
      const dx = Math.sin(r);
      const dz = Math.cos(r);
      // ridge scutes along top of toe
      for (let i = 0; i < 4; i++) {
        const d = 0.12 + i * 0.13;
        b.part(new THREE.BoxGeometry(0.11, 0.035, 0.07), i % 2 ? LEG_DARK : TALON, {
          at: [fx + dx * d, 0.18 - i * 0.012, 0.05 + dz * d],
          dir: [dx, 0, dz],
          axis: "z",
          name: "toeScute",
        });
      }
      // knuckle joints
      for (const d of [0.22, 0.45]) {
        b.part(sph(0.1), LEG_DARK, { at: [fx + dx * d, 0.1, 0.05 + dz * d], name: "toeKnuckle" });
      }
      // second small claw tip highlight
      b.spike([fx + dx * 0.6, 0.07, 0.05 + dz * 0.6], [dx, -0.4, dz], 0.16, 0.05, { color: "#2a2018", name: "clawTip" });
    }
    // rear toe knuckle
    b.part(sph(0.08), LEG_DARK, { at: [fx, 0.09, -0.25], name: "toeKnuckle" });
    // sharp backward hock spur, heavier, with base collar
    b.part(sph(0.1), LEG_DARK, { at: [fx, 0.88, -0.36], name: "spurBase" });
    b.spike([fx, 0.86, -0.4], [0, -0.25, -1], 0.5, 0.075, { color: TALON, name: "hockSpur" });
    b.spike([fx, 0.7, -0.35], [0, -0.1, -1], 0.28, 0.045, { color: TALON, name: "hockSpur2" });
  }

  // ---- platform bone trim
  const skullTex = (x: number) => x;
  void skullTex;
  const skull = (x: number, z: number, y: number) => {
    b.rod([x, 2.4, z], [x, y - 0.05, z], 0.035, PLANK, { name: "skullStake" });
    b.part(sph(0.13), CREAM, { at: [x, y + 0.05, z], name: "skullCranium" });
    b.part(new THREE.BoxGeometry(0.12, 0.07, 0.1), BONE_SHADOW, { at: [x, y - 0.06, z + 0.03], name: "skullJaw" });
    for (const e of [1, -1]) {
      b.part(sph(0.032), SOCKET, { at: [x + e * 0.05, y + 0.04, z + 0.11], name: "skullEye" });
    }
    b.part(new THREE.BoxGeometry(0.03, 0.045, 0.02), SOCKET, { at: [x, y - 0.02, z + 0.125], name: "skullNose" });
  };
  const zf = 1.5;
  skull(1.5, zf, 2.78);
  skull(-1.5, zf, 2.78);
  skull(0, zf, 2.7);

  // rib-bone pickets between skulls
  const xs = [-1.2, -0.9, -0.6, -0.3, 0.3, 0.6, 0.9, 1.2];
  xs.forEach((x, i) => {
    const h = 0.38 + (i % 2) * 0.06;
    b.rod([x, 2.4, zf], [x, 2.4 + h, zf], [0.035, 0.028], CREAM, { name: "ribPicket" });
    b.part(sph(0.045), CREAM, { at: [x, 2.4 + h + 0.01, zf], name: "ribKnob" });
  });
  // rail connecting pickets
  b.rod([-1.5, 2.55, zf], [1.5, 2.55, zf], 0.025, BONE_SHADOW, { name: "boneRail" });
  // corner stakes on the back side too
  for (const x of [1.5, -1.5]) b.rod([x, 2.4, -1.5], [x, 2.75, -1.5], 0.04, PLANK, { name: "cornerPost" });
}
    return addTalonsAndSpurs;
  })(),
);

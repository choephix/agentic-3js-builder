```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  offset,
  lerp,
  rng,
  catmull,
  bezier,
  limb,
  paint,
  noise,
  mix,
  smoothstep,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { OutlinePoint, Paint, Rgb, Fill, JointRef } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Horde Wyvern Mount",
  description:
    "A World of Warcraft style saddled wyvern (wind rider): tawny lion body with hand-painted fur, a fiery layered mane, " +
    "leathery bat wings spread in a rest pose, a segmented scorpion tail ending in a glowing venom stinger, a tusked jaw " +
    "that opens, and a Horde saddle with spiked cantle, glowing rune plates, crimson blanket with tassels, tooled skirts, " +
    "stirrups, a bridle with reins and twin saddlebags.",
};

// ---------------------------------------------------------------------------------------------------------------
// Scale constants

/** Head scale: every head position and size goes through hp() and H. */
const H = 1.1;
const HC = new THREE.Vector3(0, 2.0, 1.47);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const hp = (x: number, y: number, z: number) => v3(HC.x + x * H, HC.y + y * H, HC.z + z * H);

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const FUR_LO = "#a9632f";
const FUR_HI = "#dca45e";
const BELLY = "#efd8a6";
const MUD = "#4a3222";
const CLOTH = "#8e1a14";
const BLACK = "#1c0d09";
const NOSE = "#3a2420";

const GOLD = metal("gilt", { polish: 0.5 });
const IRON = metal("iron", { polish: 0.3 });

function furRgb(p: THREE.Vector3, n: THREE.Vector3): Rgb {
  const m = noise(p, 0.22, 3);
  const f = noise(p, 0.035, 4);
  let c: Rgb = mix(FUR_LO, FUR_HI, smoothstep(0.25, 0.75, m) * 0.75 + f * 0.25);
  // Darker tiger bands across the back of the body only.
  if (p.z < 1.0 && p.y > 1.15 && n.y > 0.3) {
    const band = Math.sin(p.z * 15 + noise(p, 0.3, 8) * 7 + Math.abs(p.x) * 4);
    if (band > 0.72) c = mix(c, "#6a3519", 0.55);
  }
  c = mix(c, BELLY, smoothstep(-0.2, -0.65, n.y));
  c = mix(c, "#ffe1a0", 0.22 * smoothstep(0.35, 1, n.y)); // warm top light
  c = mix(c, "#5c4860", 0.18 * smoothstep(-0.1, -1, n.y)); // cool underside
  c = mix(c, MUD, 0.85 * smoothstep(0.34, 0.05, p.y)); // mud on the paws
  return c;
}

const FUR = paint((p, n) => furRgb(p, n));

const HEADP = paint((p, n) => {
  let c = furRgb(p, n);
  const lz = (p.z - HC.z) / H;
  const ly = (p.y - HC.y) / H;
  // Cream muzzle and chin.
  c = mix(c, "#f3ddb0", 0.85 * smoothstep(0.17, 0.3, lz) * smoothstep(0.05, -0.05, ly));
  c = mix(c, "#f0d6a4", 0.7 * smoothstep(-0.12, -0.19, ly) * smoothstep(0.0, 0.15, lz));
  // Dark forehead chevrons.
  if (ly > 0.1 && lz > -0.15 && lz < 0.22 && Math.abs(p.x) < 0.13) {
    const st = Math.sin(lz * 40 + Math.abs(p.x) * 28);
    if (st > 0.55) c = mix(c, "#5a2a14", 0.65);
  }
  return c;
});

function leatherRgb(p: THREE.Vector3, n: THREE.Vector3, tone: number): Rgb {
  const w = noise(p, 0.08, 21);
  const f = noise(p, 0.015, 22);
  const lo = mix("#3a1c0e", "#5a2e16", tone);
  const hi = mix("#5e3218", "#8c4c26", tone);
  let c: Rgb = mix(lo, hi, w * 0.7 + f * 0.3);
  c = mix(c, "#b27644", 0.35 * smoothstep(0.55, 0.95, n.y) * smoothstep(0.5, 0.8, w)); // worn top
  c = mix(c, "#1e0e08", 0.3 * smoothstep(-0.2, -0.9, n.y));
  return c;
}

const LEATHER = paint((p, n) => leatherRgb(p, n, 0.7));
const STRAP = paint((p, n) => leatherRgb(p, n, 0.15));

const SEAT = paint((p, n, s) => {
  const d = ((s[1] % 360) + 360) % 360;
  const a = Math.min(d, 360 - d);
  if (Math.abs(a - 62) < 2.5 && (((p.z / 0.02) % 1) + 1) % 1 < 0.55) return "#ead3a1";
  let col = leatherRgb(p, n, 0.55);
  if (a < 55) {
    const q1 = ((((p.x + p.z) / 0.07) % 1) + 1) % 1;
    const q2 = ((((p.x - p.z) / 0.07) % 1) + 1) % 1;
    if (q1 < 0.08 || q2 < 0.08) col = mix(col, "#24100a", 0.55);
  }
  return col;
});

const SKIRT = paint((p, n, s) => {
  const c = s[1];
  const edgeD = Math.min(c, 1 - c);
  const dash = (Math.abs(p.z) / 0.022) % 1 < 0.55;
  if (edgeD > 0.07 && edgeD < 0.14 && dash) return "#e9d2a0";
  let col = leatherRgb(p, n, 0.4);
  const u = p.z / 0.09;
  const dm = Math.abs((((u % 1) + 1) % 1) - 0.5) * 2 + Math.abs(c - 0.5) * 3.2;
  if (dm < 0.92 && dm > 0.7) col = mix(col, "#2a120a", 0.6);
  return col;
});

const ROLL = paint((p) => {
  const k = (Math.abs(p.x) / 0.035) % 4;
  return k < 2.6 ? CLOTH : k < 3.3 ? BLACK : "#d9a23a";
});

const WING = paint((p, n, s) => {
  const a = s[0];
  const c = s[1];
  let col: Rgb = mix("#7a4c2a", "#cc9c68", smoothstep(0.0, 0.7, a));
  col = mix(col, "#e6c492", 0.25 * noise(p, 0.3, 61));
  const vein = Math.abs(((((c * 3 + 0.12 * Math.sin(a * 10)) % 1) + 1) % 1) - 0.5);
  if (vein > 0.462) col = mix(col, "#5a3420", 0.55);
  const chev = Math.abs(a - (0.42 + Math.abs(c - 0.5) * 0.35));
  if (chev < 0.035) col = mix(col, CLOTH, 0.85); // Horde war-paint chevron
  if (chev > 0.05 && chev < 0.062) col = mix(col, BLACK, 0.7);
  col = mix(col, "#4a2a16", 0.55 * smoothstep(0.86, 1, a));
  col = mix(col, "#3e2a2a", 0.22 * smoothstep(-0.2, -0.9, n.y));
  col = mix(col, "#ffe2b0", 0.15 * smoothstep(0.3, 1, n.y));
  return col;
});

const WING_BONE = mottle("#5a3820", "#8e5c36", { size: 0.1, seed: 31 });

const CHITIN = paint((p, n, s) => {
  const f = (((s[0] * 8) % 1) + 1) % 1;
  const d = ((s[1] % 360) + 360) % 360;
  const a = Math.min(d, 360 - d);
  let c: Rgb = mix("#3a1e14", "#6a3a22", noise(p, 0.1, 51));
  c = mix(c, "#c27a3c", smoothstep(110, 160, a) * 0.8);
  c = mix(c, "#9a5a30", smoothstep(0.55, 0.9, f) * 0.6);
  if (f < 0.08 || f > 0.96) c = mix(c, "#120806", 0.7);
  c = mix(c, "#f0c080", 0.25 * smoothstep(0.5, 1, n.y) * smoothstep(0.3, 0.7, f));
  return c;
});

const STING = paint((_p, _n, s) =>
  mix(mix("#e8d9b0", "#7a1e14", smoothstep(0.2, 0.7, s[0])), "#1a0806", smoothstep(0.75, 1, s[0])),
);
const CLAW = paint((_p, _n, s) => mix("#f0e4c4", "#2e2218", smoothstep(0.45, 1, s[0])));
const TOOTH = paint((_p, _n, s) => mix("#b8a27a", "#fbf3dc", smoothstep(0, 0.4, s[0])));

const MANE_BASE = paint((p, n) => {
  let c: Rgb = mix("#2a100a", "#5a2214", noise(p, 0.08, 41));
  c = mix(c, "#a8482a", 0.25 * smoothstep(0.4, 1, n.y));
  return c;
});

const MANE_CACHE = new Map<number, Paint>();
/** Root-to-tip mane palette for a blade of length L, keyed on the outline's own coordinates. */
function manePaint(L: number): Paint {
  const k = Math.max(0.06, Math.round(L * 40) / 40);
  let pt = MANE_CACHE.get(k);
  if (!pt) {
    pt = paint((_p, n, s) => {
      const t = Math.min(1, Math.hypot(s[0] * 0.6, s[1]) / k);
      let c: Rgb = mix("#2e120c", "#7a2a18", smoothstep(0, 0.45, t));
      c = mix(c, "#c8572a", smoothstep(0.45, 0.85, t));
      c = mix(c, "#f39a4c", smoothstep(0.85, 1, t) * 0.75);
      const strand = (s[0] * 1.3 - s[1] * 0.5) / 0.022;
      const fr = ((strand % 1) + 1) % 1;
      if (fr < 0.2) c = mix(c, "#1e0a06", 0.35);
      c = mix(c, "#ffd08a", 0.15 * smoothstep(0.4, 1, n.y));
      return c;
    });
    MANE_CACHE.set(k, pt);
  }
  return pt;
}

// ---------------------------------------------------------------------------------------------------------------
// Drawings

function makeTextures() {
  const eye = svg(
    `<svg viewBox="0 0 120 84" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="ir" cx="0.55" cy="0.5" r="0.55">
        <stop offset="0" stop-color="#fff27a"/><stop offset="0.45" stop-color="#ffb12a"/><stop offset="1" stop-color="#b8440e"/>
      </radialGradient></defs>
      <path d="M4 46 C20 14 62 4 96 14 C110 20 117 32 116 42 C100 70 60 80 30 70 C16 64 8 56 4 46Z" fill="#160a06"/>
      <path d="M15 46 C30 22 62 14 92 22 C104 27 108 35 107 42 C94 62 60 70 34 63 C24 59 18 53 15 46Z" fill="url(#ir)"/>
      <path d="M62 18 C71 30 71 56 62 68 C55 56 55 30 62 18Z" fill="#120604"/>
      <ellipse cx="46" cy="34" rx="9" ry="6" fill="#ffffff"/>
      <circle cx="80" cy="54" r="3.5" fill="#fff6d0"/>
      <path d="M8 42 C26 10 66 2 100 12 C110 16 116 26 117 34" stroke="#160a06" stroke-width="8" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const emblem = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="60" fill="#8e1a14" stroke="#e3ad3e" stroke-width="6"/>
      <circle cx="64" cy="64" r="49" fill="none" stroke="#3a0e0a" stroke-width="3"/>
      <g fill="#1b0c08" stroke="#e8b54a" stroke-width="2.5" stroke-linejoin="round">
        <path d="M52 30 L64 8 L76 30 Z"/>
        <path d="M57 40 C30 26 16 58 30 88 C36 72 46 66 57 66 Z"/>
        <path d="M71 40 C98 26 112 58 98 88 C92 72 82 66 71 66 Z"/>
        <rect x="57" y="26" width="14" height="80" rx="3"/>
        <path d="M57 96 C46 106 36 108 28 100 C38 102 48 96 54 86 Z"/>
        <path d="M71 96 C82 106 92 108 100 100 C90 102 80 96 74 86 Z"/>
      </g>
      <circle cx="64" cy="54" r="5" fill="#e8b54a"/>
    </svg>`,
    { size: 256 },
  );

  let weave = "";
  for (let y = 6; y < 150; y += 8) weave += `M0 ${y}H256`;
  let hem = "M0 0H256V150";
  for (let i = 1; i <= 16; i++) hem += `L${256 - i * 16 + 8} 166L${256 - i * 16} 150`;
  hem += "Z";
  let zig = "M0 128";
  for (let i = 1; i <= 16; i++) zig += `L${i * 16 - 8} ${i % 2 ? 116 : 140}L${i * 16} 128`;
  let diamonds = "";
  for (let x = 32; x < 256; x += 32)
    diamonds += `<path d="M${x} 76 L${x + 10} 88 L${x} 100 L${x - 10} 88Z" fill="#e3ad3e"/><circle cx="${x}" cy="88" r="3.5" fill="${BLACK}"/>`;
  const blanket = svg(
    `<svg viewBox="0 0 256 168" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><path d="${hem}"/></clipPath></defs>
      <g clip-path="url(#c)">
        <rect width="256" height="168" fill="#8e1a14"/>
        <path d="${weave}" stroke="#731310" stroke-width="2"/>
        <rect x="0" y="0" width="256" height="40" fill="#741410"/>
        ${diamonds}
        <rect x="0" y="106" width="256" height="62" fill="${BLACK}"/>
        <rect x="0" y="106" width="256" height="4" fill="#e3ad3e"/>
        <path d="${zig}" stroke="#e3ad3e" stroke-width="5" fill="none" stroke-linejoin="round"/>
        <rect x="0" y="146" width="256" height="4" fill="#e3ad3e"/>
        <rect x="0" y="150" width="256" height="18" fill="#a8241a"/>
        <rect x="0" y="0" width="14" height="168" fill="${BLACK}"/>
        <rect x="242" y="0" width="14" height="168" fill="${BLACK}"/>
        <rect x="5" y="0" width="4" height="168" fill="#e3ad3e"/>
        <rect x="247" y="0" width="4" height="168" fill="#e3ad3e"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const hair = svg(
    `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="h" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#555555"/><stop offset="0.6" stop-color="#bdbdbd"/><stop offset="1" stop-color="#ffffff"/>
      </linearGradient></defs>
      <path d="M2 120 C4 80 8 40 12 2 C16 40 18 80 20 120Z" fill="url(#h)"/>
      <path d="M14 120 C16 84 22 46 30 8 C30 48 30 84 30 120Z" fill="url(#h)"/>
      <path d="M26 120 C30 90 34 60 39 28 C38 62 38 92 38 120Z" fill="url(#h)"/>
      <path d="M9 118 C11 96 13 72 15 50" stroke="#3a3a3a" stroke-width="2.4" fill="none"/>
      <path d="M22 118 C23 96 25 70 28 40" stroke="#3a3a3a" stroke-width="2.4" fill="none"/>
    </svg>`,
    { size: 128 },
  );

  const tuft = svg(
    `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="t" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#666666"/><stop offset="1" stop-color="#ffffff"/>
      </linearGradient></defs>
      <path d="M2 64 C6 44 8 24 12 4 C16 26 20 46 22 64 Z" fill="url(#t)"/>
      <path d="M16 64 C20 42 22 22 26 0 C30 22 32 42 34 64 Z" fill="url(#t)"/>
      <path d="M28 64 C32 46 36 28 44 8 C44 30 44 48 46 64 Z" fill="url(#t)"/>
    </svg>`,
    { size: 96 },
  );

  // A tassel drawn upside down: the card hangs from its root (the drawing's bottom edge).
  const tassel = svg(
    `<svg viewBox="0 0 24 72" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 58 L3 6 L8 6 L9 58Z M10 58 L10 2 L14 2 L14 58Z M15 58 L16 6 L21 6 L19 58Z" fill="#d49a30"/>
      <path d="M6 56 L5 12 M12 56 L12 8 M18 56 L18 12" stroke="#9a6418" stroke-width="1.6"/>
      <rect x="4" y="50" width="16" height="6" fill="#8e1a14"/>
      <ellipse cx="12" cy="64" rx="7" ry="7" fill="#e3ad3e" stroke="#7a4a12" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  const rune = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#24130c"/>
      <circle cx="32" cy="32" r="26" fill="none" stroke="#ff8a1e" stroke-width="3"/>
      <path d="M32 12 V52 M20 22 L32 32 L44 22 M22 46 L32 38 L42 46" stroke="#ffd65a" stroke-width="5" stroke-linecap="round" fill="none"/>
      <circle cx="32" cy="32" r="4" fill="#fff2b0"/>
    </svg>`,
    { size: 128 },
  );

  const war = svg(
    `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
      <g fill="#b3201a" stroke="#4a0c08" stroke-width="3" stroke-linejoin="round">
        <path d="M14 10 C22 30 26 56 22 84 C34 60 34 32 26 8 Z"/>
        <path d="M42 4 C50 28 54 56 50 86 C62 60 62 30 54 2 Z"/>
        <path d="M70 10 C78 30 82 56 78 82 C90 58 90 32 82 8 Z"/>
      </g>
    </svg>`,
    { size: 192 },
  );

  return { eye, emblem, blanket, hair, tuft, tassel, rune, war };
}

// ---------------------------------------------------------------------------------------------------------------
// Outlines

/** A flame-shaped hair blade: root along x at y = 0, tip at (curl, L) swept back along +x. */
function bladeOutline(L: number, W: number, curl: number): OutlinePoint[] {
  return [
    [-W * 0.5, 0],
    [W * 0.5, 0],
    [W * 0.55 + curl * 0.35, L * 0.42],
    [curl, L, "sharp"],
    [curl * 0.3 - W * 0.1, L * 0.56],
    [-W * 0.45, L * 0.22],
  ];
}

/** Saddle arch (cantle and pommel), drawn across the model, front view. */
const ARCH: OutlinePoint[] = [
  [-0.3, -0.16],
  [-0.15, -0.03],
  [0, 0],
  [0.15, -0.03],
  [0.3, -0.16],
  [0.34, 0.08],
  [0.22, 0.24],
  [0, 0.28],
  [-0.22, 0.24],
  [-0.34, 0.08],
];
const scaleOutline = (o: OutlinePoint[], k: number, dy = 0): OutlinePoint[] =>
  o.map((pt) => (pt.length === 3 ? [pt[0] * k, pt[1] * k + dy, "sharp"] : [pt[0] * k, pt[1] * k + dy]));

const BAG: OutlinePoint[] = [
  [-0.19, -0.16],
  [0, -0.17],
  [0.19, -0.16],
  [0.2, 0],
  [0.19, 0.15],
  [0, 0.16],
  [-0.19, 0.15],
  [-0.2, 0],
];
const FLAP: OutlinePoint[] = [
  [-0.2, 0.01],
  [-0.1, -0.06],
  [0, -0.085],
  [0.1, -0.06],
  [0.2, 0.01],
  [0.215, 0.175, "sharp"],
  [-0.215, 0.175, "sharp"],
];

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "wyvernMount", paintSize: 2048 });
  const T = makeTextures();
  const r = rng(1337);

  const blade = (
    at: THREE.Vector3,
    out: THREE.Vector3,
    flow: THREE.Vector3,
    L: number,
    bone: JointRef,
    opts: { w?: number; curl?: number; color?: Fill } = {},
  ) => {
    const y = out.clone().normalize();
    const x = flow.clone().addScaledVector(y, -flow.dot(y));
    if (x.lengthSq() < 1e-6) x.set(0, 0, -1);
    x.normalize();
    const W = (opts.w ?? 0.42) * L;
    const curl = (opts.curl ?? 0.45) * L;
    return b.extrude(bladeOutline(L, W, curl), {
      at: at.clone().addScaledVector(y, -0.025),
      x,
      y,
      thickness: [Math.max(0.012, W * 0.3), 0.004],
      bevel: 0.005,
      smoothing: 1,
      color: opts.color ?? manePaint(L),
      bone,
    });
  };

  // =============================================================================================================
  // Skeleton

  const hips = b.joint("hips", { at: [0, 1.32, -0.55], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([v3(0, 1.32, -0.55), v3(0, 1.35, -0.05), v3(0, 1.41, 0.45), v3(0, 1.47, 0.86)]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "chest"], role: "spine" },
  );
  const sp1 = spine.joints[0];
  const chest = spine.tip!;
  const neck = b.chain("neck", catmull([v3(0, 1.52, 0.9), v3(0, 1.74, 1.12), v3(0, 1.93, 1.33)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.98, 1.4], dir: [0, -0.1, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.09, 0.02), aim: hp(0, -0.15, 0.45), role: "jaw" });

  const tailPath = catmull([
    v3(0, 1.42, -0.95),
    v3(0, 1.43, -1.45),
    v3(0, 1.56, -1.9),
    v3(0, 1.86, -2.25),
    v3(0, 2.25, -2.4),
    v3(0, 2.6, -2.25),
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 8,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7", "tail8", "stinger"],
    role: "tail",
  });

  // =============================================================================================================
  // Body

  const body = b.loft(
    [
      { at: v3(0, 1.38, -1.08), w: 0.46, h: 0.48 },
      { at: v3(0, 1.4, -0.8), w: 0.7, h: 0.72 },
      { at: v3(0, 1.36, -0.35), w: 0.74, h: 0.72 },
      { at: v3(0, 1.37, 0.08), w: 0.74, h: 0.74 },
      { at: v3(0, 1.42, 0.45), w: 0.84, h: 0.84 },
      { at: v3(0, 1.47, 0.8), w: 0.76, h: 0.8 },
      { at: v3(0, 1.56, 1.02), w: 0.5, h: 0.56 },
    ],
    { bone: [spine, neck], color: FUR, detail: 1.5 },
  );
  const skin = b.surface(body);

  const neckTube = b.sweep(neck, [0.29, 0.2], { color: FUR, extend: [0, 0.05], detail: 1.25 });

  // Lion chest ruff.
  const ruff = skin.scatter(45, {
    rng: rng(12),
    minDist: 0.07,
    filter: (h) => h.n.z > 0.45 && h.at.y < 1.68 && h.at.y > 1.02,
  });
  b.cards(ruff, T.tuft, { size: [0.11, 0.2], lean: 50, bend: 20, flow: [0, -1, 0.2], vary: 0.3, rng: rng(13), color: "#d8a868" });
  const neckFluff = b.surface(neckTube).scatter(26, {
    rng: rng(14),
    minDist: 0.08,
    filter: (h) => h.n.y < 0.2 && h.n.z > -0.2,
  });
  b.cards(neckFluff, T.tuft, { size: [0.1, 0.18], lean: 55, bend: 20, vary: 0.3, rng: rng(15), color: "#e2b678" });

  // Flank helper: a point on the body side at a height and depth, with its outward, up and forward directions.
  const flank = (s: number, y: number, z: number) => {
    const hit = skin.ray([s * 1.5, y, z], [-s, 0, 0]);
    if (!hit) throw new Error(`wyvern: no flank at y ${y}, z ${z}`);
    const n = new THREE.Vector3().copy(hit.n).normalize();
    const up = new THREE.Vector3(0, 1, 0).addScaledVector(n, -n.y).normalize();
    const fwd = new THREE.Vector3(0, 0, 1).addScaledVector(n, -n.z);
    fwd.addScaledVector(up, -fwd.dot(up)).normalize();
    return { hit, at: new THREE.Vector3().copy(hit.at), n, up, fwd };
  };

  // =============================================================================================================
  // Legs

  const paw = (tip: JointRef, foot: THREE.Vector3) => {
    b.part(new THREE.SphereGeometry(1, 10, 7).scale(0.15, 0.1, 0.19), FUR, { bone: tip, at: v3(foot.x, 0.1, foot.z + 0.05) });
    for (let i = 0; i < 4; i++) {
      const tx = foot.x + (i - 1.5) * 0.065;
      const tz = foot.z + 0.2 - Math.abs(i - 1.5) * 0.03;
      b.part(new THREE.SphereGeometry(0.058, 7, 5), FUR, { bone: tip, at: v3(tx, 0.055, tz) });
      b.spike(v3(tx, 0.06, tz + 0.035), [0, -0.35, 1], 0.085, 0.022, { color: CLAW, bone: tip });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Front leg: elbow back, wrist forward.
    const fRoot = v3(0.3 * s, 1.28, 0.68);
    const fFoot = v3(0.36 * s, 0.12, 0.82);
    const fp = limb(fRoot, fFoot, [0.52, 0.46, 0.24], [
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const front = b.chain(`armF${S}`, fp, {
      parent: spine.joints[2],
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `pawF${S}`],
      role: "leg",
      contact: [0.36 * s, 0, 0.9],
    });
    b.sweep(front, [0.16, 0.125, 0.092, 0.085], { color: FUR });
    b.part(new THREE.SphereGeometry(1, 12, 9).scale(0.17, 0.25, 0.22), FUR, {
      bone: front.joints[0],
      at: fRoot.clone().add(v3(0.01 * s, -0.1, 0)),
    });
    paw(front.tip!, fFoot);
    const fRing = b.ring(front.at(0.86), { count: 8, radius: 0.09, tilt: 30 });
    b.cards(fRing.items, T.tuft, { size: [0.085, 0.15], lean: 40, flow: [0, -1, 0], vary: 0.25, rng: rng(20 + s), color: "#c99058" });

    // Hind leg: knee forward, hock back.
    const hRoot = v3(0.29 * s, 1.22, -0.62);
    const hFoot = v3(0.35 * s, 0.12, -0.76);
    const hpts = limb(hRoot, hFoot, [0.5, 0.46, 0.32], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`legH${S}`, hpts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `pawH${S}`],
      role: "leg",
      contact: [0.35 * s, 0, -0.66],
    });
    b.sweep(hind, [0.19, 0.13, 0.09, 0.085], { color: FUR });
    const haunchC = hRoot.clone().add(v3(0, -0.06, -0.04));
    const haunch = b.part(new THREE.SphereGeometry(1, 12, 9).scale(0.17, 0.27, 0.3), FUR, { bone: hind.joints[0], at: haunchC });
    paw(hind.tip!, hFoot);
    const hRing = b.ring(hind.at(0.88), { count: 8, radius: 0.09, tilt: 30 });
    b.cards(hRing.items, T.tuft, { size: [0.085, 0.15], lean: 40, flow: [0, -1, 0], vary: 0.25, rng: rng(30 + s), color: "#c99058" });

    // Horde claw-mark war paint on the haunch.
    const hh = b.surface(haunch).around(haunchC).at(s * 90, 8);
    if (hh) b.decal(haunch, T.war, { at: hh.at, dir: [s, 0.1, 0], size: [0.26, 0.24], mirror: s < 0 });
  }

  // =============================================================================================================
  // Wings: bat wings spread in the rest pose, three fingers and a clawed thumb.

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const W0 = v3(0.26 * s, 1.66, 0.5);
    const WE = v3(1.05 * s, 1.95, 0.32);
    const WR = v3(1.85 * s, 2.1, 0.5);
    const arm = b.chain(`wing${S}`, [W0, WE, WR], {
      parent: spine.joints[2],
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    const wrist = arm.tip!;
    b.sweep(arm, [0.11, 0.08, 0.065], { color: WING_BONE });
    b.part(new THREE.SphereGeometry(0.078, 8, 6), WING_BONE, { bone: wrist, at: WR });

    const tips = [v3(3.15 * s, 2.18, 0.05), v3(2.85 * s, 1.86, -0.85), v3(1.7 * s, 1.72, -1.15)];
    const mids = [v3(2.5 * s, 2.22, 0.34), v3(2.4 * s, 2.02, -0.2), lerp(WR, tips[2], 0.5)];
    const fingers = tips.map((tp, i) =>
      b.chain(`finger${i + 1}${S}`, catmull([WR, mids[i], tp]), {
        parent: wrist,
        names: [`finger${i + 1}a${S}`, `finger${i + 1}b${S}`],
        role: "digit",
      }),
    );
    for (const f of fingers) b.sweep(f, [0.05, 0.014], { color: WING_BONE, caps: { start: "round", end: "point" } });

    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.025, scallop: 0.14 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.025, scallop: 0.14 });
    const trail = catmull([v3(0.33 * s, 1.55, 0.1), v3(0.95 * s, 1.62, -0.45), tips[2]]);
    b.membrane(arm, trail, { color: WING, thickness: 0.025 });

    // Hooked thumb claw and an elbow spur.
    b.spike(WR, [s * 0.25, 0.35, 1], 0.22, 0.04, { color: CLAW, bone: wrist });
    b.spike(WE, [s * 0.2, 0.6, -1], 0.15, 0.032, { color: CLAW, bone: arm.joints[1] });
    // Knuckle studs along the leading finger.
    b.along(fingers[0], 3, (at) => b.spike(at.moved(at.at), [0, 1, 0], 0.06, 0.018, { color: CLAW }), { from: 0.15, to: 0.8 });
  }

  // =============================================================================================================
  // Scorpion tail with a venom stinger

  const segBump = (t: number) => Math.sin(Math.PI * ((t * 8) % 1));
  const tailR = (t: number) => (0.2 * (1 - t) + 0.06) * (1 - smoothstep(0.15, 0.3, t) * 0.16 * (1 - segBump(t)));
  const tailTube = b.sweep(tail, tailR, {
    bands: [
      [0.22, FUR],
      [1, CHITIN],
    ],
  });
  b.along(tailTube, 6, (at) => b.spike(at, at, 0.12, 0.036, { color: CLAW }), { from: 0.3, to: 0.92 });
  const tailFur = b.surface(tailTube).scatter(20, {
    rng: rng(40),
    minDist: 0.07,
    filter: (h) => h.at.z > -1.5 && h.n.y > -0.3,
  });
  b.cards(tailFur, T.tuft, { size: [0.1, 0.18], lean: 60, bend: 20, vary: 0.3, rng: rng(41), color: "#c78a4e" });

  const tEnd = tailPath.at(1);
  const tDir = tailPath.tangentAt(1).clone().normalize();
  const sting = tail.tip!;
  const bulbC = offset(tEnd, tDir, 0.06);
  b.part(new THREE.SphereGeometry(0.12, 10, 8).scale(1, 1.3, 1), CHITIN, { bone: sting, at: bulbC, dir: tDir });
  for (const s of [1, -1])
    glow(b.part(new THREE.SphereGeometry(0.032, 7, 5), "#7dff3a", { bone: sting, at: bulbC.clone().add(v3(0.105 * s, 0, 0)) }), 1.6);
  const stingTip = tEnd.clone().add(v3(0, 0.26, 0.47));
  b.sweep(bezier(offset(tEnd, tDir, 0.16), offset(tEnd, tDir, 0.34), tEnd.clone().add(v3(0, 0.42, 0.28)), stingTip), [0.07, 0], {
    color: STING,
    bone: sting,
    caps: { start: "flat", end: "point" },
  });
  glow(b.part(new THREE.SphereGeometry(0.028, 8, 6), "#a8ff4a", { bone: sting, at: stingTip }), 2);

  // =============================================================================================================
  // Head

  const cranium = b.part(new THREE.SphereGeometry(1, 14, 11).scale(0.25 * H, 0.23 * H, 0.26 * H), HEADP, {
    bone: head,
    at: hp(0, 0.02, 0),
  });
  const crSurf = b.surface(cranium);
  const snout = b.loft(
    [
      { at: hp(0, -0.04, 0.1), w: 0.32 * H, h: 0.24 * H },
      { at: hp(0, -0.04, 0.3), w: 0.3 * H, h: 0.2 * H },
      { at: hp(0, -0.05, 0.46), w: 0.26 * H, h: 0.16 * H },
    ],
    { bone: head, color: HEADP, detail: 1.25 },
  );
  b.part(new THREE.SphereGeometry(1, 10, 6).scale(0.11 * H, 0.055 * H, 0.07 * H), NOSE, { bone: head, at: hp(0, 0.035, 0.47) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024 * H, 6, 4).scale(1.3, 0.8, 1), "#120806", { bone: head, at: hp(s * 0.05, 0.03, 0.53) });
  }
  // Dark mouth line and throat.
  b.part(new THREE.BoxGeometry(0.2 * H, 0.05 * H, 0.34 * H), "#3a1210", { bone: head, at: hp(0, -0.115, 0.24) });

  // Lower jaw (opens).
  b.loft(
    [
      { at: hp(0, -0.12, 0.03), w: 0.26 * H, h: 0.12 * H },
      { at: hp(0, -0.15, 0.26), w: 0.23 * H, h: 0.11 * H },
      { at: hp(0, -0.155, 0.43), w: 0.18 * H, h: 0.09 * H },
    ],
    { bone: jaw, color: HEADP },
  );
  b.part(new THREE.BoxGeometry(0.13 * H, 0.03 * H, 0.3 * H), "#b4485a", { bone: jaw, at: hp(0, -0.105, 0.24) });

  for (const s of [1, -1]) {
    // Upper teeth along the lip edge, a pair of fangs, and big lower tusks.
    for (const [z, x] of [
      [0.17, 0.138],
      [0.23, 0.136],
      [0.29, 0.132],
    ] as [number, number][])
      b.spike(hp(s * x, -0.075, z), [0, -1, 0.08], 0.06 * H, 0.016 * H, { color: TOOTH, bone: head });
    b.spike(hp(s * 0.115, -0.08, 0.36), [s * 0.05, -1, 0.12], 0.11 * H, 0.024 * H, { color: TOOTH, bone: head });
    b.sweep(
      bezier(hp(s * 0.075, -0.13, 0.4), hp(s * 0.15, -0.14, 0.45), hp(s * 0.2, -0.06, 0.48), hp(s * 0.175, 0.0, 0.45)),
      [0.036 * H, 0],
      { color: TOOTH, bone: jaw, caps: { start: "flat", end: "point" } },
    );
  }

  // Eyes: drawn decals on the skull, hooded by heavy brows.
  for (const s of [1, -1]) {
    const hit = crSurf.around(hp(0, 0.02, 0)).at(s * 40, 22);
    if (hit) {
      b.decal(cranium, T.eye, { at: hit.at, dir: [s * 0.55, 0.2, 0.81], size: [0.13 * H, 0.078 * H], mirror: s > 0 });
    }
    b.capsule(hp(s * 0.17, 0.18, 0.09), hp(s * 0.07, 0.19, 0.18), 0.042 * H, { color: HEADP, bone: head });
  }

  // Ears with dark inner felt and lynx tufts.
  for (const s of [1, -1]) {
    const earY = v3(0.55 * s, 0.75, -0.35).normalize();
    const earX = v3(1, 0, 0).addScaledVector(earY, -earY.x).normalize();
    const thick = earX.clone().cross(earY).normalize();
    const sgn = thick.z > 0 ? 1 : -1;
    const earBase = hp(0.17 * s, 0.16, -0.07);
    const EAR: OutlinePoint[] = [
      [-0.075 * H, 0],
      [0.075 * H, 0],
      [0.05 * H, 0.14 * H],
      [0.005 * H, 0.27 * H, "sharp"],
      [-0.04 * H, 0.15 * H],
    ];
    b.extrude(EAR, { at: earBase, x: earX, y: earY, thickness: [0.035, 0.012], bevel: 0.006, smoothing: 1, color: HEADP, bone: head });
    b.extrude(scaleOutline(EAR, 0.68), {
      at: earBase.clone().addScaledVector(thick, sgn * 0.014).addScaledVector(earY, 0.03),
      x: earX,
      y: earY,
      thickness: 0.012,
      smoothing: 1,
      color: "#6b3a30",
      bone: head,
    });
    const earTip = earBase.clone().addScaledVector(earY, 0.25 * H);
    blade(earTip, earY.clone().add(v3(0, 0.3, -0.2)), v3(0, -0.2, -1), 0.13, head, { w: 0.35, curl: 0.3 });
  }

  // =============================================================================================================
  // Mane: a solid crest from the crown to the withers, layered flame blades and hair cards.

  const manePath = catmull([hp(0, 0.19, -0.04), v3(0, 2.12, 1.22), v3(0, 1.98, 1.0), v3(0, 1.86, 0.74), v3(0, 1.8, 0.55)]);
  const maneMass = b.sweep(manePath, (t: number) => [0.15 - 0.05 * t, 0.11 - 0.03 * t] as [number, number], {
    bone: [spine, neck, head],
    color: MANE_BASE,
  });
  const N = 10;
  for (let i = 0; i < N; i++) {
    const t = 0.03 + (i / (N - 1)) * 0.92;
    for (const ang of [0, -62, 62, -110, 110]) {
      if (Math.abs(ang) > 100 && (t < 0.12 || t > 0.6)) continue;
      const fr = maneMass.at(t, ang);
      const n = new THREE.Vector3().copy(fr.n).normalize();
      const flow = new THREE.Vector3().copy(fr.tangent).normalize();
      const side = Math.abs(ang) / 110;
      const L = (0.46 - 0.22 * t) * (1 - 0.35 * side) * (0.88 + 0.24 * r());
      const out = n.clone().addScaledVector(flow, 0.3).normalize();
      blade(new THREE.Vector3().copy(fr.at), out, flow, L, fr.bone ?? neck.joints[1]);
    }
  }
  const maneHits = b.surface(maneMass).scatter(70, { rng: rng(5), minDist: 0.06, filter: (h) => h.n.y > -0.25 });
  b.cards(maneHits, T.hair, { size: [0.11, 0.26], lean: 55, bend: 30, vary: 0.3, rng: rng(6), color: "#8a3a22" });

  // Forelock between the ears.
  blade(hp(0, 0.21, 0.04), v3(0, 1, 0.25), v3(0, -0.2, -1), 0.28, head);
  for (const s of [1, -1]) blade(hp(s * 0.07, 0.2, 0.02), v3(s * 0.45, 1, 0.1), v3(0, -0.2, -1), 0.24, head);

  // Cheek ruffs flaring out behind the jaw hinge.
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++)
      blade(hp(s * 0.2, -0.08 + k * 0.07, -0.03 - k * 0.03), v3(s * 0.9, -0.3 + k * 0.3, -0.25), v3(0, -0.25, -1), 0.3 + 0.05 * k, head, {
        w: 0.45,
      });

  // Chin beard on the lower jaw.
  for (const x of [-0.05, 0, 0.05])
    blade(hp(x, -0.19, 0.28 - Math.abs(x) * 0.5), v3(x * 2, -1, -0.15), v3(0, 0, -1), 0.2 + (x === 0 ? 0.04 : 0), jaw, {
      w: 0.4,
      curl: 0.35,
    });

  // =============================================================================================================
  // Bridle: noseband, headstall, cheek straps, bit rings and a glowing rune medallion.

  const noseLoop = b.surface(snout).loop(hp(0, -0.04, 0.33), { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(noseLoop, 0.017, { color: STRAP, bone: head });
  b.along(noseLoop, 6, (at) => b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { at, bone: head }));
  const headLoop = crSurf.loop(hp(0, 0.03, 0.01), { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(headLoop, 0.018, { color: STRAP, bone: head });
  for (const s of [1, -1]) {
    const ts = s > 0 ? 0.75 : 0.25;
    const ringAt = hp(0.165 * s, -0.1, 0.17);
    b.rod(headLoop.at(ts), ringAt, 0.014, STRAP, { bone: head });
    b.rod(noseLoop.at(ts), ringAt, 0.013, STRAP, { bone: head });
    b.part(new THREE.TorusGeometry(0.035, 0.009, 5, 12), GOLD, { bone: head, at: ringAt, dir: [s, 0, 0], axis: "z" });
  }
  const medal = crSurf.around(hp(0, 0.02, 0)).at(0, 40);
  if (medal) {
    b.stick(new THREE.CylinderGeometry(0.048, 0.054, 0.018, 10), GOLD, medal, { bone: head });
    glow(
      b.part(new THREE.CircleGeometry(0.038, 16), "#ffffff", {
        bone: head,
        at: offset(medal, medal, 0.017),
        dir: medal,
        axis: "z",
        texture: T.rune,
      }),
      1.6,
    );
    b.rod(medal.at, headLoop.at(0), 0.013, STRAP, { bone: head });
  }

  // Reins from the bit rings along the neck to the saddle horn.
  for (const s of [1, -1]) {
    const rein = catmull([
      hp(0.165 * s, -0.1, 0.17),
      hp(0.23 * s, -0.2, 0.0),
      v3(0.27 * s, 1.84, 1.0),
      v3(0.18 * s, 1.93, 0.5),
      v3(0.05 * s, 1.93, 0.0),
    ]);
    b.sweep(rein, 0.013, { color: STRAP, bone: [spine, neck, head] });
  }

  // =============================================================================================================
  // Saddle

  // Blanket: drawn cloth draped over both flanks, with gold tassels on the hem.
  for (const s of [1, -1]) {
    const bf = flank(s, 1.5, -0.28);
    b.decal(body, T.blanket, { at: bf.at, dir: bf.n, size: [0.9, 0.62], segments: 14, mirror: s < 0 });
    const tf = [];
    for (let i = 0; i < 7; i++) {
      const h = skin.ray([s * 1.5, 1.21, 0.13 - i * 0.135], [-s, 0, 0]);
      if (h) tf.push(frame(offset(h, h, 0.004), [0, 1, 0]));
    }
    b.cards(tf, T.tassel, { size: [0.05, 0.14], lean: 180, flow: [s, 0, 0], bone: sp1 });
  }

  // Girth strap round the belly (tucked under the skirts at the sides).
  const girth = skin.loop([0, 1.37, -0.2], { dir: [0, 0, 1], lift: 0.012 });
  b.sweep(girth, 0.022, { color: STRAP, bone: sp1 });
  b.part(new THREE.BoxGeometry(0.07, 0.016, 0.06), GOLD, { bone: sp1, at: girth.at(0.5) });

  // Seat.
  b.loft(
    [
      { at: v3(0, 1.74, -0.02), w: 0.46, h: 0.12 },
      { at: v3(0, 1.72, -0.28), w: 0.56, h: 0.1 },
      { at: v3(0, 1.76, -0.55), w: 0.48, h: 0.14 },
    ],
    { bone: sp1, color: SEAT, detail: 1.25 },
  );

  // Pommel arch with a gold backing, Horde emblem and an ivory horn the reins hook on.
  const POMM = scaleOutline(ARCH, 0.75);
  b.extrude(POMM, { at: v3(0, 1.735, 0.03), x: [1, 0, 0], thickness: 0.07, bevel: 0.015, smoothing: 1, color: STRAP, bone: sp1 });
  b.extrude(scaleOutline(ARCH, 0.82, -0.004), {
    at: v3(0, 1.735, 0.012),
    x: [1, 0, 0],
    thickness: 0.04,
    bevel: 0.008,
    smoothing: 1,
    color: GOLD,
    bone: sp1,
  });
  b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
    bone: sp1,
    at: v3(0, 1.82, 0.0685),
    dir: [0, 0, 1],
    axis: "z",
    texture: T.emblem,
  });
  b.sweep(bezier(v3(0, 1.72, -0.05), v3(0, 1.9, -0.02), v3(0, 2.03, -0.04), v3(0, 2.07, -0.13)), [0.055, 0.022], {
    color: TOOTH,
    bone: sp1,
    caps: { start: "flat", end: "round" },
  });
  b.part(new THREE.TorusGeometry(0.05, 0.013, 5, 12), GOLD, { bone: sp1, at: v3(0, 1.93, -0.025), dir: [0, 1, 0], axis: "z" });

  // Cantle: tall leather arch, gold plated back, stud row, glowing rune and iron spikes.
  const CZ = -0.58;
  b.extrude(ARCH, { at: v3(0, 1.75, CZ), x: [1, 0, 0], thickness: 0.08, bevel: 0.02, smoothing: 1, color: STRAP, bone: sp1 });
  b.extrude(scaleOutline(ARCH, 1.1, 0.005), {
    at: v3(0, 1.75, CZ - 0.03),
    x: [1, 0, 0],
    thickness: 0.05,
    bevel: 0.01,
    smoothing: 1,
    color: GOLD,
    bone: sp1,
  });
  const archTop = (x: number) => {
    const a = Math.abs(x);
    return a <= 0.22 ? 0.28 - 0.04 * (a / 0.22) ** 2 : 0.24 - ((a - 0.22) / 0.12) * 0.16;
  };
  for (let i = 0; i < 9; i++) {
    const x = -0.28 + i * 0.07;
    b.part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, { bone: sp1, at: v3(x, 1.75 + archTop(x) - 0.04, CZ + 0.043) });
  }
  b.part(new THREE.TorusGeometry(0.052, 0.01, 5, 14), GOLD, { bone: sp1, at: v3(0, 1.86, CZ + 0.044), dir: [0, 0, 1], axis: "z" });
  glow(
    b.part(new THREE.CircleGeometry(0.046, 16), "#ffffff", {
      bone: sp1,
      at: v3(0, 1.86, CZ + 0.046),
      dir: [0, 0, 1],
      axis: "z",
      texture: T.rune,
    }),
    1.6,
  );
  for (const s of [1, -1]) {
    const sb = v3(s * 0.24, 1.96, CZ);
    b.part(new THREE.SphereGeometry(0.03, 7, 5), GOLD, { bone: sp1, at: sb });
    b.spike(sb, [s * 0.45, 1, -0.35], 0.2, 0.034, { color: IRON, bone: sp1 });
  }

  // Skirts, stirrups and their straps on each side.
  const ZS = [0.04, -0.12, -0.28, -0.44, -0.6];
  for (const s of [1, -1]) {
    const edge = (y: number, lift: number) =>
      catmull(
        ZS.map((z) => {
          const f = flank(s, y, z);
          return f.at.clone().addScaledVector(f.n, lift);
        }),
      );
    b.membrane(edge(1.68, 0.02), edge(1.49, 0.022), { color: SKIRT, thickness: 0.018, bone: sp1 });
    b.membrane(edge(1.49, 0.022), edge(1.3, 0.024), { color: SKIRT, thickness: 0.018, bone: sp1 });
    b.sweep(edge(1.3, 0.034), 0.012, { color: GOLD, bone: sp1 });
    b.along(edge(1.49, 0.034), 5, (at) => b.part(new THREE.SphereGeometry(0.017, 6, 4), GOLD, { at, bone: sp1 }));

    const zS = -0.3;
    const pts = [1.66, 1.46, 1.27].map((y) => {
      const f = flank(s, y, zS);
      return f.at.clone().addScaledVector(f.n, 0.045);
    });
    const hang = pts[2].clone().add(v3(0.02 * s, -0.24, 0));
    b.sweep(catmull([...pts, hang]), 0.016, { color: STRAP, bone: sp1 });
    b.part(new THREE.BoxGeometry(0.012, 0.05, 0.05), GOLD, { bone: sp1, at: pts[2].clone().add(v3(0.012 * s, 0, 0)) });
    const ringC = hang.clone().add(v3(0, -0.065, 0));
    b.part(new THREE.TorusGeometry(0.065, 0.014, 5, 12), IRON, { bone: sp1, at: ringC, dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.BoxGeometry(0.05, 0.016, 0.11), IRON, { bone: sp1, at: ringC.clone().add(v3(0, -0.06, 0)) });
  }

  // Bedroll behind the cantle.
  const rollC = v3(0, 1.8, -0.76);
  b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.56, 10), ROLL, { bone: sp1, at: rollC, dir: [1, 0, 0] });
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.089, 0.012, 4, 12), STRAP, {
      bone: sp1,
      at: rollC.clone().add(v3(s * 0.17, 0, 0)),
      dir: [1, 0, 0],
      axis: "z",
    });
  }

  // =============================================================================================================
  // Saddlebags hanging from the bedroll over the haunches.

  for (const s of [1, -1]) {
    const fr = flank(s, 1.5, -0.92);
    const BT = 0.16;
    const C = fr.at.clone().addScaledVector(fr.n, BT / 2 - 0.035);
    const at = (fwd: number, up: number, out: number) =>
      C.clone().addScaledVector(fr.fwd, fwd).addScaledVector(fr.up, up).addScaledVector(fr.n, out);

    b.extrude(BAG, { at: C, x: fr.fwd, y: fr.up, thickness: BT, bevel: 0.035, smoothing: 1, color: LEATHER, bone: hips });
    b.extrude(FLAP, {
      at: at(0, 0, BT / 2 + 0.011),
      x: fr.fwd,
      y: fr.up,
      thickness: 0.022,
      bevel: 0.007,
      smoothing: 1,
      color: STRAP,
      bone: hips,
    });
    b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      bone: hips,
      at: at(0, 0.075, BT / 2 + 0.026),
      dir: fr.n,
      up: fr.up,
      axis: "z",
      texture: T.emblem,
    });
    for (const u of [-0.13, 0.13]) {
      b.part(new THREE.BoxGeometry(0.035, 0.2, 0.008), LEATHER, {
        bone: hips,
        at: at(u, 0.07, BT / 2 + 0.026),
        dir: fr.up,
        up: fr.n,
      });
      b.part(new THREE.BoxGeometry(0.05, 0.045, 0.012), GOLD, {
        bone: hips,
        at: at(u, -0.01, BT / 2 + 0.031),
        dir: fr.up,
        up: fr.n,
      });
    }
    // Corner studs on the bag face.
    for (const [u, w] of [
      [-0.16, -0.12],
      [0.16, -0.12],
    ] as [number, number][])
      b.part(new THREE.SphereGeometry(0.013, 6, 4), GOLD, { bone: hips, at: at(u, w, BT / 2 + 0.004) });
    // Hanging strap up to the bedroll.
    b.rod(at(0.05, 0.15, -0.02), rollC.clone().add(v3(s * 0.25, -0.02, 0.03)), 0.014, STRAP, { bone: hips });
    b.rod(at(-0.08, 0.15, -0.02), rollC.clone().add(v3(s * 0.25, -0.02, -0.04)), 0.014, STRAP, { bone: hips });
  }

  // =============================================================================================================
  // Rest pose: jaw a little open to show the teeth and tongue.

  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
```
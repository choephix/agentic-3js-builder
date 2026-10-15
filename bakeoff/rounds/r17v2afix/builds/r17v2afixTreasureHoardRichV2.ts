import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { cells, mix, noise, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { KEY_LIGHT, shadowOf } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hextech Dragon Hoard",
  description:
    "A dragon's treasure hoard on a rune-lit stone dais: an open chest spilling gold coins, a spiked crown, three goblets (one tipped over, one brimming with glowing potion), cut gems, ingots, a coin sack, a pearl necklace and a luckless adventurer's skull, between glowing hextech crystals.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Hue = string | readonly [number, number, number];

const merge = (g: THREE.BufferGeometry[]) => {
  const m = mergeGeometries(g);
  if (!m) throw new Error("merge failed");
  return m;
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints: painterly four-tone cel shading with hue-shifted shadows, tuned for a top-down camera.

const LIGHT = new THREE.Vector3(...KEY_LIGHT).normalize();

function toon(base: string, hi?: Hue, sh?: Hue): Paint {
  const H = hi ?? mix(base, "#fff1cf", 0.42);
  const S = sh ?? shadowOf(base);
  const DEEP = mix(S, "#1d0f40", 0.42);
  return paint((_p, n) => {
    const d = n.dot(LIGHT);
    return d > 0.93 ? H : d > 0.12 ? base : d > -0.38 ? S : DEEP;
  });
}

const GOLD = toon("#ffbf2b", "#fff4a8", "#e8742a");
const GOLD_DEEP = toon("#d98a22", "#ffcb52", "#9a4528");
const GOLD_DARK = toon("#b5691f", "#f0a43a", "#6e2f2c");
const SILVER = toon("#c8dcff", "#ffffff", "#7a86d6");
const ROSE = toon("#ff9a5a", "#ffe0a8", "#d9503e");
const BONE = toon("#efe4c8", "#fffbe8", "#a89ac0");
const IRON = toon("#5a5f86", "#a9b4ee", "#2f2f62");
const CRIMSON = toon("#d41f4c", "#ff6f8e", "#8d1245");
const BURLAP = toon("#c9965c", "#ffd9a0", "#8f5646");
const ROCK = toon("#5b559f", "#a9a2ee", "#352d78");
const PEARL = toon("#f6eefc", "#ffffff", "#b4a6dc");
const INK = "#241238";

const GEMS = {
  ruby: toon("#ff2a5c", "#ffa6bc", "#b00f46"),
  sapphire: toon("#2f6bff", "#a3c4ff", "#1b2fb5"),
  emerald: toon("#16e08c", "#a6ffd9", "#0b8c8f"),
  amethyst: toon("#b44dff", "#e8bbff", "#6a22c4"),
  citrine: toon("#ffe23a", "#fffbb0", "#e88a1f"),
} as const;
type GemKey = keyof typeof GEMS;
const GEM_KEYS: GemKey[] = ["ruby", "sapphire", "emerald", "amethyst", "citrine"];

const CY_DEEP = "#1fb8e8";
const CY_MID = "#36e6ff";
const CY_TIP = "#b4fbff";
const VIOLET_GLOW = "#c860ff";
const MINT_GLOW = "#6dffd4";

// Wooden planks (chest body): horizontal boards in three tones, dark seams, grain streaks.
const WOODS = [toon("#8a4636", "#d98a5c", "#4f2342"), toon("#7a3b34", "#c77a58", "#44203f"), toon("#995240", "#e29a68", "#592848")];
const SEAM = "#2f1530";
const woodPaint = paint((p, n, s) => {
  const row = Math.floor(s[1] / 0.085);
  const f = s[1] / 0.085 - row;
  if (f < 0.07) return SEAM;
  const tone = WOODS[((row * 7 + 3) % 3 + 3) % 3];
  if (noise(new THREE.Vector3(p.x * 0.07, p.y * 1.2, p.z * 0.07), 0.07, 3) > 0.66 && Math.abs(n.y) < 0.6) return WOODS[(row + 1) % 3 === 0 ? 1 : 2];
  return tone;
});
const WOOD_LID = toon("#8a4636", "#d98a5c", "#4f2342");

// Dais flagstones with cracked seams and a lit bevel.
const SLABS = [toon("#5b63a8", "#9aa4f0", "#3b3a82"), toon("#6a5fae", "#aa9cf0", "#41358a"), toon("#4f6fb4", "#8fb4f4", "#2f3f8c")];
const daisPaint = paint((p, n) => {
  const c = cells(p, 0.44, 5);
  const e = c.d2 - c.d1;
  if (e < 0.055) return "#1d1440";
  if (e < 0.12 && n.y > 0.5) return "#8f98e4";
  return SLABS[Math.min(2, Math.floor(c.id * 3))];
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings (SVG textures)

const RUNE_RING = (() => {
  let g = "";
  const N = 32;
  for (let i = 0; i < N; i++) {
    const a = (i * 360) / N;
    const k = i % 4;
    const glyph =
      k === 0
        ? `<path d="M100 8 L100 22 M94 13 L106 13"/>`
        : k === 1
          ? `<path d="M96 9 L104 9 L100 21 Z"/>`
          : k === 2
            ? `<path d="M100 9 L100 21 M95 15 L100 9 L105 15"/>`
            : `<circle cx="100" cy="15" r="4"/>`;
    g += `<g transform="rotate(${a} 100 100)">${glyph}</g>`;
  }
  const hexPts = (r: number, off: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const t = ((off + i * 60) * Math.PI) / 180;
      return `${(100 + r * Math.sin(t)).toFixed(2)},${(100 - r * Math.cos(t)).toFixed(2)}`;
    }).join(" ");
  const markup = `<svg viewBox="0 0 200 200"><g fill="none" stroke="#7af4ff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="100" cy="100" r="97.5"/><circle cx="100" cy="100" r="79"/>
    ${g}
    <polygon points="${hexPts(88, 0)}" stroke-width="1.2" stroke="#36d4ff"/>
    <polygon points="${hexPts(88, 30)}" stroke-width="1.2" stroke="#36d4ff"/>
    </g></svg>`;
  return svg(markup, { size: 1024 });
})();

const SPARKLE = svg(
  `<svg viewBox="0 0 100 100"><path d="M50 0 L57 43 L100 50 L57 57 L50 100 L43 57 L0 50 L43 43 Z" fill="#dffcff"/><circle cx="50" cy="50" r="9" fill="#ffffff"/></svg>`,
  { size: 128 },
);

const INGOT_STAMP = svg(
  `<svg viewBox="0 0 100 40"><g fill="none" stroke="#a8541c" stroke-width="4" stroke-linejoin="round"><rect x="4" y="4" width="92" height="32" rx="6"/><polygon points="50,8 64,16 64,28 50,36 36,28 36,16"/></g><circle cx="50" cy="22" r="5" fill="#a8541c"/><g fill="#a8541c"><rect x="14" y="17" width="14" height="5"/><rect x="72" y="17" width="14" height="5"/></g></svg>`,
  { size: 256 },
);

const SACK_PATCH = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="#7d3f2e"/><polygon points="50,12 84,31 84,69 50,88 16,69 16,31" fill="#e6a32e"/><circle cx="50" cy="50" r="22" fill="#ffd45e" stroke="#9a4d1e" stroke-width="5"/><polygon points="50,36 62,43 62,57 50,64 38,57 38,43" fill="none" stroke="#9a4d1e" stroke-width="5"/></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(20250611);
  const rr = (lo: number, hi: number) => lo + (hi - lo) * R();
  const Y = new THREE.Vector3(0, 1, 0);

  type PartOpts = Parameters<typeof b.part>[2];
  const part = (geo: THREE.BufferGeometry, color: Paint | string, o: PartOpts = {}) => b.part(geo, color, { bone: root, ...o });

  /** A local frame (origin + orientation) for tilted objects: p() maps local points to the model, d() directions. */
  class Fr {
    q: THREE.Quaternion;
    constructor(
      public o: THREE.Vector3,
      axis: V | THREE.Vector3,
      spinDeg = 0,
    ) {
      this.q = aim(axis);
      this.q.multiply(new THREE.Quaternion().setFromAxisAngle(Y, (spinDeg * Math.PI) / 180));
    }
    p(v: V) {
      return new THREE.Vector3(...v).applyQuaternion(this.q).add(this.o);
    }
    d(v: V) {
      return new THREE.Vector3(...v).applyQuaternion(this.q);
    }
  }

  const D = 0.09; // dais top

  // -------------------------------------------------------------------------------------------------------------
  // Heap volumes: ellipsoid lumps; every pile of coins is scattered over their surface.

  type Lump = { x: number; z: number; rx: number; rz: number; h: number; y0: number };
  const CZ = -0.52; // chest centre z
  const FEET = 0.05;
  const BODY_Y0 = D + FEET;
  const HB = 0.34;
  const TOP = BODY_Y0 + HB;
  const LUMPS: Lump[] = [
    { x: 0.05, z: 0.15, rx: 0.56, rz: 0.4, h: 0.22, y0: D },
    { x: -0.42, z: 0.3, rx: 0.32, rz: 0.3, h: 0.15, y0: D },
    { x: 0.55, z: 0.3, rx: 0.3, rz: 0.26, h: 0.14, y0: D },
    { x: 0.0, z: -0.12, rx: 0.5, rz: 0.2, h: 0.26, y0: D },
    { x: 0.78, z: -0.1, rx: 0.2, rz: 0.2, h: 0.09, y0: D },
    { x: -0.8, z: 0.12, rx: 0.22, rz: 0.22, h: 0.11, y0: D },
    { x: 0, z: CZ, rx: 0.4, rz: 0.22, h: 0.14, y0: TOP - 0.03 },
    { x: 0.86, z: 0.58, rx: 0.075, rz: 0.075, h: 0.06, y0: D + 0.27 },
    { x: 0.8, z: 0.77, rx: 0.2, rz: 0.13, h: 0.045, y0: D },
  ];
  const heapH = (x: number, z: number) => {
    let h = D;
    for (const l of LUMPS) {
      const u = ((x - l.x) / l.rx) ** 2 + ((z - l.z) / l.rz) ** 2;
      if (u < 1) h = Math.max(h, l.y0 + l.h * Math.sqrt(1 - u));
    }
    return h;
  };
  const inChest = (x: number, y: number, z: number) => Math.abs(x) < 0.48 && z > CZ - 0.3 && z < CZ + 0.3 && y < TOP - 0.005;

  const lumpPaint = toon("#d98a22", "#ffc84e", "#8f3f2e");
  LUMPS.forEach((l, i) => {
    if (i === 7) return;
    part(new THREE.SphereGeometry(1, 12, 7), lumpPaint, { at: [l.x, l.y0, l.z], scale: [l.rx * 0.98, l.h * 0.98, l.rz * 0.98], name: `lump${i}` });
  });

  type Sample = { pos: THREE.Vector3; n: THREE.Vector3 };
  function sampleLump(i: number): Sample | null {
    const l = LUMPS[i];
    for (let tries = 0; tries < 60; tries++) {
      const az = R() * Math.PI * 2;
      const dy = Math.pow(R(), 0.62) * 0.98 + 0.02;
      const hr = Math.sqrt(1 - dy * dy);
      const px = l.x + l.rx * hr * Math.cos(az);
      const py = l.y0 + l.h * dy;
      const pz = l.z + l.rz * hr * Math.sin(az);
      if (i !== 6 && inChest(px, py, pz)) continue;
      if (heapH(px, pz) > py + 0.012) continue;
      const n = new THREE.Vector3((px - l.x) / (l.rx * l.rx), (py - l.y0) / (l.h * l.h), (pz - l.z) / (l.rz * l.rz)).normalize();
      return { pos: new THREE.Vector3(px, py, pz), n };
    }
    return null;
  }

  // -------------------------------------------------------------------------------------------------------------
  // Coins: embossed gold, rose-gold and silver discs, merged per tone.

  const COIN_R = 0.03;
  const COIN_T = 0.009;
  const coinBase = (() => {
    const g = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 8, 1);
    const uv = g.getAttribute("uv");
    for (let i = 0; i < 18; i++) uv.setXY(i, 2 + uv.getX(i), uv.getY(i)); // torso: u in 2..3 marks the reeded edge
    return g;
  })();

  function coinPaint(face: string, hiface: Hue, shface: Hue, rim: string, hirim: Hue, shrim: Hue, emblem: string, hiem: Hue, shem: Hue, groove: string) {
    const F = toon(face, hiface, shface);
    const Rm = toon(rim, hirim, shrim);
    const E = toon(emblem, hiem, shem);
    const G = toon(groove);
    return paint((_p, _n, s) => {
      if (s[0] > 1.5) return Math.floor((s[0] - 2) * 24) % 2 ? G : Rm;
      const x = s[0] - 0.5;
      const y = s[1] - 0.5;
      const rad = Math.hypot(x, y);
      if (rad > 0.43) return Rm;
      if (rad > 0.37) return G;
      const hex = Math.max(Math.abs(x) * 0.866 + Math.abs(y) * 0.5, Math.abs(y));
      if (hex < 0.075) return G;
      if (hex < 0.19) return hex > 0.135 ? E : F;
      const ang = Math.atan2(y, x);
      if (rad > 0.27 && Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 12) % 2 === 0 && rad < 0.33) return E;
      return F;
    });
  }
  const COIN_PAINT: Record<"gold" | "rose" | "silver", Paint> = {
    gold: coinPaint("#ffbf2b", "#ffe680", "#e8742a", "#ffd24a", "#fff6b8", "#f08a2e", "#fff0a0", "#ffffff", "#ffc24a", "#b8611f"),
    rose: coinPaint("#ff9a5a", "#ffd0a0", "#d9503e", "#ffb070", "#ffe8c0", "#e0603e", "#ffe0b8", "#ffffff", "#ffa870", "#9d4320"),
    silver: coinPaint("#c8dcff", "#f4f9ff", "#7a86d6", "#dfeaff", "#ffffff", "#8f9be0", "#ffffff", "#ffffff", "#c8d4ff", "#586098"),
  };
  type Tone = keyof typeof COIN_PAINT;
  const coinBatches: Record<Tone, THREE.BufferGeometry[]> = { gold: [], rose: [], silver: [] };
  const pickTone = (): Tone => {
    const r = R();
    return r < 0.68 ? "gold" : r < 0.86 ? "rose" : "silver";
  };
  function addCoin(tone: Tone, pos: THREE.Vector3, up: THREE.Vector3, tilt: number, size = 1) {
    const q = aim(up);
    const a = R() * Math.PI * 2;
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), tilt));
    q.multiply(new THREE.Quaternion().setFromAxisAngle(Y, R() * Math.PI * 2));
    const m = new THREE.Matrix4().compose(pos, q, new THREE.Vector3(size, 1, size));
    coinBatches[tone].push(coinBase.clone().applyMatrix4(m));
  }

  const COUNTS = [150, 62, 56, 92, 34, 40, 84, 26, 26];
  COUNTS.forEach((count, i) => {
    for (let k = 0; k < count; k++) {
      const s = sampleLump(i);
      if (!s) continue;
      addCoin(pickTone(), s.pos.clone().addScaledVector(s.n, 0.002), s.n, rr(0.1, 1.05), rr(0.9, 1.15));
    }
  });

  // Loose geometry buckets for objects placed later
  const occupied: Array<[number, number, number]> = [
    [-0.8, -0.52, 0.28],
    [0.95, -0.78, 0.32],
    [-0.95, -0.78, 0.32],
    [1.0, 0.62, 0.17],
    [-1.0, 0.62, 0.17],
    [-0.8, 0.12, 0.2],
    [0.86, 0.58, 0.18],
    [-0.72, 0.58, 0.14],
    [0.12, 0.84, 0.36],
    [0.8, -0.5, 0.16],
    [0.62, -0.38, 0.12],
    [0.4, 0.72, 0.1],
  ];
  const isFree = (x: number, z: number, margin: number) =>
    heapH(x, z) < D + 0.001 && !inChest(x, D + 0.01, z) && Math.abs(x) > 0 && occupied.every(([ox, oz, r]) => Math.hypot(x - ox, z - oz) > r + margin) && !(Math.abs(x) < 0.52 && z < CZ + 0.34 && z > CZ - 0.34);

  // Coins resting on the dais floor
  for (let k = 0; k < 40; k++) {
    for (let tries = 0; tries < 30; tries++) {
      const a = R() * Math.PI * 2;
      const r = rr(0.35, 1.08);
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (!isFree(x, z, 0.05)) continue;
      addCoin(pickTone(), new THREE.Vector3(x, D + COIN_T / 2 + 0.001, z), Y, rr(0, 0.12), rr(0.95, 1.12));
      break;
    }
  }

  // Coin stacks beside the chest
  const stack = (x: number, z: number, n: number, tone: Tone, lean = 0) => {
    for (let i = 0; i < n; i++) {
      const w = lean * i;
      addCoin(tone, new THREE.Vector3(x + w * 0.4 + rr(-0.004, 0.004), D + COIN_T / 2 + i * (COIN_T + 0.0005), z + rr(-0.004, 0.004)), Y, rr(0, 0.05));
    }
  };
  stack(0.8, -0.5, 14, "gold", 0.002);
  stack(0.9, -0.36, 8, "gold");
  stack(0.65, -0.4, 6, "silver");
  stack(0.97, -0.55, 4, "rose");
  stack(-0.62, -0.2, 9, "gold", -0.002);
  // A coin rolling away on its edge
  addCoin("gold", new THREE.Vector3(0.4, D + COIN_R * 0.99, 0.72), new THREE.Vector3(0.3, 0.05, 1).normalize(), 0, 1);
  // a toppled stack fanning out at the front
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    addCoin("silver", new THREE.Vector3(-0.35 + t * 0.3, D + 0.012 + i * 0.003, 0.7 + Math.sin(i) * 0.03), new THREE.Vector3(0.08, 1, 0.4 - t * 0.2).normalize(), 0.18 + i * 0.05);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Dais: flagstone slab, gold inlay, glowing rune ring.

  b.lathe(
    [
      [0, 0],
      [1.27, 0],
      [1.33, 0.035],
      [1.28, D],
      [0, D],
    ],
    { at: [0, 0, 0], bone: root, segments: 14, color: daisPaint, name: "dais" },
  );

  // Flush the merged coin batches (one part per tone).
  (Object.keys(coinBatches) as Tone[]).forEach((tone) => {
    if (coinBatches[tone].length) part(merge(coinBatches[tone]), COIN_PAINT[tone], { at: [0, 0, 0], name: `coins_${tone}` });
  });

  return b.root;
}

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { aim, DEG, rng } from "../src/math";
import { catmull } from "../src/path";
import { cells, mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Dragon's Treasure Hoard",
  description:
    "A glowing hextech-style treasure hoard on a rune-lit stone dais: an open arcane chest overflowing with coins, a spiked crown, three goblets, gems, ingots, a loot sack, crystal clusters and floating sparks.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// palette

const F = 0.07; // top of the stone dais

const GOLD = "#f4b32a";
const GOLD_HI = "#fff1a8";
const GOLD_LO = "#a24a10";
const GOLD_FLAT = "#ffcf3f";
const GOLD_FLAT2 = "#ffe27a";
const GOLD_FLAT3 = "#e9962a";
const SILVER_FLAT = "#cfd8f2";
const DARK = "#2a1450";
const INK = "#1b0d38";
const ROPE = "#e8d3a0";

const CYAN = "#35f2ea";
const CYAN_HI = "#c4fffa";
const CYAN_DK = "#139bb0";
const TEAL_MID = "#1bc4cf";
const MAGENTA = "#ff3fb0";
const MAGENTA_HI = "#ffa3de";
const MAGENTA_DK = "#a8147a";
const RUBY = "#ff2f4f";
const SAPPHIRE = "#2f6bff";
const EMERALD = "#1fd67b";
const AMBER = "#ffa21f";
const VIOLET = "#9a5cff";
const GEM_COLORS = [RUBY, SAPPHIRE, EMERALD, AMBER, CYAN, VIOLET, MAGENTA, RUBY, EMERALD];

const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const UP = new THREE.Vector3(0, 1, 0);

// ---------------------------------------------------------------------------------------------------------------
// painting helpers

const ramp = (lo: string, mid: string, hi: string, t: number): Rgb =>
  t < 0.5 ? mix(lo, mid, t * 2) : mix(mid, hi, (t - 0.5) * 2);
const tone = (n: THREE.Vector3) => smoothstep(0.1, 0.95, n.dot(KEY) * 0.5 + 0.5);
const hash = (k: number) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const goldPaint = paint((p, n) => {
  const c = ramp(GOLD_LO, GOLD, GOLD_HI, tone(n));
  const w = noise(p, 0.05, 3);
  return mix(c, "#7a3410", smoothstep(0.62, 0.95, w) * 0.3);
});

/** gold with engraved grooves at the given heights (lathe coordinates) */
const goldGrooved = (rings: number[]) =>
  paint((p, n, s) => {
    const c = ramp(GOLD_LO, GOLD, GOLD_HI, tone(n));
    let g = 0;
    for (const r of rings) g = Math.max(g, 1 - smoothstep(0.0, 0.006, Math.abs(s[0] - r)));
    const w = noise(p, 0.05, 5);
    return mix(mix(c, "#7a3410", smoothstep(0.65, 0.95, w) * 0.25), "#6a2c0a", g * 0.75);
  });

const silverPaint = (rings: number[]) =>
  paint((p, n, s) => {
    const c = ramp("#4f5aa0", SILVER_FLAT, "#ffffff", tone(n));
    let g = 0;
    for (const r of rings) g = Math.max(g, 1 - smoothstep(0.0, 0.005, Math.abs(s[0] - r)));
    const w = noise(p, 0.06, 9);
    return mix(mix(c, "#6872b8", smoothstep(0.6, 0.95, w) * 0.3), "#3a4380", g * 0.7);
  });

const coinHeapPaint = paint((p, n) => {
  const c = cells(p, 0.07, 5);
  const e = smoothstep(0.02, 0.2, c.d2 - c.d1);
  const base = c.id > 0.66 ? GOLD_FLAT2 : c.id > 0.33 ? GOLD : GOLD_FLAT3;
  const lit = ramp(GOLD_LO, base, GOLD_HI, tone(n) * 0.9 + (1 - c.d1) * 0.12);
  const dark = mix(lit, "#5a2410", 0.7);
  const low = 1 - smoothstep(F, F + 0.1, p.y);
  return mix(mix(dark, lit, e), "#4a1c14", low * 0.45);
});

const velvet = (p: THREE.Vector3, n: THREE.Vector3): Rgb => ramp("#4b0a2e", "#b0153f", "#e04a6a", tone(n) * 0.8 + noise(p, 0.03, 2) * 0.2);

const burlap = paint((p, n, s) => {
  const wx = Math.floor(s[0] / 0.014);
  const wy = Math.floor((s[1] * 0.0035) / 0.014);
  const weave = (wx + wy) % 2 === 0 ? 0.0 : 0.12;
  const c = ramp("#6c4624", "#c49a5c", "#f0d79a", tone(n) * 0.85 + weave);
  return mix(c, "#5a3a1a", smoothstep(0.7, 0.95, noise(p, 0.07, 4)) * 0.4);
});

const stonePaint = paint((p, n, s) => {
  const c = cells(new THREE.Vector3(s[0], 0, s[1]), 0.5, 8);
  const edge = 1 - smoothstep(0.02, 0.1, c.d2 - c.d1);
  const top = n.y > 0.5;
  const base = ramp("#2c2450", c.id > 0.5 ? "#4a3f7a" : "#413870", "#6a5fa0", smoothstep(0.0, 1.0, noise(p, 0.18, 6)) * 0.7 + (top ? 0.2 : 0.0));
  const chips = smoothstep(0.7, 0.95, noise(p, 0.05, 7)) * 0.25;
  let col = mix(base, "#1a1236", edge * 0.85 + chips);
  // magical rim: teal glints near the edge
  const r = Math.hypot(p.x, p.z);
  col = mix(col, "#2a7a9a", smoothstep(0.88, 0.99, r) * 0.25 * (top ? 1 : 0.4));
  return col;
});

const rockPaint = paint((p, n) => ramp("#241c44", "#43396f", "#7a70b0", tone(n) * 0.8 + noise(p, 0.05, 11) * 0.2));

// ---------------------------------------------------------------------------------------------------------------
// small geometry helpers

class Fr {
  readonly q: THREE.Quaternion;
  constructor(
    readonly o: THREE.Vector3,
    yaw = 0,
    pitch = 0,
    roll = 0,
    q?: THREE.Quaternion,
  ) {
    this.q = q ?? new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch * DEG, yaw * DEG, roll * DEG, "YXZ"));
  }
  p(v: readonly number[]) {
    return V(v[0], v[1], v[2]).applyQuaternion(this.q).add(this.o);
  }
  d(v: readonly number[]) {
    return V(v[0], v[1], v[2]).applyQuaternion(this.q);
  }
  m(pos: readonly number[], rot: readonly number[] = [0, 0, 0], scale: readonly number[] = [1, 1, 1]) {
    const q = this.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    return new THREE.Matrix4().compose(this.p(pos), q, V(scale[0], scale[1], scale[2]));
  }
}

function coinGeo(r = 0.036, t = 0.008) {
  const g = new THREE.CylinderGeometry(r, r, t, 8, 1);
  const n = g.attributes.normal;
  const uv = g.attributes.uv;
  for (let i = 0; i < n.count; i++) if (Math.abs(n.getY(i)) < 0.5) uv.setXY(i, 0.03, 0.03);
  return g;
}

function gemCrown(r: number, h: number) {
  return new THREE.CylinderGeometry(r * 0.6, r, h * 0.32, 8).translate(0, h * 0.16, 0);
}
function gemPavilion(r: number, h: number) {
  return new THREE.ConeGeometry(r, h * 0.68, 8).rotateX(Math.PI).translate(0, -h * 0.34, 0);
}
function gemGeo(r: number, h: number) {
  return mergeGeometries([gemCrown(r, h), gemPavilion(r, h)])!;
}
function crystalGeo(r: number, len: number) {
  const body = new THREE.CylinderGeometry(r * 0.92, r, len, 6).translate(0, len / 2, 0);
  return body;
}
function crystalTip(r: number, tip: number, len: number) {
  return new THREE.ConeGeometry(r * 0.92, tip, 6).translate(0, len + tip / 2, 0);
}

// ---------------------------------------------------------------------------------------------------------------
// textures

const COIN_TEX = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#ececec"/>
  <rect x="0" y="112" width="16" height="16" fill="#b4b4b4"/>
  <circle cx="64" cy="64" r="60" fill="none" stroke="#c9c9c9" stroke-width="7"/>
  <circle cx="64" cy="64" r="54" fill="none" stroke="#c0c0c0" stroke-width="3" stroke-dasharray="4 5"/>
  <circle cx="64" cy="64" r="44" fill="#f6f6f6" stroke="#bcbcbc" stroke-width="4"/>
  <polygon points="64,26 72,52 99,52 77,68 86,94 64,78 42,94 51,68 29,52 56,52" fill="#c2c2c2" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="64" cy="64" r="7" fill="#ececec" stroke="#b0b0b0" stroke-width="2"/>
  </svg>`,
  { size: 128 },
);

const RUNE_TEX = svg(
  `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="100" cy="100" r="97" stroke="#35f2ea" stroke-width="2.4"/>
  <circle cx="100" cy="100" r="92" stroke="#35f2ea" stroke-width="1.4" stroke-dasharray="3 3.2"/>
  <circle cx="100" cy="100" r="78" stroke="#35f2ea" stroke-width="2.4"/>
  <circle cx="100" cy="100" r="74" stroke="#c4fffa" stroke-width="1.2"/>
  <circle cx="100" cy="100" r="56" stroke="#35f2ea" stroke-width="1.6" stroke-dasharray="10 4"/>
  ${Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r1 = 79;
    const r2 = i % 2 ? 87 : 91;
    return `<line x1="${100 + Math.cos(a) * r1}" y1="${100 + Math.sin(a) * r1}" x2="${100 + Math.cos(a) * r2}" y2="${100 + Math.sin(a) * r2}" stroke="#35f2ea" stroke-width="2"/>`;
  }).join("")}
  ${Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const cx = 100 + Math.cos(a) * 85;
    const cy = 100 + Math.sin(a) * 85;
    const s = 4.4;
    return `<polygon points="${cx + Math.cos(a) * s * 1.6},${cy + Math.sin(a) * s * 1.6} ${cx + Math.cos(a + 2.4) * s},${cy + Math.sin(a + 2.4) * s} ${cx + Math.cos(a - 2.4) * s},${cy + Math.sin(a - 2.4) * s}" fill="#c4fffa" stroke="#35f2ea" stroke-width="1.2"/>`;
  }).join("")}
  ${Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const a2 = a + Math.PI * 0.66;
    return `<line x1="${100 + Math.cos(a) * 56}" y1="${100 + Math.sin(a) * 56}" x2="${100 + Math.cos(a2) * 56}" y2="${100 + Math.sin(a2) * 56}" stroke="#35f2ea" stroke-width="1.6"/>`;
  }).join("")}
  ${Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const cx = 100 + Math.cos(a) * 66;
    const cy = 100 + Math.sin(a) * 66;
    return `<path d="M${cx - 3.2} ${cy - 3.2} L${cx + 3.2} ${cy} L${cx - 1} ${cy + 1} L${cx + 2.4} ${cy + 3.6}" stroke="#c4fffa" stroke-width="1.6"/>`;
  }).join("")}
  </svg>`,
  { size: 1024 },
);

const WISP_TEX = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 126 C6 98 46 80 24 46 C20 34 34 18 38 2 C48 26 62 44 50 72 C44 90 58 106 32 126Z" fill="#35f2ea"/>
  <path d="M32 112 C16 94 40 82 30 58 C28 50 36 40 38 28 C44 46 50 58 44 76 C40 90 48 98 32 112Z" fill="#9ffaf2"/>
  <path d="M33 98 C26 88 38 80 34 66 C38 70 42 78 40 86 C38 92 40 94 33 98Z" fill="#e8fffd"/>
  </svg>`,
  { size: 256 },
);
const SPARK_CYAN = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 0 C34 22 42 30 64 32 C42 34 34 42 32 64 C30 42 22 34 0 32 C22 30 30 22 32 0Z" fill="#7ffaf0"/><path d="M32 14 C33 26 38 30 50 32 C38 34 33 38 32 50 C31 38 26 34 14 32 C26 30 31 26 32 14Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SPARK_GOLD = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 0 C34 22 42 30 64 32 C42 34 34 42 32 64 C30 42 22 34 0 32 C22 30 30 22 32 0Z" fill="#ffd34a"/><path d="M32 14 C33 26 38 30 50 32 C38 34 33 38 32 50 C31 38 26 34 14 32 C26 30 31 26 32 14Z" fill="#fff6c8"/></svg>`,
  { size: 128 },
);
const SPARK_PINK = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 0 C34 22 42 30 64 32 C42 34 34 42 32 64 C30 42 22 34 0 32 C22 30 30 22 32 0Z" fill="#ff5fc0"/><path d="M32 14 C33 26 38 30 50 32 C38 34 33 38 32 50 C31 38 26 34 14 32 C26 30 31 26 32 14Z" fill="#ffe0f4"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  type Joint = ReturnType<typeof b.joint>;
  const R = rng(7771);
  const root = b.joint("hoard", { at: [0, 0, 0] });

  // merge accumulator: many small static pieces become one part per bone / colour / flatness / texture
  type Acc = { geos: THREE.BufferGeometry[]; color: string; bone: Joint; flat: boolean; texture?: ReturnType<typeof svg> };
  const accs = new Map<string, Acc>();
  function add(
    geo: THREE.BufferGeometry,
    color: string,
    m: THREE.Matrix4,
    opts: { bone?: Joint; flat?: boolean; texture?: ReturnType<typeof svg>; tag?: string } = {},
  ) {
    const bone = opts.bone ?? root;
    const flat = opts.flat ?? true;
    const key = `${bone.name}|${color}|${flat}|${opts.tag ?? ""}`;
    let a = accs.get(key);
    if (!a) {
      a = { geos: [], color, bone, flat, texture: opts.texture };
      accs.set(key, a);
    }
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(m);
    a.geos.push(g);
  }
  function flush() {
    for (const a of accs.values()) {
      const merged = mergeGeometries(a.geos);
      if (!merged) continue;
      b.part(merged, a.color, { bone: a.bone, at: [0, 0, 0], flat: a.flat, texture: a.texture });
    }
  }

  /** a box placed in a local frame */
  const box = (
    fr: Fr,
    size: readonly [number, number, number],
    color: string | ReturnType<typeof paint>,
    pos: readonly number[],
    rot: readonly number[] = [0, 0, 0],
    bone: Joint = root,
    name?: string,
  ) => {
    const m = fr.m(pos, rot);
    const q = new THREE.Quaternion();
    const at = new THREE.Vector3();
    m.decompose(at, q, new THREE.Vector3());
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, quat: q, bone, name });
  };

  const gemSolo = (at: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, color: string, spin = 0) => {
    const q = aim(dir);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, spin));
    return b.part(gemGeo(r, h), color, { at, quat: q, bone: root, flat: true });
  };

  const featGem = (at: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, light: string, dark: string, strength = 1) => {
    const q = aim(dir);
    const crown = glow(b.part(gemCrown(r, h), light, { at, quat: q, bone: root, flat: true }), strength);
    const pav = glow(b.part(gemPavilion(r, h), dark, { at, quat: q, bone: root, flat: true }), strength);
    return [crown, pav];
  };

  // =============================================================================================================
  // DAIS
  // =============================================================================================================
  const dais: OutlinePoint[] = [];
  const NB = 14;
  for (let i = 0; i < NB; i++) {
    const a = (i / NB) * Math.PI * 2 + 0.2;
    const r = 1.02 + (hash(i * 3.3) - 0.5) * 0.1;
    dais.push([Math.cos(a) * r, -Math.sin(a) * r]);
  }
  b.extrude(dais, {
    at: [0, F / 2, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: F,
    bevel: 0.022,
    color: stonePaint,
    bone: root,
    name: "dais",
  });
  // a second, smaller broken slab layered on the back for height and silhouette
  const slab2: OutlinePoint[] = [
    [-0.55, -0.62],
    [-0.1, -0.78],
    [0.5, -0.74],
    [0.82, -0.5],
    [0.74, -0.2],
    [0.2, -0.08],
    [-0.5, -0.12],
    [-0.82, -0.3],
  ];
  b.extrude(slab2, {
    at: [0, F + 0.015, 0],
    x: [1, 0, 0],
    y: [0, 0, -1],
    thickness: 0.03,
    bevel: 0.012,
    color: stonePaint,
    bone: root,
    name: "slab2",
  });
  // rubble blocks around the rim
  const rocks: [number, number, number, number, number, number][] = [
    [-0.8, -0.62, 0.11, 0.08, 0.09, 20],
    [0.92, -0.34, 0.1, 0.09, 0.1, 50],
    [-0.97, 0.18, 0.09, 0.07, 0.1, 70],
    [0.62, -0.8, 0.12, 0.1, 0.1, 10],
    [-0.3, -0.92, 0.1, 0.07, 0.1, 35],
    [0.88, 0.5, 0.08, 0.06, 0.08, 80],
    [-0.76, 0.74, 0.09, 0.07, 0.08, 15],
    [0.12, 0.98, 0.08, 0.05, 0.07, 60],
  ];
  for (const [x, z, sx, sy, sz, yaw] of rocks) {
    b.part(new THREE.IcosahedronGeometry(1, 0), rockPaint, {
      at: [x, F + sy * 0.4, z],
      scale: [sx, sy, sz],
      rotation: [R() * 30, yaw, R() * 25],
      bone: root,
      flat: true,
      name: "rubble",
    });
  }

  // glowing rune circle
  glow(
    b.part(new THREE.PlaneGeometry(1.82, 1.82), "#ffffff", {
      at: [0, F + 0.004, 0.02],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: RUNE_TEX,
      bone: root,
      name: "runeCircle",
    }),
    1,
  );

  // =============================================================================================================
  // CHEST
  // =============================================================================================================
  const C = new Fr(V(0.02, F, -0.34), -7);
  const W = 0.84;
  const D = 0.46;
  const BY0 = 0.06;
  const BY1 = 0.38;
  const lat = C.d([1, 0, 0]);
  const fwd = C.d([0, 0, 1]);

  const woodGrain = (a: number, k: number, along: number, p: THREE.Vector3) => {
    const v = hash(k);
    const base = ramp("#2a1860", v > 0.5 ? "#4a2fa8" : "#412a96", "#7a5ee6", 0.45 + a * 0.5 + (v - 0.5) * 0.16);
    const g = noise(new THREE.Vector3(along * 3.2, p.y * 28, 0), 0.35, k);
    return mix(base, "#1c0e48", smoothstep(0.55, 0.9, g) * 0.35);
  };
  const woodBody = paint((p, n) => {
    const r = p.clone().sub(C.o);
    const x = r.dot(lat);
    const z = r.dot(fwd);
    if (n.y > 0.7) return velvet(p, n);
    const nz = Math.abs(n.dot(fwd));
    const t = tone(n);
    const coord = nz > 0.6 ? x + 0.42 : z + 0.23;
    const pw = nz > 0.6 ? 0.12 : 0.115;
    const k = Math.floor(coord / pw);
    const f = coord / pw - k;
    const line = 1 - smoothstep(0.0, 0.07, Math.min(f, 1 - f));
    const c = woodGrain(t * 0.9, k + (nz > 0.6 ? 0 : 40), nz > 0.6 ? z : x, p);
    const ao = 1 - smoothstep(BY0, BY0 + 0.1, p.y);
    return mix(mix(c, "#150a38", line * 0.75), "#12082e", ao * 0.4);
  });

  const body = b.extrude(
    [
      [-W / 2, BY0],
      [W / 2, BY0],
      [W / 2, BY1],
      [-W / 2, BY1],
    ],
    { at: C.p([0, 0, 0]), x: lat, y: [0, 1, 0], thickness: D, bevel: 0.018, color: woodBody, bone: root, name: "chestBody" },
  );
  void body;

  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(C, [0.11, 0.07, 0.11], goldPaint, [sx * 0.375, 0.035, sz * 0.18], [0, 0, 0], root, "chestFoot");
      box(C, [0.07, 0.03, 0.07], "#7a3410", [sx * 0.375, 0.012, sz * 0.18], [0, 0, 0], root, "chestFootShadow");
    }
  // bottom band, top rim frame
  box(C, [W + 0.03, 0.05, D + 0.03], goldPaint, [0, 0.085, 0], [0, 0, 0], root, "bandBottom");
  box(C, [W + 0.04, 0.05, 0.045], goldPaint, [0, BY1 - 0.022, D / 2 + 0.002], [0, 0, 0], root, "rimFront");
  box(C, [W + 0.04, 0.05, 0.045], goldPaint, [0, BY1 - 0.022, -D / 2 - 0.002], [0, 0, 0], root, "rimBack");
  for (const sx of [1, -1]) box(C, [0.045, 0.05, D + 0.03], goldPaint, [sx * (W / 2 + 0.002), BY1 - 0.022, 0], [0, 0, 0], root, "rimSide");
  // vertical straps front and back
  for (const sx of [1, -1]) {
    box(C, [0.075, BY1 - 0.1, D + 0.03], goldPaint, [sx * 0.29, (BY1 + 0.1) / 2 - 0.005, 0], [0, 0, 0], root, "strap");
    box(C, [0.075 - 0.02, BY1 - 0.12, D + 0.045], "#7a3410", [sx * 0.29, (BY1 + 0.1) / 2 - 0.005, 0], [0, 0, 0], root, "strapInset");
    box(C, [0.04, BY1 - 0.12, D + 0.05], goldPaint, [sx * 0.29, (BY1 + 0.1) / 2 - 0.005, 0], [0, 0, 0], root, "strapCore");
  }
  // rivets on straps / bands
  for (const sz of [1, -1]) {
    for (const sx of [1, -1]) {
      for (let i = 0; i < 5; i++) {
        const y = 0.12 + i * 0.06;
        for (const dx of [-0.026, 0.026]) add(new THREE.SphereGeometry(0.0095, 6, 4), GOLD_FLAT2, C.m([sx * 0.29 + dx, y, sz * (D / 2 + 0.03)]), { flat: false });
      }
    }
    for (let i = 0; i < 9; i++) {
      const x = -0.36 + i * 0.09;
      add(new THREE.SphereGeometry(0.0095, 6, 4), GOLD_FLAT2, C.m([x, BY1 - 0.022, sz * (D / 2 + 0.026)]), { flat: false });
      add(new THREE.SphereGeometry(0.0095, 6, 4), GOLD_FLAT2, C.m([x, 0.085, sz * (D / 2 + 0.022)]), { flat: false });
    }
  }
  // side handles: ring on a mount plate
  for (const sx of [1, -1]) {
    box(C, [0.02, 0.09, 0.12], goldPaint, [sx * (W / 2 + 0.01), 0.23, 0], [0, 0, 0], root, "handleMount");
    add(new THREE.TorusGeometry(0.05, 0.011, 5, 12), GOLD_FLAT, C.m([sx * (W / 2 + 0.03), 0.205, 0], [0, 90, 0]), { flat: false });
    add(new THREE.SphereGeometry(0.016, 6, 4), GOLD_FLAT2, C.m([sx * (W / 2 + 0.024), 0.255, 0]), { flat: false });
  }
  // lock crest on the front
  const crest: OutlinePoint[] = [
    [-0.075, 0.22],
    [0.075, 0.22],
    [0.085, 0.15],
    [0.06, 0.09],
    [0, 0.04, "sharp"],
    [-0.06, 0.09],
    [-0.085, 0.15],
  ];
  b.extrude(crest, {
    at: C.p([0, 0, D / 2 + 0.03]),
    x: lat,
    y: [0, 1, 0],
    thickness: 0.02,
    bevel: 0.006,
    smoothing: 1,
    color: goldPaint,
    bone: root,
    name: "lockCrest",
  });
  box(C, [0.1, 0.1, 0.012], "#2a1450", [0, 0.15, D / 2 + 0.044], [0, 0, 0], root, "lockInset");
  glow(b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.006, 8), CYAN, { at: C.p([0, 0.168, D / 2 + 0.052]), quat: C.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))), bone: root, name: "keyholeRound" }), 1);
  glow(box(C, [0.016, 0.05, 0.006], CYAN, [0, 0.132, D / 2 + 0.052], [0, 0, 0], root, "keyholeSlot"), 1);
  featGem(C.p([0, 0.245, D / 2 + 0.05]), C.d([0, 0.6, 1]), 0.03, 0.04, MAGENTA_HI, MAGENTA, 1);
  for (const sx of [1, -1]) {
    add(new THREE.SphereGeometry(0.009, 6, 4), GOLD_FLAT2, C.m([sx * 0.06, 0.19, D / 2 + 0.045]), { flat: false });
    add(new THREE.SphereGeometry(0.009, 6, 4), GOLD_FLAT2, C.m([sx * 0.07, 0.13, D / 2 + 0.045]), { flat: false });
  }

  // ---- lid (open, on a hinge) ---------------------------------------------------------------------------------
  const ALPHA = 112;
  const hingeW = C.p([0, BY1, -D / 2]);
  const lid = b.joint("lid", { parent: root, at: hingeW, dir: lat, role: "hinge" });
  const ca = Math.cos(ALPHA * DEG);
  const sa = Math.sin(ALPHA * DEG);
  const a0 = D / 2;
  const AOUT = D / 2 + 0.015;
  const COUT = 0.17;
  const AIN = AOUT - 0.04;
  const CIN = COUT - 0.04;
  const rot = (u: number, v: number): [number, number] => [u * ca - v * sa, u * sa + v * ca];
  const archOutline = (aOut: number, cOut: number, aIn: number, cIn: number): OutlinePoint[] => {
    const pts: OutlinePoint[] = [];
    const N = 9;
    for (let i = 0; i <= N; i++) {
      const th = Math.PI * (1 - i / N);
      pts.push(rot(a0 + aOut * Math.cos(th), cOut * Math.sin(th)));
    }
    for (let i = 0; i <= N; i++) {
      const th = Math.PI * (i / N);
      pts.push(rot(a0 + aIn * Math.cos(th), cIn * Math.sin(th)));
    }
    return pts;
  };
  const archCx = rot(a0, 0)[0];
  const archCy = rot(a0, 0)[1];
  const lidPaint = paint((p, n) => {
    const r = p.clone().sub(hingeW);
    const z = r.dot(fwd);
    const y = r.y;
    const x = r.dot(lat);
    const nz = n.dot(fwd);
    const nx = n.dot(lat);
    const dz = z - archCx;
    const dy = y - archCy;
    const angRaw = (Math.atan2(dy, dz) / DEG - (ALPHA - 180)) ; // 0 at the lid's front lip, 180 at its back
    if (Math.abs(nx) > 0.6) {
      const rr = Math.hypot(dz, dy);
      const k = Math.floor(rr / 0.02);
      return mix(ramp("#241450", "#3c2690", "#6a4ed0", tone(n)), "#150a38", (k % 2) * 0.25 + (1 - smoothstep(0.0, 0.006, Math.abs(((rr / 0.02) % 1) - 0.5) * 0.02)) * 0.0);
    }
    const outside = n.y * dy + nz * dz > 0;
    if (!outside) {
      const u = x;
      const w = ((angRaw * Math.PI) / 180) * 0.2;
      const d1 = Math.abs(((u + w) / 0.1) % 1 - 0.5);
      const d2 = Math.abs(((u - w) / 0.1) % 1 - 0.5);
      const line = 1 - smoothstep(0.0, 0.05, Math.min(d1, d2) * 0.5 + 0.0 - 0.0) * 1;
      const base = velvet(p, n);
      const seam = smoothstep(0.42, 0.5, Math.max(d1, d2) * 1.0) * 0 + (Math.min(d1, d2) > 0.46 ? 1 : 0);
      return mix(mix(base, "#3a0624", seam * 0.55), "#ff7a9a", line * 0.0);
    }
    const k = Math.floor(angRaw / 16);
    const f = angRaw / 16 - k;
    const line = 1 - smoothstep(0.0, 0.06, Math.min(f, 1 - f));
    const c = woodGrain(tone(n) * 0.9, k + 20, x, p);
    return mix(c, "#150a38", line * 0.75);
  });
  b.extrude(archOutline(AOUT, COUT, AIN, CIN), {
    at: hingeW,
    x: fwd,
    y: [0, 1, 0],
    thickness: W + 0.04,
    bevel: 0.008,
    color: lidPaint,
    bone: lid,
    name: "lidShell",
  });
  // gold arch ribs (straps over the lid and bands at the ends)
  for (const [x, th] of [
    [0.27, 0.075],
    [-0.27, 0.075],
    [0.44, 0.04],
    [-0.44, 0.04],
  ] as const) {
    b.extrude(archOutline(AOUT + 0.014, COUT + 0.014, AIN - 0.012, CIN - 0.012), {
      at: V(hingeW.x, hingeW.y, hingeW.z).addScaledVector(lat, x),
      x: fwd,
      y: [0, 1, 0],
      thickness: th,
      bevel: 0.006,
      color: goldPaint,
      bone: lid,
      name: "lidRib",
    });
    for (let i = 1; i <= 8; i++) {
      const t = (i / 9) * Math.PI;
      const [u, v] = rot(a0 + (AOUT + 0.016) * Math.cos(t), (COUT + 0.016) * Math.sin(t));
      for (const dx of x > 0.4 || x < -0.4 ? [0] : [-0.026, 0.026]) {
        const pt = hingeW.clone().addScaledVector(fwd, u).add(V(0, v, 0)).addScaledVector(lat, x + dx);
        add(new THREE.SphereGeometry(0.0095, 6, 4), GOLD_FLAT2, new THREE.Matrix4().makeTranslation(pt.x, pt.y, pt.z), { bone: lid, flat: false });
      }
    }
  }
  // hinge knuckles
  for (const x of [-0.3, -0.1, 0.1, 0.3]) {
    const pt = hingeW.clone().addScaledVector(lat, x).add(V(0, 0.002, -0.01).applyQuaternion(C.q).sub(V(0, 0, 0)));
    add(
      new THREE.CylinderGeometry(0.026, 0.026, 0.14, 8),
      GOLD_FLAT,
      new THREE.Matrix4().compose(pt, C.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2))), V(1, 1, 1)),
      { bone: lid, flat: true },
    );
  }
  // clasp tab on the lid's front lip, with a glowing stone
  const tabPts: [number, number][] = [
    [a0 + AOUT - 0.05, -0.002],
    [a0 + AOUT + 0.005, -0.002],
    [a0 + AOUT + 0.012, -0.05],
    [a0 + AOUT - 0.02, -0.085],
    [a0 + AOUT - 0.055, -0.05],
  ];
  b.extrude(
    tabPts.map(([u, v]) => rot(u, v) as OutlinePoint),
    { at: hingeW, x: fwd, y: [0, 1, 0], thickness: 0.07, bevel: 0.008, smoothing: 1, color: goldPaint, bone: lid, name: "lidTab" },
  );
  {
    const [u, v] = rot(a0 + AOUT - 0.022, -0.04);
    const pt = hingeW.clone().addScaledVector(fwd, u).add(V(0, v, 0));
    const out = fwd.clone().multiplyScalar(ca * 0 + 1).applyAxisAngle(lat, 0);
    // face direction: lid front lip faces +fwd rotated by the lid angle about the hinge axis
    const faceDir = V(0, 0, 0).addScaledVector(fwd, -sa).add(V(0, ca * 0 + ca, 0)).normalize();
    void out;
    featGem(pt.addScaledVector(faceDir, 0.0), faceDir.clone().multiplyScalar(-1), 0.024, 0.03, CYAN_HI, TEAL_MID, 1);
  }

  // =============================================================================================================
  // COIN HEAPS (lumps), then coins and gems scattered over them
  // =============================================================================================================
  const lumps: { at: [number, number, number]; r: [number, number, number] }[] = [
    { at: [0.05, F + 0.0, 0.14], r: [0.62, 0.2, 0.38] },
    { at: [-0.34, F + 0.0, 0.26], r: [0.3, 0.13, 0.26] },
    { at: [0.42, F + 0.0, 0.3], r: [0.3, 0.14, 0.24] },
    { at: [0.0, F + 0.1, -0.06], r: [0.42, 0.2, 0.26] },
    { at: [-0.02, F + 0.37, -0.33], r: [0.36, 0.13, 0.19] }, // inside the chest
    { at: [-0.68, F + 0.0, 0.12], r: [0.2, 0.07, 0.2] },
    { at: [0.74, F + 0.0, 0.5], r: [0.2, 0.06, 0.16] }, // spill from the toppled goblet
    { at: [-0.5, F + 0.19, 0.6], r: [0.12, 0.07, 0.12] }, // sack mouth
  ];
  const lumpParts = lumps.map((l) =>
    b.part(new THREE.SphereGeometry(1, 10, 6), coinHeapPaint, { at: l.at, scale: l.r, bone: root, flat: true, name: "coinHeap" }),
  );
  const heapSurf = b.surface(lumpParts);

  const coinTextures = new Map<string, ReturnType<typeof svg>>();
  const coinColors = [GOLD_FLAT, GOLD_FLAT, GOLD_FLAT2, GOLD_FLAT3, SILVER_FLAT];
  const cg = coinGeo();
  const placeCoin = (pos: THREE.Vector3, dir: THREE.Vector3, spin: number, scale: number, color: string) => {
    const q = aim(dir);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(UP, spin));
    add(cg, color, new THREE.Matrix4().compose(pos, q, V(scale, scale, scale)), { flat: true, texture: COIN_TEX, tag: "coin" });
    coinTextures.set(color, COIN_TEX);
  };
  const scatterCoins = (surf: ReturnType<typeof b.surface>, count: number, minDist: number, minY: number) => {
    const hits = surf.scatter(count, { rng: rng(count + 13), minDist, filter: (h) => h.n.y > 0.2 && h.at.y > minY });
    for (const h of hits) {
      const standing = R() < 0.14;
      const d = h.n.clone();
      if (standing) {
        d.add(V(R() - 0.5, 0, R() - 0.5).multiplyScalar(2.6)).normalize();
        d.y = Math.max(d.y * 0.2, 0.08);
        d.normalize();
      } else {
        d.lerp(UP, 0.3).add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.55)).normalize();
      }
      const col = coinColors[Math.floor(R() * coinColors.length)];
      const pos = h.at.clone().addScaledVector(h.n, standing ? -0.012 : -0.003);
      placeCoin(pos, d, R() * 6.28, 0.9 + R() * 0.3, col);
    }
  };
  scatterCoins(heapSurf, 780, 0.05, F + 0.015);

  // floor coins around the dais
  const occupied: [number, number, number][] = [
    [0.02, -0.34, 0.55],
    [0.05, 0.16, 0.7],
    [-0.66, -0.5, 0.2],
    [0.66, -0.52, 0.2],
    [-0.5, 0.58, 0.28],
    [0.76, -0.14, 0.2],
    [0.42, 0.6, 0.2],
    [0.76, 0.46, 0.22],
    [-0.7, 0.14, 0.22],
  ];
  let tries = 0;
  let placed = 0;
  while (placed < 46 && tries < 600) {
    tries++;
    const a = R() * Math.PI * 2;
    const rr = 0.35 + R() * 0.62;
    const x = Math.cos(a) * rr;
    const z = Math.sin(a) * rr;
    if (Math.hypot(x, z) > 0.96) continue;
    if (occupied.some(([ox, oz, or]) => Math.hypot(x - ox, z - oz) < or)) continue;
    const tilt = V((R() - 0.5) * 0.12, 1, (R() - 0.5) * 0.12).normalize();
    placeCoin(V(x, F + 0.006, z), tilt, R() * 6.28, 1, coinColors[Math.floor(R() * coinColors.length)]);
    placed++;
  }

  // gems scattered on the heap
  const gemHits = heapSurf.scatter(34, { rng: rng(99), minDist: 0.14, filter: (h) => h.n.y > 0.3 && h.at.y > F + 0.03 });
  gemHits.forEach((h, i) => {
    const col = GEM_COLORS[i % GEM_COLORS.length];
    const r = 0.03 + R() * 0.026;
    const d = h.n.clone().lerp(UP, 0.3).add(V(R() - 0.5, 0, R() - 0.5).multiplyScalar(0.8)).normalize();
    gemSolo(h.at.clone().addScaledVector(h.n, 0.005), d, r, r * 1.5, col, R() * 6);
  });

  // =============================================================================================================
  // CROWN
  // =============================================================================================================
  const K = new Fr(V(0.3, F + 0.2, 0.33), 18, 28, -10);
  const crownBand: OutlinePoint[] = [
    [0.14, 0],
    [0.158, 0],
    [0.168, 0.045],
    [0.162, 0.09],
    [0.146, 0.09],
    [0.136, 0.045],
  ];
  const bandPaint = paint((p, n, s) => {
    const c = ramp(GOLD_LO, GOLD, GOLD_HI, tone(n));
    const zig = Math.abs(((s[1] / 25.714) % 1) - 0.5) * 2; // 14 zig-zags round the band
    const y = s[0];
    const engr = Math.abs(y - 0.058 - zig * 0.014) < 0.004 ? 1 : 0;
    const dots = Math.abs(y - 0.02) < 0.004 ? 1 : 0;
    return mix(mix(c, "#6a2c0a", engr * 0.8 + dots * 0.5), "#7a3410", smoothstep(0.68, 0.95, noise(p, 0.04, 2)) * 0.25);
  });
  b.lathe(crownBand, { at: K.p([0, 0, 0]), axis: K.d([0, 1, 0]), segments: 14, color: bandPaint, bone: root, name: "crownBand" });
  b.lathe(
    [
      [0, 0.012],
      [0.135, 0.012],
      [0.135, 0.05],
      [0.1, 0.085],
      [0, 0.1],
    ],
    { at: K.p([0, 0, 0]), axis: K.d([0, 1, 0]), segments: 14, color: "#8a0f3a", bone: root, name: "crownLiner" },
  );
  add(new THREE.TorusGeometry(0.163, 0.0085, 5, 14), GOLD_FLAT2, K.m([0, 0.003, 0], [90, 0, 0]), { flat: false });
  add(new THREE.TorusGeometry(0.157, 0.0085, 5, 14), GOLD_FLAT2, K.m([0, 0.091, 0], [90, 0, 0]), { flat: false });
  const SPIKES = 7;
  const spikeH = [0.23, 0.13, 0.16, 0.12, 0.12, 0.16, 0.13];
  for (let i = 0; i < SPIKES; i++) {
    const phi = (i / SPIKES) * Math.PI * 2;
    const rad: [number, number, number] = [Math.sin(phi), 0, Math.cos(phi)];
    const tang: [number, number, number] = [Math.cos(phi), 0, -Math.sin(phi)];
    const h = spikeH[i];
    const lean = 14 * DEG;
    const up = K.d([rad[0] * Math.sin(lean), Math.cos(lean), rad[2] * Math.sin(lean)]);
    const pts: OutlinePoint[] = [
      [-0.046, 0],
      [0.046, 0],
      [0.036, 0.35 * h],
      [0.015, 0.72 * h],
      [0, h, "sharp"],
      [-0.015, 0.72 * h],
      [-0.036, 0.35 * h],
    ];
    const base = K.p([rad[0] * 0.152, 0.07, rad[2] * 0.152]);
    b.extrude(pts, { at: base, x: K.d(tang), y: up, thickness: 0.018, bevel: 0.005, smoothing: 1, color: goldPaint, bone: root, name: "crownSpike" });
    // tip orb
    const tip = base.clone().addScaledVector(up, h + 0.012);
    glow(b.part(new THREE.IcosahedronGeometry(0.016, 0), i % 2 ? MAGENTA : CYAN, { at: tip, bone: root, flat: true, name: "crownOrb" }), 1);
    // inset gem low on the spike
    const gp = base.clone().addScaledVector(up, 0.4 * h).addScaledVector(K.d(rad), 0.011);
    gemSolo(gp, K.d(rad).addScaledVector(up, 0.3).normalize(), 0.016, 0.02, i === 0 ? CYAN : GEM_COLORS[(i * 2) % GEM_COLORS.length], 0);
    // jewel on the band between spikes
    const phi2 = phi + Math.PI / SPIKES;
    const rad2: [number, number, number] = [Math.sin(phi2), 0, Math.cos(phi2)];
    gemSolo(K.p([rad2[0] * 0.17, 0.045, rad2[2] * 0.17]), K.d(rad2), 0.026, 0.03, GEM_COLORS[(i * 3 + 1) % GEM_COLORS.length], 0);
    add(new THREE.SphereGeometry(0.01, 6, 4), GOLD_FLAT2, K.m([rad2[0] * 0.168 + rad2[2] * 0.03, 0.045, rad2[2] * 0.168 - rad2[0] * 0.03]), { flat: false });
    add(new THREE.SphereGeometry(0.01, 6, 4), GOLD_FLAT2, K.m([rad2[0] * 0.168 - rad2[2] * 0.03, 0.045, rad2[2] * 0.168 + rad2[0] * 0.03]), { flat: false });
  }
  // the big front stone on a diamond bezel
  b.extrude(
    [
      [0, 0.058],
      [0.052, 0.003],
      [0, -0.052],
      [-0.052, 0.003],
    ],
    { at: K.p([0, 0.045, 0.171]), x: K.d([1, 0, 0]), y: K.d([0, 1, 0]), thickness: 0.016, bevel: 0.004, smoothing: 1, color: goldPaint, bone: root, name: "crownBezel" },
  );
  featGem(K.p([0, 0.046, 0.185]), K.d([0, 0.1, 1]), 0.04, 0.06, CYAN_HI, CYAN_DK, 1.2);

  // =============================================================================================================
  // GOBLETS
  // =============================================================================================================
  const bowlProfile: OutlinePoint[] = [
    [0, 0],
    [0.07, 0],
    [0.078, 0.012],
    [0.066, 0.022],
    [0.03, 0.032],
    [0.02, 0.06],
    [0.034, 0.075],
    [0.04, 0.088],
    [0.034, 0.1],
    [0.02, 0.112],
    [0.02, 0.14],
    [0.035, 0.15],
    [0.065, 0.178],
    [0.088, 0.22],
    [0.1, 0.3],
    [0.094, 0.31],
    [0.086, 0.3],
    [0.072, 0.24],
    [0.04, 0.2],
    [0, 0.185],
  ];
  const bowlR = (y: number) => {
    const ys = [0.15, 0.178, 0.22, 0.3];
    const rs = [0.035, 0.065, 0.088, 0.1];
    for (let i = 0; i < 3; i++) if (y <= ys[i + 1]) return rs[i] + ((y - ys[i]) / (ys[i + 1] - ys[i])) * (rs[i + 1] - rs[i]);
    return 0.1;
  };
  const goblet = (G: Fr, kind: "gold" | "silver" | "small", gems: string[]) => {
    const rings = [0.016, 0.065, 0.1, 0.14, 0.17, 0.2, 0.29];
    const paintFor = kind === "silver" ? silverPaint(rings) : goldGrooved(rings);
    const sc = kind === "small" ? 0.8 : 1;
    b.lathe(
      bowlProfile.map((pt) => [pt[0] * sc, pt[1] * sc] as OutlinePoint),
      { at: G.p([0, 0, 0]), axis: G.d([0, 1, 0]), segments: 10, color: paintFor, bone: root, name: `goblet.${kind}` },
    );
    // jewel band around the bowl
    const nG = 6;
    for (let i = 0; i < nG; i++) {
      const a = (i / nG) * Math.PI * 2;
      const y = 0.205 * sc;
      const rr = bowlR(0.205) * sc;
      const dir = G.d([Math.sin(a) * 1, 0.1, Math.cos(a)]);
      const col = gems[i % gems.length];
      gemSolo(G.p([Math.sin(a) * (rr + 0.004), y, Math.cos(a) * (rr + 0.004)]), dir, 0.02 * sc, 0.026 * sc, col, 0);
    }
    // rim bead ring + knop studs
    add(new THREE.TorusGeometry(0.098 * sc, 0.0075, 5, 10), kind === "silver" ? SILVER_FLAT : GOLD_FLAT2, G.m([0, 0.305 * sc, 0], [90, 0, 0]), { flat: false });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      add(new THREE.SphereGeometry(0.0085 * sc, 5, 4), kind === "silver" ? SILVER_FLAT : GOLD_FLAT2, G.m([Math.sin(a) * 0.042 * sc, 0.088 * sc, Math.cos(a) * 0.042 * sc]), { flat: false });
    }
  };
  // 1: tall gold chalice with glowing elixir
  const G1 = new Fr(V(-0.7, F, 0.13), 0);
  goblet(G1, "gold", [RUBY, EMERALD, SAPPHIRE, AMBER, VIOLET, CYAN]);
  glow(b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.01, 10), MAGENTA, { at: G1.p([0, 0.282, 0]), bone: root, name: "elixir" }), 1);
  // little gem crystals floating in the elixir
  featGem(G1.p([0.02, 0.3, 0.01]), V(0.3, 1, 0.1), 0.02, 0.03, MAGENTA_HI, MAGENTA, 1);
  // 2: small gold goblet stuffed with gems, tucked on the heap
  const G3 = new Fr(V(-0.2, F + 0.12, 0.0), -30, 6, -8);
  goblet(G3, "small", [SAPPHIRE, RUBY, EMERALD]);
  for (let i = 0; i < 7; i++) {
    const a = R() * 6.28;
    const rr = R() * 0.05;
    const col = GEM_COLORS[(i * 2 + 1) % GEM_COLORS.length];
    gemSolo(G3.p([Math.sin(a) * rr, 0.235 + R() * 0.03, Math.cos(a) * rr]), G3.d([R() - 0.5, 1, R() - 0.5]), 0.024, 0.036, col, R() * 6);
  }
  // 3: toppled silver goblet spilling coins
  const elev = 4.5 * DEG;
  const hdir = V(0.95, 0, -0.31).normalize();
  const gdir = hdir.clone().multiplyScalar(Math.cos(elev)).add(V(0, Math.sin(elev), 0));
  const G2 = new Fr(V(0.42, F + 0.078, 0.62), 0, 0, 0, aim(gdir));
  goblet(G2, "silver", [CYAN, MAGENTA, EMERALD, SAPPHIRE]);
  // coins pouring out of the mouth
  {
    const mouth = G2.p([0, 0.3, 0]);
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const along = 0.02 + t * 0.34;
      const lateral = (R() - 0.5) * (0.07 + t * 0.18);
      const side = V(-hdir.z, 0, hdir.x);
      const pos = mouth.clone().addScaledVector(hdir, along).addScaledVector(side, lateral);
      pos.y = F + 0.006 + (R() < 0.3 ? 0.008 : 0) + Math.max(0, 0.05 * (1 - t) * (0.5 + R()));
      const d = V((R() - 0.5) * 0.3, 1, (R() - 0.5) * 0.3).normalize();
      placeCoin(pos, d, R() * 6.28, 1, coinColors[Math.floor(R() * coinColors.length)]);
    }
  }

  // =============================================================================================================
  // CRYSTAL CLUSTERS (glowing tips)
  // =============================================================================================================
  const crystalCluster = (base: V3t, defs: [number, number, number, number, number][], body: string, tipCol: string) => {
    for (const [dx, dz, tiltX, tiltZ, len] of defs) {
      const r = 0.035 + len * 0.04;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX * DEG, 0, tiltZ * DEG));
      const at = V(base[0] + dx, F - 0.01, base[2] + dz);
      const tipLen = r * 2.2;
      b.part(crystalGeo(r, len), body, { at, quat: q, bone: root, flat: true, name: "crystal" });
      glow(b.part(crystalTip(r, tipLen, len), tipCol, { at, quat: q, bone: root, flat: true, name: "crystalTip" }), 1);
    }
  };
  type V3t = readonly [number, number, number];
  crystalCluster(
    [-0.66, 0, -0.52],
    [
      [0, 0, 0, 0, 0.5],
      [0.1, 0.03, 6, -20, 0.34],
      [-0.1, 0.02, -5, 22, 0.3],
      [0.03, -0.1, -18, 4, 0.26],
      [-0.04, 0.11, 22, -6, 0.22],
      [0.17, -0.06, -10, -32, 0.18],
      [-0.17, -0.04, 8, 36, 0.16],
    ],
    CYAN_DK,
    CYAN,
  );
  crystalCluster(
    [0.64, 0, -0.55],
    [
      [0, 0, 0, 0, 0.36],
      [0.09, 0.04, 8, -22, 0.26],
      [-0.09, 0.0, -6, 24, 0.24],
      [0.02, -0.09, -20, 3, 0.2],
      [0.03, 0.1, 22, -2, 0.16],
    ],
    MAGENTA_DK,
    MAGENTA,
  );

  // =============================================================================================================
  // INGOTS
  // =============================================================================================================
  const ingotGeo = new THREE.CylinderGeometry(0.5, 0.66, 1, 4, 1).rotateY(Math.PI / 4);
  const I = new Fr(V(0.78, F, -0.12), 14);
  const ingot = (pos: readonly number[], yaw: number, tilt = 0) => {
    const m = I.m(pos, [0, yaw, tilt], [0.2, 0.05, 0.1]);
    const q = new THREE.Quaternion();
    const at = new THREE.Vector3();
    const sc = new THREE.Vector3();
    m.decompose(at, q, sc);
    b.part(ingotGeo, goldPaint, { at, quat: q, scale: sc, bone: root, flat: true, name: "ingot" });
    // stamped mark on top
    const top = I.p([pos[0], pos[1] + 0.025, pos[2]]);
    add(new THREE.BoxGeometry(0.07, 0.004, 0.034), "#8a3f10", new THREE.Matrix4().compose(top, q, V(1, 1, 1)), { flat: true });
    add(new THREE.BoxGeometry(0.04, 0.005, 0.014), GOLD_FLAT2, new THREE.Matrix4().compose(top.clone().add(V(0, 0.001, 0)), q, V(1, 1, 1)), { flat: true });
  };
  for (const z of [-0.11, 0, 0.11]) ingot([0, 0.025, z], 0);
  for (const z of [-0.055, 0.055]) ingot([0, 0.075, z], 2);
  ingot([0, 0.125, 0], -3);
  ingot([0.04, 0.025, 0.27], 40);
  ingot([-0.2, 0.025, 0.2], -25);

  // =============================================================================================================
  // SACK
  // =============================================================================================================
  const S = new Fr(V(-0.5, F, 0.6), 25, 0, 8);
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.16, 0.05],
      [0.165, 0.12],
      [0.14, 0.21],
      [0.12, 0.27],
      [0.14, 0.33],
      [0.125, 0.34],
      [0.105, 0.28],
      [0.115, 0.2],
      [0.12, 0.12],
      [0, 0.07],
    ],
    { at: S.p([0, 0, 0]), axis: S.d([0, 1, 0]), segments: 9, color: burlap, bone: root, name: "sack" },
  );
  add(new THREE.TorusGeometry(0.155, 0.011, 5, 9), ROPE, S.m([0, 0.16, 0], [90, 0, 0]), { flat: false });
  add(new THREE.TorusGeometry(0.128, 0.01, 5, 9), ROPE, S.m([0, 0.26, 0], [90, 0, 0]), { flat: false });
  for (const sx of [1, -1]) add(new THREE.CylinderGeometry(0.008, 0.005, 0.09, 5), ROPE, S.m([sx * 0.07, 0.115, 0.158], [0, 0, sx * 25]), { flat: false });
  // patch sewn on the front
  box(S, [0.1, 0.1, 0.01], "#8a6a3a", [0, 0.14, 0.165], [0, 0, 0], root, "sackPatch");
  glow(b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.006, 8), GOLD_FLAT, { at: S.p([0, 0.14, 0.175]), quat: S.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))), bone: root, name: "sackCoinMark" }), 0.6);
  // coins on the sack heap
  scatterCoins(b.surface([lumpParts[7]]), 22, 0.05, F + 0.17);

  // coin stacks
  const stacks: [number, number, number][] = [
    [-0.26, 0.64, 16],
    [-0.17, 0.7, 11],
    [-0.33, 0.74, 7],
  ];
  for (const [sx, sz, n] of stacks) {
    for (let i = 0; i < n; i++) {
      const col = coinColors[(i + Math.floor(sx * 10)) % 4];
      const jitter = V((R() - 0.5) * 0.008, 0, (R() - 0.5) * 0.008);
      b.part(cg, col, {
        at: V(sx + jitter.x, F + 0.005 + i * 0.0092, sz + jitter.z),
        rotation: [0, R() * 90, 0],
        bone: root,
        flat: true,
        texture: COIN_TEX,
        name: "stackCoin",
      });
    }
  }

  // =============================================================================================================
  // SMALL STORY DETAILS: key, rings, scroll, necklace
  // =============================================================================================================
  // gold skeleton key lying in front
  {
    const Kf = new Fr(V(0.02, F + 0.012, 0.78), -20);
    add(new THREE.TorusGeometry(0.04, 0.011, 5, 10), GOLD_FLAT, Kf.m([-0.13, 0, 0], [90, 0, 0]), { flat: false });
    add(new THREE.CylinderGeometry(0.009, 0.009, 0.24, 6), GOLD_FLAT, Kf.m([0.03, 0, 0], [0, 0, 90]), { flat: false });
    add(new THREE.BoxGeometry(0.03, 0.012, 0.012), GOLD_FLAT, Kf.m([0.12, 0, 0.012]));
    add(new THREE.BoxGeometry(0.02, 0.012, 0.012), GOLD_FLAT, Kf.m([0.145, 0, 0.012]));
    add(new THREE.BoxGeometry(0.014, 0.012, 0.022), GOLD_FLAT, Kf.m([0.152, 0, -0.008]));
    add(new THREE.SphereGeometry(0.014, 6, 4), GOLD_FLAT2, Kf.m([-0.13, 0.012, 0]), { flat: false });
    add(new THREE.TorusGeometry(0.014, 0.006, 4, 8), GOLD_FLAT2, Kf.m([-0.13, 0.012, 0], [90, 0, 0]), { flat: false });
  }
  // rings with stones
  for (const [x, z, col, yaw] of [
    [0.3, 0.8, RUBY, 20],
    [-0.5, 0.2 + 0.58, EMERALD, 70],
    [0.62, 0.7, SAPPHIRE, 120],
  ] as const) {
    if (Math.hypot(x, z) > 0.95) continue;
    add(new THREE.TorusGeometry(0.03, 0.007, 5, 10), GOLD_FLAT, new THREE.Matrix4().compose(V(x, F + 0.032, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 1.1, yaw * DEG, 0)), V(1, 1, 1)), { flat: false });
    gemSolo(V(x, F + 0.052, z), V(0, 1, 0.3), 0.014, 0.02, col, 0);
  }
  // rolled treasure map with ribbon and wax seal
  {
    const M = new Fr(V(0.52, F + 0.032, 0.84), -35);
    add(new THREE.CylinderGeometry(0.032, 0.032, 0.2, 8), "#f1dca4", M.m([0, 0, 0], [0, 0, 90]), { flat: true });
    for (const sx of [1, -1]) {
      add(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 8), "#8a5a2a", M.m([sx * 0.103, 0, 0], [0, 0, 90]), { flat: true });
      add(new THREE.SphereGeometry(0.017, 6, 4), "#6a3f1a", M.m([sx * 0.122, 0, 0]), { flat: false });
    }
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), "#d8244c", M.m([0.02, 0, 0], [0, 0, 90]), { flat: true });
    add(new THREE.SphereGeometry(0.016, 6, 4), "#a8143a", M.m([0.02, 0.02, 0.026]), { flat: false });
    add(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 4), "#d8244c", M.m([0.03, 0, 0.05], [90, 0, 0]), { flat: true });
  }

  // necklace draped over the heap: chain, pearls and a pendant
  {
    const rough = catmull(
      [
        [-0.34, F + 0.5, -0.12],
        [-0.22, F + 0.34, 0.14],
        [-0.02, F + 0.3, 0.36],
        [0.2, F + 0.3, 0.2],
        [0.3, F + 0.4, -0.02],
      ],
    );
    const nl = heapSurf.drape(rough, { lift: 0.018 });
    b.sweep(nl, 0.0065, { color: GOLD_FLAT, sides: 5, bone: root, name: "chain" });
    const beads = 26;
    for (let i = 0; i < beads; i++) {
      const t = (i + 0.5) / beads;
      add(new THREE.SphereGeometry(0.0125, 6, 4), i % 3 === 0 ? MAGENTA_HI : "#f7f1ff", new THREE.Matrix4().makeTranslation(...(nl.at(t).toArray() as [number, number, number])), { flat: false });
    }
    const pc = nl.at(0.5);
    gemSolo(pc.clone().add(V(0, 0.01, 0.0)), V(0, 1, 0.5), 0.034, 0.05, MAGENTA, 0.5);
  }

  // =============================================================================================================
  // MAGIC: wisps and sparks rising from the chest
  // =============================================================================================================
  const wispFrames = [
    [-0.2, F + 0.46, -0.34],
    [0.0, F + 0.5, -0.3],
    [0.2, F + 0.47, -0.36],
    [-0.1, F + 0.5, -0.4],
    [0.12, F + 0.5, -0.26],
  ].map(([x, y, z]) => frame([x, y, z], [0, 1, 0]));
  glow(b.cards(wispFrames, WISP_TEX, { size: [0.17, 0.46], cross: true, vary: 0.25, spin: 25, rng: rng(5), flow: [0, 0, 1] }), 1);

  const sparkFrames = (n: number, seed: number, rmax: number, y0: number, y1: number) => {
    const rr = rng(seed);
    return Array.from({ length: n }, () => {
      const a = rr() * Math.PI * 2;
      const r = Math.sqrt(rr()) * rmax;
      return frame([Math.cos(a) * r * 0.9, y0 + rr() * (y1 - y0), -0.2 + Math.sin(a) * r * 0.7], [0, 1, 0]);
    });
  };
  glow(b.cards(sparkFrames(9, 11, 0.8, F + 0.55, F + 1.0), SPARK_CYAN, { size: [0.07, 0.07], cross: true, vary: 0.45, spin: 30, rng: rng(21), flow: [0, 0, 1] }), 1);
  glow(b.cards(sparkFrames(7, 12, 0.7, F + 0.5, F + 0.95), SPARK_GOLD, { size: [0.065, 0.065], cross: true, vary: 0.45, spin: 30, rng: rng(22), flow: [0, 0, 1] }), 1);
  glow(b.cards(sparkFrames(5, 13, 0.75, F + 0.45, F + 0.9), SPARK_PINK, { size: [0.06, 0.06], cross: true, vary: 0.45, spin: 30, rng: rng(23), flow: [0, 0, 1] }), 1);

  flush();
  return b.root;
}

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { aim, rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { cells, mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { ColorInput } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hextech Hoard",
  description:
    "A League-of-Legends style treasure hoard on a rune-lit stone dais: an open plum-and-gold chest spilling coins, a jewelled crown on a coin hill, goblets, gems, ingots, a pearl necklace, a loot sack and a glowing hextech crystal cluster.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD_S = "#6e260a";
const GOLD_D = "#b8570f";
const GOLD_M = "#ffb320";
const GOLD_L = "#fff3a6";
const COIN_A = "#ffbf2f";
const COIN_B = "#ffdc66";
const COIN_C = "#ea8a22";
const COIN_D = "#d4e4f6";
const STONE_A = "#2c3566";
const STONE_B = "#38457f";
const STONE_C = "#26305c";
const STONE_CRACK = "#12163a";
const CYAN = "#33efff";
const CYAN_L = "#b5fbff";
const RUBY = "#ff2457";
const SAPPH = "#2f6bff";
const EMER = "#14d98a";
const AMETH = "#b04bff";
const TOPAZ = "#ffa21a";
const DIAM = "#ecf8ff";
const PEARL = "#f6efff";
const VELVET = "#cf1445";
const VELVET_D = "#8a0c31";
const INK = "#1b1033";
const SILVER_D = "#4d5f9a";
const SILVER_M = "#a9bde6";
const SILVER_L = "#f2f8ff";
const WOOD_A = "#7a2748";
const WOOD_B = "#6a2040";
const WOOD_C = "#8a3252";
const WOOD_D = "#3a1030";
const TEAL = "#1fa3a0";
const TEAL_D = "#126a78";
const MAGENTA = "#ff3df0";

const hash = (i: number) => {
  const s = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return s - Math.floor(s);
};

// ---------------------------------------------------------------------------------------------------------------
// Paints
const KEY = new THREE.Vector3(0.4, 0.8, 0.45).normalize();

/** Hand-painted metal: four light bands against a fixed key, teal bounce light on the undersides, optional flutes. */
function metal(dark: string, mid: string, light: string, flutes = 0) {
  return paint((p, n, s) => {
    const t = n.dot(KEY) + (noise(p, 0.09, 5) - 0.5) * 0.28;
    let c: ColorInput;
    if (t > 0.82) c = light;
    else if (t > 0.5) c = mix(mid, light, 0.4);
    else if (t > 0.0) c = mid;
    else if (t > -0.45) c = mix(mid, dark, 0.55);
    else c = dark;
    if (n.y < -0.3) c = mix(typeof c === "string" ? c : dark, "#2fc8ff", 0.16);
    if (flutes > 0) {
      const w = 360 / flutes;
      const a = ((s[1] % w) + w) % w;
      if (a < 2.6) c = mix(dark, "#000000", 0.2);
    }
    return c;
  });
}
const GOLD = metal(GOLD_S, GOLD_M, GOLD_L);
const GOLD_FLUTED = metal(GOLD_S, GOLD_M, GOLD_L, 14);
const GOLD_DEEP = metal(GOLD_S, GOLD_D, GOLD_M);
const SILVER = metal(SILVER_D, SILVER_M, SILVER_L);
const SILVER_FLUTED = metal(SILVER_D, SILVER_M, SILVER_L, 12);

/** Heaps of coins under the loose ones: cell-split gold with dark gaps. */
const COIN_HEAP = paint((p, n) => {
  const c = cells(p, 0.075, 4);
  const edge = c.d2 - c.d1;
  const base = c.id < 0.3 ? GOLD_D : c.id < 0.65 ? GOLD_M : "#f2a01c";
  if (edge < 0.09) return GOLD_S;
  const lit = n.dot(KEY);
  return mix(base, lit > 0.6 ? GOLD_L : GOLD_S, lit > 0.6 ? (lit - 0.6) * 0.8 : Math.max(0, -lit) * 0.35);
});

/** Slate flagstones with cracks, a lit lip and teal-blue bounce. */
const STONE = paint((p, n) => {
  const c = cells(p, 0.34, 2);
  const edge = c.d2 - c.d1;
  const base = c.id < 0.33 ? STONE_A : c.id < 0.66 ? STONE_B : STONE_C;
  let out: ColorInput = mix(base, "#8ea4ff", (noise(p, 0.1, 8) - 0.5) * 0.16 + (n.y > 0.7 ? 0.04 : 0));
  if (n.y > 0.6 && edge < 0.07) out = STONE_CRACK;
  else if (n.y <= 0.6) out = mix(out, STONE_CRACK, 0.35 + 0.2 * smoothstep(0.1, 0.9, -n.y));
  return out;
});

const ROCK = paint((p, n) => {
  const t = n.dot(KEY);
  const base = mix(STONE_A, STONE_B, noise(p, 0.18, 3));
  return mix(base, t > 0.4 ? "#7f94f2" : STONE_CRACK, t > 0.4 ? (t - 0.4) * 0.6 : Math.max(0, 0.2 - t) * 0.5);
});

const SACK = paint((p, n) => {
  const t = n.dot(KEY);
  const weave = Math.sin(p.x * 160) * Math.sin(p.z * 160 + p.y * 40) * 0.03;
  return mix(mix(TEAL_D, TEAL, smoothstep(-0.4, 0.7, t)), "#7ff2e4", Math.max(0, t - 0.75) * 0.8 + weave);
});

// ---------------------------------------------------------------------------------------------------------------
// Transform frame so a sub-assembly can be built in its own local axes
class Xf {
  constructor(
    public o: THREE.Vector3,
    public q: THREE.Quaternion,
  ) {}
  p(v: V) {
    return new THREE.Vector3(...v).applyQuaternion(this.q).add(this.o);
  }
  d(v: V) {
    return new THREE.Vector3(...v).applyQuaternion(this.q);
  }
  rot(deg?: V) {
    const q = this.q.clone();
    if (deg) q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...(deg.map((a) => (a * Math.PI) / 180) as V))));
    return q;
  }
  inv(p: THREE.Vector3) {
    return p.clone().sub(this.o).applyQuaternion(this.q.clone().invert());
  }
  invD(d: THREE.Vector3) {
    return d.clone().applyQuaternion(this.q.clone().invert());
  }
}
const yawQ = (deg: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (deg * Math.PI) / 180);
const WORLD = new Xf(new THREE.Vector3(), new THREE.Quaternion());

const G = 0.12; // top of the dais
const CHEST = new Xf(new THREE.Vector3(-0.3, G, -0.4), yawQ(14));

// ---------------------------------------------------------------------------------------------------------------
// Textures
function starPts(n: number, r1: number, r2: number, cx = 32, cy = 32) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
  }
  return pts.join(" ");
}
function beads(r: number, n: number, rad: number, fill: string) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    s += `<circle cx="${(32 + Math.cos(a) * r).toFixed(2)}" cy="${(32 + Math.sin(a) * r).toFixed(2)}" r="${rad}" fill="${fill}"/>`;
  }
  return s;
}
const coinTex = (rim: string, field: string, groove: string, emblem: string, mark: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31.5" fill="${rim}"/>${beads(29.2, 20, 1.5, groove)}` +
      `<circle cx="32" cy="32" r="26" fill="${groove}"/><circle cx="32" cy="32" r="24.6" fill="${field}"/>` +
      `${emblem}<circle cx="32" cy="32" r="4" fill="${mark}"/></svg>`,
    { size: 128 },
  );
const TEX_COIN_A = coinTex(
  "#ffe27a",
  "#ffc42e",
  "#a8500c",
  `<polygon points="${starPts(8, 21, 9)}" fill="#fff0a0" stroke="#a8500c" stroke-width="1.6"/>`,
  "#a8500c",
);
const TEX_COIN_B = coinTex(
  "#fff0a8",
  "#ffdc66",
  "#b86a14",
  `<path d="M14 40 L16 24 L24 32 L32 18 L40 32 L48 24 L50 40 Z" fill="#c9780f" stroke="#7a3a0a" stroke-width="1.6"/><rect x="14" y="42" width="36" height="5" fill="#c9780f"/>`,
  "#7a3a0a",
);
const TEX_COIN_C = coinTex(
  "#ffb04a",
  "#ea8a22",
  "#7a2f0a",
  `<path d="M32 12 L46 26 L32 50 L18 26 Z" fill="#ff4a6a" stroke="#7a2f0a" stroke-width="1.8"/><path d="M18 26 L46 26" stroke="#7a2f0a" stroke-width="1.4"/>`,
  "#7a2f0a",
);
const TEX_COIN_D = coinTex(
  "#f4fbff",
  "#c4d8f0",
  "#4d5f9a",
  `<path d="M40 14 A19 19 0 1 0 40 50 A14 14 0 1 1 40 14 Z" fill="#f4fbff" stroke="#4d5f9a" stroke-width="1.6"/>`,
  "#4d5f9a",
);

const SPARKLE = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 L36 28 L64 32 L36 36 L32 64 L28 36 L0 32 L28 28 Z" fill="#ffffff"/><circle cx="32" cy="32" r="7" fill="#ffffff"/></svg>`,
  { size: 128 },
);

function runeRing() {
  let ticks = "";
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r0 = i % 6 === 0 ? 86 : 90;
    const r1 = 95;
    ticks += `<line x1="${(100 + Math.cos(a) * r0).toFixed(2)}" y1="${(100 + Math.sin(a) * r0).toFixed(2)}" x2="${(100 + Math.cos(a) * r1).toFixed(2)}" y2="${(100 + Math.sin(a) * r1).toFixed(2)}" stroke="${CYAN}" stroke-width="${i % 6 === 0 ? 2.4 : 1.5}"/>`;
  }
  let glyphs = "";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
    const cx = 100 + Math.cos(a) * 77;
    const cy = 100 + Math.sin(a) * 77;
    const deg = (a * 180) / Math.PI + 90;
    const shape = [
      `<path d="M-3 4 L0 -5 L3 4 M-3 0 L3 0" fill="none"/>`,
      `<path d="M-4 -4 L4 4 M4 -4 L-4 4 M0 -5 L0 5" fill="none"/>`,
      `<path d="M-4 3 L-4 -4 L4 -4 L4 3 M-4 0 L4 0" fill="none"/>`,
    ][i % 3];
    glyphs += `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${deg.toFixed(1)})" stroke="${CYAN_L}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${shape}</g>`;
  }
  return svg(
    `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="none" stroke="${CYAN}" stroke-width="2.4"/>` +
      `<circle cx="100" cy="100" r="85" fill="none" stroke="${CYAN}" stroke-width="2"/>` +
      `<circle cx="100" cy="100" r="68" fill="none" stroke="#1f9fc2" stroke-width="1.6"/>` +
      `${ticks}${glyphs}<polygon points="${starPts(6, 66, 66, 100, 100)}" fill="none" stroke="#1f9fc2" stroke-width="1.6"/></svg>`,
    { size: 1024 },
  );
}
const TEX_RING = runeRing();

const TEX_SIGIL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="${CYAN}" stroke-width="3"/>` +
    `<circle cx="50" cy="50" r="38" fill="none" stroke="${CYAN_L}" stroke-width="2"/>` +
    `<polygon points="${starPts(6, 36, 36, 50, 50)}" fill="none" stroke="${CYAN}" stroke-width="2.4"/>` +
    `<polygon points="${starPts(3, 36, 18, 50, 50)}" fill="none" stroke="${CYAN_L}" stroke-width="2"/>` +
    `<path d="M50 30 L60 50 L50 70 L40 50 Z" fill="${CYAN}"/><circle cx="50" cy="50" r="5" fill="#ffffff"/></svg>`,
  { size: 384 },
);

const TEX_FILIGREE = svg(
  `<svg viewBox="0 0 300 80"><g fill="none" stroke="#ffd24a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M120 40 C108 40 100 28 88 28 C72 28 64 44 74 54 C82 61 94 56 92 46 C91 40 84 40 83 45"/>` +
    `<path d="M88 28 C76 14 56 18 50 32 C46 44 54 52 40 54 C30 55 20 48 18 40"/>` +
    `<path d="M120 40 C112 52 100 66 84 68 C68 70 54 62 44 62"/>` +
    `<path d="M180 40 C192 40 200 28 212 28 C228 28 236 44 226 54 C218 61 206 56 208 46 C209 40 216 40 217 45"/>` +
    `<path d="M212 28 C224 14 244 18 250 32 C254 44 246 52 260 54 C270 55 280 48 282 40"/>` +
    `<path d="M180 40 C188 52 200 66 216 68 C232 70 246 62 256 62"/>` +
    `<path d="M120 40 L180 40"/>` +
    `</g><g fill="#ffd24a"><circle cx="18" cy="40" r="4"/><circle cx="282" cy="40" r="4"/><circle cx="44" cy="62" r="3.2"/><circle cx="256" cy="62" r="3.2"/></g></svg>`,
  { size: 1024 },
);

// ---------------------------------------------------------------------------------------------------------------
// Builder and skeleton
export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  const rand = rng(7);
  const r = (lo: number, hi: number) => lo + (hi - lo) * rand();
  const ROOT = b.joint("root", { at: [0, 0, 0] });
  const LID = b.joint("lid", { parent: ROOT, at: CHEST.p([0, 0.46, -0.3]), dir: CHEST.d([0, 0, 1]), role: "hinge" });
  let BONE = ROOT;

  // ---- tiny helpers
  const box = (X: Xf, size: V, pos: V, color: ColorInput, rot?: V) =>
    b.part(new THREE.BoxGeometry(...size), color, { bone: BONE, at: X.p(pos), quat: X.rot(rot) });
  /** a bevelled block (chamfered rims), centre `pos`, size w×h along local x/y, thickness d along local z */
  const bev = (X: Xf, w: number, h: number, d: number, pos: V, color: ColorInput, bevel = 0.008, rot?: V) =>
    b.extrude(
      [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ],
      {
        at: X.p([pos[0], pos[1], pos[2]]).add(new THREE.Vector3(-w / 2, -h / 2, 0).applyQuaternion(X.rot(rot))),
        x: new THREE.Vector3(1, 0, 0).applyQuaternion(X.rot(rot)),
        y: new THREE.Vector3(0, 1, 0).applyQuaternion(X.rot(rot)),
        thickness: d,
        bevel,
        color,
        bone: BONE,
      },
    );
  const plate = (X: Xf, outline: OutlinePoint[], pos: V, thickness: number | [number, number], color: ColorInput, opts: { bevel?: number; smoothing?: number; rot?: V } = {}) => {
    const q = X.rot(opts.rot);
    return b.extrude(outline, {
      at: X.p(pos),
      x: new THREE.Vector3(1, 0, 0).applyQuaternion(q),
      y: new THREE.Vector3(0, 1, 0).applyQuaternion(q),
      thickness,
      bevel: opts.bevel ?? 0.006,
      smoothing: opts.smoothing ?? 0,
      color,
      bone: BONE,
    });
  };
  const lathe = (X: Xf, outline: OutlinePoint[], pos: V, color: ColorInput, o: { segments?: number; smoothing?: number; spin?: number } = {}) =>
    b.lathe(outline, { at: X.p(pos), axis: X.d([0, 1, 0]), bone: BONE, color, segments: o.segments ?? 10, smoothing: o.smoothing ?? 0, spin: o.spin });
  const tube = (pts: THREE.Vector3[], rad: number | [number, number], color: ColorInput, o: { closed?: boolean; sides?: number; caps?: "round" | "flat" | "none" } = {}) =>
    b.sweep(o.closed ? catmull(pts, { closed: true }) : pts.length === 2 ? polyline(pts) : catmull(pts), rad, {
      bone: BONE,
      color,
      section: { ngon: o.sides ?? 6 },
      caps: o.closed ? "none" : (o.caps ?? "round"),
    });
  const ball = (p: THREE.Vector3, rad: number, color: ColorInput, seg = 8) =>
    b.part(new THREE.SphereGeometry(rad, seg, Math.max(3, Math.round(seg / 2))), color, { bone: BONE, at: p, flat: true });

  // ---- merged buckets (static, by colour and texture)
  type Bucket = { color: string; texture?: ReturnType<typeof svg>; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const put = (key: string, color: string, geo: THREE.BufferGeometry, texture?: ReturnType<typeof svg>) => {
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, (bk = { color, texture, geos: [] }));
    bk.geos.push(geo);
  };
  const flush = () => {
    for (const [key, bk] of buckets) {
      const merged = mergeGeometries(bk.geos);
      if (!merged) throw new Error(`bucket ${key} failed to merge`);
      b.part(merged, bk.color, { bone: ROOT, at: [0, 0, 0], flat: true, texture: bk.texture, name: key });
    }
    buckets.clear();
  };
  const place = (geo: THREE.BufferGeometry, at: THREE.Vector3, q: THREE.Quaternion, scale = 1) =>
    geo.applyMatrix4(new THREE.Matrix4().compose(at, q, new THREE.Vector3(scale, scale, scale)));

  // ---- coins
  const COIN_R = 0.058;
  const COIN_T = 0.013;
  const COINS = [
    { key: "A", color: COIN_A, tex: TEX_COIN_A, w: 0.42 },
    { key: "B", color: COIN_B, tex: TEX_COIN_B, w: 0.28 },
    { key: "C", color: COIN_C, tex: TEX_COIN_C, w: 0.18 },
    { key: "D", color: COIN_D, tex: TEX_COIN_D, w: 0.12 },
  ];
  const coin = (at: THREE.Vector3, up: THREE.Vector3, spin: number, kind?: number, both = false) => {
    const pick = kind ?? (() => {
      let t = rand();
      for (let i = 0; i < COINS.length; i++) {
        t -= COINS[i].w;
        if (t <= 0) return i;
      }
      return 0;
    })();
    const c = COINS[pick];
    const q = aim(up).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin));
    put(`coinBody${c.key}`, c.color, place(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 8, 1), at, q));
    put(`coinFace${c.key}`, "#ffffff", place(new THREE.CircleGeometry(COIN_R * 0.93, 8).rotateX(-Math.PI / 2).translate(0, COIN_T / 2 + 0.0007, 0), at, q), c.tex);
    if (both) put(`coinFace${c.key}`, "#ffffff", place(new THREE.CircleGeometry(COIN_R * 0.93, 8).rotateX(Math.PI / 2).translate(0, -COIN_T / 2 - 0.0007, 0), at, q), c.tex);
  };
  const tilted = (n: THREE.Vector3, amount: number) =>
    n.clone().add(new THREE.Vector3(r(-1, 1), r(-0.3, 0.3), r(-1, 1)).multiplyScalar(amount)).normalize();

  // ---- gems
  const gemGeo = (kind: "cut" | "octa" | "step" | "shard", rad: number) => {
    if (kind === "octa") return new THREE.OctahedronGeometry(rad, 0).scale(1, 1.3, 0.9);
    if (kind === "step")
      return mergeGeometries([
        new THREE.CylinderGeometry(rad * 0.7, rad, rad * 0.35, 8, 1).translate(0, rad * 0.18, 0),
        new THREE.CylinderGeometry(rad, rad * 0.2, rad * 0.7, 8, 1).translate(0, -rad * 0.35, 0),
      ])!.scale(1, 1, 0.72);
    const pts =
      kind === "cut"
        ? [
            [0, -0.72],
            [0.62, -0.2],
            [1, 0],
            [0.86, 0.15],
            [0.5, 0.38],
            [0, 0.38],
          ]
        : [
            [0, -1.25],
            [0.5, -0.75],
            [0.5, 0.7],
            [0, 1.35],
          ];
    return new THREE.LatheGeometry(
      pts.map(([x, y]) => new THREE.Vector2(x * rad, y * rad)),
      kind === "cut" ? 8 : 6,
    );
  };
  const gem = (color: string, kind: "cut" | "octa" | "step" | "shard", rad: number, at: THREE.Vector3, q: THREE.Quaternion, strength = 0.42) => {
    const part = b.part(gemGeo(kind, rad), color, { bone: BONE, at, quat: q, flat: true });
    if (strength > 0) glow(part, strength);
    return part;
  };
  const GEM_COLORS = [RUBY, SAPPH, EMER, AMETH, TOPAZ, CYAN, DIAM, RUBY, SAPPH, AMETH];
  const KINDS: ("cut" | "octa" | "step" | "shard")[] = ["cut", "octa", "step", "cut", "shard", "step"];
  const layGem = (hit: { at: THREE.Vector3; n: THREE.Vector3 }, color: string, kind: "cut" | "octa" | "step" | "shard", rad: number) => {
    const n = tilted(hit.n, 0.55);
    const q = aim(n).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), r(0, 6.28)));
    return gem(color, kind, rad, hit.at.clone().addScaledVector(hit.n, rad * 0.35), q);
  };

  // =============================================================================================================
  // DAIS
  const dais = b.lathe(
    [
      [0, 0],
      [1.34, 0],
      [1.34, 0.05],
      [1.28, 0.06],
      [1.28, 0.085],
      [1.22, 0.09],
      [1.22, G],
      [0, G],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 8, color: STONE, bone: ROOT, name: "dais" },
  );
  void dais;
  // gold trim on the dais top edge and gold corner studs with little crystals
  const octa = (rad: number, y: number) =>
    Array.from({ length: 8 }, (_, i) => new THREE.Vector3(Math.sin((i * Math.PI) / 4) * rad, y, Math.cos((i * Math.PI) / 4) * rad));
  b.sweep(polyline(octa(1.232, G + 0.006), { closed: true }), 0.017, { bone: ROOT, color: GOLD_DEEP, section: { ngon: 4 }, caps: "none" });
  b.sweep(polyline(octa(1.292, 0.064), { closed: true }), 0.012, { bone: ROOT, color: GOLD_DEEP, section: { ngon: 4 }, caps: "none" });
  octa(1.232, G + 0.02).forEach((v, i) => {
    ball(v, 0.05, GOLD, 8);
    gem(i % 2 ? CYAN : MAGENTA, "cut", 0.026, v.clone().add(new THREE.Vector3(0, 0.05, 0)), new THREE.Quaternion(), 0.8);
  });
  b.part(new THREE.CircleGeometry(1.15, 40), "#ffffff", {
    bone: ROOT,
    at: [0, G + 0.003, 0],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: TEX_RING,
    name: "runeRing",
  });
  glow(b.part(new THREE.CircleGeometry(1.15, 40), "#ffffff", { bone: ROOT, at: [0, G + 0.0035, 0], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: TEX_RING, name: "runeRingGlow" }), 1.1);

  // rocks around the dais
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + r(-0.12, 0.12);
    const rad = r(1.42, 1.62);
    const s = r(0.1, 0.22);
    const geo = new THREE.IcosahedronGeometry(s, 0).scale(1.25, 0.75, 1);
    b.part(geo, ROCK, {
      bone: ROOT,
      at: [Math.sin(a) * rad, s * 0.4, Math.cos(a) * rad],
      rotation: [r(-15, 15), r(0, 360), r(-15, 15)],
      flat: true,
    });
  }
  // little cyan crystals among the rocks
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const rad = 1.5 + 0.06 * (i % 2);
    const hgt = 0.1 + 0.07 * hash(i + 3);
    const base = new THREE.Vector3(Math.sin(a) * rad, 0.02, Math.cos(a) * rad);
    const q = aim(new THREE.Vector3(Math.sin(a) * 0.35, 1, Math.cos(a) * 0.35));
    gem(CYAN, "shard", hgt * 0.42, base.add(new THREE.Vector3(0, hgt * 0.55, 0)), q, 0.7);
  }

  // =============================================================================================================
  // COIN HILL (heightfield)
  const bumps: [number, number, number, number][] = [
    [0.32, 0.4, 0.78, 0.38],
    [0.82, -0.02, 0.5, 0.22],
    [-0.1, 0.98, 0.44, 0.17],
    [-0.22, 0.12, 0.5, 0.3],
    [-0.86, 0.42, 0.38, 0.13],
    [0.4, -0.78, 0.46, 0.16],
    [-0.9, -0.2, 0.34, 0.12],
  ];
  const heightAt = (x: number, z: number) => {
    let h = 0;
    for (const [cx, cz, rad, amp] of bumps) {
      const d = Math.hypot(x - cx, z - cz) / rad;
      if (d < 1) h += amp * Math.pow(1 - d * d, 1.5);
    }
    return h;
  };
  const N = 36;
  const EXT = 1.2;
  const step = (EXT * 2) / N;
  const grid: number[][] = [];
  for (let i = 0; i <= N; i++) {
    grid.push([]);
    for (let j = 0; j <= N; j++) {
      const x = -EXT + i * step;
      const z = -EXT + j * step;
      let h = heightAt(x, z);
      if (h > 0.015) h += (hash(i * 131 + j * 17) - 0.5) * 0.04 * Math.min(1, h * 6);
      grid[i].push(h);
    }
  }
  const hpos: number[] = [];
  const hidx: number[] = [];
  for (let i = 0; i <= N; i++)
    for (let j = 0; j <= N; j++) hpos.push(-EXT + i * step, G + grid[i][j] + (grid[i][j] > 0 ? 0.002 : 0), -EXT + j * step);
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const a = i * (N + 1) + j;
      const bb = a + 1;
      const c = a + N + 1;
      const d = c + 1;
      const hmax = (k: number) => grid[Math.floor(k / (N + 1))][k % (N + 1)];
      if (Math.max(hmax(a), hmax(bb), hmax(c)) > 0.004) hidx.push(a, bb, c);
      if (Math.max(hmax(bb), hmax(c), hmax(d)) > 0.004) hidx.push(bb, d, c);
    }
  const hillGeo = new THREE.BufferGeometry();
  hillGeo.setAttribute("position", new THREE.Float32BufferAttribute(hpos, 3));
  hillGeo.setIndex(hidx);
  // winding: make sure faces point up
  {
    const idx = hillGeo.index!;
    const pa = new THREE.Vector3();
    const pb = new THREE.Vector3();
    const pc = new THREE.Vector3();
    const posA = hillGeo.getAttribute("position");
    for (let k = 0; k < idx.count; k += 3) {
      pa.fromBufferAttribute(posA, idx.getX(k));
      pb.fromBufferAttribute(posA, idx.getX(k + 1));
      pc.fromBufferAttribute(posA, idx.getX(k + 2));
      const nrm = pb.clone().sub(pa).cross(pc.clone().sub(pa));
      if (nrm.y < 0) {
        const t = idx.getX(k + 1);
        idx.setX(k + 1, idx.getX(k + 2));
        idx.setX(k + 2, t);
      }
    }
  }
  const hill = b.part(hillGeo, COIN_HEAP, { bone: ROOT, at: [0, 0, 0], flat: true, name: "coinHill" });
  const hillSurf = b.surface(hill);
  const drop = (x: number, z: number) => hillSurf.ray([x, 3, z], [0, -1, 0]);

  // =============================================================================================================
  // CHEST
  const C = CHEST;
  const CW = 1.0;
  const CD = 0.6;
  const CH = 0.46;
  const wood = (X: Xf) => {
    const qi = X.q.clone().invert();
    return paint((p, n) => {
      const l = X.inv(p);
      const ln = n.clone().applyQuaternion(qi);
      const u = Math.abs(ln.x) > 0.6 ? l.z : l.x;
      const k = u / 0.15 + 50;
      const id = Math.floor(k);
      const fr = k - id;
      const h = hash(id);
      const base = h < 0.34 ? WOOD_A : h < 0.67 ? WOOD_B : WOOD_C;
      if (Math.abs(ln.y) > 0.6 && l.y > 0.3 && ln.y > 0) {
        // curved lid: planks run front to back
      }
      const grain = noise(new THREE.Vector3(u * 14, l.y * 1.2, id * 3.1), 0.12, id);
      let c: ColorInput = mix(base, WOOD_D, 0.18 + grain * 0.32);
      if (fr < 0.045 || fr > 0.965) c = WOOD_D;
      const t = n.dot(KEY);
      c = mix(c, t > 0.55 ? "#d4668a" : WOOD_D, t > 0.55 ? (t - 0.55) * 0.5 : Math.max(0, 0.1 - t) * 0.5);
      return c;
    });
  };
  const WOOD = wood(C);
  const VELVET_P = paint((p, n) => {
    const l = C.inv(p);
    const u = (l.x + l.z) / 0.11;
    const v = (l.x - l.z) / 0.11;
    const fu = Math.abs(u - Math.round(u));
    const fv = Math.abs(v - Math.round(v));
    if (fu < 0.07 || fv < 0.07) return VELVET_D;
    if (fu < 0.2 && fv < 0.2) return mix(VELVET, GOLD_M, smoothstep(0.17, 0.1, Math.hypot(fu, fv)));
    return mix(VELVET, "#ff5a86", Math.max(0, 0.4 - Math.hypot(fu - 0.5, fv - 0.5)) * 0.6 + Math.max(0, n.y) * 0.0);
  });

  const t = 0.05; // wall thickness
  // shell: floor, four walls
  box(C, [CW, 0.06, CD], [0, 0.03, 0], WOOD);
  box(C, [CW, CH - 0.06, t], [0, 0.06 + (CH - 0.06) / 2, CD / 2 - t / 2], WOOD);
  box(C, [CW, CH - 0.06, t], [0, 0.06 + (CH - 0.06) / 2, -CD / 2 + t / 2], WOOD);
  for (const s of [1, -1]) box(C, [t, CH - 0.06, CD - 2 * t], [s * (CW / 2 - t / 2), 0.06 + (CH - 0.06) / 2, 0], WOOD);
  // inner velvet floor lip
  box(C, [CW - 2 * t, 0.01, CD - 2 * t], [0, 0.08, 0], VELVET_D);

  // gold trim: base plinth, top rim, vertical straps, corner brackets
  const trim = metal(GOLD_S, GOLD_M, GOLD_L);
  box(C, [CW + 0.03, 0.045, CD + 0.03], [0, 0.0225, 0], trim);
  box(C, [CW + 0.03, 0.065, 0.022], [0, CH - 0.032, CD / 2 + 0.008], trim);
  box(C, [CW + 0.03, 0.065, 0.022], [0, CH - 0.032, -CD / 2 - 0.008], trim);
  for (const s of [1, -1]) box(C, [0.022, 0.065, CD + 0.03], [s * (CW / 2 + 0.008), CH - 0.032, 0], trim);
  for (const s of [1, -1]) {
    for (const xs of [-0.31, 0.31]) {
      bev(C, 0.1, CH - 0.08, 0.02, [xs, 0.045 + (CH - 0.1) / 2, CD / 2 + 0.009], trim, 0.006);
      bev(C, 0.1, CH - 0.08, 0.02, [xs, 0.045 + (CH - 0.1) / 2, -CD / 2 - 0.009], trim, 0.006);
    }
    // end straps
    for (const zs of [-0.17, 0.17]) {
      b.extrude(
        [[0, 0], [0.1, 0], [0.1, CH - 0.1], [0, CH - 0.1]],
        { at: C.p([s * (CW / 2 + 0.009), 0.045, zs - 0.05]), x: C.d([0, 0, 1]), y: C.d([0, 1, 0]), thickness: 0.02, bevel: 0.006, color: trim, bone: BONE },
      );
    }
    // corner caps: L-shaped brackets
    for (const zs of [1, -1]) {
      const corner = C.p([s * (CW / 2 + 0.016), 0, zs * (CD / 2 + 0.016)]);
      ball(corner.clone().add(C.d([0, 0.07, 0])), 0.052, GOLD, 8);
      ball(corner.clone().add(C.d([0, CH - 0.02, 0])), 0.046, GOLD, 8);
      // claw feet
      const foot = C.p([s * (CW / 2 - 0.04), 0.0, zs * (CD / 2 - 0.04)]);
      void foot;
    }
  }
  // rivets row on straps (merged)
  {
    const geos: THREE.BufferGeometry[] = [];
    for (const zs of [1, -1])
      for (const xs of [-0.31, 0.31])
        for (let k = 0; k < 4; k++) {
          const y = 0.1 + k * 0.095;
          for (const dx of [-0.03, 0.03]) geos.push(place(new THREE.SphereGeometry(0.012, 5, 3), C.p([xs + dx, y, zs * (CD / 2 + 0.02)]), new THREE.Quaternion()));
        }
    for (const s of [1, -1])
      for (const zs of [-0.17, 0.17])
        for (let k = 0; k < 4; k++) geos.push(place(new THREE.SphereGeometry(0.012, 5, 3), C.p([s * (CW / 2 + 0.02), 0.1 + k * 0.095, zs]), new THREE.Quaternion()));
    for (const s of [1, -1])
      for (let k = 0; k < 9; k++) {
        geos.push(place(new THREE.SphereGeometry(0.011, 5, 3), C.p([-0.45 + k * 0.1125, CH - 0.032, CD / 2 + 0.019]), new THREE.Quaternion()));
        geos.push(place(new THREE.SphereGeometry(0.011, 5, 3), C.p([-0.45 + k * 0.1125, CH - 0.032, -CD / 2 - 0.019]), new THREE.Quaternion()));
        void s;
      }
    b.part(mergeGeometries(geos)!, GOLD_L, { bone: ROOT, at: [0, 0, 0], flat: true, name: "chestRivets" });
  }
  // gold ball feet
  for (const s of [1, -1])
    for (const zs of [1, -1]) {
      ball(C.p([s * 0.43, 0.0, zs * 0.23]), 0.04, GOLD, 8);
    }
  // filigree on the front and back panels, carved panel frame
  for (const side of [1, -1]) {
    const y = 0.22;
    b.part(new THREE.PlaneGeometry(0.64, 0.17), "#ffffff", {
      bone: ROOT,
      at: C.p([0, y, side * (CD / 2 + 0.0035)]),
      dir: C.d([0, 0, side]),
      axis: "z",
      up: C.d([0, 1, 0]),
      texture: TEX_FILIGREE,
      name: side > 0 ? "chestFiligreeFront" : "chestFiligreeBack",
    });
  }
  // handles on both ends
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.055, 0.011, 5, 10, Math.PI), GOLD, {
      bone: ROOT,
      at: C.p([s * (CW / 2 + 0.03), 0.3, 0]),
      quat: C.rot([0, 90, 0]).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)),
      flat: true,
    });
    for (const zs of [-0.055, 0.055]) ball(C.p([s * (CW / 2 + 0.02), 0.3, zs]), 0.016, GOLD_L, 6);
    // handle back plate
    bev(C, 0.18, 0.09, 0.012, [0, 0, 0], GOLD, 0.004).mesh.position.set(0, 0, 0);
  }

  // lock plate with glowing keyhole gem
  plate(
    C,
    [
      [-0.07, 0, "sharp"],
      [0.07, 0, "sharp"],
      [0.085, 0.13, "sharp"],
      [0.0, 0.18, "sharp"],
      [-0.085, 0.13, "sharp"],
    ],
    [0, 0.13, CD / 2 + 0.018],
    0.03,
    GOLD,
    { bevel: 0.01 },
  );
  gem(CYAN, "step", 0.04, C.p([0, 0.245, CD / 2 + 0.052]), C.rot([90, 0, 0]), 0.9);
  box(C, [0.012, 0.045, 0.01], [0, 0.17, CD / 2 + 0.049], INK);
  for (const sx of [-1, 1]) for (const yy of [0.145, 0.29]) ball(C.p([sx * 0.055, yy - 0.01, CD / 2 + 0.036]), 0.01, GOLD_L, 5);

  // ---- interior coin pile (dome) + cascade tongue over the front lip
  const ipos: number[] = [];
  const iidx: number[] = [];
  const IX = 12;
  const IZ = 8;
  const domeAt = (lx: number, lz: number) => {
    const dx = Math.max(0, 1 - (lx / 0.47) ** 2);
    const dz = Math.max(0, 1 - ((lz + 0.02) / 0.3) ** 2);
    return 0.43 + 0.2 * Math.pow(dx * dz, 0.8) + (hash(Math.round(lx * 30) * 7 + Math.round(lz * 30)) - 0.5) * 0.03 * Math.sqrt(dx * dz);
  };
  for (let i = 0; i <= IX; i++)
    for (let j = 0; j <= IZ; j++) {
      const lx = -0.47 + (i / IX) * 0.94;
      const lz = -0.27 + (j / IZ) * 0.54;
      const p = C.p([lx, domeAt(lx, lz), lz]);
      ipos.push(p.x, p.y, p.z);
    }
  for (let i = 0; i < IX; i++)
    for (let j = 0; j < IZ; j++) {
      const a = i * (IZ + 1) + j;
      iidx.push(a, a + 1, a + IZ + 1, a + 1, a + IZ + 2, a + IZ + 1);
    }
  const intGeo = new THREE.BufferGeometry();
  intGeo.setAttribute("position", new THREE.Float32BufferAttribute(ipos, 3));
  intGeo.setIndex(iidx);
  {
    const idx = intGeo.index!;
    const posA = intGeo.getAttribute("position");
    const pa = new THREE.Vector3();
    const pb = new THREE.Vector3();
    const pc = new THREE.Vector3();
    for (let k = 0; k < idx.count; k += 3) {
      pa.fromBufferAttribute(posA, idx.getX(k));
      pb.fromBufferAttribute(posA, idx.getX(k + 1));
      pc.fromBufferAttribute(posA, idx.getX(k + 2));
      if (pb.clone().sub(pa).cross(pc.clone().sub(pa)).y < 0) {
        const tt = idx.getX(k + 1);
        idx.setX(k + 1, idx.getX(k + 2));
        idx.setX(k + 2, tt);
      }
    }
  }
  const interior = b.part(intGeo, COIN_HEAP, { bone: ROOT, at: [0, 0, 0], flat: true, name: "chestPile" });
  const tongue = b.extrude(
    [
      [0.0, 0.45, "sharp"],
      [0.12, 0.6, "sharp"],
      [0.24, 0.55],
      [0.34, 0.49],
      [0.46, 0.36],
      [0.62, 0.16],
      [0.7, 0.02, "sharp"],
      [0.0, 0.02, "sharp"],
    ],
    {
      at: C.p([-0.0, 0, 0]).add(C.d([0.19, 0, 0])),
      x: C.d([0, 0, 1]),
      y: C.d([0, 1, 0]),
      thickness: [0.38, 0.38],
      bevel: 0.03,
      smoothing: 1,
      color: COIN_HEAP,
      bone: BONE,
      name: "chestTongue",
    },
  );
  const intSurf = b.surface(interior);
  const tongueSurf = b.surface(tongue);

  // =============================================================================================================
  // CHEST LID (hinged)
  BONE = LID;
  const LA = 0.31; // half depth + overhang
  const LY = 0.27;
  const arch = (sc: number, n = 14): [number, number][] =>
    Array.from({ length: n + 1 }, (_, i) => {
      const a = Math.PI * (i / n);
      return [LA * (1 - Math.cos(a) * sc) - 0, LY * Math.sin(a) * sc] as [number, number];
    });
  // closed-lid coordinates: local z = depth, centred on chest; hinge at back top edge
  {
    const prof: OutlinePoint[] = arch(1).map(([z, y], i, arr) => (i === 0 || i === arr.length - 1 ? ([z - LA - 0.0, y + 0, "sharp"] as OutlinePoint) : ([z - LA, y] as OutlinePoint)));
    // lid shell = solid arched prism along x; origin z=-LA..LA relative to centre
    const lidBody = plate(C, prof, [0, CH, 0], CW + 0.02, wood(C), { bevel: 0.012, rot: [0, -90, 0], smoothing: 0 });
    void lidBody;
  }
  return b.root;
}

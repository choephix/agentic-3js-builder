import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, aim, rng, paint, mix, noise, cells, smoothstep, svg, catmull, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A hextech-flavoured treasure hoard in a painterly fantasy-MOBA style: an open iron-and-gold chest spilling coins, a jewelled crown, goblets, gold ingots, scattered gems and a glowing crystal cluster.",
};

// ---------------------------------------------------------------------------------------------------------------
// Small helpers

type V = [number, number, number];
type Pt = [number, number] | [number, number, "sharp"];
const Y = new THREE.Vector3(0, 1, 0);
const ONE = new THREE.Vector3(1, 1, 1);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const xf = (pos: THREE.Vector3, q: THREE.Quaternion, s: THREE.Vector3 = ONE) =>
  new THREE.Matrix4().compose(pos, q, s);

// ---------------------------------------------------------------------------------------------------------------
// Palette and paints

const GEM_COLS = ["#ff2d55", "#2f7bff", "#20d97a", "#b45cff", "#ffb62e", "#9ff3ff"];
const RUBY = GEM_COLS[0];
const SAPPHIRE = GEM_COLS[1];
const EMERALD = GEM_COLS[2];
const AMBER = GEM_COLS[4];
const HEX_CYAN = "#47e6ff";
const PEARL = "#fff3f4";

const goldPaint = (seed: number) =>
  paint((p, n) => {
    const t = noise(p, 0.11, seed);
    const f = noise(p, 0.025, seed + 4);
    let c = mix("#b36a12", "#ffd447", smoothstep(0.25, 0.8, t * 0.7 + f * 0.3));
    c = mix(c, "#fff6c2", 0.55 * smoothstep(0.62, 1, n.y) * smoothstep(0.4, 0.75, f));
    c = mix(c, "#6a2a12", 0.38 * smoothstep(0.05, -0.85, n.y));
    c = mix(c, "#5a3aa0", 0.14 * smoothstep(-0.2, -1, n.y));
    return c;
  });
const GOLD = goldPaint(3);
const GOLD_DEEP = goldPaint(9);

const SILVER = paint((p, n) => {
  const t = noise(p, 0.09, 21);
  let c = mix("#6f82ad", "#eef6ff", smoothstep(0.2, 0.85, t));
  c = mix(c, "#ffffff", 0.5 * smoothstep(0.6, 1, n.y));
  c = mix(c, "#2c2f6e", 0.4 * smoothstep(0.05, -0.9, n.y));
  return c;
});

const MOUND = paint((p, n) => {
  const c = cells(p, 0.075, 3);
  const edge = smoothstep(0.03, 0.14, c.d2 - c.d1);
  let tone = mix(mix("#c9861a", "#f6c23a", c.id), "#ffe68a", 0.35 * smoothstep(0.5, 1, n.y) * c.id);
  tone = mix(tone, "#5a2a9a", 0.22 * smoothstep(0.1, -0.8, n.y));
  return mix("#4a2208", tone, edge);
});

const WOOD = paint((p, n) => {
  const side = Math.abs(n.x) > 0.6;
  const u = side ? p.z : p.x;
  const w = 0.1;
  const id = Math.floor(u / w);
  const f = u / w - id;
  const q = new THREE.Vector3(p.x, p.y * 0.12, p.z);
  const grain = noise(q, 0.035, 5);
  let c = mix("#5a2e1e", "#8c4a2a", smoothstep(0.2, 0.8, grain * 0.75 + (((id % 3) + 3) % 3) * 0.1));
  if (f < 0.045 || f > 0.955) c = mix(c, "#1e0e10", 0.85);
  else if (f < 0.09) c = mix(c, "#c07a46", 0.18);
  c = mix(c, "#ffb868", 0.2 * smoothstep(0.3, 1, n.y));
  c = mix(c, "#251a50", 0.3 * smoothstep(0.0, -0.9, n.y));
  return c;
});

const VELVET = paint((p, n) => {
  const t = noise(p, 0.05, 14);
  let c = mix("#74102c", "#c8214c", smoothstep(0.2, 0.8, t));
  const gx = ((p.x / 0.07) % 1 + 1) % 1;
  const gz = ((p.z / 0.07) % 1 + 1) % 1;
  if (Math.abs(gx - 0.5) < 0.08 && Math.abs(gz - 0.5) < 0.08) c = mix(c, "#ffcf6a", 0.5);
  c = mix(c, "#ff9aa8", 0.2 * smoothstep(0.4, 1, n.y));
  return c;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures

const textures = () => {
  const COIN = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#d9951c"/>
      <circle cx="50" cy="50" r="48" fill="#ffd04d" stroke="#7a4210" stroke-width="3"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#c4801a" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#fff0a0" stroke-width="1.5" stroke-dasharray="2 4"/>
      <path d="M28 64 L28 38 L39 50 L50 30 L61 50 L72 38 L72 64 Z" fill="#c7791a" stroke="#6b3a0c" stroke-width="3" stroke-linejoin="round"/>
      <rect x="28" y="64" width="44" height="7" rx="2" fill="#c7791a" stroke="#6b3a0c" stroke-width="3"/>
      <circle cx="50" cy="26" r="3.5" fill="#fff4b0" stroke="#6b3a0c" stroke-width="2"/>
      <path d="M18 40 A34 34 0 0 1 46 16" stroke="#fffbd0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
    </svg>`,
    { size: 128 },
  );
  const wing = `<path d="M40 44 L14 20 L20 38 L9 34 L18 49 L28 47 L22 58 L40 58Z" fill="#ffcf4a" stroke="#6b3a0c" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M18 29 L32 42 M16 40 L30 48" stroke="#b8741a" stroke-width="1.6" fill="none"/>`;
  const EMBLEM = svg(
    `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 3 L75 13 L73 58 Q70 82 40 97 Q10 82 7 58 L5 13 Z" fill="#17254f" stroke="#2a1608" stroke-width="3"/>
      <path d="M40 8 L70 16 L68 57 Q65 78 40 91 Q15 78 12 57 L10 16 Z" fill="none" stroke="#ffd04d" stroke-width="3"/>
      ${wing}
      <g transform="translate(80 0) scale(-1 1)">${wing}</g>
      <circle cx="40" cy="50" r="19" fill="#0e1736" stroke="#ffd04d" stroke-width="3.5"/>
      <path d="M40 74 L40 90 M33 82 L47 82" stroke="#ffd04d" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );
  const scrollStroke = (col: string, w: number) =>
    `<g fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 30 C20 4 40 8 46 26 C50 38 38 44 34 34 C31 26 42 22 46 30"/>
      <path d="M92 30 C80 4 60 8 54 26 C50 38 62 44 66 34 C69 26 58 22 54 30"/>
      <path d="M12 44 C24 56 36 54 44 46 M88 44 C76 56 64 54 56 46"/>
    </g>`;
  const SCROLL = svg(
    `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      ${scrollStroke("#4a2206", 9)}
      ${scrollStroke("#ffd44f", 4.6)}
      <circle cx="50" cy="30" r="7.5" fill="#ffd44f" stroke="#4a2206" stroke-width="3"/>
      <circle cx="49" cy="28" r="2" fill="#fff8c8"/>
    </svg>`,
    { size: 256 },
  );
  const gemMotif = (c1: string, c2: string, c3: string) =>
    svg(
      `<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 3 L55 22 L55 48 L30 67 L5 48 L5 22Z" fill="#ffd04d" stroke="#4a2206" stroke-width="3" stroke-linejoin="round"/>
        <path d="M30 12 L47 25 L47 45 L30 58 L13 45 L13 25Z" fill="${c1}" stroke="#2a0c06" stroke-width="2" stroke-linejoin="round"/>
        <path d="M30 12 L47 25 L30 36 L13 25Z" fill="${c2}"/>
        <path d="M30 36 L47 25 L47 45 L30 58Z" fill="${c3}"/>
        <path d="M18 22 L26 17" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
      { size: 128 },
    );
  const SPARK = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 0 Q35 28 64 32 Q35 36 32 64 Q29 36 0 32 Q29 28 32 0Z" fill="#ffffff"/>
      <circle cx="32" cy="32" r="6" fill="#e6e6e6"/>
    </svg>`,
    { size: 96 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#6ff2ff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M32 4 L58 19 L58 61 L32 76 L6 61 L6 19Z"/>
        <path d="M32 18 L32 62"/><path d="M20 30 L32 22 L44 30"/><path d="M20 52 L32 44 L44 52"/><path d="M18 38 L46 38"/>
      </g>
      <circle cx="32" cy="38" r="3" fill="#bffaff"/>
    </svg>`,
    { size: 256 },
  );
  return {
    COIN,
    EMBLEM,
    SCROLL,
    SPARK,
    RUNE,
    DECAL_RUBY: gemMotif("#e51d45", "#ff7a92", "#a00f2e"),
    DECAL_BLUE: gemMotif("#2a6bff", "#8fb6ff", "#1a3fb0"),
  };
};

// ---------------------------------------------------------------------------------------------------------------
// Mounds of coin

type Mound = { c: V; rx: number; h: number; rz: number };
function onMound(m: Mound, u: number, a: number) {
  const dx = m.rx * u * Math.cos(a);
  const dz = m.rz * u * Math.sin(a);
  const dy = m.h * Math.sqrt(Math.max(0, 1 - u * u));
  return {
    p: v3(m.c[0] + dx, m.c[1] + dy, m.c[2] + dz),
    n: v3(dx / (m.rx * m.rx), dy / (m.h * m.h), dz / (m.rz * m.rz)).normalize(),
  };
}

const MOUND_CHEST: Mound = { c: [0, 0.453, -0.2], rx: 0.4, h: 0.15, rz: 0.25 };
const MOUND_FRONT: Mound = { c: [0.1, 0, 0.4], rx: 0.66, h: 0.26, rz: 0.5 };
const MOUND_CROWN: Mound = { c: [-0.58, 0, 0.52], rx: 0.42, h: 0.2, rz: 0.36 };
const MOUND_GOBLET: Mound = { c: [0.72, 0, 0.32], rx: 0.36, h: 0.18, rz: 0.32 };

// Crown placement
const CROWN_AT = v3(-0.56, 0.2, 0.52);
const CROWN_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.28, 0.5, -0.2));
const cp = (x: number, y: number, z: number) => v3(x, y, z).applyQuaternion(CROWN_Q).add(CROWN_AT);
const cd = (x: number, y: number, z: number) => v3(x, y, z).applyQuaternion(CROWN_Q);

const arcPts = (r: number, n: number, y0 = 0): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = (Math.PI * i) / n;
    return [r * Math.cos(a), r * Math.sin(a) + y0] as [number, number];
  });

export default function build() {
  const b = createBuilder({ name: "hoard" });
  const T = textures();

  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: root, at: [0, 0.45, -0.5], dir: [0, 0, 1], role: "hinge" });

  const P = (geo: THREE.BufferGeometry, color: any, o: any = {}) => b.part(geo, color, { bone: root, ...o });
  const mergePart = (geos: THREE.BufferGeometry[], color: any, o: any = {}) => {
    if (!geos.length) return null;
    const m = mergeGeometries(geos);
    if (!m) throw new Error("merge failed");
    return P(m, color, { at: [0, 0, 0], flat: true, ...o });
  };

  const sparkles: THREE.Vector3[] = [];

  // ---------------------------------------------------------------- coin and gem buckets
  const coinBuckets: THREE.BufferGeometry[][] = [[], [], [], []]; // 0-2 plain golds, 3 textured emblem
  const COIN_COLS = ["#f6bd2e", "#ffd95c", "#cf8c1c"];
  const gemBuckets: THREE.BufferGeometry[][] = GEM_COLS.map(() => []);

  const addCoin = (pos: THREE.Vector3, dir: THREE.Vector3, spin: number, radius: number, bucket: number) => {
    const g = new THREE.CylinderGeometry(radius, radius, radius * 0.22, 10, 1);
    const q = aim(dir).multiply(new THREE.Quaternion().setFromAxisAngle(Y, spin));
    g.applyMatrix4(xf(pos, q));
    coinBuckets[bucket].push(g);
  };
  const addGem = (pos: THREE.Vector3, dir: THREE.Vector3, radius: number, bucket: number) => {
    const g = new THREE.OctahedronGeometry(radius, 0).scale(1, 1.3, 1);
    g.applyMatrix4(xf(pos, aim(dir)));
    gemBuckets[bucket].push(g);
  };
  const jitter = (rr: () => number, k: number) => v3((rr() - 0.5) * k, (rr() - 0.5) * k, (rr() - 0.5) * k);

  const pileCoins = (m: Mound, count: number, seed: number, avoid?: (x: number, z: number) => boolean) => {
    const rr = rng(seed);
    for (let i = 0; i < count; i++) {
      const u = Math.sqrt(rr()) * 0.97;
      const a = rr() * Math.PI * 2;
      const s = onMound(m, u, a);
      if (avoid && avoid(s.p.x, s.p.z)) continue;
      const edge = rr() < 0.18;
      const dir = s.n.clone().add(jitter(rr, edge ? 1.3 : 0.5)).normalize();
      const pos = s.p.clone().addScaledVector(s.n, edge ? 0.012 : 0.004);
      const bucket = rr() < 0.22 ? 3 : Math.floor(rr() * 3);
      addCoin(pos, dir, rr() * 6.28, 0.042 + rr() * 0.014, bucket);
    }
  };
  const pileGems = (m: Mound, count: number, seed: number, avoid?: (x: number, z: number) => boolean) => {
    const rr = rng(seed);
    for (let i = 0; i < count; i++) {
      const u = Math.sqrt(rr()) * 0.9;
      const a = rr() * Math.PI * 2;
      const s = onMound(m, u, a);
      if (avoid && avoid(s.p.x, s.p.z)) continue;
      const dir = s.n.clone().add(jitter(rr, 1.6)).normalize();
      addGem(s.p.clone().addScaledVector(s.n, 0.014), dir, 0.026 + rr() * 0.02, Math.floor(rr() * GEM_COLS.length));
    }
  };

  // ================================================================= CHEST
  const BW = 0.95;
  const BH = 0.45;
  const BD = 0.6;
  const BZ = -0.2;
  // body
  P(new THREE.BoxGeometry(BW, BH, BD), WOOD, { at: [0, BH / 2, BZ] });
  // base trim
  P(new THREE.BoxGeometry(BW + 0.03, 0.045, BD + 0.03), GOLD_DEEP, { at: [0, 0.0225, BZ] });
  // inner velvet lining and gold rim frame
  P(new THREE.BoxGeometry(0.86, 0.006, 0.52), VELVET, { at: [0, BH + 0.003, BZ] });
  // vertical bands
  for (const x of [-0.33, 0.33]) {
    P(new THREE.BoxGeometry(0.09, 0.446, BD + 0.02), GOLD, { at: [x, 0.223, BZ] });
    // hextech hex gems on the front bands
    P(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 6), GOLD_DEEP, { at: [x, 0.2, 0.116], dir: [0, 0, 1] });
    glow(P(new THREE.CylinderGeometry(0.027, 0.027, 0.014, 6), HEX_CYAN, { at: [x, 0.2, 0.122], dir: [0, 0, 1] }), 1.3);
  }
  // corner posts and finials
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const px = sx * (BW / 2 + 0.012 - 0.04);
      const pz = sz > 0 ? 0.1 + 0.012 - 0.04 : -0.5 - 0.012 + 0.04;
      P(new THREE.BoxGeometry(0.08, 0.47, 0.08), GOLD, { at: [px, 0.235, pz] });
      P(new THREE.ConeGeometry(0.03, 0.05, 4), GOLD, { at: [px, 0.495, pz], flat: true });
    }
  // lock plate
  P(
    new THREE.BoxGeometry(0.01, 0.01, 0.01),
    GOLD,
    { at: [0, 0, 0], scale: [0.001, 0.001, 0.001] },
  );
  b.extrude(
    [[-0.075, 0.075], [0.075, 0.075], [0.08, -0.02], [0, -0.095, "sharp"], [-0.08, -0.02]] as Pt[],
    { at: [0, 0.34, 0.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.026, bevel: 0.006, smoothing: 1, color: GOLD, bone: root },
  );
  P(new THREE.PlaneGeometry(0.1, 0.125), "#ffffff", { at: [0, 0.34, 0.1145], texture: T.EMBLEM });
  glow(P(new THREE.CylinderGeometry(0.028, 0.028, 0.014, 6), HEX_CYAN, { at: [0, 0.345, 0.124], dir: [0, 0, 1] }), 1.5);
  // keyhole drop below the plate
  P(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 8), "#2a1608", { at: [0, 0.27, 0.116], dir: [0, 0, 1] });
  // runes on the chest ends
  for (const s of [1, -1])
    glow(
      P(new THREE.PlaneGeometry(0.26, 0.33), "#ffffff", {
        at: [s * (BW / 2 + 0.003), 0.22, BZ],
        dir: [s, 0, 0],
        axis: "z",
        texture: T.RUNE,
      }),
      1.2,
    );

  // ---- lid (built closed on the hinge, opened at the end)
  const LR = 0.3;
  b.extrude(arcPts(LR, 10), {
    at: [0, BH, BZ],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: BW,
    color: WOOD,
    bone: lid,
  });
  for (const x of [-0.33, 0.33])
    b.extrude(arcPts(0.322, 10, -0.015), {
      at: [x, BH, BZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.09,
      color: GOLD,
      bone: lid,
    });
  for (const s of [-1, 1])
    b.extrude(arcPts(0.312, 10, -0.012), {
      at: [s * (BW / 2 + 0.008), BH, BZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.005,
      color: GOLD_DEEP,
      bone: lid,
    });
  // lid studs
  {
    const studs: THREE.BufferGeometry[] = [];
    for (const x of [-0.33, 0.33])
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * (0.2 + 0.15 * i + 0.0)) ;
        const r = 0.322;
        studs.push(new THREE.SphereGeometry(0.016, 6, 4).translate(x, BH + r * Math.sin(a) - 0.01, BZ + r * Math.cos(a)));
      }
    mergePart(studs, GOLD_DEEP, { bone: lid });
  }
  // lid velvet lining (faces down when closed, shows when open)
  P(new THREE.BoxGeometry(0.88, 0.008, 0.58), GOLD, { at: [0, BH - 0.004, BZ], bone: lid });
  P(new THREE.BoxGeometry(0.8, 0.006, 0.5), VELVET, { at: [0, BH - 0.011, BZ], bone: lid });
  // hinge barrels
  for (const x of [-0.26, 0.26])
    P(new THREE.CylinderGeometry(0.024, 0.024, 0.11, 8), GOLD_DEEP, { at: [x, BH + 0.005, -0.5], dir: [1, 0, 0], bone: lid });

  // chest mound of coins and gems
  P(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, {
    at: MOUND_CHEST.c,
    scale: [MOUND_CHEST.rx, MOUND_CHEST.h, MOUND_CHEST.rz],
    flat: true,
  });
  pileCoins(MOUND_CHEST, 46, 11);
  pileGems(MOUND_CHEST, 9, 12);

  // ================================================================= COIN PILES
  for (const [m, count] of [[MOUND_FRONT, 120], [MOUND_CROWN, 60], [MOUND_GOBLET, 52]] as [Mound, number][])
    P(new THREE.SphereGeometry(1, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2), MOUND, {
      at: m.c,
      scale: [m.rx, m.h, m.rz],
      flat: true,
    });
  pileCoins(MOUND_FRONT, 120, 21);
  pileCoins(MOUND_CROWN, 64, 22, (x, z) => Math.hypot(x - CROWN_AT.x, z - CROWN_AT.z) < 0.17);
  pileCoins(MOUND_GOBLET, 52, 23, (x, z) => Math.hypot(x - 0.72, z - 0.32) < 0.09);
  pileGems(MOUND_FRONT, 16, 31);
  pileGems(MOUND_CROWN, 10, 32, (x, z) => Math.hypot(x - CROWN_AT.x, z - CROWN_AT.z) < 0.2);
  pileGems(MOUND_GOBLET, 8, 33, (x, z) => Math.hypot(x - 0.72, z - 0.32) < 0.1);

  // ================================================================= GOLD INGOTS
  {
    const ingots: THREE.BufferGeometry[] = [];
    const rr = rng(41);
    const layers: [number, number[]][] = [
      [0.025, [-0.1, 0, 0.1]],
      [0.075, [-0.05, 0.05]],
      [0.125, [0]],
    ];
    for (const [y, zs] of layers)
      for (const dz of zs) {
        const g = new THREE.CylinderGeometry(0.04, 0.06, 0.05, 4, 1).rotateY(Math.PI / 4).scale(2.2, 1, 1.1);
        g.applyMatrix4(
          xf(v3(-0.9 + (rr() - 0.5) * 0.01, y, -0.42 + dz), new THREE.Quaternion().setFromAxisAngle(Y, (rr() - 0.5) * 0.25)),
        );
        ingots.push(g);
      }
    // two loose bars leaning in front of the stack
    for (const [x, z, yaw] of [[-0.78, -0.12, 0.7], [-0.95, -0.18, -0.4]] as V[]) {
      const g = new THREE.CylinderGeometry(0.04, 0.06, 0.05, 4, 1).rotateY(Math.PI / 4).scale(2.2, 1, 1.1);
      g.applyMatrix4(xf(v3(x, 0.025, z), new THREE.Quaternion().setFromAxisAngle(Y, yaw)));
      ingots.push(g);
    }
    mergePart(ingots, GOLD);
  }

  // ================================================================= GOBLETS
  const GOBLET_PROFILE: [number, number][] = [
    [0, 0], [0.075, 0], [0.078, 0.012], [0.05, 0.03], [0.022, 0.05], [0.02, 0.085], [0.034, 0.1], [0.034, 0.115],
    [0.02, 0.13], [0.022, 0.165], [0.06, 0.2], [0.08, 0.25], [0.082, 0.285], [0.074, 0.285], [0.07, 0.25],
    [0.05, 0.2], [0, 0.18],
  ];
  const goblet = (base: V, axisIn: V, s: number, color: any, decalTex: THREE.Texture | null) => {
    const axis = v3(...axisIn).normalize();
    const outline = GOBLET_PROFILE.map(([r, y]) => [r * s, y * s] as [number, number]);
    const part = b.lathe(outline, { at: base, axis, segments: 10, color, bone: root });
    if (decalTex) {
      const ref = Math.abs(axis.y) > 0.95 ? v3(0, 0, 1) : v3(0, 1, 0);
      const u1 = ref.clone().cross(axis).normalize();
      const u2 = axis.clone().cross(u1);
      for (let k = 0; k < 4; k++) {
        const th = (k * Math.PI) / 2 + 0.4;
        const perp = u1.clone().multiplyScalar(Math.cos(th)).add(u2.clone().multiplyScalar(Math.sin(th)));
        const at = v3(...base).addScaledVector(axis, 0.237 * s).addScaledVector(perp, 0.078 * s);
        b.decal(part, decalTex, { at, dir: perp, up: axis, size: [0.062 * s, 0.072 * s] });
      }
    }
    // gem studs on the foot ring
    for (let k = 0; k < 6; k++) {
      const ref = Math.abs(axis.y) > 0.95 ? v3(0, 0, 1) : v3(0, 1, 0);
      const u1 = ref.clone().cross(axis).normalize();
      const u2 = axis.clone().cross(u1);
      const th = (k * Math.PI * 2) / 6;
      const perp = u1.clone().multiplyScalar(Math.cos(th)).add(u2.clone().multiplyScalar(Math.sin(th)));
      const at = v3(...base).addScaledVector(axis, 0.014 * s).addScaledVector(perp, 0.074 * s);
      addGem(at, perp, 0.011 * s, k % 2 ? 0 : 4);
    }
    return part;
  };
  goblet([0.72, 0.15, 0.32], [0, 1, 0], 1.1, GOLD, T.DECAL_RUBY);
  goblet([-1.02, 0, 0.02], [0, 1, 0], 1.25, SILVER, T.DECAL_BLUE);
  // knocked-over goblet with a spill of coins
  {
    const base: V = [0.5, 0.08, 0.9];
    const axis = v3(0.35, 0.06, 0.93).normalize();
    goblet(base, [axis.x, axis.y, axis.z], 1.0, GOLD, null);
    const mouth = v3(...base).addScaledVector(axis, 0.285);
    const rr = rng(57);
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const pos = v3(
        mouth.x + 0.04 + 0.2 * t + (rr() - 0.5) * 0.08,
        0.012 + (1 - t) * 0.05 * rr(),
        mouth.z + 0.02 + 0.4 * t + (rr() - 0.5) * 0.08,
      );
      const dir = v3(0, 1, 0).add(jitter(rr, 0.5 + (1 - t) * 0.8)).normalize();
      addCoin(pos, dir, rr() * 6.28, 0.044, i % 4 === 0 ? 3 : i % 3);
    }
    sparkles.push(mouth.clone().add(v3(0, 0.08, 0)));
  }

  // ================================================================= CROWN
  {
    const crownPart = (outline: Pt[], color: any) =>
      b.lathe(outline, { at: cp(0, 0, 0), axis: cd(0, 1, 0), segments: 14, color, bone: root });
    crownPart([[0.158, -0.012], [0.18, -0.012], [0.18, 0.016], [0.158, 0.016]], GOLD);
    const band = crownPart([[0.16, 0.016], [0.178, 0.016], [0.19, 0.085], [0.172, 0.085]], VELVET);
    crownPart([[0.17, 0.085], [0.198, 0.085], [0.198, 0.108], [0.17, 0.108]], GOLD);
    // velvet cap
    P(new THREE.SphereGeometry(0.168, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), VELVET, {
      at: cp(0, 0.085, 0),
      quat: CROWN_Q,
      scale: [1, 0.72, 1],
    });
    // fleur points, gems and band jewels
    const tallGems = [RUBY, SAPPHIRE, EMERALD, AMBER];
    const crownGem = (pos: THREE.Vector3, dir: THREE.Vector3, r: number, col: string, k = 1) =>
      glow(
        P(new THREE.OctahedronGeometry(r, 0), col, { at: pos, dir, scale: [1, 0.6, 1.3], flat: true }),
        k,
      );
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const sx = Math.sin(a);
      const cx = Math.cos(a);
      const tall = k % 2 === 0;
      const h = tall ? 0.15 : 0.09;
      const w = tall ? 1 : 0.8;
      const ol: Pt[] = [
        [-0.03 * w, 0, "sharp"],
        [0.03 * w, 0, "sharp"],
        [0.036 * w, 0.045],
        [0.017 * w, h * 0.55],
        [0, h, "sharp"],
        [-0.017 * w, h * 0.55],
        [-0.036 * w, 0.045],
      ];
      b.extrude(ol, {
        at: cp(0.186 * sx, 0.1, 0.186 * cx),
        x: cd(cx, 0, -sx),
        y: cd(0, 1, 0),
        thickness: 0.016,
        bevel: 0.004,
        smoothing: 1,
        color: GOLD,
        bone: root,
      });
      const tip = cp(0.186 * sx, 0.1 + h + 0.014, 0.186 * cx);
      if (tall) {
        glow(P(new THREE.OctahedronGeometry(0.017, 0), tallGems[k / 2], { at: tip, dir: [0, 1, 0], scale: [1, 1.4, 1], flat: true }), 0.9);
        // jewel on band
        const radial = cd(sx, 0, cx);
        P(new THREE.CylinderGeometry(0.034, 0.038, 0.012, 8), GOLD, { at: cp(0.187 * sx, 0.05, 0.187 * cx), dir: radial });
        crownGem(cp(0.194 * sx, 0.05, 0.194 * cx), radial, 0.032, tallGems[k / 2], 0.9);
      } else {
        P(new THREE.SphereGeometry(0.014, 6, 4), PEARL, { at: tip });
        // scroll decal on the band under the short points
        b.decal(band, T.SCROLL, {
          at: cp(0.184 * sx, 0.05, 0.184 * cx),
          dir: cd(sx, 0, cx),
          up: cd(0, 1, 0),
          size: [0.1, 0.06],
        });
      }
    }
    // arches
    const archPts = [
      [-0.19, 0.105], [-0.176, 0.17], [-0.1, 0.225], [0, 0.252], [0.1, 0.225], [0.176, 0.17], [0.19, 0.105],
    ];
    b.sweep(catmull(archPts.map(([x, y]) => cp(x, y, 0))), 0.012, { color: GOLD, bone: root, sides: 6 });
    b.sweep(catmull(archPts.map(([x, y]) => cp(0, y, x))), 0.012, { color: GOLD, bone: root, sides: 6 });
    // orb and hextech crown jewel
    P(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { at: cp(0, 0.262, 0) });
    glow(P(new THREE.OctahedronGeometry(0.028, 0), HEX_CYAN, { at: cp(0, 0.312, 0), quat: CROWN_Q, scale: [0.9, 1.5, 0.9], flat: true }), 1.5);
    sparkles.push(cp(0, 0.4, 0));
    // pearls round the bottom rim
    const pearls: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k * Math.PI * 2) / 16;
      const p = cp(0.181 * Math.sin(a), 0.002, 0.181 * Math.cos(a));
      pearls.push(new THREE.SphereGeometry(0.0125, 6, 4).translate(p.x, p.y, p.z));
    }
    mergePart(pearls, PEARL);
  }

  // ================================================================= HEXTECH CRYSTAL CLUSTER
  const crystal = (base: V, axisIn: V, s: number, body: string, tip: string, k: number) => {
    const axis = v3(...axisIn).normalize();
    const hb = 0.25 * s;
    const r = 0.07 * s;
    const bodyOl: [number, number][] = [[0, 0], [r, 0], [r * 1.1, hb], [0, hb]];
    const tipOl: [number, number][] = [[0, hb], [r * 1.1, hb], [r * 0.7, hb + 0.09 * s], [0, hb + 0.2 * s]];
    glow(b.lathe(bodyOl, { at: base, axis, segments: 6, color: body, bone: root }), k * 0.8);
    glow(b.lathe(tipOl, { at: base, axis, segments: 6, color: tip, bone: root }), k * 1.2);
    sparkles.push(v3(...base).addScaledVector(axis, hb + 0.2 * s + 0.04));
  };
  crystal([0.9, -0.02, -0.4], [0.12, 1, -0.05], 1.9, "#1fb6e8", "#8ef4ff", 1.0);
  crystal([0.72, -0.02, -0.52], [-0.3, 1, -0.2], 1.15, "#7a34d8", "#d09aff", 1.0);
  crystal([1.04, -0.02, -0.18], [0.45, 1, 0.1], 1.0, "#14c4a8", "#8affe0", 1.0);
  crystal([0.8, -0.02, -0.16], [0.05, 1, 0.55], 0.7, "#2f7bff", "#a8c8ff", 1.0);
  crystal([1.12, -0.02, -0.45], [0.7, 1, -0.1], 0.75, "#b04cd8", "#f0b4ff", 1.0);
  // small shards on the floor
  {
    const rr = rng(63);
    const shards: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const a = rr() * 6.28;
      const d = 0.28 + rr() * 0.3;
      const pos = v3(0.9 + Math.cos(a) * d, 0.03, -0.35 + Math.sin(a) * d * 0.8);
      const g = new THREE.OctahedronGeometry(0.03 + rr() * 0.025, 0).scale(1, 1.6, 1);
      g.applyMatrix4(xf(pos, aim(v3(0, 1, 0).add(jitter(rr, 1.0)).normalize())));
      shards.push(g);
    }
    const m = mergePart(shards, HEX_CYAN);
    if (m) glow(m, 1.1);
  }

  // ================================================================= FLUSH BUCKETS
  coinBuckets.slice(0, 3).forEach((geos, i) => mergePart(geos, COIN_COLS[i]));
  mergePart(coinBuckets[3], "#ffffff", { texture: T.COIN });
  gemBuckets.forEach((geos, i) => {
    const m = mergePart(geos, GEM_COLS[i]);
    if (m) glow(m, 0.75);
  });

  // ================================================================= SPARKLES
  for (const p of [
    v3(0.1, 0.46, 0.5), v3(-0.3, 0.32, 0.72), v3(0.78, 0.38, 0.4), v3(0.0, 0.66, -0.2), v3(-0.9, 0.3, -0.42),
    v3(0.4, 0.34, 0.75), v3(-0.72, 0.32, 0.4), v3(0.55, 0.62, -0.3),
  ])
    sparkles.push(p);
  const frames = sparkles.map((p) => frame(p.clone().add(v3(0, -0.07, 0)), [0, 1, 0]));
  const cards = b.cards(frames, T.SPARK, {
    size: 0.15,
    flow: [0, 0, 1],
    cross: true,
    vary: 0.4,
    rng: rng(77),
    color: "#c4f6ff",
    sink: 0,
    bone: root,
  });
  glow(cards, 1.4);

  // ================================================================= OPEN THE LID
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  return b.root;
}

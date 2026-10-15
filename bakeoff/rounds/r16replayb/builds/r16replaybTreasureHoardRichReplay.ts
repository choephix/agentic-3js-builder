// Treasure hoard on a rune dais: open chest, coin mountain, jewelled crown, goblets, loose gems, a magic orb.
// League of Legends look: chunky exaggerated shapes, saturated gems and glowing magic against a dark base,
// readable from a high top-down camera.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, grain, mix, mottle, noise, paint, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A dragon's hoard on a glowing rune dais: an open iron-banded chest spilling gold, a mountain of coins, a jewelled crown, goblets, loose gems, a scepter, a sack, magic crystals and a floating orb.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette
const GOLD = "#ffc933";
const GOLD_LT = "#ffe27a";
const GOLD_OR = "#f2a024";
const SILVER = "#d3dcf0";
const COPPER = "#d27a3e";
const IRON = "#2a2e52";
const IRON_LT = "#4b5496";
const VELVET = "#c4163f";
const VELVET_DK = "#7a0c2e";
const STONE = "#3a3f66";
const PEARL = "#fff1ee";
const GEMS = {
  ruby: "#ff2650",
  sapphire: "#2f7bff",
  emerald: "#19e08c",
  amethyst: "#b84dff",
  topaz: "#ffa826",
  cyan: "#47eaff",
  rose: "#ff6bbd",
  diamond: "#e8fbff",
} as const;
type GemKey = keyof typeof GEMS;
const GEM_KEYS = Object.keys(GEMS) as GemKey[];

// ---------------------------------------------------------------------------------------------------------------
// Paints (hand-painted: warm highlight top-front, cool deep shadow underneath)
const goldPaint = (seed = 1) =>
  paint((p, n) => {
    const l = n.y * 0.62 + n.z * 0.34 + n.x * 0.18;
    let c = mix("#9c4d0c", "#ffcb36", smoothstep(-0.6, 0.5, l));
    if (l > 0.62) c = mix(c, "#fff6b0", Math.min(1, (l - 0.62) * 2.6));
    return mix(c, "#ff8f1c", noise(p, 0.07, seed) * 0.16);
  });

const silverPaint = paint((_p, n) => {
  const l = n.y * 0.6 + n.z * 0.35 + n.x * 0.2;
  let c = mix("#3a4580", "#cfdcff", smoothstep(-0.6, 0.5, l));
  if (l > 0.65) c = mix(c, "#ffffff", Math.min(1, (l - 0.65) * 2.6));
  return c;
});

const ironPaint = paint((p, n) => {
  const l = n.y * 0.6 + n.z * 0.35 + n.x * 0.2;
  const c = mix("#171a36", "#6a76c4", smoothstep(-0.5, 0.8, l));
  return mix(c, "#8f9be8", noise(p, 0.05, 4) * 0.12);
});

const velvetPaint = paint((_p, n) => mix(VELVET_DK, "#f0345a", smoothstep(-0.4, 0.9, n.y * 0.7 + n.z * 0.3)));

const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const BOARDS = [
  grain("#8a4a2c", "#6a3320", { size: 0.025, axis: "x", seed: 1 }),
  grain("#9a5632", "#74381f", { size: 0.025, axis: "x", seed: 2 }),
  grain("#7c4129", "#5b2c1b", { size: 0.025, axis: "x", seed: 3 }),
];
/** Painted planks: `coord` runs across the planks, one board per `period`. */
const wood = (coord: (p: THREE.Vector3, n: THREE.Vector3) => number, period: number, vertical = false) =>
  paint((p, n) => {
    const c = coord(p, n) / period;
    const f = c - Math.floor(c);
    const edge = Math.min(f, 1 - f) * period;
    const i = Math.floor(c);
    let col = BOARDS[Math.floor(hash(i) * 3) % 3].at(vertical ? new THREE.Vector3(p.z, p.y, p.x) : p, n);
    col = mix(col, "#ffd9a0", 0.2 * Math.max(0, n.y) + 0.08 * Math.max(0, n.z));
    if (edge < 0.005) return mix(col, "#2a1209", 0.85);
    if (edge < 0.016) return mix(col, "#3a1b0e", 0.35);
    return col;
  });

const heapPaint = paint((p, n) => {
  const c = cells(p, 0.085, 3);
  const edge = smoothstep(0.0, 0.07, c.d2 - c.d1);
  const l = Math.min(1, Math.max(0, n.y * 0.8 + n.z * 0.25 + n.x * 0.1));
  const tone =
    c.id > 0.94 ? "#cfd8ee" : c.id > 0.8 ? GOLD_LT : c.id > 0.45 ? GOLD : c.id > 0.2 ? GOLD_OR : "#e88a1c";
  let col = mix("#8a420a", tone, smoothstep(0.05, 0.85, l));
  col = mix(col, "#fff8c0", Math.max(0, (c.d1 < 0.25 ? 0.25 - c.d1 : 0) * 1.4) * l);
  col = mix("#5a2a08", col, 0.35 + 0.65 * edge);
  return mix(col, "#6b300a", smoothstep(0.2, 0.065, p.y) * 0.55);
});

// ---------------------------------------------------------------------------------------------------------------
// Heap height field (coin mountain), dais and the chest
const DAIS_C = { x: 0, z: -0.05 };
const DAIS_TOP = 0.06;
const MOUNDS: [number, number, number, number][] = [
  [0.15, 0.15, 0.8, 0.36],
  [-0.3, -0.03, 0.55, 0.3],
  [-0.58, 0.42, 0.45, 0.16],
  [0.72, 0.3, 0.42, 0.18],
  [0.62, -0.32, 0.45, 0.25],
  [0.0, 0.82, 0.42, 0.07],
  [-0.95, 0.12, 0.32, 0.08],
];
const heapH = (x: number, z: number) => {
  let h = 0;
  for (const [mx, mz, r, mh] of MOUNDS) {
    const d2 = ((x - mx) ** 2 + (z - mz) ** 2) / (r * r);
    if (d2 < 1) h += mh * (1 - d2) ** 2;
  }
  return h * (1 + 0.1 * Math.sin(x * 9 + z * 5) * Math.sin(z * 7 - x * 3));
};
const ground = (x: number, z: number) => DAIS_TOP + heapH(x, z);
const groundN = (x: number, z: number) => {
  const e = 0.02;
  const gx = (ground(x + e, z) - ground(x - e, z)) / (2 * e);
  const gz = (ground(x, z + e) - ground(x, z - e)) / (2 * e);
  return new THREE.Vector3(-gx, 1, -gz).normalize();
};

const CH = { x: -0.3, z: -0.42, w: 0.9, d: 0.55, y0: DAIS_TOP, top: 0.46 };
const inChest = (x: number, z: number, m = 0) =>
  Math.abs(x - CH.x) < CH.w / 2 + m && Math.abs(z - CH.z) < CH.d / 2 + m;
const chestGold = (x: number, z: number) => {
  const dx = (x - CH.x) / 0.4;
  const dz = (z - CH.z) / 0.23;
  const d = 1 - (dx * dx + dz * dz);
  return 0.4 + 0.17 * Math.max(0, d) ** 0.8 + 0.01 * Math.sin(x * 25 + z * 17);
};

// ---------------------------------------------------------------------------------------------------------------
// Textures
const coinTex = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffffff"/>
  <circle cx="32" cy="32" r="27" fill="none" stroke="#9a9a9a" stroke-width="3"/>
  <circle cx="32" cy="32" r="22" fill="#d6d6d6"/>
  <polygon points="32,12 37,26 52,27 40,36 44,50 32,42 20,50 24,36 12,27 27,26" fill="#8a8a8a"/>
  <circle cx="32" cy="32" r="5" fill="#f4f4f4"/></svg>`,
  { size: 128 },
);
const sparkTex = svg(
  `<svg viewBox="0 0 64 64"><polygon points="32,0 38,26 64,32 38,38 32,64 26,38 0,32 26,26" fill="#fff4b8"/>
  <polygon points="32,12 35,29 52,32 35,35 32,52 29,35 12,32 29,29" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const rayTex = svg(
  `<svg viewBox="0 0 16 128"><polygon points="8,0 16,128 0,128" fill="#fff0a0"/><polygon points="8,24 12,128 4,128" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const runeSvg = (() => {
  let s = `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="none" stroke="#52f0ff" stroke-width="2.4"/>
  <circle cx="100" cy="100" r="82" fill="none" stroke="#52f0ff" stroke-width="2.4"/>
  <circle cx="100" cy="100" r="90" fill="none" stroke="#ffd45a" stroke-width="1.4" stroke-dasharray="3 3"/>`;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const px = (r: number, t: number) => `${(100 + ca * r - sa * t).toFixed(1)},${(100 + sa * r + ca * t).toFixed(1)}`;
    if (i % 3 === 0)
      s += `<polygon points="${px(84, 0)} ${px(94, 4)} ${px(94, -4)}" fill="#ffd45a"/>`;
    else if (i % 3 === 1) s += `<polyline points="${px(85, -3)} ${px(90, 0)} ${px(95, -3)} ${px(90, 3)} ${px(85, -3)}" fill="none" stroke="#52f0ff" stroke-width="2"/>`;
    else s += `<circle cx="${(100 + ca * 90).toFixed(1)}" cy="${(100 + sa * 90).toFixed(1)}" r="2.4" fill="#ff7be0"/>`;
  }
  return s + `</svg>`;
})();
const runeTex = svg(runeSvg, { size: 768 });
const scrollL = svg(
  `<svg viewBox="0 0 100 70"><g fill="none" stroke-linecap="round">
  <path d="M6 58 C 6 20, 46 6, 62 22 S 70 54, 48 48 S 38 28, 54 28" stroke="#5a2406" stroke-width="7"/>
  <path d="M6 58 C 6 20, 46 6, 62 22 S 70 54, 48 48 S 38 28, 54 28" stroke="#ffcf3a" stroke-width="3.4"/>
  <path d="M30 62 C 44 60, 66 66, 94 40" stroke="#5a2406" stroke-width="6"/>
  <path d="M30 62 C 44 60, 66 66, 94 40" stroke="#ffe27a" stroke-width="2.6"/></g>
  <circle cx="54" cy="28" r="4.5" fill="#ff2650" stroke="#5a2406" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const scrollR = svg(
  `<svg viewBox="0 0 100 70"><g transform="translate(100 0) scale(-1 1)"><g fill="none" stroke-linecap="round">
  <path d="M6 58 C 6 20, 46 6, 62 22 S 70 54, 48 48 S 38 28, 54 28" stroke="#5a2406" stroke-width="7"/>
  <path d="M6 58 C 6 20, 46 6, 62 22 S 70 54, 48 48 S 38 28, 54 28" stroke="#ffcf3a" stroke-width="3.4"/>
  <path d="M30 62 C 44 60, 66 66, 94 40" stroke="#5a2406" stroke-width="6"/>
  <path d="M30 62 C 44 60, 66 66, 94 40" stroke="#ffe27a" stroke-width="2.6"/></g>
  <circle cx="54" cy="28" r="4.5" fill="#ff2650" stroke="#5a2406" stroke-width="1.5"/></g></svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("lid", {
    parent: root,
    at: [CH.x, CH.top, CH.z - CH.d / 2],
    aim: [CH.x, CH.top, CH.z + 1],
    role: "hinge",
  });
  const orbJ = b.joint("orb", { parent: root, at: [0.2, 1.08, 0.12], role: "hinge" });
  const R = rng(41);
  const on = { bone: root };

  // -------------------------------------------------------------------------------------------------------------
  // Merge buckets: many small same-colour pieces become one part per bone and colour
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const stash = (key: string, g: THREE.BufferGeometry, m: THREE.Matrix4) => {
    const c = g.clone().applyMatrix4(m);
    const ni = c.index ? c.toNonIndexed() : c;
    ni.computeVertexNormals();
    let list = buckets.get(key);
    if (!list) buckets.set(key, (list = []));
    list.push(ni);
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const place = (pos: THREE.Vector3, dir: THREE.Vector3, scale: THREE.Vector3 | number, spin = 0) => {
    const q = aim(dir).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (spin * Math.PI) / 180));
    const s = typeof scale === "number" ? V(scale, scale, scale) : scale;
    return new THREE.Matrix4().compose(pos, q, s);
  };

  // gem geometry, centred, unit radius
  const lat = (pts: [number, number][], seg: number) =>
    new THREE.LatheGeometry(
      pts.map(([x, y]) => new THREE.Vector2(x, y)),
      seg,
    );
  const brill = (seg: number) =>
    lat(
      [
        [0, -0.55],
        [1, 0.05],
        [1, 0.14],
        [0.6, 0.5],
        [0, 0.5],
      ],
      seg,
    );
  const GEO = {
    br8: brill(8),
    br6: brill(6),
    br4: brill(4),
    oct: new THREE.OctahedronGeometry(1, 0),
    cab: new THREE.SphereGeometry(1, 6, 4),
    shard: lat(
      [
        [0, -0.5],
        [0.5, -0.1],
        [0.5, 0.2],
        [0, 0.6],
      ],
      5,
    ),
  };
  type GeoKey = keyof typeof GEO;
  const gem = (c: GemKey, kind: GeoKey, pos: THREE.Vector3, dir: THREE.Vector3, r: number, squash = 0.9, spin = 0) =>
    stash(`gem:${c}`, GEO[kind], place(pos, dir, V(r, r * squash, r), spin));
  const gemOnGround = (c: GemKey, x: number, z: number, r: number) => {
    const n = groundN(x, z);
    const d = n.clone().add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(1.4)).normalize();
    const kind: GeoKey = (["br8", "br8", "br6", "br4", "oct"] as GeoKey[])[Math.floor(R() * 5)];
    gem(c, kind, V(x, ground(x, z) + r * 0.45, z), d, r, kind === "oct" ? 1.5 : 0.9, R() * 90);
  };

  const COIN = new THREE.CylinderGeometry(0.056, 0.056, 0.014, 8, 1);
  const coinKeys: [string, string][] = [
    ["gold", GOLD],
    ["pale", GOLD_LT],
    ["amber", GOLD_OR],
    ["silver", SILVER],
    ["copper", COPPER],
  ];
  const coin = (pos: THREE.Vector3, dir: THREE.Vector3, key = "", spin = R() * 360) => {
    const pick = key || (["gold", "gold", "gold", "pale", "pale", "amber", "amber", "silver", "copper"] as string[])[Math.floor(R() * 9)];
    stash(`coin:${pick}`, COIN, place(pos, dir, 1, spin));
  };
  const coinOnGround = (x: number, z: number, tiltAmt = 0.45, lift = 0.006, key = "") => {
    const n = groundN(x, z);
    const d = n.clone().add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(tiltAmt)).normalize();
    coin(V(x, ground(x, z) + lift + (1 - d.y) * 0.03, z), d, key);
  };

  // -------------------------------------------------------------------------------------------------------------
  // Dais
  const dais = b.lathe(
    [
      [0, 0],
      [1.3, 0],
      [1.3, 0.035],
      [1.24, DAIS_TOP],
      [0, DAIS_TOP],
    ],
    {
      at: [DAIS_C.x, 0, DAIS_C.z],
      segments: 24,
      color: paint((p, n) => {
        if (n.y < 0.5) return mix("#1d2040", "#3a3f66", noise(p, 0.1, 2));
        const c = cells(p, 0.3, 8);
        const edge = smoothstep(0, 0.06, c.d2 - c.d1);
        const col = mix("#2b2f55", "#454b7c", c.id);
        return mix("#14172e", mix(col, "#5a62a0", noise(p, 0.08, 3) * 0.3), edge);
      }),
      ...on,
    },
  );
  void dais;
  const ring = b.part(new THREE.CircleGeometry(1.2, 48), "#ffffff", {
    at: [DAIS_C.x, DAIS_TOP + 0.003, DAIS_C.z],
    dir: [0, 1, 0],
    axis: "z",
    texture: runeTex,
    ...on,
  });
  glow(ring, 1);
  // dais rim studs: small gold boulders around the edge
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.1;
    stash(
      "rim",
      new THREE.OctahedronGeometry(1, 0),
      place(V(Math.sin(a) * 1.3, 0.04, DAIS_C.z + Math.cos(a) * 1.3), V(Math.sin(a), 1, Math.cos(a)), V(0.07, 0.05, 0.07), i * 40),
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Coin mountain mesh
  const hg = new THREE.PlaneGeometry(2.6, 2.4, 44, 40);
  hg.rotateX(-Math.PI / 2);
  const hp = hg.attributes.position;
  for (let i = 0; i < hp.count; i++) {
    const x = hp.getX(i);
    const z = hp.getZ(i) + 0.1;
    hp.setXYZ(i, x, DAIS_TOP - 0.006 + heapH(x, z), z);
  }
  b.part(hg, heapPaint, { at: [0, 0, 0], flat: true, ...on, name: "coinMountain" });

  // -------------------------------------------------------------------------------------------------------------
  // Chest body
  const cx = CH.x;
  const cz = CH.z;
  const hw = CH.w / 2;
  const hd = CH.d / 2;
  const wy0 = CH.y0 + 0.05;
  const wh = CH.top - wy0;
  const box = (sx: number, sy: number, sz: number, x: number, y: number, z: number, color: Parameters<typeof b.part>[2], extra = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: [x, y, z], ...on, ...extra });

  const plankFront = wood((p) => p.y, 0.1167);
  const plankSide = wood((p) => p.y, 0.1167, true);
  box(CH.w + 0.04, 0.05, CH.d + 0.04, cx, CH.y0 + 0.025, cz, ironPaint, { name: "chestPlinth" });
  box(CH.w, wh, 0.04, cx, wy0 + wh / 2, cz + hd - 0.02, plankFront, { name: "chestFront" });
  box(CH.w, wh, 0.04, cx, wy0 + wh / 2, cz - hd + 0.02, plankFront, { name: "chestBack" });
  for (const s of [1, -1]) box(0.04, wh, CH.d - 0.08, cx + s * (hw - 0.02), wy0 + wh / 2, cz, plankSide, { name: "chestSide" });
  box(CH.w - 0.08, 0.04, CH.d - 0.08, cx, wy0 + 0.02, cz, "#2a1209", { name: "chestFloor" });
  // corner posts and rim trim
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.075, wh + 0.03, 0.075, cx + sx * (hw - 0.0), wy0 + (wh + 0.03) / 2 - 0.015, cz + sz * (hd - 0.0), ironPaint, { name: "cornerPost" });
      box(0.09, 0.03, 0.09, cx + sx * hw, CH.top + 0.005, cz + sz * hd, goldPaint(2), { name: "cornerCap" });
      stash("rivet", new THREE.SphereGeometry(0.014, 5, 3), new THREE.Matrix4().makeTranslation(cx + sx * (hw + 0.038), wy0 + 0.06, cz + sz * (hd + 0.0)));
      stash("rivet", new THREE.SphereGeometry(0.014, 5, 3), new THREE.Matrix4().makeTranslation(cx + sx * (hw + 0.038), CH.top - 0.07, cz + sz * (hd + 0.0)));
    }
  box(CH.w, 0.03, 0.05, cx, CH.top - 0.01, cz + hd - 0.025, goldPaint(3), { name: "rimFront" });
  box(CH.w, 0.03, 0.05, cx, CH.top - 0.01, cz - hd + 0.025, goldPaint(3), { name: "rimBack" });
  for (const s of [1, -1]) box(0.05, 0.03, CH.d, cx + s * (hw - 0.025), CH.top - 0.01, cz, goldPaint(3), { name: "rimSide" });
  // front straps, studs, lock plate
  for (const s of [1, -1]) {
    box(0.075, wh, 0.014, cx + s * 0.29, wy0 + wh / 2, cz + hd + 0.006, ironPaint, { name: "strap" });
    for (let k = 0; k < 4; k++)
      stash("rivet", new THREE.SphereGeometry(0.014, 5, 3), new THREE.Matrix4().makeTranslation(cx + s * 0.29, wy0 + 0.045 + k * 0.095, cz + hd + 0.016));
    // gold filigree panels
    b.part(new THREE.PlaneGeometry(0.2, 0.14), "#ffffff", {
      at: [cx + s * 0.15, wy0 + wh / 2 - 0.01, cz + hd + 0.004],
      dir: [0, 0, 1],
      axis: "z",
      texture: s > 0 ? scrollR : scrollL,
      ...on,
    });
  }
  const plate = b.extrude(
    [
      [-0.075, 0.07],
      [0.075, 0.07],
      [0.085, 0.0],
      [0.05, -0.08],
      [0, -0.1, "sharp"],
      [-0.05, -0.08],
      [-0.085, 0.0],
    ],
    { at: [cx, wy0 + wh - 0.1, cz + hd + 0.012], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.022, bevel: 0.007, color: goldPaint(5), ...on, name: "lockPlate" },
  );
  void plate;
  glow(
    b.extrude(
      [
        [-0.018, 0.02],
        [0.018, 0.02],
        [0.012, -0.012],
        [0.026, -0.05],
        [-0.026, -0.05],
        [-0.012, -0.012],
      ],
      { at: [cx, wy0 + wh - 0.105, cz + hd + 0.026], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.006, color: GEMS.cyan, ...on, name: "keyhole" },
    ),
    1,
  );
  gem("ruby", "br8", V(cx, wy0 + wh - 0.02, cz + hd + 0.03), V(0, 0.05, 1), 0.03, 0.7);
  // feet
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      b.part(new THREE.SphereGeometry(0.05, 6, 4), goldPaint(6), { at: [cx + sx * (hw - 0.03), CH.y0 + 0.005, cz + sz * (hd - 0.03)], scale: [1, 0.55, 1], ...on, name: "chestFoot" });

  // gold inside the chest
  const ig = new THREE.PlaneGeometry(0.84, 0.5, 20, 12);
  ig.rotateX(-Math.PI / 2);
  const ip = ig.attributes.position;
  for (let i = 0; i < ip.count; i++) {
    const x = ip.getX(i) + cx;
    const z = ip.getZ(i) + cz;
    ip.setXYZ(i, x, chestGold(x, z), z);
  }
  b.part(ig, heapPaint, { at: [0, 0, 0], flat: true, ...on, name: "chestGold" });
  // coins and gems on the chest gold
  for (let i = 0; i < 70; i++) {
    const x = cx + (R() - 0.5) * 0.74;
    const z = cz + (R() - 0.5) * 0.4;
    const y = chestGold(x, z);
    const d = V((R() - 0.5) * 0.6, 1, (R() - 0.5) * 0.6).normalize();
    coin(V(x, y + 0.008, z), d);
  }
  const chestGems: [GemKey, number, number, number][] = [
    ["ruby", -0.2, 0.05, 0.05],
    ["sapphire", 0.12, -0.05, 0.045],
    ["emerald", 0.28, 0.08, 0.04],
    ["amethyst", -0.02, 0.09, 0.04],
    ["topaz", -0.3, -0.1, 0.038],
    ["rose", 0.2, -0.12, 0.034],
    ["diamond", 0.05, 0.0, 0.05],
  ];
  for (const [c, ox, oz, r] of chestGems) {
    const x = cx + ox;
    const z = cz + oz;
    gem(c, c === "diamond" ? "br8" : R() > 0.5 ? "br6" : "br8", V(x, chestGold(x, z) + r * 0.5, z), V(R() - 0.5, 1, R() - 0.5), r, 0.9, R() * 90);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Lid (built closed, then swung open about the back edge)
  const LR = hd;
  const LV = 0.3;
  const archPts = (rx: number, ry: number, from: number, to: number, n: number) => {
    const out: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const a = from + ((to - from) * i) / n;
      out.push([rx * Math.cos(a), ry * Math.sin(a)]);
    }
    return out;
  };
  const arch = (outerR: number, outerV: number, inner: number) => {
    const o = archPts(outerR, outerV, 0, Math.PI, 12);
    const i = archPts(outerR - inner, outerV - inner, Math.PI, 0, 12);
    return [...o, ...i];
  };
  const lidAt: [number, number, number] = [cx, CH.top, cz];
  const lidWood = wood(
    (p) => Math.atan2((p.y - CH.top) / LV, (p.z - cz) / LR) * 57.2958,
    22,
  );
  b.extrude(arch(LR, LV, 0.036), { at: lidAt, thickness: CH.w, color: lidWood, bone: lid, name: "lidShell" });
  b.extrude(arch(LR - 0.037, LV - 0.037, 0.016), { at: lidAt, thickness: CH.w - 0.05, color: velvetPaint, bone: lid, name: "lidLining" });
  for (const s of [1, -1]) {
    b.extrude([...archPts(LR, LV, 0, Math.PI, 12)], { at: [cx + s * (hw - 0.02), CH.top, cz], thickness: 0.04, color: ironPaint, bone: lid, name: "lidEnd" });
    b.extrude(archPts(LR + 0.012, LV + 0.012, 0, Math.PI, 12), { at: [cx + s * (hw + 0.004), CH.top, cz], thickness: 0.016, color: goldPaint(7), bone: lid, name: "lidEndTrim" });
  }
  for (const ox of [-0.29, 0.29, 0, -0.43, 0.43]) {
    const w = ox === 0 ? 0.1 : ox === -0.43 || ox === 0.43 ? 0.05 : 0.075;
    b.extrude(arch(LR + 0.016, LV + 0.016, 0.026), { at: [cx + ox, CH.top, cz], thickness: w, color: ox === 0 ? goldPaint(8) : ironPaint, bone: lid, name: "lidBand" });
  }
  for (const ox of [-0.29, 0.29])
    for (let k = 0; k < 5; k++) {
      const a = Math.PI * (0.1 + 0.2 * k);
      stash("lidRivet", new THREE.SphereGeometry(0.014, 5, 3), new THREE.Matrix4().makeTranslation(cx + ox, CH.top + (LV + 0.02) * Math.sin(a), cz + (LR + 0.02) * Math.cos(a)));
    }
  // lid crest: gold shield with a big gem on top and hasp tongue in front
  b.extrude(
    [
      [-0.07, -0.05],
      [0.07, -0.05],
      [0.07, 0.04],
      [0, 0.1, "sharp"],
      [-0.07, 0.04],
    ],
    { at: [cx, CH.top + LV + 0.03, cz], x: [-1, 0, 0], y: [0, 0, -1], thickness: 0.026, bevel: 0.008, color: goldPaint(9), bone: lid, name: "lidCrest" },
  );
  stash("lidGem", GEO.br8, place(V(cx, CH.top + LV + 0.062, cz), V(0, 1, 0), V(0.05, 0.045, 0.05)));
  b.extrude(
    [
      [-0.032, 0.02],
      [0.032, 0.02],
      [0.032, -0.1],
      [0, -0.135, "sharp"],
      [-0.032, -0.1],
    ],
    { at: [cx, CH.top - 0.0, cz + LR + 0.036], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: goldPaint(10), bone: lid, name: "hasp" },
  );
  b.part(new THREE.TorusGeometry(0.022, 0.007, 5, 8), goldPaint(11), { at: [cx, CH.top + 0.01, cz + LR + 0.055], bone: lid, name: "haspRing" });

  // -------------------------------------------------------------------------------------------------------------
  // Crown (tilted, resting on the left of the heap)
  const crownPos = V(-0.58, 0, 0.45);
  crownPos.y = ground(crownPos.x, crownPos.z) + 0.1;
  const crownQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.42, 0.5, -0.2, "YXZ"));
  const CM = new THREE.Matrix4().compose(crownPos, crownQ, V(1, 1, 1));
  const CP = (x: number, y: number, z: number) => V(x, y, z).applyMatrix4(CM);
  const CD = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(crownQ);
  const cAt = (x: number, y: number, z: number): [number, number, number] => CP(x, y, z).toArray() as [number, number, number];
  const cAx = CD(0, 1, 0).toArray() as [number, number, number];
  const gPaint = goldPaint(12);
  b.lathe(
    [
      [0.215, 0],
      [0.245, 0.12],
      [0.228, 0.12],
      [0.2, 0],
    ],
    {
      at: cAt(0, 0, 0),
      axis: cAx,
      segments: 12,
      color: paint((p, n, s) => {
        const deg = s[1];
        const dia = Math.abs(((deg + s[0] * 300) % 40) - 20) / 20;
        const dia2 = Math.abs(((deg - s[0] * 300 + 400) % 40) - 20) / 20;
        const c = gPaint.at(p, n);
        if (s[0] > 0.03 && s[0] < 0.1 && (dia < 0.12 || dia2 < 0.12)) return mix(c, "#7a3a08", 0.7);
        return c;
      }),
      ...on,
      name: "crownBand",
    },
  );
  for (const [h, r] of [
    [0.0, 0.215],
    [0.12, 0.245],
  ] as const)
    b.lathe(
      [
        [r - 0.012, h - 0.014],
        [r + 0.02, h],
        [r - 0.012, h + 0.014],
        [r - 0.03, h],
      ],
      { at: cAt(0, 0, 0), axis: cAx, segments: 12, color: goldPaint(13), ...on, name: "crownRim" },
    );
  b.lathe(
    [
      [0, 0.24],
      [0.09, 0.225],
      [0.17, 0.16],
      [0.215, 0.07],
      [0.2, 0.0],
      [0, 0.0],
    ],
    { at: cAt(0, 0, 0), axis: cAx, segments: 12, color: velvetPaint, ...on, name: "crownCap" },
  );
  const spikeT = [
    [-0.07, 0],
    [0.07, 0],
    [0.052, 0.08],
    [0.034, 0.17],
    [0.012, 0.26],
    [0, 0.3, "sharp"],
    [-0.012, 0.26],
    [-0.034, 0.17],
    [-0.052, 0.08],
  ] as const;
  const spikeS = [
    [-0.06, 0],
    [0.06, 0],
    [0.04, 0.06],
    [0.012, 0.13],
    [0, 0.16, "sharp"],
    [-0.012, 0.13],
    [-0.04, 0.06],
  ] as const;
  const crownGemCols: GemKey[] = ["ruby", "sapphire", "emerald", "amethyst", "topaz", "cyan"];
  const NSP = 12;
  for (let k = 0; k < NSP; k++) {
    const th = (k / NSP) * Math.PI * 2;
    const o = V(Math.sin(th), 0, Math.cos(th));
    const t = V(Math.cos(th), 0, -Math.sin(th));
    const tall = k % 2 === 0;
    const lean = tall ? 0.22 : 0.1;
    const up = V(0, 1, 0).multiplyScalar(Math.cos(lean)).add(o.clone().multiplyScalar(Math.sin(lean)));
    const base = o.clone().multiplyScalar(0.226).setY(0.115);
    b.extrude(tall ? [...spikeT] : [...spikeS], {
      at: CP(base.x, base.y, base.z).toArray(),
      x: CD(t.x, t.y, t.z).toArray(),
      y: CD(up.x, up.y, up.z).toArray(),
      thickness: 0.03,
      bevel: 0.008,
      color: gPaint,
      ...on,
      name: "crownPoint",
    });
    const tipH = tall ? 0.305 : 0.165;
    const tip = base.clone().add(up.clone().multiplyScalar(tipH));
    const tc = crownGemCols[(k >> 1) % crownGemCols.length];
    if (tall) {
      gem(tc, "oct", CP(tip.x, tip.y, tip.z), CD(up.x, up.y, up.z), 0.033, 1.3, th * 57);
      const mid = base.clone().add(up.clone().multiplyScalar(0.12)).add(o.clone().multiplyScalar(0.018));
      gem("diamond", "br6", CP(mid.x, mid.y, mid.z), CD(o.x, o.y, o.z), 0.02, 0.8);
      stash("pearl", new THREE.SphereGeometry(0.026, 6, 4), new THREE.Matrix4().makeTranslation(...(CP(base.x + o.x * 0.02, base.y - 0.012, base.z + o.z * 0.02).toArray() as [number, number, number])));
    } else {
      stash("pearl", new THREE.SphereGeometry(0.03, 6, 5), new THREE.Matrix4().makeTranslation(...(CP(tip.x, tip.y + 0.012, tip.z).toArray() as [number, number, number])));
    }
    // band gems: big cabochon under every tall spike
    if (tall) {
      const bp = o.clone().multiplyScalar(0.243).setY(0.07);
      gem(tc, "br8", CP(bp.x, bp.y, bp.z), CD(o.x * 0.9, 0.5, o.z * 0.9), 0.042, 0.55, 0);
    } else {
      const bp = o.clone().multiplyScalar(0.241).setY(0.062);
      gem("diamond", "br6", CP(bp.x, bp.y, bp.z), CD(o.x, 0.4, o.z), 0.022, 0.7, 0);
    }
  }
  // front-facing crown centre medallion (front is local +Z)
  gem("ruby", "br8", CP(0, 0.18, 0.285), CD(0, 0.25, 1), 0.04, 0.7);

  // -------------------------------------------------------------------------------------------------------------
  // Goblets
  const gobletOutline: [number, number][] = [
    [0, 0],
    [0.085, 0],
    [0.09, 0.016],
    [0.065, 0.034],
    [0.028, 0.06],
    [0.022, 0.13],
    [0.045, 0.145],
    [0.05, 0.168],
    [0.03, 0.188],
    [0.025, 0.215],
    [0.07, 0.245],
    [0.108, 0.3],
    [0.115, 0.36],
    [0.112, 0.42],
    [0.102, 0.42],
    [0.099, 0.36],
    [0.092, 0.3],
    [0.055, 0.262],
    [0, 0.255],
  ];
  const chalice = (metal: ReturnType<typeof paint>, bandCol: string, seed: number) =>
    paint((p, n, s) => {
      const c = metal.at(p, n);
      const h = s[0];
      const deg = s[1];
      if (h > 0.31 && h < 0.35) {
        const dia = Math.abs(((deg + seed) % 45) - 22.5) / 22.5;
        return dia < 0.55 ? mix(bandCol, c, 0.15) : mix(c, "#1a0f08", 0.55);
      }
      if (Math.abs(h - 0.388) < 0.006 || Math.abs(h - 0.285) < 0.005 || Math.abs(h - 0.158) < 0.005) return mix(c, "#5a2406", 0.6);
      if (h > 0.37 && h < 0.4) return mix(c, "#fff6c0", 0.25);
      return c;
    });
  const gobletAt = (pos: THREE.Vector3, dir: THREE.Vector3, metal: ReturnType<typeof paint>, band: string, seed: number, scale = 1) => {
    const d = dir.clone().normalize();
    const o = gobletOutline.map(([x, y]) => [x * scale, y * scale] as [number, number]);
    b.lathe(o, { at: pos.toArray(), axis: d.toArray(), segments: 12, color: chalice(metal, band, seed), ...on, name: "goblet" });
    // jewels around the bowl at height 0.3
    const q = aim(d);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + seed;
      const local = V(Math.sin(a), 0, Math.cos(a));
      const radial = local.clone().applyQuaternion(q);
      const p = pos.clone().add(d.clone().multiplyScalar(0.33 * scale)).add(radial.clone().multiplyScalar(0.114 * scale));
      gem(crownGemCols[k % 6], "br8", p, radial, 0.024 * scale, 0.6);
    }
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + seed + 0.5;
      const radial = V(Math.sin(a), 0, Math.cos(a)).applyQuaternion(q);
      stash("pearl", new THREE.SphereGeometry(0.02 * scale, 5, 4), new THREE.Matrix4().makeTranslation(...(pos.clone().add(d.clone().multiplyScalar(0.145 * scale)).add(radial.multiplyScalar(0.05 * scale)).toArray() as [number, number, number])));
    }
    return q;
  };
  // hero gold goblet, standing on the heap
  const g1x = 0.2;
  const g1z = 0.62;
  const g1n = groundN(g1x, g1z);
  const g1dir = g1n.clone().multiplyScalar(0.4).add(V(0, 1, 0).multiplyScalar(0.6)).normalize();
  const g1pos = V(g1x, ground(g1x, g1z) - 0.012, g1z);
  gobletAt(g1pos, g1dir, goldPaint(14), GEMS.ruby, 3);
  // gems heaped in the bowl
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const rr = k === 6 ? 0 : 0.05;
    const p = g1pos.clone().add(g1dir.clone().multiplyScalar(0.395)).add(V(Math.sin(a) * rr, 0.0, Math.cos(a) * rr));
    gem(crownGemCols[k % 6], k % 2 ? "br8" : "oct", p, V(Math.sin(a) * 0.4, 1, Math.cos(a) * 0.4), 0.04, k % 2 ? 0.8 : 1.4, k * 47);
  }
  // knocked-over silver goblet with spilled coins (right front)
  const g2dir = V(0.86, 0.26, 0.42).normalize();
  const g2pos = V(0.58, 0, 0.2);
  g2pos.y = ground(g2pos.x, g2pos.z) + 0.1;
  gobletAt(g2pos, g2dir, silverPaint, GEMS.sapphire, 1.2);
  const mouth = g2pos.clone().add(g2dir.clone().multiplyScalar(0.38));
  for (let k = 0; k < 14; k++) {
    const t = 0.02 + k * 0.032 + R() * 0.02;
    const x = mouth.x + g2dir.x * t * 2.2 + (R() - 0.5) * 0.14;
    const z = mouth.z + g2dir.z * t * 2.2 + (R() - 0.5) * 0.14;
    coinOnGround(x, z, 0.5, 0.01, "gold");
  }
  // small copper cup, standing at the back of the heap by the crystals
  const g3x = 0.35;
  const g3z = -0.2;
  gobletAt(V(g3x, ground(g3x, g3z) - 0.01, g3z), groundN(g3x, g3z).multiplyScalar(0.3).add(V(0, 0.7, 0)), goldPaint(15), GEMS.emerald, 5, 0.72);
  gem("topaz", "br8", V(g3x, ground(g3x, g3z) + 0.275, g3z), V(0, 1, 0), 0.04, 0.8);

  // -------------------------------------------------------------------------------------------------------------
  // Crystals (right back): glowing hex prisms
  const cBase = V(0.62, 0, -0.5);
  const cryst: [number, number, number, number, number, string][] = [
    [0, 0, 0.1, 0.78, 0.0, GEMS.cyan],
    [-0.2, -0.05, 0.075, 0.52, -0.38, GEMS.amethyst],
    [0.2, 0.07, 0.08, 0.58, 0.4, GEMS.cyan],
    [0.07, 0.2, 0.062, 0.36, 0.55, GEMS.rose],
    [-0.1, 0.17, 0.055, 0.3, -0.5, GEMS.amethyst],
    [0.3, -0.1, 0.05, 0.3, 0.7, GEMS.cyan],
  ];
  for (const [ox, oz, r, h, lean, col] of cryst) {
    const px = cBase.x + ox;
    const pz = cBase.z + oz;
    const dir = V(Math.sin(lean) * 0.8, Math.cos(lean), Math.sin(lean * 0.6) * 0.5).normalize();
    const base = V(px, ground(px, pz) - 0.03, pz);
    const c = b.lathe(
      [
        [0, 0],
        [r, 0],
        [r * 1.06, h * 0.68],
        [r * 0.55, h * 0.88],
        [0, h],
      ],
      { at: base.toArray(), axis: dir.toArray(), segments: 6, color: col, ...on, name: "crystal" },
    );
    glow(c, 0.5);
    // inner bright core ridge
    const core = b.lathe(
      [
        [0, h * 0.08],
        [r * 0.32, h * 0.1],
        [r * 0.3, h * 0.6],
        [0, h * 0.76],
      ],
      { at: base.toArray(), axis: dir.toArray(), segments: 6, color: "#e8fdff", ...on, name: "crystalCore" },
    );
    glow(core, 1);
  }
  for (let k = 0; k < 7; k++) {
    const a = R() * Math.PI * 2;
    const x = cBase.x + Math.sin(a) * (0.35 + R() * 0.12);
    const z = cBase.z + Math.cos(a) * (0.3 + R() * 0.1);
    gem(R() > 0.5 ? "cyan" : "amethyst", "shard", V(x, ground(x, z) + 0.04, z), V(Math.sin(a) * 0.6, 1, Math.cos(a) * 0.6), 0.05, 1.2, R() * 60);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Sack of coins (left)
  const sackPos = V(-1.0, DAIS_TOP - 0.01, 0.1);
  const sackDir = V(0.22, 1, 0.1).normalize();
  const burlap = paint((p, n, s) => {
    const nz = noise(p, 0.035, 6);
    let c = mix("#a8793a", "#d0a45c", nz);
    c = mix("#5a3a14", c, smoothstep(-0.3, 0.55, n.y * 0.5 + n.z * 0.3 + 0.35));
    if (s[1] > 170 && s[1] < 190 && Math.abs(((s[0] * 40) % 1) - 0.5) < 0.18) return "#3a2208";
    if (s[0] > 0.06 && s[0] < 0.16 && s[1] > 70 && s[1] < 120) return mix("#4b6fb5", "#7aa0e0", nz);
    return c;
  });
  b.lathe(
    [
      [0, 0],
      [0.13, 0.0],
      [0.2, 0.07],
      [0.22, 0.17],
      [0.18, 0.28],
      [0.1, 0.35],
      [0.085, 0.4],
      [0.14, 0.5],
      [0.115, 0.51],
      [0.065, 0.44],
      [0.04, 0.4],
      [0, 0.4],
    ],
    { at: sackPos.toArray(), axis: sackDir.toArray(), segments: 10, smoothing: 0, color: burlap, ...on, name: "sack" },
  );
  // rope around the neck
  const sq = aim(sackDir);
  const ropePts: THREE.Vector3[] = [];
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    ropePts.push(sackPos.clone().add(V(Math.sin(a) * 0.1, 0.405, Math.cos(a) * 0.1).applyQuaternion(sq)));
  }
  b.sweep(catmull(ropePts, { closed: true }), 0.016, { color: "#e8d09a", sides: 6, ...on, name: "sackRope" });
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.3;
    const rr = k > 5 ? 0.0 : 0.045;
    const p = sackPos.clone().add(V(Math.sin(a) * rr, 0.42, Math.cos(a) * rr).applyQuaternion(sq));
    coin(p.add(V(0, 0.02 * k * 0.4, 0)), sackDir.clone().add(V(R() - 0.5, 0, R() - 0.5).multiplyScalar(0.4)).normalize());
  }
  gem("emerald", "br8", sackPos.clone().add(V(0.02, 0.5, 0.03).applyQuaternion(sq)), V(0.3, 1, 0.2), 0.04, 0.8);
  // coins spilling out of the sack mouth toward the heap
  for (let k = 0; k < 9; k++) coinOnGround(-0.88 + k * 0.034 + (R() - 0.5) * 0.06, 0.16 + (R() - 0.5) * 0.22 + k * 0.01, 0.5, 0.01);

  // -------------------------------------------------------------------------------------------------------------
  // Scepter lying across the front of the heap
  const scepA = V(-0.38, 0, 0.9);
  const scepB = V(0.55, 0, 0.92);
  scepA.y = ground(scepA.x, scepA.z) + 0.035;
  scepB.y = ground(scepB.x, scepB.z) + 0.035;
  const scepMid = scepA.clone().lerp(scepB, 0.5);
  scepMid.y = Math.max(ground(scepMid.x, scepMid.z) + 0.035, scepMid.y);
  const scepPath = catmull([scepA.toArray(), scepMid.toArray(), scepB.toArray()]);
  b.sweep(scepPath, 0.021, {
    sides: 8,
    color: paint((p, n) => {
      const g = goldPaint(16).at(p, n);
      const band = ((p.x * 18) % 1 + 1) % 1;
      return band < 0.22 ? mix(g, "#7a3a08", 0.55) : g;
    }),
    ...on,
    name: "scepterShaft",
  });
  for (const t of [0.1, 0.3, 0.5, 0.7]) {
    const pt = scepPath.at(t);
    b.part(new THREE.SphereGeometry(0.03, 6, 4), goldPaint(17), { at: pt.toArray(), scale: [1.2, 1, 1], ...on, name: "scepterBead" });
  }
  const head = scepB.clone().add(V(0.05, 0.0, 0.0));
  b.part(new THREE.SphereGeometry(0.058, 8, 6), goldPaint(18), { at: head.toArray(), ...on, name: "scepterOrb" });
  const hdir = V(1, 0, 0);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    const out = V(0.4, Math.sin(a), Math.cos(a)).normalize();
    b.spike(head, head.clone().add(out.clone().multiplyScalar(0.12)), null, 0.02, { color: goldPaint(19), ...on, name: "scepterProng" });
  }
  gem("rose", "br8", head.clone().add(hdir.clone().multiplyScalar(0.11)), V(1, 0.1, 0), 0.055, 1.0, 0);
  const tail = scepA.clone().add(V(-0.04, 0, 0));
  b.part(new THREE.ConeGeometry(0.03, 0.07, 6), goldPaint(20), { at: tail.toArray(), dir: [-1, 0, 0], ...on, name: "scepterCap" });

  // -------------------------------------------------------------------------------------------------------------
  // Pearl necklace and loose gems, coin stacks, extra coins
  const neck: THREE.Vector3[] = [];
  for (let k = 0; k <= 10; k++) {
    const u = k / 10;
    const x = -0.32 + u * 0.55;
    const z = 0.32 + Math.sin(u * Math.PI) * 0.18 - u * 0.1;
    neck.push(V(x, ground(x, z) + 0.022, z));
  }
  const nPath = catmull(neck.map((v) => v.toArray()));
  for (let k = 0; k < 28; k++) {
    const pt = nPath.at(k / 27);
    const sz = 0.019 - Math.abs(k / 27 - 0.5) * 0.008;
    stash("pearl", new THREE.SphereGeometry(sz, 5, 4), new THREE.Matrix4().makeTranslation(pt.x, pt.y, pt.z));
  }
  const pend = nPath.at(0.5);
  gem("sapphire", "br8", V(pend.x, pend.y + 0.012, pend.z + 0.01), V(0.3, 1, 0.5), 0.05, 1.1);
  const gemSpots: [number, number][] = [];
  const blocked = (x: number, z: number) =>
    inChest(x, z, 0.12) ||
    Math.hypot(x + 0.58, z - 0.45) < 0.33 ||
    Math.hypot(x - 0.2, z - 0.62) < 0.17 ||
    Math.hypot(x - 0.75, z - 0.35) < 0.4 ||
    Math.hypot(x + 1.0, z - 0.1) < 0.3 ||
    Math.hypot(x - 0.62, z + 0.5) < 0.34 ||
    Math.hypot(x - 0.35, z + 0.2) < 0.12 ||
    (z > 0.82 && x > -0.5 && x < 0.7);
  let guard = 0;
  while (gemSpots.length < 26 && guard++ < 4000) {
    const x = (R() - 0.5) * 2.2;
    const z = (R() - 0.5) * 2.0 + 0.1;
    if (ground(x, z) < DAIS_TOP + 0.03 || blocked(x, z)) continue;
    if (gemSpots.some(([a, c]) => Math.hypot(a - x, c - z) < 0.2)) continue;
    gemSpots.push([x, z]);
  }
  gemSpots.forEach(([x, z], i) => gemOnGround(GEM_KEYS[i % GEM_KEYS.length], x, z, 0.04 + R() * 0.03));
  // coins on the mountain
  let placed = 0;
  guard = 0;
  while (placed < 360 && guard++ < 20000) {
    const x = (R() - 0.5) * 2.2;
    const z = (R() - 0.5) * 2.0 + 0.1;
    const h = heapH(x, z);
    if (h < 0.02 || inChest(x, z, 0.02)) continue;
    if (R() > h * 4.2 + 0.2) continue;
    coinOnGround(x, z, 0.5);
    placed++;
  }
  // loose coins on the dais around the heap
  for (let k = 0; k < 18; k++) {
    const a = R() * Math.PI * 2;
    const rr = 0.9 + R() * 0.28;
    const x = DAIS_C.x + Math.sin(a) * rr;
    const z = DAIS_C.z + Math.cos(a) * rr;
    if (inChest(x, z, 0.05) || z < -0.8) continue;
    coin(V(x, ground(x, z) + 0.008, z), V((R() - 0.5) * 0.25, 1, (R() - 0.5) * 0.25).normalize());
  }
  // coin stacks
  for (const [sx, sz, nC] of [
    [-0.12, 1.0, 9],
    [0.05, 1.05, 6],
    [0.95, -0.02, 8],
  ] as [number, number, number][])
    for (let k = 0; k < nC; k++)
      coin(V(sx + (R() - 0.5) * 0.012, ground(sx, sz) + 0.008 + k * 0.0145, sz + (R() - 0.5) * 0.012), V((R() - 0.5) * 0.06, 1, (R() - 0.5) * 0.06).normalize(), k % 3 === 0 ? "silver" : "gold");
  // toppled stack
  for (let k = 0; k < 7; k++) {
    const x = 0.25 + k * 0.045;
    const z = 1.03 + Math.sin(k * 1.2) * 0.02;
    coin(V(x, ground(x, z) + 0.02 + k * 0.004, z), V(0.9, 0.35, 0.05 * k).normalize(), "gold");
  }
  // standing rolled coin
  coin(V(0.78, ground(0.78, 0.9) + 0.058, 0.9), V(0.02, 0.1, 1).normalize(), "pale");

  // -------------------------------------------------------------------------------------------------------------
  // Flush buckets
  for (const [key, list] of buckets) {
    const merged = mergeGeometries(list, false);
    if (!merged) throw new Error(`could not merge ${key}`);
    const [kind, name] = key.split(":");
    if (kind === "coin") {
      const tint = coinKeys.find(([k]) => k === name)![1];
      b.part(merged, tint, { at: [0, 0, 0], texture: coinTex, ...on, name: `coins_${name}` });
    } else if (kind === "gem") {
      const part = b.part(merged, GEMS[name as GemKey], { at: [0, 0, 0], ...on, name: `gems_${name}` });
      glow(part, 0.42);
    } else if (key === "pearl") b.part(merged, PEARL, { at: [0, 0, 0], ...on, name: "pearls" });
    else if (key === "rivet") b.part(merged, "#d8b060", { at: [0, 0, 0], ...on, name: "rivets" });
    else if (key === "lidRivet") b.part(merged, "#d8b060", { at: [0, 0, 0], bone: lid, name: "lidRivets" });
    else if (key === "lidGem") glow(b.part(merged, GEMS.ruby, { at: [0, 0, 0], bone: lid, name: "lidGem" }), 0.5);
    else if (key === "rim") b.part(merged, GOLD_OR, { at: [0, 0, 0], ...on, name: "daisStuds" });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Floating orb with orbit rings
  const oc = orbJ.at.clone();
  const orbBody = b.part(
    new THREE.OctahedronGeometry(1, 0),
    GEMS.diamond,
    { at: oc.toArray(), scale: [0.1, 0.15, 0.1], flat: true, bone: orbJ, name: "orb" },
  );
  glow(orbBody, 0.7);
  glow(b.part(new THREE.OctahedronGeometry(1, 0), GEMS.cyan, { at: oc.toArray(), scale: [0.065, 0.1, 0.065], rotation: [0, 45, 0], flat: true, bone: orbJ, name: "orbCore" }), 1);
  const tiltRing = (tiltX: number, tiltZ: number, rad: number, beads: number, col: string) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tiltX, 0, tiltZ));
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      pts.push(oc.clone().add(V(Math.sin(a) * rad, 0, Math.cos(a) * rad).applyQuaternion(q)));
    }
    b.sweep(catmull(pts, { closed: true }), 0.007, { color: goldPaint(21), sides: 5, bone: orbJ, name: "orbRing" });
    for (let k = 0; k < beads; k++) {
      const a = (k / beads) * Math.PI * 2 + 0.3;
      const p = oc.clone().add(V(Math.sin(a) * rad, 0, Math.cos(a) * rad).applyQuaternion(q));
      glow(b.part(new THREE.OctahedronGeometry(0.02, 0), col, { at: p.toArray(), flat: true, bone: orbJ, name: "orbBead" }), 0.8);
    }
  };
  tiltRing(0.5, 0.2, 0.2, 4, GEMS.amethyst);
  tiltRing(-0.6, -0.5, 0.26, 5, GEMS.rose);
  // light rays above the chest and sparkles
  const rayFrames = [-0.25, -0.12, 0, 0.12, 0.25].map((ox) => frame([cx + ox, 0.58, cz + ox * 0.2], [0, 1, 0]));
  glow(
    b.cards(rayFrames, rayTex, { size: [0.05, 0.5], lean: 0, flow: (_f, i) => [0, 0, i % 2 ? 1 : -1], vary: 0.3, rng: rng(5), cross: true, bone: root }),
    0.85,
  );
  const sparkFrames: ReturnType<typeof frame>[] = [];
  const sparkSpots: [number, number, number][] = [
    [-0.45, 0.75, -0.3],
    [0.1, 0.92, -0.35],
    [-0.62, 0.62, 0.05],
    [0.55, 0.78, 0.15],
    [0.38, 0.45, 0.45],
    [-0.3, 0.55, 0.5],
    [0.95, 0.5, -0.2],
    [0.15, 0.7, 0.4],
    [-0.8, 0.42, 0.4],
    [0.7, 0.35, 0.65],
    [-0.15, 0.78, 0.1],
    [0.8, 0.95, -0.5],
    [-0.5, 0.95, 0.0],
    [0.0, 0.46, 0.85],
  ];
  for (const [x, y, z] of sparkSpots) sparkFrames.push(frame([x, y, z], [0, 1, 0]));
  glow(b.cards(sparkFrames, sparkTex, { size: [0.13, 0.13], flow: [0, 0, 1], cross: true, vary: 0.35, spin: 30, rng: rng(9), sink: 0, bone: root }), 1);

  // swing the lid open
  b.pose(lid, { axis: [1, 0, 0], deg: -102 });

  return b.root;
}

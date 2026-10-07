import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { gradient, grain, paint, scales } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A treasure hoard for a stylised game level: an iron-banded wooden chest with its lid thrown open, a heap of gold coins and jewels spilling over the lip, a crown perched on the pile, two jewelled goblets, and a rune-marked flagstone underneath.",
  style: "League of Legends",
  commit: "b816db2",
};

type Vec = [number, number, number];
const DEG = Math.PI / 180;

// Layout (metres): the chest sits at the back of a 2 m flagstone, its centre at z = CZ; the heap rises from its top.
const CZ = -0.22;
const TOP = 0.56; // top face of the chest body
const COIN_R = 0.034;
const COIN_T = 0.0075;
const CROWN_S = 1.35; // the crown is exaggerated for readability from a high camera

// Palette: saturated gold and violet iron, with ruby, emerald, sapphire and amethyst accents.
const GOLD = "#f5b325";
const GOLD_HI = "#ffe27a";
const GOLD_DK = "#b8731a";
const BRONZE = "#c27418";
const IRON = "#2b1d40";
const WOOD_A = "#a25a26";
const WOOD_B = "#6b3413";
const WOOD_EDGE = "#2a1307";
const VELVET = "#6a1f9a";
const VELVET_DK = "#4a1270";
const RUBY = "#e8213f";
const EMERALD = "#1fd27a";
const SAPPHIRE = "#2f78ff";
const AMETHYST = "#b057ff";
const DIAMOND = "#e6fbff";
const CITRINE = "#ffc53d";
const CYAN = "#7ff6ff";
const STONE = ["#3f3658", "#4b4168", "#372f4f"];
const STONE_EDGE = "#170f2a";
const GEM_COLORS = [RUBY, EMERALD, SAPPHIRE, AMETHYST, DIAMOND, CITRINE];
const glowable = (c: string) => c === AMETHYST || c === SAPPHIRE || c === EMERALD;
const pick = (i: number) => GEM_COLORS[i % GEM_COLORS.length];

// Paints
const woodGrain = grain(WOOD_B, WOOD_A, { size: 0.05, axis: "x" });
const wood = paint((p, _n, _s) => (p.y % 0.13 < 0.005 ? WOOD_EDGE : woodGrain));
const stone = scales(STONE, STONE_EDGE, { size: 0.24, width: 0.025 });
const quilt = paint((p, _n, _s) =>
  (Math.floor((p.x + p.z) / 0.06) + Math.floor((p.x - p.z) / 0.06)) & 1 ? VELVET_DK : VELVET,
);
const coinField = scales([GOLD, BRONZE, GOLD_HI], GOLD_DK, { size: 0.045, width: 0.012 });

// Gem: a faceted pavilion, unit radius, point at -1.1 and table at +0.42.
const GEM: [number, number][] = [
  [0, -1.1],
  [0.62, -0.35],
  [1, 0],
  [0.92, 0.12],
  [0.58, 0.3],
  [0, 0.42],
];
function gemGeom(r: number) {
  const pts = GEM.map(([x, y]) => new THREE.Vector2(x * r, y * r));
  return new THREE.LatheGeometry(pts, 8);
}

// Goblet: outer wall up from the foot, then the inner wall back down to the bowl floor.
const GOBLET: [number, number][] = [
  [0, 0],
  [0.054, 0],
  [0.058, 0.008],
  [0.05, 0.018],
  [0.02, 0.03],
  [0.014, 0.042],
  [0.013, 0.068],
  [0.022, 0.08],
  [0.013, 0.094],
  [0.03, 0.112],
  [0.052, 0.15],
  [0.07, 0.19],
  [0.078, 0.222],
  [0.072, 0.222],
  [0.068, 0.196],
  [0.048, 0.15],
  [0.027, 0.116],
  [0, 0.112],
];

// Crown band: a closed rectangle in (radius, height), turned round the axis.
const CROWN_BAND: [number, number][] = [
  [0.094, 0],
  [0.112, 0],
  [0.114, 0.012],
  [0.112, 0.05],
  [0.1, 0.06],
  [0.094, 0.06],
  [0.094, 0],
];

// Drawings: a coin's face and a magic seal.
const COIN_FACE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="none" stroke="#8a4508" stroke-width="3"/>
    <path d="M32 11 L37.5 26 L53 26 L40.5 35.5 L45 51 L32 41.5 L19 51 L23.5 35.5 L11 26 L26.5 26 Z" fill="#a8600f"/>
    <circle cx="32" cy="32" r="4.5" fill="#ffe27a"/>
  </svg>`,
  { size: 128 },
);
const rays = Array.from({ length: 16 }, (_, k) => {
  const c = Math.cos((k / 16) * Math.PI * 2);
  const s = Math.sin((k / 16) * Math.PI * 2);
  const [x1, y1] = [(128 + c * 88).toFixed(1), (128 + s * 88).toFixed(1)];
  const [x2, y2] = [(128 + c * 118).toFixed(1), (128 + s * 118).toFixed(1)];
  return `M${x1} ${y1}L${x2} ${y2}`;
}).join("");
const GLYPH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <g fill="none" stroke="${CYAN}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="128" cy="128" r="120" stroke-width="7"/>
      <circle cx="128" cy="128" r="100" stroke-width="3"/>
      <circle cx="128" cy="128" r="64"/>
      <polygon points="128,80 172,156 84,156"/>
      <path d="${rays}"/>
      <path d="M128 36 V64 M128 192 V220 M36 128 H64 M192 128 H220"/>
    </g>
  </svg>`,
  { size: 512 },
);

/** Turns a geometry about its origin (Euler degrees), then moves it by `pos`. */
function place<G extends THREE.BufferGeometry>(g: G, pos: Vec, rot: Vec = [0, 0, 0], order: THREE.EulerOrder = "XYZ"): G {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, order));
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1)));
  return g;
}

/** Lowest and highest y of a geometry after turning it by `rot`. */
function yRange(g: THREE.BufferGeometry, rot: Vec, order: THREE.EulerOrder = "XYZ"): [number, number] {
  const c = place(g.clone(), [0, 0, 0], rot, order);
  c.computeBoundingBox();
  return [c.boundingBox!.min.y, c.boundingBox!.max.y];
}

const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  new THREE.BoxGeometry(w, h, d).translate(x, y, z);

function merged(list: THREE.BufferGeometry[]) {
  const g = mergeGeometries(list);
  if (!g) throw new Error("treasure hoard: geometries do not merge");
  return g;
}

/** Height of the heap's dome over the chest, before the coins pile up on it. */
const heapTop = (x: number, z: number) => {
  const d = Math.hypot(x, z - CZ) / 0.42;
  return TOP + 0.34 * Math.max(0, 1 - d * d) ** 1.2;
};

/** Keeps loose pieces clear of the two goblets. */
const clear = (x: number, z: number) => Math.hypot(x + 0.62, z - 0.28) > 0.16 && Math.hypot(x - 0.6, z - 0.12) > 0.2;

export default function build() {
  const b = createBuilder({ name: "treasure hoard" });
  type PartOpts = Parameters<typeof b.part>[2];
  type Fill = Parameters<typeof b.part>[1];
  const root = b.joint("hoard", { at: [0, 0, 0] });
  // The lid's hinge sits on the chest's back top edge; the lid is built closed and posed open below.
  const lid = b.joint("lid", { parent: root, at: [0, TOP, CZ - 0.26], role: "hinge" });
  const R = rng(41);

  // Every piece is built in model space and handed to the bone it rides on.
  type Bone = typeof root;
  const put = (g: THREE.BufferGeometry, color: Fill, name: string, bone: Bone = root, opts?: PartOpts) =>
    b.part(g, color, { ...opts, bone, at: [0, 0, 0], name });

  // A gem on a frame: `frame` turns the gem further (a goblet, the crown).
  const gem = (
    r: number,
    color: string,
    name: string,
    pos: Vec,
    rot: Vec = [0, 0, 0],
    o: { order?: THREE.EulerOrder; glow?: number; frame?: (g: THREE.BufferGeometry) => THREE.BufferGeometry; bone?: Bone } = {},
  ) => {
    const local = place(gemGeom(r), pos, rot, o.order);
    const g = o.frame ? o.frame(local) : local;
    const part = put(g, color, name, o.bone ?? root, { flat: true });
    if (o.glow) glow(part, o.glow);
    return part;
  };

  // A gem resting with its point on (x, z) at height `base`, tilted at random.
  const gemSeat = (r: number, x: number, z: number, base: number, color: string, name: string, glowS = 0) => {
    const rot: Vec = [(R() * 2 - 1) * 25, R() * 360, (R() * 2 - 1) * 25];
    const [lo] = yRange(gemGeom(r), rot);
    return gem(r, color, name, [x, base - lo, z], rot, { glow: glowS });
  };

  // ---- Flagstone under the hoard ----
  put(box(2.0, 0.04, 1.7, 0, 0.02, -0.05), stone, "floor.slab");
  for (const [w, d, x, z] of [
    [2.0, 0.03, 0, 0.785],
    [2.0, 0.03, 0, -0.885],
    [0.03, 1.7, 0.985, -0.05],
    [0.03, 1.7, -0.985, -0.05],
  ] as const)
    put(box(w, 0.008, d, x, 0.044, z), GOLD_DK, "floor.trim");
  const glyphPlane = new THREE.PlaneGeometry(1.3, 1.3).rotateX(-Math.PI / 2).translate(0, 0.0455, CZ);
  glow(put(glyphPlane, "#ffffff", "floor.glyph", root, { texture: GLYPH }), 1.5);

  // ---- Chest ----
  put(box(0.9, 0.08, 0.56, 0, 0.08, CZ), IRON, "chest.plinth");
  put(box(0.84, 0.44, 0.52, 0, 0.34, CZ), wood, "chest.body");
  put(box(0.87, 0.045, 0.55, 0, 0.2, CZ), GOLD, "chest.band.low");
  put(box(0.87, 0.045, 0.55, 0, 0.48, CZ), GOLD, "chest.band.high");
  for (const x of [-0.3, 0.3]) {
    put(box(0.05, 0.44, 0.02, x, 0.34, CZ + 0.27), GOLD, "chest.strap.front");
    put(box(0.05, 0.44, 0.02, x, 0.34, CZ - 0.27), GOLD, "chest.strap.back");
  }
  for (const s of [1, -1]) for (const z of [CZ - 0.16, CZ + 0.16]) put(box(0.02, 0.44, 0.05, s * 0.43, 0.34, z), GOLD, "chest.strap.side");
  const corners: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (const dz of [-1, 1]) for (const y of [0.12, 0.56]) corners.push(box(0.1, 0.1, 0.1, s * 0.42, y, CZ + dz * 0.26));
  put(merged(corners), GOLD, "chest.corners");

  const rivets: THREE.BufferGeometry[] = [];
  const rivet = (x: number, y: number, z: number) => rivets.push(new THREE.SphereGeometry(0.009, 6, 4).translate(x, y, z));
  for (const x of [-0.3, 0.3])
    for (const y of [0.14, 0.26, 0.42, 0.53]) {
      rivet(x, y, CZ + 0.285);
      rivet(x, y, CZ - 0.285);
    }
  for (const x of [-0.38, -0.22, 0.22, 0.38]) for (const y of [0.2, 0.48]) rivet(x, y, CZ + 0.283);
  for (const s of [1, -1])
    for (const z of [CZ - 0.16, CZ + 0.16]) for (const y of [0.14, 0.26, 0.42, 0.53]) rivet(s * 0.446, y, z);
  put(merged(rivets), GOLD_HI, "chest.rivets");

  // Lock: a gold plate, flush on the front, with a ruby set in it.
  put(box(0.14, 0.16, 0.02, 0, 0.36, CZ + 0.272), GOLD, "chest.lock.plate");
  gem(0.03, RUBY, "chest.lock.gem", [0, 0.36, CZ + 0.318], [90, 0, 0], { glow: 1.4 });

  // Side handles: a gold ring on a backplate, each side.
  for (const s of [1, -1]) {
    put(box(0.03, 0.08, 0.08, s * 0.435, 0.36, CZ), GOLD_DK, "chest.handle.plate");
    put(new THREE.TorusGeometry(0.05, 0.012, 6, 14).rotateY(Math.PI / 2).translate(s * 0.46, 0.36, CZ), GOLD_HI, "chest.handle");
  }

  // The coin mound fills the chest top; its paint reads as a coin field from above.
  put(new THREE.SphereGeometry(1, 28, 14).scale(0.4, 0.34, 0.25).translate(0, TOP - 0.02, CZ), coinField, "heap.mound");

  // Lid: a flattened half-cylinder, closed in this build; its chord sits on the chest top.
  const lidShell = new THREE.CylinderGeometry(0.26, 0.26, 0.86, 18, 1, false, 0, Math.PI)
    .rotateZ(Math.PI / 2)
    .scale(1, 0.5, 1)
    .translate(0, TOP, CZ);
  put(lidShell, wood, "lid.shell", lid);
  put(box(0.82, 0.012, 0.5, 0, TOP + 0.006, CZ), quilt, "lid.lining", lid);
  put(
    merged([
      box(0.84, 0.014, 0.02, 0, TOP + 0.007, CZ + 0.25),
      box(0.84, 0.014, 0.02, 0, TOP + 0.007, CZ - 0.25),
      box(0.02, 0.014, 0.5, 0.41, TOP + 0.007, CZ),
      box(0.02, 0.014, 0.5, -0.41, TOP + 0.007, CZ),
    ]),
    GOLD,
    "lid.lining.trim",
    lid,
  );
  glow(put(new THREE.PlaneGeometry(0.26, 0.26).rotateX(Math.PI / 2).translate(0, TOP - 0.002, CZ), "#ffffff", "lid.seal", lid, { texture: GLYPH }), 1.2);
  for (const x of [-0.31, 0, 0.31])
    put(
      new THREE.CylinderGeometry(0.27, 0.27, 0.03, 18, 1, true, 0, Math.PI).rotateZ(Math.PI / 2).scale(1, 0.5, 1).translate(x, TOP, CZ),
      GOLD,
      "lid.band",
      lid,
    );
  gem(0.04, AMETHYST, "lid.crest.gem", [0, TOP + 0.162, CZ], [0, 0, 0], { glow: 1.2, bone: lid });

  // ---- Coin heap ----
  const coinSites: { x: number; z: number; top: number }[] = [];
  const golds: THREE.BufferGeometry[] = [];
  const bronzes: THREE.BufferGeometry[] = [];
  const emblems: THREE.BufferGeometry[] = [];
  // Drops a coin onto the floor or onto the highest coin within `reach`, so coins stack into layers.
  const dropCoin = (x: number, z: number, floor: number, rot: Vec, bronze: boolean, emblem: boolean, reach = 0.03, cap = Infinity) => {
    let base = floor;
    for (const c of coinSites) if (Math.hypot(c.x - x, c.z - z) < reach) base = Math.max(base, c.top - 0.002);
    base = Math.min(base, cap);
    const [lo, hi] = yRange(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), rot);
    const dy = base - lo;
    (bronze ? bronzes : golds).push(place(new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 10), [x, dy, z], rot));
    if (emblem)
      emblems.push(
        place(
          new THREE.CircleGeometry(COIN_R * 0.84, 14).rotateX(-Math.PI / 2).translate(0, COIN_T / 2 + 0.0012, 0),
          [x, dy, z],
          rot,
        ),
      );
    coinSites.push({ x, z, top: dy + hi });
  };
  // A pass of coins sampled over the chest top, each lying on the dome beneath it.
  const heapPass = (n: number) => {
    for (let i = 0; i < n; i++) {
      let x = 0;
      let z = 0;
      do {
        x = (R() * 2 - 1) * 0.4;
        z = CZ + (R() * 2 - 1) * 0.24;
      } while (Math.hypot(x, z - CZ) > 0.4);
      dropCoin(x, z, heapTop(x, z), [(R() * 2 - 1) * 16, R() * 360, (R() * 2 - 1) * 16], R() < 0.25, R() < 0.3, 0.05, heapTop(x, z) + 0.04);
    }
  };
  heapPass(240);
  heapPass(260);
  const HEAP = coinSites.length;
  // Coins spilling over the front lip onto the flagstone.
  for (let i = 0; i < 40; i++) {
    const x = (R() * 2 - 1) * 0.5;
    const z = CZ + 0.28 + R() * 0.22;
    if (clear(x, z)) dropCoin(x, z, 0.04, [(R() * 2 - 1) * 35, R() * 360, (R() * 2 - 1) * 35], R() < 0.3, R() < 0.3);
  }
  // Loose coins across the flagstone.
  for (let i = 0; i < 90; i++) {
    const x = (R() * 2 - 1) * 0.93;
    const z = -0.8 + R() * 1.5;
    if (Math.abs(x) < 0.47 && Math.abs(z - CZ) < 0.3) continue;
    if (clear(x, z) && coinSites.length < HEAP + 85) dropCoin(x, z, 0.04, [(R() * 2 - 1) * 25, R() * 360, (R() * 2 - 1) * 25], R() < 0.3, R() < 0.3);
  }
  // Two tidy stacks of coins by the goblets, a counted pile against the loose spill.
  for (let k = 0; k < 9; k++) dropCoin(-0.84, -0.58, 0.04, [0, 0, 0], false, k === 8, 0.03);
  for (let k = 0; k < 7; k++) dropCoin(0.84, 0.58, 0.04, [0, 0, 0], k % 2 === 0, k === 6, 0.03);
  put(merged(golds), GOLD, "coins.gold");
  put(merged(bronzes), BRONZE, "coins.bronze");
  put(merged(emblems), "#ffffff", "coins.emblems", root, { texture: COIN_FACE });

  // Gems in the heap: each rests on a coin, a few of them big.
  const crest = coinSites.slice(0, HEAP).sort((p, q) => q.top - p.top).slice(0, 60);
  for (let i = 0; i < 30; i++) {
    const s = crest[Math.floor(R() * crest.length)];
    const r = R() < 0.35 ? 0.028 + R() * 0.01 : 0.016 + R() * 0.01;
    gemSeat(r, s.x + (R() - 0.5) * 0.02, s.z + (R() - 0.5) * 0.02, s.top - 0.002, pick(i), `hoard.heap.gem${i}`, glowable(pick(i)) ? 0.9 : 0);
  }
  // Gems scattered over the flagstone.
  for (let i = 0; i < 18; i++) {
    const x = (R() * 2 - 1) * 0.9;
    const z = -0.7 + R() * 1.4;
    if (!clear(x, z) || (Math.abs(x) < 0.47 && Math.abs(z - CZ) < 0.3)) continue;
    gemSeat(0.014 + R() * 0.01, x, z, 0.04, pick(i + 2), `floor.gem${i}`, glowable(pick(i + 2)) ? 0.9 : 0);
  }

  // ---- Goblets ----
  const goblet = (name: string, pos: Vec, rot: Vec, from: Vec, to: Vec, gems: number) => {
    const T = (g: THREE.BufferGeometry) => place(g, pos, rot);
    const cup = new THREE.LatheGeometry(GOBLET.map(([x, y]) => new THREE.Vector2(x, y)), 16);
    put(T(cup), gradient(GOLD_DK, GOLD_HI, from, to), `${name}.cup`);
    put(T(new THREE.TorusGeometry(0.075, 0.0045, 6, 22).rotateX(Math.PI / 2).translate(0, 0.222, 0)), GOLD_HI, `${name}.rim`);
    put(T(new THREE.TorusGeometry(0.0315, 0.004, 6, 18).rotateX(Math.PI / 2).translate(0, 0.112, 0)), GOLD_HI, `${name}.band`);
    for (let k = 0; k < gems; k++) {
      const a = (k / gems) * 360 + 18;
      const c = pick(k + 1);
      gem(0.014, c, `${name}.gem${k}`, [0.066 * Math.sin(a * DEG), 0.165, 0.066 * Math.cos(a * DEG)], [90, a, 0], {
        order: "YXZ",
        frame: T,
        glow: glowable(c) ? 0.8 : 0,
      });
    }
  };
  // Upright goblet, its bowl heaped with gems.
  goblet("goblet.a", [-0.62, 0, 0.28], [0, 0, 0], [-0.62, 0.02, 0.28], [-0.62, 0.22, 0.28], 5);
  for (let k = 0; k < 5; k++) {
    const a = k * 72 * DEG;
    const c = pick(k + 2);
    gemSeat(0.013, -0.62 + Math.cos(a) * 0.012, 0.28 + Math.sin(a) * 0.012, 0.114 + (k % 2) * 0.012, c, `goblet.a.heap${k}`, glowable(c) ? 0.9 : 0);
  }
  // Goblet on its side, spilling gems from its mouth.
  goblet("goblet.b", [0.7, 0.078, 0.12], [0, 0, 90], [0.7, 0.078, 0.12], [0.48, 0.078, 0.12], 4);
  for (let k = 0; k < 6; k++) {
    const c = pick(k + 3);
    gemSeat(0.012 + R() * 0.01, 0.4 + R() * 0.12, 0.12 + (R() - 0.5) * 0.12, 0.04, c, `goblet.b.spill${k}`, glowable(c) ? 0.9 : 0);
  }

  // ---- Crown, perched on the pile ----
  const crownBand = () => {
    const pts = CROWN_BAND.map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 28);
  };
  const crownRot: Vec = [6, 0, -8];
  const cTop = Math.max(heapTop(0.02, CZ), ...coinSites.filter((c) => Math.hypot(c.x - 0.02, c.z - CZ) < 0.1).map((c) => c.top));
  const [cLow] = yRange(crownBand().scale(CROWN_S, CROWN_S, CROWN_S), crownRot);
  const cPos: Vec = [0.02, cTop - 0.015 - cLow, CZ];
  const cT = (g: THREE.BufferGeometry) => place(g.scale(CROWN_S, CROWN_S, CROWN_S), cPos, crownRot);
  put(cT(crownBand()), gradient(GOLD_DK, GOLD_HI, [0.02, cPos[1], CZ], [0.02, cPos[1] + 0.06 * CROWN_S, CZ]), "crown.band");
  put(cT(new THREE.TorusGeometry(0.112, 0.0035, 6, 30).rotateX(Math.PI / 2).translate(0, 0.03, 0)), GOLD_HI, "crown.bead");
  const TILT = 14;
  for (let k = 0; k < 5; k++) {
    const a = k * 72;
    const R0 = 0.102;
    const base: Vec = [R0 * Math.sin(a * DEG), 0.055, R0 * Math.cos(a * DEG)];
    const spike = new THREE.ConeGeometry(0.02, 0.1, 8).translate(0, 0.05, 0);
    put(cT(place(spike, base, [TILT, a, 0], "YXZ")), GOLD, `crown.spike${k}`);
    const dir: Vec = [Math.sin(a * DEG) * Math.sin(TILT * DEG), Math.cos(TILT * DEG), Math.cos(a * DEG) * Math.sin(TILT * DEG)];
    const tip: Vec = [base[0] + 0.1 * dir[0], base[1] + 0.1 * dir[1], base[2] + 0.1 * dir[2]];
    const c = pick(k);
    gem(0.017, c, `crown.tip${k}`, tip, [TILT, a, 0], { order: "YXZ", frame: cT, glow: glowable(c) ? 1 : 0.7 });
  }
  for (let k = 0; k < 5; k++) {
    const a = k * 72 + 36;
    const c = pick(k + 1);
    gem(0.011, c, `crown.band.gem${k}`, [0.113 * Math.sin(a * DEG), 0.03, 0.113 * Math.cos(a * DEG)], [90, a, 0], {
      order: "YXZ",
      frame: cT,
      glow: glowable(c) ? 0.8 : 0,
    });
  }

  // The lid swings back and rests against the wall.
  b.pose(lid, { axis: [1, 0, 0], deg: -100 });
  return b.root;
}

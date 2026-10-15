// Treasure hoard: an open hextech-style chest on a runed dais, spilling coins, gems, a crown, goblets, ingots,
// a sack, crystal clusters and a pearl strand. League of Legends look: saturated gold against deep violet,
// self-lit gems and runes (kits/glow) that read from a high top-down camera, cel-shaded surfaces (kits/toon).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import { grain, mix, noise, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Treasure Hoard",
  description:
    "A runed dais heaped with gold: an open violet chest with gold straps and a glowing lock gem, spilling coins, cut gems, a jeweled crown, goblets, ingots, a coin sack, crystal clusters and a pearl strand.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const CYAN = "#3de8ff";
const MAGENTA = "#ff3ec9";
const RUBY = "#ff2d4a";
const EMERALD = "#3cf08c";
const AMBER = "#ffb524";
const SAPPH = "#4f7dff";
const DIAMOND = "#c9f8ff";

const GOLD = cel("#ffc933", "#d9751a");
const GOLD_HI = cel("#ffe67a", "#f0a53a");
const GOLD_DK = cel("#e0a01c", "#a8541a");
const SILVER = cel("#d4e2ff", "#7f93d6");
const CRIMSON = cel("#d6204f", "#8a1240");
const ROPE = cel("#e2bb78", "#a8743a");
const PEARL = cel("#fff6fb", "#c9b3e6");
const ROCK = cel(mix("#55558a", "#43437a", 0.5), "#2e2e5c");

const WOOD_LINE = "#24123f";
const WOOD_A = grain("#6a46b4", "#7d57c8", { size: 0.012, axis: "x", seed: 2 });
const WOOD_B = grain("#5a3a9c", "#6945b0", { size: 0.012, axis: "x", seed: 5 });
const WOOD = cel(
  paint((p, n) => {
    const u = Math.abs(n.x) > 0.6 ? p.z : p.x;
    const k = u / 0.115 + 0.5;
    const id = Math.floor(k);
    const f = k - id;
    if (f < 0.04 || f > 0.96) return WOOD_LINE;
    return id % 2 === 0 ? WOOD_A : WOOD_B;
  }),
);

const BURLAP = cel(grain("#cfa566", "#b58a4c", { size: 0.01, axis: "y", seed: 3 }));

const DAIS = cel(
  paint((p, n) => {
    if (n.y < 0.7) return "#363866";
    const r = Math.hypot(p.x, p.z);
    if (r > 1.33 && r < 1.4) return "#ffc933";
    if ((r > 1.3 && r <= 1.33) || (r >= 1.4 && r < 1.43)) return "#2a2150";
    if (r > 1.17 && r < 1.19) return "#e0a01c";
    const a = Math.atan2(p.z, p.x) / (Math.PI / 6);
    const fa = a - Math.floor(a);
    if (r > 0.9 && (fa < 0.03 || fa > 0.97)) return "#33316a";
    return mix("#4d4f8a", "#5d5fa2", noise(p, 0.14, 2));
  }),
);

const MOUND = cel(paint((p) => mix("#b0601c", "#d98a24", smoothstep(0.4, 0.6, noise(p, 0.2, 5)))));

// ---------------------------------------------------------------------------------------------------------------
// Textures

const starPoints = (cx: number, cy: number, big: number, small: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? small : big;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

const COIN_FACE = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#9a4f10" stroke-width="3"/><polygon points="${starPoints(32, 32, 17, 7)}" fill="#9a4f10"/></svg>`,
  { size: 128 },
);

const RUNE = svg(
  `<svg viewBox="0 0 64 80"><path d="M32 4 L58 18 L58 52 L32 66 L6 52 L6 18 Z" fill="none" stroke="#3de8ff" stroke-width="3.5" stroke-linejoin="round"/><path d="M32 18 L32 54 M20 30 L32 38 L44 30 M20 46 L32 54 L44 46" stroke="#9ff6ff" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="32" cy="36" r="3.2" fill="#ffffff"/></svg>`,
  { size: 192 },
);

const QUILT = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#c41e4c"/><path d="M0 0 L64 64 M32 0 L64 32 M0 32 L32 64 M64 0 L0 64 M32 0 L0 32 M64 32 L32 64" stroke="#ffc933" stroke-width="2.6" fill="none"/><circle cx="32" cy="32" r="3.4" fill="#ffe67a"/><circle cx="0" cy="0" r="3" fill="#ffe67a"/><circle cx="64" cy="0" r="3" fill="#ffe67a"/><circle cx="0" cy="64" r="3" fill="#ffe67a"/><circle cx="64" cy="64" r="3" fill="#ffe67a"/></svg>`,
  { size: 256 },
);

const SACK_EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#ecd8a2" stroke="#5b3b1a" stroke-width="3" stroke-dasharray="5 3"/><circle cx="32" cy="32" r="18" fill="#ffc933" stroke="#7a3f0a" stroke-width="3"/><polygon points="${starPoints(32, 32, 12, 5)}" fill="#9a4f10"/></svg>`,
  { size: 256 },
);

const SPARK = svg(
  `<svg viewBox="0 0 64 64"><path d="M32 0 Q35 29 64 32 Q35 35 32 64 Q29 35 0 32 Q29 29 32 0 Z" fill="#fff6c0"/><circle cx="32" cy="32" r="6" fill="#ffffff"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Layout constants

const FLOOR = 0.062; // top of the dais
const CZ = -0.4; // chest centre z
const CW = 0.92;
const CD = 0.56;
const CHH = 0.36;
const Y0 = 0.08;
const T = 0.04;
const TOP = Y0 + CHH;
const HZ = CZ - CD / 2;

// Dunes of the coin mound: [cx, cz, rx, rz, height].
const DUNES: number[][] = [
  [0, -0.4, 1.1, 0.7, 0.24],
  [0, 0.0, 0.5, 0.42, 0.38],
  [0.75, -0.15, 0.5, 0.55, 0.3],
  [-0.78, -0.2, 0.5, 0.55, 0.26],
  [0.5, 0.48, 0.42, 0.34, 0.14],
  [-0.62, 0.48, 0.42, 0.34, 0.15],
  [0, -0.95, 0.8, 0.3, 0.28],
];

function heightAt(x: number, z: number) {
  let h = 0;
  for (const [cx, cz, rx, rz, hh] of DUNES) {
    const q = 1 - ((x - cx) / rx) ** 2 - ((z - cz) / rz) ** 2;
    if (q > 0) h = Math.max(h, hh * Math.sin(Math.min(1, q * 1.4) * (Math.PI / 2)));
  }
  return FLOOR + 0.003 + h;
}

function heapAt(x: number, z: number) {
  const q = Math.max(0, 1 - (x / 0.45) ** 2 - ((z - CZ) / 0.27) ** 2);
  return Y0 + 0.32 + 0.12 * Math.sin(Math.min(1, q * 1.2) * (Math.PI / 2));
}

function normalOf(fn: (x: number, z: number) => number, x: number, z: number) {
  const e = 0.02;
  const hx = (fn(x + e, z) - fn(x - e, z)) / (2 * e);
  const hz = (fn(x, z + e) - fn(x, z - e)) / (2 * e);
  return new THREE.Vector3(-hx, 1, -hz).normalize();
}

function field(
  fn: (x: number, z: number) => number,
  map: (u: number, v: number) => [number, number],
  seg: number,
) {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let j = 0; j <= seg; j++)
    for (let i = 0; i <= seg; i++) {
      const [x, z] = map((i / seg) * 2 - 1, (j / seg) * 2 - 1);
      pos.push(x, fn(x, z), z);
    }
  for (let j = 0; j < seg; j++)
    for (let i = 0; i < seg; i++) {
      const a = j * (seg + 1) + i;
      const c = a + seg + 1;
      idx.push(a, c, a + 1, a + 1, c, c + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const merged = (geos: THREE.BufferGeometry[]) => mergeGeometries(geos)!;

/** A brilliant-cut gem, table up, point down, girdle at y = 0. */
function gemGeo(r: number) {
  const top = new THREE.CylinderGeometry(r * 0.62, r, r * 0.34, 8, 1);
  top.translate(0, r * 0.17, 0);
  const bottom = new THREE.ConeGeometry(r, r * 0.85, 8, 1);
  bottom.rotateX(Math.PI);
  bottom.translate(0, -r * 0.425, 0);
  return merged([top, bottom]);
}

/** A hexagonal crystal with a pointed tip, base at y = 0. */
function crystalGeo(r: number, h: number) {
  const shaft = new THREE.CylinderGeometry(r * 0.8, r, h, 6, 1);
  shaft.translate(0, h / 2, 0);
  const tip = new THREE.ConeGeometry(r * 0.8, h * 0.3, 6, 1);
  tip.translate(0, h + h * 0.15, 0);
  return merged([shaft, tip]);
}

/** A local frame: placing things relative to a tilted object. */
class Xf {
  constructor(
    readonly pos: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}

  static at(pos: number[], eulerDeg: number[] = [0, 0, 0]) {
    return new Xf(
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(eulerDeg[0] * DEG, eulerDeg[1] * DEG, eulerDeg[2] * DEG)),
    );
  }

  p(v: number[]) {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q).add(this.pos);
  }

  d(v: number[]) {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q);
  }

  child(pos: number[], eulerDeg: number[] = [0, 0, 0]) {
    return new Xf(this.p(pos), this.q.clone().multiply(Xf.at([0, 0, 0], eulerDeg).q));
  }
}

const UP = [0, 1, 0];
const GOBLET: Array<[number, number]> = [
  [0, 0],
  [0.055, 0],
  [0.06, 0.008],
  [0.052, 0.016],
  [0.022, 0.03],
  [0.014, 0.045],
  [0.015, 0.085],
  [0.028, 0.098],
  [0.016, 0.112],
  [0.015, 0.125],
  [0.04, 0.15],
  [0.062, 0.19],
  [0.064, 0.225],
  [0.058, 0.228],
  [0.052, 0.225],
  [0.05, 0.19],
  [0.03, 0.16],
  [0, 0.15],
];

const archPoints = (a: number, rr: number): Array<[number, number]> =>
  Array.from({ length: 10 }, (_, k) => [a * Math.cos((k * Math.PI) / 9), rr * Math.sin((k * Math.PI) / 9)]);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "treasureHoard", paintSize: 2048 });
  const R = rng(7);
  const base = b.joint("base", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: base, at: [0, TOP, HZ], dir: [0, 0, 1], role: "hinge" });

  const P = (geo: THREE.BufferGeometry, color: string | Paint, o: PartOptions = {}) =>
    b.part(geo, color, { bone: base, ...o });
  const L = (geo: THREE.BufferGeometry, color: string | Paint, o: PartOptions = {}) =>
    b.part(geo, color, { bone: lid, ...o });
  const gem = (xf: Xf, local: number[], dir: number[], r: number, color: string, strength = 0.65, bone = base) =>
    glow(
      b.part(gemGeo(r), color, { bone, at: xf.p(local), dir: xf.d(dir), flat: true }),
      strength,
    );

  // -------------------------------------------------------------------------------------------------------------
  // Dais with a gold rune ring and glowing rune nodes

  b.lathe(
    [
      [0, 0],
      [1.52, 0],
      [1.52, 0.03],
      [1.46, 0.032],
      [1.44, FLOOR],
      [0, FLOOR],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 16, color: DAIS, bone: base, name: "dais" },
  );
  const nodeGeos: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const phi = (i * Math.PI) / 6 + Math.PI / 12;
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(Math.cos(phi) * 1.365, FLOOR + 0.007, Math.sin(phi) * 1.365),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -(phi + Math.PI / 2)),
      new THREE.Vector3(1, 1, 1),
    );
    nodeGeos.push(new THREE.BoxGeometry(0.1, 0.012, 0.04).applyMatrix4(m));
  }
  glow(P(merged(nodeGeos), CYAN, { at: [0, 0, 0], name: "runeNodes" }), 1);

  // -------------------------------------------------------------------------------------------------------------
  // The coin mound and the heap inside the chest

  P(
    field(
      heightAt,
      (u, v) => [1.28 * u * Math.sqrt(1 - (v * v) / 2), 1.28 * v * Math.sqrt(1 - (u * u) / 2)],
      40,
    ),
    MOUND,
    { at: [0, 0, 0], name: "mound" },
  );
  P(
    field(
      heapAt,
      (u, v) => [0.426 * u, CZ + 0.246 * v],
      14,
    ),
    GOLD_DK,
    { at: [0, 0, 0], name: "chestHeap" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Placement zones kept clear of loose coins

  const KEEP: number[][] = [
    [0.5, 0.52, 0.18],
    [-0.12, 0.62, 0.13],
    [0.17, 0.4, 0.09],
    [0.9, 0.05, 0.08],
    [-0.52, 0.66, 0.09],
    [-0.85, -0.12, 0.09],
    [-0.15, 1.0, 0.2],
    [0.2, 1.1, 0.22],
    [0.95, 0.5, 0.34],
    [-1.05, 0.48, 0.3],
    [-0.75, -0.85, 0.3],
    [0.8, -0.85, 0.3],
    [0.62, 0.95, 0.09],
    [0.75, 0.85, 0.09],
    [-0.5, 1.0, 0.09],
    [0.0, 0.3, 0.05],
    [0.78, 0.18, 0.05],
  ];
  const inKeep = (x: number, z: number) => KEEP.some(([a, c, r]) => (x - a) ** 2 + (z - c) ** 2 < r * r);
  const inChest = (x: number, z: number) => Math.abs(x) < 0.56 && z > -0.74 && z < -0.03;

  // -------------------------------------------------------------------------------------------------------------
  // Coins: every coin is merged into one of three tint bins, plus one merged emblem layer

  const COIN = new THREE.CylinderGeometry(0.058, 0.058, 0.013, 10, 1);
  const FACE = new THREE.CircleGeometry(0.044, 10).rotateX(-Math.PI / 2).translate(0, 0.0072, 0);
  const coinBins: THREE.BufferGeometry[][] = [[], [], []];
  const faceBin: THREE.BufferGeometry[] = [];
  const ONE = new THREE.Vector3(1, 1, 1);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const addCoin = (pos: THREE.Vector3, q: THREE.Quaternion, bin: number) => {
    const m = new THREE.Matrix4().compose(pos, q, ONE);
    coinBins[bin % 3].push(COIN.clone().applyMatrix4(m));
    faceBin.push(FACE.clone().applyMatrix4(m));
  };
  const coinQuat = (n: THREE.Vector3, wobble: number) => {
    const d = n
      .clone()
      .add(new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(wobble))
      .normalize();
    return aim(d).multiply(new THREE.Quaternion().setFromAxisAngle(yAxis, R() * Math.PI * 2));
  };

  // Loose coins over the mound.
  let placed = 0;
  for (let t = 0; t < 12000 && placed < 440; t++) {
    const x = (R() * 2 - 1) * 1.26;
    const z = (R() * 2 - 1) * 1.26;
    if (x * x + z * z > 1.26 * 1.26 || inChest(x, z) || inKeep(x, z)) continue;
    const h = heightAt(x, z) - FLOOR - 0.003;
    if (h < 0.02 && R() > 0.1) continue;
    const n = normalOf(heightAt, x, z);
    const pos = new THREE.Vector3(x, heightAt(x, z), z).addScaledVector(n, 0.004 + R() * 0.016);
    addCoin(pos, coinQuat(n, h < 0.02 ? 0.15 : 1.0), placed);
    placed++;
  }
  // Coins heaped inside the chest.
  for (let i = 0; i < 80; i++) {
    const x = (R() * 2 - 1) * 0.36;
    const z = CZ + (R() * 2 - 1) * 0.18;
    const n = normalOf(heapAt, x, z);
    const pos = new THREE.Vector3(x, heapAt(x, z), z).addScaledVector(n, 0.004 + R() * 0.02);
    addCoin(pos, coinQuat(n, 0.9), i);
  }
  // Coin stacks on the dais.
  for (const [sx, sz, count] of [
    [0.62, 0.95, 8],
    [0.75, 0.85, 5],
    [-0.5, 1.0, 6],
  ]) {
    for (let i = 0; i < count; i++) {
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler((R() - 0.5) * 0.05, R() * Math.PI * 2, (R() - 0.5) * 0.05),
      );
      addCoin(new THREE.Vector3(sx + (R() - 0.5) * 0.01, FLOOR + 0.0075 + i * 0.0135, sz + (R() - 0.5) * 0.01), q, i);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Chest body

  const wall = (size: number[], at: number[], color: string | Paint = WOOD) =>
    P(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at });
  const yMid = Y0 + CHH / 2;
  wall([CW, 0.03, CD], [0, Y0 + 0.015, CZ]);
  wall([CW, CHH, T], [0, yMid, CZ + CD / 2 - T / 2]);
  wall([CW, CHH, T], [0, yMid, CZ - CD / 2 + T / 2]);
  for (const s of [1, -1]) wall([T, CHH, CD - 2 * T], [s * (CW / 2 - T / 2), yMid, CZ]);
  // Crimson lining.
  const linH = CHH - 0.03;
  const linY = Y0 + 0.03 + linH / 2;
  wall([CW - 2 * T, linH, 0.01], [0, linY, CZ - CD / 2 + T + 0.005], CRIMSON);
  wall([CW - 2 * T, linH, 0.01], [0, linY, CZ + CD / 2 - T - 0.005], CRIMSON);
  for (const s of [1, -1]) wall([0.01, linH, CD - 2 * T - 0.02], [s * (CW / 2 - T - 0.005), linY, CZ], CRIMSON);

  // Gold: base trim, rim frame, corner posts, straps.
  wall([CW + 0.04, 0.04, CD + 0.04], [0, Y0 + 0.02, CZ], GOLD);
  const rimY = TOP;
  wall([CW + 0.03, 0.03, 0.045], [0, rimY, CZ + CD / 2], GOLD_HI);
  wall([CW + 0.03, 0.03, 0.045], [0, rimY, CZ - CD / 2], GOLD_HI);
  for (const s of [1, -1]) wall([0.045, 0.03, CD + 0.03], [s * (CW / 2), rimY, CZ], GOLD_HI);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) wall([0.06, CHH + 0.02, 0.06], [sx * (CW / 2), yMid + 0.01, CZ + sz * (CD / 2)], GOLD);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) wall([0.1, CHH, 0.02], [sx * 0.28, yMid, CZ + sz * (CD / 2 + 0.008)], GOLD);

  // Rivets.
  const rivets: THREE.BufferGeometry[] = [];
  const rivet = (x: number, y: number, z: number) =>
    rivets.push(new THREE.SphereGeometry(0.011, 6, 4).translate(x, y, z));
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      for (const y of [Y0 + 0.07, Y0 + 0.18, Y0 + 0.29]) {
        rivet(sx * (CW / 2), y, CZ + sz * (CD / 2 + 0.032));
        rivet(sx * (CW / 2 + 0.032), y, CZ + sz * (CD / 2));
      }
  for (const sx of [1, -1])
    for (const sz of [1, -1])
      for (const y of [Y0 + 0.05, TOP - 0.05]) rivet(sx * 0.28, y, CZ + sz * (CD / 2 + 0.022));
  for (const sx of [1, -1])
    for (const y of [TOP - 0.135, TOP - 0.005]) rivet(sx * 0.055, y, CZ + CD / 2 + 0.026);
  P(merged(rivets), GOLD_HI, { at: [0, 0, 0], name: "chestRivets" });

  // Lock plate, keyhole.
  const lockY = TOP - 0.07;
  const lockZ = CZ + CD / 2;
  wall([0.15, 0.16, 0.02], [0, lockY, lockZ + 0.013], GOLD);
  wall([0.11, 0.12, 0.008], [0, lockY, lockZ + 0.026], GOLD_DK);
  P(new THREE.CylinderGeometry(0.016, 0.016, 0.006, 8), INK, {
    at: [0, lockY + 0.012, lockZ + 0.031],
    dir: [0, 0, 1],
  });
  wall([0.012, 0.034, 0.006], [0, lockY - 0.016, lockZ + 0.031], INK);

  // Hinge barrels and end handles.
  for (const sx of [1, -1]) {
    P(new THREE.CylinderGeometry(0.024, 0.024, 0.11, 8), GOLD, { at: [sx * 0.25, TOP + 0.005, HZ - 0.012], rotation: [0, 0, 90] });
    P(new THREE.BoxGeometry(0.02, 0.06, 0.07), GOLD, { at: [sx * (CW / 2 + 0.012), Y0 + 0.22, CZ] });
    P(new THREE.TorusGeometry(0.034, 0.006, 5, 12), GOLD_HI, { at: [sx * (CW / 2 + 0.03), Y0 + 0.2, CZ], rotation: [0, 90, 0] });
  }

  // Glowing rune panels on the front and the ends.
  for (const sx of [1, -1]) {
    glow(
      P(new THREE.PlaneGeometry(0.13, 0.16), "#ffffff", {
        at: [sx * 0.15, Y0 + 0.17, CZ + CD / 2 + 0.004],
        dir: [0, 0, 1],
        axis: "z",
        texture: RUNE,
      }),
      1,
    );
    glow(
      P(new THREE.PlaneGeometry(0.13, 0.16), "#ffffff", {
        at: [sx * (CW / 2 + 0.004), Y0 + 0.14, CZ - 0.12],
        dir: [sx, 0, 0],
        axis: "z",
        texture: RUNE,
      }),
      1,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Chest lid (built closed, then opened about the hinge)

  const yL = TOP + 0.01;
  const a = CD / 2 + 0.005;
  const rr = 0.2;
  const arch = archPoints(a, rr);
  b.extrude(arch, {
    at: [0, yL, CZ],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: CW + 0.01,
    bevel: 0.01,
    color: WOOD,
    bone: lid,
    name: "lidArch",
  });
  const strapArch = archPoints(a + 0.012, rr + 0.014);
  for (const sx of [1, -1]) {
    b.extrude(strapArch, {
      at: [sx * 0.28, yL, CZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.1,
      bevel: 0.004,
      color: GOLD,
      bone: lid,
      name: "lidStrap",
    });
    b.extrude(strapArch, {
      at: [sx * (CW / 2 + 0.015), yL, CZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: GOLD_HI,
      bone: lid,
      name: "lidCap",
    });
  }
  b.rod([-0.47, yL + rr + 0.012, CZ], [0.47, yL + rr + 0.012, CZ], 0.013, { color: GOLD_HI, bone: lid, name: "lidRidge" });
  L(new THREE.BoxGeometry(0.84, 0.02, 0.5), "#ffffff", { at: [0, yL - 0.01, CZ], texture: QUILT, name: "lidLining" });
  const lidRivets: THREE.BufferGeometry[] = [];
  for (const sx of [1, -1])
    for (const deg of [30, 70, 110, 150]) {
      const th = deg * DEG;
      lidRivets.push(
        new THREE.SphereGeometry(0.011, 6, 4).translate(
          sx * 0.28,
          yL + (rr + 0.016) * Math.sin(th),
          CZ + (a + 0.014) * Math.cos(th),
        ),
      );
    }
  L(merged(lidRivets), GOLD_HI, { at: [0, 0, 0], name: "lidRivets" });
  L(new THREE.BoxGeometry(0.11, 0.13, 0.018), GOLD, { at: [0, yL + 0.045, CZ + 0.286], rotation: [-15, 0, 0], name: "hasp" });
  glow(
    b.part(gemGeo(0.026), CYAN, {
      bone: lid,
      at: [0, yL + 0.05, CZ + 0.3],
      dir: [0, 0.25, 1],
      flat: true,
    }),
    0.8,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Loose coin bins are finished here, after all placements

  // -------------------------------------------------------------------------------------------------------------
  // Crown

  const crown = Xf.at([0.5, heightAt(0.5, 0.52) + 0.03, 0.52], [-12, 28, 9]);
  b.lathe(
    [
      [0.118, 0],
      [0.145, 0],
      [0.15, 0.01],
      [0.15, 0.085],
      [0.145, 0.095],
      [0.12, 0.095],
      [0.115, 0.085],
      [0.115, 0.01],
    ],
    { at: crown.p([0, 0, 0]), axis: crown.d(UP), segments: 16, color: GOLD, bone: base, name: "crownBand" },
  );
  for (const y of [0.004, 0.094])
    P(new THREE.TorusGeometry(0.148, 0.007, 5, 24), GOLD_HI, { at: crown.p([0, y, 0]), dir: crown.d(UP), axis: "z" });
  P(new THREE.SphereGeometry(0.112, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), CRIMSON, {
    at: crown.p([0, 0.06, 0]),
    dir: crown.d(UP),
    scale: [1, 0.7, 1],
  });
  const crownPearls: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const ph = (i * Math.PI * 2) / 16;
    const pp = crown.p([Math.sin(ph) * 0.15, 0.1, Math.cos(ph) * 0.15]);
    crownPearls.push(new THREE.SphereGeometry(0.007, 6, 4).translate(pp.x, pp.y, pp.z));
  }
  P(merged(crownPearls), PEARL, { at: [0, 0, 0], name: "crownPearls" });
  const bandGems = [RUBY, CYAN, SAPPH, AMBER, EMERALD, AMBER, SAPPH, CYAN];
  for (let i = 0; i < 8; i++) {
    const ph = (i * Math.PI) / 4;
    const rad = [Math.sin(ph), 0, Math.cos(ph)];
    const tall = i % 2 === 0;
    const sc = tall ? 1 : 0.62;
    const spike: OutlinePoint[] = [
      [-0.033, 0],
      [0.033, 0],
      [0.035, 0.045 * sc],
      [0.014, 0.085 * sc],
      [0, 0.13 * sc, "sharp"],
      [-0.014, 0.085 * sc],
      [-0.035, 0.045 * sc],
    ];
    b.extrude(spike, {
      at: crown.p([rad[0] * 0.142, 0.085, rad[2] * 0.142]),
      x: crown.d([Math.cos(ph), 0, -Math.sin(ph)]),
      y: crown.d(UP),
      thickness: 0.016,
      bevel: 0.004,
      color: GOLD,
      bone: base,
      name: "crownSpike",
    });
    if (tall) gem(crown, [rad[0] * 0.142, 0.085 + 0.13 * sc + 0.002, rad[2] * 0.142], UP, 0.016, bandGems[(i / 2 + 1) % 8] ?? AMBER, 0.8);
    else
      P(new THREE.SphereGeometry(0.013, 6, 4), PEARL, {
        at: crown.p([rad[0] * 0.142, 0.085 + 0.13 * sc + 0.006, rad[2] * 0.142]),
      });
    gem(crown, [rad[0] * 0.153, 0.048, rad[2] * 0.153], rad, i === 0 ? 0.032 : tall ? 0.022 : 0.014, bandGems[i], 0.7);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Goblets

  const goblet = (xf: Xf, metal: Paint, gemColor: string, liquid: string | null, s: number) => {
    b.lathe(
      GOBLET.map(([r, y]): [number, number] => [r * s, y * s]),
      { at: xf.p([0, 0, 0]), axis: xf.d(UP), segments: 12, color: metal, bone: base, name: "goblet" },
    );
    P(new THREE.TorusGeometry(0.03 * s, 0.006 * s, 5, 10), GOLD_HI, { at: xf.p([0, 0.098 * s, 0]), dir: xf.d(UP), axis: "z" });
    P(new THREE.TorusGeometry(0.061 * s, 0.005 * s, 5, 14), GOLD_HI, { at: xf.p([0, 0.226 * s, 0]), dir: xf.d(UP), axis: "z" });
    P(new THREE.TorusGeometry(0.057 * s, 0.005 * s, 5, 14), GOLD_HI, { at: xf.p([0, 0.006 * s, 0]), dir: xf.d(UP), axis: "z" });
    if (liquid)
      glow(
        P(new THREE.CylinderGeometry(0.049 * s, 0.049 * s, 0.004 * s, 10), liquid, {
          at: xf.p([0, 0.208 * s, 0]),
          dir: xf.d(UP),
        }),
        0.8,
      );
    for (let j = 0; j < 5; j++) {
      const ph = (j * Math.PI * 2) / 5;
      const rd = [Math.sin(ph), 0, Math.cos(ph)];
      gem(xf, [rd[0] * 0.0615 * s, 0.185 * s, rd[2] * 0.0615 * s], [rd[0], -0.5, rd[2]], 0.011 * s, gemColor, 0.7);
    }
  };
  goblet(Xf.at([-0.52, heightAt(-0.52, 0.66) - 0.004, 0.66], [3, 20, -3]), GOLD, RUBY, EMERALD, 1);
  goblet(Xf.at([-0.85, heightAt(-0.85, -0.12) - 0.004, -0.12], [-4, -35, 5]), SILVER, SAPPH, MAGENTA, 0.9);
  const tipped = Xf.at([-0.15, FLOOR + 0.062, 1.0], [0, -10, -80]);
  goblet(tipped, GOLD, CYAN, null, 1);
  // Coins spilled from the tipped goblet.
  const rim = tipped.p([0, 0.226, 0]);
  const spillDir = tipped.d([0, 1, 0]);
  spillDir.y = 0;
  spillDir.normalize();
  for (let k = 0; k < 9; k++) {
    const side = new THREE.Vector3(-spillDir.z, 0, spillDir.x);
    const pos = rim
      .clone()
      .addScaledVector(spillDir, 0.04 + k * 0.032)
      .addScaledVector(side, (R() - 0.5) * 0.07);
    pos.y = FLOOR + 0.0068 + (k < 3 ? 0.012 * (3 - k) : 0);
    const q = new THREE.Quaternion().setFromEuler(
      new THREE.Euler((R() - 0.5) * 0.12, R() * Math.PI * 2, (R() - 0.5) * 0.12),
    );
    addCoin(pos, q, k);
  }
  addCoin(
    rim.clone().addScaledVector(spillDir, 0.2).setY(FLOOR + 0.052),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(1.35, 0.4, 0.2)),
    1,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Gold ingots in a pyramid

  const ingots = Xf.at([0.95, FLOOR, 0.5], [0, -28, 0]);
  const ingotShape: OutlinePoint[] = [
    [-0.1, 0],
    [0.1, 0],
    [0.082, 0.055],
    [-0.082, 0.055],
  ];
  for (let layer = 0; layer < 3; layer++) {
    const n = 3 - layer;
    for (let k = 0; k < n; k++) {
      const ix = ingots.child([(R() - 0.5) * 0.015, layer * 0.055, (k - (n - 1) / 2) * 0.1], [0, (R() - 0.5) * 6, 0]);
      b.extrude(ingotShape, {
        at: ix.p([0, 0, 0]),
        x: ix.d([1, 0, 0]),
        y: ix.d(UP),
        thickness: [0.092, 0.07],
        bevel: 0.007,
        color: layer === 2 ? GOLD_HI : layer === 1 ? GOLD : GOLD_DK,
        bone: base,
        name: "ingot",
      });
      P(new THREE.BoxGeometry(0.07, 0.004, 0.034), GOLD_DK, { at: ix.p([0, 0.056, 0]), quat: ix.q });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Coin sack

  const sack = Xf.at([-1.05, FLOOR, 0.48], [0, 25, -14]);
  const sackBody = b.lathe(
    [
      [0, 0],
      [0.14, 0],
      [0.2, 0.04],
      [0.245, 0.13],
      [0.235, 0.24],
      [0.17, 0.33],
      [0.085, 0.39],
      [0.07, 0.42],
      [0.11, 0.47],
      [0.14, 0.52],
      [0.115, 0.52],
      [0.085, 0.46],
      [0.055, 0.42],
      [0, 0.4],
    ],
    { at: sack.p([0, 0, 0]), axis: sack.d(UP), segments: 12, color: BURLAP, bone: base, name: "sack" },
  );
  b.decal(sackBody, SACK_EMBLEM, {
    at: sack.p([0, 0.17, 0.245]),
    dir: sack.d([0, 0, 1]),
    up: sack.d(UP),
    size: [0.17, 0.17],
    segments: 8,
    bone: base,
  });
  P(new THREE.TorusGeometry(0.078, 0.012, 5, 12), ROPE, { at: sack.p([0, 0.415, 0]), dir: sack.d(UP), axis: "z" });
  b.rod(sack.p([0.06, 0.41, 0.05]), sack.p([0.1, 0.33, 0.1]), 0.008, { color: ROPE, bone: base });
  b.rod(sack.p([0.03, 0.41, 0.07]), sack.p([0.0, 0.35, 0.14]), 0.008, { color: ROPE, bone: base });
  P(new THREE.SphereGeometry(0.1, 8, 5), GOLD_DK, { at: sack.p([0, 0.46, 0]), scale: [1, 0.45, 1] });
  const sackDir = sack.d([1, 0, 0]);
  sackDir.y = 0;
  sackDir.normalize();
  for (let k = 0; k < 14; k++) {
    const dist = 0.3 + (k % 7) * 0.05 + R() * 0.03;
    const lateral = (R() - 0.5) * 0.28;
    const x = sack.pos.x + sackDir.x * dist - sackDir.z * lateral;
    const z = sack.pos.z + sackDir.z * dist + sackDir.x * lateral;
    const n = normalOf(heightAt, x, z);
    addCoin(new THREE.Vector3(x, heightAt(x, z), z).addScaledVector(n, 0.006 + R() * 0.012), coinQuat(n, 0.4), k);
  }
  for (let k = 0; k < 4; k++)
    addCoin(
      sack.p([0.03 + k * 0.03, 0.5 + (k % 2) * 0.01, (R() - 0.5) * 0.06]),
      sack.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(R() - 0.5, R() * 3, R() - 0.5))),
      k,
    );

  // -------------------------------------------------------------------------------------------------------------
  // Big cut gems, rings and a necklace

  const bigGem = (x: number, z: number, r: number, color: string, strength: number) => {
    const n = normalOf(heightAt, x, z);
    return glow(
      P(gemGeo(r), color, {
        at: [x, heightAt(x, z) + r * 0.3, z],
        dir: n.clone().add(new THREE.Vector3(R() - 0.5, 0, R() - 0.5).multiplyScalar(0.2)),
        flat: true,
      }),
      strength,
    );
  };
  bigGem(-0.12, 0.62, 0.1, DIAMOND, 0.55);
  bigGem(0.17, 0.4, 0.07, RUBY, 0.6);
  bigGem(0.9, 0.05, 0.06, EMERALD, 0.6);

  const ringAt = (x: number, z: number, color: string, yaw: number) => {
    const rx = Xf.at([x, heightAt(x, z) + 0.016, z], [72, yaw, 0]);
    P(new THREE.TorusGeometry(0.022, 0.005, 5, 12), GOLD_HI, { at: rx.pos, quat: rx.q });
    gem(rx, [0, 0.027, 0], UP, 0.012, color, 0.8);
  };
  ringAt(0.0, 0.3, MAGENTA, 30);
  ringAt(0.78, 0.18, CYAN, -50);

  const surfPoint = (x: number, z: number, lift: number): number[] => [x, heightAt(x, z) + lift, z];
  const chain = catmull(
    [
      surfPoint(-0.62, 0.05, 0.03),
      surfPoint(-0.5, 0.2, 0.03),
      surfPoint(-0.38, 0.3, 0.03),
      surfPoint(-0.28, 0.22, 0.03),
      surfPoint(-0.2, 0.1, 0.03),
      surfPoint(-0.12, 0.05, 0.03),
    ],
  );
  b.sweep(chain, 0.006, { color: GOLD, bone: base, sides: 5, name: "necklace" });
  const pendant = chain.at(1);
  glow(
    b.part(gemGeo(0.03), AMBER, { bone: base, at: [pendant.x, pendant.y + 0.012, pendant.z], dir: UP, flat: true }),
    0.7,
  );
  const pearlPath = catmull([
    surfPoint(0.25, 0.3, 0.035),
    surfPoint(0.38, 0.22, 0.035),
    surfPoint(0.5, 0.15, 0.035),
    surfPoint(0.62, 0.2, 0.035),
    surfPoint(0.72, 0.33, 0.035),
  ]);
  const pearls: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++) {
    const pp = pearlPath.at(i / 15);
    pearls.push(new THREE.SphereGeometry(0.015, 6, 4).translate(pp.x, pp.y, pp.z));
  }
  P(merged(pearls), PEARL, { at: [0, 0, 0], name: "pearls" });

  // -------------------------------------------------------------------------------------------------------------
  // Crystal clusters

  const cluster = (cx: number, cz: number, color: string, seed: number) => {
    const r2 = rng(seed);
    const xf = Xf.at([cx, heightAt(cx, cz) - 0.02, cz], [0, seed * 20, 0]);
    P(new THREE.DodecahedronGeometry(0.22, 0), ROCK, {
      at: xf.p([0, 0.03, 0]),
      scale: [1.3, 0.45, 1.1],
      flat: true,
      name: "clusterRock",
    });
    glow(
      P(crystalGeo(0.06, 0.55), color, {
        at: xf.p([0, 0.04, 0]),
        dir: xf.d([0.05, 1, 0.03]),
        flat: true,
        name: "crystal",
      }),
      0.55,
    );
    for (let i = 0; i < 6; i++) {
      const ph = (i * Math.PI * 2) / 6 + r2() * 0.4;
      const tilt = 0.35 + r2() * 0.3;
      const h = 0.26 + r2() * 0.16;
      glow(
        P(crystalGeo(0.038 + r2() * 0.012, h), color, {
          at: xf.p([Math.sin(ph) * 0.1, 0.03, Math.cos(ph) * 0.1]),
          dir: xf.d([Math.sin(ph) * Math.sin(tilt), Math.cos(tilt), Math.cos(ph) * Math.sin(tilt)]),
          flat: true,
          name: "crystal",
        }),
        0.55,
      );
    }
  };
  cluster(-0.75, -0.85, MAGENTA, 3);
  cluster(0.8, -0.85, CYAN, 5);

  // -------------------------------------------------------------------------------------------------------------
  // Small cut gems scattered over the mound, merged by colour

  for (const color of [CYAN, MAGENTA, RUBY, EMERALD, AMBER, SAPPH]) {
    const geos: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 9; k++) {
      for (let t = 0; t < 200; t++) {
        const x = (R() * 2 - 1) * 1.2;
        const z = (R() * 2 - 1) * 1.2;
        if (x * x + z * z > 1.2 * 1.2 || inChest(x, z) || inKeep(x, z) || heightAt(x, z) - FLOOR < 0.06) continue;
        const r = 0.02 + R() * 0.02;
        const n = normalOf(heightAt, x, z);
        const pos = new THREE.Vector3(x, heightAt(x, z), z).addScaledVector(n, 0.012 + r * 0.3);
        const q = aim(n.clone().add(new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(1.2)));
        geos.push(gemGeo(r).applyMatrix4(new THREE.Matrix4().compose(pos, q, ONE)));
        break;
      }
    }
    if (geos.length) glow(P(merged(geos), color, { at: [0, 0, 0], flat: true, name: "gems" }), 0.65);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Finish the coin layers

  coinBins.forEach((bin, i) => {
    P(merged(bin), [GOLD, GOLD_HI, GOLD_DK][i], { at: [0, 0, 0], name: "coins" });
  });
  P(merged(faceBin), "#ffffff", { at: [0, 0, 0], texture: COIN_FACE, name: "coinFaces" });

  // -------------------------------------------------------------------------------------------------------------
  // Sparkles

  const sparkAt = [
    [-0.15, 0.85, 0.4],
    [0.35, 0.72, 0.55],
    [0.7, 0.62, 0.1],
    [-0.65, 0.55, -0.1],
    [0.3, 0.95, -0.2],
    [-0.9, 0.75, -0.2],
    [0.95, 0.5, -0.4],
    [0.5, 0.8, -0.9],
    [-0.45, 0.62, 0.55],
    [0.0, 0.65, 0.85],
    [0.62, 0.45, 0.85],
    [-0.8, 0.6, 0.7],
  ];
  glow(
    b.cards(
      sparkAt.map(([x, y, z]) => frame([x, y, z], UP)),
      SPARK,
      { size: [0.09, 0.09], cross: true, vary: 0.5, rng: rng(5), flow: [0, 0, 1], bone: base, name: "sparkles" },
    ),
    1,
  );

  // Open the lid.
  b.pose(lid, { axis: [1, 0, 0], deg: -100 });

  return b.root;
}

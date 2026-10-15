// Treasure hoard: a gem-crusted chest with its lid thrown open, a mound of coins, a crown, goblets, gold bars, a
// necklace and glowing crystals. League of Legends mix: bold saturated shapes, cel-shaded gold, one strong magic
// accent (cyan glow) against warm gold and ruby.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import type { LatheOptions } from "../../../../src/outline";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import { grain, paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Hoard",
  description:
    "A treasure hoard: iron-banded chest with its lid thrown open, mound of coins, jewelled crown, goblets, gold bars, necklace and glowing crystals.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const V = THREE.Vector3;
type Vec = THREE.Vector3;

// ---------- palette ----------
const GOLD = cel("#ffbf26");
const GOLD_L = cel("#ffe27a");
const GOLD_D = cel("#d9890f");
const SILVER = cel("#d4deef");
const VELVET = cel("#c4163f");
const COIN_PAINT = cel(scales(["#ffc02d", "#ffd45c", "#f2a51d", "#e89516"], "#9a5a0c", { size: 0.05, width: 0.18 }));
const WOOD_L = "#8a4524";
const WOOD_D = "#4d2412";
const SEAM = "#2a120a";
const woodGrain = grain(WOOD_L, WOOD_D, { size: 0.02, axis: "x" });
const planks = paint((p) => {
  const f = (((p.y / 0.085) % 1) + 1) % 1;
  return f < 0.05 || f > 0.97 ? SEAM : woodGrain;
});
const CHEST_WOOD = cel(planks);
const LID_WOOD = cel(woodGrain);
const RUBY = "#ff2352";
const EMERALD = "#18e08c";
const SAPPHIRE = "#2f8cff";
const AMETHYST = "#b24dff";
const TOPAZ = "#ffd83a";
const CYAN = "#40f0ff";
const PEARL = "#fff3e6";
const WINE = "#9e0f35";
const GEMC = [RUBY, EMERALD, SAPPHIRE, AMETHYST, TOPAZ];

// ---------- textures ----------
const star8 = Array.from({ length: 16 }, (_, i) => {
  const a = (i * Math.PI) / 8;
  const r = i % 2 ? 9 : 20;
  return `${(32 + r * Math.sin(a)).toFixed(1)},${(32 - r * Math.cos(a)).toFixed(1)}`;
}).join(" ");
const COIN_TEX = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#ffd24d"/><circle cx="32" cy="32" r="29" fill="none" stroke="#d9890f" stroke-width="2" stroke-dasharray="3 3"/><circle cx="32" cy="32" r="26" fill="none" stroke="#b86a10" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="#f5b52a"/><polygon points="${star8}" fill="#ffe98a" stroke="#9a5a0c" stroke-width="1.6"/><circle cx="32" cy="32" r="4" fill="#d9890f"/></svg>`,
  { size: 128 },
);
const quiltLines = (() => {
  let d = "";
  for (let i = -40; i <= 112; i += 9) d += `M${i} 0 L${i + 40} 40 M${i} 40 L${i + 40} 0 `;
  return d;
})();
const quiltDots = (() => {
  let s = "";
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 9; c++) s += `<circle cx="${c * 9 + (r % 2 ? 4.5 : 0)}" cy="${r * 9 - 0}" r="1.1" fill="#ffd45c"/>`;
  return s;
})();
const QUILT = svg(
  `<svg viewBox="0 0 72 40"><rect width="72" height="40" fill="#b01238"/><path d="${quiltLines}" stroke="#e7a21f" stroke-width="1.4" fill="none"/>${quiltDots}<rect x="1" y="1" width="70" height="38" fill="none" stroke="#ffd45c" stroke-width="2"/></svg>`,
  { size: 256 },
);
const runeSvg = (inner: string) =>
  svg(
    `<svg viewBox="0 0 32 32"><g stroke="${CYAN}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="16" r="14" stroke-width="2"/>${inner}</g></svg>`,
    { size: 128 },
  );
const RUNES = [
  runeSvg('<path d="M16 6 V26 M16 11 L9 18 M16 11 L23 18"/>'),
  runeSvg('<path d="M9 8 L23 24 M23 8 L9 24 M9 16 H23"/>'),
];
const STAR = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 0 L19 13 L32 16 L19 19 L16 32 L13 19 L0 16 L13 13 Z" fill="#fffbe0"/></svg>`,
  { size: 64 },
);

// ---------- geometry tables ----------
const CUT: [number, number][] = [
  [0, -0.5],
  [0.5, 0.05],
  [0.42, 0.22],
  [0.22, 0.3],
  [0, 0.3],
];
const ARCH: [number, number][] = [
  [-0.23, 0],
  [0.23, 0],
  [0.225, 0.07],
  [0.19, 0.13],
  [0.12, 0.165],
  [0, 0.18],
  [-0.12, 0.165],
  [-0.19, 0.13],
  [-0.225, 0.07],
];
const GOBLET: [number, number][] = [
  [0, 0],
  [0.055, 0],
  [0.058, 0.012],
  [0.03, 0.025],
  [0.014, 0.05],
  [0.014, 0.1],
  [0.03, 0.118],
  [0.05, 0.15],
  [0.058, 0.2],
  [0.052, 0.2],
  [0.044, 0.155],
  [0, 0.135],
];
const PROF: [number, number][] = [
  [0, 0.22],
  [0.35, 0.17],
  [0.6, 0.1],
  [0.8, 0.04],
  [0.9, -0.01],
];
const MOUND_Z = 0.25;
const MOUND_SX = 1.25;
const MOUND_SZ = 0.95;
function heightAt(x: number, z: number) {
  const rr = Math.hypot(x / MOUND_SX, (z - MOUND_Z) / MOUND_SZ);
  if (rr >= 0.9) return -0.01;
  for (let i = 0; i < PROF.length - 1; i++) {
    if (rr <= PROF[i + 1][0]) {
      const t = (rr - PROF[i][0]) / (PROF[i + 1][0] - PROF[i][0]);
      return PROF[i][1] + (PROF[i + 1][1] - PROF[i][1]) * t;
    }
  }
  return -0.01;
}
const inChest = (x: number, z: number) => Math.abs(x) < 0.5 && z < 0.02;

export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const root = b.joint("root", { at: [0, 0.05, 0] });
  const CY = 0.1; // chest height above the floor
  const H = new V(0, 0.34 + CY, -0.53); // lid hinge
  const lid = b.joint("lidHinge", { parent: root, at: H, dir: [0, 0, 1], role: "hinge" });
  const TH = (110 * Math.PI) / 180;
  const FWD = new V(0, Math.sin(TH), Math.cos(TH));
  const UP = new V(0, Math.cos(TH), -Math.sin(TH));
  const lidAt = (f: number, u: number) => H.clone().addScaledVector(FWD, f).addScaledVector(UP, u);

  const P = (g: THREE.BufferGeometry, color: Fill, o: PartOptions = {}) => b.part(g, color, { bone: root, ...o });
  const L = (outline: [number, number][], color: Fill, o: LatheOptions) =>
    b.lathe(outline, { bone: root, color, ...o });
  const gem = (at: Vec, axis: Vec, size: number, color: string, g = 0) => {
    const part = b.lathe(
      CUT.map(([x, y]): [number, number] => [x * size, y * size]),
      { at, axis: axis.clone().normalize(), segments: 8, color, bone: root },
    );
    return g ? glow(part, g) : part;
  };

  // ---------- coin mound ----------
  const moundPts = [new THREE.Vector2(0.9, -0.01), ...[...PROF].reverse().map(([r, y]) => new THREE.Vector2(r, y))];
  P(new THREE.LatheGeometry(moundPts, 14), COIN_PAINT, {
    at: [0, 0, MOUND_Z],
    scale: [MOUND_SX, 1, MOUND_SZ],
    flat: true,
  });

  // ---------- coins (merged per colour) ----------
  const BUCKETS = [
    { top: "#ffc531", inner: "#d98b14", a: [] as THREE.BufferGeometry[], b: [] as THREE.BufferGeometry[] },
    { top: "#ffe27a", inner: "#e0a020", a: [] as THREE.BufferGeometry[], b: [] as THREE.BufferGeometry[] },
    { top: "#dfe6f2", inner: "#9aa7bf", a: [] as THREE.BufferGeometry[], b: [] as THREE.BufferGeometry[] },
  ];
  const coin = (bucket: number, pos: Vec, eul: THREE.Euler, s: number) => {
    const m = new THREE.Matrix4().compose(
      pos,
      new THREE.Quaternion().setFromEuler(eul),
      new V(s, s, s),
    );
    BUCKETS[bucket].a.push(new THREE.CylinderGeometry(0.032, 0.032, 0.007, 10).applyMatrix4(m));
    BUCKETS[bucket].b.push(new THREE.CylinderGeometry(0.021, 0.021, 0.0076, 8).applyMatrix4(m));
  };
  const R = rng(11);
  for (let i = 0; i < 190; i++) {
    const a = R() * Math.PI * 2;
    const rr = Math.sqrt(R()) * 0.86;
    const x = Math.cos(a) * rr * MOUND_SX;
    const z = MOUND_Z + Math.sin(a) * rr * MOUND_SZ;
    const pick = R();
    const eul = new THREE.Euler((R() - 0.5) * 1.2, R() * 6.28, (R() - 0.5) * 1.2);
    const s = 0.8 + R() * 0.4;
    if (inChest(x, z)) continue;
    coin(pick < 0.5 ? 0 : pick < 0.8 ? 1 : 2, new V(x, heightAt(x, z) + 0.006, z), eul, s);
  }
  const stack = (x: number, z: number, n: number, bucket: number) => {
    const y0 = heightAt(x, z) + 0.002;
    for (let i = 0; i < n; i++)
      coin(
        bucket,
        new V(x + (R() - 0.5) * 0.006, y0 + 0.0035 + i * 0.0072, z + (R() - 0.5) * 0.006),
        new THREE.Euler((R() - 0.5) * 0.05, R() * 6.28, (R() - 0.5) * 0.05),
        1,
      );
  };
  stack(0.72, 0.62, 9, 0);
  stack(0.85, 0.45, 6, 1);
  stack(-0.28, 0.85, 7, 0);
  stack(-0.05, 0.98, 4, 2);
  stack(-0.78, 0.2, 5, 2);
  // chest dome coins
  const DOME = { cx: 0, cy: 0.34 + CY, cz: -0.3, sx: 0.39, sy: 0.11, sz: 0.215 };
  const domeY = (x: number, z: number) => {
    const k = 1 - (x / DOME.sx) ** 2 - ((z - DOME.cz) / DOME.sz) ** 2;
    return DOME.cy + DOME.sy * Math.sqrt(Math.max(k, 0));
  };
  for (let i = 0; i < 45; i++) {
    const x = (R() - 0.5) * 0.7;
    const z = DOME.cz + (R() - 0.5) * 0.36;
    if (1 - (x / DOME.sx) ** 2 - ((z - DOME.cz) / DOME.sz) ** 2 < 0.1) continue;
    coin(
      R() < 0.6 ? 0 : 1,
      new V(x, domeY(x, z) + 0.004, z),
      new THREE.Euler((R() - 0.5) * 1.4, R() * 6.28, (R() - 0.5) * 1.4),
      0.85 + R() * 0.3,
    );
  }

  // ---------- chest ----------
  P(new THREE.BoxGeometry(0.8, 0.34, 0.46), CHEST_WOOD, { at: [0, 0.17 + CY, -0.3] });
  P(new THREE.BoxGeometry(0.84, CY + 0.045, 0.5), GOLD_D, { at: [0, (CY + 0.045) / 2, -0.3] });
  P(new THREE.BoxGeometry(0.8, 0.012, 0.46), GOLD_L, { at: [0, 0.3 + CY - 0.12, -0.3], scale: [1.02, 1, 1.02] });
  for (const x of [-0.3, 0.3]) P(new THREE.BoxGeometry(0.06, 0.352, 0.48), GOLD, { at: [x, 0.17 + CY, -0.3] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      P(new THREE.BoxGeometry(0.05, 0.356, 0.05), GOLD_D, { at: [sx * 0.405, 0.172 + CY, -0.3 + sz * 0.235] });
  for (const sz of [-1, 1])
    P(new THREE.BoxGeometry(0.85, 0.03, 0.03), GOLD, { at: [0, 0.335 + CY, -0.3 + sz * 0.235] });
  for (const sx of [-1, 1])
    P(new THREE.BoxGeometry(0.03, 0.03, 0.5), GOLD, { at: [sx * 0.41, 0.335 + CY, -0.3] });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      P(new THREE.SphereGeometry(0.03, 6, 5), GOLD_L, { at: [sx * 0.41, 0.356 + CY, -0.3 + sz * 0.235] });
  // rivets on the front bands
  const rivets: THREE.BufferGeometry[] = [];
  for (const x of [-0.3, 0.3])
    for (const y of [0.05, 0.14, 0.23, 0.31])
      rivets.push(new THREE.SphereGeometry(0.0085, 6, 4).translate(x, y + CY, -0.06));
  const rv = mergeGeometries(rivets);
  if (rv) P(rv, "#fff0a0", { at: [0, 0, 0] });
  // lock plate
  P(new THREE.BoxGeometry(0.12, 0.15, 0.016), GOLD, { at: [0, 0.23 + CY, -0.062] });
  P(new THREE.BoxGeometry(0.1, 0.13, 0.006), GOLD_D, { at: [0, 0.23 + CY, -0.052] });
  P(new THREE.CylinderGeometry(0.013, 0.013, 0.01, 8), INK, { at: [0, 0.225 + CY, -0.047], dir: [0, 0, 1] });
  P(new THREE.BoxGeometry(0.008, 0.03, 0.01), INK, { at: [0, 0.2 + CY, -0.047] });
  gem(new V(0, 0.285 + CY, -0.045), new V(0, 0.3, 1), 0.045, RUBY, 0.5);
  // glowing runes
  [-0.15, 0.15].forEach((x, i) => {
    glow(
      P(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
        at: [x, 0.17 + CY, -0.0685],
        dir: [0, 0, 1],
        axis: "z",
        texture: RUNES[i],
      }),
      1.2,
    );
  });
  // hinge knuckles
  for (const x of [-0.3, 0.3]) P(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8), GOLD_D, { at: [x, 0.345 + CY, -0.54], dir: [1, 0, 0] });
  // dome of coins in the chest
  P(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), COIN_PAINT, {
    at: [DOME.cx, DOME.cy, DOME.cz],
    scale: [DOME.sx, DOME.sy, DOME.sz],
    flat: true,
  });
  // gems on the dome
  [-0.28, -0.12, 0.08, 0.26].forEach((x, i) => {
    const z = -0.3 + (i % 2 ? 0.07 : -0.06);
    gem(new V(x, domeY(x, z) + 0.01, z), new V(x * 0.8, 1, 0.3 * (i % 2 ? 1 : -1)), 0.045, GEMC[i % 5]);
  });

  // ---------- lid (built open, hinged on lidHinge) ----------
  const arch = (sx: number, sy: number) => ARCH.map(([x, y]): [number, number] => [x * sx, y * sy]);
  const lidBase = lidAt(0.23, 0);
  b.extrude(arch(1, 1), { at: lidBase, x: FWD, y: UP, thickness: 0.8, bevel: 0.01, color: LID_WOOD, bone: lid });
  for (const x of [-0.3, 0, 0.3])
    b.extrude(arch(1.04, 1.1), {
      at: lidBase.clone().add(new V(x, 0, 0)),
      x: FWD,
      y: UP,
      thickness: 0.06,
      bevel: 0.006,
      color: GOLD,
      bone: lid,
    });
  for (const sx of [-1, 1])
    b.extrude(arch(1.05, 1.12), {
      at: lidBase.clone().add(new V(sx * 0.405, 0, 0)),
      x: FWD,
      y: UP,
      thickness: 0.025,
      bevel: 0.004,
      color: GOLD_D,
      bone: lid,
    });
  b.part(new THREE.BoxGeometry(0.74, 0.01, 0.42), VELVET, {
    bone: lid,
    at: lidAt(0.23, -0.005),
    dir: UP,
    up: FWD,
  });
  b.part(new THREE.PlaneGeometry(0.72, 0.4), "#ffffff", {
    bone: lid,
    at: lidAt(0.23, -0.0108),
    dir: UP.clone().negate(),
    axis: "z",
    up: FWD,
    texture: QUILT,
  });
  // gem on the lid apex, and lid studs
  gem(lidAt(0.23, 0.205), UP, 0.07, SAPPHIRE, 0.5).mesh.parent; // glowing hero gem on the lid
  for (const x of [-0.3, 0.3])
    for (const f of [0.08, 0.38]) {
      const pos = lidAt(f, f > 0.2 ? 0.07 : 0.07).add(new V(x, 0, 0));
      b.part(new THREE.SphereGeometry(0.011, 6, 4), "#fff0a0", { bone: lid, at: pos });
    }

  // ---------- crown ----------
  const crown = (cx: number, cz: number) => {
    const y0 = heightAt(cx, cz) - 0.03;
    const C = new V(cx, y0, cz);
    L(
      [
        [0.104, 0],
        [0.118, 0],
        [0.128, 0.07],
        [0.114, 0.07],
      ],
      GOLD,
      { at: C, segments: 14 },
    );
    L(
      [
        [0.112, 0.062],
        [0.131, 0.062],
        [0.131, 0.074],
        [0.112, 0.074],
      ],
      GOLD_L,
      { at: C, segments: 14 },
    );
    L(
      [
        [0.1, -0.004],
        [0.122, -0.004],
        [0.122, 0.012],
        [0.1, 0.012],
      ],
      GOLD_D,
      { at: C, segments: 14 },
    );
    P(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), VELVET, {
      at: [cx, y0 + 0.05, cz],
      scale: [0.108, 0.11, 0.108],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const tall = k % 2 === 0;
      const base = new V(cx + 0.12 * Math.sin(a), y0 + 0.065, cz + 0.12 * Math.cos(a));
      const len = tall ? 0.11 : 0.06;
      b.spike(base, [0, 1, 0], len, tall ? 0.026 : 0.02, { color: GOLD, sides: 6, bone: root });
      if (tall)
        P(new THREE.SphereGeometry(0.016, 6, 5), GEMC[(k / 2) % 5], {
          at: [base.x, base.y + len + 0.006, base.z],
        });
      else P(new THREE.SphereGeometry(0.011, 6, 5), PEARL, { at: [base.x, base.y + len + 0.004, base.z] });
      const out = new V(Math.sin(a), 0.1, Math.cos(a));
      gem(
        new V(cx + 0.127 * Math.sin(a), y0 + 0.036, cz + 0.127 * Math.cos(a)),
        out,
        k === 0 ? 0.05 : 0.032,
        k === 0 ? RUBY : GEMC[(k + 1) % 5],
        k === 0 ? 0.5 : 0,
      );
    }
    for (const a of [0, Math.PI / 2]) {
      const pt = (r: number, yy: number, sgn: number) =>
        new V(cx + sgn * r * Math.sin(a), y0 + yy, cz + sgn * r * Math.cos(a));
      b.sweep(
        catmull([pt(0.12, 0.07, 1), pt(0.075, 0.16, 1), new V(cx, y0 + 0.19, cz), pt(0.075, 0.16, -1), pt(0.12, 0.07, -1)]),
        0.009,
        { color: GOLD, sides: 5, bone: root },
      );
    }
    P(new THREE.SphereGeometry(0.022, 8, 6), GOLD_L, { at: [cx, y0 + 0.205, cz] });
    P(new THREE.SphereGeometry(0.013, 6, 5), SAPPHIRE, { at: [cx, y0 + 0.235, cz] });
  };
  crown(-0.42, 0.55);

  // ---------- goblets ----------
  type Fill2 = "wine" | "elixir" | "coins" | null;
  const goblet = (base: Vec, axis: Vec, metal: Fill, gemCols: string[], fillKind: Fill2, size = 1) => {
    const A = axis.clone().normalize();
    const tmp = Math.abs(A.y) < 0.9 ? new V(0, 1, 0) : new V(1, 0, 0);
    const U = tmp.clone().cross(A).normalize();
    const W = A.clone().cross(U);
    const at = (y: number, r = 0, ang = 0) =>
      base
        .clone()
        .addScaledVector(A, y * size)
        .addScaledVector(U, Math.cos(ang) * r * size)
        .addScaledVector(W, Math.sin(ang) * r * size);
    b.lathe(
      GOBLET.map(([x, y]): [number, number] => [x * size, y * size]),
      { at: base, axis: A, segments: 10, color: metal, bone: root },
    );
    P(new THREE.SphereGeometry(0.023 * size, 8, 6), metal, { at: at(0.075) });
    P(new THREE.TorusGeometry(0.03 * size, 0.006 * size, 4, 8), GOLD_L, { at: at(0.03), dir: A, axis: "z" });
    P(new THREE.TorusGeometry(0.056 * size, 0.005 * size, 4, 10), GOLD_L, { at: at(0.2), dir: A, axis: "z" });
    P(new THREE.TorusGeometry(0.06 * size, 0.005 * size, 4, 10), GOLD_D, { at: at(0.012), dir: A, axis: "z" });
    for (let k = 0; k < 6; k++) {
      const ang = (k * Math.PI) / 3;
      const out = U.clone().multiplyScalar(Math.cos(ang)).addScaledVector(W, Math.sin(ang)).addScaledVector(A, 0.25);
      gem(at(0.15, 0.056, ang), out, 0.03 * size, gemCols[k % gemCols.length]);
    }
    gem(at(0.075, 0.021, 0), U, 0.022 * size, gemCols[0]);
    if (fillKind === "wine")
      P(new THREE.CylinderGeometry(0.046 * size, 0.046 * size, 0.004, 10), WINE, { at: at(0.176), dir: A });
    if (fillKind === "elixir")
      glow(
        P(new THREE.CylinderGeometry(0.046 * size, 0.046 * size, 0.004, 10), CYAN, { at: at(0.176), dir: A }),
        1,
      );
    if (fillKind === "coins")
      P(new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), COIN_PAINT, {
        at: at(0.165),
        dir: A,
        scale: [0.05 * size, 0.05 * size, 0.05 * size],
      });
    return at;
  };
  goblet(new V(0.5, heightAt(0.5, 0.15) - 0.02, 0.15), new V(0.03, 1, 0.02), GOLD, [EMERALD, RUBY, SAPPHIRE], "elixir");
  goblet(new V(-0.65, heightAt(-0.65, 0.05) - 0.02, 0.05), new V(-0.05, 1, 0.04), SILVER, [AMETHYST, SAPPHIRE, TOPAZ], "wine");
  const tipBase = new V(0.0, heightAt(0, 0.85) + 0.07, 0.85);
  const tipAxis = new V(0.95, 0.28, 0.2).normalize();
  goblet(tipBase, tipAxis, GOLD, [RUBY, TOPAZ, EMERALD], null, 1.05);
  const mouth = tipBase.clone().addScaledVector(tipAxis, 0.21);
  for (let k = 0; k < 8; k++) {
    const x = mouth.x + 0.04 + k * 0.045 + (R() - 0.5) * 0.02;
    const z = mouth.z + (R() - 0.5) * 0.1 + k * 0.01;
    coin(k % 3 === 2 ? 1 : 0, new V(x, Math.max(heightAt(x, z), 0) + 0.006 + (k === 0 ? 0.05 : 0), z), new THREE.Euler((R() - 0.5) * 1.3, R() * 6.28, (R() - 0.5) * 1.3), 1);
  }
  goblet(new V(-0.1, heightAt(-0.1, -0.62) + 0.0, -0.62), new V(0.0, 1, 0.02), GOLD, [SAPPHIRE, AMETHYST, RUBY], "coins", 0.8);

  // flush merged coins
  for (const bk of BUCKETS) {
    const a = mergeGeometries(bk.a);
    const c = mergeGeometries(bk.b);
    if (a) P(a, bk.top, { at: [0, 0, 0] });
    if (c) P(c, bk.inner, { at: [0, 0, 0] });
  }

  // ---------- big decorated coins ----------
  const bigCoin = (x: number, z: number, n: Vec) => {
    const N = n.clone().normalize();
    const c = new V(x, heightAt(x, z) + 0.062, z);
    P(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 16), "#e8a41c", { at: c, dir: N });
    for (const s of [1, -1])
      P(new THREE.CircleGeometry(0.066, 16), "#ffffff", {
        at: c.clone().addScaledVector(N, s * 0.0066),
        dir: N.clone().multiplyScalar(s),
        axis: "z",
        texture: COIN_TEX,
      });
  };
  bigCoin(0.55, 0.55, new V(0.25, 0.25, 0.93));
  bigCoin(0.36, 0.7, new V(-0.15, 0.3, 0.94));

  // ---------- gold bars ----------
  const bar = (x: number, y: number, z: number, yawDeg: number) => {
    const a = (yawDeg * Math.PI) / 180;
    b.extrude(
      [
        [-0.09, 0],
        [0.09, 0],
        [0.075, 0.05],
        [-0.075, 0.05],
      ],
      {
        at: [x, y, z],
        x: [Math.cos(a), 0, -Math.sin(a)],
        thickness: 0.09,
        bevel: 0.005,
        color: GOLD,
        bone: root,
      },
    );
    P(new THREE.BoxGeometry(0.1, 0.004, 0.05), GOLD_D, { at: [x, y + 0.05, z], rotation: [0, yawDeg, 0] });
  };
  const bx = -0.9;
  const bz = 0.5;
  const by = heightAt(bx, bz) - 0.01;
  bar(bx, by, bz - 0.055, 80);
  bar(bx + 0.005, by, bz + 0.05, 95);
  bar(bx, by + 0.05, bz, 60);

  // ---------- necklace ----------
  const chainPts: Vec[] = [];
  const pearlPts: Vec[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = (i - 5) / 5;
    const x = t * 0.2;
    const z = 0.5 + 0.11 * (1 - t * t);
    chainPts.push(new V(x, heightAt(x, z) + 0.014, z));
    const z2 = 0.5 + 0.07 * (1 - t * t);
    if (i % 1 === 0 && i > 0 && i < 10) pearlPts.push(new V(x, heightAt(x, z2) + 0.016, z2));
  }
  b.sweep(catmull(chainPts), 0.004, { color: "#ffe27a", sides: 5, bone: root });
  const pearls = pearlPts.map((p) => new THREE.SphereGeometry(0.014, 8, 6).translate(p.x, p.y, p.z));
  const pm = mergeGeometries(pearls);
  if (pm) P(pm, PEARL, { at: [0, 0, 0] });
  const pend = chainPts[5];
  P(new THREE.SphereGeometry(0.014, 6, 5), GOLD, { at: [pend.x, pend.y + 0.004, pend.z + 0.012] });
  gem(new V(pend.x, pend.y + 0.03, pend.z + 0.045), new V(0, 1, 0.9), 0.06, RUBY, 0.4);

  // ---------- rings ----------
  const flatRing = (x: number, z: number, col: string) => {
    const y = heightAt(x, z) + 0.006;
    P(new THREE.TorusGeometry(0.022, 0.0045, 5, 10), GOLD_L, { at: [x, y, z], rotation: [88, 0, 0] });
    gem(new V(x, y + 0.006, z + 0.024), new V(0, 1, 0.35), 0.024, col);
  };
  flatRing(0.78, 0.2, EMERALD);
  flatRing(-0.15, 0.95, AMETHYST);
  P(new THREE.TorusGeometry(0.022, 0.0045, 5, 10), GOLD_L, {
    at: [0.3, heightAt(0.3, 0.45) + 0.024, 0.45],
    rotation: [0, 70, 0],
  });
  gem(new V(0.3, heightAt(0.3, 0.45) + 0.05, 0.45), new V(0, 1, 0), 0.026, TOPAZ);

  // ---------- hero gems and scattered jewels ----------
  gem(new V(-0.58, heightAt(-0.58, -0.2) + 0.03, -0.2), new V(-0.1, 1, 0.1), 0.11, RUBY, 0.5);
  gem(new V(0.6, heightAt(0.6, -0.15) + 0.03, -0.15), new V(0.1, 1, 0.1), 0.11, SAPPHIRE, 0.5);
  gem(new V(0.05, heightAt(0.05, 1.0) + 0.03, 1.0), new V(0, 1, 0.2), 0.095, EMERALD, 0.5);
  const R2 = rng(5);
  let placed = 0;
  for (let i = 0; i < 160 && placed < 26; i++) {
    const a = R2() * Math.PI * 2;
    const rr = Math.sqrt(R2()) * 0.8;
    const x = Math.cos(a) * rr * MOUND_SX;
    const z = MOUND_Z + Math.sin(a) * rr * MOUND_SZ;
    const sz = 0.035 + R2() * 0.025;
    const axis = new V((R2() - 0.5) * 0.9, 1, (R2() - 0.5) * 0.9);
    if (inChest(x, z) || Math.hypot(x + 0.42, z - 0.55) < 0.17) continue;
    gem(new V(x, heightAt(x, z) + sz * 0.3, z), axis, sz, GEMC[placed % 5]);
    placed++;
  }
  for (let i = 0; i < 10; i++) {
    const a = R2() * Math.PI * 2;
    const rr = Math.sqrt(R2()) * 0.85;
    const x = Math.cos(a) * rr * MOUND_SX;
    const z = MOUND_Z + Math.sin(a) * rr * MOUND_SZ;
    if (inChest(x, z)) continue;
    P(new THREE.IcosahedronGeometry(0.026, 0), GEMC[i % 5], {
      at: [x, heightAt(x, z) + 0.012, z],
      rotation: [R2() * 90, R2() * 90, 0],
      scale: [1, 1.3, 1],
      flat: true,
    });
  }

  // ---------- glowing crystal clusters ----------
  const CRYSTAL: [number, number][] = [
    [0, 0],
    [0.05, 0],
    [0.052, 0.2],
    [0, 0.3],
  ];
  const cluster = (cx: number, cz: number, color: string, flip: number) => {
    const spec: [number, number, number, number, number][] = [
      [0, 0, 1.3, 0.05, 0.0],
      [0.07 * flip, 0.06, 1.0, 0.35, 0.25],
      [-0.06 * flip, 0.07, 0.8, -0.3, 0.3],
      [0.03 * flip, -0.08, 0.9, 0.2, -0.4],
      [-0.1 * flip, -0.03, 0.55, -0.5, -0.2],
    ];
    for (const [dx, dz, s, tx, tz] of spec) {
      const axis = new V(tx * flip, 1, tz).normalize();
      glow(
        b.lathe(
          CRYSTAL.map(([x, y]): [number, number] => [x * s, y * s]),
          { at: new V(cx + dx, -0.01, cz + dz), axis, segments: 6, color, bone: root },
        ),
        0.6,
      );
    }
  };
  cluster(0.78, -0.4, CYAN, 1);
  cluster(-0.78, -0.42, AMETHYST, -1);

  // ---------- sparkles ----------
  const R3 = rng(21);
  const sparkle = Array.from({ length: 14 }, () =>
    frame([(R3() - 0.5) * 1.3, 0.55 + R3() * 0.5, -0.3 + R3() * 1.0], [0, 1, 0]),
  );
  glow(b.cards(sparkle, STAR, { size: [0.07, 0.07], vary: 0.4, rng: R3, bone: root }), 1);

  return b.root;
}

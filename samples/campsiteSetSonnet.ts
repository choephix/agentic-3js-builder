import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { DEG, rng } from "../src/math";
import { cells, grain, paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Low-Poly Campsite",
  description:
    "A faceted low-poly campsite: striped A-frame tent with pennant and guy ropes, stone-ringed campfire under a tripod with a stew pot, bedroll, log seats, chopping stump with axe, firewood stack, backpack, lantern and pines.",
  style: "low-poly",
  commit: "88fc1f0",
};

type V = [number, number, number];

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours)
const GRASS = ["#78b84e", "#6aa844", "#86c45a", "#5f9a3e"];
const DIRT = "#9a6d45";
const DIRT_DK = "#7d5636";
const DIRT_SIDE = "#6a4a2e";
const ASH = "#4b4540";
const ASH_LT = "#6c635b";
const STONE = ["#9aa0a5", "#7f858b", "#adb2b6", "#666c73"];
const MOSS = "#6f9a3a";
const BARK = "#6a4426";
const BARK_LT = "#8a5d34";
const CHAR = "#2a2320";
const WOOD = "#b27a42";
const WOOD_DK = "#7a4f2a";
const CUT = "#dcb47a";
const TENT_A = "#2b9d9a";
const TENT_B = "#f0e3c3";
const TENT_SEAM = "#1d6f6d";
const TENT_HEM = "#6a5238";
const TENT_IN = "#175c5b";
const TENT_FLOOR = "#3b4f4d";
const ROPE = "#dcc58f";
const ROPE_DK = "#a98b52";
const FLAME_R = "#e8431b";
const FLAME_O = "#ff8c24";
const FLAME_Y = "#ffd23f";
const FLAME_C = "#fff3b0";
const EMBER = "#ff5e1a";
const IRON = "#3a3d43";
const IRON_LT = "#5c616a";
const SOOT = "#1f2024";
const STEEL = "#8b95a0";
const STEEL_LT = "#dfe5ea";
const LEATHER = "#7b4a2b";
const LEATHER_DK = "#4f2f1b";
const BRASS = "#d9a93c";
const RED = "#c9432f";
const RED_DK = "#92301f";
const CREAM = "#f1e6c8";
const MAT = "#c2a566";
const MAT_DK = "#97803f";
const PLAID = ["#3f6f4a", "#e0b43c", "#a8352a"];
const OLIVE = "#6c7e3b";
const OLIVE_DK = "#4d5c28";
const ORANGE = "#e9822a";
const BLUE = "#4f8fd0";
const PINE = ["#2f7d4a", "#3b9356", "#256a3e"];
const STEW = "#c4782a";

// ---------------------------------------------------------------------------------------------------------------
// Layout (metres, +Z front, +X left)
const G = 0.08; // ground top
const GROUND_R = 2.6;
const FX = 0.45; // campfire centre
const FZ = 0.5;
const TC = { x: -0.9, z: -0.85 }; // tent centre
const TYAW = 42;
const TL = 0.9; // tent half length
const TW = 0.72; // tent half width
const TH = 1.0; // tent ridge height above ground top
const TWH = 0.2; // tent sidewall height
const BC = { x: 1.5, z: -0.75 }; // bedroll centre
const BYAW = -5;

const rot2 = (cx: number, cz: number, deg: number) => {
  const s = Math.sin(deg * DEG);
  const c = Math.cos(deg * DEG);
  return (x: number, y: number, z: number): V => [cx + x * c + z * s, y, cz - x * s + z * c];
};
const locOf = (cx: number, cz: number, deg: number) => {
  const s = Math.sin(deg * DEG);
  const c = Math.cos(deg * DEG);
  return (p: THREE.Vector3): [number, number] => {
    const dx = p.x - cx;
    const dz = p.z - cz;
    return [dx * c - dz * s, dx * s + dz * c];
  };
};
const tt = rot2(TC.x, TC.z, TYAW);
const T = (x: number, y: number, z: number): V => tt(x, G + y, z);
const tLoc = locOf(TC.x, TC.z, TYAW);
const tb = rot2(BC.x, BC.z, BYAW);
const bLoc = locOf(BC.x, BC.z, BYAW);

const qOf = (r: V) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, "YXZ"));

const segDist = (px: number, pz: number, ax: number, az: number, bx: number, bz: number) => {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
};

export default function build() {
  const b = createBuilder({ name: "campsite", paintSize: 1024 });
  const root = b.joint("campRoot", { at: [0, 0, 0] });
  const R = rng(2024);

  type PartOpts = NonNullable<Parameters<typeof b.part>[2]>;
  type RodOpts = NonNullable<Parameters<typeof b.rod>[3]>;
  type Fill = Parameters<typeof b.part>[1];
  const part = (geo: THREE.BufferGeometry, color: Fill, o: PartOpts = {}) =>
    b.part(geo, color, { bone: root, flat: true, ...o });
  const rod = (a: V, c: V, r: number | [number, number], color: Fill, o: RodOpts = {}) =>
    b.rod(a, c, r, { color, bone: root, sides: 6, smooth: false, ...o } as RodOpts);
  const box = (w: number, h: number, d: number, color: Fill, at: V, rot: V = [0, 0, 0], o: PartOpts = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, { at, quat: qOf(rot), ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V, rot: V = [0, 0, 0], o: PartOpts = {}) =>
    part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, quat: qOf(rot), ...o });

  // ---- batching of small repeated bits (one merged part per colour) ----
  const mm = new THREE.Matrix4();
  const qq = new THREE.Quaternion();
  const ee = new THREE.Euler();
  const toGeo = (geo: THREE.BufferGeometry, at: V, rot: V, scale: V | number) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    ee.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG, "YXZ");
    qq.setFromEuler(ee);
    const sc = typeof scale === "number" ? new THREE.Vector3(scale, scale, scale) : new THREE.Vector3(...scale);
    mm.compose(new THREE.Vector3(...at), qq, sc);
    g.applyMatrix4(mm);
    return g;
  };
  const bits = new Map<string, THREE.BufferGeometry[]>();
  const glowBits = new Map<string, THREE.BufferGeometry[]>();
  const bit = (color: string, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], scale: V | number = 1) => {
    const list = bits.get(color) ?? [];
    list.push(toGeo(geo, at, rot, scale));
    bits.set(color, list);
  };
  const gbit = (color: string, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], scale: V | number = 1) => {
    const list = glowBits.get(color) ?? [];
    list.push(toGeo(geo, at, rot, scale));
    glowBits.set(color, list);
  };
  const ICO = new THREE.IcosahedronGeometry(1, 0);
  const OCT = new THREE.OctahedronGeometry(1, 0);
  const DODE = new THREE.DodecahedronGeometry(1, 0);
  const BOX1 = new THREE.BoxGeometry(1, 1, 1);

  // ---- end-grain discs (one shared drawing) ----
  const RINGS = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#dcb47a"/>
<circle cx="32" cy="32" r="31" fill="#dcb47a" stroke="#5e3d22" stroke-width="4"/>
<circle cx="32" cy="32" r="25" fill="none" stroke="#b98a52" stroke-width="2"/>
<circle cx="32" cy="32" r="19" fill="none" stroke="#b98a52" stroke-width="2"/>
<circle cx="32" cy="32" r="13" fill="none" stroke="#b98a52" stroke-width="2"/>
<circle cx="32" cy="32" r="7" fill="none" stroke="#a97a45" stroke-width="2"/>
<circle cx="32" cy="32" r="2.5" fill="#8a5d34"/>
<path d="M32 32 L52 24" stroke="#8c6238" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  const SPIRAL = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#8a6a4a"/>
<path d="M32 32 m0 -3 a3 3 0 1 1 -3 3 a7 7 0 1 1 7 7 a11 11 0 1 1 -11 -11 a15 15 0 1 1 15 15 a19 19 0 1 1 -19 -19 a23 23 0 1 1 23 23" fill="none" stroke="#e0b43c" stroke-width="3"/>
<circle cx="32" cy="32" r="31" fill="none" stroke="#5a3a24" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  const PATCH = svg(
    `<svg viewBox="0 0 48 48"><rect x="3" y="3" width="42" height="42" rx="3" fill="#c9432f"/>
<rect x="6.5" y="6.5" width="35" height="35" rx="2" fill="none" stroke="#f3e3c3" stroke-width="1.6" stroke-dasharray="3 2.4"/>
<path d="M24 11 L32 24 H16 Z" fill="#f3e3c3"/><path d="M24 18 L35 35 H13 Z" fill="#f3e3c3"/><rect x="22" y="35" width="4" height="5" fill="#f3e3c3"/></svg>`,
    { size: 256 },
  );
  const discs: THREE.BufferGeometry[] = [];
  const spirals: THREE.BufferGeometry[] = [];
  const disc = (list: THREE.BufferGeometry[], at: V, rot: V, radius: number, segs = 8, spin = 0) => {
    const g = new THREE.CircleGeometry(radius, segs, (spin * DEG) % (Math.PI * 2));
    list.push(toGeo(g, at, rot, 1));
  };
  // a disc facing along a horizontal heading
  const endDisc = (list: THREE.BufferGeometry[], c: V, headingDeg: number, r: number, off = 0.004) => {
    const s = Math.sin(headingDeg * DEG);
    const k = Math.cos(headingDeg * DEG);
    disc(list, [c[0] + s * off, c[1], c[2] + k * off], [0, headingDeg, 0], r, 8, R() * 360);
  };

  // =============================================================================================================
  // GROUND
  // =============================================================================================================
  const doorPt = T(0, 0, TL + 0.1);
  const groundPaint = paint((p, n) => {
    if (n.y < 0.7) return DIRT_SIDE;
    const d = Math.hypot(p.x - FX, p.z - FZ);
    const c = cells(p, 0.42, 5);
    const c2 = cells(p, 0.2, 9);
    if (d < 0.58 + 0.06 * c2.id) return c.id > 0.5 ? ASH : ASH_LT;
    if (d < 0.86 + 0.22 * c.id) return c2.id > 0.5 ? DIRT : DIRT_DK;
    if (segDist(p.x, p.z, doorPt[0], doorPt[2], FX, FZ) < 0.2 + 0.1 * c2.id) return c2.id > 0.4 ? DIRT : DIRT_DK;
    if (Math.hypot(p.x - BC.x, p.z - BC.z) < 0.5 && c2.id > 0.75) return DIRT;
    return GRASS[Math.min(3, Math.floor(c.id * 4))];
  });
  b.lathe(
    [
      [0, 0],
      [GROUND_R - 0.1, 0],
      [GROUND_R, 0.03],
      [GROUND_R - 0.05, G],
      [0, G],
    ],
    { at: [0, 0, 0], segments: 11, color: groundPaint, bone: root, name: "ground" },
  );

  // =============================================================================================================
  // TENT
  // =============================================================================================================
  const fabric = paint((p) => {
    const [, lz] = tLoc(p);
    const q = (lz + TL + 0.1) / 0.46;
    const f = q - Math.floor(q);
    if (p.y < G + 0.09) return TENT_HEM;
    if (f < 0.06) return TENT_SEAM;
    return Math.floor(q) % 2 ? TENT_B : TENT_A;
  });
  const gable = paint((p) => {
    const [lx] = tLoc(p);
    const roofY = TWH + (TH - TWH) * (1 - Math.min(1, Math.abs(lx) / TW));
    const d = roofY - (p.y - G);
    if (p.y < G + 0.09) return TENT_HEM;
    if (d < 0.06) return TENT_SEAM;
    if (d < 0.14) return TENT_B;
    return TENT_A;
  });
  const slab = (pts: V[], color: Fill, thickness = 0.022, o: Record<string, unknown> = {}) =>
    b.slab(pts, { color, thickness, bone: root, ...o } as Parameters<typeof b.slab>[1]);
  const L = TL;
  const W = TW;
  const H = TH;
  const WH = TWH;
  // roof panels
  for (const s of [1, -1]) {
    slab([T(s * W, WH, -L - 0.04), T(0, H + 0.012, -L - 0.04), T(0, H + 0.012, L + 0.04), T(s * W, WH, L + 0.04)], fabric, 0.022, {
      name: `roof${s > 0 ? "L" : "R"}`,
    });
    // side walls
    slab([T(s * W, 0, -L), T(s * W, WH + 0.01, -L), T(s * W, WH + 0.01, L), T(s * W, 0, L)], fabric, 0.022, {
      name: `wall${s > 0 ? "L" : "R"}`,
    });
    // interior liners (dark) so the doorway reads as a cosy hollow
    slab([T(s * (W - 0.035), WH - 0.02, -L + 0.03), T(0, H - 0.03, -L + 0.03), T(0, H - 0.03, L - 0.03), T(s * (W - 0.035), WH - 0.02, L - 0.03)], TENT_IN, 0.012, {
      name: `liner${s > 0 ? "L" : "R"}`,
    });
  }
  // back gable
  slab([T(-W, 0, -L), T(-W, WH + 0.01, -L), T(0, H, -L), T(W, WH + 0.01, -L), T(W, 0, -L)], gable, 0.024, { name: "gableBack" });
  slab([T(-W + 0.04, 0.02, -L + 0.03), T(-W + 0.04, WH, -L + 0.03), T(0, H - 0.04, -L + 0.03), T(W - 0.04, WH, -L + 0.03), T(W - 0.04, 0.02, -L + 0.03)], TENT_IN, 0.01, { name: "linerBack" });
  // small vent window on the back gable with a rain flap
  slab([T(-0.2, 0.46, -L - 0.012), T(0.2, 0.46, -L - 0.012), T(0.2, 0.74, -L - 0.012), T(-0.2, 0.74, -L - 0.012)], TENT_B, 0.012, { name: "ventTrim" });
  slab([T(-0.16, 0.5, -L - 0.022), T(0.16, 0.5, -L - 0.022), T(0.16, 0.7, -L - 0.022), T(-0.16, 0.7, -L - 0.022)], TENT_IN, 0.012, { name: "vent" });
  slab([T(-0.23, 0.72, -L - 0.03), T(0.23, 0.72, -L - 0.03), T(0.2, 0.82, -L - 0.06), T(-0.2, 0.82, -L - 0.06)], TENT_A, 0.014, { name: "ventFlap" });
  // groundsheet
  slab([T(-W + 0.02, 0.012, -L + 0.02), T(W - 0.02, 0.012, -L + 0.02), T(W - 0.02, 0.012, L), T(-W + 0.02, 0.012, L)], TENT_FLOOR, 0.02, { name: "tentFloor" });

  // door flaps on hinges
  const flapJoints = [1, -1].map((s) =>
    b.joint(`doorFlap${s > 0 ? "L" : "R"}`, {
      parent: root,
      at: T(s * W, 0, L),
      aim: T(s * W, WH, L),
      role: "hinge",
    }),
  );
  [1, -1].forEach((s, i) => {
    slab([T(s * W, 0, L), T(s * W, WH + 0.01, L), T(0, H, L), T(s * 0.4 * W, 0, L)], gable, 0.024, {
      bone: flapJoints[i],
      name: `flap${s > 0 ? "L" : "R"}`,
    });
    // tie-back binding along the inner edge
    rod(T(s * 0.4 * W, 0.02, L + 0.02), T(s * 0.01, H - 0.03, L + 0.02), 0.011, ROPE, { sides: 4, bone: flapJoints[i] });
    // toggles
    for (const k of [0.25, 0.5, 0.75]) {
      const px = s * (0.4 * W * (1 - k));
      cyl(0.014, 0.014, 0.05, 5, WOOD_DK, T(px, 0.02 + k * (H - 0.05), L + 0.04), [0, 0, 90], { bone: flapJoints[i] });
    }
  });

  // pegged-down hem loops + corner loops
  for (const s of [1, -1]) for (const z of [-L * 0.8, -L * 0.3, L * 0.3, L * 0.8])
    bit(ROPE_DK, new THREE.BoxGeometry(0.035, 0.012, 0.012), T(s * (W + 0.025), 0.02, z), [0, TYAW, 0]);

  // poles: ridge, A-frames front and back, pennant mast
  const POLE = WOOD;
  rod(T(0, H + 0.035, -L - 0.08), T(0, H + 0.035, L + 0.08), 0.021, POLE, { sides: 6 });
  rod(T(0, H + 0.035, L + 0.08), T(0, H + 0.4, L + 0.08), [0.012, 0.007], WOOD_DK, { sides: 5 });
  for (const z of [L + 0.08, -L - 0.08])
    for (const s of [1, -1]) {
      rod(T(s * (W + 0.01), 0, z), T(s * 0.012, H + 0.03, z), [0.026, 0.02], POLE, { sides: 6 });
    }
  // lashings where the A-poles meet the ridge
  for (const z of [L + 0.08, -L - 0.08])
    cyl(0.04, 0.04, 0.07, 6, ROPE_DK, T(0, H + 0.03, z), [90, 0, 0]);
  // pennant
  const PENNANT: OutlinePoint[] = [
    [0, 0],
    [0.36, 0.015],
    [0.27, 0.07, "sharp"],
    [0.37, 0.125],
    [0, 0.14],
  ];
  b.extrude(PENNANT, {
    at: T(0.0, H + 0.26, L + 0.08),
    x: [0.75, 0, -0.55],
    y: [0, 1, 0],
    thickness: 0.008,
    color: paint((_p, _n, s) => (s[1] > 0.045 && s[1] < 0.075 ? RED : BRASS)),
    bone: root,
    name: "pennant",
  });
  bit(BRASS, new THREE.SphereGeometry(0.018, 5, 4), T(0, H + 0.41, L + 0.08));

  // guy ropes and pegs
  const guys: Array<[V, V]> = [
    [T(0, H, -L - 0.08), T(0, 0, -L - 0.38)],
    [T(-W, WH, -0.45), T(-(W + 0.42), 0, -0.45)],
    [T(-W, WH, 0.45), T(-(W + 0.42), 0, 0.45)],
    [T(W, WH, 0.45), T(W + 0.42, 0, 0.45)],
    [T(W, WH, -0.45), T(W + 0.42, 0, -0.45)],
  ];
  for (const [top, peg] of guys) {
    const pegTop: V = [peg[0], G + 0.1, peg[2]];
    rod(top, pegTop, 0.0085, ROPE, { sides: 4 });
    rod([pegTop[0], G + 0.14, pegTop[2]], [pegTop[0] + (top[0] - peg[0]) * 0.04, G - 0.02, pegTop[2] + (top[2] - peg[2]) * 0.04], [0.017, 0.008], WOOD_DK, { sides: 5 });
    bit(WOOD, new THREE.BoxGeometry(0.03, 0.012, 0.016), [pegTop[0] + (top[0] - pegTop[0]) * 0.35, pegTop[1] + (top[1] - pegTop[1]) * 0.35, pegTop[2] + (top[2] - pegTop[2]) * 0.35], [0, 0, 0]);
  }
  // repair patch decal on the left roof
  {
    const lxp = 0.34;
    const lzp = 0.15;
    const roofY = WH + (H - WH) * (1 - lxp / W);
    const at = T(lxp, roofY + 0.018, lzp);
    const n = tt(1, 0, 0);
    const base = tt(0, 0, 0);
    const side = new THREE.Vector3(n[0] - base[0], 0, n[2] - base[2]);
    const nrm = side.multiplyScalar(H - WH).add(new THREE.Vector3(0, W, 0)).normalize();
    part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at, dir: nrm.toArray() as V, axis: "z", texture: PATCH, flat: false });
  }
  // lantern glowing inside the doorway + a rolled blanket
  box(0.4, 0.07, 0.62, PLAID[0], T(-0.3, 0.07, -0.2), [0, TYAW + 10, 0], {});
  box(0.34, 0.1, 0.22, CREAM, T(0.23, 0.09, -0.55), [0, TYAW - 12, 0], {});
  cyl(0.045, 0.05, 0.05, 6, IRON, T(0.05, 0.06, 0.55));
  glow(part(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 6), "#ffc65a", { at: T(0.05, 0.12, 0.55) }), 1.2);
  cyl(0.052, 0.036, 0.018, 6, IRON, T(0.05, 0.18, 0.55));

  // =============================================================================================================
  // CAMPFIRE
  // =============================================================================================================
  part(new THREE.CylinderGeometry(0.46, 0.5, 0.04, 10), ASH, { at: [FX, G + 0.02, FZ] });
  // stone ring
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + (R() - 0.5) * 0.2;
    const rr = 0.53 + R() * 0.05;
    const sc: V = [0.15 + R() * 0.05, 0.09 + R() * 0.04, 0.13 + R() * 0.04];
    bit(STONE[Math.floor(R() * 4)], ICO, [FX + Math.sin(a) * rr, G + sc[1] * 0.75, FZ + Math.cos(a) * rr], [R() * 25, R() * 360, R() * 25], sc);
  }
  // charcoal lumps
  for (let i = 0; i < 7; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.12 + R() * 0.3;
    bit(CHAR, ICO, [FX + Math.sin(a) * rr, G + 0.05, FZ + Math.cos(a) * rr], [R() * 40, R() * 360, 0], [0.05 + R() * 0.03, 0.035, 0.05]);
  }
  // logs
  const logPaint = paint((_p, _n, s) => (s[0] < 0.2 || s[0] > 0.8 ? CHAR : BARK));
  const fireLog = (ax: number, az: number, bx: number, bz: number, y: number, r = 0.048) =>
    rod([FX + ax, y, FZ + az], [FX + bx, y, FZ + bz], r, logPaint, { sides: 6, caps: "flat" });
  fireLog(-0.36, -0.17, 0.34, -0.2, G + 0.075);
  fireLog(-0.34, 0.17, 0.37, 0.15, G + 0.075);
  fireLog(-0.14, -0.32, -0.12, 0.33, G + 0.17);
  fireLog(0.15, -0.3, 0.13, 0.35, G + 0.17);
  fireLog(-0.3, -0.26, 0.3, 0.25, G + 0.255, 0.04);
  fireLog(0.3, -0.26, -0.3, 0.25, G + 0.255, 0.04);
  // flames: crossed extruded tongues
  const flameOutline = (w: number, h: number): OutlinePoint[] => [
    [-w, 0],
    [-w * 1.05, 0.3 * h],
    [-w * 0.5, 0.56 * h],
    [-w * 0.2, h, "sharp"],
    [w * 0.12, 0.62 * h],
    [w * 0.7, 0.84 * h, "sharp"],
    [w * 0.74, 0.4 * h],
    [w, 0],
  ];
  const tongues: Array<{ yaw: number; w: number; h: number; col: string; off?: [number, number]; t: number }> = [
    { yaw: 0, w: 0.17, h: 0.34, col: FLAME_R, t: 0.03 },
    { yaw: 90, w: 0.17, h: 0.3, col: FLAME_R, t: 0.03 },
    { yaw: 0, w: 0.13, h: 0.43, col: FLAME_O, t: 0.026, off: [0, 0.02] },
    { yaw: 60, w: 0.12, h: 0.38, col: FLAME_O, t: 0.026, off: [0.02, 0] },
    { yaw: 120, w: 0.12, h: 0.36, col: FLAME_O, t: 0.026, off: [-0.02, 0.01] },
    { yaw: 30, w: 0.085, h: 0.37, col: FLAME_Y, t: 0.022 },
    { yaw: 95, w: 0.08, h: 0.3, col: FLAME_Y, t: 0.022, off: [0.01, 0.02] },
    { yaw: 150, w: 0.08, h: 0.32, col: FLAME_Y, t: 0.022 },
    { yaw: 10, w: 0.04, h: 0.2, col: FLAME_C, t: 0.018 },
    { yaw: 100, w: 0.04, h: 0.18, col: FLAME_C, t: 0.018 },
    // licking tongues beside the pot
    { yaw: 20, w: 0.07, h: 0.47, col: FLAME_O, t: 0.02, off: [0.2, -0.05] },
    { yaw: 75, w: 0.065, h: 0.4, col: FLAME_Y, t: 0.02, off: [-0.2, 0.08] },
    { yaw: 110, w: 0.06, h: 0.36, col: FLAME_O, t: 0.02, off: [0.05, 0.22] },
    { yaw: 5, w: 0.06, h: 0.38, col: FLAME_O, t: 0.02, off: [-0.08, -0.2] },
  ];
  for (const f of tongues) {
    const a = f.yaw * DEG;
    const off = f.off ?? [0, 0];
    glow(
      b.extrude(flameOutline(f.w, f.h), {
        at: [FX + off[0], G + 0.1, FZ + off[1]],
        x: [Math.cos(a), 0, Math.sin(a)],
        y: [0, 1, 0],
        thickness: f.t,
        color: f.col,
        bone: root,
        name: "flame",
      }),
      1,
    );
  }
  // embers on the logs, sparks in the air
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.1 + R() * 0.32;
    gbit(EMBER, OCT, [FX + Math.sin(a) * rr, G + 0.045 + R() * 0.2, FZ + Math.cos(a) * rr], [R() * 90, R() * 90, 0], [0.025, 0.018, 0.025]);
  }
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + R();
    const rr = 0.18 + R() * 0.28;
    gbit(FLAME_Y, OCT, [FX + Math.sin(a) * rr, G + 0.65 + R() * 0.55, FZ + Math.cos(a) * rr], [R() * 90, R() * 90, 0], [0.014, 0.022, 0.014]);
  }

  // tripod
  const APEX: V = [FX, G + 1.3, FZ];
  const LEG_A = [75, 195, 315];
  for (const a of LEG_A) {
    const base: V = [FX + Math.sin(a * DEG) * 0.74, G, FZ + Math.cos(a * DEG) * 0.74];
    const d = new THREE.Vector3(APEX[0] - base[0], APEX[1] - base[1], APEX[2] - base[2]).normalize();
    const top: V = [APEX[0] + d.x * 0.12, APEX[1] + d.y * 0.12, APEX[2] + d.z * 0.12];
    rod(base, top, [0.03, 0.023], WOOD, { sides: 6 });
    cyl(0.04, 0.04, 0.02, 6, WOOD_DK, [base[0] + d.x * 0.02, base[1] + 0.02, base[2] + d.z * 0.02]);
    // foot wedge
    bit(WOOD_DK, ICO, [base[0] - d.x * 0.03, G + 0.02, base[2] - d.z * 0.03], [0, a, 0], [0.04, 0.025, 0.05]);
  }
  cyl(0.07, 0.07, 0.15, 6, ROPE_DK, [APEX[0], APEX[1] + 0.01, APEX[2]]);
  cyl(0.075, 0.075, 0.025, 6, ROPE, [APEX[0], APEX[1] + 0.045, APEX[2]]);
  cyl(0.075, 0.075, 0.025, 6, ROPE, [APEX[0], APEX[1] - 0.025, APEX[2]]);
  // hanging chain down to the pot bail
  const PB = G + 0.5; // pot bottom
  const bailTop = PB + 0.48;
  const chainTop = APEX[1] - 0.09;
  const linkN = Math.round((chainTop - bailTop) / 0.04);
  for (let i = 0; i < linkN; i++) {
    bit(IRON_LT, new THREE.TorusGeometry(0.02, 0.0055, 4, 6), [FX, chainTop - i * 0.04, FZ], [i % 2 ? 90 : 0, 0, 0], [0.8, 1.15, 1]);
  }
  // pot
  const potPaint = paint((_p, _n, s) => (s[0] < 0.1 ? SOOT : s[0] > 0.265 ? IRON_LT : IRON));
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.2, 0.04],
      [0.215, 0.25],
      [0.228, 0.28],
      [0.205, 0.28],
      [0.192, 0.235],
      [0.17, 0.06],
      [0, 0.06],
    ],
    { at: [FX, PB, FZ], segments: 10, color: potPaint, bone: root, name: "pot" },
  );
  part(new THREE.CylinderGeometry(0.185, 0.185, 0.02, 10), STEW, { at: [FX, PB + 0.205, FZ] });
  bit("#e8873a", new THREE.CylinderGeometry(0.022, 0.022, 0.016, 5), [FX + 0.06, PB + 0.22, FZ + 0.08], [0, 10, 0]);
  bit("#e8873a", new THREE.CylinderGeometry(0.022, 0.022, 0.016, 5), [FX - 0.09, PB + 0.22, FZ + 0.05], [0, 40, 0]);
  bit("#e8873a", new THREE.CylinderGeometry(0.022, 0.022, 0.016, 5), [FX + 0.1, PB + 0.22, FZ - 0.07], [0, 70, 0]);
  bit("#d8c48a", ICO, [FX - 0.05, PB + 0.225, FZ + 0.12], [0, 20, 0], [0.034, 0.02, 0.03]);
  bit("#d8c48a", ICO, [FX + 0.02, PB + 0.225, FZ - 0.08], [0, 80, 0], [0.03, 0.02, 0.032]);
  bit("#5f9a3e", ICO, [FX - 0.1, PB + 0.225, FZ - 0.03], [0, 0, 0], [0.02, 0.012, 0.02]);
  bit("#5f9a3e", ICO, [FX + 0.13, PB + 0.225, FZ + 0.02], [0, 0, 0], [0.02, 0.012, 0.02]);
  // bail
  b.sweep(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(FX - 0.228, PB + 0.265, FZ),
      new THREE.Vector3(FX - 0.18, PB + 0.4, FZ),
      new THREE.Vector3(FX, PB + 0.48, FZ),
      new THREE.Vector3(FX + 0.18, PB + 0.4, FZ),
      new THREE.Vector3(FX + 0.228, PB + 0.265, FZ),
    ]).getPoints(10).map((v) => [v.x, v.y, v.z]),
    0.0085,
    { color: IRON_LT, sides: 5, smooth: false, bone: root },
  );
  for (const s of [1, -1]) bit(IRON_LT, new THREE.BoxGeometry(0.03, 0.05, 0.05), [FX + s * 0.226, PB + 0.26, FZ]);
  bit(IRON_LT, new THREE.TorusGeometry(0.03, 0.007, 4, 6), [FX, bailTop, FZ], [0, 0, 0]);
  // lid on a hinge
  const lidJoint = b.joint("lidHinge", {
    parent: root,
    at: [FX, PB + 0.285, FZ - 0.215],
    dir: [1, 0, 0],
    role: "hinge",
  });
  b.lathe(
    [
      [0, 0],
      [0.215, 0],
      [0.222, 0.014],
      [0.19, 0.038],
      [0.09, 0.062],
      [0, 0.068],
    ],
    { at: [FX, PB + 0.285, FZ], segments: 10, color: IRON_LT, bone: lidJoint, name: "lid" },
  );
  part(new THREE.CylinderGeometry(0.02, 0.03, 0.035, 6), WOOD_DK, { at: [FX, PB + 0.285 + 0.085, FZ], bone: lidJoint });
  b.pose(lidJoint, { axis: [1, 0, 0], deg: -26 });
  // ladle
  rod([FX + 0.03, PB + 0.17, FZ + 0.05], [FX + 0.32, PB + 0.42, FZ + 0.18], 0.0085, WOOD_DK, { sides: 5 });
  part(new THREE.SphereGeometry(0.045, 6, 4), IRON, { at: [FX + 0.03, PB + 0.17, FZ + 0.05], scale: [1, 0.55, 1] });
  // =============================================================================================================
  // LOG SEATS
  // =============================================================================================================
  const barkGrain = (d: V) => grain(BARK_LT, BARK, { size: 0.045, axis: d, seed: 3 });
  const logSeat = (cx: number, cz: number, yaw: number, len: number, r: number) => {
    const d: V = [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)];
    const y0 = G + r * 0.9;
    const a: V = [cx - (d[0] * len) / 2, y0, cz - (d[2] * len) / 2];
    const c: V = [cx + (d[0] * len) / 2, y0, cz + (d[2] * len) / 2];
    rod(a, c, [r, r * 0.95], barkGrain(d), { sides: 8, caps: "flat" });
    endDisc(discs, c, yaw, r * 1.07);
    endDisc(discs, a, yaw + 180, r * 0.99);
    // knots and a snapped branch stub
    bit(BARK, new THREE.ConeGeometry(r * 0.28, r * 0.5, 5), [cx + d[2] * r * 0.9 + d[0] * len * 0.12, y0 + r * 0.2, cz - d[0] * r * 0.9 + d[2] * len * 0.12], [0, 0, 70]);
    bit(BARK, new THREE.ConeGeometry(r * 0.2, r * 0.4, 5), [cx - d[2] * r * 0.8 - d[0] * len * 0.28, y0 + r * 0.3, cz + d[0] * r * 0.8 - d[2] * len * 0.28], [0, 0, -60]);
    // moss
    bit(MOSS, DODE, [cx + d[0] * len * 0.3, y0 + r * 0.92, cz + d[2] * len * 0.3], [0, yaw, 0], [r * 0.55, r * 0.14, r * 0.9]);
    bit("#86b04a", DODE, [cx + d[0] * len * 0.37, y0 + r * 1.0, cz + d[2] * len * 0.37], [0, yaw + 30, 0], [r * 0.3, r * 0.08, r * 0.45]);
    return { d, top: y0 + r };
  };
  const seatA = logSeat(-0.25, 1.22, 45, 1.3, 0.14);
  const seatB = logSeat(1.5, 1.25, -30, 1.2, 0.13);

  // lantern on seat A
  {
    const lx = -0.25 + seatA.d[0] * 0.42;
    const lz = 1.22 + seatA.d[2] * 0.42;
    const y = seatA.top;
    cyl(0.062, 0.068, 0.03, 6, IRON, [lx, y + 0.015, lz]);
    glow(part(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), "#ffbd4a", { at: [lx, y + 0.1, lz] }), 1.3);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      rod([lx + Math.sin(a) * 0.054, y + 0.03, lz + Math.cos(a) * 0.054], [lx + Math.sin(a) * 0.054, y + 0.17, lz + Math.cos(a) * 0.054], 0.0045, IRON, { sides: 4 });
    }
    cyl(0.01, 0.07, 0.05, 6, IRON, [lx, y + 0.195, lz]);
    bit(IRON, new THREE.TorusGeometry(0.04, 0.005, 4, 8, Math.PI), [lx, y + 0.215, lz], [0, seatA.d[0] > 0 ? 45 : 0, 0]);
  }
  // tin mugs on seat B and by the fire
  const mug = (x: number, y: number, z: number, col: string) => {
    b.lathe(
      [
        [0, 0],
        [0.04, 0],
        [0.047, 0.09],
        [0.054, 0.095],
        [0.04, 0.095],
        [0.0, 0.082],
      ],
      { at: [x, y, z], segments: 7, color: paint((_p, _n, s) => (s[0] > 0.08 ? "#f2f2ee" : col)), bone: root, name: "mug" },
    );
    bit(col, new THREE.TorusGeometry(0.03, 0.007, 4, 6, Math.PI), [x + 0.05, y + 0.05, z], [0, 0, -90]);
  };
  mug(1.5 - seatB.d[0] * 0.25, seatB.top, 1.25 - seatB.d[2] * 0.25, BLUE);
  mug(FX + 0.72, G, FZ - 0.18, ORANGE);

  // =============================================================================================================
  // STUMP + AXE
  // =============================================================================================================
  const SX = -1.8;
  const SZ = 1.0;
  b.lathe(
    [
      [0, 0],
      [0.27, 0],
      [0.215, 0.08],
      [0.2, 0.3],
      [0.205, 0.34],
      [0, 0.34],
    ],
    { at: [SX, G - 0.005, SZ], segments: 8, color: grain(BARK_LT, BARK, { size: 0.045, axis: "y", seed: 5 }), bone: root, name: "stump" },
  );
  disc(discs, [SX, G + 0.339 + 0.004, SZ], [-90, 0, 0], 0.2, 8, 22);
  // roots
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + 0.4;
    bit(BARK, ICO, [SX + Math.sin(a) * 0.27, G + 0.02, SZ + Math.cos(a) * 0.27], [0, a * 57, 0], [0.09, 0.04, 0.05]);
  }
  {
    const E = new THREE.Vector3(SX + 0.04, G + 0.34, SZ + 0.02);
    const h = new THREE.Vector3(0.45, 0.8, 0.55).normalize();
    const bd = new THREE.Vector3(0, -1, 0).add(h.clone().multiplyScalar(h.y)).normalize();
    const edge = E.clone().add(new THREE.Vector3(0, -0.055, 0));
    const Hb = edge.clone().sub(bd.clone().multiplyScalar(0.19));
    const head: OutlinePoint[] = [
      [-0.055, -0.035],
      [-0.055, 0.035],
      [0.03, 0.042],
      [0.17, 0.115, "sharp"],
      [0.195, 0.0],
      [0.17, -0.115, "sharp"],
      [0.03, -0.042],
    ];
    b.extrude(head, {
      at: Hb,
      x: bd.toArray() as V,
      y: h.toArray() as V,
      thickness: [0.034, 0.034],
      bevel: 0.006,
      color: paint((_p, _n, s) => (s[0] > 0.15 ? STEEL_LT : s[0] < -0.02 ? IRON_LT : STEEL)),
      bone: root,
      name: "axeHead",
    });
    const hTop = Hb.clone().add(h.clone().multiplyScalar(0.78));
    rod(Hb.clone().sub(h.clone().multiplyScalar(0.05)).toArray() as V, hTop.toArray() as V, [0.02, 0.016], WOOD, { sides: 6 });
    rod(Hb.clone().add(h.clone().multiplyScalar(0.5)).toArray() as V, hTop.toArray() as V, 0.024, LEATHER_DK, { sides: 6 });
    bit(BRASS, new THREE.SphereGeometry(0.02, 5, 4), hTop.toArray() as V);
  }

  // =============================================================================================================
  // FIREWOOD STACK
  // =============================================================================================================
  {
    const sc = { x: 0.55, z: -1.9 };
    const heading = TYAW;
    const d: V = [Math.sin(heading * DEG), 0, Math.cos(heading * DEG)];
    const perp: V = [Math.cos(heading * DEG), 0, -Math.sin(heading * DEG)];
    const r = 0.056;
    const rows: Array<[number, number[]]> = [
      [G + r, [-0.165, -0.055, 0.055, 0.165]],
      [G + r + 0.098, [-0.11, 0, 0.11]],
      [G + r + 0.196, [-0.055, 0.055]],
    ];
    for (const [y, offs] of rows)
      for (const o of offs) {
        const len = 0.62 + R() * 0.1;
        const sh = (R() - 0.5) * 0.08;
        const cx = sc.x + perp[0] * o + d[0] * sh;
        const cz = sc.z + perp[2] * o + d[2] * sh;
        const a: V = [cx - (d[0] * len) / 2, y, cz - (d[2] * len) / 2];
        const c: V = [cx + (d[0] * len) / 2, y, cz + (d[2] * len) / 2];
        rod(a, c, r, barkGrain(d), { sides: 8, caps: "flat" });
        endDisc(discs, c, heading, r * 1.08);
        endDisc(discs, a, heading + 180, r * 1.08);
      }
    // retaining stakes
    for (const sgn of [-1, 1]) for (const o of [-0.27, 0.27]) {
      const px = sc.x + d[0] * sgn * 0.3 + perp[0] * o;
      const pz = sc.z + d[2] * sgn * 0.3 + perp[2] * o;
      rod([px, G + 0.31, pz], [px, G - 0.01, pz], [0.02, 0.012], WOOD_DK, { sides: 5 });
    }
    // twine
    bit(ROPE_DK, new THREE.BoxGeometry(0.03, 0.03, 0.03), [sc.x + d[0] * 0.3 + perp[0] * 0.27, G + 0.3, sc.z + d[2] * 0.3 + perp[2] * 0.27]);
  }

  // =============================================================================================================
  // BEDROLL
  // =============================================================================================================
  {
    const matPaint = paint((p) => {
      const [lx, lz] = bLoc(p);
      return Math.abs(lx) > 0.37 || Math.abs(lz) > 0.93 ? MAT_DK : MAT;
    });
    box(0.84, 0.03, 1.92, matPaint, [BC.x, G + 0.015, BC.z], [0, BYAW, 0]);
    const bagPaint = paint((p) => {
      const [lx, lz] = bLoc(p);
      const f = (lz + 0.9) / 0.19;
      const fr = f - Math.floor(f);
      if (Math.abs(lx) < 0.013 && p.y > G + 0.15) return STEEL_LT;
      if (fr < 0.07) return RED_DK;
      return RED;
    });
    b.sweep([tb(0, G + 0.115, -0.82), tb(0, G + 0.115, 0.82)], (t) => [0.3 - 0.08 * t, 0.085 - 0.014 * t], {
      color: bagPaint,
      sides: 8,
      smooth: false,
      bone: root,
      caps: "round",
      name: "sleepingBag",
    });
    // flannel fold-over at the head
    const plaid = (a: string, c: string, d: string, size: number) =>
      paint((p) => {
        const u = Math.floor(p.x / size) % 2 ? 1 : 0;
        const v = Math.floor(p.z / size) % 2 ? 1 : 0;
        return u + v === 0 ? a : u + v === 1 ? c : d;
      });
    slab(
      [tb(-0.27, 0, -0.58), tb(0.27, 0, -0.58), tb(0.25, 0, -0.2), tb(-0.25, 0, -0.2)].map((p) => [p[0], G + 0.206, p[2]] as V),
      plaid(PLAID[0], PLAID[1], PLAID[2], 0.045),
      0.016,
      { name: "flannel" },
    );
    // pillow
    box(0.38, 0.1, 0.25, paint((p) => (Math.floor(bLoc(p)[0] / 0.05) % 2 ? CREAM : "#dcd0b0")), tb(0, G + 0.085, -0.85), [0, BYAW, 0], {});
    // rolled blanket tied with straps
    const rollPaint = paint((p) => PLAID[Math.floor((bLoc(p)[0] + 1) / 0.075) % 3]);
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.66, 8), rollPaint, { at: tb(0, G + 0.1, 1.04), quat: qOf([0, BYAW, 90]) });
    for (const sgn of [1, -1]) {
      const o = tb(sgn * 0.334, G + 0.1, 1.04);
      const heading = BYAW + sgn * 90;
      disc(spirals, [o[0], o[1], o[2]], [0, heading, 0], 0.1, 8, 22.5);
    }
    for (const lxp of [-0.2, 0.2]) {
      part(new THREE.CylinderGeometry(0.106, 0.106, 0.04, 8), LEATHER, { at: tb(lxp, G + 0.1, 1.04), quat: qOf([0, BYAW, 90]) });
      part(new THREE.BoxGeometry(0.03, 0.03, 0.02), BRASS, { at: tb(lxp, G + 0.2, 1.04), quat: qOf([0, BYAW, 0]) });
    }
    // boots beside the roll
    const boot = (x: number, z: number, yaw: number) => {
      const o = tb(x, G, z);
      const q = qOf([0, BYAW + yaw, 0]);
      const pt = (geo: THREE.BufferGeometry, col: Fill, off: V) => {
        const v = new THREE.Vector3(...off).applyQuaternion(q);
        part(geo, col, { at: [o[0] + v.x, o[1] + v.y, o[2] + v.z], quat: q });
      };
      pt(new THREE.BoxGeometry(0.11, 0.028, 0.27), LEATHER_DK, [0, 0.014, 0.0]);
      pt(new THREE.BoxGeometry(0.1, 0.07, 0.16), LEATHER, [0, 0.063, 0.045]);
      pt(new THREE.CylinderGeometry(0.055, 0.06, 0.2, 6), LEATHER, [0, 0.13, -0.045]);
      pt(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 6), "#c9a36a", [0, 0.235, -0.045]);
      pt(new THREE.BoxGeometry(0.06, 0.012, 0.1), CREAM, [0, 0.102, 0.05]);
      pt(new THREE.SphereGeometry(0.052, 5, 4), LEATHER_DK, [0, 0.055, 0.125]);
    };
    boot(-0.68, 0.5, 10);
    boot(-0.7, 0.14, -14);
  }

  // =============================================================================================================
  // BACKPACK
  // =============================================================================================================
  {
    const bx = -1.3;
    const bz = 0.55;
    const yaw = 28;
    const o: V = [bx, G, bz];
    const q = qOf([0, yaw, 0]);
    const pt = (geo: THREE.BufferGeometry, col: Fill, off: V, rot: V = [0, 0, 0]) => {
      const v = new THREE.Vector3(...off).applyQuaternion(q);
      part(geo, col, { at: [o[0] + v.x, o[1] + v.y, o[2] + v.z], quat: q.clone().multiply(qOf(rot)) });
    };
    pt(new THREE.BoxGeometry(0.4, 0.52, 0.22), OLIVE, [0, 0.26, 0]);
    pt(new THREE.BoxGeometry(0.36, 0.09, 0.2), OLIVE_DK, [0, 0.55, 0.0]);
    pt(new THREE.BoxGeometry(0.42, 0.14, 0.235), OLIVE_DK, [0, 0.47, 0.0], [-6, 0, 0]);
    pt(new THREE.BoxGeometry(0.3, 0.2, 0.09), OLIVE_DK, [0, 0.16, 0.14]);
    pt(new THREE.BoxGeometry(0.32, 0.03, 0.095), OLIVE, [0, 0.27, 0.14]);
    pt(new THREE.BoxGeometry(0.035, 0.09, 0.03), LEATHER, [0.07, 0.39, 0.125]);
    pt(new THREE.BoxGeometry(0.035, 0.09, 0.03), LEATHER, [-0.07, 0.39, 0.125]);
    pt(new THREE.BoxGeometry(0.03, 0.03, 0.012), BRASS, [0.07, 0.34, 0.142]);
    pt(new THREE.BoxGeometry(0.03, 0.03, 0.012), BRASS, [-0.07, 0.34, 0.142]);
    pt(new THREE.BoxGeometry(0.06, 0.4, 0.015), LEATHER_DK, [0.12, 0.25, 0.118]);
    pt(new THREE.BoxGeometry(0.06, 0.4, 0.015), LEATHER_DK, [-0.12, 0.25, 0.118]);
    // rolled sleeping pad on top
    pt(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 8), ORANGE, [0, 0.64, 0.0], [0, 0, 90]);
    pt(new THREE.BoxGeometry(0.03, 0.05, 0.16), LEATHER, [0.12, 0.64, 0]);
    pt(new THREE.BoxGeometry(0.03, 0.05, 0.16), LEATHER, [-0.12, 0.64, 0]);
    // water bottle on the side
    pt(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 7), BLUE, [0.255, 0.16, 0.03]);
    pt(new THREE.CylinderGeometry(0.022, 0.03, 0.04, 6), IRON, [0.255, 0.29, 0.03]);
  }

  // =============================================================================================================
  // PINES, ROCKS, GRASS, FLOWERS, MUSHROOMS
  // =============================================================================================================
  const pine = (x: number, z: number, s: number, seed: number) => {
    bit(BARK, new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 0.4 * s, 6), [x, G + 0.18 * s, z], [0, seed * 30, 0]);
    const tiers: Array<[number, number, number]> = [
      [0.62, 0.62, 0.3],
      [0.5, 0.58, 0.62],
      [0.4, 0.52, 0.94],
      [0.3, 0.46, 1.24],
    ];
    tiers.forEach(([r, h, y], i) => {
      bit(PINE[(i + seed) % 3], new THREE.ConeGeometry(r * s, h * s, 7), [x, G + (y + h / 2) * s, z], [0, i * 20 + seed * 15, 0]);
    });
  };
  pine(2.05, -1.2, 1.0, 1);
  pine(0.9, -2.05, 0.8, 2);
  pine(-2.15, -0.9, 0.7, 0);

  // rocks
  const rocks: Array<[number, number, number, number, number]> = [
    [-0.55, -2.0, 0.26, 0.2, 0.22],
    [-0.2, -2.1, 0.17, 0.12, 0.15],
    [-0.8, -1.88, 0.12, 0.09, 0.1],
    [2.1, 0.35, 0.2, 0.14, 0.18],
    [2.25, 0.62, 0.12, 0.09, 0.11],
  ];
  rocks.forEach(([x, z, sx, sy, sz], i) => {
    bit(STONE[i % 4], ICO, [x, G + sy * 0.55, z], [R() * 20, R() * 360, R() * 20], [sx, sy, sz]);
    if (i % 2 === 0) bit(MOSS, DODE, [x, G + sy * 1.2, z], [0, R() * 360, 0], [sx * 0.5, sy * 0.18, sz * 0.5]);
  });

  const keepOut: Array<[number, number, number]> = [
    [TC.x, TC.z, 1.25],
    [FX, FZ, 1.0],
    [-0.25, 1.22, 0.85],
    [1.5, 1.25, 0.8],
    [BC.x, BC.z, 1.25],
    [SX, SZ, 0.5],
    [-1.3, 0.55, 0.45],
    [0.55, -1.9, 0.55],
    [2.05, -1.2, 0.5],
    [0.9, -2.05, 0.45],
    [-2.15, -0.9, 0.4],
    [-0.55, -2.0, 0.5],
    [2.15, 0.45, 0.35],
    [2.15, -0.5, 0.3],
    [-1.55, 1.8, 0.3],
    [1.95, 1.55, 0.35],
    [1.3, -2.0, 0.3],
    [FX - 0.82, FZ + 0.32, 0.4],
    [-1.0, 1.78, 0.3],
    [0.98, 0.98, 0.35],
  ];
  const free = (x: number, z: number) => Math.hypot(x, z) < GROUND_R - 0.18 && keepOut.every(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) > kr);
  const spot = (): [number, number] => {
    for (let i = 0; i < 40; i++) {
      const a = R() * Math.PI * 2;
      const rr = Math.sqrt(R()) * (GROUND_R - 0.25);
      const x = Math.sin(a) * rr;
      const z = Math.cos(a) * rr;
      if (free(x, z)) return [x, z];
    }
    return [2.4, 0.2];
  };
  // grass tufts
  for (let i = 0; i < 48; i++) {
    const [x, z] = spot();
    const col = GRASS[Math.floor(R() * 4)];
    const blades = 3;
    for (let k = 0; k < blades; k++) {
      const a = (k / blades) * Math.PI * 2 + R();
      const h = 0.12 + R() * 0.1;
      bit(col, new THREE.ConeGeometry(0.019, h, 3), [x + Math.sin(a) * 0.015, G + h * 0.45, z + Math.cos(a) * 0.015], [R() * 14 * Math.cos(a), 0, R() * 14 * Math.sin(a)]);
    }
  }
  // wildflowers
  const FLOWERS = ["#fff4d6", "#ff8fb0", "#ffd54a", "#8fb8ff"];
  for (let i = 0; i < 16; i++) {
    const [x, z] = spot();
    const col = FLOWERS[i % 4];
    const h = 0.1 + R() * 0.06;
    bit("#4f8a3a", new THREE.CylinderGeometry(0.004, 0.005, h, 3), [x, G + h / 2, z]);
    bit(col, OCT, [x, G + h + 0.012, z], [0, R() * 90, 0], [0.022, 0.014, 0.022]);
    bit("#ffcf33", ICO, [x, G + h + 0.02, z], [0, 0, 0], 0.009);
  }
  // mushrooms by seat A
  for (const [x, z, s] of [
    [-0.85, 0.65, 1],
    [-0.76, 0.58, 0.7],
    [-0.9, 0.55, 0.55],
  ] as Array<[number, number, number]>) {
    bit("#f0e6d0", new THREE.CylinderGeometry(0.014 * s, 0.018 * s, 0.06 * s, 5), [x, G + 0.03 * s, z]);
    bit("#d8402f", new THREE.ConeGeometry(0.055 * s, 0.045 * s, 6), [x, G + 0.08 * s, z]);
    bit("#fff4e0", ICO, [x + 0.02 * s, G + 0.098 * s, z + 0.01 * s], [0, 0, 0], 0.008 * s);
    bit("#fff4e0", ICO, [x - 0.018 * s, G + 0.09 * s, z - 0.02 * s], [0, 0, 0], 0.007 * s);
  }
  // pebbles
  for (let i = 0; i < 16; i++) {
    const [x, z] = spot();
    bit(STONE[i % 4], ICO, [x, G + 0.012, z], [0, R() * 360, 0], [0.03 + R() * 0.02, 0.018, 0.03]);
  }
  // wood chips around the stump
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.3 + R() * 0.25;
    bit(CUT, BOX1, [SX + Math.sin(a) * rr, G + 0.008, SZ + Math.cos(a) * rr], [0, R() * 360, 0], [0.05, 0.014, 0.025]);
  }

  // wooden bucket with rope handle, full of water
  {
    const bx = -1.0;
    const bz = 1.78;
    const staves = paint((_p, _n, s) => (s[0] < 0.045 || (s[0] > 0.17 && s[0] < 0.2) ? IRON : WOOD));
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.125, 0.24],
        [0.133, 0.25],
        [0.113, 0.25],
        [0.088, 0.03],
        [0, 0.03],
      ],
      { at: [bx, G, bz], segments: 8, color: staves, bone: root, name: "bucket" },
    );
    cyl(0.112, 0.112, 0.01, 8, "#4d8fc4", [bx, G + 0.2, bz]);
    const arc: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      arc.push([bx + Math.cos(a) * 0.13, G + 0.24 + Math.sin(a) * 0.17, bz]);
    }
    b.sweep(arc, 0.007, { color: ROPE_DK, sides: 4, smooth: false, bone: root });
    bit(IRON, new THREE.BoxGeometry(0.02, 0.03, 0.02), [bx + 0.133, G + 0.24, bz]);
    bit(IRON, new THREE.BoxGeometry(0.02, 0.03, 0.02), [bx - 0.133, G + 0.24, bz]);
  }
  // split firewood and a kindling pile near the stump
  for (const [x, z, yaw, len] of [
    [-1.45, 1.4, 20, 0.34],
    [-1.55, 1.52, 70, 0.3],
    [-1.38, 1.55, 115, 0.32],
  ] as Array<[number, number, number, number]>) {
    const d: V = [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)];
    rod([x - (d[0] * len) / 2, G + 0.035, z - (d[2] * len) / 2], [x + (d[0] * len) / 2, G + 0.035, z + (d[2] * len) / 2], [0.038, 0.034], WOOD_DK, { sides: 5 });
    endDisc(discs, [x + (d[0] * len) / 2, G + 0.035, z + (d[2] * len) / 2], yaw, 0.04);
    endDisc(discs, [x - (d[0] * len) / 2, G + 0.035, z - (d[2] * len) / 2], yaw + 180, 0.04);
  }
  // skillet with sausages on a flat rock
  {
    const kx = FX - 0.82;
    const kz = FZ + 0.32;
    bit(STONE[3], ICO, [kx, G + 0.03, kz], [0, 20, 0], [0.24, 0.05, 0.2]);
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.135, 0.035],
        [0.14, 0.04],
        [0.125, 0.04],
        [0.098, 0.015],
        [0, 0.015],
      ],
      { at: [kx, G + 0.075, kz], segments: 8, color: SOOT, bone: root, name: "skillet" },
    );
    rod([kx - 0.12, G + 0.105, kz], [kx - 0.38, G + 0.115, kz - 0.06], [0.014, 0.011], IRON, { sides: 5 });
    for (const [ox, oz, yw] of [
      [-0.04, -0.045, 10],
      [0.0, 0.0, -5],
      [0.045, 0.045, 12],
    ] as Array<[number, number, number]>)
      bit("#b5532f", new THREE.CapsuleGeometry(0.018, 0.12, 2, 5), [kx + ox, G + 0.1, kz + oz], [0, yw, 90]);
  }
  // enamel kettle
  {
    const kx = 0.98;
    const kz = 0.98;
    bit(STONE[1], ICO, [kx, G + 0.025, kz], [0, 40, 0], [0.17, 0.04, 0.15]);
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.115, 0.1],
        [0.075, 0.16],
        [0.04, 0.175],
        [0, 0.175],
      ],
      { at: [kx, G + 0.05, kz], segments: 8, color: paint((_p, _n, s) => (s[0] < 0.015 ? SOOT : BLUE)), bone: root, name: "kettle" },
    );
    rod([kx + 0.09, G + 0.1, kz], [kx + 0.19, G + 0.2, kz], [0.026, 0.012], BLUE, { sides: 5 });
    part(new THREE.CylinderGeometry(0.02, 0.03, 0.03, 6), IRON, { at: [kx, G + 0.235, kz] });
    const handle: V[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      handle.push([kx - Math.cos(a) * 0.1, G + 0.12 + Math.sin(a) * 0.13, kz]);
    }
    b.sweep(handle, 0.008, { color: IRON, sides: 5, smooth: false, bone: root });
  }
  // bushes with berries
  for (const [x, z, sc] of [
    [2.15, -0.5, 1.0],
    [-1.55, 1.8, 0.85],
    [1.95, 1.55, 1.1],
    [1.3, -2.0, 0.8],
  ] as Array<[number, number, number]>) {
    for (let k = 0; k < 4; k++) {
      const a = k * 1.7 + x;
      const sz = (0.15 + R() * 0.06) * sc;
      bit(PINE[(k + 1) % 3], ICO, [x + Math.sin(a) * 0.11 * sc, G + sz * 0.7, z + Math.cos(a) * 0.11 * sc], [R() * 40, R() * 360, 0], [sz * 1.2, sz, sz * 1.2]);
    }
    for (let k = 0; k < 5; k++) {
      const a = R() * Math.PI * 2;
      bit("#d6334a", ICO, [x + Math.sin(a) * 0.17 * sc, G + 0.12 + R() * 0.14 * sc, z + Math.cos(a) * 0.17 * sc], [0, 0, 0], 0.017);
    }
  }

  // =============================================================================================================
  // FLUSH BATCHED PARTS
  // =============================================================================================================
  for (const [color, list] of bits) {
    const merged = mergeGeometries(list);
    if (merged) part(merged, color, { at: [0, 0, 0] });
  }
  for (const [color, list] of glowBits) {
    const merged = mergeGeometries(list);
    if (merged) glow(part(merged, color, { at: [0, 0, 0] }), 1.4);
  }
  const mergedDiscs = mergeGeometries(discs.map((g) => (g.index ? g.toNonIndexed() : g)));
  if (mergedDiscs) part(mergedDiscs, "#ffffff", { at: [0, 0, 0], texture: RINGS, flat: false });
  const mergedSpirals = mergeGeometries(spirals.map((g) => (g.index ? g.toNonIndexed() : g)));
  if (mergedSpirals) part(mergedSpirals, "#ffffff", { at: [0, 0, 0], texture: SPIRAL, flat: false });

  return b.root;
}

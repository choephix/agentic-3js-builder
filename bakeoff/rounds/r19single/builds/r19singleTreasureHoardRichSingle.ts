// Treasure hoard: an open rune-chest spilling coins, a jewelled crown on the heap, goblets, gold bars, a coin sack and
// glowing crystals on a carved dais. League of Legends look: big dynamic shapes, hand-painted gold, saturated gem
// accents and teal/magenta magic glow that reads from a high top-down camera.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint, patches, scales } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragon's Treasure Hoard",
  description:
    "Open rune-chest spilling gold coins with a jewelled crown on the heap, four goblets (one tipped over spilling glowing potion), gold bars, a coin sack, gem scatter and glowing crystal clusters on a carved dais.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const RAD = Math.PI / 180;
const KEY = new THREE.Vector3(0.35, 0.8, 0.5).normalize();
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

// ---------------------------------------------------------------------------------------------------------------
// Layout constants
const DAIS_TOP = 0.05;
const HINGE = new THREE.Vector3(0, 0.31, -0.4);
const RQ = new THREE.Quaternion().setFromAxisAngle(X_AXIS, -105 * RAD); // chest lid swung open
const HQ = RQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(Z_AXIS, Math.PI / 2)); // cylinder axis y -> x
/** A point given in the closed-lid pose, moved to where the open lid carries it. */
const lp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).sub(HINGE).applyQuaternion(RQ).add(HINGE);
/** A direction given in the closed-lid pose, turned with the open lid. */
const ld = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(RQ);

type Lump = { x: number; z: number; rx: number; rz: number; y0: number; hy: number; round?: boolean };
const MAIN: Lump = { x: 0.05, z: 0.42, rx: 0.46, rz: 0.46, y0: DAIS_TOP, hy: 0.2 };
const RIGHT: Lump = { x: 0.52, z: 0.2, rx: 0.3, rz: 0.3, y0: DAIS_TOP, hy: 0.16 };
const LEFT: Lump = { x: -0.52, z: 0.2, rx: 0.27, rz: 0.27, y0: DAIS_TOP, hy: 0.13 };
const CHESTFILL: Lump = { x: 0, z: -0.2, rx: 0.285, rz: 0.155, y0: 0.27, hy: 0.12, round: true };
const LUMPS = [MAIN, RIGHT, LEFT, CHESTFILL];

/** Height of the coin heaps at (x, z). */
function heightAt(x: number, z: number) {
  let h = DAIS_TOP;
  for (const l of LUMPS) {
    const d2 = ((x - l.x) / l.rx) ** 2 + ((z - l.z) / l.rz) ** 2;
    if (d2 >= 1) continue;
    h = Math.max(h, l.y0 + l.hy * (l.round ? Math.sqrt(1 - d2) : 1 - d2));
  }
  return h;
}

function normalAt(x: number, z: number) {
  const e = 0.01;
  const gx = (heightAt(x + e, z) - heightAt(x - e, z)) / (2 * e);
  const gz = (heightAt(x, z + e) - heightAt(x, z - e)) / (2 * e);
  return new THREE.Vector3(-gx, 1, -gz).normalize();
}

// ---------------------------------------------------------------------------------------------------------------
// Hand-painted palette: four tones (highlight, lit, shade, deep) picked by the surface normal against a key light.
const tone = (hi: string, lit: string, shade: string, deep: string) =>
  paint((_p, n) => {
    const d = n.dot(KEY);
    return d > 0.86 ? hi : d > 0.12 ? lit : d > -0.35 ? shade : deep;
  });

const GOLD = tone("#fff4b0", "#ffc83a", "#e0801f", "#a24c18");
const GOLD2 = tone("#ffe486", "#eaa52c", "#b9621a", "#782f12");
const SILVER = tone("#ffffff", "#dde5ff", "#98a4e6", "#646fb4");
const STEEL = tone("#a9b0ff", "#6068c4", "#3b4190", "#262a64");
const VELVET = tone("#ff5f8e", "#d42a5b", "#a31245", "#6e0a30");
const ROPE = tone("#ff8a98", "#d42a4b", "#a01638", "#6a0a28");
const PEARL = tone("#ffffff", "#f4eefc", "#c9bde8", "#9a8cc8");

const SEAM = "#3a1822";
const WOOD_A = cel(grain("#a2523a", "#84402f", { size: 0.01, axis: "x" }));
const WOOD_B = cel(grain("#8c4632", "#6f3529", { size: 0.01, axis: "x", seed: 5 }));
const planks = (coord: (p: THREE.Vector3, s: readonly [number, number]) => number, gap: number) =>
  paint((p, _n, s) => {
    const u = coord(p, s) / gap;
    const k = Math.floor(u);
    if (u - k < 0.07) return SEAM;
    return k % 2 === 0 ? WOOD_A : WOOD_B;
  });
const BODYWOOD = planks((p) => p.y - 0.05, 0.065);
const lidPlanks = planks((_p, s) => s[0] + 0.2, 0.065);
const LIDWOOD = paint((_p, _n, s) => (s[1] < 0.004 ? VELVET : lidPlanks));

const STONEP = cel(patches("#2a2358", ["#4a428f", "#403a82", "#574fa3"], { size: 0.2, gap: 0.07 }));
const HEAP = cel(scales(["#f2b434", "#e09a28", "#ffc94a"], "#9a5214", { size: 0.045 }));
const BURLAP = cel(mottle("#e6c690", "#cfa66c", { size: 0.035, contrast: 1.2 }));
const ROCK = cel("#2a2560");
const CROWNBAND = paint((_p, _n, s) =>
  Math.abs(s[0] - 0.036 - 0.014 * (zigzag(s[1] / 22) * 2 - 1)) < 0.0035 ? "#7a3a10" : GOLD,
);

// ---------------------------------------------------------------------------------------------------------------
// Profiles
const O = (pts: Array<[number, number]>): OutlinePoint[] => pts;

const GOBLET: Array<[number, number]> = [
  [0, 0],
  [0.055, 0],
  [0.058, 0.008],
  [0.05, 0.016],
  [0.02, 0.03],
  [0.012, 0.06],
  [0.027, 0.07],
  [0.027, 0.08],
  [0.012, 0.09],
  [0.012, 0.1],
  [0.04, 0.12],
  [0.058, 0.16],
  [0.062, 0.2],
  [0.056, 0.2],
  [0.05, 0.16],
  [0.036, 0.13],
  [0, 0.125],
];

const GEM: Array<[number, number]> = [
  [0, 0],
  [0.98, 0.52],
  [1, 0.6],
  [0.62, 0.95],
  [0, 0.95],
];

const SACKPROF: Array<[number, number]> = [
  [0, 0],
  [0.08, 0],
  [0.14, 0.035],
  [0.165, 0.1],
  [0.145, 0.17],
  [0.09, 0.225],
  [0.05, 0.255],
  [0.048, 0.275],
  [0.085, 0.325],
  [0.095, 0.34],
  [0.07, 0.35],
  [0, 0.31],
];

const arch = (hz: number, hy: number): OutlinePoint[] => {
  const pts: OutlinePoint[] = [];
  for (let k = 0; k <= 10; k++) {
    const a = Math.PI * (1 - k / 10);
    const x = hz * Math.cos(a);
    const y = k === 0 || k === 10 ? 0 : hy * Math.sin(a);
    pts.push(k === 0 || k === 10 ? [x, y, "sharp"] : [x, y]);
  }
  return pts;
};

const spikeOutline = (w: number, h: number): OutlinePoint[] => [
  [-w, 0],
  [w, 0],
  [w * 0.88, 0.3 * h],
  [w * 0.52, 0.62 * h],
  [w * 0.21, 0.85 * h],
  [0, h, "sharp"],
  [-w * 0.21, 0.85 * h],
  [-w * 0.52, 0.62 * h],
  [-w * 0.88, 0.3 * h],
];

const boxR = (w: number, h: number) => (): [number, number] => [w, h];

const GEMCOL = ["#ff2e63", "#2f7bff", "#2bff9a", "#c050ff", "#ffa51f", "#bff6ff"];

// ---------------------------------------------------------------------------------------------------------------
// Textures
const coinTex = (face: string, rim: string, mark: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${rim}"/><circle cx="32" cy="32" r="29" fill="${face}"/><circle cx="32" cy="32" r="23" fill="none" stroke="${mark}" stroke-width="3"/><path d="M32 15 L36 27 L49 27 L39 35 L43 48 L32 40 L21 48 L25 35 L15 27 L28 27 Z" fill="${mark}"/></svg>`,
    { size: 128 },
  );

const runeTex = () => {
  const c = 128;
  const P = (a: number, r: number) => `${(c + Math.cos(a) * r).toFixed(1)} ${(c + Math.sin(a) * r).toFixed(1)}`;
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    return `<path d="M${P(a, i % 4 === 0 ? 103 : 108)} L${P(a, 118)}" stroke="#35ffe0" stroke-width="2.8" stroke-linecap="round"/>`;
  }).join("");
  const glyphs = Array.from(
    { length: 12 },
    (_, i) =>
      `<g transform="translate(128 128) rotate(${i * 30})"><path d="M0 -96 L0 -84 M-5 -92 L0 -86 L5 -92" stroke="#c070ff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`,
  ).join("");
  const tri = (rot: number) => {
    const a0 = (-90 + rot) * RAD;
    const a1 = a0 + (120 * Math.PI) / 180;
    const a2 = a0 + (240 * Math.PI) / 180;
    return `<path d="M${P(a0, 78)} L${P(a1, 78)} L${P(a2, 78)} Z" fill="none" stroke="#ff4fd8" stroke-width="2.8" stroke-linejoin="round"/>`;
  };
  return svg(
    `<svg viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="122" fill="none" stroke="#35ffe0" stroke-width="3"/>
    <circle cx="128" cy="128" r="100" fill="none" stroke="#ff4fd8" stroke-width="2.8"/>
    <circle cx="128" cy="128" r="70" fill="none" stroke="#35ffe0" stroke-width="2.8"/>
    <circle cx="128" cy="128" r="34" fill="none" stroke="#ffd24a" stroke-width="3"/>
    ${ticks}${glyphs}${tri(0)}${tri(60)}
    <circle cx="128" cy="128" r="9" fill="#ffd24a"/>
  </svg>`,
    { size: 512 },
  );
};

const quiltTex = () => {
  const lines = Array.from({ length: 9 }, (_, i) => {
    const x = (i - 4) * 16;
    return `<path d="M${x} 0 L${x + 64} 64 M${x} 64 L${x + 64} 0" stroke="#6e0a2a" stroke-width="2"/>`;
  }).join("");
  const buttons: string[] = [];
  for (let i = 0; i <= 4; i++)
    for (let j = 0; j <= 4; j++)
      if ((i + j) % 2 === 0) buttons.push(`<circle cx="${i * 16}" cy="${j * 16}" r="2.8" fill="#ffd24a"/>`);
  return svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#b0173f"/>${lines}${buttons.join("")}</svg>`,
    { size: 128 },
  );
};

const stampTex = () =>
  svg(
    `<svg viewBox="0 0 40 80"><rect x="3" y="3" width="34" height="74" rx="4" fill="none" stroke="#9a4a12" stroke-width="3"/><path d="M10 38 L14 26 L20 34 L26 26 L30 38 Z" fill="#9a4a12"/><path d="M10 48 H30 M10 56 H30 M14 64 H26" stroke="#9a4a12" stroke-width="3" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );

const patchTex = () =>
  svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#7a4a2a" stroke="#3a2012" stroke-width="3"/><circle cx="32" cy="32" r="22" fill="none" stroke="#ffd24a" stroke-width="2.5" stroke-dasharray="5 3"/><path d="M32 17 L36 28 L47 28 L38 35 L42 46 L32 39 L22 46 L26 35 L17 28 L28 28 Z" fill="#ffc83a"/></svg>`,
    { size: 128 },
  );

const starTex = (fill: string) =>
  svg(
    `<svg viewBox="0 0 64 64"><path d="M32 2 C34 22 42 30 62 32 C42 34 34 42 32 62 C30 42 22 34 2 32 C22 30 30 22 32 2 Z" fill="${fill}"/><circle cx="32" cy="32" r="5" fill="#ffffff"/></svg>`,
    { size: 128 },
  );

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "treasureHoard" });
  const rand = rng(77);

  const root = b.joint("root", { at: [0, 0, 0] });
  const lid = b.joint("lid", { parent: root, at: HINGE, dir: ld(0, 0, 1), role: "hinge" });
  let cur = root;

  const put = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: PartOptions = {}) =>
    b.part(geo, color, { bone: cur, at, ...o });
  const mergeInto = (list: THREE.BufferGeometry[], color: Fill, o: PartOptions = {}) => {
    const g = list.length ? mergeGeometries(list) : null;
    if (g) b.part(g, color, { bone: cur, at: [0, 0, 0], ...o });
  };
  const SPH = new THREE.SphereGeometry(1, 6, 4);
  const ball = (list: THREE.BufferGeometry[], r: number, p: THREE.Vector3) => {
    list.push(SPH.clone().applyMatrix4(new THREE.Matrix4().makeScale(r, r, r).setPosition(p)));
  };

  const gemOutline = (s: number) => O(GEM.map(([r, h]): [number, number] => [r * 0.5 * s, h * s]));
  /** A faceted glowing gem, pavilion buried `depth` × size below `pos`, table up along `dir`. */
  const gem = (pos: THREE.Vector3, dir: THREE.Vector3, s: number, color: string, strength = 0.55, depth = 0.3) => {
    const d = dir.clone().normalize();
    const at = pos.clone().addScaledVector(d, -depth * s);
    return glow(b.lathe(gemOutline(s), { at, axis: d, segments: 8, color, bone: cur, spin: rand() * 45 }), strength);
  };

  const studs: THREE.BufferGeometry[] = [];
  const rivets: THREE.BufferGeometry[] = [];
  const lidRivets: THREE.BufferGeometry[] = [];
  const pearls: THREE.BufferGeometry[] = [];

  // -------------------------------------------------------------------------------------------------------------
  // Dais with a glowing rune circle
  b.lathe(
    O([
      [0, 0],
      [1, 0],
      [1, 0.02],
      [0.96, 0.032],
      [0.96, 0.046],
      [0.92, 0.05],
      [0, 0.05],
    ]),
    { at: [0, 0, 0], bone: root, segments: 20, color: STONEP },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.84, 1.84), "#ffffff", {
      bone: root,
      at: [0, 0.056, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, -1],
      texture: runeTex(),
    }),
  );
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    ball(studs, 0.02, new THREE.Vector3(Math.sin(a) * 0.935, 0.05, Math.cos(a) * 0.935));
  }

  // -------------------------------------------------------------------------------------------------------------
  // Coin heaps (painted domes), then loose coins and gems over them
  const heapProfile = (l: Lump) => {
    const pts: Array<[number, number]> = [
      [0, 0],
      [l.rx, 0],
    ];
    for (let k = 1; k <= 7; k++) {
      const r = 1 - k / 8;
      pts.push([l.rx * r, l.hy * (1 - r * r)]);
    }
    pts.push([0, l.hy]);
    return O(pts);
  };
  for (const l of [MAIN, RIGHT, LEFT])
    b.lathe(heapProfile(l), { at: [l.x, l.y0 - 0.003, l.z], bone: root, segments: 16, color: HEAP });

  // -------------------------------------------------------------------------------------------------------------
  // Chest body
  const wall = (w: number, h: number, d: number, x: number, y: number, z: number) =>
    put(new THREE.BoxGeometry(w, h, d), BODYWOOD, [x, y, z]);
  wall(0.64, 0.26, 0.03, 0, 0.18, -0.025);
  wall(0.64, 0.26, 0.03, 0, 0.18, -0.375);
  wall(0.03, 0.26, 0.38, -0.305, 0.18, -0.2);
  wall(0.03, 0.26, 0.38, 0.305, 0.18, -0.2);
  wall(0.58, 0.03, 0.34, 0, 0.065, -0.2);
  put(new THREE.SphereGeometry(1, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2), HEAP, [0, 0.27, -0.2], {
    scale: [0.285, 0.12, 0.155],
  });

  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 0.3;
      const z = -0.2 + sz * 0.17;
      put(new THREE.BoxGeometry(0.05, 0.27, 0.05), GOLD2, [x, 0.185, z]);
      put(new THREE.BoxGeometry(0.062, 0.02, 0.062), GOLD, [x, 0.32, z]);
      put(new THREE.BoxGeometry(0.062, 0.02, 0.062), GOLD, [x, 0.06, z]);
    }
  put(new THREE.BoxGeometry(0.66, 0.016, 0.046), GOLD2, [0, 0.312, -0.025]);
  put(new THREE.BoxGeometry(0.66, 0.016, 0.046), GOLD2, [0, 0.312, -0.375]);
  for (const sx of [1, -1]) put(new THREE.BoxGeometry(0.046, 0.016, 0.4), GOLD2, [sx * 0.305, 0.312, -0.2]);

  const straps: Array<[number, number]> = [
    [0.105, 0.045],
    [0.275, 0.04],
  ];
  for (const [y, h] of straps) {
    put(new THREE.BoxGeometry(0.652, h, 0.03), STEEL, [0, y, -0.006]);
    put(new THREE.BoxGeometry(0.652, h, 0.03), STEEL, [0, y, -0.394]);
    for (const sx of [1, -1]) put(new THREE.BoxGeometry(0.03, h, 0.4), STEEL, [sx * 0.321, y, -0.2]);
    for (const x of [-0.29, -0.115, 0.115, 0.29]) {
      ball(rivets, 0.0095, new THREE.Vector3(x, y, 0.0105));
      ball(rivets, 0.0095, new THREE.Vector3(x, y, -0.4105));
    }
    for (const sx of [1, -1])
      for (const z of [-0.32, -0.2, -0.08]) ball(rivets, 0.0095, new THREE.Vector3(sx * 0.3395, y, z));
  }
  for (const sx of [1, -1]) {
    put(new THREE.BoxGeometry(0.05, 0.26, 0.034), STEEL, [sx * 0.2, 0.18, -0.004]);
    put(new THREE.BoxGeometry(0.05, 0.26, 0.034), STEEL, [sx * 0.2, 0.18, -0.396]);
    for (const y of [0.105, 0.19, 0.275]) ball(rivets, 0.0095, new THREE.Vector3(sx * 0.2, y, 0.0145));
  }

  // Lock plate with a ruby and keyhole
  b.extrude(
    O([
      [-0.05, 0.05],
      [0.05, 0.05],
      [0.055, -0.01],
      [0.03, -0.05],
      [0, -0.075, "sharp"],
      [-0.03, -0.05],
      [-0.055, -0.01],
    ]),
    { at: [0, 0.2, 0.002], x: [1, 0, 0], thickness: 0.02, bevel: 0.004, smoothing: 1, color: GOLD, bone: root },
  );
  put(new THREE.CylinderGeometry(0.01, 0.01, 0.004, 8), "#2a1630", [0, 0.178, 0.013], { dir: [0, 0, 1] });
  put(new THREE.BoxGeometry(0.008, 0.026, 0.004), "#2a1630", [0, 0.158, 0.013]);
  gem(new THREE.Vector3(0, 0.225, 0.011), new THREE.Vector3(0, 0.15, 1), 0.05, "#ff2e63", 0.6, 0.3);
  put(new THREE.TorusGeometry(0.024, 0.005, 5, 12), GOLD2, [0, 0.225, 0.014], { dir: [0, 0, 1], axis: "z" });
  for (const sx of [1, -1]) gem(new THREE.Vector3(sx * 0.036, 0.075 + 0.14, 0.012), new THREE.Vector3(0, 0, 1), 0.02, sx > 0 ? "#2f7bff" : "#2bff9a", 0.55, 0.3);

  // -------------------------------------------------------------------------------------------------------------
  // Chest lid, built directly in its open pose (hinge joint "lid" rests open)
  cur = lid;
  const lidBox = (w: number, h: number, d: number, x: number, y: number, z: number, color: Fill) =>
    put(new THREE.BoxGeometry(w, h, d), color, lp(x, y, z), { quat: RQ });

  b.extrude(arch(0.2, 0.19), {
    at: lp(0, 0.31, -0.2),
    x: ld(0, 0, 1),
    y: ld(0, 1, 0),
    thickness: 0.66,
    bevel: 0.008,
    color: LIDWOOD,
    bone: lid,
  });
  put(new THREE.PlaneGeometry(0.62, 0.36), "#ffffff", lp(0, 0.307, -0.2), {
    dir: ld(0, -1, 0),
    axis: "z",
    up: ld(0, 0, 1),
    texture: quiltTex(),
  });
  lidBox(0.68, 0.03, 0.032, 0, 0.31, -0.012, GOLD2);
  for (const sx of [1, -1]) lidBox(0.03, 0.03, 0.4, sx * 0.33, 0.31, -0.2, GOLD2);

  const archPath = (x: number, lift: number) =>
    catmull(
      Array.from({ length: 9 }, (_, k) => {
        const a = Math.PI * (1 - k / 8);
        const v = lp(x, 0.31 + (0.19 + lift) * Math.sin(a), -0.2 + (0.2 + lift) * Math.cos(a));
        return [v.x, v.y, v.z];
      }),
    );
  for (const x of [-0.22, 0.22]) {
    b.sweep(archPath(x, 0.006), boxR(0.03, 0.007), { section: "box", caps: "flat", color: STEEL, bone: lid });
    const rp = archPath(x, 0.012);
    for (let t = 0.12; t < 0.95; t += 0.1) ball(lidRivets, 0.0085, rp.at(t));
  }
  b.sweep(archPath(0, 0.007), boxR(0.02, 0.008), { section: "box", caps: "flat", color: GOLD2, bone: lid });
  for (const sx of [1, -1]) {
    b.extrude(arch(0.206, 0.196), {
      at: lp(sx * 0.338, 0.31, -0.2),
      x: ld(0, 0, 1),
      y: ld(0, 1, 0),
      thickness: 0.014,
      bevel: 0.003,
      color: GOLD2,
      bone: lid,
    });
    gem(lp(sx * 0.347, 0.385, -0.2), ld(sx, 0, 0), 0.045, sx > 0 ? "#c050ff" : "#ffa51f", 0.55, 0.3);
    gem(lp(sx * 0.347, 0.345, -0.28), ld(sx, 0, 0), 0.026, "#2bff9a", 0.55, 0.3);
    gem(lp(sx * 0.347, 0.345, -0.12), ld(sx, 0, 0), 0.026, "#2f7bff", 0.55, 0.3);
    put(new THREE.CylinderGeometry(0.024, 0.024, 0.09, 8), GOLD2, lp(sx * 0.2, 0.31, -0.405), { quat: HQ });
  }
  b.extrude(
    O([
      [0, 0.08, "sharp"],
      [0.035, 0.03],
      [0.06, 0, "sharp"],
      [0.035, -0.03],
      [0, -0.08, "sharp"],
      [-0.035, -0.03],
      [-0.06, 0, "sharp"],
      [-0.035, 0.03],
    ]),
    { at: lp(0, 0.496, -0.2), x: [1, 0, 0], y: ld(0, 0, 1), thickness: 0.012, bevel: 0.003, color: GOLD, bone: lid },
  );
  gem(lp(0, 0.5, -0.2), ld(0, 1, 0), 0.05, "#ff2e63", 0.6, 0.3);
  mergeInto(lidRivets, GOLD, { bone: lid });
  cur = root;

  // -------------------------------------------------------------------------------------------------------------
  // Coins: merged by face texture, heaped by the heap function
  const COIN = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 8, 1);
  const COIN_TEX = [
    coinTex("#ffd24a", "#e8a020", "#c07a14"),
    coinTex("#ffc02e", "#d98a18", "#b06610"),
    coinTex("#e8eeff", "#a9b4e8", "#7d88c8"),
    coinTex("#ff9a5a", "#c9602a", "#9a3e1a"),
  ];
  const coinBins: THREE.BufferGeometry[][] = [[], [], [], []];
  const Yv = new THREE.Vector3(0, 1, 0);
  const pickKind = () => {
    const r = rand();
    return r < 0.42 ? 0 : r < 0.74 ? 1 : r < 0.9 ? 2 : 3;
  };
  const addCoin = (kind: number, p: THREE.Vector3, dir: THREE.Vector3, s = 1) => {
    const q = aim(dir);
    q.multiply(new THREE.Quaternion().setFromAxisAngle(Yv, rand() * Math.PI * 2));
    const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(s, s, s));
    coinBins[kind].push(COIN.clone().applyMatrix4(m));
  };
  const jitter = (n: THREE.Vector3, amt: number) =>
    new THREE.Vector3(n.x + (rand() - 0.5) * amt, n.y + (rand() - 0.5) * amt * 0.6, n.z + (rand() - 0.5) * amt).normalize();

  const KEEP: Array<[number, number, number]> = [
    [0.05, 0.42, 0.2],
    [0.52, 0.2, 0.09],
    [-0.52, 0.2, 0.09],
    [0.3, 0.5, 0.11],
    [0.45, 0.57, 0.1],
    [-0.42, 0.62, 0.09],
  ];
  const sample = (l: Lump) => {
    for (let tries = 0; tries < 12; tries++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.97;
      const x = l.x + Math.cos(a) * r * l.rx;
      const z = l.z + Math.sin(a) * r * l.rz;
      if (l !== CHESTFILL && Math.abs(x) < 0.34 && z < 0.01 && z > -0.41) continue;
      if (KEEP.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr)) continue;
      return { p: new THREE.Vector3(x, heightAt(x, z), z), n: normalAt(x, z) };
    }
    return null;
  };

  const coinCounts: Array<[Lump, number]> = [
    [MAIN, 300],
    [RIGHT, 120],
    [LEFT, 100],
    [CHESTFILL, 130],
  ];
  for (const [l, count] of coinCounts)
    for (let i = 0; i < count; i++) {
      const s = sample(l);
      if (!s) continue;
      const stand = rand() < 0.14;
      const p = s.p.clone();
      p.y += stand ? 0.02 : -0.004 + rand() * 0.012;
      addCoin(pickKind(), p, jitter(s.n, stand ? 3.2 : 0.9), 0.8 + rand() * 0.35);
    }

  // Coin stacks and strays on the dais
  const stack = (x: number, z: number, n: number, kind: number) => {
    for (let i = 0; i < n; i++)
      addCoin(
        kind,
        new THREE.Vector3(x + (rand() - 0.5) * 0.008, DAIS_TOP + 0.006 + i * 0.0095, z + (rand() - 0.5) * 0.008),
        new THREE.Vector3(0, 1, 0),
      );
  };
  stack(0.22, 0.84, 8, 0);
  stack(0.34, 0.8, 5, 1);
  stack(-0.7, 0.5, 6, 2);
  addCoin(0, new THREE.Vector3(0.265, DAIS_TOP + 0.036, 0.83), new THREE.Vector3(1, 0.25, 0.1));
  addCoin(1, new THREE.Vector3(0.28, DAIS_TOP + 0.034, 0.79), new THREE.Vector3(0.9, 0.3, -0.3));
  addCoin(2, new THREE.Vector3(-0.655, DAIS_TOP + 0.034, 0.52), new THREE.Vector3(-1, 0.2, 0.2));
  for (let i = 0; i < 40; i++) {
    const a = (rand() - 0.5) * Math.PI * 1.5;
    const r = 0.58 + rand() * 0.32;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    if (z < 0.1 || heightAt(x, z) > DAIS_TOP + 0.001) continue;
    if (KEEP.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + 0.03)) continue;
    addCoin(pickKind(), new THREE.Vector3(x, DAIS_TOP + 0.007, z), jitter(Yv, 0.12), 0.85 + rand() * 0.25);
  }

  // Gems scattered over the heaps
  const lumpPool = [MAIN, MAIN, MAIN, RIGHT, LEFT, CHESTFILL, CHESTFILL];
  for (let i = 0; i < 32; i++) {
    const s = sample(lumpPool[Math.floor(rand() * lumpPool.length)]);
    if (!s) continue;
    const size = i < 4 ? 0.075 + rand() * 0.02 : 0.034 + rand() * 0.026;
    gem(s.p, jitter(s.n, 0.9), size, GEMCOL[i % GEMCOL.length], 0.55, 0.28);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Crown resting on the heap
  const CX = 0.05;
  const CZ = 0.42;
  const CY = heightAt(CX, CZ) - 0.045;
  const cp = (x: number, y: number, z: number) => new THREE.Vector3(CX + x, CY + y, CZ + z);
  b.lathe(
    O([
      [0.13, 0],
      [0.142, 0.07],
      [0.136, 0.078],
      [0.126, 0.07],
      [0.118, 0.003],
    ]),
    { at: cp(0, 0, 0), bone: root, segments: 16, color: CROWNBAND },
  );
  b.lathe(
    O([
      [0, 0.05],
      [0.12, 0.05],
      [0.115, 0.09],
      [0.09, 0.135],
      [0.05, 0.17],
      [0, 0.18],
    ]),
    { at: cp(0, 0, 0), bone: root, segments: 14, color: VELVET },
  );
  put(new THREE.TorusGeometry(0.13, 0.009, 5, 16), GOLD2, cp(0, 0, 0), { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(0.139, 0.008, 5, 16), GOLD2, cp(0, 0.074, 0), { rotation: [90, 0, 0] });
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    ball(pearls, 0.011, cp(Math.sin(a) * 0.134, 0.012, Math.cos(a) * 0.134));
  }
  const tipCols = ["#ff2e63", "#2f7bff", "#2bff9a", "#c050ff"];
  for (let k = 0; k < 8; k++) {
    const phi = (k * Math.PI) / 4;
    const px = Math.sin(phi);
    const pz = Math.cos(phi);
    const tall = k % 2 === 0;
    const lean = tall ? 0.22 : 0.3;
    const yDir = new THREE.Vector3(px * lean, 1, pz * lean).normalize();
    const base = cp(0.138 * px, 0.06, 0.138 * pz);
    const h = tall ? 0.19 : 0.105;
    b.extrude(spikeOutline(tall ? 0.042 : 0.034, h), {
      at: base,
      x: [Math.cos(phi), 0, -Math.sin(phi)],
      y: yDir,
      thickness: [0.016, 0.006],
      bevel: 0.003,
      color: GOLD,
      bone: root,
    });
    if (tall) gem(base.clone().addScaledVector(yDir, h), yDir, 0.04, tipCols[(k / 2) % 4], 0.6, 0.3);
    else ball(pearls, 0.014, base.clone().addScaledVector(yDir, h + 0.004));
    const ga = phi + Math.PI / 8;
    gem(
      cp(0.139 * Math.sin(ga), 0.04, 0.139 * Math.cos(ga)),
      new THREE.Vector3(Math.sin(ga), 0.12, Math.cos(ga)),
      0.03,
      GEMCOL[(k + 3) % GEMCOL.length],
      0.55,
      0.3,
    );
  }
  gem(cp(0, 0.032, 0.1385), new THREE.Vector3(0, 0.05, 1), 0.052, "#ff2e63", 0.65, 0.3);
  put(new THREE.TorusGeometry(0.026, 0.005, 5, 12), GOLD2, cp(0, 0.045, 0.142), { dir: [0, 0, 1], axis: "z" });
  const archPts = (ux: number, uz: number) => {
    const us = [-0.13, -0.09, -0.045, 0, 0.045, 0.09, 0.13];
    const ys = [0.07, 0.15, 0.2, 0.215, 0.2, 0.15, 0.07];
    return us.map((u, i) => {
      const v = cp(ux * u, ys[i], uz * u);
      return [v.x, v.y, v.z];
    });
  };
  b.sweep(catmull(archPts(1, 0)), 0.008, { color: GOLD, sides: 6, bone: root });
  b.sweep(catmull(archPts(0, 1)), 0.008, { color: GOLD, sides: 6, bone: root });
  put(new THREE.SphereGeometry(0.017, 6, 5), GOLD, cp(0, 0.212, 0));
  gem(cp(0, 0.222, 0), new THREE.Vector3(0, 1, 0), 0.055, "#aef2ff", 0.7, 0.3);

  // -------------------------------------------------------------------------------------------------------------
  // Goblets
  const goblet = (
    x: number,
    z: number,
    body: Fill,
    trim: Fill,
    gemCol: string,
    potion: string | null,
    s: number,
  ) => {
    const y = heightAt(x, z) - 0.012;
    b.lathe(O(GOBLET.map(([r, h]): [number, number] => [r * s, h * s])), {
      at: [x, y, z],
      bone: root,
      color: body,
      segments: 12,
    });
    put(new THREE.TorusGeometry(0.059 * s, 0.006 * s, 5, 14), trim, [x, y + 0.2 * s, z], { rotation: [90, 0, 0] });
    put(new THREE.TorusGeometry(0.029 * s, 0.006 * s, 5, 10), trim, [x, y + 0.075 * s, z], { rotation: [90, 0, 0] });
    put(new THREE.TorusGeometry(0.055 * s, 0.005 * s, 5, 14), trim, [x, y + 0.01 * s, z], { rotation: [90, 0, 0] });
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + 0.3;
      gem(
        new THREE.Vector3(x + Math.sin(a) * 0.0585 * s, y + 0.15 * s, z + Math.cos(a) * 0.0585 * s),
        new THREE.Vector3(Math.sin(a), 0.2, Math.cos(a)),
        0.026 * s,
        gemCol,
        0.55,
        0.3,
      );
    }
    if (potion) {
      glow(put(new THREE.CylinderGeometry(0.0515 * s, 0.0515 * s, 0.004, 12), potion, [x, y + 0.18 * s, z]));
      for (let k = 0; k < 3; k++)
        glow(
          put(new THREE.SphereGeometry(0.008 * s, 6, 4), potion, [
            x + (rand() - 0.5) * 0.05 * s,
            y + (0.23 + k * 0.03) * s,
            z + (rand() - 0.5) * 0.05 * s,
          ]),
        );
    } else {
      for (let k = 0; k < 5; k++)
        addCoin(
          k % 2 ? 0 : 1,
          new THREE.Vector3(x + (rand() - 0.5) * 0.03, y + (0.185 + k * 0.006) * s, z + (rand() - 0.5) * 0.03),
          jitter(Yv, 0.7),
          0.72,
        );
    }
  };
  goblet(0.52, 0.2, GOLD, GOLD2, "#ff2e63", "#ff4fd8", 1);
  goblet(-0.52, 0.2, SILVER, SILVER, "#2f7bff", "#3ff2ff", 1);
  goblet(-0.42, 0.62, GOLD, GOLD2, "#2bff9a", null, 1.1);

  // Tipped goblet spilling potion and coins
  const GS = 1.05;
  const tf = new THREE.Vector3(0.3, 0, 0.5);
  tf.y = heightAt(0.3, 0.5) + 0.056;
  const dyN = Math.max(-0.85, Math.min(0.2, (DAIS_TOP + 0.064 - tf.y) / (0.2 * GS)));
  const hor = Math.sqrt(1 - dyN * dyN);
  const td = new THREE.Vector3(0.93 * hor, dyN, 0.37 * hor).normalize();
  b.lathe(O(GOBLET.map(([r, h]): [number, number] => [r * GS, h * GS])), {
    at: tf,
    axis: td,
    bone: root,
    color: GOLD,
    segments: 12,
  });
  const mouth = tf.clone().addScaledVector(td, 0.2 * GS);
  put(new THREE.TorusGeometry(0.059 * GS, 0.006 * GS, 5, 14), GOLD2, mouth, { dir: td, axis: "z" });
  put(new THREE.TorusGeometry(0.029 * GS, 0.006 * GS, 5, 10), GOLD2, tf.clone().addScaledVector(td, 0.075 * GS), {
    dir: td,
    axis: "z",
  });
  const hx = td.x / hor;
  const hz = td.z / hor;
  glow(
    put(new THREE.CircleGeometry(0.085, 8), "#3ff2ff", [mouth.x + hx * 0.1, 0.052, mouth.z + hz * 0.1], {
      dir: [0, 1, 0],
      axis: "z",
    }),
  );
  for (let i = 0; i < 3; i++)
    addCoin(
      i % 2,
      tf.clone().addScaledVector(td, (0.15 + 0.03 * i) * GS),
      jitter(td, 0.6),
      0.72,
    );
  for (let i = 0; i < 9; i++) {
    const u = 0.03 + rand() * 0.2;
    const side = (rand() - 0.5) * 0.1;
    const x = mouth.x + hx * u - hz * side;
    const z = mouth.z + hz * u + hx * side;
    addCoin(pickKind(), new THREE.Vector3(x, Math.max(heightAt(x, z), DAIS_TOP) + 0.007 + rand() * 0.004, z), jitter(Yv, 0.2), 0.9);
  }
  gem(new THREE.Vector3(mouth.x + hx * 0.22, 0.056, mouth.z + hz * 0.22 + 0.04), jitter(Yv, 0.4), 0.05, "#ffa51f", 0.55, 0.28);

  // -------------------------------------------------------------------------------------------------------------
  // Necklace draped over the heap front
  const nk = catmull(
    Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const x = -0.2 + 0.58 * t;
      const z = 0.7 + 0.06 * Math.sin(Math.PI * t);
      return [x, heightAt(x, z) + 0.016, z];
    }),
  );
  for (let i = 0; i <= 26; i++) {
    const p = nk.at(i / 26);
    ball(pearls, i % 5 === 2 ? 0.0085 : 0.011, p);
    if (i % 5 === 2) ball(studs, 0.0075, p.clone().add(new THREE.Vector3(0, 0.003, 0)));
  }
  const pend = nk.at(0.5);
  put(new THREE.TorusGeometry(0.03, 0.006, 5, 10), GOLD2, pend.clone().add(new THREE.Vector3(0, 0.02, 0)), {
    rotation: [70, 0, 0],
  });
  gem(pend.clone().add(new THREE.Vector3(0, 0.012, 0.003)), new THREE.Vector3(0, 1, 0.4), 0.052, "#2ff0d8", 0.65, 0.3);

  // -------------------------------------------------------------------------------------------------------------
  // Gold bar stack
  const STAMP = stampTex();
  const bar = (x: number, y: number, z: number, ang: number) => {
    const xd: V3 = [Math.cos(ang), 0, -Math.sin(ang)];
    b.extrude(
      O([
        [-0.042, 0],
        [0.042, 0],
        [0.033, 0.042],
        [-0.033, 0.042],
      ]),
      { at: [x, y, z], x: xd, y: [0, 1, 0], thickness: 0.17, bevel: 0.004, color: GOLD, bone: root },
    );
    put(new THREE.PlaneGeometry(0.052, 0.12), "#ffffff", [x, y + 0.0445, z], {
      dir: [0, 1, 0],
      axis: "z",
      up: [Math.sin(ang), 0, Math.cos(ang)],
      texture: STAMP,
    });
  };
  const BX = 0.62;
  const BZ = -0.2;
  for (const dx of [-0.088, 0, 0.088]) bar(BX + dx, DAIS_TOP - 0.002, BZ, 0);
  for (const dx of [-0.044, 0.044]) bar(BX + dx, DAIS_TOP + 0.04, BZ, 0);
  bar(BX, DAIS_TOP + 0.082, BZ, Math.PI / 2);
  addCoin(0, new THREE.Vector3(BX + 0.13, DAIS_TOP + 0.036, BZ + 0.1), new THREE.Vector3(-1, 0.3, 0.2));
  addCoin(1, new THREE.Vector3(BX + 0.12, DAIS_TOP + 0.007, BZ + 0.16), new THREE.Vector3(0, 1, 0));

  // -------------------------------------------------------------------------------------------------------------
  // Coin sack
  const SX = -0.62;
  const SZ = -0.2;
  const SY = DAIS_TOP - 0.004;
  const sack = b.lathe(O(SACKPROF), { at: [SX, SY, SZ], bone: root, segments: 10, color: BURLAP });
  put(new THREE.TorusGeometry(0.052, 0.011, 5, 12), ROPE, [SX, SY + 0.268, SZ], { rotation: [90, 0, 0] });
  b.rod([SX + 0.05, SY + 0.262, SZ + 0.02], [SX + 0.1, SY + 0.2, SZ + 0.1], 0.007, { color: ROPE, bone: root });
  b.rod([SX + 0.045, SY + 0.262, SZ + 0.035], [SX + 0.07, SY + 0.19, SZ + 0.13], 0.007, { color: ROPE, bone: root });
  b.decal(sack, patchTex(), { at: [SX, SY + 0.12, SZ + 0.17], dir: [0, 0, 1], size: [0.1, 0.1] });
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    addCoin(
      k % 3 === 2 ? 2 : k % 2,
      new THREE.Vector3(SX + Math.sin(a) * 0.04, SY + 0.335 + (k % 3) * 0.012, SZ + Math.cos(a) * 0.04),
      new THREE.Vector3(Math.sin(a) * 0.5, 1, Math.cos(a) * 0.5),
      0.78,
    );
  }
  for (let k = 0; k < 6; k++)
    addCoin(
      pickKind(),
      new THREE.Vector3(SX + 0.14 + rand() * 0.1, DAIS_TOP + 0.007, SZ + 0.12 + rand() * 0.14),
      jitter(Yv, 0.15),
      0.9,
    );
  gem(new THREE.Vector3(SX + 0.2, DAIS_TOP + 0.01, SZ + 0.2), jitter(Yv, 0.5), 0.045, "#c050ff", 0.55, 0.28);

  // -------------------------------------------------------------------------------------------------------------
  // Glowing crystal clusters
  const crystal = (x: number, z: number, dir: THREE.Vector3, r: number, h: number, color: string) =>
    glow(
      b.lathe(
        O([
          [0, 0],
          [r, 0],
          [r, h * 0.7],
          [0, h],
        ]),
        { at: [x, DAIS_TOP - 0.012, z], axis: dir.clone().normalize(), segments: 6, color, bone: root, spin: rand() * 60 },
      ),
      0.7,
    );
  const cluster = (cx: number, cz: number, cols: string[]) => {
    b.lathe(
      O([
        [0, 0],
        [0.15, 0],
        [0.12, 0.04],
        [0.06, 0.065],
        [0, 0.07],
      ]),
      { at: [cx, DAIS_TOP - 0.003, cz], bone: root, segments: 7, color: ROCK },
    );
    const specs: Array<[number, number, number, number, number, number]> = [
      [0, 0, 0.05, 0, 0.05, 0.42],
      [0.07, 0.03, 0.38, 0.2, 0.04, 0.3],
      [-0.07, 0.02, -0.4, 0.1, 0.042, 0.34],
      [0.02, -0.07, 0.1, -0.45, 0.036, 0.26],
      [-0.03, 0.08, -0.15, 0.5, 0.034, 0.22],
      [0.11, -0.05, 0.6, -0.2, 0.026, 0.16],
    ];
    specs.forEach(([dx, dz, tx, tz, r, h], i) =>
      crystal(cx + dx, cz + dz, new THREE.Vector3(tx, 1, tz), r, h, cols[i % cols.length]),
    );
  };
  cluster(-0.55, -0.58, ["#2ff0d8", "#6bffec", "#1ec8f0"]);
  cluster(0.55, -0.58, ["#e03cff", "#ff5ad0", "#9a5cff"]);

  // -------------------------------------------------------------------------------------------------------------
  // Magic sparkles hanging over the hoard
  const sparkPts = (n: number, ymin: number, ymax: number) => {
    const out = [];
    while (out.length < n) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 0.8;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r + 0.1;
      if (Math.abs(x) < 0.45 && z < 0.05) continue;
      out.push(frame([x, ymin + rand() * (ymax - ymin), z], [0, 1, 0]));
    }
    return out;
  };
  glow(
    b.cards(sparkPts(14, 0.3, 0.62), starTex("#fff2a6"), {
      size: [0.07, 0.07],
      cross: true,
      spin: 180,
      vary: 0.45,
      rng: rand,
      bone: root,
      sink: 0,
    }),
  );
  glow(
    b.cards(sparkPts(10, 0.25, 0.55), starTex("#9ffcff"), {
      size: [0.055, 0.055],
      cross: true,
      spin: 180,
      vary: 0.45,
      rng: rand,
      bone: root,
      sink: 0,
    }),
  );

  // -------------------------------------------------------------------------------------------------------------
  // Merged small parts
  mergeInto(studs, GOLD2);
  mergeInto(rivets, GOLD);
  mergeInto(pearls, PEARL);
  coinBins.forEach((bin, k) => mergeInto(bin, "#ffffff", { texture: COIN_TEX[k] }));

  return b.root;
}

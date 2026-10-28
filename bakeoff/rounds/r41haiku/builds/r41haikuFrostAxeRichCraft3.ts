import * as THREE from "three";
import { createBuilder, grain, mix, noise, paint, smoothstep, stripes, svg } from "../../../../src/index";

// A frost-forged battle axe in a League of Legends look: a bold crescent head of blue ice with a gold
// backing plate, glowing edges, frost crystals and a runed drawing, on a leather-wrapped haft with gold fittings.

// Scale constants
const AXE_H = 1.42; // haft length, meters
const HEAD_Y = 1.3; // centre height of the blade crescent
const HALF_W = 0.44; // blade reach either side of the haft
const T = 0.03; // blade thickness

// Palette
const ICE_DEEP = "#1d4f8c";
const ICE_LIGHT = "#8fe8ff";
const FROST = "#e9fbff";
const GOLD = "#e8b04a";
const GOLD_DARK = "#8a5a1c";
const NAVY = "#18264a";
const WOOD = grain("#7a5634", "#b48a57", { size: 0.035, axis: "y", seed: 4 });
const LEATHER = stripes("#2a3f66", GOLD, { size: 0.045, axis: "y", width: 0.25, wobble: 0.2, seed: 2 });

// Blade outline, right half then mirrored: spike tips and bit curves. Points are model-space x, y.
type P = [number, number] | [number, number, "sharp"];
const RIGHT: P[] = [
  [0.04, 1.42],
  [0.2, 1.53, "sharp"],
  [0.36, 1.47],
  [0.44, 1.31, "sharp"],
  [0.42, 1.12],
  [0.34, 1.0, "sharp"],
  [0.18, 1.06],
  [0.06, 1.12],
  [0.02, 1.18],
];
const LEFT: P[] = [
  [-0.02, 1.18],
  [-0.06, 1.12],
  [-0.18, 1.06],
  [-0.34, 1.0, "sharp"],
  [-0.42, 1.12],
  [-0.44, 1.31, "sharp"],
  [-0.36, 1.47],
  [-0.2, 1.53, "sharp"],
  [-0.04, 1.42],
];
const HEAD: P[] = [...RIGHT, ...LEFT];

// Same silhouette pushed outward around the head centre: the gold backing plate.
const scaled = (pts: P[], k: number): P[] =>
  pts.map((q) => {
    const x = q[0] * k;
    const y = HEAD_Y + (q[1] - HEAD_Y) * k;
    return q.length === 3 ? [x, y, "sharp"] : [x, y];
  });

// Blade paint: pale ice at the heart, deep blue toward the faces, a bright cold edge and frost veins.
const ICE = paint((p, n) => {
  const r = Math.hypot(p.x, (p.y - HEAD_Y) * 0.85);
  let c = mix(ICE_DEEP, ICE_LIGHT, smoothstep(0.1, 0.4, r));
  const veins = smoothstep(0.56, 0.64, noise(p, 0.05, 3));
  c = mix(c, FROST, veins * 0.75);
  const edge = smoothstep(0.36, 0.44, r);
  c = mix(c, FROST, edge * 0.5);
  const sky = 0.9 + 0.12 * smoothstep(-0.2, 0.8, n.y);
  return [c[0] * sky, c[1] * sky, c[2] * sky];
});

// Gold backing plate paint with a soft metallic drift.
const GOLD_PLATE = paint((p) => {
  const d = noise(p, 0.08, 7);
  return mix(GOLD_DARK, GOLD, smoothstep(0.3, 0.8, d));
});

// Rune drawing for the blade faces: a gold ring with frost glyphs, transparent outside.
const RUNE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="none" stroke="${NAVY}" stroke-width="6"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="${GOLD}" stroke-width="3"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="${FROST}" stroke-width="2"/>
    <path d="M50 22 L60 40 L50 50 L40 40 Z" fill="${FROST}"/>
    <path d="M50 78 L60 60 L50 50 L40 60 Z" fill="${FROST}"/>
    <path d="M28 50 L40 44 L50 50 L40 56 Z" fill="${GOLD}"/>
    <path d="M72 50 L60 44 L50 50 L60 56 Z" fill="${GOLD}"/>
    <circle cx="50" cy="50" r="6" fill="${ICE_LIGHT}" stroke="${NAVY}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const b = createBuilder({ name: "frost-axe" });

// Haft: a leather-wrapped ash shaft standing on its butt at y = 0.
b.part(new THREE.CylinderGeometry(0.022, 0.026, AXE_H, 8), WOOD, { at: [0, AXE_H / 2, 0], dir: [0, 1, 0] });
b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.36, 8), LEATHER, { at: [0, 0.4, 0], dir: [0, 1, 0] });
b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), GOLD, { at: [0, 0.2, 0], dir: [0, 1, 0] });
b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), GOLD, { at: [0, 0.6, 0], dir: [0, 1, 0] });

// Pommel: a gold orb crowned with a small frost gem, sitting on the ground.
b.part(new THREE.SphereGeometry(0.04, 8, 6), GOLD, { at: [0, 0.04, 0] });
b.part(new THREE.ConeGeometry(0.018, 0.05, 5), FROST, { at: [0, 0.095, 0], dir: [0, 1, 0] });

// Head collar where the blade meets the haft.
b.part(new THREE.CylinderGeometry(0.038, 0.04, 0.07, 8), GOLD, { at: [0, 1.17, 0], dir: [0, 1, 0] });
b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 8), GOLD_DARK, { at: [0, 1.2, 0], dir: [0, 1, 0] });

// Gold backing plate behind the blade, a shade larger so it shows as a rim.
b.extrude(scaled(HEAD, 1.07), {
  at: [0, 0, -0.026],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: 0.012,
  bevel: 0.003,
  smoothing: 1,
  color: GOLD_PLATE,
});

// The blade: a frost-ice crescent, double-bitted, with a flat face on each side.
b.extrude(HEAD, {
  at: [0, 0, 0],
  x: [1, 0, 0],
  y: [0, 1, 0],
  thickness: T,
  bevel: 0.007,
  smoothing: 1,
  color: ICE,
});

// Rune drawing on both faces of the blade.
b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
  at: [0.2, 1.3, 0.021],
  dir: [0, 0, 1],
  axis: "z",
  texture: RUNE,
});
b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
  at: [-0.2, 1.3, -0.021],
  dir: [0, 0, -1],
  axis: "z",
  texture: RUNE,
});

// Frost crystals on the bit tips and outer edges, pointing outward from the head.
const crystal = (x: number, y: number, len: number, r: number) => {
  const dx = x;
  const dy = y - HEAD_Y;
  const d = Math.hypot(dx, dy) || 1;
  const dir: [number, number, number] = [dx / d, dy / d, 0];
  const at: [number, number, number] = [x + (dir[0] * len) / 2, y + (dir[1] * len) / 2, 0];
  b.part(new THREE.ConeGeometry(r, len, 5), FROST, { at, dir, axis: "y" });
};
const edgeTips: [number, number, number, number][] = [
  [0.44, 1.31, 0.09, 0.02],
  [0.34, 1.0, 0.08, 0.018],
  [-0.34, 1.0, 0.08, 0.018],
  [-0.44, 1.31, 0.09, 0.02],
  [0.2, 1.53, 0.07, 0.016],
  [-0.2, 1.53, 0.07, 0.016],
  [0.36, 1.47, 0.05, 0.012],
  [-0.36, 1.47, 0.05, 0.012],
];
for (const [x, y, len, r] of edgeTips) crystal(x, y, len, r);

// Top spike of the haft: a long frost point.
b.part(new THREE.ConeGeometry(0.03, 0.18, 6), ICE, { at: [0, AXE_H + 0.09, 0], dir: [0, 1, 0] });
b.part(new THREE.ConeGeometry(0.014, 0.06, 5), FROST, { at: [0, AXE_H + 0.2, 0], dir: [0, 1, 0] });

// Small glowing shards on the haft below the head.
for (const s of [-1, 1]) {
  b.part(new THREE.ConeGeometry(0.012, 0.07, 5), FROST, {
    at: [s * 0.036, 1.1, 0],
    dir: [s, 0.3, 0],
    axis: "y",
  });
}

export default function build() {
  return b.root;
}

export const meta = {
  name: "Frost-forged battle axe",
  description:
    "A League of Legends style frost battle axe: a crescent head of blue ice with a gold backing plate, runed faces, frost crystal edges and a leather-wrapped haft.",
};

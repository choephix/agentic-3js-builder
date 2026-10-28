```ts
import * as THREE from "three";
import { createBuilder, arc, catmull, lerp, mix, smoothstep, paint, mottle, stripes, svg } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Overwatch Chopper",
  description:
    "Custom chopper motorbike in a bold Overwatch hero-tech look: raked springer-style fork, peanut tank, fat rear tyre, V-twin, sissy bar and glowing blue accents.",
};

const D = Math.PI / 180;
type V = [number, number, number];

const ORANGE = "#f99e1a";
const DARK = "#2b3140";
const BLACK = "#16181e";
const BLUE = "#3ab8ff";
const WHITE = "#f4f1ea";

const TANK = paint((p, n) => {
  if (n.y > 0.35 && Math.abs(p.x) < 0.022) return WHITE;
  if (n.y > 0.35 && Math.abs(p.x) < 0.036) return DARK;
  if (n.y < -0.25) return DARK;
  return mix("#e8730c", "#ffa51f", smoothstep(0.78, 1.02, p.y));
});
const BODY = paint((p, n) => (n.y < -0.3 ? DARK : mix("#e8730c", "#ffab2e", smoothstep(0.1, 0.9, p.y))));
const STEEL = metal("steel");
const IRON = metal("iron");
const BLUED = metal("blued");
const LEATHER = mottle("#2a2220", "#41342e", { size: 0.05, seed: 4 });
const TIRE = stripes("#1b1d23", "#2f333c", { size: 0.04, axis: "z", wobble: 0.2 });

const WHEEL = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45" fill="none" stroke="#f99e1a" stroke-width="9"/>
  <circle cx="50" cy="50" r="39" fill="none" stroke="#2b3140" stroke-width="3"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => {
      const a = (i * 45 * Math.PI) / 180;
      return `<path d="M50 50 L${(50 + 42 * Math.sin(a)).toFixed(1)} ${(50 - 42 * Math.cos(a)).toFixed(1)}" stroke="${i % 2 ? "#f4f1ea" : "#c9ced8"}" stroke-width="5"/>`;
    })
    .join("")}
  <circle cx="50" cy="50" r="12" fill="#2b3140" stroke="#f99e1a" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);
const LOGO = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="47" fill="#2b3140" stroke="#f99e1a" stroke-width="5"/>
  <circle cx="50" cy="50" r="28" fill="none" stroke="#f99e1a" stroke-width="10"/>
  <path d="M50 6 V20 M50 80 V94 M6 50 H20 M80 50 H94" stroke="#f4f1ea" stroke-width="6"/>
  <path d="M30 76 L50 36 L70 76 L50 66 Z" fill="#f4f1ea" stroke="#2b3140" stroke-width="2"/>
  </svg>`,
  { size: 192 },
);
const GAUGE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#12151c" stroke="#f99e1a" stroke-width="4"/>
  ${Array.from({ length: 11 }, (_, i) => {
    const a = (-135 + i * 27) * D;
    return `<path d="M${50 + 40 * Math.sin(a)} ${50 - 40 * Math.cos(a)} L${50 + 32 * Math.sin(a)} ${50 - 32 * Math.cos(a)}" stroke="${i > 8 ? "#ff4a3a" : "#f4f1ea"}" stroke-width="3"/>`;
  }).join("")}
  <path d="M50 50 L72 30" stroke="#3ab8ff" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="5" fill="#f99e1a"/>
  </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "chopper" });
  const arcPt = (c: V, R: number, deg: number): V => [c[0], c[1] + R * Math.cos(deg * D), c[2] + R * Math.sin(deg * D)];
  const tube = (a: any, c: any, r: number, col: any) => b.capsule(a, c, r, col);
  const cyl = (r: number, h: number, at: V, dir: V, col: any, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { at, dir });
  const box = (w: number, h: number, d: number, at: V, col: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at });

  // ---------- wheels ----------
  function wheel(z: number, R: number, w: number) {
    const y = R;
    const hw = w * 0.5;
    b.lathe(
      [
        [0, -hw],
        [R - 0.1, -hw],
        [R - 0.08, -w],
        [R - 0.02, -w * 0.8],
        [R, -w * 0.4],
        [R, w * 0.4],
        [R - 0.02, w * 0.8],
        [R - 0.08, w],
        [R - 0.1, hw],
        [0, hw],
      ],
      { at: [0, y, z], axis: [1, 0, 0], segments: 20, color: TIRE },
    );
    for (const s of [1, -1])
      b.part(new THREE.CircleGeometry(R - 0.09, 24), "#ffffff", {
        at: [s * (hw + 0.004), y, z],
        dir: [s, 0, 0],
        axis: "z",
        texture: WHEEL,
      });
    cyl(0.05, w + 0.12, [0, y, z], [1, 0, 0], STEEL);
    cyl(R * 0.46, 0.007, [hw + 0.025, y, z], [1, 0, 0], STEEL, 16);
    box(0.04, 0.07, 0.1, [hw + 0.03, y + R * 0.46, z + 0.04], ORANGE);
  }
  const FA: V = [0, 0.34, 1.15];
  const RA: V = [0, 0.38, -0.85];
  wheel(FA[2], 0.34, 0.08);
  wheel(RA[2], 0.38, 0.22);

  // fenders
  b.sweep(arc(RA, arcPt(RA, 0.46, -30), [1, 0, 0], -90), () => [0.14, 0.016], {
    section: "box",
    color: BODY,
    caps: "flat",
  });
  b.sweep(arc(FA, arcPt(FA, 0.42, -20), [1, 0, 0], 100), () => [0.06, 0.012], {
    section: "box",
    color: BODY,
    caps: "flat",
  });

  // ---------- fork & front end ----------
  const H: V = [0, 0.94, 0.35];
  b.part(new THREE.BoxGeometry(0.24, 0.04, 0.07), DARK, { at: H });
  tube([0, H[1] + 0.066, H[2] - 0.088], [0, H[1] - 0.066, H[2] + 0.088], 0.047, DARK);
  for (const s of [1, -1]) {
    const top: V = [s * 0.08, H[1], H[2]];
    const bot: V = [s * 0.08, FA[1], FA[2]];
    b.rod(top, bot, 0.022, STEEL);
    b.rod(lerp(top, bot, 0.55), bot, 0.034, DARK);
    cyl(0.03, 0.03, [s * 0.08, 0.34, 1.15], [1, 0, 0], ORANGE);
    // handlebars
    const pts: V[] = [
      [s * 0.05, 0.98, 0.33],
      [s * 0.14, 1.08, 0.33],
      [s * 0.3, 1.14, 0.32],
      [s * 0.42, 1.24, 0.3],
      [s * 0.44, 1.36, 0.28],
    ];
    b.sweep(catmull(pts.slice(0, 4)), 0.015, STEEL);
    b.rod(pts[3], pts[4], 0.022, BLACK);
    b.part(new THREE.SphereGeometry(0.024, 8, 5), ORANGE, { at: pts[4] });
    b.rod(pts[3], [s * 0.4, 1.24, 0.42], 0.007, STEEL);
    // headlight brackets
    b.rod([s * 0.08, 0.86, 0.456], [s * 0.095, 0.86, 0.55], 0.012, STEEL);
    // pipes & covers
    cyl(0.09, 0.07, [s * 0.165, 0.4, 0.0], [1, 0, 0], STEEL, 14);
    b.part(new THREE.CircleGeometry(0.085, 20), "#ffffff", {
      at: [s * 0.203, 0.4, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      texture: LOGO,
    });
    glow(
      b.part(new THREE.TorusGeometry(0.097, 0.008, 5, 18), BLUE, { at: [s * 0.2, 0.4, 0.0], dir: [s, 0, 0], axis: "z" }),
      1.4,
    );
    // foot pegs
    b.rod([s * 0.15, 0.32, -0.12], [s * 0.3, 0.32, -0.12], 0.02, BLACK);
    cyl(0.03, 0.05, [s * 0.31, 0.32, -0.12], [1, 0, 0], ORANGE);
    // exhaust
    const path = catmull([
      [s * 0.07, 0.6, 0.3],
      [s * 0.17, 0.42, 0.38],
      [s * 0.2, 0.25, 0.25],
      [s * 0.21, 0.24, -0.3],
      [s * 0.2, 0.3, -0.85],
      [s * 0.2, 0.36, -1.25],
    ]);
    b.sweep(path, 0.035, STEEL);
    b.sweep(path, 0.047, ORANGE, { from: 0.5, to: 0.7, caps: "flat" });
    b.sweep(path, 0.043, BLACK, { from: 0.9, to: 1, caps: "flat" });
    glow(b.part(new THREE.SphereGeometry(0.028, 6, 4), BLUE, { at: [s * 0.2, 0.36, -1.265] }), 1.5);
    // sissy bar
    const axl: V = [s * 0.15, 0.4, -0.85];
    const topP: V = [s * 0.15, 0.98, -1.0];
    tube(axl, topP, 0.016, STEEL);
    // frame
    tube([0, 0.3, -0.3], [s * 0.15, 0.38, -0.85], 0.022, DARK);
    tube([0, 0.64, -0.45], [s * 0.15, 0.38, -0.85], 0.022, DARK);
    // underglow
    glow(b.rod([s * 0.09, 0.19, 0.28], [s * 0.09, 0.19, -0.35], 0.012, BLUE), 1.6);
  }
  tube([-0.15, 0.98, -1.0], [0.15, 0.98, -1.0], 0.016, STEEL);
  b.part(new THREE.BoxGeometry(0.2, 0.05, 0.05), LEATHER, { at: [0, 0.98, -1.0] });
  glow(b.part(new THREE.SphereGeometry(0.032, 8, 5), "#ff7a2a", { at: [0, 0.92, -1.06] }), 1.6);

  // headlight
  b.lathe(
    [
      [0, -0.06],
      [0.085, -0.06],
      [0.1, 0],
      [0.095, 0.06],
      [0, 0.06],
    ],
    { at: [0, 0.86, 0.6], axis: [0, 0, 1], segments: 14, color: ORANGE },
  );
  glow(b.part(new THREE.SphereGeometry(0.075, 10, 6), "#d8f4ff", { at: [0, 0.86, 0.64], scale: [1, 1, 0.6] }), 1.8);

  // ---------- frame ----------
  tube([0, 0.8, H[2]], [0, 0.64, -0.45], 0.026, DARK);
  tube([0, 0.86, H[2]], [0, 0.4, 0.15], 0.03, DARK);
  tube([0, 0.4, 0.15], [0, 0.3, -0.3], 0.026, DARK);
  tube([0, 0.64, -0.45], [0, 0.4, -0.2], 0.024, DARK);
  cyl(0.05, 0.4, [0, 0.38, -0.85], [1, 0, 0], STEEL);

  // ---------- engine ----------
  b.part(new THREE.BoxGeometry(0.26, 0.24, 0.34), IRON, { at: [0, 0.38, 0.08] });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), BLUED, { at: [0, 0.27, 0.2] });
  const cylA: [V, V][] = [
    [[0, 0.45, 0.12], [0, 0.72, 0.3]],
    [[0, 0.45, 0.05], [0, 0.72, -0.12]],
  ];
  for (const [a, c] of cylA) {
    b.rod(a, c, 0.07, IRON);
    const dir: V = [0, c[1] - a[1], c[2] - a[2]];
    for (let k = 1; k <= 5; k++) cyl(0.1, 0.014, lerp(a, c, 0.2 + 0.13 * k).toArray() as V, dir, STEEL, 12);
    cyl(0.095, 0.06, c, dir, ORANGE, 12);
  }
  glow(box(0.05, 0.04, 0.12, [0, 0.56, 0.1], BLUE), 1.4);

  // ---------- tank, seat, gauge ----------
  const tank = b.loft(
    [
      { at: [0, 0.9, -0.28], w: 0.12, h: 0.12 },
      { at: [0, 0.9, -0.08], w: 0.3, h: 0.26 },
      { at: [0, 0.9, 0.14], w: 0.3, h: 0.24 },
      { at: [0, 0.9, 0.28], w: 0.13, h: 0.12 },
    ],
    { color: TANK },
  );
  for (const s of [1, -1])
    b.decal(tank, LOGO, { at: [s * 0.15, 0.9, 0.04], dir: [s, 0, 0], size: [0.17, 0.17] });
  cyl(0.035, 0.03, [0, 1.03, -0.05], [0, 1, 0], STEEL);
  cyl(0.052, 0.04, [0, 0.995, 0.24], [0, 1, 0.3], DARK);
  b.part(new THREE.CircleGeometry(0.042, 16), "#ffffff", {
    at: [0, 1.01, 0.238],
    dir: [0, 1, 0.3],
    axis: "z",
    texture: GAUGE,
  });
  b.extrude(
    [
      [-0.74, 0.86],
      [-0.7, 0.78],
      [-0.45, 0.69],
      [-0.24, 0.66],
      [-0.12, 0.72],
      [-0.24, 0.75],
      [-0.47, 0.77],
      [-0.6, 0.82],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.26, bevel: 0.02, color: LEATHER },
  );
  b.rod([-0.14, 0.7, -0.15], [-0.14, 0.7, -0.15], 0.001, DARK);

  return b.root;
}
```
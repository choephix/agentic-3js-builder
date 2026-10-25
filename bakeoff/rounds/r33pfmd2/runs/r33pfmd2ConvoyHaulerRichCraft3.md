```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured six-wheel convoy hauler with a roof turret, neon trim and a sealed, glowing cargo pod.",
};

// ---------------------------------------------------------------- palette
const DARK = "#0d1018";
const GUN = "#1b2030";
const STEEL = "#8892a8";
const CYAN = "#19e6ff";
const MAGENTA = "#ff2d95";
const AMBER = "#ffb020";
const RED = "#ff2a3a";
const WHITE = "#ffffff";
const TYRE = "#14151b";

// ---------------------------------------------------------------- paints
const HULL_BASE = paint((p, n) => {
  let c = mix("#262e44", "#3a4766", noise(p, 0.9, 3));
  c = mix(c, "#566a92", 0.45 * smoothstep(0.4, 1, n.y));
  c = mix(c, "#4b4034", 0.7 * smoothstep(1.9, 1.0, p.y) * (0.4 + noise(p, 0.3, 5)));
  c = mix(c, "#10131c", 0.5 * smoothstep(0.2, -0.8, n.y));
  return c;
});
const HULL = panelled(HULL_BASE, { size: 0.7, rivets: 0.12 });
const CABHULL = panelled(
  paint((p, n) => {
    let c = mix("#2b3350", "#44527a", noise(p, 0.7, 8));
    c = mix(c, "#6a7fb0", 0.4 * smoothstep(0.5, 1, n.y));
    c = mix(c, "#4b4034", 0.6 * smoothstep(1.5, 0.9, p.y));
    return c;
  }),
  { size: 0.6, rivets: 0.1 },
);
const PLATE = metal("iron", { tarnish: 0.5, polish: 0.2 });
const STEELP = metal("steel", { tarnish: 0.35 });

// ---------------------------------------------------------------- textures
const hazardSvg = (() => {
  let s = `<svg viewBox="0 0 256 16" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="16" fill="#f2c200"/>`;
  for (let i = -1; i < 17; i++) s += `<path d="M${i * 16} 16 l8 0 l8 -16 l-8 0z" fill="#111"/>`;
  return s + `</svg>`;
})();
const HAZ = svg(hazardSvg, { size: 512 });

const WINDSHIELD = svg(
  `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b3a52"/><stop offset="1" stop-color="#071622"/></linearGradient></defs>
  <rect width="220" height="120" rx="8" fill="url(#g)" stroke="#19e6ff" stroke-width="3"/>
  ${Array.from({ length: 12 }, (_, i) => `<rect x="4" y="${8 + i * 9.5}" width="212" height="1.5" fill="#19e6ff" opacity="0.18"/>`).join("")}
  <path d="M20 100 L110 40 L200 100" stroke="#19e6ff" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M60 100 L110 62 L160 100" stroke="#ff2d95" stroke-width="2" fill="none" opacity="0.8"/>
  <circle cx="110" cy="40" r="5" fill="none" stroke="#19e6ff" stroke-width="2"/>
  <text x="14" y="22" font-family="monospace" font-size="11" fill="#7ff3ff">ROUTE 07 // CLEAR</text>
  <text x="150" y="22" font-family="monospace" font-size="11" fill="#ff8ac6">POD OK</text>
  <path d="M0 0 L40 0 L0 40Z" fill="#ffffff" opacity="0.07"/>
  </svg>`,
  { size: 384 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 90 70" xmlns="http://www.w3.org/2000/svg">
  <rect width="90" height="70" rx="6" fill="#082a3d" stroke="#19e6ff" stroke-width="3"/>
  <path d="M8 62 L50 8" stroke="#ffffff" stroke-width="3" opacity="0.18"/>
  <path d="M22 62 L64 8" stroke="#ffffff" stroke-width="6" opacity="0.1"/>
  <rect x="8" y="50" width="30" height="3" fill="#19e6ff" opacity="0.5"/>
  </svg>`,
  { size: 192 },
);
const DOORTAG = svg(
  `<svg viewBox="0 0 130 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="130" height="50" rx="6" fill="#0d1018"/>
  <rect x="3" y="3" width="124" height="44" rx="4" fill="none" stroke="#ff2d95" stroke-width="2.5"/>
  <text x="12" y="25" font-family="monospace" font-weight="bold" font-size="18" fill="#ff7ab8">CONVOY 07</text>
  <text x="12" y="41" font-family="monospace" font-size="10" fill="#19e6ff">ESCORT // ARMOURED</text>
  <path d="M100 8 l14 0 l0 12 l-7 6 l-7 -6z" fill="#ffb020"/>
  </svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="50" fill="#07080c" stroke="#8892a8" stroke-width="3"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="8" y="${6 + i * 6}" width="84" height="3" fill="#2a3040"/>`).join("")}
  <rect x="44" y="4" width="12" height="42" fill="#ff2d95" opacity="0.85"/>
  <path d="M30 25 L50 8 L70 25 L50 42Z" fill="none" stroke="#19e6ff" stroke-width="2.5"/>
  </svg>`,
  { size: 256 },
);
const POD_LOGO = svg(
  `<svg viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="254" height="104" rx="10" fill="#0b0f1a" stroke="#19e6ff" stroke-width="4"/>
  <path d="M40 22 L70 22 L86 55 L70 88 L40 88 L24 55Z" fill="#101a2e" stroke="#ff2d95" stroke-width="5"/>
  <path d="M42 40 L55 32 L68 40 L68 62 L55 76 L42 62Z" fill="#19e6ff"/>
  <path d="M55 40 L55 66" stroke="#0b0f1a" stroke-width="4"/>
  <text x="100" y="52" font-family="monospace" font-weight="bold" font-size="30" fill="#ffffff">AEGIS-9</text>
  <text x="100" y="76" font-family="monospace" font-size="15" fill="#ff7ab8">SEALED CARGO</text>
  <text x="100" y="95" font-family="monospace" font-size="10" fill="#19e6ff">DO NOT OPEN // BIO-LOCK</text>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${196 + i * 4}" y="10" width="${i % 3 === 0 ? 3 : 1.5}" height="12" fill="#ffffff" opacity="0.8"/>`).join("")}
  </svg>`,
  { size: 512 },
);
const REARDOOR = svg(
  `<svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="110" fill="#10131c" stroke="#8892a8" stroke-width="4"/>
  <rect x="58" y="4" width="4" height="102" fill="#05060a"/>
  ${[
    [24, 28],
    [96, 28],
    [24, 82],
    [96, 82],
  ]
    .map(
      ([x, y]) =>
        `<path d="M${x - 11} ${y} l5.5 -9.5 l11 0 l5.5 9.5 l-5.5 9.5 l-11 0z" fill="#3a0a24" stroke="#ff2d95" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ff2d95"/>`,
    )
    .join("")}
  <rect x="30" y="50" width="60" height="12" rx="3" fill="#05060a" stroke="#19e6ff" stroke-width="2"/>
  <text x="60" y="59.5" text-anchor="middle" font-family="monospace" font-size="8" font-weight="bold" fill="#19e6ff">SEAL INTACT</text>
  </svg>`,
  { size: 384 },
);

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });
  const R = rng(11);

  const P = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, at, o);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), color, at, o);
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = WHITE) =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex });

  // --- chassis & underbody
  box(1.9, 0.36, 9.6, GUN, [0, 0.85, 0.1]);
  box(1.3, 0.2, 9.0, DARK, [0, 0.62, 0.1]);
  const axleZ = [3.5, -1.0, -3.2];
  for (const z of axleZ) {
    cyl(0.1, 0.1, 3.2, 8, STEEL, [0, 0.65, z], { rotation: [0, 0, 90] });
    P(new THREE.SphereGeometry(0.28, 7, 5), PLATE, [0, 0.62, z]);
  }

  // --- wheels
  for (const s of [1, -1]) {
    for (const z of axleZ) {
      cyl(0.65, 0.65, 0.5, 10, TYRE, [s * 1.45, 0.65, z], { rotation: [0, 0, 90] });
      // tread lugs
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + 0.15;
        box(0.52, 0.1, 0.16, "#22242e", [s * 1.45, 0.65 + Math.sin(a) * 0.64, z + Math.cos(a) * 0.64], {
          rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        });
      }
      cyl(0.38, 0.38, 0.08, 8, STEELP, [s * 1.72, 0.65, z], { rotation: [0, 0, 90] });
      cyl(0.12, 0.12, 0.14, 6, DARK, [s * 1.76, 0.65, z], { rotation: [0, 0, 90] });
      glow(
        P(new THREE.TorusGeometry(0.28, 0.03, 4, 12), CYAN, [s * 1.77, 0.65, z], { rotation: [0, 90, 0] }),
        1.4,
      );
      // fender
      box(0.8, 0.12, 1.75, GUN, [s * 1.5, 1.42, z]);
      box(0.8, 0.12, 0.3, PLATE, [s * 1.5, 1.34, z + 0.95], { rotation: [-25, 0, 0] });
      box(0.8, 0.12, 0.3, PLATE, [s * 1.5, 1.34, z - 0.95], { rotation: [25, 0, 0] });
    }
    // mud flaps
    box(0.55, 0.65, 0.05, DARK, [s * 1.45, 0.82, -3.95]);
    box(0.55, 0.65, 0.05, DARK, [s * 1.45, 0.82, -1.75]);
  }

  // --- side skirts with hazard strip and power cells
  for (const s of [1, -1]) {
    box(0.1, 0.62, 2.8, PLATE, [s * 1.3, 0.95, 1.2]);
    plane(2.8, 0.175, HAZ, [s * 1.356, 0.72, 1.2], [s, 0, 0]);
    for (let i = 0; i < 5; i++) glow(box(0.03, 0.14, 0.26, i % 2 ? CYAN : MAGENTA, [s * 1.36, 1.0, 0.1 + i * 0.5]), 1.6);
    // rear tandem skirt
    box(0.1, 0.5, 1.3, PLATE, [s * 1.3, 0.95, -2.1]);
  }

  // --- cab (side-view extrude)
  const cabOutline: [number, number, ...any[]][] = [
    [0, 0],
    [2.8, 0],
    [2.8, 0.9, "sharp"],
    [1.8, 1.1],
    [1.3, 2.2, "sharp"],
    [0, 2.2, "sharp"],
  ];
  b.extrude(cabOutline as any, {
    at: [0, 0.9, 2.0],
    x: [0, 0, 1],
    thickness: 2.5,
    bevel: 0.05,
    color: CABHULL,
  });
  // armour hood plates
  box(2.2, 0.08, 0.9, PLATE, [0, 1.99, 4.35], { rotation: [-6, 0, 0] });
  for (const s of [1, -1]) box(0.06, 0.55, 2.4, PLATE, [s * 1.27, 1.35, 3.4]);
  // windshield and side windows
  glow(plane(2.2, 1.15, WINDSHIELD, [0, 2.57, 3.58], [0, 0.5, 1.1]), 1.1);
  for (const s of [1, -1]) {
    glow(plane(0.9, 0.7, SIDEWIN, [s * 1.262, 2.65, 2.7], [s, 0, 0]), 1.0);
    plane(1.3, 0.5, DOORTAG, [s * 1.262, 1.7, 2.9], [s, 0, 0]);
    box(0.06, 0.12, 0.3, STEEL, [s * 1.28, 1.95, 2.35]);
    // armoured window frame
    box(0.05, 0.06, 1.0, DARK, [s * 1.27, 3.02, 2.7]);
  }
  // nose face: grille, headlights, bumper
  plane(1.0, 0.5, GRILLE, [0, 1.3, 4.81], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.06, WHITE, [s * 0.9, 1.55, 4.82]), 1.8);
    glow(box(0.5, 0.05, 0.06, CYAN, [s * 0.9, 1.35, 4.82]), 1.6);
    cyl(0.07, 0.07, 0.06, 6, AMBER, [s * 1.12, 1.05, 4.84], { rotation: [90, 0, 0] });
  }
  box(2.8, 0.38, 0.32, PLATE, [0, 1.0, 4.95]);
  plane(2.6, 0.163, HAZ, [0, 1.0, 5.116], [0, 0, 1]);
  for (const x of [-1.0, -0.5, 0, 0.5, 1.0])
    P(new THREE.ConeGeometry(0.09, 0.32, 5), STEELP, [x, 1.0, 5.2], { rotation: [90, 0, 0] });
  box(2.2, 0.1, 0.6, DARK, [0, 0.72, 4.85]); // skid plate
  // roof: light bar, sensors
  glow(box(0.9, 0.12, 0.2, CYAN, [-0.45, 3.2, 3.38]), 1.8);
  glow(box(0.9, 0.12, 0.2, MAGENTA, [0.45, 3.2, 3.38]), 1.8);
  box(1.9, 0.06, 0.26, DARK, [0, 3.14, 3.38]);
  cyl(0.03, 0.03, 1.1, 5, STEEL, [-1.05, 3.65, 2.2]);
  glow(P(new THREE.SphereGeometry(0.06, 5, 4), RED, [-1.05, 4.22, 2.2]), 2);
  // mirrors
  for (const s of [1, -1]) {
    b.rod([s * 1.25, 2.4, 3.65], [s * 1.55, 2.5, 3.8], 0.025, STEEL);
    box(0.1, 0.42, 0.26, GUN, [s * 1.6, 2.5, 3.8]);
    glow(box(0.02, 0.3, 0.2, CYAN, [s * 1.545, 2.5, 3.8]), 1.2);
  }
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 2.3, 8, STEELP, [s * 1.4, 2.35, 2.35]);
    cyl(0.13, 0.13, 0.12, 8, DARK, [s * 1.4, 3.55, 2.35]);
    glow(cyl(0.08, 0.08, 0.04, 8, AMBER, [s * 1.4, 3.6, 2.35]), 1.6);
    for (const y of [1.6, 2.4]) cyl(0.14, 0.14, 0.1, 8, PLATE, [s * 1.4, y, 2.35]);
  }

  // --- roof turret
  cyl(0.38, 0.45, 0.2, 8, PLATE, [0, 3.2, 2.55]);
  box(0.8, 0.4, 0.9, GUN, [0, 3.5, 2.55]);
  box(0.9, 0.12, 0.6, PLATE, [0, 3.74, 2.5], { rotation: [-8, 0, 0] });
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 3.5, 2.95], [s * 0.2, 3.5, 4.1], 0.065, STEELP);
    cyl(0.1, 0.1, 0.35, 8, DARK, [s * 0.2, 3.5, 3.15], { rotation: [90, 0, 0] });
    glow(cyl(0.07, 0.07, 0.04, 6, MAGENTA, [s * 0.2, 3.5, 4.12], { rotation: [90, 0, 0] }), 2);
    box(0.2, 0.28, 0.5, PLATE, [s * 0.5, 3.5, 2.6]);
  }
  glow(box(0.2, 0.1, 0.06, CYAN, [0, 3.62, 2.99]), 2);

  // --- coupling between cab and pod
  box(1.6, 1.5, 0.6, DARK, [0, 2.05, 1.75]);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.9, 3.0, 2.0],
        [s * 0.92, 2.55, 1.75],
        [s * 0.9, 3.0, 1.5],
      ]),
      0.045,
      { color: s > 0 ? CYAN : MAGENTA },
    );
    glow(cyl(0.07, 0.07, 0.1, 6, s > 0 ? CYAN : MAGENTA, [s * 0.9, 3.03, 2.0]), 1.3);
  }

  // --- cargo pod (front-view octagon extruded along z)
  const podOutline = (k: number): [number, number, string?][] => {
    const base: [number, number][] = [
      [-1.2, 0],
      [1.2, 0],
      [1.4, 0.35],
      [1.4, 2.0],
      [1.0, 2.55],
      [-1.0, 2.55],
      [-1.4, 2.0],
      [-1.4, 0.35],
    ];
    return base.map(([x, y]) => [x * k, 1.275 + (y - 1.275) * k] as [number, number]);
  };
  b.extrude(podOutline(1) as any, {
    at: [0, 1.3, -1.6],
    x: [1, 0, 0],
    thickness: 6.2,
    bevel: 0.06,
    color: HULL,
  });
  for (const z of [-4.5, -3.6, -0.2, 0.8]) {
    b.extrude(podOutline(1.04) as any, {
      at: [0, 1.3, z],
      x: [1, 0, 0],
      thickness: 0.28,
      bevel: 0.03,
      color: PLATE,
    });
  }
  // pod side details
  for (const s of [1, -1]) {
    plane(2.6, 1.1, POD_LOGO, [s * 1.405, 2.55, -1.8], [s, 0, 0]);
    glow(box(0.05, 0.07, 5.8, CYAN, [s * 1.425, 3.3, -1.6]), 1.6);
    glow(box(0.05, 0.07, 5.8, MAGENTA, [s * 1.425, 1.85, -1.6]), 1.6);
    // sloped shoulder lamps
    for (let i = 0; i < 4; i++)
      glow(box(0.06, 0.1, 0.35, AMBER, [s * 1.1, 3.82 + 0.0, -3.9 + i * 1.5]), 1.3);
    // vertical armour studs along side
    for (let i = 0; i < 6; i++) {
      const z = -4.0 + i * 0.28 + (i > 2 ? 3.2 : 0);
      box(0.08, 0.5, 0.12, GUN, [s * 1.425, 2.55, z]);
    }
  }
  // pod roof
  for (let i = 0; i < 3; i++) {
    const z = -3.8 + i * 1.5;
    box(1.0, 0.18, 0.7, GUN, [0, 3.95, z]);
    glow(box(0.8, 0.04, 0.08, MAGENTA, [0, 4.05, z]), 1.5);
    for (let k = -1; k <= 1; k++) box(0.06, 0.12, 0.6, DARK, [k * 0.3, 4.07, z]);
  }
  cyl(0.18, 0.22, 0.2, 8, PLATE, [0, 3.95, 0.6]);
  glow(P(new THREE.SphereGeometry(0.16, 6, 4), MAGENTA, [0, 4.12, 0.6]), 2.2);
  // dish and antenna
  cyl(0.5, 0.12, 0.16, 8, STEELP, [0.7, 4.3, -0.8], { rotation: [35, 0, 0] });
  b.rod([0.7, 3.95, -0.8], [0.7, 4.25, -0.8], 0.05, DARK);
  glow(P(new THREE.SphereGeometry(0.05, 5, 4), CYAN, [0.7, 4.38, -0.62]), 2);
  b.rod([-0.8, 3.95, -4.2], [-0.8, 5.0, -4.3], 0.025, STEEL);
  glow(P(new THREE.SphereGeometry(0.07, 5, 4), RED, [-0.8, 5.03, -4.3]), 2.2);

  // --- rear
  plane(2.4, 2.2, REARDOOR, [0, 2.5, -4.715], [0, 0, -1]);
  box(2.6, 0.3, 0.3, PLATE, [0, 1.0, -4.85]);
  plane(2.5, 0.156, HAZ, [0, 1.0, -5.01], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.12, 1.6, 0.06, RED, [s * 1.3, 2.5, -4.72]), 1.8);
    glow(box(0.35, 0.12, 0.06, RED, [s * 1.0, 1.1, -5.01]), 1.6);
  }
  box(0.5, 0.25, 0.12, DARK, [0, 0.75, -4.9]); // tow hook plate
  cyl(0.06, 0.06, 0.3, 6, STEEL, [0, 0.72, -5.1], { rotation: [90, 0, 0] });

  // --- scattered rivet bolts on cab roof (variation)
  for (let i = 0; i < 6; i++) {
    const x = (R() - 0.5) * 1.8;
    const z = 2.15 + R() * 0.6;
    cyl(0.04, 0.04, 0.04, 5, STEEL, [x, 3.12, z]);
  }

  return b.root;
}
```
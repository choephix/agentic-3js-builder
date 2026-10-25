```ts
import * as THREE from "three";
import { createBuilder, paint, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured convoy hauler: riveted armour cab with roof turret, six neon-hubbed wheels, ram plow, and a sealed hazard-banded cargo pod strapped to the bed.",
};

// ---------------------------------------------------------------- palette
const NAVY = "#141826";
const SLATE = "#2a3347";
const TEAL = "#2f5b6b";
const STEEL = "#8d99a8";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffd21a";
const ORANGE = "#ff7a1a";
const RED = "#ff2a3a";
const BLACK = "#0b0c11";
const TIRE = "#16171d";
const HEAD = "#fff3b0";

// ---------------------------------------------------------------- paints
const armour = (top: string, low: string) =>
  paint((p, n) => {
    let c = mix(low, top, smoothstep(-0.2, 0.9, n.y));
    c = mix(c, "#07080c", 0.55 * (1 - smoothstep(0.3, 1.5, p.y)));
    return c;
  });
const CAB_PAINT = panelled(armour(TEAL, SLATE), { size: 0.62, aspect: 0.6, rivets: 0.14 });
const FRAME_PAINT = panelled(metal("iron"), { size: 0.5, rivets: 0.12 });
const SKIRT_PAINT = panelled(armour("#46566e", NAVY), { size: 0.4, aspect: 0.8, rivets: 0.1 });
const HAZARD = paint((p) => (Math.floor((p.x + p.y) / 0.22) % 2 === 0 ? YELLOW : "#15161c"));
const POD_BASE = paint((p, n) => {
  if (p.z < -3.72 || p.z > 0.28) return Math.floor((p.x + p.y) / 0.2) % 2 === 0 ? YELLOW : "#15161c";
  const lit = smoothstep(-0.3, 0.9, n.y);
  let c = mix("#7a8798", "#e8eef6", lit);
  c = mix(c, "#1a2030", 0.5 * smoothstep(0.1, -0.7, n.y));
  return c;
});
const POD_PAINT = panelled(POD_BASE, { size: 0.9, aspect: 1, rivets: 0.15 });
const GUN_PAINT = metal("blued");

// ---------------------------------------------------------------- textures
const LABEL = svg(
  `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="196" height="76" rx="6" fill="#0d1117" stroke="${CYAN}" stroke-width="3"/>
    <rect x="8" y="8" width="184" height="12" fill="${YELLOW}"/>
    <path d="M8 8 l12 12 M28 8 l12 12 M48 8 l12 12 M68 8 l12 12 M88 8 l12 12 M108 8 l12 12 M128 8 l12 12 M148 8 l12 12 M168 8 l12 12" stroke="#15161c" stroke-width="5"/>
    <text x="100" y="46" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="${CYAN}">SEALED CARGO</text>
    <text x="100" y="66" text-anchor="middle" font-family="monospace" font-size="12" fill="${MAGENTA}">ZX-9 // DO NOT OPEN</text>
  </svg>`,
  { size: 512 },
);
const HATCH = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="49" fill="#1b2232" stroke="#05060a" stroke-width="2"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="${YELLOW}" stroke-width="5" stroke-dasharray="14 8"/>
    <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" fill="#10151f" stroke="${MAGENTA}" stroke-width="3"/>
    <circle cx="50" cy="50" r="9" fill="${MAGENTA}"/>
    <circle cx="50" cy="50" r="4" fill="#fff"/>
    <path d="M50 41 L50 22 M58 55 L74 64 M42 55 L26 64" stroke="${MAGENTA}" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);
const DOOR_TAG = svg(
  `<svg viewBox="0 0 140 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="136" height="52" rx="5" fill="#0a0d14" stroke="${MAGENTA}" stroke-width="3"/>
    <text x="70" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="${CYAN}">KA-13</text>
    <rect x="12" y="43" width="116" height="4" fill="${YELLOW}"/>
  </svg>`,
  { size: 256 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b3a55"/><stop offset="1" stop-color="#07182a"/></linearGradient></defs>
    <rect width="120" height="60" fill="url(#g)"/>
    <path d="M0 40 L20 28 L36 38 L60 20 L84 36 L104 26 L120 34 L120 60 L0 60Z" fill="#0f6a8a"/>
    <path d="M0 10h120M0 20h120M0 30h120M0 40h120M0 50h120" stroke="#19f0ff" stroke-opacity="0.25" stroke-width="1"/>
    <rect x="8" y="6" width="34" height="5" fill="${CYAN}"/><rect x="78" y="6" width="34" height="5" fill="${MAGENTA}"/>
    <circle cx="60" cy="30" r="10" fill="none" stroke="${YELLOW}" stroke-width="2"/>
    <path d="M60 14v8M60 38v8M44 30h8M68 30h8" stroke="${YELLOW}" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const chassis = b.joint("chassis", { at: [0, 1, 0] });

  // ------------------------------------------------------------ helpers
  type O = { bone?: any; rot?: [number, number, number]; tex?: any; name?: string };
  const box = (w: number, h: number, d: number, color: any, at: [number, number, number], o: O = {}) => {
    const opts: any = { bone: o.bone ?? chassis, at };
    if (o.rot) opts.rotation = o.rot;
    if (o.tex) opts.texture = o.tex;
    if (o.name) opts.name = o.name;
    return b.part(new THREE.BoxGeometry(w, h, d), color, opts);
  };
  const lamp = (w: number, h: number, d: number, color: string, at: [number, number, number], k = 1.4, o: O = {}) =>
    glow(box(w, h, d, color, at, o), k);
  const POD_AT: [number, number, number] = [0, 2.5, -4.0];
  const podRing = (y0: number, w: number, r0: number, r1: number, color: any, glowK = 0) => {
    const part = b.lathe(
      [
        [r0, y0],
        [r1, y0],
        [r1, y0 + w],
        [r0, y0 + w],
      ],
      { at: POD_AT, axis: [0, 0, 1], segments: 8, color, bone: chassis },
    );
    if (glowK) glow(part, glowK);
    return part;
  };

  // ------------------------------------------------------------ chassis frame
  box(2.4, 0.4, 8.7, FRAME_PAINT, [0, 0.95, 0.05], { name: "frame" });
  box(2.0, 0.25, 8.2, NAVY, [0, 0.72, 0.05]); // underbelly
  // rear bumper (hazard) and tail lights
  box(2.7, 0.45, 0.4, HAZARD, [0, 0.95, -4.5], { name: "rearBumper" });
  for (const s of [1, -1]) lamp(0.5, 0.16, 0.05, RED, [s * 0.9, 1.3, -4.72], 1.6);
  lamp(1.0, 0.06, 0.05, MAGENTA, [0, 0.78, -4.72], 1.3);

  // ------------------------------------------------------------ cab
  const cabOutline: [number, number][] = [
    [0, 0],
    [3.0, 0],
    [3.0, 0.8],
    [2.4, 1.7],
    [0.2, 1.7],
    [0, 1.4],
  ];
  const cab = b.extrude(cabOutline, {
    at: [0, 1.15, 1.2],
    x: [0, 0, 1],
    thickness: 2.5,
    color: CAB_PAINT,
    bone: chassis,
    name: "cab",
  });
  // windshield (screen texture, lit)
  glow(
    b.part(new THREE.BoxGeometry(2.0, 0.82, 0.06), "#ffffff", {
      bone: chassis,
      at: [0, 2.42, 3.93],
      rotation: [-33.7, 0, 0],
      texture: SCREEN,
    }),
    0.8,
  );
  // roof visor + roof plate
  box(2.7, 0.1, 0.55, SLATE, [0, 2.92, 3.62], { rot: [-33.7 * 0.3, 0, 0] });
  box(2.3, 0.1, 2.3, FRAME_PAINT, [0, 2.9, 2.35]);
  // side windows + door tags
  for (const s of [1, -1]) {
    lamp(0.06, 0.5, 1.0, "#0e6d8c", [s * 1.27, 2.35, 3.0], 0.7);
    box(0.08, 0.04, 1.1, YELLOW, [s * 1.27, 2.66, 3.0]);
    b.decal(cab, DOOR_TAG, {
      at: [s * 1.26, 1.65, 2.2],
      dir: [s, 0, 0],
      size: [1.3, 0.52],
      mirror: s < 0,
    });
    // mirrors
    box(0.1, 0.4, 0.22, BLACK, [s * 1.55, 2.4, 3.65]);
    box(0.28, 0.06, 0.06, SLATE, [s * 1.4, 2.5, 3.6]);
    lamp(0.04, 0.3, 0.16, CYAN, [s * 1.6, 2.4, 3.65], 1.0);
    // headlights
    lamp(0.45, 0.2, 0.06, HEAD, [s * 0.9, 1.75, 4.22], 1.8);
    box(0.55, 0.3, 0.05, BLACK, [s * 0.9, 1.75, 4.2]);
    // side skirts
    box(0.15, 0.5, 1.2, SKIRT_PAINT, [s * 1.3, 0.95, 1.85], { name: "skirt" });
    lamp(0.03, 0.06, 1.2, CYAN, [s * 1.385, 0.95, 1.85], 1.4);
    // exhaust stacks
    b.rod([s * 1.1, 1.2, 0.85], [s * 1.1, 3.3, 0.85], 0.1, STEEL, { bone: chassis });
    lamp(0.26, 0.06, 0.26, ORANGE, [s * 1.1, 3.32, 0.85], 1.5);
    box(0.28, 0.1, 0.28, BLACK, [s * 1.1, 1.8, 0.85]);
    box(0.28, 0.1, 0.28, BLACK, [s * 1.1, 2.6, 0.85]);
  }
  // grille
  box(1.6, 0.55, 0.05, BLACK, [0, 1.45, 4.21]);
  for (const y of [1.3, 1.45, 1.6]) lamp(1.4, 0.05, 0.03, MAGENTA, [0, y, 4.24], 1.4);
  // plow / ram
  b.extrude(
    [
      [0.1, 0],
      [0.85, 0],
      [0.55, 0.95],
      [0.1, 0.95],
    ],
    { at: [0, 0.35, 4.1], x: [0, 0, 1], thickness: 2.7, color: HAZARD, bone: chassis, name: "plow" },
  );
  for (let i = -2; i <= 2; i++)
    b.spike([i * 0.5, 0.55, 4.75], [0, 0, 1], 0.35, 0.08, { color: STEEL, bone: chassis, sides: 6 } as any);
  // roof lights and antenna
  for (const [x, c] of [
    [-0.45, RED],
    [0.45, CYAN],
  ] as [number, string][])
    lamp(0.6, 0.14, 0.22, c, [x, 3.0, 3.2], 1.8);
  b.rod([0.95, 2.95, 1.6], [0.95, 4.3, 1.5], 0.025, STEEL, { bone: chassis });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), MAGENTA, { bone: chassis, at: [0.95, 4.33, 1.5] }), 2);
  b.rod([-0.95, 2.95, 1.7], [-0.95, 3.8, 1.7], 0.02, STEEL, { bone: chassis });
  box(0.5, 0.3, 0.4, SLATE, [-0.75, 3.1, 1.6]);
  lamp(0.3, 0.05, 0.02, CYAN, [-0.75, 3.12, 1.81], 1.4);

  // ------------------------------------------------------------ wheels
  const axles = [3.2, -0.6, -2.0];
  let wi = 0;
  for (const s of [1, -1]) {
    for (const z of axles) {
      wi++;
      const name = `wheel${s > 0 ? "L" : "R"}${axles.indexOf(z) + 1}`;
      const w = b.joint(name, { parent: chassis, at: [s * 1.25, 0.62, z], dir: [s, 0, 0] });
      const at: [number, number, number] = [s * 1.25, 0.62, z];
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), TIRE, { bone: w, at, dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.54, 8), metal("steel"), { bone: w, at, dir: [1, 0, 0] });
      glow(b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.58, 8), CYAN, { bone: w, at, dir: [1, 0, 0] }), 1.6);
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 6), BLACK, { bone: w, at, dir: [1, 0, 0] });
      // lug nuts
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 5), STEEL, {
          bone: w,
          at: [s * 1.25, 0.62 + Math.sin(a) * 0.32, z + Math.cos(a) * 0.32],
          dir: [1, 0, 0],
        });
      }
      // fender + mudflap
      box(0.7, 0.12, 1.55, SKIRT_PAINT, [s * 1.27, 1.38, z], { name: "fender" });
      box(0.72, 0.1, 0.1, YELLOW, [s * 1.27, 1.38, z + 0.8]);
      box(0.6, 0.45, 0.05, BLACK, [s * 1.27, 0.85, z - 0.78]);
    }
  }

  // ------------------------------------------------------------ cargo pod
  const pod = b.lathe(
    [
      [0, 0],
      [1.0, 0],
      [1.3, 0.35],
      [1.3, 4.15],
      [1.0, 4.5],
      [0, 4.5],
    ],
    { at: POD_AT, axis: [0, 0, 1], segments: 8, color: POD_PAINT, bone: chassis, name: "pod" },
  );
  // straps and neon seal rings
  for (const y of [0.55, 2.2, 3.85]) podRing(y, 0.22, 1.24, 1.36, FRAME_PAINT);
  for (const y of [1.2, 1.55, 2.85, 3.2]) podRing(y, 0.06, 1.28, 1.34, MAGENTA, 1.6);
  // side labels
  for (const s of [1, -1])
    b.decal(pod, LABEL, { at: [s * 1.35, 2.7, -1.9], dir: [s, 0, 0], size: [2.2, 0.88], mirror: s < 0 });
  // top decals / vents
  for (const z of [-3.2, -2.0, -0.8]) {
    box(0.9, 0.14, 0.5, SLATE, [0, 3.85, z]);
    lamp(0.7, 0.04, 0.08, CYAN, [0, 3.93, z], 1.3);
  }
  // rear hatch
  b.part(new THREE.CircleGeometry(0.95, 12), "#ffffff", {
    bone: chassis,
    at: [0, 2.5, -4.012],
    dir: [0, 0, -1],
    axis: "z",
    texture: HATCH,
  });
  const rim = b.lathe(
    [
      [0.93, 0],
      [1.05, 0],
      [1.05, 0.04],
      [0.93, 0.04],
    ],
    { at: [0, 2.5, -4.04], axis: [0, 0, 1], segments: 12, color: CYAN, bone: chassis },
  );
  glow(rim, 1.6);
  // hatch locking bars
  for (const s of [1, -1]) box(0.12, 0.7, 0.08, STEEL, [s * 1.1, 2.5, -4.03]);
  // front pod brace to the cab
  box(1.6, 0.6, 0.5, SLATE, [0, 1.45, 0.85]);
  // saddle blocks under the pod
  for (const z of [-3.4, -1.9, -0.4]) box(1.9, 0.25, 0.5, BLACK, [0, 1.25, z]);
  // sealed-status beacon on pod front
  glow(b.part(new THREE.SphereGeometry(0.14, 6, 4), MAGENTA, { bone: chassis, at: [0, 3.9, 0.15] }), 2);

  // ------------------------------------------------------------ turret
  const turret = b.joint("turret", { parent: chassis, at: [0, 3.0, 2.0], dir: [0, 1, 0] });
  b.part(new THREE.CylinderGeometry(0.55, 0.65, 0.22, 8), STEEL, { bone: turret, at: [0, 3.1, 2.0] });
  box(1.0, 0.5, 1.1, GUN_PAINT, [0, 3.45, 2.0], { bone: turret, name: "turretHead" });
  for (const s of [1, -1]) {
    box(0.12, 0.42, 0.9, CAB_PAINT, [s * 0.56, 3.45, 2.0], { bone: turret, rot: [0, 0, s * 12] });
    lamp(0.04, 0.06, 0.5, CYAN, [s * 0.63, 3.45, 2.0], 1.4, { bone: turret });
  }
  lamp(0.5, 0.08, 0.03, RED, [0, 3.5, 2.56], 2, { bone: turret });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.4, 2.5], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.rod([s * 0.24, 3.4, 2.5], [s * 0.24, 3.4, 3.9], 0.07, GUN_PAINT, { bone: gun, sides: 8 } as any);
    box(0.2, 0.2, 0.25, BLACK, [s * 0.24, 3.4, 3.85], { bone: gun });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), ORANGE, { bone: gun, at: [s * 0.24, 3.4, 4.0] }), 2);
    box(0.14, 0.14, 0.4, SLATE, [s * 0.24, 3.4, 2.7], { bone: gun });
  }

  // ------------------------------------------------------------ underside / details
  for (const s of [1, -1]) {
    // side rails on pod bed with warning blocks
    for (const z of [-3.6, -2.6, -1.6, -0.6]) lamp(0.06, 0.1, 0.25, YELLOW, [s * 1.2, 1.2, z], 1.0);
    // fuel tanks
    b.capsule([s * 0.8, 0.62, -3.6], [s * 0.8, 0.62, -3.0], 0.2, SLATE, { bone: chassis, sides: 6 } as any);
  }

  return b.root;
}
```
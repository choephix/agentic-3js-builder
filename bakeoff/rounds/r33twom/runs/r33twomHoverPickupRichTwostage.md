<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Hover Technical",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export const REQUESTS = [
  {
    id: "roofLightBar",
    kind: "add",
    part: "cabRoof",
    what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, and brackets.",
    at: [0, 1.62, 0.15],
    normal: [0, 1, 0],
    bone: null,
    room: [1.5, 0.2, 0.3],
  },
  {
    id: "grille",
    kind: "add",
    part: "hood",
    what: "Front grille: dark mesh slats with a thin CYAN glowing strip, a small emblem in the centre.",
    at: [0, 0.72, 2.46],
    normal: [0, 0, 1],
    bone: null,
    room: [1.2, 0.35, 0.15],
  },
  {
    id: "bedTurret",
    kind: "add",
    part: "bed",
    what: "Pintle-mounted twin autocannon in the bed: ring mount, pivot, two barrels with muzzle brakes, ammo box with belt, glowing MAGENTA sight.",
    at: [0, 1.15, -1.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.9, 0.7, 1.2],
  },
  {
    id: "thrusterFins",
    kind: "add",
    part: "thrusterFL",
    what: "Fins, intake grilles and a ring of glowing CYAN plasma emitters on the underside of each of the four thruster pods (one request, repeat on all four).",
    at: [0.95, 0.3, 1.4],
    normal: [0, -1, 0],
    bone: null,
    room: [0.8, 0.3, 0.8],
  },
  {
    id: "headlights",
    kind: "add",
    part: "hood",
    what: "Pair of angular headlights with glowing WHITE lenses and CYAN LED eyebrow strips.",
    at: [0.7, 0.8, 2.45],
    normal: [0, 0, 1],
    bone: null,
    room: [0.4, 0.2, 0.15],
  },
  {
    id: "tailLights",
    kind: "add",
    part: "bed",
    what: "Rear tail light strips in MAGENTA, a tow hitch removed and replaced by a small exhaust vent grid.",
    at: [0, 0.85, -2.45],
    normal: [0, 0, -1],
    bone: null,
    room: [1.7, 0.3, 0.15],
  },
  {
    id: "antennaArray",
    kind: "add",
    part: "cabRoof",
    what: "Cluster of whip antennas and a small radar dish on the rear roof corner with a blinking MAGENTA tip.",
    at: [-0.6, 1.62, -0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.4, 0.8, 0.4],
  },
  {
    id: "sideArmour",
    kind: "add",
    part: "bodySide",
    what: "Bolted armour plates and exhaust vents along both lower sides, with CYAN trim lines.",
    at: [1.0, 0.7, 0],
    normal: [1, 0, 0],
    bone: null,
    room: [0.2, 0.5, 2.4],
  },
  {
    id: "sideMirrors",
    kind: "add",
    part: "cab",
    what: "Angular wing mirrors with small CYAN indicator, and door handles.",
    at: [1.0, 1.15, 0.85],
    normal: [1, 0, 0],
    bone: null,
    room: [0.4, 0.3, 0.3],
  },
  {
    id: "hullCamo",
    kind: "texture",
    part: "bodySide",
    what: "Dark urban digital camo in HULL and HULL_DARK on both body sides, with a faded white unit number near the rear and CYAN neon stripe.",
  },
  {
    id: "hoodDecal",
    kind: "texture",
    part: "hood",
    what: "Hazard chevrons in YELLOW and HULL_DARK along the hood front edge, scratches and soot near the vents.",
  },
  {
    id: "windshield",
    kind: "texture",
    part: "glass",
    what: "Tinted glass with a faint CYAN HUD grid and cracks at one corner.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5a48";
export const HULL_DARK = "#2e3a2f";
export const METAL = "#1d1f26";
export const STEEL = "#6b7280";
export const CYAN = "#19f0ff";
export const MAGENTA = "#ff2bd6";
export const YELLOW = "#f2c200";
export const GLASS = "#0c2a3a";
export const TIRE = "#101014";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(5);

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], name });

  // chassis
  box(1.9, 0.25, 4.8, METAL, 0, 0.55, 0, "chassis");
  // body lower
  box(2.0, 0.45, 4.9, HULL, 0, 0.88, 0, "bodySide");
  // hood (sloped)
  b.part(new THREE.BoxGeometry(1.95, 0.35, 1.5), HULL, { at: [0, 1.2, 1.7], rotation: [-6, 0, 0], name: "hood" });
  box(1.5, 0.08, 0.5, HULL_DARK, 0, 1.4, 1.65, "hoodScoop");
  // front bumper
  box(2.1, 0.3, 0.3, HULL_DARK, 0, 0.75, 2.5, "bumper");
  box(1.6, 0.1, 0.2, METAL, 0, 0.55, 2.6, "splitter");
  // cab
  box(1.9, 0.6, 1.5, HULL, 0, 1.35, 0.1, "cab");
  b.part(new THREE.BoxGeometry(1.7, 0.1, 1.2), HULL_DARK, { at: [0, 1.58, 0.1], name: "cabRoof" });
  // glass
  b.part(new THREE.BoxGeometry(1.7, 0.5, 0.06), GLASS, { at: [0, 1.38, 0.88], rotation: [-25, 0, 0], name: "glass" });
  b.part(new THREE.BoxGeometry(1.7, 0.45, 0.06), GLASS, { at: [0, 1.38, -0.7], rotation: [20, 0, 0], name: "glassRear" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.4, 1.0), GLASS, { at: [s * 0.96, 1.4, 0.1], name: "glassSide" });
    // pillars
    box(0.1, 0.5, 0.1, HULL_DARK, s * 0.9, 1.4, 0.82);
    box(0.1, 0.5, 0.1, HULL_DARK, s * 0.9, 1.4, -0.62);
  }
  // bed
  box(1.9, 0.08, 2.0, METAL, 0, 1.08, -1.45, "bedFloor");
  for (const s of [1, -1]) {
    box(0.1, 0.4, 2.0, HULL, s * 0.95, 1.25, -1.45, "bed");
    box(0.12, 0.08, 2.0, HULL_DARK, s * 0.95, 1.5, -1.45);
  }
  box(1.9, 0.4, 0.1, HULL, 0, 1.25, -2.4, "bed");
  box(1.9, 0.4, 0.1, HULL, 0, 1.25, -0.5, "bedFront");
  // roll bar
  for (const s of [1, -1]) box(0.08, 0.6, 0.08, STEEL, s * 0.8, 1.55, -0.55);
  box(1.7, 0.08, 0.08, STEEL, 0, 1.85, -0.55);

  // thruster pods
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const x = sx * 1.25;
      const z = sz * 1.5;
      const nm = `thruster${sz > 0 ? "F" : "R"}${sx > 0 ? "L" : "R"}`;
      b.part(new THREE.CylinderGeometry(0.42, 0.5, 0.45, 8), STEEL, { at: [x, 0.55, z], name: nm });
      b.part(new THREE.CylinderGeometry(0.5, 0.4, 0.15, 8), METAL, { at: [x, 0.3, z] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 8), CYAN, { at: [x, 0.2, z] });
      b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 8), HULL_DARK, { at: [x, 0.8, z] });
      // strut to body
      b.part(new THREE.BoxGeometry(0.5, 0.18, 0.25), METAL, { at: [sx * 1.08, 0.7, z] });
      for (let i = 0; i < 3; i++) {
        b.part(new THREE.BoxGeometry(0.06, 0.1, 0.5), YELLOW, { at: [x + (i - 1) * 0.2, 0.9, z], name: undefined });
      }
    }
  // underglow
  box(1.7, 0.04, 4.2, CYAN, 0, 0.4, 0, "underglow");
  // roof light bar housing placeholder
  box(1.4, 0.06, 0.12, METAL, 0, 1.66, 0.4);
  // fender flares
  for (const s of [1, -1]) box(0.1, 0.12, 4.9, HULL_DARK, s * 1.03, 1.0, 0);
  // exhaust stacks
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.6, 6), STEEL, { at: [s * 0.6, 1.4, -0.6 + 0.0] });
  // rear fins
  for (const s of [1, -1]) box(0.06, 0.4, 0.5, HULL_DARK, s * 0.8, 1.0, -2.5);
  // scatter bolts
  for (let i = 0; i < 12; i++) {
    const s = R() < 0.5 ? 1 : -1;
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), STEEL, {
      at: [s * 1.015, 0.8 + R() * 0.2, -2 + R() * 4],
      dir: [s, 0, 0],
    });
  }

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

Hull camo: a digital-camo paint (HULL / HULL_DARK blocks) with a CYAN neon stripe band, plus a faded white unit number drawn as a texture on the rear body sides.
Hood decal: a paint with yellow/dark hazard chevrons near the front edge, soot and scratch streaks toward the vents.
Windshield: a tinted glass SVG texture with a faint cyan HUD grid, corner brackets and cracks at one corner.

The `bodySide` part is one box, so I paint it with a custom paint; the unit number goes on as a separate decal part, since the request names only the body-side surface. The `glass` part is a box that shows its texture on all six faces, so the SVG applies directly.

<<<<<<< SEARCH
export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(5);
=======
const CAMO = paint((p, n) => {
  if (Math.abs(n.x) < 0.5) return HULL;
  const q = 0.14;
  const u = Math.floor(p.z / q);
  const v = Math.floor(p.y / q);
  const h = Math.abs(Math.sin(u * 12.9898 + v * 78.233 + Math.sign(n.x) * 3.1) * 43758.5453) % 1;
  const big = noise(p, 0.5, 4);
  if (Math.abs(p.y - 0.86) < 0.018) return CYAN;
  if (Math.abs(p.y - 0.86) < 0.03) return METAL;
  return big + h * 0.5 > 0.85 ? HULL_DARK : h > 0.78 ? METAL : HULL;
});

const HOOD_PAINT = paint((p, n) => {
  if (n.y < 0.5) return HULL;
  const edge = p.z - 2.1;
  if (edge > 0) {
    const k = Math.floor((p.x + (edge * 1.6)) / 0.16);
    return (((k % 2) + 2) % 2 === 0 ? YELLOW : HULL_DARK);
  }
  const soot = smoothstep(0.55, 0.85, noise(p, 0.3, 11)) * smoothstep(1.7, 1.2, p.z);
  const scratch = Math.abs(((p.x * 3 + p.z * 5) % 0.5) - 0.25) < 0.004 && noise(p, 0.2, 3) > 0.55;
  if (scratch) return STEEL;
  return mix(HULL, HULL_DARK, soot * 0.9);
});

const GLASS_TEX = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="64" fill="#0c2a3a"/>
    <rect width="128" height="32" fill="#103a50" opacity="0.5"/>
    <g stroke="#19f0ff" stroke-width="0.6" opacity="0.35">
      ${Array.from({ length: 15 }, (_, i) => `<path d="M${i * 9} 0V64"/>`).join("")}
      ${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 9}H128"/>`).join("")}
    </g>
    <g stroke="#19f0ff" stroke-width="1.6" fill="none" opacity="0.7">
      <path d="M6 14V6H14M114 6H122V14M6 50V58H14M114 58H122V50"/>
      <circle cx="64" cy="32" r="9"/><path d="M64 20V26M64 38V44M52 32H58M70 32H76"/>
    </g>
    <g stroke="#c8f4ff" stroke-width="0.9" fill="none" opacity="0.8">
      <path d="M128 0L110 14L104 12L92 26M110 14L116 26L112 40M104 12L108 4"/>
    </g>
  </svg>`,
  { size: 512 },
);

const UNIT_TEX = svg(
  `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
    <text x="64" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="40" fill="#ffffff" opacity="0.7">HV-07</text>
    <path d="M6 44H122" stroke="#ffffff" stroke-width="3" opacity="0.5"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const R = rng(5);
>>>>>>> REPLACE

<<<<<<< SEARCH
import { createBuilder, rng } from "agentic-3js-builder";
=======
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(2.0, 0.45, 4.9, HULL, 0, 0.88, 0, "bodySide");
=======
  box(2.0, 0.45, 4.9, CAMO as unknown as string, 0, 0.88, 0, "bodySide");
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.9, 0.34), "#ffffff", {
      at: [s * 1.006, 0.9, -1.5],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: UNIT_TEX,
      name: "unitNumber",
    });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(1.95, 0.35, 1.5), HULL, { at: [0, 1.2, 1.7], rotation: [-6, 0, 0], name: "hood" });
=======
  b.part(new THREE.BoxGeometry(1.95, 0.35, 1.5), HOOD_PAINT, { at: [0, 1.2, 1.7], rotation: [-6, 0, 0], name: "hood" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(1.7, 0.5, 0.06), GLASS, { at: [0, 1.38, 0.88], rotation: [-25, 0, 0], name: "glass" });
=======
  b.part(new THREE.BoxGeometry(1.7, 0.5, 0.06), "#ffffff", { at: [0, 1.38, 0.88], rotation: [-25, 0, 0], name: "glass", texture: GLASS_TEX });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { rng, paint, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addRoofLightBar(b: Builder) {
  const R = rng(21);
  const Y = 1.66; // top of stage-1 roof housing strip ~1.69
  const Z = 0.15;
  const BASE = 1.63;

  const part = (g: THREE.BufferGeometry, c: any, at: number[], extra: any = {}) =>
    b.part(g, c, { at, ...extra });

  // painted housing with subtle top highlight and grime
  const housingPaint = paint((p, n) => {
    const top = Math.max(0, n.y);
    const wear = (Math.sin(p.x * 23) * 0.5 + 0.5) * 0.08;
    const base = [0.11 + top * 0.08 + wear, 0.12 + top * 0.08 + wear, 0.15 + top * 0.1 + wear] as const;
    return [base[0], base[1], base[2]];
  });

  // main housing: back plate, top hood, front lip
  part(new THREE.BoxGeometry(1.46, 0.07, 0.26), housingPaint, [0, BASE + 0.07, Z], { name: "lightBarBase" });
  part(new THREE.BoxGeometry(1.5, 0.03, 0.3), METAL, [0, BASE + 0.12, Z - 0.01], { name: "lightBarHood" });
  part(new THREE.BoxGeometry(1.46, 0.03, 0.04), STEEL, [0, BASE + 0.045, Z + 0.14], { name: "lightBarLip" });
  part(new THREE.BoxGeometry(1.46, 0.08, 0.03), METAL, [0, BASE + 0.08, Z - 0.14], { name: "lightBarBack" });

  // end caps
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.06, 0.12, 0.3), HULL_DARK, [s * 0.75, BASE + 0.08, Z], { name: "lightBarCap" });
    part(new THREE.BoxGeometry(0.02, 0.08, 0.1), YELLOW, [s * 0.785, BASE + 0.08, Z + 0.06]);
    // brackets down to roof
    for (const dz of [-0.09, 0.09]) {
      part(new THREE.BoxGeometry(0.08, 0.07, 0.05), STEEL, [s * 0.62, BASE + 0.02, Z + dz], { name: "lightBarBracket" });
      part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), METAL, [s * 0.62, BASE + 0.06, Z + dz]);
    }
    part(new THREE.BoxGeometry(0.08, 0.07, 0.05), STEEL, [s * 0.2, BASE + 0.02, Z - 0.09]);
  }

  // lenses: six lamps alternating cyan / magenta, each with reflector and bezel
  const lampW = 0.2;
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.235;
    const col = i % 2 === 0 ? CYAN : MAGENTA;
    part(new THREE.BoxGeometry(lampW + 0.03, 0.1, 0.02), METAL, [x, BASE + 0.085, Z + 0.145], { name: "lampBezel" });
    glow(
      part(new THREE.BoxGeometry(lampW, 0.075, 0.025), col, [x, BASE + 0.085, Z + 0.158], { name: "lampLens" }),
      1.8,
    );
    // inner bright core strip
    glow(part(new THREE.BoxGeometry(lampW * 0.6, 0.02, 0.01), "#ffffff", [x, BASE + 0.085, Z + 0.173]), 2.2);
    // tiny vertical ribs on lens
    for (const dx of [-0.06, 0.06]) part(new THREE.BoxGeometry(0.008, 0.07, 0.01), METAL, [x + dx, BASE + 0.085, Z + 0.171]);
    // dividers
    if (i < 5) part(new THREE.BoxGeometry(0.02, 0.09, 0.05), STEEL, [x + 0.1175, BASE + 0.085, Z + 0.14]);
  }

  // roof-facing glow spill strips on hood edge
  glow(part(new THREE.BoxGeometry(1.3, 0.008, 0.012), CYAN, [0, BASE + 0.137, Z + 0.15]), 1.5);

  // top vents on hood
  for (let i = 0; i < 8; i++) {
    const x = (i - 3.5) * 0.17;
    part(new THREE.BoxGeometry(0.1, 0.008, 0.012), HULL_DARK, [x, BASE + 0.137, Z - 0.05 + R() * 0.0]);
  }

  // hazard stripe decal on hood top edge
  const hazard = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#1d1f26"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${k * 8} 8 L${k * 8 + 4} 0 L${k * 8 + 8} 0 L${k * 8 + 4} 8Z" fill="#f2c200"/>`).join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(1.2, 0.04), "#ffffff", {
    at: [0, BASE + 0.1, Z - 0.152],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazard,
    name: "lightBarHazard",
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addGrille(b: Builder) {
  const R = rng(22);
  const WHITE = "#e8f4ff";

  // ---------- GRILLE ----------
  const gz = 2.62;
  const gy = 0.74;
  // frame
  b.part(new THREE.BoxGeometry(1.2, 0.34, 0.06), METAL, { at: [0, gy, gz], name: "grilleFrame" });
  // texture for mesh slats and emblem
  const meshTex = svg(
    `<svg viewBox="0 0 120 34" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="34" fill="#0a0b10"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="4" y="${3 + i * 3.4}" width="112" height="1.8" fill="#2a2e3a"/>`).join("")}
      ${Array.from({ length: 14 }, (_, i) => `<path d="M${6 + i * 8.4} 2 L${10 + i * 8.4} 32" stroke="#171922" stroke-width="1"/>`).join("")}
      <rect x="1" y="1" width="118" height="32" fill="none" stroke="#3a3f4e" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.1, 0.28), "#ffffff", {
    at: [0, gy, gz + 0.034],
    dir: [0, 0, 1],
    axis: "z",
    texture: meshTex,
    name: "grilleMesh",
  });
  // horizontal slats (raised)
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.BoxGeometry(1.1, 0.025, 0.04), i % 2 ? HULL_DARK : STEEL, {
      at: [0, gy - 0.1 + i * 0.07, gz + 0.045],
      name: "grilleSlat",
    });
  }
  // vertical dividers
  for (const x of [-0.37, 0.37]) {
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.06), METAL, { at: [x, gy, gz + 0.045] });
  }
  // glowing cyan strip
  glow(b.part(new THREE.BoxGeometry(1.1, 0.025, 0.03), CYAN, { at: [0, gy + 0.19, gz + 0.04], name: "grilleStrip" }), 1.6);
  glow(b.part(new THREE.BoxGeometry(1.1, 0.015, 0.03), CYAN, { at: [0, gy - 0.19, gz + 0.04] }), 1.2);
  // emblem
  const emblem = svg(
    `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <polygon points="20,2 38,12 38,28 20,38 2,28 2,12" fill="#10131a" stroke="#19f0ff" stroke-width="2.5"/>
      <path d="M10 26 L20 8 L30 26 L20 21 Z" fill="#19f0ff"/>
      <circle cx="20" cy="29" r="2.4" fill="#ff2bd6"/>
    </svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      at: [0, gy, gz + 0.075],
      dir: [0, 0, 1],
      axis: "z",
      texture: emblem,
      name: "grilleEmblem",
    }),
    1.2,
  );
  // corner bolts
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), STEEL, {
        at: [sx * 0.56, gy + sy * 0.14, gz + 0.04],
        dir: [0, 0, 1],
      });
  // tow hooks below
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), YELLOW, { at: [s * 0.45, 0.58, 2.66], name: "towHook" });
  }

  // ---------- BED TURRET ----------
  const tx = 0;
  const tz = -1.2;
  const base = 1.12;
  // floor plate
  b.part(new THREE.CylinderGeometry(0.4, 0.44, 0.04, 8), STEEL, { at: [tx, base + 0.02, tz], name: "turretPlate" });
  // ring mount (torus)
  b.part(new THREE.TorusGeometry(0.34, 0.03, 5, 12), METAL, {
    at: [tx, base + 0.1, tz],
    rotation: [90, 0, 0],
    name: "turretRing",
  });
  // ring bolts
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), YELLOW, {
      at: [tx + Math.cos(a) * 0.34, base + 0.1, tz + Math.sin(a) * 0.34],
    });
  }
  // pedestal
  b.part(new THREE.CylinderGeometry(0.08, 0.12, 0.4, 8), HULL_DARK, { at: [tx, base + 0.24, tz], name: "turretPost" });
  // pivot
  b.part(new THREE.SphereGeometry(0.12, 8, 6), STEEL, { at: [tx, base + 0.48, tz], name: "turretPivot" });
  // cradle
  b.part(new THREE.BoxGeometry(0.46, 0.16, 0.3), HULL_DARK, { at: [tx, base + 0.52, tz + 0.05], name: "turretCradle" });
  b.part(new THREE.BoxGeometry(0.5, 0.03, 0.34), YELLOW, { at: [tx, base + 0.61, tz + 0.05] });
  // twin barrels
  for (const s of [1, -1]) {
    const x = tx + s * 0.14;
    const y = base + 0.52;
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 8), METAL, { at: [x, y, tz + 0.24], dir: [0, 0, 1], name: "barrelHousing" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), METAL, { at: [x, y, tz + 0.7], dir: [0, 0, 1], name: "barrel" });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), STEEL, { at: [x, y, tz + 0.45 + k * 0.12], dir: [0, 0, 1] });
    // muzzle brake
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.14), STEEL, { at: [x, y, tz + 1.12], name: "muzzleBrake" });
    b.part(new THREE.BoxGeometry(0.12, 0.025, 0.05), METAL, { at: [x, y, tz + 1.12] });
    b.part(new THREE.BoxGeometry(0.025, 0.12, 0.05), METAL, { at: [x, y, tz + 1.12] });
    // rear ammo feed
    b.part(new THREE.BoxGeometry(0.07, 0.07, 0.16), HULL_DARK, { at: [x, y, tz - 0.12] });
  }
  // ammo box
  b.part(new THREE.BoxGeometry(0.3, 0.22, 0.3), HULL_DARK, { at: [tx + 0.36, base + 0.2, tz - 0.05], name: "ammoBox" });
  b.part(new THREE.BoxGeometry(0.32, 0.04, 0.32), YELLOW, { at: [tx + 0.36, base + 0.33, tz - 0.05] });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.02), STEEL, { at: [tx + 0.36, base + 0.22, tz + 0.11] });
  // ammo belt: links from box up to the gun
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bx = tx + 0.36 - t * 0.3 + Math.sin(t * 3) * 0.03;
    const by = base + 0.33 + t * 0.2 + Math.sin(t * Math.PI) * 0.1;
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.06), i % 2 ? YELLOW : "#b88a2a", {
      at: [bx, by, tz - 0.05 + t * 0.1],
      rotation: [0, 0, -30 + R() * 10],
      name: "beltLink",
    });
  }
  // sight (glowing magenta)
  b.part(new THREE.BoxGeometry(0.06, 0.1, 0.1), METAL, { at: [tx, base + 0.7, tz + 0.1], name: "sightMount" });
  glow(b.part(new THREE.BoxGeometry(0.08, 0.06, 0.03), MAGENTA, { at: [tx, base + 0.74, tz + 0.17], name: "sightLens" }), 2);
  glow(b.part(new THREE.BoxGeometry(0.2, 0.012, 0.02), MAGENTA, { at: [tx, base + 0.42, tz + 0.2] }), 1.4);
  // shield plates beside the cradle
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.03, 0.22, 0.2), HULL_DARK, {
      at: [tx + s * 0.27, base + 0.55, tz + 0.12],
      rotation: [0, s * 20, 0],
      name: "gunShield",
    });
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addThrusterFins(b: Builder) {
  const PLASMA = "#8ffbff";
  const VENT = "#0a0b10";
  const pods: [number, number][] = [
    [1.25, 1.5],
    [-1.25, 1.5],
    [1.25, -1.5],
    [-1.25, -1.5],
  ];

  for (const [x, z] of pods) {
    const sx = x > 0 ? 1 : -1;
    const sz = z > 0 ? 1 : -1;

    // ring of plasma emitters on the underside of the pod
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const px = x + Math.cos(a) * 0.36;
      const pz = z + Math.sin(a) * 0.36;
      glow(
        b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.07, 6), CYAN, {
          at: [px, 0.14, pz],
          name: "plasmaEmitter",
        }),
        1.6,
      );
      // small housing collar around each emitter
      b.part(new THREE.CylinderGeometry(0.065, 0.07, 0.03, 6), METAL, { at: [px, 0.18, pz] });
    }

    // central glowing core under the pod
    glow(b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 8), PLASMA, { at: [x, 0.13, z], name: "plasmaCore" }), 2);
    b.part(new THREE.CylinderGeometry(0.22, 0.26, 0.04, 8), HULL_DARK, { at: [x, 0.16, z] });

    // stabiliser fins: four blades radiating outward
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const r = 0.52;
      const fx = x + Math.cos(a) * r;
      const fz = z + Math.sin(a) * r;
      b.part(new THREE.BoxGeometry(0.34, 0.2, 0.05), HULL_DARK, {
        at: [fx, 0.38, fz],
        rotation: [0, (-a * 180) / Math.PI + 90, 0],
        name: "thrusterFin",
      });
      // cyan edge trim on fin
      glow(
        b.part(new THREE.BoxGeometry(0.3, 0.02, 0.055), CYAN, {
          at: [fx, 0.28, fz],
          rotation: [0, (-a * 180) / Math.PI + 90, 0],
        }),
        1.2,
      );
    }

    // intake grilles on inner and outer sides: dark slats in a frame
    for (const side of [1, -1]) {
      const gx = x + side * 0.47;
      b.part(new THREE.BoxGeometry(0.04, 0.2, 0.42), METAL, { at: [gx, 0.6, z], name: "intakeFrame" });
      for (let k = 0; k < 4; k++) {
        b.part(new THREE.BoxGeometry(0.05, 0.025, 0.36), VENT, { at: [gx + side * 0.01, 0.53 + k * 0.05, z] });
      }
    }

    // front/back intake scoop with yellow warning chevron
    b.part(new THREE.BoxGeometry(0.4, 0.1, 0.08), METAL, { at: [x, 0.7, z + sz * 0.46], name: "scoop" });
    b.part(new THREE.BoxGeometry(0.2, 0.03, 0.09), YELLOW, { at: [x, 0.76, z + sz * 0.46] });

    // mounting bolts on pod top rim
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL, {
        at: [x + Math.cos(a) * 0.42, 0.86, z + Math.sin(a) * 0.42],
      });
    }
    void sx;
  }
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addHeadlights(b: Builder) {
  const WHITE = "#f4fdff";
  const DARKRED = "#4a0a3a";

  const lensTex = svg(
    `<svg viewBox="0 0 64 32"><polygon points="2,30 8,4 62,2 58,28" fill="#ffffff"/>
     <polygon points="10,24 14,9 54,8 52,22" fill="#dff8ff"/>
     <path d="M18 12 L50 11 M17 18 L48 17" stroke="#9fdcf0" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const ventTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b0c10"/>
     ${[3, 9, 15, 21, 27].map((y) => `<rect x="3" y="${y}" width="58" height="3" fill="#3a3d48"/>`).join("")}
     <rect x="1" y="1" width="62" height="30" fill="none" stroke="#6b7280" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // Headlights (front face is at z ~ 2.45)
  for (const s of [1, -1]) {
    const x = s * 0.7;
    const z = 2.5;
    // housing
    b.part(new THREE.BoxGeometry(0.46, 0.2, 0.08), METAL, { at: [x, 0.82, z + 0.0], name: "s24headHousing" });
    // angular lens (textured plane)
    glow(
      b.part(new THREE.PlaneGeometry(0.38, 0.15), "#ffffff", {
        at: [x, 0.82, z + 0.045],
        dir: [0, 0, 1],
        axis: "z",
        texture: lensTex,
        name: "s24headLens",
      }),
      1.6,
    );
    // inner glowing core
    glow(b.part(new THREE.BoxGeometry(0.14, 0.07, 0.03), WHITE, { at: [x - s * 0.07, 0.82, z + 0.05] }), 2);
    // cyan eyebrow strip, angled
    glow(
      b.part(new THREE.BoxGeometry(0.42, 0.025, 0.04), CYAN, {
        at: [x, 0.94, z + 0.02],
        rotation: [0, 0, s * -8],
        name: "s24headBrow",
      }),
      1.8,
    );
    // bezel bars
    b.part(new THREE.BoxGeometry(0.48, 0.02, 0.05), HULL_DARK, { at: [x, 0.71, z + 0.02] });
    b.part(new THREE.BoxGeometry(0.03, 0.22, 0.05), HULL_DARK, { at: [x + s * 0.24, 0.82, z + 0.02] });
    // bolts
    for (const dx of [-0.2, 0.2])
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), STEEL, {
        at: [x + dx, 0.73, z + 0.05],
        dir: [0, 0, 1],
      });
  }
  // centre grille cyan accent between lights
  glow(b.part(new THREE.BoxGeometry(0.5, 0.02, 0.03), CYAN, { at: [0, 0.82, 2.52] }), 1.5);

  // Tail lights (rear face z ~ -2.45)
  const zr = -2.5;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.6, 0.14, 0.06), METAL, { at: [s * 0.62, 0.9, zr], name: "s24tailHousing" });
    glow(b.part(new THREE.BoxGeometry(0.54, 0.07, 0.04), MAGENTA, { at: [s * 0.62, 0.9, zr - 0.04], name: "s24tailStrip" }), 1.8);
    glow(b.part(new THREE.BoxGeometry(0.2, 0.04, 0.04), "#ff8ae8", { at: [s * 0.78, 0.83, zr - 0.04] }), 2);
    // brackets
    b.part(new THREE.BoxGeometry(0.04, 0.2, 0.05), HULL_DARK, { at: [s * 0.9, 0.88, zr] });
  }
  // brake bar linking them
  glow(b.part(new THREE.BoxGeometry(0.5, 0.03, 0.03), MAGENTA, { at: [0, 0.98, zr - 0.03] }), 1.4);

  // exhaust vent grid replacing hitch
  b.part(new THREE.BoxGeometry(0.46, 0.24, 0.06), METAL, { at: [0, 0.7, zr], name: "s24vent" });
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
    at: [0, 0.7, zr - 0.035],
    dir: [0, 0, -1],
    axis: "z",
    texture: ventTex,
    name: "s24ventGrid",
  });
  glow(b.part(new THREE.BoxGeometry(0.36, 0.02, 0.02), DARKRED, { at: [0, 0.6, zr - 0.04] }), 1.2);
  // twin small exhaust tips
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.045, 0.055, 0.1, 8), STEEL, {
      at: [s * 0.3, 0.62, zr - 0.07],
      dir: [0, 0, -1],
    });
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function addAntennaArray(b: Builder) {
  const R = rng(25);
  const BX = -0.6;
  const BY = 1.63;
  const BZ = -0.2;
  const BRASS = "#8a6a3a";
  const DARKP = "#14151b";

  // mounting base plate with bolts
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.4), METAL, { at: [BX, BY + 0.02, BZ], name: "antBase" });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), STEEL, {
        at: [BX + sx * 0.16, BY + 0.05, BZ + sz * 0.16],
      });
  // hex collar block
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 6), HULL_DARK, { at: [BX, BY + 0.08, BZ], name: "antCollar" });

  // whip antennas: tilted rods with sleeve bands and tips
  const whips: { x: number; z: number; h: number; tx: number; tz: number; tip: string }[] = [
    { x: -0.12, z: -0.12, h: 0.78, tx: -6, tz: 5, tip: MAGENTA },
    { x: 0.12, z: -0.1, h: 0.6, tx: 4, tz: -8, tip: CYAN },
    { x: 0.1, z: 0.12, h: 0.45, tx: 8, tz: 6, tip: MAGENTA },
    { x: -0.13, z: 0.1, h: 0.34, tx: -5, tz: -6, tip: YELLOW },
  ];
  for (const w of whips) {
    const base = new THREE.Vector3(BX + w.x, BY + 0.1, BZ + w.z);
    const rot: [number, number, number] = [w.tx, 0, w.tz];
    const e = new THREE.Euler(w.tx * Math.PI / 180, 0, w.tz * Math.PI / 180);
    const dir = new THREE.Vector3(0, 1, 0).applyEuler(e);
    const mid = base.clone().addScaledVector(dir, w.h / 2);
    b.part(new THREE.CylinderGeometry(0.006, 0.014, w.h, 6), STEEL, { at: mid.toArray() as [number, number, number], rotation: rot });
    const sleeve = base.clone().addScaledVector(dir, 0.07);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), METAL, { at: sleeve.toArray() as [number, number, number], rotation: rot });
    const band = base.clone().addScaledVector(dir, w.h * 0.55);
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 6), w.tip, { at: band.toArray() as [number, number, number], rotation: rot });
    const tip = base.clone().addScaledVector(dir, w.h + 0.015);
    glow(
      b.part(new THREE.SphereGeometry(0.03, 6, 4), w.tip, { at: tip.toArray() as [number, number, number], name: "antTip" }),
      1.8,
    );
  }

  // radar dish on a small mast, facing back-right
  const mx = BX - 0.02;
  const mz = BZ - 0.02;
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 6), HULL_DARK, { at: [mx, BY + 0.2, mz], name: "radarMast" });
  b.part(new THREE.BoxGeometry(0.12, 0.08, 0.12), METAL, { at: [mx, BY + 0.37, mz] });
  const dishY = BY + 0.45;
  const dishDir: [number, number, number] = [-0.35, 0.45, -0.82];
  // dish bowl (open hemisphere), axis +Z of the part aimed along dishDir
  b.part(
    new THREE.SphereGeometry(0.17, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.4),
    BRASS,
    { at: [mx, dishY, mz], dir: dishDir, axis: "y", flat: true, name: "radarDish" },
  );
  const d = new THREE.Vector3(...dishDir).normalize();
  const feedBase = new THREE.Vector3(mx, dishY, mz).addScaledVector(d, 0.04);
  const feedTip = new THREE.Vector3(mx, dishY, mz).addScaledVector(d, 0.2);
  b.rod(feedBase, feedTip, 0.008, STEEL);
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), CYAN, { at: feedTip.toArray() as [number, number, number] }), 1.6);
  // dish rim ring
  b.part(new THREE.TorusGeometry(0.155, 0.01, 4, 12), STEEL, {
    at: new THREE.Vector3(mx, dishY, mz).addScaledVector(d, 0.065).toArray() as [number, number, number],
    dir: dishDir,
    axis: "z",
  });

  // small status box with LED row and cable
  b.part(new THREE.BoxGeometry(0.14, 0.07, 0.1), DARKP, { at: [BX + 0.06, BY + 0.075, BZ + 0.16], name: "antBox" });
  for (let i = 0; i < 3; i++)
    glow(
      b.part(new THREE.BoxGeometry(0.02, 0.012, 0.012), i === 1 ? MAGENTA : CYAN, {
        at: [BX + 0.02 + i * 0.04, BY + 0.112, BZ + 0.215],
      }),
      1.6,
    );
  b.sweep(
    [
      [BX + 0.1, BY + 0.07, BZ + 0.16],
      [BX + 0.25, BY + 0.06, BZ + 0.22],
      [BX + 0.3, BY + 0.05, BZ + 0.35],
    ],
    0.008,
    { color: METAL },
  );
  // guy wires stays
  for (const [x, z] of [
    [0.18, 0.1],
    [-0.18, -0.12],
  ] as [number, number][]) {
    b.rod([BX, BY + 0.5, BZ], [BX + x, BY + 0.05, BZ + z], 0.003, STEEL);
  }
  void R;
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, rng, svg } from "agentic-3js-builder";

export function addSideArmour(b: Builder) {
  const R = rng(26);
  const PLATE = "#3b4a3c";
  const VENT = "#0a0b10";
  const BOLT = "#8a93a3";

  // Neon trim texture (cyan chevrons on dark strip)
  const trimTex = svg(
    `<svg viewBox="0 0 128 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="16" fill="#0a1a22"/>
      <rect y="6" width="128" height="4" fill="#19f0ff"/>
      <path d="M8 2 L16 8 L8 14 M40 2 L48 8 L40 14 M72 2 L80 8 L72 14 M104 2 L112 8 L104 14" stroke="#7ffaff" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const ventTex = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="#0a0b10" stroke="#6b7280" stroke-width="3"/>
      ${[5, 10, 15, 20, 25].map((y) => `<rect x="5" y="${y}" width="54" height="2.5" fill="#2a2e3a"/>`).join("")}
      <rect x="5" y="27" width="54" height="1.5" fill="#ff2bd6"/>
    </svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    const face = s * 1.0;
    const out = [s, 0, 0] as [number, number, number];
    const plane = (w: number, h: number, x: number, y: number, z: number, color: string, tex?: THREE.Texture) =>
      b.part(new THREE.PlaneGeometry(w, h), color, { at: [x, y, z], dir: out, axis: "z", texture: tex });

    // Armour plates along the lower side
    const zs = [-1.75, -0.7, 0.75, 1.75];
    const lens = [0.85, 0.95, 0.9, 0.7];
    zs.forEach((z, i) => {
      // skip mid-gap where vent goes: keep plates in pairs
      b.part(new THREE.BoxGeometry(0.08, 0.34, lens[i]), PLATE, {
        at: [face + s * 0.04, 0.72, z],
        rotation: [0, 0, 0],
      });
      // chamfer wedge on top
      b.part(new THREE.BoxGeometry(0.06, 0.06, lens[i] - 0.08), METAL, { at: [face + s * 0.055, 0.92, z] });
      // bolts at corners
      for (const dz of [-1, 1])
        for (const dy of [-1, 1])
          b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), BOLT, {
            at: [face + s * 0.09, 0.72 + dy * 0.12, z + dz * (lens[i] / 2 - 0.08)],
            dir: out,
          });
    });

    // Exhaust vents between plates (textured)
    plane(0.5, 0.24, face + s * 0.012, 0.72, 0.0, "#ffffff", ventTex);
    b.part(new THREE.BoxGeometry(0.03, 0.3, 0.58), STEEL, { at: [face + s * 0.012, 0.72, 0.0] });
    plane(0.5, 0.24, face + s * 0.032, 0.72, 0.0, "#ffffff", ventTex);
    // side exhaust pipe
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.4, 8), STEEL, {
      at: [face + s * 0.08, 0.55, -1.2],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8), VENT, {
      at: [face + s * 0.08, 0.55, -1.0],
      dir: [0, 0, 1],
    });

    // Cyan trim lines (glowing strips)
    for (const y of [0.52, 0.93]) {
      const m = b.part(new THREE.BoxGeometry(0.02, 0.025, 4.5), CYAN, { at: [face + s * 0.015, y, 0] });
      m.mesh.material = (m.mesh.material as THREE.MeshStandardMaterial).clone();
      const mat = m.mesh.material as THREE.MeshStandardMaterial;
      mat.emissive.set(CYAN);
      mat.emissiveIntensity = 1.5;
    }
    // Textured chevron strip
    const strip = plane(1.1, 0.07, face + s * 0.095, 0.72, 1.3, "#ffffff", trimTex);
    void strip;

    // Side mirror
    const mx = s * 1.0;
    // arm
    b.part(new THREE.BoxGeometry(0.22, 0.05, 0.06), METAL, { at: [mx + s * 0.1, 1.15, 0.85] });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 0.05), METAL, { at: [mx + s * 0.04, 1.2, 0.85] });
    // mirror housing (angular)
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.28), HULL_DARK, {
      at: [mx + s * 0.24, 1.2, 0.8],
      rotation: [0, s * -12, 0],
    });
    b.part(new THREE.BoxGeometry(0.02, 0.17, 0.22), GLASS, {
      at: [mx + s * 0.195, 1.2, 0.83],
      rotation: [0, s * -12, 0],
    });
    // wedge cap
    b.part(new THREE.ConeGeometry(0.08, 0.12, 4), HULL_DARK, {
      at: [mx + s * 0.24, 1.33, 0.8],
      rotation: [0, 45, 0],
    });
    // indicator
    const ind = b.part(new THREE.BoxGeometry(0.03, 0.04, 0.1), CYAN, { at: [mx + s * 0.29, 1.12, 0.9] });
    const im = (ind.mesh.material as THREE.MeshStandardMaterial).clone();
    im.emissive.set(CYAN);
    im.emissiveIntensity = 2;
    ind.mesh.material = im;

    // Door handles
    for (const z of [0.55, -0.25]) {
      b.part(new THREE.BoxGeometry(0.04, 0.045, 0.2), STEEL, { at: [face + s * 0.03, 1.2, z + R() * 0.02] });
      b.part(new THREE.BoxGeometry(0.05, 0.06, 0.06), METAL, { at: [face + s * 0.03, 1.2, z + 0.12] });
    }
    // door seam
    b.part(new THREE.BoxGeometry(0.012, 0.5, 0.012), METAL, { at: [face - s * 0.02, 1.35, 0.25] });
    b.part(new THREE.BoxGeometry(0.012, 0.5, 0.012), METAL, { at: [face - s * 0.02, 1.35, -0.4] });
  }
}
```
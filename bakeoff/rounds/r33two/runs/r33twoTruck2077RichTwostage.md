<!-- call: stage1 -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const meta = {
  name: "Vanguard-77 Armored Truck",
  description: "Low-poly cyberpunk militarized 6x6 truck from 2077: armored cab, cargo bed with turret ring, neon accents.",
};

export const REQUESTS = [
  { id: "roofLightBar", kind: "add", part: "cab", what: "Neon light bar across the cab roof: slim housing, six lamps alternating CYAN and MAGENTA, brackets.", at: [0, 2.55, 1.6], normal: [0, 1, 0], bone: null, room: [1.8, 0.25, 0.35] },
  { id: "frontGrille", kind: "add", part: "grille", what: "Armoured grille: horizontal slats in STEEL_DARK, a glowing CYAN strip, a hex emblem in the centre.", at: [0, 1.05, 3.52], normal: [0, 0, 1], bone: null, room: [1.5, 0.7, 0.2] },
  { id: "turret", kind: "add", part: "turretRing", what: "Remote weapon station on the ring: rotating box mount, twin gun barrels with muzzle brakes, ammo box, sensor eye in RED.", at: [0, 2.3, -1.4], normal: [0, 1, 0], bone: null, room: [1.2, 0.9, 1.6] },
  { id: "antennaArray", kind: "add", part: "cab", what: "Antenna cluster behind the cab: whip antennas, a dish, a blinking MAGENTA beacon.", at: [0.8, 2.6, 0.3], normal: [0, 1, 0], bone: null, room: [0.5, 1.0, 0.5] },
  { id: "sideArmor", kind: "add", part: "hullSide", what: "Bolted armour plates and ERA tiles on the left cargo wall with rivets and a CYAN stripe.", at: [1.25, 1.7, -1.0], normal: [1, 0, 0], bone: null, room: [0.2, 1.0, 3.0] },
  { id: "exhausts", kind: "add", part: "cab", what: "Pair of vertical exhaust stacks behind the cab with heat shields and glowing orange tips.", at: [-1.1, 2.0, 0.0], normal: [0, 1, 0], bone: null, room: [0.4, 1.2, 0.4] },
  { id: "rearModule", kind: "add", part: "bed", what: "Rear: tail light strip in RED, cable bundles, tow hitch, rear hatch handle and hazard emblem.", at: [0, 1.5, -3.3], normal: [0, 0, -1], bone: null, room: [2.0, 1.0, 0.3] },
  { id: "windshieldHud", kind: "add", part: "windshield", what: "Tinted windshield frame with wipers, a CYAN HUD glow strip on the dash edge and sensor pods.", at: [0, 2.0, 2.2], normal: [0, 0.4, 1], bone: null, room: [1.8, 0.8, 0.3] },
  { id: "hullCamo", kind: "texture", part: "hullSide", what: "Urban digital camo in HULL and HULL_DARK on both hull sides, with a faded unit number near the rear." },
  { id: "hoodDecal", kind: "texture", part: "hood", what: "Hazard chevrons in YELLOW and BLACK across the front of the hood and a small MAGENTA kanji emblem." },
  { id: "bedGraffiti", kind: "texture", part: "bed", what: "Worn corporate logos and neon graffiti on the bed top and tailgate." },
];

export const STAGE2: ((b: Builder) => void)[] = [];

export const HULL = "#4a5a52";
export const HULL_DARK = "#2e3833";
export const STEEL_DARK = "#20242b";
export const STEEL = "#5b6470";
export const GLASS = "#10222e";
export const CYAN = "#19e6ff";
export const MAGENTA = "#ff2bd6";
export const RED = "#ff3030";
export const YELLOW = "#f2c418";
export const TIRE = "#101114";
export const RIM = "#8a909a";
export const ORANGE = "#ff8a1c";

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  const box = (w: number, h: number, d: number, c: string, at: number[], name?: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as [number, number, number], name, rotation: rot as [number, number, number] | undefined });

  // chassis
  box(2.2, 0.35, 7, STEEL_DARK, [0, 0.8, 0], "chassis");
  box(2.0, 0.15, 6.6, HULL_DARK, [0, 0.55, 0], "underguard");

  // wheels: three axles
  for (const z of [2.3, -0.4, -2.4]) {
    for (const s of [1, -1]) {
      const x = s * 1.2;
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 14), TIRE, { at: [x, 0.62, z], dir: [1, 0, 0], name: "tire" });
      b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.58, 8), RIM, { at: [x, 0.62, z], dir: [1, 0, 0], name: "rim" });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.62, 6), STEEL_DARK, { at: [x, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 12), CYAN, { at: [x + s * 0.3, 0.62, z], dir: [1, 0, 0], axis: "z" });
      // fender
      box(0.7, 0.12, 1.5, HULL_DARK, [s * 1.2, 1.3, z], "fender");
    }
  }
  for (const z of [2.3, -0.4, -2.4]) box(2.6, 0.18, 0.2, STEEL_DARK, [0, 0.62, z]);

  // cab
  box(2.3, 1.2, 2.2, HULL, [0, 1.65, 1.9], "cab");
  box(2.1, 0.7, 1.5, HULL, [0, 2.45, 1.6], "cab");
  box(2.0, 0.55, 0.05, GLASS, [0, 2.4, 2.38], "windshield", [-18, 0, 0]);
  for (const s of [1, -1]) {
    box(0.05, 0.5, 1.0, GLASS, [s * 1.07, 2.4, 1.6], "sideWindow");
    box(0.06, 0.9, 1.4, HULL_DARK, [s * 1.17, 1.6, 1.9], "door");
    box(0.12, 0.3, 0.1, STEEL, [s * 1.2, 1.9, 2.6]);
  }
  // hood
  box(2.2, 0.8, 1.5, HULL, [0, 1.35, 3.0], "hood");
  box(2.25, 0.1, 1.2, HULL_DARK, [0, 1.8, 3.0]);
  box(1.8, 0.6, 0.1, STEEL_DARK, [0, 1.1, 3.52], "grille");
  box(2.4, 0.3, 0.3, STEEL, [0, 0.7, 3.6], "bumper");
  for (const s of [1, -1]) {
    box(0.35, 0.15, 0.08, CYAN, [s * 0.8, 1.55, 3.76]);
    box(0.4, 0.2, 0.1, STEEL_DARK, [s * 0.8, 1.55, 3.72]);
  }
  // cab roof armor
  box(2.2, 0.08, 1.7, STEEL_DARK, [0, 2.84, 1.6]);

  // hull / cargo bed
  box(2.5, 1.5, 4.8, HULL, [0, 1.9, -1.4], "bed");
  for (const s of [1, -1]) {
    box(0.1, 1.2, 4.5, HULL, [s * 1.27, 1.9, -1.4], "hullSide");
    for (let i = 0; i < 4; i++) box(0.14, 1.3, 0.1, HULL_DARK, [s * 1.3, 1.9, -3.2 + i * 1.2]);
  }
  box(2.6, 0.12, 4.9, HULL_DARK, [0, 2.69, -1.4], "bedTop");
  box(2.4, 1.3, 0.12, HULL_DARK, [0, 1.9, -3.85], "tailgate");

  // turret ring
  b.part(new THREE.CylinderGeometry(0.8, 0.9, 0.2, 12), STEEL_DARK, { at: [0, 2.85, -1.4], name: "turretRing" });
  b.part(new THREE.TorusGeometry(0.85, 0.04, 4, 16), CYAN, { at: [0, 2.96, -1.4], dir: [0, 1, 0], axis: "z" });

  // cab-bed gap pipes
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), STEEL, { at: [s * 1.1, 2.4, 0.5] });

  for (const add of STAGE2) add(b);
  return b.root;
}
```

<!-- call: texture -->

hullCamo: a digital-camo paint (blocky quantized cells in HULL / HULL_DARK / mid tones) on the `hullSide` boxes, plus a faded unit number "77-A" drawn as a textured decal near the rear of each side.
hoodDecal: a yellow/black hazard chevron texture on the front of the hood top, plus a small magenta kanji emblem.
bedGraffiti: a worn corporate-logo and neon-graffiti texture on the bed top and tailgate, with a mottled weathered paint on the bed body.

## Edits

<<<<<<< SEARCH
export default function build() {
  const b = createBuilder({ name: "truck2077" });
=======
import { paint, mottle, noise, svg } from "agentic-3js-builder";

const CAMO = paint((p, _n) => {
  const q = new THREE.Vector3(Math.floor(p.x / 0.12), Math.floor(p.y / 0.12), Math.floor(p.z / 0.12)).multiplyScalar(0.12);
  const a = noise(q, 0.5, 3);
  const c = noise(q, 0.25, 8);
  return a > 0.58 ? "#2e3833" : c > 0.62 ? "#6a7a70" : a < 0.38 ? "#3a4840" : "#4a5a52";
});
const BED_PAINT = mottle("#4a5a52", "#3a463f", { size: 0.35, seed: 5 });
const HOOD_PAINT = mottle("#4a5a52", "#424f48", { size: 0.3, seed: 2 });

const UNIT = svg(
  `<svg viewBox="0 0 128 48"><text x="64" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#cfd6cc" fill-opacity="0.55">77-A</text><path d="M4 44H124" stroke="#cfd6cc" stroke-opacity="0.35" stroke-width="3"/></svg>`,
  { size: 256 },
);
const CHEVRON = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#101114"/>${[0, 1, 2, 3, 4, 5]
    .map((i) => `<path d="M${i * 24 - 20} 0H${i * 24 - 4}L${i * 24 + 20} 32L${i * 24 - 4} 64H${i * 24 - 20}L${i * 24 + 4} 32Z" fill="#f2c418"/>`)
    .join("")}<rect width="128" height="64" fill="none" stroke="#000" stroke-width="2"/></svg>`,
  { size: 256 },
);
const KANJI = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#14081a" stroke="#ff2bd6" stroke-width="3"/><text x="32" y="46" text-anchor="middle" font-size="40" font-family="serif" font-weight="bold" fill="#ff2bd6">戦</text></svg>`,
  { size: 128 },
);
const GRAFFITI = svg(
  `<svg viewBox="0 0 256 128"><rect width="256" height="128" fill="#000" fill-opacity="0"/>
  <rect x="8" y="10" width="86" height="40" rx="6" fill="#14181c" fill-opacity="0.8" stroke="#19e6ff" stroke-width="3"/>
  <text x="51" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#19e6ff">NEXA</text>
  <path d="M110 20L140 20L125 48Z" fill="#f2c418" fill-opacity="0.8"/>
  <text x="150" y="50" font-family="cursive" font-style="italic" font-size="40" fill="#ff2bd6" fill-opacity="0.85">rEbEl</text>
  <path d="M20 90Q60 70 100 95T190 85" stroke="#19e6ff" stroke-width="5" fill="none" stroke-opacity="0.7" stroke-linecap="round"/>
  <circle cx="215" cy="95" r="20" fill="none" stroke="#ff3030" stroke-width="4" stroke-opacity="0.8"/>
  <path d="M203 83L227 107M227 83L203 107" stroke="#ff3030" stroke-width="4" stroke-opacity="0.8"/>
  <text x="20" y="122" font-family="monospace" font-size="16" fill="#cfd6cc" fill-opacity="0.5">ARASAKA-LOG // 2077</text></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "truck2077" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(2.2, 0.8, 1.5, HULL, [0, 1.35, 3.0], "hood");
  box(2.25, 0.1, 1.2, HULL_DARK, [0, 1.8, 3.0]);
=======
  b.part(new THREE.BoxGeometry(2.2, 0.8, 1.5), HOOD_PAINT, { at: [0, 1.35, 3.0], name: "hood" });
  box(2.25, 0.1, 1.2, HULL_DARK, [0, 1.8, 3.0]);
  b.part(new THREE.PlaneGeometry(2.0, 0.5), "#ffffff", { at: [0, 1.866, 3.35], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: CHEVRON, name: "hoodChevrons" });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { at: [0.7, 1.867, 2.7], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: KANJI, name: "hoodKanji" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(2.5, 1.5, 4.8, HULL, [0, 1.9, -1.4], "bed");
  for (const s of [1, -1]) {
    box(0.1, 1.2, 4.5, HULL, [s * 1.27, 1.9, -1.4], "hullSide");
=======
  b.part(new THREE.BoxGeometry(2.5, 1.5, 4.8), BED_PAINT, { at: [0, 1.9, -1.4], name: "bed" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 1.2, 4.5), CAMO, { at: [s * 1.27, 1.9, -1.4], name: "hullSide" });
    b.part(new THREE.PlaneGeometry(1.1, 0.41), "#ffffff", { at: [s * 1.331, 2.1, -2.8], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: UNIT, name: "unitNumber" });
>>>>>>> REPLACE

<<<<<<< SEARCH
  box(2.6, 0.12, 4.9, HULL_DARK, [0, 2.69, -1.4], "bedTop");
  box(2.4, 1.3, 0.12, HULL_DARK, [0, 1.9, -3.85], "tailgate");
=======
  box(2.6, 0.12, 4.9, HULL_DARK, [0, 2.69, -1.4], "bedTop");
  box(2.4, 1.3, 0.12, HULL_DARK, [0, 1.9, -3.85], "tailgate");
  b.part(new THREE.PlaneGeometry(2.2, 1.1), "#ffffff", { at: [0, 1.9, -3.915], dir: [0, 0, -1], axis: "z", up: [0, 1, 0], texture: GRAFFITI, name: "tailgateArt" });
  b.part(new THREE.PlaneGeometry(1.6, 0.8), "#ffffff", { at: [0, 2.752, -2.2], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: GRAFFITI, name: "bedTopArt" });
>>>>>>> REPLACE

<!-- call: add1 -->

```ts
import * as THREE from "three";
import { type Builder, glow } from "agentic-3js-builder";

export function addRoofLightBar(b: Builder) {
  const Y = 2.88; // top of cab roof armor (2.84 + 0.04)
  const Z = 1.6;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });

  // slim housing: base rail, back shell and top lip
  box(1.8, 0.06, 0.34, STEEL_DARK, 0, Y + 0.12, Z, "lbBase");
  box(1.8, 0.14, 0.06, STEEL_DARK, 0, Y + 0.2, Z - 0.15, "lbBack");
  box(1.8, 0.03, 0.3, STEEL, 0, Y + 0.31, Z - 0.01, "lbTop");

  // end caps
  for (const s of [1, -1]) {
    box(0.06, 0.22, 0.36, STEEL, s * 0.9, Y + 0.2, Z, "lbCap");
    box(0.03, 0.1, 0.1, ORANGE, s * 0.94, Y + 0.2, Z + 0.1, "lbMarker");
  }

  // six lamps alternating cyan and magenta, with lens frames and dividers
  for (let i = 0; i < 6; i++) {
    const x = -0.68 + i * 0.272;
    const c = i % 2 === 0 ? CYAN : MAGENTA;
    glow(box(0.22, 0.12, 0.05, c, x, Y + 0.2, Z + 0.15, "lbLamp"), 1.6);
    box(0.26, 0.16, 0.02, STEEL_DARK, x, Y + 0.2, Z + 0.135, "lbFrame");
    // small heat fins above each lamp
    for (const dx of [-0.06, 0, 0.06]) box(0.02, 0.04, 0.2, STEEL, x + dx, Y + 0.34, Z, "lbFin");
    if (i < 5) box(0.025, 0.16, 0.2, STEEL_DARK, x + 0.136, Y + 0.2, Z + 0.05, "lbDiv");
  }

  // brackets with bolts
  for (const x of [-0.72, -0.24, 0.24, 0.72]) {
    box(0.12, 0.1, 0.22, STEEL, x, Y + 0.05, Z, "lbBracket");
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL_DARK, { at: [x, Y + 0.11, Z + 0.08], name: "lbBolt" });
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), STEEL_DARK, { at: [x, Y + 0.11, Z - 0.08], name: "lbBolt" });
  }

  // glow strip along lens bottom and cable run to the roof
  glow(box(1.6, 0.015, 0.02, CYAN, 0, Y + 0.115, Z + 0.17, "lbUnderGlow"), 1.2);
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), STEEL_DARK, {
    at: [0.9, Y + 0.05, Z - 0.2],
    dir: [0, 0, -1],
    name: "lbCable",
  });
}
```

<!-- call: add2 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addFrontGrille(b: Builder) {
  const Z = 3.54;
  const AMBER = "#ffb02e";
  const BOLT = "#8a909a";

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });

  // recessed dark backing and frame
  box(1.6, 0.7, 0.06, "#0a0c10", 0, 1.05, Z, "grilleBack");
  box(1.7, 0.06, 0.1, STEEL, 0, 1.43, Z + 0.02, "grilleFrameTop");
  box(1.7, 0.06, 0.1, STEEL, 0, 0.67, Z + 0.02, "grilleFrameBot");
  for (const s of [1, -1]) {
    box(0.06, 0.8, 0.1, STEEL, s * 0.82, 1.05, Z + 0.02, "grilleFrameSide");
    // corner bolts
    for (const y of [1.38, 0.72]) {
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), BOLT, {
        at: [s * 0.82, y, Z + 0.09], dir: [0, 0, 1], name: "grilleBolt",
      });
    }
  }

  // horizontal slats, angled slightly
  const ys = [1.34, 1.24, 1.14, 0.96, 0.86, 0.76];
  ys.forEach((y, i) => {
    b.part(new THREE.BoxGeometry(1.5, 0.06, 0.07), i % 2 ? STEEL_DARK : "#2c313a", {
      at: [0, y, Z + 0.06], rotation: [18, 0, 0], name: "slat",
    });
  });

  // glowing cyan strip across the middle
  b.part(new THREE.BoxGeometry(1.46, 0.035, 0.03), CYAN, { at: [0, 1.05, Z + 0.04], name: "grilleGlow" });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.1, 0.05), CYAN, { at: [s * 0.72, 1.05, Z + 0.05], name: "grilleGlowCap" });
    // vertical struts
    for (const x of [0.3, 0.55]) box(0.035, 0.62, 0.05, STEEL, s * x, 1.05, Z + 0.1, "strut");
  }

  // hex emblem: dark plate, steel ring, drawn decal
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), STEEL, {
    at: [0, 1.05, Z + 0.1], dir: [0, 0, 1], name: "emblemRing",
  });
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 6), "#10151c", {
    at: [0, 1.05, Z + 0.11], dir: [0, 0, 1], name: "emblemPlate",
  });
  const tex = svg(
    `<svg viewBox="0 0 64 64">
      <polygon points="32,6 56,19 56,45 32,58 8,45 8,19" fill="none" stroke="#19e6ff" stroke-width="5"/>
      <path d="M32 18 L44 38 L32 32 L20 38 Z" fill="#ff2bd6"/>
      <circle cx="32" cy="46" r="4" fill="#19e6ff"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
    at: [0, 1.05, Z + 0.145], dir: [0, 0, 1], axis: "z", texture: tex, name: "emblemDecal",
  });

  // amber side marker lamps and tow hooks on the bumper
  for (const s of [1, -1]) {
    box(0.12, 0.08, 0.06, AMBER, s * 0.95, 0.9, Z + 0.1, "marker");
    b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), STEEL, {
      at: [s * 0.75, 0.62, Z + 0.15], dir: [0, 0, 1], axis: "z", name: "towHook",
    });
  }
}
```

<!-- call: add3 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addTurret(b: Builder) {
  const GUN = "#2a2f38";
  const WARM = "#ffb347";

  const box = (w: number, h: number, d: number, c: string, at: number[], name: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, {
      at: at as [number, number, number],
      name,
      rotation: rot as [number, number, number] | undefined,
    });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], name: string, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, {
      at: at as [number, number, number],
      name,
      dir: dir as [number, number, number] | undefined,
    });

  // ---------- turret: remote weapon station on ring (ring top about y=2.96)
  const cx = 0, cz = -1.4, by = 3.0;
  cyl(0.55, 0.65, 0.14, 8, STEEL, [cx, by + 0.07, cz], "s23turretBase");
  box(0.9, 0.5, 0.9, HULL_DARK, [cx, by + 0.45, cz], "s23turretBox");
  box(0.95, 0.08, 0.95, STEEL_DARK, [cx, by + 0.72, cz], "s23turretCap");
  for (const s of [1, -1]) {
    box(0.1, 0.4, 0.6, STEEL_DARK, [s * 0.5, by + 0.45, cz + 0.1], "s23cheek");
    box(0.06, 0.2, 0.4, CYAN, [s * 0.56, by + 0.45, cz + 0.1], "s23cheekGlow");
    // bolts
    for (const dz of [-0.3, 0.3])
      cyl(0.03, 0.03, 0.04, 6, STEEL, [s * 0.46, by + 0.62, cz + dz], "s23bolt", [1, 0, 0]);
    // gun barrels
    const gx = s * 0.22;
    box(0.2, 0.2, 0.5, GUN, [gx, by + 0.45, cz + 0.65], "s23receiver");
    cyl(0.055, 0.055, 1.0, 8, GUN, [gx, by + 0.45, cz + 1.3], "s23barrel", [0, 0, 1]);
    cyl(0.09, 0.09, 0.3, 8, STEEL_DARK, [gx, by + 0.45, cz + 0.95], "s23shroud", [0, 0, 1]);
    cyl(0.085, 0.085, 0.18, 8, STEEL_DARK, [gx, by + 0.45, cz + 1.85], "s23brake", [0, 0, 1]);
    for (const dz of [1.8, 1.9])
      box(0.2, 0.03, 0.03, ORANGE, [gx, by + 0.45, cz + dz], "s23ventGlow");
  }
  // ammo box on the side
  box(0.3, 0.3, 0.5, HULL, [0.62, by + 0.3, cz - 0.15], "s23ammo");
  box(0.32, 0.05, 0.4, YELLOW, [0.62, by + 0.47, cz - 0.15], "s23ammoLid");
  // sensor eye
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1a0505" stroke="#ff3030" stroke-width="4"/><circle cx="32" cy="32" r="16" fill="#ff3030"/><circle cx="26" cy="26" r="5" fill="#ffd0d0"/></svg>`,
    { size: 64 },
  );
  cyl(0.14, 0.14, 0.14, 8, STEEL_DARK, [cx, by + 0.78, cz + 0.2], "s23eyeHousing");
  b.part(new THREE.CircleGeometry(0.11, 12), "#ffffff", {
    at: [cx, by + 0.78, cz + 0.28],
    dir: [0, 0, 1],
    axis: "z",
    texture: eyeTex,
    name: "s23eye",
  });
  // top antenna stub
  cyl(0.01, 0.01, 0.4, 4, STEEL, [cx - 0.35, by + 0.95, cz - 0.3], "s23whipT");

  // ---------- antenna cluster behind cab
  const ax = 0.8, ay = 2.88, az = 0.3;
  cyl(0.18, 0.22, 0.12, 8, STEEL_DARK, [ax, ay + 0.06, az], "s23antBase");
  // whips
  const whips: [number, number, number, number][] = [
    [-0.12, -0.08, 1.0, 6],
    [0.12, 0.05, 0.8, -5],
    [0, 0.14, 0.65, 3],
  ];
  whips.forEach(([dx, dz, h], i) => {
    cyl(0.012, 0.02, h, 5, i === 1 ? STEEL : GUN, [ax + dx, ay + 0.1 + h / 2, az + dz], "s23whip");
    b.part(new THREE.SphereGeometry(0.03, 6, 4), i === 0 ? RED : CYAN, {
      at: [ax + dx, ay + 0.1 + h, az + dz],
      name: "s23whipTip",
    });
  });
  // dish
  cyl(0.03, 0.03, 0.3, 6, STEEL, [ax - 0.05, ay + 0.25, az + 0.18], "s23dishMast");
  b.part(new THREE.SphereGeometry(0.2, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2.2), STEEL, {
    at: [ax - 0.05, ay + 0.42, az + 0.22],
    dir: [0.2, 0.6, 0.8],
    rotation: [100, 0, 0],
    name: "s23dish",
  });
  cyl(0.015, 0.015, 0.2, 4, STEEL_DARK, [ax - 0.05, ay + 0.5, az + 0.35], "s23feed", [0, 0.3, 1]);
  // beacon
  cyl(0.07, 0.09, 0.08, 8, STEEL_DARK, [ax + 0.22, ay + 0.1, az - 0.18], "s23beaconBase");
  b.part(new THREE.SphereGeometry(0.1, 8, 6), MAGENTA, { at: [ax + 0.22, ay + 0.22, az - 0.18], name: "s23beacon" });
  b.part(new THREE.TorusGeometry(0.13, 0.012, 4, 10), WARM, {
    at: [ax + 0.22, ay + 0.22, az - 0.18],
    dir: [0, 1, 0],
    axis: "z",
    name: "s23beaconRing",
  });
}
```

<!-- call: add4 -->

```ts
import * as THREE from "three";
import { type Builder, svg, paint, rng, noise, mix } from "agentic-3js-builder";

export function addSideArmor(b: Builder) {
  const r = rng(77);
  const X = 1.34; // wall outer face: hullSide at x=1.27 +0.05 plus ribs to 1.37
  const ERA = "#39443d";
  const BOLT = "#9aa3ad";

  const armorPaint = paint((p, n) => {
    const t = noise(p, 0.25, 4);
    const base = mix(HULL, HULL_DARK, t * 0.6);
    const edge = n.y > 0.5 ? mix(base, "#8a9a90", 0.4) : base;
    return edge;
  });

  const eraTex = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="#2b332f" stroke="#10130f" stroke-width="4"/>
    <path d="M8 8 L56 56 M56 8 L8 56" stroke="#4d5a52" stroke-width="3"/>
    <rect x="22" y="22" width="20" height="20" fill="#3a463f" stroke="#10130f" stroke-width="3"/>
    <rect x="28" y="28" width="8" height="8" fill="${YELLOW}"/></svg>`,
    { size: 128 },
  );

  const zs = [-2.6, -1.4, -0.2];
  // large bolted base plates
  zs.forEach((z, i) => {
    b.part(new THREE.BoxGeometry(0.07, 0.95, 1.05), armorPaint, { at: [X + 0.03, 1.72, z], name: "armorPlate" });
    // ERA tiles in a 2x2 grid on each plate
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 2; col++) {
        const tz = z + (col - 0.5) * 0.46;
        const ty = 1.98 - row * 0.42 - 0.0;
        b.part(new THREE.BoxGeometry(0.06, 0.34, 0.4), ERA, { at: [X + 0.095, ty - 0.02, tz], name: "eraTile" });
        b.part(new THREE.PlaneGeometry(0.34, 0.3), "#ffffff", {
          at: [X + 0.128, ty - 0.02, tz],
          dir: [1, 0, 0],
          axis: "z",
          texture: eraTex,
          name: "eraFace",
        });
      }
    // corner bolts
    for (const dy of [-0.4, 0.4])
      for (const dz of [-0.48, 0.48])
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), BOLT, {
          at: [X + 0.08, 1.72 + dy, z + dz],
          dir: [1, 0, 0],
          name: "bolt",
        });
    // lower skirt plate with slight tilt
    b.part(new THREE.BoxGeometry(0.06, 0.16, 1.0), STEEL_DARK, {
      at: [X + 0.06, 1.18, z],
      rotation: [(r() - 0.5) * 3, 0, 0],
      name: "skirt",
    });
  });

  // cyan stripe running full length, with end caps
  b.part(new THREE.BoxGeometry(0.03, 0.06, 3.7), CYAN, { at: [X + 0.16, 1.48, -1.4], name: "cyanStripe" });
  b.part(new THREE.BoxGeometry(0.04, 0.1, 0.1), STEEL, { at: [X + 0.16, 1.48, -3.28], name: "stripeCap" });
  b.part(new THREE.BoxGeometry(0.04, 0.1, 0.1), STEEL, { at: [X + 0.16, 1.48, 0.48], name: "stripeCap" });

  // top rail
  b.part(new THREE.BoxGeometry(0.1, 0.07, 3.6), STEEL_DARK, { at: [X + 0.06, 2.24, -1.4], name: "topRail" });
  // little rivet row along the rail
  for (let i = 0; i < 12; i++)
    b.part(new THREE.SphereGeometry(0.022, 5, 4), BOLT, { at: [X + 0.12, 2.24, -3.1 + i * 0.3], name: "rivet" });

  // vertical stencil unit marker lamps (small)
  for (const z of [-3.2, 0.3])
    b.part(new THREE.BoxGeometry(0.05, 0.12, 0.2), ORANGE, { at: [X + 0.07, 2.05, z], name: "markerLamp" });
}
```

<!-- call: add5 -->

```ts
import * as THREE from "three";
import { type Builder, paint, noise, mix, smoothstep, rng } from "agentic-3js-builder";

export function addExhausts(b: Builder) {
  const R = rng(77);
  const SOOT = "#15161a";
  const GLOWY = "#ffd27a";
  const BRACE = "#3a3f48";

  // burnt, heat-stained steel paint: darker toward the tips, blued near the top
  const stackPaint = paint((p, n) => {
    const heat = smoothstep(2.2, 3.1, p.y);
    const base = mix("#4a4f5a", "#2a2c33", noise(p, 0.12, 4));
    const stained = mix(base, "#5a4a6a", heat * 0.5 * noise(p, 0.08, 9));
    return mix(stained, "#1a1a1e", 0.3 * smoothstep(0.3, -0.8, n.y));
  });
  const shieldPaint = paint((p, n) => {
    const s = Math.floor(p.y / 0.07) % 2 ? "#6a7280" : "#3c424c";
    return mix(s, "#8a909a", 0.25 * smoothstep(0.4, 1, n.y) + 0.1 * noise(p, 0.1, 2));
  });

  for (const s of [1, -1]) {
    const x = s * 1.1;
    const z = 0.0;
    const y0 = 2.0;
    // base mounting plate and collar
    b.part(new THREE.BoxGeometry(0.4, 0.06, 0.4), STEEL_DARK, { at: [x, y0 + 0.03, z], name: "exhaustPlate" });
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.14, 8), STEEL, { at: [x, y0 + 0.13, z], name: "exhaustCollar" });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), YELLOW, {
        at: [x + Math.cos(a) * 0.17, y0 + 0.08, z + Math.sin(a) * 0.17],
        name: "exhaustBolt",
      });
    }
    // main pipe
    b.part(new THREE.CylinderGeometry(0.12, 0.13, 1.0, 8), stackPaint, { at: [x, y0 + 0.7, z], name: "exhaustPipe" });
    // clamp bands
    for (const h of [0.35, 0.8, 1.15]) {
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), STEEL, { at: [x, y0 + h, z], name: "exhaustBand" });
    }
    // heat shield: half-shell facing the cab side, ribbed
    const sx = x - s * 0.0;
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.7, 8, 1, true, s > 0 ? 0 : Math.PI, Math.PI), shieldPaint, {
      at: [sx, y0 + 0.62, z], name: "heatShield", flat: true,
    });
    // shield ribs
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.BoxGeometry(0.4, 0.025, 0.025), BRACE, { at: [sx, y0 + 0.3 + i * 0.13, z - 0.19 * (i % 2 ? 0 : 0)], name: "shieldRib" });
    }
    // top cap with perforated rain flap
    b.part(new THREE.CylinderGeometry(0.15, 0.12, 0.1, 8), SOOT, { at: [x, y0 + 1.25, z], name: "exhaustTop" });
    // glowing orange tip
    const tip = b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), ORANGE, { at: [x, y0 + 1.31, z], name: "exhaustGlow" });
    tip.mesh.material = (tip.mesh.material as THREE.MeshStandardMaterial).clone();
    const m = tip.mesh.material as THREE.MeshStandardMaterial;
    m.emissive.set(ORANGE);
    m.emissiveIntensity = 1.6;
    const core = b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.045, 6), GLOWY, { at: [x, y0 + 1.325, z], name: "exhaustCore" });
    core.mesh.material = (core.mesh.material as THREE.MeshStandardMaterial).clone();
    const m2 = core.mesh.material as THREE.MeshStandardMaterial;
    m2.emissive.set(GLOWY);
    m2.emissiveIntensity = 2;
    // soot streaks around the top
    for (let i = 0; i < 5; i++) {
      const a = R() * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.03, 0.12 + R() * 0.1, 0.01), SOOT, {
        at: [x + Math.cos(a) * 0.125, y0 + 1.1, z + Math.sin(a) * 0.125],
        dir: [Math.cos(a), 0, Math.sin(a)], axis: "z", name: "soot",
      });
    }
    // braces to the cab-bed wall
    const bx = x - s * 0.35;
    b.part(new THREE.BoxGeometry(0.5, 0.05, 0.05), BRACE, { at: [bx, y0 + 0.9, z], rotation: [0, 0, s * 14], name: "exhaustBrace" });
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.12), STEEL_DARK, { at: [x - s * 0.55, y0 + 0.82, z], name: "braceFoot" });
    // small warning stripe on pipe
    b.part(new THREE.CylinderGeometry(0.133, 0.133, 0.06, 8), YELLOW, { at: [x, y0 + 0.55, z], name: "warnBand" });
    // cyan status ring at the collar
    const ring = b.part(new THREE.TorusGeometry(0.19, 0.012, 4, 10), CYAN, { at: [x, y0 + 0.2, z], dir: [0, 1, 0], axis: "z", name: "statusRing" });
    ring.mesh.material = (ring.mesh.material as THREE.MeshStandardMaterial).clone();
    const m3 = ring.mesh.material as THREE.MeshStandardMaterial;
    m3.emissive.set(CYAN);
    m3.emissiveIntensity = 1.2;
  }
}
```

<!-- call: add6 -->

```ts
import * as THREE from "three";
import { type Builder, svg } from "agentic-3js-builder";

export function addRearModule(b: Builder) {
  const CABLE = "#14161a";
  const BRASS = "#b8862e";
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, {
      at: at as [number, number, number],
      rotation: rot as [number, number, number] | undefined,
      name,
    });
  const cyl = (r: number, h: number, c: string, at: number[], dir: number[], seg = 8, name?: string) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, {
      at: at as [number, number, number],
      dir: dir as [number, number, number],
      name,
    });

  // ---------- REAR MODULE (tailgate face at z ~ -3.91) ----------
  const zr = -3.93;
  // tail light strip, with housing and bright segments
  box(2.1, 0.2, 0.08, STEEL_DARK, [0, 2.45, zr], undefined, "s26tailHousing");
  for (let i = 0; i < 9; i++) box(0.2, 0.12, 0.05, RED, [-0.9 + i * 0.225, 2.45, zr - 0.05], undefined, "s26tail");
  for (const s of [1, -1]) {
    box(0.22, 0.5, 0.08, STEEL_DARK, [s * 1.1, 1.9, zr]);
    box(0.14, 0.38, 0.05, RED, [s * 1.1, 1.9, zr - 0.05]);
    box(0.14, 0.1, 0.05, ORANGE, [s * 1.1, 1.55, zr - 0.05]);
  }
  // rear hatch frame
  box(1.5, 0.06, 0.06, STEEL, [0, 2.2, zr - 0.02]);
  box(1.5, 0.06, 0.06, STEEL, [0, 1.15, zr - 0.02]);
  box(0.06, 1.1, 0.06, STEEL, [0.75, 1.68, zr - 0.02]);
  box(0.06, 1.1, 0.06, STEEL, [-0.75, 1.68, zr - 0.02]);
  // handle
  box(0.5, 0.07, 0.07, STEEL, [0, 1.75, zr - 0.12]);
  for (const s of [1, -1]) box(0.07, 0.07, 0.12, STEEL, [s * 0.22, 1.75, zr - 0.06]);
  // hazard emblem decal
  const hazard = svg(
    `<svg viewBox="0 0 64 64"><polygon points="32,4 61,56 3,56" fill="#f2c418" stroke="#101114" stroke-width="5" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="20" fill="#101114"/><circle cx="32" cy="48" r="3.5" fill="#101114"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
    at: [0, 1.45, zr - 0.035],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazard,
  });
  // rivets on frame corners
  for (const x of [-0.7, 0.7]) for (const y of [1.2, 2.15]) cyl(0.03, 0.04, BRASS, [x, y, zr - 0.06], [0, 0, 1], 6);
  // cable bundles looping on the tailgate sides
  for (const s of [1, -1]) {
    for (let k = 0; k < 3; k++) {
      const x = s * (0.95 + k * 0.08);
      cyl(0.03, 0.9, k === 1 ? CYAN : CABLE, [x, 1.65, zr - 0.08], [0, 1, 0], 6, "s26cable");
    }
    b.part(new THREE.TorusGeometry(0.14, 0.03, 4, 8, Math.PI), CABLE, {
      at: [s * 1.03, 1.2, zr - 0.08],
      rotation: [0, 0, 180],
    });
    box(0.3, 0.06, 0.06, STEEL, [s * 1.03, 1.9, zr - 0.08]); // clamp
  }
  // tow hitch
  box(0.5, 0.2, 0.3, STEEL_DARK, [0, 0.9, -3.65]);
  box(0.16, 0.16, 0.5, STEEL, [0, 0.9, -3.95]);
  cyl(0.1, 0.12, STEEL, [0, 0.98, -4.1], [0, 1, 0], 8);
  cyl(0.04, 0.3, YELLOW, [0.15, 0.9, -4.05], [0, 1, 0], 6); // pin
  for (const s of [1, -1]) box(0.08, 0.3, 0.2, STEEL, [s * 0.28, 0.9, -3.75]);
  // rear bumper & mud flap light
  box(2.4, 0.2, 0.2, STEEL_DARK, [0, 0.72, -3.95]);
  for (const s of [1, -1]) box(0.5, 0.05, 0.05, CYAN, [s * 0.8, 0.72, -4.06]);

  // ---------- WINDSHIELD HUD ----------
  // glass tilted -18deg about x, centre (0, 2.4, 2.38)
  const wz = 2.43;
  box(2.1, 0.07, 0.08, STEEL_DARK, [0, 2.69, wz - 0.02], [-18, 0, 0]);
  box(2.1, 0.07, 0.08, STEEL_DARK, [0, 2.11, wz + 0.06], [-18, 0, 0]);
  for (const s of [1, -1]) box(0.07, 0.62, 0.08, STEEL_DARK, [s * 1.03, 2.4, wz + 0.02], [-18, 0, 0]);
  // centre mullion
  box(0.04, 0.58, 0.06, STEEL, [0, 2.4, wz + 0.04], [-18, 0, 0]);
  // wipers
  for (const s of [1, -1]) {
    cyl(0.025, 0.06, STEEL, [s * 0.35, 2.14, wz + 0.1], [0, 0, 1], 6);
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.8), CABLE, {
      at: [s * 0.35 - s * 0.1, 2.38, wz + 0.1],
      rotation: [-18, s * 8, 0],
      name: "s26wiper",
    });
  }
  // HUD glow strip along the dash edge
  box(1.9, 0.04, 0.05, CYAN, [0, 2.1, wz + 0.1], [-18, 0, 0], "s26hud");
  for (let i = 0; i < 7; i++) box(0.04, 0.08, 0.05, CYAN, [-0.9 + i * 0.3, 2.14, wz + 0.1], [-18, 0, 0]);
  // sensor pods on the top corners
  for (const s of [1, -1]) {
    box(0.2, 0.14, 0.18, STEEL_DARK, [s * 0.85, 2.78, wz - 0.08]);
    b.part(new THREE.SphereGeometry(0.06, 6, 4), s > 0 ? CYAN : MAGENTA, { at: [s * 0.85, 2.78, wz + 0.04] });
    cyl(0.015, 0.15, STEEL, [s * 0.95, 2.9, wz - 0.1], [0, 1, 0], 4);
  }
  // sun visor
  box(1.9, 0.04, 0.2, HULL_DARK, [0, 2.76, wz + 0.04], [-18, 0, 0]);
}
```
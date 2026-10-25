import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, stripes } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured 6-wheel hauler guarding a sealed, neon-strapped cargo pod.",
};

// ---------- palette ----------
const CYAN = "#19e6ff";
const MAGENTA = "#ff2d95";
const YELLOW = "#ffc21a";
const DARK = "#12151f";
const STEEL = "#4a556f";
const PLATE = "#2b3449";
const RUBBER = "#0d0e12";

// ---------- paints ----------
const HULL = paint((p, n) => {
  const base = mix("#1f2637", "#3a4766", smoothstep(0.0, 0.9, n.y));
  let c = mix(base, "#141824", smoothstep(0.55, 0.8, noise(p, 0.3, 3)) * 0.6);
  if (p.y < 1.0) c = mix(c, "#3b3229", 0.45 * smoothstep(1.0, 0.3, p.y));
  return c;
});
const POD = paint((p, n) => {
  const base = mix("#2a3042", "#46526f", smoothstep(-0.2, 0.9, n.y));
  const seam = Math.abs(((p.z / 1.35) % 1 + 1) % 1 - 0.5) > 0.485;
  if (seam) return "#0b0d14";
  let c = mix(base, "#171b28", smoothstep(0.6, 0.85, noise(p, 0.35, 8)) * 0.5);
  if (p.y < 1.8) c = mix(c, "#3a3229", 0.4 * smoothstep(1.8, 1.4, p.y));
  return c;
});
const HAZARD = stripes(YELLOW, DARK, { size: 0.22, axis: "x", width: 0.5, wobble: 0.02 });

// ---------- textures ----------
const LABEL = svg(
  `<svg viewBox="0 0 220 100"><rect x="2" y="2" width="216" height="96" rx="6" fill="#0c0f18" stroke="${CYAN}" stroke-width="3"/>
  <path d="M8 90 L40 90 L58 60 L26 60Z M62 90 L94 90 L112 60 L80 60Z" fill="${YELLOW}"/>
  <text x="120" y="42" font-family="monospace" font-weight="bold" font-size="26" fill="${CYAN}">CARGO</text>
  <text x="120" y="68" font-family="monospace" font-weight="bold" font-size="20" fill="${MAGENTA}">SEALED</text>
  <circle cx="30" cy="30" r="16" fill="none" stroke="${MAGENTA}" stroke-width="4"/>
  <path d="M30 18 L30 30 L40 36" stroke="${MAGENTA}" stroke-width="4" fill="none"/>
  <text x="120" y="90" font-family="monospace" font-size="12" fill="#8aa">NO-OPEN // AUTH 0x7F</text></svg>`,
  { size: 440 },
);
const LOCK = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#10131c" stroke="${MAGENTA}" stroke-width="4"/>
  <circle cx="50" cy="50" r="34" fill="none" stroke="${CYAN}" stroke-width="3" stroke-dasharray="10 6"/>
  <rect x="34" y="44" width="32" height="26" rx="3" fill="${MAGENTA}"/>
  <path d="M39 44 V34 A11 11 0 0 1 61 34 V44" fill="none" stroke="${MAGENTA}" stroke-width="6"/>
  <rect x="47" y="52" width="6" height="10" fill="#10131c"/></svg>`,
  { size: 256 },
);
const HUB = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#161a26"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="${CYAN}" stroke-width="5"/>
  <g stroke="#2e3850" stroke-width="7"><path d="M50 12V88M12 50H88M23 23L77 77M77 23L23 77"/></g>
  <circle cx="50" cy="50" r="12" fill="#0a0c12" stroke="${MAGENTA}" stroke-width="4"/></svg>`,
  { size: 128 },
);
const VISOR = svg(
  `<svg viewBox="0 0 200 100"><rect width="200" height="100" fill="#06222c"/>
  <path d="M0 70 L200 40 V0 H0Z" fill="#0b3a4a"/>
  <g stroke="${CYAN}" stroke-width="1.5" opacity="0.8"><path d="M10 20H80M10 30H60M120 80H190M140 70H190"/></g>
  <circle cx="160" cy="25" r="10" fill="none" stroke="${MAGENTA}" stroke-width="2"/>
  <path d="M0 100 L200 0" stroke="#7ff" stroke-width="1" opacity="0.4"/>
  <rect x="2" y="2" width="196" height="96" fill="none" stroke="#0a0c12" stroke-width="5"/></svg>`,
  { size: 256 },
);
const PLATE_TX = svg(
  `<svg viewBox="0 0 120 50"><rect width="120" height="50" rx="5" fill="#0c0f18" stroke="${YELLOW}" stroke-width="3"/>
  <text x="60" y="34" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="${YELLOW}">CVY-07</text></svg>`,
  { size: 240 },
);

const b = createBuilder({ name: "convoy_hauler" });

// ---------- helpers ----------
type V = [number, number, number];
function box(size: V, at: V, color: any, opt: any = {}) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, ...opt });
}
function cylZ(r0: number, r1: number, h: number, seg: number, at: V, color: any, opt: any = {}) {
  return b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, rotation: [90, 0, 0], ...opt });
}
function cylX(r: number, h: number, seg: number, at: V, color: any, opt: any = {}) {
  return b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, rotation: [0, 0, 90], ...opt });
}
function cylY(r0: number, r1: number, h: number, seg: number, at: V, color: any, opt: any = {}) {
  return b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, ...opt });
}
function oct(w: number, h: number, c: number): [number, number][] {
  return [
    [-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c],
    [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c],
  ];
}
function octSlab(w: number, h: number, c: number, at: V, thick: number, color: any, bevel = 0.04) {
  return b.extrude(oct(w, h, c), { at, x: [1, 0, 0], y: [0, 1, 0], thickness: thick, bevel, color });
}
function decal(tex: any, size: [number, number], at: V, dir: V, color = "#ffffff") {
  return b.part(new THREE.PlaneGeometry(size[0], size[1]), color, { at, dir, axis: "z", texture: tex });
}

// ---------- chassis ----------
box([2.3, 0.4, 9.2], [0, 0.97, 0], HULL);
box([2.7, 0.18, 7.2], [0, 1.28, -1.3], PLATE);
box([1.6, 0.25, 9.0], [0, 0.7, 0], DARK); // under tray
glow(box([2.0, 0.03, 8.4], [0, 0.55, 0], MAGENTA), 1.3); // underglow
for (const s of [1, -1]) {
  box([0.14, 0.6, 2.6], [s * 1.28, 1.0, -1.8], HULL); // side armour
  box([0.14, 0.6, 1.4], [s * 1.28, 1.0, 1.4], HULL);
  glow(box([0.05, 0.06, 7.8], [s * 1.37, 0.78, -0.4], CYAN), 1.4);
  box([0.1, 0.1, 7.8], [s * 1.35, 1.32, -1.3], STEEL); // rail
}

// ---------- wheels ----------
const AXLES = [3.0, -1.2, -3.2];
for (const z of AXLES) {
  cylX(0.12, 3.4, 8, [0, 0.65, z], STEEL); // axle
  for (const s of [1, -1]) {
    cylX(0.66, 0.62, 12, [s * 1.6, 0.65, z], RUBBER);
    cylX(0.46, 0.68, 10, [s * 1.6, 0.65, z], "#2a3144");
    glow(
      b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", { at: [s * 1.945, 0.65, z], dir: [s, 0, 0], axis: "z", texture: HUB }),
      0.9,
    );
    box([0.75, 0.1, 1.7], [s * 1.6, 1.52, z], PLATE); // fender
    box([0.75, 0.3, 0.1], [s * 1.6, 1.38, z + 0.8], PLATE);
    box([0.75, 0.3, 0.1], [s * 1.6, 1.38, z - 0.8], PLATE);
    box([0.5, 0.45, 0.06], [s * 1.6, 0.6, z - 0.82], "#1a1d27"); // mud flap
  }
}

// ---------- cab ----------
b.extrude(
  [[2.0, 1.2], [4.6, 1.2], [4.6, 2.1], [3.9, 2.9], [2.4, 3.0], [2.0, 2.9]],
  { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.08, color: HULL },
);
box([2.5, 0.35, 0.5], [0, 0.95, 4.6], HAZARD); // bumper
box([2.2, 0.5, 0.3], [0, 1.45, 4.75], PLATE); // grille plate
for (let i = 0; i < 4; i++) box([1.6, 0.04, 0.05], [0, 1.32 + i * 0.1, 4.92], DARK);
for (const s of [1, -1]) {
  glow(box([0.55, 0.22, 0.06], [s * 0.85, 1.85, 4.63], "#e8fcff"), 1.6); // headlights
  glow(box([0.3, 0.1, 0.06], [s * 0.85, 1.65, 4.63], MAGENTA), 1.4);
  box([0.1, 1.0, 1.5], [s * 1.25, 1.85, 3.2], PLATE); // door armour
  for (let i = 0; i < 4; i++) box([0.04, 0.05, 0.7], [s * 1.31, 1.5 + i * 0.1, 2.6], DARK);
  box([0.05, 0.55, 0.95], [s * 1.31, 2.4, 3.55], "#06222c"); // side window
  glow(box([0.04, 0.05, 1.3], [s * 1.33, 1.3, 3.2], CYAN), 1.4);
  box([0.04, 0.2, 0.5], [s * 1.34, 1.7, 3.3], "#ffffff", {}); // placeholder blank
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { at: [s * 1.345, 1.7, 3.3], dir: [s, 0, 0], axis: "z", texture: PLATE_TX });
  // mirrors
  cylY(0.025, 0.025, 0.35, 5, [s * 1.45, 2.3, 4.0], STEEL, { rotation: [0, 0, 90] });
  box([0.08, 0.4, 0.25], [s * 1.65, 2.3, 4.0], DARK);
  // exhaust stacks
  cylY(0.12, 0.12, 2.3, 8, [s * 1.1, 2.4, 1.85], STEEL);
  cylY(0.15, 0.15, 0.12, 8, [s * 1.1, 3.58, 1.85], DARK);
  glow(cylY(0.13, 0.13, 0.04, 8, [s * 1.1, 3.62, 1.85], MAGENTA), 1.5);
  box([0.1, 0.1, 0.1], [s * 1.1, 1.6, 1.85], PLATE);
}
// windshield
decal(VISOR, [2.1, 1.0], [0, 2.52, 4.27], [0, 0.66, 0.75]);
glow(box([1.9, 0.06, 0.12], [0, 2.95, 4.1], CYAN), 0.0 + 1.2); // visor brow glow
box([2.45, 0.1, 1.5], [0, 3.02, 3.15], PLATE); // roof plate
glow(box([1.7, 0.1, 0.15], [0, 3.1, 2.3], MAGENTA), 1.6); // light bar
box([2.0, 0.5, 0.9], [0, 1.6, 1.75], PLATE); // gooseneck

// turret
cylY(0.5, 0.55, 0.22, 8, [0, 3.2, 3.2], STEEL);
box([0.8, 0.42, 0.95], [0, 3.55, 3.2], PLATE);
box([0.5, 0.2, 0.4], [0, 3.8, 3.1], HULL);
for (const s of [1, -1]) {
  cylZ(0.06, 0.06, 1.3, 6, [s * 0.2, 3.55, 4.05], DARK);
  cylZ(0.09, 0.09, 0.2, 6, [s * 0.2, 3.55, 4.6], STEEL);
  glow(cylZ(0.04, 0.04, 0.03, 6, [s * 0.2, 3.55, 4.72], CYAN), 1.6);
}
glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { at: [0, 3.8, 3.5] }), 1.5); // sensor eye

// antennas + dish
for (const [x, h] of [[-0.9, 1.6], [0.95, 1.1]] as [number, number][]) {
  cylY(0.025, 0.04, h, 5, [x, 3.1 + h / 2, 2.3], STEEL);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), MAGENTA, { at: [x, 3.1 + h, 2.3] }), 1.6);
}

// ---------- cargo pod ----------
const PZ = -1.5;
const PY = 2.55;
b.extrude(oct(2.3, 2.2, 0.5), {
  at: [0, PY, PZ], x: [1, 0, 0], y: [0, 1, 0], thickness: 5.4, bevel: 0.05, color: POD,
});
octSlab(2.0, 1.9, 0.45, [0, PY, PZ - 2.85], 0.3, PLATE); // rear step
octSlab(1.9, 1.8, 0.42, [0, PY, PZ + 2.85], 0.3, PLATE); // front step
// straps
for (const z of [-3.6, -2.3, -0.7, 0.6]) {
  octSlab(2.4, 2.28, 0.52, [0, PY, z], 0.14, DARK, 0.03);
  glow(box([0.5, 0.04, 0.16], [0, PY + 1.15, z], CYAN), 1.5);
  glow(box([0.04, 0.5, 0.16], [1.2, PY, z], MAGENTA), 1.3);
  glow(box([0.04, 0.5, 0.16], [-1.2, PY, z], MAGENTA), 1.3);
}
glow(box([0.14, 0.04, 5.0], [0, PY + 1.12, PZ], CYAN), 1.2); // spine light
glow(box([0.2, 0.04, 4.4], [0.55, PY + 1.12, PZ], "#1a8ea0"), 0.6);
// hazard chamfer strips
for (const s of [1, -1]) {
  box([0.5, 0.05, 5.0], [s * 0.88, PY + 0.97, PZ], HAZARD, { rotation: [0, 0, -s * 45] });
  decal(LABEL, [2.0, 0.9], [s * 1.165, PY + 0.05, PZ + 0.9], [s, 0, 0]);
  decal(LOCK, [0.5, 0.5], [s * 1.165, PY - 0.0, PZ - 1.55], [s, 0, 0]);
}
// rear door
decal(LOCK, [1.1, 1.1], [0, PY, PZ - 3.0 - 0.01], [0, 0, -1]);
for (const s of [1, -1]) glow(box([0.14, 0.14, 0.05], [s * 0.78, PY + 0.7, PZ - 3.01], MAGENTA), 1.6);
// pod roof hatch + dish
box([0.9, 0.08, 0.9], [-0.1, PY + 1.16, PZ + 1.2], PLATE);
cylY(0.04, 0.04, 0.3, 5, [0.6, PY + 1.3, PZ - 1.2], STEEL);
b.part(new THREE.ConeGeometry(0.4, 0.18, 8), STEEL, { at: [0.6, PY + 1.5, PZ - 1.2], rotation: [-35, 0, 0] });
glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), CYAN, { at: [0.6, PY + 1.55, PZ - 1.08] }), 1.5);

// ---------- rear ----------
box([2.4, 0.4, 0.3], [0, 0.95, -4.7], HAZARD);
for (const s of [1, -1]) {
  glow(box([0.5, 0.14, 0.06], [s * 0.8, 1.25, -4.65], MAGENTA), 1.7);
  box([0.1, 0.5, 0.4], [s * 1.1, 1.0, -4.5], PLATE);
}
box([1.0, 0.5, 0.15], [0, 1.4, -4.5], PLATE);

// ---------- cables between cab & pod ----------
for (const s of [1, -1]) {
  cylZ(0.04, 0.04, 0.7, 5, [s * 0.4, 2.2, 1.6], DARK);
  glow(cylZ(0.02, 0.02, 0.5, 4, [s * 0.4, 2.3, 1.6], CYAN), 1.0);
}

export default function build() {
  return b.root;
}

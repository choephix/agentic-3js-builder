```ts
import * as THREE from "three";
import { createBuilder, mottle, countershade, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to four ducted hover thrusters, with a camo hull, bed-mounted gun and rocket pods, and neon underglow, in a low-poly cyberpunk style.",
};

// ---------- palette ----------
const DARK = "#1b1e26";
const STEEL = "#30343f";
const LIGHT_STEEL = "#4b505e";
const GLASS = "#0d2b44";
const CYAN = "#2af3ff";
const MAGENTA = "#ff2fa6";
const AMBER = "#ffb21e";
const RED = "#ff2a3c";
const WHITE = "#f4f7ff";
const GREEN = "#37ff9a";
const YELLOW = "#f2d21b";

const CAMO = countershade(
  mottle(
    mottle("#47543a", "#2f3a2c", { size: 0.4, seed: 2 }),
    mottle("#5d5a3e", "#3a3626", { size: 0.25, seed: 5 }),
    { size: 0.9, seed: 9, contrast: 2 },
  ),
  "#1a1e1a",
  { level: -0.55, soft: 0.25 },
);
const METAL = mottle("#2a2e38", "#191c23", { size: 0.15, seed: 4 });

// ---------- textures ----------
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="46" fill="none" stroke="#e9e24a" stroke-width="6"/>
  <circle cx="50" cy="50" r="38" fill="#14161b" opacity="0.85"/>
  <polygon points="50,14 59,40 87,40 64,56 73,84 50,67 27,84 36,56 13,40 41,40" fill="#e9e24a"/>
  <rect x="30" y="86" width="40" height="8" fill="#ff2fa6"/>
  <text x="50" y="93.5" font-family="monospace" font-weight="bold" font-size="8" text-anchor="middle" fill="#111">UNIT-07</text>
</svg>`,
  { size: 256 },
);
const SIGN = svg(
  `<svg viewBox="0 0 120 30">
  <rect x="1" y="1" width="118" height="28" rx="3" fill="#120a1e" stroke="#ff2fa6" stroke-width="2"/>
  <text x="60" y="21" font-family="monospace" font-weight="bold" font-size="16" text-anchor="middle" fill="#2af3ff">NEON RUNNER</text>
  <rect x="8" y="5" width="10" height="2" fill="#ff2fa6"/><rect x="102" y="23" width="10" height="2" fill="#ff2fa6"/>
</svg>`,
  { size: 384 },
);
let stripeMarkup = "";
for (let i = -2; i < 12; i++)
  stripeMarkup += `<polygon points="${i * 10},12 ${i * 10 + 5},12 ${i * 10 + 11},0 ${i * 10 + 6},0" fill="#111"/>`;
const HAZARD = svg(
  `<svg viewBox="0 0 80 12"><rect width="80" height="12" fill="#f2d21b"/>${stripeMarkup}</svg>`,
  { size: 256 },
);
let slits = "";
for (let i = 0; i < 5; i++) slits += `<rect x="8" y="${5 + i * 5}" width="84" height="2.4" fill="#2af3ff"/>`;
const GRILLE = svg(
  `<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="#0d0f14"/><rect x="2" y="2" width="96" height="26" fill="none" stroke="#ff2fa6" stroke-width="1.5"/>${slits}</svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 30"><rect width="60" height="30" rx="3" fill="#e8f7ff" stroke="#111" stroke-width="2"/>
  <rect x="2" y="2" width="56" height="7" fill="#2a4cff"/>
  <text x="30" y="26" font-family="monospace" font-weight="bold" font-size="13" text-anchor="middle" fill="#111">HVR-2077</text></svg>`,
  { size: 192 },
);
let blades = "";
for (let i = 0; i < 9; i++) {
  const a = (i * 40 * Math.PI) / 180;
  const a2 = a + 0.5;
  blades += `<polygon points="50,50 ${50 + 46 * Math.cos(a)},${50 + 46 * Math.sin(a)} ${50 + 46 * Math.cos(a2)},${50 + 46 * Math.sin(a2)}" fill="#2af3ff"/>`;
}
const FAN = svg(
  `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#06222e"/>${blades}
  <circle cx="50" cy="50" r="46" fill="none" stroke="#baffff" stroke-width="3"/>
  <circle cx="50" cy="50" r="9" fill="#0b1118"/><circle cx="50" cy="50" r="4" fill="#ff2fa6"/></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "hover_technical" });

  // ---------- helpers ----------
  type Opts = Record<string, unknown>;
  const bx = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: Opts = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, x: number, y: number, z: number, dir: [number, number, number] = [0, 1, 0], o: Opts = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at: [x, y, z], dir, ...o });
  const decal = (w: number, h: number, tex: THREE.Texture, at: [number, number, number], dir: [number, number, number], strength = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
    if (strength > 0) glow(p, strength);
    return p;
  };
  const neon = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1.4, o: Opts = {}) =>
    glow(bx(w, h, d, color, x, y, z, o), s);

  // ---------- chassis ----------
  bx(1.6, 0.22, 5.2, METAL, 0, 0.6, -0.3);
  bx(1.3, 0.1, 4.4, STEEL, 0, 0.47, -0.2); // belly plate
  neon(1.5, 0.02, 3.8, MAGENTA, 0, 0.4, -0.2, 1.3); // underglow plate
  // lower body
  bx(1.9, 0.43, 5.0, CAMO, 0, 0.955, -0.1);
  // bed floor and walls
  bx(1.7, 0.04, 1.6, DARK, 0, 1.19, -1.78);
  for (const s of [1, -1]) {
    bx(0.1, 0.43, 1.7, CAMO, s * 0.9, 1.385, -1.77);
    bx(0.12, 0.05, 1.72, STEEL, s * 0.9, 1.62, -1.77);
    decal(1.2, 0.3, SIGN, [s * 0.953, 1.4, -1.75], [s, 0, 0], 1.0);
  }
  bx(1.9, 0.43, 0.1, CAMO, 0, 1.385, -2.55);
  bx(1.92, 0.05, 0.12, STEEL, 0, 1.62, -2.55);
  bx(1.9, 0.43, 0.08, CAMO, 0, 1.385, -0.98);

  // ---------- hood ----------
  b.extrude(
    [[0.7, 0], [2.4, 0], [2.4, 0.1], [1.9, 0.22], [0.9, 0.3], [0.7, 0.28]],
    { at: [0, 1.17, 0], x: [0, 0, 1], thickness: 1.8, color: CAMO, bevel: 0.02 },
  );
  bx(0.7, 0.1, 0.6, DARK, 0, 1.5, 1.55, { rotation: [-8, 0, 0] }); // scoop
  for (let i = 0; i < 4; i++) neon(0.5, 0.012, 0.03, CYAN, 0, 1.558, 1.34 + i * 0.1, 1.2, { rotation: [-8, 0, 0] });
  bx(0.34, 0.012, 1.5, YELLOW, 0.5, 1.45, 1.6, { rotation: [-8, 0, 0] });
  bx(0.34, 0.012, 1.5, YELLOW, -0.5, 1.45, 1.6, { rotation: [-8, 0, 0] });

  // ---------- front ----------
  decal(1.1, 0.33, GRILLE, [0, 0.98, 2.405], [0, 0, 1], 1.0);
  bx(2.1, 0.3, 0.25, STEEL, 0, 0.72, 2.5);
  decal(1.9, 0.22, HAZARD, [0, 0.72, 2.628], [0, 0, 1]);
  bx(2.2, 0.08, 0.3, DARK, 0, 0.9, 2.52);
  for (const s of [1, -1]) {
    neon(0.42, 0.14, 0.06, WHITE, s * 0.7, 1.02, 2.43, 1.8);
    neon(0.42, 0.03, 0.07, CYAN, s * 0.7, 0.9, 2.44, 1.6);
    bx(0.1, 0.12, 0.2, LIGHT_STEEL, s * 0.45, 0.62, 2.55); // tow hook
    // armoured wedge corners
    bx(0.14, 0.4, 0.32, STEEL, s * 1.0, 0.82, 2.4);
  }
  cyl(0.07, 0.07, 0.5, 8, LIGHT_STEEL, 0, 0.78, 2.66, [1, 0, 0]); // winch drum
  bx(0.2, 0.1, 0.1, AMBER, 0, 0.78, 2.7);

  // ---------- cab ----------
  b.extrude(
    [[-0.95, 0], [0.85, 0], [0.5, 0.7], [-0.65, 0.72], [-0.95, 0.55]],
    { at: [0, 1.17, 0], x: [0, 0, 1], thickness: 1.8, color: CAMO, bevel: 0.02 },
  );
  b.extrude(
    [[-0.78, 0.2], [0.66, 0.2], [0.46, 0.64], [-0.62, 0.66]],
    { at: [0, 1.17, 0], x: [0, 0, 1], thickness: 1.84, color: GLASS },
  );
  bx(1.86, 0.48, 0.07, CAMO, 0, 1.6, -0.08); // B pillar
  b.part(new THREE.BoxGeometry(1.6, 0.42, 0.03), GLASS, { at: [0, 1.658, 0.616], dir: [0, 0.7, -0.35] });
  bx(1.5, 0.38, 0.03, GLASS, 0, 1.6, -0.96);
  bx(1.74, 0.07, 1.4, STEEL, 0, 1.9, -0.12);
  bx(1.5, 0.05, 0.9, CAMO, 0, 1.94, -0.1);
  for (const s of [1, -1]) {
    // door seams, handle, emblem
    bx(0.02, 0.5, 0.02, DARK, s * 0.905, 1.4, 0.55);
    bx(0.02, 0.5, 0.02, DARK, s * 0.905, 1.4, -0.7);
    bx(0.03, 0.04, 0.2, LIGHT_STEEL, s * 0.915, 1.3, 0.35);
    decal(0.5, 0.5, EMBLEM, [s * 0.915, 1.38, -0.32], [s, 0, 0]);
    // mirrors
    bx(0.14, 0.03, 0.03, STEEL, s * 1.0, 1.55, 0.7);
    bx(0.06, 0.2, 0.16, DARK, s * 1.08, 1.55, 0.7);
    neon(0.01, 0.16, 0.12, CYAN, s * 1.115, 1.55, 0.7, 1.2);
    // side skirt + neon
    bx(0.12, 0.3, 2.2, STEEL, s * 0.98, 0.62, 0.0);
    neon(0.02, 0.03, 4.5, MAGENTA, s * 0.965, 0.84, -0.1, 1.4);
    neon(0.02, 0.025, 2.0, CYAN, s * 1.045, 0.62, 0.0, 1.4);
    // fender armour plates
    bx(0.08, 0.16, 1.0, LIGHT_STEEL, s * 0.97, 1.0, 1.7, { rotation: [0, 0, 0] });
  }

  // ---------- roof gear ----------
  neon(1.4, 0.07, 0.12, AMBER, 0, 2.0, 0.45, 1.6);
  for (const s of [1, -1]) neon(0.2, 0.08, 0.14, s > 0 ? MAGENTA : CYAN, s * 0.78, 2.0, 0.45, 1.8);
  b.part(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0.4, 1.95, -0.5] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { at: [0.4, 2.06, -0.44] }), 1.5);
  cyl(0.012, 0.012, 1.3, 5, DARK, -0.7, 2.55, -0.8, [0.05, 1, -0.1]);
  neon(0.2, 0.1, 0.01, MAGENTA, -0.65, 3.0, -0.88, 1.5);
  cyl(0.01, 0.01, 0.8, 5, DARK, 0.75, 2.3, -0.75, [-0.05, 1, 0]);
  bx(0.3, 0.04, 0.04, LIGHT_STEEL, 0, 2.0, -0.7); // dish stub
  b.part(new THREE.CylinderGeometry(0.16, 0.05, 0.06, 8), LIGHT_STEEL, { at: [-0.3, 1.98, -0.7] });
  // roof-mounted exhaust/vent stacks behind cab
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 0.8, 8, STEEL, s * 0.82, 1.6, -1.1);
    cyl(0.085, 0.085, 0.05, 8, DARK, s * 0.82, 2.0, -1.1);
    neon(0.1, 0.02, 0.1, AMBER, s * 0.82, 2.03, -1.1, 1.3);
  }

  // ---------- bed weapons ----------
  cyl(0.13, 0.17, 0.32, 8, STEEL, 0, 1.36, -1.9);
  cyl(0.28, 0.28, 0.05, 10, DARK, 0, 1.55, -1.9);
  bx(0.34, 0.26, 0.6, CAMO, 0, 1.76, -1.9);
  bx(0.08, 0.3, 0.3, DARK, 0.2, 1.72, -1.85);
  bx(0.08, 0.3, 0.3, DARK, -0.2, 1.72, -1.85);
  bx(0.5, 0.36, 0.05, STEEL, 0, 1.78, -1.55, { rotation: [-10, 0, 0] }); // gun shield
  neon(0.4, 0.04, 0.02, RED, 0, 1.88, -1.52, 1.6, { rotation: [-10, 0, 0] });
  for (const off of [-0.09, 0, 0.09]) {
    cyl(0.025, 0.025, 0.6, 6, DARK, off, 1.76, -1.2, [0, 0, 1]);
    cyl(0.04, 0.04, 0.08, 6, LIGHT_STEEL, off, 1.76, -0.93, [0, 0, 1]);
  }
  bx(0.22, 0.2, 0.3, "#555c34", 0.42, 1.34, -1.9); // ammo box
  neon(0.23, 0.03, 0.04, AMBER, 0.42, 1.44, -1.76, 1.2);
  for (const s of [1, -1]) {
    bx(0.4, 0.4, 0.8, STEEL, s * 0.62, 1.4, -2.2);
    bx(0.42, 0.06, 0.82, CAMO, s * 0.62, 1.63, -2.2);
    for (const dx of [-1, 1])
      for (const dy of [-1, 1]) {
        cyl(0.075, 0.075, 0.05, 6, DARK, s * 0.62 + dx * 0.09, 1.4 + dy * 0.09, -1.79, [0, 0, 1]);
        cyl(0.0, 0.055, 0.12, 6, RED, s * 0.62 + dx * 0.09, 1.4 + dy * 0.09, -1.78, [0, 0, 1]);
      }
  }
  for (const s of [1, -1]) {
    glow(cyl(0.11, 0.11, 0.5, 8, CYAN, s * 0.3, 1.45, -2.38), 1.4);
    cyl(0.13, 0.13, 0.05, 8, STEEL, s * 0.3, 1.72, -2.38);
    cyl(0.13, 0.13, 0.05, 8, STEEL, s * 0.3, 1.2, -2.38);
  }

  // ---------- rear ----------
  decal(0.5, 0.25, PLATE, [0, 1.0, -2.612], [0, 0, -1]);
  neon(1.6, 0.06, 0.03, RED, 0, 1.52, -2.62, 1.8);
  for (const s of [1, -1]) {
    neon(0.12, 0.2, 0.04, RED, s * 0.8, 1.1, -2.52, 1.6);
    cyl(0.2, 0.28, 0.5, 8, STEEL, s * 0.5, 0.82, -2.85, [0, 0, -1]);
    cyl(0.3, 0.3, 0.06, 8, LIGHT_STEEL, s * 0.5, 0.82, -2.6, [0, 0, 1]);
    const nozzle = b.part(new THREE.CircleGeometry(0.24, 8), "#ffffff", {
      at: [s * 0.5, 0.82, -3.11], dir: [0, 0, -1], axis: "z", texture: FAN,
    });
    glow(nozzle, 1.5);
    bx(0.05, 0.4, 0.6, DARK, s * 0.88, 1.15, -2.9); // rear fins
  }
  bx(2.0, 0.07, 0.35, STEEL, 0, 0.62, -2.8);
  bx(1.6, 0.08, 0.5, STEEL, 0, 1.95, -2.78); // rear spoiler
  for (const s of [1, -1]) {
    bx(0.06, 0.4, 0.5, CAMO, s * 0.82, 1.78, -2.78);
    bx(0.06, 0.4, 0.5, CAMO, s * 0.82, 1.78, -2.78);
  }
  bx(0.06, 0.06, 0.06, DARK, 0, 0, 0); // tiny anchor kept inside the pods' footprint below floor tolerance

  // ---------- hover pods ----------
  const SHELL: [number, number][] = [[0.4, 0.02], [0.54, 0], [0.56, 0.45], [0.46, 0.56], [0.4, 0.45]];
  for (const s of [1, -1])
    for (const z of [1.6, -1.6]) {
      const x = s * 1.18;
      b.lathe(SHELL, { at: [x, 0, z], segments: 10, color: METAL });
      glow(b.part(new THREE.TorusGeometry(0.52, 0.025, 4, 14), MAGENTA, { at: [x, 0.03, z], rotation: [90, 0, 0] }), 1.6);
      glow(b.part(new THREE.TorusGeometry(0.46, 0.02, 4, 14), CYAN, { at: [x, 0.55, z], rotation: [90, 0, 0] }), 1.6);
      const down = b.part(new THREE.CircleGeometry(0.4, 14), "#ffffff", { at: [x, 0.14, z], dir: [0, -1, 0], axis: "z", texture: FAN });
      glow(down, 1.5);
      const up = b.part(new THREE.CircleGeometry(0.4, 14), "#ffffff", { at: [x, 0.16, z], dir: [0, 1, 0], axis: "z", texture: FAN });
      glow(up, 1.5);
      cyl(0.07, 0.07, 0.3, 6, DARK, x, 0.3, z); // hub
      // intake braces
      bx(0.8, 0.03, 0.05, STEEL, x, 0.5, z);
      bx(0.05, 0.03, 0.8, STEEL, x, 0.5, z);
      // strut to chassis
      bx(0.5, 0.14, 0.34, STEEL, s * 0.88, 0.58, z);
      bx(0.12, 0.3, 0.3, LIGHT_STEEL, s * 0.68, 0.55, z);
      // pod side marking
      neon(0.02, 0.1, 0.3, s > 0 ? AMBER : GREEN, s * 1.74, 0.3, z, 1.2);
      decal(0.3, 0.1, HAZARD, [x + s * 0.56, 0.25, z], [s, 0, 0]);
    }

  // front canards / armour
  for (const s of [1, -1]) {
    bx(0.5, 0.04, 0.35, STEEL, s * 1.05, 0.95, 2.3, { rotation: [0, s * -15, 0] });
  }

  return b.root;
}
```
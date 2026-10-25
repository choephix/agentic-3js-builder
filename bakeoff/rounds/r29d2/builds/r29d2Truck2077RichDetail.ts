import * as THREE from "three";
import { createBuilder, svg, paint, noise, mix } from "../../../../src/index";
import { countershade, mottle, stripes } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Wraith-X Hauler 2077",
  description:
    "Low-poly cyberpunk militarized six-wheel truck with armoured cab, turret, rocket pods, neon underglow and HUD glass.",
};

const CYAN = "#27f0ff";
const MAG = "#ff2fa8";
const AMBER = "#ffb21e";
const RED = "#ff2a3a";
const DARK = "#14161c";
const GUN = "#2a2f38";
const STEEL = "#6b7380";
const RUBBER = "#1b1c20";

// ---------- textures ----------
const GLASS = svg(
  `<svg viewBox="0 0 128 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b3a52"/><stop offset="1" stop-color="#0f8aa8"/></linearGradient></defs>
  <rect width="128" height="64" fill="url(#g)"/>
  <path d="M0 50 L128 14" stroke="#9ff8ff" stroke-width="3" opacity=".35"/>
  <path d="M20 64 L70 0" stroke="#9ff8ff" stroke-width="5" opacity=".18"/>
  <rect x="8" y="6" width="40" height="3" fill="#5ff"/><rect x="8" y="12" width="26" height="2" fill="#f2a"/>
  <circle cx="100" cy="18" r="9" fill="none" stroke="#5ff" stroke-width="2"/><path d="M100 6V30M88 18H112" stroke="#5ff" stroke-width="1.5"/>
  <rect x="0" y="0" width="128" height="64" fill="none" stroke="#052" stroke-width="3"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0d3548"/><path d="M0 28 L40 0 H52 L12 32Z" fill="#8ff" opacity=".3"/>
  <rect width="64" height="32" fill="none" stroke="#041" stroke-width="3"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 96 32"><rect width="96" height="32" fill="#0a0b0f"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${4 + i * 11.5}" y="4" width="8" height="24" fill="#252a34" stroke="#444c5c" stroke-width="1"/><rect x="${6 + i * 11.5}" y="${6 + (i % 3) * 6}" width="4" height="3" fill="#27f0ff"/>`).join("")}
  <rect width="96" height="32" fill="none" stroke="#555d6c" stroke-width="3"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#0c0d12" stroke="#ff2fa8" stroke-width="3"/>
  <path d="M32 10 L50 22 V40 L32 54 L14 40 V22Z" fill="none" stroke="#27f0ff" stroke-width="3"/>
  <path d="M22 26 L32 20 L42 26 L38 38 H26Z" fill="#ff2fa8"/><rect x="26" y="42" width="12" height="3" fill="#ffb21e"/>
  <text x="32" y="62" font-size="7" text-anchor="middle" fill="#fff" font-family="monospace">WX-77</text></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 24"><rect width="64" height="24" rx="2" fill="#e8e2c0" stroke="#222" stroke-width="2"/>
  <text x="32" y="17" font-size="13" font-weight="bold" text-anchor="middle" fill="#222" font-family="monospace">N1TE-77</text></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#06141a"/>
  <path d="M2 24 L10 16 L18 20 L28 8 L38 14 L46 4" fill="none" stroke="#2f8" stroke-width="2"/>
  <rect x="4" y="4" width="14" height="3" fill="#f2a"/><rect x="4" y="9" width="9" height="2" fill="#5ff"/>
  <rect x="2" y="2" width="44" height="28" fill="none" stroke="#5ff" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 32 32"><path d="M16 3 L30 28 H2Z" fill="#ffb21e" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="14.5" y="12" width="3" height="9" fill="#111"/><rect x="14.5" y="23" width="3" height="3" fill="#111"/></svg>`,
  { size: 64 },
);

// ---------- paints ----------
const HULL = panelled(
  paint((p, n) => {
    const base = mix("#2c3b3f", "#3e5256", noise(p, 0.5, 3));
    const dust = Math.max(0, 0.3 - p.y * 0.1) * (1 - Math.max(0, n.y));
    return mix(base, "#4a4034", dust + 0.1 * noise(p, 0.1, 8));
  }),
  { size: 0.5, aspect: 0.8, rivets: 0.1 },
);
const CARGO = panelled(countershade(mottle("#39424a", "#4b5660", { size: 0.4 }), "#232830"), {
  size: 0.6,
  aspect: 0.7,
  rivets: 0.12,
});
const IRON = metal("iron", { tarnish: 0.5 });
const HAZARD = stripes("#16181c", "#ffc400", { size: 0.14, axis: [1, 1, 0], width: 0.5, wobble: 0 });

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  const P = (g: THREE.BufferGeometry, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(g, color, { at: [x, y, z], ...o });
  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), color, x, y, z, o);
  const cyl = (r: number, h: number, seg: number, color: any, x: number, y: number, z: number, dir: number[], o: any = {}) =>
    P(new THREE.CylinderGeometry(r, r, h, seg), color, x, y, z, { dir, ...o });
  const lamp = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, k = 1, o: any = {}) =>
    glow(box(w, h, d, color, x, y, z, o), k);
  const decal = (tex: THREE.Texture, w: number, h: number, x: number, y: number, z: number, dir: number[], glowK = 0) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex });
    if (glowK) glow(part, glowK);
    return part;
  };

  // ---------- chassis ----------
  box(1.5, 0.3, 6.6, GUN, 0, 0.72, -0.1); // central spine
  for (const s of [1, -1]) {
    box(0.18, 0.34, 6.8, DARK, s * 0.75, 0.75, -0.1); // rails
    box(0.1, 0.26, 6.6, IRON, s * 0.85, 0.75, -0.1);
  }
  for (let i = 0; i < 7; i++) box(1.7, 0.12, 0.14, STEEL, 0, 0.9, -3.1 + i * 1.0); // cross members
  // axles + differentials
  for (const z of [2.2, -0.6, -2.2]) {
    cyl(0.09, 2.4, 8, STEEL, 0, 0.62, z, [1, 0, 0]);
    P(new THREE.SphereGeometry(0.28, 8, 6), IRON, 0, 0.62, z);
    box(0.3, 0.06, 0.3, AMBER, 0, 0.9, z);
  }
  // suspension arms / shock absorbers
  for (const s of [1, -1])
    for (const z of [2.2, -0.6, -2.2]) {
      cyl(0.06, 0.55, 6, "#d4d8e0", s * 0.9, 0.95, z + 0.35, [0, 1, 0]);
      cyl(0.09, 0.2, 6, MAG, s * 0.9, 0.82, z + 0.35, [0, 1, 0]);
      box(0.1, 0.1, 0.6, GUN, s * 0.95, 0.55, z - 0.2, { rotation: [10, 0, 0] });
    }
  // fuel / battery cylinders
  for (const s of [1, -1]) {
    cyl(0.28, 1.6, 10, IRON, s * 0.55, 0.45, 0.8, [0, 0, 1]);
    cyl(0.3, 0.06, 10, AMBER, s * 0.55, 0.45, 0.2, [0, 0, 1]);
    cyl(0.3, 0.06, 10, AMBER, s * 0.55, 0.45, 1.4, [0, 0, 1]);
  }
  // underglow
  for (const s of [1, -1]) lamp(0.06, 0.05, 5.4, CYAN, s * 1.0, 0.33, -0.1, 1.2);
  lamp(1.6, 0.05, 0.06, MAG, 0, 0.33, 3.4, 1.2);
  lamp(1.6, 0.05, 0.06, MAG, 0, 0.33, -3.4, 1.2);

  // ---------- wheels ----------
  const wheel = (s: number, z: number) => {
    const x = s * 1.2;
    const y = 0.62;
    cyl(0.62, 0.5, 14, RUBBER, x, y, z, [1, 0, 0]);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      box(0.52, 0.09, 0.2, "#26272d", x, y + Math.cos(a) * 0.64, z + Math.sin(a) * 0.64, {
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    cyl(0.4, 0.46, 12, STEEL, x, y, z, [1, 0, 0]);
    cyl(0.36, 0.06, 12, "#3b414c", x + s * 0.25, y, z, [1, 0, 0]);
    cyl(0.2, 0.1, 8, IRON, x + s * 0.28, y, z, [1, 0, 0]);
    cyl(0.07, 0.14, 6, AMBER, x + s * 0.32, y, z, [1, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      cyl(0.03, 0.06, 6, "#d4d8e0", x + s * 0.3, y + Math.cos(a) * 0.28, z + Math.sin(a) * 0.28, [1, 0, 0]);
    }
    // spokes
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI;
      box(0.05, 0.62, 0.07, GUN, x + s * 0.27, y, z, { rotation: [(a * 180) / Math.PI + 90, 0, 0] });
    }
    // neon ring
    glow(
      b.part(new THREE.TorusGeometry(0.46, 0.022, 4, 20), CYAN, { at: [x + s * 0.26, y, z], dir: [s, 0, 0], axis: "z" }),
      1.3,
    );
    // brake caliper
    box(0.12, 0.2, 0.16, RED, x + s * 0.2, y + 0.2, z + 0.28);
    // valve stem
    cyl(0.015, 0.1, 5, "#ccc", x + s * 0.28, y - 0.33, z - 0.1, [1, 0, 0]);
  };
  for (const s of [1, -1]) for (const z of [2.2, -0.6, -2.2]) wheel(s, z);

  // fenders
  for (const s of [1, -1])
    for (const z of [2.2, -0.6, -2.2]) {
      box(0.62, 0.1, 1.0, HULL, s * 1.2, 1.38, z);
      box(0.62, 0.1, 0.5, HULL, s * 1.2, 1.28, z + 0.62, { rotation: [-35, 0, 0] });
      box(0.62, 0.1, 0.5, HULL, s * 1.2, 1.28, z - 0.62, { rotation: [35, 0, 0] });
      box(0.07, 0.07, 1.5, AMBER, s * 1.5, 1.33, z);
      // mud flap
      box(0.5, 0.45, 0.04, "#1a1b20", s * 1.2, 0.5, z - 0.78);
      decal(WARN, 0.2, 0.2, s * 1.2, 0.5, z - 0.8, [0, 0, -1]);
    }

  // ---------- cab ----------
  const cabOutline: [number, number][] = [
    [0.4, 1.0],
    [3.3, 1.0],
    [3.3, 1.55],
    [2.6, 1.75],
    [2.0, 2.55],
    [1.8, 2.75],
    [0.5, 2.75],
    [0.4, 2.55],
  ];
  const cab = b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.06, color: HULL });
  void cab;
  // armour add-ons
  for (const s of [1, -1]) {
    box(0.08, 0.7, 1.4, GUN, s * 1.19, 1.4, 1.7); // door plate
    box(0.1, 0.12, 1.5, HAZARD, s * 1.2, 1.1, 1.7);
    box(0.06, 0.06, 1.4, AMBER, s * 1.23, 1.76, 1.7);
    decal(EMBLEM, 0.55, 0.55, s * 1.245, 1.4, 1.7, [s, 0, 0]);
    // side window
    decal(SIDEWIN, 0.9, 0.5, s * 1.16, 2.25, 1.35, [s, 0, 0], 0.4);
    // door handle & seams
    box(0.05, 0.05, 0.22, STEEL, s * 1.24, 1.65, 1.15);
    box(0.03, 1.5, 0.03, DARK, s * 1.17, 1.9, 0.82);
    box(0.03, 1.5, 0.03, DARK, s * 1.17, 1.9, 1.95);
    // mirrors
    box(0.05, 0.4, 0.05, GUN, s * 1.32, 2.0, 2.0);
    box(0.08, 0.3, 0.2, GUN, s * 1.4, 2.1, 2.0);
    lamp(0.02, 0.22, 0.14, CYAN, s * 1.45, 2.1, 2.0, 0.8);
    // armoured window shutters
    box(0.07, 0.07, 0.95, GUN, s * 1.17, 2.55, 1.35);
    box(0.07, 0.07, 0.95, GUN, s * 1.17, 1.98, 1.35);
    // step
    box(0.3, 0.06, 0.6, STEEL, s * 1.3, 0.92, 1.5);
    // side exhaust stacks
    cyl(0.1, 2.2, 8, IRON, s * 1.12, 2.0, 0.28, [0, 1, 0]);
    cyl(0.12, 0.1, 8, AMBER, s * 1.12, 1.05, 0.28, [0, 1, 0]);
    cyl(0.12, 0.06, 8, AMBER, s * 1.12, 2.5, 0.28, [0, 1, 0]);
    cyl(0.08, 0.04, 8, "#ff6a1a", s * 1.12, 3.06, 0.28, [0, 1, 0]);
  }
  // windshield
  decal(GLASS, 2.05, 1.0, 0, 2.17, 2.32, [0, 0.6, 0.8], 0.55);
  box(2.25, 0.08, 0.1, GUN, 0, 2.62, 1.99, { rotation: [-53, 0, 0] });
  box(2.25, 0.08, 0.1, GUN, 0, 1.72, 2.62, { rotation: [-53, 0, 0] });
  // windshield wipers & brow armour
  box(0.04, 0.5, 0.04, DARK, -0.4, 1.95, 2.4, { rotation: [-53, 0, 20] });
  box(2.3, 0.1, 0.3, HAZARD, 0, 2.77, 1.9);
  // roof
  box(2.1, 0.1, 1.2, GUN, 0, 2.8, 1.15);
  lamp(1.9, 0.1, 0.1, MAG, 0, 2.9, 1.7, 1.4);
  for (let i = 0; i < 6; i++) lamp(0.22, 0.12, 0.12, i % 2 ? CYAN : RED, -0.85 + i * 0.34, 2.99, 1.7, 1.5);
  // roof vent & antennas
  box(0.7, 0.1, 0.5, DARK, 0.4, 2.88, 0.9);
  for (let i = 0; i < 5; i++) box(0.62, 0.015, 0.03, STEEL, 0.4, 2.94, 0.76 + i * 0.1);
  for (const [x, h] of [[-0.9, 1.4], [-0.75, 1.0], [0.95, 0.8]] as [number, number][]) {
    cyl(0.015, h, 5, STEEL, x, 2.85 + h / 2, 0.5, [0, 1, 0]);
    lamp(0.05, 0.05, 0.05, RED, x, 2.88 + h, 0.5, 1.8);
  }
  // radar dish
  b.lathe(
    [
      [0, 0],
      [0.1, 0.0],
      [0.32, 0.12],
      [0.3, 0.14],
      [0.08, 0.04],
      [0, 0.04],
    ],
    { at: [0.2, 3.2, 0.95], axis: [0.3, 0.8, 0.5], segments: 10, color: "#c8ccd4" },
  );
  cyl(0.04, 0.4, 6, STEEL, 0.2, 3.0, 0.95, [0, 1, 0]);
  lamp(0.05, 0.05, 0.2, CYAN, 0.28, 3.3, 1.12, 1.3);

  // hood and front
  box(2.0, 0.06, 0.9, DARK, 0, 1.68, 2.95, { rotation: [-16, 0, 0] });
  for (let i = 0; i < 5; i++) box(0.5, 0.03, 0.05, AMBER, -0.7 + i * 0.35, 1.72, 3.05, { rotation: [-16, 0, 0] });
  box(1.4, 0.03, 0.05, CYAN, 0, 1.75, 2.62, { rotation: [-16, 0, 0] });
  decal(GRILLE, 1.3, 0.45, 0, 1.27, 3.32, [0, 0, 1]);
  box(1.4, 0.05, 0.08, STEEL, 0, 1.52, 3.33);
  box(1.4, 0.05, 0.08, STEEL, 0, 1.03, 3.33);
  for (const s of [1, -1]) {
    lamp(0.36, 0.2, 0.06, "#f0ffff", s * 0.9, 1.3, 3.33, 1.6);
    box(0.44, 0.28, 0.05, DARK, s * 0.9, 1.3, 3.31);
    lamp(0.3, 0.04, 0.06, MAG, s * 0.9, 1.5, 3.34, 1.2);
    box(0.1, 0.5, 0.1, GUN, s * 1.1, 1.28, 3.3);
    lamp(0.08, 0.08, 0.06, AMBER, s * 1.12, 1.07, 3.37, 1.2);
  }
  // bumper ram wedge
  b.extrude(
    [
      [0, 0],
      [0.5, 0],
      [0.62, 0.4],
      [0.45, 0.62, "sharp"],
      [0, 0.62],
    ],
    { at: [-1.35, 0.55, 3.35], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.7, color: HAZARD, bevel: 0.02 },
  );
  box(2.8, 0.1, 0.1, STEEL, 0, 1.18, 3.95);
  for (const s of [1, -1]) {
    box(0.06, 0.5, 0.7, GUN, s * 0.9, 0.9, 3.7, { rotation: [0, 0, 0] });
    cyl(0.06, 0.55, 6, RED, s * 0.5, 0.82, 3.82, [0, 0, 1]);
  }
  for (let i = 0; i < 7; i++) box(0.12, 0.2, 0.3, GUN, -1.1 + i * 0.37, 0.74, 3.7 + (i % 2) * 0.05); // ram teeth
  // winch
  cyl(0.12, 0.9, 8, IRON, 0, 0.78, 3.6, [1, 0, 0]);
  cyl(0.15, 0.05, 8, AMBER, -0.47, 0.78, 3.6, [1, 0, 0]);
  cyl(0.15, 0.05, 8, AMBER, 0.47, 0.78, 3.6, [1, 0, 0]);
  // front plate number
  decal(PLATE, 0.42, 0.16, 0, 0.9, 4.02, [0, 0, 1]);
  // gun port + spotlight on cab roof
  cyl(0.12, 0.25, 8, GUN, -0.8, 2.95, 2.0, [0, 0, 1], { rotation: [0, 0, 0] });
  lamp(0.18, 0.18, 0.04, "#ffffff", -0.8, 2.95, 2.14, 1.8);

  // ---------- cargo module ----------
  box(2.5, 1.35, 3.35, CARGO, 0, 1.78, -1.7);
  box(2.58, 0.08, 3.4, GUN, 0, 2.48, -1.7);
  box(2.55, 0.15, 3.4, GUN, 0, 1.08, -1.7);
  for (let i = 0; i < 6; i++) {
    const z = -3.1 + i * 0.58;
    for (const s of [1, -1]) {
      box(0.1, 1.3, 0.1, GUN, s * 1.27, 1.78, z);
      box(0.04, 0.45, 0.4, DARK, s * 1.26, 1.5, z + 0.29); // vent slot
      lamp(0.03, 0.04, 0.26, i % 2 ? CYAN : MAG, s * 1.28, 2.0, z + 0.29, 1.2);
    }
  }
  // roof rails & crates
  for (const s of [1, -1]) {
    cyl(0.03, 3.3, 5, STEEL, s * 1.1, 2.62, -1.7, [0, 0, 1]);
    for (let i = 0; i < 5; i++) cyl(0.02, 0.15, 5, STEEL, s * 1.1, 2.55, -3.0 + i * 0.7, [0, 1, 0]);
  }
  box(0.8, 0.3, 0.7, "#4b5b3a", 0.7, 2.67, -2.7);
  box(0.82, 0.04, 0.72, AMBER, 0.7, 2.83, -2.7);
  box(0.6, 0.25, 0.5, "#3a3f55", 0.75, 2.62, -0.7);
  box(0.4, 0.04, 0.3, MAG, 0.75, 2.76, -0.7);
  // hatch
  box(0.7, 0.05, 0.7, DARK, -0.6, 2.54, -2.5);
  cyl(0.1, 0.05, 8, AMBER, -0.6, 2.58, -2.5, [0, 1, 0]);
  // side displays and warning
  for (const s of [1, -1]) {
    decal(SCREEN, 0.55, 0.36, s * 1.285, 2.15, -0.5, [s, 0, 0], 0.8);
    decal(WARN, 0.3, 0.3, s * 1.285, 1.4, -0.5, [s, 0, 0]);
    box(0.04, 0.2, 1.0, HAZARD, s * 1.28, 1.2, -2.3);
    box(0.04, 0.2, 1.0, HAZARD, s * 1.28, 1.2, -1.0);
  }

  // rocket pods
  for (const s of [1, -1]) {
    box(0.55, 0.65, 1.3, GUN, s * 1.62, 2.05, -1.2);
    box(0.4, 0.08, 1.0, HAZARD, s * 1.62, 2.4, -1.2);
    box(0.5, 0.08, 0.5, STEEL, s * 1.45, 1.75, -1.2);
    for (let ix = 0; ix < 2; ix++)
      for (let iy = 0; iy < 3; iy++) {
        const x = s * (1.62 + (ix - 0.5) * 0.24);
        const y = 1.85 + iy * 0.2;
        cyl(0.08, 0.1, 8, DARK, x, y, -0.55, [0, 0, 1]);
        cyl(0.055, 0.12, 6, "#ffd0c0", x, y, -0.52, [0, 0, 1]);
        glow(P(new THREE.ConeGeometry(0.05, 0.14, 6), AMBER, x, y, -0.45, { dir: [0, 0, 1] }), 1.2);
      }
  }

  // turret
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.06],
      [0.5, 0.1],
      [0.5, 0.2],
      [0, 0.2],
    ],
    { at: [0, 2.52, -1.2], segments: 12, color: IRON },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(0.06, 0.06, 0.06, i % 2 ? AMBER : STEEL, Math.cos(a) * 0.56, 2.58, -1.2 + Math.sin(a) * 0.56);
  }
  box(0.9, 0.42, 1.0, HULL, 0, 2.95, -1.25);
  box(0.95, 0.1, 1.05, GUN, 0, 3.2, -1.25);
  box(0.5, 0.22, 0.4, GUN, 0, 3.35, -1.4, { rotation: [0, 0, 0] });
  decal(EMBLEM, 0.3, 0.3, 0.46, 2.98, -1.3, [1, 0, 0]);
  lamp(0.26, 0.1, 0.08, CYAN, 0, 3.1, -0.72, 1.4); // sensor eye
  for (const s of [1, -1]) {
    box(0.18, 0.28, 0.5, GUN, s * 0.52, 3.0, -0.95);
    cyl(0.075, 1.6, 8, DARK, s * 0.32, 3.0, -0.45, [0, 0, 1]);
    cyl(0.11, 0.35, 8, GUN, s * 0.32, 3.0, -0.75, [0, 0, 1]);
    cyl(0.1, 0.18, 8, STEEL, s * 0.32, 3.0, 0.35, [0, 0, 1]);
    for (let k = 0; k < 4; k++) cyl(0.11, 0.03, 8, GUN, s * 0.32, 3.0, -0.3 + k * 0.15, [0, 0, 1]);
    glow(cyl(0.05, 0.04, 8, RED, s * 0.32, 3.0, 0.45, [0, 0, 1]), 1.5);
    box(0.1, 0.05, 0.6, AMBER, s * 0.32, 3.16, -0.2);
  }
  // ammo drum
  cyl(0.22, 0.4, 10, "#4b5b3a", 0.55, 2.9, -1.7, [1, 0, 0]);

  // ---------- rear ----------
  box(2.5, 1.1, 0.08, HAZARD, 0, 1.7, -3.42);
  box(1.0, 0.9, 0.06, DARK, 0, 1.75, -3.47);
  cyl(0.06, 0.8, 6, STEEL, -0.3, 1.75, -3.52, [0, 1, 0]);
  cyl(0.06, 0.8, 6, STEEL, 0.3, 1.75, -3.52, [0, 1, 0]);
  decal(PLATE, 0.5, 0.19, 0, 1.15, -3.5, [0, 0, -1]);
  for (const s of [1, -1]) {
    lamp(0.3, 0.14, 0.06, RED, s * 1.0, 1.5, -3.47, 1.6);
    lamp(0.3, 0.06, 0.06, RED, s * 1.0, 2.1, -3.47, 1.4);
    box(0.4, 0.2, 0.18, GUN, s * 1.0, 1.0, -3.55);
    cyl(0.1, 0.4, 8, IRON, s * 0.6, 0.8, -3.5, [0, 0, 1]);
    glow(cyl(0.07, 0.04, 8, "#ff6a1a", s * 0.6, 0.8, -3.7, [0, 0, 1]), 1);
  }
  box(2.6, 0.18, 0.3, HAZARD, 0, 0.95, -3.55);
  // tow hook
  cyl(0.06, 0.4, 6, STEEL, 0, 0.8, -3.65, [0, 0, 1]);
  P(new THREE.TorusGeometry(0.1, 0.03, 5, 8), STEEL, 0, 0.8, -3.9);

  // ---------- skirts and extras ----------
  for (const s of [1, -1]) {
    box(0.1, 0.3, 1.1, GUN, s * 1.2, 0.95, 0.6);
    box(0.1, 0.3, 1.0, GUN, s * 1.2, 0.95, -1.4);
    // storage lockers
    box(0.26, 0.4, 0.8, HULL, s * 1.3, 1.1, -1.4);
    box(0.02, 0.1, 0.1, AMBER, s * 1.44, 1.1, -1.7);
  }
  // hazard lamps on corners
  for (const s of [1, -1]) {
    lamp(0.1, 0.1, 0.1, AMBER, s * 1.3, 2.52, -3.4, 1.4);
    lamp(0.1, 0.1, 0.1, AMBER, s * 1.18, 2.78, 2.6, 1.4);
  }

  return b.root;
}

```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Nova-77 War Hauler",
  description: "Low-poly cyberpunk armored military truck from 2077: six wheels, armored cab, turret, rocket pods, neon trim.",
};

const GUN = "#252932";
const GUN2 = "#323844";
const DARK = "#111318";
const TIRE = "#0d0e11";
const CYAN = "#19f2ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb21a";
const RED = "#ff2438";
const GLASS = "#0c3a46";
const YEL = "#f2c200";
const OLIVE = "#3a4238";

const HAZARD = svg(
  `<svg viewBox="0 0 100 50"><defs><pattern id="p" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="20" fill="#f2c200"/><rect x="10" width="10" height="20" fill="#14151a"/></pattern></defs><rect width="100" height="50" fill="url(#p)"/><rect x="1" y="1" width="98" height="48" fill="none" stroke="#14151a" stroke-width="2"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 200 100"><rect width="200" height="100" fill="#1a1d24"/><rect x="3" y="3" width="194" height="94" fill="none" stroke="#19f2ff" stroke-width="2"/>
  <polygon points="40,12 62,24 62,50 40,62 18,50 18,24" fill="none" stroke="#ff2bd6" stroke-width="3"/>
  <path d="M28 44 L40 22 L52 44 L40 38Z" fill="#19f2ff"/>
  <text x="76" y="40" font-family="monospace" font-weight="bold" font-size="24" fill="#19f2ff">NOVA-77</text>
  <text x="76" y="62" font-family="monospace" font-size="13" fill="#ff2bd6">ARMORED LOGISTICS</text>
  <rect x="10" y="76" width="180" height="6" fill="#f2c200"/><path d="M10 88 H190" stroke="#19f2ff" stroke-width="1.5" stroke-dasharray="6 3"/></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 100 52"><rect width="100" height="52" fill="#0a3340"/><path d="M0 30 H100" stroke="#19f2ff" stroke-width="1.2"/>
  <path d="M0 40 L50 30 L100 40M0 48 L50 30 L100 48" stroke="#19f2ff" stroke-width="0.7" fill="none" opacity="0.8"/>
  <circle cx="50" cy="22" r="9" fill="none" stroke="#ff2bd6" stroke-width="1.2"/><path d="M50 10V34M38 22H62" stroke="#ff2bd6" stroke-width="0.8"/>
  <text x="4" y="9" font-family="monospace" font-size="5" fill="#19f2ff">SPD 088  HDG 271</text>
  <text x="70" y="9" font-family="monospace" font-size="5" fill="#ffb21a">THREAT: LOW</text>
  <path d="M0 0 L100 0 L100 52 L0 52Z M3 3 V49 H97 V3Z" fill="#06222b" fill-rule="evenodd"/></svg>`,
  { size: 256 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#0b0c10"/>${[6, 13, 20, 27, 34].map((y) => `<rect x="6" y="${y}" width="88" height="3.5" fill="#2a2e38"/>`).join("")}<rect x="6" y="37" width="88" height="2" fill="#ff2bd6"/><polygon points="50,4 58,14 50,24 42,14" fill="#19f2ff"/></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#e8e8e0" stroke="#111" stroke-width="2"/><text x="30" y="20" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#111">2077-W4R</text><rect width="60" height="5" fill="#19f2ff"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "nova77" });
  const HULL = panelled(metal("iron", { tarnish: 0.35 }), { size: 0.4, rivets: 0.1 });
  const CABP = panelled(metal("blued", { tarnish: 0.2 }), { size: 0.35, rivets: 0.09 });
  const STEEL = metal("steel", { tarnish: 0.4 });

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, len: number, seg: number, x: number, y: number, z: number, c: any, rot: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), c, { at: [x, y, z], rotation: rot });
  const plane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
  const neon = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, s = 1.5, rot?: number[]) =>
    glow(box(w, h, d, x, y, z, c, rot), s);

  // chassis frame
  box(2.3, 0.3, 7.0, 0, 0.95, 0, DARK);
  box(0.18, 0.28, 7.0, 0.8, 0.8, 0, GUN2);
  box(0.18, 0.28, 7.0, -0.8, 0.8, 0, GUN2);
  for (const z of [-3, -1.5, 0, 1.5, 3]) box(2.0, 0.14, 0.2, 0, 0.78, z, GUN);
  box(1.2, 0.3, 1.2, 0, 0.6, 1.9, DARK); // engine/diff blocks
  box(1.2, 0.3, 1.0, 0, 0.6, -1.5, DARK);
  cyl(0.06, 0.06, 2.8, 8, 0, 0.55, 0.5, STEEL, [0, 0, 90]);
  cyl(0.06, 0.06, 2.8, 8, 0, 0.55, -2.4, STEEL, [0, 0, 90]);
  cyl(0.06, 0.06, 2.8, 8, 0, 0.55, 2.3, STEEL, [0, 0, 90]);

  // cab
  const cab = b.extrude(
    [[0.5, 1.1], [3.5, 1.1], [3.5, 1.75], [3.2, 2.05], [2.55, 2.2], [1.95, 3.05], [0.6, 3.05], [0.5, 2.9]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bevel: 0.03, color: CABP },
  );
  void cab;
  // windshield
  box(2.1, 1.05, 0.04, 0, 2.62, 2.25, GLASS, [-35, 0, 0]);
  plane(HUD, 2.0, 1.0, [0, 2.65, 2.285], [0, 0.57, 0.82]);
  box(2.3, 0.07, 0.07, 0, 3.07, 1.93, GUN, [-35, 0, 0]);
  for (const s of [1, -1]) {
    // side windows, doors
    glow(box(0.04, 0.55, 1.15, s * 1.21, 2.6, 1.5, GLASS), 0.4);
    box(0.06, 0.04, 1.3, s * 1.215, 2.28, 1.5, GUN);
    box(0.06, 1.2, 0.04, s * 1.215, 1.8, 0.95, DARK);
    box(0.06, 1.2, 0.04, s * 1.215, 1.8, 2.1, DARK);
    box(0.1, 0.06, 0.25, s * 1.23, 2.0, 1.1, YEL); // handle
    // armor plates & skirts
    box(0.12, 0.7, 1.9, s * 1.26, 1.5, 1.6, GUN2, [0, 0, s * 4]);
    box(0.1, 0.12, 2.4, s * 1.27, 1.2, 1.3, GUN);
    neon(0.03, 0.05, 2.3, s * 1.335, 1.2, 1.3, CYAN, 1.8);
    // mirrors
    box(0.05, 0.05, 0.5, s * 1.3, 2.7, 2.2, DARK, [0, 0, 0]);
    box(0.28, 0.4, 0.1, s * 1.5, 2.6, 2.35, GUN);
    glow(box(0.02, 0.32, 0.02, s * 1.5, 2.6, 2.4, GLASS), 0.8);
    // fender & wheel arches
    box(0.7, 0.12, 1.7, s * 1.45, 1.4, 2.3, GUN2);
    box(0.7, 0.12, 1.7, s * 1.45, 1.4, -0.6, GUN2);
    box(0.7, 0.12, 1.7, s * 1.45, 1.4, -2.4, GUN2);
    box(0.06, 0.3, 1.7, s * 1.78, 1.28, 2.3, GUN);
    box(0.06, 0.3, 1.7, s * 1.78, 1.28, -0.6, GUN);
    box(0.06, 0.3, 1.7, s * 1.78, 1.28, -2.4, GUN);
    // headlights
    neon(0.5, 0.18, 0.08, s * 0.85, 1.6, 3.52, CYAN, 2);
    neon(0.2, 0.1, 0.08, s * 1.1, 1.95, 3.25, MAG, 1.6, [-30, 0, 0]);
    // exhaust stacks
    cyl(0.1, 0.1, 1.8, 8, s * 1.1, 3.0, 0.38, STEEL, [0, 0, 0]);
    cyl(0.14, 0.1, 0.12, 8, s * 1.1, 3.95, 0.38, DARK, [0, 0, 0]);
    glow(cyl(0.06, 0.06, 0.02, 8, s * 1.1, 4.02, 0.38, AMBER, [0, 0, 0]), 1.2);
    for (const y of [2.2, 2.7, 3.2]) cyl(0.12, 0.12, 0.05, 8, s * 1.1, y, 0.38, GUN2, [0, 0, 0]);
    // fuel tanks
    cyl(0.24, 0.24, 1.3, 8, s * 1.12, 0.78, 0.9, OLIVE, [90, 0, 0]);
    box(0.06, 0.1, 1.3, s * 1.0, 0.95, 0.9, GUN);
    // front bumper claws
    box(0.3, 0.35, 0.7, s * 1.1, 1.0, 3.7, GUN2, [0, s * 20, 0]);
    box(0.12, 0.12, 0.5, s * 1.1, 0.9, 4.0, YEL, [0, s * 20, 0]);
    // underglow
    neon(0.05, 0.05, 5.8, s * 1.21, 0.65, -0.2, MAG, 2);
    // rear tail lights
    neon(0.45, 0.2, 0.08, s * 0.85, 1.55, -3.54, RED, 2);
    neon(0.45, 0.06, 0.08, s * 0.85, 1.75, -3.54, AMBER, 1.5);
    // cargo side plates
    for (let i = 0; i < 4; i++) {
      const z = -2.9 + i * 0.85;
      box(0.06, 1.0 + (i % 2) * 0.3, 0.75, s * 1.23, 2.0 + (i % 2) * 0.15, z, i % 2 ? GUN2 : GUN);
      neon(0.02, 0.05, 0.6, s * 1.265, 1.45, z, i % 2 ? CYAN : MAG, 1.4);
    }
    plane(EMBLEM, 1.4, 0.7, [s * 1.27, 2.55, -1.6], [s, 0, 0]);
    // cab roof sensor
    cyl(0.07, 0.07, 0.4, 6, s * 0.7, 3.25, 1.2, GUN, [0, 0, 0]);
    glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [s * 0.7, 3.5, 1.2] }), 2);
    // rocket pods
    box(0.8, 0.55, 1.4, s * 0.75, 3.2, -2.6, GUN2);
    box(0.84, 0.08, 1.44, s * 0.75, 3.5, -2.6, GUN);
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 3; c++) {
        const x = s * 0.75 + (c - 1) * 0.24;
        const y = 3.1 + r * 0.24;
        cyl(0.09, 0.09, 0.06, 8, x, y, -1.9, DARK, [90, 0, 0]);
        glow(cyl(0.04, 0.04, 0.04, 6, x, y, -1.88, AMBER, [90, 0, 0]), 1.3);
      }
    box(0.9, 0.12, 0.3, s * 0.75, 2.97, -2.6, DARK);
    // bumper hooks bolts
    for (const y of [1.35, 1.55]) box(0.1, 0.1, 0.1, s * 0.4, y, 3.55, STEEL);
  }

  // cab roof extras
  box(2.2, 0.12, 0.35, 0, 3.12, 1.7, GUN);
  neon(2.0, 0.07, 0.1, 0, 3.2, 1.78, AMBER, 1.6);
  for (let i = 0; i < 6; i++) neon(0.28, 0.08, 0.1, -0.85 + i * 0.34, 3.22, 1.78, i % 2 ? CYAN : MAG, 1.8);

  // hood details
  box(1.4, 0.1, 0.9, 0, 2.02, 3.0, GUN, [-10, 0, 0]);
  for (let i = 0; i < 4; i++) box(1.1, 0.04, 0.05, 0, 2.08 + 0.0, 2.75 + i * 0.2, DARK, [-10, 0, 0]);
  neon(1.9, 0.04, 0.04, 0, 1.88, 3.45, CYAN, 1.8);
  // grille, bumper
  plane(GRILLE, 1.8, 0.7, [0, 1.45, 3.515], [0, 0, 1]);
  box(2.5, 0.35, 0.35, 0, 1.0, 3.6, GUN2);
  box(2.4, 0.2, 0.2, 0, 0.78, 3.75, GUN, [-20, 0, 0]);
  neon(1.6, 0.05, 0.05, 0, 1.0, 3.79, MAG, 2);
  cyl(0.12, 0.12, 1.2, 8, 0, 0.95, 3.85, STEEL, [0, 0, 90]);

  // cargo box
  b.part(new THREE.BoxGeometry(2.4, 1.9, 3.7), HULL, { at: [0, 2.05, -1.65] });
  box(2.5, 0.12, 3.8, 0, 3.05, -1.65, GUN);
  box(2.5, 0.2, 3.8, 0, 1.05 + 0.1, -1.65, DARK);
  // roof ridges & vents
  for (let i = 0; i < 5; i++) box(2.2, 0.06, 0.08, 0, 3.14, -3.3 + i * 0.75, GUN2);
  for (let i = 0; i < 4; i++) box(0.5, 0.08, 0.08, -0.5 + (i % 2) * 1.0, 3.18, -0.5 + (i > 1 ? 0.3 : 0), DARK);
  // rear door
  box(2.2, 1.7, 0.08, 0, 2.05, -3.53, GUN2);
  plane(HAZARD, 2.0, 0.4, [0, 1.45, -3.58], [0, 0, -1]);
  plane(PLATE, 0.5, 0.25, [0, 1.15, -3.6], [0, 0, -1]);
  box(0.06, 1.6, 0.1, 0, 2.1, -3.58, DARK);
  for (const s of [1, -1]) {
    box(0.12, 0.2, 0.15, s * 0.5, 2.25, -3.6, YEL);
    box(0.1, 1.5, 0.12, s * 1.1, 2.1, -3.6, STEEL);
  }
  box(2.3, 0.18, 0.3, 0, 1.05, -3.7, GUN);
  neon(2.0, 0.04, 0.05, 0, 1.05, -3.87, MAG, 2);

  // turret
  b.lathe([[0, 0], [0.55, 0], [0.55, 0.12], [0.4, 0.22], [0, 0.22]], { at: [0, 3.14, -1.0], color: GUN2, segments: 10 });
  box(0.9, 0.38, 1.0, 0, 3.55, -1.0, GUN);
  box(0.7, 0.2, 0.7, 0, 3.8, -1.05, GUN2, [8, 0, 0]);
  box(0.6, 0.06, 0.06, 0, 3.55, -0.48, CYAN);
  glow(b.part(new THREE.SphereGeometry(0.12, 6, 4), CYAN, { at: [0, 3.65, -0.5] }), 2);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 1.5, 8, s * 0.3, 3.55, 0.0, STEEL, [90, 0, 0]);
    cyl(0.11, 0.11, 0.25, 8, s * 0.3, 3.55, 0.7, DARK, [90, 0, 0]);
    cyl(0.1, 0.1, 0.5, 8, s * 0.3, 3.55, -0.4, GUN, [90, 0, 0]);
    neon(0.03, 0.03, 0.4, s * 0.45, 3.55, -0.55, MAG, 2);
    box(0.25, 0.3, 0.2, s * 0.55, 3.45, -1.0, GUN2);
  }

  // radar mast and antennas
  cyl(0.04, 0.05, 0.9, 6, 0, 3.6, -3.2, STEEL, [0, 0, 0]);
  b.part(new THREE.SphereGeometry(0.4, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0, 4.05, -3.2], rotation: [70, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0, 4.15, -3.05] }), 2);
  for (const s of [1, -1]) {
    cyl(0.015, 0.025, 2.2, 5, s * 1.15, 3.1 + 1.1, -3.4, DARK, [0, 0, s * 4]);
    glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), s > 0 ? MAG : CYAN, { at: [s * 1.28, 5.3, -3.4] }), 2);
  }

  // wheels
  const hub = metal("steel", { polish: 0.7 });
  for (const s of [1, -1])
    for (const z of [2.3, -0.6, -2.4]) {
      const x = s * 1.45;
      cyl(0.65, 0.65, 0.5, 10, x, 0.65, z, TIRE, [0, 0, 90]);
      cyl(0.66, 0.66, 0.2, 10, x, 0.65, z, "#17181d", [0, 0, 90]);
      cyl(0.4, 0.4, 0.06, 10, s * 1.7, 0.65, z, hub, [0, 0, 90]);
      glow(cyl(0.26, 0.26, 0.04, 10, s * 1.73, 0.65, z, s > 0 ? CYAN : MAG, [0, 0, 90]), 1.6);
      cyl(0.1, 0.1, 0.1, 6, s * 1.76, 0.65, z, DARK, [0, 0, 90]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        box(0.06, 0.07, 0.07, s * 1.74, 0.65 + Math.sin(a) * 0.33, z + Math.cos(a) * 0.33, YEL);
      }
    }

  return b.root;
}
```
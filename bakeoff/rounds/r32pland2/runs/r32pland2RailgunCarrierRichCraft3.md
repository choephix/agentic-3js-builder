```ts
import * as THREE from "three";
import { createBuilder, svg, paint, mix, noise, smoothstep, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with an elevated twin-rail railgun, capacitor bank, cab, and four deployed stabiliser legs plus a rear spade.",
};

// ---------- palette ----------
const OLIVE = "#5b6b3a";
const OLIVE_D = "#3a4727";
const TAN = "#8f7f55";
const GUN = "#2b2f36";
const STEEL = "#8a909a";
const STEEL_D = "#555b64";
const RUBBER = "#18181a";
const HAZ = "#e8b21c";
const CYAN = "#5fe8ff";
const RED = "#ff3a2a";
const ORANGE = "#ff9a1e";
const CABLE = "#101216";

const CAMO = paint((p, n) => {
  const a = noise(p, 0.9, 3);
  const base = a < 0.36 ? OLIVE_D : a > 0.68 ? TAN : OLIVE;
  const dusty = smoothstep(0.9, 0.0, p.y) * 0.25;
  const shade = smoothstep(0.1, -0.9, n.y) * 0.45;
  return mix(mix(base, "#9a8a64", dusty), "#14170f", shade);
});

// ---------- textures ----------
const CHEV = svg(
  `<svg viewBox="0 0 128 24"><rect width="128" height="24" fill="#16161a"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 12 - 8} 24 L${i * 12 + 4} 0 L${i * 12 + 10} 0 L${i * 12 - 2} 24Z" fill="${HAZ}"/>`).join("")}
  <rect width="128" height="24" fill="none" stroke="#16161a" stroke-width="3"/></svg>`,
  { size: 256 },
);
const STAR = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#d9d4c0" stroke="#16161a" stroke-width="3"/>
  <circle cx="32" cy="32" r="21" fill="#2b3a5a"/>
  <path d="M32 12 L37 27 L53 27 L40 36 L45 51 L32 42 L19 51 L24 36 L11 27 L27 27Z" fill="#d9d4c0"/></svg>`,
  { size: 128 },
);
const SERIAL = svg(
  `<svg viewBox="0 0 160 48"><rect x="2" y="2" width="156" height="44" rx="4" fill="none" stroke="#e6e2d0" stroke-width="3"/>
  <text x="80" y="35" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#e6e2d0">RG-06</text></svg>`,
  { size: 256 },
);
const WINDSCREEN = svg(
  `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#10202c" stroke="#0a0c10" stroke-width="5"/>
  <rect x="62" y="0" width="4" height="64" fill="#0a0c10"/>
  <path d="M8 56 L30 6 L40 6 L18 56Z" fill="#6fb6d8" opacity="0.4"/>
  <path d="M74 56 L96 6 L102 6 L80 56Z" fill="#6fb6d8" opacity="0.3"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" rx="4" fill="#10202c" stroke="#0a0c10" stroke-width="4"/>
  <path d="M8 36 L22 6 L30 6 L16 36Z" fill="#6fb6d8" opacity="0.4"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#06140e"/>
  <circle cx="32" cy="24" r="20" fill="none" stroke="#39ff8a" stroke-width="1.5"/>
  <circle cx="32" cy="24" r="11" fill="none" stroke="#39ff8a" stroke-width="1"/>
  <path d="M32 24 L50 12" stroke="#9dffc4" stroke-width="2"/><circle cx="44" cy="30" r="2.4" fill="#9dffc4"/>
  <rect x="2" y="2" width="60" height="44" fill="none" stroke="#39ff8a" stroke-width="2"/></svg>`,
  { size: 128 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 64 28"><rect width="64" height="28" fill="#15171c" stroke="#05060a" stroke-width="3"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="5" y="${4 + i * 3.3}" width="54" height="1.8" fill="#4a505a"/>`).join("")}</svg>`,
  { size: 128 },
);
const HUB = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#6a7079" stroke="#15171c" stroke-width="2"/>
  <circle cx="32" cy="32" r="9" fill="#2b2f36"/>
  ${Array.from({ length: 8 }, (_, i) => `<circle cx="${32 + 21 * Math.cos((i * Math.PI) / 4)}" cy="${32 + 21 * Math.sin((i * Math.PI) / 4)}" r="3.2" fill="#2b2f36"/>`).join("")}</svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 56"><path d="M32 3 L61 53 L3 53Z" fill="${HAZ}" stroke="#16161a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M34 14 L22 36 L31 36 L28 48 L42 26 L33 26Z" fill="#16161a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- skeleton ----------
  const hull = b.joint("hull", { at: [0, 1.2, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 2.0, -1.2], dir: [0, 1, 0] });
  const tilt = (18 * Math.PI) / 180;
  const gun = b.joint("gun", {
    parent: turret,
    at: [0, 3.25, -0.4],
    dir: [0, Math.sin(tilt), Math.cos(tilt)],
  });
  const G = (r: number, a: number, u: number) => gun.local([r, a, u]);

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], bone: any = hull, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opts });
  const cyl = (r: number, h: number, color: any, at: number[], bone: any = hull, dir: number[] = [0, 1, 0], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir, flat: true });
  const decal = (
    tex: THREE.Texture,
    w: number,
    h: number,
    at: number[],
    dir: number[],
    bone: any = hull,
    up?: number[],
    color = "#ffffff",
  ) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { bone, at, dir, axis: "z", up, texture: tex });
  const gbox = (a0: number, a1: number, r: number, u: number, w: number, h: number, color: any) =>
    b.frustumBox(G(r, a0, u), G(r, a1, u), [w, h], [w, h], { bone: gun, color });

  // ---------- chassis ----------
  box(2.2, 0.5, 8.5, GUN, [0, 0.95, 0.1]);
  box(1.6, 0.18, 8.7, STEEL_D, [0, 0.66, 0.1]);
  for (const z of [2.9, 0.1, -2.7]) box(3.1, 0.14, 0.2, GUN, [0, 0.65, z]);

  // ---------- hull body ----------
  box(2.6, 0.9, 6.0, CAMO, [0, 1.55, -1.0]);
  // sloped sides armour (upper skirt)
  for (const s of [1, -1]) {
    box(0.12, 0.5, 5.8, CAMO, [s * 1.34, 1.7, -1.0]);
    box(0.1, 0.12, 5.9, STEEL_D, [s * 1.36, 1.37, -1.0]);
    decal(STAR, 0.7, 0.7, [s * 1.41, 1.72, -3.1], [s, 0, 0]);
    decal(SERIAL, 0.9, 0.27, [s * 1.41, 1.5, 0.95], [s, 0, 0]);
    decal(WARN, 0.28, 0.25, [s * 1.41, 1.72, 1.75], [s, 0, 0]);
    // wheel arch fenders
    for (const z of [2.9, 0.1, -2.7]) {
      box(0.75, 0.1, 1.7, CAMO, [s * 1.58, 1.42, z]);
      box(0.75, 0.3, 0.08, CAMO, [s * 1.58, 1.3, z + 0.85]);
      box(0.75, 0.3, 0.08, CAMO, [s * 1.58, 1.3, z - 0.85]);
    }
    // tool boxes + handrails on deck
    box(0.6, 0.35, 0.9, STEEL_D, [s * 0.95, 2.18, 1.35]);
    b.rod([s * 1.2, 2.05, -3.6], [s * 1.2, 2.45, -3.6], 0.03, STEEL);
    b.rod([s * 1.2, 2.45, -3.6], [s * 1.2, 2.45, 1.8], 0.03, STEEL);
    b.rod([s * 1.2, 2.05, 1.8], [s * 1.2, 2.45, 1.8], 0.03, STEEL);
    // side indicator lights
    glow(box(0.06, 0.1, 0.22, CYAN, [s * 1.4, 1.95, -0.4]), 1.4);
    glow(box(0.06, 0.1, 0.22, CYAN, [s * 1.4, 1.95, -3.2]), 1.4);
    // exhaust stacks
    cyl(0.12, 1.3, GUN, [s * 1.05, 2.65, 1.95], hull, [0, 1, 0], 8);
    cyl(0.16, 0.12, STEEL_D, [s * 1.05, 3.3, 1.95], hull, [0, 1, 0], 8);
    cyl(0.17, 0.1, STEEL_D, [s * 1.05, 2.1, 1.95], hull, [0, 1, 0], 8);
  }
  box(2.5, 0.3, 0.1, GUN, [0, 1.6, -4.05]);
  // rear lights & plate
  for (const s of [1, -1]) {
    glow(box(0.3, 0.16, 0.06, RED, [s * 1.0, 1.85, -4.04]), 1.6);
    box(0.34, 0.2, 0.05, GUN, [s * 1.0, 1.85, -4.02]);
    b.rod([s * 0.5, 1.2, -4.0], [s * 0.5, 1.2, -4.5], 0.07, STEEL_D);
  }
  decal(CHEV, 2.0, 0.3, [0, 1.35, -4.06], [0, 0, -1]);

  // deck roof panels
  box(2.2, 0.05, 1.3, STEEL_D, [0, 2.03, 1.1]);
  decal(CHEV, 1.4, 0.22, [0, 2.06, 0.7], [0, 1, 0], hull, [0, 0, 1]);

  // ---------- cab ----------
  b.extrude(
    [
      [2.0, 1.15],
      [2.0, 3.0],
      [2.9, 3.05],
      [4.0, 2.45],
      [4.3, 1.95],
      [4.3, 1.15],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, bevel: 0.05, color: CAMO, bone: hull },
  );
  decal(WINDSCREEN, 2.3, 1.25, [0, 2.76, 3.46], [0, 0.88, 0.48], hull);
  decal(GRILLE, 1.3, 0.55, [0, 2.2, 4.17], [0, 0.51, 0.86], hull);
  box(2.9, 0.4, 0.4, GUN, [0, 1.3, 4.35]);
  decal(CHEV, 2.6, 0.26, [0, 1.3, 4.56], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(box(0.45, 0.2, 0.12, "#fff6c8", [s * 0.95, 2.2, 4.16]), 1.6);
    glow(box(0.2, 0.12, 0.1, ORANGE, [s * 1.2, 1.68, 4.36]), 1.4);
    decal(SIDEWIN, 1.0, 0.62, [s * 1.31, 2.55, 3.0], [s, 0, 0]);
    box(0.08, 0.08, 0.3, STEEL, [s * 1.33, 2.1, 2.55]); // door handle
    // mirror arm
    b.rod([s * 1.3, 2.7, 3.55], [s * 1.62, 2.8, 3.55], 0.025, GUN);
    box(0.1, 0.4, 0.22, GUN, [s * 1.66, 2.78, 3.55]);
    // jerry cans on cab rear
    box(0.3, 0.4, 0.2, OLIVE_D, [s * 0.55, 2.2, 1.9]);
  }
  // cab roof gear
  glow(box(1.0, 0.1, 0.18, ORANGE, [0, 3.1, 2.95]), 1.3);
  cyl(0.04, 0.8, STEEL, [0.8, 3.45, 2.3]);
  b.lathe(
    [
      [0, 0],
      [0.42, 0.14],
      [0.42, 0.18],
      [0, 0.05],
    ],
    { at: [-0.6, 3.35, 2.4], bone: hull, color: STEEL, axis: [0, 1, 0.4] },
  );
  cyl(0.05, 0.32, GUN, [-0.6, 3.17, 2.4]);
  box(0.6, 0.28, 0.4, GUN, [0.1, 3.18, 2.35]);
  decal(SCREEN, 0.5, 0.36, [0.1, 3.18, 2.552], [0, 0, 1]);
  glow(box(0.06, 0.02, 0.02, "#39ff8a", [0.1, 3.34, 2.4]), 1);

  // ---------- wheels ----------
  for (const s of [1, -1]) {
    [2.9, 0.1, -2.7].forEach((z, i) => {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, {
        parent: hull,
        at: [s * 1.55, 0.65, z],
        dir: [s, 0, 0],
      });
      const X = [s, 0, 0];
      cyl(0.65, 0.55, RUBBER, [s * 1.55, 0.65, z], w, X, 14);
      for (const o of [-0.17, 0, 0.17]) cyl(0.68, 0.1, "#0c0c0e", [s * (1.55 + o), 0.65, z], w, X, 14);
      cyl(0.4, 0.6, STEEL_D, [s * 1.55, 0.65, z], w, X, 10);
      b.part(new THREE.CircleGeometry(0.38, 12), "#ffffff", {
        bone: w,
        at: [s * 1.855, 0.65, z],
        dir: X,
        axis: "z",
        texture: HUB,
      });
      cyl(0.1, 1.9, STEEL_D, [0, 0.65, z], hull, X, 8);
      // front axle steering rods
      if (i === 0) b.rod([s * 0.5, 0.85, z - 0.25], [s * 1.5, 0.85, z - 0.25], 0.04, STEEL);
    });
  }

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    [1.5, -1.3].forEach((z, i) => {
      const nm = `stab${s > 0 ? "L" : "R"}${i + 1}`;
      const px = s * 2.55;
      const leg = b.joint(nm, { parent: hull, at: [px, 1.3, z], dir: [0, -1, 0] });
      box(1.5, 0.36, 0.46, CAMO, [s * 1.9, 1.3, z]);
      box(0.5, 0.5, 0.56, GUN, [s * 1.4, 1.35, z]);
      decal(CHEV, 1.1, 0.22, [s * 1.95, 1.485, z], [0, 1, 0], hull, [0, 0, 1]);
      b.rod([s * 1.32, 1.95, z], [px - s * 0.05, 1.4, z], 0.08, STEEL);
      cyl(0.19, 0.75, STEEL_D, [px, 0.95, z], leg, [0, 1, 0], 8);
      cyl(0.11, 0.6, STEEL, [px, 0.45, z], leg, [0, 1, 0], 8);
      cyl(0.55, 0.2, GUN, [px, 0.1, z], leg, [0, 1, 0], 8);
      cyl(0.58, 0.07, HAZ, [px, 0.2, z], leg, [0, 1, 0], 8);
      box(0.4, 0.14, 0.3, GUN, [px, 1.55, z], leg);
    });
  }
  // rear spade
  b.extrude(
    [
      [-1.25, 0],
      [1.25, 0],
      [1.0, 1.0],
      [-1.0, 1.0],
    ],
    { at: [0, 0, -4.5], x: [1, 0, 0], thickness: 0.16, bevel: 0.03, color: CAMO, bone: hull },
  );
  for (const s of [1, -1]) b.rod([s * 0.6, 1.3, -4.1], [s * 0.6, 0.6, -4.45], 0.08, STEEL_D);
  decal(CHEV, 1.8, 0.2, [0, 0.8, -4.6], [0, 0, -1]);

  // ---------- capacitor bank ----------
  box(2.2, 0.9, 1.3, CAMO, [0, 2.45, -3.3]);
  decal(GRILLE, 1.0, 0.45, [0, 2.45, -3.96], [0, 0, -1]);
  for (const s of [1, -1]) {
    for (const z of [-3.0, -3.6]) {
      cyl(0.3, 0.55, GUN, [s * 0.55, 3.1, z], hull, [0, 1, 0], 8);
      glow(cyl(0.32, 0.1, CYAN, [s * 0.55, 3.15, z], hull, [0, 1, 0], 8), 1.5);
      cyl(0.2, 0.08, STEEL, [s * 0.55, 3.42, z], hull, [0, 1, 0], 8);
    }
    glow(box(0.06, 0.4, 0.8, CYAN, [s * 1.12, 2.45, -3.3]), 1.3);
    b.sweep(
      catmull([
        [s * 0.55, 3.45, -3.0],
        [s * 0.5, 3.75, -2.5],
        [s * 0.3, 3.5, -2.0],
        [s * 0.3, 3.1, -1.6],
      ]),
      0.045,
      { color: CABLE, bone: hull, sides: 6 },
    );
  }

  // ---------- turret ----------
  cyl(1.25, 0.2, GUN, [0, 2.1, -1.2], hull, [0, 1, 0], 14);
  b.extrude(
    [
      [-1.4, 0.1],
      [1.3, 0.1],
      [1.3, 0.6],
      [0.7, 1.0],
      [-0.9, 1.1],
      [-1.4, 0.7],
    ],
    { at: [0, 2.0, -1.2], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: CAMO, bone: turret },
  );
  for (const s of [1, -1]) {
    box(0.22, 0.9, 1.3, CAMO, [s * 0.88, 3.05, -0.45], turret); // trunnion blocks
    cyl(0.2, 0.2, STEEL, [s * 1.0, 3.25, -0.4], turret, [s, 0, 0], 8);
    // smoke dischargers
    for (let k = 0; k < 3; k++) cyl(0.07, 0.3, GUN, [s * 1.2, 2.8 + k * 0.001, -1.7 + k * 0.2], turret, [s * 0.5, 1, 0.1], 6);
    glow(box(0.06, 0.1, 0.5, CYAN, [s * 1.17, 2.45, -1.3]), 1.2);
    decal(STAR, 0.45, 0.45, [s * 1.171, 2.7, -1.2], [s, 0, 0], turret);
  }
  // hatch & sensor
  cyl(0.3, 0.12, STEEL_D, [-0.5, 3.15, -2.0], turret, [0, 1, 0], 8);
  cyl(0.2, 0.12, GUN, [-0.5, 3.25, -2.0], turret, [0, 1, 0], 8);
  box(0.4, 0.3, 0.4, GUN, [0.55, 3.2, -1.9], turret);
  glow(box(0.2, 0.1, 0.04, RED, [0.55, 3.22, -1.69]), 1.4);
  b.rod([0.9, 3.1, -2.4], [0.9, 4.5, -2.4], 0.02, STEEL, { bone: turret });
  decal(WARN, 0.3, 0.26, [0, 2.65, 0.11], [0, 0, 1], turret);

  // ---------- railgun ----------
  gbox(-1.1, 0.6, 0, 0, 1.3, 1.2, CAMO);
  gbox(-1.2, -1.0, 0, 0, 1.0, 0.9, GUN);
  glow(gbox(-0.9, -0.5, 0, 0.62, 0.7, 0.05, CYAN), 1.3);
  gbox(0.4, 6.4, 0, 0, 0.42, 0.38, GUN);
  for (const r of [0.34, -0.34]) {
    gbox(0.4, 6.4, r, 0.0, 0.26, 0.62, STEEL);
    gbox(0.5, 6.3, r, 0.33, 0.14, 0.05, "#c9ced6");
  }
  glow(gbox(0.6, 6.2, 0, 0.2, 0.1, 0.05, CYAN), 1.8);
  for (let i = 0; i < 7; i++) {
    const a = 0.9 + i * 0.85;
    gbox(a, a + 0.3, 0, 0, 1.15, 1.0, i % 2 ? STEEL_D : CAMO);
    glow(gbox(a + 0.08, a + 0.22, 0, 0, 1.2, 0.5, CYAN), 1.4);
  }
  gbox(6.2, 6.9, 0, 0, 1.0, 0.9, GUN);
  gbox(6.7, 6.95, 0, 0, 0.7, 0.7, STEEL);
  glow(gbox(6.93, 6.97, 0, 0, 0.3, 0.3, "#ffffff"), 2);
  // elevation rams
  for (const r of [0.6, -0.6]) {
    const top = G(r, -0.5, -0.45);
    b.rod([-r, 2.55, -1.7], top, 0.11, STEEL_D, { bone: turret });
    b.rod([-r, 2.7, -1.5], top, 0.07, STEEL, { bone: gun });
  }
  // side sensors on barrel
  for (const r of [0.75, -0.75]) gbox(1.0, 1.6, r, 0.1, 0.25, 0.3, GUN);
  decal(CHEV, 0.9, 0.16, G(0, 0.0, 0.605), gun.dir([0, 0, 1]), gun, undefined);

  return b.root;
}
```
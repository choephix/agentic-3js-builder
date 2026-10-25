```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull, grain, countershade, patches, svg, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a rotating turret, elevating twin-rail railgun with capacitor bands, and four deployed stabiliser legs.",
};

type V = [number, number, number];

// ---------- palette ----------
const DARK = "#2b3036";
const DARKER = "#1b1f24";
const STEEL = "#8b95a0";
const GUN = "#3c444d";
const YEL = "#e2b21c";
const CYAN = "#58e8ff";
const RED = "#e03a30";
const AMBER = "#ffb23a";
const TIRE = "#17191c";
const TIRE2 = "#23262b";
const CAMO = countershade(
  patches("#3b4630", ["#58623a", "#2c3724", "#75694a"], { size: 1.2, gap: 0.02, seed: 4 }),
  "#262d20",
  { level: -0.4 },
);
const CAMO2 = countershade(patches("#323c29", ["#46512f", "#252f1f"], { size: 0.9, gap: 0.02, seed: 9 }), "#1f261b", {
  level: -0.3,
});
const RAIL = grain("#69737e", "#3c424a", { size: 0.06, axis: "z" });

// ---------- textures ----------
const WS = svg(
  `<svg viewBox="0 0 100 78"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd8ff"/><stop offset="1" stop-color="#1a3556"/></linearGradient></defs>
  <rect width="100" height="78" rx="6" fill="#12161b"/><rect x="4" y="4" width="92" height="70" rx="4" fill="url(#g)"/>
  <path d="M4 52 L52 4 L72 4 L4 72Z" fill="#fff" opacity=".16"/><path d="M50 4 V74" stroke="#12161b" stroke-width="3"/>
  <path d="M8 72 L46 42 M92 72 L56 42" stroke="#080a0d" stroke-width="2.5"/>
  <path d="M10 14 H30 M70 14 H90" stroke="#58e8ff" stroke-width="2" opacity=".7"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ee"/><stop offset="1" stop-color="#1a3556"/></linearGradient></defs>
  <rect width="100" height="40" rx="4" fill="#12161b"/><rect x="3" y="3" width="94" height="34" rx="3" fill="url(#g)"/>
  <path d="M3 30 L28 3 L44 3 L3 37Z" fill="#fff" opacity=".18"/><path d="M52 3 V37" stroke="#12161b" stroke-width="3"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#1b2127" stroke="#e2b21c" stroke-width="5"/>
  <path d="M22 62 L50 30 L78 62 L78 72 L50 44 L22 72Z" fill="#e2b21c"/><path d="M30 80 L50 58 L70 80" fill="none" stroke="#58e8ff" stroke-width="5"/>
  <circle cx="50" cy="24" r="4" fill="#58e8ff"/>
  <text x="50" y="96" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff">RG-6</text></svg>`,
  { size: 256 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e2b21c"/>
  <path d="M0 16 L8 0 L16 0 L8 16Z M16 16 L24 0 L32 0 L24 16Z M32 16 L40 0 L48 0 L40 16Z M48 16 L56 0 L64 0 L56 16Z" fill="#15181c"/></svg>`,
  { size: 128 },
);
const CELLS = svg(
  `<svg viewBox="0 0 100 60"><rect width="100" height="60" rx="4" fill="#0d1318"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7]
    .map(
      (i) =>
        `<rect x="${7 + i * 11.2}" y="${8 + (i % 3) * 6}" width="7" height="${44 - (i % 3) * 6}" rx="1.5" fill="#58e8ff" opacity="${0.6 + (i % 2) * 0.35}"/>`,
    )
    .join("")}</svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 100 34"><rect width="100" height="34" rx="3" fill="#15181c"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="6" y="${4 + i * 6}" width="88" height="3" fill="#3d454e"/>`).join("")}
  <path d="M44 2 L50 12 L56 2" stroke="#e2b21c" stroke-width="2.5" fill="none"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- skeleton ----------
  const EL = (13 * Math.PI) / 180;
  const D: V = [0, Math.sin(EL), Math.cos(EL)];
  const U: V = [0, Math.cos(EL), -Math.sin(EL)];
  const pivot: V = [0, 4.0, -1.8];
  const P = (d: number, l = 0, u = 0): V => [l, pivot[1] + D[1] * d + U[1] * u, pivot[2] + D[2] * d + U[2] * u];

  const chassis = b.joint("chassis", { at: [0, 1.2, 0], dir: [0, 0, 1], role: "spine" });
  const turret = b.joint("turret", { parent: chassis, at: [0, 2.3, -1.8], dir: [0, 1, 0], role: "hinge" });
  const gun = b.joint("gun", { parent: turret, at: pivot, dir: D, role: "hinge" });
  const barrel = b.joint("barrel", { parent: gun, at: P(0.8), dir: D, role: "hinge" });

  const bx = (w: number, h: number, d: number, color: any, at: V, bone: any, opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, flat: true, ...opt });
  const cyl = (r1: number, r2: number, h: number, sides: number, color: any, at: V, bone: any, dir: V, opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, sides), color, { at, bone, dir, flat: true, ...opt });
  const plane = (w: number, h: number, tex: any, at: V, dir: V, bone: any, tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex, bone });

  // ---------- hull ----------
  b.extrude(
    [
      [-5.5, 1.0],
      [5.4, 1.0],
      [5.6, 1.5, "sharp"],
      [5.0, 2.1, "sharp"],
      [2.0, 2.3],
      [-5.3, 2.3],
      [-5.5, 2.0, "sharp"],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.05, color: CAMO, bone: chassis },
  );
  // under-frame
  bx(2.0, 0.3, 10.4, DARKER, [0, 0.95, 0], chassis);
  // cab
  b.extrude(
    [
      [1.7, 2.3],
      [1.9, 3.5, "sharp"],
      [3.3, 3.6, "sharp"],
      [4.7, 2.9, "sharp"],
      [5.0, 2.3, "sharp"],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.05, color: CAMO2, bone: chassis },
  );
  // windscreen + side windows
  glow(plane(2.0, 1.52, WS, [0, 3.27, 4.01], [0, 0.919, 0.394], chassis), 0.35);
  for (const s of [1, -1]) {
    glow(plane(1.7, 0.7, SIDEWIN, [s * 1.11, 3.0, 2.9], [s, 0, 0], chassis), 0.3);
    // door handle and mirror
    bx(0.05, 0.08, 0.3, STEEL, [s * 1.12, 2.55, 3.8], chassis);
    bx(0.12, 0.4, 0.22, DARK, [s * 1.3, 3.2, 4.3], chassis);
    bx(0.05, 0.3, 0.18, STEEL, [s * 1.38, 3.2, 4.3], chassis);
    // side armour strips
    bx(0.1, 0.25, 10.6, CAMO2, [s * 1.25, 2.0, 0], chassis);
    bx(0.14, 0.08, 10.6, GUN, [s * 1.25, 1.84, 0], chassis);
  }
  // nose
  plane(1.6, 0.55, GRILLE, [0, 1.82, 5.31], [0, 0.707, 0.707], chassis);
  b.part(new THREE.BoxGeometry(2.6, 0.4, 0.3), "#ffffff", { at: [0, 1.25, 5.65], bone: chassis, texture: HAZARD, flat: true });
  for (const s of [1, -1]) {
    glow(bx(0.45, 0.22, 0.14, "#fff3c0", [s * 1.0, 1.78, 5.4], chassis), 1.3);
    bx(0.55, 0.3, 0.1, DARKER, [s * 1.0, 1.78, 5.36], chassis);
    glow(bx(0.4, 0.16, 0.1, RED, [s * 0.95, 1.7, -5.52], chassis), 1.2);
    // tow hooks
    bx(0.15, 0.15, 0.3, STEEL, [s * 0.9, 1.1, 5.8], chassis);
    // exhaust stacks
    cyl(0.12, 0.1, 0.95, 6, DARKER, [s * 1.1, 2.75, -5.1], chassis, [0, 1, 0]);
    cyl(0.14, 0.14, 0.1, 6, STEEL, [s * 1.1, 3.22, -5.1], chassis, [0, 1, 0]);
    // antennas
    b.rod([s * 1.0, 3.5, 1.9], [s * 1.05, 5.4, 1.6], 0.03, { color: DARKER, bone: chassis });
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), RED, { at: [s * 1.05, 5.45, 1.6], bone: chassis }), 1.6);
    // fuel tanks
    cyl(0.34, 0.34, 1.2, 8, STEEL, [s * 1.38, 1.3, -0.7], chassis, [0, 0, 1]);
    bx(0.1, 0.12, 1.3, DARK, [s * 1.38, 1.3, -0.7], chassis);
  }
  // cab roof gear
  bx(1.6, 0.12, 0.3, DARK, [0, 3.66, 2.1], chassis);
  for (const s of [1, -1]) glow(bx(0.5, 0.1, 0.22, AMBER, [s * 0.55, 3.74, 2.1], chassis), 1.2);
  b.part(new THREE.SphereGeometry(0.3, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, {
    at: [-0.55, 3.55, 3.0],
    bone: chassis,
    flat: true,
  });
  cyl(0.06, 0.06, 0.5, 6, DARKER, [0.55, 3.8, 3.1], chassis, [0, 1, 0]);
  glow(bx(0.3, 0.12, 0.12, CYAN, [0.55, 4.08, 3.15], chassis), 1.2);
  // roof handrails
  for (const s of [1, -1]) b.rod([s * 0.8, 3.66, 3.0], [s * 0.8, 3.66, 3.6], 0.025, { color: STEEL, bone: chassis });

  // ---------- axles, wheels, fenders ----------
  const WZ: [string, number][] = [
    ["F", 3.8],
    ["M", 0.8],
    ["R", -2.2],
  ];
  for (const [fb, z] of WZ) {
    b.rod([-1.6, 0.8, z], [1.6, 0.8, z], 0.12, { color: DARKER, bone: chassis });
    b.part(new THREE.SphereGeometry(0.3, 8, 5), GUN, { at: [0, 0.85, z], bone: chassis, flat: true });
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const wc: V = [s * 1.6, 0.8, z];
      const w = b.joint(`wheel${fb}${sd}`, { parent: chassis, at: wc, dir: [s, 0, 0], role: "hinge" });
      cyl(0.8, 0.8, 0.65, 14, TIRE, wc, w, [1, 0, 0]);
      cyl(0.52, 0.52, 0.7, 10, STEEL, wc, w, [1, 0, 0]);
      cyl(0.3, 0.38, 0.14, 8, GUN, [s * 1.95, 0.8, z], w, [s, 0, 0]);
      b.ring(frame(wc, [1, 0, 0]), { count: 14, radius: 0.78 }, (it: any) =>
        b.part(new THREE.BoxGeometry(0.2, 0.1, 0.6), TIRE2, { frame: it, bone: w, flat: true }),
      );
      b.ring(frame([s * 2.02, 0.8, z], [s, 0, 0]), { count: 6, radius: 0.27 }, (it: any) =>
        b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 6), STEEL, { at: it.at, dir: [s, 0, 0], bone: w, flat: true }),
      );
      // fender
      bx(0.78, 0.1, 1.9, CAMO, [s * 1.6, 1.74, z], chassis);
      bx(0.78, 0.1, 0.7, CAMO, [s * 1.6, 1.58, z + 1.1], chassis, { rotation: [38, 0, 0] });
      bx(0.78, 0.1, 0.7, CAMO, [s * 1.6, 1.58, z - 1.1], chassis, { rotation: [-38, 0, 0] });
      bx(0.1, 0.07, 1.95, YEL, [s * 1.95, 1.74, z], chassis);
    }
  }

  // ---------- stabiliser legs ----------
  for (const [fb, z] of [
    ["F", 2.3],
    ["B", -4.4],
  ] as [string, number][]) {
    for (const s of [1, -1]) {
      const sd = s > 0 ? "L" : "R";
      const mount: V = [s * 1.3, 1.5, z];
      const knee: V = [s * 2.4, 1.95, z];
      const foot: V = [s * 3.1, 0.2, z];
      const leg = b.chain(`stab${fb}${sd}`, polyline([mount, knee, foot]), {
        parent: chassis,
        names: [`stab${fb}${sd}`, `stabKnee${fb}${sd}`, `stabFoot${fb}${sd}`],
        role: "leg",
      });
      b.sweep(leg, [0.2, 0.15], { section: "box", skin: "rigid", color: DARK });
      // yellow sleeve on lower strut
      const l = (t: number): V => [knee[0] + (foot[0] - knee[0]) * t, knee[1] + (foot[1] - knee[1]) * t, z];
      b.rod(l(0.12), l(0.6), 0.2, { color: YEL, bone: leg.joints[1], section: "box" });
      // mount plate and hydraulic piston
      bx(0.2, 0.7, 0.9, GUN, [s * 1.28, 1.5, z], chassis);
      b.rod([s * 1.35, 1.1, z], l(0.35), 0.07, { color: STEEL, bone: chassis });
      b.part(new THREE.SphereGeometry(0.24, 8, 5), STEEL, { at: knee, bone: leg.joints[1], flat: true });
      // pad
      cyl(0.6, 0.6, 0.2, 8, DARK, [foot[0], 0.1, z], leg, [0, 1, 0]);
      cyl(0.62, 0.62, 0.05, 8, YEL, [foot[0], 0.03, z], leg, [0, 1, 0]);
      b.part(new THREE.SphereGeometry(0.2, 7, 5), STEEL, { at: [foot[0], 0.3, z], bone: leg, flat: true });
    }
  }

  // ---------- power module (rear deck) ----------
  bx(2.0, 0.9, 1.4, CAMO2, [0, 2.75, -4.55], chassis);
  glow(plane(1.6, 0.6, CELLS, [0, 2.75, -5.26], [0, 0, -1], chassis), 1.2);
  for (const s of [1, -1]) glow(plane(1.0, 0.6, CELLS, [s * 1.01, 2.75, -4.55], [s, 0, 0], chassis), 1.2);
  for (let i = 0; i < 6; i++) bx(1.7, 0.22, 0.06, STEEL, [0, 3.3, -3.95 - i * 0.2], chassis);
  b.sweep(catmull([[0.3, 3.2, -4.2], [0.4, 3.5, -3.8], [0.2, 3.62, -3.35]]), 0.06, { color: DARKER, bone: chassis });
  b.sweep(catmull([[-0.3, 3.2, -4.2], [-0.4, 3.5, -3.8], [-0.2, 3.62, -3.35]]), 0.06, { color: DARKER, bone: chassis });
  b.part(new THREE.BoxGeometry(1.4, 0.4, 0.05), "#ffffff", { at: [0, 1.7, -5.52], bone: chassis, texture: HAZARD, flat: true });

  // ---------- turret ----------
  cyl(1.5, 1.5, 0.3, 16, DARKER, [0, 2.3, -1.8], turret, [0, 1, 0]);
  b.extrude(
    [
      [-1.8, 0.1],
      [1.7, 0.1],
      [1.7, 0.6, "sharp"],
      [1.0, 1.3, "sharp"],
      [-1.2, 1.3, "sharp"],
      [-1.8, 1.0, "sharp"],
    ],
    { at: [0, 2.3, -1.8], x: [0, 0, 1], thickness: 2.4, bevel: 0.05, color: CAMO, bone: turret },
  );
  for (const s of [1, -1]) {
    plane(0.9, 0.9, EMBLEM, [s * 1.205, 3.0, -1.5], [s, 0, 0], turret);
    // cheek armour wedge
    bx(0.25, 0.8, 1.2, CAMO2, [s * 1.3, 2.9, -0.9], turret, { rotation: [0, s * 14, 0] });
    // smoke dischargers
    for (let i = 0; i < 3; i++)
      cyl(0.07, 0.07, 0.35, 6, DARKER, [s * 1.1, 3.05 + i * 0.03, -0.45 - i * 0.18], turret, [s * 0.6, 0.6, 0.5]);
    // trunnion pylons
    bx(0.3, 0.7, 0.9, GUN, [s * 0.85, 3.95, -1.8], turret);
  }
  bx(0.5, 0.25, 0.4, GUN, [0.8, 3.72, -2.9], turret);
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [0.8, 3.9, -2.9], bone: turret }), 1.4);

  // ---------- railgun ----------
  bx(1.3, 0.9, 2.0, GUN, P(0.2), gun, { dir: D });
  b.part(new THREE.BoxGeometry(1.3, 2.0, 0.9), GUN, { at: P(0.2), dir: D, bone: gun, flat: true });
  b.part(new THREE.BoxGeometry(1.0, 0.8, 0.8), DARK, { at: P(-1.7), dir: D, bone: barrel, flat: true });
  for (const s of [1, -1]) {
    b.sweep(polyline([P(-1.5, s * 0.32), P(10.5, s * 0.32)]), () => [0.12, 0.27], {
      section: "box",
      caps: "flat",
      bone: barrel,
      color: RAIL,
    });
    b.rod(P(-1.0, s * 0.55, -0.55), P(0.7, s * 0.55, -0.55), 0.12, { color: STEEL, bone: gun });
    b.rod(P(0.7, s * 0.55, -0.55), P(1.5, s * 0.55, -0.55), 0.06, { color: STEEL, bone: barrel });
  }
  b.sweep(polyline([P(-1.2), P(10.3)]), () => [0.2, 0.2], { section: "box", caps: "flat", bone: barrel, color: DARKER });
  glow(
    b.sweep(polyline([P(-0.8, 0, 0.2), P(10.3, 0, 0.2)]), () => [0.06, 0.03], {
      section: "box",
      caps: "flat",
      bone: barrel,
      color: CYAN,
    }),
    1.6,
  );
  for (let i = 0; i < 8; i++) {
    const d = 2.1 + i * 1.05;
    b.part(new THREE.BoxGeometry(1.05, 0.22, 0.8), i % 2 ? GUN : DARK, { at: P(d), dir: D, bone: barrel, flat: true });
    b.part(new THREE.BoxGeometry(1.0, 0.07, 0.86), YEL, { at: P(d + 0.14), dir: D, bone: barrel, flat: true });
    for (const s of [1, -1])
      glow(
        b.part(new THREE.BoxGeometry(0.04, 0.16, 0.45), CYAN, { at: P(d, s * 0.53), dir: D, bone: barrel, flat: true }),
        1.6,
      );
  }
  // muzzle
  b.part(new THREE.BoxGeometry(1.15, 0.4, 0.95), GUN, { at: P(10.4), dir: D, bone: barrel, flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.6, 0.7), DARKER, { at: P(10.6, s * 0.62), dir: D, bone: barrel, flat: true });
    glow(b.part(new THREE.BoxGeometry(0.2, 0.05, 0.35), CYAN, { at: P(10.62, s * 0.3, 0.05), dir: D, bone: barrel, flat: true }), 1.8);
  }
  glow(b.part(new THREE.BoxGeometry(0.4, 0.06, 0.2), CYAN, { at: P(10.64, 0, 0.1), dir: D, bone: barrel, flat: true }), 1.8);

  return b.root;
}
```
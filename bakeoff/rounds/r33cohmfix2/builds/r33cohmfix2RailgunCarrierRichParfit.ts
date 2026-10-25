import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, type Builder, type Joint, paint, svg, noise, mix, smoothstep, rng } from "../../../../src/index";
import { panelled, metal } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled carrier with a long electromagnetic railgun on its back, braced on four deployed stabiliser legs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hullOlive: "#4d5640",
  hullDark: "#2f352b",
  armorGrey: "#6b7078",
  gunmetal: "#23262c",
  steel: "#9aa1ab",
  rubber: "#16171a",
  hazardYellow: "#e7b814",
  hazardBlack: "#18181a",
  neonCyan: "#2ff3ff",
  glassDark: "#0f2a38",
  warnRed: "#d8322b",
  hydraulicChrome: "#c5ccd6",
  padOrange: "#c9691f",
};
const M = {
  deckTop: [0, 1.75, -0.8] as [number, number, number],
  cabRoof: [0, 2.45, 3.1] as [number, number, number],
  turretRing: [0, 1.85, -1.2] as [number, number, number],
  gunPivot: [0, 2.6, -1.2] as [number, number, number],
  axleFront: [0, 0.8, 3.4] as [number, number, number],
  axleMid: [0, 0.8, 0.2] as [number, number, number],
  axleRear: [0, 0.8, -3] as [number, number, number],
  stabFrontAnchor: [1.3, 1.2, -0.6] as [number, number, number],
  stabRearAnchor: [1.3, 1.2, -3.6] as [number, number, number],
  muzzle: [0, 2.75, 5.4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // hullLower
  (() => {
function buildHullLower({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);

  // textures
  const chevron = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e7b814"/>` +
      [0, 1, 2, 3].map((i) => `<path d="M0 ${i * 18 + 6} L32 ${i * 18 - 6} L64 ${i * 18 + 6} L64 ${i * 18 + 16} L32 ${i * 18 + 4} L0 ${i * 18 + 16}Z" fill="#18181a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const unitL = svg(
    `<svg viewBox="0 0 96 48"><rect x="2" y="2" width="92" height="44" rx="4" fill="none" stroke="#e8e8d8" stroke-width="3"/><text x="48" y="35" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#e8e8d8">RG-06</text></svg>`,
    { size: 192 },
  );
  const vent = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b2a30"/>` +
      [0, 1, 2, 3, 4].map((i) => `<rect x="4" y="${3 + i * 5.6}" width="56" height="3" fill="#2ff3ff"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const tail = svg(`<svg viewBox="0 0 32 16"><rect width="32" height="16" rx="3" fill="#d8322b"/><rect x="4" y="6" width="24" height="4" fill="#ffb0a0"/></svg>`, { size: 64 });

  const HULL = panelled(
    paint((p, n) => mix(mix(P.hullOlive, P.hullDark, 0.5 * (1 - smoothstep(-0.5, 0.8, n.y)) + 0.25 * noise(p, 0.5, 3)), "#6c7352", 0.0)),
    { size: 0.9, aspect: 0.6, rivets: 0.12, seam: P.hullDark },
  );
  const DECK = panelled(P.armorGrey, { size: 0.8, aspect: 1, rivets: 0.1, seam: P.gunmetal });
  const box = (w: number, h: number, d: number, c: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...extra });

  // main tub: upper slab, chamfered
  b.frustumBox([0, 1.2, -5.4], [0, 1.2, 3], [2.6, 1.3], [2.6, 1.3], { bone: body, color: HULL });
  b.frustumBox([0, 0.95, -5.2], [0, 0.95, 2.9], [2.0, 0.5], [2.0, 0.5], { bone: body, color: P.hullDark });
  // sloped underbelly
  b.loft(
    [
      { at: [0, 0.85, -4.8], w: 1.6, h: 0.3 },
      { at: [0, 0.85, -1], w: 1.8, h: 0.3 },
      { at: [0, 0.85, 2.5], w: 1.5, h: 0.3 },
    ],
    { bone: body, color: P.gunmetal },
  );
  // deck
  box(2.5, 0.1, 8.2, DECK, [0, 1.8, -1.4]);
  // deck edge rails
  for (const s of [1, -1]) {
    box(0.1, 0.12, 8.3, P.hazardYellow, [s * 1.27, 1.84, -1.4]);
    // side skirts
    box(0.12, 0.45, 7.6, P.hullDark, [s * 1.32, 0.95, -1.5]);
    // frame beams
    box(0.2, 0.25, 8.4, P.gunmetal, [s * 0.75, 0.82, -1.3]);
  }
  // cross beams (axle mounts)
  for (const z of [0.2, -3, 2.6, -0.6, -3.6]) box(2.6, 0.18, 0.22, P.gunmetal, [0, 0.88, z]);

  // fenders over wheels
  for (const z of [0.2, -3]) {
    for (const s of [1, -1]) {
      box(0.3, 0.1, 1.9, P.hullOlive, [s * 1.35, 1.7, z], {});
      box(0.3, 0.35, 0.14, P.hullDark, [s * 1.35, 1.5, z + 0.95]);
      box(0.3, 0.35, 0.14, P.hullDark, [s * 1.35, 1.5, z - 0.95]);
      box(0.3, 0.04, 0.3, P.hazardYellow, [s * 1.35, 1.77, z + 0.7]);
    }
  }
  // front fender stub
  for (const s of [1, -1]) box(0.3, 0.1, 1.0, P.hullOlive, [s * 1.35, 1.7, 2.4]);

  // rear ramp door
  box(2.2, 1.0, 0.1, P.armorGrey, [0, 1.25, -5.4]);
  b.part(new THREE.PlaneGeometry(2.0, 0.8), "#ffffff", { bone: body, at: [0, 1.25, -5.455], dir: [0, 0, -1], axis: "z", texture: chevron });
  for (const s of [1, -1]) {
    box(0.14, 0.14, 0.14, P.steel, [s * 1.0, 1.65, -5.43]);
    // tail lights
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone: body, at: [s * 1.1, 0.95, -5.45], dir: [0, 0, -1], axis: "z", texture: tail }), 1.3);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8, Math.PI * 1.5), P.steel, { bone: body, at: [s * 0.7, 0.85, -5.38] });
    box(0.12, 0.12, 0.25, P.steel, [s * 0.7, 0.85, -5.3]);
  }

  // exhaust stacks (rear corners of deck)
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), P.gunmetal, { bone: body, at: [s * 1.1, 1.78, -4.9] });
    b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.05, 8), P.hazardBlack, { bone: body, at: [s * 1.1, 1.82, -4.9] });
  }

  // engine vent grilles on deck rear
  for (const x of [-0.5, 0.5]) {
    box(0.8, 0.1, 0.9, P.gunmetal, [x, 1.88, -4.3]);
    glow(b.part(new THREE.PlaneGeometry(0.7, 0.8), "#ffffff", { bone: body, at: [x, 1.94, -4.3], dir: [0, 1, 0], axis: "z", texture: vent }), 0.8);
  }

  // side tool lockers + unit-number decals
  for (const s of [1, -1]) {
    for (const z of [-2.0, -1.0]) {
      box(0.16, 0.5, 0.85, P.hullDark, [s * 1.38, 1.4, z]);
      box(0.06, 0.4, 0.75, P.hullOlive, [s * 1.47, 1.4, z]);
    }
    b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", { bone: body, at: [s * 1.311, 1.35, 1.7], dir: [s, 0, 0], axis: "z", texture: unitL });
    // hazard trim by wheel arches
    box(0.06, 0.1, 1.2, P.hazardYellow, [s * 1.34, 1.15, -4.3]);
    box(0.06, 0.1, 1.0, P.hazardYellow, [s * 1.34, 1.15, 2.2]);
    // stabiliser anchor brackets
    for (const z of [-0.6, -3.6]) {
      box(0.3, 0.5, 0.6, P.armorGrey, [s * 1.35, 1.2, z]);
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), P.steel, { bone: body, at: [s * 1.45, 1.2, z], rotation: [0, 0, 90] });
    }
  }

  // turret ring base on deck
  b.lathe(
    [[0, 0], [1.05, 0], [1.05, 0.08], [0.95, 0.12], [0, 0.12]],
    { at: [M.deckTop[0], 1.85, M.turretRing[2]], bone: body, color: P.gunmetal, segments: 16 },
  );
  // teeth on ring
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.12, 0.06, 0.12, P.steel, [Math.sin(a) * 1.05, 1.9, M.turretRing[2] + Math.cos(a) * 1.05]);
  }

  // rivet strips of studs on deck
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 10; i++) for (const s of [1, -1]) studs.push(new THREE.SphereGeometry(0.03, 5, 3).translate(s * 1.15, 1.87, 2.7 - i * 0.7 - R() * 0.02));
  const merged = mergeGeometries(studs);
  if (merged) b.part(merged, P.steel, { bone: body, at: [0, 0, 0] });

  // front mating plate
  box(2.4, 0.7, 0.12, P.armorGrey, [0, 1.45, 2.95]);
  // cyan side vents
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.7, 0.3), "#ffffff", { bone: body, at: [s * 1.311, 1.6, -3.9], dir: [s, 0, 0], axis: "z", texture: vent }), 0.7);
}
    return buildHullLower;
  })(),
  // cabShell
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildCabShell({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // Paints
  const HULL = panelled(
    paint((p, n) => {
      const base = mix(P.hullOlive, P.hullDark, smoothstep(0.4, 0.8, noise(p, 0.5, 3)) * 0.5);
      return mix(base, "#7a8266", Math.max(0, n.y) * 0.25);
    }),
    { size: 0.5, aspect: 0.7, rivets: 0.12, seam: P.hullDark },
  );
  const GREY = panelled(P.armorGrey, { size: 0.4, rivets: 0.1, seam: P.gunmetal });
  const DARK = metal("iron");

  const part = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: body, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, o);

  // ---- Cab wedge: lofted core
  b.loft(
    [
      { at: [0, 2.0, 3.4], w: 2.9, h: 0.6 },
      { at: [0, 2.15, 4.1], w: 2.8, h: 0.9 },
      { at: [0, 2.2, 4.7], w: 2.6, h: 0.55 },
    ],
    { bone: body, color: HULL, section: "box", caps: "none" },
  );
  // Lower main block
  b.frustumBox([0, 1.7, 3.05], [0, 1.7, 5.05], [2.9, 0.2], [2.7, 0.2], { bone: body, color: HULL });
  // Roof slab (faceted)
  b.extrude(
    [
      [-1.35, 0],
      [1.35, 0],
      [1.2, 0.35],
      [-1.2, 0.35],
    ],
    { at: [0, 2.35, 3.1], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.1, bone: body, color: GREY },
  );
  // Rear roof plate
  b.extrude(
    [
      [-1.25, 0],
      [1.25, 0],
      [1.1, 1.5],
      [-1.1, 1.5],
    ],
    { at: [0, 2.43, 3.2], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.06, bone: body, color: GREY, bevel: 0.015 },
  );
  // Sloped glacis plates (front)
  const glacis = b.extrude(
    [
      [-1.4, 0],
      [1.4, 0],
      [1.25, 0.9],
      [-1.25, 0.9],
    ],
    { at: [0, 2.0, 4.95], x: [1, 0, 0], y: [0, 0.55, -1], thickness: 0.1, bone: body, color: HULL, bevel: 0.02 },
  );
  box(2.4, 0.08, 0.9, GREY, [0, 2.5, 4.55], { rotation: [14, 0, 0] });

  // Side armour with door outlines
  const DOOR = svg(
    `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="4" fill="none" stroke="#18181a" stroke-width="3"/>
    <rect x="12" y="10" width="40" height="22" rx="3" fill="#0f2a38" stroke="#18181a" stroke-width="3"/>
    <path d="M14 14 L30 14 L14 28Z" fill="#2ff3ff" opacity="0.25"/>
    <rect x="42" y="42" width="10" height="4" fill="#18181a"/>
    <circle cx="10" cy="50" r="2" fill="#9aa1ab"/><circle cx="54" cy="12" r="2" fill="#9aa1ab"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    box(0.12, 1.05, 2.0, GREY, [s * 1.46, 2.2, 4.0], { rotation: [0, 0, 0] });
    b.part(new THREE.PlaneGeometry(1.3, 1.0), "#ffffff", {
      bone: body,
      at: [s * 1.53, 2.2, 4.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: DOOR,
    });
    // hinges
    for (const dz of [-0.62, 0.7]) {
      for (const dy of [-0.3, 0.3])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6), P.steel, {
          bone: body,
          at: [s * 1.55, 2.2 + dy, 4.1 + dz],
        });
    }
    // handle
    box(0.05, 0.05, 0.22, P.steel, [s * 1.56, 2.0, 3.65]);
    // fender-like skirt plate with hazard stripe
    box(0.1, 0.12, 2.0, P.hazardYellow, [s * 1.5, 1.82, 4.0]);
    // wing mirror arm
    b.rod([s * 1.4, 2.45, 4.75], [s * 1.5, 2.5, 4.8], 0.025, P.gunmetal, { bone: body });
    box(0.06, 0.28, 0.2, P.gunmetal, [s * 1.47, 2.5, 4.85]);
    box(0.02, 0.22, 0.15, P.glassDark, [s * 1.5, 2.5, 4.85]);
    // roof rails
    b.rod([s * 1.2, 2.58, 3.25], [s * 1.2, 2.58, 4.55], 0.025, P.steel, { bone: body });
    for (const z of [3.3, 3.9, 4.5]) b.rod([s * 1.2, 2.5, z], [s * 1.2, 2.58, z], 0.02, P.steel, { bone: body });
  }

  // Roof hatch with ring
  const roofY = M.cabRoof[1];
  b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.32, 0.05],
      [0.26, 0.1],
      [0, 0.1],
    ],
    { at: [0.55, roofY - 0.02, 3.55], bone: body, color: GREY, segments: 8 },
  );
  b.lathe(
    [
      [0.28, 0],
      [0.36, 0],
      [0.36, 0.05],
      [0.28, 0.05],
    ],
    { at: [0.55, roofY - 0.04, 3.55], bone: body, color: P.hazardYellow, segments: 8 },
  );
  box(0.08, 0.06, 0.2, P.steel, [0.55, roofY + 0.1, 3.55]);

  // Sensor dome + camera turret on cabRoof mount
  part(new THREE.SphereGeometry(0.28, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.armorGrey, [M.cabRoof[0] - 0.4, roofY - 0.05, M.cabRoof[2] + 0.2]);
  glow(part(new THREE.SphereGeometry(0.1, 6, 4), P.neonCyan, [-0.4, roofY + 0.12, M.cabRoof[2] + 0.38]), 1.4);
  box(0.4, 0.1, 0.4, P.gunmetal, [-0.4, roofY - 0.02, M.cabRoof[2] + 0.2]);
  // camera turret
  box(0.25, 0.2, 0.3, P.gunmetal, [-0.85, roofY + 0.05, 4.3]);
  part(new THREE.CylinderGeometry(0.06, 0.07, 0.2, 8), P.gunmetal, [-0.85, roofY + 0.07, 4.5], { dir: [0, 0, 1] });
  glow(part(new THREE.CircleGeometry(0.05, 8), P.neonCyan, [-0.85, roofY + 0.07, 4.61], { dir: [0, 0, 1], axis: "z" }), 1.5);

  // Antenna masts
  for (const [x, z, h] of [[1.2, 3.25, 0.4], [1.0, 3.25, 0.3]] as number[][]) {
    b.spike([x, 2.45, z], [0, 1, 0], h, 0.025, { bone: body, color: P.gunmetal });
    part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, [x, 2.45 + h, z]);
    box(0.12, 0.12, 0.12, P.gunmetal, [x, 2.5, z]);
  }
  // Coil whip antenna base
  b.rod([-1.2, 2.45, 3.3], [-1.2, 2.6, 3.3], 0.06, P.gunmetal, { bone: body });

  // Warning light bar at the cab front roof edge
  box(1.6, 0.1, 0.16, P.gunmetal, [0, 2.6, 4.75]);
  for (let i = 0; i < 6; i++) {
    const c = i % 2 ? P.warnRed : "#ff9c1a";
    glow(box(0.2, 0.09, 0.14, c, [-0.6 + i * 0.24, 2.67, 4.75]), 1.3);
  }

  // Roof panel details: vents and bolts
  for (let i = 0; i < 4; i++) box(0.5, 0.025, 0.05, P.gunmetal, [0.7, 2.49, 3.9 + i * 0.12]);
  for (const x of [-1.1, 1.1])
    for (const z of [3.2, 4.4]) part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, [x, 2.5, z]);

  // Cyan sensor strip on cab sides
  for (const s of [1, -1])
    glow(box(0.04, 0.05, 1.2, P.neonCyan, [s * 1.505, 2.55, 4.1]), 1.2);

  // Hazard trim along cab base and decal chevrons
  const CHEV = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    <path d="M0 16 L8 0 H16 L8 16Z M16 16 L24 0 H32 L24 16Z M32 16 L40 0 H48 L40 16Z M48 16 L56 0 H64 L56 16Z" fill="#18181a"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(2.4, 0.2), "#ffffff", { bone: body, at: [0, 2.3, 3.07], dir: [0, 0, -1], axis: "z", texture: CHEV });
  for (const s of [1, -1]) box(0.08, 0.5, 0.5, P.armorGrey, [s * 1.45, 1.95, 3.2]);

  return glacis;
}
    return buildCabShell;
  })(),
  // cabFace
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildCabFace({ b, J, P }: Ctx) {
  const body = J.body;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], extra: any = {}) =>
    b.part(g, color, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);

  // Paints
  const hullPaint = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) =>
      mix(P.hullOlive, P.hullDark, 0.5 * smoothstep(0.4, 0.9, noise(p, 0.3, 4)) + (n.y < -0.3 ? 0.3 : 0)),
    ),
    { size: 0.4, aspect: 0.6, rivets: 0.1 },
  );
  const steelP = metal("steel", { tarnish: 0.3 });

  // Textures
  const visorTex = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#0f2a38"/>
    <path d="M10 40 L40 0 L58 0 L28 40Z" fill="#5fd8e8" opacity="0.28"/>
    <path d="M64 40 L88 0 L96 0 L72 40Z" fill="#5fd8e8" opacity="0.2"/>
    <rect x="0" y="0" width="128" height="3" fill="#06141c"/><rect x="0" y="37" width="128" height="3" fill="#06141c"/></svg>`,
    { size: 256 },
  );
  const grilleTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#16171a"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="4" y="${3 + i * 4}" width="56" height="2" fill="#3a3f48"/>`).join("")}
    <rect x="4" y="29" width="56" height="1.5" fill="#2ff3ff" opacity="0.7"/></svg>`,
    { size: 192 },
  );
  const chevTex = svg(
    `<svg viewBox="0 0 96 16"><rect width="96" height="16" fill="#e7b814"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 14} 16 L${i * 14 + 7} 0 L${i * 14 + 14} 0 L${i * 14 + 7} 16Z" fill="#18181a"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const plateTex = svg(
    `<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#e8e6dc" stroke="#18181a" stroke-width="2"/>
    <text x="30" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#18181a">RG-06</text></svg>`,
    { size: 192 },
  );
  const emblemTex = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="#18181a" stroke="#e7b814" stroke-width="2.5"/>
    <path d="M8 22 H32 M12 18 H30 M26 14 L32 22 L26 30" stroke="#2ff3ff" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );

  // Glacis plate under visor (sloped)
  put(box(2.9, 0.9, 0.12), hullPaint, [0, 1.35, 5.05], { rotation: [-8, 0, 0] });
  put(box(2.9, 0.5, 0.35), hullPaint, [0, 2.45, 5.1]);
  // Visor: slanted
  put(box(2.4, 0.7, 0.06), P.glassDark, [0, 2.0, 5.12], { rotation: [-22, 0, 0] });
  const visor = put(new THREE.PlaneGeometry(2.3, 0.62), "#ffffff", [0, 2.0, 5.158], {
    rotation: [-22, 0, 0], texture: visorTex,
  });
  // Visor frame
  put(box(2.5, 0.06, 0.1), P.gunmetal, [0, 2.36, 5.16], { rotation: [-22, 0, 0] });
  put(box(2.5, 0.06, 0.1), P.gunmetal, [0, 1.64, 5.07], { rotation: [-22, 0, 0] });
  for (const s of [1, -1]) put(box(0.07, 0.8, 0.1), P.gunmetal, [s * 1.23, 2.0, 5.11], { rotation: [-22, 0, 0] });
  // Sensor strip
  glow(put(box(2.0, 0.05, 0.05), P.neonCyan, [0, 2.5, 5.3]), 1.6);
  glow(put(box(2.0, 0.04, 0.04), P.neonCyan, [0, 1.58, 5.38]), 1.4);
  // Wipers
  for (const s of [1, -1]) {
    put(box(0.05, 0.05, 0.6).rotateZ(0.15 * s), P.gunmetal, [s * 0.5, 1.72, 5.21], { rotation: [-22, 0, 0] });
    put(cyl(0.025, 0.025, 0.08, 6), P.steel, [s * 0.5, 1.68, 5.12]);
  }

  // Grille
  put(box(1.6, 0.6, 0.1), P.gunmetal, [0, 1.15, 5.3]);
  put(new THREE.PlaneGeometry(1.5, 0.5), "#ffffff", [0, 1.15, 5.356], { texture: grilleTex });
  glow(put(box(1.5, 0.03, 0.03), P.neonCyan, [0, 0.82, 5.34]), 1.8);
  // Lower hull nose block
  put(box(2.9, 0.45, 0.35), hullPaint, [0, 0.93, 5.2]);
  // Plough nose (wedge) with hazard chevrons
  put(box(3.0, 0.32, 0.3), P.gunmetal, [0, 0.82, 5.42], { rotation: [18, 0, 0] });
  put(box(3.0, 0.3, 0.1), "#ffffff", [0, 0.85, 5.5], { rotation: [18, 0, 0], texture: chevTex });
  put(new THREE.PlaneGeometry(2.9, 0.3), "#ffffff", [0, 0.86, 5.57], { texture: chevTex, rotation: [18, 0, 0] });
  // Bumper bar
  put(box(3.0, 0.2, 0.22), P.hazardYellow, [0, 1.52, 5.4]);
  put(new THREE.PlaneGeometry(2.9, 0.16), "#ffffff", [0, 1.52, 5.516], { texture: chevTex });
  for (const s of [1, -1]) {
    put(box(0.18, 0.26, 0.26), P.hazardBlack, [s * 1.5, 1.52, 5.4]);
  }

  // Headlights with cages
  for (const s of [1, -1]) {
    const x = s * 1.1;
    put(box(0.5, 0.3, 0.14), P.gunmetal, [x, 1.95 - 0.5, 5.4]);
    glow(put(box(0.4, 0.2, 0.05), P.neonCyan, [x, 1.45, 5.48]), 2);
    for (const k of [-1, 0, 1]) put(box(0.02, 0.28, 0.04), P.gunmetal, [x + k * 0.13, 1.45, 5.52]);
    put(box(0.5, 0.025, 0.05), P.gunmetal, [x, 1.5, 5.52]);
    put(box(0.5, 0.025, 0.05), P.gunmetal, [x, 1.4, 5.52]);
    // upper marker lights
    glow(put(box(0.16, 0.06, 0.05), P.warnRed, [s * 1.35, 2.5, 5.3]), 1.2);
    // fender fronts above wheels
    put(box(0.5, 0.28, 0.4), hullPaint, [s * 1.2, 1.55, 5.2]);
    put(box(0.54, 0.08, 0.4), P.hazardYellow, [s * 1.2, 1.71, 5.2]);
    put(box(0.5, 0.35, 0.12), P.armorGrey, [s * 1.2, 1.4, 5.3], { rotation: [-20, 0, 0] });
    // tow eyes
    put(new THREE.TorusGeometry(0.09, 0.025, 6, 10), P.steel, [s * 0.95, 0.85, 5.62]);
    put(box(0.12, 0.12, 0.1), P.gunmetal, [s * 0.95, 0.85, 5.5]);
    // hex bolts on bumper
    put(cyl(0.04, 0.04, 0.04, 6), P.steel, [s * 1.1, 1.52, 5.52], { rotation: [90, 0, 0] });
  }

  // Winch
  put(box(0.9, 0.3, 0.2), P.gunmetal, [0, 1.0, 5.45]);
  put(cyl(0.1, 0.1, 0.75, 10), steelP, [0, 1.0, 5.5], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) put(cyl(0.13, 0.13, 0.05, 10), P.armorGrey, [s * 0.4, 1.0, 5.5], { rotation: [0, 0, 90] });
  put(cyl(0.012, 0.012, 0.25, 5), P.rubber, [0, 0.9, 5.62]);
  put(new THREE.TorusGeometry(0.07, 0.022, 6, 10, Math.PI * 1.4), P.hazardYellow, [0, 0.74, 5.62], { rotation: [0, 0, 200] });
  put(box(0.1, 0.06, 0.07), P.steel, [0, 0.8, 5.62]);

  // License plate + emblem
  put(box(0.5, 0.26, 0.03), P.gunmetal, [0, 1.52 - 0.22, 5.6]);
  put(new THREE.PlaneGeometry(0.46, 0.23), "#ffffff", [0, 1.3, 5.62], { texture: plateTex });
  for (const s of [1, -1]) put(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", [s * 0.7, 1.15, 5.365], { texture: emblemTex });

  // Roof-front light bar
  put(box(1.8, 0.1, 0.12), P.gunmetal, [0, 2.57, 5.2]);
  for (let i = 0; i < 5; i++) {
    glow(put(box(0.24, 0.06, 0.04), i % 2 ? P.hazardYellow : P.warnRed, [-0.72 + i * 0.36, 2.57, 5.27]), 1.3);
  }
  // Side cheek armour plates
  for (const s of [1, -1]) {
    put(box(0.12, 0.8, 0.5), hullPaint, [s * 1.5, 2.0, 5.2], { rotation: [0, 0, 0] });
    put(box(0.14, 0.05, 0.5), P.hazardYellow, [s * 1.5, 2.42, 5.2]);
    put(box(0.1, 0.25, 0.04), P.hazardBlack, [s * 1.5, 1.7, 5.46]);
  }
}
    return buildCabFace;
  })(),
  // runningGear
  (() => {
function buildRunningGear({ b, J, P, M }: any) {
  const R = 0.8;
  const TW = 0.62; // tyre width
  const rubberPaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const v = noise(p, 0.12, 4);
    return mix("#101114", "#26272c", smoothstep(0.3, 0.8, v) * 0.8 + (n.y > 0.6 ? 0.1 : 0));
  });
  const steelPaint = metal("steel", { tarnish: 0.3 });
  const darkMetal = panelled(metal("iron"), { size: 0.2, rivets: 0.05 });

  const hubTex = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#8b929c" stroke="#23262c" stroke-width="3"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#2ff3ff" stroke-width="4"/>
      <circle cx="50" cy="50" r="30" fill="#aab1bb" stroke="#23262c" stroke-width="2"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i * Math.PI) / 4;
        return `<circle cx="${50 + 22 * Math.cos(a)}" cy="${50 + 22 * Math.sin(a)}" r="3.6" fill="#23262c"/><circle cx="${50 + 22 * Math.cos(a) - 1}" cy="${50 + 22 * Math.sin(a) - 1}" r="1.4" fill="#e6e9ee"/>`;
      }).join("")}
      <circle cx="50" cy="50" r="10" fill="#23262c"/>
      <circle cx="50" cy="50" r="5" fill="#c5ccd6"/>
      <path d="M50 12 L54 22 L46 22Z" fill="#e7b814"/>
    </svg>`,
    { size: 256 },
  );

  const axles: [string, number][] = [["F", 3.4], ["M", 0.2], ["R", -3]];
  const wheelJoint: Record<string, any> = {
    FL: J.wheelFL, FR: J.wheelFR, ML: J.wheelML, MR: J.wheelMR, RL: J.wheelRL, RR: J.wheelRR,
  };

  for (const [ax, z] of axles) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const bone = wheelJoint[ax + side];
      const cx = s * 1.45;
      const at = [cx, 0.8, z];
      const dir = [s, 0, 0];
      // tyre: octagonal cylinder
      const tyreGeo = new THREE.CylinderGeometry(R, R, TW, 8, 1);
      b.part(tyreGeo, rubberPaint, { bone, at, dir, flat: true, rotation: undefined, name: `tyre${ax}${side}` });
      // sidewall shoulder rings (slightly smaller, chamfer look)
      for (const o of [1, -1]) {
        b.part(new THREE.CylinderGeometry(R * 0.9, R * 0.96, 0.06, 8), P.rubber, {
          bone, at: [cx + s * o * (TW / 2 + 0.02), 0.8, z], dir, flat: true,
        });
      }
      // tread blocks around the circumference
      const blocks: THREE.BufferGeometry[] = [];
      const N = 16;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const g = new THREE.BoxGeometry(TW * 0.92, 0.1, 0.2);
        // axis of wheel is local Y for cylinder; build in model space with axis X
        g.rotateX(a);
        g.translate(0, Math.cos(a) * (R + 0.03) * 0 + 0, 0);
        const m = new THREE.Matrix4().makeRotationX(a);
        const ng = new THREE.BoxGeometry(TW * 0.92, 0.1, 0.22);
        ng.translate(0, R + 0.02, 0);
        ng.applyMatrix4(m);
        ng.translate(cx, 0.8, z);
        blocks.push(ng);
      }
      // merge tread blocks manually
      const merged = mergeBoxes(blocks);
      b.part(merged, P.gunmetal, { bone, at: [0, 0, 0], flat: true, name: `tread${ax}${side}` });
      // hub disc textured, outer face
      const hubGeo = new THREE.CircleGeometry(0.5, 8);
      b.part(hubGeo, "#ffffff", {
        bone, at: [cx + s * (TW / 2 + 0.07), 0.8, z], dir: [s, 0, 0], axis: "z", texture: hubTex,
      });
      // hub dish (steel) behind
      b.part(new THREE.CylinderGeometry(0.52, 0.5, 0.12, 8), steelPaint, {
        bone, at: [cx + s * (TW / 2 + 0.01), 0.8, z], dir, flat: true,
      });
      // centre cap
      b.part(new THREE.CylinderGeometry(0.14, 0.18, 0.12, 8), P.hydraulicChrome, {
        bone, at: [cx + s * (TW / 2 + 0.12), 0.8, z], dir, flat: true,
      });
      glow(
        b.part(new THREE.TorusGeometry(0.43, 0.018, 4, 16), P.neonCyan, {
          bone, at: [cx + s * (TW / 2 + 0.075), 0.8, z], dir, axis: "z",
        }),
        1.4,
      );
      // bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), P.steel, {
          bone,
          at: [cx + s * (TW / 2 + 0.1), 0.8 + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3],
          dir,
        });
      }
      // inner hub
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), P.gunmetal, {
        bone, at: [cx - s * (TW / 2 + 0.05), 0.8, z], dir, flat: true,
      });

      // mudguard lip (on body)
      b.part(new THREE.BoxGeometry(0.78, 0.07, 1.5), darkMetal, {
        bone: J.body, at: [s * 1.45, 1.66, z],
      });
      b.part(new THREE.BoxGeometry(0.78, 0.5, 0.07), darkMetal, {
        bone: J.body, at: [s * 1.45, 1.45, z + 0.78], rotation: [20, 0, 0],
      });
      b.part(new THREE.BoxGeometry(0.78, 0.5, 0.07), darkMetal, {
        bone: J.body, at: [s * 1.45, 1.45, z - 0.78], rotation: [-20, 0, 0],
      });
      b.part(new THREE.BoxGeometry(0.84, 0.05, 1.5), P.hazardYellow, {
        bone: J.body, at: [s * 1.45, 1.7, z],
      });

      // suspension arm and leaf spring
      b.rod([s * 0.9, 0.95, z], [s * 1.18, 0.8, z], 0.07, { bone: J.body, color: P.gunmetal, sides: 6 });
      for (let k = 0; k < 4; k++) {
        const len = 1.5 - k * 0.22;
        b.part(new THREE.BoxGeometry(0.1, 0.045, len), P.armorGrey, {
          bone: J.body, at: [s * 0.95, 0.98 - k * 0.05 + 0.1, z],
        });
      }
      b.part(new THREE.BoxGeometry(0.16, 0.05, 0.2), P.steel, { bone: J.body, at: [s * 0.95, 1.08, z] });
      // shock absorber
      b.rod([s * 0.75, 1.4, z + 0.25], [s * 1.1, 0.9, z + 0.25], 0.045, { bone: J.body, color: P.hydraulicChrome, sides: 6 });
    }
    // axle housing across
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 8), darkMetal, {
      bone: J.body, at: [0, 0.8, z], dir: [1, 0, 0], flat: true,
    });
    // differential bulge
    b.part(new THREE.SphereGeometry(0.34, 8, 6), darkMetal, {
      bone: J.body, at: [0, 0.8, z], scale: [1, 0.9, 1.1], flat: true,
    });
    b.part(new THREE.BoxGeometry(0.5, 0.3, 0.14), P.hullDark, { bone: J.body, at: [0, 0.78, z + 0.3] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), P.warnRed, {
      bone: J.body, at: [0, 0.78, z + 0.38], dir: [0, 0, 1],
    });
    // cross beam bolting to hull
    b.part(new THREE.BoxGeometry(1.8, 0.14, 0.26), P.hullDark, { bone: J.body, at: [0, 1.0, z] });
  }

  // drive shaft with joints
  b.rod([0, 0.62, 3.4], [0, 0.62, -3], 0.07, { bone: J.body, color: P.steel, sides: 8 });
  for (const z of [3.4, 1.8, 0.2, -1.4, -3]) {
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 8), P.gunmetal, {
      bone: J.body, at: [0, 0.62, z], dir: [0, 0, 1], flat: true,
    });
  }
  // longitudinal frame beams
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.14, 0.2, 8.0), P.hullDark, { bone: J.body, at: [s * 0.7, 0.95, 0.1] });
  }
}

function mergeBoxes(list: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  let off = 0;
  for (const g of list) {
    const p = g.getAttribute("position");
    const n = g.getAttribute("normal");
    const u = g.getAttribute("uv");
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i));
      nor.push(n.getX(i), n.getY(i), n.getZ(i));
      uv.push(u.getX(i), u.getY(i));
    }
    const ix = g.getIndex()!;
    for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  out.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  out.setIndex(idx);
  return out;
}
    return buildRunningGear;
  })(),
  // stabilisers
  (() => {
function buildStabilisers({ b, J, P }: Ctx) {
  const HAZ = svg(
    `<svg viewBox="0 0 32 48"><rect width="32" height="48" fill="#18181a"/>` +
      `<path d="M0 10 L16 22 L32 10 L32 22 L16 34 L0 22Z M0 30 L16 42 L32 30 L32 42 L16 54 L0 42Z" fill="#e7b814"/></svg>`,
    { size: 96 },
  );
  const legs: [string, number, number][] = [
    ["stabFL", 1, -0.6],
    ["stabFR", -1, -0.6],
    ["stabRL", 1, -3.6],
    ["stabRR", -1, -3.6],
  ];
  const lerp = (a: number[], c: number[], t: number) => a.map((v, i) => v + (c[i] - v) * t);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  for (const [name, s, z] of legs) {
    const bone = J[name];
    const A = [s * 1.3, 1.2, z];
    const F = [s * 2.0, 0.32, z];
    const d = [F[0] - A[0], F[1] - A[1], 0];
    const len = Math.hypot(d[0], d[1]);
    const dn = [d[0] / len, d[1] / len, 0];
    const n = [-dn[1] * -1 * 0 + s * 0.654, 0.755, 0]; // up-outward normal

    // shoulder bracket + pivot
    b.part(box(0.34, 0.55, 0.5), P.armorGrey, { bone, at: [s * 1.2, 1.2, z] });
    for (const k of [-1, 1]) {
      b.part(box(0.3, 0.5, 0.07), P.gunmetal, { bone, at: [s * 1.38, 1.2, z + k * 0.27] });
    }
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.62, 8), P.hydraulicChrome, {
      bone, at: [s * 1.38, 1.2, z], dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 6), P.gunmetal, {
      bone, at: [s * 1.38, 1.2, z], dir: [0, 0, 1],
    });
    // bolts on bracket
    for (const [dy, dz] of [[-0.18, -0.2], [0.18, -0.2], [-0.18, 0.2], [0.18, 0.2]])
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, {
        bone, at: [s * 1.04, 1.2 + dy, z + dz], dir: [s, 0, 0],
      });

    // outer sleeve (box section)
    const sleeveEnd = lerp(A, F, 0.56);
    b.rod(A, sleeveEnd, 0.1, P.armorGrey, { bone, section: "box", caps: "flat" });
    // piston
    b.rod(lerp(A, F, 0.5), lerp(A, F, 0.93), 0.062, P.hydraulicChrome, { bone, sides: 8, caps: "flat" });
    // hazard collar
    const c0 = lerp(A, F, 0.5);
    const c1 = lerp(A, F, 0.6);
    b.rod(c0, c1, 0.125, paint((_p, _n, sv) => (Math.floor(sv[1] / 30) % 2 ? P.hazardYellow : P.hazardBlack)), {
      bone, sides: 12, caps: "flat",
    });
    // hazard decal on sleeve
    const dm = lerp(A, F, 0.28);
    b.part(new THREE.PlaneGeometry(0.15, 0.3), "#ffffff", {
      bone, at: [dm[0] + n[0] * 0.104, dm[1] + n[1] * 0.104, z], dir: n, axis: "z", up: dn, texture: HAZ,
    });
    // sleeve rib rings
    for (const t of [0.1, 0.4]) {
      const p = lerp(A, F, t);
      b.part(box(0.24, 0.05, 0.24), P.gunmetal, { bone, at: p, dir: dn, rotation: [0, 0, s * -49] });
    }
    // hydraulic hose
    b.rod(lerp(A, F, 0.08).map((v, i) => v + (i === 1 ? 0.14 : 0)), lerp(A, F, 0.5).map((v, i) => v + (i === 1 ? 0.16 : 0)), 0.025, P.rubber, { bone, sides: 6 });
    // warning light
    const lp = lerp(A, F, 0.18);
    b.part(box(0.1, 0.06, 0.12), P.gunmetal, { bone, at: [lp[0] + n[0] * 0.12, lp[1] + n[1] * 0.12, z] });
    glow(
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.warnRed, {
        bone, at: [lp[0] + n[0] * 0.18, lp[1] + n[1] * 0.18, z],
      }),
      1.6,
    );

    // knuckle
    b.part(new THREE.SphereGeometry(0.14, 8, 6), P.gunmetal, { bone, at: [F[0], F[1], z] });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 8), P.steel, { bone, at: [F[0], F[1], z], dir: [0, 0, 1] });
    // footpad
    const px = F[0];
    b.part(new THREE.CylinderGeometry(0.5, 0.54, 0.12, 8), P.padOrange, { bone, at: [px, 0.06, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.4, 0.46, 0.06, 8), P.armorGrey, { bone, at: [px, 0.15, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 8), P.gunmetal, { bone, at: [px, 0.22, z], flat: true });
    b.part(box(0.84, 0.06, 0.09), P.gunmetal, { bone, at: [px, 0.2, z] });
    b.part(box(0.09, 0.06, 0.84), P.gunmetal, { bone, at: [px, 0.2, z] });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.steel, {
        bone, at: [px + Math.cos(a) * 0.43, 0.2, z + Math.sin(a) * 0.43],
      });
    }
    // hazard edge strip on pad front
    b.part(box(0.4, 0.04, 0.03), P.hazardYellow, { bone, at: [px, 0.13, z + 0.5] });
  }
}
    return buildStabilisers;
  })(),
  // turretMount
  (() => {
function buildTurretMount({ b, J, P, M }: any) {
  const T = J.turret;
  const OLIVE = P.hullOlive, DARK = P.hullDark, GREY = P.armorGrey, GUN = P.gunmetal;
  const YEL = P.hazardYellow, BLK = P.hazardBlack, CY = P.neonCyan, CHROME = P.hydraulicChrome, STEEL = P.steel;

  const armor = paint((p, n) => {
    const base = mix(OLIVE, DARK, 0.35 * smoothstep(0.3, 0.8, noise(p, 0.5, 3)));
    const top = smoothstep(0.3, 1, n.y);
    const c = mix(base, "#7c8566", 0.3 * top);
    const seamX = Math.abs(((p.x * 2.5) % 1 + 1) % 1 - 0.5) > 0.485;
    const seamZ = Math.abs(((p.z * 2.5) % 1 + 1) % 1 - 0.5) > 0.485;
    return seamX || seamZ ? mix(c, "#1a1d16", 0.7) : c;
  });

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${YEL}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 1} 16Z" fill="${BLK}"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const cellTex = svg(
    `<svg viewBox="0 0 32 64"><rect width="32" height="64" fill="#0b3a42"/><rect x="5" y="4" width="22" height="56" rx="3" fill="${CY}"/><rect x="9" y="8" width="5" height="48" fill="#d8ffff"/><path d="M5 20H27M5 34H27M5 48H27" stroke="#0b3a42" stroke-width="2"/></svg>`,
    { size: 64 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4L62 58H2Z" fill="${YEL}" stroke="${BLK}" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="18" fill="${BLK}"/><rect x="29" y="44" width="6" height="6" fill="${BLK}"/></svg>`,
    { size: 96 },
  );
  const teethTex = null;

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: T, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone: T, at, ...extra });

  // slewing ring with teeth
  b.lathe(
    [[0, 0], [1.15, 0], [1.15, 0.1], [1.0, 0.16], [0.8, 0.16], [0, 0.16]],
    { at: [0, 1.76, -1.2], bone: T, color: GUN, segments: 24 },
  );
  b.lathe(
    [[0.95, 0], [1.2, 0], [1.2, 0.08], [0.95, 0.08]],
    { at: [0, 1.84, -1.2], bone: T, color: STEEL, segments: 24 },
  );
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    box(0.09, 0.08, 0.1, GUN, [Math.sin(a) * 1.22, 1.88, -1.2 + Math.cos(a) * 1.22], { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // turret base: octagonal-ish squat body
  cyl(1.05, 1.15, 0.5, 8, armor, [0, 2.15, -1.2], { flat: true, rotation: [0, 22.5, 0] });
  // faceted side cheeks
  for (const s of [1, -1]) {
    b.frustumBox([s * 0.85, 2.4, -1.9], [s * 0.85, 2.4, -0.5], [0.3, 0.55], [0.3, 0.55], { color: armor, bone: T });
    box(0.22, 0.5, 1.5, armor, [s * 0.98, 2.35, -1.2], { rotation: [0, 0, -s * 14] });
    box(0.05, 0.12, 1.2, CY, [s * 1.1, 2.3, -1.2]);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.06, 1.1), CY, { bone: T, at: [s * 1.13, 2.3, -1.2] }), 1.4);
    // trunnion yokes
    box(0.2, 0.75, 0.6, armor, [s * 0.5, 2.85, -1.2]);
    box(0.16, 0.2, 0.7, GUN, [s * 0.5, 3.18, -1.2], { rotation: [0, 0, s * 8] });
    cyl(0.16, 0.16, 0.3, 10, STEEL, [s * 0.52, 2.6, -1.2], { rotation: [0, 0, 90] });
    cyl(0.07, 0.07, 0.34, 8, GUN, [s * 0.52, 2.6, -1.2], { rotation: [0, 0, 90] });
  }
  // front glacis wedge
  b.frustumBox([0, 2.15, -0.45], [0, 2.15, 0.2], [1.5, 0.5], [1.2, 0.3], { color: armor, bone: T });
  b.part(new THREE.BoxGeometry(1.2, 0.08, 0.16), "#ffffff", { bone: T, at: [0, 2.4, 0.15], texture: hazard });

  // elevation actuator
  b.rod([0.0, 2.05, -0.2], [0.0, 2.6, 0.3], 0.07, CHROME, { bone: T });
  b.rod([0.0, 2.05, -0.2], [0.0, 2.3, 0.05], 0.11, GUN, { bone: T });
  cyl(0.14, 0.14, 0.24, 8, STEEL, [0, 2.05, -0.2], { rotation: [0, 0, 90] });

  // rear capacitor housing
  box(2.0, 1.0, 1.5, armor, [0, 2.4, -3.1]);
  box(2.1, 0.08, 1.6, GUN, [0, 2.93, -3.1]);
  box(2.1, 0.1, 1.6, GUN, [0, 1.93, -3.1]);
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.02), "#ffffff", { bone: T, at: [0, 2.78, -3.86], texture: hazard });
  for (let i = 0; i < 4; i++) {
    const x = -0.66 + i * 0.44;
    glow(b.part(new THREE.BoxGeometry(0.3, 0.62, 0.03), "#ffffff", { bone: T, at: [x, 2.38, -3.87], texture: cellTex }), 1.5);
    box(0.34, 0.66, 0.02, GUN, [x, 2.38, -3.86]);
  }
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: T, at: [0.9, 2.7, -3.87], texture: warn, dir: [0, 0, -1], axis: "z" });
  // side fins
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) box(0.06, 0.7, 0.09, GUN, [s * 1.04, 2.4, -3.7 + i * 0.25]);
  // rivets on top
  for (let i = 0; i < 6; i++) for (const s of [1, -1]) cyl(0.025, 0.025, 0.03, 6, STEEL, [s * 0.9, 2.97, -3.7 + i * 0.25]);

  // rear radiator
  box(1.6, 0.8, 0.12, GUN, [0, 2.3, -4.0 + 0.02]);
  for (let i = 0; i < 8; i++) box(1.5, 0.04, 0.14, STEEL, [0, 1.98 + i * 0.1, -3.96]);

  // equipment platform + crane (left side)
  box(0.7, 0.06, 1.6, STEEL, [-1.1, 2.1, -2.7]);
  box(0.7, 0.04, 1.6, GUN, [-1.1, 2.05, -2.7]);
  cyl(0.07, 0.09, 0.9, 8, GUN, [-1.2, 2.55, -3.2]);
  b.rod([-1.2, 3.0, -3.2], [-1.1, 2.9, -2.4], 0.05, YEL, { bone: T });
  b.rod([-1.1, 2.9, -2.4], [-1.1, 2.35, -2.4], 0.012, STEEL, { bone: T });
  box(0.1, 0.1, 0.1, GUN, [-1.1, 2.3, -2.4]);

  // hazard handrails
  for (const [x, z0, z1] of [[-1.42, -3.4, -2.0], [1.05, -3.2, -2.4]] as number[][]) {
    const dashed = hazard;
    b.rod([x, 2.55, z0], [x, 2.55, z1], 0.025, YEL, { bone: T });
    b.rod([x, 2.3, z0], [x, 2.3, z1], 0.02, YEL, { bone: T });
    for (const z of [z0, z1]) b.rod([x, 2.1, z], [x, 2.55, z], 0.025, BLK, { bone: T });
  }
  void teethTex;

  // ladder on right side
  for (const s of [1]) {
    b.rod([1.1, 1.85, -2.2], [1.1, 2.85, -2.2], 0.025, STEEL, { bone: T });
    b.rod([1.1, 1.85, -1.8], [1.1, 2.85, -1.8], 0.025, STEEL, { bone: T });
    for (let i = 0; i < 7; i++) b.rod([1.1, 1.95 + i * 0.14, -2.2], [1.1, 1.95 + i * 0.14, -1.8], 0.015, STEEL, { bone: T });
  }

  // hatch + warning light on turret roof
  cyl(0.28, 0.3, 0.1, 8, GREY, [0.45, 2.45, -0.9]);
  cyl(0.06, 0.06, 0.08, 6, STEEL, [0.45, 2.52, -0.9]);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.warnRed, { bone: T, at: [-0.5, 2.45, -0.6] }), 1.5);
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: T, at: [1.13, 2.3, -0.5], texture: warn, dir: [1, 0, 0], axis: "z", up: [0, 1, 0] });
}
    return buildTurretMount;
  })(),
  // railgun
  (() => {
function buildRailgun({ b, J, P, M }: any) {
  const gun = J.gun;
  const CYAN = P.neonCyan, GM = P.gunmetal, ST = P.hydraulicChrome;
  const HY = P.hazardYellow, HB = P.hazardBlack, GREY = P.armorGrey;
  const Z0 = -4.0, Z1 = 5.4, Y = 2.6;

  const metalPaint = paint((p, n) => {
    const v = noise(p, 0.25, 3);
    const base = mix("#1b1e23", "#363b44", v);
    const lit = mix(base, "#5a616d", smoothstep(0.5, 1, n.y) * 0.5);
    return lit;
  });
  const armor = paint((p, n) => {
    const v = noise(p, 0.3, 8);
    const c = mix(P.hullDark, GREY, v * 0.6 + smoothstep(0.3, 1, n.y) * 0.3);
    const seam = Math.abs(((p.z * 2.5) % 1)) < 0.03;
    return seam ? "#15171a" : c;
  });

  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: gun, at: [x, y, z], name });
  const cyl = (r0: number, r1: number, len: number, col: any, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), col, { bone: gun, at: [x, y, z], dir: [0, 0, 1] });

  // Rails
  for (const s of [1, -1]) {
    box(0.22, 0.3, 8.6, metalPaint, s * 0.2, Y + 0.08, 0.7, "rail");
    box(0.06, 0.1, 8.4, CYAN, s * 0.09, Y + 0.08, 0.7);
    box(0.1, 0.06, 8.4, ST, s * 0.2, Y + 0.26, 0.7);
  }
  glow(b.part(new THREE.BoxGeometry(0.04, 0.08, 8.2), CYAN, { bone: gun, at: [0, Y + 0.08, 0.7] }), 1.4);

  // Bottom spine
  box(0.46, 0.14, 8.0, GM, 0, Y - 0.14, 0.5);

  // Breech block
  box(0.9, 0.8, 1.3, armor, 0, Y + 0.05, Z0 + 0.65, "breech");
  b.part(new THREE.CylinderGeometry(0.3, 0.4, 0.4, 8), GREY, { bone: gun, at: [0, Y + 0.05, Z0 + 0.2], dir: [0, 0, 1] });
  box(0.7, 0.2, 0.9, GM, 0, Y + 0.5, Z0 + 0.7);
  for (const s of [1, -1]) {
    box(0.06, 0.5, 0.9, HY, s * 0.46, Y + 0.05, Z0 + 0.65);
    cyl(0.06, 0.06, 1.0, ST, s * 0.5, Y - 0.2, Z0 + 0.9, 6);
  }

  // Recoil sleeve + chrome rods
  box(0.8, 0.6, 1.5, armor, 0, Y + 0.05, -2.2, "sleeve");
  for (const [x, y] of [[0.25, 0.28], [-0.25, 0.28], [0.25, -0.2], [-0.25, -0.2]] as number[][])
    cyl(0.04, 0.04, 2.2, ST, x, Y + y, -1.2, 6);

  // Trunnion collar around pivot
  for (const s of [1, -1]) cyl(0.17, 0.17, 0.2, ST, s * 0.5, Y, -1.2, 8).rotation.z = 0;
  box(1.0, 0.1, 0.5, GM, 0, Y - 0.22, -1.2);

  // Capacitor coils
  for (let i = 0; i < 9; i++) {
    const z = -0.7 + i * 0.62;
    const t = new THREE.TorusGeometry(0.4, 0.07, 5, 8);
    glow(b.part(t, CYAN, { bone: gun, at: [0, Y + 0.08, z] }), 1.5);
    box(0.84, 0.05, 0.14, GM, 0, Y + 0.08 + 0.4, z);
    box(0.84, 0.05, 0.14, GM, 0, Y + 0.08 - 0.4, z);
    for (const s of [1, -1]) {
      box(0.1, 0.5, 0.18, GM, s * 0.44, Y + 0.08, z);
      // insulator spacers
      cyl(0.06, 0.06, 0.38, GREY, s * 0.2, Y + 0.08, z + 0.42, 6);
    }
  }

  // Power bus cables
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.52, Y - 0.15, Z0 + 1.2], [s * 0.6, Y + 0.0, -2], [s * 0.58, Y - 0.1, 0.5],
      [s * 0.6, Y + 0.0, 2.5], [s * 0.55, Y - 0.05, 4.4],
    ];
    b.sweep(pts, 0.04, { bone: gun, color: HB, sides: 6 });
    b.sweep(pts.map((p) => [p[0], p[1] + 0.07, p[2]]), 0.025, { bone: gun, color: HY, sides: 5 });
  }

  // Muzzle brake
  b.part(new THREE.CylinderGeometry(0.6, 0.38, 0.9, 8), metalPaint, { bone: gun, at: [0, Y + 0.08, 4.95], dir: [0, 0, 1] });
  box(1.3, 0.62, 0.6, armor, 0, Y + 0.08, 4.9, "muzzleBrake");
  for (const s of [1, -1]) {
    box(0.1, 0.7, 0.75, GM, s * 0.66, Y + 0.08, 5.0);
    glow(box(0.05, 0.12, 0.5, CYAN, s * 0.71, Y + 0.08, 5.0), 1.5);
  }
  glow(box(0.9, 0.08, 0.1, CYAN, 0, Y + 0.08, 5.22), 1.6);
  // hazard muzzle tip
  const stripe = paint((p) => (Math.floor((p.x + p.y) / 0.1) % 2 ? "#e7b814" : "#18181a"));
  box(1.4, 0.72, 0.18, stripe, 0, Y + 0.08, 5.31);
  box(0.8, 0.3, 0.1, "#05080a", 0, Y + 0.08, 5.38);

  // Targeting sensor on top
  box(0.3, 0.1, 0.4, GM, 0, Y + 0.58, 1.6);
  b.part(new THREE.SphereGeometry(0.1, 8, 6), GREY, { bone: gun, at: [0, Y + 0.6, 1.6] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), CYAN, { bone: gun, at: [0, Y + 0.6, 1.7] }), 1.6);
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 4), ST, { bone: gun, at: [0.12, Y + 0.64, 1.5] });

  // Warning labels
  const label = svg(
    `<svg viewBox="0 0 120 40"><rect width="120" height="40" fill="#e7b814"/><rect x="2" y="2" width="116" height="36" fill="none" stroke="#18181a" stroke-width="2"/><path d="M8 32 L20 8 L32 32Z" fill="#18181a"/><text x="38" y="19" font-family="monospace" font-weight="bold" font-size="12" fill="#18181a">HIGH VOLTAGE</text><text x="38" y="33" font-family="monospace" font-size="9" fill="#d8322b">RAILGUN 25MJ</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.0, 0.33), "#ffffff", {
      bone: gun, at: [s * 0.531, Y + 0.05, -2.2], dir: [s, 0, 0], axis: "z", texture: label,
    });
  b.part(new THREE.PlaneGeometry(0.6, 0.2), "#ffffff", {
    bone: gun, at: [0, Y + 0.357, Z0 + 0.7], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: label,
  });

  // Barrel shroud ribs in front of coils
  for (let i = 0; i < 4; i++) box(0.5, 0.2, 0.12, GM, 0, Y + 0.12, 3.5 + i * 0.35);
}
    return buildRailgun;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.3,0], dir: [0,0,1], role: "spine" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,1.85,-1.2], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gun"] = b.joint("gun", { parent: J["turret"], at: [0,2.6,-1.2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.45,0.8,3.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.45,0.8,3.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.45,0.8,0.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.45,0.8,0.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.45,0.8,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.45,0.8,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["stabFL"] = b.joint("stabFL", { parent: J["body"], at: [1.3,1.2,-0.6], dir: [0.6,-0.8,0], role: "leg", group: "stabilisers" });
  J["stabFR"] = b.joint("stabFR", { parent: J["body"], at: [-1.3,1.2,-0.6], dir: [-0.6,-0.8,0], role: "leg", group: "stabilisers" });
  J["stabRL"] = b.joint("stabRL", { parent: J["body"], at: [1.3,1.2,-3.6], dir: [0.6,-0.8,0], role: "leg", group: "stabilisers" });
  J["stabRR"] = b.joint("stabRR", { parent: J["body"], at: [-1.3,1.2,-3.6], dir: [-0.6,-0.8,0], role: "leg", group: "stabilisers" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

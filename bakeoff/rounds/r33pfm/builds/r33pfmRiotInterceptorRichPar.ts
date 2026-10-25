import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, mix, smoothstep, noise, rng, offset, catmull } from "../../../../src/index";
import { panelled, metal, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Arasaka-style Riot Interceptor RC-9",
  "description": "A heavy corporate riot-control interceptor truck in Cyberpunk 2077 style, with a roof-mounted water cannon turret, neon light bars, armoured plating and corporate livery."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b2f3a",
  hullDark: "#14161d",
  hullLight: "#4a5262",
  trim: "#f2c200",
  corpRed: "#d0152b",
  white: "#e9edf2",
  glass: "#0b1a2a",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonAmber: "#ffb020",
  rubber: "#0d0d10",
  rim: "#8a919e",
  steel: "#6b7280",
  tankBlue: "#2a6fb0",
  warnRed: "#ff3030",
};
const M = {
  chassisTop: [0, 1.15, 0] as [number, number, number],
  frontAxle: [0, 0.55, 2] as [number, number, number],
  midAxle: [0, 0.55, -0.3] as [number, number, number],
  rearAxle: [0, 0.55, -2.1] as [number, number, number],
  cabFloor: [0, 1.15, 1.2] as [number, number, number],
  cargoRoof: [0, 2.1, -1.7] as [number, number, number],
  turretRing: [0, 2.1, -1.6] as [number, number, number],
  cannonPivot: [0, 2.45, -1.6] as [number, number, number],
  bumperFront: [0, 0.7, 3.2] as [number, number, number],
  roofBar: [0, 2.3, 1.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const SIDES = [1, -1];
  const AXLES = [2, -0.3, -2.1];

  // ---------- helpers ----------
  const box = (
    size: [number, number, number],
    color: any,
    at: [number, number, number],
    extra: Record<string, any> = {},
  ) => b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: body, at, ...extra });
  const cyl = (
    r0: number,
    r1: number,
    h: number,
    sides: number,
    color: any,
    at: [number, number, number],
    dir: [number, number, number],
  ) => b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { bone: body, at, dir });
  const archOutline = (w: number, top: number, bottom: number): any[] => [
    [-w, bottom, "sharp"],
    [w, bottom, "sharp"],
    [w, top - 0.2, "sharp"],
    [w - 0.2, top, "sharp"],
    [-(w - 0.2), top, "sharp"],
    [-w, top - 0.2, "sharp"],
  ];

  // ---------- textures ----------
  const chevrons = Array.from(
    { length: 7 },
    (_, i) => `<polyline points="${i * 20 - 6},4 ${i * 20 + 8},16 ${i * 20 - 6},28" fill="none" stroke="#0d0d10" stroke-width="7" stroke-linejoin="miter"/>`,
  ).join("");
  const CHEV = svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="32" fill="#f2c200"/>${chevrons}<rect y="0" width="128" height="2.5" fill="#0d0d10"/><rect y="29.5" width="128" height="2.5" fill="#0d0d10"/></svg>`,
    { size: 256 },
  );
  const LIVERY = svg(
    `<svg viewBox="0 0 860 20" xmlns="http://www.w3.org/2000/svg">
      <rect width="860" height="20" fill="#d0152b"/>
      <rect y="0" width="860" height="1.6" fill="#0d0d10"/>
      <rect y="18.4" width="860" height="1.6" fill="#0d0d10"/>
      <rect y="14.5" width="860" height="2" fill="#e9edf2"/>
      <circle cx="12" cy="9" r="7" fill="#e9edf2"/>
      <path d="M5 9 Q12 3 19 9 Q12 15 5 9Z" fill="#d0152b"/>
      <circle cx="12" cy="9" r="2.4" fill="#0d0d10"/>
      <text x="30" y="13" font-family="Arial Black, Arial, sans-serif" font-weight="bold" font-size="12" letter-spacing="4" fill="#e9edf2">RC-9 PACIFIER</text>
      <polygon points="700,0 860,0 860,20 680,20" fill="#e9edf2"/>
      <polygon points="730,0 760,0 740,20 710,20" fill="#d0152b"/>
      <polygon points="780,0 800,0 780,20 760,20" fill="#d0152b"/>
      <text x="814" y="13" font-family="Arial, sans-serif" font-weight="bold" font-size="10" fill="#14161d">ARC</text>
    </svg>`,
    { size: 2048 },
  );

  // ---------- paint ----------
  const hullBase = paint((p, n) => {
    const grime = smoothstep(0.75, 0.25, p.y) * (0.5 + 0.5 * noise(p, 0.3, 4));
    const top = smoothstep(0.4, 1, n.y) * 0.25;
    const c = mix(P.hull, P.hullDark, grime * 0.7);
    return mix(c, P.hullLight, top);
  });
  const HULL = panelled(hullBase, { size: 0.55, aspect: 0.6, rivets: 0.11 });

  // ---------- main hull: sloped-side slab ----------
  b.extrude(
    [
      [-1.0, 0.25, "sharp"],
      [1.0, 0.25, "sharp"],
      [1.3, 0.5, "sharp"],
      [1.3, 1.06, "sharp"],
      [1.22, 1.15, "sharp"],
      [-1.22, 1.15, "sharp"],
      [-1.3, 1.06, "sharp"],
      [-1.3, 0.5, "sharp"],
    ] as any,
    { at: [0, 0, -0.05], x: [1, 0, 0], thickness: 6.1, color: HULL, bone: body, name: "hull" },
  );

  // skid plate + sloped nose skid
  box([1.9, 0.07, 5.6], P.hullDark, [0, 0.235, -0.1]);
  box([1.9, 0.06, 0.55], P.steel, [0, 0.31, 2.85], { rotation: [-22, 0, 0] });
  for (const z of [-2.0, -1.0, 0, 1.0, 2.0]) box([1.7, 0.03, 0.06], P.hullLight, [0, 0.205, z]);

  // front lower armour plate
  box([2.6, 0.32, 0.1], P.hullDark, [0, 0.52, 2.95]);
  for (const s of SIDES) {
    // front tow eyes
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.trim, { bone: body, at: [s * 0.8, 0.5, 3.0], dir: [0, 0, 1], axis: "z" });
    box([0.1, 0.08, 0.08], P.steel, [s * 0.8, 0.5, 2.97]);
  }

  // ---------- wheel arches, axles ----------
  for (const s of SIDES) {
    AXLES.forEach((z) => {
      b.extrude(archOutline(0.74, 0.92, 0.27), {
        at: [s * 1.29, 0, z],
        x: [0, 0, 1],
        thickness: 0.07,
        color: P.trim,
        bone: body,
        name: "archTrim",
      });
      b.extrude(archOutline(0.65, 0.85, 0.27), {
        at: [s * 1.31, 0, z],
        x: [0, 0, 1],
        thickness: 0.12,
        color: P.hullDark,
        bone: body,
        name: "archDark",
      });
      // axle housing stub & suspension
      cyl(0.1, 0.12, 0.42, 8, P.steel, [s * 1.12, 0.55, z], [1, 0, 0]);
      cyl(0.16, 0.16, 0.12, 8, P.hullLight, [s * 0.96, 0.55, z], [1, 0, 0]);
      box([0.14, 0.07, 0.8], P.hullDark, [s * 1.0, 0.36, z]);
      box([0.1, 0.34, 0.1], P.steel, [s * 1.05, 0.72, z + 0.3], { rotation: [0, 0, s * 10] });
    });
  }
  // inner axle differentials
  for (const z of [AXLES[0], AXLES[2]]) {
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.steel, { bone: body, at: [0, 0.4, z], scale: [1, 0.8, 1] });
    cyl(0.07, 0.07, 1.9, 6, P.steel, [0, 0.4, z], [1, 0, 0]);
  }

  // ---------- skirts with chevrons ----------
  const gaps: [number, number][] = [
    [0.4, 1.3],
    [-1.4, -1.0],
    [2.7, 2.98],
  ];
  for (const s of SIDES) {
    for (const [z0, z1] of gaps) {
      const len = z1 - z0 - 0.04;
      const zc = (z0 + z1) / 2;
      box([0.05, 0.5, len + 0.04], P.hullDark, [s * 1.29, 0.58, zc]);
      b.part(new THREE.PlaneGeometry(len, 0.42), "#ffffff", {
        bone: body,
        at: [s * 1.317, 0.58, zc],
        dir: [s, 0, 0],
        up: [0, 1, 0],
        axis: "z",
        texture: CHEV,
      });
    }
    // livery stripe above arches
    b.part(new THREE.PlaneGeometry(5.2, 0.12), "#ffffff", {
      bone: body,
      at: [s * 1.305, 1.0, -0.1],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      axis: "z",
      texture: LIVERY,
    });
    // amber side markers
    for (const z of [2.82, -2.92])
      glow(box([0.04, 0.09, 0.2], P.neonAmber, [s * 1.31, 1.0, z]), 1.5);
  }

  // ---------- magenta underglow strips ----------
  const glowSegs: [number, number][] = [
    [2.72, 2.98],
    [0.42, 1.28],
    [-1.38, -1.02],
    [-3.0, -2.78],
    [-0.9, -0.6],
  ];
  for (const s of SIDES) {
    for (const [z0, z1] of glowSegs) {
      if (z0 === -0.9) continue;
      glow(box([0.05, 0.05, z1 - z0], P.neonMagenta, [s * 1.32, 0.31, (z0 + z1) / 2]), 2);
    }
    // inner continuous glow under the sill
    glow(box([0.04, 0.04, 5.4], P.neonMagenta, [s * 0.98, 0.26, -0.1]), 1.6);
  }

  // ---------- rear bumper, tail lights, tow hook, exhaust ----------
  box([2.6, 0.4, 0.1], P.hullLight, [0, 0.5, -3.15]);
  b.part(new THREE.PlaneGeometry(1.5, 0.24), "#ffffff", {
    bone: body,
    at: [0, 0.5, -3.205],
    dir: [0, 0, -1],
    up: [0, 1, 0],
    axis: "z",
    texture: CHEV,
  });
  for (const s of SIDES) {
    box([0.55, 0.2, 0.05], P.hullDark, [s * 0.95, 0.88, -3.12]);
    glow(box([0.46, 0.12, 0.05], P.warnRed, [s * 0.95, 0.88, -3.15]), 2);
    glow(box([0.12, 0.12, 0.05], P.neonAmber, [s * 1.18, 0.88, -3.15]), 1.2);
    // exhaust pipes
    cyl(0.085, 0.085, 0.32, 8, P.steel, [s * 0.6, 0.42, -3.28], [0, 0, 1]);
    cyl(0.1, 0.1, 0.06, 8, P.hullDark, [s * 0.6, 0.42, -3.42], [0, 0, 1]);
    cyl(0.055, 0.055, 0.02, 8, "#000000", [s * 0.6, 0.42, -3.455], [0, 0, 1]);
    box([0.14, 0.03, 0.5], P.trim, [s * 0.6, 0.62, -3.2]);
  }
  glow(box([0.6, 0.05, 0.05], P.warnRed, [0, 0.88, -3.13]), 1.6);
  // tow hook
  box([0.14, 0.12, 0.2], P.steel, [0, 0.4, -3.3]);
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone: body, at: [0, 0.4, -3.43], dir: [0, 1, 0], axis: "z" });
  // bumper bolts
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++)
    bolts.push(new THREE.SphereGeometry(0.025, 5, 4).translate(-1.15 + i * 0.29, 0.66, -3.22));
  b.part(mergeGeometries(bolts)!, P.steel, { bone: body, at: [0, 0, 0] });

  // ---------- top-edge hazard trim & details ----------
  for (const s of SIDES) {
    box([0.06, 0.04, 6.0], P.trim, [s * 1.2, 1.165, -0.1]);
    // vent grilles on the sill between the arches
    for (let i = 0; i < 4; i++) box([0.03, 0.025, 0.4], P.hullDark, [s * 1.31, 0.82 - i * 0.0, 0.85 + 0.0 + i * 0.0 + 0.0]);
  }
  // fuel cap + brackets
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), P.steel, { bone: body, at: [-1.31, 0.7, 0.85], dir: [-1, 0, 0] });
  // cross braces on the underside
  for (const z of [-2.6, -1.0, 0.8, 2.4]) box([2.0, 0.06, 0.1], P.steel, [0, 0.215, z]);
}
    return buildChassis;
  })(),
  // cabAndBumper
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildCabAndBumper({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: body, at, ...o });
  const lit = (g: THREE.BufferGeometry, color: string, at: number[], s = 1.6, o: any = {}) =>
    glow(put(g, color, at, o), s);

  const grime = (base: string) =>
    paint((p, n) => {
      const low = smoothstep(1.9, 1.15, p.y);
      const c = mix(base, "#0a0a0e", 0.55 * low * (0.5 + noise(p, 0.25, 3)));
      return mix(c, P.hullLight, 0.25 * smoothstep(0.6, 1, n.y));
    });
  const HULL = panelled(grime(P.hull), { size: 0.4, aspect: 0.7, rivets: 0.1, seam: P.hullDark as any });

  // ---------- cab shell
  put(box(2.5, 0.55, 1.6), HULL, [0, 1.42, 1.9]); // hood block
  // sloped hood top
  put(box(2.4, 0.12, 1.5), HULL, [0, 1.74, 2.15], { rotation: [8, 0, 0] });
  // cab body
  put(box(2.56, 0.95, 2.1), HULL, [0, 1.62, 0.65]);
  // roof (sloped sides)
  put(box(2.3, 0.18, 2.0), HULL, [0, 2.2, 0.55]);
  put(box(2.1, 0.12, 1.9), P.hullLight, [0, 2.3, 0.55]);
  // pillars / bevel
  for (const s of [1, -1]) {
    put(box(0.12, 0.7, 0.12), P.hullDark, [s * 1.25, 1.95, 1.5], { rotation: [-25, 0, 0] });
    put(box(0.1, 0.12, 2.1), P.trim, [s * 1.29, 1.14 + 0.18, 0.65]);
  }
  // rear wall plate
  put(box(2.5, 1.0, 0.1), P.hullDark, [0, 1.65, -0.35]);

  // ---------- windshield
  const hud = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#08141f"/>
    <path d="M0 40 L50 0 L70 0 L20 40Z" fill="#2ff3ff" opacity="0.22"/>
    <path d="M60 40 L100 0 L112 0 L72 40Z" fill="#2ff3ff" opacity="0.15"/>
    <path d="M10 33 H40 M88 8 H118" stroke="#2ff3ff" stroke-width="2"/>
    <circle cx="64" cy="20" r="9" fill="none" stroke="#2ff3ff" stroke-width="1.5"/>
    <path d="M64 8v5M64 27v5M52 20h5M71 20h5" stroke="#2ff3ff" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  put(new THREE.PlaneGeometry(2.0, 0.42), "#ffffff", [0, 2.0, 1.725], {
    dir: [0, 0.55, 1], axis: "z", texture: hud,
  });
  put(box(2.2, 0.5, 0.06), P.glass, [0, 2.0, 1.69], { rotation: [-30, 0, 0] });
  put(box(2.3, 0.08, 0.1), P.hullDark, [0, 2.26, 1.58]);
  put(box(2.3, 0.08, 0.1), P.hullDark, [0, 1.76, 1.78]);

  // ---------- side windows with mesh bars and doors
  const mesh = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b1a2a"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8} 0V32" stroke="#3a4250" stroke-width="2"/>`).join("")}
    <path d="M0 4H64M0 16H64M0 28H64" stroke="#3a4250" stroke-width="2"/>
    <path d="M0 0L64 12" stroke="#2ff3ff" stroke-width="1" opacity="0.4"/></svg>`,
    { size: 128 },
  );
  const doorNo = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#e9edf2" stroke="#14161d" stroke-width="3"/>
    <text x="32" y="46" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="38" fill="#d0152b">09</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    put(new THREE.PlaneGeometry(1.15, 0.5), "#ffffff", [s * 1.285, 1.98, 0.7], {
      dir: [s, 0, 0], axis: "z", texture: mesh,
    });
    put(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", [s * 1.285, 1.42, 0.7], {
      dir: [s, 0, 0], axis: "z", texture: doorNo,
    });
    // door seams
    put(box(0.03, 0.95, 0.04), P.hullDark, [s * 1.285, 1.62, 1.28]);
    put(box(0.03, 0.95, 0.04), P.hullDark, [s * 1.285, 1.62, 0.1]);
    put(box(0.03, 0.04, 1.2), P.hullDark, [s * 1.285, 1.18, 0.7]);
    // handles
    put(box(0.05, 0.06, 0.22), P.steel, [s * 1.31, 1.62, 0.28]);
    // hazard amber side lights
    lit(box(0.05, 0.08, 0.3), P.neonAmber, [s * 1.3, 2.2, 1.5]);
    lit(box(0.05, 0.08, 0.3), P.neonAmber, [s * 1.3, 2.2, -0.1]);
    // mirrors
    put(box(0.05, 0.05, 0.05), P.steel, [s * 1.36, 2.0, 1.4]);
    put(box(0.3, 0.5, 0.0 + 0.0001), P.hullDark, [s * 1.48, 1.95, 1.4]);
    put(box(0.12, 0.28, 0.18), P.hullDark, [s * 1.5, 2.05, 1.4]);
    put(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), P.hullDark, [s * 1.5, 2.05, 1.52], { dir: [0, 0, 1] });
    lit(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.warnRed, [s * 1.5, 2.05, 1.57], 2, { dir: [0, 0, 1] });
  }

  // ---------- hood eye logo
  const eye = svg(
    `<svg viewBox="0 0 100 60"><path d="M4 30 Q50 -10 96 30 Q50 70 4 30Z" fill="#14161d" stroke="#d0152b" stroke-width="5"/>
    <circle cx="50" cy="30" r="14" fill="#d0152b"/><circle cx="50" cy="30" r="6" fill="#e9edf2"/>
    <path d="M50 4V14M20 12L26 20M80 12L74 20" stroke="#d0152b" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  put(new THREE.PlaneGeometry(0.9, 0.54), "#ffffff", [0, 1.815, 2.2], { dir: [0, 1, -0.14], axis: "z", texture: eye });
  // hood vents + intake
  for (let i = 0; i < 4; i++) put(box(0.5, 0.03, 0.06), P.hullDark, [0.7 * (i < 2 ? 1 : -1), 1.83, 1.95 + (i % 2) * 0.2]);

  // ---------- front fascia / grille
  put(box(2.4, 0.6, 0.2), P.hullDark, [0, 1.45, 2.78]);
  const grille = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#0a0b10"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${2 + i * 5.2}" y="2" width="2.4" height="12" fill="#3a4050"/>`).join("")}</svg>`,
    { size: 128 },
  );
  put(new THREE.PlaneGeometry(1.4, 0.35), "#ffffff", [0, 1.4, 2.885], { axis: "z", dir: [0, 0, 1], texture: grille });
  lit(box(1.9, 0.07, 0.06), P.neonCyan, [0, 1.65, 2.9], 2);
  for (const s of [1, -1]) {
    put(box(0.5, 0.26, 0.12), P.hullDark, [s * 0.95, 1.38, 2.86]);
    lit(box(0.4, 0.16, 0.06), P.neonAmber, [s * 0.95, 1.38, 2.93], 2);
  }

  // ---------- plough bumper
  const hazard = paint((p) => (Math.floor((p.x + p.y * 1.2) / 0.16) % 2 === 0 ? P.trim : P.hullDark));
  put(box(2.6, 0.4, 0.5), P.hullDark, [0, 1.2, 3.0]);
  put(box(2.6, 0.5, 0.12), hazard, [0, 1.0, 3.38], { rotation: [-25, 0, 0] });
  put(box(2.5, 0.12, 0.3), P.hullLight, [0, 1.3, 3.3], { rotation: [20, 0, 0] });
  for (const s of [1, -1]) put(box(0.12, 0.4, 0.6), P.hullDark, [s * 1.25, 1.1, 3.15], { rotation: [0, s * 15, 0] });
  // brush guards
  for (const s of [1, -1])
    for (const x of [0.5, 1.0]) {
      b.rod([s * x, 1.25, 3.3], [s * x, 1.65, 3.0], 0.03, P.steel, { bone: body, sides: 6 });
    }
  b.rod([-1.1, 1.65, 3.0], [1.1, 1.65, 3.0], 0.03, P.steel, { bone: body, sides: 6 });
  // winch
  put(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), P.steel, [0, 1.12, 3.2], { dir: [1, 0, 0] });
  put(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8), P.trim, [0.28, 1.12, 3.2], { dir: [1, 0, 0] });
  put(box(0.2, 0.1, 0.1), P.warnRed, [0, 1.0, 3.45]);
  lit(box(1.8, 0.05, 0.05), P.neonMagenta, [0, 0.9, 3.0], 1.8);

  // ---------- roof light bar
  put(box(2.0, 0.1, 0.3), P.hullDark, [0, 2.4, 1.1]);
  const cols = [P.neonMagenta, P.neonCyan, P.neonMagenta, P.neonCyan, P.neonMagenta, P.neonCyan];
  cols.forEach((c, i) => lit(box(0.3, 0.12, 0.26), c, [-0.8 + i * 0.32, 2.5 - 0.0, 1.1], 2));
  for (const [s, c] of [[1, "#ff2020"], [-1, "#2a50ff"]] as [number, string][]) {
    put(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 8), P.hullDark, [s * 1.0, 2.43, 0.4]);
    lit(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 8), c, [s * 1.0, 2.5, 0.4], 2);
  }

  // ---------- antennas + sensor pod
  for (const [x, z, h] of [[0.9, -0.2, 0.7], [-0.9, -0.2, 0.5], [0.6, 0.1, 0.35]] as number[][]) {
    b.rod([x, 2.36, z], [x, 2.36 + h * 0.5 + 0.0, z], [0.02, 0.01], P.steel, { bone: body, sides: 5 });
    put(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, [x, 2.36 + h * 0.5, z]);
  }
  put(new THREE.CylinderGeometry(0.12, 0.16, 0.12, 8), P.hullDark, [-0.5, 2.43, 0.2]);
  put(new THREE.SphereGeometry(0.11, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, [-0.5, 2.49, 0.2]);
  lit(new THREE.SphereGeometry(0.03, 5, 4), P.neonCyan, [-0.5, 2.55, 0.28], 2);

  // ---------- rivets / extra fittings
  for (let i = 0; i < 10; i++)
    put(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 5), P.hullLight, [-1.1 + R() * 2.2, 1.78 + R() * 0.02, 1.2 + R() * 1.3]);
}
    return buildCabAndBumper;
  })(),
  // cargoBay
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildCargoBay({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const Y0 = 1.15; // chassis top
  const ZB = -3.2, ZF = -0.4;
  const ZC = (ZB + ZF) / 2, LZ = ZF - ZB;

  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...o });

  // paints
  const hullPaint = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const base = mix(P.hullDark, P.hull, smoothstep(1.1, 2.4, p.y));
      const grime = smoothstep(0.55, 0.0, (p.y - Y0) / 1.2) * 0.35 * noise(p, 0.15, 3);
      const top = smoothstep(0.5, 1, n.y) * 0.15;
      return mix(mix(base, P.hullLight, top), P.hullDark, grime);
    }),
    { size: 0.5, aspect: 0.8, rivets: 0.08 },
  );
  const tankPaint = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix(P.tankBlue, "#143c68", smoothstep(0.2, -0.8, n.y) * 0.6 + noise(p, 0.12, 5) * 0.2),
  );
  const steelPaint = metal("steel", { tarnish: 0.3 });
  const ironPaint = metal("iron");

  // textures
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hullDark}"/>${Array.from({ length: 10 }, (_, i) =>
      `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="${P.trim}"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const brand = svg(
    `<svg viewBox="0 0 160 40"><rect width="160" height="40" fill="${P.hullDark}" opacity="0.001"/>
    <rect x="1" y="1" width="158" height="38" fill="${P.hullDark}" stroke="${P.trim}" stroke-width="2"/>
    <rect x="5" y="5" width="8" height="30" fill="${P.corpRed}"/>
    <text x="20" y="26" font-family="sans-serif" font-weight="bold" font-size="18" fill="${P.white}">CROWD CONTROL</text></svg>`,
    { size: 512 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 80"><rect width="64" height="80" fill="${P.trim}" stroke="${P.hullDark}" stroke-width="3"/>
    <path d="M32 8 L58 52 L6 52Z" fill="none" stroke="${P.hullDark}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="29" y="22" width="6" height="16" fill="${P.hullDark}"/><rect x="29" y="42" width="6" height="5" fill="${P.hullDark}"/>
    <text x="32" y="68" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="${P.hullDark}">CAUTION</text></svg>`,
    { size: 256 },
  );
  const vent = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="${P.hullDark}"/>${Array.from({ length: 7 }, (_, i) =>
      `<rect x="3" y="${3 + i * 4}" width="26" height="2" fill="#050608"/><rect x="3" y="${5 + i * 4}" width="26" height="1" fill="${P.steel}"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const gauge = gaugeTexture({ needle: 40, label: "BAR" });
  const hpLabel = svg(
    `<svg viewBox="0 0 100 30"><rect width="100" height="30" fill="${P.warnRed}"/><text x="50" y="21" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="${P.white}">HIGH PRESSURE</text></svg>`,
    { size: 256 },
  );

  const plane = (tex: any, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });

  // main shell: lower box + sloped upper wedge
  const lowH = 1.0; // y 1.15..2.15
  box(2.6, lowH, LZ, hullPaint, [0, Y0 + lowH / 2, ZC]);
  // sloped upper edges (chamfered roof): extruded cross-section along z
  const roofProfile: [number, number][] = [
    [-1.3, 0], [1.3, 0], [1.3, 0.1], [1.0, 0.45], [-1.0, 0.45], [-1.3, 0.1],
  ];
  b.extrude(roofProfile, {
    at: [0, Y0 + lowH, ZB], x: [1, 0, 0], y: [0, 1, 0], thickness: LZ, color: hullPaint, bone,
  });
  // thickness runs along x×y = +Z? ensure centred: recentre
  // (extrude is centred on drawing axis; shift by half length handled via second pass)
  // ribbed roof
  const roofY = Y0 + lowH + 0.45; // 2.6 top of wedge
  for (let i = 0; i < 9; i++) {
    const z = ZB + 0.3 + i * 0.3;
    if (z > -2.0 && z < -1.2) continue; // turret deck
    box(1.9, 0.05, 0.08, ironPaint, [0, roofY + 0.025, z]);
  }
  // flat turret deck plate and ring
  const deck = M.turretRing;
  cyl(0.62, 0.66, 0.06, 16, P.hullLight, [deck[0], roofY + 0.03, deck[2]]);
  cyl(0.58, 0.58, 0.1, 16, P.trim, [deck[0], roofY + 0.09, deck[2]]);
  cyl(0.5, 0.5, 0.12, 16, P.hullDark, [deck[0], roofY + 0.1, deck[2]]);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cyl(0.025, 0.025, 0.04, 6, P.steel, [Math.sin(a) * 0.55, roofY + 0.16, deck[2] + Math.cos(a) * 0.55]);
  }

  // hazard trim strips around the shell
  for (const s of [1, -1]) {
    plane(hazard, 2.7, 0.14, [s * 1.305, Y0 + 0.08, ZC], [s, 0, 0], { rotation: [0, 0, 0] });
  }
  // fix hazard planes: long plane should run along z -> use thin boxes with texture
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.12, LZ - 0.1), P.trim, { bone, at: [s * 1.31, Y0 + lowH - 0.06, ZC] });
    b.part(new THREE.BoxGeometry(0.02, 0.12, LZ - 0.1), P.trim, { bone, at: [s * 1.31, Y0 + 0.08, ZC] });
  }

  // side access hatches with warning stripes and amber edges
  for (const s of [1, -1]) {
    const x = s * 1.31;
    box(0.04, 0.62, 1.1, P.hullLight, [x, Y0 + 0.5, -1.45]);
    plane(hazard, 1.0, 0.16, [s * 1.335, Y0 + 0.26, -1.45], [s, 0, 0], { up: [0, 1, 0] });
    plane(warn, 0.22, 0.28, [s * 1.335, Y0 + 0.62, -1.15], [s, 0, 0]);
    box(0.05, 0.03, 1.12, P.neonAmber, [x, Y0 + 0.82, -1.45]) && glow(b.part(new THREE.BoxGeometry(0.06, 0.03, 1.14), P.neonAmber, { bone, at: [x, Y0 + 0.83, -1.45] }), 1.6);
    glow(b.part(new THREE.BoxGeometry(0.06, 0.03, 1.14), P.neonAmber, { bone, at: [x, Y0 + 0.18, -1.45] }), 1.6);
    for (const dz of [-0.56, 0.56])
      glow(b.part(new THREE.BoxGeometry(0.06, 0.62, 0.03), P.neonAmber, { bone, at: [x, Y0 + 0.5, -1.45 + dz] }), 1.6);
    // handle
    box(0.06, 0.06, 0.24, P.steel, [x + s * 0.03, Y0 + 0.5, -1.0]);
    // vents
    plane(vent, 0.55, 0.5, [s * 1.335, Y0 + 0.5, -2.55], [s, 0, 0]);
    box(0.04, 0.54, 0.04, P.trim, [s * 1.32, Y0 + 0.5, -2.84]);
    box(0.04, 0.54, 0.04, P.trim, [s * 1.32, Y0 + 0.5, -2.26]);
    // branding on upper flank
    plane(brand, 1.5, 0.375, [s * 1.335, Y0 + 0.84, -1.95 + 0.0], [s, 0, 0], { mirror: false });
    // vertical neon cyan bars
    glow(b.part(new THREE.BoxGeometry(0.05, 0.9, 0.05), P.neonCyan, { bone, at: [s * 1.3, Y0 + 0.5, -0.5] }), 1.8);
    glow(b.part(new THREE.BoxGeometry(0.05, 0.9, 0.05), P.neonCyan, { bone, at: [s * 1.3, Y0 + 0.5, -3.1] }), 1.8);
  }

  // rear wall: double door
  const zr = ZB - 0.005;
  for (const s of [1, -1]) {
    box(1.1, 0.95, 0.05, P.hullLight, [s * 0.58, Y0 + 0.52, zr]);
    box(0.06, 0.5, 0.05, P.steel, [s * 0.1, Y0 + 0.5, zr - 0.04]);
    for (const dy of [0.2, 0.8]) box(0.12, 0.08, 0.08, P.steel, [s * 1.05, Y0 + dy, zr - 0.02]);
  }
  box(0.04, 0.98, 0.07, P.hullDark, [0, Y0 + 0.52, zr - 0.02]);
  plane(warn, 0.3, 0.375, [0.5, Y0 + 0.6, zr - 0.04], [0, 0, -1]);
  plane(brand, 1.2, 0.3, [-0.45, Y0 + 0.8, zr - 0.04], [0, 0, -1]);
  plane(hazard, 2.2, 0.12, [0, Y0 + 0.07, zr - 0.04], [0, 0, -1]);
  // rear slope neon
  glow(b.part(new THREE.BoxGeometry(2.0, 0.04, 0.04), P.neonCyan, { bone, at: [0, Y0 + lowH + 0.02, ZB - 0.04] }), 1.8);

  // floodlights at rear corners
  for (const s of [1, -1]) {
    box(0.16, 0.16, 0.12, P.hullDark, [s * 1.2, Y0 + 1.0, ZB - 0.06]);
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 8), P.white, { bone, at: [s * 1.2, Y0 + 1.0, ZB - 0.15], dir: [0, 0, -1] }), 2);
    box(0.04, 0.2, 0.04, P.steel, [s * 1.2, Y0 + 0.88, ZB - 0.05]);
  }
  // red beacons rear
  for (const s of [1, -1]) glow(box(0.1, 0.06, 0.04, P.warnRed, [s * 0.9, Y0 + 1.0, ZB - 0.03]), 1.5);

  // ladder rungs on rear
  for (const s of [1, -1]) box(0.04, 0.9, 0.04, P.steel, [s * 0.4, Y0 + 1.0, ZB - 0.12]);
  for (let i = 0; i < 5; i++) box(0.84, 0.03, 0.03, P.steel, [0, Y0 + 0.65 + i * 0.18, ZB - 0.12]);

  // water tank on roof rear
  const tz = -2.75, ty = roofY + 0.2;
  cyl(0.34, 0.34, 1.4, 12, tankPaint, [0, ty + 0.14, tz], { rotation: [90, 0, 0], bone });
  for (const x of [-0.36, 0.36]) cyl(0.34, 0.34, 0.1, 12, tankPaint, [0, ty + 0.14, tz]);
  for (const x of [-0.5, 0, 0.5]) cyl(0.355, 0.355, 0.08, 12, P.trim, [x, ty + 0.14, tz], { rotation: [0, 0, 90] });
  for (const s of [1, -1]) {
    cyl(0.3, 0.34, 0.08, 12, P.steel, [s * 0.74, ty + 0.14, tz], { rotation: [0, 0, 90] });
  }
  // fix: tank axis along x
  // saddle cradles
  for (const x of [-0.5, 0.5]) box(0.12, 0.2, 0.7, P.hullDark, [x, roofY + 0.1, tz]);
  // gauge + valves
  const gz = tz;
  plane(gauge, 0.26, 0.26, [0.0, ty + 0.14, tz - 0.0], [0, 0, 1], { lift: 0 });
  cyl(0.14, 0.14, 0.05, 12, P.steel, [0.5, ty + 0.2, tz + 0.37], { rotation: [90, 0, 0] });
  plane(gauge, 0.22, 0.22, [0.5, ty + 0.2, tz + 0.4], [0, 0, 1]);
  plane(hpLabel, 0.5, 0.15, [-0.4, ty + 0.14, tz + 0.345], [0, 0, 1]);
  for (const x of [-0.25, 0.25]) {
    cyl(0.03, 0.03, 0.12, 6, P.steel, [x, ty + 0.52, tz]);
    cyl(0.07, 0.07, 0.03, 6, P.warnRed, [x, ty + 0.6, tz]);
  }

  // pipes running from tank toward turret ring
  const pipe = (pts: number[][], r = 0.035) => b.sweep(pts.map((p) => p), r, { color: P.steel, bone, sides: 6 });
  pipe([[0.3, ty + 0.0, tz + 0.2], [0.3, roofY + 0.12, tz + 0.5], [0.3, roofY + 0.12, -1.95], [0.15, roofY + 0.2, deck[2] - 0.45]]);
  pipe([[-0.3, ty + 0.0, tz + 0.2], [-0.3, roofY + 0.12, tz + 0.5], [-0.3, roofY + 0.12, -1.95], [-0.15, roofY + 0.2, deck[2] - 0.45]]);
  for (const s of [1, -1]) for (const z of [-2.3, -2.0]) box(0.12, 0.05, 0.05, P.hullDark, [s * 0.3, roofY + 0.05, z]);

  // roof perimeter rail + front cab wall bracing
  box(2.4, 0.08, 0.1, P.trim, [0, roofY + 0.04, ZF - 0.08]);
  box(2.0, 0.3, 0.06, P.hullDark, [0, roofY + 0.15, ZF - 0.05]);
  glow(b.part(new THREE.BoxGeometry(1.9, 0.03, 0.03), P.neonCyan, { bone, at: [0, roofY + 0.32, ZF - 0.05] }), 1.8);

  // random rivet studs along top shell edge
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++) {
    const z = ZB + 0.2 + (i / 13) * (LZ - 0.4);
    for (const s of [1, -1]) studs.push(new THREE.SphereGeometry(0.02, 5, 3).translate(s * 1.0, roofY - 0.01, z + (R() - 0.5) * 0.0));
  }
  import("three/addons/utils/BufferGeometryUtils.js").catch(() => null);
}
    return buildCargoBay;
  })(),
  // waterCannonTurret
  (() => {
function buildWaterCannonTurret({ b, J, P, M }: any) {
  const T = J.turret;
  const C = J.cannon;
  const R = rng(11);
  const ring = M.turretRing as number[];
  const piv = M.cannonPivot as number[];
  const cx = piv[0], cy = piv[1], cz = piv[2];

  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, n.y) * 0.5);
    const grime = smoothstep(0.55, 0.8, noise(p, 0.12, 4)) * 0.35;
    return mix(base, P.hullDark, grime + smoothstep(0.2, -0.8, n.y) * 0.3);
  });
  const steelPaint = metal("steel", { tarnish: 0.35, polish: 0.2 });
  const yellow = paint((p, n) => mix(P.trim, "#3a2f00", smoothstep(0.5, 0.75, noise(p, 0.05, 2)) * 0.4 + (n.y < -0.3 ? 0.25 : 0)));

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, s = 12) => new THREE.CylinderGeometry(r1, r2, h, s);

  // ---- turret base drum
  const base = [ring[0], ring[1], ring[2]];
  b.part(cyl(0.62, 0.66, 0.1, 16), hullPaint, { bone: T, at: [base[0], base[1] + 0.05, base[2]] });
  b.part(cyl(0.58, 0.6, 0.2, 16), hullPaint, { bone: T, at: [base[0], base[1] + 0.2, base[2]] });
  b.part(cyl(0.63, 0.63, 0.06, 16), yellow, { bone: T, at: [base[0], base[1] + 0.12, base[2]] });
  b.part(cyl(0.5, 0.55, 0.08, 16), steelPaint, { bone: T, at: [base[0], base[1] + 0.34, base[2]] });
  // slewing gear teeth
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    b.part(box(0.07, 0.05, 0.07), steelPaint, {
      bone: T,
      at: [base[0] + Math.sin(a) * 0.66, base[1] + 0.03, base[2] + Math.cos(a) * 0.66],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // bolts on drum
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    b.part(cyl(0.025, 0.025, 0.03, 6), P.steel, {
      bone: T,
      at: [base[0] + Math.sin(a) * 0.6, base[1] + 0.28, base[2] + Math.cos(a) * 0.6],
      rotation: [(Math.cos(a) * 90), 0, -(Math.sin(a) * 90)],
    });
  }

  // ---- cradle with side arms
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.5, 0.55), hullPaint, { bone: T, at: [cx + s * 0.34, cy - 0.02, cz] });
    b.part(box(0.04, 0.46, 0.5), P.hullDark, { bone: T, at: [cx + s * 0.4, cy - 0.02, cz] });
    b.part(cyl(0.1, 0.1, 0.12, 10), yellow, { bone: T, at: [cx + s * 0.42, cy, cz], rotation: [0, 0, 90] });
    b.part(cyl(0.05, 0.05, 0.14, 8), P.steel, { bone: T, at: [cx + s * 0.44, cy, cz], rotation: [0, 0, 90] });
  }
  b.part(box(0.7, 0.1, 0.5), hullPaint, { bone: T, at: [cx, cy - 0.26, cz] });
  b.part(box(0.3, 0.12, 0.2), P.hullDark, { bone: T, at: [cx, cy - 0.3, cz - 0.28] });

  // ---- gunner shield (front-left side of turret, in front of cradle)
  const sh = [cx, cy + 0.15, cz + 0.35];
  b.part(box(1.0, 0.55, 0.08), hullPaint, { bone: T, at: [sh[0], sh[1] - 0.05, sh[2]], rotation: [-12, 0, 0] });
  b.part(box(1.0, 0.1, 0.1), yellow, { bone: T, at: [sh[0], sh[1] - 0.34, sh[2] + 0.04] });
  b.part(box(0.2, 0.2, 0.16), hullPaint, { bone: T, at: [cx - 0.5, sh[1] - 0.05, sh[2] - 0.02], rotation: [-12, 0, 0] });
  b.part(box(0.2, 0.2, 0.16), hullPaint, { bone: T, at: [cx + 0.5, sh[1] - 0.05, sh[2] - 0.02], rotation: [-12, 0, 0] });
  // slit window
  b.part(box(0.6, 0.07, 0.03), P.glass, { bone: T, at: [sh[0], sh[1] + 0.08, sh[2] + 0.06], rotation: [-12, 0, 0] });
  // cyan neon edge
  glow(b.part(box(1.0, 0.025, 0.03), P.neonCyan, { bone: T, at: [sh[0], sh[1] + 0.25, sh[2] + 0.02], rotation: [-12, 0, 0] }), 1.6);
  for (const s of [1, -1])
    glow(b.part(box(0.025, 0.5, 0.03), P.neonCyan, { bone: T, at: [sh[0] + s * 0.5, sh[1] - 0.05, sh[2] + 0.04], rotation: [-12, 0, 0] }), 1.6);

  // ---- cannon barrel (on cannon joint, pointing +Z)
  const bz = (z: number) => [cx, cy, z];
  b.part(cyl(0.2, 0.2, 0.5, 12), hullPaint, { bone: C, at: bz(cz + 0.05), rotation: [90, 0, 0] });
  b.part(cyl(0.15, 0.17, 1.0, 12), steelPaint, { bone: C, at: bz(cz + 0.7), rotation: [90, 0, 0] });
  b.part(cyl(0.12, 0.2, 0.4, 12), hullPaint, { bone: C, at: bz(cz + 1.4), rotation: [90, 0, 0] }); // flared nozzle (wide at front)
  b.part(cyl(0.1, 0.1, 0.5, 10), P.hullDark, { bone: C, at: bz(cz - 0.4), rotation: [90, 0, 0] });
  b.part(cyl(0.12, 0.12, 0.25, 10), steelPaint, { bone: C, at: bz(cz - 0.75), rotation: [90, 0, 0] });
  // bands
  for (const z of [0.25, 0.6, 0.95, 1.2]) {
    b.part(cyl(0.19, 0.19, 0.06, 12), z === 0.6 ? yellow : P.steel, { bone: C, at: bz(cz + z), rotation: [90, 0, 0] });
  }
  // muzzle ring glow
  glow(b.part(new THREE.TorusGeometry(0.2, 0.02, 6, 16), P.neonCyan, { bone: C, at: bz(cz + 1.6) }), 2);
  b.part(cyl(0.17, 0.17, 0.02, 12), "#05222a", { bone: C, at: bz(cz + 1.6), rotation: [90, 0, 0] });
  // nozzle teeth
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(box(0.04, 0.04, 0.08), P.hullDark, { bone: C, at: [cx + Math.sin(a) * 0.2, cy + Math.cos(a) * 0.2, cz + 1.58] });
  }

  // ---- pressure gauge on barrel side
  const gTex = gaugeTexture({ needle: 70, label: "BAR" });
  for (const s of [1, -1]) {
    b.part(cyl(0.085, 0.085, 0.04, 14), P.steel, { bone: C, at: [cx + s * 0.2, cy + 0.06, cz + 0.2], rotation: [0, 0, 90] });
    b.part(new THREE.CircleGeometry(0.075, 16), "#ffffff", {
      bone: C, at: [cx + s * 0.225, cy + 0.06, cz + 0.2], dir: [s, 0, 0], axis: "z", texture: gTex,
    });
  }

  // ---- warning label
  const label = svg(
    `<svg viewBox="0 0 120 50"><rect width="120" height="50" rx="4" fill="#f2c200" stroke="#14161d" stroke-width="3"/>
    <path d="M6 44 L16 26 L26 44Z" fill="#14161d"/><text x="30" y="21" font-family="sans-serif" font-weight="bold" font-size="14" fill="#14161d">HIGH</text>
    <text x="30" y="40" font-family="sans-serif" font-weight="bold" font-size="14" fill="#14161d">PRESSURE</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.34, 0.14), "#ffffff", {
    bone: C, at: [cx, cy + 0.172, cz + 0.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: label,
  });

  // ---- targeting camera + magenta laser
  const camA = [cx - 0.26, cy + 0.3, cz + 0.3];
  b.part(box(0.1, 0.1, 0.16), P.hullDark, { bone: C, at: camA });
  b.part(cyl(0.035, 0.035, 0.08, 8), P.glass, { bone: C, at: [camA[0], camA[1], camA[2] + 0.1], rotation: [90, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), P.warnRed, { bone: C, at: [camA[0] + 0.03, camA[1] + 0.06, camA[2] + 0.05] }), 2);
  b.part(box(0.08, 0.06, 0.1), P.hullDark, { bone: C, at: [cx + 0.26, cy + 0.26, cz + 0.4] });
  glow(b.part(cyl(0.012, 0.012, 0.9, 6), P.neonMagenta, { bone: C, at: [cx + 0.26, cy + 0.26, cz + 0.9], rotation: [90, 0, 0] }), 2);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: C, at: [cx + 0.26, cy + 0.26, cz + 0.36] });

  // ---- supply hoses curving back to the tank
  for (const s of [1, -1]) {
    const path = catmull([
      [cx + s * 0.1, cy - 0.05, cz - 0.85],
      [cx + s * 0.25, cy + 0.15, cz - 1.0],
      [cx + s * 0.4, cy + 0.0, cz - 1.5],
      [cx + s * 0.4, cy - 0.3, cz - 1.9],
      [cx + s * 0.3, cy - 0.35, cz - 2.3],
    ]);
    b.sweep(path, 0.045, { bone: T, color: P.rubber, sides: 6 });
    b.along(path, 7, (at: any) => b.part(cyl(0.06, 0.06, 0.04, 6), P.steel, { bone: T, at: at.at, dir: at.axis }));
    b.part(cyl(0.07, 0.07, 0.12, 8), P.steel, { bone: T, at: [cx + s * 0.3, cy - 0.35, cz - 2.35], rotation: [90, 0, 0] });
  }
  // rear manifold
  b.part(box(0.5, 0.14, 0.14), steelPaint, { bone: T, at: [cx, cy - 0.12, cz - 0.95] });

  // ---- small details: warning beacons, amber strips on base
  for (const s of [1, -1]) {
    glow(b.part(cyl(0.04, 0.04, 0.08, 8), P.neonAmber, { bone: T, at: [cx + s * 0.55, base[1] + 0.42, base[2] + 0.2] }), 1.8);
    glow(b.part(box(0.02, 0.04, 0.3), P.neonAmber, { bone: T, at: [base[0] + s * 0.59, base[1] + 0.2, base[2]] }), 1.5);
  }
  void R; void offset;
}
    return buildWaterCannonTurret;
  })(),
  // wheels
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.5;
  const treadPaint = paint((p, n, s) => {
    const a = s[1] ?? 0;
    const lug = Math.abs(((((s[0] ?? 0) * 30) % 1) + 1) % 1 - 0.5);
    const dirt = noise(p, 0.12, 4);
    const base: [number, number, number] = [0.05, 0.05, 0.065];
    const light: [number, number, number] = [0.16, 0.16, 0.18];
    return mix(base, light, smoothstep(0.45, 0.8, dirt) * 0.6 + (lug > 0.3 ? 0.15 : 0));
  });
  const rimPaint = paint((p, n) => {
    const t = noise(p, 0.05, 9);
    return mix("#6b7280", "#8a919e", t * 0.8 + (n.y > 0.5 ? 0.15 : 0));
  });
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14161d" stroke="#d0152b" stroke-width="4"/>
    <path d="M32 12 L50 48 L32 40 L14 48 Z" fill="#d0152b"/><path d="M32 22 L40 40 L32 36 L24 40Z" fill="#e9edf2"/>
    <circle cx="32" cy="34" r="3" fill="#14161d"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, M.frontAxle[2], 1],
    ["wheelFR", -1, M.frontAxle[2], -1],
    ["wheelML", 1, M.midAxle[2], 1],
    ["wheelMR", -1, M.midAxle[2], -1],
    ["wheelRL", 1, M.rearAxle[2], 1],
    ["wheelRR", -1, M.rearAxle[2], -1],
  ];

  for (const [name, sx, z] of wheels.map((w) => [w[0], w[1], w[2]] as [string, number, number])) {
    const joint = J[name];
    const cx = sx * 1.2;
    const cy = R;
    const axis: [number, number, number] = [sx, 0, 0];
    const at = (o: number): [number, number, number] => [cx + sx * o, cy, z];

    // tyre: 14-sided faceted lathe profile with chamfered shoulders
    b.lathe(
      [
        [0.3, -W / 2],
        [R - 0.07, -W / 2],
        [R, -W / 2 + 0.07],
        [R, W / 2 - 0.07],
        [R - 0.07, W / 2],
        [0.3, W / 2],
      ],
      { at: at(0), axis, segments: 14, color: treadPaint, bone: joint, name: `tyre.${name}` },
    );
    // sidewall bulge ring (inner dark)
    b.part(new THREE.CylinderGeometry(0.34, 0.34, W + 0.02, 14), P.hullDark, {
      bone: joint, at: at(0), dir: axis, flat: true,
    });
    // steel rim disc outer
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 14), rimPaint, {
      bone: joint, at: at(W / 2 + 0.005), dir: axis, flat: true,
    });
    // rim lip
    b.part(new THREE.TorusGeometry(0.33, 0.025, 4, 14), P.steel, {
      bone: joint, at: at(W / 2 + 0.03), dir: axis, axis: "z", flat: true,
    });
    // hub cap
    b.part(new THREE.CylinderGeometry(0.15, 0.18, 0.07, 10), P.hullLight, {
      bone: joint, at: at(W / 2 + 0.07), dir: axis, flat: true,
    });
    // emblem decal
    b.part(new THREE.CircleGeometry(0.13, 16), "#ffffff", {
      bone: joint, at: at(W / 2 + 0.108), dir: axis, axis: "z", texture: emblem,
    });
    // lug nuts merged
    const lugs: THREE.BufferGeometry[] = [];
    const lugGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const g = lugGeo.clone();
      g.rotateZ(Math.PI / 2);
      g.translate(0, Math.cos(a) * 0.25, Math.sin(a) * 0.25);
      lugs.push(g);
    }
    const lugM = mergeGeometries(lugs)!;
    lugM.translate(cx + sx * (W / 2 + 0.07), cy, z);
    b.part(lugM, P.steel, { bone: joint, at: [0, 0, 0] });
    // neon magenta ring
    glow(
      b.part(new THREE.TorusGeometry(0.4, 0.022, 4, 14), P.neonMagenta, {
        bone: joint, at: at(W / 2 + 0.03), dir: axis, axis: "z",
      }),
      1.6,
    );
    // inner brake disc and caliper
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 14), P.steel, {
      bone: joint, at: at(-W / 2 + 0.02), dir: axis, flat: true,
    });
    b.part(new THREE.BoxGeometry(0.08, 0.14, 0.1), P.warnRed, {
      bone: joint, at: [cx - sx * (W / 2 - 0.02), cy + 0.22, z], flat: true,
    });
    // axle stub toward chassis
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.4, 8), P.hullDark, {
      bone: joint, at: [sx * 1.0, cy, z], dir: axis, flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), P.trim, {
      bone: joint, at: [sx * 0.96, cy, z], dir: axis, flat: true,
    });
  }
}
    return buildWheels;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turret"] = b.joint("turret", { parent: J["body"], at: [0,2.1,-1.6], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannon"] = b.joint("cannon", { parent: J["turret"], at: [0,2.45,-1.6], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.55,2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.55,2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.55,-0.3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.55,-0.3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.55,-2.1], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.55,-2.1], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

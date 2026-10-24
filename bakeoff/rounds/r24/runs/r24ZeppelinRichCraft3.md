```ts
import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, svg, polyline } from "agentic-3js-builder";
import type { Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Art Deco Passenger Zeppelin",
  description:
    "A 114 m art deco passenger airship: ivory fabric hull with navy, gold and teal speed stripes, ziggurat vents, " +
    "stepped cruciform tail fins with hinged rudders and elevators, four chrome engine nacelles with spinning " +
    "propellers, and a glowing-windowed promenade gondola with a deco door, boarding stair and bumper wheel.",
};

type V3 = [number, number, number];
const D2R = Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------
// Palette
const IVORY = "#e9e3d0";
const NAVY = "#16264a";
const NAVY2 = "#0d1630";
const GOLD = "#d4a437";
const GOLD2 = "#f0cb6a";
const TEAL = "#2a8a92";
const CHROME = "#cdd5df";
const STEEL = "#8b96a6";
const DARK = "#222a3c";
const RED = "#d23a32";
const GREEN = "#2fb866";
const WHITE = "#fff6e0";
const WARM = "#ffc766";

// ---------------------------------------------------------------------------------------------------------------
// Proportions (meters). Nose at +Z, hull axis at y = HY.
const Z0 = -60; // tail tip
const Z1 = 54; // nose end (a cap covers it)
const LEN = Z1 - Z0;
const HY = 16;
const RMAX = 10;
const SPLIT = 0.42;

/** Streamlined hull profile 0..1: a tapering tail cone, then a long blunt nose. */
function body(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  if (c < SPLIT) {
    const u = c / SPLIT;
    return 1 - Math.pow(1 - u, 1.8);
  }
  const u = ((c - SPLIT) / (1 - SPLIT)) * 0.95;
  return Math.sqrt(1 - Math.pow(u, 2.4));
}
const hullR = (z: number) => RMAX * body((z - Z0) / LEN);

// ---------------------------------------------------------------------------------------------------------------
// Drawings
function windowStrip(n: number) {
  const W = n * 40;
  let g = "";
  for (let i = 0; i < n; i++) {
    const x = i * 40 + 4;
    g += `<path d="M${x} 36V16H${x + 4}V10H${x + 8}V4H${x + 24}V10H${x + 28}V16H${x + 32}V36Z" fill="url(#g)" stroke="#7a5a1c" stroke-width="2"/>`;
    if (i % 3 === 0)
      g += `<circle cx="${x + 9}" cy="27" r="3.3" fill="#4a2f14"/><path d="M${x + 3} 36 q0 -8 6 -8 q6 0 6 8Z" fill="#4a2f14"/>`;
    if (i % 4 === 1)
      g += `<circle cx="${x + 24}" cy="27" r="3.1" fill="#4a2f14"/><path d="M${x + 18} 36 q0 -8 6 -8 q6 0 6 8Z" fill="#4a2f14"/>`;
    g += `<path d="M${x + 16} 4V36M${x} 24H${x + 32}" stroke="#7a5a1c" stroke-width="1.6" fill="none"/>`;
  }
  return svg(
    `<svg viewBox="0 0 ${W} 40" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset="1" stop-color="#ffab40"/></linearGradient></defs>${g}</svg>`,
    { size: W * 4 },
  );
}

function windshield() {
  return svg(
    `<svg viewBox="0 0 250 110" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset="1" stop-color="#ffa63a"/></linearGradient></defs>
      <path d="M0 110V30H20V10H60V0H190V10H230V30H250V110Z" fill="url(#g)" stroke="#16264a" stroke-width="6"/>
      <path d="M50 10V110M100 0V110M150 0V110M200 10V110M0 58H250" stroke="#16264a" stroke-width="4" fill="none"/>
      <path d="M8 104V34M242 104V34" stroke="#d4a437" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 1000 },
  );
}

function doorTexture() {
  let rays = "";
  for (let a = -80; a <= 80; a += 20) {
    const r = a * D2R;
    rays += `<path d="M50 98L${(50 + Math.sin(r) * 40).toFixed(1)} ${(98 - Math.cos(r) * 40).toFixed(1)}" stroke="#f0cb6a" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 160V30H10V14H24V0H76V14H90V30H100V160Z" fill="#d4a437"/>
      <path d="M8 160V36H16V22H30V8H70V22H84V36H92V160Z" fill="#16264a"/>
      <path d="M34 50V30H40V24H60V30H66V50Z" fill="#ffc766" stroke="#d4a437" stroke-width="2"/>
      ${rays}
      <path d="M38 98 A12 12 0 0 1 62 98Z" fill="#d4a437"/>
      <path d="M16 120H84" stroke="#d4a437" stroke-width="3"/>
      <path d="M16 126H84" stroke="#f0cb6a" stroke-width="1.2"/>
      <rect x="76" y="132" width="5" height="14" rx="2" fill="#f0cb6a"/>
      <path d="M22 140L50 128L78 140" fill="none" stroke="#d4a437" stroke-width="2"/>
    </svg>`,
    { size: 640 },
  );
}

function friezeTexture() {
  let c = "";
  for (let x = 0; x < 440; x += 18)
    c += `<path d="M${x + 3} 4L${x + 11} 9L${x + 3} 14" stroke="#d4a437" stroke-width="2.4" fill="none" stroke-linejoin="miter"/>`;
  return svg(
    `<svg viewBox="0 0 440 18" xmlns="http://www.w3.org/2000/svg">
      <rect width="440" height="18" fill="#16264a"/>
      <rect y="0" width="440" height="1.6" fill="#f0cb6a"/><rect y="16.4" width="440" height="1.6" fill="#f0cb6a"/>
      ${c}
    </svg>`,
    { size: 1760 },
  );
}

function nameTexture() {
  const ff = `Futura, 'Century Gothic', 'Trebuchet MS', Verdana, sans-serif`;
  return svg(
    `<svg viewBox="0 0 600 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="30" width="46" height="5" fill="#d4a437"/><rect x="0" y="42" width="46" height="2.5" fill="#16264a"/>
      <rect x="554" y="30" width="46" height="5" fill="#d4a437"/><rect x="554" y="42" width="46" height="2.5" fill="#16264a"/>
      <text x="300" y="60" text-anchor="middle" font-family="${ff}" font-weight="700" font-size="60" letter-spacing="13" fill="#16264a">ZEPHYRIA</text>
    </svg>`,
    { size: 1200 },
  );
}

function emblemTexture() {
  let rays = "";
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5 * D2R;
    const w = 5.5 * D2R;
    const p = (ang: number, r: number) => `${(50 + Math.sin(ang) * r).toFixed(2)},${(50 - Math.cos(ang) * r).toFixed(2)}`;
    rays += `<polygon points="50,50 ${p(a - w, 41)} ${p(a + w, 41)}" fill="${k % 2 ? "#f0cb6a" : "#d4a437"}"/>`;
  }
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#16264a"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#d4a437" stroke-width="2"/>
      ${rays}
      <circle cx="50" cy="50" r="19" fill="#e9e3d0" stroke="#d4a437" stroke-width="2.4"/>
      <ellipse cx="50" cy="50" rx="13" ry="4.8" fill="#16264a"/>
      <polygon points="38,50 33,43 38,48 38,52 33,57" fill="#16264a"/>
      <rect x="46" y="53.5" width="8" height="2.6" fill="#16264a"/>
    </svg>`,
    { size: 512 },
  );
}

function finEmblemTexture() {
  const bars: [number, string][] = [
    [90, "#d4a437"],
    [72, "#16264a"],
    [54, "#2a8a92"],
    [36, "#d4a437"],
    [20, "#16264a"],
  ];
  let g = "";
  bars.forEach(([w, c], i) => {
    const y = 84 - i * 14;
    g += `<rect x="${50 - w / 2}" y="${y}" width="${w}" height="12" fill="${c}"/>`;
  });
  g += `<polygon points="50,2 43,28 57,28" fill="#d4a437"/><path d="M50 8V26" stroke="#16264a" stroke-width="2"/>`;
  return svg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${g}</svg>`, { size: 256 });
}

function grilleTexture() {
  let slats = "";
  for (let y = 14; y <= 86; y += 12) slats += `<path d="M0 ${y}H100"/>`;
  return svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="c"><circle cx="50" cy="50" r="46"/></clipPath></defs>
      <circle cx="50" cy="50" r="48" fill="#1a2238"/>
      <g clip-path="url(#c)" stroke="#cdd6e2" stroke-width="3.6">${slats}</g>
      <circle cx="50" cy="50" r="11" fill="#d4a437" stroke="#16264a" stroke-width="3"/>
      <circle cx="50" cy="50" r="4" fill="#16264a"/>
    </svg>`,
    { size: 256 },
  );
}

// ---------------------------------------------------------------------------------------------------------------
export default function build() {
  const b = createBuilder({ name: "zeppelin", paintSize: 2048 });

  // Skeleton: hull root, gondola, control surfaces, propellers.
  const hullJ = b.joint("hull", { at: [0, HY, 0], dir: [0, 0, 1] });
  const gondJ = b.joint("gondola", { parent: hullJ, at: [0, 4, 18], dir: [0, 0, 1] });
  const rudJ: Record<string, Joint> = {
    U: b.joint("rudderU", { parent: hullJ, at: [0, HY, -48], dir: [0, 1, 0], role: "hinge" }),
    D: b.joint("rudderD", { parent: hullJ, at: [0, HY, -48], dir: [0, -1, 0], role: "hinge" }),
    L: b.joint("elevatorL", { parent: hullJ, at: [0, HY, -48], dir: [1, 0, 0], role: "hinge" }),
    R: b.joint("elevatorR", { parent: hullJ, at: [0, HY, -48], dir: [-1, 0, 0], role: "hinge" }),
  };

  // Textures
  const T_WIN = windowStrip(11);
  const T_SHIELD = windshield();
  const T_DOOR = doorTexture();
  const T_FRIEZE = friezeTexture();
  const T_NAME = nameTexture();
  const T_EMBLEM = emblemTexture();
  const T_FIN = finEmblemTexture();
  const T_GRILLE = grilleTexture();

  const plate = (w: number, h: number, tex: THREE.Texture, at: V3, dir: V3, bone: Joint, lit = 0) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
    return lit ? glow(part, lit) : part;
  };
  const bulb = (at: V3, color: string, r: number, strength: number, bone: Joint = hullJ) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at }), strength);

  // -------------------------------------------------------------------------------------------------------------
  // Hull: ivory fabric, longitudinal seams, deco speed stripes and transverse bands, all painted by place.
  const hullPaint = paint((p, n, s) => {
    const z = p.z;
    const d = ((s[1] % 360) + 360) % 360;
    const side = d > 180 ? 360 - d : d;
    if (z < -52 || z > 49.5) return NAVY;
    if (side >= 92 && side < 104 && z > -46 && z < 46) return NAVY;
    if (side >= 106 && side < 108.6 && z > -42 && z < 49) return GOLD;
    if (side >= 111 && side < 114.5 && z > -38 && z < 42) return TEAL;
    if ((z > 37.5 && z < 41.5) || (z > -38.5 && z < -35.5)) return NAVY;
    let c = mix("#a9b6c8", IVORY, smoothstep(-0.55, 0.35, n.y));
    c = mix(c, "#c9c2ae", 0.22 * noise(p, 3.5, 4));
    const dm = ((d % 15) + 15) % 15;
    const zm = (((z + 60) % 6) + 6) % 6;
    if (dm < 0.8 || dm > 14.2 || zm < 0.14) c = mix(c, "#6f7a8c", 0.16);
    return c;
  });

  const hull = b.sweep(
    polyline([
      [0, HY, Z0],
      [0, HY, Z1],
    ]),
    (t: number) => RMAX * body(t),
    { bone: hullJ, color: hullPaint, sides: 20, caps: { start: "point", end: "flat" } },
  );
  const skin = b.surface(hull);

  // Gold pinstripe rings flanking the navy bands, plus the nose and tail cinches.
  const ringSpecs: [number, string][] = [
    [-38.9, GOLD],
    [-35.1, GOLD],
    [37.1, GOLD],
    [41.9, GOLD],
    [-52, GOLD],
    [49.5, GOLD2],
  ];
  for (const [z, c] of ringSpecs)
    b.sweep(skin.loop([0, HY, z], { dir: [0, 0, 1], lift: 0.05 }), 0.15, { color: c, bone: hullJ, sides: 6 });

  // Gold studs round the two navy bands.
  for (const zc of [-37, 39.5]) {
    const lp = skin.loop([0, HY, zc], { dir: [0, 0, 1], lift: 0.08 });
    b.along(lp, 28, (at) => {
      b.part(new THREE.OctahedronGeometry(0.26, 0), GOLD2, { bone: hullJ, at: at.at });
    });
  }

  // Keel strip along the belly.
  b.sweep(hull.line(180, 0.04).slice(0.1, 0.88), 0.2, { color: GOLD, bone: hullJ, sides: 6 });

  // Ziggurat vents along the spine.
  const zig = (hit: NonNullable<ReturnType<typeof skin.ray>>) => {
    const tiers: [number, number, string][] = [
      [2.4, 0.45, GOLD],
      [1.8, 0.45, IVORY],
      [1.2, 0.45, GOLD],
    ];
    let lift = 0;
    tiers.forEach(([w, h, c], k) => {
      b.stick(new THREE.BoxGeometry(w, h, w * 1.9), c, hit.moved([0, lift, 0]), {
        bone: hullJ,
        flow: [0, 0, 1],
        embed: k === 0 ? 0.5 : 0,
      });
      lift += h;
    });
    b.stick(new THREE.ConeGeometry(0.28, 1.3, 4), GOLD2, hit.moved([0, lift, 0]), { bone: hullJ, embed: 0 });
  };
  for (const z of [-6, 8, 22, 34]) {
    const hit = skin.ray([0, 70, z], [0, -1, 0]);
    if (hit) zig(hit);
  }

  // Radio mast with cross-bars and a red beacon.
  const mastHit = skin.ray([0, 70, -3], [0, -1, 0])!;
  const my = mastHit.at.y;
  b.rod([0, my - 0.3, -3], [0, my + 4.6, -3], 0.09, { color: STEEL, bone: hullJ });
  b.rod([-1.1, my + 3.7, -3], [1.1, my + 3.7, -3], 0.06, { color: STEEL, bone: hullJ });
  b.rod([-0.7, my + 2.7, -3], [0.7, my + 2.7, -3], 0.06, { color: STEEL, bone: hullJ });
  bulb([0, my + 4.8, -3], RED, 0.2, 1.4);

  // Hull lettering and emblems.
  for (const s of [1, -1]) {
    const a = 62 * D2R;
    const R0 = hullR(-8);
    b.decal(hull, T_NAME, {
      at: [s * R0 * Math.sin(a), HY + R0 * Math.cos(a), -8],
      dir: [s * Math.sin(a), Math.cos(a), 0],
      size: [34, 4.5],
      segments: 24,
      lift: 0.04,
      bone: hullJ,
    });
    const a2 = 80 * D2R;
    const R1 = hullR(46);
    b.decal(hull, T_EMBLEM, {
      at: [s * R1 * Math.sin(a2), HY + R1 * Math.cos(a2), 46],
      dir: [s * Math.sin(a2), Math.cos(a2), 0],
      size: [5, 5],
      segments: 10,
      lift: 0.04,
      bone: hullJ,
    });
  }

  // Nose cap: stepped gold ziggurat dome with finial and mooring ball.
  b.lathe(
    [
      [0, 0],
      [3.7, 0],
      [3.7, 0.5],
      [3.1, 0.5],
      [3.1, 1.2],
      [2.4, 1.2],
      [2.4, 2.0],
      [1.6, 2.0],
      [1.5, 2.7],
      [0.7, 3.3],
      [0, 3.6],
    ],
    { at: [0, HY, Z1 - 0.5], axis: [0, 0, 1], segments: 16, color: GOLD, bone: hullJ },
  );
  b.part(new THREE.TorusGeometry(3.7, 0.16, 5, 20), NAVY, { bone: hullJ, at: [0, HY, Z1 - 0.1] });
  b.spike([0, HY, Z1 + 3.0], [0, 0, 1], 1.8, 0.2, { color: GOLD2, bone: hullJ });
  b.part(new THREE.SphereGeometry(0.34, 8, 6), GOLD2, { bone: hullJ, at: [0, HY, Z1 + 4.9] });

  // Tail light.
  bulb([0, HY, Z0 - 0.3], RED, 0.38, 1.3);

  // -------------------------------------------------------------------------------------------------------------
  // Tail fins: cruciform, stepped, with hinged control surfaces.
  const FIXED: [number, number][] = [
    [12, 0],
    [44, 0],
    [44, 7],
    [28, 16],
    [12, 16],
  ];
  const RUDDER: [number, number][] = [
    [0, 0],
    [0, 16],
    [6, 16],
    [6, 13],
    [9, 13],
    [9, 9],
    [12, 9],
    [12, 0],
  ];
  const finPaint = (thick: THREE.Vector3) =>
    paint((_p, n, s) => {
      if (Math.abs(n.dot(thick)) < 0.5) return GOLD;
      const r = s[1];
      if (r > 14.3) return NAVY;
      if (r > 13.6) return GOLD;
      if (r > 10.2 && r < 10.7) return TEAL;
      return IVORY;
    });
  const finV = finPaint(new THREE.Vector3(1, 0, 0));
  const finH = finPaint(new THREE.Vector3(0, 1, 0));
  const fins: { key: string; rad: V3; paint: typeof finV }[] = [
    { key: "U", rad: [0, 1, 0], paint: finV },
    { key: "D", rad: [0, -1, 0], paint: finV },
    { key: "L", rad: [1, 0, 0], paint: finH },
    { key: "R", rad: [-1, 0, 0], paint: finH },
  ];
  for (const f of fins) {
    b.extrude(FIXED, {
      at: [0, HY, Z0],
      x: [0, 0, 1],
      y: f.rad,
      thickness: 0.9,
      bevel: 0.12,
      color: f.paint,
      bone: hullJ,
    });
    b.extrude(RUDDER, {
      at: [0, HY, -48],
      x: [0, 0, -1],
      y: f.rad,
      thickness: 0.8,
      bevel: 0.1,
      color: f.paint,
      bone: rudJ[f.key],
    });
  }
  for (const s of [1, -1]) {
    plate(6.8, 6.8, T_FIN, [s * 0.52, HY + 11.2, Z0 + 24], [s, 0, 0], hullJ);
    bulb([s * 16.15, HY, -40], s > 0 ? RED : GREEN, 0.4, 1.3);
  }
  bulb([0, HY + 16.15, -40], WHITE, 0.4, 1.3);

  // -------------------------------------------------------------------------------------------------------------
  // Engines: four chrome nacelles on struts, each with a pusher propeller on its own joint.
  const NL = 7;
  const NAC_R = [0.35, 0.85, 1.2, 1.3, 1.2, 1.05];
  const bladePaint = paint((_p, _n, s) => (s[0] > 2.15 ? GOLD : "#aab4c2"));
  const BLADE: [number, number][] = [
    [0.3, -0.14],
    [1.5, -0.32],
    [2.6, -0.16],
    [2.75, 0.1],
    [1.4, 0.3],
    [0.3, 0.2],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const slots: [number, number][] = [
      [1, -4],
      [2, 12],
    ];
    for (const [idx, z0] of slots) {
      const ny = HY - 5;
      const rr = hullR(z0);
      const nx = s * (Math.sqrt(rr * rr - 25) + 2.9);
      const zb = z0 - NL / 2;
      const zf = z0 + NL / 2;

      b.sweep(
        polyline([
          [nx, ny, zb],
          [nx, ny, zf],
        ]),
        NAC_R,
        {
          bone: hullJ,
          sides: 12,
          color: CHROME,
          caps: { start: "round", end: "flat" },
          bands: [
            [0.14, NAVY],
            [0.52, CHROME],
            [0.62, GOLD],
            [1, CHROME],
          ],
        },
      );
      b.part(new THREE.CircleGeometry(1.0, 16), "#ffffff", {
        bone: hullJ,
        at: [nx, ny, zf + 0.05],
        dir: [0, 0, 1],
        axis: "z",
        texture: T_GRILLE,
      });
      b.part(new THREE.TorusGeometry(1.04, 0.1, 6, 16), GOLD, { bone: hullJ, at: [nx, ny, zf + 0.02] });
      b.part(new THREE.TorusGeometry(1.34, 0.08, 6, 16), GOLD2, { bone: hullJ, at: [nx, ny, zb + 0.57 * NL] });
      b.part(new THREE.TorusGeometry(1.0, 0.07, 6, 14), NAVY, { bone: hullJ, at: [nx, ny, zb + 0.9] });
      // exhaust stub
      b.rod([nx + s * 1.1, ny + 0.55, z0 - 1.4], [nx + s * 2.0, ny + 1.3, z0 - 1.9], 0.17, {
        color: DARK,
        bone: hullJ,
      });

      // struts to the hull
      const mounts: V3[] = [
        [nx * 0.95, ny + 1.1, z0 + 1.8],
        [nx * 0.95, ny + 1.1, z0 - 1.8],
        [nx * 0.9, ny - 0.9, z0],
      ];
      for (const m of mounts) {
        const hit = skin.nearest(m);
        b.rod(hit, m, 0.16, { color: STEEL, bone: hullJ });
      }

      // propeller
      const pz = zb - 0.55;
      const pj = b.joint(`prop${side}${idx}`, { parent: hullJ, at: [nx, ny, pz], dir: [0, 0, 1], role: "fan" });
      b.rod([nx, ny, zb - 0.1], [nx, ny, pz + 0.2], 0.13, { color: STEEL, bone: hullJ });
      b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.5, 10), GOLD, {
        bone: pj,
        at: [nx, ny, pz],
        dir: [0, 0, 1],
      });
      b.spike([nx, ny, pz - 0.2], [0, 0, -1], 1.1, 0.42, { color: GOLD2, bone: pj });
      for (let k = 0; k < 4; k++) {
        const a = (k * 90 + (s > 0 ? 20 : 50)) * D2R;
        b.extrude(BLADE, {
          at: [nx, ny, pz],
          x: [Math.cos(a), Math.sin(a), 0],
          y: [-Math.sin(a), Math.cos(a), 0.45],
          thickness: 0.08,
          bevel: 0.02,
          color: bladePaint,
          bone: pj,
        });
      }
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Gondola: stepped-profile cabin with banded deco paint, glowing windows, door, stair and bumper wheel.
  const gondolaPaint = paint((_p, n, s) => {
    const v = s[1];
    if (n.y < -0.6) return NAVY2;
    if (v < 2.4) return NAVY;
    if (v < 2.62) return GOLD;
    if (v > 6.3) return NAVY;
    if (v > 6.08) return GOLD;
    return mix(IVORY, "#c9d0da", n.y < -0.2 ? 0.3 : 0);
  });
  const GOND: [number, number][] = [
    [0.6, 1.4],
    [24, 1.2],
    [27.4, 2.0],
    [28.8, 3.6],
    [28.8, 6.0],
    [27.6, 8.6],
    [0, 8.0],
    [0, 2.6],
  ];
  b.extrude(GOND, {
    at: [0, 0, 4],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 5.6,
    bevel: 0.3,
    color: gondolaPaint,
    bone: gondJ,
  });

  // windscreen and landing lamps
  plate(4.8, 2.2, T_SHIELD, [0, 4.8, 4 + 28.8 + 0.07], [0, 0, 1], gondJ, 0.9);
  for (const s of [1, -1]) {
    bulb([s * 1.6, 6.5, 32.7], WARM, 0.3, 1.6, gondJ);
    // side window ribbon, frieze, door
    plate(22, 2, T_WIN, [s * 2.87, 4.7, 20], [s, 0, 0], gondJ, 0.9);
    plate(22, 0.9, T_FRIEZE, [s * 2.87, 1.95, 17], [s, 0, 0], gondJ);
    plate(1.8, 2.9, T_DOOR, [s * 2.87, 2.9, 7], [s, 0, 0], gondJ);
    // gold pilasters at the ends of the window ribbon
    for (const z of [8.9, 31.1])
      b.part(new THREE.BoxGeometry(0.16, 2.3, 0.4), GOLD, { bone: gondJ, at: [s * 2.85, 4.7, z] });

    // boarding stair (three steps) with rails
    const tops = [1.35, 0.9, 0.45];
    tops.forEach((top, i) => {
      b.part(new THREE.BoxGeometry(0.8, top, 1.9), i % 2 ? IVORY : CHROME, {
        bone: gondJ,
        at: [s * (3.2 + 0.8 * i), top / 2, 7],
      });
      b.part(new THREE.BoxGeometry(0.84, 0.06, 1.94), GOLD, { bone: gondJ, at: [s * (3.2 + 0.8 * i), top + 0.01, 7] });
    });
    for (const z of [6.05, 7.95]) {
      for (const i of [0, 2]) {
        const x = s * (3.2 + 0.8 * i);
        b.rod([x, tops[i], z], [x, tops[i] + 0.85, z], 0.04, { color: GOLD, bone: gondJ });
      }
      b.rod([s * 3.2, tops[0] + 0.85, z], [s * 4.8, tops[2] + 0.85, z], 0.04, { color: GOLD, bone: gondJ });
    }
  }

  // bumper wheel
  b.part(new THREE.CylinderGeometry(0.7, 0.7, 0.5, 12), DARK, { bone: gondJ, at: [0, 0.7, 30.5], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.56, 8), GOLD, { bone: gondJ, at: [0, 0.7, 30.5], dir: [1, 0, 0] });
  for (const s of [1, -1]) b.rod([s * 0.42, 1.8, 30.5], [s * 0.42, 0.7, 30.5], 0.09, { color: STEEL, bone: gondJ });

  return b.root;
}
```
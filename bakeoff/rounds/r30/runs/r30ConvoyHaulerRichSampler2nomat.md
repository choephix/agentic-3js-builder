```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { catmull, createBuilder, mix, noise, paint, polyline, rng, smoothstep, svg } from "agentic-3js-builder";
import type { ColorInput, Joint } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kairos-9 Convoy Hauler",
  description:
    "Low-poly cyberpunk armoured 6x6 convoy hauler: wedge-nosed armoured cab with a hazard ram bumper, twin-gun remote turret, neon underglow and escort signage, guarding a sealed octagonal cargo pod with clamp bands, tamper seals, a hinged rear vault door, a service lid and a status screen.",
};

type V3 = [number, number, number];
type Opt = {
  bone?: Joint;
  rotation?: V3;
  dir?: V3;
  axis?: "x" | "y" | "z";
  up?: V3;
  flat?: boolean;
  scale?: V3;
  name?: string;
};
type Piece = [THREE.BufferGeometry, number, number, number];

const DEG = Math.PI / 180;
const SIDES = [1, -1] as const;

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cylY = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);
const cylZ = (r: number, l: number, n = 8, spin = 0) =>
  new THREE.CylinderGeometry(r, r, l, n).rotateY(spin).rotateX(Math.PI / 2);
const cylX = (r: number, l: number, n = 8, spin = 0) =>
  new THREE.CylinderGeometry(r, r, l, n).rotateY(spin).rotateZ(Math.PI / 2);
const merge = (items: Piece[]) => mergeGeometries(items.map(([g, x, y, z]) => g.translate(x, y, z)))!;

/** A straight run in the (z, y) side view: point-at and surface normal helpers for things lying on a slope. */
const slope = (a: [number, number], c: [number, number]) => {
  const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
  const tz = (c[0] - a[0]) / len;
  const ty = (c[1] - a[1]) / len;
  const nz = -ty;
  const ny = tz;
  return {
    len,
    phi: Math.atan2(-ty, tz),
    n: [0, ny, nz] as V3,
    pt: (u: number, off: number, x = 0): V3 => [x, a[1] + ty * u + ny * off, a[0] + tz * u + nz * off],
  };
};

export default function build() {
  const b = createBuilder({ name: "convoy_hauler", paintSize: 2048 });
  const rand = rng(11);

  // ------------------------------------------------------------------ palette
  const C = {
    hullDark: "#1b1f28",
    plate: "#2c3340",
    plateHi: "#3f485a",
    steel: "#6d7689",
    steelDark: "#434a59",
    black: "#0b0c10",
    rubber: "#17181d",
    glass: "#07131c",
    yellow: "#ffcf1f",
    magenta: "#ff2bd6",
    cyan: "#19e9ff",
    red: "#ff2638",
    amber: "#ff9a1f",
    green: "#3dff8a",
    white: "#f2f6ff",
    lens: "#c8f7ff",
    orange: "#ff6a1a",
    tint: "#ffffff",
  };

  // ------------------------------------------------------------------ paints
  const makeHull = (lo: string, hi: string, su: number, sv: number, seed: number) =>
    paint((p, n) => {
      let c = mix(lo, hi, 0.65 * noise(p, 1.2, seed) + 0.35 * noise(p, 0.14, seed + 3));
      c = mix(c, "#5d6a85", 0.4 * smoothstep(0.5, 1, n.y));
      const ax = Math.abs(n.x);
      const ay = Math.abs(n.y);
      const az = Math.abs(n.z);
      const side = ax >= ay && ax >= az;
      const u = side ? p.z : p.x;
      const v = side ? p.y : ay >= az ? p.z : p.y;
      const fu = (((u / su) % 1) + 1) % 1;
      const fv = (((v / sv) % 1) + 1) % 1;
      if (fu < 0.025 || fv < 0.03) c = mix(c, "#07080c", 0.85);
      else if (fu < 0.045 || fv < 0.055) c = mix(c, "#8a98b6", 0.22);
      c = mix(c, "#54463a", smoothstep(1.7, 0.75, p.y) * (0.3 + 0.5 * noise(p, 0.35, seed + 9)));
      c = mix(c, "#ff2bd6", 0.14 * smoothstep(1.1, 0.7, p.y) * smoothstep(0.2, -0.3, n.y));
      return c;
    });
  const hull = makeHull("#20252f", "#363e4d", 0.9, 0.75, 5);
  const plateP = makeHull("#2d3340", "#475065", 0.6, 0.5, 8);

  const hazard = paint((p, n) => {
    const ax = Math.abs(n.x);
    const ay = Math.abs(n.y);
    const az = Math.abs(n.z);
    const side = ax >= ay && ax >= az;
    const u = side ? p.z : p.x;
    const v = side ? p.y : ay >= az ? p.z : p.y;
    const k = Math.floor((u + v) / 0.2);
    const base = Math.abs(k) % 2 === 0 ? "#ffcf1f" : "#14151a";
    let c = mix(base, "#4a3f2f", 0.3 * noise(p, 0.25, 4));
    c = mix(c, "#0c0c0f", 0.35 * smoothstep(0.62, 0.8, noise(p, 0.12, 6)));
    return c;
  });
  const bumperP = paint((p) => (p.y < 1.02 ? hazard : hull));

  const podP = paint((p, n, s) => {
    let c = mix("#aab1bf", "#dfe4ec", noise(p, 0.8, 21));
    c = mix(c, "#f3f6fb", 0.5 * smoothstep(0.6, 1, n.y));
    c = mix(c, "#6b6f7a", 0.55 * smoothstep(0.1, -0.9, n.y));
    const f = (((p.z / 1.1) % 1) + 1) % 1;
    if (f < 0.018 || f > 0.982) c = mix(c, "#3a3e49", 0.8);
    const a = ((((s[1] + 22.5) % 45) + 45) % 45);
    if (a < 1.4) c = mix(c, "#3a3e49", 0.7);
    if (noise(p, 0.18, 33) > 0.72) c = mix(c, "#7c818c", 0.5);
    c = mix(c, "#2b2b30", 0.5 * smoothstep(-3.0, -4.3, p.z));
    return c;
  });

  // ------------------------------------------------------------------ textures
  let bars = "";
  {
    let x = 8;
    for (let i = 0; i < 28; i++) {
      const w = 1 + ((i * 5 + 3) % 3);
      bars += `<rect x="${x}" y="5" width="${w}" height="20" fill="#111"/>`;
      x += w + 1.5;
    }
  }
  const T = {
    logo: svg(
      `<svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="216" height="96" rx="6" fill="#0f1219" stroke="#ffcf1f" stroke-width="3"/>
        <path d="M2 2 H42 L2 42Z" fill="#ffcf1f"/><path d="M218 98 H178 L218 58Z" fill="#ffcf1f"/>
        <path d="M108 50 L93 76 L63 76 L48 50 L63 24 L93 24Z" fill="#19e9ff" stroke="#0f1219" stroke-width="3"/>
        <path d="M70 36 V64 M70 50 L88 36 M70 50 L88 64" stroke="#0f1219" stroke-width="6" fill="none" stroke-linecap="round"/>
        <text x="118" y="48" font-family="Arial, sans-serif" font-weight="bold" font-size="28" textLength="92" lengthAdjust="spacingAndGlyphs" fill="#f2f6ff">KAIROS</text>
        <text x="118" y="64" font-family="Arial, sans-serif" font-weight="bold" font-size="11" textLength="92" lengthAdjust="spacingAndGlyphs" fill="#19e9ff">SECURE FREIGHT</text>
        <text x="118" y="82" font-family="Arial, sans-serif" font-weight="bold" font-size="10" textLength="92" lengthAdjust="spacingAndGlyphs" fill="#ff2bd6">SEALED // CLASS IV</text>
        <rect x="118" y="88" width="92" height="3" fill="#ff2bd6"/>
      </svg>`,
      { size: 768 },
    ),
    warn: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 6 L96 88 H4Z" fill="#ffcf1f" stroke="#14151a" stroke-width="6" stroke-linejoin="round"/>
        <rect x="44" y="34" width="12" height="30" rx="3" fill="#14151a"/><circle cx="50" cy="75" r="6.5" fill="#14151a"/>
      </svg>`,
      { size: 256 },
    ),
    hud: svg(
      `<svg viewBox="0 0 200 56" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#19e9ff" stroke-width="1.6" fill="none">
          <path d="M4 14 V4 H20 M196 14 V4 H180 M4 42 V52 H20 M196 42 V52 H180"/>
          <circle cx="100" cy="28" r="10"/><path d="M100 12 V18 M100 38 V44 M84 28 H90 M110 28 H116"/>
          <path d="M30 40 H80 M120 40 H170" stroke-dasharray="6 3"/>
        </g>
        <text x="26" y="16" font-family="monospace" font-size="7" fill="#19e9ff">CONVOY 07 / LOCK</text>
        <text x="132" y="16" font-family="monospace" font-size="7" fill="#19e9ff">RNG 412M</text>
        <rect x="150" y="24" width="5" height="5" fill="#ff2638"/><rect x="162" y="30" width="4" height="4" fill="#ff2638"/>
        <rect x="40" y="26" width="4" height="4" fill="#3dff8a"/>
      </svg>`,
      { size: 512 },
    ),
    serial: svg(
      `<svg viewBox="0 0 120 44" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="44" rx="3" fill="#f2f6ff"/>${bars}
        <text x="8" y="40" font-family="Arial, sans-serif" font-weight="bold" font-size="12" textLength="104" lengthAdjust="spacingAndGlyphs" fill="#111">CV-07 // KF-HAUL</text>
      </svg>`,
      { size: 384 },
    ),
    neon: svg(
      `<svg viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg">
        <text x="80" y="33" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#ff3cf0" stroke="#ffd0fa" stroke-width="1.2">ESCORT</text>
        <rect x="6" y="38" width="148" height="3.5" fill="#19e9ff"/>
      </svg>`,
      { size: 512 },
    ),
    seal: svg(
      `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#ff2638" stroke-width="7"/>
        <circle cx="50" cy="50" r="33" fill="none" stroke="#ff7a82" stroke-width="3" stroke-dasharray="7 5"/>
        <rect x="35" y="47" width="30" height="23" rx="3" fill="#ffe3e6"/>
        <path d="M41 47 V39 a9 9 0 0 1 18 0 V47" stroke="#ffe3e6" stroke-width="5" fill="none"/>
        <circle cx="50" cy="58" r="3.5" fill="#ff2638"/><rect x="48.5" y="58" width="3" height="7" fill="#ff2638"/>
      </svg>`,
      { size: 256 },
    ),
    shield: svg(
      `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 4 L94 18 V62 C94 90 70 108 50 116 C30 108 6 90 6 62 V18Z" fill="#12151c" stroke="#19e9ff" stroke-width="5"/>
        <text x="50" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#f2f6ff">KF</text>
        <path d="M22 54 L50 72 L78 54 M22 74 L50 92 L78 74" stroke="#ffcf1f" stroke-width="8" fill="none" stroke-linejoin="round"/>
      </svg>`,
      { size: 256 },
    ),
    status: svg(
      `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="98" height="58" rx="3" fill="#04130d" stroke="#3dff8a" stroke-width="2"/>
        <text x="8" y="18" font-family="monospace" font-weight="bold" font-size="11" textLength="70" lengthAdjust="spacingAndGlyphs" fill="#3dff8a">SEAL: OK</text>
        <text x="8" y="34" font-family="monospace" font-weight="bold" font-size="11" textLength="70" lengthAdjust="spacingAndGlyphs" fill="#3dff8a">TEMP -4C</text>
        <text x="8" y="50" font-family="monospace" font-weight="bold" font-size="11" textLength="84" lengthAdjust="spacingAndGlyphs" fill="#ff9a1f">INTEG 100%</text>
        <rect x="84" y="8" width="8" height="8" fill="#3dff8a"/>
      </svg>`,
      { size: 256 },
    ),
    flag: svg(
      `<svg viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="70" fill="#ff2bd6"/>
        <path d="M0 52 L120 14 V34 L0 70Z" fill="#19e9ff"/>
        <path d="M0 0 H120 V6 H0Z M0 64 H120 V70 H0Z" fill="#10131b"/>
        <text x="60" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="30" textLength="84" lengthAdjust="spacingAndGlyphs" fill="#10131b">KF 07</text>
      </svg>`,
      { size: 256 },
    ),
  };

  // ------------------------------------------------------------------ skeleton + helpers
  const chassis = b.joint("chassis", { at: [0, 1.0, 0], role: "spine" });

  const put = (geo: THREE.BufferGeometry, color: ColorInput, at: V3, o: Opt = {}) =>
    b.part(geo, color, { bone: chassis, at, flat: true, ...o });
  const lamp = (geo: THREE.BufferGeometry, color: string, at: V3, strength = 1.3, o: Opt = {}) =>
    glow(put(geo, color, at, o), strength);
  const rod = (a: V3, c: V3, r: number, color: ColorInput, sides = 6, bone: Joint = chassis) =>
    b.rod(a, c, r, color, { bone, sides });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, bone: Joint = chassis, k = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), C.tint, { bone, at, dir, axis: "z", texture: tex });
    if (k > 0) glow(p, k);
    return p;
  };

  const WX = 1.25;
  const WY = 0.62;
  const PODY = 2.4;

  // ------------------------------------------------------------------ frame, axles, running gear
  for (const s of SIDES) {
    put(box(0.2, 0.24, 9.2), C.hullDark, [s * 0.62, 1.04, -0.1]);
    put(box(0.1, 0.1, 9.0), C.steelDark, [s * 0.62, 0.9, -0.1]);
    lamp(box(0.06, 0.03, 7.6), C.magenta, [s * 0.82, 0.86, -0.2], 1.4);
    put(cylZ(0.24, 1.5, 10), C.steel, [s * 0.88, 0.76, 1.0]); // tanks
    for (const z of [0.5, 1.5]) put(box(0.3, 0.04, 0.06), C.steelDark, [s * 0.88, 0.76, z]);
  }
  for (const z of [-4.3, -3.2, -2.0, -0.6, 0.8, 2.0, 3.6]) put(box(1.5, 0.14, 0.18), C.plate, [0, 1.0, z]);
  rod([0, 0.75, 3.0], [0, 0.75, -2.5], 0.06, C.steel, 8);
  for (const z of [3.0, -1.0, -2.5]) {
    rod([-WX, WY, z], [WX, WY, z], 0.1, C.steelDark, 8);
    put(new THREE.SphereGeometry(0.26, 8, 6), C.steel, [0, WY, z]);
    for (const s of SIDES) {
      put(box(0.12, 0.05, 1.0), C.steel, [s * 0.7, 0.86, z]);
      put(box(0.12, 0.04, 0.9), C.steelDark, [s * 0.7, 0.9, z]);
      rod([s * 0.82, 0.68, z + 0.35], [s * 0.74, 1.0, z + 0.22], 0.03, C.amber, 6);
    }
  }

  // ------------------------------------------------------------------ wheels, arches, flaps
  const AXLES = [
    { id: "F", z: 3.0, steer: true },
    { id: "M", z: -1.0, steer: false },
    { id: "R", z: -2.5, steer: false },
  ];
  const buildWheel = (spin: Joint, hub: V3, s: number) => {
    const P = (g: THREE.BufferGeometry, col: ColorInput, o: Opt = {}) =>
      b.part(g, col, { bone: spin, at: hub, flat: true, ...o });
    P(cylX(0.62, 0.5, 14), C.rubber);
    const treads: Piece[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      treads.push([box(0.5, 0.07, 0.2).translate(0, 0.63, 0).rotateX(a), 0, 0, 0]);
    }
    P(merge(treads), C.black);
    P(cylX(0.4, 0.56, 8), C.steel);
    P(cylX(0.37, 0.07, 8).translate(s * 0.285, 0, 0), C.plate);
    glow(P(new THREE.TorusGeometry(0.3, 0.02, 6, 16).rotateY(Math.PI / 2).translate(s * 0.325, 0, 0), C.magenta), 1.4);
    P(cylX(0.12, 0.12, 6).translate(s * 0.34, 0, 0), C.black);
    const lugs: Piece[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lugs.push([cylX(0.025, 0.05, 6), s * 0.33, 0.21 * Math.cos(a), 0.21 * Math.sin(a)]);
    }
    P(merge(lugs), C.steel);
  };
  for (const ax of AXLES)
    for (const s of SIDES) {
      const sd = s > 0 ? "L" : "R";
      const hub: V3 = [s * WX, WY, ax.z];
      const parent = ax.steer
        ? b.joint(`steer${ax.id}${sd}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" })
        : chassis;
      const spin = b.joint(`wheel${ax.id}${sd}`, { parent, at: hub, dir: [s, 0, 0], role: "hinge" });
      buildWheel(spin, hub, s);
      // wheel arch: a thin half-ring shell over the tyre
      const pts: [number, number][] = [];
      for (let k = 0; k <= 10; k++) {
        const th = (-10 + k * 20) * DEG;
        pts.push([0.88 * Math.cos(th), 0.88 * Math.sin(th)]);
      }
      for (let k = 10; k >= 0; k--) {
        const th = (-10 + k * 20) * DEG;
        pts.push([0.76 * Math.cos(th), 0.76 * Math.sin(th)]);
      }
      b.extrude(pts, { at: hub, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.62, bevel: 0.02, color: plateP, bone: chassis });
      // mud flap with hazard foot
      put(box(0.7, 0.5, 0.04), C.rubber, [s * WX, 0.5, ax.z - 0.9]);
      put(box(0.7, 0.07, 0.05), hazard, [s * WX, 0.28, ax.z - 0.9]);
    }

  // ------------------------------------------------------------------ side skirts
  for (const s of SIDES) {
    b.extrude(
      [
        [0, 0.18],
        [0.2, 0],
        [2.15, 0],
        [2.3, 0.2],
        [2.3, 0.52],
        [0, 0.52],
      ],
      { at: [s * 1.2, 0.72, -0.12], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.015, color: plateP, bone: chassis },
    );
    put(box(0.12, 0.06, 2.1), hazard, [s * 1.21, 0.76, 1.0]);
    const bolts: Piece[] = [];
    for (let i = 0; i < 8; i++) bolts.push([cylX(0.022, 0.03, 6), s * 1.265, 1.12, 0.1 + i * 0.28]);
    put(merge(bolts), C.steel, [0, 0, 0]);
    lamp(box(0.05, 0.04, 2.0), C.magenta, [s * 1.2, 0.69, 1.0], 1.6);
  }

  // ------------------------------------------------------------------ cab shell
  b.extrude(
    [
      [0.9, 1.25],
      [0.9, 3.0],
      [2.4, 3.0],
      [3.2, 2.4],
      [4.0, 2.05],
      [4.45, 1.85],
      [4.45, 1.25],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: hull, bone: chassis, name: "cabShell" },
  );

  // windscreen visor
  const W = slope([2.4, 3.0], [3.2, 2.4]);
  const wr: V3 = [W.phi / DEG, 0, 0];
  put(box(2.0, 0.06, 0.62), C.glass, W.pt(0.5, 0.03), { rotation: wr });
  decal(T.hud, 1.9, 0.53, W.pt(0.5, 0.065), W.n, chassis, 1.1);
  put(box(2.2, 0.1, 0.14), C.plate, W.pt(0.08, 0.08), { rotation: wr });
  put(box(2.2, 0.08, 0.1), C.plate, W.pt(0.94, 0.05), { rotation: wr });
  for (const s of SIDES) {
    put(box(0.1, 0.08, 0.9), C.plate, W.pt(0.5, 0.06, s * 1.1), { rotation: wr });
    put(box(0.06, 0.07, 0.62), C.steelDark, W.pt(0.5, 0.075, s * 0.62), { rotation: wr });
  }
  lamp(box(2.0, 0.025, 0.03), C.cyan, W.pt(0.14, 0.14), 1.4, { rotation: wr });
  lamp(box(2.0, 0.025, 0.03), C.magenta, W.pt(0.9, 0.09), 1.4, { rotation: wr });

  // hood: reactive-armour tiles, neon edges, vents
  const H = slope([3.2, 2.4], [4.0, 2.05]);
  const tilesA: Piece[] = [];
  const tilesB: Piece[] = [];
  for (let i = 0; i < 7; i++)
    for (let j = 0; j < 3; j++) {
      const p = H.pt(0.14 + j * 0.24, 0.04, -1.0 + i * 0.333);
      (rand() < 0.35 ? tilesB : tilesA).push([box(0.29, 0.08, 0.2).rotateX(H.phi), p[0], p[1], p[2]]);
    }
  put(merge(tilesA), C.plate, [0, 0, 0]);
  put(merge(tilesB), C.plateHi, [0, 0, 0]);
  for (const s of SIDES) lamp(box(0.05, 0.04, H.len), C.cyan, H.pt(H.len / 2, 0.02, s * 1.12), 1.3, { rotation: [H.phi / DEG, 0, 0] });
  const H2 = slope([4.0, 2.05], [4.45, 1.85]);
  put(box(2.0, 0.05, H2.len), C.black, H2.pt(H2.len / 2, 0.03), { rotation: [H2.phi / DEG, 0, 0] });

  // doors, windows, signage
  for (const s of SIDES) {
    const sd = s > 0 ? "L" : "R";
    const door = b.joint(`door${sd}`, { parent: chassis, at: [s * 1.15, 1.9, 2.4], dir: [0, 1, 0], role: "hinge" });
    const d = (g: THREE.BufferGeometry, col: ColorInput, at: V3, o: Opt = {}) => put(g, col, at, { bone: door, ...o });
    d(box(0.07, 1.0, 1.36), plateP, [s * 1.18, 1.8, 1.72]);
    d(box(0.04, 0.5, 1.18), C.glass, [s * 1.175, 2.62, 1.72]);
    d(box(0.08, 0.06, 1.3), C.steelDark, [s * 1.18, 2.92, 1.72]);
    d(box(0.08, 0.06, 1.3), C.steelDark, [s * 1.18, 2.33, 1.72]);
    for (const dz of [-0.62, 0.62]) d(box(0.08, 0.6, 0.07), C.steelDark, [s * 1.18, 2.62, 1.72 + dz]);
    d(box(0.06, 0.06, 0.22), C.steel, [s * 1.225, 2.15, 1.2]);
    for (const y of [1.45, 2.5]) d(cylY(0.04, 0.2, 6), C.steel, [s * 1.2, y, 2.4]);
    decal(T.shield, 0.46, 0.55, [s * 1.222, 1.95, 1.72], [s, 0, 0], door);
    d(box(0.03, 0.3, 1.0), C.black, [s * 1.23, 1.5, 1.72]);
    decal(T.neon, 0.95, 0.26, [s * 1.248, 1.5, 1.72], [s, 0, 0], door, 1.3);
    d(box(0.04, 0.03, 1.3), C.magenta, [s * 1.225, 1.31, 1.72]);
    glow(b.part(box(0.04, 0.03, 1.3), C.magenta, { bone: door, at: [s * 1.225, 1.31, 1.72] }), 1.5);
    // wing mirror camera
    rod([s * 1.18, 2.5, 2.85], [s * 1.5, 2.6, 3.05], 0.03, C.steel, 6);
    put(box(0.12, 0.16, 0.22), C.black, [s * 1.52, 2.6, 3.05]);
    lamp(cylZ(0.04, 0.03, 8), C.cyan, [s * 1.52, 2.6, 3.17], 1.6);
  }

  // ------------------------------------------------------------------ nose, bumper, lights
  b.extrude(
    [
      [4.2, 0.7],
      [4.8, 0.7],
      [5.0, 0.95],
      [4.95, 1.3],
      [4.2, 1.3],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.9, bevel: 0.04, color: bumperP, bone: chassis, name: "ramBumper" },
  );
  for (let i = -3; i <= 3; i++) b.spike([i * 0.4, 0.82, 5.0], [0, 0, 1], 0.25, 0.07, C.steel, { bone: chassis, sides: 4 });
  lamp(box(2.4, 0.04, 0.05), C.cyan, [0, 1.32, 4.6], 1.3);
  for (const s of SIDES) {
    put(cylZ(0.14, 0.06, 10), C.black, [s * 1.0, 1.1, 4.97]);
    lamp(cylZ(0.1, 0.05, 10), C.amber, [s * 1.0, 1.1, 5.0], 1.5);
    put(new THREE.TorusGeometry(0.12, 0.03, 6, 10), C.steel, [s * 0.6, 0.95, 5.0]);
    put(box(0.95, 0.22, 0.1), C.black, [s * 0.82, 1.62, 4.5]);
    lamp(box(0.85, 0.07, 0.04), C.lens, [s * 0.82, 1.62, 4.56], 1.6);
    put(box(1.0, 0.05, 0.14), C.plateHi, [s * 0.82, 1.78, 4.5]);
  }
  decal(T.shield, 0.34, 0.42, [0, 1.62, 4.47], [0, 0, 1]);
  for (const y of [1.29, 1.33, 1.37]) put(box(2.2, 0.03, 0.06), C.steel, [0, y, 4.48]);

  // ------------------------------------------------------------------ cab roof
  for (const s of SIDES) put(box(0.06, 0.1, 1.5), C.plate, [s * 1.12, 3.05, 1.65]);
  put(box(2.3, 0.1, 0.06), C.plate, [0, 3.05, 0.93]);
  // light bar
  put(box(2.1, 0.12, 0.16), C.black, [0, 3.06, 2.32]);
  for (let i = 0; i < 5; i++) lamp(box(0.32, 0.07, 0.04), i === 0 || i === 4 ? C.amber : i % 2 ? C.cyan : C.lens, [-0.8 + i * 0.4, 3.07, 2.41], 1.6);
  // smoke launchers
  for (const s of SIDES) {
    put(box(0.3, 0.1, 0.5), C.black, [s * 0.95, 3.05, 2.05]);
    for (let i = 0; i < 3; i++) {
      const z = 1.9 + i * 0.15;
      rod([s * 0.92, 3.08, z], [s * 1.05, 3.35, z + 0.15], 0.055, C.steelDark, 6);
    }
  }
  // turret
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 3.0, 1.6], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.36, 1.8], dir: [0, 0, 1], role: "hinge" });
  put(cylY(0.56, 0.06, 12), C.steel, [0, 3.03, 1.6]);
  const ringBolts: Piece[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ringBolts.push([cylY(0.02, 0.05, 6), 0.5 * Math.cos(a), 3.07, 1.6 + 0.5 * Math.sin(a)]);
  }
  put(merge(ringBolts), C.black, [0, 0, 0]);
  put(cylY(0.46, 0.18, 12), C.plate, [0, 3.12, 1.6], { bone: yaw });
  b.extrude(
    [
      [-0.55, 0],
      [0.5, 0],
      [0.42, 0.22],
      [0.15, 0.3],
      [-0.3, 0.3],
      [-0.55, 0.15],
    ],
    { at: [0, 3.2, 1.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.9, bevel: 0.03, color: plateP, bone: yaw },
  );
  put(box(0.9, 0.34, 0.14), C.black, [0, 3.36, 2.12], { bone: pitch });
  for (const s of SIDES) {
    put(box(0.2, 0.2, 0.5), C.plate, [s * 0.22, 3.36, 2.35], { bone: pitch });
    rod([s * 0.22, 3.36, 2.55], [s * 0.22, 3.36, 3.15], 0.05, C.steelDark, 8, pitch);
    put(cylZ(0.085, 0.18, 8), C.black, [s * 0.22, 3.36, 3.12], { bone: pitch });
    lamp(cylZ(0.04, 0.02, 6), C.orange, [s * 0.22, 3.36, 3.23], 1.6, { bone: pitch });
    put(box(0.22, 0.26, 0.4), C.plateHi, [s * 0.58, 3.32, 1.55], { bone: yaw });
    rod([s * 0.5, 3.38, 1.75], [s * 0.3, 3.36, 2.1], 0.02, C.steel, 5, yaw);
  }
  put(new THREE.SphereGeometry(0.12, 8, 6), C.black, [0.22, 3.6, 1.45], { bone: yaw });
  lamp(new THREE.SphereGeometry(0.06, 6, 4), C.red, [0.22, 3.62, 1.56], 1.8, { bone: yaw });
  // antennas, dish, flag
  rod([-1.0, 3.0, 1.0], [-1.04, 4.9, 0.96], 0.018, C.steel, 5);
  put(cylY(0.06, 0.1, 8), C.black, [-1.0, 3.05, 1.0]);
  lamp(new THREE.SphereGeometry(0.035, 6, 4), C.red, [-1.04, 4.92, 0.96], 1.8);
  rod([-0.85, 3.0, 0.98], [-0.86, 4.0, 0.95], 0.014, C.steel, 5);
  put(cylY(0.04, 0.3, 6), C.steel, [-0.55, 3.15, 1.4]);
  b.lathe(
    [
      [0, 0],
      [0.3, 0.12],
      [0.3, 0.14],
      [0, 0.03],
    ],
    { at: [-0.55, 3.35, 1.4], axis: [0, 0.5, 0.85], segments: 12, bone: chassis, color: C.plateHi },
  );
  rod([-0.55, 3.38, 1.42], [-0.55, 3.62, 1.7], 0.012, C.steel, 5);
  put(new THREE.SphereGeometry(0.035, 6, 4), C.black, [-0.55, 3.64, 1.72]);
  rod([1.0, 3.0, 1.0], [1.0, 4.55, 1.0], 0.02, C.steel, 6);
  put(new THREE.SphereGeometry(0.04, 6, 4), C.yellow, [1.0, 4.58, 1.0]);
  for (const s of SIDES) decal(T.flag, 0.8, 0.467, [1.0 + s * 0.026, 4.3, 0.6], [s, 0, 0]);

  // ------------------------------------------------------------------ exhaust stacks behind the cab
  for (const s of SIDES) {
    rod([s * 1.33, 1.3, 0.74], [s * 1.33, 3.9, 0.74], 0.09, C.steel, 8);
    put(cylY(0.14, 1.2, 8), C.steelDark, [s * 1.33, 2.3, 0.74]);
    for (const y of [2.9, 3.5]) put(cylY(0.12, 0.06, 8), C.black, [s * 1.33, y, 0.74]);
    put(cylY(0.13, 0.06, 8), C.black, [s * 1.33, 3.93, 0.74]);
    lamp(new THREE.TorusGeometry(0.085, 0.015, 5, 10).rotateX(Math.PI / 2), C.orange, [s * 1.33, 3.96, 0.74], 1.6);
    for (const y of [1.8, 2.6]) put(box(0.22, 0.12, 0.14), C.plate, [s * 1.24, y, 0.86]);
  }
  // cab-to-pod couplings and hoses
  for (const s of SIDES) {
    put(cylZ(0.08, 0.14, 8), C.steelDark, [s * 0.45, 2.0, 0.85]);
    lamp(new THREE.TorusGeometry(0.08, 0.015, 5, 8), C.amber, [s * 0.45, 2.0, 0.79], 1.4);
    b.sweep(catmull([[s * 0.5, 1.8, 0.92], [s * 0.5, 1.5, 0.86], [s * 0.64, 1.32, 0.88]]), 0.035, C.black, { bone: chassis, sides: 6 });
  }
  put(box(0.3, 0.3, 0.14), C.plate, [0, 1.75, 0.85]);

  // ------------------------------------------------------------------ the sealed cargo pod
  b.sweep(polyline([[0, PODY, -3.9], [0, PODY, 0.45]]), 1.2, { bone: chassis, color: podP, sides: 8, smooth: false, caps: "flat", name: "podBody" });
  b.sweep(polyline([[0, PODY, 0.45], [0, PODY, 0.8]]), [1.2, 0.95], { bone: chassis, color: hazard, sides: 8, smooth: false, caps: "flat", name: "podFront" });
  b.sweep(polyline([[0, PODY, -3.9], [0, PODY, -4.3]]), [1.2, 0.95], { bone: chassis, color: hazard, sides: 8, smooth: false, caps: "flat", name: "podRear" });

  // cradle plates and braces
  for (const z of [-0.3, -1.9, -3.4]) {
    put(box(2.0, 0.12, 0.4), C.hullDark, [0, 1.16, z]);
    for (const s of SIDES) put(box(0.08, 0.9, 0.4), C.steelDark, [s * 0.891, 1.509, z], { rotation: [0, 0, -45 * s] });
  }

  // reinforcing ribs and clamp bands
  const octRing = (z: number, w: number, flat: number, col: string) =>
    put(cylZ(flat * 1.0824, w, 8, Math.PI / 8), col, [0, PODY, z]);
  octRing(0.3, 0.1, 1.225, C.steelDark);
  octRing(-3.75, 0.1, 1.225, C.steelDark);
  octRing(-0.3, 0.2, 1.24, C.plateHi);
  octRing(-3.05, 0.2, 1.24, C.plateHi);
  octRing(-4.31, 0.06, 0.96, C.hullDark);
  for (const z of [-0.3, -3.05]) {
    put(box(0.5, 0.16, 0.3), C.steel, [0, PODY + 1.28, z]);
    lamp(box(0.08, 0.05, 0.08), C.red, [-0.14, PODY + 1.37, z], 1.8);
    lamp(box(0.08, 0.05, 0.08), C.amber, [0.14, PODY + 1.37, z], 1.8);
    for (const s of SIDES) {
      put(box(0.12, 0.3, 0.26), C.steel, [s * 1.285, PODY, z]);
      lamp(box(0.04, 0.06, 0.06), C.amber, [s * 1.35, PODY, z], 1.6);
    }
  }

  // glowing edge conduits
  for (const s of SIDES) {
    lamp(box(0.05, 0.05, 2.3), C.magenta, [s * 1.2, PODY + 0.5, -1.75], 1.2);
    lamp(box(0.05, 0.05, 2.3), C.magenta, [s * 1.2, PODY - 0.5, -1.75], 1.2);
    lamp(box(0.05, 0.05, 2.0), C.cyan, [s * 0.5, PODY + 1.2, -1.6], 1.2);
    // side decals
    decal(T.logo, 2.0, 0.909, [s * 1.208, PODY, -1.75], [s, 0, 0]);
    put(box(0.03, 0.4, 0.58), C.black, [s * 1.208, PODY + 0.1, -3.45], { flat: false });
    decal(T.status, 0.5, 0.3, [s * 1.227, PODY + 0.1, -3.45], [s, 0, 0], chassis, 0.9);
    const nrm: V3 = [s * 0.7071, 0.7071, 0];
    decal(T.warn, 0.5, 0.5, [s * 0.8485 + nrm[0] * 0.008, PODY + 0.8485 + nrm[1] * 0.008, -1.6], nrm);
  }

  // top service lid
  const lid = b.joint("podLid", { parent: chassis, at: [0, 3.62, -2.2], dir: [1, 0, 0], role: "hinge" });
  const L = (g: THREE.BufferGeometry, col: ColorInput, at: V3, o: Opt = {}) => put(g, col, at, { bone: lid, ...o });
  L(box(0.86, 0.08, 1.15), C.plateHi, [0, 3.64, -1.62]);
  L(box(0.7, 0.02, 0.95), C.hullDark, [0, 3.69, -1.62]);
  L(new THREE.TorusGeometry(0.12, 0.02, 5, 10).rotateX(Math.PI / 2), C.steel, [0, 3.72, -1.5]);
  L(box(0.26, 0.03, 0.03), C.steel, [0, 3.72, -1.5]);
  L(box(0.03, 0.03, 0.26), C.steel, [0, 3.72, -1.5]);
  [C.green, C.green, C.amber, C.green, C.red].forEach((col, i) =>
    glow(b.part(box(0.07, 0.03, 0.07), col, { bone: lid, at: [-0.3 + i * 0.15, 3.71, -1.08] }), 1.7),
  );
  for (const s of SIDES) put(cylX(0.035, 0.15, 6), C.steel, [s * 0.3, 3.62, -2.2]);
  // cooler fins
  put(box(0.9, 0.06, 0.5), C.hullDark, [0, 3.63, -2.85]);
  const fins: Piece[] = [];
  for (let i = 0; i < 7; i++) fins.push([box(0.8, 0.12 + rand() * 0.06, 0.04), 0, 3.72, -2.65 - i * 0.07]);
  put(merge(fins), C.steelDark, [0, 0, 0]);
  // beacon
  const beacon = b.joint("beacon", { parent: chassis, at: [0, 3.62, -3.5], dir: [0, 1, 0], role: "hinge" });
  put(cylY(0.14, 0.08, 10), C.black, [0, 3.65, -3.5]);
  glow(b.part(new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), C.amber, { bone: beacon, at: [0, 3.69, -3.5], flat: true }), 1.5);
  put(box(0.2, 0.1, 0.02), C.steel, [0, 3.74, -3.5], { bone: beacon });
  // pod telemetry mast
  rod([0.35, 3.62, -3.1], [0.35, 4.2, -3.1], 0.02, C.steel, 5);
  rod([0.1, 4.15, -3.1], [0.6, 4.15, -3.1], 0.012, C.steel, 4);
  lamp(new THREE.SphereGeometry(0.03, 6, 4), C.green, [0.35, 4.22, -3.1], 1.8);

  // ------------------------------------------------------------------ rear vault door
  const podDoor = b.joint("podDoor", { parent: chassis, at: [-0.95, PODY, -4.35], dir: [0, 1, 0], role: "hinge" });
  const D = (g: THREE.BufferGeometry, col: ColorInput, at: V3, o: Opt = {}) => put(g, col, at, { bone: podDoor, ...o });
  D(cylZ(0.88 * 1.0824, 0.1, 8, Math.PI / 8), C.plateHi, [0, PODY, -4.35]);
  const lugs: Piece[] = [];
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    lugs.push([box(0.22, 0.12, 0.1).rotateZ(-a), 0.86 * Math.sin(a), PODY + 0.86 * Math.cos(a), -4.43]);
  }
  D(merge(lugs), C.steel, [0, 0, 0]);
  glow(b.part(new THREE.TorusGeometry(0.62, 0.025, 6, 16), C.red, { bone: podDoor, at: [0, PODY, -4.41], flat: true }), 1.6);
  D(new THREE.TorusGeometry(0.2, 0.025, 6, 12), C.steel, [0, PODY - 0.18, -4.43]);
  D(box(0.4, 0.04, 0.04), C.steel, [0, PODY - 0.18, -4.43]);
  D(box(0.04, 0.4, 0.04), C.steel, [0, PODY - 0.18, -4.43]);
  D(cylZ(0.06, 0.1, 8), C.black, [0, PODY - 0.18, -4.45]);
  decal(T.seal, 0.36, 0.36, [0, PODY + 0.3, -4.412], [0, 0, -1], podDoor, 1.3);
  D(box(0.14, 1.5, 0.02), hazard, [0.35, PODY, -4.415]);
  for (const y of [PODY + 0.62, PODY - 0.62]) glow(b.part(box(0.1, 0.06, 0.04), C.red, { bone: podDoor, at: [0.35, y, -4.43] }), 1.8);
  for (const y of [PODY - 0.5, PODY, PODY + 0.5]) put(cylY(0.05, 0.18, 6), C.steel, [-0.95, y, -4.33]);

  // ------------------------------------------------------------------ rear bumper & tail
  put(box(2.9, 0.36, 0.3), hazard, [0, 0.88, -4.62]);
  for (const s of SIDES) {
    lamp(box(0.5, 0.1, 0.05), C.red, [s * 1.0, 0.9, -4.79], 1.6);
    put(new THREE.TorusGeometry(0.1, 0.025, 6, 10), C.steel, [s * 0.5, 0.65, -4.7]);
    put(box(0.12, 0.2, 0.3), C.steelDark, [s * 0.5, 0.88, -4.45]);
  }
  decal(T.serial, 0.6, 0.22, [0, 0.88, -4.775], [0, 0, -1]);
  lamp(box(2.4, 0.03, 0.04), C.magenta, [0, 0.68, -4.62], 1.4);

  return b.root;
}
```
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { OutlinePoint } from "../src/builder";
import { aim, DEG } from "../src/math";
import { paint } from "../src/paint";
import { catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Vanguard VX-04 Strike Fighter",
  description:
    "Twin-engine delta-canard strike fighter parked on its landing gear: white and graphite hull with bold orange colour blocking, panel-lined paint, hinged control surfaces, gear, canopy and vectoring nozzles, underwing missiles and glowing light strips.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

// palette: white hull, graphite trim, one strong orange accent
const WHITE = "#eef2f7";
const WHITE2 = "#dde3ec";
const GREY = "#a9b3c2";
const GREY_D = "#7a8596";
const LINE = "#8f9bad";
const LINE_D = "#566170";
const STEEL = "#4d5666";
const STEEL_L = "#c3cbd7";
const CHROME = "#e3e8f0";
const GRAPH = "#272d38";
const INK = "#12161d";
const ORANGE = "#ff7a14";
const ORANGE_D = "#d4570a";
const TIRE = "#1d2128";
const TIRE2 = "#2a2f38";
const RED = "#ff2d3d";
const GREEN = "#2be072";
const HOT = "#ffd28a";
const STROBE = "#fff8e6";

export default function build() {
  const b = createBuilder({ name: "jetFighter", paintSize: 2048 });
  const hull = b.joint("hull", { at: [0, 2.05, 0] });
  type J = typeof hull;

  // ---------------------------------------------------------------- batching of small static details
  const pending = new Map<string, { bone: J; color: string; geos: THREE.BufferGeometry[] }>();
  const stash = (bone: J, color: string, g: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    const slot = pending.get(key) ?? { bone, color, geos: [] };
    slot.geos.push(g);
    pending.set(key, slot);
  };
  const bx = (bone: J, color: string, w: number, h: number, d: number, x: number, y: number, z: number, rot?: P3) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    g.translate(x, y, z);
    stash(bone, color, g);
  };
  const cyl = (bone: J, color: string, r0: number, r1: number, len: number, from: P3, dir: P3, seg = 8) => {
    const g = new THREE.CylinderGeometry(r1, r0, len, seg);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(aim(dir));
    g.translate(from[0], from[1], from[2]);
    stash(bone, color, g);
  };
  const ball = (bone: J, color: string, r: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => {
    const g = new THREE.SphereGeometry(r, 5, 3);
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    stash(bone, color, g);
  };

  // ---------------------------------------------------------------- textures
  const T = {
    number: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120"><text x="4" y="102" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="124" fill="${GRAPH}">04</text><path d="M158 14 L214 14 L196 46 L140 46 Z" fill="${ORANGE}"/><path d="M146 58 L202 58 L190 80 L134 80 Z" fill="${ORANGE}"/></svg>`,
      { size: 440 },
    ),
    emblem: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="${ORANGE}" stroke-width="9"/><path d="M60 20 L90 84 L60 70 L30 84 Z" fill="${GRAPH}"/><path d="M18 74 L48 62 M102 74 L72 62" stroke="${ORANGE}" stroke-width="7" fill="none"/><rect x="40" y="92" width="40" height="7" fill="${ORANGE}"/></svg>`,
      { size: 360 },
    ),
    panelsA: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 96"><g fill="none" stroke="${LINE_D}" stroke-width="2.4"><rect x="4" y="6" width="104" height="58" rx="5"/><rect x="118" y="6" width="116" height="34" rx="5"/><rect x="118" y="48" width="52" height="40" rx="5"/><path d="M182 88 L234 88 M182 70 L234 70"/></g><g fill="${GRAPH}" font-family="Arial, sans-serif" font-weight="800"><text x="12" y="30" font-size="15">AVIONICS</text><text x="12" y="52" font-size="11">BAY 2 - HOT</text><text x="126" y="30" font-size="14">DATALINK</text><text x="124" y="64" font-size="11">GND</text><text x="124" y="80" font-size="11">PWR</text></g><path d="M82 70 L96 94 L68 94 Z" fill="none" stroke="${ORANGE}" stroke-width="3.2"/><rect x="81" y="78" width="3" height="8" fill="${ORANGE}"/><g fill="${LINE_D}"><circle cx="10" cy="12" r="2"/><circle cx="102" cy="12" r="2"/><circle cx="10" cy="58" r="2"/><circle cx="102" cy="58" r="2"/><circle cx="124" cy="12" r="2"/><circle cx="228" cy="12" r="2"/><circle cx="124" cy="34" r="2"/><circle cx="228" cy="34" r="2"/></g></svg>`,
      { size: 480 },
    ),
    panelsB: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 96"><g fill="none" stroke="${LINE_D}" stroke-width="2.4"><rect x="6" y="8" width="70" height="46" rx="6"/><circle cx="116" cy="30" r="22"/><circle cx="116" cy="30" r="12"/><rect x="152" y="8" width="80" height="46" rx="5"/><path d="M6 72 L232 72 M6 86 L232 86"/></g><g fill="${GRAPH}" font-family="Arial, sans-serif" font-weight="800"><text x="14" y="36" font-size="18">FUEL</text><text x="160" y="30" font-size="13">OXYGEN</text><text x="160" y="46" font-size="10">SERVICE</text></g><path d="M100 30 L132 30 M116 14 L116 46" stroke="${ORANGE}" stroke-width="3.4"/><rect x="6" y="75" width="40" height="8" fill="${ORANGE}"/><rect x="52" y="75" width="40" height="8" fill="${GRAPH}"/><rect x="98" y="75" width="40" height="8" fill="${ORANGE}"/><rect x="144" y="75" width="40" height="8" fill="${GRAPH}"/><rect x="190" y="75" width="40" height="8" fill="${ORANGE}"/></svg>`,
      { size: 480 },
    ),
    rescue: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="M6 30 L40 8 L40 22 L74 22 L74 38 L40 38 L40 52 Z" fill="${ORANGE}"/><text x="82" y="42" font-family="Arial, sans-serif" font-weight="900" font-size="30" fill="${GRAPH}">RESCUE</text><path d="M80 10 L196 10" stroke="${GRAPH}" stroke-width="4"/></svg>`,
      { size: 400 },
    ),
    step: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 70"><rect x="3" y="3" width="194" height="64" rx="8" fill="none" stroke="${GRAPH}" stroke-width="4"/><text x="100" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="34" fill="${GRAPH}">NO STEP</text><path d="M14 12 L30 12 M170 12 L186 12 M14 58 L30 58 M170 58 L186 58" stroke="${ORANGE}" stroke-width="5"/></svg>`,
      { size: 400 },
    ),
    hazard: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 32"><rect width="256" height="32" fill="${GRAPH}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 24 - 8} 32 L${i * 24 + 8} 0 L${i * 24 + 20} 0 L${i * 24 + 4} 32 Z" fill="${ORANGE}"/>`).join("")}</svg>`,
      { size: 512 },
    ),
    flag: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect width="160" height="40" fill="#e0202e"/><text x="6" y="26" textLength="148" lengthAdjust="spacingAndGlyphs" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="#ffffff">REMOVE BEFORE FLIGHT</text></svg>`,
      { size: 320 },
    ),
    core: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#c8480c"/><circle cx="50" cy="50" r="44" fill="#ff6a10"/><circle cx="50" cy="50" r="36" fill="#ff9a2a"/><circle cx="50" cy="50" r="27" fill="#ffd27a"/><circle cx="50" cy="50" r="16" fill="#fff1d0"/><circle cx="50" cy="50" r="7" fill="#ffffff"/><path d="M50 50 L50 6 M50 50 L81 19 M50 50 L94 50 M50 50 L81 81 M50 50 L50 94 M50 50 L19 81 M50 50 L6 50 M50 50 L19 19" stroke="#e5590c" stroke-width="3"/></svg>`,
      { size: 256 },
    ),
    grill: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0d1015"/><circle cx="50" cy="50" r="46" fill="#171b22"/>${Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const a2 = a + 0.28;
        return `<path d="M${50 + Math.cos(a) * 16} ${50 + Math.sin(a) * 16} L${50 + Math.cos(a) * 45} ${50 + Math.sin(a) * 45} L${50 + Math.cos(a2) * 45} ${50 + Math.sin(a2) * 45} Z" fill="#434d5d"/>`;
      }).join("")}<circle cx="50" cy="50" r="15" fill="#7d8899"/><circle cx="50" cy="50" r="7" fill="#c3cbd7"/></svg>`,
      { size: 256 },
    ),
    danger: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 50"><path d="M4 42 L22 8 L40 42 Z" fill="none" stroke="${ORANGE}" stroke-width="5"/><rect x="20" y="18" width="4" height="12" fill="${ORANGE}"/><text x="50" y="38" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="${ORANGE}">INTAKE</text></svg>`,
      { size: 320 },
    ),
    walk: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200"><rect x="3" y="3" width="114" height="194" rx="6" fill="#2b323d" stroke="#eef2f7" stroke-width="4"/>${Array.from({ length: 10 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<circle cx="${14 + c * 18}" cy="${16 + r * 18}" r="3.4" fill="#4a5362"/>`).join("")).join("")}<path d="M6 190 L114 190" stroke="${ORANGE}" stroke-width="5"/></svg>`,
      { size: 300 },
    ),
  };

  // ---------------------------------------------------------------- paints
  const seamNear = (v: number, c: number, w: number) => Math.abs(v - c) < w;
  const TRANS = [5.1, 4.35, 3.55, 2.75, 1.6, 0.5, -0.7, -1.9, -3.1, -4.2, -5.3];
  const ANG_SEAMS: [number, number, number][] = [
    [42, -5, 3.4],
    [74, -4.6, 2],
    [-42, -5.2, 5],
  ];
  const HATCHES: [number, number, number, number][] = [
    [-1.6, -0.35, 6, 30],
    [-3.7, -2.2, -8, 24],
    [4.95, 5.55, 8, 34],
    [1.9, 2.8, 52, 80],
    [-2.6, -1.4, 56, 82],
    [0.2, 1.3, -28, -8],
  ];

  const fusePaint = paint((p, n) => {
    const x = Math.abs(p.x);
    const y = p.y;
    const z = p.z;
    const ang = Math.atan2(y - 2.05, x) / DEG;
    const belly = ang < -36;
    // aft thermal zone
    if (z < -5.75) return n.z < -0.4 ? GRAPH : STEEL;
    if (z < -5.15 && !belly) return z < -5.45 ? STEEL : GREY_D;
    // flank swoosh stripe
    const yc = 2.1 + 0.03 * (z - 2);
    const hh = 0.06 + 0.022 * ((5.8 - z) / 6);
    if (!belly && ang > -30 && ang < 38 && z > -4.2 && z < 5.8) {
      if (Math.abs(y - yc) < hh) return ORANGE;
      if (Math.abs(y - (yc - hh - 0.075)) < 0.013 && z > -3 && z < 5.2) return ORANGE;
    }
    // nose-top stripe
    if (!belly && ang > 50 && z > 4.9 && z < 6.5) {
      if (x < 0.06) return ORANGE;
      if (x < 0.5 - (z - 4.9) * 0.2) return GRAPH;
    }
    // belly bays: nose-gear well and weapons bay
    if (belly) {
      if (x < 0.27 && z > 4.3 && z < 5.55) return INK;
      if (x < 0.5 && z > -0.2 && z < 2.2) return seamNear(x, 0.5, 0.012) || seamNear(z, 2.2, 0.012) || seamNear(z, -0.2, 0.012) ? ORANGE : GREY_D;
      if (x < 0.1 && z < -1) return GREY_D;
    }
    // panel lines
    const lineCol = belly ? LINE_D : LINE;
    for (const t of TRANS) {
      if (seamNear(z, t, 0.009)) return lineCol;
      if (seamNear(z, t - 0.032, 0.004) && Math.floor(ang * 1.1) % 2 === 0 && !belly) return lineCol;
    }
    for (const [a, z0, z1] of ANG_SEAMS) if (z > z0 && z < z1 && seamNear(ang, a, 0.8)) return lineCol;
    for (const [z0, z1, a0, a1] of HATCHES) {
      if (z > z0 - 0.01 && z < z1 + 0.01 && ang > a0 - 0.9 && ang < a1 + 0.9) {
        if (seamNear(z, z0, 0.009) || seamNear(z, z1, 0.009) || seamNear(ang, a0, 0.8) || seamNear(ang, a1, 0.8)) return lineCol;
      }
    }
    return belly ? GREY : WHITE;
  });

  const leZ = (u: number) => (u < 2.4 ? 5.6 - (u - 0.5) * (3.6 / 1.9) : 2.0 - (u - 2.4) * (4.5 / 3.35));
  const hZ = (u: number) => -3.15 - (5.6 - u) * 0.2188;
  const ctrlDepth = (u: number) => 0.58 + (5.58 - u) * 0.06;

  const wingPaint = paint((p, n) => {
    const u = Math.abs(p.x);
    const z = p.z;
    if (u > 5.2) return ORANGE;
    const top = n.y > 0;
    if (Math.abs(n.y) < 0.5) return u > 2.3 && z - leZ(u) > -0.3 ? GREY_D : GREY;
    const dle = (leZ(u) - z) * 0.8;
    if (dle < 0.2) return top ? GREY_D : GRAPH;
    if (dle < 0.235) return ORANGE_D;
    if (top && u > 2.5 && dle > 0.42 && dle < 0.5) return ORANGE;
    if (top && u > 2.5 && dle > 0.5 && dle < 0.53) return GRAPH;
    // trailing zone near hinge line: shadow gap
    const dh = z - hZ(u);
    if (dh < 0.03 && dh > -0.03) return top ? LINE : LINE_D;
    const lc = top ? LINE : LINE_D;
    const a = z + 0.32 * u;
    const ma = ((a % 1.45) + 1.45) % 1.45;
    if (Math.min(ma, 1.45 - ma) < 0.009) return lc;
    const mb = ((u % 1.3) + 1.3) % 1.3;
    if (Math.min(mb, 1.3 - mb) < 0.009 && dle > 0.6) return lc;
    // rivet row beside the rib lines
    if (Math.abs(mb - 0.05) < 0.005 && Math.floor(z * 14) % 2 === 0 && dle > 0.6) return lc;
    // underside bays
    if (!top && u > 1.1 && u < 2.1 && z < 0.7 && z > -2.3 && (seamNear(u, 1.1, 0.012) || seamNear(u, 2.1, 0.012) || seamNear(z, 0.7, 0.012) || seamNear(z, -2.3, 0.012))) return ORANGE_D;
    return top ? WHITE : GREY;
  });

  const ctrlPaint = paint((p, n) => {
    const u = Math.abs(p.x);
    const z = p.z;
    if (Math.abs(n.y) < 0.5) return GREY;
    const top = n.y > 0;
    const trailing = hZ(u) - ctrlDepth(u) - z;
    if (trailing > -0.13) return ORANGE;
    if (trailing > -0.145) return GRAPH;
    const ma = ((u * 1.0) % 0.55 + 0.55) % 0.55;
    if (Math.min(ma, 0.55 - ma) < 0.008) return top ? LINE : LINE_D;
    return top ? WHITE : GREY;
  });

  const finPaint = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return GREY;
    if (p.y > 3.95) return ORANGE;
    if (p.y > 3.9) return GRAPH;
    if (seamNear(p.y, 3.35, 0.009) || seamNear(p.z, -2.55, 0.009)) return LINE;
    return WHITE;
  });

  const rudderPaint = paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return GREY;
    if (p.y > 3.95) return ORANGE;
    if (p.y > 3.9) return GRAPH;
    if (seamNear(p.y, 3.2, 0.008) || seamNear(p.y, 2.85, 0.008)) return LINE;
    return p.z < -5.3 ? ORANGE : WHITE;
  });

  const tailplanePaint = paint((p, n) => {
    const u = Math.abs(p.x);
    if (Math.abs(n.y) < 0.5) return GREY;
    if (u > 3.3) return ORANGE;
    const top = n.y > 0;
    const a = p.z + 0.5 * u;
    const ma = ((a % 1.1) + 1.1) % 1.1;
    if (Math.min(ma, 1.1 - ma) < 0.008) return top ? LINE : LINE_D;
    return top ? WHITE : GREY;
  });

  const canardPaint = paint((p, n) => {
    const u = Math.abs(p.x);
    if (u > 2.15) return ORANGE;
    if (Math.abs(n.y) < 0.5) return GREY;
    const top = n.y > 0;
    const a = p.z + 0.6 * u;
    const ma = ((a % 0.7) + 0.7) % 0.7;
    if (Math.min(ma, 0.7 - ma) < 0.007) return top ? LINE : LINE_D;
    return top ? GRAPH : STEEL;
  });

  const spinePaint = paint((p, n) => {
    const z = p.z;
    const x = Math.abs(p.x);
    if (n.y > 0.6 && x < 0.1) return ORANGE;
    if (n.y > 0.6 && x < 0.135) return GRAPH;
    for (const t of [1.6, 0.4, -0.9, -2.2, -3.4]) if (seamNear(z, t, 0.009)) return LINE;
    if (n.y < 0.2) return GREY;
    if (z < -3.6) return STEEL;
    return WHITE2;
  });

  const intakePaint = paint((p, n) => {
    const z = p.z;
    if (z > 3.34) return ORANGE;
    if (z > 3.3) return GRAPH;
    if (n.y < -0.4) return GREY;
    if (seamNear(z, 2.4, 0.009) || seamNear(z, 1.2, 0.009) || seamNear(z, 0.2, 0.009)) return LINE;
    if (z > 3.0 && z < 3.3 && Math.abs(p.y - 1.88) > 0.12) return WHITE2;
    return WHITE;
  });

  const sponsonPaint = paint((p, n) => {
    const x = Math.abs(p.x);
    if (n.y < -0.5 && p.z > -2.5 && p.z < 0.5 && Math.abs(x - 1.55) < 0.22) return INK;
    if (n.y < -0.5) return GREY_D;
    if (seamNear(p.z, -0.8, 0.009) || seamNear(p.z, -2.0, 0.009)) return LINE;
    return p.z < -2.9 ? ORANGE : WHITE;
  });

  const doorPaint = paint((p, n) => {
    const sideSign = Math.sign(p.x);
    if (Math.abs(n.x) < 0.5) return GREY_D;
    if (n.x * sideSign < 0) return ORANGE;
    if (seamNear(p.z, -1.0, 0.008)) return LINE;
    return WHITE;
  });

  const radomePaint = paint((p, n) => {
    if (n.y > 0.75 && Math.abs(p.x) < 0.05) return "#7886a0";
    if (seamNear(p.z, 7.35, 0.012) || seamNear(p.z, 7.9, 0.012)) return STEEL;
    return p.z < 6.62 ? ORANGE : "#343c4a";
  });

  const glassPaint = paint((p) => {
    const k = p.x * 0.75 - p.z * 0.5 + p.y * 0.35;
    if (Math.abs(k - 0.02) < 0.035) return "#a9dcf0";
    if (Math.abs(k + 0.2) < 0.012) return "#7fc0e0";
    if (Math.abs(k - 0.34) < 0.05) return "#4f93b8";
    if (p.y > 3.25) return "#2a6a92";
    if (p.y > 3.0) return "#1b4d72";
    return "#12354f";
  });

  const nozzlePaint = paint((_p, n, s) => {
    const seam = ((s[1] % 22.5) + 22.5) % 22.5;
    if (Math.abs(n.y) + Math.abs(n.x) > 0.01 && (seam < 1.4 || seam > 21.1)) return INK;
    if (s[0] > 0.62) return "#6c5f7a";
    if (s[0] > 0.45) return "#59546c";
    return STEEL;
  });

  const podPaint = paint((p) => {
    if (Math.abs(p.z + 2.3) < 0.012 || Math.abs(p.z + 3.4) < 0.012) return GRAPH;
    return p.z > -2.35 ? ORANGE : WHITE;
  });

  const tyrePaint = paint((_p, n, s) => {
    if (Math.abs(n.x) < 0.55) return Math.floor(s[1] / 14) % 2 === 0 ? TIRE : TIRE2;
    return Math.abs(n.x) > 0.95 ? TIRE : "#2f3540";
  });

  // ---------------------------------------------------------------- fuselage
  const fuse = b.loft(
    [
      { at: [0, 1.98, 6.5], w: 0.86, h: 0.78 },
      { at: [0, 2.0, 5.6], w: 1.28, h: 1.05 },
      { at: [0, 2.04, 4.4], w: 1.74, h: 1.38 },
      { at: [0, 2.08, 3.0], w: 2.15, h: 1.62 },
      { at: [0, 2.1, 1.0], w: 2.55, h: 1.72 },
      { at: [0, 2.1, -1.5], w: 2.85, h: 1.74 },
      { at: [0, 2.1, -3.5], w: 2.85, h: 1.64 },
      { at: [0, 2.08, -5.0], w: 2.85, h: 1.5 },
      { at: [0, 2.05, -6.0], w: 2.8, h: 1.34 },
    ],
    { bone: hull, sides: 20, color: fusePaint, caps: { start: "flat", end: "flat" }, name: "fuselage" },
  );

  // radome
  b.lathe(
    [
      [0, 0],
      [0.43, 0],
      [0.425, 0.28],
      [0.35, 0.8],
      [0.22, 1.35],
      [0.09, 1.75],
      [0.0, 1.95],
    ],
    { at: [0, 1.98, 6.45], axis: [0, 0, 1], bone: hull, color: radomePaint, segments: 18, name: "radome" },
  );
  // pitot probe + flag
  b.sweep([[0, 1.98, 8.38], [0, 1.98, 9.15]], [0.026, 0.012], { bone: hull, color: STEEL_L, sides: 6, caps: { start: "flat", end: "point" }, name: "pitot" });
  for (const zz of [8.6, 8.8]) b.sweep([[0, 1.98, zz], [0, 1.98, zz + 0.08]], 0.03, { bone: hull, color: ORANGE, sides: 6, caps: "flat", name: "pitotBand" });
  b.part(new THREE.BoxGeometry(0.36, 0.09, 0.006), "#ffffff", { bone: hull, at: [0, 1.94, 8.5], dir: [0, 0, 1], texture: T.flag, rotation: [0, 0, 0], name: "pitotFlag" });
  // chin sensor ball
  b.part(new THREE.SphereGeometry(0.15, 10, 8), STEEL, { bone: hull, at: [0, 1.46, 5.75], name: "irst" });
  glow(b.part(new THREE.SphereGeometry(0.075, 8, 6), ORANGE, { bone: hull, at: [0, 1.44, 5.87], name: "irstLens" }), 1.2);

  // dorsal spine
  b.loft(
    [
      { at: [0, 2.92, 2.6], w: 0.8, h: 0.4 },
      { at: [0, 2.92, 1.0], w: 1.3, h: 0.44 },
      { at: [0, 2.92, -1.0], w: 1.6, h: 0.46 },
      { at: [0, 2.88, -3.0], w: 1.4, h: 0.4 },
      { at: [0, 2.84, -4.8], w: 0.9, h: 0.3 },
    ],
    { bone: hull, sides: 12, color: spinePaint, name: "spine" },
  );
  // spine vents + antennas
  for (let i = 0; i < 7; i++) bx(hull, GRAPH, 0.34, 0.03, 0.07, 0, 3.15 - i * 0.012, -1.4 - i * 0.28);
  bx(hull, GRAPH, 0.5, 0.05, 0.22, 0, 3.0, -4.75);
  b.extrude([[0, 0], [0.34, 0], [0.16, 0.34], [0.06, 0.34]], { at: [0, 3.05, -2.3], x: [0, 0, -1], thickness: 0.03, bevel: 0.008, color: WHITE, bone: hull, name: "antennaDorsal" });
  b.extrude([[0, 0], [0.3, 0], [0.12, 0.28], [0.04, 0.28]], { at: [0, 1.36, 0.3], y: [0, -1, 0], thickness: 0.03, bevel: 0.008, color: GREY, bone: hull, name: "antennaBelly" });
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), RED, { bone: hull, at: [0, 3.15, -0.15], name: "beacon" }), 1.4);
  glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), RED, { bone: hull, at: [0, 1.32, -1.0], name: "beaconBelly" }), 1.4);

  // flank decals
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.decal(fuse, T.panelsA, { at: [s * 1.38, 2.0, -2.6], dir: [s, 0, 0], size: [1.5, 0.6], segments: 14, name: `panelsA${side}` });
    b.decal(fuse, T.panelsB, { at: [s * 1.2, 2.18, -0.6], dir: [s, 0, 0], size: [1.5, 0.6], segments: 14, name: `panelsB${side}` });
    b.decal(fuse, T.emblem, { at: [s * 0.82, 2.2, 4.75], dir: [s, 0.25, 0.1], size: [0.4, 0.4], segments: 8, name: `emblem${side}` });
    b.decal(fuse, T.rescue, { at: [s * 0.74, 2.5, 3.2], dir: [s, 0.5, 0], size: [0.55, 0.17], segments: 8, name: `rescue${side}` });
  }

  // ---------------------------------------------------------------- canopy
  const canopy = b.joint("canopy", { parent: hull, at: [0, 2.62, 2.15], dir: [1, 0, 0], role: "hinge" });
  const CC = { y: 2.55, z: 3.95, rx: 0.62, ry: 0.97, rz: 1.85 };
  const glass = new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(glass, glassPaint, { bone: canopy, at: [0, CC.y, CC.z], scale: [CC.rx, CC.ry, CC.rz], name: "canopyGlass" });
  const rib = (dz: number) => {
    const k = Math.sqrt(Math.max(0, 1 - (dz / CC.rz) ** 2));
    const pts: P3[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = (Math.PI * i) / 8;
      pts.push([Math.cos(a) * CC.rx * k * 1.02, CC.y + Math.sin(a) * CC.ry * k * 1.02, CC.z + dz]);
    }
    return catmull(pts);
  };
  for (const dz of [-1.35, -0.55, 0.45, 1.2]) b.sweep(rib(dz), 0.022, { bone: canopy, color: GRAPH, sides: 6, caps: "none", name: "canopyRib" });
  for (const a of [18, 90, 162]) {
    const pts: P3[] = [];
    for (let i = 0; i <= 10; i++) {
      const dz = -1.45 + (i / 10) * 2.85;
      const k = Math.sqrt(Math.max(0, 1 - (dz / CC.rz) ** 2));
      pts.push([Math.cos(a * DEG) * CC.rx * k * 1.02, CC.y + Math.sin(a * DEG) * CC.ry * k * 1.02, CC.z + dz]);
    }
    b.sweep(catmull(pts), a === 90 ? 0.026 : 0.02, { bone: canopy, color: a === 90 ? ORANGE : GRAPH, sides: 6, caps: "none", name: "canopyRail" });
  }
  {
    const base: P3[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      base.push([Math.cos(a) * CC.rx * 1.0, CC.y + 0.02, CC.z + Math.sin(a) * CC.rz * 1.0]);
    }
    b.sweep(catmull(base, { closed: true }), 0.04, { bone: canopy, color: STEEL, sides: 6, name: "canopySill" });
  }
  // windscreen bow and HUD glass bracket
  bx(canopy, GRAPH, 0.9, 0.05, 0.1, 0, 2.86, 5.38, [-18, 0, 0]);
  // canopy glints
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.9), "#d8f2ff", { bone: canopy, at: [0.26, 3.28, 3.7], rotation: [-8, 0, -30], name: "glint" });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.5), "#d8f2ff", { bone: canopy, at: [-0.32, 3.18, 4.4], rotation: [-26, 0, 28], name: "glint2" });

  // ---------------------------------------------------------------- intakes
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const cx = s * 1.35;
    b.loft(
      [
        { at: [cx, 1.88, 3.55], w: 0.82, h: 0.74 },
        { at: [cx + s * 0.005, 1.88, 2.4], w: 0.88, h: 0.8 },
        { at: [cx + s * 0.03, 1.88, 1.0], w: 0.92, h: 0.84 },
        { at: [cx + s * 0.05, 1.88, -0.4], w: 0.78, h: 0.76 },
      ],
      { bone: hull, sides: 8, smooth: false, color: intakePaint, caps: { start: "flat", end: "round" }, name: `intake${side}` },
    );
    b.part(new THREE.CircleGeometry(0.35, 8, 22.5 * DEG), "#ffffff", { bone: hull, at: [cx, 1.88, 3.557], dir: [0, 0, 1], axis: "z", texture: T.grill, name: `grill${side}` });
    // boundary-layer splitter and lip glow
    bx(hull, STEEL_L, 0.03, 0.62, 0.34, s * 0.97, 1.88, 3.35);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.012, 0.22), HOT, { bone: hull, at: [cx + s * 0.32, 1.88, 3.45], name: `intakeGlow${side}` }), 1.2);
    // cheek vents, chine louvers
    for (let i = 0; i < 5; i++) bx(hull, GRAPH, 0.02, 0.2, 0.05, s * (1.37 + 0.45 + 0.0), 1.9, 2.8 - i * 0.3);
    // danger marking
    b.part(new THREE.PlaneGeometry(0.5, 0.16), "#ffffff", { bone: hull, at: [s * 1.805, 2.12, 1.9], dir: [s, 0, 0], axis: "z", texture: T.danger, name: `danger${side}` });
    // intake top ramp wedge
    b.extrude([[0, 0], [1.3, 0], [1.0, 0.1], [0.1, 0.1]], { at: [s * 1.35, 2.25, 3.4], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.7, bevel: 0.02, color: WHITE2, bone: hull, name: `rampTop${side}` });
    // bolt ring round the intake lip
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      ball(hull, CHROME, 0.016, s * 1.35 + Math.cos(a) * 0.4, 1.88 + Math.sin(a) * 0.37, 3.575);
    }
  }

  // ---------------------------------------------------------------- wings & control surfaces
  const wingOutline: OutlinePoint[] = [
    [0.5, 5.6],
    [2.4, 2.0, "sharp"],
    [5.75, -2.5],
    [5.6, -3.15],
    [0.5, hZ(0.5)],
  ];
  const ctrl = (u0: number, u1: number): OutlinePoint[] => [
    [u0, hZ(u0) + 0.02],
    [u1, hZ(u1) + 0.02],
    [u1, hZ(u1) - ctrlDepth(u1)],
    [u0, hZ(u0) - ctrlDepth(u0)],
  ];
  const WY = 2.0;
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    b.extrude(wingOutline, { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.16, bevel: 0.05, color: wingPaint, bone: hull, name: `wing${side}` });
    const ail = b.joint(`aileron${side}`, { parent: hull, at: [s * 3.75, WY, hZ(3.75)], aim: [s * 5.58, WY, hZ(5.58)], role: "hinge" });
    b.extrude(ctrl(3.75, 5.58), { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.13, bevel: 0.04, color: ctrlPaint, bone: ail, name: `aileron${side}` });
    for (const u of [4.1, 4.9, 5.4]) cyl(ail, STEEL_L, 0.007, 0.004, 0.26, [s * u, WY, hZ(u) - ctrlDepth(u)], [0, 0, -1], 4);
    const flap = b.joint(`flap${side}`, { parent: hull, at: [s * 1.45, WY, hZ(1.45)], aim: [s * 3.65, WY, hZ(3.65)], role: "hinge" });
    b.extrude(ctrl(1.45, 3.65), { at: [0, WY, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.13, bevel: 0.04, color: ctrlPaint, bone: flap, name: `flap${side}` });
    // hazard strips on the flap hinge line and walkway
    glow(b.part(new THREE.BoxGeometry(0.9, 0.012, 0.03), HOT, { bone: hull, at: [s * 4.65, WY + 0.082, hZ(4.65) + 0.34], rotation: [0, s * 12.4, 0], name: `ailGlow${side}` }), 1.1);
    b.part(new THREE.PlaneGeometry(0.62, 1.02), "#ffffff", { bone: hull, at: [s * 2.3, WY + 0.083, 0.15], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: T.walk, name: `walkway${side}` });
    b.part(new THREE.PlaneGeometry(0.55, 0.19), "#ffffff", { bone: hull, at: [s * 3.0, WY + 0.083, -1.7], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: T.step, name: `noStep${side}` });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: hull, at: [s * 4.1, WY + 0.083, -2.9], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: T.emblem, name: `wingEmblem${side}` });
    // upper-surface fence
    b.extrude([[0.55, 2.07], [-0.5, 2.07], [-0.6, 2.22], [0.4, 2.3]], { at: [s * 3.3, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, bevel: 0.008, color: ORANGE, bone: hull, name: `fence${side}` });
    // vortex generators + LE rivets
    for (let i = 0; i < 9; i++) {
      const u = 2.7 + i * 0.3;
      bx(hull, STEEL, 0.015, 0.05, 0.12, s * u, WY + 0.1, leZ(u) - 0.42, [0, s * 38, 0]);
    }
    for (let i = 0; i < 16; i++) {
      const u = 2.6 + i * 0.19;
      ball(hull, CHROME, 0.011, s * u, WY + 0.082, leZ(u) - 0.17);
    }
    // wing pods (tip rails)
    b.loft(
      [
        { at: [s * 5.78, WY, -1.55], w: 0.14, h: 0.14 },
        { at: [s * 5.78, WY, -2.1], w: 0.26, h: 0.28 },
        { at: [s * 5.78, WY, -3.2], w: 0.28, h: 0.3 },
        { at: [s * 5.78, WY, -4.1], w: 0.14, h: 0.16 },
      ],
      { bone: hull, sides: 10, color: podPaint, name: `tipPod${side}` },
    );
    const lens = s > 0 ? RED : GREEN;
    glow(b.part(new THREE.SphereGeometry(0.065, 8, 6), lens, { bone: hull, at: [s * 5.78, WY, -1.5], name: `navLight${side}` }), 1.5);
    for (const dy of [1, -1]) b.extrude([[-2.5, 0.1], [-3.5, 0.1], [-3.7, 0.4], [-3.2, 0.4]], { at: [s * 5.78, WY, 0], x: [0, 0, 1], y: [0, dy, 0], thickness: 0.035, bevel: 0.01, color: ORANGE_D, bone: hull, name: `podFin${side}` });
    glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), STROBE, { bone: hull, at: [s * 5.78, WY, -4.12], name: `tipStrobe${side}` }), 1.4);
  }

  // ---------------------------------------------------------------- canards & tailplanes
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const canard = b.joint(`canard${side}`, { parent: hull, at: [s * 0.6, 2.35, 3.95], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [[0.6, 4.75], [2.7, 3.65], [2.8, 3.2], [0.6, 3.3]],
      { at: [0, 2.35, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.025, color: canardPaint, bone: canard, name: `canard${side}` },
    );
    glow(b.part(new THREE.BoxGeometry(0.4, 0.012, 0.02), HOT, { bone: canard, at: [s * 1.9, 2.39, 3.75], rotation: [0, s * 30, 0], name: `canardGlow${side}` }), 1.1);

    const tail = b.joint(`tailplane${side}`, { parent: hull, at: [s * 1.3, 2.0, -5.4], dir: [s, 0, 0], role: "hinge" });
    b.extrude(
      [[1.3, -4.4], [3.9, -6.0], [3.95, -6.55], [1.3, -6.0]],
      { at: [0, 2.0, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.09, bevel: 0.03, color: tailplanePaint, bone: tail, name: `tailplane${side}` },
    );
    bx(tail, ORANGE_D, 0.03, 0.095, 0.28, s * 3.4, 2.0, -5.9, [0, s * 32, 0]);
    cyl(tail, STEEL, 0.13, 0.13, 0.36, [s * 1.18, 2.0, -5.4], [s, 0, 0], 10);
    cyl(tail, ORANGE, 0.14, 0.14, 0.05, [s * 1.54, 2.0, -5.4], [s, 0, 0], 10);
  }

  // ---------------------------------------------------------------- twin tail fins & rudders
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const cant = 15 * DEG;
    const yd: P3 = [s * Math.sin(cant), Math.cos(cant), 0];
    const base: P3 = [s * 1.1, 2.5, 0];
    const finPt = (z: number, v: number): P3 => [base[0] + v * yd[0], base[1] + v * yd[1], z];
    const finOutline: OutlinePoint[] = [
      [-1.4, -0.25],
      [-1.9, 0.35],
      [-3.9, 2.35],
      [-4.75, 2.35],
      [-5.02, 0.0],
      [-5.02, -0.25],
    ];
    const fin = b.extrude(finOutline, { at: base, x: [0, 0, 1], y: yd, thickness: 0.11, bevel: 0.035, color: finPaint, bone: hull, name: `fin${side}` });
    const rudder = b.joint(`rudder${side}`, { parent: hull, at: finPt(-5.0, 0), aim: finPt(-4.72, 2.36), role: "hinge" });
    b.extrude(
      [[-4.72, 2.36], [-5.5, 2.3], [-5.9, 0.0], [-5.0, 0.0]],
      { at: base, x: [0, 0, 1], y: yd, thickness: 0.085, bevel: 0.028, color: rudderPaint, bone: rudder, name: `rudder${side}` },
    );
    const out: P3 = [s * Math.cos(cant), -Math.sin(cant), 0];
    b.decal(fin, T.number, { at: finPt(-3.45, 1.0), dir: out, size: [1.1, 0.6], segments: 6, name: `finNumber${side}` });
    b.decal(fin, T.emblem, { at: finPt(-2.75, 0.6), dir: out, size: [0.38, 0.38], segments: 4, name: `finEmblem${side}` });
    // tip glow + strobe + fin-tip antenna pod
    glow(b.part(new THREE.BoxGeometry(0.1, 0.015, 0.7), HOT, { bone: hull, at: finPt(-4.35, 2.4), rotation: [0, 0, -s * 15], name: `finTipGlow${side}` }), 1.2);
    glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), STROBE, { bone: rudder, at: finPt(-5.45, 2.3), name: `finStrobe${side}` }), 1.4);
    // LE sensor strip
    cyl(hull, STEEL, 0.03, 0.03, 1.4, finPt(-3.2, 1.5), [0, 0.05, -1], 6);
  }

  // ---------------------------------------------------------------- engines, nozzles and stinger
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const nx = s * 0.86;
    const nozzle = b.joint(`nozzle${side}`, { parent: hull, at: [nx, 2.05, -6.0], dir: [0, 0, -1], role: "hinge" });
    b.lathe(
      [
        [0.6, 0],
        [0.6, 0.3],
        [0.52, 0.42],
        [0.46, 1.0],
        [0.4, 1.0],
        [0.45, 0.42],
        [0.46, 0.0],
      ],
      { at: [nx, 2.05, -6.0], axis: [0, 0, -1], bone: nozzle, color: nozzlePaint, segments: 16, name: `nozzle${side}` },
    );
    b.lathe(
      [
        [0.62, 0.02],
        [0.62, 0.17],
        [0.585, 0.17],
        [0.585, 0.02],
      ],
      { at: [nx, 2.05, -6.0], axis: [0, 0, -1], bone: nozzle, color: ORANGE, segments: 16, name: `nozzleBand${side}` },
    );
    b.ring(frame([nx, 2.05, -6.35], [0, 0, -1]), { count: 12, radius: 0.55, tilt: 5 }, (item) =>
      b.part(new THREE.BoxGeometry(0.2, 0.025, 0.55), "#7b758f", { bone: nozzle, frame: item, name: `petal${side}` }),
    );
    glow(b.part(new THREE.CircleGeometry(0.42, 16), "#ffffff", { bone: nozzle, at: [nx, 2.05, -6.3], dir: [0, 0, -1], axis: "z", texture: T.core, name: `core${side}` }), 1.3);
    // flame-holder struts
    for (let i = 0; i < 3; i++) bx(nozzle, GRAPH, 0.78, 0.025, 0.04, nx, 2.05, -6.28, [0, 0, i * 60]);
  }
  // stinger
  b.spike([0, 2.08, -5.95], [0, 0, -1], 1.35, 0.2, { bone: hull, sides: 10, color: STEEL, name: "stinger" });
  b.sweep([[0, 2.08, -6.0], [0, 2.08, -6.5]], 0.205, { bone: hull, sides: 10, color: ORANGE, caps: "flat", name: "stingerBand" });
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), STROBE, { bone: hull, at: [0, 2.08, -7.32], name: "tailLight" }), 1.4);
  bx(hull, GRAPH, 0.3, 0.1, 0.4, 0, 2.3, -6.1);
  for (const s of [1, -1]) {
    // chaff / flare dispensers
    for (let i = 0; i < 4; i++) bx(hull, GRAPH, 0.12, 0.02, 0.2, s * (1.08 + 0.0), 1.55 + 0.0, -4.3 - i * 0.28, [0, 0, s * 10]);
  }

  // ---------------------------------------------------------------- landing gear
  type Wheel = { bone: J; x: number; y: number; z: number; r: number; w: number; side: number };
  const wheel = ({ bone, x, y, z, r, w, side }: Wheel) => {
    b.lathe(
      [
        [0.12, 0],
        [r - 0.07, 0],
        [r - 0.015, w * 0.14],
        [r, w * 0.34],
        [r, w * 0.66],
        [r - 0.015, w * 0.86],
        [r - 0.07, w],
        [0.12, w],
      ],
      { at: [x - w / 2, y, z], axis: [1, 0, 0], bone, color: tyrePaint, segments: 20, name: "tyre" },
    );
    const hubR = r * 0.52;
    cyl(bone, STEEL_L, hubR, hubR, w + 0.012, [x - w / 2 - 0.006, y, z], [1, 0, 0], 12);
    cyl(bone, STEEL, hubR * 0.62, hubR * 0.62, w + 0.03, [x - w / 2 - 0.015, y, z], [1, 0, 0], 10);
    const face = x + side * (w / 2 + 0.018);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ball(bone, CHROME, 0.016, face, y + Math.cos(a) * hubR * 0.82, z + Math.sin(a) * hubR * 0.82);
    }
    b.part(new THREE.CylinderGeometry(hubR * 0.4, hubR * 0.4, 0.03, 10), ORANGE, { bone, at: [face, y, z], dir: [1, 0, 0], name: "hubCap" });
    // brake disc
    cyl(bone, GREY_D, hubR * 0.92, hubR * 0.92, 0.02, [x - side * (w / 2 - 0.02), y, z], [1, 0, 0], 12);
  };

  // nose gear
  const noseGear = b.joint("noseGear", { parent: hull, at: [0, 1.42, 4.8], dir: [0, -1, 0.08], role: "hinge" });
  const noseWheel = b.joint("noseWheel", { parent: noseGear, at: [0, 0.37, 4.884], dir: [1, 0, 0], role: "hinge" });
  cyl(noseGear, STEEL_L, 0.1, 0.1, 0.62, [0, 1.42, 4.8], [0, -1, 0.08], 10);
  cyl(noseGear, CHROME, 0.062, 0.062, 0.62, [0, 0.9, 4.842], [0, -1, 0.08], 10);
  cyl(noseGear, GRAPH, 0.115, 0.115, 0.06, [0, 1.3, 4.79], [0, -1, 0.08], 10);
  bx(noseGear, ORANGE, 0.24, 0.07, 0.14, 0, 0.78, 4.84);
  // axle block, fork, torque links, lamp, hose
  bx(noseGear, STEEL, 0.18, 0.12, 0.14, 0, 0.5, 4.87);
  cyl(noseWheel, STEEL, 0.035, 0.035, 0.62, [-0.31, 0.37, 4.884], [1, 0, 0], 8);
  for (const s of [1, -1]) {
    bx(noseGear, STEEL, 0.03, 0.34, 0.07, s * 0.075, 0.62, 4.95, [-8, 0, 0]);
    bx(noseGear, GREY, 0.025, 0.22, 0.06, s * 0.075, 0.9, 4.74, [14, 0, 0]);
    wheel({ bone: noseWheel, x: s * 0.2, y: 0.37, z: 4.884, r: 0.37, w: 0.2, side: s });
  }
  b.rod([0.1, 1.2, 4.72], [0.07, 0.62, 4.74], 0.012, { bone: noseGear, color: INK, sides: 5, name: "noseHose" });
  glow(b.part(new THREE.BoxGeometry(0.1, 0.06, 0.03), STROBE, { bone: noseGear, at: [0, 1.05, 4.62], name: "taxiLight" }), 1.4);
  // drag brace
  cyl(noseGear, STEEL, 0.035, 0.035, 0.86, [0, 1.4, 4.2], [0, -0.6, 0.62], 6);
  // nose gear doors
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const door = b.joint(`noseDoor${side}`, { parent: hull, at: [s * 0.44, 1.46, 5.45], aim: [s * 0.44, 1.46, 4.25], role: "hinge" });
    b.extrude([[5.45, 0], [4.25, 0], [4.35, 0.5], [5.3, 0.55]], { at: [s * 0.44, 1.46, 0], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.03, bevel: 0.008, color: doorPaint, bone: door, name: `noseDoor${side}` });
  }

  // main gear
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const gx = s * 1.55;
    const gz = -1.3;
    // gear sponson under the wing
    b.loft(
      [
        { at: [gx, 1.78, 1.0], w: 0.5, h: 0.3 },
        { at: [gx, 1.76, 0.4], w: 0.78, h: 0.4 },
        { at: [gx, 1.74, -1.0], w: 0.84, h: 0.42 },
        { at: [gx, 1.75, -2.6], w: 0.74, h: 0.38 },
        { at: [gx, 1.8, -3.4], w: 0.45, h: 0.26 },
      ],
      { bone: hull, sides: 10, color: sponsonPaint, name: `sponson${side}` },
    );
    const leg = b.joint(`mainGear${side}`, { parent: hull, at: [gx, 1.6, gz], dir: [0, -1, 0], role: "hinge" });
    const wj = b.joint(`mainWheel${side}`, { parent: leg, at: [gx, 0.42, gz], dir: [1, 0, 0], role: "hinge" });
    cyl(leg, STEEL_L, 0.115, 0.115, 0.62, [gx, 1.6, gz], [0, -1, 0], 10);
    cyl(leg, GRAPH, 0.125, 0.125, 0.07, [gx, 1.5, gz], [0, -1, 0], 10);
    cyl(leg, CHROME, 0.075, 0.075, 0.5, [gx, 1.0, gz], [0, -1, 0], 10);
    bx(leg, ORANGE, 0.26, 0.08, 0.2, gx, 0.9, gz);
    bx(leg, STEEL, 0.5, 0.07, 0.14, gx, 0.9, gz);
    cyl(wj, STEEL, 0.045, 0.045, 0.6, [gx - 0.3, 0.42, gz], [1, 0, 0], 8);
    for (const o of [1, -1]) {
      cyl(leg, STEEL, 0.04, 0.04, 0.52, [gx + o * 0.0, 0.92, gz + o * 0.0], [o * 0.42, -0.9, 0], 6);
      bx(leg, STEEL_L, 0.03, 0.34, 0.07, gx + o * 0.095, 0.7, gz - 0.12, [0, 0, 0]);
    }
    // scissor links
    bx(leg, GREY, 0.02, 0.3, 0.07, gx, 1.22, gz + 0.14, [16, 0, 0]);
    bx(leg, GREY, 0.02, 0.3, 0.07, gx, 1.0, gz + 0.14, [-16, 0, 0]);
    // brake calipers + hoses
    bx(wj, ORANGE, 0.1, 0.1, 0.12, gx + s * 0.13, 0.42 + 0.3, gz + 0.0);
    b.rod([gx + s * 0.1, 1.45, gz + 0.1], [gx + s * 0.15, 0.78, gz + 0.02], 0.014, { bone: leg, color: INK, sides: 5, name: `brakeHose${side}` });
    wheel({ bone: wj, x: gx, y: 0.42, z: gz, r: 0.42, w: 0.36, side: s });
    // leg tail lamp
    glow(b.part(new THREE.BoxGeometry(0.08, 0.05, 0.03), STROBE, { bone: leg, at: [gx, 1.35, gz + 0.13], name: `legLamp${side}` }), 1.3);
    // gear doors (open, hanging)
    const door = b.joint(`gearDoor${side}`, { parent: hull, at: [s * 1.95, 1.62, 0.5], aim: [s * 1.95, 1.62, -2.5], role: "hinge" });
    b.extrude([[0.5, 0], [-2.5, 0], [-2.35, 0.52], [0.35, 0.52]], { at: [s * 1.95, 1.62, 0], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.035, bevel: 0.01, color: doorPaint, bone: door, name: `gearDoor${side}` });
    // inner hazard strip
    b.part(new THREE.PlaneGeometry(1.2, 0.09), "#ffffff", { bone: door, at: [s * 1.95 - s * 0.021, 1.2, -0.9], dir: [-s, 0, 0], axis: "z", up: [0, 1, 0], texture: T.hazard, name: `doorHazard${side}` });
  }

  // ---------------------------------------------------------------- weapons: pylons + missiles
  type Miss = { s: number; u: number; zt: number; len: number; r: number; y: number };
  const missile = ({ s, u, zt, len, r, y }: Miss) => {
    const x = s * u;
    const zn = zt + len;
    b.sweep(
      [[x, y, zt], [x, y, zn]],
      [r, r],
      {
        bone: hull,
        sides: 10,
        bands: [
          [0.08, STEEL],
          [0.5, WHITE],
          [0.56, ORANGE],
          [0.8, WHITE],
          [0.84, GRAPH],
          [1, GRAPH],
        ],
        caps: { start: "flat", end: "point" },
        extend: [0, r * 1.6],
        name: "missile",
      },
    );
    // fins: tail cruciform and canards
    bx(hull, STEEL_L, r * 4.2, 0.016, 0.26, x, y, zt + 0.2);
    bx(hull, STEEL_L, 0.016, r * 4.2, 0.26, x, y, zt + 0.2);
    bx(hull, ORANGE_D, r * 3.0, 0.012, 0.16, x, y, zn - 0.45);
    bx(hull, ORANGE_D, 0.012, r * 3.0, 0.16, x, y, zn - 0.45);
    // exhaust cone
    cyl(hull, GRAPH, r * 0.7, r * 0.5, 0.06, [x, y, zt - 0.05], [0, 0, 1], 8);
  };
  const pylon = (s: number, u: number, z0: number, z1: number) => {
    b.extrude([[z0, 1.98], [z1, 1.98], [z1 + 0.25, 1.56], [z0 - 0.25, 1.56]], { at: [s * u, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.09, bevel: 0.02, color: GREY, bone: hull, name: "pylon" });
    bx(hull, ORANGE, 0.1, 0.03, 0.5, s * u, 1.545, (z0 + z1) / 2);
  };
  for (const s of [1, -1]) {
    pylon(s, 2.75, -1.1, 1.0);
    missile({ s, u: 2.75, zt: -1.4, len: 3.2, r: 0.125, y: 1.43 });
    pylon(s, 4.35, -3.1, -0.9);
    missile({ s, u: 4.35, zt: -3.2, len: 2.4, r: 0.1, y: 1.5 });
  }

  // ---------------------------------------------------------------- airbrake
  const airbrake = b.joint("airbrake", { parent: hull, at: [0, 3.12, -0.1], dir: [1, 0, 0], role: "hinge" });
  b.extrude(
    [[0.05, -0.15], [0.85, -0.15], [0.9, -0.1], [0.9, 0.1], [0.85, 0.15], [0.05, 0.15], [0, 0.1], [0, -0.1]],
    { at: [0, 3.13, 1.0], x: [0, 0, -1], y: [1, 0, 0], thickness: 0.04, bevel: 0.01, color: ORANGE, bone: airbrake, name: "airbrake" },
  );

  // ---------------------------------------------------------------- extra surface detail
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    // raised wing access panels with screws
    for (const [u, z, w, d] of [[2.9, -0.55, 0.4, 0.6], [2.3, -1.9, 0.5, 0.45], [4.4, -1.6, 0.4, 0.45], [3.9, -2.55, 0.5, 0.32], [1.7, -2.4, 0.55, 0.6]] as const) {
      bx(hull, WHITE2, w, 0.012, d, s * u, WY + 0.086, z);
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) ball(hull, CHROME, 0.012, s * (u + dx * (w / 2 - 0.04)), WY + 0.094, z + dz * (d / 2 - 0.04));
    }
    // engine bay louvers and glowing heat slits on the aft flank
    for (let i = 0; i < 5; i++) bx(hull, GRAPH, 0.03, 0.26, 0.05, s * 1.425, 2.1, -3.85 - i * 0.2);
    for (let i = 0; i < 4; i++) glow(b.part(new THREE.BoxGeometry(0.03, 0.24, 0.05), HOT, { bone: hull, at: [s * 1.415, 2.1, -5.3 - i * 0.14], name: `heatSlit${side}` }), 1.2);
    // ventral fins
    const yd: P3 = [s * 0.45, -0.89, 0];
    b.extrude([[-4.2, -0.15], [-5.6, -0.15], [-5.75, 0.5], [-5.0, 0.5]], { at: [s * 0.95, 1.52, 0], x: [0, 0, 1], y: yd, thickness: 0.06, bevel: 0.02, color: ORANGE, bone: hull, name: `ventralFin${side}` });
    // chin glow bar
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 0.34), HOT, { bone: hull, at: [s * 0.4, 1.72, 6.0], rotation: [8, s * 6, 0], name: `chinGlow${side}` }), 1.2);
  }
  // arrestor hook
  const hook = b.joint("tailHook", { parent: hull, at: [0, 1.38, -5.2], aim: [0, 1.0, -5.9], role: "hinge" });
  b.rod([0, 1.38, -5.2], [0, 1.05, -6.35], 0.04, { bone: hook, color: STEEL, sides: 6, name: "tailHookArm" });
  b.rod([0, 1.05, -6.35], [0, 1.0, -6.5], 0.045, { bone: hook, color: ORANGE, sides: 6, name: "tailHookTip" });
  bx(hull, GRAPH, 0.18, 0.08, 0.3, 0, 1.4, -5.2);

  // boarding ladder on the right cheek, ahead of the canard
  const ladderZ = [4.92, 5.28];
  for (const z of ladderZ) b.rod([-0.52, 2.42, z], [-1.55, 0.03, z], 0.022, { bone: hull, color: STEEL_L, sides: 6, name: "ladderRail" });
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.109;
    cyl(hull, CHROME, 0.014, 0.014, ladderZ[1] - ladderZ[0], [-0.52 - t * 1.03, 2.42 - t * 2.39, ladderZ[0]], [0, 0, 1], 5);
  }
  bx(hull, ORANGE, 0.1, 0.06, 0.44, -0.55, 2.43, 5.1);

  // wheel chocks (ground crew detail)
  const chock = (x: number, zWheel: number, r: number, dir: number, name: string) => {
    const z0 = zWheel + dir * (r - 0.03);
    b.extrude([[z0, 0], [z0 + dir * 0.4, 0], [z0, 0.17]], { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.13, bevel: 0.015, color: ORANGE, bone: hull, name });
  };
  for (const s of [1, -1]) {
    chock(s * 1.55, -1.3, 0.42, 1, "chockMainF");
    chock(s * 1.55, -1.3, 0.42, -1, "chockMainR");
    chock(s * 0.2, 4.884, 0.37, 1, "chockNoseF");
    chock(s * 0.2, 4.884, 0.37, -1, "chockNoseR");
  }
  // remove-before-flight tags on the missile seekers
  for (const [x, y, z] of [[2.75, 1.43, 1.9], [-2.75, 1.43, 1.9], [4.35, 1.5, -0.6], [-4.35, 1.5, -0.6]] as const)
    b.part(new THREE.BoxGeometry(0.24, 0.07, 0.006), "#ffffff", { bone: hull, at: [x, y - 0.17, z], texture: T.flag, name: "missileTag" });

  // flush the merged detail parts
  for (const slot of pending.values()) {
    const merged = mergeGeometries(slot.geos);
    if (!merged) throw new Error(`merge failed for ${slot.bone.name} ${slot.color}`);
    b.part(merged, slot.color, { bone: slot.bone, at: [0, 0, 0], name: `detail.${slot.bone.name}.${slot.color.slice(1)}` });
  }

  return b.root;
}

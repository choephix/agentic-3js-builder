```ts
import * as THREE from "three";
import { createBuilder, paint, noise, countershade, svg, rng, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Night Warden APC-77",
  description:
    "A 2077 six-wheel militarized cyberpunk truck: armoured raked cab, cargo module with roof railgun turret, missile pods, neon underglow, sensor mast and thrusters.",
};

type V = [number, number, number];

const TYRE = "#16181b", RIM = "#59606b", STEEL = "#7a828c", DARK = "#101214", GUN = "#262b33";
const CYAN = "#2bf0ff", MAG = "#ff2bd6", AMBER = "#ff8a1f", RED = "#ff2a3a", GLASS = "#12384a";

const BODY = countershade("#3d4756", "#1c222a", { level: -0.1 });
const HULLBASE = panelled(BODY, { size: 0.5, aspect: 0.8, rivets: 0.1 });
const HULL = paint((p, n) => (noise(p, 0.05, 5) > 0.74 && noise(p, 0.02, 9) > 0.45 ? "#9099a6" : HULLBASE));
const HAZARD = paint((p) => ((Math.floor((p.x + p.y) / 0.14) & 1) === 0 ? "#e9c32a" : "#15161a"));
const PLATE = panelled("#2a313b", { size: 0.35, rivets: 0.07 });

const FONT = 'font-family="Arial Black, Arial, sans-serif" font-weight="900"';
const UNIT = svg(
  `<svg viewBox="0 0 128 72"><rect x="4" y="4" width="120" height="64" rx="6" fill="none" stroke="#f2f2f2" stroke-width="5"/><text x="64" y="55" ${FONT} font-size="46" fill="#f2f2f2" text-anchor="middle">K-77</text></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,6 92,88 4,88" fill="#f2c20a" stroke="#111" stroke-width="5"/><polygon points="52,26 36,54 48,54 42,76 62,44 50,44 56,26" fill="#111"/></svg>`,
  { size: 192 },
);
const BRAND = svg(
  `<svg viewBox="0 0 96 96"><polygon points="48,4 88,26 88,70 48,92 8,70 8,26" fill="#15161a" stroke="#2bf0ff" stroke-width="4"/><polyline points="22,60 48,30 74,60" fill="none" stroke="#ff2bd6" stroke-width="9"/><polyline points="32,74 48,54 64,74" fill="none" stroke="#2bf0ff" stroke-width="7"/></svg>`,
  { size: 192 },
);
const HUD = svg(
  `<svg viewBox="0 0 160 100"><rect width="160" height="100" fill="#06131a"/><g stroke="#0f4b5a">${[20, 40, 60, 80, 100, 120, 140].map((x) => `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`).join("")}${[20, 40, 60, 80].map((y) => `<line x1="0" y1="${y}" x2="160" y2="${y}"/>`).join("")}</g><circle cx="80" cy="50" r="22" fill="none" stroke="#2bf0ff" stroke-width="2"/><circle cx="80" cy="50" r="4" fill="#2bf0ff"/><line x1="52" y1="50" x2="108" y2="50" stroke="#2bf0ff" stroke-width="2"/><rect x="8" y="78" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="78" width="44" height="6" fill="#2bf0ff"/><rect x="8" y="88" width="60" height="6" fill="#0f4b5a"/><rect x="8" y="88" width="22" height="6" fill="#ff2bd6"/><text x="152" y="18" font-family="monospace" font-size="12" fill="#2bf0ff" text-anchor="end">SYS OK</text></svg>`,
  { size: 320 },
);
const PLATETEX = svg(
  `<svg viewBox="0 0 120 40"><rect width="120" height="40" rx="4" fill="#e9e4c8"/><rect x="3" y="3" width="114" height="34" rx="3" fill="none" stroke="#222" stroke-width="2"/><text x="60" y="30" ${FONT} font-size="24" fill="#222" text-anchor="middle">NW-2077</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "nightwarden" });
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const C = chassis;

  const bx = (w: number, h: number, d: number, col: any, at: V, bone: any = C, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const cy = (r: number, h: number, seg: number, col: any, at: V, rot?: V, bone: any = C, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), col, { bone, at, flat: true, ...(rot ? { rotation: rot } : {}) });
  const rod = (a: V, c: V, r: number, col: any, bone: any = C, sides = 6) => b.rod(a, c, r, col, { bone, sides });
  const decal = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, bone: any = C, gl = 0) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, up: [0, 1, 0], axis: "z", texture: tex });
    return gl ? glow(p, gl) : p;
  };

  // ---------------- frame and running gear
  for (const s of [1, -1]) bx(0.14, 0.2, 6.6, DARK, [s * 0.5, 0.62, 0]);
  for (const z of [-2.8, -1.4, 0, 1.4, 2.8]) bx(1.1, 0.1, 0.1, DARK, [0, 0.6, z]);
  rod([0, 0.52, 2.0], [0, 0.52, -2.0], 0.04, STEEL, C, 8);

  const WX = 1.28;
  const axles: [string, number][] = [["F", 2.1], ["M", 0.1], ["R", -2.1]];
  for (const [k, z] of axles) {
    rod([-WX, 0.5, z], [WX, 0.5, z], 0.07, DARK, C, 8);
    b.part(new THREE.SphereGeometry(0.2, 8, 6), STEEL, { bone: C, at: [0, 0.5, z], flat: true });
    for (const s of [1, -1]) {
      for (const dz of [-0.14, 0.14]) bx(0.08, 0.03, 1.1, STEEL, [s * 0.7, 0.72 + (dz > 0 ? 0 : 0.03), z + dz * 0.3]);
      rod([s * 0.6, 0.52, z + 0.25], [s * 0.6, 0.85, z + 0.3], 0.03, "#8a909a", C, 6);
    }
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const hub: V = [s * WX, 0.5, z];
      let parent: any = chassis;
      if (k === "F") parent = b.joint(`steer${k}${side}`, { parent: chassis, at: hub, dir: [0, 1, 0], role: "hinge" });
      const spin = b.joint(`wheel${k}${side}`, { parent, at: hub, dir: [1, 0, 0], role: "hinge" });
      const x = s * WX;
      cy(0.44, 0.44, 16, TYRE, [x, 0.5, z], [0, 0, 90], spin);
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        bx(0.44, 0.1, 0.15, TYRE, [x + (i % 2 ? 0.05 : -0.05) * 0, 0.5 + 0.46 * Math.cos(a), z + 0.46 * Math.sin(a)], spin, [(a * 180) / Math.PI, 0, 0]);
      }
      cy(0.3, 0.46, 10, RIM, [x, 0.5, z], [0, 0, 90], spin);
      cy(0.31, 0.05, 12, STEEL, [x + s * 0.24, 0.5, z], [0, 0, 90], spin);
      cy(0.1, 0.1, 8, DARK, [x + s * 0.27, 0.5, z], [0, 0, 90], spin);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cy(0.016, 0.04, 6, DARK, [x + s * 0.27, 0.5 + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], [0, 0, 90], spin);
      }
      glow(b.part(new THREE.TorusGeometry(0.26, 0.015, 5, 16), CYAN, { bone: spin, at: [x + s * 0.285, 0.5, z], rotation: [0, 90, 0] }), 1.6);
      // arch and flare
      b.part(new THREE.TorusGeometry(0.62, 0.05, 5, 10, Math.PI), HULL, { bone: C, at: [x + s * 0.1, 0.5, z], rotation: [0, 90, 0] });
      bx(0.5, 0.06, 1.3, HULL, [x, 1.14, z]);
      bx(0.04, 0.3, 0.42, DARK, [x, 0.3, z - 0.72]); // mud flap
      bx(0.05, 0.03, 0.42, HAZARD, [x, 0.46, z - 0.72]);
    }
  }

  // ---------------- hull
  b.loft(
    [
      { at: [0, 1.05, -3.1], w: 2.0, h: 0.8 },
      { at: [0, 1.05, -1.5], w: 2.2, h: 0.8 },
      { at: [0, 1.05, 1.5], w: 2.2, h: 0.8 },
      { at: [0, 0.98, 3.0], w: 1.9, h: 0.62 },
      { at: [0, 0.95, 3.2], w: 1.7, h: 0.55 },
    ],
    { bone: C, color: HULL },
  );
  for (const s of [1, -1]) {
    for (const z of [1.1, -1.0]) {
      bx(0.06, 0.55, 0.9, PLATE, [s * 1.13, 0.95, z]);
      for (const dz of [-0.3, 0.3]) for (const dy of [-0.18, 0.18]) cy(0.02, 0.03, 6, STEEL, [s * 1.17, 0.95 + dy, z + dz], [0, 0, 90]);
      bx(0.07, 0.08, 0.9, HAZARD, [s * 1.13, 0.64, z]);
      cy(0.22, 1.0, 10, GUN, [s * 0.82, 0.5, z], [90, 0, 0]);
      for (const dz of [-0.3, 0.3]) b.part(new THREE.TorusGeometry(0.23, 0.02, 5, 10), STEEL, { bone: C, at: [s * 0.82, 0.5, z + dz] });
    }
    glow(rod([s * 1.115, 1.22, -2.95], [s * 1.115, 1.22, -0.35], 0.025, MAG, C), 1.5);
    glow(rod([s * 1.115, 1.22, 0.3], [s * 1.115, 1.22, 2.6], 0.025, CYAN, C), 1.5);
    glow(rod([s * 0.9, 0.62, -3.0], [s * 0.9, 0.62, 3.2], 0.025, MAG, C), 1.6);
  }
  glow(rod([-0.7, 0.62, 3.1], [0.7, 0.62, 3.1], 0.025, CYAN, C), 1.6);
  glow(rod([-0.7, 0.62, -3.05], [0.7, 0.62, -3.05], 0.025, CYAN, C), 1.6);

  // ---------------- cab
  b.extrude(
    [
      [-0.1, 1.4], [2.6, 1.4], [2.6, 1.85], [1.9, 2.6], [0.2, 2.65], [-0.1, 2.3],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, bevel: 0.05, bone: C, color: HULL },
  );
  const ws = b.part(new THREE.BoxGeometry(1.7, 1.0, 0.04), GLASS, { bone: C, at: [0, 2.25, 2.27], rotation: [-43, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(1.7, 0.04, 0.05), CYAN, { bone: C, at: [0, 2.58, 1.95], rotation: [-43, 0, 0] }), 1.4);
  void ws;
  bx(2.0, 0.08, 1.6, PLATE, [0, 2.68, 1.0]);
  for (const x of [-0.6, 0, 0.6]) bx(0.05, 0.05, 1.5, STEEL, [x, 2.74, 1.0]);
  bx(2.0, 0.18, 0.6, HULL, [0, 1.58, 2.9], C, [6, 0, 0]); // hood
  for (let i = 0; i < 5; i++) bx(1.0, 0.02, 0.05, DARK, [0, 1.7, 2.65 + i * 0.1], C, [6, 0, 0]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const door = b.joint(`door${side}`, { parent: chassis, at: [s * 1.03, 1.45, 1.85], dir: [0, 1, 0], role: "hinge" });
    bx(0.07, 0.56, 1.45, HULL, [s * 1.03, 1.68, 1.1], door);
    bx(0.05, 0.42, 1.1, GLASS, [s * 1.03, 2.2, 1.0], door);
    for (const dz of [-0.55, 0.55]) bx(0.07, 0.5, 0.06, STEEL, [s * 1.03, 2.2, 1.0 + dz], door);
    bx(0.04, 0.04, 0.16, STEEL, [s * 1.08, 1.85, 0.5], door);
    decal(BRAND, 0.36, 0.36, [s * 1.075, 1.68, 1.15], [s, 0, 0], door);
    cy(0.04, 0.1, 6, STEEL, [s * 1.03, 1.55, 1.85], undefined, door);
    // side mirror camera boom
    rod([s * 1.0, 2.2, 2.0], [s * 1.35, 2.15, 2.15], 0.025, STEEL, door);
    b.part(new THREE.BoxGeometry(0.06, 0.24, 0.18), DARK, { bone: door, at: [s * 1.38, 2.15, 2.15] });
    glow(bx(0.02, 0.18, 0.12, CYAN, [s * 1.4, 2.15, 2.15], door), 1.2);
    // headlights
    glow(bx(0.45, 0.08, 0.03, CYAN, [s * 0.75, 1.0, 3.22]), 1.6);
    bx(0.5, 0.03, 0.08, STEEL, [s * 0.75, 1.07, 3.2]);
    // ERA bricks on hood
    for (let i = 0; i < 3; i++) bx(0.26, 0.07, 0.2, PLATE, [s * (0.35 + i * 0.28), 1.7, 3.0]);
    // exhaust stack
    rod([s * 1.1, 1.4, -0.27], [s * 1.1, 2.95, -0.27], 0.07, STEEL, C, 8);
    cy(0.1, 0.9, 8, RIM, [s * 1.1, 1.9, -0.27]);
    bx(0.2, 0.03, 0.24, DARK, [s * 1.1, 3.0, -0.27], C, [-18, 0, 0]);
    glow(cy(0.07, 0.04, 8, AMBER, [s * 1.1, 2.98, -0.27]), 1.2);
  }
  // roof lightbar and sensors
  bx(1.5, 0.1, 0.14, DARK, [0, 2.78, 1.85]);
  for (const x of [-0.55, -0.18, 0.18, 0.55]) {
    cy(0.06, 0.08, 8, STEEL, [x, 2.8, 1.93], [90, 0, 0]);
    glow(cy(0.05, 0.02, 8, CYAN, [x, 2.8, 1.98], [90, 0, 0]), 1.6);
  }
  b.part(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: C, at: [0.6, 2.72, 0.6], flat: true });
  cy(0.24, 0.05, 10, STEEL, [0.6, 2.72, 0.6]);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), MAG, { bone: C, at: [0.6, 2.8, 0.6] }), 1.6);
  for (const [x, h] of [[-0.8, 1.7], [-0.6, 1.2]] as [number, number][]) {
    cy(0.05, 0.05, 8, DARK, [x, 2.74, 0.3]);
    b.spike([x, 2.76, 0.3], [0.1, 1, -0.1], h, 0.014, { bone: C, sides: 5, color: STEEL });
  }

  // ---------------- front bumper
  bx(2.7, 0.42, 0.3, HAZARD, [0, 0.72, 3.4]);
  bx(2.4, 0.2, 0.18, PLATE, [0, 0.95, 3.32]);
  for (let i = 0; i < 7; i++) b.spike([-1.2 + i * 0.4, 0.5, 3.5], [0, -0.3, 1], 0.28, 0.05, { bone: C, sides: 5, color: STEEL });
  cy(0.12, 0.7, 10, DARK, [0, 0.74, 3.6], [0, 0, 90]);
  for (const s of [1, -1]) {
    bx(0.3, 0.46, 0.34, DARK, [s * 1.35, 0.72, 3.38]);
    glow(bx(0.2, 0.05, 0.02, AMBER, [s * 1.35, 0.8, 3.56]), 1.6);
  }
  bx(1.3, 0.34, 0.05, DARK, [0, 1.0, 3.2]);
  for (let i = 0; i < 4; i++) glow(bx(1.2, 0.02, 0.02, MAG, [0, 0.9 + i * 0.07, 3.24]), 1.3);

  // ---------------- cargo module
  b.extrude(
    [[-3.1, 1.4], [-0.4, 1.4], [-0.4, 2.45], [-0.9, 2.6], [-2.7, 2.6], [-3.1, 2.2]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bevel: 0.05, bone: C, color: HULL },
  );
  for (const s of [1, -1]) {
    for (const z of [-0.95, -1.95]) {
      bx(0.04, 0.7, 0.8, PLATE, [s * 1.11, 2.0, z]);
      for (let i = 0; i < 5; i++) bx(0.03, 0.025, 0.55, DARK, [s * 1.14, 1.8 + i * 0.09, z]);
    }
    decal(UNIT, 0.7, 0.4, [s * 1.125, 2.05, -2.7], [s, 0, 0]);
    glow(rod([s * 1.12, 2.55, -2.9], [s * 1.12, 2.55, -0.5], 0.02, MAG, C), 1.5);
    // missile pod
    bx(0.5, 0.45, 0.95, GUN, [s * 0.85, 2.82, -2.3], C, [-6, 0, 0]);
    for (const dx of [-0.11, 0.11]) for (const dy of [-0.1, 0.1]) {
      cy(0.085, 0.05, 8, DARK, [s * 0.85 + dx, 2.82 + dy - 0.05, -1.82], [90, 0, 0]);
      b.spike([s * 0.85 + dx, 2.82 + dy - 0.05, -1.86], [0, 0, 1], 0.12, 0.055, { bone: C, sides: 6, color: RED });
    }
    // thrusters
    b.lathe([[0, 0], [0.2, 0], [0.16, 0.12], [0.32, 0.5], [0.28, 0.5], [0.13, 0.14], [0, 0.16]], { at: [s * 0.6, 1.75, -3.1], axis: [0, 0, -1], segments: 10, bone: C, color: STEEL });
    glow(cy(0.12, 0.03, 10, CYAN, [s * 0.6, 1.75, -3.2], [90, 0, 0]), 1.8);
    glow(bx(0.3, 0.07, 0.03, RED, [s * 0.95, 2.2, -3.1]), 1.5);
    glow(bx(0.3, 0.07, 0.03, RED, [s * 0.95, 1.6, -3.1]), 1.5);
  }
  bx(1.3, 0.8, 0.06, PLATE, [0, 2.1, -3.0], C, [18, 0, 0]);
  decal(HUD, 0.6, 0.38, [0, 2.2, -3.07], [0, 0.3, -1], C, 1.4);
  decal(WARN, 0.25, 0.25, [0.5, 1.8, -3.13], [0, 0, -1]);
  decal(PLATETEX, 0.4, 0.13, [-0.3, 1.62, -3.14], [0, 0, -1]);
  // greeble on roof
  const r = rng(7);
  for (let i = 0; i < 14; i++) {
    const x = (r() - 0.5) * 1.7, z = -2.6 + r() * 1.8;
    if (Math.abs(x) < 0.6 && z > -2.0 && z < -1.0) continue;
    if (i % 3) bx(0.1 + r() * 0.15, 0.04 + r() * 0.05, 0.1 + r() * 0.15, i % 2 ? DARK : STEEL, [x, 2.62, z]);
    else cy(0.04 + r() * 0.04, 0.08, 8, DARK, [x, 2.64, z]);
  }
  // dish
  rod([-0.85, 2.6, -2.7], [-0.85, 2.9, -2.7], 0.04, STEEL, C, 6);
  b.lathe([[0, 0], [0.28, 0.1], [0.28, 0.12], [0, 0.03]], { at: [-0.85, 2.95, -2.7], axis: [0.2, 0.8, -0.5], segments: 12, bone: C, color: "#aab2bd" });
  rod([-0.85, 2.97, -2.7], [-0.8, 3.25, -2.9], 0.012, STEEL, C, 5);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { bone: C, at: [-0.8, 3.25, -2.9] }), 1.5);

  // ---------------- roof railgun turret
  const TZ = -1.5;
  b.part(new THREE.TorusGeometry(0.62, 0.04, 6, 16), STEEL, { bone: C, at: [0, 2.63, TZ], rotation: [90, 0, 0] });
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 2.62, TZ], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 3.05, TZ], dir: [0, 0, 1], role: "hinge" });
  cy(0.55, 0.3, 12, HULL, [0, 2.78, TZ], undefined, yaw);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cy(0.02, 0.03, 6, STEEL, [0.5 * Math.cos(a), 2.94, TZ + 0.5 * Math.sin(a)], undefined, yaw);
  }
  for (const s of [1, -1]) {
    bx(0.1, 0.55, 0.8, GUN, [s * 0.4, 3.1, TZ], yaw);
    bx(0.24, 0.3, 0.45, DARK, [s * 0.68, 2.98, TZ - 0.1], yaw);
    glow(bx(0.02, 0.1, 0.3, AMBER, [s * 0.81, 2.98, TZ - 0.1], yaw), 1.3);
  }
  rod([-0.45, 3.05, TZ], [0.45, 3.05, TZ], 0.04, STEEL, pitch, 8);
  bx(0.6, 0.38, 0.9, HULL, [0, 3.05, TZ + 0.1], pitch);
  bx(0.5, 0.3, 0.3, GUN, [0, 3.05, TZ - 0.6], pitch);
  for (const x of [-0.17, 0.17]) {
    rod([x, 3.08, TZ + 0.5], [x, 3.08, TZ + 2.2], 0.055, GUN, pitch, 8);
    for (let i = 0; i < 5; i++) glow(b.part(new THREE.TorusGeometry(0.1 - i * 0.008, 0.016, 5, 10), CYAN, { bone: pitch, at: [x, 3.08, TZ + 0.75 + i * 0.28] }), 1.7);
    bx(0.14, 0.14, 0.2, DARK, [x, 3.08, TZ + 2.25], pitch);
    glow(bx(0.03, 0.03, 0.02, CYAN, [x, 3.08, TZ + 2.36], pitch), 1.8);
  }
  glow(bx(0.18, 0.02, 1.4, MAG, [0, 3.2, TZ + 1.2], pitch), 1.4);

  // ---------------- cables and hoses
  const cable = catmull([[0.3, 2.62, TZ - 0.5], [0.45, 2.45, -1.0], [0.7, 2.7, -0.4], [0.6, 2.75, 0.3]]);
  b.sweep(cable, 0.025, { bone: C, sides: 5, color: DARK });
  const hose = catmull([[0.8, 0.5, 1.55], [0.7, 0.7, 1.8], [0.5, 0.75, 2.1]]);
  b.sweep(hose, 0.03, { bone: C, sides: 5, color: TYRE });

  return b.root;
}
```
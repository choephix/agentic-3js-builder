import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";
import { mottle } from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup converted to ducted hover thrusters: armoured cab, railgun roof turret, missile pod bed, neon underglow, low-poly cyberpunk.",
};

type V3 = [number, number, number];

// ------------------------------------------------------------------ palette
const MAG = "#ff2e97";
const CYAN = "#20e6ff";
const YEL = "#ffd23a";
const DARK = "#14151c";
const GLASS = "#173d52";
const RUBBER = "#1f2026";

// ------------------------------------------------------------------ textures
function hazardTex() {
  let s = `<rect width="96" height="16" fill="${YEL}"/>`;
  for (let i = -2; i < 10; i++) s += `<polygon points="${i * 12},16 ${i * 12 + 6},16 ${i * 12 + 14},0 ${i * 12 + 8},0" fill="#111"/>`;
  return svg(`<svg viewBox="0 0 96 16" xmlns="http://www.w3.org/2000/svg">${s}</svg>`, { size: 256 });
}
function skullTex() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="29" fill="#0d0d14" stroke="${MAG}" stroke-width="3.5"/>
    <path d="M32 11 C18 11 14 22 17 32 C18 36 21 37 22 40 L22 47 L42 47 L42 40 C43 37 46 36 47 32 C50 22 46 11 32 11Z" fill="#e9e9f2" stroke="#000" stroke-width="2"/>
    <polygon points="18,27 29,30 26,38 17,35" fill="#0d0d14"/>
    <polygon points="46,27 35,30 38,38 47,35" fill="#0d0d14"/>
    <polygon points="32,36 29,43 35,43" fill="#0d0d14"/>
    <path d="M26 47 V42 M32 47 V42 M38 47 V42" stroke="#0d0d14" stroke-width="2.5"/>
    <path d="M10 52 L54 52" stroke="${CYAN}" stroke-width="3"/></svg>`,
    { size: 256 },
  );
}
function unitTex() {
  return svg(
    `<svg viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="92" height="44" rx="4" fill="none" stroke="#111" stroke-width="4"/>
    <text x="48" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#111" stroke="#e8e8e8" stroke-width="1">R-07</text></svg>`,
    { size: 256 },
  );
}
function neonTex() {
  return svg(
    `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="48" fill="#06060c"/>
    <rect x="4" y="4" width="120" height="40" rx="6" fill="none" stroke="${MAG}" stroke-width="3.5"/>
    <text x="64" y="32" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="${CYAN}">NOVA//9</text>
    <path d="M14 40 H50 M78 40 H114" stroke="${MAG}" stroke-width="3"/></svg>`,
    { size: 384 },
  );
}
function radarTex() {
  return svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="#04100c"/>
    <circle cx="32" cy="32" r="26" fill="none" stroke="#2cff9a" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="13" fill="none" stroke="#2cff9a" stroke-width="2.5"/>
    <path d="M32 6 V58 M6 32 H58" stroke="#2cff9a" stroke-width="2"/>
    <path d="M32 32 L52 16" stroke="#b8ffd8" stroke-width="3"/>
    <circle cx="44" cy="40" r="3.5" fill="${MAG}"/><circle cx="22" cy="20" r="3" fill="${YEL}"/></svg>`,
    { size: 256 },
  );
}

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const r = rng(7);

  // paints
  const ARMOUR = panelled(mottle("#4d5642", "#3a4231", { size: 0.35 }), { size: 0.3, aspect: 0.8, rivets: 0.06 });
  const HULLDK = panelled(metal("iron", { tarnish: 0.6 }), { size: 0.22, rivets: 0.05 });
  const STEEL = metal("steel", { tarnish: 0.5, polish: 0.2 });
  const BLUED = metal("blued");
  const BRASS = metal("brass", { tarnish: 0.6 });

  const chassis = b.joint("chassis", { at: [0, 0.55, 0], role: "spine" });

  const part = (g: THREE.BufferGeometry, c: any, at: V3, o: any = {}) => b.part(g, c, { bone: chassis, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rr: number, h: number, s = 8) => new THREE.CylinderGeometry(rr, rr, h, s);
  const bx = (w: number, h: number, d: number, at: V3, c: any, o: any = {}) => part(box(w, h, d), c, at, o);
  const rod = (a: V3, c2: V3, rad: number, c: any, bone: any = chassis, sides = 6) =>
    b.rod(a, c2, rad, c, { bone, sides });
  const bolts = (pts: V3[], c: any = STEEL, rot: V3 = [0, 0, 90], bone: any = chassis, rr = 0.02) => {
    for (const p of pts) b.part(cyl(rr, 0.03, 6), c, { bone, at: p, rotation: rot });
  };
  const decal = (tex: THREE.Texture, w: number, h: number, at: V3, dir: V3, up: V3 = [0, 1, 0], g = false) => {
    const p = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, up, axis: "z", texture: tex });
    return g ? glow(p, 1.3) : p;
  };

  const HAZ = hazardTex();
  const SKULL = skullTex();

  // ------------------------------------------------------------ frame and floor
  bx(1.9, 0.18, 5.4, [0, 0.62, 0], HULLDK); // floor pan
  bx(1.5, 0.12, 5.0, [0, 0.48, 0], DARK); // belly plate
  for (const z of [-2, -1, 0, 1, 2]) bx(1.6, 0.05, 0.1, [0, 0.43, z], STEEL);
  for (const s of [1, -1]) {
    glow(bx(0.05, 0.03, 4.4, [s * 0.88, 0.5, 0], MAG), 1.5); // underglow strips
    bx(0.22, 0.34, 3.0, [s * 0.98, 0.72, 0], ARMOUR); // side skirt armour
    bx(0.04, 0.28, 2.8, [s * 1.09, 0.72, 0], DARK);
    for (let i = 0; i < 6; i++) bolts([[s * 1.115, 0.72, -1.2 + i * 0.5]], STEEL);
  }
  glow(bx(1.2, 0.03, 3.6, [0, 0.4, 0], CYAN), 0.8); // belly glow
  // central drive spine and power cables
  rod([0, 0.7, -2.2], [0, 0.7, 2.3], 0.07, BLUED, chassis, 8);
  rod([0.3, 0.7, -2], [0.3, 0.55, 2], 0.025, MAG, chassis, 5);

  // ------------------------------------------------------------ hover nacelles
  const fans: any[] = [];
  const fanSpecs: [number, number][] = [
    [1, 1.6],
    [-1, 1.6],
    [1, -1.6],
    [-1, -1.6],
  ];
  fanSpecs.forEach(([s, z], i) => {
    const x = s * 1.45;
    b.lathe(
      [
        [0.3, 0],
        [0.44, 0],
        [0.47, 0.1],
        [0.44, 0.46],
        [0.3, 0.46],
        [0.28, 0.2],
      ],
      { at: [x, 0.02, z], axis: [0, 1, 0], segments: 12, bone: chassis, color: ARMOUR },
    );
    part(new THREE.TorusGeometry(0.46, 0.035, 5, 14), MAG, [x, 0.05, z], { rotation: [90, 0, 0] });
    glow(b.part(new THREE.TorusGeometry(0.44, 0.03, 4, 14), MAG, { bone: chassis, at: [x, 0.05, z], rotation: [90, 0, 0] }), 2);
    part(new THREE.TorusGeometry(0.45, 0.025, 4, 14), STEEL, [x, 0.48, z], { rotation: [90, 0, 0] });
    glow(part(cyl(0.29, 0.02, 12), CYAN, [x, 0.1, z]), 1.4); // thrust plume disc
    const fan = b.joint(`fan${i}`, { parent: chassis, at: [x, 0.3, z], dir: [0, 1, 0], up: [1, 0, 0], role: "hinge" });
    fans.push(fan);
    b.part(cyl(0.07, 0.12, 8), BRASS, { bone: fan, at: [x, 0.3, z] });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      b.part(box(0.24, 0.015, 0.08), BLUED, {
        bone: fan,
        at: [x + 0.17 * Math.cos(a), 0.3, z + 0.17 * Math.sin(a)],
        rotation: [0, (-a * 180) / Math.PI, 18],
      });
    }
    for (const a of [0, 60, 120]) {
      const ra = (a * Math.PI) / 180;
      rod([x + 0.44 * Math.cos(ra), 0.46, z + 0.44 * Math.sin(ra)], [x - 0.44 * Math.cos(ra), 0.46, z - 0.44 * Math.sin(ra)], 0.012, STEEL, chassis, 4);
    }
    // pylon strut to body, with piston
    bx(0.5, 0.14, 0.3, [s * 1.12, 0.58, z], HULLDK);
    rod([s * 1.2, 0.2, z - 0.2], [s * 0.95, 0.58, z - 0.1], 0.03, STEEL);
    bolts([[x + 0.46, 0.35, z], [x - 0.46, 0.35, z], [x, 0.35, z + 0.46], [x, 0.35, z - 0.46]], YEL, [0, 0, 90], chassis, 0.025);
    // intake fins
    for (const k of [-1, 1]) bx(0.04, 0.2, 0.2, [x + k * 0.06 + s * 0.4, 0.35, z - 0.5 * k * 0], DARK);
  });

  // ------------------------------------------------------------ cab
  bx(1.9, 0.5, 1.6, [0, 1.0, 0.5], ARMOUR); // lower cab
  bx(1.86, 0.5, 1.5, [0, 1.5, 0.45], GLASS); // glasshouse
  bx(1.96, 0.1, 1.7, [0, 1.8, 0.4], ARMOUR); // roof
  bx(1.5, 0.05, 1.3, [0, 1.87, 0.4], HULLDK); // roof plate
  // pillars
  for (const s of [1, -1]) for (const z of [1.2, -0.28]) bx(0.1, 0.55, 0.1, [s * 0.93, 1.5, z], ARMOUR);
  bx(0.1, 0.55, 0.1, [0.0, 1.5, -0.3], ARMOUR);
  // raked windscreen frame + armoured wipers
  bx(1.86, 0.06, 0.06, [0, 1.76, 1.24], ARMOUR);
  bx(1.86, 0.06, 0.06, [0, 1.25, 1.2], ARMOUR);
  // armoured shutters over glass (half down) for military look
  for (const s of [1, -1]) {
    bx(0.06, 0.2, 1.3, [s * 0.95, 1.7, 0.45], ARMOUR);
    for (let i = 0; i < 4; i++) bx(0.05, 0.02, 1.1, [s * 0.985, 1.66 - i * 0.00, 0.45], DARK);
    // door plates with decals
    bx(0.07, 0.42, 0.9, [s * 0.975, 1.0, 0.5], ARMOUR);
    bx(0.075, 0.03, 0.9, [s * 0.975, 1.24, 0.5], DARK);
    bx(0.04, 0.5, 0.03, [s * 0.995, 1.0, 0.04], DARK); // door seam
    bx(0.04, 0.5, 0.03, [s * 0.995, 1.0, 0.98], DARK);
    bx(0.05, 0.05, 0.16, [s * 1.0, 1.15, 0.12], STEEL); // handle
    decal(SKULL, 0.42, 0.42, [s * 1.018, 0.98, 0.55], [s, 0, 0]);
    bolts([[s * 1.0, 0.85, 0.1], [s * 1.0, 0.85, 0.95], [s * 1.0, 1.15, 0.95]], STEEL);
    // mirror cameras
    rod([s * 0.95, 1.4, 1.05], [s * 1.15, 1.45, 1.05], 0.02, STEEL);
    b.part(new THREE.SphereGeometry(0.07, 6, 4), DARK, { bone: chassis, at: [s * 1.17, 1.45, 1.05], flat: true });
    glow(part(cyl(0.03, 0.02, 6), CYAN, [s * 1.17, 1.45, 1.11], { rotation: [90, 0, 0] }));
  }
  // interior hint
  for (const s of [1, -1]) {
    bx(0.5, 0.5, 0.15, [s * 0.4, 1.25, 0.0], DARK);
    bx(0.5, 0.1, 0.5, [s * 0.4, 1.05, 0.3], DARK);
  }
  bx(1.7, 0.18, 0.3, [0, 1.3, 1.0], DARK);
  glow(bx(0.4, 0.12, 0.02, [0.4, 1.32, 0.84], "#2cff9a"), 0.9);
  // roof: light bar, unit number, antennas, vents
  bx(1.5, 0.1, 0.16, [0, 1.98, 1.1], DARK);
  const barCols = [MAG, CYAN, MAG, CYAN];
  barCols.forEach((c, i) => {
    glow(bx(0.3, 0.07, 0.03, [-0.55 + i * 0.37, 1.98, 1.19], c), 1.8);
    bx(0.04, 0.12, 0.2, [-0.74 + i * 0.37, 1.96, 1.1], STEEL);
  });
  decal(unitTex(), 0.8, 0.4, [0, 1.9, 0.0], [0, 1, 0], [0, 0, 1]);
  for (const [x, h] of [[-0.8, 1.3], [0.8, 0.9]] as [number, number][]) {
    part(cyl(0.05, 0.05, 8), DARK, [x, 1.9, -0.15]);
    b.spike([x, 1.92, -0.15], [0, 1, 0], h, 0.014, STEEL, { bone: chassis, sides: 5 });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), MAG, { bone: chassis, at: [x, 1.92 + h, -0.15], flat: true });
  }
  glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), MAG, { bone: chassis, at: [-0.8, 3.22, -0.15], flat: true }), 2);
  // sensor dome on roof corner
  b.part(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: chassis, at: [0.7, 1.9, 0.9], flat: true });
  part(cyl(0.17, 0.04, 8), STEEL, [0.7, 1.9, 0.9]);
  // rear of cab: radar screen + conduit
  decal(radarTex(), 0.4, 0.4, [0.45, 1.5, -0.35], [0, 0, -1], [0, 1, 0], true);
  bx(0.5, 0.5, 0.04, [0.45, 1.5, -0.33], DARK);
  bx(0.7, 0.4, 0.04, [-0.4, 1.5, -0.33], HULLDK);

  // ------------------------------------------------------------ hood and nose
  b.frustumBox([0, 0.98, 1.3], [0, 0.93, 2.55], [1.9, 0.6], [1.76, 0.38], { bone: chassis, color: ARMOUR });
  bx(1.7, 0.05, 1.1, [0, 1.3, 1.9], HULLDK, { rotation: [-4, 0, 0] });
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      bx(0.34, 0.025, 0.045, [s * 0.5, 1.33 - i * 0.002, 1.55 + i * 0.12], DARK, { rotation: [-4, 0, 0] });
      glow(bx(0.28, 0.01, 0.015, [s * 0.5, 1.345, 1.55 + i * 0.12], MAG), 1.2);
    }
    // headlights: slit
    bx(0.5, 0.12, 0.1, [s * 0.58, 1.0, 2.52], DARK);
    glow(bx(0.46, 0.05, 0.03, [s * 0.58, 1.0, 2.58], CYAN), 2);
    bx(0.54, 0.03, 0.16, [s * 0.58, 1.08, 2.5], STEEL);
    // fender wedges
    bx(0.3, 0.25, 1.3, [s * 0.95, 1.0, 1.9], ARMOUR);
    bx(0.32, 0.04, 1.3, [s * 0.95, 1.14, 1.9], DARK);
  }
  // grille
  bx(0.6, 0.3, 0.06, [0, 0.95, 2.55], DARK);
  for (let i = 0; i < 6; i++) rod([-0.28, 0.83 + i * 0.05, 2.6], [0.28, 0.83 + i * 0.05, 2.6], 0.01, STEEL, chassis, 4);
  // ram bumper with teeth + hazard stripe
  bx(2.1, 0.26, 0.2, [0, 0.62, 2.65], HULLDK);
  decal(HAZ, 1.9, 0.18, [0, 0.62, 2.755], [0, 0, 1]);
  for (let i = 0; i < 7; i++) b.spike([-0.9 + i * 0.3, 0.45, 2.7], [0, -0.2, 1], 0.28, 0.045, STEEL, { bone: chassis, sides: 5 });
  for (const s of [1, -1]) {
    bx(0.22, 0.34, 0.26, [s * 1.05, 0.62, 2.62], ARMOUR);
    part(new THREE.TorusGeometry(0.06, 0.02, 5, 8, Math.PI), STEEL, [s * 0.55, 0.45, 2.75], { rotation: [0, 0, 180] });
  }
  // winch drum
  part(cyl(0.07, 0.5, 8), BRASS, [0, 0.82, 2.7], { rotation: [0, 0, 90] });

  // ------------------------------------------------------------ bed
  bx(1.95, 0.08, 2.6, [0, 0.78, -1.5], HULLDK); // bed floor
  for (let i = -3; i <= 3; i++) bx(0.07, 0.03, 2.5, [i * 0.28, 0.84, -1.5], DARK);
  for (const s of [1, -1]) {
    bx(0.08, 0.6, 2.6, [s * 0.95, 1.1, -1.5], ARMOUR);
    bx(0.14, 0.05, 2.6, [s * 0.95, 1.43, -1.5], DARK);
    for (let i = 0; i < 4; i++) bx(0.04, 0.5, 0.07, [s * 1.0, 1.1, -2.4 + i * 0.65], DARK); // ribs
    bolts(Array.from({ length: 5 }, (_, i) => [s * 1.025, 1.32, -2.6 + i * 0.6] as V3), STEEL);
  }
  bx(1.95, 0.6, 0.08, [0, 1.1, -2.78], ARMOUR); // tailgate
  bx(1.95, 0.6, 0.08, [0, 1.1, -0.2], ARMOUR); // headboard
  bx(1.5, 0.05, 0.1, [0, 1.43, -2.78], DARK);
  glow(decal(neonTex(), 1.2, 0.45, [0, 1.1, -2.835], [0, 0, -1]), 1.4);
  // rear thrusters: bells
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.16, 0],
        [0.13, 0.1],
        [0.28, 0.45],
        [0.24, 0.45],
        [0.1, 0.12],
        [0, 0.14],
      ],
      { at: [s * 0.6, 0.95, -2.85], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL },
    );
    glow(part(cyl(0.09, 0.03, 10), CYAN, [s * 0.6, 0.95, -2.99], { rotation: [90, 0, 0] }), 2);
    part(new THREE.TorusGeometry(0.22, 0.02, 5, 10), MAG, [s * 0.6, 0.95, -3.2]);
    glow(part(new THREE.TorusGeometry(0.2, 0.015, 4, 10), MAG, [s * 0.6, 0.95, -3.2]), 1.5);
  }
  // bed rear bumper
  bx(2.0, 0.2, 0.14, [0, 0.62, -2.85], HULLDK);
  decal(HAZ, 1.8, 0.14, [0, 0.62, -2.93], [0, 0, -1]);
  // missile pod on pedestal
  bx(0.7, 0.15, 0.9, [-0.4, 0.92, -1.5], DARK);
  bx(0.7, 0.5, 0.8, [-0.4, 1.25, -1.5], ARMOUR, { rotation: [-12, 0, 0] });
  for (const dx of [-0.2, 0.2])
    for (const dy of [-0.14, 0.14]) {
      part(cyl(0.1, 0.06, 8), DARK, [-0.4 + dx, 1.25 + dy + 0.07, -1.08], { rotation: [78, 0, 0] });
      b.spike([-0.4 + dx, 1.25 + dy + 0.07, -1.1], [0, 0.2, 1], 0.14, 0.07, MAG, { bone: chassis, sides: 6 });
    }
  // fuel / cell canisters on the right
  for (let i = 0; i < 3; i++) {
    part(cyl(0.16, 0.6, 8), i % 2 ? BLUED : BRASS, [0.55, 1.15, -1.0 - i * 0.5], { rotation: [0, 0, 0], flat: true });
    glow(part(cyl(0.12, 0.04, 8), CYAN, [0.55, 1.46, -1.0 - i * 0.5]), 1.2);
    part(new THREE.TorusGeometry(0.165, 0.02, 4, 8), STEEL, [0.55, 1.0, -1.0 - i * 0.5], { rotation: [90, 0, 0] });
  }
  rod([0.55, 1.46, -1.0], [0.55, 1.46, -2.0], 0.02, MAG, chassis, 5);

  // ------------------------------------------------------------ roof turret (railgun)
  const ty = 1.92;
  const tz = 0.35;
  const yaw = b.joint("yaw", { parent: chassis, at: [0, ty + 0.05, tz], dir: [0, 1, 0], up: [0, 0, 1], role: "hinge" });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, ty + 0.4, tz], dir: [0, 0, 1], role: "hinge" });
  part(new THREE.TorusGeometry(0.4, 0.035, 5, 14), STEEL, [0, ty + 0.03, tz], { rotation: [90, 0, 0] });
  b.part(cyl(0.34, 0.16, 10), ARMOUR, { bone: yaw, at: [0, ty + 0.12, tz], flat: true });
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.34, 0.4), ARMOUR, { bone: yaw, at: [s * 0.22, ty + 0.35, tz] });
    b.part(box(0.18, 0.2, 0.36), DARK, { bone: yaw, at: [s * 0.42, ty + 0.3, tz - 0.05] }); // ammo
    glow(b.part(box(0.12, 0.02, 0.02), YEL, { bone: yaw, at: [s * 0.42, ty + 0.4, tz + 0.14] }), 1);
  }
  b.rod([-0.26, ty + 0.4, tz], [0.26, ty + 0.4, tz], 0.035, STEEL, { bone: pitch, sides: 8 });
  b.part(box(0.36, 0.26, 0.5), ARMOUR, { bone: pitch, at: [0, ty + 0.4, tz - 0.1] }); // breech
  for (const s of [1, -1]) {
    b.rod([s * 0.08, ty + 0.4, tz + 0.1], [s * 0.08, ty + 0.4, tz + 1.5], 0.04, BLUED, { bone: pitch, sides: 8 });
    b.part(box(0.1, 0.1, 0.18), DARK, { bone: pitch, at: [s * 0.08, ty + 0.4, tz + 1.55] }); // muzzle brake
    for (let i = 0; i < 5; i++) {
      b.part(cyl(0.075 - i * 0.004, 0.05, 8), DARK, { bone: pitch, at: [s * 0.08, ty + 0.4, tz + 0.35 + i * 0.22], rotation: [90, 0, 0] });
      glow(b.part(new THREE.TorusGeometry(0.07 - i * 0.004, 0.012, 4, 8), CYAN, { bone: pitch, at: [s * 0.08, ty + 0.4, tz + 0.4 + i * 0.22] }), 2);
    }
  }
  // targeting sensor eye
  b.part(box(0.16, 0.16, 0.2), DARK, { bone: pitch, at: [0.24, ty + 0.58, tz + 0.1] });
  glow(b.part(cyl(0.05, 0.02, 8), MAG, { bone: pitch, at: [0.24, ty + 0.58, tz + 0.21], rotation: [90, 0, 0] }), 2);

  // ------------------------------------------------------------ scuffs / greeble rivet scatter on hood and bed
  for (let i = 0; i < 10; i++) {
    const x = (r() - 0.5) * 1.5;
    const z = 1.45 + r() * 0.9;
    part(cyl(0.015, 0.02, 5), STEEL, [x, 1.32, z]);
  }
  // hanging tow cable loops at rear
  for (const s of [1, -1]) part(new THREE.TorusGeometry(0.07, 0.015, 4, 8, Math.PI * 1.5), STEEL, [s * 0.9, 0.55, -2.95]);

  // spin joints reference to keep rig tidy
  void fans;
  return b.root;
}

import * as THREE from "three";
import { createBuilder, svg, paint, noise, mix, catmull } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a camo armoured hull, an elevated twin-rail coilgun with glowing rails and capacitor banks, and four deployed hydraulic stabiliser legs.",
};

// ---------------------------------------------------------------- palette
const OLIVE = "#5b6b3a";
const DKOL = "#3b4829";
const TAN = "#a09068";
const BLACK = "#1a1c1f";
const GUNMETAL = "#2c3238";
const TIRE = "#212326";
const HAZ = "#e0b81c";
const CYAN = "#52e8ff";
const AMBER = "#ffb040";
const RED = "#ff3b30";
const WHITE = "#e9ece6";
const STEEL = metal("steel", { tarnish: 0.35 });
const IRON = metal("iron");
const COPPER = metal("copper", { polish: 0.5, tarnish: 0.2 });

const CAMO = paint((p, n) => {
  const a = noise(p, 1.1, 3);
  const c = noise(p, 0.7, 9);
  let col = OLIVE;
  if (a > 0.58) col = DKOL;
  else if (c > 0.63) col = TAN;
  const top = Math.max(n.y, 0);
  return mix(mix(col, "#000000", 0.18 * Math.max(-n.y, 0)), "#ffffff", 0.1 * top);
});
const ARMOR = panelled(CAMO, { size: 0.6, aspect: 0.7, rivets: 0.1, seam: "#1a2014" });

// ---------------------------------------------------------------- textures
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="${HAZ}"/>
  ${Array.from({ length: 9 }, (_, i) => `<polygon points="${i * 8 - 4},16 ${i * 8},16 ${i * 8 + 8},0 ${i * 8 + 4},0" fill="#16181a"/>`).join("")}
  <rect x="1" y="1" width="62" height="14" fill="none" stroke="#16181a" stroke-width="2"/></svg>`,
  { size: 256 },
);
const VISOR = svg(
  `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe3ea"/><stop offset="0.5" stop-color="#1d4a56"/><stop offset="1" stop-color="#0c1f26"/></linearGradient></defs>
  <rect x="1" y="1" width="126" height="46" rx="5" fill="#15181a"/>
  <rect x="5" y="5" width="56" height="38" rx="3" fill="url(#g)"/><rect x="67" y="5" width="56" height="38" rx="3" fill="url(#g)"/>
  <path d="M12 38 L30 8 L38 8 L20 38Z" fill="#ffffff" opacity="0.28"/><path d="M74 38 L92 8 L98 8 L80 38Z" fill="#ffffff" opacity="0.22"/>
  </svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="47" fill="#161b18" stroke="${HAZ}" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#6a7a4a" stroke-width="2"/>
  <path d="M22 62 L78 62 M22 70 L78 70" stroke="#c98a4a" stroke-width="5" stroke-linecap="round"/>
  <path d="M56 14 L34 50 L48 50 L42 80 L68 40 L53 40Z" fill="${CYAN}" stroke="#0b2b33" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M50 4 L53 12 L47 12Z M50 96 L53 88 L47 88Z" fill="${HAZ}"/>
  </svg>`,
  { size: 256 },
);
const DANGER = svg(
  `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="64" rx="4" fill="${HAZ}" stroke="#16181a" stroke-width="4"/>
  <path d="M20 10 L38 44 L2 44Z" transform="translate(8 0)" fill="#16181a"/>
  <path d="M33 18 L26 32 L32 32 L29 40 L40 27 L34 27Z" fill="${HAZ}"/>
  <text x="80" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="17" fill="#16181a">DANGER</text>
  <text x="80" y="46" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#16181a">HIGH VOLTAGE</text>
  <text x="80" y="58" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="8" fill="#16181a">40 MJ CAPACITOR</text>
  </svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 80 30" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="30" rx="3" fill="${WHITE}" stroke="#16181a" stroke-width="3"/>
  <text x="40" y="23" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="20" fill="#16181a">RG-06</text></svg>`,
  { size: 192 },
);

// ---------------------------------------------------------------- builder & skeleton
export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const hull = b.joint("hull", { at: [0, 1.1, 0] });
  const D2R = Math.PI / 180;

  // Generic part helpers (all positions are model-space metres)
  function box(size: number[], color: any, at: any, o: any = {}) {
    const opt: any = { bone: o.bone ?? hull, at };
    if (o.rot) opt.rotation = o.rot;
    if (o.name) opt.name = o.name;
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, opt);
  }
  function cyl(r: number, len: number, color: any, at: any, dir: any, o: any = {}) {
    return b.part(new THREE.CylinderGeometry(o.r2 ?? r, r, len, o.seg ?? 10), color, {
      bone: o.bone ?? hull,
      at,
      dir,
      flat: true,
    });
  }
  function plane(w: number, h: number, tex: any, at: any, dir: any, o: any = {}) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone: o.bone ?? hull,
      at,
      dir,
      axis: "z",
      up: o.up,
      texture: tex,
    });
  }
  const X = [1, 0, 0];
  const Z = [0, 0, 1];
  const Y = [0, 1, 0];

  // ---------------------------------------------------------------- chassis
  box([2.2, 0.5, 8.6], BLACK, [0, 0.95, 0], { name: "chassis" });
  box([2.6, 0.2, 7.8], GUNMETAL, [0, 0.72, 0], { name: "belly" });
  b.rod([0, 0.55, -2.6], [0, 0.55, 3.2], 0.08, BLACK, { bone: hull });

  // ---------------------------------------------------------------- hull (side profile extrudes)
  const deckProfile: any = [
    [-4.3, 1.2],
    [1.9, 1.2],
    [1.9, 2.1],
    [1.4, 2.3],
    [-3.8, 2.3],
    [-4.3, 2.0],
  ];
  b.extrude(deckProfile, { at: [0, 0, 0], x: Z, thickness: 2.9, bevel: 0.05, color: ARMOR, bone: hull, name: "deck" });
  const cabProfile: any = [
    [1.9, 1.25],
    [4.4, 1.25],
    [4.5, 1.7],
    [3.9, 2.35],
    [3.0, 2.5],
    [1.9, 2.5],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: Z, thickness: 2.8, bevel: 0.05, color: ARMOR, bone: hull, name: "cab" });

  // Cab details
  plane(2.5, 0.85, VISOR, [0, 2.0 + 0.0, 4.18], [0, 0.678, 0.735]);
  plane(1.3, 0.5, VISOR, [1.415, 1.98, 3.2], [1, 0, 0]);
  plane(1.3, 0.5, VISOR, [-1.415, 1.98, 3.2], [-1, 0, 0]);
  box([1.3, 0.4, 0.1], BLACK, [0, 1.47, 4.5], { name: "grille" });
  for (let i = 0; i < 4; i++) box([1.1, 0.03, 0.04], IRON, [0, 1.36 + i * 0.09, 4.56]);
  box([3.1, 0.3, 0.4], GUNMETAL, [0, 1.05, 4.5], { name: "bumper" });
  plane(3.0, 0.22, HAZARD, [0, 1.05, 4.71], Z);
  for (const s of [1, -1]) {
    glow(box([0.42, 0.2, 0.1], AMBER, [s * 1.0, 1.5, 4.52]), 1.6);
    box([0.5, 0.28, 0.06], GUNMETAL, [s * 1.0, 1.5, 4.5]);
    plane(0.8, 0.8, EMBLEM, [s * 1.415, 1.55, 2.3], [s, 0, 0]);
    plane(0.55, 0.2, PLATE, [s * 1.416, 1.95 - 0.0, 2.65 + 0.0], [s, 0, 0]);
    // mirrors
    b.rod([s * 1.4, 2.2, 4.0], [s * 1.75, 2.25, 4.1], 0.025, BLACK, { bone: hull });
    box([0.08, 0.38, 0.26], GUNMETAL, [s * 1.8, 2.2, 4.12]);
    // exhaust stacks
    cyl(0.13, 1.5, IRON, [s * 1.2, 2.85, 1.55], Y, { seg: 8 });
    cyl(0.17, 0.1, GUNMETAL, [s * 1.2, 3.6, 1.55], Y, { seg: 8, r2: 0.12 });
    cyl(0.19, 0.12, STEEL, [s * 1.2, 2.2, 1.55], Y, { seg: 8 });
    // antenna whip
    b.rod([s * 1.1, 2.5, 2.2], [s * 1.2, 4.3, 2.0], 0.018, BLACK, { bone: hull });
    // side vents
    for (let i = 0; i < 5; i++) box([0.05, 0.4, 0.07], BLACK, [s * 1.46, 1.7, -3.9 + i * 0.16]);
    plane(0.9, 0.9, EMBLEM, [s * 1.46, 1.75, 0.9], [s, 0, 0]);
  }
  // roof kit
  box([1.7, 0.12, 0.28], GUNMETAL, [0, 2.56, 3.7], { name: "lightbar" });
  glow(box([0.4, 0.1, 0.24], AMBER, [0.65, 2.64, 3.7]), 1.5);
  glow(box([0.4, 0.1, 0.24], AMBER, [-0.65, 2.64, 3.7]), 1.5);
  b.part(new THREE.SphereGeometry(0.2, 8, 6), GUNMETAL, { bone: hull, at: [0, 2.62, 2.7], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), RED, { bone: hull, at: [0, 2.64, 2.88], flat: true }), 2);

  // rear
  box([3.1, 0.3, 0.4], GUNMETAL, [0, 1.0, -4.5], { name: "rearBumper" });
  plane(0.8, 0.3, PLATE, [0, 1.6, -4.33], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box([0.4, 0.22, 0.08], RED, [s * 1.1, 1.65, -4.32]), 1.4);
    cyl(0.07, 0.4, STEEL, [s * 0.5, 1.0, -4.8], Z, { seg: 6 });
  }

  // ---------------------------------------------------------------- wheels
  const WZ = [3.0, 0.3, -2.4];
  const WX = 1.75;
  const WY = 0.64;
  const tireMain = new THREE.CylinderGeometry(0.62, 0.62, 0.5, 12);
  const tireRibs = new THREE.CylinderGeometry(0.66, 0.66, 0.44, 12).rotateY(Math.PI / 12);
  WZ.forEach((z, i) => {
    cyl(0.1, 3.5, IRON, [0, WY, z], X, { seg: 8 });
    b.part(new THREE.SphereGeometry(0.26, 8, 6), IRON, { bone: hull, at: [0, WY, z], flat: true });
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const wj = b.joint(`wheel${i + 1}${side}`, { parent: hull, at: [s * WX, WY, z], dir: [s, 0, 0] });
      const at = [s * WX, WY, z];
      b.part(tireMain, TIRE, { bone: wj, at, dir: [s, 0, 0], flat: true });
      b.part(tireRibs, "#17181a", { bone: wj, at, dir: [s, 0, 0], flat: true });
      cyl(0.4, 0.52, STEEL, at, [s, 0, 0], { bone: wj, seg: 8 });
      cyl(0.22, 0.6, IRON, [s * (WX + 0.02), WY, z], [s, 0, 0], { bone: wj, seg: 8 });
      cyl(0.1, 0.66, COPPER, [s * (WX + 0.02), WY, z], [s, 0, 0], { bone: wj, seg: 6 });
      for (let k = 0; k < 6; k++) {
        const a = k * 60 * D2R;
        cyl(0.035, 0.1, BLACK, [s * (WX + 0.29), WY + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3], [s, 0, 0], {
          bone: wj,
          seg: 5,
        });
      }
      // fender
      box([0.74, 0.12, 1.7], ARMOR, [s * WX, 1.42, z], { name: "fender" });
      box([0.74, 0.12, 0.4], ARMOR, [s * WX, 1.3, z + 0.95], { rot: [-30, 0, 0] });
      box([0.74, 0.12, 0.4], ARMOR, [s * WX, 1.3, z - 0.95], { rot: [30, 0, 0] });
      box([0.06, 0.2, 1.7], DKOL, [s * (WX + 0.38), 1.35, z]);
    }
  });
  for (const s of [1, -1]) {
    box([0.7, 0.5, 0.05], BLACK, [s * WX, 0.55, -3.35]);
    // stowage on rear fenders
    box([0.55, 0.34, 1.15], DKOL, [s * (WX + 0.05), 1.68, -2.4], { name: "stowage" });
    box([0.5, 0.05, 1.05], TAN, [s * (WX + 0.05), 1.87, -2.4]);
    box([0.32, 0.3, 0.5], TAN, [s * (WX + 0.05), 1.68, 0.4]);
  }

  // ---------------------------------------------------------------- stabiliser legs
  const legSpots: [string, number][] = [
    ["F", 1.65],
    ["R", -3.95],
  ];
  for (const [tag, z] of legSpots) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const lj = b.joint(`stab${tag}${side}`, { parent: hull, at: [s * 1.45, 1.2, z], dir: [s, 0, 0] });
      const o = { bone: lj };
      box([0.8, 0.55, 0.75], GUNMETAL, [s * 1.7, 1.2, z], o);
      box([1.6, 0.38, 0.5], GUNMETAL, [s * 2.25, 1.2, z], { bone: lj, name: "outrigger" });
      plane(1.5, 0.4, HAZARD, [s * 2.25, 1.401, z], Y, { bone: lj, up: [0, 0, 1] });
      cyl(0.19, 0.9, STEEL, [s * 2.9, 0.95, z], Y, { bone: lj, seg: 8 });
      cyl(0.23, 0.12, HAZ, [s * 2.9, 1.36, z], Y, { bone: lj, seg: 8 });
      cyl(0.11, 0.55, metal("steel", { polish: 0.9 }), [s * 2.9, 0.38, z], Y, { bone: lj, seg: 8 });
      cyl(0.3, 0.12, IRON, [s * 2.9, 0.22, z], Y, { bone: lj, seg: 8 });
      cyl(0.55, 0.18, GUNMETAL, [s * 2.9, 0.09, z], Y, { bone: lj, seg: 8 });
      for (let k = 0; k < 4; k++) {
        const a = (k * 90 + 45) * D2R;
        box([0.12, 0.05, 0.12], HAZ, [s * 2.9 + Math.cos(a) * 0.4, 0.185, z + Math.sin(a) * 0.4], { bone: lj });
      }
      b.rod([s * 1.7, 0.95, z], [s * 2.85, 0.6, z], 0.075, IRON, { bone: lj });
      b.rod([s * 1.7, 0.95, z + 0.18], [s * 2.85, 0.6, z + 0.18], 0.04, BLACK, { bone: lj });
    }
  }

  // ---------------------------------------------------------------- turret & railgun
  const turretJ = b.joint("turret", { parent: hull, at: [0, 2.45, -1.5], role: "hinge" });
  const to = { bone: turretJ };
  cyl(1.4, 0.3, IRON, [0, 2.45, -1.5], Y, { bone: turretJ, seg: 12 });
  box([2.3, 0.8, 2.6], ARMOR, [0, 2.85, -1.5], { bone: turretJ, name: "turretBody" });
  box([2.3, 0.3, 0.5], ARMOR, [0, 2.7, -3.0], { bone: turretJ, rot: [20, 0, 0] });
  cyl(0.38, 0.12, GUNMETAL, [0.6, 3.31, -2.2], Y, { bone: turretJ, seg: 8 });
  cyl(0.1, 0.2, BLACK, [0.6, 3.4, -2.2], Y, { bone: turretJ, seg: 6 });
  box([0.5, 0.25, 0.35], GUNMETAL, [-0.6, 3.38, -2.0], to);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), CYAN, { bone: turretJ, at: [-0.6, 3.42, -1.8], flat: true }), 2);
  b.rod([-0.8, 3.25, -2.9], [-0.9, 4.3, -3.1], 0.018, BLACK, to);
  plane(1.1, 0.55, DANGER, [0, 2.9, -2.805], [0, 0, -1], to);
  for (const s of [1, -1]) {
    box([0.3, 0.95, 1.4], ARMOR, [s * 0.8, 3.7, -1.5], { bone: turretJ, name: "pillar" });
    cyl(0.17, 0.35, STEEL, [s * 0.9, 3.7, -1.5], X, { bone: turretJ, seg: 8 });
    plane(0.7, 0.7, EMBLEM, [s * 1.171, 2.85, -1.2], [s, 0, 0], to);
    // capacitor banks on the turret flanks
    for (const [cy, cr] of [
      [2.75, 0.3],
      [3.35, 0.3],
    ]) {
      cyl(cr, 2.3, metal("blued", { polish: 0.5 }), [s * 1.55, cy, -1.5], Z, { bone: turretJ, seg: 10 });
      for (const dz of [-0.8, 0, 0.8]) glow(cyl(cr + 0.02, 0.09, CYAN, [s * 1.55, cy, -1.5 + dz], Z, { bone: turretJ, seg: 10 }), 1.4);
      cyl(cr * 0.7, 0.14, IRON, [s * 1.55, cy, -2.68], Z, { bone: turretJ, seg: 8 });
    }
    box([0.5, 0.18, 1.8], GUNMETAL, [s * 1.35, 2.5, -1.5], to);
    box([0.1, 1.2, 0.2], GUNMETAL, [s * 1.55, 3.0, -0.4], to);
    box([0.1, 1.2, 0.2], GUNMETAL, [s * 1.55, 3.0, -2.55], to);
    // cables to the breech
    b.sweep(catmull([[s * 1.55, 3.0, -2.75], [s * 1.5, 2.55, -3.1], [s * 0.9, 2.55, -3.3], [s * 0.5, 2.9, -3.5]]), 0.045, {
      color: BLACK,
      bone: turretJ,
      sides: 6,
    });
  }

  // gun on its elevation joint
  const EL = 22 * D2R;
  const GD = new THREE.Vector3(0, Math.sin(EL), Math.cos(EL));
  const GU = new THREE.Vector3(0, Math.cos(EL), -Math.sin(EL));
  const PIV = new THREE.Vector3(0, 3.7, -1.5);
  const gunJ = b.joint("gun", { parent: turretJ, at: PIV, dir: GD, role: "hinge" });
  const gp = (u: number, x = 0, y = 0) => PIV.clone().addScaledVector(GD, u).addScaledVector(GU, y).add(new THREE.Vector3(x, 0, 0));
  const gbox = (size: number[], color: any, u: number, x = 0, y = 0) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: gunJ, at: gp(u, x, y), dir: GD, axis: "z", up: Y });
  const gcyl = (r: number, len: number, color: any, u: number, x = 0, y = 0, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone: gunJ, at: gp(u, x, y), dir: GD, flat: true });

  const RAIL_U = 2.1;
  const RAIL_LEN = 7.4;
  for (const s of [1, -1]) {
    gbox([0.2, 0.36, RAIL_LEN], COPPER, RAIL_U, s * 0.3, 0);
    glow(gbox([0.03, 0.22, RAIL_LEN - 0.2], CYAN, RAIL_U, s * 0.195, 0), 1.8);
    gbox([0.14, 0.7, 3.0], ARMOR, 0, s * 0.62, -0.1);
    gbox([0.1, 0.1, 6.8], GUNMETAL, RAIL_U + 0.2, s * 0.43, -0.28);
    // muzzle brackets
    gbox([0.16, 0.8, 0.3], GUNMETAL, 5.6, s * 0.46, 0);
    glow(gbox([0.06, 0.1, 0.1], CYAN, 5.95, s * 0.28, 0.0), 2);
  }
  glow(gbox([0.1, 0.03, RAIL_LEN - 0.4], CYAN, RAIL_U, 0, -0.15), 1.5);
  for (let i = 0; i < 7; i++) {
    const u = -1.0 + i * 0.95;
    gbox([0.84, 0.1, 0.26], GUNMETAL, u, 0, 0.23);
    gbox([0.84, 0.08, 0.2], GUNMETAL, u, 0, -0.23);
    gcyl(0.04, 0.9, STEEL, u, 0, 0.3, 6).rotation.z = 0;
  }
  gbox([1.1, 0.92, 1.1], ARMOR, -1.9);
  gbox([0.8, 0.6, 0.5], GUNMETAL, -2.55);
  glow(gbox([0.5, 0.08, 0.06], CYAN, -2.82, 0, 0.1), 1.6);
  gbox([1.2, 0.06, 0.9], HAZ, -1.9, 0, 0.48);
  gbox([0.9, 0.7, 0.35], GUNMETAL, 5.8, 0, 0);
  gbox([0.6, 0.1, 0.35], HAZ, 6.0, 0, 0.45);
  gbox([0.6, 0.1, 0.35], HAZ, 6.0, 0, -0.45);
  gbox([1.4, 0.12, 0.5], GUNMETAL, 5.1, 0, 0.42);
  for (const s of [1, -1]) cyl(0.17, 0.35, STEEL, gp(0, s * 0.75), X, { bone: gunJ, seg: 8 });

  // elevation ram
  b.rod([0, 2.7, -2.7], gp(-0.9, 0, -0.45), 0.1, IRON, { bone: turretJ });
  b.rod([0, 2.75, -2.62], gp(-0.9, 0, -0.45), 0.06, metal("steel", { polish: 0.9 }), { bone: gunJ });

  return b.root;
}

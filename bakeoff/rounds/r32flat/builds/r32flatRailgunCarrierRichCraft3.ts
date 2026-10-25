import * as THREE from "three";
import { createBuilder, svg, patches, paint, stripes, line } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a camo hull, a rotating turret, a coil-ringed railgun and four deployed stabiliser legs.",
};

// ---------- palette ----------
const OLIVE = "#4a5733";
const DARK = "#1d2218";
const TYRE = "#17181b";
const STEEL = "#6d737c";
const GUNMETAL = "#2b2f38";
const CYAN = "#46f0ff";
const AMBER = "#ffb02e";
const RED = "#ff3a2a";
const HAZ_Y = "#e0b41c";
const HAZ_K = "#15161a";

const CAMO = patches(OLIVE, ["#566638", "#33401f", "#6e6843"], { size: 0.8, gap: 0.05, seed: 4 });
const HULL = panelled(CAMO, { size: 0.7, aspect: 0.8, rivets: 0.14 });
const ARMOR = panelled(patches("#3f4b2b", ["#4c5a33", "#2c371c"], { size: 0.55, gap: 0.05, seed: 9 }), {
  size: 0.5,
  rivets: 0.12,
});
const IRON = metal("iron");
const BLUED = metal("blued", { tarnish: 0.1 });
const COPPER = metal("copper", { polish: 0.5 });
const STEELP = metal("steel", { tarnish: 0.3 });
const HAZARD = stripes(HAZ_Y, HAZ_K, { size: 0.12, axis: "y", width: 0.5, wobble: 0.05 });
const DIRTY = paint((p, n) => {
  const base: [number, number, number] = [0.1, 0.1, 0.11];
  return p.y < 0.4 ? [0.2, 0.17, 0.12] : n.y > 0.5 ? [0.16, 0.17, 0.19] : base;
});

// ---------- textures ----------
const WINDSHIELD = svg(
  `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe6ff"/><stop offset="1" stop-color="#14323f"/></linearGradient></defs>
  <rect width="100" height="40" rx="4" fill="#0b1015"/><rect x="2" y="2" width="96" height="36" rx="3" fill="url(#g)"/>
  <path d="M10 38 L30 2 L42 2 L22 38Z M50 38 L66 2 L72 2 L56 38Z" fill="#ffffff" opacity="0.2"/>
  <path d="M8 30 H92" stroke="#46f0ff" stroke-width="0.8" opacity="0.7"/><path d="M50 8 V14 M44 11 H56" stroke="#46f0ff" stroke-width="0.8"/>
  <rect x="49" y="0" width="2" height="40" fill="#0b1015"/></svg>`,
  { size: 256 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 60 30"><rect width="60" height="30" rx="3" fill="#0b1015"/><rect x="2" y="2" width="56" height="26" rx="2" fill="#2b6a80"/>
  <path d="M6 28 L20 2 L28 2 L14 28Z" fill="#ffffff" opacity="0.25"/></svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 80"><rect x="2" y="2" width="96" height="76" rx="6" fill="#d8d3b8" stroke="#15161a" stroke-width="3"/>
  <circle cx="30" cy="40" r="22" fill="#15161a"/><path d="M30 20 L36 36 L52 36 L39 46 L44 62 L30 52 L16 62 L21 46 L8 36 L24 36Z" fill="#e0b41c"/>
  <rect x="58" y="16" width="34" height="9" fill="#15161a"/><rect x="58" y="32" width="34" height="9" fill="#15161a"/>
  <path d="M58 52 H92 L86 66 H58Z" fill="#b3261e"/><text x="60" y="64" font-family="monospace" font-weight="bold" font-size="11" fill="#fff">RG-6</text></svg>`,
  { size: 256 },
);
const HUB = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#3a3f48" stroke="#15161a" stroke-width="2"/><circle cx="32" cy="32" r="21" fill="#59606b" stroke="#15161a" stroke-width="1.5"/>
  ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${32 + 15 * Math.cos((i * Math.PI) / 4)}" cy="${32 + 15 * Math.sin((i * Math.PI) / 4)}" r="2.4" fill="#15161a"/>`).join("")}
  <circle cx="32" cy="32" r="8" fill="#e0b41c" stroke="#15161a" stroke-width="1.5"/><circle cx="32" cy="32" r="3" fill="#15161a"/></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 100 40"><rect width="100" height="40" rx="3" fill="#d8d3b8" stroke="#15161a" stroke-width="3"/>
  <text x="50" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#15161a">RC-06 ▲</text></svg>`,
  { size: 128 },
);
const WARN = svg(
  `<svg viewBox="0 0 60 44"><rect width="60" height="44" rx="3" fill="#15161a"/><path d="M30 5 L55 39 H5Z" fill="#e0b41c" stroke="#15161a" stroke-width="2"/>
  <path d="M33 14 L25 26 H31 L27 35 L37 22 H31Z" fill="#15161a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const hull = b.joint("hull", { at: [0, 1, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 2.2, -1.0], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 3.2, -0.8], dir: [0, 0, 1], role: "hinge" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, at: number[], color: any, bone: any = hull, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (r: number, h: number, sides: number, at: number[], dir: number[], color: any, bone: any = hull) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone, at, dir });
  const decal = (w: number, h: number, at: number[], dir: number[], tex: THREE.Texture, bone: any = hull) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------- hull ----------
  b.extrude(
    [
      [-1.35, 0.6],
      [1.35, 0.6],
      [1.35, 1.5],
      [1.1, 1.9],
      [-1.1, 1.9],
      [-1.35, 1.5],
    ],
    { at: [0, 0, -0.6], x: [1, 0, 0], thickness: 7.4, color: HULL, bone: hull },
  );
  // underside skid plate
  box(2.4, 0.12, 7.0, [0, 0.58, -0.6], DIRTY);
  // roof armour lips
  for (const s of [1, -1]) box(0.14, 0.12, 7.2, [s * 1.12, 1.93, -0.6], ARMOR);
  // cab
  b.extrude(
    [
      [0, 0.6],
      [1.6, 0.6],
      [1.6, 1.5],
      [1.1, 2.2],
      [0.3, 2.4],
      [0, 2.4],
    ],
    { at: [0, 0, 3.0], x: [0, 0, 1], thickness: 2.2, color: ARMOR, bone: hull },
  );
  glow(decal(1.9, 0.8, [0, 1.862, 4.366], [0, 0.581, 0.814], WINDSHIELD), 0.45);
  for (const s of [1, -1]) {
    glow(decal(1.0, 0.5, [s * 1.103, 1.9, 3.75], [s, 0, 0], SIDEWIN), 0.3);
    // cab side armour skirts
    box(0.08, 0.5, 1.5, [s * 1.12, 1.05, 3.8], ARMOR);
    // headlights
    glow(box(0.42, 0.2, 0.06, [s * 0.8, 1.05, 4.62], AMBER), 1.6);
    box(0.5, 0.28, 0.04, [s * 0.8, 1.05, 4.6], GUNMETAL);
    // tail lights
    glow(box(0.36, 0.16, 0.06, [s * 1.0, 1.15, -4.32], RED), 1.4);
    // side emblem and fenders
    decal(1.1, 0.88, [s * 1.356, 1.05, -0.8], [s, 0, 0], EMBLEM);
    for (const z of [2.8, 0.4, -2.0]) {
      box(0.66, 0.08, 1.5, [s * 1.65, 1.34, z], ARMOR);
      box(0.06, 0.2, 1.5, [s * 1.96, 1.26, z], ARMOR);
    }
  }
  box(2.3, 0.26, 0.2, [0, 0.8, 4.7], GUNMETAL);
  box(0.9, 0.3, 0.05, [0, 1.1, 4.62], IRON);
  for (let i = 0; i < 4; i++) box(0.8, 0.03, 0.03, [0, 0.98 + i * 0.07, 4.65], STEEL);
  // roof beacon, antennas
  glow(cyl(0.12, 0.16, 8, [-0.6, 2.48, 3.15], [0, 1, 0], AMBER), 1.5);
  for (const [x, h] of [[0.8, 1.3], [0.95, 0.9]] as number[][])
    b.rod([x, 2.4, 3.1], [x - 0.03, 2.4 + h, 3.05], 0.015, { color: STEEL, bone: hull });
  b.sphere?.call;
  // rear
  decal(0.9, 0.36, [0, 1.0, -4.302], [0, 0, -1], PLATE);
  cyl(0.1, 0.25, 8, [0, 0.8, -4.4], [0, 0, 1], IRON);
  box(1.0, 0.1, 0.3, [0, 0.72, -4.45], GUNMETAL);
  // deck details
  cyl(0.3, 0.1, 8, [-0.6, 1.95, 1.5], [0, 1, 0], ARMOR);
  cyl(0.06, 0.06, 6, [-0.6, 2.02, 1.5], [0, 1, 0], STEEL);
  for (let i = 0; i < 5; i++) box(0.7, 0.04, 0.05, [0.6, 1.94, 1.3 + i * 0.1], GUNMETAL);
  for (const s of [1, -1]) {
    for (const z of [0.7, 1.6, 2.5]) b.rod([s * 1.05, 1.9, z], [s * 1.05, 2.2, z], 0.02, { color: STEEL, bone: hull });
    b.rod([s * 1.05, 2.2, 0.7], [s * 1.05, 2.2, 2.5], 0.02, { color: STEEL, bone: hull });
  }
  // turret ring
  cyl(1.1, 0.3, 14, [0, 2.05, -1.0], [0, 1, 0], GUNMETAL);

  // capacitor drums on the rear deck
  for (const z of [-3.0, -3.7]) {
    cyl(0.3, 2.1, 10, [0, 2.2, z], [1, 0, 0], STEELP);
    for (const x of [-0.55, 0.55]) cyl(0.33, 0.12, 10, [x, 2.2, z], [1, 0, 0], GUNMETAL);
    for (const s of [1, -1]) glow(cyl(0.22, 0.06, 8, [s * 1.07, 2.2, z], [1, 0, 0], CYAN), 1.6);
  }
  box(2.1, 0.12, 1.1, [0, 1.96, -3.35], GUNMETAL);
  decal(0.5, 0.36, [0, 2.2, -3.0 + 0.0], [0, 1, 0.0001], WARN);
  b.rod([0, 2.5, -3.0], [0, 2.5, -3.7], 0.035, { color: COPPER, bone: hull });

  // ---------- wheels ----------
  const wz = [2.8, 0.4, -2.0];
  const WR = 0.55;
  const wheelJoints: any[] = [];
  for (const z of wz) {
    b.rod([-1.4, 0.62, z], [1.4, 0.62, z], 0.12, { color: IRON, bone: hull });
    box(0.5, 0.24, 0.5, [0, 0.62, z], GUNMETAL);
  }
  for (const s of [1, -1]) {
    wz.forEach((z, i) => {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: hull, at: [s * 1.65, 0.62, z], dir: [s, 0, 0] });
      wheelJoints.push(w);
      cyl(WR, 0.5, 12, [s * 1.65, 0.62, z], [1, 0, 0], TYRE, w);
      cyl(0.38, 0.54, 10, [s * 1.65, 0.62, z], [1, 0, 0], STEEL, w);
      decal(0.7, 0.7, [s * 1.65 + s * 0.273, 0.62, z], [s, 0, 0], HUB, w);
      b.ring(w, { count: 12, radius: WR }, (it) =>
        b.stick(new THREE.BoxGeometry(0.2, 0.14, 0.52), TYRE, it, { embed: 0.45, flat: true }),
      );
    });
  }

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    [1.6, -3.3].forEach((z, i) => {
      const side = s > 0 ? "L" : "R";
      const leg = b.joint(`stab${side}${i + 1}`, { parent: hull, at: [s * 1.4, 1.0, z], dir: [s, -0.2, 0], role: "leg" });
      box(1.3, 0.35, 0.5, [s * 1.85, 1.0, z], GUNMETAL, leg);
      box(0.1, 0.5, 0.56, [s * 2.45, 1.0, z], HAZARD, leg);
      cyl(0.15, 0.5, 8, [s * 2.4, 0.8, z], [0, 1, 0], HAZARD, leg);
      cyl(0.09, 0.45, 8, [s * 2.4, 0.335, z], [0, 1, 0], STEEL, leg);
      cyl(0.42, 0.12, 8, [s * 2.4, 0.06, z], [0, 1, 0], IRON, leg);
      cyl(0.28, 0.05, 8, [s * 2.4, 0.14, z], [0, 1, 0], STEEL, leg);
      b.rod([s * 1.35, 1.55, z], [s * 2.4, 0.7, z], 0.05, { color: STEEL, bone: leg });
      b.rod([s * 1.35, 1.2, z + 0.2], [s * 2.4, 0.9, z + 0.2], 0.025, { color: COPPER, bone: leg });
    });
  }

  // ---------- turret ----------
  b.extrude(
    [
      [-1.2, 0],
      [1.2, 0],
      [1.2, 0.4],
      [0.9, 0.7],
      [-0.9, 0.7],
      [-1.2, 0.4],
    ],
    { at: [0, 2.2, -1.0], x: [1, 0, 0], thickness: 2.8, color: ARMOR, bone: turret },
  );
  for (const s of [1, -1]) {
    // cradle plates
    box(0.22, 0.8, 1.5, [s * 0.7, 3.2, -0.8], GUNMETAL, turret);
    cyl(0.14, 0.34, 8, [s * 0.84, 3.2, -0.8], [1, 0, 0], STEEL, turret);
    // smoke launchers
    for (let k = 0; k < 3; k++)
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 6), IRON, {
        bone: turret,
        at: [s * 1.25, 2.6, -1.7 + k * 0.17],
        dir: [s * 0.4, 0.6, 0.7],
      });
    decal(0.5, 0.36, [s * 1.205, 2.4, -0.2], [s, 0, 0], WARN, turret);
    box(0.08, 0.35, 1.4, [s * 1.24, 2.45, -1.0], GUNMETAL, turret);
  }
  // sensor head
  box(0.4, 0.3, 0.4, [-0.8, 3.0, -1.6], GUNMETAL, turret);
  cyl(0.1, 0.16, 8, [-0.8, 3.0, -1.35], [0, 0, 1], IRON, turret);
  glow(cyl(0.06, 0.04, 8, [-0.8, 3.0, -1.27], [0, 0, 1], RED, turret), 1.5);
  b.rod([0.8, 2.9, -1.8], [0.8, 3.8, -1.9], 0.015, { color: STEEL, bone: turret });
  box(0.9, 0.14, 1.0, [0, 2.93, -1.7], GUNMETAL, turret);

  // ---------- railgun ----------
  for (const s of [1, -1]) {
    box(0.2, 0.36, 9.6, [s * 0.27, 3.2, 2.8], COPPER, gun);
    box(0.12, 0.06, 9.4, [s * 0.27, 3.4, 2.8], STEELP, gun);
    b.rod([s * 0.6, 2.95, -1.4], [s * 0.6, 2.95, 0.9], 0.06, { color: STEEL, bone: gun });
    cyl(0.1, 1.2, 8, [s * 0.6, 2.95, -1.0], [0, 0, 1], GUNMETAL, gun);
  }
  glow(box(0.3, 0.1, 9.2, [0, 3.2, 2.8], CYAN, gun), 1.5);
  for (let i = 0; i < 10; i++) {
    const z = -0.6 + i * 0.8;
    box(0.95, 0.66, 0.16, [0, 3.2, z], BLUED, gun);
    box(0.99, 0.2, 0.2, [0, 3.2, z], GUNMETAL, gun);
    for (const s of [1, -1]) glow(box(0.04, 0.3, 0.1, [s * 0.49, 3.2, z], CYAN, gun), 1.6);
    glow(box(0.4, 0.04, 0.1, [0, 3.54, z], CYAN, gun), 1.2);
  }
  box(1.0, 0.85, 1.3, [0, 3.2, -1.7], IRON, gun);
  box(0.7, 0.6, 0.3, [0, 3.2, -2.45], GUNMETAL, gun);
  glow(box(0.3, 0.06, 0.04, [0, 3.2, -2.62], AMBER, gun), 1.5);
  b.frustumBox([0, 3.2, 7.4], [0, 3.2, 8.1], [0.85, 0.7], [0.6, 0.5], { color: GUNMETAL, bone: gun });
  for (const s of [1, -1]) box(0.06, 0.4, 0.3, [s * 0.34, 3.2, 7.75], IRON, gun);
  glow(box(0.22, 0.08, 0.04, [0, 3.2, 8.12], CYAN, gun), 2);
  box(0.12, 0.12, 0.5, [0.45, 3.65, 6.8], STEEL, gun);

  b.pose(gun, { axis: [1, 0, 0], deg: -6 });

  return b.root;
}

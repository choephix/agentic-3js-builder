import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, mix, smoothstep, noise, resolve, mottle, svg } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ares KX-77 Siege Hauler",
  description:
    "Six-wheel armoured cyberpunk war truck from 2077: plated cab with HUD glass, plough bumper, rail-gun turret, missile pods, radar, neon underglow.",
};

// ---------- palette ----------
const DARK = "#14171c";
const GUN = "#2a2f38";
const STEEL = "#8d97a6";
const CYAN = "#19f3ff";
const MAG = "#ff2bd6";
const YEL = "#ffc400";
const RED = "#ff2a3a";
const ORANGE = "#ff7a18";

const camo = mottle("#38434a", "#2b343b", { size: 0.8, seed: 4 });
const HULL_BASE = paint((p, n) => {
  let c = resolve(camo, p, n);
  c = mix(c, "#5b4d38", smoothstep(1.35, 0.8, p.y) * 0.7 * (0.4 + noise(p, 0.25, 8)));
  c = mix(c, "#6b7d86", smoothstep(0.6, 1, n.y) * 0.3);
  return c;
});
const HULL = panelled(HULL_BASE, { size: 0.5, aspect: 0.8, rivets: 0.07, seam: "#0a0d12" });
const HULL2 = panelled(metal("iron", { tarnish: 0.4 }), { size: 0.35, rivets: 0.05, seam: "#05070a" });
const TURRET = panelled(mottle("#2e353c", "#232a30", { size: 0.5, seed: 9 }), { size: 0.3, rivets: 0.05, seam: "#05070a" });
const TIRE = paint((p) => {
  const c = mix("#15171b", "#2a2d33", noise(p, 0.1, 3));
  return mix(c, "#4a4234", smoothstep(0.9, 0.2, p.y) * 0.5);
});
const RIM = metal("steel", { tarnish: 0.35 });

// ---------- textures ----------
let stripesSvg = "";
for (let i = -2; i < 10; i++)
  stripesSvg += `<polygon points="${i * 8},16 ${i * 8 + 8},16 ${i * 8 + 16},0 ${i * 8 + 8},0" fill="#ffc400"/>`;
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#101114"/>${stripesSvg}<rect x="0.5" y="0.5" width="63" height="15" fill="none" stroke="#101114" stroke-width="1"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill="#10131a" stroke="#19f3ff" stroke-width="4"/>
  <polygon points="50,14 83,32 83,68 50,86 17,68 17,32" fill="none" stroke="#ff2bd6" stroke-width="2"/>
  <path d="M26 62 L50 24 L74 62 L62 62 L50 42 L38 62Z" fill="#ff2bd6"/>
  <path d="M34 74 L50 50 L66 74 L58 74 L50 62 L42 74Z" fill="#ffc400"/>
  <rect x="47" y="70" width="6" height="6" fill="#ffffff" transform="rotate(45 50 73)"/>
  <text x="50" y="94" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#19f3ff">2077</text></svg>`,
  { size: 256 },
);
const HUD = svg(
  `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="100" fill="#04141f"/>
  <g stroke="#19f3ff" stroke-width="0.6" opacity="0.5">${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 20} 0V100"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<path d="M0 ${i * 20}H200"/>`).join("")}</g>
  <path d="M0 58 H200" stroke="#19f3ff" stroke-width="1.5"/>
  <path d="M0 100 L90 58 M200 100 L110 58" stroke="#19f3ff" stroke-width="1" opacity="0.7"/>
  <g stroke="#ff2a3a" stroke-width="2" fill="none"><path d="M120 30 h-10 v10 M150 30 h10 v10 M120 60 h-10 v-10 M150 60 h10 v-10"/><circle cx="135" cy="45" r="3"/></g>
  <text x="8" y="14" font-family="monospace" font-size="8" fill="#50ff9a">LOCK 0.82KM</text>
  <text x="140" y="94" font-family="monospace" font-size="8" fill="#ff2bd6">ARES//KX-77</text>
  <rect x="8" y="80" width="40" height="5" fill="#19f3ff"/><rect x="8" y="88" width="26" height="5" fill="#ff2bd6"/>
  <polygon points="60,0 80,0 40,100 20,100" fill="#ffffff" opacity="0.07"/></svg>`,
  { size: 512 },
);
const SLIT = svg(
  `<svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" rx="4" fill="#05121c" stroke="#0a0d12" stroke-width="3"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="4" y="${4 + i * 3.5}" width="92" height="1" fill="#19f3ff" opacity="0.35"/>`).join("")}
  <polygon points="10,36 40,4 52,4 22,36" fill="#ffffff" opacity="0.1"/></svg>`,
  { size: 256 },
);
const VENT = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="50" fill="#ff6a00"/>
  <rect width="100" height="50" fill="#0b0c10" opacity="0.15"/>
  ${Array.from({ length: 8 }, (_, i) => `<polygon points="0,${i * 6.5 + 2} 100,${i * 6.5 + 2} 100,${i * 6.5 + 6} 0,${i * 6.5 + 6}" fill="#0b0c10"/>`).join("")}
  <rect x="1" y="1" width="98" height="48" fill="none" stroke="#0b0c10" stroke-width="3"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="196" height="56" rx="4" fill="#0e1015" stroke="#ffc400" stroke-width="3"/>
  <polygon points="22,10 38,40 6,40" fill="#ffc400"/><rect x="21" y="19" width="2.5" height="11" fill="#0e1015"/><rect x="21" y="33" width="2.5" height="3" fill="#0e1015"/>
  <text x="48" y="30" font-family="monospace" font-weight="bold" font-size="20" fill="#19f3ff">KX-77 ARES</text>
  <text x="48" y="48" font-family="monospace" font-size="11" fill="#ff2bd6">HEAVY SIEGE HAULER 2077</text>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${140 + i * 3.6}" y="36" width="${i % 3 === 0 ? 2.6 : 1.2}" height="16" fill="#ffffff"/>`).join("")}</svg>`,
  { size: 512 },
);
const CIRCUIT = svg(
  `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="40" fill="#06101a"/>
  <g stroke="#19f3ff" stroke-width="1.6" fill="none"><path d="M0 10H40L50 20H100L110 8H160L170 20H200"/><path d="M0 30H30L40 22H80L90 32H140L150 26H200"/><path d="M60 20V6M120 8V0M130 32V40M180 20V34"/></g>
  <g fill="#ff2bd6"><circle cx="40" cy="10" r="2.5"/><circle cx="100" cy="20" r="2.5"/><circle cx="160" cy="8" r="2.5"/><circle cx="80" cy="22" r="2.5"/><circle cx="140" cy="32" r="2.5"/></g></svg>`,
  { size: 512 },
);
const REAR = svg(
  `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="60" fill="#15171c" stroke="#ffc400" stroke-width="3"/>
  <path d="M4 4 L96 56 M96 4 L4 56" stroke="#ffc400" stroke-width="5"/><rect x="28" y="22" width="44" height="16" fill="#15171c"/>
  <text x="50" y="35" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#ff2bd6">2077</text></svg>`,
  { size: 256 },
);

// ---------- helpers ----------
const b = createBuilder({ name: "truck2077" });
const chassis = b.joint("chassis", { at: [0, 1.0, 0] });

function P(geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) {
  return b.part(geo, color, { bone: chassis, flat: true, at, ...o });
}
const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
  P(new THREE.BoxGeometry(w, h, d), color, at, o);
function place(g: THREE.BufferGeometry, p: number[], r: number[] = [0, 0, 0]) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(p[0], p[1], p[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2])),
    new THREE.Vector3(1, 1, 1),
  );
  const c = g.clone();
  c.applyMatrix4(m);
  return c;
}
const merge = (geos: THREE.BufferGeometry[], color: any, bone: any, at = [0, 0, 0]) =>
  b.part(mergeGeometries(geos), color, { bone, at, flat: true });
const cylX = (r: number, len: number, seg = 10) => new THREE.CylinderGeometry(r, r, len, seg).rotateZ(Math.PI / 2);
const cylZ = (r: number, len: number, seg = 10) => new THREE.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: chassis, at, dir, axis: "z", texture: tex, ...o });
const hoodY = (z: number) => 1.92 + ((3.6 - z) / 1.1) * 0.2;

// ---------- wheels ----------
const WZ = [2.8, -1.2, -2.9];
const WX = 1.45;
const wheelJoints: any[] = [];
for (const s of [1, -1]) {
  WZ.forEach((z, i) => {
    const wj = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: chassis, at: [s * WX, 0.75, z], dir: [s, 0, 0] });
    wheelJoints.push(wj);
    const at = [s * WX, 0.75, z];
    const tireGeos: THREE.BufferGeometry[] = [cylX(0.75, 0.5, 14)];
    for (let k = 0; k < 14; k++) {
      const th = (k * Math.PI * 2) / 14;
      tireGeos.push(place(new THREE.BoxGeometry(0.52, 0.14, 0.26), [0, 0.72 * Math.cos(th), 0.72 * Math.sin(th)], [th, 0, 0]));
    }
    merge(tireGeos, TIRE, wj, at);
    P(cylX(0.5, 0.54, 10), RIM, at, { bone: wj });
    glow(P(cylX(0.2, 0.62, 8), CYAN, at, { bone: wj }), 1.2);
    const bolts: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 6; k++) {
      const th = (k * Math.PI * 2) / 6;
      bolts.push(place(cylX(0.035, 0.66, 6), [0, 0.34 * Math.cos(th), 0.34 * Math.sin(th)]));
    }
    merge(bolts, STEEL, wj, at);
    // axle
    P(cylX(0.1, 1.5, 8), DARK, [s * 0.7, 0.75, z]);
  });
}
// differentials & driveshaft
for (const z of WZ) P(new THREE.SphereGeometry(0.28, 8, 6), GUN, [0, 0.75, z], { flat: true });
P(cylZ(0.07, 7, 8), DARK, [0, 0.72, -0.3]);

// ---------- fenders & mudguards ----------
{
  const fen: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const z of WZ) {
      fen.push(place(new THREE.BoxGeometry(0.72, 0.08, 1.75), [s * 1.45, 1.64, z]));
      fen.push(place(new THREE.BoxGeometry(0.06, 0.36, 1.75), [s * 1.8, 1.47, z]));
      fen.push(place(new THREE.BoxGeometry(0.72, 0.1, 0.25), [s * 1.45, 1.58, z + 0.95], [0.5, 0, 0]));
    }
  merge(fen, HULL2, chassis);
  const flaps: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) flaps.push(place(new THREE.BoxGeometry(0.7, 0.55, 0.05), [s * 1.45, 0.85, WZ[2] - 0.85]));
  merge(flaps, DARK, chassis);
}

// ---------- cab ----------
const CAB = [
  [3.92, 0.8],
  [3.97, 1.4],
  [3.6, 1.92],
  [2.5, 2.12],
  [1.6, 3.0],
  [0.2, 3.0],
  [0.15, 0.8],
] as any;
b.extrude(CAB, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.2, bevel: 0.06, color: HULL, bone: chassis });

// ---------- bed ----------
const BED = [
  [-1.05, 0.9],
  [1.05, 0.9],
  [1.2, 1.5],
  [1.0, 2.2],
  [-1.0, 2.2],
  [-1.2, 1.5],
] as any;
const bed = b.extrude(BED, { at: [0, 0, -1.85], x: [1, 0, 0], thickness: 4.3, bevel: 0.04, color: HULL, bone: chassis });
// hull studs scattered on the bed flanks
{
  const skin = b.surface(bed);
  const hits = skin.scatter(60, {
    rng: rng(5),
    minDist: 0.4,
    filter: (h: any) => Math.abs(h.n.x) > 0.8 && h.at.y > 0.98 && h.at.y < 2.1 && Math.abs(h.at.z + 2) < 1.9,
  });
  for (const h of hits) b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), "#9aa3b2", h, { embed: 0.3 });
}
// bed deck, rails and ribs
box(1.9, 0.06, 4.0, GUN, [0, 2.22, -2.0]);
{
  const rails: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    rails.push(place(new THREE.BoxGeometry(0.1, 0.16, 4.2), [s * 0.98, 2.28, -1.9]));
    for (let k = 0; k < 6; k++) rails.push(place(new THREE.BoxGeometry(0.12, 0.3, 0.1), [s * 0.98, 2.3, -3.8 + k * 0.7]));
  }
  rails.push(place(new THREE.BoxGeometry(2.1, 0.16, 0.1), [0, 2.28, -3.98]));
  merge(rails, HULL2, chassis);
}
// neon lines on bed
for (const s of [1, -1]) {
  glow(b.rod([s * 1.03, 2.2, -3.9], [s * 1.03, 2.2, 0.2], 0.03, { color: CYAN, bone: chassis, sides: 4 }), 1.4);
  glow(b.rod([s * 1.1, 1.0, -3.9], [s * 1.1, 1.0, 0.2], 0.03, { color: MAG, bone: chassis, sides: 4 }), 1.4);
  decal(LABEL, 1.9, 0.57, [s * 1.14, 1.2, -1.4], [s, -0.25, 0]);
  glow(decal(CIRCUIT, 2.6, 0.5, [s * 1.12, 1.88, -2.0], [s, 0.286, 0]), 0.9);
  decal(EMBLEM, 0.5, 0.5, [s * 1.12, 1.35, -3.3], [s, 0.0, 0]);
}
// rear door
decal(REAR, 1.9, 1.0, [0, 1.65, -4.01], [0, 0, -1]);
box(2.2, 0.2, 0.3, DARK, [0, 0.82, -4.1]);
for (const s of [1, -1]) {
  glow(box(0.5, 0.12, 0.06, RED, [s * 0.8, 1.02, -4.03]), 1.6);
  glow(box(0.1, 0.1, 0.06, ORANGE, [s * 1.12, 1.55, -4.03]), 1.2);
}
glow(box(0.5, 0.06, 0.06, CYAN, [0, 1.02, -4.03]), 1.2);

// ---------- underbody ----------
for (const s of [1, -1]) {
  glow(b.rod([s * 1.0, 0.7, -3.5], [s * 1.0, 0.7, 3.3], 0.04, { color: MAG, bone: chassis, sides: 4 }), 1.5);
  P(cylZ(0.27, 1.4, 10), "#5b6470", [s * 1.3, 0.95, 0.65]);
  const bands: THREE.BufferGeometry[] = [];
  for (const z of [0.2, 0.65, 1.1]) bands.push(place(cylZ(0.285, 0.07, 10), [s * 1.3, 0.95, z]));
  merge(bands, YEL, chassis);
}
glow(box(1.8, 0.04, 0.06, CYAN, [0, 0.75, 3.3]), 1.2);

// ---------- door armour plates ----------
const PLATE = [
  [1.95, 0.95],
  [2.15, 1.55],
  [0.35, 1.55],
  [0.3, 0.95],
] as any;
for (const s of [1, -1]) {
  b.extrude(PLATE, { at: [s * 1.17, 0, 0], x: [0, 0, 1], thickness: 0.1, bevel: 0.015, color: HULL2, bone: chassis });
  decal(EMBLEM, 0.75, 0.75, [s * 1.225, 1.25, 1.15], [s, 0, 0]);
  decal(HAZARD, 1.5, 0.12, [s * 1.225, 1.02, 1.15], [s, 0, 0]);
  // side windows
  glow(decal(SLIT, 1.1, 0.42, [s * 1.125, 2.55, 1.15], [s, 0, 0]), 0.5);
  box(0.05, 0.05, 1.2, DARK, [s * 1.12, 2.8, 1.15]);
  box(0.05, 0.05, 1.2, DARK, [s * 1.12, 2.31, 1.15]);
  // handle
  box(0.05, 0.05, 0.25, STEEL, [s * 1.24, 1.5, 0.7]);
  // mirror
  b.rod([s * 1.12, 2.3, 2.0], [s * 1.55, 2.4, 2.05], 0.025, { color: DARK, bone: chassis, sides: 6 });
  box(0.07, 0.42, 0.26, GUN, [s * 1.58, 2.4, 2.05]);
  glow(box(0.02, 0.34, 0.2, CYAN, [s * 1.55, 2.4, 2.05 + 0.0]), 0.4);
}

// ---------- windshield, visor, hood ----------
glow(
  b.part(new THREE.PlaneGeometry(2.0, 1.2), "#ffffff", {
    bone: chassis,
    at: [0, 2.575, 2.065],
    dir: [0, 0.715, 0.699],
    axis: "z",
    texture: HUD,
  }),
  0.7,
);
box(2.3, 0.07, 0.4, GUN, [0, 3.0, 1.8], { rotation: [44, 0, 0] });
for (const s of [1, -1]) {
  b.rod([s * 1.02, 2.12, 2.5], [s * 1.02, 3.0, 1.6], 0.04, { color: DARK, bone: chassis, sides: 4 });
  glow(
    b.rod([s * 0.95, hoodY(3.5) + 0.03, 3.5], [s * 0.95, hoodY(2.6) + 0.03, 2.6], 0.022, { color: CYAN, bone: chassis, sides: 4 }),
    1.4,
  );
  box(0.5, 0.06, 0.5, GUN, [s * 0.6, 2.0, 3.35], { rotation: [-10, 0, 0] });
}
glow(
  b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", {
    bone: chassis,
    at: [0, hoodY(3.0) + 0.012, 3.0],
    dir: [0, 1, 0.18],
    axis: "z",
    up: [0, 0, -1],
    texture: VENT,
  }),
  0.8,
);
box(0.14, 0.1, 1.3, HULL2, [0, hoodY(3.0) + 0.06, 3.0], { rotation: [-10, 0, 0] });

// ---------- front: bumper, lights ----------
const BUMP = [
  [-1.4, 0.55],
  [1.4, 0.55],
  [1.6, 0.95],
  [1.3, 1.1],
  [-1.3, 1.1],
  [-1.6, 0.95],
] as any;
b.extrude(BUMP, { at: [0, 0, 4.0], x: [1, 0, 0], thickness: 0.5, bevel: 0.03, color: HULL2, bone: chassis });
decal(HAZARD, 2.6, 0.4, [0, 0.82, 4.255], [0, 0, 1]);
{
  const teeth: THREE.BufferGeometry[] = [];
  for (let i = -3; i <= 3; i++)
    teeth.push(place(new THREE.ConeGeometry(0.09, 0.35, 6).rotateX(Math.PI / 2), [i * 0.4, 0.72, 4.43]));
  merge(teeth, STEEL, chassis);
}
decal(VENT, 1.0, 0.3, [0, 1.25, 3.958], [0, 0, 1]);
for (const s of [1, -1]) {
  glow(box(0.5, 0.18, 0.06, "#e8fbff", [s * 0.82, 1.25, 3.97]), 2.2);
  box(0.56, 0.24, 0.04, DARK, [s * 0.82, 1.25, 3.955]);
  glow(box(0.28, 0.14, 0.2, ORANGE, [s * 1.3, 1.2, 4.1]), 1.4);
  box(0.06, 0.4, 0.06, STEEL, [s * 1.0, 1.35, 3.6], { rotation: [-20, 0, 0] });
}
glow(box(0.5, 0.05, 0.05, MAG, [0, 1.45, 3.96]), 1.5);
// winch
P(cylX(0.16, 1.0, 8), GUN, [0, 0.7, 4.0]);

// ---------- roof ----------
{
  const rack: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) rack.push(place(new THREE.BoxGeometry(0.05, 0.05, 1.3), [s * 1.0, 3.06, 0.9]));
  for (const z of [0.3, 0.9, 1.5]) rack.push(place(new THREE.BoxGeometry(2.05, 0.05, 0.05), [0, 3.06, z]));
  merge(rack, STEEL, chassis);
  box(2.0, 0.1, 0.28, DARK, [0, 3.1, 1.3]);
  const c: THREE.BufferGeometry[] = [];
  const m: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++) (i % 2 ? m : c).push(place(new THREE.BoxGeometry(0.22, 0.12, 0.26), [-0.84 + i * 0.24, 3.17, 1.3]));
  glow(merge(c, CYAN, chassis), 1.6);
  glow(merge(m, MAG, chassis), 1.6);
  for (const s of [1, -1]) glow(box(0.05, 0.08, 0.7, CYAN, [s * 1.0, 3.04, 0.9]), 1.3);
}
// radar
const radar = b.joint("radar", { parent: chassis, at: [-0.55, 3.05, 0.7], dir: [0, 1, 0] });
b.rod([-0.55, 3.05, 0.7], [-0.55, 3.3, 0.7], 0.05, { color: GUN, bone: radar, sides: 6 });
b.lathe(
  [
    [0, 0],
    [0.12, 0],
    [0.42, 0.18],
    [0.42, 0.21],
    [0.12, 0.04],
    [0, 0.04],
  ] as any,
  { at: [-0.55, 3.32, 0.7], axis: [0, 0.6, 0.8], segments: 12, color: HULL2, bone: radar },
);
b.rod([-0.55, 3.34, 0.72], [-0.55, 3.5, 0.9], 0.015, { color: STEEL, bone: radar, sides: 4 });
glow(P(new THREE.SphereGeometry(0.03, 6, 4), RED, [-0.55, 3.51, 0.91], { bone: radar }), 2);
// sensor dome
b.lathe(
  [
    [0, 0],
    [0.22, 0],
    [0.22, 0.05],
    [0.17, 0.16],
    [0.08, 0.22],
    [0, 0.24],
  ] as any,
  { at: [0.6, 3.0, 0.7], segments: 10, color: GUN, bone: chassis },
);
glow(box(0.2, 0.06, 0.04, RED, [0.6, 3.12, 0.88]), 2);
// antennas
for (const s of [1, -1]) {
  b.rod([s * 0.9, 3.0, 0.3], [s * 1.0, 4.7, -0.4], [0.03, 0.008], { color: DARK, bone: chassis, sides: 5 });
  glow(P(new THREE.SphereGeometry(0.045, 6, 4), RED, [s * 1.0, 4.72, -0.4]), 2);
  b.rod([s * 0.7, 3.0, 0.35], [s * 0.65, 3.9, 0.1], [0.025, 0.008], { color: GUN, bone: chassis, sides: 5 });
  glow(P(new THREE.SphereGeometry(0.035, 6, 4), CYAN, [s * 0.65, 3.92, 0.1]), 2);
}

// ---------- exhaust stacks ----------
for (const s of [1, -1]) {
  P(new THREE.CylinderGeometry(0.1, 0.12, 1.3, 8), "#4a4f58", [s * 0.95, 2.85, 0.0]);
  P(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), DARK, [s * 0.95, 3.5, 0.0]);
  glow(P(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 8), ORANGE, [s * 0.95, 3.52, 0.0]), 1.8);
  box(0.03, 0.9, 0.2, GUN, [s * 0.83, 2.8, 0.0]);
  for (const y of [2.4, 3.0]) P(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 8), STEEL, [s * 0.95, y, 0.0]);
}
// cable loom
b.sweep(
  [
    [0.5, 2.2, -0.05],
    [0.45, 2.4, -0.2],
    [0.4, 2.32, -0.45],
    [0.3, 2.28, -0.6],
  ],
  0.03,
  { color: "#0c0d10", bone: chassis },
);

// ---------- turret ----------
const T = [0, 2.2, -1.2];
const tp = (x: number, y: number, z: number) => [T[0] + x, T[1] + y, T[2] + z];
const turret = b.joint("turretYaw", { parent: chassis, at: T, dir: [0, 1, 0] });
b.lathe(
  [
    [0, 0],
    [0.95, 0],
    [1.0, 0.05],
    [1.0, 0.12],
    [0.8, 0.15],
    [0, 0.15],
  ] as any,
  { at: T, segments: 12, color: GUN, bone: turret },
);
b.extrude(
  [
    [0.85, 0.12],
    [0.95, 0.5],
    [0.5, 0.95],
    [-0.6, 0.95],
    [-0.95, 0.55],
    [-0.9, 0.12],
  ] as any,
  { at: tp(0, 0, 0), x: [0, 0, 1], thickness: 1.5, bevel: 0.05, color: TURRET, bone: turret },
);
box(1.2, 0.5, 0.3, GUN, tp(0, 0.65, 0.98), { bone: turret });
for (const s of [1, -1]) {
  decal(EMBLEM, 0.5, 0.5, tp(s * 0.76, 0.5, -0.1), [s, 0, 0], { bone: turret });
  // cheek armor
  b.extrude(
    [
      [0.95, 0.2],
      [0.6, 0.75],
      [0.1, 0.75],
      [0.1, 0.2],
    ] as any,
    { at: tp(s * 0.78, 0, 0), x: [0, 0, 1], thickness: 0.08, color: HULL2, bone: turret },
  );
  // smoke launchers
  const sm: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 4; k++) sm.push(place(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 6), tp(s * 0.9, 0.55 + k * 0.0, -0.5 + k * 0.17), [0, 0, s * -0.5]));
  merge(sm, DARK, turret);
  // ammo box
  box(0.18, 0.3, 0.5, GUN, tp(s * 0.88, 0.25, -0.55), { bone: turret });
}
// cupola and sensors
b.lathe(
  [
    [0, 0],
    [0.3, 0],
    [0.3, 0.1],
    [0.22, 0.2],
    [0, 0.22],
  ] as any,
  { at: tp(-0.35, 0.95, -0.3), segments: 10, color: TURRET, bone: turret },
);
box(0.3, 0.05, 0.3, STEEL, tp(-0.35, 1.18, -0.3), { bone: turret });
box(0.3, 0.25, 0.3, GUN, tp(0.45, 1.07, 0.1), { bone: turret });
glow(box(0.22, 0.12, 0.05, RED, tp(0.45, 1.1, 0.27), { bone: turret }), 2);
b.rod(tp(0.5, 1.2, -0.3), tp(0.6, 1.9, -0.7), [0.02, 0.008], { color: DARK, bone: turret, sides: 5 });
glow(P(new THREE.SphereGeometry(0.035, 6, 4), MAG, tp(0.6, 1.92, -0.7), { bone: turret }), 2);
// gun
const G = tp(0, 0.65, 1.0);
const gun = b.joint("gunPitch", { parent: turret, at: G, dir: [0, 0, 1] });
for (const s of [1, -1]) {
  const x = s * 0.28;
  box(0.26, 0.3, 0.7, GUN, [x, G[1], G[2] + 0.1], { bone: gun });
  b.rod([x, G[1], G[2] - 0.3], [x, G[1], G[2] + 2.5], 0.09, { color: "#1b1e24", bone: gun, sides: 8 });
  b.rod([x, G[1], G[2] + 0.2], [x, G[1], G[2] + 1.35], 0.15, { color: "#4b5360", bone: gun, sides: 8 });
  const rings: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 4; k++) rings.push(place(cylZ(0.18, 0.06, 8), [x, G[1], G[2] + 0.4 + k * 0.28]));
  glow(merge(rings, MAG, gun), 1.6);
  glow(b.rod([x, G[1] + 0.1, G[2] + 1.4], [x, G[1] + 0.1, G[2] + 2.45], 0.03, { color: CYAN, bone: gun, sides: 4 }), 1.6);
  box(0.2, 0.2, 0.25, DARK, [x, G[1], G[2] + 2.55], { bone: gun });
  glow(P(cylZ(0.06, 0.03, 8), CYAN, [x, G[1], G[2] + 2.69], { bone: gun }), 2);
}
box(0.2, 0.18, 0.35, GUN, [0, G[1] + 0.3, G[2] + 0.3], { bone: gun });
glow(box(0.1, 0.06, 0.04, RED, [0, G[1] + 0.32, G[2] + 0.49], { bone: gun }), 2);

// ---------- missile launcher ----------
const PA = -Math.atan2(0.6, 0.8);
const dirV = [0, 0.8, -0.6];
const upV = [0, 0.6, 0.8];
for (const s of [1, -1]) {
  const C = [s * 0.62, 3.0, -3.1];
  box(1.05, 1.7, 0.62, TURRET, C, { rotation: [(PA * 180) / Math.PI, 0, 0] });
  box(1.2, 0.4, 0.9, GUN, [C[0], 2.4, -2.95]);
  const rings: THREE.BufferGeometry[] = [];
  const tips: THREE.BufferGeometry[] = [];
  for (const ox of [-0.4, -0.13, 0.13, 0.4])
    for (const oz of [-0.17, 0.17]) {
      const pos = [
        C[0] + dirV[0] * 0.86 + ox + upV[0] * oz,
        C[1] + dirV[1] * 0.86 + upV[1] * oz,
        C[2] + dirV[2] * 0.86 + upV[2] * oz,
      ];
      rings.push(place(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), pos, [PA, 0, 0]));
      const p2 = [pos[0] + dirV[0] * 0.01, pos[1] + dirV[1] * 0.01, pos[2] + dirV[2] * 0.01];
      tips.push(place(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 8), p2, [PA, 0, 0]));
    }
  merge(rings, DARK, chassis);
  glow(merge(tips, RED, chassis), 1.5);
  decal(HAZARD, 0.5, 0.12, [C[0] + s * 0.531, C[1], C[2]], [s, 0, 0], { roll: 0 });
}

// ---------- finishing greebles ----------
// hood-side vents & armor bolts on cab front corners
for (const s of [1, -1]) {
  glow(box(0.04, 0.12, 0.5, CYAN, [s * 1.12, 1.9, 3.4]), 1.0);
  box(0.12, 0.5, 0.5, GUN, [s * 1.1, 1.3, 3.5]);
  box(0.4, 0.05, 0.05, STEEL, [s * 0.9, 2.1, 2.5]);
}
// tow hooks and rear cross-members
for (const s of [1, -1]) {
  box(0.1, 0.1, 0.35, STEEL, [s * 0.9, 0.62, 4.45]);
  box(0.12, 0.12, 0.3, STEEL, [s * 0.8, 0.78, -4.32]);
}

return b.root;

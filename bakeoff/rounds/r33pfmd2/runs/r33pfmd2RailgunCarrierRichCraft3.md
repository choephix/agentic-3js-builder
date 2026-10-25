```ts
import * as THREE from "three";
import { createBuilder, paint, patches, stripes, noise, smoothstep, mix, resolve, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "RG-6 Railgun Carrier",
  description:
    "Six-wheeled low-poly sci-fi military railgun carrier with a coil-ringed rail barrel, glowing capacitors and four deployed hazard-striped stabiliser legs.",
};

// ---------------------------------------------------------------- palette
const CYAN = "#5af0ff";
const AMBER = "#ffb23a";
const RED = "#ff4a3a";
const YELLOW = "#f0c020";
const BLACK = "#15171a";
const DARK = "#2a3027";
const GUNMETAL = "#3b4048";

const weather = (base: any) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const m = smoothstep(1.6, 0.9, p.y) * smoothstep(0.4, 0.7, noise(p, 0.5, 3));
    return mix(c, "#5a4631", m * 0.6);
  });

const CAMO = weather(
  panelled(patches("#4f5c35", ["#647443", "#3a4429", "#7b744b"], { size: 0.9, gap: 0.02 }), {
    size: 0.6,
    aspect: 0.8,
    rivets: 0.1,
  }),
);
const STEEL = metal("steel", { tarnish: 0.3 });
const IRON = metal("iron");
const TIRE = paint((_p, n, s) =>
  Math.abs(n.x) > 0.8 ? "#17181a" : Math.floor(s[0] * 20) % 2 === 0 ? "#202226" : "#101113",
);
const HAZ_PAINT = stripes(YELLOW, BLACK, { size: 0.2, axis: "y", width: 0.5, wobble: 0 });

// ---------------------------------------------------------------- textures
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="#1d231b" stroke="#e8d9a0" stroke-width="3"/>
  <polygon points="32,10 37,26 54,26 40,36 45,52 32,42 19,52 24,36 10,26 27,26" fill="#e8d9a0"/>
  <path d="M14 48 L32 38 L50 48" stroke="#c9553a" stroke-width="4" fill="none"/>
</svg>`,
  { size: 128 },
);
const VISOR = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f7a8c"/><stop offset="1" stop-color="#08242c"/></linearGradient></defs>
  <rect width="100" height="50" fill="url(#g)"/>
  <polygon points="10,50 30,0 42,0 22,50" fill="#ffffff" opacity="0.22"/>
  <polygon points="48,50 62,0 68,0 54,50" fill="#ffffff" opacity="0.14"/>
  <path d="M70 10 H92 M70 18 H86 M70 26 H90" stroke="#5af0ff" stroke-width="2" opacity="0.7"/>
  <rect x="1" y="1" width="98" height="48" fill="none" stroke="#101418" stroke-width="3"/>
</svg>`,
  { size: 256 },
);
let hz = "";
for (let i = -2; i < 10; i++) hz += `<polygon points="${i * 8},16 ${i * 8 + 4},16 ${i * 8 + 12},0 ${i * 8 + 8},0" fill="#15171a"/>`;
const HAZARD = svg(
  `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="#f0c020"/>${hz}</svg>`,
  { size: 256 },
);
let slats = "";
for (let i = 0; i < 6; i++) slats += `<rect x="4" y="${4 + i * 3.2}" width="56" height="1.6" fill="#4a5058"/>`;
const GRILLE = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" fill="#14161a"/>${slats}<rect x="1" y="1" width="62" height="22" fill="none" stroke="#5c636c" stroke-width="2"/></svg>`,
  { size: 192 },
);
const SERIAL = svg(
  `<svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="24" rx="3" fill="#d8d2b0" stroke="#222" stroke-width="2"/>
  <text x="32" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#222">RG-06</text></svg>`,
  { size: 192 },
);
let vl = "";
for (let i = 0; i < 7; i++) vl += `<rect x="3" y="${3 + i * 4}" width="42" height="2" fill="#5af0ff"/>`;
const VENT = svg(
  `<svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="32" fill="#10161a"/>${vl}<rect x="1" y="1" width="46" height="30" fill="none" stroke="#6a7078" stroke-width="2"/></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><polygon points="24,3 46,43 2,43" fill="#f0c020" stroke="#15171a" stroke-width="3" stroke-linejoin="round"/>
  <polygon points="27,13 17,27 23,27 20,38 31,23 25,23" fill="#15171a"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  const box = (w: number, h: number, d: number, color: any, at: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: any, dir: any = [0, 1, 0], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, dir, ...o });
  const decal = (tex: any, at: any, dir: any, w: number, h: number, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });

  // ------------------------------------------------------------ wheels
  const AXLES = [3.4, -2.2, -3.8];
  for (const z of AXLES) {
    box(3.1, 0.22, 0.4, GUNMETAL, [0, 0.8, z]);
    cyl(0.3, 0.3, 0.5, 8, IRON, [0, 0.8, z], [1, 0, 0]);
    for (const s of [1, -1]) {
      const x = s * 1.65;
      b.part(new THREE.CylinderGeometry(0.8, 0.8, 0.55, 14), TIRE, { at: [x, 0.8, z], dir: [1, 0, 0] });
      cyl(0.46, 0.46, 0.6, 10, STEEL, [x, 0.8, z], [1, 0, 0]);
      cyl(0.2, 0.2, 0.68, 8, DARK, [x, 0.8, z], [1, 0, 0]);
      for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3;
        cyl(0.04, 0.04, 0.1, 5, BLACK, [x + s * 0.33, 0.8 + 0.32 * Math.cos(a), z + 0.32 * Math.sin(a)], [1, 0, 0]);
      }
      // suspension arm
      box(0.18, 0.18, 0.5, IRON, [s * 1.35, 0.95, z]);
    }
  }
  // fenders
  for (const s of [1, -1]) {
    box(0.85, 0.1, 1.9, CAMO, [s * 1.65, 1.75, 3.4]);
    box(0.85, 0.1, 3.5, CAMO, [s * 1.65, 1.75, -3.0]);
    box(0.08, 0.28, 1.9, DARK, [s * 2.06, 1.62, 3.4]);
    box(0.08, 0.28, 3.5, DARK, [s * 2.06, 1.62, -3.0]);
    box(0.5, 0.45, 0.06, BLACK, [s * 1.65, 0.62, -4.9]); // mud flap
    box(0.5, 0.45, 0.06, BLACK, [s * 1.65, 0.62, 2.55]);
    // lockers
    box(0.4, 0.6, 1.0, CAMO, [s * 1.58, 1.35, 1.5]);
    box(0.4, 0.6, 1.0, CAMO, [s * 1.58, 1.35, -0.6]);
    box(0.06, 0.12, 0.4, YELLOW, [s * 1.8, 1.45, 1.5]);
    box(0.06, 0.12, 0.4, YELLOW, [s * 1.8, 1.45, -0.6]);
  }

  // ------------------------------------------------------------ hull
  b.extrude(
    [
      [-5.4, 0.9],
      [4.9, 0.9],
      [4.9, 1.7],
      [4.0, 1.95],
      [-5.4, 1.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.8, color: CAMO },
  );
  // belly armour plate
  box(2.6, 0.12, 9.6, IRON, [0, 0.88, -0.2]);

  // ------------------------------------------------------------ cab
  b.extrude(
    [
      [1.7, 1.85],
      [1.7, 3.1],
      [3.3, 3.1],
      [4.3, 2.4],
      [4.3, 1.85],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, color: CAMO },
  );
  box(2.0, 0.12, 1.5, DARK, [0, 3.14, 2.5]);
  decal(VISOR, [0, 2.75 + 0.02 * 0.82, 3.8 + 0.02 * 0.57], [0, 0.82, 0.57], 2.3, 1.2);
  for (const s of [1, -1]) {
    decal(VISOR, [s * 1.312, 2.65, 2.8], [s, 0, 0], 1.3, 0.65);
    decal(SERIAL, [s * 1.312, 2.15, 2.2], [s, 0, 0], 0.7, 0.26);
    // mirrors
    b.rod([s * 1.3, 2.95, 3.5], [s * 1.75, 3.0, 3.6], 0.025, STEEL);
    box(0.08, 0.4, 0.26, BLACK, [s * 1.78, 2.95, 3.6]);
  }
  glow(box(1.6, 0.1, 0.04, CYAN, [0, 2.2, 4.32]), 1.2);
  // roof gear
  cyl(0.22, 0.22, 0.2, 8, BLACK, [0.6, 3.28, 2.4]);
  b.part(new THREE.SphereGeometry(0.2, 8, 6), GUNMETAL, { at: [0.6, 3.42, 2.4] });
  for (const x of [-0.6, -0.2, 0.2, 0.6]) glow(box(0.3, 0.1, 0.16, AMBER, [x, 3.25, 1.95]), 1.3);

  // ------------------------------------------------------------ front bumper
  box(2.9, 0.55, 0.7, DARK, [0, 1.2, 5.0]);
  box(2.9, 0.1, 0.8, IRON, [0, 1.5, 5.0]);
  decal(GRILLE, [0, 1.2, 5.356], [0, 0, 1], 1.3, 0.42);
  for (const s of [1, -1]) {
    glow(box(0.45, 0.22, 0.06, "#ffeeb0", [s * 1.1, 1.2, 5.38]), 1.5);
    box(0.2, 0.2, 0.25, STEEL, [s * 0.8, 0.95, 5.4]);
  }
  cyl(0.13, 0.13, 2.2, 8, IRON, [0, 0.98, 5.3], [1, 0, 0]);

  // ------------------------------------------------------------ rear
  decal(HAZARD, [0, 1.15, -5.41], [0, 0, -1], 2.7, 0.4);
  box(0.4, 0.4, 0.5, IRON, [0, 1.5, -5.55]); // tow hitch
  for (const s of [1, -1]) glow(box(0.4, 0.2, 0.05, RED, [s * 1.1, 1.65, -5.42]), 1.2);

  // reactor housing
  box(2.2, 1.0, 1.8, CAMO, [0, 2.45, -4.2]);
  decal(VENT, [0, 2.4, -5.108], [0, 0, -1], 1.6, 0.7, {});
  for (const s of [1, -1]) decal(WARN, [s * 1.112, 2.5, -4.2], [s, 0, 0], 0.5, 0.5);
  for (const x of [-0.6, 0, 0.6]) {
    glow(cyl(0.2, 0.2, 0.55, 8, CYAN, [x, 3.2, -4.2]), 1.4);
    cyl(0.26, 0.26, 0.08, 8, BLACK, [x, 2.97, -4.2]);
    cyl(0.26, 0.26, 0.08, 8, BLACK, [x, 3.48, -4.2]);
  }
  for (const sx of [1, -1])
    for (const sz of [1, -1]) b.rod([sx * 0.85, 2.95, -4.2 + sz * 0.6], [sx * 0.85, 3.5, -4.2 + sz * 0.6], 0.03, STEEL);
  b.sweep(
    [
      [0.5, 2.9, -3.3],
      [0.9, 2.6, -3.1],
      [1.05, 2.3, -2.6],
    ],
    0.05,
    { color: BLACK },
  );
  b.sweep(
    [
      [-0.5, 2.9, -3.3],
      [-0.9, 2.6, -3.1],
      [-1.05, 2.3, -2.6],
    ],
    0.05,
    { color: BLACK },
  );
  // antennas
  for (const [x, h] of [[-1.15, 4.9], [1.15, 4.2]] as const) {
    b.rod([x, 2.95, -3.2], [x, h, -3.2], 0.025, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [x, h + 0.05, -3.2] }), 1.5);
  }

  // ------------------------------------------------------------ turret
  cyl(1.5, 1.55, 0.25, 16, IRON, [0, 2.075, -1.1]);
  b.extrude(
    [
      [-3.1 + 0.0, 2.2],
      [0.9, 2.2],
      [0.9, 3.1],
      [0.3, 3.45],
      [-2.2, 3.45],
      [-3.1, 3.0],
    ].map(([z, y]) => [z + 0.0, y] as [number, number]),
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, color: CAMO },
  );
  for (const s of [1, -1]) {
    decal(EMBLEM, [s * 1.312, 2.8, -1.5], [s, 0, 0], 0.9, 0.9);
    // smoke launchers
    box(0.3, 0.2, 1.1, DARK, [s * 1.4, 2.75, -2.3]);
    for (let i = 0; i < 4; i++)
      cyl(0.07, 0.07, 0.45, 6, BLACK, [s * 1.5, 3.0, -2.7 + i * 0.3], [s * 0.6, 0.8, 0]);
    // trunnion plates
    box(0.3, 1.0, 1.8, CAMO, [s * 0.9, 3.35, -1.0]);
    box(0.34, 0.3, 0.3, STEEL, [s * 0.9, 3.55, -1.0]);
  }
  // hatch / cupola / sensor
  cyl(0.42, 0.46, 0.3, 8, CAMO, [-0.7, 3.6, -2.5]);
  cyl(0.34, 0.34, 0.08, 8, STEEL, [-0.7, 3.78, -2.5]);
  box(0.12, 0.12, 0.12, IRON, [-0.7, 3.88, -2.5]);
  b.part(new THREE.SphereGeometry(0.22, 8, 6), GUNMETAL, { at: [0.8, 3.6, -2.4] });
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [0.8, 3.65, -2.18] }), 1.3);

  // ------------------------------------------------------------ railgun
  const el = (10 * Math.PI) / 180;
  const D = new THREE.Vector3(0, Math.sin(el), Math.cos(el));
  const U = new THREE.Vector3(0, Math.cos(el), -Math.sin(el));
  const PIV = new THREE.Vector3(0, 3.55, -1.0);
  const gp = (s: number, lat = 0, up = 0) =>
    PIV.clone().addScaledVector(D, s).addScaledVector(U, up).add(new THREE.Vector3(lat, 0, 0));
  const gbox = (w: number, h: number, l: number, color: any, s: number, lat = 0, up = 0) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { at: gp(s, lat, up), dir: D, axis: "z", up: U });
  const gcyl = (r: number, len: number, seg: number, color: any, s: number, lat = 0, up = 0) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: gp(s, lat, up), dir: D });

  // breech
  gbox(1.0, 0.9, 2.2, IRON, -0.6);
  gbox(1.2, 1.1, 0.4, GUNMETAL, -1.8);
  gbox(0.7, 0.2, 1.0, CAMO, -0.5, 0, 0.55);
  for (const s of [1, -1]) {
    gbox(0.18, 0.5, 1.4, STEEL, -0.4, s * 0.58, 0);
    glow(gbox(0.03, 0.12, 0.9, AMBER, -0.4, s * 0.68, 0.1), 1.2);
  }
  // rails
  for (const s of [1, -1]) {
    gbox(0.28, 0.42, 7.6, STEEL, 3.4, s * 0.29);
    glow(gbox(0.03, 0.26, 6.8, CYAN, 3.6, s * 0.145), 1.5);
  }
  // coils
  for (let i = 0; i < 7; i++) {
    const s = 1.2 + i * 0.95;
    gbox(0.98, 0.14, 0.34, GUNMETAL, s, 0, 0.28);
    gbox(0.98, 0.14, 0.34, GUNMETAL, s, 0, -0.28);
    for (const sx of [1, -1]) gbox(0.14, 0.7, 0.34, GUNMETAL, s, sx * 0.42, 0);
    glow(gbox(0.5, 0.02, 0.36, CYAN, s, 0, 0.355), 1.4);
    glow(gbox(0.5, 0.02, 0.36, CYAN, s, 0, -0.355), 1.0);
  }
  // capacitor tanks + brackets
  for (const sx of [1, -1]) {
    gcyl(0.22, 3.4, 8, GUNMETAL, 2.9, sx * 0.95, 0.15);
    glow(gcyl(0.14, 3.0, 6, CYAN, 2.9, sx * 0.95, 0.15), 0.6);
    for (const s of [1.4, 2.9, 4.4]) gcyl(0.25, 0.12, 8, BLACK, s, sx * 0.95, 0.15);
    gcyl(0.2, 0.2, 6, IRON, 4.7, sx * 0.95, 0.15);
    for (const s of [1.7, 2.7, 3.7, 4.4]) gbox(0.55, 0.14, 0.2, STEEL, s, sx * 0.7, 0.15);
    // glowing stop caps are slightly proud of the tank ends
  }
  // muzzle
  gbox(1.1, 0.9, 0.7, GUNMETAL, 7.35);
  for (const sx of [1, -1]) gbox(0.1, 0.5, 0.5, IRON, 7.35, sx * 0.6, 0);
  glow(gbox(0.28, 0.3, 0.04, CYAN, 7.72), 1.6);
  // sight
  gcyl(0.1, 1.3, 6, DARK, 0.6, 0.8, 0.55);
  gbox(0.2, 0.2, 0.1, CYAN, 1.3, 0.8, 0.55);
  glow(gbox(0.16, 0.16, 0.02, CYAN, 1.36, 0.8, 0.55), 1.3);
  // elevation rams
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 2.7, -2.4], gp(0.2, s * 0.5, -0.45), 0.1, IRON);
    b.rod([s * 0.8, 2.7, -2.4], gp(-0.5, s * 0.5, -0.45).lerp(new THREE.Vector3(s * 0.8, 2.7, -2.4), 0.45), 0.15, STEEL);
  }

  // ------------------------------------------------------------ stabiliser legs
  const leg = (sx: number, z: number) => {
    const x = sx * 2.8;
    box(0.5, 0.55, 0.9, CAMO, [sx * 1.5, 1.5, z]);
    box(1.5, 0.28, 0.5, DARK, [sx * 2.1, 1.55, z]);
    cyl(0.22, 0.22, 0.95, 8, HAZ_PAINT, [x, 1.28, z]);
    cyl(0.13, 0.13, 0.8, 6, STEEL, [x, 0.6, z]);
    b.part(new THREE.SphereGeometry(0.2, 6, 5), IRON, { at: [x, 0.3, z] });
    cyl(0.5, 0.56, 0.2, 8, IRON, [x, 0.09, z]);
    for (const k of [0, 1]) box(k ? 0.1 : 0.9, 0.08, k ? 0.9 : 0.1, GUNMETAL, [x, 0.22, z]);
    b.rod([sx * 1.45, 1.0, z], [x - sx * 0.05, 0.85, z], 0.07, STEEL);
    glow(box(0.1, 0.1, 0.1, AMBER, [x, 1.78, z + 0.0]), 1.2);
  };
  for (const sx of [1, -1]) {
    leg(sx, 0.4);
    leg(sx, -5.1);
  }

  return b.root;
}
```
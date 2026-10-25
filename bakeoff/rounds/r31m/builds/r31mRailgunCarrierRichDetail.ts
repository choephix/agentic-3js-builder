import * as THREE from "three";
import { createBuilder, paint, mix, noise, smoothstep, patches, svg, rng } from "../../../../src/index";
import type { ColorInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal } from "../../../../kits/clockwork";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with an elevated coil railgun on a turret ring and four deployed hydraulic stabiliser legs.",
};

type V = [number, number, number];

// ---------------------------------------------------------------- palette
const OLIVE = "#5a6b3a";
const DKGRN = "#38472a";
const TAN = "#a39668";
const DARK = "#23262b";
const STEELC = "#6b7078";
const RUBBER = "#1b1b1d";
const GLASS = "#4a8fa6";
const CYAN = "#58e0ff";
const AMBER = "#ffb030";
const RED = "#ff3b2e";
const BRASS = "#c9a24a";
const COPPER = "#b0642e";
const HAZ = "#f2c230";
const BLACK = "#101114";
const WHITE = "#e8e8dc";

// ---------------------------------------------------------------- paints
const camo = patches(OLIVE, [DKGRN, TAN, "#4b5c33"], { size: 1.2, gap: 0.02, seed: 4 });
function plated(base: any, size: number, aspect = 0.6) {
  return paint((p, n) => {
    let c = base.at(p, n);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const vs = size * aspect;
    const du = (((u / size) % 1) + 1) % 1 * size;
    const dv = (((v / vs) % 1) + 1) % 1 * vs;
    if (du < 0.012 || dv < 0.012) return mix(c, "#14170d", 0.75);
    if (du < 0.03 || dv < 0.03) return mix(c, "#ffffff", 0.07);
    const dirt = smoothstep(1.0, 0.2, p.y) * (0.35 + 0.5 * noise(p, 0.25, 3));
    c = mix(c, "#54442c", dirt * 0.7);
    c = mix(c, "#ffffff", 0.06 * smoothstep(0.4, 1, n.y));
    c = mix(c, "#15150f", 0.5 * smoothstep(0.62, 0.8, noise(p, 0.18, 8)) * 0.4);
    return c;
  });
}
const HULL = plated(camo, 0.9);
const HULL2 = plated(patches("#4b5c33", [DKGRN, OLIVE], { size: 0.8, gap: 0.02, seed: 9 }), 0.6, 0.8);
const TYRE = paint((p) => mix(RUBBER, "#5b4a32", smoothstep(0.55, 0.0, p.y) * 0.8 * (0.4 + noise(p, 0.12, 2))));
const GUN = metal("iron", { polish: 0.4, tarnish: 0.3 });
const RAIL = metal("steel", { polish: 0.6 });
const CHROME = metal("steel", { polish: 0.9, tarnish: 0.05, seed: 7 });

// ---------------------------------------------------------------- textures
const star = (cx: number, cy: number, R: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r : R;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
};
const STAR = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1d2616" stroke="#d9d3a8" stroke-width="3"/><polygon points="${star(32, 33, 22, 9)}" fill="#d9d3a8" stroke="#0e130a" stroke-width="1.5"/></svg>`,
  { size: 128 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 160 56"><text x="80" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="46" fill="none" stroke="#0e130a" stroke-width="7" stroke-linejoin="round">RG-6</text><text x="80" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="46" fill="#e4dfc0">RG-6</text></svg>`,
  { size: 256 },
);
let hz = "";
for (let i = -2; i < 12; i++) hz += `<polygon points="${i * 16},24 ${i * 16 + 8},24 ${i * 16 + 20},0 ${i * 16 + 12},0" fill="#111"/>`;
const HAZARD = svg(
  `<svg viewBox="0 0 160 24"><rect width="160" height="24" fill="${HAZ}"/>${hz}<rect x="1" y="1" width="158" height="22" fill="none" stroke="#111" stroke-width="2"/></svg>`,
  { size: 256 },
);
let slats = "";
for (let i = 0; i < 7; i++) slats += `<rect x="6" y="${8 + i * 8}" width="68" height="4" fill="#050607"/><rect x="6" y="${12 + i * 8}" width="68" height="1.5" fill="#4a5058"/>`;
const GRILLE = svg(`<svg viewBox="0 0 80 64"><rect width="80" height="64" rx="4" fill="#2a2e33" stroke="#0a0b0c" stroke-width="3"/>${slats}</svg>`, { size: 160 });
const SCREEN = svg(
  `<svg viewBox="0 0 64 40"><rect width="64" height="40" rx="3" fill="#06161a" stroke="#222" stroke-width="3"/><path d="M6 30 L16 22 L26 26 L38 12 L48 18 L58 8" stroke="#58e0ff" stroke-width="2" fill="none"/><text x="6" y="12" font-family="monospace" font-size="7" fill="#58ffa0">CHG 98%</text><rect x="6" y="33" width="40" height="3" fill="#58ffa0"/></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 72"><polygon points="32,3 61,56 3,56" fill="${HAZ}" stroke="#111" stroke-width="4" stroke-linejoin="round"/><path d="M35 20 L24 38 H31 L28 50 L40 31 H33Z" fill="#111"/><text x="32" y="69" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#e8e8dc">40 MJ</text></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- builder + helpers
const b = createBuilder({ name: "railgun_carrier", paintSize: 2048 });
const box = (s: V, at: V, c: ColorInput, o: any = {}) => b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { at, ...o });
const cyl = (r: number, h: number, at: V, c: ColorInput, o: any = {}, seg = 8, rt = r) =>
  b.part(new THREE.CylinderGeometry(rt, r, h, seg), c, { at, ...o });
const cylX = (r: number, h: number, at: V, c: ColorInput, seg = 8) => cyl(r, h, at, c, { rotation: [0, 0, 90] }, seg);
const cylZ = (r: number, h: number, at: V, c: ColorInput, seg = 8) => cyl(r, h, at, c, { rotation: [90, 0, 0] }, seg);
const dec = (tex: any, w: number, h: number, at: V, dir: V) =>
  b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex });
const sph = (r: number, at: V, c: ColorInput, ws = 8, hs = 6) => b.part(new THREE.SphereGeometry(r, ws, hs), c, { at });

// ---------------------------------------------------------------- wheels
const AX = [2.8, 0.4, -2.0];
const WR = 0.62;
for (const z of AX) {
  // axle, differential, springs
  cylX(0.12, 2.9, [0, WR, z], DARK);
  sph(0.28, [0, WR, z], STEELC, 8, 6);
  for (const s of [1, -1]) {
    box([0.1, 0.1, 1.2], [s * 0.95, 0.95, z], STEELC);
    box([0.1, 0.08, 0.9], [s * 0.95, 0.88, z], DARK);
    cyl(0.04, 0.5, [s * 1.1, 0.75, z + 0.35], CHROME, { rotation: [0, 0, 0] }, 6);
    cyl(0.07, 0.3, [s * 1.1, 0.95, z + 0.35], DARK, {}, 6);
  }
  for (const s of [1, -1]) {
    const cx = s * 1.45, cy = WR;
    cylX(WR, 0.56, [cx, cy, z], TYRE, 14);
    cylX(0.4, 0.6, [cx, cy, z], STEELC, 10);
    cylX(0.33, 0.04, [cx + s * 0.31, cy, z], BLACK, 10);
    cylX(0.2, 0.08, [cx + s * 0.33, cy, z], DKGRN, 10);
    cylX(0.09, 0.1, [cx + s * 0.38, cy, z], BRASS, 8);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      cylX(0.035, 0.08, [cx + s * 0.37, cy + 0.27 * Math.cos(a), z + 0.27 * Math.sin(a)], CHROME, 6);
    }
    cylX(0.015, 0.1, [cx + s * 0.34, cy + 0.36, z + 0.06], RED, 4); // valve stem
    for (let k = 0; k < 14; k++) {
      const a = (k * 2 * Math.PI) / 14;
      box([0.58, 0.1, 0.2], [cx, cy + 0.65 * Math.cos(a), z + 0.65 * Math.sin(a)], TYRE, { rotation: [(a * 180) / Math.PI, 0, 0] });
    }
    // fender, lip, flap
    box([0.85, 0.08, 1.7], [cx, 1.42, z], HULL2);
    box([0.05, 0.22, 1.7], [cx + s * 0.4, 1.3, z], HULL2);
    box([0.7, 0.5, 0.05], [cx, 0.92, z - 0.88], RUBBER);
    box([0.7, 0.06, 0.07], [cx, 1.18, z - 0.88], STEELC);
  }
}

// ---------------------------------------------------------------- chassis
for (const s of [1, -1]) box([0.22, 0.32, 9.4], [s * 0.78, 0.95, -0.2], DARK);
for (const z of [-4.1, -3, -1.6, -0.6, 1, 2.1, 3.6]) box([1.9, 0.2, 0.2], [0, 0.98, z], STEELC);
box([1.9, 0.08, 8.2], [0, 0.78, -0.2], DARK);
// front bumper + bull bar + winch
box([2.7, 0.35, 0.5], [0, 0.88, 4.0], HULL2);
box([2.5, 0.08, 0.1], [0, 1.08, 4.28], HAZ);
for (const x of [-1.0, -0.4, 0.4, 1.0]) cyl(0.04, 0.5, [x, 1.2, 4.3], STEELC, {}, 6);
cylX(0.12, 1.0, [0, 0.62, 4.05], DARK);
for (const s of [1, -1]) {
  cylZ(0.05, 0.25, [s * 1.1, 0.85, 4.35], RED, 6);
  box([0.3, 0.3, 0.04], [s * 1.0, 0.88, 4.27], HAZ);
}
// rear bumper, hitch, taillights
box([2.7, 0.4, 0.4], [0, 0.95, -4.5], HULL2);
cylZ(0.08, 0.35, [0, 0.95, -4.85], STEELC, 8);
sph(0.11, [0, 0.95, -5.0], DARK, 8, 6);
dec(HAZARD, 2.4, 0.3, [0, 0.95, -4.71], [0, 0, -1]);
for (const s of [1, -1]) glow(box([0.3, 0.16, 0.05], [s * 1.0, 1.3, -4.16], RED), 1.4);

// ---------------------------------------------------------------- hull
b.part(new THREE.BoxGeometry(2.7, 0.85, 5.7), HULL, { at: [0, 1.78, -1.3] });
for (const s of [1, -1]) {
  box([0.55, 0.14, 5.7], [s * 1.2, 2.2, -1.3], HULL, { rotation: [0, 0, -s * 35] });
  box([0.1, 0.6, 5.6], [s * 1.38, 1.7, -1.3], HULL2); // side skirt armour
  // side bins and tanks
  box([0.2, 0.5, 1.2], [s * 1.5, 1.65, -3.3], HULL2);
  box([0.04, 0.08, 0.3], [s * 1.61, 1.8, -3.3], STEELC);
  cylZ(0.2, 1.0, [s * 1.5, 1.7, -2.0], OLIVE, 8);
  cylZ(0.04, 1.1, [s * 1.5, 1.88, -2.0], STEELC, 6);
  // decals
  dec(STENCIL, 1.2, 0.42, [s * 1.435, 1.9, -0.4], [s, 0, 0]);
  dec(GRILLE, 0.9, 0.55, [s * 1.435, 1.65, -3.35], [s, 0, 0]);
  dec(WARN, 0.32, 0.36, [s * 1.435, 2.0, 0.8], [s, 0, 0]);
  // cab details
  dec(STAR, 0.5, 0.5, [s * 1.112, 1.5, 2.6], [s, 0, 0]);
  box([0.04, 0.6, 1.0], [s * 1.11, 2.1, 2.7], GLASS);
  box([0.05, 0.05, 1.1], [s * 1.12, 2.43, 2.7], DARK);
  box([0.05, 0.05, 1.1], [s * 1.12, 1.78, 2.7], DARK);
  box([0.05, 0.9, 0.04], [s * 1.12, 1.4, 2.0], DARK);
  box([0.06, 0.06, 0.2], [s * 1.14, 1.8, 3.0], DARK);
  box([0.1, 0.35, 0.22], [s * 1.55, 2.3, 3.3], DARK);
  box([0.4, 0.04, 0.06], [s * 1.35, 2.3, 3.3], STEELC);
  // exhaust stacks
  cyl(0.1, 1.0, [s * 0.95, 2.7, 1.3], STEELC, {}, 8);
  cyl(0.13, 0.08, [s * 0.95, 3.2, 1.3], BLACK, {}, 8);
  cyl(0.06, 0.4, [s * 0.95, 2.15, 1.3], DARK, {}, 6);
  // smoke dischargers
  for (let k = 0; k < 3; k++) cyl(0.06, 0.28, [s * 1.1, 3.0, -0.2 - k * 0.2], DARK, { rotation: [0, 0, -s * 40] }, 6);
  // grab handles
  for (const z of [0.9, -3.8]) box([0.04, 0.04, 0.5], [s * 1.2, 2.4, z], STEELC);
}
// cab
box([2.2, 1.5, 2.0], [0, 1.75, 2.6], HULL);
box([2.4, 0.1, 2.2], [0, 2.55, 2.6], HULL2);
box([2.1, 0.62, 0.06], [0, 2.18, 3.62], GLASS, { rotation: [-18, 0, 0] });
box([2.2, 0.06, 0.1], [0, 2.52, 3.62], DARK);
box([0.06, 0.64, 0.1], [0, 2.18, 3.64], DARK);
dec(GRILLE, 1.5, 0.6, [0, 1.35, 3.605], [0, 0, 1]);
for (const s of [1, -1]) {
  glow(box([0.36, 0.2, 0.06], [s * 0.85, 1.7, 3.62], "#fff2c0"), 1.5);
  box([0.4, 0.04, 0.1], [s * 0.85, 1.84, 3.62], DARK);
}
// roof gear
for (const x of [-0.75, -0.25, 0.25, 0.75]) glow(box([0.3, 0.12, 0.12], [x, 2.65, 3.5], AMBER), 1.3);
glow(b.lathe([[0.0, 0], [0.16, 0], [0.16, 0.05], [0.1, 0.16], [0, 0.18]], { at: [0.7, 2.6, 2.0], color: AMBER }), 1.6);
cyl(0.2, 0.04, [-0.6, 2.62, 2.2], DARK, {}, 8);
box([0.5, 0.14, 0.4], [-0.6, 2.68, 2.2], HULL2);
// hull top details
box([1.0, 0.08, 0.6], [0.0, 2.26, 0.7], DARK);
dec(GRILLE, 0.9, 0.5, [0, 2.31, 0.7], [0, 1, 0]);
for (const s of [1, -1]) box([0.5, 0.06, 0.5], [s * 0.95, 2.28, -3.5], DARK, { rotation: [0, 0, 0] });
box([1.6, 0.35, 0.4], [0, 2.38, -3.9], HULL2);
dec(HAZARD, 2.2, 0.28, [0, 1.75, -4.16], [0, 0, -1]);
dec(WARN, 0.4, 0.45, [0, 1.8, -4.17], [0, 0, -1]);
// antenna and radar
cyl(0.025, 2.4, [0.95, 3.9, -2.6], DARK, {}, 6);
sph(0.05, [0.95, 5.1, -2.6], RED, 6, 4);
glow(sph(0.05, [0.95, 5.12, -2.6], RED, 6, 4), 1.6);
cyl(0.08, 0.5, [-0.95, 2.5, -2.6], STEELC, {}, 6);
b.lathe([[0, 0], [0.34, 0.15], [0.36, 0.17], [0, 0.05]], { at: [-0.95, 2.85, -2.6], axis: [0.3, 0.8, 0.5], color: OLIVE });
cyl(0.015, 0.3, [-0.88, 3.05, -2.45], STEELC, { dir: [0.3, 0.8, 0.5] }, 4);

// ---------------------------------------------------------------- turret
b.lathe([[0, 0], [1.3, 0], [1.3, 0.12], [1.1, 0.22], [1.0, 0.3], [0, 0.3]], { at: [0, 2.2, -1.0], color: STEELC, segments: 12 });
b.part(new THREE.CylinderGeometry(1.15, 1.25, 0.5, 12), HULL, { at: [0, 2.75, -1.0], flat: true });
box([1.6, 0.4, 1.8], [0, 2.8, -1.0], HULL2);
for (let k = 0; k < 12; k++) {
  const a = (k * Math.PI) / 6;
  cyl(0.03, 0.06, [1.28 * Math.cos(a), 2.32, -1.0 + 1.28 * Math.sin(a)], BRASS, {}, 6);
}
for (const s of [1, -1]) {
  box([0.3, 0.9, 1.3], [s * 0.78, 3.25, -1.0], HULL, {});
  box([0.06, 0.5, 0.9], [s * 0.95, 3.25, -1.0], STEELC);
  cylX(0.22, 0.12, [s * 0.95, 3.6, -1.0], BRASS, 8);
  for (let k = 0; k < 4; k++) cylX(0.025, 0.05, [s * 1.0, 3.6 + 0.12 * Math.cos(k * 1.57), -1.0 + 0.12 * Math.sin(k * 1.57)], DARK, 6);
  box([0.04, 0.6, 0.9], [s * 0.95, 2.82, -0.2], HAZARD);
  dec(SCREEN, 0.6, 0.38, [s * 1.205, 2.8, -1.7], [s, 0, 0]);
  dec(HAZARD, 0.9, 0.12, [s * 1.205, 2.65, -1.0], [s, 0, 0]);
  dec(WARN, 0.3, 0.34, [s * 1.205, 3.1, -1.2], [s, 0, 0]);
}
cyl(0.25, 0.1, [0.0, 3.05, -1.9], DARK, {}, 8); // hatch
cyl(0.18, 0.06, [0.0, 3.1, -1.9], STEELC, {}, 8);
// cables
for (const x of [-0.25, 0.1, 0.35])
  b.sweep([[x, 3.9, -2.0], [x, 3.4, -2.35], [x * 1.5, 3.0, -2.2], [x * 1.5, 2.6, -1.8]], 0.04, { color: DARK, caps: "none" } as any);

// ---------------------------------------------------------------- railgun
const T = (12 * Math.PI) / 180;
const P: V = [0, 3.6, -1.0];
const gp = (x: number, y: number, z: number): V => [x, P[1] + y * Math.cos(T) + z * Math.sin(T), P[2] - y * Math.sin(T) + z * Math.cos(T)];
const gaxis: V = [0, Math.sin(T), Math.cos(T)];
const GROT = { rotation: [-12, 0, 0] };
const gbox = (s: V, x: number, y: number, z: number, c: ColorInput) => box(s, gp(x, y, z), c, GROT);
const gcyl = (r: number, h: number, x: number, y: number, z: number, c: ColorInput, seg = 8) =>
  cyl(r, h, gp(x, y, z), c, { dir: gaxis }, seg);

cylX(0.14, 1.9, P, BRASS, 8);
// rails
for (const s of [1, -1]) {
  gbox([0.22, 0.3, 7.4], s * 0.3, 0, 2.7, RAIL);
  gbox([0.03, 0.2, 7.2], s * 0.185, 0, 2.7, COPPER);
  gbox([0.24, 0.06, 7.4], s * 0.3, 0.17, 2.7, GUN);
}
glow(gbox([0.3, 0.05, 7.1], 0, -0.06, 2.7, CYAN), 1.5);
// coil rings
for (let k = 0; k < 7; k++) {
  const z = 0.4 + k * 0.9;
  const at = gp(0, 0, z);
  b.lathe([[0.5, -0.07], [0.64, -0.07], [0.64, 0.07], [0.5, 0.07]], { at, axis: gaxis, color: GUN, segments: 8 });
  glow(b.lathe([[0.5, 0.07], [0.56, 0.07], [0.56, 0.1], [0.5, 0.1]], { at, axis: gaxis, color: CYAN, segments: 8 }), 1.6);
  for (const s of [1, -1]) gbox([0.12, 0.16, 0.14], s * 0.45, 0, z, STEELC);
  gbox([0.2, 0.05, 0.2], 0, 0.64, z, BRASS);
}
// breech block, capacitors, fins
gbox([1.0, 0.85, 1.4], 0, 0, -0.4, GUN);
gbox([1.06, 0.2, 1.5], 0, 0.5, -0.4, STEELC);
for (const x of [-0.32, 0, 0.32]) {
  gcyl(0.13, 1.5, x, 0.72, -0.4, OLIVE, 8);
  gcyl(0.14, 0.06, x, 0.72, 0.38, BRASS, 8);
  gcyl(0.14, 0.06, x, 0.72, -1.18, BRASS, 8);
}
for (const s of [1, -1]) {
  for (let k = 0; k < 5; k++) gbox([0.05, 0.7, 0.14], s * 0.53, 0, -0.95 + k * 0.28, STEELC);
  gbox([0.2, 0.5, 0.6], s * 0.58, 0, 0, STEELC);
}
dec(WARN, 0.35, 0.4, gp(0, 0.2, -1.12), [-gaxis[0], -gaxis[1], -gaxis[2]]);
glow(gbox([0.4, 0.1, 0.05], 0, -0.1, -1.12, RED), 1.4);
// hydraulic elevation rods
for (const s of [1, -1]) {
  b.rod([s * 0.55, 3.0, -1.9], gp(s * 0.55, -0.3, -0.6), 0.07, STEELC);
  b.rod([s * 0.55, 3.0, -1.9], [s * 0.55, 3.4, -1.65], 0.1, DARK);
  b.rod([s * 0.55, 3.4, -1.65], gp(s * 0.55, -0.3, -0.6), 0.045, CHROME);
}
// muzzle
gbox([0.95, 0.75, 0.6], 0, 0, 6.6, GUN);
for (let k = 0; k < 3; k++) gbox([0.97, 0.08, 0.16], 0, -0.2 + k * 0.2, 6.6, BLACK);
gbox([1.05, 0.12, 0.1], 0, 0, 6.3, STEELC);
glow(gbox([0.34, 0.05, 0.04], 0, -0.06, 6.92, CYAN), 2);
// optic
gbox([0.2, 0.2, 0.5], -0.0, 0.8, 0.6, DARK);
glow(gbox([0.14, 0.14, 0.04], 0, 0.8, 0.86, CYAN), 1.2);

// ---------------------------------------------------------------- stabiliser legs
for (const s of [1, -1])
  for (const z of [1.6, -3.6]) {
    const px = s * 2.8;
    box([1.7, 0.32, 0.42], [s * 2.0, 1.15, z], HULL2);
    box([0.3, 0.5, 0.6], [s * 1.35, 1.15, z], STEELC); // mount block
    dec(HAZARD, 1.4, 0.2, [s * 2.0, 1.15, z + (z > 0 ? 0.215 : -0.215)], [0, 0, z > 0 ? 1 : -1]);
    b.rod([s * 1.3, 0.98, z], [px, 0.5, z], 0.06, DARK);
    cyl(0.16, 1.0, [px, 0.9, z], DKGRN, {}, 8);
    cyl(0.19, 0.12, [px, 1.4, z], STEELC, {}, 8);
    cyl(0.09, 0.45, [px, 0.35, z], CHROME, {}, 8);
    cyl(0.5, 0.16, [px, 0.08, z], STEELC, {}, 8);
    cyl(0.54, 0.06, [px, 0.03, z], DARK, {}, 8);
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      cyl(0.04, 0.05, [px + 0.38 * Math.cos(a), 0.18, z + 0.38 * Math.sin(a)], BRASS, {}, 6);
    }
    b.sweep([[s * 1.3, 1.4, z + 0.15], [s * 1.9, 1.6, z + 0.15], [px + s * 0.1, 1.5, z + 0.15], [px + s * 0.1, 1.0, z + 0.12]], 0.025, { color: BLACK, caps: "none" } as any);
    glow(box([0.08, 0.08, 0.04], [px, 1.2, z + 0.17], CYAN), 1.2);
  }

// ---------------------------------------------------------------- crates (strapped on rear deck)
const R = rng(5);
for (let i = 0; i < 3; i++) {
  const x = -0.8 + i * 0.8;
  box([0.6, 0.35, 0.5], [x, 2.43, -3.2 + R() * 0.1], i === 1 ? TAN : DKGRN);
  box([0.62, 0.05, 0.1], [x, 2.43, -3.2], HAZ);
}

return b.root;

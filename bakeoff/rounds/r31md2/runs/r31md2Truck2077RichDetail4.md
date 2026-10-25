```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, catmull, polyline, rng, mix, noise, paint, resolve, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Razorback 2077 Assault Hauler",
  description:
    "Six-wheel militarised cyberpunk truck: angular camo-plated hull, neon underglow, roof railgun turret with missile pods, ram bumper with spikes, hazard stencils, glowing screens and thrusters.",
};

type V = [number, number, number];
const D = Math.PI / 180;

// ---------------------------------------------------------------- palette
const INK = "#14161c", DARK = "#23272f", STEEL = "#6b7686", LIGHT = "#aab4c2", GUN = "#3a424f";
const RUBBER = "#16181d", TYRE2 = "#23262d", YELLOW = "#f2c230", CYAN = "#27f0e6", MAGENTA = "#ff2e9a";
const ORANGE = "#ff7a1a", RED = "#d6283a", GLASS = "#0c202c", BRASS = "#b58a3c", WHITE = "#e8eef4";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

// ---------------------------------------------------------------- paints
const baseCol = (p: THREE.Vector3, n: THREE.Vector3, tint: string, k: number) => {
  let c = mix("#394150", "#4d5868", noise(p, 0.7, 3));
  c = mix(c, "#2c3640", smoothstep(0.55, 0.6, noise(p, 0.45, 11)));
  c = mix(c, tint, k);
  c = mix(c, "#5a6678", smoothstep(0.3, 1, n.y) * 0.3);
  c = mix(c, "#1d1712", smoothstep(1.35, 0.85, p.y) * (0.4 + 0.5 * noise(p, 0.2, 7)));
  return c;
};
const camoA = paint((p, n) => baseCol(p, n, "#2a3a2a", 0.12));
const camoB = paint((p, n) => baseCol(p, n, "#3b2a55", 0.3));
const plated = (base: any, cell: number, rows: number) =>
  paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const ci = Math.floor(u / cell), cj = Math.floor(v / (cell * rows));
    const du = (u / cell - ci) * cell, dv = (v / (cell * rows) - cj) * cell * rows;
    let col = resolve(base, p, n);
    const h = Math.sin(ci * 12.9898 + cj * 78.233 + (ax > 0.7 ? 5 : ay > 0.7 ? 9 : 0)) * 43758.5453;
    col = mix(col, "#8190a8", (h - Math.floor(h)) * 0.14);
    if (du < 0.012 || dv < 0.012) return mix(col, "#0d0f14", 0.85);
    if (du < 0.028 || dv < 0.028) return mix(col, "#9aa8bc", 0.2);
    const rv = Math.hypot(du - 0.045, (dv % 0.1) - 0.05);
    if (rv < 0.008 && du < 0.08) return mix(col, "#b9c4d4", 0.5);
    return col;
  });
const HULL = plated(camoA, 0.6, 0.5);
const CAB = plated(camoB, 0.5, 0.55);

// ---------------------------------------------------------------- textures
const hazardTex = (() => {
  let s = `<svg viewBox="0 0 200 8" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="8" fill="#f2c230"/>`;
  for (let i = -1; i < 26; i++)
    s += `<polygon points="${i * 8},8 ${i * 8 + 4},8 ${i * 8 + 8},0 ${i * 8 + 4},0" fill="#14161c"/>`;
  s += `<rect width="200" height="0.8" fill="#14161c"/><rect y="7.2" width="200" height="0.8" fill="#14161c"/></svg>`;
  return svg(s, { size: 800 });
})();
const emblemTex = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="60" fill="#10141a" stroke="#27f0e6" stroke-width="5"/>
  <circle cx="64" cy="64" r="50" fill="none" stroke="#3a4250" stroke-width="2" stroke-dasharray="4 4"/>
  <polygon points="64,14 107,39 107,89 64,114 21,89 21,39" fill="none" stroke="#ff2e9a" stroke-width="3"/>
  <path d="M30 38 L64 98 L98 38 L82 38 L64 70 L46 38 Z" fill="#f2c230" stroke="#14161c" stroke-width="3" stroke-linejoin="round"/>
  <path d="M50 28 L64 42 L78 28" fill="none" stroke="#27f0e6" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="64" cy="56" rx="9" ry="5" fill="#d6283a" stroke="#14161c" stroke-width="2"/>
  <text x="64" y="118" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#e8eef4">77</text></svg>`,
  { size: 256 },
);
const stencil = (text: string, color: string) =>
  svg(
    `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg"><text x="128" y="46" text-anchor="middle" font-family="Impact, monospace" font-weight="900" font-size="40" fill="${color}" stroke="#14161c" stroke-width="3" paint-order="stroke">${text}</text></svg>`,
    { size: 512 },
  );
const STEN1 = stencil("RZR-77 // SEC", WHITE);
const STEN2 = stencil("2077", YELLOW);
const screenTex = svg(
  `<svg viewBox="0 0 128 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="80" fill="#04141a"/><rect x="2" y="2" width="124" height="76" fill="none" stroke="#27f0e6" stroke-width="2"/>
  <polyline points="8,60 24,44 38,52 54,26 70,40 88,20 104,34 120,14" fill="none" stroke="#27f0e6" stroke-width="3"/>
  <rect x="10" y="66" width="10" height="8" fill="#ff2e9a"/><rect x="24" y="62" width="10" height="12" fill="#ff2e9a"/><rect x="38" y="68" width="10" height="6" fill="#ff2e9a"/>
  <text x="64" y="12" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#b5ff3c">TGT LOCK 98%</text>
  <circle cx="104" cy="62" r="9" fill="none" stroke="#d6283a" stroke-width="2"/><path d="M104 50v24M92 62h24" stroke="#d6283a" stroke-width="1.5"/></svg>`,
  { size: 256 },
);
const grilleTex = (() => {
  let s = `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="48" fill="#0c0f14"/>`;
  for (let i = 0; i < 6; i++)
    s += `<polygon points="4,${5 + i * 7} 124,${5 + i * 7} 124,${9 + i * 7} 64,${12 + i * 7} 4,${9 + i * 7}" fill="#3b4452"/><rect x="4" y="${5 + i * 7}" width="120" height="1" fill="#8190a8"/>`;
  s += `<rect x="62" y="0" width="4" height="48" fill="#1c212a"/><rect x="0" y="0" width="128" height="3" fill="#6b7686"/><rect x="0" y="45" width="128" height="3" fill="#6b7686"/></svg>`;
  return svg(s, { size: 256 });
})();
const glyphTex = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,6 58,52 6,52" fill="none" stroke="#ff2e9a" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="32" cy="38" r="9" fill="none" stroke="#27f0e6" stroke-width="4"/><circle cx="32" cy="38" r="3.5" fill="#27f0e6"/></svg>`,
  { size: 128 },
);

// ================================================================
export default function build() {
  const b = createBuilder({ name: "razorback2077", paintSize: 2048 });
  const R = rng(77);
  const chassis = b.joint("chassis", { at: [0, 0.95, 0], role: "spine" });
  const P = (geo: THREE.BufferGeometry, color: any, at: V, o: any = {}) => b.part(geo, color, { bone: chassis, at, ...o });
  const xf = (g: THREE.BufferGeometry, pos: V, rot: V = [0, 0, 0]) =>
    g.clone().applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(...pos),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
        new THREE.Vector3(1, 1, 1),
      ),
    );
  const bake = (gs: THREE.BufferGeometry[], color: any, bone: any = chassis, o: any = {}) =>
    b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0], ...o });
  const studs = (pts: V[], n: "x" | "y" | "z", r: number, color: any, bone: any = chassis) =>
    bake(pts.map((p) => xf(cyl(r, 0.025, 6), p, n === "x" ? [0, 0, 90] : n === "z" ? [90, 0, 0] : [0, 0, 0])), color, bone);
  const decal = (tex: any, w: number, h: number, at: V, dir: V, g = false, bone: any = chassis) => {
    const m = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
    if (g) glow(m);
    return m;
  };
  const neon = (a: V, c: V, color: string, r = 0.015, bone: any = chassis) =>
    glow(b.rod(a, c, r, color, { bone, sides: 5 }));

  // ---------------------------------------------------------------- frame and running gear
  for (const s of [1, -1]) {
    P(box(0.14, 0.2, 6.6), DARK, [s * 0.6, 0.85, -0.05]);
    neon([s * 0.98, 0.8, -3.0], [s * 0.98, 0.8, 2.9], s > 0 ? CYAN : MAGENTA, 0.03); // underglow
  }
  for (const z of [-3.1, -2.2, -0.4, 0.8, 2.1, 3.0]) P(box(1.3, 0.1, 0.12), DARK, [0, 0.82, z]);
  P(box(1.6, 0.07, 5.2), GUN, [0, 0.79, -0.2]); // skid plate
  P(box(1.6, 0.07, 0.6), GUN, [0, 0.86, 3.0], { rotation: [-15, 0, 0] });
  b.rod([0, 0.6, 2.1], [0, 0.6, -2.2], 0.05, DARK, { bone: chassis, sides: 8 }); // driveshaft
  P(cyl(0.12, 0.5, 8), STEEL, [0, 0.65, 0.5], { rotation: [90, 0, 0], flat: true }); // transfer case

  const wheel = (j: any, hub: V, s: number) => {
    const [x, y, z] = hub;
    b.part(cyl(0.5, 0.5, 14), RUBBER, { bone: j, at: hub, rotation: [0, 0, 90], flat: true });
    const tread: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      tread.push(xf(box(0.22, 0.1, 0.16), [x + (i % 2 ? 0.12 : -0.12), y + 0.52 * Math.cos(a), z + 0.52 * Math.sin(a)], [a / D, 0, 0]));
    }
    bake(tread, "#0e1013", j, { flat: true });
    b.part(cyl(0.45, 0.04, 14), TYRE2, { bone: j, at: [x + s * 0.26, y, z], rotation: [0, 0, 90], flat: true }); // sidewall
    b.part(cyl(0.33, 0.54, 12), DARK, { bone: j, at: hub, rotation: [0, 0, 90], flat: true }); // rim
    b.part(new THREE.TorusGeometry(0.31, 0.03, 5, 14), STEEL, { bone: j, at: [x + s * 0.28, y, z], rotation: [0, 90, 0] });
    glow(b.part(new THREE.TorusGeometry(0.39, 0.012, 4, 16), CYAN, { bone: j, at: [x + s * 0.285, y, z], rotation: [0, 90, 0] }));
    const bolts: THREE.BufferGeometry[] = [], spokes: THREE.BufferGeometry[] = [], lugs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      bolts.push(xf(cyl(0.017, 0.03, 6), [x + s * 0.285, y + 0.31 * Math.cos(a), z + 0.31 * Math.sin(a)], [0, 0, 90]));
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      spokes.push(xf(box(0.04, 0.22, 0.08), [x + s * 0.27, y + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)], [a / D, 0, 0]));
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      lugs.push(xf(cyl(0.025, 0.04, 6), [x + s * 0.3, y + 0.11 * Math.cos(a), z + 0.11 * Math.sin(a)], [0, 0, 90]));
    }
    bake(bolts, LIGHT, j);
    bake(spokes, STEEL, j);
    bake(lugs, LIGHT, j);
    b.part(cyl(0.1, 0.1, 8), GUN, { bone: j, at: [x + s * 0.3, y, z], rotation: [0, 0, 90], flat: true });
    glow(b.part(cyl(0.045, 0.03, 8), MAGENTA, { bone: j, at: [x + s * 0.36, y, z], rotation: [0, 0, 90] }));
    b.part(cyl(0.26, 0.03, 12), STEEL, { bone: j, at: [x - s * 0.2, y, z], rotation: [0, 0, 90], flat: true }); // brake disc
    b.part(box(0.1, 0.12, 0.2), RED, { bone: j, at: [x - s * 0.2, y + 0.24, z] }); // caliper
  };
  const axles = [{ k: "F", z: 2.1 }, { k: "M", z: -0.4 }, { k: "R", z: -2.2 }];
  for (const { k, z } of axles) {
    b.rod([-1.1, 0.55, z], [1.1, 0.55, z], 0.07, DARK, { bone: chassis, sides: 8 });
    P(new THREE.SphereGeometry(0.22, 8, 6), STEEL, [0, 0.55, z], { scale: [1.2, 1, 1], flat: true });
    P(cyl(0.12, 0.1, 8), GUN, [0, 0.55, z + (k === "F" ? 0.22 : -0.22)], { rotation: [90, 0, 0] });
    for (const s of [1, -1]) {
      for (let l = 0; l < 3; l++) P(box(0.1, 0.03, 1.1 - l * 0.28), STEEL, [s * 0.7, 0.68 + l * 0.035, z]);
      P(box(0.14, 0.04, 0.16), DARK, [s * 0.7, 0.8, z]);
      bake([xf(cyl(0.012, 0.3, 5), [s * 0.66, 0.68, z + 0.05]), xf(cyl(0.012, 0.3, 5), [s * 0.74, 0.68, z - 0.05])], STEEL);
      const a: V = [s * 0.92, 0.6, z + 0.18], c: V = [s * 0.82, 1.0, z + 0.3];
      b.rod(a, c, 0.035, YELLOW, { bone: chassis, sides: 6 });
      for (let i = 0; i < 5; i++) {
        const t = (i + 0.5) / 5;
        P(new THREE.TorusGeometry(0.06, 0.014, 4, 8), MAGENTA, [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t], {
          dir: [c[0] - a[0], c[1] - a[1], c[2] - a[2]], axis: "z",
        });
      }
      const side = s > 0 ? "L" : "R";
      const hub: V = [s * 1.2, 0.55, z];
      let parent: any = chassis;
      if (k === "F") parent = b.joint(`steer${k}${side}`, { parent: chassis, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" });
      const wj = b.joint(`wheel${k}${side}`, { parent, at: hub, dir: [0, 1, 0], role: "hinge" });
      wheel(wj, hub, s);
      // fender, flare, mud flap
      P(box(0.72, 0.1, 1.45), CAB, [s * 1.2, 1.24, z]);
      P(box(0.06, 0.28, 1.45), HULL, [s * 1.55, 1.12, z]);
      P(box(0.04, 0.05, 1.45), YELLOW, [s * 1.585, 1.26, z]);
      studs([-0.55, -0.2, 0.2, 0.55].map((d) => [s * 1.585, 1.12, z + d] as V), "x", 0.02, LIGHT);
      P(box(0.5, 0.4, 0.04), RUBBER, [s * 1.2, 0.82, z - 0.78]);
      P(box(0.5, 0.05, 0.05), YELLOW, [s * 1.2, 1.0, z - 0.78]);
    }
  }

  // ---------------------------------------------------------------- lower hull
  P(box(1.9, 0.6, 5.7), HULL, [0, 1.15, -0.45]);
  b.frustumBox([0, 1.15, 2.4], [0, 1.05, 3.35], [1.9, 0.6], [1.7, 0.4], { bone: chassis, color: HULL });
  for (const [zc, len] of [[0.85, 1.3], [-1.3, 0.7]] as [number, number][])
    for (const s of [1, -1]) {
      P(box(0.08, 0.5, len), CAB, [s * 1.0, 1.05, zc], { rotation: [0, 0, s * -8] });
      P(box(0.1, 0.05, len), YELLOW, [s * 1.04, 0.8, zc]);
      studs([-0.4, 0, 0.4].filter((d) => Math.abs(d) < len / 2 - 0.1).map((d) => [s * 1.045, 1.15, zc + d] as V), "x", 0.025, LIGHT);
    }
  for (const s of [1, -1]) {
    P(box(0.3, 0.06, 1.2), STEEL, [s * 1.1, 1.0, 0.85]); // step
    P(box(0.3, 0.02, 1.2), INK, [s * 1.1, 1.035, 0.85]);
    // battery / fuel tanks and straps
    P(cyl(0.2, 1.0, 10), GUN, [s * 1.05, 0.62, 0.85], { rotation: [90, 0, 0], flat: true });
    for (const d of [-0.3, 0.3]) P(new THREE.TorusGeometry(0.205, 0.015, 4, 10), STEEL, [s * 1.05, 0.62, 0.85 + d]);
    glow(b.part(box(0.04, 0.05, 0.6), s > 0 ? CYAN : MAGENTA, { bone: chassis, at: [s * 1.26, 0.62, 0.85] }));
  }

  // ---------------------------------------------------------------- cab
  P(box(2.3, 0.5, 1.7), CAB, [0, 1.7, 1.3]);
  b.frustumBox([0, 1.95, 1.35], [0, 2.45, 1.3], [2.3, 1.6], [2.0, 0.9], { bone: chassis, color: CAB });
  P(box(1.9, 0.06, 0.85), HULL, [0, 2.48, 1.3]);
  P(box(2.0, 0.55, 0.05), GLASS, [0, 2.22, 1.975], { rotation: [-38.7, 0, 0] }); // windscreen (placed via offset)
  P(box(2.04, 0.04, 0.07), DARK, [0, 2.49, 1.775], { rotation: [-38.7, 0, 0] });
  P(box(2.04, 0.04, 0.07), DARK, [0, 1.95, 2.155], { rotation: [-38.7, 0, 0] });
  for (let i = -1; i <= 1; i += 2) b.rod([i * 0.3, 2.0, 2.14], [i * 0.3, 2.45, 1.8], 0.012, STEEL, { bone: chassis, sides: 4 }); // wipers
  for (const s of [1, -1]) {
    P(box(0.04, 0.4, 1.0), GLASS, [s * 1.09, 2.2, 1.3], { rotation: [0, 0, s * 16.7] });
    P(box(0.045, 0.04, 1.05), DARK, [s * 1.07, 2.42, 1.3], { rotation: [0, 0, s * 16.7] });
    P(box(0.07, 0.5, 0.06), CAB, [s * 1.12, 2.2, 0.82], { rotation: [0, 0, s * 16.7] }); // B pillar
    // hood side intakes
    P(box(0.08, 0.35, 1.0), HULL, [s * 1.08, 1.68, 2.6]);
    for (let i = 0; i < 4; i++) P(box(0.02, 0.04, 0.7), INK, [s * 1.125, 1.58 + i * 0.07, 2.6]);
    // headlights
    P(box(0.5, 0.18, 0.1), DARK, [s * 0.74, 1.72, 3.1]);
    glow(b.part(box(0.44, 0.05, 0.04), CYAN, { bone: chassis, at: [s * 0.74, 1.74, 3.17] }));
    glow(b.part(box(0.3, 0.03, 0.04), MAGENTA, { bone: chassis, at: [s * 0.78, 1.67, 3.17] }));
    P(cyl(0.09, 0.05, 10), DARK, [s * 0.62, 1.16, 3.36], { rotation: [90, 0, 0] });
    glow(b.part(cyl(0.065, 0.03, 10), ORANGE, { bone: chassis, at: [s * 0.62, 1.16, 3.39], rotation: [90, 0, 0] }));
    // mirrors
    b.rod([s * 1.2, 2.1, 2.0], [s * 1.52, 2.15, 2.18], 0.02, STEEL, { bone: chassis, sides: 5 });
    b.rod([s * 1.2, 1.95, 1.95], [s * 1.52, 2.1, 2.18], 0.015, STEEL, { bone: chassis, sides: 5 });
    P(box(0.07, 0.32, 0.24), DARK, [s * 1.54, 2.12, 2.18]);
    glow(b.part(box(0.02, 0.04, 0.14), ORANGE, { bone: chassis, at: [s * 1.585, 2.24, 2.18] }));
    // exhaust stacks
    b.rod([s * 1.28, 1.5, 0.42], [s * 1.28, 3.0, 0.42], 0.09, STEEL, { bone: chassis, sides: 8 });
    P(cyl(0.12, 0.7, 8), DARK, [s * 1.28, 2.0, 0.42]);
    for (const h of [1.8, 2.2]) P(new THREE.TorusGeometry(0.125, 0.015, 4, 10), LIGHT, [s * 1.28, h, 0.42], { rotation: [90, 0, 0] });
    P(cyl(0.11, 0.04, 8), DARK, [s * 1.28, 3.04, 0.42]);
    glow(b.part(new THREE.TorusGeometry(0.1, 0.012, 4, 10), ORANGE, { bone: chassis, at: [s * 1.28, 3.07, 0.42], rotation: [90, 0, 0] }));
    // door with hinge
    const door = b.joint(`door${s > 0 ? "L" : "R"}`, { parent: chassis, at: [s * 1.18, 1.7, 1.95], dir: [0, 1, 0], role: "hinge" });
    b.part(box(0.05, 0.5, 1.25), CAB, { bone: door, at: [s * 1.17, 1.7, 1.32] });
    b.part(box(0.035, 0.2, 1.2), GUN, { bone: door, at: [s * 1.2, 1.58, 1.32] });
    b.part(box(0.04, 0.04, 0.2), STEEL, { bone: door, at: [s * 1.2, 1.82, 0.85] });
    b.part(box(0.03, 0.025, 0.4), INK, { bone: door, at: [s * 1.2, 1.9, 1.3] });
    decal(glyphTex, 0.3, 0.3, [s * 1.2, 1.72, 1.4], [s, 0, 0], true, door);
    studs([0.8, 1.1, 1.5, 1.8].map((z) => [s * 1.2, 1.5, z] as V), "x", 0.02, LIGHT, door);
  }
  // hood
  b.frustumBox([0, 1.72, 2.05], [0, 1.6, 3.15], [2.2, 0.55], [1.9, 0.4], { bone: chassis, color: HULL });
  P(box(0.34, 0.07, 1.05), GUN, [0, 1.93, 2.6], { rotation: [10, 0, 0] });
  for (let i = 0; i < 4; i++) glow(b.part(box(0.2, 0.02, 0.05), CYAN, { bone: chassis, at: [0, 1.975 - i * 0.03 + 0.0, 2.25 + i * 0.25], rotation: [10, 0, 0] }));
  decal(grilleTex, 1.5, 0.34, [0, 1.6, 3.165], [0, 0, 1]);
  P(box(1.6, 0.04, 0.05), YELLOW, [0, 1.8, 3.17]);
  // bumper and ram bar
  P(box(2.3, 0.32, 0.3), GUN, [0, 1.0, 3.45]);
  decal(hazardTex, 2.1, 0.1, [0, 1.0, 3.605], [0, 0, 1]);
  for (const s of [1, -1]) {
    P(box(0.2, 0.4, 0.4), DARK, [s * 1.2, 1.0, 3.4]);
    b.rod([s * 0.5, 0.95, 3.4], [s * 0.5, 0.95, 2.9], 0.04, STEEL, { bone: chassis, sides: 6 });
    P(new THREE.TorusGeometry(0.07, 0.02, 5, 8, Math.PI), STEEL, [s * 0.8, 0.82, 3.58], { rotation: [0, 0, 180] });
  }
  bake(Array.from({ length: 9 }, (_, i) => xf(new THREE.ConeGeometry(0.05, 0.22, 5), [-1.0 + i * 0.25, 0.92, 3.68], [90, 0, 0])), STEEL, chassis, { flat: true });
  b.sweep(polyline([[0.95, 0.85, 3.4], [0.95, 1.9, 3.55], [0.5, 2.05, 3.62], [-0.5, 2.05, 3.62], [-0.95, 1.9, 3.55], [-0.95, 0.85, 3.4]]), 0.045, STEEL, { bone: chassis, sides: 6, caps: "flat" });
  for (const x of [-0.4, 0, 0.4]) b.rod([x, 1.0, 3.6], [x, 2.05, 3.62], 0.02, STEEL, { bone: chassis, sides: 5 });
  P(cyl(0.12, 0.5, 8), DARK, [0, 1.2, 3.55], { rotation: [0, 0, 90] }); // winch drum
  b.rod([0, 1.2, 3.62], [0, 0.95, 3.7], 0.01, LIGHT, { bone: chassis, sides: 4 });
  P(new THREE.TorusGeometry(0.05, 0.015, 4, 8, Math.PI * 1.5), LIGHT, [0, 0.9, 3.72], { rotation: [0, 90, 0] });
  // roof gear
  neon([-0.8, 2.54, 1.62], [-0.05, 2.54, 1.62], CYAN, 0.03);
  neon([0.05, 2.54, 1.62], [0.8, 2.54, 1.62], MAGENTA, 0.03);
  P(box(1.8, 0.1, 0.12), DARK, [0, 2.53, 1.6]);
  P(new THREE.SphereGeometry(0.15, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, [0.6, 2.51, 1.0], { flat: true });
  P(cyl(0.17, 0.05, 8), STEEL, [0.6, 2.5, 1.0]);
  P(cyl(0.04, 0.35, 6), STEEL, [-0.6, 2.67, 1.0]);
  const radar = b.joint("radar", { parent: chassis, at: [-0.6, 2.84, 1.0], dir: [0, 1, 0], role: "hinge" });
  b.lathe([[0, 0], [0.26, 0.11], [0.26, 0.13], [0, 0.03]], { at: [-0.6, 2.86, 1.0], axis: [0, 0.9, 0.35], segments: 10, bone: radar, color: LIGHT });
  b.rod([-0.6, 2.88, 1.02], [-0.6, 3.1, 1.18], 0.01, STEEL, { bone: radar, sides: 4 });
  b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { bone: radar, at: [-0.6, 3.1, 1.18] });

  // ---------------------------------------------------------------- cargo module
  P(box(2.4, 0.95, 3.7), HULL, [0, 1.925, -1.45]);
  P(box(2.46, 0.06, 3.76), DARK, [0, 2.42, -1.45]);
  P(box(2.46, 0.06, 3.76), DARK, [0, 1.47, -1.45]);
  P(box(2.0, 0.08, 3.4), CAB, [0, 2.48, -1.5]);
  const ribs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (let i = 0; i < 8; i++) ribs.push(xf(box(0.06, 0.9, 0.09), [s * 1.2, 1.925, -3.1 + i * 0.5]));
  bake(ribs, GUN);
  for (const s of [1, -1]) {
    decal(emblemTex, 0.7, 0.7, [s * 1.206, 2.0, -0.4], [s, 0, 0]);
    decal(STEN1, 1.3, 0.33, [s * 1.206, 2.0, -1.9], [s, 0, 0]);
    decal(hazardTex, 3.4, 0.12, [s * 1.208, 1.55, -1.45], [s, 0, 0]);
    decal(hazardTex, 3.4, 0.12, [s * 1.208, 2.35, -1.45], [s, 0, 0]);
    decal(grilleTex, 0.8, 0.3, [s * 1.206, 1.72, -2.9], [s, 0, 0]);
    glow(b.part(box(0.03, 0.04, 2.8), s > 0 ? CYAN : MAGENTA, { bone: chassis, at: [s * 1.21, 1.62, -1.5] }));
  }
  decal(screenTex, 0.8, 0.5, [-1.206, 1.72, -1.2], [-1, 0, 0], true);
  P(box(0.04, 0.58, 0.9), DARK, [-1.215, 1.72, -1.2]);
  decal(screenTex, 0.8, 0.5, [-1.222, 1.72, -1.2], [-1, 0, 0], true);
  P(box(2.0, 0.1, 0.1), INK, [0, 2.3, 0.37]);
  // roof greebles and rails
  const gre: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 16; i++)
    gre.push(xf(box(0.08 + R() * 0.16, 0.05 + R() * 0.07, 0.08 + R() * 0.14), [(R() - 0.5) * 1.7, 2.55, -2.9 + R() * 1.0 + (i % 2) * 1.4]));
  bake(gre, GUN, chassis, { flat: true });
  for (const s of [1, -1]) b.rod([s * 0.95, 2.58, -3.1], [s * 0.95, 2.58, -0.1], 0.02, STEEL, { bone: chassis, sides: 5 });
  for (const z of [-2.8, -0.2]) {
    P(cyl(0.2, 0.06, 10), DARK, [0.7, 2.55, z]);
    P(cyl(0.025, 0.04, 6), STEEL, [0.7, 2.59, z]);
    bake(Array.from({ length: 5 }, (_, i) => xf(box(0.03, 0.01, 0.17), [0.7 + 0.1 * Math.cos(i * 1.256), 2.595, z + 0.1 * Math.sin(i * 1.256)], [0, -i * 72, 0])), LIGHT);
    glow(b.part(new THREE.TorusGeometry(0.2, 0.01, 4, 12), MAGENTA, { bone: chassis, at: [0.7, 2.57, z], rotation: [90, 0, 0] }));
  }
  for (const s of [1, -1]) {
    b.spike([s * 1.1, 2.45, -3.0], [s * 0.15, 1, -0.1], 1.6, 0.014, STEEL, { bone: chassis, sides: 5 });
    P(cyl(0.05, 0.1, 6), DARK, [s * 1.1, 2.5, -3.0]);
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), RED, { bone: chassis, at: [s * 1.1 + 0.24, 4.0, -3.24] }));
  }
  // cables between cab and cargo
  for (const [dx, col] of [[-0.8, CYAN], [-0.55, MAGENTA], [0.55, ORANGE], [0.8, CYAN]] as [number, string][]) {
    b.sweep(catmull([[dx, 2.48, 0.9], [dx, 2.7, 0.55], [dx, 2.6, 0.2], [dx, 2.5, -0.3]]), 0.02, DARK, { bone: chassis, sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), col, { bone: chassis, at: [dx, 2.52, 0.9] }));
  }
  b.sweep(catmull([[1.2, 1.55, 0.45], [1.28, 1.2, 0.45], [1.3, 1.0, 0.7], [1.2, 0.7, 0.85]]), 0.03, STEEL, { bone: chassis, sides: 6 });

  // rear door, thrusters, bumper
  const rd = b.joint("rearDoor", { parent: chassis, at: [0, 1.45, -3.32], dir: [0, 1, 0], role: "hinge" });
  b.part(box(2.2, 0.9, 0.08), CAB, { bone: rd, at: [0, 1.95, -3.34] });
  b.part(box(2.3, 0.04, 0.1), INK, { bone: rd, at: [0, 1.95, -3.35] });
  b.part(box(0.04, 0.9, 0.1), INK, { bone: rd, at: [0, 1.95, -3.35] });
  decal(emblemTex, 0.6, 0.6, [0.5, 2.0, -3.385], [0, 0, -1], false, rd);
  decal(STEN2, 0.7, 0.18, [-0.55, 1.75, -3.385], [0, 0, -1], false, rd);
  decal(glyphTex, 0.35, 0.35, [-0.55, 2.15, -3.385], [0, 0, -1], true, rd);
  b.part(box(0.06, 0.5, 0.06), STEEL, { bone: rd, at: [0.06, 1.9, -3.42] });
  b.part(box(0.06, 0.5, 0.06), STEEL, { bone: rd, at: [-0.06, 1.9, -3.42] });
  for (const s of [1, -1]) {
    glow(b.part(box(0.45, 0.1, 0.04), RED, { bone: rd, at: [s * 0.85, 2.3, -3.39] }));
    glow(b.part(box(0.2, 0.06, 0.04), ORANGE, { bone: rd, at: [s * 0.85, 2.18, -3.39] }));
    b.rod([s * 1.1, 1.5, -3.2], [s * 1.1, 1.65, -3.38], 0.025, STEEL, { bone: chassis, sides: 6 }); // hinge struts
    // vector thrusters
    b.lathe([[0, 0], [0.2, 0], [0.16, 0.1], [0.3, 0.5], [0.26, 0.5], [0.12, 0.12], [0, 0.14]], { at: [s * 0.75, 1.1, -3.45], axis: [0, 0, -1], segments: 10, bone: chassis, color: STEEL });
    glow(b.part(cyl(0.11, 0.03, 10), ORANGE, { bone: chassis, at: [s * 0.75, 1.1, -3.59], rotation: [90, 0, 0] }));
    for (const h of [0.2, 0.4]) P(new THREE.TorusGeometry(0.2 + h * 0.15, 0.02, 5, 10), DARK, [s * 0.75, 1.1, -3.45 - h]);
    P(box(0.5, 0.06, 0.06), YELLOW, [s * 0.75, 1.42, -3.45]);
  }
  P(box(2.5, 0.28, 0.22), GUN, [0, 0.98, -3.5]);
  decal(hazardTex, 2.3, 0.09, [0, 0.98, -3.615], [0, 0, -1]);
  decal(STEN2, 0.5, 0.12, [0, 1.25, -3.43], [0, 0, -1]);

  // ---------------------------------------------------------------- roof turret (railgun + pods)
  const tz = -1.4;
  P(new THREE.TorusGeometry(0.62, 0.04, 6, 16), STEEL, [0, 2.54, tz], { rotation: [90, 0, 0] });
  studs(Array.from({ length: 16 }, (_, i) => [0.62 * Math.cos(i * 0.3927), 2.59, tz + 0.62 * Math.sin(i * 0.3927)] as V), "y", 0.02, LIGHT);
  const yaw = b.joint("turretYaw", { parent: chassis, at: [0, 2.56, tz], dir: [0, 1, 0], role: "hinge" });
  const pitch = b.joint("turretPitch", { parent: yaw, at: [0, 3.02, tz], dir: [0, 0, 1], role: "hinge" });
  b.part(cyl(0.56, 0.3, 12), CAB, { bone: yaw, at: [0, 2.7, tz], flat: true });
  b.part(cyl(0.5, 0.06, 12), DARK, { bone: yaw, at: [0, 2.88, tz], flat: true });
  b.part(box(1.0, 0.5, 0.5), HULL, { bone: yaw, at: [0, 3.0, tz - 0.5] }); // counterweight/ammo
  decal(screenTex, 0.6, 0.38, [0, 3.0, tz - 0.755], [0, 0, -1], true, yaw);
  b.part(new THREE.SphereGeometry(0.1, 6, 5), DARK, { bone: yaw, at: [-0.35, 3.35, tz - 0.4], flat: true });
  glow(b.part(cyl(0.05, 0.03, 8), CYAN, { bone: yaw, at: [-0.35, 3.35, tz - 0.3], rotation: [90, 0, 0] }));
  b.rod([-0.35, 3.25, tz - 0.4], [-0.35, 3.0, tz - 0.4], 0.04, STEEL, { bone: yaw, sides: 6 });
  for (const s of [1, -1]) {
    b.part(box(0.12, 0.6, 0.9), CAB, { bone: yaw, at: [s * 0.4, 3.02, tz] });
    b.part(cyl(0.1, 0.1, 8), STEEL, { bone: yaw, at: [s * 0.48, 3.02, tz], rotation: [0, 0, 90] });
    // missile pods
    b.part(box(0.4, 0.45, 0.95), HULL, { bone: pitch, at: [s * 0.8, 3.02, tz + 0.2] });
    b.part(box(0.4, 0.1, 0.3), DARK, { bone: pitch, at: [s * 0.6, 3.02, tz] });
    b.part(box(0.42, 0.04, 0.96), YELLOW, { bone: pitch, at: [s * 0.8, 3.26, tz + 0.2] });
    for (const dx of [-0.1, 0.1])
      for (const dy of [-0.1, 0.1]) {
        b.part(cyl(0.085, 0.05, 10), INK, { bone: pitch, at: [s * 0.8 + dx, 3.02 + dy, tz + 0.68], rotation: [90, 0, 0] });
        b.spike([s * 0.8 + dx, 3.02 + dy, tz + 0.66], [0, 0, 1], 0.12, 0.06, RED, { bone: pitch, sides: 8 });
      }
  }
  b.part(box(0.5, 0.4, 0.6), GUN, { bone: pitch, at: [0, 3.02, tz - 0.15] });
  for (const s of [1, -1]) b.part(box(0.09, 0.14, 2.4), STEEL, { bone: pitch, at: [s * 0.09, 3.02, tz + 1.2] });
  glow(b.part(box(0.06, 0.06, 2.3), CYAN, { bone: pitch, at: [0, 3.02, tz + 1.2] }), 1.4);
  b.part(box(0.34, 0.06, 1.4), DARK, { bone: pitch, at: [0, 3.14, tz + 0.55] });
  for (let i = 0; i < 7; i++) glow(b.part(new THREE.TorusGeometry(0.17 - i * 0.005, 0.022, 5, 10), MAGENTA, { bone: pitch, at: [0, 3.02, tz + 0.35 + i * 0.3] }));
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      b.part(cyl(0.09, 0.35, 8), DARK, { bone: pitch, at: [s * 0.3, 2.9, tz + 0.15 + i * 0.45], rotation: [90, 0, 0], flat: true });
      glow(b.part(new THREE.TorusGeometry(0.09, 0.012, 4, 8), CYAN, { bone: pitch, at: [s * 0.3, 2.9, tz + 0.15 + i * 0.45 + 0.1] }));
    }
  b.part(box(0.34, 0.3, 0.28), DARK, { bone: pitch, at: [0, 3.02, tz + 2.45] });
  for (const s of [1, -1]) b.part(box(0.04, 0.2, 0.18), INK, { bone: pitch, at: [s * 0.175, 3.02, tz + 2.45] });
  b.sweep(catmull([[-0.45, 3.1, tz - 0.5], [-0.6, 3.2, tz - 0.2], [-0.35, 3.15, tz]]), 0.03, BRASS, { bone: pitch, sides: 5 });

  // ---------------------------------------------------------------- finishing details
  // roof strobe on cargo and warning triangles
  for (const s of [1, -1]) {
    glow(b.part(cyl(0.07, 0.06, 8), s > 0 ? CYAN : MAGENTA, { bone: chassis, at: [s * 1.15, 2.5, 0.2] }));
    glow(b.part(cyl(0.07, 0.06, 8), s > 0 ? MAGENTA : CYAN, { bone: chassis, at: [s * 1.15, 2.5, -3.2] }));
  }
  // scuff marks and weld seams across hull
  for (let i = 0; i < 10; i++) {
    const s = i % 2 ? 1 : -1;
    P(box(0.02, 0.03 + R() * 0.03, 0.2 + R() * 0.3), "#0d0f14", [s * 1.212, 1.5 + R() * 0.8, -3 + R() * 3.2]);
  }
  P(box(0.03, 0.9, 0.03), "#9aa8bc", [-1.205, 1.925, 0.15]);
  P(box(0.03, 0.9, 0.03), "#9aa8bc", [1.205, 1.925, 0.15]);
  return b.root;
}
```
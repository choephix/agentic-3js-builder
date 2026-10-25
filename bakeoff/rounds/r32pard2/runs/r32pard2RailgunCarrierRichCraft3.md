```ts
import * as THREE from "three";
import { createBuilder, paint, patches, mottle, grain, mix, noise, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a turreted electromagnetic railgun, braced on four deployed hydraulic stabiliser legs.",
};

// ---------- palette ----------
const OLIVE = "#5b6b3a";
const OLIVE_D = "#2f3a24";
const OLIVE_M = "#4a5632";
const TAN = "#a08a5a";
const STEEL = "#6b7078";
const STEEL_L = "#9aa1ab";
const GUNMETAL = "#2a2d33";
const BLACK = "#16181c";
const ORANGE = "#e08a1e";
const CYAN = "#5ee0ff";
const AMBER = "#ffd27a";
const RED = "#c2332b";

// ---------- paints ----------
const camoBase = patches(OLIVE, [OLIVE_D, TAN, OLIVE_M], { size: 0.95, gap: 0.05, seed: 3 });
const CAMO = paint((p, n) => {
  const c = camoBase.at(p, n);
  const mud = smoothstep(0.95, 0.15, p.y) * noise(p, 0.35, 4);
  const top = smoothstep(0.6, 1, n.y) * 0.08;
  const m = mix(c, "#4b3d2c", mud * 0.8);
  return [Math.min(1, m[0] + top), Math.min(1, m[1] + top), Math.min(1, m[2] + top)];
});
const GUNPAINT = grain("#3a3e46", "#5d636e", { size: 0.05, axis: "z", seed: 2 });
const TIRE = mottle("#1b1c1f", "#2c2d32", { size: 0.12, seed: 8 });
const DIRTY_STEEL = paint((p, n) => {
  const base = mix(STEEL, STEEL_L, noise(p, 0.2, 5));
  return mix(base, "#3d3226", smoothstep(0.9, 0.0, p.y) * 0.6 + smoothstep(0.2, -0.8, n.y) * 0.2);
});

// ---------- textures ----------
const HAZARD = svg(
  `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#e8b21c"/>
  ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 16 - 8} 32 L${i * 16 + 4} 0 L${i * 16 + 12} 0 L${i * 16} 32Z" fill="#17181b"/>`).join("")}
  <rect width="128" height="32" fill="none" stroke="#17181b" stroke-width="3"/></svg>`,
  { size: 256 },
);
const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#14161a" stroke="#d9d9c8" stroke-width="5"/>
  <path d="M50 14 L60 40 L88 42 L66 59 L74 86 L50 71 L26 86 L34 59 L12 42 L40 40Z" fill="#d9d9c8"/>
  <circle cx="50" cy="50" r="9" fill="#c2332b"/></svg>`,
  { size: 128 },
);
const WINDOW = svg(
  `<svg viewBox="0 0 100 40"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff0ff"/><stop offset="1" stop-color="#1d4a66"/></linearGradient></defs>
  <path d="M4 36 L12 4 L88 4 L96 36Z" fill="url(#g)" stroke="#101216" stroke-width="3"/>
  <path d="M30 4 L22 36" stroke="#101216" stroke-width="3"/><path d="M70 4 L78 36" stroke="#101216" stroke-width="3"/>
  <path d="M16 12 L40 12 L36 20 L14 20Z" fill="#ffffff" opacity="0.45"/></svg>`,
  { size: 256 },
);
const LABEL = svg(
  `<svg viewBox="0 0 120 60"><rect width="120" height="60" fill="#d9d9c8" stroke="#16181c" stroke-width="4"/>
  <rect x="4" y="4" width="112" height="16" fill="#c2332b"/>
  <text x="60" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#fff">HIGH VOLTAGE</text>
  <text x="60" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#16181c">RG-06</text>
  <path d="M10 54 H110" stroke="#16181c" stroke-width="3" stroke-dasharray="6 4"/></svg>`,
  { size: 256 },
);
const VENT = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#25282e"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="5" y="${3 + i * 4}" width="54" height="2" fill="#0b0c0e"/>`).join("")}
  <rect width="64" height="32" fill="none" stroke="#6b7078" stroke-width="2"/></svg>`,
  { size: 128 },
);
const LAMP = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="4" fill="#fff2c0"/><rect x="4" y="4" width="56" height="24" rx="3" fill="#ffe08a"/>
  <path d="M8 16 H56" stroke="#fff" stroke-width="3"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun-carrier" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const hull = b.joint("hull", { at: [0, 1.15, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 1.9, -1.0], dir: [0, 1, 0] });
  const ELEV = (16 * Math.PI) / 180;
  const D = V(0, Math.sin(ELEV), Math.cos(ELEV));
  const U = V(0, Math.cos(ELEV), -Math.sin(ELEV));
  const PIV = V(0, 2.95, -1.0);
  const gun = b.joint("railgun", { parent: turret, at: PIV, dir: D, role: "hinge" });

  const WZ = [2.8, 0, -2.8];
  const WR = 0.6;
  const WY = 0.68;
  const WX = 1.75;
  const wheels: { j: ReturnType<typeof b.joint>; s: number; z: number }[] = [];
  for (const s of [1, -1])
    WZ.forEach((z, i) => {
      const j = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: hull, at: [s * WX, WY, z], dir: [s, 0, 0] });
      wheels.push({ j, s, z });
    });
  const legs: { j: ReturnType<typeof b.joint>; s: number; z: number }[] = [];
  for (const s of [1, -1])
    for (const z of [3.7, -3.7]) {
      const j = b.joint(`stabiliser${s > 0 ? "L" : "R"}${z > 0 ? "F" : "B"}`, {
        parent: hull,
        at: [s * 1.4, 1.2, z],
        dir: [s, 0, 0],
        role: "leg",
      });
      legs.push({ j, s, z });
    }

  // ---------- helpers ----------
  const box = (w: number, h: number, l: number, color: any, bone: any, at: number[] | THREE.Vector3, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, l), color, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, bone: any, at: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...o });
  const plane = (w: number, h: number, tex: any, bone: any, at: any, dir: number[] | THREE.Vector3, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });
  // point in gun space: dist along barrel, x sideways, up perpendicular
  const G = (dist: number, x = 0, up = 0) =>
    PIV.clone().addScaledVector(D, dist).addScaledVector(U, up).add(V(x, 0, 0));
  const gbox = (w: number, h: number, l: number, d0: number, x: number, up: number, color: any, o: any = {}) =>
    box(w, h, l, color, gun, G(d0 + l / 2, x, up), { dir: D, axis: "z", ...o });
  const gcyl = (r: number, l: number, d0: number, x: number, up: number, seg: number, color: any, o: any = {}) =>
    cyl(r, r, l, seg, color, gun, G(d0 + l / 2, x, up), { dir: D, ...o });

  // ---------- chassis ----------
  b.extrude(
    [
      [-4.6, 0.7],
      [4.2, 0.7],
      [4.75, 1.0],
      [4.75, 1.55],
      [-4.6, 1.55],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.8, bevel: 0.05, color: CAMO, bone: hull },
  );
  // belly armour + side skirts
  box(2.5, 0.12, 8.6, GUNMETAL, hull, [0, 0.66, -0.2]);
  for (const s of [1, -1]) {
    box(0.1, 0.5, 8.4, CAMO, hull, [s * 1.44, 1.0, -0.2]);
    box(0.06, 0.12, 8.4, STEEL, hull, [s * 1.47, 1.28, -0.2]);
  }
  // upper deck
  box(2.5, 0.28, 5.4, CAMO, hull, [0, 1.69, -1.9]);
  box(2.2, 0.1, 4.8, DIRTY_STEEL, hull, [0, 1.87, -2.0]);
  // cab
  b.extrude(
    [
      [1.9, 1.55],
      [4.45, 1.55],
      [4.5, 2.0],
      [3.6, 2.7],
      [2.3, 2.7],
      [1.9, 2.35],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.5, bevel: 0.05, color: CAMO, bone: hull },
  );
  glow(plane(2.0, 0.85, WINDOW, hull, [0, 2.35, 4.06], [0, 0.79, 0.61]), 0.9);
  for (const s of [1, -1]) {
    glow(plane(0.9, 0.5, WINDOW, hull, [s * 1.27, 2.2, 3.25], [s, 0, 0], { up: [0, 1, 0] }), 0.9);
    // mirrors
    box(0.1, 0.36, 0.2, BLACK, hull, [s * 1.4, 2.2, 4.1]);
    b.rod([s * 1.3, 2.15, 4.15], [s * 1.55, 2.25, 4.15], 0.03, GUNMETAL, { bone: hull });
  }
  // roof hatch + light bar
  cyl(0.38, 0.4, 0.1, 8, STEEL, hull, [0, 2.75, 3.0]);
  cyl(0.2, 0.2, 0.08, 8, GUNMETAL, hull, [0, 2.82, 3.0]);
  box(1.6, 0.1, 0.18, GUNMETAL, hull, [0, 2.78, 3.5]);
  for (const x of [-0.6, -0.2, 0.2, 0.6]) glow(box(0.2, 0.06, 0.12, AMBER, hull, [x, 2.85, 3.5]), 1.4);
  // front: bumper, hazard, lamps, hooks
  box(2.9, 0.3, 0.3, GUNMETAL, hull, [0, 0.85, 4.8]);
  plane(2.7, 0.24, HAZARD, hull, [0, 0.85, 4.96], [0, 0, 1]);
  for (const s of [1, -1]) {
    glow(plane(0.6, 0.3, LAMP, hull, [s * 1.0, 1.3, 4.77], [0, 0, 1]), 1.3);
    box(0.7, 0.4, 0.08, BLACK, hull, [s * 1.0, 1.3, 4.74]);
    cyl(0.07, 0.07, 0.3, 6, ORANGE, hull, [s * 0.5, 0.75, 4.9], { dir: [0, 0, 1] });
  }
  box(1.5, 0.35, 0.1, GUNMETAL, hull, [0, 1.35, 4.78]); // grille
  for (let i = 0; i < 4; i++) box(1.4, 0.03, 0.04, STEEL_L, hull, [0, 1.25 + i * 0.09, 4.84]);
  // rear power module
  box(2.3, 1.0, 2.2, CAMO, hull, [0, 2.45, -3.45]);
  plane(1.5, 0.75, VENT, hull, [0, 2.45, -4.56], [0, 0, -1]);
  plane(1.6, 0.8, LABEL, hull, [0, 3.0, -3.45], [0, 1, 0], { up: [0, 0, 1] });
  for (const s of [1, -1]) {
    cyl(0.14, 0.14, 1.2, 8, GUNMETAL, hull, [s * 1.05, 3.3, -4.15]);
    cyl(0.19, 0.14, 0.12, 8, BLACK, hull, [s * 1.05, 3.95, -4.15]);
    plane(0.9, 0.9, ROUNDEL, hull, [s * 1.26, 1.1, 1.0], [s, 0, 0]);
    plane(0.9, 0.9, ROUNDEL, hull, [s * 1.26, 2.45, -3.45 + 0.0], [s, 0, 0]);
    // tool boxes between wheels
    for (const z of [1.4, -1.4]) {
      box(0.35, 0.5, 1.2, OLIVE_M, hull, [s * 1.58, 1.15, z]);
      box(0.06, 0.1, 0.5, STEEL, hull, [s * 1.77, 1.2, z]);
    }
  }
  // rear bumper hazard
  box(2.8, 0.3, 0.2, GUNMETAL, hull, [0, 0.9, -4.7]);
  plane(2.6, 0.24, HAZARD, hull, [0, 0.9, -4.81], [0, 0, -1]);
  for (const s of [1, -1]) glow(box(0.3, 0.12, 0.06, RED, hull, [s * 1.1, 1.3, -4.65]), 1.3);

  // ---------- wheels & suspension ----------
  for (const { j, s, z } of wheels) {
    b.rod([s * 1.35, 1.0, z], [s * WX, WY, z], 0.13, STEEL, { bone: hull });
    b.rod([s * 1.4, 0.8, z + 0.3], [s * WX, WY, z], 0.07, GUNMETAL, { bone: hull });
    cyl(WR, WR, 0.55, 14, TIRE, j, [s * WX, WY, z], { dir: [1, 0, 0] });
    cyl(0.33, 0.33, 0.6, 10, GUNMETAL, j, [s * WX, WY, z], { dir: [1, 0, 0] });
    cyl(0.4, 0.4, 0.18, 10, STEEL, j, [s * (WX + 0.22), WY, z], { dir: [1, 0, 0] });
    cyl(0.16, 0.16, 0.26, 8, ORANGE, j, [s * (WX + 0.3), WY, z], { dir: [1, 0, 0] });
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      box(0.52, 0.1, 0.2, BLACK, j, [s * WX, WY + Math.cos(a) * (WR + 0.01), z + Math.sin(a) * (WR + 0.01)], {
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      cyl(0.04, 0.04, 0.08, 6, STEEL_L, j, [s * (WX + 0.32), WY + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3], {
        dir: [1, 0, 0],
      });
    }
    // fender + mud flap
    box(0.7, 0.1, 1.7, CAMO, hull, [s * WX, 1.42, z]);
    box(0.7, 0.3, 0.08, BLACK, hull, [s * WX, 1.2, z - 0.85]);
  }

  // ---------- stabiliser legs ----------
  for (const { j, s, z } of legs) {
    const ex = s * 2.75;
    box(0.5, 0.45, 0.5, GUNMETAL, j, [s * 1.45, 1.2, z]); // mount
    b.rod([s * 1.5, 1.2, z], [ex, 1.2, z], 0.17, CAMO, { bone: j }); // beam
    b.rod([s * 1.6, 0.85, z], [ex, 1.1, z], 0.07, STEEL, { bone: j }); // brace
    box(0.45, 0.45, 0.45, GUNMETAL, j, [ex, 1.2, z]);
    cyl(0.17, 0.17, 0.75, 8, ORANGE, j, [ex, 0.78, z]); // sleeve
    cyl(0.09, 0.09, 0.8, 8, STEEL_L, j, [ex, 0.42, z]); // piston
    cyl(0.5, 0.58, 0.14, 8, GUNMETAL, j, [ex, 0.07, z]); // pad
    cyl(0.4, 0.4, 0.04, 8, BLACK, j, [ex, 0.15, z]);
    box(0.12, 0.2, 0.42, HAZARD ? "#e8b21c" : ORANGE, j, [ex, 1.0, z + 0.0], { scale: [1, 1, 0.5] });
    glow(cyl(0.05, 0.05, 0.06, 6, CYAN, j, [ex, 1.46, z]), 1.5);
  }

  // ---------- turret ----------
  cyl(1.3, 1.4, 0.22, 12, GUNMETAL, hull, [0, 1.99, -1.0]); // ring
  cyl(1.5, 1.6, 0.9, 8, CAMO, turret, [0, 2.45, -1.0]);
  cyl(1.2, 1.3, 0.12, 8, DIRTY_STEEL, turret, [0, 2.96, -1.0]);
  for (const s of [1, -1]) {
    box(0.35, 1.1, 1.8, CAMO, turret, [s * 1.0, 3.0, -1.0]); // trunnion cheeks
    cyl(0.22, 0.22, 0.2, 8, STEEL, turret, [s * 1.2, 2.95, -1.0], { dir: [1, 0, 0] });
    // smoke dischargers
    for (let k = 0; k < 4; k++)
      cyl(0.07, 0.07, 0.38, 6, GUNMETAL, turret, [s * 1.55, 2.62 + k * 0.0, -0.4 - k * 0.2], {
        dir: [s * 0.7, 0.7, 0.0],
      });
    box(0.1, 0.35, 1.0, OLIVE_D, turret, [s * 1.65, 2.5, -0.8]);
    plane(0.55, 0.55, ROUNDEL, turret, [s * 1.7, 2.5, -1.3], [s, 0, 0]);
  }
  box(2.2, 0.8, 1.0, CAMO, turret, [0, 2.9, -2.35]); // counterweight / cap bank
  plane(1.4, 0.45, VENT, turret, [0, 2.9, -2.86], [0, 0, -1]);
  // sensor mast & radar
  b.rod([-0.9, 3.0, -1.9], [-0.9, 3.8, -1.9], 0.06, GUNMETAL, { bone: turret });
  b.lathe(
    [
      [0, 0],
      [0.38, 0.1],
      [0.4, 0.13],
      [0.34, 0.13],
      [0, 0.04],
    ],
    { at: [-0.9, 3.85, -1.9], axis: [0.3, 0.6, 0.75], bone: turret, color: STEEL_L, segments: 10 },
  );
  b.rod([-0.9, 3.85, -1.9], [-0.84, 3.97, -1.6], 0.025, STEEL, { bone: turret });
  b.rod([0.9, 3.0, -2.0], [0.9, 4.3, -2.0], 0.025, BLACK, { bone: turret }); // whip antenna
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), RED, { bone: turret, at: [0.9, 4.32, -2.0] }), 1.6);
  // optic pod
  box(0.5, 0.4, 0.5, GUNMETAL, turret, [0.7, 3.4, -0.2]);
  glow(cyl(0.12, 0.12, 0.1, 8, CYAN, turret, [0.7, 3.4, 0.08], { dir: [0, 0, 1] }), 1.4);

  // ---------- railgun ----------
  const L0 = -1.8;
  const L1 = 6.2;
  const LEN = L1 - L0;
  for (const s of [1, -1]) {
    gbox(0.28, 0.4, LEN, L0, s * 0.38, 0, GUNPAINT);
    gbox(0.06, 0.08, LEN - 0.4, L0 + 0.2, s * 0.215, 0.1, STEEL_L); // rail face highlight
    gbox(0.12, 0.12, LEN - 1, L0 + 0.5, s * 0.55, 0.22, GUNMETAL); // outer conduit
  }
  glow(gbox(0.26, 0.05, LEN - 0.3, L0 + 0.2, 0, 0.03, CYAN), 1.6); // plasma channel
  gbox(0.5, 0.1, LEN - 0.2, L0 + 0.1, 0, -0.26, GUNMETAL); // underbeam
  // clamp bands with capacitor coils
  for (let i = 0; i < 8; i++) {
    const d = L0 + 0.6 + i * 0.95;
    gbox(1.28, 0.62, 0.22, d, 0, 0, CAMO);
    gbox(1.34, 0.1, 0.26, d, 0, 0.3, STEEL);
    gbox(1.34, 0.1, 0.26, d, 0, -0.3, STEEL);
    if (i % 2 === 0) glow(gbox(0.04, 0.5, 0.26, d - 0.0, 0.68, 0, CYAN), 1.4);
    if (i % 2 === 1) glow(gbox(0.04, 0.5, 0.26, d, -0.68, 0, CYAN), 1.4);
  }
  // capacitor drums on flanks
  for (const s of [1, -1]) {
    gcyl(0.26, 1.7, L0 + 0.1, s * 0.9, -0.05, 8, s > 0 ? OLIVE : OLIVE_M);
    glow(gcyl(0.27, 0.12, L0 + 0.4, s * 0.9, -0.05, 8, CYAN), 1.2);
    glow(gcyl(0.27, 0.12, L0 + 1.3, s * 0.9, -0.05, 8, CYAN), 1.2);
    gbox(0.12, 0.12, 1.0, L0 + 0.5, s * 0.7, -0.05, GUNMETAL);
  }
  // breech block
  gbox(1.5, 0.9, 1.0, L0 - 0.1, 0, 0, CAMO);
  gbox(1.3, 0.1, 0.9, L0, 0, 0.5, DIRTY_STEEL);
  // muzzle: flared coil rings & brake
  for (let i = 0; i < 3; i++) glow(gcyl(0.55 - i * 0.04, 0.1, L1 - 0.5 - i * 0.28, 0, 0, 10, CYAN), 1.3);
  gbox(1.0, 0.7, 0.5, L1 - 0.1, 0, 0, GUNMETAL);
  gbox(1.1, 0.14, 0.4, L1 + 0.1, 0, 0.42, STEEL);
  gbox(1.1, 0.14, 0.4, L1 + 0.1, 0, -0.42, STEEL);
  for (const s of [1, -1]) gbox(0.12, 0.8, 0.35, L1 + 0.15, s * 0.58, 0, GUNMETAL);
  // gun-top ammo/slug rack hint and hazard
  plane(1.0, 0.25, HAZARD, gun, G(L0 + 0.5, 0, 0.46), U, { up: D });
  // hydraulic elevation rams
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 2.45, -1.9], G(0.0, s * 0.8, -0.4), 0.09, STEEL_L, { bone: turret });
    cyl(0.14, 0.14, 0.6, 8, ORANGE, turret, [s * 0.88, 2.65, -1.85], { dir: [0, 0.4, 0.5] });
  }

  return b.root;
}
```
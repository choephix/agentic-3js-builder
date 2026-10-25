```ts
/*
BUILD SHEET: "Wolfhound-77", militarized 6x6 truck, 2077
Proportions: ~8.7 m long (z), 3.7 m wide over the wheels (x), ~3.8 m tall to the turret roof, ~4.6 m to the mast tip.
 Main masses: cab/hood wedge 2.4 x 2.0 x 4.1 m; armored deck with two locker blocks 0.5 x 1.4 x 4.2 m;
 centre pedestal + turret 1.2 x 1.7 m; three axles with tyres 1.48 m dia, 0.6 m wide.
Parts: side-profile cab extrude, windshield + A-pillars, hood slats, ram plate + spikes, grille, headlights,
 roof light bar, sensor ball, dish, antennas, mirrors, doors, running boards, exhaust stacks,
 energy-cell tanks, 6 wheels (tyre, rim, glow hub, cap, 6 bolts), axles, diffs, springs, driveshaft,
 locker blocks with ERA tile checkerboard, vents, hatches, label plates, neon edges,
 pedestal, ring, wedge turret, twin barrels, sleeves, brakes, reticle, 2 missile pods (6 rockets each),
 drone pad and quad drone, rear panel, neon sign, tail lights, mast.
Palette: gunmetal camo #252b38 #303848 #1c212b #2a3a42 #3a3548 (hull patches), iron #14161d, steel #aab4c6,
 neon cyan #19f0ff, magenta #ff2bd6, amber #ffb020, red #ff2a3a, lime #b6ff3c, hazard yellow #f2b705,
 ERA olive #3b4a3f / #2e3b34, tyre #121216 / #26262d, glass #06141f.
Signature features: (1) plated, grimed camo paint with panel seams on every hull part; (2) glowing neon:
 hubs, cell tanks, underglow, edge strips, grille, lights, sign; (3) ERA tile checkerboard on lockers (merged boxes);
 (4) raised twin-barrel turret over the cab roof plus tilted missile pods; (5) hazard ram with spikes.
*/
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, svg, paint, patches, mix, resolve, noise, smoothstep } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Wolfhound-77 Militarized Truck",
  description: "Low-poly cyberpunk armored 6x6 war truck from 2077 with neon, ERA armor, twin turret and missile pods.",
};

type V = [number, number, number];
const DEG = Math.PI / 180;
const fract = (x: number) => x - Math.floor(x);

// ---------- palette ----------
const IRON = "#14161d", STEEL = "#aab4c6", DARK = "#0b0c11", HULL_B = "#1b1f2a", GUN = "#2a2f3c";
const CYAN = "#19f0ff", MAG = "#ff2bd6", AMBER = "#ffb020", RED = "#ff2a3a", LIME = "#b6ff3c", WHITE = "#e8fbff";
const ERA_A = "#3b4a3f", ERA_B = "#2e3b34";

// ---------- paints ----------
const grime = (base: any) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const m = smoothstep(1.7, 1.0, p.y) * (0.4 + 0.6 * noise(p, 0.25, 4));
    return mix(c, "#3a2f28", m * 0.7);
  });
const plated = (base: any, size: number) =>
  paint((p, n) => {
    const c = resolve(base, p, n);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = fract(u / size) * size;
    const dv = fract(v / (size * 0.6)) * size * 0.6;
    if (du < 0.018 || dv < 0.018) return mix(c, "#05060a", 0.85);
    if (du < 0.04 || dv < 0.04) return mix(c, "#9fb4d0", 0.15);
    const sh = 0.78 + 0.3 * smoothstep(-0.8, 0.8, n.y);
    return [c[0] * sh, c[1] * sh, c[2] * sh];
  });
const CAMO = patches("#252b38", ["#303848", "#1c212b", "#2a3a42", "#3a3548"], { size: 0.8, gap: 0.05, seed: 3 });
const HULL = plated(grime(CAMO), 0.6);
const HULL2 = plated(grime(patches("#1b1f2a", ["#222838", "#171a23"], { size: 0.6, gap: 0.04, seed: 8 })), 0.45);
const HAZARD = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.14) % 2 === 0 ? "#f2b705" : "#14141a"));
const RAM = paint((p, n) => (p.y < 0.95 ? resolve(HAZARD, p, n) : resolve(HULL, p, n)));
const TIRE = paint((_p, n, s) =>
  Math.abs(n.x) > 0.6 ? "#101114" : Math.floor(s[0] * 28) % 2 ? "#26262d" : "#121216",
);
const RIM = metal("steel", { tarnish: 0.4 });
const BLUED = metal("blued");
const BRASS = metal("brass", { tarnish: 0.6 });

// ---------- textures ----------
const WINDSHIELD = svg(
  `<svg viewBox="0 0 200 90"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a3a"/><stop offset="1" stop-color="#030a12"/></linearGradient></defs>
  <polygon points="8,0 192,0 200,90 0,90" fill="url(#g)" stroke="#05080c" stroke-width="5"/>
  <polygon points="30,0 60,0 30,90 0,90" fill="#7fe8ff" opacity="0.12"/><polygon points="90,0 105,0 75,90 60,90" fill="#7fe8ff" opacity="0.08"/>
  <path d="M20 70 H70 M130 70 H180 M100 62 V78 M86 70 H114" stroke="#19f0ff" stroke-width="1.6" opacity="0.7" fill="none"/>
  <circle cx="100" cy="70" r="9" fill="none" stroke="#19f0ff" stroke-width="1.4" opacity="0.7"/>
  <text x="14" y="16" font-family="monospace" font-size="8" fill="#19f0ff" opacity="0.8">VEL 087  HDG 214  T-2077</text></svg>`,
  { size: 384 },
);
const SIDEWIN = svg(
  `<svg viewBox="0 0 160 60"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0d3345"/><stop offset="1" stop-color="#03080e"/></linearGradient></defs>
  <polygon points="12,0 148,0 160,60 0,60" fill="url(#g)" stroke="#05080c" stroke-width="5"/>
  <polygon points="40,0 70,0 40,60 10,60" fill="#7fe8ff" opacity="0.12"/></svg>`,
  { size: 256 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><polygon points="50,4 92,28 92,72 50,96 8,72 8,28" fill="#0b0c11" stroke="#ff2bd6" stroke-width="5"/>
  <path d="M22 34 L50 20 L78 34 L50 46Z" fill="#19f0ff"/><path d="M26 42 L50 54 L74 42" stroke="#f2b705" stroke-width="5" fill="none"/>
  <text x="50" y="82" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#ffb020">77</text></svg>`,
  { size: 256 },
);
const CELL = svg(
  `<svg viewBox="0 0 100 40"><rect x="2" y="2" width="96" height="36" rx="5" fill="#04121a" stroke="#19f0ff" stroke-width="3"/>
  <rect x="9" y="9" width="14" height="22" fill="#19f0ff"/><rect x="27" y="9" width="14" height="22" fill="#19f0ff"/><rect x="45" y="9" width="14" height="22" fill="#b6ff3c"/>
  <rect x="63" y="9" width="14" height="22" fill="#b6ff3c"/><rect x="81" y="9" width="10" height="22" fill="#0a2a34"/></svg>`,
  { size: 192 },
);
const SIGN = svg(
  `<svg viewBox="0 0 140 50"><rect width="140" height="50" fill="#07030c"/><rect x="2" y="2" width="136" height="46" fill="none" stroke="#19f0ff" stroke-width="2.5"/>
  <text x="70" y="35" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="32" fill="#ff2bd6">2077</text>
  <path d="M10 44 H130" stroke="#19f0ff" stroke-width="2"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 120 26"><rect x="1" y="1" width="118" height="24" rx="3" fill="#d9d2b0" stroke="#14161d" stroke-width="2"/>
  <text x="60" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#14161d">ARC-WOLF 07</text></svg>`,
  { size: 256 },
);
const RETICLE = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#16060a"/><circle cx="32" cy="32" r="18" fill="none" stroke="#ff2a3a" stroke-width="3"/>
  <path d="M32 6 V22 M32 42 V58 M6 32 H22 M42 32 H58" stroke="#ff2a3a" stroke-width="3"/><circle cx="32" cy="32" r="3" fill="#ff2a3a"/></svg>`,
  { size: 128 },
);
const PAD = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#0a0d14" stroke="#b6ff3c" stroke-width="4"/>
  <circle cx="50" cy="50" r="36" fill="none" stroke="#b6ff3c" stroke-width="1.5" stroke-dasharray="6 4"/>
  <path d="M36 30 V70 M64 30 V70 M36 50 H64" stroke="#b6ff3c" stroke-width="7" fill="none"/></svg>`,
  { size: 192 },
);
const GRILLE = svg(
  `<svg viewBox="0 0 90 50"><rect width="90" height="50" rx="4" fill="#031a22"/><rect x="4" y="4" width="82" height="42" fill="#19f0ff" opacity="0.8"/>
  <path d="M10 10 L45 40 L80 10" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.6"/></svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "wolfhound77", paintSize: 2048 });

  // ---------- helpers ----------
  const box = (size: V, color: any, at: V, rot?: V) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, rot ? { at, rotation: rot } : { at });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: V, dir: V = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, dir });
  const ball = (r: number, color: any, at: V, w = 8, h = 6) =>
    b.part(new THREE.SphereGeometry(r, w, h), color, { at });
  const plane = (tex: THREE.Texture, w: number, h: number, at: V, dir: V, up?: V, color = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), color, { at, dir, axis: "z", up, texture: tex });
  const gl = <T,>(p: T, s = 1.4): T => glow(p as any, s) as T;
  const merged = (geos: THREE.BufferGeometry[], color: any) =>
    b.part(mergeGeometries(geos)!, color, { at: [0, 0, 0] });

  // ---------- chassis, axles, wheels ----------
  box([1.9, 0.35, 8.2], GUN, [0, 1.0, -0.15]);
  box([1.4, 0.2, 8.0], IRON, [0, 0.82, -0.15]);
  b.rod([0, 0.8, -2.7], [0, 0.8, 2.7], 0.08, STEEL);
  gl(box([0.08, 0.05, 6.4], MAG, [0.8, 0.55, 0.2]), 1.5);
  gl(box([0.08, 0.05, 6.4], MAG, [-0.8, 0.55, 0.2]), 1.5);
  const R = 0.74, WY = 0.7;
  const wheel = (s: number, z: number) => {
    const cx = s * 1.5;
    cyl(R, R, 0.6, 12, TIRE, [cx, WY, z], [1, 0, 0]);
    cyl(0.46, 0.46, 0.64, 8, RIM, [cx, WY, z], [1, 0, 0]);
    gl(cyl(0.28, 0.28, 0.68, 8, CYAN, [cx, WY, z], [1, 0, 0]), 1.5);
    cyl(0.14, 0.14, 0.72, 6, DARK, [cx, WY, z], [1, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.035, 0.035, 0.1, 5, STEEL, [s * 1.83, WY + 0.37 * Math.cos(a), z + 0.37 * Math.sin(a)], [1, 0, 0]);
    }
  };
  for (const z of [2.7, -1.1, -2.7]) {
    b.rod([-1.5, WY, z], [1.5, WY, z], 0.1, IRON);
    ball(0.26, BLUED, [0, WY, z]);
    for (const s of [1, -1]) {
      box([0.2, 0.1, 1.1], STEEL, [s * 0.8, 0.98, z]);
      wheel(s, z);
      box([0.8, 0.1, 1.9], GUN, [s * 1.5, 1.52, z]);
      box([0.8, 0.22, 0.12], GUN, [s * 1.5, 1.4, z + 0.95], [-30, 0, 0]);
    }
  }
  for (const s of [1, -1]) for (const z of [-3.55]) box([0.6, 0.5, 0.05], DARK, [s * 1.5, 0.6, z]);

  // ---------- cab + hood (one side-profile extrude) ----------
  const cabProfile: [number, number][] = [
    [4.0, 1.2], [4.0, 1.9], [3.4, 2.15], [2.4, 2.35], [1.6, 3.15], [0.3, 3.15], [0.1, 2.2], [0.1, 1.2],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: HULL });
  // windshield, pillars, visor
  plane(WINDSHIELD, 2.1, 1.1, [0, 2.764, 2.014], [0, 0.707, 0.707]);
  for (const s of [1, -1]) {
    b.rod([s * 1.12, 2.35, 2.4], [s * 1.12, 3.15, 1.6], 0.06, HULL_B);
    plane(SIDEWIN, 1.6, 0.6, [s * 1.215, 2.75, 1.05], [s, 0, 0]);
    plane(EMBLEM, 0.6, 0.6, [s * 1.215, 1.85, 1.4], [s, 0, 0]);
    // door seams + handles
    for (const z of [0.25, 2.05]) box([0.02, 1.3, 0.03], DARK, [s * 1.2, 1.85, z]);
    box([0.02, 0.03, 1.8], DARK, [s * 1.2, 2.5, 1.15]);
    box([0.06, 0.05, 0.22], STEEL, [s * 1.22, 2.2, 0.55]);
    gl(box([0.02, 0.04, 1.8], CYAN, [s * 1.21, 1.28, 1.1]), 1.4);
    // running board
    box([0.35, 0.08, 1.7], GUN, [s * 1.4, 1.28, 1.05]);
    // mirrors
    b.rod([s * 1.2, 2.5, 2.25], [s * 1.55, 2.65, 2.4], 0.03, STEEL);
    box([0.08, 0.4, 0.22], HULL_B, [s * 1.6, 2.65, 2.4]);
    gl(box([0.02, 0.06, 0.06], LIME), 1.2).position; // placeholder removed below
  }
  box([2.4, 0.08, 0.3], HULL_B, [0, 3.19, 1.55]);
  box([2.3, 0.1, 1.2], GUN, [0, 3.2, 0.85]);

  // hood slats, vents and spine
  for (let i = 0; i < 5; i++) {
    const z = 3.3 - 0.18 * i;
    const y = 2.15 + (3.4 - z) * 0.2 + 0.03;
    for (const s of [1, -1]) box([0.8, 0.05, 0.09], DARK, [s * 0.6, y, z], [11.3, 0, 0]);
  }
  gl(box([0.05, 0.03, 0.9], MAG, [0, 2.31, 3.0], [11.3, 0, 0]), 1.5);
  for (const s of [1, -1]) box([0.12, 0.1, 1.1], HULL_B, [s * 1.15, 2.3, 3.0], [11.3, 0, 0]);

  // nose: grille, headlights
  plane(GRILLE, 0.9, 0.5, [0, 1.55, 4.012], [0, 0, 1]);
  for (let i = -3; i <= 3; i++) box([0.03, 0.46, 0.05], IRON, [i * 0.11, 1.55, 4.04]);
  for (const s of [1, -1]) {
    gl(box([0.62, 0.12, 0.06], WHITE, [s * 0.88, 1.68, 4.03]), 1.8);
    box([0.7, 0.04, 0.08], DARK, [s * 0.88, 1.78, 4.04]);
    box([0.7, 0.04, 0.08], DARK, [s * 0.88, 1.58, 4.04]);
    gl(box([0.2, 0.08, 0.05], AMBER, [s * 1.12, 1.4, 4.03]), 1.4);
    // roof spotlights
    cyl(0.07, 0.09, 0.14, 6, STEEL, [s * 0.9, 3.28, 1.7], [0, 0.3, 1]);
    gl(cyl(0.06, 0.06, 0.02, 6, WHITE, [s * 0.9, 3.3, 1.78], [0, 0.3, 1]), 2);
  }
  // ram plate + spikes
  b.extrude(
    [[-1.45, 0.5], [1.45, 0.5], [1.3, 1.35], [0, 1.55], [-1.3, 1.35]],
    { at: [0, 0, 4.1], x: [1, 0, 0], thickness: 0.22, color: RAM },
  );
  for (let i = -2; i <= 2; i++) b.spike([i * 0.55, 1.2, 4.2], [0, 0.1, 1], 0.45, 0.09, { color: "#c9ced8", sides: 5 } as any);

  // roof gear
  box([1.8, 0.12, 0.25], IRON, [0, 3.3, 1.2]);
  const bars = [RED, CYAN, AMBER, MAG, AMBER, CYAN, RED];
  bars.forEach((c, i) => gl(box([0.2, 0.1, 0.27], c, [-0.78 + i * 0.26, 3.34, 1.2]), 1.6));
  ball(0.18, HULL_B, [0.85, 3.3, 0.7], 8, 6);
  gl(ball(0.07, RED, [0.85, 3.34, 0.88], 6, 4), 2);
  b.lathe(
    [[0, 0], [0.4, 0.16], [0.42, 0.16], [0.42, 0.14], [0.02, -0.03], [0, -0.03]],
    { at: [-0.85, 3.3, 0.6], axis: [0, 0.6, 0.8], segments: 10, color: STEEL },
  );
  b.rod([-0.85, 3.3, 0.6], [-0.85, 3.5, 0.78], 0.025, IRON);
  gl(ball(0.04, LIME, [-0.85, 3.52, 0.8], 5, 4), 2);
  for (const s of [1, -1]) {
    b.rod([s * 1.05, 3.15, 0.25], [s * 1.12, 4.45, 0.1], 0.02, IRON);
    gl(ball(0.045, RED, [s * 1.12, 4.47, 0.1], 5, 4), 2);
  }

  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.09, 0.09, 1.8, 8, BRASS, [s * 1.36, 2.5, -0.35]);
    box([0.05, 0.9, 0.3], IRON, [s * 1.43, 2.1, -0.35]);
    for (const y of [1.9, 2.6, 3.2]) cyl(0.115, 0.115, 0.06, 8, STEEL, [s * 1.36, y, -0.35]);
    gl(cyl(0.08, 0.08, 0.05, 8, AMBER, [s * 1.36, 3.4, -0.35]), 1.8);
  }

  // energy cell tanks between axles
  for (const s of [1, -1]) {
    box([0.4, 0.6, 1.6], HULL2, [s * 1.35, 0.95, 0.8]);
    gl(plane(CELL, 1.3, 0.45, [s * 1.552, 0.95, 0.8], [s, 0, 0]), 1.3);
    box([0.1, 0.7, 0.1], STEEL, [s * 1.35, 0.95, 1.65]);
    box([0.1, 0.7, 0.1], STEEL, [s * 1.35, 0.95, -0.05]);
  }

  // ---------- armored deck ----------
  box([2.5, 0.3, 4.4], HULL2, [0, 1.35, -2.2]);
  const lockerProfile: [number, number][] = [
    [-0.1, 1.5], [-0.1, 2.6], [-0.5, 2.9], [-3.6, 2.9], [-4.2, 2.4], [-4.2, 1.5],
  ];
  for (const s of [1, -1]) {
    b.extrude(lockerProfile, { at: [s * 0.95, 0, 0], x: [0, 0, 1], thickness: 0.5, color: HULL });
    gl(box([0.03, 0.04, 3.1], MAG, [s * 1.21, 2.86, -2.0]), 1.5);
    plane(PLATE, 0.9, 0.2, [s * 1.216, 2.62, -2.0], [s, 0, 0]);
    // vent grills + hatches on top
    for (let i = 0; i < 6; i++) box([0.4, 0.03, 0.06], DARK, [s * 0.95, 2.92, -0.8 - i * 0.14]);
    box([0.42, 0.05, 0.6], GUN, [s * 0.95, 2.93, -1.9]);
    box([0.1, 0.08, 0.06], STEEL, [s * 0.95, 2.98, -1.9]);
    // missile pod
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-25 * DEG, 0, 0));
    const c = new THREE.Vector3(s * 0.95, 3.28, -3.1);
    const d = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
    b.part(new THREE.BoxGeometry(0.5, 0.5, 1.3), HULL2, { at: c.toArray() as V, quat: q });
    box([0.4, 0.3, 0.8], IRON, [s * 0.95, 3.02, -3.3]);
    for (let ix = 0; ix < 2; ix++)
      for (let iy = 0; iy < 3; iy++) {
        const lp = new THREE.Vector3((ix - 0.5) * 0.22, (iy - 1) * 0.14, 0.66).applyQuaternion(q).add(c);
        b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), DARK, { at: lp.toArray() as V, dir: d.toArray() as V });
        const tp = lp.clone().addScaledVector(d, 0.1);
        b.part(new THREE.ConeGeometry(0.055, 0.2, 6), (ix + iy) % 2 ? "#e8e8ee" : RED, { at: tp.toArray() as V, dir: d.toArray() as V });
      }
  }
  // ERA tile checkerboard
  const eraA: THREE.BufferGeometry[] = [], eraB: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let zi = 0; zi < 12; zi++)
      for (let yi = 0; yi < 3; yi++)
        ((zi + yi) % 2 ? eraA : eraB).push(
          new THREE.BoxGeometry(0.05, 0.2, 0.25).translate(s * 1.225, 1.72 + yi * 0.25, -0.65 - zi * 0.3),
        );
  merged(eraA, ERA_A);
  merged(eraB, ERA_B);
  // rivets on deck edge
  const rivets: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 14; i++)
    for (const s of [1, -1]) rivets.push(new THREE.SphereGeometry(0.03, 5, 4).translate(s * 1.27, 1.5, -0.2 - i * 0.3));
  merged(rivets, STEEL);

  // ---------- turret ----------
  const TZ = -1.7;
  cyl(0.6, 0.6, 1.4, 8, HULL2, [0, 2.2, TZ]);
  cyl(0.7, 0.7, 0.12, 12, RIM, [0, 2.95, TZ]);
  gl(cyl(0.72, 0.72, 0.03, 12, CYAN, [0, 2.87, TZ]), 1.5);
  b.extrude(
    [[-0.55, 0], [-0.55, 0.5], [-0.2, 0.75], [0.35, 0.75], [0.7, 0.45], [0.7, 0]],
    { at: [0, 3.01, TZ], x: [0, 0, 1], thickness: 1.1, color: HULL },
  );
  plane(RETICLE, 0.3, 0.3, [0, 3.01 + 0.58, TZ + 0.56], [0, 0.76, 0.65]);
  gl(box([0.04, 0.04, 0.04], RED, [0, 3.9, TZ - 0.1]), 2);
  for (const s of [1, -1]) {
    b.rod([s * 0.28, 3.4, TZ + 0.6], [s * 0.28, 3.4, 1.6], 0.07, STEEL);
    b.rod([s * 0.28, 3.4, TZ + 0.65], [s * 0.28, 3.4, -0.2], 0.11, GUN);
    box([0.2, 0.2, 0.3], IRON, [s * 0.28, 3.4, 1.7]);
    gl(box([0.04, 0.12, 0.05], AMBER, [s * 0.28, 3.4, 1.86]), 1.6);
    box([0.14, 0.34, 0.5], GUN, [s * 0.28, 3.4, TZ + 0.5]);
    box([0.22, 0.5, 0.5], HULL_B, [s * 0.66, 3.35, TZ - 0.1]);
    for (let i = 0; i < 3; i++) box([0.24, 0.03, 0.4], DARK, [s * 0.66, 3.2 + i * 0.1, TZ - 0.1]);
  }
  gl(box([1.1, 0.03, 0.03], MAG, [0, 3.03, TZ - 0.56]), 1.5);

  // ---------- drone pad + drone ----------
  plane(PAD, 1.4, 1.4, [0, 1.505, -3.4], [0, 1, 0], [0, 0, 1]);
  const DZ = -3.4;
  box([0.3, 0.07, 0.3], GUN, [0, 1.62, DZ]);
  ball(0.06, CYAN, [0, 1.55, DZ]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([0, 1.62, DZ], [sx * 0.28, 1.64, DZ + sz * 0.28], 0.018, IRON);
      cyl(0.13, 0.13, 0.015, 8, "#7fb8c8", [sx * 0.28, 1.68, DZ + sz * 0.28]);
    }
  gl(ball(0.04, LIME, [0, 1.6, DZ + 0.16], 5, 4), 2);

  // ---------- rear ----------
  box([2.4, 0.9, 0.12], HULL, [0, 1.95, -4.34]);
  box([2.6, 0.35, 0.3], HAZARD, [0, 1.3, -4.5]);
  gl(plane(SIGN, 1.3, 0.47, [0, 2.05, -4.41], [0, 0, -1]), 1.3);
  for (const s of [1, -1]) gl(box([0.35, 0.5, 0.05], RED, [s * 1.0, 1.95, -4.42]), 1.6);
  box([0.2, 0.2, 0.3], IRON, [0, 1.15, -4.65]);
  // sensor mast
  b.rod([-1.0, 2.9, -4.1], [-1.0, 4.35, -4.1], 0.035, STEEL);
  box([0.5, 0.04, 0.04], STEEL, [-1.0, 4.0, -4.1]);
  box([0.04, 0.3, 0.04], STEEL, [-1.0, 3.7, -4.1]);
  gl(ball(0.06, CYAN, [-1.0, 4.4, -4.1], 5, 4), 2);
  gl(ball(0.05, MAG, [-0.75, 4.0, -4.1], 5, 4), 2);
  gl(ball(0.05, MAG, [-1.25, 4.0, -4.1], 5, 4), 2);

  return b.root;
}
```
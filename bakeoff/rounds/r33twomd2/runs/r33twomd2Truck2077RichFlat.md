```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wraith-7 Armored Hauler 2077",
  description:
    "Low-poly cyberpunk militarized 6x6 truck: wedge-armored cab, plated cargo module with neon trim, roof RCWS turret, missile pods, plow bumper and glowing wheels.",
};

type V = [number, number, number];

// ---- palette -------------------------------------------------------------
const HULL = "#2f363e";
const HULL_L = "#4a5560";
const OLIVE = "#3b4a3c";
const OLIVE_D = "#2a352c";
const CAMO_A = "#222a2d";
const CAMO_B = "#46513f";
const CAMO_C = "#55604f";
const DARK = "#12151a";
const RUBBER = "#17191d";
const STEEL = "#8a949e";
const STEEL_D = "#566069";
const YEL = "#f2c21b";
const CYAN = "#27f2ff";
const MAG = "#ff2fd0";
const RED = "#ff2a3a";
const AMBER = "#ffa81f";
const GLASS = "#0c2a3a";
const TAU = Math.PI * 2;

export default function build() {
  const b = createBuilder({ name: "truck2077" });

  // ---- helpers -----------------------------------------------------------
  const box = (size: V, color: string, at: V, rotation?: V) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation });
  const cylX = (r: number, h: number, seg: number, color: string, at: V) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, rotation: [0, 0, 90], flat: true });
  const cylY = (r0: number, r1: number, h: number, seg: number, color: string, at: V) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { at, flat: true });
  const cylZ = (r: number, len: number, seg: number, color: string, at: V, tilt = 0) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, rotation: [90 + tilt, 0, 0], flat: true });
  const G = <T,>(p: T, k = 1.3): T => glow(p as never, k) as T;
  // point in a frame tilted about X by deg around centre c
  const tp = (c: V, l: V, deg: number): V => {
    const a = (deg * Math.PI) / 180;
    return [c[0] + l[0], c[1] + l[1] * Math.cos(a) - l[2] * Math.sin(a), c[2] + l[1] * Math.sin(a) + l[2] * Math.cos(a)];
  };

  const plating = panelled("#38414a", { size: 0.55, rivets: 0.1 });
  const cabPlating = panelled("#323a43", { size: 0.5, rivets: 0.09 });

  // ---- chassis -----------------------------------------------------------
  box([1.9, 0.7, 7.4], DARK, [0, 0.95, -0.2]);
  box([1.5, 0.12, 7.0], HULL, [0, 0.58, -0.2]);
  // rails
  for (const s of [1, -1]) {
    box([0.12, 0.3, 7.2], HULL_L, [s * 0.9, 0.95, -0.2]);
    G(box([0.06, 0.05, 6.4], MAG, [s * 0.95, 0.58, -0.2]), 1.6); // underglow
  }
  // cross members + driveshaft + diffs
  for (const z of [-3.2, -1.65, 0.1, 2.9]) box([1.7, 0.16, 0.14], STEEL_D, [0, 0.55, z]);
  cylZ(0.07, 5.6, 8, STEEL_D, [0, 0.72, -0.5]);
  for (const z of [2.2, -0.9, -2.4]) {
    cylX(0.09, 2.9, 8, STEEL_D, [0, 0.62, z]);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), HULL_L, { at: [0, 0.62, z], flat: true });
  }

  // ---- wheels ------------------------------------------------------------
  const R = 0.62;
  const wheel = (s: number, z: number) => {
    const cx = s * 1.3;
    const cy = R;
    cylX(R, 0.55, 14, RUBBER, [cx, cy, z]);
    for (let k = 0; k < 12; k++) {
      const a = (k * 30 * Math.PI) / 180;
      box([0.5, 0.07, 0.14], "#0d0f12", [cx, cy + (R + 0.01) * Math.cos(a), z + (R + 0.01) * Math.sin(a)], [k * 30, 0, 0]);
    }
    cylX(0.42, 0.57, 12, STEEL_D, [cx, cy, z]);
    G(cylX(0.35, 0.59, 12, CYAN, [cx, cy, z]), 1.5);
    cylX(0.3, 0.61, 12, DARK, [cx, cy, z]);
    cylX(0.12, 0.68, 8, STEEL, [cx, cy, z]);
    for (let k = 0; k < 6; k++) {
      const a = (k * 60 * Math.PI) / 180;
      cylX(0.028, 0.7, 6, YEL, [cx, cy + 0.2 * Math.cos(a), z + 0.2 * Math.sin(a)]);
    }
    // brake caliper inside
    box([0.12, 0.2, 0.3], RED, [s * 1.05, cy + 0.3, z + 0.05]);
  };
  for (const z of [2.2, -0.9, -2.4]) for (const s of [1, -1]) wheel(s, z);

  // fenders
  for (const [zc, len] of [
    [2.2, 1.5],
    [-1.65, 3.1],
  ] as [number, number][]) {
    for (const s of [1, -1]) {
      box([0.8, 0.1, len], HULL, [s * 1.3, 1.4, zc]);
      box([0.08, 0.3, len], HULL_L, [s * 1.68, 1.25, zc]);
      box([0.04, 0.05, len - 0.1], YEL, [s * 1.72, 1.4, zc]);
      G(box([0.03, 0.04, len - 0.4], CYAN, [s * 1.72, 1.2, zc]), 1.4);
    }
  }
  // mudflaps
  for (const [s, z] of [
    [1, -3.12],
    [-1, -3.12],
    [1, 1.62],
    [-1, 1.62],
  ] as [number, number][]) {
    box([0.6, 0.5, 0.04], DARK, [s * 1.3, 0.5, z]);
    box([0.5, 0.06, 0.05], YEL, [s * 1.3, 0.34, z]);
  }

  // ---- fuel / cell tanks -------------------------------------------------
  for (const s of [1, -1]) {
    cylZ(0.3, 1.2, 10, STEEL_D, [s * 1.2, 0.85, 0.65]);
    for (const z of [0.25, 0.65, 1.05]) cylZ(0.315, 0.06, 10, DARK, [s * 1.2, 0.85, z]);
    G(box([0.03, 0.1, 0.8], CYAN, [s * 1.505, 0.9, 0.65]), 1.4);
    box([0.1, 0.08, 1.1], HULL_L, [s * 1.08, 1.17, 0.65]);
  }

  // ---- cab ---------------------------------------------------------------
  const cabOutline: [number, number][] = [
    [0.9, 1.3],
    [0.9, 3.0],
    [1.9, 3.1],
    [2.55, 2.4],
    [3.3, 2.25],
    [3.5, 2.05],
    [3.5, 1.45],
    [3.3, 1.3],
  ];
  b.extrude(cabOutline, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: cabPlating });

  // windshield
  box([2.0, 0.92, 0.04], GLASS, [0, 2.745, 2.248], [-41, 0, 0]);
  for (const s of [1, -1]) box([0.09, 0.98, 0.07], DARK, [s * 1.04, 2.75, 2.25], [-41, 0, 0]);
  box([2.1, 0.08, 0.07], DARK, [0, 2.4, 2.58], [-41, 0, 0]);
  // HUD glow strip behind glass
  G(box([1.4, 0.03, 0.03], CYAN, [0, 2.5, 2.47], [-41, 0, 0]), 1.2);
  // visor
  box([2.3, 0.06, 0.4], HULL_L, [0, 3.13, 2.05], [-12, 0, 0]);
  box([2.3, 0.04, 0.05], YEL, [0, 3.09, 2.2], [-12, 0, 0]);

  // hood
  for (const s of [1, -1]) {
    box([0.5, 0.03, 0.42], DARK, [s * 0.6, 2.335, 2.95], [11, 0, 0]);
    for (let k = 0; k < 4; k++) G(box([0.46, 0.012, 0.02], AMBER, [s * 0.6, 2.355 + 0, 2.8 + k * 0.1], [11, 0, 0]), 1.0);
  }
  box([0.06, 0.04, 0.9], HULL_L, [0, 2.35, 2.9], [11, 0, 0]);

  // grille & headlamps
  box([1.2, 0.5, 0.06], DARK, [0, 1.75, 3.51]);
  for (let k = 0; k < 5; k++) G(box([1.05, 0.03, 0.02], MAG, [0, 1.56 + k * 0.09, 3.545]), 1.5);
  for (const s of [1, -1]) {
    box([0.62, 0.22, 0.08], HULL_L, [s * 1.0, 1.85, 3.5]);
    G(box([0.52, 0.12, 0.05], CYAN, [s * 1.0, 1.85, 3.54]), 1.8);
    G(box([0.3, 0.04, 0.05], MAG, [s * 1.0, 1.68, 3.54]), 1.5);
    G(box([0.1, 0.1, 0.06], AMBER, [s * 1.08, 1.5, 3.54]), 1.6);
    // armored brow
    box([0.66, 0.06, 0.12], HULL_L, [s * 1.0, 2.0, 3.48], [-20, 0, 0]);
  }
  // chin vents
  box([2.0, 0.1, 0.08], DARK, [0, 1.38, 3.45]);

  // cab sides
  for (const s of [1, -1]) {
    // side window
    box([0.04, 0.6, 1.0], GLASS, [s * 1.16, 2.55, 1.75]);
    box([0.05, 0.05, 1.08], DARK, [s * 1.16, 2.87, 1.75]);
    // door plate + seams + handle
    box([0.03, 0.82, 1.2], OLIVE, [s * 1.165, 1.8, 1.7]);
    box([0.04, 0.84, 0.03], DARK, [s * 1.18, 1.8, 1.1]);
    box([0.04, 0.84, 0.03], DARK, [s * 1.18, 1.8, 2.3]);
    box([0.05, 0.1, 0.22], STEEL, [s * 1.19, 2.0, 2.15]);
    box([0.05, 0.03, 0.9], YEL, [s * 1.18, 1.43, 1.7]);
    // step
    box([0.35, 0.06, 0.7], STEEL_D, [s * 1.2, 1.05, 1.2]);
    // mirror
    box([0.35, 0.05, 0.05], DARK, [s * 1.33, 2.55, 2.4]);
    box([0.08, 0.42, 0.22], HULL_L, [s * 1.52, 2.5, 2.4]);
    G(box([0.02, 0.3, 0.14], CYAN, [s * 1.565, 2.5, 2.42]), 1.0);
    // side armor wedge in front of door
    box([0.06, 0.6, 0.55], HULL_L, [s * 1.18, 2.0, 2.65], [0, 0, 0]);
    // air intake
    box([0.05, 0.5, 0.25], DARK, [s * 1.17, 1.8, 2.95]);
    for (let k = 0; k < 4; k++) box([0.06, 0.4, 0.015], STEEL_D, [s * 1.2, 1.8, 2.87 + k * 0.06]);
    // exhaust stack
    cylY(0.1, 0.1, 2.2, 8, STEEL, [s * 1.02, 2.4, 0.72]);
    for (const y of [1.6, 2.2, 2.8]) cylY(0.125, 0.125, 0.07, 8, DARK, [s * 1.02, y, 0.72]);
    cylY(0.12, 0.08, 0.14, 8, DARK, [s * 1.02, 3.5, 0.72]);
    G(cylY(0.06, 0.06, 0.03, 8, AMBER, [s * 1.02, 3.58, 0.72]), 1.6);
    box([0.04, 1.2, 0.3], HULL_L, [s * 1.14, 2.3, 0.72]); // heat shield
  }

  // cab number/emblem decals
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,6 90,28 90,72 50,94 10,72 10,28" fill="none" stroke="#27f2ff" stroke-width="7"/>
      <polygon points="50,24 74,66 26,66" fill="#ff2fd0"/>
      <rect x="46" y="38" width="8" height="16" fill="#12151a"/>
      <rect x="46" y="58" width="8" height="6" fill="#12151a"/>
    </svg>`,
    { size: 256 },
  );
  const UNIT = svg(
    `<svg viewBox="0 0 220 60" xmlns="http://www.w3.org/2000/svg">
      <text x="110" y="46" font-size="46" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#ff2fd0">NX-2077</text>
    </svg>`,
    { size: 512 },
  );
  const CODE = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <text x="60" y="32" font-size="30" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#27f2ff">WR-07</text>
    </svg>`,
    { size: 384 },
  );
  for (const s of [1, -1]) {
    G(
      b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
        at: [s * 1.2, 1.85, 1.35],
        dir: [s, 0, 0],
        axis: "z",
        texture: EMBLEM,
      }),
      1.2,
    );
    G(
      b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", {
        at: [s * 1.2, 1.55, 1.85],
        dir: [s, 0, 0],
        axis: "z",
        texture: CODE,
      }),
      1.1,
    );
  }

  // roof gear
  box([1.5, 0.1, 0.2], DARK, [0, 3.18, 1.45]);
  for (let k = 0; k < 6; k++) G(box([0.2, 0.08, 0.16], k % 2 ? MAG : CYAN, [-0.6 + k * 0.24, 3.24, 1.45]), 1.7);
  b.lathe(
    [
      [0, 0],
      [0.15, 0],
      [0.15, 0.1],
      [0.09, 0.22],
      [0, 0.25],
    ],
    { at: [0.75, 3.1, 1.1], color: HULL_L, segments: 8 },
  );
  G(cylY(0.155, 0.155, 0.03, 8, CYAN, [0.75, 3.2, 1.1]), 1.5);
  // radar dish
  cylY(0.04, 0.05, 0.3, 6, STEEL_D, [-0.6, 3.25, 1.2]);
  b.part(new THREE.SphereGeometry(0.3, 10, 5, 0, TAU, 0, Math.PI / 2), STEEL, {
    at: [-0.6, 3.45, 1.2],
    rotation: [55, 0, 0],
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), STEEL_D, {
    at: tp([-0.6, 3.45, 1.2], [0, 0.15, 0], 55),
    rotation: [55, 0, 0],
  });
  // antennas
  cylY(0.012, 0.02, 1.0, 5, DARK, [-0.95, 3.6, 1.0]);
  G(b.part(new THREE.SphereGeometry(0.03, 6, 4), RED, { at: [-0.95, 4.12, 1.0] }), 2);
  cylY(0.01, 0.015, 0.7, 5, DARK, [0.95, 3.45, 1.0]);
  box([0.2, 0.02, 0.02], DARK, [0.95, 3.7, 1.0]);

  // ---- plow bumper -------------------------------------------------------
  const plow: [number, number][] = [
    [3.3, 0.6],
    [3.95, 0.8],
    [3.95, 1.2],
    [3.5, 1.4],
    [3.3, 1.3],
  ];
  b.extrude(plow, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.04, color: HULL_L });
  for (let k = 0; k < 8; k++)
    box([0.14, 0.42, 0.03], YEL, [-0.98 + k * 0.28, 0.98, 3.965], [0, 0, 30]);
  box([2.3, 0.05, 0.05], DARK, [0, 1.24, 3.96]);
  for (const s of [1, -1]) {
    G(box([0.3, 0.07, 0.05], AMBER, [s * 0.8, 1.12, 3.97]), 1.7);
    box([0.05, 0.4, 0.3], STEEL_D, [s * 1.23, 1.0, 3.7]); // ram tusks
    b.spike([s * 1.22, 1.05, 3.9], [0, 0, 1], 0.35, 0.07, { color: STEEL });
  }
  // winch
  cylX(0.12, 1.0, 8, DARK, [0, 1.43, 3.7]);
  cylX(0.15, 0.08, 8, STEEL_D, [0.5, 1.43, 3.7]);
  cylX(0.15, 0.08, 8, STEEL_D, [-0.5, 1.43, 3.7]);
  box([0.18, 0.12, 0.1], YEL, [0, 1.43, 3.84]);

  // ---- hitch plate between cab and module --------------------------------
  box([2.0, 0.9, 0.5], DARK, [0, 1.75, 0.7]);
  box([1.9, 0.06, 0.6], STEEL_D, [0, 1.25, 0.7]);

  // ---- cargo module ------------------------------------------------------
  const mod: [number, number][] = [
    [-1.15, 1.3],
    [1.15, 1.3],
    [1.15, 2.5],
    [0.95, 2.85],
    [-0.95, 2.85],
    [-1.15, 2.5],
  ];
  b.extrude(mod, { at: [0, 0, -1.5], x: [1, 0, 0], thickness: 4.0, color: plating });

  // digital camo patches
  const rand = rng(77);
  const camo = [CAMO_A, CAMO_B, CAMO_C];
  for (const s of [1, -1]) {
    for (let i = 0; i < 28; i++) {
      const w = 0.25 + rand() * 0.45;
      const h = 0.18 + rand() * 0.3;
      const z = -3.3 + rand() * 3.5;
      const y = 1.45 + rand() * 0.9;
      box([0.02, h, w], camo[Math.floor(rand() * 3)], [s * 1.153, y, z]);
    }
  }
  // top camo
  for (let i = 0; i < 12; i++) {
    const x = -0.7 + rand() * 1.4;
    const z = -3.3 + rand() * 3.5;
    box([0.25 + rand() * 0.4, 0.015, 0.25 + rand() * 0.4], camo[Math.floor(rand() * 3)], [x, 2.858, z]);
  }

  for (const s of [1, -1]) {
    // armor plates in 4 bays + ribs
    for (let i = 0; i < 4; i++) {
      const z = -3.0 + i * 0.95;
      box([0.04, 0.72, 0.8], i % 2 ? OLIVE : OLIVE_D, [s * 1.175, 1.75, z]);
      box([0.045, 0.04, 0.82], YEL, [s * 1.18, 1.37, z]);
      G(box([0.03, 0.04, 0.6], i % 2 ? MAG : CYAN, [s * 1.2, 2.18, z]), 1.5);
      // bolts
      for (const dy of [-0.3, 0.3]) for (const dz of [-0.32, 0.32])
        cylX(0.025, 0.07, 5, STEEL, [s * 1.2, 1.75 + dy, z + dz]);
    }
    for (let i = 0; i < 9; i++) box([0.06, 1.15, 0.1], HULL, [s * 1.2, 1.9, -3.35 + i * 0.47]);
    // long neon trim
    G(box([0.04, 0.05, 3.9], CYAN, [s * 1.185, 1.42, -1.5]), 1.6);
    G(box([0.04, 0.04, 3.9], MAG, [s * 1.185, 2.4, -1.5]), 1.4);
    // skirt
    box([0.08, 0.3, 3.9], HULL_L, [s * 1.15, 1.22, -1.55]);
    // chamfer slats
    for (let i = 0; i < 7; i++) box([0.04, 0.3, 0.08], DARK, [s * 1.07, 2.68, -3.3 + i * 0.55], [0, 0, s * -52]);
    // top rails
    box([0.06, 0.06, 3.8], STEEL_D, [s * 0.75, 2.9, -1.5]);
    for (const z of [-3.3, -2.2, -1.1, 0, 0.3]) box([0.05, 0.1, 0.05], STEEL_D, [s * 0.75, 2.86, z]);
    // units text
    G(
      b.part(new THREE.PlaneGeometry(1.5, 0.41), "#ffffff", {
        at: [s * 1.207, 2.27, -1.5],
        dir: [s, 0, 0],
        axis: "z",
        texture: UNIT,
      }),
      1.2,
    );
    // missile pods
    const pc: V = [s * 0.6, 3.3, -2.8];
    box([0.4, 0.3, 0.6], HULL_L, [s * 0.6, 3.0, -2.8]);
    b.part(new THREE.BoxGeometry(0.7, 0.55, 1.2), HULL, { at: pc, rotation: [-25, 0, 0] });
    b.part(new THREE.BoxGeometry(0.72, 0.06, 0.4), YEL, { at: tp(pc, [0, 0.3, 0.1], -25), rotation: [-25, 0, 0] });
    for (const ox of [-0.16, 0.16])
      for (const oy of [-0.13, 0.13]) {
        b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), DARK, {
          at: tp(pc, [ox, oy, 0.62], -25),
          rotation: [65, 0, 0],
          flat: true,
        });
        G(
          b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.09, 6), RED, {
            at: tp(pc, [ox, oy, 0.63], -25),
            rotation: [65, 0, 0],
            flat: true,
          }),
          1.4,
        );
      }
    // roof vents
    for (let i = 0; i < 3; i++) {
      box([0.5, 0.07, 0.4], DARK, [s * 0.45, 2.89, -1.6 + i * 0.5 + 0.1]);
      for (let k = 0; k < 3; k++) box([0.46, 0.02, 0.03], STEEL_D, [s * 0.45, 2.935, -1.7 + i * 0.5 + k * 0.1 + 0.1]);
    }
  }

  // RCWS turret on the module roof
  cylY(0.5, 0.55, 0.18, 10, STEEL_D, [0, 2.94, -0.6]);
  cylY(0.35, 0.35, 0.04, 10, DARK, [0, 3.05, -0.6]);
  b.extrude(
    [
      [-0.5, 0],
      [0.5, 0],
      [0.4, 0.4],
      [-0.2, 0.45],
      [-0.5, 0.3],
    ] as [number, number][],
    { at: [0, 3.03, -0.6], x: [0, 0, 1], thickness: 0.9, bevel: 0.03, color: HULL },
  );
  box([0.1, 0.1, 0.6], HULL_L, [0, 3.5, -0.75]);
  for (const s of [1, -1]) {
    cylZ(0.055, 1.4, 8, DARK, [s * 0.2, 3.25, 0.15]);
    cylZ(0.085, 0.3, 8, STEEL_D, [s * 0.2, 3.25, -0.2]);
    box([0.16, 0.16, 0.14], STEEL, [s * 0.2, 3.25, 0.88]); // muzzle brake
    box([0.3, 0.3, 0.3], OLIVE_D, [s * 0.55, 3.2, -0.7]); // ammo box
    G(box([0.05, 0.05, 0.2], AMBER, [s * 0.71, 3.2, -0.7]), 1.2);
  }
  G(box([0.2, 0.12, 0.08], RED, [0, 3.3, -0.1]), 2.0);
  b.part(new THREE.SphereGeometry(0.08, 6, 4), STEEL_D, { at: [0, 3.35, -0.12], flat: true });

  // ---- rear ----------------------------------------------------------------
  box([2.3, 0.4, 0.3], DARK, [0, 0.9, -3.95]);
  box([2.1, 0.06, 0.32], YEL, [0, 1.12, -3.95]);
  b.part(new THREE.SphereGeometry(0.08, 6, 4), STEEL, { at: [0, 0.9, -4.15], flat: true });
  // rear door seams / ramp
  for (const x of [-0.5, 0, 0.5]) box([0.04, 1.35, 0.03], DARK, [x, 2.0, -3.51]);
  box([2.0, 0.04, 0.03], DARK, [0, 2.0, -3.51]);
  box([2.1, 0.5, 0.03], HULL_L, [0, 1.55, -3.52]);
  for (let k = 0; k < 6; k++) box([0.2, 0.5, 0.01], YEL, [-0.9 + k * 0.36, 1.55, -3.54]);
  for (const s of [1, -1]) {
    G(box([0.12, 1.0, 0.04], RED, [s * 1.03, 2.1, -3.52]), 1.8);
    G(box([0.4, 0.1, 0.04], RED, [s * 0.7, 2.55, -3.52]), 1.5);
    box([0.1, 1.2, 0.1], STEEL_D, [s * 1.1, 2.0, -3.55]);
    // ladder
    box([0.04, 1.0, 0.05], STEEL, [s * 0.25, 2.0, -3.56]);
  }
  for (let k = 0; k < 6; k++) box([0.5, 0.03, 0.05], STEEL, [0, 1.6 + k * 0.17, -3.56]);
  G(box([0.5, 0.15, 0.03], MAG, [0, 2.9, -3.5]), 1.4);

  return b.root;
}
```
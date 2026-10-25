```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Hover Technical",
  description:
    "A militarized pickup truck converted to hover thrusters: olive armor plating, neon underglow, four ducted lift pods, a bed-mounted twin-barrel turret and rear thrust nozzles. Low-poly cyberpunk.",
};

const HULL = "#3d4a3b";
const HULL_L = "#56664f";
const HULL_D = "#2a3329";
const DARK = "#14161d";
const PLATE = "#252a36";
const STEEL = "#5b6275";
const GLASS = "#0a3550";
const CYAN = "#19f0ff";
const MAG = "#ff2bd6";
const AMBER = "#ffb020";
const RED = "#ff2040";
const YEL = "#f2c200";
const WHITE = "#eaf6ff";

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });

  type V = [number, number, number];
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, rot?: V) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, color: string, rot?: V) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], rotation: rot });
  const lit = <T extends Parameters<typeof glow>[0]>(p: T, s = 1) => glow(p, s);
  const both = (fn: (s: number) => void) => {
    for (const s of [1, -1]) fn(s);
  };

  // ---------- chassis ----------
  box(1.6, 0.3, 5.4, 0, 0.65, 0, DARK);
  box(1.3, 0.12, 5.0, 0, 0.5, 0, PLATE);
  both((s) => {
    lit(box(0.03, 0.04, 4.8, s * 0.82, 0.5, 0, CYAN), 1.6); // underglow strips
    box(0.1, 0.22, 2.4, s * 0.88, 0.62, 0.1, HULL_D); // side skirts
    box(0.04, 0.12, 2.0, s * 0.94, 0.62, 0.1, HULL_L);
  });
  // belly skid plate
  box(1.2, 0.06, 3.0, 0, 0.45, 0, STEEL);

  // ---------- cab + hood from a side profile ----------
  b.extrude(
    [
      [-0.3, 0.7],
      [2.6, 0.7],
      [2.68, 0.9],
      [2.45, 1.12],
      [1.3, 1.25],
      [0.75, 1.85],
      [-0.2, 1.85],
      [-0.3, 1.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.7, color: HULL },
  );
  // lower belt of darker armour along the sides
  both((s) => {
    box(0.04, 0.2, 2.9, s * 0.86, 0.8, 1.15, HULL_D);
    box(0.03, 0.04, 2.9, s * 0.875, 0.93, 1.15, HULL_L);
  });
  // side windows + B pillar
  b.extrude(
    [
      [0.0, 1.32],
      [1.15, 1.32],
      [0.78, 1.78],
      [0.0, 1.78],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 1.74, color: GLASS },
  );
  both((s) => {
    box(0.06, 0.5, 0.08, s * 0.865, 1.55, 0.42, DARK);
    box(0.04, 0.04, 1.2, s * 0.87, 1.34, 0.6, DARK);
  });
  // windshield and rear window
  lit(box(1.55, 0.83, 0.03, 0, 1.55, 1.03, GLASS, [-42, 0, 0]), 0.5);
  box(1.62, 0.05, 0.06, 0, 1.87, 0.72, DARK);
  lit(box(1.3, 0.34, 0.04, 0, 1.66, -0.255, GLASS), 0.5);
  // roof armour and rack
  box(1.5, 0.06, 0.9, 0, 1.9, 0.25, HULL_D);
  both((s) => {
    box(0.05, 0.06, 0.95, s * 0.7, 1.96, 0.25, STEEL);
  });
  // light bar
  box(1.3, 0.08, 0.14, 0, 2.0, 0.55, DARK);
  for (let i = 0; i < 6; i++) lit(box(0.19, 0.06, 0.15, -0.5 + i * 0.2, 2.01, 0.55, i % 2 ? MAG : CYAN), 2);
  // sensor dome and antennas
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), STEEL, { at: [0, 1.93, -0.05] });
  lit(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0, 2.06, -0.02] }), 2);
  both((s) => {
    b.rod([s * 0.65, 1.93, -0.15], [s * 0.7, 2.75, -0.35], 0.012, DARK);
    lit(b.part(new THREE.SphereGeometry(0.03, 5, 4), s > 0 ? CYAN : MAG, { at: [s * 0.7, 2.77, -0.35] }), 2);
  });
  // door emblem signs
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,4 92,27 92,73 50,96 8,73 8,27" fill="#0b0d14" stroke="#19f0ff" stroke-width="5"/>
      <path d="M22 62 L50 30 L78 62" fill="none" stroke="#ff2bd6" stroke-width="8"/>
      <path d="M22 78 L50 46 L78 78" fill="none" stroke="#ffb020" stroke-width="6"/>
      <text x="50" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#eaf6ff">HX-07</text>
    </svg>`,
    { size: 128 },
  );
  both((s) => {
    lit(b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [s * 0.865, 1.02, 0.62], dir: [s, 0, 0], axis: "z", texture: EMBLEM }), 0.9);
    // neon accent stripe
    lit(box(0.02, 0.03, 2.85, s * 0.862, 0.74, 1.15, MAG), 1.8);
    // door handles
    box(0.03, 0.04, 0.16, s * 0.87, 1.13, 0.25, STEEL);
    // mirrors
    box(0.06, 0.16, 0.2, s * 1.0, 1.4, 1.0, DARK);
    box(0.12, 0.04, 0.04, s * 0.93, 1.4, 1.0, DARK);
  });

  // ---------- hood ----------
  box(0.55, 0.1, 0.55, 0, 1.28, 1.7, HULL_D, [6.4, 0, 0]); // scoop
  lit(box(0.4, 0.03, 0.04, 0, 1.31, 1.97, CYAN, [6.4, 0, 0]), 1.5);
  both((s) => {
    for (let i = 0; i < 4; i++) {
      const z = 1.55 + i * 0.16;
      box(0.38, 0.02, 0.06, s * 0.52, 1.25 - (z - 1.3) * 0.113 + 0.012, z, DARK, [6.4, 0, 0]);
    }
    // headlights
    lit(box(0.42, 0.12, 0.04, s * 0.58, 1.02, 2.575, WHITE, [-45, 0, 0]), 2.2);
    box(0.5, 0.04, 0.05, s * 0.58, 1.12, 2.5, DARK, [-45, 0, 0]);
    // fog lamps
    lit(b.part(new THREE.SphereGeometry(0.06, 6, 4), AMBER, { at: [s * 0.78, 0.78, 2.7] }), 1.6);
  });
  // grille + bumper
  box(1.3, 0.18, 0.05, 0, 0.8, 2.69, DARK);
  for (let i = 0; i < 4; i++) box(1.24, 0.02, 0.06, 0, 0.74 + i * 0.045, 2.72, STEEL);
  box(1.95, 0.24, 0.3, 0, 0.6, 2.72, PLATE);
  for (let i = 0; i < 8; i++) if (i % 2 === 0) box(0.2, 0.03, 0.3, -0.84 + i * 0.24, 0.73, 2.72, YEL);
  lit(box(1.5, 0.03, 0.03, 0, 0.5, 2.88, MAG), 2);
  // plow / ram wedge
  box(1.7, 0.3, 0.1, 0, 0.5, 2.98, STEEL, [-35, 0, 0]);
  both((s) => {
    box(0.12, 0.5, 0.12, s * 0.7, 0.95, 2.82, HULL_D); // bull bar uprights
    box(0.06, 0.06, 0.3, s * 0.7, 1.18, 2.7, HULL_D);
  });

  // ---------- bed ----------
  box(1.6, 0.06, 2.35, 0, 0.82, -1.47, PLATE);
  both((s) => {
    box(0.1, 0.5, 2.35, s * 0.8, 1.05, -1.47, HULL);
    box(0.12, 0.04, 2.35, s * 0.8, 1.31, -1.47, STEEL);
    lit(box(0.02, 0.03, 2.1, s * 0.855, 1.2, -1.47, MAG), 1.8);
    // armour plate + rivets
    box(0.05, 0.46, 1.1, s * 0.86, 1.05, -1.9, HULL_D);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
      cyl(0.025, 0.025, 0.03, 6, s * 0.89, 0.9 + j * 0.3, -1.5 - i * 0.4, STEEL, [0, 0, 90]);
    // taillights
    lit(box(0.3, 0.12, 0.04, s * 0.6, 1.0, -2.67, RED), 2.2);
    lit(box(0.3, 0.03, 0.04, s * 0.6, 0.88, -2.67, AMBER), 1.6);
  });
  box(1.6, 0.5, 0.1, 0, 1.05, -2.62, HULL); // tailgate
  box(1.6, 0.04, 0.12, 0, 1.31, -2.62, STEEL);
  box(1.0, 0.18, 0.04, 0, 1.0, -2.69, PLATE);
  lit(box(0.8, 0.04, 0.04, 0, 1.0, -2.72, CYAN), 1.6);
  // rear thrust nozzles
  both((s) => {
    cyl(0.2, 0.26, 0.4, 8, s * 0.5, 0.6, -2.85, DARK, [90, 0, 0]);
    lit(cyl(0.16, 0.16, 0.03, 8, s * 0.5, 0.6, -3.06, AMBER, [90, 0, 0]), 2.2);
    box(0.5, 0.05, 0.06, s * 0.5, 0.86, -2.75, STEEL);
  });
  // ammo crates + cargo
  for (const [x, z, c] of [[-0.45, -2.3, HULL_L], [0.45, -2.3, HULL_D], [-0.45, -1.7, HULL_D]] as [number, number, string][]) {
    box(0.5, 0.3, 0.5, x, 1.0, z, c);
    box(0.52, 0.05, 0.1, x, 1.1, z, YEL);
    box(0.05, 0.32, 0.52, x + 0.12, 1.0, z, STEEL);
  }
  // fuel / power cell
  cyl(0.18, 0.18, 0.5, 8, 0.45, 1.1, -1.1, STEEL);
  lit(cyl(0.185, 0.185, 0.06, 8, 0.45, 1.1, -1.1, CYAN), 1.8);

  // roll bar
  both((s) => {
    b.rod([s * 0.72, 0.85, -0.65], [s * 0.72, 1.85, -0.65], 0.035, DARK);
    b.rod([s * 0.72, 1.85, -0.65], [s * 0.72, 1.85, -0.35], 0.035, DARK);
    b.rod([s * 0.72, 1.85, -0.65], [s * 0.5, 1.2, -1.3], 0.03, DARK);
  });
  b.rod([-0.72, 1.85, -0.65], [0.72, 1.85, -0.65], 0.035, DARK);
  both((s) => lit(box(0.1, 0.1, 0.1, s * 0.5, 1.9, -0.65, s > 0 ? CYAN : MAG), 2));

  // ---------- turret ----------
  const TZ = -1.05;
  cyl(0.22, 0.28, 0.25, 8, 0, 0.98, TZ, PLATE);
  cyl(0.1, 0.12, 0.35, 6, 0, 1.25, TZ, STEEL);
  box(0.5, 0.3, 0.55, 0, 1.52, TZ, HULL_D);
  box(0.4, 0.05, 0.45, 0, 1.7, TZ, HULL_L);
  both((s) => {
    cyl(0.045, 0.045, 1.2, 6, s * 0.15, 1.52, TZ + 0.9, DARK, [90, 0, 0]);
    cyl(0.065, 0.065, 0.3, 6, s * 0.15, 1.52, TZ + 0.45, STEEL, [90, 0, 0]);
    cyl(0.07, 0.07, 0.1, 6, s * 0.15, 1.52, TZ + 1.5, STEEL, [90, 0, 0]);
    lit(cyl(0.035, 0.035, 0.03, 6, s * 0.15, 1.52, TZ + 1.56, MAG, [90, 0, 0]), 2.2);
    box(0.06, 0.34, 0.5, s * 0.3, 1.5, TZ + 0.05, PLATE); // cheek armour
  });
  box(0.6, 0.4, 0.05, 0, 1.55, TZ + 0.34, PLATE); // gun shield
  lit(box(0.4, 0.07, 0.03, 0, 1.6, TZ + 0.375, CYAN), 2); // sight slit
  box(0.2, 0.12, 0.2, 0, 1.74, TZ - 0.1, STEEL); // optic
  lit(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0, 1.74, TZ + 0.02] }), 2);

  // ---------- hover pods ----------
  const pod = (x: number, z: number, s: number) => {
    // pylon arm to chassis
    box(0.45, 0.14, 0.3, s * 0.95, 0.62, z, PLATE);
    box(0.2, 0.3, 0.2, s * 0.8, 0.7, z, HULL_D);
    // housing
    cyl(0.45, 0.5, 0.5, 8, x, 0.25, z, HULL);
    cyl(0.5, 0.5, 0.05, 8, x, 0.03, z, DARK);
    cyl(0.4, 0.46, 0.08, 8, x, 0.54, z, PLATE);
    lit(cyl(0.34, 0.34, 0.03, 8, x, 0.02, z, CYAN), 2.5); // thrust plate
    lit(cyl(0.2, 0.2, 0.035, 8, x, 0.015, z, WHITE), 2.5);
    lit(b.part(new THREE.TorusGeometry(0.49, 0.025, 4, 8), MAG, { at: [x, 0.3, z], rotation: [90, 0, 0] }), 2);
    // intake fan
    cyl(0.33, 0.33, 0.04, 8, x, 0.58, z, DARK);
    for (let i = 0; i < 3; i++) b.part(new THREE.BoxGeometry(0.6, 0.02, 0.07), STEEL, { at: [x, 0.61, z], rotation: [0, i * 60, 0] });
    cyl(0.06, 0.06, 0.08, 6, x, 0.63, z, AMBER);
    // vanes
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      box(0.05, 0.4, 0.2, x + Math.cos(a) * 0.5, 0.3, z + Math.sin(a) * 0.5, HULL_L, [0, -(a * 180) / Math.PI, 0]);
    }
  };
  both((s) => {
    pod(s * 1.3, 1.65, s);
    pod(s * 1.3, -1.65, s);
  });

  return b.root;
}
```
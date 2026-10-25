```ts
/*
BUILD SHEET — Six-wheeled railgun carrier on deployed stabiliser legs
Proportions: length ~11.9 m (hull 10.6 m, barrel overhang to z=7), width 4.15 m over wheels / 7.1 m with legs out, height ~4.9 m at barrel.
Main masses: chassis 3.0x0.8x10.6; rear deck 2.8x0.5x5.6; cab 2.6x1.3x2.4; hood 2.8x0.6x1.5; turret extrude 2.2 wide, 1.15 tall.
Parts: 6 wheels (tyre r0.72 w0.55, hub, 6 lug nuts), 4 stabiliser legs (mount, upper arm, lower leg, piston, ball, pad), railgun
  (two rails 0.2x0.3x8.4, insulator core, 5 clamps, 4 glowing strips, breech, cradle, muzzle block), 2 capacitor tubes, sensor mast,
  elevation pistons, exhausts, antennas, light bar, grille, headlights, rear rack with screen, tool boxes, bumpers.
Palette: #55623d olive camo base (patches #5d6a42 #3a4530 #7a7550), #2f3a28 undersides, #6b7280 steel, #2b2f36 iron/dark,
  #1b1c20 tyres, #4de8ff cyan glow (rail strips, capacitors, lens), #e8b81c hazard yellow, #d33 tail lights, #16303d glass.
Signature features: (1) twin-rail railgun with glowing cyan coil strips and clamp blocks on an elevated cradle joint "gun";
  (2) four deployed stabiliser legs, each hip+knee joints, hydraulic piston and hazard-striped pad on the ground;
  (3) camo patch paint with dark undersides; (4) textured emblem, warning sign, number plate, hazard stripes, target screen;
  (5) glowing capacitor tubes and rear target display.
Rig: root "chassis", "turret" (yaw), "gun" (elevation), wheel joints, stabiliser joints.
*/
import * as THREE from "three";
import { createBuilder, countershade, patches, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Six-Wheeled Railgun Carrier",
  description: "Low-poly sci-fi military 6x6 railgun carrier, braced on four deployed stabiliser legs.",
};

const OLIVE = "#55623d", DARKO = "#2f3a28", STEEL = "#6b7280", IRON = "#2b2f36", TIRE = "#1b1c20";
const CYAN = "#4de8ff", YELLOW = "#e8b81c", RED = "#dd3333", GLASS = "#16303d", TAN = "#8d8a62", BLACK = "#101216";
const AMBER = "#ffb02e";

const CAMO = countershade(
  patches(OLIVE, ["#5d6a42", "#3a4530", "#7a7550"], { size: 1.1, gap: 0.03, seed: 4 }),
  DARKO,
  { level: -0.5, soft: 0.3 },
);
const RAILMETAL = metal("steel", { polish: 0.3, tarnish: 0.1, size: 0.5 });
const IRONMETAL = metal("iron", { size: 0.4 });

const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1b1f1a" stroke="#e8b81c" stroke-width="4"/>
  <path d="M12 38 L52 38 M12 30 L52 30" stroke="#4de8ff" stroke-width="4"/>
  <path d="M32 8 L40 24 L24 24Z" fill="#e8b81c"/><path d="M20 46 L32 56 L44 46" fill="none" stroke="#e8b81c" stroke-width="4"/></svg>`,
  { size: 128 },
);
const HAZARD = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e8b81c"/>
  <g stroke="#111" stroke-width="12"><path d="M-10 20 L20 -10 M-10 52 L52 -10 M0 74 L74 0 M32 74 L74 32"/></g></svg>`,
  { size: 128 },
);
const PLATE = svg(
  `<svg viewBox="0 0 96 32"><rect x="1" y="1" width="94" height="30" rx="4" fill="#e9e6d6" stroke="#111" stroke-width="2"/>
  <text x="48" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#111">RG-06</text></svg>`,
  { size: 192 },
);
const WARN = svg(
  `<svg viewBox="0 0 64 64"><polygon points="32,5 61,57 3,57" fill="#e8b81c" stroke="#111" stroke-width="4" stroke-linejoin="round"/>
  <path d="M35 20 L24 39 L32 39 L28 51 L41 31 L33 31Z" fill="#111"/></svg>`,
  { size: 128 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 96 32"><rect width="96" height="32" fill="#06140e"/>
  <circle cx="18" cy="16" r="12" fill="none" stroke="#4dff9a" stroke-width="2"/><path d="M18 2 V30 M4 16 H32" stroke="#4dff9a" stroke-width="1.5"/>
  <circle cx="23" cy="11" r="2" fill="#ff5050"/>
  <rect x="42" y="6" width="44" height="4" fill="#4dff9a"/><rect x="42" y="14" width="30" height="4" fill="#4dff9a"/>
  <rect x="42" y="22" width="38" height="4" fill="#4dff9a"/></svg>`,
  { size: 192 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- skeleton ----------
  const chassis = b.joint("chassis", { at: [0, 1.1, 0] });
  const TURRET_C = V(0, 2.0, -1.4);
  const turret = b.joint("turret", { parent: chassis, at: TURRET_C, dir: [0, 1, 0], role: "hinge" });
  const PIVOT = V(0, 3.0, -0.5);
  const ELEV = (12 * Math.PI) / 180;
  const D = V(0, Math.sin(ELEV), Math.cos(ELEV));
  const UP = V(0, Math.cos(ELEV), -Math.sin(ELEV));
  const gun = b.joint("gun", { parent: turret, at: PIVOT, dir: D, role: "hinge" });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: any, bone: any = chassis, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: any, bone: any = chassis, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, flat: true, ...o });
  const decal = (tex: any, w: number, h: number, at: any, dir: any, bone: any = chassis) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });
  const gp = (t: number, x = 0, y = 0) => PIVOT.clone().addScaledVector(D, t).addScaledVector(UP, y).add(V(x, 0, 0));
  const gbox = (w: number, h: number, d: number, color: any, t: number, x = 0, y = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: gun, at: gp(t, x, y), dir: D, axis: "z" });

  // ---------- chassis ----------
  box(3.0, 0.8, 10.6, CAMO, [0, 1.1, 0]);
  box(2.6, 0.3, 10.0, IRONMETAL, [0, 0.62, 0]);
  box(2.8, 0.5, 5.6, CAMO, [0, 1.75, -1.7]);
  box(3.0, 0.4, 0.3, IRON, [0, 0.95, 5.45]);
  box(3.0, 0.4, 0.3, IRON, [0, 0.95, -5.45]);
  decal(HAZARD, 2.8, 0.3, [0, 0.95, -5.61], [0, 0, -1]);
  decal(PLATE, 0.8, 0.27, [0, 0.95, 5.61], [0, 0, 1]);
  // sloped front glacis
  box(2.9, 0.15, 1.0, CAMO, [0, 1.55, 5.0], chassis, { rotation: [12, 0, 0] });
  // tail lights
  for (const s of [1, -1]) {
    glow(box(0.35, 0.2, 0.06, RED, [s * 1.2, 1.2, -5.32]), 1.2);
    glow(box(0.3, 0.25, 0.06, "#fff3c0", [s * 1.1, 1.95, 5.33]), 1.5);
    cyl(0.1, 0.1, 1.4, 6, IRON, [s * 1.15, 2.35, 1.5]);
    cyl(0.13, 0.1, 0.1, 6, BLACK, [s * 1.15, 3.05, 1.5]);
    // side marks
    decal(EMBLEM, 0.9, 0.9, [s * 1.505, 1.15, -1.2], [s, 0, 0]);
    decal(WARN, 0.6, 0.6, [s * 1.505, 1.15, 0.4], [s, 0, 0]);
    // tool boxes on deck
    box(0.7, 0.5, 0.8, TAN, [s * 1.0, 2.25, 0.75]);
    box(0.72, 0.06, 0.82, IRON, [s * 1.0, 2.52, 0.75]);
    // deck edge guard rails
    b.rod([s * 1.38, 2.0, -4.3], [s * 1.38, 2.0, -0.6], 0.04, STEEL, { bone: chassis });
    for (const z of [-4.3, -2.5, -0.6]) b.rod([s * 1.38, 2.0, z], [s * 1.38, 2.35, z], 0.04, STEEL, { bone: chassis });
    b.rod([s * 1.38, 2.35, -4.3], [s * 1.38, 2.35, -0.6], 0.04, STEEL, { bone: chassis });
  }

  // ---------- cab ----------
  box(2.6, 1.3, 2.4, CAMO, [0, 2.15, 3.0]);
  box(2.8, 0.6, 1.5, CAMO, [0, 1.9, 4.55]);
  box(2.4, 0.8, 0.06, GLASS, [0, 2.3, 4.23], chassis, { rotation: [-20, 0, 0] });
  box(2.7, 0.12, 2.5, IRON, [0, 2.84, 3.0]);
  for (const s of [1, -1]) {
    box(0.05, 0.6, 1.4, GLASS, [s * 1.31, 2.35, 3.0]);
    box(0.08, 0.9, 0.08, IRON, [s * 1.34, 2.4, 3.7]);
    b.rod([s * 1.3, 2.5, 4.1], [s * 1.75, 2.55, 4.2], 0.03, IRON, { bone: chassis });
    box(0.12, 0.35, 0.22, IRON, [s * 1.8, 2.55, 4.2]);
    glow(box(0.4, 0.14, 0.14, AMBER, [s * 0.65, 2.98, 3.4]), 1.3);
  }
  box(1.6, 0.12, 0.25, BLACK, [0, 2.96, 3.4]);
  // grille
  box(1.7, 0.45, 0.05, BLACK, [0, 1.85, 5.32]);
  for (let i = 0; i < 4; i++) box(1.6, 0.04, 0.07, STEEL, [0, 1.7 + i * 0.1, 5.34]);

  // ---------- wheels ----------
  const WZ = [3.4, 1.9, -3.3];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    WZ.forEach((z, i) => {
      const wj = b.joint(`wheel${side}${i + 1}`, { parent: chassis, at: [s * 1.8, 0.72, z], dir: [s, 0, 0] });
      const c = V(s * 1.8, 0.72, z);
      cyl(0.72, 0.72, 0.55, 12, TIRE, c, wj, { dir: [s, 0, 0] });
      cyl(0.46, 0.46, 0.6, 10, STEEL, c, wj, { dir: [s, 0, 0] });
      cyl(0.2, 0.2, 0.68, 8, IRON, c, wj, { dir: [s, 0, 0] });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        box(0.07, 0.07, 0.07, YELLOW, [s * 2.14, 0.72 + Math.cos(a) * 0.32, z + Math.sin(a) * 0.32], wj);
      }
      // fender
      box(0.7, 0.12, 1.9, CAMO, [s * 1.8, 1.58, z]);
      box(0.1, 0.4, 1.9, CAMO, [s * 2.13, 1.4, z]);
    });
  }

  // ---------- turret ----------
  cyl(1.1, 1.2, 0.2, 10, IRON, [0, 2.1, -1.4], turret);
  b.extrude(
    [[-1.6, 0], [1.6, 0], [1.6, 0.55], [0.9, 1.15], [-1.2, 1.15], [-1.6, 0.8]],
    { at: [0, 2.2, -1.4], x: [0, 0, 1], thickness: 2.2, color: CAMO, bone: turret },
  );
  // capacitor tubes
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 2.0, 8, STEEL, [s * 1.4, 2.5, -1.6], turret, { dir: [0, 0, 1] });
    for (const z of [-2.3, -1.6, -0.9]) cyl(0.31, 0.31, 0.12, 8, IRON, [s * 1.4, 2.5, z], turret, { dir: [0, 0, 1] });
    for (const z of [-0.57, -2.63]) glow(cyl(0.2, 0.2, 0.06, 8, CYAN, [s * 1.4, 2.5, z], turret, { dir: [0, 0, 1] }), 1.5);
    box(0.3, 0.1, 1.0, IRON, [s * 1.28, 2.26, -1.6], turret);
  }
  // sensor mast
  cyl(0.05, 0.05, 0.6, 6, IRON, [0.8, 3.45, -2.2], turret);
  box(0.3, 0.2, 0.3, BLACK, [0.8, 3.8, -2.2], turret);
  glow(box(0.14, 0.1, 0.05, CYAN, [0.8, 3.8, -2.04], turret), 1.6);
  // elevation pistons
  for (const s of [1, -1]) {
    b.rod([s * 0.55, 3.15, -1.5], gp(-0.4, s * 0.55, -0.3), 0.07, STEEL, { bone: turret });
    b.rod(gp(-0.4, s * 0.55, -0.3), gp(0.3, s * 0.55, -0.25), 0.045, IRON, { bone: gun });
  }
  // rear rack + screen
  box(2.4, 0.9, 1.0, CAMO, [0, 2.45, -3.95]);
  glow(decal(SCREEN, 1.6, 0.53, [0, 2.5, -4.46], [0, 0, -1]), 1.0);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) box(0.05, 0.5, 0.1, IRON, [s * 1.21, 2.45, -4.25 + i * 0.3]);
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 2.5, -4.3], [s * 1.25, 4.4, -4.4], 0.02, IRON, { bone: chassis });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: chassis, at: [s * 1.25, 4.42, -4.4] }), 1.5);
  }

  // ---------- railgun ----------
  gbox(1.0, 0.9, 2.0, CAMO, 0.9);
  gbox(1.0, 1.0, 1.4, IRON, -0.5);
  gbox(0.5, 0.4, 0.3, STEEL, -1.3);
  for (const s of [1, -1]) {
    gbox(0.22, 0.3, 8.4, RAILMETAL, 4.3, s * 0.2);
    gbox(0.4, 0.3, 0.6, IRON, 1.7, s * 0.55, -0.1);
  }
  gbox(0.2, 0.22, 8.4, BLACK, 4.3);
  [1.4, 2.9, 4.4, 5.9, 7.4].forEach((t) => gbox(0.9, 0.62, 0.28, IRON, t));
  [2.15, 3.65, 5.15, 6.65].forEach((t) => {
    for (const s of [1, -1]) glow(gbox(0.05, 0.2, 1.1, CYAN, t, s * 0.33), 1.8);
  });
  [1.4, 2.9, 4.4, 5.9, 7.4].forEach((t) => gbox(0.95, 0.12, 0.34, YELLOW, t, 0, 0.36));
  gbox(1.1, 0.8, 0.5, STEEL, 8.55);
  glow(gbox(0.3, 0.3, 0.05, CYAN, 8.82), 2.0);
  gbox(1.2, 0.12, 0.6, IRON, 8.55, 0, 0.46);

  // ---------- stabiliser legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [tag, zs] of [["F", 4.5], ["R", -4.6]] as [string, number][]) {
      const hip = V(s * 1.55, 1.25, zs), knee = V(s * 2.55, 1.6, zs), ankle = V(s * 3.0, 0.3, zs);
      const hj = b.joint(`stab${tag}${side}`, { parent: chassis, at: hip, aim: knee, role: "leg" });
      const kj = b.joint(`stab${tag}${side}Knee`, { parent: hj, at: knee, aim: ankle, role: "leg" });
      box(0.45, 0.55, 0.8, IRON, hip, hj);
      b.rod(hip, knee, 0.13, CAMO, { bone: hj });
      b.part(new THREE.SphereGeometry(0.22, 6, 4), STEEL, { bone: kj, at: knee, flat: true });
      b.rod(knee, ankle, 0.15, STEEL, { bone: kj });
      const mid = knee.clone().lerp(ankle, 0.5);
      b.rod(V(s * 1.55, 0.85, zs), V(s * 2.25, 0.6, zs).lerp(mid, 0.3), 0.1, IRON, { bone: hj });
      b.rod(V(s * 2.25, 0.7, zs), mid, 0.05, STEEL, { bone: kj });
      b.part(new THREE.SphereGeometry(0.2, 6, 4), IRON, { bone: kj, at: ankle, flat: true });
      box(1.1, 0.15, 1.1, IRON, [s * 3.0, 0.075, zs], kj);
      decal(HAZARD, 0.95, 0.95, [s * 3.0, 0.155, zs], [0, 1, 0], kj);
    }
  }

  const root = b.root;
  return root;
}
```
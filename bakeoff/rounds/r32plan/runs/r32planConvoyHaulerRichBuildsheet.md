```ts
/*
BUILD SHEET: "Aegis CV-03" armoured convoy hauler (low-poly cyberpunk)
Proportions: length ~10.0 m (z -4.85..5.2), width ~3.4 m over the wheels, height ~3.7 m with the masts.
 Main masses: chassis beam 2.2 x 0.45 x 8.9 m, wedge cab 2.3 wide x 1.85 tall x 1.9 long,
 octagonal sealed pod 2.5 m across x 6.2 m long on y=2.2, six 1.1 m wheels (3 axles).
Parts: chassis, axles, 3 pod saddles; cab (extruded side profile), side armour plates, windshield,
 side windows, mirrors, grill, headlights, roof light bar, intakes, antennas; ram wedge + 5 spikes + hazard strip;
 turret (base, body, twin barrels, sensor); 2 exhaust stacks; 2 fuel tanks with bands; 2 utility crates;
 pod (8-sided lathe), 4 bands, spine glow strips, 2 label plates, rear vault door; 6 wheels (tyre, treads, rim,
 neon ring, hub); fenders, mudflaps; rear bumper, tail lights, plate; underglow strips, side marker lights.
Palette: hull #3a4254 cab, pod #566074, chassis #232831, armour #4c566b, tyre #141418, steel #8c95a6,
 hazard yellow #ffc400, neon magenta #ff2e88, neon cyan #21e8ff, tail red #ff2a2a, tank purple #51308f,
 exhaust orange #ff8a1c.
Signature features: (1) the sealed pod: faceted body, banded latches, glowing spine and a vault door with a red
 lock; (2) the armoured wedge cab with a ram bumper, spikes and hazard stripes; (3) neon: underglow, rim rings,
 light bar, grill slits; (4) painted plating with seams, panel wear and road grime low on the body;
 (5) drawn decals: pod label, door emblem, HUD windshield, vault wheel, hazard stripes, number plate.
*/
import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Aegis CV-03 Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy hauler guarding a sealed, banded cargo pod.",
};

const HULL = "#3a4254";
const HULL_DARK = "#1f242d";
const STEEL = "#8c95a6";
const RUBBER = "#141418";
const HAZ = "#ffc400";
const MAG = "#ff2e88";
const CYAN = "#21e8ff";
const RED = "#ff2a2a";
const ORANGE = "#ff8a1c";
const TANK = "#51308f";
const GLASS = "#0f2a3a";

function plated(base: string, size: number) {
  return paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const sv = size * 0.7;
    const du = (((u / size) % 1) + 1) % 1 * size;
    const dv = (((v / sv) % 1) + 1) % 1 * sv;
    let c = mix(base, "#6a768c", noise(p, 0.6, 3) * 0.3 + smoothstep(0.3, 1, n.y) * 0.22);
    c = mix(c, "#0e1016", smoothstep(0.2, -0.9, n.y) * 0.35);
    const dirt = smoothstep(1.15, 0.3, p.y) * (0.45 + 0.55 * noise(p, 0.35, 8));
    c = mix(c, "#2e2822", dirt * 0.55);
    if (du < 0.02 || dv < 0.02) return mix(c, "#0b0d12", 0.85);
    if (du < 0.035 || dv < 0.035) return mix(c, "#9aa6bd", 0.15);
    return c;
  });
}

const CAB_PAINT = plated(HULL, 0.55);
const POD_PAINT = plated("#566074", 0.8);
const CHASSIS_PAINT = plated("#232831", 0.6);
const ARMOR_PAINT = plated("#4c566b", 0.5);

// ---------- textures ----------
const hazardPolys = (() => {
  let s = "";
  for (let x = -8; x < 72; x += 16) s += `<polygon points="${x},16 ${x + 8},0 ${x + 16},0 ${x + 8},16" fill="#15151a"/>`;
  return s;
})();
const HAZARD = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ffc400"/>${hazardPolys}</svg>`,
  { size: 256 },
);

const labelBand = (y: number) => {
  let s = "";
  for (let x = -6; x < 250; x += 12) s += `<polygon points="${x},${y + 10} ${x + 6},${y} ${x + 12},${y} ${x + 6},${y + 10}" fill="#15151a"/>`;
  return `<rect x="0" y="${y}" width="240" height="10" fill="#ffc400"/>${s}`;
};
const LABEL = svg(
  `<svg viewBox="0 0 240 100">
    <rect width="240" height="100" rx="6" fill="#10131b"/>
    <rect x="2" y="2" width="236" height="96" rx="5" fill="none" stroke="#21e8ff" stroke-width="3"/>
    ${labelBand(8)}${labelBand(82)}
    <circle cx="38" cy="52" r="20" fill="#ffc400" stroke="#15151a" stroke-width="3"/>
    <circle cx="38" cy="52" r="4" fill="#15151a"/>
    <circle cx="38" cy="39" r="6" fill="#15151a"/><circle cx="27" cy="58" r="6" fill="#15151a"/><circle cx="49" cy="58" r="6" fill="#15151a"/>
    <text x="150" y="58" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#ff2e88">SEALED</text>
    <text x="150" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#21e8ff">CARGO POD // 7-K</text>
    <text x="150" y="74" text-anchor="middle" font-family="monospace" font-size="10" fill="#e8f0ff">DO NOT BREACH</text>
  </svg>`,
  { size: 512 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100">
    <polygon points="50,4 92,18 88,62 50,96 12,62 8,18" fill="#14171f" stroke="#ff2e88" stroke-width="5" stroke-linejoin="round"/>
    <polygon points="50,20 76,32 50,44 24,32" fill="#21e8ff"/>
    <polygon points="50,40 76,52 50,64 24,52" fill="#21e8ff" opacity="0.7"/>
    <polygon points="50,60 76,72 50,84 24,72" fill="#21e8ff" opacity="0.4"/>
  </svg>`,
  { size: 192 },
);
const VAULT = svg(
  `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill="#1b2029" stroke="#8c95a6" stroke-width="4"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#21e8ff" stroke-width="3"/>
    <g stroke="#8c95a6" stroke-width="7" stroke-linecap="round">
      <path d="M50 50 L50 14"/><path d="M50 50 L81 32"/><path d="M50 50 L81 68"/>
      <path d="M50 50 L50 86"/><path d="M50 50 L19 68"/><path d="M50 50 L19 32"/>
    </g>
    <circle cx="50" cy="50" r="13" fill="#2a303c" stroke="#ffc400" stroke-width="3"/>
    <circle cx="50" cy="50" r="6" fill="#ff2a2a"/>
    <text x="50" y="97" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#ffc400">LOCK</text>
  </svg>`,
  { size: 256 },
);
const GLASS_TEX = svg(
  `<svg viewBox="0 0 100 40">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15506a"/><stop offset="1" stop-color="#07131f"/></linearGradient></defs>
    <rect width="100" height="40" fill="url(#g)"/>
    <polygon points="10,40 30,0 40,0 20,40" fill="#bff6ff" opacity="0.18"/>
    <polygon points="50,40 70,0 76,0 56,40" fill="#bff6ff" opacity="0.12"/>
    <path d="M8 30 H34 M8 33 H24" stroke="#21e8ff" stroke-width="1.2"/>
    <circle cx="82" cy="28" r="7" fill="none" stroke="#21e8ff" stroke-width="1.2"/>
    <path d="M82 21 V35 M75 28 H89" stroke="#21e8ff" stroke-width="0.8"/>
    <text x="8" y="10" font-family="monospace" font-size="5" fill="#ff2e88">CONVOY LINK 03 // OK</text>
  </svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 60 24"><rect width="60" height="24" rx="3" fill="#e8ecf4"/><rect x="2" y="2" width="56" height="20" rx="2" fill="none" stroke="#15151a" stroke-width="1.2"/>
   <text x="30" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#15151a">CV-03</text></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "convoy_hauler", paintSize: 2048 });

  const box = (sx: number, sy: number, sz: number, at: number[], color: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at, ...opts });
  const cyl = (r1: number, r2: number, h: number, sides: number, at: number[], dir: number[], color: any, opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, sides), color, { at, dir, ...opts });
  const plane = (w: number, h: number, at: number[], dir: number[], tex: THREE.Texture, opts: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...opts });

  // ---------- chassis ----------
  box(2.2, 0.45, 8.9, [0, 0.78, -0.4], CHASSIS_PAINT);
  box(1.4, 0.2, 8.6, [0, 0.5, -0.4], HULL_DARK);
  const WZ = [3.2, -1.4, -3.1];
  for (const z of WZ) cyl(0.12, 0.12, 3.2, 8, [0, 0.55, z], [1, 0, 0], STEEL);

  // saddles holding the pod
  for (const z of [-2.8, -1.3, 0.2]) {
    box(2.2, 0.45, 0.5, [0, 1.15, z], HULL_DARK);
    for (const s of [1, -1]) box(0.12, 0.55, 0.6, [s * 1.05, 1.3, z], HAZ);
  }

  // ---------- wheels ----------
  for (const z of WZ) {
    for (const s of [1, -1]) {
      const x = s * 1.42;
      cyl(0.55, 0.55, 0.55, 12, [x, 0.54, z], [1, 0, 0], RUBBER);
      for (const o of [-0.17, 0.17]) cyl(0.565, 0.565, 0.14, 12, [x + o, 0.54, z], [1, 0, 0], "#0b0b0e");
      cyl(0.36, 0.36, 0.58, 8, [x, 0.54, z], [1, 0, 0], STEEL);
      glow(cyl(0.3, 0.3, 0.6, 12, [x, 0.54, z], [1, 0, 0], CYAN), 1.2);
      cyl(0.22, 0.22, 0.62, 6, [x, 0.54, z], [1, 0, 0], HULL_DARK);
      cyl(0.08, 0.08, 0.66, 6, [x, 0.54, z], [1, 0, 0], STEEL);
      // fender
      box(0.85, 0.1, 1.4, [x, 1.22, z], HULL_DARK);
      box(0.1, 0.4, 1.4, [s * 1.84, 1.1, z], ARMOR_PAINT);
      box(0.85, 0.1, 0.35, [x, 1.1, z + (z > 0 ? 0.72 : 0.72)], ARMOR_PAINT, { rotation: [-30, 0, 0] });
      if (z < 0) box(0.6, 0.5, 0.05, [x, 0.5, z - 0.78], RUBBER);
    }
  }

  // ---------- cab ----------
  const cabProfile: [number, number][] = [
    [2.2, 0.9], [4.1, 0.9], [4.1, 1.9], [3.5, 2.75], [2.3, 2.75], [2.2, 2.6],
  ];
  b.extrude(cabProfile, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: CAB_PAINT });
  // windshield
  glow(
    b.part(new THREE.BoxGeometry(2.0, 0.75, 0.04), "#ffffff", { at: [0, 2.387, 3.795], rotation: [-35.2, 0, 0], texture: GLASS_TEX }),
    0.45,
  );
  box(2.1, 0.06, 0.06, [0, 2.0, 3.97], HULL_DARK, { rotation: [-35.2, 0, 0] });
  for (const s of [1, -1]) {
    // side window, armour plate, door emblem
    box(0.03, 0.55, 0.9, [s * 1.165, 2.3, 2.85], GLASS);
    box(0.03, 0.04, 0.95, [s * 1.17, 2.58, 2.85], CYAN);
    const plate = b.extrude(
      [[2.4, 1.0], [3.95, 1.0], [3.95, 1.75], [3.55, 2.1], [2.4, 2.1]],
      { at: [s * 1.22, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, color: ARMOR_PAINT },
    );
    void plate;
    box(0.03, 0.06, 1.5, [s * 1.27, 1.1, 3.15], MAG);
    plane(0.7, 0.7, [s * 1.28, 1.55, 2.95], [s, 0, 0], EMBLEM);
    box(0.05, 0.08, 0.28, [s * 1.29, 1.35, 2.55], STEEL); // handle
    // mirror
    b.rod([s * 1.15, 2.3, 3.5], [s * 1.62, 2.4, 3.55], 0.025, STEEL);
    box(0.08, 0.42, 0.26, [s * 1.66, 2.4, 3.55], HULL_DARK);
    box(0.02, 0.34, 0.2, [s * 1.7, 2.4, 3.55], CYAN);
    // headlights
    glow(box(0.7, 0.14, 0.06, [s * 0.75, 1.55, 4.12], "#e8ffff"), 1.6);
    // roof intakes
    box(0.5, 0.14, 0.3, [s * 0.6, 2.82, 2.45], STEEL);
    // antennas
    b.rod([s * 0.95, 2.75, 2.4], [s * 0.95, 3.7, 2.4], 0.015, STEEL);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [s * 0.95, 3.72, 2.4] }), 1.5);
  }
  // grill
  box(0.95, 0.55, 0.05, [0, 1.38, 4.12], HULL_DARK);
  for (let i = 0; i < 4; i++) glow(box(0.8, 0.03, 0.02, [0, 1.2 + i * 0.12, 4.15], MAG), 1.2);
  // roof light bar
  glow(box(0.8, 0.1, 0.22, [0.4, 2.83, 3.3], MAG), 1.5);
  glow(box(0.8, 0.1, 0.22, [-0.4, 2.83, 3.3], CYAN), 1.5);
  box(1.7, 0.05, 0.28, [0, 2.78, 3.3], HULL_DARK);

  // ---------- ram wedge ----------
  b.extrude(
    [[3.9, 0.5], [4.75, 0.5], [4.85, 0.95], [4.5, 1.2], [3.9, 1.2]],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, bevel: 0.04, color: ARMOR_PAINT },
  );
  box(2.3, 0.04, 0.55, [0, 1.215, 4.2], "#ffffff", { texture: HAZARD });
  for (let i = -2; i <= 2; i++) cyl(0.07, 0.0, 0.4, 6, [i * 0.5, 0.82, 5.0], [0, 0, 1], STEEL);
  for (const s of [1, -1]) {
    glow(box(0.5, 0.06, 0.04, [s * 0.9, 0.62, 4.86], CYAN), 1.2);
  }

  // ---------- turret ----------
  cyl(0.45, 0.5, 0.15, 8, [0, 2.83, 2.7], [0, 1, 0], HULL_DARK);
  box(0.9, 0.38, 0.85, [0, 3.1, 2.7], ARMOR_PAINT);
  box(0.5, 0.2, 0.5, [0, 3.35, 2.6], HULL_DARK);
  for (const s of [1, -1]) {
    cyl(0.055, 0.055, 1.4, 6, [s * 0.22, 3.1, 3.7], [0, 0, 1], STEEL);
    cyl(0.085, 0.085, 0.3, 6, [s * 0.22, 3.1, 3.25], [0, 0, 1], HULL_DARK);
    glow(cyl(0.04, 0.04, 0.05, 6, [s * 0.22, 3.1, 4.42], [0, 0, 1], ORANGE), 1.5);
  }
  glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), CYAN, { at: [0, 3.5, 2.6] }), 1.5);

  // ---------- exhaust ----------
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 2.5, 8, [s * 1.0, 2.2, 2.08], [0, 1, 0], STEEL);
    cyl(0.14, 0.12, 0.12, 8, [s * 1.0, 3.45, 2.08], [0, 1, 0], HULL_DARK);
    glow(cyl(0.09, 0.09, 0.03, 8, [s * 1.0, 3.5, 2.08], [0, 1, 0], ORANGE), 1.4);
    for (const y of [1.4, 2.2, 3.0]) cyl(0.125, 0.125, 0.08, 8, [s * 1.0, y, 2.08], [0, 1, 0], HULL_DARK);
  }

  // ---------- tanks and crates ----------
  for (const s of [1, -1]) {
    cyl(0.32, 0.32, 1.8, 10, [s * 1.34, 0.82, 0.9], [0, 0, 1], TANK);
    for (const z of [0.2, 1.6]) cyl(0.34, 0.34, 0.08, 10, [s * 1.34, 0.82, z], [0, 0, 1], STEEL);
    glow(cyl(0.325, 0.325, 0.05, 10, [s * 1.34, 0.82, 0.9], [0, 0, 1], MAG), 1);
    box(0.7, 0.55, 0.8, [s * 1.4, 0.85, -0.55], "#ffffff", { texture: HAZARD });
    box(0.72, 0.1, 0.82, [s * 1.4, 1.17, -0.55], HULL_DARK);
  }

  // ---------- sealed pod ----------
  const POD_Z = -1.2, POD_Y = 2.2;
  b.lathe(
    [[0, -3.1], [0.7, -3.1], [1.15, -2.7], [1.25, -2.0], [1.25, 2.0], [1.15, 2.7], [0.7, 3.1], [0, 3.1]],
    { at: [0, POD_Y, POD_Z], axis: [0, 0, 1], segments: 8, color: POD_PAINT },
  );
  for (const z of [-3.7, -3.2, 0.5, 1.0]) {
    cyl(1.33, 1.33, 0.22, 16, [0, POD_Y, z], [0, 0, 1], HULL_DARK);
    cyl(1.35, 1.35, 0.06, 16, [0, POD_Y, z], [0, 0, 1], STEEL);
    glow(box(0.35, 0.1, 0.1, [0, POD_Y + 1.32, z], HAZ), 1.2);
    for (const s of [1, -1]) box(0.14, 0.4, 0.24, [s * 1.32, POD_Y, z], HAZ);
  }
  // spine glow
  for (let i = 0; i < 9; i++) {
    const z = -3.4 + i * 0.58;
    if (Math.abs(z - 0.5) < 0.2 || Math.abs(z - 1.0) < 0.2 || Math.abs(z + 3.2) < 0.2) continue;
    glow(box(0.3, 0.14, 0.38, [0, 3.38, z], i % 2 ? CYAN : MAG), 1.2);
  }
  // label plates
  for (const s of [1, -1]) {
    box(0.2, 1.1, 2.5, [s * 1.25, POD_Y, -1.65], HULL_DARK);
    plane(2.4, 1.0, [s * 1.355, POD_Y, -1.65], [s, 0, 0], LABEL);
    glow(box(0.05, 0.06, 2.6, [s * 1.36, POD_Y + 0.6, -1.65], CYAN), 1.2);
    glow(box(0.05, 0.06, 2.6, [s * 1.36, POD_Y - 0.6, -1.65], MAG), 1.2);
  }
  // rear vault door
  cyl(0.7, 0.7, 0.1, 16, [0, POD_Y, -4.35], [0, 0, 1], STEEL);
  plane(1.2, 1.2, [0, POD_Y, -4.405], [0, 0, -1], VAULT);
  box(0.2, 0.2, 0.1, [0.5, POD_Y + 0.55, -4.38], HAZ);
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), RED, { at: [0, POD_Y, -4.42] }), 1.8);
  // front nose sensor
  glow(cyl(0.22, 0.22, 0.06, 8, [0, POD_Y, 1.96], [0, 0, 1], CYAN), 1.1);

  // ---------- rear bumper ----------
  box(2.6, 0.35, 0.34, [0, 0.75, -4.65], ARMOR_PAINT);
  box(2.62, 0.05, 0.36, [0, 0.9, -4.65], "#ffffff", { texture: HAZARD });
  for (const s of [1, -1]) {
    glow(box(0.5, 0.12, 0.05, [s * 0.95, 0.78, -4.835], RED), 1.6);
    cyl(0.06, 0.06, 0.3, 6, [s * 0.4, 0.6, -4.9], [0, 0, 1], STEEL);
  }
  plane(0.5, 0.2, [0, 0.74, -4.84], [0, 0, -1], PLATE);

  // ---------- neon underglow and markers ----------
  for (const s of [1, -1]) {
    glow(box(0.06, 0.05, 8.2, [s * 1.0, 0.51, -0.3], s > 0 ? MAG : CYAN), 1.4);
    for (let i = 0; i < 7; i++) {
      const z = -4.2 + i * 1.3;
      if (Math.abs(z - 3.2) < 0.7) continue;
      glow(box(0.06, 0.08, 0.2, [s * 1.12, 0.86, z], i % 2 ? HAZ : ORANGE), 1.2);
    }
  }

  return b.root;
}
```
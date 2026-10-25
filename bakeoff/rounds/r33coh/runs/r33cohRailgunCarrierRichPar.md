<!-- call: plan -->

```json
{
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled armoured carrier carrying a long electromagnetic railgun, braced on four deployed stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [3.6, 3.0, 9.0],
  "layout": "Long angular 6x6 hull, cab at the front (+Z) with a sloped glacis and a slit-visor windscreen glowing cyan, a flat armoured deck in the middle carrying a turret-less railgun cradle, and a rear equipment bay with a capacitor bank at the back. Three wheel axles per side (front, mid, rear) with chunky tyres and hub plates; wheels rest on y=0. Four stabiliser legs deployed outward and down from the hull sides (two near the front, two near the back) end in broad pads; pads are on the floor. The railgun is two parallel rails with a shroud, a breech block and a glowing coil ring series, elevated about 20 degrees and pointing forward over the cab. Style: faceted slabs, chamfered plates, olive-drab hull with dark grey running gear, yellow hazard trim and cyan glowing energy parts, panelled paint with rivets, decals for stencilled numbers and insignia.",
  "palette": {
    "hull": "#4a5440",
    "hullDark": "#2f3629",
    "armorLight": "#6b7660",
    "metal": "#3a3e44",
    "steel": "#8c939c",
    "tyre": "#1a1b1e",
    "hazard": "#e7b814",
    "neonCyan": "#2ff3ff",
    "glass": "#14323c",
    "warnRed": "#c8322a",
    "white": "#e8e8e0",
    "copper": "#b8683a"
  },
  "mounts": {
    "deckTop": [0, 1.9, -0.6],
    "cabRoof": [0, 2.35, 2.9],
    "cradlePivot": [0, 2.3, -0.4],
    "muzzle": [0, 3.0, 4.6],
    "axleFront": [0, 0.6, 2.8],
    "axleMid": [0, 0.6, 0.2],
    "axleRear": [0, 0.6, -2.6],
    "legFrontL": [1.55, 1.2, 1.4],
    "legRearL": [1.55, 1.2, -2.8],
    "padFrontL": [2.8, 0, 1.6],
    "padRearL": [2.8, 0, -3.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.55, 0.6, 2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.55, 0.6, 2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.55, 0.6, 0.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.55, 0.6, 0.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.55, 0.6, -2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.55, 0.6, -2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFrontL", "parent": "body", "at": [1.55, 1.2, 1.4], "dir": [1, -0.6, 0.2], "role": "leg", "group": "legs" },
    { "name": "legFrontR", "parent": "body", "at": [-1.55, 1.2, 1.4], "dir": [-1, -0.6, 0.2], "role": "leg", "group": "legs" },
    { "name": "legRearL", "parent": "body", "at": [1.55, 1.2, -2.8], "dir": [1, -0.6, -0.2], "role": "leg", "group": "legs" },
    { "name": "legRearR", "parent": "body", "at": [-1.55, 1.2, -2.8], "dir": [-1, -0.6, -0.2], "role": "leg", "group": "legs" },
    { "name": "cradle", "parent": "body", "at": [0, 2.3, -0.4], "dir": [0, 0.34, 0.94], "role": "hinge", "group": "gun" }
  ],
  "parts": [
    {
      "id": "hullAndCab",
      "builds": "The armoured chassis: lower tub, sloped glacis, side skirts with wheel arches over all three axles, flat deck plate, cab block at front with slit windscreen (glowing glass), side vision ports, roof hatch, headlight clusters, hazard stripe trim, panelled/rivet paint, stencilled unit number decals, antennas, tow hooks and rear bumper with tail lights.",
      "box": [[-1.7, 0.7, -4.5], [1.7, 2.5, 4.3]],
      "attaches": "Sits on axle lines axleFront/axleMid/axleRear (wheels poke through arches); deck top at deckTop carries the gun cradle; leg mounts legFrontL/legRearL on the sides; rear bay accepts the capacitor bank at z=-4.5.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "runningGear",
      "builds": "Six wheels (chunky faceted tyres with tread blocks, steel hub plates with bolts, central glowing-free caps), axle beams, differential housings, suspension arms and shock absorbers, mud flaps, drive shafts under the hull. Each wheel is rigid on its own wheel joint. Tyre radius 0.6 so the tread touches y=0.",
      "box": [[-2.0, 0, -3.3], [2.0, 1.3, 3.5]],
      "attaches": "Wheel centres at axleFront (z=2.8), axleMid (z=0.2), axleRear (z=-2.6), x=±1.55, y=0.6; suspension arms bolt to hull underside at y=0.9.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed outrigger legs: each has a hull-side bracket with a pivot bolt, a thick upper strut angled outward, a hydraulic piston sleeve with chrome rod, a diagonal brace, and a broad octagonal ground pad with hazard-striped rim and rubber underlay. Red/yellow warning decals on the struts, small amber lamp on each bracket.",
      "box": [[-3.4, 0, -3.8], [3.4, 1.5, 2.2]],
      "attaches": "Brackets at legFrontL/legRearL (and mirrored R) on hull sides x=±1.55; pads end at padFrontL/padRearL (x=±2.8, y=0, z=1.6 / -3.2), flat on the floor.",
      "joints": ["legFrontL", "legFrontR", "legRearL", "legRearR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "railgun",
      "builds": "The railgun on a raised cradle: a pedestal and trunnion yoke on the deck, two elevation hydraulic rams, the elevated barrel assembly (two thick parallel rails with a square shroud, glowing cyan inner gap, series of coil rings with cyan glow, copper bus bars, breech block with heat fins, muzzle brake and flared bore with glowing tip), an ammo feed housing and a small sensor/targeting pod on the side. Panelled hull paint, hazard bands, stencilled markings. The barrel pivots about cradlePivot on joint cradle, extends forward to muzzle.",
      "box": [[-1.1, 1.9, -2.6], [1.1, 3.0, 4.7]],
      "attaches": "Pedestal stands on deckTop (y=1.9); trunnions at cradlePivot; barrel tip at muzzle; rear end overhangs towards the capacitor bank.",
      "joints": ["cradle", "body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "powerBay",
      "builds": "The rear equipment bay behind the deck: a boxy capacitor/generator housing with louvres and cooling fins, a bank of glowing cyan capacitor cylinders in a transparent-looking frame, thick power cables (copper and black sweeps) running forward to the gun breech along the deck, exhaust stacks with heat paint, fuel drums strapped on the rear sides, ladder, rear work lights, red warning lamp, and a rear door with decal numbering.",
      "box": [[-1.6, 1.3, -4.6], [1.6, 2.7, -1.0]],
      "attaches": "Sits on the hull rear deck at y~1.9 and against the hull rear at z=-4.5; cables meet the railgun breech near cradlePivot.",
      "joints": ["body"],
      "floor": false,
      "budget": 140
    }
  ]
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStabilisers({ b, J, P }: Ctx) {
  const ARM = "#e7b814";
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 16} 16 L${i * 16 + 8} 0 L${i * 16 + 16} 0 L${i * 16 + 8} 16Z" fill="#1a1b1e"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const warnTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 2 L30 29 L2 29Z" fill="#e7b814" stroke="#1a1b1e" stroke-width="2"/><rect x="14.5" y="11" width="3" height="10" fill="#c8322a"/><rect x="14.5" y="23" width="3" height="3" fill="#c8322a"/></svg>`,
    { size: 96 },
  );
  const steelP = paint((p, n) => mix("#6f757d", "#aab1ba", smoothstep(0.3, 0.8, noise(p, 0.1, 3)) * 0.6 + 0.4 * Math.max(0, n.y)));
  const hullP = paint((p, n) => {
    const c = mix(P.hullDark, P.hull, 0.4 + 0.6 * noise(p, 0.15, 5));
    return mix(c, "#6b7660", 0.25 * Math.max(0, n.y));
  });
  const joints: [string, number, number, number][] = [
    ["legFrontL", 1, 1.4, 1.6],
    ["legFrontR", -1, 1.4, 1.6],
    ["legRearL", 1, -2.8, -3.2],
    ["legRearR", -1, -2.8, -3.2],
  ];
  for (const [name, s, z, pz] of joints) {
    const j = J[name];
    const hip: [number, number, number] = [s * 1.55, 1.2, z];
    const knee: [number, number, number] = [s * 2.25, 0.95, z + (pz - z) * 0.35];
    const foot: [number, number, number] = [s * 2.8, 0.2, pz];
    // bracket plate on hull side
    b.part(new THREE.BoxGeometry(0.2, 0.7, 0.8), hullP, { bone: j, at: [s * 1.62, 1.2, z] });
    b.part(new THREE.BoxGeometry(0.3, 0.2, 0.9), P.hullDark, { bone: j, at: [s * 1.72, 1.52, z] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8), P.steel, { bone: j, at: [s * 1.8, 1.2, z], dir: [0, 0, 1] });
    for (const dz of [-0.28, 0.28])
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), P.steel, { bone: j, at: [s * 1.75, 1.0, z + dz], dir: [s, 0, 0] });
    // amber lamp
    glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), "#ffb020", { bone: j, at: [s * 1.78, 1.6, z + 0.3] }), 1.5);
    // upper strut
    b.rod(hip, knee, 0.13, hullP, { bone: j, sides: 6 });
    b.rod([hip[0], hip[1] - 0.05, hip[2]], knee, 0.17, P.metal, { bone: j, sides: 6, from: 0, to: 0.25 });
    // sleeve + chrome rod
    const mid: [number, number, number] = [
      knee[0] + (foot[0] - knee[0]) * 0.45,
      knee[1] + (foot[1] - knee[1]) * 0.45,
      knee[2] + (foot[2] - knee[2]) * 0.45,
    ];
    b.rod(knee, mid, 0.15, P.metal, { bone: j, sides: 8 });
    b.rod(mid, [foot[0], foot[1] + 0.12, foot[2]], 0.07, steelP, { bone: j, sides: 8 });
    b.part(new THREE.SphereGeometry(0.17, 8, 6), P.steel, { bone: j, at: knee });
    // diagonal brace
    b.rod([s * 1.6, 0.85, z], mid, 0.06, P.metal, { bone: j, sides: 6 });
    // hazard bands and warning decal on strut
    for (const t of [0.2, 0.55]) {
      const q = [
        knee[0] + (foot[0] - knee[0]) * (t * 0.6),
        knee[1] + (foot[1] - knee[1]) * (t * 0.6),
        knee[2] + (foot[2] - knee[2]) * (t * 0.6),
      ] as [number, number, number];
      b.part(new THREE.CylinderGeometry(0.162, 0.162, 0.08, 8), ARM, { bone: j, at: q, dir: [foot[0] - knee[0], foot[1] - knee[1], foot[2] - knee[2]] });
    }
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: j,
      at: [(hip[0] + knee[0]) / 2, (hip[1] + knee[1]) / 2 + 0.02, (hip[2] + knee[2]) / 2 + 0.14],
      dir: [0, 0.3, 1],
      axis: "z",
      texture: warnTex,
    });
    // pad: rubber underlay, octagonal plate, hazard rim, hub
    b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 8), P.tyre, { bone: j, at: [foot[0], 0.03, pz], flat: true });
    b.part(new THREE.CylinderGeometry(0.55, 0.6, 0.12, 8), P.metal, { bone: j, at: [foot[0], 0.12, pz], flat: true });
    b.part(new THREE.CylinderGeometry(0.59, 0.59, 0.05, 8, 1, true), "#ffffff", { bone: j, at: [foot[0], 0.12, pz], texture: hazardTex, flat: true });
    b.part(new THREE.CylinderGeometry(0.4, 0.45, 0.06, 8), hullP, { bone: j, at: [foot[0], 0.2, pz], flat: true });
    b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, { bone: j, at: [foot[0], 0.23, pz] });
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2 + Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.steel, { bone: j, at: [foot[0] + Math.cos(a) * 0.32, 0.25, pz + Math.sin(a) * 0.32] });
    }
  }
}
```

<!-- call: powerBay -->

```ts
import * as THREE from "three";
import { paint, svg, rng, catmull, glow, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildPowerBay({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const g = (fn: any, s = 1) => (glowKit ?? glow)(fn, s);

  const HULLP = paint((p: any, n: any) => {
    const base = mix(P.hull, P.armorLight, noise(p, 0.3, 3) * 0.6);
    const seamX = Math.abs(((p.x + 5) % 0.5) - 0.25) < 0.01;
    const seamZ = Math.abs(((p.z + 5) % 0.6) - 0.3) < 0.01;
    const top = smoothstep(0.3, 0.9, n.y);
    const c = mix(base, "#8a9478", top * 0.3);
    return seamX || seamZ ? mix(c, "#1c2018", 0.7) : c;
  });
  const HEAT = paint((p: any) => mix("#3a3e44", "#7a5a3a", smoothstep(2.2, 2.7, p.y)));

  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, ...opt });

  // main housing
  box(3.0, 0.9, 3.0, HULLP, [0, 1.75, -2.9]);
  box(3.1, 0.12, 3.1, P.hullDark, [0, 2.24, -2.9]);
  box(3.1, 0.12, 0.2, P.hazard, [0, 2.3, -1.2]);
  box(3.1, 0.12, 0.2, P.hazard, [0, 2.3, -4.45]);
  // side louvres
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      box(0.06, 0.07, 2.0, P.hullDark, [s * 1.52, 1.5 + i * 0.1, -2.9]);
    }
  // cooling fins on top rear
  for (let i = 0; i < 9; i++) box(2.6, 0.22, 0.05, P.metal, [0, 2.38, -3.9 + i * 0.16]);

  // capacitor frame and cylinders
  const fz = -2.9;
  for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.08, 0.7, 0.08, P.steel, [sx * 1.2, 2.65, fz + sz * 0.9]);
  box(2.5, 0.08, 2.0, P.steel, [0, 3.0 - 0.3, fz]);
  box(2.5, 0.06, 2.0, P.metal, [0, 2.3, fz]);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 3; j++) {
      const x = -0.9 + i * 0.6, z = fz - 0.6 + j * 0.6;
      g(cyl(0.2, 0.2, 0.6, 8, P.neonCyan, [x, 2.65, z], { flat: true }), 1.4);
      cyl(0.22, 0.22, 0.06, 8, P.metal, [x, 2.97, z]);
      cyl(0.22, 0.22, 0.06, 8, P.metal, [x, 2.33, z]);
    }

  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.12, 0.14, 0.9, 8, HEAT, [s * 1.3, 2.4, -1.5]);
    cyl(0.16, 0.16, 0.08, 8, P.metal, [s * 1.3, 2.88, -1.5]);
    cyl(0.1, 0.1, 0.02, 8, P.warnRed, [s * 1.3, 2.93, -1.5]);
  }

  // fuel drums on rear sides
  for (const s of [1, -1])
    for (let i = 0; i < 2; i++) {
      const z = -3.4 - i * 0.65;
      cyl(0.27, 0.27, 0.8, 10, P.hazard, [s * 1.7, 1.75, z], { rotation: [0, 0, 90] });
      cyl(0.28, 0.28, 0.05, 10, P.metal, [s * 1.7, 1.75, z - 0.0], { rotation: [0, 0, 90] });
      box(0.06, 0.6, 0.1, P.metal, [s * 1.7, 1.75, z]);
    }

  // ladder at rear side
  for (const s of [-1, 1]) box(0.06, 1.1, 0.06, P.steel, [s * 0.35, 1.8, -4.58]);
  for (let i = 0; i < 6; i++) box(0.7, 0.05, 0.05, P.steel, [0, 1.35 + i * 0.18, -4.58]);

  // rear door with decal
  box(1.2, 1.0, 0.06, P.hullDark, [0, 1.85, -4.43], { name: "door" });
  const num = svg(
    `<svg viewBox="0 0 64 32"><rect x="1" y="1" width="62" height="30" fill="none" stroke="#e8e8e0" stroke-width="2"/><text x="32" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e8e8e0">PB-07</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", {
    bone, at: [0, 2.0, -4.48], dir: [0, 0, -1], axis: "z", texture: num,
  });
  box(0.1, 0.1, 0.05, P.metal, [0.45, 1.85, -4.48]);

  // work lights and warning lamp
  for (const s of [1, -1]) {
    box(0.22, 0.16, 0.12, P.metal, [s * 1.3, 2.12, -4.52]);
    g(box(0.18, 0.12, 0.04, P.white, [s * 1.3, 2.12, -4.6]), 1.5);
  }
  g(cyl(0.1, 0.1, 0.14, 8, P.warnRed, [0, 2.4, -4.3]), 1.5);
  cyl(0.12, 0.12, 0.04, 8, P.metal, [0, 2.31, -4.3]);

  // cables to the breech along deck
  const cab = (x: number, col: string, y: number) =>
    b.sweep(catmull([[x, 2.2, -1.5], [x, y, -1.1], [x * 0.5, y - 0.1, -0.8], [x * 0.2, 2.35, -0.6]]), 0.05, {
      color: col, bone, sides: 6,
    });
  cab(0.5, P.copper, 2.05);
  cab(-0.5, P.copper, 2.05);
  cab(0.25, "#111214", 2.0);
  cab(-0.25, "#111214", 2.0);
  b.sweep(catmull([[0.5, 2.3, -1.6], [0.8, 2.6, -1.5], [1.1, 2.5, -1.5]]), 0.04, { color: P.copper, bone, sides: 6 });

  // strap bands on drums-ish: housing bolts
  const bolts = R;
  for (let i = 0; i < 10; i++)
    for (const s of [1, -1])
      cyl(0.03, 0.03, 0.03, 6, P.steel, [s * 1.53, 2.15, -1.5 - i * 0.3], { rotation: [0, 0, 90] });
  void bolts;
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildRunningGear({ b, J, P }: Ctx) {
  const R = 0.6;
  const rand = rng(11);
  const TYRE = paint((p, n) => {
    const k = noise(p as any, 0.08, 3);
    const c = mix("#141518", "#26272c", k * 0.8);
    return mix(c, "#4a4638", smoothstep(0.6, 1, noise(p as any, 0.2, 9)) * 0.35 * (1 - Math.abs(n.y)));
  });
  const GEAR = paint((p, n) => {
    const k = noise(p as any, 0.12, 5);
    return mix(P.metal, "#23262b", k * 0.6 + (n.y < -0.3 ? 0.25 : 0));
  });
  const HUB = paint((p, _n) => mix(P.steel, "#5d646c", noise(p as any, 0.05, 2) * 0.7));
  const hubTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#9aa1aa" stroke="#22252a" stroke-width="4"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#4b525a" stroke-width="3"/>
    <circle cx="50" cy="50" r="14" fill="#6a717a" stroke="#22252a" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${50 + 38 * Math.cos((i * Math.PI) / 4)}" cy="${50 + 38 * Math.sin((i * Math.PI) / 4)}" r="3.4" fill="#2a2d33"/>`).join("")}
    <path d="M50 8 L56 22 L44 22Z" fill="#e7b814"/></svg>`,
    { size: 192 },
  );
  const treadTex = svg(`<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#fff"/></svg>`, { size: 16 });
  void treadTex;

  const names: [string, number, number][] = [
    ["wheelFL", 1, 2.8], ["wheelFR", -1, 2.8],
    ["wheelML", 1, 0.2], ["wheelMR", -1, 0.2],
    ["wheelRL", 1, -2.6], ["wheelRR", -1, -2.6],
  ];

  for (const [nm, s, z] of names) {
    const j = J[nm];
    const cx = s * 1.55;
    const W = 0.46;
    // tyre: faceted octagonal-ish cylinder, axis X
    const tyre = new THREE.CylinderGeometry(R / Math.cos(Math.PI / 12), R / Math.cos(Math.PI / 12), W, 12);
    b.part(tyre, TYRE, { bone: j, at: [cx, 0.6, z], dir: [1, 0, 0], flat: true });
    // sidewall ring slightly narrower inner
    b.part(new THREE.CylinderGeometry(0.46, 0.46, W + 0.04, 12), P.tyre, { bone: j, at: [cx, 0.6, z], dir: [1, 0, 0], flat: true });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) * Math.PI * 2) / 12;
      const y = 0.6 + Math.cos(a) * (R + 0.02);
      const zz = z + Math.sin(a) * (R + 0.02);
      b.part(new THREE.BoxGeometry(W * 0.9, 0.05, 0.16), P.tyre, {
        bone: j, at: [cx, y, zz], dir: [0, Math.cos(a), Math.sin(a)], axis: "y",
      });
    }
    // hub plate
    const out = cx + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 8), HUB, { bone: j, at: [out, 0.6, z], dir: [s, 0, 0], flat: true });
    b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", {
      bone: j, at: [out + s * 0.03, 0.6, z], dir: [s, 0, 0], axis: "z", texture: hubTex,
    });
    // cap
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), P.metal, { bone: j, at: [out + s * 0.06, 0.6, z], dir: [s, 0, 0], flat: true });
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.steel, {
        bone: j, at: [out + s * 0.04, 0.6 + Math.cos(a) * 0.23, z + Math.sin(a) * 0.23], dir: [s, 0, 0],
      });
    }
    // mud flap behind wheel
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.04), P.tyre, { bone: J.body, at: [cx, 0.62, z - R - 0.12] });
    b.part(new THREE.BoxGeometry(0.42, 0.06, 0.05), P.hazard, { bone: J.body, at: [cx, 0.46, z - R - 0.12] });
    // suspension arm to hull underside
    b.rod([s * 0.9, 0.9, z + 0.25], [s * 1.35, 0.55, z + 0.1], 0.06, GEAR, { bone: J.body });
    b.rod([s * 0.9, 0.95, z - 0.25], [s * 1.35, 0.7, z - 0.1], 0.06, GEAR, { bone: J.body });
    // shock absorber
    b.rod([s * 1.15, 1.25, z + 0.3], [s * 1.38, 0.75, z + 0.3], 0.05, P.hazard, { bone: J.body });
    b.rod([s * 1.2, 1.1, z + 0.3], [s * 1.36, 0.8, z + 0.3], 0.025, P.steel, { bone: J.body });
    // axle stub
    b.rod([s * 1.0, 0.6, z], [cx - s * 0.2, 0.6, z], 0.08, P.metal, { bone: J.body });
  }

  // axle beams and differentials
  for (const z of [2.8, 0.2, -2.6]) {
    b.rod([-1.35, 0.6, z], [1.35, 0.6, z], 0.1, GEAR, { bone: J.body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), GEAR, { bone: J.body, at: [0, 0.6, z], scale: [1, 0.9, 1.1], flat: true });
    b.part(new THREE.BoxGeometry(0.3, 0.12, 0.3), P.hullDark, { bone: J.body, at: [0, 0.88, z] });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), P.steel, {
        bone: J.body, at: [Math.cos(a) * 0.17, 0.6 + Math.sin(a) * 0.17, z + 0.29],
        dir: [0, 0, 1],
      });
    }
  }
  // drive shafts
  for (const [z0, z1] of [[2.8, 0.2], [0.2, -2.6]]) {
    b.rod([0, 0.62, z0], [0, 0.62, z1], 0.06, P.steel, { bone: J.body, sides: 8 });
    for (const t of [0.25, 0.75]) {
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), P.metal, {
        bone: J.body, at: [0, 0.62, z0 + (z1 - z0) * t], dir: [0, 0, 1],
      });
    }
  }
  // transfer case
  b.part(new THREE.BoxGeometry(0.6, 0.3, 0.8), GEAR, { bone: J.body, at: [0, 0.8, 1.5] });
  b.part(new THREE.BoxGeometry(0.6, 0.3, 0.7), GEAR, { bone: J.body, at: [0, 0.8, -1.3] });
  void rand;
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildRailgun({ b, J, P, M }: Ctx) {
  const body = J.body;
  const cradle = J.cradle;
  const HULL = panelled(P.hull, { size: 0.35, rivets: 0.07 });
  const DARK = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });
  const STEEL = metal("steel");
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#1a1b1e"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#e8e8e0">RG-7</text></svg>`,
    { size: 128 },
  );
  const insignia = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#e8e8e0" stroke-width="3"/><path d="M16 5 L22 22 L16 18 L10 22Z" fill="#c8322a"/></svg>`,
    { size: 96 },
  );

  // Pedestal and yoke (on body)
  const [px, py, pz] = M.cradlePivot;
  b.part(box(1.5, 0.12, 1.5), DARK, { bone: body, at: [0, 1.96, pz] });
  b.part(new THREE.CylinderGeometry(0.55, 0.7, 0.3, 8), HULL, { bone: body, at: [0, 2.1, pz] });
  b.part(box(0.9, 0.2, 0.9), DARK, { bone: body, at: [0, 2.3, pz] });
  for (const s of [1, -1]) {
    b.part(box(0.16, 0.7, 0.9), HULL, { bone: body, at: [s * 0.62, 2.55, pz] });
    b.part(box(0.1, 0.5, 0.6), DARK, { bone: body, at: [s * 0.74, 2.5, pz] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), STEEL, { bone: body, at: [s * 0.62, py + 0.05, pz], dir: [1, 0, 0] });
    // hydraulic rams
    const a = [s * 0.45, 2.0, pz + 0.9];
    const c = [s * 0.4, 2.6, pz + 1.7];
    b.rod(a, c, 0.07, P.metal, { bone: body });
    b.rod([s * 0.4, 2.45, pz + 1.5], c, 0.04, STEEL, { bone: cradle });
    b.part(new THREE.SphereGeometry(0.09, 6, 4), P.steel, { bone: body, at: a });
  }

  // Barrel assembly on cradle: local axes by joint dir; use model-space positions via at
  const dir = new THREE.Vector3(0, 0.34, 0.94).normalize();
  const up = new THREE.Vector3(0, 0.94, -0.34).normalize();
  const origin = new THREE.Vector3(px, py, pz);
  const P3 = (z: number, y = 0, x = 0) => origin.clone().addScaledVector(dir, z).addScaledVector(up, y).add(new THREE.Vector3(x, 0, 0));
  const place = (g: THREE.BufferGeometry, col: any, z: number, y = 0, x = 0, extra: any = {}) =>
    b.part(g, col, { bone: cradle, at: P3(z, y, x), dir: [dir.x, dir.y, dir.z], axis: "z", up: [up.x, up.y, up.z], ...extra });

  const L0 = -1.6, L1 = 5.0;
  // shroud
  place(box(0.9, 0.7, 4.2), HULL, 1.3, 0.0);
  place(box(0.7, 0.12, 4.3), DARK, 1.3, 0.38);
  // rails
  for (const s of [1, -1]) {
    place(box(0.3, 0.34, L1 - L0 - 0.3), STEEL, (L0 + L1) / 2 + 0.2, 0, s * 0.32);
    place(box(0.06, 0.4, 5.4), P.copper, (L0 + L1) / 2 + 0.2, 0, s * 0.5);
  }
  // glowing gap
  glow(place(box(0.2, 0.26, L1 - L0 - 0.2), P.neonCyan, (L0 + L1) / 2 + 0.2, 0, 0), 1.6);
  // coil rings
  for (let i = 0; i < 8; i++) {
    const z = 0.2 + i * 0.55;
    place(box(1.0, 0.8, 0.12), DARK, z, 0);
    glow(place(box(1.04, 0.84, 0.05), P.neonCyan, z, 0), 1.5);
  }
  // hazard bands
  for (const z of [-0.2, 2.8]) place(box(0.94, 0.74, 0.2), stripeTex, z, 0, 0, { texture: stripeTex, color: "#ffffff" });
  // breech block
  place(box(1.1, 0.95, 1.2), HULL, -1.0, 0);
  for (let i = 0; i < 6; i++) place(box(1.2, 0.06, 0.9), STEEL, -1.0, 0.5 + i * 0.0, 0, { at: P3(-1.0, 0.5 + 0.0, 0).addScaledVector(up, i * 0.0) });
  for (let i = 0; i < 5; i++) place(box(1.18, 0.05, 1.0), P.metal, -1.1, -0.35 + i * 0.17 + 0.0, 0).position;
  place(box(0.8, 0.5, 0.5), DARK, -1.9, 0);
  // ammo feed housing
  place(box(0.5, 0.5, 0.9), HULL, -0.5, 0.2, -0.75);
  place(box(0.3, 0.3, 0.2), P.warnRed, -0.5, 0.2, -1.03);
  // sensor pod
  place(box(0.3, 0.3, 0.45), DARK, 0.9, 0.2, 0.7);
  glow(place(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8), P.neonCyan, 1.15, 0.2, 0.7, { dir: [dir.x, dir.y, dir.z] }), 1.5);
  // muzzle
  place(box(1.1, 0.9, 0.5), DARK, 4.7, 0);
  place(box(1.14, 0.1, 0.6), STEEL, 4.7, 0.5);
  for (const s of [1, -1]) place(box(0.08, 0.5, 0.5), STEEL, 4.75, 0, s * 0.6);
  place(new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8), P.metal, 5.05, 0, 0, { dir: [dir.x, dir.y, dir.z] });
  glow(place(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), P.neonCyan, 5.22, 0, 0, { dir: [dir.x, dir.y, dir.z] }), 2);

  // decals: stencil and insignia on shroud sides
  for (const s of [1, -1]) {
    const at = P3(1.3, 0, s * 0.46);
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", { bone: cradle, at, dir: [s, 0, 0], axis: "z", up: [up.x, up.y, up.z], texture: stencil });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone: cradle, at: P3(2.6, 0, s * 0.46), dir: [s, 0, 0], axis: "z", up: [up.x, up.y, up.z], texture: insignia });
  }
  // copper bus bars running back to power bay
  for (const s of [1, -1]) b.rod([s * 0.3, 2.3, pz - 1.0], [s * 0.3, 2.1, -2.5], 0.05, P.copper, { bone: body });
}
```

<!-- call: hullAndCab -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHullAndCab({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, flat: true });

  const HULL = panelled(P.hull, { size: 0.5, aspect: 0.8, rivets: 0.12 });
  const DARK = panelled(P.hullDark, { size: 0.45, rivets: 0.1 });
  const ARMOR = panelled(P.armorLight, { size: 0.4, rivets: 0.1 });
  const worn = paint((p, n) => {
    const t = noise(p, 0.3, 4);
    const base = mix(P.hull, P.hullDark, smoothstep(0.5, 0.9, t) * 0.5);
    return n.y > 0.5 ? mix(base, P.armorLight, 0.3) : base;
  });

  // lower tub
  box(3.2, 0.7, 8.6, DARK, [0, 1.05, -0.1]);
  // main hull body (rear + middle)
  box(3.4, 0.8, 5.6, worn, [0, 1.8, -1.6]);
  // deck plate
  box(3.0, 0.1, 5.2, ARMOR, [0, 2.2, -1.5]);
  // deck edge chamfers
  for (const s of [1, -1]) {
    box(0.14, 0.14, 5.4, P.armorLight, [s * 1.55, 2.2, -1.5], [0, 0, s * 45]);
    // side skirts
    box(0.12, 0.5, 8.0, HULL, [s * 1.72, 1.1, -0.2]);
    // hazard trim
    for (let i = 0; i < 12; i++)
      box(0.04, 0.08, 0.3, P.hazard, [s * 1.79, 1.45, -3.6 + i * 0.62], [0, 0, 0]);
  }
  // wheel arches over three axles
  for (const s of [1, -1])
    for (const z of [2.8, 0.2, -2.6]) {
      b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.25, 8, 1, false, 0, Math.PI), P.metal, {
        bone, at: [s * 1.6, 0.6, z], rotation: [0, 0, 90], flat: true,
        scale: [1, 1, 1],
      });
      box(0.3, 0.12, 1.9, P.hullDark, [s * 1.6, 1.5, z]);
      box(0.3, 0.45, 0.14, P.hullDark, [s * 1.6, 1.3, z + 0.95]);
      box(0.3, 0.45, 0.14, P.hullDark, [s * 1.6, 1.3, z - 0.95]);
    }
  // glacis
  box(3.3, 0.18, 1.9, ARMOR, [0, 1.55, 3.7], [-28, 0, 0]);
  box(3.4, 0.6, 0.5, HULL, [0, 1.2, 4.1]);
  // cab block
  box(3.2, 0.9, 2.6, HULL, [0, 2.0, 2.1]);
  box(3.0, 0.5, 2.0, ARMOR, [0, 2.5 - 0.05, 2.0]);
  // sloped cab front
  box(3.0, 0.1, 0.9, ARMOR, [0, 2.35, 3.2], [-35, 0, 0]);
  // windscreen slit
  const visor = glow(box(2.5, 0.2, 0.05, P.neonCyan, [0, 2.3, 3.42], [-35, 0, 0]), 1.6);
  box(2.7, 0.06, 0.06, P.metal, [0, 2.43, 3.45], [-35, 0, 0]);
  box(2.7, 0.06, 0.06, P.metal, [0, 2.17, 3.38], [-35, 0, 0]);
  // side vision ports
  for (const s of [1, -1]) {
    glow(box(0.04, 0.16, 0.7, P.neonCyan, [s * 1.52, 2.35, 2.0]), 1.2);
    box(0.06, 0.24, 0.8, P.metal, [s * 1.51, 2.35, 2.0]);
  }
  // roof hatch
  b.part(new THREE.CylinderGeometry(0.4, 0.45, 0.12, 8), P.armorLight, { bone, at: [0.5, 2.78, 1.9], flat: true });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.steel, { bone, at: [0.5, 2.88, 1.9], flat: true });
  box(0.5, 0.06, 0.5, P.metal, [-0.6, 2.77, 1.6]);
  // headlights
  for (const s of [1, -1]) {
    box(0.5, 0.25, 0.12, P.metal, [s * 1.2, 1.2, 4.28]);
    glow(box(0.36, 0.14, 0.05, P.white, [s * 1.2, 1.2, 4.35]), 1.2);
    box(0.3, 0.3, 0.1, P.hazard, [s * 1.55, 1.2, 4.28]);
    // tow hooks
    box(0.14, 0.14, 0.3, P.steel, [s * 0.7, 0.85, 4.45]);
  }
  // hazard stripes on front bumper
  for (let i = 0; i < 9; i++) box(0.2, 0.18, 0.06, i % 2 ? P.hazard : P.tyre, [-0.8 + i * 0.2, 0.85, 4.3]);
  // rear bumper & tail lights
  box(3.2, 0.3, 0.3, P.metal, [0, 0.9, -4.4]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.2, 0.08, P.warnRed, [s * 1.3, 1.3, -4.52]), 1.3);
    box(0.4, 0.3, 0.06, P.metal, [s * 1.3, 1.3, -4.5]);
    box(0.14, 0.14, 0.3, P.steel, [s * 0.9, 0.85, -4.6]);
  }
  // rear plate
  box(3.2, 0.7, 0.15, DARK, [0, 1.75, -4.42]);
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 1.3, 2.6, 0.9], [s * 1.35, 3.0 + (s > 0 ? 0.2 : 0), 0.85], [0.025, 0.012], P.metal, { bone });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), s > 0 ? P.warnRed : P.hazard, { bone, at: [s * 1.35, 3.0 + (s > 0 ? 0.2 : 0), 0.85] });
    b.part(new THREE.CylinderGeometry(0.12, 0.15, 0.1, 6), P.metal, { bone, at: [s * 1.3, 2.6, 0.9], flat: true });
  }
  // leg mount plates
  for (const s of [1, -1])
    for (const z of [1.4, -2.8]) {
      box(0.1, 0.6, 0.9, P.metal, [s * 1.77, 1.2, z]);
      for (const dz of [-0.3, 0.3]) for (const dy of [-0.2, 0.2])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, { bone, at: [s * 1.83, 1.2 + dy, z + dz], rotation: [0, 0, 90] });
    }
  // deck hazard border
  for (let i = 0; i < 10; i++) box(0.3, 0.02, 0.1, i % 2 ? P.hazard : P.tyre, [-1.35 + i * 0.3, 2.26, 0.9]);
  // vents
  for (let i = 0; i < 5; i++) box(0.8, 0.03, 0.08, P.tyre, [0, 2.27, -3.0 + i * 0.16]);

  // decals: unit number and insignia
  const num = svg(`<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#e8e8e0">R-06</text></svg>`, { size: 128 });
  const badge = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#e8e8e0" stroke="#1a1b1e" stroke-width="2"/><path d="M16 5 L21 20 L16 17 L11 20Z" fill="#c8322a"/><rect x="7" y="23" width="18" height="3" fill="#1a1b1e"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", {
      bone, at: [s * 1.775, 1.8, -1.2], dir: [s, 0, 0], axis: "z", texture: num,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone, at: [s * 1.62, 2.0, 2.0], dir: [s, 0, 0], axis: "z", texture: badge,
    });
  }
  b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", {
    bone, at: [0, 1.75, -4.5], dir: [0, 0, -1], axis: "z", texture: num,
  });
}
```
<!-- call: plan -->

```json
{
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled transporter carrying a long twin-rail railgun, braced on four deployed stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [3.6, 2.6, 9.0],
  "layout": "Long armoured hull on six large wheels (three per side, axles at z=2.8, 0, -2.8) with the cab at the front (+Z) and sloped glacis. Behind the cab a flat deck carries a cradle and the railgun: two parallel rails run from a breech block at z=-3.4 forward over the cab to a muzzle at z=4.6, barrel elevated about 12 degrees, with capacitor banks along the flanks of the deck. Four stabiliser legs fold out diagonally from the hull sides near z=1.6 and z=-3.6, ending in flat pads on the floor. Style: faceted chunky primitives, dark olive-grey armour panels, yellow hazard trim, cyan glowing energy strips on rails and capacitors, rivet and panel-line details as small parts.",
  "palette": {
    "hull": "#4a5240",
    "hullDark": "#2f352b",
    "hullLight": "#6b7558",
    "trim": "#e7b814",
    "metal": "#7d838c",
    "gunmetal": "#2a2d33",
    "tire": "#17181a",
    "rim": "#9aa0a8",
    "glass": "#3b6f86",
    "neonCyan": "#2ff3ff",
    "warnRed": "#d02a2a",
    "lightWhite": "#f2f4e8",
    "pad": "#3a3d40"
  },
  "mounts": {
    "deckTop": [0, 1.7, -1.6],
    "cabRoof": [0, 2.0, 2.6],
    "gunPivot": [0, 2.2, -1.2],
    "breech": [0, 2.35, -3.4],
    "muzzle": [0, 3.0, 4.6],
    "axleFront": [0, 0.7, 2.8],
    "axleMid": [0, 0.7, 0],
    "axleRear": [0, 0.7, -2.8],
    "legFrontL": [1.45, 1.0, 1.6],
    "legRearL": [1.45, 1.0, -3.6]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.5, 0.7, 2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.5, 0.7, 2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.5, 0.7, 0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.5, 0.7, 0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.5, 0.7, -2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.5, 0.7, -2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFL", "parent": "body", "at": [1.45, 1.0, 1.6], "dir": [1, -1, 0], "role": "leg", "group": "stabilisers" },
    { "name": "legFR", "parent": "body", "at": [-1.45, 1.0, 1.6], "dir": [-1, -1, 0], "role": "leg", "group": "stabilisers" },
    { "name": "legRL", "parent": "body", "at": [1.45, 1.0, -3.6], "dir": [1, -1, 0], "role": "leg", "group": "stabilisers" },
    { "name": "legRR", "parent": "body", "at": [-1.45, 1.0, -3.6], "dir": [-1, -1, 0], "role": "leg", "group": "stabilisers" },
    { "name": "gunCradle", "parent": "body", "at": [0, 2.2, -1.2], "dir": [0, 0.2, 1], "role": "hinge", "group": "gun" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured chassis: lower tub, sloped glacis, side skirts over the wheel arches with wheel-arch cutouts suggested by dark boxes, flat rear deck, panel lines, rivets, yellow hazard stripes on the edges, tow hooks, rear bumper with red tail lights, side hatches, front headlights and a small antenna. Colours hull, hullDark, hullLight, trim, warnRed, lightWhite.",
      "box": [[-1.5, 0.8, -4.4], [1.5, 1.8, 4.0]],
      "attaches": "Carries all joints via body; deckTop is its top surface behind the cab; cab sits on cabRoof base; gun cradle on gunPivot; wheels at axle mounts; legs at leg mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Forward command cab on the hull front: angular box with sloped armoured windscreen panels (glass), side windows, roof sensor mast, searchlight, roof hatch, vision slits, yellow trim, antenna pair, wing mirrors, door outlines as thin dark parts, small lit cyan display behind glass.",
      "box": [[-1.3, 1.8, 1.4], [1.3, 2.7, 3.9]],
      "attaches": "Sits on the hull top at cabRoof base (y=1.8); the gun rails pass above the roof.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "runningGear",
      "builds": "Six large chunky low-poly wheels (octagonal tires, radius 0.7, width 0.55, with rim discs, hub caps, bolts and tread blocks) at the axle mounts, each on its wheel joint; axle housings, suspension arms and shock absorbers linking to the hull, mud flaps, and the lower mud guards. Colours tire, rim, metal, gunmetal, hullDark. Wheel bottoms touch y=0.",
      "box": [[-1.9, 0, -3.6], [1.9, 1.4, 3.6]],
      "attaches": "Wheels centred on axleFront, axleMid, axleRear at x=±1.5 and ride wheel joints; suspension arms meet the hull underside.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "railgun",
      "builds": "The railgun on gunCradle: twin parallel rails (square-section, gunmetal) with glowing cyan strips along their inner faces, spaced insulator blocks and clamp rings every 0.6m, a bulky breech block with a heat-sink fin set, a muzzle brake with a flared bracket, a trunnion cradle with elevation hydraulic pistons, capacitor banks (box stacks with cyan glowing lights and warnRed warning tags) along both deck flanks wired to the breech by cable sweeps, hazard-yellow bands, ammunition rack of long slug rods on the rear deck. Barrel elevated about 12 degrees, rising from breech at z=-3.4 to muzzle at z=4.6.",
      "box": [[-1.3, 1.8, -4.4], [1.3, 3.2, 4.8]],
      "attaches": "Cradle pivots on gunPivot and sits on the hull deckTop; rails clear the cab roof by at least 0.3m.",
      "joints": ["gunCradle", "body"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs, each a two-segment jointed strut (outer hydraulic box housing, telescoping piston rod, diagonal brace) folding out from the hull side at the leg mounts down to a wide octagonal foot pad on the floor with a ribbed top, yellow hazard bands, bolts, and small red warning lights. Front pair at z=1.6 and rear pair at z=-3.6, reaching x=±2.7 at the pads. Colours metal, gunmetal, hullDark, trim, pad, warnRed.",
      "box": [[-3.6, 0, -4.2], [3.6, 1.4, 2.1]],
      "attaches": "Root brackets bolted to the hull sides at legFrontL/legRearL mounts (mirrored on x), ride leg joints; pads rest on y=0.",
      "joints": ["legFL", "legFR", "legRL", "legRR"],
      "floor": true,
      "budget": 150
    }
  ]
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRunningGear({ b, J, P, M }: any) {
  const R = 0.7, W = 0.55;
  const r = rng(11);
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.8], ["wheelFR", -1, 2.8],
    ["wheelML", 1, 0], ["wheelMR", -1, 0],
    ["wheelRL", 1, -2.8], ["wheelRR", -1, -2.8],
  ];
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = 1.5 * s;
    const ax: [number, number, number] = [s, 0, 0];
    const outer = cx + s * (W / 2);
    // tire
    b.part(cyl(R, R, W, 8), P.tire, { bone: j, at: [cx, 0.7, z], dir: ax });
    // tread blocks around the tire
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const py = 0.7 + Math.sin(a) * (R + 0.02);
      const pz = z + Math.cos(a) * (R + 0.02);
      b.part(box(W * 0.8, 0.07, 0.2), P.tire, {
        bone: j, at: [cx, py, pz], dir: [0, Math.sin(a), Math.cos(a)], axis: "y",
      });
    }
    // rim disc, ring, hub cap
    b.part(cyl(0.45, 0.45, 0.06, 8), P.rim, { bone: j, at: [outer + s * 0.005, 0.7, z], dir: ax });
    b.part(cyl(0.3, 0.3, 0.05, 8), P.gunmetal, { bone: j, at: [outer + s * 0.04, 0.7, z], dir: ax });
    b.part(cyl(0.14, 0.17, 0.12, 8), P.metal, { bone: j, at: [outer + s * 0.08, 0.7, z], dir: ax });
    // bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.035, 0.035, 0.05, 6), P.metal, {
        bone: j, at: [outer + s * 0.08, 0.7 + Math.sin(a) * 0.23, z + Math.cos(a) * 0.23], dir: ax,
      });
    }
    // mud guard over wheel (arch) and flap
    b.part(box(0.7, 0.08, 1.3), P.hullDark, { bone: J.body, at: [cx + s * 0.02, 1.48, z] });
    b.part(box(0.7, 0.06, 0.2), P.hullDark, { bone: J.body, at: [cx + s * 0.02, 1.42, z + 0.7], rotation: [20, 0, 0] });
    b.part(box(0.7, 0.06, 0.2), P.hullDark, { bone: J.body, at: [cx + s * 0.02, 1.42, z - 0.7], rotation: [-20, 0, 0] });
    b.part(box(0.4, 0.45, 0.04), P.tire, { bone: J.body, at: [cx + s * 0.02, 0.45, z - 0.8] });
    b.part(box(0.3, 0.06, 0.05), P.trim, { bone: J.body, at: [cx + s * 0.02, 0.28, z - 0.82] });
    // axle stub from housing to hub
    b.part(cyl(0.1, 0.1, 0.5, 8), P.metal, { bone: J.body, at: [1.2 * s, 0.7, z], dir: ax });
    // suspension arm (upper and lower wishbone)
    b.rod([1.0 * s, 1.0, z + 0.3], [1.3 * s, 0.75, z + 0.1], 0.05, P.gunmetal, { bone: J.body });
    b.rod([1.0 * s, 1.0, z - 0.3], [1.3 * s, 0.75, z - 0.1], 0.05, P.gunmetal, { bone: J.body });
    // shock absorber
    b.rod([1.1 * s, 0.9, z + 0.35], [1.25 * s, 1.35, z + 0.35], 0.06, P.metal, { bone: J.body });
    b.rod([1.1 * s, 0.9, z + 0.35], [1.17 * s, 1.1, z + 0.35], 0.09, P.trim, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), P.gunmetal, { bone: J.body, at: [1.25 * s, 1.35, z + 0.35] });
  }

  // axle housings across the hull and differentials
  for (const z of [2.8, 0, -2.8]) {
    b.part(cyl(0.12, 0.12, 2.4, 8), P.gunmetal, { bone: J.body, at: [0, 0.7, z], dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), P.hullDark, { bone: J.body, at: [0, 0.7, z] });
    b.part(cyl(0.1, 0.1, 0.06, 8), P.trim, { bone: J.body, at: [0, 0.7, z + 0.27], dir: [0, 0, 1] });
    b.part(box(0.4, 0.1, 0.3), P.hullDark, { bone: J.body, at: [0, 0.95, z] });
  }
  // driveshaft
  b.part(cyl(0.07, 0.07, 5.6, 6), P.metal, { bone: J.body, at: [0, 0.82, 0], dir: [0, 0, 1] });
  void r; void frame; void M;
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, seg: number, color: string, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, dir });

  // lower tub and upper hull
  box(2.8, 0.5, 8.4, P.hullDark, [0, 1.0, -0.2]);
  box(3.0, 0.5, 8.0, P.hull, [0, 1.5, -0.4]);
  // flat rear deck plating
  box(2.6, 0.08, 4.6, P.hullLight, [0, 1.79, -2.1]);
  // sloped glacis
  box(2.9, 0.12, 1.5, P.hull, [0, 1.5, 3.55], [-0.45, 0, 0]);
  box(2.9, 0.1, 1.2, P.hullLight, [0, 1.6, 3.5], [-0.45, 0, 0]);
  // front nose block
  box(2.9, 0.7, 0.4, P.hullDark, [0, 1.15, 3.9]);

  // side skirts, arch cutouts, hazard stripes, hatches
  for (const s of [1, -1]) {
    box(0.12, 0.45, 8.0, P.hullLight, [s * 1.52, 1.55, -0.3]);
    box(0.1, 0.12, 8.0, P.hullDark, [s * 1.55, 1.2, -0.3]);
    for (const z of [2.8, 0, -2.8]) {
      box(0.16, 0.45, 1.5, P.hullDark, [s * 1.5, 1.0, z]);
      box(0.18, 0.06, 1.55, P.trim, [s * 1.5, 1.28, z]);
    }
    // hazard stripes at deck edge
    for (let i = 0; i < 14; i++) {
      const z = -4.0 + i * 0.52;
      box(0.06, 0.08, 0.26, P.trim, [s * 1.3, 1.84, z], [0, 0, 0]);
    }
    // side hatches
    for (const z of [1.4, -1.4]) {
      box(0.06, 0.4, 0.8, P.hullDark, [s * 1.54, 1.6, z]);
      box(0.08, 0.3, 0.7, P.hull, [s * 1.56, 1.6, z]);
      box(0.1, 0.05, 0.12, P.metal, [s * 1.6, 1.6, z + s * 0.25]);
    }
    // panel lines
    for (const z of [-3.6, -2.2, 0.7, 2.2]) box(0.02, 0.4, 0.03, P.hullDark, [s * 1.58, 1.55, z]);
    // headlights
    box(0.35, 0.22, 0.1, P.hullDark, [s * 1.0, 1.1, 4.12]);
    box(0.28, 0.16, 0.1, P.lightWhite, [s * 1.0, 1.1, 4.17]);
    // tail lights
    box(0.4, 0.2, 0.08, P.hullDark, [s * 1.0, 1.15, -4.43]);
    box(0.32, 0.14, 0.08, P.warnRed, [s * 1.0, 1.15, -4.47]);
    // tow hooks
    cyl(0.05, 0.4, 8, P.metal, [s * 0.9, 0.95, 4.2], [0, 0, 1]);
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.metal, { bone, at: [s * 0.9, 0.95, 4.42], dir: [0, 0, 1], axis: "z" });
    cyl(0.05, 0.4, 8, P.metal, [s * 1.2, 0.95, -4.5], [0, 0, 1]);
    // front yellow corner bars
    box(0.1, 0.5, 0.1, P.trim, [s * 1.48, 1.3, 4.0]);
    box(0.1, 0.5, 0.1, P.trim, [s * 1.48, 1.3, -4.4]);
  }

  // rear bumper
  box(3.0, 0.3, 0.3, P.hullDark, [0, 0.95, -4.4]);
  for (let i = 0; i < 8; i++) box(0.18, 0.28, 0.06, i % 2 ? P.hullDark : P.trim, [-1.2 + i * 0.34, 0.95, -4.58]);
  // front bumper hazard
  for (let i = 0; i < 8; i++) box(0.18, 0.12, 0.06, i % 2 ? P.hullDark : P.trim, [-1.2 + i * 0.34, 0.9, 4.12]);
  // grille
  box(1.2, 0.3, 0.06, P.gunmetal, [0, 1.15, 4.14]);
  for (let i = 0; i < 5; i++) box(1.1, 0.03, 0.04, P.metal, [0, 1.07 + i * 0.06, 4.18]);

  // rear deck hatches and vents
  box(0.8, 0.05, 0.8, P.hullDark, [0.6, 1.85, -3.2]);
  box(0.7, 0.04, 0.7, P.hull, [0.6, 1.88, -3.2]);
  for (let i = 0; i < 5; i++) box(0.6, 0.02, 0.04, P.gunmetal, [-0.7, 1.84, -3.5 + i * 0.12]);
  box(1.4, 0.03, 0.04, P.hullDark, [0, 1.84, -0.7]);
  box(1.4, 0.03, 0.04, P.hullDark, [0, 1.84, -2.4]);

  // rivets along deck edges and glacis
  const rivet = new THREE.SphereGeometry(0.03, 5, 3);
  for (const s of [1, -1])
    for (let i = 0; i < 16; i++) {
      b.part(rivet, P.metal, { bone, at: [s * 1.4, 1.82, -4.2 + i * 0.3 + R() * 0.02] });
    }
  for (let i = 0; i < 7; i++) b.part(rivet, P.metal, { bone, at: [-1.3 + i * 0.43, 1.82, 3.0] });

  // antenna at rear corner
  cyl(0.025, 1.0, 6, P.gunmetal, [-1.3, 2.3, -4.1], [0, 1, 0]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [-1.3, 2.82, -4.1] });
  box(0.2, 0.15, 0.2, P.hullDark, [-1.3, 1.88, -4.1]);
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildStabilisers({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const legs: [string, number, number][] = [
    ["legFL", 1, 1.6],
    ["legFR", -1, 1.6],
    ["legRL", 1, -3.6],
    ["legRR", -1, -3.6],
  ];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);

  for (const [name, s, z] of legs) {
    const bone = J[name];
    // key points
    const root = new THREE.Vector3(s * 1.5, 1.05, z);
    const knee = new THREE.Vector3(s * 2.05, 0.95, z);
    const foot = new THREE.Vector3(s * 2.7, 0.2, z);
    const aimDir = (a: THREE.Vector3, c: THREE.Vector3) => c.clone().sub(a).normalize().toArray();
    const midp = (a: THREE.Vector3, c: THREE.Vector3, t = 0.5) => a.clone().lerp(c, t);

    // root bracket plate bolted to hull
    b.part(box(0.12, 0.5, 0.6), P.gunmetal, { bone, at: [s * 1.53, 1.05, z] });
    b.part(box(0.3, 0.4, 0.5), P.hullDark, { bone, at: [s * 1.68, 1.05, z] });
    for (const dz of [-0.2, 0.2])
      for (const dy of [-0.15, 0.15])
        b.part(cyl(0.035, 0.035, 0.05, 6), P.metal, { bone, at: [s * 1.6, 1.05 + dy, z + dz], dir: [1, 0, 0] });
    // pivot cylinder
    b.part(cyl(0.16, 0.16, 0.5, 8), P.metal, { bone, at: [s * 1.85, 1.0, z], dir: [0, 0, 1] });

    // upper housing: box from pivot to knee
    const hs = new THREE.Vector3(s * 1.85, 1.0, z);
    const hl = hs.distanceTo(knee) + 0.35;
    const hm = midp(hs, knee, 0.6);
    b.part(box(0.34, hl, 0.34), P.gunmetal, { bone, at: hm.toArray(), dir: aimDir(hs, knee) });
    // hazard bands
    for (const t of [0.35, 0.8]) {
      b.part(box(0.37, 0.09, 0.37), P.trim, {
        bone,
        at: midp(hs, knee, t).toArray(),
        dir: aimDir(hs, knee),
      });
    }
    // lower telescoping piston rod
    const rodLen = knee.distanceTo(foot);
    b.part(cyl(0.1, 0.1, rodLen + 0.2, 8), P.metal, {
      bone,
      at: midp(knee, foot, 0.5).toArray(),
      dir: aimDir(knee, foot),
    });
    b.part(cyl(0.15, 0.15, 0.35, 8), P.hullDark, {
      bone,
      at: midp(knee, foot, 0.12).toArray(),
      dir: aimDir(knee, foot),
    });
    b.part(cyl(0.17, 0.17, 0.08, 8), P.trim, {
      bone,
      at: midp(knee, foot, 0.28).toArray(),
      dir: aimDir(knee, foot),
    });
    // diagonal brace from hull underside to rod
    const bs = new THREE.Vector3(s * 1.5, 0.8, z);
    const be = midp(knee, foot, 0.62);
    b.part(box(0.1, bs.distanceTo(be), 0.12), P.hullDark, {
      bone,
      at: midp(bs, be).toArray(),
      dir: aimDir(bs, be),
    });
    b.part(cyl(0.07, 0.07, 0.16, 6), P.metal, { bone, at: bs.toArray(), dir: [0, 0, 1] });
    b.part(cyl(0.07, 0.07, 0.16, 6), P.metal, { bone, at: be.toArray(), dir: [0, 0, 1] });

    // foot ball joint
    b.part(new THREE.SphereGeometry(0.16, 8, 6), P.metal, { bone, at: [foot.x, 0.3, z] });
    // pad: octagon
    b.part(cyl(0.55, 0.62, 0.14, 8), P.pad, { bone, at: [foot.x, 0.07, z], rotation: [0, 22.5, 0] });
    b.part(cyl(0.5, 0.5, 0.05, 8), P.gunmetal, { bone, at: [foot.x, 0.165, z], rotation: [0, 22.5, 0] });
    // ribs on top
    for (let i = -2; i <= 2; i++)
      b.part(box(0.9, 0.06, 0.07), P.hullDark, { bone, at: [foot.x, 0.2, z + i * 0.17] });
    // hazard rim blocks
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      if (i % 2 === 0)
        b.part(box(0.2, 0.05, 0.09), P.trim, {
          bone,
          at: [foot.x + Math.cos(a) * 0.5, 0.165, z + Math.sin(a) * 0.5],
          rotation: [0, (-a * 180) / Math.PI, 0],
        });
      else
        b.part(cyl(0.03, 0.03, 0.04, 6), P.metal, {
          bone,
          at: [foot.x + Math.cos(a) * 0.48, 0.18, z + Math.sin(a) * 0.48],
        });
    }
    // warning light
    b.part(cyl(0.05, 0.06, 0.08, 6), P.warnRed, { bone, at: [s * 1.95, 1.22, z + 0.0] });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [foot.x - s * 0.3, 0.26, z + 0.45] });
    // housing bolts
    for (let i = 0; i < 3; i++) {
      const p = midp(hs, knee, 0.15 + i * 0.3);
      b.part(cyl(0.03, 0.03, 0.04, 6), P.metal, { bone, at: [p.x, p.y + 0.18, p.z + 0.0 + (R() - 0.5) * 0.02] });
    }
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(5);
  const DARK = "#14181c";
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, rotation: rot, flat: true });

  // main cab body (y 1.8..2.7, z 1.4..3.9)
  box(2.5, 0.55, 2.5, P.hull, [0, 2.075, 2.65]);
  // upper greenhouse, set back, narrower
  box(2.2, 0.45, 1.5, P.hullLight, [0, 2.475, 2.35]);
  // sloped nose (front slab leaning)
  box(2.4, 0.55, 0.9, P.hull, [0, 2.1, 3.55], [-25, 0, 0]);
  // roof plate
  box(2.3, 0.08, 1.6, P.hullDark, [0, 2.7, 2.35]);
  // windscreen panels, sloped
  for (const s of [1, -1]) {
    box(1.0, 0.42, 0.05, P.glass, [s * 0.55, 2.42, 3.13], [-35, 0, 0]);
    box(0.06, 0.46, 0.08, P.hullDark, [s * 1.12, 2.42, 3.12], [-35, 0, 0]);
  }
  box(0.08, 0.46, 0.08, P.hullDark, [0, 2.42, 3.13], [-35, 0, 0]);
  box(2.3, 0.06, 0.08, P.trim, [0, 2.66, 3.04]);
  // side windows, door outlines, handles, hazard trim
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.95, P.glass, [s * 1.11, 2.5, 2.4]);
    box(0.04, 0.34, 0.05, P.hullDark, [s * 1.12, 2.5, 1.9]);
    box(0.04, 0.34, 0.05, P.hullDark, [s * 1.12, 2.5, 2.9]);
    // door outline
    box(0.03, 0.04, 1.1, DARK, [s * 1.26, 1.98, 2.35]);
    box(0.03, 0.04, 1.1, DARK, [s * 1.26, 2.5, 2.35]);
    box(0.03, 0.55, 0.04, DARK, [s * 1.26, 2.25, 1.8]);
    box(0.03, 0.55, 0.04, DARK, [s * 1.26, 2.25, 2.9]);
    box(0.05, 0.05, 0.18, P.metal, [s * 1.27, 2.2, 2.75]);
    // yellow trim stripe
    box(0.03, 0.06, 2.3, P.trim, [s * 1.26, 1.88, 2.65]);
    // vision slits on nose sides
    box(0.04, 0.07, 0.4, DARK, [s * 1.2, 2.2, 3.4]);
    // mirrors
    box(0.05, 0.3, 0.2, P.hullDark, [s * 1.52, 2.35, 3.0]);
    box(0.02, 0.26, 0.16, P.metal, [s * 1.55, 2.35, 3.0]);
    b.rod([s * 1.25, 2.4, 3.0], [s * 1.5, 2.38, 3.0], 0.025, P.gunmetal, { bone });
    // headlights
    box(0.3, 0.14, 0.06, P.lightWhite, [s * 0.85, 1.98, 3.78], [-25, 0, 0]);
    box(0.36, 0.04, 0.06, P.trim, [s * 0.85, 1.85, 3.83], [-25, 0, 0]);
    // antennae
    b.rod([s * 0.95, 2.74, 1.7], [s * 0.95 + s * 0.08, 3.45, 1.6], 0.018, P.gunmetal, { bone });
    cyl(0.04, 0.04, 0.05, 6, P.warnRed, [s * 0.95 + s * 0.08, 3.46, 1.6]);
    box(0.12, 0.06, 0.12, P.hullDark, [s * 0.95, 2.76, 1.7]);
  }
  // front grille slits
  for (let i = 0; i < 5; i++) box(0.9, 0.035, 0.04, DARK, [0, 1.9 + i * 0.07, 3.82 + i * 0.0], [-25, 0, 0]);
  // front hazard bar
  box(2.4, 0.07, 0.1, P.trim, [0, 1.84, 3.86]);
  // cyan display behind glass
  box(0.5, 0.2, 0.03, P.neonCyan, [0, 2.38, 3.0], [-35, 0, 0]);
  box(0.54, 0.24, 0.02, DARK, [0, 2.38, 2.99], [-35, 0, 0]);
  // roof hatch
  cyl(0.3, 0.3, 0.06, 8, P.hullDark, [-0.5, 2.77, 2.0]);
  cyl(0.22, 0.22, 0.05, 8, P.hullLight, [-0.5, 2.82, 2.0]);
  box(0.16, 0.05, 0.05, P.metal, [-0.5, 2.87, 2.0]);
  // roof sensor mast
  cyl(0.06, 0.08, 0.5, 6, P.gunmetal, [0.5, 2.99, 2.1]);
  box(0.3, 0.12, 0.12, P.metal, [0.5, 3.28, 2.1]);
  cyl(0.07, 0.07, 0.05, 8, P.neonCyan, [0.5, 3.28, 2.17], [90, 0, 0]);
  cyl(0.1, 0.1, 0.03, 8, P.metal, [0.5, 3.38, 2.1]);
  // searchlight
  box(0.14, 0.14, 0.14, P.gunmetal, [0.9, 2.79, 3.0]);
  cyl(0.12, 0.09, 0.2, 8, P.hullDark, [0.9, 2.9, 3.05], [70, 0, 0]);
  cyl(0.09, 0.09, 0.03, 8, P.lightWhite, [0.9, 2.93, 3.16], [70, 0, 0]);
  // roof rivets
  for (let i = 0; i < 10; i++) {
    const x = (R() - 0.5) * 1.9;
    const z = 1.65 + R() * 1.4;
    cyl(0.025, 0.025, 0.03, 5, P.metal, [x, 2.76, z]);
  }
  // rear wall hazard stripes and panel lines
  box(2.3, 0.4, 0.04, P.hullDark, [0, 2.3, 1.62]);
  for (let i = 0; i < 6; i++) box(0.18, 0.06, 0.05, i % 2 ? DARK : P.trim, [-0.9 + i * 0.36, 2.62, 1.64]);
  // lower side armour panel lines
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) box(0.03, 0.3, 0.03, P.hullDark, [s * 1.26, 2.0, 1.7 + i * 0.5 + 0.2]);
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRailgun({ b, J, P, M }: any) {
  const cr = J.gunCradle, body = J.body;
  const tilt = Math.atan2(M.muzzle[1] - M.breech[1], M.muzzle[2] - M.breech[2]);
  // point along gun axis: z along barrel, y offset perpendicular-ish
  const gp = (x: number, z: number, y = 0): [number, number, number] => {
    const t = z - M.breech[2];
    return [x, M.breech[1] + t * Math.tan(tilt) + y / Math.cos(tilt), z];
  };
  const box = (s: number[], c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { bone: o.bone ?? cr, at, rotation: o.rot, ...(o.extra || {}) });
  const rotX = [-tilt * 180 / Math.PI, 0, 0];
  const len = M.muzzle[2] - M.breech[2] + 0.4;
  const zc = (M.muzzle[2] + M.breech[2]) / 2;
  const slen = len / Math.cos(tilt);

  // rails
  for (const s of [1, -1]) {
    box([0.26, 0.34, slen], P.gunmetal, gp(s * 0.4, zc), { rot: rotX });
    glow(box([0.04, 0.2, slen * 0.96], P.neonCyan, gp(s * 0.25, zc), { rot: rotX }), 1.5);
    box([0.3, 0.06, slen], P.metal, gp(s * 0.4, zc, 0.2), { rot: rotX });
  }
  // insulators and clamp rings every 0.6m
  for (let z = -3.0; z <= 4.3; z += 0.6) {
    box([1.2, 0.2, 0.16], P.hullDark, gp(0, z), { rot: rotX });
    for (const s of [1, -1]) box([0.34, 0.4, 0.1], P.metal, gp(s * 0.4, z), { rot: rotX });
  }
  for (const z of [-2.2, 0, 2.2, 3.8]) {
    box([1.18, 0.4, 0.12], P.trim, gp(0, z, 0), { rot: rotX });
    box([0.7, 0.42, 0.14], P.gunmetal, gp(0, z, 0), { rot: rotX });
  }
  // breech block + fins
  box([1.1, 0.8, 1.0], P.hullDark, gp(0, -3.5), { rot: rotX });
  box([0.9, 0.5, 0.2], P.gunmetal, gp(0, -4.05), { rot: rotX });
  glow(box([0.5, 0.1, 0.05], P.neonCyan, gp(0, -4.17, 0.1), { rot: rotX }), 1.5);
  for (let i = 0; i < 6; i++) box([1.0, 0.05, 0.7], P.metal, gp(0, -3.75 + i * 0.1, 0.5), { rot: rotX });
  box([1.12, 0.1, 0.16], P.trim, gp(0, -3.2), { rot: rotX });
  // muzzle brake and flared bracket
  box([1.0, 0.5, 0.4], P.gunmetal, gp(0, 4.5), { rot: rotX });
  box([1.2, 0.12, 0.5], P.trim, gp(0, 4.5, 0.3), { rot: rotX });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.5, 0.5), P.metal, { bone: cr, at: gp(s * 0.62, 4.5), rotation: [rotX[0], s * 20, 0] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.3), P.hullDark, { bone: cr, at: gp(s * 0.3, 4.72), rotation: rotX });
  }
  // trunnion cradle and hydraulics
  for (const s of [1, -1]) {
    box([0.2, 0.7, 0.9], P.hullDark, [s * 0.75, 2.2, -1.2], { bone: body });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), P.metal, { bone: cr, at: [s * 0.75, 2.45, -1.2], rotation: [0, 0, 90] });
    b.rod([s * 0.9, 1.85, -1.8], [s * 0.7, 2.35, -0.6], 0.07, P.metal, { bone: body });
    b.rod([s * 0.9, 1.85, -1.8], [s * 0.8, 2.05, -1.4], 0.1, P.gunmetal, { bone: body });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.rim, { bone: body, at: [s * 0.9, 1.85, -1.8] });
  }
  box([1.4, 0.15, 1.0], P.gunmetal, [0, 2.15, -1.2], { bone: body });
  // capacitor banks
  for (const s of [1, -1]) {
    for (let k = 0; k < 4; k++) {
      const z = -3.3 + k * 0.85;
      box([0.4, 0.7, 0.7], P.hull, [s * 1.1, 2.15, z], { bone: body });
      box([0.42, 0.06, 0.72], P.trim, [s * 1.1, 2.4, z], { bone: body });
      glow(box([0.05, 0.4, 0.5], P.neonCyan, [s * 1.31, 2.15, z], { bone: body }), 1.4);
      box([0.04, 0.14, 0.2], P.warnRed, [s * 1.31, 2.45, z + 0.22], { bone: body });
      b.part(new THREE.SphereGeometry(0.04, 5, 4), P.rim, { bone: body, at: [s * 1.1, 2.52, z - 0.25] });
    }
    // cable sweeps to breech
    b.sweep(
      [[s * 1.0, 2.5, -3.3], [s * 0.9, 2.75, -3.5], [s * 0.6, 2.7, -3.55]],
      0.04, P.gunmetal, { bone: body },
    );
    b.sweep(
      [[s * 1.0, 2.4, -2.5], [s * 1.0, 2.7, -2.9], [s * 0.7, 2.75, -3.4]],
      0.035, P.warnRed, { bone: body },
    );
  }
  // ammo rack of slugs
  box([1.0, 0.1, 0.9], P.hullDark, [0, 1.85, -3.9], { bone: body });
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), i % 2 ? P.metal : P.rim, {
      bone: body, at: [-0.4 + i * 0.2, 1.97, -3.9], rotation: [90, 0, 0],
    });
    b.part(new THREE.ConeGeometry(0.06, 0.12, 6), P.trim, { bone: body, at: [-0.4 + i * 0.2, 1.97, -3.44], rotation: [90, 0, 0] });
  }
}
```
<!-- call: plan -->

```json
{
  "name": "Longspear Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military railgun carrier with a long twin-rail cannon, braced on four hydraulic stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [3.6, 3.2, 10.0],
  "layout": "A long angular 6x6 carrier facing +Z. Front: a wedge-nosed armoured cab (z 2.6 to 4.4) with a slanted glass visor glowing cyan, headlights and a roof sensor mast. Behind the cab, a low flat chassis deck (top y 1.5) carrying a rotating turret ring at z -1.2 on which sits a boxy gun cradle with the long twin-rail railgun pointing forward over the cab, barrel tip near z 5.0, raised about 12 degrees, with a rear capacitor bank with glowing cyan coils behind it. Six big chunky wheels (three per side, axles at z 3.2, 0.4, -2.6, x +-1.45, radius 0.62, hubs on y 0.62) sit under fenders; the wheels touch the floor. Four stabiliser legs fold out diagonally from the chassis at the corners (x +-2.0 to 2.6) with pads on the floor (y 0). Style: faceted low-poly sci-fi military, olive-drab and dark gunmetal panels, yellow hazard stripes on legs and fenders, cyan glow on rails, coils and visor, small separate parts for bolts, vents, lights, decals and number stencils.",
  "palette": {
    "hull": "#4a5240",
    "hullDark": "#2f3529",
    "hullLight": "#6a7458",
    "gunmetal": "#3a3f48",
    "darkSteel": "#1f2228",
    "steel": "#8a919c",
    "hazard": "#e7b814",
    "hazardBlack": "#15151a",
    "neonCyan": "#2ff3ff",
    "glassDark": "#12303a",
    "tire": "#17181b",
    "rim": "#5b616b",
    "lightWhite": "#fff6d6",
    "red": "#c62d2d",
    "decalWhite": "#e8e8e0",
    "rubber": "#26272b",
    "copper": "#b8733a"
  },
  "mounts": {
    "chassisTop": [0, 1.5, 0],
    "turretRing": [0, 1.5, -1.2],
    "gunPivot": [0, 2.55, -0.6],
    "muzzle": [0, 3.0, 5.0],
    "cabRoof": [0, 2.6, 3.5],
    "axleFront": [0, 0.62, 3.2],
    "axleMid": [0, 0.62, 0.4],
    "axleRear": [0, 0.62, -2.6],
    "legFrontL": [1.7, 1.1, 2.2],
    "legRearL": [1.7, 1.1, -3.4]
  },
  "joints": [
    { "name": "body", "at": [0, 1.1, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.5, 3.4], "dir": [0, 0, 1], "role": "hinge", "group": "cab" },
    { "name": "turret", "parent": "body", "at": [0, 1.5, -1.2], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gun", "parent": "turret", "at": [0, 2.55, -0.6], "dir": [0, 0.2, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.45, 0.62, 3.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.45, 0.62, 3.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.45, 0.62, 0.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.45, 0.62, 0.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.45, 0.62, -2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.45, 0.62, -2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFL", "parent": "body", "at": [1.7, 1.1, 2.2], "dir": [1, -1, 0.3], "role": "leg", "group": "legs" },
    { "name": "legFR", "parent": "body", "at": [-1.7, 1.1, 2.2], "dir": [-1, -1, 0.3], "role": "leg", "group": "legs" },
    { "name": "legRL", "parent": "body", "at": [1.7, 1.1, -3.4], "dir": [1, -1, -0.3], "role": "leg", "group": "legs" },
    { "name": "legRR", "parent": "body", "at": [-1.7, 1.1, -3.4], "dir": [-1, -1, -0.3], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Main hull and frame: a long faceted lower hull box with sloped front and rear plates, flat deck top at y 1.5 with panel seams, vent grilles, bolts, hullDark skirt plates, rear tow hooks and rear lamps, hazard-striped bumper, side tool boxes, a short ring plinth at turretRing, fuel/ammo hatches and white stencil number decals. Colours hull, hullDark, hullLight, darkSteel, hazard, red, decalWhite.",
      "box": [[-1.7, 0.7, -5.0], [1.7, 1.6, 3.0]],
      "attaches": "Cab starts at its front face (z 3.0); turret sits on turretRing; wheels and legs hang off the sides at the axle and leg mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armoured wedge cab: faceted sloped nose, angled cyan-glow visor (glassDark with neonCyan frame lines), side armour plates with hazard chevrons, twin headlights (lightWhite, glowing), roof sensor mast with dish and antenna, smoke launchers, mirrors, door seams and handles, lower bumper with tow loops. Colours hull, hullLight, gunmetal, glassDark, neonCyan, lightWhite, hazard, steel.",
      "box": [[-1.6, 1.0, 3.0], [1.6, 2.8, 4.5]],
      "attaches": "Sits on chassis front at z 3.0 and chassisTop; roof at cabRoof; the railgun passes over the cab roof above it.",
      "joints": ["cab"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "runningGear",
      "builds": "Six chunky low-poly wheels (octagonal tyres in tire with tread block parts, rim and hub discs in rim, bolt rings, hubcaps with a small hazard dot), axles and suspension arms in darkSteel, and fender arches over each wheel in hullDark with hazard stripe edges and mud flaps in rubber. Wheels touch y 0. Wheel groups ride wheelFL.. wheelRR joints.",
      "box": [[-2.1, 0, -3.3], [2.1, 1.4, 3.9]],
      "attaches": "Axles at axleFront, axleMid, axleRear on the chassis flanks at x +-1.45; fenders attach to the chassis sides.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs: each has a chassis-side bracket and hinge block, an upper hydraulic arm angled outward and down, a telescoping steel piston rod with a ring collar, a diagonal brace strut, and a wide octagonal foot pad on y 0 with rubber underplate and bolts. Hazard-black stripes on arms, cyan status light on each hinge. Joints legFL, legFR, legRL, legRR. Pads at about x +-2.6, z 2.4 and -3.6.",
      "box": [[-2.9, 0, -4.2], [2.9, 1.5, 3.0]],
      "attaches": "Brackets bolt to chassis flanks at legFrontL / legRearL mounts (mirrored in x); feet on the floor outside the wheels.",
      "joints": ["legFL", "legFR", "legRL", "legRR", "body"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "railgun",
      "builds": "Rotating turret and railgun: low octagonal turret base ring on turretRing, boxy gun cradle with side plates and trunnion pivots at gunPivot, a long twin-rail barrel (two parallel gunmetal rails with a glowing neonCyan inner channel and strip, stepped rail clamps every half metre, muzzle brake block at muzzle), raised about 12 degrees so the tip reaches z 5.0 y 3.0, rear capacitor bank box with copper coils and glowing cyan ring rings, cooling fins, hydraulic elevation cylinders, ammo slug rack, ladder and handrails on the turret roof, hazard muzzle band, small warning decals. Colours gunmetal, darkSteel, steel, neonCyan, copper, hazard, hull.",
      "box": [[-1.3, 1.5, -4.2], [1.3, 3.2, 5.0]],
      "attaches": "Turret base on turretRing (chassis deck y 1.5); gun pivot at gunPivot; barrel passes over cabRoof, staying above y 2.8 at the cab.",
      "joints": ["turret", "gun"],
      "floor": false,
      "budget": 220
    }
  ]
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const WR = 0.62;
  const TW = 0.5; // tyre width
  const axles: [string, number, number][] = [
    ["F", 3.2, 0],
    ["M", 0.4, 1],
    ["R", -2.6, 2],
  ];
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);

  for (const [tag, z] of axles.map((a) => [a[0], a[1]] as [string, number])) {
    for (const s of [1, -1]) {
      const side = s > 0 ? "L" : "R";
      const wj = J["wheel" + tag + side] || J.body;
      const cx = s * 1.45;
      const out = [s, 0, 0] as [number, number, number];
      // tyre (axis along x)
      const rotZ: [number, number, number] = [0, 0, 90];
      b.part(cyl(WR, WR, TW, 8), P.tire, { bone: wj, at: [cx, WR, z], rotation: rotZ, flat: true });
      // sidewall inner shoulders
      for (const k of [1, -1]) {
        b.part(cyl(WR * 0.9, WR * 0.97, 0.06, 8), P.rubber, {
          bone: wj, at: [cx + s * k * (TW / 2 + 0.01), WR, z], rotation: rotZ, flat: true,
        });
      }
      // tread blocks around
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const py = WR + Math.sin(a) * (WR + 0.03);
        const pz = z + Math.cos(a) * (WR + 0.03);
        b.part(new THREE.BoxGeometry(TW * 0.92, 0.1, 0.2), P.darkSteel, {
          bone: wj, at: [cx, py - 0.0, pz], rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        });
      }
      // rim and hub on outer face
      const fx = cx + s * (TW / 2 + 0.04);
      b.part(cyl(0.4, 0.4, 0.08, 8), P.rim, { bone: wj, at: [fx, WR, z], rotation: rotZ, flat: true });
      b.part(cyl(0.3, 0.3, 0.04, 8), P.gunmetal, { bone: wj, at: [fx + s * 0.04, WR, z], rotation: rotZ, flat: true });
      b.part(cyl(0.16, 0.2, 0.14, 8), P.steel, { bone: wj, at: [fx + s * 0.1, WR, z], rotation: rotZ, flat: true });
      b.part(cyl(0.06, 0.06, 0.03, 8), P.hazard, { bone: wj, at: [fx + s * 0.18, WR, z], rotation: rotZ });
      // bolt ring
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.part(cyl(0.028, 0.028, 0.05, 6), P.darkSteel, {
          bone: wj, at: [fx + s * 0.07, WR + Math.sin(a) * 0.34, z + Math.cos(a) * 0.34], rotation: rotZ,
        });
      }
      // axle stub and suspension arm
      b.part(cyl(0.09, 0.09, 0.5, 8), P.darkSteel, { bone: wj, at: [s * 1.2, WR, z], rotation: rotZ });
      const arm = b.rod([s * 1.05, WR + 0.02, z], [s * 1.4, 1.12, z + 0.0], 0.07, P.darkSteel, { bone: J.body });
      b.rod([s * 1.15, 0.95, z - 0.35], [s * 1.2, 0.72, z - 0.05], 0.05, P.darkSteel, { bone: J.body });
      b.part(new THREE.BoxGeometry(0.22, 0.2, 0.34), P.gunmetal, { bone: J.body, at: [s * 1.3, 1.02, z] });
      // shock absorber
      b.rod([s * 1.35, 0.7, z + 0.3], [s * 1.5, 1.12, z + 0.15], 0.035, P.copper, { bone: J.body });

      // fender arch: top plate + front/back slanted plates
      const fy = 1.3;
      b.part(new THREE.BoxGeometry(0.62, 0.07, 1.2), P.hullDark, { bone: J.body, at: [s * 1.68, fy, z], flat: true });
      b.part(new THREE.BoxGeometry(0.62, 0.07, 0.4), P.hullDark, {
        bone: J.body, at: [s * 1.68, fy - 0.12, z + 0.72], rotation: [-30, 0, 0],
      });
      b.part(new THREE.BoxGeometry(0.62, 0.07, 0.4), P.hullDark, {
        bone: J.body, at: [s * 1.68, fy - 0.12, z - 0.72], rotation: [30, 0, 0],
      });
      // outer lip
      b.part(new THREE.BoxGeometry(0.06, 0.16, 1.5), P.hullDark, { bone: J.body, at: [s * 1.98, fy - 0.04, z] });
      // hazard stripes on lip
      for (let i = 0; i < 5; i++) {
        b.part(new THREE.BoxGeometry(0.02, 0.12, 0.13), P.hazard, {
          bone: J.body, at: [s * 2.015, fy - 0.04, z - 0.6 + i * 0.3], rotation: [0, 0, 0],
        });
        b.part(new THREE.BoxGeometry(0.02, 0.12, 0.1), P.hazardBlack, {
          bone: J.body, at: [s * 2.015, fy - 0.04, z - 0.45 + i * 0.3],
        });
      }
      // top bolts
      for (const dz of [-0.45, 0, 0.45]) {
        b.part(cyl(0.035, 0.035, 0.03, 6), P.steel, { bone: J.body, at: [s * 1.68, fy + 0.05, z + dz] });
      }
      // mud flap behind wheel
      const fz = z - 0.78;
      b.part(new THREE.BoxGeometry(0.5, 0.42, 0.04), P.rubber, { bone: J.body, at: [s * 1.68, 0.88, fz], flat: true });
      b.part(new THREE.BoxGeometry(0.5, 0.06, 0.05), P.hazard, { bone: J.body, at: [s * 1.68, 0.7, fz] });
      b.part(new THREE.BoxGeometry(0.1, 0.1, 0.05), P.steel, { bone: J.body, at: [s * 1.68, 1.12, fz] });
      // mud splatter
      for (let i = 0; i < 2; i++) {
        b.part(new THREE.BoxGeometry(0.12 + R() * 0.1, 0.06, 0.02), P.hullDark, {
          bone: J.body, at: [s * 1.68 + (R() - 0.5) * 0.25, 0.85 + R() * 0.15, fz - 0.025],
        });
      }
    }
    // cross axle housing between sides
    b.part(cyl(0.1, 0.1, 2.2, 8), P.darkSteel, { bone: J.body, at: [0, WR, z], rotation: [0, 0, 90] });
    b.part(new THREE.BoxGeometry(0.5, 0.3, 0.4), P.gunmetal, { bone: J.body, at: [0, WR + 0.05, z], flat: true });
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.cab;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, flat: true, name });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, rotation: rot, flat: true });
  const slabs = (pts: number[][], c: string, t: number) => b.slab(pts, { color: c, thickness: t, bone });

  // main lower body
  box(3.2, 0.9, 1.5, P.hull, [0, 1.55, 3.75], undefined, "cabLower");
  // sloped nose wedge
  b.extrude([[0, 0], [0.45, 0], [0, 0.9]], { at: [-1.6, 1.1, 4.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0, color: P.hull, bone });
  box(3.2, 0.7, 0.5, P.hull, [0, 1.45, 4.25]);
  box(3.0, 0.5, 0.45, P.hullLight, [0, 1.85, 4.2], [-35, 0, 0], "noseSlope");
  box(3.0, 0.08, 0.5, P.hullDark, [0, 1.35, 4.5]);
  // upper cab
  box(3.0, 0.7, 1.1, P.hull, [0, 2.3, 3.55]);
  box(2.8, 0.1, 1.0, P.hullLight, [0, 2.7, 3.5], undefined, "roof");
  // visor
  const vis = box(2.5, 0.55, 0.08, P.glassDark, [0, 2.2, 4.12], [-38, 0, 0], "visor");
  glow(box(2.6, 0.06, 0.1, P.neonCyan, [0, 2.5, 4.0], [-38, 0, 0]), 1.3);
  glow(box(2.6, 0.06, 0.1, P.neonCyan, [0, 1.92, 4.28], [-38, 0, 0]), 1.3);
  for (const s of [1, -1]) glow(box(0.06, 0.55, 0.1, P.neonCyan, [s * 1.27, 2.2, 4.12], [-38, 0, 0]), 1.3);
  glow(box(0.04, 0.5, 0.1, P.neonCyan, [0, 2.2, 4.13], [-38, 0, 0]), 1.0);
  // side windows
  for (const s of [1, -1]) {
    box(0.06, 0.4, 0.7, P.glassDark, [s * 1.52, 2.3, 3.6]);
    glow(box(0.04, 0.04, 0.72, P.neonCyan, [s * 1.54, 2.52, 3.6]), 1);
    // armour plates
    box(0.1, 0.65, 1.3, P.hullLight, [s * 1.6, 1.6, 3.75]);
    // hazard chevrons
    for (let i = 0; i < 4; i++) {
      const z = 3.3 + i * 0.3;
      box(0.04, 0.08, 0.28, P.hazard, [s * 1.67, 1.75, z], [0, 0, 0]).mesh.rotation.x = 0.6;
      box(0.04, 0.08, 0.28, P.hazard, [s * 1.67, 1.55, z]).mesh.rotation.x = -0.6;
    }
    // door seams and handle
    box(0.03, 0.5, 0.03, P.hullDark, [s * 1.54, 2.28, 3.25]);
    box(0.03, 0.5, 0.03, P.hullDark, [s * 1.54, 2.28, 3.95]);
    box(0.06, 0.06, 0.2, P.steel, [s * 1.56, 2.05, 3.4]);
    // mirrors
    box(0.05, 0.05, 0.4, P.gunmetal, [s * 1.75, 2.3, 3.7]).mesh.rotation.y = 0;
    box(0.4, 0.3, 0.06, P.gunmetal, [s * 1.9, 2.4, 3.72]);
    box(0.34, 0.24, 0.02, P.steel, [s * 1.9, 2.4, 3.76]);
    // headlights
    glow(box(0.4, 0.22, 0.1, P.lightWhite, [s * 1.05, 1.5, 4.52]), 1.6);
    box(0.5, 0.3, 0.06, P.gunmetal, [s * 1.05, 1.5, 4.48]);
    // smoke launchers
    for (let i = 0; i < 3; i++) cyl(0.06, 0.06, 0.3, 6, P.gunmetal, [s * 1.4, 2.8 + 0.0, 3.2 + i * 0.14], [60, 0, s * 20]);
    box(0.2, 0.2, 0.5, P.gunmetal, [s * 1.4, 2.78, 3.3]);
    // tow loops
    b.part(new THREE.TorusGeometry(0.14, 0.035, 5, 8), P.steel, { bone, at: [s * 1.2, 1.12, 4.58] });
    box(0.1, 0.15, 0.1, P.gunmetal, [s * 1.2, 1.2, 4.52]);
    // intake vents
    for (let i = 0; i < 4; i++) box(0.04, 0.04, 0.35, P.darkSteel, [s * 1.62, 1.35 + i * 0.0, 3.3 + i * 0.0 + 0]).mesh.visible = false;
    // corner bolts
    for (let i = 0; i < 3; i++) cyl(0.04, 0.04, 0.04, 6, P.steel, [s * 1.67, 1.9 + (i % 2) * 0.01, 3.2 + i * 0.5], [0, 0, 90]);
  }
  // bumper with hazard stripes
  box(3.3, 0.25, 0.25, P.gunmetal, [0, 1.15, 4.55]);
  for (let i = 0; i < 9; i++) box(0.17, 0.26, 0.26, i % 2 ? P.hazard : P.hazardBlack, [-1.44 + i * 0.36, 1.15, 4.56]);
  // grille
  for (let i = 0; i < 4; i++) box(1.0, 0.04, 0.04, P.darkSteel, [0, 1.3 + i * 0.1 - 0.0, 4.53]);
  // roof mast
  cyl(0.12, 0.16, 0.12, 8, P.gunmetal, [0.9, 2.8, 3.5]);
  cyl(0.05, 0.05, 0.6, 6, P.steel, [0.9, 3.1, 3.5]);
  const dish = b.part(new THREE.ConeGeometry(0.28, 0.14, 10, 1, true), P.steel, { bone, at: [0.9, 3.35, 3.58], rotation: [-100, 0, 0] });
  cyl(0.02, 0.02, 0.12, 5, P.hazard, [0.9, 3.38, 3.5], [80, 0, 0]);
  cyl(0.015, 0.015, 0.9, 5, P.steel, [-0.9, 3.2, 3.2]);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.red, { bone, at: [-0.9, 3.66, 3.2] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone, at: [0.9, 3.42, 3.5] }), 1.5);
  // roof ridge and hatch
  box(0.8, 0.06, 0.6, P.gunmetal, [-0.2, 2.78, 3.7]);
  cyl(0.02, 0.02, 0.2, 5, P.steel, [-0.2, 2.86, 3.5], [0, 0, 90]);
  // rear roof lights
  for (const s of [1, -1]) glow(box(0.1, 0.06, 0.1, P.hazard, [s * 1.2, 2.78, 4.0]), 1);
  // rear wall under gun
  box(3.0, 0.1, 0.05, P.hullDark, [0, 2.3, 3.0]);
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { lerp } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type StabCtx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildStabilisers({ b, J, P }: StabCtx) {
  const legs = [
    { name: "legFL", s: 1, z0: 2.2, zp: 2.4 },
    { name: "legFR", s: -1, z0: 2.2, zp: 2.4 },
    { name: "legRL", s: 1, z0: -3.4, zp: -3.6 },
    { name: "legRR", s: -1, z0: -3.4, zp: -3.6 },
  ];
  const own = (a: number[], c: number[], t: number) => lerp(a as any, c as any, t).toArray();
  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, dir ? { bone, at, dir, axis: "y" } : { bone, at });
  const cyl = (r: number, h: number, seg: number, col: string, at: number[], bone: any, dir: number[] = [0, 1, 0]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at, dir });

  for (const L of legs) {
    const { s, z0, zp } = L;
    const bone = J[L.name];
    const body = J.body;
    const zd = zp > z0 ? 1 : -1;

    // chassis-side bracket plate + backing
    box(0.14, 0.9, 0.95, P.gunmetal, [s * 1.77, 1.1, z0], body);
    box(0.06, 0.7, 0.75, P.darkSteel, [s * 1.85, 1.1, z0], body);
    for (const dy of [-0.3, 0.3])
      for (const dz of [-0.35, 0.35]) cyl(0.04, 0.05, 6, P.steel, [s * 1.87, 1.1 + dy, z0 + dz], body, [1, 0, 0]);
    // hinge block, lugs and pin
    box(0.34, 0.5, 0.5, P.hullDark, [s * 2.0, 1.1, z0], bone);
    box(0.3, 0.12, 0.62, P.gunmetal, [s * 2.0, 1.4, z0], bone);
    box(0.3, 0.12, 0.62, P.gunmetal, [s * 2.0, 0.8, z0], bone);
    cyl(0.12, 0.7, 8, P.steel, [s * 2.0, 1.1, z0], bone, [0, 0, 1]);
    // cyan status light
    glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone, at: [s * 2.2, 1.2, z0 + zd * 0.2] }), 1.5);
    box(0.04, 0.12, 0.12, P.darkSteel, [s * 2.18, 1.2, z0 + zd * 0.2], bone);

    // upper hydraulic arm
    const H = [s * 2.0, 1.05, z0];
    const K = [s * 2.38, 0.78, z0 + zd * 0.12];
    b.rod(H, K, 0.13, P.hull, { bone, sides: 8 });
    for (let i = 0; i < 4; i++) {
      const t0 = 0.12 + i * 0.22;
      b.rod(own(H, K, t0), own(H, K, t0 + 0.11), 0.138, i % 2 ? P.hazard : P.hazardBlack, { bone, sides: 8 });
    }
    cyl(0.17, 0.16, 8, P.gunmetal, K, bone, [s * 0.4, -0.3, 0.1]);

    // pad top & piston
    const T = [s * 2.6, 0.26, zp];
    b.rod(K, T, 0.075, P.steel, { bone, sides: 8 });
    b.rod(own(K, T, 0.05), own(K, T, 0.45), 0.105, P.gunmetal, { bone, sides: 8 });
    b.rod(own(K, T, 0.45), own(K, T, 0.5), 0.13, P.darkSteel, { bone, sides: 8 }); // ring collar
    b.rod(own(K, T, 0.2), own(K, T, 0.26), 0.12, P.hazard, { bone, sides: 8 });

    // diagonal brace strut
    const B0 = [s * 1.88, 0.62, z0 - zd * 0.15];
    const B1 = own(K, T, 0.62);
    b.rod(B0, B1, 0.055, P.darkSteel, { bone, sides: 6 });
    box(0.14, 0.14, 0.14, P.gunmetal, B0, bone);
    cyl(0.08, 0.14, 6, P.steel, B1, bone, [0, 0, 1]);

    // foot: ball joint, pad, rubber underplate, bolts
    b.part(new THREE.SphereGeometry(0.13, 6, 4), P.gunmetal, { bone, at: [T[0], 0.3, T[2]] });
    cyl(0.5, 0.06, 8, P.rubber, [T[0], 0.03, T[2]], bone);
    cyl(0.44, 0.14, 8, P.steel, [T[0], 0.13, T[2]], bone);
    cyl(0.3, 0.06, 8, P.gunmetal, [T[0], 0.23, T[2]], bone);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      cyl(0.03, 0.04, 6, P.darkSteel, [T[0] + Math.cos(a) * 0.37, 0.21, T[2] + Math.sin(a) * 0.37], bone);
    }
    // hazard edge ticks on pad
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      box(0.16, 0.03, 0.06, P.hazard, [T[0] + Math.cos(a) * 0.42, 0.205, T[2] + Math.sin(a) * 0.42], bone, undefined);
    }
  }
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // box helper: center, size, color
  const box = (c: number[], s: number[], color: string, opt: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone, at: c as any, ...opt });
  const cyl = (c: number[], r: number, h: number, color: string, axis: "x" | "y" | "z", seg = 8) => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
    return b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at: c as any, dir: dir as any });
  };

  // ---- main hull ----
  box([0, 1.05, -1], [3.4, 0.9, 8], P.hull);
  // deck plate (top at 1.5)
  box([0, 1.48, -1], [3.0, 0.08, 7.8], P.hullLight);
  // sloped front plate (wedge)
  b.part(new THREE.BoxGeometry(3.4, 0.9, 0.5), P.hull, { bone, at: [0, 1.05, 3.1], rotation: [-22, 0, 0] });
  // sloped rear plate
  b.part(new THREE.BoxGeometry(3.4, 0.9, 0.5), P.hull, { bone, at: [0, 1.0, -5.0], rotation: [28, 0, 0] });
  // rear lower chamfer darker
  box([0, 0.78, -4.9], [3.2, 0.16, 0.4], P.hullDark);

  // lower belly
  box([0, 0.78, -1], [3.0, 0.16, 7.6], P.darkSteel);

  // ---- skirt plates (sides) ----
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = 2.0 - i * 1.9 - (i > 1 ? 0.2 : 0);
      if (Math.abs(z - 0.4) < 0.5 || Math.abs(z + 2.6) < 0.5) continue; // leave wheel stations clear
      box([s * 1.74, 1.0, z], [0.08, 0.6, 1.1], P.hullDark);
      for (const dz of [-0.4, 0.4]) cyl([s * 1.79, 1.0, z + dz], 0.04, 0.04, P.steel, "x", 6);
    }
    // upper side trim
    box([s * 1.73, 1.4, -1], [0.06, 0.12, 7.6], P.hullLight);
    // lower rail
    box([s * 1.72, 0.76, -1], [0.1, 0.1, 7.4], P.darkSteel);
    // hazard blocks on lower rail
    for (let i = 0; i < 12; i++)
      if (i % 2 === 0) box([s * 1.78, 0.76, 2.6 - i * 0.62], [0.04, 0.1, 0.3], P.hazard);
  }

  // ---- deck panel seams ----
  for (let i = 0; i < 9; i++) box([0, 1.535, 2.6 - i * 0.85], [3.0, 0.012, 0.03], P.hullDark);
  for (const x of [-1.0, 1.0]) box([x, 1.535, -1], [0.03, 0.012, 7.8], P.hullDark);

  // ---- bolts along deck edges ----
  for (const s of [1, -1])
    for (let i = 0; i < 14; i++) {
      const z = 3.0 - i * 0.55;
      cyl([s * 1.42, 1.55, z], 0.035, 0.04, P.steel, "y", 6);
    }

  // ---- vent grilles (rear deck) ----
  for (const s of [1, -1]) {
    box([s * 1.1, 1.545, -4.0], [0.8, 0.02, 0.7], P.darkSteel);
    for (let i = 0; i < 5; i++) box([s * 1.1, 1.56, -3.75 - i * 0.12 + 0.12], [0.7, 0.02, 0.05], P.hullDark);
  }
  // forward side vents
  for (const s of [1, -1]) {
    box([s * 1.2, 1.545, 2.4], [0.6, 0.02, 0.5], P.darkSteel);
    for (let i = 0; i < 4; i++) box([s * 1.2, 1.56, 2.25 + i * 0.1], [0.5, 0.02, 0.04], P.hullDark);
  }

  // ---- ring plinth at turretRing ----
  b.part(new THREE.CylinderGeometry(1.15, 1.3, 0.14, 12), P.hullDark, { bone, at: [M.turretRing[0], 1.57, M.turretRing[2]] });
  b.part(new THREE.CylinderGeometry(1.0, 1.05, 0.08, 12), P.darkSteel, { bone, at: [0, 1.66, M.turretRing[2]] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cyl([Math.cos(a) * 1.12, 1.66, M.turretRing[2] + Math.sin(a) * 1.12], 0.04, 0.05, P.steel, "y", 6);
  }

  // ---- hazard bumper (front) ----
  box([0, 0.9, 3.42], [3.3, 0.36, 0.2], P.darkSteel);
  for (let i = 0; i < 11; i++) {
    const x = -1.5 + i * 0.3;
    box([x, 0.9, 3.54], [0.16, 0.34, 0.04], i % 2 ? P.hazardBlack : P.hazard, { rotation: [0, 0, 20] });
  }
  // tow loops front
  for (const s of [1, -1]) {
    box([s * 1.1, 0.74, 3.5], [0.1, 0.12, 0.2], P.darkSteel);
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone, at: [s * 1.1, 0.7, 3.62] });
  }

  // ---- rear: tow hooks, lamps, bumper ----
  box([0, 0.95, -5.35], [3.3, 0.3, 0.18], P.darkSteel);
  for (let i = 0; i < 11; i++) {
    const x = -1.5 + i * 0.3;
    box([x, 0.95, -5.46], [0.16, 0.28, 0.03], i % 2 ? P.hazardBlack : P.hazard, { rotation: [0, 0, -20] });
  }
  for (const s of [1, -1]) {
    // hook
    box([s * 0.7, 0.8, -5.5], [0.14, 0.14, 0.25], P.darkSteel);
    b.part(new THREE.TorusGeometry(0.11, 0.035, 5, 8, Math.PI * 1.5), P.steel, { bone, at: [s * 0.7, 0.78, -5.7], rotation: [0, 90, 0] });
    // lamps
    box([s * 1.35, 1.18, -5.24], [0.28, 0.2, 0.08], P.red);
    box([s * 1.35, 1.18, -5.29], [0.2, 0.12, 0.03], "#ff6a5a");
    box([s * 1.35, 1.18, -5.22], [0.34, 0.26, 0.04], P.darkSteel);
  }
  // center rear lamp bar
  box([0, 1.2, -5.2], [0.5, 0.06, 0.05], P.red);

  // ---- side tool boxes ----
  for (const s of [1, -1]) {
    box([s * 1.8, 1.2, -0.9], [0.3, 0.4, 1.0], P.hullDark);
    box([s * 1.8, 1.42, -0.9], [0.32, 0.05, 1.04], P.hullLight);
    box([s * 1.97, 1.25, -0.9], [0.03, 0.12, 0.3], P.steel);
    box([s * 1.97, 1.1, -0.9], [0.03, 0.04, 0.8], P.hazard);
    for (const dz of [-0.4, 0.4]) cyl([s * 1.97, 1.35, -0.9 + dz], 0.03, 0.03, P.steel, "x", 6);
  }

  // ---- hatches (fuel / ammo) ----
  for (const [x, z] of [[-1.0, 1.4], [1.0, -2.2]] as number[][]) {
    cyl([x, 1.56, z], 0.3, 0.05, P.hullDark, "y", 8);
    cyl([x, 1.6, z], 0.22, 0.04, P.hullLight, "y", 8);
    box([x, 1.64, z], [0.3, 0.04, 0.06], P.steel);
    box([x + 0.25, 1.6, z], [0.1, 0.05, 0.12], P.red);
  }
  // ammo hatch rectangular
  box([1.0, 1.55, 1.4], [0.7, 0.05, 0.6], P.hullDark);
  box([1.0, 1.59, 1.4], [0.6, 0.03, 0.5], P.hullLight);
  box([1.0, 1.62, 1.4], [0.1, 0.03, 0.25], P.steel);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl([1.0 + sx * 0.28, 1.62, 1.4 + sz * 0.22], 0.02, 0.03, P.steel, "y", 5);

  // ---- hazard stripes on deck edge near front ----
  for (let i = 0; i < 6; i++)
    box([-0.75 + i * 0.3, 1.54, 2.85], [0.14, 0.015, 0.2], i % 2 ? P.hazardBlack : P.hazard, { rotation: [0, 25, 0] });

  // ---- stencil number decals on side (white, built from bars) ----
  const bar = (s: number, y: number, z: number, w: number, h: number) =>
    box([s * 1.755, y, z], [0.012, h, w], P.decalWhite);
  for (const s of [1, -1]) {
    const z0 = s * 1; // order flips so digits read left-to-right from outside
    const dz = (k: number) => -1.6 + (s > 0 ? -k : k) * 0.0; // keep simple
    void z0; void dz;
    // digit "0" at z = -3.9..-3.6 ; digit "7" nearby
    const digit0 = (zc: number) => {
      bar(s, 1.28, zc, 0.22, 0.04);
      bar(s, 1.0, zc, 0.22, 0.04);
      bar(s, 1.14, zc - 0.1, 0.04, 0.32);
      bar(s, 1.14, zc + 0.1, 0.04, 0.32);
    };
    const digit7 = (zc: number) => {
      bar(s, 1.28, zc, 0.22, 0.04);
      b.part(new THREE.BoxGeometry(0.012, 0.36, 0.04), P.decalWhite, { bone, at: [s * 1.755, 1.14, zc + 0.04], rotation: [s * 18, 0, 0] });
    };
    digit0(-3.95);
    digit7(-3.55);
    // red unit stripe
    box([s * 1.755, 0.92, -3.75], [0.012, 0.03, 0.6], P.red);
  }
  // top deck stencil small
  box([0, 1.54, 0.9], [0.9, 0.012, 0.05], P.decalWhite);
  box([0, 1.54, 0.8], [0.5, 0.012, 0.04], P.decalWhite);

  // ---- front lower wedge details ----
  for (const s of [1, -1]) {
    box([s * 1.0, 1.0, 3.3], [0.5, 0.4, 0.06], P.hullLight, { rotation: [-22, 0, 0] });
    box([s * 1.0, 1.0, 3.35], [0.3, 0.06, 0.06], P.darkSteel, { rotation: [-22, 0, 0] });
  }

  // ---- hull rivet random studs on sloped rear ----
  for (let i = 0; i < 10; i++) {
    const x = -1.4 + R() * 2.8;
    const y = 0.85 + R() * 0.5;
    cyl([x, y, -5.22 + (1.2 - y) * 0.05], 0.025, 0.03, P.steel, "z", 5);
  }

  // ---- leg / axle mounting brackets on flanks ----
  for (const s of [1, -1])
    for (const z of [2.2, -3.4]) {
      box([s * 1.76, 1.1, z], [0.14, 0.5, 0.5], P.darkSteel);
      box([s * 1.84, 1.1, z], [0.06, 0.34, 0.34], P.hullLight);
    }
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRailgun({ b, J, P, M }: Ctx) {
  const V3 = THREE.Vector3;
  const rand = rng(11);
  const pivot = new V3(...(M.gunPivot as [number, number, number]));
  const ring = new V3(...(M.turretRing as [number, number, number]));
  const d = new V3(0, 0.2, 1).normalize();
  const u = new V3(0, d.z, -d.y);
  const X = new V3(1, 0, 0);
  const Y0 = -0.42; // barrel axis offset below the pivot line

  const gp = (x: number, y: number, z: number) =>
    pivot.clone().addScaledVector(X, x).addScaledVector(u, y).addScaledVector(d, z);

  // gun-frame box (z along the barrel)
  const gb = (sx: number, sy: number, sz: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone: J.gun, at: gp(x, y, z), dir: d, axis: "z", up: u });
  // gun-frame cylinder along the barrel
  const gc = (r: number, len: number, sides: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides).rotateX(Math.PI / 2), color, {
      bone: J.gun, at: gp(x, y, z), dir: d, axis: "z", up: u,
    });
  const gt = (r: number, t: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 8), color, { bone: J.gun, at: gp(x, y, z), dir: d, axis: "z", up: u });
  // turret-frame world-axis box
  const tb = (sx: number, sy: number, sz: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone: J.turret, at: [x, y, z] });
  const tcy = (r: number, h: number, sides: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone: J.turret, at: [x, y, z] });

  // ---------- turret base ----------
  tcy(1.25, 0.14, 8, P.darkSteel, ring.x, ring.y + 0.07, ring.z);
  tcy(1.12, 0.22, 8, P.gunmetal, ring.x, ring.y + 0.25, ring.z);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    tcy(0.04, 0.05, 6, P.steel, ring.x + Math.sin(a) * 1.18, ring.y + 0.17, ring.z + Math.cos(a) * 1.18);
  }
  // hazard stripe segments on ring
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    tb(0.3, 0.05, 0.12, P.hazard, ring.x + Math.sin(a) * 1.13, ring.y + 0.37, ring.z + Math.cos(a) * 1.13);
  }

  // ---------- turret body ----------
  const by = 2.0, bz = -1.2;
  tb(2.3, 0.85, 2.5, P.hull, 0, by, bz);
  tb(2.0, 0.12, 2.2, P.hullLight, 0, by + 0.48, bz); // roof plate
  tb(2.34, 0.1, 2.54, P.hullDark, 0, by - 0.2, bz); // lower skirt
  // sloped front glacis
  tb(2.0, 0.5, 0.5, P.hullDark, 0, by + 0.1, bz + 1.3);
  tb(1.9, 0.12, 0.5, P.hullLight, 0, by + 0.38, bz + 1.35);
  // side panels seams
  for (const s of [1, -1]) {
    tb(0.04, 0.7, 0.04, P.darkSteel, s * 1.17, by, bz - 0.4);
    tb(0.04, 0.7, 0.04, P.darkSteel, s * 1.17, by, bz + 0.4);
    tb(0.04, 0.04, 2.3, P.darkSteel, s * 1.17, by + 0.2, bz);
    // vents
    for (let i = 0; i < 4; i++) tb(0.05, 0.05, 0.4, P.darkSteel, s * 1.18, by - 0.1 + i * 0.07 - 0.1, bz + 0.85);
    // warning decal: hazard plate with black stripes + red triangle
    tb(0.04, 0.26, 0.4, P.hazard, s * 1.18, by + 0.12, bz - 0.85);
    for (let i = 0; i < 3; i++) tb(0.05, 0.28, 0.06, P.hazardBlack, s * 1.19, by + 0.12, bz - 1.0 + i * 0.15);
    tb(0.04, 0.12, 0.12, P.red, s * 1.18, by - 0.15, bz - 0.85);
  }
  // rear vents / hatch
  for (let i = 0; i < 5; i++) tb(1.0, 0.04, 0.04, P.darkSteel, 0, by - 0.25 + i * 0.1, bz - 1.27);
  // roof hatch
  tcy(0.34, 0.1, 8, P.hullLight, -0.55, by + 0.59, bz - 0.5);
  tcy(0.24, 0.05, 8, P.gunmetal, -0.55, by + 0.66, bz - 0.5);
  tb(0.12, 0.05, 0.04, P.steel, -0.55, by + 0.7, bz - 0.5);

  // roof handrails
  for (const s of [1, -1]) {
    const xr = s * 1.05;
    for (const z of [-2.2, -1.5, -0.8]) tb(0.05, 0.4, 0.05, P.steel, xr, by + 0.74, z);
    b.rod([xr, by + 0.95, -2.2], [xr, by + 0.95, -0.8], 0.025, P.steel, { bone: J.turret });
    b.rod([xr, by + 0.78, -2.2], [xr, by + 0.78, -0.8], 0.02, P.steel, { bone: J.turret });
  }
  b.rod([-1.05, by + 0.95, -2.2], [1.05, by + 0.95, -2.2], 0.025, P.steel, { bone: J.turret });

  // ladder on rear
  for (const s of [1, -1]) b.rod([s * 0.3, 1.75, -2.5], [s * 0.3, by + 0.5, -2.5], 0.028, P.steel, { bone: J.turret });
  for (let i = 0; i < 5; i++) b.rod([-0.3, 1.82 + i * 0.14, -2.5], [0.3, 1.82 + i * 0.14, -2.5], 0.018, P.steel, { bone: J.turret });
  tb(0.06, 0.06, 0.06, P.darkSteel, 0.3, 1.78, -2.45);

  // ammo slug rack on left side
  tb(0.1, 0.5, 1.2, P.darkSteel, 1.25, 2.1, -1.8);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 2; j++) {
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 6).rotateX(Math.PI / 2), j ? P.steel : P.copper, {
        bone: J.turret, at: [1.3, 1.98 + j * 0.2, -2.25 + i * 0.27],
      });
    }
  }
  b.part(new THREE.BoxGeometry(0.04, 0.5, 1.22), P.hazard, { bone: J.turret, at: [1.31, 2.1, -1.8] });
  for (let i = 0; i < 4; i++) tb(0.1, 0.52, 0.07, P.hazardBlack, 1.29, 2.1, -2.3 + i * 0.3);

  // ---------- cradle ----------
  for (const s of [1, -1]) {
    gb(0.14, 1.0, 1.9, P.gunmetal, s * 0.78, -0.2, 0.2);
    gb(0.05, 0.7, 1.5, P.hull, s * 0.87, -0.2, 0.2);
    // trunnion
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 8).rotateZ(Math.PI / 2), P.steel, {
      bone: J.gun, at: [s * 0.88, pivot.y, pivot.z],
    });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 6).rotateZ(Math.PI / 2), P.darkSteel, {
      bone: J.gun, at: [s * 0.9, pivot.y, pivot.z],
    });
  }
  gb(1.7, 0.14, 1.9, P.gunmetal, 0, 0.3, 0.2); // top cover
  gb(1.7, 0.14, 1.9, P.darkSteel, 0, -0.72, 0.2); // bottom
  // breech block
  gb(0.8, 0.6, 1.2, P.steel, 0, Y0, 0.45);
  gb(0.5, 0.2, 0.9, P.gunmetal, 0, Y0 + 0.4, 0.45);
  for (let i = 0; i < 3; i++) gb(0.7, 0.04, 0.05, P.darkSteel, 0, Y0 + 0.31, 0.1 + i * 0.35);

  // ---------- barrel ----------
  const r0 = 0.5, r1 = 5.45;
  const len = r1 - r0, mid = (r0 + r1) / 2;
  for (const s of [1, -1]) {
    gb(0.16, 0.3, len, P.gunmetal, s * 0.17, Y0, mid);
    gb(0.05, 0.1, len - 0.1, P.darkSteel, s * 0.27, Y0, mid);
    glow(gb(0.02, 0.05, len - 0.2, P.neonCyan, s * 0.085, Y0 + 0.06, mid), 1.6);
    gb(0.18, 0.04, len, P.steel, s * 0.17, Y0 + 0.17, mid);
  }
  glow(gb(0.1, 0.1, len - 0.1, P.neonCyan, 0, Y0, mid), 1.5);
  gb(0.1, 0.03, len, P.darkSteel, 0, Y0 - 0.14, mid);
  // clamps
  for (let i = 0; i < 9; i++) {
    const z = 0.95 + i * 0.5;
    const big = i % 2 === 0;
    gb(0.64, 0.4, 0.16, big ? P.steel : P.darkSteel, 0, Y0, z);
    gb(0.4, 0.06, 0.18, big ? P.darkSteel : P.steel, 0, Y0 + 0.22, z);
    for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6).rotateZ(Math.PI / 2), P.steel, {
      bone: J.gun, at: gp(s * 0.33, Y0, z), dir: d, axis: "z", up: u,
    });
  }
  // muzzle brake
  gb(0.78, 0.5, 0.55, P.gunmetal, 0, Y0, 5.45);
  gb(0.82, 0.1, 0.5, P.darkSteel, 0, Y0 + 0.27, 5.45);
  gb(0.82, 0.1, 0.5, P.darkSteel, 0, Y0 - 0.27, 5.45);
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) gb(0.04, 0.3, 0.07, P.hazardBlack, s * 0.4, Y0, 5.3 + i * 0.15);
  glow(gb(0.2, 0.14, 0.04, P.neonCyan, 0, Y0, 5.74), 1.6);
  // hazard band
  gb(0.7, 0.44, 0.12, P.hazard, 0, Y0, 4.9);
  gb(0.72, 0.46, 0.04, P.hazardBlack, 0, Y0, 4.82);

  // ---------- capacitor bank ----------
  const by0 = -0.05;
  gc(0.5, 2.0, 8, P.gunmetal, 0, by0, -1.7);
  gc(0.6, 0.14, 8, P.darkSteel, 0, by0, -0.65);
  gc(0.6, 0.14, 8, P.darkSteel, 0, by0, -2.75);
  gc(0.4, 0.12, 8, P.steel, 0, by0, -2.88);
  glow(gb(0.24, 0.24, 0.05, P.neonCyan, 0, by0, -2.96), 1.5);
  for (let i = 0; i < 5; i++) {
    const z = -0.95 - i * 0.4;
    gt(0.54, 0.075, P.copper, 0, by0, z);
    glow(gt(0.56, 0.032, P.neonCyan, 0, by0, z - 0.2), 1.6);
  }
  // cooling fins on top and sides
  for (let i = 0; i < 6; i++) {
    const z = -0.95 - i * 0.3;
    gb(0.7, 0.2, 0.05, P.steel, 0, by0 + 0.6, z);
    for (const s of [1, -1]) gb(0.2, 0.55, 0.04, P.darkSteel, s * 0.62, by0 - 0.05, z);
  }
  gb(0.1, 0.1, 2.0, P.darkSteel, 0, by0 + 0.7, -1.7);
  // conduit bank to breech
  for (const s of [1, -1]) {
    gb(0.1, 0.1, 0.9, P.copper, s * 0.35, by0 + 0.3, -0.2);
  }
  // red warning label on bank
  gb(0.3, 0.04, 0.3, P.hazard, 0, by0 + 0.77, -2.3);
  gb(0.12, 0.05, 0.12, P.red, 0, by0 + 0.79, -2.3);

  // ---------- hydraulic elevation cylinders ----------
  for (const s of [1, -1]) {
    const lo = new V3(s * 0.55, 2.5, -1.9);
    const hi = gp(s * 0.55, -0.75, -0.9);
    b.rod(lo, lo.clone().lerp(hi, 0.55), 0.09, P.darkSteel, { bone: J.turret });
    b.rod(lo.clone().lerp(hi, 0.5), hi, 0.045, P.steel, { bone: J.gun });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), P.hazard, {
      bone: J.turret, at: lo.clone().lerp(hi, 0.3), dir: hi.clone().sub(lo), axis: "y",
    });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.steel, { bone: J.turret, at: lo });
    b.part(new THREE.SphereGeometry(0.08, 6, 4), P.steel, { bone: J.gun, at: hi });
    tb(0.18, 0.16, 0.3, P.gunmetal, s * 0.55, 2.47, -1.95);
  }

  // scattered rivets on turret roof
  for (let i = 0; i < 10; i++) {
    const x = (rand() - 0.5) * 1.8;
    const z = -2.2 + rand() * 1.8;
    if (Math.abs(x + 0.55) < 0.4 && Math.abs(z + 0.5 + 1.2 - 1.2) < 0.4) continue;
    tcy(0.025, 0.03, 6, P.steel, x, by + 0.56, z);
  }
}
```
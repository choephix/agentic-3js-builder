<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Mk-IV",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a wedge cab, gun turret and a sealed glowing cargo pod on its back.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.1, 8.0],
  "layout": "A long, low armoured truck facing +Z. Front: a wedge-nosed cab with a slanted cyan visor, bull bar and headlights, a ram plate at the very front. Middle: a flat chassis deck on three axles (six large chunky wheels, two under the cab, four in two rear tandem axles) with side skirts. Back: a sealed cargo pod, a rounded-box capsule with yellow hazard bands, armour ribs, a glowing magenta seal-door at the rear and neon strips. A small roof turret sits on the cab roof with twin barrels pointing forward. Everything is faceted and blocky; neon cyan and magenta trim lines glow along the edges, yellow-black hazard stripes mark the bumpers and pod. Wheels, skirts and underbody rest on the floor. The model is static.",
  "palette": {
    "hull": "#3b4250",
    "hullDark": "#22262f",
    "hullLight": "#5b6578",
    "trim": "#e7b814",
    "hazardBlack": "#15161a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "glass": "#0f3a4a",
    "tyre": "#17181c",
    "rim": "#8a93a6",
    "rimGlow": "#2ff3ff",
    "podShell": "#d9dde3",
    "podShade": "#9aa3b2",
    "podSeal": "#ff2fb4",
    "metalDark": "#2b2f38",
    "lampWhite": "#fff6c8",
    "tail": "#ff3b3b",
    "rust": "#8a4b2a",
    "gunmetal": "#4a4f5c"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 2.4],
    "cabRoof": [0, 2.6, 2.2],
    "turretRing": [0, 2.6, 1.9],
    "podFloor": [0, 1.3, -1.6],
    "podRear": [0, 2.2, -4.0],
    "axleFront": [0, 0.6, 2.8],
    "axleRear1": [0, 0.6, -1.2],
    "axleRear2": [0, 0.6, -2.8],
    "frontBumper": [0, 0.9, 4.0]
  },
  "joints": [],
  "parts": [
    {
      "id": "chassis",
      "builds": "Chassis and underbody: a long ladder frame slab from z=-3.9 to 3.9 with a dark underside, side skirts in hull with cyan neon strip lines and yellow-black hazard-striped small blocks, fuel and battery boxes, exhaust stacks behind the cab, mudguard arches above each wheel, and the front bumper with ram plate, bull bar, tow hooks and two lamp housings with lampWhite lights. Rear bumper with red tail lights and a hitch plate. Rivets and panel seam strips in hullDark.",
      "box": [[-1.5, 0.3, -4.0], [1.5, 1.3, 4.0]],
      "attaches": "Top face at chassisTop height 1.3 carries the cab at cabFloor and the pod at podFloor; wheels attach at the axle mounts; the bumper reaches frontBumper.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wheels",
      "builds": "Six large chunky low-poly wheels (radius 0.6, width 0.5; octagonal tyres in tyre colour, rim discs in rim with bolt rings and a glowing rimGlow hub), two at the front axle (z=2.8) and four on the rear tandem axles (z=-1.2 and z=-2.8), centred x=±1.2 with axle centres at y=0.6. Axle beams in metalDark between each wheel pair, with small suspension arms and shock absorbers reaching up to the chassis. Tyre tread blocks as small parts around each tyre.",
      "box": [[-1.5, 0.0, -3.4], [1.5, 1.2, 3.4]],
      "attaches": "Axle lines at axleFront, axleRear1, axleRear2 (y=0.6); the lowest points of the tyres rest on y=0.",
      "joints": [],
      "floor": true,
      "budget": 160
    },
    {
      "id": "cab",
      "builds": "Wedge cab from z=1.2 to 3.6 sitting on cabFloor: hull body with a sloped hood, a big slanted glass visor in glass with cyan neon edge lines, side windows, angled armour plates in hullLight, door seams, mirrors on stalks, a roof light bar with magenta and cyan lamps, roof antenna with a tip glow, side vents, and a yellow-black hazard stripe band across the hood front. Faceted angular shapes, a small interior glimpse with a seat silhouette behind the visor.",
      "box": [[-1.4, 1.3, 1.2], [1.4, 2.6, 3.8]],
      "attaches": "Rests on chassisTop at cabFloor; its roof at cabRoof carries the turret ring; its back wall meets the pod front at z=1.0.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "turret",
      "builds": "Roof gun turret on turretRing (0,2.6,1.9): a ring base in hullDark, an octagonal faceted housing in gunmetal with hullLight armour plates, a sensor eye with a glowing cyan lens, twin barrels pointing forward (+Z) with muzzle brakes and ammo boxes on the sides, a belt feed, a small yellow hazard stripe and a magenta status light. Also a pair of searchlights flanking the cab roof at z=2.4 and a small radar dish on a stalk at the roof rear z=1.4.",
      "box": [[-0.9, 2.6, 1.0], [0.9, 3.1, 3.2]],
      "attaches": "Sits on cabRoof/turretRing at y=2.6; nothing touches the floor.",
      "joints": [],
      "floor": false,
      "budget": 130
    },
    {
      "id": "cargoPod",
      "builds": "The sealed cargo pod from z=-4.0 to 1.0 on podFloor: a rounded faceted capsule body in podShell with podShade lower half, heavy armour ribs every 0.8 m in hull, yellow-black hazard bands at both ends, bolted corner clamps strapping it to the chassis in metalDark with rivets, a rear circular seal-door in podSeal with a glowing magenta ring and lock bolts at podRear, cyan neon strips running along the top and sides, a small biohazard-style emblem and ID number blocks on the flanks, roof hatch, vent pipes and a top rail. Front face has pipe connectors toward the cab.",
      "box": [[-1.45, 1.3, -4.0], [1.45, 3.0, 1.0]],
      "attaches": "Rests on chassisTop at podFloor; its front face meets the cab back wall at z=1.0; the seal-door sits at podRear.",
      "joints": [],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.6;
  const W = 0.5;
  const rand = rng(11);
  const AX = [2.8, -1.2, -2.8];
  const AY = M.axleFront[1];
  const BOLT = "#c9d0de";
  const DARKRIM = "#5d6578";

  // Cylinder along X helper: rotate so the cylinder axis (Y) points along X.
  const along = (g: THREE.BufferGeometry, color: string, at: [number, number, number], flat = true) =>
    b.part(g, color, { at, dir: [1, 0, 0], flat });

  for (const z of AX) {
    // axle beam
    along(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8), P.metalDark, [0, AY, z]);
    // differential housing
    b.part(new THREE.BoxGeometry(0.5, 0.32, 0.42), P.hullDark, { at: [0, AY, z], flat: true });
    b.part(new THREE.BoxGeometry(0.34, 0.1, 0.3), P.gunmetal, { at: [0, AY + 0.2, z], flat: true });
    // central shock + arms
    for (const s of [1, -1]) {
      const x = s * 0.7;
      // leaf-spring style arm
      b.rod([x, AY + 0.1, z - 0.3], [x, 1.05, z + 0.25], 0.045, P.metalDark);
      b.rod([x, AY + 0.1, z + 0.3], [x, 1.05, z - 0.25], 0.04, P.gunmetal);
      // shock absorber
      b.rod([x + s * 0.15, AY + 0.12, z], [x + s * 0.15, 1.15, z], 0.05, P.gunmetal);
      b.rod([x + s * 0.15, AY + 0.45, z], [x + s * 0.15, 0.95, z], 0.075, P.hullLight);
      // spring coils as rings
      for (let k = 0; k < 4; k++)
        b.part(new THREE.TorusGeometry(0.08, 0.018, 4, 8), P.trim, {
          at: [x + s * 0.15, AY + 0.55 + k * 0.1, z],
          dir: [0, 1, 0],
          flat: true,
        });
      // mounting plates
      b.part(new THREE.BoxGeometry(0.2, 0.06, 0.24), P.metalDark, { at: [x + s * 0.15, 1.17, z], flat: true });
    }
  }

  for (const z of AX) {
    for (const s of [1, -1]) {
      const cx = s * 1.2;
      const out = s; // outward direction
      // tyre: octagonal
      b.part(new THREE.CylinderGeometry(R, R, W, 8), P.tyre, {
        at: [cx, AY, z],
        dir: [1, 0, 0],
        rotation: [0, 0, 0],
        flat: true,
      });
      // tyre shoulders (slightly smaller darker ring on sidewall)
      for (const side of [1, -1])
        b.part(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.03, 8), P.hullDark, {
          at: [cx + side * (W / 2 + 0.005), AY, z],
          dir: [1, 0, 0],
          flat: true,
        });
      // tread blocks around the tyre
      const n = 16;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const py = AY + Math.cos(a) * (R + 0.02);
        const pz = z + Math.sin(a) * (R + 0.02);
        const block = b.part(new THREE.BoxGeometry(W * 0.92, 0.07, 0.14), i % 2 ? "#0e0f12" : P.tyre, {
          at: [cx, Math.max(py, 0.0), pz],
          dir: [0, Math.cos(a), Math.sin(a)],
          flat: true,
        });
        void block;
      }
      // rim disc outer face
      const fx = cx + out * (W / 2 + 0.02);
      along(new THREE.CylinderGeometry(R * 0.68, R * 0.68, 0.06, 8), P.rim, [fx, AY, z]);
      along(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.05, 8), DARKRIM, [fx + out * 0.035, AY, z]);
      // outer lip ring
      b.part(new THREE.TorusGeometry(R * 0.68, 0.025, 4, 8), BOLT, {
        at: [fx + out * 0.03, AY, z],
        dir: [1, 0, 0],
        axis: "z",
        flat: true,
      });
      // bolt ring
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        along(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), BOLT, [
          fx + out * 0.08,
          AY + Math.cos(a) * R * 0.4,
          z + Math.sin(a) * R * 0.4,
        ]);
      }
      // spokes
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        b.part(new THREE.BoxGeometry(0.03, 0.04, R * 1.1), P.metalDark, {
          at: [fx + out * 0.065, AY, z],
          rotation: [(a * 180) / Math.PI, 0, 0],
          flat: true,
        });
      }
      // glowing hub
      glow(
        along(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), P.rimGlow, [fx + out * 0.1, AY, z]),
        1.6,
      );
      along(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 6), P.hullDark, [fx + out * 0.12, AY, z]);
      // neon ring around hub
      glow(
        b.part(new THREE.TorusGeometry(R * 0.3, 0.015, 4, 8), P.rimGlow, {
          at: [fx + out * 0.09, AY, z],
          dir: [1, 0, 0],
          axis: "z",
          flat: true,
        }),
        1.3,
      );
      // inner hub cap toward the axle
      along(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), P.metalDark, [cx - out * (W / 2 + 0.04), AY, z]);
      // brake drum / hub connection
      along(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 8), P.gunmetal, [cx - out * 0.35, AY, z]);
      // yellow wear mark on tyre sidewall
      const mark = rand() * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.02, 0.1, 0.05), P.trim, {
        at: [fx - out * 0.02, AY + Math.cos(mark) * R * 0.8, z + Math.sin(mark) * R * 0.8],
        flat: true,
      });
    }
  }
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...extra });
  const lit = (p: any, s = 1.4) => glow(p, s);

  // ladder frame slab and dark underside
  box(2.9, 0.5, 7.8, P.hull, [0, 1.05, 0]);
  box(2.6, 0.5, 7.6, P.hullDark, [0, 0.55, 0]);
  // rails
  for (const s of [1, -1]) {
    box(0.2, 0.35, 7.8, P.metalDark, [s * 1.0, 0.38, 0]);
    box(0.2, 0.08, 7.7, P.hullLight, [s * 1.4, 1.32, 0]);
  }
  // cross members
  for (let i = 0; i < 9; i++) box(2.2, 0.15, 0.2, P.metalDark, [0, 0.33, -3.6 + i * 0.9]);

  // side skirts with neon strips and hazard blocks
  for (const s of [1, -1]) {
    box(0.16, 0.5, 6.2, P.hull, [s * 1.5, 0.78, 0.2]);
    lit(box(0.05, 0.05, 6.0, P.neonCyan, [s * 1.6, 0.98, 0.2]), 1.6);
    lit(box(0.05, 0.04, 6.0, P.neonMagenta, [s * 1.6, 0.58, 0.2]), 1.2);
    // panel seams
    for (let i = 0; i < 7; i++) box(0.05, 0.4, 0.04, P.hullDark, [s * 1.59, 0.78, -2.6 + i * 0.95]);
    // hazard blocks
    for (let i = 0; i < 6; i++) {
      const z = 3.0 - i * 0.12 - 0.0;
      box(0.1, 0.3, 0.1, i % 2 ? P.hazardBlack : P.trim, [s * 1.58, 0.78, 2.1 + i * 0.12 - 0.0 + 0.0]);
      box(0.1, 0.3, 0.1, i % 2 ? P.trim : P.hazardBlack, [s * 1.58, 0.78, -3.0 - i * 0.12 + 0.0]);
    }
    // fuel and battery boxes
    box(0.5, 0.45, 1.3, P.gunmetal, [s * 1.25, 0.45, 0.4]);
    box(0.52, 0.06, 1.0, P.trim, [s * 1.25, 0.7, 0.4]);
    box(0.45, 0.35, 0.7, P.metalDark, [s * 1.2, 0.5, -0.6 - 0.0 + 2.0 * 0]);
    cyl(0.04, 0.04, 0.1, 6, P.rust, [s * 1.2, 0.72, -0.5]);
    // mudguard arches over wheels
    for (const z of [2.8, -1.2, -2.8]) {
      box(0.5, 0.08, 1.4, P.hullDark, [s * 1.25, 1.22, z]);
      box(0.5, 0.2, 0.1, P.hullDark, [s * 1.25, 1.12, z + 0.72]);
      box(0.5, 0.2, 0.1, P.hullDark, [s * 1.25, 1.12, z - 0.72]);
    }
    // exhaust stacks behind cab
    const ex = cyl(0.1, 0.1, 1.0, 8, P.gunmetal, [s * 1.3, 1.8, 1.15]);
    cyl(0.13, 0.13, 0.08, 8, P.trim, [s * 1.3, 1.5, 1.15]);
    cyl(0.12, 0.12, 0.06, 8, P.hullDark, [s * 1.3, 2.32, 1.15]);
    void ex;
    // tow hooks
    box(0.12, 0.12, 0.3, P.metalDark, [s * 0.9, 0.55, 4.05]);
    b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), P.rim, { at: [s * 0.9, 0.55, 4.22] });
    // lamp housings
    box(0.5, 0.3, 0.2, P.hullDark, [s * 1.0, 0.95, 4.05]);
    lit(box(0.4, 0.2, 0.06, P.lampWhite, [s * 1.0, 0.95, 4.17]), 2);
    // rear tail lights
    box(0.4, 0.22, 0.1, P.hullDark, [s * 1.1, 0.95, -4.02]);
    lit(box(0.32, 0.14, 0.05, P.tail, [s * 1.1, 0.95, -4.08]), 1.6);
  }

  // front bumper, ram plate, bull bar
  box(3.0, 0.5, 0.3, P.hullDark, [0, 0.75, 3.95]);
  b.part(new THREE.CylinderGeometry(0.0, 1.45, 0.5, 4), P.hullLight, { at: [0, 0.65, 4.2], rotation: [90, 45, 0], scale: [1.0, 0.8, 0.3] });
  box(2.6, 0.4, 0.15, P.hullLight, [0, 0.7, 4.12]);
  for (let i = 0; i < 12; i++) box(0.22, 0.4, 0.05, i % 2 ? P.hazardBlack : P.trim, [-1.2 + i * 0.22, 0.7, 4.21]);
  for (const s of [1, -1]) box(0.1, 0.8, 0.1, P.gunmetal, [s * 0.6, 0.95, 4.35]);
  box(1.4, 0.1, 0.1, P.gunmetal, [0, 1.3, 4.35]);
  box(1.4, 0.1, 0.1, P.gunmetal, [0, 0.6, 4.35]);
  lit(box(1.0, 0.05, 0.05, P.neonCyan, [0, 0.95, 4.25]), 1.6);

  // rear bumper and hitch
  box(3.0, 0.4, 0.3, P.hullDark, [0, 0.7, -3.9]);
  for (let i = 0; i < 10; i++) box(0.25, 0.3, 0.05, i % 2 ? P.hazardBlack : P.trim, [-1.1 + i * 0.25, 0.7, -4.06]);
  box(0.7, 0.3, 0.2, P.metalDark, [0, 0.45, -4.0]);
  cyl(0.08, 0.08, 0.3, 8, P.rim, [0, 0.42, -4.15]);

  // top deck neon edge lines
  for (const s of [1, -1]) lit(box(0.05, 0.04, 7.6, P.neonCyan, [s * 1.46, 1.32, 0]), 1.4);
  lit(box(2.8, 0.04, 0.05, P.neonMagenta, [0, 1.32, 3.88]), 1.2);

  // top seams and rivets
  for (let i = 0; i < 12; i++) box(2.8, 0.03, 0.05, P.hullDark, [0, 1.31, -3.6 + i * 0.66]);
  const rv = new THREE.SphereGeometry(0.035, 5, 3);
  for (let i = 0; i < 30; i++) {
    const s = i % 2 ? 1 : -1;
    b.part(rv, P.rim, { at: [s * 1.38 + (R() - 0.5) * 0.03, 1.31, -3.7 + Math.floor(i / 2) * 0.5] });
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCab({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, rotation: rot, flat: true });
  const glowMat = (p: any, k = 1) => p;
  void glowMat; void frame; void M;

  // Main cab body (rear section, z 1.2..2.9)
  box(2.7, 0.85, 1.7, P.hull, [0, 1.725, 2.05]);
  // Upper cabin (greenhouse base)
  box(2.5, 0.5, 1.5, P.hullLight, [0, 2.35, 1.95]);
  // Roof slab
  box(2.6, 0.12, 1.7, P.hullDark, [0, 2.6, 1.95]);
  // Sloped hood: wedge from z 2.9 to 3.7
  const hood = b.extrude(
    [[0, 0], [0.9, 0], [0.9, 0.2], [0, 0.55, "sharp"]],
    { at: [0, 1.3, 2.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.6, color: P.hull },
  );
  void hood;
  // Nose ram block
  box(2.6, 0.55, 0.15, P.hullDark, [0, 1.58, 3.75]);
  // Hazard band across hood front
  for (let i = 0; i < 9; i++) {
    box(0.26, 0.16, 0.06, i % 2 ? P.hazardBlack : P.trim, [-1.04 + i * 0.26, 1.64, 3.8]);
  }
  // Hood armour plates
  for (const s of [1, -1]) {
    box(0.9, 0.06, 0.7, P.hullLight, [s * 0.7, 1.82, 3.3], [-18, 0, 0]);
    box(0.06, 0.4, 0.8, P.hullLight, [s * 1.34, 1.55, 3.25]);
    // vents
    for (let i = 0; i < 4; i++) box(0.04, 0.05, 0.3, P.hullDark, [s * 1.38, 1.5 + i * 0.1, 3.25]);
    // headlight pods
    box(0.4, 0.2, 0.08, P.metalDark, [s * 0.95, 1.5, 3.8]);
  }
  // Slanted visor
  box(2.2, 0.62, 0.08, P.glass, [0, 2.2, 2.85], [-35, 0, 0]);
  // Visor neon frame
  const nc = P.neonCyan;
  box(2.3, 0.05, 0.06, nc, [0, 2.5, 2.74], [-35, 0, 0]);
  box(2.3, 0.05, 0.06, nc, [0, 1.9, 2.97], [-35, 0, 0]);
  for (const s of [1, -1]) box(0.05, 0.66, 0.06, nc, [s * 1.14, 2.2, 2.85], [-35, 0, 0]);
  // Pillar between visor and roof
  box(2.6, 0.1, 0.2, P.hullDark, [0, 2.52, 2.7]);
  // Interior seat silhouette
  box(0.5, 0.45, 0.12, P.hazardBlack, [-0.5, 2.1, 2.3]);
  box(0.5, 0.12, 0.45, P.hazardBlack, [-0.5, 1.9, 2.5]);
  box(0.5, 0.45, 0.12, P.hazardBlack, [0.5, 2.1, 2.3]);
  box(0.5, 0.12, 0.45, P.hazardBlack, [0.5, 1.9, 2.5]);
  box(0.9, 0.3, 0.2, P.metalDark, [0, 1.95, 2.8]);
  // Side windows, door seams, handles, mirrors
  for (const s of [1, -1]) {
    box(0.04, 0.38, 1.0, P.glass, [s * 1.27, 2.3, 2.15]);
    box(0.05, 0.04, 1.04, nc, [s * 1.28, 2.51, 2.15]);
    box(0.05, 0.85, 0.03, P.hullDark, [s * 1.37, 1.75, 1.5]);
    box(0.05, 0.85, 0.03, P.hullDark, [s * 1.37, 1.75, 2.6]);
    box(0.05, 0.04, 1.1, P.hullDark, [s * 1.37, 1.35, 2.05]);
    box(0.06, 0.06, 0.25, P.rim, [s * 1.38, 2.0, 2.4]);
    // armour plate flank
    box(0.08, 0.35, 0.9, P.hullLight, [s * 1.38, 1.6, 2.05], [0, 0, 0]);
    // mirror stalk
    cyl(0.025, 0.025, 0.35, 6, P.metalDark, [s * 1.5, 2.25, 2.75], [0, 0, 90]);
    box(0.08, 0.28, 0.2, P.hullDark, [s * 1.7, 2.25, 2.78]);
    box(0.02, 0.22, 0.15, P.neonCyan, [s * 1.72, 2.25, 2.8]);
    // rear panel rivets
    for (let i = 0; i < 4; i++) box(0.04, 0.04, 0.04, P.hullDark, [s * 1.37, 1.5 + (i % 2) * 0.5, 1.6 + i * 0.3]);
    // cyan neon lower strip
    box(0.03, 0.04, 2.3, nc, [s * 1.37, 1.36, 2.4]);
  }
  // Back wall
  box(2.6, 0.9, 0.1, P.hullDark, [0, 1.8, 1.25]);
  for (let i = 0; i < 3; i++) box(0.5, 0.05, 0.04, P.metalDark, [(i - 1) * 0.7, 1.6 + (i % 2) * 0.4, 1.19]);
  // Roof light bar
  box(1.6, 0.1, 0.25, P.metalDark, [0, 2.72, 2.35]);
  for (let i = 0; i < 6; i++) {
    const c = i % 2 ? P.neonMagenta : P.neonCyan;
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.22), c, { at: [-0.65 + i * 0.26, 2.8, 2.35], flat: true });
  }
  // Antenna
  cyl(0.025, 0.04, 0.9, 6, P.metalDark, [-1.0, 3.05, 1.45]);
  b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonMagenta, { at: [-1.0, 3.53, 1.45] });
  box(0.2, 0.04, 0.04, P.metalDark, [-1.0, 3.2, 1.45]);
  // Roof rivets / panel strips
  for (let i = 0; i < 8; i++) {
    box(0.06, 0.03, 0.06, P.hullDark, [-1.15 + R() * 0.2 + (i % 2) * 2.1, 2.67, 1.5 + (i >> 1) * 0.4]);
  }
  box(2.4, 0.03, 0.04, P.hullDark, [0, 2.67, 1.6]);
  // Neon edge along roof
  for (const s of [1, -1]) box(0.04, 0.04, 1.65, nc, [s * 1.3, 2.67, 1.95]);
  // Turret ring seat on roof
  cyl(0.5, 0.55, 0.06, 8, P.hullDark, [0, 2.69, 1.9]);
  // Wheel arch hint under cab sides
  for (const s of [1, -1]) box(0.3, 0.12, 1.2, P.hullDark, [s * 1.3, 1.34, 2.8]);
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot, flat: true });

  const [tx, ty, tz] = M.turretRing;

  // Ring base
  cyl(0.5, 0.56, 0.1, 12, P.hullDark, tx, ty + 0.05, tz);
  cyl(0.46, 0.46, 0.04, 12, P.metalDark, tx, ty + 0.12, tz);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cyl(0.025, 0.025, 0.04, 6, P.rim, tx + Math.sin(a) * 0.5, ty + 0.11, tz + Math.cos(a) * 0.5);
  }
  // Housing: octagonal
  const hy = ty + 0.33;
  cyl(0.4, 0.44, 0.34, 8, P.gunmetal, tx, hy, tz);
  cyl(0.3, 0.4, 0.1, 8, P.gunmetal, tx, hy + 0.2, tz);
  // armour plates
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    if (Math.abs(a - Math.PI / 2) < 0.4 || Math.abs(a - (3 * Math.PI) / 2) < 0.4) continue;
    const r = 0.43;
    box(0.22, 0.24, 0.04, P.hullLight, tx + Math.sin(a) * r, hy, tz + Math.cos(a) * r, [0, (a * 180) / Math.PI, 0]);
  }
  // side plates and ammo boxes
  for (const s of [1, -1]) {
    box(0.04, 0.26, 0.4, P.hullLight, tx + s * 0.43, hy + 0.02, tz - 0.02);
    box(0.2, 0.2, 0.3, P.hullDark, tx + s * 0.55, hy - 0.04, tz - 0.05);
    box(0.21, 0.04, 0.31, P.metalDark, tx + s * 0.55, hy + 0.08, tz - 0.05);
    box(0.22, 0.03, 0.08, P.trim, tx + s * 0.55, hy - 0.04, tz + 0.06);
    // belt feed
    for (let k = 0; k < 5; k++) box(0.04, 0.04, 0.05, P.trim, tx + s * (0.46 - k * 0.04), hy + 0.04 + k * 0.01, tz + 0.2 + k * 0.05, [0, 0, s * 20]);
    // barrels
    const bx = tx + s * 0.16;
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 8), P.gunmetal, { at: [bx, hy + 0.02, tz + 0.8], rotation: [90, 0, 0], flat: true });
    cyl(0.07, 0.07, 0.18, 8, P.metalDark, bx, hy + 0.02, tz + 0.52, [90, 0, 0]);
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 8), P.hullDark, { at: [bx, hy + 0.02, tz + 1.28], rotation: [90, 0, 0], flat: true });
    box(0.15, 0.015, 0.05, P.metalDark, bx, hy + 0.02, tz + 1.28);
    box(0.015, 0.15, 0.05, P.metalDark, bx, hy + 0.02, tz + 1.28);
    glow(b.part(new THREE.CircleGeometry(0.03, 8), P.neonCyan, { at: [bx, hy + 0.02, tz + 1.356], dir: [0, 0, 1], axis: "z" }), 0.8);
  }
  // mantlet between barrels
  box(0.44, 0.22, 0.14, P.hullDark, tx, hy + 0.02, tz + 0.44);
  box(0.4, 0.04, 0.04, P.trim, tx, hy + 0.14, tz + 0.52);
  for (let i = 0; i < 4; i++) box(0.05, 0.05, 0.045, P.hazardBlack, tx - 0.15 + i * 0.1, hy + 0.14, tz + 0.52);

  // Sensor eye
  const ex = tx, ey = hy + 0.3, ez = tz + 0.12;
  box(0.26, 0.18, 0.26, P.hullDark, ex, ey, ez);
  cyl(0.08, 0.08, 0.1, 8, P.metalDark, ex, ey, ez + 0.17, [90, 0, 0]);
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), P.neonCyan, { at: [ex, ey, ez + 0.23] }), 1.4);
  // status light + hazard stripe
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 5), P.neonMagenta, { at: [tx - 0.15, ey + 0.11, tz - 0.1] }), 1.5);
  box(0.3, 0.025, 0.05, P.trim, tx, hy + 0.23, tz - 0.38);
  for (let i = 0; i < 5; i++) box(0.03, 0.027, 0.052, P.hazardBlack, tx - 0.12 + i * 0.06, hy + 0.23, tz - 0.38);

  // Searchlights flanking at z=2.4
  for (const s of [1, -1]) {
    const sx = s * 0.7, sz = 2.4;
    cyl(0.04, 0.05, 0.14, 6, P.metalDark, sx, 2.67, sz);
    cyl(0.1, 0.1, 0.22, 8, P.gunmetal, sx, 2.83, sz, [70, 0, 0]);
    glow(b.part(new THREE.CircleGeometry(0.085, 8), P.lampWhite, { at: [sx, 2.83 + 0.036, sz + 0.105], dir: [0, 0.34, 0.94], axis: "z" }), 1.5);
    box(0.06, 0.04, 0.06, P.hullDark, sx, 2.94, sz - 0.08);
  }

  // Radar dish at z=1.4
  const rx = 0, rz = 1.4;
  cyl(0.1, 0.12, 0.06, 8, P.hullDark, rx, 2.63, rz);
  cyl(0.025, 0.03, 0.34, 6, P.metalDark, rx, 2.8, rz);
  b.part(new THREE.SphereGeometry(0.2, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2.4), P.hullLight, { at: [rx, 3.0, rz], rotation: [-100, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 5), P.metalDark, { at: [rx, 3.04, rz - 0.08], rotation: [-80, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonMagenta, { at: [rx, 3.09, rz - 0.17] }), 1.5);
  box(0.08, 0.02, 0.08, P.trim, rx + 0.1, 2.67, rz);
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P, M }: Ctx) {
  const r = rng(11);
  void frame; void J; void M;

  // ---- helpers -----------------------------------------------------------
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rotZ = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: [0, 0, rotZ] });
  // cylinder along z from z0 to z1
  const cylZ = (rad: number, z0: number, z1: number, seg: number, color: string, x: number, y: number) =>
    b.part(new THREE.CylinderGeometry(rad, rad, Math.abs(z1 - z0), seg), color, {
      at: [x, y, (z0 + z1) / 2],
      rotation: [90, 0, 0],
    });
  // cylinder along x, centre x
  const cylX = (rad: number, len: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), color, { at: [x, y, z], rotation: [0, 0, 90] });
  const cylY = (rad: number, h: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rad, rad, h, seg), color, { at: [x, y, z] });

  const Z0 = -3.95; // body rear
  const Z1 = 0.8; // body front
  const ZC = (Z0 + Z1) / 2;
  const LEN = Z1 - Z0;

  // ---- body: faceted capsule ------------------------------------------------
  box(2.9, 0.9, LEN, P.podShell, 0, 2.1, ZC); // mid shell, y 1.65..2.55
  box(2.1, 0.5, LEN, P.podShell, 0, 2.75, ZC); // roof block, y 2.5..3.0
  box(2.3, 0.55, LEN, P.podShade, 0, 1.575, ZC); // lower half, y 1.3..1.85
  const D = 0.5 / Math.SQRT2 * 2; // diamond side 0.5 -> use rotated square
  void D;
  for (const s of [1, -1]) {
    box(0.5, 0.5, LEN, P.podShell, s * 1.096, 2.646, ZC, 45); // upper chamfer
    box(0.5, 0.5, LEN, P.podShade, s * 1.096, 1.654, ZC, 45); // lower chamfer
  }
  // end plates
  box(2.5, 1.5, 0.03, P.hullDark, 0, 2.15, -3.965);
  box(2.4, 1.3, 0.04, P.hullDark, 0, 2.15, 0.82);

  // ---- armour ribs every 0.8 m ----------------------------------------------
  const RZ = [-3.2, -2.4, -1.6, -0.8, 0.0];
  for (const z of RZ) {
    box(2.1, 0.08, 0.18, P.hull, 0, 3.03, z);
    for (const s of [1, -1]) {
      box(0.52, 0.07, 0.18, P.hull, s * 1.3, 2.85, z, -s * 45);
      box(0.52, 0.07, 0.18, P.hull, s * 1.3, 1.45, z, s * 45);
      box(0.07, 1.0, 0.18, P.hull, s * 1.485, 2.15, z);
      // bolts on rib
      cylX(0.03, 0.04, 6, P.metalDark, s * 1.52, 2.5, z);
      cylX(0.03, 0.04, 6, P.metalDark, s * 1.52, 1.8, z);
    }
  }

  // ---- hazard bands at both ends ----------------------------------------------
  for (const z of [0.55, -3.7]) {
    for (let i = 0; i < 7; i++)
      box(0.3, 0.05, 0.3, i % 2 ? P.hazardBlack : P.trim, -0.9 + 0.3 * i, 3.02, z);
    for (const s of [1, -1])
      for (let j = 0; j < 5; j++)
        box(0.05, 0.2, 0.3, (j + (s > 0 ? 0 : 1)) % 2 ? P.hazardBlack : P.trim, s * 1.475, 1.75 + 0.2 * j, z);
    for (const s of [1, -1]) {
      box(0.34, 0.06, 0.3, P.trim, s * 1.2, 2.72, z, -s * 45);
      box(0.34, 0.06, 0.3, P.hazardBlack, s * 1.2, 1.58, z, s * 45);
    }
  }

  // ---- neon strips ------------------------------------------------------------
  for (const s of [1, -1]) {
    glow(box(0.05, 0.03, 4.6, P.neonCyan, s * 0.6, 3.012, ZC), 1.6);
    glow(box(0.03, 0.05, 4.6, P.neonCyan, s * 1.466, 2.4, ZC), 1.6);
    glow(box(0.03, 0.05, 4.6, P.neonMagenta, s * 1.466, 1.72, ZC), 1.6);
  }

  // ---- corner clamps strapping to chassis ---------------------------------------
  for (const s of [1, -1])
    for (const z of [-3.4, -1.6, 0.4]) {
      box(0.2, 0.5, 0.4, P.metalDark, s * 1.38, 1.55, z);
      box(0.06, 0.1, 0.46, P.gunmetal, s * 1.47, 1.8, z);
      for (const y of [1.42, 1.66]) cylX(0.03, 0.04, 6, P.rim, s * 1.49, y, z + (r() > 0.5 ? 0.1 : -0.1));
    }

  // ---- flank emblem (biohazard-ish) and ID blocks -----------------------------------
  for (const s of [1, -1]) {
    const z0 = -1.2;
    const y0 = 2.2;
    cylX(0.3, 0.02, 8, P.hazardBlack, s * 1.465, y0, z0);
    cylX(0.26, 0.02, 8, P.trim, s * 1.472, y0, z0);
    for (const a of [90, 210, 330]) {
      const ar = (a * Math.PI) / 180;
      cylX(0.09, 0.02, 6, P.hazardBlack, s * 1.481, y0 + 0.14 * Math.sin(ar), z0 + 0.14 * Math.cos(ar));
    }
    cylX(0.05, 0.02, 6, P.hazardBlack, s * 1.481, y0, z0);
    cylX(0.025, 0.02, 6, P.trim, s * 1.485, y0, z0);
    // ID plate
    box(0.03, 0.34, 0.7, P.hullDark, s * 1.47, 2.2, -2.0);
    for (let k = 0; k < 3; k++) {
      box(0.02, 0.2, 0.14, P.lampWhite, s * 1.488, 2.2, -2.2 + 0.2 * k);
      box(0.022, 0.05, 0.08, P.hullDark, s * 1.49, 2.2 + (k % 2 ? 0.04 : -0.04), -2.2 + 0.2 * k);
    }
  }

  // ---- roof hatch, vents, rails ---------------------------------------------------------
  box(0.7, 0.06, 0.6, P.hullDark, 0, 3.03, -2.0);
  box(0.56, 0.04, 0.46, P.gunmetal, 0, 3.08, -2.0);
  box(0.5, 0.03, 0.06, P.metalDark, 0, 3.115, -2.0);
  box(0.06, 0.03, 0.4, P.metalDark, 0, 3.115, -2.0);
  glow(box(0.06, 0.04, 0.06, P.neonMagenta, 0.28, 3.1, -1.78), 2);
  for (const s of [1, -1]) {
    cylY(0.08, 0.35, 8, P.gunmetal, s * 0.5, 3.17, -3.6);
    cylY(0.11, 0.05, 8, P.metalDark, s * 0.5, 3.36, -3.6);
    cylY(0.095, 0.04, 8, P.trim, s * 0.5, 3.1, -3.6);
    cylZ(0.05, -3.6, -2.9, 6, P.gunmetal, s * 0.5, 3.12);
    // top rails
    cylZ(0.03, -3.2, 0.0, 6, P.rim, s * 0.9, 3.2);
    for (const z of RZ) cylY(0.025, 0.17, 5, P.rim, s * 0.9, 3.115, z);
  }

  // ---- rear seal-door -------------------------------------------------------------------------
  cylZ(0.88, -3.99, -3.98, 16, P.hullLight, 0, 2.15);
  cylZ(0.72, -3.995, -3.98, 16, P.podSeal, 0, 2.15);
  glow(
    b.part(new THREE.TorusGeometry(0.78, 0.03, 5, 20), P.neonMagenta, { at: [0, 2.15, -3.97] }),
    2,
  );
  box(1.4, 0.07, 0.02, P.metalDark, 0, 2.15, -3.998);
  box(0.07, 1.4, 0.02, P.metalDark, 0, 2.15, -3.998);
  box(0.07, 1.4, 0.02, P.metalDark, 0, 2.15, -3.998);
  cylZ(0.17, -4.0, -3.98, 8, P.metalDark, 0, 2.15);
  glow(cylZ(0.09, -4.0, -3.99, 8, P.neonMagenta, 0, 2.15), 2.2);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    box(0.09, 0.09, 0.03, P.metalDark, 0.84 * Math.cos(a), 2.15 + 0.84 * Math.sin(a), -3.993);
  }
  // rear corner clamps
  for (const s of [1, -1]) {
    box(0.16, 1.4, 0.06, P.metalDark, s * 1.3, 2.15, -3.975);
    glow(box(0.04, 1.2, 0.02, P.neonCyan, s * 1.22, 2.15, -3.995), 1.6);
  }

  // ---- front face pipe connectors toward the cab ----------------------------------------------------
  const conn: [number, number][] = [[0.6, 2.45], [-0.6, 2.45], [0, 1.95]];
  for (const [x, y] of conn) {
    cylZ(0.09, 0.84, 1.0, 8, P.gunmetal, x, y);
    cylZ(0.14, 0.84, 0.87, 8, P.hullLight, x, y);
    cylZ(0.115, 0.93, 0.97, 8, P.trim, x, y);
    glow(cylZ(0.05, 0.985, 1.0, 6, P.neonCyan, x, y), 1.8);
  }
  cylX(0.05, 1.2, 6, P.gunmetal, 0, 2.2, 0.9);
  for (const s of [1, -1])
    for (const y of [1.6, 2.7]) cylZ(0.05, 0.84, 0.88, 6, P.rim, s * 1.1, y);
}
```
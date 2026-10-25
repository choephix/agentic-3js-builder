<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Aegis-7",
  "description": "A low-poly cyberpunk armoured convoy hauler: wedge-nosed six-wheel tractor cab towing a sealed, neon-banded cargo pod.",
  "builderName": "convoyHauler",
  "size": [2.8, 3.0, 9.0],
  "layout": "Static vehicle facing +Z. Front: angular wedge cab with slit visor windscreen, bull-bar and headlights (z 4.5 to 1.6). Behind the cab, a flat armoured chassis with six wheels (two front, four rear tandem) runs the full length at y 0.4-1.2. The sealed cargo pod is a long hex-profile capsule on a cradle over the rear chassis (z 1.4 to -4.5), with hazard stripes, glowing cyan seams and a rear door. Roof of the cab carries antenna, light bar and a small sensor turret. Flat colours only; style shows via chamfered boxes, neon trim lines (cyan, magenta), hazard-yellow stripes and glowing lights.",
  "palette": {
    "hull": "#2f3644",
    "hullDark": "#1b1f29",
    "hullLight": "#4a5468",
    "trim": "#e7b814",
    "trimDark": "#14120a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "glass": "#0a2a3a",
    "tyre": "#111216",
    "rim": "#8a93a6",
    "pod": "#d9dde6",
    "podShade": "#9aa3b5",
    "warnRed": "#e0262f",
    "lamp": "#fff3b0",
    "rust": "#6b3f2a"
  },
  "mounts": {
    "chassisTop": [0, 1.2, 0],
    "cabFloor": [0, 1.2, 3.0],
    "cradleTop": [0, 1.55, -1.6],
    "podCentre": [0, 2.3, -1.5],
    "axleF": [0, 0.55, 3.2],
    "axleR1": [0, 0.55, -1.2],
    "axleR2": [0, 0.55, -2.8],
    "roofTop": [0, 2.7, 2.7]
  },
  "joints": [],
  "parts": [
    {
      "id": "chassis",
      "builds": "Armoured ladder chassis and under-body: two long side rails, cross members, fuel/battery boxes, skirt plates with hazard-yellow chevrons, mudflaps, front bumper with bull-bar and tow hooks, rear bumper with red tail lights and neon magenta underglow strips. Colours hullDark, hull, trim, warnRed, neonMagenta.",
      "box": [[-1.3, 0.35, -4.5], [1.3, 1.2, 4.5]],
      "attaches": "Top face at chassisTop supports cab (cabFloor) and cargo cradle (cradleTop); wheel wells open at axle mounts.",
      "joints": [],
      "floor": false,
      "budget": 170
    },
    {
      "id": "wheels",
      "builds": "Six chunky low-poly wheels (8-sided tyres) at axleF, axleR1, axleR2, both sides, with rim discs, hub bolts, cyan hub lights, axles, plus mudguard arches over each wheel. Colours tyre, rim, hullLight, neonCyan.",
      "box": [[-1.4, 0, -3.5], [1.4, 1.1, 4.0]],
      "attaches": "Wheel centres at y 0.55 on axle mounts; axles meet chassis sides.",
      "joints": [],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cab",
      "builds": "Wedge-shaped armoured tractor cab: chamfered hull boxes, sloped bonnet, slit glass visor windscreen with side windows, door seams, wing mirrors, grille with glowing lamp headlights and cyan DRL strips, roof light bar (magenta/red), antenna mast, small sensor turret dome, exhaust stacks behind the cab, hazard stripe on bonnet. Colours hull, hullLight, glass, lamp, neonCyan, neonMagenta, trim.",
      "box": [[-1.35, 1.2, 1.6], [1.35, 2.9, 4.4]],
      "attaches": "Sits on chassis at cabFloor; rear wall faces the pod at z 1.6; roof at roofTop.",
      "joints": [],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cargoPod",
      "builds": "Sealed hexagonal-profile cargo pod, long capsule built from chamfered segments: pod and podShade panels with seam rings, glowing neon cyan seam lines, hazard-yellow bands, bolted armour plates, rear double door with wheel lock and red lock lights, ID emblem and warning decals as small parts, top vent fins and sensor nodules. Colours pod, podShade, hull, trim, neonCyan, warnRed, trimDark.",
      "box": [[-1.3, 1.5, -4.5], [1.3, 3.0, 1.4]],
      "attaches": "Rests in cradle at cradleTop; centre at podCentre; front face near cab rear wall.",
      "joints": [],
      "floor": false,
      "budget": 220
    },
    {
      "id": "cradle",
      "builds": "Cargo cradle and fittings: three saddle frames cradling the pod with rubber pads, tie-down chain straps with ratchet buckles, a coupling plate and hydraulic rams, cable runs along the sides with cyan connectors, side tool lockers, rear ladder, rust-streak patches and small signage plates. Colours hullDark, hullLight, trim, rust, neonCyan, tyre.",
      "box": [[-1.4, 1.2, -4.4], [1.4, 2.2, 1.5]],
      "attaches": "Base on chassisTop; saddles top out at cradleTop under the pod.",
      "joints": [],
      "floor": false,
      "budget": 130
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.4;
  const rand = rng(11);
  const axles: number[] = [M.axleF[2], M.axleR1[2], M.axleR2[2]];
  const X = 1.0; // wheel centre x

  const cyl = (r: number, h: number, seg: number) => new THREE.CylinderGeometry(r, r, h, seg);
  const sideAim = (s: number) => [s, 0, 0] as [number, number, number];

  for (const z of axles) {
    // axle across the chassis
    b.part(cyl(0.09, 2 * X + 0.2, 8), P.hullLight, { at: [0, R, z], dir: [1, 0, 0] });
    // differential housing
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.hullDark, { at: [0, R, z], flat: true });

    for (const s of [1, -1]) {
      const cx = s * X;
      const d = sideAim(s);
      // tyre
      b.part(cyl(R, W, 8), P.tyre, { at: [cx, R, z], dir: d, flat: true });
      // tread blocks around the tyre
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const y = R + Math.cos(a) * (R + 0.015);
        const zz = z + Math.sin(a) * (R + 0.015);
        b.part(new THREE.BoxGeometry(W * 0.9, 0.05, 0.14), P.tyre, {
          at: [cx, y, zz],
          rotation: [(-a * 180) / Math.PI + 90 * 0, 0, 0],
        });
      }
      // sidewall ring (outer)
      const ox = cx + s * (W / 2 + 0.01);
      b.part(cyl(R * 0.78, 0.03, 8), P.hullDark, { at: [ox, R, z], dir: d });
      // rim disc
      b.part(cyl(R * 0.56, 0.05, 8), P.rim, { at: [ox + s * 0.02, R, z], dir: d, flat: true });
      // rim lip
      b.part(new THREE.TorusGeometry(R * 0.56, 0.025, 4, 8), P.hullLight, {
        at: [ox + s * 0.05, R, z],
        dir: d,
        axis: "z",
      });
      // hub cap
      b.part(cyl(0.15, 0.07, 8), P.hullLight, { at: [ox + s * 0.07, R, z], dir: d });
      // cyan hub light
      b.part(cyl(0.085, 0.04, 8), P.neonCyan, { at: [ox + s * 0.11, R, z], dir: d });
      // hub bolts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.025, 0.05, 6), P.hullDark, {
          at: [ox + s * 0.07, R + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3],
          dir: d,
        });
      }
      // spokes accents
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        b.part(new THREE.BoxGeometry(0.03, 0.08, R * 0.9), P.hullDark, {
          at: [ox + s * 0.055, R, z],
          rotation: [(a * 180) / Math.PI, 0, 0],
        });
      }
      // mudguard arch: segments over the top of the wheel
      const segs = 6;
      for (let i = 0; i < segs; i++) {
        const a = -Math.PI * 0.45 + (i / (segs - 1)) * Math.PI * 0.9; // from front to back over top
        const rr = R + 0.1;
        const y = R + Math.cos(a) * rr;
        const zz = z + Math.sin(a) * rr;
        b.part(new THREE.BoxGeometry(W + 0.14, 0.05, 0.2), P.hullLight, {
          at: [cx, y, zz],
          rotation: [(-a * 180) / Math.PI, 0, 0],
          flat: true,
        });
      }
      // arch edge neon trim on outer side
      for (let i = 0; i < segs; i++) {
        const a = -Math.PI * 0.45 + (i / (segs - 1)) * Math.PI * 0.9;
        const rr = R + 0.1;
        b.part(new THREE.BoxGeometry(0.02, 0.03, 0.17), P.neonCyan, {
          at: [cx + s * (W / 2 + 0.07), R + Math.cos(a) * rr, z + Math.sin(a) * rr],
          rotation: [(-a * 180) / Math.PI, 0, 0],
        });
      }
      // suspension arm to chassis
      b.part(new THREE.BoxGeometry(0.5, 0.1, 0.14), P.hullDark, { at: [s * 0.75, R + 0.15, z] });
      // spring / damper
      b.part(cyl(0.05, 0.4, 6), P.trim, { at: [s * 0.7, R + 0.4, z + 0.18 + rand() * 0.02], flat: true });
    }
  }

  // twin axle linking beam between rear axles
  b.part(new THREE.BoxGeometry(0.22, 0.14, axles[1] - axles[2] + 0.2), P.hullDark, {
    at: [0, R + 0.2, (axles[1] + axles[2]) / 2],
  });
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCab({ b, J, P, M }: Ctx) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot, flat: true });
  const GLOW = (c: string) => c;

  // Main body: lower tub, cabin block, sloped bonnet
  box(2.6, 0.8, 2.8, P.hull, 0, 1.6, 3.0);
  box(2.7, 0.12, 2.9, P.hullDark, 0, 1.24, 3.0);
  // cabin upper
  box(2.5, 0.95, 1.6, P.hull, 0, 2.45, 2.4);
  // rear wall plate
  box(2.3, 1.4, 0.1, P.hullLight, 0, 2.0, 1.63);
  // sloped bonnet (wedge)
  box(2.5, 0.5, 1.8, P.hull, 0, 2.05, 3.7, [-14, 0, 0]);
  box(2.4, 0.3, 1.0, P.hullLight, 0, 1.75, 4.05, [-20, 0, 0]);
  // chamfer edges
  for (const s of [1, -1]) {
    box(0.18, 0.9, 2.8, P.hullLight, s * 1.3, 1.6, 3.0, [0, 0, s * 12]);
    box(0.2, 0.2, 1.6, P.hullLight, s * 1.2, 2.95 - 0.05 - 0.0, 2.4, [0, 0, s * 25]);
  }
  // roof slab and slanted windscreen frame
  box(2.4, 0.12, 1.5, P.hullLight, 0, 2.93 - 0.03, 2.35);
  box(2.4, 0.16, 0.5, P.hullDark, 0, 2.6, 3.28, [-40, 0, 0]);
  // visor windscreen slit
  box(2.1, 0.28, 0.06, P.glass, 0, 2.55, 3.36, [-40, 0, 0]);
  box(2.2, 0.04, 0.05, P.neonCyan, 0, 2.72, 3.3, [-40, 0, 0]);
  for (const s of [1, -1]) {
    // side windows
    box(0.06, 0.4, 0.95, P.glass, s * 1.26, 2.5, 2.55);
    box(0.07, 0.05, 1.0, P.hullLight, s * 1.27, 2.74, 2.55);
    // door seams
    box(0.05, 0.9, 0.04, P.hullDark, s * 1.31, 1.95, 3.05);
    box(0.05, 0.9, 0.04, P.hullDark, s * 1.31, 1.95, 2.0);
    box(0.05, 0.04, 1.05, P.hullDark, s * 1.31, 1.5, 2.52);
    box(0.08, 0.06, 0.25, P.hullLight, s * 1.33, 2.05, 2.9);
    // wing mirrors
    box(0.05, 0.05, 0.3, P.hullDark, s * 1.45, 2.4, 3.1);
    box(0.1, 0.32, 0.22, P.hullDark, s * 1.62, 2.4, 3.1);
    box(0.02, 0.26, 0.16, P.glass, s * 1.62, 2.4, 3.2);
    // headlights
    box(0.5, 0.22, 0.12, P.hullDark, s * 0.85, 1.72, 4.43);
    box(0.4, 0.14, 0.08, P.lamp, s * 0.85, 1.72, 4.5);
    box(0.5, 0.04, 0.08, P.neonCyan, s * 0.85, 1.55, 4.48);
    // side neon DRL
    box(0.04, 0.04, 2.3, P.neonCyan, s * 1.33, 1.38, 3.0);
    // exhaust stacks behind cab
    cyl(0.1, 0.1, 1.3, 8, P.hullDark, s * 1.05, 2.9, 1.78);
    cyl(0.13, 0.1, 0.1, 8, P.hullLight, s * 1.05, 3.0 - 0.0, 1.78);
    cyl(0.11, 0.11, 0.06, 8, P.trim, s * 1.05, 2.4, 1.78);
    // hazard stripes on bonnet
    for (let i = 0; i < 3; i++)
      box(0.22, 0.03, 0.14, P.trim, s * (0.25 + i * 0.3 - 0.0), 2.19 - i * 0.0 , 3.9 - 0.0, [-14, 0, s * 30]);
    // light-bar pods
    box(0.5, 0.12, 0.12, s > 0 ? P.neonMagenta : P.neonCyan, s * 0.55, 3.0, 2.95);
  }
  // grille
  box(1.1, 0.5, 0.1, P.hullDark, 0, 1.6, 4.44);
  for (let i = 0; i < 5; i++) box(1.0, 0.04, 0.05, P.hullLight, 0, 1.43 + i * 0.1, 4.5);
  box(0.3, 0.3, 0.04, P.trim, 0, 1.9, 4.46);
  box(0.12, 0.12, 0.04, P.neonMagenta, 0, 1.9, 4.49);
  // roof light bar
  box(1.6, 0.14, 0.16, P.hullDark, 0, 2.99, 2.95);
  for (let i = 0; i < 6; i++) box(0.22, 0.1, 0.1, i % 2 ? P.neonMagenta : P.warnRed, -0.6 + i * 0.24, 3.08, 2.95);
  // antenna
  cyl(0.025, 0.04, 0.9, 6, P.hullDark, -0.9, 3.35, 1.95);
  box(0.08, 0.08, 0.08, P.neonMagenta, -0.9, 3.82 - 0.0, 1.95);
  // sensor turret
  cyl(0.28, 0.32, 0.12, 8, P.hullDark, 0.6, 3.04, 2.1);
  b.part(new THREE.SphereGeometry(0.24, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.hullLight, { at: [0.6, 3.1, 2.1], flat: true });
  box(0.1, 0.1, 0.2, P.glass, 0.6, 3.22, 2.3);
  box(0.06, 0.06, 0.06, P.neonCyan, 0.6, 3.22, 2.42);
  // bonnet roof vents
  for (let i = 0; i < 3; i++) box(0.9, 0.03, 0.08, P.hullDark, 0, 2.24 - i * 0.03, 3.5 + i * 0.22, [-14, 0, 0]);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildChassis({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], name });
  const wedge = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 1, 4, 1).rotateY(Math.PI / 4).scale(w * 1.414, h, d * 1.414), c, { at: [x, y, z] });

  // side rails
  for (const s of [1, -1]) {
    box(0.22, 0.4, 9, P.hullDark, s * 0.8, 0.95, 0, "rail");
    box(0.3, 0.08, 9, P.hull, s * 0.8, 1.17, 0, "railTop");
    box(0.06, 0.06, 8.6, P.neonMagenta, s * 0.95, 0.45, 0, "underglow");
  }
  // deck plate
  box(2.0, 0.08, 8.8, P.hull, 0, 1.16, 0, "deck");
  // cross members
  for (let i = 0; i < 9; i++) {
    const z = -4.2 + i * 1.05;
    box(1.4, 0.18, 0.2, P.hullDark, 0, 0.8, z, "cross");
    box(1.1, 0.04, 0.08, P.hullLight, 0, 0.9, z);
  }
  // central spine / driveshaft
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 8, 8).rotateX(Math.PI / 2), P.hullLight, { at: [0, 0.6, 0] });

  // fuel / battery boxes
  for (const s of [1, -1]) {
    box(0.55, 0.45, 1.3, P.hull, s * 1.0, 0.7, 0.4, "fuel");
    box(0.5, 0.06, 1.2, P.hullLight, s * 1.0, 0.95, 0.4);
    for (const z of [-0.1, 0.9]) box(0.04, 0.5, 0.1, P.hullDark, s * 1.28, 0.7, z);
    box(0.5, 0.45, 0.8, P.hullDark, s * 1.0, 0.7, -3.6, "battery");
    box(0.04, 0.1, 0.4, P.neonCyan, s * 1.26, 0.8, -3.6);
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), P.warnRed, { at: [s * 1.0, 0.96, -3.9] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 6), P.neonCyan, { at: [s * 1.0, 0.96, -3.3] });
  }

  // skirt plates with hazard chevrons, gaps for wheel wells
  const skirts: [number, number][] = [[0.7, 1.3], [-0.2, 0.5], [-2.0, 0.8]];
  for (const s of [1, -1]) {
    for (const [z, len] of skirts) {
      box(0.08, 0.5, len, P.hull, s * 1.28, 0.8, z, "skirt");
      box(0.05, 0.04, len, P.hullLight, s * 1.3, 1.06, z);
      const n = Math.max(2, Math.floor(len / 0.3));
      for (let i = 0; i < n; i++) {
        const zz = z - len / 2 + (i + 0.5) * (len / n);
        b.part(new THREE.BoxGeometry(0.03, 0.1, 0.1), P.trim, { at: [s * 1.33, 0.8, zz], rotation: [0, 0, 0], name: "chevron" });
        b.part(new THREE.BoxGeometry(0.03, 0.08, 0.1), P.trim, { at: [s * 1.33, 0.88, zz + 0.02], rotation: [35, 0, 0] });
        b.part(new THREE.BoxGeometry(0.03, 0.08, 0.1), P.trim, { at: [s * 1.33, 0.72, zz + 0.02], rotation: [-35, 0, 0] });
      }
    }
    // mudflaps
    for (const z of [-1.9, -3.4]) {
      box(0.05, 0.4, 0.5, P.tyre, s * 1.2, 0.55, z, "mudflap");
      box(0.06, 0.06, 0.4, P.trim, s * 1.2, 0.4, z);
    }
    // tow hooks
    b.part(new THREE.TorusGeometry(0.07, 0.025, 5, 8), P.trim, { at: [s * 0.6, 0.55, 4.5] });
    box(0.06, 0.06, 0.2, P.hullDark, s * 0.6, 0.55, 4.4);
  }

  // front bumper + bull bar
  box(2.6, 0.3, 0.3, P.hullDark, 0, 0.55, 4.35, "bumper");
  wedge(2.4, 0.22, 0.3, P.hull, 0, 0.78, 4.35);
  box(2.2, 0.04, 0.08, P.neonMagenta, 0, 0.43, 4.52);
  for (const s of [1, -1]) {
    box(0.1, 0.55, 0.1, P.hullLight, s * 0.9, 0.9, 4.45, "bar");
    box(0.1, 0.55, 0.1, P.hullLight, s * 0.3, 0.9, 4.45);
  }
  box(2.0, 0.1, 0.12, P.hullLight, 0, 1.15, 4.45);
  box(2.0, 0.08, 0.1, P.hullLight, 0, 0.7, 4.47);
  for (let i = 0; i < 6; i++) box(0.1, 0.05, 0.04, i % 2 ? P.trimDark : P.trim, -0.8 + i * 0.32, 0.55, 4.52, "stripe");

  // rear bumper
  box(2.6, 0.35, 0.28, P.hullDark, 0, 0.6, -4.36, "rearBumper");
  box(2.5, 0.05, 0.3, P.hullLight, 0, 0.8, -4.36);
  for (let i = 0; i < 8; i++) box(0.14, 0.12, 0.03, i % 2 ? P.trimDark : P.trim, -1.0 + i * 0.29, 0.5, -4.52, "hazard");
  for (const s of [1, -1]) {
    box(0.35, 0.16, 0.05, P.warnRed, s * 0.95, 0.7, -4.52, "tailLight");
    box(0.2, 0.05, 0.06, P.lamp, s * 0.95, 0.7, -4.54);
    box(0.5, 0.04, 0.04, P.neonMagenta, s * 0.55, 0.38, -4.5);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 6).rotateX(Math.PI / 2), P.hullLight, { at: [s * 0.3, 0.45, -4.5] });
  }

  // underglow underside strips and rivets
  box(1.4, 0.03, 0.05, P.neonMagenta, 0, 0.33, 3.6);
  box(1.4, 0.03, 0.05, P.neonMagenta, 0, 0.33, -3.2);
  for (const s of [1, -1])
    for (let i = 0; i < 12; i++) {
      const z = -4 + i * 0.7 + R() * 0.1;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 5).rotateZ(Math.PI / 2), P.hullLight, { at: [s * 0.93, 1.0, z] });
    }
}
```

<!-- call: cradle -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildCradle({ b, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });
  const cyl = (r: number, len: number, c: string, x: number, y: number, z: number, axis: "x" | "z" | "y" = "z", seg = 8) => {
    const rot: [number, number, number] = axis === "z" ? [90, 0, 0] : axis === "x" ? [0, 0, 90] : [0, 0, 0];
    return b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z], rotation: rot });
  };
  const base = M.chassisTop[1];
  const top = M.cradleTop[1];

  // Saddle frames
  const saddles = [0.9, -1.6, -3.9];
  for (const z of saddles) {
    box(2.5, 0.12, 0.34, P.hullDark, 0, base + 0.06, z);
    for (const s of [1, -1]) {
      // uprights, angled outward
      box(0.16, 0.5, 0.3, P.hullLight, s * 1.0, base + 0.35, z, [0, 0, s * -12]);
      box(0.12, 0.14, 0.34, P.hullDark, s * 1.12, base + 0.62, z, [0, 0, s * -35]);
      // rubber pads
      box(0.12, 0.34, 0.26, P.tyre, s * 0.95, top - 0.12, z, [0, 0, s * -35]);
      // trim bolts
      for (const dz of [-0.1, 0.1]) cyl(0.025, 0.04, P.trim, s * 1.0, base + 0.5, z + dz, "x", 6);
    }
    box(1.0, 0.08, 0.3, P.hullLight, 0, base + 0.16, z);
    box(0.5, 0.06, 0.26, P.tyre, 0, top - 0.1, z);
  }

  // Tie-down straps over pod with buckles
  for (const z of [0.4, -2.4, -3.3]) {
    for (const s of [1, -1]) {
      box(0.06, 0.7, 0.1, P.tyre, s * 1.2, base + 0.55, z, [0, 0, s * -28]);
      box(0.14, 0.18, 0.16, P.trim, s * 1.18, base + 0.4, z);
      box(0.08, 0.1, 0.18, P.hullDark, s * 1.18, base + 0.4, z);
      for (let i = 0; i < 4; i++) cyl(0.03, 0.05, P.hullLight, s * (1.12 + i * 0.015), base + 0.62 + i * 0.12, z + 0.06, "z", 6);
      box(0.1, 0.1, 0.12, P.neonCyan, s * 1.22, base + 0.22, z + 0.12);
    }
  }

  // Coupling plate and hydraulic rams at front
  cyl(0.5, 0.1, P.hullDark, 0, base + 0.08, 1.15, "y", 10);
  cyl(0.3, 0.06, P.trim, 0, base + 0.15, 1.15, "y", 10);
  box(0.3, 0.1, 0.5, P.hullLight, 0, base + 0.2, 1.3);
  for (const s of [1, -1]) {
    cyl(0.07, 0.8, P.hullLight, s * 0.6, base + 0.4, 1.15, "z", 8);
    cyl(0.045, 0.5, P.rim ? P.hullLight : P.hullLight, s * 0.6, base + 0.4, 1.5, "z", 6);
    box(0.14, 0.14, 0.1, P.trim, s * 0.6, base + 0.4, 0.72);
    box(0.12, 0.2, 0.12, P.hullDark, s * 0.6, base + 0.2, 0.75);
  }

  // Cable runs with connectors
  for (const s of [1, -1]) {
    box(0.08, 0.08, 5.6, P.tyre, s * 1.32, base + 0.15, -1.4);
    box(0.06, 0.06, 5.6, P.neonCyan, s * 1.35, base + 0.28, -1.4);
    for (let z = 1.0; z > -4.2; z -= 1.04) {
      box(0.14, 0.18, 0.22, P.hullDark, s * 1.34, base + 0.2, z);
      box(0.08, 0.1, 0.1, P.neonCyan, s * 1.41, base + 0.22, z);
    }
  }

  // Side tool lockers
  for (const s of [1, -1]) {
    box(0.3, 0.55, 1.1, P.hullLight, s * 1.25, base + 0.45, -0.4);
    box(0.04, 0.45, 0.95, P.hullDark, s * 1.41, base + 0.45, -0.4);
    box(0.05, 0.08, 0.3, P.trim, s * 1.44, base + 0.55, -0.4);
    box(0.05, 0.05, 0.05, P.neonCyan, s * 1.44, base + 0.3, -0.85);
    // locker hazard stripes
    for (let i = 0; i < 3; i++) box(0.05, 0.07, 0.14, P.trim, s * 1.44, base + 0.72, -0.8 + i * 0.3, [s * 20, 0, 0]);
  }

  // Rear ladder
  for (const x of [-0.35, 0.35]) box(0.06, 1.0, 0.06, P.hullLight, x, base + 0.45, -4.5);
  for (let i = 0; i < 6; i++) box(0.76, 0.05, 0.05, P.trim, 0, base - 0.0 + i * 0.17, -4.5);
  box(0.9, 0.06, 0.18, P.hullDark, 0, base + 0.95, -4.4);

  // Rust streaks
  for (let i = 0; i < 12; i++) {
    const s = R() < 0.5 ? 1 : -1;
    const z = -4 + R() * 5;
    box(0.04, 0.1 + R() * 0.3, 0.08 + R() * 0.2, P.rust, s * 1.43, base + 0.2 + R() * 0.5, z);
  }
  for (let i = 0; i < 6; i++) box(0.3 + R() * 0.4, 0.02, 0.15 + R() * 0.2, P.rust, (R() - 0.5) * 1.6, base + 0.13, -4 + R() * 5);

  // Signage plates
  for (const s of [1, -1]) {
    box(0.04, 0.2, 0.34, P.trim, s * 1.43, base + 0.82, -2);
    box(0.045, 0.08, 0.2, P.hullDark, s * 1.44, base + 0.82, -2);
    box(0.04, 0.12, 0.12, P.warnRed ?? P.trim, s * 1.43, base + 0.82, -3);
  }
  box(0.4, 0.2, 0.04, P.trim, 0, base + 0.25, -4.45);
  box(0.3, 0.05, 0.05, P.hullDark, 0, base + 0.25, -4.48);
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildCargoPod({ b, P }: any) {
  const r = rng(11);
  const CY = 2.3, ZF = 1.4, ZB = -4.5;
  const ZC = (ZF + ZB) / 2, LEN = ZF - ZB;
  const R = 0.72; // hex circumradius-ish
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot });

  // main hex body: cylinder with 6 sides, axis along Z
  const hex = (rad: number, len: number, c: string, z: number, rad2?: number) => {
    const g = new THREE.CylinderGeometry(rad, rad2 ?? rad, len, 6, 1);
    g.rotateY(Math.PI / 6);
    return b.part(g, c, { at: [0, CY, z], dir: [0, 0, 1], flat: true });
  };
  const SEG = 6, segL = (LEN - 0.6) / SEG;
  const z0 = ZB + 0.3;
  for (let i = 0; i < SEG; i++) {
    const z = z0 + segL * (i + 0.5);
    hex(1.2, segL - 0.04, i % 2 ? P.podShade : P.pod, z);
  }
  // nose and tail caps (chamfered)
  hex(1.0, 0.3, P.podShade, ZF - 0.15, 0.85);
  hex(1.0, 0.3, P.hull, ZB + 0.15, 1.0);

  // seam rings with neon
  for (let i = 0; i <= SEG; i++) {
    const z = z0 + segL * i;
    hex(1.24, 0.07, P.hull, z);
    hex(1.26, 0.025, P.neonCyan, z);
  }
  // hazard bands
  for (const i of [1, 4]) {
    const z = z0 + segL * (i + 0.5);
    hex(1.235, 0.28, P.trim, z);
    for (let k = 0; k < 6; k++) {
      const a = (k + 0.5) * (Math.PI / 3);
      // dark chevrons on each facet
      const ap = 1.07;
      b.part(new THREE.BoxGeometry(0.18, 0.06, 0.2), P.trimDark, {
        at: [Math.sin(a) * ap * 1.0, CY + Math.cos(a) * ap, z],
        rotation: [0, 0, (-a * 180) / Math.PI],
      });
    }
  }
  // longitudinal neon lines at hex corners (sides)
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.04, LEN - 0.8), P.neonCyan, { at: [s * 1.03, CY + 0.6, ZC] });
    b.part(new THREE.BoxGeometry(0.04, 0.04, LEN - 0.8), P.neonCyan, { at: [s * 1.03, CY - 0.6, ZC] });
  }
  // bolted armour plates on sides
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = z0 + segL * (i + 0.5) + 0.0;
      if (i === 1 || i === 4) continue;
      const g = new THREE.BoxGeometry(0.06, 0.55, segL * 0.6);
      b.part(g, P.hull, { at: [s * 1.22, CY, z] });
      for (const dz of [-0.3, 0.3] as number[])
        for (const dy of [-0.2, 0.2] as number[])
          b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.rim ?? P.hullLight, {
            at: [s * 1.26, CY + dy, z + dz], dir: [1, 0, 0],
          });
    }
  // top vent fins
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.BoxGeometry(0.7, 0.14, 0.05), P.hull, { at: [0, CY + 1.12, -2.6 + i * 0.14] });
    b.part(new THREE.BoxGeometry(0.7, 0.01, 0.03), P.neonCyan, { at: [0, CY + 1.2, -2.6 + i * 0.14] });
  }
  b.part(new THREE.BoxGeometry(0.8, 0.1, 0.9), P.hullDark, { at: [0, CY + 1.08, -2.3] });
  // sensor nodules
  for (let i = 0; i < 5; i++) {
    const z = -3.9 + i * 0.35 + r() * 0.05;
    const x = (i % 2 ? 1 : -1) * 0.4;
    b.part(new THREE.SphereGeometry(0.07, 6, 4), P.hullLight, { at: [x, CY + 1.07, z] });
    b.part(new THREE.SphereGeometry(0.03, 5, 4), i % 2 ? P.warnRed : P.neonCyan, { at: [x, CY + 1.13, z] });
  }
  // rear double door
  const zr = ZB - 0.02;
  b.part(new THREE.BoxGeometry(1.8, 1.6, 0.06), P.hull, { at: [0, CY, zr] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.82, 1.4, 0.05), P.podShade, { at: [s * 0.43, CY, zr - 0.04] });
    b.part(new THREE.BoxGeometry(0.7, 0.04, 0.03), P.trimDark, { at: [s * 0.43, CY + 0.45, zr - 0.07] });
    b.part(new THREE.BoxGeometry(0.7, 0.04, 0.03), P.trimDark, { at: [s * 0.43, CY - 0.45, zr - 0.07] });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.05), P.hullDark, { at: [s * 0.8, CY + 0.5, zr - 0.07] });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.05), P.hullDark, { at: [s * 0.8, CY - 0.5, zr - 0.07] });
  }
  b.part(new THREE.BoxGeometry(0.03, 1.4, 0.06), P.trimDark, { at: [0, CY, zr - 0.08] });
  // wheel lock
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 8), P.hullDark, { at: [0, CY, zr - 0.1], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 8), P.trim, { at: [0, CY, zr - 0.12], dir: [0, 0, 1] });
  for (let k = 0; k < 3; k++) {
    const a = (k * Math.PI) / 3;
    b.part(new THREE.BoxGeometry(0.5, 0.05, 0.05), P.hullDark, {
      at: [0, CY, zr - 0.17], rotation: [0, 0, (a * 180) / Math.PI],
    });
  }
  // red lock lights
  for (const s of [1, -1])
    for (const dy of [0.62, -0.62])
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.warnRed, { at: [s * 0.8, CY + dy, zr - 0.08] });
  // rear neon frame
  b.part(new THREE.BoxGeometry(1.8, 0.03, 0.03), P.neonCyan, { at: [0, CY + 0.82, zr - 0.02] });
  b.part(new THREE.BoxGeometry(1.8, 0.03, 0.03), P.neonCyan, { at: [0, CY - 0.82, zr - 0.02] });

  // ID emblem on left side (+X): hazard diamond + bars
  const ex = 1.285, ez = -0.4;
  b.part(new THREE.BoxGeometry(0.03, 0.5, 0.5), P.trimDark, { at: [ex, CY + 0.05, ez], rotation: [45, 0, 0] });
  b.part(new THREE.BoxGeometry(0.035, 0.4, 0.4), P.trim, { at: [ex + 0.005, CY + 0.05, ez], rotation: [45, 0, 0] });
  b.part(new THREE.BoxGeometry(0.04, 0.34, 0.06), P.trimDark, { at: [ex + 0.01, CY + 0.08, ez] });
  b.part(new THREE.BoxGeometry(0.04, 0.06, 0.06), P.trimDark, { at: [ex + 0.01, CY - 0.06, ez] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.03, 0.05, 0.3 - i * 0.04), P.neonMagenta, { at: [ex, CY - 0.4 - i * 0.07, ez] });
  // right side warning decal
  b.part(new THREE.BoxGeometry(0.03, 0.4, 0.6), P.trim, { at: [-ex, CY, -1.9] });
  b.part(new THREE.BoxGeometry(0.035, 0.1, 0.4), P.warnRed, { at: [-ex - 0.005, CY + 0.1, -1.9] });
  b.part(new THREE.BoxGeometry(0.035, 0.1, 0.1), P.warnRed, { at: [-ex - 0.005, CY - 0.1, -1.9] });
  // front face cap details
  b.part(new THREE.BoxGeometry(1.2, 0.08, 0.05), P.neonCyan, { at: [0, CY + 0.2, ZF + 0.0] });
  b.part(new THREE.BoxGeometry(0.6, 0.6, 0.06), P.hullDark, { at: [0, CY - 0.2, ZF - 0.01] });
}
```
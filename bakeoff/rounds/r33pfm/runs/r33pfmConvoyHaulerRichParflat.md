<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Nyx-9",
  "description": "A low-poly cyberpunk armoured convoy hauler: a wedge-nosed six-wheel cab guarding a sealed, neon-latched cargo pod on a flatbed.",
  "builderName": "convoyHauler",
  "size": [2.8, 3.0, 8.4],
  "layout": "Long heavy truck facing +Z. Front (z 2.6..4.2): wedge armoured nose with a dozer bumper, cyan headlight bar and a slit visor windshield. Cab (z 0.6..3.2) sits above the front axles with side skirts, mirrors, roof light bar and a small roof turret. Behind the cab (z -4.2..0.4) a flatbed chassis carries the sealed cargo pod: a rounded-box capsule with armour ribs, magenta glowing seams, hazard stripes and a door with a lock. Six chunky octagonal wheels rest on the floor (front axle z=2.7, rear tandem z=-1.8 and -3.4) with dark tyres and yellow hubs. Every part is blocky and faceted with flat colours; neon cyan and magenta accents mark edges, vents and lights; yellow hazard trim on bumpers and skirts.",
  "palette": {
    "hull": "#2f3644",
    "hullLight": "#4a5468",
    "hullDark": "#161a22",
    "trim": "#e7b814",
    "tyre": "#0d0e12",
    "hub": "#8a93a6",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "glass": "#0b2a3a",
    "pod": "#d9dde6",
    "podDark": "#7d8597",
    "warn": "#ff4a2a",
    "metal": "#59606e",
    "lamp": "#fff4c2"
  },
  "mounts": {
    "chassisTop": [0, 1.1, 0],
    "cabFloor": [0, 1.1, 1.9],
    "flatbedTop": [0, 1.25, -1.9],
    "podBase": [0, 1.25, -2.0],
    "turretRing": [0, 3.0, 1.0],
    "axleFront": [0, 0.55, 2.7],
    "axleRear1": [0, 0.55, -1.8],
    "axleRear2": [0, 0.55, -3.4],
    "bumperFront": [0, 0.7, 4.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.1, 1.9], "dir": [0, 0, 1], "role": "hinge" },
    { "name": "turret", "parent": "cab", "at": [0, 3.0, 1.0], "dir": [0, 1, 0], "role": "hinge" },
    { "name": "wheelFL", "parent": "body", "at": [1.2, 0.55, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.2, 0.55, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.2, 0.55, -1.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.2, 0.55, -1.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBL", "parent": "body", "at": [1.2, 0.55, -3.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBR", "parent": "body", "at": [-1.2, 0.55, -3.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Ladder frame and flatbed deck from z -4.2 to 2.6 at y 0.7..1.25: hullDark main rails, metal cross members, fuel tanks and battery boxes slung under the sides, rear bumper with warn tail lights and trim hazard stripes, rear tow hook, mud flaps, side skirts with trim chevrons, underbody neonCyan glow strips, fender arches over each wheel position (hull with hullLight edge).",
      "box": [[-1.4, 0.45, -4.2], [1.4, 1.3, 2.6]],
      "attaches": "Cab sits on cabFloor; pod on podBase/flatbedTop; wheels on the axle mounts; nose bumper meets bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wheels",
      "builds": "Six octagonal-faceted wheels, each: tyre cylinder (tyre) 0.55 radius and 0.5 wide, tread blocks, hub disc (hub) with trim ring, five bolts, a neonCyan hub light ring, brake disc and caliper behind. Axle beams between pairs in metal with a differential housing. Wheels centred on x=±1.2 at axle mounts with their lowest point on y=0, each parented to its wheel joint.",
      "box": [[-1.5, 0, -3.95], [1.5, 1.1, 3.25]],
      "attaches": "Hubs at axleFront, axleRear1, axleRear2 mounts; each wheel on its own wheelXX joint.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelBL", "wheelBR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cab",
      "builds": "Armoured cab z 0.6..3.2, y 1.1..2.8: hull boxy body with sloped wedge hood to the nose, hullLight panel plates, glass slit visor windshield with a neonCyan edge line and side windows with armour bars, door seams, handles and magenta door emblem, hazard-striped bumper plate at bumperFront (z up to 4.2) with dozer blade, cyan headlight bar and lamp lights, grille vents, roof light bar with warn and cyan lights, antenna, side mirrors on arms, exhaust stacks behind the cab in metal with trim rings, a roof turret base ring at turretRing.",
      "box": [[-1.35, 0.55, 0.6], [1.35, 3.0, 4.2]],
      "attaches": "Stands on cabFloor over the chassis; bumper at bumperFront; turret ring at turretRing; exhausts stand against the pod front face at z 0.4.",
      "joints": ["cab", "body"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "turret",
      "builds": "Small remote guard turret on turretRing: rotating drum base (hullDark), faceted armoured housing (hull, hullLight plates), twin barrels with muzzle brakes and trim bands, a sensor eye pod with a glowing neonMagenta lens and cyan scanner slit, ammo box at the side with warn stripe, cable sweeps to the cab roof.",
      "box": [[-0.5, 2.95, 0.4], [0.5, 3.6, 2.0]],
      "attaches": "Base sits at turretRing on the cab roof.",
      "joints": ["turret"],
      "floor": false,
      "budget": 100
    },
    {
      "id": "cargoPod",
      "builds": "Sealed cargo pod on the flatbed from z -4.1 to 0.3, y 1.25..3.0, x ±1.25: pod-coloured rounded-box capsule built from a loft/boxes with chamfered top, podDark armour ribs every 0.8 m, hazard trim stripes along the base, neonMagenta glowing seam lines along the top edges and ribs, rear double door with big lock wheel, hinges and bolts, a ring of cyan status lights, a hazard emblem and serial stencil panel on the sides, roof vents and a small antenna dish, ratchet tie-down straps with buckles bolted to flatbed edges, corner castings in metal.",
      "box": [[-1.3, 1.25, -4.15], [1.3, 3.0, 0.35]],
      "attaches": "Rests on podBase at flatbedTop; front face against the cab rear at z≈0.4.",
      "joints": ["body"],
      "floor": false,
      "budget": 250
    }
  ]
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: Ctx) {
  const bone = J.turret;
  const R = rng(9);
  const base = M.turretRing; // [0,3,1]
  const [bx, by, bz] = base;
  const CABLE = "#1d2230";

  // helper: box part at absolute position
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number, aimDir?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at: [x, y, z], dir: aimDir, flat: true });

  // Drum base
  cyl(0.46, 0.5, 0.1, 10, P.hullDark, bx, by + 0.05, bz);
  cyl(0.4, 0.44, 0.1, 10, P.hull, bx, by + 0.15, bz);
  const ring = cyl(0.48, 0.48, 0.025, 10, P.trim, bx, by + 0.1, bz);
  void ring;
  // neon cyan base ring
  glow(cyl(0.435, 0.435, 0.02, 10, P.neonCyan, bx, by + 0.195, bz), 1.2);
  // bolts around base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    cyl(0.025, 0.025, 0.035, 6, P.metal, bx + Math.cos(a) * 0.47, by + 0.1, bz + Math.sin(a) * 0.47);
  }

  // Housing: main faceted body
  const hy = by + 0.4;
  box(0.74, 0.32, 0.8, P.hull, bx, hy, bz - 0.02);
  // sloped front plate
  box(0.7, 0.3, 0.1, P.hullLight, bx, hy + 0.02, bz + 0.4, [-25, 0, 0]);
  // top chamfer plates
  box(0.62, 0.06, 0.6, P.hullLight, bx, hy + 0.18, bz - 0.05);
  box(0.1, 0.3, 0.7, P.hullLight, bx + 0.34, hy + 0.05, bz - 0.02, [0, 0, -12]);
  box(0.1, 0.3, 0.7, P.hullLight, bx - 0.34, hy + 0.05, bz - 0.02, [0, 0, 12]);
  // side vents (cyan slits)
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++)
      glow(box(0.02, 0.025, 0.2, P.neonCyan, bx + s * 0.4, hy + 0.0 - i * 0.05 + 0.04, bz - 0.2), 1);
  // rear hullDark block
  box(0.5, 0.22, 0.14, P.hullDark, bx, hy, bz - 0.46);
  // rear status lights
  for (const s of [1, -1]) glow(box(0.06, 0.04, 0.02, P.warn, bx + s * 0.15, hy + 0.02, bz - 0.535), 1.2);

  // Twin barrels
  for (const s of [1, -1]) {
    const x = bx + s * 0.2;
    const by2 = hy + 0.0;
    // mount collar
    box(0.16, 0.16, 0.1, P.metal, x, by2, bz + 0.46);
    cyl(0.045, 0.045, 0.9, 8, P.hullDark, x, by2, bz + 0.9, [0, 0, 1]);
    // trim bands
    for (const z of [0.7, 1.0]) cyl(0.055, 0.055, 0.04, 8, P.trim, x, by2, bz + z, [0, 0, 1]);
    // muzzle brake
    cyl(0.07, 0.07, 0.14, 8, P.metal, x, by2, bz + 1.3, [0, 0, 1]);
    cyl(0.072, 0.072, 0.025, 8, P.hullDark, x, by2, bz + 1.27, [0, 0, 1]);
    cyl(0.072, 0.072, 0.025, 8, P.hullDark, x, by2, bz + 1.34, [0, 0, 1]);
    glow(cyl(0.03, 0.03, 0.02, 8, P.neonMagenta, x, by2, bz + 1.375, [0, 0, 1]), 1.3);
  }
  // cooling jacket between barrels
  box(0.18, 0.1, 0.4, P.hullDark, bx, hy - 0.0, bz + 0.62);

  // Sensor eye pod on top (left side)
  const ex = bx - 0.2, ey = hy + 0.3, ez = bz + 0.1;
  cyl(0.12, 0.14, 0.12, 8, P.hullDark, ex, ey - 0.03, ez);
  box(0.26, 0.16, 0.3, P.hull, ex, ey + 0.08, ez + 0.02);
  box(0.22, 0.04, 0.26, P.hullLight, ex, ey + 0.17, ez + 0.02);
  // lens
  glow(cyl(0.065, 0.065, 0.04, 10, P.neonMagenta, ex, ey + 0.08, ez + 0.18, [0, 0, 1]), 1.6);
  cyl(0.085, 0.085, 0.02, 10, P.hullDark, ex, ey + 0.08, ez + 0.165, [0, 0, 1]);
  // cyan scanner slit
  glow(box(0.2, 0.02, 0.02, P.neonCyan, ex, ey + 0.15, ez + 0.175), 1.4);
  // antenna
  cyl(0.008, 0.008, 0.2, 5, P.metal, bx + 0.25, hy + 0.3, bz - 0.3);
  glow(new THREE.Mesh(), 1) && 0;
  b.part(new THREE.SphereGeometry(0.02, 6, 4), P.warn, { bone, at: [bx + 0.25, hy + 0.41, bz - 0.3] });

  // Ammo box at side (right = -x? use +x left)
  const ax = bx + 0.5;
  box(0.2, 0.26, 0.4, P.metal, ax, hy - 0.05, bz - 0.12);
  box(0.21, 0.05, 0.42, P.hullDark, ax, hy + 0.1, bz - 0.12);
  box(0.215, 0.05, 0.08, P.warn, ax, hy - 0.02, bz - 0.12);
  box(0.215, 0.05, 0.08, P.trim, ax, hy - 0.1, bz - 0.12);
  box(0.06, 0.04, 0.1, P.hullDark, ax + 0.1, hy + 0.1, bz - 0.12);
  // feed chute
  box(0.1, 0.04, 0.18, P.metal, bx + 0.42, hy + 0.02, bz + 0.1, [0, 0, 0]);

  // Cables down to cab roof
  const cable = (pts: number[][], r: number) => b.sweep(pts, r, { bone, color: CABLE, sides: 6 } as any);
  cable([[bx - 0.3, by + 0.05, bz - 0.2], [bx - 0.45, by + 0.0, bz - 0.35], [bx - 0.5, by - 0.03, bz - 0.5]], 0.018);
  cable([[bx + 0.3, by + 0.05, bz - 0.25], [bx + 0.4, by + 0.0, bz - 0.4], [bx + 0.36, by - 0.03, bz - 0.55]], 0.015);
  // cable clamps
  for (const s of [-1, 1]) box(0.06, 0.03, 0.06, P.metal, bx + s * 0.4, by - 0.02, bz - 0.4);

  // hazard trim strip on housing front
  for (let i = 0; i < 4; i++)
    box(0.06, 0.03, 0.02, i % 2 ? P.hullDark : P.trim, bx - 0.09 + i * 0.06, hy - 0.12, bz + 0.425, [-25, 0, 0]);
  void R; void frame;
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.5;
  const NEON = P.neonCyan;
  const rand = rng(9);

  // Wheel local axis: cylinder axis = +Y; we aim it along +X (outward) per side.
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);

  const wheelDefs: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleRear1[2]],
    ["wheelMR", -1, M.axleRear1[2]],
    ["wheelBL", 1, M.axleRear2[2]],
    ["wheelBR", -1, M.axleRear2[2]],
  ];

  for (const [name, s, z] of wheelDefs) {
    const bone = J[name];
    const cx = 1.2 * s;
    const cy = R;
    const out: [number, number, number] = [s, 0, 0];
    // helper: place along the axle, d = offset from wheel centre (positive outward)
    const P3 = (d: number, y = 0, zz = 0): [number, number, number] => [cx + s * d, cy + y, z + zz];
    const place = (g: THREE.BufferGeometry, color: string, d: number, extra: any = {}) =>
      b.part(g, color, { bone, at: P3(d), dir: out, flat: true, ...extra });

    // Tyre: octagonal faceted
    place(cyl(R, R, W, 8), P.tyre, 0, { rotation: undefined, dir: out });
    // sidewall shoulders (slightly smaller, lighter) both faces
    for (const k of [1, -1]) place(cyl(R * 0.86, R * 0.95, 0.04, 8), P.hullDark, k * (W / 2 + 0.005));
    // tread blocks around circumference
    const N = 16;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const py = Math.cos(a) * (R + 0.03);
      const pz = Math.sin(a) * (R + 0.03);
      const blk = new THREE.BoxGeometry(W * 0.9, 0.07, 0.17);
      b.part(blk, i % 2 ? P.tyre : P.hullDark, {
        bone,
        at: [cx, cy + py, z + pz],
        rotation: [(-a * 180) / Math.PI, 0, 0],
      });
    }
    // hub disc on the outer face
    const face = W / 2;
    place(cyl(0.34, 0.34, 0.06, 8), P.hub, face + 0.02);
    // trim ring
    place(new THREE.TorusGeometry(0.31, 0.022, 4, 8), P.trim, face + 0.06, { axis: "z" });
    // neon hub ring
    place(new THREE.TorusGeometry(0.2, 0.018, 4, 8), NEON, face + 0.065, { axis: "z" });
    // centre cap
    place(cyl(0.09, 0.11, 0.07, 8), P.metal, face + 0.08);
    place(cyl(0.04, 0.04, 0.08, 6), P.trim, face + 0.1);
    // five bolts
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const bolt = new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6);
      b.part(bolt, P.hullDark, {
        bone,
        at: [cx + s * (face + 0.075), cy + Math.cos(a) * 0.145, z + Math.sin(a) * 0.145],
        dir: out,
        flat: true,
      });
    }
    // inner face hub + brake disc and caliper (behind, towards the chassis)
    place(cyl(0.3, 0.3, 0.05, 8), P.metal, -face - 0.02);
    place(cyl(0.27, 0.27, 0.025, 12), P.hullLight, -face - 0.07);
    place(cyl(0.1, 0.1, 0.05, 8), P.hullDark, -face - 0.1);
    // caliper straddling the brake disc
    const cal = new THREE.BoxGeometry(0.09, 0.14, 0.2);
    b.part(cal, P.warn, { bone, at: [cx - s * (face + 0.07), cy + 0.2, z + 0.1] });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.12), P.hullDark, {
      bone,
      at: [cx - s * (face + 0.07), cy + 0.28, z + 0.1],
    });
    // axle stub from hub inwards
    place(cyl(0.08, 0.08, 0.3, 6), P.metal, -face - 0.2);
  }

  // Axle beams and differentials
  for (const m of [M.axleFront, M.axleRear1, M.axleRear2]) {
    const z = m[2];
    b.part(new THREE.BoxGeometry(2.0, 0.14, 0.14), P.metal, { bone: J.body, at: [0, R, z] });
    // trim bands near ends
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.05, 0.17, 0.17), P.trim, { bone: J.body, at: [s * 0.72, R, z] });
    }
    // differential housing: faceted sphere-ish
    b.part(new THREE.SphereGeometry(0.26, 8, 6), P.hullLight, {
      bone: J.body,
      at: [0, R, z],
      scale: [1, 0.85, 1.1],
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 8), P.hullDark, {
      bone: J.body,
      at: [0, R, z + 0.28],
      dir: [0, 0, 1],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), NEON, { bone: J.body, at: [0, R + 0.04, z + 0.32] });
    // drain bolt
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.trim, {
      bone: J.body,
      at: [0, R - 0.24, z],
    });
  }

  // Drive shaft linking rear axles and middle to front
  b.part(new THREE.CylinderGeometry(0.06, 0.06, M.axleFront[2] - M.axleRear2[2] - 0.6, 6), P.hullDark, {
    bone: J.body,
    at: [0, R + 0.06, (M.axleFront[2] + M.axleRear2[2]) / 2],
    dir: [0, 0, 1],
    flat: true,
  });
  // universal joints
  for (const z of [M.axleRear1[2] + 0.5, M.axleRear2[2] + 0.5, M.axleFront[2] - 0.5]) {
    b.part(new THREE.BoxGeometry(0.14, 0.14, 0.14), P.metal, { bone: J.body, at: [0, R + 0.06, z], rotation: [0, 45, 0] });
  }
  void frame;
  void rand;
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(9);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, len: number, seg: number, color: string, at: [number, number, number], rot: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { bone, at, rotation: rot });

  // Main ladder rails
  for (const s of [1, -1]) {
    box(0.22, 0.3, 6.8, P.hullDark, s * 0.75, 0.85, -0.8);
    box(0.06, 0.06, 6.8, P.neonCyan, s * 0.75, 0.68, -0.8); // underglow edge
    box(0.3, 0.04, 6.8, P.metal, s * 0.75, 1.02, -0.8);
  }
  // Cross members
  for (let i = 0; i < 9; i++) {
    const z = -4 + i * 0.8;
    box(1.7, 0.14, 0.18, P.metal, 0, 0.88, z);
    box(1.3, 0.04, 0.05, P.hullLight, 0, 0.97, z);
  }
  // Flatbed deck
  box(2.7, 0.1, 6.6, P.hull, 0, 1.2, -0.9);
  box(2.7, 0.04, 6.6, P.hullDark, 0, 1.26, -0.9);
  // Deck edge rails with hazard dashes
  for (const s of [1, -1]) {
    box(0.1, 0.12, 6.6, P.hullLight, s * 1.3, 1.22, -0.9);
    for (let i = 0; i < 14; i++) {
      if (i % 2 === 0) box(0.11, 0.06, 0.25, P.trim, s * 1.3, 1.29, -3.9 + i * 0.35 + 0.1);
    }
  }
  // Front cross beam and bumper mount
  box(2.6, 0.35, 0.3, P.hullDark, 0, 0.9, 2.5);
  box(2.2, 0.08, 0.1, P.neonCyan, 0, 0.7, 2.62);

  // Fuel tanks (octagonal) and battery boxes
  for (const s of [1, -1]) {
    cyl(0.3, 0.3, 1.3, 8, P.metal, [s * 1.12, 0.82, -0.2], [90, 0, 0]);
    for (const z of [-0.7, 0.3]) box(0.08, 0.5, 0.12, P.hullDark, s * 1.12, 0.82, z);
    cyl(0.31, 0.31, 0.1, 8, P.trim, [s * 1.12, 0.82, -0.85], [90, 0, 0]);
    cyl(0.1, 0.1, 0.1, 6, P.neonCyan, [s * 1.28, 0.9, -0.2], [0, 0, 90]);
    // Battery boxes
    box(0.55, 0.36, 0.7, P.hullDark, s * 1.12, 0.7, 1.0);
    box(0.57, 0.05, 0.72, P.hullLight, s * 1.12, 0.9, 1.0);
    box(0.06, 0.08, 0.08, P.warn, s * 1.3, 0.78, 1.0);
    box(0.04, 0.04, 0.5, P.neonCyan, s * 1.39, 0.62, 1.0);
  }

  // Side skirts with chevrons
  for (const s of [1, -1]) {
    box(0.1, 0.34, 1.7, P.hull, s * 1.34, 0.8, 1.2 - 0.0);
    box(0.1, 0.34, 0.7, P.hull, s * 1.34, 0.8, -0.65 + 0.0);
    for (let i = 0; i < 4; i++) {
      const z = 0.55 + i * 0.4;
      box(0.04, 0.08, 0.22, P.trim, s * 1.4, 0.8, z, [0, 0, s * 0]);
      b.part(new THREE.BoxGeometry(0.04, 0.08, 0.22), P.trim, { bone, at: [s * 1.4, 0.8, z + 0.0], rotation: [35, 0, 0] });
    }
    box(0.04, 0.05, 1.6, P.hullLight, s * 1.4, 0.95, 1.2);
  }

  // Fender arches over each wheel (blocky arch from three boxes)
  for (const s of [1, -1])
    for (const z of [2.7, -1.8, -3.4]) {
      const x = s * 1.2;
      box(0.62, 0.1, 1.5, P.hull, x, 1.3, z);
      box(0.66, 0.06, 1.54, P.hullLight, x, 1.37, z);
      b.part(new THREE.BoxGeometry(0.62, 0.1, 0.4), P.hull, { bone, at: [x, 1.2, z + 0.82], rotation: [-40, 0, 0] });
      b.part(new THREE.BoxGeometry(0.62, 0.1, 0.4), P.hull, { bone, at: [x, 1.2, z - 0.82], rotation: [40, 0, 0] });
      box(0.5, 0.03, 0.04, P.neonCyan, x + s * 0.02, 1.4, z + 0.76);
    }

  // Mud flaps behind rear wheels
  for (const s of [1, -1]) {
    box(0.55, 0.5, 0.05, P.hullDark, s * 1.2, 0.68, -4.05);
    box(0.4, 0.08, 0.055, P.trim, s * 1.2, 0.8, -4.05);
    box(0.5, 0.4, 0.05, P.hullDark, s * 1.2, 0.75, -2.55);
  }

  // Rear bumper with tail lights and hazard stripes
  box(2.8, 0.34, 0.26, P.hullDark, 0, 0.75, -4.08);
  for (let i = 0; i < 10; i++) {
    b.part(new THREE.BoxGeometry(0.14, 0.26, 0.04), i % 2 ? P.hullDark : P.trim, { bone, at: [-1.0 + i * 0.22 - 0.05, 0.75, -4.22], rotation: [0, 0, 30] });
  }
  for (const s of [1, -1]) {
    box(0.32, 0.18, 0.06, P.warn, s * 1.15, 1.0, -4.12);
    box(0.2, 0.06, 0.07, P.lamp, s * 1.15, 1.0, -4.15);
  }
  box(2.6, 0.04, 0.05, P.neonMagenta, 0, 0.93, -4.2);
  // Tow hook
  box(0.2, 0.2, 0.3, P.metal, 0, 0.7, -4.3);
  b.part(new THREE.TorusGeometry(0.12, 0.04, 5, 8), P.trim, { bone, at: [0, 0.62, -4.5], rotation: [0, 90, 0] });

  // Underbody glow strips
  for (const s of [-0.35, 0.35]) box(0.05, 0.03, 6, P.neonCyan, s, 0.62, -0.9);
  box(1.5, 0.03, 0.05, P.neonMagenta, 0, 0.62, -0.9);

  // Bolts on deck edges
  for (let i = 0; i < 12; i++) {
    const z = -3.9 + i * 0.6 + R() * 0.02;
    for (const s of [1, -1]) cyl(0.03, 0.03, 0.04, 6, P.hub, [s * 0.5, 1.3, z], [0, 0, 0]);
  }
  // Air tank / line between rails
  cyl(0.1, 0.1, 1.6, 6, P.hullLight, [0, 0.75, 0.6], [0, 0, 90]);
  cyl(0.08, 0.08, 0.5, 6, P.metal, [0, 0.8, -1.2], [90, 0, 0]);
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCargoPod({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(9);
  const X0 = 1.25, Z0 = -4.1, Z1 = 0.3, Y0 = 1.25, Y1 = 3.0;
  const L = Z1 - Z0, CZ = (Z0 + Z1) / 2;
  const MAG = P.neonMagenta, CY = P.neonCyan;

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, at: [number, number, number], color: string, dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir });
  const glowMat = (m: any) => {
    m.mesh.material = m.mesh.material.clone();
    m.mesh.material.emissive = m.mesh.material.color.clone();
    m.mesh.material.emissiveIntensity = 1;
    return m;
  };
  const neon = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, rot?: [number, number, number]) =>
    glowMat(box(w, h, d, x, y, z, c, rot));

  // Main body: lower block, upper block, chamfered top
  box(2.5, 1.0, L, 0, Y0 + 0.5, CZ, P.pod);
  box(2.3, 0.45, L - 0.1, 0, Y0 + 1.22, CZ, P.pod);
  for (const s of [1, -1]) {
    box(0.5, 0.4, L - 0.1, s * 0.98, Y1 - 0.22, CZ, P.pod, [0, 0, s * 45]);
  }
  box(1.5, 0.12, L - 0.1, 0, Y1 - 0.06, CZ, P.pod);
  // lower dark skirt line
  box(2.56, 0.12, L + 0.02, 0, Y0 + 0.08, CZ, P.podDark);
  // hazard stripes along base
  for (const s of [1, -1]) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const z = Z0 + 0.2 + i * ((L - 0.4) / (n - 1));
      box(0.03, 0.14, 0.17, s * 1.266, Y0 + 0.24, z, i % 2 ? P.hullDark : P.trim, [s * 0, 0, 0]);
    }
  }

  // armour ribs every 0.8 m with magenta seams
  const ribZ: number[] = [];
  for (let z = Z0 + 0.45; z < Z1 - 0.2; z += 0.8) ribZ.push(z);
  for (const z of ribZ) {
    box(2.62, 1.45, 0.16, 0, Y0 + 0.78, z, P.podDark);
    box(2.42, 0.2, 0.16, 0, Y1 - 0.38, z, P.podDark);
    for (const s of [1, -1]) {
      box(0.5, 0.18, 0.16, s * 1.0, Y1 - 0.28, z, P.podDark, [0, 0, s * 45]);
      neon(0.03, 1.0, 0.04, s * 1.325, Y0 + 0.8, z + 0.06, MAG);
    }
    neon(1.5, 0.03, 0.04, 0, Y1 + 0.005, z + 0.06, MAG);
  }
  // top edge seams
  for (const s of [1, -1]) {
    neon(0.05, 0.05, L - 0.2, s * 1.2, Y1 - 0.4 + 0.02, CZ, MAG, [0, 0, 0]);
    neon(0.05, 0.05, L - 0.2, s * 0.76, Y1 + 0.005, CZ, MAG);
  }

  // corner castings
  for (const sx of [1, -1]) for (const sz of [Z0 + 0.05, Z1 - 0.05]) {
    box(0.22, 0.22, 0.22, sx * 1.27, Y0 + 0.11, sz, P.metal);
    box(0.2, 0.2, 0.2, sx * 1.12, Y1 - 0.12, sz, P.metal);
  }

  // rear double door
  const zr = Z0 - 0.01;
  box(2.3, 1.45, 0.06, 0, Y0 + 0.82, zr, P.podDark);
  for (const s of [1, -1]) {
    box(1.08, 1.33, 0.05, s * 0.57, Y0 + 0.82, zr - 0.04, P.pod);
    box(0.95, 1.2, 0.03, s * 0.57, Y0 + 0.82, zr - 0.07, P.hullLight);
    // hinges
    for (const y of [0.35, 0.82, 1.3]) {
      cyl(0.05, 0.05, 0.14, 6, [s * 1.17, Y0 + y, zr - 0.08], P.metal, [0, 1, 0]);
    }
    // bolts
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++)
      cyl(0.025, 0.025, 0.03, 6, [s * (0.15 + i * 0.4) + s * 0.1, Y0 + 0.35 + j * 0.95, zr - 0.1], P.metal, [0, 0, -1]);
  }
  neon(0.03, 1.3, 0.03, 0, Y0 + 0.82, zr - 0.1, MAG);
  // lock wheel
  const lw: [number, number, number] = [0, Y0 + 0.82, zr - 0.12];
  cyl(0.26, 0.26, 0.06, 8, lw, P.hullDark, [0, 0, -1]);
  cyl(0.2, 0.2, 0.08, 8, [0, lw[1], lw[2] - 0.02], P.trim, [0, 0, -1]);
  cyl(0.06, 0.06, 0.12, 6, [0, lw[1], lw[2] - 0.06], P.metal, [0, 0, -1]);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    box(0.4, 0.045, 0.05, 0, 0, 0, P.metal).mesh.removeFromParent();
    b.part(new THREE.BoxGeometry(0.42, 0.05, 0.05), P.metal, { bone, at: [0, lw[1], lw[2] - 0.08], rotation: [0, 0, (a * 180) / Math.PI] });
    cyl(0.04, 0.04, 0.06, 6, [Math.cos(a) * 0.21, lw[1] + Math.sin(a) * 0.21, lw[2] - 0.1], P.warn, [0, 0, -1]);
  }
  // status lights ring above door
  for (let i = 0; i < 7; i++) {
    const x = -0.9 + i * 0.3;
    glowMat(b.part(new THREE.SphereGeometry(0.05, 6, 4), i % 3 === 2 ? MAG : CY, { bone, at: [x, Y1 - 0.38, zr - 0.07] }));
  }

  // side details
  for (const s of [1, -1]) {
    const x = s * 1.268;
    // stencil panel
    box(0.03, 0.4, 1.0, x, Y0 + 1.0, Z0 + 1.0, P.hullDark);
    for (let i = 0; i < 5; i++) box(0.035, 0.05, 0.1 + (i % 3) * 0.08, x + s * 0.003, Y0 + 1.12 - (i % 2) * 0.12, Z0 + 0.7 + i * 0.15, P.lamp);
    // hazard emblem: warn disc with triangle bars
    const ez = CZ + 0.5;
    cyl(0.34, 0.34, 0.03, 8, [x, Y0 + 0.95, ez], P.trim, [s, 0, 0]);
    cyl(0.26, 0.26, 0.04, 8, [x, Y0 + 0.95, ez], P.hullDark, [s, 0, 0]);
    for (let k = 0; k < 3; k++) {
      const a = (k * 120 + 90) * Math.PI / 180;
      b.part(new THREE.BoxGeometry(0.045, 0.2, 0.07), P.trim, {
        bone, at: [x + s * 0.01, Y0 + 0.95 + Math.sin(a) * 0.1, ez + Math.cos(a) * 0.1], rotation: [(k * 120 + 90 - 90), 0, 0],
      });
    }
    cyl(0.07, 0.07, 0.05, 6, [x + s * 0.01, Y0 + 0.95, ez], P.warn, [s, 0, 0]);
    // status light strip
    for (let i = 0; i < 6; i++)
      glowMat(b.part(new THREE.SphereGeometry(0.045, 6, 4), CY, { bone, at: [s * 1.2 + s * 0.06, Y1 - 0.5, CZ - 1.4 + i * 0.3 + 0.2] }));
  }

  // roof vents
  for (let i = 0; i < 2; i++) {
    const z = Z0 + 1.1 + i * 1.0;
    box(0.7, 0.1, 0.5, 0.35, Y1 + 0.1, z, P.hullDark);
    for (let k = 0; k < 4; k++) box(0.62, 0.025, 0.04, 0.35, Y1 + 0.17, z - 0.17 + k * 0.11, P.metal);
  }
  // antenna dish
  const da: [number, number, number] = [-0.45, Y1, CZ + 0.9];
  cyl(0.05, 0.08, 0.3, 6, [da[0], da[1] + 0.15, da[2]], P.metal, [0, 1, 0]);
  b.part(new THREE.ConeGeometry(0.28, 0.14, 8, 1, true), P.hub, { bone, at: [da[0], da[1] + 0.38, da[2] + 0.06], rotation: [-60, 0, 0] });
  b.part(new THREE.SphereGeometry(0.045, 6, 4), P.warn, { bone, at: [da[0], da[1] + 0.42, da[2] + 0.2] });
  glowMat(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warn, { bone, at: [da[0] + 0.25, da[1] + 0.12, da[2] - 0.3] }));

  // ratchet tie-down straps over flatbed edges
  for (const z of [Z0 + 1.4, CZ + 0.3]) {
    for (const s of [1, -1]) {
      box(0.06, 0.04, 0.0 + 0.2, 0, 0, 0, P.hullDark).mesh.removeFromParent();
      box(0.04, 0.5, 0.2, s * 1.31, Y0 + 0.1, z, P.hullDark);
      box(0.08, 0.14, 0.12, s * 1.34, Y0 + 0.25, z, P.metal);
      box(0.1, 0.04, 0.1, s * 1.36, Y0 + 0.33, z, P.trim);
      cyl(0.04, 0.04, 0.2, 6, [s * 1.36, Y0 + 0.16, z], P.metal, [0, 0, 1]);
    }
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildCab({ b, J, P, M }: Ctx) {
  const cab = J.cab;
  const R = rng(9);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, bone: any = cab, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8, bone: any = cab, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z], rotation: rot });

  // main body (rear cab block)
  box(2.5, 1.2, 1.7, P.hull, 0, 2.0, 1.45);
  // lower body / hood block
  box(2.6, 0.7, 3.0, P.hull, 0, 1.45, 2.4);
  // sloped wedge hood
  const hood = b.extrude(
    [[0, 0], [1.4, 0], [1.4, 0.35], [0.0, 0.85, "sharp"]].map(p => p as any),
    { at: [0, 1.8, 2.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: P.hullLight, bone: cab },
  );
  // hood slope: nose wedge in front
  const nose = b.extrude(
    [[0, 0], [0.9, 0], [0.9, 0.25], [0, 0.55]] as any,
    { at: [0, 1.15, 3.3], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, color: P.hull, bone: cab },
  );
  // hood centre plates
  box(1.2, 0.05, 0.8, P.hullLight, 0, 2.27, 2.0, cab, [-20, 0, 0]);
  box(0.8, 0.04, 0.5, P.hullDark, 0, 2.2, 2.7, cab, [-22, 0, 0]);

  // cabin roof & pillars
  box(2.4, 0.12, 1.6, P.hullLight, 0, 2.66, 1.45);
  box(2.2, 0.06, 1.4, P.hull, 0, 2.74, 1.45);
  for (const s of [1, -1]) {
    box(0.12, 1.0, 0.14, P.hullDark, s * 1.2, 2.1, 2.22);
    box(0.12, 1.0, 0.14, P.hullDark, s * 1.2, 2.1, 0.72);
  }

  // slit visor windshield
  box(2.0, 0.34, 0.06, P.glass, 0, 2.3, 2.3, cab, [-18, 0, 0]);
  box(2.1, 0.04, 0.08, P.neonCyan, 0, 2.5, 2.27, cab, [-18, 0, 0]);
  box(2.1, 0.04, 0.08, P.neonCyan, 0, 2.11, 2.34, cab, [-18, 0, 0]);
  box(0.06, 0.4, 0.09, P.hullDark, 0, 2.3, 2.31, cab, [-18, 0, 0]);

  for (const s of [1, -1]) {
    // side windows with bars
    box(0.05, 0.5, 1.2, P.glass, s * 1.255, 2.2, 1.5);
    for (let i = 0; i < 4; i++) box(0.07, 0.52, 0.05, P.hullDark, s * 1.27, 2.2, 1.0 + i * 0.33);
    box(0.07, 0.04, 1.25, P.neonCyan, s * 1.27, 2.47, 1.5);
    // door seams
    box(0.04, 1.05, 0.04, P.hullDark, s * 1.27, 1.85, 0.95);
    box(0.04, 1.05, 0.04, P.hullDark, s * 1.27, 1.85, 2.1);
    box(0.04, 0.04, 1.2, P.hullDark, s * 1.27, 1.32, 1.5);
    // handle
    box(0.07, 0.06, 0.3, P.metal, s * 1.29, 1.95, 1.9);
    // magenta emblem: chevron
    box(0.04, 0.3, 0.07, P.neonMagenta, s * 1.28, 1.6, 1.4, cab, [35, 0, 0]);
    box(0.04, 0.3, 0.07, P.neonMagenta, s * 1.28, 1.6, 1.5, cab, [-35, 0, 0]);
    // lower panel plates
    box(0.06, 0.4, 1.0, P.hullLight, s * 1.3, 1.6, 1.5);
    // hood side plates and vents
    box(0.06, 0.4, 1.4, P.hullLight, s * 1.32, 1.5, 2.8);
    for (let i = 0; i < 4; i++) box(0.07, 0.04, 0.4, P.hullDark, s * 1.33, 1.38 + i * 0.1, 2.8);
    // mirrors
    box(0.5, 0.04, 0.04, P.metal, s * 1.5, 2.2, 2.1);
    box(0.06, 0.34, 0.2, P.hullDark, s * 1.78, 2.2, 2.1);
    box(0.02, 0.28, 0.14, P.glass, s * 1.81, 2.2, 2.1);
    // headlamps
    box(0.34, 0.2, 0.08, P.lamp, s * 0.85, 1.65, 3.78);
    box(0.4, 0.26, 0.05, P.hullDark, s * 0.85, 1.65, 3.74);
    // dozer blade teeth
    for (let i = 0; i < 3; i++) box(0.3, 0.2, 0.2, P.metal, s * (0.3 + i * 0.4), 0.7, 4.15);
    // exhaust stacks
    const ex = cyl(0.11, 0.11, 1.7, P.metal, s * 1.0, 2.0, 0.5, 8);
    for (const y of [1.3, 2.7]) cyl(0.14, 0.14, 0.06, P.trim, s * 1.0, y, 0.5, 8);
    cyl(0.14, 0.11, 0.12, P.hullDark, s * 1.0, 2.9, 0.5, 8);
    box(0.1, 0.5, 0.1, P.metal, s * 1.0, 1.4, 0.65);
    // roof light bar ends
    box(0.2, 0.12, 0.2, P.neonCyan, s * 0.8, 2.92, 1.9);
    box(0.2, 0.12, 0.2, P.warn, s * 0.45, 2.92, 1.9);
    // bumper hazard stripes
    for (let i = 0; i < 3; i++) box(0.18, 0.4, 0.04, P.hullDark, s * (0.2 + i * 0.4) + 0, 0.95, 4.02, cab, [0, 0, s * 25]);
  }

  // roof light bar body
  box(1.9, 0.12, 0.22, P.hullDark, 0, 2.82, 1.9);
  box(0.3, 0.12, 0.2, P.warn, 0, 2.92, 1.9);

  // grille
  box(1.3, 0.55, 0.06, P.hullDark, 0, 1.4, 3.82);
  for (let i = 0; i < 5; i++) box(1.2, 0.04, 0.08, P.hullLight, 0, 1.2 + i * 0.1, 3.85);
  // headlight bar
  box(1.9, 0.07, 0.07, P.neonCyan, 0, 1.9, 3.78, cab, [-10, 0, 0]);

  // bumper plate with hazard stripes
  box(2.7, 0.5, 0.3, P.hullDark, 0, 0.9, 4.0);
  for (let i = 0; i < 9; i++) {
    const x = -1.2 + i * 0.3;
    box(0.14, 0.45, 0.04, P.trim, x, 0.9, 4.17, cab, [0, 0, 30]);
  }
  // dozer blade
  box(2.8, 0.22, 0.12, P.metal, 0, 0.7, 4.17, cab, [-12, 0, 0]);
  box(2.8, 0.05, 0.1, P.trim, 0, 0.82, 4.2);

  // antenna
  cyl(0.015, 0.025, 1.0, P.metal, -1.0, 3.3, 0.9, 6);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warn, { bone: cab, at: [-1.0, 3.82, 0.9] });

  // turret base ring
  cyl(0.5, 0.55, 0.1, P.hullDark, M.turretRing[0], 2.98, 1.0, 12);
  cyl(0.52, 0.52, 0.04, P.trim, M.turretRing[0], 3.05, 1.0, 12);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.03, 0.03, 0.05, P.metal, Math.sin(a) * 0.44, 3.08, 1.0 + Math.cos(a) * 0.44, 6);
  }
  // cables / conduits
  for (const s of [1, -1]) cyl(0.025, 0.025, 0.9, P.neonMagenta, s * 0.15, 2.9, 1.5, 6, cab, [90, 0, 0]);
  // underside cyan strip
  box(2.2, 0.04, 2.8, P.neonCyan, 0, 1.12, 2.3);
  // rear panel
  box(2.3, 0.9, 0.06, P.hullDark, 0, 2.0, 0.62);
  box(0.9, 0.06, 0.07, P.neonMagenta, 0, 2.5, 0.6);
  void R; void frame; void hood; void nose; void J.body;
}
```
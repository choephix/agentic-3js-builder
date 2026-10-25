<!-- call: plan -->

```json
{
  "name": "Hoverjack Pickup",
  "description": "A militarized pickup truck converted to ride on four vectored hover thrusters, in low-poly cyberpunk style with neon underglow, armor plates and a roof-mounted gun.",
  "builderName": "hoverPickup",
  "size": [2.5, 2.3, 5.6],
  "layout": "A chunky boxy pickup facing +Z. Hood and cab at the front (z 0.4 to 2.6), open cargo bed behind (z -2.6 to 0.4). The body floats about 0.35 m above the floor on four large ducted hover thrusters, one at each wheel position, replacing wheels, with cyan glow rings underneath. The lowest points (thruster nozzles) sit on y=0 to 0.05, while the hull belly is at y=0.45. Angular armor plates, a bull bar at the front, slanted windshield with cyan tint, roof light bar, and a pintle-mounted gun on the bed. Style: faceted low-poly shapes, dark gunmetal hull with olive-drab and matte black armor, hazard-yellow trim stripes, neon cyan and magenta glow accents, painted decals, worn panel paints and glowing screens.",
  "palette": {
    "hull": "#3b4250",
    "armor": "#2a2f2b",
    "olive": "#4f5a3a",
    "trim": "#e7b814",
    "dark": "#14161c",
    "metal": "#7a8290",
    "glass": "#1b6f86",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb0",
    "lamp": "#fff2b0",
    "tail": "#ff3030",
    "rubber": "#1d1d22"
  },
  "mounts": {
    "chassisTop": [0, 1.1, 0],
    "cabFloor": [0, 1.1, 1.5],
    "bedFloor": [0, 1.15, -1.6],
    "turretMount": [0, 1.15, -1.4],
    "thrusterFL": [1.05, 0.45, 1.85],
    "thrusterFR": [-1.05, 0.45, 1.85],
    "thrusterRL": [1.05, 0.45, -1.85],
    "thrusterRR": [-1.05, 0.45, -1.85],
    "frontBumper": [0, 0.75, 2.8]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "thrusterFL", "parent": "body", "at": [1.05, 0.45, 1.85], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterFR", "parent": "body", "at": [-1.05, 0.45, 1.85], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRL", "parent": "body", "at": [1.05, 0.45, -1.85], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRR", "parent": "body", "at": [-1.05, 0.45, -1.85], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "gunYaw", "parent": "body", "at": [0, 1.15, -1.4], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "gunYaw", "at": [0, 1.75, -1.4], "dir": [0, 0, 1], "role": "hinge", "group": "turret" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull: belly pan, side skirts, frame rails, wheel-arch-style cutouts around the thrusters, front bumper with bull bar and tow hooks, rear bumper, hazard-yellow trim stripes, underglow neon strips (glow) along the belly, panelled and scuffed paints, vents and rivet details, headlamp glow units in the bumper.",
      "box": [[-1.25, 0.4, -2.8], [1.25, 1.15, 2.9]],
      "attaches": "Cab and hood sit on chassisTop; thrusters hang from the four thruster mounts; bed floor starts at bedFloor.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Hood with vents and armor plates, fenders, cab box with slanted windshield and side windows (tinted glass colour with glow-screen reflections via SVG), doors with handles and painted decals/emblems, mirrors, roof armor plates, roof light bar with cyan and magenta glow lamps, antenna, grille with glowing slits, hazard stripes and unit-number stencils.",
      "box": [[-1.2, 1.1, 0.3], [1.2, 2.3, 2.7]],
      "attaches": "Sits on chassisTop and cabFloor; the rear cab wall meets the bed front at z=0.3.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "bed",
      "builds": "Open cargo bed: floor, side walls with armor panelling and ribs, tailgate, roll hoop behind the cab, tie-down rings, tail lights (glow red), ammo crates and a fuel drum in the bed, stencil markings, cyberpunk neon sign strip on the tailgate.",
      "box": [[-1.22, 1.1, -2.8], [1.22, 1.9, 0.3]],
      "attaches": "Floor at bedFloor, starts where the cab ends at z=0.3; the turret mounts at turretMount.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "thrusters",
      "builds": "Four identical hover thruster pods, one at each thruster mount: a lathe-turned ducted housing with mounting pylon strut up into the chassis, internal fan blades, glowing cyan inner ring and downward cone glow, magenta accent band, hazard marks, vents and bolts. Nozzle bottoms touch the floor at y 0 to 0.05. Each pod parented to its own thruster joint.",
      "box": [[-1.25, 0, -2.3], [1.25, 0.75, 2.3]],
      "attaches": "Each pod is centred on its thruster mount and its pylon reaches the chassis underside at y=0.45 to 0.75.",
      "joints": ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"],
      "floor": true,
      "budget": 180
    },
    {
      "id": "gun",
      "builds": "Pintle-mounted heavy gun on the bed: swivel base ring, post, yaw cradle, twin barrels with muzzle brakes, ammo box with belt, shield plate with painted hazard stripes, glowing targeting sight screen, magenta and cyan accent lights.",
      "box": [[-0.45, 1.15, -2.2], [0.45, 2.1, -0.5]],
      "attaches": "Base at turretMount on the bed floor; yaw on gunYaw, barrel assembly on gunPitch.",
      "joints": ["gunYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: thrusters -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildThrusters({ b, J, P, M }: Ctx) {
  const HOUSING = paint((p, n) => {
    const base = mix("#2a2f2b", "#3b4250", noise(p, 0.12, 4));
    const wear = smoothstep(0.6, 0.8, noise(p, 0.05, 9));
    return mix(base, "#14161c", wear * 0.5 * (n.y > 0 ? 1 : 0.4));
  });
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#14161c"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const FAN = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#14161c"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<path d="M32 32 L${32 + 28 * Math.cos(i * 1.047)} ${32 + 28 * Math.sin(i * 1.047)} L${32 + 28 * Math.cos(i * 1.047 + 0.5)} ${32 + 28 * Math.sin(i * 1.047 + 0.5)}Z" fill="#7a8290"/>`)
      .join("")}<circle cx="32" cy="32" r="5" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const names = ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"] as const;
  for (const nm of names) {
    const bone = J[nm];
    const [mx, , mz] = M[nm];
    const sx = mx > 0 ? 1 : -1;
    const at = (x: number, y: number, z: number): [number, number, number] => [mx + x, y, mz + z];
    // ducted housing (shell with open bore)
    b.lathe(
      [
        [0.3, 0.02],
        [0.5, 0.02],
        [0.6, 0.15],
        [0.6, 0.5],
        [0.52, 0.62],
        [0.4, 0.62],
        [0.4, 0.3],
        [0.3, 0.1],
      ],
      { at: at(0, 0, 0), segments: 10, bone, color: HOUSING },
    );
    // nozzle lip
    b.lathe(
      [
        [0.28, 0],
        [0.34, 0],
        [0.34, 0.06],
        [0.28, 0.06],
      ],
      { at: at(0, 0, 0), segments: 10, bone, color: P.dark },
    );
    // inner cyan ring
    glow(
      b.lathe(
        [
          [0.36, 0.2],
          [0.4, 0.2],
          [0.4, 0.26],
          [0.36, 0.26],
        ],
        { at: at(0, 0, 0), segments: 10, bone, color: P.neonCyan },
      ),
      1.6,
    );
    // magenta band
    glow(
      b.lathe(
        [
          [0.6, 0.38],
          [0.625, 0.38],
          [0.625, 0.44],
          [0.6, 0.44],
        ],
        { at: at(0, 0, 0), segments: 10, bone, color: P.neonMagenta },
      ),
      1.4,
    );
    // hazard band
    b.lathe(
      [
          [0.6, 0.5],
          [0.62, 0.5],
          [0.62, 0.58],
          [0.58, 0.6],
      ],
      { at: at(0, 0, 0), segments: 10, bone, color: "#e7b814" },
    );
    // fan
    b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", {
      bone,
      at: at(0, 0.34, 0),
      dir: [0, 1, 0],
      axis: "z",
      texture: FAN,
    });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 6), P.metal, { bone, at: at(0, 0.34, 0) });
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.34, 0.015, 0.07), P.metal, {
        bone,
        at: at(0, 0.36, 0),
        rotation: [0, i * 45, 8],
      });
    }
    // downward glow cone
    glow(
      b.part(new THREE.ConeGeometry(0.3, 0.08, 10, 1, true), P.neonCyan, {
        bone,
        at: at(0, 0.04, 0),
        rotation: [180, 0, 0],
      }),
      1.2,
    );
    // pylon strut up to chassis
    b.frustumBox(at(-sx * 0.1, 0.55, 0), at(-sx * 0.2, 0.78, 0), [0.3, 0.3], [0.4, 0.3], {
      bone,
      color: P.armor,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.3, 0.5), P.metal, { bone, at: at(-sx * 0.52, 0.6, 0) });
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), P.dark, { bone, at: at(-sx * 0.3, 0.72, 0) });
    // hazard plates and vents
    for (const z of [1, -1]) {
      b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", {
        bone,
        at: at(0, 0.54, z * 0.615),
        dir: [0, 0, z],
        axis: "z",
        texture: HAZ,
      });
      for (let k = -1; k <= 1; k++)
        b.part(new THREE.BoxGeometry(0.2, 0.025, 0.02), P.dark, { bone, at: at(k * 0.12 + 0.0, 0.25, z * 0.6) });
    }
    // bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), P.metal, {
        bone,
        at: at(Math.cos(a) * 0.5, 0.63, Math.sin(a) * 0.5),
      });
    }
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...opts });

  const HULL = paint((p, n) => {
    const base = mix(P.hull, "#566074", smoothstep(0.4, 0.9, noise(p, 0.3, 3)) * 0.5);
    const wear = smoothstep(0.62, 0.8, noise(p, 0.08, 7));
    const c = mix(base, "#8a8f98", wear * 0.35);
    return mix(c, "#1c1f26", smoothstep(0.2, -0.8, n.y) * 0.4);
  });
  const ARM = paint((p) => mix(P.armor, P.olive, smoothstep(0.4, 0.7, noise(p, 0.25, 5)) * 0.6));

  // Cab box
  box(2.3, 0.75, 1.5, HULL, [0, 1.5, 1.0]);
  // Roof
  box(2.2, 0.08, 1.3, ARM, [0, 2.12, 0.95]);
  box(1.8, 0.05, 0.9, P.olive, [0, 2.18, 0.95]);
  // Pillars
  for (const s of [1, -1]) {
    box(0.08, 0.5, 0.08, P.dark, [s * 1.1, 1.95, 0.3]);
    box(0.08, 0.5, 0.08, P.dark, [s * 1.1, 1.95, 1.72]);
  }
  // Lower body in front (hood)
  box(2.4, 0.45, 1.1, HULL, [0, 1.35, 2.1]);
  box(2.0, 0.08, 1.0, ARM, [0, 1.62, 2.1]);
  // Slanted windshield
  const glass = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#1b6f86"/><path d="M0 32L20 0h10L10 32z" fill="#2ff3ff" opacity=".35"/><path d="M34 32L50 0h6L40 32z" fill="#ff2fb0" opacity=".25"/><rect y="26" width="64" height="6" fill="#0c3a48"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 0.66), "#ffffff", {
    bone, at: [0, 1.95, 1.77], dir: [0, 0.65, 0.76], axis: "z", texture: glass,
  });
  // Rear window
  b.part(new THREE.PlaneGeometry(1.6, 0.4), "#ffffff", {
    bone, at: [0, 1.95, 0.24], dir: [0, 0, -1], axis: "z", texture: glass,
  });

  const DECAL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e7b814" stroke-width="5"/><path d="M32 12l14 36H18z" fill="#ff2fb0"/><text x="32" y="46" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#14161c">07</text></svg>`,
    { size: 128 },
  );
  const WIN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#1b6f86"/><path d="M0 32L24 0h10L10 32z" fill="#2ff3ff" opacity=".4"/></svg>`,
    { size: 96 },
  );

  for (const s of [1, -1]) {
    const x = s * 1.16;
    // Side windows
    b.part(new THREE.PlaneGeometry(1.2, 0.4), "#ffffff", {
      bone, at: [x + s * 0.005, 1.95, 1.0], dir: [s, 0, 0], axis: "z", texture: WIN,
    });
    // Door panel
    box(0.06, 0.45, 1.2, ARM, [x + s * 0.02, 1.4, 1.0]);
    box(0.04, 0.05, 1.2, P.trim, [x + s * 0.06, 1.18, 1.0]);
    // Handle
    box(0.06, 0.05, 0.22, P.metal, [x + s * 0.08, 1.58, 0.65]);
    // Decal
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone, at: [x + s * 0.07, 1.4, 1.2], dir: [s, 0, 0], axis: "z", texture: DECAL,
    });
    // Mirror
    box(0.06, 0.2, 0.14, P.dark, [s * 1.3, 1.75, 1.7]);
    box(0.03, 0.03, 0.2, P.metal, [s * 1.22, 1.72, 1.7]);
    // Fender
    box(0.3, 0.3, 1.0, ARM, [s * 1.2, 1.3, 2.1]);
    // Headlamps
    glow(box(0.3, 0.14, 0.05, P.lamp, [s * 0.8, 1.4, 2.66]), 1.5);
    // Hood vents
    for (let i = 0; i < 4; i++) box(0.3, 0.02, 0.04, P.dark, [s * 0.55, 1.67, 1.8 + i * 0.1]);
    // Armor plate on hood
    box(0.5, 0.05, 0.6, ARM, [s * 0.65, 1.66, 2.3], { rotation: [0, s * 8, 0] });
    // Roof pillar armor
    box(0.12, 0.1, 1.2, ARM, [s * 1.0, 2.18, 0.95]);
  }

  // Hood hazard stripes
  for (let i = 0; i < 6; i++)
    box(0.12, 0.012, 0.12, i % 2 ? P.dark : P.trim, [-0.1 + 0.0, 1.67, 1.6 + 0.0], { scale: [1, 1, 1] }).mesh.position.x += (i - 2.5) * 0.12;

  // Grille
  box(1.8, 0.4, 0.1, P.dark, [0, 1.35, 2.68]);
  for (let i = 0; i < 6; i++) glow(box(1.5, 0.025, 0.04, P.neonCyan, [0, 1.2 + i * 0.065, 2.74]), 1.2);
  box(1.9, 0.06, 0.12, P.trim, [0, 1.58, 2.7]);

  // Light bar
  box(1.5, 0.1, 0.18, P.dark, [0, 2.28, 1.35]);
  for (let i = 0; i < 8; i++)
    glow(box(0.16, 0.08, 0.2, i % 2 ? P.neonMagenta : P.neonCyan, [-0.63 + i * 0.18, 2.29, 1.35]), 1.6);

  // Antenna
  b.rod([-1.0, 2.2, 0.5], [-1.05, 2.3, 0.4], 0.012, P.dark, { bone });
  b.rod([-1.05, 2.18, 0.45], [-1.1, 2.3, 0.42], 0.01, P.metal, { bone });
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonMagenta, { bone, at: [-1.1, 2.3, 0.42] }), 2);

  // Unit-number stencil on roof
  const ST = svg(`<svg viewBox="0 0 64 32"><text x="32" y="26" font-size="26" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#e7b814">HJ-07</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.8, 0.4), "#ffffff", { bone, at: [0, 2.222, 0.75], dir: [0, 1, 0], axis: "z", texture: ST, up: [0, 0, -1] });
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);

  const hullPaint = paint((p, n) => {
    const base: [number, number, number] = [0.23, 0.26, 0.31];
    const wear = smoothstep(0.55, 0.8, noise(p, 0.18, 3));
    const dirt = smoothstep(0.5, -0.8, p.y - 0.4) * 0.5;
    const c = mix(mix(base, [0.1, 0.1, 0.12], dirt), [0.45, 0.47, 0.5], wear * 0.35);
    return c;
  });
  const plated = panelled(hullPaint, { size: 0.35, rivets: 0.07 });
  const armorPaint = panelled(P.armor, { size: 0.3, rivets: 0.06 });

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...extra });

  // belly pan
  box(2.3, 0.1, 5.5, P.dark, [0, 0.45, 0]);
  // main hull slab
  box(2.5, 0.35, 5.6, plated, [0, 0.8, 0]);
  // frame rails
  for (const s of [1, -1]) {
    box(0.12, 0.14, 5.3, P.metal, [s * 0.7, 0.55, 0]);
    // side skirts
    box(0.1, 0.3, 4.6, armorPaint, [s * 1.27, 0.7, 0], {});
    // skirt trim stripe
    box(0.02, 0.07, 4.4, P.trim, [s * 1.33, 0.78, 0]);
    // underglow strips
    glow(box(0.06, 0.04, 4.0, P.neonCyan, [s * 1.0, 0.42, 0]), 1.6);
    glow(box(0.05, 0.03, 1.2, P.neonMagenta, [s * 0.5, 0.42, 0]), 1.4);
  }
  glow(box(1.0, 0.04, 0.06, P.neonCyan, [0, 0.42, 0.9]), 1.6);
  glow(box(1.0, 0.04, 0.06, P.neonCyan, [0, 0.42, -0.9]), 1.6);

  // wheel-arch style cutouts: dark recesses with armor lips around thruster mounts
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const x = sx * 1.05, z = sz * 1.85;
    b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 10), P.dark, { bone: body, at: [x, 0.97, z] });
    b.part(new THREE.TorusGeometry(0.62, 0.05, 5, 10), P.armor, {
      bone: body, at: [x, 0.99, z], rotation: [90, 0, 0], flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, {
        bone: body, at: [x + Math.cos(a) * 0.62, 1.04, z + Math.sin(a) * 0.62] });
    }
  }

  // front bumper
  box(2.5, 0.35, 0.3, armorPaint, [0, 0.78, 2.75]);
  box(2.52, 0.06, 0.32, P.trim, [0, 0.95, 2.76]);
  // hazard stripes on bumper face
  const haz = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${
    Array.from({ length: 8 }, (_, i) => `<path d="M${i * 8} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 16Z" fill="#14161c"/>`).join("")
  }</svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(1.6, 0.14), "#ffffff", {
    bone: body, at: [0, 0.68, 2.91], dir: [0, 0, 1], axis: "z", texture: haz });
  // bull bar
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.55, 2.85], [s * 0.9, 1.1, 2.95], 0.045, P.metal, { bone: body, sides: 6 });
    b.rod([s * 0.35, 0.6, 2.9], [s * 0.35, 1.05, 2.95], 0.04, P.metal, { bone: body, sides: 6 });
  }
  b.rod([-0.95, 1.08, 2.95], [0.95, 1.08, 2.95], 0.05, P.metal, { bone: body, sides: 6 });
  b.rod([-0.95, 0.62, 2.9], [0.95, 0.62, 2.9], 0.045, P.metal, { bone: body, sides: 6 });
  // tow hooks
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.06, 0.018, 5, 8), P.trim, {
      bone: body, at: [s * 1.1, 0.6, 2.95] });
  }
  // headlamp units
  for (const s of [1, -1]) {
    box(0.4, 0.2, 0.08, P.dark, [s * 0.85, 0.88, 2.86]);
    glow(box(0.32, 0.13, 0.05, P.lamp, [s * 0.85, 0.88, 2.91]), 1.8);
    glow(box(0.3, 0.03, 0.04, P.neonMagenta, [s * 0.85, 0.74, 2.9]), 1.4);
  }
  // grille vents on bumper
  for (let i = 0; i < 5; i++) box(0.5, 0.025, 0.04, P.dark, [0, 0.72 + i * 0.045, 2.915]);

  // rear bumper
  box(2.5, 0.3, 0.25, armorPaint, [0, 0.72, -2.72]);
  box(2.52, 0.05, 0.27, P.trim, [0, 0.88, -2.72]);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.8, 0.12), "#ffffff", {
      bone: body, at: [s * 0.6, 0.68, -2.846], dir: [0, 0, -1], axis: "z", texture: haz });
    glow(box(0.5, 0.05, 0.04, P.tail, [s * 0.6, 0.84, -2.85]), 1.5);
    b.part(new THREE.TorusGeometry(0.06, 0.018, 5, 8), P.trim, { bone: body, at: [s * 1.0, 0.6, -2.85] });
  }

  // side vents and rivets
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) box(0.03, 0.18, 0.05, P.dark, [s * 1.26, 0.92, 0.5 + i * 0.12 - 0.2], {});
    for (let i = 0; i < 8; i++) {
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.metal, {
        bone: body, at: [s * 1.31, 0.66, -1.9 + i * 0.55 + R() * 0.05] });
    }
    // hull side marking
    box(0.02, 0.06, 1.0, P.neonCyan, [s * 1.27, 1.0, -0.2]);
  }
  glow(box(0.02, 0.06, 1.0, P.neonCyan, [1.27, 1.0, -0.2]), 1.2);
  // olive armor plates on top deck
  box(2.4, 0.04, 0.9, P.olive, [0, 1.0, 0.0]);
  box(2.2, 0.03, 0.6, armorPaint, [0, 1.12, 2.3]);
  // front trim stripe
  box(2.5, 0.05, 0.05, P.trim, [0, 1.1, 2.88]);

  return;
}
```

<!-- call: gun -->

```ts
import * as THREE from "three";
import { paint, svg, glowDummy } from "agentic-3js-builder";
```

Correction: the kit import is separate, so here is the final module.

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGun({ b, J, P, M }: any) {
  const yaw = J.gunYaw;
  const pit = J.gunPitch;
  const base = M.turretMount as number[];
  const CX = 0, CZ = base[2];

  const worn = (c: string, c2: string, seed: number) =>
    paint((p, n) => {
      const k = noise(p, 0.08, seed);
      let col = mix(c, c2, smoothstep(0.4, 0.7, k));
      return mix(col, "#0a0a0c", 0.3 * smoothstep(-0.2, -0.9, n.y));
    });
  const ARM = worn(P.armor, P.olive, 3);
  const HULL = worn(P.hull, P.metal, 5);

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 10) => new THREE.CylinderGeometry(rt, rb, h, s);

  // Fixed base on the body joint
  b.part(cyl(0.34, 0.4, 0.06, 12), HULL, { bone: J.body, at: [CX, 1.18, CZ] });
  b.part(cyl(0.3, 0.3, 0.03, 12), P.trim, { bone: J.body, at: [CX, 1.22, CZ] });
  b.part(cyl(0.07, 0.09, 0.5, 8), P.metal, { bone: J.body, at: [CX, 1.45, CZ] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.metal, {
      bone: J.body, at: [Math.cos(a) * 0.35, 1.2, CZ + Math.sin(a) * 0.35],
    });
  }
  glow(b.part(new THREE.TorusGeometry(0.33, 0.012, 4, 20), P.neonCyan, {
    bone: J.body, at: [CX, 1.22, CZ], rotation: [90, 0, 0],
  }), 1.5);

  // Yaw cradle
  b.part(cyl(0.2, 0.22, 0.1, 10), HULL, { bone: yaw, at: [CX, 1.72, CZ] });
  for (const s of [1, -1]) {
    b.part(box(0.07, 0.3, 0.3), ARM, { bone: yaw, at: [s * 0.2, 1.82, CZ] });
    b.part(cyl(0.05, 0.05, 0.05, 8), P.metal, { bone: yaw, at: [s * 0.24, 1.78, CZ], rotation: [0, 0, 90] });
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), s > 0 ? P.neonMagenta : P.neonCyan, {
      bone: yaw, at: [s * 0.24, 1.96, CZ - 0.1],
    }), 2);
  }

  // Shield plate with hazard stripes
  const HAZ = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#e7b814"/>
    <g fill="#14161c"><path d="M0 40L16 0H28L12 40Z"/><path d="M24 40L40 0H52L36 40Z"/><path d="M48 40L64 0V12L60 40Z"/></g>
    <rect x="0" y="0" width="64" height="40" fill="none" stroke="#14161c" stroke-width="3"/></svg>`, { size: 128 });
  b.part(box(0.78, 0.5, 0.05), ARM, { bone: yaw, at: [CX, 1.98, CZ + 0.3] });
  b.part(box(0.74, 0.14, 0.01), "#ffffff", { bone: yaw, at: [CX, 1.78, CZ + 0.33], texture: HAZ });
  b.part(box(0.82, 0.04, 0.08), P.dark, { bone: yaw, at: [CX, 2.24 - 0.0, CZ + 0.3] });
  b.part(box(0.04, 0.5, 0.07), P.dark, { bone: yaw, at: [-0.4, 1.98, CZ + 0.3] });
  b.part(box(0.04, 0.5, 0.07), P.dark, { bone: yaw, at: [0.4, 1.98, CZ + 0.3] });
  // viewing slit
  b.part(box(0.3, 0.05, 0.02), P.dark, { bone: yaw, at: [CX, 2.08, CZ + 0.335] });

  // Ammo box with belt (left side)
  b.part(box(0.2, 0.2, 0.3), P.olive, { bone: yaw, at: [0.36, 1.78, CZ - 0.05] });
  b.part(box(0.21, 0.03, 0.31), P.trim, { bone: yaw, at: [0.36, 1.89, CZ - 0.05] });
  for (let i = 0; i < 6; i++)
    b.part(box(0.04, 0.025, 0.035), P.trim, { bone: yaw, at: [0.3 - i * 0.03, 1.9 - i * 0.02, CZ + 0.14 + i * 0.015] });

  // Sight screen
  const SCR = svg(`<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#04282e"/>
    <circle cx="24" cy="16" r="10" fill="none" stroke="#2ff3ff" stroke-width="1.6"/>
    <path d="M24 2V30M4 16H44" stroke="#2ff3ff" stroke-width="1.2"/><circle cx="24" cy="16" r="2" fill="#ff2fb0"/>
    <rect x="1" y="1" width="46" height="30" fill="none" stroke="#2ff3ff" stroke-width="1.5"/></svg>`, { size: 128 });
  b.part(box(0.2, 0.14, 0.1), P.dark, { bone: yaw, at: [-0.28, 1.84, CZ - 0.02] });
  glow(b.part(new THREE.PlaneGeometry(0.17, 0.11), "#ffffff", {
    bone: yaw, at: [-0.28, 1.85, CZ + 0.035], texture: SCR, dir: [0, 0.1, 1], axis: "z",
  }), 1.4);

  // Barrel assembly on pitch
  const bz = CZ + 0.2;
  b.part(box(0.26, 0.2, 0.4), HULL, { bone: pit, at: [CX, 1.8, CZ + 0.05] });
  b.part(box(0.3, 0.05, 0.3), P.dark, { bone: pit, at: [CX, 1.92, CZ + 0.05] });
  for (const s of [1, -1]) {
    b.part(cyl(0.035, 0.035, 0.9, 8), P.dark, { bone: pit, at: [s * 0.07, 1.8, bz + 0.6], rotation: [90, 0, 0] });
    b.part(cyl(0.055, 0.055, 0.5, 8), P.metal, { bone: pit, at: [s * 0.07, 1.8, bz + 0.2], rotation: [90, 0, 0] });
    b.part(cyl(0.06, 0.05, 0.12, 6), P.armor, { bone: pit, at: [s * 0.07, 1.8, bz + 1.1], rotation: [90, 0, 0] });
    for (const k of [-1, 1])
      b.part(box(0.1, 0.02, 0.04), P.dark, { bone: pit, at: [s * 0.07, 1.8 + k * 0.05, bz + 1.1] });
    glow(b.part(cyl(0.02, 0.02, 0.012, 6), s > 0 ? P.neonMagenta : P.neonCyan, {
      bone: pit, at: [s * 0.07, 1.8, bz + 1.17], rotation: [90, 0, 0],
    }), 2);
  }
  b.part(box(0.04, 0.04, 0.3), P.trim, { bone: pit, at: [CX, 1.97, CZ + 0.05] });
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const wornHull = paint((p, n) => {
    const t = noise(p, 0.18, 3);
    const base = mix(P.hull, P.armor, smoothstep(0.4, 0.8, t) * 0.6);
    const scuff = smoothstep(0.62, 0.8, noise(p, 0.04, 9));
    return mix(base, P.metal, scuff * 0.35 * (n.y > 0.5 ? 1 : 0.5));
  });
  const wornOlive = paint((p) => mix(P.olive, P.armor, smoothstep(0.45, 0.85, noise(p, 0.12, 5)) * 0.7));

  const STENCIL = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e7b814">HJ-07</text></svg>`,
    { size: 256 },
  );
  const NEON = svg(
    `<svg viewBox="0 0 160 24"><rect width="160" height="24" fill="#14161c"/><text x="80" y="18" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#2ff3ff">HOVERJACK</text><rect x="2" y="2" width="156" height="20" fill="none" stroke="#ff2fb0" stroke-width="1.5"/></svg>`,
    { size: 512 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#e7b814"/><path d="M0 8L8 0H16L8 8ZM16 8L24 0H32L24 8Z" fill="#14161c"/></svg>`,
    { size: 128 },
  );

  // floor
  box(2.3, 0.1, 3.0, wornHull, [0, 1.15, -1.3]);
  box(2.1, 0.04, 2.9, P.dark, [0, 1.22, -1.3]);
  // longitudinal ribs on floor
  for (let i = -3; i <= 3; i++) box(0.04, 0.03, 2.8, P.metal, [i * 0.28, 1.25, -1.3]);

  // side walls
  for (const s of [1, -1]) {
    box(0.1, 0.6, 3.0, wornHull, [s * 1.12, 1.55, -1.3]);
    box(0.16, 0.08, 3.06, P.armor, [s * 1.12, 1.88, -1.3]);
    // hazard strip on cap
    b.part(new THREE.PlaneGeometry(2.9, 0.07), "#ffffff", {
      bone, at: [s * 1.205, 1.78, -1.3], dir: [s, 0, 0], axis: "z", texture: HAZ,
    });
    // armour panels and ribs
    for (let i = 0; i < 5; i++) {
      const z = -2.45 + i * 0.62;
      box(0.05, 0.42, 0.5, wornOlive, [s * 1.18, 1.55, z]);
      box(0.07, 0.5, 0.05, P.dark, [s * 1.19, 1.55, z + 0.31]);
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.metal, {
        bone, at: [s * 1.215, 1.7, z], dir: [s, 0, 0],
      });
    }
    // tie-down rings
    for (const z of [-2.5, -0.2]) {
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, {
        bone, at: [s * 1.07, 1.8, z], dir: [s, 0, 0], axis: "z",
      });
    }
    // stencil
    b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
      bone, at: [s * 1.222, 1.5, -1.0], dir: [s, 0, 0], axis: "z", texture: STENCIL,
    });
  }

  // tailgate
  box(2.3, 0.62, 0.1, wornHull, [0, 1.55, -2.75]);
  box(2.38, 0.08, 0.16, P.armor, [0, 1.88, -2.75]);
  for (let i = -3; i <= 3; i++) box(0.06, 0.5, 0.04, P.armor, [i * 0.3, 1.55, -2.8]);
  // neon sign
  glow(
    b.part(new THREE.PlaneGeometry(1.5, 0.22), "#ffffff", {
      bone, at: [0, 1.62, -2.815], dir: [0, 0, -1], axis: "z", texture: NEON,
    }),
    1.4,
  );
  glow(box(1.56, 0.02, 0.02, P.neonMagenta, [0, 1.49, -2.81]), 1.5);
  glow(box(1.56, 0.02, 0.02, P.neonCyan, [0, 1.75, -2.81]), 1.5);
  // hinges
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), P.metal, { bone, at: [s * 1.1, 1.3, -2.8], rotation: [0, 0, 90] });

  // tail lights
  for (const s of [1, -1]) {
    box(0.2, 0.3, 0.08, P.dark, [s * 1.14, 1.5, -2.82]);
    glow(box(0.14, 0.24, 0.05, P.tail, [s * 1.14, 1.5, -2.87]), 1.6);
  }

  // roll hoop behind cab
  const hoop = [
    [-1.05, 1.2, 0.1], [-1.05, 1.95 - 0.05, 0.1], [-0.6, 2.2 - 0.3, 0.1], [0.6, 2.2 - 0.3, 0.1], [1.05, 1.9, 0.1], [1.05, 1.2, 0.1],
  ];
  hoop.slice(0, -1).forEach((p, i) => {
    const q = hoop[i + 1];
    b.rod(p, q, 0.04, P.armor, { bone, sides: 6 });
  });
  hoop.forEach((p) => b.part(new THREE.SphereGeometry(0.055, 6, 4), P.metal, { bone, at: p as any }));
  b.rod([-1.05, 1.7, 0.1], [1.05, 1.7, 0.1], 0.03, P.metal, { bone, sides: 6 });
  box(2.3, 0.7, 0.06, wornOlive, [0, 1.55, 0.25]);

  // ammo crates
  for (let i = 0; i < 3; i++) {
    const x = -0.8 + i * 0.0, z = -2.2 + i * 0.0;
    void x; void z;
  }
  const crates: [number, number, number, number][] = [[-0.75, -2.35, 0.55, 0], [-0.75, -1.75, 0.5, 0.1], [-0.72, -2.05, 0.4, 0.3]];
  crates.forEach(([x, z, w, rot], i) => {
    const y = i === 2 ? 1.74 : 1.5;
    const c = i === 2 ? P.armor : P.olive;
    const w2 = i === 2 ? 0.4 : w;
    box(w2, 0.4, 0.5, c, [x, i === 2 ? y - 0.05 : 1.45, i === 2 ? -2.05 : z], { rotation: [0, rot * 20, 0] });
    box(w2 + 0.02, 0.05, 0.12, P.trim, [x, i === 2 ? 1.65 : 1.4, i === 2 ? -2.05 : z], { rotation: [0, rot * 20, 0] });
    box(0.1, 0.06, 0.04, P.metal, [x, i === 2 ? 1.72 : 1.64, i === 2 ? -1.8 : z + 0.26]);
  });

  // fuel drum
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 10), wornOlive, { bone, at: [0.7, 1.6, -2.2] });
  for (const dy of [-0.2, 0.2]) b.part(new THREE.CylinderGeometry(0.295, 0.295, 0.05, 10), P.armor, { bone, at: [0.7, 1.6 + dy, -2.2] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.metal, { bone, at: [0.7, 1.97, -2.1] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.tail, { bone, at: [0.6, 1.97, -2.3] });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", { bone, at: [0.7, 1.62, -1.915], dir: [0, 0, 1], axis: "z", texture: STENCIL });

  // strap over cargo
  box(0.08, 0.02, 0.8, P.dark, [-0.74, 1.66, -2.05]);
  void R;
}
```
<!-- call: plan -->

```json
{
  "name": "Convoy Hauler MK-IV 'Lockbox'",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a slab-sided cab, roof turret and a sealed glowing cargo pod strapped to its flatbed.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.2, 8.4],
  "layout": "Long, heavy and angular. Front (+Z): a chunky wedge-nosed cab with a raked windscreen slit glowing cyan, a ram bumper bar with yellow-black hazard chevrons, twin headlight bars and a roof light rack. Behind the cab a low armoured flatbed carries the big rounded-box cargo pod, strapped with yellow hazard bands, with a glowing magenta seal-lock on its rear face and cyan vent strips. A small turret sits on the cab roof ring with twin barrels pointing forward. Three axles of chunky octagonal wheels (front steer axle, two rear axles) stand on the floor under wheel arches with neon underglow strips beneath the chassis. Panels are riveted dark gunmetal with hazard yellow trim, cyan and magenta neon accents, stencilled unit numbers and warning decals. All shapes are blocky faceted primitives with bevelled edges; detail is carried by paints, SVG decals and glow.",
  "palette": {
    "hull": "#3b4250",
    "hullDark": "#20242e",
    "armor": "#566074",
    "trim": "#e7b814",
    "trimBlack": "#14161b",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0e2a3a",
    "tire": "#17181c",
    "rim": "#8a93a3",
    "podShell": "#6b7488",
    "podStrap": "#e7b814",
    "warnRed": "#ff3b30",
    "lampWhite": "#fff6d8",
    "steel": "#9aa3b2"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 2.4],
    "flatbedDeck": [0, 1.45, -1.6],
    "turretRing": [0, 3.0, 2.2],
    "podBase": [0, 1.45, -1.7],
    "axleFront": [0, 0.65, 2.9],
    "axleMid": [0, 0.65, -0.6],
    "axleRear": [0, 0.65, -2.6],
    "frontBumper": [0, 0.8, 4.2],
    "rearFace": [0, 1.9, -4.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 3.0, 2.2], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.3, 2.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.65, 2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.65, 2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.3, 0.65, -0.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.3, 0.65, -0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.3, 0.65, -2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.3, 0.65, -2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "podLid", "parent": "body", "at": [0, 3.0, -1.7], "dir": [0, 0, 1], "role": "hinge", "group": "cargo" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull and frame: long gunmetal chassis slab with panelled/rivet paint, side skirts with hazard chevron stripes, three wheel arches with armour lips, front ram bumper bar and push plates, towing hook, rear bumper with red tail lights, fuel tanks and cable bundles on the sides, neon cyan and magenta underglow strips along the sill, exhaust stacks behind the cab, stencilled unit number decals on the flanks.",
      "box": [[-1.5, 0.35, -4.2], [1.5, 1.45, 4.3]],
      "attaches": "Cab sits on chassisTop/cabFloor; flatbed and pod sit on flatbedDeck/podBase; wheels hang in arches at axleFront/Mid/Rear; ram bumper at frontBumper.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Armoured crew cab: wedge-nosed faceted block with raked, glowing cyan windscreen slit and side slit windows (glass colour plus glow strip), armour plates with bolts, hazard-striped roof edge, roof light rack with lamp bars and warning beacon in magenta, headlight bars (glow lampWhite), grille with vents and corporate emblem SVG decal, wing mirrors on struts, door seams with handles, antenna array with small dish, and the turret ring base at turretRing.",
      "box": [[-1.4, 1.3, 1.0], [1.4, 3.05, 4.1]],
      "attaches": "Rests on chassisTop at cabFloor; rear wall meets the flatbed front at z=1.0; turret ring top at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "turret",
      "builds": "Roof-mounted remote weapon station: octagonal lathe turret base on turretYaw, angular armoured housing with sensor eye (glowing cyan SVG lens decal), twin barrels with muzzle brakes and heat sleeves on gunPitch, ammo box with feed belt, small shield plates, red targeting laser dot lens, hazard stripe on housing.",
      "box": [[-0.6, 3.0, 1.6], [0.6, 3.2, 3.8]],
      "attaches": "Base seats on the cab roof at turretRing; yaw rides turretYaw, barrels ride gunPitch.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "runningGear",
      "builds": "Six chunky low-poly wheels (octagonal tyres with tread-block paint, steel hub discs with bolt rings, glowing cyan hub caps), axles, leaf-spring and shock-absorber assemblies, mud flaps with hazard stripe, drive shaft, wheel-arch splash guards. Wheel centres on the axle mounts at y=0.65 with radius 0.65 so tyres touch y=0; each wheel rides its own wheel joint.",
      "box": [[-1.65, 0, -3.3], [1.65, 1.3, 3.55]],
      "attaches": "Wheels at axleFront/axleMid/axleRear x=±1.3; suspension arms reach the chassis underside.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "cargoPod",
      "builds": "The sealed cargo pod on the flatbed: bevelled rounded-box capsule shell with panel paint, three yellow-black hazard strap bands with buckles and ratchets, flatbed deck plate with tie-down cleats and corner locks, cyan vent strips and glowing seal-lock plate in magenta on the rear face (SVG biohazard/lock emblem), stencilled serial code and CARGO-SEALED label decals, antenna and tracking beacon on top, top hatch seam on podLid, side handles, tamper-warning red light bar, small status screen SVG with glowing readouts.",
      "box": [[-1.4, 1.45, -4.2], [1.4, 3.1, 0.9]],
      "attaches": "Sits on flatbedDeck/podBase above the chassis; front face stops at cab rear z=0.9; seal-lock at rearFace.",
      "joints": ["body", "podLid"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildChassis({ b, J, P }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });

  const HULL = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) =>
      mix(P.hullDark, P.hull, smoothstep(-0.5, 0.8, n.y) * 0.7 + noise(p, 0.3, 4) * 0.3),
    ),
    { size: 0.5, rivets: 0.1, seam: P.trimBlack },
  );
  const ARMOR = panelled(metal("iron", { tarnish: 0.2 }), { size: 0.4, rivets: 0.08 });

  const hazard = paint((p: THREE.Vector3) => (Math.floor((p.z + p.y) / 0.14) % 2 ? P.trim : P.trimBlack));
  const hazardX = paint((p: THREE.Vector3) => (Math.floor((p.x + p.y) / 0.14) % 2 ? P.trim : P.trimBlack));

  // main chassis slab and frame
  box(2.6, 0.7, 8.4, HULL, [0, 1.05, 0.05]);
  box(2.2, 0.16, 8.2, P.hullDark, [0, 1.46 - 0.08, 0.05]);
  box(1.9, 0.3, 8.0, P.trimBlack, [0, 0.55, 0]);
  // flatbed deck plate
  box(2.8, 0.1, 5.3, ARMOR, [0, 1.4, -1.55]);

  const unit = svg(
    `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="6" fill="none" stroke="#e7b814" stroke-width="3"/><text x="64" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="#e7b814">MK-04</text></svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 6 L60 56 H4Z" fill="#e7b814" stroke="#14161b" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="18" fill="#14161b"/><rect x="29" y="44" width="6" height="6" fill="#14161b"/></svg>`,
    { size: 128 },
  );

  for (const s of [1, -1]) {
    // side skirts with hazard
    box(0.14, 0.36, 7.4, hazard, [s * 1.44, 0.72, 0.1]);
    // neon underglow strips
    glow(box(0.06, 0.07, 6.6, P.neonCyan, [s * 1.3, 0.42, 0.1]), 1.6);
    glow(box(0.05, 0.05, 2.2, P.neonMagenta, [s * 1.3, 0.36, -2.0]), 1.6);
    // decals on flanks
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      bone, at: [s * 1.31, 1.1, 0.2], dir: [s, 0, 0], axis: "z", texture: unit,
    });
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone, at: [s * 1.31, 1.15, -1.7], dir: [s, 0, 0], axis: "z", texture: warn,
    });
    // fuel tanks
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.5, 8), ARMOR, {
      bone, at: [s * 1.1, 0.78, -1.6], dir: [0, 0, 1], flat: true,
    });
    for (const z of [-2.2, -1.0]) box(0.06, 0.6, 0.1, P.steel, [s * 1.1, 0.78, z], { });
    // cable bundles
    b.rod([s * 1.2, 0.98, 1.3], [s * 1.2, 0.98, -0.2], 0.04, P.trimBlack, { bone, sides: 6 });
    b.rod([s * 1.2, 0.92, 1.3], [s * 1.2, 0.92, -0.2], 0.03, P.neonMagenta, { bone, sides: 6 });
    // wheel arches (armoured lips)
    for (const z of [2.9, -0.6, -2.6]) {
      b.part(new THREE.TorusGeometry(0.82, 0.07, 4, 8, Math.PI), P.armor, {
        bone, at: [s * 1.44, 0.65, z], dir: [s, 0, 0], axis: "z", flat: true,
        rotation: [0, 0, 0],
      });
      box(0.12, 0.1, 1.9, P.armor, [s * 1.45, 1.5, z], { });
      // rim bolts
      for (const k of [-0.6, 0, 0.6]) b.part(new THREE.SphereGeometry(0.05, 5, 4), P.steel, { bone, at: [s * 1.5, 1.5, z + k] });
    }
    // exhaust stacks behind cab
    b.rod([s * 1.2, 1.4, 0.75], [s * 1.2, 2.9, 0.75], 0.1, P.steel, { bone, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.14, 0.1, 0.12, 8), P.trimBlack, { bone, at: [s * 1.2, 2.92, 0.75] });
    b.part(new THREE.TorusGeometry(0.1, 0.02, 4, 8), P.trim, { bone, at: [s * 1.2, 1.9, 0.75], rotation: [90, 0, 0] });
    // front push plates
    box(0.12, 0.8, 0.5, P.trim, [s * 1.1, 0.75, 4.15], { });
    // tail lights
    glow(box(0.4, 0.16, 0.06, P.warnRed, [s * 0.95, 0.95, -4.22]), 1.5);
  }

  // front ram bumper
  box(3.0, 0.5, 0.45, hazardX, [0, 0.8, 4.05]);
  box(2.6, 0.18, 0.3, ARMOR, [0, 1.15, 4.0]);
  box(2.4, 0.3, 0.3, P.armor, [0, 0.5, 3.95], { });
  // towing hook
  b.part(new THREE.TorusGeometry(0.12, 0.035, 5, 8, Math.PI * 1.5), P.steel, {
    bone, at: [0, 0.45, 4.35], rotation: [0, 0, 0],
  });
  box(0.1, 0.1, 0.3, P.steel, [0, 0.45, 4.2]);

  // rear bumper
  box(3.0, 0.4, 0.3, hazardX, [0, 0.7, -4.05]);
  box(2.4, 0.3, 0.2, P.hullDark, [0, 1.05, -4.1]);
  for (const x of [-0.7, 0, 0.7]) box(0.5, 0.06, 0.04, P.steel, [x, 0.72, -4.22]);
  // rear hitch
  box(0.3, 0.2, 0.3, P.steel, [0, 0.45, -4.25]);

  // crossmembers and axle housings under frame
  for (const z of [2.9, -0.6, -2.6]) box(2.0, 0.22, 0.3, P.hullDark, [0, 0.5, z]);
  // underglow centre
  glow(box(1.4, 0.05, 0.05, P.neonCyan, [0, 0.33, 3.9]), 1.6);
  glow(box(1.4, 0.05, 0.05, P.neonMagenta, [0, 0.33, -3.9]), 1.6);
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, mix, smoothstep, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const ring: number[] = M.turretRing;
  const EXTRA = { dark: "#0b0c10", red: "#ff2a2a", brass: "#b8892e" };

  const armorPaint = paint((p, n) => {
    const base = mix(P.hull, P.armor, smoothstep(0.3, 0.8, noise(p, 0.25, 4)));
    const top = mix(base, "#8a93a3", 0.25 * smoothstep(0.5, 1, n.y));
    const seam = Math.abs(((p.z * 5) % 1) - 0.5) < 0.02 ? 0.5 : 0;
    return mix(top, P.trimBlack, seam);
  });
  const hazard = paint((p) =>
    (Math.floor((p.x + p.z + p.y) / 0.05) % 2 + 2) % 2 ? P.trim : P.trimBlack);

  // base: octagonal lathe on yaw
  b.lathe(
    [[0, 0], [0.5, 0], [0.5, 0.05], [0.42, 0.1], [0.4, 0.2], [0, 0.2]],
    { at: [ring[0], ring[1], ring[2] + 0.2], segments: 8, bone: yaw, color: armorPaint },
  );
  b.lathe(
    [[0.43, 0], [0.47, 0], [0.47, 0.04], [0.43, 0.04]],
    { at: [ring[0], ring[1] + 0.2, ring[2] + 0.2], segments: 8, bone: yaw, color: hazard },
  );
  // bolts around base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.steel, {
      bone: yaw, at: [Math.sin(a) * 0.46, ring[1] + 0.07, ring[2] + 0.2 + Math.cos(a) * 0.46],
    });
  }

  // housing: faceted
  const hy = ring[1] + 0.2;
  b.frustumBox([0, hy, 2.35], [0, hy + 0.28, 2.4], [0.95, 0.5], [0.8, 0.5], { bone: yaw, color: armorPaint });
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.6), armorPaint, { bone: yaw, at: [0, hy + 0.3, 2.35] });
  // hazard stripe on housing top front
  b.part(new THREE.BoxGeometry(0.82, 0.02, 0.1), hazard, { bone: yaw, at: [0, hy + 0.34, 2.62] });
  b.part(new THREE.BoxGeometry(0.82, 0.02, 0.1), hazard, { bone: yaw, at: [0, hy + 0.34, 2.1] });

  // side shield plates
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.5, 0], [0.62, 0.22], [0.1, 0.3]], {
      at: [s * 0.5, hy + 0.05, 2.1], x: [0, 0, 1], thickness: 0.04, bevel: 0.008,
      bone: yaw, color: armorPaint,
    });
    for (const z of [2.25, 2.5]) {
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.steel, { bone: yaw, at: [s * 0.52, hy + 0.2, z] });
    }
  }

  // sensor eye on front face
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#07161c" stroke="#2ff3ff" stroke-width="4"/>
     <circle cx="32" cy="32" r="18" fill="#2ff3ff"/><circle cx="32" cy="32" r="9" fill="#e8ffff"/>
     <circle cx="26" cy="26" r="4" fill="#ffffff"/>
     <path d="M32 2V10M32 54V62M2 32H10M54 32H62" stroke="#2ff3ff" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.08, 8), P.trimBlack, {
    bone: yaw, at: [0, hy + 0.2, 2.7], dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.CircleGeometry(0.15, 16), "#ffffff", {
      bone: yaw, at: [0, hy + 0.2, 2.745], dir: [0, 0, 1], axis: "z", texture: eyeTex,
    }),
    1.4,
  );

  // laser dot lens
  b.part(new THREE.CylinderGeometry(0.035, 0.04, 0.05, 8), P.trimBlack, {
    bone: yaw, at: [0.3, hy + 0.36, 2.55], dir: [0, 0, 1],
  });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), EXTRA.red, { bone: yaw, at: [0.3, hy + 0.36, 2.58] }), 2);

  // ammo box with feed belt (left side)
  b.part(new THREE.BoxGeometry(0.22, 0.24, 0.34), P.hullDark, { bone: yaw, at: [-0.62, hy + 0.12, 2.3] });
  b.part(new THREE.BoxGeometry(0.24, 0.05, 0.36), hazard, { bone: yaw, at: [-0.62, hy + 0.26, 2.3] });
  b.part(new THREE.BoxGeometry(0.03, 0.03, 0.03), P.steel, { bone: yaw, at: [-0.62, hy + 0.12, 2.5] });
  const belt: number[][] = [];
  for (let i = 0; i <= 6; i++) belt.push([-0.55 + i * 0.015 * 0 - i * 0.0, hy + 0.2 + Math.sin(i / 6 * Math.PI) * 0.06, 2.45 + i * 0.05]);
  const beltPts = [[-0.62, hy + 0.1, 2.48], [-0.58, hy + 0.04, 2.58], [-0.5, hy + 0.1, 2.68], [-0.38, hy + 0.2, 2.74]];
  b.sweep(beltPts, 0.022, { bone: yaw, color: EXTRA.brass });
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    b.part(new THREE.BoxGeometry(0.03, 0.045, 0.03), EXTRA.brass, {
      bone: yaw, at: [-0.62 + t * 0.24, hy + 0.1 + 0.1 * t, 2.48 + t * 0.26],
    });
  }

  // gun cradle on pitch
  const gy = 3.3;
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.34), armorPaint, { bone: pitch, at: [0, gy, 2.8] });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8), P.steel, {
      bone: pitch, at: [s * 0.27, gy, 2.5], dir: [1, 0, 0],
    });
    // barrel
    b.rod([s * 0.14, gy, 2.9], [s * 0.14, gy, 3.62], 0.04, P.steel, { bone: pitch, sides: 8 });
    // heat sleeve
    b.rod([s * 0.14, gy, 2.98], [s * 0.14, gy, 3.3], 0.065, P.hullDark, { bone: pitch, sides: 8 });
    for (const z of [3.04, 3.14, 3.24]) {
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 8), P.trimBlack, {
        bone: pitch, at: [s * 0.14, gy, z], dir: [0, 0, 1],
      });
    }
    // muzzle brake
    b.rod([s * 0.14, gy, 3.58], [s * 0.14, gy, 3.8], 0.06, P.hullDark, { bone: pitch, sides: 8 });
    for (const z of [3.65, 3.72]) {
      b.part(new THREE.BoxGeometry(0.15, 0.025, 0.03), P.steel, { bone: pitch, at: [s * 0.14, gy, z] });
    }
    glow(b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.01, 6), P.neonCyan, {
      bone: pitch, at: [s * 0.14, gy, 3.8], dir: [0, 0, 1],
    }), 1.2);
  }
  // barrel clamp bridge
  b.part(new THREE.BoxGeometry(0.36, 0.05, 0.05), P.hullDark, { bone: pitch, at: [0, gy, 3.45] });
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = 0.65;
  const TW = 0.5;
  const rand = rng(11);

  // Tread paint: dark rubber with lighter tread blocks around the tyre
  const treadPaint = paint((p, n, s) => {
    const base: [number, number, number] = [0.09, 0.095, 0.11];
    const lit: [number, number, number] = [0.2, 0.21, 0.24];
    const ang = Math.atan2(p.y - R, p.z) ;
    const k = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 24);
    const block = (k % 2 === 0) ? 1 : 0;
    const side = Math.abs(n.x) > 0.7;
    const m = side ? 0.2 : block * 0.8;
    const grime = noise(p, 0.2, 3) * 0.3;
    return mix(base, lit, m * 0.6 + grime * 0.3);
  });

  const hubPaint = paint((p, n) => {
    const c = mix("#6c7484", "#a9b2c2", smoothstep(0.3, 0.9, noise(p, 0.1, 5)));
    return mix(c, [0.4, 0.45, 0.55], smoothstep(0.5, -0.5, n.y) * 0.4);
  });

  const metalPaint = paint((p, n) => {
    const c = mix(P.hullDark, P.hull, noise(p, 0.25, 8));
    return mix(c, [0.55, 0.37, 0.15], smoothstep(0.6, 0.9, noise(p, 0.09, 2)) * 0.25);
  });

  const hazard = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="${P.trim}"/>
     ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 12 - 8} 32 L${i * 12 + 2} 0 L${i * 12 + 9} 0 L${i * 12 - 1} 32Z" fill="${P.trimBlack}"/>`).join("")}
     <rect width="64" height="32" fill="none" stroke="${P.trimBlack}" stroke-width="3"/></svg>`,
    { size: 128 },
  );

  const boltRing = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#8a93a3" stroke="#3a3f4a" stroke-width="3"/>
     <circle cx="32" cy="32" r="22" fill="none" stroke="#4a505c" stroke-width="2"/>
     ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${32 + Math.cos(a) * 25}" cy="${32 + Math.sin(a) * 25}" r="3" fill="#2a2e36" stroke="#c9d0dc" stroke-width="1"/>`; }).join("")}
     <circle cx="32" cy="32" r="9" fill="#2a2e36"/></svg>`,
    { size: 128 },
  );

  const capTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#0b5560"/>
     <circle cx="32" cy="32" r="24" fill="${P.neonCyan}"/><circle cx="32" cy="32" r="14" fill="#c9ffff"/>
     <path d="M32 8 L32 56 M8 32 L56 32" stroke="#0b5560" stroke-width="3"/></svg>`,
    { size: 96 },
  );

  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, M.axleFront[2], 1],
    ["wheelFR", -1, M.axleFront[2], 1],
    ["wheelML", 1, M.axleMid[2], 1],
    ["wheelMR", -1, M.axleMid[2], 1],
    ["wheelRL", 1, M.axleRear[2], 1],
    ["wheelRR", -1, M.axleRear[2], 1],
  ];

  // Wheels: each rides its own joint, built about the joint's axle (+X outward for left)
  for (const [name, s, z] of wheels.map((w) => [w[0], w[1], w[2]] as [string, number, number])) {
    const j = J[name];
    const cx = 1.3 * s;
    const c: [number, number, number] = [cx, R, z];
    const axle: [number, number, number] = [s, 0, 0];
    // Tyre: octagonal cylinder
    b.part(new THREE.CylinderGeometry(R, R, TW, 8, 1), treadPaint, { bone: j, at: c, dir: axle, flat: true });
    // sidewall shoulders (slightly smaller octagon rings for bevel look)
    for (const o of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.86, R * 0.97, 0.06, 8), P.tire, {
        bone: j, at: [cx + s * o * (TW / 2 + 0.01), R, z], dir: axle, flat: true,
      });
    }
    // Steel hub disc outer face
    const outX = cx + s * (TW / 2 + 0.04);
    b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 8), hubPaint, { bone: j, at: [outX, R, z], dir: axle, flat: true });
    // bolt ring decal
    b.part(new THREE.CircleGeometry(0.4, 16), "#ffffff", {
      bone: j, at: [outX + s * 0.034, R, z], dir: axle, axis: "z", texture: boltRing,
    });
    // glowing cyan hub cap
    glow(b.part(new THREE.CircleGeometry(0.15, 12), "#ffffff", {
      bone: j, at: [outX + s * 0.045, R, z], dir: axle, axis: "z", texture: capTex,
    }), 1.6);
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.05, 8), P.steel, { bone: j, at: [outX + s * 0.01, R, z], dir: axle, flat: true });
    // inner hub disc
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), P.rim, {
      bone: j, at: [cx - s * (TW / 2 + 0.02), R, z], dir: axle, flat: true,
    });
    // lug bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.trimBlack, {
        bone: j, at: [outX + s * 0.04, R + Math.sin(a) * 0.26, z + Math.cos(a) * 0.26], dir: axle, flat: true,
      });
    }
  }

  // Axles with differential housings
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    b.rod([-1.1, R, z], [1.1, R, z], 0.09, P.steel, { bone: J.body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.22, 8, 6), metalPaint, { bone: J.body, at: [0, R, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), P.hullDark, { bone: J.body, at: [0, R + 0.2, z] });
    // inner sleeves
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 8), P.hullDark, { bone: J.body, at: [s * 0.95, R, z], dir: [1, 0, 0], flat: true });
    }
  }

  // Leaf springs + shocks per side per axle
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    for (const s of [1, -1]) {
      const x = s * 0.95;
      // stacked leaf plates
      for (let i = 0; i < 4; i++) {
        const len = 1.1 - i * 0.2;
        b.part(new THREE.BoxGeometry(0.16, 0.035, len), i % 2 ? P.hullDark : P.armor, {
          bone: J.body, at: [x, R + 0.28 + i * 0.04 - (i === 0 ? 0 : 0.01), z],
        });
      }
      // U-bolt clamp
      b.part(new THREE.BoxGeometry(0.22, 0.12, 0.14), P.trimBlack, { bone: J.body, at: [x, R + 0.4, z] });
      // spring hangers to chassis underside
      b.rod([x, R + 0.4, z], [x, 1.3, z], 0.05, P.steel, { bone: J.body, sides: 6 });
      // shock absorber
      const sx = s * 1.1;
      b.rod([sx, R + 0.05, z + 0.3], [sx - s * 0.05, 1.2, z + 0.45], 0.045, P.trim, { bone: J.body, sides: 6 });
      b.rod([sx, 0.75, z + 0.3 + 0.03], [sx - s * 0.02, 1.0, z + 0.4], 0.065, P.trimBlack, { bone: J.body, sides: 6 });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.steel, { bone: J.body, at: [sx, R + 0.05, z + 0.3] });
    }
  }

  // Mud flaps with hazard stripe behind each rear wheel set, plus splash guards over arches
  for (const z of [M.axleMid[2], M.axleRear[2]]) {
    for (const s of [1, -1]) {
      const fz = z - R - 0.12;
      b.part(new THREE.BoxGeometry(0.06, 0.5, 0.5), P.trimBlack, { bone: J.body, at: [s * 1.3, 0.52, fz - 0.02] });
      b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
        bone: J.body, at: [s * 1.3 + s * 0.035, 0.42, fz - 0.02], dir: [s, 0, 0], axis: "z", texture: hazard,
      });
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.4), P.steel, { bone: J.body, at: [s * 1.3, 0.82, fz + 0.02] });
    }
  }
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    for (const s of [1, -1]) {
      // arch splash guard: arc of angled plates over the wheel
      for (let i = 0; i < 5; i++) {
        const a = -0.9 + i * 0.45;
        const rr = R + 0.16;
        const y = R + Math.cos(a) * rr;
        const zz = z + Math.sin(a) * rr;
        b.part(new THREE.BoxGeometry(0.12, 0.05, 0.32), i % 2 ? P.hullDark : P.armor, {
          bone: J.body, at: [s * 1.3, Math.min(y, 1.28), zz], rotation: [a * 57.3, 0, 0], flat: true,
        });
      }
    }
  }

  // Drive shaft along the centerline with universal joints
  b.rod([0, 0.78, M.axleFront[2] - 0.2], [0, 0.78, M.axleRear[2] + 0.2], 0.07, P.steel, { bone: J.body, sides: 8 });
  for (const z of [M.axleFront[2] - 0.2, 1.4, 0.4, -0.6, M.axleRear[2] + 0.2]) {
    b.part(new THREE.BoxGeometry(0.16, 0.16, 0.16), P.trimBlack, { bone: J.body, at: [0, 0.78, z], rotation: [0, 0, 45] });
  }
  // Transfer case + cross members up to chassis
  b.part(new THREE.BoxGeometry(0.5, 0.36, 0.6), metalPaint, { bone: J.body, at: [0, 0.85, M.axleMid[2] + 0.9], flat: true });
  for (const z of [2.0, -1.6]) {
    b.rod([-1.0, 1.25, z], [1.0, 1.25, z], 0.06, P.hullDark, { bone: J.body, sides: 6 });
  }

  // Steering linkage on front axle
  const fz = M.axleFront[2];
  b.rod([-1.1, 0.5, fz + 0.3], [1.1, 0.5, fz + 0.3], 0.04, P.steel, { bone: J.body, sides: 6 });
  b.rod([0, 0.7, fz], [0, 0.55, fz + 0.3], 0.04, P.steel, { bone: J.body, sides: 6 });

  // Tiny amber/cyan axle indicator strips (neon accents)
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    glow(b.part(new THREE.BoxGeometry(0.9, 0.02, 0.04), P.neonCyan, { bone: J.body, at: [0, 0.5, z + 0.18] }), 1.4);
  }
  // Rivet-like bolts on spring hangers
  for (let i = 0; i < 6; i++) {
    const z = [M.axleFront[2], M.axleMid[2], M.axleRear[2]][i % 3];
    const s = i < 3 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.035, 5, 4), P.steel, { bone: J.body, at: [s * 0.95, 1.0 + rand() * 0.02, z - 0.06] });
  }
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, noise, smoothstep, mix, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildCargoPod({ b, J, P }: Ctx) {
  const body = J.body;
  const lid = J.podLid;
  const X0 = -1.4, X1 = 1.4, ZF = 0.9, ZR = -4.2, YB = 1.45, YT = 3.1;
  const cx = 0, cz = (ZF + ZR) / 2, W = X1 - X0, L = ZF - ZR;

  const shellPaint = panelled(
    paint((p, n) => {
      const t = noise(p, 0.5, 4);
      const base = mix(P.podShell, P.armor, smoothstep(0.3, 0.8, t));
      const top = smoothstep(0.4, 1, n.y);
      return mix(base, "#9aa3b2", top * 0.25);
    }),
    { size: 0.55, aspect: 0.8, rivets: 0.11, seam: P.hullDark },
  );

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });

  // deck plate
  box(2.9, 0.1, 5.2, metal("iron"), [0, YB + 0.05, cz]);
  // main shell: lower body + chamfered upper
  box(2.7, 1.0, 5.0, shellPaint, [0, YB + 0.6, cz]);
  const upper = new THREE.CylinderGeometry(1.0, 1.25, 0.5, 8, 1);
  box(2.4, 0.5, 4.8, shellPaint, [0, YB + 1.35, cz]);
  // bevel ridges (octagonal edge pieces)
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.2, 5.0), P.armor, { bone: body, at: [s * 1.3, YB + 1.1, cz], rotation: [0, 0, s * 45] });
    b.part(new THREE.BoxGeometry(0.2, 0.2, 5.0), P.armor, { bone: body, at: [s * 1.3, YB + 0.1, cz], rotation: [0, 0, s * 45] });
  }
  // end caps (bevelled)
  for (const z of [ZF - 0.02, ZR + 0.02]) {
    box(2.5, 1.5, 0.1, P.hullDark, [0, YB + 0.8, z]);
  }

  // hatch (lid) on podLid
  const hatch = b.part(new THREE.BoxGeometry(1.6, 0.08, 2.0), P.armor, { bone: lid, at: [0, YT - 0.02, cz + 0.6] });
  box(1.7, 0.03, 0.04, P.trimBlack, [0, YT - 0.03, cz + 1.62], { bone: lid });
  box(1.7, 0.03, 0.04, P.trimBlack, [0, YT - 0.03, cz - 0.42], { bone: lid });
  box(0.04, 0.03, 2.1, P.trimBlack, [0.82, YT - 0.03, cz + 0.6], { bone: lid });
  box(0.04, 0.03, 2.1, P.trimBlack, [-0.82, YT - 0.03, cz + 0.6], { bone: lid });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.12), P.steel, { bone: lid, at: [0, YT + 0.05, cz + 1.4] });

  // hazard strap bands
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 4} 16 l8 -16 l4 0 l-8 16z" fill="${P.trimBlack}"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const bandZs = [ZF - 0.9, cz, ZR + 0.9];
  for (const z of bandZs) {
    // wrap top and sides via three slabs
    b.part(new THREE.BoxGeometry(2.74, 0.06, 0.34), "#ffffff", { bone: body, at: [0, YT - 0.01, z], texture: hazard });
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.06, 1.5, 0.34), "#ffffff", { bone: body, at: [s * 1.37, YB + 0.8, z], texture: hazard });
    }
    // buckle and ratchet
    box(0.34, 0.12, 0.2, P.steel, [0.5, YT + 0.05, z]);
    box(0.2, 0.16, 0.1, P.trimBlack, [0.5, YT + 0.14, z]);
    box(0.08, 0.3, 0.08, P.steel, [0.5, YT + 0.2, z + 0.1], { rotation: [20, 0, 0] });
  }

  // tie-down cleats & corner locks
  for (const sx of [1, -1])
    for (const z of [ZF - 0.15, ZR + 0.15, cz]) {
      b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 6), P.steel, { bone: body, at: [sx * 1.5, YB + 0.15, z] });
      b.part(new THREE.BoxGeometry(0.2, 0.06, 0.04), P.steel, { bone: body, at: [sx * 1.5, YB + 0.23, z] });
    }
  for (const sx of [1, -1])
    for (const z of [ZF - 0.12, ZR + 0.12]) {
      box(0.22, 0.22, 0.22, P.trim, [sx * 1.3, YB + 0.12, z]);
      box(0.22, 0.22, 0.22, P.trim, [sx * 1.25, YT - 0.14, z]);
    }

  // cyan vent strips on sides
  const vent = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#031a20"/>` +
      Array.from({ length: 8 }, (_, i) => `<rect x="${3 + i * 7.6}" y="3" width="4.6" height="10" fill="${P.neonCyan}"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    for (const z of [cz + 0.9, cz - 0.9]) {
      const v = b.part(new THREE.PlaneGeometry(0.9, 0.22), "#ffffff", { bone: body, at: [s * 1.376, YB + 1.1, z], dir: [s, 0, 0], axis: "z", texture: vent });
      glow(v, 1.4);
    }

  // side handles
  for (const s of [1, -1])
    for (const z of [cz + 0.4, cz - 0.4]) {
      b.rod([s * 1.38, YB + 0.55, z - 0.2], [s * 1.38, YB + 0.55, z + 0.2], 0.03, P.steel, { bone: body });
      box(0.12, 0.06, 0.06, P.steel, [s * 1.4, YB + 0.55, z - 0.2]);
      box(0.12, 0.06, 0.06, P.steel, [s * 1.4, YB + 0.55, z + 0.2]);
    }

  // rear face: seal-lock plate
  const lock = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="8" fill="#2a0620" stroke="${P.neonMagenta}" stroke-width="3"/>
    <circle cx="32" cy="26" r="14" fill="none" stroke="${P.neonMagenta}" stroke-width="4"/>
    <rect x="18" y="28" width="28" height="22" rx="3" fill="${P.neonMagenta}"/>
    <circle cx="32" cy="36" r="4" fill="#2a0620"/><rect x="30.5" y="36" width="3" height="9" fill="#2a0620"/></svg>`,
    { size: 192 },
  );
  box(1.1, 1.1, 0.08, P.hullDark, [0, 2.25, ZR - 0.04]);
  glow(
    b.part(new THREE.PlaneGeometry(0.95, 0.95), "#ffffff", { bone: body, at: [0, 2.25, ZR - 0.1], dir: [0, 0, -1], axis: "z", texture: lock }),
    1.6,
  );
  // door seams on rear
  box(2.2, 0.03, 0.03, P.trimBlack, [0, 2.9, ZR - 0.06]);
  box(0.03, 1.2, 0.03, P.trimBlack, [-0.9, 2.3, ZR - 0.06]);
  box(0.03, 1.2, 0.03, P.trimBlack, [0.9, 2.3, ZR - 0.06]);

  // label decals
  const label = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#10141a" opacity="0.85"/><rect x="2" y="2" width="124" height="28" fill="none" stroke="${P.trim}" stroke-width="2"/>
    <text x="64" y="21" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="${P.trim}">CARGO-SEALED</text></svg>`,
    { size: 256 },
  );
  const serial = svg(
    `<svg viewBox="0 0 128 32"><text x="64" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#d7dde8">LB-4471-X9</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.0, 0.25), "#ffffff", { bone: body, at: [s * 1.378, YB + 0.6, cz + 1.7], dir: [s, 0, 0], axis: "z", texture: label });
    b.part(new THREE.PlaneGeometry(1.0, 0.25), "#ffffff", { bone: body, at: [s * 1.378, YB + 1.35, cz - 1.5], dir: [s, 0, 0], axis: "z", texture: serial });
  }
  b.part(new THREE.PlaneGeometry(1.4, 0.35), "#ffffff", { bone: body, at: [0, 1.75, ZR - 0.03], dir: [0, 0, -1], axis: "z", texture: label });

  // status screen on front face top
  const screen = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#02161a"/>
    <path d="M4 30 L14 22 L22 26 L34 12 L44 18 L58 6" fill="none" stroke="${P.neonCyan}" stroke-width="2"/>
    <rect x="4" y="34" width="22" height="3" fill="${P.neonCyan}"/><rect x="30" y="34" width="12" height="3" fill="#ff2fa8"/>
    <text x="4" y="10" font-family="monospace" font-size="8" fill="${P.neonCyan}">SEAL OK 98%</text></svg>`,
    { size: 192 },
  );
  box(0.7, 0.45, 0.06, P.trimBlack, [0.7, 2.7, ZF + 0.03]);
  glow(b.part(new THREE.PlaneGeometry(0.6, 0.375), "#ffffff", { bone: body, at: [0.7, 2.7, ZF + 0.07], dir: [0, 0, 1], axis: "z", texture: screen }), 1.3);

  // tamper-warning red light bar (rear top)
  glow(box(1.6, 0.1, 0.1, P.warnRed, [0, YT - 0.2, ZR - 0.05]), 1.6);
  for (const s of [-0.6, -0.2, 0.2, 0.6]) box(0.05, 0.14, 0.14, P.trimBlack, [s, YT - 0.2, ZR - 0.05]);

  // antenna and tracking beacon
  b.rod([-0.9, YT, ZR + 0.6], [-0.9, YT + 0.9, ZR + 0.6], [0.025, 0.012], P.steel, { bone: body });
  b.rod([-0.7, YT, ZR + 0.6], [-0.7, YT + 0.5, ZR + 0.6], 0.015, P.steel, { bone: body });
  b.part(new THREE.CylinderGeometry(0.14, 0.18, 0.1, 8), P.hullDark, { bone: body, at: [-0.7, YT + 0.05, ZR + 0.6] });
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), P.neonMagenta, { bone: body, at: [-0.7, YT + 0.55, ZR + 0.6] }), 2);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone: body, at: [-0.9, YT + 0.92, ZR + 0.6] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone: body, at: [-0.9, YT + 0.92, ZR + 0.6] }), 2);

  // rivet studs along top edge, merged per colour is skipped for simplicity: small count
  const r = rng(9);
  for (let i = 0; i < 14; i++) {
    const z = ZR + 0.4 + (i / 13) * (L - 0.8);
    for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.035, 5, 3), P.steel, { bone: body, at: [s * 1.2 + (r() - 0.5) * 0.01, YT - 0.14, z] });
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, smoothstep, mix, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // ---------- textures ----------
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#14161b" stroke="#e7b814" stroke-width="3"/>
    <path d="M32 10 L54 32 L32 54 L10 32Z" fill="none" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M32 20 L44 32 L32 44 L20 32Z" fill="#ff2fa8"/><rect x="29" y="26" width="6" height="12" fill="#14161b"/></svg>`,
    { size: 128 },
  );
  const HAZARD = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#14161b"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e7b814">04</text></svg>`,
    { size: 128 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b0c10"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<rect x="4" y="${3 + i * 5}" width="56" height="2.5" fill="#566074"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const DISH = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#9aa3b2"/><circle cx="16" cy="16" r="9" fill="none" stroke="#566074" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#2ff3ff"/></svg>`,
    { size: 64 },
  );

  // ---------- paints ----------
  const HULLP = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.armor, smoothstep(0.3, 0.7, noise(p, 0.4, 3)) * 0.5);
      return mix(base, P.hullDark, 0.35 * smoothstep(0.2, -0.8, n.y));
    }),
    { size: 0.5, aspect: 0.7, rivets: 0.1, seam: P.trimBlack },
  );
  const ARMORP = panelled(metal("steel", { tarnish: 0.5, size: 0.3 }), { size: 0.35, rivets: 0.08 });
  const DARKP = panelled(P.hullDark, { size: 0.4, rivets: 0 });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });
  const lit = (m: any, s = 1.4) => glow(m, s);
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], color = "#ffffff", extra: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { bone, at, dir, axis: "z", texture: tex, ...extra });
  const bolt = (at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.steel, { bone, at, dir, flat: true });

  // ---------- main body: wedge nose via extrude (side profile, z forward) ----------
  const profile: any[] = [
    [1.0, 1.3],
    [4.0, 1.3],
    [4.1, 1.75],
    [3.75, 2.2],
    [3.0, 2.45],
    [2.25, 3.0],
    [1.0, 3.0],
  ];
  // x of outline = z (forward), y = height; thickness along x
  const shell = b.extrude(profile, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 2.7,
    bevel: 0.06,
    color: HULLP,
    bone,
  });
  // shell is centred on x=0 thickness axis

  // lower skirt / armor band
  box(2.85, 0.28, 3.0, ARMORP, [0, 1.46, 2.55]);
  // roof plate
  box(2.5, 0.1, 1.3, ARMORP, [0, 3.04, 1.65]);
  // sloped hood plates
  b.part(new THREE.BoxGeometry(2.4, 0.08, 1.0), ARMORP, {
    bone,
    at: [0, 2.28, 3.45],
    rotation: [-18, 0, 0],
    flat: true,
  });
  // windscreen slit (raked)
  const wsAt: number[] = [0, 2.72, 2.64];
  const screenRot = [-40, 0, 0];
  box(2.3, 0.07, 0.62, P.trimBlack, [0, 2.68, 2.66], { rotation: [-38, 0, 0] });
  lit(box(2.1, 0.32, 0.03, P.neonCyan, [0, 2.7, 2.68], { rotation: [-38, 0, 0] }).constructor ? b.part(new THREE.BoxGeometry(2.1, 0.5, 0.03), P.neonCyan, { bone, at: [0, 2.74, 2.7], rotation: [-38, 0, 0], flat: true }) : null, 1.5);
  void wsAt; void screenRot;
  // glass frame pillars
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.7, 0.1), P.trimBlack, { bone, at: [s * 1.12, 2.7, 2.7], rotation: [-38, 0, 0], flat: true });
  }
  // side slit windows
  for (const s of [1, -1]) {
    box(0.04, 0.34, 1.4, P.glass, [s * 1.36, 2.55, 2.0]);
    lit(box(0.03, 0.06, 1.3, P.neonCyan, [s * 1.375, 2.4, 2.0]), 1.4);
    // door seams + handle
    box(0.03, 1.2, 0.03, P.trimBlack, [s * 1.37, 2.0, 1.25]);
    box(0.03, 1.2, 0.03, P.trimBlack, [s * 1.37, 2.0, 2.75]);
    box(0.03, 0.03, 1.5, P.trimBlack, [s * 1.37, 1.42, 2.0]);
    box(0.05, 0.08, 0.28, P.steel, [s * 1.4, 2.0, 2.6]);
    // side armor plates with bolts
    box(0.08, 0.6, 1.2, ARMORP, [s * 1.38, 1.85, 2.0]);
    for (const z of [1.5, 2.5]) for (const y of [1.65, 2.05]) bolt([s * 1.43, y, z], [s, 0, 0]);
    // hazard stripe on side
    plane(1.4, 0.18, HAZARD, [s * 1.375, 1.52, 3.4], [s, 0, 0]);
    // stencil number
    plane(0.5, 0.25, STENCIL, [s * 1.375, 2.0, 3.45], [s, 0, 0]);
    // wing mirrors
    b.rod([s * 1.38, 2.45, 3.2], [s * 1.75, 2.55, 3.3], 0.025, { bone, color: P.steel });
    box(0.1, 0.38, 0.22, P.trimBlack, [s * 1.78, 2.55, 3.3]);
    box(0.02, 0.32, 0.18, P.glass, [s * 1.84, 2.55, 3.3]);
  }

  // roof edge hazard strips
  for (const s of [1, -1]) {
    box(0.12, 0.08, 1.3, P.trim, [s * 1.25, 3.07, 1.65]);
    box(0.06, 0.04, 1.3, P.trimBlack, [s * 1.25, 3.12, 1.65]);
  }
  box(2.5, 0.08, 0.12, P.trim, [0, 3.07, 1.05]);

  // ---------- front fascia ----------
  // grille
  plane(1.5, 0.75, GRILLE, [0, 1.8, 4.115], [0, 0, 1]);
  box(1.7, 0.08, 0.06, P.trimBlack, [0, 2.2, 4.11]);
  box(1.7, 0.08, 0.06, P.trimBlack, [0, 1.4, 4.11]);
  for (const s of [1, -1]) box(0.08, 0.8, 0.06, P.trimBlack, [s * 0.85, 1.8, 4.11]);
  // emblem
  plane(0.42, 0.42, EMBLEM, [0, 2.0, 4.0 + 0.12], [0, 0, 1]);
  void 0;
  // headlight bars
  for (const s of [1, -1]) {
    box(0.55, 0.16, 0.08, P.trimBlack, [s * 0.95, 2.18, 3.98]);
    lit(box(0.46, 0.09, 0.05, P.lampWhite, [s * 0.95, 2.18, 4.03]), 1.8);
    lit(box(0.18, 0.1, 0.06, P.neonMagenta, [s * 1.3, 2.0, 3.98]), 1.3);
    // front armour wedges
    b.part(new THREE.BoxGeometry(0.25, 0.7, 0.2), ARMORP, { bone, at: [s * 1.3, 1.7, 3.95], flat: true });
  }
  box(2.8, 0.1, 0.1, P.trim, [0, 2.45, 3.1], { rotation: [-18, 0, 0] });

  // ---------- roof light rack ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 3.1, 1.2], [s * 0.95, 3.38, 1.2], 0.03, { bone, color: P.steel });
    b.rod([s * 0.95, 3.1, 1.85], [s * 0.95, 3.38, 1.85], 0.03, { bone, color: P.steel });
  }
  box(2.0, 0.06, 0.1, P.trimBlack, [0, 3.4, 1.2]);
  box(2.0, 0.06, 0.1, P.trimBlack, [0, 3.4, 1.85]);
  for (let i = 0; i < 4; i++) {
    lit(box(0.4, 0.12, 0.12, i % 2 ? P.lampWhite : P.neonCyan, [-0.75 + i * 0.5, 3.38, 1.9]), 1.6);
  }
  // warning beacon
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 8), P.trimBlack, { bone, at: [0.85, 3.12, 1.4], flat: true });
  lit(b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 8), P.neonMagenta, { bone, at: [0.85, 3.23, 1.4], flat: true }), 1.8);

  // ---------- turret ring base at turretRing (0,3,2.2) ----------
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.05],
      [0.55, 0.1],
      [0.55, 0.14],
      [0.48, 0.14],
      [0, 0.14],
    ],
    { at: [0, M.turretRing[1] - 0.14, M.turretRing[2]], segments: 8, color: DARKP, bone },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    bolt([Math.sin(a) * 0.58, 2.93, 2.2 + Math.cos(a) * 0.58], [0, 1, 0]);
  }
  lit(
    b.sweep(
      new THREE.CatmullRomCurve3([]) as any ? [[0, 0, 0], [0, 0, 0]] : [[0, 0, 0], [0, 0, 0]],
      0.001,
      { bone, color: P.neonCyan },
    ),
    0,
  );

  // ---------- antenna array ----------
  b.rod([-1.1, 3.05, 1.2], [-1.1, 4.0 - 0.3, 1.2], [0.025, 0.012], { bone, color: P.steel });
  b.rod([-0.9, 3.05, 1.15], [-0.9, 3.65, 1.15], [0.02, 0.01], { bone, color: P.steel });
  lit(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, { bone, at: [-1.1, 3.72, 1.2] }), 1.8);
  b.rod([1.1, 3.05, 1.15], [1.1, 3.3, 1.15], 0.03, { bone, color: P.steel });
  plane(0.38, 0.38, DISH, [1.1, 3.5, 1.2], [0.3, 0.2, 1], "#ffffff", {});
  plane(0.38, 0.38, DISH, [1.1, 3.5, 1.19], [-0.3, -0.2, -1], "#ffffff", {});

  // ---------- rear wall of the cab (meets flatbed) ----------
  box(2.7, 1.5, 0.1, DARKP, [0, 2.25, 1.05]);
  for (const s of [1, -1]) {
    lit(box(0.12, 0.5, 0.04, P.neonMagenta, [s * 1.15, 2.4, 0.99]), 1.2);
    box(0.2, 0.7, 0.06, P.trimBlack, [s * 0.85, 2.2, 0.98]);
  }
  // rear window ledge hazard
  plane(2.0, 0.2, HAZARD, [0, 1.6, 0.99], [0, 0, -1]);

  // hood vents
  for (let i = 0; i < 4; i++) box(0.9, 0.03, 0.08, P.trimBlack, [0, 2.4 + 0.0, 3.4 + i * 0.1], { rotation: [-18, 0, 0] });
  // roof small bolts
  for (const x of [-1, 1]) for (const z of [1.2, 2.0]) bolt([x * 0.7, 3.1, z], [0, 1, 0]);
  void R;
}
```
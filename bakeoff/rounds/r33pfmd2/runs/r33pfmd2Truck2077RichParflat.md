<!-- call: plan -->

```json
{
  "name": "Warhound X-77 Armored Hauler",
  "description": "A low-poly cyberpunk 2077 militarized six-wheel armored truck with angular plated hull, armored cab, roof turret, neon trim and a cargo bay with cargo pods.",
  "builderName": "warhoundTruck",
  "size": [3.0, 3.2, 8.4],
  "layout": "Long, low, wedge-shaped six-wheeled heavy truck facing +Z. Front: sloped armored bumper with plow blade and light bar at z=4.2. Cab (z 1.6..3.6) is an angular wedge with a slit tinted windshield, side armor skirts and roof sensor mast. Behind the cab, a flat armored cargo bay (z -4.0..1.4) with ribbed containers, rear ramp door and roof rails. A turret ring sits on the roof just behind the cab with twin cannons pointing +Z. Three axles of chunky low-poly wheels with hubs rest on the floor (front axle z=2.9, rear tandem z=-1.6 and z=-3.2). The chassis frame sits between wheels with exposed undercarriage, exhausts and fuel tanks. Style: faceted dark gunmetal plates, hazard yellow stripes, magenta and cyan neon underglow lines, glowing lamps and screens, tiny greeble parts (vents, bolts, antennas, decals) on every surface.",
  "palette": {
    "hull": "#2f3540",
    "hullDark": "#1a1e26",
    "hullLight": "#566072",
    "armor": "#3d4a3f",
    "hazard": "#f2c200",
    "black": "#0b0c10",
    "rubber": "#16171b",
    "rim": "#7b8494",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonRed": "#ff2b3a",
    "glass": "#1b3a52",
    "lamp": "#fff2b0",
    "steel": "#8d96a5",
    "rust": "#7a4a2b",
    "orange": "#ff7a1a",
    "white": "#e8ecf2",
    "gunmetal": "#222831"
  },
  "mounts": {
    "chassisTop": [0, 1.2, 0],
    "cabFloor": [0, 1.2, 2.6],
    "cargoFloor": [0, 1.2, -1.3],
    "turretRing": [0, 2.55, 1.2],
    "frontAxle": [0, 0.65, 2.9],
    "rearAxle1": [0, 0.65, -1.6],
    "rearAxle2": [0, 0.65, -3.2],
    "bumperFront": [0, 0.8, 4.2],
    "rearDoor": [0, 1.9, -4.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.55, 1.2], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.0, 1.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.65, 2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.65, 2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.3, 0.65, -1.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.3, 0.65, -1.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBL", "parent": "body", "at": [1.3, 0.65, -3.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBR", "parent": "body", "at": [-1.3, 0.65, -3.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "rampDoor", "parent": "body", "at": [0, 0.9, -4.2], "dir": [1, 0, 0], "role": "hinge", "group": "cargo" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Undercarriage and frame: two long ladder rails, cross members, differentials on three axles, drive shafts, axle housings, leaf/air suspension arms, twin fuel tanks and side exhaust stacks in steel and black, battery boxes, cyan and magenta underglow strips along the sides, mudflaps, skid plates, tow hooks, bolt rows and hazard stripe trim on the rails. Joints: body only (axle housings and suspension are rigid on body).",
      "box": [[-1.5, 0.3, -4.2], [1.5, 1.2, 4.0]],
      "attaches": "Top face at chassisTop height y=1.2 carries cab and cargo; axle housings end at wheel mounts frontAxle, rearAxle1, rearAxle2 where wheel hubs begin.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "wheels",
      "builds": "Six chunky low-poly wheels (radius 0.65, width 0.55): faceted rubber tires with tread block parts, steel rims with lug nuts, glowing cyan hub rings, armored hubcap domes, brake discs and calipers visible, and a hazard-yellow sidewall stripe. Each wheel rides its own wheel joint, axle along x.",
      "box": [[-1.6, 0.0, -3.9], [1.6, 1.3, 3.6]],
      "attaches": "Centred on the axle mounts frontAxle, rearAxle1, rearAxle2 at x=+-1.3; hub centres at y=0.65.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelBL", "wheelBR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cab",
      "builds": "Armored wedge cab and front end: sloped hull plates, slit tinted windshield glass with cyan HUD glow, side windows with armor shutters, roof sensor mast with antennas and dish, light bar with lamp parts, sloped armored bumper with plow blade, hazard stripes, headlamps and red taillike running lights, door seams and handles, side armor skirts over the front wheel arches, wheel arch fenders, vents, exhaust, decal emblem and unit numbers as small parts, mirrors with cameras. Colours hull, hullLight, armor, glass, hazard, lamp, neonCyan.",
      "box": [[-1.5, 0.8, 1.4], [1.5, 2.6, 4.3]],
      "attaches": "Sits on cabFloor/chassisTop; rear wall at z=1.4 meets cargo front wall; roof top y=2.55 near turretRing; bumper at bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cargo",
      "builds": "Armored cargo bay behind the cab: slab-sided container with paneled plating, ribbing, vents, hatches, roof rails, stacked cargo pods and crates strapped on top, glowing magenta and cyan neon trim lines, hazard-striped rear ramp door on rampDoor joint with hinges and lock bars, rear tail lights, side fenders over rear tandem wheels with mud flaps, ammo lockers, antenna array, fuel cap and tiny serial decals. Colours hull, hullDark, armor, hazard, neonMagenta, orange.",
      "box": [[-1.5, 1.2, -4.3], [1.5, 3.0, 1.4]],
      "attaches": "Floor at cargoFloor y=1.2 on chassis; front wall touches cab at z=1.4; rear door hinge at rearDoor mount; roof y up to 3.0 stays behind the turretRing zone (z>0.4 reserved for turret).",
      "joints": ["body", "rampDoor"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof-mounted remote weapon station: ring base with teeth and bearing, rotating armored turret housing (faceted, on turretYaw), twin barrel cannons on gunPitch with muzzle brakes, heat-shield sleeves, ammo box with belt, sensor eye with glowing red lens, camera pod, missile pod with four tubes on one side, small antenna, hazard stripe, neon red accent lines and bolts. Colours gunmetal, hullLight, steel, neonRed, hazard, black.",
      "box": [[-1.1, 2.55, 0.2], [1.1, 3.3, 3.2]],
      "attaches": "Ring base sits on the roof at mount turretRing (0,2.55,1.2); housing on turretYaw, barrels on gunPitch pointing +Z.",
      "joints": ["body", "turretYaw", "gunPitch"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.65;
  const W = 0.55;
  const GLOW_DARK = "#0a6f78";
  const jointNames = ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelBL", "wheelBR"];
  const zs: Record<string, number> = {
    wheelFL: M.frontAxle[2],
    wheelFR: M.frontAxle[2],
    wheelML: M.rearAxle1[2],
    wheelMR: M.rearAxle1[2],
    wheelBL: M.rearAxle2[2],
    wheelBR: M.rearAxle2[2],
  };
  const r = rng(77);

  // Rotation helper: cylinder axis (Y) -> world X
  const AX: [number, number, number] = [1, 0, 0];

  for (const name of jointNames) {
    const bone = J[name];
    const s = name.endsWith("L") ? 1 : -1;
    const cx = 1.3 * s;
    const cy = M.frontAxle[1];
    const cz = zs[name];
    const out = (d: number): [number, number, number] => [cx + s * d, cy, cz];
    const place = (geo: THREE.BufferGeometry, color: string, d: number, extra: any = {}) =>
      b.part(geo, color, { bone, at: out(d), dir: AX, ...extra, flat: true });

    // Tire: faceted 12-sided cylinder
    place(new THREE.CylinderGeometry(R, R, W, 12), P.rubber, 0);
    // Shoulder bevels
    for (const e of [1, -1]) {
      place(new THREE.CylinderGeometry(R * 0.93, R * 0.99, 0.06, 12), P.black, e * (W / 2 - 0.02) * 1);
    }
    // Tread blocks around circumference
    const nT = 12;
    for (let i = 0; i < nT; i++) {
      const a = (i / nT) * Math.PI * 2 + Math.PI / nT;
      const py = Math.cos(a) * (R + 0.025);
      const pz = Math.sin(a) * (R + 0.025);
      for (const k of [-1, 1]) {
        b.part(new THREE.BoxGeometry(0.2, 0.07, 0.17), P.black, {
          bone,
          at: [cx + k * 0.14, cy + py, cz + pz],
          rotation: [(-a * 180) / Math.PI + 90, 0, 0],
          flat: true,
        });
      }
      // center rib
      b.part(new THREE.BoxGeometry(0.08, 0.05, 0.12), P.gunmetal, {
        bone,
        at: [cx, cy + Math.cos(a + 0.26) * (R + 0.015), cz + Math.sin(a + 0.26) * (R + 0.015)],
        rotation: [(-(a + 0.26) * 180) / Math.PI + 90, 0, 0],
        flat: true,
      });
    }

    // Outer face (s side) details
    const fo = W / 2 + 0.005;
    // Hazard sidewall stripe ring (thin torus-like ring via ring of segments)
    const nS = 16;
    for (let i = 0; i < nS; i++) {
      if (i % 2) continue;
      const a = (i / nS) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.02, 0.2, 0.12), P.hazard, {
        bone,
        at: [cx + s * fo, cy + Math.cos(a) * 0.5, cz + Math.sin(a) * 0.5],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        flat: true,
      });
    }
    // Rim: steel disc
    place(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 12), P.rim, W / 2 - 0.02);
    place(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 12), P.hullDark, W / 2 - 0.045);
    // Rim spokes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.03, 0.08, 0.3), P.steel, {
        bone,
        at: [cx + s * (fo + 0.02), cy + Math.cos(a) * 0.2, cz + Math.sin(a) * 0.2],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        flat: true,
      });
    }
    // Cyan glowing hub ring
    place(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), P.neonCyan, W / 2 + 0.03);
    place(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), GLOW_DARK, W / 2 + 0.035);
    // Armored hubcap dome
    place(new THREE.CylinderGeometry(0.09, 0.14, 0.1, 8), P.hullLight, W / 2 + 0.08);
    place(new THREE.CylinderGeometry(0.0, 0.09, 0.08, 8), P.gunmetal, W / 2 + 0.15);
    place(new THREE.SphereGeometry(0.025, 6, 4), P.neonCyan, W / 2 + 0.2);
    // Lug nuts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.steel, {
        bone,
        at: [cx + s * (fo + 0.04), cy + Math.cos(a) * 0.3, cz + Math.sin(a) * 0.3],
        dir: AX,
        flat: true,
      });
    }
    // Rim edge bolts
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.018, 5, 3), P.black, {
        bone,
        at: [cx + s * (fo + 0.03), cy + Math.cos(a) * 0.37, cz + Math.sin(a) * 0.37],
        flat: true,
      });
    }

    // Inner side: brake disc + caliper (visible toward chassis)
    place(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 12), P.steel, -(W / 2 - 0.08));
    place(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), P.gunmetal, -(W / 2 - 0.1));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.03, 0.04, 0.05), P.black, {
        bone,
        at: [cx - s * (W / 2 - 0.08), cy + Math.cos(a) * 0.22, cz + Math.sin(a) * 0.22],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
        flat: true,
      });
    }
    // Caliper on the rear-top of the disc
    b.part(new THREE.BoxGeometry(0.12, 0.14, 0.2), P.orange, {
      bone,
      at: [cx - s * (W / 2 - 0.08), cy + 0.27, cz - 0.05],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.14, 0.04, 0.08), P.black, {
      bone,
      at: [cx - s * (W / 2 - 0.08), cy + 0.34, cz - 0.05],
      flat: true,
    });
    // Inner glow ring
    place(new THREE.CylinderGeometry(0.34, 0.34, 0.01, 12), P.neonMagenta, -(W / 2 - 0.04));
    // Inner tire hazard marks
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4 + r() * 0.1;
      b.part(new THREE.BoxGeometry(0.02, 0.08, 0.1), P.hazard, {
        bone,
        at: [cx - s * (W / 2 + 0.003), cy + Math.cos(a) * 0.55, cz + Math.sin(a) * 0.55],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
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

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(77);
  const STEEL = P.steel, BLACK = P.black, DARK = P.hullDark, GUN = P.gunmetal;

  // box helper: center, size, color
  const box = (c: number[], s: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone, at: c as any, rotation: rot as any });
  const cyl = (c: number[], r: number, len: number, axis: "x" | "y" | "z", color: string, seg = 8) => {
    const rot = axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0];
    return b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at: c as any, rotation: rot as any });
  };

  const axles = [2.9, -1.6, -3.2];

  // ladder rails
  for (const s of [1, -1]) {
    box([s * 0.75, 0.95, 0], [0.22, 0.5, 8.0], GUN);
    box([s * 0.75, 1.21, 0], [0.26, 0.04, 8.0], DARK);
    box([s * 0.75, 0.72, 0], [0.26, 0.05, 8.0], DARK);
    // hazard trim blocks on outer face
    for (let i = 0; i < 14; i++) {
      const z = -3.8 + i * 0.58;
      box([s * 0.87, 0.95, z], [0.02, 0.22, 0.2], i % 2 ? BLACK : P.hazard, [0, 0, 0]);
    }
    // bolt rows
    for (let i = 0; i < 20; i++) {
      const z = -3.9 + i * 0.4;
      cyl([s * 0.88, 1.13, z], 0.025, 0.03, "x", STEEL, 6);
      cyl([s * 0.88, 0.78, z], 0.025, 0.03, "x", STEEL, 6);
    }
  }

  // cross members
  for (let i = 0; i < 9; i++) {
    const z = -3.8 + i * 0.95;
    box([0, 0.95, z], [1.3, 0.2, 0.14], DARK);
    box([0, 0.95, z], [1.1, 0.06, 0.18], STEEL);
  }

  // axles, differentials, housings, suspension
  axles.forEach((z, k) => {
    cyl([0, 0.65, z], 0.075, 2.6, "x", STEEL, 8);
    const d = b.part(new THREE.SphereGeometry(0.28, 8, 6), GUN, { bone, at: [0, 0.65, z] as any });
    d.mesh.scale.set(1, 0.9, 1.1);
    cyl([0, 0.65, z + 0.2], 0.1, 0.08, "z", P.orange, 6);
    box([0, 0.65, z - 0.25], [0.3, 0.26, 0.1], DARK);
    for (const s of [1, -1]) {
      cyl([s * 1.05, 0.65, z], 0.11, 0.5, "x", DARK, 8);
      cyl([s * 1.25, 0.65, z], 0.13, 0.12, "x", STEEL, 8);
      // leaf springs
      for (let l = 0; l < 4; l++) {
        box([s * 0.9, 0.82 + l * 0.035, z], [0.14, 0.03, 0.9 - l * 0.18], l % 2 ? GUN : STEEL);
      }
      // suspension arms + air bag
      box([s * 0.9, 0.9, z + 0.4], [0.1, 0.4, 0.07], STEEL, [25 * s, 0, 0]);
      cyl([s * 1.0, 1.02, z - 0.3], 0.12, 0.25, "y", BLACK, 8);
      cyl([s * 1.0, 1.15, z - 0.3], 0.13, 0.04, "y", STEEL, 8);
      // shock
      cyl([s * 0.82, 0.92, z - 0.5], 0.03, 0.4, "y", P.neonRed, 6);
      // mudflap
      box([s * 1.45, 0.45, z - 0.78], [0.05, 0.4, 0.4], BLACK);
      box([s * 1.475, 0.58, z - 0.78], [0.01, 0.06, 0.4], P.hazard);
    }
  });

  // drive shafts
  cyl([0, 0.68, 0.65], 0.06, 4.6, "z", STEEL, 6).mesh.rotation.x = Math.PI / 2;
  cyl([0, 0.68, -2.4], 0.06, 1.6, "z", STEEL, 6);
  for (const z of [2.2, 1.0, -0.4, -1.0]) cyl([0, 0.68, z], 0.1, 0.1, "z", GUN, 6);
  // transfer case
  box([0, 0.62, 0.35], [0.5, 0.35, 0.6], GUN);
  box([0, 0.62, 0.35], [0.4, 0.28, 0.65], DARK);

  // fuel tanks
  for (const s of [1, -1]) {
    cyl([s * 1.2, 0.72, 0.5], 0.3, 1.8, "z", STEEL, 10);
    for (const z of [-0.2, 0.5, 1.2]) cyl([s * 1.2, 0.72, z], 0.315, 0.08, "z", GUN, 10);
    cyl([s * 1.2, 0.72, 1.42], 0.2, 0.06, "z", BLACK, 8);
    box([s * 1.2, 0.5, 0.0], [0.08, 0.04, 1.6], P.hazard);
    cyl([s * 1.2, 1.03, 0.9], 0.05, 0.06, "y", P.orange, 6);
    // strap brackets
    for (const z of [-0.1, 1.1]) box([s * 1.2, 0.72, z], [0.62, 0.64, 0.05], DARK);
  }

  // side exhaust stacks (rear of cab area)
  for (const s of [1, -1]) {
    cyl([s * 1.42, 0.95, 1.65], 0.1, 0.9, "y", BLACK, 8);
    cyl([s * 1.42, 1.42, 1.65], 0.12, 0.06, "y", STEEL, 8);
    for (let i = 0; i < 3; i++) cyl([s * 1.42, 0.7 + i * 0.28, 1.65], 0.115, 0.05, "y", STEEL, 8);
    box([s * 1.3, 0.8, 1.65], [0.25, 0.08, 0.12], GUN);
  }

  // battery boxes
  for (const s of [1, -1]) {
    box([s * 0.45, 0.6, 3.2], [0.5, 0.3, 0.7], GUN);
    box([s * 0.45, 0.78, 3.2], [0.4, 0.06, 0.6], P.hazard);
    cyl([s * 0.35, 0.84, 3.05], 0.04, 0.06, "y", P.neonRed, 6);
    cyl([s * 0.55, 0.84, 3.05], 0.04, 0.06, "y", STEEL, 6);
  }

  // skid plates
  box([0, 0.34, 3.6], [1.5, 0.06, 0.8], DARK, [-8, 0, 0]);
  box([0, 0.34, -0.2], [1.2, 0.05, 1.2], GUN);
  box([0, 0.34, -2.4], [1.2, 0.05, 0.8], GUN);
  for (let i = 0; i < 6; i++) box([0, 0.37, -0.7 + i * 0.2], [1.0, 0.02, 0.04], STEEL);

  // underglow strips
  for (const s of [1, -1]) {
    const c = s > 0 ? P.neonCyan : P.neonMagenta;
    const c2 = s > 0 ? P.neonMagenta : P.neonCyan;
    box([s * 1.4, 0.4, 0.2], [0.05, 0.05, 7.4], c);
    box([s * 1.4, 0.33, 0.2], [0.03, 0.03, 7.4], c2);
    box([s * 1.4, 0.4, 3.9], [0.05, 0.05, 0.1], c);
  }
  box([0, 0.32, 3.95], [1.9, 0.04, 0.05], P.neonCyan);
  box([0, 0.32, -4.15], [1.9, 0.04, 0.05], P.neonMagenta);

  // tow hooks
  for (const s of [1, -1]) {
    box([s * 0.5, 0.55, 4.02], [0.14, 0.14, 0.14], DARK);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.orange, { bone, at: [s * 0.5, 0.55, 4.14] as any });
    box([s * 0.5, 0.55, -4.1], [0.14, 0.14, 0.14], DARK);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.orange, { bone, at: [s * 0.5, 0.55, -4.2] as any });
  }
  // rear bumper beam + hitch
  box([0, 0.75, -4.1], [2.0, 0.22, 0.18], GUN);
  box([0, 0.75, -4.2], [1.6, 0.06, 0.06], P.hazard);
  cyl([0, 0.7, -4.0], 0.09, 0.3, "y", STEEL, 8);

  // pipes / wiring greeble
  for (const s of [1, -1]) {
    cyl([s * 0.5, 0.62, -1.4], 0.025, 5.4, "z", P.rust, 5).mesh.rotation.x = Math.PI / 2;
    cyl([s * 0.38, 0.58, -1.4], 0.02, 5.0, "z", P.neonRed, 5).mesh.rotation.x = Math.PI / 2;
  }
  // little lights on cross members
  for (let i = 0; i < 8; i++) {
    const z = -3.4 + i * 0.95 + R() * 0.1;
    cyl([0, 0.84, z], 0.025, 0.04, "y", i % 2 ? P.neonCyan : P.neonMagenta, 6);
  }
}
```

<!-- call: cargo -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargo({ b, J, P, M }: Ctx) {
  const R = rng(77);
  const body = J.body;
  const ramp = J.rampDoor;

  // box helper: center, size, color, bone
  const box = (c: number[], s: number[], col: string, bone: any = body, flat = true) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: c as any, flat });
  const cyl = (c: number[], r: number, h: number, col: string, axis: number[], seg = 8, bone: any = body) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at: c as any, dir: axis as any, flat: true });
  const lit = (c: number[], s: number[], col: string, st = 1.5, bone: any = body) =>
    glow(box(c, s, col, bone), st);

  // ---- main container shell
  box([0, 2.0, -1.45], [2.9, 1.6, 5.7], P.hull);
  // lower skirt plate darker
  box([0, 1.4, -1.45], [3.0, 0.4, 5.8], P.hullDark);
  // roof slab
  box([0, 2.85, -1.45], [2.8, 0.1, 5.6], P.hullLight);
  // front wall armor (touches cab)
  box([0, 2.1, 1.33], [2.9, 1.5, 0.12], P.armor);
  // chamfer rear top
  b.part(new THREE.BoxGeometry(2.8, 0.2, 0.3), P.armor, { bone: body, at: [0, 2.9, -4.2], rotation: [30, 0, 0], flat: true });

  // ---- side panels, ribs, vents, neon (both sides)
  for (const s of [1, -1]) {
    const x = s * 1.46;
    // armor panels
    for (let i = 0; i < 4; i++) {
      const z = 0.7 - i * 1.4;
      box([x + s * 0.02, 2.1, z], [0.06, 1.2, 1.25], i % 2 ? P.armor : P.hullLight);
      // bolts on panel corners
      for (const dz of [-0.5, 0.5])
        for (const dy of [-0.5, 0.5])
          cyl([x + s * 0.07, 2.1 + dy, z + dz], 0.035, 0.04, P.steel, [s, 0, 0], 6);
    }
    // ribs vertical
    for (let i = 0; i < 9; i++) box([x + s * 0.05, 2.15, 1.1 - i * 0.65], [0.08, 1.45, 0.07], P.hullDark);
    // neon trim lines
    lit([x + s * 0.04, 1.5, -1.45], [0.04, 0.06, 5.5], P.neonMagenta, 2);
    lit([x + s * 0.04, 2.78, -1.45], [0.04, 0.05, 5.4], P.neonCyan, 2);
    // vents
    for (let i = 0; i < 5; i++) box([x + s * 0.06, 2.45 + i * 0.0, 0.5 - 0 + 0], [0.02, 0.02, 0.02], P.black);
    for (let k = 0; k < 5; k++) box([x + s * 0.08, 2.4 - k * 0.07, -0.2], [0.03, 0.04, 0.5], P.black);
    // ammo locker with hazard
    box([x + s * 0.1, 2.0, -2.2], [0.12, 0.7, 0.9], P.hullDark);
    box([x + s * 0.17, 2.0, -2.2], [0.03, 0.6, 0.8], P.armor);
    box([x + s * 0.2, 2.0, -2.2], [0.02, 0.06, 0.12], P.steel);
    for (let i = 0; i < 4; i++) box([x + s * 0.2, 2.25 - i * 0.0, -1.9 - 0 - i * 0.2], [0.02, 0.03, 0.03], P.black);
    // fuel cap
    if (s > 0) {
      cyl([x + 0.1, 1.75, -0.9], 0.1, 0.06, P.steel, [1, 0, 0], 8);
      cyl([x + 0.14, 1.75, -0.9], 0.05, 0.04, P.hullDark, [1, 0, 0], 6);
    }
    // serial decal bars
    for (let i = 0; i < 5; i++) box([x + s * 0.08, 2.5, -3.3 - i * 0.0 + i * 0.1 - 0.2], [0.02, 0.1, 0.05], P.white);
    box([x + s * 0.09, 2.4, -3.9], [0.02, 0.2, 0.4], P.hazard);

    // fenders over rear tandem wheels
    box([s * 1.4, 1.45, -2.4], [0.5, 0.1, 2.9], P.hullDark);
    box([s * 1.62, 1.35, -2.4], [0.08, 0.35, 2.9], P.armor);
    box([s * 1.4, 1.62, -2.4], [0.46, 0.04, 2.8], P.hazard);
    for (let i = 0; i < 6; i++) box([s * 1.4, 1.5, -1.2 - i * 0.5], [0.4, 0.02, 0.2], P.black);
    // mudflaps
    for (const z of [-4.0, -0.9]) {
      box([s * 1.4, 0.95, z], [0.5, 0.6, 0.05], P.rubber);
      box([s * 1.4, 1.2, z - 0.03], [0.5, 0.05, 0.02], P.hazard);
    }
    // rear tail lights
    lit([s * 1.25, 1.75, -4.3], [0.25, 0.14, 0.05], P.neonRed, 2.2);
    box([s * 1.25, 1.75, -4.33], [0.3, 0.2, 0.03], P.black);
    lit([s * 1.25, 1.5, -4.3], [0.2, 0.06, 0.05], P.orange, 1.8);
  }

  // ---- roof: rails, pods, crates
  for (const s of [1, -1]) {
    box([s * 1.3, 3.0, -1.5], [0.06, 0.12, 5.4], P.steel);
    for (let i = 0; i < 7; i++) box([s * 1.3, 2.93, 0.8 - i * 0.9], [0.06, 0.1, 0.07], P.steel);
  }
  lit([0, 2.91, -1.45], [0.05, 0.02, 5.2], P.neonCyan, 1.8);
  // cargo pods (cylinders along z)
  for (let i = 0; i < 2; i++) {
    const z = -0.6 - i * 1.5;
    cyl([-0.55, 3.2, z], 0.3, 1.3, i ? P.orange : P.armor, [0, 0, 1], 8);
    cyl([-0.55, 3.2, z + 0.67], 0.2, 0.04, P.hullDark, [0, 0, 1], 8);
    cyl([-0.55, 3.2, z - 0.67], 0.2, 0.04, P.hullDark, [0, 0, 1], 8);
    // straps
    for (const dz of [-0.4, 0.4]) box([-0.55, 3.2, z + dz], [0.64, 0.64, 0.05], P.black);
  }
  // crates
  box([0.6, 3.18, -1.0], [0.8, 0.5, 0.9], P.hullLight);
  box([0.6, 3.18, -1.0], [0.82, 0.08, 0.2], P.hazard);
  box([0.65, 3.65 - 0.2, -1.1], [0.55, 0.4, 0.6], P.rust);
  box([0.6, 3.17, -2.4], [0.8, 0.45, 1.0], P.armor);
  box([0.6, 3.17, -2.4], [0.84, 0.05, 0.08], P.hazard);
  box([0.6, 3.17, -3.5], [0.7, 0.4, 0.6], P.hullLight);
  box([-0.5, 3.15, -3.5], [0.9, 0.35, 0.7], P.orange);
  // strap lines over crates
  for (const z of [-0.8, -2.2]) box([0.6, 3.0, z], [0.86, 0.01, 0.05], P.black);

  // hatches on roof
  box([0, 2.92, 0.2], [0.7, 0.06, 0.5], P.hullDark);
  cyl([0, 2.96, 0.2], 0.12, 0.05, P.steel, [0, 1, 0], 8);
  box([0.0, 2.92, -3.9], [1.0, 0.05, 0.4], P.hullDark);
  for (let k = 0; k < 4; k++) box([0, 2.96, -3.8 - k * 0.0 - 0.1 + k * 0.07], [0.9, 0.02, 0.03], P.black);

  // antenna array
  for (let i = 0; i < 3; i++) {
    const x = 1.1 - i * 0.12;
    b.rod([x, 2.9, -3.7 + i * 0.1], [x + 0.03, 3.0 + 0.0, -3.7 + i * 0.1], 0.015, P.steel, { bone: body });
  }
  b.rod([1.2, 2.9, -3.6], [1.25, 3.0, -3.6], 0.012, P.steel, { bone: body });
  b.rod([-1.2, 2.9, -3.9], [-1.25, 3.0, -3.9], 0.012, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonRed, { bone: body, at: [-1.25, 3.0, -3.9] }), 2);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [1.25, 3.0, -3.6] }), 2);
  box([-1.0, 2.95, -3.5], [0.2, 0.1, 0.2], P.hullDark);

  // ---- rear: frame around door
  box([0, 2.6, -4.32], [2.9, 0.3, 0.1], P.armor);
  box([0, 1.45, -4.32], [2.9, 0.3, 0.1], P.armor);
  for (const s of [1, -1]) box([s * 1.35, 2.0, -4.32], [0.2, 1.3, 0.1], P.armor);

  // ---- ramp door (on rampDoor joint, hinge at y=0.9, z=-4.2)
  const doorTop = ramp;
  const dc = (y: number, z: number) => [0, y, z];
  box(dc(1.5, -4.28), [2.4, 1.2, 0.1], P.hull, doorTop);
  // hazard diagonal stripes
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.BoxGeometry(0.2, 1.3, 0.03), P.hazard, {
      bone: doorTop, at: [-1.0 + i * 0.4, 1.5, -4.345], rotation: [0, 0, 28], flat: true,
    });
  }
  box(dc(1.5, -4.36), [2.0, 0.05, 0.02], P.black, doorTop);
  // frame border
  box(dc(2.08, -4.34), [2.4, 0.06, 0.05], P.hullDark, doorTop);
  box(dc(0.92, -4.34), [2.4, 0.06, 0.05], P.hullDark, doorTop);
  for (const s of [1, -1]) {
    box([s * 1.17, 1.5, -4.34], [0.06, 1.2, 0.05], P.hullDark, doorTop);
    // hinges
    cyl([s * 1.1, 0.92, -4.27], 0.06, 0.3, P.steel, [1, 0, 0], 6, doorTop);
    // lock bars
    box([s * 0.75, 2.0, -4.38], [0.1, 0.08, 0.06], P.steel, doorTop);
    cyl([s * 0.75, 1.5, -4.38], 0.05, 0.12, P.steel, [0, 0, 1], 6, doorTop);
  }
  box(dc(1.5, -4.4), [1.8, 0.06, 0.04], P.steel, doorTop);
  lit(dc(1.05, -4.37), [1.6, 0.04, 0.03], P.neonMagenta, 2, doorTop);
  cyl(dc(1.6, -4.41), 0.08, 0.05, P.hullDark, [0, 0, 1], 8, doorTop);
  // door bolts
  for (let i = 0; i < 6; i++) cyl([-1.0 + i * 0.4, 2.0, -4.37], 0.03, 0.03, P.steel, [0, 0, 1], 6, doorTop);

  // ---- front wall details
  lit([0, 2.65, 1.28], [2.4, 0.04, 0.03], P.neonCyan, 1.6);
  for (let i = 0; i < 6; i++) box([-1.0 + i * 0.4, 1.9, 1.28], [0.3, 0.7, 0.04], P.hullDark);
  lit([-1.2, 1.5, 1.28], [0.1, 0.1, 0.03], P.neonMagenta, 2);
  lit([1.2, 1.5, 1.28], [0.1, 0.1, 0.03], P.orange, 2);

  // ---- underside plate & trim
  box([0, 1.25, -1.45], [2.7, 0.1, 5.6], P.black);
  for (const s of [1, -1]) box([s * 1.5, 1.28, -1.45], [0.04, 0.05, 5.6], P.hazard);
  // pod label decals on top
  for (let i = 0; i < 3; i++) box([-0.55 + i * 0.1 - 0.1, 3.51, -0.6], [0.06, 0.01, 0.15], P.white);
  void R; void frame; void M;
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(77);
  const ring = M.turretRing; // [0,2.55,1.2]
  const RX = ring[0], RY = ring[1], RZ = ring[2];

  // Generic box/cylinder helpers. bone defaults to turretYaw.
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any = J.turretYaw, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: at as any, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], bone: any = J.turretYaw, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at: at as any, rotation: rot as any, flat: true });
  // Cylinder along z
  const barrelZ = (r0: number, r1: number, len: number, seg: number, color: string, at: number[], bone: any) =>
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, { bone, at: at as any, rotation: [90, 0, 0], flat: true });

  // ---------- Ring base (on body) ----------
  cyl(0.95, 1.0, 0.1, 16, P.hullDark, [RX, RY + 0.05, RZ], J.body);
  cyl(0.85, 0.85, 0.06, 16, P.black, [RX, RY + 0.13, RZ], J.body);
  cyl(0.9, 0.9, 0.05, 16, P.steel, [RX, RY + 0.19, RZ], J.body);
  // teeth around ring
  const teeth = 24;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.09, 0.06, 0.07), P.hullLight, {
      bone: J.body,
      at: [RX + Math.sin(a) * 0.97, RY + 0.1, RZ + Math.cos(a) * 0.97] as any,
      rotation: [0, (a * 180) / Math.PI, 0] as any,
    });
  }
  // bolts on ring top
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.black, {
      bone: J.body,
      at: [RX + Math.sin(a) * 0.9, RY + 0.225, RZ + Math.cos(a) * 0.9] as any,
    });
  }
  // red neon ring accent
  glow(cyl(0.93, 0.93, 0.015, 16, P.neonRed, [RX, RY + 0.115, RZ], J.body), 1.4);
  // hazard segments on ring
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.BoxGeometry(0.2, 0.02, 0.07), P.hazard, {
      bone: J.body,
      at: [RX + Math.sin(a) * 0.8, RY + 0.215, RZ + Math.cos(a) * 0.8] as any,
      rotation: [0, (a * 180) / Math.PI, 0] as any,
    });
  }

  // ---------- Rotating turntable ----------
  const base = RY + 0.24;
  cyl(0.8, 0.85, 0.12, 12, P.gunmetal, [RX, base, RZ]);
  cyl(0.6, 0.7, 0.2, 8, P.hullDark, [RX, base + 0.14, RZ]);

  // ---------- Housing (faceted) ----------
  const hy = base + 0.45;
  // main body
  box(1.2, 0.4, 1.1, P.gunmetal, [RX, hy, RZ]);
  // sloped front glacis
  box(1.1, 0.12, 0.6, P.hullLight, [RX, hy + 0.1, RZ + 0.65], J.turretYaw, [-28, 0, 0]);
  // sloped top
  box(1.1, 0.1, 0.8, P.hullLight, [RX, hy + 0.26, RZ - 0.05], J.turretYaw, [-6, 0, 0]);
  // side cheeks angled
  for (const s of [1, -1]) {
    box(0.12, 0.38, 1.0, P.hullLight, [RX + s * 0.64, hy, RZ - 0.02], J.turretYaw, [0, 0, s * 12]);
    box(0.05, 0.3, 0.9, P.hullDark, [RX + s * 0.7, hy, RZ - 0.02], J.turretYaw, [0, 0, s * 12]);
    // side rivet strip
    for (let k = 0; k < 4; k++)
      cyl(0.022, 0.022, 0.03, 6, P.steel, [RX + s * 0.73, hy + 0.1, RZ - 0.4 + k * 0.27], J.turretYaw, [0, 0, 90]);
    // vents
    for (let k = 0; k < 3; k++)
      box(0.02, 0.025, 0.2, P.black, [RX + s * 0.735, hy - 0.08 - k * 0.05, RZ - 0.25], J.turretYaw);
  }
  // rear bustle
  box(1.0, 0.36, 0.35, P.hullDark, [RX, hy + 0.02, RZ - 0.7]);
  box(0.9, 0.08, 0.3, P.hullLight, [RX, hy + 0.24, RZ - 0.7], J.turretYaw, [8, 0, 0]);
  // rear vent grille
  for (let k = 0; k < 4; k++) box(0.6, 0.02, 0.02, P.black, [RX, hy - 0.1 + k * 0.07, RZ - 0.89]);
  // hazard stripe on front edge
  for (let k = -2; k <= 2; k++)
    box(0.12, 0.025, 0.05, k % 2 ? P.hazard : P.black, [RX + k * 0.2, hy + 0.2, RZ + 0.89], J.turretYaw, [-28, 0, 0]);
  // neon red accent lines
  for (const s of [1, -1]) {
    glow(box(0.02, 0.02, 0.9, P.neonRed, [RX + s * 0.55, hy + 0.2, RZ - 0.1], J.turretYaw), 1.5);
    glow(box(0.02, 0.1, 0.02, P.neonRed, [RX + s * 0.4, hy - 0.05, RZ + 0.56], J.turretYaw), 1.5);
  }
  // top hatch
  cyl(0.2, 0.22, 0.06, 8, P.steel, [RX - 0.25, hy + 0.34, RZ - 0.25]);
  cyl(0.06, 0.06, 0.05, 6, P.black, [RX - 0.25, hy + 0.39, RZ - 0.25]);
  // bolts on top
  for (let i = 0; i < 6; i++)
    cyl(0.02, 0.02, 0.03, 6, P.steel, [RX + (i % 2 ? 0.4 : -0.4) + (R() - 0.5) * 0.03, hy + 0.32, RZ - 0.5 + Math.floor(i / 2) * 0.25]);

  // ---------- Mantlet & gun cradle ----------
  const gy = hy + 0.05;
  const gz = RZ + 0.65;
  box(0.9, 0.34, 0.14, P.hullDark, [RX, gy, gz + 0.02]);
  box(0.8, 0.06, 0.12, P.steel, [RX, gy + 0.2, gz + 0.04]);
  for (const s of [1, -1]) cyl(0.08, 0.08, 0.1, 8, P.steel, [RX + s * 0.46, gy, gz + 0.03], J.turretYaw, [0, 0, 90]);

  // ---------- Twin cannons (gunPitch) ----------
  for (const s of [1, -1]) {
    const x = RX + s * 0.27;
    // breech block
    box(0.22, 0.22, 0.4, P.hullDark, [x, gy, gz - 0.1], J.gunPitch);
    // recoil sleeve
    barrelZ(0.1, 0.1, 0.55, 8, P.hullLight, [x, gy, gz + 0.3], J.gunPitch);
    // heat shield sleeve
    barrelZ(0.115, 0.115, 0.9, 8, P.gunmetal, [x, gy, gz + 0.85], J.gunPitch);
    for (let k = 0; k < 4; k++)
      barrelZ(0.13, 0.13, 0.05, 8, P.black, [x, gy, gz + 0.5 + k * 0.22], J.gunPitch);
    // vent holes on sleeve
    for (let k = 0; k < 3; k++)
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.06), P.black, { bone: J.gunPitch, at: [x, gy + 0.12, gz + 0.62 + k * 0.25] as any });
    // barrel
    barrelZ(0.055, 0.055, 1.0, 8, P.steel, [x, gy, gz + 1.3], J.gunPitch);
    // muzzle brake
    barrelZ(0.1, 0.1, 0.26, 8, P.gunmetal, [x, gy, gz + 1.9], J.gunPitch);
    barrelZ(0.115, 0.115, 0.04, 8, P.hullLight, [x, gy, gz + 1.78], J.gunPitch);
    barrelZ(0.115, 0.115, 0.04, 8, P.hullLight, [x, gy, gz + 2.02], J.gunPitch);
    for (let k = 0; k < 3; k++) {
      box(0.24, 0.025, 0.04, P.black, [x, gy, gz + 1.84 + k * 0.08], J.gunPitch);
    }
    // bore
    barrelZ(0.04, 0.04, 0.02, 8, P.black, [x, gy, gz + 2.03], J.gunPitch);
    // hazard band on sleeve
    barrelZ(0.12, 0.12, 0.06, 8, P.hazard, [x, gy, gz + 1.2], J.gunPitch);
    // red heat glow ring
    glow(barrelZ(0.062, 0.062, 0.03, 8, P.neonRed, [x, gy, gz + 1.5], J.gunPitch), 1.4);
  }
  // linking bridge between barrels
  box(0.3, 0.1, 0.12, P.steel, [RX, gy, gz + 0.9], J.gunPitch);
  box(0.4, 0.06, 0.1, P.steel, [RX, gy, gz + 1.6], J.gunPitch);

  // ---------- Ammo box with belt (right side, -x) ----------
  const ax = RX - 0.8;
  box(0.3, 0.3, 0.5, P.armor, [ax, hy - 0.02, RZ + 0.1]);
  box(0.32, 0.04, 0.52, P.hazard, [ax, hy + 0.14, RZ + 0.1]);
  box(0.12, 0.05, 0.08, P.steel, [ax, hy + 0.18, RZ + 0.1]);
  for (let k = 0; k < 6; k++)
    cyl(0.025, 0.025, 0.08, 6, P.hazard, [ax + 0.2 + k * 0.08 * 0.8, hy + 0.08 + k * 0.02, RZ + 0.5 + k * 0.1], J.turretYaw, [0, 0, 70]);
  for (let k = 0; k < 4; k++) {
    cyl(0.022, 0.022, 0.07, 6, P.steel, [ax + 0.1 + k * 0.1, hy + 0.0 + k * 0.01, RZ + 0.38 + k * 0.1], J.turretYaw, [90, 0, 0]);
  }

  // ---------- Missile pod (left side, +x) ----------
  const mx = RX + 0.85;
  const my = hy + 0.25;
  box(0.4, 0.4, 0.7, P.hullDark, [mx, my, RZ + 0.1]);
  box(0.42, 0.04, 0.72, P.hullLight, [mx, my + 0.21, RZ + 0.1]);
  box(0.08, 0.3, 0.3, P.gunmetal, [mx - 0.2, my - 0.1, RZ - 0.0], J.turretYaw);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const tx = mx + (i - 0.5) * 0.17;
      const ty = my + (j - 0.5) * 0.17;
      cyl(0.075, 0.075, 0.06, 8, P.black, [tx, ty, RZ + 0.47], J.turretYaw, [90, 0, 0]);
      cyl(0.085, 0.085, 0.03, 8, P.steel, [tx, ty, RZ + 0.45], J.turretYaw, [90, 0, 0]);
      glow(cyl(0.035, 0.035, 0.02, 6, P.neonRed, [tx, ty, RZ + 0.49], J.turretYaw, [90, 0, 0]), 1.2);
    }
  box(0.4, 0.05, 0.05, P.hazard, [mx, my + 0.12 - 0.31 + 0.31, RZ + 0.42]);
  // hazard stripe back of pod
  for (let k = 0; k < 3; k++) box(0.1, 0.4, 0.02, k % 2 ? P.hazard : P.black, [mx - 0.14 + k * 0.14, my, RZ - 0.26]);

  // ---------- Sensor eye (front, above guns) ----------
  const ey = hy + 0.34;
  box(0.34, 0.2, 0.3, P.hullDark, [RX, ey, RZ + 0.3]);
  cyl(0.11, 0.11, 0.12, 10, P.black, [RX, ey, RZ + 0.5], J.turretYaw, [90, 0, 0]);
  glow(cyl(0.075, 0.075, 0.03, 10, P.neonRed, [RX, ey, RZ + 0.57], J.turretYaw, [90, 0, 0]), 2);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.white, { bone: J.turretYaw, at: [RX + 0.03, ey + 0.03, RZ + 0.59] as any });
  box(0.4, 0.03, 0.16, P.hullLight, [RX, ey + 0.12, RZ + 0.5], J.turretYaw, [-15, 0, 0]);

  // ---------- Camera pod (rear-left top) ----------
  const cx = RX + 0.45;
  cyl(0.05, 0.07, 0.12, 6, P.steel, [cx, hy + 0.4, RZ - 0.4]);
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.hullLight, { bone: J.turretYaw, at: [cx, hy + 0.52, RZ - 0.4] as any, flat: true });
  cyl(0.04, 0.04, 0.08, 6, P.black, [cx, hy + 0.53, RZ - 0.3], J.turretYaw, [90, 0, 0]);
  glow(cyl(0.025, 0.025, 0.02, 6, P.neonRed, [cx, hy + 0.53, RZ - 0.25], J.turretYaw, [90, 0, 0]), 1.6);

  // ---------- Antenna ----------
  const anx = RX - 0.5;
  cyl(0.02, 0.03, 0.1, 6, P.black, [anx, hy + 0.37, RZ - 0.6]);
  b.rod([anx, hy + 0.4, RZ - 0.6], [anx - 0.05, hy + 0.78 > 3.28 ? 3.28 : hy + 0.78, RZ - 0.62], [0.012, 0.006], P.steel, { bone: J.turretYaw });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonRed, { bone: J.turretYaw, at: [anx - 0.05, 3.29, RZ - 0.62] as any }), 2);

  // ---------- Extra greeble: side lamps, rear markers ----------
  for (const s of [1, -1]) {
    box(0.06, 0.06, 0.04, P.black, [RX + s * 0.45, hy - 0.12, RZ + 0.57]);
    glow(box(0.04, 0.04, 0.02, P.neonRed, [RX + s * 0.45, hy - 0.12, RZ + 0.6], J.turretYaw), 1.4);
    glow(box(0.3, 0.025, 0.02, P.neonRed, [RX + s * 0.25, hy - 0.15, RZ - 0.89], J.turretYaw), 1.4);
  }
  // serial decal blocks on rear
  for (let k = 0; k < 4; k++) box(0.05, 0.04, 0.01, P.white, [RX - 0.2 + k * 0.08, hy + 0.15, RZ - 0.885]);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(77);
  const box = (
    s: [number, number, number],
    color: string,
    at: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
  ) => b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, { bone, at, rotation: rot });
  const cyl = (
    r0: number,
    r1: number,
    h: number,
    color: string,
    at: [number, number, number],
    rot: [number, number, number] = [0, 0, 0],
    seg = 8,
  ) => b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, rotation: rot, flat: true });
  const lamp = (s: [number, number, number], color: string, at: [number, number, number], k = 1.5) =>
    glow(box(s, color, at), k);

  // ---- main wedge hull ----
  box([2.3, 1.2, 1.9], P.hull, [0, 1.9, 2.35]); // cab block z1.4..3.3 y1.3..2.5
  box([2.2, 0.12, 1.5], P.hullLight, [0, 2.54, 2.2]); // roof plate
  box([2.0, 0.08, 1.2], P.armor, [0, 2.6, 2.15]); // roof armor
  box([2.4, 0.5, 1.9], P.hullDark, [0, 1.35, 2.35]); // lower sill
  // hood slope
  box([2.2, 0.14, 1.0], P.hullLight, [0, 1.85, 3.75], [14, 0, 0]);
  box([2.3, 0.5, 0.9], P.hull, [0, 1.55, 3.7]);
  box([0.9, 0.06, 0.6], P.hullDark, [0, 1.99, 3.8], [14, 0, 0]); // hood scoop base
  for (let i = 0; i < 5; i++) box([0.7, 0.02, 0.04], P.black, [0, 2.02 - i * 0.002, 3.6 + i * 0.1], [14, 0, 0]);
  // hood center hazard
  box([0.12, 0.02, 0.8], P.hazard, [0.5, 2.01, 3.75], [14, 0, 0]);
  box([0.12, 0.02, 0.8], P.hazard, [-0.5, 2.01, 3.75], [14, 0, 0]);

  // ---- windshield (sloped) ----
  box([2.1, 0.7, 0.1], P.hullLight, [0, 2.27, 3.0], [51, 0, 0]); // frame
  box([1.9, 0.38, 0.06], P.glass, [0, 2.3, 3.04], [51, 0, 0]);
  glow(box([1.5, 0.02, 0.05], P.neonCyan, [0, 2.36, 3.075], [51, 0, 0]), 1.2); // HUD glow
  box([1.9, 0.03, 0.07], P.black, [0, 2.17, 3.1], [51, 0, 0]);
  for (const s of [1, -1]) box([0.06, 0.4, 0.07], P.black, [s * 0.5, 2.3, 3.06], [51, 0, 0]);
  // wipers
  for (const s of [1, -1]) box([0.5, 0.02, 0.02], P.black, [s * 0.4, 2.12, 3.15], [51, 0, 12 * s]);

  // ---- sides ----
  for (const s of [1, -1]) {
    const x = s * 1.16;
    // side window + shutter
    box([0.04, 0.34, 0.9], P.glass, [x, 2.18, 2.45]);
    box([0.05, 0.05, 1.0], P.black, [x, 2.38, 2.45]);
    box([0.05, 0.05, 1.0], P.black, [x, 1.98, 2.45]);
    box([0.07, 0.12, 0.96], P.armor, [x, 2.5, 2.45], [0, 0, s * 20]); // shutter hood
    glow(box([0.03, 0.02, 0.8], P.neonCyan, [x + s * 0.01, 2.18, 2.45]), 0.8);
    // door seams
    for (const z of [1.75, 2.9]) box([0.03, 1.0, 0.025], P.black, [x, 1.9, z]);
    box([0.03, 0.025, 1.15], P.black, [x, 1.4, 2.32]);
    // handle
    box([0.06, 0.05, 0.22], P.steel, [x + s * 0.03, 1.85, 2.75]);
    // armor plate panels
    box([0.06, 0.4, 0.8], P.armor, [x + s * 0.02, 1.65, 2.3]);
    for (let i = 0; i < 4; i++) cyl(0.025, 0.025, 0.04, P.steel, [x + s * 0.06, 1.5 + (i % 2) * 0.3, 2.0 + i * 0.25], [0, 0, 90], 6);
    // hazard stripe diagonals
    for (let i = 0; i < 4; i++) box([0.02, 0.06, 0.2], P.hazard, [x + s * 0.01, 1.42, 1.6 + i * 0.3], [s * 40, 0, 0]);
    // unit number blocks
    for (let i = 0; i < 3; i++) box([0.02, 0.18 + (i % 2) * 0.04, 0.07], P.white, [x + s * 0.02, 1.8, 1.95 + i * 0.1]);
    // vents on rear side
    for (let i = 0; i < 4; i++) box([0.03, 0.03, 0.3], P.black, [x + s * 0.01, 2.2 - i * 0.07 + 0.0, 1.62]);

    // fenders over front wheel arches
    box([0.62, 0.1, 1.5], P.armor, [s * 1.3, 1.42, 2.9]);
    box([0.62, 0.1, 0.5], P.armor, [s * 1.3, 1.3, 3.75], [-25, 0, 0]);
    box([0.62, 0.1, 0.5], P.armor, [s * 1.3, 1.3, 2.05], [25, 0, 0]);
    box([0.06, 0.3, 1.6], P.hullDark, [s * 1.6, 1.3, 2.9]);
    box([0.07, 0.04, 1.6], P.hazard, [s * 1.6, 1.46, 2.9]);
    for (let i = 0; i < 5; i++) cyl(0.03, 0.03, 0.04, P.steel, [s * 1.6, 1.3, 2.2 + i * 0.35], [0, 0, 90], 6);
    // side skirts
    box([0.08, 0.34, 1.9], P.armor, [s * 1.52, 0.98, 3.0]);
    box([0.1, 0.05, 1.9], P.hullLight, [s * 1.52, 1.18, 3.0]);
    box([0.05, 0.03, 1.8], P.neonCyan, [s * 1.57, 0.85, 3.0]);

    // mirror + camera
    box([0.05, 0.05, 0.3], P.black, [s * 1.3, 2.15, 3.0], [0, s * 20, 0]);
    box([0.1, 0.26, 0.16], P.hullDark, [s * 1.45, 2.1, 3.1]);
    lamp([0.02, 0.08, 0.08], P.neonCyan, [s * 1.45, 2.1, 3.19], 1.2);
    cyl(0.04, 0.04, 0.08, P.black, [s * 1.45, 2.28, 3.1], [90, 0, 0], 6);

    // headlamps
    lamp([0.34, 0.2, 0.1], P.lamp, [s * 0.85, 1.65, 4.18], 2);
    box([0.4, 0.26, 0.06], P.black, [s * 0.85, 1.65, 4.14]);
    box([0.44, 0.04, 0.12], P.hazard, [s * 0.85, 1.8, 4.14]);
    lamp([0.12, 0.08, 0.06], P.neonCyan, [s * 1.12, 1.65, 4.17]);
    // running red lights at rear of cab
    lamp([0.08, 0.3, 0.05], P.neonRed, [s * 1.1, 2.3, 1.38]);
    lamp([0.1, 0.1, 0.1], P.neonRed, [s * 1.18, 1.5, 4.0], 1.2);
    // bumper corner bolts
    for (let i = 0; i < 3; i++) cyl(0.04, 0.04, 0.05, P.steel, [s * (0.5 + i * 0.4), 1.0, 4.26], [90, 0, 0], 6);
    // tow hook
    box([0.1, 0.1, 0.2], P.steel, [s * 0.6, 0.75, 4.25]);
    // plow side wings
    box([0.1, 0.55, 0.5], P.armor, [s * 1.32, 0.85, 4.15], [0, s * -25, 0]);
    // exhaust stacks behind cab
    cyl(0.09, 0.09, 1.3, P.steel, [s * 1.3, 2.1, 1.55]);
    cyl(0.11, 0.11, 0.1, P.black, [s * 1.3, 2.78, 1.55]);
    for (let i = 0; i < 3; i++) cyl(0.115, 0.115, 0.04, P.hazard, [s * 1.3, 1.6 + i * 0.35, 1.55], [0, 0, 0], 8);
    box([0.14, 0.1, 0.1], P.hullDark, [s * 1.3, 1.5, 1.7]);
    // roof side lamps
    lamp([0.1, 0.06, 0.1], P.lamp, [s * 1.05, 2.64, 3.05], 1.5);
  }

  // ---- grille / front face ----
  box([2.2, 0.6, 0.12], P.hullDark, [0, 1.55, 4.1]);
  for (let i = 0; i < 6; i++) box([1.0, 0.03, 0.04], P.black, [0, 1.35 + i * 0.08, 4.17]);
  box([0.5, 0.5, 0.05], P.hullLight, [0, 1.6, 4.17], [0, 0, 45]);
  // emblem: dog-head chevron
  box([0.3, 0.06, 0.03], P.hazard, [0.08, 1.6, 4.2], [0, 0, 35]);
  box([0.3, 0.06, 0.03], P.hazard, [-0.08, 1.6, 4.2], [0, 0, -35]);
  lamp([0.06, 0.06, 0.03], P.neonRed, [0, 1.52, 4.215], 2);

  // ---- bumper & plow ----
  box([2.8, 0.34, 0.3], P.armor, [0, 0.95, 4.1]);
  box([2.6, 0.12, 0.34], P.hullLight, [0, 1.15, 4.1]);
  box([2.7, 0.5, 0.12], P.hullDark, [0, 0.72, 4.15], [-28, 0, 0]);
  box([2.5, 0.06, 0.1], P.steel, [0, 0.46, 4.22]);
  for (let i = 0; i < 9; i++) box([0.14, 0.4, 0.04], i % 2 ? P.hazard : P.black, [-1.1 + i * 0.275, 0.76, 4.22], [-28, 0, 0]);
  // plow teeth
  for (let i = 0; i < 6; i++) box([0.14, 0.16, 0.14], P.steel, [-1.0 + i * 0.4, 0.52, 4.25], [30, 0, 0]);
  // underglow
  glow(box([2.4, 0.03, 0.03], P.neonMagenta, [0, 0.82, 4.32]), 1.3);
  glow(box([0.03, 0.03, 0.6], P.neonCyan, [1.2, 0.85, 4.0]), 1);
  glow(box([0.03, 0.03, 0.6], P.neonCyan, [-1.2, 0.85, 4.0]), 1);

  // ---- light bar on roof front ----
  box([1.9, 0.14, 0.18], P.black, [0, 2.7, 2.78]);
  for (let i = 0; i < 8; i++) lamp([0.18, 0.1, 0.06], i % 4 === 0 ? P.neonCyan : P.lamp, [-0.84 + i * 0.24, 2.7, 2.9], 2);
  for (const s of [1, -1]) box([0.06, 0.1, 0.1], P.steel, [s * 0.98, 2.64, 2.78]);

  // ---- sensor mast ----
  const mx = -0.6, mz = 1.85;
  cyl(0.12, 0.14, 0.1, P.hullDark, [mx, 2.62, mz], [0, 0, 0], 8);
  cyl(0.04, 0.05, 0.5, P.steel, [mx, 2.9, mz]);
  box([0.04, 0.04, 0.5], P.steel, [mx, 2.78, mz]);
  // dish
  b.part(new THREE.SphereGeometry(0.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.4), P.white, {
    bone, at: [mx, 3.0, mz + 0.05], rotation: [70, 0, 0], flat: true,
  });
  cyl(0.02, 0.02, 0.18, P.steel, [mx, 3.0, mz + 0.14], [70, 0, 0], 6);
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonRed, { bone, at: [mx, 3.17, mz] }), 2);
  // antennas
  for (let i = 0; i < 3; i++) {
    const ax = 0.2 + i * 0.28;
    cyl(0.012, 0.02, 0.7 + i * 0.3, P.black, [ax, 2.95 + i * 0.1, 1.55], [R() * 6 - 3, 0, R() * 8 - 4], 6);
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), i === 1 ? P.neonMagenta : P.neonCyan, { bone, at: [ax, 3.3 + i * 0.25, 1.55] }), 2);
  }
  // sensor pods on roof
  box([0.3, 0.14, 0.3], P.hullDark, [0.7, 2.7, 1.75]);
  cyl(0.07, 0.07, 0.06, P.black, [0.7, 2.8, 1.75], [0, 0, 0], 8);
  lamp([0.06, 0.02, 0.06], P.neonCyan, [0.7, 2.83, 1.75]);
  // roof vents
  for (let i = 0; i < 4; i++) box([0.5, 0.04, 0.05], P.black, [0.1, 2.64, 2.2 + i * 0.12]);
  // roof hazard bars
  box([1.6, 0.02, 0.1], P.hazard, [0, 2.645, 3.1]);

  // ---- back wall seam to cargo ----
  box([2.2, 0.9, 0.06], P.hullDark, [0, 1.95, 1.42]);
  glow(box([1.6, 0.03, 0.02], P.neonCyan, [0, 2.4, 1.455]), 1);
  box([0.5, 0.3, 0.04], P.black, [0.5, 1.9, 1.45]);
  lamp([0.4, 0.2, 0.02], P.neonCyan, [0.5, 1.9, 1.48], 0.8);
}
```
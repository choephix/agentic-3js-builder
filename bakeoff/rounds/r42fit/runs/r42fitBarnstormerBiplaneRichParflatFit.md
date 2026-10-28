<!-- call: plan -->

```json
{
  "name": "Barnstormer Biplane",
  "description": "A whimsical, chunky barnstormer biplane with a red fuselage, cream double wings, striped struts, a round engine cowling, spinning propeller and fat balloon wheels, built from primitives.",
  "builderName": "barnstormerBiplane",
  "size": [8.4, 3.4, 6.6],
  "layout": "Nose faces +Z. Plump tapered fuselage runs from the round cowling and propeller at z=+2.6 back to a small upturned tail at z=-3.2. Two stacked rectangular wings with rounded tips span x=+-4.2 (lower at y=1.2, upper at y=2.55), joined by pairs of slanted cream struts with red stripes and criss-cross wires. Two big balloon wheels on a V strut gear sit under the nose, with a tiny tail skid at the back. Open cockpit with a pilot (goggles, scarf streaming back) sits behind the upper wing. Whimsical: exaggerated chunky proportions, rounded forms, bold stripes, polka-dot and sunburst emblems, bunting between the wing tips. Everything is flat colour, with details as small parts seated on the surfaces.",
  "palette": {
    "fuselageRed": "#d8362b",
    "fuselageDark": "#9c2220",
    "cream": "#f4e6c3",
    "wingCream": "#f7ecd0",
    "stripeBlue": "#2b6cb0",
    "sunYellow": "#f5c332",
    "wood": "#a8713a",
    "darkWood": "#6b4423",
    "metal": "#8f98a3",
    "darkMetal": "#3a3f48",
    "rubber": "#27262b",
    "hubcap": "#e9d9a8",
    "leather": "#7a4a2a",
    "skin": "#f0b98d",
    "scarf": "#f26fa3",
    "glass": "#9fe3f0",
    "wire": "#2e2e33",
    "bunt1": "#e84a5f",
    "bunt2": "#4ecdc4",
    "bunt3": "#ffd166",
    "white": "#ffffff"
  },
  "mounts": {
    "noseFace": [0, 1.35, 2.2],
    "propHub": [0, 1.35, 2.75],
    "cockpit": [0, 1.75, -0.6],
    "lowerWingRoot": [0, 1.2, 0.3],
    "upperWingRoot": [0, 2.55, 0.3],
    "strutBaseL": [1.8, 1.2, 0.3],
    "strutTopL": [1.8, 2.55, 0.3],
    "gearAxle": [0, 0.55, 1.2],
    "wheelL": [1.15, 0.55, 1.2],
    "wheelR": [-1.15, 0.55, 1.2],
    "tailPost": [0, 1.45, -3.0],
    "skid": [0, 0.3, -2.8]
  },
  "joints": [
    { "name": "body", "at": [0, 1.3, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "propeller", "parent": "body", "at": [0, 1.35, 2.75], "dir": [0, 0, 1], "role": "hinge", "group": "nose" },
    { "name": "rudder", "parent": "body", "at": [0, 1.5, -3.0], "dir": [0, 1, 0], "role": "hinge", "group": "tail" },
    { "name": "elevatorL", "parent": "body", "at": [0.3, 1.4, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "tail" },
    { "name": "elevatorR", "parent": "body", "at": [-0.3, 1.4, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "tail" },
    { "name": "wheelL", "parent": "body", "at": [1.15, 0.55, 1.2], "dir": [1, 0, 0], "role": "hinge", "group": "gear" },
    { "name": "wheelR", "parent": "body", "at": [-1.15, 0.55, 1.2], "dir": [-1, 0, 0], "role": "hinge", "group": "gear" }
  ],
  "parts": [
    {
      "id": "fuselage",
      "builds": "Plump lofted fuselage in fuselageRed with a cream belly and a fuselageDark spine, cockpit coaming with leather rim, round cowling lathe with metal ring and rivet studs, exhaust stubs, sunburst emblem and blue stripes on the flanks, a small windscreen in glass, and a number roundel.",
      "box": [[-0.75, 0.6, -3.0], [0.75, 2.1, 2.75]],
      "attaches": "Nose face at noseFace carries propHub; wings meet at lowerWingRoot and upperWingRoot via struts; tail parts at tailPost; gear legs at gearAxle.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "wings",
      "builds": "Upper and lower rectangular wings with rounded tips in wingCream with stripeBlue tip caps and sunYellow leading-edge stripes, rib lines as thin parts, polka dots on the upper wing, the interplane struts (wood with red stripes), cabane struts to the fuselage, criss-cross wires, and bunting flags in bunt colours strung between the upper wing tips.",
      "box": [[-4.2, 1.0, -0.6], [4.2, 2.8, 1.2]],
      "attaches": "Roots at lowerWingRoot and upperWingRoot; struts run strutBaseL to strutTopL and mirrored on -x.",
      "joints": ["body"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "tail",
      "builds": "Tall rounded rudder fin on joint rudder in fuselageRed with a sunYellow star, two stubby elevators on elevatorL and elevatorR in wingCream with blue tips, bracing wires, a wooden tail skid with a tiny metal shoe, and a small pennant on the fin top.",
      "box": [[-1.3, 0.2, -3.4], [1.3, 2.5, -2.5]],
      "attaches": "Mounts to fuselage at tailPost; skid at skid.",
      "joints": ["rudder", "elevatorL", "elevatorR", "body"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "gear",
      "builds": "Landing gear: two big balloon wheels (rubber tire lathe, hubcap discs, wooden spokes pattern, small valve) on wheelL and wheelR, V-shaped wood struts to the fuselage with red wrapping bands, a metal axle bar and a curved fairing cap, and tiny mud splats on the tires.",
      "box": [[-1.5, 0.0, 0.7], [1.5, 1.3, 1.7]],
      "attaches": "Axle at gearAxle; wheels at wheelL and wheelR; struts meet the fuselage underside.",
      "joints": ["wheelL", "wheelR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "pilotProp",
      "builds": "Spinning two-blade wooden propeller on joint propeller (shaped extruded blades, metal spinner cone, sunYellow tips, a blur disc is not built) plus the whimsical pilot sitting in the cockpit: round head, leather cap, big goggles with glass lenses, grin, long pink scarf streaming back with tassel, arms resting on the coaming, and a small dangling charm.",
      "box": [[-1.3, 0.1, -1.5], [1.3, 2.9, 3.0]],
      "attaches": "Propeller hub at propHub on the propeller joint; pilot seated at cockpit.",
      "joints": ["propeller", "body"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: wings -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildWings({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, len: number, c: string, at: number[], rot: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { bone, at, rotation: rot });
  const rod = (a: number[], c2: number[], r: number, c: string) =>
    b.rod(a, c2, r, c, { bone, sides: 6 });

  const half = 4.2, chord = 1.5, cz = 0.3;
  const wings = [
    { y: 1.2, upper: false },
    { y: 2.55, upper: true },
  ];

  for (const w of wings) {
    const y = w.y;
    const th = 0.14;
    const span = half - 0.3;
    // main slab
    box(span * 2, th, chord, P.wingCream, [0, y, cz]);
    // rounded tips
    for (const s of [1, -1]) {
      cyl(chord / 2, th, P.wingCream, [s * span, y, cz], [0, 0, 0], 14);
      // blue tip cap
      cyl(chord / 2 + 0.01, th + 0.02, P.stripeBlue, [s * (half - 0.12), y, cz], [0, 0, 0], 14)
        .mesh.scale.set(0.22, 1, 1);
      // leading-edge stripe
      box(span - 0.5, th + 0.02, 0.12, P.sunYellow, [s * (span / 2 + 0.15), y, cz + chord / 2 - 0.1]);
    }
    // ribs
    for (let i = -7; i <= 7; i++) {
      if (i === 0) continue;
      box(0.04, th + 0.02, chord - 0.1, P.cream, [i * 0.52, y, cz]);
    }
    // polka dots on the upper wing
    if (w.upper) {
      for (let i = -6; i <= 6; i++) {
        const c = i % 2 ? P.bunt1 : P.stripeBlue;
        const z = cz + (i % 2 ? 0.25 : -0.25);
        b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 10), c, { bone, at: [i * 0.55 + 0.1, y + th / 2 + 0.005, z] });
      }
    } else {
      for (const s of [1, -1])
        b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 10), P.sunYellow, { bone, at: [s * 2.8, y + th / 2 + 0.005, cz] });
    }
  }

  // interplane struts and cabane
  for (const s of [1, -1]) {
    for (const x of [1.8, 3.5]) {
      for (const dz of [-0.45, 0.45]) {
        const a = [s * x, 1.28, cz + dz], t = [s * x, 2.47, cz + dz];
        rod(a, t, 0.045, P.wood);
        for (let k = 0; k < 4; k++) {
          const y0 = 1.4 + k * 0.28;
          b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.09, 6), P.fuselageRed, { bone, at: [s * x, y0, cz + dz] });
        }
      }
      // criss-cross wires
      rod([s * x, 1.3, cz - 0.45], [s * x, 2.45, cz + 0.45], 0.012, P.wire);
      rod([s * x, 1.3, cz + 0.45], [s * x, 2.45, cz - 0.45], 0.012, P.wire);
    }
    // bay wires between struts
    rod([s * 1.8, 1.3, cz], [s * 3.5, 2.45, cz], 0.012, P.wire);
    rod([s * 1.8, 2.45, cz], [s * 3.5, 1.3, cz], 0.012, P.wire);
    // cabane struts to fuselage
    for (const dz of [-0.4, 0.5]) {
      rod([s * 0.45, 1.95, cz + dz], [s * 0.9, 2.47, cz + dz * 0.8], 0.05, P.wood);
    }
  }

  // bunting between upper wing tips
  const by = 2.5, bz = cz + chord / 2 + 0.05;
  const pts: number[][] = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const x = -half + 0.2 + (i / N) * (half * 2 - 0.4);
    const sag = 0.35 * (1 - Math.pow(x / (half - 0.2), 2));
    pts.push([x, by - sag - 0.1, bz + 0.15]);
  }
  for (let i = 0; i < N; i++) rod(pts[i], pts[i + 1], 0.01, P.wire);
  const cols = [P.bunt1, P.bunt2, P.bunt3];
  for (let i = 1; i < N; i++) {
    const p = pts[i];
    const g = new THREE.ConeGeometry(0.1, 0.24, 3);
    g.rotateX(Math.PI);
    g.scale(1, 1, 0.15);
    b.part(g, cols[i % 3], { bone, at: [p[0], p[1] - 0.12, p[2]], rotation: [0, 0, (R() - 0.5) * 14] });
  }
}
```

<!-- call: gear -->

```ts
import * as THREE from "three";
import { rng } from "agentic-3js-builder";

export function buildGear({ b, J, P, M }: any) {
  const R = rng(5);
  const WR = 0.55; // wheel radius (axle height)
  const WW = 0.34; // wheel half width... tire thickness

  const tireOutline: [number, number][] = [
    [0.22, -WW * 0.5], [0.42, -WW * 0.5], [0.52, -WW * 0.3], [WR, 0], [0.52, WW * 0.3],
    [0.42, WW * 0.5], [0.22, WW * 0.5],
  ];
  // wheels
  for (const s of [1, -1]) {
    const wj = s > 0 ? J.wheelL : J.wheelR;
    const ax = [s, 0, 0];
    const c = [s * 1.15, WR, 1.2];
    b.lathe(tireOutline, { at: c, axis: ax, segments: 16, color: P.rubber, bone: wj });
    // hubcap discs
    for (const o of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 14), P.hubcap, {
        bone: wj, at: [c[0] + s * o * 0.16, c[1], c[2]], dir: ax,
      });
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.metal, {
        bone: wj, at: [c[0] + s * o * 0.185, c[1], c[2]], dir: ax,
      });
    }
    // spokes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      b.part(new THREE.BoxGeometry(0.03, 0.54, 0.03), P.wood, {
        bone: wj, at: [c[0] + s * 0.19, c[1], c[2]],
        rotation: [(a * 180) / Math.PI, 0, 0],
      });
    }
    // valve
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6), P.metal, {
      bone: wj, at: [c[0] + s * 0.19, c[1] + 0.34, c[2] + 0.1],
    });
    // mud splats on tire
    for (let i = 0; i < 4; i++) {
      const a = R() * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.035 + R() * 0.03, 6, 4), P.darkWood, {
        bone: wj,
        at: [c[0] + s * (R() - 0.5) * 0.25, c[1] + Math.sin(a) * 0.54, c[2] + Math.cos(a) * 0.54],
        scale: [1, 1, 0.5],
      });
    }
    // V strut legs: from wheel axle to fuselage underside, front and back
    for (const z of [0.85, 1.55]) {
      const top = [s * 0.35, 1.0, z];
      const bot = [s * 1.0, WR + 0.05, 1.2];
      b.rod(top, bot, 0.05, P.wood, { bone: J.body, sides: 8 });
      const bandAt = (t: number) => [
        top[0] + (bot[0] - top[0]) * t, top[1] + (bot[1] - top[1]) * t, top[2] + (bot[2] - top[2]) * t,
      ];
      for (const t of [0.15, 0.5, 0.85]) {
        const p = bandAt(t);
        b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 8), P.fuselageRed, {
          bone: J.body, at: p, aim: [bot[0] - top[0], bot[1] - top[1], bot[2] - top[2]],
        });
      }
    }
    // axle stub into hub
    b.rod([s * 0.2, WR, 1.2], [s * 1.2, WR, 1.2], 0.04, P.metal, { bone: J.body });
    // fairing cap over strut meeting wheel
    b.part(new THREE.SphereGeometry(0.1, 8, 6), P.darkMetal, {
      bone: J.body, at: [s * 1.0, WR + 0.05, 1.2],
    });
  }
  // central axle bar
  b.rod([-1.0, WR, 1.2], [1.0, WR, 1.2], 0.055, P.metal, { bone: J.body });
  // curved fairing cap on the belly
  b.part(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), P.fuselageDark, {
    bone: J.body, at: [0, 0.95, 1.2], rotation: [180, 0, 0], scale: [1, 0.5, 1.6],
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), P.metal, {
    bone: J.body, at: [0, WR, 1.2], dir: [1, 0, 0],
  });
}
```

<!-- call: tail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const RED = P.fuselageRed, DK = P.fuselageDark, CREAM = P.wingCream, BLUE = P.stripeBlue;
  const YEL = P.sunYellow, WOOD = P.wood, DW = P.darkWood, MET = P.metal, WIRE = P.wire;

  // Rudder fin (extruded outline, drawn side view: x = back along -z, y = up)
  const fin = [
    [0, 0], [0.05, 0.9], [0.2, 1.7], [0.1, 2.0], [-0.1, 2.05], [-0.3, 1.8], [-0.45, 1.0], [-0.5, 0.0],
  ] as any;
  const rudderAt: [number, number, number] = [0, 1.45, -2.65];
  const finPart = b.extrude(fin, {
    at: rudderAt, x: [0, 0, -1], y: [0, 1, 0], thickness: 0.1, bevel: 0.025, smoothing: 1,
    color: RED, bone: J.rudder,
  });
  void finPart;
  // fin stripe (blue) and trim
  b.extrude([[ -0.05, 0.25], [0.02, 0.5], [-0.3, 0.55], [-0.4, 0.3]] as any, {
    at: [0.056, 1.45, -2.65], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, color: BLUE, bone: J.rudder,
  });
  b.extrude([[ -0.05, 0.25], [0.02, 0.5], [-0.3, 0.55], [-0.4, 0.3]] as any, {
    at: [-0.056, 1.45, -2.65], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, color: BLUE, bone: J.rudder,
  });

  // Yellow star both sides
  const star: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, r = i % 2 ? 0.1 : 0.22;
    star.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  for (const s of [1, -1])
    b.extrude(star as any, {
      at: [s * 0.058, 2.35, -2.8], x: [0, 0, s], y: [0, 1, 0], thickness: 0.02, color: YEL, bone: J.rudder,
    });

  // Rudder hinge post and tip ball
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 2.1, 6), DK, { at: [0, 2.5, -2.55], bone: J.rudder, quat: undefined });
  b.part(new THREE.SphereGeometry(0.07, 8, 6), YEL, { at: [0, 3.5 - 0.0, -2.55], bone: J.rudder });
  b.part(new THREE.SphereGeometry(0.0001, 3, 2), RED, { at: [0, 0, 0], bone: J.rudder });

  // Pennant on the fin top
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), DW, { at: [0, 3.55, -2.55], bone: J.rudder });
  b.extrude([[0, 0], [0.4, 0.07], [0, 0.16]] as any, {
    at: [0, 3.6, -2.55], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.015, color: P.bunt1, bone: J.rudder,
  });

  // Elevators
  for (const s of [1, -1]) {
    const j = s > 0 ? J.elevatorL : J.elevatorR;
    const out = [
      [0, 0.28], [0.35, 0.3], [0.8, 0.2], [0.98, 0.0], [0.8, -0.2], [0.3, -0.26], [0, -0.25],
    ] as any;
    b.extrude(out, {
      at: [s * 0.3, 1.4, -3.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, smoothing: 1,
      color: CREAM, bone: j,
    });
    // blue tip cap
    b.extrude([[0.78, 0.2], [0.98, 0.0], [0.78, -0.2]] as any, {
      at: [s * 0.3, 1.4415, -3.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.02, color: BLUE, bone: j,
    });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.5), BLUE, { at: [s * 0.3 + s * 0.6, 1.4, -3.1], bone: j });
    // ribs
    for (let i = 1; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.02, 0.012, 0.42), DW, { at: [s * (0.3 + i * 0.2), 1.446, -3.1], bone: j });
    // bracing wires from elevator to fin top region and belly
    b.rod([s * 0.75, 1.42, -3.1], [0, 2.1, -2.6], 0.01, WIRE, { bone: J.body });
    b.rod([s * 0.75, 1.38, -3.1], [0, 0.9, -2.7], 0.01, WIRE, { bone: J.body });
    // little struts under elevators
    b.rod([s * 0.5, 1.37, -3.1], [s * 0.1, 1.0, -2.8], 0.022, WOOD, { bone: J.body });
  }

  // Tail skid
  b.rod([0, 1.0, -2.75], [0, 0.34, -3.15], 0.045, WOOD, { bone: J.body });
  b.rod([0, 0.4, -3.0], [0, 0.3, -3.3], 0.05, DW, { bone: J.body });
  b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.14, 6), MET, { at: [0, 0.29, -3.3], bone: J.body, rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.08), MET, { at: [0, 0.24, -3.3], bone: J.body });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.darkMetal, { at: [s * 0.06, 0.3, -3.35], bone: J.body });
  // wrap bands on the skid strut
  for (let i = 0; i < 3; i++) {
    const t = 0.25 + i * 0.25;
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.04, 6), RED, {
      at: [0, 1.0 - 0.66 * t, -2.75 - 0.4 * t], bone: J.body, rotation: [-30, 0, 0],
    });
  }
  void R; void frame; void M;
}
```

<!-- call: pilotProp -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildPilotProp({ b, J, P, M }: any) {
  const r = rng(5);
  const body = J.body;
  const prop = J.propeller;
  const hub = M.propHub as number[];

  const add = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: o.bone ?? body, at, ...o });

  // ---- Propeller ----
  const SPIN = P.metal;
  add(new THREE.ConeGeometry(0.28, 0.45, 12), SPIN, [hub[0], hub[1], hub[2] + 0.2], { bone: prop, dir: [0, 0, 1] });
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 12), P.darkMetal, [hub[0], hub[1], hub[2] - 0.05], { bone: prop, dir: [0, 0, 1] });
  add(new THREE.SphereGeometry(0.06, 6, 4), P.sunYellow, [hub[0], hub[1], hub[2] + 0.45], { bone: prop });

  const blade = [
    [0, 0], [0.12, 0.2], [0.2, 0.7], [0.22, 1.2], [0.14, 1.45], [-0.14, 1.45], [-0.2, 1.2], [-0.16, 0.7], [-0.1, 0.2],
  ] as any;
  const tip = [[0.14, 1.12], [0.22, 1.2], [0.14, 1.45], [-0.14, 1.45], [-0.2, 1.2], [-0.14, 1.12]] as any;
  for (const s of [1, -1]) {
    const y: number[] = [0, s, 0];
    b.extrude(blade, { at: [hub[0], hub[1], hub[2] + 0.02], x: [1, 0, 0], y, thickness: 0.05, bevel: 0.01, color: P.wood, bone: prop });
    b.extrude(tip, { at: [hub[0], hub[1], hub[2] + 0.055], x: [1, 0, 0], y, thickness: 0.012, color: P.sunYellow, bone: prop });
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), P.metal, [hub[0], hub[1] + s * 0.35, hub[2] + 0.07], { bone: prop, dir: [0, 0, 1] });
  }

  // ---- Pilot ----
  const c = M.cockpit as number[];
  const px = 0, pz = c[2];
  add(new THREE.BoxGeometry(0.62, 0.5, 0.5), P.leather, [px, c[1] + 0.05, pz - 0.05]); // torso (jacket)
  add(new THREE.BoxGeometry(0.64, 0.1, 0.52), P.darkWood, [px, c[1] + 0.25, pz - 0.05]); // collar
  const hy = c[1] + 0.72;
  add(new THREE.SphereGeometry(0.3, 12, 10), P.skin, [px, hy, pz + 0.02]);
  add(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), P.leather, [px, hy + 0.06, pz], {});
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), P.leather, [px, hy + 0.37, pz]);
  add(new THREE.TorusGeometry(0.31, 0.03, 5, 14), P.darkWood, [px, hy + 0.1, pz], { rotation: [90, 0, 0] });
  // earflaps
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.06, 0.2, 0.16), P.leather, [s * 0.3, hy - 0.05, pz]);
  // goggles
  add(new THREE.TorusGeometry(0.31, 0.03, 5, 14), P.darkMetal, [px, hy + 0.1, pz + 0.02], { rotation: [90, 0, 0], scale: [1, 1, 0.5] });
  for (const s of [1, -1]) {
    add(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 10), P.darkMetal, [s * 0.14, hy + 0.05, pz + 0.3], { dir: [0, 0, 1] });
    add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), P.glass, [s * 0.14, hy + 0.05, pz + 0.35], { dir: [0, 0, 1] });
    add(new THREE.SphereGeometry(0.03, 5, 4), P.white, [s * 0.11, hy + 0.08, pz + 0.38]);
    add(new THREE.SphereGeometry(0.035, 5, 4), P.darkMetal, [s * 0.14, hy + 0.04, pz + 0.38]);
    // cheeks and arms
    add(new THREE.SphereGeometry(0.06, 6, 4), "#f08f8f", [s * 0.2, hy - 0.12, pz + 0.27]);
    add(new THREE.CapsuleGeometry(0.08, 0.4, 4, 8), P.leather, [s * 0.38, c[1] + 0.05, pz + 0.3], { dir: [s * 0.2, 0.3, 1] });
    add(new THREE.SphereGeometry(0.1, 8, 6), P.skin, [s * 0.4, c[1] + 0.1, pz + 0.55]);
  }
  add(new THREE.SphereGeometry(0.06, 6, 4), P.skin, [px, hy - 0.03, pz + 0.33]); // nose
  // grin
  add(new THREE.TorusGeometry(0.1, 0.018, 4, 8, Math.PI), "#7a2222", [px, hy - 0.12, pz + 0.28], { rotation: [0, 0, 180] });
  add(new THREE.BoxGeometry(0.12, 0.025, 0.02), P.white, [px, hy - 0.14, pz + 0.29]);

  // ---- Scarf ----
  add(new THREE.TorusGeometry(0.26, 0.07, 6, 12), P.scarf, [px, c[1] + 0.33, pz], { rotation: [90, 0, 0] });
  add(new THREE.BoxGeometry(0.2, 0.2, 0.1), P.scarf, [0.22, c[1] + 0.25, pz + 0.12]);
  let zz = pz - 0.28;
  let yy = c[1] + 0.38;
  for (let i = 0; i < 6; i++) {
    const w = 0.2 - i * 0.012;
    add(new THREE.BoxGeometry(w, 0.025, 0.26), i % 2 ? P.white : P.scarf, [0.22 + Math.sin(i) * 0.04, yy, zz], { rotation: [-8 + i * 2, 0, 5 * Math.sin(i)] });
    zz -= 0.25;
    yy += 0.035;
  }
  add(new THREE.ConeGeometry(0.1, 0.18, 6), P.sunYellow, [0.22, yy, zz - 0.05], { dir: [0, 0, -1] });
  for (let i = -1; i <= 1; i++) add(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), P.sunYellow, [0.22 + i * 0.05, yy - 0.01, zz - 0.15], { dir: [0, 0, -1] });

  // ---- Charm dangling from the coaming ----
  b.rod([0.3, c[1] + 0.55, pz + 0.75], [0.3, c[1] + 0.35, pz + 0.75], 0.008, P.wire, { bone: body });
  add(new THREE.OctahedronGeometry(0.07), P.sunYellow, [0.3, c[1] + 0.3, pz + 0.75]);
  add(new THREE.SphereGeometry(0.02 + r() * 0.01, 5, 4), P.bunt1, [0.3, c[1] + 0.22, pz + 0.75]);
}
```

<!-- call: fuselage -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildFuselage({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(5);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: body, at, flat: true, ...o });

  // Fuselage loft: nose (+z) to tail (-z)
  const st = [
    { at: [0, 1.35, 2.15], w: 1.0, h: 1.0 },
    { at: [0, 1.38, 1.4], w: 1.4, h: 1.4 },
    { at: [0, 1.4, 0.4], w: 1.46, h: 1.46 },
    { at: [0, 1.42, -0.7], w: 1.2, h: 1.2 },
    { at: [0, 1.46, -1.8], w: 0.7, h: 0.75 },
    { at: [0, 1.5, -2.7], w: 0.3, h: 0.4 },
    { at: [0, 1.55, -3.0], w: 0.16, h: 0.26 },
  ];
  b.loft(st, { bone: body, color: P.fuselageRed, section: "circle", sides: 12 });

  // cream belly
  const belly = st.map((s) => ({ at: [0, s.at[1] - s.h * 0.3, s.at[2]], w: s.w * 0.72, h: s.h * 0.45 }));
  b.loft(belly.slice(0, 6), { bone: body, color: P.cream, sides: 10 });
  // dark spine
  for (let i = 0; i < 6; i++) {
    const z0 = 1.4 - i * 0.75;
    const y = 1.4 + st[1].h * 0.5 - i * 0.12 - (i > 2 ? i * 0.09 : 0);
    part(new THREE.BoxGeometry(0.2, 0.06, 0.7), P.fuselageDark, [0, Math.min(y, 2.08) - 0.02 - i * 0.04 + (i > 3 ? 0 : 0), z0]);
  }

  // Cowling
  const cow = b.lathe(
    [[0, 0], [0.62, 0], [0.7, 0.2], [0.72, 0.5], [0.62, 0.62], [0.35, 0.68], [0, 0.7]],
    { at: [0, 1.35, 2.1], axis: [0, 0, 1], bone: body, color: P.fuselageRed, segments: 14 },
  );
  b.lathe([[0.7, 0], [0.76, 0], [0.76, 0.1], [0.7, 0.1]], {
    at: [0, 1.35, 2.14], axis: [0, 0, 1], bone: body, color: P.metal, segments: 14,
  });
  b.lathe([[0.62, 0], [0.7, 0], [0.7, 0.08], [0.62, 0.08]], {
    at: [0, 1.35, 2.62], axis: [0, 0, 1], bone: body, color: P.metal, segments: 14,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(new THREE.SphereGeometry(0.035, 5, 4), P.darkMetal, [Math.cos(a) * 0.73, 1.35 + Math.sin(a) * 0.73, 2.2]);
  }
  part(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8), P.metal, [0, 1.35, 2.72], { rotation: [90, 0, 0] });

  // exhaust stubs
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.07, 0.09, 0.4, 8), P.darkMetal, [s * 0.62, 1.0, 1.7], { rotation: [0, 0, s * 70] });
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), P.rubber, [s * 0.8, 0.95, 1.7], { rotation: [0, 0, 90] });
  }

  // cockpit coaming
  part(new THREE.BoxGeometry(0.9, 0.1, 0.06), P.leather, [0, 2.1, 0.0]);
  part(new THREE.BoxGeometry(0.9, 0.1, 0.06), P.leather, [0, 2.1, -1.15]);
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.06, 0.1, 1.2), P.leather, [s * 0.45, 2.08, -0.58]);
  part(new THREE.BoxGeometry(0.76, 0.05, 1.06), P.fuselageDark, [0, 2.04, -0.58]);
  // windscreen
  part(new THREE.BoxGeometry(0.76, 0.34, 0.04), P.glass, [0, 2.28, 0.1], { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.04, 0.36, 0.05), P.metal, [s * 0.39, 2.27, 0.1], { rotation: [-20, 0, 0] });

  // flank decoration
  for (const s of [1, -1]) {
    const x = s * 0.74;
    // blue stripes
    for (const z of [-0.35, -0.55]) part(new THREE.BoxGeometry(0.03, 0.9, 0.1), P.stripeBlue, [s * 0.72, 1.45, z - 0.55]);
    for (const z of [1.15, 1.35]) part(new THREE.BoxGeometry(0.03, 1.0, 0.09), P.stripeBlue, [s * 0.7, 1.4, z]);
    // sunburst
    const sx = s * 0.73, sy = 1.55, sz = -1.5;
    part(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), P.sunYellow, [sx - s * 0.04, sy, sz], { rotation: [0, 0, 90] });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      part(new THREE.ConeGeometry(0.05, 0.16, 4), P.sunYellow, [sx - s * 0.04, sy + Math.sin(a) * 0.28, sz + Math.cos(a) * 0.28], {
        dir: [0, Math.sin(a), Math.cos(a)],
      });
    }
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), P.fuselageRed, [sx - s * 0.03, sy, sz], { rotation: [0, 0, 90] });
    // number roundel
    part(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 14), P.white, [s * 0.66, 1.3, 0.75 + 0.0], { rotation: [0, 0, 90] });
    part(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 14), P.stripeBlue, [s * 0.665, 1.3, 0.75], { rotation: [0, 0, 90] });
    part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 10), P.white, [s * 0.67, 1.3, 0.75], { rotation: [0, 0, 90] });
    // rivet row
    for (let i = 0; i < 8; i++) part(new THREE.SphereGeometry(0.025, 4, 3), P.fuselageDark, [s * (0.72 - i * 0.02), 1.12 + i * 0.01, 1.5 - i * 0.45]);
  }

  // tail fin base nub
  part(new THREE.BoxGeometry(0.12, 0.2, 0.3), P.fuselageDark, [0, 1.62, -2.85]);
}
```

<!-- call: fit-wings -->

The tip cylinders are 1.5 m wide, centred at x = ±3.9, so they stick out to ±4.63. I'll shrink the tip radius so they end at ±4.2. The rounded tip is a cylinder with its axis along Y, which is correct for a disc. The simplest fix is to scale its x extent: scaling x by 0.4 makes the half-width 0.75 × 0.4 = 0.3, so the tip spans 3.6 to 4.2 and stays inside the box. The blue cap is then 0.76 × 0.22 = 0.17 wide, centred at 4.08 and ending at 4.17, which also fits.

<<<<<<< SEARCH
      cyl(chord / 2, th, P.wingCream, [s * span, y, cz], [0, 0, 0], 14);
=======
      cyl(chord / 2, th, P.wingCream, [s * span, y, cz], [0, 0, 0], 14).mesh.scale.set(0.4, 1, 1);
>>>>>>> REPLACE

<!-- call: fit-fuselage -->

The windscreen pieces poke above the box top (y = 2.1), so I lowered and shortened them to fit inside it.

<<<<<<< SEARCH
  part(new THREE.BoxGeometry(0.76, 0.34, 0.04), P.glass, [0, 2.28, 0.1], { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.04, 0.36, 0.05), P.metal, [s * 0.39, 2.27, 0.1], { rotation: [-20, 0, 0] });
=======
  part(new THREE.BoxGeometry(0.76, 0.14, 0.04), P.glass, [0, 2.0, 0.1], { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.04, 0.15, 0.05), P.metal, [s * 0.39, 2.0, 0.1], { rotation: [-20, 0, 0] });
>>>>>>> REPLACE

<!-- call: fit-pilotProp -->

Three fixes bring the pieces inside the box. The propeller blades are about 17% shorter. The spinner cone and tip ball are shorter and sit further back. The scarf tail is cut to four short segments.

<<<<<<< SEARCH
  add(new THREE.ConeGeometry(0.28, 0.45, 12), SPIN, [hub[0], hub[1], hub[2] + 0.2], { bone: prop, dir: [0, 0, 1] });
=======
  add(new THREE.ConeGeometry(0.28, 0.28, 12), SPIN, [hub[0], hub[1], hub[2] + 0.08], { bone: prop, dir: [0, 0, 1] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  add(new THREE.SphereGeometry(0.06, 6, 4), P.sunYellow, [hub[0], hub[1], hub[2] + 0.45], { bone: prop });
=======
  add(new THREE.SphereGeometry(0.05, 6, 4), P.sunYellow, [hub[0], hub[1], hub[2] + 0.14], { bone: prop });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const blade = [
    [0, 0], [0.12, 0.2], [0.2, 0.7], [0.22, 1.2], [0.14, 1.45], [-0.14, 1.45], [-0.2, 1.2], [-0.16, 0.7], [-0.1, 0.2],
  ] as any;
  const tip = [[0.14, 1.12], [0.22, 1.2], [0.14, 1.45], [-0.14, 1.45], [-0.2, 1.2], [-0.14, 1.12]] as any;
=======
  const blade = ([
    [0, 0], [0.12, 0.2], [0.2, 0.7], [0.22, 1.2], [0.14, 1.45], [-0.14, 1.45], [-0.2, 1.2], [-0.16, 0.7], [-0.1, 0.2],
  ] as number[][]).map((p) => [p[0], p[1] * 0.8]) as any;
  const tip = ([[0.14, 1.12], [0.22, 1.2], [0.14, 1.45], [-0.14, 1.45], [-0.2, 1.2], [-0.14, 1.12]] as number[][]).map((p) => [p[0], p[1] * 0.8]) as any;
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (let i = 0; i < 6; i++) {
=======
  for (let i = 0; i < 4; i++) {
>>>>>>> REPLACE
<<<<<<< SEARCH
    zz -= 0.25;
=======
    zz -= 0.15;
>>>>>>> REPLACE
<<<<<<< SEARCH
  add(new THREE.ConeGeometry(0.1, 0.18, 6), P.sunYellow, [0.22, yy, zz - 0.05], { dir: [0, 0, -1] });
  for (let i = -1; i <= 1; i++) add(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), P.sunYellow, [0.22 + i * 0.05, yy - 0.01, zz - 0.15], { dir: [0, 0, -1] });
=======
  add(new THREE.ConeGeometry(0.08, 0.12, 6), P.sunYellow, [0.22, yy, zz - 0.02], { dir: [0, 0, -1] });
  for (let i = -1; i <= 1; i++) add(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 4), P.sunYellow, [0.22 + i * 0.05, yy - 0.01, zz - 0.1], { dir: [0, 0, -1] });
>>>>>>> REPLACE

<!-- call: fit-tail -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildTail({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const RED = P.fuselageRed, DK = P.fuselageDark, CREAM = P.wingCream, BLUE = P.stripeBlue;
  const YEL = P.sunYellow, WOOD = P.wood, DW = P.darkWood, MET = P.metal, WIRE = P.wire;

  // Rudder fin
  const fin = [
    [0, 0], [0.05, 0.45], [0.2, 0.85], [0.1, 1.0], [-0.1, 1.02], [-0.3, 0.9], [-0.45, 0.5], [-0.5, 0.0],
  ] as any;
  b.extrude(fin, {
    at: [0, 1.45, -2.85], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.1, bevel: 0.025, smoothing: 1,
    color: RED, bone: J.rudder,
  });
  const stripe = [[-0.05, 0.12], [0.02, 0.25], [-0.3, 0.28], [-0.4, 0.15]] as any;
  for (const s of [1, -1])
    b.extrude(stripe, {
      at: [s * 0.056, 1.45, -2.85], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.02, color: BLUE, bone: J.rudder,
    });

  // Yellow star both sides
  const star: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, r = i % 2 ? 0.05 : 0.12;
    star.push([Math.sin(a) * r, Math.cos(a) * r]);
  }
  for (const s of [1, -1])
    b.extrude(star as any, {
      at: [s * 0.058, 2.0, -2.9], x: [0, 0, s], y: [0, 1, 0], thickness: 0.02, color: YEL, bone: J.rudder,
    });

  // Hinge post
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 6), DK, { at: [0, 1.95, -2.62], bone: J.rudder });

  // Pennant
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 5), DW, { at: [0, 2.45, -2.9], bone: J.rudder });
  b.extrude([[0, 0], [0.2, 0.03], [0, 0.07]] as any, {
    at: [0, 2.42, -2.9], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: P.bunt1, bone: J.rudder,
  });

  // Elevators
  for (const s of [1, -1]) {
    const j = s > 0 ? J.elevatorL : J.elevatorR;
    const out = [
      [0, 0.28], [0.35, 0.3], [0.8, 0.2], [0.98, 0.0], [0.8, -0.2], [0.3, -0.26], [0, -0.25],
    ] as any;
    b.extrude(out, {
      at: [s * 0.3, 1.4, -3.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, smoothing: 1,
      color: CREAM, bone: j,
    });
    b.extrude([[0.78, 0.2], [0.98, 0.0], [0.78, -0.2]] as any, {
      at: [s * 0.3, 1.4415, -3.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.02, color: BLUE, bone: j,
    });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.5), BLUE, { at: [s * 0.3 + s * 0.6, 1.4, -3.1], bone: j });
    for (let i = 1; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.02, 0.012, 0.42), DW, { at: [s * (0.3 + i * 0.2), 1.446, -3.1], bone: j });
    b.rod([s * 0.75, 1.42, -3.1], [0, 2.4, -2.6], 0.01, WIRE, { bone: J.body });
    b.rod([s * 0.75, 1.38, -3.1], [0, 0.9, -2.7], 0.01, WIRE, { bone: J.body });
    b.rod([s * 0.5, 1.37, -3.1], [s * 0.1, 1.0, -2.8], 0.022, WOOD, { bone: J.body });
  }

  // Tail skid
  b.rod([0, 1.0, -2.75], [0, 0.34, -3.15], 0.045, WOOD, { bone: J.body });
  b.rod([0, 0.4, -3.0], [0, 0.3, -3.3], 0.05, DW, { bone: J.body });
  b.part(new THREE.CylinderGeometry(0.05, 0.065, 0.14, 6), MET, { at: [0, 0.29, -3.3], bone: J.body, rotation: [90, 0, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.08), MET, { at: [0, 0.24, -3.3], bone: J.body });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.darkMetal, { at: [s * 0.06, 0.3, -3.35], bone: J.body });
  for (let i = 0; i < 3; i++) {
    const t = 0.25 + i * 0.25;
    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.04, 6), RED, {
      at: [0, 1.0 - 0.66 * t, -2.75 - 0.4 * t], bone: J.body, rotation: [-30, 0, 0],
    });
  }
  void R; void frame; void M;
}
```
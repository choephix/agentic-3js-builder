<!-- call: plan -->

```json
{
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled armoured carrier carrying a long electromagnetic railgun on its back, planted on four deployed stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [4.2, 3.0, 9.0],
  "layout": "Long, low armoured hull facing +Z. Front (z 3.2 to 4.5): sloped glacis, angular cab with a slit visor window on top of the hull, and headlights. Middle: flat deck with the turret ring at z=-0.4. Rear (z -4.5): engine deck, exhaust vents and a cargo/ammo bay. Three wheel axles per side at z=2.8, 0.2 and -2.8, with big chunky tyres (radius 0.6) set in angular wheel arches. Four stabiliser legs fold out diagonally from the hull sides near the front and rear axles to square footpads on the floor, which are wider than the tyres. A big railgun on a turret rides the deck with a long barrel extending forward over the cab, flanked by two parallel rails, glowing cyan coils, a recoil sleeve and a muzzle brake. The railgun's rails and coils glow neon cyan. Style: chunky faceted slabs, bold yellow hazard trim, olive-grey armour panels with riveted seams, dark gunmetal rails, and decals such as stencilled numbers and a unit emblem.",
  "palette": {
    "hull": "#4d5648",
    "hullDark": "#2f352e",
    "hullLight": "#6b7561",
    "trim": "#e7b814",
    "gunmetal": "#2a2d33",
    "steel": "#8a919b",
    "tyre": "#17181a",
    "rim": "#555b63",
    "glass": "#1b6f86",
    "neonCyan": "#2ff3ff",
    "warnRed": "#c8261e",
    "lamp": "#fff1b0",
    "cloth": "#7a6a45"
  },
  "mounts": {
    "deckTop": [0, 1.75, 0],
    "turretRing": [0, 1.75, -0.4],
    "gunPivot": [0, 2.55, -0.4],
    "muzzle": [0, 2.65, 5.2],
    "cabRoof": [0, 2.3, 3.0],
    "axleFront": [0, 0.6, 2.8],
    "axleMid": [0, 0.6, 0.2],
    "axleRear": [0, 0.6, -2.8],
    "legFrontL": [1.45, 1.1, 2.2],
    "legRearL": [1.45, 1.1, -2.4],
    "footFrontL": [2.9, 0, 3.0],
    "footRearL": [2.9, 0, -3.4]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.75, -0.4], "dir": [0, 1, 0], "role": "hinge", "group": "gun" },
    { "name": "gun", "parent": "turret", "at": [0, 2.55, -0.4], "dir": [0, 0, 1], "role": "hinge", "group": "gun" },
    { "name": "wheelFL", "parent": "body", "at": [1.85, 0.6, 2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.85, 0.6, 0.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.85, 0.6, -2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.85, 0.6, 2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.85, 0.6, 0.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.85, 0.6, -2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFL", "parent": "body", "at": [1.45, 1.1, 2.2], "dir": [1, -0.7, 0.3], "role": "leg", "group": "stabilisers" },
    { "name": "legRL", "parent": "body", "at": [1.45, 1.1, -2.4], "dir": [1, -0.7, -0.3], "role": "leg", "group": "stabilisers" },
    { "name": "legFR", "parent": "body", "at": [-1.45, 1.1, 2.2], "dir": [-1, -0.7, 0.3], "role": "leg", "group": "stabilisers" },
    { "name": "legRR", "parent": "body", "at": [-1.45, 1.1, -2.4], "dir": [-1, -0.7, -0.3], "role": "leg", "group": "stabilisers" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured chassis: lofted/faceted lower tub and upper hull with sloped glacis and tail, panelled olive paint with riveted seams (clockwork panelled over hull paint), yellow hazard stripes on the lower skirt and rear bumper, deck plating with hatches and grab rails, side armour skirts over wheel arches, and a rear engine deck with vents and exhaust stacks. Stencilled unit number and emblem decals on the flanks.",
      "box": [[-1.9, 0.5, -4.5], [1.9, 1.95, 4.5]],
      "attaches": "Sits on the wheels and carries the cab at cabRoof, the turret at turretRing, and the leg sockets at legFrontL and legRearL.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Angular command cab at the front of the hull: wedge body, slit glass visor with a drawn cyan HUD texture, roof hatch and antenna cluster, sensor pod, two headlights with lamp glow, hazard trim, and a sloped front armour plate with a tow hook.",
      "box": [[-1.5, 1.7, 2.0], [1.5, 2.6, 4.4]],
      "attaches": "Sits on the hull deck at deckTop y=1.75 with its roof at cabRoof; it stays clear of the turret ring and the gun path, which passes above it.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "wheels",
      "builds": "Six large chunky low-poly tyres with tread blocks painted or extruded, faceted steel rims with bolt rings and hub caps, axle housings, suspension arms and shock absorbers linking to the hull, and mud-splash paint at the bottom. All the tyres rest on y = 0 and are 1.2 m in diameter. Each tyre spins on its wheel joint.",
      "box": [[-2.3, 0, -3.5], [2.3, 1.2, 3.5]],
      "attaches": "Wheels are centred on the axleFront, axleMid and axleRear lines at x = ±1.85, and suspension arms reach in to the hull sides at x = ±1.6.",
      "joints": ["wheelFL", "wheelML", "wheelRL", "wheelFR", "wheelMR", "wheelRR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs: a hull-side mounting block, a thick hydraulic upper strut with a piston sleeve, and an angled lower leg ending in a wide square footpad with a hazard-striped rim and ground-grip ribs. The legs extend diagonally outward and down, and they separate wider than the tyres. They carry yellow warning bands, glowing red status lamps and exposed hydraulic hoses (swept tubes).",
      "box": [[-3.3, 0, -3.8], [3.3, 1.5, 3.4]],
      "attaches": "Roots on the hull sides at legFrontL, legRearL and their mirrors at x = ±1.45, y = 1.1; the footpads at footFrontL and footRearL (x ±2.9) rest on y = 0.",
      "joints": ["legFL", "legRL", "legFR", "legRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "railgun",
      "builds": "The signature railgun. A rotating turret base with a ring bearing and armoured housing at turretRing, a cradle with trunnions at gunPivot, and a very long barrel assembly: two parallel gunmetal rails with a cyan glow gap between them, ring coils (glowing neon cyan) spaced along the barrel, a recoil sleeve, a heavy breech block with a power cable bundle and capacitor banks (boxes with glowing indicator strips), a muzzle brake with a glowing tip at muzzle, and yellow warning bands. A small drawn-texture warning label sits on the breech.",
      "box": [[-1.3, 1.75, -4.3], [1.3, 3.0, 5.4]],
      "attaches": "The turret base sits on the hull at turretRing (y = 1.75) and the barrel pivots at gunPivot, with its tip at muzzle (z = 5.2) held above the cab roof so it clears cabRoof by at least 0.3 m.",
      "joints": ["turret", "gun"],
      "floor": false,
      "budget": 220
    }
  ]
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStabilisers({ b, J, P }: any) {
  const HAZ = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${P.trim}"/>` +
      [0, 1, 2, 3, 4].map((i) => `<path d="M${i * 24 - 40} 64 L${i * 24 - 16} 0 L${i * 24 - 4} 0 L${i * 24 - 28} 64Z" fill="#1a1a1a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const steelP = paint((p, n) =>
    mix(P.steel, P.gunmetal, 0.35 * smoothstep(0.3, 0.8, noise(p, 0.15, 3)) + 0.25 * smoothstep(0.5, -0.8, n.y)),
  );
  const legs: [string, number, number, number][] = [
    ["legFL", 1, 2.2, 3.0],
    ["legRL", 1, -2.4, -3.4],
    ["legFR", -1, 2.2, 3.0],
    ["legRR", -1, -2.4, -3.4],
  ];
  for (const [name, s, hz, fz] of legs) {
    const bone = J[name];
    const root = new THREE.Vector3(s * 1.45, 1.1, hz);
    const knee = new THREE.Vector3(s * 2.15, 0.85, hz + (fz - hz) * 0.35);
    const foot = new THREE.Vector3(s * 2.9, 0.22, fz);
    // mounting block
    b.part(new THREE.BoxGeometry(0.5, 0.5, 0.7), P.hullDark, { bone, at: [s * 1.6, 1.1, hz] });
    b.part(new THREE.BoxGeometry(0.1, 0.62, 0.8), P.trim, { bone, at: [s * 1.87, 1.1, hz] });
    // upper strut + sleeve
    b.rod(root, knee, 0.15, steelP, { bone, sides: 8 });
    const mid = root.clone().lerp(knee, 0.4);
    b.rod(root.clone().lerp(knee, 0.12), mid, 0.2, P.gunmetal, { bone, sides: 8 });
    b.rod(mid, mid.clone().lerp(knee, 0.18), 0.215, P.trim, { bone, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.gunmetal, { bone, at: knee });
    // lower leg
    const lowTop = knee.clone();
    const lowBot = new THREE.Vector3(foot.x, 0.35, foot.z);
    b.rod(lowTop, lowBot, [0.15, 0.12], steelP, { bone, sides: 8 });
    b.rod(lowTop.clone().lerp(lowBot, 0.3), lowTop.clone().lerp(lowBot, 0.5), 0.17, P.trim, { bone, sides: 8 });
    // footpad
    b.part(new THREE.BoxGeometry(1.0, 0.2, 1.0), P.hullDark, { bone, at: [foot.x, 0.1, foot.z] });
    b.part(new THREE.BoxGeometry(1.04, 0.08, 1.04), HAZ, { bone, at: [foot.x, 0.16, foot.z], texture: HAZ });
    b.part(new THREE.BoxGeometry(0.5, 0.14, 0.5), P.steel, { bone, at: [foot.x, 0.27, foot.z] });
    for (let i = -2; i <= 2; i++)
      b.part(new THREE.BoxGeometry(0.9, 0.025, 0.06), P.gunmetal, { bone, at: [foot.x, 0.005 + 0.02, foot.z + i * 0.18] });
    // status lamp
    glow(b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), P.warnRed, { bone, at: [s * 1.95, 1.2, hz + 0.3] }), 2);
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.warnRed, { bone, at: [foot.x, 0.35, foot.z + 0.3] }), 2);
    // hydraulic hose
    const hose = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 1.75, 0.95, hz - 0.2),
      new THREE.Vector3(s * 2.0, 0.55, hz + (fz - hz) * 0.2),
      new THREE.Vector3(s * 2.45, 0.75, hz + (fz - hz) * 0.5),
      new THREE.Vector3(s * 2.8, 0.5, fz - 0.15),
    ]).getPoints(8).map((v) => [v.x, v.y, v.z]);
    b.sweep(hose, 0.035, { bone, color: P.tyre, sides: 5 });
  }
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";

export function buildWheels({ b, J, P, M }: any) {
  const R = 0.6;
  const W = 0.5;
  const rand = rng(11);

  const tyrePaint = paint((p, n) => {
    const mud = smoothstep(0.35, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.15, 3));
    const base = mix("#1c1d20", "#141517", noise(p, 0.1, 1));
    return mix(base, "#5a4631", mud * 0.7);
  });

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#555b63" stroke="#2a2d33" stroke-width="3"/>` +
      `<circle cx="32" cy="32" r="12" fill="#8a919b" stroke="#2a2d33" stroke-width="2"/>` +
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return `<circle cx="${32 + Math.cos(a) * 21}" cy="${32 + Math.sin(a) * 21}" r="3" fill="#2a2d33"/>`;
      }).join("") +
      `<path d="M32 22 L32 42 M22 32 L42 32" stroke="#2a2d33" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.8], ["wheelML", 1, 0.2], ["wheelRL", 1, -2.8],
    ["wheelFR", -1, 2.8], ["wheelMR", -1, 0.2], ["wheelRR", -1, -2.8],
  ];

  for (const [name, s, z] of wheels) {
    const bone = J[name];
    const cx = s * 1.85;
    const c = new THREE.Vector3(cx, R, z);
    const ax: [number, number, number] = [s, 0, 0];

    // tyre body (octagonal chunky)
    b.part(new THREE.CylinderGeometry(R, R, W, 16), tyrePaint, { bone, at: c, dir: ax, flat: true });
    // tread blocks
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const g = new THREE.BoxGeometry(W * 0.95, 0.07, 0.17);
      b.part(g, P.tyre, {
        bone,
        at: [cx, R + Math.sin(a) * (R + 0.02), z + Math.cos(a) * (R + 0.02)],
        rotation: [(-a * 180) / Math.PI + 90 + 90 - 90, 0, 0],
      });
    }
    // sidewall rim ring + hub
    const outer = cx + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), P.rim, {
      bone, at: [outer, R, z], dir: ax, flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 8), P.steel, {
      bone, at: [outer + s * 0.05, R, z], dir: ax, flat: true,
    });
    b.part(new THREE.CircleGeometry(0.38, 16), "#ffffff", {
      bone, at: [outer + s * 0.03, R, z], dir: [s, 0, 0], axis: "z", texture: hubTex,
    });
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), P.gunmetal, {
        bone,
        at: [outer + s * 0.05, R + Math.sin(a) * 0.3, z + Math.cos(a) * 0.3],
        dir: ax,
      });
    }

    // axle housing (rides hull)
    b.rod([s * 1.55, R, z], [s * 1.62, R, z], 0.2, P.gunmetal, { bone: J.body });
    b.part(new THREE.BoxGeometry(0.22, 0.3, 0.34), P.hullDark, {
      bone: J.body, at: [s * 1.62, R + 0.1, z], flat: true,
    });
    // suspension arms
    for (const dz of [-0.28, 0.28]) {
      b.rod([s * 1.6, 0.95, z + dz * 1.4], [s * 1.7, R + 0.1, z + dz], 0.05, P.steel, { bone: J.body });
    }
    // shock absorber
    b.rod([s * 1.62, 1.15, z + 0.1], [s * 1.62, 0.75, z + 0.3], 0.045, P.trim, { bone: J.body });
    b.rod([s * 1.62, 0.95, z + 0.2], [s * 1.62, 0.75, z + 0.3], 0.06, P.steel, { bone: J.body });
    // mudguard strip
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.9), P.hullDark, {
      bone: J.body, at: [s * 1.62, 1.22, z], flat: true,
    });
  }

  // axle shafts bridging pairs
  for (const z of [2.8, 0.2, -2.8])
    b.rod([-1.6, R, z], [1.6, R, z], 0.07, P.gunmetal, { bone: J.body });
  void rand; void M;
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const armour = panelled(
    paint((p, n) => {
      const t = noise(p, 0.3, 4);
      const base = mix(P.hull, P.hullLight, n.y > 0.5 ? 0.5 : 0);
      return mix(base, P.hullDark, smoothstep(0.55, 0.9, t) * 0.5);
    }),
    { size: 0.5, rivets: 0.1 },
  );
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at: at as any, rotation: rot as any, flat: true });

  // base wedge body (sloped front via extrude in side profile)
  b.extrude(
    [
      [2.0, 1.7],
      [4.4, 1.7],
      [4.4, 2.0],
      [3.75, 2.3],
      [3.2, 2.3],
      [2.7, 2.6],
      [2.0, 2.6],
    ],
    { at: [-1.4, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.8, color: armour, bone: body },
  );
  // sloped front plate
  box(2.9, 0.08, 0.75, P.hullLight, [0, 2.0, 4.05], [-40, 0, 0]);
  // tow hook
  b.rod([0, 1.85, 4.42], [0, 1.85, 4.62], 0.05, P.steel, { bone: body });
  b.torus?.call;
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone: body, at: [0, 1.85, 4.66], rotation: [0, 0, 0] });
  // hazard trim along bottom front
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#17181a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(2.9, 0.2), "#ffffff", {
    bone: body, at: [0, 1.82, 4.43], dir: [0, 0, 1], axis: "z", texture: hazard,
  });
  // visor
  box(2.5, 0.22, 0.1, P.gunmetal, [0, 2.38, 3.3], [-20, 0, 0]);
  const hud = svg(
    `<svg viewBox="0 0 100 20"><rect width="100" height="20" fill="#0d4a5c"/>
    <path d="M4 14 H30 M4 8 H22 M70 6 H96 M78 14 H96" stroke="#2ff3ff" stroke-width="1.5"/>
    <circle cx="50" cy="10" r="5" fill="none" stroke="#2ff3ff" stroke-width="1.2"/><path d="M50 3V17M43 10H57" stroke="#2ff3ff" stroke-width=".8"/></svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.3, 0.18), "#ffffff", {
      bone: body, at: [0, 2.38, 3.36], dir: [0, 0.34, 0.94], axis: "z", texture: hud,
    }),
    0.6,
  );
  // side cheeks
  for (const s of [1, -1]) {
    box(0.12, 0.7, 1.6, P.hullDark, [s * 1.46, 2.0, 3.0]);
    // headlights
    glow(b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.14, 8), P.lamp, {
      bone: body, at: [s * 1.1, 1.95, 4.4], dir: [0, 0, 1],
    }), 1.5);
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.12), P.trim, { bone: body, at: [s * 1.1, 2.16, 4.38] });
    // antenna
    b.rod([s * 1.1, 2.6, 2.3], [s * 1.2, 3.1, 2.25], [0.02, 0.01], P.steel, { bone: body });
  }
  // roof hatch
  b.lathe([[0, 0], [0.4, 0], [0.34, 0.1], [0, 0.12]], { at: [0.5, 2.6, 2.6], color: P.hullDark, bone: body });
  b.part(new THREE.TorusGeometry(0.2, 0.03, 4, 8), P.trim, {
    bone: body, at: [0.5, 2.73, 2.6], rotation: [90, 0, 0],
  });
  // sensor pod
  b.part(new THREE.SphereGeometry(0.2, 7, 5), P.gunmetal, { bone: body, at: [-0.6, 2.72, 2.5], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone: body, at: [-0.6, 2.78, 2.69] }), 2);
  b.rod([-0.6, 2.6, 2.5], [-0.6, 2.62, 2.5], 0.1, P.steel, { bone: body });
  // antenna cluster base
  box(0.3, 0.12, 0.3, P.steel, [-1.2, 2.62, 2.3]);
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.warnRed, { bone: body, at: [1.2, 3.14, 2.25] }), 2);
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildRailgun({ b, J, P, M }: any) {
  const T = J.turret, G = J.gun;
  const [gx, gy, gz] = M.gunPivot;
  const [tx, ty, tz] = M.turretRing;
  const ARMOR = panelled(P.hull, { size: 0.35, rivets: 0.07 });
  const DARKP = panelled(P.hullDark, { size: 0.3, rivets: 0.08 });
  const RAILP = metal("iron");
  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, dir });

  // Turret base
  cyl(1.05, 1.15, 0.12, 16, P.gunmetal, [tx, ty + 0.06, tz], T);
  cyl(0.95, 0.95, 0.1, 16, P.trim, [tx, ty + 0.17, tz], T);
  cyl(0.9, 1.0, 0.45, 8, ARMOR, [tx, ty + 0.45, tz], T);
  for (const s of [1, -1]) {
    box(0.5, 0.6, 1.6, ARMOR, [s * 0.85, gy - 0.1, tz], T);
    box(0.1, 0.62, 1.62, P.trim, [s * 1.12, gy - 0.1, tz], T);
    cyl(0.17, 0.17, 0.3, 8, P.steel, [s * 1.1, gy, gz], G, [1, 0, 0]);
    box(0.5, 0.2, 1.0, DARKP, [s * 0.85, gy + 0.25, tz - 0.2], T, [0, 0, s * 10]);
  }
  box(1.5, 0.12, 1.4, DARKP, [0, ty + 0.72, tz - 0.2], T);

  // Breech
  box(0.9, 0.7, 1.3, ARMOR, [0, gy, gz - 0.7], G);
  box(0.8, 0.5, 0.2, P.hullDark, [0, gy + 0.05, gz - 1.45], G);
  box(1.0, 0.1, 1.3, P.trim, [0, gy + 0.38, gz - 0.7], G);
  const label = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" rx="3" fill="#e7b814"/><path d="M32 6 L54 34 H10Z" fill="none" stroke="#111" stroke-width="4"/><rect x="30" y="16" width="4" height="9" fill="#111"/><rect x="30" y="27" width="4" height="4" fill="#111"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone: G, at: [0.46, gy + 0.05, gz - 0.9], dir: [1, 0, 0], axis: "z", texture: label });
  b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone: G, at: [-0.46, gy + 0.05, gz - 0.9], dir: [-1, 0, 0], axis: "z", texture: label });
  // Capacitor banks
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      box(0.34, 0.4, 0.34, P.gunmetal, [s * 0.65, gy + 0.55, gz - 1.1 + i * 0.4], G);
      glow(box(0.3, 0.05, 0.3, P.neonCyan, [s * 0.65, gy + 0.78, gz - 1.1 + i * 0.4], G), 1.3);
    }
  // Cable bundle
  for (let k = 0; k < 3; k++)
    b.sweep([[0.15 * (k - 1), gy + 0.3, gz - 1.4], [0.2 * (k - 1), gy + 0.9, gz - 1.7], [0.3 * (k - 1), gy + 0.5, gz - 2.0]],
      0.045, { bone: G, color: k == 1 ? P.warnRed : P.gunmetal });

  // Recoil sleeve and barrel core
  box(0.7, 0.55, 2.0, ARMOR, [0, gy, gz + 0.9], G);
  cyl(0.3, 0.3, 1.3, 8, P.steel, [0, gy, gz + 0.9], G, [0, 0, 1]);
  for (const z of [0.0, 1.8]) box(0.74, 0.6, 0.1, P.trim, [0, gy, gz + z], G);

  // Rails
  const L0 = gz + 1.9, L1 = 5.1, len = L1 - L0, mid = (L0 + L1) / 2;
  for (const s of [1, -1]) {
    box(0.22, 0.4, len, RAILP, [s * 0.34, gy, mid], G);
    box(0.08, 0.42, len, P.gunmetal, [s * 0.5, gy, mid], G);
    box(0.1, 0.1, len, P.steel, [s * 0.34, gy + 0.24, mid], G);
  }
  glow(box(0.3, 0.12, len, P.neonCyan, [0, gy, mid], G), 1.6);
  box(0.6, 0.12, len, P.gunmetal, [0, gy - 0.26, mid], G);
  // Coils
  const n = 7;
  for (let i = 0; i < n; i++) {
    const z = L0 + 0.3 + (i * (len - 0.6)) / (n - 1);
    const c = cyl(0.62, 0.62, 0.12, 8, P.neonCyan, [0, gy, z], G, [0, 0, 1]);
    glow(c, 1.5);
    box(0.9, 0.12, 0.05, P.gunmetal, [0, gy + 0.55, z - 0.0], G);
  }
  // Warning bands
  for (const z of [L0 + 0.1, mid]) box(0.8, 0.5, 0.08, P.trim, [0, gy, z + 0.55], G);
  // Muzzle brake
  box(0.9, 0.62, 0.55, P.gunmetal, [0, gy, 5.0], G);
  for (const s of [1, -1]) {
    box(0.05, 0.4, 0.4, P.steel, [s * 0.47, gy, 5.0], G);
    box(0.5, 0.05, 0.4, P.steel, [0, gy + 0.32, 5.0], G);
  }
  glow(box(0.3, 0.14, 0.08, P.neonCyan, [0, gy, 5.3], G), 2);
  box(0.92, 0.12, 0.12, P.trim, [0, gy, 4.8], G);
  // Barrel lamps
  for (const s of [1, -1]) glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.warnRed, { bone: T, at: [s * 0.95, ty + 0.75, tz + 0.7] }), 1.5);
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { paint, svg, rng, countershade, stripes } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const armor = panelled(
    countershade(P.hullLight, P.hull, { level: 0.2 }),
    { size: 0.45, aspect: 0.6, rivets: 0.09 },
  );
  const dark = panelled(P.hullDark, { size: 0.4, rivets: 0.1 });
  const hazard = stripes(P.trim, P.gunmetal, { size: 0.22, axis: "x", width: 0.5, wobble: 0 });
  const hazardZ = stripes(P.trim, P.gunmetal, { size: 0.22, axis: "z", width: 0.5, wobble: 0 });

  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opt });

  // lower tub
  b.frustumBox([0, 0.95, -4.3], [0, 0.95, 4.0], [3.5, 0.9], [3.5, 0.9], { bone, color: dark });
  // upper hull slab
  b.frustumBox([0, 1.5, -4.0], [0, 1.5, 3.1], [3.6, 0.9], [3.4, 0.9], { bone, color: armor });
  // sloped glacis
  b.slab(
    [[-1.7, 1.05, 3.1], [1.7, 1.05, 3.1], [1.5, 1.95, 2.9], [-1.5, 1.95, 2.9]].map((p) => p as any),
    { bone, color: armor, thickness: 0.12 },
  );
  b.extrude(
    [[0, 0], [1.1, 0], [0.1, 0.9]],
    { at: [1.85, 1.05, 3.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.12, bone, color: armor },
  );
  b.extrude(
    [[0, 0], [1.1, 0], [0.1, 0.9]],
    { at: [-1.85, 1.05, 3.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.12, bone, color: armor },
  );
  // nose wedge
  b.extrude([[0, 0], [1.4, 0], [0, 0.8, "sharp"]], {
    at: [-1.7, 1.0, 3.6], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.2, bone, color: armor,
  });
  // tail slope
  b.extrude([[0, 0], [0.8, 0], [0, 0.8]], {
    at: [0, 1.0, -4.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 3.4, bone, color: dark,
  });

  // side skirts + wheel arch covers, hazard trim
  for (const s of [1, -1]) {
    for (const z of [2.8, 0.2, -2.8]) {
      b.part(new THREE.CylinderGeometry(0.85, 0.85, 0.16, 8), P.hullDark, {
        bone, at: [s * 1.82, 0.95, z], dir: [1, 0, 0],
      });
    }
    box(0.14, 0.5, 8.4, hazard, [s * 1.9, 0.85, -0.3]);
    box(0.2, 0.3, 8.0, armor, [s * 1.88, 1.4, -0.3]);
    for (const z of [1.5, -1.3]) box(0.22, 0.7, 1.1, armor, [s * 1.9, 1.3, z]);
    // leg sockets
    for (const z of [2.2, -2.4]) {
      box(0.5, 0.6, 0.8, P.hullDark, [s * 1.7, 1.1, z]);
      box(0.1, 0.4, 0.6, P.trim, [s * 1.97, 1.1, z]);
    }
    // grab rails
    for (const z of [-3, 1.6]) {
      b.rod([s * 1.55, 2.0, z], [s * 1.55, 2.0, z + 1.2], 0.03, P.steel, { bone });
      for (const dz of [0, 1.2]) b.rod([s * 1.55, 1.95, z + dz], [s * 1.55, 2.05, z + dz], 0.03, P.steel, { bone });
    }
    // headlights guards / mudguards
    box(0.3, 0.1, 1.0, P.trim, [s * 1.8, 1.7, 3.0]);
  }

  // deck plating
  box(3.2, 0.1, 5.8, armor, [0, 1.98, -1.0]);
  for (const z of [-3.5, -2.4, -1.5, 1.0, 2.0]) box(3.0, 0.03, 0.04, P.hullDark, [0, 2.04, z]);
  // turret ring
  b.part(new THREE.CylinderGeometry(1.25, 1.35, 0.14, 12), P.gunmetal, { bone, at: [M.turretRing[0], 1.82, M.turretRing[2]] });
  b.part(new THREE.CylinderGeometry(1.05, 1.05, 0.06, 12), P.steel, { bone, at: [0, 1.9, -0.4] });
  // hatches
  for (const [x, z] of [[-1.0, 1.3], [1.0, 1.3], [-1.0, -2.2]]) {
    b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.1, 8), P.hullDark, { bone, at: [x, 2.07, z] });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), P.steel, { bone, at: [x, 2.15, z] });
    b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 8), P.trim, { bone, at: [x, 2.1, z], rotation: [90, 0, 0] });
  }

  // engine deck
  box(3.0, 0.45, 1.8, dark, [0, 2.2, -3.5]);
  for (let i = 0; i < 6; i++) box(2.5, 0.04, 0.08, P.gunmetal, [0, 2.45, -2.9 - i * 0.26 + 0.2]);
  for (const s of [1, -1]) {
    const x = s * 1.1;
    b.part(new THREE.CylinderGeometry(0.15, 0.18, 0.9, 8), P.steel, { bone, at: [x, 2.9, -4.0] });
    b.part(new THREE.CylinderGeometry(0.2, 0.15, 0.1, 8), P.gunmetal, { bone, at: [x, 3.0 - 0.0, -4.0] });
    b.part(new THREE.TorusGeometry(0.17, 0.03, 4, 8), P.trim, { bone, at: [x, 2.6, -4.0], rotation: [90, 0, 0] });
  }
  // cargo bay doors
  box(2.6, 1.0, 0.1, armor, [0, 1.5, -4.52]);
  box(0.06, 0.9, 0.12, P.hullDark, [0, 1.5, -4.54]);
  // rear bumper hazard
  box(3.8, 0.35, 0.25, hazardZ, [0, 0.8, -4.55]);
  box(3.8, 0.35, 0.25, hazard, [0, 0.8, 4.0]);
  for (const s of [1, -1]) {
    box(0.3, 0.15, 0.1, P.warnRed, [s * 1.5, 1.5, -4.6]);
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.lamp, { bone, at: [s * 1.5, 1.2, 4.0] });
  }
  // tow hook
  b.rod([0, 0.8, 4.1], [0, 0.8, 4.4], 0.06, P.steel, { bone });

  // decals
  const num = svg(
    `<svg viewBox="0 0 128 64"><text x="64" y="50" text-anchor="middle" font-family="Impact,sans-serif" font-weight="bold" font-size="56" fill="#e8e6d0" stroke="#222" stroke-width="1.5">R-07</text></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#222" stroke="#e7b814" stroke-width="4"/><path d="M32 10 L40 32 L32 54 L24 32Z" fill="#2ff3ff"/><path d="M8 32 H56" stroke="#e7b814" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const x = s * 1.985;
    b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", {
      bone, at: [x, 1.42, -1.4], dir: [s, 0, 0], axis: "z", texture: num,
    });
    b.part(new THREE.PlaneGeometry(0.55, 0.55), "#ffffff", {
      bone, at: [x, 1.42, 0.9 + 0.0], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
  }
  // dorsal rivet strip
  box(0.5, 0.06, 4.8, P.hullLight, [0, 2.06, 0.4], { scale: [1, 1, 1] });
}
```
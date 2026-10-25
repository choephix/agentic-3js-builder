<!-- call: plan -->

```json
{
  "name": "Longbow-6 Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military railgun carrier with a long twin-rail cannon on a turret, braced on four hydraulic stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [3.6, 3.0, 9.0],
  "layout": "Long heavy truck-like vehicle facing +Z. Front: angular armoured cab (cab sits z 2.6..4.3) with sloped glacis, slit windscreen with cyan glow visor, headlamps and a bull-bar. Middle and rear: a flat chassis deck (top y=1.45) carrying a rotating turret ring at z=-0.6 and a railgun whose twin rails run forward over the cab to a muzzle at z=4.8 (raised slightly, about 8 degrees elevation) and back into a breech housing with capacitor banks. Six big chunky wheels in three axles (z=3.2, -0.6, -3.2) at x=+-1.45, radius 0.62, resting on y=0. Four stabiliser legs fold out diagonally at the corners (outriggers at z=1.2 and z=-3.9, extending to x=+-1.75 footpads at y=0 with flat pads) braced down, slightly lifting nothing visibly. Style: blocky faceted low-poly armour plates, chamfered boxes, hazard-yellow stripe trim, panelled paints with rivets, cyan neon accents on rails, capacitors and visor (glow kit), dark gunmetal rails. Every part uses flat shading and a few decal textures: unit emblem, stencil numbers, hazard chevrons.",
  "palette": {
    "hull": "#4a5440",
    "hullDark": "#2f3629",
    "hullLight": "#6a7658",
    "gunmetal": "#2b2f38",
    "steel": "#8a919c",
    "rubber": "#16171a",
    "hazard": "#e7b814",
    "neonCyan": "#2ff3ff",
    "glassDark": "#12303a",
    "warnRed": "#c93a2a",
    "white": "#e8e8e0",
    "hydraulic": "#b9bec6"
  },
  "mounts": {
    "deckTop": [0, 1.45, 0],
    "cabRear": [0, 1.45, 2.4],
    "turretRing": [0, 1.45, -0.6],
    "gunPivot": [0, 2.35, -0.6],
    "muzzle": [0, 2.7, 4.8],
    "axleF": [0, 0.62, 3.2],
    "axleM": [0, 0.62, -0.6],
    "axleR": [0, 0.62, -3.2],
    "stabFL": [1.25, 1.0, 1.2],
    "stabFR": [-1.25, 1.0, 1.2],
    "stabRL": [1.25, 1.0, -3.9],
    "stabRR": [-1.25, 1.0, -3.9]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.45, -0.6], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gun", "parent": "turret", "at": [0, 2.35, -0.6], "dir": [0, 0.14, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.45, 0.62, 3.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.45, 0.62, 3.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.45, 0.62, -0.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.45, 0.62, -0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.45, 0.62, -3.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.45, 0.62, -3.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "stabFL", "parent": "body", "at": [1.25, 1.0, 1.2], "dir": [0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabFR", "parent": "body", "at": [-1.25, 1.0, 1.2], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabRL", "parent": "body", "at": [1.25, 1.0, -3.9], "dir": [0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabRR", "parent": "body", "at": [-1.25, 1.0, -3.9], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "stabilisers" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Main frame and deck between cab and tail: a chamfered box girder underbody (y 0.75..1.45), side skirts with panelled rivet paint in hull colours, wheel arches cut as dark recessed boxes over the three axles, rear bumper with tow hooks and tail lights (warnRed, glow), hazard-yellow chevron strips along the deck edges and rear, deck plating with hatch plates and cable conduits, turret-ring base (lathe collar, gunmetal, with ring teeth) at turretRing, fuel and equipment lockers on the sides, stencil numbers and unit emblem textures on flanks, and mounting stubs where the stabiliser legs attach at stabFL/FR/RL/RR (boxy sockets).",
      "box": [[-1.75, 0.7, -4.5], [1.75, 1.65, 2.4]],
      "attaches": "Cab starts at cabRear (z=2.4). Turret rides on turretRing. Wheels hang at axleF/M/R; stabiliser sockets at stab* mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Armoured front cab and nose from z=2.4 to 4.5: faceted sloped-glacis hull, angular roof with sensor mast and antenna, a slit windscreen with glassDark glass and neonCyan glowing visor strip, side vision ports, armoured door panels with handle and hazard stripes, headlamps (glow white), bull-bar/ram bumper with hazard chevrons, mirrors, roof light bar, exhaust stacks behind the cab, tow shackles, unit decal on the door. Panelled paint with rivets and subtle wear paint (darker low, lighter top). The cab roof is at about y=2.5 and the gun passes above it.",
      "box": [[-1.5, 0.75, 2.4], [1.5, 2.7, 4.5]],
      "attaches": "Rear face sits on cabRear against the chassis front. Front wheels' arches at axleF are cut into its lower sides.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "runningGear",
      "builds": "Six chunky low-poly wheels (radius 0.62, width 0.5): rubber tyres as 10-sided lathes with tread blocks ringed around, steel rim discs with bolt rings and a hub cap with a stencil textured disc, one wheel part per wheel on its wheel joint; axles/differential housings (gunmetal cylinders) and leaf-spring/suspension arms from each axle line to the chassis, plus mud flaps and mudguard fenders in hull colour with hazard edge, front-axle steering linkage. Wheels sit at x=+-1.45 at the three axle mounts, lowest points at y=0.",
      "box": [[-1.8, 0, -3.9], [1.8, 1.25, 3.9]],
      "attaches": "Wheel centres at axleF/axleM/axleR height 0.62, x=+-1.45; suspension arms reach in to the chassis girder at x=+-0.9.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed hydraulic outrigger legs: at each stab* mount a boxy hinge bracket with pin, a pivoting upper arm (frustumBox) sloping outward and down, a telescoping piston cylinder (steel/hydraulic colour, two stages) angled down to a wide octagonal footpad with ribbed underside resting flat on y=0 at x=+-1.9..+-2.0 (front z~1.2, rear z~-3.9), diagonal brace strut, hazard-yellow banding on the piston outer sleeve, warning red caution decals, hoses (thin sweeps) linking to the chassis, and small cyan status lights. Left and right mirrored. Footpads are the floor contact.",
      "box": [[-2.3, 0, -4.4], [2.3, 1.2, 1.7]],
      "attaches": "Upper ends at stabFL/FR/RL/RR mounts on the chassis sockets; each leg rides its own stab joint.",
      "joints": ["stabFL", "stabFR", "stabRL", "stabRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "turretGun",
      "builds": "Rotating turret and the railgun. Turret on the turretRing: low faceted armoured housing (y 1.45..2.9, z -2.2..0.9) with sloped panels, crew hatch, sensor domes, vents, rear breech housing with cyan-glowing capacitor cells in rows (glow), cable bundles, hazard stripes, panelled paint and a roman-numeral/emblem decal on the sides. The railgun on the gun joint at gunPivot, about 8 degrees elevation: two parallel gunmetal slab rails (box section) spaced 0.28 apart running from z=-1.5 to the muzzle at z=4.8 over the cab, with cyan glowing inner edge strips between the rails, insulating spacer blocks and clamp rings every 0.6 m (steel), a heavy recoil sleeve and hydraulic recoil cylinders at the rear, flared muzzle shroud with brake fins and a glowing cyan muzzle ring, elevation trunnion blocks on the turret sides, a bolt-on muzzle sight. The gun joint carries rails, spacers and muzzle; the turret joint carries the housing.",
      "box": [[-1.3, 1.45, -2.3], [1.3, 3.0, 4.9]],
      "attaches": "Turret base sits on turretRing (y=1.45); gun pivots at gunPivot; muzzle ends at the muzzle mount, passing above the cab roof (cab top y<=2.7).",
      "joints": ["turret", "gun"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = 0.62, W = 0.5;
  const rand = rng(11);
  const HAZ = P.hazard;

  const rubber = paint((p, n) => {
    const v = noise(p, 0.12, 3);
    const c = mix("#101113", "#25262b", v * 0.8 + 0.2 * smoothstep(0.3, 1, n.y));
    return c;
  });
  const hullPaint = panelled(P.hull, { size: 0.3, rivets: 0.07 });
  const gun = metal("iron", { tarnish: 0.3 });

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#8a919c" stroke="#2b2f38" stroke-width="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#e7b814" stroke-width="3" stroke-dasharray="8 4"/>
    <text x="32" y="40" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#12303a">06</text></svg>`,
    { size: 128 },
  );
  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    <path d="M0 16 L12 0 L24 0 L12 16Z M32 16 L44 0 L56 0 L44 16Z M64 16 L76 0 L64 0Z" fill="#16171a"/></svg>`,
    { size: 128 },
  );

  // Tyre profile: lathe about local Y axis, then oriented along the wheel axis
  const tyre = [
    [0.36, -W / 2], [0.52, -W / 2], [0.6, -W / 2 + 0.07], [R, -W / 2 + 0.14],
    [R, W / 2 - 0.14], [0.6, W / 2 - 0.07], [0.52, W / 2], [0.36, W / 2],
    [0.36, W / 2 - 0.05], [0.36, -W / 2 + 0.05],
  ].map(([x, y]) => [x, y] as [number, number]);
  // remove duplicate-ish last points issue: outline is fine (closed loop)

  const wheels: [string, number][] = [
    ["wheelFL", 3.2], ["wheelFR", 3.2], ["wheelML", -0.6], ["wheelMR", -0.6], ["wheelRL", -3.2], ["wheelRR", -3.2],
  ];

  for (const [name, z] of wheels) {
    const j = J[name];
    const s = name.endsWith("L") ? 1 : -1;
    const x = 1.45 * s;
    const c: [number, number, number] = [x, R, z];
    const ax: [number, number, number] = [s, 0, 0];
    b.lathe(tyre, { at: c, axis: ax, segments: 10, color: rubber, bone: j, name: `tyre.${name}` });
    // rim disc
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 10), P.steel, {
      bone: j, at: [x + s * (W / 2 - 0.06), R, z], dir: ax, flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 10), P.steel, {
      bone: j, at: [x - s * (W / 2 - 0.06), R, z], dir: ax, flat: true,
    });
    // hub cap with decal
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.08, 10), P.gunmetal, {
      bone: j, at: [x + s * (W / 2 + 0.0), R, z], dir: ax, flat: true,
    });
    b.part(new THREE.CircleGeometry(0.16, 16), "#ffffff", {
      bone: j, at: [x + s * (W / 2 + 0.045), R, z], dir: ax, axis: "z", texture: hubTex,
    });
    // bolt ring
    b.ring({ at: new THREE.Vector3(x + s * (W / 2 + 0.01), R, z), axis: new THREE.Vector3(s, 0, 0) } as any,
      { count: 8, radius: 0.28 }, (it) =>
      b.stick(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.gunmetal, it, { embed: 0.2, bone: j }));
    // tread blocks
    b.ring({ at: new THREE.Vector3(x, R, z), axis: new THREE.Vector3(s, 0, 0) } as any,
      { count: 20, radius: R - 0.01 }, (it) => {
      b.stick(new THREE.BoxGeometry(0.38, 0.09, 0.14), "#0b0b0d", it, { embed: 0.35, bone: j, flat: true });
    });
  }

  // axles + differentials
  for (const z of [3.2, -0.6, -3.2]) {
    b.rod([-1.45, R, z], [1.45, R, z], 0.09, P.gunmetal, { bone: J.body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.3, 8, 6), gun, { bone: J.body, at: [0, R, z], scale: [1, 0.85, 1], flat: true });
    // leaf springs and arms to chassis girder
    for (const s of [1, -1]) {
      b.frustumBox([s * 1.1, R + 0.12, z], [s * 0.9, 0.95, z], [0.14, 0.08], [0.2, 0.1], { bone: J.body, color: P.gunmetal });
      for (let k = 0; k < 3; k++) {
        b.rod([s * 0.55, R + 0.2 + k * 0.035, z - 0.45 + k * 0.05], [s * 0.55, R + 0.2 + k * 0.035, z + 0.45 - k * 0.05], 0.025, P.steel, { bone: J.body, sides: 4 });
      }
      b.rod([s * 1.3, R + 0.15, z], [s * 0.9, 0.92, z + 0.12], 0.04, P.steel, { bone: J.body, sides: 6 });
      // shock absorber
      b.rod([s * 1.0, R + 0.1, z + 0.28], [s * 0.82, 1.15, z + 0.28], 0.035, P.hydraulic, { bone: J.body, sides: 6 });
    }
  }

  // fenders and mud flaps
  for (const [, z] of [["F", 3.2], ["M", -0.6], ["R", -3.2]] as [string, number][]) {
    for (const s of [1, -1]) {
      const x = 1.45 * s;
      // arch fender: arched top slab
      b.part(new THREE.BoxGeometry(0.62, 0.07, 1.5), hullPaint, { bone: J.body, at: [x, 1.3, z], flat: true });
      b.part(new THREE.BoxGeometry(0.62, 0.07, 0.5), hullPaint, { bone: J.body, at: [x, 1.18, z + 0.9], rotation: [-30, 0, 0], flat: true });
      b.part(new THREE.BoxGeometry(0.62, 0.07, 0.5), hullPaint, { bone: J.body, at: [x, 1.18, z - 0.9], rotation: [30, 0, 0], flat: true });
      // hazard edge on outer side
      b.part(new THREE.BoxGeometry(0.04, 0.09, 1.5), HAZ, { bone: J.body, at: [x + s * 0.31, 1.3, z], flat: true });
      b.part(new THREE.PlaneGeometry(1.4, 0.07), "#ffffff", {
        bone: J.body, at: [x + s * 0.335, 1.3, z], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: stripeTex,
      });
      // mud flap behind wheel
      b.part(new THREE.BoxGeometry(0.5, 0.36, 0.04), P.rubber, { bone: J.body, at: [x, 0.52, z - 0.72], flat: true });
      b.part(new THREE.BoxGeometry(0.5, 0.05, 0.05), HAZ, { bone: J.body, at: [x, 0.36, z - 0.72], flat: true });
      b.part(new THREE.BoxGeometry(0.5, 0.05, 0.06), P.gunmetal, { bone: J.body, at: [x, 0.72, z - 0.72], flat: true });
    }
  }

  // steering linkage on front axle
  const zf = 3.2;
  b.rod([-1.3, 0.5, zf + 0.35], [1.3, 0.5, zf + 0.35], 0.04, P.steel, { bone: J.body, sides: 6 });
  for (const s of [1, -1]) {
    b.rod([s * 1.3, 0.5, zf + 0.35], [s * 1.45, 0.62, zf + 0.12], 0.035, P.steel, { bone: J.body, sides: 6 });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.hazard, { bone: J.body, at: [s * 1.3, 0.5, zf + 0.35] });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.hazard, { bone: J.body, at: [s * 1.45, 0.62, zf + 0.12] });
  }
  b.rod([0, 0.62, zf + 0.15], [0, 0.5, zf + 0.35], 0.04, P.gunmetal, { bone: J.body, sides: 6 });

  // drive shafts between axles
  b.rod([0, 0.6, 3.2], [0, 0.6, -0.6], 0.07, P.gunmetal, { bone: J.body, sides: 8 });
  b.rod([0, 0.6, -0.6], [0, 0.6, -3.2], 0.07, P.gunmetal, { bone: J.body, sides: 8 });
  void rand; void M;
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const HULL = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const t = noise(p, 0.5, 3);
      const base = mix(P.hullDark, P.hullLight, 0.35 + 0.4 * smoothstep(-0.3, 0.9, n.y));
      return mix(base, P.hullDark, 0.35 * t * smoothstep(0.6, -0.4, n.y) + (p.y < 1.0 ? 0.25 : 0));
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.12 },
  );
  const DECK = panelled(mix(P.hull, P.hullDark, 0.2), { size: 0.45, aspect: 1, rivets: 0.1 });
  const GUN = metal("iron");

  const box = (
    size: number[], at: number[], color: any, opts: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, flat: true, ...opts });

  // textures
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#1a1a1a"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#e8e8e0" stroke="#16171a" stroke-width="4"/>
    <path d="M32 8 L50 46 L32 38 L14 46Z" fill="#c93a2a" stroke="#16171a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M12 52 H52" stroke="#16171a" stroke-width="4"/></svg>`,
    { size: 192 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 128 48"><text x="64" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="42" fill="#e8e8e0">LB-06</text></svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 4 L45 42 H3Z" fill="#e7b814" stroke="#16171a" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="16" width="4" height="14" fill="#16171a"/><rect x="22" y="33" width="4" height="4" fill="#16171a"/></svg>`,
    { size: 128 },
  );

  const decal = (tex: any, at: number[], dir: number[], w: number, h: number, tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir, axis: "z", texture: tex });

  // girder underbody
  box([2.6, 0.7, 6.8], [0, 1.1, -1.1], HULL);
  box([3.0, 0.2, 6.9], [0, 0.82, -1.05], P.gunmetal);
  // chamfer wedges along the underbody
  for (const s of [1, -1])
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 6.8, 3), P.hullDark, {
      bone, at: [s * 1.35, 0.85, -1.1], rotation: [90, 0, s * 90], flat: true,
    });

  // deck
  box([3.3, 0.14, 6.8], [0, 1.52, -1.1], DECK);
  // side skirts
  for (const s of [1, -1]) {
    box([0.16, 0.6, 6.8], [s * 1.68, 1.15, -1.1], HULL);
    // hazard strips along deck edges
    b.part(new THREE.PlaneGeometry(6.6, 0.14), "#ffffff", {
      bone, at: [s * 1.6, 1.601, -1.1], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: hazardTex,
    });
    // upper trim along deck
    box([0.12, 0.1, 6.8], [s * 1.72, 1.52, -1.1], P.hullDark);
    // wheel arches (dark recessed)
    for (const z of [M.axleF[2], M.axleM[2], M.axleR[2]]) {
      if (z > 2.3) continue;
      box([0.14, 0.62, 1.5], [s * 1.7, 1.12, z], "#0d0f12");
      box([0.2, 0.08, 1.6], [s * 1.7, 1.46, z], P.hazard);
    }
    // front wheel arch edge at cab seam
    box([0.14, 0.62, 1.3], [s * 1.7, 1.12, 2.0], "#0d0f12");
    // lockers
    for (const z of [-1.9, 0.5, 1.4]) {
      const lk = box([0.34, 0.5, 0.8], [s * 1.55, 1.9, z], HULL);
      box([0.04, 0.34, 0.6], [s * 1.74, 1.9, z], P.hullDark);
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6), P.steel, {
        bone, at: [s * 1.78, 1.9, z + 0.25], rotation: [0, 0, 90], flat: true,
      });
      void lk;
    }
    // fuel cans on lockers
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.55, 8), P.hazard, {
      bone, at: [s * 1.5, 1.93, -3.2], rotation: [90, 0, 0], flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.55, 8), P.hullDark, {
      bone, at: [s * 1.5, 1.93, -3.8], rotation: [90, 0, 0], flat: true,
    });
    // flank decals
    decal(emblem, [s * 1.77, 1.2, -2.3], [s, 0, 0], 0.55, 0.55);
    decal(stencil, [s * 1.77, 1.2, -3.55], [s, 0, 0], 0.7, 0.26);
    decal(warn, [s * 1.77, 1.15, 1.45], [s, 0, 0], 0.26, 0.26);
    // stabiliser sockets
    for (const z of [1.2, -3.9]) {
      box([0.55, 0.5, 0.6], [s * 1.5, 1.0, z], P.gunmetal);
      box([0.3, 0.3, 0.7], [s * 1.8, 0.98, z], P.hullDark);
      b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.8, 8), P.steel, {
        bone, at: [s * 1.78, 1.0, z], rotation: [90, 0, 0], flat: true,
      });
      glow(box([0.08, 0.08, 0.08], [s * 1.9, 1.2, z + 0.35], P.neonCyan), 1.5);
    }
    // conduits
    b.rod([s * 1.1, 1.64, -4.3], [s * 1.1, 1.64, 2.2], 0.05, P.gunmetal, { bone, sides: 6 });
    b.rod([s * 0.9, 1.62, -4.3], [s * 0.9, 1.62, 2.2], 0.035, P.warnRed, { bone, sides: 6 });
  }

  // hatch plates
  for (const [x, z, w, d] of [[0.7, -2.4, 0.7, 0.9], [-0.8, -3.5, 0.8, 0.7], [0.8, 1.4, 0.6, 0.8], [-0.7, 0.9, 0.9, 0.6]] as number[][]) {
    box([w, 0.05, d], [x, 1.62, z], P.hullLight, { flat: true });
    box([w * 0.7, 0.03, d * 0.7], [x, 1.655, z], P.hullDark);
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.steel, { bone, at: [x, 1.69, z], flat: true });
  }

  // turret ring base
  const tr = M.turretRing;
  b.lathe(
    [[0, 0], [1.15, 0], [1.15, 0.1], [1.0, 0.16], [0.9, 0.2], [0, 0.2]],
    { at: [tr[0], 1.6, tr[2]], bone, color: P.gunmetal, segments: 20 },
  );
  b.lathe(
    [[0.9, 0], [1.25, 0], [1.25, 0.06], [0.9, 0.06]],
    { at: [tr[0], 1.62, tr[2]], bone, color: GUN, segments: 20 },
  );
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    box([0.1, 0.1, 0.1], [tr[0] + Math.sin(a) * 1.22, 1.72, tr[2] + Math.cos(a) * 1.22], P.steel, { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // rear bumper
  box([3.4, 0.4, 0.35], [0, 1.0, -4.55], P.gunmetal);
  b.part(new THREE.PlaneGeometry(3.2, 0.2), "#ffffff", { bone, at: [0, 1.0, -4.74], dir: [0, 0, -1], axis: "z", texture: hazardTex });
  box([3.5, 0.5, 0.3], [0, 1.4, -4.4], HULL);
  for (const s of [1, -1]) {
    glow(box([0.4, 0.2, 0.08], [s * 1.2, 1.4, -4.58], P.warnRed), 1.8);
    box([0.5, 0.28, 0.06], [s * 1.2, 1.4, -4.56], P.hullDark);
    // tow hooks
    b.sweep(
      [[s * 0.6, 0.95, -4.7], [s * 0.6, 0.95, -4.95], [s * 0.6, 0.78, -5.0], [s * 0.6, 0.7, -4.82]],
      0.04, P.steel, { bone, sides: 6 },
    );
    // rear chevron blocks
    b.part(new THREE.PlaneGeometry(0.9, 0.16), "#ffffff", { bone, at: [s * 0.8, 1.62, -4.45], dir: [0, 0, -1], axis: "z", texture: hazardTex });
  }
  // rear cab-side cross beam and front seam plate
  box([3.4, 0.5, 0.2], [0, 1.4, 2.3], P.hullDark);
  box([3.2, 0.06, 0.4], [0, 1.64, 2.2], P.hazard);
  // deck rear toolbox / winch
  box([1.2, 0.3, 0.5], [0, 1.8, -4.1], HULL);
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.9, 8), P.steel, { bone, at: [0, 1.95, -4.1], rotation: [0, 0, 90], flat: true });
  void R;
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);

  // wear paint: darker low, lighter top, panelled rivets
  const wear = (base: string, light: string, dark: string, seed: number) =>
    paint((p, n) => {
      const t = smoothstep(0.8, 2.6, p.y);
      let c = mix(dark, light, t);
      c = mix(c, base, 0.55);
      const grime = smoothstep(0.55, 0.8, noise(p, 0.18, seed));
      c = mix(c, dark, grime * 0.35 * (1 - n.y * 0.5));
      return mix(c, light, 0.25 * smoothstep(0.6, 1, n.y));
    });
  const HULL = panelled(wear(P.hull, P.hullLight, P.hullDark, 3), { size: 0.45, aspect: 0.75, rivets: 0.12 });
  const HULLD = panelled(wear(P.hullDark, P.hull, P.hullDark, 5), { size: 0.4, rivets: 0.1 });
  const STEEL = metal("steel", { tarnish: 0.3 });
  const IRON = metal("iron");

  // textures
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#16171a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#2f3629" stroke="#e8e8e0" stroke-width="4"/>
     <path d="M32 9 L50 40 L32 33 L14 40Z" fill="#e8e8e0"/><path d="M32 40 L42 54 L32 50 L22 54Z" fill="#e7b814"/>
     <rect x="30" y="4" width="4" height="12" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const NUM = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#e8e8e0">L-06</text></svg>`,
    { size: 128 },
  );
  const VISOR = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#2ff3ff"/><rect y="3" width="64" height="2" fill="#e0ffff"/><path d="M0 0H64M0 8H64" stroke="#12303a" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...opt, flat: true });

  // lower hull: loft with chamfer-ish stations
  b.frustumBox([0, 1.0, 2.45], [0, 1.0, 4.35], [2.9, 0.5], [2.5, 0.5], { bone: body, color: HULLD });
  // main cab block (rear), sloped glacis in front
  b.frustumBox([0, 1.5, 2.45], [0, 1.5, 3.55], [2.9, 1.0], [2.9, 1.0], { bone: body, color: HULL });
  b.frustumBox([0, 1.35, 3.5], [0, 1.35, 4.4], [2.7, 0.7], [2.3, 0.4], { bone: body, color: HULL });
  // glacis slope plate
  b.slab(
    [
      [-1.3, 1.7, 3.5],
      [1.3, 1.7, 3.5],
      [1.15, 1.25, 4.4],
      [-1.15, 1.25, 4.4],
    ],
    { color: HULL, thickness: 0.08, bone: body },
  );
  // roof: angular, tapers forward
  b.extrude(
    [
      [-1.4, 0],
      [1.4, 0],
      [1.2, 0.2],
      [-1.2, 0.2],
    ],
    { at: [0, 2.0, 2.5], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.0, color: HULL, bone: body },
  );
  b.extrude(
    [
      [0, 0],
      [1.05, 0],
      [0.9, 1.0],
      [0.65, 1.55],
      [0, 1.55],
    ],
    { at: [0, 2.0, 2.5], x: [0, 0, 1], y: [1, 0, 0], thickness: 0.25, color: HULL, bone: body },
  );
  // roof side-profile (extrude along x): wedge with sloped front
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [1.55, 0],
        [1.2, 0.5],
        [0.2, 0.5],
        [0, 0.35],
      ],
      { at: [s * 0.7, 2.0, 2.45], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.4, color: HULL, bone: body },
    );
  }
  box(1.4, 0.08, 1.5, HULLD, [0, 2.52, 2.95]);

  // windscreen slit + glow visor
  const glass = b.part(new THREE.BoxGeometry(2.0, 0.22, 0.05), P.glassDark, {
    bone: body, at: [0, 2.2, 3.57], rotation: [20, 0, 0], flat: true,
  });
  const vis = b.part(new THREE.PlaneGeometry(1.9, 0.12), "#ffffff", {
    bone: body, at: [0, 2.2, 3.61], dir: [0, 0.34, 0.94], axis: "z", texture: VISOR,
  });
  glow(vis, 1.6);
  b.part(new THREE.BoxGeometry(2.1, 0.05, 0.1), P.gunmetal, { bone: body, at: [0, 2.34, 3.58], rotation: [20, 0, 0], flat: true });
  b.part(new THREE.BoxGeometry(2.1, 0.05, 0.1), P.gunmetal, { bone: body, at: [0, 2.07, 3.55], rotation: [20, 0, 0], flat: true });

  for (const s of [1, -1]) {
    // side vision ports, doors
    box(0.04, 0.2, 0.6, P.glassDark, [s * 1.43, 2.1, 3.0]);
    box(0.05, 0.9, 1.1, HULLD, [s * 1.46, 1.55, 3.0]);
    box(0.06, 0.06, 0.2, P.steel, [s * 1.5, 1.6, 2.6]);
    b.part(new THREE.PlaneGeometry(0.8, 0.2), "#ffffff", {
      bone: body, at: [s * 1.5, 1.08, 3.0], dir: [s, 0, 0], axis: "z", texture: HAZ,
    });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: body, at: [s * 1.5, 1.8, 3.15], dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone: body, at: [s * 1.5, 1.5, 2.65], dir: [s, 0, 0], axis: "z", texture: NUM,
    });
    // wheel arch recesses
    box(0.12, 0.8, 1.15, P.rubber, [s * 1.48, 0.9, 3.2]);
    // mirrors
    b.rod([s * 1.45, 2.1, 3.3], [s * 1.8, 2.2, 3.35], 0.025, P.gunmetal, { bone: body });
    box(0.07, 0.3, 0.2, P.gunmetal, [s * 1.85, 2.2, 3.35]);
    // headlamps
    glow(box(0.35, 0.18, 0.06, P.white, [s * 0.95, 1.4, 4.42]), 1.8);
    box(0.4, 0.22, 0.04, P.gunmetal, [s * 0.95, 1.4, 4.39]);
    // exhaust stacks behind the cab
    const sx = s * 1.2;
    b.rod([sx, 1.9, 2.5], [sx, 2.65, 2.5], 0.09, STEEL, { bone: body, sides: 8 });
    b.rod([sx, 2.65, 2.5], [sx, 2.72, 2.5], 0.12, P.gunmetal, { bone: body, sides: 8 });
    box(0.28, 0.1, 0.2, P.gunmetal, [sx, 1.95, 2.5]);
    // tow shackles
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.steel, { bone: body, at: [s * 0.6, 0.9, 4.45], flat: true });
    // bull-bar posts
    box(0.12, 0.6, 0.12, P.gunmetal, [s * 1.0, 1.0, 4.4]);
    // hazard side stripes
    b.part(new THREE.PlaneGeometry(0.5, 0.16), "#ffffff", {
      bone: body, at: [s * 0.9, 0.98, 4.43], dir: [0, 0, 1], axis: "z", texture: HAZ,
    });
  }

  // bull bar / ram bumper
  box(2.9, 0.3, 0.2, P.gunmetal, [0, 0.95, 4.42]);
  box(2.2, 0.08, 0.1, P.gunmetal, [0, 1.25, 4.46]);
  b.part(new THREE.PlaneGeometry(2.6, 0.2), "#ffffff", {
    bone: body, at: [0, 0.95, 4.53], dir: [0, 0, 1], axis: "z", texture: HAZ,
  });
  for (const x of [-0.5, 0, 0.5]) box(0.06, 0.4, 0.06, P.gunmetal, [x, 1.1, 4.5]);
  // grille vents
  for (let i = 0; i < 4; i++) box(0.9, 0.04, 0.03, P.gunmetal, [0, 1.15 + i * 0.07 - 0.1, 4.0 + i * 0.0 + 0.0 + 0.0].map((v, k) => (k === 2 ? 4.38 : v)));

  // roof: sensor mast, antenna, light bar
  box(0.3, 0.2, 0.3, P.gunmetal, [-0.7, 2.62, 2.8]);
  b.rod([-0.7, 2.7, 2.8], [-0.7, 2.95 - 0.28, 2.8], 0.03, P.steel, { bone: body });
  b.part(new THREE.SphereGeometry(0.1, 6, 4), P.steel, { bone: body, at: [-0.7, 2.5 + 0.28, 2.8], flat: true });
  b.rod([0.85, 2.55, 2.55], [0.7, 2.68, 2.5], 0.012, P.gunmetal, { bone: body });
  b.rod([0.85, 2.55, 2.55], [0.95, 2.69, 2.55], 0.01, P.steel, { bone: body });
  box(1.0, 0.1, 0.12, P.gunmetal, [0, 2.6, 3.3]);
  for (let i = 0; i < 5; i++)
    glow(box(0.14, 0.08, 0.1, i % 2 ? P.warnRed : P.hazard, [-0.4 + i * 0.2, 2.67, 3.3]), 1.4);
  // dish
  b.part(new THREE.ConeGeometry(0.16, 0.08, 7), P.steel, { bone: body, at: [0.4, 2.6, 2.75], rotation: [-60, 0, 0], flat: true });

  // roof hazard strip & rear plate
  b.part(new THREE.PlaneGeometry(1.4, 0.14), "#ffffff", {
    bone: body, at: [0, 2.53 + 0.05, 3.5], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: HAZ,
  });
  box(2.6, 0.5, 0.06, HULLD, [0, 1.9, 2.43]);
  // cyan accent status lights
  for (const s of [1, -1]) glow(box(0.08, 0.05, 0.08, P.neonCyan, [s * 1.2, 2.4, 3.9]), 1.5);

  // hull details: rivet strips
  for (let i = 0; i < 3; i++) box(2.95, 0.04, 0.04, P.gunmetal, [0, 1.0 + i * 0.4, 3.6 + i * 0.05].map((v, k) => (k === 2 ? 2.45 : v)));
  void R;
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { mottle, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStabilisers({ b, J, P, M }: Ctx) {
  const HULL = mottle(P.hull, P.hullDark, { size: 0.35, seed: 4 });
  const PAD = mottle(P.gunmetal, P.hullDark, { size: 0.25, seed: 9 });

  const WARN = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#e8e8e0" stroke="#16171a" stroke-width="3"/>
     <path d="M32 9 L57 53 H7 Z" fill="#c93a2a" stroke="#16171a" stroke-width="3" stroke-linejoin="round"/>
     <rect x="29" y="23" width="6" height="16" fill="#e8e8e0"/><rect x="29" y="43" width="6" height="6" fill="#e8e8e0"/></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#16171a"/>
     <path d="M0 32 L16 0 H32 L16 32Z M32 32 L48 0 H64 L48 32Z" fill="#e7b814"/></svg>`,
    { size: 128 },
  );

  const legs: [string, number, number][] = [
    ["FL", 1, M.stabFL[2]],
    ["FR", -1, M.stabFR[2]],
    ["RL", 1, M.stabRL[2]],
    ["RR", -1, M.stabRR[2]],
  ];

  for (const [name, s, z] of legs) {
    const bone = J["stab" + name];
    const o = { bone, group: "stabilisers" };

    // chassis-side socket + hinge bracket
    b.part(new THREE.BoxGeometry(0.36, 0.5, 0.7), HULL, { ...o, at: [s * 1.82, 1.0, z], flat: true });
    b.part(new THREE.BoxGeometry(0.3, 0.12, 0.56), P.hullLight, { ...o, at: [s * 1.84, 1.3, z], flat: true });
    // clevis cheeks
    for (const dz of [-0.2, 0.2])
      b.part(new THREE.BoxGeometry(0.34, 0.34, 0.07), P.gunmetal, { ...o, at: [s * 2.0, 0.95, z + dz], flat: true });
    // hinge pin
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.62, 8), P.steel, { ...o, at: [s * 2.0, 0.95, z], dir: [0, 0, 1], flat: true });
    for (const dz of [-0.33, 0.33])
      b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), P.hazard, { ...o, at: [s * 2.0, 0.95, z + dz], dir: [0, 0, 1], flat: true });

    // upper pivoting arm
    const elbow: [number, number, number] = [s * 2.12, 0.78, z];
    b.frustumBox([s * 2.0, 0.95, z], elbow, [0.22, 0.26], [0.2, 0.2], { ...o, color: P.hull });
    b.part(new THREE.BoxGeometry(0.22, 0.22, 0.22), P.gunmetal, { ...o, at: elbow, flat: true });

    // piston: sleeve (hazard banded) + inner stages
    const padTop: [number, number, number] = [s * 1.96, 0.2, z];
    const mid: [number, number, number] = [s * 2.06, 0.5, z];
    b.rod(elbow, mid, 0.1, {
      ...o,
      sides: 8,
      color: P.hydraulic,
      bands: [
        [0.15, P.hazard],
        [0.3, P.rubber],
        [0.45, P.hazard],
        [0.6, P.rubber],
        [0.75, P.hazard],
        [1, P.hydraulic],
      ],
    });
    b.rod(mid, [s * 2.0, 0.34, z], 0.07, { ...o, sides: 8, color: P.steel });
    b.rod([s * 2.0, 0.34, z], padTop, 0.048, { ...o, sides: 8, color: P.steel });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 8), P.gunmetal, { ...o, at: mid, dir: [s * 0.1, 1, 0], flat: true });

    // footpad: octagonal lathe, ribs on top
    const px = s * 1.94;
    b.lathe(
      [
        [0, 0],
        [0.36, 0],
        [0.36, 0.07],
        [0.26, 0.13],
        [0.12, 0.2],
        [0, 0.2],
      ],
      { ...o, at: [px, 0, z], segments: 8, spin: 22.5, color: PAD },
    );
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.62, 0.04, 0.06), P.hazard, { ...o, at: [px, 0.14, z], rotation: [0, k * 45, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), P.steel, { ...o, at: [px, 0.22, z], flat: true });

    // diagonal brace strut
    const bs: [number, number, number] = [s * 1.76, 0.82, z + 0.28];
    b.rod(bs, [s * 2.03, 0.5, z + 0.07], 0.045, { ...o, sides: 6, color: P.gunmetal });
    b.part(new THREE.BoxGeometry(0.14, 0.14, 0.14), P.gunmetal, { ...o, at: bs, flat: true });

    // hose to the chassis
    b.sweep(
      [
        [s * 1.7, 1.25, z - 0.2],
        [s * 1.95, 1.2, z - 0.28],
        [s * 2.1, 0.95, z - 0.2],
        [s * 2.1, 0.6, z - 0.14],
      ],
      0.022,
      { ...o, color: P.rubber, sides: 6 },
    );

    // caution decal on bracket outer face + hazard chevron strip
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      ...o,
      at: [s * 2.005, 1.08, z - 0.08],
      dir: [s, 0, 0],
      axis: "z",
      texture: WARN,
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
      ...o,
      at: [s * 2.005, 0.86, z + 0.02],
      dir: [s, 0, 0],
      axis: "z",
      texture: CHEV,
    });

    // cyan status light
    glow(
      b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { ...o, at: [s * 1.82, 1.28, z + 0.3] }),
      1.6,
    );
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), P.gunmetal, { ...o, at: [s * 1.82, 1.25, z + 0.3], flat: true });
  }
}
```

<!-- call: turretGun -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng, aim } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildTurretGun({ b, J, P, M }: any) {
  const T = J.turret;
  const G = J.gun;
  const R = rng(11);
  const ELEV = Math.atan2(0.14, 1);
  const cosE = Math.cos(ELEV);
  const sinE = Math.sin(ELEV);
  const gp = M.gunPivot as number[];

  // gun-local -> model space (z forward along barrel, y up perpendicular)
  const gl = (x: number, y: number, z: number): [number, number, number] => [
    gp[0] + x,
    gp[1] + y * cosE + z * sinE,
    gp[2] + z * cosE - y * sinE,
  ];
  const gdir: [number, number, number] = [0, sinE, cosE];

  const WEAR = "#3a4232";
  const hullPaint = panelled(
    paint((p, n) => {
      const base = mix(P.hullDark, P.hullLight, smoothstep(1.6, 2.9, p.y) * 0.8 + 0.2 * noise(p, 0.3, 3));
      return mix(base, WEAR, 0.25 * smoothstep(0.55, 0.8, noise(p, 0.15, 5)));
    }),
    { size: 0.5, aspect: 0.6, rivets: 0.12 },
  );
  const railPaint = metal("iron", { polish: 0.5, tarnish: 0.1 });

  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8]
      .map((i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#16171a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#16171a" stroke="${P.hazard}" stroke-width="6"/><path d="M50 14 L80 70 L50 58 L20 70Z" fill="${P.white}"/><rect x="46" y="58" width="8" height="26" fill="${P.neonCyan}"/><text x="50" y="96" font-size="14" text-anchor="middle" font-family="monospace" font-weight="bold" fill="${P.white}">LB-VI</text></svg>`,
    { size: 128 },
  );
  const numerals = svg(
    `<svg viewBox="0 0 120 50"><text x="60" y="40" font-size="40" text-anchor="middle" font-family="monospace" font-weight="bold" fill="${P.white}">VI-06</text></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 3 L38 36 H2Z" fill="${P.warnRed}" stroke="#16171a" stroke-width="3"/><rect x="18" y="14" width="4" height="12" fill="#fff"/><rect x="18" y="29" width="4" height="4" fill="#fff"/></svg>`,
    { size: 64 },
  );

  const decal = (tex: any, at: number[], dir: number[], w: number, h: number, bone: any) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ---------- TURRET ----------
  // turret ring collar
  b.lathe(
    [[0, 0], [1.05, 0], [1.05, 0.12], [0.95, 0.16], [0, 0.16]],
    { at: [0, 1.45, -0.6], bone: T, color: P.gunmetal, segments: 12 },
  );
  // main housing: lower chamfered block + sloped upper
  b.frustumBox([0, 1.6, -0.65], [0, 2.1, -0.65], [2.5, 2.9], [2.5, 2.9], { bone: T, color: hullPaint });
  b.loft(
    [
      { at: [0, 2.12, -0.65], w: 2.5, h: 0.08 },
      { at: [0, 2.4, -0.55], w: 2.1, h: 0.4 },
      { at: [0, 2.7, -0.45], w: 1.5, h: 0.2 },
    ],
    { bone: T, color: hullPaint, section: "box" },
  );
  // front sloped glacis
  b.extrude(
    [[0, 0], [2.2, 0], [1.8, 0.5], [0.4, 0.5]],
    { at: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, color: hullPaint, bone: T },
  ).mesh.visible = false;
  b.frustumBox([0, 2.05, 0.45], [0, 2.55, 0.1], [2.2, 0.5], [1.6, 0.5], { bone: T, color: hullPaint });
  // rear breech housing
  b.frustumBox([0, 2.0, -1.65], [0, 2.0, -2.2], [2.0, 1.2], [1.8, 1.0], { bone: T, color: hullPaint });
  b.frustumBox([0, 2.55, -1.6], [0, 2.55, -2.15], [1.6, 0.35], [1.4, 0.3], { bone: T, color: P.hullDark });
  // hazard strips
  for (const s of [1, -1]) {
    decal(hazardTex, [s * 1.27, 1.7, -0.65], [s, 0, 0], 2.2, 0.16, T);
    decal(emblem, [s * 1.27, 2.1, 0.0], [s, 0, 0], 0.55, 0.55, T);
    decal(numerals, [s * 1.27, 2.1, -1.0], [s, 0, 0], 0.7, 0.3, T);
    decal(warn, [s * 1.01, 2.55, 0.35], [s, 0, 0], 0.22, 0.22, T);
  }
  decal(hazardTex, [0, 1.62, 0.8], [0, 0, 1], 2.3, 0.16, T);
  decal(hazardTex, [0, 1.62, -2.31], [0, 0, -1], 1.9, 0.16, T);

  // crew hatch
  b.lathe([[0, 0], [0.32, 0], [0.28, 0.07], [0, 0.07]], { at: [0.55, 2.78, -0.7], bone: T, color: P.hull, segments: 8 });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), P.steel, { bone: T, at: [0.55, 2.88, -0.7] });
  b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 8), P.steel, { bone: T, at: [0.55, 2.8, -0.7], rotation: [90, 0, 0] });
  // sensor domes
  for (const [x, z] of [[-0.6, -0.9], [-0.5, 0.2]]) {
    b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.08, 8), P.gunmetal, { bone: T, at: [x, 2.75, z] });
    b.part(new THREE.SphereGeometry(0.14, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.glassDark, { bone: T, at: [x, 2.78, z] });
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.neonCyan, { bone: T, at: [x, 2.88, z + 0.05] }), 1.5);
  }
  // vents on rear deck
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.BoxGeometry(1.2, 0.03, 0.08), P.gunmetal, { bone: T, at: [0, 2.74, -1.9 + i * 0.14] });
  }
  for (const s of [1, -1]) for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.03, 0.08, 0.5), "#16171a", { bone: T, at: [s * 1.03, 2.3 + i * 0.12, -1.85] });

  // capacitor cells (rear)
  for (const s of [1, -1]) for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
    const x = s * (0.3 + r * 0.38);
    const z = -1.75 - i * 0.12;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 6), P.gunmetal, { bone: T, at: [x, 2.74, z - 0.0 + 0.0] });
    glow(b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.3, 6), P.neonCyan, { bone: T, at: [x, 2.77, z] }), 1.6);
  }
  // cable bundles
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.5, 2.05, -1.55], [s * 0.7, 2.5, -1.4], [s * 0.35, 2.8, -1.0], [s * 0.25, 2.85, -0.2]],
      0.035,
      { bone: T, color: "#16171a", sides: 6 },
    );
    b.sweep([[s * 0.55, 2.05, -1.55], [s * 0.8, 2.45, -1.3], [s * 0.45, 2.8, -0.9]], 0.025, { bone: T, color: P.warnRed, sides: 6 });
  }
  // trunnion blocks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.3, 0.5, 0.6), P.hullDark, { bone: T, at: [s * 1.2, 2.35, -0.6] });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.25, 8), P.steel, { bone: T, at: [s * 1.38, 2.35, -0.6], rotation: [0, 0, 90] });
  }

  // ---------- GUN ----------
  const zr0 = -1.5, zr1 = 4.8;
  const railLen = zr1 - zr0;
  for (const s of [1, -1]) {
    const a = gl(s * 0.14 + s * 0.09, 0, zr0), c = gl(s * 0.14 + s * 0.09, 0, zr1);
    b.frustumBox(a, c, [0.18, 0.4], [0.18, 0.4], { bone: G, color: railPaint });
    // glowing inner edge strips
    const ia = gl(s * 0.115, 0.05, zr0 + 0.1), ic = gl(s * 0.115, 0.05, zr1 - 0.1);
    glow(b.rod(ia, ic, 0.018, P.neonCyan, { bone: G, sides: 4 }), 1.8);
  }
  // spacer blocks and clamp rings
  for (let z = -1.2; z <= 4.5; z += 0.6) {
    b.part(new THREE.BoxGeometry(0.2, 0.3, 0.14), P.hydraulic, { bone: G, at: gl(0, 0, z), dir: gdir, axis: "z" });
    b.part(new THREE.BoxGeometry(0.74, 0.1, 0.12), P.steel, { bone: G, at: gl(0, 0.24, z), dir: gdir, axis: "z" });
    b.part(new THREE.BoxGeometry(0.74, 0.1, 0.12), P.steel, { bone: G, at: gl(0, -0.24, z), dir: gdir, axis: "z" });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.1, 0.5, 0.12), P.steel, { bone: G, at: gl(s * 0.37, 0, z), dir: gdir, axis: "z" });
    if (Math.floor((z + 1.2) / 0.6) % 2 === 0)
      glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 0.04), P.neonCyan, { bone: G, at: gl(0, 0.3, z + 0.08), dir: gdir, axis: "z" }), 1.4);
  }
  // recoil sleeve
  b.part(new THREE.CylinderGeometry(0.34, 0.38, 1.1, 8), P.gunmetal, { bone: G, at: gl(0, 0, -1.0), dir: [gdir[0], gdir[1], gdir[2]] , flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.8, 0.5), P.hullDark, { bone: G, at: gl(0, 0, -1.7), dir: gdir, axis: "z" });
  // recoil cylinders
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    const a = gl(sx * 0.5, sy * 0.35, -1.9), c = gl(sx * 0.5, sy * 0.35, -0.3);
    b.rod(a, c, 0.06, P.hydraulic, { bone: G, sides: 6 });
    b.rod(gl(sx * 0.5, sy * 0.35, -1.3), gl(sx * 0.5, sy * 0.35, -0.7), 0.085, P.hazard, { bone: G, sides: 6 });
  }
  // glowing breech ring
  glow(b.part(new THREE.TorusGeometry(0.42, 0.03, 4, 12), P.neonCyan, { bone: G, at: gl(0, 0, -1.43), dir: gdir, axis: "z" }), 1.4);

  // muzzle shroud
  const m0 = gl(0, 0, 4.3), m1 = gl(0, 0, 4.95);
  b.frustumBox(m0, m1, [0.65, 0.8], [0.95, 1.05], { bone: G, color: P.gunmetal });
  for (let i = 0; i < 3; i++) for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.04, 0.9, 0.1), P.steel, { bone: G, at: gl(s * (0.56 + i * 0.0), 0, 4.45 + i * 0.17), dir: gdir, axis: "z" });
  }
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(1.0, 0.04, 0.5), P.steel, { bone: G, at: gl(0, s * 0.5, 4.65), dir: gdir, axis: "z" });
  glow(b.part(new THREE.TorusGeometry(0.4, 0.035, 4, 12), P.neonCyan, { bone: G, at: gl(0, 0, 4.97), dir: gdir, axis: "z" }), 2);
  // muzzle sight
  b.part(new THREE.BoxGeometry(0.14, 0.18, 0.3), P.hullDark, { bone: G, at: gl(0.5, 0.5, 4.1), dir: gdir, axis: "z" });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), P.glassDark, { bone: G, at: gl(0.5, 0.52, 4.3), dir: gdir });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: G, at: gl(0.5, 0.62, 4.0) }), 1.5);
}
```
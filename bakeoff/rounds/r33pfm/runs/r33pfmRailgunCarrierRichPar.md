<!-- call: plan -->

```json
{
  "name": "Longshot Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military carrier with a long electromagnetic railgun on a turret, braced on four deployed stabiliser legs.",
  "builderName": "longshotRailgunCarrier",
  "size": [4.6, 3.3, 9.0],
  "layout": "Heavy 6x6 truck-like carrier facing +Z. Front (z +3.0 to +4.5): angular armoured cab with a sloped windscreen (cyan glass decal, glowing), headlight bars and a bull-bar bumper. Mid and rear (z +3.0 to -4.5): long flat chassis deck with side skirts, three wheel axles (front z=2.6, middle z=-0.4, rear z=-3.2) with chunky 8-sided tyres. Rear deck carries a turret ring at z=-1.6 with a boxy turret and a long railgun (twin rails, coil rings glowing cyan, muzzle brake) pointing forward over the cab, elevated about 12 degrees. Four stabiliser legs are lowered to the ground at the corners (x=+-2.2, z=+2.0 and z=-3.8) as angled hydraulic struts with big square pads on y=0, wheels still touching the floor. Style: faceted low-poly, chunky armour plates in olive/dark grey, hazard yellow stripes on legs and bumpers, cyan glowing energy accents, panel seams and rivets painted on, decals for unit number and warning labels.",
  "palette": {
    "hull": "#4a5240",
    "hullDark": "#2f3529",
    "armor": "#5d6650",
    "metal": "#3a3f47",
    "steel": "#8a919c",
    "tyre": "#17191c",
    "hazard": "#e7b814",
    "glass": "#1a3c4a",
    "neonCyan": "#2ff3ff",
    "warnRed": "#d9342b",
    "white": "#e8ebe6",
    "rubber": "#26282b"
  },
  "mounts": {
    "chassisTop": [0, 1.5, 0],
    "cabFloor": [0, 1.5, 3.7],
    "turretRing": [0, 1.6, -1.6],
    "gunPivot": [0, 2.55, -1.2],
    "muzzle": [0, 2.95, 3.9],
    "axleFront": [0, 0.8, 2.6],
    "axleMid": [0, 0.8, -0.4],
    "axleRear": [0, 0.8, -3.2],
    "legFL": [1.9, 1.1, 2.0],
    "legFR": [-1.9, 1.1, 2.0],
    "legRL": [1.9, 1.1, -3.8],
    "legRR": [-1.9, 1.1, -3.8]
  },
  "joints": [
    { "name": "body", "at": [0, 1.1, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.6, -1.6], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gun", "parent": "turret", "at": [0, 2.55, -1.2], "dir": [0, 0.2, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.85, 0.8, 2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.85, 0.8, 2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.85, 0.8, -0.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.85, 0.8, -0.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.85, 0.8, -3.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.85, 0.8, -3.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFL", "parent": "body", "at": [1.9, 1.1, 2.0], "dir": [0.5, -1, 0.1], "role": "leg", "group": "stabilisers" },
    { "name": "legFR", "parent": "body", "at": [-1.9, 1.1, 2.0], "dir": [-0.5, -1, 0.1], "role": "leg", "group": "stabilisers" },
    { "name": "legRL", "parent": "body", "at": [1.9, 1.1, -3.8], "dir": [0.5, -1, -0.1], "role": "leg", "group": "stabilisers" },
    { "name": "legRR", "parent": "body", "at": [-1.9, 1.1, -3.8], "dir": [-0.5, -1, -0.1], "role": "leg", "group": "stabilisers" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Main frame and deck: long box-section chassis rails, a flat armoured rear/mid deck with panelled paint (seams, rivets, wear on edges, dark underside), side skirts with hazard-striped edges, wheel arches over all six wheel positions, fuel tanks and tool lockers on the flanks, rear ramp/bumper with tow hooks and tail lights (red), underbody axles, driveshaft and differential boxes (visible between wheels), a turret ring base at turretRing (steel lathe ring with bolt studs), unit number and warning decals on the skirts. Rides joint body.",
      "box": [[-2.0, 0.55, -4.5], [2.0, 1.6, 3.0]],
      "attaches": "Cab starts at chassis front face z=3.0; turret ring seat at mount turretRing; wheel arches enclose axleFront/axleMid/axleRear; leg sockets at legFL/FR/RL/RR on the flanks.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Forward armoured crew cab: faceted sloped hull with angular armour plates, large canted windscreen and side windows in glow-cyan-tinted glass (textured decals with frame lines), roof sensor pod and antenna whip, wing mirrors, headlight bars and fog lamps (glowing), bull-bar bumper with hazard stripes, front tow hooks, grille vents, door outlines with handles, exhaust stacks behind the cab, camo/panel paint in hull and armor colours, unit insignia decal on the door. Rides joint body.",
      "box": [[-1.9, 1.5, 3.0], [1.9, 3.0, 4.5]],
      "attaches": "Sits on chassis front face at mount cabFloor (z 3.0 to 4.5 region); gun barrel passes above its roof at muzzle height.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "runningGear",
      "builds": "All six wheels: chunky 8-sided tyres with painted tread blocks, steel hubs with lug nuts, hub caps with a cyan ring glow, centre-tyre-inflation hoses, suspension swing arms and shock absorbers with coil springs (using coil), mud flaps at each wheel (rubber), each wheel on its own wheel joint (wheelFL etc.), wheel radius about 0.8 and width 0.6 so lowest point touches y=0. Axle housings link left and right wheels at axleFront/axleMid/axleRear.",
      "box": [[-2.3, 0.0, -4.0], [2.3, 1.6, 3.2]],
      "attaches": "Wheels centred on axle mounts at x=+-1.85, y=0.8; suspension arms connect to the chassis underside at y 0.6 to 1.0.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs: each has a socket housing bolted to the chassis side, a hazard-striped outer hydraulic cylinder angled outward, a chrome inner piston rod, a knee hinge bracket, a lower strut reaching the ground and a big square footpad (with ribbed ground-grip underside, hazard corner marks and a small warning decal), hydraulic hoses (curved sweeps) and bolt rings. Legs are splayed outward to x about +-2.2 with the pads resting flat on y=0. Each leg uses its joints legFL/FR/RL/RR as the upper bone.",
      "box": [[-2.45, 0.0, -4.3], [2.45, 1.4, 2.5]],
      "attaches": "Upper ends at leg mounts legFL, legFR, legRL, legRR on the chassis flanks; feet rest on the floor outside the wheel track.",
      "joints": ["legFL", "legFR", "legRL", "legRR"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "railgun",
      "builds": "Rotating turret and railgun: boxy faceted turret housing on a lathe turret ring (turret joint), armour plates, sensor eye with glowing lens, ammunition feed box and capacitor banks on the sides with warning labels and cyan charge-level bar textures, hatch, then the gun on its elevation joint with trunnion cradles: a long breech block, twin parallel steel rails with insulating spacer blocks, a series of glowing cyan coil rings along the barrel, side heat-sink fins, a muzzle brake with cyan glow slot, cooling pipes and a recoil buffer cylinder; gun elevated about 12 degrees and extends over the cab to the muzzle mount. Hazard stripes on the breech, unit stencil decal on the turret.",
      "box": [[-1.5, 1.6, -3.0], [1.5, 3.3, 4.5]],
      "attaches": "Turret base sits on turretRing mount on the chassis; gun trunnion at gunPivot; muzzle ends near mount muzzle above the cab roof.",
      "joints": ["turret", "gun"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });

  const DECK = panelled(
    paint((p, n) => {
      const wear = noise(p, 0.25, 3);
      const base = mix(P.hull, P.armor, wear * 0.7);
      return n.y < -0.4 ? mix(base, P.hullDark, 0.7) : base;
    }),
    { size: 0.5, rivets: 0.12 },
  );
  const FRAME = panelled(metal("iron"), { size: 0.4, rivets: 0.1 });
  const STRIPE = paint((p) => (Math.floor((p.x + p.z + p.y) / 0.18) % 2 ? P.hazard : P.hullDark));

  // chassis rails
  for (const s of [1, -1]) {
    box(0.3, 0.45, 7.5, FRAME, [s * 0.9, 0.78, -0.75]);
    box(0.2, 0.2, 7.3, P.metal, [s * 0.9, 0.52, -0.75]);
  }
  for (let i = 0; i < 6; i++) box(1.9, 0.18, 0.2, P.metal, [0, 0.8, 2.6 - i * 1.28]);

  // deck
  box(3.6, 0.22, 7.4, DECK, [0, 1.38, -0.8]);
  box(3.2, 0.1, 7.2, P.hullDark, [0, 1.25, -0.8]);
  // deck edge rails
  for (const s of [1, -1]) {
    box(0.12, 0.14, 7.4, P.armor, [s * 1.8, 1.52, -0.8]);
  }
  // front/back faces
  box(3.6, 0.9, 0.15, P.armor, [0, 1.05, 2.95]);
  // grille-like front vents
  for (let i = 0; i < 5; i++) box(0.5, 0.06, 0.04, P.rubber, [-1.0 + i * 0.5, 1.05, 3.04]);

  // side skirts with hazard edges
  const skirtZ = [[1.6, 3.0], [-2.0, 1.0], [-4.3, -2.6]];
  for (const s of [1, -1]) {
    skirtZ.forEach(([z0, z1]) => {
      const len = z1 - z0, c = (z0 + z1) / 2;
      box(0.12, 0.5, len, P.hull, [s * 1.98, 1.0, c]);
      box(0.14, 0.08, len, STRIPE, [s * 1.98, 0.7, c]);
    });
  }

  // wheel arches
  const axles = [2.6, -0.4, -3.2];
  for (const z of axles) {
    for (const s of [1, -1]) {
      const arch = new THREE.CylinderGeometry(1.0, 1.0, 0.7, 10, 1, false, 0, Math.PI);
      b.part(arch, P.hullDark, { bone: body, at: [s * 1.85, 0.8, z], dir: [s, 0, 0], flat: true, scale: [1, 1, 1], rotation: [0, 0, 0] });
      box(0.75, 0.1, 2.1, P.armor, [s * 1.85, 1.83 > 1.6 ? 1.6 : 1.6, z]);
    }
  }

  // fuel tanks & lockers on flanks
  for (const s of [1, -1]) {
    const tank = b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.3, 8), P.steel, {
      bone: body, at: [s * 1.7, 0.95, -1.9], dir: [0, 0, 1], flat: true,
    });
    for (const dz of [-0.45, 0.45]) {
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), P.hazard, {
        bone: body, at: [s * 1.7, 0.95, -1.9 + dz], dir: [0, 0, 1], flat: true,
      });
    }
    box(0.35, 0.4, 1.1, P.metal, [s * 1.75, 1.0, 1.7]);
    box(0.04, 0.3, 0.9, P.hullDark, [s * 1.94, 1.0, 1.7]);
    box(0.05, 0.05, 0.15, P.steel, [s * 1.97, 1.0, 1.35]);
  }

  // underbody axles, diff, driveshaft
  for (const z of axles) {
    b.rod([-1.85, 0.8, z], [1.85, 0.8, z], 0.1, P.steel, { bone: body, sides: 8 });
    box(0.55, 0.4, 0.55, P.metal, [0, 0.72, z]);
  }
  b.rod([0, 0.7, 2.6], [0, 0.7, -3.2], 0.07, P.steel, { bone: body, sides: 6 });
  for (const z of [1.0, -1.8]) b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 6), P.hazard, { bone: body, at: [0, 0.7, z], dir: [0, 0, 1] });

  // rear bumper/ramp
  box(3.6, 0.5, 0.25, P.armor, [0, 0.95, -4.4]);
  box(3.4, 0.1, 0.27, STRIPE, [0, 0.72, -4.4]);
  const ramp = box(3.0, 0.08, 0.5, P.metal, [0, 0.62, -4.55], { rotation: [-15, 0, 0] });
  for (const s of [1, -1]) {
    // tow hook
    b.torus ? null : null;
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone: body, at: [s * 1.2, 0.85, -4.6] });
    // tail light
    glow(box(0.3, 0.16, 0.06, P.warnRed, [s * 1.5, 1.2, -4.52]), 1.3);
    box(0.36, 0.22, 0.04, P.hullDark, [s * 1.5, 1.2, -4.5]);
  }

  // turret ring base
  const ring = b.lathe(
    [[0, 0], [1.0, 0], [1.0, 0.1], [0.85, 0.2], [0, 0.2]],
    { at: [M.turretRing[0], 1.5, M.turretRing[2]], bone: body, color: metal("steel"), segments: 16 },
  );
  b.lathe([[0.88, 0.2], [1.05, 0.2], [1.05, 0.3], [0.88, 0.3]], {
    at: [0, 1.5, M.turretRing[2]], bone: body, color: P.metal, segments: 16,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6), P.steel, {
      bone: body, at: [Math.sin(a) * 0.97, 1.82, M.turretRing[2] + Math.cos(a) * 0.97],
    });
  }

  // leg sockets
  for (const s of [1, -1])
    for (const z of [2.0, -3.8]) {
      box(0.5, 0.6, 0.7, P.metal, [s * 1.95, 1.1, z]);
      box(0.12, 0.5, 0.6, STRIPE, [s * 2.0, 1.1, z]);
      for (const dz of [-0.25, 0.25]) b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, { bone: body, at: [s * 2.22, 1.25, z + dz], dir: [s, 0, 0] });
    }

  // decals on skirts
  const unit = svg(
    `<svg viewBox="0 0 100 50"><rect width="100" height="50" fill="#e8ebe6" opacity="0.0"/><text x="50" y="38" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="40" fill="#e8ebe6">LS-07</text></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 60 60"><path d="M30 4 L58 54 H2 Z" fill="#e7b814" stroke="#17191c" stroke-width="4"/><rect x="27" y="20" width="6" height="18" fill="#17191c"/><rect x="27" y="42" width="6" height="6" fill="#17191c"/></svg>`,
    { size: 96 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      bone: body, at: [s * 2.05, 1.05, -2.0 + 0.0], dir: [s, 0, 0], axis: "z", texture: unit,
    });
    b.part(new THREE.PlaneGeometry(0.35, 0.35), "#ffffff", {
      bone: body, at: [s * 2.05, 1.05, 0.7], dir: [s, 0, 0], axis: "z", texture: warn,
    });
  }

  // small top details: hatches and rivet strips on deck
  for (let i = 0; i < 3; i++) box(0.8, 0.05, 0.6, P.hullDark, [R() > 0.5 ? 1.0 : -1.0, 1.52, -3.6 + i * 0.1 - (i % 2) * 0.0 + i * 0.9 * 0]);
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { coil } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRunningGear({ b, J, P, M }: any) {
  const R = 0.8;
  const W = 0.6;
  const AX = 1.85;
  const rand = rng(11);

  // Tyre paint: dark rubber with lighter dusty wear on upward faces
  const TYRE = paint((p, n) => {
    const d = noise(p, 0.18, 3);
    const base = mix("#121417", "#26282b", d);
    return mix(base, "#4a4a42", 0.35 * smoothstep(0.4, 1, n.y) * d);
  });
  const STEELP = paint((p, n) => mix("#6e757f", "#aab1bb", noise(p, 0.05, 5) * 0.7 + 0.3 * smoothstep(0.3, 1, n.y)));
  const MUD = paint((p, n) => mix("#26282b", "#4d4636", smoothstep(0.9, 0.0, p.y) * 0.8 + 0.1 * n.y));

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1b2a30" stroke="#0b0f12" stroke-width="3"/>
     <circle cx="32" cy="32" r="21" fill="none" stroke="#2ff3ff" stroke-width="5"/>
     <circle cx="32" cy="32" r="11" fill="#3a3f47" stroke="#0b0f12" stroke-width="2"/>
     <circle cx="32" cy="32" r="4" fill="#8a919c"/></svg>`,
    { size: 128 },
  );
  const treadTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff"/>
     <path d="M0 8 L32 24 L64 8 M0 40 L32 56 L64 40" stroke="#555" stroke-width="7" fill="none"/></svg>`,
    { size: 64 },
  );
  void treadTex;
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
     <path d="M0 16 L16 0 L28 0 L12 16Z M32 16 L48 0 L60 0 L44 16Z M-16 16 L0 0 L12 0 L-4 16Z" fill="#17191c"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["FL", 1, M.axleFront[2]], ["FR", -1, M.axleFront[2]],
    ["ML", 1, M.axleMid[2]], ["MR", -1, M.axleMid[2]],
    ["RL", 1, M.axleRear[2]], ["RR", -1, M.axleRear[2]],
  ];

  // Axle housings + differentials
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    b.rod([-AX + 0.3, R, z], [AX - 0.3, R, z], 0.1, P.metal, { bone: J.body, sides: 8 });
    b.part(new THREE.BoxGeometry(0.5, 0.42, 0.5), P.hullDark, { bone: J.body, at: [0, R, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8), P.steel, {
      bone: J.body, at: [0, R, z + 0.28], dir: [0, 0, 1], flat: true,
    });
    // upper cross link
    b.rod([-1.4, 0.95, z + 0.25], [1.4, 0.95, z + 0.25], 0.04, P.steel, { bone: J.body, sides: 6 });
  }

  for (const [name, s, z] of wheels) {
    const j = J["wheel" + name];
    const out: [number, number, number] = [s, 0, 0];
    const cx = s * AX;
    const c: [number, number, number] = [cx, R, z];

    // Tyre: 8-sided chunky
    b.part(new THREE.CylinderGeometry(R, R, W, 8), TYRE, { bone: j, at: c, dir: out, flat: true });
    // sidewall shoulders (slightly smaller ring bulge)
    for (const k of [-1, 1])
      b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.97, 0.06, 8), P.rubber, {
        bone: j, at: [cx + s * k * (W / 2 - 0.01), R, z], dir: out, flat: true,
      });
    // tread blocks around circumference
    const nb = 16;
    for (let i = 0; i < nb; i++) {
      const a = (i / nb) * Math.PI * 2;
      const y = R + Math.cos(a) * R * 1.0;
      const zz = z + Math.sin(a) * R * 1.0;
      b.part(new THREE.BoxGeometry(W * 0.92, 0.07, 0.22), P.tyre, {
        bone: j, at: [cx, y, zz], rotation: [(a * 180) / Math.PI, 0, 0], flat: true,
      });
    }
    // Hub (outer face)
    const hx = cx + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 8), STEELP, { bone: j, at: [hx, R, z], dir: out, flat: true });
    b.part(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 8), P.metal, {
      bone: j, at: [hx + s * 0.07, R, z], dir: out, flat: true,
    });
    // cyan ring hub cap decal
    glow(
      b.part(new THREE.CircleGeometry(0.3, 16), "#ffffff", {
        bone: j, at: [hx + s * 0.14, R, z], dir: out, axis: "z", texture: hubTex,
      }),
      1.4,
    );
    // lug nuts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6), P.steel, {
        bone: j, at: [hx + s * 0.06, R + Math.cos(a) * 0.38, z + Math.sin(a) * 0.38], dir: out, flat: true,
      });
    }
    // CTIS hose: stub from hub to axle
    b.sweep(
      [[cx - s * 0.1, R + 0.12, z + 0.05], [cx - s * 0.35, R + 0.3, z + 0.2], [cx - s * 0.65, R + 0.18, z + 0.1]],
      0.018, { bone: j, color: P.rubber, sides: 6 },
    );
    // inner brake disc / drum
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8), P.metal, {
      bone: J.body, at: [cx - s * (W / 2 + 0.1), R, z], dir: out, flat: true,
    });

    // Mud flap behind the wheel
    b.part(new THREE.BoxGeometry(0.5, 0.45, 0.05), MUD, {
      bone: J.body, at: [cx, 0.42, z - R - 0.12], flat: true,
    });
    b.part(new THREE.BoxGeometry(0.5, 0.08, 0.055), hazardTex ? P.hazard : P.hazard, {
      bone: J.body, at: [cx, 0.62, z - R - 0.12], flat: true,
    });
    b.rod([cx - 0.2, 0.74, z - R - 0.1], [cx + 0.2, 0.74, z - R - 0.1], 0.02, P.steel, { bone: J.body, sides: 6 });

    // Suspension: swing arm from chassis underside to axle
    const inner = s * 1.25;
    b.rod([inner, 0.85, z - 0.55], [cx - s * 0.2, R + 0.05, z], [0.07, 0.06], P.hullDark, { bone: J.body, sides: 6 });
    b.rod([inner, 0.65, z + 0.45], [cx - s * 0.25, R - 0.12, z + 0.1], 0.05, P.metal, { bone: J.body, sides: 6 });
    // Shock absorber
    const top: [number, number, number] = [s * 1.5, 1.0, z + 0.3];
    const bot: [number, number, number] = [s * 1.65, 0.62, z + 0.3];
    b.rod(top, [s * 1.58, 0.82, z + 0.3], 0.045, P.steel, { bone: J.body, sides: 6 });
    b.rod([s * 1.58, 0.82, z + 0.3], bot, 0.065, P.hazard, { bone: J.body, sides: 6 });
    b.sweep(coil(top, bot, 0.09, 6), 0.014, { bone: J.body, color: P.warnRed, sides: 5 });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.16), P.metal, { bone: J.body, at: top, flat: true });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.16), P.metal, { bone: J.body, at: bot, flat: true });
    // Bolts on the arm mount
    for (const dz of [-0.1, 0.1])
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.steel, {
        bone: J.body, at: [inner, 0.95, z - 0.55 + dz + 0.1], flat: true,
      });
  }

  // Driveshafts between axles
  const zs = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  for (let i = 0; i < 2; i++) {
    b.rod([0, 0.62, zs[i] - 0.3], [0, 0.62, zs[i + 1] + 0.3], 0.07, P.steel, { bone: J.body, sides: 8 });
    for (const t of [0.0, 1.0])
      b.part(new THREE.BoxGeometry(0.2, 0.2, 0.14), P.metal, {
        bone: J.body, at: [0, 0.62, t ? zs[i + 1] + 0.3 : zs[i] - 0.3], flat: true,
      });
  }
  void rand;
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, panelled } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildRailgun({ b, J, P, M }: Ctx) {
  const T = J.turret;
  const G = J.gun;
  const elev = 12 * Math.PI / 180;
  const ce = Math.cos(elev);
  const se = Math.sin(elev);

  // ---------- paints ----------
  const hullPaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const nz = noise(p, 0.3, 4);
    const base = mix(P.hull, P.armor, 0.3 + 0.5 * nz);
    const lit = mix(base, "#8c9680", 0.25 * smoothstep(0.5, 1, n.y));
    const seamU = Math.abs(((p.x * 2.2 + p.z * 2.0) % 1 + 1) % 1 - 0.5);
    return seamU > 0.47 ? mix(lit, "#14170f", 0.7) : lit;
  });
  const plated = panelled(P.armor, { size: 0.35, rivets: 0.07 });
  const darkPlated = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });

  // ---------- textures ----------
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15171a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const barTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#0b1418" stroke="#8a919c" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6]
      .map((i) => `<rect x="${5 + i * 8}" y="7" width="6" height="18" fill="${i < 5 ? P.neonCyan : "#123238"}"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const warnTex = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 4 L46 43 H2Z" fill="${P.hazard}" stroke="#15171a" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="16" width="4" height="15" fill="#15171a"/><rect x="22" y="34" width="4" height="4" fill="#15171a"/></svg>`,
    { size: 96 },
  );
  const stencilTex = svg(
    `<svg viewBox="0 0 96 48"><text x="48" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="${P.white}">R-07</text><rect x="4" y="4" width="88" height="3" fill="${P.white}"/></svg>`,
    { size: 192 },
  );
  const eyeTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#0b1418"/><circle cx="16" cy="16" r="10" fill="${P.neonCyan}"/><circle cx="16" cy="16" r="4" fill="#e8ffff"/><circle cx="11" cy="11" r="2" fill="#fff"/></svg>`,
    { size: 96 },
  );

  const flatTex = (geo: THREE.BufferGeometry, tex: any, at: number[], dir: number[], bone: any, up?: number[], gl = 0) => {
    const part = b.part(geo, "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });
    if (gl) glow(part, gl);
    return part;
  };

  // ---------- turret ring ----------
  b.lathe(
    [[0, 0], [1.25, 0], [1.25, 0.1], [1.12, 0.16], [1.0, 0.16], [0, 0.16]],
    { at: [0, 1.6, -1.6], bone: T, color: P.steel, segments: 16 },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.metal, {
      bone: T, at: [Math.sin(a) * 1.18, 1.78, -1.6 + Math.cos(a) * 1.18],
    });
  }

  // ---------- turret housing ----------
  const ty = 1.76;
  b.part(new THREE.BoxGeometry(2.2, 0.5, 2.0), darkPlated, { bone: T, at: [0, ty + 0.25, -1.6] });
  // upper housing: faceted loft
  b.loft(
    [
      { at: [0, 2.3, -2.5], w: 2.2, h: 0.7 },
      { at: [0, 2.45, -1.6], w: 2.5, h: 0.8 },
      { at: [0, 2.5, -0.7], w: 2.1, h: 0.7 },
    ],
    { bone: T, color: hullPaint, section: "box" },
  );
  // sloped front plate and rear plate
  b.extrude([[-0.95, 0], [0.95, 0], [0.7, 0.35], [-0.7, 0.35]], {
    at: [0, 2.7, -0.55], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.03, color: plated, bone: T,
  });
  for (const s of [1, -1]) {
    // side armour wedge plates
    b.extrude([[-0.9, 0], [0.9, 0], [0.6, 0.55], [-0.7, 0.6]], {
      at: [s * 1.3, 2.05, -1.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, bevel: 0.025, color: plated, bone: T,
    });
    // capacitor banks
    for (let k = 0; k < 3; k++) {
      const z = -2.2 + k * 0.62;
      b.part(new THREE.BoxGeometry(0.34, 0.6, 0.5), P.metal, { bone: T, at: [s * 1.5, 2.05, z] });
      b.part(new THREE.BoxGeometry(0.04, 0.5, 0.4), P.steel, { bone: T, at: [s * 1.69, 2.05, z] });
      flatTex(new THREE.PlaneGeometry(0.4, 0.2), barTex, [s * 1.72, 2.2, z], [s, 0, 0], T, undefined, 1.4);
    }
    // warning label
    flatTex(new THREE.PlaneGeometry(0.3, 0.3), warnTex, [s * 1.5, 1.95, -1.0], [s, 0, 0], T);
    flatTex(new THREE.PlaneGeometry(0.3, 0.3), warnTex, [s * 1.4 , 2.15, -1.0], [s, 0, 0], T);
    // ammo feed box
    b.part(new THREE.BoxGeometry(0.5, 0.5, 0.8), P.hullDark, { bone: T, at: [s * 1.25, 2.85, -2.2] });
    flatTex(new THREE.PlaneGeometry(0.7, 0.18), hazardTex, [s * 1.51, 2.85, -2.2], [s, 0, 0], T, undefined, 0);
    b.rod([s * 1.0, 2.7, -2.0], [s * 0.6, 2.7, -1.3], 0.05, P.rubber, { bone: T });
    // trunnion cradle plates
    b.part(new THREE.BoxGeometry(0.2, 0.7, 0.6), P.metal, { bone: T, at: [s * 0.62, 2.8, -1.2] });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 8), P.steel, { bone: T, at: [s * 0.72, 2.55, -1.2], dir: [1, 0, 0] });
  }
  // rear bustle
  b.part(new THREE.BoxGeometry(1.8, 0.5, 0.5), P.hullDark, { bone: T, at: [0, 2.2, -2.7] });
  flatTex(new THREE.PlaneGeometry(1.0, 0.5), stencilTex, [0, 2.2, -2.96], [0, 0, -1], T);
  // hatch
  b.lathe([[0, 0], [0.4, 0], [0.36, 0.1], [0, 0.12]], { at: [-0.5, 2.88, -1.9], bone: T, color: P.armor, segments: 8 });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), P.steel, { bone: T, at: [-0.5, 3.04, -1.9] });
  b.rod([-0.5, 3.0, -1.9], [-0.1, 3.4, -2.3], 0.02, P.steel, { bone: T }); // antenna
  // sensor eye
  b.part(new THREE.BoxGeometry(0.5, 0.4, 0.5), P.metal, { bone: T, at: [0.6, 3.0, -2.0] });
  flatTex(new THREE.CircleGeometry(0.15, 10), eyeTex, [0.6, 3.0, -1.74], [0, 0, 1], T, undefined, 1.6);
  // hazard rim at ring top
  flatTex(new THREE.PlaneGeometry(2.0, 0.18), hazardTex, [0, 1.95, -0.58], [0, 0, 1], T);

  // ---------- gun (local frame helper along elevation) ----------
  const gp = M.gunPivot;
  const at = (z: number, y = 0, x = 0) => [x, gp[1] + y * ce + z * se, gp[2] + z * ce - y * se];
  const dirG = [0, se, ce];
  const L0 = 0.2;
  const L1 = 6.2;

  // breech block
  b.part(new THREE.BoxGeometry(0.9, 0.8, 1.3), P.metal, { bone: G, at: at(0.1), dir: dirG, axis: "z" });
  b.part(new THREE.BoxGeometry(0.7, 0.2, 1.2), plated, { bone: G, at: at(0.1, 0.5), dir: dirG, axis: "z" });
  flatTex(new THREE.PlaneGeometry(0.9, 0.2), hazardTex, at(0.1, 0.0, 0.46), [1, 0, 0], G);
  flatTex(new THREE.PlaneGeometry(0.9, 0.2), hazardTex, at(0.1, 0.0, -0.46), [-1, 0, 0], G);
  // trunnions
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.3, 8), P.steel, { bone: G, at: at(0, 0, s * 0.55), dir: [s, 0, 0] });
  }
  // recoil buffer
  b.part(new THREE.CylinderGeometry(0.16, 0.16, 1.0, 8), P.steel, { bone: G, at: at(-0.8), dir: dirG });
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8), P.white, { bone: G, at: at(-1.4), dir: dirG });
  b.part(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 8), P.hazard, { bone: G, at: at(-0.4), dir: dirG });

  // twin rails with spacers
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.26, L1 - L0), P.steel, { bone: G, at: at((L0 + L1) / 2, 0, s * 0.2), dir: dirG, axis: "z" });
    b.part(new THREE.BoxGeometry(0.06, 0.08, L1 - L0), P.white, { bone: G, at: at((L0 + L1) / 2, 0.15, s * 0.2), dir: dirG, axis: "z" });
  }
  const spacers = 8;
  for (let i = 0; i < spacers; i++) {
    const z = 0.9 + (i / (spacers - 1)) * 4.9;
    b.part(new THREE.BoxGeometry(0.28, 0.3, 0.22), P.rubber, { bone: G, at: at(z), dir: dirG, axis: "z" });
  }
  // glowing coil rings
  for (let i = 0; i < 7; i++) {
    const z = 1.5 + i * 0.7;
    const r = 0.36 - i * 0.012;
    const ring = b.lathe(
      [[r - 0.05, -0.07], [r + 0.04, -0.07], [r + 0.04, 0.07], [r - 0.05, 0.07]],
      { at: at(z), axis: dirG, color: P.neonCyan, segments: 8 },
    );
    ring.mesh && glow(ring, 1.6);
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.22), P.metal, { bone: G, at: at(z, r + 0.02), dir: dirG, axis: "z" });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.22), P.metal, { bone: G, at: at(z, -r - 0.02), dir: dirG, axis: "z" });
  }
  // heat sink fins on sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 9; i++) {
      const z = 0.5 + i * 0.22;
      b.part(new THREE.BoxGeometry(0.05, 0.5, 0.07), P.metal, { bone: G, at: at(z, 0, s * 0.52), dir: dirG, axis: "z" });
    }
    b.part(new THREE.BoxGeometry(0.06, 0.1, 2.0), P.hullDark, { bone: G, at: at(1.5, 0, s * 0.5), dir: dirG, axis: "z" });
    // cooling pipes
    b.rod(at(0.4, -0.35, s * 0.4), at(3.2, -0.38, s * 0.4), 0.05, P.steel, { bone: G });
  }
  // muzzle brake
  b.part(new THREE.BoxGeometry(0.62, 0.55, 0.9), P.metal, { bone: G, at: at(L1 + 0.35), dir: dirG, axis: "z" });
  b.part(new THREE.BoxGeometry(0.7, 0.12, 0.95), P.hullDark, { bone: G, at: at(L1 + 0.35, 0.3), dir: dirG, axis: "z" });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.04, 0.12, 0.6), P.neonCyan, { bone: G, at: at(L1 + 0.35, 0, s * 0.32), dir: dirG, axis: "z" }), 1.8);
  }
  glow(b.part(new THREE.BoxGeometry(0.3, 0.14, 0.04), P.neonCyan, { bone: G, at: at(L1 + 0.81), dir: dirG, axis: "z" }), 2);
  b.part(new THREE.BoxGeometry(0.3, 0.1, 0.2), P.hazard, { bone: G, at: at(L1 - 0.2, 0.18), dir: dirG, axis: "z" });
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildStabilisers({ b, J, P, M }: any) {
  const HAZ = P.hazard;
  const hazardPaint = paint((p) => {
    const k = Math.floor((p.y * 1.0 + p.z * 0.8 + p.x * 0.5) / 0.06);
    return k % 2 ? "#e7b814" : "#1c1c1c";
  });
  const padPaint = paint((p, n) => {
    const edge = Math.max(Math.abs(p.x % 1), 0);
    void edge;
    return n.y > 0.5 ? "#4b5260" : "#2b2f36";
  });
  const WARN = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#e8ebe6" stroke="#17191c" stroke-width="4"/>
     <path d="M32 10 L56 52 H8 Z" fill="#e7b814" stroke="#17191c" stroke-width="4" stroke-linejoin="round"/>
     <rect x="29" y="23" width="6" height="16" fill="#17191c"/><circle cx="32" cy="45" r="3.5" fill="#17191c"/></svg>`,
    { size: 96 },
  );
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const legs: [string, number, boolean][] = [
    ["FL", 1, true],
    ["FR", -1, true],
    ["RL", 1, false],
    ["RR", -1, false],
  ];

  for (const [id, s, front] of legs) {
    const hipJ = J["leg" + id];
    const z0 = front ? 2.0 : -3.8;
    const zf = front ? 1.3 : -4.05;
    const zk = (z0 + zf) / 2;
    const H = V(s * 2.0, 1.15, z0);
    const K = V(s * 2.3, 0.62, zk);
    const F = V(s * 2.1, 0.15, zf);

    const knee = b.joint(`stabilisersKnee${id}`, { parent: hipJ, at: K, aim: F, group: "stabilisers" });
    const foot = b.joint(`stabilisersFoot${id}`, { parent: knee, at: F, dir: [0, -1, 0], group: "stabilisers" });

    // socket housing bolted to chassis side
    b.part(new THREE.BoxGeometry(0.34, 0.56, 0.62), P.metal, { bone: hipJ, at: [s * 2.1, 1.12, z0] });
    b.part(new THREE.BoxGeometry(0.1, 0.62, 0.7), P.hullDark, { bone: hipJ, at: [s * 2.0, 1.12, z0] });
    const bolts: THREE.BufferGeometry[] = [];
    for (const dy of [-0.2, 0.2])
      for (const dz of [-0.24, 0.24])
        bolts.push(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6).rotateZ(Math.PI / 2).translate(s * 2.29, 1.12 + dy, z0 + dz));
    b.part(mergeGeometries(bolts)!, P.steel, { bone: hipJ, at: [0, 0, 0] });
    // pivot cap
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.4, 8), P.steel, { bone: hipJ, at: H, dir: [0, 0, 1] });

    // outer hydraulic cylinder (hazard)
    const mid = H.clone().lerp(K, 0.62);
    b.rod(H, mid, 0.13, hazardPaint, { bone: hipJ, sides: 8 });
    b.rod(mid, mid.clone().lerp(K, 0.1), 0.15, P.metal, { bone: hipJ, sides: 8 });
    // chrome piston rod
    const pStart = H.clone().lerp(K, 0.55);
    b.rod(pStart, K, 0.065, P.steel, { bone: knee, sides: 8 });

    // hose
    const o = V(s * 0.0, 0, 0.17);
    b.sweep(
      [H.clone().add(V(s * 0.1, 0.12, 0.16)), H.clone().lerp(K, 0.3).add(V(s * 0.25, 0.25, 0.3)), H.clone().lerp(K, 0.7).add(V(s * 0.1, 0.05, 0.2)).add(o)],
      0.022,
      { color: P.rubber, bone: hipJ, sides: 6 },
    );

    // knee bracket
    for (const dz of [-0.14, 0.14])
      b.part(new THREE.BoxGeometry(0.2, 0.32, 0.06), P.metal, { bone: knee, at: [K.x, K.y, K.z + dz] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 8), P.steel, { bone: knee, at: K, dir: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.16, 0.12, 0.22), HAZ, { bone: knee, at: [K.x + s * 0.05, K.y + 0.2, K.z] });

    // lower strut
    const top = K.clone().lerp(F, 0.12);
    b.rod(top, F.clone().add(V(0, 0.12, 0)), [0.11, 0.09], hazardPaint, { bone: knee, sides: 8 });
    b.rod(K.clone().lerp(F, 0.45), K.clone().lerp(F, 0.8), 0.13, P.metal, { bone: knee, sides: 8 });
    // ball joint
    b.part(new THREE.SphereGeometry(0.13, 8, 6), P.steel, { bone: foot, at: [F.x, F.y + 0.12, F.z] });

    // footpad
    b.part(new THREE.BoxGeometry(0.64, 0.12, 0.64), padPaint, { bone: foot, at: [F.x, 0.09, F.z] });
    b.part(new THREE.BoxGeometry(0.34, 0.06, 0.34), P.metal, { bone: foot, at: [F.x, 0.18, F.z] });
    const ribs: THREE.BufferGeometry[] = [];
    for (let i = -2; i <= 2; i++) ribs.push(new THREE.BoxGeometry(0.6, 0.04, 0.05).translate(F.x, 0.02, F.z + i * 0.12));
    b.part(mergeGeometries(ribs)!, P.hullDark, { bone: foot, at: [0, 0, 0] });
    const marks: THREE.BufferGeometry[] = [];
    for (const dx of [-1, 1])
      for (const dz of [-1, 1]) marks.push(new THREE.BoxGeometry(0.14, 0.014, 0.14).translate(F.x + dx * 0.25, 0.156, F.z + dz * 0.25));
    b.part(mergeGeometries(marks)!, HAZ, { bone: foot, at: [0, 0, 0] });
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: foot,
      at: [F.x + s * 0.0, 0.215, F.z + (front ? -0.0 : 0.0) + 0.2 * (front ? -1 : 1) * 0.0],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      texture: WARN,
    });
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: any; M: any };

export function buildCab({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // ---------- paints ----------
  const camo = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const a = noise(p, 0.5, 3);
    const c = noise(p, 0.25, 8);
    let col: any = mix(P.hull, P.armor, smoothstep(0.4, 0.6, a));
    if (c > 0.68) col = mix(col, P.hullDark, 0.8);
    const top = smoothstep(0.3, 0.9, n.y);
    col = mix(col, "#7d8868", top * 0.25);
    // panel seams
    const gx = Math.abs(((p.x + 5) % 0.6) - 0.3);
    const gz = Math.abs(((p.z + 5) % 0.5) - 0.25);
    if (gx > 0.292 || gz > 0.243) col = mix(col, "#14170f", 0.6);
    return col;
  });
  const plate = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const a = noise(p, 0.3, 21);
    let col: any = mix(P.armor, P.hull, a);
    col = mix(col, "#7d8868", smoothstep(0.4, 1, n.y) * 0.3);
    const g = Math.abs(((p.y + 5) % 0.35) - 0.175);
    if (g > 0.17) col = mix(col, "#14170f", 0.5);
    return col;
  });
  const hazardPaint = paint((p: THREE.Vector3) => {
    const k = Math.floor((p.x + p.y * 1.0 + 20) / 0.14) % 2;
    return k ? P.hazard : "#1b1b1b";
  });

  // ---------- textures ----------
  const glassTex = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#1a3c4a"/>
    <path d="M0 64 L50 0 L70 0 L20 64Z" fill="#2ff3ff" opacity="0.25"/>
    <path d="M60 64 L100 8 L108 8 L68 64Z" fill="#2ff3ff" opacity="0.18"/>
    <rect x="1.5" y="1.5" width="125" height="61" fill="none" stroke="#14170f" stroke-width="3"/>
    <path d="M64 0 V64" stroke="#14170f" stroke-width="3"/>
    <rect x="3" y="3" width="122" height="58" fill="none" stroke="#2ff3ff" stroke-width="1" opacity="0.7"/></svg>`,
    { size: 256 },
  );
  const sideGlass = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#1a3c4a"/>
    <path d="M0 40 L30 0 L40 0 L10 40Z" fill="#2ff3ff" opacity="0.25"/>
    <rect x="1.5" y="1.5" width="61" height="37" fill="none" stroke="#14170f" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const insignia = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#26282b" stroke="#e8ebe6" stroke-width="3"/>
    <path d="M32 10 L50 44 H14Z" fill="none" stroke="#e7b814" stroke-width="4" stroke-linejoin="round"/>
    <rect x="29" y="26" width="6" height="14" fill="#2ff3ff"/>
    <text x="32" y="58" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#e8ebe6">07</text></svg>`,
    { size: 128 },
  );
  const grille = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#14161a"/>
    ${[4, 11, 18, 25].map((y) => `<rect x="3" y="${y}" width="58" height="4" fill="#3a3f47"/>`).join("")}
    <rect x="1" y="1" width="62" height="30" fill="none" stroke="#8a919c" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const warn = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 4 L46 43 H2Z" fill="#e7b814" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
    <rect x="22" y="16" width="4" height="14" fill="#111"/><rect x="22" y="34" width="4" height="4" fill="#111"/></svg>`,
    { size: 96 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...opts });
  const decalPlane = (w: number, h: number, tex: any, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", up, texture: tex });
  const glowBox = (w: number, h: number, d: number, col: string, at: number[], s = 1.5) =>
    glow(box(w, h, d, col, at), s);

  // ---------- main hull (lower body) ----------
  box(3.7, 0.55, 1.5, camo, [0, 1.78, 3.75]);
  // cabin block, sloped front via frustumBox
  b.frustumBox([0, 2.0, 3.35], [0, 2.0, 3.35], [3.6, 0.1], [3.6, 0.1], { bone, color: P.hull, caps: "flat" });
  // upper cabin: loft with sloped front
  b.loft(
    [
      { at: [0, 2.2, 3.25], w: 3.5, h: 0.9 },
      { at: [0, 2.45, 3.6], w: 3.4, h: 0.9 },
      { at: [0, 2.6, 4.0], w: 3.1, h: 0.55 },
    ],
    { bone, color: camo, section: "box", caps: "flat" },
  );
  // roof plate
  box(3.0, 0.1, 1.05, plate, [0, 2.93, 3.55]);
  box(2.7, 0.06, 0.8, P.hullDark, [0, 3.0, 3.5]);
  // front sloped armour
  b.extrude(
    [[0, 0], [0.9, 0], [0.9, 0.35], [0.1, 0.5, "sharp"], [0, 0.45]],
    { at: [-1.8, 1.55, 4.5], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.04, color: P.hull, bone },
  );
  box(3.7, 0.5, 0.12, plate, [0, 1.85, 4.42]);
  // sloped hood plate
  box(3.5, 0.08, 0.75, camo, [0, 2.2, 4.1], { rotation: [-18, 0, 0] });
  // side angled plates
  for (const s of [1, -1]) {
    box(0.1, 0.75, 1.3, plate, [s * 1.82, 2.1, 3.7], { rotation: [0, 0, s * -4] });
    box(0.06, 0.2, 1.4, P.hullDark, [s * 1.85, 1.65, 3.75]);
    // armour wedge over wheel front corner
    b.extrude(
      [[0, 0], [0.5, 0], [0.5, 0.15], [0, 0.35, "sharp"]],
      { at: [s * 1.9, 1.5, 3.2], x: [0, 0, 1], thickness: 0.06, color: P.armor, bone },
    );
  }

  // ---------- windscreen ----------
  decalPlane(3.0, 0.62, glassTex, [0, 2.48, 4.015 + 0.0], [0, 0.45, 1], [0, 1, -0.4]);
  glow(
    b.part(new THREE.PlaneGeometry(3.0, 0.62), "#ffffff", {
      bone,
      at: [0, 2.58, 4.05],
      dir: [0, 0.45, 1],
      axis: "z",
      up: [0, 1, -0.4],
      texture: glassTex,
    }),
    0.6,
  );
  // windscreen frame
  box(3.15, 0.07, 0.07, P.hullDark, [0, 2.9, 3.92]);
  box(3.15, 0.07, 0.07, P.hullDark, [0, 2.3, 4.2]);
  for (const s of [1, -1]) box(0.07, 0.7, 0.07, P.hullDark, [s * 1.57, 2.6, 4.06], { rotation: [26, 0, 0] });
  // wipers
  for (const s of [1, -1]) box(0.9, 0.025, 0.03, "#111", [s * 0.7, 2.36, 4.17], { rotation: [26, 0, s * 8] });

  // ---------- side windows, doors ----------
  for (const s of [1, -1]) {
    decalPlane(1.0, 0.55, sideGlass, [s * 1.83, 2.55, 3.65], [s, 0, 0], [0, 1, 0]);
    // door outline panels
    box(0.04, 0.95, 1.15, plate, [s * 1.86, 2.1, 3.65]);
    box(0.05, 0.04, 1.2, P.hullDark, [s * 1.87, 1.62, 3.65]);
    box(0.05, 0.9, 0.04, P.hullDark, [s * 1.87, 2.1, 3.06]);
    box(0.05, 0.9, 0.04, P.hullDark, [s * 1.87, 2.1, 4.24]);
    // handle
    box(0.07, 0.05, 0.22, P.steel, [s * 1.9, 2.08, 3.35]);
    // insignia
    decalPlane(0.4, 0.4, insignia, [s * 1.885, 1.88, 3.85], [s, 0, 0]);
    decalPlane(0.17, 0.17, warn, [s * 1.885, 1.75, 3.3], [s, 0, 0]);
    // window frame
    box(0.05, 0.05, 1.08, P.hullDark, [s * 1.85, 2.83, 3.65]);
    box(0.05, 0.05, 1.08, P.hullDark, [s * 1.85, 2.27, 3.65]);
    // mirrors
    b.rod([s * 1.85, 2.55, 4.12], [s * 2.1, 2.7, 4.2], 0.02, P.metal, { bone });
    box(0.07, 0.4, 0.26, P.hullDark, [s * 2.15, 2.65, 4.2]);
    box(0.01, 0.34, 0.2, P.glass, [s * 2.115, 2.65, 4.2]);
  }

  // ---------- front: grille, headlights, bumper ----------
  decalPlane(1.5, 0.7, grille, [0, 1.85, 4.505], [0, 0, 1]);
  // headlight bars
  for (const s of [1, -1]) {
    glowBox(0.7, 0.1, 0.06, "#e8ebe6", [s * 1.2, 2.1, 4.48], 2);
    box(0.78, 0.18, 0.05, P.hullDark, [s * 1.2, 2.1, 4.46]);
    glowBox(0.16, 0.16, 0.06, "#e7b814", [s * 1.62, 1.72, 4.5], 1.5);
    box(0.24, 0.24, 0.04, P.hullDark, [s * 1.62, 1.72, 4.48]);
    // tow hooks
    b.sweep([[s * 0.8, 1.58, 4.45], [s * 0.8, 1.55, 4.65], [s * 0.8, 1.68, 4.72], [s * 0.8, 1.74, 4.62]], 0.035, {
      bone,
      color: P.steel,
      sides: 6,
    });
    box(0.12, 0.12, 0.12, P.metal, [s * 0.8, 1.6, 4.45]);
  }
  // bull-bar bumper
  box(3.6, 0.3, 0.2, hazardPaint, [0, 1.6, 4.58]);
  box(3.6, 0.04, 0.22, P.hullDark, [0, 1.76, 4.58]);
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 1.6, 4.62], [s * 1.2, 2.4, 4.58], 0.05, P.metal, { bone, sides: 6 });
    b.rod([s * 0.5, 1.6, 4.62], [s * 0.5, 2.2, 4.58], 0.05, P.metal, { bone, sides: 6 });
    box(0.35, 0.3, 0.18, P.metal, [s * 1.85, 1.62, 4.5], { rotation: [0, s * 25, 0] });
  }
  b.rod([-1.2, 2.4, 4.58], [1.2, 2.4, 4.58], 0.05, P.metal, { bone, sides: 6 });
  b.rod([-1.2, 2.0, 4.6], [1.2, 2.0, 4.6], 0.04, P.metal, { bone, sides: 6 });
  // fog lamps
  for (const s of [1, -1]) glowBox(0.18, 0.12, 0.05, "#e8ebe6", [s * 1.0, 1.62, 4.7], 1.8);
  // ID light strip cyan
  glowBox(2.4, 0.04, 0.04, P.neonCyan, [0, 2.8, 4.02], 1.6);

  // ---------- roof gear ----------
  // sensor pod
  b.lathe([[0, 0], [0.22, 0], [0.25, 0.08], [0.2, 0.2], [0.1, 0.26], [0, 0.27]], {
    at: [-0.9, 3.0, 3.4], bone, color: P.metal, segments: 8,
  });
  glow(b.part(new THREE.SphereGeometry(0.09, 6, 4), P.neonCyan, { bone, at: [-0.9, 3.17, 3.55] }), 2);
  box(0.5, 0.08, 0.3, P.hullDark, [-0.9, 2.99, 3.4]);
  // light bar on roof
  box(1.2, 0.1, 0.12, P.hullDark, [0.4, 3.03, 4.0]);
  for (let i = 0; i < 5; i++) glowBox(0.18, 0.06, 0.04, i % 2 ? P.hazard : "#e8ebe6", [0.0 + i * 0.2 - 0.0 + 0.0 - 0.0, 3.04, 4.07], 1.4);
  // antenna whip
  box(0.14, 0.1, 0.14, P.metal, [1.35, 3.0, 3.1]);
  b.spike([1.35, 3.03, 3.1], [0.05, 1, -0.03], 1.2, 0.03, { bone, color: P.steel, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.warnRed, { bone, at: [1.4, 4.2, 3.07] }), 2);
  // dish
  b.lathe([[0, 0.12], [0.16, 0.16], [0.17, 0.1], [0.1, 0.05], [0, 0]], {
    at: [0.9, 3.0, 3.2], bone, color: P.steel, segments: 8, axis: [0, 1, 0.3],
  });

  // ---------- exhaust stacks behind cab ----------
  for (const s of [1, -1]) {
    const x = s * 1.6;
    b.rod([x, 1.6, 3.12], [x, 3.0, 3.12], 0.09, P.metal, { bone, sides: 8 });
    for (const y of [1.9, 2.5]) b.rod([x, y, 3.12], [x, y + 0.06, 3.12], 0.12, P.steel, { bone, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.12, 0.09, 0.14, 8), P.hullDark, { bone, at: [x, 3.05, 3.12] });
    box(0.22, 0.1, 0.22, P.hazard, [x, 2.2, 3.12]);
    b.rod([x, 2.95, 3.12], [x * 0.9, 3.0, 3.12], 0.08, "#0d0e10", { bone });
  }

  // ---------- rivets on front plate and hull ----------
  const rivetGeo = new THREE.SphereGeometry(0.025, 4, 3);
  for (let i = 0; i < 14; i++) {
    const x = -1.65 + i * 0.254;
    b.part(rivetGeo, P.steel, { bone, at: [x, 1.65, 4.52] });
  }
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) b.part(rivetGeo, P.steel, { bone, at: [s * 1.9, 1.65, 3.15 + i * 0.22] });

  // ---------- armour ridge details on roof ----------
  for (const s of [1, -1]) {
    box(0.08, 0.1, 1.0, P.hullDark, [s * 1.3, 3.02, 3.55]);
    box(0.5, 0.05, 0.3, P.hazard, [s * 1.05, 3.0, 3.1]);
  }
  // rear cab wall details and cable conduit
  box(3.6, 0.9, 0.08, plate, [0, 2.3, 3.0]);
  for (let i = 0; i < 4; i++) box(0.12, 0.12, 0.05, P.metal, [-1.2 + i * 0.8, 2.0, 3.07]);
  // step plates
  for (const s of [1, -1]) {
    box(0.3, 0.05, 0.6, hazardPaint, [s * 1.98, 1.5, 3.65]);
    box(0.05, 0.2, 0.6, P.metal, [s * 1.85, 1.58, 3.65]);
  }
  // vents on hood
  for (let i = 0; i < 5; i++) box(0.5, 0.02, 0.05, "#111", [-0.0 + (i - 2) * 0.55 * 0.7, 2.26, 4.12 + 0.0], { rotation: [-18, 0, 0] });
}
```
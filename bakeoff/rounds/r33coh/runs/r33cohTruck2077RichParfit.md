<!-- call: plan -->

```json
{
  "name": "Warbringer 2077 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 heavy truck with armored cab, roof turret, neon trim and a modular cargo bed.",
  "builderName": "warbringerTruck2077",
  "size": [3.0, 3.4, 9.0],
  "layout": "Long angular 6x6 truck facing +Z. Front: sloped armored hood with a bull-bar bumper, a grille and light bars, then a tall wedge-shaped cab with slit glazing, a roof turret just behind the cab roof, then a long flat cargo bed with modular crates, a missile rack and rear lights. Three axles with big chunky wheels sit under the chassis at z=3.0, -0.4 and -2.6, resting on the floor. Chassis sits on a ladder frame between the wheels. Style: faceted hard-surface plates in dark gunmetal, hazard-yellow trim, cyan and magenta neon strips and glowing lights. Every part carries panelled paint, SVG decals (hex camo, warning stripes, serial numbers, kanji and glyphs) and glow accents.",
  "palette": {
    "hull": "#2e343f",
    "hullLight": "#4a5262",
    "hullDark": "#161a22",
    "trim": "#e7b814",
    "rubber": "#101114",
    "rim": "#6b7280",
    "glass": "#0c2a3a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "lightRed": "#ff2a2a",
    "lightWhite": "#f4fbff",
    "olive": "#4b5a3a",
    "steel": "#8a93a3",
    "brass": "#b98a44",
    "warn": "#ff7a1a"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "frontAxle": [0, 0.62, 3.0],
    "midAxle": [0, 0.62, -0.4],
    "rearAxle": [0, 0.62, -2.6],
    "cabFloor": [0, 1.3, 1.2],
    "cabRoof": [0, 2.75, 1.0],
    "turretRing": [0, 2.8, 0.0],
    "bedFloor": [0, 1.35, -2.0],
    "bumperFront": [0, 0.8, 4.5],
    "hoodFront": [0, 1.5, 3.6]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.25, 0.62, 3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.25, 0.62, 3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.25, 0.62, -0.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.25, 0.62, -0.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.25, 0.62, -2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.25, 0.62, -2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.8, 0.0], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.15, 0.35], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "doorL", "parent": "body", "at": [1.2, 1.9, 1.7], "dir": [0, 1, 0], "role": "hinge", "group": "cab" },
    { "name": "doorR", "parent": "body", "at": [-1.2, 1.9, 1.7], "dir": [0, 1, 0], "role": "hinge", "group": "cab" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Ladder frame rails, underbody armour plates, transfer case, driveshafts, fuel and battery tanks, wheel arches with fender flares on three axles, side skirts with hazard-stripe SVG panels, tow hooks, paneled gunmetal paint with mud darkening near the floor.",
      "box": [[-1.45, 0.3, -4.2], [1.45, 1.4, 4.2]],
      "attaches": "Top face at chassisTop carries cab, bed and hood; arches surround the axle mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "wheelsFront",
      "builds": "Front axle and middle axle wheel assemblies, four chunky low-poly tyres with tread blocks, hex-bolt rims with glowing cyan inner rings, brake discs and calipers, suspension arms, axle differential housings, shock absorbers with coil springs. Each wheel rides its own wheel joint.",
      "box": [[-1.55, 0.0, -1.2], [1.55, 1.25, 3.8]],
      "attaches": "Hubs at frontAxle and midAxle mounts, joints wheelFL, wheelFR, wheelML, wheelMR.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "body"],
      "floor": true,
      "budget": 130
    },
    {
      "id": "wheelsRear",
      "builds": "Rear axle pair of wheels with same design as the front (tread, rims, glowing rings, brakes), rear differential, leaf-spring packs, mud flaps with magenta glyph decals, rear underride bar with red lights, towing hitch and trailer socket.",
      "box": [[-1.55, 0.0, -4.5], [1.55, 1.25, -1.5]],
      "attaches": "Hubs at rearAxle mount, joints wheelRL and wheelRR.",
      "joints": ["wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 110
    },
    {
      "id": "cabShell",
      "builds": "Wedge armoured crew cab from cabFloor to cabRoof: angled plate walls, slit windshield and side windows (dark glass with cyan reflection decals), roof hatches, antennas array, sensor pods, roof rails, doors on doorL and doorR joints with handles and hex camo decals, side mirrors with cameras, interior seats, dashboard with glowing screens and steering wheel visible through glass.",
      "box": [[-1.4, 1.3, -0.6], [1.4, 3.0, 2.6]],
      "attaches": "Sits on chassisTop at cabFloor; roof at cabRoof; front joins hood at z=2.6; roof supports turretRing behind.",
      "joints": ["body", "doorL", "doorR"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "frontEnd",
      "builds": "Sloped hood with vents and armour ribs, aggressive faceted grille with glowing cyan slats, quad headlights and light bars (glow), bull-bar bumper with hazard stripes, winch with cable, fog lights, skid plate, license plate with 2077 text, front fender plates, exhaust stacks rising behind cab corners, radar dish on hood-side, magenta neon underglow strip.",
      "box": [[-1.5, 0.5, 2.4], [1.5, 2.3, 4.5]],
      "attaches": "Back at cabShell front z=2.6, bottom on chassis at chassisTop, bumper at bumperFront, hood front at hoodFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "turretGun",
      "builds": "Roof turret on turretRing: rotating base ring with teeth, armoured faceted turret housing, twin autocannon barrels with muzzle brakes and heat sleeves, ammo box with belt, sensor eye with glowing red lens, rocket pods on sides, shield plate with SVG skull-glyph emblem, antennas. Housing rides turretYaw, guns ride gunPitch.",
      "box": [[-1.0, 2.7, -0.9], [1.0, 3.4, 2.3]],
      "attaches": "Ring base at turretRing on the roof just behind the cab roof; joints turretYaw and gunPitch.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "cargoBed",
      "builds": "Long flat armoured bed from bedFloor to the rear: floor plates with diamond tread, tall side walls with panelled paint and hex camo decals, a modular crate stack with stencilled labels and glowing status lights, missile launcher rack with angled glowing-tipped missiles, tie-down rails, rear tailgate with red tail lights and hazard chevrons, roll bar behind cab, antennas, neon cyan strip along the top edges, side fuel drums.",
      "box": [[-1.5, 1.3, -4.5], [1.5, 3.0, 0.6]],
      "attaches": "Bed floor sits on chassisTop at bedFloor; front wall abuts cab back at z=-0.6.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: wheelsRear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildWheelsRear({ b, J, P, M }: any) {
  const AX = M.rearAxle[2];
  const R = 0.62;
  const mud = paint((p, n) => {
    const base = mix(P.rubber, "#2a2a22", smoothstep(0.5, 0.0, p.y) * 0.5 * noise(p, 0.1, 3));
    return base;
  });
  const frame = panelled(metal("iron"), { size: 0.2 });
  const glyph = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#101114"/><path d="M12 14h40M32 8v48M16 30l16 10 16-10M14 52h36" stroke="#ff2fb4" stroke-width="5" fill="none"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 16L16 0h12L12 16zM32 16L48 0h12L44 16z" fill="#161a22"/></svg>`,
    { size: 128 },
  );
  const wheelSides: [string, number][] = [["wheelRL", 1], ["wheelRR", -1]];
  for (const [name, s] of wheelSides) {
    const j = J[name];
    const x = s * 1.25;
    const ax: [number, number, number] = [s, 0, 0];
    // tyre
    b.part(new THREE.CylinderGeometry(R, R, 0.5, 12), mud, { bone: j, at: [x, R, AX], dir: ax, flat: true });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.46, 0.09, 0.2), P.rubber, {
        bone: j,
        at: [x, R + Math.cos(a) * (R + 0.02), AX + Math.sin(a) * (R + 0.02)],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
    // rim
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.54, 10), P.rim, { bone: j, at: [x, R, AX], dir: ax, flat: true });
    const outer = x + s * 0.28;
    const g = b.part(new THREE.TorusGeometry(0.3, 0.025, 5, 16), P.neonCyan, { bone: j, at: [outer, R, AX], dir: ax, axis: "z" });
    glow(g, 1.5);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.hullDark, { bone: j, at: [outer, R, AX], dir: ax });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.steel, {
        bone: j, at: [outer, R + Math.cos(a) * 0.2, AX + Math.sin(a) * 0.2], dir: ax,
      });
    }
    // brake disc and caliper
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), P.steel, { bone: j, at: [x - s * 0.3, R, AX], dir: ax });
    b.part(new THREE.BoxGeometry(0.1, 0.18, 0.14), P.warn, { bone: J.body, at: [x - s * 0.3, R + 0.28, AX] });
    // leaf spring pack
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.12, 0.025, 1.3 - k * 0.2), P.hullLight, {
        bone: J.body, at: [s * 1.0, 0.95 - k * 0.03, AX],
      });
    // shock
    b.rod([s * 0.9, 0.5, AX + 0.3], [s * 0.95, 1.1, AX + 0.3], 0.04, P.warn, { bone: J.body });
    b.rod([s * 0.9, 0.7, AX + 0.3], [s * 0.95, 0.9, AX + 0.3], 0.06, P.steel, { bone: J.body });
    // mud flap with glyph
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.6), P.rubber, { bone: J.body, at: [s * 1.35, 0.5, AX - 0.85] });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone: J.body, at: [s * 1.385, 0.5, AX - 0.85], dir: [s, 0, 0], axis: "z", texture: glyph,
    });
    // underride lights
    glow(b.part(new THREE.BoxGeometry(0.2, 0.12, 0.06), P.lightRed, { bone: J.body, at: [s * 1.1, 0.7, -4.4] }), 2);
  }
  // axle
  b.rod([-1.25, R, AX], [1.25, R, AX], 0.07, P.hullDark, { bone: J.body });
  // differential
  b.part(new THREE.SphereGeometry(0.3, 8, 6), frame, { bone: J.body, at: [0, R, AX], scale: [1, 0.9, 1] });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), P.steel, { bone: J.body, at: [0, R + 0.05, AX + 0.35], rotation: [90, 0, 0] });
  // underride bar
  b.part(new THREE.BoxGeometry(2.7, 0.2, 0.18), frame, { bone: J.body, at: [0, 0.7, -4.4] });
  b.part(new THREE.PlaneGeometry(2.0, 0.12), "#ffffff", {
    bone: J.body, at: [0, 0.82, -4.495], dir: [0, 0, -1], axis: "z", texture: hazard,
  });
  for (const s of [1, -1]) b.rod([s * 0.5, 0.7, -4.3], [s * 0.5, 1.2, -4.0], 0.05, P.hullDark, { bone: J.body });
  // tow hitch
  b.rod([0, 0.9, -4.0], [0, 0.85, -4.45], 0.07, P.steel, { bone: J.body });
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 10), P.steel, { bone: J.body, at: [0, 0.85, -4.48] });
  // trailer socket
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.1), P.hullDark, { bone: J.body, at: [0.4, 1.0, -4.42] });
  glow(b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), P.neonCyan, { bone: J.body, at: [0.4, 1.0, -4.48], rotation: [90, 0, 0] }), 1.5);
}
```

<!-- call: frontEnd -->

```ts
import * as THREE from "three";
import { paint, svg, countershade, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildFrontEnd({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const HULL = panelled(countershade(P.hullLight, P.hullDark, { level: -0.2 }), { size: 0.3, rivets: 0.06 });
  const DARK = panelled(P.hullDark, { size: 0.25, rivets: 0 });
  const STEEL = metal("steel");
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true, ...extra });

  // hood: wedge via extrude (side profile, runs along z)
  b.extrude(
    [[0, 0], [1.2, 0], [1.2, 0.75], [0.2, 1.0], [0, 0.95]],
    { at: [-0.0, 1.3, 2.45], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, bone, color: HULL },
  );
  // hood ribs and vents
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      box(0.1, 0.06, 0.8, P.hullDark, [s * (0.35 + i * 0.0), 2.3 - 0.0, 3.0], undefined, {});
    }
  }
  const ribs = [-0.7, -0.35, 0.35, 0.7];
  ribs.forEach((x) => box(0.08, 0.05, 0.9, P.trim, [x, 2.22, 3.05], [-12, 0, 0]));
  for (const s of [1, -1]) {
    box(0.06, 0.1, 0.5, P.neonCyan, [s * 0.55, 2.28, 3.5], [-8, 0, 0], {});
  }
  // fender plates
  for (const s of [1, -1]) {
    box(0.5, 0.45, 1.6, HULL, [s * 1.25, 1.75, 3.2], [0, 0, s * 8]);
    box(0.52, 0.06, 1.6, P.trim, [s * 1.25, 2.0, 3.2], [0, 0, s * 8]);
  }
  // grille
  box(2.0, 0.9, 0.15, DARK, [0, 1.6, 4.1]);
  for (let i = 0; i < 6; i++)
    glow(box(1.7, 0.06, 0.05, P.neonCyan, [0, 1.3 + i * 0.13, 4.2]), 1.4);
  box(2.1, 0.08, 0.2, P.hullLight, [0, 2.08, 4.1]);
  // headlights quad
  for (const s of [1, -1]) {
    glow(box(0.32, 0.22, 0.1, P.lightWhite, [s * 0.75, 1.9, 4.18]), 1.8);
    glow(box(0.22, 0.16, 0.1, P.lightWhite, [s * 1.2, 1.8, 4.1], [0, s * 15, 0]), 1.6);
    glow(box(0.2, 0.14, 0.08, P.warn, [s * 1.05, 0.95, 4.35]), 1.5);
  }
  // light bar
  box(1.9, 0.12, 0.14, P.hullDark, [0, 2.15, 3.85], [-10, 0, 0]);
  for (let i = -4; i <= 4; i++) glow(box(0.16, 0.08, 0.05, P.lightWhite, [i * 0.2, 2.16, 3.93], [-10, 0, 0]), 1.6);
  // bumper with hazard stripes
  const haz = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#101114"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(3.0, 0.5, 0.35), "#ffffff", { bone, at: [0, 0.85, 4.35], texture: haz, flat: true });
  box(2.6, 0.12, 0.2, P.hullDark, [0, 1.2, 4.4]);
  for (const s of [1, -1]) {
    box(0.14, 0.9, 0.14, STEEL, [s * 0.9, 1.1, 4.45]);
    box(0.14, 0.14, 0.5, P.hullDark, [s * 1.4, 0.9, 4.2]);
  }
  box(1.8, 0.1, 0.12, STEEL, [0, 1.55, 4.5]);
  // skid plate
  box(2.4, 0.08, 1.0, DARK, [0, 0.55, 3.8], [8, 0, 0]);
  // winch + cable
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 8), P.steel, { bone, at: [0, 0.85, 4.2], rotation: [0, 0, 90] });
  b.rod([-0.3, 0.85, 4.2], [0.3, 0.85, 4.28], 0.04, P.brass, { bone });
  // fog lights
  for (const s of [1, -1]) glow(box(0.2, 0.2, 0.08, P.warn, [s * 0.55, 0.85, 4.54]), 1.4);
  // plate
  const plate = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#f4fbff"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#161a22" stroke-width="2"/><text x="32" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#161a22">2077</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone, at: [0, 0.82, 4.54], dir: [0, 0, 1], axis: "z", texture: plate });
  // exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.5, 8), STEEL, { bone, at: [s * 1.3, 2.2, 2.55] });
    b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.12, 8), P.hullDark, { bone, at: [s * 1.3, 2.98, 2.55] });
    b.part(new THREE.TorusGeometry(0.12, 0.025, 4, 8), P.warn, { bone, at: [s * 1.3, 2.6, 2.55], rotation: [90, 0, 0] });
  }
  // radar dish on hood side
  b.rod([1.1, 2.2, 3.0], [1.1, 2.5, 3.0], 0.04, P.steel, { bone });
  b.part(new THREE.SphereGeometry(0.22, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.hullLight, {
    bone, at: [1.1, 2.55, 3.0], rotation: [70, 0, 0], flat: true,
  });
  b.rod([1.1, 2.55, 3.0], [1.1, 2.62, 3.15], 0.015, P.steel, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.lightRed, { bone, at: [1.1, 2.63, 3.16] }), 2);
  // underglow
  glow(box(2.6, 0.04, 0.06, P.neonMagenta, [0, 0.52, 4.3]), 1.6);
  for (const s of [1, -1]) glow(box(0.06, 0.04, 1.6, P.neonMagenta, [s * 1.35, 0.52, 3.4]), 1.6);
}
```

<!-- call: wheelsFront -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildWheelsFront({ b, J, P, M }: Ctx) {
  const R = 0.62; // tyre radius, hub height
  const W = 0.5; // tyre width
  const TIRE = paint((p, n) => {
    const d = noise(p, 0.08, 3);
    const base = mix("#0c0d10", "#1e2026", d);
    return mix(base, "#3a2f24", 0.35 * smoothstep(0.2, -0.6, n.y) * noise(p, 0.2, 9));
  });
  const HULLP = paint((p, n) => {
    const m = mix(P.hull, P.hullLight, noise(p, 0.12, 5));
    return mix(m, "#2a2118", 0.4 * smoothstep(0.7, 0.0, p.y));
  });
  const warnTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#161a22"/><path d="M-4 12 L12 -4 L20 -4 L-4 20Z M-4 28 L28 -4 L36 -4 L-4 36Z M12 36 L36 12 L36 20 L20 36Z" fill="#e7b814"/></svg>`,
    { size: 64 },
  );
  const ringTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#2ff3ff" stroke-width="6"/><circle cx="32" cy="32" r="16" fill="none" stroke="#2ff3ff" stroke-width="3" stroke-dasharray="6 4"/></svg>`,
    { size: 128 },
  );

  const axles: [string, number][] = [["F", 3], ["M", -0.4]];
  const rot = (s: number) => ({ dir: [s, 0, 0] as [number, number, number] });

  for (const [tag, z] of axles) {
    // axle beam + differential
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 8), P.steel, { bone: J.body, at: [0, R, z], dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), HULLP, { bone: J.body, at: [0, R, z], scale: [1, 0.9, 1.1], flat: true });
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.2, 8), P.hullDark, { bone: J.body, at: [0, R, z + 0.28], dir: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.6, 0.06, 0.08), P.trim, { bone: J.body, at: [0, R + 0.3, z + 0.05] });
    // suspension arms
    for (const s of [1, -1]) {
      b.rod([s * 0.4, R + 0.05, z - 0.4], [s * 1.0, R + 0.1, z - 0.05], 0.045, P.steel, { bone: J.body, sides: 6 });
      b.rod([s * 0.4, R + 0.05, z + 0.4], [s * 1.0, R + 0.1, z + 0.05], 0.045, P.steel, { bone: J.body, sides: 6 });
      // shock absorber + coil
      const a: [number, number, number] = [s * 0.95, R + 0.15, z + 0.3];
      const c: [number, number, number] = [s * 0.8, 1.2, z + 0.3];
      b.rod(a, c, 0.03, P.hullDark, { bone: J.body, sides: 6 });
      const dirv = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
      const side = new THREE.Vector3(0, 0, 1);
      const pts: number[][] = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24;
        const ang = t * Math.PI * 2 * 5;
        pts.push([a[0] + dirv.x * t + Math.cos(ang) * 0.07 * side.z * 0, a[1] + dirv.y * t + Math.cos(ang) * 0.00, a[2] + dirv.z * t + Math.sin(ang) * 0.07 + Math.cos(ang) * 0.0]);
        pts[i][0] += Math.cos(ang) * 0.07;
      }
      b.sweep(pts, 0.014, { bone: J.body, color: P.warn, sides: 5 });
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), P.trim, { bone: J.body, at: c, dir: [1, 0, 0] });
    }
  }

  const wheels: [string, number, number, string][] = [
    ["wheelFL", 1, 3, "F"], ["wheelFR", -1, 3, "F"], ["wheelML", 1, -0.4, "M"], ["wheelMR", -1, -0.4, "M"],
  ];
  for (const [jn, s, z] of wheels.map((w) => [w[0], w[1], w[2]] as [string, number, number])) {
    const j = J[jn];
    const hub = [s * 1.25, R, z] as [number, number, number];
    const o = (dx: number, dy = 0, dz = 0) => [hub[0] + s * dx, hub[1] + dy, hub[2] + dz] as [number, number, number];
    // tyre: octagon-ish chunky cylinder along x
    b.part(new THREE.CylinderGeometry(R, R, W, 14), TIRE, { bone: j, at: hub, ...rot(1), flat: true });
    // sidewall bulge rings
    for (const k of [-1, 1])
      b.part(new THREE.CylinderGeometry(R * 0.86, R * 0.97, 0.05, 14), P.rubber, { bone: j, at: o(k * 0.26), ...rot(1), flat: true });
    // tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const pos: [number, number, number] = [hub[0], hub[1] + Math.cos(a) * (R + 0.03), z + Math.sin(a) * (R + 0.03)];
      b.part(new THREE.BoxGeometry(W * 0.92, 0.08, 0.15), P.rubber, { bone: j, at: pos, rotation: [(a * 180) / Math.PI * -1 + 180 - 180, 0, 0] });
    }
    // rim
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 10), P.rim, { bone: j, at: o(0.26 ), ...rot(1), flat: true });
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 10), P.rim, { bone: j, at: o(-0.26), ...rot(1), flat: true });
    // glowing cyan ring on outer face
    glow(b.part(new THREE.PlaneGeometry(0.62, 0.62), "#ffffff", { bone: j, at: o(0.32), dir: [s, 0, 0], axis: "z", texture: ringTex }), 1.6);
    // hub cap + bolts
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 6), P.steel, { bone: j, at: o(0.34), ...rot(1), flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.hullDark, {
        bone: j, at: [o(0.36)[0], hub[1] + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2], ...rot(1),
      });
    }
    // brake disc inboard + caliper
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), P.steel, { bone: j, at: o(-0.18), ...rot(1) });
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.18), P.warn, { bone: J.body, at: [hub[0] - s * 0.18, R + 0.25, z - 0.12] });
    // fender-side warning plate
    b.part(new THREE.BoxGeometry(0.03, 0.16, 0.5), "#ffffff", { bone: J.body, at: [s * 1.42, 1.18, z], texture: warnTex });
  }
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const hullPaint = paint((p, n) => {
    const base = panelled(P.hull, { size: 0.4, rivets: 0.08 }).at(p, n);
    const mud = smoothstep(0.9, 0.35, p.y) * (0.5 + 0.5 * noise(p, 0.25, 4));
    return mix(base, "#2a2118", mud * 0.65);
  });
  const darkPaint = panelled(P.hullDark, { size: 0.35, rivets: 0.1 });
  const steelPaint = metal("steel", { tarnish: 0.5 });
  const box = (w: number, h: number, d: number, color: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...opt });
  const cyl = (r: number, r2: number, l: number, seg: number, color: any, at: number[], dir: number[], opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r2, l, seg), color, { bone: body, at, dir, flat: true, ...opt });

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#161a22"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#161a22"/><text x="6" y="24" font-size="22" fill="#ff2fb4" font-family="sans-serif">警 07</text></svg>`,
    { size: 128 },
  );

  // Ladder frame rails
  for (const s of [1, -1]) {
    box(0.22, 0.34, 8.2, hullPaint, [s * 0.55, 0.78, 0]);
    box(0.3, 0.06, 8.0, darkPaint, [s * 0.55, 0.97, 0]);
    box(0.3, 0.06, 8.0, darkPaint, [s * 0.55, 0.59, 0]);
  }
  // Cross members
  for (let i = 0; i < 9; i++) box(1.3, 0.16, 0.14, darkPaint, [0, 0.8, -3.8 + i * 0.95]);
  // Deck plate
  box(2.6, 0.1, 8.0, hullPaint, [0, 1.3, 0]);
  box(2.2, 0.06, 7.6, darkPaint, [0, 1.36, 0]);

  // Underbody armour
  box(1.6, 0.08, 3.0, darkPaint, [0, 0.4, 1.4], { rotation: [4, 0, 0] });
  box(1.6, 0.08, 2.4, darkPaint, [0, 0.38, -1.5], { rotation: [-3, 0, 0] });
  box(1.2, 0.06, 1.0, steelPaint, [0, 0.34, 0.6]);

  // Transfer case + driveshafts
  box(0.7, 0.4, 0.7, steelPaint, [0, 0.62, 0.8]);
  cyl(0.08, 0.08, 3.6, 8, steelPaint, [0, 0.62, 2.4], [0, 0, 1]);
  cyl(0.08, 0.08, 2.0, 8, steelPaint, [0, 0.62, -1.5], [0, 0, 1]);
  cyl(0.08, 0.08, 2.4, 8, steelPaint, [0, 0.62, -1.4 - 0.0], [0, 0, 1]);
  for (const z of [3.0, -0.4, -2.6]) cyl(0.06, 0.06, 2.0, 8, steelPaint, [0, 0.62, z], [1, 0, 0]);
  for (const z of [3.0, -0.4, -2.6]) b.part(new THREE.SphereGeometry(0.24, 8, 6), steelPaint, { bone: body, at: [0, 0.62, z], flat: true });

  // Tanks
  for (const [s, c, z] of [[1, P.steel, -1.4], [1, P.olive, -2.2], [-1, P.brass, -1.0]] as any) {
    const t = cyl(0.3, 0.3, 1.2, 10, c, [s * 0.95, 0.72, z], [0, 0, 1]);
    cyl(0.32, 0.32, 0.06, 10, P.hullDark, [s * 0.95, 0.72, z + 0.35], [0, 0, 1]);
    cyl(0.32, 0.32, 0.06, 10, P.hullDark, [s * 0.95, 0.72, z - 0.35], [0, 0, 1]);
  }
  // Battery box w/ glow
  box(0.5, 0.3, 0.8, darkPaint, [-0.95, 0.75, 1.5]);
  glow(box(0.3, 0.04, 0.5, P.neonCyan, [-0.95, 0.92, 1.5]), 1.4);

  // Wheel arches and fender flares
  for (const z of [3.0, -0.4, -2.6])
    for (const s of [1, -1]) {
      const x = s * 1.2;
      box(0.12, 0.2, 1.7, P.hullLight, [x + s * 0.1, 1.28, z]);
      box(0.1, 0.2, 0.7, P.hullLight, [x + s * 0.1, 1.15, z + 0.95], { rotation: [-40, 0, 0] });
      box(0.1, 0.2, 0.7, P.hullLight, [x + s * 0.1, 1.15, z - 0.95], { rotation: [40, 0, 0] });
      box(0.14, 0.05, 1.8, P.trim, [x + s * 0.18, 1.4, z]);
      box(0.5, 0.06, 1.5, hullPaint, [s * 1.0, 1.22, z]);
      glow(box(0.04, 0.05, 1.5, s > 0 ? P.neonCyan : P.neonMagenta, [x + s * 0.17, 1.24, z]), 1.2);
    }

  // Side skirts with hazard panels
  for (const s of [1, -1]) {
    for (const [z0, len] of [[1.15, 1.3], [-1.5, 1.3]] as any) {
      box(0.1, 0.4, len + 0.2, hullPaint, [s * 1.42, 0.62, z0]);
      b.part(new THREE.PlaneGeometry(len, 0.18), "#ffffff", { bone: body, at: [s * 1.485, 0.62, z0], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: HAZ, rotation: undefined as any });
      b.part(new THREE.PlaneGeometry(0.5, 0.14), "#ffffff", { bone: body, at: [s * 1.486, 0.82, z0], dir: [s, 0, 0], axis: "z", texture: GLYPH });
    }
    // rivet strip & step
    box(0.2, 0.05, 0.6, P.trim, [s * 1.42, 0.38, 1.15]);
  }

  // Tow hooks
  for (const z of [4.1, -4.1])
    for (const s of [1, -1]) {
      box(0.16, 0.2, 0.2, P.hullDark, [s * 0.55, 0.78, z]);
      b.sweep(
        [[s * 0.55, 0.78, z + Math.sign(z) * 0.1], [s * 0.55, 0.78, z + Math.sign(z) * 0.3], [s * 0.55, 0.6, z + Math.sign(z) * 0.36], [s * 0.55, 0.52, z + Math.sign(z) * 0.2]],
        0.035,
        { color: P.trim, bone: body, sides: 6 },
      );
    }
  // End caps
  box(2.0, 0.3, 0.14, P.hullDark, [0, 0.95, 4.15]);
  box(2.0, 0.3, 0.14, P.hullDark, [0, 0.95, -4.15]);
  // Deck edge lights
  for (let i = 0; i < 8; i++) for (const s of [1, -1])
    glow(box(0.05, 0.05, 0.2, i % 2 ? P.warn : P.neonMagenta, [s * 1.3, 1.38, -3.6 + i * 1.0]), 1.2);
  // Bolts on plate
  for (let i = 0; i < 10; i++) b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), P.steel, { bone: body, at: [-0.9 + R() * 1.8, 1.42, -3.8 + R() * 7.6] });
}
```

<!-- call: turretGun -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildTurretGun({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const [cx, cy, cz] = M.turretRing as number[];

  const HULL = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) =>
      mix(P.hullDark, P.hullLight, smoothstep(-0.5, 1, n.y) * 0.7 + noise(p, 0.15, 3) * 0.3),
    ),
    { size: 0.22, rivets: 0.05 },
  );
  const STEEL = metal("steel", { tarnish: 0.3 });
  const IRON = metal("iron");
  const OLIVE = panelled(P.olive, { size: 0.18, rivets: 0.05 });

  const skull = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#161a22"/>
    <path d="M32 8C18 8 12 18 14 30c1 6 5 8 7 10v8h6v-5h4v5h6v-5h4v5h6v-8c2-2 6-4 7-10C52 18 46 8 32 8z" fill="#e7b814"/>
    <ellipse cx="24" cy="29" rx="6" ry="7" fill="#161a22"/><ellipse cx="40" cy="29" rx="6" ry="7" fill="#161a22"/>
    <path d="M32 36l-3 6h6z" fill="#161a22"/>
    <path d="M4 4h56v4H4z M4 56h56v4H4z" fill="#ff7a1a"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    <path d="M0 16L16 0h12L12 16zM32 16L48 0h12L44 16z" fill="#161a22"/></svg>`,
    { size: 128 },
  );

  // Ring base with teeth
  b.part(new THREE.CylinderGeometry(0.75, 0.85, 0.12, 16), IRON, { bone: yaw, at: [cx, cy + 0.06, cz] });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.1), STEEL, {
      bone: yaw,
      at: [cx + Math.sin(a) * 0.82, cy + 0.16, cz + Math.cos(a) * 0.82],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.68, 0.72, 0.1, 16), STEEL, { bone: yaw, at: [cx, cy + 0.2, cz] });
  glow(b.part(new THREE.TorusGeometry(0.72, 0.02, 4, 24), P.neonCyan, { bone: yaw, at: [cx, cy + 0.26, cz], rotation: [90, 0, 0] }), 1.6);

  // Housing
  const hy = cy + 0.5;
  b.part(new THREE.BoxGeometry(1.1, 0.4, 1.0), HULL, { bone: yaw, at: [cx, hy, cz + 0.05] });
  b.part(new THREE.BoxGeometry(0.9, 0.2, 0.8), HULL, { bone: yaw, at: [cx, hy + 0.28, cz - 0.05] });
  b.frustumBox([cx, hy, cz + 0.55], [cx, hy + 0.05, cz + 0.85], [1.0, 0.36], [0.7, 0.24], { bone: yaw, color: HULL });
  b.frustumBox([cx, hy + 0.01, cz - 0.5], [cx, hy + 0.01, cz - 0.8], [0.9, 0.36], [0.8, 0.3], { bone: yaw, color: HULL });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.34, 0.9), STEEL, { bone: yaw, at: [cx + s * 0.58, hy, cz] });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.7), hazard ? P.trim : P.trim, { bone: yaw, at: [cx + s * 0.62, hy + 0.1, cz] });
    // rocket pods
    b.part(new THREE.BoxGeometry(0.28, 0.26, 0.6), OLIVE, { bone: yaw, at: [cx + s * 0.8, hy + 0.12, cz - 0.1] });
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), P.hullDark, {
          bone: yaw,
          at: [cx + s * (0.74 + i * 0.12), hy + 0.06 + j * 0.12, cz + 0.22],
          rotation: [90, 0, 0],
        });
        glow(b.part(new THREE.ConeGeometry(0.035, 0.1, 6), P.lightRed, {
          bone: yaw,
          at: [cx + s * (0.74 + i * 0.12), hy + 0.06 + j * 0.12, cz + 0.28],
          rotation: [90, 0, 0],
        }), 1.4);
      }
    // antennas
    b.rod([cx + s * 0.4, hy + 0.38, cz - 0.4], [cx + s * 0.5, hy + 1.0, cz - 0.5], 0.012, { bone: yaw, color: P.steel });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: yaw, at: [cx + s * 0.5, hy + 1.0, cz - 0.5] }), 2);
  }
  // Ammo box + belt
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.35), OLIVE, { bone: yaw, at: [cx - 0.35, hy + 0.5, cz - 0.1] });
  b.sweep([[cx - 0.2, hy + 0.5, cz - 0.1], [cx - 0.1, hy + 0.45, cz + 0.3], [cx - 0.05, hy + 0.3, cz + 0.8]], 0.02, { bone: yaw, color: P.brass });

  // Sensor eye
  b.part(new THREE.CylinderGeometry(0.14, 0.16, 0.2, 8), IRON, { bone: yaw, at: [cx + 0.3, hy + 0.5, cz + 0.2] });
  glow(b.part(new THREE.SphereGeometry(0.1, 8, 6), P.lightRed, { bone: yaw, at: [cx + 0.3, hy + 0.58, cz + 0.28] }), 2);

  // Shield plate with skull
  b.part(new THREE.BoxGeometry(1.0, 0.5, 0.06), HULL, { bone: pitch, at: [cx, cy + 0.65, cz + 0.98], rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    bone: pitch, at: [cx, cy + 0.66, cz + 1.015], dir: [0, 0.2, 1], axis: "z", texture: skull,
  });
  b.part(new THREE.PlaneGeometry(0.9, 0.1), "#ffffff", {
    bone: pitch, at: [cx, cy + 0.43, cz + 1.015], dir: [0, 0.2, 1], axis: "z", texture: hazard,
  });

  // Twin autocannons
  const gy = pitch.at.y;
  const gz = pitch.at.z;
  for (const s of [1, -1]) {
    const x = cx + s * 0.22;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), STEEL, { bone: pitch, at: [x, gy, gz + 0.2], rotation: [90, 0, 0] });
    b.rod([x, gy, gz + 0.3], [x, gy, gz + 1.7], [0.055, 0.045], { bone: pitch, color: IRON });
    b.rod([x, gy, gz + 0.5], [x, gy, gz + 1.2], 0.09, { bone: pitch, color: STEEL, sides: 8 });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.CylinderGeometry(0.097, 0.097, 0.02, 8), P.hullDark, { bone: pitch, at: [x, gy, gz + 0.6 + k * 0.17], rotation: [90, 0, 0] });
    b.rod([x, gy, gz + 1.7], [x, gy, gz + 1.95], 0.085, { bone: pitch, color: P.hullDark, sides: 6 });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.1), P.warn, { bone: pitch, at: [x, gy + 0.09, gz + 1.85] });
    glow(b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), P.neonCyan, { bone: pitch, at: [x, gy, gz + 1.5] }), 1.5);
  }
  b.part(new THREE.BoxGeometry(0.7, 0.24, 0.3), HULL, { bone: pitch, at: [cx, gy, gz + 0.15] });
}
```

<!-- call: cargoBed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoBed({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(77);
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at: [x, y, z], flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: body, at: [x, y, z], flat: true, ...o });

  const HULL = panelled(P.hull, { size: 0.5, rivets: 0.08 });
  const HULLD = panelled(P.hullDark, { size: 0.4, rivets: 0.1 });
  const FLOOR = paint((p, n) => {
    const d = Math.abs(((p.x + p.z) * 6) % 1 - 0.5) < 0.12 || Math.abs(((p.x - p.z) * 6) % 1 - 0.5) < 0.12;
    return d ? P.hullLight : mix(P.hullDark, P.hull, noise(p, 0.3, 4));
  });
  const OLIVE = paint((p, n) => mix(P.olive, P.hull, smoothstep(0.4, 0.7, noise(p, 0.35, 9))));
  const STEEL = metal("steel");

  const hexCamo = svg(`<svg viewBox="0 0 64 64"><g stroke="#161a22" stroke-width="2">
    <polygon points="16,6 28,6 34,16 28,26 16,26 10,16" fill="#4b5a3a"/>
    <polygon points="40,22 52,22 58,32 52,42 40,42 34,32" fill="#2e343f"/>
    <polygon points="16,38 28,38 34,48 28,58 16,58 10,48" fill="#6b7280"/></g></svg>`, { size: 128 });
  const hazard = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/>
    <path d="M0 32L16 0H32L16 32ZM32 32L48 0H64L48 32Z" fill="#101114"/></svg>`, { size: 128 });
  const stencil = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#4b5a3a"/>
    <text x="32" y="14" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="11" fill="#e7b814">AMMO</text>
    <text x="32" y="27" text-anchor="middle" font-family="monospace" font-size="8" fill="#f4fbff">WB-2077</text></svg>`, { size: 128 });
  const kanji = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#161a22"/>
    <text x="16" y="25" text-anchor="middle" font-size="24" fill="#ff2fb4">戦</text></svg>`, { size: 64 });
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: tex, ...o });

  // floor
  box(2.9, 0.1, 5.0, FLOOR, 0, 1.4, -2.0);
  box(2.9, 0.12, 0.3, P.hullDark, 0, 1.33, -2.0);
  // side walls and rails
  for (const s of [1, -1]) {
    box(0.1, 0.9, 5.0, HULL, s * 1.4, 1.9, -2.0);
    box(0.18, 0.1, 5.0, P.hullLight, s * 1.4, 2.4, -2.0);
    box(0.06, 0.04, 5.0, P.neonCyan, s * 1.4, 2.47, -2.0, {});
    for (let i = 0; i < 6; i++) box(0.14, 0.9, 0.08, P.hullDark, s * 1.42, 1.9, -4.3 + i * 0.85);
    decal(hexCamo, 1.6, 1.6, [s * 1.46, 1.95, -3.2], [s, 0, 0]);
    decal(hexCamo, 1.6, 1.6, [s * 1.46, 1.95, -1.2], [s, 0, 0], { mirror: true });
    decal(kanji, 0.35, 0.35, [s * 1.46, 2.2, -0.2], [s, 0, 0]);
    decal(hazard, 0.9, 0.2, [s * 1.46, 1.58, -2], [s, 0, 0]);
    // tie-down rings
    for (let i = 0; i < 4; i++) b.part(new THREE.TorusGeometry(0.06, 0.015, 5, 8), P.steel, { bone: body, at: [s * 1.33, 1.6, -4 + i * 1.2], dir: [1, 0, 0], axis: "z" });
    // fuel drums
    for (let i = 0; i < 2; i++) {
      const z = -3.6 + i * 0.6;
      cyl(0.22, 0.22, 0.6, 10, i ? P.warn : P.olive, s * 1.62, 1.75, z);
      cyl(0.23, 0.23, 0.05, 10, P.steel, s * 1.62, 1.95, z);
      cyl(0.23, 0.23, 0.05, 10, P.steel, s * 1.62, 1.55, z);
      box(0.06, 0.4, 0.3, P.hullDark, s * 1.45, 1.75, z);
    }
  }
  // front wall (abuts cab) + roll bar
  box(2.9, 1.3, 0.12, HULLD, 0, 2.05, -0.5);
  box(2.9, 0.08, 0.14, P.trim, 0, 2.72, -0.5);
  for (const s of [1, -1]) {
    cyl(0.06, 0.06, 1.5, 6, P.hullLight, s * 1.2, 2.2, -0.45);
    box(0.1, 0.1, 0.5, P.hullLight, s * 1.2, 2.95, -0.25);
  }
  box(2.5, 0.1, 0.1, P.hullLight, 0, 2.95, -0.25);
  glow(box(2.3, 0.04, 0.04, P.neonCyan, 0, 2.99, -0.25), 1.5);
  // tailgate
  box(2.9, 0.9, 0.1, HULL, 0, 1.9, -4.5);
  box(2.9, 0.12, 0.14, P.hullLight, 0, 2.4, -4.5);
  decal(hazard, 2.6, 0.3, [0, 1.7, -4.57], [0, 0, -1]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.14, 0.06, P.lightRed, s * 1.2, 2.1, -4.56), 2);
    glow(box(0.12, 0.3, 0.06, P.neonMagenta, s * 0.9, 1.95, -4.56), 1.4);
  }
  glow(box(2.0, 0.04, 0.04, P.neonCyan, 0, 2.45, -4.53), 1.5);
  // crate stack
  const crates: number[][] = [[-0.7, -0.9, 0.8], [0.0, -0.9, 0.8], [-0.35, -0.9, 0.6]];
  [[-0.65, 0, 1.0], [0.3, 0, 1.0], [-0.25, 1, 0.8]].forEach(([x, lv, w], i) => {
    const y = 1.45 + 0.4 + lv * 0.8;
    const z = -1.0;
    box(w, 0.75, 0.9, i % 2 ? OLIVE : HULL, x, y - 0.0, z);
    box(w + 0.04, 0.05, 0.94, P.trim, x, y + 0.38, z);
    decal(stencil, 0.6, 0.3, [x, y, z + 0.46], [0, 0, 1]);
    glow(box(0.08, 0.05, 0.03, i % 2 ? P.neonMagenta : P.neonCyan, x + w / 2 - 0.1, y + 0.28, z + 0.47), 2);
  });
  // missile rack
  box(1.7, 0.1, 1.6, P.hullDark, 0.2, 1.5, -3.2);
  for (let i = 0; i < 2; i++) box(0.1, 0.5, 1.6, P.hullLight, -0.6 + i * 1.7 - 0.2 + 0.2, 1.8, -3.2);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 2; c++) {
      const x = -0.2 + c * 0.8, y = 1.78 + (r % 2) * 0.0, z = -2.8 - r * 0.5;
      const dir = [0, 0.35, 1];
      b.part(new THREE.CylinderGeometry(0.11, 0.11, 1.2, 8), P.steel, { bone: body, at: [x, y, z], dir: [0, 0.3, 1], flat: true });
      glow(b.part(new THREE.ConeGeometry(0.11, 0.3, 8), P.lightRed, { bone: body, at: [x, y + 0.2, z + 0.62], dir: [0, 0.3, 1], flat: true }), 1.6);
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), P.warn, { bone: body, at: [x, y, z - 0.2], dir: [0, 0.3, 1], flat: true });
      void dir;
    }
  // antennas
  for (const s of [1, -1]) {
    b.rod([s * 1.35, 2.5, -0.4], [s * 1.38, 3.3 + (s > 0 ? 0.2 : 0), -0.4], 0.015, P.steel, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.neonMagenta, { bone: body, at: [s * 1.38, 3.32 + (s > 0 ? 0.2 : 0), -0.4] }), 2);
  }
  void crates; void R; void STEEL;
}
```

<!-- call: cabShell -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCabShell({ b, J, P, M }: Ctx) {
  const body = J.body;
  const doorBones: Record<number, any> = { 1: J.doorL, [-1]: J.doorR };

  const hullPaint = panelled(
    paint((p, n) => {
      const t = noise(p, 0.35, 3);
      const lit = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, n.y) * 0.6 + t * 0.25);
      return mix(lit, P.hullDark, smoothstep(1.7, 1.3, p.y) * 0.5);
    }),
    { size: 0.4, rivets: 0.1, seam: P.hullDark },
  );
  const darkPaint = panelled(metal("iron"), { size: 0.3, rivets: 0.08 });

  const hex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#2e343f"/>${[0, 1, 2, 3]
      .map((r) =>
        [0, 1, 2, 3]
          .map((c) => {
            const x = c * 18 + (r % 2) * 9,
              y = r * 16 + 8;
            const col = (r + c) % 3 === 0 ? "#4b5a3a" : (r + c) % 3 === 1 ? "#161a22" : "#4a5262";
            return `<polygon points="${x + 8},${y} ${x + 4},${y + 7} ${x - 4},${y + 7} ${x - 8},${y} ${x - 4},${y - 7} ${x + 4},${y - 7}" fill="${col}" stroke="#161a22" stroke-width="1.2"/>`;
          })
          .join(""),
      )
      .join("")}</svg>`,
    { size: 128 },
  );
  const glass = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0c2a3a"/><path d="M0 28 L28 0 L38 0 L10 32Z" fill="#2ff3ff" opacity="0.35"/><path d="M30 32 L58 4 L62 4 L34 32Z" fill="#2ff3ff" opacity="0.2"/></svg>`,
    { size: 128 },
  );
  const screenTex = svg(
    `<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#031a22"/><path d="M2 24 L10 14 L18 20 L28 6 L36 16 L46 8" stroke="#2ff3ff" stroke-width="2" fill="none"/><rect x="4" y="4" width="14" height="3" fill="#ff2fb4"/><circle cx="38" cy="24" r="4" fill="none" stroke="#2ff3ff" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const kanji = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="none"/><text x="16" y="25" text-anchor="middle" font-size="24" font-family="serif" fill="#e7b814">戦</text></svg>`,
    { size: 64 },
  );
  const serial = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#e7b814"/><text x="32" y="17" text-anchor="middle" font-size="14" font-family="monospace" font-weight="bold" fill="#161a22">WB-2077</text></svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], bone: any = body, extra: any = {}) =>
    b.part(g, c, { bone, at, ...extra });

  // Wedge shell: sloped hull as extruded side profile (z forward, y up)
  const prof: [number, number][] = [
    [-0.6, 1.3], [2.6, 1.3], [2.6, 1.95], [2.15, 2.45], [1.5, 2.75], [-0.6, 2.75],
  ];
  const shell = b.extrude(prof, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    thickness: 2.5,
    bevel: 0.05,
    color: hullPaint,
    bone: body,
  });
  shell.mesh.name = "cabShellHull";

  // glazing: windshield slit (sloped), side slits, rear slit
  const wsAngle = Math.atan2(0.5, 0.65);
  put(new THREE.PlaneGeometry(1.9, 0.38), "#ffffff", [0, 2.6, 1.83], body, {
    rotation: [-(90 - (Math.atan2(0.45, 0.65) * 180) / Math.PI) + 0, 0, 0],
    axis: "z",
    texture: glass,
  });
  const ws = b.part(new THREE.PlaneGeometry(1.9, 0.4), "#ffffff", {
    bone: body,
    at: [0, 2.6, 1.84],
    dir: [0, 0.55, 0.65],
    axis: "z",
    texture: glass,
  });
  glow(ws, 0.35);
  put(box(1.95, 0.05, 0.08), P.hullDark, [0, 2.4, 1.93], body, { rotation: [-40, 0, 0] });
  put(box(1.95, 0.05, 0.08), P.hullDark, [0, 2.8, 1.75], body, { rotation: [-40, 0, 0] });

  for (const s of [1, -1]) {
    // side glass
    const sg = b.part(new THREE.PlaneGeometry(1.2, 0.36), "#ffffff", {
      bone: body,
      at: [s * 1.262, 2.45, 1.2],
      dir: [s, 0, 0],
      axis: "z",
      texture: glass,
    });
    glow(sg, 0.3);
    // frame around side glass
    put(box(0.04, 0.06, 1.3), P.hullDark, [s * 1.255, 2.65, 1.2]);
    put(box(0.04, 0.06, 1.3), P.hullDark, [s * 1.255, 2.27, 1.2]);

    // door on hinge joint
    const dj = doorBones[s];
    const door = put(box(0.08, 0.95, 1.2), darkPaint, [s * 1.25, 1.9, 1.0], dj);
    put(box(0.06, 0.7, 0.9), "#ffffff", [s * 1.3, 1.85, 1.0], dj, { texture: hex });
    put(box(0.05, 0.3, 0.6), "#ffffff", [s * 1.31, 1.45, 1.0], dj, { texture: serial });
    put(box(0.1, 0.06, 0.28), P.trim, [s * 1.31, 2.1, 0.55], dj);
    put(box(0.1, 0.1, 0.1), P.steel, [s * 1.33, 2.0, 0.55], dj);
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      bone: dj, at: [s * 1.345, 1.7, 1.0], dir: [s, 0, 0], axis: "z", texture: kanji,
    });

    // trim stripes along sill
    put(box(0.12, 0.08, 2.4), P.trim, [s * 1.3, 1.38, 0.9]);
    glow(put(box(0.03, 0.03, 2.2), P.neonCyan, [s * 1.35, 1.52, 0.9]), 1.5);

    // mirrors
    put(box(0.05, 0.04, 0.3), P.hullDark, [s * 1.4, 2.35, 1.95], body, { rotation: [0, 0, s * 20] });
    put(box(0.12, 0.22, 0.2), P.hullDark, [s * 1.62, 2.3, 2.1]);
    glow(put(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, [s * 1.62, 2.38, 2.21]), 2);
    put(box(0.02, 0.2, 0.18), P.steel, [s * 1.69, 2.3, 2.1]);

    // roof rails
    put(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 6), P.trim, [s * 1.2, 2.83, 0.65], body, { rotation: [90, 0, 0] });
    for (const z of [-0.3, 0.5, 1.3]) put(box(0.05, 0.1, 0.05), P.steel, [s * 1.2, 2.79, z]);

    // front pods / sensors
    put(new THREE.CylinderGeometry(0.1, 0.12, 0.16, 6), P.hullDark, [s * 0.9, 2.84, 1.6]);
    glow(put(new THREE.SphereGeometry(0.07, 6, 4), P.lightRed, [s * 0.9, 2.95, 1.64]), 2);

    // seats
    put(box(0.5, 0.12, 0.5), P.olive, [s * 0.5, 1.65, 1.1]);
    put(box(0.5, 0.65, 0.1), P.olive, [s * 0.5, 2.0, 0.85], body, { rotation: [-8, 0, 0] });
    put(box(0.3, 0.14, 0.08), P.hullDark, [s * 0.5, 2.38, 0.82]);
    put(box(0.5, 0.12, 0.5), P.olive, [s * 0.5, 1.65, 0.1]);
    put(box(0.5, 0.6, 0.1), P.olive, [s * 0.5, 1.98, -0.15]);

    // wedge angled side armour plates
    put(box(0.1, 0.3, 1.1), hullPaint, [s * 1.3, 2.62, 0.2], body, { rotation: [0, 0, s * -12] });
    glow(put(box(0.03, 0.03, 1.4), P.neonMagenta, [s * 1.32, 2.78, 0.3]), 1.5);
  }

  // rear wall detail & roll bar glass
  put(box(2.5, 1.45, 0.08), darkPaint, [0, 2.02, -0.58]);
  put(box(1.3, 0.2, 0.05), "#ffffff", [0, 2.5, -0.64], body, { texture: serial });
  glow(put(box(0.08, 0.7, 0.04), P.neonCyan, [1.0, 2.0, -0.64]), 1.4);
  glow(put(box(0.08, 0.7, 0.04), P.neonCyan, [-1.0, 2.0, -0.64]), 1.4);

  // roof plate + hatches
  put(box(2.5, 0.08, 2.0), P.hullDark, [0, 2.78, 0.4]);
  for (const x of [0.55, -0.55]) {
    put(new THREE.CylinderGeometry(0.3, 0.33, 0.1, 8), P.hull, [x, 2.85, 0.9]);
    put(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 6), P.trim, [x, 2.92, 0.9]);
    put(box(0.2, 0.05, 0.05), P.steel, [x, 2.94, 0.9]);
  }
  // turret ring seat
  put(new THREE.CylinderGeometry(0.75, 0.8, 0.1, 12), P.steel, [0, 2.84, -0.3]);
  put(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 12), P.hullDark, [0, 2.86, -0.3]);

  // antennas array
  const rr = rng(5);
  for (let i = 0; i < 4; i++) {
    const x = -1.05 + i * 0.12, h = 0.7 + rr() * 0.8;
    put(new THREE.CylinderGeometry(0.008, 0.015, h, 5), P.steel, [x, 2.8 + h / 2, -0.45]);
    if (i % 2) glow(put(new THREE.SphereGeometry(0.025, 5, 4), P.lightRed, [x, 2.8 + h, -0.45]), 2);
  }
  put(box(0.3, 0.3, 0.04), P.hullDark, [1.0, 3.0, 0.2], body, { rotation: [0, 0, 20] });
  put(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 5), P.steel, [1.0, 2.9, 0.2]);

  // dashboard & screens, steering wheel
  put(box(2.2, 0.28, 0.5), P.hullDark, [0, 2.0, 1.9], body, { rotation: [-10, 0, 0] });
  for (const x of [-0.5, 0.15]) {
    const sc = b.part(new THREE.PlaneGeometry(0.5, 0.33), "#ffffff", {
      bone: body, at: [x + 0.2, 2.22, 1.78], dir: [0, 0.4, -1], axis: "z", texture: screenTex,
    });
    glow(sc, 1.2);
  }
  const steer = b.part(new THREE.TorusGeometry(0.17, 0.025, 5, 10), P.rubber, {
    bone: body, at: [0.5, 2.0, 1.55], dir: [0, 0.5, 1], axis: "z",
  });
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 5), P.steel, [0.5, 1.85, 1.7], body, { rotation: [50, 0, 0] });
  void steer;

  // floor and under-cab base
  put(box(2.6, 0.1, 3.1), P.hullDark, [0, 1.35, 1.0]);
  // front face lower armour + vents
  put(box(2.5, 0.5, 0.1), darkPaint, [0, 1.65, 2.55]);
  for (let i = 0; i < 5; i++) put(box(0.35, 0.04, 0.04), P.warn, [-0.9 + i * 0.45, 1.5, 2.62]);
  glow(put(box(2.3, 0.04, 0.04), P.neonCyan, [0, 2.0, 2.2], body, { rotation: [-50, 0, 0] }), 1.2);
}
```

<!-- call: fit-chassis -->

The tow hook sweeps stick out past z = ±4.2, so I'm pulling them in: the hook mounts sit at ±3.9, and the loop reaches only 0.25 m beyond them.

<<<<<<< SEARCH
  for (const z of [4.1, -4.1])
    for (const s of [1, -1]) {
      box(0.16, 0.2, 0.2, P.hullDark, [s * 0.55, 0.78, z]);
      b.sweep(
        [[s * 0.55, 0.78, z + Math.sign(z) * 0.1], [s * 0.55, 0.78, z + Math.sign(z) * 0.3], [s * 0.55, 0.6, z + Math.sign(z) * 0.36], [s * 0.55, 0.52, z + Math.sign(z) * 0.2]],
=======
  for (const z of [3.9, -3.9])
    for (const s of [1, -1]) {
      box(0.16, 0.2, 0.2, P.hullDark, [s * 0.55, 0.78, z]);
      b.sweep(
        [[s * 0.55, 0.78, z + Math.sign(z) * 0.1], [s * 0.55, 0.78, z + Math.sign(z) * 0.2], [s * 0.55, 0.62, z + Math.sign(z) * 0.22], [s * 0.55, 0.54, z + Math.sign(z) * 0.12]],
>>>>>>> REPLACE

<!-- call: fit-frontEnd -->

Exhaust stacks and the radar dish are the pieces that rise above y = 2.3, so I shortened the stacks and lowered the dish and its mast to fit.

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.5, 8), STEEL, { bone, at: [s * 1.3, 2.2, 2.55] });
    b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.12, 8), P.hullDark, { bone, at: [s * 1.3, 2.98, 2.55] });
    b.part(new THREE.TorusGeometry(0.12, 0.025, 4, 8), P.warn, { bone, at: [s * 1.3, 2.6, 2.55], rotation: [90, 0, 0] });
=======
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.7, 8), STEEL, { bone, at: [s * 1.3, 1.9, 2.55] });
    b.part(new THREE.CylinderGeometry(0.13, 0.1, 0.1, 8), P.hullDark, { bone, at: [s * 1.3, 2.25, 2.55] });
    b.part(new THREE.TorusGeometry(0.12, 0.025, 4, 8), P.warn, { bone, at: [s * 1.3, 2.05, 2.55], rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.rod([1.1, 2.2, 3.0], [1.1, 2.5, 3.0], 0.04, P.steel, { bone });
  b.part(new THREE.SphereGeometry(0.22, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.hullLight, {
    bone, at: [1.1, 2.55, 3.0], rotation: [70, 0, 0], flat: true,
  });
  b.rod([1.1, 2.55, 3.0], [1.1, 2.62, 3.15], 0.015, P.steel, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.lightRed, { bone, at: [1.1, 2.63, 3.16] }), 2);
=======
  b.rod([1.1, 2.1, 3.0], [1.1, 2.18, 3.0], 0.04, P.steel, { bone });
  b.part(new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.hullLight, {
    bone, at: [1.1, 2.18, 3.0], rotation: [70, 0, 0], flat: true,
  });
  b.rod([1.1, 2.18, 3.0], [1.1, 2.24, 3.1], 0.012, P.steel, { bone });
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.lightRed, { bone, at: [1.1, 2.25, 3.11] }), 2);
>>>>>>> REPLACE

<!-- call: fit-cargoBed -->

Fixes: the fuel drums move inside the x limit, the camo decals shrink to fit the wall, the antennas shorten, and the roll bar and antennas drop below y = 3.

<<<<<<< SEARCH
    decal(hexCamo, 1.6, 1.6, [s * 1.46, 1.95, -3.2], [s, 0, 0]);
    decal(hexCamo, 1.6, 1.6, [s * 1.46, 1.95, -1.2], [s, 0, 0], { mirror: true });
=======
    decal(hexCamo, 1.0, 1.0, [s * 1.46, 1.9, -3.2], [s, 0, 0]);
    decal(hexCamo, 1.0, 1.0, [s * 1.46, 1.9, -1.2], [s, 0, 0], { mirror: true });
>>>>>>> REPLACE
<<<<<<< SEARCH
      cyl(0.22, 0.22, 0.6, 10, i ? P.warn : P.olive, s * 1.62, 1.75, z);
      cyl(0.23, 0.23, 0.05, 10, P.steel, s * 1.62, 1.95, z);
      cyl(0.23, 0.23, 0.05, 10, P.steel, s * 1.62, 1.55, z);
      box(0.06, 0.4, 0.3, P.hullDark, s * 1.45, 1.75, z);
=======
      cyl(0.22, 0.22, 0.6, 10, i ? P.warn : P.olive, s * 1.1, 1.8, z - 0.3);
      cyl(0.23, 0.23, 0.05, 10, P.steel, s * 1.1, 2.1, z - 0.3);
      cyl(0.23, 0.23, 0.05, 10, P.steel, s * 1.1, 1.5, z - 0.3);
      box(0.06, 0.4, 0.3, P.hullDark, s * 1.33, 1.8, z - 0.3);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.rod([s * 1.35, 2.5, -0.4], [s * 1.38, 3.3 + (s > 0 ? 0.2 : 0), -0.4], 0.015, P.steel, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.neonMagenta, { bone: body, at: [s * 1.38, 3.32 + (s > 0 ? 0.2 : 0), -0.4] }), 2);
=======
    b.rod([s * 1.35, 2.5, -0.4], [s * 1.38, 2.9, -0.4], 0.015, P.steel, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.neonMagenta, { bone: body, at: [s * 1.38, 2.93, -0.4] }), 2);
>>>>>>> REPLACE
<<<<<<< SEARCH
    decal(hazard, 0.9, 0.2, [s * 1.46, 1.58, -2], [s, 0, 0]);
=======
    decal(hazard, 0.9, 0.2, [s * 1.46, 1.55, -2], [s, 0, 0]);
>>>>>>> REPLACE

<!-- call: fit-cabShell -->

Fixes: antennas shortened to stay under y=3, turret seat discs shrunk and moved inside the box, mirrors pulled in to x≤1.4, and the sensor plate lowered.

<<<<<<< SEARCH
    put(box(0.05, 0.04, 0.3), P.hullDark, [s * 1.4, 2.35, 1.95], body, { rotation: [0, 0, s * 20] });
    put(box(0.12, 0.22, 0.2), P.hullDark, [s * 1.62, 2.3, 2.1]);
    glow(put(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, [s * 1.62, 2.38, 2.21]), 2);
    put(box(0.02, 0.2, 0.18), P.steel, [s * 1.69, 2.3, 2.1]);
=======
    put(box(0.05, 0.04, 0.3), P.hullDark, [s * 1.3, 2.35, 1.95], body, { rotation: [0, 0, s * 20] });
    put(box(0.12, 0.22, 0.2), P.hullDark, [s * 1.33, 2.3, 2.1]);
    glow(put(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, [s * 1.33, 2.38, 2.21]), 2);
    put(box(0.02, 0.2, 0.18), P.steel, [s * 1.39, 2.3, 2.1]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  put(new THREE.CylinderGeometry(0.75, 0.8, 0.1, 12), P.steel, [0, 2.84, -0.3]);
  put(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 12), P.hullDark, [0, 2.86, -0.3]);
=======
  put(new THREE.CylinderGeometry(0.5, 0.55, 0.1, 12), P.steel, [0, 2.84, -0.05]);
  put(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 12), P.hullDark, [0, 2.86, -0.05]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    const x = -1.05 + i * 0.12, h = 0.7 + rr() * 0.8;
    put(new THREE.CylinderGeometry(0.008, 0.015, h, 5), P.steel, [x, 2.8 + h / 2, -0.45]);
    if (i % 2) glow(put(new THREE.SphereGeometry(0.025, 5, 4), P.lightRed, [x, 2.8 + h, -0.45]), 2);
=======
    const x = -1.05 + i * 0.12, h = 0.1 + rr() * 0.08;
    put(new THREE.CylinderGeometry(0.008, 0.015, h, 5), P.steel, [x, 2.8 + h / 2, -0.45]);
    if (i % 2) glow(put(new THREE.SphereGeometry(0.025, 5, 4), P.lightRed, [x, 2.8 + h, -0.45]), 2);
>>>>>>> REPLACE
<<<<<<< SEARCH
  put(box(0.3, 0.3, 0.04), P.hullDark, [1.0, 3.0, 0.2], body, { rotation: [0, 0, 20] });
  put(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 5), P.steel, [1.0, 2.9, 0.2]);
=======
  put(box(0.24, 0.1, 0.04), P.hullDark, [1.0, 2.9, 0.2], body, { rotation: [0, 0, 20] });
  put(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 5), P.steel, [1.0, 2.86, 0.2]);
>>>>>>> REPLACE

<!-- call: fit-turretGun -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildTurretGun({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const [cx, cy, cz] = M.turretRing as number[];

  const HULL = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) =>
      mix(P.hullDark, P.hullLight, smoothstep(-0.5, 1, n.y) * 0.7 + noise(p, 0.15, 3) * 0.3),
    ),
    { size: 0.22, rivets: 0.05 },
  );
  const STEEL = metal("steel", { tarnish: 0.3 });
  const IRON = metal("iron");
  const OLIVE = panelled(P.olive, { size: 0.18, rivets: 0.05 });

  const skull = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#161a22"/>
    <path d="M32 8C18 8 12 18 14 30c1 6 5 8 7 10v8h6v-5h4v5h6v-5h4v5h6v-8c2-2 6-4 7-10C52 18 46 8 32 8z" fill="#e7b814"/>
    <ellipse cx="24" cy="29" rx="6" ry="7" fill="#161a22"/><ellipse cx="40" cy="29" rx="6" ry="7" fill="#161a22"/>
    <path d="M32 36l-3 6h6z" fill="#161a22"/>
    <path d="M4 4h56v4H4z M4 56h56v4H4z" fill="#ff7a1a"/></svg>`,
    { size: 128 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    <path d="M0 16L16 0h12L12 16zM32 16L48 0h12L44 16z" fill="#161a22"/></svg>`,
    { size: 128 },
  );

  // Ring base with teeth
  b.part(new THREE.CylinderGeometry(0.75, 0.85, 0.12, 16), IRON, { bone: yaw, at: [cx, cy + 0.06, cz] });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.1), STEEL, {
      bone: yaw,
      at: [cx + Math.sin(a) * 0.82, cy + 0.16, cz + Math.cos(a) * 0.82],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  b.part(new THREE.CylinderGeometry(0.68, 0.72, 0.1, 16), STEEL, { bone: yaw, at: [cx, cy + 0.2, cz] });
  glow(b.part(new THREE.TorusGeometry(0.72, 0.02, 4, 24), P.neonCyan, { bone: yaw, at: [cx, cy + 0.26, cz], rotation: [90, 0, 0] }), 1.6);

  // Housing
  const hy = cy + 0.3;
  b.part(new THREE.BoxGeometry(1.1, 0.4, 1.0), HULL, { bone: yaw, at: [cx, hy, cz + 0.05] });
  b.part(new THREE.BoxGeometry(0.9, 0.16, 0.8), HULL, { bone: yaw, at: [cx, hy + 0.22, cz - 0.05] });
  b.frustumBox([cx, hy, cz + 0.55], [cx, hy + 0.05, cz + 0.85], [1.0, 0.36], [0.7, 0.24], { bone: yaw, color: HULL });
  b.frustumBox([cx, hy + 0.01, cz - 0.5], [cx, hy + 0.01, cz - 0.8], [0.9, 0.36], [0.8, 0.3], { bone: yaw, color: HULL });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.34, 0.9), STEEL, { bone: yaw, at: [cx + s * 0.58, hy, cz] });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.7), P.trim, { bone: yaw, at: [cx + s * 0.62, hy + 0.1, cz] });
    // rocket pods
    b.part(new THREE.BoxGeometry(0.28, 0.26, 0.6), OLIVE, { bone: yaw, at: [cx + s * 0.8, hy + 0.12, cz - 0.1] });
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), P.hullDark, {
          bone: yaw,
          at: [cx + s * (0.74 + i * 0.12), hy + 0.06 + j * 0.12, cz + 0.22],
          rotation: [90, 0, 0],
        });
        glow(b.part(new THREE.ConeGeometry(0.035, 0.1, 6), P.lightRed, {
          bone: yaw,
          at: [cx + s * (0.74 + i * 0.12), hy + 0.06 + j * 0.12, cz + 0.28],
          rotation: [90, 0, 0],
        }), 1.4);
      }
    // antennas
    b.rod([cx + s * 0.4, hy + 0.2, cz - 0.4], [cx + s * 0.6, hy + 0.26, cz - 0.6], 0.012, { bone: yaw, color: P.steel });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: yaw, at: [cx + s * 0.6, hy + 0.26, cz - 0.6] }), 2);
  }
  // Ammo box + belt
  b.part(new THREE.BoxGeometry(0.4, 0.14, 0.35), OLIVE, { bone: yaw, at: [cx - 0.35, hy + 0.22, cz - 0.1] });
  b.sweep([[cx - 0.2, hy + 0.22, cz - 0.1], [cx - 0.1, hy + 0.2, cz + 0.3], [cx - 0.05, hy + 0.15, cz + 0.8]], 0.02, { bone: yaw, color: P.brass });

  // Sensor eye
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8), IRON, { bone: yaw, at: [cx + 0.3, hy + 0.24, cz + 0.2] });
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), P.lightRed, { bone: yaw, at: [cx + 0.3, hy + 0.3, cz + 0.28] }), 2);

  // Shield plate with skull
  b.part(new THREE.BoxGeometry(1.0, 0.36, 0.06), HULL, { bone: pitch, at: [cx, cy + 0.45, cz + 0.98], rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
    bone: pitch, at: [cx, cy + 0.46, cz + 1.015], dir: [0, 0.2, 1], axis: "z", texture: skull,
  });
  b.part(new THREE.PlaneGeometry(0.9, 0.08), "#ffffff", {
    bone: pitch, at: [cx, cy + 0.3, cz + 1.015], dir: [0, 0.2, 1], axis: "z", texture: hazard,
  });

  // Twin autocannons
  const gy = pitch.at.y;
  const gz = pitch.at.z;
  for (const s of [1, -1]) {
    const x = cx + s * 0.22;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8), STEEL, { bone: pitch, at: [x, gy, gz + 0.2], rotation: [90, 0, 0] });
    b.rod([x, gy, gz + 0.3], [x, gy, gz + 1.7], [0.055, 0.045], { bone: pitch, color: IRON });
    b.rod([x, gy, gz + 0.5], [x, gy, gz + 1.2], 0.09, { bone: pitch, color: STEEL, sides: 8 });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.CylinderGeometry(0.097, 0.097, 0.02, 8), P.hullDark, { bone: pitch, at: [x, gy, gz + 0.6 + k * 0.17], rotation: [90, 0, 0] });
    b.rod([x, gy, gz + 1.7], [x, gy, gz + 1.95], 0.085, { bone: pitch, color: P.hullDark, sides: 6 });
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.1), P.warn, { bone: pitch, at: [x, gy + 0.09, gz + 1.85] });
    glow(b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), P.neonCyan, { bone: pitch, at: [x, gy, gz + 1.5] }), 1.5);
  }
  b.part(new THREE.BoxGeometry(0.7, 0.24, 0.3), HULL, { bone: pitch, at: [cx, gy, gz + 0.15] });
}
```
<!-- call: plan -->

```json
{
  "name": "Longspine Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military railgun carrier with a long rail barrel, deployed on four hydraulic stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [4.2, 3.4, 11.0],
  "layout": "Long, heavy 6x6 truck-like hull facing +Z. Front: armoured cab with a slanted glacis, angular windscreen slits and a sensor mast. Middle: flat deck with the railgun turret ring at the centre. Rear: capacitor bank and generator block, with stabiliser legs lowered at the four corners of the mid and rear hull. Six wheels in 3 axles (front, middle, rear) rest on y=0, with stabiliser pads also touching the floor. The railgun barrel is a twin-rail assembly pointing forward over the cab at about 15 degrees elevation, with a coil ring series along it. Style: faceted chunky armour plates in olive-gunmetal, hazard yellow trim, cyan glowing energy rails and coils, panelled paint with rivets, decals and stencil numbers drawn as SVG.",
  "palette": {
    "hull": "#4a5240",
    "hullDark": "#2f352b",
    "armorLight": "#6b7558",
    "gunmetal": "#2b2f36",
    "steel": "#8a919c",
    "rubber": "#16171a",
    "hazard": "#e7b814",
    "glowCyan": "#2ff3ff",
    "glowBlue": "#3a7bff",
    "glass": "#1c3a4a",
    "warnRed": "#c8281e",
    "white": "#e8ecef"
  },
  "mounts": {
    "deckTop": [0, 1.75, 0],
    "cabRoof": [0, 2.55, 3.4],
    "turretRing": [0, 1.85, -0.6],
    "breech": [0, 2.7, -1.6],
    "muzzle": [0, 3.1, 5.6],
    "axleFront": [0, 0.7, 3.6],
    "axleMid": [0, 0.7, -0.6],
    "axleRear": [0, 0.7, -3.4],
    "stabFL": [1.75, 1.2, 1.2],
    "stabRL": [1.75, 1.2, -4.2],
    "genDeck": [0, 1.75, -4.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.7, 0.7, 3.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.7, 0.7, 3.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.7, 0.7, -0.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.7, 0.7, -0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.7, 0.7, -3.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.7, 0.7, -3.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "turret", "parent": "body", "at": [0, 1.85, -0.6], "dir": [0, 0, 1], "role": "spine", "group": "gun" },
    { "name": "gunElev", "parent": "turret", "at": [0, 2.7, -1.6], "dir": [0, 0.26, 0.97], "role": "hinge", "group": "gun" },
    { "name": "stabFL", "parent": "body", "at": [1.75, 1.2, 1.2], "dir": [0.5, -1, 0], "role": "leg", "group": "stab" },
    { "name": "stabFR", "parent": "body", "at": [-1.75, 1.2, 1.2], "dir": [-0.5, -1, 0], "role": "leg", "group": "stab" },
    { "name": "stabRL", "parent": "body", "at": [1.75, 1.2, -4.2], "dir": [0.5, -1, 0], "role": "leg", "group": "stab" },
    { "name": "stabRR", "parent": "body", "at": [-1.75, 1.2, -4.2], "dir": [-0.5, -1, 0], "role": "leg", "group": "stab" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Main hull from y=0.9 to 1.75 from z=-5.5 to z=2.4: a loft/frustum-box lower hull with chamfered sides, a flat deck with panelled paint (rivets, hazard-stripe edge trims), side skirts and fender arches over the wheels, a rear bumper with tow hooks, underbody beams and axle housings reaching the three wheel axles, tail lights, stencil numbers and unit emblem decals via SVG textures. Includes the capacitor bank and generator block at the rear deck (genDeck): boxy cooling fins, glowing cyan indicator strips, exhaust stacks, cable runs.",
      "box": [[-2.05, 0.8, -5.5], [2.05, 2.7, 2.4]],
      "attaches": "Carries all joints by parent body; wheels, stabilisers and turret mount to its axle lines, stabFL/stabRL points and turretRing. Cab starts at z=2.4.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armoured cab at the front, z=2.4 to 5.2: sloped glacis plate, angled box cab with narrow glass slit windows (glass colour, SVG reflection streaks), roof hatch, sensor mast with dish and antenna, roof light bar, headlights glowing, front bumper with a hazard-striped ram plate, tow shackles, wing mirrors, side doors with handles and number decals, grille vents, armour add-on plates with bolts.",
      "box": [[-1.95, 0.9, 2.4], [1.95, 3.0, 5.4]],
      "attaches": "Sits on the chassis front at z=2.4 and the front axle housing at axleFront. Roof at cabRoof. Rides joint body.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "runningGear",
      "builds": "Six chunky low-poly wheels on three axles (rubber tyres with 8-sided lathe profile, tread blocks, steel hub discs with lug nuts and a hazard ring, painted mud near the bottoms), axle stubs, suspension arms and shock absorbers (coil via a sweep) running to the chassis. Wheel radius 0.7, centred at y=0.7, wheels at x=±1.7 on axleFront, axleMid, axleRear, so tyres touch y=0. Each wheel rides its own wheel joint.",
      "box": [[-2.1, 0.0, -4.2], [2.1, 1.4, 4.4]],
      "attaches": "Wheel joints sit at axle lines under the chassis; suspension arms end at the chassis underside.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs: each has a side-mounted box outrigger housing on the hull at stabFL/FR/RL/RR, a splayed telescoping hydraulic leg (two nested tubes in steel and hazard yellow, with a piston rod, bolts and hose sweeps) angling outward and down to a wide octagonal foot pad on the ground (y=0, pad radius 0.45, with a rubber underlay and warning chevron texture). Legs extend to x=±2.1 at floor. Warning red beacon on each housing.",
      "box": [[-2.2, 0.0, -4.7], [2.2, 1.6, 1.7]],
      "attaches": "Housings attach to the chassis flanks at stabFL, stabFR, stabRL and stabRR points; foot pads rest on y=0.",
      "joints": ["stabFL", "stabFR", "stabRL", "stabRR"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "railgun",
      "builds": "Turret and railgun: a rotating turret base ring at turretRing with a faceted armoured housing (panelled paint, hazard trim, crew hatch), gunElev cradle with trunnion blocks at breech, a massive breech block, twin parallel rails of gunmetal about 0.18 wide each spanning breech to muzzle (z=-1.6 to 5.6, rising about 15 degrees, so the muzzle is at y=3.1 above the cab), glowing cyan energy strips along the inner rail faces, a series of 8 coil rings spaced along the barrel (steel with glow cyan inner bands), a muzzle brake with glowing blue core, hydraulic recoil cylinders, ammo feed box and cable bundles back to the generator, SVG decals (warning chevrons, caution text).",
      "box": [[-1.5, 1.75, -2.4], [1.5, 3.4, 5.7]],
      "attaches": "Turret base sits on the deck at turretRing (0,1.85,-0.6); barrel passes above cabRoof, clearing the cab by at least 0.2 m; muzzle at muzzle mount.",
      "joints": ["turret", "gunElev"],
      "floor": false,
      "budget": 190
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
  const CHEV = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e7b814"/>` +
      `<path d="M0 20 L32 4 L64 20 L64 34 L32 18 L0 34Z M0 46 L32 30 L64 46 L64 60 L32 44 L0 60Z" fill="#16171a"/></svg>`,
    { size: 128 },
  );
  const ARROW = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e7b814"/><path d="M0 0H64L0 64Z" fill="#16171a"/></svg>`,
    { size: 64 },
  );
  const HULLP = paint((p, n) => {
    const base = mix(P.hull, P.armorLight, smoothstep(0.3, 0.8, noise(p, 0.3, 4)) * 0.5);
    return mix(base, P.hullDark, smoothstep(0.2, -0.8, n.y) * 0.5);
  });
  const MUD = paint((p, n) => mix(P.steel, "#4a3a28", smoothstep(0.5, 0.0, p.y) * 0.7 + noise(p, 0.1, 2) * 0.15 * (n.y > 2 ? 0 : 1)));

  const sides: [string, number, number][] = [
    ["FL", 1, 1.2],
    ["FR", -1, 1.2],
    ["RL", 1, -4.2],
    ["RR", -1, -4.2],
  ];
  for (const [id, s, z] of sides) {
    const j = J["stab" + id];
    const bone = j;
    // housing box on the hull flank
    b.part(new THREE.BoxGeometry(0.7, 0.5, 0.8), HULLP, { bone, at: [s * 1.85, 1.2, z] });
    b.part(new THREE.BoxGeometry(0.1, 0.52, 0.82), P.hazard, { bone, at: [s * 2.22, 1.2, z] });
    b.part(new THREE.BoxGeometry(0.6, 0.06, 0.7), P.gunmetal, { bone, at: [s * 1.85, 1.48, z] });
    // beacon
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 8), P.gunmetal, { bone, at: [s * 1.85, 1.53, z] });
    glow(b.part(new THREE.SphereGeometry(0.1, 8, 5), P.warnRed, { bone, at: [s * 1.85, 1.6, z] }), 1.6);
    // leg geometry
    const top = new THREE.Vector3(s * 2.0, 1.05, z);
    const foot = new THREE.Vector3(s * 2.1, 0.12, z);
    const mid = top.clone().lerp(foot, 0.45);
    b.rod(top, mid, 0.13, P.hazard, { bone, sides: 8 });
    b.rod(mid.clone().setY(mid.y + 0.05), foot.clone().setY(0.2), 0.09, P.steel, { bone, sides: 8 });
    b.rod(top.clone().add(new THREE.Vector3(s * 0.0, 0.0, 0.16)), mid.clone().add(new THREE.Vector3(0, 0, 0.16)), 0.035, MUD, { bone, sides: 6 });
    // collar rings
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8), P.gunmetal, { bone, at: mid });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 8), P.gunmetal, { bone, at: top });
    // bolts
    for (const dz of [-0.28, 0.28])
      for (const dy of [-0.15, 0.15])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), P.steel, {
          bone,
          at: [s * 2.28, 1.2 + dy, z + dz],
          dir: [s, 0, 0],
        });
    // hose sweep
    b.sweep(
      [
        [s * 1.9, 1.0, z - 0.3],
        [s * 2.2, 0.95, z - 0.3],
        [s * 2.2, 0.55, z - 0.25],
        [s * 2.1, 0.4, z - 0.1],
      ],
      0.03,
      { bone, color: P.rubber, sides: 6 },
    );
    // foot ball joint
    b.part(new THREE.SphereGeometry(0.12, 8, 6), P.gunmetal, { bone, at: [s * 2.1, 0.24, z] });
    // pad: rubber underlay + octagon plate with chevrons
    b.part(new THREE.CylinderGeometry(0.47, 0.47, 0.03, 8), P.rubber, { bone, at: [s * 2.1, 0.015, z] });
    b.part(new THREE.CylinderGeometry(0.45, 0.45, 0.07, 8), P.gunmetal, { bone, at: [s * 2.1, 0.065, z] });
    b.part(new THREE.CircleGeometry(0.38, 8), "#ffffff", {
      bone,
      at: [s * 2.1, 0.102, z],
      dir: [0, 1, 0],
      axis: "z",
      texture: CHEV,
    });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 8), P.steel, { bone, at: [s * 2.1, 0.13, z] });
    // diagonal brace
    b.rod([s * 1.7, 0.9, z + 0.3], [s * 2.0, 0.55, z + 0.3], 0.04, P.gunmetal, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.2), "#ffffff", {
      bone,
      at: [s * 2.275, 1.2, z],
      dir: [s, 0, 0],
      axis: "z",
      texture: ARROW,
    });
  }
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng, catmull } from "agentic-3js-builder";
import { coil } from "agentic-3js-builder/kits/clockwork";

export function buildRunningGear({ b, J, P, M }: any) {
  const R = 0.7;
  const MUD = "#4a3a28";
  const TIRE = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const low = smoothstep(0.55, 0.05, p.y);
    const m = noise(p, 0.18, 4);
    const base: [number, number, number] = [0.09, 0.09, 0.11];
    return mix(base, MUD, low * smoothstep(0.35, 0.6, m) * 0.85);
  });
  const hazardTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7b814" stroke="#16171a" stroke-width="3"/><circle cx="32" cy="32" r="20" fill="#8a919c"/><g stroke="#16171a" stroke-width="5">${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => {
        const a = (i * Math.PI) / 4;
        return `<line x1="${32 + 22 * Math.cos(a)}" y1="${32 + 22 * Math.sin(a)}" x2="${32 + 29 * Math.cos(a)}" y2="${32 + 29 * Math.sin(a)}"/>`;
      })
      .join("")}</g><circle cx="32" cy="32" r="7" fill="#2b2f36"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => {
        const a = (i * Math.PI) / 3;
        return `<circle cx="${32 + 13 * Math.cos(a)}" cy="${32 + 13 * Math.sin(a)}" r="2.2" fill="#e8ecef" stroke="#16171a"/>`;
      })
      .join("")}</svg>`,
    { size: 128 },
  );
  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, 3.6, 1], ["wheelFR", -1, 3.6, 1],
    ["wheelML", 1, -0.6, 1], ["wheelMR", -1, -0.6, 1],
    ["wheelRL", 1, -3.4, 1], ["wheelRR", -1, -3.4, 1],
  ];
  const r = rng(5);
  const tyreProfile: [number, number][] = [
    [0.38, -0.3], [0.62, -0.3], [0.7, -0.2], [0.7, 0.2], [0.62, 0.3], [0.38, 0.3],
  ];
  for (const [name, s, z] of wheels.map((w) => [w[0], w[1], w[2]] as [string, number, number])) {
    const j = J[name];
    const hub = new THREE.Vector3(1.7 * s, 0.7, z);
    const axle: [number, number, number] = [s, 0, 0];
    b.lathe(tyreProfile, { at: hub, axis: axle, segments: 8, color: TIRE, bone: j });
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) * Math.PI) / 4;
      const pos = [hub.x, hub.y + Math.sin(a) * 0.71, hub.z + Math.cos(a) * 0.71];
      b.part(new THREE.BoxGeometry(0.5, 0.06, 0.2), P.rubber, {
        at: pos, bone: j, rotation: [(-a * 180) / Math.PI + 90 - 90 + 0, 0, 0] as any,
      });
    }
    // hub disc with texture facing outward
    b.part(new THREE.CircleGeometry(0.4, 16), "#ffffff", {
      at: [hub.x + s * 0.31, hub.y, hub.z], dir: axle, axis: "z", texture: hazardTex, bone: j,
    });
    b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8), P.steel, {
      at: [hub.x + s * 0.26, hub.y, hub.z], dir: axle, bone: j,
    });
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.white, {
        at: [hub.x + s * 0.33, hub.y + Math.sin(a) * 0.2, hub.z + Math.cos(a) * 0.2], dir: axle, bone: j,
      });
    }
    // axle stub inward
    b.rod([hub.x, hub.y, hub.z], [s * 1.25, 0.7, z], 0.12, P.gunmetal, { bone: j });
    // suspension arm and shock to chassis underside
    b.rod([s * 1.25, 0.7, z], [s * 0.9, 1.0, z + 0.25], 0.07, P.hullDark, { bone: J.body });
    b.rod([s * 1.25, 0.75, z - 0.25], [s * 0.9, 1.0, z - 0.25], 0.05, P.hullDark, { bone: J.body });
    b.rod([s * 1.35, 0.8, z + 0.15], [s * 1.05, 1.0, z + 0.15], 0.045, P.steel, { bone: J.body });
    b.sweep(coil([s * 1.55, 0.78, z - 0.2], [s * 1.2, 1.0, z - 0.2], 0.07, 5), 0.015, { color: P.hazard, bone: J.body });
    b.part(new THREE.BoxGeometry(0.18, 0.12, 0.3), P.gunmetal, { at: [s * 0.95, 0.98, z], bone: J.body });
  }
  // axle beams across
  for (const z of [3.6, -0.6, -3.4]) {
    b.rod([-1.3, 0.7, z], [1.3, 0.7, z], 0.1, P.gunmetal, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.22, 8, 6), P.hullDark, { at: [0, 0.72, z], bone: J.body });
  }
  void r; void M; void catmull;
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(5);

  const plated = (base: string, dark: string) =>
    paint((p, n) => {
      const seam = Math.abs(((p.z * 3) % 1)) < 0.02 || Math.abs(((p.y * 3.3) % 1)) < 0.02;
      const m = noise(p, 0.4, 3);
      const c = mix(base, dark, seam ? 0.8 : 0.25 * m + 0.1 * (1 - n.y));
      return c;
    });
  const HULL = plated(P.hull, P.hullDark);
  const ARM = plated(P.armorLight, P.hull);

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, rotation: rot, flat: true });

  const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#16171a"/>`)
    .join("")}</svg>`, { size: 128 });
  const slit = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#1c3a4a"/><path d="M8 16 L20 0 L26 0 L14 16Z M30 16 L42 0 L46 0 L34 16Z" fill="#6fb8d0" opacity="0.6"/></svg>`, { size: 128 });
  const num = svg(`<svg viewBox="0 0 40 40"><text x="20" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#e8ecef">07</text></svg>`, { size: 96 });
  const vent = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#16171a"/>${[4, 10, 16, 22, 28]
    .map((y) => `<rect x="3" y="${y - 1.5}" width="26" height="3" fill="#2b2f36"/>`)
    .join("")}</svg>`, { size: 64 });

  const flatTex = (w: number, h: number, tex: any, at: number[], dir: number[], col = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), col, { bone: body, at, dir, axis: "z", texture: tex });

  // lower cab block
  box(3.7, 0.9, 2.6, HULL, [0, 1.35, 4.0]);
  // glacis slope
  b.extrude([[0, 0], [0.9, 0], [0.9, 0.5], [0.45, 0.9, "sharp"], [0, 0.9]],
    { at: [-1.85, 1.65, 4.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 3.7, color: ARM, bone: body });
  // cab upper
  b.extrude([[0, 0], [2.2, 0], [1.9, 1.0], [0.5, 1.05]],
    { at: [-1.7, 1.8, 2.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 3.4, color: HULL, bone: body });
  // roof plate
  box(3.2, 0.1, 1.55, ARM, [0, 2.88, 3.3]);
  // windscreen slits
  flatTex(2.6, 0.38, slit, [0, 2.45, 4.86], [0, 0.45, 1]);
  for (const s of [1, -1]) {
    flatTex(1.0, 0.34, slit, [s * 1.73, 2.45, 3.4], [s, 0.05, 0]);
    flatTex(0.4, 0.4, num, [s * 1.75, 2.0, 3.0], [s, 0, 0]);
    // doors
    box(0.05, 0.95, 1.1, ARM, [s * 1.84, 2.0, 3.45]);
    box(0.08, 0.06, 0.25, P.steel, [s * 1.89, 1.95, 3.8]);
    // mirrors
    b.rod([s * 1.85, 2.5, 4.4], [s * 2.0, 2.6, 4.6], 0.025, P.gunmetal, { bone: body });
    box(0.06, 0.28, 0.2, P.gunmetal, [s * 1.98, 2.6, 4.6]);
    // headlights
    glow(b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 8), P.white, { bone: body, at: [s * 1.3, 1.45, 5.3], dir: [0, 0, 1] }), 1.8);
    flatTex(0.7, 0.5, vent, [s * 0.75, 1.6, 5.31], [0, 0, 1]);
    // tow shackles
    b.rod([s * 0.9, 1.1, 5.35], [s * 0.9, 1.1, 5.55], 0.05, P.steel, { bone: body });
    b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8), P.steel, { bone: body, at: [s * 0.9, 1.1, 5.58] });
    // add-on armour plates + bolts
    box(0.12, 0.7, 0.9, P.armorLight, [s * 1.92, 1.4, 3.3]);
    for (const dz of [-0.3, 0.3]) for (const dy of [-0.25, 0.25])
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 6), P.steel, { bone: body, at: [s * 2.0, 1.4 + dy, 3.3 + dz], dir: [s, 0, 0] });
    // light bar ends
    glow(box(0.12, 0.12, 0.12, P.warnRed, [s * 1.0, 2.98, 4.0]), 1.4);
  }
  // front bumper + ram plate
  box(3.9, 0.45, 0.35, P.gunmetal, [0, 1.05, 5.25]);
  flatTex(3.6, 0.35, hazard, [0, 1.05, 5.44], [0, 0, 1]);
  // roof light bar
  glow(box(1.5, 0.1, 0.12, P.hazard, [0, 2.98, 4.0]), 1.6);
  // roof hatch
  b.lathe([[0, 0], [0.4, 0], [0.34, 0.1], [0, 0.12]], { at: [-0.6, 2.93, 3.0], bone: body, color: P.hullDark, segments: 8 });
  b.part(new THREE.TorusGeometry(0.2, 0.03, 4, 8), P.steel, { bone: body, at: [-0.6, 3.0, 3.0], rotation: [90, 0, 0] });
  // sensor mast
  b.rod([0.7, 2.93, 2.7], [0.7, 3.0, 2.7], 0.04, P.steel, { bone: body });
  b.rod([0.7, 2.93, 2.7], [0.7, 3.0, 2.7], 0.05, P.steel, { bone: body });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), P.gunmetal, { bone: body, at: [0.7, 2.95, 2.7] });
  b.lathe([[0, 0], [0.3, 0.12], [0.3, 0.14], [0, 0.04]], { at: [0.7, 2.98, 2.62], axis: [0, 0.6, 0.8], bone: body, color: P.steel, segments: 8 });
  b.rod([0.95, 2.95, 2.5], [0.95, 3.0, 2.5], 0.015, P.gunmetal, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.glowCyan, { bone: body, at: [0.7, 2.99, 2.7] }), 2);
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, countershade, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildRailgun({ b, J, P, M }: Ctx) {
  const T = J.turret;
  const G = J.gunElev;
  const ang = Math.atan2(0.26, 0.97);
  const cA = Math.cos(ang);
  const sA = Math.sin(ang);
  // point along barrel axis: z distance from breech
  const bp = (d: number, x = 0, y = 0): [number, number, number] => [
    x,
    2.7 + sA * d + y * cA,
    -1.6 + cA * d - y * sA,
  ];
  const dir: [number, number, number] = [0, sA, cA];

  const hullPaint = panelled(countershade(P.hull, P.hullDark, { level: -0.2 }), { size: 0.5, rivets: 0.1 });
  const darkPaint = panelled(P.gunmetal, { size: 0.4, rivets: 0.12 });

  const chev = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#16171a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const caution = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8ecef"/><rect x="1" y="1" width="62" height="30" fill="none" stroke="#c8281e" stroke-width="2"/><path d="M8 24 L16 8 L24 24Z" fill="#e7b814" stroke="#16171a" stroke-width="2"/><text x="28" y="15" font-size="9" font-weight="bold" fill="#c8281e" font-family="sans-serif">CAUTION</text><text x="28" y="26" font-size="7" fill="#16171a" font-family="sans-serif">HV RAIL</text></svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, n = 8) => new THREE.CylinderGeometry(r, r, h, n);

  // turret base ring
  b.part(cyl(1.25, 0.12, 12), P.gunmetal, { bone: T, at: [0, 1.91, -0.6] });
  b.part(cyl(1.1, 0.1, 12), P.steel, { bone: T, at: [0, 1.99, -0.6] });
  // armoured housing
  b.lathe(
    [[0, 0], [1.15, 0], [1.0, 0.45], [0.8, 0.62], [0, 0.62]],
    { at: [0, 2.04, -0.6], segments: 8, bone: T, color: hullPaint },
  );
  b.frustumBox([0, 2.1, -0.9], [0, 2.1, -0.9], [1.5, 0.1], [1.5, 0.1], { bone: T, color: P.hull });
  // hazard trim ring
  b.part(new THREE.TorusGeometry(1.12, 0.03, 4, 16), P.hazard, { bone: T, at: [0, 2.07, -0.6], rotation: [90, 0, 0] });
  // side plates
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.5, 1.6), P.armorLight, { bone: T, at: [s * 0.95, 2.4, -0.7], rotation: [0, 0, s * 8] });
    b.part(new THREE.PlaneGeometry(0.9, 0.22), "#ffffff", {
      bone: T, at: [s * 1.01, 2.35, -0.7], dir: [s, 0, 0], axis: "z", texture: chev,
    });
    // trunnion blocks
    b.part(box(0.35, 0.55, 0.5), P.gunmetal, { bone: T, at: [s * 0.62, 2.7, -1.6] });
    b.part(cyl(0.12, 0.5, 8), P.steel, { bone: T, at: [s * 0.8, 2.7, -1.6], rotation: [0, 0, 90] });
  }
  // crew hatch
  b.part(cyl(0.32, 0.08, 8), P.armorLight, { bone: T, at: [-0.45, 2.68, -0.1] });
  b.part(cyl(0.2, 0.06, 8), P.gunmetal, { bone: T, at: [-0.45, 2.74, -0.1] });
  b.part(box(0.1, 0.06, 0.1), P.hazard, { bone: T, at: [-0.45, 2.79, -0.1] });
  // caution decal on housing top
  b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
    bone: T, at: [0.4, 2.67, 0.05], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: caution,
  });
  // ammo feed box
  b.part(box(0.7, 0.5, 0.8), P.hullDark, { bone: T, at: [0.9, 2.3, -1.6] });
  b.part(box(0.74, 0.08, 0.84), P.hazard, { bone: T, at: [0.9, 2.56, -1.6] });
  // cables to rear
  for (const [x, c] of [[0.2, P.gunmetal], [-0.2, P.rubber], [0.0, P.warnRed]] as [number, string][]) {
    b.sweep(
      [[x, 2.5, -1.9], [x, 2.35, -2.2], [x, 2.1, -2.4]],
      0.04,
      { bone: T, color: c, sides: 6 },
    );
  }

  // breech block
  b.part(box(0.9, 0.85, 1.0), darkPaint, { bone: G, at: bp(-0.2), dir, axis: "z" });
  b.part(box(0.7, 0.6, 0.3), P.hullDark, { bone: G, at: bp(-0.85), dir, axis: "z" });
  b.part(box(1.0, 0.1, 1.05), P.hazard, { bone: G, at: bp(-0.2, 0, 0.45), dir, axis: "z" });

  // rails
  for (const s of [1, -1]) {
    const a = bp(0.4, s * 0.2, 0);
    const e = bp(7.2, s * 0.2, 0);
    b.rod(a, e, 0.0, { bone: G, color: P.gunmetal, sides: 4, radius: 0.1 });
    // inner glowing strips
    glow(
      b.part(box(0.025, 0.1, 6.7), P.glowCyan, { bone: G, at: bp(3.8, s * 0.1, 0), dir, axis: "z" }),
      1.6,
    );
    b.part(box(0.18, 0.28, 6.8), P.gunmetal, { bone: G, at: bp(3.8, s * 0.2, 0), dir, axis: "z" });
    b.part(box(0.06, 0.1, 6.6), P.steel, { bone: G, at: bp(3.8, s * 0.28, 0.14), dir, axis: "z" });
  }
  // coil rings
  for (let i = 0; i < 8; i++) {
    const d = 1.2 + i * 0.85;
    const at = bp(d);
    b.part(new THREE.TorusGeometry(0.42, 0.09, 5, 8), P.steel, { bone: G, at, dir, axis: "z" });
    glow(b.part(new THREE.TorusGeometry(0.38, 0.03, 4, 8), P.glowCyan, { bone: G, at, dir, axis: "z" }), 1.8);
    b.part(box(0.2, 0.14, 0.3), P.gunmetal, { bone: G, at: bp(d, 0, -0.42), dir, axis: "z" });
  }
  // muzzle brake
  const mz = bp(7.4);
  b.part(box(0.7, 0.55, 0.6), darkPaint, { bone: G, at: mz, dir, axis: "z" });
  b.part(box(0.74, 0.08, 0.64), P.hazard, { bone: G, at: bp(7.4, 0, 0.3), dir, axis: "z" });
  glow(b.part(new THREE.SphereGeometry(0.18, 6, 4), P.glowBlue, { bone: G, at: bp(7.72), dir, axis: "z" }), 2);
  for (const s of [1, -1]) b.part(box(0.06, 0.4, 0.4), P.steel, { bone: G, at: bp(7.4, s * 0.38, 0), dir, axis: "z" });

  // recoil cylinders
  for (const s of [1, -1]) {
    b.rod(bp(0.3, s * 0.5, -0.5), bp(2.2, s * 0.5, -0.5), 0.07, { bone: G, color: P.steel, sides: 6 });
    b.rod(bp(-0.3, s * 0.5, -0.5), bp(0.5, s * 0.5, -0.5), 0.11, { bone: G, color: P.hazard, sides: 6 });
  }
  // cradle plate with chevron
  b.part(new THREE.PlaneGeometry(0.9, 0.22), "#ffffff", {
    bone: G, at: bp(-0.2, 0, 0.47), dir: [0, cA, -sA], axis: "z", up: dir, texture: chev,
  });
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng, countershade, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const HAZ = paint((p) => (Math.floor((p.x + p.z) / 0.14) % 2 === 0 ? "#e7b814" : "#16171a"));
  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.armorLight, smoothstep(0.4, 1, n.y) * 0.6 + noise(p, 0.5, 3) * 0.25);
    const u = Math.abs(n.y) > 0.5 ? p.x : p.z;
    const v = Math.abs(n.y) > 0.5 ? p.z : p.y;
    const fu = ((u / 0.5) % 1 + 1) % 1, fv = ((v / 0.5) % 1 + 1) % 1;
    if (fu < 0.015 || fv < 0.015) return mix(base, "#1a1d16", 0.8);
    if (fu < 0.07 && fv < 0.07) return mix(base, "#c8ccb0", 0.6);
    return base;
  });
  const dark = countershade(P.hullDark, "#1c1f19", { level: 0 });

  // lower hull: chamfered loft
  b.loft(
    [
      { at: [0, 1.25, -5.4], w: 3.5, h: 0.7 },
      { at: [0, 1.3, -2], w: 3.8, h: 0.8 },
      { at: [0, 1.3, 1.2], w: 3.8, h: 0.8 },
      { at: [0, 1.25, 2.3], w: 3.4, h: 0.7 },
    ],
    { bone, color: hullPaint, section: "box" },
  );
  // deck plate
  box(3.9, 0.12, 7.8, hullPaint, [0, 1.69, -1.55]);
  // hazard edge trims
  for (const s of [1, -1]) {
    box(0.14, 0.04, 7.8, HAZ, [s * 1.9, 1.76, -1.55]);
    box(0.1, 0.5, 7.7, dark, [s * 1.93, 1.2, -1.55]);
    // skirts
    box(0.08, 0.3, 1.5, P.gunmetal, [s * 2.0, 1.0, 0.6]);
    box(0.08, 0.3, 1.8, P.gunmetal, [s * 2.0, 1.0, -2.0]);
    // fender arches over wheels
    for (const z of [3.6 - 1.2, -0.6, -3.4]) {
      const zz = z === 2.4 ? 2.1 : z;
      b.part(new THREE.CylinderGeometry(0.88, 0.88, 0.45, 8, 1, false, 0, Math.PI), P.hullDark, {
        bone, at: [s * 1.85, 1.35, zz], rotation: [0, 0, 90], flat: true,
      });
      box(0.5, 0.06, 1.8, HAZ, [s * 1.85, 2.0 > 1 ? 1.78 : 0, zz], {});
    }
    // axle housings & beams
    box(0.2, 0.3, 7.6, P.gunmetal, [s * 1.0, 0.95, -1.5]);
  }
  for (const z of [M.axleFront[2] - 1.5, M.axleMid[2], M.axleRear[2]]) {
    b.rod([-1.7, 0.85, z], [1.7, 0.85, z], 0.12, P.gunmetal, { bone });
    box(0.7, 0.35, 0.5, P.gunmetal, [0, 0.9, z]);
  }
  // front bulkhead
  box(3.4, 0.6, 0.15, P.hullDark, [0, 1.95, 2.3]);

  // rear bumper
  box(3.9, 0.35, 0.3, P.gunmetal, [0, 1.0, -5.55]);
  box(3.9, 0.08, 0.31, HAZ, [0, 1.22, -5.55]);
  for (const s of [1, -1]) {
    b.torus ? 0 : 0;
    b.part(new THREE.TorusGeometry(0.12, 0.04, 5, 8, Math.PI * 1.5), P.steel, { bone, at: [s * 1.2, 0.95, -5.75], flat: true });
    // tail lights
    glow(box(0.3, 0.16, 0.06, P.warnRed, [s * 1.55, 1.4, -5.53]), 1.2);
  }

  // stencil number & emblem
  const num = svg(
    `<svg viewBox="0 0 120 60"><text x="60" y="48" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="52" fill="#e8ecef">R-07</text></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2b2f36" stroke="#e8ecef" stroke-width="4"/><path d="M12 36 L52 28 M12 42 L52 34" stroke="#2ff3ff" stroke-width="5"/><path d="M32 8 L38 24 L26 24Z" fill="#e7b814"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", { bone, at: [s * 2.0, 1.45, -2.2], dir: [s, 0, 0], axis: "z", texture: num });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone, at: [s * 2.0, 1.45, 0.4], dir: [s, 0, 0], axis: "z", texture: emblem });
  }
  b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", { bone, at: [0, 1.0, -5.71], dir: [0, 0, -1], axis: "z", texture: num });

  // generator / capacitor block on rear deck
  const gz = M.genDeck[2];
  box(3.0, 0.7, 2.2, hullPaint, [0, 2.1, gz - 0.2]);
  box(3.1, 0.06, 2.3, HAZ, [0, 1.78, gz - 0.2]);
  for (let i = 0; i < 9; i++) box(2.8, 0.5, 0.05, P.gunmetal, [0, 2.7, gz - 1.1 + i * 0.22]);
  for (const s of [1, -1]) {
    glow(box(0.04, 0.12, 1.6, P.glowCyan, [s * 1.52, 2.2, gz - 0.2]), 1.5);
    glow(box(1.5, 0.05, 0.05, P.glowBlue, [0, 2.48, gz + 0.9]), 1.2);
    // exhaust stacks
    b.part(new THREE.CylinderGeometry(0.14, 0.18, 0.9, 8), P.gunmetal, { bone, at: [s * 1.0, 2.9, gz - 1.0], flat: true });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 8), "#101010", { bone, at: [s * 1.0, 3.36, gz - 1.0] });
  }
  // capacitor cylinders
  for (let i = 0; i < 4; i++) {
    const x = -1.05 + i * 0.7;
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 8), P.steel, { bone, at: [x, 2.7, gz + 0.5], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.23, 0.23, 0.08, 8), P.glowCyan, { bone, at: [x, 2.72, gz + 0.5] }), 1.4);
  }
  // cable runs
  for (const s of [1, -1])
    b.sweep([[s * 0.9, 2.6, gz + 0.9], [s * 0.9, 1.95, gz + 1.8], [s * 0.6, 1.82, -1.5]], 0.05, { bone, color: "#0d0d10" });

  // deck rivet bolts & turret ring seat
  b.part(new THREE.CylinderGeometry(1.15, 1.25, 0.14, 12), P.gunmetal, { bone, at: [0, 1.82, M.turretRing[2]], flat: true });
  const bolts = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bolts.push(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6).translate(Math.cos(a) * 1.05, 1.92, M.turretRing[2] + Math.sin(a) * 1.05));
  }
  for (const g of bolts) b.part(g, P.steel, { bone, at: [0, 0, 0] });
  for (let i = 0; i < 6; i++) box(0.5, 0.05, 0.3, P.armorLight, [(R() - 0.5) * 3, 1.78, 1.4 + R() * 0.5]);
}
```
<!-- call: plan -->

```json
{
  "name": "Warhound 77 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 truck from 2077: wedge armored cab, neon-lit chassis, roof turret and a modular cargo bay with missile racks.",
  "builderName": "warhoundTruck",
  "size": [2.8, 3.1, 8.0],
  "layout": "Long heavy 6x6 truck facing +Z. Front: sloped armored wedge hood with bull-bar plow and light bar, then a tall angular cab with slit windshield, roof turret ring at the cab roof rear. Behind the cab a flat cargo bay (deck y=1.5) holding a boxy armored container with a rear missile rack and a rear ramp. Three axles with chunky wheels (front, mid, rear) under fenders. Hard-edged low-poly facets, matte gunmetal hull with hazard-yellow trim, cyan and magenta neon strips along skirts, headlights, and screens. Details everywhere: rivet panels, vents, antennas, pipes, decals, stencil numbers, kanji and warning glyphs textures.",
  "palette": {
    "hull": "#3a414d",
    "hullDark": "#22262e",
    "hullLight": "#5a6475",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0b1a24",
    "rubber": "#16171a",
    "rim": "#8a919e",
    "metalDark": "#0e0f12",
    "warnRed": "#d12a2a",
    "olive": "#4a5238",
    "emberOrange": "#ff7a1e"
  },
  "mounts": {
    "chassisTop": [0, 1.5, 0],
    "cabFloor": [0, 1.5, 2.2],
    "cabRoof": [0, 2.9, 1.9],
    "turretRing": [0, 2.9, 1.2],
    "cargoDeck": [0, 1.5, -1.9],
    "axleFront": [0, 0.55, 2.7],
    "axleMid": [0, 0.55, -1.0],
    "axleRear": [0, 0.55, -2.8],
    "rearFace": [0, 1.5, -4.0],
    "bumperFront": [0, 0.9, 4.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.9, 1.2], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.1, 1.2], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "rampHinge", "parent": "body", "at": [0, 1.5, -4.0], "dir": [1, 0, 0], "role": "hinge", "group": "cargo" },
    { "name": "wheelFL", "parent": "body", "at": [1.2, 0.55, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.2, 0.55, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.2, 0.55, -1.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.2, 0.55, -1.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.2, 0.55, -2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.2, 0.55, -2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Frame and underbody: twin ladder rails, crossmembers, differentials, drive shafts, exhaust pipes, fuel tanks, side skirts with cyan neon strips (glow), hazard-yellow stripe paint, bottom armor plate with panelled paint, mud flaps, tow hooks. Spans front bumper to rear face below the deck at y 0.45-1.5.",
      "box": [[-1.3, 0.35, -4.0], [1.3, 1.5, 4.0]],
      "attaches": "Top at chassisTop; cab sits on cabFloor, cargo on cargoDeck; axle stubs reach axleFront/Mid/Rear lines. Rides body.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "runningGear",
      "builds": "Six chunky low-poly wheels (octagonal tyres with tread blocks, rim lathes with bolts, glowing magenta hub rings), wheel arches/fenders with armor lips, suspension arms and shock absorbers with coil springs, brake discs. Each wheel on its own wheel joint, radius 0.55.",
      "box": [[-1.4, 0, -3.4], [1.4, 1.2, 3.3]],
      "attaches": "Wheels centered on axleFront, axleMid, axleRear at x=±1.2 on joints wheelFL..wheelRR; arms tie to chassis sides.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "cabHood",
      "builds": "Front armored section: sloped hood wedge with vents and panelled paint, plow bull-bar bumper with hazard stripes, roof light bar and headlights (glow cyan/white), grille with magenta glow, tall angular cab with slit windshield (glass with HUD-like svg decal), side doors with armor plates, gunport shutters, mirrors with cameras, antennas, roof sensor dome, stencil numbers and kanji decals via svg textures.",
      "box": [[-1.3, 1.5, 0.6], [1.3, 3.0, 4.0]],
      "attaches": "Floor at cabFloor/chassisTop; roof meets turretRing at cabRoof; rear wall at z=0.6 meets cargo front. Rides body.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof remote weapon station: ring base with teeth, rotating armored housing on turretYaw, twin autocannon barrels with muzzle brakes and cooling shrouds on gunPitch, ammo box with belt, sensor eye with glowing red lens, antenna array, smoke launchers, small shield plate with warning decal.",
      "box": [[-0.8, 2.9, 0.4], [0.8, 3.1, 2.4]],
      "attaches": "Base on turretRing mount (cabRoof); housing rides turretYaw, guns ride gunPitch.",
      "joints": ["turretYaw", "gunPitch", "body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cargoBay",
      "builds": "Rear armored container on cargoDeck: panelled walls with rivets, hazard-yellow trim, slanted roof plates with vents and solar panel, side ribs, magenta neon strips, roof-mounted missile rack with 8 missiles (orange tips), rear hinged ramp on rampHinge with grip texture, tail lights (glow red), rear stencil logo and warning decals, stowed barrels and crates along sides, antenna masts.",
      "box": [[-1.4, 1.5, -4.0], [1.4, 3.0, 0.6]],
      "attaches": "Sits on cargoDeck at y=1.5; front wall meets cab rear at z=0.6; ramp pivots at rampHinge/rearFace.",
      "joints": ["body", "rampHinge"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, glow } from "agentic-3js-builder";

export function buildTurret({ b, J, P, M }: Ctx) {
  const Y = J.turretYaw, G = J.gunPitch, B = J.body;
  const WARN = svg(`<svg viewBox="0 0 64 64"><path d="M32 4 L62 58 H2Z" fill="#e7b814" stroke="#0e0f12" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="19" fill="#0e0f12"/><rect x="29" y="46" width="6" height="6" fill="#0e0f12"/></svg>`, { size: 128 });
  const hull = paint((p, n) => (n.y > 0.5 ? P.hullLight : (Math.abs(((p.x + p.z) * 12) % 1) < 0.04 ? P.hullDark : P.hull)));
  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, s: number, c: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, s), c, { bone, at, flat: true, ...o });
  const cx = 0, cz = 1.2;

  // ring base with teeth
  cyl(0.5, 0.55, 0.08, 16, P.hullDark, [cx, 2.94, cz], B);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.06, 0.05, 0.06, P.rim, [Math.sin(a) * 0.53, 2.99, cz + Math.cos(a) * 0.53], B, { rotation: [0, (a * 180) / Math.PI, 0] });
  }
  cyl(0.46, 0.46, 0.02, 16, P.neonCyan, [cx, 2.985, cz], B, {});
  // housing
  cyl(0.42, 0.45, 0.1, 8, P.hullDark, [cx, 3.02, cz], Y);
  box(0.8, 0.22, 0.8, hull, [cx, 3.15, cz], Y);
  box(0.7, 0.1, 0.7, hull, [cx, 3.31, cz - 0.02], Y, { rotation: [0, 0, 0] });
  // side plates
  for (const s of [1, -1]) {
    box(0.06, 0.28, 0.7, P.hullLight, [s * 0.43, 3.17, cz], Y);
    box(0.08, 0.04, 0.5, P.trim, [s * 0.46, 3.1, cz], Y);
  }
  // front shield with warning decal
  box(0.9, 0.3, 0.06, P.hullDark, [cx, 3.18, cz + 0.45], Y, { rotation: [-10, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { bone: Y, at: [cx + 0.28, 3.18, cz + 0.49], dir: [0, 0, 1], axis: "z", texture: WARN });
  // ammo box + belt
  box(0.3, 0.2, 0.3, P.olive, [0.55, 3.1, cz - 0.1], Y);
  box(0.32, 0.03, 0.32, P.trim, [0.55, 3.21, cz - 0.1], Y);
  for (let i = 0; i < 6; i++)
    box(0.04, 0.04, 0.05, P.trim, [0.5 - i * 0.03, 3.14 + i * 0.015, cz + 0.12 + i * 0.04], Y, {});
  // sensor eye
  cyl(0.09, 0.09, 0.14, 8, P.metalDark, [-0.42, 3.4, cz + 0.1], Y, { rotation: [90, 0, 0] });
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), P.warnRed, { bone: Y, at: [-0.42, 3.4, cz + 0.18], flat: true }), 2);
  // antennas
  for (const [x, z, h] of [[-0.3, -0.25, 0.6], [0.3, -0.3, 0.4]] as number[][]) {
    b.rod([x, 3.35, cz + z], [x, 3.35 + h, cz + z], 0.008, P.metalDark, { bone: Y });
    b.part(new THREE.SphereGeometry(0.02, 6, 4), P.neonMagenta, { bone: Y, at: [x, 3.35 + h, cz + z] });
  }
  // smoke launchers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      cyl(0.04, 0.04, 0.2, 6, P.metalDark, [s * 0.49, 3.2 + i * 0.07, cz - 0.1 + 0.01 * i], Y, { rotation: [75, 0, s * 20] });
    }
  // guns
  cyl(0.1, 0.1, 0.16, 8, P.hullDark, [0, 3.15, cz + 0.5], G, { rotation: [0, 0, 90] });
  box(0.7, 0.2, 0.28, P.hull, [0, 3.15, cz + 0.55], G);
  for (const s of [1, -1]) {
    const x = s * 0.2;
    b.rod([x, 3.15, cz + 0.65], [x, 3.15, cz + 1.4], 0.04, P.metalDark, { bone: G });
    cyl(0.07, 0.07, 0.4, 8, P.hull, [x, 3.15, cz + 0.85], G, { rotation: [90, 0, 0] });
    for (let i = 0; i < 3; i++) cyl(0.075, 0.075, 0.02, 8, P.trim, [x, 3.15, cz + 0.72 + i * 0.12], G, { rotation: [90, 0, 0] });
    cyl(0.06, 0.06, 0.12, 6, P.hullDark, [x, 3.15, cz + 1.42], G, { rotation: [90, 0, 0] });
    box(0.1, 0.02, 0.08, P.emberOrange, [x, 3.15, cz + 1.42], G);
  }
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const r = rng(11);
  const tyrePaint = paint((p, n) => {
    const k = noise(p, 0.08, 3);
    return mix(P.rubber, "#2a2b30", smoothstep(0.4, 0.8, k) * 0.8);
  });
  const rimPaint = paint((p, n) => mix(P.rim, "#5a6070", noise(p, 0.05, 5)));
  const armorPaint = paint((p, n) => {
    const k = noise(p, 0.12, 9);
    const c = mix(P.hull, P.hullDark, smoothstep(0.3, 0.8, k));
    return n.y > 0.6 ? mix(c, P.hullLight, 0.3) : c;
  });
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 8} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 16Z" fill="#16171a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2fa8" stroke-width="6"/><circle cx="32" cy="32" r="14" fill="none" stroke="#ff2fa8" stroke-width="4"/><path d="M32 6V18M32 46V58M6 32H18M46 32H58" stroke="#ff2fa8" stroke-width="4"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, 2.7, 1], ["wheelFR", -1, 2.7, -1],
    ["wheelML", 1, -1, 1], ["wheelMR", -1, -1, -1],
    ["wheelRL", 1, -2.8, 1], ["wheelRR", -1, -2.8, -1],
  ];
  const tread = new THREE.BoxGeometry(0.34, 0.07, 0.16);
  for (const [name, s, z] of wheels.map((w) => [w[0], w[3], w[2]] as [string, number, number])) {
    const j = J[name];
    const cx = s * 1.2;
    const axis: [number, number, number] = [s, 0, 0];
    // tyre: octagonal lathe about the axle
    b.lathe(
      [[0.3, -0.19], [0.5, -0.2], [R, -0.14], [R, 0.14], [0.5, 0.2], [0.3, 0.19]],
      { at: [cx, 0.55, z], axis, segments: 8, color: tyrePaint, bone: j },
    );
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.part(tread, P.metalDark, {
        bone: j,
        at: [cx, 0.55 + Math.cos(a) * (R + 0.02), z + Math.sin(a) * (R + 0.02)],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
    // rim
    const out = cx + s * 0.2;
    b.lathe(
      [[0, 0], [0.36, 0], [0.36, 0.05], [0.2, 0.09], [0.1, 0.12], [0, 0.12]],
      { at: [cx + s * 0.16, 0.55, z], axis, segments: 8, color: rimPaint, bone: j },
    );
    // magenta hub ring
    glow(
      b.part(new THREE.CircleGeometry(0.3, 16), "#ffffff", {
        bone: j,
        at: [cx + s * 0.285, 0.55, z],
        dir: axis,
        axis: "z",
        texture: hubTex,
      }),
      1.6,
    );
    // lug bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.metalDark, {
        bone: j,
        at: [cx + s * 0.27, 0.55 + Math.cos(a) * 0.17, z + Math.sin(a) * 0.17],
        dir: axis,
      });
    }
    // brake disc and caliper (inboard)
    b.lathe([[0.1, -0.01], [0.3, -0.01], [0.3, 0.01], [0.1, 0.01]], {
      at: [cx - s * 0.12, 0.55, z], axis, segments: 12, color: P.rim, bone: j,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.12, 0.09), P.warnRed, {
      bone: j, at: [cx - s * 0.12, 0.55 + 0.27, z],
    });
    // fender: arch cap, armour lip, hazard trim
    const fx = s * 1.2;
    b.part(new THREE.BoxGeometry(0.5, 0.1, 1.3), armorPaint, { bone: J.body, at: [fx, 1.2, z] });
    for (const dz of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.5, 0.1, 0.4), armorPaint, {
        bone: J.body, at: [fx, 1.08, z + dz * 0.6], rotation: [dz * 35, 0, 0],
      });
    }
    b.part(new THREE.BoxGeometry(0.06, 0.2, 1.4), armorPaint, { bone: J.body, at: [fx + s * 0.25, 1.1, z] });
    b.part(new THREE.BoxGeometry(0.52, 0.04, 1.3), "#ffffff", {
      bone: J.body, at: [fx, 1.27, z], texture: hazard, color: P.trim,
    });
    // suspension: leaf/arm to chassis, shock + coil
    const inner = s * 1.0;
    b.rod([s * 1.3, 0.85, z - 0.25], [cx - s * 0.15, 0.55, z], 0.045, P.hullDark, { bone: J.body });
    b.rod([s * 1.3, 0.75, z + 0.25], [cx - s * 0.15, 0.55, z], 0.045, P.hullDark, { bone: J.body });
    b.rod([inner, 0.62, z + 0.3], [s * 1.28, 1.2, z + 0.3], 0.05, P.metalDark, { bone: J.body });
    b.sweep(
      (() => {
        const pts: number[][] = [];
        for (let i = 0; i <= 24; i++) {
          const t = i / 24, a = t * Math.PI * 2 * 5;
          pts.push([inner + (s * 1.28 - inner) * t + Math.cos(a) * 0.07, 0.7 + 0.45 * t, z + 0.3 + Math.sin(a) * 0.07]);
        }
        return pts;
      })(),
      0.012,
      { color: P.emberOrange, bone: J.body, sides: 4 },
    );
    // axle stub
    b.rod([s * 0.5, 0.55, z], [cx - s * 0.1, 0.55, z], 0.07, P.hullDark, { bone: J.body });
  }
  // differentials and axle beams
  for (const z of [2.7, -1, -2.8]) {
    b.rod([-1.1, 0.55, z], [1.1, 0.55, z], 0.06, P.metalDark, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.hullDark, { bone: J.body, at: [0, 0.55, z] });
  }
}
```

<!-- call: cargoBay -->

```ts
import * as THREE from "three";
import { paint, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCargoBay({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(5);
  const hullPaint = panelled(P.hull, { size: 0.5, aspect: 0.8, rivets: 0.12 });
  const darkPaint = panelled(P.hullDark, { size: 0.4, rivets: 0.1 });
  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...opts });

  // main container walls
  box(2.6, 1.2, 4.3, hullPaint, [0, 2.1, -1.5]);
  // base plinth
  box(2.8, 0.1, 4.5, darkPaint, [0, 1.55, -1.7]);
  // front wall armor
  box(2.7, 1.3, 0.12, darkPaint, [0, 2.15, 0.5]);
  // slanted roof plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(1.5, 0.08, 4.2), hullPaint, {
      bone: body, at: [s * 0.65, 2.78, -1.5], rotation: [0, 0, -s * 8],
    });
  }
  box(0.3, 0.1, 4.2, darkPaint, [0, 2.85, -1.5]);

  // solar panel
  const solar = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0d2a4a"/>
    ${[...Array(7)].map((_, i) => `<path d="M${(i + 1) * 8} 0V32" stroke="#4fa3d9" stroke-width="1"/>`).join("")}
    <path d="M0 16H64" stroke="#4fa3d9" stroke-width="1"/><rect width="64" height="32" fill="none" stroke="#9ab" stroke-width="2"/></svg>`);
  b.part(new THREE.PlaneGeometry(1.0, 1.6), "#ffffff", {
    bone: body, at: [0.7, 2.9, -2.3], rotation: [-90, 0, 0], texture: solar,
  });

  // vents on the roof
  for (let i = 0; i < 3; i++) {
    box(0.4, 0.06, 0.3, P.metalDark, [-0.7, 2.9, -0.2 - i * 0.5]);
    for (let k = 0; k < 3; k++) box(0.36, 0.02, 0.03, P.hullLight, [-0.7, 2.94, -0.3 - i * 0.5 + k * 0.08]);
  }

  // hazard trim
  const hazard = svg(`<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#e7b814"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${i * 8} 8L${i * 8 + 4} 0H${i * 8 + 8}L${i * 8 + 4} 8Z" fill="#111"/>`).join("")}</svg>`);
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(4.2, 0.14), "#ffffff", {
      bone: body, at: [s * 1.311, 1.72, -1.5], dir: [s, 0, 0], axis: "z", texture: hazard,
    });
    box(0.06, 0.05, 4.3, P.trim, [s * 1.3, 2.72, -1.5]);
    // neon strips
    glow(box(0.04, 0.05, 3.8, P.neonMagenta, [s * 1.32, 2.5, -1.5]), 1.5);
    glow(box(0.04, 0.05, 3.8, P.neonMagenta, [s * 1.32, 1.95, -1.5]), 1.5);
    // ribs
    for (let i = 0; i < 6; i++) box(0.1, 1.15, 0.12, P.hullLight, [s * 1.32, 2.1, -3.4 + i * 0.75]);
  }

  // kanji / warning decal
  const logo = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="none"/>
    <path d="M32 6L60 56H4Z" fill="#d12a2a" stroke="#111" stroke-width="3"/>
    <rect x="29" y="22" width="6" height="18" fill="#111"/><rect x="29" y="45" width="6" height="6" fill="#111"/></svg>`);
  const kanji = svg(`<svg viewBox="0 0 96 48"><text x="4" y="38" font-size="38" font-weight="bold" fill="#e7b814" font-family="sans-serif">猟犬77</text></svg>`);
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: body, at: [0.8, 2.3, -3.66], dir: [0, 0, -1], axis: "z", texture: logo });
  b.part(new THREE.PlaneGeometry(1.0, 0.5), "#ffffff", { bone: body, at: [-0.4, 2.3, -3.66], dir: [0, 0, -1], axis: "z", texture: kanji });
  // rear wall face
  box(2.7, 1.2, 0.1, darkPaint, [0, 2.1, -3.62]);
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: body, at: [-1.0, 2.3, 0.57], dir: [0, 0, 1], axis: "z", texture: logo });

  // tail lights
  for (const s of [1, -1]) {
    glow(box(0.25, 0.14, 0.06, P.warnRed, [s * 1.1, 1.85, -3.7]), 2);
    box(0.3, 0.2, 0.04, P.metalDark, [s * 1.1, 1.85, -3.675]);
  }

  // missile rack on roof
  box(2.0, 0.08, 1.6, P.hullDark, [0, 3.0 - 0.04, -0.6 - 0.0]);
  for (const s of [1, -1]) for (let r = 0; r < 4; r++) {
    const x = s * 0.45, y = 2.97, z = -0.05 - r * 0.0;
    void z;
    const zc = -0.6;
    const xx = x * (r < 2 ? 1 : 2.0) * 0 + s * (r % 2 ? 0.8 : 0.3);
    const yy = y + 0.12 + (r >= 2 ? 0.2 : 0);
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), P.olive, { bone: body, at: [xx, yy, zc], rotation: [90, 0, 0] });
    b.part(new THREE.ConeGeometry(0.1, 0.25, 8), P.emberOrange, { bone: body, at: [xx, yy, zc + 0.87], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.06, 8), P.warnRed, { bone: body, at: [xx, yy, zc + 0.3], rotation: [90, 0, 0] });
    for (const f of [0, 90]) b.part(new THREE.BoxGeometry(0.02, 0.2, 0.15), P.hullLight, { bone: body, at: [xx, yy, zc - 0.65], rotation: [0, 0, f] });
  }
  box(0.08, 0.3, 1.5, P.hullDark, [0.55, 3.1, -0.6]);

  // antennas
  for (const [x, z, h] of [[-1.2, -3.5, 1.2], [1.2, -3.3, 0.8]]) {
    b.rod([x, 2.7, z], [x, 2.7 + h, z], 0.015, P.metalDark, { bone: body });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [x, 2.7 + h, z] });
  }

  // stowed barrels and crates along sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 2; i++) {
      b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 8), i ? P.olive : P.warnRed, { bone: body, at: [s * 1.5, 1.8, -2.6 + i * 0.4 - 0.9 * (s > 0 ? 0 : 1)] });
      b.part(new THREE.TorusGeometry(0.17, 0.015, 4, 8), P.metalDark, { bone: body, at: [s * 1.5, 1.95, -2.6 + i * 0.4 - 0.9 * (s > 0 ? 0 : 1)], rotation: [90, 0, 0] });
    }
    box(0.3, 0.3, 0.5, P.olive, [s * 1.5, 1.7, -0.9 + R() * 0.1]);
    box(0.32, 0.04, 0.52, P.trim, [s * 1.5, 1.87, -0.9]);
  }

  // rear ramp on rampHinge
  const grip = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#2a2d33"/>
    ${[...Array(8)].map((_, i) => `<path d="M0 ${i * 4 + 2}H32" stroke="#5a6475" stroke-width="1.5"/>`).join("")}</svg>`);
  const ramp = b.part(new THREE.BoxGeometry(2.4, 0.08, 1.1), "#ffffff", {
    bone: J.rampHinge, at: [0, 1.55, -4.55], texture: grip,
  });
  void ramp;
  box(2.5, 0.06, 0.06, P.trim, [0, 1.6, -5.1], { bone: J.rampHinge });
  for (const s of [1, -1]) box(0.06, 0.12, 1.1, P.hullLight, [s * 1.2, 1.6, -4.55], { bone: J.rampHinge });
  glow(box(2.0, 0.04, 0.04, P.neonMagenta, [0, 2.7, -3.68]), 1.5);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...extra });

  const PLATE = panelled(metal("iron"), { size: 0.4, rivets: 0.08 });
  const HAZ = paint((p, _n) => {
    const k = Math.floor((p.z + p.x) / 0.18);
    return k % 2 ? P.trim : P.hullDark;
  });
  const GRIME = paint((p, n) => {
    const c = mix(P.hullDark, P.hull, noise(p, 0.25, 4));
    return mix(c, "#1a1612", smoothstep(0.2, -0.8, n.y) * 0.5);
  });

  const stencil = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#e7b814"/><text x="6" y="24" font-family="monospace" font-weight="bold" font-size="22" fill="#111">W-77 警告</text></svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 6 L60 56 H4Z" fill="#e7b814" stroke="#111" stroke-width="4"/><rect x="29" y="22" width="6" height="20" fill="#111"/><rect x="29" y="46" width="6" height="6" fill="#111"/></svg>`,
    { size: 128 },
  );

  // ladder rails
  for (const s of [1, -1]) {
    box(0.16, 0.34, 7.6, GRIME, [s * 0.62, 1.2, 0]);
    box(0.2, 0.06, 7.6, P.hullLight, [s * 0.62, 1.4, 0]);
    box(0.2, 0.06, 7.6, P.hullDark, [s * 0.62, 1.0, 0]);
  }
  // deck plate
  box(2.5, 0.08, 7.8, PLATE, [0, 1.46, 0]);
  // bottom armor plate
  box(1.0, 0.06, 6.4, PLATE, [0, 0.62, -0.2]);
  for (const s of [1, -1]) box(0.08, 0.3, 6.4, GRIME, [s * 0.5, 0.78, -0.2], { rotation: [0, 0, s * 20] });

  // crossmembers
  for (let i = 0; i < 12; i++) {
    const z = -3.6 + i * 0.66;
    box(1.2, 0.14, 0.12, P.hullDark, [0, 1.1, z]);
    box(1.0, 0.05, 0.06, P.hullLight, [0, 1.19, z]);
  }
  // axles, diffs, driveshafts
  const axles = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  axles.forEach((z, i) => {
    cyl(0.07, 0.07, 2.4, 8, P.metalDark, [0, 0.55, z], { rotation: [0, 0, 90] });
    const d = b.part(new THREE.SphereGeometry(0.26, 8, 6), P.hullLight, { bone, at: [0, 0.55, z], scale: [1, 0.85, 0.9] });
    box(0.3, 0.12, 0.3, P.hullDark, [0, 0.8, z]);
    for (const s of [1, -1]) {
      cyl(0.09, 0.09, 0.3, 8, P.rim, [s * 1.1, 0.55, z], { rotation: [0, 0, 90] });
      box(0.1, 0.1, 0.5, P.hullDark, [s * 0.9, 0.9, z]);
    }
    if (i < 2) {
      const z2 = axles[i + 1];
      cyl(0.06, 0.06, Math.abs(z - z2) - 0.5, 8, P.metalDark, [0, 0.75, (z + z2) / 2], { rotation: [90, 0, 0] });
      for (const zz of [(z + z2) / 2 - 0.5, (z + z2) / 2 + 0.5])
        cyl(0.09, 0.09, 0.08, 8, P.trim, [0, 0.75, zz], { rotation: [90, 0, 0] });
    }
  });
  // transfer case + engine pan
  box(0.9, 0.35, 1.4, P.hullDark, [0, 0.9, 2.9]);
  for (let i = 0; i < 4; i++) box(0.92, 0.04, 0.05, P.warnRed, [0, 1.02, 2.4 + i * 0.3]);

  // fuel tanks & exhaust
  for (const s of [1, -1]) {
    const z0 = s > 0 ? -0.3 : 0.1;
    cyl(0.28, 0.28, 1.5, 10, GRIME, [s * 1.0, 0.95, z0], { rotation: [90, 0, 0] });
    for (const dz of [-0.55, 0.55]) box(0.06, 0.62, 0.08, P.trim, [s * 1.0, 0.95, z0 + dz]);
    for (const dz of [-0.78, 0.78]) b.part(new THREE.SphereGeometry(0.28, 8, 4), GRIME, { bone, at: [s * 1.0, 0.95, z0 + dz], scale: [1, 1, 0.3] });
    cyl(0.05, 0.05, 0.14, 6, P.warnRed, [s * 1.0, 1.27, z0 + 0.3]);
  }
  for (const s of [1, -1]) {
    // exhaust stacks on the right side
    if (s < 0) {
      cyl(0.07, 0.07, 2.4, 8, P.metalDark, [-0.78, 0.7, 1.2], { rotation: [90, 0, 0] });
      cyl(0.1, 0.1, 0.5, 8, P.emberOrange, [-0.78, 0.7, 2.45], { rotation: [90, 0, 0] });
      cyl(0.08, 0.09, 0.2, 8, P.metalDark, [-0.78, 0.7, 2.7], { rotation: [90, 0, 0] });
    }
  }

  // side skirts + neon
  for (const s of [1, -1]) {
    for (const [z0, len] of [[1.9, 1.2], [-1.0, 1.0], [-2.9, 1.2]] as number[][] ) void z0, void len;
    for (const [z0, len] of [[-3.3, 1.0], [-1.9, 1.1], [0.6, 2.8]] as number[][]) {
      box(0.1, 0.42, len, HAZ, [s * 1.27, 0.95, z0]);
      box(0.12, 0.05, len, P.hullLight, [s * 1.28, 1.18, z0]);
      glow(box(0.04, 0.05, len * 0.9, P.neonCyan, [s * 1.34, 0.9, z0]), 1.6);
      glow(box(0.04, 0.03, len * 0.9, P.neonCyan, [s * 1.34, 0.78, z0]), 1.2);
    }
    b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { bone, at: [s * 1.335, 1.05, 0.6], dir: [s, 0, 0], axis: "z", texture: stencil });
    b.part(new THREE.PlaneGeometry(0.25, 0.25), "#ffffff", { bone, at: [s * 1.335, 1.05, -1.9], dir: [s, 0, 0], axis: "z", texture: warn });
    // mud flaps
    for (const z of axles.slice(1)) {
      box(0.05, 0.4, 0.6, P.rubber, [s * 1.3, 0.55, z - 0.7]);
      box(0.06, 0.06, 0.62, P.trim, [s * 1.3, 0.74, z - 0.7]);
    }
  }

  // front bumper block & tow hooks
  box(2.4, 0.32, 0.3, HAZ, [0, 0.7, 3.95]);
  box(2.2, 0.12, 0.2, P.hullDark, [0, 0.5, 3.9]);
  for (const s of [1, -1]) {
    for (const z of [3.95, -3.95]) {
      box(0.1, 0.1, 0.3, P.metalDark, [s * 0.5, 0.95, z + (z > 0 ? 0.1 : -0.1)]);
      const hook = b.sweep(
        [[s * 0.5, 0.95, z + (z > 0 ? 0.25 : -0.25)], [s * 0.5, 0.95, z + (z > 0 ? 0.4 : -0.4)], [s * 0.5, 0.7, z + (z > 0 ? 0.42 : -0.42)], [s * 0.5, 0.62, z + (z > 0 ? 0.3 : -0.3)]],
        0.035, { bone, color: P.trim, sides: 6 },
      );
      void hook;
    }
    glow(box(0.5, 0.05, 0.04, P.neonMagenta, [s * 0.7, 0.45, 4.02]), 1.4);
  }
  // rear underride bar
  box(2.4, 0.2, 0.16, HAZ, [0, 0.75, -3.95]);
  for (const s of [1, -1]) glow(box(0.2, 0.1, 0.05, P.warnRed, [s * 1.0, 0.75, -4.04]), 1.5);

  // rivets / bolts along rails
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 40; i++) {
    const z = -3.7 + i * 0.19;
    for (const s of [1, -1]) bolts.push(new THREE.SphereGeometry(0.025, 5, 3).translate(s * 0.7, 1.38, z));
  }
  const { mergeGeometries } = require("three/addons/utils/BufferGeometryUtils.js");
  const merged = mergeGeometries(bolts);
  if (merged) b.part(merged, P.rim, { bone, at: [0, 0, 0] });

  // wires/pipes under
  for (const s of [1, -1])
    b.sweep([[s * 0.35, 0.95, 3.6], [s * 0.35, 0.9, 1], [s * 0.4, 0.95, -2], [s * 0.35, 0.95, -3.6]], 0.03, { bone, color: s > 0 ? P.neonCyan : P.neonMagenta, sides: 6 });
  void R; void M;
}
```

<!-- call: cabHood -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCabHood({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(77);
  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...o });

  const hullP = panelled(paint((p: any, n: any) => mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.5 + noise(p, 0.3, 3) * 0.2)), { size: 0.3, rivets: 0.06 });
  const darkP = panelled(P.hullDark, { size: 0.25, rivets: 0.05 });

  const hazard = paint((p: any) => (Math.floor((p.x + p.y) / 0.12) % 2 ? P.trim : P.metalDark));

  // textures
  const hud = svg(`<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#0b1a24"/><path d="M4 8H40M88 8H124M4 24H30M98 24H124" stroke="#2ff3ff" stroke-width="2"/><circle cx="64" cy="16" r="8" fill="none" stroke="#2ff3ff" stroke-width="2"/><path d="M64 4V28M52 16H76" stroke="#ff2fa8" stroke-width="1.5"/><text x="8" y="19" font-size="7" fill="#2ff3ff">77</text></svg>`, { size: 256 });
  const stencil = svg(`<svg viewBox="0 0 96 48"><rect width="96" height="48" fill="none"/><text x="4" y="40" font-size="40" font-weight="bold" font-family="monospace" fill="#e7b814">77</text><text x="64" y="30" font-size="24" fill="#e7b814">猟犬</text></svg>`, { size: 256 });
  const warn = svg(`<svg viewBox="0 0 48 48"><path d="M24 4L46 44H2Z" fill="#e7b814" stroke="#0e0f12" stroke-width="3"/><rect x="22" y="16" width="4" height="16" fill="#0e0f12"/><rect x="22" y="35" width="4" height="4" fill="#0e0f12"/></svg>`, { size: 128 });
  const grille = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0e0f12"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${3 + i * 10}" y="3" width="6" height="18" fill="#ff2fa8"/>`).join("")}</svg>`, { size: 128 });

  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], col = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), col, { bone: body, at, dir, axis: "z", texture: tex });

  // hood wedge: sloped box built via extrude side profile
  const hood = b.extrude([[0, 0], [1.6, 0], [1.6, 0.35], [0.9, 0.62], [0, 0.7]], { at: [-1.1, 1.5, 2.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: hullP, bone: body });
  // recenter: extrude thickness centred on x axis plane => at x=0
  hood.mesh.position.x = 0;
  box(2.4, 0.5, 0.3, darkP, [0, 1.75, 3.85]);
  // vents
  for (let i = 0; i < 5; i++) {
    box(0.5, 0.03, 0.08, P.metalDark, [0, 2.17 - i * 0.045, 3.1 - i * 0.22], { rotation: [-22, 0, 0] });
    for (const s of [1, -1]) box(0.3, 0.03, 0.08, P.metalDark, [s * 0.75, 2.12 - i * 0.04, 3.0 - i * 0.2], { rotation: [-22, 0, 0] });
  }
  glow(box(2.0, 0.3, 0.05, "#ffffff", [0, 1.75, 4.01], {}), 0);
  glow(b.part(new THREE.PlaneGeometry(1.8, 0.4), "#ffffff", { bone: body, at: [0, 1.85, 4.03], dir: [0, 0, 1], axis: "z", texture: grille }), 1.3);

  // plow bumper
  b.extrude([[-1.25, 0], [1.25, 0], [1.1, 0.55], [-1.1, 0.55]], { at: [0, 0.9, 4.0], x: [1, 0, 0], thickness: 0.35, color: hazard, bone: body, bevel: 0.03 });
  box(2.6, 0.12, 0.5, P.hullDark, [0, 0.95, 3.95]);
  for (let i = -3; i <= 3; i++) b.spike([i * 0.35, 0.95, 4.15], [0, 0, 1], 0.28, 0.07, { color: P.metalDark, bone: body });
  b.rod([-1.2, 1.1, 4.2], [-1.2, 1.9, 3.7], 0.06, { color: P.hullDark, bone: body });
  b.rod([1.2, 1.1, 4.2], [1.2, 1.9, 3.7], 0.06, { color: P.hullDark, bone: body });

  // headlights
  for (const s of [1, -1]) {
    glow(box(0.45, 0.16, 0.1, "#ffffff", [s * 0.95, 1.95, 4.0]), 2);
    glow(box(0.3, 0.06, 0.1, P.neonCyan, [s * 0.95, 1.78, 4.02]), 1.5);
    box(0.6, 0.06, 0.14, P.hullDark, [s * 0.95, 2.06, 3.98]);
  }
  decal(warn, 0.25, 0.25, [0.6, 2.05, 4.03], [0, 0, 1]);

  // cab
  b.extrude([[0, 0], [1.9, 0], [1.9, 1.4], [1.35, 1.4], [0, 1.3]], { at: [0, 1.5, 0.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, color: hullP, bone: body, bevel: 0.04 });
  // windshield slope
  b.part(new THREE.BoxGeometry(2.1, 0.32, 0.06), "#0b1a24", { bone: body, at: [0, 2.55, 2.0], rotation: [-35, 0, 0] });
  glow(b.part(new THREE.PlaneGeometry(2.0, 0.3), "#ffffff", { bone: body, at: [0, 2.56, 2.04], rotation: [-35, 0, 0], texture: hud }), 0.9);
  box(2.2, 0.08, 0.1, P.metalDark, [0, 2.75, 1.85], { rotation: [-35, 0, 0] });
  // doors and side slits
  for (const s of [1, -1]) {
    box(0.06, 0.75, 1.0, P.hullLight, [s * 1.27, 2.1, 1.5]);
    box(0.07, 0.12, 0.7, P.glass, [s * 1.28, 2.45, 1.5]);
    box(0.08, 0.03, 0.9, P.trim, [s * 1.28, 1.7, 1.5]);
    box(0.08, 0.3, 0.3, P.olive, [s * 1.28, 2.0, 1.0]);
    box(0.08, 0.2, 0.25, P.metalDark, [s * 1.29, 2.15, 1.95]);
    box(0.04, 0.04, 0.9, P.neonCyan, [s * 1.3, 1.62, 1.5]);
    // mirrors
    b.rod([s * 1.25, 2.4, 2.0], [s * 1.5, 2.45, 2.1], 0.025, { color: P.metalDark, bone: body });
    box(0.1, 0.25, 0.18, P.hullDark, [s * 1.55, 2.45, 2.1]);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: body, at: [s * 1.55, 2.5, 2.2] }), 2);
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", { bone: body, at: [s * 1.285, 1.95, 1.5], dir: [s, 0, 0], axis: "z", texture: stencil });
  }
  // roof
  box(2.3, 0.1, 1.4, P.hullDark, [0, 2.87, 1.3]);
  glow(box(1.9, 0.06, 0.1, P.neonCyan, [0, 2.78, 2.05]), 1.5);
  // light bar
  box(1.8, 0.1, 0.2, P.metalDark, [0, 2.97, 1.95]);
  for (let i = 0; i < 8; i++) glow(box(0.2, 0.08, 0.06, i % 2 ? P.neonMagenta : P.neonCyan, [-0.77 + i * 0.22, 2.98, 2.07]), 2);
  // sensor dome and antennas
  b.part(new THREE.SphereGeometry(0.16, 8, 5, 0, 6.28, 0, 1.57), P.hullLight, { bone: body, at: [0.7, 2.92, 0.9] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone: body, at: [0.7, 3.0, 0.98] }), 2);
  for (const [x, z, h] of [[-1.1, 0.75, 0.9], [1.15, 0.75, 0.6]]) {
    b.rod([x, 2.9, z], [x, 2.9 + h * 0.9, z], 0.012, { color: P.metalDark, bone: body });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: body, at: [x, 2.9 + h * 0.9, z] }), 2);
  }
  // rear wall & grab rails / exhaust stacks
  box(2.5, 1.2, 0.1, P.hullDark, [0, 2.1, 0.65]);
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 1.6, 0.75], [s * 1.1, 2.85, 0.75], 0.07, { color: P.metalDark, bone: body, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.12, 6), P.emberOrange, { bone: body, at: [s * 1.1, 2.9, 0.75] });
  }
  // hood armour plates and rivets
  for (const s of [1, -1]) {
    box(0.1, 0.45, 1.2, P.hullLight, [s * 1.12, 1.95, 3.0], { rotation: [0, 0, s * -8] });
    glow(box(0.04, 0.04, 1.1, P.neonMagenta, [s * 1.18, 1.75, 3.0]), 1.5);
    for (let i = 0; i < 4; i++) b.part(new THREE.SphereGeometry(0.03, 5, 4), P.rim, { bone: body, at: [s * 1.18, 2.0, 2.5 + i * 0.3] });
  }
  void R;
}
```
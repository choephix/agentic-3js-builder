<!-- call: plan -->

```json
{
  "name": "Warhound MX-77",
  "description": "A low-poly cyberpunk armored 6x6 military truck from 2077 with a slanted armored cab, neon-lit chassis, six chunky wheels, a roof-mounted railgun turret and a modular cargo bed with missile pods and antennas.",
  "builderName": "warhoundTruck2077",
  "size": [2.9, 3.1, 8.2],
  "layout": "Long, low, wedge-shaped 6x6 armored truck facing +Z. Front: sloped angular armor nose with a glowing cyan light bar and a winch bumper. Behind it a tall faceted armored cab with a narrow slit windshield (glowing amber), side armor skirts and roof sensor mast. Behind the cab is a long flat cargo deck on a heavy ladder chassis carrying a rear box module with a roof missile rack and a rotating railgun turret on a ring above the cab-rear. Three axles: front at z=2.6, mid at z=-1.2, rear at z=-2.9. Chunky wheels (radius 0.62) with hexagonal hub plates and magenta neon rims sit in wheel arches; wheels touch the floor, the rest of the hull floats at 0.45 m ground clearance. Style: hard facets, hazard-yellow trim stripes, cyan and magenta neon strips along skirts, decals, vents, antennas, panel seams and rivets via the panelled paint; SVG decals for unit emblem, serial number, warning labels and HUD-like screens.",
  "palette": {
    "hull": "#3a4150",
    "hullDark": "#20242e",
    "armorLight": "#5b6676",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "amber": "#ffab1f",
    "glass": "#0e2a3a",
    "rubber": "#15161b",
    "rim": "#8a93a3",
    "metalDark": "#2b2f38",
    "red": "#d6262e",
    "olive": "#4d5a3a",
    "white": "#e9edf2"
  },
  "mounts": {
    "chassisTop": [0, 1.25, 0],
    "cabFloor": [0, 1.25, 2.1],
    "cabRoof": [0, 2.55, 1.6],
    "cargoDeck": [0, 1.35, -2.0],
    "cargoBoxFront": [0, 1.35, -0.6],
    "turretRing": [0, 2.55, -0.2],
    "axleFront": [0, 0.62, 2.6],
    "axleMid": [0, 0.62, -1.2],
    "axleRear": [0, 0.62, -2.9],
    "bumperFront": [0, 0.8, 4.0],
    "rearBumper": [0, 0.8, -4.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.25, 2.1], "dir": [0, 0, 1], "role": "hinge", "group": "cab" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.55, -0.2], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.0, -0.2], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.25, 0.62, 2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.25, 0.62, 2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.25, 0.62, -1.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.25, 0.62, -1.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.25, 0.62, -2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.25, 0.62, -2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "rampHinge", "parent": "body", "at": [0, 1.45, -4.0], "dir": [1, 0, 0], "role": "hinge", "group": "cargo" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "The ladder frame and underbody between y=0.45 and 1.35 spanning the whole length: two heavy side rails, cross members, differential housings and driveshafts at each axle, fuel tanks and battery boxes on the sides, side skirts with cyan neon strips, hazard-yellow trim stripes, and wheel arch fenders (open to the wheels) with panelled iron paint. Includes the front armored bumper with winch drum, tow hooks, cyan light bar and amber fog lights, the sloped armored nose/hood in front of the cab (to z=4.1), the rear bumper with red tail lights and a hitch, mud flaps, exhaust stacks with glowing orange tips behind the cab, and underbody details (pipes, cables, vents). Painted metal with the clockwork-style panelled and metal paints for scuffs and verdigris-free soot near exhausts.",
      "box": [[-1.45, 0.45, -4.1], [1.45, 1.4, 4.1]],
      "attaches": "Rides joint body. Top surface at chassisTop meets the cab at cabFloor and the cargo module at cargoDeck. Axle lines axleFront, axleMid and axleRear pass through its arches where the wheels attach. Front bumper at bumperFront, rear bumper at rearBumper.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "cab",
      "builds": "The armored crew cab from y=1.25 to 2.55, z from 1.0 to 3.4: a faceted wedge of sloped armor plates with a narrow glowing amber slit windshield and side slit windows (glass colour with amber glow), spaced armor add-on plates with bolts, hinged doors with handles and tiny unit emblem decals, side mirrors with camera pods, roof sensor mast with a spinning radar dish, antennas, a roof light bar, a HUD-screen decal visible through the windshield, vents and grille intakes with cyan glow, hazard stripes, serial number SVG text on the doors, and a roof hatch ring.",
      "box": [[-1.35, 1.25, 1.0], [1.35, 2.7, 3.5]],
      "attaches": "Sits on chassis at cabFloor (y=1.25), rides joint cab (child of body). Its roof at cabRoof carries sensors; rear wall abuts cargo module near z=1.0.",
      "joints": ["cab", "body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "wheels",
      "builds": "Six chunky off-road wheels (radius 0.62, width 0.5) at axleFront, axleMid and axleRear on x=±1.25: low-poly octagon-faceted rubber tires with painted tread blocks, deep sidewalls, hexagonal armored hub plates in rim colour, magenta neon ring inserts, lug nuts, central caps with an emblem decal, brake discs and calipers visible through hubs, and short half-shaft stubs reaching in toward the chassis. Each wheel is its own joint group (wheelFL, wheelFR, wheelML, wheelMR, wheelRL, wheelRR), spun about its X axle. Front wheels have steering knuckle rods and tie rods; rear tandem has leaf-spring packs and shock absorbers with glowing yellow springs up to the chassis.",
      "box": [[-1.55, 0, -3.55], [1.55, 1.25, 3.25]],
      "attaches": "Each wheel centre at axle mounts with x=±1.25; wheel joints are children of body. Shocks and springs end at chassis rail underside y≈0.9.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "The roof-mounted railgun turret centred on turretRing (0,2.55,-0.2): a slewing ring with teeth and ring lights, a faceted armored turret body (y 2.55 to 3.4) with sloped plates, hazard trim, a glowing cyan targeting sensor eye with SVG reticle decal, ammo drum and feed belt, a gunner shield, side missile launchers, and a long twin-rail railgun barrel pointing +Z mounted on gunPitch with glowing cyan capacitor coils (coil-style sweeps), muzzle brake, heat vents glowing orange and a coaxial antenna cluster at the back. Includes a small warning-label decal and unit number.",
      "box": [[-0.85, 2.55, -1.2], [0.85, 3.1, 2.2]],
      "attaches": "Base ring sits on cargo module/cab junction roof at turretRing, rides turretYaw (child of body); barrel and cradle ride gunPitch.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cargo",
      "builds": "The rear cargo module from z=-4.0 to z=1.0, y=1.35 to 2.55: a boxy armored container with panelled paint, rivets and weld seams, side access hatches with handles, a rear drop ramp (joint rampHinge) with hazard stripes and hydraulic pistons, a roof deck with a retractable missile rack (six cylindrical pods with red caps), side-mounted drone launcher bays with glowing screens, stowage racks with jerry cans and ammo crates, a roof-top antenna array with a satellite dish, glowing magenta neon edge strips, emblem and serial-number SVG decals, cable conduits, warning stripes, and vents with amber glow. Open flat deck section at the front with tie-down rings and a mounted comms console with a screen decal.",
      "box": [[-1.45, 1.35, -4.1], [1.45, 2.9, 1.0]],
      "attaches": "Sits on chassis at cargoDeck (y=1.35); its front wall abuts the cab rear at z=1.0 (cargoBoxFront at z=-0.6 is the box's roof-step); turret base ring is mounted on its roof at turretRing; rear ramp hinges at rampHinge.",
      "joints": ["body", "rampHinge"],
      "floor": false,
      "budget": 160
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(77);
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, flat: true, ...o });
  const cyl = (r: number, r2: number, l: number, seg: number, c: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r2, l, seg), c, { bone: body, at, dir, flat: true, ...o });

  const IRON = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.06 });
  const HULL = panelled(P.hull, { size: 0.3, rivets: 0.07 });
  const SOOT = paint((p: any, n: any) => mix(P.metalDark, "#0a0a0c", smoothstep(0.4, 0.8, noise(p, 0.15, 3)) * 0.8));

  // side rails
  for (const s of [1, -1]) {
    box(0.16, 0.34, 7.8, IRON, [s * 0.62, 0.95, 0]);
    box(0.3, 0.06, 7.8, P.metalDark, [s * 0.62, 1.14, 0]);
    // skirts
    box(0.1, 0.4, 5.0, HULL, [s * 1.38, 0.78, -0.1]);
    box(0.04, 0.05, 4.9, P.neonCyan, [s * 1.44, 0.6, -0.1]);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 4.9), P.neonCyan, { bone: body, at: [s * 1.44, 0.6, -0.1] }), 1.4);
    for (let i = 0; i < 7; i++) box(0.045, 0.1, 0.32, P.trim, [s * 1.44, 0.94, -2.1 + i * 0.7]);
    // fuel tank + battery
    cyl(0.28, 0.28, 1.5, 8, P.armorLight, [s * 1.0, 0.72, -0.2], [0, 0, 1]);
    box(0.4, 0.3, 0.7, P.olive, [s * 1.05, 0.75, 1.35]);
    for (const z of [-0.9, 0.5]) box(0.05, 0.08, 0.1, P.trim, [s * 1.0, 0.98, z]);
    // fenders over wheels
    for (const z of [2.6, -1.2, -2.9]) {
      box(0.55, 0.1, 1.45, IRON, [s * 1.25, 1.33, z]);
      box(0.08, 0.3, 1.4, IRON, [s * 1.5, 1.2, z], {});
      // mud flaps
      box(0.5, 0.35, 0.05, P.rubber, [s * 1.25, 0.62, z - 0.78]);
    }
    // exhaust stacks
    cyl(0.07, 0.07, 1.1, 8, SOOT, [s * 1.3, 1.9, 1.05], [0, 1, 0]);
    glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 8), "#ff7a1a", { bone: body, at: [s * 1.3, 2.46, 1.05] }), 1.8);
    cyl(0.04, 0.04, 0.6, 6, P.metalDark, [s * 1.3, 1.6, 1.05], [0, 0, 1]);
    // tow hooks
    box(0.1, 0.1, 0.25, P.red, [s * 0.7, 0.75, 4.12]);
    box(0.1, 0.1, 0.25, P.red, [s * 0.7, 0.75, -4.12]);
    // fog lights
    glow(b.part(new THREE.BoxGeometry(0.2, 0.14, 0.06), P.amber, { bone: body, at: [s * 1.05, 0.75, 4.1] }), 1.5);
    // tail lights
    glow(b.part(new THREE.BoxGeometry(0.3, 0.16, 0.06), P.red, { bone: body, at: [s * 1.05, 0.95, -4.12] }), 1.5);
  }
  // cross members
  for (let i = 0; i < 9; i++) box(1.3, 0.14, 0.14, P.metalDark, [0, 0.98, -3.6 + i * 0.9]);
  // diffs and driveshafts
  for (const z of [2.6, -1.2, -2.9]) {
    cyl(0.5, 0.5, 2.5, 8, P.metalDark, [0, 0.62, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.3, 8, 6), P.armorLight, { bone: body, at: [0, 0.62, z], flat: true });
  }
  for (const z of [0.7, -2.05]) cyl(0.07, 0.07, 3.0 * 0.6 + 0.2, 8, P.rim, [0, 0.8, z + 0.0], [0, 0, 1], { });
  // pipes and cables
  for (let i = 0; i < 4; i++) cyl(0.03, 0.03, 6, 6, i % 2 ? P.red : P.neonMagenta, [-0.35 + i * 0.23, 0.58, 0], [0, 0, 1]);
  // underbody vents
  for (let i = 0; i < 5; i++) box(0.5, 0.03, 0.08, P.hullDark, [0, 0.5, 0.3 + i * 0.15]);

  // sloped nose / hood
  b.frustumBox([0, 1.0, 3.3], [0, 1.0, 4.1], [2.7, 0.9], [2.3, 0.5], { bone: body, color: HULL });
  box(2.5, 0.12, 0.9, IRON, [0, 1.42, 3.6], { rotation: [-14, 0, 0] });
  for (let i = 0; i < 6; i++) box(0.05, 0.14, 0.04, P.trim, [-0.5 + i * 0.2, 1.3, 4.12], { rotation: [0, 0, 30] });
  // front bumper
  box(2.9, 0.4, 0.3, IRON, [0, 0.8, 4.0]);
  box(2.9, 0.08, 0.32, P.trim, [0, 0.58, 4.0]);
  glow(b.part(new THREE.BoxGeometry(2.2, 0.08, 0.06), P.neonCyan, { bone: body, at: [0, 0.98, 4.17] }), 1.6);
  cyl(0.14, 0.14, 0.9, 8, P.metalDark, [0, 0.8, 4.2], [1, 0, 0]);
  cyl(0.15, 0.15, 0.05, 8, P.trim, [0.47, 0.8, 4.2], [1, 0, 0]);
  cyl(0.15, 0.15, 0.05, 8, P.trim, [-0.47, 0.8, 4.2], [1, 0, 0]);
  // grille vents on nose
  for (let i = 0; i < 4; i++) glow(b.part(new THREE.BoxGeometry(0.7, 0.04, 0.03), P.neonCyan, { bone: body, at: [0, 1.15 + i * 0.07, 4.05 - i * 0.02] }), 0.9);

  // rear bumper
  box(2.9, 0.4, 0.3, IRON, [0, 0.8, -4.0]);
  box(2.9, 0.08, 0.32, P.trim, [0, 0.58, -4.0]);
  cyl(0.08, 0.08, 0.4, 8, P.metalDark, [0, 0.8, -4.3], [0, 0, 1]);
  cyl(0.14, 0.14, 0.1, 8, P.rim, [0, 0.8, -4.5], [0, 0, 1]);

  // plate decal
  const plate = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#e9edf2"/><rect x="2" y="2" width="60" height="20" fill="none" stroke="#20242e" stroke-width="2"/><text x="32" y="18" text-anchor="middle" font-size="15" font-weight="bold" fill="#20242e" font-family="monospace">MX-77</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.6, 0.22), "#ffffff", { bone: body, at: [0, 0.82, -4.17], dir: [0, 0, -1], axis: "z", texture: plate });
  const warn = svg(`<svg viewBox="0 0 32 32"><path d="M16 3L30 29H2Z" fill="#e7b814" stroke="#20242e" stroke-width="2"/><rect x="14.5" y="12" width="3" height="9" fill="#20242e"/><rect x="14.5" y="23" width="3" height="3" fill="#20242e"/></svg>`, { size: 96 });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", { bone: body, at: [s * 1.435, 0.8, 1.4], dir: [s, 0, 0], axis: "z", texture: warn });
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildWheels({ b, J, P }: Ctx) {
  const R = 0.62;
  const W = 0.5;
  const rand = rng(77);
  const YELLOW = "#ffd21f";
  const BRAKE = "#b9b0a0";

  const tireTex = paint((p, n) => {
    const base = mix("#15161b", "#25262d", noise(p, 0.12, 3));
    return mix(base, "#0a0a0d", 0.3 * smoothstep(0.3, -0.8, n.y));
  });
  const hubPaint = panelled(metal("steel", { tarnish: 0.3 }), { size: 0.12, rivets: 0.04 });
  const frameMetal = metal("iron", { tarnish: 0.5 });

  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#20242e" stroke="#ff2fb4" stroke-width="4"/>
    <path d="M32 10 L50 44 L32 36 L14 44Z" fill="#e7b814"/><circle cx="32" cy="30" r="5" fill="#2ff3ff"/>
    <path d="M18 52 H46" stroke="#e9edf2" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const discTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#9aa0aa"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#555" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="32" cy="32" r="8" fill="#444"/></svg>`,
    { size: 128 },
  );

  // axis helper: cylinder geometry has axis Y; we aim it along X with dir
  const AX: [number, number, number] = [1, 0, 0];

  const wheels: [string, number, number, number][] = [
    ["wheelFL", 1, 2.6, 1],
    ["wheelFR", -1, 2.6, 1],
    ["wheelML", 1, -1.2, 0],
    ["wheelMR", -1, -1.2, 0],
    ["wheelRL", 1, -2.9, 0],
    ["wheelRR", -1, -2.9, 0],
  ];

  for (const [name, s, z, front] of wheels) {
    const j = J[name];
    const cx = s * 1.25;
    const cy = 0.62;
    const at = (x: number, y: number, zz: number): [number, number, number] => [cx + s * x, cy + y, z + zz];
    const cyl = (rt: number, rb: number, h: number, seg: number, color: any, x: number, extra: any = {}) =>
      b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: j, at: at(x, 0, 0), dir: AX, flat: true, ...extra });

    // tire: octagon-faceted, tapered shoulders
    cyl(R, R, W * 0.7, 10, tireTex, 0, { rotation: [0, 18, 0] });
    cyl(R * 0.9, R, W * 0.15, 10, tireTex, W * 0.425, { rotation: [0, 18, 0] });
    cyl(R * 0.9, R, W * 0.15, 10, tireTex, -W * 0.425, { rotation: [0, 18, 0] });
    // tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const y = Math.cos(a) * (R + 0.02);
      const zz = Math.sin(a) * (R + 0.02);
      b.part(new THREE.BoxGeometry(W * 0.62, 0.07, 0.15), P.rubber, {
        bone: j,
        at: at(0, y, zz),
        rotation: [(-a * 180) / Math.PI, 0, 0],
        flat: true,
      });
    }
    // sidewall rims & outer hub
    const out = s * 1; // outward sign handled by at()
    void out;
    cyl(R * 0.62, R * 0.62, 0.05, 6, P.metalDark, W * 0.5);
    b.part(new THREE.CylinderGeometry(R * 0.6, R * 0.6, 0.07, 6), hubPaint, {
      bone: j, at: at(W * 0.5 + 0.04, 0, 0), dir: AX, flat: true,
    });
    // magenta neon ring
    glow(
      b.part(new THREE.TorusGeometry(R * 0.66, 0.025, 4, 12), P.neonMagenta, {
        bone: j, at: at(W * 0.5 + 0.01, 0, 0), dir: AX, axis: "z",
      }),
      1.6,
    );
    // inner armored plate (other side)
    cyl(R * 0.58, R * 0.58, 0.06, 6, P.rim, -W * 0.5);
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.hullDark, {
        bone: j, at: at(W * 0.5 + 0.1, Math.cos(a) * 0.3, Math.sin(a) * 0.3), dir: AX, flat: true,
      });
    }
    // center cap with emblem
    cyl(0.14, 0.17, 0.08, 8, P.metalDark, W * 0.5 + 0.1);
    b.part(new THREE.CircleGeometry(0.12, 12), "#ffffff", {
      bone: j, at: at(W * 0.5 + 0.145, 0, 0), dir: [s, 0, 0], axis: "z", texture: emblem,
    });
    // brake disc + caliper, inboard
    b.part(new THREE.CircleGeometry(0.33, 14), "#ffffff", {
      bone: j, at: at(-W * 0.5 - 0.005, 0, 0), dir: [-s, 0, 0], axis: "z", texture: discTex,
    });
    cyl(0.34, 0.34, 0.03, 12, BRAKE, -W * 0.5 + 0.02);
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.18), P.red, {
      bone: j, at: at(-W * 0.5 - 0.06, 0, 0.3), flat: true,
    });
    // half-shaft stub
    cyl(0.07, 0.07, 0.4, 8, frameMetal, -W * 0.5 - 0.2);
    cyl(0.1, 0.1, 0.08, 8, P.metalDark, -W * 0.5 - 0.42);

    // suspension (on body so wheels spin freely)
    const body = J.body;
    const ix = s * 0.95;
    if (front) {
      // steering knuckle + tie rod
      b.rod([cx - s * 0.32, cy + 0.2, z], [cx - s * 0.32, cy - 0.15, z], 0.045, P.metalDark, { bone: body });
      b.rod([cx - s * 0.32, cy + 0.12, z + 0.2], [s * 0.35, cy + 0.12, z + 0.2], 0.03, frameMetal, { bone: body });
      b.rod([cx - s * 0.3, 0.9, z - 0.15], [ix, 0.95, z - 0.15], 0.05, P.hullDark, { bone: body });
      b.rod([cx - s * 0.3, 0.45, z - 0.2], [ix, 0.55, z - 0.2], 0.045, P.hullDark, { bone: body });
    }
    // shock absorber with glowing spring
    const sx = s * 0.98;
    const sz = z + (front ? 0.45 : 0.4);
    b.rod([sx, 0.5, sz], [sx, 0.9, sz], 0.035, P.metalDark, { bone: body });
    const spring = b.sweep(
      (function () {
        const pts: number[][] = [];
        for (let i = 0; i <= 24; i++) {
          const a = i * 1.1;
          pts.push([sx + Math.cos(a) * 0.075, 0.55 + (i / 24) * 0.32, sz + Math.sin(a) * 0.075]);
        }
        return pts;
      })(),
      0.014,
      { bone: body, color: YELLOW, sides: 4, skin: "rigid" },
    );
    glow(spring, 1.2);
    b.part(new THREE.BoxGeometry(0.16, 0.05, 0.12), P.hullDark, { bone: body, at: [sx, 0.9, sz], flat: true });
  }

  // axle beams & differential housings
  for (const z of [2.6, -1.2, -2.9]) {
    b.rod([-1.0, 0.62, z], [1.0, 0.62, z], 0.075, P.metalDark, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), frameMetal, { bone: J.body, at: [0, 0.62, z], flat: true });
  }

  // rear tandem leaf springs
  for (const s of [1, -1]) {
    const x = s * 0.9;
    for (let k = 0; k < 4; k++) {
      const len = 1.9 - k * 0.35;
      b.part(new THREE.BoxGeometry(0.16, 0.035, len), k % 2 ? P.metalDark : P.hullDark, {
        bone: J.body, at: [x, 0.78 - k * 0.04 + 0.05, -2.05], flat: true,
      });
    }
    b.part(new THREE.BoxGeometry(0.2, 0.08, 0.2), P.trim, { bone: J.body, at: [x, 0.86, -2.05], flat: true });
    // U-bolts
    for (const z of [-1.2, -2.9]) {
      b.part(new THREE.TorusGeometry(0.07, 0.012, 4, 8), P.rim, {
        bone: J.body, at: [x, 0.7, z], dir: [0, 0, 1], axis: "z",
      });
    }
  }
  // mid axle drive pipe accents
  void rand;
}
```

<!-- call: cargo -->

```ts
import * as THREE from "three";
import { paint, svg, rng, frame, panelled, mottle } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled as panelledK, INK } from "agentic-3js-builder/kits/clockwork";

export function buildCargo({ b, J, P, M }: any) {
  const body = J.body;
  const ramp = J.rampHinge;
  const R = rng(77);

  const HULL = panelledK(P.hull, { size: 0.5, aspect: 0.7, rivets: 0.09 });
  const DARK = panelledK(P.hullDark, { size: 0.4, rivets: 0.08 });
  const ARMOR = panelledK(P.armorLight, { size: 0.45, rivets: 0.1 });
  const GRIME = paint((p, n) => {
    const t = Math.max(0, Math.min(1, 0.55 + 0.45 * n.y));
    return n.y < 0.4 && p.y < 1.8 ? "#1c1f27" : P.olive;
  });
  const OLIVE = panelledK(P.olive, { size: 0.5, rivets: 0.1 });
  const STEEL = metal("steel");

  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone: body, at, flat: true, ...opts });

  // ---- decals / textures
  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#111"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#14161c" stroke="${P.trim}" stroke-width="4"/><path d="M32 8 L52 44 L12 44Z" fill="none" stroke="${P.neonCyan}" stroke-width="4"/><path d="M20 50 L32 30 L44 50" fill="none" stroke="${P.neonMagenta}" stroke-width="4"/><circle cx="32" cy="36" r="4" fill="${P.red}"/></svg>`,
    { size: 128 },
  );
  const serial = svg(
    `<svg viewBox="0 0 160 40"><rect width="160" height="40" fill="none"/><text x="80" y="29" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="${P.white}">WH-MX77</text><rect x="4" y="34" width="152" height="3" fill="${P.trim}"/></svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 4 L46 43 H2Z" fill="${P.trim}" stroke="#111" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="16" width="4" height="15" fill="#111"/><rect x="22" y="34" width="4" height="4" fill="#111"/></svg>`,
    { size: 96 },
  );
  const screen = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#04161c"/><path d="M0 20 H12 L18 8 L26 32 L32 14 L38 24 H64" fill="none" stroke="${P.neonCyan}" stroke-width="2"/><rect x="4" y="30" width="22" height="3" fill="${P.amber}"/><rect x="4" y="5" width="14" height="2" fill="${P.neonMagenta}"/><circle cx="54" cy="10" r="4" fill="none" stroke="${P.neonCyan}" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );
  const vent = svg(
    `<svg viewBox="0 0 32 24"><rect width="32" height="24" fill="#1a1204"/>${[2, 7, 12, 17].map((y) => `<rect x="3" y="${y}" width="26" height="3" fill="${P.amber}"/>`).join("")}</svg>`,
    { size: 64 },
  );
  const decal = (tex: any, at: number[], dir: number[], w: number, h: number, tint = "#ffffff", g = 0, up: number[] = [0, 1, 0]) => {
    const pl = b.part(new THREE.PlaneGeometry(w, h), tint, { bone: body, at, dir, axis: "z", up, texture: tex });
    if (g) glow(pl, g);
    return pl;
  };

  // ---- main container: z -4.0..-0.4 ; deck forward z -0.4..1.0
  const Z0 = -4.0, Z1 = -0.6, ZC = (Z0 + Z1) / 2, LEN = Z1 - Z0;
  // base floor / deck plate
  box(2.9, 0.1, 5.0, DARK, [0, 1.4, -1.5]);
  // container shell (hull) with chamfered roof
  box(2.8, 1.05, LEN, HULL, [0, 1.98, ZC]);
  // sloped upper chamfers
  for (const s of [1, -1]) {
    b.frustumBox([s * 1.25, 2.5, Z0 + 0.1], [s * 1.25, 2.5, Z1 - 0.1], [0.3, 0.12], [0.3, 0.12], { bone: body, color: ARMOR });
    box(0.12, 0.9, LEN - 0.1, ARMOR, [s * 1.44, 1.95, ZC]);
    // base skirt rail
    box(0.18, 0.12, LEN + 0.1, DARK, [s * 1.4, 1.45, ZC]);
    // neon edge strips
    glow(box(0.05, 0.05, LEN - 0.1, P.neonMagenta, [s * 1.47, 2.5, ZC]), 1.6);
    glow(box(0.05, 0.05, LEN - 0.1, P.neonMagenta, [s * 1.47, 1.52, ZC]), 1.6);
    // vertical edge strips at back
    glow(box(0.05, 0.9, 0.05, P.neonMagenta, [s * 1.47, 1.98, Z0 + 0.04]), 1.4);
    glow(box(0.05, 0.9, 0.05, P.neonMagenta, [s * 1.47, 1.98, Z1 - 0.04]), 1.4);
  }
  // roof deck plate and rails
  box(2.5, 0.08, LEN - 0.3, DARK, [0, 2.54, ZC]);
  for (const s of [1, -1]) box(0.06, 0.1, LEN - 0.3, P.trim, [s * 1.2, 2.6, ZC]);

  // panel ribs / weld seams on sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const z = Z0 + 0.3 + i * ((LEN - 0.6) / 6);
      box(0.06, 0.95, 0.07, P.metalDark, [s * 1.45, 1.98, z]);
    }
    // hazard stripe band
    b.part(new THREE.PlaneGeometry(LEN - 0.4, 0.12), "#ffffff", { bone: body, at: [s * 1.455, 1.55, ZC], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: stripeTex });
    // side hatch
    const hz = ZC + 0.4;
    box(0.06, 0.62, 1.0, P.hullDark, [s * 1.46, 2.0, hz]);
    box(0.04, 0.5, 0.88, P.armorLight, [s * 1.495, 2.0, hz]);
    box(0.06, 0.05, 0.28, P.trim, [s * 1.52, 2.0, hz + 0.3]);
    cyl(0.03, 0.03, 0.06, 6, P.rim, [s * 1.52, 2.0, hz + 0.18], { dir: [s, 0, 0] });
    for (const dz of [-0.45, 0.45]) for (const dy of [-0.22, 0.22]) cyl(0.02, 0.02, 0.03, 6, P.rim, [s * 1.51, 2.0 + dy, hz + dz], { dir: [s, 0, 0] });
    // drone launcher bay
    const dz = ZC - 1.0;
    box(0.2, 0.55, 0.9, P.metalDark, [s * 1.5, 2.05, dz]);
    box(0.1, 0.4, 0.74, P.hullDark, [s * 1.6, 2.05, dz]);
    decal(screen, [s * 1.656, 2.05, dz], [s, 0, 0], 0.62, 0.36, "#ffffff", 1.2);
    box(0.08, 0.06, 0.9, P.trim, [s * 1.58, 2.36, dz]);
    // vents with amber glow
    decal(vent, [s * 1.462, 1.7, ZC + 0.5], [s, 0, 0], 0.4, 0.28, "#ffffff", 1.0);
    decal(vent, [s * 1.462, 2.3, Z0 + 0.5], [s, 0, 0], 0.4, 0.28, "#ffffff", 1.0);
    // emblem + serial
    decal(emblem, [s * 1.462, 2.25, ZC + 0.4], [s, 0, 0], 0.4, 0.4);
    decal(serial, [s * 1.462, 1.78, ZC + 0.55], [s, 0, 0], 0.7, 0.18);
    decal(warn, [s * 1.462, 1.78, Z0 + 0.35], [s, 0, 0], 0.22, 0.22);
    // conduits
    b.sweep([[s * 1.5, 1.5, Z0 + 0.1], [s * 1.52, 1.5, Z0 + 0.1], [s * 1.52, 2.45, Z0 + 0.1]], 0.025, { bone: body, color: P.rubber, sides: 6 });
    // stowage rack: jerry cans
    for (let i = 0; i < 3; i++) {
      const zz = Z0 + 0.55 + i * 0.3;
      box(0.2, 0.34, 0.24, i % 2 ? P.olive : P.red, [s * 1.6, 1.78, zz + 2.0 - 0.2]);
    }
    box(0.04, 0.05, 0.9, P.metalDark, [s * 1.52, 1.58, Z1 - 0.55 - 0.0]);
  }

  // front wall details (toward cab): armor slab + cable
  box(2.6, 1.0, 0.1, ARMOR, [0, 2.0, Z1 + 0.04]);
  glow(box(1.6, 0.05, 0.03, P.neonCyan, [0, 2.45, Z1 + 0.1]), 1.5);

  // ---- rear: door frame + ramp
  box(2.8, 0.12, 0.14, P.trim, [0, 2.5, Z0 - 0.03]);
  box(0.14, 1.0, 0.14, P.trim, [1.38, 1.98, Z0 - 0.03]);
  box(0.14, 1.0, 0.14, P.trim, [-1.38, 1.98, Z0 - 0.03]);
  glow(box(2.4, 0.04, 0.03, P.red, [0, 1.52, Z0 - 0.12]), 1.4);
  // ramp: joint rampHinge at z=-4 y=1.45, rotated rest = raised/closed (vertical-ish)
  const rampLen = 1.1;
  const rampPlate = b.part(new THREE.BoxGeometry(2.7, 0.08, rampLen), HULL, { bone: ramp, at: [0, 1.45, Z0 - rampLen / 2], flat: true });
  b.part(new THREE.PlaneGeometry(2.4, 0.5), "#ffffff", { bone: ramp, at: [0, 1.495, Z0 - 0.55], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: stripeTex });
  for (const s of [1, -1]) {
    box(0.1, 0.12, rampLen, P.trim, [s * 1.3, 1.5, Z0 - rampLen / 2], { bone: ramp });
    // hydraulic piston
    b.rod([s * 1.2, 1.6, Z0 + 0.05], [s * 1.2, 1.5, Z0 - 0.7], 0.035, P.rim, { bone: ramp, sides: 6 });
    b.rod([s * 1.2, 1.68, Z0 + 0.1], [s * 1.2, 1.55, Z0 - 0.2], 0.05, P.metalDark, { bone: body, sides: 6 });
  }
  for (let i = 0; i < 5; i++) box(2.4, 0.03, 0.04, P.metalDark, [0, 1.5, Z0 - 0.2 - i * 0.2], { bone: ramp });
  decal(warn, [0, 1.5, Z0 - 0.95], [0, 1, 0], 0.2, 0.2, "#ffffff", 0, [0, 0, -1]);
  // rear decals
  decal(emblem, [0, 2.15, Z0 - 0.11], [0, 0, -1], 0.7, 0.7);
  decal(serial, [0, 1.75, Z0 - 0.11], [0, 0, -1], 0.9, 0.22);
  for (const s of [1, -1]) decal(warn, [s * 0.95, 2.2, Z0 - 0.11], [0, 0, -1], 0.25, 0.25);

  // ---- roof: missile rack (6 pods, 2 rows x 3) at rear half
  const rackZ = Z0 + 1.05;
  box(2.2, 0.1, 1.9, P.metalDark, [0, 2.65, rackZ]);
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const x = (c - 1) * 0.68;
      const z = rackZ + (r - 0.5) * 0.85;
      // rack tilt: pods angled back-up
      const pod = cyl(0.14, 0.14, 0.8, 8, P.olive, [x, 2.88, z], { dir: [0, 0.35, 1] });
      cyl(0.145, 0.145, 0.06, 8, P.metalDark, [x, 2.88, z], { dir: [0, 0.35, 1] });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), P.red, { bone: body, at: [x, 2.88 + 0.4 * 0.33, z + 0.4 * 0.94], dir: [0, 0.35, 1], flat: true });
      b.part(new THREE.ConeGeometry(0.06, 0.12, 6), P.red, { bone: body, at: [x, 2.88 + 0.44 * 0.33, z + 0.44 * 0.94], dir: [0, 0.35, 1], flat: true });
      b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), P.trim, { bone: body, at: [x, 2.88 - 0.25 * 0.33, z - 0.25 * 0.94], dir: [0, 0.35, 1], flat: true });
    }
  for (const s of [1, -1]) {
    box(0.08, 0.2, 1.9, P.hullDark, [s * 1.0, 2.76, rackZ]);
    decal(warn, [s * 1.045, 2.78, rackZ], [s, 0, 0], 0.16, 0.16);
  }
  box(2.2, 0.06, 0.1, P.trim, [0, 2.7, rackZ + 1.0]);
  box(2.2, 0.06, 0.1, P.trim, [0, 2.7, rackZ - 1.0]);

  // ---- roof antenna array + satellite dish (rear-left corner, clear of turret ring at z=-0.2)
  const dishAt: number[] = [-0.85, 2.7, Z1 - 0.5];
  cyl(0.12, 0.16, 0.12, 8, P.metalDark, [dishAt[0], 2.64, dishAt[2]]);
  cyl(0.04, 0.04, 0.35, 6, P.rim, dishAt);
  const dish = b.lathe(
    [[0, 0], [0.34, 0.1], [0.36, 0.12], [0.3, 0.1], [0, 0.03]],
    { at: [dishAt[0], 2.92, dishAt[2]], axis: [0, 0.7, 0.7], segments: 10, bone: body, color: P.white },
  );
  b.rod([dishAt[0], 2.92, dishAt[2]], [dishAt[0], 3.12, dishAt[2] + 0.25], 0.015, P.rim, { bone: body, sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [dishAt[0], 3.13, dishAt[2] + 0.26] }), 2);
  // whips and masts
  const ants: [number, number, number, number][] = [[0.95, Z1 - 0.3, 1.3, 0.02], [1.1, Z1 - 0.9, 0.9, 0.015], [-1.1, Z0 + 0.3, 1.1, 0.015], [1.1, Z0 + 0.3, 1.5, 0.02]];
  for (const [x, z, h, r] of ants) {
    cyl(0.07, 0.09, 0.08, 6, P.metalDark, [x, 2.62, z]);
    b.rod([x, 2.66, z], [x + (x > 0 ? -0.05 : 0.05), 2.66 + h, z], [r * 1.6, r * 0.5], P.rim, { bone: body, sides: 4 });
    glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.red, { bone: body, at: [x + (x > 0 ? -0.05 : 0.05), 2.66 + h, z] }), 2);
  }
  // antenna array of yagi bars
  for (let i = 0; i < 4; i++) box(0.5 - i * 0.07, 0.02, 0.02, P.rim, [0.8, 2.75 + i * 0.12, Z0 + 0.7]);
  b.rod([0.8, 2.66, Z0 + 0.7], [0.8, 3.2, Z0 + 0.7], 0.015, P.rim, { bone: body, sides: 4 });

  // ---- open front deck z -0.6..1.0 (y 1.4): tie-downs, comms console, crates
  box(2.6, 0.06, 1.6, P.metalDark, [0, 1.46, 0.2]);
  for (let i = 0; i < 6; i++) {
    const x = (i % 2 ? 1 : -1) * 1.15, z = -0.3 + Math.floor(i / 2) * 0.55 + 0.1;
    b.sweep(
      b.surface ? [[x, 1.5, z - 0.07], [x, 1.58, z - 0.07], [x, 1.62, z], [x, 1.58, z + 0.07], [x, 1.5, z + 0.07]] : [],
      0.015,
      { bone: body, color: P.rim, sides: 5 },
    );
  }
  // comms console
  box(0.9, 0.4, 0.5, P.hullDark, [-0.6, 1.69, 0.55]);
  const consTop = b.part(new THREE.BoxGeometry(0.9, 0.08, 0.6), P.trim, { bone: body, at: [-0.6, 1.92, 0.55], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.5, 0.06), P.metalDark, { bone: body, at: [-0.6, 2.2, 0.42], rotation: [-18, 0, 0], flat: true });
  decal(screen, [-0.6, 2.2, 0.455], [0, 0.3, 1], 0.72, 0.42, "#ffffff", 1.5);
  for (let i = 0; i < 5; i++) glow(box(0.06, 0.03, 0.04, i % 2 ? P.neonCyan : P.amber, [-0.9 + i * 0.12, 1.97, 0.7]), 1.5);
  // crates
  box(0.6, 0.4, 0.5, P.olive, [0.6, 1.69, 0.2]);
  box(0.62, 0.05, 0.52, P.trim, [0.6, 1.9, 0.2]);
  box(0.5, 0.3, 0.4, P.hull, [0.65, 2.05, 0.2], { rotation: [0, 12, 0] });
  box(0.55, 0.3, 0.45, P.olive, [0.55, 1.64, 0.8]);
  decal(warn, [0.6, 1.69, 0.456], [0, 0, 1], 0.2, 0.2);
  // jerry cans on deck
  for (let i = 0; i < 3; i++) {
    box(0.2, 0.32, 0.14, i === 1 ? P.red : P.olive, [0.2 + i * 0.25, 1.65, 0.9]);
    box(0.08, 0.05, 0.06, P.metalDark, [0.2 + i * 0.25, 1.84, 0.9]);
  }
  // rear-wall hazard strip above deck
  b.part(new THREE.PlaneGeometry(2.4, 0.16), "#ffffff", { bone: body, at: [0, 1.55, Z1 + 0.02], dir: [0, 0, 1], axis: "z", texture: stripeTex });
  // deck rails
  for (const s of [1, -1]) {
    box(0.05, 0.05, 1.5, P.trim, [s * 1.4, 1.75, 0.25]);
    for (const z of [-0.45, 0.2, 0.95]) box(0.05, 0.35, 0.05, P.metalDark, [s * 1.4, 1.58, z]);
  }
  // roof magenta rim lights
  glow(box(2.3, 0.04, 0.04, P.neonMagenta, [0, 2.6, Z0 + 0.06]), 1.5);
  glow(box(2.3, 0.04, 0.04, P.neonMagenta, [0, 2.6, Z1 - 0.06]), 1.5);
  // roof hatch
  cyl(0.28, 0.3, 0.06, 8, P.armorLight, [0.5, 2.62, Z1 - 0.55]);
  cyl(0.06, 0.06, 0.1, 6, P.trim, [0.5, 2.68, Z1 - 0.55]);
  // scuffed bumper-ish rivets dots under skirt
  const rv = [] as THREE.BufferGeometry[];
  for (let i = 0; i < 14; i++) {
    const z = Z0 + 0.2 + i * 0.25;
    for (const s of [1, -1]) rv.push(new THREE.SphereGeometry(0.018, 4, 3).translate(s * 1.5, 1.47, z));
  }
  const { mergeGeometries } = require_merge();
  const merged = mergeGeometries(rv);
  if (merged) b.part(merged, P.rim, { bone: body, at: [0, 0, 0] });

  function require_merge() {
    return { mergeGeometries: (g: THREE.BufferGeometry[]) => mergeSimple(g) };
  }
  function mergeSimple(gs: THREE.BufferGeometry[]) {
    const pos: number[] = [], nor: number[] = [], idx: number[] = [];
    let off = 0;
    for (const g of gs) {
      const p = g.getAttribute("position"), n = g.getAttribute("normal");
      for (let i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
      }
      const ix = g.getIndex();
      if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    m.setIndex(idx);
    return m;
  }
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { stripes } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pit = J.gunPitch;
  const C = M.turretRing;
  const R = rng(77);

  // ---- paints and textures
  const HULL = panelled(P.hull, { size: 0.22, rivets: 0.06 });
  const ARMOR = panelled(P.armorLight, { size: 0.18, rivets: 0.05 });
  const DARK = panelled(P.metalDark, { size: 0.2, rivets: 0 });
  const GUNMETAL = metal("steel", { tarnish: 0.3, polish: 0.2 });
  const HAZARD = stripes(P.trim, P.hullDark, { size: 0.1, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const HAZARD_X = stripes(P.trim, P.hullDark, { size: 0.1, axis: "x", width: 0.5, wobble: 0 });
  const BELT = stripes("#b88a2a", P.hullDark, { size: 0.05, axis: "z", width: 0.45, wobble: 0 });

  const RETICLE = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#06222c"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#2ff3ff" stroke-width="3"/>
    <circle cx="32" cy="32" r="9" fill="#2ff3ff"/><circle cx="32" cy="32" r="4" fill="#ffffff"/>
    <path d="M32 2V14M32 50V62M2 32H14M50 32H62" stroke="#2ff3ff" stroke-width="3.5"/>
    <path d="M10 10L18 10M10 10L10 18M54 54L46 54M54 54L54 46" stroke="#ff2fb4" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const WARN = (txt: string, sub: string) =>
    svg(
      `<svg viewBox="0 0 96 48"><rect width="96" height="48" rx="4" fill="#e7b814"/>
      <rect x="3" y="3" width="90" height="42" rx="3" fill="none" stroke="#20242e" stroke-width="2.5"/>
      <path d="M8 40 L22 10 L36 40Z" fill="#20242e"/><rect x="21" y="19" width="2.4" height="10" fill="#e7b814"/><circle cx="22.2" cy="34" r="1.6" fill="#e7b814"/>
      <text x="64" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#20242e">${txt}</text>
      <text x="64" y="38" text-anchor="middle" font-family="monospace" font-size="9" fill="#20242e">${sub}</text></svg>`,
      { size: 192 },
    );
  const WARN_A = WARN("T-07", "RAIL-MX");
  const WARN_B = WARN("DANGER", "HV 40kV");

  // ---- helpers
  const put = (g: THREE.BufferGeometry, color: any, bone: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone, at, flat: true, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, n = 8) => new THREE.CylinderGeometry(rt, rb, h, n);

  // ---- slewing ring with teeth and lights
  put(cyl(0.88, 0.92, 0.1, 24), DARK, yaw, [0, C[1] + 0.05, C[2]]);
  put(cyl(0.8, 0.8, 0.06, 24), HAZARD, yaw, [0, C[1] + 0.12, C[2]]);
  const teeth: THREE.BufferGeometry[] = [];
  const lamps: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    teeth.push(box(0.1, 0.07, 0.07).translate(0, 0, 0.92).rotateY(a));
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.15;
    lamps.push(box(0.1, 0.04, 0.05).translate(0, 0, 0.935).rotateY(a));
  }
  put(mergeGeometries(teeth)!, GUNMETAL, yaw, [0, C[1] + 0.05, C[2]]);
  glow(put(mergeGeometries(lamps)!, P.neonCyan, yaw, [0, C[1] + 0.09, C[2]]), 1.4);

  // ---- armored turret body: side-profile extrude (z, y)
  const prof: [number, number][] = [
    [-0.75, 2.67],
    [0.6, 2.67],
    [0.78, 2.92],
    [0.45, 3.3],
    [-0.35, 3.36],
    [-0.82, 3.02],
  ];
  b.extrude(prof, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 1.1,
    bevel: 0.03,
    color: HULL,
    bone: yaw,
  });
  // sloped cheek plates
  for (const s of [1, -1]) {
    put(box(0.1, 0.5, 1.0), ARMOR, yaw, [s * 0.58, 3.0, -0.05], { rotation: [0, 0, s * -12] });
    put(box(0.05, 0.06, 1.1), HAZARD, yaw, [s * 0.62, 2.75, -0.05]);
    // bolts
    for (let i = 0; i < 4; i++)
      put(cyl(0.018, 0.018, 0.03, 6), P.rim, yaw, [s * 0.645, 3.12, -0.45 + i * 0.28], { dir: [s, 0, 0] });
  }
  // front hazard strip and rear armor bustle
  put(box(1.0, 0.05, 0.05), HAZARD_X, yaw, [0, 2.72, 0.72], { rotation: [-20, 0, 0] });
  put(box(0.95, 0.5, 0.2), ARMOR, yaw, [0, 3.0, -0.88], { rotation: [8, 0, 0] });
  put(box(0.8, 0.06, 0.06), HAZARD_X, yaw, [0, 2.76, -1.0]);

  // heat vents glowing amber
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      glow(put(box(0.02, 0.035, 0.3), P.amber, yaw, [s * 0.565, 2.85 + i * 0.07, -0.55]), 1.5);

  // decals
  for (const s of [1, -1]) {
    put(new THREE.PlaneGeometry(0.34, 0.17), "#ffffff", yaw, [s * 0.655, 2.88, 0.1], {
      dir: [s, 0, 0],
      axis: "z",
      texture: s > 0 ? WARN_A : WARN_B,
    });
  }

  // ---- hatch and gunner shield
  put(cyl(0.18, 0.2, 0.06, 8), DARK, yaw, [-0.25, 3.37, -0.35]);
  put(cyl(0.14, 0.15, 0.05, 8), P.armorLight, yaw, [-0.25, 3.42, -0.35], { rotation: [0, 0, 0] });
  put(box(0.1, 0.03, 0.03), P.rim, yaw, [-0.25, 3.46, -0.35]);
  b.extrude(
    [
      [-0.34, 0],
      [0.34, 0],
      [0.24, 0.32],
      [-0.24, 0.32],
    ],
    { at: [0.05, 3.3, 0.05], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, color: ARMOR, bone: yaw },
  );

  // ---- sensor eye
  put(cyl(0.11, 0.12, 0.26, 8), DARK, yaw, [0.3, 3.46, -0.05], { dir: [0, 0, 1] });
  put(cyl(0.135, 0.11, 0.05, 8), P.metalDark, yaw, [0.3, 3.46, 0.1], { dir: [0, 0, 1] });
  glow(
    put(new THREE.CircleGeometry(0.095, 12), "#ffffff", yaw, [0.3, 3.46, 0.128], {
      dir: [0, 0, 1],
      axis: "z",
      texture: RETICLE,
    }),
    1.3,
  );
  put(box(0.3, 0.02, 0.18), HAZARD_X, yaw, [0.3, 3.355, -0.05]);

  // ---- side missile launchers (+x and -x)
  for (const s of [1, -1]) {
    const x = s * 0.72;
    put(box(0.26, 0.3, 0.62), HULL, yaw, [x, 2.95, -0.55]);
    put(box(0.26, 0.04, 0.62), HAZARD_X, yaw, [x, 3.12, -0.55]);
    for (let i = 0; i < 4; i++) {
      const tx = x + ((i % 2) - 0.5) * 0.12;
      const ty = 2.95 + (Math.floor(i / 2) - 0.5) * 0.12;
      put(cyl(0.05, 0.05, 0.14, 8), P.hullDark, yaw, [tx, ty, -0.22], { dir: [0, 0, 1] });
      put(cyl(0.035, 0.035, 0.02, 8), P.red, yaw, [tx, ty, -0.285], { dir: [0, 0, 1] });
    }
  }

  // ---- ammo drum and feed belt
  put(cyl(0.2, 0.2, 0.22, 10), GUNMETAL, yaw, [-0.67, 2.88, 0.3], { dir: [1, 0, 0] });
  put(cyl(0.21, 0.21, 0.03, 10), HAZARD_X, yaw, [-0.75, 2.88, 0.3], { dir: [1, 0, 0] });
  put(cyl(0.05, 0.05, 0.05, 6), P.red, yaw, [-0.78, 2.88, 0.3], { dir: [1, 0, 0] });
  b.sweep(
    [
      [-0.62, 3.0, 0.3],
      [-0.45, 3.2, 0.4],
      [-0.2, 3.12, 0.7],
      [-0.1, 3.02, 0.8],
    ],
    [0.035, 0.035],
    { color: BELT, bone: pit, section: "box" },
  );

  // ---- gun cradle and mantlet (pitch)
  for (const s of [1, -1]) {
    put(cyl(0.07, 0.07, 0.12, 8), P.rim, pit, [s * 0.5, 3.0, -0.2], { dir: [1, 0, 0] });
    put(box(0.1, 0.3, 0.55), ARMOR, pit, [s * 0.22, 3.0, 0.68]);
  }
  put(box(0.5, 0.42, 0.2), DARK, pit, [0, 3.0, 0.82]);
  put(box(0.42, 0.34, 0.5), HULL, pit, [0, 3.0, 0.5]);
  put(box(0.3, 0.05, 0.3), HAZARD_X, pit, [0, 3.2, 0.6]);

  // ---- railgun: twin rails, core, coils, muzzle
  for (const s of [1, -1]) {
    put(box(0.09, 0.11, 1.5), GUNMETAL, pit, [s * 0.1, 3.0, 1.5]);
    put(box(0.02, 0.05, 1.3), P.neonCyan, pit, [s * 0.05, 3.0, 1.5]);
    glow(put(box(0.02, 0.03, 1.3), P.neonCyan, pit, [s * 0.1, 3.06, 1.5]), 1.6);
  }
  glow(put(box(0.04, 0.04, 1.4), P.neonCyan, pit, [0, 3.0, 1.5]), 1.8);
  for (let i = 0; i < 6; i++) {
    const z = 1.0 + i * 0.18;
    put(new THREE.TorusGeometry(0.17, 0.028, 4, 8), P.metalDark, pit, [0, 3.0, z]);
    glow(put(new THREE.TorusGeometry(0.17, 0.016, 4, 8), P.neonCyan, pit, [0, 3.0, z + 0.035]), 1.7);
  }
  put(box(0.38, 0.28, 0.14), DARK, pit, [0, 3.0, 2.12]);
  for (const s of [1, -1]) {
    put(box(0.06, 0.34, 0.2), HAZARD_X, pit, [s * 0.2, 3.0, 2.12]);
    glow(put(box(0.02, 0.2, 0.03), P.amber, pit, [s * 0.235, 3.0, 2.05]), 1.5);
  }
  put(box(0.3, 0.05, 0.16), DARK, pit, [0, 3.17, 2.12]);
  glow(put(box(0.08, 0.08, 0.02), P.neonCyan, pit, [0, 3.0, 2.2]), 2);

  // ---- rear antenna cluster
  const ants: [number[], number[], number][] = [
    [[0.3, 3.2, -0.95], [0.34, 3.85, -1.0], 0.012],
    [[-0.3, 3.2, -0.95], [-0.38, 3.65, -1.05], 0.01],
    [[0.0, 3.2, -1.0], [0.0, 3.45, -1.1], 0.016],
  ];
  for (const [a, c, r] of ants) b.rod(a, c, r, P.rim, { bone: yaw });
  for (const [, c] of ants) glow(put(new THREE.SphereGeometry(0.03, 5, 4), P.red, yaw, c), 1.8);
  put(cyl(0.1, 0.1, 0.03, 8), P.hullDark, yaw, [0, 3.45, -1.1], { dir: [0, 0, 1] });
  put(box(0.14, 0.08, 0.1), DARK, yaw, [0, 3.2, -0.97]);
  // rivet row on rear bustle
  for (let i = 0; i < 6; i++)
    put(new THREE.SphereGeometry(0.018, 4, 3), P.rim, yaw, [-0.35 + i * 0.14, 3.02 + (R() - 0.5) * 0.01, -0.99]);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { paint, svg, mix, smoothstep, noise } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P }: Ctx) {
  const bone = J.cab;

  // ---------- textures ----------
  const HAZARD = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 8 - 4} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 8Z" fill="#15161b"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#20242e" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M14 40 L18 18 L27 26 L37 26 L46 18 L50 40 L40 50 L24 50Z" fill="#ff2fb4" stroke="#15161b" stroke-width="2"/>
    <path d="M24 34 L30 36 L28 40Z M40 34 L34 36 L36 40Z" fill="#2ff3ff"/><path d="M28 46 L36 46 L32 50Z" fill="#15161b"/>
    <text x="32" y="12" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#e7b814">77</text></svg>`,
    { size: 128 },
  );
  const SERIAL = svg(
    `<svg viewBox="0 0 120 32"><rect x="0" y="0" width="120" height="32" rx="3" fill="#15161b" opacity="0.85"/><rect x="0" y="26" width="120" height="6" fill="#e7b814"/>
    <text x="60" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#e9edf2">WH-MX77</text>
    <text x="60" y="24" text-anchor="middle" font-family="monospace" font-size="7" fill="#2ff3ff">UNIT 0417 // 6X6</text></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 48 48"><path d="M24 3 L46 43 L2 43Z" fill="#e7b814" stroke="#15161b" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="16" width="4" height="15" fill="#15161b"/><rect x="22" y="34" width="4" height="4" fill="#15161b"/></svg>`,
    { size: 96 },
  );
  const HUD = svg(
    `<svg viewBox="0 0 200 30"><rect width="200" height="30" fill="#7a4a10"/>
    <path d="M0 15 H200" stroke="#ffd27a" stroke-width="0.8" opacity="0.5"/>
    ${Array.from({ length: 18 }, (_, i) => `<rect x="${8 + i * 4}" y="${22 - (i % 5) * 2}" width="2.4" height="${4 + (i % 5) * 2}" fill="#ffe0a0"/>`).join("")}
    <circle cx="120" cy="15" r="10" fill="none" stroke="#ffe0a0" stroke-width="1.5"/><path d="M120 3 V27 M108 15 H132" stroke="#ffe0a0" stroke-width="1"/>
    <text x="146" y="13" font-family="monospace" font-size="8" font-weight="bold" fill="#fff2cc">SPD 084</text>
    <text x="146" y="24" font-family="monospace" font-size="7" fill="#ffd27a">ARM 100%</text>
    <text x="6" y="10" font-family="monospace" font-size="7" fill="#fff2cc">WARHOUND // LINK OK</text></svg>`,
    { size: 512 },
  );

  // ---------- paints ----------
  const base = paint((p, n) =>
    mix(mix(P.hull, P.armorLight, smoothstep(0.2, 0.95, n.y) * 0.55), P.hullDark, smoothstep(0.6, 0.8, noise(p, 0.25, 4)) * 0.4),
  );
  const HULL = panelled(base, { size: 0.36, aspect: 0.8, rivets: 0.07 });
  const PLATE = panelled(P.armorLight, { size: 0.22, rivets: 0.05 });
  const DARK = panelled(P.hullDark, { size: 0.3, rivets: 0 });

  // ---------- helpers ----------
  const part = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) => b.part(geo, color, { bone, at, ...o });
  const box = (sx: number, sy: number, sz: number, color: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(sx, sy, sz), color, at, o);
  const merged = (list: number[][], color: any) => {
    const geos = list.map(([sx, sy, sz, x, y, z]) => new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z));
    return b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  };
  const bolts = (pts: number[][], color: any) => {
    const geos = pts.map(([x, y, z]) => new THREE.SphereGeometry(0.024, 5, 3).translate(x, y, z));
    return b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  };
  const decal = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], o: any = {}) =>
    part(new THREE.PlaneGeometry(w, h), "#ffffff", at, { dir, axis: "z", texture: tex, ...o });

  // ---------- main wedge body (side profile extruded across the width) ----------
  b.extrude(
    [
      [1.0, 1.25],
      [3.4, 1.25],
      [3.4, 1.75],
      [2.65, 2.5],
      [1.0, 2.5],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.7, bevel: 0.06, color: HULL, bone, name: "cabShell" },
  );
  // roof slab and rim
  box(2.5, 0.06, 1.62, PLATE, [0, 2.53, 1.82]);
  merged(
    [
      [0.05, 0.06, 1.62, 1.27, 2.58, 1.82],
      [0.05, 0.06, 1.62, -1.27, 2.58, 1.82],
      [2.5, 0.06, 0.05, 0, 2.58, 1.02],
    ],
    P.trim,
  );

  // ---------- windshield ----------
  const nrm = [0, 0.707, 0.707];
  const up = [0, 0.707, -0.707];
  const C = [0, 2.125, 3.025];
  const along = (t: number, d = 0, dv = up) => [C[0], C[1] + dv[1] * t + nrm[1] * d, C[2] + dv[2] * t + nrm[2] * d];
  box(2.2, 0.42, 0.05, P.hullDark, along(0, 0.012), { dir: nrm, axis: "z" });
  glow(decal(HUD, 1.98, 0.3, along(0, 0.045), nrm, { up: [0, 1, 0] }), 1.3);
  box(2.45, 0.1, 0.06, "#ffffff", along(0.33, 0.03), { dir: nrm, axis: "z", texture: HAZARD });
  box(2.3, 0.05, 0.06, P.hullDark, along(-0.27, 0.03), { dir: nrm, axis: "z" });
  for (const s of [1, -1]) {
    box(0.3, 1.0, 0.06, PLATE, along(0, 0.035).map((v, i) => (i === 0 ? s * 1.17 : v)), { dir: nrm, axis: "z" });
    // wiper
    b.rod(along(-0.2, 0.07).map((v, i) => (i === 0 ? s * 0.1 : v)), along(0.1, 0.07).map((v, i) => (i === 0 ? s * 0.75 : v)), 0.008, P.metalDark, { bone });
    // cheek bolts
    bolts([0.4, -0.4].map((t) => along(t, 0.07).map((v, i) => (i === 0 ? s * 1.17 : v))), P.rim);
  }

  // ---------- sides: doors, windows, plates, mirrors ----------
  const hingeGeos: THREE.BufferGeometry[] = [];
  const sideBolts: number[][] = [];
  for (const s of [1, -1]) {
    const o = [s, 0, 0];
    box(0.03, 1.06, 1.36, DARK, [s * 1.37, 1.85, 2.15]);
    box(0.05, 1.0, 1.3, HULL, [s * 1.375, 1.85, 2.15]);
    box(0.04, 0.26, 0.86, P.hullDark, [s * 1.4, 2.15, 2.15]);
    glow(box(0.03, 0.19, 0.78, P.amber, [s * 1.413, 2.15, 2.15]), 1.2);
    box(0.06, 0.04, 0.22, P.rim, [s * 1.42, 1.8, 1.65]);
    box(0.045, 0.1, 0.05, P.metalDark, [s * 1.405, 1.8, 1.55]);
    // hinges
    for (const y of [1.55, 2.15]) hingeGeos.push(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6).translate(s * 1.405, y, 2.8));
    // decals
    decal(EMBLEM, 0.27, 0.27, [s * 1.406, 1.72, 2.12], o);
    decal(SERIAL, 0.56, 0.15, [s * 1.406, 1.45, 2.12], o);
    decal(WARN, 0.14, 0.14, [s * 1.406, 1.72, 2.6], o);
    // hazard sill
    box(0.03, 0.08, 2.3, "#ffffff", [s * 1.38, 1.3, 2.15], { texture: HAZARD });
    // neon roof edge
    glow(box(0.03, 0.03, 1.6, P.neonMagenta, [s * 1.37, 2.46, 1.8]), 1.4);
    glow(box(0.03, 0.025, 0.7, P.neonCyan, [s * 1.37, 1.38, 3.05]), 1.4);
    // spaced armor plates on standoffs
    for (const [h, z, y, w] of [[0.7, 3.1, 1.65, 0.55], [0.9, 1.2, 1.8, 0.28]]) {
      box(0.08, h, w, PLATE, [s * 1.45, y, z]);
      for (const dz of [-w / 2 + 0.07, w / 2 - 0.07])
        b.rod([s * 1.35, y, z + dz], [s * 1.42, y, z + dz], 0.025, P.metalDark, { bone });
      for (const dz of [-w / 2 + 0.07, w / 2 - 0.07]) for (const dy of [-h / 2 + 0.08, h / 2 - 0.08]) sideBolts.push([s * 1.495, y + dy, z + dz]);
    }
    // rear side intake grille (cyan glow)
    box(0.04, 0.5, 0.4, P.hullDark, [s * 1.37, 2.0, 1.25]);
    merged(Array.from({ length: 5 }, (_, i) => [0.02, 0.03, 0.32, s * 1.4, 1.82 + i * 0.09, 1.25]), P.neonCyan);
    // mirror
    b.rod([s * 1.35, 2.15, 2.95], [s * 1.58, 2.25, 3.0], 0.02, P.metalDark, { bone });
    box(0.1, 0.24, 0.17, P.hullDark, [s * 1.63, 2.24, 3.0]);
    box(0.012, 0.19, 0.13, P.glass, [s * 1.63, 2.24, 3.09], { dir: [0, 0, 1], axis: "z" });
    glow(part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, [s * 1.63, 2.08, 3.03]), 1.5);
    // roof antenna whips
    b.rod([s * 1.2, 2.56, 1.15], [s * 1.22, 2.7, 1.1], [0.016, 0.006], P.metalDark, { bone });
    glow(part(new THREE.SphereGeometry(0.02, 5, 3), P.red, [s * 1.22, 2.7, 1.1]), 1.5);
    // roof grille
    box(0.9, 0.03, 0.4, P.hullDark, [s * 0.75, 2.575, 1.25]);
    merged(Array.from({ length: 4 }, (_, i) => [0.8, 0.012, 0.03, s * 0.75, 2.595, 1.12 + i * 0.09]), P.neonCyan);
  }
  b.part(mergeGeometries(hingeGeos)!, P.metalDark, { bone, at: [0, 0, 0] });
  bolts(sideBolts, P.rim);

  // ---------- roof light bar ----------
  box(1.7, 0.1, 0.16, P.hullDark, [0, 2.62, 2.45]);
  const lensC: number[][] = [];
  const lensM: number[][] = [];
  for (let i = 0; i < 6; i++) (i % 2 ? lensM : lensC).push([0.24, 0.06, 0.02, -0.65 + i * 0.26, 2.62, 2.535]);
  glow(merged(lensC, P.neonCyan), 1.6);
  glow(merged(lensM, P.neonMagenta), 1.6);

  // ---------- roof hatch ring ----------
  part(new THREE.TorusGeometry(0.27, 0.035, 5, 8), P.trim, [-0.5, 2.585, 1.65], { dir: [0, 1, 0], axis: "z" });
  part(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 8), P.armorLight, [-0.5, 2.6, 1.65]);
  box(0.16, 0.03, 0.04, P.metalDark, [-0.5, 2.63, 1.65]);
  box(0.04, 0.03, 0.16, P.metalDark, [-0.5, 2.63, 1.65]);

  // ---------- sensor mast + spinning radar ----------
  const mastAt = [0.9, 2.62, 1.4];
  box(0.2, 0.06, 0.2, P.hullDark, [0.9, 2.58, 1.4]);
  b.rod([0.9, 2.58, 1.4], mastAt, 0.03, P.metalDark, { bone });
  const radar = b.joint("cabRadar", { parent: bone, at: mastAt, dir: [0, 1, 0], role: "hinge", group: "cab" });
  const ax = new THREE.Vector3(0, 0.35, 1).normalize();
  b.lathe(
    [
      [0, 0],
      [0.1, 0.05],
      [0.1, 0.065],
      [0, 0.015],
    ],
    { at: [0.9, 2.64, 1.4], axis: [ax.x, ax.y, ax.z], color: P.rim, bone: radar, segments: 8 },
  );
  b.rod([0.9, 2.64, 1.4], [0.9 + ax.x * 0.1, 2.64 + ax.y * 0.1, 1.4 + ax.z * 0.1], 0.01, P.metalDark, { bone: radar });
  glow(part(new THREE.SphereGeometry(0.02, 5, 3), P.neonMagenta, [0.9, 2.675, 1.5], { bone: radar }), 1.5);
  // small camera pod on mast
  glow(part(new THREE.SphereGeometry(0.035, 6, 4), P.amber, [0.9, 2.66, 1.35], { bone }), 1.2);

  // ---------- front frame / lower details ----------
  glow(box(2.3, 0.03, 0.03, P.neonCyan, along(-0.3, 0.05), { dir: nrm, axis: "z" }), 1.4);
  box(2.6, 0.12, 0.05, "#ffffff", [0, 1.3, 1.02], { texture: HAZARD });
  // rear-wall conduits
  for (const s of [1, -1]) b.rod([s * 0.9, 1.3, 1.03], [s * 0.9, 2.45, 1.03], 0.03, P.metalDark, { bone });
  bolts([[-0.8, 1.9, 1.01], [0.8, 1.9, 1.01]], P.rim);
}
```
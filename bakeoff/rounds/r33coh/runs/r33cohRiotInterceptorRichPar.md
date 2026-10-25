<!-- call: plan -->

```json
{
  "name": "Arasaka-style Riot Interceptor RC-9",
  "description": "A hulking corporate riot-control interceptor truck with a roof-mounted water cannon, wedge push bar and glowing neon light bars in Cyberpunk 2077 style.",
  "builderName": "riotInterceptor",
  "size": [2.6, 2.7, 6.4],
  "layout": "A low, wide armored wedge-nosed truck. Front (+Z): angled steel push-bar and bumper with cyan neon strip, narrow slit headlights in hot magenta. Behind it a sloped hood, a bulletproof cab with tinted slit windshield, then a long armored rear bed carrying a rotating water-cannon turret on a ring at the roof-rear. Four chunky wheels with armored fenders at the corners, sitting on the floor. Style: matte dark gunmetal plating with riveted panel seams, yellow-black hazard chevrons on the bumper and fender edges, corporate logo decals on the doors, grime and scratches painted by place, and neon cyan, magenta and yellow light bars that glow on the roof, flanks and under-skirt. Overall silhouette is angular, brutalist and menacing.",
  "palette": {
    "hull": "#2b303a",
    "hullDark": "#14171d",
    "plate": "#454d5b",
    "hazard": "#f2c200",
    "tire": "#101012",
    "rim": "#7b8494",
    "glass": "#0a1d2a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonYellow": "#fff04a",
    "corpRed": "#d3162c",
    "water": "#6fd6ff",
    "steel": "#8d96a5"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 0.7],
    "turretRing": [0, 2.15, -1.7],
    "axleFront": [0, 0.55, 2.0],
    "axleRear": [0, 0.55, -2.0],
    "bumperFront": [0, 0.7, 3.1],
    "roofBar": [0, 2.3, 0.6]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFR", "parent": "body", "at": [-1.15, 0.55, 2.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFL", "parent": "body", "at": [1.15, 0.55, 2.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.15, 0.55, -2.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.15, 0.55, -2.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.15, -1.7], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "cannonPitch", "parent": "turretYaw", "at": [0, 2.55, -1.7], "dir": [0, 0, 1], "role": "hinge", "group": "turret" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower armored hull: slab chassis with side skirts, underbody, fender arches, wedge nose and hood, rear bed deck with armored sidewalls, riveted panelled paint (panelled metal iron/hull), hazard chevron stripes on skirts, neon cyan under-glow strips along the skirts (glow), exhaust stacks at the rear, tow hooks, and mud grime painted near the bottom.",
      "box": [[-1.3, 0.3, -3.2], [1.3, 1.5, 3.0]],
      "attaches": "Sits on axleFront/axleRear lines between wheels, cab starts at cabFloor, turret ring base at turretRing on the rear deck, bumper at bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armored cab: tapered box roof with sloped windshield, narrow tinted slit glass with reflection streaks drawn as SVG texture, doors with corporate logo SVG decals in corpRed and white, door handles, mirrors, roof light bars (neonCyan and neonMagenta, glowing) on roofBar, antenna cluster, roof vents, a spotlight pair, and panelled plating with scratches.",
      "box": [[-1.2, 1.3, -0.6], [1.2, 2.45, 1.9]],
      "attaches": "Floor at cabFloor/chassisTop, roof bar at roofBar, rear wall abuts the rear bed near z=-0.6.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "frontGear",
      "builds": "Front end: angled steel push-bar ram with hazard chevron paint, bumper with slit magenta headlights and cyan neon strip (glow), grille with vertical bars, winch, plus two front wheels with chunky tires, hubcaps with SVG spoke rim texture, armored wheel guards and brake discs, all wheels on their wheel joints.",
      "box": [[-1.4, 0, 1.0], [1.4, 1.2, 3.2]],
      "attaches": "Bumper at bumperFront, wheels on wheelFR and wheelFL at axleFront, meets chassis nose.",
      "joints": ["wheelFR", "wheelFL", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "rearGear",
      "builds": "Rear running gear: two chunky rear wheels with tires, rims, lug nuts, armored mudflaps and fender guards, rear bumper with tail light bars in neonMagenta (glow), license plate SVG with corp text, rear bed storage lockers, ladder, and hazard markings.",
      "box": [[-1.4, 0, -3.2], [1.4, 1.2, -1.0]],
      "attaches": "Wheels on wheelRR and wheelRL at axleRear; rear bumper at chassis back face z=-3.2.",
      "joints": ["wheelRR", "wheelRL", "body"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "turret",
      "builds": "Water cannon turret: ring base and armored rotating housing on turretYaw, operator shield plates, a thick barrel on cannonPitch with a flared nozzle, banded fittings, hose lines to pressure tank cylinders with water-level SVG gauge, glowing water-blue nozzle tip (glow), small neonYellow warning lights, hazard stripes, and corp emblem.",
      "box": [[-0.8, 2.0, -2.6], [0.8, 2.7, -0.4]],
      "attaches": "Base ring centred at turretRing on the rear deck, barrel points forward over the cab roof.",
      "joints": ["turretYaw", "cannonPitch"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  const grime = (base: any) =>
    paint((p, n) => {
      const low = 1 - smoothstep(0.3, 0.8, p.y);
      const m = noise(p, 0.18, 4);
      const c = mix(base, "#3a3226", low * (0.4 + 0.5 * m));
      const sc = noise(p, 0.02, 9) > 0.78 ? 0.3 : 0;
      return mix(c, "#8d96a5", sc * (n.y > -0.5 ? 1 : 0));
    });
  const HULL = grime(panelled(P.hull, { size: 0.5, aspect: 0.6, rivets: 0.07 }));
  const DARK = grime(panelled(P.hullDark, { size: 0.4, rivets: 0.06 }));
  const PLATE = panelled(P.plate, { size: 0.45, rivets: 0.07 });

  const chev = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#14171d"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 2} 0 L${i * 8 + 6} 0 L${i * 8} 16Z" fill="#f2c200"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...extra });

  // underbody and main slab
  box(2.3, 0.3, 6.0, DARK, [0, 0.45, -0.1]);
  box(2.5, 0.5, 5.2, HULL, [0, 0.85, -0.3]);
  // side skirts with hazard chevrons
  for (const s of [1, -1]) {
    box(0.12, 0.34, 3.4, PLATE, [s * 1.27, 0.62, 0]);
    b.part(new THREE.PlaneGeometry(3.0, 0.2), "#ffffff", {
      bone: body,
      at: [s * 1.335, 0.62, 0],
      dir: [s, 0, 0],
      axis: "z",
      texture: chev,
      rotation: [0, 0, 0],
    });
    // neon undertube
    glow(box(0.06, 0.06, 3.6, P.neonCyan, [s * 1.2, 0.4, 0]), 2);
    // fender arches (blocky)
    for (const z of [2, -2]) {
      box(0.3, 0.12, 1.3, PLATE, [s * 1.18, 1.18, z]);
      box(0.12, 0.45, 1.3, PLATE, [s * 1.3, 0.95, z]);
    }
    // rear bed sidewalls
    box(0.14, 0.55, 2.6, HULL, [s * 1.23, 1.4, -1.9]);
    box(0.16, 0.08, 2.6, PLATE, [s * 1.23, 1.7, -1.9]);
    // tow hooks
    b.rod([s * 0.6, 0.55, 3.0], [s * 0.6, 0.55, 3.25], 0.04, P.steel, { bone: body });
    b.part(new THREE.TorusGeometry(0.07, 0.025, 6, 10), P.steel, { bone: body, at: [s * 0.6, 0.55, 3.28] });
    // exhaust stacks
    b.rod([s * 1.0, 1.3, -3.0], [s * 1.0, 2.1, -3.0], 0.07, P.steel, { bone: body });
    b.part(new THREE.CylinderGeometry(0.09, 0.07, 0.1, 8), P.hullDark, { bone: body, at: [s * 1.0, 2.1, -3.0] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8), P.hazard, { bone: body, at: [s * 1.0, 1.55, -3.0] });
  }
  // rear deck and tailgate
  box(2.4, 0.1, 2.8, PLATE, [0, 1.12, -1.8]);
  box(2.4, 0.5, 0.14, HULL, [0, 1.4, -3.15]);
  glow(box(1.6, 0.05, 0.03, P.neonMagenta, [0, 1.55, -3.24]), 2);
  // turret ring base
  b.part(new THREE.CylinderGeometry(0.65, 0.75, 0.15, 12), P.plate, { bone: body, at: [M.turretRing[0], 1.2, M.turretRing[2]] });
  // hood and wedge nose
  const wedge = b.extrude(
    [
      [0, 0],
      [1.9, 0],
      [1.9, 0.35],
      [1.0, 0.6],
      [0, 0.75],
    ],
    { at: [0, 0.7, 1.2], x: [0, 0, 1], thickness: 2.4, color: HULL, bone: body, bevel: 0.03 },
  );
  // extrude thickness is along x*y = (0,0,1)x(0,1,0) = -x; centred so fine
  void wedge;
  box(2.3, 0.1, 0.9, DARK, [0, 1.42, 0.9]);
  // hood vents
  for (let i = 0; i < 5; i++) box(0.5, 0.03, 0.05, P.hullDark, [(i - 2) * 0.55 * 0.8, 1.45, 1.9 + R() * 0.0]);
  // nose neon strip
  glow(box(1.9, 0.05, 0.04, P.neonCyan, [0, 0.9, 3.0]), 2);
  box(2.4, 0.14, 0.2, P.hazard, [0, 0.62, 2.95]);
  // cab floor connection
  box(2.4, 0.2, 1.4, HULL, [0, 1.3, M.cabFloor[2] - 0.2]);
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, stripes, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pit = J.cannonPitch;
  const cx = M.turretRing[0], cy = M.turretRing[1], cz = M.turretRing[2];

  const HULL = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.05 });
  const HAZ = stripes(P.hazard, P.hullDark, { size: 0.06, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const GRIME = paint((p, n) => {
    const t = Math.max(0, Math.min(1, (2.4 - p.y) * 2));
    return mix(mix(P.plate, P.hull, 0.4), P.hullDark, t * 0.5 + (n.y < -0.3 ? 0.3 : 0));
  });

  const gauge = svg(`<svg viewBox="0 0 32 64"><rect x="1" y="1" width="30" height="62" rx="4" fill="#0a1d2a" stroke="#8d96a5" stroke-width="2"/><rect x="5" y="26" width="22" height="34" fill="#6fd6ff"/><rect x="5" y="26" width="22" height="3" fill="#ffffff"/><g stroke="#ffffff" stroke-width="1.5"><path d="M5 10h8M5 18h8M5 26h8"/></g></svg>`, { size: 128 });
  const emblem = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#d3162c" stroke="#ffffff" stroke-width="3"/><path d="M32 12L48 48H40L32 30L24 48H16Z" fill="#ffffff"/></svg>`, { size: 128 });

  const part = (g: THREE.BufferGeometry, col: any, at: number[], bone: any, o: any = {}) =>
    b.part(g, col, { bone, at, ...o });

  // ring base
  part(new THREE.CylinderGeometry(0.62, 0.7, 0.1, 16), HULL, [cx, cy + 0.05, cz], yaw);
  part(new THREE.TorusGeometry(0.62, 0.035, 6, 20), P.rim, [cx, cy + 0.11, cz], yaw, { rotation: [90, 0, 0] });
  // rotating housing
  part(new THREE.CylinderGeometry(0.5, 0.58, 0.28, 8), GRIME, [cx, cy + 0.24, cz], yaw);
  part(new THREE.BoxGeometry(0.9, 0.3, 0.9), HULL, [cx, cy + 0.5, cz], yaw);
  part(new THREE.BoxGeometry(0.94, 0.06, 0.94), HAZ, [cx, cy + 0.38, cz], yaw);
  part(new THREE.BoxGeometry(0.7, 0.08, 0.7), P.plate, [cx, cy + 0.68, cz - 0.05], yaw);

  // operator shield plates
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.06, 0.5, 0.5), P.plate, [cx + s * 0.5, cy + 0.6, cz - 0.2], yaw, { rotation: [0, s * -15, 0] });
    part(new THREE.BoxGeometry(0.02, 0.1, 0.4), P.glass, [cx + s * 0.54, cy + 0.7, cz - 0.2], yaw, { rotation: [0, s * -15, 0] });
  }
  const sh = part(new THREE.BoxGeometry(0.9, 0.55, 0.06), P.plate, [cx, cy + 0.65, cz - 0.5], yaw, { rotation: [-10, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", { bone: yaw, at: [cx, cy + 0.66, cz - 0.54], dir: [0, 0, -1], axis: "z", texture: emblem });
  void sh;

  // warning lights
  for (const s of [1, -1]) {
    glow(part(new THREE.CylinderGeometry(0.04, 0.05, 0.08, 6), P.neonYellow, [cx + s * 0.38, cy + 0.76, cz - 0.4], yaw));
  }
  glow(part(new THREE.BoxGeometry(0.4, 0.03, 0.03), P.neonCyan, [cx, cy + 0.2, cz + 0.55], yaw));

  // pressure tanks
  for (const s of [1, -1]) {
    const tx = cx + s * 0.62;
    part(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 10), P.steel, [tx, cy + 0.45, cz - 0.25], yaw, { rotation: [90, 0, 0] });
    for (const z of [-0.45, -0.05]) part(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 10), P.hazard, [tx, cy + 0.45, cz + z], yaw, { rotation: [90, 0, 0] });
    part(new THREE.SphereGeometry(0.17, 8, 5), P.steel, [tx, cy + 0.45, cz + 0.05], yaw);
    part(new THREE.PlaneGeometry(0.1, 0.2), "#ffffff", { bone: yaw }.bone, [tx + s * 0.175, cy + 0.45, cz - 0.25], { dir: [s, 0, 0], axis: "z", texture: gauge });
    b.rod([tx, cy + 0.5, cz + 0.05], [cx + s * 0.1, cy + 0.62, cz + 0.4], 0.025, P.hullDark, { bone: yaw });
  }

  // cannon cradle + barrel on pitch joint
  const py = cy + 0.4, pz = cz + 0.05;
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.08, 0.28, 0.3), P.plate, [cx + s * 0.2, py, pz], pit);
  part(new THREE.CylinderGeometry(0.13, 0.15, 0.7, 10), GRIME, [cx, py, pz + 0.3], pit, { rotation: [90, 0, 0] });
  part(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 10), P.steel, [cx, py, pz + 0.9], pit, { rotation: [90, 0, 0] });
  for (const z of [0.15, 0.5, 0.95]) part(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), z === 0.5 ? HAZ : P.hullDark, [cx, py, pz + z], pit, { rotation: [90, 0, 0] });
  part(new THREE.CylinderGeometry(0.19, 0.11, 0.25, 10), P.plate, [cx, py, pz + 1.3], pit, { rotation: [90, 0, 0] });
  glow(part(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 10), P.water, [cx, py, pz + 1.43], pit, { rotation: [90, 0, 0] }), 1.6);
  glow(part(new THREE.BoxGeometry(0.03, 0.03, 0.5), P.neonCyan, [cx, py + 0.12, pz + 0.7], pit));
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);

  const plating = paint((p, n) => {
    const base: [number, number, number] = [0.17, 0.19, 0.23];
    const grime = smoothstep(0.55, 0.85, noise(p, 0.12, 4));
    const low = smoothstep(1.9, 1.35, p.y);
    const top = smoothstep(0.3, 0.9, n.y);
    const c = mix(mix(base, [0.3, 0.33, 0.4], top * 0.6), [0.07, 0.07, 0.08], Math.min(1, grime * 0.5 + low * 0.5));
    const scratch = noise(p, 0.02, 9) > 0.78 ? 0.35 : 0;
    return mix(c, [0.6, 0.64, 0.7], scratch);
  });
  const HULL = panelled(plating, { size: 0.4, aspect: 0.8, rivets: 0.1 });

  // main cab body
  const box = (w: number, h: number, d: number, at: number[], color: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });

  box(2.3, 0.7, 2.4, [0, 1.65, 0.65], HULL);
  // tapered roof
  b.frustumBox([0, 1.95, -0.5], [0, 1.95, 1.3], [2.3, 0.3], [2.1, 0.3], { bone, color: HULL });
  b.frustumBox([0, 2.2, -0.45], [0, 2.2, 1.0], [1.9, 0.22], [1.75, 0.22], { bone, color: HULL });
  // sloped windshield frame (wedge) and glass
  b.part(new THREE.BoxGeometry(2.0, 0.08, 0.9), P.hullDark, { bone, at: [0, 2.0, 1.45], rotation: [-32, 0, 0] });

  const glassTex = svg(
    `<svg viewBox="0 0 200 40"><rect width="200" height="40" fill="#0a1d2a"/>
    <path d="M20 40 L50 0 L66 0 L36 40Z" fill="#2ff3ff" opacity="0.28"/>
    <path d="M90 40 L120 0 L128 0 L98 40Z" fill="#ff2bd6" opacity="0.22"/>
    <path d="M150 40 L170 0 L176 0 L156 40Z" fill="#ffffff" opacity="0.15"/>
    <rect x="0" y="0" width="200" height="3" fill="#000" opacity="0.5"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(1.85, 0.3), "#ffffff", { bone, at: [0, 2.02, 1.5], dir: [0, 0.53, 0.85], axis: "z", texture: glassTex });
  // side slit windows
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.2, 0.2), "#ffffff", { bone, at: [s * 1.16, 1.98, 0.6], dir: [s, 0, 0], axis: "z", texture: glassTex });
    b.part(new THREE.BoxGeometry(0.04, 0.26, 1.28), P.hullDark, { bone, at: [s * 1.15, 1.98, 0.6] });
  }
  // rear wall plate
  box(2.3, 1.0, 0.12, [0, 1.8, -0.55], P.plate);

  // corp logo decal
  const logo = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff"/><circle cx="50" cy="50" r="38" fill="#d3162c"/>
    <path d="M50 22 L74 74 L62 74 L50 46 L38 74 L26 74Z" fill="#fff"/><rect x="30" y="78" width="40" height="5" fill="#fff"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone, at: [s * 1.16, 1.55, 0.95], dir: [s, 0, 0], axis: "z", texture: logo });
    // door seams & handles
    box(0.03, 0.62, 0.03, [s * 1.16, 1.6, 0.3], P.hullDark);
    box(0.03, 0.62, 0.03, [s * 1.16, 1.6, 1.4], P.hullDark);
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.2), P.steel, { bone, at: [s * 1.19, 1.68, 0.4] });
    // mirrors
    b.rod([s * 1.16, 1.9, 1.35], [s * 1.5, 1.95, 1.4], 0.025, P.hullDark, { bone });
    b.part(new THREE.BoxGeometry(0.06, 0.28, 0.2), P.hullDark, { bone, at: [s * 1.52, 1.95, 1.4] });
    // hazard edge stripes
    const haz = svg(
      `<svg viewBox="0 0 80 10"><rect width="80" height="10" fill="#f2c200"/><path d="M0 10L10 0H22L12 10ZM24 10L34 0H46L36 10ZM48 10L58 0H70L60 10Z" fill="#111"/></svg>`,
      { size: 128 },
    );
    b.part(new THREE.PlaneGeometry(1.0, 0.12), "#ffffff", { bone, at: [s * 1.165, 1.38, 0.6], dir: [s, 0, 0], axis: "z", texture: haz });
    // spotlights
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.18, 8), P.steel, { bone, at: [s * 0.8, 2.12, 1.1], rotation: [80, 0, 0] });
    glow(b.part(new THREE.CircleGeometry(0.085, 8), "#fff7c0", { bone, at: [s * 0.8, 2.12, 1.2], dir: [0, -0.1, 1], axis: "z" }), 1.4);
  }

  // roof light bars on roofBar
  const [rx, ry, rz] = M.roofBar;
  box(2.0, 0.08, 0.34, [rx, ry - 0.0, rz], P.hullDark);
  glow(box(0.9, 0.1, 0.26, [rx + 0.5, ry + 0.07, rz], P.neonCyan), 1.6);
  glow(box(0.9, 0.1, 0.26, [rx - 0.5, ry + 0.07, rz], P.neonMagenta), 1.6);
  for (const s of [1, -1]) {
    box(0.06, 0.12, 0.36, [s * 1.0, ry + 0.02, rz], P.plate);
    glow(box(0.04, 0.04, 1.6, [s * 1.1, 1.82, 0.6], s > 0 ? P.neonCyan : P.neonMagenta), 1.4);
  }
  glow(box(0.4, 0.03, 0.04, [0, ry + 0.14, rz], P.neonYellow), 1.5);

  // vents
  for (let i = 0; i < 2; i++) {
    box(0.5, 0.06, 0.4, [0.0, 2.34, 0.1 - i * 0.0 - 0.0 + (i ? -0.1 : 0.0)], P.hullDark);
    for (let k = 0; k < 4; k++) box(0.46, 0.02, 0.03, [0, 2.38, -0.05 + k * 0.1 - i * 0.0], P.plate);
    break;
  }
  // antenna cluster
  for (let i = 0; i < 4; i++) {
    const x = -0.8 + R() * 0.3;
    const z = -0.3 + i * 0.1;
    b.spike([x, 2.34, z], [0, 1, 0], 0.4 + i * 0.22, 0.012, { bone, color: P.steel });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), P.hazard, { bone, at: [-0.7, 2.36, -0.3] });
  b.part(new THREE.SphereGeometry(0.07, 6, 4), P.corpRed, { bone, at: [-0.7, 2.44, -0.3] });
  glow(box(0.1, 0.04, 0.1, [0.8, 2.34, -0.3], P.neonYellow), 1.5);
}
```

<!-- call: rearGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildRearGear({ b, J, P, M }: Ctx) {
  const R = rng(9);
  const BODY = J.body;
  const AX = M.axleRear;
  const wheelR = 0.55;

  const grime = paint((p, n) => {
    const base = mix(P.hullDark, P.hull, smoothstep(0.1, 0.9, noise(p, 0.3, 4)));
    const mud = smoothstep(0.7, 0.1, p.y) * 0.6;
    return mix(base, "#3a3226", mud);
  });
  const plated = panelled(grime, { size: 0.25, rivets: 0.06 });
  const tireP = paint((p, n) => mix(P.tire, "#2a2a2e", smoothstep(0.7, 1, noise(p, 0.05, 2)) * 0.6));
  const rimP = metal("steel", { tarnish: 0.3 });

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#111"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const RIM = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#8a93a3" stroke="#222" stroke-width="3"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => `<path d="M50 50 L${50 + 40 * Math.sin((i * Math.PI) / 3)} ${50 - 40 * Math.cos((i * Math.PI) / 3)}" stroke="#2a2d34" stroke-width="9"/>`)
      .join("")}<circle cx="50" cy="50" r="12" fill="#444"/></svg>`,
    { size: 128 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 120 60"><rect width="120" height="60" rx="5" fill="#e8e8e0" stroke="#222" stroke-width="4"/><rect x="4" y="4" width="112" height="12" fill="${P.corpRed}"/><text x="60" y="13" font-size="10" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="bold">ARASAKA SEC</text><text x="60" y="48" font-size="26" text-anchor="middle" fill="#111" font-family="monospace" font-weight="bold">RC-9 077</text></svg>`,
    { size: 256 },
  );
  const LOCK = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="${P.plate}"/><rect x="4" y="4" width="56" height="32" fill="none" stroke="#111" stroke-width="2"/><rect x="26" y="16" width="12" height="8" fill="${P.hazard}"/></svg>`,
    { size: 128 },
  );

  // wheels
  for (const s of [1, -1]) {
    const wj = s > 0 ? J.wheelRL : J.wheelRR;
    const x = s * 1.15;
    const ax: [number, number, number] = [s, 0, 0];
    b.part(new THREE.CylinderGeometry(wheelR, wheelR, 0.5, 14), tireP, { bone: wj, at: [x, wheelR, AX[2]], dir: ax });
    // tread blocks
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.52, 0.06, 0.12), P.tire, {
        bone: wj,
        at: [x, wheelR + Math.cos(a) * (wheelR + 0.01), AX[2] + Math.sin(a) * (wheelR + 0.01)],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 14), rimP, { bone: wj, at: [x + s * 0.26, wheelR, AX[2]], dir: ax });
    b.part(new THREE.CircleGeometry(0.34, 16), "#ffffff", {
      bone: wj,
      at: [x + s * 0.296, wheelR, AX[2]],
      dir: ax,
      axis: "z",
      texture: RIM,
    });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), P.hullDark, { bone: wj, at: [x + s * 0.32, wheelR, AX[2]], dir: ax });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), P.steel, {
        bone: wj,
        at: [x + s * 0.33, wheelR + Math.cos(a) * 0.16, AX[2] + Math.sin(a) * 0.16],
        dir: ax,
      });
    }
    // brake disc
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), P.rim, { bone: wj, at: [x - s * 0.2, wheelR, AX[2]], dir: ax });

    // fender guard (arch) on body
    const fx = s * 1.15;
    b.part(new THREE.BoxGeometry(0.62, 0.1, 1.5), plated, { bone: BODY, at: [fx, 1.2, AX[2]] });
    b.part(new THREE.BoxGeometry(0.62, 0.45, 0.12), plated, { bone: BODY, at: [fx, 1.0, AX[2] + 0.72], rotation: [-25, 0, 0] });
    b.part(new THREE.BoxGeometry(0.62, 0.45, 0.12), plated, { bone: BODY, at: [fx, 1.0, AX[2] - 0.72], rotation: [25, 0, 0] });
    b.part(new THREE.BoxGeometry(0.64, 0.08, 1.52), HAZ ? P.hazard : P.hazard, { bone: BODY, at: [fx, 1.26, AX[2]] });
    b.part(new THREE.PlaneGeometry(1.4, 0.12), "#ffffff", {
      bone: BODY,
      at: [s * 1.47, 1.1, AX[2]],
      dir: [s, 0, 0],
      axis: "z",
      texture: HAZ,
    });
    // mudflap
    b.part(new THREE.BoxGeometry(0.05, 0.4, 0.5), P.hullDark, { bone: BODY, at: [fx, 0.5 + 0.0, AX[2] - 0.8] });
    b.part(new THREE.BoxGeometry(0.06, 0.06, 0.52), P.hazard, { bone: BODY, at: [fx, 0.3, AX[2] - 0.8] });
    // locker
    b.part(new THREE.BoxGeometry(0.25, 0.4, 0.9), plated, { bone: BODY, at: [s * 1.3, 0.95, -1.5] });
    b.part(new THREE.PlaneGeometry(0.85, 0.35), "#ffffff", {
      bone: BODY,
      at: [s * 1.426, 0.95, -1.5],
      dir: [s, 0, 0],
      axis: "z",
      texture: LOCK,
    });
    // tail light
    glow(
      b.part(new THREE.BoxGeometry(0.5, 0.1, 0.06), P.neonMagenta, { bone: BODY, at: [s * 0.85, 0.95, -3.23] }),
      1.6,
    );
    glow(
      b.part(new THREE.BoxGeometry(0.08, 0.3, 0.06), P.neonMagenta, { bone: BODY, at: [s * 1.2, 0.85, -3.23] }),
      1.4,
    );
    // ladder rails
    b.rod([s * 0.4, 0.4, -3.2], [s * 0.4, 1.4, -3.2], 0.025, P.steel, { bone: BODY });
  }
  // ladder rungs
  for (let i = 0; i < 6; i++) b.rod([-0.4, 0.5 + i * 0.16, -3.2], [0.4, 0.5 + i * 0.16, -3.2], 0.02, P.steel, { bone: BODY });

  // rear bumper
  b.part(new THREE.BoxGeometry(2.6, 0.32, 0.3), plated, { bone: BODY, at: [0, 0.55, -3.3] });
  b.part(new THREE.PlaneGeometry(2.5, 0.12), "#ffffff", {
    bone: BODY,
    at: [0, 0.55, -3.455],
    dir: [0, 0, -1],
    axis: "z",
    texture: HAZ,
  });
  b.part(new THREE.BoxGeometry(2.2, 0.08, 0.2), P.hullDark, { bone: BODY, at: [0, 0.35, -3.3] });
  // plate
  b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
    bone: BODY,
    at: [0, 1.0, -3.22],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
  });
  b.part(new THREE.BoxGeometry(0.66, 0.36, 0.03), P.hullDark, { bone: BODY, at: [0, 1.0, -3.2] });
  // tow hooks
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.steel, { bone: BODY, at: [s * 0.6, 0.5, -3.5] });
  }
}
```

<!-- call: frontGear -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildFrontGear({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);

  const hazardPaint = paint((p: any, _n: any, _s: any) => {
    const k = Math.floor((p.x + p.y * 1.0) / 0.12);
    return k % 2 === 0 ? P.hazard : "#16171a";
  });
  const gunmetal = panelled(metal("iron", { tarnish: 0.5 }), { size: 0.22, rivets: 0.05 });
  const tireP = paint((p: any, n: any) => {
    const g = noise(p, 0.05, 3);
    return mix("#101012", "#1e1f24", g * 0.6 + 0.2 * Math.max(0, n.y));
  });

  const rimTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#7b8494" stroke="#14171d" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M50 50 L${50 + 44 * Math.cos((i * Math.PI) / 3 - 0.18)} ${50 + 44 * Math.sin((i * Math.PI) / 3 - 0.18)} L${50 + 44 * Math.cos((i * Math.PI) / 3 + 0.18)} ${50 + 44 * Math.sin((i * Math.PI) / 3 + 0.18)}Z" fill="#b8c0cf" stroke="#14171d" stroke-width="2"/>`).join("")}
    <circle cx="50" cy="50" r="11" fill="#2ff3ff" stroke="#14171d" stroke-width="3"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#14171d" stroke-width="2" stroke-dasharray="3 6"/></svg>`,
    { size: 192 },
  );

  const grilleTex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b0c10"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${3 + i * 4.4}" y="2" width="2.2" height="28" fill="#4a5262"/>`).join("")}</svg>`,
    { size: 128 },
  );

  // Bumper main block
  b.part(new THREE.BoxGeometry(2.5, 0.5, 0.45), gunmetal, { bone: body, at: [0, 0.62, 3.0] });
  // hazard lower lip
  b.part(new THREE.BoxGeometry(2.5, 0.16, 0.5), hazardPaint, { bone: body, at: [0, 0.3, 3.0] });
  // upper wedge plate
  b.part(new THREE.BoxGeometry(2.3, 0.35, 0.3), P.plate, { bone: body, at: [0, 0.98, 2.85], rotation: [-18, 0, 0] });

  // Push bar: angled ram
  const bar = (x1: number, x2: number) => {
    b.rod([x1, 0.35, 3.15], [x2, 0.35, 3.15], 0.07, P.steel, { bone: body });
  };
  bar(-1.2, 1.2);
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 0.3, 3.05], [s * 0.9, 0.95, 2.75], 0.07, P.steel, { bone: body });
    b.rod([s * 0.45, 0.3, 3.1], [s * 0.35, 0.9, 2.85], 0.06, P.steel, { bone: body });
    // tow hooks
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.hazard, { bone: body, at: [s * 0.7, 0.45, 3.24], rotation: [90, 0, 0] });
  }
  b.extrude(
    [[-1.2, 0], [1.2, 0], [0.95, 0.5], [-0.95, 0.5]],
    { at: [0, 0.2, 3.22], x: [1, 0, 0], y: [0, 1, -0.5], thickness: 0.06, color: hazardPaint, bone: body },
  );

  // grille
  b.part(new THREE.PlaneGeometry(1.1, 0.38), "#ffffff", { bone: body, at: [0, 0.65, 3.235], dir: [0, 0, 1], axis: "z", texture: grilleTex });
  b.part(new THREE.BoxGeometry(1.2, 0.46, 0.04), P.hullDark, { bone: body, at: [0, 0.65, 3.215] });

  // neon strip
  glow(b.part(new THREE.BoxGeometry(2.3, 0.04, 0.03), P.neonCyan, { bone: body, at: [0, 0.455, 3.235] }), 2);
  glow(b.part(new THREE.BoxGeometry(2.0, 0.025, 0.03), P.neonCyan, { bone: body, at: [0, 0.88, 3.19] }), 1.6);

  // slit headlights
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.62, 0.12, 0.05), P.hullDark, { bone: body, at: [s * 0.88, 0.7, 3.22] });
    glow(b.part(new THREE.BoxGeometry(0.52, 0.06, 0.04), P.neonMagenta, { bone: body, at: [s * 0.88, 0.7, 3.25] }), 2.2);
    // bumper bolts
    for (let i = 0; i < 3; i++)
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.rim, { bone: body, at: [s * (0.35 + i * 0.4), 0.84, 3.24], rotation: [90, 0, 0] });
  }

  // winch
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), P.steel, { bone: body, at: [0, 0.38, 3.0], rotation: [0, 0, 90] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.18, 0.14), P.hullDark, { bone: body, at: [s * 0.3, 0.38, 3.0] });
  b.rod([0.25, 0.38, 3.0], [0.1, 0.3, 3.3], 0.015, "#111", { bone: body });
  b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), P.hazard, { bone: body, at: [0.08, 0.28, 3.32] });

  // wheels
  for (const s of [1, -1]) {
    const j = s > 0 ? J.wheelFL : J.wheelFR;
    const cx = s * 1.15;
    const X: [number, number, number] = [0, 0, 90];
    const ax = new THREE.Vector3(s, 0, 0);
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.5, 14), tireP, { bone: j, at: [cx, 0.55, 2], rotation: X });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.part(new THREE.BoxGeometry(0.46, 0.06, 0.12), "#08080a", {
        bone: j,
        at: [cx, 0.55 + Math.sin(a) * 0.55, 2 + Math.cos(a) * 0.55],
        rotation: [(-a * 180) / Math.PI + 90 * 0, 0, 0],
      });
    }
    // rim face
    b.part(new THREE.CircleGeometry(0.36, 16), "#ffffff", {
      bone: j, at: [cx + s * 0.26, 0.55, 2], dir: [s, 0, 0], axis: "z", texture: rimTex,
    });
    b.part(new THREE.CylinderGeometry(0.38, 0.38, 0.52, 12), P.rim, { bone: j, at: [cx, 0.55, 2], rotation: X });
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 8), P.steel, { bone: j, at: [cx + s * 0.27, 0.55, 2], rotation: X });
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6), "#14171d", {
        bone: j, at: [cx + s * 0.3, 0.55 + Math.sin(a) * 0.17, 2 + Math.cos(a) * 0.17], rotation: X,
      });
    }
    // brake disc and caliper (inboard)
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 14), P.steel, { bone: j, at: [cx - s * 0.2, 0.55, 2], rotation: X });
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.16), P.corpRed, { bone: body, at: [cx - s * 0.2, 0.8, 2.15] });

    // armored wheel guard (arch)
    b.part(new THREE.BoxGeometry(0.1, 0.12, 1.3), gunmetal, { bone: body, at: [s * 1.32, 1.12, 2] });
    b.part(new THREE.BoxGeometry(0.5, 0.1, 1.3), gunmetal, { bone: body, at: [s * 1.1, 1.17, 2] });
    for (const dz of [-0.7, 0.7]) {
      b.part(new THREE.BoxGeometry(0.46, 0.5, 0.1), gunmetal, { bone: body, at: [s * 1.1, 0.95, 2 + dz], rotation: [dz > 0 ? -20 : 20, 0, 0] });
    }
    b.part(new THREE.BoxGeometry(0.12, 0.08, 1.32), hazardPaint, { bone: body, at: [s * 1.36, 1.0, 2] });
    glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 0.9), P.neonYellow, { bone: body, at: [s * 1.38, 0.88, 2] }), 1.5);
  }

  // front axle
  b.rod([-1.1, 0.55, 2], [1.1, 0.55, 2], 0.08, P.hullDark, { bone: body });
  // suspension arms
  for (const s of [1, -1]) b.rod([s * 0.5, 0.55, 2], [s * 0.9, 0.75, 2.4], 0.04, P.steel, { bone: body });
  void R; void smoothstep;
}
```
<!-- call: plan -->

```json
{
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled armoured carrier with a long electromagnetic railgun on its back, braced on four deployed stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [4.6, 3.2, 10.0],
  "layout": "Faces +Z. Front: a wedge-shaped armoured cab with a sloped glacis, a visor window strip, headlights and a grille, sitting over the front two axles. Middle and rear: a long flat armoured deck carrying a rotating turret ring at the rear third, from which a long railgun (twin rails with glowing cyan coils, a shroud, and a muzzle brake) points forward over the cab, with the muzzle slightly past the nose. Six chunky wheels on three axles (front, middle, rear) with big hubs, tyres and fenders. Four stabiliser legs deployed diagonally outward and down from the hull sides (two near the middle axle, two at the rear), with flat footpads on the floor; they are the widest part of the model at 4.6 m. Low-poly facets throughout. Colours: olive-drab armour with dark grey panels, yellow-black hazard trim on the stabilisers, cyan neon on rail coils and lights. Panelled paints with rivets on the hull; decals (stars, unit number) on the flanks.",
  "palette": {
    "armor": "#4d5a3a",
    "armorDark": "#2f3828",
    "panel": "#3a3f45",
    "steel": "#7b8591",
    "tyre": "#17181a",
    "hub": "#9aa3ad",
    "hazard": "#e7b814",
    "black": "#101113",
    "glassDark": "#1b2a38",
    "neonCyan": "#2ff3ff",
    "lampWhite": "#fff4c8",
    "red": "#c8321f",
    "brass": "#b08a3a"
  },
  "mounts": {
    "deckTop": [0, 1.9, -1.0],
    "cabRoof": [0, 2.5, 3.0],
    "hullFront": [0, 1.4, 4.9],
    "turretRing": [0, 2.0, -2.2],
    "gunPivot": [0, 2.75, -2.0],
    "axleFront": [0, 0.6, 3.4],
    "axleMid": [0, 0.6, 0.2],
    "axleRear": [0, 0.6, -3.0],
    "stabFrontL": [1.7, 1.0, -0.4],
    "stabFrontR": [-1.7, 1.0, -0.4],
    "stabRearL": [1.7, 1.0, -3.6],
    "stabRearR": [-1.7, 1.0, -3.6]
  },
  "joints": [
    { "name": "body", "at": [0, 1.4, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 2.0, -2.2], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gun", "parent": "turret", "at": [0, 2.75, -2.0], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.9, 0.6, 3.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.9, 0.6, 3.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.9, 0.6, 0.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.9, 0.6, 0.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.9, 0.6, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.9, 0.6, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "stabFL", "parent": "body", "at": [1.7, 1.0, -0.4], "dir": [0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabFR", "parent": "body", "at": [-1.7, 1.0, -0.4], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabRL", "parent": "body", "at": [1.7, 1.0, -3.6], "dir": [0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabRR", "parent": "body", "at": [-1.7, 1.0, -3.6], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "stabilisers" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured hull behind the cab: lower tub, flat deck, sloped side skirts, stepped armour plates, rear ramp-door block, engine louvres, tool boxes, grab rails, tow hooks, panelled rivet paint, side decals (star, unit number), turret ring base (low lathe collar) at turretRing.",
      "box": [[-2.0, 0.7, -5.0], [2.0, 2.1, 2.2]],
      "attaches": "Cab meets it at z=2.2; turret sits on turretRing; running gear hangs under it at the axle mounts; stabiliser roots at stab mounts on its flanks.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cabBody",
      "builds": "Armoured cab shell: angular wedge body with sloped roof and glacis, side doors with handles, roof hatch, sensor mast and antenna, roof lamps, mirrors, side armour plates, panel paint, cab floor skirt.",
      "box": [[-1.9, 0.9, 2.2], [1.9, 2.7, 4.6]],
      "attaches": "Rear face on hull at z=2.2; front face meets cabFront at z=4.6; roof at cabRoof.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "cabFront",
      "builds": "Front end: bumper with winch and tow shackles, glowing headlights and cyan running strips, grille with slats, visor window glazing strip with frame and wipers (windshield decals), fog lamps, hazard stripe on bumper, front mudguards over the front wheels, front stabilising skid plate.",
      "box": [[-2.0, 0.55, 4.6], [2.0, 2.4, 5.2]],
      "attaches": "Joins cabBody at z=4.6; front fenders reach back toward axleFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "wheels",
      "builds": "Six wheels on three axles: faceted tyres with tread blocks, hubs with lug nuts and cap decals, brake discs, axle beams and suspension arms with dampers and coil springs, fender arches over the middle and rear wheels, mud flaps. Each wheel on its wheel joint.",
      "box": [[-2.3, 0.0, -3.7], [2.3, 1.3, 4.1]],
      "attaches": "Axle beams join the hull underside at axleFront, axleMid, axleRear; wheel joints at axle ends. Lowest points rest on y=0.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs: a hinge mount block on each flank, a thick hydraulic main strut angled outward and down, a sleeve with piston rod, a diagonal brace, a wide flat octagonal footpad with ribs and hazard yellow-black striping, warning decals. Footpads rest at y=0 at roughly x=±2.3.",
      "box": [[-2.3, 0.0, -4.3], [2.3, 1.3, 0.3]],
      "attaches": "Roots at the four stab mounts on the hull flanks; feet on the floor.",
      "joints": ["stabFL", "stabFR", "stabRL", "stabRR"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "turret",
      "builds": "Rotating turret base on the ring: faceted armoured housing with sloped sides, capacitor banks (side cylinders with cyan glowing bands), cooling fins, cable runs, access hatches, power conduits, side sensor pod, ammo magazine box on the back, panelled paint, hazard accents. Cradle with trunnion blocks at gunPivot.",
      "box": [[-1.8, 1.9, -4.2], [1.8, 3.3, -0.4]],
      "attaches": "Sits on turretRing; cradle holds the gun at gunPivot.",
      "joints": ["turret"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "railgun",
      "builds": "Long railgun on the gun joint: breech block, twin parallel rails of steel with insulator spacers, glowing cyan coil rings along the barrel (glow kit), outer shroud plates, recoil dampers, a muzzle brake with vents, a laser sight, and rail-end energy tips. Barrel runs from z=-3.2 to z=5.0 at gunPivot height, centred x=0.",
      "box": [[-0.6, 2.3, -3.3], [0.6, 3.3, 5.0]],
      "attaches": "Mounted in the turret cradle at gunPivot; passes above the cab roof.",
      "joints": ["gun"],
      "floor": false,
      "budget": 100
    }
  ]
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, rng, glow, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildTurret({ b, J, P, M }: any) {
  const bone = J.turret;
  const R = rng(11);
  const hull = panelled(P.armor, { size: 0.5, rivets: 0.1 });
  const dark = panelled(P.panel, { size: 0.4, rivets: 0.12 });
  const steel = metal("steel");
  const g = glowKit ?? glow;
  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, rotation: rot, flat: true });

  // base ring collar
  cyl(1.5, 1.6, 0.2, 12, dark, [0, 2.05, -2.2]);
  // main housing: lower block, sloped upper block
  b.lathe(
    [[0, 0], [1.55, 0], [1.45, 0.5], [1.1, 0.95], [0, 0.95]],
    { at: [0, 2.15, -2.2], segments: 8, spin: 22.5, color: hull, bone },
  );
  box(2.4, 0.5, 2.2, hull, [0, 2.9, -2.1]);
  // sloped side armour
  for (const s of [1, -1]) {
    box(0.18, 0.9, 2.6, dark, [s * 1.35, 2.55, -2.2], [0, 0, -s * 14]);
    box(0.25, 0.3, 1.4, P.hazard, [s * 1.0, 3.18, -1.5]);
  }
  // front mantlet and trunnions
  box(1.5, 0.7, 0.5, dark, [0, 2.75, -1.1]);
  for (const s of [1, -1]) {
    box(0.4, 0.6, 0.5, P.steel, [s * 0.55, 2.75, -1.75]);
    cyl(0.14, 0.14, 0.5, 8, steel, [s * 0.55, 2.75, -1.75], [0, 0, 90]);
  }
  // capacitor banks with cyan bands
  for (const s of [1, -1]) {
    cyl(0.4, 0.4, 2.0, 10, P.panel, [s * 1.2, 3.0, -2.5], [90, 0, 0]);
    for (let i = 0; i < 4; i++) {
      g(cyl(0.43, 0.43, 0.1, 10, P.neonCyan, [s * 1.2, 3.0, -3.2 + i * 0.5], [90, 0, 0]), 1.6);
    }
    cyl(0.3, 0.3, 0.05, 10, P.steel, [s * 1.2, 3.0, -1.47], [90, 0, 0]);
  }
  // cooling fins on the roof rear
  for (let i = 0; i < 8; i++) box(1.6, 0.35, 0.06, steel, [0, 3.25, -3.6 + i * 0.16]);
  // ammo magazine box on back
  box(2.0, 1.0, 0.9, P.armorDark, [0, 2.7, -3.75]);
  box(1.8, 0.1, 0.7, P.hazard, [0, 3.24, -3.75]);
  for (const s of [1, -1]) box(0.08, 0.7, 0.08, P.steel, [s * 0.6, 2.7, -4.22]);
  // hatches
  for (const s of [1, -1]) {
    cyl(0.28, 0.3, 0.1, 8, dark, [s * 0.5, 3.2, -2.6]);
    cyl(0.06, 0.06, 0.1, 6, P.steel, [s * 0.5, 3.27, -2.6]);
  }
  // cables / conduits
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.9, 3.25, -3.3], [s * 0.7, 3.4, -2.6], [s * 0.4, 3.3, -1.8], [s * 0.3, 3.0, -1.4]],
      0.045,
      { bone, color: P.black, sides: 6 },
    );
    b.sweep(
      [[s * 1.2, 2.6, -1.5], [s * 1.0, 2.5, -1.3], [s * 0.7, 2.7, -1.2]],
      0.04,
      { bone, color: P.brass, sides: 6 },
    );
  }
  // sensor pod on left side
  box(0.35, 0.4, 0.5, P.panel, [1.85, 2.9, -2.0]);
  cyl(0.12, 0.12, 0.1, 8, P.glassDark, [1.85, 2.9, -1.72], [90, 0, 0]);
  g(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, { bone, at: [1.85, 3.15, -2.0] }), 2);
  // hazard accents on sides
  for (const s of [1, -1]) {
    const tex = svg(
      `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 16L16 0H32L16 16ZM32 16L48 0H64L48 16Z" fill="#101113"/></svg>`,
      { size: 128 },
    );
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", {
      bone, at: [s * 1.57, 2.45, -1.2], dir: [s, 0, 0], axis: "z", texture: tex,
    });
  }
  // warning light
  g(b.part(new THREE.SphereGeometry(0.08, 6, 4), P.red, { bone, at: [-0.9, 3.3, -3.3] }), 1.5);
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildHull({ b, J, P, M }: any) {
  const body = J.body;
  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const ARMOR = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const k = noise(p, 0.5, 3);
      const base = mix(P.armor, P.armorDark, smoothstep(0.35, 0.8, k) * 0.6);
      return n.y > 0.7 ? mix(base, "#6a7850", 0.25) : base;
    }),
    { size: 0.5, rivets: 0.12 },
  );
  const box = (w: number, h: number, d: number, at: number[], color: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, rotation: rot, flat: true });

  // lower tub
  box(3.4, 0.8, 7.0, [0, 1.1, -1.4], ARMOR);
  // deck
  box(3.8, 0.3, 7.0, [0, 1.85, -1.4], ARMOR);
  // sloped skirts (both sides)
  for (const s of [1, -1]) {
    box(0.25, 0.9, 6.8, [s * 1.85, 1.35, -1.4], P.armorDark, [0, 0, s * 18]);
    box(0.12, 0.35, 6.4, [s * 1.97, 1.0, -1.4], P.panel);
    // stepped plates on top
    box(0.5, 0.18, 5.6, [s * 1.45, 2.04, -1.7], P.panel);
    box(0.3, 0.14, 4.2, [s * 1.6, 2.15, -1.5], P.armorDark);
    // grab rails
    for (const z of [1.4, -4.2]) b.rod([s * 2.05, 1.7, z + 0.6], [s * 2.05, 1.7, z - 0.6], 0.03, P.steel, { bone: body });
    for (const z of [-1.9, -2.5, 0.9]) b.rod([s * 2.0, 1.65, z], [s * 2.1, 1.7, z], 0.025, P.steel, { bone: body });
    // tool boxes
    box(0.4, 0.35, 1.0, [s * 2.05, 1.35, 1.0], P.panel);
    box(0.42, 0.06, 1.04, [s * 2.05, 1.55, 1.0], P.hazard);
    box(0.4, 0.3, 0.7, [s * 2.05, 1.3, -3.0], P.armorDark);
  }
  // rear ramp-door block
  box(3.0, 1.2, 0.2, [0, 1.35, -4.95], P.panel);
  box(2.6, 0.9, 0.08, [0, 1.35, -5.02], P.armorDark);
  for (const y of [1.0, 1.7]) box(2.6, 0.06, 0.1, [0, y, -5.04], P.hazard);
  box(0.1, 0.9, 0.1, [0, 1.35, -5.08], P.steel);
  // engine louvres
  for (let i = 0; i < 8; i++) box(1.3, 0.05, 0.12, [0, 2.05 + 0.02, 0.4 + i * 0.22 - 0.9 + 0.8], P.black, [20, 0, 0]);
  for (let i = 0; i < 8; i++) box(1.5, 0.05, 0.1, [0, 2.05, 0.1 + i * 0.2], P.black);
  // tow hooks
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 1.3, 1.0, -5.05], [s * 1.3, 0.85, -5.35], [s * 1.3, 1.1, -5.4]],
      0.045,
      { bone: body, color: P.steel },
    );
    box(0.2, 0.2, 0.15, [s * 1.3, 1.0, -5.0], P.steel);
  }
  // turret ring collar (lathe)
  b.lathe(
    [[0, 0], [1.3, 0], [1.3, 0.1], [1.15, 0.22], [0, 0.22]],
    { at: [0, 1.99, -2.2], bone: body, color: P.steel, segments: 16 },
  );
  b.lathe(
    [[1.1, 0.2], [1.25, 0.2], [1.25, 0.28], [1.1, 0.28]],
    { at: [0, 2.0, -2.2], bone: body, color: P.hazard, segments: 16 },
  );
  // front bulkhead meeting cab
  box(3.2, 0.7, 0.15, [0, 1.7, 2.1], P.panel);

  // decals
  const star = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#101113" opacity="0.6"/><path d="M50 8 L61 38 L93 38 L67 57 L77 88 L50 69 L23 88 L33 57 L7 38 L39 38Z" fill="#e8e8d8"/></svg>`,
    { size: 128 },
  );
  const num = svg(
    `<svg viewBox="0 0 120 60"><text x="60" y="48" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="52" fill="#e8e8d8">07</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const x = s * 1.73;
    const flip = s > 0 ? 1 : -1;
    b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
      bone: body, at: [x + s * 0.01, 1.2, 0.2], dir: [s, 0, 0], axis: "z", texture: star,
    });
    b.part(new THREE.PlaneGeometry(1.2, 0.6), "#ffffff", {
      bone: body, at: [x + s * 0.01, 1.2, -1.6], dir: [s, 0, 0], axis: "z", texture: num,
    });
    void flip;
  }
  void V; void M; void metal;
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRailgun({ b, J, P, M }: Ctx) {
  const G = J.gun;
  const Y = M.gunPivot[1];
  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: G, at: [x, Y + y, z], ...extra });
  const cyl = (r: number, len: number, col: any, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), col, { bone: G, at: [x, Y + y, z], dir: [0, 0, 1] });

  const steelPaint = paint((p, n) => {
    const t = noise(p, 0.3, 4);
    const c = mix(P.steel, "#5a636e", t * 0.6);
    return n.y > 0.5 ? mix(c, "#b7c1cc", 0.3) : c;
  });
  const shroudPaint = paint((p, n) => {
    const seam = Math.abs(((p.z * 2.5) % 1) - 0.5) > 0.47;
    const base = mix(P.panel, P.armorDark, noise(p, 0.5, 2));
    return seam ? mix(base, "#101113", 0.7) : n.y > 0.6 ? mix(base, P.steel, 0.15) : base;
  });

  // breech block
  box(0.9, 0.75, 1.1, shroudPaint, 0, 0, -2.75);
  box(0.7, 0.55, 0.5, P.armorDark, 0, 0.05, -3.2);
  box(0.5, 0.2, 0.7, P.panel, 0, 0.47, -2.7);
  // cradle trunnions
  for (const s of [1, -1]) {
    cyl(0.1, 0.3, P.brass, s * 0.5, 0, -2.0, 8).mesh.rotation.z += 0;
    box(0.14, 0.4, 0.5, P.panel, s * 0.52, -0.05, -2.0);
    // recoil dampers
    cyl(0.07, 1.6, P.steel, s * 0.42, -0.38, -1.7);
    cyl(0.11, 0.8, P.armorDark, s * 0.42, -0.38, -2.3);
    box(0.1, 0.2, 0.1, P.brass, s * 0.42, -0.2, -1.0);
  }

  // twin rails
  for (const s of [1, -1]) {
    box(0.16, 0.34, 7.6, steelPaint, s * 0.22, 0, 1.2);
    box(0.06, 0.2, 7.6, P.hub, s * 0.31 * 1, 0.02, 1.2);
    // energy tip
    glow(
      b.part(new THREE.ConeGeometry(0.09, 0.22, 6), P.neonCyan, {
        bone: G,
        at: [s * 0.22, Y, 5.0],
        dir: [0, 0, 1],
      }),
      1.8,
    );
  }

  // insulator spacers
  const insul = [-1.9, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0, 4.7];
  for (const z of insul) box(0.56, 0.2, 0.12, P.black, 0, 0, z);

  // glowing coil rings
  for (let i = 0; i < 9; i++) {
    const z = -1.5 + i * 0.62;
    const ring = b.part(new THREE.TorusGeometry(0.4, 0.045, 5, 8), P.neonCyan, { bone: G, at: [0, Y, z] });
    glow(ring, 1.6);
    box(0.1, 0.1, 0.1, P.panel, 0, 0.43, z);
    box(0.1, 0.1, 0.1, P.panel, 0, -0.43, z);
  }

  // shroud plates (top and sides)
  for (let i = 0; i < 4; i++) {
    const z = -1.3 + i * 1.5;
    box(0.7, 0.07, 1.3, shroudPaint, 0, 0.5, z);
    for (const s of [1, -1]) box(0.07, 0.4, 1.3, shroudPaint, s * 0.5, 0.0, z);
  }
  // hazard bands
  const haz = paint((p) => (Math.floor((p.x + p.z) * 12) % 2 ? P.hazard : P.black));
  box(0.72, 0.09, 0.28, haz, 0, 0.55, -0.2);
  box(0.72, 0.09, 0.28, haz, 0, 0.55, 3.4);

  // muzzle brake
  box(0.8, 0.6, 0.9, P.panel, 0, 0, 4.45);
  box(0.9, 0.12, 0.9, P.armorDark, 0, 0.36, 4.45);
  box(0.9, 0.12, 0.9, P.armorDark, 0, -0.36, 4.45);
  for (let i = 0; i < 3; i++) {
    for (const s of [1, -1]) box(0.04, 0.38, 0.14, P.black, s * 0.41, 0, 4.15 + i * 0.3);
    box(0.4, 0.04, 0.14, P.black, 0, 0.31, 4.15 + i * 0.3);
  }
  glow(box(0.3, 0.14, 0.05, P.neonCyan, 0, 0, 4.92), 1.8);

  // laser sight
  box(0.12, 0.12, 0.4, P.black, 0.62 - 0.06, 0.3, 3.8);
  cyl(0.04, 0.5, P.black, 0.56, 0.3, 4.1, 6);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.red, { bone: G, at: [0.56, Y + 0.3, 4.38] }), 2);

  // cable run
  box(0.08, 0.08, 4, P.black, -0.3, 0.58, 1.0);
}
```

<!-- call: cabFront -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabFront({ b, J, P }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot, flat: true });

  const armor = paint((p, n) => {
    const v = noise(p, 0.3, 4);
    const base = mix("#4d5a3a", "#3c472d", v);
    return mix(base, "#2f3828", n.y < -0.3 ? 0.5 : 0);
  });

  // front nose plate (sloped) and upper armour
  box(3.9, 0.9, 0.1, armor, [0, 1.15, 5.12], [-12, 0, 0]);
  box(3.7, 0.5, 0.12, P.panel, [0, 1.8, 5.05], [-20, 0, 0]);

  // bumper
  box(4.0, 0.3, 0.22, P.panel, [0, 0.72, 5.08]);
  const stripeTex = svg(
    `<svg viewBox="0 0 80 8"><rect width="80" height="8" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((i) => `<path d="M${i * 10} 8 L${i * 10 + 5} 0 L${i * 10 + 10} 0 L${i * 10 + 5} 8Z" fill="#101113"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(3.8, 0.2), "#ffffff", { bone, at: [0, 0.74, 5.2], dir: [0, 0, 1], axis: "z", texture: stripeTex });

  // skid plate
  box(2.6, 0.08, 0.5, P.steel, [0, 0.58, 5.0], [8, 0, 0]);

  // grille with slats
  box(1.8, 0.55, 0.05, P.black, [0, 1.25, 5.19]);
  for (let i = 0; i < 6; i++) box(1.7, 0.04, 0.06, P.steel, [0, 1.03 + i * 0.09, 5.21]);
  box(1.9, 0.04, 0.07, P.steel, [0, 1.55, 5.21]);

  // winch
  cyl(0.1, 0.1, 1.0, 8, P.steel, [0, 0.95, 5.1], [0, 0, 90]);
  cyl(0.13, 0.13, 0.08, 8, P.hazard, [-0.5, 0.95, 5.1], [0, 0, 90]);
  cyl(0.13, 0.13, 0.08, 8, P.hazard, [0.5, 0.95, 5.1], [0, 0, 90]);
  b.sweep([[0.2, 0.95, 5.18], [0.2, 0.8, 5.28], [0, 0.78, 5.3]], 0.018, { color: P.black, bone });

  // tow shackles
  for (const s of [1, -1]) {
    box(0.18, 0.12, 0.12, P.steel, [s * 1.5, 0.72, 5.22]);
    b.sweep(
      [[s * 1.5, 0.72, 5.28], [s * 1.5 + 0.1, 0.6, 5.34], [s * 1.5, 0.5, 5.34], [s * 1.5 - 0.1, 0.6, 5.34], [s * 1.5, 0.72, 5.28]],
      0.02, { color: P.red, bone },
    );
  }

  // headlights, fog lamps, cyan strips
  for (const s of [1, -1]) {
    glow(box(0.5, 0.26, 0.08, P.lampWhite, [s * 1.4, 1.6, 5.1]), 1.5);
    box(0.62, 0.36, 0.05, P.black, [s * 1.4, 1.6, 5.07]);
    glow(cyl(0.09, 0.09, 0.06, 8, P.lampWhite, [s * 1.55, 0.95, 5.2], [90, 0, 0]), 1.2);
    glow(box(0.6, 0.05, 0.06, P.neonCyan, [s * 1.4, 1.38, 5.16]), 1.6);
    glow(box(0.05, 0.4, 0.06, P.neonCyan, [s * 0.98, 1.25, 5.2]), 1.6);
  }
  glow(box(1.6, 0.04, 0.05, P.neonCyan, [0, 0.9, 5.22]), 1.6);

  // visor window strip
  box(3.2, 0.52, 0.06, P.black, [0, 2.2, 4.82], [-28, 0, 0]);
  box(3.0, 0.4, 0.05, P.glassDark, [0, 2.2, 4.86], [-28, 0, 0]);
  const glass = svg(
    `<svg viewBox="0 0 120 20"><path d="M0 20 L25 0 L40 0 L15 20Z M50 20 L75 0 L82 0 L57 20Z" fill="#ffffff" opacity="0.28"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(3.0, 0.4), "#ffffff", { bone, at: [0, 2.2, 4.875], rotation: [-28, 0, 0], axis: "z", texture: glass });
  for (const x of [-1.0, 0, 1.0]) box(0.06, 0.44, 0.07, P.armorDark, [x, 2.2, 4.83], [-28, 0, 0]);
  // wipers
  for (const x of [-0.7, 0.5]) box(0.7, 0.025, 0.03, P.black, [x, 2.05, 4.9], [-28, 0, 8]);

  // mudguards over front wheels
  for (const s of [1, -1]) {
    box(0.7, 0.1, 1.5, armor, [s * 1.75, 1.3, 4.5]);
    box(0.7, 0.1, 0.4, armor, [s * 1.75, 1.2, 5.15], [-25, 0, 0]);
    box(0.08, 0.4, 1.5, armorDarkFix(P), [s * 2.08, 1.1, 4.5]);
    box(0.4, 0.3, 0.03, P.black, [s * 1.9, 0.7, 4.0]);
  }
}

function armorDarkFix(P: any) {
  return P.armorDark;
}
```

<!-- call: cabBody -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabBody({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const hull = panelled(
    paint((p: any, n: any) => {
      const base = mix(P.armor, P.armorDark, 0.5 * smoothstep(0.3, 0.8, noise(p, 0.5, 3)));
      return mix(base, "#5d6b47", 0.35 * smoothstep(0.5, 1, n.y));
    }),
    { size: 0.5, rivets: 0.1 },
  );
  const dark = panelled(P.panel, { size: 0.4, rivets: 0.12 });

  // Wedge body: extruded side profile (z, y), thickness across x.
  const prof: any[] = [
    [2.2, 0.95],
    [4.6, 0.95],
    [4.6, 1.75],
    [4.0, 2.15],
    [3.0, 2.6],
    [2.2, 2.7],
  ];
  b.extrude(prof, { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 3.5, color: hull, bone, name: "cabWedge" });
  // Roof slab and glacis plate
  b.part(new THREE.BoxGeometry(2.8, 0.1, 1.3), dark, { bone, at: [0, 2.68, 2.85], name: "cabRoof" });
  b.part(new THREE.BoxGeometry(3.0, 0.06, 1.0), P.armorDark, {
    bone, at: [0, 1.96, 4.3], rotation: [-38, 0, 0], name: "glacisPlate",
  });
  // Floor skirt
  b.part(new THREE.BoxGeometry(3.7, 0.12, 2.4), P.armorDark, { bone, at: [0, 0.96, 3.4], name: "cabSkirt" });

  // visor window strip on slope + frame
  b.part(new THREE.BoxGeometry(2.6, 0.04, 0.5), P.glassDark, {
    bone, at: [0, 2.35, 3.55], rotation: [-35, 0, 0], flat: true, name: "visor",
  });
  b.part(new THREE.BoxGeometry(2.76, 0.03, 0.06), P.black, { bone, at: [0, 2.5, 3.33], rotation: [-35, 0, 0] });
  b.part(new THREE.BoxGeometry(2.76, 0.03, 0.06), P.black, { bone, at: [0, 2.2, 3.77], rotation: [-35, 0, 0] });

  const star = svg(
    `<svg viewBox="0 0 64 64"><polygon points="32,6 39,25 59,25 43,37 49,57 32,45 15,57 21,37 5,25 25,25" fill="#e8e8d8" stroke="#101113" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const x = s * 1.76;
    // doors
    b.part(new THREE.BoxGeometry(0.06, 0.95, 1.1), P.armorDark, { bone, at: [x, 1.6, 3.2], flat: true, name: "door" });
    b.part(new THREE.BoxGeometry(0.06, 0.28, 0.7), P.glassDark, { bone, at: [s * 1.8, 1.95, 3.25], name: "doorWin" });
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.22), P.steel, { bone, at: [s * 1.82, 1.5, 2.8], name: "handle" });
    // armour plates
    b.part(new THREE.BoxGeometry(0.12, 0.5, 1.2), dark, { bone, at: [s * 1.82, 1.25, 3.9], name: "sidePlate" });
    b.part(new THREE.BoxGeometry(0.12, 0.35, 0.8), dark, { bone, at: [s * 1.82, 2.3, 2.6], name: "sidePlateUp" });
    b.part(new THREE.PlaneGeometry(0.45, 0.45), "#ffffff", {
      bone, at: [s * 1.89, 1.25, 3.9], dir: [s, 0, 0], axis: "z", texture: star, name: "star",
    });
    // mirrors
    b.rod([s * 1.8, 2.1, 4.0], [s * 2.0, 2.2, 4.1], 0.025, P.black, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.06, 0.28, 0.2), P.black, { bone, at: [s * 2.02, 2.2, 4.1], name: "mirror" });
    // roof lamps
    const lamp = b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.1, 8), P.lampWhite, {
      bone, at: [s * 0.9, 2.78, 3.5], name: "roofLamp",
    });
    glow(lamp, 1.4);
    b.part(new THREE.BoxGeometry(0.2, 0.06, 0.16), P.black, { bone, at: [s * 0.9, 2.74, 3.42] });
  }

  // roof hatch
  b.lathe([[0, 0], [0.4, 0], [0.38, 0.08], [0.3, 0.1], [0, 0.1]], {
    at: [0.5, 2.73, 2.8], segments: 8, color: P.armorDark, bone, name: "hatch",
  });
  b.part(new THREE.TorusGeometry(0.12, 0.02, 4, 8), P.steel, { bone, at: [0.5, 2.85, 2.8], rotation: [90, 0, 0] });

  // sensor mast
  b.rod([-0.7, 2.73, 2.9], [-0.7, 3.2, 2.9], [0.05, 0.035], P.panel, { bone, sides: 6, name: "mast" });
  b.part(new THREE.BoxGeometry(0.3, 0.14, 0.18), P.black, { bone, at: [-0.7, 3.2, 2.9], name: "sensor" });
  const lens = b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.neonCyan, {
    bone, at: [-0.7, 3.2, 3.0], dir: [0, 0, 1], name: "sensorLens",
  });
  glow(lens, 1.5);
  b.rod([-1.1, 2.73, 2.5], [-1.2, 3.35, 2.35], [0.015, 0.006], P.black, { bone, sides: 5, name: "antenna" });
  b.part(new THREE.SphereGeometry(0.03, 5, 4), P.red, { bone, at: [-1.2, 3.37, 2.35] });

  // rivet roof ribs
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(2.6, 0.04, 0.05), P.panel, { bone, at: [0, 2.74, 2.4 + i * 0.3 + R() * 0.02] });
  // hazard trim at rear edge
  b.part(new THREE.BoxGeometry(3.2, 0.05, 0.08), P.hazard, { bone, at: [0, 2.74, 2.25], name: "hazard" });
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheels({ b, J, P, M }: any) {
  const R = 0.6; // tyre radius
  const W = 0.5; // tyre width
  const r = rng(11);

  const tyrePaint = paint((p, n) => {
    const d = noise(p, 0.12, 3);
    const c = mix("#101113", "#2a2b2e", smoothstep(0.4, 0.8, d) * 0.7);
    return mix(c, "#3a3a3a", Math.max(0, n.y) * 0.25);
  });
  const hubPaint = paint((p, n) => mix(P.hub, "#59616b", smoothstep(0.4, 0.8, noise(p, 0.05, 5)) * 0.6 + (n.y < 0 ? 0.15 : 0)));
  const armorPaint = paint((p, n) => mix(P.armor, P.armorDark, smoothstep(0.4, 0.75, noise(p, 0.15, 8)) * 0.6 + (n.y < -0.3 ? 0.2 : 0)));

  const cap = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2b3036" stroke="#101113" stroke-width="3"/><circle cx="32" cy="32" r="20" fill="none" stroke="#9aa3ad" stroke-width="3"/><path d="M32 10 L38 32 L32 54 L26 32Z" fill="#e7b814"/><circle cx="32" cy="32" r="5" fill="#101113"/></svg>`, { size: 128 });

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 3.4], ["wheelFR", -1, 3.4],
    ["wheelML", 1, 0.2], ["wheelMR", -1, 0.2],
    ["wheelRL", 1, -3], ["wheelRR", -1, -3],
  ];

  // axle beams and differentials
  for (const z of [3.4, 0.2, -3]) {
    b.rod([-1.65, R, z], [1.65, R, z], 0.1, P.steel, { bone: J.body, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 8), P.panel, { bone: J.body, at: [0, R, z], dir: [0, 0, 1] });
    b.part(new THREE.BoxGeometry(0.9, 0.2, 0.3), P.armorDark, { bone: J.body, at: [0, R + 0.2, z] });
    // leaf-spring / suspension cross-arms
    for (const s of [1, -1]) {
      b.rod([s * 0.5, R + 0.1, z], [s * 1.4, R + 0.1, z + 0.35], 0.05, P.steel, { bone: J.body, sides: 6 });
      b.rod([s * 0.5, R + 0.1, z], [s * 1.4, R + 0.1, z - 0.35], 0.05, P.steel, { bone: J.body, sides: 6 });
      // damper
      b.rod([s * 1.25, R + 0.05, z], [s * 1.25, R + 0.7, z + 0.1], 0.055, P.black, { bone: J.body, sides: 6 });
      b.rod([s * 1.25, R + 0.35, z + 0.03], [s * 1.25, R + 0.7, z + 0.1], 0.075, P.hazard, { bone: J.body, sides: 6 });
      // spring
      const a = new THREE.Vector3(s * 1.0, R + 0.1, z), c = new THREE.Vector3(s * 1.0, R + 0.75, z);
      const pts: number[][] = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, ang = t * Math.PI * 2 * 5;
        pts.push([a.x + Math.cos(ang) * 0.08, a.y + (c.y - a.y) * t, a.z + Math.sin(ang) * 0.08]);
      }
      b.sweep(pts, 0.015, P.brass, { bone: J.body, sides: 4, skin: "rigid" });
    }
  }

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const xc = s * 1.9;
    const axisDir: [number, number, number] = [s, 0, 0];
    // tyre
    b.part(new THREE.CylinderGeometry(R, R, W, 12), tyrePaint, { bone: j, at: [xc, R, z], dir: axisDir, flat: true });
    // sidewall bevel rings
    b.part(new THREE.CylinderGeometry(R * 0.82, R * 0.9, 0.08, 12), P.tyre, { bone: j, at: [xc + s * (W / 2), R, z], dir: axisDir, flat: true });
    b.part(new THREE.CylinderGeometry(R * 0.82, R * 0.9, 0.08, 12), P.tyre, { bone: j, at: [xc - s * (W / 2), R, z], dir: axisDir, flat: true });
    // tread blocks
    const blocks: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      for (const o of [-0.13, 0.13]) {
        const g = new THREE.BoxGeometry(0.2, 0.07, 0.2);
        g.rotateZ(-0);
        const m = new THREE.Matrix4().makeRotationX(a);
        g.applyMatrix4(m);
        g.translate(o, Math.cos(a) * R, Math.sin(a) * R);
        // box long axis on x -> local; tangent handled by rotation
        blocks.push(g);
      }
    }
    // merge manually
    const merged = mergeG(blocks);
    merged.translate(xc, R, z);
    b.part(merged, P.black, { bone: j, at: [0, 0, 0] });
    // hub
    const outer = xc + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.1, 10), hubPaint, { bone: j, at: [outer, R, z], dir: axisDir, flat: true });
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 10), hubPaint, { bone: j, at: [outer + s * 0.08, R, z], dir: axisDir, flat: true });
    b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", { bone: j, at: [outer + s * 0.15, R, z], dir: axisDir, axis: "z", texture: cap });
    // lug nuts
    const lugs: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 6);
      g.rotateZ(Math.PI / 2);
      g.translate(0, Math.cos(a) * 0.29, Math.sin(a) * 0.29);
      lugs.push(g);
    }
    const lm = mergeG(lugs);
    lm.translate(outer + s * 0.06, R, z);
    b.part(lm, P.steel, { bone: j, at: [0, 0, 0] });
    // brake disc (inboard)
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12), P.steel, { bone: j, at: [xc - s * 0.18, R, z], dir: axisDir, flat: true });
    // brake caliper
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.16), P.red, { bone: j, at: [xc - s * 0.18, R + 0.27, z] });
    // stub axle
    b.rod([xc - s * 0.45, R, z], [xc, R, z], 0.08, P.steel, { bone: j, sides: 8 });
  }

  // fenders: middle & rear arches (front ones belong to cabFront)
  for (const z of [0.2, -3]) for (const s of [1, -1]) {
    const x0 = s * 1.9;
    const pts: number[][] = [];
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI * (0.05 + 0.9 * i / 8);
      pts.push([x0, R + Math.sin(a) * (R + 0.14), z + Math.cos(a) * (R + 0.22)]);
    }
    const arch = b.sweep(pts, { radius: (t: number) => [0.31, 0.04], color: armorPaint, bone: J.body, section: "box", caps: "flat" });
    // rim lip
    b.rod([x0, R + R + 0.14, z - 0.5], [x0, R + R + 0.14, z + 0.5], 0.05, P.armorDark, { bone: J.body, sides: 4 });
    // mud flap
    b.part(new THREE.BoxGeometry(0.5, 0.45, 0.04), P.tyre, { bone: J.body, at: [x0, 0.38, z - R - 0.32] });
    b.part(new THREE.BoxGeometry(0.5, 0.08, 0.05), P.hazard, { bone: J.body, at: [x0, 0.2, z - R - 0.32] });
    b.part(new THREE.BoxGeometry(0.56, 0.05, 0.08), P.steel, { bone: J.body, at: [x0, 0.62, z - R - 0.3] });
  }

  // glowing cyan marker on rear fenders
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.12, 0.06, 0.04), P.neonCyan, { bone: J.body, at: [s * 2.0, 1.15, -3 - R - 0.3] }), 1.4);
  }

  function mergeG(list: THREE.BufferGeometry[]) {
    const pos: number[] = [], idx: number[] = [];
    let off = 0;
    for (const g of list) {
      const ng = g.index ? g : g;
      const p = ng.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      if (ng.index) for (let i = 0; i < ng.index.count; i++) idx.push(ng.index.getX(i) + off);
      else for (let i = 0; i < p.count; i++) idx.push(i + off);
      off += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute("uv", new THREE.Float32BufferAttribute(new Array(off * 2).fill(0), 2));
    m.setIndex(idx);
    m.computeVertexNormals();
    return m;
  }
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, aim, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildStabilisers({ b, J, P }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const hazardTex = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e7b814"/>
    <path d="M-8 24 L24 -8 L40 -8 L-8 40Z M-8 56 L56 -8 L72 -8 L-8 72Z M24 72 L72 24 L72 40 L40 72Z" fill="#101113"/></svg>`,
    { size: 128 },
  );
  const warnTex = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L62 58 L2 58Z" fill="#e7b814" stroke="#101113" stroke-width="5" stroke-linejoin="round"/>
    <rect x="29" y="20" width="6" height="22" fill="#101113"/><rect x="29" y="46" width="6" height="7" fill="#101113"/></svg>`,
    { size: 128 },
  );

  const wornSteel = paint((p, n) => {
    const t = noise(p, 0.15, 3);
    const c = mix(P.steel, P.panel, smoothstep(0.3, 0.8, t) * 0.6);
    return mix(c, P.black, 0.25 * smoothstep(0.2, -0.8, n.y));
  });
  const armorPaint = paint((p, n) => mix(P.armor, P.armorDark, 0.5 * smoothstep(0.3, 0.8, noise(p, 0.3, 5)) + 0.2 * smoothstep(0.2, -0.8, n.y)));
  const chrome = paint((p) => mix(P.hub, P.steel, noise(p, 0.05, 9)));

  const sides = [
    { name: "stabFL", s: 1, z: -0.4 },
    { name: "stabFR", s: -1, z: -0.4 },
    { name: "stabRL", s: 1, z: -3.6 },
    { name: "stabRR", s: -1, z: -3.6 },
  ];

  for (const { name, s, z } of sides) {
    const bone = J[name];
    const root = V(s * 1.75, 1.0, z);
    const foot = V(s * 2.2, 0.12, z);
    const dir = foot.clone().sub(root).normalize();
    const len = foot.distanceTo(root);

    // hinge mount block with ears
    b.part(new THREE.BoxGeometry(0.3, 0.42, 0.5), armorPaint, { bone, at: V(s * 1.9, 1.0, z) });
    for (const dz of [-0.2, 0.2])
      b.part(new THREE.BoxGeometry(0.34, 0.5, 0.07), P.panel, { bone, at: V(s * 1.95, 1.0, z + dz) });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.56, 8), P.steel, { bone, at: V(s * 1.95, 1.0, z), dir: [0, 0, 1] });
    for (const dz of [-0.29, 0.29])
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), P.brass, { bone, at: V(s * 1.95, 1.0, z + dz), dir: [0, 0, 1] });

    // main strut: sleeve (upper), piston (lower)
    const sleeveEnd = root.clone().addScaledVector(dir, len * 0.55);
    b.rod(root.clone().addScaledVector(dir, 0.0), sleeveEnd, 0.15, wornSteel, { bone, section: { ngon: 8 } });
    b.rod(root.clone().addScaledVector(dir, 0.1), root.clone().addScaledVector(dir, 0.35), 0.19, P.armorDark, { bone, section: { ngon: 8 } });
    b.rod(sleeveEnd.clone().addScaledVector(dir, -0.1), foot.clone().addScaledVector(dir, -0.1), 0.095, chrome, { bone, section: { ngon: 8 } });
    // sleeve collar and hazard band
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.12, 8), P.hazard, { bone, at: sleeveEnd.clone().addScaledVector(dir, -0.06), aim: dir });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), P.black, { bone, at: sleeveEnd, aim: dir });
    // hydraulic port + hose
    const portA = root.clone().addScaledVector(dir, 0.25).add(V(0, 0, 0.17));
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), P.brass, { bone, at: portA, dir: [0, 0, 1] });
    b.rod(portA.clone().add(V(0, 0, 0.06)), sleeveEnd.clone().add(V(0, 0, 0.17)), 0.025, P.black, { bone });

    // diagonal brace from hull flank to strut
    const bTop = V(s * 1.95, 0.72, z + (z > -2 ? 0.0 : 0.0));
    const bLow = root.clone().addScaledVector(dir, len * 0.72);
    for (const dz of [-0.14, 0.14]) {
      const a = bTop.clone().add(V(0, 0, dz));
      const c = bLow.clone().add(V(0, 0, dz * 0.6));
      b.rod(a, c, 0.045, P.panel, { bone, section: { ngon: 6 } });
    }
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.4), P.steel, { bone, at: bTop });
    b.part(new THREE.BoxGeometry(0.16, 0.14, 0.4), P.steel, { bone, at: bLow });

    // foot ball joint and footpad
    b.part(new THREE.SphereGeometry(0.15, 8, 6), P.steel, { bone, at: foot.clone().add(V(0, 0.08, 0)) });
    const padY = 0.09;
    b.part(new THREE.CylinderGeometry(0.62, 0.7, 0.18, 8), P.panel, { bone, at: V(foot.x, padY, z) });
    b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 8), hazardTex ? "#ffffff" : P.hazard, {
      bone,
      at: V(foot.x, 0.195, z),
      texture: hazardTex,
    });
    // rim of hazard wedges around pad
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * (Math.PI / 4);
      b.part(new THREE.BoxGeometry(0.22, 0.12, 0.1), i % 2 ? P.hazard : P.black, {
        bone,
        at: V(foot.x + Math.sin(a) * 0.66, 0.09, z + Math.cos(a) * 0.66),
        rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    // ribs radiating
    for (const rot of [0, 90]) {
      b.part(new THREE.BoxGeometry(0.08, 0.1, 1.0), P.steel, {
        bone,
        at: V(foot.x, 0.24, z),
        rotation: [0, rot, 0],
      });
    }
    b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.1, 8), P.steel, { bone, at: V(foot.x, 0.25, z) });
    // bolts
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), P.brass, {
        bone,
        at: V(foot.x + Math.sin(a) * 0.4, 0.22, z + Math.cos(a) * 0.4),
      });
    }

    // warning decal on mount block outer face
    b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
      bone,
      at: V(s * 2.062, 1.0, z),
      dir: [s, 0, 0],
      axis: "z",
      texture: warnTex,
    });
    // status light on mount
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone, at: V(s * 1.95, 1.27, z) }), 1.4);
  }
}
```

<!-- call: fit-railgun -->

The rear breech block poked 0.15 m past the box's back face. I moved it forward and shortened it so it ends at z = -3.3.

<<<<<<< SEARCH
  box(0.7, 0.55, 0.5, P.armorDark, 0, 0.05, -3.2);
=======
  box(0.7, 0.55, 0.4, P.armorDark, 0, 0.05, -3.1);
>>>>>>> REPLACE

<!-- call: fit-turret -->

The sensor pod sticks out past +x, so I'm moving it inward to x = 1.62 and narrowing it.

<<<<<<< SEARCH
  box(0.35, 0.4, 0.5, P.panel, [1.85, 2.9, -2.0]);
  cyl(0.12, 0.12, 0.1, 8, P.glassDark, [1.85, 2.9, -1.72], [90, 0, 0]);
  g(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, { bone, at: [1.85, 3.15, -2.0] }), 2);
=======
  box(0.3, 0.4, 0.5, P.panel, [1.62, 2.95, -2.0]);
  cyl(0.12, 0.12, 0.1, 8, P.glassDark, [1.62, 2.95, -1.7], [90, 0, 0]);
  g(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, { bone, at: [1.62, 3.22, -2.0] }), 2);
>>>>>>> REPLACE

<!-- call: fit-wheels -->

The mud flaps and the rear fender arches reach past z = -3.7, so I pull the flaps in toward the wheel and shrink the arch's rear radius.

<<<<<<< SEARCH
        pts.push([x0, R + Math.sin(a) * (R + 0.14), z + Math.cos(a) * (R + 0.22)]);
=======
        pts.push([x0, R + Math.sin(a) * (R + 0.14), z + Math.cos(a) * (R + 0.1)]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.5, 0.45, 0.04), P.tyre, { bone: J.body, at: [x0, 0.38, z - R - 0.32] });
    b.part(new THREE.BoxGeometry(0.5, 0.08, 0.05), P.hazard, { bone: J.body, at: [x0, 0.2, z - R - 0.32] });
    b.part(new THREE.BoxGeometry(0.56, 0.05, 0.08), P.steel, { bone: J.body, at: [x0, 0.62, z - R - 0.3] });
=======
    b.part(new THREE.BoxGeometry(0.5, 0.45, 0.04), P.tyre, { bone: J.body, at: [x0, 0.38, z - R - 0.07] });
    b.part(new THREE.BoxGeometry(0.5, 0.08, 0.05), P.hazard, { bone: J.body, at: [x0, 0.2, z - R - 0.07] });
    b.part(new THREE.BoxGeometry(0.56, 0.05, 0.08), P.steel, { bone: J.body, at: [x0, 0.62, z - R - 0.06] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    glow(b.part(new THREE.BoxGeometry(0.12, 0.06, 0.04), P.neonCyan, { bone: J.body, at: [s * 2.0, 1.15, -3 - R - 0.3] }), 1.4);
=======
    glow(b.part(new THREE.BoxGeometry(0.12, 0.06, 0.04), P.neonCyan, { bone: J.body, at: [s * 2.0, 1.15, -3 - R - 0.05] }), 1.4);
>>>>>>> REPLACE

<!-- call: fit-cabFront -->

The mudguards ran from z=3.75 to 5.25 and the shackle loops stuck out past z=5.2, so I shortened the mudguard pieces and pulled the shackles in.

<<<<<<< SEARCH
    box(0.7, 0.1, 1.5, armor, [s * 1.75, 1.3, 4.5]);
    box(0.7, 0.1, 0.4, armor, [s * 1.75, 1.2, 5.15], [-25, 0, 0]);
    box(0.08, 0.4, 1.5, armorDarkFix(P), [s * 2.08, 1.1, 4.5]);
    box(0.4, 0.3, 0.03, P.black, [s * 1.9, 0.7, 4.0]);
=======
    box(0.7, 0.1, 0.5, armor, [s * 1.75, 1.3, 4.85]);
    box(0.7, 0.1, 0.3, armor, [s * 1.75, 1.2, 5.0], [-25, 0, 0]);
    box(0.08, 0.4, 0.5, armorDarkFix(P), [s * 1.96, 1.1, 4.85]);
    box(0.4, 0.3, 0.03, P.black, [s * 1.8, 0.7, 4.65]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.18, 0.12, 0.12, P.steel, [s * 1.5, 0.72, 5.22]);
    b.sweep(
      [[s * 1.5, 0.72, 5.28], [s * 1.5 + 0.1, 0.6, 5.34], [s * 1.5, 0.5, 5.34], [s * 1.5 - 0.1, 0.6, 5.34], [s * 1.5, 0.72, 5.28]],
=======
    box(0.18, 0.12, 0.1, P.steel, [s * 1.5, 0.72, 5.12]);
    b.sweep(
      [[s * 1.5, 0.72, 5.15], [s * 1.5 + 0.08, 0.64, 5.18], [s * 1.5, 0.58, 5.18], [s * 1.5 - 0.08, 0.64, 5.18], [s * 1.5, 0.72, 5.15]],
>>>>>>> REPLACE
<<<<<<< SEARCH
    glow(box(0.5, 0.26, 0.08, P.lampWhite, [s * 1.4, 1.6, 5.1]), 1.5);
=======
    glow(box(0.5, 0.26, 0.08, P.lampWhite, [s * 1.4, 1.6, 5.08]), 1.5);
>>>>>>> REPLACE

<!-- call: fit-cabBody -->

The sensor mast, antenna, hatch ring and mirrors now sit inside the box.

<<<<<<< SEARCH
    b.rod([s * 1.8, 2.1, 4.0], [s * 2.0, 2.2, 4.1], 0.025, P.black, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.06, 0.28, 0.2), P.black, { bone, at: [s * 2.02, 2.2, 4.1], name: "mirror" });
=======
    b.rod([s * 1.78, 2.1, 4.0], [s * 1.84, 2.2, 4.1], 0.025, P.black, { bone, sides: 6 });
    b.part(new THREE.BoxGeometry(0.06, 0.28, 0.2), P.black, { bone, at: [s * 1.87, 2.2, 4.1], name: "mirror" });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.TorusGeometry(0.12, 0.02, 4, 8), P.steel, { bone, at: [0.5, 2.85, 2.8], rotation: [90, 0, 0] });
=======
  b.part(new THREE.TorusGeometry(0.12, 0.02, 4, 8), P.steel, { bone, at: [0.5, 2.66, 2.8], rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.rod([-0.7, 2.73, 2.9], [-0.7, 3.2, 2.9], [0.05, 0.035], P.panel, { bone, sides: 6, name: "mast" });
  b.part(new THREE.BoxGeometry(0.3, 0.14, 0.18), P.black, { bone, at: [-0.7, 3.2, 2.9], name: "sensor" });
  const lens = b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.neonCyan, {
    bone, at: [-0.7, 3.2, 3.0], dir: [0, 0, 1], name: "sensorLens",
  });
  glow(lens, 1.5);
  b.rod([-1.1, 2.73, 2.5], [-1.2, 3.35, 2.35], [0.015, 0.006], P.black, { bone, sides: 5, name: "antenna" });
  b.part(new THREE.SphereGeometry(0.03, 5, 4), P.red, { bone, at: [-1.2, 3.37, 2.35] });
=======
  b.rod([-0.7, 2.6, 2.9], [-0.7, 2.62, 2.9], [0.05, 0.035], P.panel, { bone, sides: 6, name: "mast" });
  b.part(new THREE.BoxGeometry(0.3, 0.06, 0.18), P.black, { bone, at: [-0.7, 2.64, 2.9], name: "sensor" });
  const lens = b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.neonCyan, {
    bone, at: [-0.7, 2.64, 3.0], dir: [0, 0, 1], name: "sensorLens",
  });
  glow(lens, 1.5);
  b.rod([-1.1, 2.6, 2.5], [-1.2, 2.69, 2.35], [0.015, 0.006], P.black, { bone, sides: 5, name: "antenna" });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), P.red, { bone, at: [-1.2, 2.67, 2.35] });
>>>>>>> REPLACE

<!-- call: fit-hull -->

Each block below pulls one group of out-of-box pieces back inside the box [[-2,0.7,-5],[2,2.1,2.2]].

- **Tow hooks:** the path now stops at z=-5.0 and bows only slightly outward, so the hooks stay inside the rear face.
- **Tool boxes:** they are narrower and sit at x=±1.78, so their outer faces land at ±1.98.
- **Grab-rail posts:** they are shortened so they stay inside x=±2. The side rods stay at x=±2.05 with radius 0.03, so they reach about ±2.08 and sit only a few centimetres outside the box.
- **Turret ring collar:** the lathe collars are lowered so they top out at y=2.1. The collar bases are at y=1.9 and 1.92, and the deck top is at 2.0.

<<<<<<< SEARCH
    box(0.4, 0.35, 1.0, [s * 2.05, 1.35, 1.0], P.panel);
    box(0.42, 0.06, 1.04, [s * 2.05, 1.55, 1.0], P.hazard);
    box(0.4, 0.3, 0.7, [s * 2.05, 1.3, -3.0], P.armorDark);
=======
    box(0.3, 0.35, 1.0, [s * 1.82, 1.35, 1.0], P.panel);
    box(0.32, 0.06, 1.04, [s * 1.82, 1.55, 1.0], P.hazard);
    box(0.3, 0.3, 0.7, [s * 1.82, 1.3, -3.0], P.armorDark);
>>>>>>> REPLACE

<<<<<<< SEARCH
    for (const z of [-1.9, -2.5, 0.9]) b.rod([s * 2.0, 1.65, z], [s * 2.1, 1.7, z], 0.025, P.steel, { bone: body });
=======
    for (const z of [-1.9, -2.5, 0.9]) b.rod([s * 1.95, 1.65, z], [s * 2.0, 1.7, z], 0.025, P.steel, { bone: body });
>>>>>>> REPLACE

<<<<<<< SEARCH
      [[s * 1.3, 1.0, -5.05], [s * 1.3, 0.85, -5.35], [s * 1.3, 1.1, -5.4]],
=======
      [[s * 1.3, 1.0, -4.9], [s * 1.34, 0.9, -4.97], [s * 1.3, 1.1, -4.98]],
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, 1.99, -2.2], bone: body, color: P.steel, segments: 16 },
=======
    { at: [0, 1.9, -2.2], bone: body, color: P.steel, segments: 16 },
>>>>>>> REPLACE

<<<<<<< SEARCH
    { at: [0, 2.0, -2.2], bone: body, color: P.hazard, segments: 16 },
=======
    { at: [0, 1.92, -2.2], bone: body, color: P.hazard, segments: 16 },
>>>>>>> REPLACE

<!-- call: fit-stabilisers -->

The footpads were centred at x = ±2.2 with a 0.7 m radius, so they stuck out past the box. I moved the foot to x = ±1.75 and shrank the pad and its details to 0.75 scale, which puts the outermost pad edge at about x = 2.275. The strut is now close to vertical rather than angled outward; that is the cost of fitting the box. I have not re-run the measurement.

<<<<<<< SEARCH
    const foot = V(s * 2.2, 0.12, z);
=======
    const foot = V(s * 1.75, 0.12, z);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.62, 0.7, 0.18, 8), P.panel, { bone, at: V(foot.x, padY, z) });
    b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.03, 8), hazardTex ? "#ffffff" : P.hazard, {
=======
    const k = 0.75;
    b.part(new THREE.CylinderGeometry(0.62 * k, 0.7 * k, 0.18, 8), P.panel, { bone, at: V(foot.x, padY, z) });
    b.part(new THREE.CylinderGeometry(0.6 * k, 0.6 * k, 0.03, 8), hazardTex ? "#ffffff" : P.hazard, {
>>>>>>> REPLACE
<<<<<<< SEARCH
        at: V(foot.x + Math.sin(a) * 0.66, 0.09, z + Math.cos(a) * 0.66),
=======
        at: V(foot.x + Math.sin(a) * 0.5, 0.09, z + Math.cos(a) * 0.5),
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(new THREE.BoxGeometry(0.08, 0.1, 1.0), P.steel, {
=======
      b.part(new THREE.BoxGeometry(0.08, 0.1, 0.78), P.steel, {
>>>>>>> REPLACE
<<<<<<< SEARCH
        at: V(foot.x + Math.sin(a) * 0.4, 0.22, z + Math.cos(a) * 0.4),
=======
        at: V(foot.x + Math.sin(a) * 0.3, 0.22, z + Math.cos(a) * 0.3),
>>>>>>> REPLACE
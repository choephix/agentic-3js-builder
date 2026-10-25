<!-- call: plan -->

```json
{
  "name": "Longspear Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military railgun carrier, deployed on four hydraulic stabiliser legs with a long glowing-rail cannon raised on a turret.",
  "builderName": "railgunCarrier",
  "size": [3.6, 3.2, 9.0],
  "layout": "Faces +Z. Heavy angular hull about 2.5 m wide and 7 m long, with a sloped armoured cab at the front (+Z) that has a cyan-glass visor slit and a roof sensor mast. Behind the cab a flat deck carries a turret ring at z=-1.0. A chunky railgun cradle sits on the ring; twin rails with cyan glowing capacitor strips extend 5 m forward over the cab, with a muzzle brake at the front. Three axles (z=+2.6, 0.2, -2.4) carry six big chunky wheels, hubs rendered as bolted discs. Four stabiliser legs deploy diagonally outward from the hull sides at z=+1.6 and z=-3.0, ending in square pads flat on the floor; the wheels sit just clear of the floor, so the vehicle rests on the pads and the wheels' lowest points touch y=0 too. Style: faceted boxes and wedges, olive-grey armour panels with yellow hazard trim, dark gunmetal mechanics, cyan glow on rails, visor, and lights, stencilled markings and rivets painted as textures.",
  "palette": {
    "hull": "#4a5440",
    "hullDark": "#333b2e",
    "hullLight": "#6b7758",
    "gunmetal": "#2b2f36",
    "steel": "#7f8791",
    "tire": "#15171a",
    "hazard": "#e7b814",
    "markRed": "#b8322a",
    "neonCyan": "#2ff3ff",
    "glass": "#0d3a4a",
    "rubber": "#222428",
    "white": "#e8e8e0"
  },
  "mounts": {
    "deckTop": [0, 1.75, -1.0],
    "hullFloor": [0, 0.95, 0],
    "turretRing": [0, 1.75, -1.0],
    "cabRoof": [0, 2.35, 2.6],
    "axleFront": [0, 0.7, 2.6],
    "axleMid": [0, 0.7, 0.2],
    "axleRear": [0, 0.7, -2.4],
    "legFrontL": [1.25, 1.1, 1.6],
    "legFrontR": [-1.25, 1.1, 1.6],
    "legRearL": [1.25, 1.1, -3.0],
    "legRearR": [-1.25, 1.1, -3.0],
    "gunPivot": [0, 2.55, -1.0],
    "muzzle": [0, 2.9, 4.4]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.75, -1.0], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gun", "parent": "turret", "at": [0, 2.55, -1.0], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.45, 0.7, 2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.45, 0.7, 2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.45, 0.7, 0.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.45, 0.7, 0.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.45, 0.7, -2.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.45, 0.7, -2.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFL", "parent": "body", "at": [1.25, 1.1, 1.6], "dir": [0.6, -0.8, 0], "role": "leg", "group": "legs" },
    { "name": "legFR", "parent": "body", "at": [-1.25, 1.1, 1.6], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "legs" },
    { "name": "legRL", "parent": "body", "at": [1.25, 1.1, -3.0], "dir": [0.6, -0.8, 0], "role": "leg", "group": "legs" },
    { "name": "legRR", "parent": "body", "at": [-1.25, 1.1, -3.0], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured chassis body from z=-3.9 to z=1.9: faceted box lower tub with sloped front glacis and angled side skirts, a flat rear deck with hazard-striped edge, rear engine block with vent grilles and exhaust stacks, side fender boxes over each wheel, tool boxes, tow hook and tail lights (glowing red), paint panelled with rivets and wear. Includes the turret-ring base plate (low cylinder) at the turretRing mount, a stencilled white unit number and red marking decals. Wheel arches are open for the wheels. Paint: olive armour with lighter tops, dark grime near the bottom.",
      "box": [[-1.5, 0.8, -3.9], [1.5, 1.8, 1.9]],
      "attaches": "Carries all other parts via the body joint. Cab starts at z=1.9. Turret sits on turretRing/deckTop. Legs bolt to the legFront*/legRear* mounts on the sides. Axle mounts are in the wheel arches.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Forward armoured crew cab from z=1.9 to z=4.2: sloped wedge nose, angled windshield with cyan-glass visor slit drawn as an SVG decal with reflections, side hatch door with handle and hazard trim, roof with sensor mast, radar dish, antenna whips, searchlight bar with glowing lamps, front bumper with a winch, headlights (glow), mud flaps, and a front armour plate with chevron paint. The cab roof stays below y=2.4 so the railgun passes over it.",
      "box": [[-1.3, 0.85, 1.9], [1.3, 2.6, 4.2]],
      "attaches": "Rear face meets the hull front at z=1.9. Roof at cabRoof. Rides the body joint.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "runningGear",
      "builds": "Six chunky low-poly wheels (octagonal tires with tread blocks painted or extruded, steel hub discs with bolt rings, central caps) on three axles at axleFront/axleMid/axleRear, each on its own wheel joint, radius 0.7 so the wheel bottoms touch y=0. Axle beams, differential housings, leaf-spring packs and drive shafts visible under the hull between the wheel pairs, brake discs, and mud guards. Hub texture painted with a yellow stripe.",
      "box": [[-1.85, 0.0, -3.1], [1.85, 1.4, 3.3]],
      "attaches": "Wheel joints parent to body at the axle mounts; axles run under the hull at y=0.7 and enter the wheel arches of hull and cab.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed hydraulic stabiliser legs: a box-section mounting bracket on the hull flank at each leg mount, an outward-diagonal telescoping main strut (outer sleeve plus a polished steel inner piston rod), a diagonal brace strut with pivot pins, hydraulic hoses (thin sweeps), and a large square foot pad with a rubber underside and hazard-striped edge, bolted, with a small ball joint. Pads sit flat at y=0 about 2.6 m out from the centreline. Each leg uses its own leg joint (legFL, legFR, legRL, legRR). Warning decals on the sleeves.",
      "box": [[-2.5, 0.0, -3.6], [2.5, 1.5, 2.2]],
      "attaches": "Roots at legFrontL/R and legRearL/R mounts on the hull sides; feet end on the floor.",
      "joints": ["legFL", "legFR", "legRL", "legRR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "railgun",
      "builds": "Rotating turret and railgun. Turret: faceted rotating base on the turretRing mount (joint turret) with a side armour housing, ammo and capacitor boxes, a coolant tank, and ladder rungs. The gun cradle (joint gun) pivots at gunPivot with two big trunnion discs. Twin parallel box rails about 5.5 m long run forward over the cab to the muzzle at z=4.4 with a gap between them. Glowing cyan capacitor strips run along the rail inner faces and across coils, and glow rings sit at intervals as cyan glowing discs. The breech block at the rear carries heavy capacitor banks with hazard stripes and cooling fins, and a flared muzzle brake at the front. Includes the rail support brackets, a recoil buffer cylinder, a targeting optics box with a glowing lens, and cable sweeps. Glow kit used for cyan elements.",
      "box": [[-1.3, 1.75, -3.6], [1.3, 3.2, 4.5]],
      "attaches": "Turret base sits on turretRing at deckTop (y=1.75); gun cradle pivots at gunPivot; muzzle ends at the muzzle mount; rails pass above the cabRoof (y<=2.6 cab roof, rails at y 2.7-3.1).",
      "joints": ["turret", "gun"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, countershade, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---- textures ----
  const VISOR = svg(
    `<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="198" height="38" rx="4" fill="#0d3a4a" stroke="#07171d" stroke-width="3"/>
      <rect x="6" y="6" width="188" height="28" fill="#13607a"/>
      <path d="M20 34 L60 6 L80 6 L40 34Z" fill="#7fe9f5" opacity="0.55"/>
      <path d="M100 34 L128 6 L138 6 L110 34Z" fill="#7fe9f5" opacity="0.4"/>
      <rect x="6" y="6" width="188" height="6" fill="#0a2a36" opacity="0.6"/>
    </svg>`,
    { size: 256 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="#1c1f22"/>
      <path d="M0 0 L16 0 L32 16 L16 32 L0 32 L16 16Z M32 0 L48 0 L64 16 L48 32 L32 32 L48 16Z" fill="#e7b814"/>
    </svg>`,
    { size: 128 },
  );
  const DOOR = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="76" rx="3" fill="none" stroke="#1f251b" stroke-width="3"/>
      <rect x="8" y="8" width="48" height="22" fill="#0d3a4a" stroke="#1f251b" stroke-width="2"/>
      <path d="M12 28 L26 10 L34 10 L20 28Z" fill="#7fe9f5" opacity="0.5"/>
      <rect x="2" y="66" width="60" height="12" fill="#e7b814"/>
      <path d="M6 66 L18 78 M22 66 L34 78 M38 66 L50 78 M54 66 L62 74" stroke="#1c1f22" stroke-width="4"/>
      <text x="32" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="#e8e8e0">LS-07</text>
    </svg>`,
    { size: 192 },
  );
  const HEAD = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#fff6c8"/><circle cx="16" cy="16" r="10" fill="#ffffff"/><circle cx="16" cy="16" r="4" fill="#fff0a0"/>
    </svg>`,
    { size: 64 },
  );

  const armor = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, n.y));
    const grime = smoothstep(1.5, 0.9, p.y) * 0.5 + noise(p, 0.15, 3) * 0.12;
    const c = mix(base, P.hullDark, grime);
    // rivet seams
    const sx = ((p.z * 4) % 1 + 1) % 1;
    return sx < 0.025 ? mix(c, P.hullDark, 0.7) : c;
  });
  const dark = paint((p, n) => mix(P.gunmetal, "#454b55", noise(p, 0.1, 5) * 0.6 + smoothstep(0.4, 1, n.y) * 0.2));

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], bone = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone: body, at, rotation: rot, flat: true });

  // ---- main cab shell: lower box + sloped wedge nose ----
  box(2.5, 0.9, 2.3, armor, [0, 1.3, 3.05]); // lower tub y .85-1.75
  // upper cabin (sits behind), roof at 2.3
  b.extrude(
    [[0, 0], [1.5, 0], [1.5, 0.35], [0.9, 0.58], [0, 0.58]],
    { at: [0, 1.75, 1.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: armor, bone: body },
  );
  // sloped nose wedge (glacis)
  b.extrude(
    [[0, 0], [0.9, 0], [0, 0.55]],
    { at: [0, 1.2, 4.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 2.5, color: armor, bone: body },
  );
  // roof slab
  box(2.3, 0.1, 1.15, armor, [0, 2.36, 2.55]);
  // side roof pillars / armour cheeks
  for (const s of [1, -1]) {
    box(0.12, 0.6, 1.5, armor, [s * 1.24, 1.55, 3.05], [0, 0, s * 8]);
    // skirt wedge
    b.extrude(
      [[0, 0], [0.3, 0], [0.3, -0.3]],
      { at: [s * 1.25, 1.0, 2.0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.01, color: P.hullDark, bone: body },
    );
  }

  // ---- windshield visor decal on the slope ----
  const slope = b.part(new THREE.PlaneGeometry(2.0, 0.4), "#ffffff", {
    bone: body, at: [0, 2.0, 3.0], dir: [0, 0.55, 0.83], axis: "z", texture: VISOR,
  });
  glow(slope, 0.5);
  // visor frame
  box(2.15, 0.06, 0.08, P.gunmetal, [0, 2.22, 2.93], [-33, 0, 0]);
  box(2.15, 0.06, 0.08, P.gunmetal, [0, 1.79, 3.06], [-33, 0, 0]);

  // ---- front armour plate with chevrons ----
  b.part(new THREE.PlaneGeometry(2.2, 0.38), "#ffffff", {
    bone: body, at: [0, 1.0, 4.24], dir: [0, 0, 1], axis: "z", texture: CHEV,
  });
  box(2.4, 0.5, 0.12, P.hullDark, [0, 1.0, 4.17]);

  // ---- bumper & winch ----
  box(2.6, 0.2, 0.25, dark, [0, 0.9, 4.2]);
  for (const s of [1, -1]) box(0.5, 0.2, 0.26, P.hazard, [s * 1.05, 0.9, 4.2]);
  cyl(0.12, 0.12, 1.0, 8, P.steel, [0, 1.0, 4.35], [0, 0, 90]);
  for (const s of [1, -1]) cyl(0.15, 0.15, 0.06, 8, P.gunmetal, [s * 0.5, 1.0, 4.35], [0, 0, 90]);
  b.sweep([[0.3, 1.0, 4.4], [0.3, 0.95, 4.5], [0.1, 0.9, 4.55], [-0.1, 0.9, 4.55]], 0.025, { color: P.rubber, bone: body });
  box(0.12, 0.12, 0.12, P.hazard, [0, 0.9, 4.32]);

  // ---- headlights ----
  for (const s of [1, -1]) {
    box(0.4, 0.26, 0.1, P.gunmetal, [s * 0.85, 1.35, 4.18]);
    glow(b.part(new THREE.PlaneGeometry(0.32, 0.18), "#ffffff", {
      bone: body, at: [s * 0.85, 1.35, 4.235], dir: [0, 0, 1], axis: "z", texture: HEAD,
    }), 1.3);
  }

  // ---- side hatch doors ----
  for (const s of [1, -1]) {
    const x = s * 1.262;
    b.part(new THREE.PlaneGeometry(0.95, 1.2), "#ffffff", {
      bone: body, at: [x, 1.65, 2.9], dir: [s, 0, 0], axis: "z", texture: DOOR,
    });
    box(0.05, 0.06, 0.22, P.steel, [s * 1.29, 1.55, 3.28]); // handle
    box(0.04, 0.06, 0.04, P.steel, [s * 1.28, 1.55, 3.18]);
    box(0.05, 1.22, 0.06, P.hazard, [s * 1.27, 1.65, 2.4]);
    // mud flaps
    box(0.05, 0.3, 0.5, P.rubber, [s * 1.27, 0.98, 3.75]);
    // side mirrors
    box(0.05, 0.22, 0.14, P.gunmetal, [s * 1.38, 2.0, 3.45]);
    b.rod([s * 1.27, 2.0, 3.4], [s * 1.38, 2.0, 3.45], 0.015, P.steel, { bone: body });
    // vents on cheek
    for (let i = 0; i < 3; i++) box(0.03, 0.04, 0.3, P.gunmetal, [s * 1.27, 1.2 + i * 0.07, 3.8]);
    // rivets
    for (let i = 0; i < 4; i++) cyl(0.025, 0.025, 0.03, 6, P.steel, [s * 1.27, 1.2, 2.2 + i * 0.5], [0, 0, 90]);
  }

  // ---- roof equipment ----
  // sensor mast
  cyl(0.14, 0.18, 0.1, 8, P.gunmetal, [-0.7, 2.43, 2.3]);
  b.rod([-0.7, 2.45, 2.3], [-0.7, 2.58, 2.3], [0.05, 0.035], P.steel, { bone: body });
  box(0.22, 0.1, 0.16, P.gunmetal, [-0.7, 2.52, 2.3]);
  glow(box(0.06, 0.06, 0.06, P.neonCyan, [-0.7, 2.59, 2.3]), 1.5);

  // radar dish
  cyl(0.06, 0.08, 0.14, 6, P.gunmetal, [0.7, 2.44, 2.3]);
  const dish = b.lathe(
    [[0, 0], [0.2, 0.05], [0.24, 0.1], [0.2, 0.11], [0.0, 0.03]],
    { at: [0.7, 2.54, 2.34], axis: [0, 0.7, 0.7], segments: 8, color: P.steel, bone: body },
  );
  b.rod([0.7, 2.52, 2.32], [0.7, 2.62, 2.46], 0.015, P.gunmetal, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone: body, at: [0.7, 2.62, 2.46] }), 1.5);

  // antenna whips
  for (const [x, z, h, lean] of [[1.0, 1.98, 0.5, 0.15], [-1.0, 1.98, 0.45, -0.1]] as number[][]) {
    cyl(0.04, 0.05, 0.06, 6, P.gunmetal, [x, 2.4, z]);
    b.sweep([[x, 2.42, z], [x + lean * 0.4, 2.42 + h * 0.5, z - 0.05], [x + lean, 2.42 + h, z - 0.15]], [0.014, 0.004], {
      color: P.gunmetal, bone: body, sides: 5,
    });
    glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.markRed, { bone: body, at: [x + lean, 2.42 + h, z - 0.15] }), 1.2);
  }

  // searchlight bar at the front of the roof
  box(1.8, 0.1, 0.18, P.gunmetal, [0, 2.46, 3.02]);
  for (const s of [1, -1]) box(0.08, 0.1, 0.1, P.gunmetal, [s * 0.88, 2.41, 3.02]);
  for (let i = 0; i < 5; i++) {
    const x = -0.72 + i * 0.36;
    box(0.26, 0.12, 0.14, P.gunmetal, [x, 2.52, 3.04]);
    glow(box(0.2, 0.08, 0.04, "#fff3b0", [x, 2.52, 3.13]), 1.6);
  }
  // roof hatch
  cyl(0.28, 0.3, 0.07, 8, P.hullDark, [0, 2.42, 2.3]);
  cyl(0.05, 0.05, 0.1, 6, P.steel, [0, 2.48, 2.3]);
  // roof rivets and hazard edge
  box(2.3, 0.02, 0.1, P.hazard, [0, 2.415, 3.1]);
  for (let i = 0; i < 6; i++) {
    const s = i % 2 ? 1 : -1;
    cyl(0.025, 0.025, 0.03, 6, P.steel, [s * (0.4 + R() * 0.7), 2.42, 2.0 + R() * 0.15]);
  }

  // grab handles on front of cab pillars
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 1.8, 2.0], [s * 1.1, 2.25, 2.0], 0.02, P.hazard, { bone: body });
  }
  // rear wall conduit pipes to hull
  b.sweep([[0.6, 1.2, 1.95], [0.6, 1.7, 1.95], [0.3, 2.1, 2.0]], 0.035, { color: P.rubber, bone: body, sides: 6 });
  b.sweep([[0.7, 1.2, 1.95], [0.7, 1.6, 1.95], [0.4, 2.0, 2.0]], 0.03, { color: P.gunmetal, bone: body, sides: 6 });
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHull({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);

  // Paints
  const armour = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 0.95, n.y) * 0.8);
    const mott = mix(base, P.hullDark, noise(p, 0.35, 3) * 0.35);
    const grime = smoothstep(1.35, 0.8, p.y);
    const seam = (Math.abs(((p.z + 10) % 0.9) - 0.45) > 0.435 && Math.abs(n.x) > 0.5) ? 0.55 : 0;
    const c = mix(mix(mott, P.hullDark, grime * 0.7), "#14160f", seam);
    return mix(c, "#222018", 0.0);
  });
  const dark = paint((p, n) => mix(P.gunmetal, "#14161a", noise(p, 0.2, 5) * 0.6 + (n.y < 0 ? 0.2 : 0)));

  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#17181a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const numTex = svg(
    `<svg viewBox="0 0 64 40"><rect x="1" y="1" width="62" height="38" fill="none" stroke="#e8e8e0" stroke-width="2" opacity="0.8"/><text x="32" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#e8e8e0">LS-07</text></svg>`,
    { size: 128 },
  );
  const markTex = svg(
    `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="none" stroke="${P.markRed}" stroke-width="5"/><path d="M24 8 L24 40 M8 24 L40 24" stroke="${P.markRed}" stroke-width="5"/><circle cx="24" cy="24" r="6" fill="${P.markRed}"/></svg>`,
    { size: 128 },
  );
  const ventTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#1a1c20"/>${[3, 9, 15, 21, 27].map((y) => `<rect x="2" y="${y}" width="28" height="3" fill="#050607"/><rect x="2" y="${y + 3}" width="28" height="1" fill="#555b64"/>`).join("")}</svg>`,
    { size: 64 },
  );
  const chevTex = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="${P.hazard}"/>${[0, 1, 2, 3].map((i) => `<path d="M${i * 16 + 2} 0 L${i * 16 + 12} 12 L${i * 16 + 2} 24 L${i * 16 + 6} 24 L${i * 16 + 16} 12 L${i * 16 + 6} 0Z" fill="#17181a"/>`).join("")}</svg>`,
    { size: 128 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opt });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], opt: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...opt });

  // Lower tub (between wheel arches), tapered
  box(2.6, 0.5, 5.6, armour, [0, 0.98, -1.0]);
  // Main upper hull body
  box(2.7, 0.55, 4.7, armour, [0, 1.5, -1.55]);
  // Sloped glacis wedge at front
  const wedge = b.extrude(
    [[0, 0], [0.9, 0], [0.9, 0.35], [0.1, 0.9], [0, 0.9]].map(([x, y]) => [x, y] as [number, number]),
    { at: [-1.35, 0.85, 1.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.7, color: armour, bone },
  );
  // Fix orientation: extrude thickness runs along x*y = -x...; centred so fine.
  // Angled side skirts
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [5.4, 0], [5.0, 0.38], [0.3, 0.38]], {
      at: [s * 1.38, 0.78, -3.4], x: [0, 0, 1], y: [s * 0.35, 1, 0], thickness: 0.08, color: armour, bone,
    });
    // Fender boxes over wheels (arches left open between)
    for (const z of [2.6 - 0.7 * 0 , 0.2, -2.4]) {
      if (z > 1.9) continue;
      box(0.5, 0.1, 1.5, armour, [s * 1.42, 1.62, z]);
      box(0.12, 0.35, 1.5, armour, [s * 1.62, 1.5, z]);
    }
  }
  // Fender over front wheel (partly under hull to z=1.9)
  for (const s of [1, -1]) {
    box(0.5, 0.1, 0.8, armour, [s * 1.42, 1.62, 1.5]);
    box(0.12, 0.35, 0.8, armour, [s * 1.62, 1.5, 1.5]);
  }

  // Deck top: flat rear deck with hazard edge
  box(2.6, 0.1, 4.4, armour, [0, 1.8 - 0.05 - 0.0, -1.55]);
  for (const s of [1, -1]) {
    plane(4.3, 0.12, hazardTex, [s * 1.3, 1.806, -1.55], [0, 1, 0], { up: [s * 0 + 0, 0, 1] });
  }
  // Rear and front hazard strips
  plane(2.4, 0.12, hazardTex, [0, 1.806, 0.55], [0, 1, 0], { up: [1, 0, 0] });

  // Turret ring base plate
  b.part(new THREE.CylinderGeometry(1.05, 1.15, 0.14, 12), dark, { bone, at: [M.turretRing[0], M.turretRing[1] - 0.02, M.turretRing[2]] });
  b.part(new THREE.CylinderGeometry(0.95, 0.95, 0.06, 12), P.steel, { bone, at: [0, 1.84, -1] });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.steel, { bone, at: [Math.sin(a) * 1.05, 1.86, -1 + Math.cos(a) * 1.05] });
  }

  // Rear engine block
  box(2.3, 0.7, 1.3, dark, [0, 2.0 - 0.0, -3.2]);
  box(2.4, 0.08, 1.4, armour, [0, 2.38, -3.2]);
  plane(2.0, 0.55, ventTex, [0, 2.0, -3.86], [0, 0, -1]);
  for (const s of [1, -1]) plane(1.1, 0.5, ventTex, [s * 1.16, 2.0, -3.2], [s, 0, 0]);
  // Exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.7, 8), dark, { bone, at: [s * 0.8, 2.75, -3.5] });
    b.part(new THREE.CylinderGeometry(0.12, 0.09, 0.08, 8), P.steel, { bone, at: [s * 0.8, 3.12, -3.5] });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 8), "#050505", { bone, at: [s * 0.8, 3.17, -3.5] });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), P.hazard, { bone, at: [s * 0.8, 2.5, -3.5] });
  }

  // Rear bumper, tail lights, tow hook
  box(2.7, 0.22, 0.2, dark, [0, 1.0, -3.95 + 0.05]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.16, 0.06, "#ff2a1e", [s * 1.05, 1.5, -3.92]), 1.6);
    box(0.36, 0.22, 0.04, dark, [s * 1.05, 1.5, -3.9]);
    glow(box(0.3, 0.16, 0.06, "#ff2a1e", [s * 1.05, 1.5, -3.92]), 1.6);
  }
  b.part(new THREE.TorusGeometry(0.12, 0.035, 5, 8), P.steel, { bone, at: [0, 0.95, -4.0], dir: [0, 0, 1], axis: "z" });
  box(0.16, 0.12, 0.2, P.steel, [0, 0.95, -3.9]);

  // Side tool boxes
  for (const s of [1, -1]) {
    box(0.3, 0.35, 1.0, P.hullDark, [s * 1.42, 1.95, -2.4]);
    box(0.32, 0.04, 1.04, P.hazard, [s * 1.42, 2.15, -2.4]);
    box(0.04, 0.08, 0.2, P.steel, [s * 1.59, 1.98, -2.4]);
    // jerry can & shovel on other
    box(0.25, 0.3, 0.2, P.hullDark, [s * 1.42, 1.97, -1.5]);
  }
  // Roof-level lockers near front of deck
  box(0.7, 0.28, 0.5, P.hullDark, [0.75, 1.96, 1.2]);
  box(0.7, 0.28, 0.5, P.hullDark, [-0.75, 1.96, 1.2]);
  box(0.72, 0.03, 0.52, P.hazard, [0.75, 2.11, 1.2]);
  box(0.72, 0.03, 0.52, P.hazard, [-0.75, 2.11, 1.2]);

  // Leg mount brackets on flanks
  for (const s of [1, -1])
    for (const z of [1.6, -3.0]) {
      box(0.3, 0.5, 0.6, dark, [s * 1.62, 1.1, z]);
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), P.steel, { bone, at: [s * 1.82, 1.1, z], dir: [1, 0, 0] });
    }

  // Rivet strips (merged)
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 14; i++) {
      const z = -3.6 + i * 0.4;
      rivets.push(new THREE.SphereGeometry(0.03, 5, 3).translate(s * 1.36, 1.72, z));
    }
  for (let i = 0; i < 8; i++) rivets.push(new THREE.SphereGeometry(0.03, 5, 3).translate(-1.05 + i * 0.3, 1.2, 1.88));
  // merge manually
  const merged = (() => {
    const pos: number[] = [], idx: number[] = [];
    let off = 0;
    for (const g of rivets) {
      const p = g.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      const ix = g.getIndex()!;
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  })();
  b.part(merged, P.steel, { bone, at: [0, 0, 0] });

  // Decals: unit number and red marks
  for (const s of [1, -1]) {
    plane(1.1, 0.7, numTex, [s * 1.356, 1.5, -2.3], [s, 0, 0], { up: [0, 1, 0] });
    plane(0.55, 0.55, markTex, [s * 1.356, 1.5, -0.9], [s, 0, 0]);
    plane(1.4, 0.35, chevTex, [s * 1.357, 1.2, -3.2 + 0.3], [s, 0, 0]);
  }
  plane(0.7, 0.7, markTex, [0.8, 1.806, -2.0], [0, 1, 0]);
  plane(1.0, 0.5, numTex, [-0.2, 1.806, -2.6], [0, 1, 0], { up: [0, 0, 1] });

  // Front hull details: headlight-free; grille on glacis and winch hint
  plane(1.6, 0.25, chevTex, [0, 1.12, 1.92], [0, 0, 1]);
  void wedge; void R;
  // Wheel arch rims (open arches) as dark rails
  for (const s of [1, -1])
    for (const z of [0.2, -2.4]) {
      box(0.1, 0.1, 1.7, P.hullDark, [s * 1.36, 1.0, z]);
    }
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, mottle, countershade, rng } from "agentic-3js-builder";

export function buildStabilisers({ b, J, P, M }: Ctx) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerpV = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);

  // ---- textures ----
  const HAZARD_PAD = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="14" fill="${P.hazard}"/><rect width="7" height="14" fill="${P.tire}"/></pattern></defs>
      <path d="M0 0H100V100H0Z M12 12V88H88V12Z" fill="url(#p)" fill-rule="evenodd"/>
      <path d="M0 0H100V100H0Z M12 12V88H88V12Z" fill="none" stroke="${P.tire}" stroke-width="2" fill-rule="evenodd"/>
    </svg>`,
    { size: 128 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="60" height="76" rx="6" fill="${P.white}" stroke="${P.tire}" stroke-width="3"/>
      <path d="M32 9 L58 52 H6 Z" fill="${P.hazard}" stroke="${P.tire}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="29.5" y="23" width="5" height="16" fill="${P.tire}"/><circle cx="32" cy="45" r="3" fill="${P.tire}"/>
      <rect x="10" y="60" width="44" height="4" fill="${P.markRed}"/><rect x="14" y="68" width="36" height="3" fill="${P.gunmetal}"/>
    </svg>`,
    { size: 128 },
  );

  // ---- paints ----
  const SLEEVE = paint((p, n) => {
    const base = countershade(P.gunmetal, P.hullDark).at(p, n);
    return base;
  });
  const BRACKET = countershade(mottle(P.hull, P.hullDark, { size: 0.15, seed: 4 }), P.hullDark, { level: -0.2 });
  const PAD = mottle(P.rubber, P.tire, { size: 0.08, seed: 9 });
  const PAD_STEEL = mottle(P.gunmetal, P.hullDark, { size: 0.1, seed: 12 });

  const R = rng(5);

  const cyl = (c: THREE.Vector3, dir: number[], r: number, h: number, col: any, bone: any, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), col, { bone, at: c, dir });
  const box = (c: THREE.Vector3, sx: number, sy: number, sz: number, col: any, bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), col, { bone, at: c, rotation: rot });

  const legs = [
    { j: J.legFL, s: 1, z: 1.6 },
    { j: J.legFR, s: -1, z: 1.6 },
    { j: J.legRL, s: 1, z: -3.0 },
    { j: J.legRR, s: -1, z: -3.0 },
  ];

  for (const { j, s, z } of legs) {
    const zo = z > 0 ? 1 : -1;
    // key points
    const A = V(s * 1.5, 1.05, z);
    const B = V(s * 2.6, 0.27, z);
    const dir = B.clone().sub(A).normalize();
    const dirA = [dir.x, dir.y, dir.z];
    const mid = lerpV(A, B, 0.55);

    // bracket: box section on hull flank
    box(V(s * 1.38, 1.1, z), 0.28, 0.62, 0.62, BRACKET, j);
    box(V(s * 1.27, 1.1, z), 0.06, 0.74, 0.76, P.gunmetal, j);
    box(V(s * 1.47, 1.4, z), 0.2, 0.12, 0.5, P.hullLight, j);
    box(V(s * 1.5, 0.8, z), 0.2, 0.1, 0.5, P.hullDark, j);
    for (const dz of [-0.3, 0.3])
      for (const dy of [-0.3, 0.3])
        cyl(V(s * 1.23, 1.1 + dy, z + dz), [s, 0, 0], 0.03, 0.05, P.steel, j, 6);
    // clevis lugs + pivot pin
    for (const dz of [-0.17, 0.17]) box(V(s * 1.55, 1.05, z + dz), 0.2, 0.3, 0.07, P.gunmetal, j);
    cyl(V(s * 1.55, 1.05, z), [0, 0, 1], 0.05, 0.5, P.steel, j, 8);

    // main strut: outer sleeve
    const sleeveEnd = lerpV(A, B, 0.62);
    b.rod(A, sleeveEnd, 0.115, SLEEVE, { bone: j, sides: 8 });
    // collars
    for (const t of [0.04, 0.3, 0.62]) {
      const c = lerpV(A, B, t);
      cyl(c, dirA, 0.145, 0.07, P.hullDark, j, 8);
    }
    // hazard band on sleeve
    cyl(lerpV(A, B, 0.5), dirA, 0.122, 0.07, P.hazard, j, 8);
    // piston rod
    b.rod(lerpV(A, B, 0.55), B, 0.07, P.steel, { bone: j, sides: 8 });
    cyl(lerpV(A, B, 0.62), dirA, 0.095, 0.05, P.tire, j, 8);

    // warning decal on sleeve
    b.part(new THREE.PlaneGeometry(0.1, 0.125), "#ffffff", {
      bone: j,
      at: lerpV(A, B, 0.2).add(V(0, 0, zo * 0.12)),
      dir: [0, 0, zo],
      axis: "z",
      up: dirA.map((v, i) => (i === 2 ? 0 : v)),
      texture: WARN,
    });

    // brace strut offset in z
    const bz = z - zo * 0.0 + 0.22;
    const bA = V(s * 1.3, 0.78, bz);
    const bB = lerpV(A, B, 0.72).add(V(0, 0, 0.22));
    box(V(s * 1.33, 0.78, bz), 0.12, 0.2, 0.1, P.gunmetal, j);
    b.rod(bA, bB, 0.055, P.gunmetal, { bone: j, sides: 6 });
    b.rod(lerpV(bA, bB, 0.35), lerpV(bA, bB, 0.8), 0.07, P.hullDark, { bone: j, sides: 6 });
    cyl(bA, [0, 0, 1], 0.05, 0.14, P.steel, j, 6);
    cyl(bB, [0, 0, 1], 0.055, 0.14, P.steel, j, 6);
    // lug on sleeve connecting brace
    box(lerpV(A, B, 0.72).add(V(0, 0, 0.12)), 0.12, 0.12, 0.08, P.gunmetal, j);
    b.rod(lerpV(A, B, 0.72), bB, 0.04, P.gunmetal, { bone: j, sides: 6 });

    // hydraulic hose
    const hz = z - 0.18 * zo + 0.0;
    const hs = V(s * 1.42, 1.38, hz);
    const he = lerpV(A, B, 0.3).add(V(0, 0, hz - z + 0.0));
    he.z = z - 0.12;
    b.sweep([hs.toArray(), V(s * 1.38, 1.0, z - 0.3).toArray(), V(s * 1.62, 0.78, z - 0.24).toArray(), he.toArray()], 0.024, {
      bone: j,
      color: P.rubber,
      sides: 6,
    });
    cyl(hs, [0, 1, 0], 0.04, 0.07, P.steel, j, 6);
    cyl(he.clone().add(V(0, 0, 0.0)), dirA, 0.04, 0.05, P.steel, j, 6);

    // ball joint and foot pad
    b.part(new THREE.SphereGeometry(0.115, 8, 6), P.steel, { bone: j, at: B.clone().add(V(0, -0.03, 0)) });
    cyl(V(s * 2.6, 0.2, z), [0, 1, 0], 0.09, 0.05, P.gunmetal, j, 8);
    const padC = V(s * 2.6, 0.06, z);
    box(padC, 0.8, 0.12, 0.8, PAD, j);
    box(V(s * 2.6, 0.15, z), 0.72, 0.06, 0.72, PAD_STEEL, j);
    b.part(new THREE.PlaneGeometry(0.76, 0.76), "#ffffff", {
      bone: j,
      at: V(s * 2.6, 0.186, z),
      dir: [0, 1, 0],
      axis: "z",
      texture: HAZARD_PAD,
    });
    // rubber lower skirt ribs
    for (const dz of [-0.2, 0, 0.2]) box(V(s * 2.6, 0.015, z + dz), 0.78, 0.03, 0.06, P.tire, j);
    // pad bolts
    for (const ix of [-1, 1])
      for (const iz of [-1, 1])
        cyl(V(s * 2.6 + ix * 0.25, 0.2, z + iz * 0.25), [0, 1, 0], 0.035, 0.04, P.steel, j, 6);
    // gusset ribs on top of pad around ball joint
    for (const a of [0, 1]) box(V(s * 2.6, 0.22, z), a ? 0.32 : 0.05, 0.1, a ? 0.05 : 0.32, P.hullDark, j);
    // small stencil light on bracket
    void R;
  }
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";

export function buildRunningGear({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = 0.7; // flat-to-flat tire radius, so the flats touch y = 0
  const RC = R / Math.cos(Math.PI / 8); // circumradius of the octagon
  const WID = 0.6;
  const AX = 1.45;
  const axles: [string, number][] = [
    ["F", M.axleFront[2]],
    ["M", M.axleMid[2]],
    ["R", M.axleRear[2]],
  ];

  // ---------- paints & textures
  const tirePaint = paint((p, n) => {
    const base = mix(P.tire, "#2d3035", noise(p, 0.09, 3) * 0.8);
    const dusty = mix(base, "#5a4b38", 0.45 * smoothstep(0.55, 0.05, p.y) * noise(p, 0.12, 8));
    return n.y > 0.7 ? mix(dusty, "#3a3d44", 0.3) : dusty;
  });
  const gunPaint = paint((p, n) =>
    mix(mix(P.gunmetal, "#3b4048", noise(p, 0.1, 5)), "#16181c", 0.35 * smoothstep(0.3, -0.8, n.y)),
  );
  const steelPaint = paint((p) => mix(P.steel, "#a9b1ba", noise(p, 0.05, 11)));

  let bolts = "";
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = 50 + 30 * Math.sin(a);
    const y = 50 - 30 * Math.cos(a);
    bolts += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#2b2f36" stroke="#d6dbe0" stroke-width="1.2"/><circle cx="${(x - 1).toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="1.4" fill="#e8e8e0"/>`;
  }
  const HUB = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="49" fill="#1b1d21"/>
      <circle cx="50" cy="50" r="45" fill="#8a929c"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#e7b814" stroke-width="7"/>
      <g transform="rotate(35 50 50)"><rect x="5" y="44" width="90" height="12" fill="#e7b814"/>
      <path d="M12 44 l6 12 M24 44 l6 12 M70 44 l6 12 M82 44 l6 12" stroke="#15171a" stroke-width="3"/></g>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#2b2f36" stroke-width="2"/>
      <circle cx="50" cy="50" r="22" fill="#4b5058" stroke="#1b1d21" stroke-width="2"/>
      ${bolts}
      <circle cx="50" cy="50" r="12" fill="#2b2f36" stroke="#d6dbe0" stroke-width="1.5"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- geometry helpers
  const cyl = (r: number, len: number, seg = 8) => new THREE.CylinderGeometry(r, r, len, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---------- wheels
  const wheels: [string, number, number][] = [];
  for (const [ax, z] of axles)
    for (const [sn, s] of [["L", 1], ["R", -1]] as [string, number][]) wheels.push([ax + sn, s, z]);

  for (const [key, s, z] of wheels) {
    const joint = J[`wheel${key}`];
    const c = new THREE.Vector3(s * AX, 0.7, z);
    const out: [number, number, number] = [s, 0, 0];
    const at = (d: number): [number, number, number] => [c.x + s * d, c.y, c.z];
    const place = (geo: THREE.BufferGeometry, color: any, d: number, extra: any = {}) =>
      b.part(geo, color, { bone: joint, at: at(d), dir: out, ...extra });

    // tire (octagon, flat face on the floor)
    place(cyl(RC, WID, 8).rotateY(Math.PI / 8), tirePaint, 0, { flat: true });
    // sidewall bead rings
    place(cyl(RC * 0.8, WID + 0.04, 8).rotateY(Math.PI / 8), P.rubber, 0, { flat: true });

    // tread blocks, merged per wheel (model space)
    const blocks: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 8; k++)
      for (const j of [-1, 1]) {
        const a = ((k * 45 + j * 12) * Math.PI) / 180;
        const g = box(WID + 0.02, 0.06, 0.2);
        g.rotateX(a);
        g.translate(c.x, c.y + 0.722 * Math.cos(a), c.z + 0.722 * Math.sin(a));
        blocks.push(g);
      }
    b.part(mergeGeometries(blocks)!, P.tire, { bone: joint, at: [0, 0, 0], flat: true });

    // hub: steel dish, textured face, bolts, cap
    place(cyl(0.46, 0.1, 8), steelPaint, 0.33, { flat: true });
    place(new THREE.CircleGeometry(0.43, 16), P.white, 0.385, { axis: "z", texture: HUB });
    const bg: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      bg.push(cyl(0.03, 0.04, 6).translate(0.285 * Math.sin(a), 0, 0.285 * Math.cos(a)));
    }
    // bolt heads built around local Y axis, then oriented with the wheel
    b.part(mergeGeometries(bg)!, P.steel, { bone: joint, at: at(0.4), dir: out, flat: true });
    place(cyl(0.14, 0.1, 8), P.gunmetal, 0.44, { flat: true });
    place(cyl(0.07, 0.06, 6), P.hazard, 0.49, { flat: true });

    // inner drum, brake disc
    place(cyl(0.3, 0.06, 8), gunPaint, -0.33, { flat: true });
    place(cyl(0.32, 0.04, 12), P.steel, -0.45, { flat: true });
    place(cyl(0.12, 0.08, 8), P.gunmetal, -0.45, { flat: true });

    // brake caliper (on the body)
    b.part(box(0.12, 0.16, 0.22), P.hazard, {
      bone: body,
      at: [s * 1.0, 0.7 - 0.3, z + 0.04],
    });
    b.part(box(0.06, 0.06, 0.1), P.gunmetal, { bone: body, at: [s * 0.93, 0.4, z + 0.18] });

    // mud flap trailing the wheel
    const fz = z - 0.9;
    b.part(box(0.55, 0.5, 0.05), P.rubber, { bone: body, at: [s * AX, 0.5, fz] });
    b.part(box(0.55, 0.08, 0.06), P.hazard, { bone: body, at: [s * AX, 0.3, fz] });
    b.part(box(0.6, 0.06, 0.1), P.gunmetal, { bone: body, at: [s * AX, 0.76, fz + 0.03] });
    // flap support arm
    b.part(box(0.06, 0.06, 0.3), P.gunmetal, { bone: body, at: [s * AX, 0.78, fz + 0.18] });
  }

  // ---------- axles, differentials, springs
  for (const [name, z] of axles) {
    // beam and half-shafts
    b.rod([-1.2, 0.7, z], [1.2, 0.7, z], 0.1, gunPaint, { bone: body, sides: 8 });
    for (const s of [1, -1]) {
      b.rod([s * 0.8, 0.7, z], [s * 1.2, 0.7, z], 0.135, steelPaint, { bone: body, sides: 8 });
      // axle boot
      b.part(cyl(0.16, 0.12, 8), P.rubber, { bone: body, at: [s * 0.62, 0.7, z], dir: [1, 0, 0], flat: true });
      // axle nut flange at the wheel
      b.part(cyl(0.2, 0.05, 8), P.gunmetal, { bone: body, at: [s * 1.14, 0.7, z], dir: [1, 0, 0], flat: true });
    }

    // differential housing
    const dif = new THREE.SphereGeometry(0.3, 8, 6);
    b.part(dif, gunPaint, { bone: body, at: [0, 0.7, z], scale: [1, 0.9, 1.1], flat: true });
    b.part(box(0.4, 0.16, 0.3), P.gunmetal, { bone: body, at: [0, 0.53, z] });
    b.part(cyl(0.2, 0.08, 8), P.steel, { bone: body, at: [0, 0.7, z + 0.33], dir: [0, 0, 1], flat: true });
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      b.part(cyl(0.022, 0.04, 6), P.hazard, {
        bone: body,
        at: [0.15 * Math.cos(a), 0.7 + 0.15 * Math.sin(a), z + 0.38],
        dir: [0, 0, 1],
        flat: true,
      });
    }
    b.part(cyl(0.04, 0.2, 6), P.steel, { bone: body, at: [0.1, 0.96, z - 0.05], flat: true });
    b.part(cyl(0.065, 0.04, 6), P.hazard, { bone: body, at: [0.1, 1.07, z - 0.05], flat: true });

    // leaf spring packs, under the axle
    for (const s of [1, -1]) {
      const layers: [number, number, any][] = [
        [1.3, 0.56, P.steel],
        [1.0, 0.52, P.gunmetal],
        [0.72, 0.48, P.steel],
      ];
      for (const [len, y, col] of layers) b.part(box(0.17, 0.034, len), col, { bone: body, at: [s * 0.78, y, z] });
      // clamp band and u-bolt plate
      b.part(box(0.23, 0.14, 0.12), P.gunmetal, { bone: body, at: [s * 0.78, 0.55, z] });
      b.part(box(0.2, 0.03, 0.22), P.hazard, { bone: body, at: [s * 0.78, 0.455, z] });
      // eye shackles at the ends
      for (const e of [1, -1]) {
        b.part(cyl(0.05, 0.22, 6), P.gunmetal, {
          bone: body,
          at: [s * 0.78, 0.6, z + e * 0.67],
          dir: [1, 0, 0],
          flat: true,
        });
        b.part(box(0.05, 0.16, 0.05), P.steel, { bone: body, at: [s * 0.78 + 0.08, 0.68, z + e * 0.67] });
        b.part(box(0.05, 0.16, 0.05), P.steel, { bone: body, at: [s * 0.78 - 0.08, 0.68, z + e * 0.67] });
      }
    }
    void name;
  }

  // ---------- drive shafts between axles
  for (let i = 0; i < axles.length - 1; i++) {
    const z0 = axles[i][1] - 0.35;
    const z1 = axles[i + 1][1] + 0.4;
    b.rod([0, 0.7, z0], [0, 0.7, z1], 0.07, steelPaint, { bone: body, sides: 8 });
    const mid = (z0 + z1) / 2;
    b.part(cyl(0.11, 0.3, 8), P.gunmetal, { bone: body, at: [0, 0.7, mid], dir: [0, 0, 1], flat: true });
    for (const zz of [z0, z1]) {
      b.part(new THREE.SphereGeometry(0.11, 6, 4), P.gunmetal, { bone: body, at: [0, 0.7, zz], flat: true });
      b.part(box(0.2, 0.05, 0.05), P.hazard, { bone: body, at: [0, 0.7, zz] });
    }
    // shaft guard cradle
    b.part(box(0.28, 0.04, 0.4), P.gunmetal, { bone: body, at: [0, 0.54, mid] });
  }
  // crossmember tying axles
  for (const s of [1, -1])
    b.rod([s * 0.45, 0.62, axles[0][1]], [s * 0.45, 0.62, axles[2][1]], 0.05, P.gunmetal, { bone: body, sides: 4 });
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, stripes, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRailgun({ b, J, P, M }: any) {
  const T = J.turret;
  const G = J.gun;

  // ---------- paints ----------
  const ARMOR = paint((p, n) => {
    const top = n.y > 0.6;
    const wear = Math.sin(p.x * 17 + p.z * 11) * Math.sin(p.z * 7 - p.y * 13) > 0.8;
    if (wear) return P.hullDark;
    return top ? P.hullLight : n.y < -0.3 ? P.hullDark : P.hull;
  });
  const GUNMETAL = paint((p, n) => {
    const streak = Math.sin(p.z * 40 + p.x * 3) > 0.85;
    return streak ? P.steel : n.y > 0.5 ? "#3a3f48" : P.gunmetal;
  });
  const HAZ = stripes(P.hazard, P.tire, { size: 0.11, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const HAZ_Y = stripes(P.hazard, P.tire, { size: 0.11, axis: [0, 1, 1], width: 0.5, wobble: 0 });

  // ---------- helpers ----------
  const box = (size: number[], color: any, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...opts });
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, dir ? { bone, at, dir } : { bone, at });
  const lamp = (size: number[], at: number[], bone: any) => glow(box(size, P.neonCyan, at, bone), 1.6);

  // ---------- textures ----------
  const MARK = svg(
    `<svg viewBox="0 0 128 64"><rect x="2" y="2" width="124" height="60" rx="4" fill="#2b2f36" stroke="#e8e8e0" stroke-width="3"/>
    <text x="64" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e8e8e0">RG-01</text>
    <rect x="14" y="40" width="100" height="6" fill="#b8322a"/><path d="M14 52h100" stroke="#e7b814" stroke-width="3" stroke-dasharray="8 5"/></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4L61 58H3Z" fill="#e7b814" stroke="#15171a" stroke-width="5" stroke-linejoin="round"/>
    <rect x="29" y="22" width="6" height="20" fill="#15171a"/><rect x="29" y="46" width="6" height="6" fill="#15171a"/></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 64"><path d="M8 14L32 34L56 14V28L32 48L8 28Z" fill="#b8322a" stroke="#e8e8e0" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const decal = (tex: any, size: number[], at: number[], dir: number[], bone: any) =>
    b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", { bone, at, dir, axis: "z", texture: tex });

  // ================= TURRET =================
  const [tx, ty, tz] = M.turretRing;
  // rotating base
  b.part(new THREE.CylinderGeometry(1.0, 1.05, 0.3, 10), GUNMETAL, { bone: T, at: [tx, ty + 0.15, tz], flat: true });
  // octagonal turret body
  b.part(new THREE.CylinderGeometry(1.1, 1.0, 0.5, 8), ARMOR, { bone: T, at: [tx, ty + 0.55, tz], flat: true });
  b.part(new THREE.CylinderGeometry(0.95, 1.1, 0.12, 8), ARMOR, { bone: T, at: [tx, ty + 0.86, tz], flat: true });
  // hazard trim ring on base
  b.part(new THREE.CylinderGeometry(1.06, 1.06, 0.08, 10, 1, true), HAZ, { bone: T, at: [tx, ty + 0.3, tz], flat: true });

  // right-side armour housing (-x)
  box([0.5, 0.6, 1.6], ARMOR, [-1.0, 2.35, -1.0], T);
  box([0.5, 0.08, 1.7], P.hullLight, [-1.0, 2.68, -1.0], T);
  box([0.1, 0.5, 1.2], P.hullDark, [-1.3, 2.35, -1.0], T);
  decal(MARK, [0.9, 0.45], [-1.31, 2.4, -1.0], [-1, 0, 0], T);
  // ammo boxes on top of housing
  for (let i = 0; i < 2; i++) {
    const z = -1.45 + i * 0.85;
    box([0.4, 0.26, 0.6], P.hullDark, [-1.0, 2.84, z], T);
    box([0.42, 0.06, 0.12], HAZ, [-1.0, 2.99, z], T);
    box([0.04, 0.12, 0.2], P.steel, [-1.22, 2.84, z], T);
  }

  // capacitor boxes at the front of the turret
  for (const s of [1, -1]) {
    box([0.46, 0.4, 0.5], P.gunmetal, [s * 0.62, 2.3, -0.05], T);
    box([0.5, 0.06, 0.54], P.steel, [s * 0.62, 2.53, -0.05], T);
    lamp([0.34, 0.05, 0.03], [s * 0.62, 2.3, 0.215], T);
    lamp([0.34, 0.05, 0.03], [s * 0.62, 2.4, 0.215], T);
  }

  // coolant tank rear-left with warning decal
  cyl(0.26, 0.85, 10, P.steel, [0.72, 2.45, -1.95], T);
  cyl(0.28, 0.08, 10, P.gunmetal, [0.72, 2.9, -1.95], T);
  cyl(0.28, 0.08, 10, P.gunmetal, [0.72, 2.0, -1.95], T);
  cyl(0.07, 0.1, 6, P.markRed, [0.72, 2.98, -1.95], T);
  for (const y of [2.3, 2.6]) cyl(0.275, 0.05, 10, P.hazard, [0.72, y, -1.95], T);
  decal(WARN, [0.22, 0.22], [0.9, 2.45, -2.18], [0.6, 0, -0.8], T);

  // ladder on left side
  for (const z of [-0.6, -1.4]) box([0.05, 0.62, 0.05], P.steel, [1.14, 2.35, z], T);
  for (let i = 0; i < 5; i++) box([0.05, 0.04, 0.8], P.steel, [1.14, 2.1 + i * 0.12, -1.0], T);
  // hatch
  cyl(0.28, 0.06, 8, P.hullDark, [0.3, 2.935, -1.9], T);
  cyl(0.06, 0.05, 6, P.steel, [0.3, 2.98, -1.9], T);
  decal(CHEV, [0.3, 0.3], [-1.0, 2.88, -1.0], [0, 1, 0], T);

  // ================= GUN CRADLE =================
  // trunnion discs + bolts
  for (const s of [1, -1]) {
    cyl(0.4, 0.14, 12, P.gunmetal, [s * 0.78, 2.55, -1.0], G, [s, 0, 0]);
    cyl(0.16, 0.06, 8, P.steel, [s * 0.87, 2.55, -1.0], G, [s, 0, 0]);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      cyl(0.03, 0.05, 5, P.steel, [s * 0.86, 2.55 + Math.cos(a) * 0.29, -1.0 + Math.sin(a) * 0.29], G, [s, 0, 0]);
    }
    // cradle side plate
    box([0.16, 0.9, 1.7], GUNMETAL, [s * 0.57, 2.75, -1.0], G);
    box([0.2, 0.06, 1.74], HAZ, [s * 0.57, 3.2, -1.0], G);
  }
  box([1.0, 0.18, 1.4], P.gunmetal, [0, 2.64, -0.9], G);

  // ================= RAILS =================
  const RY = 2.9;
  for (const s of [1, -1]) {
    box([0.3, 0.38, 5.5], GUNMETAL, [s * 0.28, RY, 1.65], G);
    // top bevel lines
    box([0.1, 0.03, 5.5], P.steel, [s * 0.32, RY + 0.2, 1.65], G);
    // inner glowing capacitor strip
    lamp([0.03, 0.12, 5.0], [s * 0.115, RY, 1.6], G);
    lamp([0.03, 0.04, 5.0], [s * 0.115, RY + 0.12, 1.6], G);
    // outer light studs
    for (let i = 0; i < 6; i++) box([0.03, 0.08, 0.08], P.steel, [s * 0.435, RY + 0.08, 0.2 + i * 0.7], G);
  }
  // coil bridges + glow
  for (let i = 0; i < 5; i++) {
    const z = 0.2 + i * 0.8;
    box([1.0, 0.08, 0.2], P.gunmetal, [0, 3.13, z], G);
    lamp([0.84, 0.02, 0.1], [0, 3.18, z], G);
    for (const s of [1, -1]) box([0.06, 0.4, 0.2], P.gunmetal, [s * 0.46, 2.92, z], G);
  }
  // glow rings
  for (let i = 0; i < 5; i++) {
    for (const s of [1, -1]) {
      glow(
        b.part(new THREE.TorusGeometry(0.27, 0.03, 4, 8), P.neonCyan, { bone: G, at: [s * 0.28, RY, 0.6 + i * 0.8] }),
        1.8,
      );
    }
  }
  // rail support brackets (stay below 2.71, above cab roof only at 2.6)
  for (const z of [-0.2, 1.0, 2.2, 3.4]) {
    box([1.0, 0.1, 0.3], P.hullDark, [0, 2.66, z], G);
    box([0.3, 0.1, 0.4], HAZ, [0, 2.66, z], G);
  }

  // ================= BREECH =================
  box([1.2, 0.8, 1.3], ARMOR, [0, 2.8, -1.75], G);
  box([1.24, 0.06, 1.34], P.hullLight, [0, 3.17, -1.75], G);
  box([1.1, 0.08, 0.5], HAZ, [0, 2.45, -1.2], G);
  // capacitor banks (cylinders along z on the sides)
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 8), P.gunmetal, {
      bone: G,
      at: [s * 0.82, 2.8, -1.8],
      dir: [0, 0, 1],
      flat: true,
    });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.CylinderGeometry(0.235, 0.235, 0.1, 8), HAZ_Y, {
        bone: G,
        at: [s * 0.82, 2.8, -2.2 + k * 0.4],
        dir: [0, 0, 1],
        flat: true,
      });
    lamp([0.03, 0.3, 0.5], [s * 1.04, 2.8, -1.8], G);
    box([0.08, 0.3, 0.3], P.steel, [s * 0.82, 3.02, -1.2], G);
  }
  // cooling fins
  for (let i = 0; i < 6; i++) box([1.1, 0.05, 0.16], P.steel, [0, 2.6 + i * 0.1, -2.45], G);
  box([0.8, 0.7, 0.1], P.hullDark, [0, 2.8, -2.4], G);
  // recoil buffer
  cyl(0.2, 0.9, 10, P.gunmetal, [0, 2.85, -3.0], G, [0, 0, 1]);
  cyl(0.09, 0.7, 8, P.steel, [0, 2.85, -3.4], G, [0, 0, 1]);
  cyl(0.24, 0.1, 10, P.hazard, [0, 2.85, -2.62], G, [0, 0, 1]);
  box([0.5, 0.5, 0.1], P.gunmetal, [0, 2.85, -3.55], G);

  // ================= MUZZLE BRAKE =================
  b.frustumBox([0, RY, 3.9], [0, RY, 4.5], [0.95, 0.5], [1.15, 0.7], { bone: G, color: GUNMETAL });
  for (let i = 0; i < 3; i++) box([1.2, 0.05, 0.08], P.tire, [0, RY + 0.16, 4.05 + i * 0.14], G);
  for (const s of [1, -1]) box([0.04, 0.3, 0.3], P.tire, [s * 0.55, RY, 4.2], G);
  lamp([0.2, 0.04, 0.04], [0, RY, 4.51], G);

  // ================= OPTICS =================
  box([0.3, 0.24, 0.5], P.gunmetal, [0.66, 3.0, 0.9], G);
  box([0.32, 0.05, 0.54], P.hazard, [0.66, 3.14, 0.9], G);
  glow(cyl(0.09, 0.05, 8, P.neonCyan, [0.66, 3.0, 1.17], G, [0, 0, 1]), 2);
  cyl(0.12, 0.12, 8, P.tire, [0.66, 3.0, 1.13], G, [0, 0, 1]);
  box([0.1, 0.1, 0.3], P.steel, [0.58, 2.88, 0.9], G);

  // ================= CABLES =================
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.62, 2.55, -0.3],
        [s * 0.7, 2.75, -0.7],
        [s * 0.62, 2.95, -1.0],
        [s * 0.5, 3.05, -1.2],
      ]),
      0.035,
      { color: P.rubber, bone: G, sides: 5 },
    );
  }
  b.sweep(
    catmull([
      [0, 3.17, -0.9],
      [0, 3.25 > 3.2 ? 3.19 : 3.2, 0.0],
      [0, 3.17, 0.15],
    ]),
    0.03,
    { color: P.rubber, bone: G, sides: 5 },
  );
}
```
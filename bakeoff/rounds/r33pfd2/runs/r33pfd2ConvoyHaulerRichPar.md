<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Z-9 'Wardog'",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a slab-sided cab, roof turret and a sealed glowing cargo pod strapped on the rear bed.",
  "builderName": "convoyHauler",
  "size": [2.8, 3.1, 8.0],
  "layout": "Long heavy truck facing +Z. Front (z 4.0 to 1.8): wedge armoured bumper with plow blade, hazard-striped, neon headlight bars, slab cab with angled slit windshield glowing cyan, roof turret ring behind the cab roof. Middle (z 1.8 to -4.0): flat armoured chassis deck with six big chunky wheels (three per side) in side armour skirts, fuel and battery boxes underneath. Rear (z -0.6 to -3.9): a sealed cargo pod, a rounded-box capsule with ribbed plating, strap bands, magenta glowing seal lines, warning decals and a roof beacon, held by four clamps to the deck. Palette is dark gunmetal with hazard yellow trim, neon cyan and magenta accents, rust-orange wear on lower edges. All forms are chunky faceted primitives with painted panel seams and emissive strips.",
  "palette": {
    "hull": "#3b4250",
    "hullDark": "#1f232c",
    "trim": "#e7b814",
    "rust": "#a4531f",
    "tire": "#15161a",
    "rim": "#7b8494",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "glass": "#0c2a3a",
    "podWhite": "#c9ced8",
    "podSeal": "#ff2fb4",
    "warnRed": "#e0262f"
  },
  "mounts": {
    "deckTop": [0, 1.35, 0],
    "cabFloor": [0, 1.35, 2.7],
    "turretRing": [0, 2.75, 1.6],
    "podBase": [0, 1.35, -2.25],
    "axleFront": [0, 0.62, 2.7],
    "axleMid": [0, 0.62, -0.4],
    "axleRear": [0, 0.62, -2.9],
    "bumperJoin": [0, 0.8, 3.5]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.75, 1.6], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.0, 1.6], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.2, 0.62, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.2, 0.62, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.2, 0.62, -0.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.2, 0.62, -0.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.2, 0.62, -2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.2, 0.62, -2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Armoured flat-bed frame: main slab hull deck with painted panel seams and rivets (panelled paint on hull), side armour skirts with cutouts for wheels, underbody fuel tanks, battery boxes, exhaust stacks behind the cab, rear bumper with tail light bars (warnRed glow), hazard-striped edge trim, rust gradient on lower edges, tow hooks, mudflaps. Rides joint body.",
      "box": [[-1.4, 0.35, -4.0], [1.4, 1.5, 1.9]],
      "attaches": "Cab sits on cabFloor at its front end; pod sits on podBase on deckTop; wheels turn at the axle mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Slab-sided armoured cab with sloped faceted hood, wedge front bumper with plow blade and hazard stripes (bumperJoin), slit windshield and side windows (glass colour plus cyan glowing reflection decal), neon headlight bars, roof light bar, side mirrors, door seams and handles, antenna, exhaust and grille vents, a painted corporate emblem SVG on the door and roof plate.",
      "box": [[-1.4, 0.7, 1.8], [1.4, 2.75, 4.0]],
      "attaches": "Floor at cabFloor y 1.35; bumper joins chassis at bumperJoin; turret ring on roof at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "wheels",
      "builds": "Six chunky low-poly wheels with 10-sided tyres (tire colour, painted tread notches), hex rims with rim colour, neon cyan hub rings glowing, bolt rings, brake discs and axle stubs, plus wheel-arch fenders in hull colour with trim edge. Each wheel is a child of its own wheel joint, radius 0.62, tyre width 0.5. Wheels rest on y = 0.",
      "box": [[-1.6, 0.0, -3.5], [1.6, 1.25, 3.3]],
      "attaches": "Centered on axleFront, axleMid, axleRear at x +-1.2 on joints wheelFL..wheelRR.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "turret",
      "builds": "Roof turret: lathe-turned ring base on turretRing, faceted dome housing rotating on turretYaw, twin gun barrels with muzzle brakes and shrouds on gunPitch, ammo box with belt feed, sensor eye with glowing magenta lens, small radar dish, hazard stripe band and painted unit number decals.",
      "box": [[-0.7, 2.7, 0.9], [0.7, 3.5, 2.5]],
      "attaches": "Base ring sits on cabroof at turretRing; barrels point +Z.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "cargoPod",
      "builds": "The sealed cargo pod: long rounded-box capsule of faceted podWhite plating with ribbed panel paint, rust and soot scuffs near the bottom, four hull-colour strap bands with buckles, a glowing magenta seal seam running around its length with a lock plate, warning hazard decals and biohazard-like SVG emblem, serial number text, roof beacon (warnRed glow), four base clamps and cradle rails bolted to the deck, small status screen with cyan glow, pipe conduits and end caps with vent grilles.",
      "box": [[-1.3, 1.35, -3.95], [1.3, 3.1, -0.55]],
      "attaches": "Cradle sits on deckTop at podBase; fully static on joint body.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, countershade, stripes, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const [cx, cy, cz] = M.turretRing;
  const GUN = "#12141a";
  const BRASS = "#b8924a";
  const hullP = countershade(P.hull, P.hullDark, { level: -0.2 });
  const hazard = stripes(P.trim, P.hullDark, { size: 0.06, axis: "x", width: 0.5, wobble: 0.05 });

  // ring base (lathe)
  b.lathe(
    [[0, 0], [0.62, 0], [0.62, 0.06], [0.55, 0.1], [0.55, 0.14], [0, 0.14]],
    { at: [cx, cy - 0.05, cz], bone: yaw, segments: 12, color: P.hullDark },
  );
  b.lathe(
    [[0.5, 0], [0.62, 0], [0.62, 0.05], [0.5, 0.05]],
    { at: [cx, cy + 0.08, cz], bone: yaw, segments: 12, color: hazard },
  );

  // dome housing
  b.lathe(
    [[0, 0], [0.55, 0], [0.55, 0.12], [0.48, 0.3], [0.3, 0.42], [0, 0.46]],
    { at: [cx, cy + 0.1, cz], bone: yaw, segments: 8, color: hullP },
  );
  // front gun mantlet
  b.part(new THREE.BoxGeometry(0.7, 0.3, 0.2), P.hull, { bone: yaw, at: [cx, cy + 0.3, cz + 0.5], flat: true });

  // hazard band
  b.part(new THREE.CylinderGeometry(0.57, 0.57, 0.05, 8, 1, true), hazard, { bone: yaw, at: [cx, cy + 0.2, cz] });

  // pitch cradle
  b.part(new THREE.BoxGeometry(0.2, 0.26, 0.3), P.hullDark, { bone: pitch, at: [cx, cy + 0.3, cz + 0.55] });

  // twin barrels
  for (const s of [1, -1]) {
    const x = cx + s * 0.16;
    const y = cy + 0.32;
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), P.hull, {
      bone: pitch, at: [x, y, cz + 0.85], dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.9, 8), GUN, {
      bone: pitch, at: [x, y, cz + 1.15], dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.14, 8), P.hullDark, {
      bone: pitch, at: [x, y, cz + 1.62], dir: [0, 0, 1],
    });
    for (const dy of [0.05, -0.05])
      b.part(new THREE.BoxGeometry(0.1, 0.02, 0.1), GUN, { bone: pitch, at: [x, y + dy * 1.4, cz + 1.62] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8), P.neonCyan, {
      bone: pitch, at: [x, y, cz + 1.7], dir: [0, 0, 1],
    });
  }

  // ammo box + belt
  b.part(new THREE.BoxGeometry(0.26, 0.28, 0.34), P.hull, { bone: yaw, at: [cx + 0.5, cy + 0.2, cz - 0.05], flat: true });
  b.part(new THREE.BoxGeometry(0.28, 0.04, 0.36), P.trim, { bone: yaw, at: [cx + 0.5, cy + 0.36, cz - 0.05] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.05), BRASS, {
      bone: yaw, at: [cx + 0.38 - i * 0.06, cy + 0.28 + i * 0.03, cz + 0.1 + i * 0.08], rotation: [0, 0, 20],
    });

  // sensor eye
  b.part(new THREE.BoxGeometry(0.2, 0.18, 0.2), P.hullDark, { bone: yaw, at: [cx - 0.42, cy + 0.42, cz + 0.2], flat: true });
  glow(
    b.part(new THREE.SphereGeometry(0.06, 8, 6), P.neonMagenta, { bone: yaw, at: [cx - 0.42, cy + 0.42, cz + 0.32] }),
    1.6,
  );

  // radar dish
  b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6), P.rim, { bone: yaw, at: [cx - 0.3, cy + 0.55, cz - 0.3] });
  b.part(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.4), P.podWhite, {
    bone: yaw, at: [cx - 0.3, cy + 0.72, cz - 0.3], rotation: [-70, 0, 0], flat: true,
  });
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 4), P.rim, { bone: yaw, at: [cx - 0.3, cy + 0.78, cz - 0.22], rotation: [-70, 0, 0] });

  // unit number decals
  const num = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#1f232c" stroke="#e7b814" stroke-width="4"/><text x="32" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="38" fill="#2ff3ff">09</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
      bone: yaw, at: [cx + s * 0.55, cy + 0.3, cz + 0.12], dir: [s, 0, 0], axis: "z", texture: num,
    });
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.5;
  const AMBER = "#ffb02e";

  const tread = paint((p, n, s) => {
    const a = s[0] * 10;
    const notch = Math.abs(n.x) < 0.5 && (a - Math.floor(a)) < 0.25;
    const dirt = noise(p, 0.3, 4) * smoothstep(0.7, 0, p.y);
    const base: [number, number, number] = notch ? [0.04, 0.04, 0.05] : [0.1, 0.1, 0.12];
    return mix(base, "#4a3a2a", dirt * 0.5);
  });

  const rimTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#7b8494" stroke="#1f232c" stroke-width="3"/>
    <circle cx="32" cy="32" r="12" fill="#2a2e38" stroke="#1f232c" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i * Math.PI) / 3;
      return `<circle cx="${32 + Math.cos(a) * 21}" cy="${32 + Math.sin(a) * 21}" r="2.6" fill="#1f232c"/>`;
    }).join("")}
    <circle cx="32" cy="32" r="4" fill="#e7b814"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.7], ["wheelFR", -1, 2.7],
    ["wheelML", 1, -0.4], ["wheelMR", -1, -0.4],
    ["wheelRL", 1, -2.9], ["wheelRR", -1, -2.9],
  ];

  const fenderOutline: [number, number][] = [
    [-0.78, 0], [-0.7, 0.45], [-0.35, 0.78], [0.35, 0.78], [0.7, 0.45], [0.78, 0],
    [0.68, 0], [0.6, 0.4], [0.3, 0.66], [-0.3, 0.66], [-0.6, 0.4], [-0.68, 0],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.2;
    const axis: [number, number, number] = [s, 0, 0];
    const at = (o: number): [number, number, number] => [cx + s * o, R, z];

    // tyre
    b.part(new THREE.CylinderGeometry(R, R, W, 10), tread, { bone: j, at: at(0), dir: axis, flat: true });
    // sidewall shoulder rings
    for (const o of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.82, R * 0.9, 0.05, 10), P.tire, { bone: j, at: at(o * (W / 2 - 0.01)), dir: axis, flat: true });
    }
    // outer rim face (textured)
    const out = W / 2 + 0.02;
    b.part(new THREE.CircleGeometry(R * 0.66, 6), "#ffffff", {
      bone: j, at: at(out * 1.0 + 0.0), dir: axis, axis: "z", texture: rimTex,
    });
    b.part(new THREE.CylinderGeometry(R * 0.62, R * 0.62, W * 0.9, 6), P.rim, { bone: j, at: at(0), dir: axis, flat: true });
    // hub cap
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 8), P.hullDark, { bone: j, at: at(out + 0.05), dir: axis, flat: true });
    // glowing cyan hub ring
    glow(b.part(new THREE.TorusGeometry(R * 0.4, 0.025, 5, 16), P.neonCyan, { bone: j, at: at(out + 0.015), dir: axis, axis: "z" }), 1.6);
    // bolts
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + 0.26;
      const y = R + Math.cos(a) * R * 0.28;
      const zz = z + Math.sin(a) * R * 0.28;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.trim, { bone: j, at: [cx + s * (out + 0.03), y, zz], dir: axis });
    }
    // brake disc and caliper on inner side
    b.part(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.04, 12), P.hullDark, { bone: j, at: at(-(W / 2 + 0.03)), dir: axis, flat: true });
    b.part(new THREE.BoxGeometry(0.08, 0.2, 0.16), P.rust, { bone: j, at: [cx - s * (W / 2 + 0.05), R + R * 0.4, z + 0.05] });
    // axle stub toward the chassis
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8), P.hullDark, { bone: j, at: [s * 0.95, R, z], dir: axis });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 8), P.rim, { bone: j, at: [s * 0.78, R, z], dir: axis });

    // fender arch (extruded along x), trim edge on top
    const fx = cx;
    const f = b.extrude(fenderOutline.map(([u, v]) => [u, v + R + 0.18] as [number, number]), {
      at: [fx - W * 0.5, 0, z], x: [0, 0, 1], y: [0, 1, 0], thickness: W * 1.05, bone: j, color: P.hull, smoothing: 0,
    });
    void f;
    b.part(new THREE.BoxGeometry(W * 1.1, 0.04, 0.52), P.trim, { bone: j, at: [fx, R + 0.18 + 0.78, z] });
    // fender rust lip
    b.part(new THREE.BoxGeometry(W * 1.1, 0.06, 0.1), P.rust, { bone: j, at: [fx, R + 0.2, z + 0.74] });
    b.part(new THREE.BoxGeometry(W * 1.1, 0.06, 0.1), P.rust, { bone: j, at: [fx, R + 0.2, z - 0.74] });
    // amber marker light
    glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 0.12), AMBER, { bone: j, at: [fx + s * (W * 0.55), R + 0.7, z + 0.55] }), 1.3);
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: any) {
  const bone = J.body;
  const FLOOR = M.cabFloor[1];
  const box = (w: number, h: number, d: number, color: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...opt });

  const hull = paint((p: any, n: any) => {
    let c = mix(P.hull, P.hullDark, 0.35 * (1 - smoothstep(-0.5, 0.8, n.y)));
    c = mix(c, P.rust, 0.5 * smoothstep(1.5, 0.8, p.y) * noise(p, 0.3, 4));
    const u = Math.abs(((p.y * 3) % 1) - 0.5);
    const v = Math.abs(((p.z * 2.2) % 1) - 0.5);
    if (u > 0.485 || v > 0.49) c = mix(c, P.hullDark, 0.8);
    return c;
  });
  const hazard = paint((p: any) => (Math.floor((p.x + p.y) / 0.14) % 2 ? P.trim : P.hullDark));

  // cab body
  box(2.7, 1.1, 2.0, hull, [0, 1.9, 2.7]);
  // upper cabin, set back
  box(2.6, 0.75, 1.1, hull, [0, 2.8 - 0.2, 2.2]);
  // sloped hood
  b.frustumBox([0, 1.75, 3.0], [0, 1.75, 3.95], [2.5, 0.7], [2.3, 0.4], { bone, color: hull });
  // roof plate
  box(2.5, 0.06, 1.0, P.hullDark, [0, 2.76, 2.2]);
  // lower body / sill
  box(2.8, 0.35, 2.2, P.hullDark, [0, 1.0, 2.85]);

  // bumper wedge
  b.frustumBox([0, 0.95, 3.45], [0, 0.95, 4.0], [2.7, 0.5], [2.4, 0.3], { bone, color: hazard });
  b.extrude(
    [[-1.3, 0], [1.3, 0], [1.1, 0.5, "sharp"], [-1.1, 0.5, "sharp"]],
    { at: [0, 0.35, 3.98], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08, color: P.hullDark, bone },
  );
  b.part(new THREE.BoxGeometry(2.6, 0.12, 0.2), P.trim, { bone, at: [0, 0.38, 4.05], flat: true });

  // windshield slit
  box(2.1, 0.32, 0.05, P.glass, [0, 2.55, 3.1], { rotation: [-18, 0, 0] });
  const refl = svg(
    `<svg viewBox="0 0 100 20"><path d="M5 18 L25 2 L40 2 L20 18Z M45 18 L65 2 L72 2 L52 18Z" fill="#2ff3ff" opacity="0.8"/></svg>`,
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.0, 0.3), "#ffffff", {
      bone, at: [0, 2.55, 3.13], dir: [0, 0.31, 0.95], axis: "z", texture: refl,
    }),
    1.2,
  );

  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1f232c" stroke="#e7b814" stroke-width="4"/><path d="M32 12 L50 44 H14Z" fill="none" stroke="#2ff3ff" stroke-width="4"/><circle cx="32" cy="36" r="5" fill="#ff2fb4"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    // side windows
    box(0.04, 0.4, 0.8, P.glass, [s * 1.32, 2.4, 2.4]);
    glow(
      b.part(new THREE.PlaneGeometry(0.7, 0.3), P.neonCyan, {
        bone, at: [s * 1.345, 2.4, 2.4], dir: [s, 0, 0], axis: "z",
      }),
      0.6,
    );
    // door seams, handle
    box(0.03, 1.0, 0.04, P.hullDark, [s * 1.36, 1.85, 2.0]);
    box(0.03, 1.0, 0.04, P.hullDark, [s * 1.36, 1.85, 2.95]);
    box(0.06, 0.06, 0.2, P.trim, [s * 1.38, 1.9, 2.8]);
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
      bone, at: [s * 1.37, 1.6, 2.5], dir: [s, 0, 0], axis: "z", texture: emblem,
    });
    // mirrors
    b.rod([s * 1.4, 2.2, 3.1], [s * 1.75, 2.35, 3.15], 0.025, P.hullDark, { bone });
    box(0.08, 0.35, 0.22, P.hullDark, [s * 1.8, 2.35, 3.15]);
    // headlight bars
    glow(box(0.7, 0.1, 0.06, P.neonCyan, [s * 0.8, 1.45, 3.97]), 1.5);
    // grille vents
    for (let i = 0; i < 3; i++) box(0.5, 0.04, 0.05, P.hullDark, [s * 0.75, 1.1 + i * 0.1, 4.0]);
    // exhaust stacks
    b.rod([s * 1.2, 1.9, 1.95], [s * 1.2, 2.9, 1.95], 0.09, P.hullDark, { bone });
    b.part(new THREE.CylinderGeometry(0.12, 0.09, 0.08, 8), P.rust, { bone, at: [s * 1.2, 2.92, 1.95] });
    // fender trim
    box(0.12, 0.08, 1.9, P.trim, [s * 1.38, 1.38, 2.8]);
  }
  // roof plate emblem
  b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
    bone, at: [0, 2.795, 2.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: emblem,
  });
  // roof light bar
  box(1.6, 0.1, 0.16, P.hullDark, [0, 2.85, 2.9]);
  for (let i = 0; i < 5; i++)
    glow(box(0.24, 0.07, 0.17, i % 2 ? P.neonMagenta : P.neonCyan, [-0.64 + i * 0.32, 2.87, 2.9]), 1.4);
  // antenna
  b.rod([-1.15, 2.76, 1.95], [-1.25, 3.5, 1.9], [0.025, 0.012], P.hullDark, { bone });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnRed, { bone, at: [-1.25, 3.52, 1.9] });
  // turret ring seat
  b.lathe([[0, 0], [0.62, 0], [0.55, 0.06], [0, 0.06]], { at: [M.turretRing[0], 2.76, M.turretRing[2]], color: P.hullDark, bone });
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(9);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });

  const rustWear = (base: string) =>
    paint((p, n) => {
      const low = smoothstep(0.75, 0.38, p.y);
      const nz = noise(p, 0.25, 4);
      return mix(base, P.rust, Math.min(1, low * (0.5 + nz * 0.9)));
    });
  const hullPaint = panelled(rustWear(P.hull), { size: 0.5, aspect: 0.8, rivets: 0.1, seam: P.hullDark });
  const darkPaint = panelled(rustWear(P.hullDark), { size: 0.4, rivets: 0.12, seam: "#0c0d10" });

  const hazard = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="16" fill="${P.trim}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#111"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );

  // main deck slab
  box(2.8, 0.3, 5.9, hullPaint, [0, 1.2, -1.05]);
  // frame rails underneath
  for (const s of [1, -1]) box(0.3, 0.3, 5.7, darkPaint, [s * 0.7, 0.95, -1.05]);
  // cross members
  for (const z of [1.5, 0.4, -0.7, -1.8, -2.9]) box(1.6, 0.18, 0.2, darkPaint, [0, 0.82, z]);

  // deck edge hazard trim
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.12, 5.9), "#ffffff", { bone, at: [s * 1.36, 1.38, -1.05], texture: hazard, flat: true });
    box(0.06, 0.1, 5.9, P.trim, [s * 1.4, 1.3, -1.05]);
  }
  // raised deck rim at rear and front
  box(2.8, 0.1, 0.1, P.trim, [0, 1.38, 1.85]);

  // side skirts with wheel cutouts: segments between wheels
  const skirtZ: [number, number][] = [
    [1.45, 0.55],
    [-1.65, 1.2],
    [-3.6, 0.6],
  ];
  for (const s of [1, -1])
    for (const [z, len] of skirtZ) {
      box(0.14, 0.62, len, hullPaint, [s * 1.4, 0.95, z]);
      box(0.05, 0.1, len, P.trim, [s * 1.48, 1.2, z]);
      for (const k of [-1, 1]) b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), P.rim, { bone, at: [s * 1.49, 0.95, z + k * len * 0.3], dir: [s, 0, 0], flat: true });
    }
  // top side armour plates over arches
  for (const s of [1, -1])
    for (const z of [2.7, -0.4, -2.9]) {
      box(0.3, 0.1, 1.5, hullPaint, [s * 1.3, 1.32, z]);
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.rim, { bone, at: [s * 1.3, 1.39, z + 0.55], flat: true });
    }

  // fuel tanks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.3, 8), metal("steel", { tarnish: 0.5 }), {
      bone, at: [s * 0.62, 0.62, -1.65], dir: [0, 0, 1], flat: true,
    });
    for (const z of [-1.2, -2.1]) b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 8), P.trim, { bone, at: [s * 0.62, 0.62, z], dir: [0, 0, 1], flat: true });
  }
  // battery boxes
  for (const z of [1.1, 0.3]) {
    box(0.9, 0.35, 0.5, darkPaint, [0, 0.62, z]);
    box(0.7, 0.04, 0.12, P.neonCyan, [0, 0.82, z]);
    glow(b.part(new THREE.BoxGeometry(0.7, 0.04, 0.12), P.neonCyan, { bone, at: [0, 0.83, z] }), 1.4);
  }

  // exhaust stacks behind cab
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.5, 8), metal("iron"), { bone, at: [s * 1.15, 2.1, 1.7], flat: true });
    b.part(new THREE.CylinderGeometry(0.14, 0.1, 0.12, 8), P.hullDark, { bone, at: [s * 1.15, 2.88, 1.7], flat: true });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), P.trim, { bone, at: [s * 1.15, 1.7, 1.7], flat: true });
    box(0.3, 0.1, 0.3, darkPaint, [s * 1.15, 1.45, 1.7]);
  }

  // rear bumper
  box(2.8, 0.45, 0.35, darkPaint, [0, 0.8, -4.0]);
  b.part(new THREE.BoxGeometry(2.7, 0.16, 0.06), "#ffffff", { bone, at: [0, 0.62, -4.2], texture: hazard, flat: true });
  for (const s of [1, -1]) {
    glow(box(0.7, 0.14, 0.06, P.warnRed, [s * 0.85, 0.95, -4.2]), 1.6);
    box(0.78, 0.04, 0.08, P.hullDark, [s * 0.85, 1.04, -4.2]);
    // tow hooks
    b.sweep(
      [[s * 0.5, 0.7, -4.15], [s * 0.5, 0.7, -4.45], [s * 0.5, 0.52, -4.5], [s * 0.5, 0.45, -4.3]],
      0.035, { bone, color: metal("steel"), sides: 6 },
    );
    // mudflaps
    box(0.5, 0.5, 0.04, P.tire, [s * 1.0, 0.45, -3.78]);
    box(0.5, 0.05, 0.05, P.trim, [s * 1.0, 0.72, -3.78]);
    box(0.4, 0.06, 0.04, P.rust, [s * 1.0, 0.25, -3.78]);
  }
  // front tow hooks and mudflaps
  for (const s of [1, -1]) {
    box(0.04, 0.4, 0.5, P.tire, [s * 1.38, 0.5, 1.5]);
    b.part(new THREE.TorusGeometry(0.07, 0.025, 5, 8), metal("steel"), { bone, at: [s * 0.4, 0.62, 1.95], flat: true });
  }
  // rear bumper rivet studs
  for (let i = -5; i <= 5; i++) b.part(new THREE.SphereGeometry(0.03, 5, 3), P.rim, { bone, at: [i * 0.25, 0.93, -4.19], flat: true });

  // deck mounts: cradle rail holes marks & lashing points
  for (const s of [1, -1])
    for (const z of [-0.9, -3.5]) {
      b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8), P.trim, { bone, at: [s * 1.2, 1.38, z], rotation: [90, 0, 0], flat: true });
    }
  // deck stenciled panels
  const stencil = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" fill="none"/><text x="32" y="22" font-size="18" font-weight="bold" text-anchor="middle" fill="${P.trim}" font-family="monospace">Z-9</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", { bone, at: [0, 1.356, -4.0 + 0.2], dir: [0, 1, 0], axis: "z", texture: stencil });
  // underbody rust skid
  box(1.3, 0.08, 4.8, rustWear(P.rust) as any, [0, 0.72, -1.2]);
  // little neon underglow strips
  for (const s of [1, -1]) glow(box(0.05, 0.05, 4.6, P.neonCyan, [s * 1.33, 0.68, -1.3]), 1.2);
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, glow as _unused } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P, M }: any) {
  const bone = J.body;
  const Z0 = -2.25;       // pod centre z
  const BASE = 1.35;
  const CY = 2.2;         // pod centre y
  const RX = 1.25, RY = 0.85, LEN = 3.3;

  const plating = paint((p: any, n: any) => {
    const lit = 0.82 + 0.18 * smoothstep(-0.8, 0.8, n.y);
    let c: any = mix("#aeb4c0", "#c9ced8", noise(p, 0.3, 3));
    const rib = Math.abs(((p.z + 4) / 0.22) % 1 - 0.5);
    if (rib < 0.04) c = mix(c, "#5a6070", 0.7);
    const low = smoothstep(2.0, 1.4, p.y);
    c = mix(c, "#a4531f", low * 0.5 * smoothstep(0.4, 0.7, noise(p, 0.18, 7)));
    c = mix(c, "#25262c", low * 0.4 * smoothstep(0.5, 0.8, noise(p, 0.3, 11)));
    return [c[0] * lit, c[1] * lit, c[2] * lit];
  });

  const part = (g: any, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // main capsule: lofted rounded box
  b.loft(
    [
      { at: [0, CY - 0.05, Z0 - LEN / 2 + 0.1], w: 1.9, h: 1.35 },
      { at: [0, CY, Z0 - LEN / 2 + 0.35], w: 2.4, h: 1.65 },
      { at: [0, CY, Z0], w: 2.5, h: 1.72 },
      { at: [0, CY, Z0 + LEN / 2 - 0.35], w: 2.4, h: 1.65 },
      { at: [0, CY - 0.05, Z0 + LEN / 2 - 0.1], w: 1.9, h: 1.35 },
    ],
    { bone, color: plating, section: "box" } as any,
  );

  // end caps with vent grilles
  for (const s of [1, -1]) {
    const z = Z0 + s * (LEN / 2 + 0.02);
    part(box(1.5, 1.0, 0.1), P.hullDark, [0, CY, z]);
    for (let i = 0; i < 5; i++)
      part(box(1.3, 0.05, 0.06), P.hull, [0, CY - 0.36 + i * 0.18, z + s * 0.05]);
    part(box(0.2, 0.2, 0.12), P.rim, [0.5, CY + 0.38, z + s * 0.04]);
  }

  // strap bands with buckles
  for (const dz of [-1.2, -0.4, 0.4, 1.2]) {
    const z = Z0 + dz;
    part(box(2.56, 0.12, 0.2), P.hull, [0, CY + RY + 0.02, z]);
    for (const s of [1, -1]) {
      part(box(0.12, 1.6, 0.2), P.hull, [s * (RX + 0.02), CY, z]);
      part(box(0.14, 0.18, 0.1), P.trim, [s * (RX + 0.04), CY - 0.2, z + 0.1]);
      part(box(0.14, 0.18, 0.1), P.rim, [s * (RX + 0.04), CY + 0.35, z + 0.1]);
    }
    part(box(0.3, 0.06, 0.24), P.trim, [0, CY + RY + 0.09, z]);
  }

  // magenta seal seam on both sides + top, lock plate
  for (const s of [1, -1]) {
    glow(part(box(0.05, 0.07, LEN - 0.5), P.podSeal, [s * (RX + 0.03), CY + 0.05, Z0]), 1.5);
    part(box(0.12, 0.34, 0.5), P.hullDark, [s * (RX + 0.05), CY + 0.05, Z0]);
    glow(part(box(0.14, 0.08, 0.3), P.neonMagenta, [s * (RX + 0.08), CY + 0.05, Z0]), 1.8);
  }
  glow(part(box(0.07, 0.05, LEN - 0.6), P.podSeal, [0, CY + RY + 0.03, Z0 + 0.0]), 1.5);

  // decals
  const bio = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e7b814" stroke="#1f232c" stroke-width="4"/>
    <g fill="none" stroke="#1f232c" stroke-width="5"><circle cx="32" cy="32" r="5" fill="#1f232c"/>
    <path d="M32 27 A9 9 0 1 1 22 38"/><path d="M36 35 A9 9 0 0 1 23 43" transform="rotate(120 32 32)"/>
    <path d="M36 35 A9 9 0 0 1 23 43" transform="rotate(240 32 32)"/></g></svg>`,
    { size: 128 },
  );
  const serial = svg(
    `<svg viewBox="0 0 160 40"><rect width="160" height="40" rx="4" fill="#1f232c"/>
    <text x="80" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#e7b814">WD-9 / 0471-X</text></svg>`,
    { size: 256 },
  );
  const hazard = svg(
    `<svg viewBox="0 0 80 20"><rect width="80" height="20" fill="#e7b814"/>
    <g fill="#1f232c"><path d="M0 20 L10 0 L20 0 L10 20Z"/><path d="M20 20 L30 0 L40 0 L30 20Z"/><path d="M40 20 L50 0 L60 0 L50 20Z"/><path d="M60 20 L70 0 L80 0 L70 20Z"/></g></svg>`,
    { size: 128 },
  );
  const screenTex = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06222a"/>
    <path d="M4 28 L14 20 L22 24 L34 10 L44 18 L60 8" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <rect x="4" y="32" width="30" height="4" fill="#2ff3ff"/><text x="4" y="14" font-size="8" font-family="monospace" fill="#2ff3ff">SEALED</text></svg>`,
    { size: 128 },
  );
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff") =>
    part(new THREE.PlaneGeometry(w, h), tint, { at, dir, axis: "z", texture: tex });

  for (const s of [1, -1]) {
    const x = s * (RX + 0.035);
    plane(0.6, 0.6, bio, [x, CY + 0.2, Z0 + 1.0], [s, 0, 0]);
    plane(0.9, 0.22, serial, [x, CY - 0.45, Z0 - 0.7], [s, 0, 0]);
    plane(0.8, 0.2, hazard, [x, CY - 0.62, Z0 + 0.9], [s, 0, 0]);
  }
  plane(0.6, 0.6, bio, [0, CY + RY + 0.03, Z0 + 0.8], [0, 1, 0], "#ffffff");
  // status screen
  part(box(0.06, 0.4, 0.62), P.hullDark, [RX + 0.02, CY + 0.5, Z0 - 1.2]);
  glow(plane(0.54, 0.34, screenTex, [RX + 0.06, CY + 0.5, Z0 - 1.2], [1, 0, 0]), 1.4);

  // roof beacon
  part(new THREE.CylinderGeometry(0.2, 0.25, 0.08, 8), P.hullDark, [0, CY + RY + 0.17, Z0 - 1.4]);
  glow(part(new THREE.CylinderGeometry(0.14, 0.18, 0.2, 8), P.warnRed, [0, CY + RY + 0.3, Z0 - 1.4]), 2);

  // pipe conduits along the side tops
  for (const s of [1, -1]) {
    b.rod([s * 0.95, CY + RY - 0.02, Z0 - 1.5], [s * 0.95, CY + RY - 0.02, Z0 + 1.5], 0.06, P.rim, { bone });
    for (const dz of [-1.4, 0, 1.4])
      part(box(0.1, 0.12, 0.1), P.hullDark, [s * 0.95, CY + RY - 0.07, Z0 + dz]);
  }

  // cradle rails and clamps
  for (const s of [1, -1]) {
    part(box(0.2, 0.14, 3.4), P.hullDark, [s * 0.95, BASE + 0.07, Z0]);
    part(box(0.22, 0.04, 3.4), P.trim, [s * 0.95, BASE + 0.16, Z0]);
    for (const dz of [-1.3, 1.3]) {
      part(box(0.34, 0.5, 0.3), P.hull, [s * 1.1, BASE + 0.32, Z0 + dz]);
      part(box(0.5, 0.12, 0.34), P.hullDark, [s * 1.0, BASE + 0.62, Z0 + dz]);
      part(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 6), P.rim, [s * 1.0, BASE + 0.7, Z0 + dz]);
    }
  }
  // lower belly skid plates
  part(box(2.0, 0.1, 3.2), P.hullDark, [0, CY - RY + 0.0, Z0]);
  part(box(1.6, 0.4, 3.0), P.hullDark, [0, BASE + 0.35 + 0.25, Z0]);
}
```
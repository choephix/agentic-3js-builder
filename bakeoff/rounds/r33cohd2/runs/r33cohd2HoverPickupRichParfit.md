<!-- call: plan -->

```json
{
  "name": "Hoverbed Raider",
  "description": "A militarized pickup truck converted to run on four downward-firing hover thrusters, in low-poly cyberpunk style with neon trim, armour plates and a roof-mounted gun.",
  "builderName": "hoverPickup",
  "size": [2.5, 2.3, 5.6],
  "layout": "A chunky armoured pickup floating about 0.35 m above the floor on four angular thruster pods, one at each wheel position. Front (+Z): a sloped armoured hood with a slit grille, a cyan neon light bar and a bull-bar bumper. Middle: a boxy two-door cab with tinted faceted glazing, a roll cage and a roof rack with a small gun turret. Rear (-Z): an open cargo bed with a low armoured rim, a mounted missile pod rack and a rear neon strip. The hull is dark gunmetal with matte olive-drab armour plates, yellow hazard trim and magenta/cyan neon accents. Every part uses blocky chamfered primitives, panelled paint and emissive neon strips; decals and SVG textures carry the details (hazard stripes, kanji and number stencils, scratched emblem). The thruster pods hold the lowest points of the model (floor y ~0 with a glowing cyan downwash ring just above it). Underbody is flat and ribbed.",
  "palette": {
    "hull": "#2f3540",
    "hullDark": "#1b1f27",
    "armor": "#56603f",
    "armorLight": "#7a8559",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb8",
    "glass": "#1c3a4a",
    "metal": "#8a919c",
    "rubber": "#15161a",
    "thrusterGlow": "#6ff7ff",
    "lampWhite": "#fff6d0",
    "brakeRed": "#ff2a3a",
    "rust": "#7a4a2a"
  },
  "mounts": {
    "frameTop": [0, 0.95, 0],
    "cabFloor": [0, 0.95, 0.4],
    "hoodFront": [0, 1.2, 1.9],
    "bumperFront": [0, 0.75, 2.75],
    "bedFloor": [0, 0.95, -1.7],
    "bedRimTop": [0, 1.45, -1.7],
    "roofTop": [0, 2.0, 0.2],
    "turretRing": [0, 2.05, -0.5],
    "thrusterFL": [1.05, 0.55, 1.8],
    "thrusterFR": [-1.05, 0.55, 1.8],
    "thrusterRL": [1.05, 0.55, -1.8],
    "thrusterRR": [-1.05, 0.55, -1.8]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "thrusterFL", "parent": "body", "at": [1.05, 0.55, 1.8], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterFR", "parent": "body", "at": [-1.05, 0.55, 1.8], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRL", "parent": "body", "at": [1.05, 0.55, -1.8], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRR", "parent": "body", "at": [-1.05, 0.55, -1.8], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.05, -0.5], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 2.3, -0.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "doorL", "parent": "body", "at": [1.08, 1.4, 0.75], "dir": [0, 1, 0], "role": "hinge", "group": "cab" },
    { "name": "doorR", "parent": "body", "at": [-1.08, 1.4, 0.75], "dir": [0, 1, 0], "role": "hinge", "group": "cab" },
    { "name": "tailgate", "parent": "body", "at": [0, 1.0, -2.75], "dir": [1, 0, 0], "role": "hinge", "group": "bed" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Flat ribbed underbody and frame: two longitudinal frame rails, cross-members, a central armoured belly plate with panelled/rivet paint (panelled metal iron), fender-less side sills with hazard-yellow trim and number stencil decals, front and rear sub-frame boxes where the thrusters bolt on, hover-engine core box between the axles with cyan glowing vent slats and cables, a fuel/battery pack on each side with neon strips, and tow hooks.",
      "box": [[-1.2, 0.5, -2.8], [1.2, 1.05, 2.6]],
      "attaches": "Carries all thrusters at the four thruster mounts; cab and bed sit on frameTop; the front bumper mounts at bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "thrusters",
      "builds": "Four hover thruster pods, one per corner at the thruster mounts: each an angular hexagonal lathe nacelle with an armoured shroud, a bolted mounting arm up to the frame, an intake grille on the upper face, a downward nozzle ring with glowing thrusterGlow disc (glow kit) and a cyan emissive downwash ring and faint cone cards. Pods differ slightly: front pair larger. Hazard stripes on the shrouds, scorch paint near nozzles. Lowest points rest at y=0.",
      "box": [[-1.25, 0.0, -2.35], [1.25, 0.75, 2.35]],
      "attaches": "Each pod roots at its thruster mount joint (thrusterFL/FR/RL/RR) beneath the chassis sub-frames.",
      "joints": ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "cabShell",
      "builds": "The two-door armoured cab body from cabFloor to roofTop: faceted slab sides with a sloped A-pillar and C-pillar, angular armoured roof with panelled olive-drab paint, add-on armour plates bolted over the doors with rivets, doors as separate pieces on doorL/doorR, tinted faceted windows with slit shutters, side mirrors, a roll cage bar over the roof, a roof rack with jerry cans and an antenna, a rear cab wall with a sliding window, and a yellow hazard-striped cab-side stencil. Interior hint: seats, steering wheel and a glowing dash screen visible through glass.",
      "box": [[-1.15, 0.95, -0.9], [1.15, 2.05, 1.3]],
      "attaches": "Sits on cabFloor/frameTop; hood joins at its front face z=1.3; bed joins at its rear face z=-0.9; the turret ring is on the roof at turretRing.",
      "joints": ["body", "doorL", "doorR"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "hoodFront",
      "builds": "Front end from z=1.3 to 2.75: sloped armoured hood with raised ribs and vents, slit grille with glowing cyan bars, headlights as angular lamps with lampWhite glow and a magenta neon eyebrow, a cyan neon light bar across the front, a heavy bull-bar bumper with hazard stripes and a winch, front fenders with armour plating, a windshield-wiper pair, a front licence plate decal with cyberpunk text, small skull/emblem decal on the hood, and a hood scoop. Includes angular wheel-arch voids over the thrusters (no wheels).",
      "box": [[-1.2, 0.65, 1.3], [1.2, 1.55, 2.75]],
      "attaches": "Meets the cab shell at z=1.3; sits on chassis frame at hoodFront; bumper at bumperFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "cargoBed",
      "builds": "Open rear cargo bed from z=-2.75 to -0.9: panelled floor with ribbing, double-skin armoured side walls with rivet paint and hazard top rim, a tailgate on the tailgate joint with a magenta neon strip and a brake-light pair, wheel-arch boxes, a roll bar behind the cab, ammo crates, a missile pod rack with six tube launchers, strapped cargo with cargo-net trim, tie-down hooks, a spare fuel drum, and a rear bumper with a tow hitch and number plate decal.",
      "box": [[-1.2, 0.85, -2.75], [1.2, 1.9, -0.9]],
      "attaches": "Sits on frameTop/bedFloor behind the cab; front wall touches the cab rear at z=-0.9; the turret sits forward of it at the roof.",
      "joints": ["body", "tailgate"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "roofTurret",
      "builds": "Roof-mounted remote gun turret on turretRing: a round faceted base ring with a rotating armoured dome on turretYaw, a boxy sensor head with a cyan glowing camera lens and a magenta targeting laser dot, twin barrelled cannon on gunPitch with muzzle brakes, ammo belt feed, a shield plate, and cable runs down to the roof. Yellow trim bands, stencilled markings and rune-like SVG decals on the shield.",
      "box": [[-0.5, 2.0, -1.25], [0.5, 2.3, 0.15]],
      "attaches": "Base ring bolts to the cab roof at turretRing (0, 2.05, -0.5); cables run down to the roof rack.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });

  const IRON = panelled(metal("iron"), { size: 0.3, rivets: 0.06 });
  const HULLP = panelled(P.hull, { size: 0.25 });

  // frame rails
  for (const s of [1, -1]) {
    box(0.16, 0.2, 5.3, P.hullDark, [s * 0.6, 0.85, -0.1]);
    box(0.05, 0.12, 5.2, P.neonCyan, [s * 0.6, 0.72, -0.1]);
  }
  glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 5.0), P.neonCyan, { bone, at: [0.69, 0.76, -0.1] }), 1.5);
  glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 5.0), P.neonCyan, { bone, at: [-0.69, 0.76, -0.1] }), 1.5);

  // cross-members
  for (let i = 0; i < 9; i++) {
    const z = -2.55 + i * 0.64;
    box(1.4, 0.1, 0.12, P.hullDark, [0, 0.9, z]);
  }

  // belly plate and ribs
  box(1.1, 0.07, 3.6, IRON, [0, 0.58, -0.1]);
  for (let i = 0; i < 10; i++) box(1.0, 0.05, 0.06, P.hullDark, [0, 0.53, -1.8 + i * 0.4]);

  // sub-frame boxes for thrusters
  for (const z of [1.8, -1.8])
    for (const s of [1, -1]) {
      box(0.55, 0.3, 0.9, HULLP, [s * 0.92, 0.82, z]);
      box(0.4, 0.04, 0.7, P.trim, [s * 0.92, 0.985, z]);
      for (let k = 0; k < 4; k++) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.metal, { bone, at: [s * 0.92 + (k % 2 ? 0.17 : -0.17), 1.0, z + (k < 2 ? 0.3 : -0.3)] });
    }

  // hover engine core
  box(1.0, 0.4, 1.2, P.hullDark, [0, 0.8, 0]);
  box(1.04, 0.05, 1.24, P.armor, [0, 1.02, 0]);
  for (let i = 0; i < 6; i++) {
    glow(b.part(new THREE.BoxGeometry(1.02, 0.04, 0.07), P.neonCyan, { bone, at: [0, 0.76 + (i % 2) * 0.1, -0.45 + i * 0.18] }), 1.6);
  }
  // cables
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 0.98, 0.6], [s * 0.6, 0.9, 1.7], 0.025, P.rubber, { bone });
    b.rod([s * 0.3, 0.98, -0.6], [s * 0.6, 0.9, -1.7], 0.025, P.rubber, { bone });
  }

  // side sills, stencils, fuel packs
  const NUM = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/><path d="M0 32L16 0h8L8 32zM24 32L40 0h8L32 32z" fill="#1b1f27"/><text x="46" y="24" font-size="20" font-family="monospace" font-weight="bold" fill="#1b1f27">07</text></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    box(0.18, 0.2, 2.6, P.hull, [s * 1.1, 0.78, 0]);
    b.part(new THREE.PlaneGeometry(1.0, 0.16), "#ffffff", { bone, at: [s * 1.2, 0.78, 0.4], dir: [s, 0, 0], axis: "z", texture: NUM });
    box(0.05, 0.22, 2.62, P.trim, [s * 1.19, 0.78, 0], { scale: [1, 0.2, 1] });
    // fuel / battery pack
    box(0.3, 0.3, 1.1, P.armor, [s * 0.88, 0.62, -0.1]);
    glow(b.part(new THREE.BoxGeometry(0.04, 0.05, 0.95), P.neonMagenta, { bone, at: [s * 1.04, 0.62, -0.1] }), 1.5);
    for (let k = 0; k < 3; k++) box(0.32, 0.32, 0.04, P.hullDark, [s * 0.88, 0.62, -0.5 + k * 0.4]);
  }

  // tow hooks
  for (const z of [2.55, -2.75])
    for (const s of [1, -1]) {
      box(0.1, 0.14, 0.12, P.metal, [s * 0.5, 0.78, z]);
      b.sweep([[s * 0.5, 0.74, z], [s * 0.5, 0.7, z + Math.sign(z) * 0.12], [s * 0.5, 0.78, z + Math.sign(z) * 0.14]], 0.018, { bone, color: P.trim });
    }
}
```

<!-- call: thrusters -->

```ts
import * as THREE from "three";
import { paint, svg, frame, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildThrusters({ b, J, P, M }: Ctx) {
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#15161a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#1b1f27"/>${[2, 8, 14, 20, 26]
      .map((y) => `<rect x="3" y="${y}" width="26" height="3" fill="#8a919c"/>`)
      .join("")}</svg>`,
    { size: 64 },
  );
  const CONE = svg(
    `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ff7ff" stop-opacity="0.9"/><stop offset="1" stop-color="#2ff3ff" stop-opacity="0"/></linearGradient></defs><path d="M10 0H22L32 64H0Z" fill="url(#g)"/></svg>`,
    { size: 64 },
  );
  const scorch = paint((p, n) => {
    const t = smoothstep(0.32, 0.05, p.y);
    const c = mix(P.armor, P.armorLight, noise(p, 0.15, 3));
    return mix(c, "#15161a", t * 0.8 * (0.6 + noise(p, 0.05, 4)));
  });
  const shroudPaint = scorch;

  const pods: [string, number][] = [
    ["thrusterFL", 1.15],
    ["thrusterFR", 1.15],
    ["thrusterRL", 1.0],
    ["thrusterRR", 1.0],
  ];
  for (const [name, k] of pods) {
    const bone = J[name];
    const m = M[name];
    const x = m[0],
      z = m[2];
    const s = Math.sign(x);
    // nacelle: hexagonal lathe from floor up to y 0.62
    b.lathe(
      [
        [0, 0.08],
        [0.3 * k, 0.08],
        [0.4 * k, 0.2],
        [0.43 * k, 0.45],
        [0.34 * k, 0.62],
        [0, 0.62],
      ],
      { at: [x, 0, z], segments: 6, bone, color: shroudPaint },
    );
    // nozzle ring (dark metal) and floor-touching skirt
    b.lathe(
      [
        [0.27 * k, 0],
        [0.33 * k, 0],
        [0.33 * k, 0.1],
        [0.27 * k, 0.1],
      ],
      { at: [x, 0, z], segments: 6, bone, color: P.hullDark },
    );
    // glowing disc
    glow(
      b.part(new THREE.CylinderGeometry(0.25 * k, 0.25 * k, 0.03, 6), P.thrusterGlow, {
        bone,
        at: [x, 0.07, z],
      }),
      1.6,
    );
    // downwash ring
    glow(
      b.part(new THREE.TorusGeometry(0.34 * k, 0.018, 4, 12), P.neonCyan, {
        bone,
        at: [x, 0.14, z],
        rotation: [90, 0, 0],
      }),
      1.4,
    );
    // cone cards
    glow(
      b.cards(
        [0, 1, 2, 3].map((i) => frame([x + Math.cos(i * 1.57) * 0.12 * k, 0.1, z + Math.sin(i * 1.57) * 0.12 * k], [0, -1, 0], [0, 0, 1])),
        CONE,
        { size: [0.22 * k, 0.1], lean: 0, flow: [1, 0, 0], bone },
      ),
      1,
    );
    // hazard band
    b.part(new THREE.CylinderGeometry(0.435 * k, 0.435 * k, 0.1, 6, 1, true), "#ffffff", {
      bone,
      at: [x, 0.33, z],
      texture: HAZ,
      scale: [1.01, 1, 1.01],
    });
    // shroud armour ring on top
    b.part(new THREE.CylinderGeometry(0.36 * k, 0.4 * k, 0.1, 6), P.armor, { bone, at: [x, 0.64, z], flat: true });
    // intake grille on upper face
    b.part(new THREE.PlaneGeometry(0.4 * k, 0.4 * k), "#ffffff", {
      bone,
      at: [x, 0.705, z],
      dir: [0, 1, 0],
      axis: "z",
      texture: GRILLE,
    });
    b.part(new THREE.BoxGeometry(0.46 * k, 0.04, 0.05), P.hullDark, { bone, at: [x, 0.69, z + 0.24 * k] });
    b.part(new THREE.BoxGeometry(0.46 * k, 0.04, 0.05), P.hullDark, { bone, at: [x, 0.69, z - 0.24 * k] });
    // mounting arm up to the frame (inboard), with bolts
    const ax = x - s * 0.5 * k;
    b.rod([x - s * 0.3 * k, 0.5, z], [ax, 0.72, z], 0.06, P.hull, { bone });
    b.part(new THREE.BoxGeometry(0.24, 0.1, 0.34 * k), P.metal, { bone, at: [ax, 0.74, z], flat: true });
    for (const dz of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.trim, { bone, at: [ax, 0.8, z + dz * 0.12 * k] });
    // outer fin with neon
    glow(b.part(new THREE.BoxGeometry(0.03, 0.04, 0.5 * k), P.neonMagenta, { bone, at: [x + s * 0.42 * k, 0.5, z] }), 1.2);
  }
}
```

<!-- call: hoodFront -->

```ts
import * as THREE from "three";
import { paint, svg, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildHoodFront({ b, J, P, M }: Ctx) {
  const body = J.body;
  const box = (w: number, h: number, d: number, col: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...extra });

  const HOOD = panelled(
    paint((p, n) => {
      const c = mix(P.armor, P.armorLight, smoothstep(0.3, 0.8, noise(p, 0.25, 3)) * 0.6);
      return mix(c, "#ffffff", Math.max(0, n.y) * 0.08);
    }),
    { size: 0.35, rivets: 0.07 },
  );
  const GUN = panelled(metal("iron"), { size: 0.3 });

  // hood: sloped loft
  b.loft(
    [
      { at: [0, 1.22, 1.35], w: 1.9, h: 0.25 },
      { at: [0, 1.2, 2.0], w: 1.85, h: 0.22 },
      { at: [0, 1.08, 2.62], w: 1.8, h: 0.2 },
    ],
    { bone: body, color: HOOD, section: "box" },
  );
  // hood ribs and vents
  for (const s of [1, -1]) {
    box(0.08, 0.05, 1.0, P.hullDark, [s * 0.5, 1.34, 1.9]);
    box(0.28, 0.03, 0.3, P.hullDark, [s * 0.75, 1.3, 1.6]);
    for (let i = 0; i < 3; i++) box(0.24, 0.02, 0.03, P.neonCyan, [s * 0.75, 1.32, 1.5 + i * 0.1]);
  }
  // hood scoop
  b.part(new THREE.CylinderGeometry(0.2, 0.3, 0.2, 6), P.hullDark, { bone: body, at: [0, 1.4, 1.75], rotation: [0, 0, 0], flat: true });
  box(0.3, 0.04, 0.25, P.neonCyan, [0, 1.51, 1.75]);

  // lower nose / grille block
  box(1.9, 0.5, 0.25, P.hull, [0, 0.98, 2.62]);
  for (let i = 0; i < 5; i++) {
    glow(box(1.1, 0.04, 0.03, P.neonCyan, [0, 0.84 + i * 0.09, 2.76]), 1.4);
  }
  // fenders with armour plates
  for (const s of [1, -1]) {
    box(0.3, 0.35, 1.3, P.hull, [s * 1.0, 1.1, 1.95]);
    box(0.06, 0.3, 0.9, HOOD, [s * 1.18, 1.18, 1.95]);
    box(0.07, 0.04, 1.0, P.trim, [s * 1.19, 1.35, 1.95]);
    // wheel-arch void trim over thruster
    box(0.34, 0.06, 0.9, P.hullDark, [s * 1.05, 0.88, 1.8]);
    // headlights
    glow(box(0.3, 0.14, 0.08, P.lampWhite, [s * 0.75, 1.0, 2.78]), 1.5);
    glow(box(0.36, 0.04, 0.06, P.neonMagenta, [s * 0.75, 1.12, 2.78]), 1.6);
    // wipers
    b.rod([s * 0.2 + 0.1, 1.3, 1.36], [s * 0.7, 1.34, 1.4], 0.012, P.rubber, { bone: body });
  }
  // light bar
  glow(box(1.8, 0.05, 0.05, P.neonCyan, [0, 1.2, 2.8]), 1.8);

  // bull bar bumper
  box(2.3, 0.28, 0.25, GUN, [0, 0.75, 2.75]);
  for (let i = 0; i < 7; i++) box(0.1, 0.28, 0.26, i % 2 ? P.trim : P.rubber, [-1.0 + i * 0.333, 0.75, 2.76]);
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.75, 2.8], [s * 0.9, 1.25, 2.85], 0.04, P.metal, { bone: body });
  }
  b.rod([-0.9, 1.25, 2.85], [0.9, 1.25, 2.85], 0.04, P.metal, { bone: body });
  b.rod([-0.9, 0.98, 2.85], [0.9, 0.98, 2.85], 0.035, P.metal, { bone: body });
  // winch
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), P.hullDark, { bone: body, at: [0, 0.75, 2.92], rotation: [0, 0, 90] });
  box(0.1, 0.1, 0.06, P.brakeRed, [0.25, 0.75, 2.92]);

  // decals
  const plate = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" rx="4" fill="#e8e8d0" stroke="#111" stroke-width="3"/><text x="50" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#c01070">R4-ID 77</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.16), "#ffffff", { bone: body, at: [0, 0.58 + 0.0, 2.88], dir: [0, 0, 1], axis: "z", texture: plate });
  const skull = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 6C16 6 8 18 12 32c1 6 5 8 8 9v9h24v-9c3-1 7-3 8-9C56 18 48 6 32 6Z" fill="#111" stroke="#ff2fb8" stroke-width="3"/><circle cx="22" cy="28" r="6" fill="#2ff3ff"/><circle cx="42" cy="28" r="6" fill="#2ff3ff"/><path d="M32 34l-4 8h8z" fill="#ff2fb8"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: body, at: [0, 1.325, 2.25], dir: [0, 1, 0], axis: "z", texture: skull });
}
```

<!-- call: roofTurret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildRoofTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const R = rng(5);
  const [cx, cy, cz] = M.turretRing;

  const ARMOR = panelled(P.armor, { size: 0.16, rivets: 0.04 });
  const GUN = metal("iron");
  const STEEL = metal("steel", { tarnish: 0.4 });

  // helper: box part
  const box = (w: number, h: number, d: number, color: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, flat: true, ...extra });

  // base ring on the roof (fixed to body)
  cyl(0.46, 0.5, 0.06, 12, P.hullDark, [cx, 2.03, cz], J.body);
  cyl(0.4, 0.4, 0.05, 12, STEEL, [cx, 2.08, cz], J.body);
  // yellow trim band
  cyl(0.43, 0.43, 0.025, 12, P.trim, [cx, 2.055, cz], J.body);
  // bolts on base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.025, 0.025, 0.04, 6, P.metal, [cx + Math.sin(a) * 0.47, 2.06, cz + Math.cos(a) * 0.47], J.body);
  }

  // rotating dome / turret body on yaw
  cyl(0.34, 0.38, 0.1, 10, ARMOR, [cx, 2.14, cz], yaw);
  b.part(new THREE.SphereGeometry(0.3, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), ARMOR, {
    bone: yaw, at: [cx, 2.17, cz], scale: [1, 0.6, 1.1], flat: true,
  });
  cyl(0.36, 0.36, 0.02, 10, P.trim, [cx, 2.2, cz], yaw);

  // side cheeks to hold gun pivot
  for (const s of [1, -1]) {
    box(0.06, 0.2, 0.3, P.armorLight, [cx + s * 0.22, 2.32 - 0.06, cz + 0.05], yaw);
    cyl(0.05, 0.05, 0.05, 8, P.metal, [cx + s * 0.26, 2.28, cz + 0.12], yaw, { rotation: [0, 0, 90] });
  }

  // shield plate in front of dome
  const shieldTex = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#56603f"/>
    <path d="M0 0H64V8H0Z" fill="#e7b814"/>
    <path d="M0 4 L8 0 L16 8 L24 0 L32 8 L40 0 L48 8 L56 0 L64 8" stroke="#1b1f27" stroke-width="3" fill="none"/>
    <circle cx="32" cy="28" r="10" fill="none" stroke="#ff2fb8" stroke-width="2.5"/>
    <path d="M32 18V38M22 28H42M25 21L39 35M39 21L25 35" stroke="#ff2fb8" stroke-width="1.5"/>
    <text x="4" y="44" font-size="7" font-family="monospace" fill="#2ff3ff">ᛟ ᚦ ᛉ 07</text></svg>`,
    { size: 256 },
  );
  box(0.62, 0.34, 0.05, ARMOR, [cx, 2.28, cz + 0.36], yaw, { rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.56, 0.3), "#ffffff", {
    bone: yaw, at: [cx, 2.285, cz + 0.39], dir: [0, 0.2, 1], axis: "z", texture: shieldTex,
  });

  // sensor head (on top, rear)
  box(0.26, 0.14, 0.24, P.hull, [cx, 2.36 - 0.02, cz - 0.12], yaw);
  box(0.28, 0.03, 0.26, P.trim, [cx, 2.3, cz - 0.12], yaw);
  glow(cyl(0.045, 0.045, 0.05, 8, P.neonCyan, [cx, 2.34, cz + 0.02], yaw, { dir: [0, 0, 1] }), 2);
  cyl(0.06, 0.06, 0.03, 8, P.hullDark, [cx, 2.34, cz + 0.0], yaw, { dir: [0, 0, 1] });
  // laser emitter + magenta dot
  glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), P.neonMagenta, { bone: yaw, at: [cx + 0.09, 2.34, cz + 0.015] }), 2.5);
  glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), P.neonMagenta, { bone: yaw, at: [cx + 0.09, 2.34, cz + 0.9] }), 3);
  // antenna
  b.rod([cx - 0.1, 2.4, cz - 0.18], [cx - 0.1, 2.52 - 0.2, cz - 0.2], 0.008, P.metal, { bone: yaw });

  // gun mount cradle on pitch
  box(0.4, 0.14, 0.22, GUN, [cx, 2.3, cz + 0.2], pitch);
  box(0.42, 0.03, 0.2, P.trim, [cx, 2.375, cz + 0.2], pitch);

  // twin barrels
  for (const s of [1, -1]) {
    const x = cx + s * 0.1;
    b.rod([x, 2.3, cz + 0.28], [x, 2.3, cz + 1.0], 0.035, GUN, { bone: pitch });
    // jacket
    b.rod([x, 2.3, cz + 0.3], [x, 2.3, cz + 0.62], 0.052, P.hullDark, { bone: pitch });
    // muzzle brake
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.hullDark, { bone: pitch, at: [x, 2.3, cz + 1.02] });
    b.part(new THREE.BoxGeometry(0.11, 0.025, 0.04), P.trim, { bone: pitch, at: [x, 2.3, cz + 1.02] });
    // ammo box on side
    box(0.12, 0.12, 0.2, P.armor, [cx + s * 0.28, 2.22, cz + 0.15], pitch);
    // belt feed: chain of links
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      box(0.025, 0.04, 0.04, P.trim, [cx + s * (0.24 - 0.12 * t), 2.2 + 0.07 * Math.sin(t * Math.PI) + 0.04 * t, cz + 0.15 + 0.1 * t], pitch);
    }
  }

  // cables down to roof
  for (const s of [1, -1]) {
    const pts = [
      [cx + s * 0.2, 2.12, cz - 0.2],
      [cx + s * 0.35, 2.06, cz - 0.3],
      [cx + s * 0.45, 2.02, cz - 0.45],
    ];
    b.sweep(pts, 0.014, { color: P.rubber, bone: J.body });
  }
  // neon accent ring
  glow(cyl(0.385, 0.385, 0.012, 12, P.neonCyan, [cx, 2.115, cz], yaw), 1.6);
}
```

<!-- call: cargoBed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, countershade, stripes } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoBed({ b, J, P, M }: any) {
  const body = J.body;
  const gate = J.tailgate;
  const R = rng(11);

  const HULLP = panelled(P.hull, { size: 0.3, rivets: 0.06 });
  const ARMP = panelled(P.armor, { size: 0.35, rivets: 0.07 });
  const FLOOR = panelled(metal("iron"), { size: 0.25, rivets: 0.05 });
  const HAZ = stripes(P.trim, P.hullDark, { size: 0.12, axis: "x", width: 0.5, wobble: 0 });
  const DRUM = countershade(P.rust, P.hullDark);

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, col: any, bone: any = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: [x, y, z], flat: true });

  // floor and ribs
  box(2.2, 0.08, 1.85, 0, 0.98, -1.825, FLOOR);
  for (let i = 0; i < 7; i++) box(2.1, 0.04, 0.06, 0, 1.04, -1.0 - i * 0.26, P.hullDark);

  // double skin side walls
  for (const s of [1, -1]) {
    box(0.06, 0.5, 1.85, s * 1.15, 1.25, -1.825, HULLP);
    box(0.08, 0.5, 1.8, s * 0.98, 1.25, -1.825, ARMP);
    box(0.2, 0.07, 1.85, s * 1.1, 1.52, -1.825, HAZ);
    // wheel arch boxes
    box(0.35, 0.3, 0.7, s * 0.95, 1.2, -1.8, P.hullDark);
    box(0.36, 0.04, 0.72, s * 0.95, 1.36, -1.8, P.armorLight);
    // tie-down hooks
    for (const z of [-1.2, -2.4]) {
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, {
        bone: body,
        at: [s * 1.16, 1.4, z],
        rotation: [0, 90, 0],
      });
    }
    // neon strip on side
    glow(box(0.02, 0.03, 1.7, s * 1.19, 1.12, -1.8, P.neonCyan), 1.5);
  }

  // front wall and roll bar
  box(2.3, 0.6, 0.08, 0, 1.3, -0.96, ARMP);
  for (const s of [1, -1]) {
    box(0.07, 0.8, 0.07, s * 1.0, 1.85, -1.05, P.metal);
  }
  box(2.1, 0.07, 0.07, 0, 1.88, -1.05, P.metal);
  box(2.0, 0.05, 0.05, 0, 1.6, -1.05, P.metal);

  // tailgate
  b.part(new THREE.BoxGeometry(2.3, 0.55, 0.07), HULLP, { bone: gate, at: [0, 1.28, -2.74], flat: true });
  b.part(new THREE.BoxGeometry(2.3, 0.07, 0.09), HAZ, { bone: gate, at: [0, 1.55, -2.74], flat: true });
  glow(b.part(new THREE.BoxGeometry(1.5, 0.04, 0.03), P.neonMagenta, { bone: gate, at: [0, 1.28, -2.79] }), 1.8);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.22, 0.1, 0.03), P.brakeRed, { bone: gate, at: [s * 0.95, 1.4, -2.79] }), 1.6);
  }

  // rear bumper, hitch, plate
  box(2.4, 0.2, 0.2, 0, 0.9, -2.82, P.hullDark);
  box(2.0, 0.05, 0.22, 0, 1.0, -2.82, HAZ);
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8), P.metal, { bone: body, at: [0, 0.95, -2.98], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.08, 8, 6), P.metal, { bone: body, at: [0, 1.05, -3.0] });
  const plate = svg(
    `<svg viewBox="0 0 80 40"><rect width="80" height="40" rx="4" fill="#e7e2c8" stroke="#1b1f27" stroke-width="3"/><text x="40" y="27" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#1b1f27">HV-2077</text><rect x="4" y="4" width="72" height="5" fill="#ff2fb8"/></svg>`,
    { size: 160 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
    bone: body, at: [0, 0.92, -2.935], dir: [0, 0, -1], axis: "z", texture: plate,
  });

  // ammo crates
  const crate = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#56603f"/><rect x="3" y="3" width="58" height="58" fill="none" stroke="#1b1f27" stroke-width="3"/><path d="M3 3L61 61M61 3L3 61" stroke="#3a4229" stroke-width="3"/><rect x="8" y="26" width="48" height="12" fill="#e7b814"/><text x="32" y="36" text-anchor="middle" font-size="10" font-weight="bold" fill="#1b1f27">弾薬</text></svg>`,
    { size: 128 },
  );
  for (const [x, z, a] of [[0.7, -1.3, 8], [0.7, -1.75, -5], [0.65, -1.5, 0]] as number[][]) {
    const y = z === -1.5 ? 1.43 : 1.2;
    b.part(new THREE.BoxGeometry(0.4, 0.3, 0.4), "#ffffff", {
      bone: body, at: [x, y, z], rotation: [0, a, 0], texture: crate,
    });
  }

  // missile pod rack: 6 tubes
  box(0.9, 0.08, 0.7, -0.45, 1.1, -1.9, P.hullDark);
  box(0.9, 0.5, 0.06, -0.45, 1.4, -1.58, P.armor);
  for (let i = 0; i < 6; i++) {
    const cx = -0.45 + ((i % 3) - 1) * 0.27;
    const cy = 1.33 + Math.floor(i / 3) * 0.27;
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 8), P.hull, {
      bone: body, at: [cx, cy, -1.9], rotation: [90, 0, 0],
    });
    glow(b.part(new THREE.CircleGeometry(0.075, 8), P.neonMagenta, {
      bone: body, at: [cx, cy, -2.255], dir: [0, 0, -1], axis: "z",
    }), 1.2);
    b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.06, 8), P.trim, {
      bone: body, at: [cx, cy, -1.75], rotation: [90, 0, 0],
    });
  }

  // strapped cargo with net
  box(0.8, 0.4, 0.8, 0.5, 1.22, -2.3, P.rust);
  for (const dz of [-0.25, 0, 0.25]) box(0.82, 0.42, 0.04, 0.5, 1.22, -2.3 + dz, P.rubber);
  for (const dx of [-0.25, 0.25]) box(0.04, 0.42, 0.82, 0.5 + dx, 1.225, -2.3, P.rubber);

  // fuel drum
  b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 8), DRUM, { bone: body, at: [-0.7, 1.33, -1.25], flat: true });
  for (const dy of [-0.18, 0.18]) {
    b.part(new THREE.CylinderGeometry(0.225, 0.225, 0.04, 8), P.trim, { bone: body, at: [-0.7, 1.33 + dy, -1.25] });
  }
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.metal, { bone: body, at: [-0.7, 1.66, -1.25] });

  // small pennant light on rim
  for (const s of [1, -1]) glow(box(0.04, 0.04, 0.2, s * 1.15, 1.58, -0.95, P.neonMagenta), 1.4);
}
```

<!-- call: cabShell -->

```ts
import * as THREE from "three";
import { paint, svg, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCabShell({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  const ARMOR = panelled(paint((p, n) => {
    const t = n.y > 0.5 ? P.armorLight : P.armor;
    return t;
  }), { size: 0.4, rivets: 0.08 });
  const HULL = panelled(metal("iron"), { size: 0.35 });

  const hazard = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#15161a"/>`).join("")}</svg>`, { size: 256 });
  const stencil = svg(`<svg viewBox="0 0 64 32"><text x="4" y="24" font-size="22" font-family="monospace" font-weight="bold" fill="#e7b814">07</text><text x="38" y="24" font-size="20" fill="#2ff3ff">雷</text></svg>`, { size: 256 });
  const dash = svg(`<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#062a30"/><path d="M2 12 L8 6 L14 10 L20 3 L30 8" stroke="#2ff3ff" stroke-width="1.5" fill="none"/><rect x="2" y="2" width="8" height="2" fill="#ff2fb8"/></svg>`, { size: 128 });

  const box = (w: number, h: number, d: number, col: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...o });

  // floor of cab and lower body
  box(2.3, 0.12, 2.2, P.hullDark, [0, 1.0, 0.2]);
  // lower sides (sills) with stencil
  for (const s of [1, -1]) {
    box(0.1, 0.45, 2.2, HULL, [s * 1.1, 1.3, 0.2]);
    box(0.02, 0.1, 1.9, hazard, [s * 1.16, 1.12, 0.2], { texture: hazard });
  }
  // cowl and rear wall
  box(2.3, 0.5, 0.2, HULL, [0, 1.3, 1.2]);
  box(2.3, 1.05, 0.12, ARMOR, [0, 1.5, -0.84]);
  // sliding rear window
  box(1.0, 0.35, 0.03, P.glass, [0, 1.75, -0.76]);
  box(1.05, 0.04, 0.05, P.metal, [0, 1.56, -0.76]);

  // pillars: A (sloped), C
  for (const s of [1, -1]) {
    b.rod([s * 1.07, 1.5, 0.95], [s * 1.07, 1.98, 0.55], 0.055, P.hullDark, { bone: body, sides: 6 });
    b.rod([s * 1.07, 1.5, -0.8], [s * 1.07, 1.98, -0.6], 0.07, ARMOR, { bone: body, sides: 6 });
    b.rod([s * 1.07, 1.98, 0.55], [s * 1.07, 1.98, -0.6], 0.05, P.hullDark, { bone: body, sides: 6 });
  }
  // windshield (sloped)
  b.slab([[-1.0, 1.5, 0.98], [1.0, 1.5, 0.98], [1.0, 1.96, 0.58], [-1.0, 1.96, 0.58]], { color: P.glass, thickness: 0.03, bone: body });
  b.slab([[-0.9, 1.5, 1.0], [-0.1, 1.5, 1.0], [-0.1, 1.9, 0.62], [-0.9, 1.9, 0.62]].map(p => [p[0] * -1, p[1], p[2] + 0.01]), { color: P.neonCyan, thickness: 0.005, bone: body });
  // roof
  b.frustumBox([0, 2.0, 0.55], [0, 2.0, -0.7], [2.2, 0.1], [2.2, 0.1], { color: ARMOR, bone: body });
  box(2.0, 0.06, 1.0, P.armorLight, [0, 2.07, 0.0]);

  // roll cage bar over roof
  for (const s of [1, -1]) b.rod([s * 0.95, 2.05, -0.6], [s * 0.95, 2.28, -0.6], 0.04, P.metal, { bone: body, sides: 6 });
  b.rod([0.95, 2.28, -0.6], [-0.95, 2.28, -0.6], 0.04, P.metal, { bone: body, sides: 6 });
  b.rod([0.95, 2.28, 0.4], [-0.95, 2.28, 0.4], 0.04, P.metal, { bone: body, sides: 6 });
  for (const s of [1, -1]) {
    b.rod([s * 0.95, 2.28, -0.6], [s * 0.95, 2.28, 0.4], 0.03, P.metal, { bone: body, sides: 6 });
    b.rod([s * 0.95, 2.05, 0.4], [s * 0.95, 2.28, 0.4], 0.03, P.metal, { bone: body, sides: 6 });
  }
  // roof rack with jerry cans
  box(0.12, 0.2, 0.2, P.rust, [0.0, 2.2, 0.3]);
  for (const x of [-0.6, 0.6]) {
    box(0.3, 0.38, 0.18, P.armor, [x, 2.2, 0.3]);
    box(0.1, 0.08, 0.05, P.trim, [x + 0.08, 2.43, 0.3]);
  }
  // antenna
  b.rod([-0.9, 2.1, -0.4], [-0.9, 2.95 > 2.3 ? 2.3 : 2.3, -0.5], 0.012, P.metal, { bone: body, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: body, at: [-0.9, 2.3, -0.5] }), 1.5);

  // doors
  for (const s of [1, -1]) {
    const d = s > 0 ? J.doorL : J.doorR;
    const hp = [s * 1.08, 1.4, 0.75];
    const ox = (x: number, y: number, z: number) => [x, y, z];
    b.part(new THREE.BoxGeometry(0.1, 0.5, 1.1), HULL, { bone: d, at: ox(s * 1.12, 1.3, 0.2), flat: true });
    // window glass, faceted
    b.slab([[s * 1.14, 1.55, 0.78], [s * 1.14, 1.55, -0.3], [s * 1.14, 1.92, -0.2], [s * 1.14, 1.92, 0.58]], { color: P.glass, thickness: 0.03, bone: d });
    // slit shutter
    b.part(new THREE.BoxGeometry(0.05, 0.07, 0.8), P.hullDark, { bone: d, at: ox(s * 1.17, 1.74, 0.3), flat: true });
    // armour plate over door
    b.part(new THREE.BoxGeometry(0.06, 0.4, 0.85), ARMOR, { bone: d, at: ox(s * 1.17, 1.28, 0.2), flat: true });
    for (const z of [-0.15, 0.55]) for (const y of [1.14, 1.42])
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.metal, { bone: d, at: ox(s * 1.21, y, z), dir: [s, 0, 0] });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.16), P.metal, { bone: d, at: ox(s * 1.2, 1.5, -0.2) });
    // stencil on plate
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: d, at: ox(s * 1.205, 1.3, 0.2), dir: [s, 0, 0], axis: "z", texture: stencil });
    // mirror
    b.rod([s * 1.15, 1.6, 0.9], [s * 1.35, 1.68, 0.95], 0.015, P.metal, { bone: d, sides: 5 });
    b.part(new THREE.BoxGeometry(0.05, 0.16, 0.12), P.hullDark, { bone: d, at: ox(s * 1.38, 1.68, 0.95), flat: true });
    glow(b.part(new THREE.BoxGeometry(0.01, 0.02, 0.1), P.neonCyan, { bone: d, at: ox(s * 1.41, 1.62, 0.95) }), 1.5);
  }

  // interior
  for (const x of [-0.45, 0.45]) {
    box(0.5, 0.12, 0.5, P.rubber, [x, 1.2, 0.0]);
    box(0.5, 0.65, 0.1, P.rubber, [x, 1.55, -0.25], { rotation: [-8, 0, 0] });
    box(0.3, 0.12, 0.08, P.rubber, [x, 1.95, -0.3]);
  }
  box(2.0, 0.18, 0.3, P.hullDark, [0, 1.55, 0.9]);
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone: body, at: [0, 1.67, 0.83], dir: [0, 0.4, -1], axis: "z", texture: dash });
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone: body, at: [0, 1.67, 0.82], dir: [0, 0.4, -1], axis: "z", texture: dash }), 1.2);
  // steering wheel
  b.part(new THREE.TorusGeometry(0.14, 0.02, 5, 8), P.rubber, { bone: body, at: [0.45, 1.5, 0.62], dir: [0, 0.5, -1], axis: "z" });
  b.rod([0.45, 1.5, 0.7], [0.45, 1.47, 0.63], 0.02, P.metal, { bone: body, sides: 5 });

  // neon strip on roof edge
  glow(box(2.0, 0.025, 0.03, P.neonMagenta, [0, 2.0, -0.78]), 1.6);
  glow(box(0.02, 0.025, 1.0, P.neonCyan, [1.12, 1.98, 0.0]), 1.4);
  glow(box(0.02, 0.025, 1.0, P.neonCyan, [-1.12, 1.98, 0.0]), 1.4);
  // hazard stripe along rear top
  b.part(new THREE.PlaneGeometry(1.6, 0.14), "#ffffff", { bone: body, at: [0, 1.28, -0.9], dir: [0, 0, -1], axis: "z", texture: hazard });
}
```

<!-- call: fit-hoodFront -->

The hood loft overshoots the box in z (it spans 0.40 to 3.51), so I'm replacing it with plain boxes inside the box. The bumper details sit at z ≈ 2.9, so they move back inside z ≤ 2.75. The plate decal goes up to y = 0.67 so it stays within the box.

<<<<<<< SEARCH
  b.loft(
    [
      { at: [0, 1.22, 1.35], w: 1.9, h: 0.25 },
      { at: [0, 1.2, 2.0], w: 1.85, h: 0.22 },
      { at: [0, 1.08, 2.62], w: 1.8, h: 0.2 },
    ],
    { bone: body, color: HOOD, section: "box" },
  );
=======
  box(1.9, 0.25, 0.7, HOOD, [0, 1.25, 1.68]);
  box(1.85, 0.22, 0.7, HOOD, [0, 1.2, 2.3]);
  box(1.8, 0.2, 0.2, HOOD, [0, 1.08, 2.62]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.rod([s * 0.9, 0.75, 2.8], [s * 0.9, 1.25, 2.85], 0.04, P.metal, { bone: body });
  }
  b.rod([-0.9, 1.25, 2.85], [0.9, 1.25, 2.85], 0.04, P.metal, { bone: body });
  b.rod([-0.9, 0.98, 2.85], [0.9, 0.98, 2.85], 0.035, P.metal, { bone: body });
=======
    b.rod([s * 0.9, 0.75, 2.7], [s * 0.9, 1.25, 2.72], 0.04, P.metal, { bone: body });
  }
  b.rod([-0.9, 1.25, 2.72], [0.9, 1.25, 2.72], 0.04, P.metal, { bone: body });
  b.rod([-0.9, 0.98, 2.72], [0.9, 0.98, 2.72], 0.035, P.metal, { bone: body });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), P.hullDark, { bone: body, at: [0, 0.75, 2.92], rotation: [0, 0, 90] });
  box(0.1, 0.1, 0.06, P.brakeRed, [0.25, 0.75, 2.92]);
=======
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), P.hullDark, { bone: body, at: [0, 0.75, 2.66], rotation: [0, 0, 90] });
  box(0.1, 0.1, 0.06, P.brakeRed, [0.25, 0.75, 2.66]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.PlaneGeometry(0.4, 0.16), "#ffffff", { bone: body, at: [0, 0.58 + 0.0, 2.88], dir: [0, 0, 1], axis: "z", texture: plate });
=======
  b.part(new THREE.PlaneGeometry(0.4, 0.16), "#ffffff", { bone: body, at: [0, 0.8, 2.75], dir: [0, 0, 1], axis: "z", texture: plate });
>>>>>>> REPLACE

<!-- call: fit-cargoBed -->

Seven pieces reach past the box, and each edit below pulls one back inside: the rear bumper, hitch, hitch ball, number plate, and the two roll-bar posts.

- **Rear bumper and hazard strip** (`part.body.82`, `part.body.83`): moved forward so the back face sits at z = -2.75.
- **Hitch cylinder and ball** (`cylinder.body.18`, `sphere.body`): shortened and moved forward so they stay within the -z face.
- **Number plate** (`plane.body.5`): now at z = -2.745 (a 5 mm inset keeps it from flickering against the bumper), still facing -Z.
- **Roll-bar posts** (`part.body.78`, `part.body.79`): shortened to 0.45 m and lowered so the tops sit at y = 1.9. The cross bars at y = 1.88 and y = 1.6 are unchanged, so the posts still meet them.

<<<<<<< SEARCH
  box(2.4, 0.2, 0.2, 0, 0.9, -2.82, P.hullDark);
  box(2.0, 0.05, 0.22, 0, 1.0, -2.82, HAZ);
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 8), P.metal, { bone: body, at: [0, 0.95, -2.98], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.08, 8, 6), P.metal, { bone: body, at: [0, 1.05, -3.0] });
=======
  box(2.4, 0.2, 0.2, 0, 0.95, -2.65, P.hullDark);
  box(2.0, 0.05, 0.2, 0, 1.05, -2.65, HAZ);
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 8), P.metal, { bone: body, at: [0, 0.95, -2.7], rotation: [90, 0, 0] });
  b.part(new THREE.SphereGeometry(0.04, 8, 6), P.metal, { bone: body, at: [0, 1.0, -2.71] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    bone: body, at: [0, 0.92, -2.935], dir: [0, 0, -1], axis: "z", texture: plate,
=======
    bone: body, at: [0, 0.95, -2.745], dir: [0, 0, -1], axis: "z", texture: plate,
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(0.07, 0.8, 0.07, s * 1.0, 1.85, -1.05, P.metal);
=======
    box(0.07, 0.45, 0.07, s * 1.0, 1.675, -1.05, P.metal);
>>>>>>> REPLACE

<!-- call: fit-thrusters -->

The pods were too wide for the box. I moved each pod's centre inboard to x = ±0.8 and trimmed the pod scale (front 1.15 → 1.0, rear 1.0 → 0.9). The joints and mounts stay where they were, so every piece now sits inside x = ±1.25.

<<<<<<< SEARCH
    ["thrusterFL", 1.15],
    ["thrusterFR", 1.15],
    ["thrusterRL", 1.0],
    ["thrusterRR", 1.0],
=======
    ["thrusterFL", 1.0],
    ["thrusterFR", 1.0],
    ["thrusterRL", 0.9],
    ["thrusterRR", 0.9],
>>>>>>> REPLACE
<<<<<<< SEARCH
    const x = m[0],
      z = m[2];
    const s = Math.sign(x);
=======
    const s = Math.sign(m[0]);
    const x = s * 0.8,
      z = m[2];
>>>>>>> REPLACE

<!-- call: fit-roofTurret -->

Four edits: the barrels, muzzle brakes and laser dot are pulled back into the box, and the shield plate and its decal are shortened.

<<<<<<< SEARCH
  box(0.62, 0.34, 0.05, ARMOR, [cx, 2.28, cz + 0.36], yaw, { rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.56, 0.3), "#ffffff", {
    bone: yaw, at: [cx, 2.285, cz + 0.39], dir: [0, 0.2, 1], axis: "z", texture: shieldTex,
  });
=======
  box(0.62, 0.2, 0.05, ARMOR, [cx, 2.2, cz + 0.36], yaw, { rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.5, 0.17), "#ffffff", {
    bone: yaw, at: [cx, 2.2, cz + 0.39], dir: [0, 0.2, 1], axis: "z", texture: shieldTex,
  });
>>>>>>> REPLACE
<<<<<<< SEARCH
cz + 0.9] }), 3);
=======
cz + 0.62] }), 3);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.rod([x, 2.3, cz + 0.28], [x, 2.3, cz + 1.0], 0.035, GUN, { bone: pitch });
=======
    b.rod([x, 2.3, cz + 0.28], [x, 2.3, cz + 0.55], 0.035, GUN, { bone: pitch });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.hullDark, { bone: pitch, at: [x, 2.3, cz + 1.02] });
    b.part(new THREE.BoxGeometry(0.11, 0.025, 0.04), P.trim, { bone: pitch, at: [x, 2.3, cz + 1.02] });
=======
    b.part(new THREE.BoxGeometry(0.09, 0.09, 0.1), P.hullDark, { bone: pitch, at: [x, 2.3, cz + 0.56] });
    b.part(new THREE.BoxGeometry(0.1, 0.025, 0.04), P.trim, { bone: pitch, at: [x, 2.3, cz + 0.56] });
>>>>>>> REPLACE
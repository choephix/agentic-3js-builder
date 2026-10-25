<!-- call: plan -->

```json
{
  "name": "Hoverpickup Raider",
  "description": "A militarized pickup truck converted to run on four downward-firing hover thrusters, in low-poly cyberpunk style with neon trim, armor plates and a roof-mounted gun.",
  "builderName": "hoverPickupRaider",
  "size": [2.5, 2.2, 5.6],
  "layout": "Pickup silhouette facing +Z: long sloped armored hood at the front, a boxy two-door cab in the middle, an open cargo bed at the rear with a roll bar and a pintle gun. There are no wheels. Four hover thrust pods (large ducted fan nacelles with glowing cyan undersides) hang at the wheel positions on short pylons, and the hull floats with skids and the pod bottoms resting at y=0 as the floor contact (sitting on landing skids). The hull is dark gunmetal with hazard-yellow trim, magenta and cyan neon strips, angular faceted plates and rivets, and a Cyrillic-free stencil number on the doors. Every part uses chamfered, blocky low-poly shapes; glow is used for neon, headlights, thruster cores and screens.",
  "palette": {
    "hull": "#3a4150",
    "hullDark": "#1f232d",
    "armor": "#566070",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb0",
    "glass": "#1b3a52",
    "rubber": "#15161b",
    "metal": "#8c93a0",
    "rust": "#7a4a2a",
    "lampWhite": "#fff6d0",
    "warnRed": "#e0262e"
  },
  "mounts": {
    "chassisTop": [0, 1.0, 0],
    "cabFloor": [0, 1.0, 0.2],
    "bedFloor": [0, 1.0, -1.7],
    "hoodFront": [0, 1.0, 2.2],
    "roofGun": [0, 2.0, 0.1],
    "podFL": [1.15, 0.55, 1.8],
    "podFR": [-1.15, 0.55, 1.8],
    "podBL": [1.15, 0.55, -1.7],
    "podBR": [-1.15, 0.55, -1.7]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "gunYaw", "parent": "body", "at": [0, 2.0, 0.1], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "gunYaw", "at": [0, 2.15, 0.1], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "podFL", "parent": "body", "at": [1.15, 0.55, 1.8], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "podFR", "parent": "body", "at": [-1.15, 0.55, 1.8], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "podBL", "parent": "body", "at": [1.15, 0.55, -1.7], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "podBR", "parent": "body", "at": [-1.15, 0.55, -1.7], "dir": [0, -1, 0], "role": "hinge", "group": "pods" }
  ],
  "parts": [
    {
      "id": "chassisHood",
      "builds": "Lower hull and front: underbody slab with faceted sides, sloped armored hood with raised center ridge and vents (hazard stripe paint), front bumper ram with bull bar, twin headlights (glow lampWhite), neon magenta grille slits, fender flares over the front pods, side skirts with cyan neon strips, front landing skids, tow hooks, plate rivets via panelled-style paint.",
      "box": [[-1.25, 0.3, 0.9], [1.25, 1.3, 2.8]],
      "attaches": "Meets cab at z=0.9 along cabFloor height; front pylons for podFL/podFR at the mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armored two-door cab: faceted body, sloped windshield and side windows (glass with cyan reflective decal streaks), roof with armor plate and antenna array, door panels with stencil numbers and hazard stripes drawn as SVG textures, side mirrors with tiny screens, roof light bar with red and cyan glow, wing-door handles, exhaust-less rear window grille cage, interior hints (seats, dashboard glowing screen) visible through glass.",
      "box": [[-1.2, 1.0, -0.8], [1.2, 2.0, 0.9]],
      "attaches": "Sits on cabFloor; hood behind z=0.9; bed starts at z=-0.8; roofGun mount on top.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "bed",
      "builds": "Open cargo bed with inner floor, ribbed side walls with armor plating, tailgate with warning stencil and red tail lights (glow), roll bar hoop with neon tube, cargo: fuel canisters, ammo crates with SVG labels, a glowing power cell, rear bumper, rear landing skids, spare thruster fins, tie-down rings.",
      "box": [[-1.25, 0.3, -2.8], [1.25, 1.6, -0.8]],
      "attaches": "Starts at cab rear z=-0.8; floor at bedFloor height; rear pylons for podBL/podBR at the mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "hoverPods",
      "builds": "Four hover thruster nacelles at the pod mounts: each an octagonal ducted housing with an inner fan (spoked blades, flat-shaded) and glowing cyan downward core with a ring of magenta neon, a short angled pylon strut to the hull, hazard-yellow collar, vent fins and bolts, little stabiliser winglets. Pod undersides and landing feet touch y=0 (floor). Pods ride their own pod joints.",
      "box": [[-1.25, 0, -2.2], [1.25, 0.8, 2.3]],
      "attaches": "Pylons end at podFL, podFR, podBL, podBR mounts and meet the hull sides.",
      "joints": ["podFL", "podFR", "podBL", "podBR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "roofGun",
      "builds": "Roof-mounted heavy autocannon on a ring: turntable base on gunYaw, armored shield, twin barrels with muzzle brakes and cooling sleeves on gunPitch, ammo drum with belt feed, glowing targeting sensor and red laser sight emitter, a small antenna dish and drawn caution decals; plus a roof rail ring it sits on.",
      "box": [[-0.5, 1.95, -0.5], [0.5, 2.2, 1.3]],
      "attaches": "Base ring centred on roofGun mount atop cab roof.",
      "joints": ["gunYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: chassisHood -->

```ts
import * as THREE from "three";
import { paint, svg, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildChassisHood({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true, ...extra });

  const HULL = panelled(P.hull, { size: 0.3, rivets: 0.08 });
  const ARMOR = panelled(P.armor, { size: 0.25, rivets: 0.07 });
  const hazard = paint((p, _n) => {
    const k = Math.floor((p.x + p.z) / 0.1) % 2 === 0;
    return k ? P.trim : P.hullDark;
  });

  // underbody slab
  box(2.3, 0.3, 1.9, P.hullDark, [0, 0.45, 1.85]);
  box(2.4, 0.35, 1.9, HULL, [0, 0.75, 1.85]);
  // faceted sides
  for (const s of [1, -1]) {
    box(0.12, 0.55, 1.9, ARMOR, [s * 1.2, 0.85, 1.85], [0, 0, s * 8]);
    // side skirt + cyan strip
    box(0.1, 0.18, 1.7, P.hullDark, [s * 1.24, 0.52, 1.85]);
    glow(box(0.03, 0.04, 1.6, P.neonCyan, [s * 1.3, 0.52, 1.85]), 1.5);
  }
  // sloped hood
  box(2.3, 0.14, 1.9, ARMOR, [0, 1.17, 1.8], [-9, 0, 0]);
  // ridge
  box(0.5, 0.1, 1.8, HULL, [0, 1.27, 1.8], [-9, 0, 0]);
  // hazard stripes on hood sides
  for (const s of [1, -1]) box(0.5, 0.02, 1.6, hazard, [s * 0.7, 1.26, 1.8], [-9, 0, 0]);
  // vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) box(0.4, 0.03, 0.06, P.rubber, [s * 0.5, 1.3 - i * 0.02, 1.4 + i * 0.2], [-9, 0, 0]);
  // front fascia
  box(2.3, 0.7, 0.2, ARMOR, [0, 0.85, 2.75], [12, 0, 0]);
  // magenta grille slits
  for (let i = 0; i < 4; i++) glow(box(0.9, 0.04, 0.03, P.neonMagenta, [0, 0.72 + i * 0.1, 2.88]), 1.6);
  // headlights
  for (const s of [1, -1]) {
    box(0.45, 0.25, 0.12, P.hullDark, [s * 0.85, 1.0, 2.85]);
    glow(box(0.36, 0.17, 0.06, P.lampWhite, [s * 0.85, 1.0, 2.92]), 2);
  }
  // bumper ram + bull bar
  box(2.5, 0.28, 0.3, P.armor, [0, 0.55, 2.85], [0, 0, 0]);
  box(2.3, 0.1, 0.12, P.trim, [0, 0.72, 2.98]);
  for (const s of [1, -1, 0]) {
    box(0.1, 0.7, 0.1, P.metal, [s * 0.7, 0.9, 2.98]);
    b.rod([s * 0.7, 0.55, 2.95], [s * 0.7, 1.15, 2.95], 0.05, P.metal, { bone });
  }
  box(1.6, 0.1, 0.1, P.metal, [0, 1.2, 2.98]);
  // tow hooks
  for (const s of [1, -1]) b.rod([s * 0.45, 0.45, 2.98], [s * 0.45, 0.45, 3.1], 0.04, P.warnRed, { bone });
  // fender flares over pods
  for (const s of [1, -1]) {
    box(0.5, 0.12, 1.0, P.armor, [s * 1.15, 1.05, 1.8], [0, 0, s * 20]);
    box(0.1, 0.4, 1.0, ARMOR, [s * 1.28, 0.85, 1.8]);
    // pylons
    b.rod([s * 1.0, 0.8, 1.8], [s * 1.15, 0.58, 1.8], 0.09, P.metal, { bone });
    // skids
    box(0.14, 0.06, 1.3, P.rubber, [s * 0.85, 0.32, 1.9]);
    box(0.1, 0.12, 0.1, P.metal, [s * 0.85, 0.4, 1.5]);
    box(0.1, 0.12, 0.1, P.metal, [s * 0.85, 0.4, 2.3]);
  }
  // rivets row
  for (let i = 0; i < 10; i++)
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [s * 1.0, 1.28, 1.0 + i * 0.16] });
  // stencil plate on hood
  const tex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e7b814"/><text x="32" y="23" font-size="20" text-anchor="middle" font-family="monospace" font-weight="bold" fill="#1f232d">R-07</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
    bone, at: [0, 1.34, 2.0], dir: [0, 1, 0.16], axis: "z", texture: tex,
  });
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, c: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, flat: true, ...opts });

  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.armor, smoothstep(0.3, 0.8, noise(p, 0.3, 4)) * 0.6);
    const lit = 0.8 + 0.2 * smoothstep(-0.5, 0.9, n.y);
    return [base[0] * lit, base[1] * lit, base[2] * lit];
  });

  // Hull
  box(2.3, 0.55, 1.7, hullPaint, [0, 1.275, 0.05]);
  // Upper cabin (tapered)
  b.frustumBox([0, 1.5, 0.05], [0, 1.95, 0.05], [2.3, 1.6], [1.9, 1.0], { bone, color: hullPaint });
  // Belt trim
  box(2.34, 0.06, 1.74, P.trim, [0, 1.56, 0.05]);
  // Roof armor plate
  box(1.9, 0.07, 1.2, P.armor, [0, 2.0, 0.0]);
  box(1.6, 0.04, 0.9, P.hullDark, [0, 2.05, 0.0]);

  // Windshield sloped
  const GL = P.glass;
  b.part(new THREE.BoxGeometry(1.75, 0.5, 0.05), GL, { bone, at: [0, 1.75, 0.82], rotation: [-28, 0, 0], flat: true });
  const streak = svg(
    `<svg viewBox="0 0 64 32"><path d="M6 30 L26 2 L32 2 L12 30Z" fill="#2ff3ff" opacity="0.55"/><path d="M30 30 L44 8 L47 8 L33 30Z" fill="#2ff3ff" opacity="0.4"/></svg>`,
    { size: 128 });
  b.part(new THREE.PlaneGeometry(1.6, 0.42), "#ffffff", {
    bone, at: [0, 1.755, 0.855], rotation: [-28, 0, 0], texture: streak,
  });
  // Rear window + grille cage
  box(1.5, 0.4, 0.05, GL, [0, 1.75, -0.8]);
  for (let i = -3; i <= 3; i++) box(0.04, 0.44, 0.05, P.hullDark, [i * 0.22, 1.75, -0.84]);
  box(1.6, 0.04, 0.06, P.hullDark, [0, 1.95, -0.84]);
  box(1.6, 0.04, 0.06, P.hullDark, [0, 1.55, -0.84]);

  // Interior
  box(1.5, 0.3, 0.2, P.hullDark, [0, 1.62, 0.6]);
  const screenTex = svg(
    `<svg viewBox="0 0 40 20"><rect width="40" height="20" fill="#06323a"/><path d="M2 14 L10 8 L18 12 L28 4 L38 9" stroke="#2ff3ff" stroke-width="2" fill="none"/><circle cx="32" cy="14" r="3" fill="#ff2fb0"/></svg>`,
    { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    bone, at: [0, 1.74, 0.5], rotation: [-15, 0, 0], texture: screenTex,
  }));
  for (const s of [1, -1]) {
    box(0.5, 0.1, 0.45, P.rubber, [s * 0.5, 1.5, 0.0]);
    box(0.5, 0.5, 0.1, P.rubber, [s * 0.5, 1.75, -0.25]);
  }

  // Doors and side windows
  const door = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="none"/><path d="M0 40 L12 40 L22 48 L10 48Z M24 40 L36 40 L46 48 L34 48Z M48 40 L60 40 L64 44 L64 48 L58 48Z" fill="#e7b814"/><text x="32" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e7b814" stroke="#1f232d" stroke-width="1">07</text></svg>`,
    { size: 192 });
  for (const s of [1, -1]) {
    const x = s * 1.17;
    b.part(new THREE.BoxGeometry(0.04, 0.4, 1.0), GL, { bone, at: [s * 1.0, 1.78, 0.05], rotation: [0, 0, -s * 8], flat: true });
    b.part(new THREE.PlaneGeometry(0.9, 0.36), "#ffffff", {
      bone, at: [s * 1.17, 1.4, 0.05], dir: [s, 0, 0], axis: "z", texture: door,
    });
    box(0.05, 0.03, 1.1, P.hullDark, [x, 1.22, 0.05]);
    box(0.06, 0.05, 0.18, P.metal, [x, 1.58, 0.4]);
    box(0.02, 0.02, 1.0, P.neonCyan, [x + s * 0.01, 1.12, 0.05]);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 1.0), P.neonCyan, { bone, at: [x + s * 0.02, 1.1, 0.05] }), 1.5);
    // door seam
    box(0.03, 0.8, 0.03, P.hullDark, [x, 1.5, -0.35]);
    // mirror
    b.rod([s * 1.15, 1.75, 0.7], [s * 1.4, 1.8, 0.75], 0.02, P.metal, { bone });
    box(0.06, 0.2, 0.16, P.hullDark, [s * 1.45, 1.8, 0.75]);
    glow(b.part(new THREE.BoxGeometry(0.02, 0.14, 0.11), P.neonCyan, { bone, at: [s * 1.485, 1.8, 0.75] }), 1.2);
    // fender armor
    box(0.08, 0.35, 0.6, P.armor, [s * 1.18, 1.35, -0.45]);
    // rivets
    for (let i = 0; i < 4; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [s * 1.2, 1.15 + (i % 2) * 0.05, -0.5 + i * 0.35] });
  }

  // Light bar
  box(1.4, 0.1, 0.16, P.hullDark, [0, 2.12, 0.55]);
  for (let i = 0; i < 6; i++) {
    const c = i < 3 ? P.warnRed : P.neonCyan;
    glow(box(0.2, 0.08, 0.14, c, [-0.55 + i * 0.22, 2.14, 0.55]), 1.5);
  }

  // Antennas
  for (const [x, z, h] of [[0.7, -0.5, 0.7], [-0.75, -0.45, 0.5], [0.5, -0.6, 0.35]]) {
    b.rod([x, 2.05, z], [x, 2.05 + h, z], 0.012, P.metal, { bone });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonMagenta, { bone, at: [x, 2.05 + h, z] }), 1.5);
  }
  // Roof gun ring seat
  b.lathe([[0, 0], [0.36, 0], [0.36, 0.05], [0.3, 0.08], [0, 0.08]], { at: [0, 2.08, 0.1], bone, color: P.trim, segments: 8 });
  // Hazard strip across roof front
  box(1.9, 0.03, 0.08, P.trim, [0, 2.045, 0.6]);
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mottle, stripes, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });

  const HULL = countershade(mottle(P.hull, P.hullDark, { size: 0.25, seed: 3 }), P.hullDark, { level: -0.4 });
  const ARMOR = mottle(P.armor, P.hull, { size: 0.18, seed: 5 });
  const HAZ = stripes(P.trim, P.hullDark, { size: 0.14, axis: "x", width: 0.5, wobble: 0.05 });

  // floor and under-frame
  box(2.3, 0.1, 1.95, HULL, [0, 0.95, -1.8]);
  box(2.0, 0.2, 1.8, P.hullDark, [0, 0.8, -1.8]);
  box(1.9, 0.02, 1.7, P.rubber, [0, 1.01, -1.8]);

  // side walls with ribs and armor plates
  for (const s of [1, -1]) {
    box(0.1, 0.55, 1.95, HULL, [s * 1.18, 1.3, -1.8]);
    box(0.14, 0.08, 1.95, HAZ, [s * 1.18, 1.6, -1.8]);
    box(0.04, 0.4, 1.7, ARMOR, [s * 1.25, 1.28, -1.8]);
    for (let i = 0; i < 6; i++) {
      box(0.08, 0.5, 0.06, P.hullDark, [s * 1.26, 1.3, -0.95 - i * 0.32]);
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [s * 1.3, 1.5, -1.0 - i * 0.32] });
    }
    // skids
    box(0.12, 0.08, 1.2, P.metal, [s * 0.9, 0.34, -1.9]);
    box(0.08, 0.3, 0.1, P.hullDark, [s * 0.9, 0.5, -1.45]);
    box(0.08, 0.3, 0.1, P.hullDark, [s * 0.9, 0.5, -2.35]);
    // tie-down rings
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, { bone, at: [s * 1.1, 1.55, -1.3], rotation: [0, 90, 0] });
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, { bone, at: [s * 1.1, 1.55, -2.3], rotation: [0, 90, 0] });
    // pylon blocks to rear pods
    box(0.3, 0.12, 0.3, P.hullDark, [s * 1.1, 0.75, -1.7]);
  }

  // front wall (behind cab)
  box(2.3, 0.6, 0.1, HULL, [0, 1.3, -0.85]);

  // tailgate
  const stencil = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#1f232d"/><path d="M0 0H20L0 20Z M30 0H50L0 40H-20Z" fill="#e7b814"/><rect x="2" y="2" width="96" height="36" fill="none" stroke="#e7b814" stroke-width="2"/><text x="50" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="16" fill="#e7b814">WARNING</text></svg>`,
    { size: 256 },
  );
  box(2.3, 0.6, 0.1, HULL, [0, 1.3, -2.8]);
  b.part(new THREE.PlaneGeometry(1.0, 0.4), "#ffffff", { bone, at: [0, 1.32, -2.86], dir: [0, 0, -1], axis: "z", texture: stencil });
  box(2.3, 0.08, 0.14, HAZ, [0, 1.62, -2.8]);
  for (const s of [1, -1]) {
    glow(box(0.3, 0.14, 0.05, P.warnRed, [s * 0.9, 1.45, -2.87]), 1.6);
    box(0.36, 0.2, 0.03, P.hullDark, [s * 0.9, 1.45, -2.85]);
  }

  // rear bumper
  box(2.4, 0.2, 0.18, ARMOR, [0, 0.8, -2.85]);
  box(2.4, 0.05, 0.19, HAZ, [0, 0.92, -2.85]);
  for (const s of [1, -1]) box(0.1, 0.2, 0.2, P.hullDark, [s * 1.0, 0.7, -2.7]);

  // roll bar hoop
  const hoop = catmullPts();
  function catmullPts() {
    const pts: number[][] = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      pts.push([Math.cos(a) * 1.05, 1.05 + Math.sin(a) * 0.55 + 0.5, -1.0]);
    }
    return pts;
  }
  b.sweep(hoop, 0.05, { bone, color: P.armor, section: { ngon: 6 } });
  box(0.1, 0.5, 0.1, P.armor, [1.05, 1.3, -1.0]);
  box(0.1, 0.5, 0.1, P.armor, [-1.05, 1.3, -1.0]);
  const tube = b.sweep(hoop.map((p) => [p[0], p[1], p[2] + 0.07]), 0.018, { bone, color: P.neonCyan });
  glow(tube, 1.8);

  // cargo: fuel canisters
  for (const [x, z] of [[0.7, -1.2], [0.7, -1.55], [0.35, -1.35]]) {
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.4, 8), P.rust, { bone, at: [x, 1.25, z] });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 8), P.trim, { bone, at: [x, 1.4, z] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), P.metal, { bone, at: [x, 1.46, z] });
  }
  // ammo crates
  const label = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#566070"/><rect x="3" y="3" width="58" height="34" fill="none" stroke="#e7b814" stroke-width="3"/><path d="M8 30L16 10L24 30Z" fill="#e7b814"/><text x="44" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="#fff6d0">AMMO</text></svg>`,
    { size: 192 },
  );
  for (const [x, z, y, r] of [[-0.6, -1.3, 1.2, 8], [-0.65, -2.0, 1.2, -6], [-0.6, -1.65, 1.5, 0]] as number[][]) {
    box(0.5, 0.3, 0.38, P.armor, [x, y, z], { rotation: [0, r, 0] });
    for (const sx of [1, -1])
      b.part(new THREE.PlaneGeometry(0.4, 0.25), "#ffffff", { bone, at: [x + sx * 0.255, y, z], dir: [sx, 0, 0], axis: "z", texture: label });
  }

  // glowing power cell
  box(0.44, 0.44, 0.44, P.hullDark, [0.55, 1.27, -2.3]);
  glow(box(0.3, 0.34, 0.3, P.neonMagenta, [0.55, 1.29, -2.3]), 1.6);
  box(0.4, 0.05, 0.4, P.trim, [0.55, 1.52, -2.3]);

  // spare thruster fins
  for (let i = 0; i < 4; i++) {
    const f = b.extrude([[0, 0], [0.5, 0], [0.38, 0.28], [0.05, 0.28]], { at: [-0.9 + i * 0.07, 1.06, -2.45], x: [0, 0, 1], thickness: 0.03, color: P.metal, bone });
    f.mesh.rotation.x += 0;
  }
  box(0.4, 0.04, 0.6, P.rust, [-0.8, 1.04, -2.2]);
}
```

<!-- call: hoverPods -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHoverPods({ b, J, P, M }: any) {
  const R = rng(5);
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 + 1} 16Z" fill="#15161b"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const FAN = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="31" fill="#15161b"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M32 32 L${32 + 30 * Math.cos(i * 0.785)} ${32 + 30 * Math.sin(i * 0.785)} L${32 + 30 * Math.cos(i * 0.785 + 0.5)} ${32 + 30 * Math.sin(i * 0.785 + 0.5)}Z" fill="#8c93a0" stroke="#1f232d" stroke-width="1"/>`)
      .join("")}<circle cx="32" cy="32" r="6" fill="#e7b814"/></svg>`,
    { size: 128 },
  );
  const shell = paint((p, n) =>
    mix(mix(P.hullDark, P.armor, smoothstep(0.2, 0.8, noise(p, 0.15, 3))), P.hull, n.y > 0.5 ? 0.5 : 0),
  );
  const names = ["podFL", "podFR", "podBL", "podBR"];
  for (const nm of names) {
    const j = J[nm];
    const [x, , z] = M[nm];
    const s = Math.sign(x);
    // landing foot / bottom ring
    b.part(new THREE.CylinderGeometry(0.5, 0.42, 0.14, 8), shell, { bone: j, at: [x, 0.35, z], flat: true });
    // main housing
    b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.3, 8, 1, true), shell, { bone: j, at: [x, 0.55, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.58, 0.58, 0.07, 8), HAZ_COLOR(P), { bone: j, at: [x, 0.72, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 8), P.hullDark, { bone: j, at: [x, 0.64, z], flat: true });
    // underside glow plate
    glow(b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.04, 8), P.neonCyan, { bone: j, at: [x, 0.04, z], flat: true }), 1.6);
    glow(b.part(new THREE.TorusGeometry(0.44, 0.025, 4, 8), P.neonMagenta, { bone: j, at: [x, 0.08, z], rotation: [90, 0, 0] }), 1.5);
    // hub core
    glow(b.part(new THREE.SphereGeometry(0.14, 6, 4), P.neonCyan, { bone: j, at: [x, 0.2, z] }), 1.8);
    // fan on top
    b.part(new THREE.CircleGeometry(0.5, 8), "#ffffff", { bone: j, at: [x, 0.76, z], dir: [0, 1, 0], axis: "z", texture: FAN });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6), P.metal, { bone: j, at: [x, 0.78, z], flat: true });
    // hazard collar texture band
    b.part(new THREE.CylinderGeometry(0.595, 0.595, 0.05, 8, 1, true), "#ffffff", { bone: j, at: [x, 0.72, z], texture: HAZ, flat: true });
    // vent fins and bolts
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      b.part(new THREE.BoxGeometry(0.04, 0.2, 0.22), P.armor, {
        bone: j,
        at: [x + Math.cos(a) * 0.58, 0.5, z + Math.sin(a) * 0.58],
        rotation: [0, -a * 57.3, 0],
        flat: true,
      });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.part(new THREE.SphereGeometry(0.03, 4, 3), P.metal, { bone: j, at: [x + Math.cos(a) * 0.5, 0.78, z + Math.sin(a) * 0.5] });
    }
    // pylon to hull side
    b.rod([x, 0.7, z], [s * 1.05, 0.95, z], 0.09, P.hullDark, { bone: j, sides: 6, smooth: false });
    b.part(new THREE.BoxGeometry(0.2, 0.3, 0.3), P.armor, { bone: j, at: [s * 1.12, 0.95, z], flat: true });
    // winglet
    b.part(new THREE.BoxGeometry(0.4, 0.04, 0.22), P.trim, { bone: j, at: [x + s * 0.5, 0.3, z + (z > 0 ? 0.35 : -0.35)], rotation: [0, 0, s * 12], flat: true });
    // skid
    b.part(new THREE.BoxGeometry(0.12, 0.1, 1.0 + R() * 0.1), P.rubber, { bone: j, at: [x, 0.05, z], flat: true });
  }
}
function HAZ_COLOR(P: any) {
  return P.trim;
}
```

<!-- call: roofGun -->

```ts
import * as THREE from "three";
import { paint, svg, glowNone } from "agentic-3js-builder";
```

Correction: `glowNone` does not exist, so the final block below imports only real exports.

```ts
import * as THREE from "three";
import { svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRoofGun({ b, J, P, M }: Ctx) {
  const yaw = J.gunYaw;
  const pitch = J.gunPitch;
  const [mx, , mz] = M.roofGun;
  const R = rng(5);
  const RAIL = 0.46;
  const y0 = 1.97;

  // ---- roof rail ring (octagonal posts and rails on the roof, bone body)
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = mx + Math.sin(a) * RAIL;
    const z = mz + Math.cos(a) * RAIL;
    b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.08, 6), P.metal, { bone: J.body, at: [x, y0 + 0.04, z] });
    const a2 = ((i + 1) / n) * Math.PI * 2;
    const x2 = mx + Math.sin(a2) * RAIL;
    const z2 = mz + Math.cos(a2) * RAIL;
    b.rod([x, y0 + 0.085, z], [x2, y0 + 0.085, z2], 0.014, P.trim, { bone: J.body, sides: 6 });
  }
  b.part(new THREE.CylinderGeometry(0.4, 0.43, 0.04, 12), P.hullDark, { bone: J.body, at: [mx, y0 + 0.02, mz], flat: true });

  // ---- turntable on yaw
  b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.06, 12), P.armor, { bone: yaw, at: [mx, y0 + 0.07, mz], flat: true });
  b.part(new THREE.TorusGeometry(0.32, 0.015, 5, 16), P.neonCyan, { bone: yaw, at: [mx, y0 + 0.105, mz], rotation: [90, 0, 0] });
  glow(b.part(new THREE.TorusGeometry(0.32, 0.012, 5, 16), P.neonCyan, { bone: yaw, at: [mx, y0 + 0.108, mz], rotation: [90, 0, 0] }), 1.5);
  b.part(new THREE.BoxGeometry(0.46, 0.1, 0.4), P.hull, { bone: yaw, at: [mx, 2.17, mz - 0.02], flat: true });
  // yoke cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.2, 0.3), P.armor, { bone: yaw, at: [mx + s * 0.2, 2.25, mz], flat: true });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), P.metal, { bone: yaw, at: [mx + s * 0.235, 2.15, mz], rotation: [0, 0, 90] });
  }

  // ---- armored shield on pitch
  const warn = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#e7b814"/><path d="M-10 20 L20 -10 M0 40 L40 0 M0 64 L64 0 M24 64 L64 24 M44 64 L64 44" stroke="#15161b" stroke-width="9"/><path d="M32 12 L52 50 L12 50Z" fill="#e7b814" stroke="#15161b" stroke-width="4"/><rect x="30" y="24" width="4" height="14" fill="#15161b"/><rect x="30" y="41" width="4" height="4" fill="#15161b"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.BoxGeometry(0.62, 0.34, 0.05), P.armor, { bone: pitch, at: [mx, 2.2, mz + 0.2], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.1, 0.05), P.hull, { bone: pitch, at: [mx, 2.4, mz + 0.18], rotation: [-20, 0, 0], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.3, 0.1), P.armor, { bone: pitch, at: [mx + s * 0.34, 2.2, mz + 0.16], rotation: [0, s * -20, 0], flat: true });
    for (const y of [2.1, 2.3]) b.part(new THREE.SphereGeometry(0.012, 5, 4), P.metal, { bone: pitch, at: [mx + s * 0.27, y, mz + 0.235] });
  }
  b.part(new THREE.PlaneGeometry(0.12, 0.12), "#ffffff", { bone: pitch, at: [mx - 0.2, 2.2, mz + 0.228], dir: [0, 0, 1], axis: "z", texture: warn });
  b.part(new THREE.BoxGeometry(0.64, 0.025, 0.055), P.trim, { bone: pitch, at: [mx, 2.03, mz + 0.2] });
  // gun slot housing
  b.part(new THREE.BoxGeometry(0.34, 0.18, 0.2), P.hullDark, { bone: pitch, at: [mx, 2.2, mz + 0.3], flat: true });

  // ---- twin barrels
  for (const s of [1, -1]) {
    const x = mx + s * 0.09;
    const y = 2.2;
    b.rod([x, y, mz + 0.3], [x, y, mz + 1.15], 0.032, P.metal, { bone: pitch, sides: 8 });
    b.rod([x, y, mz + 0.4], [x, y, mz + 0.85], 0.048, P.hullDark, { bone: pitch, sides: 8 });
    for (let k = 0; k < 4; k++)
      b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 8), P.trim, { bone: pitch, at: [x, y, mz + 0.47 + k * 0.1], rotation: [90, 0, 0] });
    b.rod([x, y, mz + 1.1], [x, y, mz + 1.28], 0.048, P.armor, { bone: pitch, sides: 8 });
    for (const dy of [0.0]) b.part(new THREE.BoxGeometry(0.1, 0.012, 0.1), P.hullDark, { bone: pitch, at: [x, y + 0.045 + dy, mz + 1.2] });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.1), P.hullDark, { bone: pitch, at: [x + 0.045, y, mz + 1.2] });
    b.part(new THREE.BoxGeometry(0.012, 0.1, 0.1), P.hullDark, { bone: pitch, at: [x - 0.045, y, mz + 1.2] });
    glow(b.part(new THREE.CircleGeometry(0.022, 8), P.warnRed, { bone: pitch, at: [x, y, mz + 1.281], dir: [0, 0, 1], axis: "z" }), 1.2);
  }

  // ---- ammo drum + belt
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 10), P.hull, { bone: pitch, at: [mx + 0.3, 2.14, mz + 0.05], rotation: [0, 0, 90], flat: true });
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), P.trim, { bone: pitch, at: [mx + 0.39, 2.14, mz + 0.05], rotation: [0, 0, 90], flat: true });
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.1), P.armor, { bone: pitch, at: [mx + 0.32, 2.14, mz + 0.0] });
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.035), i % 2 ? P.rust : P.trim, {
      bone: pitch,
      at: [mx + 0.25 - t * 0.13, 2.1 + t * 0.07 + Math.sin(t * 3.1) * 0.03, mz + 0.12 + t * 0.14],
      rotation: [0, 0, 20 + R() * 5],
    });
  }

  // ---- sensor, laser, antenna
  b.part(new THREE.BoxGeometry(0.1, 0.09, 0.1), P.hullDark, { bone: pitch, at: [mx - 0.25, 2.4, mz + 0.1], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 5), P.neonCyan, { bone: pitch, at: [mx - 0.25, 2.4, mz + 0.16] }), 2);
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.1), P.hullDark, { bone: pitch, at: [mx + 0.16, 2.36, mz + 0.14], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.warnRed, { bone: pitch, at: [mx + 0.16, 2.36, mz + 0.2] }), 2.5);
  b.rod([mx + 0.16, 2.36, mz + 0.2], [mx + 0.16, 2.36, mz + 1.2], 0.003, P.warnRed, { bone: pitch, sides: 4 });
  glow(b.part(new THREE.BoxGeometry(0.004, 0.004, 0.9), P.warnRed, { bone: pitch, at: [mx + 0.16, 2.36, mz + 0.7] }), 2);

  // antenna dish on yaw
  b.rod([mx - 0.28, 2.15, mz - 0.2], [mx - 0.28, 2.42, mz - 0.2], 0.012, P.metal, { bone: yaw, sides: 6 });
  b.part(new THREE.SphereGeometry(0.07, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.metal, {
    bone: yaw, at: [mx - 0.28, 2.43, mz - 0.2], dir: [-0.5, 0.6, -0.6], flat: true,
  });
  b.rod([mx - 0.28, 2.43, mz - 0.2], [mx - 0.32, 2.5, mz - 0.26], 0.006, P.metal, { bone: yaw, sides: 4 });
  glow(b.part(new THREE.SphereGeometry(0.01, 4, 3), P.warnRed, { bone: yaw, at: [mx - 0.32, 2.51, mz - 0.26] }), 2);
}
```
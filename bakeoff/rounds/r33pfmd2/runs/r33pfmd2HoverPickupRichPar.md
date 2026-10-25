<!-- call: plan -->

```json
{
  "name": "Hoverbed Raider",
  "description": "A militarized pickup truck converted to hover thrusters: armored low-poly cyberpunk hull with neon underglow, four ducted thruster pods instead of wheels, roll cage with a pintle gun on the bed.",
  "builderName": "hoverRaider",
  "size": [2.6, 2.2, 5.6],
  "layout": "A chunky pickup, long axis along Z with the nose facing +Z. Hull is faceted dark gunmetal with hazard-yellow trim and magenta/cyan neon strips. Front hood sloped, cab in the middle, open cargo bed behind with a roll cage and a pintle gun. Four ducted hover thruster pods (cylindrical shrouds with glowing cyan fan discs facing down) hang on short pylons at the wheel positions, hull belly floating about 0.45 m above the floor. The pods' lowest points rest at y=0. Armor plates, a front bull-bar with headlights, a roof light bar and antenna add silhouette. Every part uses flat-faceted shapes, panelled paints, neon glow on lights, thruster discs and underglow, and SVG decals (stencil numbers, hazard stripes, a skull emblem).",
  "palette": {
    "hull": "#3a4150",
    "hullDark": "#20242e",
    "armor": "#566070",
    "trim": "#f0b90f",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "glass": "#16324a",
    "rubber": "#15161a",
    "steel": "#8d96a6",
    "rust": "#8a4a2a",
    "lampWhite": "#fff6d0",
    "red": "#e0243a"
  },
  "mounts": {
    "hullFloor": [0, 0.55, 0],
    "hoodTop": [0, 1.2, 1.7],
    "cabFloor": [0, 1.15, -0.1],
    "bedFloor": [0, 1.0, -1.9],
    "bedFront": [0, 1.0, -0.95],
    "podFL": [1.15, 0.35, 1.7],
    "podFR": [-1.15, 0.35, 1.7],
    "podRL": [1.15, 0.35, -1.8],
    "podRR": [-1.15, 0.35, -1.8],
    "gunMount": [0, 1.55, -1.9]
  },
  "joints": [
    { "name": "body", "at": [0, 0.8, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "podFL", "parent": "body", "at": [1.15, 0.35, 1.7], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "podFR", "parent": "body", "at": [-1.15, 0.35, 1.7], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "podRL", "parent": "body", "at": [1.15, 0.35, -1.8], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "podRR", "parent": "body", "at": [-1.15, 0.35, -1.8], "dir": [0, -1, 0], "role": "hinge", "group": "pods" },
    { "name": "gunYaw", "parent": "body", "at": [0, 1.55, -1.9], "dir": [0, 1, 0], "role": "hinge", "group": "gun" },
    { "name": "gunPitch", "parent": "gunYaw", "at": [0, 1.75, -1.9], "dir": [0, 0, -1], "role": "hinge", "group": "gun" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull and nose: faceted belly pan, side skirts, sloped hood with vents and panelled paint, front bumper/bull-bar with twin headlights (glow), grille with cyan glow slits, fender armor plates, hazard-stripe trim decals, underglow neon strips (magenta) under the sills, skid plate, tow hooks, rear bumper with red tail lights (glow). Rides joint body.",
      "box": [[-1.3, 0.5, -2.8], [1.3, 1.25, 2.8]],
      "attaches": "Top meets cab at cabFloor and bed at bedFloor; pylon sockets at the four pod mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Armored cab: faceted greenhouse with tinted glass, A/B pillars, slit armor shutters on side windows, roof plating with panelled paint, roof light bar (glow cyan/magenta), antenna whip with small flags, side mirrors, door panels with handles, stencil number and skull emblem decals on doors, hazard-striped roof hatch, rear cab wall with window.",
      "box": [[-1.2, 1.15, -1.0], [1.2, 2.1, 0.9]],
      "attaches": "Sits on chassis at cabFloor; rear wall meets bed at bedFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "bed",
      "builds": "Open cargo bed behind the cab: floor, side walls with armor ribs, tailgate, a roll cage of tubes arching over the bed, ammo crates, fuel jerrycans, a spare pod fan, rear tow ring, tool boxes, wiring, and a small cyan screen control panel. Does not include the gun.",
      "box": [[-1.25, 1.0, -2.8], [1.25, 1.9, -0.95]],
      "attaches": "Bed floor sits at bedFloor on chassis; roll cage feet at bedFront; gunMount base plate in the bed centre.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "pods",
      "builds": "Four hover thruster pods at the old wheel positions: each a short pylon strut from the hull, an angled faceted shroud ring (lathe) with armor ribs and hazard trim, an inner glowing cyan fan disc facing down with fan blade texture (SVG), small stabilizer fins, exhaust vent slats, a magenta ring light. Each pod on its own joint. Lowest points rest on y=0.",
      "box": [[-1.5, 0, -2.3], [1.5, 0.75, 2.3]],
      "attaches": "Pylons attach to chassis at podFL/FR/RL/RR mounts on the joints of the same names.",
      "joints": ["podFL", "podFR", "podRL", "podRR"],
      "floor": true,
      "budget": 200
    },
    {
      "id": "gun",
      "builds": "Pintle-mounted heavy gun on the bed: swivel base with ring, yoke, gun cradle, long barrel with muzzle brake and cooling vents, ammo box with belt of brass rounds, shield plate with hazard stripe and skull decal, sights with a glowing red dot, cyan power cell. Yaw and pitch joints.",
      "box": [[-0.5, 1.5, -2.9], [0.5, 2.2, -0.9]],
      "attaches": "Base plate on bed at gunMount; rides gunYaw and gunPitch.",
      "joints": ["gunYaw", "gunPitch"],
      "floor": false,
      "budget": 130
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, rotation: rot, flat: true, ...extra });

  // paints
  const hullPaint = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const base = mix(P.hullDark, P.hull, 0.35 + 0.65 * smoothstep(-0.6, 0.9, n.y));
      return mix(base, P.rust, 0.25 * smoothstep(0.62, 0.8, noise(p, 0.3, 4)) * smoothstep(0.5, -0.5, n.y));
    }),
    { size: 0.4, rivets: 0.07 },
  );
  const armorPaint = panelled(metal("iron", { tarnish: 0.5, size: 0.2 }), { size: 0.3, rivets: 0.06 });
  const darkPaint = metal("iron", { tarnish: 0.6 });

  // textures
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#15161a"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const grilleTex = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0a0b0e"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${4 + i * 10}" y="3" width="6" height="18" rx="2" fill="${P.neonCyan}"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const tailTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.red}"/><rect x="2" y="6" width="60" height="4" fill="#ffd0d0"/></svg>`,
    { size: 128 },
  );
  const ventTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#101218"/>${Array.from({ length: 6 }, (_, i) => `<rect x="3" y="${3 + i * 5}" width="26" height="2.5" fill="#3a4150"/>`).join("")}</svg>`,
    { size: 128 },
  );

  const plane = (w: number, h: number, color: any, at: number[], dir: number[], tex: any, up: number[] = [0, 1, 0]) =>
    b.part(new THREE.PlaneGeometry(w, h), color, { bone: body, at, dir, up, axis: "z", texture: tex });

  // main lower hull: belly pan and side blocks
  box(2.3, 0.22, 5.4, darkPaint, [0, 0.62, 0]);
  box(2.5, 0.38, 5.5, hullPaint, [0, 0.9, -0.05]);
  // sloped hood (wedge)
  b.frustumBox([0, 1.0, 0.8], [0, 1.17, 2.6], [2.4, 0.3], [2.1, 0.16], { bone: body, color: hullPaint });
  b.frustumBox([0, 1.05, 0.7], [0, 1.2, 1.5], [1.2, 0.1], [1.0, 0.1], { bone: body, color: armorPaint });
  // hood vents and centre ridge
  for (const s of [1, -1]) {
    plane(0.5, 0.55, "#ffffff", [s * 0.55, 1.215, 1.45], [0, 1, 0], ventTex, [0, 0, 1]);
    box(0.06, 0.04, 1.3, P.trim, [s * 0.22, 1.2, 1.5]);
  }
  // hood hazard strip at front lip
  plane(2.0, 0.1, "#ffffff", [0, 1.1, 2.62], [0, 0.2, 1], hazard);

  // nose front fascia
  box(2.4, 0.42, 0.2, hullPaint, [0, 0.86, 2.7]);
  // grille with cyan glow slits
  glow(plane(1.2, 0.3, "#ffffff", [0, 0.88, 2.81], [0, 0, 1], grilleTex), 1.3);
  box(1.3, 0.38, 0.05, P.hullDark, [0, 0.88, 2.78]);

  // bull bar
  for (const x of [-1, 1]) b.rod([x * 0.95, 0.62, 2.85], [x * 0.95, 1.12, 2.85], 0.05, P.steel, { bone: body, sides: 6 });
  b.rod([-1.05, 1.1, 2.88], [1.05, 1.1, 2.88], 0.05, P.steel, { bone: body, sides: 6 });
  b.rod([-1.0, 0.7, 2.9], [1.0, 0.7, 2.9], 0.06, P.steel, { bone: body, sides: 6 });
  box(2.0, 0.12, 0.2, armorPaint, [0, 0.55, 2.85]);
  b.rod([-0.4, 0.7, 2.9], [-0.4, 1.1, 2.88], 0.03, P.steel, { bone: body, sides: 6 });
  b.rod([0.4, 0.7, 2.9], [0.4, 1.1, 2.88], 0.03, P.steel, { bone: body, sides: 6 });
  plane(1.8, 0.1, "#ffffff", [0, 0.55, 2.96], [0, 0, 1], hazard);

  // headlights (glow)
  for (const s of [1, -1]) {
    box(0.5, 0.26, 0.12, P.hullDark, [s * 0.88, 0.95, 2.78]);
    glow(b.part(new THREE.CylinderGeometry(0.11, 0.12, 0.1, 8), P.lampWhite, { bone: body, at: [s * 0.88, 0.95, 2.86], dir: [0, 0, 1] }), 2);
    glow(box(0.3, 0.04, 0.04, P.neonCyan, [s * 0.88, 1.12, 2.82]), 1.5);
  }

  // fender armor plates
  for (const s of [1, -1]) {
    for (const z of [1.7, -1.8]) {
      box(0.14, 0.4, 1.4, armorPaint, [s * 1.27, 0.98, z], [0, 0, s * 6]);
      box(0.18, 0.06, 1.0, P.trim, [s * 1.3, 1.2, z]);
      // pod socket collar
      b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.2, 8), P.hullDark, { bone: body, at: [s * 1.15, 0.5, z], flat: true });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), P.neonMagenta, { bone: body, at: [s * 1.15, 0.38, z] });
    }
    // side skirt
    box(0.16, 0.2, 2.6, armorPaint, [s * 1.26, 0.7, 0], [0, 0, s * 8]);
    box(0.06, 0.08, 2.4, P.trim, [s * 1.32, 0.82, 0]);
    // side hazard decal
    plane(2.2, 0.12, "#ffffff", [s * 1.325, 0.95, -0.05], [s, 0, 0], hazard, [0, 1, 0]);
    // underglow strips
    glow(box(0.05, 0.05, 3.2, P.neonMagenta, [s * 1.2, 0.55, 0]), 2);
    glow(box(0.05, 0.05, 0.9, P.neonMagenta, [s * 1.0, 0.5, 2.3], [0, 0, 0]), 2);
    glow(box(0.05, 0.05, 0.9, P.neonMagenta, [s * 1.0, 0.5, -2.3]), 2);
    // tow hooks
    b.rod([s * 0.7, 0.65, 2.88], [s * 0.7, 0.65, 3.0], 0.03, P.rust, { bone: body, sides: 6 });
    b.sweep(
      [[s * 0.7, 0.65, 3.0], [s * 0.7, 0.55, 3.1], [s * 0.7, 0.45, 3.0], [s * 0.7, 0.55, 2.9]],
      0.025,
      { bone: body, color: P.rust, sides: 5 },
    );
    // wheel-well style notch armor
    box(0.1, 0.3, 0.5, P.trim, [s * 1.3, 1.0, 0.95]);
    box(0.1, 0.3, 0.5, P.trim, [s * 1.3, 1.0, -0.95]);
  }
  // belly
  glow(box(1.6, 0.04, 0.05, P.neonMagenta, [0, 0.5, 1.2]), 1.8);
  glow(box(1.6, 0.04, 0.05, P.neonMagenta, [0, 0.5, -1.2]), 1.8);
  b.frustumBox([0, 0.5, -1.2], [0, 0.5, 1.8], [1.3, 0.08], [0.8, 0.08], { bone: body, color: darkPaint });
  box(1.4, 0.05, 1.5, P.steel, [0, 0.52, 0.2], [3, 0, 0]);

  // rear section and bumper
  box(2.5, 0.5, 0.3, hullPaint, [0, 0.95, -2.62]);
  box(2.6, 0.22, 0.3, armorPaint, [0, 0.62, -2.72]);
  plane(2.2, 0.12, "#ffffff", [0, 0.62, -2.88], [0, 0, -1], hazard);
  for (const s of [1, -1]) {
    box(0.6, 0.24, 0.1, P.hullDark, [s * 0.9, 1.02, -2.78]);
    glow(plane(0.54, 0.16, "#ffffff", [s * 0.9, 1.02, -2.84], [0, 0, -1], tailTex), 1.8);
    b.part(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 8), P.steel, { bone: body, at: [s * 0.45, 0.62, -2.9], dir: [0, 0, -1], flat: true });
    glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 6), P.neonCyan, { bone: body, at: [s * 0.45, 0.62, -3.0], dir: [0, 0, -1] }), 1.5);
  }
  glow(box(1.0, 0.04, 0.04, P.red, [0, 0.8, -2.78]), 1.5);
  // rear tow bracket
  box(0.5, 0.1, 0.18, P.steel, [0, 0.62, -2.9]);
  // top mounting plates for cab and bed
  box(2.2, 0.06, 1.9, P.hullDark, [0, 1.12, -0.1]);
  box(2.3, 0.06, 1.8, P.hullDark, [0, 1.0, -1.9]);
  // cowl between hood and cab
  box(2.3, 0.14, 0.3, armorPaint, [0, 1.17, 0.85], [-12, 0, 0]);
  // skull emblem on hood
  const skull = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 3C8 3 5 9 5 14c0 4 2 6 4 7v5h4v-3h2v3h2v-3h2v3h4v-5c2-1 4-3 4-7 0-5-3-11-11-11z" fill="#f2f2f2" stroke="#15161a" stroke-width="1.5"/><circle cx="11" cy="14" r="3.2" fill="#15161a"/><circle cx="21" cy="14" r="3.2" fill="#15161a"/><path d="M16 18l-2 3h4z" fill="#15161a"/></svg>`,
    { size: 128 },
  );
  plane(0.4, 0.4, "#ffffff", [0, 1.21, 2.05], [0, 1, 0.05], skull, [0, 0, 1]);
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildBed({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const X_MIN = -1.25, X_MAX = 1.25, Z_FRONT = -0.95, Z_BACK = -2.8;
  const FLOOR = 1.0;
  const WIDTH = X_MAX - X_MIN;
  const LEN = Z_FRONT - Z_BACK;
  const CZ = (Z_FRONT + Z_BACK) / 2;

  const box = (w: number, h: number, d: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...extra });

  // paints
  const hullPaint = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const t = noise(p, 0.3, 4);
      const base = mix(P.hullDark, P.hull, 0.5 + 0.5 * n.y);
      return mix(base, P.rust, 0.18 * smoothstep(0.6, 0.85, t));
    }),
    { size: 0.35, rivets: 0.07 },
  );
  const deckPaint = panelled(
    paint((p: THREE.Vector3) => mix(P.hullDark, P.armor, 0.3 + 0.4 * noise(p, 0.2, 9))),
    { size: 0.3, aspect: 1, rivets: 0.06 },
  );
  const armorPaint = panelled(metal("steel", { tarnish: 0.5, size: 0.12 }), { size: 0.22, rivets: 0.05 });
  const crateGreen = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix("#4a5a3a", "#2e3a26", 0.4 + 0.4 * noise(p, 0.1, 3) - 0.2 * n.y),
  );
  const redCan = paint((p: THREE.Vector3) => mix("#a02a2a", "#6a1818", noise(p, 0.08, 2)));

  // textures
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 10 - 8} 16 L${i * 10} 0 L${i * 10 + 5} 0 L${i * 10 - 3} 16Z" fill="#14161a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#f0e8c8" opacity="0.85">07</text><rect x="2" y="2" width="60" height="28" fill="none" stroke="#f0e8c8" stroke-width="2" opacity="0.6"/></svg>`,
    { size: 128 },
  );
  const screen = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06222c"/>
    <path d="M4 30 L14 22 L22 26 L32 12 L42 20 L52 8 L60 14" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <rect x="4" y="4" width="20" height="3" fill="#2ff3ff"/><rect x="4" y="9" width="12" height="2" fill="#ff2fb4"/>
    <circle cx="54" cy="32" r="4" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const fanTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0a3a44"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M50 50 L${50 + 46 * Math.cos((i * Math.PI) / 4)} ${50 + 46 * Math.sin((i * Math.PI) / 4)} L${50 + 46 * Math.cos((i * Math.PI) / 4 + 0.5)} ${50 + 46 * Math.sin((i * Math.PI) / 4 + 0.5)}Z" fill="#2ff3ff"/>`).join("") +
      `<circle cx="50" cy="50" r="9" fill="#20242e"/></svg>`,
    { size: 128 },
  );

  // floor
  box(WIDTH - 0.1, 0.1, LEN, deckPaint, [0, FLOOR + 0.05, CZ]);
  // ribbed floor strips
  for (let i = 0; i < 7; i++) box(WIDTH - 0.3, 0.02, 0.05, P.hullDark, [0, FLOOR + 0.11, Z_BACK + 0.25 + i * 0.26]);

  // side walls with ribs
  for (const s of [1, -1]) {
    const x = s * (X_MAX - 0.07);
    box(0.14, 0.62, LEN, hullPaint, [x, FLOOR + 0.4, CZ]);
    box(0.2, 0.06, LEN + 0.02, P.armor, [x, FLOOR + 0.74, CZ]);
    // hazard trim on wall top outside
    b.part(new THREE.PlaneGeometry(LEN - 0.1, 0.12), "#ffffff", {
      bone, at: [s * (X_MAX + 0.005), FLOOR + 0.58, CZ], dir: [s, 0, 0], axis: "z", texture: hazard,
    });
    // stencil number
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone, at: [s * (X_MAX + 0.006), FLOOR + 0.3, CZ + 0.4], dir: [s, 0, 0], axis: "z", texture: stencil,
    });
    // armor ribs
    for (let i = 0; i < 6; i++) {
      const z = Z_BACK + 0.3 + i * 0.3;
      box(0.06, 0.58, 0.07, armorPaint, [s * (X_MAX + 0.01), FLOOR + 0.4, z]);
    }
    // wheel-arch bulges
    b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.2, 6), hullPaint, {
      bone, at: [s * (X_MAX - 0.5), FLOOR + 0.12, CZ - 0.2], rotation: [0, 0, 90],
    });
  }

  // front bulkhead (cab rear)
  box(WIDTH - 0.28, 0.7, 0.1, hullPaint, [0, FLOOR + 0.45, Z_FRONT - 0.06]);
  box(WIDTH - 0.28, 0.06, 0.14, P.armor, [0, FLOOR + 0.82, Z_FRONT - 0.06]);

  // tailgate
  box(WIDTH, 0.64, 0.1, hullPaint, [0, FLOOR + 0.4, Z_BACK + 0.05]);
  box(WIDTH, 0.06, 0.14, P.armor, [0, FLOOR + 0.74, Z_BACK + 0.05]);
  b.part(new THREE.PlaneGeometry(WIDTH - 0.3, 0.14), "#ffffff", {
    bone, at: [0, FLOOR + 0.5, Z_BACK - 0.003], dir: [0, 0, -1], axis: "z", texture: hazard,
  });
  for (const s of [1, -1]) {
    box(0.1, 0.12, 0.14, P.steel, [s * (X_MAX - 0.18), FLOOR + 0.55, Z_BACK - 0.02]); // latches
    cyl(0.04, 0.04, 0.1, 6, P.steel, [s * (X_MAX - 0.18), FLOOR + 0.55, Z_BACK - 0.1], { rotation: [90, 0, 0] });
  }
  // tow ring
  const ring = b.sweep(
    (() => {
      const pts: [number, number, number][] = [];
      for (let i = 0; i <= 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        pts.push([Math.cos(a) * 0.1, FLOOR + 0.3 + Math.sin(a) * 0.1, Z_BACK - 0.1]);
      }
      return pts;
    })(),
    0.025,
    { color: P.steel, bone, skin: "rigid" },
  );
  void ring;
  box(0.16, 0.08, 0.1, P.steel, [0, FLOOR + 0.4, Z_BACK - 0.03]);

  // roll cage: arches + rails
  const tubeR = 0.04;
  for (const z of [Z_FRONT - 0.2, CZ - 0.2]) {
    const pts: [number, number, number][] = [
      [X_MAX - 0.15, FLOOR + 0.1, z],
      [X_MAX - 0.15, FLOOR + 0.8, z],
      [X_MAX - 0.45, FLOOR + 0.89, z],
      [0.3, 1.9 - 0.03, z],
      [-0.3, 1.9 - 0.03, z],
      [-X_MAX + 0.45, FLOOR + 0.89, z],
      [-X_MAX + 0.15, FLOOR + 0.8, z],
      [-X_MAX + 0.15, FLOOR + 0.1, z],
    ];
    b.sweep(pts, tubeR, { color: P.steel, bone, skin: "rigid", section: { ngon: 6 } });
    for (const s of [1, -1]) cyl(0.09, 0.11, 0.05, 6, P.hullDark, [s * (X_MAX - 0.15), FLOOR + 0.12, z]); // feet
  }
  // longitudinal roof rails
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 1.87, Z_FRONT - 0.2], [s * 0.3, 1.87, CZ - 0.2], tubeR, P.steel, { bone });
    b.rod([s * (X_MAX - 0.15), FLOOR + 0.8, Z_FRONT - 0.2], [s * (X_MAX - 0.15), FLOOR + 0.8, CZ - 0.2], tubeR, P.steel, { bone });
  }
  // diagonal brace
  b.rod([X_MAX - 0.15, FLOOR + 0.8, Z_FRONT - 0.2], [-0.3, 1.87, CZ - 0.2], 0.03, P.trim, { bone });
  b.rod([-X_MAX + 0.15, FLOOR + 0.8, Z_FRONT - 0.2], [0.3, 1.87, CZ - 0.2], 0.03, P.trim, { bone });
  // cage hazard bands
  for (const s of [1, -1]) for (const z of [Z_FRONT - 0.2, CZ - 0.2])
    cyl(0.05, 0.05, 0.1, 6, P.trim, [s * (X_MAX - 0.15), FLOOR + 0.5, z]);
  // cage light
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonMagenta, { bone, at: [0, 1.82, CZ - 0.2] }), 1.5);

  // gun mount base plate (center)
  cyl(0.38, 0.42, 0.08, 8, armorPaint, [0, FLOOR + 0.14, -1.9]);
  cyl(0.3, 0.3, 0.04, 8, P.hullDark, [0, FLOOR + 0.2, -1.9]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    cyl(0.025, 0.025, 0.04, 5, P.steel, [Math.cos(a) * 0.34, FLOOR + 0.2, -1.9 + Math.sin(a) * 0.34]);
  }

  // ammo crates (left front)
  const crate = (x: number, z: number, y: number, rot: number, w = 0.5) => {
    box(w, 0.32, 0.34, crateGreen, [x, y, z], { rotation: [0, rot, 0] });
    box(w + 0.02, 0.04, 0.36, P.trim, [x, y + 0.1, z], { rotation: [0, rot, 0] });
    cyl(0.025, 0.025, w * 0.5, 5, P.steel, [x, y + 0.2, z], { rotation: [0, rot, 90] });
  };
  crate(0.8, -1.25, FLOOR + 0.26, 5);
  crate(0.8, -1.7, FLOOR + 0.26, -4);
  crate(0.78, -1.45, FLOOR + 0.58, 10, 0.44);
  crate(-0.8, -1.2, FLOOR + 0.26, -6);

  // jerrycans (right side)
  const can = (x: number, z: number) => {
    box(0.26, 0.38, 0.14, redCan, [x, FLOOR + 0.29, z]);
    box(0.08, 0.1, 0.1, P.hullDark, [x - 0.06, FLOOR + 0.52, z]);
    cyl(0.03, 0.03, 0.05, 6, P.steel, [x + 0.05, FLOOR + 0.5, z]);
    box(0.2, 0.04, 0.016, P.trim, [x, FLOOR + 0.3, z + 0.078]);
  };
  can(-0.85, -1.65);
  can(-0.85, -1.85);
  can(-0.85, -2.05);
  b.rod([-1.05, FLOOR + 0.35, -1.5], [-1.05, FLOOR + 0.35, -2.2], 0.015, P.rubber, { bone }); // strap

  // spare pod fan leaning on the tailgate
  cyl(0.38, 0.38, 0.1, 10, P.hullDark, [0.55, FLOOR + 0.5, Z_BACK + 0.22], { rotation: [75, 0, 0] });
  glow(
    b.part(new THREE.CircleGeometry(0.33, 10), "#ffffff", {
      bone, at: [0.55, FLOOR + 0.5 + 0.026, Z_BACK + 0.22 + 0.095], dir: [0, 0.26, 0.97], axis: "z", texture: fanTex,
    }),
    1,
  );
  cyl(0.04, 0.04, 0.12, 6, P.steel, [0.55, FLOOR + 0.5, Z_BACK + 0.22], { rotation: [75, 0, 0] });

  // tool boxes along the bulkhead
  for (const s of [1, -1]) {
    box(0.5, 0.26, 0.3, armorPaint, [s * 0.9, FLOOR + 0.23, Z_FRONT - 0.3]);
    box(0.52, 0.03, 0.32, P.trim, [s * 0.9, FLOOR + 0.37, Z_FRONT - 0.3]);
    box(0.12, 0.05, 0.03, P.steel, [s * 0.9, FLOOR + 0.28, Z_FRONT - 0.14]);
  }

  // wiring: cables from panel to cage
  b.sweep(
    [[0.2, FLOOR + 0.78, Z_FRONT - 0.14], [0.35, FLOOR + 0.95, Z_FRONT - 0.22], [0.9, FLOOR + 0.9, Z_FRONT - 0.2], [X_MAX - 0.15, FLOOR + 0.8, Z_FRONT - 0.2]],
    0.013,
    { color: P.rubber, bone, skin: "rigid" },
  );
  b.sweep(
    [[-0.2, FLOOR + 0.78, Z_FRONT - 0.14], [-0.3, FLOOR + 0.55, Z_FRONT - 0.3], [-0.5, FLOOR + 0.13, -1.3], [-0.2, FLOOR + 0.13, -1.7]],
    0.013,
    { color: P.neonMagenta, bone, skin: "rigid" },
  );

  // control panel with cyan screen on bulkhead
  box(0.62, 0.38, 0.08, P.hullDark, [0, FLOOR + 0.62, Z_FRONT - 0.13]);
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.3), "#ffffff", {
      bone, at: [0, FLOOR + 0.62, Z_FRONT - 0.17], dir: [0, 0, -1], axis: "z", texture: screen,
    }),
    1.3,
  );
  for (let i = 0; i < 3; i++)
    glow(cyl(0.015, 0.015, 0.03, 6, [P.red, P.neonCyan, P.neonMagenta][i], [-0.2 + i * 0.2, FLOOR + 0.4, Z_FRONT - 0.17], { rotation: [90, 0, 0] }), 1.5);

  // underglow strips on bed inner edges (neon)
  for (const s of [1, -1])
    glow(box(0.03, 0.03, LEN - 0.3, P.neonCyan, [s * (X_MAX - 0.16), FLOOR + 0.12, CZ]), 1.4);
  glow(box(WIDTH - 0.4, 0.03, 0.03, P.neonMagenta, [0, FLOOR + 0.12, Z_BACK + 0.15]), 1.4);

  // rear tail marker lights
  for (const s of [1, -1]) glow(box(0.16, 0.08, 0.04, P.red, [s * (X_MAX - 0.12), FLOOR + 0.78, Z_BACK - 0.06]), 1.5);

  // scattered small bolts on floor
  for (let i = 0; i < 6; i++) {
    cyl(0.025, 0.025, 0.02, 5, P.steel, [(R() - 0.5) * 1.6, FLOOR + 0.12, Z_BACK + 0.3 + R() * 1.4]);
  }
}
```

<!-- call: pods -->

```ts
import * as THREE from "three";
import { frame, paint, svg } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildPods({ b, J, P, M }: Ctx) {
  // ---------- textures ----------
  let blades = "";
  for (let i = 0; i < 7; i++) {
    blades += `<g transform="rotate(${(i * 360) / 7} 50 50)">
      <path d="M50 50 L47 12 Q58 6 66 16 Q60 34 50 50Z" fill="#2ff3ff" stroke="#e8ffff" stroke-width="1.2"/>
      <path d="M50 50 L52 20 Q58 18 61 21 Q57 34 50 50Z" fill="#9ffcff" opacity="0.7"/></g>`;
  }
  const FAN = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="#06222c"/>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#1fb8c8" stroke-width="3"/>
      ${blades}
      <circle cx="50" cy="50" r="9" fill="#0b1a22" stroke="#2ff3ff" stroke-width="2"/>
      <circle cx="50" cy="50" r="3" fill="#e8ffff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------- paints ----------
  const SHROUD = panelled(P.hull, { size: 0.14, rivets: 0.04 });
  const HAZARD = paint((_p, _n, s) => (Math.floor(s[1] / 22.5) % 2 === 0 ? P.trim : P.hullDark));
  const PYLON = panelled(P.armor, { size: 0.1, rivets: 0.03 });

  // ---------- profiles ----------
  const shell: [number, number][] = [
    [0.26, 0],
    [0.34, 0.03],
    [0.36, 0.2],
    [0.36, 0.45],
    [0.31, 0.57],
    [0.26, 0.5],
    [0.25, 0.06],
  ];
  const band: [number, number][] = [
    [0.352, 0],
    [0.376, 0],
    [0.376, 0.06],
    [0.352, 0.06],
  ];
  const fin: [number, number][] = [
    [0, 0],
    [0.13, 0],
    [0.02, 0.2],
  ];

  const names = ["podFL", "podFR", "podRL", "podRR"] as const;

  for (const name of names) {
    const j = J[name];
    const [cx, , cz] = M[name];
    const sx = cx > 0 ? 1 : -1;
    const inboard = -sx;

    // Pylon strut up to the hull (two braces + socket plate)
    b.rod([cx + inboard * 0.18, 0.74, cz], [cx, 0.5, cz], 0.07, PYLON, { bone: j, sides: 4 });
    b.rod([cx + inboard * 0.3, 0.7, cz + 0.2], [cx, 0.48, cz + 0.08], 0.03, P.steel, { bone: j, sides: 4 });
    b.rod([cx + inboard * 0.3, 0.7, cz - 0.2], [cx, 0.48, cz - 0.08], 0.03, P.steel, { bone: j, sides: 4 });
    b.part(new THREE.BoxGeometry(0.34, 0.05, 0.26), P.hullDark, {
      bone: j,
      at: [cx + inboard * 0.2, 0.745, cz],
    });

    // Shroud
    b.lathe(shell, { at: [cx, 0, cz], bone: j, segments: 10, color: SHROUD });
    // Hazard trim band
    b.lathe(band, { at: [cx, 0.38, cz], bone: j, segments: 16, color: HAZARD });
    // lower lip trim
    b.lathe(
      [
        [0.25, 0],
        [0.3, 0],
        [0.3, 0.025],
        [0.25, 0.025],
      ],
      { at: [cx, 0, cz], bone: j, segments: 10, color: P.hullDark },
    );

    // Armor ribs
    const ribLine = frame([cx, 0.27, cz], [0, 1, 0]);
    b.ring(ribLine, { count: 6, radius: 0.35 }, (it) =>
      b.stick(new THREE.BoxGeometry(0.06, 0.05, 0.36), P.armor, it, { embed: 0.4, bone: j }),
    );

    // Magenta ring light on the rim
    glow(
      b.part(new THREE.TorusGeometry(0.285, 0.014, 5, 16), P.neonMagenta, {
        bone: j,
        at: [cx, 0.55, cz],
        dir: [0, 1, 0],
        axis: "z",
      }),
      1.5,
    );

    // Glowing fan disc facing down
    glow(
      b.part(new THREE.CircleGeometry(0.245, 16), "#ffffff", {
        bone: j,
        at: [cx, 0.17, cz],
        dir: [0, -1, 0],
        axis: "z",
        texture: FAN,
      }),
      1.3,
    );
    // Dark upper cover so the disc isn't visible from above
    b.part(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 10), P.hullDark, { bone: j, at: [cx, 0.185, cz] });
    // Hub
    b.part(new THREE.ConeGeometry(0.05, 0.08, 6), P.steel, {
      bone: j,
      at: [cx, 0.12, cz],
      dir: [0, -1, 0],
    });
    // Safety grille bars under the fan
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3;
      const dx = Math.sin(a) * 0.26;
      const dz = Math.cos(a) * 0.26;
      b.rod([cx - dx, 0.045, cz - dz], [cx + dx, 0.045, cz + dz], 0.012, P.steel, { bone: j, sides: 4 });
    }

    // Underglow ring bulb under the lip (cyan)
    glow(
      b.part(new THREE.TorusGeometry(0.31, 0.01, 4, 16), P.neonCyan, {
        bone: j,
        at: [cx, 0.025, cz],
        dir: [0, 1, 0],
        axis: "z",
      }),
      1.2,
    );

    // Stabilizer fins front and back
    for (const d of [1, -1]) {
      b.extrude(fin, {
        at: [cx, 0.3, cz + d * 0.34],
        x: [0, 0, d],
        thickness: 0.025,
        color: P.armor,
        bone: j,
      });
    }

    // Vent slats on the inboard side
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.03, 0.035, 0.2), P.rubber, {
        bone: j,
        at: [cx + inboard * 0.355, 0.2 + i * 0.07, cz],
      });
    }
    // Small yellow warning chevrons on the outboard face
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.1), P.trim, {
      bone: j,
      at: [cx + sx * 0.362, 0.27, cz],
    });
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { countershade, svg, aim } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> }) {
  const bone = J.body;
  const D = THREE.MathUtils.degToRad;
  void M; void aim;

  // ---------- paints & textures ----------
  const HULL = panelled(countershade(P.armor, P.hull, { level: 0.1 }), { size: 0.3, rivets: 0.06 });
  const ROOF = panelled(P.armor, { size: 0.35, rivets: 0.07 });
  const DARK = panelled(P.hullDark, { size: 0.22, rivets: 0.05 });

  const hazard = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="${P.trim}"/>
     ${[-64, -32, 0, 32, 64].map((x) => `<path d="M${x} 64 L${x + 16} 64 L${x + 80} 0 L${x + 64} 0Z" fill="#15161a"/>`).join("")}
     <rect x="1" y="1" width="62" height="62" fill="none" stroke="#15161a" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const skull = svg(
    `<svg viewBox="0 0 64 64">
     <path d="M32 6 C14 6 8 20 12 34 C13 40 17 42 20 44 L20 54 L44 54 L44 44 C47 42 51 40 52 34 C56 20 50 6 32 6Z" fill="#e8e8e0" stroke="#15161a" stroke-width="3"/>
     <ellipse cx="22" cy="30" rx="7" ry="8" fill="#15161a"/><ellipse cx="42" cy="30" rx="7" ry="8" fill="#15161a"/>
     <path d="M32 36 L28 44 L36 44Z" fill="#15161a"/>
     <path d="M26 48 V54 M32 48 V54 M38 48 V54" stroke="#15161a" stroke-width="2.5"/>
     <circle cx="22" cy="30" r="2.5" fill="#e0243a"/><circle cx="42" cy="30" r="2.5" fill="#e0243a"/></svg>`,
    { size: 128 },
  );
  const number = svg(
    `<svg viewBox="0 0 96 64"><text x="48" y="52" text-anchor="middle" font-family="Impact, Arial Black, sans-serif" font-weight="bold" font-size="60" fill="#e8e8e0" stroke="#15161a" stroke-width="2.5">07</text>
     <path d="M4 60 H92" stroke="${P.trim}" stroke-width="3"/></svg>`,
    { size: 192 },
  );
  const slits = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#20242e"/>
     ${[3, 11, 19, 27].map((y) => `<rect x="4" y="${y}" width="56" height="4" fill="#0b0c10"/><rect x="4" y="${y + 4}" width="56" height="1.2" fill="#566070"/>`).join("")}</svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (size: number[], color: any, at: number[], rot: number[] = [0, 0, 0], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, rotation: rot, flat: true, ...extra });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff", up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir, axis: "z", up, texture: tex });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone, at, rotation: rot, flat: true });

  // ---------- lower cab body ----------
  box([2.3, 0.45, 1.85], HULL, [0, 1.38, -0.08]);
  // sill / skirt trim
  for (const s of [1, -1]) {
    box([0.06, 0.07, 1.8], P.trim, [s * 1.17, 1.19, -0.08]);
    box([0.1, 0.12, 0.7], P.armor, [s * 1.17, 1.5, 0.55], [0, 0, 0]);
    // door plates
    box([0.04, 0.34, 0.86], DARK, [s * 1.16, 1.4, 0.22]);
    box([0.04, 0.34, 0.86], DARK, [s * 1.16, 1.4, -0.58]);
    // handles
    box([0.07, 0.04, 0.2], P.steel, [s * 1.2, 1.53, 0.0]);
    box([0.07, 0.04, 0.2], P.steel, [s * 1.2, 1.53, -0.8]);
    // door hazard stripes
    plane(0.08, 0.34, hazard, [s * 1.185, 1.4, 0.63], [s, 0, 0]);
    plane(0.08, 0.34, hazard, [s * 1.185, 1.4, -0.98 + 0.02], [s, 0, 0]);
  }
  // decals on doors: number right side (-x), skull left side (+x), plus small repeat
  plane(0.5, 0.33, number, [-1.188, 1.4, 0.22], [-1, 0, 0]);
  plane(0.3, 0.3, skull, [1.188, 1.4, 0.22], [1, 0, 0]);
  plane(0.3, 0.2, number, [1.188, 1.4, -0.58], [1, 0, 0]);
  plane(0.3, 0.3, skull, [-1.188, 1.4, -0.58], [-1, 0, 0]);

  // cowl (between hood and windshield)
  box([2.2, 0.1, 0.22], P.hullDark, [0, 1.63, 0.83]);
  glow(box([1.6, 0.025, 0.04], P.neonCyan, [0, 1.69, 0.92]), 1.2);

  // ---------- greenhouse ----------
  b.frustumBox([0, 1.6, -0.05], [0, 2.0, -0.12], [2.1, 1.7], [1.75, 1.2], { bone, color: HULL });
  // windshield
  box([1.62, 0.5, 0.03], P.glass, [0, 1.8, 0.8], [-40, 0, 0], { });
  glow(box([1.5, 0.02, 0.02], P.neonCyan, [0, 1.99, 0.52]), 0.6);
  // windshield frame
  box([1.72, 0.05, 0.05], P.hullDark, [0, 1.575, 0.82]);
  // side windows (glass) tilted with the greenhouse sides
  for (const s of [1, -1]) {
    box([0.03, 0.34, 1.28], P.glass, [s * 1.02, 1.8, -0.12], [0, 0, s * -10]);
    // armor shutter over the upper half of the side window
    plane(1.25, 0.16, slits, [s * 1.05, 1.9, -0.12], [s, 0.18 * 0, 0]);
    box([0.04, 0.03, 1.32], P.trim, [s * 1.03, 1.98, -0.12], [0, 0, s * -10]);
    // pillars
    b.rod([s * 1.07, 1.62, 0.8], [s * 0.88, 2.0, 0.53], 0.045, P.hullDark, { bone, sides: 6 });
    b.rod([s * 1.05, 1.62, -0.38], [s * 0.88, 2.0, -0.38], 0.05, P.armor, { bone, sides: 6 });
    b.rod([s * 1.05, 1.62, -0.72], [s * 0.88, 2.0, -0.66], 0.05, P.hullDark, { bone, sides: 6 });
    // mirrors
    b.rod([s * 1.1, 1.72, 0.62], [s * 1.28, 1.8, 0.66], 0.015, P.steel, { bone, sides: 6 });
    box([0.05, 0.16, 0.12], P.hullDark, [s * 1.31, 1.8, 0.64], [0, 0, 0]);
    box([0.01, 0.12, 0.09], P.glass, [s * 1.34, 1.8, 0.64]);
  }

  // ---------- rear wall ----------
  box([2.3, 0.45, 0.1], DARK, [0, 1.38, -0.98]);
  box([2.0, 0.65, 0.08], HULL, [0, 1.8, -0.84], [-8, 0, 0]);
  box([1.3, 0.3, 0.03], P.glass, [0, 1.82, -0.89], [-8, 0, 0]);
  for (const s of [1, -1]) box([0.04, 0.34, 0.04], P.hullDark, [s * 0.66, 1.82, -0.9], [-8, 0, 0]);
  box([1.34, 0.04, 0.05], P.trim, [0, 1.99, -0.86], [-8, 0, 0]);
  box([1.34, 0.04, 0.05], P.hullDark, [0, 1.64, -0.93]);
  glow(box([0.5, 0.03, 0.03], P.neonMagenta, [0, 1.2, -1.0]), 1.3);

  // ---------- roof ----------
  box([1.85, 0.06, 1.35], ROOF, [0, 2.03, -0.12]);
  for (const s of [1, -1]) box([0.05, 0.05, 1.35], P.trim, [s * 0.9, 2.02, -0.12]);
  // hatch with hazard top
  box([0.7, 0.04, 0.6], P.hullDark, [0, 2.07, -0.38]);
  plane(0.62, 0.52, hazard, [0, 2.095, -0.38], [0, 1, 0], "#ffffff", [0, 0, 1]);
  cyl(0.03, 0.03, 0.05, 6, P.steel, [0.28, 2.1, -0.62]);

  // ---------- light bar ----------
  box([1.7, 0.07, 0.14], P.hullDark, [0, 2.07, 0.4]);
  const cols = [P.neonCyan, P.neonMagenta];
  for (let i = 0; i < 8; i++) {
    glow(box([0.17, 0.05, 0.12], cols[i % 2], [-0.7 + i * 0.2, 2.075, 0.43]), 1.8);
  }
  for (const s of [1, -1]) box([0.05, 0.06, 0.16], P.steel, [s * 0.88, 2.065, 0.4]);

  // ---------- antenna with flags ----------
  const base = [-0.82, 2.06, -0.78];
  cyl(0.06, 0.07, 0.05, 6, P.hullDark, base);
  const tip = [-0.86, 2.55, -0.9];
  b.rod(base, tip, [0.014, 0.005], P.steel, { bone, sides: 5 });
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), P.red, { bone, at: tip }), 2);
  const flagShape = [[0, 0], [0.16, 0.025], [0.16, -0.06], [0, -0.1]];
  b.extrude(flagShape, { at: [-0.86, 2.48, -0.9], x: [0, 0, -1], bone, thickness: 0.005, color: P.red });
  b.extrude([[0, 0], [0.11, 0.0], [0.0, -0.08]], { at: [-0.855, 2.37, -0.9], x: [0, 0, -1], bone, thickness: 0.005, color: P.trim });

  // ---------- extra armor details ----------
  for (const s of [1, -1]) {
    // B-pillar rivet plates, door armor ribs
    box([0.05, 0.1, 0.5], P.armor, [s * 1.2, 1.28, 0.22]);
    box([0.05, 0.1, 0.5], P.armor, [s * 1.2, 1.28, -0.58]);
    glow(box([0.02, 0.025, 1.7], P.neonCyan, [s * 1.2, 1.17, -0.08]), 1.0);
    // roof corner bolts
    for (const z of [0.5, -0.74]) cyl(0.03, 0.03, 0.03, 6, P.steel, [s * 0.88, 2.07, z]);
    // grab handle at rear
    b.rod([s * 1.0, 1.55, -1.02], [s * 1.0, 1.85, -1.02], 0.02, P.steel, { bone, sides: 6 });
  }
  // vent slats on roof rear
  for (let i = 0; i < 4; i++) box([0.7, 0.025, 0.04], P.hullDark, [0, 2.07, -0.78 - 0 + i * 0.0 - 0.0 + (i - 1.5) * 0.06 - 0.02]);
}
```

<!-- call: gun -->

```ts
import * as THREE from "three";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGun({ b, J, P }: any) {
  const YAW = J.gunYaw;
  const PIT = J.gunPitch;
  const BRASS = "#c8963a";
  const AXZ: [number, number, number] = [0, 0, -1];
  const AXX: [number, number, number] = [1, 0, 0];

  // ---- helpers
  const box = (sx: number, sy: number, sz: number, color: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at, flat: true, ...extra });
  const cyl = (r0: number, r1: number, len: number, color: any, at: number[], dir: number[], bone: any, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r0, len, seg), color, { bone, at, dir, flat: true });
  const decal = (tex: any, w: number, h: number, at: number[], bone: any) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir: [0, 0, -1], axis: "z", texture: tex });

  // ---- textures
  let stripes = "";
  for (let i = -2; i < 14; i++)
    stripes += `<path d="M${i * 10} 12 L${i * 10 + 6} 0 L${i * 10 + 11} 0 L${i * 10 + 5} 12Z" fill="#f0b90f"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 120 12" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="12" fill="#14151a"/>${stripes}</svg>`,
    { size: 256 },
  );
  const SKULL = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4 C14 4 8 18 11 30 C12 36 16 38 18 42 L18 50 L46 50 L46 42 C48 38 52 36 53 30 C56 18 50 4 32 4Z" fill="#e9e6da" stroke="#14151a" stroke-width="3"/>
      <ellipse cx="22" cy="27" rx="7" ry="8" fill="#14151a"/><ellipse cx="42" cy="27" rx="7" ry="8" fill="#14151a"/>
      <path d="M32 33 L27 43 L37 43Z" fill="#14151a"/>
      <path d="M24 50 V60 M32 50 V60 M40 50 V60" stroke="#14151a" stroke-width="3"/>
      <path d="M8 56 L56 40 M56 56 L8 40" stroke="#e0243a" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
    </svg>`,
    { size: 192 },
  );

  // ---- base & swivel (yaw)
  cyl(0.42, 0.42, 0.04, P.hullDark, [0, 1.52, -1.9], [0, 1, 0], YAW, 10);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.025, 0.025, 0.03, P.steel, [Math.sin(a) * 0.36, 1.55, -1.9 + Math.cos(a) * 0.36], [0, 1, 0], YAW, 6);
  }
  cyl(0.3, 0.3, 0.06, P.armor, [0, 1.58, -1.9], [0, 1, 0], YAW, 10);
  b.part(new THREE.TorusGeometry(0.27, 0.018, 4, 12), P.trim, {
    bone: YAW, at: [0, 1.62, -1.9], rotation: [90, 0, 0], flat: true,
  });
  cyl(0.13, 0.08, 0.2, P.steel, [0, 1.7, -1.9], [0, 1, 0], YAW, 8);
  box(0.4, 0.06, 0.16, P.armor, [0, 1.62, -1.9], YAW);
  for (const s of [1, -1]) {
    box(0.05, 0.36, 0.16, P.armor, [s * 0.17, 1.78, -1.9], YAW);
    box(0.052, 0.05, 0.1, P.trim, [s * 0.17, 1.96, -1.9], YAW);
    cyl(0.03, 0.03, 0.1, P.steel, [s * 0.21, 1.75, -1.9], AXX, YAW, 8);
  }

  // ---- cradle & receiver (pitch)
  box(0.28, 0.08, 0.42, P.hullDark, [0, 1.68, -1.9], PIT);
  cyl(0.02, 0.02, 0.4, P.steel, [0, 1.75, -1.9], AXX, PIT, 6);
  box(0.16, 0.18, 0.5, P.hull, [0, 1.78, -1.9], PIT);
  box(0.17, 0.04, 0.3, P.trim, [0, 1.88, -1.85], PIT);
  box(0.12, 0.12, 0.08, P.armor, [0, 1.78, -1.62], PIT);
  // spade grips
  box(0.3, 0.04, 0.04, P.steel, [0, 1.8, -1.57], PIT);
  for (const s of [1, -1]) cyl(0.022, 0.022, 0.14, P.rubber, [s * 0.15, 1.8, -1.57], [0, 1, 0], PIT, 6);
  box(0.03, 0.03, 0.03, P.red, [0.15, 1.88, -1.57], PIT);

  // barrel
  cyl(0.055, 0.055, 0.1, P.hullDark, [0, 1.78, -2.2], AXZ, PIT, 8);
  cyl(0.045, 0.045, 0.6, P.steel, [0, 1.78, -2.5], AXZ, PIT, 8);
  for (let i = 0; i < 5; i++)
    cyl(0.05, 0.05, 0.022, P.hullDark, [0, 1.78, -2.3 - i * 0.1], AXZ, PIT, 8);
  cyl(0.026, 0.026, 0.55, P.hullDark, [0, 1.78, -2.72], AXZ, PIT, 6);
  cyl(0.06, 0.06, 0.12, P.hull, [0, 1.78, -2.82], AXZ, PIT, 8);
  for (const s of [1, -1]) box(0.015, 0.035, 0.07, P.rubber, [s * 0.06, 1.78, -2.82], PIT);
  box(0.035, 0.015, 0.07, P.rubber, [0, 1.84, -2.82], PIT);
  cyl(0.068, 0.068, 0.025, P.trim, [0, 1.78, -2.885], AXZ, PIT, 8);

  // ---- shield
  box(0.92, 0.35, 0.04, P.armor, [0, 2.025, -2.25], PIT);
  for (const s of [1, -1]) {
    box(0.34, 0.25, 0.04, P.armor, [s * 0.29, 1.725, -2.25], PIT);
    box(0.03, 0.2, 0.2, P.steel, [s * 0.15, 1.7, -2.15], PIT);
  }
  box(0.94, 0.03, 0.06, P.hullDark, [0, 2.2, -2.25], PIT);
  decal(HAZARD, 0.86, 0.09, [0, 1.9, -2.275], PIT);
  decal(SKULL, 0.2, 0.2, [0, 2.07, -2.275], PIT);
  for (const s of [1, -1]) for (const y of [1.65, 2.14])
    cyl(0.014, 0.014, 0.02, P.steel, [s * 0.4, y, -2.27], AXZ, PIT, 6);

  // ---- ammo box & belt
  box(0.14, 0.17, 0.24, P.hullDark, [0.21, 1.72, -1.92], PIT);
  box(0.145, 0.03, 0.245, P.trim, [0.21, 1.81, -1.92], PIT);
  box(0.03, 0.06, 0.06, P.steel, [0.285, 1.73, -1.92], PIT);
  box(0.015, 0.05, 0.1, P.red, [0.285, 1.76, -2.03], PIT);
  const belt = [
    [0.2, 1.83, -1.92],
    [0.2, 1.93, -1.92],
    [0.12, 1.93, -1.9],
    [0.085, 1.82, -1.9],
  ];
  const bz = new THREE.CubicBezierCurve3(...belt.map((p) => new THREE.Vector3(...p)));
  for (let i = 0; i < 8; i++) {
    const p = bz.getPoint(i / 7);
    cyl(0.014, 0.014, 0.06, BRASS, [p.x, p.y, p.z], AXZ, PIT, 6);
    box(0.02, 0.02, 0.025, P.steel, [p.x, p.y, p.z + 0.04], PIT);
  }

  // ---- sights
  box(0.08, 0.05, 0.1, P.hullDark, [0, 1.9, -1.78], PIT);
  box(0.075, 0.06, 0.012, P.glass, [0, 1.96, -1.82], PIT, { });
  box(0.012, 0.07, 0.1, P.hullDark, [0.04, 1.96, -1.78], PIT);
  box(0.012, 0.07, 0.1, P.hullDark, [-0.04, 1.96, -1.78], PIT);
  glow(b.part(new THREE.SphereGeometry(0.009, 6, 4), P.red, { bone: PIT, at: [0, 1.96, -1.828] }), 2.5);
  box(0.02, 0.07, 0.02, P.steel, [0, 1.85, -2.62], PIT);

  // ---- cyan power cell
  box(0.1, 0.1, 0.3, P.hullDark, [-0.21, 1.72, -1.9], PIT);
  glow(cyl(0.032, 0.032, 0.24, P.neonCyan, [-0.21, 1.78, -1.9], AXZ, PIT, 8), 1.6);
  for (const z of [-1.8, -2.0]) box(0.09, 0.025, 0.03, P.trim, [-0.21, 1.78, z], PIT);
  glow(box(0.014, 0.014, 0.1, P.neonMagenta, [-0.265, 1.71, -1.9], PIT), 1.4);
  b.rod([-0.17, 1.76, -1.8], [-0.07, 1.78, -1.74], 0.008, P.rubber, { bone: PIT });
}
```
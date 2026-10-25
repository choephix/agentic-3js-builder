<!-- call: plan -->

```json
{
  "name": "Arasaka-style Riot Interceptor RC-9",
  "description": "A hulking corporate riot-control interceptor truck with a roof water cannon, armored wedge plow and glowing neon light bars in a Cyberpunk 2077 look.",
  "builderName": "riotInterceptor",
  "size": [2.6, 2.9, 6.4],
  "layout": "Low, wide armored wedge-nosed truck. Front (+Z): angled push-bar plow with neon strip and hazard stripes, headlight slits, then the sloped hood, a high armored cab with narrow tinted windshield and a roof neon light bar, then a long tank/cargo bed at the rear with a roof-mounted water cannon turret on a ring. Six chunky wheels in fenders on the floor (front axle, two rear axles). Style: matte graphite hull with yellow hazard trim, corporate decals, glowing cyan and magenta neon bars, grime paint, emissive details via the glow kit.",
  "palette": {
    "hull": "#2a2f3a",
    "hullDark": "#14171e",
    "armor": "#3d4452",
    "hazard": "#f2c200",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "glass": "#0b1a2a",
    "tire": "#101012",
    "rim": "#8a919e",
    "tank": "#4a5566",
    "water": "#6fd6ff",
    "warnRed": "#ff2a3c",
    "white": "#e8ecf2"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 1.2],
    "bedDeck": [0, 1.3, -1.5],
    "turretRing": [0, 2.0, -1.4],
    "frontAxle": [0, 0.55, 2.0],
    "rearAxle1": [0, 0.55, -1.3],
    "rearAxle2": [0, 0.55, -2.6],
    "plowMount": [0, 0.7, 3.1]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.0, -1.4], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "cannonPitch", "parent": "turretYaw", "at": [0, 2.45, -1.4], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.15, 0.55, 2.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.15, 0.55, 2.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.15, 0.55, -1.3], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.15, 0.55, -1.3], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBL", "parent": "body", "at": [1.15, 0.55, -2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBR", "parent": "body", "at": [-1.15, 0.55, -2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull and frame: slab underbody, side skirts with hazard-stripe paint and panelled armor plates, fender arches over all six wheels, rear bumper with warnRed tail light slits, exhaust stacks, underglow neon strips in neonMagenta along the skirts, grime paint darker near the floor, corporate logo decals on the flanks (SVG).",
      "box": [[-1.3, 0.3, -3.2], [1.3, 1.3, 2.6]],
      "attaches": "Top at chassisTop carries cab and bed; wheel wells centred on the axle mounts; front meets plow at plowMount.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "cab",
      "builds": "Armored cab and nose: sloped hood, high cab block with narrow tinted glass windshield and side slit windows (SVG textured with reflection streaks), roof neon light bar in neonCyan and neonMagenta with warning strobes, headlight slits glowing white, side mirrors, door seams, antenna array, cage grille, decals and plate numbers.",
      "box": [[-1.25, 1.3, 0.3], [1.25, 2.5, 2.9]],
      "attaches": "Sits on cabFloor; hood front meets plow at plowMount; rear wall meets the bed at bedDeck front.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "plowAndWheels",
      "builds": "Front wedge push-bar plow with hazard stripes and neonCyan edge strip, tow hooks, bull bars, plus all six wheels: chunky low-poly tires, rim discs with bolt rings, brake discs, each on its wheel joint (rotate about the x axle), tires black with mud paint near the bottom.",
      "box": [[-1.3, 0.0, -3.2], [1.3, 1.1, 3.2]],
      "attaches": "Plow bolts to plowMount; wheels centred on frontAxle, rearAxle1 and rearAxle2 mounts at x=±1.15 and ride the wheel joints; tire radius 0.55 so bottoms touch y=0.",
      "joints": ["body", "wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelBL", "wheelBR"],
      "floor": true,
      "budget": 190
    },
    {
      "id": "bed",
      "builds": "Rear cargo and tank section: boxy armored bed with a cylindrical water tank lying along z (tank color, banded with bolted straps, hazard stripes, level gauge glowing water), side equipment lockers with riveted panels, rear hatch with ladder, roof rails, pipes and hoses running toward the turret, neonMagenta strip lights along the top edge, decals reading WATER and a corporate emblem.",
      "box": [[-1.25, 1.3, -3.2], [1.25, 2.2, 0.3]],
      "attaches": "Sits on bedDeck; front wall touches cab; its roof has the turretRing mount where the turret base ring sits.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "turret",
      "builds": "Roof water cannon: rotating base ring and armored pedestal on turretYaw, gunner shield with narrow viewport, thick barrel on cannonPitch with a flared nozzle, cooling collars, water feed hoses, hazard stripes, glowing neonCyan nozzle ring and water-colored glowing tip, small sensor pod and a warnRed beacon. Barrel points toward +Z.",
      "box": [[-0.7, 2.0, -2.4], [0.7, 2.9, 0.1]],
      "attaches": "Base ring sits at turretRing on the bed roof; yaw joint at turretRing, pitch joint 0.45 m above it.",
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
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const grime = (base: string) =>
    paint((p, n) => {
      const g = smoothstep(0.9, 0.3, p.y) * (0.5 + 0.5 * noise(p, 0.25, 4));
      return mix(base, "#0a0b0e", g * 0.7);
    });
  const HULL = grime(P.hull);
  const ARM = panelled(grime(P.armor), { size: 0.4, rivets: 0.08 });

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  // underbody slab and main hull
  box(2.3, 0.3, 5.6, P.hullDark, [0, 0.45, -0.3]);
  box(2.5, 0.6, 5.6, HULL, [0, 0.95, -0.3]);
  // top deck plate
  box(2.4, 0.08, 5.4, ARM, [0, 1.28, -0.3]);

  // sloped nose wedge
  b.extrude([[0, 0], [0.7, 0], [0.7, 0.35], [0, 0.75]], {
    at: [0, 0.55, 2.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: ARM, bone,
  });
  // nose bolting: extrude thickness is along x
  // side skirts with hazard stripes
  const haz = paint((p) => (Math.floor((p.z + p.y) / 0.18) % 2 ? P.hazard : P.hullDark));
  for (const s of [1, -1]) {
    box(0.12, 0.28, 5.2, haz, [s * 1.3, 0.5, -0.3]);
    box(0.1, 0.5, 5.4, ARM, [s * 1.27, 0.95, -0.3]);
    // underglow neon strips
    glow(box(0.06, 0.05, 4.6, P.neonMagenta, [s * 1.2, 0.3, -0.3]), 1.6);
    // armor plates
    for (let i = 0; i < 4; i++) {
      const z = 1.5 - i * 1.3;
      if (Math.abs(z - 2) < 0.7 || Math.abs(z + 1.3) < 0.7 || Math.abs(z + 2.6) < 0.7) continue;
      box(0.06, 0.4, 0.5, P.armor, [s * 1.33, 1.0, z]);
    }
  }

  // fender arches over six wheels
  const axles = [M.frontAxle[2], M.rearAxle1[2], M.rearAxle2[2]];
  for (const s of [1, -1])
    for (const z of axles) {
      const arch = new THREE.TorusGeometry(0.68, 0.07, 5, 10, Math.PI);
      b.part(arch, P.hullDark, { bone, at: [s * 1.2, 0.55, z], rotation: [0, 90, 0] });
      box(0.3, 0.1, 1.5, P.armor, [s * 1.28, 1.25, z]);
      box(0.08, 0.12, 0.12, P.hazard, [s * 1.38, 1.15, z + 0.75]);
      box(0.08, 0.12, 0.12, P.hazard, [s * 1.38, 1.15, z - 0.75]);
    }

  // rear bumper and tail lights
  box(2.6, 0.35, 0.3, ARM, [0, 0.7, -3.1]);
  box(2.6, 0.1, 0.32, haz, [0, 0.5, -3.1]);
  for (const s of [1, -1]) {
    glow(box(0.7, 0.07, 0.05, P.warnRed, [s * 0.75, 0.82, -3.27]), 2);
    glow(box(0.7, 0.07, 0.05, P.warnRed, [s * 0.75, 0.68, -3.27]), 2);
  }
  glow(box(2.4, 0.04, 0.04, P.neonMagenta, [0, 0.45, -3.27]), 1.5);

  // exhaust stacks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 8), metal("iron"), { bone, at: [s * 1.1, 1.2, -2.0] });
    b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.08, 8), P.hullDark, { bone, at: [s * 1.1, 1.67, -2.0] });
  }

  // front lower grille and hazard bumper
  box(2.4, 0.2, 0.15, haz, [0, 0.55, 2.75]);
  glow(box(2.0, 0.05, 0.05, P.neonCyan, [0, 0.8, 2.6]), 1.6);

  // corporate logo decals
  const logo = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="none"/>
    <path d="M10 54 L40 8 L52 8 L22 54Z M60 54 L90 8 L102 8 L72 54Z" fill="#e8ecf2"/>
    <rect x="8" y="56" width="112" height="4" fill="#ff2a3c"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.1, 0.55), "#ffffff", {
      bone, at: [s * 1.331, 1.0, 0.9], dir: [s, 0, 0], axis: "z", texture: logo,
    });
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const [cx, cy, cz] = M.turretRing;
  const WARN = P.warnRed;

  const armor = paint((p, n) => {
    const base = mix(P.armor, P.hullDark, 0.35 * (1 - smoothstep(-0.5, 0.8, n.y)));
    return mix(base, "#0a0c10", 0.4 * smoothstep(0.55, 0.8, noise(p, 0.12, 4)));
  });
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.hazard}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const viewport = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#06121c"/><path d="M6 14 L20 2 L26 2 L12 14Z" fill="#2ff3ff" opacity="0.5"/><path d="M30 14 L40 2 L43 2 L33 14Z" fill="#2ff3ff" opacity="0.3"/></svg>`,
    { size: 128 },
  );

  const cyl = (r0: number, r1: number, h: number, s = 12) => new THREE.CylinderGeometry(r0, r1, h, s);

  // base ring + pedestal on yaw
  b.part(cyl(0.62, 0.66, 0.1, 20), P.hullDark, { bone: yaw, at: [cx, cy + 0.05, cz] });
  b.part(new THREE.TorusGeometry(0.62, 0.035, 6, 24), P.hazard, { bone: yaw, at: [cx, cy + 0.11, cz], rotation: [90, 0, 0] });
  glow(b.part(new THREE.TorusGeometry(0.66, 0.012, 4, 28), P.neonCyan, { bone: yaw, at: [cx, cy + 0.03, cz], rotation: [90, 0, 0] }), 1.5);
  b.part(cyl(0.4, 0.5, 0.3, 8), armor, { bone: yaw, at: [cx, cy + 0.25, cz] });
  b.part(new THREE.BoxGeometry(0.9, 0.2, 0.8), armor, { bone: yaw, at: [cx, cy + 0.45, cz] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.4, 0.5), armor, { bone: yaw, at: [cx + s * 0.4, cy + 0.65, cz] });
    b.part(cyl(0.09, 0.09, 0.14, 8), P.rim, { bone: yaw, at: [cx + s * 0.48, cy + 0.45, cz], rotation: [0, 0, 90] });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.1, 0.05, 0.08), i % 2 ? "#111" : P.hazard, { bone: yaw, at: [cx + s * 0.4, cy + 0.82, cz - 0.18 + i * 0.12] });
  }
  // gunner shield (behind barrel, toward -z side of pedestal... front shield)
  b.part(new THREE.BoxGeometry(0.9, 0.5, 0.06), armor, { bone: yaw, at: [cx, cy + 0.7, cz - 0.3], rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", { bone: yaw, at: [cx, cy + 0.78, cz - 0.335], dir: [0, 0.2, -1], axis: "z", texture: viewport });
  b.part(new THREE.PlaneGeometry(0.9, 0.1), "#ffffff", { bone: yaw, at: [cx, cy + 0.5, cz - 0.335], dir: [0, 0.2, -1], axis: "z", texture: hazardTex });
  b.part(new THREE.BoxGeometry(0.9, 0.06, 0.12), P.hullDark, { bone: yaw, at: [cx, cy + 0.96, cz - 0.34] });

  // sensor pod and beacon
  b.part(new THREE.BoxGeometry(0.16, 0.12, 0.16), P.hullDark, { bone: yaw, at: [cx + 0.45, cy + 0.9, cz - 0.15] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: yaw, at: [cx + 0.45, cy + 0.9, cz - 0.07] }), 1.5);
  b.part(cyl(0.05, 0.07, 0.06, 8), P.hullDark, { bone: yaw, at: [cx - 0.45, cy + 0.93, cz - 0.15] });
  glow(b.part(new THREE.SphereGeometry(0.07, 8, 6), WARN, { bone: yaw, at: [cx - 0.45, cy + 1.0, cz - 0.15] }), 2);

  // barrel on pitch
  const py = pitch.at;
  const z0 = py.z;
  b.part(new THREE.SphereGeometry(0.2, 10, 8), P.hullDark, { bone: pitch, at: [cx, py.y, z0] });
  b.part(cyl(0.16, 0.16, 0.9, 12), armor, { bone: pitch, at: [cx, py.y, z0 + 0.45], dir: [0, 0, 1] });
  b.part(cyl(0.19, 0.19, 0.12, 12), P.hazard, { bone: pitch, at: [cx, py.y, z0 + 0.2], dir: [0, 0, 1] });
  for (const z of [0.5, 0.75]) b.part(cyl(0.2, 0.2, 0.06, 12), P.rim, { bone: pitch, at: [cx, py.y, z0 + z], dir: [0, 0, 1] });
  b.part(cyl(0.2, 0.2, 0.2, 12), P.tank, { bone: pitch, at: [cx, py.y, z0 + 0.98], dir: [0, 0, 1] });
  b.part(cyl(0.3, 0.2, 0.3, 12), armor, { bone: pitch, at: [cx, py.y, z0 + 1.2], dir: [0, 0, 1] });
  glow(b.part(new THREE.TorusGeometry(0.3, 0.03, 6, 20), P.neonCyan, { bone: pitch, at: [cx, py.y, z0 + 1.35] }), 2);
  glow(b.part(cyl(0.2, 0.2, 0.03, 14), P.water, { bone: pitch, at: [cx, py.y, z0 + 1.34], dir: [0, 0, 1] }), 2);
  // top rail & side trunnion
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.7), P.hullDark, { bone: pitch, at: [cx, py.y + 0.2, z0 + 0.6] });
  // hoses
  for (const s of [1, -1]) {
    const hose = b.sweep(
      [[cx + s * 0.3, cy + 0.5, cz + 0.05], [cx + s * 0.34, cy + 0.7, cz + 0.2], [cx + s * 0.22, py.y - 0.05, z0 + 0.25], [cx + s * 0.12, py.y, z0 + 0.5]],
      0.03,
      { bone: pitch, color: P.hullDark, sides: 6 },
    );
    void hose;
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });

  const grime = (base: string) =>
    paint((p, n) => {
      const g = smoothstep(2.0, 1.3, p.y) * 0.5 + noise(p, 0.12, 4) * 0.25;
      return mix(base, "#0a0b0e", Math.min(0.7, g * (n.y > 0.7 ? 0.5 : 1)));
    });
  const HULL = grime(P.hull);
  const ARMOR = grime(P.armor);

  // Cab block
  box(2.4, 1.0, 1.75, HULL, [0, 1.85, 1.25]);
  box(2.3, 0.1, 1.7, ARMOR, [0, 2.4, 1.25]);
  // Hood: sloped wedge via extrude (side profile along z)
  b.extrude(
    [[0, 0], [1.35, 0], [1.35, 0.14], [1.0, 0.4], [0, 0.55]],
    { at: [0, 1.3, 2.9 - 1.35 + 0.0], x: [0, 0, 1], thickness: 2.4, color: HULL, bone },
  );
  // Move: outline drawn along +z starting at z=1.55 -> ends 2.9
  // armor side plates on cab
  for (const s of [1, -1]) {
    box(0.06, 0.7, 1.5, ARMOR, [s * 1.23, 1.8, 1.25]);
    box(0.02, 0.9, 0.02, P.hullDark, [s * 1.27, 1.85, 1.0]); // door seam
    box(0.02, 0.9, 0.02, P.hullDark, [s * 1.27, 1.85, 1.6]);
    box(0.03, 0.04, 0.5, P.hazard, [s * 1.27, 1.45, 1.3]);
  }

  // Windshield
  const wsTex = svg(
    `<svg viewBox="0 0 100 24"><rect width="100" height="24" fill="#0b1a2a"/>
    <path d="M10 24 L30 0 L38 0 L18 24Z M45 24 L65 0 L70 0 L50 24Z" fill="#2c5f86" opacity="0.6"/>
    <rect x="0" y="0" width="100" height="24" fill="none" stroke="#14171e" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(2.0, 0.45), "#ffffff", {
    bone, at: [0, 2.05, 2.135], dir: [0, 0.35, 1], axis: "z", texture: wsTex,
  });
  box(2.1, 0.06, 0.1, P.hullDark, [0, 2.3, 2.13], { rotation: [-20, 0, 0] });
  box(2.1, 0.06, 0.1, P.hullDark, [0, 1.8, 2.14], { rotation: [-20, 0, 0] });

  // Side slit windows
  const slit = svg(
    `<svg viewBox="0 0 60 16"><rect width="60" height="16" fill="#0b1a2a"/><path d="M5 16 L20 0 L26 0 L11 16Z" fill="#2c5f86" opacity="0.6"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(1.0, 0.26), "#ffffff", {
      bone, at: [s * 1.262, 2.05, 1.4], dir: [s, 0, 0], axis: "z", texture: slit,
    });

  // Headlights
  for (const s of [1, -1]) {
    glow(box(0.6, 0.07, 0.05, P.white, [s * 0.7, 1.62, 2.93]), 1.6);
    glow(box(0.03, 0.2, 0.05, P.neonCyan, [s * 1.2, 1.55, 2.9]), 1.4);
  }
  // Cage grille
  box(1.3, 0.3, 0.05, P.hullDark, [0, 1.58, 2.92]);
  for (let i = -3; i <= 3; i++) box(0.03, 0.34, 0.04, P.rim, [i * 0.17, 1.58, 2.95]);
  for (let j = 0; j < 3; j++) box(1.3, 0.025, 0.04, P.rim, [0, 1.5 + j * 0.09, 2.96]);

  // Plate
  const plate = svg(
    `<svg viewBox="0 0 60 20"><rect width="60" height="20" fill="#e8ecf2"/><text x="30" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#14171e">RC-9 NCPD</text></svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.13), "#ffffff", { bone, at: [0, 1.4, 2.945], dir: [0, 0, 1], axis: "z", texture: plate });

  // Decals on door
  const logo = svg(
    `<svg viewBox="0 0 40 40"><path d="M20 3 L37 36 L28 36 L20 20 L12 36 L3 36Z" fill="#ff2a3c"/><rect x="8" y="36" width="24" height="3" fill="#e8ecf2"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone, at: [s * 1.262, 1.65, 1.0], dir: [s, 0, 0], axis: "z", texture: logo });

  // Roof light bar
  box(1.8, 0.08, 0.3, P.hullDark, [0, 2.49, 1.7]);
  glow(box(0.85, 0.07, 0.24, P.neonCyan, [0.45, 2.55, 1.7]), 1.8);
  glow(box(0.85, 0.07, 0.24, P.neonMagenta, [-0.45, 2.55, 1.7]), 1.8);
  for (const s of [1, -1]) glow(box(0.1, 0.1, 0.12, P.warnRed, [s * 0.95, 2.56, 1.7]), 2);
  // Roof vents + antennas
  box(0.6, 0.06, 0.4, P.armor, [0, 2.46, 1.0]);
  for (let i = 0; i < 3; i++) {
    const x = -0.9 + i * 0.12;
    b.rod([x, 2.45, 0.6], [x, 2.5 + 0.35 + i * 0.12, 0.6], 0.012, P.rim, { bone });
  }
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.warnRed, { bone, at: [-0.9, 2.9 - 0.02 > 2.5 ? 2.5 + 0.35 : 2.85, 0.6] }), 2);

  // Mirrors
  for (const s of [1, -1]) {
    b.rod([s * 1.25, 1.95, 2.0], [s * 1.5, 2.0, 2.05], 0.02, P.hullDark, { bone });
    box(0.06, 0.22, 0.14, P.hull, [s * 1.52, 2.0, 2.05]);
    glow(box(0.01, 0.2, 0.12, P.neonCyan, [s * 1.55, 2.0, 2.05]), 1);
  }
  // Rear wall armor
  box(2.3, 0.9, 0.08, ARMOR, [0, 1.85, 0.34]);
  box(2.3, 0.04, 0.04, P.hazard, [0, 1.45, 0.38]);
}
```

<!-- call: plowAndWheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, stripes, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildPlowAndWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const TIRE = paint((p, n) => {
    const mud = smoothstep(0.35, 0.0, p.y) * (0.4 + 0.6 * noise(p, 0.12, 4));
    return mix(P.tire, "#4a3b2a", mud * 0.7);
  });
  const HAZ = stripes(P.hazard, P.hullDark, { size: 0.16, axis: [1, 0, 1], width: 0.5, wobble: 0.05, seed: 3 });
  const PLOW = paint((p, n, s) => {
    const m = noise(p, 0.2, 7);
    return mix(P.armor, "#1c2028", smoothstep(0.5, 0.9, m) * 0.6);
  });
  const RIM = paint((p, n) => mix(P.rim, "#4a505c", noise(p, 0.05, 2) * 0.6));
  const boltTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#7a818e"/><circle cx="32" cy="32" r="22" fill="none" stroke="#3a3f4a" stroke-width="3"/><circle cx="32" cy="32" r="7" fill="#2a2f3a"/>${[0, 1, 2, 3, 4, 5]
      .map((i) => {
        const a = (i * Math.PI) / 3;
        return `<circle cx="${32 + 15 * Math.cos(a)}" cy="${32 + 15 * Math.sin(a)}" r="3" fill="#d0d5de"/>`;
      })
      .join("")}</svg>`,
    { size: 128 },
  );

  // wheels
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.frontAxle[2]],
    ["wheelFR", -1, M.frontAxle[2]],
    ["wheelML", 1, M.rearAxle1[2]],
    ["wheelMR", -1, M.rearAxle1[2]],
    ["wheelBL", 1, M.rearAxle2[2]],
    ["wheelBR", -1, M.rearAxle2[2]],
  ];
  for (const [name, s, z] of wheels) {
    const j = J[name];
    const c: [number, number, number] = [s * 1.15, R, z];
    const ax: [number, number, number] = [s, 0, 0];
    b.part(new THREE.CylinderGeometry(R, R, 0.5, 12), TIRE, { bone: j, at: c, dir: ax, flat: true });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.26;
      b.part(new THREE.BoxGeometry(0.4, 0.07, 0.14), P.tire, {
        bone: j,
        at: [c[0], R + Math.sin(a) * (R + 0.02), z + Math.cos(a) * (R + 0.02)],
        rotation: [(-a * 180) / Math.PI + 90 - 90, 0, 0],
      });
    }
    const o = s * 0.26;
    b.part(new THREE.CircleGeometry(0.34, 12), "#ffffff", {
      bone: j, at: [c[0] + o, R, z], dir: ax, axis: "z", texture: boltTex,
    });
    b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.06, 12), RIM, { bone: j, at: [c[0] + s * 0.23, R, z], dir: ax });
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 8), P.hullDark, { bone: j, at: [c[0] + s * 0.29, R, z], dir: ax });
    // brake disc inner
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 12), "#5a606c", { bone: j, at: [c[0] - s * 0.2, R, z], dir: ax });
    b.part(new THREE.BoxGeometry(0.08, 0.14, 0.1), P.warnRed, { bone: j, at: [c[0] - s * 0.2, R + 0.26, z] });
  }

  // plow
  const pm = M.plowMount;
  const wedge = [
    [-1.25, 0], [1.25, 0], [1.1, 0.62], [-1.1, 0.62],
  ];
  b.frustumBox([0, 0.12, 2.95], [0, 0.12, 3.2], [2.5, 0.2], [2.5, 0.2], { bone: J.body, color: P.hullDark });
  // sloped plow plate
  const plate = b.slab(
    [[-1.2, 0.2, 3.2], [1.2, 0.2, 3.2], [1.1, 0.85, 2.85], [-1.1, 0.85, 2.85]],
    { thickness: 0.1, bone: J.body, color: PLOW },
  );
  // hazard stripe band
  b.slab(
    [[-1.15, 0.5, 3.07], [1.15, 0.5, 3.07], [1.12, 0.68, 2.97], [-1.12, 0.68, 2.97]],
    { thickness: 0.115, bone: J.body, color: HAZ },
  );
  // side wings
  for (const s of [1, -1]) {
    b.slab([[s * 1.2, 0.2, 3.2], [s * 1.3, 0.25, 2.7], [s * 1.3, 0.75, 2.7], [s * 1.1, 0.85, 2.85]], {
      thickness: 0.1, bone: J.body, color: P.armor,
    });
    b.rod([s * 1.2, 0.25, 3.18], [s * 1.2, 0.8, 2.88], 0.04, { bone: J.body, color: P.hullDark });
  }
  // neon edge strip
  glow(b.rod([-1.18, 0.22, 3.24], [1.18, 0.22, 3.24], 0.035, { bone: J.body, color: P.neonCyan, caps: { start: "round", end: "round" } }), 2);
  // bull bars
  const bars = [-0.8, -0.4, 0, 0.4, 0.8];
  for (const x of bars) b.rod([x, 0.9, 2.9], [x, 1.1, 2.92], 0.04, { bone: J.body, color: P.hullDark });
  b.rod([-0.9, 1.05, 2.93], [0.9, 1.05, 2.93], 0.05, { bone: J.body, color: P.armor });
  b.rod([-0.9, 0.92, 2.9], [0.9, 0.92, 2.9], 0.04, { bone: J.body, color: P.armor });
  // tow hooks
  for (const s of [1, -1]) {
    b.sweep([[s * 0.6, 0.35, 3.1], [s * 0.6, 0.2, 3.35], [s * 0.6, 0.1, 3.2]], 0.03, { bone: J.body, color: P.hazard });
    b.part(new THREE.BoxGeometry(0.14, 0.14, 0.1), P.hazard, { bone: J.body, at: [s * 0.6, 0.38, 3.05] });
    // bolts
    for (const y of [0.35, 0.7]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.rim, { bone: J.body, at: [s * 0.95, y, 3.04 - (y - 0.2) * 0.5], rotation: [90, 0, 0] });
  }
  // warning chevrons on plate face
  const chev = svg(`<svg viewBox="0 0 100 30"><path d="M5 25 L25 5 L35 5 L15 25Z M45 25 L65 5 L75 5 L55 25Z" fill="#f2c200"/><text x="80" y="22" font-size="14" fill="#2ff3ff" font-family="monospace">RC9</text></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone: J.body, at: [0, 0.35, 3.13], dir: [0, 0.6, 0.8], axis: "z", texture: chev });

  // mud flaps
  const r = rng(5);
  for (const [name, s, z] of wheels) {
    if (name.startsWith("wheelF")) continue;
    b.part(new THREE.BoxGeometry(0.04, 0.4, 0.5), P.hullDark, { bone: J.body, at: [s * 1.3, 0.35 + r() * 0.02, z - 0.55] });
  }
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildBed({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  const grime = (base: string) =>
    paint((p, n) => {
      const low = smoothstep(1.9, 1.3, p.y);
      const m = noise(p, 0.18, 4);
      let c = mix(base, "#0a0b0e", 0.35 * low + 0.25 * smoothstep(0.55, 0.9, m));
      c = mix(c, "#6b5a3a", 0.25 * low * m);
      return mix(c, "#6a7384", 0.12 * smoothstep(0.6, 1, n.y));
    });
  const HULL = panelled(grime(P.hull), { size: 0.4, aspect: 0.8, rivets: 0.06 });
  const TANK = grime(P.tank);
  const STEEL = metal("steel", { tarnish: 0.4 });

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  // Deck and bed shell
  box(2.5, 0.12, 3.5, P.hullDark, [0, 1.36, -1.45]);
  // lower body walls
  for (const s of [1, -1]) {
    box(0.1, 0.9, 3.5, HULL, [s * 1.2, 1.8, -1.45]);
    // side locker
    box(0.32, 0.6, 1.3, HULL, [s * 1.34 > 0 ? 1.1 : -1.1, 1.75, -0.75]);
    box(0.05, 0.5, 1.2, P.armor, [s * 1.27, 1.75, -0.75]);
    box(0.05, 0.5, 1.2, P.armor, [s * 1.27, 1.75, -2.15]);
    box(0.28, 0.6, 1.3, HULL, [s * 1.08, 1.75, -2.15]);
    // roof rails
    b.rod([s * 1.1, 2.2, -3.1], [s * 1.1, 2.2, -0.1], 0.025, STEEL, { bone });
    for (const z of [-3.1, -1.6, -0.1]) b.rod([s * 1.1, 2.1, z], [s * 1.1, 2.2, z], 0.025, STEEL, { bone });
    // magenta top-edge strips
    glow(box(0.05, 0.05, 3.3, P.neonMagenta, [s * 1.24, 2.22, -1.5]), 1.6);
    glow(box(0.04, 0.04, 3.3, P.neonMagenta, [s * 1.24, 1.42, -1.5]), 1.2);
  }
  // front wall touching cab
  box(2.4, 0.9, 0.1, P.armor, [0, 1.8, 0.25]);
  // rear wall and hatch
  box(2.4, 0.9, 0.1, HULL, [0, 1.8, -3.15]);
  box(1.0, 0.7, 0.06, P.armor, [0, 1.8, -3.22]);
  b.part(new THREE.BoxGeometry(0.1, 0.08, 0.05), P.hazard, { bone, at: [0.4, 1.8, -3.27] });
  for (const z of [0]) glow(box(0.9, 0.04, 0.03, P.warnRed, [0, 2.1, -3.24 + z]), 1.5);
  // ladder
  for (const s of [1, -1]) b.rod([s * 0.3, 1.35, -3.3], [s * 0.3, 2.15, -3.3], 0.02, STEEL, { bone });
  for (let i = 0; i < 6; i++) b.rod([-0.3, 1.45 + i * 0.13, -3.3], [0.3, 1.45 + i * 0.13, -3.3], 0.016, STEEL, { bone });

  // Tank lying along z
  const tank = b.lathe(
    [[0, -1.5], [0.4, -1.5], [0.55, -1.38], [0.6, -1.2], [0.6, 1.2], [0.55, 1.38], [0.4, 1.5], [0, 1.5]],
    { at: [0, 1.72, -1.45], axis: [0, 0, 1], segments: 12, color: TANK, bone },
  );
  // straps with bolts
  for (let i = 0; i < 5; i++) {
    const z = -2.55 + i * 0.55;
    b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 12, 1, true), i % 2 ? P.hazard : P.armor, {
      bone, at: [0, 1.72, z], dir: [0, 0, 1],
    });
    for (const a of [-0.9, -0.3, 0.3, 0.9]) {
      b.part(new THREE.SphereGeometry(0.03, 5, 4), STEEL, {
        bone, at: [Math.sin(a) * 0.63, 1.72 + Math.cos(a) * 0.63, z],
      });
    }
  }
  // hazard stripes on tank ends
  for (const z of [-2.95, 0.05]) {
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 12), P.hazard, { bone, at: [0, 1.72, z], dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12), P.hullDark, { bone, at: [0, 1.72, z], dir: [0, 0, 1] });
  }

  // Level gauge glowing
  box(0.1, 0.8, 0.06, P.hullDark, [0.64, 1.75, -0.4]);
  glow(box(0.05, 0.6, 0.04, P.water, [0.64, 1.7, -0.37]), 1.6);

  // Decals
  const waterTex = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#1a1d24" opacity="0.85"/><rect x="2" y="2" width="124" height="36" fill="none" stroke="#f2c200" stroke-width="3"/><text x="64" y="29" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="#6fd6ff">WATER</text></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#14171e" stroke="#ff2a3c" stroke-width="4"/><path d="M32 10 L48 50 L40 50 L32 30 L24 50 L16 50Z" fill="#e8ecf2"/><rect x="14" y="52" width="36" height="4" fill="#ff2a3c"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1]) {
    const dir = [s, 0, 0];
    b.part(new THREE.PlaneGeometry(0.9, 0.28), "#ffffff", {
      bone, at: [s * 1.255, 1.85, -0.75], dir, axis: "z", texture: waterTex,
    });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone, at: [s * 1.255, 1.8, -2.15], dir, axis: "z", texture: emblem,
    });
    // locker handles
    box(0.04, 0.2, 0.04, STEEL, [s * 1.27, 1.75, -0.2]);
  }

  // Roof deck around turret ring
  box(2.3, 0.06, 3.0, P.armor, [0, 2.2, -1.5]);
  b.part(new THREE.CylinderGeometry(0.75, 0.8, 0.1, 12), P.hullDark, { bone, at: [0, 2.28, -1.4] });
  glow(
    b.part(new THREE.TorusGeometry(0.72, 0.02, 4, 16), P.neonMagenta, { bone, at: [0, 2.34, -1.4], dir: [0, 1, 0], axis: "z" }),
    1.5,
  );

  // Pipes and hoses toward turret
  const pipe = (pts: number[][], r: number, col: string) =>
    b.sweep(pts, r, { color: col, bone, sides: 6, caps: "round" });
  pipe([[0.35, 2.25, -0.1], [0.4, 2.3, -0.7], [0.3, 2.34, -1.1]], 0.04, P.hullDark);
  pipe([[-0.35, 2.25, -0.1], [-0.4, 2.3, -0.7], [-0.3, 2.34, -1.1]], 0.04, P.hullDark);
  pipe([[0, 1.15 + 0.3, -3.0], [0, 2.3, -2.9], [0, 2.33, -1.9]], 0.05, STEEL);
  for (let i = 0; i < 4; i++) {
    const z = -0.3 - i * 0.2;
    b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 8), P.hazard, { bone, at: [0.38, 2.3, z], dir: [1, 0, 0], axis: "z" });
  }

  // Roof vents and small lights
  for (let i = 0; i < 3; i++) box(0.3, 0.05, 0.2, P.hullDark, [-0.8 + (R() - 0.5) * 0.1, 2.25, -0.4 - i * 0.6 - 0.9 + 0.9]);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [0.85, 2.27, -2.9] }), 1.6);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [-0.85, 2.27, -2.9] }), 1.6);
}
```
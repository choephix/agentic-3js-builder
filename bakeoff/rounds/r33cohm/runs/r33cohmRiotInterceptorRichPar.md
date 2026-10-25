<!-- call: plan -->

```json
{
  "name": "Arasaka-style Riot Interceptor RC-9 'Pacifier'",
  "description": "A heavy corporate riot-control interceptor: armoured wedge hull, roof-mounted water cannon turret, glowing neon light bars, and chunky wheels, in Cyberpunk 2077 style.",
  "builderName": "riotInterceptor",
  "size": [2.5, 2.3, 5.8],
  "layout": "Low, wide armoured wedge vehicle facing +Z. Front: sloped nose with a push-bar bumper, cyan neon strip and twin slit headlights. Middle: hunched armoured cabin with a dark tinted windscreen, side slit windows and a roof light bar (blue/magenta). Roof rear: a rotating water cannon turret on a ring, with a thick barrel pointing +Z, a hose coil and a tank. Rear: a tank module with caution stripes, hazard-yellow trim, tail neon strip. Four chunky wheels with armoured fenders sit on the floor, and the hull sits about 0.35 m above the ground. Style: matte graphite hull with panel seams, hazard-yellow accents, magenta and cyan emissive neon (glow kit), corporate logo decals and Japanese-style katakana labels drawn in SVG, scuffs and grime painted by place (dirt near wheels, light on top).",
  "palette": {
    "hull": "#2b2f3a",
    "hullDark": "#161820",
    "hullLight": "#4a5262",
    "trim": "#f2c617",
    "glass": "#0b1a24",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonRed": "#ff2a3c",
    "neonBlue": "#3a6bff",
    "rubber": "#0e0e12",
    "rim": "#6b7280",
    "water": "#9fe8ff",
    "steel": "#8a93a3",
    "white": "#e8ecf2"
  },
  "mounts": {
    "deckTop": [0, 1.45, -0.4],
    "roofFront": [0, 1.95, 0.5],
    "turretRing": [0, 1.75, -1.5],
    "cannonPivot": [0, 2.05, -1.5],
    "noseTip": [0, 0.75, 2.9],
    "tailPlate": [0, 1.0, -2.9],
    "axleFront": [0, 0.5, 1.85],
    "axleRear": [0, 0.5, -1.85],
    "wheelFL": [1.12, 0.5, 1.85],
    "wheelFR": [-1.12, 0.5, 1.85],
    "wheelBL": [1.12, 0.5, -1.85],
    "wheelBR": [-1.12, 0.5, -1.85]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 1.75, -1.5], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "cannonPitch", "parent": "turretYaw", "at": [0, 2.05, -1.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.12, 0.5, 1.85], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.12, 0.5, 1.85], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBL", "parent": "body", "at": [1.12, 0.5, -1.85], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelBR", "parent": "body", "at": [-1.12, 0.5, -1.85], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured lower hull and wedge nose: loft or frustum boxes from tail to nose with sloped hood, side skirts, fender arches cut around the wheel mounts (arch rims as thin sweeps), under-tray, panelled paint with seams and rivets, hazard-yellow side stripe, graphite paint with grime near the bottom and light on top. Includes the front push-bar bumper with a yellow-black chevron texture, a tow hook, skid plates, and a corporate emblem decal on the hood. Tail plate with rear bumper and exhaust slits.",
      "box": [[-1.2, 0.35, -2.95], [1.2, 1.5, 2.95]],
      "attaches": "Cabin sits on deckTop; wheels meet the arches at the wheel mounts; the turret ring at turretRing; the tail module at tailPlate.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "cabin",
      "builds": "Armoured cabin on the hull deck: sloped, faceted shell with a dark tinted windscreen (SVG decal with cyan HUD reflections), narrow side slit windows with mesh bars, roof armour plate, A-pillar braces, wing mirrors on arms, door seams with handles, a roof light bar (red/blue/magenta emissive segments with glow, lens caps and brackets), a roof antenna cluster and a front headlight pair of slit lamps plus a neon cyan strip across the nose of the cabin, with katakana and 'POLICE-CORP' text decals on the doors.",
      "box": [[-1.1, 1.4, -1.0], [1.1, 2.15, 1.5]],
      "attaches": "Base rests on the hull at deckTop (y 1.4); the front lamps sit at roofFront; the turret is behind it, at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof water cannon: a lathe ring base at turretRing with rotating armoured housing on the turretYaw joint (ride turretYaw), a pitching cannon assembly on cannonPitch: thick barrel with a flared nozzle, a stack of ribbed bands, a magenta glowing ring near the muzzle, a glowing water-blue core in the nozzle, side pistons, a targeting sensor pod with a red glowing lens, a flexible hose sweep curling from the housing to the tank, and brackets with yellow warning stripes. The barrel points +Z in the rest pose.",
      "box": [[-0.7, 1.7, -2.2], [0.7, 2.4, -0.3]],
      "attaches": "Ring base bolted at turretRing; the hose runs back to the tank module at the rear, and is rooted on the tank's front port at [0, 1.9, -2.0].",
      "joints": ["turretYaw", "cannonPitch"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "tankRear",
      "builds": "Rear water tank module on the rear deck and tail: a horizontal cylinder (lathe) tank with hazard chevron bands, a translucent-looking gauge window glowing cyan with a water level drawn (SVG), filler cap, pipes and valves running to the hose port, side ladders, tail neon magenta strip across the rear plate with red brake-light slits, a license plate decal with fictional corporate text, and a rear spoiler antenna blade. Roof rear rack with spare nozzle canisters.",
      "box": [[-1.0, 1.4, -2.95], [1.0, 2.0, -1.05]],
      "attaches": "Sits on the hull rear deck at y 1.4 behind the cabin; the hose port at [0, 1.9, -2.0] connects to the turret hose; the tail strip meets tailPlate.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wheels",
      "builds": "Four chunky armoured wheels, radius 0.5, width 0.5, one per wheel joint: rubber tyre (lathe or cylinder, 12 sides) with tread blocks, steel rim with bolts and a cyan neon ring on the outer face, brake disc and caliper visible behind the spokes, dirt paint gradient toward the bottom. Axle stubs and suspension arms (rods and a coil from the kit pattern) connecting to the hull at the axle mounts, mud flaps behind the rear wheels with hazard stripes. Each wheel is centred on its wheel mount with its axle along x.",
      "box": [[-1.4, 0.0, -2.4], [1.4, 1.0, 2.4]],
      "attaches": "Wheel centres at wheelFL/FR/BL/BR mounts; the suspension arms reach in to the hull at axleFront and axleRear.",
      "joints": ["wheelFL", "wheelFR", "wheelBL", "wheelBR", "body"],
      "floor": true,
      "budget": 150
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { coil } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.5;
  const W = 0.5;
  const rand = rng(11);

  const DIRT = "#4a3f33";
  const tyrePaint = paint((p, n, s) => {
    const dirt = smoothstep(0.55, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.12, 4));
    const base = mix("#0e0e12", "#1c1c22", noise(p, 0.05, 2));
    return mix(base, DIRT, Math.min(dirt * 0.85, 0.85));
  });
  const rimPaint = paint((p, n) => {
    const t = noise(p, 0.06, 7);
    const c = mix("#5b6270", "#8a93a3", t);
    return mix(c, DIRT, smoothstep(0.3, 0.0, p.y) * 0.5);
  });
  const stripePaint = paint((p) => (Math.floor((p.x + p.y) / 0.06) % 2 ? "#f2c617" : "#161820"));

  const chevron = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#f2c617"/>
    <path d="M-8 32 L8 0 L20 0 L4 32Z M24 32 L40 0 L52 0 L36 32Z M56 32 L72 0 L84 0 L68 32Z" fill="#161820"/></svg>`,
    { size: 128 },
  );
  const kana = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="#2ff3ff" stroke-width="4"/>
    <text x="32" y="42" text-anchor="middle" font-size="26" font-weight="bold" fill="#2ff3ff">警</text></svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.wheelFL[2]],
    ["wheelFR", -1, M.wheelFR[2]],
    ["wheelBL", 1, M.wheelBL[2]],
    ["wheelBR", -1, M.wheelBR[2]],
  ];

  const tyreProfile: [number, number][] = [
    [0.3, -W / 2],
    [R - 0.07, -W / 2],
    [R - 0.02, -W / 2 + 0.05],
    [R, -W / 2 + 0.12],
    [R, W / 2 - 0.12],
    [R - 0.02, W / 2 - 0.05],
    [R - 0.07, W / 2],
    [0.3, W / 2],
  ];

  for (const [name, s, z] of wheels) {
    const joint = J[name];
    const c: [number, number, number] = [s * 1.12, R, z];
    const axle = new THREE.Vector3(s, 0, 0);
    const O = (d: number) => new THREE.Vector3(c[0] + s * d, c[1], c[2]);
    const front = z > 0;

    // tyre
    b.lathe(tyreProfile, { at: c, axis: [s, 0, 0], segments: 12, color: tyrePaint, bone: joint, group: "wheels" });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const dir = new THREE.Vector3(0, Math.cos(a), Math.sin(a));
      const pos = new THREE.Vector3(c[0], c[1], c[2]).addScaledVector(dir, R + 0.015);
      b.part(new THREE.BoxGeometry(W * 0.72, 0.035, 0.17), "#0e0e12", {
        at: pos,
        bone: joint,
        quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir),
        group: "wheels",
      });
    }
    // rim disc & dish
    b.lathe(
      [
        [0, -0.04],
        [0.31, -0.04],
        [0.34, 0.0],
        [0.34, 0.06],
        [0.2, 0.09],
        [0, 0.12],
      ],
      { at: O(W / 2 - 0.12), axis: [s, 0, 0], segments: 12, color: rimPaint, bone: joint, group: "wheels" },
    );
    // neon ring outer face
    glow(
      b.lathe(
        [
          [0.26, 0],
          [0.3, 0],
          [0.3, 0.02],
          [0.26, 0.02],
        ],
        { at: O(W / 2 + 0.005), axis: [s, 0, 0], segments: 16, color: P.neonCyan, bone: joint, group: "wheels" },
      ),
      1.6,
    );
    // kana decal
    b.part(new THREE.CircleGeometry(0.12, 16), "#ffffff", {
      at: O(W / 2 + 0.09),
      dir: [s, 0, 0],
      axis: "z",
      texture: kana,
      bone: joint,
      group: "wheels",
    });
    glow(
      b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.05, 8), P.steel, {
        at: O(W / 2 + 0.06),
        dir: [s, 0, 0],
        bone: joint,
        group: "wheels",
      }),
      0.2,
    );
    // lug bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pos = new THREE.Vector3(c[0] + s * (W / 2 - 0.02), c[1] + Math.cos(a) * 0.19, c[2] + Math.sin(a) * 0.19);
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), P.steel, {
        at: pos,
        dir: [s, 0, 0],
        bone: joint,
        group: "wheels",
      });
    }
    // brake disc behind (inner side) + caliper
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.03, 16), "#7a7f8a", {
      at: O(-W / 2 + 0.08),
      dir: [s, 0, 0],
      bone: joint,
      group: "wheels",
    });
    b.part(new THREE.BoxGeometry(0.1, 0.14, 0.18), P.trim, {
      at: new THREE.Vector3(c[0] - s * (W / 2 - 0.12), c[1] + 0.2, c[2] + (front ? 0.1 : -0.1)),
      bone: J.body,
      group: "wheels",
    });
    // axle stub from wheel to hull
    b.rod(O(-W / 2 + 0.02), [s * 0.9, R, z], 0.07, P.steel, { bone: joint, group: "wheels" });

    // suspension arms to hull axle mount
    const ax = z > 0 ? M.axleFront : M.axleRear;
    const hullPt: [number, number, number] = [s * 0.55, 0.62, ax[2]];
    b.rod([s * 0.95, 0.38, z - 0.18], hullPt, 0.045, P.steel, { bone: J.body, group: "wheels" });
    b.rod([s * 0.95, 0.38, z + 0.18], [s * 0.55, 0.62, ax[2] + (z > 0 ? 0.12 : -0.12)], 0.045, P.steel, {
      bone: J.body,
      group: "wheels",
    });
    b.sweep(coil([s * 0.85, 0.42, z], [s * 0.85, 0.95, z], 0.05, 7), 0.01, {
      color: P.trim,
      bone: J.body,
      group: "wheels",
    });
    b.rod([s * 0.85, 0.4, z], [s * 0.85, 0.95, z], 0.018, P.steel, { bone: J.body, group: "wheels" });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), P.hullLight, { at: [s * 0.95, 0.38, z], bone: J.body, group: "wheels" });

    // mud flaps behind rear wheels
    if (!front) {
      b.part(new THREE.BoxGeometry(0.4, 0.38, 0.03), P.rubber, {
        at: [s * 1.12, 0.3, z - R - 0.08],
        bone: J.body,
        group: "wheels",
      });
      b.part(new THREE.PlaneGeometry(0.34, 0.12), "#ffffff", {
        at: [s * 1.12, 0.26, z - R - 0.097],
        dir: [0, 0, -1],
        axis: "z",
        texture: chevron,
        bone: J.body,
        group: "wheels",
      });
      b.rod([s * 1.12 - 0.15, 0.5, z - R - 0.06], [s * 1.12 + 0.15, 0.5, z - R - 0.06], 0.02, P.steel, {
        bone: J.body,
        group: "wheels",
      });
    }
  }
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const R = rng(5);
  const RX = M.turretRing[0], RY = M.turretRing[1], RZ = M.turretRing[2];
  const PX = M.cannonPivot[0], PY = M.cannonPivot[1], PZ = M.cannonPivot[2];

  const armor = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(-0.2, 1, n.y) * 0.6);
    const grime = smoothstep(0.55, 0.8, noise(p, 0.12, 3)) * 0.35;
    return mix(base, P.hullDark, grime);
  });
  const stripeTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c617"/>` +
      [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#161820"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const logo = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#161820"/><path d="M8 26 L20 6 L32 26 M14 20 H26" stroke="#ff2a3c" stroke-width="3" fill="none"/><text x="36" y="22" font-size="14" font-family="sans-serif" font-weight="bold" fill="#e8ecf2">放水</text></svg>`,
    { size: 128 },
  );

  // Ring base (static on hull side, rides yaw bone for simplicity of rotation)
  b.lathe(
    [[0, 0], [0.62, 0], [0.62, 0.05], [0.55, 0.1], [0.55, 0.16], [0.5, 0.16], [0, 0.16]],
    { at: [RX, RY - 0.05, RZ], bone: yaw, segments: 16, color: P.hullDark },
  );
  glow(
    b.lathe([[0.56, 0], [0.6, 0], [0.6, 0.03], [0.56, 0.03]], {
      at: [RX, RY + 0.02, RZ], bone: yaw, segments: 24, color: P.neonCyan,
    }),
    1.3,
  );
  // Housing
  b.part(new THREE.CylinderGeometry(0.52, 0.58, 0.3, 10), armor, { bone: yaw, at: [RX, RY + 0.2, RZ] });
  b.part(new THREE.BoxGeometry(0.9, 0.34, 0.8), armor, { bone: yaw, at: [RX, RY + 0.4, RZ - 0.05] });
  b.part(new THREE.BoxGeometry(0.7, 0.1, 0.6), P.hullLight, { bone: yaw, at: [RX, RY + 0.62, RZ - 0.1] });
  for (const s of [1, -1]) {
    // side cheeks / cradle brackets
    b.part(new THREE.BoxGeometry(0.1, 0.4, 0.4), armor, { bone: yaw, at: [s * 0.42, PY + 0.02, PZ] });
    b.part(new THREE.BoxGeometry(0.11, 0.1, 0.4), stripeTex ? P.trim : P.trim, { bone: yaw, at: [s * 0.42, PY + 0.24, PZ] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8), P.steel, { bone: yaw, at: [s * 0.47, PY, PZ], dir: [1, 0, 0] });
  }
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
    bone: yaw, at: [RX, RY + 0.4, RZ - 0.46], dir: [0, 0, -1], axis: "z", texture: logo,
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.1), "#ffffff", {
    bone: yaw, at: [RX, RY + 0.18, RZ + 0.5], dir: [0, 0, 1], axis: "z", texture: stripeTex,
  });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.steel, {
      bone: yaw, at: [RX + Math.sin(a) * 0.5, RY + 0.37, RZ + Math.cos(a) * 0.5],
    });
  }

  // Cannon: barrel along +Z
  b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 10), P.hullDark, { bone: pitch, at: [PX, PY, PZ + 0.05], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.14, 0.15, 1.0, 10), armor, { bone: pitch, at: [PX, PY, PZ + 0.7], dir: [0, 0, 1] });
  // ribbed bands
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 10), i % 2 ? P.steel : P.trim, {
      bone: pitch, at: [PX, PY, PZ + 0.35 + i * 0.16], dir: [0, 0, 1],
    });
  }
  // nozzle flare
  b.lathe([[0.1, 0], [0.15, 0], [0.22, 0.3], [0.2, 0.3], [0.13, 0.04], [0.1, 0.04]], {
    at: [PX, PY, PZ + 1.2], axis: [0, 0, 1], bone: pitch, segments: 12, color: P.steel,
  });
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 10), P.water, { bone: pitch, at: [PX, PY, PZ + 1.38], dir: [0, 0, 1] }), 1.6);
  glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 14), P.neonMagenta, { bone: pitch, at: [PX, PY, PZ + 1.05], dir: [0, 0, 1] }), 1.6);
  glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 14), P.neonMagenta, { bone: pitch, at: [PX, PY, PZ + 1.12], dir: [0, 0, 1] }), 1.6);

  // pistons
  for (const s of [1, -1]) {
    b.rod([PX + s * 0.3, PY - 0.2, PZ - 0.1], [PX + s * 0.2, PY - 0.02, PZ + 0.5], 0.035, P.steel, { bone: pitch });
    b.rod([PX + s * 0.3, PY - 0.2, PZ - 0.1], [PX + s * 0.3, PY - 0.2, PZ + 0.2], 0.05, P.hullDark, { bone: yaw });
  }

  // sensor pod
  b.part(new THREE.BoxGeometry(0.2, 0.16, 0.26), P.hullDark, { bone: pitch, at: [PX + 0.22, PY + 0.22, PZ + 0.4] });
  glow(b.part(new THREE.SphereGeometry(0.06, 8, 6), P.neonRed, { bone: pitch, at: [PX + 0.22, PY + 0.22, PZ + 0.55] }), 2);
  b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 5), P.steel, { bone: pitch, at: [PX + 0.3, PY + 0.4, PZ + 0.35] });

  // hose
  const hose = catmull([
    [RX + 0.25, RY + 0.4, RZ - 0.35],
    [0.35, 2.1, -1.8],
    [0.25, 2.0, -2.1],
    [0.05, 1.9, -2.0],
  ].map((p) => p as [number, number, number]));
  b.sweep(hose, 0.045, { bone: yaw, color: P.rubber, sides: 6 });
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.16;
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 6), i % 2 ? P.trim : P.steel, { bone: yaw, at: hose.at(t) });
  }
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), P.steel, { bone: yaw, at: [0, 1.9, -2.0], dir: [0, 0, 1] });
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildHull({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // Paint: graphite with light on top, grime near the bottom and near wheels
  const base = paint((p, n) => {
    const c = mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.55);
    let g = mix(c, P.hullDark, smoothstep(0.85, 0.4, p.y) * 0.8);
    const wheelD = Math.min(
      Math.hypot(Math.abs(p.x) - 1.12, p.z - 1.85),
      Math.hypot(Math.abs(p.x) - 1.12, p.z + 1.85),
    );
    g = mix(g, "#1c1812", smoothstep(0.9, 0.5, wheelD) * 0.5 * noise(p, 0.15, 3));
    return mix(g, "#0c0c10", smoothstep(0.62, 0.8, noise(p, 0.06, 7)) * 0.25);
  });
  const HULL = panelled(base, { size: 0.45, aspect: 0.6, rivets: 0.1, seam: P.hullDark });

  // Main hull loft: tail to nose
  b.loft(
    [
      { at: [0, 0.9, -2.8], w: 2.2, h: 1.0 },
      { at: [0, 0.92, -1.8], w: 2.4, h: 1.1 },
      { at: [0, 0.92, 0.0], w: 2.4, h: 1.1 },
      { at: [0, 0.9, 1.6], w: 2.36, h: 1.0 },
      { at: [0, 0.78, 2.5], w: 2.0, h: 0.62 },
      { at: [0, 0.7, 2.82], w: 1.7, h: 0.4 },
    ],
    { bone: body, color: HULL, section: "box", name: "hullMain" },
  );

  // Sloped hood plate
  b.frustumBox([0, 1.35, 1.5], [0, 1.0, 2.75], [2.0, 0.14], [1.5, 0.1], { bone: body, color: P.hullLight, name: "hood" });

  // Under-tray and skid plates
  b.part(new THREE.BoxGeometry(1.9, 0.1, 5.4), P.hullDark, { bone: body, at: [0, 0.38, 0], name: "tray" });
  for (const z of [-0.8, 0.8, 2.3])
    b.part(new THREE.BoxGeometry(1.3, 0.05, 0.7), P.steel, { bone: body, at: [0, 0.325, z], flat: true });

  // Side skirts and yellow stripe
  for (const s of [1, -1]) {
    b.frustumBox([s * 1.2, 0.62, -0.6], [s * 1.2, 0.62, 0.6], [0.1, 0.3], [0.1, 0.3], { bone: body, color: P.hullDark });
    b.part(new THREE.BoxGeometry(0.05, 0.11, 2.8), P.trim, { bone: body, at: [s * 1.215, 0.95, 0], name: "stripe" });
    b.part(new THREE.BoxGeometry(0.05, 0.11, 0.9), P.trim, { bone: body, at: [s * 1.215, 0.95, 2.35] });
    b.part(new THREE.BoxGeometry(0.05, 0.11, 0.9), P.trim, { bone: body, at: [s * 1.215, 0.95, -2.35] });
  }

  // Fender arches around the wheels
  for (const sx of [1, -1])
    for (const z of [1.85, -1.85]) {
      const pts: number[][] = [];
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (i / 10);
        pts.push([sx * 1.24, 0.5 + Math.sin(a) * 0.68, z + Math.cos(a) * 0.68]);
      }
      b.sweep(pts, 0.05, { bone: body, color: P.hullDark, section: { ngon: 6 }, caps: "flat" });
      b.sweep(pts.map((p) => [p[0] + sx * 0.04, p[1] + 0.03, p[2]]), 0.025, { bone: body, color: P.trim, section: { ngon: 6 }, caps: "flat" });
      // wheel well darkness
      b.part(new THREE.BoxGeometry(0.06, 0.9, 1.3), "#08080b", { bone: body, at: [sx * 1.19, 0.58, z] });
    }

  // Chevron texture
  const chev = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8} 16Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 256 },
  );
  // Push-bar bumper
  b.part(new THREE.BoxGeometry(2.3, 0.3, 0.3), "#ffffff", { bone: body, at: [0, 0.6, 2.98], texture: chev, name: "bumper" });
  b.part(new THREE.BoxGeometry(1.8, 0.18, 0.2), P.hullDark, { bone: body, at: [0, 0.85, 3.0] });
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.55, 2.8], [s * 0.9, 0.55, 3.0], 0.07, P.steel, { bone: body });
    b.rod([s * 1.05, 0.5, 2.9], [s * 1.05, 1.0, 2.9], 0.05, P.steel, { bone: body, sides: 6 });
  }
  // Tow hook
  b.sweep([[0, 0.45, 3.05], [0, 0.4, 3.2], [0, 0.3, 3.2], [0, 0.3, 3.08]], 0.025, { bone: body, color: P.steel, section: { ngon: 6 } });

  // Nose neon strip + slit headlights
  glow(b.part(new THREE.BoxGeometry(1.5, 0.03, 0.04), P.neonCyan, { bone: body, at: [0, 0.72, 2.86] }), 1.6);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.45, 0.06, 0.04), P.white, { bone: body, at: [s * 0.65, 0.93, 2.84] }), 1.4);
    b.part(new THREE.BoxGeometry(0.5, 0.1, 0.03), P.hullDark, { bone: body, at: [s * 0.65, 0.93, 2.82] });
  }

  // Emblem decal on hood
  const logo = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#ff2a3c" stroke-width="6"/>
     <path d="M50 14 L82 80 L66 80 L50 44 L34 80 L18 80Z" fill="#ff2a3c"/>
     <text x="50" y="96" text-anchor="middle" font-size="14" font-family="sans-serif" fill="#e8ecf2">RC-9</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", {
    bone: body, at: [0, 1.285, 2.0], dir: [0, 0.85, 0.3], axis: "z", up: [0, 0, -1], texture: logo, name: "emblem",
  });

  // Side katakana label
  const kana = svg(
    `<svg viewBox="0 0 120 30"><text x="60" y="24" text-anchor="middle" font-size="24" font-weight="bold" fill="#f2c617">機動鎮圧</text></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.9, 0.22), "#ffffff", {
      bone: body, at: [s * 1.222, 1.2, 0.2], dir: [s, 0, 0], axis: "z", texture: kana,
    });

  // Tail plate, bumper, exhaust slits, lights
  b.part(new THREE.BoxGeometry(2.3, 0.35, 0.25), "#ffffff", { bone: body, at: [0, 0.6, -2.95], texture: chev });
  b.part(new THREE.BoxGeometry(2.0, 0.55, 0.1), P.hullDark, { bone: body, at: [0, 1.0, -2.88] });
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.34, 0.025, 0.04), "#050507", { bone: body, at: [s * 0.55, 0.9 + i * 0.07, -2.94] });
    glow(b.part(new THREE.BoxGeometry(0.3, 0.05, 0.04), P.neonRed, { bone: body, at: [s * 0.85, 1.2, -2.94] }), 1.5);
    b.rod([s * 0.35, 0.5, -3.0], [s * 0.35, 0.5, -3.25], 0.07, P.steel, { bone: body, sides: 8 });
  }

  // Rivet studs along top edges
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++)
    for (const s of [1, -1]) studs.push(new THREE.SphereGeometry(0.02, 5, 4).translate(s * 1.19, 1.43, -2.4 + i * 0.4 + R() * 0.02));
  const merged = studs.length ? (studs[0], studs) : studs;
  for (const g of merged as THREE.BufferGeometry[]) b.part(g, P.steel, { bone: body, at: [0, 0, 0] });

  // Turret ring seat mount on the deck
  b.lathe([[0, 0], [0.6, 0], [0.6, 0.06], [0.5, 0.1], [0, 0.1]], {
    at: [M.turretRing[0], 1.42, M.turretRing[2]], bone: body, color: metal("iron"),
  });
}
```

<!-- call: tankRear -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildTankRear({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // ---- textures ----
  const CHEV = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#f2c617"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 4} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 16Z" fill="#161820"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  const GAUGE = svg(
    `<svg viewBox="0 0 32 96" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="94" rx="6" fill="#06222c" stroke="#2ff3ff" stroke-width="2"/>
      <rect x="4" y="38" width="24" height="54" rx="4" fill="#2ff3ff"/>
      <rect x="4" y="38" width="24" height="5" fill="#d8ffff"/>
      ${[10, 22, 34, 46, 58, 70, 82].map((y) => `<path d="M4 ${y}h8" stroke="#06222c" stroke-width="2"/>`).join("")}
    </svg>`,
    { size: 192 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 96 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="32" rx="3" fill="#e8ecf2" stroke="#161820" stroke-width="2"/>
      <rect x="3" y="3" width="90" height="6" fill="#3a6bff"/>
      <text x="48" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="#161820">AK-9 7731</text>
      <text x="48" y="8" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#fff">NIGHT CITY CORP</text>
    </svg>`,
    { size: 256 },
  );
  const KANA = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <text x="32" y="22" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="#f2c617">放水</text>
    </svg>`,
    { size: 128 },
  );

  // ---- paints ----
  const tankPaint = paint((p, n) => {
    const g = noise(p, 0.12, 4);
    const base = mix(P.hull, P.hullLight, 0.25 + 0.5 * smoothstep(-0.2, 0.9, n.y) * g);
    return mix(base, P.hullDark, 0.35 * smoothstep(0.55, 0.8, noise(p, 0.05, 9)));
  });
  const deckPaint = paint((p, n) => mix(P.hullDark, P.hull, 0.3 + 0.5 * n.y * noise(p, 0.1, 2)));

  const at = (x: number, y: number, z: number) => [x, y, z];
  const part = (g: THREE.BufferGeometry, c: any, o: any) => b.part(g, c, { bone, ...o });

  // ---- deck plate ----
  part(new THREE.BoxGeometry(2.0, 0.1, 1.85), deckPaint, { at: at(0, 1.45, -2.0) });

  // ---- tank (lathe, axis along z) ----
  const tankC: [number, number, number] = [0, 1.72, -2.0];
  const tank = b.lathe(
    [
      [0, -0.82],
      [0.2, -0.84],
      [0.3, -0.8],
      [0.3, 0.8],
      [0.2, 0.84],
      [0, 0.82],
    ].map(([x, y]) => [x === 0 ? 0 : x + 0.0, y]),
    { at: tankC, axis: [0, 0, 1], color: tankPaint, bone, segments: 12 },
  );
  // fat tank: use scaled cylinder for body instead
  tank.mesh.visible = false;
  const body = part(new THREE.CylinderGeometry(0.4, 0.4, 1.6, 12), tankPaint, {
    at: at(...tankC),
    dir: [0, 0, 1],
    scale: [1, 1, 1],
  });
  for (const e of [1, -1]) {
    part(new THREE.SphereGeometry(0.4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), tankPaint, {
      at: at(0, tankC[1], tankC[2] + e * 0.8),
      dir: [0, 0, e],
    });
    part(new THREE.TorusGeometry(0.4, 0.025, 5, 12), P.steel, {
      at: at(0, tankC[1], tankC[2] + e * 0.8),
      dir: [0, 0, 1],
      axis: "z",
    });
  }

  // hazard chevron bands
  for (const z of [-0.5, 0.5]) {
    part(new THREE.CylinderGeometry(0.415, 0.415, 0.22, 12, 1, true), "#ffffff", {
      at: at(0, tankC[1], tankC[2] + z),
      dir: [0, 0, 1],
      texture: CHEV,
    });
  }
  // straps
  for (const z of [-0.75, 0, 0.75])
    part(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 12), P.hullDark, {
      at: at(0, tankC[1], tankC[2] + z),
      dir: [0, 0, 1],
    });

  // saddles
  for (const z of [-0.55, 0.55])
    part(new THREE.BoxGeometry(0.9, 0.12, 0.2), P.hullLight, { at: at(0, 1.56, tankC[2] + z) });

  // ---- gauge windows (both sides) ----
  for (const s of [1, -1]) {
    part(new THREE.BoxGeometry(0.04, 0.5, 0.16), P.hullDark, { at: at(s * 0.4, 1.72, -2.0) });
    glow(
      part(new THREE.PlaneGeometry(0.12, 0.4), "#ffffff", {
        at: at(s * 0.425, 1.72, -2.0),
        dir: [s, 0, 0],
        axis: "z",
        texture: GAUGE,
      }),
      1.2,
    );
    // side ladder
    for (const z of [-0.2, 0.2]) b.rod(at(s * 0.98, 1.48, -2.0 + z * 4.5 * 0.5 - 0), at(s * 0.98, 1.95, -2.0 + z * 4.5 * 0.5), 0.015, P.steel, { bone });
    for (let i = 0; i < 4; i++)
      b.rod(at(s * 0.98, 1.55 + i * 0.12, -2.45), at(s * 0.98, 1.55 + i * 0.12, -1.55), 0.012, P.steel, { bone });
    // side katakana decal
    part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
      at: at(s * 1.0, 1.7, -2.0),
      dir: [s, 0, 0],
      axis: "z",
      texture: KANA,
    });
  }

  // ---- filler cap on top ----
  part(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 8), P.steel, { at: at(0, 2.13, -2.25) });
  part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.trim, { at: at(0, 2.18, -2.25) });
  part(new THREE.BoxGeometry(0.2, 0.03, 0.03), P.hullDark, { at: at(0, 2.215, -2.25) });

  // ---- hose port, pipes, valves ----
  const port = M.deckTop ? [0, 1.9, -2.0] : [0, 1.9, -2.0];
  part(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 8), P.steel, { at: at(0, 2.1, -1.8) });
  part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.trim, { at: at(0, 2.17, -1.8), dir: [0, 1, 0], axis: "z" });
  b.sweep(
    [at(0, 2.1, -1.8), at(0, 2.2, -1.65), at(0, 2.05, -1.5)],
    0.035,
    { color: P.steel, bone, caps: "round" },
  );
  for (const s of [1, -1]) {
    b.sweep(
      [at(s * 0.3, 1.5, -2.45), at(s * 0.45, 1.5, -2.2), at(s * 0.45, 1.55, -1.7), at(s * 0.25, 1.52, -1.5)],
      0.03,
      { color: P.steel, bone },
    );
    part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), P.trim, { at: at(s * 0.45, 1.56, -2.0), rotation: [0, 0, 90] });
    part(new THREE.BoxGeometry(0.1, 0.02, 0.025), P.neonRed, { at: at(s * 0.45, 1.62, -2.0) });
  }

  // ---- roof rack with spare nozzle canisters ----
  for (const s of [1, -1]) {
    b.rod(at(s * 0.7, 1.95, -2.7), at(s * 0.7, 1.95, -1.3), 0.015, P.steel, { bone });
    for (const z of [-2.7, -2.0, -1.3]) b.rod(at(s * 0.7, 1.75, z), at(s * 0.7, 1.95, z), 0.015, P.steel, { bone });
  }
  for (const z of [-2.6, -1.9, -1.35]) b.rod(at(-0.7, 1.95, z), at(0.7, 1.95, z), 0.012, P.steel, { bone });
  for (const [i, s] of [1, -1].entries()) {
    const x = s * 0.68;
    part(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), i ? P.steel : P.trim, {
      at: at(x * 0.0 + s * 0.62, 2.04, -2.45),
      dir: [0, 0, 1],
    });
    part(new THREE.ConeGeometry(0.07, 0.12, 8), P.hullDark, { at: at(s * 0.62, 2.04, -2.16), dir: [0, 0, 1] });
    part(new THREE.CylinderGeometry(0.065, 0.065, 0.4, 8), P.steel, {
      at: at(s * 0.62, 2.04, -1.65),
      dir: [0, 0, 1],
    });
    part(new THREE.TorusGeometry(0.07, 0.015, 4, 8), P.neonCyan, { at: at(s * 0.62, 2.04, -1.65), dir: [0, 0, 1], axis: "z" });
  }

  // ---- rear plate ----
  part(new THREE.BoxGeometry(2.1, 0.7, 0.1), P.hull, { at: at(0, 1.1, -2.9) });
  part(new THREE.BoxGeometry(2.0, 0.08, 0.14), P.trim, { at: at(0, 0.82, -2.9) });
  // magenta strip
  glow(part(new THREE.BoxGeometry(1.9, 0.07, 0.04), P.neonMagenta, { at: at(0, 1.3, -2.97) }), 1.6);
  // brake light slits
  for (const s of [1, -1]) {
    glow(part(new THREE.BoxGeometry(0.5, 0.06, 0.04), P.neonRed, { at: at(s * 0.7, 1.15, -2.96) }), 1.6);
    // exhaust slits
    for (let i = 0; i < 3; i++)
      part(new THREE.BoxGeometry(0.3, 0.025, 0.04), P.hullDark, { at: at(s * 0.65, 0.98 - i * 0.07, -2.96) });
  }
  // licence plate
  part(new THREE.PlaneGeometry(0.6, 0.2), "#ffffff", {
    at: at(0, 1.0, -2.955),
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
  });
  part(new THREE.BoxGeometry(0.66, 0.26, 0.02), P.hullDark, { at: at(0, 1.0, -2.94) });

  // ---- spoiler antenna blade ----
  b.extrude(
    [
      [0, 0],
      [0.3, 0],
      [0.12, 0.5],
      [0.04, 0.5, "sharp"],
    ],
    { at: at(0.9, 1.5, -2.8), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: P.hullLight, bone },
  );
  b.extrude(
    [
      [0, 0],
      [0.3, 0],
      [0.12, 0.5],
      [0.04, 0.5, "sharp"],
    ],
    { at: at(0.9, 1.5, -2.8), x: [0, 0, 1], y: [0, 1, 0], thickness: 0.03, color: P.hullLight, bone },
  );
  b.rod(at(-0.9, 1.9, -2.85), at(-0.9, 2.4 > 2.0 ? 2.0 : 2.0, -2.85), 0.01, P.steel, { bone });
  glow(part(new THREE.SphereGeometry(0.025, 6, 4), P.neonRed, { at: at(-0.9, 2.0, -2.85) }), 2);
  void R;
}
```

<!-- call: cabin -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildCabin({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const GRIME = "#0c0d12";

  // ---------- paints ----------
  const shell = paint((p, n) => {
    let c = mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.8);
    const seamX = Math.abs(((p.z * 3.2) % 1 + 1) % 1 - 0.5) > 0.485;
    const seamY = Math.abs(((p.x * 3.2) % 1 + 1) % 1 - 0.5) > 0.485;
    if (seamX || seamY) c = mix(c, P.hullDark, 0.8);
    c = mix(c, GRIME, 0.35 * smoothstep(0.55, 0.85, noise(p, 0.18, 4)) * smoothstep(0.4, -0.5, n.y));
    c = mix(c, P.hullDark, 0.5 * smoothstep(1.75, 1.4, p.y));
    return c;
  });
  const plate = paint((p, n) => {
    let c = mix(P.hullDark, P.hullLight, smoothstep(0.5, 1, n.y) * 0.7);
    return mix(c, GRIME, 0.3 * noise(p, 0.1, 9));
  });

  // ---------- textures ----------
  const windscreen = svg(
    `<svg viewBox="0 0 200 70">
    <rect width="200" height="70" rx="6" fill="#06121a"/>
    <path d="M0 0H200V22L0 40Z" fill="#12394a" opacity="0.55"/>
    <path d="M20 0L60 0L30 70L0 70Z" fill="#2ff3ff" opacity="0.14"/>
    <path d="M80 0L100 0L70 70L50 70Z" fill="#2ff3ff" opacity="0.08"/>
    <g stroke="#2ff3ff" stroke-width="1.6" fill="none" opacity="0.85">
      <path d="M130 14H182V28"/><path d="M130 56H160"/><circle cx="156" cy="40" r="8"/>
    </g>
    <text x="134" y="26" font-size="7" font-family="monospace" fill="#2ff3ff">TGT 047</text>
    <rect x="0" y="0" width="200" height="70" rx="6" fill="none" stroke="#000" stroke-width="3"/>
  </svg>`,
    { size: 512 },
  );
  const slit = svg(
    `<svg viewBox="0 0 120 30"><rect width="120" height="30" rx="4" fill="#06121a"/>
    <path d="M0 0H60L40 30H0Z" fill="#2ff3ff" opacity="0.15"/>
    <g stroke="#1b2430" stroke-width="3">${[15, 30, 45, 60, 75, 90, 105].map((x) => `<path d="M${x} 0V30"/>`).join("")}</g>
    <path d="M0 15H120" stroke="#1b2430" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const doorL = (flip: boolean) =>
    svg(
      `<svg viewBox="0 0 160 80"><g ${flip ? 'transform="translate(160 0) scale(-1 1)"' : ""}>
    <text x="8" y="30" font-size="22" font-weight="bold" font-family="sans-serif" fill="#e8ecf2">ポリス</text>
    <text x="8" y="52" font-size="13" font-weight="bold" font-family="monospace" fill="#f2c617">POLICE-CORP</text>
    <text x="8" y="70" font-size="9" font-family="sans-serif" fill="#ff2bd6">鎮圧部隊 RC-9</text>
    <path d="M122 12L150 12L136 40Z" fill="none" stroke="#2ff3ff" stroke-width="3"/>
    <circle cx="136" cy="22" r="4" fill="#ff2bd6"/></g></svg>`,
      { size: 512 },
    );
  const chevron = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f2c617"/>${[0, 16, 32, 48]
      .map((x) => `<path d="M${x} 16L${x + 8} 0H${x + 16}L${x + 8} 16Z" fill="#111"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const lampTex = svg(
    `<svg viewBox="0 0 80 16"><rect width="80" height="16" rx="6" fill="#fff6c8"/><rect x="4" y="5" width="72" height="6" rx="3" fill="#ffffff"/></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const mat = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: body, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    mat(new THREE.BoxGeometry(w, h, d), c, at, o);
  const neon = (w: number, h: number, d: number, c: string, at: number[], s = 1.4, o: any = {}) =>
    glow(box(w, h, d, c, at, o), s);

  // ---------- main shell: lower belt + sloped upper ----------
  // belt (sits on deck y 1.4)
  b.frustumBox([0, 1.4, 0.0], [0, 1.78, 0.0], [2.1, 2.3], [1.88, 1.9], { bone: body, color: shell });
  // shell: lathe-free faceted loft from rear to front with sloped roof
  b.loft(
    [
      { at: [0, 1.8, -0.85], w: 1.8, h: 0.8 },
      { at: [0, 1.85, -0.2], w: 1.84, h: 0.9 },
      { at: [0, 1.88, 0.45], w: 1.8, h: 0.85 },
      { at: [0, 1.76, 1.15], w: 1.7, h: 0.5 },
    ],
    { bone: body, color: shell, section: "box" },
  );
  // roof armour plate
  b.frustumBox([0, 2.1, -0.75], [0, 2.1, 0.55], [1.5, 0.05], [1.5, 0.05], { bone: body, color: plate });
  box(1.55, 0.06, 1.35, plate, [0, 2.12, -0.1]);
  for (const s of [1, -1]) {
    box(0.08, 0.05, 1.4, P.trim, [s * 0.82, 2.14, -0.1]);
    // roof rivet bolts
    for (let i = 0; i < 5; i++)
      mat(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 6), P.steel, [s * 0.65, 2.155, -0.62 + i * 0.3]);
  }

  // ---------- windscreen ----------
  const ws = box(1.6, 0.46, 0.05, P.glass, [0, 1.99, 1.12], { rotation: [-62, 0, 0] });
  b.part(new THREE.PlaneGeometry(1.52, 0.42), "#ffffff", {
    bone: body,
    at: [0, 1.99, 1.12],
    rotation: [-62, 0, 0],
    texture: windscreen,
  });
  // texture plane sits slightly in front of box face
  const wsPlane = b.part(new THREE.PlaneGeometry(1.5, 0.4), "#ffffff", {
    bone: body,
    at: [0, 1.99 + 0.03 * Math.cos((62 * Math.PI) / 180), 1.12 + 0.03 * Math.sin((62 * Math.PI) / 180)],
    rotation: [-62, 0, 0],
    texture: windscreen,
  });
  glow(wsPlane, 0.5);
  void ws;
  // windscreen frame
  box(1.7, 0.05, 0.08, P.hullDark, [0, 2.2, 0.98], { rotation: [-62, 0, 0] });
  box(1.7, 0.06, 0.1, P.hullDark, [0, 1.77, 1.28], { rotation: [-62, 0, 0] });
  // A-pillar braces
  for (const s of [1, -1]) {
    b.rod([s * 0.88, 1.78, 1.28], [s * 0.82, 2.14, 0.97], 0.045, P.hullLight, { bone: body, sides: 6 });
    b.rod([s * 0.95, 1.5, 1.05], [s * 0.88, 1.78, 1.28], 0.05, P.hullDark, { bone: body, sides: 6 });
  }

  // ---------- side details ----------
  for (const s of [1, -1]) {
    const x = s * 0.93;
    // slit windows
    const sw = b.part(new THREE.PlaneGeometry(0.95, 0.22), "#ffffff", {
      bone: body,
      at: [s * 0.935, 1.93, 0.55],
      dir: [s, 0, 0],
      axis: "z",
      texture: slit,
    });
    void sw;
    box(0.05, 0.28, 1.02, P.hullDark, [x, 1.93, 0.55]);
    // rear slit
    b.part(new THREE.PlaneGeometry(0.6, 0.2), "#ffffff", {
      bone: body,
      at: [s * 0.925, 1.93, -0.45],
      dir: [s, 0, 0],
      axis: "z",
      texture: slit,
    });
    box(0.05, 0.26, 0.66, P.hullDark, [x - s * 0.005, 1.93, -0.45]);
    // door seams
    for (const z of [-0.85, 0.05, 0.95]) box(0.02, 0.5, 0.015, P.hullDark, [s * 0.935, 1.62, z]);
    box(0.02, 0.015, 1.8, P.hullDark, [s * 0.935, 1.38, 0.05]);
    // handles
    box(0.04, 0.04, 0.2, P.steel, [s * 0.96, 1.66, 0.3]);
    box(0.04, 0.04, 0.2, P.steel, [s * 0.96, 1.66, -0.25]);
    // door decal
    b.part(new THREE.PlaneGeometry(0.85, 0.42), "#ffffff", {
      bone: body,
      at: [s * 0.94, 1.6, 0.52],
      dir: [s, 0, 0],
      axis: "z",
      texture: doorL(s < 0),
    });
    // yellow stripe
    box(0.02, 0.06, 1.9, P.trim, [s * 0.94, 1.47, 0.05]);
    // wing mirrors
    b.rod([s * 0.95, 1.85, 0.95], [s * 1.2, 1.9, 1.05], 0.025, P.hullDark, { bone: body, sides: 6 });
    box(0.07, 0.2, 0.14, P.hullDark, [s * 1.24, 1.9, 1.05]);
    box(0.01, 0.16, 0.1, P.glass, [s * 1.24 - s * 0.04, 1.9, 1.05]);
    neon(0.012, 0.015, 0.1, P.neonCyan, [s * 1.245, 1.99, 1.05], 1.5);
    // roof side vent grilles
    for (let i = 0; i < 4; i++) box(0.03, 0.02, 0.2, P.hullDark, [s * 0.9, 2.08, -0.55 + i * 0.07 * 1], { rotation: [0, 0, 0] });
  }

  // ---------- front: nose of cabin, lamps, neon ----------
  box(1.9, 0.07, 0.05, P.hullDark, [0, 1.62, 1.19]);
  neon(1.7, 0.04, 0.03, P.neonCyan, [0, 1.62, 1.22], 1.8);
  for (const s of [1, -1]) {
    box(0.62, 0.12, 0.06, P.hullDark, [s * 0.58, 1.78, 1.2], { rotation: [-20, 0, 0] });
    glow(
      b.part(new THREE.PlaneGeometry(0.54, 0.09), "#ffffff", {
        bone: body,
        at: [s * 0.58, 1.78, 1.235],
        rotation: [-20, 0, 0],
        texture: lampTex,
      }),
      1.6,
    );
  }
  // roof front lamps (roofFront)
  for (const s of [1, -1]) {
    box(0.18, 0.1, 0.1, P.hullDark, [s * 0.55, 2.0, 0.5]);
    neon(0.14, 0.05, 0.03, "#fff6c8", [s * 0.55, 2.0, 0.56], 1.6);
  }

  // ---------- roof light bar ----------
  const barY = 2.2;
  const barZ = 0.35;
  box(1.5, 0.05, 0.3, P.hullDark, [0, barY, barZ]);
  for (const s of [1, -1]) {
    box(0.08, 0.12, 0.08, P.steel, [s * 0.55, 2.16, barZ - 0.1]);
    box(0.08, 0.12, 0.08, P.steel, [s * 0.55, 2.16, barZ + 0.1]);
  }
  const seg = [P.neonRed, P.neonMagenta, P.neonBlue, P.neonBlue, P.neonMagenta, P.neonRed];
  seg.forEach((c, i) => {
    const x = -0.6 + i * 0.24;
    glow(
      mat(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 6, 1), c, [x, barY + 0.075, barZ], { flat: true }),
      1.7,
    );
    mat(new THREE.CylinderGeometry(0.05, 0.1, 0.03, 6), P.hullDark, [x, barY + 0.14, barZ]);
  });
  box(1.56, 0.03, 0.04, P.trim, [0, barY + 0.03, barZ + 0.17]);
  box(1.56, 0.03, 0.04, P.trim, [0, barY + 0.03, barZ - 0.17]);

  // ---------- antennas ----------
  const ants: [number, number, number, number][] = [
    [-0.65, -0.55, 0.55, 0.012],
    [0.7, -0.6, 0.38, 0.01],
    [0.5, -0.8, 0.7, 0.008],
  ];
  for (const [x, z, h, r] of ants) {
    b.rod([x, 2.14, z], [x * 1.05, 2.14 + h, z - 0.04], [r * 1.6, r * 0.6], P.steel, { bone: body, sides: 6 });
    glow(mat(new THREE.SphereGeometry(0.02, 6, 4), P.neonRed, [x * 1.05, 2.14 + h, z - 0.04]), 1.6);
  }
  mat(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 8), P.hullDark, [-0.65, 2.15, -0.55]);
  // sat dish
  mat(new THREE.CylinderGeometry(0.16, 0.03, 0.06, 8), P.white, [0.0, 2.2, -0.75], { rotation: [-35, 0, 0] });
  b.rod([0, 2.14, -0.75], [0, 2.2, -0.75], 0.02, P.steel, { bone: body, sides: 6 });

  // ---------- hazard chevron band at rear of cabin & roof ----------
  b.part(new THREE.PlaneGeometry(1.7, 0.1), "#ffffff", {
    bone: body,
    at: [0, 1.62, -0.936],
    dir: [0, 0, -1],
    axis: "z",
    texture: chevron,
  });
  box(1.84, 0.5, 0.04, shell, [0, 1.65, -0.9]);
  box(1.4, 0.3, 0.03, P.hullDark, [0, 1.95, -0.91]);
  for (const s of [1, -1]) neon(0.04, 0.4, 0.02, P.neonMagenta, [s * 0.8, 1.7, -0.93], 1.3);

  // ---------- grime scuffs: small bolt rows on pillars ----------
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    mat(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), P.steel, [s * (0.93 + 0.0), 1.45 + R() * 0.02, -0.7 + i * 0.22], {
      dir: [s, 0, 0],
    });
  }
}
```
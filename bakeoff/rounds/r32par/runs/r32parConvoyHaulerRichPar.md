<!-- call: plan -->

```json
{
  "name": "Convoy Hauler MK-IV 'Warden'",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a wedge cab, roof gun turret and a sealed, glowing cargo pod strapped on its flatbed.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.2, 8.4],
  "layout": "Long heavy truck facing +Z. Front: angular wedge cab with a sloped armoured windscreen (cyan glowing visor strip), a bull-bar ram with yellow hazard stripes and twin headlights. Cab roof carries a ring-mounted twin-barrel turret. Behind the cab a low flatbed chassis with three axles (one front steering, two rear) on chunky faceted wheels with glowing neon hub rings. The back half is a big rounded-box sealed cargo pod held by four yellow cargo straps and corner clamps, with a magenta glowing seal-lock band and a hazard-marked door at the rear. Hull is dark gunmetal panelled steel with yellow hazard trim, cyan and magenta neon strips along skirts, antennas and tail lights. Everything is chunky faceted primitives, panel paints, SVG decals (hazard stripes, serial numbers, kanji-like glyph labels) and glow on lights and screens.",
  "palette": {
    "hull": "#3b4250",
    "hullDark": "#20242e",
    "hullLight": "#5b6578",
    "trim": "#e7b814",
    "trimDark": "#2a2a2a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0e2a3a",
    "rubber": "#15161a",
    "rim": "#8a93a6",
    "podShell": "#d9dde3",
    "podDark": "#7d8596",
    "strap": "#e7b814",
    "warnRed": "#e0262f",
    "lampWhite": "#fff6d0",
    "metalBare": "#9aa3b2"
  },
  "mounts": {
    "chassisTop": [0, 1.2, -0.6],
    "cabRoof": [0, 2.55, 2.6],
    "turretRing": [0, 2.6, 2.3],
    "podBase": [0, 1.25, -2.2],
    "podFront": [0, 2.2, -0.2],
    "axleFront": [0, 0.55, 2.9],
    "axleMid": [0, 0.55, -1.4],
    "axleRear": [0, 0.55, -3.1],
    "cabBack": [0, 1.2, 1.4],
    "bumper": [0, 0.8, 4.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.2, 2.6], "dir": [0, 0, 1], "role": "spine", "group": "cab" },
    { "name": "turretYaw", "parent": "cab", "at": [0, 2.6, 2.3], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.0, 2.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.55, 2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.55, 2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.3, 0.55, -1.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.3, 0.55, -1.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.3, 0.55, -3.1], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.3, 0.55, -3.1], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "podDoor", "parent": "body", "at": [0, 1.3, -4.15], "dir": [1, 0, 0], "role": "hinge", "group": "pod" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "The frame and flatbed: ladder frame rails, deck plate (panelled gunmetal paint with rivets), side skirts with cyan neon strip and yellow hazard-stripe SVG trim, fender arches over each of the six wheels, fuel and battery boxes between axles, exposed underbody cables and drive shafts, rear bumper with magenta-red tail lights (glowing) and a tow hitch, mud flaps, ladder step and grab rails. Includes the axle beams and suspension springs (coil sweeps) for all three axles, but not the wheels.",
      "box": [[-1.5, 0.35, -4.2], [1.5, 1.35, 3.6]],
      "attaches": "Cab sits on it at cabBack/chassisTop forward end; pod rests on podBase; wheels mount on axleFront, axleMid, axleRear lines. Rides joint body.",
      "joints": ["body", "podDoor"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "The wedge armoured cab: lofted sloped hull with chamfered faceted panels, steeply raked armoured windscreen with glowing cyan visor strip and SVG HUD-like glyph texture, slit side windows with cage bars, side doors with yellow hazard decals and serial-number text, mirrors with small glowing screens, roof light bar (magenta/cyan glow), roof antennas and sensor dome, vents, a ram bull-bar bumper with hazard stripes, twin headlights (glow) and a grille with painted mesh. Roof has the turretRing seat plate.",
      "box": [[-1.45, 1.2, 1.4], [1.45, 2.65, 4.4]],
      "attaches": "Sits on chassis at cabBack; roof ring plate at turretRing/cabRoof where turret mounts; bumper at bumper mount. Rides joint cab.",
      "joints": ["cab"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "turret",
      "builds": "Roof-mounted remote gun turret: round lathe base ring with yellow chevron paint, rotating faceted armoured housing on turretYaw, twin barrels with muzzle brakes, heat-shield sleeves and ammo box on side with feed belt, pitch cradle on gunPitch with a small sensor camera with glowing cyan lens, warning red lamp, antenna whip. Barrels point +Z in rest pose.",
      "box": [[-0.7, 2.55, 1.6], [0.7, 3.2, 3.6]],
      "attaches": "Base ring seated on turretRing mount over the cab roof. Rides turretYaw (housing) and gunPitch (barrels, cradle).",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 100
    },
    {
      "id": "wheels",
      "builds": "Six chunky low-poly wheels: faceted 10-sided tyres with rubber tread paint, steel rims with bolt rings, hub caps, glowing neon cyan (front) and magenta (rear) hub-ring accents, brake discs with yellow calipers visible behind spokes, reinforced mudguard-height sidewall armour plates. Each wheel built on its own wheel joint, axle line along x, wheel radius 0.55 so bottoms touch y=0. Rear four are dual-tyred (two tyres per side per axle).",
      "box": [[-1.75, 0, -3.75], [1.75, 1.1, 3.5]],
      "attaches": "Hubs at axleFront, axleMid, axleRear with x = ±1.3; tyres' outer face about x ±1.65. Rides wheelFL, wheelFR, wheelML, wheelMR, wheelRL, wheelRR.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cargoPod",
      "builds": "The sealed cargo pod: long rounded-box shell of light podShell paint with panelled seams, rounded end caps, four yellow cargo straps with ratchet buckles and corner clamp brackets, saddles/cradles on the deck, a magenta glowing seal-lock band around the middle with SVG biohazard/lock glyphs, label decals (serial numbers, BIOHAZARD/PRIORITY stripes in SVG), reinforced rear double door on podDoor hinge with glowing lock bars and red warning light, roof vents, small status screens glowing green-cyan, tie-down rings and a small sensor mast. Looks tightly sealed and valuable.",
      "box": [[-1.4, 1.3, -4.2], [1.4, 3.2, -0.2]],
      "attaches": "Rests on the chassis deck at podBase; front face near podFront behind the cab; rear door hinge at podDoor. Rides body, with the door on podDoor.",
      "joints": ["body", "podDoor"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const CALIPER = "#e7b814";
  const BOLT = "#4d5567";

  // Tread paint: dark rubber with lugs around the circumference and grime.
  const rubber = paint((p, n) => {
    const a = Math.atan2(p.y - R, p.z - 0);
    const v = noise(p, 0.12, 4);
    const lug = Math.abs(n.x) < 0.5 ? (Math.sin(a * 30) > 0.3 ? 0.55 : 1) : 0.8;
    const g = (0.07 + 0.05 * v) * lug;
    return [g * 1.0, g * 1.02, g * 1.15];
  });
  const steel = paint((p, n) => mix(P.rim, P.metalBare, smoothstep(0.2, 0.9, noise(p, 0.08, 9)) * 0.6 + 0.2 * Math.max(n.y, 0)));
  const armor = paint((p) => mix(P.hullDark, P.hull, noise(p, 0.1, 2)));

  // Spoke/bolt drawing on the rim face.
  const rimTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#5b6578"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#20242e" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => { const a = (i * Math.PI) / 3; return `<circle cx="${50 + 30 * Math.cos(a)}" cy="${50 + 30 * Math.sin(a)}" r="4.5" fill="#20242e"/><circle cx="${50 + 30 * Math.cos(a)}" cy="${50 + 30 * Math.sin(a)}" r="2.5" fill="#c9d0de"/>`; }).join("")}
    ${[0, 1, 2, 3, 4].map((i) => { const a = (i * 2 * Math.PI) / 5 + 0.3; return `<path d="M50 50 L${50 + 38 * Math.cos(a)} ${50 + 38 * Math.sin(a)}" stroke="#20242e" stroke-width="5"/>`; }).join("")}
    <circle cx="50" cy="50" r="12" fill="#8a93a6" stroke="#20242e" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  const wheels: [keyof typeof J, number, number, boolean, string][] = [
    ["wheelFL", 1, M.axleFront[2], false, P.neonCyan],
    ["wheelFR", -1, M.axleFront[2], false, P.neonCyan],
    ["wheelML", 1, M.axleMid[2], true, P.neonMagenta],
    ["wheelMR", -1, M.axleMid[2], true, P.neonMagenta],
    ["wheelRL", 1, M.axleRear[2], true, P.neonMagenta],
    ["wheelRR", -1, M.axleRear[2], true, P.neonMagenta],
  ];

  const X = new THREE.Vector3(1, 0, 0);
  void X;

  for (const [name, s, z, dual, neon] of wheels) {
    const bone = J[name as string];
    const rot = { dir: [s, 0, 0] as [number, number, number] };
    // tyre helper: x = centre offset along outward axis
    const tyre = (off: number, width: number) => {
      const x = s * off;
      b.part(new THREE.CylinderGeometry(R, R, width, 10), rubber, { bone, at: [x, R, z], ...rot, flat: true });
      // shoulder bevel rings for chunkier look
      for (const k of [-1, 1])
        b.part(new THREE.CylinderGeometry(R * 0.93, R, 0.05, 10), P.rubber, {
          bone, at: [x + k * (width / 2 - 0.02), R, z], ...rot, flat: true,
        });
      // rim
      const out = x + s * (width / 2 - 0.02);
      b.part(new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.06, 10), steel, { bone, at: [out, R, z], ...rot, flat: true });
      b.part(new THREE.PlaneGeometry(R * 1.2, R * 1.2), "#ffffff", {
        bone, at: [out + s * 0.034, R, z], dir: [s, 0, 0], axis: "z", up: [0, 1, 0], texture: rimTex,
      });
      // rim lip
      b.part(new THREE.TorusGeometry(R * 0.62, 0.03, 5, 10), P.hullLight, { bone, at: [out + s * 0.02, R, z], dir: [s, 0, 0], axis: "z" });
      return out;
    };

    let outer: number;
    if (dual) {
      tyre(1.0, 0.3);
      outer = tyre(1.35, 0.3);
    } else {
      outer = tyre(1.3, 0.4);
    }

    // hub cap
    b.part(new THREE.CylinderGeometry(0.13, 0.16, 0.1, 8), P.metalBare, { bone, at: [outer + s * 0.06, R, z], ...rot, flat: true });
    b.part(new THREE.ConeGeometry(0.07, 0.08, 8), P.hullLight, { bone, at: [outer + s * 0.14, R, z], ...rot, flat: true });
    // neon ring
    glow(b.part(new THREE.TorusGeometry(0.2, 0.022, 5, 14), neon, { bone, at: [outer + s * 0.05, R, z], dir: [s, 0, 0], axis: "z" }), 2);
    // lug bolts
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), BOLT, {
        bone, at: [outer + s * 0.06, R + 0.29 * Math.cos(a), z + 0.29 * Math.sin(a)], ...rot,
      });
    }

    // inner brake disc and caliper (behind spokes, inboard)
    const inner = s * (dual ? 0.8 : 1.08);
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.035, 12), P.metalBare, { bone, at: [inner, R, z], ...rot, flat: true });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.hullDark, { bone, at: [inner - s * 0.03, R, z], ...rot });
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.12), CALIPER, { bone, at: [inner + s * 0.03, R + 0.3, z + 0.05] });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.05), P.trimDark, { bone, at: [inner + s * 0.03, R + 0.4, z + 0.05] });

    // sidewall armour plates: angled boxes around outer tyre face
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 + 0.3;
      const py = R + 0.46 * Math.sin(a);
      const pz = z + 0.46 * Math.cos(a);
      b.part(new THREE.BoxGeometry(0.05, 0.14, 0.2), armor, {
        bone, at: [outer + s * 0.0, py, pz],
        rotation: [(-a * 180) / Math.PI + 180, 0, 0], flat: true,
      });
    }
    // trim accent on hub for yellow
    b.part(new THREE.TorusGeometry(0.4, 0.012, 4, 10), P.trim, { bone, at: [outer + s * 0.03, R, z], dir: [s, 0, 0], axis: "z" });

    // axle stub linking tyres to chassis
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), P.hullDark, { bone, at: [s * 0.95, R, z], ...rot });
  }
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, mix, smoothstep, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const [rx, ry, rz] = M.turretRing;

  // ---------- textures ----------
  const chevron = svg(
    `<svg viewBox="0 0 64 16" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="16" fill="#2a2a2a"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 8} 0 L${i * 8 + 5} 0 L${i * 8 + 13} 8 L${i * 8 + 5} 16 L${i * 8} 16 L${i * 8 + 8} 8Z" fill="#e7b814"/>`).join("")}
    </svg>`,
    { size: 256 },
  );
  const lens = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#0a1a22"/>
      <circle cx="16" cy="16" r="11" fill="#2ff3ff"/>
      <circle cx="16" cy="16" r="6" fill="#bffcff"/>
      <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
    </svg>`,
    { size: 64 },
  );
  const glyph = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="#e7b814"/>
      <rect x="2" y="2" width="60" height="28" fill="none" stroke="#2a2a2a" stroke-width="2"/>
      <text x="32" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#2a2a2a">WD-04</text>
    </svg>`,
    { size: 128 },
  );
  const beltTex = svg(
    `<svg viewBox="0 0 32 8" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="8" fill="#6b5a1e"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 4 + 0.5}" y="1" width="3" height="6" fill="#e0b84a"/><rect x="${i * 4 + 0.5}" y="1" width="3" height="1.5" fill="#fff0a0"/>`).join("")}
    </svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const armor = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.hullLight, smoothstep(-0.2, 0.9, n.y) * 0.6);
      return mix(base, P.hullDark, 0.35 * smoothstep(0.55, 0.8, noise(p, 0.12, 4)));
    }),
    { size: 0.2, rivets: 0.05 },
  );
  const darkSteel = metal("iron");
  const barrelPaint = metal("blued", { tarnish: 0.4 });
  const ringPaint = paint((p, n) => (n.y > 0.5 ? mix(P.hullDark, P.hull, 0.5) : P.hullDark));

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  // ---------- base ring (rides yaw so it is part of the rotating assembly's seat) ----------
  b.lathe(
    [
      [0, 0],
      [0.62, 0],
      [0.62, 0.05],
      [0.55, 0.09],
      [0.5, 0.09],
      [0, 0.09],
    ],
    { at: at(rx, ry, rz), bone: J.cab, segments: 16, color: ringPaint },
  );
  // chevron band
  b.part(new THREE.CylinderGeometry(0.64, 0.64, 0.07, 16, 1, true), "#ffffff", {
    bone: J.cab,
    at: at(rx, ry + 0.045, rz),
    texture: chevron,
    flat: true,
  });
  // bearing race
  b.lathe(
    [
      [0, 0],
      [0.5, 0],
      [0.46, 0.06],
      [0, 0.06],
    ],
    { at: at(rx, ry + 0.09, rz), bone: yaw, segments: 16, color: darkSteel },
  );

  // ---------- housing (yaw) ----------
  const hy = ry + 0.15; // housing base
  const hz = 2.55; // housing centre z
  const housing = b.loft(
    [
      { at: at(0, hy + 0.22, rz - 0.35), w: 0.95, h: 0.44 },
      { at: at(0, hy + 0.27, rz), w: 1.1, h: 0.54 },
      { at: at(0, hy + 0.25, rz + 0.3), w: 0.9, h: 0.5 },
      { at: at(0, hy + 0.2, rz + 0.55), w: 0.6, h: 0.4 },
    ],
    { bone: yaw, color: armor, section: "box" },
  );
  // sloped roof plate
  b.extrude(
    [
      [-0.5, 0],
      [0.5, 0],
      [0.38, 0.1],
      [-0.38, 0.1],
    ],
    { at: at(0, hy + 0.5, rz - 0.15), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.015, color: P.hullLight, bone: yaw },
  );
  // front mantlet shield
  b.frustumBox(at(0, hy + 0.22, rz + 0.5), at(0, hy + 0.22, rz + 0.66), [0.7, 0.42], [0.5, 0.3], {
    bone: yaw,
    color: P.hullDark,
  });
  // side armour wedge plates
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.55, 0],
        [0.45, 0.4],
        [0.05, 0.42],
      ],
      { at: at(s * 0.56, hy, rz - 0.3), x: [0, 0, 1], y: [s * 0.0, 1, 0], thickness: 0.05, bevel: 0.01, color: P.hull, bone: yaw },
    );
    // glow strip on cheek
    glow(b.part(new THREE.BoxGeometry(0.02, 0.03, 0.45), P.neonCyan, { bone: yaw, at: at(s * 0.6, hy + 0.1, rz + 0.0) }), 1.6);
  }
  // hazard plate on the back
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", {
    bone: yaw,
    at: at(0, hy + 0.3, rz - 0.63),
    dir: [0, 0, -1],
    axis: "z",
    texture: glyph,
  });
  // back vents
  for (let i = 0; i < 3; i++)
    b.part(new THREE.BoxGeometry(0.34, 0.025, 0.04), P.trimDark, { bone: yaw, at: at(0, hy + 0.42 - i * 0.07, rz - 0.62) });

  // ---------- ammo box + belt (left side +X) ----------
  b.part(new THREE.BoxGeometry(0.22, 0.26, 0.34), P.trim, { bone: yaw, at: at(0.72, hy + 0.2, rz - 0.1), flat: true });
  b.part(new THREE.BoxGeometry(0.24, 0.04, 0.36), P.trimDark, { bone: yaw, at: at(0.72, hy + 0.34, rz - 0.1) });
  b.part(new THREE.BoxGeometry(0.03, 0.12, 0.2), P.hullDark, { bone: yaw, at: at(0.84, hy + 0.2, rz - 0.1) });
  const beltPath = [
    at(0.7, hy + 0.3, rz + 0.08),
    at(0.7, hy + 0.34, rz + 0.22),
    at(0.64, hy + 0.34, rz + 0.36),
    at(0.5, hy + 0.3, rz + 0.5),
  ];
  b.sweep(beltPath, 0.035, { bone: yaw, color: "#c9a63a", section: { ngon: 4 }, caps: "flat" });
  b.part(new THREE.BoxGeometry(0.01, 0.01, 0.01), P.trim, { bone: yaw, at: at(0.5, hy + 0.3, rz + 0.5) });
  b.along(beltPath, 6, (f: any) =>
    b.stick(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 6), "#e0b84a", f, { embed: 0.2, bone: yaw }),
  );

  // ---------- lamp and antenna on housing ----------
  b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.06, 8), P.hullDark, { bone: yaw, at: at(-0.38, hy + 0.57, rz - 0.3) });
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), P.warnRed, { bone: yaw, at: at(-0.38, hy + 0.65, rz - 0.3) }), 2);
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), P.hullDark, { bone: yaw, at: at(-0.5, hy + 0.5, rz - 0.4) });
  b.rod(at(-0.5, hy + 0.52, rz - 0.4), at(-0.55, hy + 1.05, rz - 0.48), [0.012, 0.005], { bone: yaw, color: P.metalBare });
  glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), P.neonMagenta, { bone: yaw, at: at(-0.55, hy + 1.06, rz - 0.48) }), 2);

  // ---------- pitch cradle (gunPitch at y 3.0, z 2.5) ----------
  const gy = 3.0;
  const gz = 2.5;
  // trunnion pins
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), P.metalBare, {
      bone: pitch,
      at: at(s * 0.5, gy, gz),
      dir: [s, 0, 0],
    });
  }
  // cradle block
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.5), P.hullLight, { bone: pitch, at: at(0, gy, gz + 0.4), flat: true });
  b.part(new THREE.BoxGeometry(0.38, 0.06, 0.4), P.hullDark, { bone: pitch, at: at(0, gy + 0.12, gz + 0.45) });

  // ---------- twin barrels ----------
  for (const s of [1, -1]) {
    const x = s * 0.13;
    const z0 = gz + 0.55;
    b.rod(at(x, gy, z0), at(x, gy, z0 + 0.9), 0.045, { bone: pitch, color: barrelPaint, sides: 8 });
    // heat-shield sleeve with vent slots
    b.rod(at(x, gy, z0 + 0.05), at(x, gy, z0 + 0.55), 0.07, { bone: pitch, color: P.hullDark, sides: 8 });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.TorusGeometry(0.072, 0.012, 4, 8), P.metalBare, {
        bone: pitch,
        at: at(x, gy, z0 + 0.1 + i * 0.12),
        dir: [0, 0, 1],
        axis: "z",
      });
    // muzzle brake
    b.rod(at(x, gy, z0 + 0.88), at(x, gy, z0 + 1.02), [0.075, 0.07], { bone: pitch, color: P.hullDark, sides: 6 });
    for (let i = 0; i < 2; i++)
      b.part(new THREE.BoxGeometry(0.17, 0.016, 0.03), P.trimDark, { bone: pitch, at: at(x, gy, z0 + 0.93 + i * 0.05) });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6), "#050608", {
      bone: pitch,
      at: at(x, gy, z0 + 1.025),
      dir: [0, 0, 1],
    });
  }
  // barrel clamp between
  b.part(new THREE.BoxGeometry(0.34, 0.1, 0.06), P.hull, { bone: pitch, at: at(0, gy, gz + 1.0), flat: true });

  // ---------- sensor camera on top of cradle ----------
  const cx = -0.2;
  const cy = gy + 0.2;
  const cz = gz + 0.4;
  b.part(new THREE.BoxGeometry(0.14, 0.12, 0.2), P.hullDark, { bone: pitch, at: at(cx, cy, cz), flat: true });
  b.part(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 8), P.hull, {
    bone: pitch,
    at: at(cx, cy, cz + 0.13),
    dir: [0, 0, 1],
  });
  glow(
    b.part(new THREE.CircleGeometry(0.05, 10), "#ffffff", {
      bone: pitch,
      at: at(cx, cy, cz + 0.175),
      dir: [0, 0, 1],
      axis: "z",
      texture: lens,
    }),
    1.8,
  );
  b.part(new THREE.BoxGeometry(0.03, 0.07, 0.03), P.hull, { bone: pitch, at: at(cx, cy - 0.08, cz) });

  // cyan status strip on cradle
  glow(b.part(new THREE.BoxGeometry(0.3, 0.015, 0.02), P.neonCyan, { bone: pitch, at: at(0, gy + 0.11, gz + 0.66) }), 1.6);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildCab({ b, J, P }: Ctx) {
  const cab = J.cab;
  const BONE = { bone: cab };

  // ---------- textures ----------
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#2a2a2a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const SERIAL = svg(
    `<svg viewBox="0 0 96 48"><rect x="2" y="2" width="92" height="44" rx="4" fill="#20242e" stroke="#e7b814" stroke-width="3"/>
    <text x="48" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#e7b814">WDN-04</text>
    <text x="48" y="40" text-anchor="middle" font-family="monospace" font-size="12" fill="#2ff3ff">警護 // 7731</text></svg>`,
    { size: 128 },
  );
  const HUD = svg(
    `<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#0b3a48"/>
    <path d="M0 16 H30 L36 6 L44 26 L52 16 H128" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    ${[8, 40, 72, 104].map((x) => `<rect x="${x}" y="3" width="20" height="3" fill="#7dfcff"/>`).join("")}
    <text x="64" y="29" text-anchor="middle" font-size="9" font-family="monospace" fill="#c8ffff">警 戒 ▸ 路 線 OK  88%</text></svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0c0d10"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 6.4 + 1}" y="1" width="3.4" height="22" fill="#5b6578"/>`).join("")}${[6, 12, 18].map((y) => `<rect x="0" y="${y}" width="64" height="1.5" fill="#20242e"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 16 10"><rect width="16" height="10" fill="#0a2a22"/><path d="M1 7 L4 4 L7 6 L10 2 L15 5" stroke="#5dffb0" stroke-width="1" fill="none"/></svg>`,
    { size: 64 },
  );

  // ---------- paints ----------
  const hullPaint = panelled(
    paint((p, n) => mix(P.hull, P.hullLight, 0.25 * noise(p, 0.3, 3) + 0.25 * smoothstep(0.3, 1, n.y))),
    { size: 0.45, aspect: 0.6, rivets: 0.07 },
  );
  const darkPaint = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });
  const bumperPaint = paint((p) => (Math.floor((p.x + 5) / 0.16) % 2 ? P.trim : P.trimDark));
  const bare = metal("steel", { tarnish: 0.4 });

  // ---------- hull loft: wedge ----------
  const hull = b.loft(
    [
      { at: [0, 1.85, 1.65], w: 2.9, h: 1.3 },
      { at: [0, 1.85, 2.5], w: 2.9, h: 1.3 },
      { at: [0, 1.88, 3.3], w: 2.7, h: 1.05 },
      { at: [0, 1.82, 4.0], w: 2.3, h: 0.78 },
    ],
    { ...BONE, color: hullPaint, section: "box", caps: "flat" },
  );
  void hull;
  // lower armour chin / skirt
  b.part(new THREE.BoxGeometry(2.7, 0.35, 0.5), darkPaint, { ...BONE, at: [0, 1.4, 4.1] });
  // roof slab (upper wedge) sloping
  b.frustumBox([0, 2.38, 1.55], [0, 2.38, 2.85], [2.6, 0.28], [2.3, 0.22], { ...BONE, color: darkPaint });
  // chamfer bars along hull edges
  for (const s of [1, -1]) {
    b.rod([s * 1.42, 1.25, 1.5], [s * 1.42, 1.25, 3.6], 0.07, { ...BONE, color: P.hullDark });
    b.rod([s * 1.38, 2.3, 1.6], [s * 1.2, 2.3, 2.9], 0.05, { ...BONE, color: P.hullLight });
  }

  // ---------- windscreen (raked) ----------
  const wsA: [number, number, number] = [0, 2.38, 2.95];
  const wsB: [number, number, number] = [0, 1.98, 3.7];
  const wsMid: [number, number, number] = [0, 2.19, 3.33];
  b.part(new THREE.BoxGeometry(2.3, 0.06, 0.95), P.glass, { ...BONE, at: wsMid, rotation: [-28, 0, 0] });
  glow(
    b.part(new THREE.PlaneGeometry(2.1, 0.5), "#ffffff", {
      ...BONE,
      at: [0, 2.2, 3.325],
      dir: [0, 0.68, 0.74],
      axis: "z",
      texture: HUD,
    }),
    1.1,
  );
  // frame
  b.rod([-1.2, 2.4, 2.92], [-1.2, 1.97, 3.72], 0.05, { ...BONE, color: P.hullDark });
  b.rod([1.2, 2.4, 2.92], [1.2, 1.97, 3.72], 0.05, { ...BONE, color: P.hullDark });
  b.rod([-1.2, 2.4, 2.92], [1.2, 2.4, 2.92], 0.05, { ...BONE, color: P.hullDark });
  // visor strip
  glow(b.part(new THREE.BoxGeometry(2.2, 0.05, 0.05), P.neonCyan, { ...BONE, at: [0, 1.95, 3.74] }), 1.6);
  // wiper
  b.rod([-0.6, 2.0, 3.7], [0.1, 2.3, 3.0], 0.015, { ...BONE, color: P.trimDark });

  // ---------- side doors + windows ----------
  for (const s of [1, -1]) {
    const x = s * 1.46;
    b.part(new THREE.BoxGeometry(0.08, 1.0, 1.25), darkPaint, { ...BONE, at: [x, 1.8, 2.3] });
    // slit window
    b.part(new THREE.BoxGeometry(0.1, 0.22, 0.95), P.glass, { ...BONE, at: [s * 1.49, 2.2, 2.3] });
    for (let i = 0; i < 4; i++)
      b.rod([s * 1.52, 2.1, 1.95 + i * 0.25], [s * 1.52, 2.32, 1.95 + i * 0.25], 0.012, { ...BONE, color: P.hullDark });
    // hazard decal
    b.part(new THREE.PlaneGeometry(1.1, 0.2), "#ffffff", {
      ...BONE,
      at: [s * 1.505, 1.5, 2.3],
      dir: [s, 0, 0],
      axis: "z",
      texture: HAZ,
    });
    // serial plate
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      ...BONE,
      at: [s * 1.505, 1.88, 2.65],
      dir: [s, 0, 0],
      axis: "z",
      texture: SERIAL,
    });
    // handle
    b.rod([s * 1.5, 1.85, 1.8], [s * 1.5, 1.85, 1.95], 0.03, { ...BONE, color: P.metalBare });
    // door seam
    b.rod([s * 1.5, 1.3, 1.67], [s * 1.5, 2.3, 1.67], 0.012, { ...BONE, color: P.trimDark });
    // vents
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.06, 0.04, 0.35), P.trimDark, { ...BONE, at: [s * 1.46, 1.35 + i * 0.07, 3.45] });
    // mirror arm + mirror + screen
    b.rod([s * 1.45, 2.2, 3.0], [s * 1.82, 2.3, 3.12], 0.03, { ...BONE, color: P.hullDark });
    b.part(new THREE.BoxGeometry(0.1, 0.34, 0.22), P.hullDark, { ...BONE, at: [s * 1.86, 2.3, 3.14] });
    glow(
      b.part(new THREE.PlaneGeometry(0.18, 0.28), "#ffffff", {
        ...BONE,
        at: [s * 1.86, 2.3, 3.255],
        dir: [0, 0, 1],
        axis: "z",
        texture: SCREEN,
      }),
      1,
    );
    // neon side strip
    glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 1.6), s > 0 ? P.neonCyan : P.neonMagenta, { ...BONE, at: [s * 1.47, 1.3, 2.6] }), 1.5);
  }

  // ---------- roof: light bar, ring plate, antennas, dome ----------
  b.part(new THREE.CylinderGeometry(0.75, 0.85, 0.1, 12), darkPaint, { ...BONE, at: [0, 2.58, 2.3] }); // turret seat
  b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.03, 12), P.trim, { ...BONE, at: [0, 2.64, 2.3] });
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 12), P.hullDark, { ...BONE, at: [0, 2.66, 2.3] });
  b.part(new THREE.BoxGeometry(1.8, 0.1, 0.22), P.hullDark, { ...BONE, at: [0, 2.58, 1.7] });
  for (let i = 0; i < 6; i++)
    glow(
      b.part(new THREE.BoxGeometry(0.28, 0.1, 0.18), i % 2 ? P.neonMagenta : P.neonCyan, {
        ...BONE,
        at: [-0.72 + i * 0.288, 2.68, 1.7],
      }),
      1.8,
    );
  b.part(new THREE.SphereGeometry(0.17, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), bare, { ...BONE, at: [0.9, 2.55, 2.0] });
  for (const [x, z, h] of [[-1.1, 1.6, 1.1], [1.15, 1.55, 0.7]] as number[][]) {
    b.rod([x, 2.5, z], [x, 2.5 + h, z], [0.02, 0.008], { ...BONE, color: P.metalBare });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), P.warnRed, { ...BONE, at: [x, 2.5 + h, z] });
  }
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.warnRed, { ...BONE, at: [-1.1, 3.6, 1.6] }), 2);
  // roof vents
  for (let i = 0; i < 3; i++) b.part(new THREE.BoxGeometry(0.4, 0.05, 0.08), P.trimDark, { ...BONE, at: [-0.9, 2.52, 2.8 + i * 0.12] });

  // ---------- front: grille, headlights, bull-bar ----------
  b.part(new THREE.PlaneGeometry(1.5, 0.56), "#ffffff", { ...BONE, at: [0, 1.65, 4.01], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.55, 0.3, 0.12), P.hullDark, { ...BONE, at: [s * 1.0, 1.9, 4.02] });
    glow(b.part(new THREE.BoxGeometry(0.45, 0.2, 0.06), P.lampWhite, { ...BONE, at: [s * 1.0, 1.9, 4.1] }), 2);
    glow(b.part(new THREE.BoxGeometry(0.3, 0.05, 0.05), P.neonCyan, { ...BONE, at: [s * 1.0, 1.7, 4.09] }), 1.5);
    // bull bar uprights
    b.part(new THREE.BoxGeometry(0.14, 0.7, 0.14), P.hullDark, { ...BONE, at: [s * 1.15, 1.0, 4.25] });
    b.rod([s * 1.15, 1.0, 4.25], [s * 1.35, 1.0, 3.8], 0.06, { ...BONE, color: P.hullDark });
    b.part(new THREE.SphereGeometry(0.1, 6, 4), P.warnRed, { ...BONE, at: [s * 1.38, 1.45, 3.9] });
  }
  b.part(new THREE.BoxGeometry(2.9, 0.4, 0.3), bumperPaint, { ...BONE, at: [0, 0.8, 4.2] });
  b.part(new THREE.BoxGeometry(2.4, 0.18, 0.2), P.hullDark, { ...BONE, at: [0, 1.15, 4.2] });
  b.frustumBox([0, 0.62, 4.1], [0, 0.62, 4.42], [2.4, 0.2], [1.6, 0.12], { ...BONE, color: P.hullLight });
  // ram wedge spikes
  for (const x of [-0.9, -0.3, 0.3, 0.9]) b.spike([x, 0.95, 4.35], [0, 0, 1], 0.2, 0.06, { ...BONE, color: P.metalBare });
  // tow-hook & hazard trim over windshield
  b.part(new THREE.BoxGeometry(2.9, 0.08, 0.5), P.trim, { ...BONE, at: [0, 2.68, 1.5] });
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildCargoPod({ b, J, P, M }: Ctx) {
  const body = J.body;
  const door = J.podDoor;
  const GREEN = "#35ffb0";
  const WHITE = "#ffffff";

  // ---------- helpers ----------
  const rbox = (w: number, h: number, d: number, r: number) => {
    const x = w / 2, y = h / 2;
    const s = new THREE.Shape();
    s.moveTo(-x + r, -y);
    s.lineTo(x - r, -y);
    s.quadraticCurveTo(x, -y, x, -y + r);
    s.lineTo(x, y - r);
    s.quadraticCurveTo(x, y, x - r, y);
    s.lineTo(-x + r, y);
    s.quadraticCurveTo(-x, y, -x, y - r);
    s.lineTo(-x, -y + r);
    s.quadraticCurveTo(-x, -y, -x + r, -y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 3 });
    g.translate(0, 0, -d / 2);
    return g;
  };
  const box = (w: number, h: number, d: number, color: any, at: number[], bone: any = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], bone: any = body) =>
    b.part(new THREE.PlaneGeometry(w, h), WHITE, { at, dir, axis: "z", texture: tex, bone });

  // ---------- textures ----------
  const stripes = (n: number, fg: string, bg: string) => {
    let s = `<rect width="64" height="16" fill="${bg}"/>`;
    for (let i = -2; i < n; i++) s += `<polygon points="${i * 10},16 ${i * 10 + 5},16 ${i * 10 + 21},0 ${i * 10 + 16},0" fill="${fg}"/>`;
    return svg(`<svg viewBox="0 0 64 16">${s}</svg>`, { size: 128 });
  };
  const HAZ = stripes(8, P.trim, P.trimDark);
  const text = (t: string, w: number, h: number, fg: string, bg: string, fs: number) =>
    svg(
      `<svg viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="3" fill="${bg}"/><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="2" fill="none" stroke="${fg}" stroke-width="1.5"/><text x="${w / 2}" y="${h / 2 + fs / 3}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="${fs}" fill="${fg}">${t}</text></svg>`,
      { size: 256 },
    );
  const SERIAL = text("WRD-4471-Ω", 100, 40, P.hullDark, P.podShell, 14);
  const BIO = text("BIOHAZARD", 100, 40, P.warnRed, P.podShell, 15);
  const PRIO = text("PRIORITY 警", 100, 40, P.trim, P.hullDark, 14);
  const bioGlyph = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#20242e"/><g fill="none" stroke="#fff6d0" stroke-width="5"><circle cx="32" cy="32" r="5"/><circle cx="32" cy="18" r="9"/><circle cx="20" cy="40" r="9"/><circle cx="44" cy="40" r="9"/></g></svg>`,
    { size: 128 },
  );
  const lockGlyph = svg(
    `<svg viewBox="0 0 64 64"><rect x="12" y="28" width="40" height="30" rx="4" fill="#fff6d0"/><path d="M20 28 V20 a12 12 0 0 1 24 0 V28" fill="none" stroke="#fff6d0" stroke-width="6"/><circle cx="32" cy="41" r="5" fill="#20242e"/><rect x="30" y="41" width="4" height="10" fill="#20242e"/></svg>`,
    { size: 128 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06231f"/><polyline points="3,30 12,22 20,26 30,10 40,18 50,8 61,14" fill="none" stroke="#35ffb0" stroke-width="2.5"/><rect x="4" y="4" width="24" height="4" fill="#2ff3ff"/><rect x="4" y="34" width="40" height="2" fill="#35ffb0"/><circle cx="56" cy="32" r="3" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#20242e"/>${[4, 10, 16, 22].map((y) => `<rect x="3" y="${y}" width="26" height="3.5" fill="#5b6578"/>`).join("")}</svg>`,
    { size: 64 },
  );
  const DOORTEX = svg(
    `<svg viewBox="0 0 40 64"><rect width="40" height="64" fill="#7d8596"/><rect x="3" y="3" width="34" height="58" fill="none" stroke="#20242e" stroke-width="2"/><rect x="3" y="46" width="34" height="8" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5].map((i) => `<polygon points="${3 + i * 6},54 ${6 + i * 6},54 ${9 + i * 6},46 ${6 + i * 6},46" fill="#2a2a2a"/>`).join("")}<circle cx="20" cy="22" r="6" fill="none" stroke="#e0262f" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  // ---------- shell ----------
  const CY = 2.2, H = 1.6, W = 2.7, ZC = -2.2, L = 3.76;
  const shellPaint = panelled(P.podShell, { size: 0.62, aspect: 0.8, rivets: 0.1, seam: P.podDark });
  b.part(rbox(W, H, L, 0.34), shellPaint, { at: [0, CY, ZC], bone: body, name: "podShell" });
  // end caps
  for (const z of [-0.34, -4.06]) {
    b.part(rbox(W + 0.05, H + 0.05, 0.12, 0.36), P.podDark, { at: [0, CY, z], bone: body });
  }
  // front nose plate with red/white status
  box(1.2, 0.5, 0.04, P.hullDark, [0, CY + 0.2, -0.27]);
  glow(box(0.9, 0.08, 0.03, P.neonCyan, [0, CY + 0.2, -0.24]), 1.2);

  // saddles / cradles on the deck
  for (const z of [-0.9, -2.2, -3.5]) {
    box(2.5, 0.12, 0.4, P.hullDark, [0, 1.36, z]);
    for (const s of [1, -1]) box(0.14, 0.18, 0.4, P.hullLight, [s * 1.2, 1.44, z]);
  }

  // ---------- straps, buckles, clamps ----------
  const strapZ = [-0.85, -1.5, -2.9, -3.55];
  for (const z of strapZ) {
    box(0.26, 0.04, 0.0 + 0.26, P.strap, [0, CY + H / 2 + 0.02, z]).mesh.scale.set(10.4, 1, 1); // top band along x
    for (const s of [1, -1]) {
      box(0.04, H - 0.5, 0.26, P.strap, [s * (W / 2 + 0.02), CY, z]);
      // corner clamps
      for (const sy of [1, -1]) {
        box(0.12, 0.3, 0.34, P.hullDark, [s * (W / 2 - 0.02), CY + sy * (H / 2 - 0.12), z]);
        box(0.3, 0.12, 0.34, P.hullDark, [s * (W / 2 - 0.18), CY + sy * (H / 2 + 0.0), z]);
      }
      // ratchet buckle
      box(0.07, 0.24, 0.18, P.metalBare, [s * (W / 2 + 0.06), CY + 0.15, z]);
      box(0.05, 0.05, 0.2, P.hullDark, [s * (W / 2 + 0.1), CY + 0.28, z]);
      box(0.04, 0.2, 0.05, P.trimDark, [s * (W / 2 + 0.11), CY + 0.1, z + 0.06]);
    }
  }

  // ---------- magenta seal-lock band ----------
  const BZ = -2.2;
  glow(box(W * 0 + 0.3, 0.05, 0.3, P.neonMagenta, [0, CY + H / 2 + 0.025, BZ]), 1.6).mesh.scale.set(9, 1, 1);
  for (const s of [1, -1]) {
    glow(box(0.05, H - 0.5, 0.3, P.neonMagenta, [s * (W / 2 + 0.025), CY, BZ]), 1.6);
    plane(0.28, 0.28, lockGlyph, [s * (W / 2 + 0.055), CY + 0.35, BZ], [s, 0, 0]);
    plane(0.28, 0.28, bioGlyph, [s * (W / 2 + 0.055), CY - 0.25, BZ], [s, 0, 0]);
    // side decals
    plane(0.62, 0.25, SERIAL, [s * (W / 2 + 0.012), CY - 0.45, -1.78], [s, 0, 0]);
    plane(0.62, 0.25, BIO, [s * (W / 2 + 0.012), CY + 0.5, -1.15], [s, 0, 0]);
    plane(0.62, 0.25, PRIO, [s * (W / 2 + 0.012), CY + 0.5, -2.62], [s, 0, 0]);
    plane(0.62, 0.1, HAZ, [s * (W / 2 + 0.012), CY - 0.7, -2.62], [s, 0, 0]);
    plane(0.62, 0.1, HAZ, [s * (W / 2 + 0.012), CY - 0.7, -1.15], [s, 0, 0]);
    // status screens
    box(0.7, 0.4, 0.04, P.hullDark, [s * (W / 2 + 0.01), CY + 0.1, -3.22]);
    glow(plane(0.6, 0.32, SCREEN, [s * (W / 2 + 0.04), CY + 0.1, -3.22], [s, 0, 0]), 1.3);
    // tie-down rings on lower sides
    for (const z of [-0.6, -3.8]) {
      b.part(new THREE.TorusGeometry(0.1, 0.025, 5, 8), P.metalBare, {
        at: [s * (W / 2 + 0.03), CY - 0.55, z],
        dir: [s, 0, 0],
        axis: "z",
        bone: body,
      });
      box(0.06, 0.12, 0.08, P.hullDark, [s * (W / 2 + 0.01), CY - 0.45, z]);
    }
    // skirt neon at pod base
    glow(box(0.04, 0.04, 3.2, P.neonCyan, [s * (W / 2 + 0.02), CY - H / 2 + 0.1, ZC]), 1.2);
  }

  // ---------- roof details ----------
  const RY = CY + H / 2;
  for (const z of [-1.2, -3.2]) {
    for (const x of [-0.7, 0.7]) {
      box(0.5, 0.06, 0.45, P.hullDark, [x, RY + 0.03, z]);
      b.part(new THREE.PlaneGeometry(0.42, 0.37), WHITE, { at: [x, RY + 0.065, z], dir: [0, 1, 0], axis: "z", texture: VENT, bone: body });
    }
  }
  for (const x of [-1, 1]) {
    for (const z of [-0.6, -3.8]) {
      b.part(new THREE.TorusGeometry(0.09, 0.022, 5, 8), P.metalBare, { at: [x * 1.0, RY + 0.03, z], dir: [0, 1, 0], axis: "z", bone: body });
    }
  }
  // roof hazard stripe down the spine
  b.part(new THREE.PlaneGeometry(0.5, 0.2), WHITE, { at: [0, RY + 0.005, -2.2], dir: [0, 1, 0], axis: "z", texture: HAZ, bone: body, rotation: [0, 0, 0] });
  // sensor mast
  box(0.14, 0.05, 0.14, P.hullDark, [0.9, RY + 0.025, -3.7]);
  b.rod([0.9, RY + 0.03, -3.7], [0.9, RY + 0.19, -3.7], 0.018, P.metalBare, { bone: body });
  b.part(new THREE.OctahedronGeometry(0.045, 0), P.hullLight, { at: [0.9, RY + 0.2, -3.7], bone: body });
  glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.neonCyan, { at: [0.9, RY + 0.25 - 0.02, -3.66], bone: body }), 2);

  // ---------- rear double door (on podDoor) ----------
  const DZ = -4.15;
  for (const s of [1, -1]) {
    const x = s * 0.66;
    b.part(new THREE.BoxGeometry(1.3, 1.4, 0.08), P.hull, { at: [x, CY, DZ], bone: door });
    b.part(new THREE.PlaneGeometry(1.1, 1.2), WHITE, { at: [x, CY, DZ - 0.042], dir: [0, 0, -1], axis: "z", texture: DOORTEX, bone: door });
    // hinges
    for (const y of [CY - 0.5, CY + 0.5]) b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), P.metalBare, { at: [s * 1.33, y, DZ + 0.01], bone: door });
  }
  box(0.06, 1.4, 0.1, P.hullDark, [0, CY, DZ - 0.01], door);
  // glowing lock bars
  glow(b.part(new THREE.BoxGeometry(2.3, 0.07, 0.03), P.neonMagenta, { at: [0, CY + 0.35, DZ - 0.055], bone: door }), 1.6);
  glow(b.part(new THREE.BoxGeometry(2.3, 0.07, 0.03), P.neonMagenta, { at: [0, CY - 0.45, DZ - 0.055], bone: door }), 1.6);
  for (const s of [1, -1]) box(0.12, 0.2, 0.06, P.hullDark, [s * 0.18, CY - 0.05, DZ - 0.07], door);
  // red warning lamp + housing
  box(0.3, 0.14, 0.1, P.hullDark, [0, CY + 0.82, -4.12]);
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.warnRed, { at: [0, CY + 0.82, -4.19], bone: body }), 2);
  for (const s of [1, -1]) glow(box(0.1, 0.05, 0.03, P.warnRed, [s * 0.5, CY + 0.82, -4.17]), 1.5);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, catmull } from "agentic-3js-builder";
import { coil, metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const TAIL = "#ff3050";
  const STEEL = "#6d7587";
  const BOLT = "#b9c0cf";
  type V = [number, number, number];

  const bx = (size: V, color: any, at: V, o: any = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone: body, at, ...o });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: V, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), color, { bone: body, at, ...o });

  // ---------- paints ----------
  const DECK = panelled(P.hull, { size: 0.45, aspect: 0.8, rivets: 0.07 });
  const SKIRT = panelled(P.hullDark, { size: 0.3, aspect: 0.6, rivets: 0.05 });
  const RAIL = paint((p, n) => {
    const lit = n.y > 0.5 ? 1.15 : n.y < -0.5 ? 0.7 : 0.95;
    const base = [0x2c, 0x32, 0x3e].map((v) => (v * lit) / 255);
    const grime = Math.max(0, 0.5 - p.y) * 0.4;
    return [base[0] * (1 - grime), base[1] * (1 - grime), base[2] * (1 - grime)] as [number, number, number];
  });
  const AXLE = metal("iron", { tarnish: 0.5 });
  const SPRING = metal("steel", { polish: 0.2 });
  const TANK = metal("copper", { tarnish: 0.6, verdigris: 0.2 });

  // ---------- textures ----------
  let hz = "";
  for (let i = -2; i < 40; i++) hz += `<path d="M${i * 8} 10 L${i * 8 + 5} 0 L${i * 8 + 9} 0 L${i * 8 + 4} 10Z" fill="#e7b814"/>`;
  const HAZARD = svg(
    `<svg viewBox="0 0 150 10" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="10" fill="#2a2a2a"/>${hz}</svg>`,
    { size: 512 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="24" rx="3" fill="#20242e"/>
     <rect x="2" y="2" width="116" height="20" rx="2" fill="none" stroke="#e7b814" stroke-width="1.2"/>
     <text x="30" y="16" font-family="monospace" font-weight="bold" font-size="11" fill="#e7b814">WDN-04-MKIV</text>
     <path d="M7 6h14M14 6v12M8 12h12M9 18l10-2M22 7v12" stroke="#2ff3ff" stroke-width="1.6" fill="none"/></svg>`,
    { size: 256 },
  );
  const BUMPHAZ = HAZARD;

  // ---------- frame rails & cross members ----------
  for (const s of [1, -1]) {
    bx([0.2, 0.42, 7.6], RAIL, [s * 0.6, 0.86, -0.3]);
    bx([0.34, 0.06, 7.6], P.hullLight, [s * 0.6, 1.07, -0.3]); // top flange
    bx([0.34, 0.06, 7.6], P.hullDark, [s * 0.6, 0.64, -0.3]); // bottom flange
    // tow hooks, front
    bx([0.16, 0.1, 0.3], P.trim, [s * 0.6, 0.78, 3.7 - 0.1]);
  }
  for (let i = 0; i < 9; i++) {
    const z = -3.7 + i * 0.9;
    bx([1.0, 0.1, 0.12], P.hullDark, [0, 0.9, z]);
  }

  // ---------- deck ----------
  bx([2.9, 0.14, 7.6], DECK, [0, 1.13, -0.3]);
  for (const s of [1, -1]) {
    bx([0.07, 0.07, 7.5], P.trim, [s * 1.43, 1.2, -0.3]);
    for (let i = 0; i < 6; i++) bx([0.1, 0.06, 0.1], P.trimDark, [s * 1.43, 1.235, -3.8 + i * 1.4]);
  }
  // pod cradle rails on deck
  for (const z of [-1.0, -2.2, -3.4]) bx([2.6, 0.06, 0.18], P.hullLight, [0, 1.23, z]);

  // ---------- axles, differentials, springs ----------
  const axles: V[] = [M.axleFront as V, M.axleMid as V, M.axleRear as V];
  for (const a of axles) {
    const z = a[2];
    b.rod([-1.25, 0.55, z], [1.25, 0.55, z], 0.09, AXLE, { bone: body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.hullDark, { bone: body, at: [0, 0.55, z], scale: [1, 0.9, 1.1] });
    cyl(0.07, 0.07, 0.04, 8, P.neonCyan, [0, 0.55, z + 0.22], { rotation: [90, 0, 0] });
    for (const s of [1, -1]) {
      const path = coil([s * 0.88, 0.64, z], [s * 0.88, 1.04, z], 0.075, 6);
      b.sweep(path, 0.014, { bone: body, color: SPRING, sides: 5 });
      cyl(0.1, 0.1, 0.04, 8, P.trimDark, [s * 0.88, 0.62, z]);
      // shock absorber
      b.rod([s * 0.7, 0.6, z + 0.14], [s * 0.7, 1.02, z + 0.14], 0.03, P.metalBare, { bone: body, sides: 6 });
      b.rod([s * 0.7, 0.6, z + 0.14], [s * 0.7, 0.78, z + 0.14], 0.045, P.trim, { bone: body, sides: 6 });
    }
  }

  // drive shaft with universal joints
  const sh: [number, number][] = [[2.9, 1.9], [1.9, 0.2], [0.2, -1.4], [-1.4, -3.1]];
  sh.forEach(([z0, z1], i) => {
    b.rod([0, 0.5 - i * 0.0, z0 - 0.2], [0, 0.5, z1 + 0.2], 0.055, STEEL, { bone: body, sides: 6 });
    b.part(new THREE.OctahedronGeometry(0.1), P.metalBare, { bone: body, at: [0, 0.5, z1] });
  });
  // cables
  const cables: [string, V[]][] = [
    [P.neonMagenta, [[0.35, 0.62, 3.2], [0.3, 0.58, 1.5], [0.38, 0.6, 0.2], [0.3, 0.57, -1.0], [0.4, 0.6, -2.2], [0.33, 0.58, -3.2]]],
    [P.neonCyan, [[-0.35, 0.62, 3.2], [-0.3, 0.57, 1.8], [-0.4, 0.6, 0.4], [-0.3, 0.56, -0.9], [-0.38, 0.6, -2.0], [-0.3, 0.58, -3.3]]],
    [P.trimDark, [[0.2, 0.7, 2.5], [0.1, 0.52, 1.0], [0.22, 0.52, -0.5], [0.12, 0.54, -2.0]]],
  ];
  for (const [c, pts] of cables) b.sweep(catmull(pts), 0.025, { bone: body, color: c, sides: 5 });

  // ---------- skirts with neon + hazard ----------
  for (const s of [1, -1]) {
    bx([0.1, 0.4, 3.1], SKIRT, [s * 1.4, 0.88, 0.75]);
    bx([0.02, 0.035, 3.0], P.neonCyan, [s * 1.455, 0.72, 0.75]);
    glow(bx([0.02, 0.035, 3.0], P.neonCyan, [s * 1.462, 0.72, 0.75]), 1.4);
    b.part(new THREE.PlaneGeometry(3.0, 0.2), "#ffffff", {
      bone: body, at: [s * 1.457, 0.95, 0.75], dir: [s, 0, 0], axis: "z", texture: HAZARD, up: [0, 1, 0],
    });
    b.part(new THREE.PlaneGeometry(0.6, 0.12), "#ffffff", {
      bone: body, at: [s * 1.457, 1.1, 1.8], dir: [s, 0, 0], axis: "z", texture: LABEL,
    });
    // rear lower skirt segment between mid and rear axle
    bx([0.08, 0.3, 0.55], SKIRT, [s * 1.38, 0.9, -2.3]);
    glow(bx([0.02, 0.03, 0.5], P.neonMagenta, [s * 1.43, 0.78, -2.3]), 1.4);
  }

  // ---------- fender arches ----------
  const arch: [number, number][] = [];
  for (let a = 0; a <= 180; a += 30) arch.push([Math.cos((a * Math.PI) / 180) * 0.76, Math.sin((a * Math.PI) / 180) * 0.76]);
  for (let a = 180; a >= 0; a -= 30) arch.push([Math.cos((a * Math.PI) / 180) * 0.64, Math.sin((a * Math.PI) / 180) * 0.64]);
  for (const a of axles)
    for (const s of [1, -1]) {
      b.extrude(arch, {
        at: [s * 1.2, 0.55, a[2]], x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.62, bevel: 0.02, color: P.hull, bone: body,
      });
      // trim lip
      b.extrude(arch.slice(0, 7), {
        at: [s * 1.2 + s * 0.325, 0.55, a[2]], x: [0, 0, 1], y: [0, 1, 0],
        thickness: 0.04, color: P.trim, bone: body,
      });
    }

  // ---------- fuel tank & battery box ----------
  cyl(0.27, 0.27, 1.4, 10, TANK, [1.0, 0.72, 0.6], { rotation: [90, 0, 0] });
  for (const z of [0.05, 1.15]) bx([0.12, 0.62, 0.1], P.hullDark, [1.0, 0.7, z]);
  cyl(0.06, 0.06, 0.08, 6, P.trim, [1.0, 1.0, 0.6]);
  bx([0.62, 0.46, 1.4], P.hullDark, [-0.98, 0.76, 0.6]);
  bx([0.64, 0.05, 1.42], P.trim, [-0.98, 0.99, 0.6]);
  for (let i = 0; i < 3; i++) glow(bx([0.04, 0.12, 0.28], P.neonCyan, [-1.3, 0.78, 0.15 + i * 0.45]), 1.3);
  for (const z of [0.0, 1.2]) for (const dx of [-0.2, 0.2]) cyl(0.04, 0.04, 0.07, 6, P.metalBare, [-0.98 + dx, 1.02, z]);

  // ---------- mud flaps ----------
  const flapZ = [axles[0][2] - 0.78, axles[1][2] + 0.66, axles[2][2] - 0.72];
  flapZ.forEach((z, i) => {
    for (const s of [1, -1]) {
      bx([0.55, 0.5, 0.04], P.rubber, [s * 1.25, 0.62, z]);
      bx([0.55, 0.06, 0.05], P.trim, [s * 1.25, 0.4, z]);
      if (i === 2) bx([0.45, 0.14, 0.05], P.hullLight, [s * 1.25, 0.7, z - 0.01]);
    }
  });

  // ---------- rear bumper, tail lights, hitch ----------
  bx([2.9, 0.34, 0.24], P.hullDark, [0, 0.62, -4.08]);
  b.part(new THREE.PlaneGeometry(2.7, 0.18), "#ffffff", {
    bone: body, at: [0, 0.62, -4.205], dir: [0, 0, -1], axis: "z", texture: BUMPHAZ,
  });
  for (const s of [1, -1]) {
    bx([0.5, 0.24, 0.1], P.hullDark, [s * 1.1, 0.98, -4.14]);
    glow(bx([0.4, 0.14, 0.06], TAIL, [s * 1.1, 0.98, -4.19]), 1.8);
    glow(bx([0.12, 0.06, 0.06], P.warnRed, [s * 0.65, 0.98, -4.19]), 1.5);
    bx([0.14, 0.3, 0.1], P.trim, [s * 1.4, 0.6, -4.1]);
  }
  // tow hitch
  bx([0.34, 0.14, 0.4], P.metalBare, [0, 0.55, -4.1]);
  cyl(0.07, 0.07, 0.14, 8, P.hullLight, [0, 0.66, -4.18]);
  b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), P.trimDark, { bone: body, at: [0, 0.52, -4.3 + 0.1], rotation: [90, 0, 0] });
  // door hinge stops on podDoor bone
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.22, 0.2, 0.08), P.trimDark, { bone: J.podDoor, at: [s * 1.1, 1.3, -4.13] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.26, 6), P.metalBare, { bone: J.podDoor, at: [s * 1.1, 1.3, -4.17], rotation: [0, 0, 90] });
  }

  // ---------- ladder step and grab rails ----------
  for (let i = 0; i < 3; i++) {
    bx([0.34, 0.04, 0.22], P.metalBare, [1.52, 0.55 + i * 0.22, 1.5]);
    bx([0.34, 0.012, 0.22], P.trimDark, [1.52, 0.575 + i * 0.22, 1.5]);
  }
  b.rod([1.5, 0.45, 1.3], [1.5, 1.15, 1.3], 0.025, P.metalBare, { bone: body, sides: 6 });
  b.rod([1.5, 0.45, 1.7], [1.5, 1.15, 1.7], 0.025, P.metalBare, { bone: body, sides: 6 });
  for (const s of [1, -1]) {
    b.rod([s * 1.48, 1.45, -0.1], [s * 1.48, 1.45, 1.0], 0.025, P.trim, { bone: body, sides: 6 });
    for (const z of [-0.1, 1.0]) b.rod([s * 1.48, 1.2, z], [s * 1.48, 1.45, z], 0.025, P.trim, { bone: body, sides: 6 });
  }
  // front deck apron, vents & warning plate near the cab joint
  bx([1.6, 0.05, 0.3], P.hullLight, [0, 1.225, 3.35]);
  for (let i = 0; i < 5; i++) bx([0.2, 0.02, 0.05], P.hullDark, [-0.5 + i * 0.25, 1.255, 3.35]);

  // ---------- jerry can & toolbox on deck rear side ----------
  bx([0.5, 0.22, 0.3], P.hullLight, [-1.15, 1.31, -3.8]);
  bx([0.5, 0.04, 0.3], P.trim, [-1.15, 1.43, -3.8]);
}
```
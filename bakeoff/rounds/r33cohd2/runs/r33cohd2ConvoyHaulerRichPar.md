<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Mk-IV",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a hooded cab, gun turret and a sealed glowing cargo pod strapped on its flatbed.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.1, 8.0],
  "layout": "Long heavy truck facing +Z. Front: angular armoured cab with sloped hood, slit windshield with cyan neon visor strip, bull bar and amber light bar. Behind the cab a roof-mounted turret. The mid and rear carry a long flat chassis deck with three axles (six wheels: front, mid, rear) with chunky faceted tyres and neon-edged wheel arches. The sealed cargo pod, a big chamfered capsule-box, sits on the deck behind the cab, held by yellow-black hazard straps and corner clamps, with magenta glowing seams and a cyan status panel. Everything is blocky and faceted with neon cyan and magenta accents against dark gunmetal plating with yellow hazard trim, decals as SVG (stripes, warning glyphs, kanji-like codes, unit number).",
  "palette": {
    "hull": "#3b4250",
    "hullDark": "#1f232c",
    "plate": "#566074",
    "trim": "#e7b814",
    "tyre": "#14151a",
    "rim": "#7b8494",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "amber": "#ffb12a",
    "glass": "#0b2a3a",
    "podShell": "#d9dde6",
    "podDark": "#2b2f3b",
    "warnRed": "#e0213a"
  },
  "mounts": {
    "deckTop": [0, 1.3, -1.0],
    "cabFloor": [0, 1.3, 2.4],
    "cabRoof": [0, 2.6, 2.2],
    "turretRing": [0, 2.6, 1.0],
    "podBase": [0, 1.3, -2.0],
    "axleFront": [0, 0.55, 2.7],
    "axleMid": [0, 0.55, -0.6],
    "axleRear": [0, 0.55, -2.9]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.3, 2.4], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "cab", "at": [0, 2.6, 1.0], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 2.95, 1.2], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "pod", "parent": "body", "at": [0, 1.3, -2.0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.55, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.55, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.3, 0.55, -0.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.3, 0.55, -0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.3, 0.55, -2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.3, 0.55, -2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Frame, flat deck slab with hazard-stripe edges, side skirts, fuel tanks, exhaust stacks, rear bumper with tail lights, underbody dark plating, deck bolt rows and tie-down rings, panelled paint on the plates, neon underglow strips (cyan) along the sides.",
      "box": [[-1.4, 0.7, -4.0], [1.4, 1.35, 2.2]],
      "attaches": "Cab starts at cabFloor; pod rests on podBase; axles hang at axleFront/axleMid/axleRear; body joint.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "wheels",
      "builds": "Six faceted chunky tyres (octagonal lathes) with tread blocks, rims with bolts and glowing cyan hub caps, wheel arch fenders with neon edge trim, axle housings and suspension springs/dampers between axle and chassis. Each wheel rides its wheel joint.",
      "box": [[-1.5, 0.0, -3.5], [1.5, 1.1, 3.3]],
      "attaches": "Wheel joints at axleFront, axleMid and axleRear lines; arches meet chassis side at y 1.0.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "cab",
      "builds": "Armoured angular cab: sloped hood and engine block with vents, slit windshield (glass colour, glowing cyan visor strip), side windows with armour shutters, roof plates, mirrors, antenna array, amber light bar and headlights (glow) on the front, bull bar with hazard stripes, door panels with unit number and warning decals as SVG textures, grille with magenta glow.",
      "box": [[-1.45, 1.3, 1.2], [1.45, 2.65, 4.0]],
      "attaches": "Sits on chassis at cabFloor; roof at cabRoof; turret base at turretRing.",
      "joints": ["cab"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "turret",
      "builds": "Roof-mounted remote gun turret: rotating ring base, faceted armoured housing, twin barrels with muzzle brakes and heat sleeves on gunPitch, ammo box and belt, sensor eye with glowing magenta lens (SVG eye decal), small antenna, hazard stripe on the ring.",
      "box": [[-0.7, 2.6, 0.2], [0.7, 3.1, 2.4]],
      "attaches": "Base ring at turretRing on the cab roof; rides turretYaw and gunPitch.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "cargoPod",
      "builds": "Sealed cargo pod: large chamfered capsule-box shell of light podShell panels with scuffed paint, dark end caps, glowing magenta seam lines, cyan status panel and biohazard/lock-style SVG decals, ID code text, hazard-striped retaining straps with ratchet buckles, four corner clamps bolted to the deck, vent grills, a tiny red warning beacon on top that glows.",
      "box": [[-1.35, 1.3, -3.9], [1.35, 2.9, -0.1]],
      "attaches": "Rests on deck at podBase; clamps meet chassis deck at deckTop; rides pod joint.",
      "joints": ["pod"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pit = J.gunPitch;
  const cx = 0;
  const baseY = M.turretRing[1];
  const GUN = "#2a2e38";

  const worn = (c: string) =>
    paint((p, n) => mix(c, "#0e1016", 0.35 * noise(p, 0.12, 4) + (n.y < 0 ? 0.2 : 0)));

  // helper: place a primitive on a bone
  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, dir });

  // ring base
  cyl(0.62, 0.68, 0.1, 12, worn(P.hullDark), [cx, baseY + 0.05, 1], yaw);
  const hazard = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#111"/>`).join("")}</svg>`,
    { size: 256 },
  );
  b.part(new THREE.CylinderGeometry(0.665, 0.665, 0.07, 16, 1, true), "#ffffff", {
    bone: yaw, at: [cx, baseY + 0.06, 1], texture: hazard,
  });
  cyl(0.5, 0.55, 0.08, 12, P.plate, [cx, baseY + 0.14, 1], yaw);

  // housing
  const hy = baseY + 0.4;
  box(0.9, 0.38, 0.9, worn(P.hull), [cx, hy, 1], yaw);
  box(0.7, 0.2, 0.8, worn(P.plate), [cx, hy + 0.27, 0.98], yaw);
  for (const s of [1, -1]) {
    box(0.1, 0.34, 0.8, worn(P.plate), [s * 0.5, hy, 1.0], yaw, [0, 0, s * 12]);
    // vents
    for (let i = 0; i < 3; i++) box(0.02, 0.04, 0.3, P.hullDark, [s * 0.57, hy + 0.05 - i * 0.07, 0.95], yaw);
    // cyan trim
    box(0.02, 0.025, 0.7, P.neonCyan, [s * 0.46, hy - 0.15, 1.0], yaw);
  }
  // front mantlet
  box(0.8, 0.32, 0.18, worn(P.hullDark), [cx, hy + 0.02, 1.5], yaw, [-8, 0, 0]);
  box(0.84, 0.05, 0.9, P.trim, [cx, hy + 0.38, 1.0], yaw);

  // sensor eye
  const eye = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#111"/><circle cx="32" cy="32" r="22" fill="#ff2fb4"/><circle cx="32" cy="32" r="12" fill="#5a0040"/><circle cx="26" cy="26" r="5" fill="#fff"/></svg>`,
    { size: 128 },
  );
  box(0.26, 0.24, 0.24, P.hullDark, [-0.2, hy + 0.5, 1.45], yaw);
  glow(
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: yaw, at: [-0.2, hy + 0.5, 1.575], dir: [0, 0, 1], axis: "z", texture: eye,
    }),
    1.4,
  );

  // antenna
  cyl(0.012, 0.018, 0.6, 5, P.rim, [0.35, hy + 0.7, 0.7], yaw);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.warnRed, { bone: yaw, at: [0.35, hy + 1.0, 0.7] }), 1.5);

  // ammo box + belt (side)
  box(0.22, 0.3, 0.36, worn("#4a5240"), [-0.62, hy - 0.05, 0.85], yaw);
  box(0.23, 0.05, 0.1, P.trim, [-0.62, hy + 0.13, 0.85], yaw);
  for (let i = 0; i < 5; i++)
    box(0.04, 0.05, 0.06, P.trim, [-0.5 + i * 0.0, hy - 0.05 + i * 0.045, 1.0 + i * 0.09], yaw, [0, 0, 0]);

  // gun cradle on pitch bone
  const gy = hy + 0.02;
  cyl(0.1, 0.1, 1.0, 8, GUN, [cx, gy, 1.5], pit, [1, 0, 0]);
  for (const s of [1, -1]) {
    const x = s * 0.2;
    cyl(0.06, 0.06, 0.95, 8, GUN, [x, gy, 1.95], pit, [0, 0, 1]);
    cyl(0.1, 0.1, 0.4, 8, P.hullDark, [x, gy, 1.75], pit, [0, 0, 1]);
    for (let i = 0; i < 3; i++) cyl(0.105, 0.105, 0.015, 8, P.amber, [x, gy, 1.65 + i * 0.1], pit, [0, 0, 1]);
    cyl(0.085, 0.085, 0.14, 6, P.plate, [x, gy, 2.38], pit, [0, 0, 1]);
    box(0.02, 0.1, 0.1, P.hullDark, [x, gy + 0.08, 2.38], pit);
    box(0.1, 0.02, 0.1, P.hullDark, [x + 0.0, gy, 2.38], pit);
  }
  box(0.2, 0.2, 0.1, GUN, [cx, gy, 1.55], pit);
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55; // tyre radius
  const W = 0.42; // tyre width
  const DARKMETAL = "#2a2e38";
  const SPRING = "#9aa3b5";

  const tyrePaint = paint((p, n) => {
    const v = noise(p, 0.08, 4);
    return mix("#101116", "#23252d", v * 0.8 + (n.y > 0.5 ? 0.15 : 0));
  });
  const plateTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 8} 16 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 16Z" fill="#14151a"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const hubTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#06323a"/><circle cx="16" cy="16" r="11" fill="#2ff3ff"/><path d="M16 5 L19 16 L16 27 L13 16Z M5 16 L16 13 L27 16 L16 19Z" fill="#e8ffff"/><circle cx="16" cy="16" r="3" fill="#06323a"/></svg>`,
    { size: 128 },
  );

  const wheels = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleMid[2]],
    ["wheelMR", -1, M.axleMid[2]],
    ["wheelRL", 1, M.axleRear[2]],
    ["wheelRR", -1, M.axleRear[2]],
  ] as const;

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const x = 1.3 * s;
    const out = [s, 0, 0];
    // tyre: octagonal lathe, axis along X
    b.lathe(
      [
        [0.3, -W / 2],
        [R - 0.06, -W / 2],
        [R, -W / 2 + 0.07],
        [R, W / 2 - 0.07],
        [R - 0.06, W / 2],
        [0.3, W / 2],
      ],
      { at: [x, R, z], axis: out, segments: 8, bone: j, color: tyrePaint },
    );
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.part(new THREE.BoxGeometry(W * 0.9, 0.05, 0.16), P.tyre, {
        bone: j,
        at: [x, R + Math.cos(a) * (R + 0.01), z + Math.sin(a) * (R + 0.01)],
        rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
    // rim disc
    b.lathe(
      [
        [0, -0.04],
        [0.31, -0.04],
        [0.31, 0.04],
        [0, 0.06],
      ],
      { at: [x + s * (W / 2 - 0.02), R, z], axis: out, segments: 8, bone: j, color: P.rim },
    );
    // bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), DARKMETAL, {
        bone: j,
        at: [x + s * (W / 2 + 0.03), R + Math.cos(a) * 0.2, z + Math.sin(a) * 0.2],
        dir: out,
      });
    }
    // glowing hub cap
    glow(
      b.part(new THREE.CircleGeometry(0.12, 12), "#ffffff", {
        bone: j,
        at: [x + s * (W / 2 + 0.055), R, z],
        dir: out,
        axis: "z",
        texture: hubTex,
      }),
      1.2,
    );

    // arch fender (half-ring lathe shell above the wheel) on body
    b.part(new THREE.BoxGeometry(0.5, 0.08, 1.3), P.hull, {
      bone: J.body,
      at: [x - s * 0.02, R + 0.66, z],
    });
    for (const k of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.5, 0.45, 0.08), P.hullDark, {
        bone: J.body,
        at: [x - s * 0.02, R + 0.45, z + k * 0.62],
        rotation: [k * 18, 0, 0],
      });
    }
    // neon edge trim on the arch
    glow(
      b.part(new THREE.BoxGeometry(0.06, 0.05, 1.3), P.neonCyan, {
        bone: J.body,
        at: [x + s * 0.24, R + 0.68, z],
      }),
      1.3,
    );
    b.part(new THREE.BoxGeometry(0.5, 0.04, 1.3), "#ffffff", {
      bone: J.body,
      at: [x - s * 0.02, R + 0.71, z],
      texture: plateTex,
      dir: [0, 1, 0],
      axis: "z",
      scale: [1, 1, 1],
    });
  }

  // axle housings, differentials, springs and dampers per axle
  for (const [axName, zz] of [
    ["f", M.axleFront[2]],
    ["m", M.axleMid[2]],
    ["r", M.axleRear[2]],
  ] as [string, number][]) {
    b.rod([-1.15, R, zz], [1.15, R, zz], 0.09, DARKMETAL, { bone: J.body });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.plate, {
      bone: J.body,
      at: [0, R, zz],
      scale: [1, 0.9, 1.1],
    });
    for (const s of [1, -1]) {
      const xs = s * 0.85;
      b.rod([xs, R + 0.1, zz], [xs, 0.85, zz], 0.035, SPRING, { bone: J.body, sides: 6 });
      for (let i = 0; i < 5; i++) {
        b.part(new THREE.TorusGeometry(0.075, 0.015, 4, 8), SPRING, {
          bone: J.body,
          at: [xs, R + 0.2 + i * 0.1, zz],
          rotation: [90, 0, 0],
        });
      }
      b.rod([xs + s * 0.14, R + 0.1, zz + 0.1], [xs + s * 0.14, 0.95, zz + 0.1], 0.03, P.trim, { bone: J.body, sides: 6 });
      b.part(new THREE.BoxGeometry(0.14, 0.05, 0.14), P.hullDark, { bone: J.body, at: [xs, 0.9, zz] });
    }
    // glowing lamp on diff
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: J.body, at: [0, R - 0.1, zz + 0.2] }), 1.2);
  }
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...extra });

  const plateP = panelled(P.plate, { size: 0.5, rivets: 0.08 });
  const darkP = paint((p: any, n: any) => mix(P.hullDark, "#2c313c", noise(p, 0.3, 3) * 0.8 + 0.1 * n.y));

  // frame rails and underbody
  for (const s of [1, -1]) {
    box(0.22, 0.28, 6.0, P.hullDark, s * 0.8, 0.84, -0.9);
    box(0.1, 0.1, 5.8, P.neonCyan, s * 1.34, 0.76, -0.9, { });
  }
  glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 5.6), P.neonCyan, { bone, at: [1.38, 0.78, -0.9] }), 1.6);
  glow(b.part(new THREE.BoxGeometry(0.06, 0.06, 5.6), P.neonCyan, { bone, at: [-1.38, 0.78, -0.9] }), 1.6);
  box(2.4, 0.14, 6.0, darkP, 0, 0.74, -0.9);
  for (let i = 0; i < 7; i++) box(2.2, 0.12, 0.12, P.hullDark, 0, 0.92, -3.6 + i * 0.85);

  // deck slab
  box(2.8, 0.14, 6.2, plateP, 0, 1.28, -0.9);
  box(2.9, 0.1, 6.3, P.hull, 0, 1.2, -0.9);

  // hazard edge stripes
  const haz = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/><g fill="#14151a"><path d="M0 8L8 0H16L8 8Z"/><path d="M16 8L24 0H32L24 8Z"/><path d="M32 8L40 0H48L40 8Z"/><path d="M48 8L56 0H64L56 8Z"/></g></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(6.1, 0.1), "#ffffff", { bone, at: [s * 1.43, 1.2, -0.9], dir: [s, 0, 0], axis: "z", texture: haz });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 6.2), P.trim, { bone, at: [s * 1.2, 1.36, -0.9] });
    b.part(new THREE.BoxGeometry(0.06, 0.04, 6.2), P.trim, { bone, at: [s * 1.36, 1.36, -0.9] });
  }

  // side skirts
  for (const s of [1, -1]) {
    box(0.1, 0.32, 5.4, plateP, s * 1.42, 0.98, -1.1);
    box(0.14, 0.06, 5.4, P.hullDark, s * 1.42, 0.8, -1.1);
  }

  // bolts and tie-down rings
  const bolts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 16; i++) bolts.push(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6).translate(s * 1.28, 1.365, -3.8 + i * 0.37));
  for (let i = 0; i < 16; i++) bolts.push(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6).translate(0, 1.365, -3.8 + i * 0.37));
  const merged = (await_free(bolts));
  function await_free(g: THREE.BufferGeometry[]) {
    const pos: number[] = [];
    const idx: number[] = [];
    let off = 0;
    for (const x of g) {
      const p = x.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      const ix = x.index!;
      for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setIndex(idx);
    m.computeVertexNormals();
    return m;
  }
  b.part(merged, P.rim, { bone, at: [0, 0, 0] });
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      b.part(new THREE.TorusGeometry(0.08, 0.018, 5, 8), P.rim, { bone, at: [s * 1.3, 1.37, -3.6 + i * 1.6], rotation: [90, 0, 0] });

  // fuel tanks
  for (const s of [1, -1]) {
    cyl(0.3, 0.3, 1.5, 8, metal("steel"), [s * 1.0, 0.82, 1.2], { rotation: [90, 0, 0] });
    for (const z of [0.6, 1.8]) box(0.1, 0.5, 0.08, P.hullDark, s * 1.0, 0.82, z);
    cyl(0.31, 0.31, 0.12, 8, P.trim, [s * 1.0, 0.82, 1.2], { rotation: [90, 0, 0] });
    cyl(0.12, 0.12, 0.06, 6, P.warnRed, [s * 1.0, 1.1, 1.2]);
  }

  // exhaust stacks behind cab
  for (const s of [1, -1]) {
    cyl(0.08, 0.1, 1.5, 8, metal("iron"), [s * 1.3, 1.9, 1.05]);
    cyl(0.11, 0.11, 0.12, 8, P.rim, [s * 1.3, 2.65, 1.05]);
    cyl(0.12, 0.12, 0.1, 8, P.trim, [s * 1.3, 1.55, 1.05]);
    box(0.05, 1.4, 0.05, P.hullDark, s * 1.3, 1.9, 0.9);
  }

  // rear bumper and tail lights
  box(2.9, 0.34, 0.3, P.hull, 0, 0.98, -4.0);
  b.part(new THREE.PlaneGeometry(2.8, 0.22), "#ffffff", { bone, at: [0, 0.98, -4.17], dir: [0, 0, -1], axis: "z", texture: haz });
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.08, P.warnRed, s * 1.0, 1.2, -4.05), 1.8);
    box(0.5, 0.26, 0.04, P.hullDark, s * 1.0, 1.2, -4.0);
    glow(box(0.2, 0.08, 0.06, P.amber, s * 0.5, 1.2, -4.07), 1.4);
  }
  box(0.5, 0.2, 0.1, P.rim, 0, 0.8, -4.1);
  glow(box(1.0, 0.04, 0.06, P.neonMagenta, 0, 1.12, -4.17), 1.5);

  // front crossmember at cab
  box(2.6, 0.26, 0.3, P.hullDark, 0, 0.9, 2.1);
  // ladder rungs / steps
  for (const s of [1, -1]) for (let i = 0; i < 2; i++) box(0.3, 0.04, 0.3, P.rim, s * 1.5, 0.95 + i * 0.2, 1.85);
  // deck ribs
  for (let i = 0; i < 5; i++) box(2.2, 0.03, 0.06, P.hullDark, 0, 1.36, -3.0 + i * 1.0 + R() * 0.02);
  // pod mount pads
  for (const s of [1, -1]) for (const z of [-3.6, -0.4]) box(0.3, 0.05, 0.3, P.trim, s * 1.1, 1.37, z);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, glow } from "agentic-3js-builder";
import { glow as glowKit } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.cab;
  const G = glowKit;
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true, ...extra });

  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.plate, smoothstep(0.3, 0.9, noise(p, 0.25, 3)) * 0.6);
    const lit = mix(base, P.hullDark, smoothstep(0.2, -0.9, n.y) * 0.5);
    return mix(lit, "#ffffff", smoothstep(0.7, 1, n.y) * 0.08);
  });
  const plated = panelled(hullPaint, { size: 0.4, rivets: 0.1, seam: P.hullDark });

  // main cab body (rear part)
  box(2.8, 1.0, 1.7, plated, [0, 1.8, 2.05]);
  // roof plate sloped
  box(2.6, 0.12, 1.5, P.plate, [0, 2.36, 2.0]);
  box(2.9, 0.08, 1.8, P.hullDark, [0, 2.3, 2.05]);
  // upper cabin tapered (front slope)
  box(2.6, 0.12, 1.2, plated, [0, 2.2, 2.95], [-28, 0, 0]);
  // hood and engine block
  box(2.7, 0.7, 1.5, plated, [0, 1.65, 3.2]);
  box(2.4, 0.12, 1.4, P.plate, [0, 2.0, 3.25], [8, 0, 0]);
  // fenders
  for (const s of [1, -1]) {
    box(0.3, 0.5, 1.5, P.hullDark, [s * 1.38, 1.6, 3.2]);
    box(0.06, 0.06, 1.5, P.neonCyan, [s * 1.54, 1.38, 3.2]);
    G(b.part(new THREE.BoxGeometry(0.06, 0.06, 1.5), P.neonCyan, { bone, at: [s * 1.54, 1.38, 3.2], flat: true }), 1.4);
  }

  // hood vents
  for (let i = 0; i < 5; i++) box(0.9, 0.03, 0.06, P.hullDark, [0, 2.07, 2.8 + i * 0.16], [8, 0, 0]);
  for (const s of [1, -1]) for (let i = 0; i < 4; i++) box(0.04, 0.3, 0.05, P.hullDark, [s * 1.4, 1.75, 3.0 + i * 0.1]);

  // windshield slit
  const glass = box(2.0, 0.28, 0.06, P.glass, [0, 2.15, 2.83], [-28, 0, 0]);
  G(b.part(new THREE.BoxGeometry(2.0, 0.05, 0.07), P.neonCyan, { bone, at: [0, 2.31, 2.86], rotation: [-28, 0, 0], flat: true }), 1.6);
  // shutter side windows
  const winTex = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#0b2a3a"/><g stroke="#1f232c" stroke-width="3">${[4,10,16,22,28].map(y=>`<path d="M0 ${y}H64"/>`).join("")}</g><rect x="0" y="0" width="64" height="32" fill="none" stroke="#2ff3ff" stroke-width="2"/></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.0, 0.4), "#ffffff", { bone, at: [s * 1.425, 2.0, 2.0], dir: [s, 0, 0], axis: "z", texture: winTex });
  }

  // door decals
  const unit = svg(`<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#1f232c" stroke="#e7b814" stroke-width="3"/><text x="32" y="44" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="30" fill="#2ff3ff">07</text></svg>`, { size: 128 });
  const warn = svg(`<svg viewBox="0 0 64 64"><path d="M32 6 L60 56 H4Z" fill="#e7b814" stroke="#1f232c" stroke-width="4"/><rect x="29" y="22" width="6" height="18" fill="#1f232c"/><rect x="29" y="44" width="6" height="6" fill="#1f232c"/></svg>`, { size: 128 });
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", { bone, at: [s * 1.425, 1.62, 1.75], dir: [s, 0, 0], axis: "z", texture: unit });
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone, at: [s * 1.425, 1.55, 2.4], dir: [s, 0, 0], axis: "z", texture: warn });
  }

  // grille front
  const grille = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#1f232c"/>${[3,9,15,21,27].map(y=>`<rect x="4" y="${y}" width="56" height="3" fill="#ff2fb4"/>`).join("")}</svg>`, { size: 128 });
  G(b.part(new THREE.PlaneGeometry(1.8, 0.5), "#ffffff", { bone, at: [0, 1.62, 3.96], dir: [0, 0, 1], axis: "z", texture: grille }), 1.2);

  // headlights
  for (const s of [1, -1]) {
    G(box(0.4, 0.2, 0.08, "#fff6d0", [s * 1.0, 1.98, 3.96]), 1.8);
    box(0.5, 0.28, 0.05, P.hullDark, [s * 1.0, 1.98, 3.94]);
  }
  // amber light bar on roof front
  box(1.8, 0.12, 0.2, P.hullDark, [0, 2.46, 2.55]);
  for (let i = 0; i < 6; i++) G(box(0.24, 0.08, 0.1, P.amber, [-0.75 + i * 0.3, 2.47, 2.66]), 1.6);

  // bull bar with hazard stripes
  const haz = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#e7b814"/><path d="M0 8L8 0H16L0 16ZM0 24L24 0H32L0 32ZM16 32L32 16V24L24 32Z" fill="#14151a"/></svg>`, { size: 64 });
  b.part(new THREE.BoxGeometry(2.8, 0.3, 0.2), "#ffffff", { bone, at: [0, 1.42, 4.05], texture: haz, flat: true });
  for (const s of [1, -1]) {
    box(0.14, 0.9, 0.14, P.hullDark, [s * 1.1, 1.75, 4.05]);
    box(0.12, 0.12, 0.7, P.hullDark, [s * 1.1, 1.42, 3.75]);
  }
  box(2.4, 0.12, 0.14, P.plate, [0, 1.95, 4.05]);

  // mirrors
  for (const s of [1, -1]) {
    box(0.4, 0.04, 0.04, P.hullDark, [s * 1.65, 2.1, 2.9]);
    box(0.08, 0.38, 0.22, P.hullDark, [s * 1.85, 2.0, 2.9]);
  }

  // antenna array
  for (const [x, h] of [[-1.1, 0.8], [-0.9, 0.5], [1.1, 0.65]] as number[][]) {
    b.rod([x, 2.4, 1.5], [x, 2.4 + h, 1.5], 0.015, P.hullDark, { bone });
    G(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.neonMagenta, { bone, at: [x, 2.4 + h, 1.5] }), 2);
  }
  // roof plates and turret seat
  box(1.1, 0.06, 0.9, P.plate, [0, 2.4, 1.6]);
  b.part(new THREE.CylinderGeometry(0.55, 0.62, 0.1, 8), P.hullDark, { bone, at: [0, 2.5, 1.2], flat: true });
  // neon trim lines
  G(box(2.82, 0.04, 0.04, P.neonMagenta, [0, 1.32, 3.98]), 1.5);
  G(box(0.04, 0.04, 1.7, P.neonCyan, [1.43, 1.35, 2.05]), 1.4);
  G(box(0.04, 0.04, 1.7, P.neonCyan, [-1.43, 1.35, 2.05]), 1.4);
  // rear armoured back panel
  box(2.6, 0.9, 0.1, P.hullDark, [0, 1.85, 1.22]);
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P, M }: Ctx) {
  const bone = J.pod;
  const X0 = 1.35, Z0 = -3.9, Z1 = -0.1, Y0 = 1.3, Y1 = 2.9;
  const cz = (Z0 + Z1) / 2;
  const R = rng(5);

  const shell = paint((p, n) => {
    const base: [number, number, number] = [0.85, 0.87, 0.9];
    const scuff = smoothstep(0.55, 0.8, noise(p, 0.12, 3));
    const grime = smoothstep(0.6, -0.8, n.y) * 0.25;
    let c = mix(base, "#8a8f9c", scuff * 0.5);
    c = mix(c, "#2b2f3b", grime);
    // panel seams
    const sx = Math.abs(((p.z + 10) % 0.95) - 0.475);
    if (sx > 0.465) c = mix(c, "#2b2f3b", 0.6);
    return c;
  });

  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...opts });

  // main shell: chamfered via octagonal cross-section sweep
  const body = b.loft(
    [
      { at: [0, 2.1, Z0 + 0.25], w: 2.3, h: 1.35 },
      { at: [0, 2.1, Z0 + 0.45], w: 2.7, h: 1.6 },
      { at: [0, 2.1, Z1 - 0.45], w: 2.7, h: 1.6 },
      { at: [0, 2.1, Z1 - 0.25], w: 2.3, h: 1.35 },
    ],
    { bone, color: shell },
  );

  // end caps
  for (const [z, s] of [[Z0, -1], [Z1, 1]] as [number, number][]) {
    b.part(new THREE.CylinderGeometry(0.62, 0.78, 0.3, 8), P.podDark, {
      bone, at: [0, 2.1, z + s * -0.1], dir: [0, 0, 1], flat: true,
    });
    b.part(new THREE.BoxGeometry(2.0, 1.1, 0.12), P.podDark, { bone, at: [0, 2.1, z + s * -0.02], flat: true });
  }

  // magenta glowing seams
  for (const z of [-3.2, -2.0, -0.8]) {
    for (const s of [1, -1]) {
      glow(box(0.04, 1.2, 0.06, P.neonMagenta, [s * 1.36, 2.1, z]), 1.6);
    }
    glow(box(2.2, 0.04, 0.06, P.neonMagenta, [0, 2.915 - 0.0, z]), 1.6);
  }
  // roofline magenta rails
  for (const s of [1, -1]) glow(box(0.05, 0.05, 3.2, P.neonMagenta, [s * 1.0, 2.9, cz]), 1.6);

  // lower skirt dark plate
  box(2.5, 0.12, 3.5, P.podDark, [0, 1.36, cz]);

  // decals
  const warn = svg(
    `<svg viewBox="0 0 100 100"><polygon points="50,6 96,90 4,90" fill="#e7b814" stroke="#14151a" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="50" cy="60" r="8" fill="none" stroke="#14151a" stroke-width="5"/>
    <path d="M50 52 L50 30 M43 64 L26 74 M57 64 L74 74" stroke="#14151a" stroke-width="6" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const lock = svg(
    `<svg viewBox="0 0 100 100"><rect x="22" y="44" width="56" height="42" rx="6" fill="#ff2fb4" stroke="#2b2f3b" stroke-width="6"/>
    <path d="M34 44 V32 A16 16 0 0 1 66 32 V44" fill="none" stroke="#2b2f3b" stroke-width="8"/>
    <circle cx="50" cy="62" r="6" fill="#2b2f3b"/><rect x="47" y="62" width="6" height="14" fill="#2b2f3b"/></svg>`,
    { size: 128 },
  );
  const code = svg(
    `<svg viewBox="0 0 240 80"><rect width="240" height="80" fill="none"/>
    <text x="8" y="40" font-family="monospace" font-weight="bold" font-size="34" fill="#2b2f3b">CP-0417</text>
    <text x="8" y="70" font-family="monospace" font-size="24" fill="#e0213a">貨物 危険 封</text></svg>`,
    { size: 256 },
  );
  const panelTex = svg(
    `<svg viewBox="0 0 120 80"><rect width="120" height="80" rx="6" fill="#06222c" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M10 56 L30 40 L50 50 L72 24 L108 34" fill="none" stroke="#2ff3ff" stroke-width="4"/>
    <rect x="10" y="10" width="40" height="8" fill="#2ff3ff"/><rect x="60" y="10" width="20" height="8" fill="#ff2fb4"/>
    <circle cx="104" cy="14" r="6" fill="#4dff88"/></svg>`,
    { size: 192 },
  );
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], tint = "#ffffff") =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone, at, dir, axis: "z", texture: tex });

  for (const s of [1, -1]) {
    const x = s * (X0 + 0.012);
    plane(0.7, 0.7, warn, [x, 2.35, -1.4], [s, 0, 0]);
    plane(0.55, 0.55, lock, [x, 2.35, -3.0], [s, 0, 0]);
    plane(1.1, 0.37, code, [x, 1.75, -2.2], [s, 0, 0]);
  }
  glow(plane(0.9, 0.6, panelTex, [1.362, 2.05, -2.2], [1, 0, 0]), 1.3);
  glow(plane(0.9, 0.6, panelTex, [0, 1.8, Z1 + 0.07], [0, 0, 1]), 1.3);

  // vent grills on the left roof
  for (let i = 0; i < 5; i++) {
    box(0.7, 0.03, 0.06, P.podDark, [-0.55, 2.915, -1.3 - i * 0.15]);
  }
  for (let i = 0; i < 4; i++) box(0.04, 0.4, 0.5, P.podDark, [-X0 - 0.01, 1.7, -3.5 + i * 0.12]);

  // hazard straps with buckles
  const hazard = paint((p) => (Math.floor((p.x + p.y + p.z) / 0.1) % 2 ? [0.9, 0.72, 0.08] : [0.08, 0.08, 0.1]));
  for (const z of [-3.3, -0.7]) {
    box(2.76, 0.06, 0.34, hazard, [0, 2.92, z]);
    for (const s of [1, -1]) {
      box(0.06, 1.55, 0.34, hazard, [s * 1.37, 2.1, z]);
    }
    box(2.5, 0.05, 0.34, hazard, [0, 1.32, z]);
    // ratchet buckle
    box(0.3, 0.12, 0.2, P.rim, [0.5, 2.97, z]);
    box(0.08, 0.14, 0.22, P.hullDark, [0.5, 3.0, z]);
  }

  // corner clamps bolted to deck
  for (const sx of [1, -1])
    for (const z of [-3.75, -0.25]) {
      box(0.3, 0.28, 0.3, P.hull, [sx * 1.25, 1.44, z]);
      box(0.34, 0.08, 0.34, P.plate, [sx * 1.25, 1.34, z]);
      for (const k of [1, -1]) {
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.rim, { bone, at: [sx * 1.25 + k * 0.1, 1.59, z + k * 0.1] });
      }
    }

  // warning beacon
  b.part(new THREE.CylinderGeometry(0.12, 0.15, 0.06, 8), P.hullDark, { bone, at: [0.6, 2.96, cz + 0.4] });
  glow(b.part(new THREE.SphereGeometry(0.11, 8, 5), P.warnRed, { bone, at: [0.6, 3.03, cz + 0.4], flat: true }), 2);

  // rivets along the top corners
  for (let i = 0; i < 12; i++) {
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.025, 5, 3), P.rim, { bone, at: [s * 1.2, 2.915, Z0 + 0.4 + i * 0.28 + R() * 0.01] });
  }
}
```
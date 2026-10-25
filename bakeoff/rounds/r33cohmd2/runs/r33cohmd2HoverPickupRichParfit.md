<!-- call: plan -->

```json
{
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to ride on four downward-facing hover thrusters, in low-poly cyberpunk style with neon underglow, armor plates and a roof-mounted gun.",
  "builderName": "hoverTechnical",
  "size": [2.5, 2.3, 5.6],
  "layout": "A boxy armored pickup hovering about 0.35 m above the floor. The front (+Z) holds a sloped hood with an angular grille, a light bar and a bull-bar bumper. The cab with a raked windshield sits mid-front. A flat cargo bed behind it carries a pintle-mounted autocannon on a ring. Four large thruster nacelles replace the wheels, one at each corner, flaring out from the fenders, with glowing cyan intake rings underneath and orange vents. Chunky faceted panels and bold yellow hazard stripes. Magenta and cyan neon strips run along the sills and rear. The only floor-resting pieces are four short landing skids under the thrusters, and the hull floats 0.35 m up. Flat colours dominate, with SVG decals (stencil numbers, hazard stripes, glyphs, a tiger-head emblem) and glow on lights, thrusters and screens.",
  "palette": {
    "hull": "#3a4350",
    "hullDark": "#1f252e",
    "armor": "#566070",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0e2a3a",
    "ventOrange": "#ff8a1c",
    "rubber": "#15171c",
    "metal": "#8a93a3",
    "rust": "#7a4a2e",
    "white": "#e8ecf2",
    "red": "#d6283a"
  },
  "mounts": {
    "chassisTop": [0, 1.0, 0],
    "hullFloor": [0, 0.45, 0],
    "cabBase": [0, 1.0, 0.35],
    "hoodBase": [0, 1.0, 1.9],
    "bedFloor": [0, 1.0, -1.7],
    "gunRing": [0, 1.25, -1.2],
    "thrusterFL": [1.15, 0.75, 1.75],
    "thrusterFR": [-1.15, 0.75, 1.75],
    "thrusterBL": [1.15, 0.75, -1.75],
    "thrusterBR": [-1.15, 0.75, -1.75],
    "bumperFront": [0, 0.7, 2.8],
    "bumperRear": [0, 0.7, -2.8]
  },
  "joints": [
    { "name": "body", "at": [0, 0.9, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "thrusterFL", "parent": "body", "at": [1.15, 0.75, 1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterFR", "parent": "body", "at": [-1.15, 0.75, 1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterBL", "parent": "body", "at": [1.15, 0.75, -1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterBR", "parent": "body", "at": [-1.15, 0.75, -1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "gunYaw", "parent": "body", "at": [0, 1.25, -1.2], "dir": [0, 1, 0], "role": "hinge", "group": "gun" },
    { "name": "gunPitch", "parent": "gunYaw", "at": [0, 1.75, -1.2], "dir": [0, 0, 1], "role": "hinge", "group": "gun" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull and frame: a faceted underbody tub, sills, side skirts with a neon cyan and magenta strip, a belly plate with a central glowing keel vent, a rear diffuser, mounting pylons toward the four thrusters, exposed pipes and cable runs, and a painted panelled metal texture with a hazard-stripe decal. Also the underside glow panels.",
      "box": [[-1.1, 0.35, -2.8], [1.1, 1.05, 2.8]],
      "attaches": "Top at chassisTop supports the cab, hood and bed. Pylons reach the four thruster mounts. The bumpers attach at bumperFront and bumperRear.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "thrusters",
      "builds": "Four hover nacelles, each a lathe or ngon housing with flared fender mount, a ring of cyan glowing intake blades on the underside, an orange glowing exhaust throat, a fin ring of 6 stabilizer fins, an armored cowl with a stencil number decal, and a short landing skid leg that touches y=0. The left and right sides mirror each other. Each rides its own thruster joint.",
      "box": [[-1.25, 0, -2.35], [1.25, 1.0, 2.35]],
      "attaches": "Each nacelle is centred on its thruster mount and joins the chassis pylons and the fender flares of the cab and bed.",
      "joints": ["thrusterFL", "thrusterFR", "thrusterBL", "thrusterBR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cabShell",
      "builds": "The armored cab body: faceted roof, A, B and C pillars, doors with armor plates, a roll cage on the roof, side mirrors, door handles, a glowing neon trim line, a sloped windshield and side windows with dark glass and a glossy streak texture, a tiger-head emblem decal on the doors, and the interior seen through the glass (seats, a steering wheel, a glowing dash screen with an SVG HUD).",
      "box": [[-1.2, 1.0, -0.6], [1.2, 2.1, 1.3]],
      "attaches": "Sits on cabBase and chassisTop. The front edge meets hoodBase. The rear wall meets the bed at z=-0.6 and the roof rack carries the light bar.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "frontEnd",
      "builds": "The nose: a sloped faceted hood with scoops and vents plus an orange glowing vent strip, an angular grille with a drawn mesh texture, two headlights with glow plus a light bar on top, a bull-bar bumper with a winch and a hazard-striped plate, front fender flares over the front thrusters, a number plate decal, and small tow hooks.",
      "box": [[-1.25, 0.5, 1.3], [1.25, 1.45, 2.85]],
      "attaches": "Hood starts at hoodBase and meets the cab front. The bumper sits at bumperFront. Fender flares wrap the thrusterFL and thrusterFR mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "cargoBed",
      "builds": "The rear bed: armored side walls and a tailgate in angular plates with rivets, a ribbed floor, fender flares over the rear thrusters, ammo crates, a spare thruster cell, fuel jerrycans, tie-down straps and lashing hooks, a rear bumper with red tail lights (glow) and a magenta neon strip, a stencil decal, an antenna, and a rear exhaust vent.",
      "box": [[-1.25, 0.5, -2.85], [1.25, 1.6, -0.6]],
      "attaches": "Floor sits on bedFloor and chassisTop. The front wall meets the cab rear at z=-0.6. The rear bumper is at bumperRear. The gun ring base rises from gunRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "gunTurret",
      "builds": "A pintle-mounted autocannon: a ring base with a ring track and a rotating yoke on gunYaw, a gun cradle on gunPitch, a boxy receiver with panel paint, a long barrel with a shroud, a muzzle brake and a glowing orange tip, an ammo drum and a belt of rounds, a shield plate with a hazard stripe and a small targeting sensor with a cyan lens. Faces forward (+Z).",
      "box": [[-0.6, 1.2, -1.8], [0.6, 2.3, 1.0]],
      "attaches": "Base ring is at gunRing on the bed floor. The yoke rides gunYaw and the cradle rides gunPitch.",
      "joints": ["gunYaw", "gunPitch"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: thrusters -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: any; M: any };

export function buildThrusters({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const CYAN_DARK = "#14a9b8";
  const ORANGE_HOT = "#ffd27a";

  const armorPaint = paint((p, n) => {
    const base = mix(P.armor, P.hull, noise(p, 0.18, 3) * 0.6);
    const top = Math.max(0, n.y) * 0.18;
    return mix(base, "#8c98ac", top);
  });
  const darkPaint = paint((p, n) => mix(P.hullDark, P.rubber, noise(p, 0.1, 5) * 0.7 + (n.y < 0 ? 0.2 : 0)));

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 2} 0 L${i * 10 + 8} 0 L${i * 10 + 2} 16Z" fill="#15171c"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const stencil = (t: string) =>
    svg(
      `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="none" stroke="#e8ecf2" stroke-width="3" stroke-dasharray="10 4"/><text x="32" y="46" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#e8ecf2">${t}</text></svg>`,
      { size: 128 },
    );
  const intakeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#05303a"/><circle cx="32" cy="32" r="26" fill="none" stroke="#2ff3ff" stroke-width="3"/><circle cx="32" cy="32" r="16" fill="none" stroke="#2ff3ff" stroke-width="2" stroke-dasharray="4 3"/><circle cx="32" cy="32" r="6" fill="#bffcff"/></svg>`,
    { size: 128 },
  );
  const glyphTex = svg(
    `<svg viewBox="0 0 32 32"><path d="M4 28 L16 4 L28 28 M9 20 H23" stroke="#ff2fa8" stroke-width="3" fill="none"/></svg>`,
    { size: 64 },
  );

  const mounts: [string, number, number, string][] = [
    ["thrusterFL", 1, 1, "1"],
    ["thrusterFR", -1, 1, "2"],
    ["thrusterBL", 1, -1, "3"],
    ["thrusterBR", -1, -1, "4"],
  ];

  for (const [name, s, f, num] of mounts) {
    const bone = J[name];
    const [mx, my, mz] = M[name] as [number, number, number];
    const cx = mx;
    const cz = mz;
    const cy = 0.5; // nacelle centre height
    const place = (dx: number, dy: number, dz: number): [number, number, number] => [cx + dx, dy, cz + dz];

    // main housing: lathe (outline radius vs height)
    b.lathe(
      [
        [0, -0.2],
        [0.3, -0.2],
        [0.46, -0.08],
        [0.5, 0.1],
        [0.48, 0.3],
        [0.4, 0.4],
        [0, 0.4],
      ],
      { at: place(0, cy, 0), axis: [0, 1, 0], segments: 8, bone, color: armorPaint, name: `housing.${name}` },
    );
    // dark inner throat sleeve
    b.part(new THREE.CylinderGeometry(0.34, 0.3, 0.1, 8), darkPaint, {
      bone,
      at: place(0, cy - 0.22, 0),
    });
    // cyan intake disc underneath
    glow(
      b.part(new THREE.CircleGeometry(0.3, 12), "#ffffff", {
        bone,
        at: place(0, cy - 0.275, 0),
        dir: [0, -1, 0],
        axis: "z",
        texture: intakeTex,
      }),
      1.4,
    );
    // intake blades ring (cyan glowing)
    const bladeRing = b.ring(
      { at: place(0, cy - 0.255, 0), axis: [0, 1, 0] },
      { count: 10, radius: 0.15, bone },
    );
    for (const it of bladeRing.items) {
      glow(
        b.part(new THREE.BoxGeometry(0.17, 0.012, 0.045), P.neonCyan, {
          bone,
          at: it.at,
          dir: it.outward,
          axis: "x",
          rotation: undefined,
        }),
        1.6,
      );
    }
    // glowing cyan rim
    glow(
      b.lathe(
        [
          [0.36, 0],
          [0.42, 0],
          [0.42, 0.03],
          [0.36, 0.03],
        ],
        { at: place(0, cy - 0.2, 0), axis: [0, 1, 0], segments: 8, bone, color: P.neonCyan },
      ),
      1.5,
    );
    // orange exhaust throat on top
    b.part(new THREE.CylinderGeometry(0.28, 0.3, 0.08, 8), P.hullDark, { bone, at: place(0, cy + 0.42, 0) });
    glow(
      b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 8), P.ventOrange, { bone, at: place(0, cy + 0.45, 0) }),
      1.6,
    );
    glow(
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6), ORANGE_HOT, { bone, at: place(0, cy + 0.47, 0) }),
      2,
    );

    // fin ring of 6 stabilizers
    const fins = b.ring({ at: place(0, cy + 0.05, 0), axis: [0, 1, 0] }, { count: 6, radius: 0.5, bone });
    for (const it of fins.items) {
      b.part(new THREE.BoxGeometry(0.05, 0.42, 0.22), P.hullDark, {
        bone,
        at: it.at,
        dir: it.outward,
        axis: "z",
      });
      b.part(new THREE.BoxGeometry(0.052, 0.06, 0.1), P.trim, {
        bone,
        at: [it.at.x, it.at.y - 0.18, it.at.z],
        dir: it.outward,
        axis: "z",
      });
    }

    // armored cowl on outer side with stencil
    const outX = s * 0.5;
    b.part(new THREE.BoxGeometry(0.08, 0.5, 0.6), armorPaint, {
      bone,
      at: place(outX + s * 0.03, cy + 0.08, 0),
    });
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.62), P.trim, { bone, at: place(outX + s * 0.04, cy + 0.38, 0) });
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone,
      at: place(outX + s * 0.075, cy + 0.06, 0),
      dir: [s, 0, 0],
      axis: "z",
      texture: stencil(num),
    });
    b.part(new THREE.PlaneGeometry(0.22, 0.05), "#ffffff", {
      bone,
      at: place(outX + s * 0.075, cy - 0.17, 0),
      dir: [s, 0, 0],
      axis: "z",
      texture: hazard,
    });
    glow(
      b.part(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", {
        bone,
        at: place(outX + s * 0.075, cy + 0.3, 0.18 * f),
        dir: [s, 0, 0],
        axis: "z",
        texture: glyphTex,
      }),
      1.2,
    );
    // neon accent strip on cowl
    glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.56), P.neonMagenta, { bone, at: place(outX + s * 0.07, cy - 0.12, 0) }), 1.4);

    // flared fender mount toward chassis (inner side)
    const innerX = -s * 0.5;
    b.part(new THREE.BoxGeometry(0.4, 0.5, 0.7), P.armor, {
      bone,
      at: place(innerX + -s * 0.1, cy + 0.2, 0),
    });
    b.frustumBox(
      place(-s * 0.5, 0.78, 0),
      place(-s * 0.1, 0.78, 0),
      [0.5, 0.3],
      [0.8, 0.5],
      { bone, color: armorPaint },
    );
    // pylon strut up to chassis
    b.rod(place(-s * 0.3, cy + 0.2, 0), place(-s * 0.4, 0.85, 0), 0.07, P.metal, { bone });
    b.rod(place(-s * 0.25, cy - 0.1, 0.2 * f), place(-s * 0.6, 0.9, 0.1 * f), 0.04, P.rubber, { bone });
    // hazard band on pylon
    b.part(new THREE.BoxGeometry(0.42, 0.08, 0.72), P.trim, { bone, at: place(innerX - s * 0.1, cy + 0.42, 0) });

    // rivets on cowl
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.018, 5, 4), P.metal, {
        bone,
        at: place(Math.cos(a) * 0.43, cy + 0.4, Math.sin(a) * 0.43),
      });
    }

    // landing skid leg touching y=0
    const legX = s * 0.3;
    b.rod(place(legX, cy - 0.15, 0), place(legX, 0.06, 0), 0.05, P.metal, { bone });
    b.part(new THREE.BoxGeometry(0.16, 0.06, 0.9), P.rubber, { bone, at: place(legX, 0.03, 0.05 * f) });
    b.part(new THREE.BoxGeometry(0.17, 0.02, 0.2), P.trim, { bone, at: place(legX, 0.065, 0.4 * f) });
    b.part(new THREE.BoxGeometry(0.17, 0.02, 0.2), P.trim, { bone, at: place(legX, 0.065, -0.3 * f) });
    // skid tip bevel
    b.part(new THREE.ConeGeometry(0.06, 0.2, 4), P.rubber, {
      bone,
      at: place(legX, 0.04, 0.55 * f),
      dir: [0, 0, f],
      rotation: undefined,
    });
  }
}
```

<!-- call: frontEnd -->

```ts
import * as THREE from "three";
import { paint, svg, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildFrontEnd({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], extra: any = {}) =>
    b.part(g, color, { bone, at, flat: true, ...extra });

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15171c"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#15171c"/>${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${i * 3.6 + 1}" width="64" height="1.6" fill="#566070"/>`).join("")}${Array.from({ length: 13 }, (_, i) => `<rect x="${i * 5 + 1}" y="0" width="1.2" height="32" fill="#2a303a"/>`).join("")}<path d="M4 2H60" stroke="#2ff3ff" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#e8ecf2"/><rect x="2" y="2" width="60" height="28" rx="2" fill="none" stroke="#1f252e" stroke-width="1.5"/><text x="32" y="23" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#1f252e">TGR-07</text></svg>`,
    { size: 256 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#ff8a1c"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 8 + 5}" y="0" width="2" height="16" fill="#7a3a08"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const HEAD = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#fff6c8"/><path d="M2 8H30" stroke="#ffffff" stroke-width="5"/><rect x="0" y="0" width="32" height="16" fill="none" stroke="#1f252e" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.armor, smoothstep(0.3, 0.9, noise(p, 0.3, 4)) * 0.5);
    const up = smoothstep(-0.2, 0.9, n.y);
    return mix(mix(base, P.hullDark, 0.35), base, up);
  });
  const armorPaint = paint((p, n) => mix(P.armor, P.hullDark, 0.3 * smoothstep(0.5, -0.8, n.y) + 0.15 * noise(p, 0.12, 9)));

  // Hood: faceted sloped wedge from cab (z~1.3) to nose
  const hood = new THREE.CylinderGeometry(0.5, 0.5, 1, 4, 1);
  put(box(1.9, 0.12, 1.5), hullPaint, [0, 1.2, 1.95], { rotation: [-7, 0, 0] });
  put(box(2.1, 0.5, 1.5), hullPaint, [0, 0.9, 2.0]);
  put(box(1.7, 0.1, 0.5), hullPaint, [0, 1.25, 2.5], { rotation: [-14, 0, 0] });
  // hood centre ridge + side chamfers
  for (const s of [1, -1]) {
    put(box(0.2, 0.1, 1.4), armorPaint, [s * 0.95, 1.18, 1.95], { rotation: [-6, 0, s * 18] });
    // scoops
    put(box(0.34, 0.1, 0.5), P.hullDark, [s * 0.45, 1.3, 1.75], { rotation: [-10, 0, 0] });
    put(box(0.3, 0.04, 0.42), P.rubber, [s * 0.45, 1.36, 1.75], { rotation: [-10, 0, 0] });
    for (let i = 0; i < 3; i++) put(box(0.3, 0.06, 0.03), P.metal, [s * 0.45, 1.375, 1.6 + i * 0.14], { rotation: [-10, 0, 0] });
  }
  // glowing vent strip
  glow(
    b.part(new THREE.PlaneGeometry(1.0, 0.1), "#ffffff", {
      bone, at: [0, 1.272, 2.3], dir: [0, 0.95, 0.3], axis: "z", texture: VENT,
    }),
    1.4,
  );
  put(box(1.06, 0.03, 0.02), P.ventOrange, [0, 1.285, 2.36], { rotation: [-14, 0, 0] });

  // Front fascia/ grille
  put(box(1.7, 0.6, 0.12), P.hullDark, [0, 0.95, 2.62]);
  b.part(new THREE.PlaneGeometry(1.4, 0.5), "#ffffff", { bone, at: [0, 0.95, 2.69], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  for (const s of [1, -1]) {
    put(box(0.08, 0.6, 0.1), P.trim, [s * 0.76, 0.95, 2.66]);
    put(box(0.1, 0.1, 0.06), P.armor, [s * 0.76, 1.27, 2.64]);
  }
  put(box(1.62, 0.06, 0.1), P.trim, [0, 1.26, 2.66]);
  glow(put(box(1.5, 0.03, 0.03), P.neonCyan, [0, 0.64, 2.7]), 1.5);

  // Headlights
  for (const s of [1, -1]) {
    put(box(0.5, 0.26, 0.14), P.hullDark, [s * 0.98, 1.0, 2.55], { rotation: [0, s * -12, 0] });
    glow(
      b.part(new THREE.PlaneGeometry(0.4, 0.17), "#ffffff", {
        bone, at: [s * 0.99, 1.0, 2.635], dir: [s * -0.2, 0, 1], axis: "z", texture: HEAD,
      }),
      1.6,
    );
    put(box(0.5, 0.05, 0.16), P.armor, [s * 0.98, 1.16, 2.55]);
  }

  // Light bar atop windshield side of hood front (above hood, in front of cab)
  put(box(1.5, 0.12, 0.14), P.rubber, [0, 1.44, 1.45]);
  for (let i = 0; i < 6; i++) glow(put(box(0.2, 0.08, 0.04), i % 2 ? P.white : "#fff6c8", [-0.62 + i * 0.248, 1.44, 1.53]), 1.6);
  for (const s of [1, -1]) put(box(0.1, 0.1, 0.1), P.metal, [s * 0.6, 1.38, 1.45]);

  // Bull-bar bumper
  put(box(2.3, 0.3, 0.3), armorPaint, [0, 0.62, 2.78]);
  b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone, at: [0, 0.62, 2.935], dir: [0, 0, 1], axis: "z", texture: HAZ });
  for (const s of [1, -1]) {
    put(box(0.1, 0.8, 0.1), P.metal, [s * 0.6, 0.98, 2.84]);
    put(box(0.1, 0.8, 0.1), P.metal, [s * 1.0, 0.95, 2.8], { rotation: [0, 0, s * -6] });
    put(box(0.15, 0.2, 0.3), P.hullDark, [s * 1.1, 0.62, 2.7]);
    // tow hooks
    put(new THREE.TorusGeometry(0.06, 0.016, 5, 8), P.trim, [s * 0.9, 0.5, 2.94]);
    put(box(0.05, 0.05, 0.1), P.metal, [s * 0.9, 0.5, 2.88]);
  }
  put(box(1.4, 0.08, 0.1), P.metal, [0, 1.08, 2.9]);
  // winch
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8), P.hullDark, [0, 0.62, 2.7], { rotation: [0, 0, 90] });
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.44, 8), P.metal, [0, 0.62, 2.7], { rotation: [0, 0, 90] });
  put(new THREE.TorusGeometry(0.05, 0.015, 5, 8), P.red, [0, 0.62, 2.96]);
  glow(put(box(0.5, 0.025, 0.02), P.neonMagenta, [0, 0.48, 2.95]), 1.4);

  // Number plate
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone, at: [0, 0.8, 2.7], dir: [0, 0, 1], axis: "z", texture: PLATE });
  put(box(0.54, 0.29, 0.03), P.rubber, [0, 0.8, 2.67]);

  // Fender flares over front thrusters
  for (const s of [1, -1]) {
    const x = s * 1.15;
    put(box(0.5, 0.12, 1.2), armorPaint, [x, 1.1, 1.75]);
    put(box(0.2, 0.55, 1.2), armorPaint, [s * 1.33, 0.88, 1.75], { rotation: [0, 0, s * -8] });
    put(box(0.2, 0.5, 0.1), armorPaint, [s * 1.2, 0.88, 2.4], { rotation: [-10, 0, 0] });
    put(box(0.2, 0.5, 0.1), armorPaint, [s * 1.2, 0.88, 1.1], { rotation: [10, 0, 0] });
    put(box(0.14, 0.04, 1.1), P.trim, [s * 1.2, 1.17, 1.75]);
    for (let i = 0; i < 4; i++) put(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.metal, [s * 1.43, 1.0, 1.35 + i * 0.27], { rotation: [0, 0, 90] });
    glow(put(box(0.03, 0.03, 1.0), P.neonCyan, [s * 1.44, 0.68, 1.75]), 1.4);
  }
}
```

<!-- call: gunTurret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGunTurret({ b, J, P, M }: Ctx) {
  const yaw = J.gunYaw;
  const pitch = J.gunPitch;
  const RING = M.gunRing; // [0,1.25,-1.2]
  const cx = RING[0], cy = RING[1], cz = RING[2];
  const DARKM = "#2b313b";
  const BRASS = "#c9a24a";
  const BRASS_DK = "#8d6a2a";

  const panelPaint = paint((p, n) => {
    const base = mix(P.armor, P.hull, noise(p, 0.18, 4));
    const seam = Math.abs(((p.z * 6) % 1)) < 0.04 || Math.abs(((p.y * 6) % 1)) < 0.04;
    const c = seam ? mix(base, P.hullDark, 0.7) : base;
    return mix(c, "#9fb0c4", 0.25 * smoothstep(0.5, 1, n.y));
  });
  const darkPaint = countershade(P.hull, P.hullDark, { level: 0 });

  const hazard = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="${P.trim}"/>` +
      `<path d="M-8 32 L8 0 L20 0 L4 32Z M16 32 L32 0 L44 0 L28 32Z M40 32 L56 0 L68 0 L52 32Z M64 32 L80 0 L92 0 L76 32Z" fill="#14161a"/>` +
      `<rect width="64" height="32" fill="none" stroke="#14161a" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const lensTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#06222c"/><circle cx="16" cy="16" r="11" fill="${P.neonCyan}"/><circle cx="16" cy="16" r="5" fill="#eaffff"/><circle cx="11" cy="11" r="2.5" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="25" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8ecf2">07</text></svg>`,
    { size: 128 },
  );

  // ---------- Ring base (static on body) ----------
  b.part(new THREE.CylinderGeometry(0.5, 0.56, 0.08, 16), DARKM, { bone: J.body, at: [cx, cy - 0.04, cz] });
  b.part(new THREE.TorusGeometry(0.46, 0.035, 5, 20), P.metal, {
    bone: J.body, at: [cx, cy + 0.02, cz], rotation: [90, 0, 0],
  });
  b.part(new THREE.TorusGeometry(0.36, 0.02, 4, 20), P.trim, {
    bone: J.body, at: [cx, cy + 0.045, cz], rotation: [90, 0, 0],
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.07, 0.05, 0.07), P.hullDark, {
      bone: J.body, at: [cx + Math.sin(a) * 0.52, cy + 0.0, cz + Math.cos(a) * 0.52], rotation: [0, (a * 180) / Math.PI, 0],
    });
  }

  // ---------- Pedestal & yoke (gunYaw) ----------
  b.part(new THREE.CylinderGeometry(0.2, 0.3, 0.2, 8), darkPaint, { bone: yaw, at: [cx, cy + 0.12, cz] });
  b.part(new THREE.CylinderGeometry(0.12, 0.18, 0.28, 8), P.metal, { bone: yaw, at: [cx, cy + 0.36, cz] });
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 16), panelPaint, { bone: yaw, at: [cx, cy + 0.27, cz] });
  const py = 1.75; // pitch pivot height
  for (const s of [1, -1]) {
    // yoke arms
    b.part(new THREE.BoxGeometry(0.08, 0.5, 0.22), panelPaint, { bone: yaw, at: [cx + s * 0.27, py - 0.2, cz] });
    b.part(new THREE.BoxGeometry(0.08, 0.2, 0.3), panelPaint, { bone: yaw, at: [cx + s * 0.27, py + 0.02, cz] });
    // trunnion cap
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), P.metal, {
      bone: yaw, at: [cx + s * 0.33, py, cz], rotation: [0, 0, 90],
    });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.04), P.trim, { bone: yaw, at: [cx + s * 0.27, py + 0.15, cz + 0.12] });
  }
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.2), darkPaint, { bone: yaw, at: [cx, cy + 0.42, cz - 0.05] });

  // ---------- Cradle & receiver (gunPitch) ----------
  const rz = cz; // receiver centre z
  b.part(new THREE.BoxGeometry(0.4, 0.3, 0.7), panelPaint, { bone: pitch, at: [cx, py, rz + 0.1] });
  b.part(new THREE.BoxGeometry(0.34, 0.06, 0.5), darkPaint, { bone: pitch, at: [cx, py + 0.18, rz + 0.1] });
  b.part(new THREE.BoxGeometry(0.3, 0.2, 0.2), P.hullDark, { bone: pitch, at: [cx, py - 0.02, rz - 0.35] });
  // cradle rails
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.8), P.metal, { bone: pitch, at: [cx + s * 0.22, py - 0.12, rz + 0.1] });
    b.part(new THREE.BoxGeometry(0.03, 0.12, 0.24), P.trim, { bone: pitch, at: [cx + s * 0.205, py + 0.02, rz + 0.25] });
  }
  // charging handle + ejection port
  b.part(new THREE.BoxGeometry(0.04, 0.04, 0.12), P.metal, { bone: pitch, at: [cx + 0.23, py + 0.08, rz - 0.1] });
  b.part(new THREE.BoxGeometry(0.02, 0.1, 0.16), "#0b0d11", { bone: pitch, at: [cx - 0.205, py + 0.04, rz + 0.1] });
  // glow status strip
  glow(b.part(new THREE.BoxGeometry(0.02, 0.02, 0.3), P.neonCyan, { bone: pitch, at: [cx + 0.205, py - 0.08, rz + 0.1] }), 1.4);

  // ---------- Barrel ----------
  const bz0 = rz + 0.45;
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.12, 8), P.metal, { bone: pitch, at: [cx, py, bz0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.95, 8), darkPaint, { bone: pitch, at: [cx, py, bz0 + 0.55], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 6), P.metal, { bone: pitch, at: [cx, py, bz0 + 0.85], rotation: [90, 0, 0] });
  // shroud vents
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.TorusGeometry(0.1, 0.014, 4, 8), P.hullDark, {
      bone: pitch, at: [cx, py, bz0 + 0.2 + i * 0.17],
    });
  }
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 8), P.ventOrange, { bone: pitch, at: [cx, py, bz0 + 1.03], rotation: [90, 0, 0] }), 1.2);
  // muzzle brake
  const mz = bz0 + 1.6;
  b.part(new THREE.BoxGeometry(0.14, 0.14, 0.22), P.hullDark, { bone: pitch, at: [cx, py, mz] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.02, 0.18, 0.14), P.metal, { bone: pitch, at: [cx + s * 0.08, py, mz] });
  }
  b.part(new THREE.BoxGeometry(0.18, 0.02, 0.14), P.metal, { bone: pitch, at: [cx, py + 0.08, mz] });
  glow(b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 8), P.ventOrange, { bone: pitch, at: [cx, py, mz + 0.13], rotation: [90, 0, 0] }), 2);

  // ---------- Ammo drum & belt ----------
  const dx = cx + 0.4;
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 10), P.rust, { bone: pitch, at: [dx, py - 0.04, rz + 0.1], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 10), P.hullDark, { bone: pitch, at: [dx + 0.12, py - 0.04, rz + 0.1], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), P.trim, { bone: pitch, at: [dx + 0.15, py - 0.04, rz + 0.1], rotation: [0, 0, 90] });
  b.part(new THREE.PlaneGeometry(0.16, 0.08), "#ffffff", {
    bone: pitch, at: [dx + 0.131, py + 0.1, rz + 0.1], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: stencil,
  });
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const bx = dx - 0.18 * t;
    const by = py - 0.04 + 0.2 * t + 0.0;
    const bzz = rz + 0.1 - 0.0;
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.06), BRASS_DK, { bone: pitch, at: [bx - 0.1, py + 0.12 - t * 0.05 + 0.0 * by, bzz - 0.02 + t * 0.0] });
  }
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.09, 5), BRASS, {
      bone: pitch, at: [cx + 0.22 + 0.0, py + 0.02 - i * 0.002, rz - 0.15 + i * 0.07], rotation: [0, 0, 90],
    });
  }

  // ---------- Shield plate (on pitch, in front of receiver) ----------
  const sz = rz + 0.5;
  b.extrude(
    [[-0.42, -0.34], [0.42, -0.34], [0.5, 0.0], [0.34, 0.36], [-0.34, 0.36], [-0.5, 0.0]],
    { at: [cx, py + 0.02, sz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.01, color: panelPaint, bone: pitch },
  );
  // aperture for barrel
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 8), P.hullDark, { bone: pitch, at: [cx, py, sz + 0.01], rotation: [90, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.7, 0.14), "#ffffff", {
    bone: pitch, at: [cx, py - 0.2, sz + 0.027], dir: [0, 0, 1], axis: "z", texture: hazard,
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.11), "#ffffff", {
    bone: pitch, at: [cx - 0.26, py + 0.2, sz + 0.027], dir: [0, 0, 1], axis: "z", texture: stencil,
  });
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 5), P.metal, {
        bone: pitch, at: [cx + sx * 0.36, py + 0.02 + sy * 0.27, sz + 0.03], rotation: [90, 0, 0],
      });

  // ---------- Targeting sensor ----------
  const sx0 = cx - 0.3;
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.16), P.hullDark, { bone: pitch, at: [sx0, py + 0.22, rz + 0.3] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), P.metal, { bone: pitch, at: [sx0, py + 0.22, rz + 0.4], rotation: [90, 0, 0] });
  glow(b.part(new THREE.CircleGeometry(0.042, 12), "#ffffff", {
    bone: pitch, at: [sx0, py + 0.22, rz + 0.432], dir: [0, 0, 1], axis: "z", texture: lensTex,
  }), 1.5);
  b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), P.metal, { bone: pitch, at: [sx0 - 0.03, py + 0.34, rz + 0.28] });
  glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), P.red, { bone: pitch, at: [sx0 - 0.03, py + 0.41, rz + 0.28] }), 1.5);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);

  // ---------- textures ----------
  const HAZARD = svg(
    `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="32" fill="#e7b814"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 16 - 8} 32 L${i * 16 + 4} 0 L${i * 16 + 12} 0 L${i * 16} 32Z" fill="#15171c"/>`).join("")}
      <rect x="1" y="1" width="126" height="30" fill="none" stroke="#15171c" stroke-width="2"/>
    </svg>`,
    { size: 256 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="128" rx="6" fill="#ff8a1c"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="6" y="${8 + i * 13}" width="52" height="5" fill="#ffd27a"/>`).join("")}
      <rect x="2" y="2" width="60" height="124" rx="6" fill="none" stroke="#7a2a00" stroke-width="3"/>
    </svg>`,
    { size: 128 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="none"/>
      <path d="M8 32 L32 6 L56 32 L32 58Z M32 16 V48 M18 32 H46" fill="none" stroke="#2ff3ff" stroke-width="5" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 96 48" xmlns="http://www.w3.org/2000/svg">
      <text x="48" y="38" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="40" fill="#e8ecf2">07</text>
      <rect x="2" y="2" width="92" height="44" fill="none" stroke="#e8ecf2" stroke-width="3"/>
    </svg>`,
    { size: 192 },
  );

  // ---------- paints ----------
  const HULL = paint((p, n) => {
    const base = mix(P.hullDark, P.hull, 0.35 + 0.65 * smoothstep(-0.8, 0.8, n.y));
    const wear = noise(p, 0.18, 4);
    return mix(base, P.rust, 0.5 * smoothstep(0.66, 0.85, wear) * smoothstep(0.2, -0.6, n.y));
  });
  const PANEL = panelled(HULL, { size: 0.35, aspect: 0.6, rivets: 0.07, seam: P.rubber });
  const BELLY = panelled(metal("iron", { tarnish: 0.6 }), { size: 0.3, rivets: 0.06 });
  const ARMOR = panelled(P.armor, { size: 0.28, rivets: 0.06, seam: P.hullDark });

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...opt });
  const cyl = (rt: number, rb: number, h: number, sides: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), col, { bone: body, at, flat: true, ...opt });
  const decalPlane = (tex: any, w: number, h: number, at: number[], dir: number[], opt: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: tex, ...opt });

  // ---------- underbody tub: faceted loft ----------
  b.extrude(
    [
      [-2.8, 0.55],
      [-2.55, 0.38],
      [2.3, 0.38],
      [2.8, 0.62],
      [2.8, 0.95],
      [-2.8, 0.95],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 1.7, color: PANEL, bone: body, name: "tub" },
  );
  // upper deck plate (chassis top at y=1)
  box(2.1, 0.1, 5.5, PANEL, [0, 1.0, 0]);
  // belly plate
  box(1.5, 0.06, 4.8, BELLY, [0, 0.36, 0.05]);
  // keel vent (glow)
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 3.2), "#ffffff", {
      bone: body,
      at: [0, 0.325, 0.1],
      dir: [0, -1, 0],
      axis: "z",
      texture: VENT,
      up: [0, 0, 1],
    }),
    1.3,
  );
  for (const z of [-1.7, 1.9]) box(0.5, 0.04, 0.12, P.hullDark, [0, 0.33, z]);
  // keel rails either side of the vent
  for (const s of [1, -1]) box(0.06, 0.06, 3.3, P.metal, [s * 0.24, 0.33, 0.1]);

  // ---------- sills and skirts ----------
  for (const s of [1, -1]) {
    // side skirt, angled
    b.frustumBox([s * 1.12, 0.55, -1.0], [s * 1.12, 0.55, 1.0], [0.16, 0.38], [0.16, 0.38], {
      color: ARMOR,
      bone: body,
      name: "sill",
    });
    // sloped skirt plate
    box(0.08, 0.34, 2.9, ARMOR, [s * 1.12, 0.6, 0.05], { rotation: [0, 0, s * 8] });
    // sill top step
    box(0.22, 0.07, 3.0, P.hullDark, [s * 1.06, 0.82, 0.05]);
    // neon strips cyan (upper) and magenta (lower)
    glow(box(0.04, 0.05, 2.6, P.neonCyan, [s * 1.19, 0.68, 0.05]), 1.6);
    glow(box(0.04, 0.05, 2.6, P.neonMagenta, [s * 1.17, 0.52, 0.05]), 1.6);
    // end caps
    for (const z of [-1.35, 1.45]) {
      box(0.1, 0.22, 0.1, P.trim, [s * 1.14, 0.6, z]);
    }
    // hazard decal on skirt
    decalPlane(HAZARD, 0.9, 0.2, [s * 1.205, 0.85, 1.9], [s, 0, 0], { up: [0, 1, 0] });
    decalPlane(STENCIL, 0.5, 0.25, [s * 1.205, 0.75, -1.9], [s, 0, 0]);
    decalPlane(GLYPH, 0.22, 0.22, [s * 1.205, 0.62, 1.55], [s, 0, 0]);

    // underside glow panels
    glow(box(0.4, 0.03, 0.9, P.neonCyan, [s * 0.75, 0.355, 1.35]), 1.4);
    glow(box(0.4, 0.03, 0.9, P.neonCyan, [s * 0.75, 0.355, -1.35]), 1.4);
    glow(box(0.1, 0.03, 1.6, P.neonMagenta, [s * 0.5, 0.355, 0]), 1.4);

    // armour studs on skirt
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.metal, {
        bone: body,
        at: [s * 1.2, 0.5, -1.2 + i * 0.5],
        dir: [s, 0, 0],
      });
    }
  }

  // ---------- front/rear chassis blocks, bumper mounts ----------
  box(1.9, 0.5, 0.5, ARMOR, [0, 0.75, 2.6], { rotation: [-8, 0, 0] });
  box(1.9, 0.5, 0.5, ARMOR, [0, 0.75, -2.6], { rotation: [8, 0, 0] });
  for (const s of [1, -1]) {
    for (const z of [M.bumperFront[2] - 0.05, M.bumperRear[2] + 0.05]) {
      box(0.18, 0.2, 0.3, P.metal, [s * 0.7, 0.7, z]);
    }
  }
  // hazard bands on front/rear faces
  decalPlane(HAZARD, 1.5, 0.22, [0, 0.55, 2.86], [0, 0, 1]);
  decalPlane(HAZARD, 1.5, 0.22, [0, 0.55, -2.86], [0, 0, -1]);

  // ---------- rear diffuser ----------
  const diffuser = b.extrude(
    [
      [0, 0],
      [0.6, -0.12],
      [0.6, 0.12],
      [0, 0.2],
    ],
    { at: [0, 0.42, -2.45], x: [0, 0, -1], y: [0, 1, 0], thickness: 1.5, color: P.hullDark, bone: body, name: "diffuser" },
  );
  for (let i = 0; i < 6; i++) {
    box(0.04, 0.2, 0.55, P.rubber, [-0.6 + i * 0.24, 0.36, -2.72], { rotation: [-14, 0, 0] });
  }
  glow(box(1.0, 0.03, 0.04, P.red, [0, 0.5, -2.82]), 1.3);

  // ---------- pylons to thrusters ----------
  for (const key of ["thrusterFL", "thrusterFR", "thrusterBL", "thrusterBR"]) {
    const m = M[key];
    const s = Math.sign(m[0]);
    const root: number[] = [s * 0.95, 0.85, m[2]];
    const tip: number[] = [s * 1.1, m[1] + 0.02, m[2]];
    b.frustumBox(root, [tip[0], tip[1] - 0.2, tip[2]], [0.55, 0.3], [0.4, 0.22], {
      color: ARMOR,
      bone: body,
      name: "pylon",
    });
    // upper strut
    b.rod([s * 0.9, 1.0, m[2] * 0.85], [s * 1.12, m[1] + 0.12, m[2]], 0.045, P.metal, { bone: body, sides: 6 });
    // lower strut
    b.rod([s * 0.7, 0.45, m[2] * 0.9], [s * 1.08, m[1] - 0.12, m[2]], 0.04, P.metal, { bone: body, sides: 6 });
    // pylon collar / bolts
    cyl(0.12, 0.12, 0.08, 8, P.trim, [s * 1.0, 0.75, m[2]], { dir: [s, 0, 0] });
    // conduit down to thruster
    b.sweep(
      [
        [s * 0.85, 0.5, m[2] * 0.9],
        [s * 1.0, 0.62, m[2] * 0.95],
        [s * 1.12, 0.7, m[2]],
      ],
      0.03,
      { color: P.neonCyan, bone: body, sides: 6 },
    );
  }

  // ---------- pipes and cable runs ----------
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.55, 0.42, 2.2],
        [s * 0.58, 0.42, 1.0],
        [s * 0.6, 0.44, -0.2],
        [s * 0.58, 0.44, -1.4],
        [s * 0.55, 0.42, -2.3],
      ],
      0.035,
      { color: P.metal, bone: body, sides: 6 },
    );
    b.sweep(
      [
        [s * 0.42, 0.4, 2.1],
        [s * 0.44, 0.4, 0.5],
        [s * 0.42, 0.4, -2.2],
      ],
      0.022,
      { color: P.rubber, bone: body, sides: 5 },
    );
    // pipe clamps
    for (let i = 0; i < 5; i++) {
      cyl(0.05, 0.05, 0.05, 6, P.trim, [s * 0.58, 0.43, 1.8 - i * 0.9], { dir: [0, 0, 1] });
    }
  }
  // exhaust pipe junction
  b.sweep(
    [
      [-0.35, 0.45, -1.8],
      [-0.3, 0.4, -2.3],
      [-0.3, 0.5, -2.75],
    ],
    0.06,
    { color: P.metal, bone: body, sides: 8 },
  );
  glow(cyl(0.05, 0.05, 0.03, 8, P.ventOrange, [-0.3, 0.5, -2.78], { dir: [0, 0, 1] }), 1.3);

  // ---------- central spine tank & reactor on deck underside ----------
  const core = b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.9, 8), metal("blued"), {
    bone: body,
    at: [0, 0.55, 0.9],
    dir: [0, 0, 1],
    flat: true,
  });
  for (let i = 0; i < 3; i++) {
    cyl(0.25, 0.25, 0.05, 8, P.trim, [0, 0.55, 0.6 + i * 0.3], { dir: [0, 0, 1] });
  }
  glow(cyl(0.12, 0.12, 0.02, 8, P.neonCyan, [0, 0.55, 1.36], { dir: [0, 0, 1] }), 1.5);

  // cross members seen from below
  for (let i = 0; i < 5; i++) {
    box(2.0, 0.07, 0.1, P.hullDark, [0, 0.37, -2.0 + i * 1.0]);
  }

  // rivet rows on top plate
  const rv: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i < 24; i++) {
      const g = new THREE.SphereGeometry(0.02, 5, 3);
      g.translate(s * 0.98, 1.06, -2.6 + i * 0.22);
      rv.push(g);
    }
  const merged = mergeSimple(rv);
  if (merged) b.part(merged, P.metal, { bone: body, at: [0, 0, 0] });

  // front tow shackles
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.5, 0.62, 2.78],
        [s * 0.5, 0.52, 2.95],
        [s * 0.42, 0.52, 2.95],
        [s * 0.42, 0.62, 2.78],
      ],
      0.018,
      { color: P.metal, bone: body, sides: 5 },
    );
  }
  // skids anchors small side lights
  for (const s of [1, -1]) {
    glow(box(0.03, 0.06, 0.2, P.ventOrange, [s * 1.2, 0.92, 2.55]), 1.2);
    glow(box(0.03, 0.06, 0.2, P.red, [s * 1.2, 0.92, -2.55]), 1.2);
  }

  function mergeSimple(geos: THREE.BufferGeometry[]) {
    let pos: number[] = [];
    let idx: number[] = [];
    let off = 0;
    for (const g of geos) {
      const p = g.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      const ix = g.getIndex();
      if (ix) for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    }
    if (!pos.length) return null;
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setIndex(idx);
    m.computeVertexNormals();
    return m;
  }
}
```

<!-- call: cargoBed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, [number, number, number]> };

export function buildCargoBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  // Own extra colours (under the 6 limit)
  const STRAP = "#2b2f38";
  const CRATE = "#5a6b4a";
  const JERRY = "#8a2a24";
  const CELL = "#2a3340";

  // ---------- paints ----------
  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.armor, smoothstep(0.3, 0.7, noise(p, 0.3, 4)));
    const seam = Math.abs(((p.z * 6) % 1) - 0.5) > 0.47 ? 0.55 : 1;
    const top = 0.9 + 0.15 * Math.max(0, n.y);
    return [base[0] * seam * top, base[1] * seam * top, base[2] * seam * top];
  });
  const floorPaint = paint((p, _n) => {
    const rib = Math.abs(((p.z * 9) % 1) - 0.5) < 0.18;
    return rib ? P.hullDark : mix(P.hull, P.rubber, 0.5 + 0.2 * noise(p, 0.2, 2));
  });
  const metalPaint = paint((p) => mix(P.metal, P.hullDark, 0.35 * noise(p, 0.15, 7)));
  const rustPaint = paint((p) => mix(P.armor, P.rust, smoothstep(0.5, 0.8, noise(p, 0.18, 9))));

  // ---------- textures ----------
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="${P.rubber}"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 64 40"><rect x="1" y="1" width="62" height="38" rx="3" fill="none" stroke="${P.white}" stroke-width="2.5" stroke-dasharray="10 3"/>
     <text x="32" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="${P.white}">07</text></svg>`,
    { size: 128 },
  );
  const glyph = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 3 L29 26 H3Z" fill="none" stroke="${P.neonCyan}" stroke-width="2.5"/><circle cx="16" cy="19" r="3" fill="${P.neonMagenta}"/><path d="M16 8 V14" stroke="${P.neonCyan}" stroke-width="2.5"/></svg>`,
    { size: 96 },
  );
  const tail = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" rx="3" fill="${P.red}"/><rect x="3" y="5" width="58" height="6" fill="#ff8a8a"/></svg>`,
    { size: 96 },
  );

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, color: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at: [x, y, z], ...extra });
  const rivet = (x: number, y: number, z: number, dir: [number, number, number]) =>
    b.part(new THREE.SphereGeometry(0.018, 5, 3), P.metal, { bone, at: [x, y, z], dir });

  // ---------- floor with ribs ----------
  box(2.1, 0.06, 2.2, floorPaint, 0, 1.03, -1.7);
  for (let i = 0; i < 9; i++) box(2.0, 0.025, 0.05, P.hullDark, 0, 1.075, -0.78 - i * 0.22);

  // ---------- side walls (angular plates) ----------
  for (const s of [1, -1]) {
    // lower wall
    box(0.12, 0.42, 2.1, hullPaint, s * 1.06, 1.3, -1.65);
    // sloped upper plate
    b.part(new THREE.BoxGeometry(0.1, 0.22, 2.1), P.armor, { bone, at: [s * 1.1, 1.58, -1.65], rotation: [0, 0, -s * 12] });
    // hazard stripe along top
    b.part(new THREE.BoxGeometry(0.02, 0.07, 1.8), "#ffffff", {
      bone, at: [s * 1.135, 1.37, -1.65], texture: hazard,
    });
    // rivets
    for (let i = 0; i < 7; i++) rivet(s * 1.125, 1.18, -0.85 - i * 0.3, [s, 0, 0]);
    for (let i = 0; i < 7; i++) rivet(s * 1.125, 1.46, -0.85 - i * 0.3, [s, 0, 0]);
    // vertical ribs
    for (let i = 0; i < 4; i++) box(0.04, 0.4, 0.06, P.hullDark, s * 1.13, 1.3, -1.0 - i * 0.55);
    // fender flare over rear thruster (angular wedge)
    b.part(new THREE.BoxGeometry(0.42, 0.14, 1.1), P.armor, { bone, at: [s * 1.19, 1.0, -1.75], rotation: [0, 0, -s * 14] });
    b.part(new THREE.BoxGeometry(0.1, 0.34, 1.2), hullPaint, { bone, at: [s * 1.31, 0.82, -1.75], rotation: [0, 0, s * 8] });
    b.part(new THREE.BoxGeometry(0.1, 0.24, 0.1), P.armor, { bone, at: [s * 1.24, 0.95, -2.34] , rotation: [0, 0, -s * 20]});
    box(0.46, 0.07, 0.06, P.trim, s * 1.19, 1.06, -2.33);
    // sill neon
    glow(box(0.03, 0.04, 2.0, P.neonCyan, s * 1.145, 0.62, -1.7), 1.5);
    // lashing hooks
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.TorusGeometry(0.04, 0.012, 4, 8), P.metal, { bone, at: [s * 0.99, 1.54, -1.0 - i * 0.7], rotation: [0, 90, 0] });
    }
  }

  // ---------- front wall (headboard) ----------
  box(2.2, 0.55, 0.1, hullPaint, 0, 1.33, -0.68);
  box(2.2, 0.08, 0.14, P.armor, 0, 1.64, -0.7);
  b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone, at: [0.55, 1.35, -0.74], dir: [0, 0, -1], axis: "z", texture: glyph });
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { bone, at: [-0.6, 1.35, -0.74], dir: [0, 0, -1], axis: "z", texture: glyph }), 1);

  // ---------- tailgate ----------
  box(2.15, 0.46, 0.1, hullPaint, 0, 1.3, -2.58);
  b.part(new THREE.BoxGeometry(2.15, 0.2, 0.09), P.armor, { bone, at: [0, 1.6, -2.56], rotation: [-12, 0, 0] });
  b.part(new THREE.PlaneGeometry(0.9, 0.56), "#ffffff", { bone, at: [0, 1.32, -2.635], dir: [0, 0, -1], axis: "z", texture: stencil });
  b.part(new THREE.PlaneGeometry(1.4, 0.16), "#ffffff", { bone, at: [0, 1.58, -2.65], dir: [0, 0, -1], axis: "z", texture: hazard });
  for (let i = 0; i < 9; i++) {
    rivet(-0.95 + i * 0.2375, 1.1, -2.64, [0, 0, -1]);
    rivet(-0.95 + i * 0.2375, 1.5, -2.64, [0, 0, -1]);
  }
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.08, P.metal, s * 0.8, 1.18, -2.64);
    box(0.08, 0.5, 0.06, P.hullDark, s * 1.0, 1.3, -2.64);
  }

  // ---------- rear bumper ----------
  box(2.4, 0.3, 0.22, P.armor, 0, 0.78, -2.72);
  b.part(new THREE.BoxGeometry(2.0, 0.12, 0.2), P.hullDark, { bone, at: [0, 0.66, -2.76], rotation: [20, 0, 0] });
  b.part(new THREE.PlaneGeometry(1.6, 0.1), "#ffffff", { bone, at: [0, 0.78, -2.835], dir: [0, 0, -1], axis: "z", texture: hazard });
  glow(box(2.2, 0.035, 0.04, P.neonMagenta, 0, 0.95, -2.85), 2);
  for (const s of [1, -1]) {
    glow(b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { bone, at: [s * 0.95, 1.0, -2.645], dir: [0, 0, -1], axis: "z", texture: tail }), 1.6);
    glow(box(0.1, 0.1, 0.05, P.red, s * 1.1, 0.78, -2.84), 1.6);
    // tow hook
    b.part(new THREE.TorusGeometry(0.06, 0.016, 4, 8), P.metal, { bone, at: [s * 0.7, 0.62, -2.84] });
  }

  // ---------- rear exhaust vent ----------
  box(0.4, 0.2, 0.1, P.hullDark, 0.0, 0.58, -2.8);
  for (let i = 0; i < 4; i++) glow(box(0.34, 0.02, 0.03, P.ventOrange, 0, 0.52 + i * 0.045, -2.86), 1.4);

  // ---------- ammo crates ----------
  const crate = (x: number, z: number, y: number, rot: number) => {
    b.part(new THREE.BoxGeometry(0.5, 0.3, 0.38), CRATE, { bone, at: [x, y, z], rotation: [0, rot, 0] });
    b.part(new THREE.BoxGeometry(0.52, 0.04, 0.4), P.hullDark, { bone, at: [x, y + 0.14, z], rotation: [0, rot, 0] });
    b.part(new THREE.BoxGeometry(0.06, 0.32, 0.4), P.trim, { bone, at: [x, y, z], rotation: [0, rot, 0] });
  };
  crate(0.65, -1.0, 1.21, 8);
  crate(0.7, -1.45, 1.21, -5);
  crate(0.68, -1.2, 1.5, 20);

  // ---------- spare thruster cell ----------
  const cx = -0.55, cz = -2.1;
  b.part(new THREE.CylinderGeometry(0.28, 0.3, 0.5, 8), CELL, { bone, at: [cx, 1.31, cz], flat: true });
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 8), P.metal, { bone, at: [cx, 1.18, cz] });
  b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 8), P.metal, { bone, at: [cx, 1.44, cz] });
  glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), P.neonCyan, { bone, at: [cx, 1.57, cz] }), 1.6);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 6), P.ventOrange, { bone, at: [cx, 1.62, cz] });
  glow(b.part(new THREE.TorusGeometry(0.3, 0.015, 4, 12), P.neonCyan, { bone, at: [cx, 1.31, cz], rotation: [90, 0, 0] }), 1.4);

  // ---------- jerrycans ----------
  for (let i = 0; i < 3; i++) {
    const x = 0.88 - i * 0.0, z = -2.05 - i * 0.2;
    b.part(new THREE.BoxGeometry(0.2, 0.34, 0.3), JERRY, { bone, at: [0.78 + 0.0 * x, 1.23, z], rotation: [0, i * 4 - 4, 0] });
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.1), P.metal, { bone, at: [0.78, 1.43, z + 0.04] });
    b.part(new THREE.BoxGeometry(0.202, 0.03, 0.2), P.hullDark, { bone, at: [0.78, 1.28, z] });
  }

  // ---------- straps ----------
  for (const z of [-1.0, -1.45]) {
    b.part(new THREE.BoxGeometry(0.62, 0.025, 0.07), STRAP, { bone, at: [0.67, 1.7, z + 0.0] });
  }
  b.part(new THREE.BoxGeometry(0.06, 0.4, 0.07), STRAP, { bone, at: [0.38, 1.5, -1.0] });
  b.part(new THREE.BoxGeometry(0.06, 0.4, 0.07), STRAP, { bone, at: [0.96, 1.5, -1.0] });
  b.part(new THREE.BoxGeometry(1.0, 0.02, 0.06), STRAP, { bone, at: [-0.55, 1.58, -2.1] });
  b.part(new THREE.BoxGeometry(1.0, 0.02, 0.06), STRAP, { bone, at: [-0.55, 1.58, -2.1], rotation: [0, 90, 0] });

  // ---------- gun ring base ----------
  const [gx, gy, gz] = M.gunRing;
  b.part(new THREE.CylinderGeometry(0.42, 0.48, 0.14, 10), metalPaint, { bone, at: [gx, 1.1, gz], flat: true });
  b.part(new THREE.CylinderGeometry(0.3, 0.38, 0.12, 10), rustPaint, { bone, at: [gx, 1.2, gz], flat: true });
  b.part(new THREE.TorusGeometry(0.4, 0.025, 4, 14), P.trim, { bone, at: [gx, 1.18, gz], rotation: [90, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    rivet(gx + Math.cos(a) * 0.44, 1.14, gz + Math.sin(a) * 0.44, [Math.cos(a), 0.4, Math.sin(a)]);
  }

  // ---------- antenna ----------
  const ax = -1.1, az = -0.8;
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 6), P.hullDark, { bone, at: [ax, 1.7, az] });
  b.rod([ax, 1.72, az], [ax - 0.05, 2.6, az - 0.1], [0.012, 0.005], P.rubber, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonMagenta, { bone, at: [ax - 0.05, 2.6, az - 0.1] }), 2);
  b.part(new THREE.BoxGeometry(0.2, 0.01, 0.01), P.metal, { bone, at: [ax - 0.02, 2.2, az - 0.04] });

  // ---------- neon rear strip under floor ----------
  glow(box(2.0, 0.03, 0.03, P.neonCyan, 0, 0.5, -2.7), 1.5);
  glow(box(0.03, 0.03, 1.6, P.neonMagenta, 0.0, 0.47, -1.85), 0.0 + 1.2);

  // ---------- scattered small bolts on the floor ----------
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 5), P.metal, {
      bone, at: [-0.9 + R() * 1.8, 1.075, -0.9 - R() * 1.5],
    });
  }
}
```

<!-- call: cabShell -->

```ts
import * as THREE from "three";
import { svg } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabShell({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const cb = M.cabBase;
  void cb;

  // ---------- textures ----------
  const glassTex = svg(
    `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100" height="6" fill="#0e2a3a"/>
      <polygon points="8,0 26,0 8,50 -10,50" fill="#0e2a3a"/>
      <polygon points="30,0 36,0 18,50 12,50" fill="#3fb6d6"/>
      <polygon points="40,0 44,0 26,50 22,50" fill="#2a7f9c"/>
      <polygon points="64,0 86,0 68,50 46,50" fill="#0e2a3a"/>
      <polygon points="90,0 96,0 78,50 72,50" fill="#3fb6d6"/>
      <rect x="0" y="44" width="100" height="6" fill="#0e2a3a"/>
    </svg>`,
    { size: 256 },
  );
  const tigerTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#15171c"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#e7b814" stroke-width="3"/>
      <circle cx="26" cy="27" r="11" fill="#ff8a1c" stroke="#15171c" stroke-width="2.5"/>
      <circle cx="74" cy="27" r="11" fill="#ff8a1c" stroke="#15171c" stroke-width="2.5"/>
      <path d="M50 20 L72 30 L80 52 L68 76 L50 84 L32 76 L20 52 L28 30Z" fill="#ff8a1c" stroke="#15171c" stroke-width="3"/>
      <path d="M50 22 L46 34 L54 34Z M28 42 L40 46 M26 54 L38 54 M72 42 L60 46 M74 54 L62 54" stroke="#15171c" stroke-width="4" fill="#15171c" stroke-linecap="round"/>
      <path d="M36 62 Q50 72 64 62 L62 76 Q50 82 38 76Z" fill="#e8ecf2"/>
      <path d="M30 46 L44 50 L40 56 L28 52Z M70 46 L56 50 L60 56 L72 52Z" fill="#d6283a" stroke="#15171c" stroke-width="2"/>
      <circle cx="38" cy="52" r="2.4" fill="#2ff3ff"/><circle cx="62" cy="52" r="2.4" fill="#2ff3ff"/>
      <path d="M44 62 L56 62 L50 68Z" fill="#15171c"/>
      <path d="M50 68 L50 74 M44 77 Q50 74 56 77" stroke="#15171c" stroke-width="2" fill="none"/>
    </svg>`,
    { size: 256 },
  );
  const hudTex = svg(
    `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" fill="#04202a"/>
      <rect x="1" y="1" width="118" height="38" fill="none" stroke="#2ff3ff" stroke-width="1.5"/>
      <circle cx="26" cy="21" r="14" fill="none" stroke="#2ff3ff" stroke-width="1.5"/>
      <circle cx="26" cy="21" r="7" fill="none" stroke="#2ff3ff" stroke-width="1"/>
      <path d="M26 21 L36 12" stroke="#ff8a1c" stroke-width="2"/>
      <circle cx="33" cy="26" r="2" fill="#ff2fa8"/>
      <rect x="50" y="8" width="60" height="5" fill="#2ff3ff"/>
      <rect x="50" y="17" width="42" height="5" fill="#2ff3ff"/>
      <rect x="50" y="26" width="52" height="5" fill="#ff8a1c"/>
      <text x="88" y="37" font-size="6" font-family="monospace" fill="#2ff3ff">HOVER 0.35M</text>
    </svg>`,
    { size: 256 },
  );
  const hazardTex = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#e7b814"/>${Array.from(
      { length: 9 },
      (_, i) => `<polygon points="${i * 8 - 4},8 ${i * 8},8 ${i * 8 + 4},0 ${i * 8},0" fill="#15171c"/>`,
    ).join("")}</svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, color: any, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at: [x, y, z], ...(rot ? { rotation: rot as any } : {}) });
  const plane = (w: number, h: number, tex: THREE.Texture, at: number[], dir: number[], up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      bone,
      at: at as any,
      dir: dir as any,
      axis: "z",
      texture: tex,
      ...(up ? { up: up as any } : {}),
    });
  const rod = (a: number[], c: number[], r: number, color: any) => b.rod(a as any, c as any, r, color, { bone, sides: 6 } as any);
  const HULL = panelled(P.hull, { size: 0.4, aspect: 0.6, rivets: 0.06 });
  const ARMOR = panelled(P.armor, { size: 0.3, aspect: 0.7, rivets: 0.05 });
  const STEEL = metal("steel");

  // ---------- lower cab body ----------
  box(2.1, 0.52, 1.8, HULL, 0, 1.26, 0.3);
  // sloped cowl wedge in front
  box(2.0, 0.1, 0.16, P.hullDark, 0, 1.55, 1.12, [-20, 0, 0]);
  // belt rail
  box(2.14, 0.04, 1.84, P.hullDark, 0, 1.52, 0.3);
  // neon trim lines
  for (const s of [1, -1]) {
    glow(box(0.02, 0.025, 1.7, P.neonCyan, s * 1.065, 1.5, 0.3), 1.4);
    glow(box(0.02, 0.02, 1.7, P.neonMagenta, s * 1.065, 1.05, 0.3), 1.2);
  }

  // ---------- roof (faceted profile) ----------
  b.extrude(
    [
      [-0.62, 1.92],
      [0.9, 1.92],
      [0.9, 1.98],
      [0.6, 2.02],
      [-0.4, 2.02],
      [-0.62, 1.97],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: ARMOR, bone },
  );
  glow(box(2.2, 0.02, 0.02, P.neonCyan, 0, 1.935, 0.905), 1.4);
  glow(box(2.2, 0.02, 0.02, P.neonMagenta, 0, 1.94, -0.63), 1.3);

  // ---------- pillars ----------
  for (const s of [1, -1]) {
    // A pillars raked
    rod([s * 1.0, 1.5, 1.1], [s * 1.0, 1.93, 0.78], 0.045, P.hull);
    // B pillar
    box(0.1, 0.42, 0.12, P.hull, s * 1.0, 1.72, 0.14);
    // C pillar
    box(0.1, 0.44, 0.14, P.hull, s * 1.0, 1.72, -0.52);
    // rails above and below windows
    box(0.08, 0.04, 1.4, P.hullDark, s * 1.0, 1.54, 0.2);
    box(0.08, 0.04, 1.4, P.hullDark, s * 1.0, 1.92, 0.15);
    // anti-intrusion bars on windows
    for (const z of [0.3, 0.45, 0.6, -0.1, -0.25, -0.38]) rod([s * 1.04, 1.56, z], [s * 1.04, 1.92, z], 0.012, P.rubber);
  }

  // ---------- glass ----------
  // windshield
  b.part(new THREE.PlaneGeometry(1.9, 0.52), "#ffffff", { bone, at: [0, 1.725, 0.94], rotation: [-37.9, 0, 0], texture: glassTex });
  for (const s of [1, -1]) {
    plane(0.5, 0.37, glassTex, [s * 1.0, 1.735, 0.46], [s, 0, 0]);
    plane(0.52, 0.37, glassTex, [s * 1.0, 1.735, -0.18], [s, 0, 0]);
  }
  // rear window and back wall frame
  box(2.1, 0.15, 0.1, HULL, 0, 1.58, -0.55);
  plane(1.7, 0.37, glassTex, [0, 1.735, -0.56], [0, 0, -1]);

  // ---------- doors ----------
  const door = (w: number) => [
    [0, 0.04],
    [0.08, 0],
    [w - 0.08, 0],
    [w, 0.06],
    [w, 0.36],
    [w - 0.1, 0.42],
    [0.1, 0.42],
    [0, 0.34],
  ];
  for (const s of [1, -1]) {
    b.extrude(door(0.82), { at: [s * 1.075, 1.06, 0.2], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, color: ARMOR, bone });
    b.extrude(door(0.58), { at: [s * 1.075, 1.06, -0.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.04, bevel: 0.01, color: ARMOR, bone });
    box(0.05, 0.035, 0.15, STEEL, s * 1.11, 1.4, 0.28);
    box(0.05, 0.035, 0.15, STEEL, s * 1.11, 1.4, -0.38);
    plane(0.4, 0.4, tigerTex, [s * 1.098, 1.27, 0.62], [s, 0, 0]);
    plane(0.55, 0.07, hazardTex, [s * 1.098, 1.1, -0.22], [s, 0, 0]);
    // side mirror
    rod([s * 1.06, 1.64, 0.84], [s * 1.17, 1.74, 0.84], 0.015, P.hullDark);
    box(0.05, 0.17, 0.12, P.hullDark, s * 1.18, 1.76, 0.82);
    plane(0.1, 0.15, glassTex, [s * 1.18, 1.76, 0.757], [0, 0, -1]);
  }

  // ---------- roll cage and light bar ----------
  for (const s of [1, -1]) {
    for (const z of [-0.4, 0.5]) rod([s * 0.85, 2.0, z], [s * 0.85, 2.075, z], 0.025, P.metal);
    rod([s * 0.85, 2.075, -0.4], [s * 0.85, 2.075, 0.5], 0.022, P.metal);
  }
  rod([-0.85, 2.075, -0.4], [0.85, 2.075, -0.4], 0.022, P.metal);
  rod([-0.85, 2.075, 0.5], [0.85, 2.075, 0.5], 0.022, P.metal);
  rod([-0.85, 2.075, -0.4], [0.85, 2.075, 0.5], 0.015, P.metal);
  rod([0.85, 2.075, -0.4], [-0.85, 2.075, 0.5], 0.015, P.metal);
  box(1.7, 0.07, 0.1, P.hullDark, 0, 2.06, 0.7);
  for (let i = 0; i < 6; i++) glow(box(0.2, 0.045, 0.02, P.white, -0.65 + i * 0.26, 2.06, 0.755), 1.6);
  for (const s of [1, -1]) box(0.06, 0.04, 0.1, P.metal, s * 0.9, 2.03, 0.7);

  // ---------- interior ----------
  const seat = (x: number, z: number, w: number) => {
    box(w, 0.12, 0.45, P.rubber, x, 1.6, z);
    box(w, 0.4, 0.1, P.rubber, x, 1.82, z - 0.22, [-10, 0, 0]);
    box(w * 0.4, 0.12, 0.08, P.hullDark, x, 2.0, z - 0.25);
    box(w * 0.9, 0.06, 0.4, P.hullDark, x, 1.54, z);
  };
  seat(0.45, 0.25, 0.5);
  seat(-0.45, 0.25, 0.5);
  seat(0, -0.3, 1.7);
  // dash
  box(1.9, 0.24, 0.38, P.hullDark, 0, 1.64, 0.69);
  glow(plane(0.7, 0.21, hudTex, [0, 1.765, 0.68], [0, 1, -0.45]), 1.3);
  glow(box(0.2, 0.02, 0.1, P.ventOrange, -0.65, 1.765, 0.72), 1.2);
  // steering wheel
  b.part(new THREE.TorusGeometry(0.13, 0.018, 5, 10), P.rubber, { bone, at: [0.45, 1.82, 0.47], dir: [0, 0.5, -1], axis: "z" });
  rod([0.45, 1.82, 0.47], [0.45, 1.72, 0.62], 0.02, P.metal);
  box(0.22, 0.02, 0.02, P.rubber, 0.45, 1.82, 0.47, [-28, 0, 0]);
  // rear panel (cab back wall) lower & armor plate
  box(2.0, 0.3, 0.06, ARMOR, 0, 1.32, -0.62);
  glow(box(1.4, 0.025, 0.02, P.neonMagenta, 0, 1.52, -0.64), 1.2);
}
```

<!-- call: fit-frontEnd -->

The fender flare block is the only one reaching outside the box, so I'm rewriting it to fit within x ±1.25 and z ≥ 1.3.

<<<<<<< SEARCH
    put(box(0.5, 0.12, 1.2), armorPaint, [x, 1.1, 1.75]);
    put(box(0.2, 0.55, 1.2), armorPaint, [s * 1.33, 0.88, 1.75], { rotation: [0, 0, s * -8] });
    put(box(0.2, 0.5, 0.1), armorPaint, [s * 1.2, 0.88, 2.4], { rotation: [-10, 0, 0] });
    put(box(0.2, 0.5, 0.1), armorPaint, [s * 1.2, 0.88, 1.1], { rotation: [10, 0, 0] });
    put(box(0.14, 0.04, 1.1), P.trim, [s * 1.2, 1.17, 1.75]);
    for (let i = 0; i < 4; i++) put(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.metal, [s * 1.43, 1.0, 1.35 + i * 0.27], { rotation: [0, 0, 90] });
    glow(put(box(0.03, 0.03, 1.0), P.neonCyan, [s * 1.44, 0.68, 1.75]), 1.4);
=======
    put(box(0.4, 0.12, 0.9), armorPaint, [s * 1.0, 1.1, 1.8]);
    put(box(0.16, 0.5, 0.9), armorPaint, [s * 1.16, 0.88, 1.8]);
    put(box(0.16, 0.45, 0.08), armorPaint, [s * 1.1, 0.88, 2.28]);
    put(box(0.16, 0.45, 0.08), armorPaint, [s * 1.1, 0.88, 1.36]);
    put(box(0.12, 0.04, 0.85), P.trim, [s * 1.1, 1.17, 1.8]);
    for (let i = 0; i < 4; i++) put(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.metal, [s * 1.24, 1.0, 1.45 + i * 0.22], { rotation: [0, 0, 90] });
    glow(put(box(0.03, 0.03, 0.85), P.neonCyan, [s * 1.23, 0.68, 1.8]), 1.4);
>>>>>>> REPLACE

<!-- call: fit-chassis -->

Fixes: pull the diffuser and its fins inside the z and y limits, narrow the pylons so they stay within x = ±1.1, and shorten the tow shackles.

<<<<<<< SEARCH
    { at: [0, 0.42, -2.45], x: [0, 0, -1], y: [0, 1, 0], thickness: 1.5, color: P.hullDark, bone: body, name: "diffuser" },
=======
    { at: [0, 0.42, -2.3], x: [0, 0, -1], y: [0, 1, 0], thickness: 1.5, color: P.hullDark, bone: body, name: "diffuser" },
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(0.04, 0.2, 0.55, P.rubber, [-0.6 + i * 0.24, 0.36, -2.72], { rotation: [-14, 0, 0] });
=======
    box(0.04, 0.12, 0.4, P.rubber, [-0.6 + i * 0.24, 0.43, -2.55], { rotation: [-8, 0, 0] });
>>>>>>> REPLACE

<<<<<<< SEARCH
    const root: number[] = [s * 0.95, 0.85, m[2]];
    const tip: number[] = [s * 1.1, m[1] + 0.02, m[2]];
=======
    const root: number[] = [s * 0.8, 0.85, m[2]];
    const tip: number[] = [s * 0.95, m[1] + 0.02, m[2]];
>>>>>>> REPLACE

<<<<<<< SEARCH
        [s * 0.5, 0.62, 2.78],
        [s * 0.5, 0.52, 2.95],
        [s * 0.42, 0.52, 2.95],
        [s * 0.42, 0.62, 2.78],
=======
        [s * 0.5, 0.62, 2.7],
        [s * 0.5, 0.54, 2.78],
        [s * 0.42, 0.54, 2.78],
        [s * 0.42, 0.62, 2.7],
>>>>>>> REPLACE

<!-- call: fit-cargoBed -->

The antenna is the main offender, so I'm shortening it and pulling it inside the box. The fender flares are narrowed and moved inward.

<<<<<<< SEARCH
  const ax = -1.1, az = -0.8;
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 6), P.hullDark, { bone, at: [ax, 1.7, az] });
  b.rod([ax, 1.72, az], [ax - 0.05, 2.6, az - 0.1], [0.012, 0.005], P.rubber, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonMagenta, { bone, at: [ax - 0.05, 2.6, az - 0.1] }), 2);
  b.part(new THREE.BoxGeometry(0.2, 0.01, 0.01), P.metal, { bone, at: [ax - 0.02, 2.2, az - 0.04] });
=======
  const ax = -1.1, az = -0.8;
  b.part(new THREE.CylinderGeometry(0.05, 0.07, 0.06, 6), P.hullDark, { bone, at: [ax, 1.56, az] });
  b.rod([ax, 1.58, az], [ax - 0.03, 1.74, az - 0.05], [0.01, 0.005], P.rubber, { bone });
  glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.neonMagenta, { bone, at: [ax - 0.03, 1.75, az - 0.05] }), 2);
=======
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.42, 0.14, 1.1), P.armor, { bone, at: [s * 1.19, 1.0, -1.75], rotation: [0, 0, -s * 14] });
    b.part(new THREE.BoxGeometry(0.1, 0.34, 1.2), hullPaint, { bone, at: [s * 1.31, 0.82, -1.75], rotation: [0, 0, s * 8] });
    b.part(new THREE.BoxGeometry(0.1, 0.24, 0.1), P.armor, { bone, at: [s * 1.24, 0.95, -2.34] , rotation: [0, 0, -s * 20]});
    box(0.46, 0.07, 0.06, P.trim, s * 1.19, 1.06, -2.33);
=======
    b.part(new THREE.BoxGeometry(0.3, 0.14, 1.1), P.armor, { bone, at: [s * 1.1, 1.0, -1.75], rotation: [0, 0, -s * 14] });
    b.part(new THREE.BoxGeometry(0.1, 0.34, 1.2), hullPaint, { bone, at: [s * 1.19, 0.82, -1.75], rotation: [0, 0, s * 8] });
    b.part(new THREE.BoxGeometry(0.1, 0.24, 0.1), P.armor, { bone, at: [s * 1.18, 0.95, -2.34] , rotation: [0, 0, -s * 20]});
    box(0.3, 0.07, 0.06, P.trim, s * 1.1, 1.06, -2.33);
>>>>>>> REPLACE

<!-- call: fit-thrusters -->

The nacelles sat on the raw mounts, so their outer cowls and decals ended up at x = ±1.73 and the skid tips at z = ±2.40. I moved each nacelle centre 0.5 m toward the body's centreline in x and 0.1 m inward in z, and lowered the fender frustum so it stays under y = 1. This keeps the design and details as they were.

<<<<<<< SEARCH
    const cx = mx;
    const cz = mz;
=======
    const cx = mx - s * 0.5;
    const cz = mz - f * 0.1;
>>>>>>> REPLACE
<<<<<<< SEARCH
      place(-s * 0.5, 0.78, 0),
      place(-s * 0.1, 0.78, 0),
=======
      place(-s * 0.5, 0.7, 0),
      place(-s * 0.1, 0.7, 0),
>>>>>>> REPLACE
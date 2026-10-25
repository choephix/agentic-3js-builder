<!-- call: plan -->

```json
{
  "name": "Warhound 77 Armored Hauler",
  "description": "A low-poly cyberpunk militarized 6x6 truck from 2077 with armored cab, roof turret, neon trim and a modular cargo bed.",
  "builderName": "warhoundTruck",
  "size": [2.8, 3.1, 8.0],
  "layout": "A long, heavy 6x6 hauler facing +Z. Front: a wedge armored hood with a glowing cyan light bar, a slatted grille, a plow bumper and a winch. Behind the hood is a tall angular cab with slit windshield glass and side armor skirts, and a roof turret with twin barrels pointing forward. Behind the cab is a long cargo bed with container ribs, hazard stripes, a missile pod rack and rear light cluster. Three axles of big chunky wheels (front, mid, rear) with a wheel arch over each, resting on y=0. Style: faceted angular plates, matte dark gunmetal hull with yellow hazard trim, magenta and cyan neon strips, small glowing vents, antennas, panel seams and rivets painted by place (soot near exhaust, wear on edges, mud at wheels). Everything is built from boxes, wedges, extrudes and lathes with chunky blocky shapes and many small fittings.",
  "palette": {
    "hull": "#3a4150",
    "hullDark": "#20242e",
    "hullLight": "#5a6477",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0e2a3a",
    "rubber": "#15161a",
    "rim": "#8a93a3",
    "steel": "#9aa3b2",
    "rust": "#7a4a2a",
    "ember": "#ff7a2a",
    "olive": "#4b5a3a",
    "white": "#e8eef5",
    "red": "#d6222e"
  },
  "mounts": {
    "deckTop": [0, 1.25, 0],
    "chassisFront": [0, 0.9, 3.9],
    "cabFloor": [0, 1.25, 1.3],
    "cabBack": [0, 1.25, -0.6],
    "bedFront": [0, 1.25, -0.7],
    "bedRear": [0, 1.25, -3.9],
    "turretRing": [0, 3.0, 0.9],
    "axleFront": [0, 0.55, 2.7],
    "axleMid": [0, 0.55, -1.3],
    "axleRear": [0, 0.55, -3.0],
    "muzzle": [0, 3.2, 3.1]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 3.0, 0.9], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.2, 1.1], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.2, 0.55, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.2, 0.55, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.2, 0.55, -1.3], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.2, 0.55, -1.3], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.2, 0.55, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.2, 0.55, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Ladder frame and underbody from y=0.35 to 1.25: two long rails, cross members, axle housings and differentials at the three axles, drive shafts, fuel tanks and battery boxes on the sides, exhaust stacks with soot paint, side armor skirts with panel paint and hazard-stripe edges, mud-paint on lower faces. Also the floor deck plate at deckTop with seam paint.",
      "box": [[-1.3, 0.3, -4.0], [1.3, 1.3, 3.5]],
      "attaches": "Deck at deckTop carries cab, bed; wheel arches align to axle mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "wheels",
      "builds": "Six big chunky wheels (radius 0.55, width 0.5), each on its wheel joint: faceted 10-sided tyre lathe with tread blocks, steel rim with bolt ring, hub cap with a glowing cyan ring, brake disc and caliper visible, mud paint at the bottom. Front pair slightly wider hubs with steering knuckle blocks. Spare fittings: wheel fender flaps behind each wheel. Rear and mid wheels may be a dual-wheel pair on each side.",
      "box": [[-1.55, 0, -3.6], [1.55, 1.1, 3.25]],
      "attaches": "Each wheel centred on its axle mount at y=0.55 and its wheel joint.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "frontEnd",
      "builds": "Hood and nose from z=2.0 to 4.0: wedge sloped armored hood, grille with vertical slats and cyan glow behind, plow bumper with hazard-stripe teeth, winch drum and cable hook, twin headlight slits (glowing white) plus magenta underglow strip, fender wheel arches over front wheels, hood vents with ember glow, small antennas, tow hooks, number plate decal, armor rivet paint.",
      "box": [[-1.4, 0.35, 2.0], [1.4, 2.0, 4.0]],
      "attaches": "Starts at chassisFront and meets the cab at z=2.0, resting on the deck.",
      "joints": ["body"],
      "floor": false,
      "budget": 140
    },
    {
      "id": "cab",
      "builds": "Tall angular armored cab from z=-0.6 to 2.0, y=1.25 to 2.9: faceted sloped roof, slit windshield with SVG glass reflection texture and wiper, side windows with armored shutters, doors with panel seams and handles, mirrors with cameras, roof rack with searchlights and antennas, side step, interior hint (seats, dash with glowing screens via glow), hazard-stripe trim, a roof hatch ring at turretRing, unit emblem decal on doors.",
      "box": [[-1.35, 1.25, -0.6], [1.35, 3.0, 2.0]],
      "attaches": "Sits on the deck at cabFloor; front edge meets frontEnd; rear edge meets cargoBed at cabBack; roof ring supports the turret at turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "turret",
      "builds": "Roof-mounted remote weapon station on turretYaw and gunPitch: ring base with gear teeth, armored faceted housing, sensor eye with glowing red lens, twin autocannon barrels with muzzle brakes, ammo box with belt feed, ejection port, side missile launcher tubes, hazard stripes, a small antenna and radar dish, painted wear on edges. Barrels point +Z to the muzzle mount.",
      "box": [[-0.8, 2.9, 0.0], [0.8, 3.7, 3.2]],
      "attaches": "Ring base sits on cab roof at turretRing (z=0.9).",
      "joints": ["turretYaw", "gunPitch", "body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "cargoBed",
      "builds": "Armored modular cargo bed from z=-4.0 to -0.7, y=1.25 to 2.6: container shell with vertical ribs, hinged side panels, roof hatches, hazard stripes, orange cargo straps, stacked crates and a strapped fuel drum on top, missile pod rack with six tubes angled up, side tool lockers with latches, corporate emblem decals and stencil text SVG textures, cyan neon edge strip, antenna array, panel seam paint with rust and soot.",
      "box": [[-1.35, 1.25, -4.0], [1.35, 2.9, -0.6]],
      "attaches": "Front wall touches the cab at cabBack; floor sits on deckTop; rear ends at bedRear.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "rearEnd",
      "builds": "Rear of the truck from z=-4.0 to -3.4 plus the rear bumper: tail light cluster (red glow) with magenta strip, heavy rear bumper with step and hitch ball, tow chains, rear ramp door with hinges and big hazard chevron decal, license plate decal, exhaust stacks up the rear corners of the bed with ember glow, mud flaps, rear camera and a spare tyre on a rack, rear sensor light bar.",
      "box": [[-1.4, 0.3, -4.3], [1.4, 2.8, -3.4]],
      "attaches": "Meets cargoBed at bedRear; bumper hangs from chassis end.",
      "joints": ["body"],
      "floor": false,
      "budget": 90
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(77);

  // paints
  const mud = paint((p, n) => {
    const low = smoothstep(0.9, 0.35, p.y);
    const m = noise(p, 0.18, 4);
    return mix(P.hullDark, P.rust, Math.min(1, low * (0.5 + m * 0.7)) * 0.8);
  });
  const frame = paint((p, n) => {
    const base = mix(P.hullDark, P.hull, noise(p, 0.3, 2) * 0.5);
    return mix(base, mud.at(p, n), smoothstep(0.7, 0.4, p.y) * 0.6);
  });
  const deckPaint = paint((p, n) => {
    const gx = Math.abs(((p.x / 0.5) % 1 + 1) % 1 - 0.5) < 0.012;
    const gz = Math.abs(((p.z / 0.8) % 1 + 1) % 1 - 0.5) < 0.012;
    const c = mix(P.hullDark, P.hullLight, noise(p, 0.4, 9) * 0.45);
    return gx || gz ? mix(c, "#000000", 0.6) : c;
  });
  const skirt = paint((p, n) => {
    const gz = Math.abs(((p.z / 0.9) % 1 + 1) % 1 - 0.5) < 0.014;
    const gy = Math.abs(((p.y - 0.35) / 0.3) % 1 - 0.5) < 0.014;
    let c: any = mix(P.hull, P.hullDark, noise(p, 0.25, 6) * 0.5);
    if (gz || gy) c = mix(c, "#000000", 0.5);
    return mix(c, P.rust, smoothstep(0.7, 0.35, p.y) * 0.6 * noise(p, 0.15, 3));
  });
  const soot = paint((p, n) => mix(P.steel, "#0a0a0c", smoothstep(0.2, 0.9, (p.y - 0.5) / 0.9) * 0.0 + smoothstep(0, 1, noise(p, 0.12, 5)) * 0.35 + smoothstep(1.2, 1.9, p.y) * 0.55));
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15161a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );

  const box = (sx: number, sy: number, sz: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), col, { bone, at, ...extra });
  const cyl = (r: number, h: number, seg: number, col: any, at: number[], dir: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at, dir, ...extra });

  // deck plate
  box(2.5, 0.06, 7.4, deckPaint, [0, 1.22, -0.25]);
  // deck edge trim
  for (const s of [1, -1]) box(0.05, 0.08, 7.4, P.trim, [s * 1.27, 1.2, -0.25]);

  // rails
  for (const s of [1, -1]) {
    box(0.16, 0.3, 7.2, frame, [s * 0.55, 1.03, -0.25]);
    box(0.3, 0.05, 7.2, P.hullDark, [s * 0.55, 1.2, -0.25]);
    box(0.3, 0.05, 7.2, P.hullDark, [s * 0.55, 0.88, -0.25]);
    // rivets
    for (let z = -3.7; z < 3.4; z += 0.5) {
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone, at: [s * 0.64, 1.03, z] });
    }
  }
  // cross members
  for (let z = -3.8; z <= 3.4; z += 0.9) {
    box(1.3, 0.14, 0.12, frame, [0, 0.98, z]);
    box(1.3, 0.04, 0.2, P.hullDark, [0, 1.07, z]);
  }

  // axles
  for (const [az, name] of [[2.7, "F"], [-1.3, "M"], [-3, "R"]] as [number, string][]) {
    cyl(0.08, 2.4, 8, P.steel, [0, 0.55, az], [1, 0, 0]);
    // housing
    cyl(0.14, 1.4, 8, P.hullDark, [0, 0.55, az], [1, 0, 0]);
    // differential
    b.part(new THREE.SphereGeometry(0.28, 8, 6), P.hullLight, { bone, at: [0, 0.55, az + 0.04], scale: [1, 0.9, 0.9] });
    cyl(0.1, 0.1, 8, P.steel, [0, 0.55, az + 0.3], [0, 0, 1]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.02, 4, 3), P.steel, { bone, at: [Math.cos(a) * 0.2, 0.55 + Math.sin(a) * 0.2, az + 0.33] });
    }
    // leaf springs
    for (const s of [1, -1]) {
      box(0.1, 0.05, 0.9, P.hullLight, [s * 0.55, 0.78, az]);
      box(0.1, 0.04, 0.7, P.hullDark, [s * 0.55, 0.74, az]);
      box(0.14, 0.12, 0.1, P.steel, [s * 0.55, 0.86, az + 0.2]);
    }
  }

  // drive shafts
  cyl(0.06, 4.0, 8, P.steel, [0, 0.7, 0.9], [0, 0, 1]);
  cyl(0.06, 1.7, 8, P.steel, [0, 0.7, -2.15], [0, 0, 1]);
  for (const z of [2.0, -0.2, -1.4, -2.9]) cyl(0.1, 0.1, 8, P.hullLight, [0, 0.7, z], [0, 0, 1]);

  // fuel tanks and batteries
  for (const s of [1, -1]) {
    cyl(0.27, 1.8, 10, frame, [s * 1.0, 0.82, -2.1], [0, 0, 1]);
    for (const z of [-1.5, -2.7]) cyl(0.285, 0.06, 10, P.steel, [s * 1.0, 0.82, z], [0, 0, 1]);
    cyl(0.07, 0.1, 6, P.red, [s * 1.0, 1.1, -2.1], [0, 1, 0]);
    box(0.5, 0.35, 0.8, P.hullDark, [s * 0.95, 0.85, 0.9]);
    box(0.5, 0.05, 0.82, P.trim, [s * 0.95, 1.04, 0.9]);
    for (const dx of [-0.15, 0.15]) cyl(0.04, 0.06, 6, P.steel, [s * 0.95 + dx, 1.08, 1.1], [0, 1, 0]);
    glow(box(0.3, 0.05, 0.03, P.neonCyan, [s * 1.2, 0.85, 1.32]), 1.3);
    // skirts
    box(0.07, 0.42, 1.0, skirt, [s * 1.28, 0.62, 1.9]);
    box(0.07, 0.42, 1.0, skirt, [s * 1.28, 0.62, 0.4]);
    box(0.07, 0.42, 1.2, skirt, [s * 1.28, 0.62, -2.2]);
    // hazard edge
    for (const [z, l] of [[1.9, 1.0], [0.4, 1.0], [-2.2, 1.2]] as number[][]) {
      b.part(new THREE.PlaneGeometry(l, 0.07), "#ffffff", {
        bone, at: [s * 1.317, 0.43, z], dir: [s, 0, 0], axis: "z", texture: hazard,
      });
    }
    // neon underglow
    glow(box(0.04, 0.04, 6.6, P.neonMagenta, [s * 1.26, 0.33, -0.2]), 1.4);
    // side steps lights
    for (let z = -3.5; z < 3; z += 1.3) box(0.1, 0.1, 0.1, P.hullLight, [s * 1.3, 0.38, z]);
  }

  // exhaust stacks (behind cab, left side)
  for (const s of [1, -1]) {
    const x = s * 1.18;
    cyl(0.1, 1.0, 8, soot, [x, 1.0, -0.8], [0, 1, 0]);
    cyl(0.12, 0.08, 8, P.steel, [x, 1.5, -0.8], [0, 1, 0]);
    cyl(0.05, 0.05, 6, P.ember, [x, 1.55, -0.8], [0, 1, 0]);
    glow(cyl(0.06, 0.02, 6, P.ember, [x, 1.54, -0.8], [0, 1, 0]), 1.5);
    for (const y of [0.7, 1.2]) box(0.2, 0.05, 0.05, P.steel, [x - s * 0.1, y, -0.8]);
  }

  // front bumper mount, tow hooks, skid plate
  box(2.0, 0.12, 0.8, mud, [0, 0.42, 3.1]);
  box(1.2, 0.08, 0.4, P.hullDark, [0, 0.4, -0.2]);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.3, P.red, [s * 0.4, 0.6, 3.5]);
  }
  // rear skid
  box(1.6, 0.1, 0.5, mud, [0, 0.45, -3.8]);
  // jerry bracket details
  for (let i = 0; i < 8; i++) {
    const z = -3.4 + R() * 6.5, s = R() < 0.5 ? 1 : -1;
    box(0.12, 0.08, 0.1, P.steel, [s * 0.5, 0.78, z]);
  }
  // ember vents on deck sides
  for (const s of [1, -1]) for (let z = -3.5; z < 3.3; z += 0.7) {
    glow(box(0.2, 0.02, 0.06, P.ember, [s * 1.15, 1.26, z]), 1.1);
  }
  // cyan chassis strip
  glow(box(0.04, 0.03, 6.8, P.neonCyan, [0, 1.26, -0.25]), 1.2);
}
```

<!-- call: rearEnd -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildRearEnd({ b, J, P }: Ctx) {
  const body = J.body;
  const R = rng(77);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: body, at, ...o });
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);

  // ---------- paints ----------
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, noise(p, 0.3, 4)) * 0.5 + Math.max(n.y, 0) * 0.2);
    const mud = smoothstep(0.9, 0.35, p.y) * smoothstep(0.4, 0.7, noise(p, 0.12, 9));
    const seam = Math.abs(((p.x * 3.3) % 1)) < 0.015 ? 0.6 : 0;
    return mix(mix(base, P.rust, mud * 0.8), P.hullDark, seam);
  });
  const BUMP = paint((p, n) => {
    const base = mix(P.hullDark, P.hull, noise(p, 0.2, 3));
    return mix(base, P.rust, smoothstep(0.55, 0.8, noise(p, 0.1, 6)) * 0.5 * (n.y < 0.5 ? 1 : 0.3));
  });
  const HAZ = paint((p) => (Math.floor((p.x + p.y) / 0.14) % 2 === 0 ? P.trim : P.hullDark));
  const SOOT = paint((p) => mix(P.hullDark, "#050506", smoothstep(1.2, 2.8, p.y)));
  const TYRE = paint((p) => mix(P.rubber, P.rust, smoothstep(0.55, 0.15, p.y) * 0.5 * noise(p, 0.1, 2)));

  // ---------- textures ----------
  const CHEV = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#20242e"/>` +
      Array.from({ length: 5 }, (_, i) => `<path d="M${i * 26 - 6} 0 L${i * 26 + 20} 32 L${i * 26 - 6} 64 L${i * 26 - 20} 64 L${i * 26 + 6} 32 L${i * 26 - 20} 0Z" fill="#e7b814"/>`).join("") +
      `<rect x="2" y="2" width="124" height="60" fill="none" stroke="#e7b814" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 96 48"><rect width="96" height="48" rx="4" fill="#e8eef5"/><rect x="3" y="3" width="90" height="42" rx="3" fill="none" stroke="#20242e" stroke-width="2"/><text x="48" y="32" font-family="monospace" font-weight="bold" font-size="22" text-anchor="middle" fill="#20242e">WH-2077</text><rect x="6" y="6" width="84" height="5" fill="#2ff3ff"/></svg>`,
    { size: 192 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#20242e"/><circle cx="32" cy="32" r="20" fill="#0e2a3a" stroke="#9aa3b2" stroke-width="3"/><circle cx="32" cy="32" r="9" fill="#2ff3ff"/><circle cx="27" cy="27" r="3" fill="#fff"/></svg>`,
    { size: 128 },
  );
  const TAIL = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#7a0f18"/><rect x="3" y="3" width="26" height="26" fill="#ff3a44"/><rect x="35" y="3" width="26" height="26" fill="#ff3a44"/><path d="M8 16h16M40 16h16" stroke="#ffd0d0" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const faceBack = (g: THREE.BufferGeometry, color: string, at: number[], tex: any, o: any = {}) =>
    put(g, color, at, { texture: tex, dir: [0, 0, -1], axis: "z", ...o });

  // ---------- ramp door (rear face of cargo) ----------
  const door = put(box(2.5, 1.35, 0.1), HULL, [0, 1.95, -3.95]);
  // chevron decal
  faceBack(new THREE.PlaneGeometry(1.9, 0.95), "#ffffff", [0, 2.0, -4.005], CHEV);
  // door frame rim
  put(box(2.64, 0.08, 0.14), P.hullDark, [0, 2.66, -3.95]);
  put(box(2.64, 0.08, 0.14), P.hullDark, [0, 1.27, -3.95]);
  for (const s of [1, -1]) put(box(0.08, 1.45, 0.14), P.hullDark, [s * 1.3, 1.96, -3.95]);
  // vertical ribs
  for (const s of [1, -1]) for (const x of [0.5, 1.0]) put(box(0.05, 1.2, 0.04), P.hullLight, [s * x + (s > 0 ? 0.05 : -0.05), 2.0, -4.0]);
  // hinges and latches
  for (const s of [1, -1]) {
    for (const y of [1.5, 2.4]) {
      put(cyl(0.05, 0.05, 0.22, 8), P.steel, [s * 1.2, y, -4.02]);
      put(box(0.2, 0.1, 0.05), P.steel, [s * 1.1, y, -4.02]);
    }
    put(box(0.14, 0.28, 0.07), P.steel, [s * 0.15, 1.9, -4.03]);
  }
  // hazard header
  put(box(2.5, 0.12, 0.06), HAZ, [0, 2.55, -4.01]);
  // rivets
  const rv = new THREE.SphereGeometry(0.018, 5, 4);
  for (let i = 0; i < 10; i++) for (const y of [1.3, 2.62]) put(rv, P.steel, [-1.15 + i * 0.255, y, -4.03]);

  // ---------- tail light clusters ----------
  for (const s of [1, -1]) {
    put(box(0.34, 0.5, 0.1), P.hullDark, [s * 1.24, 2.0, -4.0]);
    glow(faceBack(new THREE.PlaneGeometry(0.28, 0.42), "#ffffff", [s * 1.24, 2.0, -4.056], TAIL), 1.4);
    glow(put(box(0.05, 0.9, 0.04), P.neonMagenta, [s * 1.0, 2.0, -4.04]), 1.5);
  }
  // sensor light bar
  put(box(1.5, 0.12, 0.1), P.hullDark, [0, 2.78, -3.95]);
  glow(put(box(1.36, 0.06, 0.05), P.neonCyan, [0, 2.78, -4.01]), 1.6);
  glow(put(box(2.3, 0.035, 0.04), P.neonMagenta, [0, 1.4, -4.04]), 1.5);

  // ---------- license plate ----------
  put(box(0.56, 0.3, 0.04), P.hullDark, [0, 1.6, -4.05]);
  faceBack(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", [0, 1.6, -4.075], PLATE);
  put(box(0.5, 0.05, 0.08), P.trim, [0, 1.78, -4.06]);
  // rear camera
  put(box(0.14, 0.12, 0.12), P.hullDark, [0, 2.45, -4.06]);
  faceBack(new THREE.CircleGeometry(0.045, 10), "#ffffff", [0, 2.45, -4.125], LENS);
  put(cyl(0.02, 0.02, 0.1, 6), P.steel, [0, 2.53, -4.02]);

  // ---------- bumper ----------
  put(box(2.7, 0.34, 0.3), BUMP, [0, 0.62, -4.13]);
  put(box(2.5, 0.12, 0.34), HAZ, [0, 0.82, -4.13]);
  put(box(2.3, 0.1, 0.28), P.hullDark, [0, 0.42, -4.1]);
  for (const s of [1, -1]) {
    put(box(0.3, 0.3, 0.34), P.hull, [s * 1.3, 0.62, -4.13]);
    // step plate with grating
    put(box(0.7, 0.05, 0.32), P.steel, [s * 0.85, 0.46, -4.28]);
    for (let i = 0; i < 4; i++) put(box(0.05, 0.03, 0.3), P.hullDark, [s * (0.6 + i * 0.12), 0.49, -4.28]);
    // tow hook
    put(cyl(0.035, 0.035, 0.18, 6), P.red, [s * 0.5, 0.6, -4.33], { dir: [0, 0, 1] });
    b.sweep(
      [[s * 0.5, 0.6, -4.42], [s * 0.5, 0.52, -4.5], [s * 0.5, 0.42, -4.46]],
      0.02,
      { bone: body, color: P.steel, sides: 6 },
    );
  }
  // hitch ball
  put(box(0.2, 0.14, 0.2), P.hullDark, [0, 0.62, -4.32]);
  put(cyl(0.035, 0.05, 0.14, 8), P.steel, [0, 0.74, -4.32]);
  put(new THREE.SphereGeometry(0.075, 8, 6), P.steel, [0, 0.84, -4.32]);

  // tow chains
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.9, 0.7, -4.3], [s * 0.75, 0.55, -4.4], [s * 0.45, 0.5, -4.4], [s * 0.2, 0.6, -4.36],
    ];
    const path = b.catmull ? b.catmull(pts) : pts;
    b.sweep(pts, 0.018, { bone: body, color: P.steel, sides: 5 });
    b.along(pts, 6, (at: any) => {
      b.part(box(0.045, 0.03, 0.06), P.rim, { frame: at, bone: body, at: at.at });
    });
    void path;
  }

  // ---------- spare tyre on rack ----------
  const tyre = b.lathe(
    [[0.2, -0.13], [0.42, -0.13], [0.5, -0.08], [0.5, 0.08], [0.42, 0.13], [0.2, 0.13], [0.2, -0.13]].map(([x, y]) => [x, y]),
    { at: [0, 1.95, -4.2], axis: [0, 0, 1], segments: 10, color: TYRE, bone: body },
  );
  void tyre;
  put(cyl(0.22, 0.22, 0.05, 10), P.rim, [0, 1.95, -4.3], { dir: [0, 0, 1] });
  put(cyl(0.07, 0.07, 0.08, 8), P.hullDark, [0, 1.95, -4.33], { dir: [0, 0, 1] });
  glow(put(cyl(0.1, 0.1, 0.02, 10), P.neonCyan, [0, 1.95, -4.375], { dir: [0, 0, 1] }), 1.2);
  const bolt = new THREE.SphereGeometry(0.02, 5, 4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    put(bolt, P.steel, [Math.cos(a) * 0.15, 1.95 + Math.sin(a) * 0.15, -4.34]);
  }
  // rack: arms and brackets
  for (const s of [1, -1]) {
    put(box(0.06, 0.06, 0.34), P.hullDark, [s * 0.3, 1.5, -4.15]);
    put(box(0.06, 0.7, 0.06), P.hullDark, [s * 0.3, 1.75, -4.3]);
  }
  put(box(0.7, 0.06, 0.06), P.hullDark, [0, 1.42, -4.3]);
  put(box(0.7, 0.06, 0.06), P.trim, [0, 2.42, -4.3]);
  // actually the tyre sits on door; shift mid brace behind
  put(box(0.1, 0.5, 0.06), P.hullLight, [0, 2.2, -4.32]);

  // ---------- exhaust stacks at rear corners ----------
  for (const s of [1, -1]) {
    const x = s * 1.3;
    put(cyl(0.1, 0.12, 1.5, 8), SOOT, [x, 1.95, -3.7]);
    for (const y of [1.5, 2.0, 2.5]) put(cyl(0.135, 0.135, 0.06, 8), P.steel, [x, y, -3.7]);
    put(cyl(0.14, 0.1, 0.16, 8), P.hullDark, [x, 2.76, -3.7]);
    glow(put(cyl(0.08, 0.08, 0.03, 8), P.ember, [x, 2.85, -3.7]), 1.6);
    put(box(0.05, 1.5, 0.12), P.hullLight, [x + s * -0.12, 1.95, -3.6]);
    // brackets to wall
    for (const y of [1.55, 2.4]) put(box(0.18, 0.06, 0.14), P.hullDark, [x - s * 0.08, y, -3.62]);
    // ember vents
    glow(put(box(0.03, 0.2, 0.05), P.ember, [x, 1.8, -3.82]), 1.3);
  }

  // ---------- mud flaps ----------
  for (const s of [1, -1]) {
    put(box(0.06, 0.4, 0.5), P.rubber, [s * 1.18, 0.55, -3.65], {});
    put(box(0.07, 0.08, 0.5), P.trim, [s * 1.18, 0.38, -3.65]);
    put(box(0.08, 0.06, 0.54), P.steel, [s * 1.18, 0.77, -3.65]);
  }
  // underglow
  glow(put(box(2.0, 0.03, 0.04), P.neonMagenta, [0, 0.33, -4.0]), 1.4);
  // side marker lights
  for (const s of [1, -1]) for (const y of [1.4, 2.65]) glow(put(box(0.04, 0.06, 0.12), P.ember, [s * 1.4, y, -3.95]), 1.2);
  void R;
  void door;
}
```

<!-- call: cargoBed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep, countershade, stripes } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoBed({ b, J, P, M }: Ctx) {
  const R = rng(77);
  const body = J.body;
  const Z0 = -4.0, Z1 = -0.7, Y0 = 1.25, Y1 = 2.6;
  const ZC = (Z0 + Z1) / 2, LEN = Z1 - Z0;

  // own colours
  const ORANGE = "#ff7a1a";
  const WOOD = "#8a6a44";
  const DRUM = "#3f6b4a";

  // paints
  const hullPaint = paint((p, n) => {
    const base: [number, number, number] = n.y > 0.5 ? [0.27, 0.3, 0.37] : [0.2, 0.22, 0.28];
    let c = mix(base, [0.14, 0.15, 0.19], 0.5 * (1 - smoothstep(-0.2, 0.9, n.y)));
    // panel seams
    const u = Math.abs(n.x) > 0.5 ? p.z : p.x;
    const fu = ((u / 0.55) % 1 + 1) % 1;
    const fv = (((p.y) / 0.55) % 1 + 1) % 1;
    if (fu < 0.012 || fv < 0.012) c = mix(c, [0.05, 0.05, 0.07], 0.8);
    // rust and soot
    const r = noise(p, 0.3, 4);
    c = mix(c, [0.48, 0.29, 0.16], 0.6 * smoothstep(0.62, 0.8, r) * smoothstep(1.9, 1.3, p.y));
    c = mix(c, [0.05, 0.05, 0.06], 0.5 * smoothstep(0.6, 0.85, noise(p, 0.5, 9)) * smoothstep(0.2, 0.9, n.y));
    return c;
  });
  const hazard = stripes(P.trim, P.hullDark, { size: 0.16, axis: [1, 0, 1], width: 0.5, wobble: 0, seed: 2 });
  const wood = paint((p) => mix("#7a5a38", "#a07c52", noise(p, 0.05, 3)));

  // textures
  const EMBLEM = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#14161c" stroke="#e7b814" stroke-width="6"/><path d="M50 14 L82 70 L18 70Z" fill="none" stroke="#2ff3ff" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="52" r="9" fill="#ff2fa8"/><path d="M20 84 H80" stroke="#e7b814" stroke-width="5"/></svg>`, { size: 128 });
  const STENCIL = svg(`<svg viewBox="0 0 200 60"><rect width="200" height="60" fill="none"/><text x="100" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="26" fill="#e8eef5">WARHOUND</text><text x="100" y="54" text-anchor="middle" font-family="monospace" font-size="16" fill="#e7b814">CARGO-77 // HAZ</text></svg>`, { size: 256 });
  const WARN = svg(`<svg viewBox="0 0 64 64"><path d="M32 6 L60 56 H4Z" fill="#e7b814" stroke="#111" stroke-width="4" stroke-linejoin="round"/><rect x="29" y="22" width="6" height="18" fill="#111"/><rect x="29" y="44" width="6" height="6" fill="#111"/></svg>`, { size: 64 });

  const box = (w: number, h: number, d: number, c: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...opt });
  const decal = (tex: any, at: number[], dir: number[], w: number, h: number, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: body, at, dir, axis: "z", texture: tex, up });

  // floor + main shell
  box(2.7, 0.1, LEN, P.hullDark, [0, Y0 + 0.05, ZC]);
  box(2.5, 1.2, LEN - 0.1, hullPaint, [0, Y0 + 0.7, ZC]);
  // roof plates, slightly sloped
  b.extrude([[-1.25, 0], [1.25, 0], [1.1, 0.14], [-1.1, 0.14]], {
    at: [0, 2.3, ZC], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, color: hullPaint, bone: body });
  box(2.7, 0.08, LEN, P.hull, [0, 2.31, ZC]);
  // front wall armor facing cab
  box(2.7, 1.3, 0.08, P.hullDark, [0, Y0 + 0.75, Z1 - 0.04]);
  // rear wall frame
  box(2.7, 1.3, 0.08, P.hullDark, [0, Y0 + 0.75, Z0 + 0.04]);

  // vertical ribs and sides
  const nRib = 7;
  for (let i = 0; i < nRib; i++) {
    const z = Z0 + 0.25 + (i * (LEN - 0.5)) / (nRib - 1);
    for (const s of [1, -1]) {
      box(0.1, 1.25, 0.1, P.hullLight, [s * 1.3, Y0 + 0.7, z]);
      // rivets
      for (const y of [1.5, 2.0]) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone: body, at: [s * 1.36, y, z] });
    }
    // roof ribs
    box(2.6, 0.06, 0.08, P.hullLight, [0, 2.38, z]);
  }
  // horizontal bands and hazard stripes along bottom + top edges
  for (const s of [1, -1]) {
    box(0.06, 0.12, LEN, hazard, [s * 1.33, Y0 + 0.12, ZC]);
    box(0.06, 0.1, LEN, hazard, [s * 1.33, 2.33, ZC]);
    // cyan neon strip
    glow(box(0.04, 0.04, LEN - 0.2, P.neonCyan, [s * 1.36, 2.22, ZC]), 1.6);
    glow(box(0.04, 0.03, LEN - 0.4, P.neonMagenta, [s * 1.36, 1.42, ZC]), 1.3);
  }
  glow(box(2.4, 0.04, 0.04, P.neonCyan, [0, 2.4, Z1 - 0.12]), 1.5);

  // hinged side panels (with hinge joint-free rigid parts)
  for (const s of [1, -1]) {
    const px = s * 1.33;
    box(0.05, 0.9, 1.5, P.hull, [px + s * 0.01, 1.95, -3.05]);
    box(0.05, 0.9, 1.5, P.hull, [px + s * 0.01, 1.95, -1.55]);
    for (const z of [-3.05, -1.55]) {
      box(0.06, 0.06, 1.4, P.hullLight, [px + s * 0.03, 1.55, z]);
      box(0.06, 0.06, 1.4, P.hullLight, [px + s * 0.03, 2.35, z]);
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 6), P.steel, { bone: body, at: [px + s * 0.04, 2.35, z + 0.65], rotation: [90, 0, 0] });
      box(0.06, 0.12, 0.08, P.trim, [px + s * 0.05, 1.95, z - 0.55]);
    }
    // emblem + stencil
    decal(EMBLEM, [px + s * 0.035, 2.0, -1.55], [s, 0, 0], 0.6, 0.6);
    decal(STENCIL, [px + s * 0.035, 1.72, -3.05], [s, 0, 0], 1.2, 0.36);
    decal(WARN, [px + s * 0.035, 2.05, -3.05], [s, 0, 0], 0.3, 0.3);
    // tool lockers
    const zl = -2.3;
    box(0.2, 0.6, 0.6, P.hullDark, [s * 1.42, 1.65, zl]);
    box(0.02, 0.5, 0.5, P.hull, [s * 1.53, 1.65, zl]);
    box(0.04, 0.1, 0.04, P.trim, [s * 1.55, 1.65, zl + 0.15]);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), P.steel, { bone: body, at: [s * 1.55, 1.8, zl - 0.2], rotation: [0, 0, 90] });
    glow(box(0.02, 0.03, 0.3, P.ember, [s * 1.545, 1.4, zl]), 1.2);
  }

  // roof hatches
  for (const z of [-3.4, -1.9]) {
    box(0.9, 0.06, 0.7, P.hullLight, [-0.1, 2.38, z]);
    box(0.8, 0.04, 0.6, P.hullDark, [-0.1, 2.42, z]);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 8), P.trim, { bone: body, at: [-0.1, 2.46, z] });
    for (const sx of [1, -1]) b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 6), P.steel, { bone: body, at: [-0.1 + sx * 0.4, 2.42, z + 0.3], rotation: [0, 0, 90] });
  }

  // crates on top
  const crate = (x: number, y: number, z: number, s: number, rot: number) => {
    box(s, s, s, wood, [x, y + s / 2, z], { rotation: [0, rot, 0] });
    box(s * 1.02, 0.05, s * 1.02, P.steel, [x, y + 0.1, z], { rotation: [0, rot, 0] });
    box(s * 1.02, 0.05, s * 1.02, P.steel, [x, y + s - 0.1, z], { rotation: [0, rot, 0] });
    box(0.05, s * 1.02, s * 1.02, P.hullDark, [x, y + s / 2, z], { rotation: [0, rot, 0] });
  };
  crate(-0.7, 2.42, -3.45, 0.45, 8);
  crate(-0.2, 2.42, -3.55, 0.4, -12);
  crate(-0.45, 2.87 - 0.45 + 0.0, -3.5, 0.0001, 0);
  crate(-0.5, 2.87, -3.5, 0.38, 20);
  // orange strap over crates
  box(0.05, 0.02, 0.0001 + 0.5, ORANGE, [-0.5, 3.26, -3.5]);
  // fuel drum strapped
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 10), DRUM, { bone: body, at: [0.75, 2.78, -3.2] });
  for (const dy of [-0.2, 0.2]) b.part(new THREE.CylinderGeometry(0.295, 0.295, 0.05, 10), ORANGE, { bone: body, at: [0.75, 2.78 + dy, -3.2] });
  for (const dy of [-0.35, 0, 0.35]) b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 10), P.steel, { bone: body, at: [0.75, 2.78 + dy, -3.2] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), P.red, { bone: body, at: [0.75, 3.16, -3.2] });
  decal(WARN, [0.75, 2.8, -2.9], [0, 0, 1], 0.22, 0.22);
  // straps over roof
  for (const z of [-3.7, -2.8]) box(2.6, 0.02, 0.07, ORANGE, [0, 2.44, z]);

  // missile pod rack (six tubes angled up)
  const rackZ = -1.35;
  box(2.0, 0.12, 0.9, P.hullDark, [0, 2.42, rackZ]);
  for (const s of [1, -1]) box(0.08, 0.3, 0.9, P.hull, [s * 0.95, 2.5, rackZ]);
  box(2.0, 0.08, 0.1, P.trim, [0, 2.5, rackZ + 0.45]);
  for (let r = 0; r < 2; r++)
    for (let c = 0; c < 3; c++) {
      const x = -0.55 + c * 0.55;
      const z = rackZ - 0.18 + r * 0.36;
      const tilt = -28;
      b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.85, 8), P.hull, { bone: body, at: [x, 2.78, z], rotation: [tilt, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.08, 8), P.trim, { bone: body, at: [x, 2.78 + 0.37 * Math.cos(0.49) * 0.95, z + 0.2], rotation: [tilt, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), P.hullDark, { bone: body, at: [x, 2.78 + 0.4, z + 0.21], rotation: [tilt, 0, 0] });
      glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.red, { bone: body, at: [x, 2.78 + 0.37, z + 0.2] }), 1.4);
    }

  // antenna array at rear right/left
  for (const [x, z, h] of [[1.1, -3.8, 0.9], [-1.1, -3.8, 0.6], [0.9, -3.8, 0.45]] as number[][]) {
    b.rod([x, 2.4, z], [x, 2.4 + h, z], 0.012, P.steel, { bone: body, sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.red, { bone: body, at: [x, 2.4 + h + 0.02, z] }), 1.5);
  }
  box(0.2, 0.1, 0.2, P.hullDark, [1.0, 2.45, -3.8]);
  box(0.2, 0.1, 0.2, P.hullDark, [-1.1, 2.45, -3.8]);

  // front wall details: pipes + vents
  for (const s of [1, -1]) {
    b.rod([s * 1.1, Y0 + 0.1, Z1 - 0.1], [s * 1.1, 2.3, Z1 - 0.1], 0.04, P.steel, { bone: body, sides: 6 });
    glow(box(0.4, 0.05, 0.03, P.ember, [s * 0.6, 1.6, Z1 - 0.1]), 1.2);
  }
  // rear cyan vent grill
  for (let i = 0; i < 5; i++) glow(box(0.5, 0.03, 0.03, P.neonCyan, [0, 1.55 + i * 0.12, Z0 + 0.1]), 1.0);
  decal(EMBLEM, [0, 2.1, Z0 - 0.0], [0, 0, -1], 0.5, 0.5);
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const HALF = 0.25;

  // Mud climbs from the bottom of the tyre, fading with noise.
  const mud = paint((p, _n) => {
    const m = smoothstep(0.38, 0.04, p.y) * (0.5 + 0.5 * noise(p, 0.12, 4));
    const base = mix("#15161a", "#1d1e24", noise(p, 0.05, 2));
    return mix(base, "#5a3f28", Math.min(1, m));
  });
  const rimPaint = paint((p, n) => {
    const m = smoothstep(0.25, 0.05, p.y) * noise(p, 0.07, 9);
    return mix(mix("#6e7686", "#aab2c0", Math.max(0, n.y) * 0.6 + 0.2), "#5a3f28", Math.min(1, m * 0.8));
  });

  const wheels: { name: string; s: number; z: number; front: boolean }[] = [
    { name: "wheelFL", s: 1, z: M.axleFront[2], front: true },
    { name: "wheelFR", s: -1, z: M.axleFront[2], front: true },
    { name: "wheelML", s: 1, z: M.axleMid[2], front: false },
    { name: "wheelMR", s: -1, z: M.axleMid[2], front: false },
    { name: "wheelRL", s: 1, z: M.axleRear[2], front: false },
    { name: "wheelRR", s: -1, z: M.axleRear[2], front: false },
  ];

  for (const w of wheels) {
    const { s, z, front } = w;
    const bone = J[w.name];
    const cx = s * 1.2;
    const cy = 0.55;
    const c: [number, number, number] = [cx, cy, z];
    const axis: [number, number, number] = [s, 0, 0];
    const at = (off: number): [number, number, number] => [cx + s * off, cy, z];

    // Tyre: faceted 10-sided lathe
    b.lathe(
      [
        [0.33, -HALF],
        [0.49, -HALF],
        [R, -0.18],
        [R, 0.18],
        [0.49, HALF],
        [0.33, HALF],
      ],
      { at: c, axis, segments: 10, bone, color: mud, name: `tyre.${w.name}` },
    );

    // Tread blocks, merged
    const treads: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
      const g = new THREE.BoxGeometry(0.46, 0.07, 0.17).translate(0, 0.545, 0);
      g.rotateX(a);
      g.translate(cx, cy, z);
      treads.push(g);
    }
    b.part(mergeGeometries(treads)!, mud, { bone, at: [0, 0, 0], name: `treads.${w.name}` });

    // Rim barrel
    b.lathe(
      [
        [0.3, -0.2],
        [0.37, -0.2],
        [0.37, 0.2],
        [0.3, 0.2],
      ],
      { at: c, axis, segments: 10, bone, color: rimPaint, name: `rim.${w.name}` },
    );

    // Brake disc (inboard) and caliper
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.025, 14), P.steel, {
      bone,
      at: at(0.0),
      dir: axis,
      name: `disc.${w.name}`,
    });
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.2), P.red, {
      bone,
      at: [cx + s * 0.0, cy + 0.2, z - 0.14],
      name: `caliper.${w.name}`,
    });

    // Spokes + bolts merged
    const spokes: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.05, 0.16, 0.06).translate(0, 0.2, 0);
      g.rotateX(a);
      g.translate(cx + s * 0.17, cy, z);
      spokes.push(g);
    }
    b.part(mergeGeometries(spokes)!, P.rim, { bone, at: [0, 0, 0], name: `spokes.${w.name}` });

    const bolts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6);
      g.rotateZ(Math.PI / 2);
      g.translate(s * 0.2, Math.cos(a) * 0.25, Math.sin(a) * 0.25);
      g.translate(cx, cy, z);
      bolts.push(g);
    }
    b.part(mergeGeometries(bolts)!, P.steel, { bone, at: [0, 0, 0], name: `bolts.${w.name}` });

    // Hub cap + glowing cyan ring
    const hubLen = front ? 0.14 : 0.09;
    b.part(new THREE.CylinderGeometry(0.1, 0.12, hubLen, 8), P.hullLight, {
      bone,
      at: at(0.2 + hubLen / 2),
      dir: axis,
      name: `hub.${w.name}`,
    });
    glow(
      b.part(new THREE.TorusGeometry(0.085, 0.014, 4, 12), P.neonCyan, {
        bone,
        at: at(0.2 + hubLen + 0.005),
        dir: axis,
        axis: "z",
        name: `hubGlow.${w.name}`,
      }),
      1.4,
    );

    // Fender flap behind the wheel
    b.part(new THREE.BoxGeometry(0.5, 0.34, 0.03), P.hullDark, {
      bone,
      at: [cx, 0.3, z - 0.6],
      name: `flap.${w.name}`,
    });
    b.part(new THREE.BoxGeometry(0.5, 0.05, 0.035), P.trim, {
      bone,
      at: [cx, 0.16, z - 0.6],
      name: `flapStripe.${w.name}`,
    });

    // Steering knuckle for front wheels; axle stub for others
    if (front) {
      b.part(new THREE.BoxGeometry(0.18, 0.26, 0.24), P.hullLight, { bone, at: [cx - s * 0.28, cy, z], name: `knuckle.${w.name}` });
      b.part(new THREE.BoxGeometry(0.3, 0.05, 0.05), P.steel, { bone, at: [cx - s * 0.42, cy - 0.1, z + 0.14], name: `tieRod.${w.name}` });
    } else {
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), P.hullLight, { bone, at: at(-0.3), dir: axis, name: `stub.${w.name}` });
    }
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng, countershade, stripes } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(77);

  // ---------- paints ----------
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(-0.2, 1, n.y) * 0.55 + noise(p, 0.3, 3) * 0.2);
    const seamX = Math.abs(((p.z + 10) % 0.65) - 0.325) < 0.008;
    const seamY = Math.abs(((p.y + 10) % 0.5) - 0.25) < 0.008;
    let c = seamX || seamY ? mix(base, P.hullDark, 0.8) : base;
    c = mix(c, P.rust, 0.35 * smoothstep(0.6, 0.85, noise(p, 0.12, 9)) * smoothstep(0.3, -0.5, n.y));
    return c;
  });
  const DARK = panelled(P.hullDark, { size: 0.3, rivets: 0.06 });
  const HAZ = stripes(P.trim, P.hullDark, { size: 0.16, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const ROOF = countershade(P.hullLight, P.hull, { level: 0.2 });

  // ---------- textures ----------
  const GLASS = svg(
    `<svg viewBox="0 0 128 48"><rect width="128" height="48" fill="#0e2a3a"/>
    <path d="M0 48 L30 0 L50 0 L20 48Z" fill="#2ff3ff" opacity="0.28"/>
    <path d="M45 48 L70 0 L78 0 L53 48Z" fill="#2ff3ff" opacity="0.18"/>
    <rect width="128" height="48" fill="none" stroke="#05121a" stroke-width="4"/></svg>`,
    { size: 256 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#041a1c"/>
    <path d="M3 24 L12 14 L20 20 L30 8 L40 18 L52 6 L61 12" stroke="#2ff3ff" stroke-width="2.5" fill="none"/>
    <rect x="4" y="4" width="14" height="3" fill="#ff2fa8"/><rect x="44" y="24" width="16" height="3" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 4 L58 16 L54 46 L32 60 L10 46 L6 16Z" fill="#20242e" stroke="#e7b814" stroke-width="4"/>
    <path d="M32 14 L44 24 L38 24 L38 40 L26 40 L26 24 L20 24Z" fill="#2ff3ff"/>
    <circle cx="32" cy="46" r="3" fill="#ff2fa8"/></svg>`,
    { size: 128 },
  );
  const SLAT = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#20242e"/>
    <rect y="3" width="32" height="2" fill="#5a6477"/><rect y="9" width="32" height="2" fill="#5a6477"/></svg>`,
    { size: 64 },
  );
  const LENS = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#e8eef5"/><circle cx="16" cy="16" r="9" fill="#fff6c8"/></svg>`,
    { size: 64 },
  );

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, c: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), c, { bone, at: [x, y, z], flat: true, ...o });
  const cyl = (r: number, h: number, c: any, at: number[], dir: number[], seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, dir, flat: true, ...o });
  const plane = (w: number, h: number, tex: any, at: number[], dir: number[], o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, ...o });
  const rivets = (pts: number[][], c = P.steel) => {
    for (const p of pts) b.part(new THREE.SphereGeometry(0.018, 5, 3), c, { bone, at: p });
  };

  const floorY = 1.25;
  const roofY = 2.82;

  // ---------- main body shell ----------
  // lower cab block
  box(2.5, 0.9, 2.5, HULL, 0, floorY + 0.45, 0.7);
  // upper cab (slightly narrower, tapered)
  b.frustumBox([0, floorY + 0.9, 0.65], [0, roofY - 0.1, 0.55], [2.4, 2.35], [2.2, 1.95], { bone, color: HULL });
  // sloped front windshield frame wedge
  b.extrude(
    [
      [0, 0],
      [0.55, 0],
      [0.15, 0.75],
      [0, 0.75],
    ],
    { at: [-1.1, floorY + 0.95, 1.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bone, color: DARK },
  );
  // front slope (hood-meeting wedge)
  b.extrude(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.18],
      [0, 0.85, "sharp"],
    ],
    { at: [-1.25, floorY + 0.9, 1.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bone, color: HULL },
  );
  // faceted roof
  b.extrude(
    [
      [-1.1, 0],
      [1.1, 0],
      [0.85, 0.22],
      [-0.85, 0.22],
    ],
    { at: [0, roofY - 0.05, 0.6], x: [1, 0, 0], y: [0, 1, 0], thickness: 2.0, bone, color: ROOF },
  );
  // rear wall of cab, armored
  box(2.5, 1.7, 0.12, DARK, 0, floorY + 1.1, -0.55);
  // A-pillars and B-pillars
  for (const s of [1, -1]) {
    box(0.1, 1.3, 0.12, P.hullDark, s * 1.12, floorY + 1.55, 1.42, { rotation: [-18, 0, 0] });
    box(0.12, 1.3, 0.14, P.hullDark, s * 1.17, floorY + 1.55, 0.35);
    box(0.12, 1.2, 0.14, P.hullDark, s * 1.15, floorY + 1.55, -0.45);
  }

  // ---------- windshield ----------
  plane(2.0, 0.62, GLASS, [0, floorY + 1.55, 1.58], [0, 0.4, 0.92], {});
  glow(plane(2.0, 0.62, GLASS, [0, floorY + 1.55, 1.585], [0, 0.4, 0.92]), 0.35);
  // frame around windshield
  box(2.15, 0.07, 0.1, P.hullDark, 0, floorY + 1.88, 1.52, { rotation: [-22, 0, 0] });
  box(2.15, 0.07, 0.1, P.hullDark, 0, floorY + 1.22, 1.64, { rotation: [-22, 0, 0] });
  // wiper
  b.rod([-0.1, floorY + 1.27, 1.68], [0.7, floorY + 1.45, 1.6], 0.012, P.rubber, { bone });
  b.rod([-0.1, floorY + 1.27, 1.68], [-0.1, floorY + 1.3, 1.67], 0.02, P.steel, { bone });
  // brow armor visor
  b.extrude(
    [
      [0, 0],
      [0.35, 0],
      [0.1, 0.12],
      [0, 0.12],
    ],
    { at: [-1.2, floorY + 1.93, 1.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bone, color: HAZ },
  );

  // ---------- sides: doors, windows, shutters ----------
  for (const s of [1, -1]) {
    const x = s * 1.27;
    // door panel
    box(0.06, 1.45, 1.05, HULL, x, floorY + 0.95, 0.65);
    // door seams
    box(0.07, 1.45, 0.025, P.hullDark, x, floorY + 0.95, 1.18);
    box(0.07, 1.45, 0.025, P.hullDark, x, floorY + 0.95, 0.12);
    box(0.07, 0.025, 1.05, P.hullDark, x, floorY + 0.25, 0.65);
    // handle
    box(0.08, 0.05, 0.22, P.steel, x + s * 0.03, floorY + 0.85, 0.25);
    box(0.09, 0.07, 0.07, P.steel, x + s * 0.03, floorY + 0.85, 0.15);
    // side window
    const wy = floorY + 1.55;
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.85), P.glass, { bone, at: [s * 1.2, wy, 0.65], flat: true });
    glow(b.part(new THREE.BoxGeometry(0.02, 0.42, 0.78), "#12394f", { bone, at: [s * 1.235, wy, 0.65] }), 0.4);
    // armor shutter (half-raised)
    box(0.07, 0.2, 0.95, P.hullDark, s * 1.26, wy + 0.3, 0.65);
    for (let i = 0; i < 4; i++) box(0.08, 0.025, 0.95, P.hullLight, s * 1.265, wy + 0.22 + i * 0.05, 0.65);
    // rear quarter window
    box(0.05, 0.4, 0.5, P.glass, s * 1.2, wy, -0.2);
    box(0.07, 0.42, 0.55, P.hullDark, s * 1.215, wy + 0.18, -0.2);
    // hazard trim along belt
    box(0.08, 0.1, 2.3, HAZ, s * 1.27, floorY + 0.28, 0.7);
    // side step
    box(0.3, 0.06, 1.1, P.steel, s * 1.4, floorY + 0.12, 0.65);
    box(0.3, 0.1, 0.06, P.hullDark, s * 1.4, floorY + 0.05, 1.18);
    box(0.3, 0.1, 0.06, P.hullDark, s * 1.4, floorY + 0.05, 0.12);
    // emblem on door
    plane(0.42, 0.42, EMBLEM, [s * 1.305, floorY + 0.7, 0.65], [s, 0, 0]);
    // rivets
    const rv: number[][] = [];
    for (let i = 0; i < 5; i++) rv.push([s * 1.3, floorY + 1.1, 0.2 + i * 0.2]);
    rivets(rv);
    // mirror arm + housing + camera
    b.rod([s * 1.25, floorY + 1.45, 1.35], [s * 1.62, floorY + 1.55, 1.5], 0.025, P.steel, { bone });
    box(0.1, 0.34, 0.2, P.hullDark, s * 1.68, floorY + 1.55, 1.5);
    box(0.12, 0.28, 0.02, P.glass, s * 1.68, floorY + 1.55, 1.61);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [s * 1.68, floorY + 1.76, 1.52] }), 1.5);
    // vertical neon edge
    glow(box(0.04, 1.3, 0.04, P.neonMagenta, s * 1.28, floorY + 0.95, -0.52), 1.4);
    // side vents with ember glow
    for (let i = 0; i < 3; i++)
      glow(box(0.03, 0.05, 0.22, P.ember, s * 1.285, floorY + 0.5 + i * 0.1, -0.2), 1.3);
  }

  // ---------- armor skirt along cab base ----------
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [2.5, 0],
        [2.35, 0.3],
        [0.15, 0.3],
      ],
      { at: [s * 1.31, floorY - 0.05, -0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bone, color: DARK },
    );
  }

  // ---------- roof details ----------
  const ry = roofY + 0.2;
  // roof hatch ring at turretRing (z=0.9)
  const hz = M.turretRing[2];
  b.lathe(
    [
      [0.45, 0],
      [0.62, 0],
      [0.62, 0.1],
      [0.5, 0.16],
      [0.45, 0.16],
    ],
    { at: [0, ry - 0.08, hz], segments: 12, bone, color: P.steel },
  );
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    box(0.07, 0.06, 0.07, P.hullDark, Math.sin(a) * 0.56, ry + 0.1, hz + Math.cos(a) * 0.56, {
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  glow(
    b.lathe(
      [
        [0.64, 0.02],
        [0.68, 0.02],
        [0.68, 0.06],
        [0.64, 0.06],
      ],
      { at: [0, ry - 0.08, hz], segments: 12, bone, color: P.neonCyan },
    ),
    1.5,
  );
  // roof rack: rails + crossbars at rear of roof
  for (const s of [1, -1]) {
    box(0.05, 0.05, 1.0, P.steel, s * 0.85, ry + 0.2, -0.05);
    for (const z of [-0.5, 0.4]) box(0.05, 0.2, 0.05, P.steel, s * 0.85, ry + 0.1, z);
  }
  for (let i = 0; i < 3; i++) box(1.75, 0.04, 0.05, P.steel, 0, ry + 0.2, -0.45 + i * 0.4);
  // searchlights on rack front
  for (const s of [1, -1]) {
    box(0.22, 0.22, 0.28, P.hullDark, s * 0.6, ry + 0.34, 0.2);
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.08, 8), "#ffffff", {
      bone, at: [s * 0.6, ry + 0.34, 0.37], dir: [0, 0, 1], texture: LENS,
    });
    glow(b.part(new THREE.CircleGeometry(0.085, 8), "#ffffff", {
      bone, at: [s * 0.6, ry + 0.34, 0.415], dir: [0, 0, 1], axis: "z", texture: LENS,
    }), 1.8);
  }
  // antennas
  const ant = (x: number, z: number, h: number, c: string) => {
    b.spike([x, ry, z], [0, 1, 0], h, 0.016, { bone, color: P.steel });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), c, { bone, at: [x, ry + h, z] }), 2);
  };
  ant(-0.95, -0.4, 1.0, P.red);
  ant(0.95, -0.45, 0.7, P.neonCyan);
  ant(1.0, 0.0, 0.45, P.neonMagenta);
  // small dish
  b.lathe(
    [[0, 0], [0.16, 0.05], [0.17, 0.07], [0.0, 0.03]],
    { at: [-0.95, ry + 0.1, 0.1], axis: [0.3, 1, 0.3], segments: 8, bone, color: P.white },
  );
  // roof edge hazard strips
  box(2.0, 0.04, 0.12, HAZ, 0, roofY + 0.18, 1.5);
  // roof neon strip
  glow(box(1.6, 0.03, 0.04, P.neonCyan, 0, roofY + 0.17, 1.44), 1.6);
  // roof plates (faceted)
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [0.7, 0], [0.55, 0.08], [0.1, 0.08]],
      { at: [s * 0.95, roofY + 0.17, -0.5], x: [0, 0, 1], y: [s * -0.3, 1, 0], thickness: 0.4, bone, color: DARK },
    );
  }

  // ---------- grille/lower front facing hood (cab front face lower) ----------
  box(2.2, 0.1, 0.06, DARK, 0, floorY + 0.95, 1.9);
  // front-facing cab lights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.05, 0.04, P.white, s * 0.85, floorY + 2.0, 1.45, { rotation: [-22, 0, 0] }), 1.4);
  }

  // ---------- interior hint ----------
  const dashY = floorY + 1.18;
  box(2.0, 0.14, 0.45, P.hullDark, 0, dashY, 1.3);
  box(2.0, 0.1, 0.1, P.rubber, 0, dashY + 0.12, 1.1);
  for (const s of [1, -1]) {
    glow(plane(0.45, 0.22, SCREEN, [s * 0.45, dashY + 0.2, 1.12], [0, 0.35, -1], {}), 1.2);
  }
  // steering wheel
  b.part(new THREE.TorusGeometry(0.13, 0.02, 4, 8), P.rubber, { bone, at: [0.45, dashY + 0.18, 0.95], dir: [0, 0.6, 0.8], axis: "z" });
  cyl(0.02, 0.3, P.steel, [0.45, dashY + 0.1, 1.05], [0, 0.6, 0.8], 5);
  // seats
  for (const s of [1, -1]) {
    box(0.6, 0.15, 0.6, P.olive, s * 0.5, floorY + 0.55, 0.35);
    box(0.6, 0.85, 0.12, P.olive, s * 0.5, floorY + 1.0, 0.05, { rotation: [-8, 0, 0] });
    box(0.35, 0.18, 0.1, P.hullDark, s * 0.5, floorY + 1.5, 0.0);
  }
  // center console
  box(0.22, 0.25, 0.8, P.hullDark, 0, floorY + 0.5, 0.7);
  glow(box(0.14, 0.02, 0.2, P.neonMagenta, 0, floorY + 0.64, 0.8), 1.4);
  // dome light
  glow(box(0.2, 0.03, 0.2, P.white, 0, roofY - 0.1, 0.5), 1.0);

  // ---------- rear wall details ----------
  for (const s of [1, -1]) {
    box(0.3, 0.12, 0.04, HAZ, s * 0.7, floorY + 1.5, -0.64);
    glow(box(0.08, 0.5, 0.03, P.neonCyan, s * 1.15, floorY + 1.0, -0.64), 1.3);
  }
  box(1.4, 0.8, 0.04, DARK, 0, floorY + 1.0, -0.64);
  rivets(Array.from({ length: 8 }, (_, i) => [-0.6 + i * 0.17, floorY + 1.45, -0.67]));

  // ---------- hazard base trim at front lower ----------
  box(2.45, 0.1, 0.1, HAZ, 0, floorY + 0.12, 1.92);
  // small wear panels using rng
  for (let i = 0; i < 10; i++) {
    const s = R() > 0.5 ? 1 : -1;
    box(0.02, 0.06 + R() * 0.1, 0.1 + R() * 0.15, P.rust, s * 1.315, floorY + 0.4 + R() * 1.0, -0.3 + R() * 1.6);
  }
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { paint, mottle, countershade, stripes, svg, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P }: Ctx) {
  const BRASS = "#c8a040";
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const body = J.body;

  const hullPaint = countershade(
    paint((p, n) => {
      const edge = Math.abs(n.y) < 0.6 ? 0.25 : 0;
      return edge > 0 && ((Math.floor(p.x * 40) + Math.floor(p.z * 40)) & 3) === 0 ? P.hullLight : mottle(P.hull, P.hullLight, { size: 0.25 });
    }),
    P.hullDark,
    { level: -0.3 },
  );
  const hazard = stripes(P.trim, P.hullDark, { size: 0.09, axis: [1, 0, 1], width: 0.55, wobble: 0 });

  const box = (
    w: number, h: number, d: number, color: any, at: number[], bone: any, extra: any = {},
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (r: number, len: number, seg: number, color: any, at: number[], bone: any, dir = [0, 0, 1]) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, dir });

  // ---- ring base (static on the cab roof)
  b.lathe(
    [[0, 0], [0.72, 0], [0.72, 0.05], [0.62, 0.09], [0.62, 0.12], [0, 0.12]],
    { at: [0, 2.92, 0.9], bone: body, segments: 24, color: P.hullDark },
  );
  const teeth: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const g = new THREE.BoxGeometry(0.08, 0.06, 0.1);
    g.applyMatrix4(
      new THREE.Matrix4()
        .makeTranslation(0, 2.97, 0.9)
        .multiply(new THREE.Matrix4().makeRotationY((i / 24) * Math.PI * 2))
        .multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.74)),
    );
    teeth.push(g);
  }
  b.part(mergeGeometries(teeth)!, P.steel, { bone: body, at: [0, 0, 0] });
  glow(
    b.part(new THREE.TorusGeometry(0.69, 0.012, 4, 24), P.neonCyan, { bone: yaw, at: [0, 3.04, 0.9], rotation: [90, 0, 0] }),
    1.5,
  );
  cyl(0.6, 0.04, 20, P.steel, [0, 3.03, 0.9], yaw, [0, 1, 0]);

  // ---- housing
  const side = [[-0.55, 0], [0.6, 0], [0.6, 0.32], [0.3, 0.52], [-0.3, 0.52], [-0.55, 0.35]] as [number, number][];
  b.extrude(side, { at: [0, 3.05, 0.9], x: [0, 0, 1], thickness: 0.9, bevel: 0.03, color: hullPaint, bone: yaw });
  // side cheek plates
  const cheek = [[-0.4, 0.05], [0.45, 0.05], [0.45, 0.28], [0.2, 0.44], [-0.3, 0.44]] as [number, number][];
  for (const s of [1, -1])
    b.extrude(cheek, { at: [s * 0.46, 3.05, 0.9], x: [0, 0, 1], thickness: 0.06, bevel: 0.012, color: P.hullDark, bone: yaw });
  // hazard bands
  box(0.84, 0.02, 0.1, hazard, [0, 3.575, 0.82], yaw);
  box(0.86, 0.1, 0.02, hazard, [0, 3.12, 0.28], yaw);
  // mantlet
  box(0.86, 0.34, 0.2, P.hullDark, [0, 3.2, 1.55], pitch);
  box(0.5, 0.2, 0.12, P.hull, [0, 3.2, 1.7], pitch);
  // rivets
  const rv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 8; i++)
    for (const s of [1, -1]) {
      const g = new THREE.SphereGeometry(0.016, 4, 3);
      g.translate(s * 0.4, 3.59, 0.45 + i * 0.1);
      rv.push(g);
    }
  b.part(mergeGeometries(rv)!, P.steel, { bone: yaw, at: [0, 0, 0] });
  // vents
  for (let i = 0; i < 4; i++) glow(box(0.3, 0.012, 0.025, P.ember, [0, 3.585, 0.5 + i * 0.05], yaw), 1.2);

  // ---- sensor eye
  box(0.26, 0.2, 0.26, P.hullDark, [-0.3, 3.62, 1.1], yaw);
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.1, 8), P.hullLight, { bone: yaw, at: [-0.3, 3.62, 1.26], dir: [0, 0, 1] });
  glow(cyl(0.055, 0.03, 8, P.red, [-0.3, 3.62, 1.32], yaw), 2);
  // brow
  box(0.28, 0.04, 0.14, P.trim, [-0.3, 3.74, 1.2], yaw);

  // ---- twin autocannons
  for (const s of [1, -1]) {
    const x = s * 0.2;
    b.rod([x, 3.2, 1.6], [x, 3.2, 3.1], 0.045, P.steel, { bone: pitch, sides: 8 });
    b.rod([x, 3.2, 1.65], [x, 3.2, 2.25], 0.075, P.hullLight, { bone: pitch, sides: 8 });
    for (let k = 0; k < 3; k++) cyl(0.085, 0.04, 8, P.hullDark, [x, 3.2, 1.8 + k * 0.17], pitch);
    // muzzle brake
    box(0.15, 0.15, 0.22, P.hullDark, [x, 3.2, 3.0], pitch);
    for (const t of [-1, 1]) box(0.16, 0.02, 0.1, P.ember, [x, 3.2 + t * 0.045, 3.0], pitch);
    glow(box(0.04, 0.04, 0.01, P.ember, [x, 3.2, 3.115], pitch), 1.5);
  }
  box(0.12, 0.22, 0.4, P.hullDark, [0, 3.2, 1.9], pitch);

  // ---- ammo box and belt feed (left side, -x)
  box(0.2, 0.26, 0.4, P.olive, [-0.62, 3.2, 1.0], yaw);
  box(0.22, 0.03, 0.42, hazard, [-0.62, 3.34, 1.0], yaw);
  box(0.04, 0.08, 0.08, P.steel, [-0.73, 3.22, 1.0], yaw);
  const belt = catmull([[-0.6, 3.34, 1.2], [-0.5, 3.4, 1.4], [-0.3, 3.3, 1.6], [-0.2, 3.22, 1.7]]);
  b.sweep(belt, 0.022, { bone: pitch, color: BRASS, section: { ngon: 4 } });
  for (let i = 0; i < 6; i++) {
    const q = belt.at(i / 5);
    box(0.03, 0.045, 0.03, P.steel, [q.x, q.y + 0.02, q.z], pitch);
  }

  // ---- ejection port (+x side) and shells
  box(0.04, 0.12, 0.2, P.hullDark, [0.46, 3.18, 1.25], yaw);
  box(0.02, 0.1, 0.16, P.rubber, [0.48, 3.18, 1.25], yaw);
  for (let i = 0; i < 3; i++) cyl(0.014, 0.06, 6, BRASS, [0.5, 3.1 - i * 0.01, 1.2 + i * 0.05], yaw, [1, 0, 0]);

  // ---- missile launcher (+x side)
  box(0.22, 0.38, 0.66, P.hull, [0.62, 3.4, 0.85], yaw);
  box(0.24, 0.04, 0.68, hazard, [0.62, 3.6, 0.85], yaw);
  for (const dx of [0.57, 0.67])
    for (const dy of [3.32, 3.47]) {
      cyl(0.045, 0.1, 8, P.hullDark, [dx, dy, 1.2], yaw);
      cyl(0.03, 0.02, 8, P.olive, [dx, dy, 1.255], yaw);
    }
  glow(box(0.02, 0.3, 0.02, P.neonMagenta, [0.745, 3.4, 0.6], yaw), 1.4);

  // ---- neon strips
  for (const s of [1, -1]) glow(box(0.015, 0.02, 0.5, P.neonCyan, [s * 0.485, 3.4, 0.7], yaw), 1.5);
  glow(box(0.5, 0.02, 0.015, P.neonMagenta, [0, 3.12, 0.275], yaw), 1.3);

  // ---- antenna and radar dish
  b.rod([-0.55, 3.35, 0.4], [-0.55, 3.7, 0.4], 0.01, P.steel, { bone: yaw, sides: 6 });
  b.part(new THREE.SphereGeometry(0.02, 5, 4), P.red, { bone: yaw, at: [-0.55, 3.7, 0.4] });
  b.rod([0.3, 3.55, 0.4], [0.3, 3.6, 0.4], 0.02, P.hullDark, { bone: yaw, sides: 6 });
  b.lathe([[0, 0], [0.14, 0.06], [0.14, 0.08], [0, 0.025]], {
    at: [0.3, 3.6, 0.4], axis: [0.2, 0.6, 0.75], bone: yaw, segments: 10, color: P.white,
  });
  b.rod([0.3, 3.6, 0.4], [0.32, 3.64, 0.46], 0.008, P.steel, { bone: yaw, sides: 5 });

  // ---- rear stowage + wear plate with emblem
  const emblem = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#20242e"/><path d="M4 28 L16 4 L28 28 Z" fill="none" stroke="#e7b814" stroke-width="3"/><circle cx="16" cy="20" r="3" fill="#ff2fa8"/></svg>`,
    { size: 64 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: yaw, at: [0.2, 3.28, 0.27], dir: [0, 0, -1], axis: "z", texture: emblem,
  });
  box(0.5, 0.2, 0.16, P.hullDark, [-0.15, 3.18, 0.22], yaw);
  cyl(0.05, 0.18, 8, P.rust, [0.0, 3.62, 0.62], yaw, [1, 0, 0]);
}
```

<!-- call: frontEnd -->

```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFrontEnd({ b, J, P }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: number[], s = 1.4, o: any = {}) =>
    glow(box(w, h, d, color, at, o), s);

  // ---- paints ----
  const hullPaint = paint((p, n) => {
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const cu = 0.42, cv = 0.3;
    const du = ((u / cu) % 1 + 1) % 1 * cu;
    const dv = ((v / cv) % 1 + 1) % 1 * cv;
    let c: any = mix(P.hull, P.hullLight, 0.15 + 0.45 * smoothstep(0.2, 1, n.y) + 0.15 * noise(p, 0.3, 4));
    if (du < 0.006 || dv < 0.006) c = mix(c, P.hullDark, 0.85);
    else if (du < 0.014 || dv < 0.014) c = mix(c, P.hullLight, 0.25);
    else {
      const r = Math.hypot(du - 0.035, ((dv / 0.07) % 1 - 0.5) * 0.07);
      if (r < 0.009) c = mix(c, P.steel, 0.7);
    }
    const mud = smoothstep(1.0, 0.45, p.y) * smoothstep(0.35, 0.7, noise(p, 0.18, 9));
    c = mix(c, P.rust, mud * 0.55);
    c = mix(c, P.hullDark, 0.25 * smoothstep(0.0, -0.8, n.y));
    return c;
  });
  const hazard = paint((p) => (Math.floor((p.x + p.y * 0.9) / 0.14) % 2 === 0 ? P.trim : P.hullDark));
  const darkPaint = paint((p, n) => mix(P.hullDark, P.rust, 0.35 * smoothstep(0.4, 0.8, noise(p, 0.2, 3)) * smoothstep(0.5, 0, n.y)));

  const ex = (outline: any[], at: number[], th: number, color: any, o: any = {}) =>
    b.extrude(outline, { at, x: [0, 0, 1], y: [0, 1, 0], thickness: th, color, bone, ...o });

  // ---- undertray ----
  box(2.0, 0.36, 1.7, darkPaint, [0, 0.52, 2.85]);

  // ---- hood ----
  const topY = (z: number) => (z <= 3.2 ? 1.9 - 0.125 * (z - 2) : 1.75 - 0.35 * ((z - 3.2) / 0.6));
  ex([[2.0, 0.7], [2.0, 1.9], [3.2, 1.75], [3.8, 1.4], [3.8, 0.7]], [0, 0, 0], 1.8, hullPaint);
  // front block (wider nose)
  ex([[3.4, 0.7], [3.4, 1.5], [3.8, 1.4], [3.8, 0.7]], [0, 0, 0], 2.6, hullPaint);
  // raised centre armour plate
  ex(
    [[2.2, 1.7], [2.2, topY(2.2) + 0.07], [3.2, topY(3.2) + 0.07], [3.6, topY(3.6) + 0.07], [3.6, 1.7]],
    [0, 0, 0], 0.7, hullPaint,
  );
  // hazard edge on plate sides
  for (const s of [1, -1]) {
    ex([[2.25, topY(2.25) + 0.02], [2.25, topY(2.25) + 0.075], [3.55, topY(3.55) + 0.075], [3.55, topY(3.55) + 0.02]],
      [s * 0.38, 0, 0], 0.05, hazard);
  }
  // firewall
  box(1.8, 1.0, 0.1, P.hullDark, [0, 1.4, 2.05]);

  // ---- fenders & arches ----
  const arch: number[][] = [];
  for (let a = 0; a <= 180; a += 30) arch.push([2.7 + 0.72 * Math.cos((a * Math.PI) / 180), 0.55 + 0.72 * Math.sin((a * Math.PI) / 180)]);
  for (let a = 180; a >= 0; a -= 30) arch.push([2.7 + 0.6 * Math.cos((a * Math.PI) / 180), 0.55 + 0.6 * Math.sin((a * Math.PI) / 180)]);
  const bolts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    ex(arch, [s * 1.15, 0, 0], 0.5, hullPaint);
    box(0.5, 0.08, 1.5, hullPaint, [s * 1.15, 1.31, 2.7]);
    box(0.5, 0.08, 0.5, hullPaint, [s * 1.15, 1.2, 3.55], { rotation: [-18, 0, 0] });
    box(0.52, 0.04, 1.5, hazard, [s * 1.15, 1.36, 2.7]);
    // side neon on nose
    lit(0.02, 0.03, 0.35, P.neonCyan, [s * 1.31, 1.0, 3.62], 1.5);
    lit(0.02, 0.03, 0.5, P.neonCyan, [s * 1.31, 0.9, 3.0], 1.5, { });
    // underglow
    lit(0.04, 0.04, 1.6, P.neonMagenta, [s * 1.0, 0.38, 3.0], 1.6);
    // armour side flare
    box(0.1, 0.5, 1.5, P.hullDark, [s * 0.95, 0.95, 2.7]);
    for (let i = 0; i < 6; i++) {
      bolts.push(new THREE.SphereGeometry(0.025, 5, 4).translate(s * (0.95 + (i % 2) * 0.3), 1.36, 2.1 + i * 0.28));
    }
    // antenna
    b.rod([s * 1.3, 1.35, 2.25], [s * 1.33, 2.0, 2.2], 0.012, P.steel, { bone });
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.red, { bone, at: [s * 1.33, 1.99, 2.2] }), 1.5);
    box(0.08, 0.1, 0.08, P.hullDark, [s * 1.3, 1.37, 2.25]);
    // headlight
    box(0.5, 0.14, 0.06, P.hullDark, [s * 1.05, 1.2, 3.82]);
    lit(0.4, 0.06, 0.04, P.white, [s * 1.05, 1.2, 3.85], 2);
    box(0.52, 0.025, 0.07, P.trim, [s * 1.05, 1.29, 3.83]);
    // fog light
    lit(0.12, 0.08, 0.04, P.ember, [s * 0.98, 0.58, 3.94], 1.3);
    // tow hook
    b.part(new THREE.TorusGeometry(0.07, 0.016, 5, 8), P.red, { bone, at: [s * 1.2, 0.55, 3.93] });
    box(0.05, 0.08, 0.08, P.steel, [s * 1.2, 0.62, 3.88]);
    // hood vents
    lit(0.3, 0.03, 0.5, P.ember, [s * 0.7, topY(2.65) + 0.0, 2.65], 1.5, { rotation: [7, 0, 0] });
    for (let i = 0; i < 5; i++)
      box(0.34, 0.025, 0.04, P.hullDark, [s * 0.7, topY(2.45 + i * 0.1) + 0.03, 2.45 + i * 0.1], { rotation: [7, 0, 0] });
    box(0.36, 0.02, 0.56, P.trim, [s * 0.7, topY(2.65) - 0.015, 2.65], { rotation: [7, 0, 0] });
  }

  // ---- grille ----
  box(1.5, 0.4, 0.05, P.hullDark, [0, 1.17, 3.81]);
  lit(1.4, 0.3, 0.03, P.neonCyan, [0, 1.17, 3.83], 1.6);
  for (let i = 0; i < 11; i++) box(0.045, 0.36, 0.04, P.hullDark, [-0.65 + i * 0.13, 1.17, 3.87]);
  box(1.56, 0.04, 0.06, P.steel, [0, 1.4, 3.87]);
  box(1.56, 0.04, 0.06, P.steel, [0, 0.95, 3.87]);

  // light bar on hood nose
  box(1.5, 0.08, 0.1, P.hullDark, [0, 1.6, 3.5], { rotation: [-30, 0, 0] });
  lit(1.4, 0.04, 0.05, P.neonCyan, [0, 1.64, 3.53], 2, { rotation: [-30, 0, 0] });

  // ---- plow bumper ----
  ex([[3.7, 0.4], [3.7, 0.95], [3.92, 0.78], [3.92, 0.4]], [0, 0, 0], 2.7, hazard);
  box(2.72, 0.06, 0.1, P.steel, [0, 0.96, 3.76], { rotation: [-14, 0, 0] });
  for (let i = 0; i < 9; i++) {
    b.extrude([[-0.13, 0], [0.13, 0], [0, -0.14]], {
      at: [-1.2 + i * 0.3, 0.5, 3.9], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.08,
      color: i % 2 ? P.trim : P.hullDark, bone,
    });
  }
  lit(2.3, 0.03, 0.05, P.neonMagenta, [0, 0.37, 3.88], 1.7);
  // winch
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8), P.steel, { bone, at: [0, 0.6, 3.92], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 8), P.hullDark, { bone, at: [-0.37, 0.6, 3.92], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.05, 8), P.hullDark, { bone, at: [0.37, 0.6, 3.92], rotation: [0, 0, 90] });
  b.rod([0, 0.5, 3.99], [0.05, 0.42, 3.99], 0.012, P.hullDark, { bone });
  b.part(new THREE.TorusGeometry(0.05, 0.014, 5, 8), P.red, { bone, at: [0.05, 0.4, 3.99] });
  // number plate
  const plate = svg(
    `<svg viewBox="0 0 80 40"><rect x="1" y="1" width="78" height="38" rx="4" fill="#e8eef5" stroke="#20242e" stroke-width="3"/><rect x="5" y="5" width="70" height="7" fill="#2ff3ff"/><text x="40" y="33" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="19" fill="#20242e">WH-2077</text></svg>`,
    { size: 160 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.2), "#ffffff", { bone, at: [0.62, 0.62, 3.935], dir: [0, 0, 1], axis: "z", texture: plate });

  // ---- bolts ----
  for (let i = 0; i < 8; i++) bolts.push(new THREE.SphereGeometry(0.025, 5, 4).translate(-1.15 + i * 0.33, 1.47, 3.8));
  b.part(mergeGeometries(bolts)!, P.steel, { bone, at: [0, 0, 0] });

  // ---- hood-roof antennas ----
  b.rod([0.3, 1.9, 2.15], [0.34, 2.0, 2.1], 0.01, P.steel, { bone });
  box(0.18, 0.06, 0.1, P.hullDark, [-0.4, 1.95, 2.2]);
  lit(0.1, 0.03, 0.03, P.neonMagenta, [-0.4, 1.99, 2.27], 1.5);
}
```

<!-- call: fit-rearEnd -->

The tow-hook chain sweeps reached 0.23 m past the box's rear face, so I pulled them forward to stay inside z = -4.3.

<<<<<<< SEARCH
      [[s * 0.5, 0.6, -4.42], [s * 0.5, 0.52, -4.5], [s * 0.5, 0.42, -4.46]],
=======
      [[s * 0.5, 0.6, -4.26], [s * 0.5, 0.52, -4.29], [s * 0.5, 0.42, -4.27]],
>>>>>>> REPLACE

<!-- call: fit-chassis -->

Two fixes: the exhaust stacks are shortened and lowered to stay under y = 1.3, and the tow hooks are moved back from the front face.

<<<<<<< SEARCH
    cyl(0.1, 1.0, 8, soot, [x, 1.0, -0.8], [0, 1, 0]);
    cyl(0.12, 0.08, 8, P.steel, [x, 1.5, -0.8], [0, 1, 0]);
    cyl(0.05, 0.05, 6, P.ember, [x, 1.55, -0.8], [0, 1, 0]);
    glow(cyl(0.06, 0.02, 6, P.ember, [x, 1.54, -0.8], [0, 1, 0]), 1.5);
    for (const y of [0.7, 1.2]) box(0.2, 0.05, 0.05, P.steel, [x - s * 0.1, y, -0.8]);
=======
    cyl(0.1, 0.7, 8, soot, [x, 0.85, -0.8], [0, 1, 0]);
    cyl(0.12, 0.08, 8, P.steel, [x, 1.22, -0.8], [0, 1, 0]);
    cyl(0.05, 0.04, 6, P.ember, [x, 1.26, -0.8], [0, 1, 0]);
    glow(cyl(0.06, 0.02, 6, P.ember, [x, 1.27, -0.8], [0, 1, 0]), 1.5);
    for (const y of [0.6, 1.0]) box(0.2, 0.05, 0.05, P.steel, [x - s * 0.1, y, -0.8]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    box(0.1, 0.1, 0.3, P.red, [s * 0.4, 0.6, 3.5]);
=======
    box(0.1, 0.1, 0.3, P.red, [s * 0.4, 0.6, 3.3]);
>>>>>>> REPLACE

<!-- call: fit-cargoBed -->

I made the following changes; I haven't re-run the module to re-measure the part, so the fit is unconfirmed.
- **Crates:** removed the second-tier crate and its strap, which stood well above the box.
- **Fuel drum:** shortened it so its top sits at about 2.85.
- **Missile tubes:** shortened and thinned them, and re-seated the muzzle rings and glow lamps on the new tube tops.
- **Antennas:** shortened them so their tips stay under 2.9.
- **Tool lockers:** moved them inside the x limit. They were reaching about 0.24 m past it.

```
<<<<<<< SEARCH
  crate(-0.45, 2.87 - 0.45 + 0.0, -3.5, 0.0001, 0);
  crate(-0.5, 2.87, -3.5, 0.38, 20);
  // orange strap over crates
  box(0.05, 0.02, 0.0001 + 0.5, ORANGE, [-0.5, 3.26, -3.5]);
=======
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 10), DRUM, { bone: body, at: [0.75, 2.78, -3.2] });
  for (const dy of [-0.2, 0.2]) b.part(new THREE.CylinderGeometry(0.295, 0.295, 0.05, 10), ORANGE, { bone: body, at: [0.75, 2.78 + dy, -3.2] });
  for (const dy of [-0.35, 0, 0.35]) b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 10), P.steel, { bone: body, at: [0.75, 2.78 + dy, -3.2] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), P.red, { bone: body, at: [0.75, 3.16, -3.2] });
  decal(WARN, [0.75, 2.8, -2.9], [0, 0, 1], 0.22, 0.22);
=======
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.45, 10), DRUM, { bone: body, at: [0.75, 2.6, -3.2] });
  for (const dy of [-0.1, 0.1]) b.part(new THREE.CylinderGeometry(0.295, 0.295, 0.05, 10), ORANGE, { bone: body, at: [0.75, 2.6 + dy, -3.2] });
  for (const dy of [-0.22, 0.22]) b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 10), P.steel, { bone: body, at: [0.75, 2.6 + dy, -3.2] });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 6), P.red, { bone: body, at: [0.75, 2.85, -3.2] });
  decal(WARN, [0.75, 2.6, -2.9], [0, 0, 1], 0.22, 0.22);
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.85, 8), P.hull, { bone: body, at: [x, 2.78, z], rotation: [tilt, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.08, 8), P.trim, { bone: body, at: [x, 2.78 + 0.37 * Math.cos(0.49) * 0.95, z + 0.2], rotation: [tilt, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 8), P.hullDark, { bone: body, at: [x, 2.78 + 0.4, z + 0.21], rotation: [tilt, 0, 0] });
      glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.red, { bone: body, at: [x, 2.78 + 0.37, z + 0.2] }), 1.4);
=======
      b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.55, 8), P.hull, { bone: body, at: [x, 2.58, z], rotation: [tilt, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 8), P.trim, { bone: body, at: [x, 2.58 + 0.23, z + 0.12], rotation: [tilt, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), P.hullDark, { bone: body, at: [x, 2.58 + 0.25, z + 0.13], rotation: [tilt, 0, 0] });
      glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.red, { bone: body, at: [x, 2.58 + 0.2, z + 0.1] }), 1.4);
>>>>>>> REPLACE
<<<<<<< SEARCH
[[1.1, -3.8, 0.9], [-1.1, -3.8, 0.6], [0.9, -3.8, 0.45]]
=======
[[1.1, -3.8, 0.42], [-1.1, -3.8, 0.35], [0.9, -3.8, 0.3]]
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.2, 0.6, 0.6, P.hullDark, [s * 1.42, 1.65, zl]);
    box(0.02, 0.5, 0.5, P.hull, [s * 1.53, 1.65, zl]);
    box(0.04, 0.1, 0.04, P.trim, [s * 1.55, 1.65, zl + 0.15]);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), P.steel, { bone: body, at: [s * 1.55, 1.8, zl - 0.2], rotation: [0, 0, 90] });
    glow(box(0.02, 0.03, 0.3, P.ember, [s * 1.545, 1.4, zl]), 1.2);
=======
    box(0.2, 0.6, 0.6, P.hullDark, [s * 1.24, 1.65, zl]);
    box(0.02, 0.5, 0.5, P.hull, [s * 1.34, 1.65, zl]);
    box(0.04, 0.1, 0.04, P.trim, [s * 1.35, 1.65, zl + 0.15]);
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 6), P.steel, { bone: body, at: [s * 1.35, 1.8, zl - 0.2], rotation: [0, 0, 90] });
    glow(box(0.02, 0.03, 0.3, P.ember, [s * 1.345, 1.4, zl]), 1.2);
>>>>>>> REPLACE
```

<!-- call: fit-cab -->

The oversized pieces came from two mistakes. The extrudes were centred on their thickness, so the ones placed at x = -1.1 to -1.25 ran out to x = -2.5. And several roof, window and pillar heights were set too high. These edits fix both.

<<<<<<< SEARCH
  const roofY = 2.82;
=======
  const roofY = 2.55;
>>>>>>> REPLACE
<<<<<<< SEARCH
    { at: [-1.1, floorY + 0.95, 1.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bone, color: DARK },
=======
    { at: [0, floorY + 0.95, 1.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.05, bone, color: DARK },
>>>>>>> REPLACE
<<<<<<< SEARCH
    { at: [-1.25, floorY + 0.9, 1.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bone, color: HULL },
=======
    { at: [0, floorY + 0.9, 1.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.5, bone, color: HULL },
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.1, 1.3, 0.12, P.hullDark, s * 1.12, floorY + 1.55, 1.42, { rotation: [-18, 0, 0] });
    box(0.12, 1.3, 0.14, P.hullDark, s * 1.17, floorY + 1.55, 0.35);
    box(0.12, 1.2, 0.14, P.hullDark, s * 1.15, floorY + 1.55, -0.45);
=======
    box(0.1, 1.0, 0.12, P.hullDark, s * 1.12, floorY + 1.2, 1.42, { rotation: [-18, 0, 0] });
    box(0.12, 1.0, 0.14, P.hullDark, s * 1.17, floorY + 1.2, 0.35);
    box(0.12, 1.0, 0.14, P.hullDark, s * 1.15, floorY + 1.2, -0.45);
>>>>>>> REPLACE
<<<<<<< SEARCH
  plane(2.0, 0.62, GLASS, [0, floorY + 1.55, 1.58], [0, 0.4, 0.92], {});
  glow(plane(2.0, 0.62, GLASS, [0, floorY + 1.55, 1.585], [0, 0.4, 0.92]), 0.35);
  // frame around windshield
  box(2.15, 0.07, 0.1, P.hullDark, 0, floorY + 1.88, 1.52, { rotation: [-22, 0, 0] });
  box(2.15, 0.07, 0.1, P.hullDark, 0, floorY + 1.22, 1.64, { rotation: [-22, 0, 0] });
=======
  plane(2.0, 0.5, GLASS, [0, floorY + 1.3, 1.58], [0, 0.4, 0.92], {});
  glow(plane(2.0, 0.5, GLASS, [0, floorY + 1.3, 1.585], [0, 0.4, 0.92]), 0.35);
  // frame around windshield
  box(2.15, 0.07, 0.1, P.hullDark, 0, floorY + 1.58, 1.52, { rotation: [-22, 0, 0] });
  box(2.15, 0.07, 0.1, P.hullDark, 0, floorY + 1.02, 1.64, { rotation: [-22, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    { at: [-1.2, floorY + 1.93, 1.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bone, color: HAZ },
=======
    { at: [0, floorY + 1.55, 1.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, bone, color: HAZ },
>>>>>>> REPLACE
<<<<<<< SEARCH
    const wy = floorY + 1.55;
=======
    const wy = floorY + 1.28;
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.3, 0.06, 1.1, P.steel, s * 1.4, floorY + 0.12, 0.65);
    box(0.3, 0.1, 0.06, P.hullDark, s * 1.4, floorY + 0.05, 1.18);
    box(0.3, 0.1, 0.06, P.hullDark, s * 1.4, floorY + 0.05, 0.12);
=======
    box(0.2, 0.06, 1.1, P.steel, s * 1.33, floorY + 0.12, 0.65);
    box(0.2, 0.1, 0.06, P.hullDark, s * 1.33, floorY + 0.05, 1.18);
    box(0.2, 0.1, 0.06, P.hullDark, s * 1.33, floorY + 0.05, 0.12);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.rod([s * 1.25, floorY + 1.45, 1.35], [s * 1.62, floorY + 1.55, 1.5], 0.025, P.steel, { bone });
    box(0.1, 0.34, 0.2, P.hullDark, s * 1.68, floorY + 1.55, 1.5);
    box(0.12, 0.28, 0.02, P.glass, s * 1.68, floorY + 1.55, 1.61);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [s * 1.68, floorY + 1.76, 1.52] }), 1.5);
=======
    b.rod([s * 1.25, floorY + 1.2, 1.35], [s * 1.42, floorY + 1.3, 1.5], 0.025, P.steel, { bone });
    box(0.1, 0.34, 0.2, P.hullDark, s * 1.46, floorY + 1.3, 1.5);
    box(0.12, 0.28, 0.02, P.glass, s * 1.46, floorY + 1.3, 1.61);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [s * 1.46, floorY + 1.5, 1.52] }), 1.5);
>>>>>>> REPLACE
<<<<<<< SEARCH
  const ry = roofY + 0.2;
=======
  const ry = roofY + 0.05;
>>>>>>> REPLACE
<<<<<<< SEARCH
  ant(-0.95, -0.4, 1.0, P.red);
  ant(0.95, -0.45, 0.7, P.neonCyan);
  ant(1.0, 0.0, 0.45, P.neonMagenta);
=======
  ant(-0.95, -0.4, 0.38, P.red);
  ant(0.95, -0.45, 0.3, P.neonCyan);
  ant(1.0, 0.0, 0.22, P.neonMagenta);
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(2.0, 0.04, 0.12, HAZ, 0, roofY + 0.18, 1.5);
  // roof neon strip
  glow(box(1.6, 0.03, 0.04, P.neonCyan, 0, roofY + 0.17, 1.44), 1.6);
=======
  box(2.0, 0.04, 0.12, HAZ, 0, roofY + 0.1, 1.5);
  // roof neon strip
  glow(box(1.6, 0.03, 0.04, P.neonCyan, 0, roofY + 0.09, 1.44), 1.6);
>>>>>>> REPLACE
<<<<<<< SEARCH
      { at: [s * 0.95, roofY + 0.17, -0.5], x: [0, 0, 1], y: [s * -0.3, 1, 0], thickness: 0.4, bone, color: DARK },
=======
      { at: [s * 0.95, roofY + 0.1, -0.5], x: [0, 0, 1], y: [s * -0.3, 1, 0], thickness: 0.4, bone, color: DARK },
>>>>>>> REPLACE
<<<<<<< SEARCH
    glow(box(0.3, 0.05, 0.04, P.white, s * 0.85, floorY + 2.0, 1.45, { rotation: [-22, 0, 0] }), 1.4);
=======
    glow(box(0.3, 0.05, 0.04, P.white, s * 0.85, floorY + 1.5, 1.5, { rotation: [-22, 0, 0] }), 1.4);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.35, 0.18, 0.1, P.hullDark, s * 0.5, floorY + 1.5, 0.0);
=======
    box(0.35, 0.18, 0.1, P.hullDark, s * 0.5, floorY + 1.4, 0.0);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.3, 0.12, 0.04, HAZ, s * 0.7, floorY + 1.5, -0.64);
=======
    box(0.3, 0.12, 0.04, HAZ, s * 0.7, floorY + 1.3, -0.64);
>>>>>>> REPLACE
<<<<<<< SEARCH
  rivets(Array.from({ length: 8 }, (_, i) => [-0.6 + i * 0.17, floorY + 1.45, -0.67]));
=======
  rivets(Array.from({ length: 8 }, (_, i) => [-0.6 + i * 0.17, floorY + 1.3, -0.67]));
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.02, 0.06 + R() * 0.1, 0.1 + R() * 0.15, P.rust, s * 1.315, floorY + 0.4 + R() * 1.0, -0.3 + R() * 1.6);
=======
    box(0.02, 0.06 + R() * 0.1, 0.1 + R() * 0.15, P.rust, s * 1.315, floorY + 0.4 + R() * 0.8, -0.3 + R() * 1.6);
>>>>>>> REPLACE
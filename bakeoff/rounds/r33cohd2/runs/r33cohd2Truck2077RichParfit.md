<!-- call: plan -->

```json
{
  "name": "Warhound 2077 Militarized Truck",
  "description": "A low-poly cyberpunk armored 6x6 military truck with a roof-mounted railgun turret, neon underglow, reactive armor plating and a cargo bed of modular containers.",
  "builderName": "warhoundTruck",
  "size": [2.8, 3.1, 8.0],
  "layout": "Chunky angular 6x6 troop-hauler, facing +Z. Front to back: a sloped armored nose with bull-bar, winch and headlight bank (z 4.0 to 2.7), a high two-door cab with a slanted visor windshield (z 2.7 to 0.9), a roof-mounted turret ring behind the cab roof (z 0.6), then a long flat cargo bed with modular containers and a rear ramp (z 0.8 to -4.0). Three axles of fat studded tyres sit under the hull in wheel arches, wheel radius 0.65, at z 2.7, -0.4 and -2.9. All surfaces are faceted boxes, wedges and extrudes with chamfers: dark gunmetal hull panels with riveted seams and hazard-yellow trim, cyan and magenta neon strips on the skirts, grille, lightbars and containers, glowing visor slits and screens, decal SVGs for unit emblems, barcodes, warning stripes and kanji-like glyphs. Wear paint: soot at the exhausts, mud at the lower hull and wheels, bright edges on top faces.",
  "palette": {
    "hull": "#3a414d",
    "hullDark": "#20242c",
    "hullLight": "#5b6574",
    "trim": "#e7b814",
    "armorOlive": "#4a5240",
    "rubber": "#15161a",
    "rim": "#8a8f9a",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2bd6",
    "neonRed": "#ff3b30",
    "glass": "#1b3a4a",
    "glowAmber": "#ffb347",
    "steel": "#9aa3b0",
    "gunmetal": "#2b2f38",
    "mud": "#4b3d2e",
    "white": "#e8ecf2"
  },
  "mounts": {
    "chassisTop": [0, 1.3, 0],
    "frontAxle": [0, 0.65, 2.7],
    "midAxle": [0, 0.65, -0.4],
    "rearAxle": [0, 0.65, -2.9],
    "cabFloor": [0, 1.3, 1.8],
    "roofDeck": [0, 2.55, 1.5],
    "turretRing": [0, 2.55, 0.35],
    "bedFloor": [0, 1.3, -1.9],
    "noseFront": [0, 1.0, 3.95]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "wheelFL", "parent": "body", "at": [1.15, 0.65, 2.7], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.15, 0.65, 2.7], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.15, 0.65, -0.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.15, 0.65, -0.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.15, 0.65, -2.9], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.15, 0.65, -2.9], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.55, 0.35], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 3.0, 0.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "rampHinge", "parent": "body", "at": [0, 1.3, -4.0], "dir": [1, 0, 0], "role": "hinge", "group": "bed" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull and frame: ladder frame rails, belly armor plate with V-shape wedge, side skirts with neon strips (cyan) and hazard stripe paint, wheel arch surrounds with bolted flanges for all six wheels, fuel tanks and battery boxes between axles, exhaust stacks (two vertical pipes behind cab on the left with soot paint), mud paint low, tow hooks, rear bumper with light cluster, paneled() riveted plating.",
      "box": [[-1.4, 0.35, -4.0], [1.4, 1.35, 3.0]],
      "attaches": "Top face at chassisTop carries the cab, bed and nose; arches wrap the wheel joints on the three axle mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "wheels",
      "builds": "Six heavy wheels, each with a chunky 10-sided studded tyre (lathe/cylinder, rubber with mud paint at the tread), tread blocks as ring of boxes, steel rim with gearTexture-like spoked cap, hub bolts ring, a neon cyan rim-light ring on the outer face, brake disc and caliper, axle stubs and a suspension arm toward the hull. Wheel radius 0.65, width 0.55, centres at x +-1.15 on the three axle mounts; build each from its wheel joint.",
      "box": [[-1.45, 0.0, -3.6], [1.45, 1.3, 3.35]],
      "attaches": "Parented to the wheel joints at the axle mounts; suspension arms end at the chassis arches.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 140
    },
    {
      "id": "noseFront",
      "builds": "Front end ahead of the cab, z 2.7 to 4.0: sloped armored hood wedge, heavy bull-bar made of rods and plates with hazard stripes, a wide dark grille with glowing cyan slats drawn as an SVG texture, a headlight bank of four angular amber/white lamps (glow) with a magenta light strip, a front winch drum with cable, tow shackles, a fender pair with side lamps, a front license-plate decal with a barcode and kanji glyphs, a hood vent with a small sensor mast and antenna whips.",
      "box": [[-1.4, 0.45, 2.7], [1.4, 1.95, 4.0]],
      "attaches": "Rear face meets the cab front at z 2.7; bottom rests on the chassis at noseFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "cab",
      "builds": "Cab shell z 0.9 to 2.7, height up to 2.55: faceted armored box with sloped roof and A-pillars, a slanted visor windshield with a glowing teal HUD tint (SVG with scanlines), side windows with armored slit shutters, two doors with handles and hazard trim and unit emblem decals, side mirrors as camera pods with lenses, roof deck with lightbar (red/magenta/cyan glow), roof hatch, antenna array and a satellite dish, interior seen through glass: two seats, steering wheel, dash with a glowing screen SVG showing a map, door-mounted reactive armor tiles.",
      "box": [[-1.3, 1.3, 0.9], [1.3, 2.9, 2.7]],
      "attaches": "Floor at cabFloor sits on the chassis; front meets noseFront; roof deck at roofDeck; rear wall meets the bed and the turret ring just behind.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "turret",
      "builds": "Remote weapon turret at turretRing (0,2.55,0.35): a rotating ring base on turretYaw, angular armored housing with sloped faces and olive paint with hazard marks, twin rail-cannon barrels on gunPitch with coil rings (blued metal, glowing cyan capacitor bands), muzzle brakes, a heat shroud with vents, ammo drum with feed belt, a sensor head with glowing red eye lens and a small side-mounted missile pod of four tubes, smoke grenade launchers, a unit stencil decal.",
      "box": [[-0.9, 2.55, -0.7], [0.9, 3.1, 2.3]],
      "attaches": "Base ring sits on the turretRing mount on the cab rear roof; rear of the cab wall and the bed front lie just below.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cargoBed",
      "builds": "Rear cargo section z 0.8 to -4.0 on bedFloor (y 1.3): flat deck plate with anti-slip paint, low side walls with riveted panels and stake pockets, two stacked modular containers (hull and olive paint, barcodes, hazard stripes, numbers, a glowing cyan status panel, latch bars and corner castings), a communications mast with dish, a drone landing pad with a magenta ring marking, roll bars, strapped crates and jerrycans, tie-down rings, a power cable coil, rear tail lights in red neon and a drop-down rear ramp on rampHinge with grip texture and chains.",
      "box": [[-1.4, 1.3, -4.2], [1.4, 2.75, 0.8]],
      "attaches": "Deck rests on the chassis at bedFloor; front wall abuts the cab rear; rear ramp hinge at (0,1.3,-4.0).",
      "joints": ["body", "rampHinge"],
      "floor": false,
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

export function buildWheels({ b, J, P }: any) {
  const R = 0.65, W = 0.55;
  const mudPaint = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const low = smoothstep(0.55, 0.0, p.y) * (0.4 + 0.6 * noise(p, 0.15, 3));
    return mix(P.rubber, P.mud, Math.min(1, low * 0.9));
  });
  const rimPaint = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix(P.rim, P.steel, smoothstep(0.2, 0.9, noise(p, 0.05, 5)) * 0.6 + 0.2 * Math.max(0, n.y)));
  const cap = svg(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3a414d" stroke="#111" stroke-width="3"/>
    <g stroke="#9aa3b0" stroke-width="7" stroke-linecap="round">${[0, 1, 2, 3, 4, 5].map(i => {
      const a = i * Math.PI / 3; return `<line x1="${50 + 12 * Math.cos(a)}" y1="${50 + 12 * Math.sin(a)}" x2="${50 + 38 * Math.cos(a)}" y2="${50 + 38 * Math.sin(a)}"/>`;
    }).join("")}</g><circle cx="50" cy="50" r="11" fill="#2ff3ff" stroke="#111" stroke-width="3"/></svg>`, { size: 128 });
  const r = rng(11);
  const names = ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"];
  for (const nm of names) {
    const j = J[nm];
    const s = j.at.x > 0 ? 1 : -1;
    const c = j.at.clone();
    const ax: [number, number, number] = [s, 0, 0];
    const at = (o: number, y = 0, z = 0) => [c.x + s * o, c.y + y, c.z + z] as [number, number, number];
    // tyre
    b.part(new THREE.CylinderGeometry(R, R, W, 10), mudPaint, { bone: j, at: at(0), dir: ax, flat: true });
    // shoulders
    for (const o of [-1, 1]) b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.97, 0.05, 10), P.rubber, { bone: j, at: at(o * W / 2), dir: ax, flat: true });
    // tread blocks
    for (let i = 0; i < 10; i++) {
      const a = (i + 0.5) * Math.PI * 2 / 10;
      const y = Math.sin(a) * (R + 0.02), z = Math.cos(a) * (R + 0.02);
      b.part(new THREE.BoxGeometry(W * 0.9, 0.08, 0.2), P.rubber, { bone: j, at: at(0, y, z), dir: [0, Math.sin(a), Math.cos(a)], axis: "y" });
      if (i % 2 === 0) b.part(new THREE.ConeGeometry(0.035, 0.06, 5), P.steel, { bone: j, at: at(s * 0.2 * (r() > 0.5 ? 1 : -1), Math.sin(a) * (R + 0.08), Math.cos(a) * (R + 0.08)), dir: [0, Math.sin(a), Math.cos(a)] });
    }
    // rim
    b.part(new THREE.CylinderGeometry(0.4, 0.4, W + 0.04, 10), rimPaint, { bone: j, at: at(0), dir: ax, flat: true });
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 10), P.hullDark, { bone: j, at: at(s * (W / 2 + 0.01)), dir: ax });
    // spoked cap texture
    b.part(new THREE.CircleGeometry(0.33, 12), "#ffffff", { bone: j, at: at(s * (W / 2 + 0.05)), dir: ax, axis: "z", texture: cap });
    // hub bolts
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 6), P.steel, { bone: j, at: at(s * (W / 2 + 0.07), Math.sin(a) * 0.27, Math.cos(a) * 0.27), dir: ax });
    }
    // neon ring
    glow(b.part(new THREE.TorusGeometry(0.4, 0.018, 4, 20), P.neonCyan, { bone: j, at: at(s * (W / 2 + 0.03)), dir: ax, axis: "z" }), 1.6);
    // axle stub + brake disc (inner side)
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8), P.gunmetal, { bone: j, at: at(-s * 0.4), dir: ax });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), P.steel, { bone: j, at: at(-s * 0.2), dir: ax });
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.14), P.neonRed, { bone: j, at: at(-s * 0.2, 0.2, 0.2) });
    // suspension arm toward hull
    b.rod(at(-s * 0.4), at(-s * 0.85, 0.1), 0.06, P.gunmetal, { bone: j });
    b.rod(at(-s * 0.5, -0.1, 0.1), at(-s * 0.9, 0.25, 0.1), 0.04, P.hullLight, { bone: j });
  }
}
```

<!-- call: noseFront -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildNoseFront({ b, J, P, M }: any) {
  const body = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, rotation: rot, ...extra });

  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.4, 1, n.y) * 0.6);
    const mud = smoothstep(0.9, 0.45, p.y) * smoothstep(0.35, 0.7, noise(p, 0.15, 3));
    return mix(base, P.mud, mud * 0.8);
  });
  const hull = panelled(hullPaint, { size: 0.3, rivets: 0.08, seam: P.hullDark });

  // Hood wedge (sloped)
  const hood = b.extrude(
    [[0, 0], [1.3, 0], [1.3, 0.55], [0.35, 0.95], [0, 0.95]],
    { at: [-1.2, 0.95, 2.7], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: hull, bone: body, bevel: 0.03 },
  );
  // lower nose block
  box(2.6, 0.5, 1.2, hull, [0, 0.75, 3.35]);
  // fenders
  for (const s of [1, -1]) {
    box(0.45, 0.22, 1.2, P.armorOlive, [s * 1.18, 1.15, 3.3]);
    box(0.4, 0.5, 1.1, P.hullDark, [s * 1.2, 0.8, 3.3]);
    glow(b.part(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.glowAmber, { bone: body, at: [s * 1.27, 1.2, 3.92] }), 1.4);
    box(0.5, 0.04, 0.5, P.trim, [s * 1.18, 1.27, 2.95]);
  }

  // Grille texture
  let slats = "";
  for (let i = 0; i < 8; i++) slats += `<rect x="6" y="${6 + i * 7}" width="88" height="3.5" fill="#2ff3ff"/>`;
  const grilleTex = svg(
    `<svg viewBox="0 0 100 64"><rect width="100" height="64" fill="#0c0e12"/><rect x="2" y="2" width="96" height="60" fill="none" stroke="#e7b814" stroke-width="2"/>${slats}</svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.6, 0.6), "#ffffff", {
      bone: body, at: [0, 0.95, 4.0], dir: [0, 0, 1], axis: "z", texture: grilleTex,
    }),
    0.9,
  );

  // Headlight bank
  for (const s of [1, -1]) {
    for (const k of [0, 1]) {
      const x = s * (0.95 + k * 0.2);
      box(0.2, 0.2, 0.1, P.hullDark, [x, 1.4, 3.93]);
      glow(box(0.15, 0.15, 0.06, k ? P.white : P.glowAmber, [x, 1.4, 3.99]), 1.5);
    }
  }
  glow(box(2.2, 0.05, 0.05, P.neonMagenta, [0, 1.22, 4.0]), 1.6);

  // Bull-bar
  const tube = (a: number[], c: number[], r = 0.05) => b.rod(a, c, r, P.steel, { bone: body, sides: 6 });
  for (const s of [1, -1]) {
    tube([s * 1.15, 0.5, 3.95], [s * 1.15, 1.5, 3.95]);
    tube([s * 0.55, 0.5, 3.95], [s * 0.55, 1.5, 3.95]);
    tube([s * 1.15, 0.5, 3.95], [s * 1.15, 0.5, 3.7], 0.06);
  }
  tube([-1.15, 1.5, 3.98], [1.15, 1.5, 3.98], 0.06);
  tube([-1.15, 0.6, 3.98], [1.15, 0.6, 3.98], 0.06);
  box(1.0, 0.18, 0.06, P.trim, [0, 0.55, 4.02]);
  for (let i = 0; i < 6; i++)
    box(0.07, 0.2, 0.07, P.hullDark, [-0.45 + i * 0.18, 0.55, 4.06], [0, 0, 30]);

  // Winch
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 8), P.gunmetal, {
    bone: body, at: [0, 0.62, 3.8], dir: [1, 0, 0],
  });
  b.rod([0.1, 0.62, 3.9], [0.2, 0.5, 4.05], 0.015, P.steel, { bone: body });
  b.rod([0.2, 0.5, 4.05], [0.2, 0.45, 4.05], 0.03, P.trim, { bone: body });
  // Tow shackles
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.07, 0.02, 4, 8), P.steel, { bone: body, at: [s * 0.9, 0.55, 4.0] });
  }

  // License plate decal
  const plate = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#e8ecf2"/><rect x="2" y="2" width="96" height="36" fill="none" stroke="#20242c" stroke-width="2"/><text x="8" y="22" font-size="16" font-weight="bold" fill="#20242c">警犬77</text><g fill="#20242c">${Array.from({ length: 16 }, (_, i) => `<rect x="${8 + i * 5.4}" y="27" width="${i % 3 ? 2 : 3.5}" height="9"/>`).join("")}</g></svg>`,
    { size: 192 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", {
    bone: body, at: [0, 0.78, 3.98], dir: [0, 0, 1], axis: "z", texture: plate,
  });

  // Hood vent
  for (let i = 0; i < 5; i++) box(0.5, 0.02, 0.05, P.hullDark, [-0.5, 1.62 - i * 0.012, 3.05 + i * 0.09], [-30, 0, 0]);
  box(0.6, 0.03, 0.4, P.neonCyan, [-0.5, 1.6, 3.2], [-30, 0, 0]);
  glow(box(0.5, 0.01, 0.05, P.neonCyan, [-0.5, 1.64, 3.3], [-30, 0, 0]), 1.2);

  // Sensor mast + antennas
  b.rod([0.6, 1.7, 3.0], [0.6, 2.0, 3.0], 0.03, P.gunmetal, { bone: body });
  box(0.14, 0.1, 0.14, P.hullDark, [0.6, 2.05, 3.0]);
  glow(box(0.06, 0.06, 0.04, P.neonRed, [0.6, 2.05, 3.08]), 1.5);
  for (const [x, lean] of [[0.85, 8], [0.95, -10]]) {
    b.spike([x, 1.45, 2.85], [lean / 100, 1, -0.1], 0.9, 0.012, { color: P.steel, bone: body });
  }
  // Side lamp strips
  for (const s of [1, -1]) glow(box(0.04, 0.05, 1.0, P.neonCyan, [s * 1.4, 0.6, 3.3]), 1.2);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildChassis({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, flat: true, ...extra });
  const cyl = (r: number, h: number, c: any, at: number[], dir: number[], seg = 10, extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone: body, at, dir, flat: true, ...extra });

  const mudy = (base: string) =>
    paint((p: any, n: any) => {
      const low = smoothstep(0.85, 0.4, p.y) * (0.5 + 0.5 * noise(p, 0.25, 4));
      const top = smoothstep(0.6, 1, n.y) * 0.15;
      let c: any = mix(base, P.mud, low * 0.75);
      return mix(c, "#ffffff", top);
    });
  const HULL = panelled(mudy(P.hull), { size: 0.5, rivets: 0.1 });
  const DARK = mudy(P.hullDark);
  const soot = paint((p: any) => mix(P.gunmetal, "#050505", smoothstep(2.1, 1.3, p.y) * 0.9 + 0.1 * noise(p, 0.1)));

  // ladder frame rails
  for (const s of [1, -1]) {
    box(0.22, 0.3, 7.0, DARK, [s * 0.8, 0.62, -0.5]);
    box(0.3, 0.08, 6.9, P.hullLight, [s * 0.8, 0.8, -0.5]);
  }
  for (let i = 0; i < 9; i++) box(1.7, 0.16, 0.18, P.gunmetal, [0, 0.66, -3.7 + i * 0.85]);

  // main hull deck
  box(2.7, 0.3, 7.0, HULL, [0, 1.2, -0.5]);
  box(2.2, 0.08, 6.8, P.hullLight, [0, 1.36, -0.5]);

  // belly plate + V wedge
  box(1.9, 0.12, 6.2, DARK, [0, 0.42, -0.4]);
  const vg = new THREE.CylinderGeometry(0.5, 0.5, 6.0, 3);
  b.part(vg, P.hullDark, { bone: body, at: [0, 0.4, -0.4], rotation: [90, 0, 180], scale: [1.3, 1, 0.35], flat: true });

  // hazard stripe paint
  const hazard = paint((p: any, n: any) => ((Math.floor((p.z + p.y) / 0.18) & 1) ? P.trim : P.hullDark));
  const neonTex = svg(`<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#2ff3ff"/><rect y="3" width="64" height="2" fill="#e8ffff"/></svg>`, { size: 64 });

  // skirts
  for (const s of [1, -1]) {
    for (const [z0, z1] of [[1.3, -0.2 - 0.0], [-0.85, -2.35]]) {
      const len = Math.abs(z1 - z0) - 0.1;
      const zc = (z0 + z1) / 2;
      box(0.1, 0.45, len, HULL, [s * 1.38, 0.78, zc]);
      box(0.04, 0.06, len - 0.1, hazard, [s * 1.43, 0.6, zc]);
      glow(box(0.04, 0.05, len - 0.1, P.neonCyan, [s * 1.44, 0.95, zc]), 1.6);
    }
  }

  // wheel arches with flanges + bolts
  const axles = [2.7, -0.4, -2.9];
  for (const s of [1, -1])
    for (const z of axles) {
      b.part(new THREE.TorusGeometry(0.82, 0.07, 4, 10, Math.PI), P.hullLight, {
        bone: body, at: [s * 1.38, 0.65, z], rotation: [0, 90, 0], flat: true,
      });
      box(0.12, 0.08, 1.8, P.hullDark, [s * 1.38, 1.5, z]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 5) * Math.PI;
        cyl(0.03, 0.05, P.steel, [s * 1.44, 0.65 + Math.sin(a) * 0.82, z + Math.cos(a) * 0.82], [1, 0, 0], 6);
      }
      // suspension stub
      box(0.7, 0.14, 0.14, P.gunmetal, [s * 1.0, 0.65, z]);
    }

  // fuel tanks and batteries between axles
  for (const s of [1, -1]) {
    cyl(0.28, 1.2, metal("steel"), [s * 1.0, 0.7, -1.65], [0, 0, 1], 10);
    for (const dz of [-0.4, 0.4]) box(0.06, 0.52, 0.06, P.hullDark, [s * 1.0, 0.7, -1.65 + dz], {});
  }
  box(0.7, 0.3, 0.5, P.armorOlive, [0.0, 0.62, 1.2]);
  glow(box(0.5, 0.04, 0.06, P.neonRed, [0, 0.79, 1.2]), 1.2);
  box(0.6, 0.3, 0.5, P.armorOlive, [0.0, 0.62, -1.6]);
  glow(box(0.4, 0.04, 0.06, P.neonCyan, [0, 0.79, -1.6]), 1.2);

  // exhaust stacks on the left behind cab
  for (const dx of [0, 0.22]) {
    cyl(0.07, 1.1, soot, [1.2 + dx * 0.0 + (dx ? 0 : 0) - 0.0, 1.9, 0.62 - dx * 1.5 + 0.0], [0, 1, 0], 8);
    cyl(0.1, 0.1, P.steel, [1.2, 1.9 + 0.55, 0.62 - dx * 1.5], [0, 1, 0], 8);
    box(0.14, 0.14, 0.14, P.gunmetal, [1.2, 1.45, 0.62 - dx * 1.5]);
  }
  // exhaust clamps
  for (const dz of [0.62, 0.29]) cyl(0.09, 0.05, P.trim, [1.2, 1.75, dz], [0, 1, 0], 8);

  // tow hooks
  for (const s of [1, -1]) {
    box(0.14, 0.14, 0.3, P.hullDark, [s * 0.6, 0.6, 2.95]);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 4, 8), P.steel, { bone: body, at: [s * 0.6, 0.6, 3.12], flat: true });
    box(0.14, 0.14, 0.3, P.hullDark, [s * 0.6, 0.6, -3.95]);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 4, 8), P.steel, { bone: body, at: [s * 0.6, 0.6, -4.12], flat: true });
  }

  // rear bumper & light cluster
  box(2.8, 0.3, 0.3, HULL, [0, 0.85, -3.85]);
  box(2.8, 0.06, 0.32, hazard, [0, 0.66, -3.85]);
  for (const s of [1, -1]) {
    box(0.4, 0.22, 0.12, P.hullDark, [s * 1.1, 1.1, -3.98]);
    glow(box(0.3, 0.12, 0.05, P.neonRed, [s * 1.1, 1.1, -4.05]), 1.8);
    glow(box(0.12, 0.08, 0.05, P.glowAmber, [s * 0.8, 1.1, -4.05]), 1.4);
  }
  glow(box(1.2, 0.04, 0.04, P.neonMagenta, [0, 1.12, -4.0]), 1.5);

  // rear license/emblem decal
  const emb = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8ecf2"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#20242c" stroke-width="2"/><path d="M8 24V8M8 16h8M16 8v16M24 8l8 8-8 8M40 8v16M40 16h12" stroke="#20242c" stroke-width="2.5" fill="none"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", { bone: body, at: [0, 0.82, -4.02], dir: [0, 0, -1], axis: "z", texture: emb });

  // side magenta accent and mud flaps
  for (const s of [1, -1]) {
    glow(box(0.03, 0.04, 4.6, P.neonMagenta, [s * 1.43, 0.45, -0.6]), 1.3);
    for (const z of [-0.4 - 0.9, -2.9 - 0.9]) box(0.06, 0.45, 0.5, P.rubber, [s * 1.15, 0.5, z]);
  }
  // rivet studs on deck edge
  const studs = new THREE.BufferGeometry();
  for (let i = 0; i < 12; i++) {
    const z = -3.5 + i * 0.6;
    for (const s of [1, -1]) cyl(0.035, 0.04, P.steel, [s * 1.3, 1.37, z + R() * 0.02], [0, 1, 0], 6);
  }
  void studs;
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: any) {
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const OLIVE = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base = mix(P.armorOlive, "#5d6650", smoothstep(0.4, 1, n.y) * 0.6);
    return mix(base, "#2b2f26", smoothstep(0.55, 0.8, noise(p, 0.12, 4)) * 0.4);
  });
  const PANEL = panelled(OLIVE, { size: 0.25, rivets: 0.06 });
  const BLUED = metal("blued");
  const IRON = metal("iron");
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, s = 8) => new THREE.CylinderGeometry(r1, r2, h, s);
  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#15161a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#e8ecf2" stroke-width="4"/><path d="M32 12 L40 40 L32 34 L24 40Z" fill="#e8ecf2"/><text x="32" y="58" font-size="10" text-anchor="middle" fill="#e8ecf2" font-family="monospace">WH-77</text></svg>`,
    { size: 128 },
  );
  const EYE = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#ff3b30"/><circle cx="16" cy="16" r="6" fill="#ffd0c0"/><circle cx="13" cy="13" r="2" fill="#fff"/></svg>`,
    { size: 64 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#101216"/>${[1, 5, 9, 13]
      .map((y) => `<rect x="2" y="${y}" width="28" height="2" fill="#ffb347"/>`)
      .join("")}</svg>`,
    { size: 64 },
  );
  const decal = (geo: THREE.BufferGeometry, tex: THREE.Texture, pos: number[], dir: number[], bone: any, g = false) => {
    const p = b.part(geo, "#ffffff", { bone, at: pos, dir, axis: "z", texture: tex });
    if (g) glow(p, 1.2);
    return p;
  };

  // ring base
  b.part(cyl(0.62, 0.68, 0.1, 12), IRON, { bone: yaw, at: at(0, 2.6, 0.35) });
  b.part(cyl(0.5, 0.58, 0.1, 12), BLUED, { bone: yaw, at: at(0, 2.7, 0.35) });
  b.part(new THREE.TorusGeometry(0.64, 0.025, 4, 16), P.neonCyan, { bone: yaw, at: at(0, 2.66, 0.35), rotation: [90, 0, 0] });
  glow(b.part(new THREE.TorusGeometry(0.64, 0.025, 4, 16), P.neonCyan, { bone: yaw, at: at(0, 2.66, 0.35), rotation: [90, 0, 0] }), 1.5);

  // housing
  b.part(box(1.1, 0.4, 1.0), PANEL, { bone: yaw, at: at(0, 2.95, 0.3) });
  b.part(box(0.9, 0.12, 0.6), PANEL, { bone: yaw, at: at(0, 3.17, 0.15) });
  // sloped front mantlet
  b.part(box(0.95, 0.3, 0.3), OLIVE, { bone: yaw, at: at(0, 3.0, 0.88), rotation: [-25, 0, 0] });
  // side cheeks
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.34, 0.9), OLIVE, { bone: yaw, at: at(s * 0.62, 2.98, 0.3), rotation: [0, 0, s * -8] });
    b.part(box(0.06, 0.12, 0.8), P.hullDark, { bone: yaw, at: at(s * 0.68, 2.82, 0.3) });
    decal(new THREE.PlaneGeometry(0.7, 0.12), HAZ, at(s * 0.675, 3.0, 0.2), [s, 0, 0], yaw);
  }
  decal(new THREE.PlaneGeometry(0.3, 0.3), STENCIL, at(-0.4, 3.376, 0.1), [0, 1, 0], yaw);
  // rear heat shroud
  b.part(box(0.8, 0.3, 0.3), P.hullDark, { bone: yaw, at: at(0, 3.0, -0.4) });
  decal(new THREE.PlaneGeometry(0.6, 0.22), VENT, at(0, 3.0, -0.555), [0, 0, -1], yaw, true);
  for (const x of [-0.3, 0, 0.3]) b.part(box(0.1, 0.04, 0.28), P.steel, { bone: yaw, at: at(x, 3.17, -0.4) });

  // ammo drum + belt
  b.part(cyl(0.2, 0.2, 0.34, 10), IRON, { bone: yaw, at: at(0.72, 2.95, -0.05), rotation: [0, 0, 90] });
  b.part(cyl(0.08, 0.08, 0.36, 8), P.trim, { bone: yaw, at: at(0.72, 2.95, -0.05), rotation: [0, 0, 90] });
  for (let i = 0; i < 6; i++)
    b.part(box(0.06, 0.05, 0.07), P.trim, { bone: yaw, at: at(0.62 - i * 0.002, 3.05 + i * 0.01 - 0.02, 0.2 + i * 0.09) });

  // sensor head
  b.part(box(0.3, 0.28, 0.3), P.hullDark, { bone: yaw, at: at(-0.45, 3.3, 0.45) });
  b.part(cyl(0.05, 0.05, 0.3, 6), P.steel, { bone: yaw, at: at(-0.45, 3.1, 0.45) });
  glow(decal(new THREE.PlaneGeometry(0.2, 0.2), EYE, at(-0.45, 3.3, 0.61), [0, 0, 1], yaw), 2);
  b.part(box(0.34, 0.05, 0.34), P.hull, { bone: yaw, at: at(-0.45, 3.46, 0.45) });

  // missile pod
  b.part(box(0.36, 0.36, 0.5), P.gunmetal, { bone: yaw, at: at(0.78, 3.28, 0.45) });
  for (const x of [-0.08, 0.08])
    for (const y of [-0.08, 0.08]) {
      b.part(cyl(0.065, 0.065, 0.1, 8), P.hullDark, { bone: yaw, at: at(0.78 + x, 3.28 + y, 0.72), rotation: [90, 0, 0] });
      b.part(cyl(0.035, 0.035, 0.02, 6), P.neonRed, { bone: yaw, at: at(0.78 + x, 3.28 + y, 0.775), rotation: [90, 0, 0] });
    }

  // smoke launchers
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) {
      b.part(cyl(0.035, 0.035, 0.2, 6), P.gunmetal, {
        bone: yaw, at: at(s * 0.7 * (s > 0 ? 0 : 1) - (s < 0 ? 0.72 : -0.0) + (s > 0 ? 0.0 : 0), 2.88 + i * 0.0, 0.1 + i * 0.1),
        rotation: [60, 0, 0],
      });
    }

  // gun cradle + barrels
  b.part(box(0.7, 0.3, 0.5), BLUED, { bone: pitch, at: at(0, 3.0, 0.95) });
  for (const s of [1, -1]) {
    const x = s * 0.2;
    b.part(cyl(0.05, 0.05, 1.9, 8), BLUED, { bone: pitch, at: at(x, 3.0, 1.85), rotation: [90, 0, 0] });
    b.part(cyl(0.075, 0.075, 0.5, 8), P.gunmetal, { bone: pitch, at: at(x, 3.0, 1.05), rotation: [90, 0, 0] });
    for (let i = 0; i < 5; i++) {
      b.part(cyl(0.09, 0.09, 0.05, 8), P.steel, { bone: pitch, at: at(x, 3.0, 1.45 + i * 0.22), rotation: [90, 0, 0] });
      glow(b.part(cyl(0.095, 0.095, 0.03, 8), P.neonCyan, { bone: pitch, at: at(x, 3.0, 1.56 + i * 0.22), rotation: [90, 0, 0] }), 1.6);
    }
    b.part(box(0.14, 0.14, 0.2), P.hullDark, { bone: pitch, at: at(x, 3.0, 2.2) });
    b.part(box(0.18, 0.03, 0.14), P.trim, { bone: pitch, at: at(x, 3.08, 2.2) });
    b.part(box(0.03, 0.1, 0.14), P.steel, { bone: pitch, at: at(x + 0.08, 3.0, 2.2) });
    b.part(box(0.03, 0.1, 0.14), P.steel, { bone: pitch, at: at(x - 0.08, 3.0, 2.2) });
  }
  b.part(box(0.12, 0.3, 0.2), P.hullLight, { bone: pitch, at: at(0, 3.0, 1.3) });
}
```

<!-- call: cargoBed -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCargoBed({ b, J, P, M }: Ctx) {
  const r = rng(77);
  const body = J.body;
  const ramp = J.rampHinge;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], bone: any = body, extra: any = {}) =>
    b.part(g, color, { bone, at, ...extra });

  const HULL = panelled(P.hull, { size: 0.5, rivets: 0.08 });
  const OLIVE = panelled(P.armorOlive, { size: 0.45, rivets: 0.08 });
  const DECK = paint((p, _n) => {
    const g = noise(p, 0.05, 3);
    const mud = smoothstep(0.55, 0.8, noise(p, 0.5, 9));
    return mix(mix(P.hullDark, P.gunmetal, g), P.mud, mud * 0.5);
  });
  const STRIPE = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 16L16 0H32L16 16ZM32 16L48 0H64L48 16Z" fill="#15161a"/></svg>`, { size: 128 });
  const BAR = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8ecf2"/>${Array.from({ length: 22 }, (_, i) => `<rect x="${3 + i * 2.7}" y="4" width="${1 + (i * 7) % 3 * 0.6}" height="24" fill="#15161a"/>`).join("")}</svg>`, { size: 128 });
  const PANEL = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#06222a"/><rect x="3" y="3" width="58" height="34" fill="none" stroke="#2ff3ff" stroke-width="2"/><path d="M6 30L16 20 24 26 36 12 46 22 58 8" stroke="#2ff3ff" stroke-width="2" fill="none"/><text x="8" y="15" font-size="9" fill="#2ff3ff" font-family="monospace">CGO-07</text></svg>`, { size: 128 });
  const PAD = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#ff2bd6" stroke-width="3"/><circle cx="32" cy="32" r="18" fill="none" stroke="#ff2bd6" stroke-width="2"/><path d="M22 22H42V42H22Z M32 22V42 M22 32H42" stroke="#ff2bd6" stroke-width="2" fill="none"/></svg>`, { size: 128 });
  const GRIP = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#2b2f38"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0 ${i * 8 + 4}H64" stroke="#5b6574" stroke-width="2"/>`).join("")}<path d="M0 0H64V3H0Z" fill="#e7b814"/></svg>`, { size: 128 });

  // deck
  put(box(2.8, 0.1, 4.8), DECK, [0, 1.4, -1.6]);
  put(box(2.6, 0.06, 4.6), P.gunmetal, [0, 1.34, -1.6]);
  // side walls with posts, stake pockets
  for (const s of [1, -1]) {
    put(box(0.1, 0.4, 4.8), HULL, [s * 1.35, 1.65, -1.6]);
    put(box(0.14, 0.06, 4.8), P.trim, [s * 1.35, 1.88, -1.6]);
    put(box(0.02, 0.05, 4.7), P.neonCyan, [s * 1.41, 1.5, -1.6]);
    glow(b.part(box(0.02, 0.05, 4.7), P.neonCyan, { bone: body, at: [s * 1.415, 1.5, -1.6] }), 1.2);
    for (let i = 0; i < 6; i++) {
      const z = 0.6 - i * 0.95;
      put(box(0.16, 0.5, 0.12), P.gunmetal, [s * 1.35, 1.68, z]);
      put(box(0.08, 0.08, 0.08), P.steel, [s * 1.35, 1.96, z]);
    }
  }
  // front wall
  put(box(2.8, 0.7, 0.12), HULL, [0, 1.7, 0.74]);
  put(box(2.4, 0.1, 0.14), P.trim, [0, 2.05, 0.74]);
  // roll bars
  for (const z of [0.4, -3.6]) {
    for (const s of [1, -1]) put(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), P.steel, [s * 1.3, 1.9, z]);
    put(box(2.7, 0.1, 0.1), P.steel, [0, 2.4, z]);
  }
  // containers
  const container = (y: number, z: number, h: number, paintc: any, id: number) => {
    put(box(2.2, h, 1.9), paintc, [0, y, z]);
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1])
      put(box(0.14, 0.14, 0.14), P.gunmetal, [sx * 1.1, y + sy * (h / 2), z + sz * 0.95]);
    for (const s of [1, -1]) {
      put(box(0.03, h * 0.9, 0.05), P.steel, [s * 1.11, y, z + 0.4]);
      put(box(0.03, h * 0.9, 0.05), P.steel, [s * 1.11, y, z - 0.4]);
      put(box(0.02, 0.18, 0.6), STRIPE, [s * 1.105, y - h * 0.3, z], body, { texture: STRIPE, color: "#ffffff" });
    }
    put(box(0.5, 0.3, 0.02), BAR, [0.5 * (id ? 1 : -1), y + 0.1, z + 0.96], body, { texture: BAR, color: "#ffffff" });
    glow(put(box(0.45, 0.28, 0.02), "#ffffff", [-0.5 * (id ? 1 : -1), y + 0.1, z + 0.96], body, { texture: PANEL }), 1.3);
  };
  container(1.8, -0.25, 0.7, OLIVE, 0);
  container(1.8, -2.25, 0.7, HULL, 1);
  container(2.5, -0.25, 0.7, HULL, 1);
  // crates and jerrycans at the rear
  const crate = [[0.7, 1.62, -3.4, 0.5], [-0.6, 1.6, -3.5, 0.45]];
  crate.forEach(([x, y, z, s], i) => {
    put(box(s, s, s), i ? P.armorOlive : P.mud, [x, y, z], body, { rotation: [0, 12 * i, 0] });
    put(box(s + 0.02, 0.05, 0.08), P.steel, [x, y + 0.05, z], body, { rotation: [0, 12 * i, 0] });
  });
  for (let i = 0; i < 3; i++) {
    const x = 0.2 - i * 0.22;
    put(box(0.18, 0.3, 0.1), P.armorOlive, [x, 1.6, -3.1]);
    put(box(0.06, 0.06, 0.04), P.trim, [x + 0.04, 1.78, -3.1]);
  }
  // drone pad on top container
  put(box(1.4, 0.04, 1.4), P.hullDark, [0, 2.87, -0.25]);
  put(new THREE.PlaneGeometry(1.3, 1.3), "#ffffff", [0, 2.895, -0.25], body, { dir: [0, 1, 0], axis: "z", texture: PAD });
  // comms mast & dish
  put(new THREE.CylinderGeometry(0.04, 0.06, 1.2, 8), P.steel, [-1.0, 3.0, -0.8]);
  put(new THREE.ConeGeometry(0.28, 0.14, 10, 1, true), P.rim, [-1.0, 3.55, -0.8], body, { dir: [0.3, 0.8, 0.5] });
  put(new THREE.SphereGeometry(0.05, 6, 4), P.neonRed, [-1.0, 3.62, -0.72]);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonRed, { bone: body, at: [-1.0, 3.7, -0.8] }), 2);
  // tie-down rings & cable coil
  for (let i = 0; i < 6; i++) for (const s of [1, -1])
    put(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.steel, [s * 1.2, 1.46, 0.5 - i * 0.9], body, { rotation: [90, 0, 0] });
  for (let i = 0; i < 4; i++) put(new THREE.TorusGeometry(0.2, 0.03, 5, 10), P.hullDark, [0.9, 1.5 + i * 0.05, -3.9 + 0.5], body, { rotation: [90, 0, 0] });
  // straps over crates
  put(box(0.55, 0.52, 0.06), P.trim, [0.7, 1.62, -3.4]);
  // tail lights & bumper strip
  for (const s of [1, -1]) {
    glow(put(box(0.3, 0.14, 0.06), P.neonRed, [s * 1.15, 1.65, -4.12]), 1.8);
    put(box(0.36, 0.2, 0.04), P.gunmetal, [s * 1.15, 1.65, -4.1]);
  }
  // rear ramp (rides rampHinge): local space is joint-relative via model-space at
  put(box(2.6, 0.08, 0.9), "#ffffff", [0, 1.3, -4.45], ramp, { texture: GRIP, rotation: [0, 0, 0] });
  put(box(2.6, 0.1, 0.1), P.trim, [0, 1.3, -4.9], ramp);
  for (const s of [1, -1]) {
    put(box(0.08, 0.14, 0.9), P.steel, [s * 1.3, 1.34, -4.45], ramp);
    for (let k = 0; k < 5; k++) put(new THREE.TorusGeometry(0.035, 0.01, 4, 6), P.steel, [s * 1.2, 1.6 - k * 0.07, -4.1 - k * 0.04], body, { rotation: [k * 30, 90, 0] });
  }
  put(box(2.0, 0.06, 0.06), P.neonRed, [0, 1.36, -4.88], ramp);
  void r; void M; void metal;
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: any; M: any };

export function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: body, at, ...o });

  // paints
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 0.9, n.y) * 0.6);
    const mud = smoothstep(1.9, 1.3, p.y) * smoothstep(0.4, 0.7, noise(p, 0.25, 3));
    return mix(base, P.mud, mud * 0.7);
  });
  const OLIVE = paint((p, n) => mix(P.armorOlive, P.hullLight, smoothstep(0.5, 1, n.y) * 0.35 + noise(p, 0.2, 5) * 0.15));

  // textures
  const windshield = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#16505e"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect y="${i * 2}" width="64" height="0.7" fill="#2ff3ff" opacity="0.28"/>`).join("")}
    <path d="M4 20 L18 8 L30 14 L44 5 L60 12" stroke="#7ffcff" stroke-width="1" fill="none"/>
    <circle cx="44" cy="5" r="1.5" fill="#ff3b30"/><text x="5" y="6" font-size="4" fill="#9ffcff">HUD 77 / TGT</text></svg>`, { size: 256 });
  const screen = svg(`<svg viewBox="0 0 40 24"><rect width="40" height="24" fill="#06202a"/>
    <path d="M0 6H40M0 14H40M10 0V24M26 0V24" stroke="#1b7a88" stroke-width="0.6"/>
    <path d="M4 20 L14 12 L24 15 L36 4" stroke="#ffb347" stroke-width="1.2" fill="none"/>
    <circle cx="24" cy="15" r="2" fill="#ff2bd6"/></svg>`, { size: 128 });
  const emblem = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#20242c" stroke="#e7b814" stroke-width="2"/>
    <path d="M16 5 L26 24 L6 24Z" fill="#e7b814"/><circle cx="16" cy="18" r="3" fill="#ff2bd6"/>
    <path d="M10 28h12" stroke="#2ff3ff" stroke-width="1.5"/></svg>`, { size: 128 });
  const hazard = svg(`<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#e7b814"/>
    ${[0, 8, 16, 24].map((x) => `<path d="M${x} 8 L${x + 4} 0 L${x + 8} 0 L${x + 4} 8Z" fill="#15161a"/>`).join("")}</svg>`, { size: 128 });
  const slit = svg(`<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#2b2f38"/>
    ${[3, 7, 11].map((y) => `<rect x="2" y="${y}" width="28" height="1.6" fill="#0a0c10"/>`).join("")}</svg>`, { size: 128 });

  // main shell: lower body
  put(box(2.5, 0.9, 1.8), HULL, [0, 1.75, 1.8]);
  // upper greenhouse, sloped roof
  put(box(2.3, 0.55, 1.5), HULL, [0, 2.45, 1.5]);
  // sloped roof wedge (front slope)
  b.slab([[-1.15, 2.72, 2.25], [1.15, 2.72, 2.25], [1.15, 2.2, 2.7], [-1.15, 2.2, 2.7]], { color: HULL, thickness: 0.1, bone: body });
  // roof plate
  put(box(2.4, 0.12, 1.7), OLIVE, [0, 2.8, 1.5]);
  put(box(2.5, 0.06, 1.8), P.hullLight, [0, 2.87, 1.5]);
  // windshield
  const ws = put(new THREE.PlaneGeometry(2.1, 0.6), "#ffffff", [0, 2.5, 2.46], { dir: [0, 0.75, 0.66], axis: "z", texture: windshield });
  glow(ws, 0.8);
  // A-pillars
  for (const s of [1, -1]) {
    b.rod([s * 1.15, 2.2, 2.7], [s * 1.15, 2.78, 2.22], 0.06, P.gunmetal, { bone: body });
    // visor brow
  }
  put(box(2.4, 0.08, 0.3), P.hullDark, [0, 2.78, 2.35], { rotation: [-20, 0, 0] });

  for (const s of [1, -1]) {
    const x = s * 1.26;
    // side window + shutter
    put(new THREE.PlaneGeometry(1.1, 0.42), "#ffffff", [s * 1.162, 2.42, 1.65], { dir: [s, 0, 0], axis: "z", texture: slit });
    put(new THREE.PlaneGeometry(0.9, 0.34), P.glass, [s * 1.165, 2.42, 1.65], { dir: [s, 0, 0], axis: "z" });
    // door panel
    put(box(0.06, 0.8, 1.2), OLIVE, [s * 1.27, 1.78, 1.65]);
    put(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", [s * 1.31, 1.45, 1.65], { dir: [s, 0, 0], axis: "z", texture: hazard });
    const em = put(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [s * 1.31, 1.85, 1.95], { dir: [s, 0, 0], axis: "z", texture: emblem });
    // handle
    put(box(0.05, 0.05, 0.22), P.steel, [s * 1.31, 1.98, 1.3]);
    // reactive armor tiles
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        put(box(0.08, 0.2, 0.3), j ? P.armorOlive : P.hullDark, [s * 1.33, 1.6 + j * 0.24, 1.2 + i * 0.4 + (j ? 0.05 : 0)]);
    // door seam
    put(box(0.02, 0.9, 0.03), P.hullDark, [s * 1.285, 1.78, 1.05]);
    put(box(0.02, 0.9, 0.03), P.hullDark, [s * 1.285, 1.78, 2.25]);
    // mirror camera pod
    b.rod([s * 1.25, 2.3, 2.5], [s * 1.55, 2.4, 2.55], 0.03, P.steel, { bone: body });
    put(box(0.18, 0.22, 0.14), P.gunmetal, [s * 1.6, 2.4, 2.55]);
    glow(put(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, [s * 1.6, 2.4, 2.64]), 1.5);
    // side neon trim
    glow(put(box(0.03, 0.03, 1.7), P.neonCyan, [s * 1.3, 1.34, 1.8]), 1.3);
  }
  // front fascia of cab below windshield
  put(box(2.3, 0.1, 0.1), P.hullDark, [0, 2.2, 2.7]);

  // interior
  for (const s of [1, -1]) {
    put(box(0.5, 0.12, 0.5), P.gunmetal, [s * 0.5, 1.95, 1.6]);
    put(box(0.5, 0.6, 0.1), P.gunmetal, [s * 0.5, 2.25, 1.35]);
    put(box(0.3, 0.15, 0.08), P.hullDark, [s * 0.5, 2.62, 1.33]);
  }
  put(box(2.2, 0.3, 0.4), P.hullDark, [0, 2.1, 2.4]);
  const sc = put(new THREE.PlaneGeometry(0.7, 0.4), "#ffffff", [-0.1, 2.3, 2.19], { dir: [0, 0.2, -1], axis: "z", texture: screen });
  sc.mesh.rotation.y = Math.PI;
  glow(put(new THREE.PlaneGeometry(0.7, 0.4), "#ffffff", [0.6, 2.3, 2.2], { dir: [0, 0.2, -1], axis: "z", texture: screen }), 1);
  b.sweep(
    b.ring({ at: [0.5, 2.15, 2.0], axis: [0, 0.5, -1] }, { count: 10, radius: 0.16 }).items,
    0.015, { color: P.rubber, bone: body },
  );

  // roof deck
  put(box(2.0, 0.04, 1.5), P.hullDark, [0, 2.92, 1.5]);
  // lightbar
  const lb = [P.neonRed, P.neonMagenta, P.neonCyan, P.neonCyan, P.neonMagenta, P.neonRed];
  put(box(1.5, 0.1, 0.18), P.gunmetal, [0, 2.97, 2.3]);
  lb.forEach((c, i) => glow(put(box(0.22, 0.09, 0.2), c, [-0.62 + i * 0.25, 3.0, 2.3]), 2));
  // hatch
  put(new THREE.CylinderGeometry(0.3, 0.34, 0.08, 8), OLIVE, [-0.45, 2.97, 1.4]);
  put(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 6), P.steel, [-0.45, 3.03, 1.4]);
  // antennas
  for (let i = 0; i < 3; i++) {
    const x = 0.7 + i * 0.12, z = 1.0 + R() * 0.2;
    b.spike([x, 2.94, z], [0.03 * i, 1, -0.1], 0.5 + i * 0.2, 0.012, { color: P.steel, bone: body });
    glow(put(new THREE.SphereGeometry(0.02, 5, 4), P.neonRed, [x + 0.01, 3.4 + i * 0.1, z - 0.05]), 2);
  }
  // satellite dish
  put(new THREE.CylinderGeometry(0.04, 0.06, 0.2, 6), P.gunmetal, [0.5, 3.03, 1.75]);
  b.lathe([[0, 0], [0.22, 0.07], [0.24, 0.09], [0.2, 0.09], [0, 0.03]], {
    at: [0.5, 3.17, 1.75], axis: [0.2, 0.7, 0.7], color: P.white, bone: body, segments: 8,
  });
  put(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 4), P.steel, [0.55, 3.28, 1.85], { rotation: [40, 0, 0] });

  // rear wall panel
  put(box(2.3, 0.9, 0.08), P.hullDark, [0, 1.85, 0.92]);
  glow(put(box(1.9, 0.03, 0.03), P.neonMagenta, [0, 2.3, 0.88]), 1.4);
  // headlight-ish fog lamps on roof corners
  for (const s of [1, -1]) glow(put(box(0.2, 0.08, 0.06), P.glowAmber, [s * 1.0, 2.9, 2.52]), 1.5);
}
```

<!-- call: fit-noseFront -->

The hood extrude is the main problem. Its `x: [0,0,1]` and `y: [0,1,0]` make the thickness axis run along x, but the 2.4 m slab is centred on the drawing's plane at x = -1.2, so it spans x from -2.4 to 0. I'm moving it to `at` x = 0 so it is centred on the body. The antennas and the sensor mast are shortened to fit under y = 1.95.

<<<<<<< SEARCH
    { at: [-1.2, 0.95, 2.7], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: hull, bone: body, bevel: 0.03 },
=======
    { at: [0, 0.95, 2.7], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: hull, bone: body, bevel: 0.03 },
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([0.6, 1.7, 3.0], [0.6, 2.0, 3.0], 0.03, P.gunmetal, { bone: body });
  box(0.14, 0.1, 0.14, P.hullDark, [0.6, 2.05, 3.0]);
  glow(box(0.06, 0.06, 0.04, P.neonRed, [0.6, 2.05, 3.08]), 1.5);
=======
  b.rod([0.6, 1.7, 3.0], [0.6, 1.85, 3.0], 0.03, P.gunmetal, { bone: body });
  box(0.14, 0.1, 0.14, P.hullDark, [0.6, 1.9, 3.0]);
  glow(box(0.06, 0.06, 0.04, P.neonRed, [0.6, 1.9, 3.08]), 1.5);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.spike([x, 1.45, 2.85], [lean / 100, 1, -0.1], 0.9, 0.012, { color: P.steel, bone: body });
=======
    b.spike([x, 1.45, 2.85], [lean / 100, 1, -0.1], 0.45, 0.012, { color: P.steel, bone: body });
>>>>>>> REPLACE

<!-- call: fit-wheels -->

The right-side wheels (s = -1) pushed their inner pieces the wrong way. `dir: ax` with `at(-s*…)` placed correctly, but the suspension arms and brake caliper extend outward on the right. The measured overshoot is on the −x side, and it comes from the arms (`-s*0.85` goes to −x when s = −1, hence x = −1.15 − 0.85 = −2.0). The mirror sign is wrong: inboard for s = −1 should be +x, so the offset must be `+s*…`. In this code `at(o)` already applies `c.x + s*o`, so `-s*0.4` inside `at` becomes `-s*s*0.4 = -0.4`. That always points to −x. I'll pass plain inboard offsets (negative o), which `at` multiplies by s correctly.

<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8), P.gunmetal, { bone: j, at: at(-s * 0.4), dir: ax });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), P.steel, { bone: j, at: at(-s * 0.2), dir: ax });
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.14), P.neonRed, { bone: j, at: at(-s * 0.2, 0.2, 0.2) });
    // suspension arm toward hull
    b.rod(at(-s * 0.4), at(-s * 0.85, 0.1), 0.06, P.gunmetal, { bone: j });
    b.rod(at(-s * 0.5, -0.1, 0.1), at(-s * 0.9, 0.25, 0.1), 0.04, P.hullLight, { bone: j });
=======
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8), P.gunmetal, { bone: j, at: at(-0.4), dir: ax });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 12), P.steel, { bone: j, at: at(-0.2), dir: ax });
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.14), P.neonRed, { bone: j, at: at(-0.2, 0.2, 0.2) });
    // suspension arm toward hull
    b.rod(at(-0.4), at(-0.28 - 0.0, 0.1), 0.06, P.gunmetal, { bone: j });
    b.rod(at(-0.3, -0.1, 0.1), at(-0.28, 0.25, 0.1), 0.04, P.hullLight, { bone: j });
>>>>>>> REPLACE

<!-- call: fit-turret -->

```ts
<<<<<<< SEARCH
  decal(new THREE.PlaneGeometry(0.3, 0.3), STENCIL, at(-0.4, 3.376, 0.1), [0, 1, 0], yaw);
=======
  decal(new THREE.PlaneGeometry(0.3, 0.3), STENCIL, at(-0.4, 3.165, 0.1), [0, 1, 0], yaw);
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(box(0.9, 0.12, 0.6), PANEL, { bone: yaw, at: at(0, 3.17, 0.15) });
=======
  b.part(box(0.9, 0.08, 0.6), PANEL, { bone: yaw, at: at(0, 3.12, 0.15) });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(box(0.3, 0.28, 0.3), P.hullDark, { bone: yaw, at: at(-0.45, 3.3, 0.45) });
  b.part(cyl(0.05, 0.05, 0.3, 6), P.steel, { bone: yaw, at: at(-0.45, 3.1, 0.45) });
  glow(decal(new THREE.PlaneGeometry(0.2, 0.2), EYE, at(-0.45, 3.3, 0.61), [0, 0, 1], yaw), 2);
  b.part(box(0.34, 0.05, 0.34), P.hull, { bone: yaw, at: at(-0.45, 3.46, 0.45) });
=======
  b.part(box(0.3, 0.28, 0.3), P.hullDark, { bone: yaw, at: at(-0.74, 3.0, 0.45) });
  b.part(cyl(0.05, 0.05, 0.3, 6), P.steel, { bone: yaw, at: at(-0.74, 2.8, 0.45) });
  glow(decal(new THREE.PlaneGeometry(0.2, 0.2), EYE, at(-0.74, 3.0, 0.61), [0, 0, 1], yaw), 2);
  b.part(box(0.34, 0.05, 0.34), P.hull, { bone: yaw, at: at(-0.74, 3.16, 0.45) });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.part(box(0.36, 0.36, 0.5), P.gunmetal, { bone: yaw, at: at(0.78, 3.28, 0.45) });
=======
  b.part(box(0.3, 0.36, 0.5), P.gunmetal, { bone: yaw, at: at(0.75, 3.0, 0.45) });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(cyl(0.065, 0.065, 0.1, 8), P.hullDark, { bone: yaw, at: at(0.78 + x, 3.28 + y, 0.72), rotation: [90, 0, 0] });
      b.part(cyl(0.035, 0.035, 0.02, 6), P.neonRed, { bone: yaw, at: at(0.78 + x, 3.28 + y, 0.775), rotation: [90, 0, 0] });
=======
      b.part(cyl(0.065, 0.065, 0.1, 8), P.hullDark, { bone: yaw, at: at(0.75 + x, 3.0 + y, 0.72), rotation: [90, 0, 0] });
      b.part(cyl(0.035, 0.035, 0.02, 6), P.neonRed, { bone: yaw, at: at(0.75 + x, 3.0 + y, 0.775), rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone: yaw, at: at(s * 0.7 * (s > 0 ? 0 : 1) - (s < 0 ? 0.72 : -0.0) + (s > 0 ? 0.0 : 0), 2.88 + i * 0.0, 0.1 + i * 0.1),
=======
        bone: yaw, at: at(s * 0.8, 2.85, 0.5 + i * 0.1),
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(cyl(0.05, 0.05, 1.9, 8), BLUED, { bone: pitch, at: at(x, 3.0, 1.85), rotation: [90, 0, 0] });
=======
    b.part(cyl(0.05, 0.05, 1.3, 8), BLUED, { bone: pitch, at: at(x, 3.0, 1.65), rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(cyl(0.09, 0.09, 0.05, 8), P.steel, { bone: pitch, at: at(x, 3.0, 1.45 + i * 0.22), rotation: [90, 0, 0] });
      glow(b.part(cyl(0.095, 0.095, 0.03, 8), P.neonCyan, { bone: pitch, at: at(x, 3.0, 1.56 + i * 0.22), rotation: [90, 0, 0] }), 1.6);
=======
      b.part(cyl(0.09, 0.09, 0.05, 8), P.steel, { bone: pitch, at: at(x, 3.0, 1.25 + i * 0.18), rotation: [90, 0, 0] });
      glow(b.part(cyl(0.095, 0.095, 0.03, 8), P.neonCyan, { bone: pitch, at: at(x, 3.0, 1.34 + i * 0.18), rotation: [90, 0, 0] }), 1.6);
>>>>>>> REPLACE
```

<!-- call: fit-chassis -->

The arches, exhaust stacks, tow hooks and belly wedge were the pieces reaching outside the box, so I have changed those. I have not re-run the module, so the new extents are unmeasured.

- **Wheel arches:** the half-torus is replaced by a short lintel box with bolts on a smaller arc, so the front arch stays near z 3.
- **Exhaust stacks:** shortened so they stay under y 1.35.
- **Tow hooks:** pulled in from z 3.12 and -4.12 to 3.0 and -4.0.
- **Belly V wedge:** shortened from 6.0 to 5.6 m.

The two exhaust stacks now top out at y 1.34, so they no longer stand tall behind the cab as the spec describes. That was the cost of keeping them inside the box.

<<<<<<< SEARCH
      b.part(new THREE.TorusGeometry(0.82, 0.07, 4, 10, Math.PI), P.hullLight, {
        bone: body, at: [s * 1.38, 0.65, z], rotation: [0, 90, 0], flat: true,
      });
      box(0.12, 0.08, 1.8, P.hullDark, [s * 1.38, 1.5, z]);
      for (let k = 0; k < 6; k++) {
        const a = (k / 5) * Math.PI;
        cyl(0.03, 0.05, P.steel, [s * 1.44, 0.65 + Math.sin(a) * 0.82, z + Math.cos(a) * 0.82], [1, 0, 0], 6);
      }
=======
      box(0.12, 0.08, 0.6, P.hullDark, [s * 1.38, 1.28, z]);
      for (let k = 0; k < 6; k++) {
        const a = Math.PI * (0.2 + 0.6 * k / 5);
        cyl(0.03, 0.05, P.steel, [s * 1.4, 0.65 + Math.sin(a) * 0.6, z + Math.cos(a) * 0.6], [1, 0, 0], 6);
      }
>>>>>>> REPLACE
<<<<<<< SEARCH
  const vg = new THREE.CylinderGeometry(0.5, 0.5, 6.0, 3);
=======
  const vg = new THREE.CylinderGeometry(0.5, 0.5, 5.6, 3);
>>>>>>> REPLACE
<<<<<<< SEARCH
    cyl(0.07, 1.1, soot, [1.2 + dx * 0.0 + (dx ? 0 : 0) - 0.0, 1.9, 0.62 - dx * 1.5 + 0.0], [0, 1, 0], 8);
    cyl(0.1, 0.1, P.steel, [1.2, 1.9 + 0.55, 0.62 - dx * 1.5], [0, 1, 0], 8);
    box(0.14, 0.14, 0.14, P.gunmetal, [1.2, 1.45, 0.62 - dx * 1.5]);
  }
  // exhaust clamps
  for (const dz of [0.62, 0.29]) cyl(0.09, 0.05, P.trim, [1.2, 1.75, dz], [0, 1, 0], 8);
=======
    cyl(0.07, 0.3, soot, [1.2, 1.2, 0.62 - dx * 1.5], [0, 1, 0], 8);
    cyl(0.1, 0.06, P.steel, [1.2, 1.32, 0.62 - dx * 1.5], [0, 1, 0], 8);
  }
  for (const dz of [0.62, 0.29]) cyl(0.09, 0.04, P.trim, [1.2, 1.2, dz], [0, 1, 0], 8);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.14, 0.14, 0.3, P.hullDark, [s * 0.6, 0.6, 2.95]);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 4, 8), P.steel, { bone: body, at: [s * 0.6, 0.6, 3.12], flat: true });
    box(0.14, 0.14, 0.3, P.hullDark, [s * 0.6, 0.6, -3.95]);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 4, 8), P.steel, { bone: body, at: [s * 0.6, 0.6, -4.12], flat: true });
=======
    box(0.14, 0.14, 0.2, P.hullDark, [s * 0.6, 0.6, 2.85]);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 4, 8), P.steel, { bone: body, at: [s * 0.6, 0.6, 2.97], flat: true });
    box(0.14, 0.14, 0.2, P.hullDark, [s * 0.6, 0.6, -3.8]);
    b.part(new THREE.TorusGeometry(0.09, 0.025, 4, 8), P.steel, { bone: body, at: [s * 0.6, 0.6, -3.95], flat: true });
>>>>>>> REPLACE

<!-- call: fit-cab -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: any; M: any };

export function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(g, color, { bone: body, at, ...o });

  // paints
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 0.9, n.y) * 0.6);
    const mud = smoothstep(1.9, 1.3, p.y) * smoothstep(0.4, 0.7, noise(p, 0.25, 3));
    return mix(base, P.mud, mud * 0.7);
  });
  const OLIVE = paint((p, n) => mix(P.armorOlive, P.hullLight, smoothstep(0.5, 1, n.y) * 0.35 + noise(p, 0.2, 5) * 0.15));

  // textures
  const windshield = svg(`<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#16505e"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect y="${i * 2}" width="64" height="0.7" fill="#2ff3ff" opacity="0.28"/>`).join("")}
    <path d="M4 20 L18 8 L30 14 L44 5 L60 12" stroke="#7ffcff" stroke-width="1" fill="none"/>
    <circle cx="44" cy="5" r="1.5" fill="#ff3b30"/><text x="5" y="6" font-size="4" fill="#9ffcff">HUD 77 / TGT</text></svg>`, { size: 256 });
  const screen = svg(`<svg viewBox="0 0 40 24"><rect width="40" height="24" fill="#06202a"/>
    <path d="M0 6H40M0 14H40M10 0V24M26 0V24" stroke="#1b7a88" stroke-width="0.6"/>
    <path d="M4 20 L14 12 L24 15 L36 4" stroke="#ffb347" stroke-width="1.2" fill="none"/>
    <circle cx="24" cy="15" r="2" fill="#ff2bd6"/></svg>`, { size: 128 });
  const emblem = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#20242c" stroke="#e7b814" stroke-width="2"/>
    <path d="M16 5 L26 24 L6 24Z" fill="#e7b814"/><circle cx="16" cy="18" r="3" fill="#ff2bd6"/>
    <path d="M10 28h12" stroke="#2ff3ff" stroke-width="1.5"/></svg>`, { size: 128 });
  const hazard = svg(`<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#e7b814"/>
    ${[0, 8, 16, 24].map((x) => `<path d="M${x} 8 L${x + 4} 0 L${x + 8} 0 L${x + 4} 8Z" fill="#15161a"/>`).join("")}</svg>`, { size: 128 });
  const slit = svg(`<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#2b2f38"/>
    ${[3, 7, 11].map((y) => `<rect x="2" y="${y}" width="28" height="1.6" fill="#0a0c10"/>`).join("")}</svg>`, { size: 128 });

  // main shell: lower body
  put(box(2.5, 0.9, 1.8), HULL, [0, 1.75, 1.8]);
  // upper greenhouse, sloped roof
  put(box(2.3, 0.55, 1.2), HULL, [0, 2.45, 1.5]);
  // sloped roof wedge (front slope)
  b.slab([[-1.15, 2.72, 2.25], [1.15, 2.72, 2.25], [1.15, 2.2, 2.7], [-1.15, 2.2, 2.7]], { color: HULL, thickness: 0.1, bone: body });
  // roof plate
  put(box(2.4, 0.12, 1.2), OLIVE, [0, 2.8, 1.5]);
  put(box(2.5, 0.06, 1.2), P.hullLight, [0, 2.87, 1.5]);
  // windshield
  const ws = put(new THREE.PlaneGeometry(2.1, 0.6), "#ffffff", [0, 2.5, 2.46], { dir: [0, 0.75, 0.66], axis: "z", texture: windshield });
  glow(ws, 0.8);
  // A-pillars
  for (const s of [1, -1]) {
    b.rod([s * 1.15, 2.2, 2.7], [s * 1.15, 2.78, 2.22], 0.06, P.gunmetal, { bone: body });
  }
  put(box(2.4, 0.08, 0.3), P.hullDark, [0, 2.78, 2.35], { rotation: [-20, 0, 0] });

  for (const s of [1, -1]) {
    // side window + shutter
    put(new THREE.PlaneGeometry(1.1, 0.42), "#ffffff", [s * 1.162, 2.42, 1.65], { dir: [s, 0, 0], axis: "z", texture: slit });
    put(new THREE.PlaneGeometry(0.9, 0.34), P.glass, [s * 1.165, 2.42, 1.65], { dir: [s, 0, 0], axis: "z" });
    // door panel
    put(box(0.06, 0.8, 1.2), OLIVE, [s * 1.27, 1.78, 1.65]);
    put(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", [s * 1.31, 1.45, 1.65], { dir: [s, 0, 0], axis: "z", texture: hazard });
    put(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", [s * 1.31, 1.85, 1.95], { dir: [s, 0, 0], axis: "z", texture: emblem });
    // handle
    put(box(0.05, 0.05, 0.22), P.steel, [s * 1.31, 1.98, 1.3]);
    // reactive armor tiles
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        put(box(0.08, 0.2, 0.3), j ? P.armorOlive : P.hullDark, [s * 1.33, 1.6 + j * 0.24, 1.2 + i * 0.4 + (j ? 0.05 : 0)]);
    // door seam
    put(box(0.02, 0.9, 0.03), P.hullDark, [s * 1.285, 1.78, 1.05]);
    put(box(0.02, 0.9, 0.03), P.hullDark, [s * 1.285, 1.78, 2.25]);
    // mirror camera pod
    b.rod([s * 1.1, 2.3, 2.5], [s * 1.2, 2.4, 2.55], 0.03, P.steel, { bone: body });
    put(box(0.16, 0.22, 0.14), P.gunmetal, [s * 1.2, 2.4, 2.55]);
    glow(put(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, [s * 1.2, 2.4, 2.63]), 1.5);
    // side neon trim
    glow(put(box(0.03, 0.03, 1.7), P.neonCyan, [s * 1.3, 1.34, 1.8]), 1.3);
  }
  // front fascia of cab below windshield
  put(box(2.3, 0.1, 0.1), P.hullDark, [0, 2.2, 2.7]);

  // interior
  for (const s of [1, -1]) {
    put(box(0.5, 0.12, 0.5), P.gunmetal, [s * 0.5, 1.95, 1.6]);
    put(box(0.5, 0.6, 0.1), P.gunmetal, [s * 0.5, 2.25, 1.35]);
    put(box(0.3, 0.15, 0.08), P.hullDark, [s * 0.5, 2.62, 1.33]);
  }
  put(box(2.2, 0.3, 0.4), P.hullDark, [0, 2.1, 2.4]);
  const sc = put(new THREE.PlaneGeometry(0.7, 0.4), "#ffffff", [-0.1, 2.3, 2.19], { dir: [0, 0.2, -1], axis: "z", texture: screen });
  sc.mesh.rotation.y = Math.PI;
  glow(put(new THREE.PlaneGeometry(0.7, 0.4), "#ffffff", [0.6, 2.3, 2.2], { dir: [0, 0.2, -1], axis: "z", texture: screen }), 1);
  b.sweep(
    b.ring({ at: [0.5, 2.15, 2.0], axis: [0, 0.5, -1] }, { count: 10, radius: 0.16 }).items,
    0.015, { color: P.rubber, bone: body },
  );

  // roof deck
  put(box(2.0, 0.04, 1.2), P.hullDark, [0, 2.88, 1.5]);
  // lightbar
  const lb = [P.neonRed, P.neonMagenta, P.neonCyan, P.neonCyan, P.neonMagenta, P.neonRed];
  put(box(1.5, 0.08, 0.18), P.gunmetal, [0, 2.86, 2.3]);
  lb.forEach((c, i) => glow(put(box(0.22, 0.08, 0.2), c, [-0.62 + i * 0.25, 2.86, 2.3]), 2));
  // hatch
  put(new THREE.CylinderGeometry(0.3, 0.34, 0.04, 8), OLIVE, [-0.45, 2.88, 1.4]);
  put(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6), P.steel, [-0.45, 2.89, 1.4]);
  // antennas
  for (let i = 0; i < 3; i++) {
    const x = 0.7 + i * 0.12, z = 1.0 + R() * 0.2;
    b.spike([x, 2.88, z], [0.5 * i, 1, -0.1], 0.02 + i * 0.005, 0.012, { color: P.steel, bone: body });
    glow(put(new THREE.SphereGeometry(0.02, 5, 4), P.neonRed, [x, 2.88, z]), 2);
  }
  // satellite dish
  put(new THREE.CylinderGeometry(0.03, 0.04, 0.04, 6), P.gunmetal, [0.5, 2.88, 1.75]);
  b.lathe([[0, 0], [0.12, 0.02], [0.13, 0.03], [0.1, 0.03], [0, 0.01]], {
    at: [0.5, 2.88, 1.75], axis: [0.2, 0.9, 0.3], color: P.white, bone: body, segments: 8,
  });

  // rear wall panel
  put(box(2.3, 0.9, 0.08), P.hullDark, [0, 1.85, 0.94]);
  glow(put(box(1.9, 0.03, 0.03), P.neonMagenta, [0, 2.3, 0.9]), 1.4);
  for (const s of [1, -1]) glow(put(box(0.2, 0.08, 0.06), P.glowAmber, [s * 1.0, 2.86, 2.52]), 1.5);
}
```
<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Aegis-9",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a slung-forward cab and gun turret, guarding a sealed glowing cargo pod on its rear bed.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.1, 8.0],
  "layout": "Long heavy truck facing +Z. Front (z 2.6..4.0): wedge armoured bumper with plough blade, grille and twin headlights, bright cyan/amber neon strips. Cab (z 0.6..3.2) is a chunky angular wedge with slanted dark glazing and a roof light bar. Behind the cab, on the chassis deck, a roof-less armour bridge carries a rotating gun turret at z 0.2 with a twin-barrel autocannon pointing forward. Rear bed (z -4.0..-0.4) carries a big sealed cargo pod: hexagonal-profile capsule in teal-white with hazard-yellow bands, bolted straps, glowing cyan seam and a magenta status panel. Six large chunky wheels (three per side) with hubcaps and armoured fender plates sit on the floor; the chassis rides on a dark frame with side skirts. Every part uses angular facets, panel lines, neon trims in cyan and magenta, hazard stripes and decals on dark gunmetal.",
  "palette": {
    "hull": "#2b303a",
    "hullLight": "#4a5262",
    "armorDark": "#171a21",
    "trimYellow": "#f0b90b",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "amber": "#ffa31a",
    "glass": "#0f2a3a",
    "tire": "#101114",
    "hub": "#7b8494",
    "podWhite": "#d9e4ea",
    "podTeal": "#1f8f9a",
    "steel": "#8d96a6",
    "warningRed": "#d6283a"
  },
  "mounts": {
    "frameTop": [0, 1.3, 0],
    "cabFloor": [0, 1.3, 2.0],
    "bedDeck": [0, 1.3, -2.2],
    "turretRing": [0, 2.45, 0.1],
    "bumperBack": [0, 0.8, 3.2],
    "axleFront": [0, 0.65, 2.4],
    "axleMid": [0, 0.65, -0.6],
    "axleRear": [0, 0.65, -2.8]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "cab", "parent": "body", "at": [0, 1.3, 2.0], "dir": [0, 0, 1], "role": "hinge", "group": "cab" },
    { "name": "turret", "parent": "body", "at": [0, 2.45, 0.1], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gun", "parent": "turret", "at": [0, 2.85, 0.5], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "pod", "parent": "body", "at": [0, 1.3, -2.2], "dir": [0, 0, 1], "role": "hinge", "group": "pod" },
    { "name": "wheelFL", "parent": "body", "at": [1.3, 0.65, 2.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.3, 0.65, 2.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.3, 0.65, -0.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.3, 0.65, -0.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.3, 0.65, -2.8], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.3, 0.65, -2.8], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Ladder frame and hull deck: two long dark rails, cross members, side skirts with hazard-yellow chevron paint, panelled gunmetal deck plate from z -4.0 to 3.0, fuel tanks and battery boxes slung under the sides, exhaust stacks behind the cab, rear tow hitch and tail lights (red neon bars), cable runs and rivets, underglow cyan strips along the skirts. Panelled paint on skirts.",
      "box": [[-1.5, 0.45, -4.0], [1.5, 1.3, 3.0]],
      "attaches": "Top face at frameTop/bedDeck/cabFloor height 1.3; wheel arches open at the axle mounts; cab sits on cabFloor, pod on bedDeck.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wheels",
      "builds": "Six large chunky low-poly wheels (radius 0.65, width 0.55, octagonal tyres with tread blocks, hex hub caps in steel with cyan glowing centre disc, lug nuts) at the three axle lines on both sides, plus axles stubs, suspension arms and leaf springs toward the frame, and mud-flap plates behind rear wheels. Fender arches with armoured wheel-well plates and hazard trim over each wheel.",
      "box": [[-1.65, 0.0, -3.5], [1.65, 1.5, 3.1]],
      "attaches": "Wheel joints at axleFront, axleMid, axleRear (x ±1.3, y 0.65); suspension reaches chassis rails.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cabShell",
      "builds": "Angular wedge cab body from z 0.6 to 3.0, y 1.3 to 2.7: slanted front windscreen (dark glass with a drawn cyan HUD-reflection SVG texture), side windows, roof with sensor mast, roof light bar housing, door panels with panel seams, handles, side mirrors with small screens, armoured window shutters half-raised, hazard stripes, step plates, door emblem decal (convoy glyph). Interior glimpsed: seats, dashboard glow behind glass.",
      "box": [[-1.3, 1.3, 0.6], [1.3, 2.8, 3.0]],
      "attaches": "Sits on cabFloor; front face meets cabFront at z 3.0; rear wall faces the turret bay at z 0.6.",
      "joints": ["cab"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cabFront",
      "builds": "Front end: heavy wedge bumper and plough blade (hazard-yellow chevrons, steel edge), vented grille with glowing cyan slats and a drawn emblem, twin angular headlights with amber glowing lenses, fog lights, magenta neon underline, tow hooks, winch drum with cable, bull-bar tubes, license plate with SVG text, hood armour plating in panelled paint, radar dome, front antenna whips.",
      "box": [[-1.45, 0.4, 3.0], [1.45, 2.0, 4.0]],
      "attaches": "Back face at z 3.0 meets cabShell front; bumper bottom clears the floor; bumperBack mount at z 3.2.",
      "joints": ["cab", "body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "turretBase",
      "builds": "Armour bridge and turret ring behind the cab: a low armoured gantry (z -0.5..0.6, y 1.3..2.45) with ammo crates, antenna array, and a rotating turret: faceted dome housing with panelled paint, rotating ring with teeth, sensor eye (glowing magenta lens), side armor plates, smoke launchers, searchlight. Turret housing centred on turretRing.",
      "box": [[-1.2, 1.3, -0.9], [1.2, 3.1, 0.9]],
      "attaches": "Gantry stands on the chassis deck at y 1.3; turret ring at turretRing; gun mount at x=0 y 2.85 z 0.5 on the turret front.",
      "joints": ["turret", "body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "gun",
      "builds": "Twin-barrel autocannon on the turret front: cradle with trunnions, two barrels with muzzle brakes and heat-shroud vents, glowing amber heat rings, ammo belt feeding from a drum box on one side, recoil sleeves, rail with scope and cyan targeting laser lens, yellow band markings. Barrels point forward +Z along z 0.5..2.7; the whole gun sits above the cab roof (cab roof max y 2.8, so gun at y 2.85..3.1 is clear).",
      "box": [[-0.6, 2.75, 0.4], [0.6, 3.1, 2.8]],
      "attaches": "Rear cradle at gun joint on the turret front; rides turret/gun joints.",
      "joints": ["gun", "turret"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "cargoPod",
      "builds": "Sealed cargo pod on the rear bed from z -4.0 to -0.6, y 1.3 to 3.0: elongated hexagonal-profile capsule with faceted nose and tail caps, podWhite/podTeal painted shell with panel seams and scuffs, hazard-yellow bands, bolted retaining straps and ratchet buckles over it, cradle rails and tie-down anchors on the deck, glowing cyan seam line along its length, magenta status screen and biohazard-style SVG sealed-label decal, locking hatch with wheel, pressure gauge, small vent pipes, red warning beacon on the roof.",
      "box": [[-1.35, 1.3, -4.0], [1.35, 3.1, -0.6]],
      "attaches": "Cradle sits on bedDeck at y 1.3; front face meets turret gantry area near z -0.6.",
      "joints": ["pod"],
      "floor": false,
      "budget": 150
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, glow } from "agentic-3js-builder";

type Ctx = any;

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.65, W = 0.55;
  const TREAD = paint((p, n) => {
    const v = noise(p, 0.12, 3);
    const c = mix("#0c0d10", "#1d1f25", v);
    return n.y > 0.6 ? mix(c, "#2a2d34", 0.3) : c;
  });
  const HUBP = paint((p, n) => mix("#5f6877", "#a5aebd", noise(p, 0.05, 5) * 0.8 + (n.y > 0.5 ? 0.2 : 0)));
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f0b90b"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#171a21"/>`).join("")}
    </svg>`,
    { size: 128 },
  );
  const HUBTEX = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0b4a50"/><circle cx="32" cy="32" r="22" fill="#2ff3ff"/><circle cx="32" cy="32" r="10" fill="#e8ffff"/><path d="M32 4V14M32 50V60M4 32H14M50 32H60" stroke="#171a21" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.4], ["wheelFR", -1, 2.4],
    ["wheelML", 1, -0.6], ["wheelMR", -1, -0.6],
    ["wheelRL", 1, -2.8], ["wheelRR", -1, -2.8],
  ];

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const xc = s * 1.3;
    const axisDir: [number, number, number] = [s, 0, 0];
    // tyre: octagonal
    b.part(new THREE.CylinderGeometry(R, R, W, 8), TREAD, { bone: j, at: [xc, 0.65, z], dir: axisDir, flat: true });
    // sidewall rings
    for (const o of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.78, R * 0.78, 0.04, 8), P.armorDark, {
        bone: j, at: [xc + s * o * (W / 2 + 0.005), 0.65, z], dir: axisDir, flat: true,
      });
    }
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      const y = 0.65 + Math.cos(a) * (R + 0.02), zz = z + Math.sin(a) * (R + 0.02);
      b.part(new THREE.BoxGeometry(W * 0.9, 0.07, 0.17), P.tire, {
        bone: j, at: [xc, y, zz], rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
    // outer hub
    const ox = xc + s * (W / 2 + 0.05);
    b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 6), HUBP, { bone: j, at: [ox, 0.65, z], dir: axisDir, flat: true });
    glow(
      b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", {
        bone: j, at: [ox + s * 0.056, 0.65, z], dir: axisDir, axis: "z", texture: HUBTEX,
      }),
      1.4,
    );
    // lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), P.steel, {
        bone: j, at: [ox + s * 0.05, 0.65 + Math.cos(a) * 0.26, z + Math.sin(a) * 0.26], dir: axisDir,
      });
    }
    // inner hub
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 6), P.hub, {
      bone: j, at: [xc - s * (W / 2 + 0.03), 0.65, z], dir: axisDir, flat: true,
    });

    // axle stub (to frame)
    b.rod([xc - s * 0.3, 0.65, z], [s * 0.95, 0.65, z], 0.09, P.steel, { bone: J.body, sides: 8 });
    // suspension arm
    b.rod([s * 1.0, 0.62, z - 0.25], [s * 1.5 - s * 0.2, 0.62, z + 0.25], 0.05, P.hullLight, { bone: J.body, sides: 6 });
    b.rod([s * 1.0, 0.9, z + 0.3], [s * 1.2, 0.68, z + 0.05], 0.045, P.steel, { bone: J.body, sides: 6 });
    // leaf springs
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.BoxGeometry(0.1, 0.025, 0.95 - k * 0.14), P.armorDark, {
        bone: J.body, at: [s * 1.0, 0.82 + k * 0.03, z],
      });
    }
    b.part(new THREE.BoxGeometry(0.2, 0.08, 0.14), P.steel, { bone: J.body, at: [s * 1.0, 0.76, z] });

    // fender arch: top plate and front/rear cheeks
    const fx = s * 1.3;
    b.part(new THREE.BoxGeometry(0.72, 0.07, 1.5), P.hull, { bone: J.body, at: [fx, 1.38, z] });
    b.part(new THREE.BoxGeometry(0.72, 0.1, 0.5), P.hullLight, {
      bone: J.body, at: [fx, 1.28, z + 0.65], rotation: [-30, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.72, 0.1, 0.5), P.hullLight, {
      bone: J.body, at: [fx, 1.28, z - 0.65], rotation: [30, 0, 0],
    });
    // outer fender lip with hazard trim
    b.part(new THREE.BoxGeometry(0.06, 0.12, 1.5), P.armorDark, { bone: J.body, at: [fx + s * 0.36, 1.32, z] });
    b.part(new THREE.PlaneGeometry(1.4, 0.1), "#ffffff", {
      bone: J.body, at: [fx + s * 0.395, 1.32, z], dir: [s, 0, 0], axis: "z", texture: HAZ,
    });
    // wheel-well plate on inner side
    b.part(new THREE.BoxGeometry(0.05, 0.6, 1.3), P.armorDark, { bone: J.body, at: [s * 0.95, 1.05, z] });
    // rivets on fender
    for (let r = -2; r <= 2; r++) {
      b.part(new THREE.SphereGeometry(0.03, 5, 3), P.steel, { bone: J.body, at: [fx + s * 0.1, 1.43, z + r * 0.3] });
    }
  }

  // mud flaps behind rear wheels
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.6), P.armorDark, { bone: J.body, at: [s * 1.3, 0.62, -3.55] });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 0.62), P.trimYellow, { bone: J.body, at: [s * 1.3, 0.4, -3.55] });
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.1), P.warningRed, { bone: J.body, at: [s * 1.3, 0.82, -3.55] });
    b.rod([s * 1.3 - 0.2, 0.9, -3.4], [s * 1.3 + 0.2, 0.9, -3.4], 0.025, P.steel, { bone: J.body, sides: 5 });
  }
}
```

<!-- call: gun -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildGun({ b, J, P, M }: Ctx) {
  const gun = J.gun;
  const turret = J.turret;
  const Y = 2.95; // barrel axis height
  const BX = 0.2; // barrel offset

  const gunmetal = paint((p, n) => {
    const base = mix("#2b303a", "#4a5262", noise(p, 0.12, 3));
    const top = smoothstep(0.3, 0.9, n.y);
    return mix(base, "#5a6478", top * 0.4);
  });

  const cyl = (r0: number, r1: number, h: number, s = 8) => new THREE.CylinderGeometry(r0, r1, h, s);
  const zdir: [number, number, number] = [0, 0, 1];

  // Rear cradle block with trunnions
  b.part(new THREE.BoxGeometry(0.62, 0.26, 0.5), gunmetal, { bone: gun, at: [0, Y, 0.62] });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.42), P.hullLight, { bone: gun, at: [0, Y + 0.15, 0.64] });
  for (const s of [1, -1]) {
    b.part(cyl(0.07, 0.07, 0.14, 8), P.steel, { bone: turret, at: [s * 0.36, Y - 0.02, 0.62], dir: [1, 0, 0] });
    b.part(new THREE.BoxGeometry(0.06, 0.3, 0.3), P.armorDark, { bone: turret, at: [s * 0.3, Y - 0.04, 0.62] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.1), P.trimYellow, { bone: turret, at: [s * 0.43, Y + 0.12, 0.56] });
  }

  // Receiver housing
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.4), P.armorDark, { bone: gun, at: [0, Y, 0.98] });
  b.part(new THREE.BoxGeometry(0.52, 0.03, 0.12), P.trimYellow, { bone: gun, at: [0, Y + 0.11, 1.0] });

  // Twin barrels
  for (const s of [1, -1]) {
    const x = s * BX;
    // recoil sleeve
    b.part(cyl(0.09, 0.09, 0.5, 8), P.hull, { bone: gun, at: [x, Y, 1.4], dir: zdir });
    b.part(cyl(0.1, 0.1, 0.05, 8), P.trimYellow, { bone: gun, at: [x, Y, 1.2], dir: zdir });
    b.part(cyl(0.1, 0.1, 0.05, 8), P.trimYellow, { bone: gun, at: [x, Y, 1.3], dir: zdir });
    // barrel
    b.part(cyl(0.045, 0.05, 1.5, 8), P.steel, { bone: gun, at: [x, Y, 2.0], dir: zdir });
    // heat shroud with vents
    b.part(cyl(0.085, 0.085, 0.55, 8), P.armorDark, { bone: gun, at: [x, Y, 1.9], dir: zdir });
    for (let i = 0; i < 4; i++)
      b.part(new THREE.BoxGeometry(0.19, 0.025, 0.05), P.hullLight, { bone: gun, at: [x, Y + 0.075, 1.72 + i * 0.12] });
    // glowing heat rings
    for (const z of [1.68, 2.2, 2.4]) {
      glow(b.part(cyl(0.075, 0.075, 0.03, 8), P.amber, { bone: gun, at: [x, Y, z], dir: zdir }), 1.6);
    }
    // muzzle brake
    b.part(cyl(0.085, 0.07, 0.2, 6), P.armorDark, { bone: gun, at: [x, Y, 2.62], dir: zdir });
    b.part(new THREE.BoxGeometry(0.2, 0.025, 0.12), P.steel, { bone: gun, at: [x, Y, 2.62] });
    b.part(new THREE.BoxGeometry(0.025, 0.2, 0.12), P.steel, { bone: gun, at: [x, Y, 2.62] });
    glow(b.part(cyl(0.03, 0.03, 0.02, 6), P.amber, { bone: gun, at: [x, Y, 2.73], dir: zdir }), 1.2);
  }
  // barrel bridge clamp
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.08), P.trimYellow, { bone: gun, at: [0, Y, 2.0] });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.08), P.armorDark, { bone: gun, at: [0, Y, 2.45] });

  // Top rail with scope and laser
  b.part(new THREE.BoxGeometry(0.08, 0.03, 0.8), P.steel, { bone: gun, at: [0, Y + 0.14, 1.2] });
  b.part(cyl(0.04, 0.04, 0.3, 8), P.armorDark, { bone: gun, at: [0, Y + 0.2, 1.2], dir: zdir });
  b.part(cyl(0.05, 0.04, 0.05, 8), P.steel, { bone: gun, at: [0, Y + 0.2, 1.37], dir: zdir });
  glow(b.part(cyl(0.032, 0.032, 0.01, 8), P.neonCyan, { bone: gun, at: [0, Y + 0.2, 1.4], dir: zdir }), 1.8);
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.1), P.hull, { bone: gun, at: [0, Y + 0.17, 1.55] });
  glow(b.part(cyl(0.015, 0.015, 0.02, 6), P.neonCyan, { bone: gun, at: [0, Y + 0.17, 1.61], dir: zdir }), 2);
  glow(b.part(new THREE.BoxGeometry(0.06, 0.012, 0.5), P.neonCyan, { bone: gun, at: [0, Y + 0.158, 1.0] }), 1.3);

  // Ammo drum box on left side
  b.part(new THREE.BoxGeometry(0.22, 0.2, 0.3), P.hull, { bone: gun, at: [0.5, Y - 0.05, 0.85] });
  b.part(new THREE.BoxGeometry(0.24, 0.05, 0.32), P.trimYellow, { bone: gun, at: [0.5, Y + 0.07, 0.85] });
  b.part(new THREE.BoxGeometry(0.06, 0.05, 0.3), P.warningRed, { bone: gun, at: [0.62, Y - 0.05, 0.85] });
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.04), P.armorDark, { bone: gun, at: [0.5, Y - 0.05, 0.68] });

  // Ammo belt: links curving from drum to receiver
  const links: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = 0.4 - t * 0.2;
    const y = Y - 0.02 + Math.sin(t * Math.PI) * 0.1;
    const z = 0.95 + t * 0.12;
    links.push([x, y, z]);
  }
  links.forEach((p, i) => {
    b.part(new THREE.BoxGeometry(0.06, 0.07, 0.035), i % 2 ? P.amber : P.steel, {
      bone: gun,
      at: p,
      rotation: [0, 0, 20 - i * 4],
    });
  });

  // Yellow band markings & side plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.16, 0.3), P.hullLight, { bone: gun, at: [s * 0.27, Y, 0.62] });
    b.part(new THREE.BoxGeometry(0.035, 0.04, 0.26), P.trimYellow, { bone: gun, at: [s * 0.275, Y + 0.05, 0.62] });
  }

  // Decal on receiver side: ammo/warning
  const tex = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#171a21"/><path d="M0 32 L16 0 H28 L12 32Z M24 32 L40 0 H52 L36 32Z" fill="#f0b90b"/><text x="46" y="22" font-size="14" font-family="monospace" font-weight="bold" fill="#2ff3ff">AG</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
    bone: gun,
    at: [-0.256, Y, 1.0],
    dir: [-1, 0, 0],
    axis: "z",
    texture: tex,
  });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
    bone: gun,
    at: [0.256, Y, 1.0],
    dir: [1, 0, 0],
    axis: "z",
    texture: tex,
  });
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildChassis({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (sx: number, sy: number, sz: number, color: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at: [x, y, z], ...extra });
  const cyl = (r: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { bone, at, ...extra });

  const DECK = panelled(P.hull, { size: 0.5, aspect: 0.8, rivets: 0.12, seam: P.armorDark });
  const SKIRT = panelled(
    paint((p: any, n: any) => {
      const f = ((p.z * 2.2 + Math.abs(p.y) * 0 ) % 1 + 1) % 1;
      const chev = Math.abs(f - 0.5) < 0.2 && p.y > 0.6 && p.y < 0.85;
      const base = mix(P.hull, P.armorDark, 0.5 * (1 - smoothstep(-0.5, 0.5, n.y)));
      return chev ? P.trimYellow : base;
    }),
    { size: 0.6, aspect: 0.5, rivets: 0.15, seam: P.armorDark },
  );
  const RAIL = metal("iron", { tarnish: 0.5 });

  // deck plate
  box(2.9, 0.14, 7, DECK, 0, 1.23, -0.5);
  // deck edge trim
  for (const s of [1, -1]) box(0.08, 0.1, 7, P.hullLight, s * 1.47, 1.3, -0.5);
  // ladder rails
  for (const s of [1, -1]) {
    box(0.2, 0.3, 7, RAIL, s * 0.85, 1.0, -0.5);
    box(0.06, 0.32, 7.02, P.armorDark, s * 0.85, 1.0, -0.5);
  }
  // cross members
  for (let i = 0; i < 9; i++) {
    const z = -3.7 + i * 0.85;
    box(1.8, 0.16, 0.14, P.armorDark, 0, 0.95, z);
    box(1.8, 0.04, 0.16, P.hullLight, 0, 1.04, z);
  }
  // side skirts (angled) with wheel arch gaps
  const axles = [2.4, -0.6, -2.8];
  const segs: [number, number][] = [
    [3.0, 1.45],
    [0.95, -0.15],
    [-1.15, -2.3],
    [-3.3, -3.95],
  ];
  const arch = [1.7, 3.1, -1.1, 0.5, -3.3, -2.3];
  void arch; void axles;
  for (const s of [1, -1])
    for (const [z1, z0] of segs) {
      const len = z1 - z0;
      const zc = (z1 + z0) / 2;
      box(0.12, 0.5, len - 0.06, SKIRT, s * 1.5, 0.75, zc, { rotation: [0, 0, s * 6] });
      box(0.05, 0.05, len - 0.06, P.neonCyan, s * 1.56, 0.5, zc);
    }
  const under = b.part(new THREE.BoxGeometry(0.05, 0.05, 6.6), P.neonCyan, { bone, at: [1.2, 0.46, -0.3] });
  glow(under, 1.6);
  glow(b.part(new THREE.BoxGeometry(0.05, 0.05, 6.6), P.neonCyan, { bone, at: [-1.2, 0.46, -0.3] }), 1.6);
  // glow strips on skirts: collect
  // fuel tanks and battery boxes
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 1.1, 8), metal("steel", { tarnish: 0.4 }), {
      bone, at: [s * 1.05, 0.72, 1.7], rotation: [90, 0, 0],
    });
    for (const dz of [-0.4, 0.4]) box(0.06, 0.62, 0.08, P.trimYellow, s * 1.05, 0.72, 1.7 + dz).mesh.rotation.x = 0;
    box(0.6, 0.3, 0.7, P.armorDark, s * 1.0, 0.65, -1.7);
    box(0.62, 0.05, 0.72, P.trimYellow, s * 1.0, 0.82, -1.7);
    for (const dx of [-0.18, 0.18]) cyl(0.04, 0.06, 6, P.steel, [s * 1.0 + dx, 0.87, -1.7]);
    box(0.5, 0.32, 0.5, P.hullLight, s * 1.05, 0.62, -0.1 + 0.0);
  }
  // exhaust stacks behind cab
  for (const s of [1, -1]) {
    cyl(0.11, 1.3, 8, metal("steel", { tarnish: 0.6 }), [s * 1.25, 1.95, 0.75]);
    cyl(0.14, 0.1, 8, P.armorDark, [s * 1.25, 2.6, 0.75]);
    cyl(0.14, 0.08, 8, P.amber, [s * 1.25, 1.55, 0.75]);
    cyl(0.1, 0.04, 8, P.armorDark, [s * 1.25, 2.66, 0.75]);
    box(0.08, 0.5, 0.08, P.steel, s * 1.25, 1.45, 0.75);
  }
  // hitch
  box(0.5, 0.22, 0.4, P.armorDark, 0, 0.9, -4.05);
  cyl(0.12, 0.3, 8, P.steel, [0, 1.0, -4.15]);
  box(0.3, 0.06, 0.3, P.trimYellow, 0, 0.78, -4.15);
  b.part(new THREE.TorusGeometry(0.14, 0.04, 5, 8), P.steel, { bone, at: [0, 0.82, -4.3], rotation: [90, 0, 0] });
  // rear bumper beam + tail lights
  box(2.9, 0.22, 0.14, P.armorDark, 0, 0.8, -3.98);
  for (let i = 0; i < 10; i++) box(0.12, 0.22, 0.15, i % 2 ? P.trimYellow : P.armorDark, -1.3 + i * 0.29, 0.8, -3.99);
  for (const s of [1, -1]) {
    glow(box(0.9, 0.09, 0.08, P.warningRed, s * 0.8, 1.12, -4.04), 2);
    box(1.0, 0.15, 0.05, P.armorDark, s * 0.8, 1.12, -4.02);
    glow(box(0.9, 0.09, 0.08, P.warningRed, s * 0.8, 1.12, -4.05), 2);
  }
  // hazard-striped rear plate texture
  const plate = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#171a21"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 10} 16 L${i * 10 + 8} 0 L${i * 10 + 14} 0 L${i * 10 + 6} 16Z" fill="#f0b90b"/>`).join("")}<rect x="1" y="1" width="62" height="14" fill="none" stroke="#2ff3ff" stroke-width="1"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(1.6, 0.4), "#ffffff", { bone, at: [0, 1.0, -4.08], dir: [0, 0, -1], axis: "z", texture: plate });
  // front frame stub
  box(2.0, 0.3, 0.5, P.armorDark, 0, 0.85, 2.85);
  // cable runs
  for (const s of [1, -1]) {
    b.sweep([[s * 0.5, 0.88, -3.6], [s * 0.45, 0.85, -1.5], [s * 0.6, 0.86, 0.5], [s * 0.4, 0.88, 2.7]], 0.025, {
      bone, color: s > 0 ? P.neonMagenta : P.neonCyan, sides: 5,
    });
  }
  // rivets / bolts on deck edges
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 28; i++) for (const s of [1, -1]) {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6);
    g.translate(s * 1.38, 1.32, -3.8 + i * 0.25 + R() * 0.02);
    bolts.push(g);
  }
  const merged = mergeG(bolts);
  if (merged) b.part(merged, P.steel, { bone, at: [0, 0, 0] });
  // deck vents and hatch lines
  for (let i = 0; i < 4; i++) box(0.5, 0.03, 0.08, P.armorDark, 0, 1.31, -3.4 + i * 0.12 + 0.0);
  box(0.6, 0.04, 0.6, P.hullLight, 0, 1.31, 1.2).mesh.rotation.y = 0.0;
  // cyan deck seam
  glow(box(2.7, 0.02, 0.04, P.neonCyan, 0, 1.31, -0.45), 1.5);
  glow(box(2.7, 0.02, 0.04, P.neonCyan, 0, 1.31, 0.55), 1.5);
  // wheel-arch inner plates hint (dark liners)
  for (const s of [1, -1]) for (const z of [2.4, -0.6, -2.8]) box(0.08, 0.3, 1.5, P.armorDark, s * 1.4, 1.1, z);
}

function mergeG(list: THREE.BufferGeometry[]) {
  let n = 0;
  for (const g of list) n += g.getAttribute("position").count;
  if (!list.length) return null;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const idx: number[] = [];
  let o = 0;
  for (const g of list) {
    const c = g.getAttribute("position").count;
    pos.set(g.getAttribute("position").array as Float32Array, o * 3);
    nor.set(g.getAttribute("normal").array as Float32Array, o * 3);
    uv.set(g.getAttribute("uv").array as Float32Array, o * 2);
    for (const i of g.index!.array) idx.push(i + o);
    o += c;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  m.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  m.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  m.setIndex(idx);
  return m;
}
```

<!-- call: cabFront -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, smoothstep } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabFront({ b, J, P, M }: Ctx) {
  const cab = J.cab;
  const body = J.body;
  const R = rng(9);

  // own flat colours (max 6)
  const DARKRED = "#7a1020";
  const CREAMLENS = "#ffd37a";
  const BLACK = "#0a0b0e";

  // ---------- paints ----------
  const hazard = paint((p) => {
    const v = Math.floor((p.x + p.y * 0.9) / 0.11);
    return v % 2 === 0 ? P.trimYellow : P.armorDark;
  });
  const hullPanel = panelled(P.hull, { size: 0.28, aspect: 0.6, rivets: 0.07 });
  const hullLightPanel = panelled(P.hullLight, { size: 0.22, aspect: 0.7, rivets: 0.06 });
  const darkPanel = panelled(P.armorDark, { size: 0.2, rivets: 0.08 });
  const steelPaint = metal("steel", { tarnish: 0.35, polish: 0.3 });

  // ---------- textures ----------
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#0a0b0e" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M32 10 L50 44 L32 36 L14 44Z" fill="#ff2fa8" stroke="#2ff3ff" stroke-width="2"/>
    <circle cx="32" cy="30" r="4" fill="#2ff3ff"/></svg>`,
    { size: 128 },
  );
  const plate = svg(
    `<svg viewBox="0 0 96 40"><rect x="1" y="1" width="94" height="38" rx="4" fill="#d9e4ea" stroke="#171a21" stroke-width="2"/>
    <rect x="4" y="4" width="88" height="6" fill="#1f8f9a"/>
    <text x="48" y="32" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="#171a21">AEG-9 </text></svg>`,
    { size: 192 },
  );
  const slat = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#2ff3ff"/><rect y="5" width="64" height="3" fill="#1aa6b3"/></svg>`,
    { size: 64 },
  );

  // ---------- bumper: wedge ----------
  // main wedge block (sloping front)
  const wedge = b.extrude(
    [
      [0, 0],
      [0.55, 0],
      [0.62, 0.35],
      [0.2, 0.62],
      [0, 0.62],
    ],
    { at: [-1.45, 0.55, 3.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: P.hull, bone: body },
  );
  wedge.mesh.visible = false;
  // use rotated frustum boxes instead for the full width
  b.part(new THREE.BoxGeometry(2.9, 0.5, 0.7), hullPanel, { bone: body, at: [0, 0.8, 3.45] });
  b.frustumBox([0, 0.62, 3.8], [0, 0.62, 3.35], [2.9, 0.34], [2.9, 0.5], { bone: body, color: darkPanel });
  // upper hood armour wedge, sloping
  b.frustumBox([0, 1.2, 3.1], [0, 1.15, 3.8], [2.5, 0.5], [2.7, 0.28], { bone: cab, color: hullPanel });
  b.part(new THREE.BoxGeometry(2.3, 0.08, 0.55), hullLightPanel, { bone: cab, at: [0, 1.5, 3.35] });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.05, 0.35), P.armorDark, { bone: cab, at: [s * 0.8, 1.56, 3.3] });
    b.part(new THREE.BoxGeometry(0.06, 0.42, 0.6), darkPanel, { bone: cab, at: [s * 1.2, 1.22, 3.4] });
  }

  // ---------- plough blade ----------
  b.extrude(
    [
      [-1.45, 0],
      [1.45, 0],
      [1.35, 0.42],
      [-1.35, 0.42],
    ],
    { at: [0, 0.42, 3.92], x: [1, 0, 0], y: [0, 1, 0], thickness: [0.1, 0.03], bevel: 0.015, color: hazard, bone: body },
  );
  b.part(new THREE.BoxGeometry(2.96, 0.05, 0.14), steelPaint, { bone: body, at: [0, 0.42, 3.93] });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.08, 0.5, 0.18), P.armorDark, { bone: body, at: [s * 1.46, 0.67, 3.9] });

  // ---------- neon underline ----------
  glow(b.part(new THREE.BoxGeometry(2.7, 0.04, 0.04), P.neonMagenta, { bone: body, at: [0, 0.55, 3.97] }), 1.6);
  glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 0.4), P.neonCyan, { bone: body, at: [1.43, 0.58, 3.7] }), 1.4);
  glow(b.part(new THREE.BoxGeometry(0.04, 0.04, 0.4), P.neonCyan, { bone: body, at: [-1.43, 0.58, 3.7] }), 1.4);

  // ---------- grille ----------
  b.part(new THREE.BoxGeometry(1.3, 0.55, 0.1), P.armorDark, { bone: body, at: [0, 1.0, 3.82] });
  for (let i = 0; i < 5; i++) {
    glow(
      b.part(new THREE.BoxGeometry(1.1, 0.045, 0.05), P.neonCyan, { bone: body, at: [0, 0.82 + i * 0.1, 3.87] }),
      1.3,
    );
  }
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.6, 0.12), P.hullLight, { bone: body, at: [s * 0.68, 1.0, 3.84] });
  b.part(new THREE.BoxGeometry(1.4, 0.06, 0.12), P.hullLight, { bone: body, at: [0, 1.3, 3.84] });
  b.part(new THREE.BoxGeometry(1.4, 0.06, 0.12), P.hullLight, { bone: body, at: [0, 0.71, 3.84] });
  // emblem on grille top
  b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    bone: body, at: [0, 1.52, 3.62], dir: [0, 0.35, 1], axis: "z", texture: emblem,
  });

  // ---------- headlights ----------
  for (const s of [1, -1]) {
    b.frustumBox([s * 1.0, 1.05, 3.72], [s * 1.0, 1.05, 3.92], [0.46, 0.3], [0.4, 0.24], { bone: body, color: P.armorDark });
    glow(b.part(new THREE.BoxGeometry(0.34, 0.18, 0.04), P.amber, { bone: body, at: [s * 1.0, 1.05, 3.94] }), 1.8);
    b.part(new THREE.BoxGeometry(0.4, 0.04, 0.08), P.hullLight, { bone: body, at: [s * 1.0, 1.2, 3.92] });
    // fog lights
    b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.1, 8), P.armorDark, { bone: body, at: [s * 0.95, 0.72, 3.98], dir: [0, 0, 1] });
    glow(b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 8), CREAMLENS, { bone: body, at: [s * 0.95, 0.72, 4.0], dir: [0, 0, 1] }), 1.5);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.07, 0.022, 5, 8, Math.PI * 1.5), P.warningRed, { bone: body, at: [s * 0.5, 0.52, 3.97], rotation: [0, 0, 0] });
    b.part(new THREE.BoxGeometry(0.06, 0.08, 0.12), P.steel, { bone: body, at: [s * 0.5, 0.58, 3.9] });
  }

  // ---------- bull bar tubes ----------
  for (const s of [1, -1]) {
    b.rod([s * 0.62, 0.5, 3.96], [s * 0.62, 1.5, 3.92], 0.035, { bone: body, color: P.steel });
    b.rod([s * 0.62, 1.5, 3.92], [s * 0.62, 1.5, 3.6], 0.035, { bone: body, color: P.steel });
  }
  b.rod([-0.62, 1.42, 3.93], [0.62, 1.42, 3.93], 0.032, { bone: body, color: P.steel });
  b.rod([-0.62, 0.8, 3.98], [0.62, 0.8, 3.98], 0.03, { bone: body, color: P.steel });

  // ---------- winch ----------
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), P.armorDark, { bone: body, at: [0, 0.62, 3.88], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 8), P.trimYellow, { bone: body, at: [0.26, 0.62, 3.88], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.04, 8), P.trimYellow, { bone: body, at: [-0.26, 0.62, 3.88], dir: [1, 0, 0] });
  b.sweep([[0.15, 0.66, 3.97], [0.1, 0.66, 4.0], [0.05, 0.62, 4.0], [0.0, 0.62, 3.97]] as any, 0.012, { bone: body, color: BLACK, caps: "round" });

  // ---------- license plate ----------
  b.part(new THREE.PlaneGeometry(0.4, 0.17), "#ffffff", {
    bone: body, at: [0, 0.74, 4.005], dir: [0, 0, 1], axis: "z", texture: plate,
  });
  b.part(new THREE.BoxGeometry(0.44, 0.21, 0.02), P.armorDark, { bone: body, at: [0, 0.74, 3.99] });

  // ---------- radar dome + antennae (on cab roof front) ----------
  b.lathe(
    [[0, 0], [0.16, 0], [0.16, 0.03], [0.12, 0.1], [0.06, 0.14], [0, 0.15]],
    { at: [0.8, 1.6, 3.15], bone: cab, segments: 8, color: P.podWhite },
  );
  b.part(new THREE.CylinderGeometry(0.19, 0.2, 0.04, 8), P.armorDark, { bone: cab, at: [0.8, 1.58, 3.15] });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: cab, at: [0.8, 1.76, 3.15] }), 1.8);
  for (const [s, h] of [[-1, 1.0], [1, 0.8]] as const) {
    const x = s * 1.3;
    b.part(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 6), P.armorDark, { bone: cab, at: [x, 1.55, 3.05] });
    b.sweep(
      [[x, 1.6, 3.05], [x + s * 0.03, 1.6 + h * 0.5, 3.1], [x + s * 0.12, 1.6 + h, 3.2]] as any,
      [0.014, 0.004],
      { bone: cab, color: P.steel, caps: "round" },
    );
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.warningRed, { bone: cab, at: [x + s * 0.12, 1.6 + h, 3.2] }), 1.5);
  }

  // ---------- plough hazard chevron strips on bumper top ----------
  b.part(new THREE.BoxGeometry(2.7, 0.06, 0.5), hazard, { bone: body, at: [0, 1.06, 3.5] });
  // rivets / bolts on bumper
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const x = -1.2 + i * 0.3;
    bolts.push(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6).rotateX(Math.PI / 2).translate(x, 0.55, 3.99));
  }
  for (const g of bolts) b.part(g, P.steel, { bone: body, at: [0, 0, 0] });

  // hood vents
  for (let i = 0; i < 3; i++)
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.3, 0.02, 0.05), BLACK, { bone: cab, at: [s * 0.6, 1.55, 3.12 + i * 0.1] });
  void R; void DARKRED; void mix; void smoothstep; void slat;
}
```

<!-- call: turretBase -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildTurretBase({ b, J, P, M }: any) {
  const body = J.body;
  const turret = J.turret;
  const R = rng(9);

  // ---------- paints ----------
  const HULLP = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const k = noise(p, 0.25, 3);
      const base = mix(P.hull, P.hullLight, 0.15 + 0.35 * smoothstep(0.2, 1, n.y) + 0.2 * k);
      return base;
    }),
    { size: 0.28, aspect: 0.7, rivets: 0.07, seam: P.armorDark },
  );
  const DARKP = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix(P.armorDark, P.hull, 0.25 * noise(p, 0.15, 5) + 0.1 * smoothstep(0.3, 1, n.y)),
  );
  const STEEL = metal("steel", { tarnish: 0.35, polish: 0.2 });
  const HAZ = paint((p: THREE.Vector3) =>
    ((Math.floor((p.x + p.z) / 0.09) % 2) + 2) % 2 ? P.trimYellow : P.armorDark,
  );

  // ---------- textures ----------
  const LENS = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#2a0a20"/><circle cx="32" cy="32" r="24" fill="#ff2fa8"/><circle cx="32" cy="32" r="14" fill="#ffd0ee"/><circle cx="32" cy="32" r="6" fill="#20081a"/><circle cx="26" cy="26" r="3" fill="#fff"/><path d="M32 2V10M32 54V62M2 32H10M54 32H62" stroke="#ff2fa8" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  const SEARCH = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff6d0"/><circle cx="32" cy="32" r="20" fill="#ffffff"/><circle cx="32" cy="32" r="10" fill="#ffe9a0"/><path d="M32 4V60M4 32H60" stroke="#c9b66a" stroke-width="2"/></svg>`,
    { size: 96 },
  );
  const GLYPH = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#171a21"/><path d="M6 26 L18 6 L30 26 M34 6 H58 M34 16 H54 M34 26 H58" stroke="#2ff3ff" stroke-width="4" fill="none"/></svg>`,
    { size: 128 },
  );
  const STRIPE = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#171a21"/><g fill="#f0b90b"><path d="M0 16 L8 0 H20 L12 16Z"/><path d="M24 16 L32 0 H44 L36 16Z"/><path d="M48 16 L56 0 H68 L60 16Z"/></g></svg>`,
    { size: 128 },
  );

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, flat: true, ...opt });
  const tbox = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: turret, at, flat: true, ...opt });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], bone: any, opt: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, flat: true, ...opt });

  // ---------- gantry (z -0.5..0.6, y 1.3..2.45) ----------
  box(2.2, 0.12, 1.1, DARKP, [0, 1.36, 0.05]);
  // side walls (angular, low)
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.55, 0],
        [0.55, 0],
        [0.55, 0.75],
        [0.2, 0.95],
        [-0.55, 0.75],
      ],
      { at: [s * 1.05, 1.4, 0.05], x: [0, 0, 1], thickness: 0.14, bevel: 0.02, color: HULLP, bone: body },
    );
    // hazard strip along wall top
    box(0.16, 0.05, 1.0, HAZ, [s * 1.05, 2.0, 0.0]);
    // cyan trim
    glow(box(0.03, 0.03, 1.0, P.neonCyan, [s * 1.13, 1.6, 0.05]), 1.2);
    // ammo crates
    for (let i = 0; i < 2; i++) {
      box(0.34, 0.3, 0.38, DARKP, [s * 0.8, 1.57, -0.3 + i * 0.5]);
      box(0.36, 0.05, 0.4, HAZ, [s * 0.8, 1.74, -0.3 + i * 0.5]);
      box(0.1, 0.04, 0.12, P.steel, [s * 0.8, 1.78, -0.3 + i * 0.5]);
    }
    // antenna array
    const ax = s * 0.95;
    cyl(0.025, 0.035, 0.9 + (s > 0 ? 0.25 : 0), 5, P.steel, [ax, 2.45 + (s > 0 ? 0.12 : 0), -0.4], body);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warningRed, { bone: body, at: [ax, 2.95 + (s > 0 ? 0.25 : 0.0), -0.4] }), 1.5);
    cyl(0.015, 0.02, 0.6, 5, P.steel, [s * 0.8, 2.15, -0.7], body);
    box(0.28, 0.02, 0.18, P.steel, [s * 0.8, 2.4, -0.7]);
    // armour wedge
    b.extrude(
      [
        [0, 0],
        [0.4, 0],
        [0.4, 0.5],
        [0.05, 0.12],
      ],
      { at: [s * 1.12, 1.4, -0.75], x: [0, 0, 1], thickness: 0.1, color: P.hullLight, bone: body },
    );
  }
  // rear panel of gantry with glyph
  box(2.1, 0.8, 0.12, HULLP, [0, 1.8, -0.5]);
  b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
    bone: body, at: [0, 1.8, -0.564], dir: [0, 0, -1], axis: "z", texture: GLYPH,
  });
  glow(box(1.6, 0.03, 0.03, P.neonMagenta, [0, 1.45, -0.58]), 1.4);
  // front cross-beam
  box(2.1, 0.2, 0.14, DARKP, [0, 1.5, 0.55]);
  box(2.1, 0.06, 0.15, HAZ, [0, 1.62, 0.55]);
  // rear cable runs
  for (let i = 0; i < 4; i++)
    b.rod([-0.7 + i * 0.47, 1.4, -0.5], [-0.6 + i * 0.4, 2.1, -0.52], 0.02, P.armorDark, { bone: body });

  // ---------- turret ring ----------
  const ringY = M.turretRing[1];
  cyl(0.95, 1.0, 0.14, 16, STEEL, [0, ringY - 0.04, 0.1], body);
  // ring teeth
  const teeth: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    teeth.push(
      new THREE.BoxGeometry(0.1, 0.1, 0.08).rotateY(a).translate(Math.sin(a) * 1.0, 0, Math.cos(a) * 1.0),
    );
  }
  b.part(mergeGeo(teeth), P.hub, { bone: turret, at: [0, ringY + 0.04, 0.1], flat: true });
  // base platform under ring
  box(1.9, 0.5, 1.5, HULLP, [0, 1.85, 0.1], { });
  // ---------- turret housing ----------
  const cy = ringY + 0.1;
  b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.95, 0.12],
      [0.8, 0.3],
      [0.6, 0.5],
      [0.3, 0.58],
      [0, 0.6],
    ],
    { at: [0, cy, 0.1], segments: 8, spin: 22.5, color: HULLP, bone: turret },
  );
  // front glacis wedge
  b.extrude(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.2],
      [0.2, 0.5],
      [0, 0.5],
    ],
    { at: [0, cy, 0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.8, bevel: 0.03, color: P.hullLight, bone: turret },
  );
  // gun mantlet
  tbox(0.8, 0.28, 0.12, DARKP, [0, 2.85, 0.52]);
  tbox(0.5, 0.06, 0.06, HAZ, [0, 3.02, 0.55]);
  // side armour plates
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.45, 0],
        [0.45, 0],
        [0.35, 0.55],
        [-0.3, 0.6],
      ],
      { at: [s * 0.9, cy + 0.02, 0.1], x: [0, 0, 1], y: [s * 0.25, 1, 0], thickness: 0.1, bevel: 0.015, color: HULLP, bone: turret },
    );
    glow(tbox(0.03, 0.03, 0.7, P.neonCyan, [s * 0.98, cy + 0.12, 0.1]), 1.2);
    // smoke launchers (cluster of 4 tubes)
    for (let i = 0; i < 4; i++) {
      const o = b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 6), P.armorDark, {
        bone: turret,
        at: [s * 0.92, cy + 0.32, -0.05 - i * 0.0 + 0.0 + (i - 1.5) * 0.12],
        dir: [s * 0.6, 0.6, 0.3],
        flat: true,
      });
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 6), P.warningRed, {
        bone: turret,
        at: o.local([0, 0.115, 0]),
        dir: [s * 0.6, 0.6, 0.3],
        flat: true,
      });
    }
    // grab rail
    b.rod([s * 0.5, cy + 0.58, -0.4], [s * 0.5, cy + 0.58, -0.05], 0.015, P.steel, { bone: turret });
  }
  // rear bustle with hazard band
  tbox(1.0, 0.4, 0.4, HULLP, [0, cy + 0.25, -0.62]);
  b.part(new THREE.PlaneGeometry(0.9, 0.12), "#ffffff", {
    bone: turret, at: [0, cy + 0.2, -0.825], dir: [0, 0, -1], axis: "z", texture: STRIPE,
  });
  // roof hatch
  cyl(0.28, 0.32, 0.08, 8, STEEL, [0, cy + 0.6, -0.15], turret);
  cyl(0.1, 0.12, 0.05, 8, P.hub, [0, cy + 0.66, -0.15], turret);
  // sensor eye (magenta lens) on the left front cheek
  const eyeBase = tbox(0.34, 0.34, 0.2, DARKP, [0.5, cy + 0.38, 0.5]);
  glow(
    b.part(new THREE.CircleGeometry(0.14, 12), "#ffffff", {
      bone: turret, at: [0.5, cy + 0.38, 0.605], dir: [0, 0, 1], axis: "z", texture: LENS,
    }),
    1.6,
  );
  // searchlight on right
  cyl(0.05, 0.07, 0.25, 6, STEEL, [-0.5, cy + 0.68, 0.3], turret);
  const sl = b.part(new THREE.CylinderGeometry(0.17, 0.12, 0.22, 8), P.armorDark, {
    bone: turret, at: [-0.5, cy + 0.88, 0.35], dir: [0, 0.3, 1], flat: true,
  });
  glow(
    b.part(new THREE.CircleGeometry(0.15, 10), "#ffffff", {
      bone: turret, at: sl.local([0, 0.112, 0]), dir: sl.axis, axis: "z", texture: SEARCH,
    }),
    1.5,
  );
  // roof antenna & fins
  cyl(0.012, 0.02, 0.7, 5, P.steel, [0.55, cy + 0.9, -0.5], turret);
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonCyan, { bone: turret, at: [0.55, cy + 1.25, -0.5] }), 1.6);

  function mergeGeo(list: THREE.BufferGeometry[]) {
    let pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
    let off = 0;
    for (const g0 of list) {
      const g = g0.index ? g0 : g0;
      const p = g.getAttribute("position"), n = g.getAttribute("normal"), u = g.getAttribute("uv");
      for (let i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i));
        nor.push(n.getX(i), n.getY(i), n.getZ(i));
        uv.push(u.getX(i), u.getY(i));
      }
      for (const i of g.index!.array as any) idx.push(i + off);
      off += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    m.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    m.setIndex(idx);
    return m;
  }
}
```

<!-- call: cabShell -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildCabShell({ b, J, P, M }: Ctx) {
  const cab = J.cab;
  const Z0 = 0.6, Z1 = 3.0, Y0 = 1.3;

  // ---------- textures ----------
  const HUD = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#0f2a3a"/>
    <path d="M0 40 L128 18" stroke="#2ff3ff" stroke-width="3" opacity=".5"/>
    <path d="M10 62 L40 6 M60 62 L80 6" stroke="#2ff3ff" stroke-width="2" opacity=".35"/>
    <rect x="86" y="10" width="30" height="14" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <path d="M90 18 h8 l3 -5 l4 8 l3 -3 h6" stroke="#2ff3ff" stroke-width="1.6" fill="none"/>
    <circle cx="24" cy="44" r="9" fill="none" stroke="#ff2fa8" stroke-width="2" opacity=".8"/>
    <path d="M0 0 L40 0 L0 30Z" fill="#ffffff" opacity=".12"/></svg>`,
    { size: 256 },
  );
  const SIDEWIN = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#0f2a3a"/>
    <path d="M6 40 L26 0 M30 40 L50 0" stroke="#2ff3ff" stroke-width="3" opacity=".25"/>
    <rect x="38" y="22" width="22" height="18" fill="#ffa31a" opacity=".35"/>
    <rect x="42" y="14" width="10" height="26" rx="4" fill="#07141c"/></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#171a21" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M32 10 L50 22 V42 L32 54 L14 42 V22Z" fill="none" stroke="#f0b90b" stroke-width="4"/>
    <path d="M32 18 V46 M20 28 L32 36 L44 28" stroke="#ff2fa8" stroke-width="4" fill="none"/></svg>`,
    { size: 128 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f0b90b"/>
    <path d="M0 16 L12 0 H24 L12 16Z M24 16 L36 0 H48 L36 16Z M48 16 L60 0 H72 L60 16Z" fill="#171a21"/></svg>`,
    { size: 128 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 32 24"><rect width="32" height="24" fill="#07141c"/><path d="M2 18 L10 10 L16 15 L24 5 L30 9" stroke="#2ff3ff" stroke-width="2" fill="none"/><circle cx="26" cy="19" r="2" fill="#ff2fa8"/></svg>`,
    { size: 64 },
  );

  // ---------- paints ----------
  const HULL = paint((p, n, s) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.7 + noise(p, 0.25, 3) * 0.25);
    return mix(base, "#0d0f14", smoothstep(0.1, -0.8, n.y) * 0.5);
  });
  const PANEL = panelled(HULL, { size: 0.5, aspect: 0.8, rivets: 0.12, seam: P.armorDark });
  const ROOF = panelled(mix(P.hullLight, P.hull, 0.4) as any, { size: 0.35, rivets: 0.1, seam: P.armorDark });

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: cab, at, ...extra });
  const flatQuad = (w: number, h: number, tex: any, at: number[], dir: number[], extra: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: cab, at, dir, axis: "z", texture: tex, ...extra });

  // ---------- main wedge body (loft: low long hood, taller rear) ----------
  // Lower body block from the floor up to beltline
  b.loft(
    [
      { at: [0, 1.62, 2.95], w: 2.3, h: 0.7 },
      { at: [0, 1.7, 2.2], w: 2.5, h: 0.85 },
      { at: [0, 1.75, 1.2], w: 2.55, h: 0.9 },
      { at: [0, 1.75, 0.68], w: 2.55, h: 0.9 },
    ],
    { bone: cab, color: PANEL, section: "box" as any },
  );
  // Upper greenhouse: tapered frustum wedge
  b.frustumBox([0, 2.2, 0.7], [0, 2.2, 1.55], [2.4, 0.9], [2.2, 0.9], { bone: cab, color: PANEL });
  // Slanted roof (sloping down towards front)
  const roof = b.extrude(
    [[0, 0], [0.9, 0], [1.75, -0.5, "sharp"], [1.75, -0.62], [0, -0.62 + 0.0]].slice(0, 4).map((q) => [q[0], q[1]] as [number, number]),
    { at: [0, 2.68, 0.62], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: ROOF, bone: cab },
  );
  // Raked A-pillar mass: wedge extrude profile of cab side (side view z,y)
  const side = [
    [0, 0], [2.4, 0], [2.4, 0.4], [1.2, 0.95], [0.9, 1.4], [0, 1.4],
  ] as [number, number][];
  b.extrude(side.map((q) => [q[0] - 0.0, q[1]] as [number, number]).map(([x, y]) => [x, y] as [number, number]), {
    at: [0, 1.3, 0.6], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, color: HULL, bone: cab, bevel: 0.03,
  });

  // ---------- windscreen ----------
  const wsDir = new THREE.Vector3(0, 0.62, 0.78).normalize();
  flatQuad(2.0, 0.78, HUD, [0, 2.36, 2.0], [0, 0.62, 0.78].map((v) => v), { });
  glow(b.part(new THREE.PlaneGeometry(0.01, 0.01), P.neonCyan, { bone: cab, at: [0, 0, 0], scale: 0.001 }), 0.01);
  // windscreen frame
  for (const s of [1, -1]) {
    b.rod([s * 1.02, 2.0, 2.28], [s * 1.02, 2.62, 1.78], 0.04, P.armorDark, { bone: cab, sides: 4 } as any);
  }
  b.rod([-1.02, 2.0, 2.28], [1.02, 2.0, 2.28], 0.045, P.armorDark, { bone: cab, sides: 4 } as any);
  b.rod([-1.02, 2.62, 1.78], [1.02, 2.62, 1.78], 0.045, P.armorDark, { bone: cab, sides: 4 } as any);
  // dashboard glow behind glass
  glow(box(1.7, 0.06, 0.4, P.neonCyan, [0, 2.0, 1.9]), 0.8);
  box(1.8, 0.25, 0.5, P.armorDark, [0, 1.95, 2.05]);

  // ---------- seats (glimpsed) ----------
  for (const s of [1, -1]) {
    box(0.55, 0.12, 0.5, P.armorDark, [s * 0.5, 1.95, 1.3]);
    box(0.5, 0.7, 0.12, P.armorDark, [s * 0.5, 2.3, 0.95], { rotation: [-8, 0, 0] });
    box(0.3, 0.2, 0.1, P.warningRed, [s * 0.5, 2.55, 0.98]);
  }

  // ---------- side details (per side) ----------
  for (const s of [1, -1]) {
    const dirN = [s, 0, 0];
    // side window with texture (on the outer face)
    flatQuad(1.0, 0.55, SIDEWIN, [s * 1.215, 2.3, 1.3], dirN, { up: [0, 1, 0] } as any);
    // window frame bars
    box(0.05, 0.62, 1.08, P.armorDark, [s * 1.2, 2.3, 1.3]);
    box(0.06, 0.04, 1.1, P.armorDark, [s * 1.23, 2.6, 1.3]);
    box(0.06, 0.04, 1.1, P.armorDark, [s * 1.23, 2.0, 1.3]);
    // half-raised armoured shutter
    box(0.05, 0.26, 1.02, P.hullLight, [s * 1.26, 2.5, 1.3]);
    for (let i = 0; i < 4; i++) box(0.06, 0.02, 1.0, P.armorDark, [s * 1.285, 2.4 + i * 0.06, 1.3]);
    // door panel seams
    box(0.04, 0.9, 0.03, P.armorDark, [s * 1.285, 1.85, 0.75]);
    box(0.04, 0.9, 0.03, P.armorDark, [s * 1.285, 1.85, 1.85]);
    box(0.04, 0.03, 1.1, P.armorDark, [s * 1.285, 1.55, 1.3]);
    // handle
    box(0.07, 0.05, 0.25, P.steel, [s * 1.32, 1.9, 1.7]);
    box(0.09, 0.05, 0.05, P.armorDark, [s * 1.3, 1.9, 1.62]);
    // emblem decal
    flatQuad(0.42, 0.42, EMBLEM, [s * 1.29, 1.72, 1.15], dirN, { });
    // hazard stripe below door
    flatQuad(1.5, 0.12, HAZ, [s * 1.29, 1.42, 1.6], dirN, { });
    // step plates
    box(0.32, 0.06, 0.8, P.hullLight, [s * 1.43, 1.3, 1.35]);
    box(0.32, 0.03, 0.8, P.trimYellow, [s * 1.43, 1.335, 1.35]);
    for (let i = 0; i < 4; i++) box(0.3, 0.02, 0.04, P.armorDark, [s * 1.43, 1.36, 1.1 + i * 0.17]);
    box(0.04, 0.2, 0.8, P.armorDark, [s * 1.3, 1.4, 1.35]);
    // wheel-arch cheek armour on front fender
    box(0.12, 0.35, 1.0, P.hullLight, [s * 1.3, 1.5, 2.4], { rotation: [0, 0, s * -6] });
    // mirrors with screens
    b.rod([s * 1.25, 2.35, 2.1], [s * 1.52, 2.45, 2.15], 0.025, P.steel, { bone: cab } as any);
    b.rod([s * 1.25, 2.6, 2.1], [s * 1.52, 2.5, 2.15], 0.02, P.steel, { bone: cab } as any);
    box(0.1, 0.34, 0.26, P.armorDark, [s * 1.58, 2.48, 2.15]);
    flatQuad(0.22, 0.28, SCREEN, [s * 1.58 + s * 0.0, 2.48, 2.285], [0, 0, 1], { });
    glow(box(0.02, 0.3, 0.02, P.neonCyan, [s * 1.64, 2.48, 2.0]), 1);
    // cheek neon strip
    glow(box(0.03, 0.03, 1.8, P.neonCyan, [s * 1.285, 1.36, 1.7]), 1.3);
    // rear-corner vertical hazard post
    box(0.14, 1.2, 0.14, P.armorDark, [s * 1.24, 2.0, 0.66]);
    box(0.15, 0.1, 0.15, P.trimYellow, [s * 1.24, 1.55, 0.66]);
    box(0.15, 0.1, 0.15, P.trimYellow, [s * 1.24, 1.95, 0.66]);
    // rivets along beltline
    for (let i = 0; i < 6; i++) b.part(new THREE.SphereGeometry(0.025, 5, 3), P.steel, { bone: cab, at: [s * 1.29, 2.1, 0.8 + i * 0.4] });
  }

  // ---------- rear wall (faces turret bay) ----------
  box(2.3, 1.2, 0.08, P.armorDark, [0, 2.0, Z0 + 0.04]);
  for (let i = 0; i < 3; i++) box(2.0, 0.05, 0.04, P.hullLight, [0, 1.65 + i * 0.35, Z0 - 0.0]);
  glow(box(1.5, 0.05, 0.03, P.neonMagenta, [0, 1.5, Z0 - 0.02]), 1.2);
  // rear ladder
  for (const s of [1, -1]) box(0.04, 1.1, 0.04, P.steel, [s * 0.3, 2.0, Z0 - 0.04]);
  for (let i = 0; i < 5; i++) box(0.64, 0.03, 0.04, P.steel, [0, 1.5 + i * 0.22, Z0 - 0.04]);
  // rear window slit
  glow(box(0.9, 0.18, 0.02, P.glass, [0, 2.4, Z0 - 0.0]), 0.5);

  // ---------- roof ----------
  // roof light bar housing
  box(1.9, 0.14, 0.34, P.armorDark, [0, 2.78, 1.45]);
  box(1.96, 0.04, 0.4, P.trimYellow, [0, 2.7, 1.45]);
  for (let i = 0; i < 5; i++) {
    const c = i % 2 ? P.neonMagenta : P.neonCyan;
    glow(b.part(new THREE.BoxGeometry(0.3, 0.1, 0.36), c, { bone: cab, at: [-0.74 + i * 0.37, 2.8, 1.45] }), 1.6);
  }
  for (const s of [1, -1]) box(0.08, 0.1, 0.4, P.hullLight, [s * 0.97, 2.78, 1.45]);
  // sensor mast
  b.rod([-0.7, 2.7, 0.95], [-0.7, 3.0, 0.95], [0.04, 0.025], P.steel, { bone: cab, sides: 6 } as any);
  b.part(new THREE.OctahedronGeometry(0.1, 0), P.hullLight, { bone: cab, at: [-0.7, 3.02, 0.95], scale: [1, 0.6, 1] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: cab, at: [-0.7, 3.02, 1.05] }), 2);
  // dish
  b.part(new THREE.ConeGeometry(0.16, 0.08, 8, 1, true), P.steel, { bone: cab, at: [-0.7, 2.86, 0.95], dir: [0.5, 0.8, 0.4], flat: true });
  // roof vents & hatch
  for (let i = 0; i < 3; i++) box(0.5, 0.03, 0.05, P.armorDark, [0.5, 2.72, 0.85 + i * 0.1]);
  b.part(new THREE.CylinderGeometry(0.2, 0.22, 0.06, 8), P.hullLight, { bone: cab, at: [0.45, 2.72, 1.05] });
  // roof edge antenna
  b.rod([1.0, 2.7, 0.8], [1.15, 3.35, 0.7], [0.015, 0.006], P.steel, { bone: cab } as any);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warningRed, { bone: cab, at: [1.15, 3.37, 0.7] }), 2);

  // ---------- hood/nose connection to cabFront ----------
  box(2.3, 0.1, 0.35, P.hullLight, [0, 2.0, 2.8], { rotation: [-8, 0, 0] });
  for (let i = 0; i < 4; i++) box(0.5, 0.025, 0.3, P.armorDark, [-0.75 + i * 0.5, 2.06, 2.75], { rotation: [-8, 0, 0] });
  glow(box(2.0, 0.03, 0.03, P.neonCyan, [0, 1.95, 2.92]), 1.2);
  box(2.4, 0.55, 0.08, P.armorDark, [0, 1.62, 2.96]);

  // ---------- hazard band across cab base ----------
  flatQuad(2.0, 0.14, HAZ, [0, 1.42, Z0 + 0.1], [0, 0, -1]);
  // A-pillar armour wedges
  for (const s of [1, -1]) {
    b.slab([[s * 1.12, 2.0, 2.3], [s * 1.28, 2.0, 2.3], [s * 1.28, 2.65, 1.75], [s * 1.12, 2.65, 1.75]], { bone: cab, color: P.hullLight, thickness: 0.05 } as any);
  }
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, stripes, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P }: Ctx) {
  const CY = 2.2; // pod axis height
  const R = 0.9; // hex vertex radius (vertices at +-x, flats top and bottom)
  const FLAT = R * Math.cos(Math.PI / 6);
  const DARK = P.armorDark;
  const pod = J.pod;
  const rand = rng(11);

  // ---------- textures ----------
  const STATUS = svg(
    `<svg viewBox="0 0 74 44" xmlns="http://www.w3.org/2000/svg">
      <rect width="74" height="44" fill="#1a0614"/>
      <rect x="2" y="2" width="70" height="40" fill="none" stroke="#ff2fa8" stroke-width="2"/>
      <text x="37" y="15" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="10" fill="#ff2fa8">SEALED</text>
      <rect x="8" y="22" width="58" height="5" fill="#4a1038"/>
      <rect x="8" y="22" width="44" height="5" fill="#ff2fa8"/>
      <rect x="8" y="31" width="10" height="6" fill="#2ff3ff"/>
      <rect x="22" y="31" width="10" height="6" fill="#2ff3ff"/>
      <rect x="36" y="31" width="10" height="6" fill="#ff2fa8"/>
      <rect x="50" y="31" width="10" height="6" fill="#4a1038"/>
    </svg>`,
    { size: 256 },
  );
  const BIO = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="62" height="62" rx="6" fill="#f0b90b" stroke="#171a21" stroke-width="3"/>
      <g fill="none" stroke="#171a21" stroke-width="5">
        <circle cx="32" cy="20" r="9"/><circle cx="21" cy="38" r="9"/><circle cx="43" cy="38" r="9"/>
      </g>
      <circle cx="32" cy="31" r="5" fill="#f0b90b" stroke="#171a21" stroke-width="3"/>
      <rect x="8" y="53" width="48" height="6" fill="#171a21"/>
    </svg>`,
    { size: 192 },
  );
  const GAUGE = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#10202a"/>
      <path d="M10 46 A26 26 0 1 1 54 46" fill="none" stroke="#2ff3ff" stroke-width="4"/>
      <path d="M44 14 A26 26 0 0 1 54 46" fill="none" stroke="#d6283a" stroke-width="4"/>
      <path d="M32 32 L20 20" stroke="#ffa31a" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="32" r="4" fill="#d9e4ea"/>
    </svg>`,
    { size: 128 },
  );
  const PLATE = svg(
    `<svg viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="24" rx="3" fill="#d9e4ea"/>
      <text x="40" y="16" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#171a21">POD-07 SEAL</text>
    </svg>`,
    { size: 192 },
  );

  // ---------- paints ----------
  const SHELL = paint((p, n) => {
    let base: string = p.y < CY - 0.28 ? P.podTeal : P.podWhite;
    if (n.y > 0.5 && p.y > CY + 0.5) base = P.podWhite;
    const f = (((p.z + 4) / 0.56) % 1 + 1) % 1;
    if (f < 0.025 || f > 0.975) return "#3a4650";
    let c = mix(base, "#9fb3bd", 0.25 * noise(p, 0.3, 2));
    const scuff = noise(p, 0.12, 3);
    if (scuff > 0.66) c = mix(c, "#5d6b73", Math.min(1, (scuff - 0.66) * 4));
    if (p.y < CY - 0.6) c = mix(c, "#222a30", 0.4);
    return c;
  });
  const HAZ = stripes(P.trimYellow, DARK, { size: 0.12, axis: [1, 0, 1], width: 0.5, wobble: 0, seed: 4 });
  const strapPaint = paint((p) => (noise(p, 0.08, 6) > 0.62 ? "#2a2f38" : DARK));

  // ---------- helpers ----------
  const ang = (deg: number) => (deg * Math.PI) / 180;
  const nrm = (deg: number): [number, number, number] => [Math.cos(ang(deg)), Math.sin(ang(deg)), 0];
  const onFace = (deg: number, dist: number, z: number): [number, number, number] => [
    Math.cos(ang(deg)) * dist,
    CY + Math.sin(ang(deg)) * dist,
    z,
  ];
  const hex = (r1: number, r2: number, len: number, z: number, color: any) =>
    b.part(new THREE.CylinderGeometry(r1, r2, len, 6, 1, false, Math.PI / 6), color, {
      bone: pod,
      at: [0, CY, z],
      dir: [0, 0, 1],
      flat: true,
    });
  const box = (sx: number, sy: number, sz: number, color: any, at: [number, number, number], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone: pod, at, ...extra });

  // ---------- shell: hex prism + faceted caps ----------
  hex(R, R, 1.7, -2.3, SHELL); // z -3.15..-1.45
  hex(0.54, R, 0.8, -1.05, SHELL); // nose (top radius toward +z)
  hex(R, 0.54, 0.8, -3.55, SHELL); // tail
  // end plates
  hex(0.4, 0.4, 0.05, -0.64, DARK);
  hex(0.22, 0.22, 0.06, -0.63, P.neonCyan);
  glow(b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 6), P.neonCyan, { bone: pod, at: [0, CY, -0.62], dir: [0, 0, 1] }), 1.4);

  // hazard bands
  for (const z of [-1.35, -3.3]) {
    hex(R + 0.02, R + 0.02, 0.32, z, HAZ);
    hex(R + 0.035, R + 0.035, 0.03, z - 0.17, DARK);
    hex(R + 0.035, R + 0.035, 0.03, z + 0.17, DARK);
  }

  // retaining straps with buckles and bolts
  for (const z of [-2.0, -2.65]) {
    hex(R + 0.035, R + 0.035, 0.12, z, strapPaint);
    box(0.24, 0.05, 0.16, P.steel, [0, CY + FLAT + 0.07, z]);
    box(0.1, 0.035, 0.05, P.hub, [0, CY + FLAT + 0.11, z - 0.03]);
    for (const dx of [-0.08, 0.08])
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 6), P.hub, { bone: pod, at: [dx, CY + FLAT + 0.1, z + 0.05] });
    // side ratchets on both slanted faces
    for (const deg of [30, 150, -30, 210]) {
      box(0.14, 0.05, 0.12, P.steel, onFace(deg, FLAT + 0.075, z), { dir: nrm(deg), axis: "y" });
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.hub, {
        bone: pod,
        at: onFace(deg, FLAT + 0.1, z),
        dir: nrm(deg),
      });
    }
  }

  // glowing seams on the vertex edges plus a top spine
  for (const s of [1, -1]) {
    glow(b.rod([s * (R + 0.01), CY, -3.35], [s * (R + 0.01), CY, -1.35], 0.03, P.neonCyan, { bone: pod, sides: 6 } as any), 1.5);
  }
  glow(box(0.06, 0.016, 1.6, P.neonCyan, [0, CY + FLAT + 0.006, -2.33]), 1.4);

  // ---------- status panel (upper +x face) ----------
  const sn = nrm(30);
  box(0.76, 0.46, 0.02, DARK, onFace(30, FLAT + 0.01, -1.85), { dir: sn, axis: "y" });
  b.part(new THREE.BoxGeometry(0.76, 0.02, 0.46), DARK, { bone: pod, at: onFace(30, FLAT + 0.01, -1.85), dir: sn, axis: "y" });
  glow(
    b.part(new THREE.PlaneGeometry(0.68, 0.4), "#ffffff", {
      bone: pod,
      at: onFace(30, FLAT + 0.025, -1.85),
      dir: sn,
      axis: "z",
      texture: STATUS,
    }),
    1.2,
  );
  // biohazard label (upper -x face)
  const ln = nrm(150);
  b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", {
    bone: pod,
    at: onFace(150, FLAT + 0.012, -2.3),
    dir: ln,
    axis: "z",
    texture: BIO,
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.15), "#ffffff", {
    bone: pod,
    at: onFace(150, FLAT + 0.012, -3.0),
    dir: ln,
    axis: "z",
    texture: PLATE,
  });

  // pressure gauge on lower +x face
  const gn = nrm(-30);
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), P.steel, { bone: pod, at: onFace(-30, FLAT + 0.02, -1.15), dir: gn });
  glow(
    b.part(new THREE.CircleGeometry(0.083, 12), "#ffffff", {
      bone: pod,
      at: onFace(-30, FLAT + 0.05, -1.15),
      dir: gn,
      axis: "z",
      texture: GAUGE,
    }),
    0.9,
  );

  // vent pipes with elbows on the upper faces
  for (const [deg, z] of [[30, -3.0], [150, -1.65], [30, -2.5]] as [number, number][]) {
    const n = nrm(deg);
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.2, 6), P.steel, { bone: pod, at: onFace(deg, FLAT + 0.08, z), dir: n });
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 6), DARK, { bone: pod, at: onFace(deg, FLAT + 0.19, z), dir: n });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 6), P.trimYellow, { bone: pod, at: onFace(deg, FLAT + 0.02, z), dir: n });
  }

  // red warning beacon on the roof
  b.part(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 8), DARK, { bone: pod, at: [0, CY + FLAT + 0.02, -1.7] });
  glow(b.part(new THREE.SphereGeometry(0.075, 7, 5), P.warningRed, { bone: pod, at: [0, CY + FLAT + 0.05, -1.7] }), 2);

  // ---------- locking hatch with wheel (rear), on its own hinge joint ----------
  const hatch = b.joint("cargoPodHatch", {
    parent: pod,
    at: [0.45, CY, -3.96],
    dir: [0, 1, 0],
    role: "hinge",
    group: "pod",
  });
  const HZ = -3.975;
  b.part(new THREE.CylinderGeometry(0.43, 0.43, 0.05, 6), P.hullLight, { bone: hatch, at: [0, CY, HZ], dir: [0, 0, 1], flat: true });
  b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 6), P.hull, { bone: hatch, at: [0, CY, HZ - 0.03], dir: [0, 0, 1], flat: true });
  b.part(new THREE.TorusGeometry(0.17, 0.02, 5, 10), P.trimYellow, {
    bone: hatch,
    at: [0, CY, HZ - 0.04],
    dir: [0, 0, -1],
    axis: "z",
    flat: true,
  });
  for (const a of [0, 60, 120]) {
    const dx = Math.cos(ang(a)) * 0.17;
    const dy = Math.sin(ang(a)) * 0.17;
    b.rod([-dx, CY - dy, HZ - 0.04], [dx, CY + dy, HZ - 0.04], 0.014, P.trimYellow, { bone: hatch });
  }
  b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.hub, { bone: hatch, at: [0, CY, HZ - 0.05], dir: [0, 0, -1] });
  for (let i = 0; i < 6; i++) {
    const a = ang(i * 60);
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 6), P.hub, {
      bone: hatch,
      at: [Math.cos(a) * 0.38 * 0.95, CY + Math.sin(a) * 0.38 * 0.95, HZ - 0.03],
      dir: [0, 0, -1],
    });
  }
  glow(b.part(new THREE.BoxGeometry(0.12, 0.03, 0.02), P.warningRed, { bone: hatch, at: [-0.25, CY + 0.28, HZ - 0.035] }), 1.6);
  // hinge knuckles on body
  for (const dy of [-0.25, 0.25])
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 6), P.steel, { bone: pod, at: [0.45, CY + dy, HZ - 0.005] });

  // ---------- cradle rails, beams and tie-down anchors on the deck ----------
  for (const s of [1, -1]) {
    box(0.18, 0.1, 3.5, DARK, [s * 0.6, 1.35, -2.3]);
    box(0.06, 0.03, 3.5, P.trimYellow, [s * 0.6, 1.405, -2.3]);
  }
  for (const z of [-0.95, -2.3, -3.65]) {
    box(2.3, 0.1, 0.24, P.hullLight, [0, 1.36, z]);
    for (const s of [1, -1]) {
      // saddle wedge hugging the lower slanted face
      box(0.5, 0.1, 0.2, P.hull, [s * 0.75, 1.76, z], { rotation: [0, 0, s * 60] });
      // tie-down anchor with ring
      b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 6), P.steel, { bone: pod, at: [s * 1.15, 1.42, z] });
      b.part(new THREE.TorusGeometry(0.06, 0.015, 4, 8), P.hub, {
        bone: pod,
        at: [s * 1.15, 1.52, z],
        dir: [1, 0, 0],
        axis: "z",
      });
    }
  }
  // ratchet straps from saddles up the lower faces
  for (const s of [1, -1])
    for (const z of [-1.4, -3.2])
      box(0.08, 0.04, 0.5, DARK, [s * 0.9, 1.82, z], { rotation: [0, 0, 0] }).mesh.visible = true;

  // small bolts along band edges (varied)
  for (let i = 0; i < 8; i++) {
    const deg = 30 + i * 60 + (i % 2) * 0;
    const n = nrm(deg % 360);
    if (i % 2 === 0)
      b.part(new THREE.SphereGeometry(0.025, 5, 3), P.hub, {
        bone: pod,
        at: onFace(deg, FLAT + 0.03 + rand() * 0.002, -1.35),
        dir: n,
      });
  }
}
```

<!-- call: fit-cabFront -->

The antenna whips rose too high. I'm shortening them so their tips end below y = 2.

<<<<<<< SEARCH
  for (const [s, h] of [[-1, 1.0], [1, 0.8]] as const) {
=======
  for (const [s, h] of [[-1, 0.3], [1, 0.25]] as const) {
>>>>>>> REPLACE

<!-- call: fit-chassis -->

Most overshoots come from the exhaust stacks, the hitch and the front frame stub. I'm lowering the stacks, pulling the hitch and rear bumper inside z = -4, and trimming the front stub and skirts to z ≤ 3.

<<<<<<< SEARCH
    cyl(0.11, 1.3, 8, metal("steel", { tarnish: 0.6 }), [s * 1.25, 1.95, 0.75]);
    cyl(0.14, 0.1, 8, P.armorDark, [s * 1.25, 2.6, 0.75]);
    cyl(0.14, 0.08, 8, P.amber, [s * 1.25, 1.55, 0.75]);
    cyl(0.1, 0.04, 8, P.armorDark, [s * 1.25, 2.66, 0.75]);
    box(0.08, 0.5, 0.08, P.steel, s * 1.25, 1.45, 0.75);
=======
    cyl(0.11, 0.2, 8, metal("steel", { tarnish: 0.6 }), [s * 1.25, 1.2, 0.75]);
    cyl(0.14, 0.04, 8, P.armorDark, [s * 1.25, 1.28, 0.75]);
    cyl(0.14, 0.04, 8, P.amber, [s * 1.25, 1.2, 0.75]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(0.5, 0.22, 0.4, P.armorDark, 0, 0.9, -4.05);
  cyl(0.12, 0.3, 8, P.steel, [0, 1.0, -4.15]);
  box(0.3, 0.06, 0.3, P.trimYellow, 0, 0.78, -4.15);
  b.part(new THREE.TorusGeometry(0.14, 0.04, 5, 8), P.steel, { bone, at: [0, 0.82, -4.3], rotation: [90, 0, 0] });
=======
  box(0.5, 0.22, 0.3, P.armorDark, 0, 0.9, -3.8);
  cyl(0.1, 0.2, 8, P.steel, [0, 1.0, -3.85]);
  box(0.3, 0.06, 0.2, P.trimYellow, 0, 0.78, -3.85);
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone, at: [0, 0.82, -3.9], rotation: [90, 0, 0] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(2.9, 0.22, 0.14, P.armorDark, 0, 0.8, -3.98);
  for (let i = 0; i < 10; i++) box(0.12, 0.22, 0.15, i % 2 ? P.trimYellow : P.armorDark, -1.3 + i * 0.29, 0.8, -3.99);
=======
  box(2.9, 0.22, 0.14, P.armorDark, 0, 0.8, -3.92);
  for (let i = 0; i < 10; i++) box(0.12, 0.22, 0.15, i % 2 ? P.trimYellow : P.armorDark, -1.3 + i * 0.29, 0.8, -3.93);
>>>>>>> REPLACE
<<<<<<< SEARCH
    glow(box(0.9, 0.09, 0.08, P.warningRed, s * 0.8, 1.12, -4.04), 2);
    box(1.0, 0.15, 0.05, P.armorDark, s * 0.8, 1.12, -4.02);
    glow(box(0.9, 0.09, 0.08, P.warningRed, s * 0.8, 1.12, -4.05), 2);
=======
    glow(box(0.9, 0.09, 0.06, P.warningRed, s * 0.8, 1.12, -3.97), 2);
    box(1.0, 0.15, 0.05, P.armorDark, s * 0.8, 1.12, -3.94);
>>>>>>> REPLACE
<<<<<<< SEARCH
{ bone, at: [0, 1.0, -4.08], dir: [0, 0, -1], axis: "z", texture: plate });
  // front frame stub
  box(2.0, 0.3, 0.5, P.armorDark, 0, 0.85, 2.85);
=======
{ bone, at: [0, 1.0, -3.98], dir: [0, 0, -1], axis: "z", texture: plate });
  // front frame stub
  box(2.0, 0.3, 0.3, P.armorDark, 0, 0.85, 2.85);
>>>>>>> REPLACE
<<<<<<< SEARCH
    [3.0, 1.45],
=======
    [2.95, 1.45],
>>>>>>> REPLACE
<<<<<<< SEARCH
      box(0.05, 0.05, len - 0.06, P.neonCyan, s * 1.56, 0.5, zc);
=======
      box(0.05, 0.05, len - 0.06, P.neonCyan, s * 1.5, 0.5, zc);
>>>>>>> REPLACE

<!-- call: fit-wheels -->

The mud flaps and the front and rear fender cheeks were the pieces outside the box. I turned the flaps to face rearward (wide in x, thin in z) and moved them to z = -3.47. I also shortened the fender cheeks and pulled them in toward the wheel.

<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.72, 0.1, 0.5), P.hullLight, {
      bone: J.body, at: [fx, 1.28, z + 0.65], rotation: [-30, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.72, 0.1, 0.5), P.hullLight, {
      bone: J.body, at: [fx, 1.28, z - 0.65], rotation: [30, 0, 0],
    });
=======
    b.part(new THREE.BoxGeometry(0.72, 0.1, 0.3), P.hullLight, {
      bone: J.body, at: [fx, 1.28, z + 0.5], rotation: [-30, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.72, 0.1, 0.3), P.hullLight, {
      bone: J.body, at: [fx, 1.28, z - 0.5], rotation: [30, 0, 0],
    });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.05, 0.5, 0.6), P.armorDark, { bone: J.body, at: [s * 1.3, 0.62, -3.55] });
    b.part(new THREE.BoxGeometry(0.06, 0.12, 0.62), P.trimYellow, { bone: J.body, at: [s * 1.3, 0.4, -3.55] });
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.1), P.warningRed, { bone: J.body, at: [s * 1.3, 0.82, -3.55] });
=======
    b.part(new THREE.BoxGeometry(0.6, 0.5, 0.04), P.armorDark, { bone: J.body, at: [s * 1.3, 0.62, -3.47] });
    b.part(new THREE.BoxGeometry(0.62, 0.12, 0.05), P.trimYellow, { bone: J.body, at: [s * 1.3, 0.4, -3.47] });
    b.part(new THREE.BoxGeometry(0.1, 0.1, 0.05), P.warningRed, { bone: J.body, at: [s * 1.3, 0.82, -3.47] });
>>>>>>> REPLACE

<!-- call: fit-turretBase -->

Edits to bring the eight overshooting pieces inside the box:

<<<<<<< SEARCH
  cyl(0.95, 1.0, 0.14, 16, STEEL, [0, ringY - 0.04, 0.1], body);
=======
  cyl(0.76, 0.8, 0.14, 16, STEEL, [0, ringY - 0.04, 0.1], body);
>>>>>>> REPLACE
<<<<<<< SEARCH
      new THREE.BoxGeometry(0.1, 0.1, 0.08).rotateY(a).translate(Math.sin(a) * 1.0, 0, Math.cos(a) * 1.0),
=======
      new THREE.BoxGeometry(0.1, 0.1, 0.08).rotateY(a).translate(Math.sin(a) * 0.8, 0, Math.cos(a) * 0.8),
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(1.9, 0.5, 1.5, HULLP, [0, 1.85, 0.1], { });
=======
  box(1.9, 0.5, 1.5, HULLP, [0, 1.85, 0.1], { });
  // (platform kept within box)
>>>>>>> REPLACE
<<<<<<< SEARCH
    { at: [0, cy, 0.55], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.8, bevel: 0.03, color: P.hullLight, bone: turret },
=======
    { at: [0, cy, 0.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.8, bevel: 0.03, color: P.hullLight, bone: turret },
>>>>>>> REPLACE
<<<<<<< SEARCH
  cyl(0.05, 0.07, 0.25, 6, STEEL, [-0.5, cy + 0.68, 0.3], turret);
  const sl = b.part(new THREE.CylinderGeometry(0.17, 0.12, 0.22, 8), P.armorDark, {
    bone: turret, at: [-0.5, cy + 0.88, 0.35], dir: [0, 0.3, 1], flat: true,
=======
  cyl(0.05, 0.07, 0.2, 6, STEEL, [-0.5, 2.82, 0.3], turret);
  const sl = b.part(new THREE.CylinderGeometry(0.15, 0.11, 0.2, 8), P.armorDark, {
    bone: turret, at: [-0.5, 2.92, 0.35], dir: [0, 0.2, 1], flat: true,
>>>>>>> REPLACE
<<<<<<< SEARCH
  cyl(0.012, 0.02, 0.7, 5, P.steel, [0.55, cy + 0.9, -0.5], turret);
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonCyan, { bone: turret, at: [0.55, cy + 1.25, -0.5] }), 1.6);
=======
  cyl(0.012, 0.02, 0.4, 5, P.steel, [0.55, 2.88, -0.5], turret);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone: turret, at: [0.55, 3.07, -0.5] }), 1.6);
>>>>>>> REPLACE

<!-- call: fit-cabShell -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCabShell({ b, J, P, M }: Ctx) {
  const cab = J.cab;
  const Z0 = 0.6;

  const HUD = svg(
    `<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#0f2a3a"/>
    <path d="M0 40 L128 18" stroke="#2ff3ff" stroke-width="3" opacity=".5"/>
    <path d="M10 62 L40 6 M60 62 L80 6" stroke="#2ff3ff" stroke-width="2" opacity=".35"/>
    <rect x="86" y="10" width="30" height="14" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <circle cx="24" cy="44" r="9" fill="none" stroke="#ff2fa8" stroke-width="2" opacity=".8"/></svg>`,
    { size: 256 },
  );
  const SIDEWIN = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#0f2a3a"/>
    <path d="M6 40 L26 0 M30 40 L50 0" stroke="#2ff3ff" stroke-width="3" opacity=".25"/>
    <rect x="42" y="14" width="10" height="26" rx="4" fill="#07141c"/></svg>`,
    { size: 128 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#171a21" stroke="#2ff3ff" stroke-width="4"/>
    <path d="M32 10 L50 22 V42 L32 54 L14 42 V22Z" fill="none" stroke="#f0b90b" stroke-width="4"/>
    <path d="M32 18 V46 M20 28 L32 36 L44 28" stroke="#ff2fa8" stroke-width="4" fill="none"/></svg>`,
    { size: 128 },
  );
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#f0b90b"/>
    <path d="M0 16 L12 0 H24 L12 16Z M24 16 L36 0 H48 L36 16Z M48 16 L60 0 H72 L60 16Z" fill="#171a21"/></svg>`,
    { size: 128 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 32 24"><rect width="32" height="24" fill="#07141c"/><path d="M2 18 L10 10 L16 15 L24 5 L30 9" stroke="#2ff3ff" stroke-width="2" fill="none"/></svg>`,
    { size: 64 },
  );

  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.7 + noise(p, 0.25, 3) * 0.25);
    return mix(base, "#0d0f14", smoothstep(0.1, -0.8, n.y) * 0.5);
  });
  const PANEL = panelled(HULL, { size: 0.5, aspect: 0.8, rivets: 0.12, seam: P.armorDark });

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: cab, at, ...extra });
  const flatQuad = (w: number, h: number, tex: any, at: number[], dir: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone: cab, at, dir, axis: "z", texture: tex });

  // lower body and greenhouse
  box(2.5, 0.8, 2.4, PANEL, [0, 1.7, 1.8]);
  box(2.4, 0.7, 1.0, PANEL, [0, 2.45, 1.1]);
  box(2.3, 0.1, 1.3, HULL, [0, 2.75, 1.25]);

  // windscreen (raked)
  flatQuad(2.0, 0.8, HUD, [0, 2.35, 2.05], [0, 0.62, 0.78]);
  for (const s of [1, -1]) b.rod([s * 1.02, 2.1, 2.2], [s * 1.02, 2.65, 1.75], 0.04, P.armorDark, { bone: cab } as any);
  glow(box(1.7, 0.05, 0.3, P.neonCyan, [0, 2.12, 2.2]), 0.8);
  box(1.8, 0.2, 0.4, P.armorDark, [0, 2.05, 2.4]);

  // seats
  for (const s of [1, -1]) {
    box(0.55, 0.12, 0.5, P.armorDark, [s * 0.5, 2.0, 1.4]);
    box(0.5, 0.6, 0.12, P.armorDark, [s * 0.5, 2.3, 1.1]);
    box(0.3, 0.18, 0.1, P.warningRed, [s * 0.5, 2.5, 1.15]);
  }

  for (const s of [1, -1]) {
    const dirN = [s, 0, 0];
    flatQuad(1.0, 0.5, SIDEWIN, [s * 1.255, 2.4, 1.3], dirN);
    box(0.04, 0.58, 1.08, P.armorDark, [s * 1.24, 2.4, 1.3]);
    box(0.05, 0.04, 1.1, P.armorDark, [s * 1.25, 2.68, 1.3]);
    box(0.05, 0.04, 1.1, P.armorDark, [s * 1.25, 2.12, 1.3]);
    box(0.04, 0.2, 1.0, P.hullLight, [s * 1.27, 2.55, 1.3]);
    for (let i = 0; i < 3; i++) box(0.05, 0.02, 0.98, P.armorDark, [s * 1.275, 2.48 + i * 0.06, 1.3]);
    box(0.03, 0.8, 0.03, P.armorDark, [s * 1.255, 1.8, 0.8]);
    box(0.03, 0.8, 0.03, P.armorDark, [s * 1.255, 1.8, 1.85]);
    box(0.06, 0.05, 0.22, P.steel, [s * 1.27, 1.95, 1.7]);
    flatQuad(0.4, 0.4, EMBLEM, [s * 1.255, 1.75, 1.15], dirN);
    flatQuad(1.4, 0.1, HAZ, [s * 1.255, 1.42, 1.6], dirN);
    box(0.12, 0.05, 0.8, P.trimYellow, [s * 1.24, 1.33, 1.35]);
    glow(box(0.02, 0.03, 1.6, P.neonCyan, [s * 1.255, 1.5, 1.6]), 1.3);
    // mirror
    b.rod([s * 1.2, 2.45, 2.1], [s * 1.28, 2.5, 2.1], 0.02, P.steel, { bone: cab } as any);
    box(0.06, 0.28, 0.2, P.armorDark, [s * 1.27, 2.5, 2.1]);
    glow(flatQuad(0.17, 0.22, SCREEN, [s * 1.3, 2.5, 2.1], dirN), 1);
    box(0.1, 1.1, 0.1, P.armorDark, [s * 1.24, 2.0, 0.68]);
    box(0.12, 0.08, 0.12, P.trimYellow, [s * 1.24, 1.6, 0.68]);
    box(0.12, 0.08, 0.12, P.trimYellow, [s * 1.24, 2.0, 0.68]);
    for (let i = 0; i < 5; i++) b.part(new THREE.SphereGeometry(0.025, 5, 3), P.steel, { bone: cab, at: [s * 1.26, 2.25, 0.9 + i * 0.4] });
    b.slab([[s * 1.12, 2.0, 2.3], [s * 1.2, 2.0, 2.3], [s * 1.2, 2.65, 1.75], [s * 1.12, 2.65, 1.75]], { bone: cab, color: P.hullLight, thickness: 0.05 } as any);
  }

  // rear wall
  box(2.3, 1.2, 0.06, P.armorDark, [0, 2.0, Z0 + 0.03]);
  for (let i = 0; i < 3; i++) box(2.0, 0.05, 0.03, P.hullLight, [0, 1.65 + i * 0.35, Z0 + 0.07]);
  glow(box(1.5, 0.05, 0.03, P.neonMagenta, [0, 1.5, Z0 + 0.07]), 1.2);
  for (const s of [1, -1]) box(0.04, 1.0, 0.04, P.steel, [s * 0.3, 2.0, Z0 + 0.1]);
  for (let i = 0; i < 4; i++) box(0.64, 0.03, 0.04, P.steel, [0, 1.5 + i * 0.22, Z0 + 0.1]);

  // roof light bar and mast (kept under y 2.8)
  box(1.9, 0.05, 0.34, P.armorDark, [0, 2.8 - 0.025, 1.45]);
  for (let i = 0; i < 5; i++)
    glow(box(0.3, 0.04, 0.3, i % 2 ? P.neonMagenta : P.neonCyan, [-0.74 + i * 0.37, 2.78, 1.45]), 1.6);
  b.rod([-0.7, 2.8, 0.95], [-0.7, 2.8, 0.95], 0.001, P.steel, { bone: cab } as any);
  box(0.12, 0.05, 0.12, P.steel, [-0.7, 2.775, 0.95]);
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonMagenta, { bone: cab, at: [-0.7, 2.77, 1.05] }), 2);
  b.part(new THREE.CylinderGeometry(0.18, 0.2, 0.04, 8), P.hullLight, { bone: cab, at: [0.5, 2.77, 1.0] });
  glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warningRed, { bone: cab, at: [1.0, 2.77, 0.8] }), 2);

  // nose joint with cabFront
  box(2.3, 0.1, 0.3, P.hullLight, [0, 2.0, 2.82]);
  glow(box(2.0, 0.03, 0.03, P.neonCyan, [0, 1.95, 2.96]), 1.2);
  box(2.4, 0.5, 0.06, P.armorDark, [0, 1.6, 2.96]);
  flatQuad(2.0, 0.12, HAZ, [0, 1.42, Z0 + 0.08], [0, 0, -1]);
}
```
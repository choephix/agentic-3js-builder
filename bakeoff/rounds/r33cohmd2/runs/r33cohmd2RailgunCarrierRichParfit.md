<!-- call: plan -->

```json
{
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled heavy truck carrying a long railgun on a rotating mount, braced on four deployed hydraulic stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [4.6, 3.4, 10.4],
  "layout": "Long, low, heavy 6x6 carrier facing +Z. Front: armoured cab (x -1.2..1.2) with a sloped glacis, slit visor windshield, headlights and a bumper at z 4.2..5.0. Behind the cab, an armoured hull deck runs back to z -4.2 and carries a rotating turret ring at z -1.4 on the deckTop. The railgun sits on a cradle: twin rails with a capacitor housing at the breech and a long muzzle pointing +Z that extends beyond the cab roof, resting at about 8 degrees elevation, muzzle at z ~5.2 and y ~3.0, with the barrel lying above the cab. Six big chunky wheels (three per side, axles at z 3.4, 0.2, -3.0, wheel radius 0.62) sit in wheel arches under the hull sides. Four stabiliser legs deployed outward and down from the hull corners at z 2.2 and z -3.6, angled out to x +-2.25 with flat pads on the floor. Low-poly faceted hull in olive-drab military green with dark gunmetal undercarriage, hazard-yellow stripes on stabilisers and trim, white tactical markings and numerals, and glowing cyan capacitor coils, rail glow strips and status lights. Panelled plates, rivets and vents carry the detail; shapes stay blocky.",
  "palette": {
    "hull": "#4b5a3a",
    "hullDark": "#344029",
    "hullLight": "#6b7c52",
    "gunmetal": "#2b2f36",
    "steel": "#6d7684",
    "rubber": "#16181b",
    "hazard": "#e7b814",
    "white": "#e9ecef",
    "glass": "#1b2f3a",
    "neonCyan": "#2ff3ff",
    "warnRed": "#e0372b",
    "headlight": "#fff4c2",
    "rail": "#9aa4b2"
  },
  "mounts": {
    "deckTop": [0, 1.9, -1.4],
    "cabRoof": [0, 2.7, 3.5],
    "turretRing": [0, 1.9, -1.4],
    "gunPivot": [0, 2.75, -1.4],
    "axleF": [0, 0.62, 3.4],
    "axleM": [0, 0.62, 0.2],
    "axleR": [0, 0.62, -3.0],
    "stabFL": [1.5, 1.2, 2.2],
    "stabFR": [-1.5, 1.2, 2.2],
    "stabRL": [1.5, 1.2, -3.6],
    "stabRR": [-1.5, 1.2, -3.6],
    "cabRear": [0, 1.9, 2.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.3, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.9, -1.4], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunCradle", "parent": "turret", "at": [0, 2.75, -1.4], "dir": [0, 0, 1], "role": "hinge", "group": "gun" },
    { "name": "wheelFL", "parent": "body", "at": [1.85, 0.62, 3.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.85, 0.62, 3.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.85, 0.62, 0.2], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.85, 0.62, 0.2], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.85, 0.62, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.85, 0.62, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "stabFL", "parent": "body", "at": [1.5, 1.2, 2.2], "dir": [0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabFR", "parent": "body", "at": [-1.5, 1.2, 2.2], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabRL", "parent": "body", "at": [1.5, 1.2, -3.6], "dir": [0.6, -0.8, 0], "role": "leg", "group": "stabilisers" },
    { "name": "stabRR", "parent": "body", "at": [-1.5, 1.2, -3.6], "dir": [-0.6, -0.8, 0], "role": "leg", "group": "stabilisers" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured chassis and rear deck from z -5.0 to 2.2: a faceted lofted hull body with sloped sides, wheel arches cut visually with dark arch rings over the three axles per side, side skirts, rear bumper with tow hooks and tail lights, a flat load deck with raised armour rim around the turret ring (large ring base plate at turretRing), panelled-and-riveted paint with a countershaded olive green, white tactical markings and numerals decals, hazard stripes on the rear, vents, grab handles, equipment lockers with latches, and the stabiliser mounting sockets with hydraulic housings at the four stab mounts. Rides the body joint.",
      "box": [[-1.9, 0.9, -5.0], [1.9, 2.2, 2.2]],
      "attaches": "Cab attaches at cabRear (z 2.2); turret ring base sits on deckTop/turretRing; wheels attach on axle lines; stabiliser sockets at stabFL/FR/RL/RR.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cab",
      "builds": "The armoured cab shell from z 2.2 to 4.6: a boxy sloped lofted body with angled glacis and roof, roof hatch, side doors with handles and armour plates, slit windshield and side windows (glass colour with SVG glint decals), roof sensor mast with antenna dish and cyan status light, wing mirrors, step rails, smoke dischargers on the roof, panelled paint and white unit insignia decal on the doors. Rides body.",
      "box": [[-1.3, 1.3, 2.2], [1.3, 2.8, 4.6]],
      "attaches": "Rear face at cabRear meets hull; underside on chassis frame; front face meets frontEnd part at z 4.6; roof at cabRoof.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "frontEnd",
      "builds": "Front nose and bumper assembly from z 4.6 to 5.2: sloped armoured hood plate, heavy bumper with hazard stripes, glowing headlights (headlight colour, glow) with protective grille bars, a grille drawn by SVG texture with vents, winch with cable drum and hook, tow eyes, front armoured skid plate, radiator louvres, fog lights, plus a front bumper under-ram plate and the front axle housing and driveshaft pieces visible below, and front mudguards over the front wheels. Rides body.",
      "box": [[-1.5, 0.45, 4.2], [1.5, 1.9, 5.3]],
      "attaches": "Back face at z 4.2-4.6 overlaps cab front; front mudguards cap the front wheels at axleF.",
      "joints": ["body"],
      "floor": false,
      "budget": 120
    },
    {
      "id": "wheelsLeft",
      "builds": "Three left-side wheels (+X) at axleF, axleM, axleR with joints wheelFL, wheelML, wheelRL: each a chunky low-poly tyre (lathe or faceted cylinder, 12 sides, rubber with tread blocks ringed around) radius 0.62 width 0.55, steel rim with lug nuts and hub cap, inner brake disc, plus suspension: leaf-spring packs, axle beam, shock absorbers and A-arm links running into the hull. Mud paint at the tyre bottoms.",
      "box": [[1.1, 0.0, -3.7], [2.4, 1.3, 4.1]],
      "attaches": "Hub on joints wheelFL/ML/RL at x 1.85; suspension arms end at the hull side x 1.1.",
      "joints": ["wheelFL", "wheelML", "wheelRL", "body"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "wheelsRight",
      "builds": "Mirror of the left wheels on the right (-X): three tyres at axleF, axleM, axleR with joints wheelFR, wheelMR, wheelRR, same tread blocks, rims, lug nuts, brake discs, leaf springs, axle beams, shocks and A-arms. Also the central driveline under the hull between the axles: transfer case, driveshafts, differentials and a dark underbelly plate from z -4.0 to 4.0.",
      "box": [[-2.4, 0.0, -3.7], [1.1, 1.3, 4.1]],
      "attaches": "Hub on joints wheelFR/MR/RR at x -1.85; driveline units sit at the axle lines in the centre.",
      "joints": ["wheelFR", "wheelMR", "wheelRR", "body"],
      "floor": true,
      "budget": 120
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs at stabFL, stabFR, stabRL, stabRR, each splayed out and down to the floor: a hydraulic two-stage telescoping leg (outer gunmetal cylinder, inner steel piston ring-banded with hazard stripes), a diagonal brace strut and a hinge bracket at the hull, a big flat octagonal foot pad with ribs resting on y=0, pistons glowing small warnRed indicator lights, warning decals. Joints stabFL/FR/RL/RR with a root leg chain each.",
      "box": [[-2.7, 0.0, -4.1], [2.7, 1.5, 2.7]],
      "attaches": "Hinge brackets at mounts stabFL, stabFR, stabRL, stabRR on the hull sides; foot pads on the floor at x +-2.4.",
      "joints": ["stabFL", "stabFR", "stabRL", "stabRR"],
      "floor": true,
      "budget": 110
    },
    {
      "id": "turretMount",
      "builds": "Rotating turret base on joint turret from deckTop to gunPivot: a large faceted rotating drum on the ring at turretRing, two thick armoured side cheeks (trunnion towers) rising to gunPivot, a rear equipment bay housing with a cooling vent array and glowing cyan power conduits, ladder, a crew-hatch box, side ammo/cap racks, trunnion bearings with caps, elevation actuators (hydraulic cylinders) reaching up to the cradle, and panelled paint with white numerals and hazard stripe edging.",
      "box": [[-1.6, 1.9, -3.2], [1.6, 3.3, 0.6]],
      "attaches": "Drum base on hull deck at turretRing/deckTop; trunnions on both sides carry the gun cradle at gunPivot.",
      "joints": ["turret"],
      "floor": false,
      "budget": 110
    },
    {
      "id": "railgun",
      "builds": "The railgun on joint gunCradle, pivot at gunPivot, pointing +Z with about 8 degrees elevation: a cradle sleeve between the trunnions, two parallel rectangular rails (rail colour) with glowing cyan inner glow strips running full length from the breech at z -3.0 to the muzzle at z 5.2, insulator spacer blocks and clamp rings along the barrel, a bulky breech capacitor bank at the rear with stacked glowing cyan coils (torus rings or lathe discs) and warnRed charge lights, a muzzle brake block with flared fins and cyan muzzle glow, recoil buffers, a small targeting sensor pod on the side, cable bundles from the breech down to the turret, and a hazard-stripe band near the muzzle.",
      "box": [[-0.9, 2.1, -3.2], [0.9, 3.4, 5.2]],
      "attaches": "Rides trunnions at gunPivot; the cradle sits between the turretMount cheeks; the barrel passes above cabRoof.",
      "joints": ["gunCradle"],
      "floor": false,
      "budget": 120
    }
  ]
}
```

<!-- call: wheelsLeft -->

```ts
import * as THREE from "three";
import { paint, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheelsLeft({ b, J, P, M }: any) {
  const R = 0.62;
  const W = 0.55;
  const X = 1.85;
  const rand = rng(11);

  const TYRE = paint((p, n) => {
    const mud = smoothstep(0.55, 0.0, p.y) * (0.5 + 0.5 * noise(p, 0.15, 3));
    return mix(P.rubber, "#4a3a28", mud * 0.85);
  });
  const STEEL = paint((p) => mix(P.steel, "#8a93a1", noise(p, 0.1, 2) * 0.6));
  const DARK = P.gunmetal;

  const axles: [string, number][] = [
    ["wheelFL", M.axleF[2]],
    ["wheelML", M.axleM[2]],
    ["wheelRL", M.axleR[2]],
  ];

  const rot = (g: THREE.BufferGeometry) => g.rotateZ(Math.PI / 2);

  axles.forEach(([jn, z]) => {
    const joint = J[jn];
    const hub = [X, R, z];

    // tyre: 12-sided cylinder, axle along X
    b.part(rot(new THREE.CylinderGeometry(R, R, W, 12)), TYRE, { bone: joint, at: hub, flat: true });
    // sidewall bulges
    for (const sx of [1, -1]) {
      b.part(rot(new THREE.CylinderGeometry(R * 0.88, R * 0.95, 0.06, 12)), P.rubber, {
        bone: joint, at: [X + sx * (W / 2 + 0.01), R, z], flat: true,
      });
    }
    // tread blocks ringed around
    const treadGeos: THREE.BufferGeometry[] = [];
    const N = 12;
    for (let i = 0; i < N; i++) {
      const a = ((i + 0.5) / N) * Math.PI * 2;
      const g = new THREE.BoxGeometry(W * 0.92, 0.09, 0.2);
      g.rotateX(-a);
      g.translate(0, Math.cos(a) * (R + 0.03), Math.sin(a) * (R + 0.03));
      g.translate(X, R, z);
      treadGeos.push(g);
    }
    for (const g of treadGeos) b.part(g, P.rubber, { bone: joint, at: [0, 0, 0], flat: true });

    // rim and hub (outer face)
    const ox = X + W / 2 + 0.03;
    b.part(rot(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 12)), STEEL, { bone: joint, at: [ox, R, z], flat: true });
    b.part(rot(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12)), DARK, { bone: joint, at: [ox + 0.04, R, z], flat: true });
    b.part(rot(new THREE.CylinderGeometry(0.14, 0.17, 0.1, 8)), P.steel, { bone: joint, at: [ox + 0.08, R, z], flat: true });
    // lug nuts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(rot(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6)), P.white, {
        bone: joint, at: [ox + 0.07, R + Math.cos(a) * 0.23, z + Math.sin(a) * 0.23], flat: true,
      });
    }
    // brake disc and caliper (inner side)
    b.part(rot(new THREE.CylinderGeometry(0.36, 0.36, 0.03, 12)), P.steel, { bone: joint, at: [X - W / 2 - 0.04, R, z], flat: true });
    b.part(new THREE.BoxGeometry(0.12, 0.2, 0.14), P.warnRed, { bone: joint, at: [X - W / 2 - 0.07, R + 0.3, z], flat: true });

    // axle beam from hull to hub
    b.part(rot(new THREE.CylinderGeometry(0.1, 0.1, X - 1.1 - W / 2 + 0.1, 8)), DARK, {
      bone: J.body, at: [(1.1 + X - W / 2) / 2, R, z], flat: true,
    });
    // differential housing near hull
    b.part(new THREE.SphereGeometry(0.2, 8, 6), DARK, { bone: J.body, at: [1.2, R, z] });

    // leaf spring pack
    for (let k = 0; k < 4; k++) {
      const len = 1.1 - k * 0.2;
      b.part(new THREE.BoxGeometry(0.1, 0.035, len), k % 2 ? P.gunmetal : "#3a3f48", {
        bone: J.body, at: [1.5, R + 0.3 + k * 0.04, z], flat: true,
      });
    }
    b.part(new THREE.BoxGeometry(0.16, 0.08, 0.2), P.steel, { bone: J.body, at: [1.5, R + 0.1, z], flat: true });
    // U-bolts
    for (const dz of [-0.12, 0.12])
      b.part(new THREE.BoxGeometry(0.2, 0.2, 0.03), P.steel, { bone: J.body, at: [1.5, R + 0.2, z + dz], flat: true });

    // shock absorber
    b.rod([1.65, 0.45, z + 0.28], [1.3, 1.15, z + 0.2], 0.04, P.hazard, { bone: J.body });
    b.rod([1.62, 0.55, z + 0.27], [1.35, 0.95, z + 0.22], 0.06, DARK, { bone: J.body });
    b.part(new THREE.BoxGeometry(0.14, 0.1, 0.1), P.steel, { bone: J.body, at: [1.65, 0.42, z + 0.28], flat: true });

    // A-arm links
    for (const s of [-1, 1]) {
      b.rod([1.1, 0.95, z + s * 0.5], [X - 0.3, 0.55, z], 0.045, DARK, { bone: J.body });
      b.part(new THREE.SphereGeometry(0.06, 6, 4), P.steel, { bone: J.body, at: [1.1, 0.95, z + s * 0.5] });
    }

    // arch ring accent
    b.part(new THREE.TorusGeometry(R + 0.12, 0.04, 4, 12, Math.PI), P.hullDark, {
      bone: J.body, at: [1.95, R, z], rotation: [0, 90, 0], flat: true,
    });
  });

  // mounting rail along hull side tying suspension together
  b.part(new THREE.BoxGeometry(0.12, 0.12, 7.2), DARK, { bone: J.body, at: [1.15, 1.0, 0.2], flat: true });

  // hazard dots on rail
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.BoxGeometry(0.03, 0.14, 0.3), P.hazard, {
      bone: J.body, at: [1.22, 1.0, -3.2 + i * 0.95 + rand() * 0.02], flat: true,
    });
  }
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: J.body, at: [1.24, 1.0, 3.7] }), 1.3);
}
```

<!-- call: frontEnd -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildFrontEnd({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const G = "frontEnd";
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], name?: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, group: G, name, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot, group: G, flat: true });

  // Own flat colours (<=6)
  const CABLE = "#3b3f46";
  const BRASS = "#a98b3a";

  // Paints
  const armor = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, n.y > 0.4 ? 0.6 : 0);
    const wear = smoothstep(0.55, 0.8, noise(p, 0.18, 4));
    return mix(base, P.hullDark, wear * 0.5);
  });
  const metalDark = paint((p, n) => mix(P.gunmetal, P.steel, 0.25 * noise(p, 0.1, 2) + (n.y > 0.5 ? 0.15 : 0)));
  const hazardPaint = paint((p) => {
    const v = Math.floor((p.x + p.y * 0.8) / 0.12);
    return v % 2 === 0 ? P.hazard : P.gunmetal;
  });

  // Grille texture
  let slats = "";
  for (let i = 0; i < 7; i++)
    slats += `<rect x="6" y="${8 + i * 12}" width="108" height="7" rx="1.5" fill="#0c0e10" stroke="#6d7684" stroke-width="1.2"/>`;
  const GRILLE = svg(
    `<svg viewBox="0 0 120 96"><rect width="120" height="96" fill="#1b1e22"/><rect x="2" y="2" width="116" height="92" fill="none" stroke="#6d7684" stroke-width="3"/>${slats}<rect x="52" y="2" width="16" height="92" fill="#2b2f36" stroke="#6d7684" stroke-width="1.5"/><circle cx="60" cy="48" r="9" fill="#e7b814" stroke="#16181b" stroke-width="2"/><path d="M60 41 L66 52 L54 52Z" fill="#16181b"/></svg>`,
    { size: 256 },
  );

  // Sloped hood plate
  box(2.5, 0.12, 0.7, armor, [0, 1.62, 4.62], [-14, 0, 0], "hood");
  box(2.5, 0.5, 0.18, armor, [0, 1.38, 4.3]);
  // Hood side cheeks
  for (const s of [1, -1]) box(0.14, 0.5, 0.8, armor, [s * 1.28, 1.4, 4.7]);

  // Radiator block + grille
  box(2.2, 0.8, 0.5, metalDark, [0, 1.15, 4.7]);
  b.part(new THREE.PlaneGeometry(1.9, 0.7), "#ffffff", {
    bone, at: [0, 1.15, 4.96], dir: [0, 0, 1], axis: "z", texture: GRILLE, group: G,
  });
  // Grille frame bars
  for (const y of [0.78, 1.52]) box(2.0, 0.07, 0.07, P.steel, [0, y, 4.98]);
  for (const s of [1, -1]) box(0.07, 0.8, 0.07, P.steel, [s * 1.0, 1.15, 4.98]);
  // Protective bars across
  for (let i = -3; i <= 3; i++) cyl(0.014, 0.014, 0.72, 5, P.gunmetal, [i * 0.28, 1.15, 5.02]);

  // Radiator louvres on hood
  for (let i = 0; i < 6; i++) box(0.9, 0.025, 0.06, P.gunmetal, [0, 1.66 + i * 0.0, 4.4 + i * 0.1 - 0.0].map((v, k) => (k === 1 ? 1.62 + 0.03 : v)), [-14, 0, 0]);

  // Headlights
  for (const s of [1, -1]) {
    box(0.5, 0.3, 0.12, P.gunmetal, [s * 1.1, 1.3, 4.98]);
    glow(b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 8), P.headlight, {
      bone, at: [s * 1.1, 1.3, 5.06], rotation: [90, 0, 0], group: G, flat: true }), 1.6);
    for (let k = -1; k <= 1; k++) box(0.34, 0.02, 0.02, P.gunmetal, [s * 1.1, 1.3 + k * 0.08, 5.1]);
    // Fog lights
    box(0.18, 0.14, 0.1, P.gunmetal, [s * 0.75, 0.78, 5.08]);
    glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 6), P.headlight, {
      bone, at: [s * 0.75, 0.78, 5.14], rotation: [90, 0, 0], group: G, flat: true }), 1.2);
    // Tow eyes
    b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone, at: [s * 0.95, 0.62, 5.2], group: G, flat: true });
    box(0.16, 0.12, 0.14, P.gunmetal, [s * 0.95, 0.62, 5.08]);
  }

  // Heavy bumper
  box(3.0, 0.38, 0.32, hazardPaint, [0, 0.9, 5.12], undefined, "bumper");
  box(3.04, 0.08, 0.36, P.gunmetal, [0, 1.1, 5.12]);
  box(3.04, 0.08, 0.36, P.gunmetal, [0, 0.7, 5.12]);
  for (const s of [1, -1]) box(0.3, 0.42, 0.36, P.hullDark, [s * 1.5, 0.9, 5.1]);
  // Rivets on bumper
  for (let i = -6; i <= 6; i++) cyl(0.025, 0.025, 0.03, 5, P.steel, [i * 0.22, 1.1, 5.3], [90, 0, 0]);

  // Under-ram plate and skid plate
  box(2.6, 0.08, 0.7, P.gunmetal, [0, 0.55, 4.95], [12, 0, 0], "skid");
  box(2.0, 0.06, 0.5, metalDark, [0, 0.5, 4.6], [-6, 0, 0]);
  for (const s of [-1, 0, 1]) box(0.05, 0.1, 0.55, P.steel, [s * 0.7, 0.58, 4.8]);

  // Winch
  box(1.0, 0.22, 0.2, P.gunmetal, [0, 0.74, 5.0]);
  cyl(0.11, 0.11, 0.8, 8, P.steel, [0, 0.74, 5.1], [0, 0, 90]);
  for (const s of [1, -1]) cyl(0.16, 0.16, 0.05, 8, P.gunmetal, [s * 0.42, 0.74, 5.1], [0, 0, 90]);
  b.part(new THREE.TorusGeometry(0.115, 0.012, 4, 10), CABLE, { bone, at: [0, 0.74, 5.1], rotation: [0, 90, 0], group: G });
  b.sweep([[0, 0.64, 5.2], [0, 0.55, 5.28], [0, 0.46, 5.3]], 0.012, { color: CABLE, bone });
  b.part(new THREE.TorusGeometry(0.05, 0.015, 4, 8, Math.PI * 1.5), BRASS, { bone, at: [0, 0.42, 5.3], group: G, flat: true });

  // Front axle housing and driveshaft
  cyl(0.1, 0.1, 2.9, 8, P.gunmetal, [0, 0.62, 3.4], [0, 0, 90]);
  b.part(new THREE.SphereGeometry(0.24, 8, 6), P.gunmetal, { bone, at: [0, 0.62, 3.4], group: G, flat: true });
  cyl(0.06, 0.06, 0.9, 6, P.steel, [0, 0.66, 3.95], [90, 0, 0]);
  cyl(0.09, 0.09, 0.08, 6, P.steel, [0, 0.66, 4.4], [90, 0, 0]);
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.4, 6, P.steel, [s * 0.5, 0.75, 3.4], [90, 0, 0]);

  // Mudguards over front wheels (wheel x 1.85, z 3.4)
  for (const s of [1, -1]) {
    box(0.78, 0.07, 1.5, armor, [s * 1.85, 1.42, 4.0 - 0.1], [-4, 0, 0], "mudguard");
    box(0.07, 0.3, 1.5, armor, [s * 2.22, 1.28, 3.9]);
    box(0.07, 0.3, 1.5, armor, [s * 1.48, 1.28, 3.9]);
    box(0.78, 0.2, 0.07, hazardPaint, [s * 1.85, 1.3, 4.66]);
    box(0.78, 0.2, 0.07, hazardPaint, [s * 1.85, 1.3, 3.12 - 0.0]);
    glow(box(0.06, 0.06, 0.06, P.warnRed, [s * 2.22, 1.48, 4.5]), 1.2);
  }
}
```

<!-- call: wheelsRight -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildWheelsRight({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.55;
  const X = -1.85;
  const body = J.body;
  const r = rng(11);

  // Paints
  const MUD = "#4a3b2a";
  const tyre = paint((p, n) => {
    const d = Math.max(0, 1 - p.y / 0.4);
    const base = mix(P.rubber, "#24272b", noise(p, 0.08, 3));
    return mix(base, MUD, smoothstep(0.1, 0.9, d) * 0.7 * (0.6 + noise(p, 0.1, 5) * 0.6));
  });
  const rimPaint = metal("steel", { tarnish: 0.3, size: 0.12 });
  const darkMetal = metal("iron", { tarnish: 0.5, size: 0.1 });
  const plate = paint((p, n) => {
    const base = mix(P.gunmetal, "#1c1f24", noise(p, 0.15, 7));
    const seam = Math.abs(((p.z / 0.8) % 1 + 1) % 1 - 0.5) > 0.47 ? 0.5 : 0;
    return mix(base, "#0e0f12", seam);
  });

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#8a929e" stroke="#20242a" stroke-width="3"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="#3a4048" stroke-width="2"/>
    <circle cx="32" cy="32" r="9" fill="#555d69" stroke="#20242a" stroke-width="2"/>
    <path d="M26 32h12M32 26v12" stroke="#20242a" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="3" fill="#e7b814"/></svg>`,
    { size: 128 },
  );

  const wheels: [string, number][] = [["wheelFR", 3.4], ["wheelMR", 0.2], ["wheelRR", -3.0]];

  const tread = new THREE.BoxGeometry(0.14, 0.09, 0.2);
  for (const [jn, z] of wheels) {
    const j = J[jn];
    const at: [number, number, number] = [X, R, z];
    // Tyre: octagonal-ish lathe about X axis
    b.lathe(
      [[0.34, -W / 2], [0.5, -W / 2], [R - 0.04, -W / 2 + 0.07], [R, -W / 2 + 0.16], [R, W / 2 - 0.16], [R - 0.04, W / 2 - 0.07], [0.5, W / 2], [0.34, W / 2], [0.34, -W / 2 + 0.01]],
      { at, axis: [-1, 0, 0], segments: 12, bone: j, color: tyre },
    );
    // Tread blocks ringed around
    const ang = new THREE.Vector3(-1, 0, 0);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const c = Math.cos(a), s = Math.sin(a);
      for (const side of [-1, 1]) {
        b.part(tread, P.rubber, {
          bone: j,
          at: [X + side * 0.14, R + c * (R + 0.03), z + s * (R + 0.03)],
          quat: new THREE.Quaternion().setFromAxisAngle(ang, 0).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -a)),
        });
      }
    }
    // Rim disc outer side
    b.lathe([[0, 0], [0.38, 0], [0.38, 0.05], [0.2, 0.1], [0.12, 0.14], [0, 0.14]], {
      at: [X - W / 2 + 0.02, R, z], axis: [-1, 0, 0], segments: 10, bone: j, color: rimPaint,
    });
    b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", {
      bone: j, at: [X - W / 2 - 0.125, R, z], dir: [-1, 0, 0], axis: "z", texture: hubTex,
    });
    // Lug nuts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.04, 6), P.steel, {
        bone: j, at: [X - W / 2 - 0.1, R + Math.cos(a) * 0.26, z + Math.sin(a) * 0.26], dir: [-1, 0, 0],
      });
    }
    // Hazard-ish valve marker
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.06), P.hazard, { bone: j, at: [X - W / 2 - 0.04, R + 0.42, z] });
    // Brake disc inner
    b.lathe([[0.1, 0], [0.34, 0], [0.34, 0.03], [0.1, 0.03]], {
      at: [X + W / 2 - 0.05, R, z], axis: [-1, 0, 0], segments: 14, bone: j, color: darkMetal,
    });
    // Brake caliper
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.2), P.hazard, { bone: j, at: [X + W / 2 - 0.1, R + 0.3, z + 0.06] });
    // Stub axle
    b.rod([X + W / 2, R, z], [-1.2, R, z], 0.09, { color: darkMetal, bone: j });
  }

  // Suspension and cross-axle (on body)
  for (const [, z] of wheels) {
    // Axle beam across to centre
    b.rod([-1.55, R, z], [0, R, z], 0.1, { color: darkMetal, bone: body });
    // Differential housing
    b.part(new THREE.SphereGeometry(0.28, 8, 6), darkMetal, { bone: body, at: [0, R, z], scale: [1, 0.85, 1] });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 6), P.steel, { bone: body, at: [0, R + 0.3, z] });
    // Leaf spring pack
    for (let k = 0; k < 4; k++) {
      const len = 1.1 - k * 0.18;
      b.part(new THREE.BoxGeometry(0.13, 0.025, len), k % 2 ? P.gunmetal : P.steel, {
        bone: body, at: [-1.45, R + 0.14 + k * 0.03, z],
      });
    }
    b.part(new THREE.BoxGeometry(0.2, 0.1, 0.22), P.gunmetal, { bone: body, at: [-1.45, R + 0.07, z] });
    // Shock absorber
    b.rod([-1.65, R + 0.1, z + 0.28], [-1.35, 1.15, z + 0.2], 0.04, { color: P.hazard, bone: body });
    b.rod([-1.65, R + 0.1, z + 0.28], [-1.5, 0.62, z + 0.26], 0.06, { color: P.steel, bone: body });
    // A-arm
    b.rod([-1.5, R - 0.15, z - 0.35], [-1.0, 0.95, z - 0.05], 0.05, { color: P.gunmetal, bone: body });
    b.rod([-1.5, R - 0.15, z + 0.35], [-1.0, 0.95, z + 0.05], 0.05, { color: P.gunmetal, bone: body });
    b.part(new THREE.BoxGeometry(0.16, 0.12, 0.1), P.steel, { bone: body, at: [-1.0, 0.97, z] });
  }

  // Driveline: transfer case at middle
  b.part(new THREE.BoxGeometry(0.8, 0.45, 0.9), darkMetal, { bone: body, at: [0, 0.78, 0.2] });
  b.part(new THREE.BoxGeometry(0.6, 0.06, 0.7), P.steel, { bone: body, at: [0, 1.03, 0.2] });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.BoxGeometry(0.82, 0.03, 0.05), P.hazard, { bone: body, at: [0, 0.65 + i * 0.1, 0.62] });
  // Driveshafts
  const shaft = (z0: number, z1: number) => {
    b.rod([0, 0.82, z0], [0, 0.82, z1], 0.07, { color: P.steel, bone: body, sides: 8 });
    for (const z of [z0, z1, (z0 + z1) / 2])
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.gunmetal, { bone: body, at: [0, 0.82, z], dir: [0, 0, 1] });
  };
  shaft(0.65, 3.4);
  shaft(-0.25, -3.0);
  shaft(-0.25, 0.0);

  // Underbelly plate z -4 .. 4
  b.loft(
    [
      { at: [0, 1.02, -4.0], w: 2.0, h: 0.08 },
      { at: [0, 0.98, -2.0], w: 2.2, h: 0.1 },
      { at: [0, 0.98, 2.0], w: 2.2, h: 0.1 },
      { at: [0, 1.02, 4.0], w: 1.9, h: 0.08 },
    ],
    { color: plate, bone: body, section: "box" },
  );
  // Skid ribs
  for (let i = 0; i < 9; i++) {
    const z = -3.6 + i * 0.9;
    b.part(new THREE.BoxGeometry(1.9, 0.05, 0.08), P.hullDark, { bone: body, at: [0, 0.92, z] });
  }
  // Bolts on plate
  const bolt = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6);
  for (let i = 0; i < 7; i++)
    for (const x of [-0.8, 0.8])
      b.part(bolt, P.steel, { bone: body, at: [x, 0.92, -3.8 + i * 1.25] });
  // Status light on transfer case
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnRed, { bone: body, at: [-0.41, 0.85, 0.5] }), 1.5);
  glow(b.part(new THREE.BoxGeometry(0.02, 0.05, 0.3), P.neonCyan, { bone: body, at: [-0.41, 0.72, 0.2] }), 1.4);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, countershade, noise, mix, smoothstep } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const body = J.body;
  const Z0 = 2.2, Z1 = 4.6;
  const base = countershade(P.hullLight, P.hullDark, { level: -0.2 });
  const HULL = panelled(
    paint((p, n) => {
      const c = mix(P.hull, P.hullLight, smoothstep(0.3, 0.9, n.y) * 0.8);
      const m = noise(p, 0.3, 4);
      return mix(c, P.hullDark, m * 0.35 + (n.y < -0.3 ? 0.3 : 0));
    }),
    { size: 0.55, aspect: 0.7, rivets: 0.12 },
  );
  void base;

  // main lofted cab shell
  b.loft(
    [
      { at: [0, 1.62, Z0 + 0.05], w: 2.55, h: 0.7 },
      { at: [0, 2.0, 3.2], w: 2.5, h: 1.45 },
      { at: [0, 2.1, 4.0], w: 2.4, h: 1.2 },
      { at: [0, 1.95, 4.55], w: 2.2, h: 0.7 },
    ],
    { bone: body, color: HULL, section: "box" },
  );
  // sloped roof slab and glacis
  b.frustumBox([0, 2.6, 2.4], [0, 2.6, 4.1], [2.3, 0.2], [2.1, 0.18], { bone: body, color: P.hullDark });
  b.part(new THREE.BoxGeometry(2.1, 0.12, 0.8), P.hullLight, {
    bone: body, at: [0, 2.42, 4.35], rotation: [28, 0, 0], flat: true,
  });
  // chassis frame under cab
  b.part(new THREE.BoxGeometry(2.3, 0.2, 2.3), P.gunmetal, { bone: body, at: [0, 1.32, 3.4] });

  // windshield slit
  b.part(new THREE.BoxGeometry(1.9, 0.3, 0.06), P.glass, {
    bone: body, at: [0, 2.22, 4.52], rotation: [-18, 0, 0], flat: true,
  });
  b.part(new THREE.BoxGeometry(2.05, 0.42, 0.04), P.hullDark, {
    bone: body, at: [0, 2.22, 4.5], rotation: [-18, 0, 0], flat: true,
  });
  b.part(new THREE.BoxGeometry(1.9, 0.3, 0.06), P.glass, {
    bone: body, at: [0, 2.22, 4.54], rotation: [-18, 0, 0], flat: true,
  });
  const glint = svg(
    `<svg viewBox="0 0 64 16"><path d="M6 15 L18 1 L24 1 L12 15Z M28 15 L36 4 L39 4 L31 15Z" fill="#bff6ff" opacity="0.7"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(1.8, 0.26), "#ffffff", {
    bone: body, at: [0, 2.22, 4.585], dir: [0, 0.3, 1], axis: "z", texture: glint,
  });
  for (let k = 0; k < 4; k++)
    b.part(new THREE.BoxGeometry(0.04, 0.3, 0.05), P.gunmetal, { bone: body, at: [-0.75 + k * 0.5, 2.22, 4.6] });

  // unit insignia
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="#e9ecef" stroke-width="5"/><path d="M32 10 L40 32 L32 54 L24 32Z" fill="#e9ecef"/><rect x="8" y="29" width="48" height="6" fill="#e9ecef"/></svg>`,
    { size: 128 },
  );
  const num = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="28" fill="#e9ecef">R-07</text></svg>`,
    { size: 128 },
  );
  const sideGlint = svg(
    `<svg viewBox="0 0 64 32"><path d="M8 30 L22 2 L28 2 L14 30Z" fill="#bff6ff" opacity="0.6"/></svg>`,
    { size: 96 },
  );

  for (const s of [1, -1]) {
    const x = s * 1.27;
    const dir: [number, number, number] = [s, 0, 0];
    // door
    b.part(new THREE.BoxGeometry(0.1, 1.0, 1.15), P.hull, { bone: body, at: [x + s * 0.02, 1.95, 3.5] });
    // armour plate lower
    b.part(new THREE.BoxGeometry(0.08, 0.35, 1.2), P.hullDark, { bone: body, at: [x + s * 0.07, 1.55, 3.5], flat: true });
    // handle
    b.rod([x + s * 0.1, 1.9, 3.1], [x + s * 0.1, 1.9, 3.3], 0.025, P.steel, { bone: body });
    // window
    b.part(new THREE.BoxGeometry(0.06, 0.38, 0.8), P.glass, { bone: body, at: [x + s * 0.09, 2.3, 3.6] });
    b.part(new THREE.PlaneGeometry(0.75, 0.37), "#ffffff", {
      bone: body, at: [x + s * 0.125, 2.3, 3.6], dir, axis: "z", texture: sideGlint,
    });
    // insignia & numerals
    b.part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", {
      bone: body, at: [x + s * 0.125, 1.82, 3.75], dir, axis: "z", texture: emblem, up: [0, 1, 0],
    });
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", {
      bone: body, at: [x + s * 0.125, 1.62, 3.15], dir, axis: "z", texture: num,
    });
    // step rails
    b.rod([s * 1.38, 1.3, 2.8], [s * 1.38, 1.3, 4.1], 0.04, P.steel, { bone: body });
    b.rod([s * 1.3, 1.3, 2.8], [s * 1.38, 1.3, 2.8], 0.03, P.steel, { bone: body });
    b.rod([s * 1.3, 1.3, 4.1], [s * 1.38, 1.3, 4.1], 0.03, P.steel, { bone: body });
    b.part(new THREE.BoxGeometry(0.22, 0.04, 0.5), P.gunmetal, { bone: body, at: [s * 1.4, 1.2, 3.5] });
    // mirrors
    b.rod([s * 1.3, 2.35, 4.15], [s * 1.62, 2.5, 4.2], 0.025, P.gunmetal, { bone: body });
    b.part(new THREE.BoxGeometry(0.06, 0.26, 0.2), P.gunmetal, { bone: body, at: [s * 1.65, 2.5, 4.22], flat: true });
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.15), P.glass, { bone: body, at: [s * 1.65, 2.5, 4.33] });
    // side hazard trim
    b.part(new THREE.BoxGeometry(0.04, 0.06, 2.2), P.hazard, { bone: body, at: [x + s * 0.04, 1.43, 3.4] });
    // smoke dischargers
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), P.gunmetal, {
        bone: body, at: [s * 1.0, 2.76, 3.0 + k * 0.14], rotation: [0, 0, -s * 40],
      });
    }
    // vents on lower plate
    for (let k = 0; k < 3; k++)
      b.part(new THREE.BoxGeometry(0.03, 0.05, 0.2), P.rubber, { bone: body, at: [x + s * 0.11, 1.55, 3.2 + k * 0.3] });
  }

  // roof hatch
  b.lathe(
    [[0, 0], [0.34, 0], [0.3, 0.1], [0, 0.12]],
    { at: [-0.5, 2.7, 3.2], bone: body, color: P.hullDark, segments: 8 },
  );
  b.part(new THREE.TorusGeometry(0.3, 0.025, 4, 8), P.hazard, {
    bone: body, at: [-0.5, 2.71, 3.2], rotation: [90, 0, 0],
  });
  b.rod([-0.5, 2.8, 3.2], [-0.5, 2.8, 3.45], 0.025, P.steel, { bone: body });

  // sensor mast
  const mx = 0.7, mz = 2.7;
  b.rod([mx, 2.7, mz], [mx, 3.15, mz], 0.04, P.gunmetal, { bone: body });
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.2), P.gunmetal, { bone: body, at: [mx, 3.15, mz], flat: true });
  b.lathe([[0, 0], [0.22, 0.1], [0.24, 0.12], [0, 0.04]], {
    at: [mx, 3.25, mz], bone: body, color: P.steel, segments: 8,
  });
  b.rod([mx, 3.2, mz], [mx, 3.38, mz + 0.1], 0.015, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, { bone: body, at: [mx, 3.43, mz + 0.1] }), 2);
  b.rod([mx - 0.3, 2.7, mz - 0.1], [mx - 0.3, 3.4, mz - 0.1], 0.012, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), P.warnRed, { bone: body, at: [mx - 0.3, 3.42, mz - 0.1] }), 2);

  // roof rim and rivets
  b.part(new THREE.BoxGeometry(2.4, 0.06, 0.1), P.hazard, { bone: body, at: [0, 2.72, 2.35] });
  for (let k = 0; k < 7; k++)
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 5), P.steel, { bone: body, at: [-1.05 + k * 0.35, 2.74, 2.35] });
  // rear armour back panel & lights
  b.part(new THREE.BoxGeometry(2.4, 0.3, 0.12), P.hullDark, { bone: body, at: [0, 2.5, 2.3], flat: true });
  glow(b.part(new THREE.BoxGeometry(0.4, 0.05, 0.03), P.neonCyan, { bone: body, at: [0, 2.5, 2.37] }), 1.5);
  // front roof brow
  b.part(new THREE.BoxGeometry(2.4, 0.1, 0.25), P.hullDark, { bone: body, at: [0, 2.46, 4.48], rotation: [-18, 0, 0], flat: true });
  // lower front fascia
  b.part(new THREE.BoxGeometry(2.2, 0.5, 0.15), P.gunmetal, { bone: body, at: [0, 1.7, 4.5], flat: true });
  for (let k = 0; k < 5; k++)
    b.part(new THREE.BoxGeometry(0.28, 0.05, 0.03), P.rubber, { bone: body, at: [-0.7 + k * 0.35, 1.7, 4.59] });
  void M; void metal;
}
```

<!-- call: turretMount -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildTurretMount({ b, J, P, M }: Ctx) {
  const bone = J.turret;
  const R = rng(11);
  const dx = M.deckTop[0], dz = M.deckTop[2];
  const baseY = 1.9;
  const gp = M.gunPivot;

  // Paints
  const plate = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 1, n.y) * 0.6);
    const dark = mix(base, P.hullDark, smoothstep(0.5, 0.8, noise(p, 0.3, 4)) * 0.5);
    const gx = Math.abs(((p.x + p.z) / 0.5) % 1 - 0.5);
    const gy = Math.abs((p.y / 0.4) % 1 - 0.5);
    return gx > 0.485 || gy > 0.485 ? mix(dark, "#1a2012", 0.7) : dark;
  });
  const hazardPaint = paint((p) => (Math.floor((p.x + p.z + p.y) / 0.12) % 2 === 0 ? P.hazard : P.gunmetal));
  const metalP = paint((p, n) => mix(P.gunmetal, P.steel, smoothstep(0.3, 1, n.y) * 0.5 + noise(p, 0.1, 2) * 0.2));

  const numTex = svg(
    `<svg viewBox="0 0 64 40"><text x="32" y="30" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="#e9ecef">07</text><rect x="2" y="34" width="60" height="3" fill="#e9ecef"/></svg>`,
    { size: 128 },
  );
  const ventTex = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#111"/>${[4, 14, 24, 34].map((y) => `<rect x="4" y="${y}" width="56" height="6" fill="#3a3f46"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const hatchTex = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#e9ecef" stroke-width="2"/><path d="M16 6 L22 24 L16 20 L10 24Z" fill="#e9ecef"/></svg>`,
    { size: 64 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, flat: true, ...extra });

  // Drum
  cyl(1.45, 1.55, 0.5, 12, plate, [dx, baseY + 0.25, dz]);
  cyl(1.5, 1.5, 0.08, 12, hazardPaint, [dx, baseY + 0.54, dz]);
  cyl(1.2, 1.4, 0.3, 12, P.hullDark, [dx, baseY + 0.7, dz]);
  cyl(1.58, 1.58, 0.06, 12, P.gunmetal, [dx, baseY + 0.05, dz]);
  // bolts on ring
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, {
      bone, at: [dx + Math.sin(a) * 1.5, baseY + 0.6, dz + Math.cos(a) * 1.5],
    });
  }

  // Cheeks
  for (const s of [1, -1]) {
    const x = s * 1.05;
    box(0.5, 1.0, 1.7, plate, [x, 2.95 - 0.2 + 0.0, dz + 0.0]);
    // sloped top front/back
    b.extrude([[-0.85, 0], [0.85, 0], [0.5, 0.45], [-0.5, 0.45]], {
      at: [x, 3.1, dz], x: [0, 0, 1], thickness: 0.5, color: plate, bone,
    });
    box(0.52, 0.06, 1.72, hazardPaint, [x, 2.45, dz]);
    // trunnion bearing
    cyl(0.3, 0.3, 0.18, 10, metalP, [s * 1.38, gp[1], gp[2]], { rotation: [0, 0, 90] });
    cyl(0.17, 0.17, 0.1, 8, P.steel, [s * 1.5, gp[1], gp[2]], { rotation: [0, 0, 90] });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [s * 1.56, gp[1], gp[2]] }), 1.5);
    // inner bearing sleeve
    cyl(0.22, 0.22, 0.14, 8, P.steel, [s * 0.75, gp[1], gp[2]], { rotation: [0, 0, 90] });
    // numerals on outer face
    b.part(new THREE.PlaneGeometry(0.7, 0.44), "#ffffff", {
      bone, at: [s * 1.311, 2.55, dz + 0.0], dir: [s, 0, 0], axis: "z", texture: numTex,
    });
    // ammo / cap racks
    box(0.3, 0.45, 0.7, P.gunmetal, [s * 1.55, 2.3, dz - 0.35]);
    for (let i = 0; i < 4; i++)
      cyl(0.07, 0.07, 0.4, 6, i % 2 ? P.hazard : P.steel, [s * 1.72, 2.3, dz - 0.6 + i * 0.17], { rotation: [0, 0, 90] });
    // actuators
    const a0 = [s * 0.8, 2.25, dz + 0.9];
    const a1 = [s * 0.55, 3.1, dz + 0.55];
    b.rod(a0, a1, 0.07, P.steel, { bone });
    b.rod(a0, [a0[0], a0[1] + 0.35 * 0.5, a0[2] + 0.1], 0.1, P.gunmetal, { bone });
    cyl(0.12, 0.12, 0.12, 8, P.gunmetal, a0, { rotation: [0, 0, 90] });
    cyl(0.08, 0.08, 0.1, 8, P.hazard, a1, { rotation: [0, 0, 90] });
    // grab handle
    b.rod([s * 1.32, 2.7, dz + 0.5], [s * 1.32, 3.0, dz + 0.5], 0.025, P.hazard, { bone });
  }

  // Rear equipment bay
  const bz = dz - 1.35;
  box(2.4, 1.0, 1.1, plate, [0, 2.9 + 0.0 - 0.2, bz]);
  box(2.5, 0.08, 1.2, P.hullDark, [0, 3.3 - 0.2 + 0.04, bz]);
  box(2.45, 0.1, 1.15, hazardPaint, [0, 2.45, bz]);
  b.part(new THREE.PlaneGeometry(1.5, 0.8), "#ffffff", {
    bone, at: [0, 2.9, bz - 0.556], dir: [0, 0, -1], axis: "z", texture: ventTex,
  });
  // vent frame
  box(1.6, 0.06, 0.04, P.gunmetal, [0, 3.32, bz - 0.57]);
  box(1.6, 0.06, 0.04, P.gunmetal, [0, 2.48, bz - 0.57]);
  // conduits
  for (const s of [1, -1]) {
    const c = b.rod([s * 0.9, 3.0, bz - 0.57], [s * 0.9, 3.0, bz + 0.5], 0.05, P.neonCyan, { bone });
    glow(c, 1.6);
    const c2 = b.rod([s * 1.2, 2.55, bz - 0.2], [s * 1.2, 3.0, bz - 0.2], 0.04, P.neonCyan, { bone });
    glow(c2, 1.6);
    glow(b.part(new THREE.BoxGeometry(0.12, 0.12, 0.05), P.neonCyan, { bone, at: [s * 1.0, 3.2, bz - 0.58] }), 2);
  }
  glow(b.rod([-1.2, 3.38 - 0.05, bz + 0.3], [1.2, 3.38 - 0.05, bz + 0.3], 0.03, P.neonCyan, { bone }), 1.6);
  // rear stripe
  box(2.45, 0.1, 0.05, hazardPaint, [0, 3.2, bz - 0.58]);

  // Ladder on rear of bay
  for (const s of [1, -1]) b.rod([s * 0.9 + s * 0.0, 1.95, bz - 0.64], [s * 0.9, 3.25, bz - 0.64], 0.025, P.steel, { bone });
  for (let i = 0; i < 5; i++) b.rod([-0.9, 2.1 + i * 0.25, bz - 0.64], [0.9, 2.1 + i * 0.25, bz - 0.64], 0.02, P.steel, { bone });
  // those ladder rungs overlap vent; shift rungs outward via brackets
  for (const s of [1, -1]) for (const y of [2.1, 3.1]) box(0.05, 0.05, 0.09, P.steel, [s * 0.9, y, bz - 0.6]);

  // Crew hatch box on bay roof
  box(0.8, 0.22, 0.8, P.hullDark, [-0.55, 3.4, bz + 0.0]);
  cyl(0.3, 0.3, 0.06, 10, metalP, [-0.55, 3.55, bz]);
  b.part(new THREE.CircleGeometry(0.26, 10), "#ffffff", {
    bone, at: [-0.55, 3.59, bz], dir: [0, 1, 0], axis: "z", texture: hatchTex,
  });
  b.rod([-0.8, 3.6, bz], [-0.3, 3.6, bz], 0.025, P.hazard, { bone });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, { bone, at: [0.6, 3.38, bz + 0.45] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone, at: [0.8, 3.38, bz + 0.45] }), 1.5);
  // antenna
  b.spike([0.7, 3.35, bz - 0.3], [0, 1, 0], 0.5, 0.015, { bone, color: P.steel });

  // Rivet strip around drum top
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.03, 5, 3), P.hullLight, {
      bone, at: [dx + Math.sin(a) * 1.22, baseY + 0.87, dz + Math.cos(a) * 1.22],
    });
  }
  // front deflector wedge between cheeks
  b.extrude([[-0.7, 0], [0.7, 0], [0.5, 0.35], [-0.5, 0.35]], {
    at: [0, 2.55, dz + 0.45], x: [1, 0, 0], y: [0, 0.4, 1], thickness: 0.12, color: P.hullDark, bone,
  });
  void R;
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { svg, paint, noise, mix, smoothstep, catmull } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRailgun({ b, J, P, M }: Ctx) {
  const bone = J.gunCradle;
  const EL = 3; // elevation in degrees (muzzle ends near y 3.0 as the layout asks)
  const a = (EL * Math.PI) / 180;
  const piv = M.gunPivot;
  // gun-local (x, y, z along the barrel) -> model space
  const g = (x: number, y: number, z: number): [number, number, number] => [
    piv[0] + x,
    piv[1] + y * Math.cos(a) + z * Math.sin(a),
    piv[2] - y * Math.sin(a) + z * Math.cos(a),
  ];
  const box = (w: number, h: number, d: number, p: [number, number, number], color: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: g(...p), rotation: [-EL, 0, 0], ...extra });
  const cyl = (r0: number, r1: number, len: number, p: [number, number, number], color: any, sides = 8, extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, sides), color, { bone, at: g(...p), rotation: [90 - EL, 0, 0], ...extra });
  const ring = (R: number, r: number, p: [number, number, number], color: any, extra: any = {}) =>
    b.part(new THREE.TorusGeometry(R, r, 6, 12), color, { bone, at: g(...p), rotation: [-EL, 0, 0], ...extra });
  const ball = (r: number, p: [number, number, number], color: any) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { bone, at: g(...p) });

  // textures and paints
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<polygon points="${i * 10 - 8},16 ${i * 10},0 ${i * 10 + 5},0 ${i * 10 - 3},16" fill="#1b1d20"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const LABEL = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#2b2f36"/><rect x="2" y="2" width="60" height="28" fill="none" stroke="#e9ecef" stroke-width="2"/><text x="32" y="22" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="16" fill="#e9ecef">RG-9</text></svg>`,
    { size: 128 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 32 32"><polygon points="16,3 30,29 2,29" fill="#e7b814" stroke="#1b1d20" stroke-width="2"/><rect x="14.5" y="11" width="3" height="10" fill="#1b1d20"/><rect x="14.5" y="23" width="3" height="3" fill="#1b1d20"/></svg>`,
    { size: 64 },
  );
  const RAIL = paint((p, n) => {
    const t = noise(p, 0.3, 4);
    return mix(mix(P.rail, "#7a8494", t), "#c4ccd8", smoothstep(0.5, 1, n.y) * 0.5);
  });
  const GUN = paint((p, n) => mix(mix(P.gunmetal, "#3b414b", noise(p, 0.25, 8)), "#4a515c", smoothstep(0.4, 1, n.y) * 0.5));

  // cradle sleeve between trunnions
  box(0.9, 0.5, 2.2, [0, 0, 0], GUN);
  box(0.7, 0.12, 2.0, [0, 0.3, 0], P.steel);
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), P.steel, { bone, at: [piv[0] + s * 0.7, piv[1], piv[2]], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.27, 0.27, 0.08, 8), P.gunmetal, { bone, at: [piv[0] + s * 0.98, piv[1], piv[2]], rotation: [0, 0, 90] });
    // recoil buffers
    cyl(0.1, 0.1, 1.5, [s * 0.5, -0.12, -1.4], P.gunmetal, 8);
    cyl(0.06, 0.06, 1.0, [s * 0.5, -0.12, -0.3], P.steel, 6);
    cyl(0.14, 0.14, 0.12, [s * 0.5, -0.12, -2.1], P.hazard, 8);
  }

  // rails
  const L0 = -1.6, L1 = 6.6, len = L1 - L0, mid = (L0 + L1) / 2;
  for (const s of [1, -1]) {
    box(0.22, 0.38, len, [s * 0.24, 0.12, mid], RAIL);
    box(0.06, 0.1, len - 0.1, [s * 0.24, 0.34, mid], P.steel);
    glow(box(0.03, 0.2, len - 0.2, [s * 0.115, 0.12, mid], P.neonCyan), 1.4);
    // outer small glow dashes
    for (let i = 0; i < 6; i++) glow(box(0.02, 0.1, 0.5, [s * 0.356, 0.12, 0.4 + i * 1.1], P.neonCyan), 1.1);
  }
  // spacers & clamp rings
  for (let i = 0; i < 8; i++) {
    const z = 0.2 + i * 0.85;
    box(0.26, 0.26, 0.3, [0, 0.12, z], P.gunmetal);
    box(0.84, 0.1, 0.22, [0, 0.36, z], GUN);
    box(0.84, 0.1, 0.22, [0, -0.12, z], GUN);
    box(0.1, 0.5, 0.22, [0.42, 0.12, z], GUN);
    box(0.1, 0.5, 0.22, [-0.42, 0.12, z], GUN);
  }
  // under rail spine
  box(0.5, 0.2, len - 0.8, [0, -0.1, mid - 0.2], GUN);

  // hazard band near muzzle
  box(0.9, 0.6, 0.3, [0, 0.12, 5.4], "#ffffff", { texture: HAZ });
  box(0.94, 0.12, 0.08, [0, 0.12, 5.6], P.gunmetal);
  box(0.94, 0.12, 0.08, [0, 0.12, 5.2], P.gunmetal);

  // muzzle brake
  box(0.92, 0.64, 0.7, [0, 0.12, 6.35], GUN);
  for (let i = 0; i < 4; i++) {
    for (const s of [1, -1]) {
      box(0.08, 0.9 - i * 0.04, 0.06, [s * 0.5, 0.12, 6.1 + i * 0.17], P.steel, { rotation: [-EL, 0, s * 12] });
    }
  }
  box(0.6, 0.14, 0.5, [0, 0.52, 6.35], P.steel);
  glow(box(0.5, 0.28, 0.04, [0, 0.12, 6.72], P.neonCyan), 2);
  for (const s of [1, -1]) glow(box(0.04, 0.3, 0.4, [s * 0.47, 0.12, 6.35], P.neonCyan), 1.2);

  // breech capacitor bank
  cyl(0.62, 0.62, 1.7, [0, 0.1, -1.0 - 0.3], P.gunmetal, 8);
  cyl(0.5, 0.5, 0.2, [0, 0.1, -2.25], P.steel, 8);
  box(1.0, 0.9, 0.4, [0, 0.1, -2.5], GUN);
  for (let i = 0; i < 5; i++) {
    glow(ring(0.64, 0.07, [0, 0.1, -0.85 - i * 0.28], P.neonCyan), 1.6);
  }
  for (const s of [1, -1]) {
    box(0.12, 0.7, 1.6, [s * 0.64, 0.1, -1.3], P.hull);
    box(0.4, 0.5, 0.3, [s * 0.28, 0.5, -2.35], P.steel);
  }
  for (let i = 0; i < 4; i++) {
    glow(ball(0.06, [-0.36 + i * 0.24, 0.62, -2.72], P.warnRed), 1.5);
  }
  box(0.7, 0.42, 0.06, [0, 0.12, -2.74], "#ffffff", { texture: LABEL });
  box(0.3, 0.3, 0.05, [0.66, 0.1, -1.0], "#ffffff", { texture: WARN, rotation: [-EL, 0, 0] });
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) box(0.04, 0.34, 0.07, [s * 0.66, 0.3 - i * 0.0, -1.8 + i * 0.22], P.gunmetal);
  }
  // charge lights along housing
  for (let i = 0; i < 3; i++) glow(ball(0.05, [0, 0.74, -1.6 + i * 0.3], P.warnRed), 1.5);

  // sensor pod on the left side
  box(0.3, 0.28, 0.6, [0.62, 0.28, 1.6], GUN);
  box(0.14, 0.2, 0.2, [0.62, 0.28, 1.15], P.steel);
  cyl(0.09, 0.09, 0.1, [0.62, 0.28, 1.95], P.glass, 8);
  glow(cyl(0.05, 0.05, 0.02, [0.62, 0.28, 2.02], P.neonCyan, 6), 1.5);
  box(0.12, 0.08, 0.4, [0.5, 0.18, 1.6], P.gunmetal);

  // cable bundles down to the turret
  for (const s of [1, -1]) {
    const pts = [g(s * 0.3, -0.1, -2.0), g(s * 0.5, -0.4, -2.2), [piv[0] + s * 0.65, 2.35, piv[2] - 1.0], [piv[0] + s * 0.7, 2.15, piv[2] - 1.2]];
    b.sweep(catmull(pts as any), 0.05, { bone, color: P.rubber, sides: 6 });
    b.sweep(catmull(pts.map((p, i) => [p[0] + s * 0.06, p[1] + 0.02, p[2]] as any)), 0.025, { bone, color: P.neonCyan, sides: 5 });
  }
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, polyline, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStabilisers({ b, J, P, M }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Paints
  const GUN = paint((p, n) => {
    const t = noise(p, 0.12, 4);
    const c = mix(P.gunmetal, "#3b4049", t * 0.7);
    return mix(c, "#1b1d22", smoothstep(0.2, -0.8, n.y) * 0.5);
  });
  const STEEL = paint((p, n) => {
    const t = noise(p, 0.05, 9);
    return mix(mix(P.steel, "#9aa3b0", t), "#4b525d", smoothstep(0.2, -0.8, n.y) * 0.5);
  });
  const PAD = paint((p, n) => {
    const mud = smoothstep(0.55, 0.8, noise(p, 0.18, 21));
    const c = mix(P.gunmetal, "#4a3f30", mud * 0.8);
    return mix(c, "#6b7078", smoothstep(0.6, 1, n.y) * 0.25);
  });

  const WARN = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#16181b"/>
     <path d="M32 7 L59 54 L5 54Z" fill="#e7b814" stroke="#16181b" stroke-width="3" stroke-linejoin="round"/>
     <rect x="29" y="22" width="6" height="18" rx="2" fill="#16181b"/><circle cx="32" cy="46" r="3.4" fill="#16181b"/></svg>`,
    { size: 96 },
  );

  const legs: [string, number, number][] = [
    ["stabFL", 1, M.stabFL[2]],
    ["stabFR", -1, M.stabFR[2]],
    ["stabRL", 1, M.stabRL[2]],
    ["stabRR", -1, M.stabRR[2]],
  ];

  for (const [key, s, z] of legs) {
    const tag = key.slice(4);
    const H = V(s * 1.98, 1.15, z);
    const T = V(s * 2.4, 0.19, z);
    const Mid = new THREE.Vector3().lerpVectors(H, T, 0.5);
    const axis = T.clone().sub(H).normalize();
    const at = (t: number) => new THREE.Vector3().lerpVectors(H, T, t);

    const chain = b.chain(`stabilisers${tag}`, polyline([H, Mid, T]), {
      parent: J[key],
      names: [`stabilisers${tag}Outer`, `stabilisers${tag}Piston`, `stabilisers${tag}Foot`],
      role: "leg",
    });
    const outer = chain.joints[0];
    const piston = chain.joints[1];
    const foot = chain.tip ?? chain.joints[2];

    // --- Hinge bracket at hull
    b.part(new THREE.BoxGeometry(0.1, 0.7, 0.9), GUN, { bone: outer, at: V(s * 1.95, 1.2, z) });
    for (const dz of [-0.9, 0.9]) {
      const w = dz * 0.25;
      b.part(new THREE.BoxGeometry(0.34, 0.42, 0.1), STEEL, { bone: outer, at: V(s * 2.08, 1.15, z + w) });
    }
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 8), P.steel, {
      bone: outer, at: V(s * 2.08, 1.15, z), dir: [0, 0, 1],
    });
    for (const dz of [-0.31, 0.31])
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8), P.steel, {
        bone: outer, at: V(s * 2.08, 1.15, z + dz), dir: [0, 0, 1],
      });
    // bolts on plate
    for (const dy of [-0.27, 0.27])
      for (const dz of [-0.36, 0.36])
        b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, {
          bone: outer, at: V(s * 2.02, 1.2 + dy, z + dz), dir: [s, 0, 0],
        });
    // hydraulic housing stub above the hinge
    b.part(new THREE.BoxGeometry(0.28, 0.3, 0.5), P.hullDark, { bone: outer, at: V(s * 2.05, 1.62, z) });
    b.part(new THREE.BoxGeometry(0.3, 0.06, 0.52), P.hazard, { bone: outer, at: V(s * 2.05, 1.8, z) });
    // warning decal on bracket plate
    b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
      bone: outer, at: V(s * 2.012, 0.92, z), dir: [s, 0, 0], axis: "z", texture: WARN,
    });

    // --- Outer cylinder
    b.rod(H, at(0.58), 0.14, GUN, { bone: outer, sides: 8 });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 8), STEEL, { bone: outer, at: at(0.1), dir: axis.toArray() });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 8), STEEL, { bone: outer, at: at(0.58), dir: axis.toArray() });
    b.part(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 8), P.hazard, { bone: outer, at: at(0.45), dir: axis.toArray() });
    // red indicator lights
    for (const dz of [-0.17, 0.17]) {
      const lp = at(0.3).add(V(0, 0, dz));
      glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnRed, { bone: outer, at: lp }), 1.6);
    }

    // --- Diagonal brace + clevis
    const B0 = V(s * 1.98, 1.85, z);
    const B1 = at(0.4).add(V(s * 0.1, 0.02, 0));
    b.rod(B0, B1, 0.05, STEEL, { bone: outer, sides: 6 });
    b.part(new THREE.SphereGeometry(0.075, 6, 4), P.steel, { bone: outer, at: B0 });
    b.part(new THREE.SphereGeometry(0.075, 6, 4), P.steel, { bone: outer, at: B1 });
    // second brace pair, offset in z
    for (const dz of [-0.28, 0.28]) {
      b.rod(V(s * 1.98, 0.95, z + dz), at(0.33).add(V(s * 0.08, 0, dz * 0.4)), 0.03, P.gunmetal, { bone: outer, sides: 6 });
    }
    // hydraulic hose
    b.sweep(
      polyline([V(s * 2.0, 1.5, z + 0.25), V(s * 2.3, 1.45, z + 0.3), at(0.2).add(V(s * 0.12, 0, 0.17))]),
      0.022, P.rubber, { bone: outer, sides: 6 },
    );

    // --- Inner piston with hazard bands
    b.rod(at(0.4), T, 0.095, STEEL, { bone: piston, sides: 8 });
    for (let k = 0; k < 4; k++) {
      const t = 0.64 + k * 0.08;
      b.part(new THREE.CylinderGeometry(0.108, 0.108, 0.055, 8), k % 2 ? P.gunmetal : P.hazard, {
        bone: piston, at: at(t), dir: axis.toArray(),
      });
    }
    // piston red light
    glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.warnRed, { bone: piston, at: at(0.62).add(V(0, 0, 0.1)) }), 1.6);

    // --- Foot pad
    const px = T.x, pz = z;
    b.part(new THREE.CylinderGeometry(0.42, 0.48, 0.11, 8), PAD, { bone: foot, at: V(px, 0.055, pz), flat: true });
    b.part(new THREE.CylinderGeometry(0.3, 0.38, 0.05, 8), P.steel, { bone: foot, at: V(px, 0.135, pz), flat: true });
    // ribs
    for (let k = 0; k < 4; k++)
      b.part(new THREE.BoxGeometry(0.62, 0.16, 0.045), GUN, {
        bone: foot, at: V(px, 0.2, pz), rotation: [0, k * 45 + 22.5, 0],
      });
    // ball socket
    b.part(new THREE.SphereGeometry(0.14, 8, 6), P.steel, { bone: foot, at: V(px, 0.2, pz) });
    // hazard blocks on rim
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      b.part(new THREE.BoxGeometry(0.1, 0.03, 0.2), k % 2 ? P.hazard : P.gunmetal, {
        bone: foot, at: V(px + Math.sin(a) * 0.4, 0.118, pz + Math.cos(a) * 0.4), rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    // pad warning decal (flat on top)
    b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
      bone: foot, at: V(px + s * 0.22, 0.165, pz + 0.12), dir: [0, 1, 0], axis: "z", up: [s, 0, 0], texture: WARN,
    });
  }
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { paint, svg, stripes, countershade, mix } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const TAU = Math.PI * 2;

  // ---------- helpers ----------
  const box = (sx: number, sy: number, sz: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at, ...extra });
  const cyl = (r0: number, r1: number, h: number, sides: number, color: any, at: number[], dir: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { bone, at, dir, ...extra });

  // ---------- paints ----------
  const HULL = panelled(countershade(P.hullLight, P.hull, { level: 0.1, soft: 0.5 }), { size: 0.55, aspect: 0.8, rivets: 0.07 });
  const HULL_SIDE = panelled(countershade(P.hull, P.hullDark, { level: -0.2, soft: 0.5 }), { size: 0.5, aspect: 0.6, rivets: 0.06 });
  const DARK = panelled(P.gunmetal, { size: 0.4, rivets: 0.08 });
  const HAZARD = stripes(P.hazard, P.gunmetal, { size: 0.24, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const MUD = paint((p, n) => mix(P.gunmetal, "#3b3328", Math.max(0, 0.9 - p.y * 0.9) * (0.4 + 0.6 * Math.max(0, 1 - n.y))));

  // ---------- main body ----------
  const LEN = 7.2;
  const CZ = -1.4;
  const section: [number, number][] = [
    [-1.6, 1.3], [1.6, 1.3], [1.8, 1.45], [1.8, 1.75], [1.55, 1.95], [-1.55, 1.95], [-1.8, 1.75], [-1.8, 1.45],
  ];
  b.extrude(section, { at: [0, 0, CZ], x: [1, 0, 0], y: [0, 1, 0], thickness: LEN, color: HULL, bone, name: "hullUpper" });
  // lower chassis between the wheels
  box(2.3, 0.45, 7.0, MUD, [0, 1.08, CZ], { name: "chassis" });
  box(1.6, 0.14, 6.4, P.gunmetal, [0, 0.9, CZ]);
  // frame rails
  for (const s of [1, -1]) box(0.14, 0.2, 7.0, P.steel, [s * 1.0, 0.96, CZ]);
  // cab-side fascia
  box(3.2, 0.4, 0.08, DARK, [0, 1.7, 2.16]);

  // ---------- wheel arches, liners, skirts ----------
  const arch = new THREE.TorusGeometry(0.76, 0.07, 5, 10, Math.PI);
  for (const s of [1, -1]) {
    for (const z of [0.2, -3.0]) {
      b.part(arch, P.gunmetal, { bone, at: [s * 1.83, 0.62, z], rotation: [0, 90, 0], name: "archRing" });
      box(0.34, 0.05, 1.55, P.gunmetal, [s * 1.65, 1.29, z]);
      box(0.05, 0.22, 1.2, P.rubber, [s * 1.81, 1.38, z]);
    }
    for (const [z, l] of [[1.65, 1.0], [-1.45, 1.25], [-4.4, 1.0]] as number[][]) {
      box(0.1, 0.34, l, HULL_SIDE, [s * 1.72, 1.15, z], { name: "skirt" });
      box(0.12, 0.05, l, HAZARD, [s * 1.72, 0.98, z]);
    }
  }

  // ---------- deck, turret ring ----------
  const RING: number[] = [M.turretRing[0], 1.95, M.turretRing[2]];
  b.lathe([[0, 0], [1.5, 0], [1.5, 0.08], [1.35, 0.16], [0, 0.16]], { at: RING, segments: 16, color: DARK, bone, name: "ringBase" });
  b.lathe([[1.45, 0], [1.7, 0], [1.7, 0.2], [1.6, 0.25], [1.45, 0.25]], { at: RING, segments: 16, color: HULL, bone, name: "ringRim" });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    cyl(0.035, 0.035, 0.05, 6, P.steel, [RING[0] + Math.sin(a) * 1.575, 2.2, RING[2] + Math.cos(a) * 1.575], [0, 1, 0]);
  }
  // cyan ring glow strip
  glow(b.lathe([[1.7, 0.06], [1.72, 0.06], [1.72, 0.12], [1.7, 0.12]], { at: RING, segments: 16, color: P.neonCyan, bone }), 1.4);

  // deck armour plates
  for (const [x, z, w, l] of [[0, 1.0, 2.6, 1.8], [-1.1, -4.0, 1.0, 1.7], [1.1, -4.0, 1.0, 1.7]] as number[][])
    box(w, 0.025, l, P.hullLight, [x, 1.965, z]);

  // deck vents
  for (let i = 0; i < 6; i++) box(1.3, 0.04, 0.06, P.rubber, [0, 2.0, -4.62 + i * 0.12]);
  box(1.5, 0.05, 0.8, P.gunmetal, [0, 1.97, -4.4], { name: "ventFrame" });
  for (let i = 0; i < 6; i++) box(1.3, 0.04, 0.06, P.rubber, [0, 2.0, -4.62 + i * 0.12]);

  // ---------- decals ----------
  const NUM = svg(`<svg viewBox="0 0 64 26"><text x="32" y="22" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="bold" font-size="24" fill="#fff">RG-07</text></svg>`, { size: 256 });
  const STAR = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="2.4"/><polygon points="16,5 19,13 27,13 21,18.5 23,26.5 16,21.5 9,26.5 11,18.5 5,13 13,13" fill="#fff"/></svg>`, { size: 128 });
  const CHEV = svg(`<svg viewBox="0 0 64 32"><path d="M4 28 L32 6 L60 28 L60 20 L32 -2 L4 20Z M4 36 L32 14 L60 36 L60 30 L32 10 L4 30Z" fill="#fff" stroke="#fff" stroke-width="2"/></svg>`, { size: 128 });
  const DECK = svg(`<svg viewBox="0 0 96 20"><text x="48" y="16" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="bold" font-size="16" fill="#fff">RAILGUN CARRIER</text></svg>`, { size: 384 });
  for (const s of [1, -1]) {
    box(0.04, 0.27, 0.8, P.gunmetal, [s * 1.81, 1.6, -2.3]);
    b.part(new THREE.PlaneGeometry(0.72, 0.24), P.white, { bone, at: [s * 1.835, 1.6, -2.3], dir: [s, 0, 0], axis: "z", texture: NUM });
    b.part(new THREE.PlaneGeometry(0.27, 0.27), P.white, { bone, at: [s * 1.815, 1.6, 0.7], dir: [s, 0, 0], axis: "z", texture: STAR });
    // cyan status strip
    glow(box(0.03, 0.04, 0.9, P.neonCyan, [s * 1.82, 1.5, -0.7]), 1.3);
  }
  b.part(new THREE.PlaneGeometry(1.8, 0.37), P.white, { bone, at: [0, 1.97, -3.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: DECK });
  b.part(new THREE.PlaneGeometry(0.9, 0.45), P.white, { bone, at: [0, 1.97, 1.1], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: CHEV });

  // ---------- rear: bumper, hazard, hooks, lights ----------
  box(3.5, 0.4, 0.3, HAZARD, [0, 1.12, -5.1], { name: "rearBumper" });
  box(3.4, 0.3, 0.06, HAZARD, [0, 1.65, -5.03]);
  box(3.4, 0.05, 0.1, P.gunmetal, [0, 1.85, -5.03]);
  const hook = new THREE.TorusGeometry(0.13, 0.035, 5, 8);
  for (const s of [1, -1]) {
    b.part(hook, P.steel, { bone, at: [s * 1.0, 1.1, -5.4], rotation: [90, 0, 0], name: "towHook" });
    box(0.12, 0.12, 0.2, P.steel, [s * 1.0, 1.1, -5.3]);
    box(0.4, 0.3, 0.1, P.gunmetal, [s * 1.45, 1.5, -5.05]);
    glow(box(0.3, 0.2, 0.05, P.warnRed, [s * 1.45, 1.5, -5.1]), 1.4);
    glow(box(0.14, 0.06, 0.04, P.headlight, [s * 1.0, 1.4, -5.06]), 0.8);
  }

  // ---------- grab handles ----------
  const handle = (p: number[], along: number[], out: number[], len: number) => {
    const a = [p[0] + along[0] * len / 2, p[1] + along[1] * len / 2, p[2] + along[2] * len / 2];
    const c = [p[0] - along[0] * len / 2, p[1] - along[1] * len / 2, p[2] - along[2] * len / 2];
    const a2 = [a[0] + out[0] * 0.08, a[1] + out[1] * 0.08, a[2] + out[2] * 0.08];
    const c2 = [c[0] + out[0] * 0.08, c[1] + out[1] * 0.08, c[2] + out[2] * 0.08];
    b.rod(a, a2, 0.018, P.steel, { bone, sides: 6 });
    b.rod(c, c2, 0.018, P.steel, { bone, sides: 6 });
    b.rod(a2, c2, 0.022, P.hazard, { bone, sides: 6 });
  };
  for (const s of [1, -1]) {
    handle([s * 1.0, 1.65, -5.03], [1, 0, 0], [0, 0, -1], 0.5);
    handle([s * 1.83, 1.6, -4.1], [0, 0, 1], [s, 0, 0], 0.5);
    handle([s * 1.83, 1.6, 1.4], [0, 0, 1], [s, 0, 0], 0.5);
  }

  // ---------- lockers ----------
  for (const s of [1, -1]) {
    for (const z of [1.3, -4.2]) {
      box(0.5, 0.25, 1.0, P.hullDark, [s * 1.45, 2.075, z], { name: "locker" });
      box(0.54, 0.04, 1.04, P.hullLight, [s * 1.45, 2.2, z]);
      box(0.04, 0.12, 0.16, P.steel, [s * 1.7, 2.08, z - 0.3]);
      box(0.04, 0.12, 0.16, P.steel, [s * 1.7, 2.08, z + 0.3]);
      box(0.06, 0.06, 0.06, P.hazard, [s * 1.7, 2.14, z]);
    }
    // side vents
    for (let i = 0; i < 4; i++) box(0.03, 0.04, 0.35, P.rubber, [s * 1.815, 1.5 + i * 0.07, -3.7]);
  }

  // ---------- stabiliser sockets ----------
  for (const key of ["stabFL", "stabFR", "stabRL", "stabRR"]) {
    const m = M[key];
    const s = m[0] > 0 ? 1 : -1;
    const z = m[2];
    box(0.5, 0.52, 0.56, DARK, [s * 1.9, 1.3, z], { name: "socketBox" });
    box(0.5, 0.06, 0.62, HAZARD, [s * 1.9, 1.57, z]);
    // hinge brackets
    for (const dz of [-0.25, 0.25]) box(0.3, 0.3, 0.06, P.steel, [s * 2.05, 1.18, z + dz]);
    // hydraulic housing aimed along the leg
    const dir = [s * 0.6, -0.8, 0];
    cyl(0.14, 0.14, 0.55, 8, P.steel, [s * 2.05, 1.12, z], dir, { name: "hydHousing" });
    b.part(new THREE.TorusGeometry(0.15, 0.03, 4, 8), P.hazard, { bone, at: [s * 2.0, 1.2, z], dir, axis: "z" });
    b.part(new THREE.TorusGeometry(0.15, 0.03, 4, 8), P.hazard, { bone, at: [s * 2.11, 1.04, z], dir, axis: "z" });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnRed, { bone, at: [s * 2.0, 1.6, z + 0.24] }), 1.5);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [s * 2.0, 1.6, z - 0.24] }), 1.5);
  }

  // ---------- cab-side hazard band & deck edge trim ----------
  for (const s of [1, -1]) {
    box(0.08, 0.06, 7.0, HAZARD, [s * 1.62, 1.97, CZ]);
    box(0.06, 0.08, 7.2, P.hullLight, [s * 1.76, 1.8, CZ]);
  }
  box(3.1, 0.06, 0.1, HAZARD, [0, 1.97, -4.95]);
}
```

<!-- call: fit-wheelsRight -->

The underbelly plate loft runs past the box because its end caps and the loft's rounded ends extend beyond the stations. I'm shortening the stations to z -3.6..3.7 so the whole plate sits inside z -3.7..4.1.

<<<<<<< SEARCH
      { at: [0, 1.02, -4.0], w: 2.0, h: 0.08 },
      { at: [0, 0.98, -2.0], w: 2.2, h: 0.1 },
      { at: [0, 0.98, 2.0], w: 2.2, h: 0.1 },
      { at: [0, 1.02, 4.0], w: 1.9, h: 0.08 },
=======
      { at: [0, 1.02, -3.6], w: 2.0, h: 0.08 },
      { at: [0, 0.98, -2.0], w: 2.2, h: 0.1 },
      { at: [0, 0.98, 2.0], w: 2.2, h: 0.1 },
      { at: [0, 1.02, 3.7], w: 1.9, h: 0.08 },
>>>>>>> REPLACE

<!-- call: fit-railgun -->

The breech parts stuck out past the box's -z face, so I compress the gun-local z behind the pivot to bring the breech inside. I also lowered the elevation from 3° to 1° to bring the muzzle and top down toward the box's y limit.

<<<<<<< SEARCH
  const EL = 3; // elevation in degrees (muzzle ends near y 3.0 as the layout asks)
=======
  const EL = 1; // elevation in degrees
>>>>>>> REPLACE
<<<<<<< SEARCH
  const g = (x: number, y: number, z: number): [number, number, number] => [
    piv[0] + x,
=======
  const g = (x: number, y: number, z0: number): [number, number, number] => {
    const z = z0 < -0.6 ? -0.6 + (z0 + 0.6) * 0.5 : z0;
    return gg(x, y, z);
  };
  const gg = (x: number, y: number, z: number): [number, number, number] => [
    piv[0] + x,
>>>>>>> REPLACE

<!-- call: fit-stabilisers -->

Fix: lower the hull-side pieces under y = 1.5, and move the foot pads in and make them smaller so they stay inside x ±2.7.

<<<<<<< SEARCH
    const T = V(s * 2.4, 0.19, z);
=======
    const T = V(s * 2.3, 0.19, z);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.1, 0.7, 0.9), GUN, { bone: outer, at: V(s * 1.95, 1.2, z) });
=======
    b.part(new THREE.BoxGeometry(0.1, 0.7, 0.9), GUN, { bone: outer, at: V(s * 1.95, 1.14, z) });
>>>>>>> REPLACE
<<<<<<< SEARCH
          bone: outer, at: V(s * 2.02, 1.2 + dy, z + dz), dir: [s, 0, 0],
=======
          bone: outer, at: V(s * 2.02, 1.14 + dy, z + dz), dir: [s, 0, 0],
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.28, 0.3, 0.5), P.hullDark, { bone: outer, at: V(s * 2.05, 1.62, z) });
    b.part(new THREE.BoxGeometry(0.3, 0.06, 0.52), P.hazard, { bone: outer, at: V(s * 2.05, 1.8, z) });
=======
    b.part(new THREE.BoxGeometry(0.28, 0.2, 0.5), P.hullDark, { bone: outer, at: V(s * 2.05, 1.36, z) });
    b.part(new THREE.BoxGeometry(0.3, 0.05, 0.52), P.hazard, { bone: outer, at: V(s * 2.05, 1.47, z) });
>>>>>>> REPLACE
<<<<<<< SEARCH
    const B0 = V(s * 1.98, 1.85, z);
=======
    const B0 = V(s * 1.98, 1.4, z);
>>>>>>> REPLACE
<<<<<<< SEARCH
      polyline([V(s * 2.0, 1.5, z + 0.25), V(s * 2.3, 1.45, z + 0.3), at(0.2).add(V(s * 0.12, 0, 0.17))]),
=======
      polyline([V(s * 2.0, 1.4, z + 0.25), V(s * 2.2, 1.38, z + 0.3), at(0.2).add(V(s * 0.12, 0, 0.17))]),
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.CylinderGeometry(0.42, 0.48, 0.11, 8), PAD, { bone: foot, at: V(px, 0.055, pz), flat: true });
    b.part(new THREE.CylinderGeometry(0.3, 0.38, 0.05, 8), P.steel, { bone: foot, at: V(px, 0.135, pz), flat: true });
=======
    b.part(new THREE.CylinderGeometry(0.34, 0.38, 0.11, 8), PAD, { bone: foot, at: V(px, 0.055, pz), flat: true });
    b.part(new THREE.CylinderGeometry(0.24, 0.3, 0.05, 8), P.steel, { bone: foot, at: V(px, 0.135, pz), flat: true });
>>>>>>> REPLACE
<<<<<<< SEARCH
      b.part(new THREE.BoxGeometry(0.62, 0.16, 0.045), GUN, {
=======
      b.part(new THREE.BoxGeometry(0.5, 0.16, 0.045), GUN, {
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone: foot, at: V(px + Math.sin(a) * 0.4, 0.118, pz + Math.cos(a) * 0.4), rotation: [0, (a * 180) / Math.PI, 0],
=======
        bone: foot, at: V(px + Math.sin(a) * 0.3, 0.118, pz + Math.cos(a) * 0.3), rotation: [0, (a * 180) / Math.PI, 0],
>>>>>>> REPLACE

<!-- call: fit-frontEnd -->

The edits below move the front axle, driveshaft, mudguards and bumper end caps inside the box. I haven't re-run the module to re-measure.

<<<<<<< SEARCH
  box(3.04, 0.08, 0.36, P.gunmetal, [0, 1.1, 5.12]);
  box(3.04, 0.08, 0.36, P.gunmetal, [0, 0.7, 5.12]);
  for (const s of [1, -1]) box(0.3, 0.42, 0.36, P.hullDark, [s * 1.5, 0.9, 5.1]);
=======
  box(3.0, 0.08, 0.36, P.gunmetal, [0, 1.1, 5.12]);
  box(3.0, 0.08, 0.36, P.gunmetal, [0, 0.7, 5.12]);
  for (const s of [1, -1]) box(0.3, 0.42, 0.36, P.hullDark, [s * 1.35, 0.9, 5.1]);
>>>>>>> REPLACE
<<<<<<< SEARCH
  cyl(0.1, 0.1, 2.9, 8, P.gunmetal, [0, 0.62, 3.4], [0, 0, 90]);
  b.part(new THREE.SphereGeometry(0.24, 8, 6), P.gunmetal, { bone, at: [0, 0.62, 3.4], group: G, flat: true });
  cyl(0.06, 0.06, 0.9, 6, P.steel, [0, 0.66, 3.95], [90, 0, 0]);
  cyl(0.09, 0.09, 0.08, 6, P.steel, [0, 0.66, 4.4], [90, 0, 0]);
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.4, 6, P.steel, [s * 0.5, 0.75, 3.4], [90, 0, 0]);
=======
  cyl(0.1, 0.1, 2.9, 8, P.gunmetal, [0, 0.62, 4.5], [0, 0, 90]);
  b.part(new THREE.SphereGeometry(0.24, 8, 6), P.gunmetal, { bone, at: [0, 0.62, 4.5], group: G, flat: true });
  cyl(0.06, 0.06, 0.5, 6, P.steel, [0, 0.66, 4.75], [90, 0, 0]);
  cyl(0.09, 0.09, 0.08, 6, P.steel, [0, 0.66, 4.98], [90, 0, 0]);
  for (const s of [1, -1]) cyl(0.07, 0.07, 0.4, 6, P.steel, [s * 0.5, 0.75, 4.5], [90, 0, 0]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.78, 0.07, 1.5, armor, [s * 1.85, 1.42, 4.0 - 0.1], [-4, 0, 0], "mudguard");
    box(0.07, 0.3, 1.5, armor, [s * 2.22, 1.28, 3.9]);
    box(0.07, 0.3, 1.5, armor, [s * 1.48, 1.28, 3.9]);
    box(0.78, 0.2, 0.07, hazardPaint, [s * 1.85, 1.3, 4.66]);
    box(0.78, 0.2, 0.07, hazardPaint, [s * 1.85, 1.3, 3.12 - 0.0]);
    glow(box(0.06, 0.06, 0.06, P.warnRed, [s * 2.22, 1.48, 4.5]), 1.2);
=======
    box(0.6, 0.07, 0.8, armor, [s * 1.2, 1.5, 4.6], [-4, 0, 0], "mudguard");
    box(0.06, 0.3, 0.8, armor, [s * 1.47, 1.35, 4.6]);
    box(0.06, 0.3, 0.8, armor, [s * 0.93, 1.35, 4.6]);
    box(0.6, 0.2, 0.06, hazardPaint, [s * 1.2, 1.35, 4.97]);
    box(0.6, 0.2, 0.06, hazardPaint, [s * 1.2, 1.35, 4.23]);
    glow(box(0.06, 0.06, 0.06, P.warnRed, [s * 1.46, 1.56, 4.5]), 1.2);
>>>>>>> REPLACE

<!-- call: fit-turretMount -->

Edits below bring the out-of-box pieces back into the box. The bay moves 0.1 m forward so the ladder clears the −z face, the ammo racks and hatch are shortened and lowered, the cheek extrudes are lowered, and the antenna is shortened.

<<<<<<< SEARCH
      at: [x, 3.1, dz], x: [0, 0, 1], thickness: 0.5, color: plate, bone,
=======
      at: [x, 2.85, dz], x: [0, 0, 1], thickness: 0.5, color: plate, bone,
>>>>>>> REPLACE
<<<<<<< SEARCH
    box(0.3, 0.45, 0.7, P.gunmetal, [s * 1.55, 2.3, dz - 0.35]);
    for (let i = 0; i < 4; i++)
      cyl(0.07, 0.07, 0.4, 6, i % 2 ? P.hazard : P.steel, [s * 1.72, 2.3, dz - 0.6 + i * 0.17], { rotation: [0, 0, 90] });
=======
    box(0.3, 0.45, 0.7, P.gunmetal, [s * 1.4, 2.3, dz - 0.35]);
    for (let i = 0; i < 4; i++)
      cyl(0.07, 0.07, 0.2, 6, i % 2 ? P.hazard : P.steel, [s * 1.5, 2.3, dz - 0.6 + i * 0.17], { rotation: [0, 0, 90] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  const bz = dz - 1.35;
=======
  const bz = dz - 1.25;
>>>>>>> REPLACE
<<<<<<< SEARCH
  box(0.8, 0.22, 0.8, P.hullDark, [-0.55, 3.4, bz + 0.0]);
  cyl(0.3, 0.3, 0.06, 10, metalP, [-0.55, 3.55, bz]);
  b.part(new THREE.CircleGeometry(0.26, 10), "#ffffff", {
    bone, at: [-0.55, 3.59, bz], dir: [0, 1, 0], axis: "z", texture: hatchTex,
  });
  b.rod([-0.8, 3.6, bz], [-0.3, 3.6, bz], 0.025, P.hazard, { bone });
=======
  box(0.8, 0.22, 0.8, P.hullDark, [-0.55, 3.25, bz + 0.0]);
  cyl(0.3, 0.3, 0.06, 10, metalP, [-0.55, 3.34, bz]);
  b.part(new THREE.CircleGeometry(0.26, 10), "#ffffff", {
    bone, at: [-0.55, 3.375, bz], dir: [0, 1, 0], axis: "z", texture: hatchTex,
  });
  b.rod([-0.8, 3.38, bz], [-0.3, 3.38, bz], 0.02, P.hazard, { bone });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.spike([0.7, 3.35, bz - 0.3], [0, 1, 0], 0.5, 0.015, { bone, color: P.steel });
=======
  b.spike([0.7, 3.2, bz - 0.3], [0, 1, 0], 0.1, 0.015, { bone, color: P.steel });
>>>>>>> REPLACE

<!-- call: fit-cab -->

I've moved the pieces that reached outside the box back in, and left the rest of the design as it was.

- **Main shell:** it now has flat caps with its stations pulled inside z 2.25 to 4.5 and y 1.3 and up.
- **Sensor mast and antenna:** both are shortened so they top out at y 2.78.
- **Mirrors, step rails and step plate:** these are pulled in to x ±1.3 or less.

```
<<<<<<< SEARCH
      { at: [0, 1.62, Z0 + 0.05], w: 2.55, h: 0.7 },
      { at: [0, 2.0, 3.2], w: 2.5, h: 1.45 },
      { at: [0, 2.1, 4.0], w: 2.4, h: 1.2 },
      { at: [0, 1.95, 4.55], w: 2.2, h: 0.7 },
    ],
    { bone: body, color: HULL, section: "box" },
=======
      { at: [0, 1.75, 2.25], w: 2.5, h: 0.9 },
      { at: [0, 2.0, 3.2], w: 2.5, h: 1.4 },
      { at: [0, 2.1, 4.0], w: 2.4, h: 1.2 },
      { at: [0, 1.95, 4.5], w: 2.2, h: 0.8 },
    ],
    { bone: body, color: HULL, section: "box", caps: "flat" },
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.rod([s * 1.38, 1.3, 2.8], [s * 1.38, 1.3, 4.1], 0.04, P.steel, { bone: body });
    b.rod([s * 1.3, 1.3, 2.8], [s * 1.38, 1.3, 2.8], 0.03, P.steel, { bone: body });
    b.rod([s * 1.3, 1.3, 4.1], [s * 1.38, 1.3, 4.1], 0.03, P.steel, { bone: body });
    b.part(new THREE.BoxGeometry(0.22, 0.04, 0.5), P.gunmetal, { bone: body, at: [s * 1.4, 1.2, 3.5] });
    // mirrors
    b.rod([s * 1.3, 2.35, 4.15], [s * 1.62, 2.5, 4.2], 0.025, P.gunmetal, { bone: body });
    b.part(new THREE.BoxGeometry(0.06, 0.26, 0.2), P.gunmetal, { bone: body, at: [s * 1.65, 2.5, 4.22], flat: true });
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.15), P.glass, { bone: body, at: [s * 1.65, 2.5, 4.33] });
=======
    b.rod([s * 1.27, 1.4, 2.8], [s * 1.27, 1.4, 4.1], 0.03, P.steel, { bone: body });
    b.part(new THREE.BoxGeometry(0.1, 0.04, 0.5), P.gunmetal, { bone: body, at: [s * 1.24, 1.32, 3.5] });
    // mirrors
    b.rod([s * 1.2, 2.45, 4.15], [s * 1.26, 2.5, 4.2], 0.02, P.gunmetal, { bone: body });
    b.part(new THREE.BoxGeometry(0.05, 0.24, 0.18), P.gunmetal, { bone: body, at: [s * 1.26, 2.5, 4.25], flat: true });
    b.part(new THREE.BoxGeometry(0.02, 0.2, 0.15), P.glass, { bone: body, at: [s * 1.285, 2.5, 4.25] });
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.part(new THREE.BoxGeometry(0.04, 0.06, 2.2), P.hazard, { bone: body, at: [x + s * 0.04, 1.43, 3.4] });
=======
    b.part(new THREE.BoxGeometry(0.04, 0.06, 2.2), P.hazard, { bone: body, at: [x, 1.43, 3.4] });
>>>>>>> REPLACE
<<<<<<< SEARCH
  b.rod([mx, 2.7, mz], [mx, 3.15, mz], 0.04, P.gunmetal, { bone: body });
  b.part(new THREE.BoxGeometry(0.2, 0.12, 0.2), P.gunmetal, { bone: body, at: [mx, 3.15, mz], flat: true });
  b.lathe([[0, 0], [0.22, 0.1], [0.24, 0.12], [0, 0.04]], {
    at: [mx, 3.25, mz], bone: body, color: P.steel, segments: 8,
  });
  b.rod([mx, 3.2, mz], [mx, 3.38, mz + 0.1], 0.015, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), P.neonCyan, { bone: body, at: [mx, 3.43, mz + 0.1] }), 2);
  b.rod([mx - 0.3, 2.7, mz - 0.1], [mx - 0.3, 3.4, mz - 0.1], 0.012, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.035, 5, 4), P.warnRed, { bone: body, at: [mx - 0.3, 3.42, mz - 0.1] }), 2);
=======
  b.rod([mx, 2.6, mz], [mx, 2.68, mz], 0.04, P.gunmetal, { bone: body });
  b.part(new THREE.BoxGeometry(0.2, 0.06, 0.2), P.gunmetal, { bone: body, at: [mx, 2.7, mz], flat: true });
  b.lathe([[0, 0], [0.12, 0.03], [0.14, 0.05], [0, 0.02]], {
    at: [mx, 2.73, mz], bone: body, color: P.steel, segments: 8,
  });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonCyan, { bone: body, at: [mx + 0.2, 2.76, mz] }), 2);
  b.rod([mx - 0.3, 2.65, mz - 0.1], [mx - 0.3, 2.76, mz - 0.1], 0.012, P.steel, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.025, 5, 4), P.warnRed, { bone: body, at: [mx - 0.3, 2.77, mz - 0.1] }), 2);
>>>>>>> REPLACE
```

<!-- call: fit-hull -->

I'm replacing the whole function. Every piece that was past the box now sits inside x ±1.9, z -5..2.2 and y 0.9..2.2; the stabiliser sockets, hooks and hydraulic housings are shrunk or moved inward.

```ts
import * as THREE from "three";
import { paint, svg, stripes, countershade, mix } from "agentic-3js-builder";
import { panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const TAU = Math.PI * 2;

  const box = (sx: number, sy: number, sz: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { bone, at, ...extra });
  const cyl = (r0: number, r1: number, h: number, sides: number, color: any, at: number[], dir: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, sides), color, { bone, at, dir, ...extra });

  const HULL = panelled(countershade(P.hullLight, P.hull, { level: 0.1, soft: 0.5 }), { size: 0.55, aspect: 0.8, rivets: 0.07 });
  const HULL_SIDE = panelled(countershade(P.hull, P.hullDark, { level: -0.2, soft: 0.5 }), { size: 0.5, aspect: 0.6, rivets: 0.06 });
  const DARK = panelled(P.gunmetal, { size: 0.4, rivets: 0.08 });
  const HAZARD = stripes(P.hazard, P.gunmetal, { size: 0.24, axis: [1, 0, 1], width: 0.5, wobble: 0 });
  const MUD = paint((p, n) => mix(P.gunmetal, "#3b3328", Math.max(0, 0.9 - p.y * 0.9) * (0.4 + 0.6 * Math.max(0, 1 - n.y))));

  const LEN = 7.2;
  const CZ = -1.4;
  const section: [number, number][] = [
    [-1.6, 1.3], [1.6, 1.3], [1.8, 1.45], [1.8, 1.75], [1.55, 1.95], [-1.55, 1.95], [-1.8, 1.75], [-1.8, 1.45],
  ];
  b.extrude(section, { at: [0, 0, CZ], x: [1, 0, 0], y: [0, 1, 0], thickness: LEN, color: HULL, bone, name: "hullUpper" });
  box(2.3, 0.45, 7.0, MUD, [0, 1.08, CZ], { name: "chassis" });
  box(1.6, 0.14, 6.4, P.gunmetal, [0, 0.95, CZ]);
  for (const s of [1, -1]) box(0.14, 0.2, 7.0, P.steel, [s * 1.0, 1.0, CZ]);
  box(3.2, 0.4, 0.08, DARK, [0, 1.7, 2.14]);

  const arch = new THREE.TorusGeometry(0.76, 0.07, 5, 10, Math.PI);
  for (const s of [1, -1]) {
    for (const z of [0.2, -3.0]) {
      b.part(arch, P.gunmetal, { bone, at: [s * 1.83, 0.62, z], rotation: [0, 90, 0], name: "archRing", scale: [1, 0.8, 1] });
      box(0.34, 0.05, 1.55, P.gunmetal, [s * 1.65, 1.29, z]);
      box(0.05, 0.22, 1.2, P.rubber, [s * 1.81, 1.38, z]);
    }
    for (const [z, l] of [[1.6, 1.0], [-1.45, 1.25], [-4.4, 1.0]] as number[][]) {
      box(0.1, 0.34, l, HULL_SIDE, [s * 1.72, 1.15, z], { name: "skirt" });
      box(0.12, 0.05, l, HAZARD, [s * 1.72, 0.98, z]);
    }
  }

  const RING: number[] = [M.turretRing[0], 1.95, M.turretRing[2]];
  b.lathe([[0, 0], [1.5, 0], [1.5, 0.08], [1.35, 0.16], [0, 0.16]], { at: RING, segments: 16, color: DARK, bone, name: "ringBase" });
  b.lathe([[1.45, 0], [1.7, 0], [1.7, 0.2], [1.6, 0.25], [1.45, 0.25]], { at: RING, segments: 16, color: HULL, bone, name: "ringRim" });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    cyl(0.035, 0.035, 0.05, 6, P.steel, [RING[0] + Math.sin(a) * 1.575, 2.2, RING[2] + Math.cos(a) * 1.575], [0, 1, 0]);
  }
  glow(b.lathe([[1.7, 0.06], [1.72, 0.06], [1.72, 0.12], [1.7, 0.12]], { at: RING, segments: 16, color: P.neonCyan, bone }), 1.4);

  for (const [x, z, w, l] of [[0, 1.0, 2.6, 1.8], [-1.1, -4.0, 1.0, 1.7], [1.1, -4.0, 1.0, 1.7]] as number[][])
    box(w, 0.025, l, P.hullLight, [x, 1.965, z]);
  box(1.5, 0.05, 0.8, P.gunmetal, [0, 1.97, -4.4], { name: "ventFrame" });
  for (let i = 0; i < 6; i++) box(1.3, 0.04, 0.06, P.rubber, [0, 2.0, -4.62 + i * 0.12]);

  const NUM = svg(`<svg viewBox="0 0 64 26"><text x="32" y="22" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="bold" font-size="24" fill="#fff">RG-07</text></svg>`, { size: 256 });
  const STAR = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="2.4"/><polygon points="16,5 19,13 27,13 21,18.5 23,26.5 16,21.5 9,26.5 11,18.5 5,13 13,13" fill="#fff"/></svg>`, { size: 128 });
  const CHEV = svg(`<svg viewBox="0 0 64 32"><path d="M4 28 L32 6 L60 28 L60 20 L32 -2 L4 20Z M4 36 L32 14 L60 36 L60 30 L32 10 L4 30Z" fill="#fff" stroke="#fff" stroke-width="2"/></svg>`, { size: 128 });
  const DECK = svg(`<svg viewBox="0 0 96 20"><text x="48" y="16" text-anchor="middle" font-family="Arial Black,sans-serif" font-weight="bold" font-size="16" fill="#fff">RAILGUN CARRIER</text></svg>`, { size: 384 });
  for (const s of [1, -1]) {
    box(0.04, 0.27, 0.8, P.gunmetal, [s * 1.81, 1.6, -2.3]);
    b.part(new THREE.PlaneGeometry(0.72, 0.24), P.white, { bone, at: [s * 1.835, 1.6, -2.3], dir: [s, 0, 0], axis: "z", texture: NUM });
    b.part(new THREE.PlaneGeometry(0.27, 0.27), P.white, { bone, at: [s * 1.815, 1.6, 0.7], dir: [s, 0, 0], axis: "z", texture: STAR });
    glow(box(0.03, 0.04, 0.9, P.neonCyan, [s * 1.82, 1.5, -0.7]), 1.3);
  }
  b.part(new THREE.PlaneGeometry(1.8, 0.37), P.white, { bone, at: [0, 1.97, -3.55], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: DECK });
  b.part(new THREE.PlaneGeometry(0.9, 0.45), P.white, { bone, at: [0, 1.97, 1.1], dir: [0, 1, 0], axis: "z", up: [0, 0, 1], texture: CHEV });

  box(3.5, 0.4, 0.15, HAZARD, [0, 1.15, -4.92], { name: "rearBumper" });
  box(3.4, 0.3, 0.06, HAZARD, [0, 1.65, -4.97]);
  box(3.4, 0.05, 0.06, P.gunmetal, [0, 1.85, -4.97]);
  const hook = new THREE.TorusGeometry(0.08, 0.025, 5, 8);
  for (const s of [1, -1]) {
    b.part(hook, P.steel, { bone, at: [s * 1.0, 1.1, -4.9], rotation: [90, 0, 0], name: "towHook" });
    box(0.12, 0.12, 0.1, P.steel, [s * 1.0, 1.1, -4.8]);
    box(0.4, 0.3, 0.06, P.gunmetal, [s * 1.45, 1.5, -4.95]);
    glow(box(0.3, 0.2, 0.04, P.warnRed, [s * 1.45, 1.5, -4.98]), 1.4);
    glow(box(0.14, 0.06, 0.04, P.headlight, [s * 1.0, 1.4, -4.98]), 0.8);
  }

  const handle = (p: number[], along: number[], out: number[], len: number) => {
    const a = [p[0] + along[0] * len / 2, p[1] + along[1] * len / 2, p[2] + along[2] * len / 2];
    const c = [p[0] - along[0] * len / 2, p[1] - along[1] * len / 2, p[2] - along[2] * len / 2];
    const a2 = [a[0] + out[0] * 0.07, a[1] + out[1] * 0.07, a[2] + out[2] * 0.07];
    const c2 = [c[0] + out[0] * 0.07, c[1] + out[1] * 0.07, c[2] + out[2] * 0.07];
    b.rod(a, a2, 0.018, P.steel, { bone, sides: 6 });
    b.rod(c, c2, 0.018, P.steel, { bone, sides: 6 });
    b.rod(a2, c2, 0.022, P.hazard, { bone, sides: 6 });
  };
  for (const s of [1, -1]) {
    handle([s * 1.0, 1.65, -4.9], [1, 0, 0], [0, 0, -1], 0.5);
    handle([s * 1.8, 1.6, -4.1], [0, 0, 1], [s, 0, 0], 0.5);
    handle([s * 1.8, 1.6, 1.4], [0, 0, 1], [s, 0, 0], 0.5);
  }

  for (const s of [1, -1]) {
    for (const z of [1.3, -4.2]) {
      box(0.5, 0.25, 1.0, P.hullDark, [s * 1.45, 2.075, z], { name: "locker" });
      box(0.54, 0.04, 1.04, P.hullLight, [s * 1.45, 2.17, z]);
      box(0.04, 0.12, 0.16, P.steel, [s * 1.7, 2.08, z - 0.3]);
      box(0.04, 0.12, 0.16, P.steel, [s * 1.7, 2.08, z + 0.3]);
      box(0.06, 0.06, 0.06, P.hazard, [s * 1.7, 2.14, z]);
    }
    for (let i = 0; i < 4; i++) box(0.03, 0.04, 0.35, P.rubber, [s * 1.815, 1.5 + i * 0.07, -3.7]);
  }

  for (const key of ["stabFL", "stabFR", "stabRL", "stabRR"]) {
    const m = M[key];
    const s = m[0] > 0 ? 1 : -1;
    const z = m[2] > 0 ? 1.85 : -3.6;
    box(0.3, 0.5, 0.5, DARK, [s * 1.75, 1.3, z], { name: "socketBox" });
    box(0.3, 0.05, 0.54, HAZARD, [s * 1.75, 1.57, z]);
    for (const dz of [-0.22, 0.22]) box(0.12, 0.28, 0.05, P.steel, [s * 1.84, 1.2, z + dz]);
    const dir = [s * 0.6, -0.8, 0];
    cyl(0.1, 0.1, 0.4, 8, P.steel, [s * 1.84, 1.2, z], dir, { name: "hydHousing" });
    b.part(new THREE.TorusGeometry(0.1, 0.025, 4, 8), P.hazard, { bone, at: [s * 1.8, 1.26, z], dir, axis: "z" });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnRed, { bone, at: [s * 1.75, 1.6, z + 0.2] }), 1.5);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [s * 1.75, 1.6, z - 0.2] }), 1.5);
  }

  for (const s of [1, -1]) {
    box(0.08, 0.06, 7.0, HAZARD, [s * 1.62, 1.97, CZ]);
    box(0.06, 0.08, 7.0, P.hullLight, [s * 1.76, 1.8, CZ]);
  }
  box(3.1, 0.06, 0.1, HAZARD, [0, 1.97, -4.9]);
}
```
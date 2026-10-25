<!-- call: plan -->

```json
{
  "name": "Longbow Railgun Carrier",
  "description": "A six-wheeled low-poly sci-fi military carrier with a long electromagnetic railgun on its back, braced on four hydraulic stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [3.6, 3.0, 9.0],
  "layout": "Front is +Z. Wedge-nosed armoured cab sits at the front (z 2.6..4.2) with an angled windscreen with glowing cyan visor strips, headlights and a bull bar. Behind it a long low chassis (z -4.2..2.6) carries six chunky wheels in three pairs (front z=2.6, middle z=-0.4, rear z=-3.4), wheel radius 0.55, resting on y=0. Above the chassis a turntable ring at z=-1.0 carries a rotating turret base and a long railgun cradle; twin parallel rails run forward over the cab to z=4.6 and rearward with a capacitor bank behind. Four stabiliser legs fold out diagonally from the chassis sides at mid and rear, ending in broad foot pads on the floor (y=0). Style: faceted chunky panels, olive-drab hull with dark-grey armour plates, hazard yellow stripes on stabilisers and edges, cyan glowing energy strips on rails and capacitors, stencil markings and rivets painted via textures. Everything is boxy with chamfers and wedges.",
  "palette": {
    "hull": "#5a6148",
    "hullDark": "#3a3f2e",
    "armor": "#2f3338",
    "steel": "#7b828a",
    "trim": "#e7b814",
    "tire": "#17181a",
    "rim": "#555b61",
    "glass": "#1b3a48",
    "neonCyan": "#2ff3ff",
    "warnRed": "#d6342a",
    "lamp": "#fff3b0",
    "white": "#e8e8e0"
  },
  "mounts": {
    "chassisTop": [0, 1.5, 0],
    "cabRoof": [0, 2.2, 3.3],
    "turretRing": [0, 1.5, -1.0],
    "railBreech": [0, 2.75, -2.6],
    "railMuzzle": [0, 2.75, 4.5],
    "axleFront": [0, 0.55, 2.6],
    "axleMid": [0, 0.55, -0.4],
    "axleRear": [0, 0.55, -3.4],
    "stabFL": [1.5, 0.9, -0.4],
    "stabFR": [-1.5, 0.9, -0.4],
    "stabRL": [1.5, 0.9, -3.0],
    "stabRR": [-1.5, 0.9, -3.0]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.5, -1.0], "dir": [0, 1, 0], "role": "hinge", "group": "weapon" },
    { "name": "railCradle", "parent": "turret", "at": [0, 2.3, -1.0], "dir": [0, 0, 1], "role": "hinge", "group": "weapon" },
    { "name": "wheelFL", "parent": "body", "at": [1.6, 0.55, 2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.6, 0.55, 2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.6, 0.55, -0.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.6, 0.55, -0.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.6, 0.55, -3.4], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.6, 0.55, -3.4], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "stabFL", "parent": "body", "at": [1.5, 0.9, -0.4], "dir": [0.6, -0.6, 0.2], "role": "leg", "group": "stabilisers" },
    { "name": "stabFR", "parent": "body", "at": [-1.5, 0.9, -0.4], "dir": [-0.6, -0.6, 0.2], "role": "leg", "group": "stabilisers" },
    { "name": "stabRL", "parent": "body", "at": [1.5, 0.9, -3.0], "dir": [0.6, -0.6, -0.2], "role": "leg", "group": "stabilisers" },
    { "name": "stabRR", "parent": "body", "at": [-1.5, 0.9, -3.0], "dir": [-0.6, -0.6, -0.2], "role": "leg", "group": "stabilisers" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Long armoured chassis hull: lower tub with sloped sides and skirt plates, upper deck with panelled paint (rivets, seams, stencil numbers, hazard edges), rear engine deck with vent grilles and exhaust stacks, side tool boxes, tow hooks, a rear ramp-light bar, and the turntable ring base (lathe ring with teeth marks) at turretRing. Includes axle housings and wheel arches over the three axle mounts. Does not include wheels, cab, or stabilisers.",
      "box": [[-1.7, 0.6, -4.5], [1.7, 1.6, 2.6]],
      "attaches": "Cab starts at z=2.6 on chassisTop; wheels hang at axle mounts; stabiliser hinge plates at stabFL/FR/RL/RR; turret sits on turretRing.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Front crew cab: wedge-shaped armoured nose with angled glass visor (dark glass texture with cyan glowing HUD strips), armoured window slats, sloped roof with antenna cluster and sensor dome, headlights (glowing lamp colour), bull bar with yellow chevrons, front tow hooks, side mirrors, door outlines and handles, unit emblem decal on the doors. Roof at cabRoof.",
      "box": [[-1.6, 0.6, 2.6], [1.6, 2.4, 4.4]],
      "attaches": "Rear face meets chassis at z=2.6 on chassisTop; sits above front axle mount axleFront; railgun passes over roof above it at y>=2.5.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wheels",
      "builds": "Six heavy wheels with low-poly 10-sided tyres with tread bands painted by texture, steel rims with hex bolt rings, hub caps with small red unit dots, mud-splash paint on lower faces, axle stubs and brake discs, and mudguard flaps behind each wheel. Each wheel rides its own wheel joint, spun about its axle direction. Radius 0.55 and width 0.5 centred at x=±1.6 so lowest points touch y=0.",
      "box": [[-1.9, 0.0, -3.95], [1.9, 1.1, 3.15]],
      "attaches": "Axle lines at axleFront, axleMid, axleRear; inner faces meet chassis sides at x=±1.35.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed hydraulic stabiliser legs, two pairs at stabFL/FR and stabRL/RR: hinge bracket, upper arm box, telescoping piston (steel cylinder inside a hazard-striped sleeve), diagonal brace strut, ball joint, and wide octagonal foot pad with ribbed underside and warning chevrons resting on y=0. Legs splay outward and down about 45 degrees to feet at x=±3.0 z=-0.4 and z=-3.0 (x=±3.0 total width within 3.6 size). Small orange beacon lights on each bracket.",
      "box": [[-3.3, 0.0, -3.7], [3.3, 1.1, 0.3]],
      "attaches": "Hinge brackets bolt to chassis sides at stabFL, stabFR, stabRL, stabRR; each leg chain rides its stab joint.",
      "joints": ["stabFL", "stabFR", "stabRL", "stabRR"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "railgun",
      "builds": "Turret and railgun: rotating turret base (octagonal lathe drum with armour skirt) on turretRing with side armour cheeks, crew hatch and sensor pod, then the cradle with two long parallel rails (box sweeps, steel with glowing cyan energy strips) running from rear breech at railBreech to muzzle at railMuzzle, insulating spacer blocks every 0.6 m, a muzzle brake with cyan emitter ring, coolant tubes, and at the rear a stack of capacitor banks (cylinders with glowing cyan bands, red warning labels, cabling swept between them). Hazard-stripe bands and white stencil text on the barrel shroud. Rails ride railCradle, base rides turret.",
      "box": [[-1.3, 1.5, -4.2], [1.3, 3.0, 4.7]],
      "attaches": "Base ring sits on turretRing at chassisTop height 1.5; rails pass above cab roof (cabRoof y=2.2) at y 2.5..3.0 from railBreech to railMuzzle.",
      "joints": ["turret", "railCradle"],
      "floor": false,
      "budget": 200
    }
  ]
}
```

<!-- call: wheels -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.5;
  const MUD = "#4a3a28";
  const RED = P.warnRed;

  // Tyre: dark rubber with mud on the lower faces and grime from noise.
  const rubber = paint((p, n) => {
    const base: [number, number, number] = [0.09, 0.095, 0.1];
    const mud = smoothstep(0.35, 0.05, p.y) * smoothstep(0.2, 0.6, noise(p, 0.2, 5));
    const wear = noise(p, 0.05, 9) * 0.06;
    const c = mix([base[0] + wear, base[1] + wear, base[2] + wear], MUD, mud * 0.8);
    return c;
  });
  const rimPaint = paint((p, n) => {
    const t = noise(p, 0.06, 3);
    const mud = smoothstep(0.3, 0.0, p.y) * 0.5;
    return mix(mix("#4c5258", "#6b7279", t), MUD, mud);
  });
  const discPaint = paint((p) => mix("#6a6e72", "#8a8478", noise(p, 0.04, 2)));
  const flapPaint = paint((p) => mix("#1c1d1f", MUD, smoothstep(0.7, 0.2, p.y) * 0.8));

  // Tread texture: chevron bands drawn for the tyre face (cards on the tread).
  const treadTex = svg(
    `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="32" fill="#2a2b2e"/>
      <g stroke="#0c0c0e" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M2 0 L12 16 L2 32"/><path d="M18 0 L28 16 L18 32"/>
        <path d="M34 0 L44 16 L34 32"/><path d="M50 0 L60 16 L50 32"/>
      </g>
      <rect y="14" width="64" height="4" fill="#161618"/>
    </svg>`,
    { size: 128 },
  );
  const dotTex = svg(
    `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#6b7279"/>
      <circle cx="16" cy="16" r="14" fill="none" stroke="#2f3338" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="${RED}" stroke="#2a0d0a" stroke-width="2"/>
      <circle cx="14" cy="14" r="1.8" fill="#ffb0a8"/>
    </svg>`,
    { size: 96 },
  );
  const boltTex = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#4c5258" stroke="#1d2024" stroke-width="2"/>
      <circle cx="32" cy="32" r="24" fill="none" stroke="#2f3338" stroke-width="3"/>
      <circle cx="32" cy="32" r="12" fill="#3a3f45"/>
    </svg>`,
    { size: 128 },
  );

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, 2.6],
    ["wheelFR", -1, 2.6],
    ["wheelML", 1, -0.4],
    ["wheelMR", -1, -0.4],
    ["wheelRL", 1, -3.4],
    ["wheelRR", -1, -3.4],
  ];
  const r = rng(11);

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = s * 1.6;
    const ax = new THREE.Vector3(s, 0, 0);
    const C: [number, number, number] = [cx, R, z];
    const o = (d: number): [number, number, number] => [cx + s * d, R, z]; // along axle (outward positive)

    // Tyre: 10-sided cylinder along x.
    b.part(new THREE.CylinderGeometry(R, R, W, 10, 1), rubber, { bone: j, at: C, dir: [1, 0, 0], flat: true, name: `tyre.${name}` });
    // Sidewall shoulders (slightly smaller ring bulge).
    for (const k of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.99, 0.05, 10), "#101113", {
        bone: j, at: o(k * (W / 2 + 0.01)), dir: [1, 0, 0], flat: true,
      });
    }
    // Tread bands on tyre outer surface: three thin textured rings of boxes.
    const treadCount = 10;
    for (let i = 0; i < treadCount; i++) {
      const a = (i / treadCount) * Math.PI * 2 + Math.PI / treadCount;
      const rr = R * 0.96 + 0.02;
      const y = R + Math.cos(a) * rr;
      const zz = z + Math.sin(a) * rr;
      b.part(new THREE.BoxGeometry(W * 0.9, 0.035, 0.22), "#ffffff", {
        bone: j, at: [cx, y, zz], rotation: [(-a * 180) / Math.PI, 0, 0], texture: treadTex,
      });
    }
    // Rim disc outside, with bolt texture.
    const out = s * (W / 2 + 0.035);
    b.part(new THREE.CylinderGeometry(R * 0.66, R * 0.66, 0.08, 10), rimPaint, {
      bone: j, at: [cx + out, R, z], dir: [1, 0, 0], flat: true,
    });
    b.part(new THREE.CylinderGeometry(R * 0.56, R * 0.6, 0.06, 10), P.rim, {
      bone: j, at: [cx + out + s * 0.05, R, z], dir: [1, 0, 0], flat: true,
    });
    b.part(new THREE.PlaneGeometry(R * 1.2, R * 1.2), "#ffffff", {
      bone: j, at: [cx + out + s * 0.085, R, z], dir: [s, 0, 0], axis: "z", texture: boltTex,
    });
    // Hex bolt ring.
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.steel, {
        bone: j, at: [cx + out + s * 0.1, R + Math.cos(a) * R * 0.4, z + Math.sin(a) * R * 0.4], dir: [1, 0, 0],
      });
    }
    // Inner rim face.
    b.part(new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.06, 10), rimPaint, {
      bone: j, at: o(-s * (W / 2 + 0.03) * -1 * -1), dir: [1, 0, 0], flat: true,
    });
    // Hub cap with red unit dot.
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 8), P.steel, {
      bone: j, at: [cx + out + s * 0.13, R, z], dir: [1, 0, 0], flat: true,
    });
    b.part(new THREE.CircleGeometry(0.155, 8), "#ffffff", {
      bone: j, at: [cx + out + s * 0.185, R, z], dir: [s, 0, 0], axis: "z", texture: dotTex,
    });
    // Axle stub toward the chassis.
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 8), P.armor, {
      bone: j, at: [s * 1.5, R, z], dir: [1, 0, 0],
    });
    // Brake disc inside the tyre.
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.035, 10), discPaint, {
      bone: j, at: [s * 1.42, R, z], dir: [1, 0, 0], flat: true,
    });
    // Brake caliper.
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.12), P.warnRed, {
      bone: j, at: [s * 1.42, R + 0.27, z + 0.08],
    });
    // Mudguard flap behind wheel (rides the joint's body; fixed on wheel bone for simplicity).
    b.part(new THREE.BoxGeometry(0.46, 0.4, 0.04), flapPaint, {
      bone: J.body, at: [cx, 0.38, z - R - 0.08], rotation: [8, 0, 0],
    });
    b.part(new THREE.BoxGeometry(0.46, 0.05, 0.05), P.trim, {
      bone: J.body, at: [cx, 0.58, z - R - 0.07],
    });
    b.part(new THREE.BoxGeometry(0.46, 0.04, 0.06), P.steel, {
      bone: J.body, at: [cx, 0.2, z - R - 0.09],
    });
    // Mud splatter clumps on lower tyre.
    for (let i = 0; i < 3; i++) {
      const a = Math.PI + (r() - 0.5) * 1.2;
      b.part(new THREE.IcosahedronGeometry(0.05 + r() * 0.03, 0), MUD, {
        bone: j, at: [cx + (r() - 0.5) * 0.3, R + Math.cos(a) * R * 0.98, z + Math.sin(a) * R * 0.98],
      });
    }
  }
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStabilisers(ctx: any) {
  const { b, J, P } = ctx;
  const ORANGE = "#ff8a1a";
  const R = rng(5);

  const hazard = (s: number) =>
    paint((p, _n) => {
      const d = (p.y * 0.7 + p.x * s * 0.7) / 0.1;
      const f = d - Math.floor(d);
      return f < 0.5 ? P.trim : P.armor;
    });

  const chevron = svg(
    `<svg viewBox="0 0 64 64">
      <rect width="64" height="64" fill="#2f3338"/>
      <rect x="2" y="2" width="60" height="60" fill="none" stroke="#e7b814" stroke-width="3"/>
      <path d="M10 44 L32 26 L54 44 L54 54 L32 36 L10 54Z" fill="#e7b814"/>
      <path d="M10 28 L32 10 L54 28 L54 38 L32 20 L10 38Z" fill="#e7b814"/>
      <circle cx="8" cy="8" r="2" fill="#7b828a"/><circle cx="56" cy="8" r="2" fill="#7b828a"/>
      <circle cx="8" cy="56" r="2" fill="#7b828a"/><circle cx="56" cy="56" r="2" fill="#7b828a"/>
    </svg>`,
    { size: 128 },
  );

  const legs: [string, number, number][] = [
    ["stabFL", 1, -0.4],
    ["stabFR", -1, -0.4],
    ["stabRL", 1, -3.0],
    ["stabRR", -1, -3.0],
  ];

  for (const [name, s, z0] of legs) {
    const bone = J[name];
    const sgn = z0 > -1 ? 1 : -1; // slight fore/aft lean sign unused visually
    void sgn;
    const tag = { bone, group: "stabilisers" };

    // hinge bracket: plate bolted to chassis side plus two ears
    b.part(new THREE.BoxGeometry(0.1, 0.5, 0.7), P.armor, { ...tag, at: [s * 1.76, 0.9, z0] });
    for (const dz of [-0.28, 0.28]) {
      b.part(new THREE.BoxGeometry(0.4, 0.34, 0.1), P.hullDark, { ...tag, at: [s * 1.98, 0.92, z0 + dz] });
    }
    // bolts
    for (const dy of [-0.18, 0.18])
      for (const dz of [-0.25, 0.25])
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.steel, {
          ...tag,
          at: [s * 1.82, 0.9 + dy, z0 + dz],
          dir: [s, 0, 0],
        });
    // hinge pin
    b.rod([s * 2.05, 0.92, z0 - 0.34], [s * 2.05, 0.92, z0 + 0.34], 0.055, P.steel, { ...tag, sides: 8 });

    // beacon
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 8), P.armor, { ...tag, at: [s * 1.76, 1.17, z0 - 0.2] });
    glow(
      b.part(new THREE.SphereGeometry(0.075, 8, 5), ORANGE, { ...tag, at: [s * 1.76, 1.22, z0 - 0.2] }),
      1.6,
    );

    // upper arm box
    const hinge: [number, number, number] = [s * 2.05, 0.92, z0];
    const elbow: [number, number, number] = [s * 2.5, 0.82, z0];
    b.frustumBox(hinge, elbow, [0.3, 0.3], [0.26, 0.26], { ...tag, color: P.hull });
    b.frustumBox([s * 2.1, 0.92, z0], [s * 2.4, 0.84, z0], [0.34, 0.1], [0.3, 0.1], { ...tag, color: P.armor });
    // elbow ball joint
    b.part(new THREE.SphereGeometry(0.17, 8, 6), P.steel, { ...tag, at: elbow });

    // piston sleeve (hazard) + steel rod
    const foot: [number, number, number] = [s * 3.0, 0.3, z0];
    const dir = new THREE.Vector3(foot[0] - elbow[0], foot[1] - elbow[1], 0).normalize();
    const mid: [number, number, number] = [elbow[0] + dir.x * 0.5, elbow[1] + dir.y * 0.5, z0];
    b.rod(elbow, mid, 0.14, hazard(s), { ...tag, sides: 8 });
    b.rod(mid, foot, 0.075, P.steel, { ...tag, sides: 8 });
    // sleeve end collars
    for (const t of [0.04, 0.96]) {
      const c = new THREE.Vector3(...mid).sub(new THREE.Vector3(...elbow)).multiplyScalar(t).add(new THREE.Vector3(...elbow));
      b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), P.armor, {
        ...tag,
        at: c,
        dir: [dir.x, dir.y, 0],
      });
    }

    // diagonal brace strut from chassis side low to sleeve
    const brace0: [number, number, number] = [s * 1.8, 0.62, z0 + 0.0];
    const brace1: [number, number, number] = [mid[0] + dir.x * 0.05, mid[1] + 0.02, z0];
    b.frustumBox(brace0, brace1, [0.14, 0.14], [0.11, 0.11], { ...tag, color: P.hullDark });
    b.part(new THREE.SphereGeometry(0.075, 6, 4), P.steel, { ...tag, at: brace0 });
    b.part(new THREE.SphereGeometry(0.075, 6, 4), P.steel, { ...tag, at: brace1 });
    // hydraulic hose
    b.sweep(
      catmull([
        [s * 2.1, 1.05, z0 + 0.12],
        [s * 2.4, 1.02, z0 + 0.2],
        [s * 2.6, 0.78, z0 + 0.18],
        [mid[0] + 0.05 * s, mid[1], z0 + 0.14],
      ]),
      0.022,
      { ...tag, color: P.tire, sides: 6 },
    );

    // ball joint at the foot
    b.part(new THREE.SphereGeometry(0.115, 8, 6), P.steel, { ...tag, at: [foot[0], 0.24, z0] });
    b.part(new THREE.CylinderGeometry(0.13, 0.16, 0.07, 8), P.armor, { ...tag, at: [foot[0], 0.17, z0] });

    // foot pad: octagon, tapered base, chevron top, ribs
    b.part(new THREE.CylinderGeometry(0.45, 0.5, 0.1, 8), P.hullDark, {
      ...tag,
      at: [s * 3.0, 0.05, z0],
      rotation: [0, 22.5, 0],
    });
    b.part(new THREE.CylinderGeometry(0.4, 0.45, 0.06, 8), P.armor, {
      ...tag,
      at: [s * 3.0, 0.13, z0],
      rotation: [0, 22.5, 0],
    });
    b.part(new THREE.CircleGeometry(0.36, 8), "#ffffff", {
      ...tag,
      at: [s * 3.0, 0.165, z0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: chevron,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      b.part(new THREE.BoxGeometry(0.22, 0.12, 0.05), P.steel, {
        ...tag,
        at: [s * 3.0 + Math.cos(a) * 0.16, 0.24, z0 + Math.sin(a) * 0.16],
        rotation: [0, (-a * 180) / Math.PI, 0],
      });
    }
    // edge bolts
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), P.steel, {
        ...tag,
        at: [s * 3.0 + Math.cos(a) * 0.38, 0.165, z0 + Math.sin(a) * 0.38],
      });
    }
    void R;
  }
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

  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, flat: true, ...extra });

  // Paints
  const hullPaint = panelled(
    paint((p, n) => {
      const base = mix(P.hull, P.hullDark, 0.5 * noise(p, 0.5, 3));
      const up = smoothstep(0.3, 0.9, n.y);
      return mix(mix(base, "#2a2d20", 0.3 * smoothstep(0.5, -0.5, n.y)), "#7a8260", 0.25 * up);
    }),
    { size: 0.5, aspect: 0.8, rivets: 0.1 },
  );
  const armorPaint = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.4, rivets: 0.08 });
  const mud = paint((p, n) => {
    const m = smoothstep(1.0, 0.6, p.y) * (0.5 + 0.5 * noise(p, 0.3, 5));
    return mix(mix(P.armor, P.hullDark, 0.4), "#4a3d2a", m * 0.7);
  });

  // Stencil / hazard textures
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#17181a"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const stencil = svg(
    `<svg viewBox="0 0 128 48"><text x="64" y="36" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="#e8e8e0">LB-07</text><rect x="4" y="4" width="120" height="3" fill="#e8e8e0"/></svg>`,
    { size: 256 },
  );
  const vent = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#16181a"/>${[3, 9, 15, 21, 27]
      .map((y) => `<rect x="2" y="${y}" width="28" height="3" fill="#555b61"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const decal = (tex: any, w: number, h: number, at: number[], dir: number[], tint = "#ffffff", up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), tint, { bone: body, at, dir, axis: "z", texture: tex, up });

  // Lower tub: sloped sides via loft of stations
  const tub = b.loft(
    [
      { at: [0, 0.85, -4.4], w: 2.8, h: 0.5 },
      { at: [0, 0.95, -3.0], w: 3.0, h: 0.7 },
      { at: [0, 1.0, 0], w: 3.0, h: 0.8 },
      { at: [0, 1.0, 2.0], w: 3.0, h: 0.8 },
      { at: [0, 0.95, 2.55], w: 2.8, h: 0.7 },
    ],
    { bone: body, color: mud, section: "box" },
  );

  // Upper deck as tapered frustum with chamfer plates
  b.frustumBox([0, 1.35, -4.3], [0, 1.35, 2.5], [2.9, 0.5], [2.9, 0.5], { bone: body, color: hullPaint });
  // sloped side armour wedges (chamfers)
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [0.35, 0],
        [0.1, 0.4],
        [0, 0.4],
      ],
      { at: [s * 1.45, 1.1, 0], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.01, color: armorPaint, bone: body },
    ).mesh.visible = false;
    // skirt plates
    for (const z of [1.3, -1.9]) {
      b.part(new THREE.BoxGeometry(0.1, 0.45, 1.5), armorPaint, {
        bone: body,
        at: [s * 1.62, 0.85, z],
        rotation: [0, 0, s * -8],
        flat: true,
      });
      for (let k = -1; k <= 1; k += 2)
        cyl(0.035, 0.035, 0.03, 6, P.steel, [s * 1.69, 0.88, z + k * 0.55], { dir: [s, 0, 0] });
    }
    // hazard edge stripe along deck sides
    decal(hazard, 7.0, 0.14, [s * 1.46, 1.52, -0.9], [s, 0, 0], "#ffffff", [0, 0, 1]);
    // upper-side chamfer wedge
    b.part(new THREE.BoxGeometry(0.3, 0.2, 6.8), P.hullDark, {
      bone: body,
      at: [s * 1.42, 1.55, -0.85],
      rotation: [0, 0, s * -35],
      flat: true,
    });
    // tool boxes
    for (const z of [0.9, -1.8]) {
      box(0.28, 0.35, 0.9, P.armor, [s * 1.62, 1.2, z]);
      box(0.04, 0.2, 0.6, P.steel, [s * 1.78, 1.2, z]);
      box(0.05, 0.05, 0.14, P.trim, [s * 1.8, 1.28, z]);
    }
    // stabiliser hinge plates
    for (const z of [-0.4, -3.0]) {
      box(0.14, 0.5, 0.6, P.steel, [s * 1.68, 0.9, z]);
      for (const dy of [-0.15, 0.15])
        for (const dz of [-0.2, 0.2])
          cyl(0.03, 0.03, 0.04, 6, P.armor, [s * 1.77, 0.9 + dy, z + dz], { dir: [s, 0, 0] });
    }
    // axle housings
    for (const z of [2.6, -0.4, -3.4]) {
      b.part(new THREE.CylinderGeometry(0.17, 0.17, 2.6, 8), P.armor, {
        bone: body, at: [0, 0.55, z], dir: [1, 0, 0], flat: true,
      });
      cyl(0.26, 0.26, 0.3, 8, P.hullDark, [s * 1.1, 0.55, z], { dir: [1, 0, 0] });
      // wheel arch: wedge roof with side cheeks
      box(0.6, 0.1, 1.6, P.armor, [s * 1.5, 1.2, z]);
      box(0.08, 0.3, 1.5, P.hullDark, [s * 1.3, 1.05, z]);
    }
    // tow hooks
    for (const z of [-4.55, 2.62]) {
      box(0.12, 0.14, 0.12, P.steel, [s * 1.05, 0.8, z + (z > 0 ? 0.05 : -0.05)]);
      b.torus ? null : null;
      b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.trim, {
        bone: body, at: [s * 1.05, 0.8, z + (z > 0 ? 0.15 : -0.15)], flat: true,
      });
    }
    // exhaust stacks
    cyl(0.11, 0.13, 0.7, 8, P.armor, [s * 1.2, 2.0, -3.7]);
    cyl(0.14, 0.14, 0.06, 8, P.steel, [s * 1.2, 2.38, -3.7]);
    cyl(0.09, 0.09, 0.02, 8, "#0a0a0a", [s * 1.2, 2.4, -3.7]);
    box(0.28, 0.1, 0.28, P.hullDark, [s * 1.2, 1.7, -3.7]);
    // rear lamps
    glow(box(0.3, 0.12, 0.05, P.warnRed, [s * 1.2, 1.1, -4.53]), 1.4);
  }
  // Deck tint patches / stencil
  decal(stencil, 1.1, 0.42, [0, 1.605, -2.2], [0, 1, 0], "#ffffff", [0, 0, 1]);
  decal(stencil, 0.9, 0.34, [1.51, 1.3, 1.5], [1, 0, 0]);
  decal(stencil, 0.9, 0.34, [-1.51, 1.3, 1.5], [-1, 0, 0]);

  // Engine deck at rear with vents
  box(2.5, 0.3, 1.5, P.hullDark, [0, 1.75, -3.55], { flat: true });
  box(2.2, 0.1, 1.2, P.armor, [0, 1.93, -3.55]);
  decal(vent, 1.0, 0.8, [-0.55, 1.985, -3.55], [0, 1, 0], "#ffffff", [0, 0, 1]);
  decal(vent, 1.0, 0.8, [0.55, 1.985, -3.55], [0, 1, 0], "#ffffff", [0, 0, 1]);
  for (const z of [-2.85, -4.25]) box(2.4, 0.08, 0.06, P.trim, [0, 1.92, z]);
  box(2.5, 0.18, 0.1, P.hullDark, [0, 1.6, -4.52]);
  // rear ramp-light bar
  box(2.2, 0.14, 0.08, P.armor, [0, 1.25, -4.54]);
  glow(box(1.9, 0.07, 0.04, P.warnRed, [0, 1.25, -4.6]), 1.5);
  decal(hazard, 2.6, 0.2, [0, 0.92, -4.53], [0, 0, -1]);
  // rear ramp panel
  box(2.2, 0.5, 0.06, P.armor, [0, 0.9, -4.5]);

  // Front deck slope / cab interface plate
  b.part(new THREE.BoxGeometry(3.0, 0.2, 0.3), P.armor, { bone: body, at: [0, 1.5, 2.45], flat: true });
  box(2.9, 0.5, 0.1, P.hullDark, [0, 1.1, 2.52]);

  // Turntable ring base at z = -1
  const ringAt = [0, 1.55, -1];
  b.lathe(
    [
      [0, 0], [1.05, 0], [1.05, 0.08], [0.95, 0.12], [0.95, 0.2], [0, 0.2],
    ],
    { at: [0, 1.5, -1], segments: 16, color: armorPaint, bone: body },
  );
  b.lathe(
    [
      [0.9, 0.2], [1.1, 0.2], [1.1, 0.3], [0.9, 0.3],
    ],
    { at: [0, 1.5, -1], segments: 24, color: P.steel, bone: body },
  );
  // gear teeth marks
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.07, 0.08, 0.08), P.armor, {
      bone: body,
      at: [Math.sin(a) * 1.12, 1.74, -1 + Math.cos(a) * 1.12],
      rotation: [0, (a * 180) / Math.PI, 0],
      flat: true,
    });
  }
  // hazard ring stripe
  b.lathe(
    [
      [1.1, 0.0], [1.14, 0.0], [1.14, 0.1], [1.1, 0.1],
    ],
    { at: [0, 1.5, -1], segments: 24, color: P.trim, bone: body },
  );
  // deck rivet bumps
  const merged: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 28; i++) {
    const x = (R() - 0.5) * 2.6;
    const z = -2.4 + R() * 4.4 - 0.0;
    if (Math.hypot(x, z + 1) < 1.3 || z > 2.3) continue;
    merged.push(new THREE.CylinderGeometry(0.03, 0.035, 0.03, 6).translate(x, 1.61, z));
  }
  if (merged.length) {
    const g = merged.map((m) => m);
    // add individually (few) to avoid import of merge utility
    g.forEach((geo) => b.part(geo, P.steel, { bone: body, at: [0, 0, 0], flat: true }));
  }
  // side beacon rails & hand grabs
  for (const s of [1, -1]) {
    b.rod([s * 1.2, 1.65, 1.2], [s * 1.2, 1.65, 2.3], 0.025, P.steel, { bone: body });
    b.rod([s * 1.2, 1.6, 1.2], [s * 1.2, 1.65, 1.2], 0.025, P.steel, { bone: body });
    b.rod([s * 1.2, 1.6, 2.3], [s * 1.2, 1.65, 2.3], 0.025, P.steel, { bone: body });
  }
  // underbelly skid
  box(2.2, 0.12, 6.4, P.armor, [0, 0.66, -0.9], { flat: true });
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, rng, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(11);

  // ---------- textures ----------
  const VISOR = svg(
    `<svg viewBox="0 0 128 40"><rect width="128" height="40" fill="#1b3a48"/>
    <rect x="3" y="3" width="122" height="34" fill="#102a36" stroke="#0a1a22" stroke-width="2"/>
    <path d="M8 12H50M8 20H36M8 28H58" stroke="#2ff3ff" stroke-width="3"/>
    <path d="M78 10H120M90 18H120M78 26H112" stroke="#2ff3ff" stroke-width="3" opacity="0.8"/>
    <circle cx="68" cy="20" r="6" fill="none" stroke="#2ff3ff" stroke-width="2.5"/>
    <path d="M0 40L40 0H56L16 40Z" fill="#ffffff" opacity="0.1"/></svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2f3338" stroke="#e8e8e0" stroke-width="4"/>
    <path d="M32 10L50 40H14Z" fill="#e7b814"/><path d="M32 22L42 40H22Z" fill="#2f3338"/>
    <rect x="29" y="44" width="6" height="10" fill="#d6342a"/></svg>`,
    { size: 128 },
  );
  const CHEV = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    <path d="M0 0L8 0L16 8L8 16L0 16L8 8Z M16 0L24 0L32 8L24 16L16 16L24 8Z M32 0L40 0L48 8L40 16L32 16L40 8Z M48 0L56 0L64 8L56 16L48 16L56 8Z" fill="#17181a"/></svg>`,
    { size: 128 },
  );
  const SLAT = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#2f3338"/>
    <path d="M4 6H60M4 14H60M4 22H60" stroke="#101214" stroke-width="5"/>
    <path d="M4 4H60M4 12H60M4 20H60" stroke="#555b61" stroke-width="1.5"/></svg>`,
    { size: 128 },
  );

  // ---------- paints ----------
  const HULL = paint((p, n) => {
    const base = mix(P.hull, P.hullDark, smoothstep(0.35, 0.8, noise(p, 0.5, 3)) * 0.6);
    const lit = mix(base, "#8a9270", Math.max(0, n.y) * 0.25);
    const seamX = Math.abs(((p.z * 4) % 1) - 0.5) > 0.485 || Math.abs(((p.y * 5) % 1) - 0.5) > 0.49;
    const mud = smoothstep(1.2, 0.6, p.y) * 0.35;
    const c = seamX ? mix(lit, "#1a1c14", 0.7) : lit;
    return mix(c, "#4a3b2a", mud);
  });
  const ARM = paint((p, n) =>
    mix(P.armor, "#454b52", Math.max(0, n.y) * 0.5 + noise(p, 0.3, 5) * 0.2),
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...opt });

  // ---------- cab body (rear block) ----------
  box(3.0, 1.1, 1.0, HULL, [0, 1.15, 3.1]); // lower rear
  // wedge nose: lower nose frustum sloping forward
  const nose = b.loft(
    [
      { at: [0, 1.0, 3.6], w: 3.1, h: 0.8 },
      { at: [0, 0.98, 4.05], w: 2.9, h: 0.7 },
      { at: [0, 0.95, 4.3], w: 2.6, h: 0.5 },
    ],
    { color: HULL, bone, section: "box" },
  );
  // cabin upper (sloped windscreen) as extrude profile in z/y
  b.extrude(
    [
      [2.6, 1.6],
      [4.05, 1.6],
      [3.7, 2.2],
      [2.6, 2.3],
    ],
    { at: [1.45, 0, 0], x: [0, 0, 1], thickness: 2.9, color: HULL, bone },
  );
  // roof plate
  box(2.9, 0.1, 1.2, ARM, [0, 2.32, 3.15], { rotation: [-3, 0, 0] });
  // roof rim ribs
  for (const s of [1, -1]) box(0.1, 0.14, 1.3, P.armor, [s * 1.4, 2.3, 3.15]);

  // windscreen visor (angled)
  const wsDir = new THREE.Vector3(0, 0.6, 0.35).normalize();
  b.part(new THREE.PlaneGeometry(2.4, 0.62), "#ffffff", {
    bone,
    at: [0, 1.98, 3.9],
    dir: [0, 0.55, 0.75],
    axis: "z",
    texture: VISOR,
  });
  glow(
    b.part(new THREE.PlaneGeometry(2.0, 0.08), P.neonCyan, {
      bone,
      at: [0, 2.2, 3.78],
      dir: [0, 0.55, 0.75],
      axis: "z",
    }),
    1.4,
  );
  // visor frame
  const vf = (w: number, h: number, at: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, 0.06), P.armor, { bone, at, dir: [0, 0.55, 0.75], axis: "z", flat: true });
  vf(2.6, 0.08, [0, 1.7, 3.99]);
  vf(0.08, 0.7, [1.25, 1.98, 3.9]);
  vf(0.08, 0.7, [-1.25, 1.98, 3.9]);

  // side windows with slats
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.5), "#ffffff", {
      bone,
      at: [s * 1.505, 1.95, 3.25],
      dir: [s, 0, 0],
      axis: "z",
      texture: SLAT,
    });
    b.part(new THREE.PlaneGeometry(0.9, 0.5), "#ffffff", {
      bone,
      at: [s * 1.5, 1.95, 3.25],
      dir: [-s, 0, 0],
      axis: "z",
      texture: SLAT,
    });
    // door outline
    const dc = P.hullDark;
    box(0.04, 0.05, 1.0, dc, [s * 1.52, 1.62, 3.1]);
    box(0.04, 0.05, 1.0, dc, [s * 1.52, 1.08, 3.1]);
    box(0.04, 0.55, 0.05, dc, [s * 1.52, 1.35, 2.62]);
    box(0.04, 0.55, 0.05, dc, [s * 1.52, 1.35, 3.6]);
    // handle
    box(0.06, 0.05, 0.22, P.steel, [s * 1.54, 1.42, 3.45]);
    // emblem
    b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
      bone,
      at: [s * 1.525, 1.3, 3.1],
      dir: [s, 0, 0],
      axis: "z",
      texture: EMBLEM,
    });
    // mirror
    box(0.04, 0.04, 0.3, P.armor, [s * 1.7, 1.9, 3.75], { rotation: [0, 0, 0] });
    b.rod([s * 1.52, 1.9, 3.75], [s * 1.8, 2.0, 3.75], 0.025, P.armor, { bone, sides: 6 });
    box(0.08, 0.3, 0.2, P.armor, [s * 1.85, 2.0, 3.75]);
    box(0.02, 0.24, 0.15, P.steel, [s * 1.85, 2.0, 3.75 + 0.0], { rotation: [0, 0, 0] });
    // wheel arch cut-out hints (fender)
    box(0.3, 0.12, 1.5, ARM, [s * 1.48, 0.95, 3.35]);
    // armoured side skirts
    box(0.1, 0.5, 1.5, ARM, [s * 1.52, 0.8, 3.4]);
    // headlights
    glow(box(0.5, 0.26, 0.1, P.lamp, [s * 0.98, 1.1, 4.33]), 1.6);
    box(0.62, 0.34, 0.06, P.armor, [s * 0.98, 1.1, 4.3]);
    // tow hooks
    b.rod([s * 0.6, 0.78, 4.2], [s * 0.6, 0.72, 4.5], 0.045, P.steel, { bone, sides: 6 });
    box(0.14, 0.05, 0.14, P.warnRed, [s * 0.6, 0.72, 4.52]);
    // bull bar uprights
    box(0.1, 0.5, 0.1, P.armor, [s * 1.1, 0.95, 4.42]);
    // front vent grille
    box(0.5, 0.3, 0.05, "#101214", [s * 0.4, 1.45, 4.14]);
  }

  // hood panel + armour plates
  b.extrude(
    [
      [0, 0],
      [1.5, 0],
      [1.5, 0.3],
      [0, 0.12],
    ],
    { at: [1.4, 1.55, 3.95], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.8, color: ARM, bone },
  );
  // hood: replaced with simpler sloped plate
  b.part(new THREE.BoxGeometry(2.7, 0.08, 0.7), ARM, {
    bone,
    at: [0, 1.55, 4.1],
    rotation: [18, 0, 0],
    flat: true,
  });
  // nose lower plate
  box(2.6, 0.12, 0.3, ARM, [0, 0.72, 4.28], { rotation: [-15, 0, 0] });
  // bull bar rails
  box(2.4, 0.12, 0.12, P.armor, [0, 1.15, 4.48]);
  box(2.4, 0.12, 0.12, P.armor, [0, 0.78, 4.48]);
  b.part(new THREE.PlaneGeometry(2.3, 0.1), "#ffffff", {
    bone,
    at: [0, 1.15, 4.55],
    dir: [0, 0, 1],
    axis: "z",
    texture: CHEV,
  });
  b.part(new THREE.PlaneGeometry(2.3, 0.1), "#ffffff", {
    bone,
    at: [0, 0.78, 4.55],
    dir: [0, 0, 1],
    axis: "z",
    texture: CHEV,
  });
  box(0.1, 0.5, 0.1, P.armor, [0, 0.96, 4.48]);
  // rivets on nose
  const rv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 10; i++)
    rv.push(new THREE.SphereGeometry(0.03, 5, 3).translate(-1.2 + i * 0.27, 1.3, 4.16));
  b.part(mergeAll(rv), P.steel, { bone, at: [0, 0, 0] });

  // roof: hazard edge, antenna cluster, sensor dome
  box(2.2, 0.03, 0.12, P.trim, [0, 2.375, 2.75]);
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.05],
      [0.17, 0.2],
      [0.08, 0.28],
      [0, 0.3],
    ],
    { at: [0.7, 2.37, 3.3], bone, segments: 8, color: P.steel },
  );
  glow(box(0.12, 0.05, 0.05, P.neonCyan, [0.7, 2.55, 3.45]), 1.5);
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8), P.armor, { bone, at: [0.7, 2.43, 3.3] });
  for (const [x, z, h] of [
    [-0.8, 2.85, 0.9],
    [-0.5, 2.8, 0.55],
    [-1.1, 3.0, 0.4],
  ] as number[][]) {
    b.rod([x, 2.36, z], [x, 2.36 + h, z], [0.02, 0.008], P.steel, { bone, sides: 6 });
    b.part(new THREE.SphereGeometry(0.04, 5, 4), P.warnRed, { bone, at: [x, 2.38 + h, z] });
  }
  box(0.4, 0.1, 0.3, P.armor, [-0.3, 2.42, 3.4]);
  // roof light bar
  glow(box(1.4, 0.05, 0.06, P.neonCyan, [0, 2.36, 3.7]), 1.2);
  // rear bulkhead armour
  box(3.0, 0.9, 0.12, ARM, [0, 1.9, 2.66]);
  box(2.6, 0.08, 0.2, P.trim, [0, 1.4, 2.7]);
}

function mergeAll(gs: THREE.BufferGeometry[]) {
  const pos: number[] = [];
  const idx: number[] = [];
  let off = 0;
  for (const g of gs) {
    const p = g.getAttribute("position");
    for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
    const ix = g.index!;
    for (let i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  out.setIndex(idx);
  out.computeVertexNormals();
  return out;
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, rng, countershade, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRailgun({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const turret = J.turret;
  const cradle = J.railCradle;

  // ---------- paints & textures ----------
  const HULLP = paint((p, n) => {
    const base = mix(P.hull, P.hullDark, smoothstep(0.35, 0.8, noise(p, 0.5, 3)) * 0.6);
    return mix(base, "#8a9070", Math.max(0, n.y) * 0.25);
  });
  const ARMP = countershade(P.armor, P.hullDark, { level: -0.2 });
  const STEELP = paint((p, n) => mix(P.steel, "#5a6068", smoothstep(0.3, 0.8, noise(p, 0.3, 7)) * 0.7 * (1 - Math.max(0, n.y) * 0.5)));

  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8 - 8} 16 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8 - 4} 16Z" fill="#17181a"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const STENCIL = svg(
    `<svg viewBox="0 0 160 40"><rect width="160" height="40" fill="none"/>` +
      `<text x="6" y="30" font-family="monospace" font-weight="bold" font-size="28" fill="#e8e8e0">LB-01 RAIL</text></svg>`,
    { size: 256 },
  );
  const WARN = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="${P.warnRed}"/><rect x="2" y="2" width="36" height="36" fill="none" stroke="#e8e8e0" stroke-width="2"/>` +
      `<path d="M20 7 L34 32 L6 32Z" fill="#e8e8e0"/><rect x="18.5" y="14" width="3" height="10" fill="${P.warnRed}"/><rect x="18.5" y="26" width="3" height="3" fill="${P.warnRed}"/></svg>`,
    { size: 64 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="#e8e8e0" stroke-width="3"/><path d="M8 28 L32 12 M8 20 L32 20" stroke="${P.trim}" stroke-width="3"/><circle cx="32" cy="20" r="3" fill="${P.neonCyan}"/></svg>`,
    { size: 64 },
  );

  const box = (w: number, h: number, d: number, col: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: opts.bone ?? turret, at, ...opts, flat: true });

  const decalPlane = (tex: THREE.Texture, w: number, h: number, at: number[], dir: number[], bone: any, up?: number[]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir, axis: "z", texture: tex, up });

  // ---------- turret base ----------
  const TY = M.turretRing[1];
  const TZ = M.turretRing[2];
  b.lathe(
    [
      [0, 0],
      [1.25, 0],
      [1.3, 0.05],
      [1.3, 0.12],
      [1.1, 0.5],
      [0.95, 0.8],
      [0, 0.8],
    ],
    { at: [0, TY, TZ], segments: 8, color: HULLP, bone: turret },
  );
  // armour skirt ring
  b.lathe(
    [
      [1.2, 0.02],
      [1.36, 0.02],
      [1.36, 0.2],
      [1.2, 0.2],
    ],
    { at: [0, TY, TZ], segments: 8, color: ARMP, bone: turret },
  );
  // hazard band round the drum
  b.lathe(
    [
      [1.1, 0.3],
      [1.14, 0.3],
      [1.14, 0.44],
      [1.1, 0.44],
    ],
    { at: [0, TY, TZ], segments: 16, color: P.trim, bone: turret },
  );
  // top deck
  b.lathe(
    [
      [0, 0],
      [0.95, 0],
      [0.85, 0.1],
      [0, 0.1],
    ],
    { at: [0, TY + 0.8, TZ], segments: 8, color: ARMP, bone: turret },
  );

  // side armour cheeks (angled wedges)
  for (const s of [1, -1]) {
    box(0.22, 0.7, 1.7, ARMP, [s * 1.05, TY + 0.55, TZ + 0.05], { rotation: [0, 0, s * -10] });
    box(0.12, 0.45, 1.2, P.hullDark, [s * 1.18, TY + 0.5, TZ + 0.05], { rotation: [0, 0, s * -10] });
    // rivets
    for (let i = 0; i < 4; i++)
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6), P.steel, {
        bone: turret,
        at: [s * 1.28, TY + 0.7, TZ - 0.6 + i * 0.4],
        dir: [s, 0, 0],
      });
    // emblem on cheek
    decalPlane(EMBLEM, 0.4, 0.4, [s * 1.285, TY + 0.55, TZ + 0.1], [s, 0, 0], turret);
  }
  // front glacis wedge & rear box
  box(1.5, 0.35, 0.5, HULLP, [0, TY + 0.55, TZ + 1.0], { rotation: [-18, 0, 0] });
  box(1.6, 0.55, 0.6, HULLP, [0, TY + 0.55, TZ - 1.0]);

  // crew hatch
  b.lathe(
    [
      [0, 0],
      [0.32, 0],
      [0.28, 0.1],
      [0, 0.1],
    ],
    { at: [-0.5, TY + 0.9, TZ - 0.3], segments: 8, color: ARMP, bone: turret },
  );
  b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 8), P.steel, { bone: turret, at: [-0.5, TY + 1.0, TZ - 0.3], dir: [0, 1, 0], axis: "z" });
  box(0.1, 0.05, 0.1, P.trim, [-0.5, TY + 1.02, TZ - 0.3]);

  // sensor pod
  const podAt = [0.6, TY + 0.95, TZ + 0.5];
  box(0.12, 0.2, 0.12, P.steel, [0.6, TY + 0.9, TZ + 0.5]);
  b.part(new THREE.SphereGeometry(0.2, 8, 6), P.armor, { bone: turret, at: [podAt[0], podAt[1] + 0.2, podAt[2]], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone: turret, at: [podAt[0], podAt[1] + 0.22, podAt[2] + 0.17] }), 1.6);
  b.rod([0.85, TY + 0.9, TZ - 0.5], [0.85, TY + 1.7, TZ - 0.5], 0.015, P.steel, { bone: turret });
  b.part(new THREE.SphereGeometry(0.04, 5, 4), P.warnRed, { bone: turret, at: [0.85, TY + 1.72, TZ - 0.5] });

  // ---------- cradle ----------
  const RY = 2.75; // rail axis height
  const z0 = M.railBreech[2];
  const z1 = M.railMuzzle[2];
  const RX = 0.42;

  // cradle yoke blocks sitting on turret
  box(1.5, 0.35, 1.8, HULLP, [0, 2.3 - 0.05, TZ], { bone: cradle });
  for (const s of [1, -1]) {
    box(0.3, 0.55, 1.6, ARMP, [s * 0.65, 2.45, TZ], { bone: cradle });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.16, 8), P.steel, { bone: cradle, at: [s * 0.77, 2.55, TZ], dir: [s, 0, 0] });
  }

  // rails
  for (const s of [1, -1]) {
    const rail = b.rod([s * RX, RY, z0], [s * RX, RY, z1 - 0.2], 0.1, STEELP, { bone: cradle, section: "box" });
    // glowing cyan strips on the inner faces
    glow(box(0.03, 0.06, z1 - z0 - 0.5, P.neonCyan, [s * (RX - 0.1), RY + 0.02, (z0 + z1) / 2 - 0.1], { bone: cradle }), 1.8);
    // top & outer slim strip
    glow(box(0.05, 0.02, z1 - z0 - 1.5, P.neonCyan, [s * RX, RY + 0.105, (z0 + z1) / 2 - 0.2], { bone: cradle }), 1.4);
    // outer plate
    box(0.04, 0.18, z1 - z0 - 1, P.armor, [s * (RX + 0.12), RY - 0.02, (z0 + z1) / 2 - 0.2], { bone: cradle });
  }
  // spacer blocks every 0.6 m
  for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.6) {
    box(RX * 2 - 0.1, 0.16, 0.2, P.hullDark, [0, RY, z], { bone: cradle });
    box(RX * 2 + 0.3, 0.05, 0.08, P.trim, [0, RY - 0.14, z], { bone: cradle });
  }
  // support struts from cradle up to rails
  for (const z of [-1.9, -0.6, 0.7]) {
    for (const s of [1, -1]) {
      box(0.12, 0.45, 0.22, ARMP, [s * 0.45, 2.52, z], { bone: cradle });
    }
  }
  // barrel shroud middle section with hazard bands and text
  const shZ0 = -0.2, shZ1 = 2.2;
  box(0.7, 0.3, shZ1 - shZ0, ARMP, [0, RY + 0.02, (shZ0 + shZ1) / 2], { bone: cradle });
  for (const z of [shZ0 + 0.1, shZ1 - 0.1]) {
    b.part(new THREE.BoxGeometry(0.74, 0.34, 0.16), "#ffffff", { bone: cradle, at: [0, RY + 0.02, z], texture: HAZ, flat: true });
  }
  decalPlane(STENCIL, 1.2, 0.3, [0.356, RY + 0.02, 1.2], [1, 0, 0], cradle, [0, 1, 0]);
  const stRot = decalPlane(STENCIL, 1.2, 0.3, [-0.356, RY + 0.02, 1.2], [-1, 0, 0], cradle, [0, 1, 0]);
  // top plate with warning label
  decalPlane(WARN, 0.2, 0.2, [0, RY + 0.175, 0.2], [0, 1, 0], cradle, [0, 0, 1]);
  // coolant tubes along the sides
  for (const s of [1, -1]) {
    b.rod([s * 0.28, RY + 0.22, -0.8], [s * 0.28, RY + 0.22, 3.2], 0.04, P.steel, { bone: cradle });
    b.rod([s * 0.2, RY + 0.27, -0.8], [s * 0.2, RY + 0.27, 3.0], 0.025, P.warnRed, { bone: cradle });
    for (const z of [0.4, 1.6, 2.8]) b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6), P.trim, { bone: cradle, at: [s * 0.28, RY + 0.22, z], dir: [0, 0, 1] });
  }

  // muzzle brake
  box(0.95, 0.42, 0.5, P.armor, [0, RY, z1 - 0.2], { bone: cradle });
  for (const s of [1, -1]) {
    box(0.08, 0.5, 0.3, P.hullDark, [s * 0.5, RY, z1 - 0.2], { bone: cradle });
    for (const dz of [-0.12, 0.12]) box(0.1, 0.3, 0.05, P.steel, [s * 0.5, RY, z1 - 0.2 + dz], { bone: cradle });
  }
  box(0.9, 0.08, 0.5, P.trim, [0, RY + 0.25, z1 - 0.2], { bone: cradle });
  // emitter ring
  glow(b.part(new THREE.TorusGeometry(0.34, 0.04, 4, 8), P.neonCyan, { bone: cradle, at: [0, RY, z1 + 0.06], dir: [0, 0, 1], axis: "z" }), 2);
  glow(b.part(new THREE.TorusGeometry(0.25, 0.025, 4, 8), P.neonCyan, { bone: cradle, at: [0, RY, z1 - 0.46], dir: [0, 0, 1], axis: "z" }), 1.6);

  // ---------- capacitor bank at rear ----------
  const caps: number[][] = [];
  const cz = [-3.0, -3.6, -4.1 + 0.05];
  box(1.9, 0.12, 1.5, ARMP, [0, 2.38, -3.45], { bone: cradle });
  box(0.2, 0.3, 1.5, HULLP, [0, 2.25, -3.45], { bone: cradle });
  const capR = 0.24;
  const positions: number[][] = [];
  for (const x of [-0.6, 0, 0.6]) for (const z of [-3.85, -3.1]) positions.push([x, z]);
  positions.forEach(([x, z], i) => {
    const h = 0.75;
    const y0 = 2.44;
    b.part(new THREE.CylinderGeometry(capR, capR, h, 8), i % 2 ? P.hullDark : P.armor, { bone: cradle, at: [x, y0 + h / 2, z], flat: true });
    // glowing bands
    for (const dy of [0.2, 0.55]) {
      glow(b.part(new THREE.CylinderGeometry(capR + 0.012, capR + 0.012, 0.07, 8), P.neonCyan, { bone: cradle, at: [x, y0 + dy, z] }), 1.8);
    }
    b.part(new THREE.CylinderGeometry(capR * 0.6, capR * 0.6, 0.08, 6), P.steel, { bone: cradle, at: [x, y0 + h + 0.04, z] });
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 5), P.trim, { bone: cradle, at: [x, y0 + h + 0.12, z] });
    // warning label on the outer side
    const side = z < -3.5 ? -1 : 1;
    decalPlane(WARN, 0.16, 0.16, [x, y0 + 0.38, z + (z < -3.5 ? -capR - 0.012 : capR + 0.012)], [0, 0, z < -3.5 ? -1 : 1], cradle);
    caps.push([x, y0 + h + 0.1, z]);
  });
  // bus bars + swept cabling between capacitor tops
  for (const z of [-3.85, -3.1]) {
    box(1.5, 0.05, 0.1, P.steel, [0, 3.24, z], { bone: cradle });
  }
  for (let i = 0; i < 3; i++) {
    const a = [positions[i * 2][0], 3.28, -3.85];
    const c = [positions[i * 2][0], 3.28, -3.1];
    b.sweep(
      [a, [a[0], 3.5, -3.65], [c[0], 3.5, -3.3], c],
      0.025,
      { bone: cradle, color: P.warnRed, sides: 5 },
    );
  }
  // cable from capacitor stack to rail breech
  for (const s of [1, -1]) {
    b.sweep(
      [[s * 0.6, 2.9, -3.1], [s * 0.55, 3.0, -2.9], [s * RX, 3.0, -2.75], [s * RX, RY + 0.1, z0 + 0.1]],
      0.035,
      { bone: cradle, color: P.hullDark, sides: 6 },
    );
  }
  // breech block joining rails
  box(1.2, 0.35, 0.4, P.armor, [0, RY, z0 - 0.0], { bone: cradle });
  glow(box(0.9, 0.05, 0.05, P.neonCyan, [0, RY + 0.19, z0 + 0.22], { bone: cradle }), 1.6);
  // rear end cap hazard
  b.part(new THREE.BoxGeometry(1.9, 0.14, 0.12), "#ffffff", { bone: cradle, at: [0, 2.38, -4.14], texture: HAZ, flat: true });
  // rear lamp
  b.part(new THREE.SphereGeometry(0.05, 5, 4), P.warnRed, { bone: cradle, at: [0.8, 2.5, -4.18] });
  b.part(new THREE.SphereGeometry(0.05, 5, 4), P.warnRed, { bone: cradle, at: [-0.8, 2.5, -4.18] });
}
```
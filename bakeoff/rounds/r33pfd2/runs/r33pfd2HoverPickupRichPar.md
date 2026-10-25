<!-- call: plan -->

```json
{
  "name": "Hoverjack Technical",
  "description": "A militarized pickup truck converted to run on four downward-firing hover thrusters, low-poly cyberpunk with neon underglow, armor plating and a bed-mounted rocket pod.",
  "builderName": "hoverjackTechnical",
  "size": [2.5, 2.2, 5.6],
  "layout": "A boxy armored pickup floating about 0.35 m above the floor on four glowing thruster pods, one at each former wheel position. Front (+Z): angular sloped hood with a bull-bar bumper, a slit of cyan headlights and a roof-mounted light bar. Middle: a chunky two-door cab with slanted tinted glass, hex-painted armor plates and a roof rack. Back: an open cargo bed with ribbed walls, a roll cage and a rocket pod on a pivot. Underneath: a flat skid plate with magenta neon underglow strips; four ducted thruster nacelles with cyan glowing rings hang from short pylons at the corners. Style: faceted low-poly slabs, bevelled edges, dark gunmetal hull with yellow hazard trim, neon cyan and magenta glow on lights, thruster cores, underglow and decals (kanji and barcode SVG decals on the doors and tailgate). Only the thruster pods nearly touch the floor (lowest points sit at y=0), the hull floats above.",
  "palette": {
    "hull": "#3a414d",
    "hullDark": "#20242c",
    "armor": "#566070",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "glass": "#17283a",
    "rubber": "#15161a",
    "metal": "#8a93a3",
    "rust": "#7a4a2e",
    "white": "#e8ecf2",
    "red": "#d8283a"
  },
  "mounts": {
    "hullTop": [0, 1.0, 0],
    "cabFloor": [0, 1.0, 0.3],
    "bedFloor": [0, 0.95, -1.7],
    "frontAxle": [0, 0.55, 1.7],
    "rearAxle": [0, 0.55, -1.7],
    "thrusterFL": [1.05, 0.55, 1.7],
    "thrusterFR": [-1.05, 0.55, 1.7],
    "thrusterRL": [1.05, 0.55, -1.7],
    "thrusterRR": [-1.05, 0.55, -1.7],
    "podPivot": [0, 1.55, -1.9],
    "roofTop": [0, 2.0, 0.2]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "thrusterFL", "parent": "body", "at": [1.05, 0.55, 1.7], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterFR", "parent": "body", "at": [-1.05, 0.55, 1.7], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRL", "parent": "body", "at": [1.05, 0.55, -1.7], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRR", "parent": "body", "at": [-1.05, 0.55, -1.7], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "podPivot", "parent": "body", "at": [0, 1.55, -1.9], "dir": [0, 0, 1], "role": "hinge", "group": "weapon" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Lower hull: flat skid plate with magenta underglow strips (glow), side sills with yellow hazard-stripe paint, front bumper with bull-bar and tow hooks, rear bumper, wheel-arch-style cutouts as dark inset panels around the thruster mounts, pylon struts reaching down to each thruster mount, exhaust vents, panelled gunmetal paint on the lower body.",
      "box": [[-1.15, 0.45, -2.8], [1.15, 1.0, 2.8]],
      "attaches": "Cab sits on cabFloor, bed on bedFloor; thruster pylons end at thrusterFL/FR/RL/RR mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Front body: sloped faceted hood with vents and a hazard-striped scoop, fenders, grille with cyan headlight slits (glow), two-door cab with slanted tinted glass windshield and side windows, armor plates with hex paint, door decals (SVG kanji and barcode), side mirrors, roof with roof rack and neon light bar (glow), antenna, interior seats and dashboard hints visible through glass.",
      "box": [[-1.2, 1.0, -0.9], [1.2, 2.2, 2.8]],
      "attaches": "Rests on chassis at cabFloor; rear wall of cab meets the bed at z=-0.9; roof rack at roofTop.",
      "joints": ["body"],
      "floor": false,
      "budget": 200
    },
    {
      "id": "bed",
      "builds": "Open cargo bed behind the cab: floor at bedFloor, ribbed side walls and tailgate with barcode/warning SVG decals, yellow trim caps, roll cage bars of rods, tail lights (red glow), spare fuel canisters and crates strapped in, tie-down hooks, rear light strips in magenta (glow), tailgate hinge.",
      "box": [[-1.2, 0.95, -2.8], [1.2, 1.9, -0.9]],
      "attaches": "Floor sits on chassis at bedFloor; front wall abuts the cab at z=-0.9; the rocket pod sits above it at podPivot.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "thrusters",
      "builds": "Four ducted hover thruster nacelles, one per corner, each on its own joint: octagonal lathe shroud in armor metal with hazard-stripe rim, inner fan of blades, glowing cyan core disc and downward glow ring (glow), short upper pylon bracket reaching the hull, vent fins, small rivet details, scorch paint at the bottom. Lowest points of the nacelles sit on y=0.",
      "box": [[-1.25, 0.0, -2.1], [1.25, 0.8, 2.1]],
      "attaches": "Each nacelle centres on its thruster mount and rides the matching joint; brackets reach up to the chassis pylon ends.",
      "joints": ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "rocketPod",
      "builds": "Bed-mounted weapon on podPivot: swivel base ring and pedestal, tilted 6-tube rocket launcher box with red-tipped rockets and glowing tube rims, armored shield plate, ammo belt of small boxes, a targeting sensor with a cyan lens and a small SVG skull decal, yellow warning chevrons.",
      "box": [[-0.6, 1.4, -2.7], [0.6, 2.1, -1.1]],
      "attaches": "Base stands on bedFloor at podPivot, rides the podPivot joint so it can rotate.",
      "joints": ["podPivot"],
      "floor": false,
      "budget": 140
    }
  ]
}
```

<!-- call: thrusters -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildThrusters({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const names = ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"] as const;

  const hazard = svg(
    `<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#e7b814"/>${Array.from(
      { length: 8 },
      (_, i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#15161a"/>`,
    ).join("")}</svg>`,
    { size: 256 },
  );

  const shroudPaint = paint((p, n) => {
    const base: [number, number, number] = [0.34, 0.38, 0.44];
    const scorch = smoothstep(0.3, 0.02, p.y);
    const wear = noise(p, 0.12, 3);
    let c = mix(base, [0.2, 0.22, 0.27], wear * 0.5);
    c = mix(c, [0.06, 0.05, 0.05], scorch * (0.5 + wear * 0.5));
    const k = 0.85 + 0.15 * n.y;
    return [c[0] * k, c[1] * k, c[2] * k];
  });

  const fanGeo = (r: number) => {
    const g = new THREE.BoxGeometry(r, 0.012, r * 0.28);
    g.translate(r / 2, 0, 0);
    return g;
  };

  for (const name of names) {
    const j = J[name];
    const m = M[name];
    const sx = Math.sign(m[0]);
    const cx = m[0];
    const cz = m[2];
    const cy = 0.4; // center height of nacelle
    const at = (dx: number, y: number, dz: number): [number, number, number] => [cx + dx, y, cz + dz];

    // octagonal shroud (shell: outer and inner wall)
    b.lathe(
      [
        [0.42, -0.4],
        [0.5, -0.36],
        [0.52, 0.3],
        [0.46, 0.4],
        [0.38, 0.4],
        [0.4, 0.28],
        [0.4, -0.3],
        [0.36, -0.4],
      ],
      { at: at(0, cy, 0), segments: 8, bone: j, color: shroudPaint, spin: 22.5 },
    );
    // hazard stripe rim
    b.part(new THREE.CylinderGeometry(0.535, 0.535, 0.07, 8, 1, true), "#ffffff", {
      bone: j,
      at: at(0, cy + 0.27, 0),
      texture: hazard,
      rotation: [0, 22.5, 0],
    });
    // lower glow ring
    glow(
      b.lathe(
        [
          [0.34, 0],
          [0.4, 0],
          [0.4, 0.025],
          [0.34, 0.025],
        ],
        { at: at(0, 0.02, 0), segments: 8, bone: j, color: P.neonCyan, spin: 22.5 },
      ),
      1.6,
    );
    // core disc
    glow(
      b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 8), P.neonCyan, { bone: j, at: at(0, 0.12, 0) }),
      1.3,
    );
    // hub + fan blades
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), P.hullDark, { bone: j, at: at(0, 0.2, 0) });
    for (let i = 0; i < 8; i++) {
      b.part(fanGeo(0.3), P.metal, {
        bone: j,
        at: at(0, 0.24, 0),
        rotation: [14, i * 45, 0],
      });
    }
    // struts across duct
    for (const a of [0, 90]) {
      b.part(new THREE.BoxGeometry(0.8, 0.02, 0.03), P.hullDark, { bone: j, at: at(0, 0.5, 0), rotation: [0, a, 0] });
    }
    // vent fins on outer side
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.04, 0.05, 0.2), P.hullDark, {
        bone: j,
        at: at(sx * 0.53, 0.3 + i * 0.1 - 0.05, 0),
      });
    }
    // rivets
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      b.part(new THREE.SphereGeometry(0.018, 5, 4), P.trim, {
        bone: j,
        at: at(Math.sin(a) * 0.5, 0.12, Math.cos(a) * 0.5),
      });
    }
    // pylon bracket up to hull: inboard
    const inX = cx - sx * 0.55;
    b.rod(at(sx * -0.45, 0.62, 0), [inX - sx * 0.1, 0.84, cz], 0.05, P.armor, { bone: j });
    b.part(new THREE.BoxGeometry(0.16, 0.12, 0.34), P.armor, { bone: j, at: [inX - sx * 0.1, 0.8, cz] });
    b.part(new THREE.BoxGeometry(0.14, 0.03, 0.36), P.trim, { bone: j, at: [inX - sx * 0.1, 0.875, cz] });
    // front/back tie struts
    const fz = Math.sign(cz);
    b.rod(at(0, 0.7, fz * 0.4), [cx - sx * 0.5, 0.82, cz + fz * 0.15], 0.03, P.hullDark, { bone: j });
    // underside tiny emitter pads
    for (const d of [-1, 1]) {
      glow(b.part(new THREE.BoxGeometry(0.06, 0.02, 0.06), P.neonMagenta, { bone: j, at: at(d * 0.2, 0.02, 0.3 * d + 0 * R()) }), 1.2);
    }
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, countershade } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...opts });

  const hullPaint = paint((p, n) => {
    const cell = noise(p, 0.12, 3);
    const base = mix(P.hull, P.armor, smoothstep(0.35, 0.7, cell) * 0.6);
    return mix(base, P.hullDark, smoothstep(0.2, -0.8, n.y) * 0.5);
  });

  // textures
  const kanji = svg(`<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" fill="none" stroke="#2ff3ff" stroke-width="3"/><text x="32" y="46" text-anchor="middle" font-size="40" font-weight="bold" fill="#2ff3ff">電</text></svg>`, { size: 128 });
  const barcode = svg(`<svg viewBox="0 0 64 24">${Array.from({ length: 16 }, (_, i) => `<rect x="${2 + i * 3.8}" y="2" width="${1 + (i % 3)}" height="20" fill="#e8ecf2"/>`).join("")}</svg>`, { size: 128 });
  const hazard = paint((p) => ((Math.floor((p.x + p.z) / 0.12) & 1) ? P.trim : P.hullDark));
  const glassTex = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#17283a"/><path d="M0 32 L20 0 L28 0 L8 32Z M30 32 L50 0 L56 0 L36 32Z" fill="#3a6a8a" opacity="0.5"/></svg>`, { size: 128 });

  // hood: sloped wedge
  b.extrude([[0, 0], [1.9, 0], [1.9, 0.3], [0.2, 0.55], [0, 0.55]], {
    at: [-0.0, 1.0, 0.95], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, color: hullPaint, bone, name: "hood",
  }).mesh.position.x += 0;
  // extrude thickness is along x*y; center ok
  for (const s of [1, -1]) {
    // fenders
    box(0.3, 0.45, 1.5, hullPaint, [s * 1.05, 1.25, 1.85]);
    box(0.06, 0.04, 1.5, P.trim, [s * 1.05, 1.49, 1.85]);
    // vents on hood
    for (let i = 0; i < 4; i++) box(0.3, 0.02, 0.04, P.hullDark, [s * 0.55, 1.53 - i * 0.0, 1.4 + i * 0.12 - 0.0]);
    // headlights
    glow(box(0.5, 0.07, 0.04, P.neonCyan, [s * 0.65, 1.38, 2.8]), 1.6);
    // mirrors
    box(0.14, 0.16, 0.08, P.hullDark, [s * 1.28, 1.75, 0.55]);
    b.rod([s * 1.2, 1.7, 0.55], [s * 1.28, 1.75, 0.55], 0.015, P.metal, { bone });
    // doors
    box(0.05, 0.55, 1.0, hullPaint, [s * 1.2, 1.42, 0.0]);
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone, at: [s * 1.235, 1.45, 0.05], dir: [s, 0, 0], axis: "z", texture: kanji });
    b.part(new THREE.PlaneGeometry(0.5, 0.2), "#ffffff", { bone, at: [s * 1.235, 1.2, -0.3], dir: [s, 0, 0], axis: "z", texture: barcode });
    // side windows
    b.part(new THREE.PlaneGeometry(1.4, 0.45), "#ffffff", { bone, at: [s * 1.205, 1.95, 0.3], dir: [s, 0, 0], axis: "z", texture: glassTex });
    // armor plate
    box(0.04, 0.3, 0.5, P.armor, [s * 1.24, 1.15, 0.4]);
    // pillars
    box(0.08, 0.7, 0.08, P.hullDark, [s * 1.1, 1.9, 0.95]);
    box(0.08, 0.7, 0.08, P.hullDark, [s * 1.1, 1.9, -0.8]);
    // seats
    box(0.4, 0.5, 0.3, P.rubber, [s * 0.4, 1.35, -0.45]);
    box(0.4, 0.15, 0.4, P.rubber, [s * 0.4, 1.15, -0.2]);
    // bull bar posts
    box(0.06, 0.4, 0.06, P.metal, [s * 0.5, 1.2, 2.85]);
    // rack rails
    b.rod([s * 0.85, 2.12, -0.6], [s * 0.85, 2.12, 0.9], 0.02, P.metal, { bone });
  }
  // cab body
  box(2.3, 0.6, 1.9, hullPaint, [0, 1.35, 0.0]);
  // cab roof
  box(2.2, 0.08, 1.5, hullPaint, [0, 2.2 - 0.04, 0.05]);
  box(2.0, 0.04, 0.04, P.trim, [0, 2.2, 0.8]);
  // windshield slanted
  b.part(new THREE.PlaneGeometry(2.1, 0.75), "#ffffff", { bone, at: [0, 1.85, 0.97], dir: [0, 0.55, 0.85], axis: "z", texture: glassTex });
  // rear wall
  box(2.3, 0.9, 0.06, P.hullDark, [0, 1.65, -0.87]);
  box(2.2, 0.06, 0.06, P.hullDark, [0, 1.38, 0.98]);
  // dashboard
  box(1.9, 0.12, 0.35, P.rubber, [0, 1.5, 0.75]);
  glow(box(0.4, 0.06, 0.02, P.neonCyan, [0.4, 1.57, 0.6]), 1.2);
  // grille
  box(1.7, 0.4, 0.06, P.hullDark, [0, 1.25, 2.8]);
  box(2.0, 0.1, 0.12, P.metal, [0, 1.08, 2.8]);
  // hazard scoop
  b.part(new THREE.BoxGeometry(0.6, 0.12, 0.5), hazard, { bone, at: [0, 1.56, 1.9], flat: true });
  // roof rack
  for (let i = 0; i < 4; i++) b.rod([-0.85, 2.12, -0.6 + i * 0.5], [0.85, 2.12, -0.6 + i * 0.5], 0.015, P.metal, { bone });
  // light bar
  glow(box(1.5, 0.08, 0.1, P.neonCyan, [0, 2.17, 0.85]), 1.8);
  box(1.6, 0.05, 0.14, P.hullDark, [0, 2.12, 0.85]);
  // antenna
  b.rod([-0.95, 2.2, -0.5], [-0.95, 2.2 + 0.0, -0.5], 0.01, P.metal, { bone });
  b.spike([-0.95, 2.1, -0.55], [0, 1, 0], 0.1, 0.012, { color: P.metal, bone });
  // hex-ish decals on roof
  box(0.6, 0.01, 0.4, P.armor, [0.5, 2.21, -0.3]);
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBed({ b, J, P, M }: any) {
  const body = J.body;
  const X0 = 1.2, Z0 = -2.8, Z1 = -0.9, FY = 0.98;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...extra });

  const bedPaint = paint((p, n) => {
    const k = noise(p, 0.12, 4);
    const base = mix(P.hull, P.hullDark, smoothstep(0.3, 0.8, k) * 0.6);
    return n.y > 0.7 ? mix(base, P.armor, 0.3) : base;
  });

  // floor
  box(2.36, 0.06, 1.9, bedPaint, [0, FY, (Z0 + Z1) / 2]);
  box(2.0, 0.01, 1.6, P.rubber, [0, FY + 0.035, -1.85]);

  // magenta strips under rear
  glow(box(2.0, 0.03, 0.04, P.neonMagenta, [0, FY - 0.04, Z0 + 0.02]), 1.5);

  // barcode / warning decals
  const barcode = svg(`<svg viewBox="0 0 80 30"><rect width="80" height="30" fill="#e8ecf2"/>${
    Array.from({ length: 20 }, (_, i) => `<rect x="${3 + i * 3.7}" y="3" width="${1 + (i * 7) % 3}" height="19" fill="#111"/>`).join("")
  }<text x="40" y="28" font-size="6" text-anchor="middle" fill="#111">HJ-0457-TECH</text></svg>`, { size: 256 });
  const warn = svg(`<svg viewBox="0 0 64 64"><path d="M32 4 L62 58 H2Z" fill="#e7b814" stroke="#111" stroke-width="4"/><rect x="29" y="22" width="6" height="20" fill="#111"/><rect x="29" y="46" width="6" height="6" fill="#111"/></svg>`, { size: 128 });

  // side walls with ribs
  for (const s of [1, -1]) {
    const x = s * (X0 - 0.06);
    box(0.1, 0.5, 1.9, bedPaint, [x, FY + 0.28, (Z0 + Z1) / 2]);
    box(0.14, 0.06, 1.94, P.trim, [x, FY + 0.56, (Z0 + Z1) / 2]);
    for (let i = 0; i < 6; i++) {
      const z = Z0 + 0.2 + i * 0.3;
      box(0.05, 0.46, 0.08, P.armor, [x + s * 0.06, FY + 0.28, z]);
    }
    b.part(new THREE.PlaneGeometry(0.5, 0.19), "#ffffff", {
      bone: body, at: [x + s * 0.052, FY + 0.3, -1.4], dir: [s, 0, 0], axis: "z", texture: barcode,
    });
    // tie-down hooks
    for (const z of [-2.5, -1.2]) {
      b.part(new THREE.TorusGeometry(0.035, 0.01, 5, 8), P.metal, {
        bone: body, at: [x - s * 0.06, FY + 0.5, z], dir: [s, 0, 0], axis: "z",
      });
    }
  }

  // front wall (abuts cab)
  box(2.36, 0.62, 0.1, bedPaint, [0, FY + 0.34, Z1 - 0.06]);
  box(2.36, 0.06, 0.14, P.trim, [0, FY + 0.68, Z1 - 0.06]);

  // tailgate
  box(2.36, 0.5, 0.08, bedPaint, [0, FY + 0.28, Z0 + 0.04]);
  box(2.36, 0.06, 0.12, P.trim, [0, FY + 0.56, Z0 + 0.04]);
  for (let i = 0; i < 7; i++) box(0.07, 0.42, 0.04, P.armor, [-1.0 + i * 0.33, FY + 0.28, Z0 - 0.02]);
  b.part(new THREE.PlaneGeometry(0.8, 0.3), "#ffffff", {
    bone: body, at: [0, FY + 0.3, Z0 - 0.05], dir: [0, 0, -1], axis: "z", texture: barcode,
  });
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    bone: body, at: [0.8, FY + 0.3, Z0 - 0.05], dir: [0, 0, -1], axis: "z", texture: warn,
  });
  // hinge
  for (const s of [1, -1]) b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 6), P.metal, {
    bone: body, at: [s * 0.9, FY + 0.02, Z0 - 0.02], dir: [1, 0, 0],
  });
  // magenta rear strip
  glow(box(1.8, 0.04, 0.03, P.neonMagenta, [0, FY + 0.12, Z0 - 0.07]), 1.6);

  // tail lights
  for (const s of [1, -1]) {
    glow(box(0.2, 0.14, 0.06, P.red, [s * 1.0, FY + 0.4, Z0 - 0.06]), 2);
    box(0.24, 0.18, 0.03, P.hullDark, [s * 1.0, FY + 0.4, Z0 - 0.03]);
  }

  // roll cage
  const cageY = FY + 0.62;
  for (const s of [1, -1]) {
    b.rod([s * 1.1, FY + 0.5, -1.0], [s * 1.1, 1.88, -1.0], 0.035, P.metal, { bone: body });
    b.rod([s * 1.1, 1.88, -1.0], [s * 1.1, 1.88, -2.2], 0.035, P.metal, { bone: body });
    b.rod([s * 1.1, 1.88, -2.2], [s * 1.1, FY + 0.5, -2.3], 0.035, P.metal, { bone: body });
  }
  b.rod([1.1, 1.88, -1.0], [-1.1, 1.88, -1.0], 0.035, P.trim, { bone: body });
  b.rod([1.1, 1.88, -2.2], [-1.1, 1.88, -2.2], 0.035, P.trim, { bone: body });
  b.rod([1.1, 1.88, -1.6], [-1.1, 1.88, -1.6], 0.03, P.metal, { bone: body });
  b.rod([1.1, FY + 0.5, -1.0], [-1.1, 1.88, -1.0], 0.02, P.metal, { bone: body });
  void cageY;

  // fuel canisters
  for (const [x, z] of [[0.85, -1.2], [0.85, -1.55]]) {
    b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.4, 8), P.red, { bone: body, at: [x, FY + 0.23, z] });
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.metal, { bone: body, at: [x, FY + 0.46, z] });
    b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.04, 8), P.trim, { bone: body, at: [x, FY + 0.3, z] });
  }
  // crates
  for (const [x, z, s] of [[-0.8, -1.2, 0.4], [-0.8, -1.65, 0.34], [-0.85, -2.1, 0.36]]) {
    box(s, s, s, P.rust, [x, FY + 0.03 + s / 2, z]);
    box(s + 0.01, 0.04, s + 0.01, P.metal, [x, FY + 0.03 + s / 2, z]);
    box(0.04, s + 0.01, s + 0.01, P.metal, [x, FY + 0.03 + s / 2, z]);
  }
  // straps
  box(0.05, 0.02, 0.5, P.rubber, [0.85, FY + 0.47, -1.37]);
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, smoothstep, noise } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildChassis({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, flat: true, ...extra });

  const HULL = panelled(P.hull, { size: 0.3, rivets: 0.06 });
  const hazard = paint((p: any) => (Math.floor((p.z + p.x) / 0.14) % 2 ? P.trim : P.hullDark));

  // main lower body
  box(2.1, 0.3, 5.2, HULL, [0, 0.78, 0]);
  // skid plate
  box(1.7, 0.08, 4.8, P.hullDark, [0, 0.5, 0]);
  // underglow strips
  for (const s of [1, -1]) {
    glow(box(0.06, 0.03, 3.8, P.neonMagenta, [s * 0.7, 0.455, 0]), 1.6);
    glow(box(0.06, 0.03, 3.8, P.neonMagenta, [s * 0.4, 0.455, 0]), 1.2);
  }
  glow(box(1.4, 0.03, 0.06, P.neonMagenta, [0, 0.455, 1.9]), 1.6);
  glow(box(1.4, 0.03, 0.06, P.neonMagenta, [0, 0.455, -1.9]), 1.6);

  // side sills with hazard stripes
  for (const s of [1, -1]) {
    box(0.16, 0.22, 3.6, hazard, [s * 1.1, 0.62, 0.0]);
    box(0.05, 0.1, 3.6, P.armor, [s * 1.19, 0.76, 0]);
    // arch dark insets around thruster mounts
    for (const z of [1.7, -1.7]) {
      box(0.06, 0.36, 0.9, P.hullDark, [s * 1.07, 0.78, z]);
      box(0.08, 0.05, 1.0, P.trim, [s * 1.07, 0.98, z]);
      // pylon struts down to thruster mounts
      b.rod([s * 0.95, 0.7, z], [s * 1.05, 0.55, z], 0.07, P.metal, { bone });
      box(0.2, 0.12, 0.5, P.armor, [s * 1.0, 0.62, z]);
      b.rod([s * 0.8, 0.6, z], [s * 1.05, 0.55, z], 0.04, P.metal, { bone });
    }
    // exhaust vents on side
    for (let i = 0; i < 5; i++) box(0.04, 0.05, 0.22, P.rubber, [s * 1.1, 0.88, -0.6 + i * 0.3 - 0.2]);
  }

  // front bumper + bull bar
  box(2.3, 0.28, 0.35, P.armor, [0, 0.7, 2.65]);
  box(2.3, 0.06, 0.37, hazard, [0, 0.86, 2.65]);
  for (const x of [-0.8, -0.4, 0, 0.4, 0.8])
    b.rod([x, 0.62, 2.78], [x, 1.0, 2.78], 0.04, P.metal, { bone });
  b.rod([-0.9, 1.0, 2.8], [0.9, 1.0, 2.8], 0.05, P.metal, { bone });
  b.rod([-0.9, 0.65, 2.8], [0.9, 0.65, 2.8], 0.05, P.metal, { bone });
  for (const s of [1, -1]) {
    b.rod([s * 0.55, 0.6, 2.8], [s * 0.55, 0.6, 2.98], 0.035, P.red, { bone });
    box(0.1, 0.1, 0.06, P.red, [s * 0.55, 0.6, 3.0 - 0.0], { scale: [1, 1, 0.5] });
    glow(box(0.3, 0.04, 0.04, P.neonCyan, [s * 0.9, 0.78, 2.84]), 1.5);
  }

  // rear bumper
  box(2.3, 0.26, 0.3, P.armor, [0, 0.7, -2.65]);
  box(2.3, 0.05, 0.32, hazard, [0, 0.85, -2.65]);
  for (const s of [1, -1]) {
    b.rod([s * 0.6, 0.62, -2.8], [s * 0.6, 0.62, -2.98], 0.035, P.red, { bone });
    for (let i = 0; i < 3; i++) box(0.2, 0.03, 0.04, P.rubber, [s * 0.9, 0.62 + i * 0.07, -2.82]);
  }
  // exhaust vents rear
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 8), P.hullDark, { bone, at: [s * 0.3, 0.6, -2.72], dir: [0, 0, 1] });
    glow(b.part(new THREE.CircleGeometry(0.07, 8), P.neonMagenta, { bone, at: [s * 0.3, 0.6, -2.83], dir: [0, 0, -1], axis: "z" }), 1.4);
  }

  // hazard decal on bumper face
  const tex = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#20242c"/>${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${i * 12} 16 L${i * 12 + 8} 0 L${i * 12 + 14} 0 L${i * 12 + 6} 16Z" fill="#e7b814"/>`).join("")}</svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(1.6, 0.2), "#ffffff", { bone, at: [0, 0.7, 2.83], dir: [0, 0, 1], axis: "z", texture: tex });
  b.part(new THREE.PlaneGeometry(1.6, 0.2), "#ffffff", { bone, at: [0, 0.7, -2.81], dir: [0, 0, -1], axis: "z", texture: tex });

  // tow hooks / ribs on lower body
  for (let i = 0; i < 6; i++) box(1.9, 0.04, 0.06, P.hullDark, [0, 0.94, -1.2 + i * 0.5]);
  // front wedge nose
  b.part(new THREE.BoxGeometry(2.0, 0.2, 0.5), P.hull, { bone, at: [0, 0.92, 2.45], rotation: [-12, 0, 0], flat: true });
}
```

<!-- call: rocketPod -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildRocketPod({ b, J, P, M }: Ctx) {
  const pivot = J.podPivot;
  const [px, , pz] = M.podPivot;
  const bedY = M.bedFloor[1];
  const bone = pivot;
  const DARKM = "#2b2f38";
  const GLASS_CYAN = P.neonCyan;

  const place = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, ...o });

  const armorPaint = paint((p, n) => {
    const t = noise(p, 0.12, 3);
    const base = mix(P.armor, P.hull, t * 0.6);
    return mix(base, "#8a93a3", Math.max(0, n.y) * 0.25);
  });

  // pedestal and swivel base
  const baseY = bedY + 0.02;
  place(new THREE.CylinderGeometry(0.42, 0.46, 0.08, 8), P.hullDark, [px, baseY + 0.04, pz]);
  place(new THREE.TorusGeometry(0.36, 0.035, 5, 12), P.trim, [px, baseY + 0.1, pz], { rotation: [90, 0, 0] });
  place(new THREE.CylinderGeometry(0.2, 0.28, 0.4, 8), armorPaint, [px, baseY + 0.3, pz]);
  place(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 8), P.metal, [px, baseY + 0.52, pz]);
  // hazard bolts on pedestal
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    place(new THREE.BoxGeometry(0.05, 0.03, 0.05), P.trim, [px + Math.cos(a) * 0.38, baseY + 0.1, pz + Math.sin(a) * 0.38]);
  }

  // yoke arms
  const cy = 1.78;
  for (const s of [1, -1]) {
    place(new THREE.BoxGeometry(0.06, 0.4, 0.3), P.hullDark, [px + s * 0.4, baseY + 0.75, pz]);
    place(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), P.metal, [px + s * 0.45, cy, pz], { rotation: [0, 0, 90] });
  }

  // tilted launcher group
  const tilt = -14;
  const lc = [px, cy, pz + 0.05];
  place(new THREE.BoxGeometry(0.72, 0.5, 0.95), armorPaint, lc, { rotation: [tilt, 0, 0] });
  place(new THREE.BoxGeometry(0.76, 0.06, 0.99), P.trim, [lc[0], lc[1] + 0.27, lc[2]], { rotation: [tilt, 0, 0] });
  place(new THREE.BoxGeometry(0.76, 0.06, 0.99), P.hullDark, [lc[0], lc[1] - 0.27, lc[2]], { rotation: [tilt, 0, 0] });

  // 6 tubes (3 x 2) at the front (+Z) face
  const tl = Math.cos((tilt * Math.PI) / 180);
  const ts = Math.sin((tilt * Math.PI) / 180);
  const frontOff = 0.49;
  const fz = lc[2] + frontOff * tl;
  const fy0 = lc[1] + frontOff * ts * -1;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 2; j++) {
      const x = px + (i - 1) * 0.22;
      const yy = (j - 0.5) * 0.22;
      const ty = fy0 + yy * tl;
      const tz = fz - yy * ts * -1;
      place(new THREE.CylinderGeometry(0.095, 0.095, 0.12, 8), P.hullDark, [x, ty, tz], { rotation: [90 + tilt, 0, 0] });
      glow(
        place(new THREE.TorusGeometry(0.092, 0.014, 4, 8), P.neonCyan, [x, ty, tz + 0.055], { rotation: [tilt, 0, 0] }),
        1.4,
      );
      // rocket nose
      place(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 8), P.white, [x, ty, tz + 0.02], { rotation: [90 + tilt, 0, 0] });
      place(new THREE.ConeGeometry(0.065, 0.12, 8), P.red, [x, ty, tz + 0.15], { rotation: [90 + tilt, 0, 0] });
    }

  // shield plate in front of the pedestal/under launcher
  place(new THREE.BoxGeometry(0.9, 0.42, 0.05), armorPaint, [px, 1.66, pz + 0.62], { rotation: [-10, 0, 0] });
  place(new THREE.BoxGeometry(0.9, 0.06, 0.07), P.trim, [px, 1.86, pz + 0.64], { rotation: [-10, 0, 0] });
  const chev = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><g fill="#15161a"><path d="M0 16L8 0H16L8 16Z"/><path d="M20 16L28 0H36L28 16Z"/><path d="M40 16L48 0H56L48 16Z"/></g></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.12), "#ffffff", {
    bone, at: [px, 1.55, pz + 0.655], dir: [0, 0.17, 1], axis: "z", texture: chev,
  });

  // skull decal on launcher side
  const skull = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 3C8 3 5 9 5 14c0 4 2 6 4 7v5h4v-3h2v3h2v-3h2v3h4v-5c2-1 4-3 4-7 0-5-3-11-11-11z" fill="#e8ecf2" stroke="#15161a" stroke-width="2"/><circle cx="11" cy="15" r="3.2" fill="#15161a"/><circle cx="21" cy="15" r="3.2" fill="#15161a"/><path d="M16 18l-2 4h4z" fill="#15161a"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    bone, at: [px + 0.372, cy, lc[2] - 0.1], dir: [1, 0, 0], axis: "z", up: [0, 1, 0], texture: skull,
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    bone, at: [px - 0.372, cy, lc[2] - 0.1], dir: [-1, 0, 0], axis: "z", texture: skull,
  });

  // ammo belt: small boxes along right side feeding the launcher
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = px - 0.46 - Math.sin(t * 2) * 0.05;
    const y = baseY + 0.55 + t * 0.9 * 0.6;
    place(new THREE.BoxGeometry(0.07, 0.09, 0.07), i % 2 ? P.trim : P.metal, [x, y, pz - 0.15 + Math.sin(t * 3) * 0.12], {
      rotation: [0, i * 12, 0],
    });
  }
  place(new THREE.BoxGeometry(0.2, 0.2, 0.26), P.hullDark, [px - 0.52, baseY + 0.4, pz - 0.15]);

  // sensor on a stalk
  const sx = px + 0.5;
  place(new THREE.CylinderGeometry(0.025, 0.03, 0.3, 6), P.metal, [sx, 1.88 + 0.05, pz - 0.3]);
  place(new THREE.BoxGeometry(0.14, 0.12, 0.16), DARKM, [sx, 2.07, pz - 0.3]);
  glow(
    b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), GLASS_CYAN, {
      bone, at: [sx, 2.07, pz - 0.2], dir: [0, 0, 1],
    }),
    1.8,
  );
  place(new THREE.BoxGeometry(0.16, 0.025, 0.18), P.trim, [sx, 2.14, pz - 0.3]);
  // rear antenna
  place(new THREE.CylinderGeometry(0.008, 0.012, 0.28, 5), P.metal, [px - 0.3, 2.0, pz - 0.45]);
  glow(place(new THREE.SphereGeometry(0.02, 5, 4), P.red, [px - 0.3, 2.15, pz - 0.45]), 1.5);

  // rear back plate with vents
  place(new THREE.BoxGeometry(0.7, 0.46, 0.05), P.hullDark, [px, cy, lc[2] - 0.5], { rotation: [tilt, 0, 0] });
  for (let i = 0; i < 4; i++)
    place(new THREE.BoxGeometry(0.5, 0.025, 0.02), P.metal, [px, cy - 0.15 + i * 0.1, lc[2] - 0.535], { rotation: [tilt, 0, 0] });
}
```
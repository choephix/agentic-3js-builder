<!-- call: plan -->

```json
{
  "name": "Hoverhauler MK-IV",
  "description": "A militarized pickup truck converted to ride on four glowing hover thrusters, in low-poly cyberpunk style with neon trim, armor plates and a roof-mounted gun.",
  "builderName": "hoverPickup",
  "size": [2.5, 2.3, 5.6],
  "layout": "A chunky pickup silhouette hovering about 0.35 m off the floor on four vertical thrusters at the wheel positions, which hang just below the chassis. The cab sits at the front-middle with a sloped windshield, and the open cargo bed is at the back with a roll bar, a rear light bar and ammo crates. The hood is at the front (+Z) with a neon grille. The hull is armored dark gunmetal with yellow hazard trim, cyan and magenta neon strips, and angular faceted plates throughout. The thrusters are the floor-touching parts: their lowest rims sit at y=0.02. Neon cyan glows from the thruster cores, headlights, underglow strips and screens. Magenta marks the rear lights and decals. All shapes are blocky, angular and low-poly with panelled paints, hazard-stripe textures and SVG decals.",
  "palette": {
    "hull": "#3b4250",
    "hullDark": "#1c2029",
    "armor": "#566070",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb4",
    "glass": "#14324a",
    "rubber": "#15151a",
    "metal": "#8a93a3",
    "rust": "#7a4a2a",
    "lightWhite": "#fff6d8",
    "thrusterCore": "#7dfcff"
  },
  "mounts": {
    "chassisTop": [0, 1.0, 0],
    "cabFloor": [0, 1.0, 0.3],
    "bedFloor": [0, 1.0, -1.7],
    "roofTop": [0, 2.0, 0.2],
    "gunRing": [0, 2.0, -0.6],
    "thrusterFL": [1.05, 0.7, 1.75],
    "thrusterFR": [-1.05, 0.7, 1.75],
    "thrusterRL": [1.05, 0.7, -1.75],
    "thrusterRR": [-1.05, 0.7, -1.75]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "thrusterFL", "parent": "body", "at": [1.05, 0.7, 1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterFR", "parent": "body", "at": [-1.05, 0.7, 1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRL", "parent": "body", "at": [1.05, 0.7, -1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRR", "parent": "body", "at": [-1.05, 0.7, -1.75], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "gunYaw", "parent": "body", "at": [0, 2.0, -0.6], "dir": [0, 1, 0], "role": "hinge", "group": "gun" },
    { "name": "gunPitch", "parent": "gunYaw", "at": [0, 2.2, -0.6], "dir": [0, 0, 1], "role": "hinge", "group": "gun" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "The lower hull: a faceted armored chassis slab and skirt panels with panelled gunmetal paint and rivets, hazard-yellow trim stripes along the sides, front armored bumper with a plough wedge and neon cyan grille bars, headlight clusters, a rear bumper with tow hooks, wheel-arch style thruster bays (dark recesses where the thrusters mount), underglow neon strips under the sill, and an under-belly plate with vents. Includes the hood with scoop and armor louvres, fender plates, and side-mounted exhaust or capacitor pipes.",
      "box": [[-1.25, 0.45, -2.8], [1.25, 1.35, 2.8]],
      "attaches": "Sits on the body joint. The cab starts at the cabFloor and chassisTop mounts. The bed starts at bedFloor. The thruster bays surround the four thruster mounts.",
      "joints": ["body"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "cab",
      "builds": "The armored crew cab: angular boxy cabin with sloped windshield and side windows in tinted glass with cyan HUD-style reflection decals, thick armor plating on the doors with panelled paint and hazard numbering decals, door handles, side mirrors with small screens, a roof with antenna array, roof light bar with magenta and cyan lights, a snorkel intake on the A-pillar, a sun-visor armor flap over the windshield, a cyberpunk SVG emblem on the door (a skull-and-circuit logo), and a glimpsed interior with seats and a neon dashboard.",
      "box": [[-1.2, 1.0, -0.55], [1.2, 2.05, 1.5]],
      "attaches": "Sits on the chassis at the cabFloor mount. The roofTop mount carries the antenna and light bar, and the bed's front wall is flush with the cab's back at z=-0.55.",
      "joints": ["body"],
      "floor": false,
      "budget": 220
    },
    {
      "id": "bed",
      "builds": "The open cargo bed: floor, side walls with armor ribbing and hazard trim, a tailgate with neon magenta tail-light strips and an SVG decal, a rear light bar, a roll cage of rods behind the cab, ammo crates and a fuel drum strapped with straps, a hardpoint ring at gunRing with a ring-shaped rail and the gun mount base. The gun is a pintle-mounted minigun with a shield plate, barrel cluster, ammo belt and ammo box, built on the gunYaw and gunPitch joints, with a glowing cyan sight.",
      "box": [[-1.25, 1.0, -2.8], [1.25, 2.5, -0.55]],
      "attaches": "Starts at the bedFloor mount on the chassis top (y=1.0) and meets the cab at z=-0.55. The gun rides gunYaw and gunPitch at the gunRing mount.",
      "joints": ["body", "gunYaw", "gunPitch"],
      "floor": false,
      "budget": 230
    },
    {
      "id": "thrusters",
      "builds": "Four hover thruster units, one at each thruster mount. Each has a mounting strut and an armored housing in dark metal, a lathe-turned downward-flaring nozzle with ribbed rings, a glowing cyan core disc and a magenta ring accent, hazard-yellow bands, small stabiliser fins, cable bundles up to the chassis, and a soft glow cone or card layer of cyan beneath. The nozzle lowest rim sits at y=0.02, so these touch the floor line. Each unit rides its own thruster joint.",
      "box": [[-1.45, 0.0, -2.2], [1.45, 0.8, 2.2]],
      "attaches": "Each unit is centred on its thrusterXX mount (x ±1.05, z ±1.75) and joins the chassis thruster bay above at y=0.7. It rides the matching joint.",
      "joints": ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"],
      "floor": true,
      "budget": 200
    }
  ]
}
```

<!-- call: thrusters -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildThrusters({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#15151a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const RING = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#7dfcff"/><circle cx="32" cy="32" r="22" fill="none" stroke="#ffffff" stroke-width="3"/><circle cx="32" cy="32" r="12" fill="none" stroke="#2ff3ff" stroke-width="3"/><circle cx="32" cy="32" r="4" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const GLOWCARD = svg(
    `<svg viewBox="0 0 64 64"><defs><radialGradient id="g"><stop offset="0" stop-color="#2ff3ff" stop-opacity="1"/><stop offset="1" stop-color="#2ff3ff" stop-opacity="0"/></radialGradient></defs><circle cx="32" cy="32" r="31" fill="url(#g)"/></svg>`,
    { size: 128 },
  );
  const HOUSING = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.18, rivets: 0.05 });
  const names = ["FL", "FR", "RL", "RR"];
  const mounts = [M.thrusterFL, M.thrusterFR, M.thrusterRL, M.thrusterRR];

  mounts.forEach((m, k) => {
    const bone = (J as any)["thruster" + names[k]];
    const [cx, , cz] = m;
    const s = cx > 0 ? 1 : -1;
    const at = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];
    const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);

    // strut up to chassis
    b.part(cyl(0.12, 0.16, 0.2), P.hullDark, { bone, at: at(0, 0.62, 0) });
    b.part(new THREE.BoxGeometry(0.5, 0.08, 0.5), P.armor, { bone, at: at(0, 0.68, 0) });
    // armored housing (octagonal)
    b.part(cyl(0.42, 0.5, 0.26, 8), HOUSING, { bone, at: at(0, 0.5, 0), flat: true });
    // hazard band
    b.part(cyl(0.505, 0.505, 0.07, 8), "#ffffff", { bone, at: at(0, 0.5, 0), texture: HAZ, flat: true });
    b.part(cyl(0.5, 0.5, 0.04, 8), P.trim, { bone, at: at(0, 0.62, 0), flat: true });

    // lathe nozzle flaring downward, rim at y=0.02
    b.lathe(
      [
        [0.2, 0.02],
        [0.52, 0.02],
        [0.5, 0.07],
        [0.4, 0.12],
        [0.36, 0.22],
        [0.34, 0.38],
        [0.28, 0.38],
        [0.3, 0.22],
        [0.34, 0.12],
        [0.2, 0.08],
      ],
      { at: at(0, 0, 0), segments: 10, color: P.hullDark, bone },
    );
    // ribbed rings
    for (let i = 0; i < 3; i++)
      b.part(cyl(0.42 - i * 0.03, 0.42 - i * 0.03, 0.025, 10), P.metal, { bone, at: at(0, 0.14 + i * 0.1, 0) });
    // magenta ring accent
    glow(b.part(new THREE.TorusGeometry(0.4, 0.016, 4, 10), P.neonMagenta, { bone, at: at(0, 0.4, 0), dir: [0, 1, 0], axis: "z" }), 1.4);
    // glowing core disc
    glow(b.part(new THREE.CircleGeometry(0.3, 10), "#ffffff", { bone, at: at(0, 0.1, 0), dir: [0, -1, 0], axis: "z", texture: RING }), 1.5);
    glow(b.part(cyl(0.2, 0.2, 0.04, 8), P.thrusterCore, { bone, at: at(0, 0.34, 0) }), 1.3);
    // underglow card on floor
    b.cards([{ at: new THREE.Vector3(cx, 0.015, cz), axis: new THREE.Vector3(0, 1, 0) } as any].map(() => (b as any).frame ? null : null).filter(Boolean) as any, GLOWCARD);
    glow(
      b.part(new THREE.PlaneGeometry(1.3, 1.3), "#ffffff", { bone, at: at(0, 0.012, 0), dir: [0, 1, 0], axis: "z", texture: GLOWCARD }),
      1,
    );

    // stabiliser fins
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const dx = Math.sin(a), dz = Math.cos(a);
      b.extrude(
        [
          [0, 0],
          [0.2, 0],
          [0.08, 0.3],
          [0, 0.3],
        ],
        { at: at(dx * 0.46, 0.2, dz * 0.46), x: [dx, 0, dz], y: [0, 1, 0], thickness: 0.035, color: P.armor, bone },
      );
    }
    // yellow bolts on housing
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      b.part(new THREE.SphereGeometry(0.03, 5, 4), P.metal, { bone, at: at(Math.sin(a) * 0.47, 0.58, Math.cos(a) * 0.47) });
    }
    // cable bundles
    for (let i = 0; i < 2; i++) {
      const o = (i - 0.5) * 0.14;
      b.rod([cx - s * 0.2 + o, 0.65, cz], [cx - s * 0.3 + o, 0.98, cz + (R() - 0.5) * 0.1], 0.025, i ? P.neonCyan : P.rubber, { bone });
    }
    b.rod([cx, 0.6, cz + 0.2], [cx - s * 0.1, 0.98, cz + 0.3], 0.03, P.rubber, { bone });
  });
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

export function buildChassis({ b, J, P }: Ctx) {
  const bone = J.body;
  const hull = panelled(
    paint((p, n) => mix(mix(P.hull, P.hullDark, 1 - smoothstep(-0.6, 0.8, n.y)), P.armor, noise(p, 0.3, 4) * 0.5)),
    { size: 0.3, rivets: 0.06 },
  );
  const dark = panelled(P.hullDark, { size: 0.25, rivets: 0 });
  const box = (w: number, h: number, d: number, col: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...opt });

  const hazard = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((i) => `<path d="M${i * 8 - 4} 8 L${i * 8} 0 L${i * 8 + 4} 0 L${i * 8} 8Z" fill="#15151a"/>`)
      .join("")}</svg>`,
    { size: 256 },
  );
  const grille = svg(
    `<svg viewBox="0 0 64 24"><rect width="64" height="24" fill="#0a0c10"/>${[2, 8, 14, 20]
      .map((y) => `<rect x="4" y="${y}" width="56" height="3" fill="#2ff3ff"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const vent = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#0a0c10"/>${[3, 9, 15, 21, 27]
      .map((y) => `<rect x="3" y="${y}" width="26" height="3" fill="#566070"/>`)
      .join("")}</svg>`,
    { size: 64 },
  );

  // main slab and belly
  box(2.4, 0.5, 5.4, hull, [0, 0.95, 0]);
  box(2.0, 0.12, 4.6, dark, [0, 0.52, 0]);
  const belly = b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", {
    bone, at: [0, 0.455, 0], dir: [0, -1, 0], axis: "z", texture: vent,
  });
  // skirts + hazard stripes + underglow
  for (const s of [1, -1]) {
    box(0.1, 0.34, 2.2, dark, [s * 1.24, 0.72, 0]);
    b.part(new THREE.PlaneGeometry(2.2, 0.1), "#ffffff", {
      bone, at: [s * 1.296, 0.86, 0], dir: [s, 0, 0], axis: "z", up: [0, 0, 1], texture: hazard, color: "#ffffff",
    });
    glow(box(0.04, 0.04, 2.0, P.neonCyan, [s * 1.2, 0.5, 0]), 1.6);
    glow(box(0.04, 0.04, 0.9, P.neonMagenta, [s * 1.2, 0.5, 2.0]), 1.4);
    glow(box(0.04, 0.04, 0.9, P.neonMagenta, [s * 1.2, 0.5, -2.0]), 1.4);
    // thruster bays
    for (const z of [1.75, -1.75]) {
      box(0.9, 0.12, 1.1, P.rubber, [s * 1.05, 0.62, z]);
      box(0.08, 0.35, 1.1, P.hullDark, [s * 0.58, 0.8, z]);
      box(0.08, 0.35, 1.1, P.hullDark, [s * 1.5 - s * 0.1, 0.8, z], { scale: [1, 1, 1] });
      box(1.0, 0.1, 0.06, P.trim, [s * 1.05, 1.0, z + 0.62]);
      box(1.0, 0.1, 0.06, P.trim, [s * 1.05, 1.0, z - 0.62]);
    }
    // fender plates
    box(0.14, 0.14, 1.3, P.armor, [s * 1.22, 1.3, 1.75]);
    box(0.14, 0.14, 1.3, P.armor, [s * 1.22, 1.3, -1.75]);
    // headlights
    glow(box(0.4, 0.2, 0.08, P.lightWhite, [s * 0.85, 1.05, 2.83]), 1.8);
    box(0.5, 0.3, 0.06, P.hullDark, [s * 0.85, 1.05, 2.8]);
    glow(box(0.4, 0.2, 0.08, P.lightWhite, [s * 0.85, 1.05, 2.84]), 1.8);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.1, 0.025, 5, 8), P.metal, {
      bone, at: [s * 0.7, 0.75, -2.83], dir: [0, 0, 1], axis: "z",
    });
    // exhaust pipes
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 8), P.metal, {
      bone, at: [s * 1.3, 0.95, 0], dir: [0, 0, 1],
    });
    for (const z of [-0.6, 0.6])
      b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.1, 8), P.trim, { bone, at: [s * 1.3, 0.95, z], dir: [0, 0, 1] });
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8), P.neonCyan, {
      bone, at: [s * 1.3, 0.95, -0.82], dir: [0, 0, 1],
    }), 1.5);
    // louvres on hood
    for (let i = 0; i < 4; i++) box(0.5, 0.03, 0.08, P.hullDark, [s * 0.75, 1.255, 1.5 + i * 0.2]);
  }

  // hood
  box(2.3, 0.14, 1.5, hull, [0, 1.29, 2.0]);
  box(0.7, 0.16, 0.7, P.armor, [0, 1.38, 1.8], { rotation: [-8, 0, 0] });
  box(0.5, 0.1, 0.4, P.hullDark, [0, 1.46, 1.95]);
  // front bumper + plough wedge
  box(2.5, 0.4, 0.3, P.armor, [0, 0.75, 2.75]);
  b.part(new THREE.ConeGeometry(0.8, 0.5, 4), P.armor, {
    bone, at: [0, 0.6, 2.98], rotation: [90, 45, 0], scale: [1.8, 1, 0.5], flat: true,
  });
  box(2.4, 0.08, 0.1, P.trim, [0, 0.96, 2.92]);
  b.part(new THREE.PlaneGeometry(1.2, 0.45), "#ffffff", {
    bone, at: [0, 1.1, 2.82], dir: [0, 0, 1], axis: "z", texture: grille,
  });
  glow(box(1.0, 0.04, 0.04, P.neonCyan, [0, 0.55, 3.0]), 1.6);
  // rear bumper
  box(2.5, 0.35, 0.25, P.armor, [0, 0.8, -2.72]);
  box(2.4, 0.08, 0.06, P.trim, [0, 0.98, -2.86]);
  // belly vent glow
  glow(box(0.8, 0.03, 0.03, P.neonMagenta, [0, 0.45, -1.2]), 1.2);
  void belly;
}
```

<!-- call: bed -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildBed({ b, J, P, M }: Ctx) {
  const body = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: body, at, ...opts });

  const plated = paint((p, n) => {
    const base = mix(P.hull, P.armor, smoothstep(0.3, 0.8, noise(p, 0.3, 4)));
    const seam = (Math.abs(((p.z * 4) % 1)) < 0.03 || Math.abs(((p.y * 5) % 1)) < 0.03) ? 0.6 : 1;
    const up = 0.9 + 0.15 * Math.max(n.y, 0);
    return [base[0] * seam * up, base[1] * seam * up, base[2] * seam * up];
  });
  const hazardTex = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="${P.trim}"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const decal = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#15151a"/><rect x="3" y="3" width="94" height="34" fill="none" stroke="${P.neonMagenta}" stroke-width="2"/><circle cx="24" cy="20" r="11" fill="none" stroke="${P.neonMagenta}" stroke-width="3"/><path d="M18 20h12M24 14v12" stroke="${P.neonCyan}" stroke-width="2"/><text x="42" y="26" font-size="16" font-family="monospace" font-weight="bold" fill="${P.neonMagenta}">HH-IV</text></svg>`,
    { size: 256 },
  );
  const crateTex = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#4a5a3a"/><rect x="2" y="2" width="28" height="28" fill="none" stroke="#2a3322" stroke-width="2"/><path d="M2 2L30 30M30 2L2 30" stroke="#2a3322" stroke-width="1.5"/><rect x="9" y="12" width="14" height="8" fill="${P.trim}"/></svg>`,
    { size: 64 },
  );

  // floor and walls
  box(2.4, 0.1, 2.2, plated, [0, 1.05, -1.7]);
  for (const s of [1, -1]) {
    box(0.1, 0.55, 2.2, plated, [s * 1.2, 1.37, -1.7]);
    b.part(new THREE.BoxGeometry(0.14, 0.08, 2.2), P.trim, { bone: body, at: [s * 1.2, 1.67, -1.7], texture: hazardTex });
    for (let i = 0; i < 5; i++) box(0.16, 0.5, 0.07, P.armor, [s * 1.2, 1.37, -2.65 + i * 0.5]);
    box(0.05, 0.05, 2.1, P.neonCyan, [s * 1.27, 1.12, -1.7]);
  }
  glow(box(2.0, 0.02, 0.04, P.neonCyan, [0, 1.11, -2.78]), 1.2);
  // front wall
  box(2.4, 0.6, 0.1, plated, [0, 1.4, -0.65]);
  // tailgate
  box(2.4, 0.6, 0.1, plated, [0, 1.35, -2.75]);
  b.part(new THREE.PlaneGeometry(1.0, 0.4), "#ffffff", { bone: body, at: [0, 1.38, -2.81], dir: [0, 0, -1], axis: "z", texture: decal });
  for (const s of [1, -1]) glow(box(0.5, 0.08, 0.04, P.neonMagenta, [s * 0.7, 1.58, -2.81]), 1.5);
  // rear light bar
  box(2.0, 0.1, 0.1, P.hullDark, [0, 1.8, -2.75]);
  glow(box(1.9, 0.05, 0.04, P.neonMagenta, [0, 1.8, -2.81]), 1.6);
  for (const s of [1, -1]) box(0.08, 0.2, 0.08, P.hullDark, [s * 0.95, 1.72, -2.75]);

  // roll cage
  for (const s of [1, -1]) {
    b.rod([s * 1.1, 1.1, -0.8], [s * 1.1, 2.4, -0.8], 0.05, P.metal, { bone: body });
    b.rod([s * 1.1, 2.4, -0.8], [s * 1.1, 2.4, -2.0], 0.05, P.metal, { bone: body });
    b.rod([s * 1.1, 2.4, -2.0], [s * 1.1, 1.7, -2.3], 0.04, P.metal, { bone: body });
  }
  b.rod([1.1, 2.4, -0.8], [-1.1, 2.4, -0.8], 0.05, P.metal, { bone: body });
  b.rod([1.1, 2.4, -2.0], [-1.1, 2.4, -2.0], 0.05, P.metal, { bone: body });
  b.rod([1.1, 2.4, -0.8], [-1.1, 1.5, -0.8], 0.03, P.metal, { bone: body });
  b.rod([-1.1, 2.4, -0.8], [1.1, 1.5, -0.8], 0.03, P.metal, { bone: body });
  for (const s of [1, -1]) box(0.12, 0.06, 0.12, P.trim, [s * 1.1, 2.42, -0.8]);

  // crates
  box(0.55, 0.4, 0.5, "#ffffff", [0.8, 1.3, -1.1], { texture: crateTex });
  box(0.5, 0.35, 0.45, "#ffffff", [0.82, 1.65, -1.12], { texture: crateTex, rotation: [0, 12, 0] });
  box(0.5, 0.4, 0.5, "#ffffff", [-0.85, 1.3, -1.2], { texture: crateTex, rotation: [0, -8, 0] });
  // fuel drum
  cyl(0.28, 0.28, 0.7, 10, P.rust, [-0.8, 1.45, -2.3]);
  for (const y of [1.25, 1.65]) cyl(0.3, 0.3, 0.05, 10, P.trim, [-0.8, y, -2.3]);
  cyl(0.08, 0.08, 0.06, 6, P.metal, [-0.8, 1.83, -2.3]);
  b.rod([-0.55, 1.25, -2.3], [0.2, 1.1, -2.3], 0.02, P.hullDark, { bone: body });

  // hardpoint ring
  b.lathe([[0.5, 0], [0.62, 0], [0.62, 0.06], [0.5, 0.06]], { at: [0, 1.1, -1.7], bone: body, color: P.armor });
  const ringPath = b.part(new THREE.TorusGeometry(0.55, 0.03, 5, 16), P.trim, { bone: body, at: [0, 1.72, -1.7], rotation: [90, 0, 0] });
  void ringPath;
  // gun mount: pole to gunYaw
  cyl(0.1, 0.14, 0.62, 8, P.hullDark, [0, 1.42, -1.7]);
  cyl(0.18, 0.18, 0.08, 8, P.metal, [0, 1.78, -1.7]);
  // yaw turret base
  const yaw = J.gunYaw, pitch = J.gunPitch;
  b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 8), P.hullDark, { bone: yaw, at: [0, 2.05, -0.6] });
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.06, 0.3, 0.3), P.armor, { bone: yaw, at: [s * 0.16, 2.2, -0.6] });
  // pitch assembly
  const g = (geo: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(geo, c, { bone: pitch, at, ...o });
  g(new THREE.BoxGeometry(0.22, 0.2, 0.4), P.hullDark, [0, 2.2, -0.6]);
  g(new THREE.BoxGeometry(0.7, 0.55, 0.05), P.armor, [0, 2.3, -0.38]);
  g(new THREE.BoxGeometry(0.72, 0.05, 0.07), P.trim, [0, 2.58, -0.38]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    g(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 5), P.metal, [Math.cos(a) * 0.05, 2.2 + Math.sin(a) * 0.05, -0.0], { rotation: [90, 0, 0] });
  }
  g(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8), P.hullDark, [0, 2.2, 0.35], { rotation: [90, 0, 0] });
  g(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8), P.hullDark, [0, 2.2, -0.2], { rotation: [90, 0, 0] });
  g(new THREE.BoxGeometry(0.24, 0.22, 0.3), P.rust, [0.3, 2.1, -0.75]);
  b.rod([0.28, 2.15, -0.7], [0.1, 2.2, -0.55], 0.03, P.trim, { bone: pitch });
  glow(g(new THREE.BoxGeometry(0.08, 0.08, 0.1), P.neonCyan, [-0.1, 2.36, -0.45]), 1.6);
  g(new THREE.BoxGeometry(0.1, 0.1, 0.12), P.hullDark, [-0.1, 2.33, -0.55]);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, rng, noise, smoothstep, mix } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export function buildCab({ b, J, P, M }: any) {
  const body = J.body;
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: body, at, ...o });

  const ARMOR = panelled(paint((p: any, n: any) => mix(P.hull, P.armor, noise(p, 0.3, 4) * 0.8 + 0.2 * Math.max(n.y, 0))), { size: 0.5, rivets: 0.1 });
  const DARK = panelled(P.hullDark, { size: 0.4 });

  // HUD glass texture
  const HUD = svg(`<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#14324a"/>
    <path d="M4 34 L24 6 L30 6 L10 34Z" fill="#2ff3ff" opacity="0.25"/>
    <path d="M8 8H30M8 14H22M40 10H58M40 16H52" stroke="#2ff3ff" stroke-width="1.5" opacity="0.8"/>
    <circle cx="50" cy="28" r="6" fill="none" stroke="#2ff3ff" stroke-width="1.5"/></svg>`, { size: 128 });
  const EMBLEM = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#1c2029" stroke="#e7b814" stroke-width="4"/>
    <path d="M18 30 Q18 14 32 14 Q46 14 46 30 L42 38 L42 44 L22 44 L22 38Z" fill="#e7b814"/>
    <circle cx="25" cy="30" r="5" fill="#1c2029"/><circle cx="39" cy="30" r="5" fill="#1c2029"/>
    <path d="M30 38L32 34L34 38Z M26 44V38M32 44V40M38 44V38" stroke="#1c2029" stroke-width="2"/>
    <path d="M4 32H14M50 32H60M32 52V60" stroke="#2ff3ff" stroke-width="3"/>
    <circle cx="8" cy="32" r="3" fill="#ff2fb4"/><circle cx="56" cy="32" r="3" fill="#ff2fb4"/></svg>`, { size: 128 });
  const HAZ = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M${i * 10 - 6} 16L${i * 10 + 2} 0H${i * 10 + 8}L${i * 10} 16Z" fill="#1c2029"/>`).join("")}</svg>`, { size: 128 });
  const NUM = svg(`<svg viewBox="0 0 48 32"><rect width="48" height="32" fill="#1c2029"/><text x="24" y="25" text-anchor="middle" font-size="24" font-weight="bold" fill="#e7b814" font-family="monospace">04</text></svg>`, { size: 96 });

  // lower cab shell
  put(box(2.3, 0.5, 2.0), ARMOR, [0, 1.25, 0.45]);
  put(box(2.4, 0.08, 2.1), P.hullDark, [0, 1.02, 0.45]);
  // floor + interior
  put(box(2.0, 0.05, 1.7), P.hullDark, [0, 1.08, 0.5]);
  // dashboard neon
  put(box(1.9, 0.18, 0.3), DARK, [0, 1.48, 1.2]);
  glow(put(box(0.7, 0.1, 0.02), P.neonCyan, [0.4, 1.58, 1.04]), 1.5);
  glow(put(box(0.5, 0.04, 0.02), P.neonMagenta, [-0.5, 1.58, 1.04]), 1.5);
  // seats
  for (const s of [1, -1]) {
    put(box(0.6, 0.2, 0.6), P.rubber, [s * 0.5, 1.3, 0.35]);
    put(box(0.6, 0.6, 0.15), P.rubber, [s * 0.5, 1.6, 0.0]);
    put(box(0.3, 0.14, 0.12), P.rubber, [s * 0.5, 1.98, -0.02]);
    put(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), P.rubber, [s * 0.5, 1.5, 1.0], { rotation: [90, 0, 0] });
  }
  put(box(0.1, 0.1, 0.5), P.hullDark, [0, 1.35, 0.5]);

  // pillars
  for (const s of [1, -1]) {
    put(box(0.1, 0.78, 0.12), ARMOR, [s * 1.12, 1.67, -0.5]);
    put(box(0.1, 0.78, 0.12), ARMOR, [s * 1.12, 1.67, 0.05 + 0.4]);
    put(box(0.12, 0.8, 0.14), ARMOR, [s * 1.1, 1.62, 1.12], { rotation: [-28, 0, 0] });
    // side windows
    put(new THREE.PlaneGeometry(0.8, 0.5), "#ffffff", [s * 1.205, 1.7, 0.1], { dir: [s, 0, 0], axis: "z", texture: HUD });
    put(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", [s * 1.205, 1.7, 0.85], { dir: [s, 0, 0], axis: "z", texture: HUD });
    put(box(0.04, 0.5, 0.04), P.hullDark, [s * 1.21, 1.7, 0.5]);
    // door armor
    put(box(0.1, 0.5, 1.2), ARMOR, [s * 1.2, 1.22, 0.2]);
    put(box(0.1, 0.5, 0.8), ARMOR, [s * 1.2, 1.22, 1.1]);
    put(new THREE.PlaneGeometry(0.7, 0.18), "#ffffff", [s * 1.255, 1.1, 1.0], { dir: [s, 0, 0], axis: "z", texture: HAZ });
    put(new THREE.PlaneGeometry(0.3, 0.2), "#ffffff", [s * 1.255, 1.25, 0.65], { dir: [s, 0, 0], axis: "z", texture: NUM });
    put(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", [s * 1.258, 1.35, 0.1], { dir: [s, 0, 0], axis: "z", texture: EMBLEM });
    put(box(0.06, 0.05, 0.22), P.metal, [s * 1.27, 1.45, 0.6]);
    // mirror
    put(box(0.05, 0.05, 0.3), P.hullDark, [s * 1.3, 1.78, 1.05], { rotation: [0, 0, 0] });
    put(box(0.1, 0.24, 0.2), P.hullDark, [s * 1.42, 1.78, 1.05]);
    glow(put(box(0.02, 0.16, 0.14), P.neonCyan, [s * 1.37, 1.78, 1.05]), 1.2);
    // underside neon edge
    glow(put(box(0.03, 0.03, 1.9), P.neonCyan, [s * 1.22, 1.01, 0.45]), 1.4);
  }
  // back wall of cab with rear window
  put(box(2.3, 0.5, 0.1), ARMOR, [0, 1.25, -0.5]);
  put(box(0.1, 0.78, 0.1), ARMOR, [1.0, 1.67, -0.5]);
  put(box(0.1, 0.78, 0.1), ARMOR, [-1.0, 1.67, -0.5]);
  put(new THREE.PlaneGeometry(1.8, 0.5), "#ffffff", [0, 1.7, -0.54], { dir: [0, 0, -1], axis: "z", texture: HUD });

  // windshield sloped
  put(new THREE.PlaneGeometry(2.15, 0.9), "#ffffff", [0, 1.65, 1.22], { dir: [0, 0.55, 0.83], axis: "z", texture: HUD });
  put(box(2.3, 0.1, 0.12), ARMOR, [0, 1.52, 1.12], { rotation: [-34, 0, 0] });
  // visor flap
  put(box(2.3, 0.05, 0.4), ARMOR, [0, 2.02, 1.3], { rotation: [-20, 0, 0] });
  put(box(2.3, 0.04, 0.08), HAZ, [0, 2.0, 1.5], { rotation: [-20, 0, 0] });
  put(new THREE.PlaneGeometry(2.2, 0.1), "#ffffff", [0, 1.99, 1.51], { dir: [0, -0.34, 0.94], axis: "z", texture: HAZ });

  // roof
  put(box(2.4, 0.1, 1.9), ARMOR, [0, 2.0, 0.4]);
  put(box(1.8, 0.04, 1.4), DARK, [0, 2.06, 0.35]);
  // light bar
  put(box(1.6, 0.12, 0.16), P.hullDark, [0, 2.14, 0.9]);
  const r = rng(3);
  for (let i = 0; i < 8; i++) {
    glow(put(box(0.16, 0.08, 0.06), i % 2 ? P.neonMagenta : P.neonCyan, [-0.7 + i * 0.2, 2.14, 0.99]), 2);
  }
  // antenna array
  for (const [x, z, h] of [[-0.8, -0.3, 0.7], [-0.6, -0.4, 0.45], [0.8, -0.35, 0.55]]) {
    put(new THREE.CylinderGeometry(0.012, 0.02, h, 5), P.metal, [x, 2.05 + h / 2, z]);
    glow(put(new THREE.SphereGeometry(0.04, 5, 4), P.neonMagenta, [x, 2.07 + h, z]), 2);
  }
  put(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 6), P.metal, [0.5, 2.1, 0.0]);
  put(new THREE.SphereGeometry(0.15, 6, 3, 0, 6.28, 0, 1.4), P.armor, [0.5, 2.15, 0.0]);
  put(box(0.5, 0.08, 0.3), P.metal, [0.0, 2.1, -0.3]);

  // snorkel on A-pillar (left)
  put(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), P.hullDark, [1.28, 1.55, 1.1]);
  put(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 6), P.hullDark, [1.28, 2.1, 1.0], { rotation: [90, 0, 0] });
  put(box(0.14, 0.14, 0.1), P.metal, [1.28, 2.1, 1.17]);
  for (let i = 0; i < 4; i++) put(box(0.2, 0.012, 0.012), P.rubber, [1.28, 2.06 + i * 0.03, 1.23]);
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 6), P.trim, [1.28, 1.2, 1.1]);
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 6), P.trim, [1.28, 1.8, 1.1]);
}
```
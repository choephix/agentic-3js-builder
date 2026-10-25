<!-- call: plan -->

```json
{
  "name": "Convoy Hauler Aegis-7",
  "description": "A six-wheeled low-poly cyberpunk armoured hauler with a crew cab, roof turret and a sealed glowing cargo pod strapped on its rear bed.",
  "builderName": "convoyHauler",
  "size": [3.0, 3.1, 8.0],
  "layout": "Long heavy truck facing +Z. Front: sloped armoured cab with a slit visor windscreen, neon light bar, grille and a angular bull bar. Behind the cab, a low armoured chassis deck runs back; a roof turret with twin guns sits on the cab roof. Three axles of chunky wheels (front axle, two rear axles) with fender armour. The rear half carries a large sealed cargo pod: a faceted cylinder-capsule with a hex locking-band, hazard stripes, a glowing cyan seam and a biohazard-style seal emblem, held by cradle straps. Style: faceted flat-shaded plates, dark gunmetal hull with yellow hazard trim, magenta and cyan neon accents, panel-line paints and SVG decals (stencil numbers, warning labels, glyphs). Wheels rest on the floor; everything else is above.",
  "palette": {
    "hull": "#2f3540",
    "hullDark": "#1a1e26",
    "plate": "#4a5262",
    "trim": "#e7b814",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fa8",
    "glass": "#0e2a3a",
    "tire": "#15161a",
    "rim": "#8a93a3",
    "podShell": "#d8dde6",
    "podBand": "#2a2f3a",
    "warnRed": "#d83a2a",
    "lamp": "#fff3c0"
  },
  "mounts": {
    "chassisTop": [0, 1.2, 0],
    "cabRoof": [0, 2.45, 2.3],
    "turretRing": [0, 2.5, 1.9],
    "axleFront": [0, 0.55, 2.6],
    "axleMid": [0, 0.55, -1.6],
    "axleRear": [0, 0.55, -3.0],
    "cabFront": [0, 1.6, 3.3],
    "podCradle": [0, 1.35, -1.6]
  },
  "joints": [
    { "name": "body", "at": [0, 1.0, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turretYaw", "parent": "body", "at": [0, 2.5, 1.9], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunPitch", "parent": "turretYaw", "at": [0, 2.85, 2.2], "dir": [0, 0, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.25, 0.55, 2.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.25, 0.55, 2.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.25, 0.55, -1.6], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.25, 0.55, -1.6], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.25, 0.55, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.25, 0.55, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Armoured ladder chassis and deck: long hull slab with chamfered side skirts, panelled paint with rivets, hazard-striped edge trim, underbody axles, drive shafts and diffs, side fuel tanks and tool lockers, rear bumper with tail lights and tow hooks, exhaust stacks behind the cab. Panel-line paints, stencil decals.",
      "box": [[-1.5, 0.45, -4.0], [1.5, 1.4, 2.4]],
      "attaches": "Cab sits on chassisTop at the front; pod cradle on podCradle; axle lines at axleFront/axleMid/axleRear.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "wheels",
      "builds": "Six chunky faceted wheels (octagonal tyres with tread blocks, rim plates, hub caps with neon ring and lug nuts), plus angular fender armour over each wheel with hazard edge and mud paint at the bottom, suspension arms and springs.",
      "box": [[-1.5, 0.0, -3.7], [1.5, 1.3, 3.3]],
      "attaches": "Wheels ride wheelFL..wheelRR at the axle mounts; fenders attach to chassis sides.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "cabShell",
      "builds": "Armoured crew cab body: sloped faceted shell with roof plate, side armour panels, door outlines with handles, side mirrors with cameras, small side slit windows, roof rails, antenna array and roof sensors, rear cab wall with ladder. Interior seats and dash visible behind glass (simple blocks, cyan screen glow). Panelled paint.",
      "box": [[-1.4, 1.2, 0.7], [1.4, 2.5, 3.0]],
      "attaches": "Rests on chassisTop; front face meets cabFront part at z=3.0; roof at cabRoof carries the turret ring.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cabFront",
      "builds": "The cab's face: sloped hood/nose plate, slit visor windscreen with glass colour and wiper, glowing cyan headlight strips and lamps, magenta underglow bar, grille with vertical slats and emblem decal, angular bull bar with hazard stripes, tow shackles, front bumper with fog lights, a drawn number stencil and a decal eye-like visor glyph.",
      "box": [[-1.4, 0.7, 3.0], [1.4, 2.2, 3.9]],
      "attaches": "Back face meets cabShell at z=3.0 along cabFront mount; sits above the front wheels.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "turret",
      "builds": "Roof turret: ring base with teeth, rotating faceted housing with armour plates, sensor eye with glowing lens, ammo box, twin gun barrels with shrouds, muzzle brakes and recoil sleeves, hazard marks, magenta targeting laser dot lamp. Housing rides turretYaw, guns ride gunPitch.",
      "box": [[-0.7, 2.45, 1.4], [0.7, 3.1, 3.4]],
      "attaches": "Base seats on turretRing at the cab roof.",
      "joints": ["turretYaw", "gunPitch"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cargoPod",
      "builds": "Sealed cargo pod: faceted capsule/cylinder shell on a cradle, three dark locking bands with rivets and yellow hazard chevrons, glowing cyan seam line along the top, a circular seal hatch with biohazard-style glyph decal and warning labels, end caps with pressure valves and small status LEDs, cradle frame and ratchet straps, rear light bar. Paint: scuffed white shell with soot near the bottom.",
      "box": [[-1.35, 1.3, -4.0], [1.35, 3.1, 0.6]],
      "attaches": "Rests on podCradle on the chassis deck, behind the cab rear wall at z=0.7.",
      "joints": ["body"],
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

export function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55, W = 0.5;
  const rand = rng(11);
  const HAZ = svg(`<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/><path d="M0 16L12 0H24L12 16ZM32 16L44 0H56L44 16Z" fill="#15161a"/></svg>`, { size: 128 });
  const mud = paint((p, n) => {
    const m = smoothstep(0.7, 0.2, p.y) * (0.5 + noise(p, 0.15, 3));
    return mix(mix(P.hullDark, P.plate, noise(p, 0.3, 1) * 0.6), "#4a3a28", Math.min(m, 0.9));
  });
  const tyre = paint((p, n) => mix(P.tire, "#2b2d33", noise(p, 0.1, 5) * 0.5));
  const axles: [string, number, number, number][] = [
    ["wheelFL", 1, 2.6, 0], ["wheelFR", -1, 2.6, 0],
    ["wheelML", 1, -1.6, 0], ["wheelMR", -1, -1.6, 0],
    ["wheelRL", 1, -3, 0], ["wheelRR", -1, -3, 0],
  ];
  for (const [name, s, z] of axles.map(a => [a[0], a[1], a[2]] as [string, number, number])) {
    const j = J[name];
    const cx = s * 1.25;
    const ax: [number, number, number] = [s, 0, 0];
    // tyre: octagonal
    b.part(new THREE.CylinderGeometry(R, R, W, 8), tyre, { bone: j, at: [cx, 0.55, z], dir: ax, flat: true });
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI / 4;
      const py = 0.55 + Math.sin(a) * (R + 0.02), pz = z + Math.cos(a) * (R + 0.02);
      b.part(new THREE.BoxGeometry(W * 0.9, 0.07, 0.2), P.hullDark, {
        bone: j, at: [cx, py, pz], dir: [0, Math.sin(a), Math.cos(a)], axis: "y",
      });
    }
    // rim plate
    const ox = cx + s * (W / 2 + 0.01);
    b.part(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 8), P.rim, { bone: j, at: [ox, 0.55, z], dir: ax, flat: true });
    b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.1, 8), P.plate, { bone: j, at: [ox + s * 0.05, 0.55, z], dir: ax, flat: true });
    glow(b.part(new THREE.TorusGeometry(0.24, 0.016, 4, 12), P.neonCyan, { bone: j, at: [ox + s * 0.03, 0.55, z], dir: ax, axis: "z" }), 1.5);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), P.hullDark, {
        bone: j, at: [ox + s * 0.04, 0.55 + Math.sin(a) * 0.29, z + Math.cos(a) * 0.29], dir: ax,
      });
    }
    // fender: angular arch of three plates
    const fx = s * 1.25;
    const fw = W + 0.2;
    const arc = [[-60, 0.0], [-20, 0.0], [20, 0.0], [60, 0.0]];
    const pts = [-65, -22, 22, 65];
    for (let i = 0; i < 3; i++) {
      const a0 = pts[i] * Math.PI / 180, a1 = pts[i + 1] * Math.PI / 180;
      const r = R + 0.14;
      const p0: [number, number] = [0.55 + Math.cos(a0) * r, z + Math.sin(a0) * r];
      const p1: [number, number] = [0.55 + Math.cos(a1) * r, z + Math.sin(a1) * r];
      // y is up: angle from front(+z) measured over top
      const A = [0.55 + Math.cos(a0) * r, z + Math.sin(a0) * r];
      void A; void p0; void p1; void arc;
      const t0 = [0.55 + Math.sin(a0) * 0 + Math.cos(a0) * r, z + Math.sin(a0) * r];
      const q0: [number, number, number] = [fx, 0.55 + Math.cos(a0) * r, z + Math.sin(a0) * r];
      const q1: [number, number, number] = [fx, 0.55 + Math.cos(a1) * r, z + Math.sin(a1) * r];
      void t0;
      b.frustumBox(q0, q1, [fw, 0.05], [fw, 0.05], { bone: J.body, color: mud });
    }
    // hazard edge strips on fender front/back
    for (const e of [-1, 1]) {
      const a = e * 65 * Math.PI / 180, r = R + 0.14;
      b.part(new THREE.BoxGeometry(fw, 0.1, 0.06), "#e7b814", {
        bone: J.body, at: [fx, 0.55 + Math.cos(a) * r - 0.04, z + Math.sin(a) * r],
      });
    }
    // outer hazard decal on fender top
    b.part(new THREE.PlaneGeometry(0.5, 0.12), "#ffffff", {
      bone: J.body, at: [fx + s * (fw / 2 + 0.003), 0.55 + R + 0.1, z], dir: [s, 0, 0], axis: "z", texture: HAZ,
    });
    // suspension arm and spring
    const inner = s * 0.85;
    b.rod([inner, 0.62, z], [cx - s * 0.2, 0.55, z], 0.045, P.plate, { bone: J.body });
    b.rod([inner, 0.95, z + 0.2], [cx - s * 0.25, 0.6, z], 0.03, P.rim, { bone: J.body });
    const spring: [number, number, number][] = [];
    for (let k = 0; k <= 20; k++) {
      const t = k / 20, a = t * Math.PI * 2 * 4;
      spring.push([s * 1.0 + Math.cos(a) * 0.06, 0.78 + t * 0.3, z - 0.25 + Math.sin(a) * 0.06]);
    }
    b.sweep(spring, 0.012, { bone: J.body, color: P.trim, sides: 4 });
  }
  // axle beams
  for (const z of [2.6, -1.6, -3]) b.rod([-1.25, 0.55, z], [1.25, 0.55, z], 0.07, P.hullDark, { bone: J.body });
  void rand;
}
```

<!-- call: cabFront -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCabFront({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true, ...extra });
  const HAZ = "#e7b814";

  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.plate, smoothstep(0.3, 0.8, noise(p, 0.3, 4)));
    const seam = Math.abs(((p.x * 3.3) % 1)) < 0.03 || Math.abs(((p.y * 4) % 1)) < 0.03;
    const c = seam ? mix(base, "#0a0c10", 0.7) : base;
    return mix(c, "#9aa3b5", 0.25 * smoothstep(0.5, 1, n.y));
  });
  const hazard = paint((p) => (Math.floor((p.x + p.y) * 9) % 2 ? HAZ : "#15161a"));

  // hood / nose block with sloped top
  box(2.7, 0.7, 0.85, hullPaint, [0, 1.15, 3.45]);
  box(2.5, 0.12, 0.8, hullPaint, [0, 1.55, 3.4], [-12, 0, 0]);
  // sloped windscreen frame section
  box(2.6, 0.55, 0.3, hullPaint, [0, 1.95, 3.1], [-28, 0, 0]);
  // visor glass slit
  box(2.2, 0.22, 0.06, P.glass, [0, 1.95, 3.27], [-28, 0, 0]);
  // visor glyph decal
  const eye = svg(
    `<svg viewBox="0 0 100 30"><path d="M4 15 Q50 -8 96 15 Q50 38 4 15Z" fill="none" stroke="#2ff3ff" stroke-width="4"/><circle cx="50" cy="15" r="8" fill="#ff2fa8"/><rect x="48" y="7" width="4" height="16" fill="#0e2a3a"/></svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(0.9, 0.27), "#ffffff", {
      bone, at: [0, 1.95, 3.31], dir: [0, 0.5, 0.88], axis: "z", texture: eye,
    }),
    1,
  );
  // wiper
  b.rod([0.2, 1.8, 3.3], [0.8, 2.0, 3.24], 0.015, P.hullDark, { bone });

  // grille
  box(1.5, 0.55, 0.08, P.hullDark, [0, 1.1, 3.9]);
  for (let i = -6; i <= 6; i++) box(0.05, 0.5, 0.06, P.rim, [i * 0.11, 1.1, 3.94]);
  const emblem = svg(
    `<svg viewBox="0 0 40 40"><polygon points="20,3 37,32 3,32" fill="#e7b814" stroke="#1a1e26" stroke-width="3"/><circle cx="20" cy="22" r="5" fill="#ff2fa8"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", { bone, at: [0, 1.4, 3.945], dir: [0, 0, 1], axis: "z", texture: emblem });

  // headlight strips and lamps
  for (const s of [1, -1]) {
    glow(box(0.55, 0.08, 0.06, P.neonCyan, [s * 0.85, 1.45, 3.88]), 1.6);
    glow(b.part(new THREE.CylinderGeometry(0.13, 0.15, 0.12, 8), P.lamp, { bone, at: [s * 1.12, 1.15, 3.88], dir: [0, 0, 1] }), 1.5);
    glow(b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.08, 6), P.warnRed === "" ? P.lamp : "#ffd070", { bone, at: [s * 1.0, 0.82, 3.92], dir: [0, 0, 1] }), 1.2);
    // fender-side armour on nose
    box(0.12, 0.6, 0.8, P.plate, [s * 1.37, 1.15, 3.45]);
    // tow shackles
    b.rod([s * 0.55, 0.85, 3.9], [s * 0.55, 0.85, 4.0], 0.03, P.rim, { bone });
    b.sweep(
      new THREE.CatmullRomCurve3 ? [[s * 0.5, 0.85, 3.98], [s * 0.5, 0.74, 4.0], [s * 0.62, 0.74, 4.0], [s * 0.62, 0.85, 3.98]] : [],
      0.016,
      { bone, color: P.trim, section: { ngon: 6 } },
    );
  }

  // front bumper
  box(2.8, 0.22, 0.25, hazard, [0, 0.8, 3.85]);
  box(2.6, 0.12, 0.2, P.hullDark, [0, 0.66, 3.8]);
  // underglow
  glow(box(2.2, 0.05, 0.1, P.neonMagenta, [0, 0.68, 3.88]), 1.8);

  // bull bar
  for (const s of [1, -1]) {
    b.rod([s * 0.9, 0.85, 3.9], [s * 0.9, 1.7, 3.97], 0.05, P.hullDark, { bone, sides: 6 });
    b.rod([s * 0.3, 0.85, 3.92], [s * 0.3, 1.55, 3.97], 0.04, P.hullDark, { bone, sides: 6 });
  }
  b.rod([-0.95, 1.68, 3.97], [0.95, 1.68, 3.97], 0.05, hazard, { bone, sides: 6 });
  b.rod([-0.95, 1.25, 3.97], [0.95, 1.25, 3.97], 0.04, hazard, { bone, sides: 6 });

  // number stencil on hood
  const num = svg(
    `<svg viewBox="0 0 80 40"><text x="40" y="32" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="34" fill="#e7b814">A-7</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.7, 0.35), "#ffffff", { bone, at: [0, 1.62, 3.38], dir: [0, 1, 0.2], axis: "z", up: [0, 0, -1], texture: num });
  // hood vents
  for (let i = -2; i <= 2; i++) box(0.3, 0.03, 0.04, P.hullDark, [i * 0.4, 1.6, 3.62], [-12, 0, 0]);
}
```

<!-- call: turret -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pit = J.gunPitch;
  const [rx, ry, rz] = M.turretRing;

  const armor = paint((p, n) => {
    const base = mix(P.hull, P.plate, smoothstep(0.3, 0.8, noise(p, 0.15, 3)));
    const top = smoothstep(0.4, 1, n.y);
    return mix(base, "#6a7486", top * 0.4);
  });
  const dark = paint((p) => mix(P.hullDark, P.hull, noise(p, 0.08, 5)));

  const hazard = svg(
    `<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="${P.trim}"/>` +
      [0, 8, 16, 24, 32].map((x) => `<path d="M${x} 8 L${x + 4} 0 L${x + 8} 0 L${x + 4} 8Z" fill="#111"/>`).join("") +
      `</svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0a1a24"/><circle cx="32" cy="32" r="20" fill="${P.neonCyan}"/><circle cx="32" cy="32" r="9" fill="#fff"/><circle cx="25" cy="25" r="4" fill="#bff"/></svg>`,
    { size: 128 },
  );
  const numTex = svg(
    `<svg viewBox="0 0 48 24"><rect width="48" height="24" fill="none"/><text x="24" y="19" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="20" fill="${P.trim}">A7</text></svg>`,
    { size: 128 },
  );

  // ring base (rides body)
  b.lathe(
    [[0, 0], [0.62, 0], [0.62, 0.05], [0.55, 0.1], [0.5, 0.1], [0, 0.1]],
    { at: [rx, ry, rz], segments: 12, color: dark, bone: J.body },
  );
  b.ring({ at: [rx, ry + 0.08, rz], axis: [0, 1, 0] } as any, { count: 16, radius: 0.58 }, (it: any) =>
    b.part(new THREE.BoxGeometry(0.06, 0.05, 0.05), P.rim, { at: it.at, bone: J.body }),
  );

  // housing
  const cz = rz + 0.1;
  const hy = ry + 0.28;
  b.part(new THREE.CylinderGeometry(0.5, 0.58, 0.34, 8), armor, { at: [rx, hy, cz], bone: yaw, flat: true });
  b.part(new THREE.CylinderGeometry(0.38, 0.5, 0.12, 8), P.plate, { at: [rx, hy + 0.2, cz], bone: yaw, flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.3, 0.7), P.plate, { at: [s * 0.55, hy, cz + 0.05], bone: yaw, rotation: [0, 0, s * 8], flat: true });
    b.part(new THREE.BoxGeometry(0.02, 0.1, 0.5), P.trim, { at: [s * 0.62, hy, cz + 0.05], bone: yaw });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.26), P.hullDark, { at: [s * 0.3, hy + 0.27, cz - 0.2], bone: yaw });
  }
  // hazard stripe front band
  b.part(new THREE.PlaneGeometry(0.7, 0.14), "#ffffff", {
    at: [rx, hy - 0.08, cz + 0.52], bone: yaw, dir: [0, -0.15, 1], axis: "z", texture: hazard,
  });
  // ammo box on back
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.3), P.hullDark, { at: [rx, hy, cz - 0.62], bone: yaw, flat: true });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
    at: [rx, hy, cz - 0.775], bone: yaw, dir: [0, 0, -1], axis: "z", texture: numTex,
  });
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.2), P.trim, { at: [rx, hy + 0.17, cz - 0.62], bone: yaw });

  // sensor eye on top
  b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 8), P.hullDark, { at: [rx - 0.25, hy + 0.34, cz + 0.05], bone: yaw, flat: true });
  glow(
    b.part(new THREE.CircleGeometry(0.1, 12), "#ffffff", {
      at: [rx - 0.25, hy + 0.34, cz + 0.2], bone: yaw, dir: [0, 0.2, 1], axis: "z", texture: eyeTex,
    }),
    1.3,
  );
  // antenna + laser lamp
  b.rod([rx + 0.3, hy + 0.3, cz - 0.1], [rx + 0.3, hy + 0.75, cz - 0.1], 0.012, P.rim, { bone: yaw });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { at: [rx + 0.3, hy + 0.77, cz - 0.1], bone: yaw }), 2);

  // guns on pitch joint
  const gy = pit.at.y;
  const gz = pit.at.z;
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.3), armor, { at: [0, gy, gz - 0.1], bone: pit, flat: true });
  for (const s of [1, -1]) {
    const x = s * 0.17;
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), P.plate, { at: [x, gy, gz + 0.3], dir: [0, 0, 1], bone: pit, flat: true });
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.75, 8), P.hullDark, { at: [x, gy, gz + 0.7], dir: [0, 0, 1], bone: pit, flat: true });
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.12, 8), P.hull, { at: [x, gy, gz + 0.5], dir: [0, 0, 1], bone: pit, flat: true });
    b.part(new THREE.CylinderGeometry(0.075, 0.06, 0.1, 8), P.trim, { at: [x, gy, gz + 1.05], dir: [0, 0, 1], bone: pit, flat: true });
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.08), P.hullDark, { at: [x, gy + 0.06, gz + 1.08], bone: pit });
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.neonCyan, { at: [x, gy, gz + 1.11], bone: pit }), 1.5);
  }
  b.part(new THREE.BoxGeometry(0.1, 0.04, 0.5), P.trim, { at: [0, gy + 0.11, gz + 0.1], bone: pit });
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildChassis({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, len: number, seg: number, color: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { bone, at, dir });

  // paints
  const hullPaint = paint((p, n) => {
    const base = mix(P.hull, P.plate, noise(p, 0.5, 3) * 0.6);
    const u = n.y > 0.5 ? p.x : p.z, v = n.y > 0.5 ? p.z : p.y;
    const gx = Math.abs(((u / 0.5) % 1 + 1) % 1 - 0.5), gy = Math.abs(((v / 0.6) % 1 + 1) % 1 - 0.5);
    let c = mix(base, P.hullDark, smoothstep(0.47, 0.5, Math.max(gx, gy)));
    const soot = smoothstep(0.9, 0.5, p.y) * 0.5;
    c = mix(c, P.hullDark, soot);
    return c;
  });
  const hazard = paint((p) => ((Math.floor((p.z + p.x + p.y) / 0.18) % 2 + 2) % 2 ? P.trim : P.hullDark));
  const tank = paint((p, n) => mix(mix(P.plate, P.hull, noise(p, 0.3, 5)), P.hullDark, smoothstep(0.2, -0.8, n.y)));

  // main deck slab and frame
  box(2.4, 0.3, 6.2, hullPaint, [0, 1.05, -0.8]);
  box(2.0, 0.16, 6.2, hullPaint, [0, 1.25, -0.8]);
  // chamfered skirts
  for (const s of [1, -1]) {
    b.extrude([[0, 0], [0.3, 0], [0.3, 0.2], [0.12, 0.34], [0, 0.34]], {
      at: [s * 1.2, 0.8, -3.9], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.2, color: hullPaint, bone,
    });
    // hazard edge trim
    box(0.08, 0.06, 6.0, hazard, [s * 1.42, 1.2, -0.8]);
    // ladder rails
    box(0.18, 0.28, 6.2, P.hullDark, [s * 0.7, 0.8, -0.8]);
  }
  // cross members
  for (let i = 0; i < 7; i++) box(1.4, 0.14, 0.14, P.plate, [0, 0.8, -3.6 + i * 1.0]);
  // axles, diffs, shafts
  for (const z of [2.6, -1.6, -3.0]) {
    cyl(0.07, 0.07, 2.5, 8, P.rim, [0, 0.55, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), P.plate, { bone, at: [0, 0.55, z], scale: [1, 0.9, 1] });
  }
  cyl(0.06, 0.06, 4.2, 6, P.rim, [0, 0.62, 0.5], [0, 0, 1]);
  cyl(0.06, 0.06, 1.4, 6, P.rim, [0, 0.62, -2.3], [0, 0, 1]);
  // fuel tanks and lockers
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.5, 8, tank, [s * 1.25, 0.95, 1.4], [0, 0, 1]);
    for (const z of [0.8, 2.0]) box(0.06, 0.1, 0.3, P.hullDark, [s * 1.25, 0.62, z]);
    box(0.4, 0.4, 1.4, tank, [s * 1.3, 1.0, -0.9]);
    box(0.02, 0.3, 0.02, P.trim, [s * 1.51, 1.0, -0.9]);
    b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
      bone, at: [s * 1.512, 1.05, 1.4], dir: [s, 0, 0], axis: "z",
      texture: svg(`<svg viewBox="0 0 60 30"><rect width="60" height="30" fill="#e7b814"/><text x="30" y="21" font-size="16" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#1a1e26">FUEL 07</text></svg>`, { size: 128 }),
    });
    // exhaust stacks
    cyl(0.1, 0.12, 1.1, 8, P.hullDark, [s * 1.05, 1.9, 0.85], [0, 1, 0]);
    cyl(0.13, 0.13, 0.08, 8, P.trim, [s * 1.05, 2.45, 0.85], [0, 1, 0]);
    glow(b.part(new THREE.CircleGeometry(0.08, 8), P.neonMagenta, { bone, at: [s * 1.05, 2.5, 0.85], dir: [0, 1, 0], axis: "z" }), 1);
    // tail lights
    glow(box(0.4, 0.14, 0.06, P.warnRed, [s * 0.9, 1.1, -4.03]), 1.5);
    // tow hooks
    b.sweep([[s * 0.5, 0.75, -4.0], [s * 0.5, 0.75, -4.25], [s * 0.5, 0.6, -4.3]], 0.04, { bone, color: P.rim });
  }
  // rear bumper
  box(3.0, 0.3, 0.3, hullPaint, [0, 0.9, -3.95]);
  box(3.0, 0.07, 0.31, hazard, [0, 1.07, -3.95]);
  // rivets
  const riv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 26; i++)
    for (const s of [1, -1]) riv.push(new THREE.SphereGeometry(0.025, 5, 3).translate(s * 1.05, 1.34, -3.7 + i * 0.22));
  b.part(mergeAll(riv), P.rim, { bone, at: [0, 0, 0] });
  // stencil on deck edge
  b.part(new THREE.PlaneGeometry(0.9, 0.3), "#ffffff", {
    bone, at: [0.6, 1.335, 1.6], dir: [0, 1, 0], axis: "z", up: [0, 0, 1],
    texture: svg(`<svg viewBox="0 0 90 30"><text x="45" y="23" font-size="22" font-family="monospace" font-weight="bold" text-anchor="middle" fill="#e7b814">AEGIS-7</text></svg>`, { size: 160 }),
  });
  // cyan underglow
  glow(box(1.6, 0.04, 0.05, P.neonCyan, [0, 0.62, -3.6]), 1.2);
  glow(box(1.6, 0.04, 0.05, P.neonMagenta, [0, 0.62, 1.8]), 1.2);

  function mergeAll(gs: THREE.BufferGeometry[]) {
    let pos: number[] = [], idx: number[] = [], o = 0;
    for (const g of gs) {
      const p = g.getAttribute("position");
      for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i));
      g.getIndex()!.array.forEach((v: number) => idx.push(v + o));
      o += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setIndex(idx);
    m.computeVertexNormals();
    return m;
  }
  void R;
}
```

<!-- call: cabShell -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

export function buildCabShell({ b, J, P }: any) {
  const body = J.body;
  const HULL = panelled(
    paint((p: THREE.Vector3, n: THREE.Vector3) => {
      const t = smoothstep(-0.5, 0.9, n.y);
      return mix(P.hullDark, P.plate, 0.35 + 0.4 * t + 0.15 * noise(p, 0.3, 4));
    }),
    { size: 0.28, rivets: 0.07 },
  );
  const PLATE = panelled(metal("iron", { tarnish: 0.3 }), { size: 0.2, rivets: 0.06 });

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, rotation: rot, flat: true, ...opt });

  // main shell
  box(2.7, 1.0, 2.2, HULL, [0, 1.75, 1.85]);
  // sloped roof plate
  box(2.5, 0.12, 1.9, PLATE, [0, 2.3, 1.85]);
  // sloped front shoulder (faceted)
  box(2.7, 0.5, 0.5, HULL, [0, 2.0, 2.85], [-28, 0, 0]);
  box(2.4, 0.1, 0.6, P.hullDark, [0, 2.38, 2.6], [-20, 0, 0]);
  // lower base skirt
  box(2.9, 0.22, 2.2, P.hullDark, [0, 1.3, 1.85]);
  // rear wall
  box(2.6, 1.1, 0.12, PLATE, [0, 1.8, 0.76]);

  const slit = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" rx="3" fill="#0e2a3a"/><path d="M0 28L24 2h8L8 30z" fill="#2ff3ff" opacity=".25"/><rect x="8" y="9" width="48" height="2" fill="#2ff3ff" opacity=".6"/></svg>`,
  );
  const door = svg(
    `<svg viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="4" fill="none" stroke="#12151b" stroke-width="3"/><rect x="42" y="30" width="14" height="4" fill="#e7b814"/><path d="M6 56h20l8-8" stroke="#e7b814" stroke-width="3" fill="none"/></svg>`,
  );
  const num = svg(
    `<svg viewBox="0 0 64 32"><text x="32" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="28" fill="#e7b814">07</text></svg>`,
  );

  for (const s of [1, -1]) {
    const x = s * 1.36;
    const dir = [s, 0, 0];
    // side armour panels
    box(0.1, 0.55, 1.9, PLATE, [s * 1.38, 1.5, 1.85]);
    // door decal
    b.part(new THREE.PlaneGeometry(1.0, 0.9), "#ffffff", { bone: body, at: [s * 1.41, 1.85, 1.45], dir, axis: "z", texture: door });
    // slit window
    glow(b.part(new THREE.PlaneGeometry(0.8, 0.28), "#ffffff", { bone: body, at: [s * 1.41, 2.1, 2.3], dir, axis: "z", texture: slit }), 0.5);
    // number stencil
    b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: body, at: [s * 1.43, 1.5, 2.2], dir, axis: "z", texture: num });
    // handle
    box(0.06, 0.06, 0.28, P.trim, [s * 1.43, 1.75, 1.15]);
    // mirror arm + housing + camera
    b.rod([s * 1.38, 2.0, 2.75], [s * 1.7, 2.1, 2.8], 0.025, P.hullDark, { bone: body });
    box(0.12, 0.3, 0.2, P.hullDark, [s * 1.75, 2.1, 2.8]);
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.neonCyan, { bone: body, at: [s * 1.75, 2.2, 2.92] }), 1.5);
    // roof rails
    b.rod([s * 1.1, 2.4, 0.9], [s * 1.1, 2.4, 2.7], 0.03, P.trim, { bone: body });
    for (const z of [1.0, 1.8, 2.6]) b.rod([s * 1.1, 2.37, z], [s * 1.1, 2.3, z], 0.03, P.hullDark, { bone: body });
    // interior seat blocks visible behind glass
    box(0.5, 0.5, 0.5, P.hullDark, [s * 0.5, 1.75, 1.6]);
    box(0.5, 0.5, 0.1, P.warnRed, [s * 0.5, 2.0, 1.33]);
  }

  // dash and cyan screen
  box(2.2, 0.2, 0.3, P.hullDark, [0, 1.95, 2.75]);
  glow(box(0.7, 0.2, 0.04, P.neonCyan, [0, 2.08, 2.6], [-25, 0, 0]), 1.5);

  // antennas and sensors on roof
  for (const [x, h] of [[-0.9, 0.9], [-0.7, 0.6]] as number[][]) {
    b.rod([x, 2.36, 1.1], [x, 2.36 + h, 1.1], 0.015, P.rim, { bone: body });
  }
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: body, at: [-0.9, 3.28, 1.1] }), 2);
  b.part(new THREE.CylinderGeometry(0.15, 0.2, 0.12, 6), P.hullDark, { bone: body, at: [0.8, 2.42, 1.2], flat: true });
  b.part(new THREE.SphereGeometry(0.12, 6, 4, 0, 6.3, 0, 1.6), P.plate, { bone: body, at: [0.8, 2.48, 1.2], flat: true });
  // turret ring seat
  b.part(new THREE.CylinderGeometry(0.55, 0.62, 0.1, 10), P.plate, { bone: body, at: [0, 2.4, 1.9], flat: true });

  // rear wall ladder
  for (const x of [-0.35, 0.35]) b.rod([x, 1.3, 0.68], [x, 2.35, 0.68], 0.025, P.trim, { bone: body });
  for (let i = 0; i < 7; i++) b.rod([-0.35, 1.45 + i * 0.14, 0.68], [0.35, 1.45 + i * 0.14, 0.68], 0.018, P.rim, { bone: body });
  // hazard stripe on rear wall top
  box(2.6, 0.08, 0.04, P.trim, [0, 2.3, 0.7]);
}
```

<!-- call: cargoPod -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCargoPod({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = 0.88;
  const CY = 2.15;
  const Z0 = -3.75;
  const Z1 = 0.4;
  const zc = (Z0 + Z1) / 2;
  const L = Z1 - Z0;
  const ax: [number, number, number] = [0, 0, 1];

  const shell = paint((p, n) => {
    let c = mix("#d8dde6", "#b9c0cc", noise(p, 0.25, 3));
    const scuff = smoothstep(0.55, 0.8, noise(p, 0.08, 9));
    c = mix(c, "#8e95a1", scuff * 0.5);
    const soot = smoothstep(0.1, -0.8, n.y) * (0.5 + 0.5 * noise(p, 0.3, 5));
    return mix(c, "#2a2b30", soot * 0.8);
  });

  // main shell: faceted cylinder
  b.part(new THREE.CylinderGeometry(R, R, L - 0.5, 10), shell, {
    bone, at: [0, CY, zc], dir: ax, flat: true,
  });
  // capsule end caps
  for (const s of [1, -1]) {
    const z = zc + s * (L / 2 - 0.25);
    b.part(new THREE.SphereGeometry(R, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), shell, {
      bone, at: [0, CY, z], dir: [0, 0, s], flat: true,
    });
    // end rim plate
    b.part(new THREE.CylinderGeometry(R * 0.4, R * 0.45, 0.06, 8), P.hullDark, {
      bone, at: [0, CY, z + s * (R * 0.92)], dir: [0, 0, s], flat: true,
    });
    // pressure valves
    for (const vx of [-0.18, 0.18]) {
      b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 6), P.rim, {
        bone, at: [vx, CY + 0.12, z + s * (R * 0.97)], dir: [0, 0, s],
      });
    }
    // status LEDs
    const cols = [P.neonCyan, P.warnRed, P.neonMagenta];
    cols.forEach((c, i) => {
      glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), c, {
        bone, at: [-0.2 + i * 0.2, CY - 0.2, z + s * (R * 0.97)],
      }), 1.5);
    });
  }

  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 6} 16 L${i * 10 + 2} 0 L${i * 10 + 7} 0 L${i * 10 - 1} 16Z" fill="#15161a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );

  // locking bands
  const bandZ = [-3.1, -1.6, -0.1];
  bandZ.forEach((z, bi) => {
    b.part(new THREE.CylinderGeometry(R + 0.06, R + 0.06, 0.22, 10), P.podBand, {
      bone, at: [0, CY, z], dir: ax, flat: true,
    });
    // hex lock ring on middle band
    if (bi === 1)
      b.part(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.1, 6), P.hullDark, {
        bone, at: [0, CY, z], dir: ax, flat: true,
      });
    // hazard chevron plates on sides
    for (const s of [1, -1]) {
      b.part(new THREE.PlaneGeometry(0.5, 0.14), "#ffffff", {
        bone, at: [s * (R + 0.075), CY - 0.05, z], dir: [s, 0, 0], axis: "z", texture: hazard,
      });
    }
    // rivets
    const r = rng(bi + 4);
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      for (const dz of [-0.07, 0.07]) {
        const g = new THREE.SphereGeometry(0.025, 5, 3);
        g.translate(Math.sin(a) * (R + 0.075), CY + Math.cos(a) * (R + 0.075), z + dz);
        geos.push(g);
      }
    }
    void r;
    geos.forEach((g) => b.part(g, P.rim, { bone, at: [0, 0, 0] }));
  });

  // glowing cyan seam on top
  glow(b.box ? (b as any).box : b.part(new THREE.BoxGeometry(0.07, 0.05, L - 0.6), P.neonCyan, {
    bone, at: [0, CY + R + 0.01, zc],
  }), 1.6);

  // seal hatch on left side
  const hatchX = R + 0.02;
  b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 8), P.plate, {
    bone, at: [hatchX, CY, -2.35], dir: [1, 0, 0], flat: true,
  });
  b.part(new THREE.TorusGeometry(0.42, 0.04, 4, 8), P.trim, {
    bone, at: [hatchX + 0.04, CY, -2.35], dir: [1, 0, 0], axis: "z",
  });
  const bio = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#2a2f3a"/>
    <g fill="none" stroke="#e7b814" stroke-width="7"><circle cx="50" cy="40" r="15"/><circle cx="37" cy="62" r="15"/><circle cx="63" cy="62" r="15"/></g>
    <circle cx="50" cy="52" r="6" fill="#e7b814"/></svg>`,
    { size: 192 },
  );
  b.part(new THREE.CircleGeometry(0.36, 12), "#ffffff", {
    bone, at: [hatchX + 0.06, CY, -2.35], dir: [1, 0, 0], axis: "z", texture: bio,
  });

  // warning labels
  const label = svg(
    `<svg viewBox="0 0 80 40"><rect width="80" height="40" fill="#f2f2f2" stroke="#d83a2a" stroke-width="3"/>
    <path d="M8 32 L20 8 L32 32Z" fill="#e7b814" stroke="#15161a" stroke-width="2"/>
    <text x="38" y="18" font-size="10" font-weight="bold" fill="#d83a2a" font-family="monospace">SEALED</text>
    <text x="38" y="31" font-size="8" fill="#15161a" font-family="monospace">AEGIS-7</text></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.55, 0.28), "#ffffff", {
    bone, at: [hatchX + 0.01, CY + 0.6, -1.0], dir: [1, 0, 0], axis: "z", texture: label,
  });
  b.part(new THREE.PlaneGeometry(0.55, 0.28), "#ffffff", {
    bone, at: [-hatchX - 0.01, CY + 0.35, -1.0], dir: [-1, 0, 0], axis: "z", texture: label,
  });

  // cradle frame and rails
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.16, 0.16, L - 0.3), P.hullDark, {
      bone, at: [s * 0.95, 1.38, zc],
    });
    b.part(new THREE.BoxGeometry(0.12, 0.12, L - 0.5), P.plate, {
      bone, at: [s * 0.7, 1.55, zc],
    });
  }
  [-3.4, -2.35, -0.85, 0.2].forEach((z) => {
    b.part(new THREE.BoxGeometry(2.0, 0.14, 0.2), P.hullDark, { bone, at: [0, 1.38, z] });
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.2, 0.3, 0.2), P.plate, { bone, at: [s * 0.8, 1.52, z], rotation: [0, 0, s * 25] });
  });

  // ratchet straps over the shell
  [-2.35, -0.85].forEach((z) => {
    for (let i = 0; i < 10; i++) {
      const a0 = (i / 10) * Math.PI * 2 + 0.15;
      const mid = a0 + 0.31;
      b.part(new THREE.BoxGeometry(0.34, 0.1, 0.6), P.podBand, {
        bone,
        at: [Math.sin(mid) * (R + 0.02), CY + Math.cos(mid) * (R + 0.02), z],
        rotation: [0, 0, -(mid * 180) / Math.PI + 90 + 90 - 90],
      });
    }
    // ratchet buckle
    b.part(new THREE.BoxGeometry(0.2, 0.12, 0.14), P.rim, { bone, at: [R * 0.7, CY + R * 0.75, z] });
  });

  // rear light bar
  glow(b.part(new THREE.BoxGeometry(1.3, 0.1, 0.06), P.warnRed, { bone, at: [0, 1.7, Z0 - 0.02 + 0.0] }), 1.4);
  glow(b.part(new THREE.BoxGeometry(0.5, 0.06, 0.05), P.neonMagenta, { bone, at: [0, 2.6, Z0 + 0.2] }), 1.4);
}
```

<!-- call: fit-cabFront -->

The offending mesh is the sloped windscreen frame (`part.body.36`), a 0.3 m deep box rotated by -28°, which reaches back to z = 2.84. I'm shifting it forward and shrinking its depth so its rotated extent stays within z ≥ 3.

<<<<<<< SEARCH
  box(2.6, 0.55, 0.3, hullPaint, [0, 1.95, 3.1], [-28, 0, 0]);
=======
  box(2.6, 0.5, 0.2, hullPaint, [0, 1.95, 3.2], [-28, 0, 0]);
>>>>>>> REPLACE

<!-- call: fit-cabShell -->

Pulling the mirrors, antennas and the sloped front shoulder back inside the box, with fixes in order.

<<<<<<< SEARCH
  box(2.7, 0.5, 0.5, HULL, [0, 2.0, 2.85], [-28, 0, 0]);
=======
  box(2.7, 0.4, 0.4, HULL, [0, 2.0, 2.75], [-28, 0, 0]);
>>>>>>> REPLACE
<<<<<<< SEARCH
    b.rod([s * 1.38, 2.0, 2.75], [s * 1.7, 2.1, 2.8], 0.025, P.hullDark, { bone: body });
    box(0.12, 0.3, 0.2, P.hullDark, [s * 1.75, 2.1, 2.8]);
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.neonCyan, { bone: body, at: [s * 1.75, 2.2, 2.92] }), 1.5);
=======
    b.rod([s * 1.3, 2.0, 2.75], [s * 1.36, 2.05, 2.78], 0.025, P.hullDark, { bone: body });
    box(0.08, 0.2, 0.16, P.hullDark, [s * 1.36, 2.05, 2.78]);
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [s * 1.36, 2.1, 2.88] }), 1.5);
>>>>>>> REPLACE
<<<<<<< SEARCH
  for (const [x, h] of [[-0.9, 0.9], [-0.7, 0.6]] as number[][]) {
=======
  for (const [x, h] of [[-0.9, 0.12], [-0.7, 0.08]] as number[][]) {
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: body, at: [-0.9, 3.28, 1.1] }), 2);
=======
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone: body, at: [-0.9, 2.5, 1.1] }), 2);
>>>>>>> REPLACE

<!-- call: fit-chassis -->

Fixes: the exhaust stacks are shortened to fit under y 1.4, the axles and diffs are pulled back to z ≤ 2.4, the tow hooks are moved inside z ≥ -4, and the drive shaft is shortened.

<<<<<<< SEARCH
  for (const z of [2.6, -1.6, -3.0]) {
    cyl(0.07, 0.07, 2.5, 8, P.rim, [0, 0.55, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), P.plate, { bone, at: [0, 0.55, z], scale: [1, 0.9, 1] });
  }
  cyl(0.06, 0.06, 4.2, 6, P.rim, [0, 0.62, 0.5], [0, 0, 1]);
=======
  for (const z of [2.15, -1.6, -3.0]) {
    cyl(0.07, 0.07, 2.5, 8, P.rim, [0, 0.55, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.plate, { bone, at: [0, 0.6, z], scale: [1, 0.9, 1] });
  }
  cyl(0.06, 0.06, 3.6, 6, P.rim, [0, 0.62, 0.3], [0, 0, 1]);
>>>>>>> REPLACE

<<<<<<< SEARCH
    cyl(0.1, 0.12, 1.1, 8, P.hullDark, [s * 1.05, 1.9, 0.85], [0, 1, 0]);
    cyl(0.13, 0.13, 0.08, 8, P.trim, [s * 1.05, 2.45, 0.85], [0, 1, 0]);
    glow(b.part(new THREE.CircleGeometry(0.08, 8), P.neonMagenta, { bone, at: [s * 1.05, 2.5, 0.85], dir: [0, 1, 0], axis: "z" }), 1);
=======
    cyl(0.1, 0.12, 0.2, 8, P.hullDark, [s * 1.05, 1.3, 0.85], [0, 1, 0]);
    cyl(0.13, 0.13, 0.06, 8, P.trim, [s * 1.05, 1.39, 0.85], [0, 1, 0]);
    glow(b.part(new THREE.CircleGeometry(0.08, 8), P.neonMagenta, { bone, at: [s * 1.05, 1.4, 0.85], dir: [0, 1, 0], axis: "z" }), 1);
>>>>>>> REPLACE

<<<<<<< SEARCH
    b.sweep([[s * 0.5, 0.75, -4.0], [s * 0.5, 0.75, -4.25], [s * 0.5, 0.6, -4.3]], 0.04, { bone, color: P.rim });
=======
    b.sweep([[s * 0.5, 0.75, -3.8], [s * 0.5, 0.75, -3.9], [s * 0.5, 0.65, -3.95]], 0.04, { bone, color: P.rim });
>>>>>>> REPLACE

<!-- call: fit-turret -->

Four pieces reach out of the box: the antenna rod and its magenta lamp (too tall), and the ammo box with its stencil plane (too far back). I shorten the antenna and move the ammo box and its stencil forward.

The ammo box was at z = 1.23 to 1.53. It now sits at `cz - 0.4`, which is z = 1.4 to 1.7 for the box. The box still overlaps the housing slightly, which keeps it attached. The stencil moves with it, to `cz - 0.55` = 1.45. The antenna goes from y = 3.09 to 3.1 at the lamp. `hy` is 2.78, so `hy + 0.3` = 3.08 and the lamp at `hy + 0.77` = 3.55 must come down to about 3.07. I make the rod 0.02 tall, from `hy + 0.28` to `hy + 0.3`, and put the lamp at `hy + 0.3`.

<<<<<<< SEARCH
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.3), P.hullDark, { at: [rx, hy, cz - 0.62], bone: yaw, flat: true });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
    at: [rx, hy, cz - 0.775], bone: yaw, dir: [0, 0, -1], axis: "z", texture: numTex,
  });
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.2), P.trim, { at: [rx, hy + 0.17, cz - 0.62], bone: yaw });
=======
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.3), P.hullDark, { at: [rx, hy, cz - 0.4], bone: yaw, flat: true });
  b.part(new THREE.PlaneGeometry(0.3, 0.15), "#ffffff", {
    at: [rx, hy, cz - 0.552], bone: yaw, dir: [0, 0, -1], axis: "z", texture: numTex,
  });
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.2), P.trim, { at: [rx, hy + 0.17, cz - 0.4], bone: yaw });
>>>>>>> REPLACE

<<<<<<< SEARCH
  b.rod([rx + 0.3, hy + 0.3, cz - 0.1], [rx + 0.3, hy + 0.75, cz - 0.1], 0.012, P.rim, { bone: yaw });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { at: [rx + 0.3, hy + 0.77, cz - 0.1], bone: yaw }), 2);
=======
  b.rod([rx + 0.3, hy + 0.2, cz - 0.1], [rx + 0.3, hy + 0.28, cz - 0.1], 0.012, P.rim, { bone: yaw });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { at: [rx + 0.3, hy + 0.3, cz - 0.1], bone: yaw }), 2);
>>>>>>> REPLACE

<!-- call: fit-cargoPod -->

```ts
<<<<<<< SEARCH
  const Z0 = -3.75;
  const Z1 = 0.4;
=======
  const Z0 = -3.55;
  const Z1 = 0.15;
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone, at: [0, CY, z], dir: [0, 0, s], flat: true,
    });
    // end rim plate
=======
      bone, at: [0, CY, z], dir: [0, 0, s], flat: true, scale: [1, 0.5, 1],
    });
    // end rim plate
>>>>>>> REPLACE
<<<<<<< SEARCH
      bone, at: [0, CY, z + s * (R * 0.92)], dir: [0, 0, s], flat: true,
=======
      bone, at: [0, CY, z + s * 0.4], dir: [0, 0, s], flat: true,
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone, at: [vx, CY + 0.12, z + s * (R * 0.97)], dir: [0, 0, s],
=======
        bone, at: [vx, CY + 0.12, z + s * 0.38], dir: [0, 0, s],
>>>>>>> REPLACE
<<<<<<< SEARCH
        bone, at: [-0.2 + i * 0.2, CY - 0.2, z + s * (R * 0.97)],
=======
        bone, at: [-0.2 + i * 0.2, CY - 0.2, z + s * 0.38],
>>>>>>> REPLACE
<<<<<<< SEARCH
        rotation: [0, 0, -(mid * 180) / Math.PI + 90 + 90 - 90],
=======
        rotation: [0, 0, -(mid * 180) / Math.PI],
>>>>>>> REPLACE
<<<<<<< SEARCH
  glow(b.part(new THREE.BoxGeometry(1.3, 0.1, 0.06), P.warnRed, { bone, at: [0, 1.7, Z0 - 0.02 + 0.0] }), 1.4);
=======
  glow(b.part(new THREE.BoxGeometry(1.3, 0.1, 0.06), P.warnRed, { bone, at: [0, 1.7, Z0 - 0.1] }), 1.4);
>>>>>>> REPLACE
```
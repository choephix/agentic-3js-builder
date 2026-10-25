<!-- call: plan -->

```json
{
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled armoured carrier carrying a long electromagnetic railgun on its back, braced on four deployed stabiliser legs.",
  "builderName": "railgunCarrier",
  "size": [4.4, 3.2, 9.0],
  "layout": "Long low armoured hull running along Z. Front (+Z): angular sloped glacis, armoured cab with a tinted visor strip, headlamps and a bumper with a tow hook. Middle: flat deck with the turret ring at its centre. Rear (-Z): the railgun cradle, power capacitor bank and exhaust vents. Three wheels per side (front, mid, rear) stand on the floor on axles under the hull. Four stabiliser legs, two per side, are folded down and out at 45 degrees from the hull flanks between the wheel pairs, ending in flat foot pads that rest on y=0. The railgun is a long twin-rail barrel that points forward over the cab roof, elevated about 12 degrees on a trunnion cradle. Style: chunky faceted shapes, olive-grey armour panels with riveted seams, hazard-yellow trim and stripes, cyan glowing capacitor coils, rail glow and visor, dark gunmetal rails and tyres, worn edges painted lower and brighter on upper faces.",
  "palette": {
    "hull": "#4a5240",
    "hullDark": "#2f352b",
    "hullLight": "#6b7558",
    "trim": "#e7b814",
    "gunmetal": "#2b2f36",
    "steel": "#8a919c",
    "tyre": "#1a1b1e",
    "rim": "#555c66",
    "glassDark": "#12303a",
    "neonCyan": "#2ff3ff",
    "warnRed": "#d6342a",
    "lamp": "#fff2b0",
    "decal": "#d9d6c8"
  },
  "mounts": {
    "deckTop": [0, 1.6, 0],
    "turretRing": [0, 1.6, -0.8],
    "trunnion": [0, 2.35, -0.8],
    "cabRoof": [0, 2.0, 2.7],
    "axleFront": [0, 0.6, 3.0],
    "axleMid": [0, 0.6, 0],
    "axleRear": [0, 0.6, -3.0],
    "legMountFL": [1.35, 1.0, 1.5],
    "legMountFR": [-1.35, 1.0, 1.5],
    "legMountRL": [1.35, 1.0, -1.8],
    "legMountRR": [-1.35, 1.0, -1.8],
    "gunMuzzle": [0, 2.7, 4.5]
  },
  "joints": [
    { "name": "body", "at": [0, 1.2, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "turret", "parent": "body", "at": [0, 1.6, -0.8], "dir": [0, 1, 0], "role": "hinge", "group": "turret" },
    { "name": "gunCradle", "parent": "turret", "at": [0, 2.35, -0.8], "dir": [0, 0.2, 1], "role": "hinge", "group": "turret" },
    { "name": "wheelFL", "parent": "body", "at": [1.6, 0.6, 3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelFR", "parent": "body", "at": [-1.6, 0.6, 3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelML", "parent": "body", "at": [1.6, 0.6, 0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelMR", "parent": "body", "at": [-1.6, 0.6, 0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRL", "parent": "body", "at": [1.6, 0.6, -3.0], "dir": [1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "wheelRR", "parent": "body", "at": [-1.6, 0.6, -3.0], "dir": [-1, 0, 0], "role": "hinge", "group": "wheels" },
    { "name": "legFL", "parent": "body", "at": [1.35, 1.0, 1.5], "dir": [0.7, -0.7, 0], "role": "leg", "group": "legs" },
    { "name": "legFR", "parent": "body", "at": [-1.35, 1.0, 1.5], "dir": [-0.7, -0.7, 0], "role": "leg", "group": "legs" },
    { "name": "legRL", "parent": "body", "at": [1.35, 1.0, -1.8], "dir": [0.7, -0.7, 0], "role": "leg", "group": "legs" },
    { "name": "legRR", "parent": "body", "at": [-1.35, 1.0, -1.8], "dir": [-0.7, -0.7, 0], "role": "leg", "group": "legs" }
  ],
  "parts": [
    {
      "id": "hull",
      "builds": "Main armoured chassis: a loft or frustum-box body with sloped glacis and tail, panelled paint (riveted seams) in hull colours, side skirts, belly plate, wheel arches over the three axles, hazard-yellow stripes and a decal number on the flanks, front bumper with tow hook, rear bumper and tail lights, flat deck plate with a turret ring base at turretRing, deck hatches, antennas and grab handles.",
      "box": [[-1.8, 0.7, -4.2], [1.8, 1.7, 4.2]],
      "attaches": "Deck at deckTop carries the turret ring; cab sits on it at the front; wheel arches wrap axleFront/axleMid/axleRear; leg sockets at the legMount points.",
      "joints": ["body"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "cab",
      "builds": "Forward armoured crew cab on the hull's front deck: sloped faceted roof, angled armour plates, a glowing cyan visor strip (glow, dark glass texture with an SVG HUD-line drawing), side hatches with handles, headlamps (glowing lamp colour) with cages, roof sensor mast with a small dish, smoke launcher tubes, and a hazard-yellow roof marker. Must stay clear of the gun's path: the barrel passes above cabRoof.",
      "box": [[-1.6, 1.6, 1.6], [1.6, 2.3, 4.0]],
      "attaches": "Sits on the hull deck at deckTop between z=1.6 and 4.0; roof at cabRoof.",
      "joints": ["body"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "runningGear",
      "builds": "Six wheels, three per side at axleFront/axleMid/axleRear with x=±1.6: chunky low-poly tyres (octagonal-ish cylinders with tread paint), steel rims with hub caps and lug nuts, axle stubs and suspension arms and shock absorbers linking wheel joints to the hull underside, mud-guards, a drivetrain visible between wheels. Wheel radius 0.6 so the tyres rest on y=0 and rotate about X on their wheel joints.",
      "box": [[-2.2, 0.0, -3.8], [2.2, 1.3, 3.8]],
      "attaches": "Each wheel on its wheel joint; suspension mounts to the hull underside near the axle mounts.",
      "joints": ["wheelFL", "wheelFR", "wheelML", "wheelMR", "wheelRL", "wheelRR", "body"],
      "floor": true,
      "budget": 170
    },
    {
      "id": "stabilisers",
      "builds": "Four deployed stabiliser legs, one per legMount, at 45 degrees outward and down: a hydraulic housing at the hull, a telescoping piston segment (steel) in a yellow-black hazard-striped sleeve, an angled brace strut, a knee hinge, and a wide octagonal foot pad with ribs and a rubber sole whose underside rests on y=0. Built with chains named like legFL/legFLknee, using the leg joints. Warning red beacon lights on the housings.",
      "box": [[-4.4, 0.0, -2.6], [4.4, 1.3, 2.4]],
      "attaches": "Housings seat on the hull flanks at the legMount points; feet end on the floor outside the wheels, x about ±3.5 to ±4.2.",
      "joints": ["legFL", "legFR", "legRL", "legRR", "body"],
      "floor": true,
      "budget": 150
    },
    {
      "id": "railgun",
      "builds": "Turret and railgun: a rotating turret base ring on turretRing, a faceted armoured gun housing and trunnion cradle with side plates at trunnion, the long twin-rail barrel (about 5 m long, two gunmetal rails with a glowing cyan gap between, spaced coil clamps with cyan rings, muzzle brake with a flared end) elevated about 12 degrees pointing +Z over the cab to gunMuzzle, a rear capacitor bank (cylinders with glowing cyan coils, cable sweeps to the hull), heat-sink fins and exhaust vents at the back, ammo/slug magazine box, hazard stripes and warning decals, status light panel with an SVG readout. Everything stays above the deck.",
      "box": [[-1.5, 1.6, -4.4], [1.5, 3.2, 4.8]],
      "attaches": "Turret base on the hull ring at turretRing; cradle pivots at trunnion; barrel passes above cabRoof.",
      "joints": ["turret", "gunCradle"],
      "floor": false,
      "budget": 190
    }
  ]
}
```

<!-- call: railgun -->

```ts
import * as THREE from "three";
import { paint, svg, glow, mix, noise, smoothstep } from "agentic-3js-builder";

export function buildRailgun({ b, J, P, M }: any) {
  const T = J.turret, C = J.gunCradle;
  const armor = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 0.95, n.y) * 0.8);
    return mix(base, P.hullDark, noise(p, 0.3, 3) * 0.35);
  });
  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: any, at: number[], bone: any, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, flat: true, ...o });

  // turret ring and base
  cyl(1.25, 1.35, 0.2, 12, P.gunmetal, [0, 1.7, -0.8], T);
  cyl(1.1, 1.2, 0.3, 12, armor, [0, 1.95, -0.8], T);
  // side hazard band
  cyl(1.22, 1.22, 0.06, 12, P.trim, [0, 1.84, -0.8], T);
  // housing
  box(1.5, 0.5, 1.8, armor, [0, 2.3, -0.8], T);
  for (const s of [1, -1]) {
    box(0.18, 0.9, 1.3, armor, [s * 0.95, 2.45, -0.8], T);
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8), P.steel, {
      bone: C, at: [s * 1.07, 2.35, -0.8], dir: [s, 0, 0], flat: true });
    box(0.2, 0.08, 1.0, P.trim, [s * 0.95, 2.93, -0.8], T);
  }
  // sloped front plate
  b.part(new THREE.BoxGeometry(1.5, 0.5, 0.15), armor, { bone: T, at: [0, 2.6, 0.2], rotation: [-30, 0, 0], flat: true });
  // ammo magazine
  box(0.8, 0.6, 1.0, P.hullDark, [-0.9, 2.2, -1.5], T);
  for (let i = 0; i < 3; i++) box(0.82, 0.05, 0.08, P.trim, [-0.9, 2.52, -1.2 - i * 0.3], T);

  // capacitor bank at rear
  for (let i = 0; i < 3; i++) {
    const x = -0.9 + i * 0.9;
    cyl(0.3, 0.3, 0.9, 8, P.gunmetal, [x, 2.45, -2.9], T);
    for (let k = 0; k < 3; k++) glow(cyl(0.33, 0.33, 0.07, 8, P.neonCyan, [x, 2.15 + k * 0.3, -2.9], T), 1.5);
    b.rod([x, 2.0, -2.9], [x * 0.5, 1.75, -2.2], 0.05, P.gunmetal, { bone: T });
  }
  box(2.9, 0.15, 0.9, P.hullDark, [0, 1.85, -2.9], T);
  // heat sinks
  for (let i = 0; i < 7; i++) box(2.4, 0.5, 0.04, P.steel, [0, 2.45, -3.6 - i * 0.1], T);
  box(2.6, 0.7, 0.1, P.hullDark, [0, 2.45, -3.25], T);
  for (let i = 0; i < 4; i++) box(0.5, 0.06, 0.05, P.gunmetal, [-0.9 + i * 0.6, 2.7, -4.3], T);

  // status panel
  const panel = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#12303a"/><path d="M4 24 L16 12 L28 20 L40 6 L60 16" stroke="#2ff3ff" stroke-width="3" fill="none"/><rect x="4" y="4" width="10" height="4" fill="#d6342a"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { bone: T, at: [0.95 + 0.1, 2.5, -1.9], dir: [1, 0, 0], axis: "z", texture: panel }), 1);

  // barrel on cradle
  const el = 12;
  const g = (len: number, w: number, h: number, col: any, y: number, x: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, len), col, { bone: C, at: [x, 2.35 + y + z * 0.21, -0.8 + z], rotation: [-el, 0, 0], flat: true });
  for (const s of [1, -1]) {
    g(5.0, 0.22, 0.4, P.gunmetal, 0, s * 0.3, 2.6);
    g(5.0, 0.04, 0.12, P.steel, 0.24, s * 0.3, 2.6);
  }
  glow(g(5.0, 0.38, 0.14, P.neonCyan, 0, 0, 2.6), 1.6);
  for (let i = 0; i < 6; i++) {
    const z = 0.6 + i * 0.85;
    g(0.18, 0.95, 0.7, P.hullDark, 0, 0, z);
    glow(g(0.06, 0.98, 0.74, P.neonCyan, 0, 0, z + 0.1), 1.4);
    g(0.12, 1.0, 0.12, P.trim, 0.3, 0, z - 0.1);
  }
  // muzzle brake
  g(0.5, 1.0, 0.7, P.gunmetal, 0, 0, 5.1);
  g(0.3, 1.3, 0.9, P.steel, 0, 0, 5.4);
  // breech block
  g(0.9, 0.9, 0.9, armor, 0, 0, 0.1);
}
```

<!-- call: runningGear -->

```ts
import * as THREE from "three";
import { paint, svg, noise, mix, smoothstep } from "agentic-3js-builder";

type Ctx = { b: any; J: any; P: any; M: any };

export function buildRunningGear({ b, J, P, M }: Ctx) {
  const R = 0.6;
  const TW = 0.42; // tyre width
  const TYRE_PAINT = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const a = Math.atan2(p.y - R, p.z);
    const lug = Math.abs(n.x) < 0.5 && Math.floor((a + Math.PI) / (Math.PI / 12)) % 2 === 0;
    const mud = smoothstep(0.35, 0.0, p.y) * 0.5 + noise(p, 0.15, 3) * 0.2;
    const base: [number, number, number] = lug ? [0.07, 0.07, 0.08] : [0.12, 0.12, 0.14];
    return mix(base, [0.28, 0.22, 0.14], mud);
  });
  const RIM_PAINT = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix("#555c66", "#8a919c", smoothstep(0.2, 1, n.y) * 0.6 + noise(p, 0.05, 5) * 0.3),
  );
  const GUARD = paint((p: THREE.Vector3, n: THREE.Vector3) =>
    mix("#2f352b", "#6b7558", smoothstep(0.3, 1, n.y) * 0.7 + noise(p, 0.1, 2) * 0.2),
  );
  const HAZ = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#e7b814"/><path d="M0 16L8 0H16L8 16ZM16 16L24 0H32L24 16Z" fill="#1a1b1e"/></svg>`,
    { size: 64 },
  );
  const RUN = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#555c66" stroke="#1a1b1e" stroke-width="3"/><circle cx="32" cy="32" r="20" fill="none" stroke="#8a919c" stroke-width="2"/></svg>`,
    { size: 128 },
  );

  const sides = [
    { s: 1, n: "L" },
    { s: -1, n: "R" },
  ];
  const axles = [
    { z: M.axleFront[2], n: "F" },
    { z: M.axleMid[2], n: "M" },
    { z: M.axleRear[2], n: "R" },
  ];

  // central drivetrain: driveshafts and differentials
  for (const ax of axles) {
    const yy = 0.6;
    b.rod([-1.5, yy, ax.z], [1.5, yy, ax.z], 0.07, P.steel, { bone: J.body, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.gunmetal, { bone: J.body, at: [0, yy, ax.z], flat: true });
    b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), P.hullDark, { bone: J.body, at: [0, yy + 0.2, ax.z] });
  }
  b.rod([0, 0.62, -3], [0, 0.62, 3], 0.09, P.steel, { bone: J.body, sides: 8 });
  for (const z of [-1.5, 1.5]) {
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 8), P.trim, {
      bone: J.body, at: [0, 0.62, z], dir: [0, 0, 1],
    });
  }

  for (const sd of sides) {
    for (const ax of axles) {
      const wj = J["wheel" + ax.n + sd.n];
      const x = 1.6 * sd.s;
      const c: [number, number, number] = [x, R, ax.z];
      const out: [number, number, number] = [sd.s, 0, 0];
      // tyre
      b.part(new THREE.CylinderGeometry(R, R, TW, 12, 1), TYRE_PAINT, { bone: wj, at: c, dir: out, flat: true });
      // tyre shoulder rings
      for (const k of [-1, 1]) {
        b.part(new THREE.CylinderGeometry(R * 0.93, R * 0.93, 0.05, 12), P.tyre, {
          bone: wj, at: [x + sd.s * k * (TW / 2 + 0.01), R, ax.z], dir: out, flat: true,
        });
      }
      // rim
      const ox = x + sd.s * (TW / 2 + 0.02);
      b.part(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 10), RIM_PAINT, {
        bone: wj, at: [ox, R, ax.z], dir: out, flat: true,
      });
      b.part(new THREE.CircleGeometry(0.34, 12), "#ffffff", {
        bone: wj, at: [ox + sd.s * 0.035, R, ax.z], dir: out, axis: "z", texture: RUN,
      });
      // hub cap
      b.part(new THREE.CylinderGeometry(0.12, 0.15, 0.09, 8), P.steel, {
        bone: wj, at: [ox + sd.s * 0.05, R, ax.z], dir: out, flat: true,
      });
      // lug nuts
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.05, 6), P.gunmetal, {
          bone: wj,
          at: [ox + sd.s * 0.07, R + Math.sin(a) * 0.22, ax.z + Math.cos(a) * 0.22],
          dir: out,
        });
      }
      // axle stub
      b.rod([x - sd.s * 0.35, R, ax.z], [x, R, ax.z], 0.09, P.steel, { bone: J.body, sides: 8 });
      // suspension: lower arm and upper arm to hull underside
      const hx = 1.05 * sd.s;
      const ia = x - sd.s * 0.22;
      b.rod([hx, 0.85, ax.z + 0.28], [ia, 0.5, ax.z + 0.05], 0.045, P.hullDark, { bone: J.body, sides: 6 });
      b.rod([hx, 0.85, ax.z - 0.28], [ia, 0.5, ax.z - 0.05], 0.045, P.hullDark, { bone: J.body, sides: 6 });
      b.part(new THREE.SphereGeometry(0.07, 6, 4), P.steel, { bone: J.body, at: [ia, 0.5, ax.z], flat: true });
      // shock absorber: sleeve + piston + spring
      const top: [number, number, number] = [1.2 * sd.s, 1.0, ax.z + 0.12];
      const bot: [number, number, number] = [x - sd.s * 0.3, 0.55, ax.z + 0.12];
      b.rod(top, [(top[0] + bot[0]) / 2, (top[1] + bot[1]) / 2, top[2]], 0.055, HAZ ? P.trim : P.trim, {
        bone: J.body, sides: 8,
      });
      b.rod([(top[0] + bot[0]) / 2, (top[1] + bot[1]) / 2, top[2]], bot, 0.032, P.steel, { bone: J.body, sides: 6 });
      b.part(new THREE.BoxGeometry(0.14, 0.1, 0.14), P.gunmetal, { bone: J.body, at: top, flat: true });
      // mud-guard: arch plate over the wheel
      b.part(new THREE.BoxGeometry(0.5, 0.05, 1.1), GUARD, {
        bone: J.body, at: [x, 1.22, ax.z], flat: true,
      });
      b.part(new THREE.BoxGeometry(0.5, 0.05, 0.4), GUARD, {
        bone: J.body, at: [x, 1.1, ax.z + 0.68], rotation: [-35, 0, 0], flat: true,
      });
      b.part(new THREE.BoxGeometry(0.5, 0.05, 0.4), GUARD, {
        bone: J.body, at: [x, 1.1, ax.z - 0.68], rotation: [35, 0, 0], flat: true,
      });
      // yellow guard edge trim
      b.part(new THREE.BoxGeometry(0.04, 0.04, 1.2), P.trim, {
        bone: J.body, at: [x + sd.s * 0.23, 1.2, ax.z], flat: true,
      });
      // mud flap
      b.part(new THREE.BoxGeometry(0.4, 0.28, 0.04), P.tyre, {
        bone: J.body, at: [x, 0.95, ax.z - 0.72], flat: true,
      });
    }
  }
}
```

<!-- call: stabilisers -->

```ts
import * as THREE from "three";
import { paint, svg, mix, smoothstep, noise, aim, offset } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildStabilisers({ b, J, P, M }: any) {
  const HAZ = svg(
    `<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#e7b814"/><path d="M-8 32 L16 0 L24 0 L0 32Z M16 32 L40 0 L48 0 L24 32Z" fill="#1a1b1e"/></svg>`,
    { size: 64 },
  );
  const worn = (c: string) =>
    paint((p, n) => mix(mix(c, "#000000", 0.25 * smoothstep(0.3, -0.8, n.y)), "#d9d6c8", 0.12 * smoothstep(0.6, 1, n.y) * noise(p, 0.1, 3)));
  const HULLP = worn(P.hull);
  const STEEL = paint((p, n) => mix(P.steel, "#ffffff", 0.2 * smoothstep(0.5, 1, n.y) + 0.1 * noise(p, 0.05, 2)));
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const legs: [string, number, number][] = [
    ["legFL", 1, M.legMountFL[2]],
    ["legFR", -1, M.legMountFR[2]],
    ["legRL", 1, M.legMountRL[2]],
    ["legRR", -1, M.legMountRR[2]],
  ];

  for (const [name, s, z] of legs) {
    const joint = J[name];
    const hip = V(s * 1.35, 1.0, z);
    const knee = V(s * 2.5, 0.78, z);
    const foot = V(s * 3.85, 0.14, z);
    const pistonEnd = V(s * 3.35, 0.4, z);

    // knee joint
    const kneeJ = b.joint(`${name}knee`, { parent: joint, at: knee, aim: foot });
    const outDir = V(s * 0.7, -0.7, 0);

    // housing at hull flank
    b.part(new THREE.BoxGeometry(0.5, 0.5, 0.6), HULLP, { bone: joint, at: hip.clone().add(V(s * 0.1, 0, 0)), flat: true });
    b.part(new THREE.BoxGeometry(0.2, 0.62, 0.72), P.hullDark, { bone: joint, at: hip.clone().add(V(-s * 0.1, 0, 0)), flat: true });
    // pivot cylinder
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 0.7, 8), P.gunmetal, { bone: joint, at: hip.clone().add(V(s * 0.3, 0, 0)), rotation: [90, 0, 0], flat: true });
    // beacon
    glow(b.part(new THREE.SphereGeometry(0.1, 6, 4), P.warnRed, { bone: joint, at: hip.clone().add(V(s * 0.1, 0.34, 0)) }), 1.6);
    b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.05, 8), P.gunmetal, { bone: joint, at: hip.clone().add(V(s * 0.1, 0.27, 0)) });

    // hazard sleeve (upper arm)
    b.rod(hip.clone().add(V(s * 0.2, 0, 0)), knee, 0.17, P.trim, { bone: joint, sides: 8 });
    const sleeve = b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.9, 8, 1, true), "#ffffff", {
      bone: joint, at: V(s * 1.9, 0.89, z), dir: outDir.clone().normalize().add(V(0, 0, 0)), texture: HAZ, flat: true,
    });
    sleeve.mesh.material.side = THREE.DoubleSide;
    b.part(new THREE.TorusGeometry(0.19, 0.04, 5, 8), P.gunmetal, { bone: joint, at: V(s * 1.45, 0.96, z), dir: outDir, axis: "z" });
    b.part(new THREE.TorusGeometry(0.19, 0.04, 5, 8), P.gunmetal, { bone: joint, at: V(s * 2.3, 0.82, z), dir: outDir, axis: "z" });

    // knee hinge
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 8), P.gunmetal, { bone: kneeJ, at: knee, rotation: [90, 0, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.56, 6), P.steel, { bone: kneeJ, at: knee, rotation: [90, 0, 0] });

    // telescoping steel piston
    b.rod(knee, pistonEnd, 0.12, STEEL, { bone: kneeJ, sides: 8 });
    b.rod(offset(knee, [s, 0, 0], 0.0), V(s * 2.95, 0.55, z), 0.16, P.trim, { bone: kneeJ, sides: 8 });
    b.part(new THREE.TorusGeometry(0.16, 0.035, 5, 8), P.gunmetal, { bone: kneeJ, at: V(s * 2.95, 0.55, z), dir: outDir, axis: "z" });

    // angled brace strut
    const braceTop = V(s * 1.35, 1.35, z);
    b.rod(braceTop, V(s * 3.0, 0.5, z), 0.06, P.gunmetal, { bone: joint, sides: 6 });
    b.part(new THREE.BoxGeometry(0.2, 0.14, 0.2), P.hullDark, { bone: joint, at: braceTop, flat: true });
    b.part(new THREE.BoxGeometry(0.16, 0.16, 0.16), P.gunmetal, { bone: kneeJ, at: V(s * 3.0, 0.5, z), flat: true });
    b.rod(V(s * 1.35, 0.7, z + 0.3), V(s * 2.5, 0.78, z + 0.28), 0.04, P.steel, { bone: joint, sides: 6 });
    b.rod(V(s * 1.35, 0.7, z - 0.3), V(s * 2.5, 0.78, z - 0.28), 0.04, P.steel, { bone: joint, sides: 6 });

    // ball joint at foot
    b.part(new THREE.SphereGeometry(0.18, 8, 6), P.gunmetal, { bone: kneeJ, at: V(s * 3.5, 0.34, z) });
    b.rod(pistonEnd, V(s * 3.8, 0.36, z), 0.1, P.steel, { bone: kneeJ, sides: 8 });
    const fx = s * 3.85;
    // foot pad: octagon
    b.part(new THREE.CylinderGeometry(0.58, 0.64, 0.12, 8), P.hullDark, { bone: kneeJ, at: V(fx, 0.2, z), flat: true });
    b.part(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 8), P.trim, { bone: kneeJ, at: V(fx, 0.28, z), flat: true });
    b.part(new THREE.CylinderGeometry(0.66, 0.66, 0.08, 8), P.tyre, { bone: kneeJ, at: V(fx, 0.04, z), flat: true });
    // ribs
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 4;
      b.part(new THREE.BoxGeometry(0.9, 0.12, 0.06), P.gunmetal, { bone: kneeJ, at: V(fx, 0.31, z), rotation: [0, (a * 180) / Math.PI, 0], flat: true });
    }
    b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.1, 8), P.steel, { bone: kneeJ, at: V(fx, 0.34, z), flat: true });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 5), P.steel, { bone: kneeJ, at: V(fx + Math.cos(a) * 0.44, 0.3, z + Math.sin(a) * 0.44) });
    }
  }
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const [dx, dy, dz] = M.deckTop;

  // Armour paint: olive plating, lighter on upper faces, panel seams, wear on edges.
  const armour = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, n.y) * 0.7);
    const worn = mix(base, P.hullDark, 0.35 * smoothstep(0.55, 0.8, noise(p, 0.25, 3)));
    const seamX = Math.abs(((p.x + 10) % 0.8) - 0.4) > 0.385;
    const seamZ = Math.abs(((p.z + 10) % 0.7) - 0.35) > 0.34;
    return seamX || seamZ ? mix(worn, P.hullDark, 0.8) : worn;
  });

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });

  // Lower cab body: frustum with sloped front.
  b.frustumBox([0, dy + 0.02, 2.0], [0, dy + 0.02, 3.95], [3.0, 0.5], [2.7, 0.5], { bone, color: armour });
  // Main cab block (stepped for faceted look)
  box(3.0, 0.46, 2.2, armour, [dx, dy + 0.25, 2.65]);
  // Sloped roof: lathe-free wedge via extrude, side profile along z
  const roof = b.extrude(
    [[0, 0], [2.2, 0], [1.9, 0.32], [0.35, 0.32], [0, 0.16, "sharp"]].map(
      (q) => [q[0] + -1.1 + 1.1 * 0, q[1], "sharp"] as any,
    ).map((q, i) => (i === 0 ? [0, 0, "sharp"] : q)) as any,
    { at: [0, dy + 0.45, 1.65], x: [0, 0, 1], thickness: 2.6, bone, color: armour },
  );
  void roof;

  // Angled front armour plates
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.45, 0.9), P.hullLight, {
      bone, at: [s * 1.5, dy + 0.3, 3.55], rotation: [0, s * 25, 0],
    });
    b.part(new THREE.BoxGeometry(0.1, 0.4, 1.4), P.hullDark, { bone, at: [s * 1.56, dy + 0.28, 2.4] });
  }
  // Sloped glacis plate on cab front
  box(2.8, 0.1, 0.8, P.hullLight, [0, dy + 0.38, 3.85], { rotation: [-35, 0, 0] });

  // Visor with HUD drawing
  const hud = svg(
    `<svg viewBox="0 0 128 24"><rect width="128" height="24" fill="#12303a"/>
    <path d="M4 12 H40 M88 12 H124 M64 3 V21 M52 12 H76" stroke="#2ff3ff" stroke-width="2" fill="none"/>
    <circle cx="64" cy="12" r="7" fill="none" stroke="#2ff3ff" stroke-width="2"/>
    <path d="M8 20 H30 M98 20 H120 M8 4 H20 M108 4 H120" stroke="#7ffaff" stroke-width="1.5"/></svg>`,
    { size: 256 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(2.3, 0.28), "#ffffff", {
      bone, at: [0, dy + 0.5, 3.92], rotation: [-8, 0, 0], texture: hud,
    }),
    0.9,
  );
  box(2.45, 0.05, 0.06, P.trim, [0, dy + 0.67, 3.9]);
  box(2.45, 0.05, 0.06, P.gunmetal, [0, dy + 0.34, 3.92]);

  // Side hatches with handles
  for (const s of [1, -1]) {
    box(0.05, 0.4, 0.8, P.hullDark, [s * 1.52, dy + 0.3, 2.9]);
    box(0.06, 0.36, 0.7, P.hullLight, [s * 1.54, dy + 0.3, 2.9]);
    b.rod([s * 1.58, dy + 0.3, 2.6], [s * 1.58, dy + 0.3, 2.78], 0.018, P.steel, { bone });
    b.rod([s * 1.58, dy + 0.18, 3.2], [s * 1.58, dy + 0.42, 3.2], 0.014, P.steel, { bone });
    // hazard stripe
    box(0.06, 0.07, 1.1, P.trim, [s * 1.55, dy + 0.1, 2.9]);
    for (let i = 0; i < 4; i++)
      box(0.065, 0.075, 0.08, P.gunmetal, [s * 1.55, dy + 0.1, 2.5 + i * 0.28], { rotation: [0, 0, 0] });

    // Headlamps with cages
    const lx = s * 1.2;
    glow(
      b.part(new THREE.CylinderGeometry(0.14, 0.12, 0.1, 8), P.lamp, {
        bone, at: [lx, dy + 0.22, 3.98], dir: [0, 0, 1],
      }),
      1.4,
    );
    box(0.36, 0.34, 0.12, P.gunmetal, [lx, dy + 0.22, 3.9]);
    glow(
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), P.lamp, {
        bone, at: [lx, dy + 0.22, 4.0], dir: [0, 0, 1],
      }),
      1.4,
    );
    for (let i = -1; i <= 1; i++)
      b.rod([lx - 0.15, dy + 0.22 + i * 0.07, 4.06], [lx + 0.15, dy + 0.22 + i * 0.07, 4.06], 0.012, P.steel, { bone });
    b.rod([lx, dy + 0.06, 4.06], [lx, dy + 0.38, 4.06], 0.012, P.steel, { bone });

    // Smoke launcher tubes
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6), P.gunmetal, {
        bone, at: [s * (1.36 - i * 0.0), dy + 0.58 + i * 0.0, 2.2 + i * 0.14], rotation: [-55, 0, s * 12],
      });
    }
    box(0.18, 0.06, 0.5, P.hullDark, [s * 1.36, dy + 0.5, 2.3]);
  }

  // Roof marker, hazard yellow with stripes
  box(0.9, 0.05, 0.35, P.trim, [0, M.cabRoof[1] + 0.03, 2.3]);
  for (let i = -3; i <= 3; i++)
    box(0.07, 0.055, 0.36, P.gunmetal, [i * 0.12, M.cabRoof[1] + 0.035, 2.3], { rotation: [0, 0, 0] });

  // Sensor mast with dish, off to the side so the barrel passes clear
  const mx = 1.2, mz = 2.1;
  b.rod([mx, M.cabRoof[1] - 0.05, mz], [mx, M.cabRoof[1] + 0.3, mz], 0.03, P.steel, { bone });
  box(0.14, 0.1, 0.14, P.gunmetal, [mx, M.cabRoof[1] + 0.32, mz]);
  b.part(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.decal, {
    bone, at: [mx, M.cabRoof[1] + 0.4, mz], rotation: [70, 0, 0],
  });
  b.rod([mx, M.cabRoof[1] + 0.4, mz], [mx, M.cabRoof[1] + 0.52, mz + 0.1], 0.012, P.steel, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.warnRed, { bone, at: [mx, M.cabRoof[1] + 0.55, mz + 0.1] }), 1.2);

  // Rivets along roof edge
  for (let i = 0; i < 14; i++) {
    const z = 1.75 + i * 0.16;
    for (const s of [1, -1])
      b.part(new THREE.SphereGeometry(0.025, 5, 3), P.steel, { bone, at: [s * 1.28, dy + 0.5 + R() * 0, z] });
  }
}
```

<!-- call: hull -->

```ts
import * as THREE from "three";
import { paint, svg, mix, noise, smoothstep, rng } from "agentic-3js-builder";
import { panelled, metal } from "agentic-3js-builder/kits/clockwork";

type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

export function buildHull({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(11);
  const wear = paint((p, n) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.3, 1, n.y) * 0.6 + noise(p, 0.5, 3) * 0.3);
    return mix(base, P.hullDark, smoothstep(-0.2, -1, n.y) * 0.7);
  });
  const HULL = panelled(wear, { size: 0.6, aspect: 0.6, rivets: 0.12, seam: P.hullDark });
  const part = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: body, at, flat: true, ...o });
  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), c, at, o);

  // main body loft
  b.loft(
    [
      { at: [0, 1.05, -4.1], w: 2.8, h: 0.6 },
      { at: [0, 1.15, -3.2], w: 3.4, h: 0.9 },
      { at: [0, 1.2, 0], w: 3.6, h: 1.0 },
      { at: [0, 1.2, 3.0], w: 3.4, h: 0.95 },
      { at: [0, 1.0, 4.1], w: 2.6, h: 0.5 },
    ],
    { bone: body, color: HULL, section: "box" },
  );
  // sloped glacis
  b.frustumBox([0, 1.1, 3.4], [0, 1.0, 4.2], [3.2, 0.9], [2.6, 0.4], { bone: body, color: HULL });
  // belly plate
  box(3.0, 0.12, 7.6, P.hullDark, [0, 0.72, 0]);
  // deck plate
  box(3.2, 0.1, 6.6, P.hullLight, [0, 1.66, -0.6]);
  // turret ring base
  b.lathe(
    [[0, 0], [0.95, 0], [1.0, 0.05], [0.9, 0.12], [0, 0.12]],
    { at: [M.turretRing[0], 1.7, M.turretRing[2]], bone: body, color: P.gunmetal, segments: 12 },
  );
  b.lathe(
    [[0.7, 0], [0.98, 0], [0.98, 0.04], [0.7, 0.04]],
    { at: [0, 1.82, -0.8], bone: body, color: P.trim, segments: 12 },
  );

  for (const s of [1, -1]) {
    // side skirts
    box(0.12, 0.45, 7.2, P.hullDark, [s * 1.82, 0.95, 0]);
    // hazard stripe along flank
    const haz = svg(
      `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="${P.trim}"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8]
        .map((i) => `<path d="M${i * 8 - 4} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8} 8Z" fill="#111"/>`)
        .join("")}</svg>`,
      { size: 256 },
    );
    b.part(new THREE.PlaneGeometry(2.4, 0.3), "#ffffff", {
      bone: body, at: [s * 1.865, 1.35, -1.6], dir: [s, 0, 0], axis: "z", texture: haz,
    });
    // decal number
    const num = svg(
      `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="none" stroke="${P.decal}" stroke-width="4"/><text x="32" y="46" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="40" fill="${P.decal}">06</text></svg>`,
      { size: 128 },
    );
    b.part(new THREE.PlaneGeometry(0.6, 0.6), "#ffffff", {
      bone: body, at: [s * 1.865, 1.45, 1.0], dir: [s, 0, 0], axis: "z", texture: num,
    });
    // wheel arches
    for (const z of [3, 0, -3]) {
      b.lathe(
        [[0.6, -0.1], [0.78, -0.1], [0.78, 0.1], [0.6, 0.1]],
        { at: [s * 1.62, 0.6, z], axis: [1, 0, 0], bone: body, color: P.hullDark, segments: 10 },
      );
      box(0.7, 0.1, 1.5, P.hullDark, [s * 1.7, 1.28, z]);
      box(0.1, 0.5, 1.5, P.hullLight, [s * 1.4, 1.1, z]);
    }
    // leg sockets
    for (const z of [1.5, -1.8]) {
      part(new THREE.CylinderGeometry(0.28, 0.32, 0.2, 8), P.steel, [s * 1.86, 1.0, z], { dir: [s, 0, 0] });
      part(new THREE.CylinderGeometry(0.34, 0.34, 0.06, 8), P.trim, [s * 1.84, 1.0, z], { dir: [s, 0, 0] });
    }
    // tail lights
    box(0.4, 0.18, 0.06, P.warnRed, [s * 1.2, 1.2, -4.12]);
    // front lamps recess / bumper end caps
    box(0.5, 0.25, 0.2, P.trim, [s * 1.4, 0.88, 4.2]);
    // grab handles
    for (const z of [-2.4, -1.2]) {
      b.rod([s * 1.7, 1.75, z], [s * 1.7, 1.75, z - 0.5], 0.025, P.steel, { bone: body });
      b.rod([s * 1.7, 1.66, z], [s * 1.7, 1.76, z], 0.02, P.steel, { bone: body });
      b.rod([s * 1.7, 1.66, z - 0.5], [s * 1.7, 1.76, z - 0.5], 0.02, P.steel, { bone: body });
    }
    // deck hatch
    box(0.7, 0.07, 0.7, P.hullDark, [s * 1.0, 1.74, -2.6]);
    box(0.5, 0.05, 0.5, P.hull, [s * 1.0, 1.78, -2.6]);
    b.torus ? 0 : 0;
    // antenna
    const ax = s * 1.5;
    b.rod([ax, 1.7, -3.7], [ax + s * 0.05, 3.0, -3.8], [0.03, 0.01], P.gunmetal, { bone: body });
    box(0.08, 0.08, 0.08, P.warnRed, [ax + s * 0.05, 3.02, -3.8]);
    // mud flap
    box(0.08, 0.4, 0.5, P.tyre, [s * 1.7, 0.95, -4.0]);
  }

  // front bumper
  box(3.4, 0.3, 0.35, P.gunmetal, [0, 0.85, 4.3]);
  box(3.0, 0.08, 0.37, P.trim, [0, 1.0, 4.3]);
  // tow hook
  b.sweep(
    [[0.0, 0.85, 4.45], [0, 0.85, 4.65], [0.15, 0.8, 4.75], [0.2, 0.7, 4.65]],
    0.04, { bone: body, color: P.steel },
  );
  box(0.3, 0.2, 0.2, P.steel, [0, 0.85, 4.45]);
  // rear bumper
  box(3.4, 0.3, 0.3, P.gunmetal, [0, 0.9, -4.2]);
  box(3.0, 0.06, 0.32, P.trim, [0, 1.06, -4.2]);
  b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 6), P.steel, { bone: body, at: [0, 0.8, -4.4], dir: [0, 0, -1] });
  // rear deck vents
  for (let i = 0; i < 5; i++) box(1.2, 0.04, 0.08, P.hullDark, [0, 1.75, -3.9 + i * 0.12]);
  // rivets/bolts on deck
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    part(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), P.steel, [Math.sin(a) * 1.1, 1.74, -0.8 + Math.cos(a) * 1.1]);
  }
  // deck stripes
  box(3.0, 0.02, 0.15, P.trim, [0, 1.72, 1.9]);
  box(3.0, 0.02, 0.15, P.trim, [0, 1.72, -3.3]);
  // front armour ribs on glacis
  for (const x of [-1, -0.5, 0, 0.5, 1]) box(0.06, 0.05, 0.7, P.hullLight, [x, 1.5, 3.7], { rotation: [-25, 0, 0] });
  void R;
  void metal;
}
```
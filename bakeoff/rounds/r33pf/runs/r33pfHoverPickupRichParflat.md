<!-- call: plan -->

```json
{
  "name": "Hoverbed Raider",
  "description": "A militarized pickup truck converted to ride on four vectored hover thrusters, in low-poly cyberpunk style with neon underglow, armor plates and a bed-mounted rail gun.",
  "builderName": "hoverPickup",
  "size": [2.6, 2.1, 5.6],
  "layout": "A chunky pickup silhouette facing +Z: sloped armored hood and grille at the front, a boxy crew cab in the middle, an open cargo bed at the back with a roll bar and a mounted gun. There are no wheels. Four large ducted hover thrusters (cylindrical nacelles with glowing cyan cores) sit in the wheel positions on short pylons, and the hull floats on them. The thrusters' lowest points rest on y=0, the body rides about 0.45 m above the floor with a glowing magenta underglow strip beneath it. Style: faceted low-poly boxes and wedges, dark gunmetal hull, olive-drab armor plates, hazard-yellow trim, neon cyan and magenta accents, and small glowing details (lights, screens, vents) as separate parts in their own colours.",
  "palette": {
    "hull": "#2f3540",
    "hullDark": "#1a1d24",
    "armor": "#55603f",
    "armorLight": "#76835a",
    "trim": "#f0c419",
    "metal": "#8a919c",
    "rubber": "#101114",
    "glass": "#14313f",
    "glassGlint": "#5fd6ea",
    "neonCyan": "#2ff3ff",
    "neonMagenta": "#ff2fb8",
    "neonOrange": "#ff8a2a",
    "lampWhite": "#fff6d8",
    "tailRed": "#ff3030",
    "decalWhite": "#e8ecef",
    "rust": "#7a4a2a"
  },
  "mounts": {
    "chassisTop": [0, 1.0, 0],
    "frontAxle": [0, 0.75, 1.65],
    "rearAxle": [0, 0.75, -1.5],
    "thrusterFL": [1.15, 0.5, 1.65],
    "thrusterFR": [-1.15, 0.5, 1.65],
    "thrusterRL": [1.15, 0.5, -1.5],
    "thrusterRR": [-1.15, 0.5, -1.5],
    "cabFloor": [0, 1.0, 0.3],
    "bedFloor": [0, 1.0, -1.1],
    "gunMount": [0, 1.25, -1.6],
    "hoodFront": [0, 1.05, 2.8]
  },
  "joints": [
    { "name": "body", "at": [0, 0.9, 0], "dir": [0, 0, 1], "role": "spine" },
    { "name": "thrusterFL", "parent": "body", "at": [1.15, 0.5, 1.65], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterFR", "parent": "body", "at": [-1.15, 0.5, 1.65], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRL", "parent": "body", "at": [1.15, 0.5, -1.5], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "thrusterRR", "parent": "body", "at": [-1.15, 0.5, -1.5], "dir": [0, -1, 0], "role": "hinge", "group": "thrusters" },
    { "name": "gunYaw", "parent": "body", "at": [0, 1.25, -1.6], "dir": [0, 1, 0], "role": "hinge", "group": "gun" },
    { "name": "gunPitch", "parent": "gunYaw", "at": [0, 1.6, -1.6], "dir": [0, 0, 1], "role": "hinge", "group": "gun" }
  ],
  "parts": [
    {
      "id": "chassis",
      "builds": "Underframe and lower hull from the front bumper to the rear: a hullDark floor pan slab, side skirts in hull colour with trim hazard stripes, armor plate panels bolted along the flanks (armor/armorLight with small metal rivets), a front armored bumper wedge with a neonOrange light bar, a rear bumper with tailRed lights and a tow hook, a glowing neonMagenta underglow strip under the pan, side exhaust vents with neonCyan slits, and four short pylon arms (hull and metal) reaching out to each thruster mount. Everything rides the body joint.",
      "box": [[-1.3, 0.55, -2.8], [1.3, 1.0, 2.8]],
      "attaches": "Pylons end at the thrusterXX mounts; top face is chassisTop, on which the cab, hood and bed sit.",
      "joints": ["body"],
      "floor": false,
      "budget": 170
    },
    {
      "id": "hoverThrusters",
      "builds": "Four identical ducted hover thrusters, one per thruster joint, mirrored by side. Each is a wide faceted cylindrical nacelle (about 0.55 radius, 0.5 tall, hull and hullDark) with a metal intake ring, an inner dark well holding a glowing neonCyan core disc and radial fan blades, a trim hazard ring, a neonCyan glow ring on the underside, small vector flaps, and a short pylon collar. The lowest point of each rests on y=0. Each rides its own thruster joint.",
      "box": [[-1.75, 0, -2.05], [1.75, 0.8, 2.2]],
      "attaches": "Centred on thrusterFL/FR/RL/RR mounts, joined to the chassis pylons from above.",
      "joints": ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"],
      "floor": true,
      "budget": 220
    },
    {
      "id": "hoodAndFront",
      "builds": "Sloped armored hood from the cab to the nose (hull plus armor plates), a grille with horizontal dark slats and a neonCyan glow strip, two angular headlamps in lampWhite with armor brow guards, a roof-height-low front fender flare over each thruster, a hood scoop with vents and neonOrange glow, a small antenna, a hazard-trim stripe across the hood, and a front plate with a decalWhite emblem built from small parts.",
      "box": [[-1.25, 1.0, 1.0], [1.25, 1.55, 2.8]],
      "attaches": "Starts at the cab front face (z=1.0) and sits on chassisTop; nose end at hoodFront.",
      "joints": ["body"],
      "floor": false,
      "budget": 150
    },
    {
      "id": "cab",
      "builds": "Crew cab from z=1.0 back to z=-0.6: faceted hull body with armor door plates, angular glass windows (glass with glassGlint reflection slivers) in a windshield, side windows and rear window with armored slat shutters, a reinforced roof with a roof light bar (neonOrange and neonCyan), a roof rack and sensor dome, door handles, side mirrors with small screens, wheel-arch-free flanks with trim stripes, a decalWhite unit number on the doors, an interior seen through glass (dark seats, a glowing neonCyan dash screen, a steering wheel), and a rear cab wall bolted to the bed.",
      "box": [[-1.2, 1.0, -0.6], [1.2, 2.1, 1.0]],
      "attaches": "Sits on chassisTop at cabFloor; front face meets the hood, rear face meets the bed at z=-0.6.",
      "joints": ["body"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "bedAndGun",
      "builds": "Open cargo bed from z=-0.6 to the tailgate at z=-2.8: bed floor, armored side walls and tailgate with trim hazard stripes and rivets, a roll bar hoop behind the cab with neonOrange lights, cargo crates and fuel drums (armorLight, rust, trim) with small straps, a spare thruster fan or power cell with a neonCyan glow, tail lights in tailRed, and a rail gun on the gunYaw/gunPitch joints: swivel base and ring (metal and hullDark) on gunMount, a gun cradle and armor shield, twin long barrels with neonCyan coil rings, a magazine box, and a glowing muzzle tip. The base rides gunYaw, the cradle and barrels ride gunPitch.",
      "box": [[-1.2, 1.0, -2.8], [1.2, 2.0, -0.6]],
      "attaches": "Front wall meets the cab rear at z=-0.6; bed floor at bedFloor on chassisTop; gun base on gunMount.",
      "joints": ["body", "gunYaw", "gunPitch"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: chassis -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at: [x, y, z], rotation: rot });
  const r = rng(11);

  // floor pan
  box(2.0, 0.1, 5.4, P.hullDark, 0, 0.62, 0);
  box(2.4, 0.14, 5.2, P.hull, 0, 0.78, 0);
  // upper deck plate (top face = chassisTop)
  box(2.5, 0.12, 5.4, P.hullDark, 0, 0.94, 0);
  // underglow
  box(1.5, 0.03, 4.4, P.neonMagenta, 0, 0.555, 0);
  box(1.7, 0.02, 4.6, P.hullDark, 0, 0.575, 0);

  for (const s of [1, -1]) {
    // side skirts
    box(0.14, 0.3, 5.0, P.hull, s * 1.22, 0.75, 0);
    // hazard stripes on skirts
    for (let i = 0; i < 12; i++) {
      const z = -2.2 + i * 0.4;
      box(0.02, 0.1, 0.16, i % 2 ? P.trim : P.hullDark, s * 1.3, 0.66, z, [0, 0, 0]);
    }
    // armor plates + rivets
    for (const [z, len, c] of [[1.5, 1.1, P.armor], [0.2, 1.4, P.armorLight], [-1.1, 1.3, P.armor], [-2.1, 0.8, P.armorLight]] as [number, number, string][]) {
      box(0.06, 0.26, len, c, s * 1.31, 0.88, z);
      for (const dz of [-1, 1])
        for (const dy of [-1, 1])
          b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone, at: [s * 1.35, 0.88 + dy * 0.09, z + dz * (len / 2 - 0.08)] });
    }
    // exhaust vents with cyan slits
    box(0.05, 0.2, 0.6, P.hullDark, s * 1.31, 0.66, -0.4);
    for (let i = 0; i < 4; i++) box(0.03, 0.025, 0.46, P.neonCyan, s * 1.34, 0.6 + i * 0.045, -0.4);
    // pylons to thrusters
    for (const z of [1.65, -1.5]) {
      box(0.9, 0.16, 0.3, P.hull, s * 1.55 - s * 0.0, 0.7, z);
      box(0.3, 0.1, 0.34, P.metal, s * 1.15, 0.62, z);
      cyl(0.07, 0.07, 0.36, 6, P.metal, s * 1.15, 0.72, z);
      box(0.5, 0.05, 0.34, P.trim, s * 1.75, 0.79, z);
    }
    // tail lights
    box(0.4, 0.14, 0.05, P.tailRed, s * 0.85, 0.82, -2.8);
    box(0.44, 0.04, 0.06, P.hullDark, s * 0.85, 0.9, -2.79);
  }

  // front bumper wedge
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 2.4, 3), P.armor, { bone, at: [0, 0.78, 2.65], rotation: [0, 0, 90], scale: [1, 1, 1] });
  box(2.3, 0.22, 0.3, P.armorLight, 0, 0.72, 2.7, [-15, 0, 0]);
  box(1.9, 0.07, 0.06, P.neonOrange, 0, 0.8, 2.86);
  box(2.3, 0.06, 0.1, P.trim, 0, 0.62, 2.78);
  for (const s of [1, -1]) box(0.12, 0.2, 0.1, P.metal, s * 1.0, 0.72, 2.84);

  // rear bumper + tow hook
  box(2.4, 0.2, 0.25, P.hullDark, 0, 0.76, -2.72);
  box(2.0, 0.05, 0.05, P.trim, 0, 0.88, -2.86);
  box(0.1, 0.1, 0.2, P.metal, 0, 0.7, -2.88);
  b.sweep([[0, 0.7, -2.92], [0, 0.6, -3.0], [0, 0.55, -2.92]] as number[][], 0.025, P.metal, { bone });
  // bumper rivets
  for (let i = 0; i < 6; i++)
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.metal, { bone, at: [-1 + i * 0.4 + r() * 0.02, 0.8, -2.86] });
}
```

<!-- call: hoverThrusters -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildHoverThrusters({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const names = ["thrusterFL", "thrusterFR", "thrusterRL", "thrusterRR"] as const;
  const RAD = 0.55;
  const H = 0.5;
  const glow = (g: THREE.BufferGeometry, c: string, o: any) => {
    return b.part(g, c, o);
  };

  for (const name of names) {
    const bone = J[name];
    const m = M[name];
    const sx = m[0] > 0 ? 1 : -1;
    const cx = m[0];
    const cz = m[2];
    // nacelle sits with bottom on y=0
    const cy = H / 2;
    const top = H;
    const at = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];

    // main shell (faceted)
    b.part(new THREE.CylinderGeometry(RAD, RAD * 0.9, H, 10), P.hull, { bone, at: at(0, cy, 0), flat: true });
    // lower dark skirt
    b.part(new THREE.CylinderGeometry(RAD * 0.92, RAD * 0.86, 0.12, 10), P.hullDark, { bone, at: at(0, 0.06, 0), flat: true });
    // armor band
    b.part(new THREE.CylinderGeometry(RAD * 1.02, RAD * 1.02, 0.1, 10), P.armor, { bone, at: at(0, 0.3, 0), flat: true });
    // hazard ring on the shell
    b.part(new THREE.TorusGeometry(RAD * 1.0, 0.025, 5, 20), P.trim, {
      bone, at: at(0, 0.2, 0), rotation: [90, 0, 0], flat: true,
    });
    // underside glow ring
    glow(new THREE.TorusGeometry(RAD * 0.7, 0.03, 5, 20), P.neonCyan, {
      bone, at: at(0, 0.02, 0), rotation: [90, 0, 0],
    });
    // metal intake ring on top
    b.part(new THREE.TorusGeometry(RAD * 0.88, 0.05, 5, 20), P.metal, {
      bone, at: at(0, top, 0), rotation: [90, 0, 0], flat: true,
    });
    // dark well
    b.part(new THREE.CylinderGeometry(RAD * 0.82, RAD * 0.82, 0.04, 16), P.rubber, { bone, at: at(0, top - 0.04, 0) });
    // glowing core disc
    glow(new THREE.CylinderGeometry(RAD * 0.3, RAD * 0.3, 0.04, 14), P.neonCyan, { bone, at: at(0, top - 0.06, 0) });
    // hub
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), P.metal, { bone, at: at(0, top - 0.02, 0) });
    // radial fan blades
    const blades = 8;
    for (let i = 0; i < blades; i++) {
      const a = (i / blades) * Math.PI * 2;
      const r = 0.3;
      b.part(new THREE.BoxGeometry(0.22, 0.015, 0.09), P.metal, {
        bone,
        at: at(Math.sin(a) * r, top - 0.03, Math.cos(a) * r),
        rotation: [0, (a * 180) / Math.PI + 90, 12],
        flat: true,
      });
    }
    // armor plates and rivets around the shell
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3 + R() * 0.1;
      const rx = Math.sin(a) * (RAD + 0.01);
      const rz = Math.cos(a) * (RAD + 0.01);
      b.part(new THREE.BoxGeometry(0.28, 0.16, 0.04), i % 2 ? P.armor : P.armorLight, {
        bone, at: at(rx, 0.36, rz), rotation: [0, (a * 180) / Math.PI, 0], flat: true,
      });
      b.part(new THREE.SphereGeometry(0.018, 5, 4), P.metal, {
        bone, at: at(Math.sin(a) * (RAD + 0.04), 0.4, Math.cos(a) * (RAD + 0.04)),
      });
    }
    // vector flaps under the nacelle
    for (const fz of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.5, 0.02, 0.12), P.hullDark, {
        bone, at: at(0, 0.0 + 0.03, fz * 0.36), rotation: [fz * 15, 0, 0], flat: true,
      });
    }
    // pylon collar toward the chassis (inner side)
    b.part(new THREE.CylinderGeometry(0.2, 0.24, 0.16, 8), P.metal, { bone, at: at(-sx * 0.1, top + 0.08, 0), flat: true });
    b.part(new THREE.BoxGeometry(0.35, 0.18, 0.3), P.hullDark, { bone, at: at(-sx * 0.38, top + 0.1, 0), flat: true });
    b.part(new THREE.BoxGeometry(0.2, 0.03, 0.31), P.trim, { bone, at: at(-sx * 0.4, top + 0.2, 0), flat: true });
    // small status light
    glow(new THREE.SphereGeometry(0.03, 5, 4), P.neonMagenta, { bone, at: at(sx * 0.1, top + 0.0, RAD * 0.9 * (cz > 0 ? 1 : -1)) });
  }
}
```

<!-- call: hoodAndFront -->

```ts
import * as THREE from "three";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildHoodAndFront({ b, J, P, M }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], ...opts });
  const lit = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1) =>
    glow(box(w, h, d, color, x, y, z), s);

  // Hood: sloped main wedge (tilted box), lower at nose
  const slope = -0.2;
  b.part(new THREE.BoxGeometry(2.3, 0.3, 1.5), P.hull, { bone, at: [0, 1.32, 1.8], rotation: [slope * 57.3 * -1, 0, 0] });
  // nose block
  box(2.4, 0.5, 0.35, P.hull, 0, 1.2, 2.62);
  // side body under the hood
  box(2.5, 0.35, 1.8, P.hullDark, 0, 1.12, 1.9);
  // armor plates on hood
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.85, 0.06, 1.0), P.armor, { bone, at: [s * 0.78, 1.47, 1.75], rotation: [-11.5, 0, 0] });
    b.part(new THREE.BoxGeometry(0.7, 0.03, 0.8), P.armorLight, { bone, at: [s * 0.78, 1.5, 1.75], rotation: [-11.5, 0, 0] });
    for (const z of [1.4, 2.1])
      for (const dx of [-0.25, 0.25])
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 6), P.metal, { bone, at: [s * 0.78 + dx, 1.54 - (z - 1.4) * 0.2 * 0.5 - 0.0, z] });
  }
  // hazard stripe across hood
  for (let i = 0; i < 9; i++) {
    const x = -1.0 + i * 0.25;
    b.part(new THREE.BoxGeometry(0.12, 0.02, 0.18), i % 2 ? P.rubber : P.trim, { bone, at: [x, 1.505, 1.3], rotation: [-11.5, 0, 0] });
  }
  // scoop
  box(0.7, 0.14, 0.6, P.hullDark, 0, 1.58, 1.9, { rotation: [-11.5, 0, 0] });
  for (let i = 0; i < 4; i++) box(0.55, 0.02, 0.03, P.hullDark, 0, 1.66 - i * 0.015, 1.7 + i * 0.12);
  lit(0.5, 0.03, 0.04, P.neonOrange, 0, 1.655, 2.2, 1.3);
  // grille
  box(1.4, 0.4, 0.06, P.hullDark, 0, 1.17, 2.8);
  for (let i = 0; i < 5; i++) box(1.3, 0.04, 0.04, P.rubber, 0, 1.03 + i * 0.075, 2.835);
  lit(1.3, 0.035, 0.03, P.neonCyan, 0, 1.36, 2.83, 1.5);
  // headlamps + brows
  for (const s of [1, -1]) {
    lit(0.4, 0.17, 0.08, P.lampWhite, s * 0.95, 1.3, 2.8, 1.4);
    box(0.5, 0.06, 0.16, P.armor, s * 0.95, 1.42, 2.78);
    box(0.12, 0.2, 0.16, P.armor, s * 1.18, 1.3, 2.76);
    // fender flares
    box(0.55, 0.12, 1.1, P.armor, s * 1.16, 1.12, 1.65);
    box(0.1, 0.3, 1.1, P.hull, s * 1.22, 1.2, 1.65);
    box(0.3, 0.04, 0.06, P.trim, s * 1.22, 1.35, 2.28);
  }
  // bumper strip + front plate
  box(2.2, 0.1, 0.12, P.metal, 0, 1.0, 2.78);
  box(0.5, 0.2, 0.04, P.hullDark, 0, 1.17, 2.85);
  // emblem: diamond-ish from small parts
  box(0.2, 0.03, 0.02, P.decalWhite, 0, 1.17, 2.875);
  box(0.03, 0.14, 0.02, P.decalWhite, 0, 1.17, 2.875);
  box(0.1, 0.03, 0.02, P.decalWhite, 0, 1.1, 2.875, { rotation: [0, 0, 30] });
  // antenna
  b.part(new THREE.CylinderGeometry(0.012, 0.018, 0.7, 6), P.metal, { bone, at: [1.05, 1.85, 1.2] });
  glow(b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonMagenta, { bone, at: [1.05, 2.21, 1.2] }), 1.5);
  box(0.1, 0.08, 0.1, P.hullDark, 1.05, 1.52, 1.2);
}
```

<!-- call: bedAndGun -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildBedAndGun({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = J.body, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as any, ...(rot ? { rotation: rot as any } : {}) });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], bone: any = J.body, seg = 8, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: at as any, ...(dir ? { dir: dir as any } : {}) });

  // bed floor
  box(2.3, 0.08, 2.15, P.hullDark, [0, 1.04, -1.7]);
  for (let i = 0; i < 7; i++) box(2.2, 0.02, 0.05, P.metal, [0, 1.09, -0.75 - i * 0.3]);

  // side walls, tailgate, front wall
  for (const s of [1, -1]) {
    box(0.1, 0.6, 2.2, P.hull, [s * 1.15, 1.37, -1.7]);
    box(0.14, 0.1, 2.25, P.armor, [s * 1.15, 1.7, -1.7]);
    box(0.02, 0.1, 2.0, P.trim, [s * 1.21, 1.5, -1.7]);
    box(0.02, 0.1, 2.0, P.hullDark, [s * 1.21, 1.35, -1.7]);
    for (let i = 0; i < 6; i++) {
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone: J.body, at: [s * 1.22, 1.6, -0.85 - i * 0.37] as any });
      box(0.03, 0.4, 0.07, P.armorLight, [s * 1.21, 1.35, -0.85 - i * 0.37]);
    }
    // tail lights
    box(0.1, 0.18, 0.06, P.tailRed, [s * 1.0, 1.4, -2.83]);
    box(0.06, 0.04, 0.06, P.lampWhite, [s * 1.0, 1.55, -2.83]);
  }
  box(2.3, 0.6, 0.1, P.hull, [0, 1.37, -2.75]);
  box(2.3, 0.12, 0.14, P.armor, [0, 1.7, -2.75]);
  for (let i = 0; i < 6; i++) box(0.16, 0.1, 0.02, i % 2 ? P.hullDark : P.trim, [-0.85 + i * 0.34, 1.4, -2.81]);
  for (let i = 0; i < 8; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.metal, { bone: J.body, at: [-1 + i * 0.29, 1.6, -2.81] as any });
  box(2.3, 0.7, 0.1, P.armor, [0, 1.4, -0.65]);
  box(2.0, 0.1, 0.12, P.trim, [0, 1.65, -0.58]);

  // roll bar
  for (const s of [1, -1]) {
    box(0.09, 0.85, 0.09, P.metal, [s * 1.0, 2.0, -0.8]);
    box(0.12, 0.12, 0.12, P.hullDark, [s * 1.0, 1.65, -0.8]);
    box(0.1, 0.08, 0.06, P.neonOrange, [s * 1.0, 2.38, -0.74]);
  }
  box(2.1, 0.09, 0.09, P.metal, [0, 2.44, -0.8]);
  box(1.0, 0.07, 0.07, P.neonOrange, [0, 2.38, -0.74]);

  // crates & drums
  box(0.6, 0.45, 0.6, P.armorLight, [0.7, 1.3, -1.1]);
  box(0.62, 0.06, 0.1, P.hullDark, [0.7, 1.4, -1.1]);
  box(0.1, 0.47, 0.62, P.trim, [0.7, 1.3, -1.1]);
  box(0.45, 0.4, 0.45, P.rust, [0.75, 1.27, -1.75]);
  box(0.47, 0.05, 0.47, P.trim, [0.75, 1.5, -1.75]);
  for (const z of [-1.2, -1.75]) {
    cyl(0.2, 0.2, 0.55, z < -1.5 ? P.rust : P.armor, [-0.85, 1.35, z], J.body, 10);
    cyl(0.205, 0.205, 0.05, P.trim, [-0.85, 1.35, z], J.body, 10);
    cyl(0.205, 0.205, 0.04, P.hullDark, [-0.85, 1.5, z], J.body, 10);
    cyl(0.06, 0.06, 0.05, P.metal, [-0.85, 1.65, z], J.body, 6);
  }
  // power cell
  cyl(0.28, 0.28, 0.2, P.hullDark, [0.75, 1.2, -2.35], J.body, 12);
  cyl(0.2, 0.2, 0.04, P.neonCyan, [0.75, 1.32, -2.35], J.body, 12);
  box(0.5, 0.04, 0.04, P.metal, [0.75, 1.36, -2.35]);
  box(0.04, 0.04, 0.5, P.metal, [0.75, 1.36, -2.35]);
  box(0.5, 0.04, 0.4, P.hull, [-0.8, 1.1, -2.4]);

  // gun base
  const gy = J.gunYaw, gp = J.gunPitch;
  cyl(0.4, 0.45, 0.12, P.hullDark, [0, 1.12, -1.6], gy, 12);
  cyl(0.3, 0.3, 0.2, P.metal, [0, 1.25, -1.6], gy, 10);
  const ring = cyl(0.42, 0.42, 0.04, P.metal, [0, 1.19, -1.6], gy, 14);
  void ring;
  cyl(0.43, 0.43, 0.02, P.neonCyan, [0, 1.2, -1.6], gy, 14);
  for (const s of [1, -1]) {
    box(0.1, 0.45, 0.35, P.hull, [s * 0.3, 1.5, -1.6], gy);
    box(0.12, 0.1, 0.2, P.trim, [s * 0.3, 1.7, -1.6], gy);
  }
  // cradle & barrels
  box(0.5, 0.3, 0.7, P.hull, [0, 1.65, -1.6], gp);
  box(0.4, 0.05, 0.6, P.armor, [0, 1.83, -1.6], gp);
  box(0.9, 0.7, 0.07, P.armor, [0, 1.85, -1.3], gp, [-12, 0, 0]);
  box(0.8, 0.06, 0.04, P.trim, [0, 2.12, -1.26], gp, [-12, 0, 0]);
  box(0.28, 0.3, 0.4, P.hullDark, [0.38, 1.6, -1.8], gp);
  box(0.2, 0.04, 0.3, P.neonCyan, [0.38, 1.76, -1.8], gp);
  for (const s of [1, -1]) {
    cyl(0.05, 0.05, 1.9, P.metal, [s * 0.12, 1.65, -0.6], gp, 8, [0, 0, 1]);
    for (let i = 0; i < 5; i++) cyl(0.075, 0.075, 0.04, P.neonCyan, [s * 0.12, 1.65, -0.9 + i * 0.28], gp, 8, [0, 0, 1]);
    cyl(0.065, 0.065, 0.1, P.hullDark, [s * 0.12, 1.65, 0.38], gp, 8, [0, 0, 1]);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone: gp, at: [s * 0.12, 1.65, 0.45] as any });
  }
  box(0.4, 0.06, 0.1, P.metal, [0, 1.65, -0.2], gp);
}
```

<!-- call: cab -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], ...o });
  const lit = (p: any, s = 1) => glow(p, s);
  const GLASS = P.glass, GL = P.glassGlint;

  // Main cab body (lower) z -0.6..1.0, y 1.0..1.55
  box(2.3, 0.55, 1.6, P.hull, 0, 1.275, 0.2);
  // Beltline trim
  for (const s of [1, -1]) {
    box(0.03, 0.06, 1.62, P.trim, s * 1.16, 1.5, 0.2);
    box(0.03, 0.05, 1.62, P.trim, s * 1.16, 1.12, 0.2);
    // armor door plates
    for (const z of [0.65, -0.1]) {
      box(0.05, 0.36, 0.66, P.armor, s * 1.16, 1.3, z);
      box(0.06, 0.04, 0.5, P.armorLight, s * 1.165, 1.44, z);
      for (const dz of [-0.27, 0.27]) for (const dy of [-0.14, 0.14])
        b.part(new THREE.SphereGeometry(0.02, 5, 4), P.metal, { bone, at: [s * 1.2, 1.3 + dy, z + dz] });
      // handle
      box(0.05, 0.04, 0.16, P.metal, s * 1.2, 1.38, z - 0.18);
    }
    // unit number "07" from small bars
    box(0.01, 0.16, 0.04, P.decalWhite, s * 1.195, 1.25, 0.58);
    box(0.01, 0.04, 0.12, P.decalWhite, s * 1.195, 1.33, 0.67);
    box(0.01, 0.16, 0.04, P.decalWhite, s * 1.195, 1.25, 0.76);
    box(0.01, 0.04, 0.12, P.decalWhite, s * 1.195, 1.17, 0.67);
    box(0.01, 0.04, 0.12, P.decalWhite, s * 1.195, 1.33, 0.52);
  }

  // Greenhouse: pillars + roof
  const gy0 = 1.55, gh = 0.45;
  const roofY = gy0 + gh;
  // roof slab
  box(2.3, 0.1, 1.5, P.hull, 0, roofY + 0.05, 0.1);
  box(2.0, 0.04, 1.2, P.armor, 0, roofY + 0.12, 0.1);
  // pillars
  for (const s of [1, -1]) for (const z of [0.86, 0.3, -0.5]) {
    const raked = z > 0.8;
    box(0.1, gh, 0.1, P.hullDark, s * 1.1, gy0 + gh / 2, z, raked ? { rotation: [-18, 0, 0] } : {});
  }
  // windshield (raked)
  b.part(new THREE.BoxGeometry(2.0, 0.03, 0.55), GLASS, { bone, at: [0, gy0 + gh / 2, 0.88], rotation: [58, 0, 0] });
  b.part(new THREE.BoxGeometry(0.5, 0.012, 0.04), GL, { bone, at: [0.5, gy0 + gh / 2 + 0.02, 0.9], rotation: [58, 0, 0] });
  b.part(new THREE.BoxGeometry(0.25, 0.012, 0.03), GL, { bone, at: [0.1, gy0 + gh / 2 + 0.03, 0.88], rotation: [58, 0, 0] });
  // side windows
  for (const s of [1, -1]) {
    box(0.03, 0.36, 0.5, GLASS, s * 1.12, gy0 + 0.23, 0.58);
    box(0.03, 0.36, 0.55, GLASS, s * 1.12, gy0 + 0.23, -0.1);
    box(0.012, 0.3, 0.05, GL, s * 1.14, gy0 + 0.23, 0.7, { rotation: [0, 0, 0] });
    box(0.012, 0.3, 0.04, GL, s * 1.14, gy0 + 0.23, 0.02);
    // mirror
    box(0.05, 0.1, 0.16, P.hullDark, s * 1.32, 1.72, 0.9);
    box(0.02, 0.07, 0.12, P.hullDark, s * 1.31, 1.72, 0.9);
    lit(box(0.01, 0.06, 0.1, P.neonCyan, s * 1.345, 1.72, 0.9));
    box(0.2, 0.03, 0.03, P.metal, s * 1.2, 1.7, 0.9);
  }
  // rear window + slat shutters
  box(1.8, 0.34, 0.03, GLASS, 0, gy0 + 0.23, -0.62);
  box(0.4, 0.012, 0.03, GL, 0.5, gy0 + 0.3, -0.64);
  for (let i = 0; i < 5; i++) box(1.9, 0.04, 0.07, P.armor, 0, gy0 + 0.08 + i * 0.075, -0.66, { rotation: [-20, 0, 0] });
  for (const s of [1, -1]) box(0.08, 0.4, 0.1, P.armorLight, s * 0.95, gy0 + 0.23, -0.66);

  // rear cab wall
  box(2.3, 1.0, 0.1, P.hull, 0, 1.5, -0.55);
  box(2.0, 0.5, 0.04, P.armor, 0, 1.2, -0.62);
  box(2.0, 0.06, 0.05, P.trim, 0, 1.05, -0.64);
  for (let i = -3; i <= 3; i++) box(0.08, 0.06, 0.05, P.hullDark, i * 0.3, 1.05, -0.645, { rotation: [0, 0, 30] });

  // front header/cowl
  box(2.3, 0.08, 0.12, P.hullDark, 0, 1.56, 1.0);
  box(2.2, 0.06, 0.1, P.trim, 0, 1.6, 1.02);

  // roof light bar
  box(1.4, 0.1, 0.12, P.hullDark, 0, roofY + 0.19, 0.78);
  for (let i = 0; i < 6; i++)
    lit(box(0.2, 0.06, 0.13, i % 2 ? P.neonCyan : P.neonOrange, -0.55 + i * 0.22, roofY + 0.19, 0.78), 1.4);
  // roof rack
  for (const s of [1, -1]) box(0.04, 0.06, 0.9, P.metal, s * 0.7, roofY + 0.17, -0.1);
  for (const z of [-0.5, -0.25, 0, 0.25]) box(1.44, 0.03, 0.04, P.metal, 0, roofY + 0.2, z - 0.05);
  for (const s of [1, -1]) for (const z of [-0.5, 0.25]) box(0.05, 0.08, 0.05, P.metal, s * 0.7, roofY + 0.15, z);
  // sensor dome
  b.part(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 8), P.hullDark, { bone, at: [0, roofY + 0.17, -0.1] });
  b.part(new THREE.SphereGeometry(0.14, 8, 5, 0, 6.283, 0, 1.57), P.metal, { bone, at: [0, roofY + 0.2, -0.1] });
  lit(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonMagenta, { bone, at: [0, roofY + 0.28, 0.0] }));
  box(0.02, 0.2, 0.02, P.metal, -0.5, roofY + 0.3, -0.4);
  lit(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.tailRed, { bone, at: [-0.5, roofY + 0.41, -0.4] }));

  // interior
  box(2.0, 0.12, 0.3, P.hullDark, 0, 1.62, 0.78); // dash
  lit(box(0.5, 0.2, 0.03, P.neonCyan, 0.3, 1.72, 0.66, { rotation: [-20, 0, 0] }), 1.2);
  lit(box(0.2, 0.1, 0.03, P.neonMagenta, -0.2, 1.7, 0.66, { rotation: [-20, 0, 0] }));
  b.part(new THREE.TorusGeometry(0.15, 0.025, 5, 10), P.rubber, { bone, at: [-0.5, 1.68, 0.55], rotation: [-30, 0, 0] });
  box(0.04, 0.04, 0.2, P.metal, -0.5, 1.65, 0.62);
  for (const x of [-0.5, 0.5]) {
    box(0.5, 0.1, 0.5, P.rubber, x, 1.5, 0.15);
    box(0.5, 0.5, 0.1, P.rubber, x, 1.78, -0.15, { rotation: [8, 0, 0] });
    box(0.3, 0.1, 0.08, P.hullDark, x, 2.08, -0.12);
  }
  box(0.2, 0.06, 0.6, P.hullDark, 0, 1.55, 0.2);
  // stripes on roof edge
  for (const s of [1, -1]) box(0.08, 0.02, 1.4, P.trim, s * 1.08, roofY + 0.11, 0.1);
  // rivets on roof
  for (let i = 0; i < 8; i++)
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.metal, { bone, at: [(R() - 0.5) * 1.8, roofY + 0.14, 0.5 - R() * 1.2] });
}
```
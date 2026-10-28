<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

// Monster truck base: chassis rails, axles, body shell, cab, bed. Pixel-art blocky look.
// Overall: length 5.2 (z -2.6..2.6), width 2.4 body, tyres at x=+-1.55, tyre radius ~0.85.
export const BASE_PARTS = [
  {
    id: "wheels",
    builds: "four huge monster tyres (radius 0.85, width 0.75) with chunky tread blocks, rims, hubs, lug nuts and mud, plus wheel joints",
    box: [
      [-1.95, 0, -2.2],
      [1.95, 1.7, 2.2],
    ],
    attaches: "axle ends of axleFront and axleRear at x=+-1.55, y=0.85, z=+-1.5 (joints axleFront, axleRear)",
    joints: ["axleFront", "axleRear"],
    floor: true,
    budget: 300,
  },
  {
    id: "cabDetails",
    builds: "windshield, side windows, doors, handles, mirrors, roll-bar light bar, roof lights, wipers, pixel flame decals",
    box: [
      [-1.2, 2.0, -0.6],
      [1.2, 3.3, 1.1],
    ],
    attaches: "cab shell front, side and roof surfaces (cab box centred y 2.55, z 0.4)",
    joints: ["body"],
    floor: false,
    budget: 150,
  },
  {
    id: "frontEnd",
    builds: "grille, headlights, bumper, hood scoop, tow hooks, front plate, winch",
    box: [
      [-1.25, 0.9, 1.5],
      [1.25, 2.4, 2.9],
    ],
    attaches: "front face of hood block at z=2.2 and front bumper beam on chassis",
    joints: ["body"],
    floor: false,
    budget: 150,
  },
  {
    id: "rearEnd",
    builds: "truck bed details, exhaust stacks, tail lights, rear bumper, spare parts, tailgate, shocks",
    box: [
      [-1.25, 0.9, -2.9],
      [1.25, 2.6, -1.0],
    ],
    attaches: "rear face and top of bed block at z=-2.0..-2.5",
    joints: ["body"],
    floor: false,
    budget: 150,
  },
  {
    id: "suspension",
    builds: "coil-over shocks, leaf springs, control arms, driveshaft, differentials, skid plate",
    box: [
      [-1.5, 0.3, -2.0],
      [1.5, 1.6, 2.0],
    ],
    attaches: "axle beams and chassis rails underside (joints chassis, axleFront, axleRear)",
    joints: ["chassis", "axleFront", "axleRear"],
    floor: false,
    budget: 150,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const chassis = b.joint("chassis", { at: [0, 1.2, 0] });
  const body = b.joint("body", { parent: chassis, at: [0, 1.6, 0] });
  b.joint("axleFront", { parent: chassis, at: [0, 0.85, 1.5] });
  b.joint("axleRear", { parent: chassis, at: [0, 0.85, -1.5] });

  const BOX = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const FRAME = "#2b2d3a";
  const AXLE = "#4a4d5c";
  const RED = "#d62828";
  const DARK_RED = "#9d1c1c";
  const ROOF = "#e63946";
  const BLACK = "#16161d";

  // chassis rails
  for (const s of [1, -1]) {
    b.part(BOX(0.28, 0.3, 4.6), FRAME, { bone: chassis, at: [s * 0.7, 1.2, 0] });
  }
  b.part(BOX(1.4, 0.2, 0.3), FRAME, { bone: chassis, at: [0, 1.2, 1.0] });
  b.part(BOX(1.4, 0.2, 0.3), FRAME, { bone: chassis, at: [0, 1.2, -1.0] });

  // axles
  for (const z of [1.5, -1.5]) {
    b.part(BOX(3.1, 0.26, 0.26), AXLE, { bone: chassis, at: [0, 0.85, z] });
    b.part(BOX(0.5, 0.5, 0.5), BLACK, { bone: chassis, at: [0, 0.85, z] });
  }

  // lower body tub
  b.part(BOX(2.4, 0.7, 4.8), DARK_RED, { bone: body, at: [0, 1.7, 0] });
  // hood
  b.part(BOX(2.3, 0.6, 1.6), RED, { bone: body, at: [0, 2.2, 1.6] });
  // cab
  b.part(BOX(2.2, 1.0, 1.7), RED, { bone: body, at: [0, 2.55, 0.1] });
  b.part(BOX(2.0, 0.2, 1.5), ROOF, { bone: body, at: [0, 3.15, 0.1] });
  // bed
  b.part(BOX(2.3, 0.6, 1.7), RED, { bone: body, at: [0, 2.2, -1.75] });
  b.part(BOX(1.9, 0.2, 1.3), BLACK, { bone: body, at: [0, 2.45, -1.75] });
  // fender flares over wheels
  for (const s of [1, -1])
    for (const z of [1.5, -1.5])
      b.part(BOX(0.3, 0.35, 1.5), DARK_RED, { bone: body, at: [s * 1.2, 2.0, z] });

  return b.root;
}
```

<!-- call: suspension -->

The base source never arrived: the prompt contains only a `{ base; }` placeholder. So the layout below is a guess at a typical monster truck, not something checked against its code. Axle positions and chassis height are assumptions.

I assumed the front axle is near z = +1.2, the rear axle near z = -1.2, and the axle beams at about y = 0.8. The chassis rails run along the underside at about y = 1.2 to 1.3, with x = ±0.45.

I attach everything to the existing `chassis`, `axleFront` and `axleRear` joints by passing them as `bone`. This assumes those joints are already defined in the base. Nothing here creates a joint, so I added none with the `suspension` prefix. Every part stays inside the box [-1.5, 0.3, -2] to [1.5, 1.6, 2]. Colours are flat strings in a pixel-art palette.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildSuspension(b: Builder) {
  const STEEL = "#6a6d7c";
  const DARK = "#2a2b33";
  const SPRING = "#e0c030";
  const RED = "#c83030";
  const SHAFT = "#9aa0b0";
  const BRASS = "#b88e46";

  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], bone: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, bone });

  const axles: [string, number][] = [
    ["axleFront", 1.2],
    ["axleRear", -1.2],
  ];
  const AY = 0.8;

  // chassis rails
  for (const s of [1, -1]) box(0.14, 0.14, 3.4, DARK, [s * 0.45, 1.25, 0], "chassis");
  // cross members
  for (const z of [-1.2, 0, 1.2]) box(0.9, 0.1, 0.12, DARK, [0, 1.25, z], "chassis");

  // skid plate
  box(0.8, 0.06, 1.0, STEEL, [0, 0.42, 0], "chassis");
  box(0.8, 0.12, 0.06, STEEL, [0, 0.46, 0.5], "chassis");

  // driveshaft
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), SHAFT, {
    at: [0, 0.8, 0],
    dir: [0, 0, 1],
    bone: "chassis",
  });
  for (const z of [-0.6, 0.6]) box(0.14, 0.14, 0.1, BRASS, [0, 0.8, z], "chassis");

  for (const [bone, z] of axles) {
    // axle beam
    box(2.4, 0.14, 0.14, STEEL, [0, AY, z], bone);
    // differential
    b.part(new THREE.SphereGeometry(0.2, 6, 5), RED, { at: [0, AY, z], bone });
    box(0.2, 0.2, 0.12, DARK, [0, AY, z + (z > 0 ? 0.2 : -0.2)], bone);

    for (const s of [1, -1]) {
      const x = s * 0.6;
      // leaf springs: stacked leaves
      for (let i = 0; i < 4; i++) box(0.1, 0.03, 0.9 - i * 0.12, DARK, [x, AY + 0.1 + i * 0.035, z], bone);
      box(0.12, 0.08, 0.12, STEEL, [x, AY + 0.0, z], bone);
      // coil-over shock
      b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6), STEEL, { at: [s * 0.8, 1.05, z], bone });
      for (let i = 0; i < 5; i++)
        b.part(new THREE.TorusGeometry(0.08, 0.02, 4, 6), SPRING, {
          at: [s * 0.8, 0.9 + i * 0.065, z],
          rotation: [90, 0, 0],
          bone,
        });
      box(0.14, 0.05, 0.14, RED, [s * 0.8, 1.27, z], "chassis");
      // control arm (diagonal link)
      b.rod([s * 0.5, 0.95, z + (z > 0 ? -0.3 : 0.3)], [s * 0.85, 0.85, z], 0.035, STEEL, { bone });
      // upper link
      b.rod([s * 0.45, 1.2, z], [s * 0.75, 0.95, z], 0.03, DARK, { bone });
    }
  }
}
```

<!-- call: frontEnd -->

The base source was not included in the prompt (it shows a literal `{ base; }` placeholder), so I could not read its code. I built against the stated attachment: the hood block's front face at z=2.2, a bumper beam on the chassis, and the `body` joint. Everything stays inside the box x ±1.25, y 0.9–2.4, z 1.5–2.9. I have not checked it against the base's actual geometry.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildFrontEnd(b: Builder) {
  const body = "body";
  const T = 0.1; // pixel texel size
  const BLACK = "#15151c";
  const DARK = "#2b2d38";
  const STEEL = "#8d94a6";
  const LIGHT = "#cfd5e3";
  const RED = "#d62828";
  const YEL = "#ffe066";
  const WHITE = "#fffbe6";
  const ORANGE = "#ff8c1a";

  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    x: number,
    y: number,
    z: number,
  ) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at: [x, y, z] });

  // Grille on the hood front face (z=2.2)
  box(1.5, 0.7, 0.12, BLACK, 0, 1.55, 2.26);
  box(1.6, 0.06, 0.14, STEEL, 0, 1.93, 2.27);
  box(1.6, 0.06, 0.14, STEEL, 0, 1.17, 2.27);
  for (const s of [1, -1]) box(0.06, 0.8, 0.14, STEEL, s * 0.8, 1.55, 2.27);
  for (let i = 0; i < 6; i++) {
    box(1.3, 0.05, 0.1, STEEL, 0, 1.3 + i * 0.1, 2.33);
  }
  box(0.2, 0.2, 0.08, YEL, 0, 1.55, 2.38); // emblem
  box(0.1, 0.1, 0.09, RED, 0, 1.55, 2.4);

  // Headlights
  for (const s of [1, -1]) {
    box(0.4, 0.34, 0.12, DARK, s * 1.0, 1.7, 2.26);
    box(0.3, 0.24, 0.12, WHITE, s * 1.0, 1.7, 2.32);
    box(0.12, 0.12, 0.1, YEL, s * 1.0, 1.7, 2.38);
    box(0.4, 0.06, 0.16, DARK, s * 1.0, 1.9, 2.3); // visor
    // fog lamps
    box(0.18, 0.14, 0.1, YEL, s * 0.55, 1.1, 2.55);
  }

  // Bumper beam and plates
  box(2.4, 0.3, 0.3, STEEL, 0, 1.02, 2.65);
  box(2.4, 0.06, 0.32, LIGHT, 0, 1.2, 2.65);
  box(2.4, 0.06, 0.32, DARK, 0, 0.9 + 0.1, 2.65);
  for (const s of [1, -1]) {
    box(0.2, 0.34, 0.34, DARK, s * 1.2, 1.02, 2.65);
    box(0.4, 0.28, 0.1, ORANGE, s * 1.0, 1.03, 2.82);
    box(0.5, 0.3, 0.1, STEEL, s * 0.35, 1.5 - 0.48, 2.82 - 0.0);
  }

  // Front plate
  box(0.6, 0.3, 0.06, WHITE, 0, 1.0, 2.83);
  box(0.5, 0.06, 0.07, BLACK, 0, 1.0, 2.85);
  box(0.06, 0.2, 0.07, RED, -0.22, 1.0, 2.86);

  // Tow hooks
  for (const s of [1, -1]) {
    box(0.14, 0.14, 0.2, DARK, s * 0.75, 1.0, 2.82);
    box(0.1, 0.34, 0.1, RED, s * 0.75, 0.97, 2.92 - 0.04);
    box(0.1, 0.1, 0.1, RED, s * 0.75, 1.12, 2.86);
  }

  // Winch
  box(0.8, 0.22, 0.24, DARK, 0, 1.24, 2.66);
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8), STEEL, {
    bone: body,
    at: [0, 1.24, 2.82],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), YEL, {
    bone: body,
    at: [0.34, 1.24, 2.82],
    rotation: [0, 0, 90],
  });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), YEL, {
    bone: body,
    at: [-0.34, 1.24, 2.82],
    rotation: [0, 0, 90],
  });
  box(0.12, 0.12, 0.1, RED, 0, 1.24, 2.88);

  // Hood scoop on top of the hood
  box(0.9, 0.2, 0.7, DARK, 0, 2.2, 1.85);
  box(0.8, 0.2, 0.12, BLACK, 0, 2.26, 2.18);
  box(0.9, 0.05, 0.72, STEEL, 0, 2.33, 1.85);
  for (let i = 0; i < 3; i++) box(0.7, 0.04, 0.05, STEEL, 0, 2.24, 2.12 - i * 0.0);
  box(0.12, 0.1, 0.1, ORANGE, 0.3, 2.35, 2.1);
  box(0.12, 0.1, 0.1, ORANGE, -0.3, 2.35, 2.1);
}
```

<!-- call: wheels -->

The base source was not included in the prompt (it shows a literal `{ base; }` placeholder), so I could not read the real geometry. I built against the stated attachment points instead: axle joints `axleFront` and `axleRear` at x = ±1.55, y = 0.85, z = ±1.5. If the base's axles sit elsewhere, the wheels will not line up with them.

Each wheel is a tyre of radius 0.85 and width 0.75, so it rests on y = 0 and fills the box. It has chunky tread blocks, a rim with a lip, a hub, lug nuts and mud. Each wheel gets its own joint, named `wheelsFL`, `wheelsFR`, `wheelsRL` or `wheelsRR`. The joints are parented to the axle joints and their bone +Y points along the axle.

The wheel parts are built along local +Y and then turned onto the axle with `dir`. The tread blocks are placed on a ring around the axle, so they stay on the tyre when it spins.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildWheels(b: Builder) {
  const R = 0.85, W = 0.75;
  const TIRE = "#1b1b1f", TREAD = "#2c2c33", RIM = "#c9ccd6", RIM_D = "#7d8191";
  const HUB = "#e2a21c", NUT = "#3a3d4a", MUD = "#6b4a2b", MUD_D = "#4a3220";

  const defs: [string, string, number, number, number][] = [
    ["wheelsFL", "axleFront", 1, 1, 1.5],
    ["wheelsFR", "axleFront", -1, 1, 1.5],
    ["wheelsRL", "axleRear", 1, -1, -1.5],
    ["wheelsRR", "axleRear", -1, -1, -1.5],
  ];

  for (const [name, axle, s, , z] of defs) {
    const at = new THREE.Vector3(s * 1.55, R, z);
    const out: [number, number, number] = [s, 0, 0];
    const j = b.joint(name, { parent: axle, at, dir: out, role: "hinge" });
    const place = (geo: THREE.BufferGeometry, color: string, off: number, extra: object = {}) =>
      b.part(geo, color, { bone: j, at: [at.x + s * off, at.y, at.z], dir: out, ...extra });

    // main tyre body (octagon-ish low poly)
    place(new THREE.CylinderGeometry(R * 0.93, R * 0.93, W, 16), TIRE, 0);
    // sidewall bulge rings
    for (const o of [-1, 1])
      place(new THREE.CylinderGeometry(R * 0.8, R * 0.9, 0.05, 16), TREAD, o * (W / 2 - 0.02));

    // tread blocks around circumference, two staggered rows
    const N = 16;
    for (let row = 0; row < 2; row++) {
      for (let i = 0; i < N; i++) {
        const a = ((i + row * 0.5) / N) * Math.PI * 2;
        const cy = Math.cos(a), cz = Math.sin(a);
        const rr = R * 0.93 + 0.05;
        const w = W * 0.42;
        const off = (row ? 1 : -1) * W * 0.23;
        const g = new THREE.BoxGeometry(w, 0.13, 0.2);
        const p = new THREE.Vector3(s * off, cy * rr, cz * rr).add(at);
        b.part(g, TREAD, {
          bone: j,
          at: [at.x + s * off, at.y + cy * rr, at.z + cz * rr],
          // rotate box so its +Y points radially; box width along X
          rotation: [(a * 180) / Math.PI - 90, 0, 0],
        });
        void p;
      }
    }

    // rim, lip, hub (outer face on the outside)
    const face = s * (W / 2);
    place(new THREE.CylinderGeometry(R * 0.5, R * 0.5, 0.1, 12), RIM_D, s * 0 + (face > 0 ? 0.3 : 0.3) * 1);
    place(new THREE.CylinderGeometry(R * 0.52, R * 0.52, 0.04, 12), RIM, 0.35);
    place(new THREE.CylinderGeometry(R * 0.2, R * 0.2, 0.12, 8), HUB, 0.4);
    place(new THREE.CylinderGeometry(R * 0.08, R * 0.08, 0.16, 6), RIM_D, 0.42);

    // lug nuts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = R * 0.36;
      b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 6), NUT, {
        bone: j,
        at: [at.x + s * 0.41, at.y + Math.cos(a) * r, at.z + Math.sin(a) * r],
        dir: out,
      });
    }

    // mud splats near bottom and on sidewall
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + (i - 3) * 0.28;
      const rr = R * 0.93 + 0.04;
      const off = ((i % 3) - 1) * W * 0.25;
      b.part(new THREE.BoxGeometry(0.16, 0.07, 0.14), i % 2 ? MUD : MUD_D, {
        bone: j,
        at: [at.x + s * off, at.y + Math.cos(a) * rr, at.z + Math.sin(a) * rr],
        rotation: [(a * 180) / Math.PI - 90, 0, 0],
      });
    }
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + 0.4;
      const r = R * (0.58 + 0.04 * i);
      b.part(new THREE.BoxGeometry(0.03, 0.12, 0.1), MUD_D, {
        bone: j,
        at: [at.x + s * 0.38, at.y + Math.cos(a) * r, at.z + Math.sin(a) * r],
        dir: out,
      });
    }
  }
  void frame;
}
```

<!-- call: cabDetails -->

The base source came through as the literal placeholder `{ base; }`, so I never saw the real code. I built against the dimensions in your brief: a cab box centred at y 2.55 and z 0.4, inside the box [-1.2..1.2, 2..3.3, -0.6..1.1]. I assumed the cab is about 2.2 m wide (half-width 1.1), 1.4 m tall (y 1.85 to 3.25) and 1.4 m deep (z -0.3 to 1.1). I have not run this against the base, and it will only seat correctly if the base cab matches those numbers. Everything is colour strings, placed on the `body` joint.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCabDetails(b: Builder) {
  const bone = "body";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const GLASS = "#3a6ea5", GLASS2 = "#8fc4ef", DARK = "#16161e", CHROME = "#c9ccd6";
  const FLAME1 = "#ff7a1a", FLAME2 = "#ffd23a", FLAME3 = "#e02a1a", LIGHT = "#fff6b0", DOOR = "#d9362b";

  const hw = 1.1;      // cab half width
  const front = 1.1;   // cab front z
  const roofY = 3.25;  // cab roof y
  const back = -0.3;

  // windshield (pixel-stepped glass with frame)
  box(1.9, 0.62, 0.04, DARK, 0, 2.95, front + 0.02);
  box(1.8, 0.52, 0.05, GLASS, 0, 2.95, front + 0.03);
  for (let i = 0; i < 6; i++) box(0.22, 0.08, 0.06, GLASS2, -0.7 + i * 0.28, 3.12 - (i % 2) * 0.1, front + 0.045);
  box(0.06, 0.52, 0.06, DARK, 0, 2.95, front + 0.05);

  // wipers
  for (const s of [1, -1]) {
    box(0.6, 0.04, 0.04, DARK, s * 0.4, 2.7, front + 0.07);
  }

  for (const s of [1, -1]) {
    const x = s * (hw + 0.02);
    // side windows
    box(0.04, 0.5, 0.9, DARK, x, 2.95, 0.5);
    box(0.05, 0.42, 0.8, GLASS, x + s * 0.005, 2.95, 0.5);
    box(0.06, 0.1, 0.25, GLASS2, x + s * 0.01, 3.08, 0.7);
    // door panel outline
    box(0.03, 0.04, 1.15, DARK, x, 2.62, 0.45);
    box(0.03, 1.0, 0.04, DARK, x, 2.35, -0.12);
    box(0.03, 1.0, 0.04, DARK, x, 2.35, 1.0);
    box(0.03, 1.0, 0.04, DARK, x, 2.35, 0.45);
    // door handles
    box(0.06, 0.05, 0.22, CHROME, x + s * 0.03, 2.55, 0.15);
    box(0.06, 0.05, 0.22, CHROME, x + s * 0.03, 2.55, 0.75);
    // mirrors
    box(0.22, 0.04, 0.04, DARK, s * (hw + 0.12), 2.9, front - 0.1);
    box(0.08, 0.3, 0.2, DARK, s * (hw + 0.26), 2.9, front - 0.1);
    box(0.02, 0.24, 0.14, GLASS2, s * (hw + 0.3), 2.9, front - 0.1);
    // flame decals on doors
    const f = (dy: number, dz: number, w: number, h: number, c: string) =>
      box(0.03, h, w, c, x + s * 0.015, 2.1 + dy, dz);
    f(0.0, 0.2, 0.9, 0.22, FLAME3);
    f(0.1, 0.45, 0.6, 0.16, FLAME1);
    f(0.2, 0.7, 0.3, 0.12, FLAME1);
    f(0.2, 0.1, 0.25, 0.1, FLAME2);
    f(0.1, 0.4, 0.3, 0.08, FLAME2);
    f(0.3, 0.85, 0.12, 0.08, FLAME2);
  }

  // roof: roll bar light bar
  for (const s of [1, -1]) {
    box(0.08, 0.2, 0.08, DARK, s * 0.9, roofY + 0.1, 0.9);
  }
  box(2.0, 0.1, 0.1, DARK, 0, roofY + 0.22, 0.9);
  box(1.9, 0.16, 0.12, CHROME, 0, roofY + 0.34, 0.92);
  for (let i = 0; i < 6; i++) box(0.24, 0.12, 0.06, LIGHT, -0.8 + i * 0.32, roofY + 0.34, 0.99);

  // roof lights (marker row)
  for (let i = 0; i < 5; i++) box(0.16, 0.06, 0.1, i % 2 ? FLAME1 : FLAME2, -0.64 + i * 0.32, roofY + 0.03, 0.2);

  // front flame decal across lower hood-side of cab front
  box(2.0, 0.08, 0.03, FLAME3, 0, 2.2, front + 0.02);
  for (let i = 0; i < 8; i++) {
    box(0.16, 0.14 + (i % 3) * 0.06, 0.03, FLAME1, -0.84 + i * 0.24, 2.3 + (i % 3) * 0.03, front + 0.025);
    box(0.08, 0.08, 0.03, FLAME2, -0.84 + i * 0.24, 2.3 + (i % 3) * 0.02, front + 0.04);
  }
}
```

<!-- call: rearEnd -->

The base source came through as the literal placeholder `{ base; }`, so I never saw its real dimensions. I used only the attachment facts you gave: the rear face of the bed block is at z = -2.0..-2.5, the part's box is x ±1.25, y 0.9–2.6, z -2.9 to -1, and the rear face sits near z = -2.5. I could not check any of this against the actual base code. I also did not look up the `body` joint, so every part is placed with `bone: "body"` and an explicit `at`.

The part is built in a pixel-art style from boxes and cylinders in flat colours, all inside the box:
- **Bed:** a raised rim around the top of the bed block, with a floor, tailgate panel, hinges and handle.
- **Rear bumper:** a bar with end caps and a recessed centre plate.
- **Tail lights:** red lenses with amber and white lamps and dark housings.
- **Exhaust stacks:** two vertical pipes with caps and clamps, angled slightly.
- **Spare parts:** a spare wheel on the bed, a jerrycan and a toolbox.
- **Shocks:** two rear shocks with springs.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildRearEnd(b: Builder) {
  const bone = "body";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, seg = 8, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at: [x, y, z], rotation: rot });

  const RED = "#d62828", DRED = "#7a1212", AMB = "#ffb703", WHITE = "#f4f1de";
  const STEEL = "#8d99ae", DARK = "#2b2d42", CHROME = "#cfd8dc", PAINT = "#e76f00", PAINT2 = "#b85600";
  const BLACK = "#14141c", GREEN = "#3a7d2c", OLIVE = "#55612a";

  // Bed floor rim (top of bed block at about y=1.9)
  const topY = 1.95;
  box(2.3, 0.05, 1.0, DARK, 0, topY + 0.02, -1.5);
  // rim walls
  box(0.12, 0.35, 1.2, PAINT, 1.15, topY + 0.2, -1.55);
  box(0.12, 0.35, 1.2, PAINT, -1.15, topY + 0.2, -1.55);
  box(0.14, 0.04, 1.2, PAINT2, 1.15, topY + 0.4, -1.55);
  box(0.14, 0.04, 1.2, PAINT2, -1.15, topY + 0.4, -1.55);

  // Tailgate on rear face
  box(2.3, 0.8, 0.1, PAINT, 0, 1.55, -2.55);
  box(2.0, 0.5, 0.04, PAINT2, 0, 1.55, -2.62);
  box(0.7, 0.12, 0.05, DARK, 0, 1.75, -2.65);
  box(0.5, 0.05, 0.06, CHROME, 0, 1.75, -2.68);
  for (const s of [1, -1]) {
    box(0.16, 0.14, 0.1, STEEL, s * 1.0, 1.3, -2.62);
    box(0.16, 0.14, 0.1, STEEL, s * 1.0, 1.85, -2.62);
  }

  // Rear bumper
  box(2.4, 0.22, 0.2, STEEL, 0, 1.0, -2.75);
  box(0.9, 0.14, 0.06, DARK, 0, 1.0, -2.88);
  for (const s of [1, -1]) {
    box(0.2, 0.3, 0.24, DARK, s * 1.2, 1.02, -2.72);
    box(0.12, 0.05, 0.04, CHROME, s * 0.6, 1.1, -2.87);
  }

  // Tail lights
  for (const s of [1, -1]) {
    box(0.4, 0.3, 0.06, DARK, s * 0.9, 1.4, -2.62);
    box(0.32, 0.22, 0.05, RED, s * 0.9, 1.4, -2.66);
    box(0.32, 0.07, 0.05, DRED, s * 0.9, 1.3, -2.67);
    box(0.14, 0.1, 0.05, AMB, s * 0.98, 1.47, -2.69);
    box(0.14, 0.1, 0.05, WHITE, s * 0.82, 1.47, -2.69);
  }

  // Exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.09, 1.1, CHROME, s * 0.95, 2.05, -2.25, 8);
    cyl(0.11, 0.1, DARK, s * 0.95, 2.62 - 0.05, -2.25, 8);
    cyl(0.12, 0.08, STEEL, s * 0.95, 1.7, -2.25, 8);
    cyl(0.12, 0.08, STEEL, s * 0.95, 2.2, -2.25, 8);
    box(0.2, 0.1, 0.16, DARK, s * 0.95, 1.5, -2.35);
  }

  // Shocks with springs
  for (const s of [1, -1]) {
    cyl(0.05, 0.7, BLACK, s * 0.5, 1.4, -2.3, 6);
    cyl(0.08, 0.35, AMB, s * 0.5, 1.45, -2.3, 6);
    cyl(0.1, 0.06, STEEL, s * 0.5, 1.7, -2.3, 6);
    cyl(0.1, 0.06, STEEL, s * 0.5, 1.1, -2.3, 6);
  }

  // Spare wheel on bed (upright, facing back)
  cyl(0.42, 0.28, BLACK, -0.55, 2.4, -1.5, 10, [90, 0, 0]);
  cyl(0.22, 0.3, STEEL, -0.55, 2.4, -1.5, 8, [90, 0, 0]);
  cyl(0.07, 0.32, DARK, -0.55, 2.4, -1.5, 6, [90, 0, 0]);
  box(0.2, 0.2, 0.1, DARK, -0.55, 2.05, -1.5);

  // Jerrycan
  box(0.36, 0.5, 0.2, GREEN, 0.5, 2.25, -1.35);
  box(0.12, 0.08, 0.1, DARK, 0.58, 2.54, -1.35);
  box(0.2, 0.06, 0.04, OLIVE, 0.5, 2.3, -1.24);

  // Toolbox
  box(0.7, 0.25, 0.35, RED, 0.35, 2.1, -1.95);
  box(0.72, 0.05, 0.37, DRED, 0.35, 2.25, -1.95);
  box(0.18, 0.05, 0.04, CHROME, 0.35, 2.15, -2.14);
}
```
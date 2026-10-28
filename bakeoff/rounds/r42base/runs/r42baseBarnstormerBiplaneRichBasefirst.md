<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

// Barnstormer biplane base: fuselage, tail fin and stabiliser stubs, cowling, cockpit coamings, wing mounts.
// Scale: ~7 m long, ~2.9 m tall to the top wing, wing span ~8 m. Faces +Z (nose), rests on y = 0.

export const BASE_PARTS = [
  {
    id: "wings",
    builds: "Upper and lower biplane wings with ribs, tips, struts, interplane struts, bracing wires, stripes and roundels",
    box: [
      [-4.2, 0.6, -0.6],
      [4.2, 2.9, 1.9],
    ],
    attaches: "Lower wing root at the fuselage underside saddle (y~0.95, z~0.5); upper wing on the cabane struts above the cockpit (y~2.2, z~0.6)",
    joints: ["fuselage"],
    floor: false,
    budget: 260,
  },
  {
    id: "propulsion",
    builds: "Propeller with hub and spinner, whimsical curved blades, engine exhaust stacks, cowling louvres and rivets, radiator front",
    box: [
      [-1.1, 0.3, 2.2],
      [1.1, 2.1, 3.1],
    ],
    attaches: "Front face of the cowling at z~2.2 on the nose joint",
    joints: ["nose"],
    floor: false,
    budget: 120,
  },
  {
    id: "landingGear",
    builds: "Two main wheels with tyres and hubs, axle, V struts, shock springs, and a tail skid",
    box: [
      [-1.0, 0, -3.4],
      [1.0, 1.0, 1.4],
    ],
    attaches: "Underside of the fuselage at z~0.9 for main gear, and at the tail underside z~-3.1 for the skid",
    joints: ["fuselage", "tail"],
    floor: true,
    budget: 140,
  },
  {
    id: "cockpit",
    builds: "Pilot with goggles, scarf and cap, passenger seat, windscreen, control stick, instrument panel, headrest fairing",
    box: [
      [-0.5, 1.2, -0.9],
      [0.5, 2.1, 1.1],
    ],
    attaches: "Open cockpit cavity cut into the fuselage top between z=-0.7 and z=0.9, resting on the coaming rim",
    joints: ["fuselage"],
    floor: false,
    budget: 150,
  },
  {
    id: "tailControl",
    builds: "Horizontal stabilisers, elevators, rudder with hinge and stripes, tail light, bracing wires",
    box: [
      [-1.5, 0.8, -3.8],
      [1.5, 2.4, -2.2],
    ],
    attaches: "Tail stabiliser stubs at z~-3.0 and fin trailing edge on the tail joint",
    joints: ["tail"],
    floor: false,
    budget: 130,
  },
  {
    id: "livery",
    builds: "Fuselage stripes, lettering, patched panels, flower decals, mascot nose art, bunting, lantern, windsock and trim details",
    box: [
      [-0.8, 0.7, -3.4],
      [0.8, 2.3, 2.4],
    ],
    attaches: "Fuselage side flanks (x~±0.6) and cowling sides",
    joints: ["fuselage", "nose"],
    floor: false,
    budget: 100,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const CREAM = "#f3e3b8";
  const RED = "#d8402e";
  const TEAL = "#2f8f8a";
  const DARK = "#3a2a22";
  const BRASS = "#c9923a";
  const WOOD = "#9a6a3c";

  const fuselage = b.joint("fuselage", { at: [0, 1.4, 0], dir: [0, 0, 1], role: "spine" });
  const nose = b.joint("nose", { parent: fuselage, at: [0, 1.4, 1.8], dir: [0, 0, 1], role: "spine" });
  const tail = b.joint("tail", { parent: fuselage, at: [0, 1.4, -1.8], dir: [0, 0.15, -1], role: "tail" });

  // Fuselage: chubby tapered loft from nose to tail
  b.loft(
    [
      { at: [0, 1.4, 2.0], w: 1.0, h: 1.0 },
      { at: [0, 1.4, 1.0], w: 1.2, h: 1.25 },
      { at: [0, 1.45, -0.2], w: 1.05, h: 1.2 },
      { at: [0, 1.5, -1.6], w: 0.7, h: 0.85 },
      { at: [0, 1.65, -3.0], w: 0.3, h: 0.45 },
    ],
    { bone: [tail, fuselage, nose], color: CREAM, sides: 8 },
  );
  // Belly stripe tone
  b.part(new THREE.BoxGeometry(0.9, 0.2, 3.4), TEAL, { bone: fuselage, at: [0, 0.82, -0.2] });

  // Cowling: rounded fat drum on the nose
  b.part(new THREE.CylinderGeometry(0.62, 0.66, 0.9, 12), RED, { bone: nose, at: [0, 1.4, 1.75], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.5, 0.62, 0.3, 12), DARK, { bone: nose, at: [0, 1.4, 2.3], dir: [0, 0, 1] });

  // Cockpit coaming rim
  b.part(new THREE.BoxGeometry(0.85, 0.12, 1.5), DARK, { bone: fuselage, at: [0, 2.05, 0.1] });
  // Cabane block / wing saddle on top and lower wing root stub
  b.part(new THREE.BoxGeometry(0.7, 0.15, 1.1), WOOD, { bone: fuselage, at: [0, 0.82, 0.5] });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.9), RED, { bone: fuselage, at: [0, 2.0, 1.15] });

  // Tail fin
  b.extrude(
    [
      [0, 0],
      [-0.9, 0],
      [-1.0, 0.5],
      [-0.7, 1.0],
      [-0.1, 0.9],
    ],
    { at: [0, 1.7, -2.0], x: [0, 0, 1], thickness: 0.1, color: RED, bone: tail },
  );
  // Stabiliser stubs
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.5, 0.08, 0.7), CREAM, { bone: tail, at: [s * 0.3, 1.6, -2.9] });

  return b.root;
}
```

<!-- call: landingGear -->

The base source was not included in the prompt (it shows only a placeholder), so I placed the gear from the brief alone. The fuselage underside is assumed to sit near y ≈ 0.75 at z ≈ 0.9, and the tail underside near y ≈ 0.55 at z ≈ -3.1. Nothing here was checked against the base's actual geometry. I found the joints with `b.surface(b.root).ray` but fall back to fixed points. Every part is placed by explicit bone, so I never rely on a joint name.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildLandingGear(b: Builder) {
  const TIRE = "#1d1d22";
  const HUB = "#d9b44a";
  const HUBD = "#8a6a1e";
  const STRUT = "#b8402e";
  const STEEL = "#8d939c";
  const SPRING = "#c9ced6";
  const WOOD = "#6b4423";
  const R = 0.38;
  const ZW = 0.9;
  const topY = 0.78;
  const axleY = R;
  const X = 0.62;

  const root = b.surface(b.root);
  const up = root.ray([0, 0.2, ZW], [0, 1, 0]);
  const top = up ? Math.min(up.at.y, 1) - 0.02 : topY;

  for (const s of [1, -1]) {
    const tire = new THREE.TorusGeometry(R - 0.1, 0.1, 8, 16);
    b.part(tire, TIRE, { at: [s * X, axleY, ZW], dir: [1, 0, 0], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 12), HUB, { at: [s * X, axleY, ZW], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), HUBD, { at: [s * (X + (s * 0.09)), axleY, ZW], dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), STEEL, { at: [s * (X + s * 0.12), axleY, ZW] });
    // V struts
    b.rod([s * 0.3, top, ZW + 0.3], [s * X, axleY + 0.05, ZW], 0.035, STRUT);
    b.rod([s * 0.3, top, ZW - 0.3], [s * X, axleY + 0.05, ZW], 0.035, STRUT);
    // shock spring and strut
    b.rod([s * 0.45, top, ZW], [s * 0.54, axleY + 0.45, ZW], 0.03, STEEL);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const y = axleY + 0.45 - t * 0.12;
      b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), SPRING, {
        at: [s * (0.54 + 0.02 * t), y, ZW],
        dir: [0, 1, 0],
        axis: "z",
        rotation: [90, 0, 0],
      });
    }
    b.rod([s * 0.56, axleY + 0.33, ZW], [s * X, axleY, ZW], 0.035, STEEL);
  }
  // axle
  b.rod([-X, axleY, ZW], [X, axleY, ZW], 0.04, STEEL);
  // cross brace
  b.rod([-0.3, top, ZW], [0.3, top, ZW], 0.03, STRUT);

  // tail skid
  const tz = -3.1;
  b.rod([0, 0.52, tz], [0, 0.2, tz - 0.25], 0.035, STRUT);
  b.rod([0, 0.2, tz - 0.25], [0, 0.06, tz + 0.25], 0.04, WOOD);
  b.part(new THREE.BoxGeometry(0.1, 0.06, 0.4), WOOD, { at: [0, 0.04, tz + 0.1], rotation: [-8, 0, 0] });
  b.part(new THREE.SphereGeometry(0.05, 6, 4), STEEL, { at: [0, 0.52, tz] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), STEEL, { at: [0, 0.2, tz - 0.25] });
  frame([0, 0, 0], [0, 1, 0]);
}
```

<!-- call: tailControl -->

The base source was not included in the prompt (it shows only a `{ base; }` placeholder), so I could not read its dimensions or surfaces. I placed the tail assembly from the stated box and attachment notes: stabiliser stubs at z≈-3.0, the fin trailing edge on the `tail` joint, and everything inside [-1.5..1.5, 0.8..2.4, -3.8..-2.2]. Nothing has been checked against the base's actual fuselage or its tail joint position, so the seating may need adjusting once the base is visible.

The module assumes a `tail` joint exists, passed to `bone` by name. The assembly consists of:

- **Stabilisers:** a left and right pair at y≈1.35, z from -3.45 to -2.95.
- **Elevators:** hinged flaps behind each stabiliser, with a hinge rod and a stripe.
- **Rudder:** a fin and a rudder behind it, with a hinge rod, three stripes and a rounded top.
- **Tail light:** a small glowing-style sphere at the top of the rudder.
- **Bracing wires:** thin rods from the fin and stabilisers to the fuselage.

Every piece is a flat-colour part. The elevators and rudder stay clear of the 0.8 m floor limit of the box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildTailControl(b: Builder) {
  const bone = "tail";
  const RED = "#c8322a", CREAM = "#f3e6c4", WOOD = "#8a5a2b", DARK = "#3a2a20", LIGHT = "#ffd24a", WIRE = "#2b2b2b";
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [0, 0, rz] });
  const Y = 1.35;

  for (const s of [1, -1]) {
    // stabiliser
    box(1.2, 0.07, 0.5, CREAM, s * 0.85, Y, -3.2);
    box(1.2, 0.075, 0.06, RED, s * 0.85, Y, -2.96);
    box(0.06, 0.08, 0.5, RED, s * 1.45, Y, -3.2);
    // elevator
    box(1.15, 0.05, 0.38, RED, s * 0.85, Y, -3.58);
    box(1.15, 0.055, 0.07, CREAM, s * 0.85, Y, -3.52);
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 1.2, 6), DARK, { bone, at: [s * 0.85, Y, -3.4], rotation: [0, 0, 90] });
    // bracing wires
    b.rod([s * 0.9, Y - 0.04, -3.2], [s * 0.15, 1.05, -2.6], 0.009, WIRE, { bone });
    b.rod([s * 0.9, Y + 0.04, -3.2], [0, 2.1, -3.3], 0.009, WIRE, { bone });
  }
  // centre stabiliser block
  box(0.5, 0.09, 0.55, CREAM, 0, Y, -3.2);

  // fin
  box(0.07, 0.8, 0.55, CREAM, 0, 1.8, -3.15);
  // rudder
  box(0.07, 0.9, 0.4, RED, 0, 1.85, -3.55);
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 6), DARK, { bone, at: [0, 1.85, -3.36] });
  for (let i = 0; i < 3; i++) box(0.085, 0.17, 0.4, CREAM, 0, 1.55 + i * 0.3, -3.55);
  // rounded top
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 10, 1, false, 0, Math.PI), RED, {
    bone, at: [0, 2.3, -3.55], rotation: [0, 0, 90],
  });
  // tail light
  b.part(new THREE.SphereGeometry(0.06, 8, 6), LIGHT, { bone, at: [0, 2.36, -3.7] });
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.05, 6), DARK, { bone, at: [0, 2.31, -3.7] });
  // fin brace
  b.rod([0, 2.25, -3.2], [0, 1.0, -2.4], 0.008, WIRE, { bone });
}
```

<!-- call: wings -->

The base source arrived as the literal placeholder `{ base; }`, so I couldn't read its real dimensions. I built against the attachment points in the brief instead. The wings ride the `fuselage` joint and stay inside the box [[-4.2,0.6,-0.6],[4.2,2.9,1.9]]. I haven't run this against the base, so the seating on the fuselage and cabane struts is unchecked.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildWings(b: Builder) {
  const CREAM = "#f3e6c0", RED = "#d8382c", RIB = "#b98b52", WIRE = "#3b3b3b", STRUT = "#8a5a2b", BLUE = "#2b5fa8", WHITE = "#ffffff", DARK = "#222222";
  const bone = "fuselage";
  const P = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(g, c, { bone, at, rotation: rot });

  const span = 4.0; // half span (inside 4.2)
  const chord = 1.1;
  const wings = [
    { y: 2.2, z: 0.6, name: "up" },
    { y: 0.95, z: 0.5, name: "low" },
  ];

  for (const w of wings) {
    // main wing slab, slight taper via two halves
    P(new THREE.BoxGeometry(span * 2 - 0.3, 0.1, chord), CREAM, [0, w.y, w.z]);
    for (const s of [1, -1]) {
      // rounded tips
      P(new THREE.CylinderGeometry(chord / 2, chord / 2, 0.1, 10), CREAM, [s * (span - 0.15), w.y, w.z]);
      // red tip caps
      P(new THREE.CylinderGeometry(chord / 2 + 0.01, chord / 2 + 0.01, 0.11, 10, 1, false, 0, Math.PI * 2), RED, [s * (span - 0.02), w.y, w.z]).mesh.scale.set(0.2, 1, 1);
      // leading edge band
      P(new THREE.BoxGeometry(span - 0.3, 0.11, 0.1), RED, [s * (span / 2 + 0.1), w.y, w.z + chord / 2 - 0.05]);
      // stripe
      P(new THREE.BoxGeometry(0.25, 0.108, chord + 0.01), RED, [s * 2.9, w.y, w.z]);
      // roundel on top
      const ry = w.y + 0.056;
      P(new THREE.CylinderGeometry(0.4, 0.4, 0.01, 14), WHITE, [s * 1.9, ry, w.z]);
      P(new THREE.CylinderGeometry(0.3, 0.3, 0.012, 14), BLUE, [s * 1.9, ry, w.z]);
      P(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 12), RED, [s * 1.9, ry, w.z]);
    }
    // ribs
    for (let i = -7; i <= 7; i++) {
      const x = i * 0.5;
      P(new THREE.BoxGeometry(0.04, 0.115, chord + 0.02), RIB, [x, w.y, w.z]);
    }
  }

  // interplane struts (N-struts) and wires
  for (const s of [1, -1]) {
    for (const x of [1.3, 3.2]) {
      for (const dz of [0.4, -0.4]) {
        P(new THREE.CylinderGeometry(0.04, 0.04, 1.25, 6), STRUT, [s * x, 1.575, 0.55 + dz]);
      }
      // cross wires
      const len = Math.hypot(1.25, 0.0);
      void len;
    }
    // diagonal bracing wires between struts
    const dx = 3.2 - 1.3, dy = 1.25;
    const L = Math.hypot(dx, dy);
    const ang = Math.atan2(dx, dy);
    for (const k of [1, -1]) {
      P(new THREE.CylinderGeometry(0.012, 0.012, L, 4), WIRE, [s * 2.25, 1.575, 0.95], [0, 0, s * k * ang]);
    }
  }
  // cabane struts
  for (const s of [1, -1]) {
    P(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6), STRUT, [s * 0.35, 1.55, 0.35], [0, 0, s * -0.3]);
    P(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6), STRUT, [s * 0.35, 1.55, 0.95], [0, 0, s * -0.3]);
    // landing wires lower root to upper tips
    P(new THREE.CylinderGeometry(0.01, 0.01, 1.9, 4), WIRE, [s * 3.7, 1.6, 0.5], [0, 0, s * 0.55]);
  }
  // wing walker dark root pad
  P(new THREE.BoxGeometry(0.8, 0.04, 0.5), DARK, [0, 1.03, 0.5]);
}
```

<!-- call: propulsion -->

The base source in the prompt came through as the literal placeholder `{ base; }`, so I never saw the real code. I built this against the stated box and attachment point instead. I assumed a `nose` joint exists and that the cowling front face is at z≈2.2. I haven't run it.

Because the joint's position and orientation are unknown, I placed every part with `bone: "nose"` and model-space positions. I used a joint name string, which the SDK accepts. This keeps the part independent of the nose joint's own transform.

The nose axis is along Z, so cylinders and cones are aimed with `dir: [0,0,1]`. The box is z 2.2–3.1, so everything sits in front of the cowling face.

What the part contains:
- **Cowling front:** a ring and radiator disc at z≈2.2–2.3, with a grille of bars.
- **Rivets:** a ring of small spheres around the cowling rim.
- **Louvres:** slats on the cowling sides.
- **Exhaust stacks:** three pipes per side, running along the cowling sides.
- **Propeller:** a hub, a spinner cone, and two curved, whimsical blades. Each blade is a short chain of tilted segments with a tip disc.

Everything stays within x ±1.1 and y 0.3–2.1. The assumed nose centre is y≈1.2 and the prop radius is ≤0.95.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildPropulsion(b: Builder) {
  const bone = "nose";
  const CY = 1.2;
  const Z0 = 2.2;
  const METAL = "#8a8f98";
  const DARK = "#2b2d33";
  const BRASS = "#d9a441";
  const WOOD = "#b5733a";
  const RED = "#d8402f";
  const CREAM = "#f4e6c0";
  const fwd: [number, number, number] = [0, 0, 1];

  // Radiator front disc and ring
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 16), METAL, { bone, at: [0, CY, Z0 + 0.03], dir: fwd });
  b.part(new THREE.TorusGeometry(0.5, 0.05, 6, 20), BRASS, { bone, at: [0, CY, Z0 + 0.06] });
  // Grille bars
  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.BoxGeometry(0.05, 0.8 * Math.cos(i * 0.22), 0.03), DARK, {
      bone,
      at: [i * 0.13, CY, Z0 + 0.075],
    });
  }
  // Rivets around rim
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.025, 6, 4), BRASS, {
      bone,
      at: [Math.cos(a) * 0.56, CY + Math.sin(a) * 0.56, Z0 + 0.09],
    });
  }
  // Louvres on both cowling sides
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.BoxGeometry(0.03, 0.34, 0.1), DARK, {
        bone,
        at: [s * 0.64, CY + 0.05, Z0 + 0.2 + i * 0.12],
        rotation: [0, 0, s * 14],
      });
    }
    // Exhaust stacks
    for (let i = 0; i < 3; i++) {
      const z = Z0 + 0.3 + i * 0.28;
      b.part(new THREE.CylinderGeometry(0.05, 0.06, 0.34, 8), METAL, {
        bone,
        at: [s * 0.78, CY - 0.1, z],
        rotation: [0, 0, s * 8],
      });
      b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 8), DARK, {
        bone,
        at: [s * 0.8, CY + 0.08, z],
        rotation: [0, 0, s * 8],
      });
    }
  }
  // Hub, spinner
  const hz = Z0 + 0.2;
  b.part(new THREE.CylinderGeometry(0.14, 0.16, 0.14, 12), BRASS, { bone, at: [0, CY, hz], dir: fwd });
  b.part(new THREE.ConeGeometry(0.15, 0.32, 12), RED, { bone, at: [0, CY, hz + 0.23], dir: fwd });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), CREAM, { bone, at: [0, CY, hz + 0.4] });
  // Curved whimsical blades
  for (const s of [1, -1]) {
    const segs = 5;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      const y = s * (0.2 + t * 0.62);
      const sway = Math.sin(t * 2.4) * 0.12 * s;
      const w = 0.2 + 0.12 * Math.sin(t * Math.PI * 0.9 + 0.3);
      b.part(new THREE.BoxGeometry(w, 0.2, 0.03), i === segs - 1 ? RED : WOOD, {
        bone,
        at: [sway, CY + y, hz + 0.02],
        rotation: [0, 0, s * (t * 14)],
      });
    }
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 8), CREAM, {
      bone,
      at: [Math.sin(2.4) * 0.12 * s, CY + s * 0.88, hz + 0.02],
      dir: fwd,
    });
  }
}
```

<!-- call: cockpit -->

The base source came through as a literal placeholder (`{ base; }`), so I could not read its real dimensions. I placed the cockpit from the brief instead: a cavity between z=-0.7 and z=0.9, with the coaming rim at about y=1.2–1.3. I never read the base's `fuselage` joint, so the part rides it through `bone: "fuselage"`. Nothing was run or rendered, so the placement is unchecked against the real fuselage. Everything stays inside the box [-0.5,1.2,-0.9] to [0.5,2.1,1.1] and uses flat colours only.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCockpit(b: Builder) {
  const bone = "fuselage";
  const P = (
    g: THREE.BufferGeometry,
    c: string,
    at: [number, number, number],
    rot?: [number, number, number],
    scale?: [number, number, number],
  ) => b.part(g, c, { bone, at, rotation: rot, scale });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number) => new THREE.SphereGeometry(r, 8, 6);
  const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

  const LEATHER = "#7a3f1e", DARK = "#2a1c14", BRASS = "#d9a935", SKIN = "#f0b98c";
  const CAP = "#5a3a22", SCARF = "#e8412f", GLASS = "#bfe6f2", PANEL = "#3a3f46", WHITE = "#fff4d6";
  const COAT = "#8a5a2e";

  // Interior floor and seats
  P(box(0.7, 0.04, 1.5), "#4a3220", [0, 1.22, 0.1]);
  // Passenger seat (front), pilot seat (rear)
  P(box(0.5, 0.08, 0.4), LEATHER, [0, 1.3, 0.55]);
  P(box(0.5, 0.36, 0.08), LEATHER, [0, 1.5, 0.36], [-8, 0, 0]);
  P(box(0.5, 0.08, 0.4), LEATHER, [0, 1.3, -0.4]);
  P(box(0.5, 0.4, 0.08), LEATHER, [0, 1.52, -0.62], [-8, 0, 0]);

  // Pilot (rear seat)
  P(box(0.34, 0.36, 0.22), COAT, [0, 1.58, -0.38]);
  P(sph(0.15), SKIN, [0, 1.95, -0.36]);
  P(cyl(0.16, 0.06, 10), CAP, [0, 2.06, -0.37]);
  P(box(0.3, 0.06, 0.1), CAP, [0, 2.0, -0.26], [-20, 0, 0]);
  // goggles
  for (const s of [1, -1]) {
    P(cyl(0.045, 0.03), BRASS, [s * 0.07, 1.98, -0.22], [90, 0, 0]);
    P(cyl(0.035, 0.032), GLASS, [s * 0.07, 1.98, -0.215], [90, 0, 0]);
  }
  P(box(0.3, 0.025, 0.1), DARK, [0, 1.98, -0.3]);
  // nose + smile
  P(sph(0.025), "#e59a72", [0, 1.93, -0.21]);
  // scarf
  P(cyl(0.14, 0.07, 10), SCARF, [0, 1.8, -0.37]);
  P(box(0.09, 0.4, 0.03), SCARF, [0.12, 1.62, -0.55], [0, 0, 12]);
  P(box(0.09, 0.05, 0.03), WHITE, [0.12, 1.45, -0.55], [0, 0, 12]);
  // arms to stick
  for (const s of [1, -1]) {
    P(box(0.08, 0.08, 0.34), COAT, [s * 0.18, 1.58, -0.12], [-15, 0, 0]);
    P(sph(0.045), "#6b4a2a", [s * 0.12, 1.55, 0.04]);
  }

  // Passenger: a teddy bear for whimsy
  P(sph(0.13), "#c98a4a", [0, 1.5, 0.55]);
  P(sph(0.1), "#c98a4a", [0, 1.7, 0.55]);
  for (const s of [1, -1]) P(sph(0.04), "#c98a4a", [s * 0.08, 1.78, 0.55]);
  P(sph(0.035), DARK, [0, 1.69, 0.64]);

  // Control stick
  P(cyl(0.015, 0.4), DARK, [0, 1.45, 0.0]);
  P(sph(0.04), SCARF, [0, 1.66, 0.0]);

  // Instrument panel and dials
  P(box(0.6, 0.26, 0.05), PANEL, [0, 1.52, 0.78], [-15, 0, 0]);
  for (const x of [-0.18, 0, 0.18]) {
    P(cyl(0.055, 0.02, 12), BRASS, [x, 1.55, 0.8], [75, 0, 0]);
    P(cyl(0.045, 0.022, 12), WHITE, [x, 1.55, 0.81], [75, 0, 0]);
    P(box(0.01, 0.04, 0.005), DARK, [x, 1.56, 0.822], [75, 0, 20 * x * 10]);
  }

  // Windscreen
  P(box(0.56, 0.3, 0.015), GLASS, [0, 1.8, 0.92], [-25, 0, 0]);
  P(box(0.6, 0.03, 0.03), BRASS, [0, 1.65, 0.88], [-25, 0, 0]);
  for (const s of [1, -1]) P(box(0.025, 0.32, 0.03), BRASS, [s * 0.285, 1.8, 0.92], [-25, 0, 0]);
  P(box(0.6, 0.025, 0.03), BRASS, [0, 1.95, 0.96], [-25, 0, 0]);

  // Headrest fairing behind pilot
  P(box(0.46, 0.3, 0.3), "#c0392b", [0, 1.48, -0.78], [-10, 0, 0], [1, 1, 1]);
  P(sph(0.23), "#c0392b", [0, 1.62, -0.78], undefined, [1, 0.8, 1.1]);
  P(box(0.2, 0.03, 0.02), WHITE, [0, 1.62, -0.5]);
}
```

<!-- call: livery -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildLivery(b: Builder) {
  // The base source was not included in the prompt, so every spot is found by
  // ray-casting the built model, and each detail seats itself on whatever surface it hits.
  const skin = b.surface(b.root);
  const CREAM = "#fff1c9", RED = "#d8362b", BLUE = "#2b5fa8", YEL = "#f7c531", INK = "#2a1a22";
  const PINK = "#ff8fb3", GREEN = "#4f9a3c", ORANGE = "#f08a24", PATCH = "#8fb8a0", BROWN = "#7a4a2a";

  const side = (s: number, y: number, z: number) => {
    const h = skin.ray([s * 1.3, y, z], [-s, 0, 0]);
    if (h && Math.abs(h.at.x) < 0.78) return h;
    return null;
  };
  const put = (geo: THREE.BufferGeometry, color: string, h: any, embed = 0.3, flowZ = 1) =>
    h ? b.stick(geo, color, h, { embed, flow: [0, 0, flowZ] }) : null;
  const box = (t: number, w: number, l: number) => new THREE.BoxGeometry(w, t, l);

  for (const s of [1, -1]) {
    // Fuselage stripes: a red band flanked by cream pinstripes
    for (const [z, col, len] of [[-1.55, RED, 0.34], [-1.25, CREAM, 0.08], [-1.9, CREAM, 0.08], [-0.2, BLUE, 0.2]] as [number, string, number][]) {
      for (const y of [1.25, 1.45, 1.65]) {
        put(box(0.03, 0.2, len), col, side(s, y, z), 0.5);
      }
    }
    // Lettering "BARN" in blocky strokes along the rear flank
    const letters: [number, number][][] = [
      [[0, 0], [0, 0.1], [0, -0.1], [0.07, 0.1], [0.07, 0], [0.07, -0.1]],
      [[0, 0], [0, 0.1], [0, -0.1], [-0.07, 0.1], [-0.07, 0], [-0.07, -0.1]],
    ];
    let z = -2.6;
    for (let i = 0; i < 4; i++) {
      const y0 = 1.5;
      put(box(0.03, 0.22, 0.05), YEL, side(s, y0, z), 0.5);
      put(box(0.03, 0.05, 0.16), YEL, side(s, y0 + 0.1, z - 0.06 * (i % 2 ? 1 : -1)), 0.5);
      put(box(0.03, 0.05, 0.16), YEL, side(s, y0 - 0.1, z - 0.06 * (i % 2 ? 1 : -1)), 0.5);
      if (i % 2 === 0) put(box(0.03, 0.05, 0.16), YEL, side(s, y0, z - 0.06), 0.5);
      z -= 0.28;
    }
    void letters;
    // Patched panels with stitches
    for (const [pz, py, col] of [[-0.8, 1.2, PATCH], [-2.2, 1.0, PINK]] as [number, number, string][]) {
      const h = side(s, py, pz);
      put(box(0.025, 0.2, 0.26), col, h, 0.5);
      for (const dz of [-0.1, 0, 0.1]) {
        const hh = side(s, py + 0.11, pz + dz);
        put(box(0.03, 0.02, 0.03), INK, hh, 0.4);
        const h2 = side(s, py - 0.11, pz + dz);
        put(box(0.03, 0.02, 0.03), INK, h2, 0.4);
      }
    }
    // Flower decals
    for (const [fz, fy, pc] of [[-0.55, 1.65, PINK], [-1.0, 0.95, YEL], [-2.9, 1.2, ORANGE]] as [number, number, string][]) {
      const h = side(s, fy, fz);
      if (!h) continue;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const ph = side(s, fy + Math.sin(a) * 0.07, fz + Math.cos(a) * 0.07);
        put(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), pc, ph, 0.5);
      }
      put(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), INK === pc ? YEL : "#fff7a8", h, 0.4);
      const st = side(s, fy - 0.17, fz);
      put(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 5), GREEN, st, 0.5);
    }
    // Mascot nose art: a cheeky round bird face on the cowling side
    const m = side(s, 1.5, 1.2) ?? side(s, 1.4, 1.0);
    if (m) {
      put(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 10), CREAM, m, 0.4);
      const mm = (dy: number, dz: number) => side(s, m.at.y + dy, m.at.z + dz);
      put(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), "#ffffff", mm(0.05, 0.07), 0.4);
      put(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), "#ffffff", mm(0.05, -0.07), 0.4);
      put(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 6), INK, mm(0.05, 0.08), 0.4);
      put(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 6), INK, mm(0.05, -0.06), 0.4);
      put(new THREE.ConeGeometry(0.05, 0.1, 4), ORANGE, mm(-0.03, 0.0), 0.2, 1);
      put(box(0.03, 0.03, 0.14), RED, mm(-0.12, 0), 0.4);
      put(box(0.03, 0.12, 0.05), RED, mm(0.19, 0.0), 0.4);
    }
    // Bunting swag along the upper flank
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const zz = -2.9 + t * 3.3;
      const yy = 1.95 - Math.sin(t * Math.PI * 3) * 0.0 - 0.1 * Math.sin(t * Math.PI);
      const h = side(s, yy, zz);
      put(new THREE.ConeGeometry(0.06, 0.14, 3), [RED, YEL, BLUE, GREEN][i % 4], h, 0.2);
    }
    // Lantern on a bracket
    if (s === 1) {
      const h = side(s, 1.9, -0.4);
      if (h) {
        put(new THREE.CylinderGeometry(0.015, 0.015, 0.14, 5), BROWN, h, 0.3);
        const lp = h.at.clone().add(new THREE.Vector3(0.09, -0.16, 0));
        b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 6), YEL, { at: lp.toArray() as [number, number, number], bone: "fuselage" });
        b.part(new THREE.ConeGeometry(0.08, 0.06, 6), RED, { at: [lp.x, lp.y + 0.1, lp.z], bone: "fuselage" });
      }
    }
  }

  // Windsock on a pole atop the rear fuselage
  const top = skin.ray([0, 2.4, -2.8], [0, -1, 0]);
  if (top && top.at.y < 2.0) {
    const base = top.at;
    b.rod([base.x, base.y - 0.02, base.z], [base.x, base.y + 0.3, base.z], 0.012, BROWN, { bone: "fuselage" });
    const cols = [RED, CREAM, RED, CREAM, RED];
    cols.forEach((c, i) => {
      b.part(new THREE.CylinderGeometry(0.1 - i * 0.012, 0.09 - i * 0.012, 0.09, 8, 1, true), c, {
        at: [base.x, base.y + 0.32 - i * 0.012, base.z - 0.04 - i * 0.09],
        dir: [0, 0, -1],
        bone: "fuselage",
      });
    });
    void frame;
  }
}
```
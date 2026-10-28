<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "head",
    builds: "Head details: brow ridge, big nose, eyes, ears, mouth with separate jaw, helmet with rivets and horn trim",
    box: [
      [-0.2, 1.1, -0.18],
      [0.2, 1.5, 0.26],
    ],
    attaches: "Head sphere on top of the neck joint, atop the torso",
    joints: ["neck", "head"],
    floor: false,
    budget: 180,
  },
  {
    id: "beard",
    builds: "Braided beard: layered blades, two thick braids with ties and metal rings, moustache, tapered tips",
    box: [
      [-0.26, 0.55, 0.1],
      [0.26, 1.28, 0.42],
    ],
    attaches: "Front of the head sphere under the nose and over the chest front",
    joints: ["head", "chest"],
    floor: false,
    budget: 150,
  },
  {
    id: "arms",
    builds: "Both arms with pauldrons, bracers, gloves with fingers, shoulder straps",
    box: [
      [-0.62, 0.55, -0.25],
      [0.62, 1.2, 0.55],
    ],
    attaches: "Shoulder joints shoulderL/shoulderR at the sides of the chest",
    joints: ["shoulderL", "shoulderR"],
    floor: false,
    budget: 190,
  },
  {
    id: "blunderbuss",
    builds: "Blunderbuss: wood stock, flared brass muzzle, barrel bands, lock, trigger, sling, held across the front",
    box: [
      [-0.3, 0.6, 0.1],
      [0.5, 1.15, 0.95],
    ],
    attaches: "Held in front of the chest at the hands near the belly",
    joints: ["chest"],
    floor: false,
    budget: 150,
  },
  {
    id: "gear",
    builds: "Belt buckle, pouches, powder horn, boot straps and cuffs, knee pads, backpack with bedroll",
    box: [
      [-0.4, 0, -0.45],
      [0.4, 0.95, 0.3],
    ],
    attaches: "Belt around the waist, boots, and the back of the torso",
    joints: ["hips", "chest"],
    floor: false,
    budget: 230,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const SKIN = "#d9a07a";
  const CLOTH = "#3e5f8f";
  const LEATHER = "#5a3a22";
  const BOOT = "#3a2618";

  const hips = b.joint("hips", { at: [0, 0.62, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.8, 0], aim: [0, 1.1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.1, 0], aim: [0, 1.2, 0.02], role: "neck" });
  b.joint("head", { parent: neck, at: [0, 1.2, 0.02], aim: [0, 1.5, 0.03], role: "head" });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = b.joint("hip" + side, { parent: hips, at: [s * 0.13, 0.62, 0], aim: [s * 0.13, 0.32, 0], role: "leg" });
    b.joint("knee" + side, { parent: hip, at: [s * 0.13, 0.32, 0], aim: [s * 0.13, 0.12, 0.02], role: "leg" });
    b.part(new THREE.CylinderGeometry(0.1, 0.09, 0.34, 8), CLOTH, { bone: hip, at: [s * 0.13, 0.45, 0] });
    b.part(new THREE.CylinderGeometry(0.095, 0.08, 0.3, 8), BOOT, { bone: hip, at: [s * 0.13, 0.17, 0] });
    b.part(new THREE.BoxGeometry(0.17, 0.09, 0.3), BOOT, { bone: hip, at: [s * 0.13, 0.045, 0.06] });
    b.joint("shoulder" + side, { parent: chest, at: [s * 0.36, 1.0, 0], aim: [s * 0.5, 0.75, 0], role: "arm" });
  }

  // torso
  b.part(new THREE.BoxGeometry(0.42, 0.2, 0.3), LEATHER, { bone: hips, at: [0, 0.64, 0] });
  b.part(new THREE.CylinderGeometry(0.3, 0.26, 0.5, 8), CLOTH, { bone: chest, at: [0, 0.88, 0], scale: [1.1, 1, 0.85] });
  b.part(new THREE.BoxGeometry(0.66, 0.2, 0.36), CLOTH, { bone: chest, at: [0, 1.08, 0] });
  b.part(new THREE.CylinderGeometry(0.09, 0.1, 0.1, 8), SKIN, { bone: neck, at: [0, 1.15, 0] });
  // head
  b.part(new THREE.SphereGeometry(0.17, 10, 8), SKIN, { bone: "head", at: [0, 1.32, 0.03], scale: [1, 1.05, 1] });

  return b.root;
}
```

<!-- call: blunderbuss -->

The base source was not included in the prompt (it shows a literal `{ base; }` placeholder), so I could not read the real dimensions or the `chest` joint's position. I built against the box you gave and attached every part to `chest`. The gun is placed from the box, not from the base's surfaces, so check that the hands line up once the base is visible.

The blunderbuss lies diagonally across the chest, muzzle forward and to the model's left (+X), and stays inside [-0.3..0.5, 0.6..1.15, 0.1..0.95]. All parts are rigid on `chest` with flat colours.

- **Axis:** it runs from the butt at (-0.22, 0.72, 0.2) to the muzzle at (0.38, 1.02, 0.88).
- **Helper:** `along(t)` returns the point on that axis, and `rod` and `part` place everything from it.
- **Stock:** a tapered wood rod forms the butt and forearm, with a darker butt plate.
- **Barrel:** a steel rod, three brass bands, a flared brass muzzle (cone plus rim ring) and a dark bore.
- **Lock:** a lock plate, a hammer, a pan, a trigger guard and a trigger.
- **Sling:** a leather strap hangs from two swivels.

The brass muzzle rim reaches at most about 0.9 in z, which is inside the box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildBlunderbuss(b: Builder) {
  const WOOD = "#6b3f1f";
  const WOOD_D = "#4a2a14";
  const BRASS = "#d4a43a";
  const BRASS_D = "#9a7226";
  const STEEL = "#4d5360";
  const DARK = "#14110f";
  const LEATHER = "#3b2616";
  const bone = "chest";

  const A = new THREE.Vector3(-0.22, 0.72, 0.2);
  const B = new THREE.Vector3(0.38, 1.02, 0.88);
  const dir = B.clone().sub(A).normalize();
  const along = (t: number, up = 0, side = 0) => {
    const p = A.clone().lerp(B, t);
    p.y += up;
    p.x += side;
    return p;
  };
  const rod = (t0: number, t1: number, r0: number, r1: number, color: string, up = 0) =>
    b.rod(along(t0, up), along(t1, up), [r0, r1], color, { bone, sides: 8 } as any);

  // stock
  rod(0.0, 0.42, 0.05, 0.034, WOOD);
  rod(0.0, 0.03, 0.058, 0.058, WOOD_D);
  rod(0.38, 0.72, 0.03, 0.028, WOOD, -0.005);
  // barrel
  rod(0.4, 0.86, 0.026, 0.024, STEEL, 0.01);
  // bands
  for (const t of [0.46, 0.6, 0.74]) {
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.03, 8), BRASS, {
      bone,
      at: along(t, 0.008),
      dir: dir.toArray() as [number, number, number],
    });
  }
  // flared muzzle
  b.part(new THREE.CylinderGeometry(0.075, 0.03, 0.14, 10, 1, true), BRASS, {
    bone,
    at: along(0.9, 0.012),
    dir: dir.toArray() as [number, number, number],
  });
  b.part(new THREE.TorusGeometry(0.075, 0.01, 5, 12), BRASS_D, {
    bone,
    at: along(0.97, 0.012),
    dir: dir.toArray() as [number, number, number],
    axis: "z",
  });
  b.part(new THREE.CircleGeometry(0.06, 10), DARK, {
    bone,
    at: along(0.9, 0.012),
    dir: dir.toArray() as [number, number, number],
    axis: "z",
  });
  // lock
  b.part(new THREE.BoxGeometry(0.016, 0.07, 0.05), BRASS_D, { bone, at: along(0.36, 0.0, 0.04) });
  b.part(new THREE.BoxGeometry(0.014, 0.05, 0.015), STEEL, { bone, at: along(0.33, 0.06, 0.04) });
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.03), BRASS, { bone, at: along(0.4, 0.04, 0.0) });
  // trigger guard + trigger
  b.part(new THREE.TorusGeometry(0.035, 0.007, 5, 10, Math.PI), BRASS, {
    bone,
    at: along(0.3, -0.04),
    rotation: [0, 0, 180],
  });
  b.part(new THREE.BoxGeometry(0.01, 0.04, 0.012), STEEL, { bone, at: along(0.3, -0.04) });
  // sling
  const s1 = along(0.1, -0.05, 0);
  const s2 = along(0.7, -0.04, 0);
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { bone, at: s1 });
  b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { bone, at: s2 });
  const sag = s1.clone().lerp(s2, 0.5);
  sag.y -= 0.1;
  sag.z -= 0.02;
  b.rod(s1, sag, 0.012, LEATHER, { bone });
  b.rod(sag, s2, 0.012, LEATHER, { bone });
}
```

<!-- call: beard -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildBeard(b: Builder) {
  const DARK = "#7a3d14", MID = "#b8651e", LIGHT = "#e0963a", PALE = "#f0c070";
  const METAL = "#c9a24a", METAL2 = "#6b6f7a";
  const rows = [
    { y: 1.23, z: 0.31, len: 0.2, n: 9, w: 0.052, c: DARK, bone: "head" },
    { y: 1.14, z: 0.34, len: 0.22, n: 8, w: 0.052, c: MID, bone: "head" },
    { y: 1.04, z: 0.35, len: 0.24, n: 7, w: 0.05, c: LIGHT, bone: "chest" },
  ];
  // layered blades
  rows.forEach((r, ri) => {
    for (let k = 0; k < r.n; k++) {
      const t = k / (r.n - 1) - 0.5;
      const x = t * 0.4;
      const droop = r.len * (1 - Math.abs(t) * 0.7);
      b.spike([x, r.y, r.z - Math.abs(t) * 0.07], [x * 1.08, r.y - droop, r.z + 0.02 - Math.abs(t) * 0.05], null, r.w, {
        color: ri % 2 ? r.c : r.c,
        bone: r.bone,
      });
    }
  });
  // pale highlights on top layer
  for (let k = 0; k < 5; k++) {
    const x = (k - 2) * 0.07;
    b.spike([x, 1.2, 0.36], [x * 1.1, 1.05, 0.385], null, 0.018, { color: PALE, bone: "head" });
  }
  // central tapered tip
  b.spike([0, 0.92, 0.36], [0, 0.6, 0.38], null, 0.07, { color: MID, bone: "chest" });
  b.spike([0, 0.9, 0.39], [0, 0.66, 0.405], null, 0.03, { color: PALE, bone: "chest" });

  // moustache
  for (const s of [1, -1]) {
    b.capsule([s * 0.02, 1.215, 0.395], [s * 0.12, 1.19, 0.385], 0.028, { color: MID, bone: "head" });
    b.capsule([s * 0.12, 1.19, 0.385], [s * 0.2, 1.215, 0.37], [0.024, 0.01], { color: LIGHT, bone: "head" });
    b.spike([s * 0.2, 1.215, 0.37], [s * 0.23, 1.255, 0.36], null, 0.012, { color: PALE, bone: "head" });
  }

  // braids
  for (const s of [1, -1]) {
    const x0 = s * 0.1;
    const links = 9;
    for (let i = 0; i < links; i++) {
      const y = 1.07 - i * 0.05;
      const off = (i % 2 ? 1 : -1) * 0.012;
      const g = new THREE.SphereGeometry(0.033, 7, 5);
      b.part(g, i % 2 ? MID : LIGHT, {
        at: [x0 + off, y, 0.385],
        scale: [1, 0.85, 0.8],
        bone: i < 3 ? "head" : "chest",
      });
    }
    // tip
    b.spike([x0, 0.63, 0.385], [x0, 0.57, 0.39], null, 0.026, { color: DARK, bone: "chest" });
    // ties & rings
    for (const [y, c] of [[0.99, METAL], [0.82, METAL], [0.66, METAL2]] as [number, string][]) {
      b.part(new THREE.TorusGeometry(0.036, 0.01, 5, 10), c, {
        at: [x0, y, 0.385],
        rotation: [90, 0, 0],
        bone: "chest",
      });
    }
    // rune bead
    b.part(new THREE.SphereGeometry(0.014, 6, 4), METAL, { at: [x0, 0.74, 0.42], bone: "chest" });
  }
}
```

<!-- call: gear -->

The base source arrived as the literal text `{ base; }`, so I couldn't read its dimensions or joint positions. This gear is placed on a guessed dwarf layout and has not been checked against the base geometry:

- **Waist:** about y = 0.62.
- **Torso half-width:** about 0.19 m.
- **Legs:** x = ±0.1.

It attaches to the existing `hips` and `chest` joints by name, so the positions may need retuning once the real base is visible.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildGear(b: Builder) {
  const LEATHER = "#6b4423", DARK = "#3e2814", BRASS = "#d4a537", CANVAS = "#a89868", ROLL = "#7a3b2e", BONE = "#e8dcc0", STEEL = "#8a8f99";
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: string, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, rotation: rot });

  // Belt
  const WY = 0.62;
  box(0.4, 0.07, 0.3, LEATHER, [0, WY, 0], "hips");
  box(0.1, 0.085, 0.03, BRASS, [0, WY, 0.155], "hips");
  box(0.06, 0.05, 0.035, DARK, [0, WY, 0.16], "hips");
  box(0.02, 0.02, 0.038, BRASS, [0, WY, 0.162], "hips");
  for (const s of [1, -1]) {
    // pouches
    box(0.09, 0.1, 0.06, LEATHER, [s * 0.15, WY - 0.08, 0.12], "hips", [0, s * -15, 0]);
    box(0.095, 0.035, 0.065, DARK, [s * 0.15, WY - 0.035, 0.12], "hips", [0, s * -15, 0]);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, { bone: "hips", at: [s * 0.15, WY - 0.05, 0.155] });
    // knee pads
    box(0.11, 0.1, 0.05, STEEL, [s * 0.1, 0.4, 0.1], "hips");
    box(0.12, 0.02, 0.055, DARK, [s * 0.1, 0.46, 0.1], "hips");
    b.part(new THREE.SphereGeometry(0.015, 6, 4), BRASS, { bone: "hips", at: [s * 0.1, 0.4, 0.13] });
    // boot cuffs and straps
    cyl(0.085, 0.08, 0.05, 8, DARK, [s * 0.1, 0.2, 0.0], "hips");
    for (const y of [0.1, 0.15]) {
      cyl(0.082, 0.082, 0.02, 8, LEATHER, [s * 0.1, y, 0.0], "hips");
      box(0.03, 0.025, 0.02, BRASS, [s * 0.1, y, 0.085], "hips");
    }
  }
  // powder horn on left hip
  cyl(0.03, 0.012, 0.16, 7, BONE, [0.2, WY - 0.12, 0.02], "hips", [0, 0, -25]);
  cyl(0.032, 0.032, 0.02, 7, BRASS, [0.19, WY - 0.05, 0.02], "hips", [0, 0, -25]);
  cyl(0.014, 0.014, 0.02, 6, BRASS, [0.235, WY - 0.19, 0.02], "hips", [0, 0, -25]);
  b.part(new THREE.TorusGeometry(0.08, 0.008, 4, 10, Math.PI), LEATHER, { bone: "hips", at: [0.19, WY - 0.03, 0.02], rotation: [90, 0, 0] });

  // backpack
  box(0.3, 0.3, 0.14, CANVAS, [0, 0.8, -0.2], "chest");
  box(0.32, 0.1, 0.15, LEATHER, [0, 0.72, -0.2], "chest");
  box(0.22, 0.14, 0.05, DARK, [0, 0.82, -0.29], "chest");
  box(0.04, 0.12, 0.01, BRASS, [0, 0.82, -0.32], "chest");
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.03, LEATHER, [s * 0.1, 0.78, -0.125], "chest");
    box(0.03, 0.03, 0.14, LEATHER, [s * 0.1, 0.92, -0.2], "chest");
    cyl(0.01, 0.01, 0.03, 6, BRASS, [s * 0.1, 0.66, -0.2], "chest", [90, 0, 0]);
  }
  // bedroll
  cyl(0.06, 0.06, 0.38, 10, ROLL, [0, 0.92, -0.22], "chest", [0, 0, 90]);
  cyl(0.052, 0.052, 0.39, 10, CANVAS, [0, 0.92, -0.22], "chest", [0, 0, 90]);
  for (const x of [-0.12, 0.12]) cyl(0.064, 0.064, 0.025, 10, LEATHER, [x, 0.92, -0.22], "chest", [0, 0, 90]);
  // tin cup
  cyl(0.03, 0.025, 0.05, 8, STEEL, [0.14, 0.7, -0.3], "chest");
}
```

<!-- call: head -->

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHead(b: Builder) {
  // NOTE: the base source was not included in the prompt (only a placeholder),
  // so this head is placed from the box and the stated joints (`neck`, `head`).
  const SKIN = "#d99a74", SKIN_D = "#b8765a", DARK = "#1a1210", WHITE = "#f4efe6";
  const IRON = "#6d7480", IRON_D = "#454b55", GOLD = "#d4a640", HORN = "#e8dcc0";
  const BROW = "#7a4a22";
  const C = [0, 1.29, 0.03];
  const P = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  const part = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: "head", at, ...o });
  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);

  // skull
  part(sph(0.13, 14, 10), SKIN, P(C[0], C[1], C[2]));
  // cheeks
  for (const s of [1, -1]) part(sph(0.04), SKIN_D, P(s * 0.075, 1.25, 0.12), { scale: [1, 0.8, 0.9] });

  // eyes
  for (const s of [1, -1]) {
    part(sph(0.026, 8, 6), WHITE, P(s * 0.05, 1.31, 0.135), { scale: [1, 0.9, 0.6] });
    part(sph(0.014, 6, 5), "#2f6fa8", P(s * 0.05, 1.31, 0.147));
    part(sph(0.007, 5, 4), DARK, P(s * 0.05, 1.31, 0.153));
    // brow ridge
    part(new THREE.BoxGeometry(0.085, 0.024, 0.05), BROW, P(s * 0.05, 1.345, 0.135), { rotation: [0, 0, s * -12] });
    // ears
    part(sph(0.035, 8, 6), SKIN, P(s * 0.13, 1.29, 0.01), { scale: [0.5, 1.2, 0.9] });
    part(new THREE.ConeGeometry(0.02, 0.06, 5), SKIN_D, P(s * 0.15, 1.31, 0.01), { rotation: [0, 0, -s * 80] });
  }
  // big nose
  part(sph(0.04, 9, 7), SKIN_D, P(0, 1.27, 0.17), { scale: [1, 0.95, 1.1] });
  part(new THREE.BoxGeometry(0.03, 0.05, 0.05), SKIN, P(0, 1.3, 0.15));
  for (const s of [1, -1]) part(sph(0.015, 6, 5), SKIN_D, P(s * 0.028, 1.255, 0.16));

  // mouth: dark cavity, upper lip, separate jaw
  part(new THREE.BoxGeometry(0.1, 0.02, 0.05), DARK, P(0, 1.2, 0.115));
  part(new THREE.BoxGeometry(0.11, 0.03, 0.06), SKIN_D, P(0, 1.225, 0.125));
  for (const s of [1, -1]) part(new THREE.BoxGeometry(0.014, 0.014, 0.01), WHITE, P(s * 0.02, 1.2, 0.145));

  const jaw = b.joint("headJaw", { parent: "head", at: P(0, 1.22, 0.02), aim: P(0, 1.22, 0.14), role: "jaw" });
  const jp = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone: jaw, at, ...o });
  jp(new THREE.BoxGeometry(0.14, 0.04, 0.13), SKIN, P(0, 1.185, 0.075));
  jp(new THREE.BoxGeometry(0.08, 0.05, 0.05), SKIN_D, P(0, 1.16, 0.13));
  jp(new THREE.BoxGeometry(0.06, 0.012, 0.04), WHITE, P(0, 1.2, 0.13));

  // helmet
  part(new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), IRON, P(0, 1.31, 0.02));
  part(new THREE.CylinderGeometry(0.152, 0.152, 0.03, 14, 1, true), IRON_D, P(0, 1.335, 0.02));
  part(new THREE.TorusGeometry(0.152, 0.012, 5, 16), GOLD, P(0, 1.318, 0.02), { rotation: [90, 0, 0] });
  part(new THREE.BoxGeometry(0.02, 0.016, 0.3), GOLD, P(0, 1.455, 0.02));
  part(new THREE.BoxGeometry(0.03, 0.05, 0.016), IRON_D, P(0, 1.33, 0.17)); // nasal guard
  // rivets
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    part(sph(0.009, 5, 4), GOLD, P(Math.sin(a) * 0.153, 1.318, 0.02 + Math.cos(a) * 0.153));
  }
  // horns with trim
  for (const s of [1, -1]) {
    part(new THREE.ConeGeometry(0.03, 0.1, 6), HORN, P(s * 0.15, 1.39, 0.02), { rotation: [0, 0, -s * 55] });
    part(new THREE.CylinderGeometry(0.032, 0.036, 0.02, 6), GOLD, P(s * 0.128, 1.355, 0.02), { rotation: [0, 0, -s * 55] });
  }
}
```

<!-- call: arms -->

I could not see the base source (the prompt contained only the `{ base; }` placeholder), so this is a best-guess fit rather than a placement against the real code. I assumed shoulder sockets near (±0.3, 1.0, 0) and a dwarf of roughly 1.3 m. I haven't run it, so the placements and the existence of the `shoulderL`/`shoulderR` joints are unchecked.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildArms(b: Builder) {
  const CLOTH = "#3d5a8a", CLOTHD = "#2c4268", LEATHER = "#6b4423", LEATHERD = "#4a2e17";
  const STEEL = "#8b94a3", STEELD = "#5d6571", BRASS = "#d9a53a", GLOVE = "#8a5a2e", GLOVED = "#6a4220";
  const SKIN = "#e0a47c", ROYAL = "#b3322b";

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const sh = `shoulder${side}`;
    const P = (x: number, y: number, z: number): [number, number, number] => [s * x, y, z];
    const S = P(0.3, 1.0, 0.0);
    const E = P(0.36, 0.8, 0.12);
    const W = P(0.31, 0.68, 0.33);
    const elbow = b.joint(`armsElbow${side}`, { parent: sh, at: E, aim: W });
    const wrist = b.joint(`armsWrist${side}`, { parent: elbow, at: W, dir: [0, -0.1, 1] });

    // sleeves and arm
    b.capsule(S, E, 0.075, CLOTH, { bone: sh });
    b.capsule(E, W, 0.062, SKIN, { bone: elbow });
    b.capsule(offsetP(E, 0, 0, 0), P(0.35, 0.78, 0.14), 0.082, CLOTHD, { bone: elbow });

    function offsetP(p: number[], x: number, y: number, z: number): [number, number, number] {
      return [p[0] + x, p[1] + y, p[2] + z];
    }

    // bracer: leather rings + plate + studs
    for (let i = 0; i < 3; i++) {
      const t = 0.35 + i * 0.22;
      const c: [number, number, number] = [E[0] + (W[0] - E[0]) * t, E[1] + (W[1] - E[1]) * t, E[2] + (W[2] - E[2]) * t];
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 8), i === 1 ? LEATHERD : LEATHER, {
        bone: elbow, at: c, aim: W,
      });
      b.part(new THREE.SphereGeometry(0.011, 5, 4), BRASS, {
        bone: elbow, at: [c[0] + s * 0.066, c[1] + 0.012, c[2]],
      });
    }
    b.part(new THREE.BoxGeometry(0.02, 0.05, 0.1), STEEL, {
      bone: elbow, at: [E[0] + s * 0.05 + (W[0] - E[0]) * 0.5, E[1] + (W[1] - E[1]) * 0.5 + 0.04, (E[2] + W[2]) / 2],
    });

    // glove cuff and hand
    const H: [number, number, number] = P(0.3, 0.65, 0.41);
    b.part(new THREE.CylinderGeometry(0.07, 0.075, 0.07, 8), GLOVE, { bone: wrist, at: P(0.31, 0.665, 0.355), aim: H });
    b.part(new THREE.BoxGeometry(0.085, 0.045, 0.1), BRASS, { bone: wrist, at: P(0.31, 0.665, 0.33) });
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.1), GLOVE, { bone: wrist, at: H });
    b.part(new THREE.BoxGeometry(0.07, 0.015, 0.07), GLOVED, { bone: wrist, at: P(0.3, 0.685, 0.41) });
    // thumb
    b.capsule(P(0.24, 0.64, 0.4), P(0.2, 0.62, 0.46), 0.02, GLOVE, { bone: wrist });
    // fingers (two segments each)
    for (let i = 0; i < 4; i++) {
      const fx = 0.3 + (i - 1.5) * 0.026 * -1;
      const len = i === 1 || i === 2 ? 1.1 : 0.9;
      const a: [number, number, number] = P(fx, 0.645, 0.455);
      const m: [number, number, number] = P(fx, 0.64, 0.455 + 0.04 * len);
      const e: [number, number, number] = P(fx, 0.62, 0.455 + 0.07 * len);
      b.capsule(a, m, 0.0125, GLOVE, { bone: wrist });
      b.capsule(m, e, 0.011, GLOVED, { bone: wrist });
      b.part(new THREE.SphereGeometry(0.008, 5, 4), BRASS, { bone: wrist, at: P(fx, 0.675, 0.43) });
    }

    // pauldron: steel dome, rim, rivets, trim
    const pc = P(0.33, 1.04, 0.0);
    b.part(new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), STEEL, {
      bone: sh, at: pc, scale: [1, 0.85, 1.05],
    });
    b.part(new THREE.TorusGeometry(0.125, 0.015, 5, 12), BRASS, {
      bone: sh, at: [pc[0], pc[1] - 0.045, pc[2]], rotation: [90, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.11, 0.125, 0.04, 10), STEELD, { bone: sh, at: [pc[0], pc[1] - 0.075, pc[2]] });
    b.part(new THREE.ConeGeometry(0.03, 0.08, 6), BRASS, { bone: sh, at: [pc[0] + s * 0.02, pc[1] + 0.12, pc[2]] });
    b.part(new THREE.BoxGeometry(0.02, 0.012, 0.2), ROYAL, { bone: sh, at: [pc[0] + s * 0.01, pc[1] + 0.1, pc[2]] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.01, 5, 4), BRASS, {
        bone: sh, at: [pc[0] + Math.cos(a) * 0.115, pc[1] - 0.04, pc[2] + Math.sin(a) * 0.115],
      });
    }

    // shoulder strap across chest front and back
    b.rod(P(0.22, 1.02, 0.02), P(0.08, 0.82, 0.19), 0.025, LEATHER, { bone: sh });
    b.rod(P(0.22, 1.02, 0.02), P(0.08, 0.84, -0.18), 0.025, LEATHERD, { bone: sh });
    b.part(new THREE.BoxGeometry(0.04, 0.045, 0.012), BRASS, { bone: sh, at: P(0.15, 0.93, 0.115) });
  }
  void frame;
}
```
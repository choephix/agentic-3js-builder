<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "potions",
    builds: "Potion bottles, flasks, a bubbling alembic and a glowing vial rack in Genshin style: glass bodies, cork stoppers, glowing liquids, labels, brass collars",
    box: [
      [0.1, 0.92, -0.38],
      [1.05, 1.5, 0.3],
    ],
    attaches: "Top surface of the tabletop (y = 0.92), right half (+X) and the back shelf",
    joints: [],
    floor: false,
    budget: 260,
  },
  {
    id: "books",
    builds: "Stacked and open grimoires, scrolls, a leaning row of tomes with gilt trim, ribbons, rune emblems, a quill and inkwell",
    box: [
      [-1.05, 0.92, -0.35],
      [-0.2, 1.4, 0.3],
    ],
    attaches: "Top surface of the tabletop (y = 0.92), left half (-X)",
    joints: [],
    floor: false,
    budget: 220,
  },
  {
    id: "scales",
    builds: "Brass balance scale with beam, pans, chains, weights, and a mortar and pestle beside it",
    box: [
      [-0.3, 0.92, 0.1],
      [0.35, 1.45, 0.42],
    ],
    attaches: "Front-centre of the tabletop top surface (y = 0.92)",
    joints: [],
    floor: false,
    budget: 140,
  },
  {
    id: "herbs",
    builds: "Hanging herb bundles from the rack, leaf sprigs in pots, drying lines, tied twine, mushrooms and a basket on the lower shelf",
    box: [
      [-1.15, 0.2, -0.5],
      [1.15, 2.3, 0.5],
    ],
    attaches: "Overhead drying rail between the posts at y = 2.0 and the lower shelf plank at y = 0.3",
    joints: [],
    floor: false,
    budget: 180,
  },
  {
    id: "drawers",
    builds: "Drawer fronts with brass pulls, keyholes, carved panel trim, corner brackets, and cloth runner on the table edge",
    box: [
      [-1.1, 0.35, 0.4],
      [1.1, 0.9, 0.58],
    ],
    attaches: "Front face of the apron/cabinet under the tabletop (z = 0.45)",
    joints: [],
    floor: true,
    budget: 100,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const WOOD = "#7a4a2a";
  const DARK = "#4a2c1a";
  const LIGHT = "#a8693a";
  const IRON = "#3a3d4a";

  const root = b.joint("root", { at: [0, 0, 0] });
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: root, at: [x, y, z] });

  // legs
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(0.14, 0.9, 0.14, DARK, sx * 1.0, 0.45, sz * 0.4);
      box(0.18, 0.06, 0.18, IRON, sx * 1.0, 0.03, sz * 0.4);
      box(0.18, 0.06, 0.18, IRON, sx * 1.0, 0.8, sz * 0.4);
    }

  // tabletop
  box(2.4, 0.08, 1.0, WOOD, 0, 0.88, 0);
  box(2.46, 0.03, 1.06, LIGHT, 0, 0.915, 0);

  // apron / cabinet front
  box(2.0, 0.5, 0.06, WOOD, 0, 0.6, 0.42);
  box(2.0, 0.5, 0.06, WOOD, 0, 0.6, -0.42);
  box(0.06, 0.5, 0.84, WOOD, -0.98, 0.6, 0);
  box(0.06, 0.5, 0.84, WOOD, 0.98, 0.6, 0);

  // lower shelf
  box(2.0, 0.05, 0.8, DARK, 0, 0.28, 0);

  // rear posts and overhead rail
  for (const sx of [-1, 1]) box(0.1, 1.45, 0.1, DARK, sx * 1.1, 1.62, -0.45);
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 2.3, 8), DARK, { bone: root, at: [0, 2.0, -0.45], dir: [1, 0, 0] });
  box(2.4, 0.06, 0.1, WOOD, 0, 2.36, -0.45);

  // back shelf
  box(2.0, 0.04, 0.22, WOOD, 0, 1.35, -0.38);

  return b.root;
}
```

<!-- call: drawers -->

The base source in the prompt was empty (`{ base; }`), so I could not read its dimensions. I placed the part from the box and the attachment you gave: the drawer fronts sit on the apron face at z = 0.45, inside x ∈ [-1.1, 1.1], y ∈ [0.35, 0.9] and z ∈ [0.4, 0.58]. Nothing was run or rendered, so none of this has been checked against the real base.

- **Drawer bank:** three drawer fronts, each with a raised panel, a dark carved trim frame, a brass pull and a keyhole.
- **Corner brackets:** four brass brackets per drawer front.
- **Cloth runner:** a runner hangs over the table edge at the top, with trim and tassels.
- **Floor contact:** "lowest points rest on the floor" can't be met inside a box that starts at y = 0.35, so I kept the part inside its box.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildDrawers(b: Builder) {
  const WOOD = "#8a5a32";
  const WOOD_D = "#5e3a1e";
  const WOOD_L = "#a8744a";
  const BRASS = "#d9a93a";
  const BRASS_D = "#8a6420";
  const DARK = "#1e120a";
  const CLOTH = "#2f5f7a";
  const CLOTH_T = "#e8c75a";
  const Z0 = 0.45;

  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone: undefined as any });

  // carcass backing strip behind the fronts
  box(2.16, 0.5, 0.04, WOOD_D, 0, 0.6, 0.42);

  const widths = [0.66, 0.66, 0.66];
  const xs = [-0.7, 0, 0.7];
  const fy = 0.58;
  const fh = 0.4;

  xs.forEach((x, i) => {
    const w = widths[i];
    // drawer front
    box(w, fh, 0.05, WOOD, x, fy, Z0 + 0.025);
    // carved trim frame (four strips)
    const tz = Z0 + 0.054;
    box(w - 0.06, 0.02, 0.012, WOOD_D, x, fy + fh / 2 - 0.035, tz);
    box(w - 0.06, 0.02, 0.012, WOOD_D, x, fy - fh / 2 + 0.035, tz);
    box(0.02, fh - 0.06, 0.012, WOOD_D, x - w / 2 + 0.035, fy, tz);
    box(0.02, fh - 0.06, 0.012, WOOD_D, x + w / 2 - 0.035, fy, tz);
    // raised panel
    box(w - 0.14, fh - 0.14, 0.014, WOOD_L, x, fy, tz);
    // brass pull: backplate, bar, two posts
    box(0.14, 0.03, 0.01, BRASS_D, x, fy + 0.04, Z0 + 0.066);
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), BRASS, {
      at: [x, fy + 0.04, Z0 + 0.095],
      dir: [1, 0, 0],
    });
    for (const s of [-1, 1])
      b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 6), BRASS, {
        at: [x + s * 0.05, fy + 0.04, Z0 + 0.08],
        dir: [0, 0, 1],
      });
    // keyhole
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8), BRASS_D, {
      at: [x, fy - 0.05, Z0 + 0.067],
      dir: [0, 0, 1],
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 8), DARK, {
      at: [x, fy - 0.05, Z0 + 0.07],
      dir: [0, 0, 1],
    });
    box(0.008, 0.032, 0.008, DARK, x, fy - 0.075, Z0 + 0.07);
    // corner brackets
    for (const sx of [-1, 1])
      for (const sy of [-1, 1]) {
        const cx = x + sx * (w / 2 - 0.035);
        const cy = fy + sy * (fh / 2 - 0.035);
        box(0.05, 0.012, 0.01, BRASS, cx - sx * 0.0, cy, Z0 + 0.058);
        box(0.012, 0.05, 0.01, BRASS, cx, cy, Z0 + 0.058);
        b.part(new THREE.SphereGeometry(0.007, 6, 4), BRASS_D, { at: [cx, cy, Z0 + 0.066] });
      }
  });

  // dividers between fronts
  for (const x of [-0.35, 0.35]) box(0.03, 0.44, 0.06, WOOD_D, x, fy, Z0 + 0.03);

  // cloth runner draped on the table edge
  box(1.9, 0.02, 0.2, CLOTH, 0, 0.885, 0.5);
  box(1.9, 0.26, 0.012, CLOTH, 0, 0.76, 0.575);
  box(1.9, 0.02, 0.014, CLOTH_T, 0, 0.64, 0.577);
  box(1.9, 0.012, 0.014, CLOTH_T, 0, 0.865, 0.578);
  for (let i = 0; i < 9; i++) {
    const x = -0.84 + i * 0.21;
    b.part(new THREE.ConeGeometry(0.02, 0.05, 6), CLOTH_T, {
      at: [x, 0.605, 0.577],
      dir: [0, -1, 0],
    });
  }
  // diamond motif
  for (const x of [-0.6, 0, 0.6]) {
    b.part(new THREE.OctahedronGeometry(0.05), CLOTH_T, {
      at: [x, 0.76, 0.583],
      scale: [1, 1.4, 0.2],
    });
  }
}
```

<!-- call: books -->

The base source in the prompt was empty (`{ base; }`), so I could not check it. I relied on the stated attachment surface, the tabletop at y = 0.92, and kept every part inside the box x -1.05..-0.2, y 0.92..1.4, z -0.35..0.3. I did not run or render the result. Everything uses `b.part`, flat colour strings, no joints and no textures.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildBooks(b: Builder) {
  const Y0 = 0.92;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z] });

  const GOLD = "#e2b84a", PAGE = "#f3e8c8", RUNE = "#7fe3ff";
  const covers = ["#2f4a7a", "#7a2f3a", "#2f6a58", "#5a3a7a", "#8a5a2a"];

  // Stacked grimoires (left-back)
  const stack = [
    { w: 0.42, d: 0.3, h: 0.07, c: covers[1], ry: 0.05 },
    { w: 0.38, d: 0.27, h: 0.06, c: covers[0], ry: -0.12 },
    { w: 0.34, d: 0.25, h: 0.055, c: covers[2], ry: 0.1 },
    { w: 0.28, d: 0.2, h: 0.05, c: covers[3], ry: -0.05 },
  ];
  let y = Y0;
  const sx = -0.78, sz = -0.15;
  stack.forEach((s, i) => {
    const cy = y + s.h / 2;
    box(s.w, s.h, s.d, s.c, sx, cy, sz, s.ry);
    box(s.w * 0.96, s.h * 0.7, s.d * 0.96, PAGE, sx + 0.012, cy, sz + 0.01, s.ry);
    box(s.w * 1.02, s.h * 1.0, 0.012, s.c, sx, cy, sz - s.d / 2, s.ry);
    box(s.w * 1.03, 0.008, s.d * 0.3, GOLD, sx, y + s.h + 0.001, sz, s.ry);
    y += s.h;
  });
  // rune emblem on top
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 6), GOLD, { at: [sx, y + 0.004, sz] });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6), RUNE, { at: [sx, y + 0.008, sz] });
  // ribbon bookmark
  box(0.025, 0.004, 0.14, "#d04a4a", sx + 0.1, y - 0.15, sz + 0.2, 0.3);

  // Leaning row of tomes (right of centre, front)
  const row = [0.2, 0.26, 0.22, 0.3, 0.24];
  let x = -0.98;
  row.forEach((h, i) => {
    const t = 0.055 + (i % 2) * 0.01;
    const c = covers[(i + 2) % 5];
    const z = 0.12;
    b.part(new THREE.BoxGeometry(t, h, 0.2), c, { at: [x, Y0 + h / 2, z] });
    box(t * 1.1, 0.012, 0.205, GOLD, x, Y0 + h * 0.85, z);
    box(t * 1.1, 0.012, 0.205, GOLD, x, Y0 + h * 0.15, z);
    box(t * 0.5, h * 0.4, 0.004, PAGE, x, Y0 + h * 0.5, z + 0.102);
    x += t + 0.004;
  });
  // last tome leaning
  b.part(new THREE.BoxGeometry(0.06, 0.28, 0.2), covers[4], { at: [x + 0.06, Y0 + 0.135, 0.12], rotation: [0, 0, -0.3] });
  b.part(new THREE.BoxGeometry(0.062, 0.012, 0.205), GOLD, { at: [x + 0.06, Y0 + 0.135, 0.12], rotation: [0, 0, -0.3] });

  // Open grimoire (front-left)
  const ox = -0.6, oz = 0.1;
  box(0.34, 0.025, 0.24, covers[0], ox, Y0 + 0.0125, oz);
  b.part(new THREE.BoxGeometry(0.15, 0.02, 0.21), PAGE, { at: [ox - 0.08, Y0 + 0.033, oz], rotation: [0, 0, 0.05] });
  b.part(new THREE.BoxGeometry(0.15, 0.02, 0.21), PAGE, { at: [ox + 0.08, Y0 + 0.033, oz], rotation: [0, 0, -0.05] });
  for (let i = 0; i < 4; i++) {
    box(0.1, 0.002, 0.008, "#6a4a30", ox - 0.08, Y0 + 0.045, oz - 0.07 + i * 0.045);
    box(0.1, 0.002, 0.008, "#6a4a30", ox + 0.08, Y0 + 0.045, oz - 0.07 + i * 0.045);
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 6), RUNE, { at: [ox + 0.08, Y0 + 0.048, oz + 0.07] });

  // Scrolls (back)
  [[-0.5, -0.3, 0.2], [-0.4, -0.25, -0.1]].forEach(([px, pz, r], i) => {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), PAGE, { at: [px, Y0 + 0.03, pz], rotation: [0, r, Math.PI / 2] });
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), "#b03a3a", { at: [px, Y0 + 0.03, pz], rotation: [0, r, Math.PI / 2] });
  });

  // Inkwell and quill
  const ix = -0.3, iz = 0.15;
  cyl(0.045, 0.07, "#22263a", ix, Y0 + 0.035, iz);
  cyl(0.025, 0.02, "#0c0c18", ix, Y0 + 0.075, iz);
  cyl(0.03, 0.012, GOLD, ix, Y0 + 0.07, iz, 8);
  b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.3, 5), "#f4f0e6", { at: [ix + 0.04, Y0 + 0.16, iz], rotation: [0, 0, -0.45] });
  b.part(new THREE.ConeGeometry(0.03, 0.2, 4), "#4aa8d8", { at: [ix + 0.1, Y0 + 0.23, iz], rotation: [0, 0, -0.45] });
}
```

<!-- call: scales -->

The base source arrived as the placeholder `{ base; }`, so I couldn't read its real dimensions. I'm relying on the stated tabletop surface at y = 0.92 and the given box instead. Everything sits inside x −0.3..0.35, y 0.92..1.45, z 0.1..0.42. The scale stands left of centre and the mortar and pestle sit to its right. I haven't run or rendered this.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildScales(b: Builder) {
  const BRASS = "#d9a441";
  const BRASS_D = "#a8742a";
  const GILT = "#f3d27a";
  const STONE = "#8d8f9a";
  const STONE_D = "#686a76";
  const WOOD = "#7a4a2a";
  const CHAIN = "#c9b27a";
  const GREEN = "#4fb58a";
  const POTION = "#6fd6ff";

  const Y0 = 0.92;
  const cx = -0.12;
  const cz = 0.26;

  const add = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(g, c, { at, rotation: rot, bone: undefined as any });

  // Base plinth: stacked wooden steps
  add(new THREE.CylinderGeometry(0.1, 0.11, 0.02, 8), WOOD, [cx, Y0 + 0.01, cz]);
  add(new THREE.CylinderGeometry(0.075, 0.09, 0.02, 8), BRASS_D, [cx, Y0 + 0.03, cz]);
  add(new THREE.CylinderGeometry(0.03, 0.05, 0.03, 8), BRASS, [cx, Y0 + 0.055, cz]);
  // Pillar
  add(new THREE.CylinderGeometry(0.012, 0.018, 0.34, 8), BRASS, [cx, Y0 + 0.24, cz]);
  // Pillar rings
  for (const h of [0.12, 0.2, 0.3]) add(new THREE.TorusGeometry(0.02, 0.006, 5, 10), GILT, [cx, Y0 + h, cz], [90, 0, 0].map((d) => (d * Math.PI) / 180) as any);
  const topY = Y0 + 0.42;
  // Finial
  add(new THREE.SphereGeometry(0.02, 8, 6), GILT, [cx, topY + 0.02, cz]);
  add(new THREE.ConeGeometry(0.01, 0.04, 6), GILT, [cx, topY + 0.058, cz]);
  // Beam
  const beamY = topY - 0.02;
  const half = 0.2;
  add(new THREE.BoxGeometry(half * 2, 0.014, 0.018), BRASS, [cx, beamY, cz]);
  add(new THREE.BoxGeometry(half * 2 - 0.04, 0.006, 0.022), GILT, [cx, beamY + 0.009, cz]);
  add(new THREE.SphereGeometry(0.016, 8, 6), BRASS_D, [cx, beamY, cz]);
  // Pointer
  add(new THREE.ConeGeometry(0.006, 0.07, 4), GREEN, [cx, beamY - 0.04, cz + 0.014], [Math.PI, 0, 0]);

  const panY = Y0 + 0.2;
  for (const s of [1, -1]) {
    const x = cx + s * half;
    // end knob
    add(new THREE.SphereGeometry(0.01, 6, 5), GILT, [x + s * 0.008, beamY, cz]);
    // hanging hook
    add(new THREE.TorusGeometry(0.008, 0.002, 4, 8), GILT, [x, beamY - 0.012, cz]);
    // chains (3 each, to the pan rim)
    const topP = new THREE.Vector3(x, beamY - 0.015, cz);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const bot = new THREE.Vector3(x + Math.cos(a) * 0.07, panY + 0.012, cz + Math.sin(a) * 0.07);
      b.rod(topP, bot, 0.0015, CHAIN);
      for (let k = 1; k < 4; k++) {
        const p = topP.clone().lerp(bot, k / 4.2);
        add(new THREE.SphereGeometry(0.0035, 4, 3), GILT, [p.x, p.y, p.z]);
      }
    }
    // pan
    b.lathe(
      [[0, 0], [0.07, 0.012], [0.076, 0.02], [0.07, 0.02], [0.0, 0.006]] as any,
      { at: [x, panY - 0.004, cz], color: BRASS },
    );
    add(new THREE.TorusGeometry(0.074, 0.003, 4, 14), GILT, [x, panY + 0.016, cz], [Math.PI / 2, 0, 0]);
  }

  // Contents: potion drop and weights
  const wcol = ["#b0b4c0", GILT, "#b0b4c0"];
  [0, 1, 2].forEach((i) => {
    const wx = cx - half + (i - 1) * 0.026;
    add(new THREE.CylinderGeometry(0.008 + i * 0.002, 0.011 + i * 0.002, 0.014 + i * 0.004, 6), wcol[i], [wx, panY + 0.018 + i * 0.002, cz]);
    add(new THREE.SphereGeometry(0.004, 5, 4), wcol[i], [wx, panY + 0.03 + i * 0.004, cz]);
  });
  add(new THREE.OctahedronGeometry(0.026, 0), POTION, [cx + half, panY + 0.03, cz]);
  add(new THREE.OctahedronGeometry(0.012, 0), "#ffffff", [cx + half + 0.01, panY + 0.04, cz + 0.01]);

  // Loose weights on table
  for (let i = 0; i < 3; i++) {
    const r = 0.012 + i * 0.004;
    add(new THREE.CylinderGeometry(r * 0.8, r, 0.014 + i * 0.004, 6), i === 1 ? GILT : "#b0b4c0", [cx + 0.02 + i * 0.045, Y0 + 0.01 + i * 0.002, cz + 0.12]);
    add(new THREE.SphereGeometry(0.005, 5, 4), GILT, [cx + 0.02 + i * 0.045, Y0 + 0.024 + i * 0.004, cz + 0.12]);
  }

  // Mortar and pestle
  const mx = 0.24;
  const mz = 0.25;
  b.lathe(
    [[0, 0], [0.04, 0], [0.058, 0.04], [0.07, 0.085], [0.074, 0.095], [0.062, 0.095], [0.05, 0.05], [0, 0.03]] as any,
    { at: [mx, Y0, mz], color: STONE },
  );
  add(new THREE.TorusGeometry(0.068, 0.006, 4, 10), STONE_D, [mx, Y0 + 0.095, mz], [Math.PI / 2, 0, 0]);
  add(new THREE.CylinderGeometry(0.05, 0.055, 0.012, 8), STONE_D, [mx, Y0 + 0.006, mz]);
  // herbs in mortar
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    add(new THREE.OctahedronGeometry(0.014, 0), i % 2 ? GREEN : "#2f8f5f", [mx + Math.cos(a) * 0.025, Y0 + 0.055, mz + Math.sin(a) * 0.025]);
  }
  // pestle leaning
  b.rod([mx + 0.01, Y0 + 0.05, mz], [mx + 0.07, Y0 + 0.24, mz + 0.05], [0.014, 0.022], STONE_D);
  add(new THREE.SphereGeometry(0.024, 6, 5), STONE_D, [mx + 0.07, Y0 + 0.25, mz + 0.05]);
  add(new THREE.SphereGeometry(0.02, 6, 5), STONE_D, [mx + 0.0, Y0 + 0.045, mz - 0.005]);
}
```

<!-- call: herbs -->

The base source was not included in your message (the placeholder `{ base; }` came through literally), so I could not read its real dimensions. I built against the box and attachment heights you gave: a drying rail at y = 2.0 between posts at about x = ±1.05, and a lower shelf plank top at y = 0.3. If the base's posts, rail or shelf sit elsewhere, the herbs will need nudging. I did not run or render this.

The part is built in flat colours only and stays inside the box [-1.15, 0.2, -0.5] to [1.15, 2.3, 0.5].

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildHerbs(b: Builder) {
  const TWINE = "#c9a46a";
  const LEAVES = ["#4f9a3c", "#6cb64a", "#3b7d34", "#8ccf5a"];
  const FLOWER = ["#d96aa0", "#f2c14e", "#9b7be0"];
  const POT = "#b5653a";
  const SOIL = "#4a3022";
  const CAP = ["#d4452f", "#e8b35a", "#c98a5e"];
  const STEM = "#efe3c8";
  const BASKET = "#b98a4c";
  const BASKET_D = "#8a6430";

  const put = (g: THREE.BufferGeometry, c: string, at: number[], rot?: number[], scale?: number[]) =>
    b.part(g, c, { at, rotation: rot, scale, flat: true } as any);

  // Drying line: twine strung along the rail
  const line = (y: number, z: number) => {
    b.rod([-1.0, y, z], [1.0, y - 0.04, z], 0.008, TWINE);
  };
  line(1.98, 0.0);
  line(1.96, 0.12);

  // Hanging bundle
  const bundle = (x: number, len: number, seed: number, z: number) => {
    const top = 1.96;
    put(new THREE.TorusGeometry(0.025, 0.007, 5, 8), TWINE, [x, top, z], [90, 0, 0]);
    b.rod([x, top, z], [x, top - 0.1, z], 0.006, TWINE);
    put(new THREE.CylinderGeometry(0.03, 0.022, 0.035, 6), TWINE, [x, top - 0.1, z]);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + seed;
      const dx = Math.cos(a) * 0.035;
      const dz = Math.sin(a) * 0.035;
      const l = len * (0.8 + 0.2 * ((i * 7 + seed * 3) % 3) / 2);
      b.rod([x, top - 0.12, z], [x + dx, top - 0.12 - l, z + dz], [0.006, 0.004], "#6b7a3a");
      put(new THREE.ConeGeometry(0.035, l * 0.7, 4), LEAVES[(i + Math.floor(seed)) % 4],
        [x + dx * 1.4, top - 0.12 - l * 0.6, z + dz * 1.4], [180, 0, 0], [0.7, 1, 0.5]);
      if (i % 2 === 0)
        put(new THREE.IcosahedronGeometry(0.018, 0), FLOWER[(i + seed) % 3 | 0],
          [x + dx * 1.5, top - 0.12 - l, z + dz * 1.5]);
    }
    put(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 6), "#a67c3e", [x, top - 0.2, z]);
  };
  const xs = [-0.85, -0.55, -0.2, 0.15, 0.5, 0.82];
  xs.forEach((x, i) => bundle(x, 0.22 + (i % 3) * 0.06, i, i % 2 ? 0.0 : 0.12));

  // Leaf sprig in a pot
  const potPlant = (x: number, z: number, s: number) => {
    const y0 = 0.3;
    put(new THREE.CylinderGeometry(0.07 * s, 0.05 * s, 0.1 * s, 8), POT, [x, y0 + 0.05 * s, z]);
    put(new THREE.CylinderGeometry(0.075 * s, 0.075 * s, 0.02 * s, 8), "#c97a48", [x, y0 + 0.105 * s, z]);
    put(new THREE.CylinderGeometry(0.058 * s, 0.058 * s, 0.01, 8), SOIL, [x, y0 + 0.113 * s, z]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const tx = x + Math.cos(a) * 0.08 * s;
      const tz = z + Math.sin(a) * 0.08 * s;
      b.rod([x, y0 + 0.11 * s, z], [tx, y0 + 0.28 * s, tz], 0.005, "#3f7a30");
      put(new THREE.OctahedronGeometry(0.04 * s, 0), LEAVES[i % 4], [tx, y0 + 0.3 * s, tz], undefined, [1, 0.5, 1]);
    }
    put(new THREE.IcosahedronGeometry(0.03 * s, 0), LEAVES[1], [x, y0 + 0.2 * s, z]);
  };
  potPlant(-0.95, 0.15, 1.0);
  potPlant(-0.72, -0.12, 0.8);
  potPlant(0.1, -0.15, 0.9);

  // Mushrooms
  const mush = (x: number, z: number, s: number, c: string) => {
    put(new THREE.CylinderGeometry(0.014 * s, 0.02 * s, 0.07 * s, 6), STEM, [x, 0.3 + 0.035 * s, z]);
    put(new THREE.SphereGeometry(0.045 * s, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), c, [x, 0.3 + 0.07 * s, z]);
    put(new THREE.IcosahedronGeometry(0.008 * s, 0), "#fff4dc", [x + 0.015 * s, 0.3 + 0.105 * s, z + 0.01 * s]);
    put(new THREE.IcosahedronGeometry(0.008 * s, 0), "#fff4dc", [x - 0.015 * s, 0.3 + 0.1 * s, z - 0.015 * s]);
  };
  mush(-0.45, 0.2, 1.2, CAP[0]);
  mush(-0.38, 0.1, 0.8, CAP[1]);
  mush(-0.5, 0.05, 0.9, CAP[2]);
  mush(-0.3, 0.22, 0.6, CAP[0]);

  // Basket on lower shelf
  const bx = 0.6, bz = 0.0;
  put(new THREE.CylinderGeometry(0.2, 0.15, 0.2, 10), BASKET, [bx, 0.4, bz]);
  for (let i = 0; i < 4; i++)
    put(new THREE.TorusGeometry(0.17 - i * 0.008, 0.008, 4, 10), BASKET_D, [bx, 0.34 + i * 0.05, bz], [90, 0, 0]);
  put(new THREE.TorusGeometry(0.2, 0.014, 5, 10), BASKET_D, [bx, 0.5, bz], [90, 0, 0]);
  put(new THREE.TorusGeometry(0.17, 0.012, 5, 8, Math.PI), BASKET_D, [bx, 0.5, bz], [0, 0, 0]);
  put(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 10), SOIL, [bx, 0.49, bz]);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = 0.09 + (i % 2) * 0.05;
    const hx = bx + Math.cos(a) * r, hz = bz + Math.sin(a) * r;
    put(new THREE.OctahedronGeometry(0.045, 0), LEAVES[i % 4], [hx, 0.54 + (i % 3) * 0.02, hz], [i * 20, i * 40, 0], [1, 0.6, 1.3]);
  }
  put(new THREE.IcosahedronGeometry(0.03, 0), FLOWER[0], [bx + 0.03, 0.6, bz - 0.02]);
  put(new THREE.IcosahedronGeometry(0.025, 0), FLOWER[1], [bx - 0.06, 0.59, bz + 0.05]);
}
```

<!-- call: potions -->

The base source arrived as the literal placeholder `{ base; }`, so I couldn't read its dimensions. I placed everything from the brief instead: the tabletop surface at y = 0.92, with a right-half (+X) footprint inside x 0.1 to 1.05 and z -0.38 to 0.3. Nothing has been checked against the real base geometry.

The part is built from flat colours, with no joints and no textures. A short shelf board with brackets sits at the back. The rest of the table-top set:

- **Bottles on the table:** a row of potions with glowing liquids, brass collars, corks, labels and sparkles.
- **Alembic:** a brass-ringed flask over a copper burner, with a pipe and a receiving flask.
- **Vial rack:** a rack with glowing vials, mounted on the shelf at the back.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildPotions(b: Builder) {
  const TOP = 0.92;
  const GLASS = "#cfeaf2";
  const CORK = "#b9854f";
  const BRASS = "#d9a93f";
  const LABEL = "#f3e6c4";
  const INK = "#5a3b2a";
  const WOOD = "#6b4630";
  const COPPER = "#b8652f";
  const glowMat = (c: string, k = 1) => {
    const m = b.part(new THREE.BoxGeometry(0.001, 0.001, 0.001), c, { at: [0, 0, 0] });
    return m;
  };
  void glowMat;
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z] });
  const sph = (r: number, color: string, x: number, y: number, z: number, sy = 1) =>
    b.part(new THREE.SphereGeometry(r, 10, 8), color, { at: [x, y, z], scale: [1, sy, 1] });

  // Round-bellied potion bottle
  const bottle = (x: number, z: number, r: number, neckH: number, liquid: string, labelC: string) => {
    const y0 = TOP;
    sph(r, GLASS, x, y0 + r, z);
    sph(r * 0.86, liquid, x, y0 + r * 0.95, z);
    cyl(r * 0.28, r * 0.34, neckH, 8, GLASS, x, y0 + r * 1.8 + neckH / 2 - 0.02, z);
    const top = y0 + r * 1.8 + neckH - 0.02;
    cyl(r * 0.36, r * 0.36, 0.012, 8, BRASS, x, top - 0.006, z);
    cyl(r * 0.26, r * 0.32, 0.03, 8, CORK, x, top + 0.014, z);
    b.part(new THREE.BoxGeometry(r * 0.9, r * 0.7, 0.006), labelC, { at: [x, y0 + r, z + r * 0.97] });
    b.part(new THREE.BoxGeometry(r * 0.5, 0.01, 0.007), INK, { at: [x, y0 + r * 1.05, z + r * 0.98] });
    cyl(r * 0.7, r * 0.8, 0.008, 10, GLASS, x, y0 + 0.004, z);
  };

  bottle(0.9, 0.2, 0.06, 0.07, "#ff5fa2", LABEL);
  bottle(0.75, 0.22, 0.045, 0.06, "#5fd7ff", "#e9d9ff");
  bottle(0.6, 0.18, 0.05, 0.08, "#9dff6a", LABEL);
  bottle(0.95, 0.02, 0.04, 0.05, "#ffd34f", "#f3e6c4");
  bottle(0.28, 0.2, 0.05, 0.06, "#b07bff", LABEL);

  // Conical flask
  const flask = (x: number, z: number, liquid: string) => {
    cyl(0.018, 0.06, 0.1, 10, GLASS, x, TOP + 0.05, z);
    cyl(0.014, 0.05, 0.05, 10, liquid, x, TOP + 0.028, z);
    cyl(0.022, 0.022, 0.07, 8, GLASS, x, TOP + 0.135, z);
    cyl(0.016, 0.02, 0.025, 8, CORK, x, TOP + 0.18, z);
  };
  flask(0.4, 0.05, "#66f0c8");
  flask(0.7, -0.05, "#ff8a5c");

  // Alembic: burner, flask, head, pipe, receiver
  const ax = 0.85, az = -0.18;
  cyl(0.05, 0.06, 0.05, 8, COPPER, ax, TOP + 0.025, az);
  cyl(0.02, 0.025, 0.03, 6, "#ff9a2e", ax, TOP + 0.065, az);
  cyl(0.06, 0.07, 0.01, 8, BRASS, ax, TOP + 0.055, az);
  sph(0.085, GLASS, ax, TOP + 0.16, az);
  sph(0.07, "#7dffb0", ax, TOP + 0.15, az);
  for (const [dx, dy, dz, r] of [[-0.02, 0.2, 0.01, 0.015], [0.025, 0.24, -0.01, 0.012], [0, 0.29, 0.02, 0.018]])
    sph(r, "#c8ffe0", ax + dx, TOP + dy, az + dz);
  cyl(0.03, 0.04, 0.05, 8, COPPER, ax, TOP + 0.265, az);
  cyl(0.036, 0.036, 0.012, 8, BRASS, ax, TOP + 0.24, az);
  sph(0.035, COPPER, ax, TOP + 0.3, az);
  b.rod([ax, TOP + 0.31, az], [ax + 0.12, TOP + 0.26, az], 0.01, COPPER);
  b.rod([ax + 0.12, TOP + 0.26, az], [ax + 0.17, TOP + 0.16, az], 0.01, COPPER);
  sph(0.045, GLASS, ax + 0.18, TOP + 0.05, az);
  sph(0.035, "#7dffb0", ax + 0.18, TOP + 0.04, az, 0.8);
  cyl(0.012, 0.016, 0.03, 8, GLASS, ax + 0.18, TOP + 0.105, az);

  // Back shelf with vial rack
  const sz = -0.3;
  b.part(new THREE.BoxGeometry(0.85, 0.025, 0.12), WOOD, { at: [0.57, 1.18, sz] });
  for (const x of [0.2, 0.95]) b.part(new THREE.BoxGeometry(0.03, 0.26, 0.1), WOOD, { at: [x, 1.05, sz - 0.0] });
  b.part(new THREE.BoxGeometry(0.5, 0.02, 0.1), "#8a5a38", { at: [0.57, 1.31, sz] });
  b.part(new THREE.BoxGeometry(0.5, 0.012, 0.1), BRASS, { at: [0.57, 1.335, sz] });
  const cols = ["#ff5fa2", "#5fd7ff", "#9dff6a", "#ffd34f", "#b07bff", "#ff8a5c"];
  cols.forEach((c, i) => {
    const x = 0.36 + i * 0.075;
    cyl(0.022, 0.022, 0.1, 8, GLASS, x, 1.4, sz);
    cyl(0.018, 0.018, 0.075, 8, c, x, 1.39, sz);
    cyl(0.017, 0.02, 0.025, 8, CORK, x, 1.462, sz);
    cyl(0.024, 0.024, 0.008, 8, BRASS, x, 1.44, sz);
  });
  // Shelf bottles
  bottle(0.28, -0.3, 0.0001, 0, "#fff", LABEL);
  for (const [x, c] of [[0.3, "#9dff6a"], [0.85, "#5fd7ff"], [0.95, "#ff5fa2"]] as [number, string][]) {
    sph(0.04, GLASS, x, 1.22 + 0.0, sz);
    sph(0.034, c, x, 1.22, sz);
    cyl(0.012, 0.016, 0.04, 8, GLASS, x, 1.275, sz);
    cyl(0.012, 0.014, 0.02, 8, CORK, x, 1.305, sz);
  }
  // Sparkles
  for (const [x, y, z] of [[0.9, 1.3, 0.2], [0.62, 1.2, 0.18], [0.78, 1.15, -0.1]])
    b.part(new THREE.OctahedronGeometry(0.012), "#fff6b0", { at: [x, y, z] });
  void frame;
}
```
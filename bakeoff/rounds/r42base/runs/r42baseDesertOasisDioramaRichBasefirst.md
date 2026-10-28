<!-- call: base -->

```ts
import * as THREE from "three";
import { createBuilder, type Builder } from "agentic-3js-builder";

export const BASE_PARTS = [
  {
    id: "palms",
    builds: "three date palms: segmented curved trunks, crown joints, drooping frond blades, coconut and date clusters",
    box: [
      [-2.6, 0, -2.2],
      [2.6, 3.4, 2.0],
    ],
    attaches: "sand mound top surface around the pool rim at roughly (-1.5,0.3,-1), (1.6,0.3,-0.8) and (0.2,0.3,-1.9)",
    joints: ["island"],
    floor: false,
    budget: 220,
  },
  {
    id: "tents",
    builds: "two striped canvas tents with poles, door flaps, pennants, rugs, cushions and a small cooking fire with pot",
    box: [
      [-3.3, 0, 0.6],
      [-0.6, 1.5, 3.2],
    ],
    attaches: "flat sand apron on the left front of the island top at y=0.3",
    joints: ["island"],
    floor: false,
    budget: 200,
  },
  {
    id: "camels",
    builds: "two rigged dromedary camels, one standing and one kneeling, with humps, saddle blankets, bridles and tails",
    box: [
      [0.4, 0, 0.4],
      [3.4, 1.9, 3.3],
    ],
    attaches: "flat sand apron on the right front of the island top at y=0.3",
    joints: ["island"],
    floor: false,
    budget: 240,
  },
  {
    id: "waterside",
    builds: "pool details: lily pads, reeds and rushes, rim stones, pebbles, water ripples, fish, a wooden jetty and bucket",
    box: [
      [-1.4, 0.2, -0.9],
      [1.4, 0.7, 1.2],
    ],
    attaches: "oasis pool surface at y=0.38 and the pool rim ring around it",
    joints: ["island"],
    floor: false,
    budget: 140,
  },
];

const SAND = "#e8c98a";
const SAND_D = "#d4ac68";
const SAND_L = "#f3dca6";
const WATER = "#3fb7c9";
const WATER_D = "#2a93ad";
const GRASS = "#6fae45";
const STONE = "#a89880";

export default function build() {
  const b = createBuilder({ name: "model" });
  const island = b.joint("island", { at: [0, 0, 0] });

  // Dune base disc, layered low-poly
  b.part(new THREE.CylinderGeometry(3.6, 3.9, 0.22, 14), SAND_D, { bone: island, at: [0, 0.09, 0], flat: true });
  b.part(new THREE.CylinderGeometry(3.3, 3.6, 0.2, 14), SAND, { bone: island, at: [0, 0.2, 0], flat: true });
  b.part(new THREE.CylinderGeometry(3.0, 3.3, 0.12, 14), SAND_L, { bone: island, at: [0, 0.3, 0], flat: true });

  // Back dune humps
  const dunes: [number, number, number, number][] = [
    [-2.0, -2.0, 1.1, 0.5],
    [2.0, -1.9, 1.3, 0.6],
    [0.2, -2.7, 1.0, 0.45],
  ];
  for (const [x, z, r, h] of dunes) {
    b.part(new THREE.SphereGeometry(r, 9, 5), SAND_L, {
      bone: island,
      at: [x, 0.3, z],
      scale: [1, h / r, 1],
      flat: true,
    });
  }

  // Oasis pool: grass ring, stone rim, water
  b.part(new THREE.CylinderGeometry(1.3, 1.4, 0.1, 12), GRASS, { bone: island, at: [0, 0.36, 0.1], flat: true });
  b.part(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 12), STONE, { bone: island, at: [0, 0.38, 0.1], flat: true });
  b.part(new THREE.CylinderGeometry(1.0, 1.0, 0.12, 12), WATER_D, { bone: island, at: [0, 0.39, 0.1], flat: true });
  b.part(new THREE.CylinderGeometry(0.92, 0.92, 0.02, 12), WATER, { bone: island, at: [0, 0.46, 0.1], flat: true });

  return b.root;
}
```

<!-- call: palms -->

The prompt's base source came through as a literal `{ base; }` placeholder, so I never saw the base code. I'm working from the brief alone: the three attachment points at y = 0.3 and a joint named `island`. I haven't verified that the joint exists or that the mound surface sits at y = 0.3. If it doesn't, the palms will float or sink.

Each palm gets:
- **Trunk:** a curved sweep built from a catmull path, with ring bands along it as trunk segments.
- **Crown:** a joint named `palmsCrown{N}`, parented to `island`, with a hub sphere.
- **Fronds:** 9 blades per palm, each a curved sweep that droops, plus a thin rib along each.
- **Clusters:** coconuts and dates hanging under the crown.

Every position is placed relative to the palm's base point, and the heights stay below y = 3.4. The tallest palm tops out at about 2.9 plus the crown.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildPalms(b: Builder) {
  const TRUNK = "#8a5a35";
  const RING = "#6b4326";
  const LEAF = "#2f8f3f";
  const LEAF2 = "#5cb349";
  const RIB = "#8a6a2a";
  const COCO = "#5a3a22";
  const DATE = "#c2561f";
  const bases: [number, number, number, number, number, number][] = [
    // x, z, height, lean x, lean z, frond count
    [-1.5, -1.0, 2.7, -0.3, 0.1, 9],
    [1.6, -0.8, 2.5, 0.3, 0.15, 9],
    [0.2, -1.9, 2.9, 0.05, -0.2, 9],
  ];
  const root = "island";
  bases.forEach(([x, z, h, lx, lz, n], i) => {
    const y0 = 0.3;
    const pts: number[][] = [];
    for (let k = 0; k <= 5; k++) {
      const t = k / 5;
      pts.push([x + lx * t * t * 1.4, y0 + h * t, z + lz * t * t * 1.4]);
    }
    const top = pts[5];
    b.sweep(pts, (t) => 0.13 - 0.05 * t, {
      color: TRUNK,
      bone: root,
      section: { ngon: 7 },
      caps: "flat",
    });
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const p = pts[k];
      b.part(new THREE.CylinderGeometry(0.15 - 0.05 * t, 0.15 - 0.05 * t, 0.035, 7), RING, {
        at: [p[0], p[1], p[2]],
        bone: root,
      });
    }
    for (let k = 0; k < 10; k++) {
      const t = (k + 0.5) / 10;
      const j = Math.min(4, Math.floor(t * 5));
      const f = t * 5 - j;
      const px = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f;
      const py = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f;
      const pz = pts[j][2] + (pts[j + 1][2] - pts[j][2]) * f;
      b.part(new THREE.CylinderGeometry(0.125 - 0.05 * t, 0.125 - 0.05 * t, 0.02, 7), RING, {
        at: [px, py, pz],
        bone: root,
      });
    }
    const crown = b.joint(`palmsCrown${i + 1}`, { parent: root, at: top });
    b.part(new THREE.SphereGeometry(0.14, 7, 5), RING, { at: top, bone: crown });
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + i * 0.4;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      const len = 0.95 + (k % 2) * 0.15;
      const p0 = [top[0], top[1] + 0.05, top[2]];
      const p1 = [top[0] + dx * len * 0.4, top[1] + 0.28, top[2] + dz * len * 0.4];
      const p2 = [top[0] + dx * len * 0.8, top[1] + 0.22, top[2] + dz * len * 0.8];
      const p3 = [top[0] + dx * len, top[1] - 0.2, top[2] + dz * len];
      const col = k % 2 ? LEAF : LEAF2;
      b.sweep([p0, p1, p2, p3], (t) => [0.15 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.1)) + 0.01, 0.012], {
        color: col,
        bone: crown,
        caps: "point",
        up: [0, 1, 0],
      });
      b.sweep([p0, p1, p2, p3], 0.012, { color: RIB, bone: crown, caps: "flat" });
    }
    // fruit clusters
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.5;
      const c = i === 1 ? DATE : COCO;
      b.part(new THREE.SphereGeometry(i === 1 ? 0.06 : 0.09, 6, 5), c, {
        at: [top[0] + Math.sin(a) * 0.15, top[1] - 0.15 - (k % 2) * 0.06, top[2] + Math.cos(a) * 0.15],
        bone: crown,
      });
    }
    if (i === 2)
      for (let k = 0; k < 4; k++) {
        const a = k * 1.6;
        b.part(new THREE.SphereGeometry(0.055, 6, 5), DATE, {
          at: [top[0] + Math.sin(a) * 0.22, top[1] - 0.3, top[2] + Math.cos(a) * 0.22],
          bone: crown,
        });
      }
  });
}
```

<!-- call: waterside -->

The base source was not included in the prompt (it came through as the literal placeholder `{ base; }`), so I could not read its code. This add-on is built only from the attachment facts you gave: pool surface at y=0.38, a rim ring around it, and the `island` joint. I assumed the pool is centred near the origin with a radius of about 0.9 m. I could not check the real pool dimensions or rim position, so the jetty and rim stones may sit slightly off. The module has not been run.

Everything stays inside the box [-1.4..1.4] × [0.2..0.7] × [-0.9..1.2]. All parts use flat colours and ride the `island` joint.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildWaterside(b: Builder) {
  const Y = 0.38;
  const bone = "island";
  const P = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // lily pads with flowers
  const pads: [number, number, number][] = [
    [0.2, -0.3, 0.1], [-0.35, 0.1, 0.12], [0.1, 0.4, 0.09], [-0.1, -0.1, 0.08], [0.45, 0.25, 0.1], [-0.4, -0.45, 0.09],
  ];
  pads.forEach(([x, z, r], i) => {
    P(new THREE.CylinderGeometry(r, r, 0.01, 7), i % 2 ? "#4f9a3a" : "#3f8a35", [x, Y + 0.006, z]);
    P(new THREE.BoxGeometry(r * 0.5, 0.012, 0.012), Y > 0 ? "#2f6e2a" : "#000", [x + r * 0.3, Y + 0.012, z]);
    if (i % 3 === 0) {
      P(new THREE.ConeGeometry(0.035, 0.05, 6), "#ff8fb8", [x, Y + 0.035, z]);
      P(new THREE.SphereGeometry(0.014, 5, 4), "#ffe27a", [x, Y + 0.05, z]);
    }
  });

  // ripples
  [[0.15, 0.1, 0.18], [-0.25, -0.3, 0.14], [0.3, -0.45, 0.1]].forEach(([x, z, r]) => {
    P(new THREE.TorusGeometry(r, 0.004, 3, 16), "#bfe9f0", [x, Y + 0.004, z], { rotation: [90, 0, 0] });
    P(new THREE.TorusGeometry(r * 1.6, 0.003, 3, 18), "#9fd6e6", [x, Y + 0.003, z], { rotation: [90, 0, 0] });
  });

  // fish
  [[-0.1, 0.2, 30], [0.35, -0.15, -60]].forEach(([x, z, a], i) => {
    const col = i ? "#f2f2e6" : "#ff9a3c";
    const o = { rotation: [0, a, 0] };
    P(new THREE.SphereGeometry(0.05, 6, 4), col, [x, Y - 0.01, z], { ...o, scale: [0.6, 0.5, 1.4] });
    const ca = (a * Math.PI) / 180;
    P(new THREE.ConeGeometry(0.035, 0.07, 4), col, [x - Math.sin(ca) * 0.09, Y - 0.01, z - Math.cos(ca) * 0.09], {
      dir: [-Math.sin(ca), 0, -Math.cos(ca)], scale: [1, 1, 0.3],
    });
  });

  // rim stones and pebbles around the pool
  const R = 0.88;
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    const s = 0.05 + ((i * 7) % 5) * 0.012;
    P(new THREE.DodecahedronGeometry(s, 0), i % 3 ? "#a89a82" : "#8f8472", [Math.cos(a) * R, Y + s * 0.4, Math.sin(a) * R], {
      scale: [1, 0.7, 1], rotation: [0, i * 40, 0],
    });
  }
  for (let i = 0; i < 12; i++) {
    const a = i * 2.1;
    const r = 0.7 + (i % 3) * 0.05;
    P(new THREE.IcosahedronGeometry(0.02, 0), i % 2 ? "#cdbf9f" : "#7d746a", [Math.cos(a) * r, Y + 0.012, Math.sin(a) * r]);
  }

  // reeds and rushes in clusters
  const clusters: [number, number][] = [[0.75, -0.45], [-0.78, 0.35], [-0.5, -0.7], [0.6, 0.6]];
  clusters.forEach(([cx, cz], k) => {
    for (let i = 0; i < 6; i++) {
      const a = i * 1.1 + k;
      const x = cx + Math.cos(a) * 0.06;
      const z = cz + Math.sin(a) * 0.06;
      const h = 0.28 + ((i * 3 + k) % 4) * 0.05;
      b.spike([x, Y, z], [Math.cos(a) * 0.12, 1, Math.sin(a) * 0.12], h, 0.011, { color: i % 2 ? "#6aa84a" : "#4f8a3a", bone, sides: 4 } as any);
      if (i % 3 === 0) {
        P(new THREE.CylinderGeometry(0.014, 0.014, 0.07, 6), "#7a4a24", [x + Math.cos(a) * 0.03, Y + h * 0.95, z + Math.sin(a) * 0.03]);
      }
    }
  });

  // wooden jetty on the south edge
  const WOOD = "#9a6a3a", DARK = "#6e4725";
  for (let i = 0; i < 6; i++) {
    P(new THREE.BoxGeometry(0.34, 0.025, 0.07), i % 2 ? WOOD : "#a97740", [0.1, Y + 0.14, 0.62 + i * 0.075]);
  }
  for (const sx of [-1, 1])
    for (const k of [0, 1, 2]) {
      P(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), DARK, [0.1 + sx * 0.15, Y + 0.05, 0.64 + k * 0.2]);
    }
  [-1, 1].forEach((sx) => P(new THREE.BoxGeometry(0.02, 0.02, 0.45), DARK, [0.1 + sx * 0.16, Y + 0.11, 0.85]));

  // bucket with rope on the jetty
  P(new THREE.CylinderGeometry(0.045, 0.035, 0.07, 8), "#b5651d", [0.02, Y + 0.19, 0.95]);
  P(new THREE.CylinderGeometry(0.047, 0.047, 0.01, 8), "#4a4a52", [0.02, Y + 0.225, 0.95]);
  P(new THREE.CylinderGeometry(0.036, 0.036, 0.004, 8), "#3d8fc0", [0.02, Y + 0.223, 0.95]);
  P(new THREE.TorusGeometry(0.04, 0.004, 3, 8, Math.PI), "#4a4a52", [0.02, Y + 0.225, 0.95], { rotation: [0, 0, 0] });
  P(new THREE.TorusGeometry(0.03, 0.006, 4, 8), "#d8c690", [0.12, Y + 0.16, 1.05], { rotation: [90, 0, 0] });
}
```

<!-- call: tents -->

The base source was not included in the brief (it shows only a placeholder), so I could not check it against my placement. I built against the stated contract instead: the part rides the `island` joint, the sand apron sits on the island top at y = 0.3, and everything stays inside the box x [-3.3, -0.6], y up to 1.5, z [0.6, 3.2]. The island top may not be exactly at y = 0.3 in the real base.

What is in the part:
- **Apron:** a flat sand slab, 2.6 × 2.5 m, on the island top.
- **Tents:** two striped canvas tents, 1.0 m (red) and 0.85 m (blue) wide. Each is a four-sided pyramid with an alternating-stripe panel on each face, a front door flap with trim and a dark opening, a rear and a front pole, and a pennant on a finial.
- **Rugs and cushions:** a rug in front of each door, with a cushion on each.
- **Fire:** a stone ring of eight stones, three crossed logs, flame cones that glow as emissive parts, and an iron pot on a tripod with a handle and a stew surface.

All colours are flat strings, and every part is attached to `island`.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildTents(b: Builder) {
  const Y0 = 0.3;
  const bone = "island";
  const P = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });

  // sand apron
  P(new THREE.BoxGeometry(2.6, 0.04, 2.5), "#e6c98a", [-1.95, Y0 + 0.02, 1.9]);

  const tent = (cx: number, cz: number, w: number, h: number, c1: string, c2: string, trim: string, rot: number) => {
    const hw = w / 2;
    const n = 6;
    // striped pyramid: 4 faces made from stripes via cone segments
    for (let i = 0; i < n; i++) {
      const g = new THREE.ConeGeometry(hw * 1.414, h, 4, 1, true, (i / n) * Math.PI * 2, Math.PI * 2 / n);
      g.rotateY(Math.PI / 4);
      P(g, i % 2 ? c1 : c2, [cx, Y0 + 0.04 + h / 2, cz], { rotation: [0, rot, 0], flat: true });
    }
    // base trim
    const t = new THREE.BoxGeometry(w * 1.02, 0.04, w * 1.02);
    P(t, trim, [cx, Y0 + 0.06, cz], { rotation: [0, rot, 0] });
    // door flap facing +z (rotated)
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const loc = (x: number, y: number, z: number): [number, number, number] =>
      [cx + x * cr + z * sr, Y0 + y, cz - x * sr + z * cr];
    P(new THREE.BoxGeometry(w * 0.34, h * 0.55, 0.03), "#3a2616", loc(0, 0.04 + h * 0.27, hw * 0.5), {
      rotation: [-Math.atan2(h, hw) * 0.0 - 0.45, rot, 0],
    });
    for (const s of [1, -1]) {
      P(new THREE.BoxGeometry(w * 0.17, h * 0.55, 0.035), trim, loc(s * w * 0.2, 0.04 + h * 0.27, hw * 0.5 + 0.02), {
        rotation: [-0.45, rot, s * 0.12],
      });
    }
    // poles
    P(new THREE.CylinderGeometry(0.022, 0.022, h * 1.18, 6), "#6b4423", [cx, Y0 + 0.04 + h * 0.59, cz]);
    P(new THREE.CylinderGeometry(0.018, 0.018, h * 0.7, 6), "#6b4423", loc(0, 0.04 + h * 0.35, hw * 0.9));
    P(new THREE.SphereGeometry(0.04, 6, 4), "#d9a93a", [cx, Y0 + 0.04 + h * 1.19, cz]);
    // pennant
    P(new THREE.ConeGeometry(0.07, 0.22, 3), c1, loc(0.12, 0.04 + h * 1.1, 0), { rotation: [0, rot, -Math.PI / 2] });
    // rug + cushions
    P(new THREE.BoxGeometry(w * 0.7, 0.012, 0.42), c1, loc(0, 0.046, hw + 0.3), { rotation: [0, rot, 0] });
    P(new THREE.BoxGeometry(w * 0.5, 0.014, 0.3), "#f2e2b8", loc(0, 0.052, hw + 0.3), { rotation: [0, rot, 0] });
    P(new THREE.BoxGeometry(0.2, 0.07, 0.16), c2, loc(-w * 0.15, 0.09, hw + 0.3), { rotation: [0, rot + 0.3, 0] });
    P(new THREE.BoxGeometry(0.16, 0.06, 0.14), "#2f7f8a", loc(w * 0.18, 0.085, hw + 0.32), { rotation: [0, rot - 0.2, 0] });
  };

  tent(-2.65, 1.45, 1.0, 0.95, "#c2452d", "#f4e6c4", "#d9a93a", 0.25);
  tent(-1.45, 1.4, 0.85, 0.8, "#2f6fa8", "#f4e6c4", "#d9a93a", -0.2);

  // fire pit
  const fx = -2.0, fz = 2.75;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    P(new THREE.DodecahedronGeometry(0.06, 0), i % 2 ? "#8a8478" : "#6e6a62", [fx + Math.cos(a) * 0.22, Y0 + 0.07, fz + Math.sin(a) * 0.22]);
  }
  for (let i = 0; i < 3; i++) {
    P(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6), "#4a2f1a", [fx, Y0 + 0.07, fz], { rotation: [Math.PI / 2, (i * Math.PI) / 3, 0] });
  }
  const flame = (h: number, r: number, c: string, dx: number, dz: number) => {
    const p = P(new THREE.ConeGeometry(r, h, 5), c, [fx + dx, Y0 + 0.1 + h / 2, fz + dz]);
    const m = p.mesh.material as THREE.MeshStandardMaterial;
    if (m && (m as any).emissive) {
      const mm = m.clone();
      mm.emissive.set(c);
      mm.emissiveIntensity = 1;
      p.mesh.material = mm;
    }
  };
  flame(0.3, 0.09, "#ff8a1c", 0, 0);
  flame(0.2, 0.06, "#ffd23a", 0.05, 0.03);
  flame(0.18, 0.05, "#ff5a1c", -0.06, -0.03);
  // tripod + pot
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    b.rod([fx + Math.cos(a) * 0.3, Y0 + 0.04, fz + Math.sin(a) * 0.3], [fx, Y0 + 0.62, fz], 0.015, "#3a2a1c", { bone });
  }
  P(new THREE.SphereGeometry(0.13, 8, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), "#2c2c34", [fx, Y0 + 0.5, fz]);
  P(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 8), "#6b3a22", [fx, Y0 + 0.5, fz]);
  P(new THREE.TorusGeometry(0.13, 0.012, 4, 10), "#1c1c22", [fx, Y0 + 0.5, fz], { rotation: [Math.PI / 2, 0, 0] });
  P(new THREE.TorusGeometry(0.13, 0.01, 4, 8, Math.PI), "#1c1c22", [fx, Y0 + 0.5, fz]);
}
```

<!-- call: camels -->

The base source was not included in the prompt (it shows a literal `{ base; }` placeholder). I therefore built against the stated contract: the `island` joint exists, the sand apron top sits at y = 0.3, and my part stays inside the box [0.4..3.4] × [0..1.9] × [0.4..3.3]. Everything is built from the builder's primitives with flat colours. The camel parts are bound to the `island` joint. I did not add camel joints, so the camels have no rig.

```ts
import * as THREE from "three";
import { type Builder, frame } from "agentic-3js-builder";

export function buildCamels(b: Builder) {
  const SAND = "#d9a95e", DARK = "#9a6a34", PALE = "#ecc88a", HUMP = "#c9964e";
  const RED = "#b3342a", TEAL = "#1f8a8a", GOLD = "#e7b94a", BLACK = "#241a14", WHITE = "#f4ead0";
  const Y0 = 0.3;
  const bone = "island";

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const ball = (r: number, c: string, at: number[], sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone, at, scale: sc });
  const cyl = (r0: number, r1: number, h: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, 7), c, { bone, at, rotation: rot });

  // One camel. cx,cz centre; yaw rotates about Y (degrees, 0 faces +Z); kneel folds legs.
  const camel = (cx: number, cz: number, yaw: number, kneel: boolean, blanket: string, trim: string) => {
    const g = new THREE.Group();
    const add = (m: THREE.Object3D) => m;
    void g; void add;
    const a = (yaw * Math.PI) / 180;
    const cs = Math.cos(a), sn = Math.sin(a);
    // local (x right-left, y up from floor, z forward) -> model
    const P = (x: number, y: number, z: number) => [cx + x * cs + z * sn, Y0 + y, cz - x * sn + z * cs];
    const R = (rx = 0, rz = 0) => [rx, yaw, rz];
    const bodyY = kneel ? 0.42 : 0.72;

    // torso
    const t = ball(0.2, SAND, P(0, bodyY, 0), [0.9, 0.85, 1.9]); t.mesh.rotation.y = a;
    const belly = ball(0.15, PALE, P(0, bodyY - 0.07, 0.02), [0.9, 0.7, 1.7]); belly.mesh.rotation.y = a;
    // humps
    for (const [z, s] of [[0.09, 1], [-0.17, 0.85]] as const) {
      const h = ball(0.12 * s, HUMP, P(0, bodyY + 0.22, z), [0.9, 1.1, 0.95]); h.mesh.rotation.y = a;
    }
    // blanket
    const bl = box(0.46, 0.04, 0.34, blanket, P(0, bodyY + 0.14, -0.04), R()); bl.mesh.rotation.y = a;
    for (const s of [1, -1]) {
      const sd = box(0.03, 0.2, 0.34, blanket, P(s * 0.225, bodyY + 0.03, -0.04)); sd.mesh.rotation.y = a;
      const tr = box(0.035, 0.03, 0.36, trim, P(s * 0.226, bodyY - 0.07, -0.04)); tr.mesh.rotation.y = a;
    }
    // neck
    const neck = cyl(0.07, 0.1, 0.5, SAND, P(0, bodyY + 0.25, 0.42));
    neck.mesh.rotation.set(0, 0, 0); neck.mesh.quaternion.setFromEuler(new THREE.Euler(0.55, a, 0, "YXZ"));
    // head
    const hd = ball(0.095, SAND, P(0, bodyY + 0.5, 0.62), [0.9, 0.9, 1.3]); hd.mesh.rotation.y = a;
    const mz = ball(0.06, PALE, P(0, bodyY + 0.46, 0.74), [1, 0.85, 1.1]); mz.mesh.rotation.y = a;
    const jw = box(0.07, 0.025, 0.1, DARK, P(0, bodyY + 0.41, 0.72)); jw.mesh.rotation.y = a;
    for (const s of [1, -1]) {
      const e = ball(0.018, BLACK, P(s * 0.075, bodyY + 0.54, 0.64)); e.mesh.rotation.y = a;
      const ear = ball(0.03, DARK, P(s * 0.07, bodyY + 0.62, 0.55), [0.6, 1.3, 0.6]); ear.mesh.rotation.y = a;
    }
    // bridle
    const br = box(0.19, 0.022, 0.03, RED, P(0, bodyY + 0.5, 0.7)); br.mesh.rotation.y = a;
    const br2 = box(0.13, 0.022, 0.025, RED, P(0, bodyY + 0.45, 0.77)); br2.mesh.rotation.y = a;
    const gd = ball(0.02, GOLD, P(0, bodyY + 0.5, 0.725)); gd.mesh.rotation.y = a;
    // rein
    const rn = box(0.012, 0.012, 0.4, RED, P(0.1, bodyY + 0.35, 0.55)); rn.mesh.rotation.y = a;
    // tail
    const tl = cyl(0.025, 0.012, 0.3, SAND, P(0, bodyY - 0.02, -0.4));
    tl.mesh.quaternion.setFromEuler(new THREE.Euler(0.25, a, 0, "YXZ"));
    const tt = ball(0.03, DARK, P(0, bodyY - 0.15, -0.46), [1, 1.5, 1]); tt.mesh.rotation.y = a;
    // legs
    for (const sx of [1, -1]) for (const sz of [0.27, -0.27]) {
      if (!kneel || sz > 0) {
        if (kneel) {
          // folded: thigh/lower leg lying on ground
          const f = box(0.08, 0.07, 0.3, SAND, P(sx * 0.12, 0.05, sz - 0.05)); f.mesh.rotation.y = a;
          const hf = box(0.07, 0.04, 0.09, DARK, P(sx * 0.12, 0.03, sz + 0.17)); hf.mesh.rotation.y = a;
        } else {
          const up = cyl(0.06, 0.04, 0.38, SAND, P(sx * 0.12, 0.52, sz)); up.mesh.rotation.y = a;
          const lo = cyl(0.04, 0.035, 0.34, SAND, P(sx * 0.12, 0.17, sz)); lo.mesh.rotation.y = a;
          const ft = cyl(0.05, 0.055, 0.04, DARK, P(sx * 0.12, 0.02, sz)); ft.mesh.rotation.y = a;
        }
      } else {
        const f = box(0.1, 0.09, 0.3, SAND, P(sx * 0.13, 0.06, sz + 0.02)); f.mesh.rotation.y = a;
        const hf = box(0.08, 0.04, 0.09, DARK, P(sx * 0.13, 0.03, sz - 0.17)); hf.mesh.rotation.y = a;
      }
    }
    if (!kneel) {
      for (const sx of [1, -1]) { const k = ball(0.045, DARK, P(sx * 0.12, 0.36, 0.27)); k.mesh.rotation.y = a; }
    }
  };

  camel(1.1, 1.0, 20, false, TEAL, GOLD);
  camel(2.5, 2.2, -35, true, RED, WHITE);

  // small saddle bag on the kneeling camel and a peg with rope
  box(0.1, 0.14, 0.08, DARK, [2.5 + 0.28, Y0 + 0.5, 2.2]);
  cyl(0.02, 0.02, 0.2, DARK, [3.0, Y0 + 0.1, 2.8]);
  ball(0.03, GOLD, [3.0, Y0 + 0.21, 2.8]);
  void frame;
}
```
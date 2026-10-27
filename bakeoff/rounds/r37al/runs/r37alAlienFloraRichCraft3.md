```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  spiral,
  paint,
  mottle,
  countershade,
  svg,
  rng,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with a faceted violet trunk, luminous cyan veins, broad alien leaves, hanging seed pods, tendrils, and a glowing crown flower.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const INK = "#130d31";
  const ROOT = "#241338";
  const ROOT_LIT = "#542969";
  const VIOLET = "#633692";
  const VIOLET_DARK = "#27143f";
  const TEAL = "#22d8c7";
  const AQUA = "#65fff0";
  const MINT = "#b4fff0";
  const BLUE = "#3475c9";
  const MAGENTA = "#d447ca";
  const PINK = "#ff72d8";
  const POD = "#7a2c91";
  const POD_LIT = "#ed68dc";
  const GOLD = "#ffd36d";

  const plantMottle = mottle(ROOT, ROOT_LIT, {
    size: 0.16,
    contrast: 1.35,
    seed: 19,
  });
  const stemPaint = countershade(
    mottle(VIOLET, ROOT_LIT, { size: 0.18, contrast: 1.25, seed: 8 }),
    VIOLET_DARK,
    { level: -0.05, soft: 0.28 },
  );
  const leafPaint = countershade(
    mottle("#167e89", "#32c8b1", { size: 0.13, contrast: 1.1, seed: 41 }),
    "#092d4b",
    { level: -0.1, soft: 0.3 },
  );
  const veinPaint = paint((p, n) => {
    const wave =
      Math.sin(p.x * 38 + p.z * 10) * 0.5 +
      Math.sin(p.z * 55 - p.y * 12) * 0.25;
    return n.y > 0.15 || wave > 0.4 ? AQUA : TEAL;
  });

  const veinTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" fill="#071e36"/>
      <path d="M64 128V18 M64 80L25 42 M64 65L104 31 M64 96L33 111 M64 50L88 9"
        fill="none" stroke="#65fff0" stroke-width="5" stroke-linecap="round"/>
      <path d="M64 110L51 94 M64 89L85 72 M64 70L43 57 M64 48L76 33"
        fill="none" stroke="#d1fff5" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="64" cy="17" r="5" fill="#d1fff5"/>
    </svg>`,
    { size: 256 },
  );

  const podTex = svg(
    `<svg viewBox="0 0 96 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="p"><stop stop-color="#fff5b0"/><stop offset=".35" stop-color="#ff6ee1"/><stop offset="1" stop-color="#54206f"/></radialGradient>
      </defs>
      <path d="M48 4 C76 18 86 48 73 79 C65 98 57 119 48 124 C39 119 31 98 23 79 C10 48 20 18 48 4Z" fill="url(#p)" stroke="#160b32" stroke-width="4"/>
      <path d="M48 13V112 M28 35Q48 47 68 35 M23 61Q48 75 73 61 M30 87Q48 96 66 87" fill="none" stroke="#bfffee" stroke-width="3" opacity=".9"/>
      <circle cx="42" cy="30" r="6" fill="#fffbd0"/>
    </svg>`,
    { size: 256 },
  );

  const flowerTex = svg(
    `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="f"><stop stop-color="#ffffff"/><stop offset=".25" stop-color="#7dfff0"/><stop offset=".7" stop-color="#3ecbd5"/><stop offset="1" stop-color="#172e83"/></radialGradient></defs>
      <path d="M80 80C21 74 10 39 27 20c18-20 45 2 53 42C88 22 120 0 139 20c19 20 0 54-48 60 47 5 66 35 48 59-18 25-51 3-59-42-8 45-42 67-59 42-17-24 1-54 59-59Z" fill="url(#f)" stroke="#9efff4" stroke-width="3"/>
      <circle cx="80" cy="80" r="19" fill="#fff6a8" stroke="#ff75d7" stroke-width="5"/>
      <circle cx="74" cy="73" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const rand = rng(27);

  // Low, knuckled root crown.
  const rootPaths = [
    catmull([[0, 0.07, 0], [0.16, 0.055, 0.04], [0.42, 0.035, 0.18], [0.67, 0.025, 0.34]]),
    catmull([[0, 0.07, 0], [-0.18, 0.05, 0.06], [-0.43, 0.028, 0.28], [-0.56, 0.018, 0.54]]),
    catmull([[0, 0.07, 0], [0.08, 0.045, -0.14], [0.22, 0.025, -0.41], [0.38, 0.016, -0.68]]),
    catmull([[0, 0.07, 0], [-0.13, 0.045, -0.12], [-0.3, 0.025, -0.39], [-0.2, 0.014, -0.7]]),
  ];
  for (const p of rootPaths) {
    b.sweep(p, (t) => 0.105 * (1 - t) + 0.012, {
      color: plantMottle,
      sides: 7,
      caps: "round",
      name: "glowing-root",
      group: "roots",
    });
  }

  // Main trunk, with an intentionally angular alien silhouette.
  const trunkPath = catmull([
    [0, 0.07, 0],
    [0.015, 0.42, -0.015],
    [-0.035, 0.86, 0.025],
    [0.045, 1.28, -0.02],
    [-0.02, 1.65, 0.04],
    [0.02, 2.02, 0],
  ]);
  const trunk = b.sweep(trunkPath, (t) => 0.17 - t * 0.075, {
    color: stemPaint,
    sides: 8,
    caps: "round",
    name: "faceted-luminous-trunk",
    group: "trunk",
  });

  // Raised luminous ribs embedded visually along the trunk.
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.1;
    const at = trunk.at(t, 35 + (i % 2) * 180, 0.004);
    const rib = b.sweep(
      bezier(
        at,
        at.moved([0.025, 0.035, 0]),
        at.moved([-0.015, 0.1, 0.005]),
        at.moved([0, 0.16, 0]),
      ),
      [0.012, 0.002],
      { color: TEAL, caps: "round", name: "trunk-vein", group: "luminescence" },
    );
    glow(rib, 1.7);
  }

  // Branches and their leaves.
  const branches = [
    { side: 1, base: [0.02, 0.72, 0.01] as [number, number, number], tip: [0.65, 1.1, 0.18] as [number, number, number], w: 0.085 },
    { side: -1, base: [-0.02, 0.9, 0.01] as [number, number, number], tip: [-0.7, 1.34, 0.1] as [number, number, number], w: 0.078 },
    { side: 1, base: [0.04, 1.18, 0.03] as [number, number, number], tip: [0.62, 1.7, -0.02] as [number, number, number], w: 0.07 },
    { side: -1, base: [-0.02, 1.42, 0.02] as [number, number, number], tip: [-0.62, 1.86, 0.04] as [number, number, number], w: 0.065 },
    { side: 1, base: [0, 1.7, 0.01] as [number, number, number], tip: [0.48, 2.05, 0.02] as [number, number, number], w: 0.052 },
    { side: -1, base: [0, 1.82, 0.02] as [number, number, number], tip: [-0.5, 2.18, 0.01] as [number, number, number], w: 0.048 },
  ];

  function leafAt(
    base: [number, number, number],
    tip: [number, number, number],
    width: number,
    flip: number,
  ) {
    const bx = new THREE.Vector3(...base);
    const tx = new THREE.Vector3(...tip);
    const d = tx.clone().sub(bx).normalize();
    const side = new THREE.Vector3(-d.z, 0.15, d.x).normalize().multiplyScalar(width * flip);
    const up = new THREE.Vector3(0, 0.18 + width * 0.5, 0);
    const mid = bx.clone().lerp(tx, 0.48).add(up);
    const left = bx.clone().add(side.multiplyScalar(0.32));
    const right = bx.clone().add(side.clone().multiplyScalar(-0.32));
    const farLeft = tx.clone().add(side.clone().multiplyScalar(0.28));
    const farRight = tx.clone().add(side.clone().multiplyScalar(-0.28));

    const leaf = b.slab(
      [bx, left, mid.clone().add(side.clone().multiplyScalar(0.55)), farLeft, tx, farRight, mid.clone().sub(side.clone().multiplyScalar(0.55)), right],
      { color: leafPaint, thickness: 0.014, name: "wide-alien-leaf", group: "foliage" },
    );

    const vein = b.sweep(
      catmull([bx, mid, tx]),
      [0.012, 0.004],
      { color: veinPaint, caps: "round", name: "leaf-central-vein", group: "leaf-veins" },
    );
    glow(vein, 1.8);

    const frames = [
      vein.at(0.3, 0, 0.006),
      vein.at(0.52, 0, 0.006),
      vein.at(0.72, 0, 0.006),
    ];
    b.cards(frames, veinTex, {
      size: [0.045, 0.12],
      lean: 78,
      bend: 15,
      color: AQUA,
      sink: 0.08,
      group: "leaf-vein-lights",
    });
    return leaf;
  }

  for (const branch of branches) {
    const base = new THREE.Vector3(...branch.base);
    const tip = new THREE.Vector3(...branch.tip);
    const branchPath = catmull([
      branch.base,
      base.clone().lerp(tip, 0.32).add(new THREE.Vector3(0, 0.08, 0)),
      base.clone().lerp(tip, 0.72).add(new THREE.Vector3(0, 0.13, 0)),
      branch.tip,
    ]);
    const stem = b.sweep(branchPath, [branch.w, 0.018], {
      color: stemPaint,
      sides: 7,
      caps: "round",
      name: "arching-branch",
      group: "branches",
    });
    glow(
      b.part(new THREE.SphereGeometry(branch.w * 1.12, 8, 6), ROOT_LIT, {
        at: branch.base,
        name: "branch-collar",
        group: "branches",
      }),
      0.25,
    );

    leafAt(
      [tip.x, tip.y, tip.z],
      [tip.x + branch.side * 0.42, tip.y + 0.15, tip.z + 0.1],
      0.19,
      branch.side,
    );
    leafAt(
      [tip.x, tip.y, tip.z],
      [tip.x - branch.side * 0.28, tip.y + 0.12, tip.z - 0.2],
      0.14,
      -branch.side,
    );

    // Small luminous beads along every branch.
    for (let j = 1; j < 4; j++) {
      const h = stem.at(j / 4, 0, 0.008);
      const bead = b.part(new THREE.SphereGeometry(0.026, 8, 6), AQUA, {
        at: h.at,
        name: "branch-phosphor-bead",
        group: "luminescence",
      });
      glow(bead, 2.4);
    }
  }

  // Hanging seed pods on long curved pedicels.
  const podLocations = [
    [0.63, 1.08, 0.18, 0.38, 0.72],
    [-0.7, 1.34, 0.1, -0.35, 0.78],
    [0.62, 1.7, -0.02, 0.3, 0.6],
    [-0.62, 1.86, 0.04, -0.3, 0.64],
    [0.34, 1.55, 0.12, 0.2, 0.52],
  ] as const;

  for (let i = 0; i < podLocations.length; i++) {
    const [x, y, z, dx, drop] = podLocations[i];
    const root = [x, y, z] as [number, number, number];
    const end = [x + dx, y - drop, z + (i % 2 ? -0.08 : 0.1)] as [number, number, number];
    const pedicel = b.sweep(
      catmull([root, [x + dx * 0.32, y - 0.12, z], [x + dx * 0.78, y - drop * 0.65, z], end]),
      [0.018, 0.006],
      { color: MAGENTA, caps: "round", name: "pod-stalk", group: "seed-pods" },
    );
    glow(pedicel, 1.2);

    const pod = b.part(new THREE.SphereGeometry(0.105, 10, 8), POD, {
      at: end,
      scale: [0.72, 1.55, 0.72],
      name: "luminous-seed-pod",
      group: "seed-pods",
      texture: podTex,
    });
    glow(pod, 1.8);

    const halo = b.part(new THREE.SphereGeometry(0.132, 8, 6), "#ff53d5", {
      at: [end[0], end[1] + 0.018, end[2]],
      scale: [0.2, 0.45, 0.2],
      name: "pod-core",
      group: "luminescence",
    });
    glow(halo, 2.8);
  }

  // Crown stalks and the central luminous flower.
  const crownStem = b.sweep(
    catmull([
      [0.02, 1.98, 0],
      [0.03, 2.18, 0.015],
      [-0.03, 2.34, 0],
      [0, 2.52, 0],
    ]),
    [0.06, 0.018],
    { color: stemPaint, sides: 7, name: "crown-stalk", group: "flower" },
  );

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const root = new THREE.Vector3(0, 2.38, 0);
    const tip = new THREE.Vector3(Math.sin(a) * 0.3, 2.53 + (i % 2) * 0.06, Math.cos(a) * 0.3);
    const petal = b.extrude(
      [
        [0, 0],
        [0.12, 0.03],
        [0.16, 0.16],
        [0.08, 0.31],
        [0, 0.37],
        [-0.08, 0.31],
        [-0.16, 0.16],
        [-0.12, 0.03],
      ],
      {
        at: root,
        x: [Math.cos(a), 0, -Math.sin(a)],
        y: [0, 1, 0],
        thickness: [0.018, 0.006],
        bevel: 0.008,
        smoothing: 1,
        color: "#3cd9d8",
        name: "crown-petal",
        group: "flower",
      },
    );
    glow(petal, 1.7);
  }

  const flowerCard = b.cards(
    [b.sweep(crownStem.path, 0.02, { color: AQUA, caps: "round", name: "flower-light-stem" }).at(1, 0, 0.02)],
    flowerTex,
    { size: [0.5, 0.5], lean: 0, color: AQUA, group: "flower-glow" },
  );
  glow(flowerCard, 2.5);

  // Orbital tendrils around the trunk, like floating bioluminescent vines.
  for (let s = -1; s <= 1; s += 2) {
    const coilPath = spiral(
      [s * 0.02, 1.05, 0],
      [s * 0.22, 1.05, 0],
      [0, 0.42, 0],
      { turns: s * 1.25, r1: 0.13, pitch: 0.42 },
    );
    const tendril = b.sweep(coilPath, [0.018, 0.006], {
      color: TEAL,
      sides: 6,
      caps: "round",
      name: s > 0 ? "tendril-left" : "tendril-right",
      group: "tendrils",
    });
    glow(tendril, 2.2);
  }

  // A few floating-looking (but physically attached) luminous nodes at the root crown.
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.13 + rand() * 0.32;
    const node = b.part(new THREE.SphereGeometry(0.018 + rand() * 0.012, 7, 5), MINT, {
      at: [Math.cos(a) * r, 0.09 + rand() * 0.035, Math.sin(a) * r],
      name: "root-biophoton",
      group: "luminescence",
    });
    glow(node, 2.6);
  }

  // One thick base plate keeps the plant visually grounded without adding scenery.
  const base = b.part(
    new THREE.CylinderGeometry(0.28, 0.39, 0.075, 9),
    plantMottle,
    { at: [0, 0.037, 0], name: "root-crown-base", group: "roots" },
  );
  glow(base, 0.15);

  return b.root;
}
```
```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, spiral } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Pandoran Lumen Bloom",
  description:
    "Bioluminescent alien plant in the Avatar style: a tall indigo trunk with glowing rings, two tiers of drooping veined fronds, a magenta bell flower with glowing stamens, root bulbs and helicoradian spirals.",
};

export const REQUESTS = [
  {
    id: "bellStamens",
    kind: "add",
    part: "bell",
    what: "Dense cluster of fine glowing filaments rising from the bell's centre, each tipped with a small MAG or CYAN bead, plus a soft ring of tiny pollen dots on the inner rim.",
    at: [0, 1.75, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.3, 0.3, 0.3],
  },
  {
    id: "bellPetalTrim",
    kind: "add",
    part: "bell",
    what: "Eight small curled petal lips around the bell rim in BELL_IN, with a thin glowing CYAN edge line on each.",
    at: [0, 1.9, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.5, 0.15, 0.5],
  },
  {
    id: "trunkBarkRidges",
    kind: "add",
    part: "trunk",
    what: "Vertical raised bark ridges and small knobbly nodes on the trunk in TRUNK_LIGHT, leaving the glow rings visible.",
    at: [0, 0.8, 0.12],
    normal: [0, 0, 1],
    bone: null,
    room: [0.35, 1.2, 0.2],
  },
  {
    id: "frondHangingTendrils",
    kind: "add",
    part: "frondLower",
    what: "Thin tendrils hanging from the tips of the lower fronds, each with three glowing GLOW_GREEN beads of falling size.",
    at: [1.35, 0.95, 0],
    normal: [0, -1, 0],
    bone: null,
    room: [0.4, 0.7, 0.4],
  },
  {
    id: "frondSideLobes",
    kind: "add",
    part: "frondUpper",
    what: "Small serrated side lobes along the edges of the upper fronds, graduating in size, in FROND_A with FROND_B tips.",
    at: [0.6, 1.95, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.8, 0.2, 0.5],
  },
  {
    id: "rootBulbs",
    kind: "add",
    part: "root",
    what: "Clusters of small translucent glowing bulbs and little fungal caps along the roots near the ground, in CYAN and GLOW_GREEN.",
    at: [0.5, 0.05, 0.3],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.15, 0.6],
  },
  {
    id: "spiralSeedPods",
    kind: "add",
    part: "helix",
    what: "Tiny feathery seed filaments fanning from the tip of each helicoradian spiral, in pale PINK_WHITE, each ending with a glow dot.",
    at: [0.9, 0.2, 0.2],
    normal: [0, 1, 0],
    bone: null,
    room: [0.3, 0.3, 0.3],
  },
  {
    id: "baseMoss",
    kind: "add",
    part: "trunk",
    what: "Low glowing moss and small leaf sprouts hugging the trunk base where roots meet, in GLOW_GREEN and ROOT tones.",
    at: [0, 0.1, 0],
    normal: [0, 1, 0],
    bone: null,
    room: [0.6, 0.2, 0.6],
  },
  {
    id: "trunkBands",
    kind: "texture",
    part: "trunk",
    what: "Layered bioluminescent pattern: flowing wavy lines of CYAN and faint MAG running up the trunk like Pandoran veins, with fine speckles, on a TRUNK to TRUNK_LIGHT gradient.",
  },
  {
    id: "frondVeins",
    kind: "texture",
    part: "frondUpper",
    what: "Branching leaf veins glowing CYAN from the midrib outward, with FROND_A to FROND_B gradient toward the tips and tiny light freckles.",
  },
  {
    id: "bellGradient",
    kind: "texture",
    part: "bell",
    what: "Soft radial gradient from BELL_IN at the rim to BELL at the base, with thin MAG streaks running up the petal walls.",
  },
];

export const STAGE2: ((b: Builder) => void)[] = [];

// Palette
export const TRUNK = "#2a2a5e";
export const TRUNK_LIGHT = "#3f4f98";
export const FROND_A = "#1f7f86";
export const FROND_B = "#7a3fb0";
export const CYAN = "#3ff2ff";
export const MAG = "#ff4fd8";
export const GLOW_GREEN = "#7dffb0";
export const ROOT = "#241f4a";
export const BELL = "#a24bd6";
export const BELL_IN = "#ff9be8";
export const PINK_WHITE = "#ffe6f7";

const pt = (r: number, y: number, a: number): [number, number, number] => [Math.cos(a) * r, y, Math.sin(a) * r];

export default function build() {
  const b = createBuilder({ name: "lumenBloom" });
  const R = rng(11);
  const orb = (p: number[], r: number, color: string, s = 1.2) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p as [number, number, number] }), s);

  // Trunk
  const rad = (t: number) => 0.2 - 0.14 * t + 0.02 * Math.sin(t * 9);
  const trunkPath = catmull([
    [0, 0, 0],
    [0.05, 0.5, 0.03],
    [-0.04, 1.1, -0.02],
    [0, 1.62, 0.03],
  ]);
  const trunk = b.sweep(trunkPath, rad, { color: TRUNK, caps: { start: "flat", end: "round" }, sides: 10, name: "trunk" });

  // Glow rings
  for (let i = 1; i <= 6; i++) {
    const t = i / 7.4;
    const p = trunkPath.at(t);
    const d = trunkPath.tangentAt(t);
    glow(
      b.part(new THREE.TorusGeometry(rad(t) + 0.004, 0.011, 5, 14), i % 2 ? CYAN : GLOW_GREEN, {
        at: [p.x, p.y, p.z],
        dir: [d.x, d.y, d.z],
        axis: "z",
      }),
      1.3,
    );
  }
  // Glowing trunk spots
  const hits = b.surface(trunk).scatter(28, { rng: R, minDist: 0.09, filter: (h) => h.at.y > 0.15 });
  for (const h of hits) glow(b.stick(new THREE.SphereGeometry(0.018, 6, 4), R() > 0.5 ? CYAN : MAG, h, { embed: 0.4 }), 1.3);

  // Roots
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const len = 0.6 + R() * 0.25;
    const path = bezier(pt(0.05, 0.25, a), pt(len * 0.35, 0.28, a + 0.1), pt(len * 0.7, 0.2, a - 0.15), pt(len, 0.022, a));
    b.sweep(path, [0.09, 0.022], { color: ROOT, caps: { start: "none", end: "round" }, sides: 8, name: "root" });
    orb(pt(len * 0.62, 0.05, a + 0.05), 0.03 + R() * 0.02, i % 2 ? CYAN : GLOW_GREEN, 1.2);
  }

  // Fronds: two tiers
  const frond = (ring: number, y0: number, a: number, p1: number[], p2: number[], p3: number[], w: number, name: string, c1: string, c2: string) => {
    const path = bezier(pt(0.04, y0, a), p1 as any, p2 as any, p3 as any);
    b.sweep(path, (t) => [0.015 + w * Math.sin(Math.PI * Math.min(1, t * 1.04)), 0.012], {
      color: (t) => (t < 0.55 ? c1 : c2),
      caps: { end: "point" },
      sides: 6,
      name,
    });
    const vein = bezier(
      pt(0.04, y0 + 0.016, a),
      [p1[0], p1[1] + 0.016, p1[2]],
      [p2[0], p2[1] + 0.016, p2[2]],
      [p3[0], p3[1] + 0.016, p3[2]],
    );
    glow(b.sweep(vein.slice(0.1, 0.95), [0.009, 0.004], { color: CYAN, sides: 4, name: "vein" }), 1.2);
    orb(p3, 0.028, ring % 2 ? MAG : CYAN, 1.5);
  };
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    frond(i, 1.52, a, pt(0.35, 2.0, a), pt(0.8, 2.05, a + 0.05), pt(1.1, 1.55, a + 0.1), 0.1, "frondUpper", FROND_A, FROND_B);
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.45;
    frond(i, 1.15, a, pt(0.5, 1.5, a), pt(1.0, 1.45, a - 0.05), pt(1.35, 0.95, a - 0.1), 0.13, "frondLower", FROND_B, FROND_A);
  }

  // Bell flower
  glow(
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.12, 0.1],
        [0.2, 0.26],
        [0.23, 0.31],
        [0.19, 0.3],
        [0.1, 0.16],
        [0.05, 0.06],
        [0, 0.05],
      ],
      { at: [0, 1.6, 0.03], color: BELL, segments: 10, name: "bell" },
    ),
    0.25,
  );
  b.lathe(
    [
      [0, 0],
      [0.22, 0],
      [0.22, 0.012],
      [0, 0.012],
    ],
    { at: [0, 1.905, 0.03], color: BELL_IN, segments: 10, name: "bellRim" },
  );
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const top = [Math.cos(a) * 0.09, 2.08 + (i % 2) * 0.08, 0.03 + Math.sin(a) * 0.09];
    b.sweep([[0, 1.7, 0.03], [Math.cos(a) * 0.04, 1.9, 0.03 + Math.sin(a) * 0.04], top], 0.008, { color: BELL_IN, sides: 5, name: "stamen" });
    orb(top, 0.026, i % 2 ? MAG : CYAN, 1.6);
  }
  orb([0, 1.82, 0.03], 0.07, GLOW_GREEN, 1.5);

  // Helicoradian spirals
  for (let i = 0; i < 4; i++) {
    const a = 0.8 + i * 1.5;
    const c = pt(0.95 + R() * 0.25, 0.012, a);
    const from = [c[0] + 0.05, 0.012, c[2]];
    const path = spiral(c, from, [0, 1, 0], { turns: 2.2, r1: 0.012, pitch: 0.09 });
    b.sweep(path, [0.014, 0.006], { color: PINK_WHITE, sides: 5, name: "helix" });
    const e = path.at(1);
    orb([e.x, e.y + 0.01, e.z], 0.016, MAG, 1.5);
  }

  // Ground glow bulbs
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28;
    const r = 0.5 + R() * 1.0;
    const s = 0.025 + R() * 0.03;
    orb(pt(r, s * 0.9, a), s, R() > 0.5 ? GLOW_GREEN : CYAN, 1.1);
  }
  // Floating spores
  for (let i = 0; i < 8; i++) orb(pt(0.3 + R() * 1.0, 0.7 + R() * 1.6, R() * 6.28), 0.014, GLOW_GREEN, 1.6);

  for (const add of STAGE2) add(b);
  return b.root;
}
```
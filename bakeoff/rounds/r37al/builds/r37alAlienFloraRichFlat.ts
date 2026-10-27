import * as THREE from "three";
import { createBuilder, catmull, polyline, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "bioluminescent alien plant",
  description: "A stylized Avatar-inspired alien plant with luminous tendrils, broad violet leaves, glowing cyan veins, and bioluminescent seed pods.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const STEM = "#254b48";
  const STEM_LIGHT = "#3c8375";
  const STEM_DARK = "#102c31";
  const LEAF = "#4d286e";
  const LEAF_LIGHT = "#8b43a9";
  const LEAF_EDGE = "#d35fc8";
  const CYAN = "#45f5df";
  const BLUE = "#55b9ff";
  const MAGENTA = "#ef55db";
  const POD = "#a9fff0";
  const DARK = "#151c38";
  const ROOT = "#33254f";

  const rand = rng(19);

  const sphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    segments = 8,
  ) => b.part(new THREE.SphereGeometry(radius, segments, Math.max(5, segments - 2)), color, {
    at,
    bone,
    flat: true,
  });

  const capsule = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone?: any,
  ) => b.sweep(polyline([a, c]), radius, {
    color,
    bone,
    sides: 7,
    caps: "round",
    smooth: false,
  });

  // Low, alien root crown: chunky and asymmetrical rather than a conventional pot.
  const rootPads: [number, number, number][] = [
    [-0.24, 0.09, 0.05],
    [0.22, 0.08, 0.02],
    [-0.05, 0.075, -0.22],
    [0.08, 0.07, 0.2],
    [-0.31, 0.06, -0.12],
  ];
  for (let i = 0; i < rootPads.length; i++) {
    const p = rootPads[i];
    const pad = b.part(
      new THREE.SphereGeometry(0.16 + (i % 2) * 0.025, 8, 5),
      ROOT,
      { at: p, scale: [1.2, 0.42, 0.8], flat: true },
    );
    glow(pad, 0.18);
    capsule([0, 0.12, 0], [p[0], 0.09, p[2]], 0.035, STEM_DARK);
  }

  // Central trunk, subtly segmented with alternate colors.
  const trunkPath = catmull([
    [0, 0.12, 0],
    [-0.025, 0.38, -0.015],
    [0.025, 0.68, 0.015],
    [-0.015, 0.98, 0],
    [0.025, 1.25, 0.02],
    [0, 1.49, 0],
  ]);
  const trunk = b.sweep(trunkPath, (t) => 0.105 - t * 0.045, {
    color: STEM,
    sides: 8,
    smooth: false,
  });

  for (let i = 0; i < 7; i++) {
    const t = 0.08 + i * 0.135;
    const p = trunk.at(t, 0, 0.006);
    const ring = b.ring(p, {
      count: 8,
      radius: 0.101 - t * 0.04,
      fromDeg: 0,
      toDeg: 360,
    });
    for (const item of ring.items) {
      const mark = b.part(new THREE.SphereGeometry(0.009, 5, 4), i % 2 ? CYAN : BLUE, {
        at: item,
        flat: true,
      });
      glow(mark, 1.4);
    }
  }

  // Main radial branches.
  const branchData = [
    { p: [0.01, 0.52, 0] as [number, number, number], q: [0.43, 0.76, 0.12] as [number, number, number], side: 1 },
    { p: [-0.01, 0.72, 0.01] as [number, number, number], q: [-0.5, 0.98, -0.02] as [number, number, number], side: -1 },
    { p: [0.01, 0.91, 0] as [number, number, number], q: [0.42, 1.22, -0.08] as [number, number, number], side: 1 },
    { p: [-0.01, 1.1, 0.01] as [number, number, number], q: [-0.46, 1.38, 0.08] as [number, number, number], side: -1 },
    { p: [0, 1.27, 0.02] as [number, number, number], q: [0.27, 1.59, 0.02] as [number, number, number], side: 1 },
  ];

  const branchEnds: [number, number, number][] = [];
  for (const d of branchData) {
    const mid: [number, number, number] = [
      (d.p[0] + d.q[0]) * 0.48,
      (d.p[1] + d.q[1]) * 0.48 + 0.045,
      (d.p[2] + d.q[2]) * 0.48,
    ];
    const branch = b.sweep(catmull([d.p, mid, d.q]), [0.045, 0.018], {
      color: STEM_LIGHT,
      sides: 6,
      caps: "round",
      smooth: false,
    });
    branchEnds.push(d.q);

    const bud = sphere(0.045, CYAN, d.q, undefined, 7);
    glow(bud, 2.5);

    // Small side tendril curling upward from every major branch.
    const tip: [number, number, number] = [
      d.q[0] + d.side * 0.12,
      d.q[1] + 0.19,
      d.q[2] + 0.03,
    ];
    const tendril = b.sweep(catmull([
      d.q,
      [d.q[0] + d.side * 0.08, d.q[1] + 0.06, d.q[2] + 0.02],
      [tip[0] - d.side * 0.035, tip[1] - 0.035, tip[2]],
      tip,
    ]), [0.018, 0.004], {
      color: STEM_DARK,
      sides: 6,
      caps: "round",
    });
    const tendrilLight = sphere(0.026, MAGENTA, tip, undefined, 7);
    glow(tendrilLight, 3.2);
  }

  // Leaf builder: broad diamond blades with a luminous central rib and edge lights.
  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.13, 0.12, "sharp"],
    [0.18, 0.34, "sharp"],
    [0.09, 0.58, "sharp"],
    [0, 0.78, "sharp"],
    [-0.09, 0.58, "sharp"],
    [-0.18, 0.34, "sharp"],
    [-0.13, 0.12, "sharp"],
  ];

  const leaves = [
    { at: [0.43, 0.76, 0.12] as [number, number, number], grow: [0.55, 0.26, 0.35] as [number, number, number], s: 1 },
    { at: [-0.5, 0.98, -0.02] as [number, number, number], grow: [-0.5, 0.22, 0.4] as [number, number, number], s: -1 },
    { at: [0.42, 1.22, -0.08] as [number, number, number], grow: [0.46, 0.2, -0.46] as [number, number, number], s: 1 },
    { at: [-0.46, 1.38, 0.08] as [number, number, number], grow: [-0.3, 0.18, -0.53] as [number, number, number], s: -1 },
    { at: [0.27, 1.59, 0.02] as [number, number, number], grow: [0.03, 0.04, 0.7] as [number, number, number], s: 1 },
  ];

  for (let i = 0; i < leaves.length; i++) {
    const l = leaves[i];
    const g = new THREE.Vector3(...l.grow).normalize();
    const across = new THREE.Vector3(-g.z, 0, g.x).normalize();
    const blade = b.extrude(leafOutline, {
      at: l.at,
      x: across,
      y: g,
      thickness: [0.025, 0.008],
      bevel: 0.004,
      color: i % 2 ? LEAF : LEAF_LIGHT,
      smoothing: 0,
      name: `alienLeaf${i}`,
    });

    const ribEnd = new THREE.Vector3(...l.at).addScaledVector(g, 0.76);
    const rib = capsule(l.at, ribEnd, 0.012, CYAN);
    glow(rib, 1.8);

    // Three short diagonal veins on each leaf.
    for (const u of [0.24, 0.43, 0.61]) {
      const center = new THREE.Vector3(...l.at).addScaledVector(g, u);
      const half = 0.11 * Math.sin(Math.PI * u);
      const a = center.clone().addScaledVector(across, half);
      const z = center.clone().addScaledVector(across, -half);
      const vein = capsule(a, center, 0.006, BLUE);
      const vein2 = capsule(center, z, 0.006, BLUE);
      glow(vein, 1.3);
      glow(vein2, 1.3);
    }

    // Magenta edge beads, emphasizing the graphic Avatar silhouette.
    for (const u of [0.18, 0.39, 0.6, 0.78]) {
      const center = new THREE.Vector3(...l.at).addScaledVector(g, u);
      const width = 0.13 * Math.sin(Math.PI * u);
      for (const side of [-1, 1]) {
        const q = center.clone().addScaledVector(across, side * width);
        const bead = sphere(0.014, LEAF_EDGE, q, undefined, 6);
        glow(bead, 1.5);
      }
    }

    // A floating seed pod at the leaf tip.
    const podPos = new THREE.Vector3(...l.at).addScaledVector(g, 0.84);
    const pod = b.part(new THREE.IcosahedronGeometry(0.045, 1), POD, {
      at: podPos,
      scale: [0.72, 1.35, 0.72],
      flat: true,
      name: `glowingSeedPod${i}`,
    });
    glow(pod, 3);
  }

  // Crown: five translucent-looking (but flat-colored) luminous spikes.
  const crownBase = [0, 1.47, 0] as [number, number, number];
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2 + 0.25;
    const tip: [number, number, number] = [
      Math.cos(ang) * (0.16 + (i % 2) * 0.05),
      1.75 + (i === 2 ? 0.1 : 0),
      Math.sin(ang) * (0.16 + (i % 2) * 0.05),
    ];
    const spike = b.spike(crownBase, tip, null, 0.035, {
      color: i % 2 ? BLUE : CYAN,
      caps: { start: "round", end: "point" },
    });
    glow(spike, 2.2);
  }

  // One bright central flower/star atop the crown.
  const flowerCenter = sphere(0.07, "#eaffff", [0, 1.79, 0], undefined, 8);
  glow(flowerCenter, 5);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    const end: [number, number, number] = [
      Math.cos(a) * 0.12,
      1.79 + Math.sin(a) * 0.055,
      Math.sin(a) * 0.12,
    ];
    const petal = b.spike([0, 1.79, 0], end, null, 0.018, {
      color: i % 2 ? MAGENTA : BLUE,
      caps: "point",
    });
    glow(petal, 3);
  }

  // A few tiny firefly-like motes close to the plant, kept within its footprint.
  for (let i = 0; i < 10; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.42 + rand() * 0.32;
    const p: [number, number, number] = [
      Math.cos(a) * r,
      0.3 + rand() * 1.25,
      Math.sin(a) * r,
    ];
    const mote = sphere(0.012 + rand() * 0.008, i % 2 ? CYAN : MAGENTA, p, undefined, 6);
    glow(mote, 4);
  }

  return b.root;
}

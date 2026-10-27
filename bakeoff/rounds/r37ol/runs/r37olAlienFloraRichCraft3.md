```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  paint,
  mottle,
  gradient,
  spots,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A stylized Avatar-inspired alien plant with a luminous violet stalk, glowing cyan leaves, translucent tendrils, radiant seed pods, and a crown of bioluminescent petals.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const DARK = "#10122a";
  const ROOT = "#24234a";
  const STEM = "#253b63";
  const STEM_LIGHT = "#3f7f94";
  const CYAN = "#49f4df";
  const AQUA = "#92fff0";
  const BLUE = "#3888bb";
  const VIOLET = "#884fd1";
  const MAGENTA = "#df65db";
  const PINK = "#ff9de8";
  const GOLD = "#d9ff91";
  const INK = "#17152d";

  const alienStem = mottle(STEM, STEM_LIGHT, {
    size: 0.09,
    contrast: 1.7,
    seed: 12,
  });
  const rootPaint = mottle(ROOT, "#4b3268", {
    size: 0.11,
    contrast: 1.3,
    seed: 8,
  });
  const leafPaint = paint((p, n) => {
    const top = Math.max(0, n.y);
    const t = Math.max(0, Math.min(1, (p.y - 0.25) / 1.5));
    return t > 0.72
      ? AQUA
      : top > 0.25
        ? CYAN
        : t > 0.3
          ? BLUE
          : VIOLET;
  });
  const podPaint = gradient(VIOLET, MAGENTA, [0, 0.25, 0], [0, 1.8, 0]);

  const root = b.joint("root", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  // Radial alien roots, kept chunky and visibly planted.
  const rootEnds: [number, number, number][] = [
    [0.42, 0.035, 0.18],
    [-0.38, 0.035, 0.2],
    [0.18, 0.035, -0.42],
    [-0.2, 0.035, -0.38],
    [0.52, 0.035, -0.08],
    [-0.5, 0.035, -0.1],
  ];

  for (let i = 0; i < rootEnds.length; i++) {
    const start: [number, number, number] = [
      rootEnds[i][0] * 0.18,
      0.1,
      rootEnds[i][2] * 0.18,
    ];
    const path = catmull([
      start,
      [rootEnds[i][0] * 0.52, 0.07, rootEnds[i][2] * 0.5],
      rootEnds[i],
    ]);
    b.sweep(path, [0.065, 0.018], {
      bone: root,
      color: rootPaint,
      sides: 6,
      caps: "round",
      name: `rootlet${i}`,
      group: "roots",
    });
    b.part(
      new THREE.SphereGeometry(0.035, 7, 5),
      DARK,
      { bone: root, at: rootEnds[i], name: `rootTip${i}`, group: "roots" },
    );
  }

  const trunkPath = catmull([
    [0, 0.08, 0],
    [0.02, 0.34, -0.015],
    [-0.045, 0.68, 0.015],
    [0.035, 1.02, -0.01],
    [-0.025, 1.34, 0.015],
    [0, 1.66, 0],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "crown"],
    role: "spine",
  });
  const trunkTube = b.sweep(trunk, (t) => 0.115 - t * 0.045, {
    color: alienStem,
    sides: 8,
    caps: "round",
    name: "faceted-luminous-trunk",
    group: "stem",
  });

  // Vertical cyan veins running along the trunk.
  for (let i = 0; i < 7; i++) {
    const t = i / 7;
    const at = trunkTube.at(t, 35 + i * 45, 0.008);
    const vein = b.spike(at, at, 0.11 + (i % 2) * 0.025, 0.009, {
      color: CYAN,
      name: `trunkVein${i}`,
      group: "bioluminescence",
    });
    glow(vein, 2.5);
  }

  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.18, 0.035, "sharp"],
    [0.48, 0.19, "sharp"],
    [0.7, 0.46, "sharp"],
    [0.42, 0.43, "sharp"],
    [0.12, 0.2, "sharp"],
  ];

  function leaf(
    name: string,
    at: [number, number, number],
    side: number,
    size: number,
    tilt: number,
    color = leafPaint,
  ) {
    const p = b.extrude(leafOutline, {
      at,
      x: [side, 0, 0],
      y: [0, Math.cos(tilt), Math.sin(tilt)],
      thickness: 0.018,
      bevel: 0.008,
      smoothing: 1,
      color,
      bone: trunk.joints[Math.min(trunk.joints.length - 1, Math.floor(at[1] / 0.4))],
      name,
      group: "leaves",
    });

    // Bright central vein and smaller transverse veinlets.
    const tip: [number, number, number] = [
      at[0] + side * size * 0.7,
      at[1] + size * Math.cos(tilt) * 0.42,
      at[2] + size * Math.sin(tilt) * 0.42,
    ];
    const vein = b.rod(at, tip, 0.012, {
      color: AQUA,
      bone: p.bone ?? root,
      name: `${name}-central-vein`,
      group: "veins",
    });
    glow(vein, 2.2);

    for (let j = 1; j < 5; j++) {
      const u = j / 5;
      const base = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...at),
        new THREE.Vector3(...tip),
        u,
      );
      const spread = side * size * (0.12 + 0.05 * (j % 2));
      const end: [number, number, number] = [
        base.x + spread,
        base.y + 0.025,
        base.z + (j % 2 ? 0.07 : -0.07),
      ];
      const rib = b.rod(base, end, 0.005, {
        color: AQUA,
        bone: p.bone ?? root,
        name: `${name}-rib-${j}`,
        group: "veins",
      });
      glow(rib, 1.6);
    }
    return p;
  }

  leaf("leafL0", [0.02, 0.34, 0.02], 1, 0.72, 0.34);
  leaf("leafR0", [-0.02, 0.46, 0.015], -1, 0.64, 0.24);
  leaf("leafL1", [0.02, 0.7, 0.02], 1, 0.86, 0.42);
  leaf("leafR1", [-0.04, 0.84, 0.01], -1, 0.78, 0.31);
  leaf("leafL2", [0.01, 1.08, 0], 1, 0.7, 0.54);
  leaf("leafR2", [-0.03, 1.23, 0.005], -1, 0.62, 0.36);

  // Long side branches ending in luminous bells.
  const branchSpecs = [
    { side: 1, y: 0.58, z: 0.02, tip: [0.63, 0.92, 0.04] as [number, number, number] },
    { side: -1, y: 0.78, z: 0.02, tip: [-0.66, 1.08, 0.02] as [number, number, number] },
    { side: 1, y: 1.08, z: -0.01, tip: [0.5, 1.38, -0.02] as [number, number, number] },
  ];

  for (let i = 0; i < branchSpecs.length; i++) {
    const s = branchSpecs[i];
    const path = catmull([
      [s.side * 0.02, s.y, s.z],
      [s.side * 0.25, s.y + 0.03, s.z + 0.04],
      [s.side * 0.48, s.tip[1] - 0.05, s.tip[2]],
      s.tip,
    ]);
    const branch = b.sprout(
      `branch${i}`,
      trunkTube.at((s.y - 0.08) / 1.58, s.side * 90, 0.01),
      path,
      [0.045, 0.018],
      {
        count: 2,
        names: [`branch${i}Base`, `branch${i}Tip`],
        role: "arm",
        color: alienStem,
        sides: 7,
        group: "branches",
      },
    );
    const pod = b.part(
      new THREE.SphereGeometry(0.095, 10, 7),
      podPaint,
      {
        bone: branch.chain?.tip ?? root,
        at: s.tip,
        scale: [0.72, 1.45, 0.72],
        name: `hanging-lantern${i}`,
        group: "seedpods",
      },
    );
    glow(pod, 1.7);
    const cap = b.part(
      new THREE.CylinderGeometry(0.055, 0.075, 0.035, 8),
      DARK,
      {
        bone: branch.chain?.tip ?? root,
        at: [s.tip[0], s.tip[1] + 0.065, s.tip[2]],
        name: `pod-cap${i}`,
        group: "seedpods",
      },
    );
    const filament = b.rod(
      [s.tip[0], s.tip[1] - 0.07, s.tip[2]],
      [s.tip[0], s.tip[1] - 0.22, s.tip[2] + 0.025],
      0.008,
      { color: CYAN, bone: branch.chain?.tip ?? root, name: `pod-filament${i}` },
    );
    glow(cap, 0.9);
    glow(filament, 2.5);
  }

  // Crown: six translucent petals around the top, each with a glowing spine.
  const petalOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.16, 0.04, "sharp"],
    [0.36, 0.25, "sharp"],
    [0.26, 0.62, "sharp"],
    [0.06, 0.86, "sharp"],
    [-0.05, 0.47, "sharp"],
  ];

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const radial: [number, number, number] = [
      Math.sin(a) * 0.035,
      1.62,
      Math.cos(a) * 0.035,
    ];
    const outward: [number, number, number] = [
      Math.sin(a),
      0.18 + 0.06 * Math.sin(i * 1.7),
      Math.cos(a),
    ];
    const petal = b.extrude(petalOutline, {
      at: radial,
      x: [Math.cos(a), 0, -Math.sin(a)],
      y: outward,
      thickness: [0.012, 0.003],
      bevel: 0.006,
      smoothing: 1,
      color: i % 2 ? leafPaint : mottle(CYAN, VIOLET, { size: 0.18, seed: i }),
      bone: trunk.tip,
      name: `crown-petal-${i}`,
      group: "crown",
    });
    const spine = b.rod(
      radial,
      [
        radial[0] + Math.sin(a) * 0.25,
        radial[1] + 0.37,
        radial[2] + Math.cos(a) * 0.25,
      ],
      0.009,
      { color: AQUA, bone: trunk.tip, name: `crown-vein-${i}`, group: "crown" },
    );
    glow(petal, 0.8);
    glow(spine, 3.2);
  }

  // A radiant central eye-like flower at the crown.
  const core = b.part(
    new THREE.SphereGeometry(0.105, 12, 8),
    "#b8fff0",
    { bone: trunk.tip, at: [0, 1.78, 0], scale: [1, 0.75, 1], name: "crown-core" },
  );
  glow(core, 4);

  const coreRing = b.ring(frame([0, 1.78, 0], [0, 1, 0]), {
    count: 10,
    radius: 0.115,
    fromDeg: 0,
    toDeg: 360,
    parent: trunk.tip,
    name: "core-filaments",
    role: "fan",
  });
  for (let i = 0; i < coreRing.items.length; i++) {
    const f = coreRing.items[i];
    const filament = b.spike(f, f, 0.09 + (i % 3) * 0.025, 0.006, {
      color: i % 2 ? PINK : GOLD,
      name: `core-filament-${i}`,
      group: "crown",
    });
    glow(filament, 3);
  }

  // Small floating spore motes clustered around the plant silhouette.
  const rand = rng(42);
  const motes = [
    [-0.76, 0.42, 0.12],
    [0.72, 0.63, -0.08],
    [-0.63, 1.12, -0.14],
    [0.78, 1.18, 0.08],
    [-0.3, 1.83, 0.18],
    [0.34, 1.98, -0.08],
    [0.52, 1.55, 0.2],
    [-0.56, 1.52, 0.12],
  ] as [number, number, number][];

  for (let i = 0; i < motes.length; i++) {
    const p = motes[i];
    const mote = b.part(
      new THREE.IcosahedronGeometry(0.018 + rand() * 0.012, 1),
      i % 2 ? AQUA : MAGENTA,
      {
        bone: root,
        at: p,
        name: `spore-mote-${i}`,
        group: "spores",
      },
    );
    glow(mote, 3.5);
  }

  return b.root;
}
```
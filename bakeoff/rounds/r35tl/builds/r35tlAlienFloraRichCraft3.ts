import * as THREE from "three";
import { createBuilder, catmull, frame, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "bioluminescent alien plant",
  description: "A stylized Avatar-inspired alien plant with a ribbed violet trunk, luminous cyan leaves, tendrils, and glowing star flowers.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent_alien_plant", detail: 1 });

  const INK = "#17142d";
  const ROOT = "#281d42";
  const ROOT_LIT = "#5b3d76";
  const VIOLET = "#6d3fa0";
  const VIOLET_DARK = "#321d58";
  const CYAN = "#39f1d0";
  const CYAN_DARK = "#087f8b";
  const BLUE = "#238bc2";
  const MAGENTA = "#d64bc6";
  const PETAL = "#ec74df";
  const GOLD = "#f4d65e";

  const trunkPaint = cel(
    furEdge(ROOT_LIT, ROOT, {
      axis: [0, 1, 0],
      level: -0.1,
      teeth: 0.12,
      period: 0.16,
      along: [0, 0, 1],
    }),
    VIOLET_DARK,
  );
  const leafPaint = cel(CYAN, CYAN_DARK);
  const stemPaint = cel(VIOLET, VIOLET_DARK);

  const glowDisc = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="a">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".18" stop-color="#baffff"/>
          <stop offset=".48" stop-color="#39f1d0"/>
          <stop offset="1" stop-color="#39f1d0" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#a)"/>
    </svg>`,
    { size: 128 },
  );

  const flowerTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".24" stop-color="#bfffea"/>
          <stop offset=".56" stop-color="#42eacb"/>
          <stop offset="1" stop-color="#1679a0"/>
        </radialGradient>
      </defs>
      <g fill="url(#g)" stroke="#b9fff3" stroke-width="2">
        <path d="M64 62 C29 58 8 39 17 17 C40 12 59 28 64 62Z"/>
        <path d="M66 62 C69 27 86 7 108 15 C116 38 94 57 66 62Z"/>
        <path d="M65 66 C99 61 120 73 119 96 C94 107 74 91 65 66Z"/>
        <path d="M61 66 C57 99 39 118 17 108 C10 83 32 69 61 66Z"/>
        <circle cx="64" cy="64" r="15" fill="#fffbd0"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first: one rooted, gently twisting trunk.
  const root = b.joint("root", { at: [0, 0.08, 0], dir: [0, 1, 0], role: "spine" });
  const trunkPath = catmull([
    [0, 0.08, 0],
    [0.02, 0.42, -0.01],
    [-0.035, 0.82, 0.015],
    [0.035, 1.18, 0.01],
    [0, 1.48, 0.035],
    [0.02, 1.72, 0.02],
  ]);
  const trunk = b.chain("spine", trunkPath, {
    parent: root,
    count: 7,
    names: ["trunk0", "trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "crown"],
    role: "spine",
  });
  const trunkTube = b.sweep(trunk, (t) => 0.16 - 0.075 * t, {
    color: trunkPaint,
    section: { ngon: 7 },
    sides: 7,
    caps: "round",
  });

  // Root flare, blocky buttresses, and luminous basal rings.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [0, 0.1, -0.01],
        [s * 0.12, 0.15, -0.01],
        [s * 0.23, 0.03, 0.02],
      ]),
      [0.075, 0.018],
      { color: stemPaint, caps: { start: "round", end: "point" } },
    );
  }
  for (const y of [0.18, 0.27, 0.36]) {
    const band = b.sweep(
      catmull([
        [-0.115 * (1 - y / 2), y, 0],
        [0, y + 0.018, 0],
        [0.115 * (1 - y / 2), y, 0],
      ]),
      0.014,
      { color: CYAN },
    );
    glow(band, 1.5);
  }

  // Branches arranged in a readable spiral, with paired side shoots.
  const branchData = [
    { s: 1, base: trunk.at(0.28).at, tip: [0.52, 0.79, 0.12] as [number, number, number], side: 1 },
    { s: -1, base: trunk.at(0.38).at, tip: [-0.54, 0.94, 0.02] as [number, number, number], side: -1 },
    { s: 1, base: trunk.at(0.55).at, tip: [0.58, 1.24, 0.08] as [number, number, number], side: 1 },
    { s: -1, base: trunk.at(0.67).at, tip: [-0.56, 1.41, 0.04] as [number, number, number], side: -1 },
    { s: 1, base: trunk.at(0.78).at, tip: [0.45, 1.62, 0.06] as [number, number, number], side: 1 },
  ];

  const branchEnds: THREE.Vector3[] = [];
  for (let i = 0; i < branchData.length; i++) {
    const d = branchData[i];
    const p = catmull([
      d.base,
      [d.tip[0] * 0.32, d.tip[1] - 0.08, d.tip[2]],
      [d.tip[0] * 0.72, d.tip[1] - 0.015, d.tip[2] + 0.04],
      d.tip,
    ]);
    const branch = b.chain(`arm${i}`, p, {
      parent: trunk.joints[Math.min(5, 1 + i)],
      count: 4,
      names: [`arm${i}Base`, `arm${i}Mid`, `arm${i}Tip`, `arm${i}Bud`],
      role: "arm",
    });
    b.sweep(branch, [0.055, 0.018], {
      color: stemPaint,
      section: { ngon: 6 },
      caps: "round",
    });
    branchEnds.push(new THREE.Vector3(...d.tip));
  }

  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.06, 0.15, "sharp"],
    [0.20, 0.36, "sharp"],
    [0.10, 0.63, "sharp"],
    [0, 0.78, "sharp"],
    [-0.10, 0.63, "sharp"],
    [-0.20, 0.36, "sharp"],
    [-0.06, 0.15, "sharp"],
  ];

  function leaf(at: THREE.Vector3, width: number, height: number, tilt: number, side: number) {
    const x = new THREE.Vector3(side * Math.cos(tilt), 0.08, side * Math.sin(tilt)).normalize();
    const y = new THREE.Vector3(0, 1, 0);
    const p = b.extrude(leafOutline, {
      at,
      x,
      y,
      thickness: 0.012,
      bevel: 0.006,
      smoothing: 1,
      color: leafPaint,
      bone: root,
      scale: [width, height, 1],
      group: "leaves",
      name: "luminous_leaf",
    });
    // Central vein and two angular side veins make the silhouette read from a distance.
    const tip = at.clone().addScaledVector(y, height * 0.74).addScaledVector(x, width * 0.02);
    const vein = b.sweep(catmull([at, at.clone().addScaledVector(y, height * 0.32), tip]), 0.009, {
      color: CYAN,
      caps: "round",
    });
    glow(vein, 2);
    for (const q of [-1, 1]) {
      const start = at.clone().addScaledVector(y, height * 0.28).addScaledVector(x, q * width * 0.02);
      const end = at.clone().addScaledVector(y, height * 0.48).addScaledVector(x, q * width * 0.30);
      const rib = b.rod(start, end, 0.004, { color: BLUE });
      glow(rib, 1.2);
    }
    return p;
  }

  // Leaves at each branch, separated into fan-like opposing blades.
  for (let i = 0; i < branchEnds.length; i++) {
    const p = branchEnds[i];
    const side = i % 2 === 0 ? 1 : -1;
    leaf(new THREE.Vector3(p[0], p[1], p[2]), 0.24, 0.68, side * 0.45, side);
    leaf(
      new THREE.Vector3(p[0] * 0.82, p[1] + 0.035, p[2] + 0.02),
      0.18,
      0.50,
      -side * 0.8,
      -side,
    );
  }

  // Long alien tendrils descending from the crown.
  const tendrilTips = [
    [0.42, 1.31, -0.12],
    [-0.40, 1.37, -0.10],
    [0.32, 1.73, -0.18],
    [-0.34, 1.77, -0.12],
  ] as const;
  for (let i = 0; i < tendrilTips.length; i++) {
    const s = i % 2 ? -1 : 1;
    const base = trunk.at(0.54 + i * 0.08).at;
    const tip = tendrilTips[i];
    const p = catmull([
      base,
      [tip[0] * 0.7, tip[1] + 0.08, tip[2]],
      [tip[0] * 1.1, tip[1] - 0.02, tip[2] - 0.12],
      [tip[0] * 0.86, tip[1] - 0.16, tip[2] - 0.20],
      tip,
    ]);
    const tendril = b.chain(`tendril${i}`, p, {
      parent: trunk.joints[3 + (i % 3)],
      count: 5,
      names: [`tendril${i}0`, `tendril${i}1`, `tendril${i}2`, `tendril${i}3`, `tendril${i}Tip`],
      role: "tentacle",
    });
    const tube = b.sweep(tendril, (t) => 0.022 - t * 0.017, {
      color: stemPaint,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
    });
    glow(b.sweep(tendril, (t) => 0.005 - t * 0.003, { color: CYAN, caps: "point" }), 1.4);
  }

  // Crown flower with five luminous petals and a bright core.
  const crown = trunk.tip.at;
  const petalFrames = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const dir = new THREE.Vector3(Math.sin(a) * 0.5, 0.52, Math.cos(a) * 0.5).normalize();
    const f = frame(crown.clone().add(new THREE.Vector3(0, 0.05, 0)), dir);
    petalFrames.push(f);
  }
  const petals = b.cards(petalFrames, flowerTex, {
    size: [0.24, 0.36],
    lean: 22,
    bend: 18,
    flow: [0, 1, 0],
    color: PETAL,
    cross: true,
    sink: 0.08,
    rng: rng(11),
  });
  glow(petals, 1.8);

  const core = glow(
    b.part(new THREE.SphereGeometry(0.095, 10, 7), GOLD, {
      at: crown.clone().add(new THREE.Vector3(0, 0.07, 0)),
      bone: trunk.tip,
      name: "flower_core",
    }),
    3,
  );

  // A handful of floating-looking but attached bioluminescent seed discs around the crown.
  const seedPoints = [
    [0.22, 1.82, 0.18],
    [-0.24, 1.86, 0.15],
    [0.28, 1.68, -0.05],
    [-0.27, 1.69, -0.08],
    [0.0, 1.94, -0.10],
  ] as const;
  for (let i = 0; i < seedPoints.length; i++) {
    const at = new THREE.Vector3(...seedPoints[i]);
    const disk = b.part(new THREE.PlaneGeometry(0.13, 0.13), "#ffffff", {
      at,
      dir: [0, 1, 0],
      axis: "z",
      texture: glowDisc,
      bone: trunk.tip,
      rotation: [0, (i * 37) % 360, 0],
      name: "seed_glow",
    });
    glow(disk, 2.2);
  }

  // Tiny violet nodules along the trunk add the characteristic alien rhythm.
  for (let i = 0; i < 9; i++) {
    const t = 0.12 + i * 0.09;
    const at = trunk.at(t).at;
    const nodule = glow(
      b.part(new THREE.IcosahedronGeometry(0.026 + (i % 3) * 0.006, 1), MAGENTA, {
        at: at.clone().add(new THREE.Vector3(0.10 * Math.sin(i * 2.4), 0.015, 0.08 * Math.cos(i))),
        bone: trunk.at(t).bone,
        name: "luminescent_nodule",
      }),
      1.4,
    );
  }

  return b.root;
}

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  frame,
  rng,
  mottle,
  countershade,
  paint,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A stylized Avatar-inspired alien plant with a luminous violet trunk, broad translucent leaves, glowing cyan veins, hanging tendrils, radiant flowers, and drifting bioluminescent spores.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const INK = "#17122b";
  const ROOT_DARK = "#211a3d";
  const STEM = "#553c79";
  const STEM_LIGHT = "#8f5f9e";
  const LEAF = "#286b64";
  const LEAF_LIGHT = "#55b889";
  const LEAF_DARK = "#173d48";
  const VEIN = "#54f4d2";
  const VEIN_HOT = "#b2fff0";
  const FLOWER = "#b34dd2";
  const FLOWER_LIGHT = "#ef8dff";
  const PETAL_EDGE = "#642b86";
  const AMBER = "#ffc85b";
  const SPORE = "#86fff0";

  const trunkPaint = countershade(
    mottle(STEM_LIGHT, STEM, { size: 0.18, contrast: 1.4, seed: 12 }),
    ROOT_DARK,
    { level: -0.05, soft: 0.32 },
  );

  const leafPaint = countershade(
    mottle(LEAF_LIGHT, LEAF, { size: 0.22, contrast: 1.3, seed: 23 }),
    LEAF_DARK,
    { level: -0.12, soft: 0.28 },
  );

  const veinPaint = paint((p, n) => {
    const shimmer = 0.5 + 0.5 * Math.sin(p.y * 35 + p.z * 19 + p.x * 11);
    return n.y > 0.2 && shimmer > 0.4 ? VEIN_HOT : VEIN;
  });

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: one root, a central trunk, and four readable branch chains.

  const root = b.joint("root", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const trunkPath = catmull([
    [0, 0.08, 0],
    [0.015, 0.38, 0.015],
    [-0.025, 0.78, 0.02],
    [0.025, 1.17, 0.015],
    [0, 1.52, 0.03],
    [0.02, 1.88, 0.04],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "crown"],
    role: "spine",
    count: 5,
  });

  const branchL = b.chain(
    "branchL",
    catmull([
      trunk.at(0.38).at,
      [0.31, 0.82, 0.02],
      [0.58, 1.12, 0.08],
      [0.77, 1.38, 0.17],
    ]),
    {
      parent: trunk.jointAt(0.38),
      names: ["branchLBase", "branchLMid", "branchLTip"],
      role: "arm",
      count: 3,
    },
  );

  const branchR = b.chain(
    "branchR",
    catmull([
      trunk.at(0.52).at,
      [-0.32, 1.00, 0.02],
      [-0.56, 1.28, -0.01],
      [-0.82, 1.48, 0.08],
    ]),
    {
      parent: trunk.jointAt(0.52),
      names: ["branchRBase", "branchRMid", "branchRTip"],
      role: "arm",
      count: 3,
    },
  );

  const branchBack = b.chain(
    "branchBack",
    catmull([
      trunk.at(0.67).at,
      [0.08, 1.18, -0.18],
      [0.02, 1.44, -0.42],
      [-0.08, 1.70, -0.58],
    ]),
    {
      parent: trunk.jointAt(0.67),
      names: ["branchBackBase", "branchBackMid", "branchBackTip"],
      role: "arm",
      count: 3,
    },
  );

  const crownBranch = b.chain(
    "crownBranch",
    catmull([
      trunk.at(0.84).at,
      [0.22, 1.62, 0.04],
      [0.42, 1.82, 0.15],
      [0.53, 2.02, 0.23],
    ]),
    {
      parent: trunk.jointAt(0.84),
      names: ["crownBranchBase", "crownBranchMid", "crownBranchTip"],
      role: "arm",
      count: 3,
    },
  );

  // ------------------------------------------------------------------------------------------------
  // Root flare and alien tendrils.

  b.sweep(
    catmull([
      [0, 0.1, 0],
      [0.18, 0.06, 0.08],
      [0.42, 0.035, 0.17],
      [0.67, 0.025, 0.22],
    ]),
    [0.075, 0.018],
    { color: trunkPaint, caps: "round", role: "tentacle" },
  );

  b.sweep(
    catmull([
      [0, 0.1, 0],
      [-0.16, 0.055, 0.06],
      [-0.38, 0.03, 0.13],
      [-0.58, 0.018, 0.07],
    ]),
    [0.07, 0.014],
    { color: trunkPaint, caps: "round", role: "tentacle" },
  );

  b.sweep(
    catmull([
      [0.02, 0.13, 0],
      [0.02, 0.07, -0.18],
      [0.14, 0.035, -0.4],
      [0.08, 0.02, -0.62],
    ]),
    [0.06, 0.01],
    { color: trunkPaint, caps: "round", role: "tentacle" },
  );

  const stem = b.sweep(trunk, (t) => 0.115 - t * 0.06, {
    color: trunkPaint,
    sides: 7,
    caps: "round",
    role: "spine",
  });

  for (const branch of [branchL, branchR, branchBack, crownBranch]) {
    b.sweep(branch, (t) => 0.057 - t * 0.032, {
      color: trunkPaint,
      sides: 7,
      caps: "round",
      role: "arm",
    });
  }

  // Raised glowing seams in the main stem.
  const stemGlow = b.sweep(
    catmull([
      [0.075, 0.12, 0.045],
      [0.09, 0.48, 0.06],
      [0.055, 0.9, 0.07],
      [0.08, 1.32, 0.075],
      [0.055, 1.7, 0.085],
      [0.07, 1.91, 0.09],
    ]),
    0.012,
    { color: VEIN_HOT, caps: "round", sides: 6, role: "spine" },
  );
  glow(stemGlow, 2.4);

  // ------------------------------------------------------------------------------------------------
  // Leaf construction helpers.

  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.12, 0.07, "sharp"],
    [0.24, 0.23, "sharp"],
    [0.2, 0.43, "sharp"],
    [0.1, 0.66, "sharp"],
    [0, 0.86, "sharp"],
    [-0.11, 0.65, "sharp"],
    [-0.21, 0.43, "sharp"],
    [-0.25, 0.22, "sharp"],
    [-0.13, 0.07, "sharp"],
  ];

  function leaf(
    at: THREE.Vector3,
    side: number,
    lean: number,
    size: number,
    bone: any,
    name: string,
  ) {
    const x = new THREE.Vector3(side * Math.cos(lean), 0, Math.sin(lean)).normalize();
    const y = new THREE.Vector3(-0.08 * Math.sin(lean), 1, 0.04 * Math.cos(lean)).normalize();

    const leafPart = b.extrude(leafOutline, {
      at,
      x,
      y,
      thickness: [0.018, 0.006],
      bevel: 0.008,
      smoothing: 1,
      color: leafPaint,
      bone,
      name,
      group: "foliage",
    });
    leafPart.mesh.scale.set(size, size, size);

    const base = at.clone();
    const tip = at.clone().addScaledVector(y, size * 0.81);
    const mid = at.clone().addScaledVector(y, size * 0.38);
    const vein = b.sweep(
      catmull([base, mid, tip]),
      [0.013, 0.004],
      {
        color: veinPaint,
        caps: "round",
        sides: 6,
        bone,
        role: "fan",
        name: `${name}Vein`,
      },
    );
    glow(vein, 2.6);

    // Three short side veins make the broad leaf read immediately from a distance.
    for (const [t, s] of [
      [0.27, 1],
      [0.43, -1],
      [0.59, 1],
    ] as [number, number][]) {
      const center = at.clone().addScaledVector(y, size * t);
      const width = size * (0.13 - t * 0.06);
      const sideVein = b.rod(
        center,
        center.clone().addScaledVector(x, s * width),
        0.006,
        { color: VEIN, caps: "flat", sides: 5, bone },
      );
      glow(sideVein, 1.8);
    }

    return leafPart;
  }

  leaf(branchL.tip.at, 1, 0.12, 0.82, branchL.tip.bone, "leafL");
  leaf(branchR.tip.at, -1, -0.12, 0.9, branchR.tip.bone, "leafR");
  leaf(branchBack.tip.at, 1, -0.7, 0.78, branchBack.tip.bone, "leafBack");
  leaf(crownBranch.tip.at, 1, 0.65, 0.88, crownBranch.tip.bone, "leafCrown");

  leaf([0.2, 1.18, 0.03] as any, 1, 0.35, 0.57, trunk.jointAt(0.52), "leafSideA");
  leaf([-0.18, 1.38, 0.03] as any, -1, -0.3, 0.62, trunk.jointAt(0.67), "leafSideB");

  // Long translucent-looking rear leaves, built as darker silhouettes with bright ribs.
  const rearLeafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.18, 0.1, "sharp"],
    [0.31, 0.35, "sharp"],
    [0.08, 0.92, "sharp"],
    [0, 1.12, "sharp"],
    [-0.1, 0.83, "sharp"],
    [-0.27, 0.32, "sharp"],
    [-0.16, 0.1, "sharp"],
  ];

  function rearLeaf(at: THREE.Vector3, side: number, bone: any, name: string) {
    const x = new THREE.Vector3(side * 0.84, 0, 0.54).normalize();
    const y = new THREE.Vector3(-0.08 * side, 1, -0.04).normalize();
    b.extrude(rearLeafOutline, {
      at,
      x,
      y,
      thickness: [0.012, 0.004],
      bevel: 0.006,
      color: leafPaint,
      bone,
      name,
      group: "rear-fronds",
    });

    const vein = b.sweep(
      catmull([
        at,
        at.clone().addScaledVector(y, 0.38),
        at.clone().addScaledVector(y, 0.78),
        at.clone().addScaledVector(y, 1.12),
      ]),
      [0.011, 0.003],
      { color: VEIN_HOT, sides: 6, caps: "round", bone, name: `${name}Glow` },
    );
    glow(vein, 2.2);
  }

  rearLeaf([-0.13, 0.76, -0.04] as any, -1, trunk.jointAt(0.38), "rearFrondL");
  rearLeaf([0.14, 1.02, -0.06] as any, 1, trunk.jointAt(0.52), "rearFrondR");

  // ------------------------------------------------------------------------------------------------
  // Luminous flowers: angular violet petals around golden/cyan cores.

  function flower(center: THREE.Vector3, bone: any, name: string, scale: number) {
    const flowerLine = frame(center, [0, 1, 0]);
    const petals = b.ring(
      flowerLine,
      {
        count: 6,
        radius: scale * 0.075,
        fromDeg: 0,
        toDeg: 360,
        tilt: 28,
        name: `${name}Petal`,
        parent: bone,
        role: "fan",
      },
      (item: any) => {
        const petal = b.stick(
          new THREE.ConeGeometry(scale * 0.075, scale * 0.26, 5),
          FLOWER,
          item,
          { embed: 0.28, name: `${name}Petal${item.i}` },
        );
        return petal;
      },
    );

    for (const item of petals.items) {
      const edge = b.spike(item, item, scale * 0.12, scale * 0.012, {
        color: FLOWER_LIGHT,
        caps: "point",
        bone,
      });
      glow(edge, 2.1);
    }

    const core = b.part(
      new THREE.SphereGeometry(scale * 0.105, 10, 7),
      AMBER,
      { at: center, bone, name: `${name}Core` },
    );
    glow(core, 3.4);

    const halo = b.part(
      new THREE.SphereGeometry(scale * 0.145, 10, 7),
      VEIN_HOT,
      { at: center.clone().add(new THREE.Vector3(0, 0.015, 0)), bone, name: `${name}Halo` },
    );
    glow(halo, 1.4);
  }

  flower(trunk.tip.at, trunk.tip.bone, "crownFlower", 1.0);
  flower(branchL.tip.at.clone().add(new THREE.Vector3(0, 0.05, 0)), branchL.tip.bone, "flowerL", 0.72);
  flower(branchR.tip.at.clone().add(new THREE.Vector3(0, 0.04, 0)), branchR.tip.bone, "flowerR", 0.78);
  flower(branchBack.tip.at.clone().add(new THREE.Vector3(0, 0.04, 0)), branchBack.tip.bone, "flowerBack", 0.62);

  // ------------------------------------------------------------------------------------------------
  // Hanging tendrils with glowing terminal bulbs.

  function tendril(points: THREE.Vector3[], radius: number, name: string) {
    const path = catmull(points);
    const tube = b.sweep(path, [radius, 0.006], {
      color: trunkPaint,
      sides: 6,
      caps: "round",
      role: "tentacle",
      name,
    });

    const lightTube = b.sweep(path, [radius * 0.22, 0.002], {
      color: VEIN,
      sides: 5,
      caps: "round",
      role: "tentacle",
      name: `${name}Light`,
    });
    glow(lightTube, 2.0);

    const bulb = b.part(
      new THREE.SphereGeometry(radius * 2.8, 10, 7),
      VEIN_HOT,
      { at: points[points.length - 1], name: `${name}Bulb` },
    );
    glow(bulb, 3.6);
  }

  tendril(
    [
      [0.58, 1.32, 0.15],
      [0.78, 1.14, 0.16],
      [0.9, 0.9, 0.12],
      [0.8, 0.67, 0.2],
    ].map((p) => new THREE.Vector3(...p)),
    0.018,
    "tendrilL",
  );

  tendril(
    [
      [-0.53, 1.3, 0.02],
      [-0.73, 1.1, 0.01],
      [-0.78, 0.83, -0.08],
      [-0.65, 0.62, -0.12],
    ].map((p) => new THREE.Vector3(...p)),
    0.016,
    "tendrilR",
  );

  tendril(
    [
      [-0.07, 1.7, -0.5],
      [-0.22, 1.52, -0.68],
      [-0.2, 1.28, -0.75],
    ].map((p) => new THREE.Vector3(...p)),
    0.014,
    "tendrilBack",
  );

  // ------------------------------------------------------------------------------------------------
  // Small glowing spores drifting around the crown.

  const sporeTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".25" stop-color="#b2fff0"/>
          <stop offset=".65" stop-color="#54f4d2"/>
          <stop offset="1" stop-color="#54f4d2" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="url(#g)"/>
      <circle cx="26" cy="24" r="5" fill="#ffffff" opacity=".9"/>
    </svg>`,
    { size: 128 },
  );

  const random = rng(731);
  const spores = [];
  for (let i = 0; i < 26; i++) {
    const a = random() * Math.PI * 2;
    const r = 0.25 + random() * 0.82;
    const y = 0.92 + random() * 1.24;
    spores.push(
      frame(
        [
          Math.cos(a) * r,
          y,
          0.12 + Math.sin(a) * r * 0.72,
        ],
        [0, 1, 0],
      ),
    );
  }

  const sporeCards = b.cards(spores, sporeTexture, {
    size: [0.065, 0.065],
    lean: 0,
    cross: true,
    vary: 0.38,
    rng: rng(991),
    color: SPORE,
    sink: 0.01,
    group: "spores",
  });
  glow(sporeCards, 2.5);

  // A few grounded luminous stones at the root, kept subordinate to the plant.
  const stonePaint = mottle("#26304d", "#151a2e", { size: 0.12, seed: 84 });
  const stones = [
    [0.31, 0.045, 0.22],
    [-0.27, 0.035, 0.18],
    [0.1, 0.025, -0.3],
  ];

  for (let i = 0; i < stones.length; i++) {
    const p = stones[i];
    b.part(
      new THREE.DodecahedronGeometry(0.09 + i * 0.012, 0),
      stonePaint,
      { at: p, name: `rootStone${i}`, group: "ground-accent" },
    );
    const crystal = b.part(
      new THREE.ConeGeometry(0.018 + i * 0.004, 0.09 + i * 0.02, 6),
      VEIN,
      { at: [p[0], p[1] + 0.08, p[2]], name: `stoneLight${i}` },
    );
    glow(crystal, 2.6);
  }

  return b.root;
}
```
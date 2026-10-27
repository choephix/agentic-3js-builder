```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  glow,
} from "agentic-3js-builder";

export const meta = {
  name: "bioluminescent-alien-plant",
  description:
    "A stylized Avatar-inspired alien plant with a luminous violet trunk, cyan-veined leaves, glowing seed nodes, hanging tendrils, crown petals, and rooted tendrils.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const CYAN = "#5fffe5";
  const CYAN_DARK = "#087f86";
  const TURQUOISE = "#16c6b2";
  const VIOLET = "#54206f";
  const VIOLET_DARK = "#24113d";
  const MAGENTA = "#ff3fcf";
  const PINK = "#ff83e9";
  const LIME = "#b8ff61";
  const DEEP = "#111b35";
  const AMBER = "#ffd866";

  const root = b.joint("root", {
    at: [0, 0.2, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const trunkPath = catmull([
    [0, 0.2, 0],
    [0.015, 0.48, 0.01],
    [-0.035, 0.82, -0.015],
    [0.03, 1.15, 0.015],
    [-0.015, 1.48, 0.02],
    [0, 1.78, 0],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "trunkCrown"],
    role: "spine",
  });

  const trunkTube = b.sweep(trunk, (t) => 0.145 - t * 0.055, {
    color: VIOLET,
    sides: 8,
    sections: undefined,
  } as any);
  glow(trunkTube, 0.3);

  const rootBulb = b.part(
    new THREE.SphereGeometry(0.2, 10, 7),
    VIOLET_DARK,
    {
      bone: root,
      at: [0, 0.2, 0],
      scale: [1.05, 0.72, 0.95],
      flat: true,
      name: "root-bulb",
      group: "base",
    },
  );

  const rootHalo = b.part(
    new THREE.SphereGeometry(0.125, 8, 5),
    CYAN_DARK,
    {
      bone: root,
      at: [0, 0.205, 0.005],
      scale: [1.3, 0.45, 1.3],
      flat: true,
      name: "root-halo",
      group: "bioluminescence",
    },
  );
  glow(rootHalo, 1.3);

  const trunkBands = [
    [0.42, 0.18],
    [0.73, 0.22],
    [1.05, 0.2],
    [1.35, 0.17],
    [1.6, 0.14],
  ];

  for (let i = 0; i < trunkBands.length; i++) {
    const [y, r] = trunkBands[i];
    const ring = b.part(
      new THREE.TorusGeometry(r, 0.012, 5, 12),
      i % 2 ? CYAN : MAGENTA,
      {
        bone: trunk.joints[Math.min(i + 1, trunk.joints.length - 1)],
        at: [0, y, 0],
        rotation: [0, 0, 0],
        name: `trunk-light-ring-${i}`,
        group: "bioluminescence",
      },
    );
    glow(ring, 1.5);
  }

  const nodePositions = [
    [0.01, 0.55, 0.12],
    [-0.03, 0.88, -0.13],
    [0.02, 1.16, 0.12],
    [-0.02, 1.42, -0.1],
    [0.01, 1.64, 0.09],
  ];

  for (let i = 0; i < nodePositions.length; i++) {
    const node = b.part(
      new THREE.SphereGeometry(0.042 - i * 0.003, 8, 6),
      i % 2 ? MAGENTA : CYAN,
      {
        bone: trunk.joints[Math.min(i + 1, trunk.joints.length - 1)],
        at: nodePositions[i],
        flat: true,
        name: `trunk-seed-${i}`,
        group: "seed-nodes",
      },
    );
    glow(node, 2.2);
  }

  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.055, 0.05, "sharp"],
    [0.14, 0.2, "sharp"],
    [0.22, 0.42, "sharp"],
    [0.18, 0.66, "sharp"],
    [0.07, 0.84, "sharp"],
    [0, 0.96, "sharp"],
    [-0.07, 0.84, "sharp"],
    [-0.18, 0.66, "sharp"],
    [-0.22, 0.42, "sharp"],
    [-0.14, 0.2, "sharp"],
    [-0.055, 0.05, "sharp"],
  ];

  const narrowLeafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.04, 0.08, "sharp"],
    [0.1, 0.3, "sharp"],
    [0.08, 0.58, "sharp"],
    [0, 0.78, "sharp"],
    [-0.08, 0.58, "sharp"],
    [-0.1, 0.3, "sharp"],
    [-0.04, 0.08, "sharp"],
  ];

  const makeLeaf = (
    name: string,
    at: THREE.Vector3,
    radial: THREE.Vector3,
    length: number,
    width: number,
    color: string,
    bone: any,
    narrow = false,
  ) => {
    const r = radial.clone().normalize();
    const tangent = new THREE.Vector3(-r.z, 0, r.x).normalize();
    const verticalRadial = r.clone().multiplyScalar(0.28).add(new THREE.Vector3(0, 0.96, 0)).normalize();

    const outline = (narrow ? narrowLeafOutline : leafOutline).map(([x, y, sharp]) => [
      x * width / 0.22,
      y * length / 0.42,
      sharp,
    ] as [number, number, "sharp"]);

    const leaf = b.extrude(outline, {
      at,
      x: [tangent.x, tangent.y, tangent.z],
      y: [verticalRadial.x, verticalRadial.y, verticalRadial.z],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 0,
      color,
      bone,
      name,
      group: "leaves",
    });
    glow(leaf, 0.95);

    const tip = at.clone().add(verticalRadial.clone().multiplyScalar(length * 0.92));
    const vein = b.rod(at, tip, 0.012, {
      color: CYAN,
      bone,
      caps: "round",
      name: `${name}-central-vein`,
      group: "leaf-veins",
    });
    glow(vein, 1.8);

    for (const f of [0.34, 0.57, 0.76]) {
      const center = at.clone().lerp(tip, f);
      const branchA = center.clone().add(tangent.clone().multiplyScalar(width * 0.46 * (1 - f * 0.25)));
      const branchB = center.clone().add(tangent.clone().multiplyScalar(-width * 0.46 * (1 - f * 0.25)));
      const sideVeinA = b.rod(center, branchA, 0.004, {
        color: CYAN,
        bone,
        caps: "flat",
        name: `${name}-vein-a-${f}`,
        group: "leaf-veins",
      });
      const sideVeinB = b.rod(center, branchB, 0.004, {
        color: CYAN,
        bone,
        caps: "flat",
        name: `${name}-vein-b-${f}`,
        group: "leaf-veins",
      });
      glow(sideVeinA, 1.7);
      glow(sideVeinB, 1.7);
    }

    const tipNode = b.part(
      new THREE.SphereGeometry(0.035, 7, 5),
      PINK,
      {
        bone,
        at: tip,
        flat: true,
        name: `${name}-tip-light`,
        group: "bioluminescence",
      },
    );
    glow(tipNode, 2.4);
  };

  const branchData = [
    { s: 1, y: 0.54, z: 0.01, reach: 0.48, lift: 0.18 },
    { s: -1, y: 0.61, z: -0.01, reach: 0.5, lift: 0.23 },
    { s: 1, y: 0.86, z: 0.015, reach: 0.58, lift: 0.2 },
    { s: -1, y: 0.96, z: 0.005, reach: 0.6, lift: 0.26 },
    { s: 1, y: 1.2, z: 0.01, reach: 0.48, lift: 0.22 },
    { s: -1, y: 1.28, z: -0.01, reach: 0.5, lift: 0.25 },
    { s: 1, y: 1.47, z: 0.015, reach: 0.4, lift: 0.18 },
    { s: -1, y: 1.51, z: 0, reach: 0.42, lift: 0.2 },
  ];

  for (let i = 0; i < branchData.length; i++) {
    const d = branchData[i];
    const angle = (i % 2 === 0 ? 0.18 : -0.2) + (i % 4) * 0.17;
    const radial = new THREE.Vector3(
      d.s * Math.cos(angle),
      0,
      Math.sin(angle),
    ).normalize();

    const base = new THREE.Vector3(0, d.y, d.z);
    const mid = base.clone()
      .add(radial.clone().multiplyScalar(d.reach * 0.45))
      .add(new THREE.Vector3(0, d.lift * 0.45, 0));
    const tip = base.clone()
      .add(radial.clone().multiplyScalar(d.reach))
      .add(new THREE.Vector3(0, d.lift, 0));

    const branchPath = catmull([base, mid, tip]);
    const branch = b.chain(`branch${i}`, branchPath, {
      parent: trunk.joints[Math.min(1 + Math.floor(i / 2), trunk.joints.length - 1)],
      names: [`branch${i}Base`, `branch${i}Tip`],
      role: "arm",
    });

    const branchTube = b.sweep(branch, [0.052, 0.018], {
      color: i % 2 ? TURQUOISE : VIOLET,
      sides: 7,
      caps: "round",
      name: `branch-${i}`,
      group: "branches",
    });
    glow(branchTube, 0.7);

    const leafBase = tip.clone().add(radial.clone().multiplyScalar(0.01));
    const leafUp = new THREE.Vector3(0, 1, 0);

    makeLeaf(
      `leaf-${i}-upper`,
      leafBase,
      radial.clone().add(leafUp.clone().multiplyScalar(0.35)),
      0.42 + (i % 3) * 0.06,
      0.19 + (i % 2) * 0.025,
      i % 2 ? TURQUOISE : CYAN_DARK,
      branch.tip,
      false,
    );

    const secondBase = tip.clone()
      .add(radial.clone().multiplyScalar(-0.025))
      .add(new THREE.Vector3(0, 0.015, 0));
    makeLeaf(
      `leaf-${i}-side`,
      secondBase,
      radial.clone().multiplyScalar(0.55).add(new THREE.Vector3(0, 0.75, 0)),
      0.3 + (i % 2) * 0.05,
      0.13,
      i % 2 ? CYAN_DARK : TURQUOISE,
      branch.tip,
      true,
    );

    const branchNode = b.part(
      new THREE.SphereGeometry(0.045, 8, 6),
      i % 2 ? MAGENTA : LIME,
      {
        bone: branch.tip,
        at: tip,
        flat: true,
        name: `branch-node-${i}`,
        group: "seed-nodes",
      },
    );
    glow(branchNode, 2.5);
  }

  const crownCenter = new THREE.Vector3(0, 1.78, 0);

  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    const petalBase = crownCenter.clone().add(radial.clone().multiplyScalar(0.035));
    const petalTip = crownCenter.clone()
      .add(radial.clone().multiplyScalar(0.32))
      .add(new THREE.Vector3(0, 0.18 + (i % 2) * 0.045, 0));

    const petal = b.extrude(
      [
        [0, 0, "sharp"],
        [0.09, 0.06, "sharp"],
        [0.12, 0.22, "sharp"],
        [0, 0.39, "sharp"],
        [-0.12, 0.22, "sharp"],
        [-0.09, 0.06, "sharp"],
      ],
      {
        at: petalBase,
        x: [-Math.sin(a), 0, Math.cos(a)],
        y: [radial.x * 0.68, 0.72, radial.z * 0.68],
        thickness: 0.022,
        bevel: 0.005,
        color: i % 2 ? MAGENTA : PINK,
        bone: trunk.tip,
        name: `crown-petal-${i}`,
        group: "crown",
      },
    );
    glow(petal, 1.4);

    const petalRib = b.rod(petalBase, petalTip, 0.009, {
      color: AMBER,
      bone: trunk.tip,
      caps: "round",
      name: `crown-rib-${i}`,
      group: "crown-veins",
    });
    glow(petalRib, 2.3);
  }

  const crownOrb = b.part(
    new THREE.SphereGeometry(0.13, 10, 7),
    AMBER,
    {
      bone: trunk.tip,
      at: [0, 1.88, 0],
      scale: [1, 1.18, 1],
      flat: true,
      name: "crown-heart",
      group: "bioluminescence",
    },
  );
  glow(crownOrb, 3.2);

  const crownCore = b.part(
    new THREE.SphereGeometry(0.065, 8, 6),
    "#fff9b0",
    {
      bone: trunk.tip,
      at: [0, 1.9, 0.015],
      flat: true,
      name: "crown-core",
      group: "bioluminescence",
    },
  );
  glow(crownCore, 4);

  const tendrilColors = [MAGENTA, CYAN, PINK, LIME, CYAN];
  const tendrilRoots = [
    [0.05, 1.42, 0.03],
    [-0.06, 1.28, -0.02],
    [0.07, 1.05, 0.02],
    [-0.08, 0.88, 0],
    [0.04, 0.7, -0.04],
  ];

  for (let i = 0; i < tendrilRoots.length; i++) {
    const p = new THREE.Vector3(...tendrilRoots[i] as [number, number, number]);
    const s = i % 2 === 0 ? 1 : -1;
    const tendrilPath = catmull([
      p,
      p.clone().add(new THREE.Vector3(s * 0.12, -0.08, 0.08)),
      p.clone().add(new THREE.Vector3(s * 0.18, -0.28, -0.05)),
      p.clone().add(new THREE.Vector3(s * 0.11, -0.5, 0.12)),
      p.clone().add(new THREE.Vector3(s * 0.26, -0.66, 0.04)),
    ]);

    const tendril = b.chain(`tendril${i}`, tendrilPath, {
      parent: trunk.joints[Math.max(0, Math.min(trunk.joints.length - 1, i))],
      names: [`tendril${i}Base`, `tendril${i}Mid`, `tendril${i}Tip`],
      role: "tentacle",
    });

    const tube = b.sweep(tendril, [0.018, 0.006], {
      color: tendrilColors[i],
      sides: 6,
      caps: "round",
      name: `hanging-tendril-${i}`,
      group: "tendrils",
    });
    glow(tube, 1.4);

    const end = tendril.at(1).at;
    const bead = b.part(
      new THREE.SphereGeometry(0.032, 7, 5),
      tendrilColors[i],
      {
        bone: tendril.tip,
        at: end,
        flat: true,
        name: `tendril-bead-${i}`,
        group: "bioluminescence",
      },
    );
    glow(bead, 2.5);
  }

  const rootDirections = [
    [1, 0, 0.2],
    [-1, 0, 0.18],
    [0.45, 0, 1],
    [-0.5, 0, 1],
    [0.75, 0, -0.8],
    [-0.72, 0, -0.76],
  ];

  for (let i = 0; i < rootDirections.length; i++) {
    const d = new THREE.Vector3(...rootDirections[i] as [number, number, number]).normalize();
    const base = new THREE.Vector3(0, 0.19, 0);
    const mid = d.clone().multiplyScalar(0.24).add(new THREE.Vector3(0, 0.07, 0));
    const end = d.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.025, 0));

    const rootPath = catmull([base, mid, end]);
    const rootChain = b.chain(`rootVine${i}`, rootPath, {
      parent: root,
      names: [`rootVine${i}Base`, `rootVine${i}Tip`],
      role: "tentacle",
    });
    const rootTube = b.sweep(rootChain, [0.07, 0.012], {
      color: i % 2 ? VIOLET : CYAN_DARK,
      sides: 7,
      caps: "round",
      name: `root-vine-${i}`,
      group: "roots",
    });
    glow(rootTube, 0.4);

    const rootLight = b.part(
      new THREE.SphereGeometry(0.025, 6, 5),
      i % 2 ? CYAN : MAGENTA,
      {
        bone: rootChain.tip,
        at: end,
        flat: true,
        name: `root-light-${i}`,
        group: "bioluminescence",
      },
    );
    glow(rootLight, 1.8);
  }

  const collar = b.part(
    new THREE.TorusGeometry(0.135, 0.018, 6, 16),
    CYAN,
    {
      bone: trunk.joints[trunk.joints.length - 2],
      at: [0, 1.62, 0],
      name: "upper-stem-collar",
      group: "bioluminescence",
    },
  );
  glow(collar, 1.8);

  const lowerCollar = b.part(
    new THREE.TorusGeometry(0.17, 0.014, 6, 16),
    MAGENTA,
    {
      bone: trunk.joints[1],
      at: [0, 0.48, 0],
      name: "lower-stem-collar",
      group: "bioluminescence",
    },
  );
  glow(lowerCollar, 1.6);

  return b.root;
}
```
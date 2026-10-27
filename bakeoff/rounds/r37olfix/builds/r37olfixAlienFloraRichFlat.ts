import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A stylized Avatar-inspired alien plant with a braided luminous trunk, broad violet leaves, cyan veins, dangling tendrils, and glowing seed pods.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const ROOT = "#132833";
  const ROOT_DARK = "#091720";
  const STEM = "#173f4c";
  const STEM_LIGHT = "#287d83";
  const LEAF = "#174b58";
  const LEAF_LIT = "#2b9a91";
  const LEAF_EDGE = "#7ce7c7";
  const VEIN = "#55f3d0";
  const CYAN = "#48f7dc";
  const BLUE = "#3db9ff";
  const VIOLET = "#643fba";
  const MAGENTA = "#d35cff";
  const POD = "#9d5cff";
  const POD_CORE = "#e6a8ff";
  const INK = "#08141c";

  const root = b.joint("root", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const trunkPath = catmull([
    [0, 0.08, 0],
    [0.03, 0.28, -0.01],
    [-0.025, 0.57, 0.015],
    [0.02, 0.9, -0.01],
    [-0.015, 1.2, 0.02],
    [0.015, 1.49, 0.0],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "trunkTip"],
    role: "spine",
  });

  const trunkSkin = b.sweep(trunk, (t) => 0.12 - t * 0.045, {
    color: ROOT,
    sides: 7,
    smooth: false,
    section: "circle",
  });

  b.sweep(trunkPath, (t) => 0.073 - t * 0.028, {
    bone: trunk,
    color: STEM,
    sides: 7,
    smooth: false,
    shift: (t) => [0.018 * Math.sin(t * 9), 0],
    from: 0.08,
    to: 1,
  });

  const collar = b.sweep(
    polyline([
      [0, 0.39, 0],
      [0.12, 0.43, 0.01],
      [0.0, 0.48, 0.03],
      [-0.12, 0.43, 0.01],
      [0, 0.39, 0],
    ], { closed: true }),
    0.014,
    { color: CYAN, bone: trunk.joints[1] },
  );
  glow(collar, 1.2);

  const rootRidges = [
    [[0, 0.08, 0], [0.26, 0.035, 0.09]],
    [[0, 0.08, 0], [-0.25, 0.035, 0.12]],
    [[0, 0.08, 0], [0.08, 0.035, 0.29]],
    [[0, 0.08, 0], [-0.07, 0.035, -0.27]],
    [[0, 0.08, 0], [0.3, 0.035, -0.14]],
    [[0, 0.08, 0], [-0.29, 0.035, -0.08]],
  ] as [number[], number[]][];

  for (let i = 0; i < rootRidges.length; i++) {
    const [a, z] = rootRidges[i];
    const ridge = b.sweep(polyline([a, z]), [0.035, 0.012], {
      color: i % 2 ? STEM : ROOT_DARK,
      bone: root,
      sides: 6,
      smooth: false,
    });
    if (i === 2 || i === 4) glow(ridge, 0.35);
  }

  function stem(
    name: string,
    points: number[][],
    radii: number[],
    color = STEM_LIGHT,
  ) {
    const path = catmull(points);
    const chain = b.chain(name, path, {
      parent: trunk.joints[Math.max(0, Math.min(trunk.joints.length - 1, Math.floor(points[0][1] * 3)))],
      role: "spine",
      count: Math.max(2, points.length - 1),
    });
    const tube = b.sweep(chain, (t) => {
      const i = Math.min(radii.length - 1, Math.floor(t * radii.length));
      return radii[i];
    }, {
      color,
      sides: 6,
      smooth: false,
    });
    return { path, chain, tube };
  }

  const leftBranch = stem(
    "branchL",
    [[0, 0.62, 0], [0.22, 0.78, 0.01], [0.43, 0.96, 0.02], [0.58, 1.06, 0.08]],
    [0.055, 0.042, 0.025],
  );
  const rightBranch = stem(
    "branchR",
    [[0.0, 0.82, 0.01], [-0.2, 0.98, 0.015], [-0.42, 1.13, 0.03], [-0.57, 1.2, 0.1]],
    [0.052, 0.041, 0.024],
  );
  const upperBranch = stem(
    "branchUpper",
    [[0.01, 1.16, 0], [0.18, 1.32, 0.02], [0.28, 1.49, 0.04], [0.27, 1.62, 0.11]],
    [0.046, 0.034, 0.018],
  );
  const rearBranch = stem(
    "branchRear",
    [[-0.01, 1.32, 0], [-0.1, 1.49, -0.1], [-0.12, 1.65, -0.2], [-0.1, 1.77, -0.25]],
    [0.04, 0.03, 0.015],
    STEM,
  );

  function leaf(
    name: string,
    at: [number, number, number],
    side: number,
    length: number,
    width: number,
    tilt = 0,
  ) {
    const leafPart = b.extrude(
      [
        [0, 0],
        [width * 0.28, length * 0.18],
        [width * 0.48, length * 0.52],
        [width * 0.23, length * 0.87],
        [0, length],
        [-width * 0.23, length * 0.87],
        [-width * 0.48, length * 0.52],
        [-width * 0.28, length * 0.18],
      ],
      {
        at,
        x: [side, 0, tilt],
        y: [0, 1, 0],
        thickness: [0.018, 0.006],
        bevel: 0.005,
        smoothing: 0,
        bone: trunk,
        color: LEAF,
        name,
        group: "leaves",
      },
    );

    const vein = b.sweep(
      polyline([
        [at[0], at[1] + 0.015, at[2] + 0.012],
        [at[0] + side * width * 0.08, at[1] + length * 0.33, at[2] + 0.018],
        [at[0] + side * width * 0.04, at[1] + length * 0.68, at[2] + 0.024],
        [at[0], at[1] + length, at[2] + 0.02],
      ]),
      [0.012, 0.003],
      { color: VEIN, bone: trunk, sides: 5, smooth: false },
    );
    glow(vein, 1.5);

    for (const f of [-0.72, -0.36, 0.36, 0.72]) {
      const y = length * (0.22 + Math.abs(f) * 0.58);
      const half = width * (0.18 + (1 - Math.abs(f)) * 0.17);
      const branchVein = b.rod(
        [at[0] + side * 0.01, at[1] + y, at[2] + 0.023],
        [at[0] + side * half, at[1] + y + length * 0.12, at[2] + 0.026],
        0.004,
        { color: CYAN, bone: trunk, sides: 5 },
      );
      glow(branchVein, 1.15);
    }

    return leafPart;
  }

  leaf("leafLeftLow", [0.2, 0.72, 0.01], 1, 0.42, 0.28, 0.16);
  leaf("leafRightLow", [-0.18, 0.94, 0.015], -1, 0.46, 0.3, -0.13);
  leaf("leafLeftMid", [0.4, 1.0, 0.07], 1, 0.5, 0.34, 0.21);
  leaf("leafRightMid", [-0.39, 1.12, 0.08], -1, 0.52, 0.35, -0.2);
  leaf("leafCrown", [0.18, 1.42, 0.08], 1, 0.5, 0.3, 0.12);
  leaf("leafRear", [-0.1, 1.55, -0.2], -1, 0.48, 0.27, -0.08);

  function tendril(
    name: string,
    points: number[][],
    color = CYAN,
    radius = 0.012,
  ) {
    const path = catmull(points);
    const chain = b.chain(name, path, {
      parent: trunk.joints[trunk.joints.length - 1],
      role: "tentacle",
      count: Math.max(2, points.length - 1),
    });
    const tube = b.sweep(chain, (t) => radius * (1 - 0.72 * t), {
      color,
      sides: 5,
      smooth: false,
      caps: "point",
    });
    glow(tube, 1.3);
    return { chain, tube };
  }

  tendril("tendrilL", [
    [0.56, 1.05, 0.08],
    [0.7, 0.97, 0.1],
    [0.76, 0.78, 0.13],
    [0.68, 0.64, 0.16],
    [0.77, 0.54, 0.18],
  ]);
  tendril("tendrilR", [
    [-0.55, 1.2, 0.1],
    [-0.7, 1.12, 0.12],
    [-0.78, 0.94, 0.16],
    [-0.71, 0.78, 0.19],
    [-0.82, 0.7, 0.21],
  ], BLUE, 0.011);
  tendril("tendrilCrown", [
    [0.27, 1.61, 0.11],
    [0.38, 1.72, 0.14],
    [0.34, 1.84, 0.16],
    [0.42, 1.93, 0.2],
  ], MAGENTA, 0.009);

  function pod(
    name: string,
    p: [number, number, number],
    scale: [number, number, number],
    color = POD,
  ) {
    const podPart = b.part(
      new THREE.SphereGeometry(1, 10, 7),
      color,
      {
        bone: trunk,
        at: p,
        scale,
        name,
        group: "glowing-seed-pods",
      },
    );
    glow(podPart, 1.7);

    const core = b.part(
      new THREE.SphereGeometry(1, 8, 5),
      POD_CORE,
      {
        bone: trunk,
        at: [p[0], p[1], p[2] + scale[2] * 0.78],
        scale: [scale[0] * 0.36, scale[1] * 0.36, scale[2] * 0.2],
        name: `${name}Core`,
        group: "glowing-seed-pods",
      },
    );
    glow(core, 2.4);

    const ring = b.sweep(
      polyline([
        [p[0] - scale[0] * 0.65, p[1], p[2] + scale[2] * 0.25],
        [p[0], p[1] + scale[1] * 0.03, p[2] + scale[2] * 0.34],
        [p[0] + scale[0] * 0.65, p[1], p[2] + scale[2] * 0.25],
      ]),
      0.006,
      { color: CYAN, bone: trunk, sides: 5, smooth: false },
    );
    glow(ring, 1.8);
  }

  pod("podLeft", [0.78, 0.53, 0.18], [0.09, 0.13, 0.1]);
  pod("podRight", [-0.83, 0.69, 0.21], [0.085, 0.12, 0.095], BLUE);
  pod("podCrown", [0.42, 1.94, 0.2], [0.075, 0.12, 0.08], MAGENTA);
  pod("podHeart", [0.0, 1.67, 0.08], [0.1, 0.15, 0.09], "#3d8dff");

  const crownSpines = [
    [[0.0, 1.54, 0.02], [0.0, 1.78, 0.02]],
    [[0.0, 1.56, 0.02], [0.12, 1.76, 0.04]],
    [[0.0, 1.56, 0.02], [-0.13, 1.74, 0.03]],
    [[0.0, 1.55, 0.02], [0.2, 1.69, 0.07]],
    [[0.0, 1.55, 0.02], [-0.2, 1.67, 0.06]],
  ] as [number[], number[]][];

  for (let i = 0; i < crownSpines.length; i++) {
    const s = b.spike(crownSpines[i][0], crownSpines[i][1], null, 0.018, {
      color: i % 2 ? BLUE : CYAN,
      bone: trunk,
      sides: 5,
      name: `crownSpine${i}`,
    });
    glow(s, 1.4);
  }

  const floorGlow = b.part(
    new THREE.CylinderGeometry(0.22, 0.28, 0.025, 12),
    ROOT_DARK,
    { bone: root, at: [0, 0.012, 0], name: "rootShadow" },
  );

  const halo = b.part(
    new THREE.CylinderGeometry(0.16, 0.19, 0.008, 12),
    CYAN,
    { bone: root, at: [0, 0.03, 0], name: "rootHalo" },
  );
  glow(halo, 1.6);

  const rngGlow = rng(19);
  for (let i = 0; i < 9; i++) {
    const a = rngGlow() * Math.PI * 2;
    const r = 0.1 + rngGlow() * 0.2;
    const pebble = b.part(
      new THREE.IcosahedronGeometry(0.012 + rngGlow() * 0.012, 0),
      i % 2 ? BLUE : CYAN,
      {
        bone: root,
        at: [Math.cos(a) * r, 0.045 + rngGlow() * 0.01, Math.sin(a) * r],
        name: `rootLumens${i}`,
      },
    );
    glow(pebble, 1.4);
  }

  return b.root;
}

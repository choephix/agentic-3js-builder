import * as THREE from "three";
import {
  catmull,
  createBuilder,
  polyline,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A stylized Avatar-inspired alien plant with luminous turquoise foliage, violet sap veins, glowing seed pods, spiral vines, roots, and a radiant crown flower.",
};

const TRUNK = "#173c49";
const TRUNK_LIGHT = "#2b6870";
const ROOT_DARK = "#102d38";
const LEAF = "#1d6b68";
const LEAF_LIGHT = "#3ca98e";
const LEAF_DARK = "#123f50";
const CYAN = "#55f6d5";
const CYAN_PALE = "#b5ffe5";
const BLUE = "#37a8d2";
const VIOLET = "#653caa";
const MAGENTA = "#d849b9";
const PINK = "#ff83d0";
const LIME = "#a9f15b";
const AMBER = "#ffd45f";
const INK = "#091d31";

const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);

function v(p: THREE.Vector3 | [number, number, number]) {
  return p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);
}

function add(a: THREE.Vector3, b: THREE.Vector3) {
  return a.clone().add(b);
}

function scaled(a: THREE.Vector3, n: number) {
  return a.clone().multiplyScalar(n);
}

function leafSide(direction: THREE.Vector3) {
  const d = direction.clone().normalize();
  let side = new THREE.Vector3().crossVectors(UP, d);
  if (side.lengthSq() < 0.001) side = new THREE.Vector3(1, 0, 0);
  return side.normalize();
}

function makeLeaf(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3,
  direction: THREE.Vector3,
  width: number,
  length: number,
  bone: any,
  index: number,
) {
  const dir = direction.clone().normalize();
  const side = leafSide(dir);
  const normal = new THREE.Vector3().crossVectors(side, dir).normalize();

  const outline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [width * 0.58, length * 0.2, "sharp"],
    [width * 0.52, length * 0.48, "sharp"],
    [width * 0.3, length * 0.76, "sharp"],
    [0, length, "sharp"],
    [-width * 0.3, length * 0.76, "sharp"],
    [-width * 0.52, length * 0.48, "sharp"],
    [-width * 0.58, length * 0.2, "sharp"],
  ];

  const leaf = b.extrude(outline, {
    at: base,
    x: side,
    y: dir,
    thickness: [0.018, 0.006],
    bevel: 0.006,
    smoothing: 1,
    color: index % 3 === 0 ? LEAF_LIGHT : LEAF,
    bone,
    group: "foliage",
    name: `leaf${index}`,
  });

  const worldPoint = (x: number, y: number, lift = 0) =>
    base
      .clone()
      .addScaledVector(side, x)
      .addScaledVector(dir, y)
      .addScaledVector(normal, lift);

  const edgePoints = outline.map(([x, y]) => worldPoint(x, y, 0.012));
  const edge = b.sweep(polyline(edgePoints, { closed: true }), 0.009, {
    color: index % 2 === 0 ? CYAN : BLUE,
    bone,
    caps: "none",
    section: { ngon: 6 },
    group: "luminescent-rims",
    name: `leafEdge${index}`,
  });
  glow(edge, 1.4);

  const centerStart = worldPoint(0, length * 0.025, 0.02);
  const centerEnd = worldPoint(0, length * 0.96, 0.02);
  const vein = b.sweep(
    catmull([
      centerStart,
      worldPoint(0, length * 0.36, 0.022),
      worldPoint(0, length * 0.7, 0.02),
      centerEnd,
    ]),
    [0.014, 0.006],
    {
      color: CYAN_PALE,
      bone,
      caps: { start: "round", end: "point" },
      group: "luminescent-veins",
      name: `leafVein${index}`,
    },
  );
  glow(vein, 2.1);

  for (let i = 0; i < 3; i++) {
    const t = 0.32 + i * 0.2;
    const center = worldPoint(0, length * t, 0.019);
    const span = width * (0.34 - i * 0.045);
    for (const sideSign of [-1, 1]) {
      const end = worldPoint(sideSign * span, length * (t + 0.095), 0.019);
      const rib = b.rod(center, end, 0.0045, {
        color: index % 2 === 0 ? BLUE : VIOLET,
        bone,
        group: "leaf-ribs",
        name: `leafRib${index}_${i}_${sideSign > 0 ? "L" : "R"}`,
      });
      glow(rib, 1.35);
    }
  }

  const spotTs = [0.27, 0.52, 0.73];
  spotTs.forEach((t, i) => {
    const sideSign = i % 2 === 0 ? 1 : -1;
    const x = sideSign * width * (0.15 + 0.07 * i);
    const p = worldPoint(x, length * t, 0.035);
    const spot = b.part(
      new THREE.SphereGeometry(0.018 + i * 0.004, 8, 5),
      i === 1 ? PINK : CYAN_PALE,
      {
        at: p,
        bone,
        scale: [1, 0.35, 1],
        group: "leaf-lights",
        name: `leafSpot${index}_${i}`,
      },
    );
    glow(spot, 2.4);
  });

  return leaf;
}

function makePod(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  bone: any,
  index: number,
  scale = 1,
) {
  const pod = b.part(
    new THREE.SphereGeometry(0.07 * scale, 10, 7),
    index % 2 === 0 ? MAGENTA : CYAN,
    {
      at,
      bone,
      scale: [0.78, 1.18, 0.78],
      group: "seed-pods",
      name: `seedPod${index}`,
    },
  );
  glow(pod, 2.8);

  const crown = b.ring(
    { at, axis: [0, 1, 0] },
    {
      count: 6,
      radius: 0.065 * scale,
      tilt: -18,
      fromDeg: 0,
      toDeg: 360,
      name: `podCalyx${index}`,
      group: "pod-calyx",
      role: "fan",
      parent: bone,
    },
    (item) => {
      const spike = b.spike(item, item, 0.065 * scale, 0.009 * scale, {
        color: index % 2 === 0 ? PINK : CYAN_PALE,
        group: "pod-calyx",
        name: `podSpine${index}_${item.i}`,
      });
      glow(spike, 2.3);
    },
  );

  const band = b.part(
    new THREE.TorusGeometry(0.061 * scale, 0.006 * scale, 5, 12),
    AMBER,
    {
      at: at.clone().add(new THREE.Vector3(0, 0.01 * scale, 0)),
      bone,
      rotation: [0, 0, 0],
      group: "pod-rings",
      name: `podRing${index}`,
    },
  );
  glow(band, 1.8);

  return { pod, crown, band };
}

export default function build() {
  const b = createBuilder({
    name: "bioluminescent-alien-plant",
    detail: 1,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one rooted plant body, a segmented central stalk, spreading fronds, and winding vines.

  const root = b.joint("root", {
    at: [0, 0.1, 0],
    aim: [0, 0.3, 0],
    role: "spine",
    group: "plant-skeleton",
  });

  const stalkPath = catmull([
    [0, 0.14, 0],
    [0.015, 0.42, 0.01],
    [-0.018, 0.78, 0.025],
    [0.025, 1.12, 0.0],
    [-0.01, 1.46, 0.03],
    [0, 1.78, 0],
  ]);

  const stalk = b.chain("stalk", stalkPath, {
    parent: root,
    names: [
      "stalkBase",
      "stalkLow",
      "stalkMid",
      "stalkHigh",
      "stalkCrown",
      "stalkTip",
    ],
    role: "spine",
    group: "plant-skeleton",
  });

  const stalkTube = b.sweep(stalk, (t) => 0.13 * (1 - t) + 0.06 * t, {
    color: TRUNK,
    sectors: [
      [-58, 58, TRUNK_LIGHT],
      [122, 238, ROOT_DARK],
    ],
    section: { ngon: 8 },
    caps: "round",
    group: "central-stalk",
    name: "centralStalk",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Root crown: thick alien tendrils that grip the floor and end in small luminous root eyes.

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.18;
    const radial = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const base = new THREE.Vector3(0, 0.105, 0);
    const end = radial.clone().multiplyScalar(0.36 + (i % 3) * 0.045);
    end.y = 0.045;
    const mid = base
      .clone()
      .lerp(end, 0.48)
      .add(new THREE.Vector3(-radial.z, 0, radial.x).multiplyScalar((i % 2 ? 1 : -1) * 0.04));
    const rootChain = b.chain(
      `rootTendril${i}`,
      catmull([base, mid, end]),
      {
        parent: root,
        names: [`root${i}Base`, `root${i}Mid`, `root${i}Tip`],
        role: "tentacle",
        group: "plant-skeleton",
      },
    );

    const rootTube = b.sweep(rootChain, (t) => 0.055 * (1 - t) + 0.018 * t, {
      color: i % 2 === 0 ? ROOT_DARK : TRUNK,
      section: { ngon: 7 },
      caps: "round",
      group: "roots",
      name: `rootTendrilMesh${i}`,
    });

    if (i % 2 === 0) {
      const rootLight = b.part(
        new THREE.SphereGeometry(0.026, 7, 5),
        CYAN,
        {
          frame: rootChain.tip,
          scale: [1.25, 0.55, 1.25],
          group: "root-lights",
          name: `rootLight${i}`,
        },
      );
      glow(rootLight, 2.7);
    }

    const rootRidge = b.along(rootTube, 4, (at) => {
      const ridge = b.spike(at, at, 0.028, 0.006, {
        color: i % 2 ? BLUE : VIOLET,
        group: "root-ridges",
        name: `rootRidge${i}`,
      });
      glow(ridge, 1.2);
    });
    void rootRidge;
  }

  // Chunky basal collars make the stalk feel grown rather than constructed.
  for (let i = 0; i < 4; i++) {
    const collar = b.part(
      new THREE.TorusGeometry(0.104 - i * 0.012, 0.012, 6, 12),
      i % 2 ? VIOLET : TRUNK_LIGHT,
      {
        at: [0, 0.19 + i * 0.12, 0],
        bone: stalk.joints[Math.min(i, stalk.joints.length - 1)],
        rotation: [0, 0, 0],
        group: "stalk-collars",
        name: `stalkCollar${i}`,
      },
    );
    if (i % 2 === 1) glow(collar, 1.1);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main fronds. Each is a jointed branch with a broad extruded leaf, glowing rim, ribs, and seed pod.

  const frondData = [
    { t: 0.18, angle: -0.25, length: 0.52, rise: 0.18, width: 0.27 },
    { t: 0.29, angle: 2.48, length: 0.58, rise: 0.22, width: 0.3 },
    { t: 0.4, angle: 0.65, length: 0.64, rise: 0.27, width: 0.34 },
    { t: 0.51, angle: 3.08, length: 0.55, rise: 0.32, width: 0.31 },
    { t: 0.63, angle: -0.72, length: 0.66, rise: 0.3, width: 0.33 },
    { t: 0.73, angle: 2.12, length: 0.57, rise: 0.38, width: 0.3 },
    { t: 0.83, angle: 0.26, length: 0.5, rise: 0.43, width: 0.27 },
  ];

  frondData.forEach((data, i) => {
    const base = stalk.at(data.t).at.clone();
    const outward = new THREE.Vector3(Math.sin(data.angle), 0, Math.cos(data.angle));
    const sideways = new THREE.Vector3(Math.cos(data.angle), 0, -Math.sin(data.angle));

    const branchMid = base
      .clone()
      .addScaledVector(outward, data.length * 0.38)
      .addScaledVector(UP, data.rise * 0.25)
      .addScaledVector(sideways, i % 2 ? 0.035 : -0.035);

    const branchTip = base
      .clone()
      .addScaledVector(outward, data.length)
      .addScaledVector(UP, data.rise);

    const branch = b.chain(
      `frond${i}`,
      catmull([base, branchMid, branchTip]),
      {
        parent: stalk.nearestJoint(base),
        names: [`frond${i}Root`, `frond${i}Mid`, `frond${i}Tip`],
        role: "fan",
        group: "plant-skeleton",
      },
    );

    const stem = b.sweep(branch, (t) => 0.042 * (1 - t) + 0.018 * t, {
      color: i % 2 ? TRUNK_LIGHT : TRUNK,
      section: { ngon: 7 },
      caps: "round",
      group: "frond-stems",
      name: `frondStem${i}`,
    });

    const leafDirection = outward
      .clone()
      .multiplyScalar(0.72)
      .add(UP.clone().multiplyScalar(0.38))
      .add(sideways.clone().multiplyScalar(i % 2 ? 0.18 : -0.18))
      .normalize();

    makeLeaf(
      b,
      branch.tip.at.clone(),
      leafDirection,
      data.width,
      data.length * 0.82,
      branch.tip,
      i,
    );

    const podAt = branch.tip.at
      .clone()
      .addScaledVector(UP, 0.035)
      .addScaledVector(outward, 0.018);
    makePod(b, podAt, branch.tip, i, 0.72 + (i % 3) * 0.1);

    const stemGlow = b.along(stem, 4, (at) => {
      const bead = b.part(
        new THREE.SphereGeometry(0.018, 7, 5),
        i % 2 ? BLUE : CYAN,
        {
          frame: at,
          scale: [1, 0.7, 1],
          group: "stem-beads",
          name: `stemBead${i}`,
        },
      );
      glow(bead, 1.8);
    });
    void stemGlow;
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Crown fronds: five taller leaves make the silhouette feel like an alien flower or luminous canopy.

  const crownCenter = new THREE.Vector3(0, 1.72, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.38;
    const radial = new THREE.Vector3(Math.sin(a), 0.08, Math.cos(a)).normalize();
    const branchTip = crownCenter
      .clone()
      .addScaledVector(radial, 0.34 + (i % 2) * 0.06)
      .add(new THREE.Vector3(0, 0.15 + (i % 3) * 0.025, 0));

    const crownBranch = b.chain(
      `crownFrond${i}`,
      catmull([
        crownCenter,
        crownCenter.clone().lerp(branchTip, 0.5).add(new THREE.Vector3(0, 0.04, 0)),
        branchTip,
      ]),
      {
        parent: stalk.tip,
        names: [`crown${i}Root`, `crown${i}Mid`, `crown${i}Tip`],
        role: "fan",
        group: "plant-skeleton",
      },
    );

    b.sweep(crownBranch, [0.032, 0.013], {
      color: TRUNK_LIGHT,
      section: { ngon: 7 },
      group: "crown-stems",
      name: `crownStem${i}`,
    });

    const leafDir = radial
      .clone()
      .multiplyScalar(0.7)
      .add(UP.clone().multiplyScalar(0.72))
      .normalize();

    makeLeaf(
      b,
      crownBranch.tip.at.clone(),
      leafDir,
      0.22 + (i % 2) * 0.03,
      0.47 + (i % 3) * 0.04,
      crownBranch.tip,
      20 + i,
    );

    makePod(
      b,
      crownBranch.tip.at.clone().addScaledVector(UP, 0.03),
      crownBranch.tip,
      20 + i,
      0.58,
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Spiral bioluminescent vines wrapping around the trunk.

  for (let vineIndex = 0; vineIndex < 3; vineIndex++) {
    const phase = vineIndex * (Math.PI * 2 / 3);
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 13; i++) {
      const t = i / 12;
      const angle = phase + t * Math.PI * 2.35;
      const radius = 0.145 + 0.025 * Math.sin(t * Math.PI);
      points.push(
        new THREE.Vector3(
          Math.sin(angle) * radius,
          0.22 + t * 1.38,
          Math.cos(angle) * radius,
        ),
      );
    }

    const vine = b.sweep(catmull(points), 0.012, {
      color: vineIndex === 1 ? MAGENTA : CYAN,
      bone: root,
      section: { ngon: 6 },
      caps: "round",
      group: "spiral-vines",
      name: `spiralVine${vineIndex}`,
    });
    glow(vine, 2.3);

    b.along(vine, 9, (at) => {
      const node = b.part(
        new THREE.SphereGeometry(0.027, 8, 5),
        vineIndex === 1 ? PINK : CYAN_PALE,
        {
          frame: at,
          scale: [1.05, 1.35, 1.05],
          group: "vine-nodes",
          name: `vineNode${vineIndex}`,
        },
      );
      glow(node, 3.0);
    });
  }

  // A few flat alien scales sit between the vines on the lower stalk.
  for (let i = 0; i < 9; i++) {
    const t = 0.12 + i * 0.085;
    const angle = i * 2.4;
    const p = stalk.at(t).at.clone().add(
      new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle)).multiplyScalar(0.12),
    );
    const scale = b.extrude(
      [
        [0, 0, "sharp"],
        [0.028, 0.045, "sharp"],
        [0, 0.08, "sharp"],
        [-0.028, 0.045, "sharp"],
      ],
      {
        at: p,
        x: [Math.cos(angle), 0, -Math.sin(angle)],
        y: [0, 1, 0],
        thickness: 0.009,
        bevel: 0.002,
        color: i % 2 ? LEAF_DARK : VIOLET,
        bone: stalk.nearestJoint(p),
        group: "stalk-scales",
        name: `stalkScale${i}`,
      },
    );
    if (i % 3 === 0) glow(scale, 0.9);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Crown flower: a turned luminous heart, six broad petals, inner ribs, and an orbital halo.

  const nectar = b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.11, 0.045],
      [0.12, 0.105],
      [0.085, 0.17],
      [0.045, 0.23],
      [0, 0.26],
    ],
    {
      at: [0, 1.78, 0],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: MAGENTA,
      bone: stalk.tip,
      group: "crown-heart",
      name: "luminousNectar",
    },
  );
  glow(nectar, 3.6);

  const nectarCore = b.part(
    new THREE.SphereGeometry(0.055, 10, 7),
    CYAN_PALE,
    {
      at: [0, 1.91, 0.045],
      bone: stalk.tip,
      group: "crown-heart",
      name: "nectarCore",
    },
  );
  glow(nectarCore, 4.5);

  const petalOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.09, 0.14, "sharp"],
    [0.075, 0.3, "sharp"],
    [0.025, 0.48, "sharp"],
    [0, 0.58, "sharp"],
    [-0.025, 0.48, "sharp"],
    [-0.075, 0.3, "sharp"],
    [-0.09, 0.14, "sharp"],
  ];

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.18;
    const radial = new THREE.Vector3(Math.sin(a), 0.05, Math.cos(a)).normalize();
    const tangent = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).normalize();
    const petalBase = new THREE.Vector3(0, 1.78, 0)
      .addScaledVector(radial, 0.04)
      .addScaledVector(UP, 0.01);
    const petalDirection = radial
      .clone()
      .multiplyScalar(0.42)
      .add(UP.clone().multiplyScalar(0.9))
      .normalize();

    const petal = b.extrude(petalOutline, {
      at: petalBase,
      x: tangent,
      y: petalDirection,
      thickness: [0.014, 0.006],
      bevel: 0.008,
      smoothing: 1,
      color: i % 2 ? MAGENTA : VIOLET,
      bone: stalk.tip,
      group: "crown-petals",
      name: `crownPetal${i}`,
    });
    glow(petal, i % 2 ? 1.9 : 1.35);

    const petalWorld = (x: number, y: number, lift = 0) =>
      petalBase
        .clone()
        .addScaledVector(tangent, x)
        .addScaledVector(petalDirection, y)
        .addScaledVector(new THREE.Vector3().crossVectors(tangent, petalDirection).normalize(), lift);

    const petalEdgePoints = petalOutline.map(([x, y]) => petalWorld(x, y, 0.012));
    const petalEdge = b.sweep(polyline(petalEdgePoints, { closed: true }), 0.008, {
      color: i % 2 ? CYAN : PINK,
      bone: stalk.tip,
      caps: "none",
      group: "crown-rims",
      name: `crownRim${i}`,
    });
    glow(petalEdge, 2.0);

    const petalVein = b.rod(
      petalWorld(0, 0.06, 0.022),
      petalWorld(0, 0.5, 0.018),
      0.006,
      {
        color: CYAN_PALE,
        bone: stalk.tip,
        group: "crown-veins",
        name: `crownVein${i}`,
      },
    );
    glow(petalVein, 2.4);

    for (let j = 0; j < 2; j++) {
      const y = 0.23 + j * 0.13;
      const center = petalWorld(0, y, 0.02);
      const end = petalWorld((j === 0 ? 1 : -1) * 0.052, y + 0.08, 0.02);
      const rib = b.rod(center, end, 0.004, {
        color: BLUE,
        bone: stalk.tip,
        group: "crown-ribs",
        name: `crownRib${i}_${j}`,
      });
      glow(rib, 1.6);
    }
  }

  const halo = b.part(
    new THREE.TorusGeometry(0.19, 0.008, 6, 24),
    CYAN,
    {
      at: [0, 1.92, 0],
      bone: stalk.tip,
      rotation: [90, 0, 0],
      group: "crown-halo",
      name: "crownHalo",
    },
  );
  glow(halo, 2.8);

  const halo2 = b.part(
    new THREE.TorusGeometry(0.25, 0.004, 5, 24),
    VIOLET,
    {
      at: [0, 1.92, 0],
      bone: stalk.tip,
      rotation: [90, 0, 18],
      group: "crown-halo",
      name: "crownOuterHalo",
    },
  );
  glow(halo2, 1.8);

  // Small floating-looking, but attached, luminous bracts beneath the crown.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p = new THREE.Vector3(
      Math.sin(a) * 0.13,
      1.62 + (i % 2) * 0.035,
      Math.cos(a) * 0.13,
    );
    const bract = b.part(
      new THREE.ConeGeometry(0.026, 0.1, 6),
      i % 2 ? BLUE : LIME,
      {
        at: p,
        bone: stalk.nearestJoint(p),
        dir: [0, 1, 0],
        group: "crown-bracts",
        name: `crownBract${i}`,
      },
    );
    glow(bract, 1.8);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // A few broad lower leaves create a strong floor-level silhouette around the roots.

  const lowerLeaves = [
    {
      base: new THREE.Vector3(0.02, 0.26, 0.015),
      dir: new THREE.Vector3(0.9, 0.15, 0.25),
      width: 0.34,
      length: 0.58,
    },
    {
      base: new THREE.Vector3(-0.02, 0.3, 0.01),
      dir: new THREE.Vector3(-0.72, 0.2, -0.42),
      width: 0.31,
      length: 0.52,
    },
    {
      base: new THREE.Vector3(0.01, 0.24, 0.01),
      dir: new THREE.Vector3(0.05, 0.18, -0.98),
      width: 0.3,
      length: 0.55,
    },
  ];

  lowerLeaves.forEach((leafData, i) => {
    makeLeaf(
      b,
      leafData.base,
      leafData.dir,
      leafData.width,
      leafData.length,
      stalk.joints[0],
      40 + i,
    );
  });

  // A luminous collar at the crown transition gives the plant a clear focal neck.
  const crownCollar = b.part(
    new THREE.TorusGeometry(0.078, 0.014, 6, 16),
    CYAN_PALE,
    {
      at: [0, 1.58, 0],
      bone: stalk.joints[stalk.joints.length - 2],
      group: "crown-collar",
      name: "crownCollar",
    },
  );
  glow(crownCollar, 2.5);

  return b.root;
}

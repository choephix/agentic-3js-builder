import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, offset, rng } from "../../../../src/math";
import { bezier, catmull, polyline } from "../../../../src/path";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A low-poly whimsical desert oasis island with a turquoise spring, stepped sandstone arches, date palms, striped Bedouin merchant tents, resting and standing camels, a lantern-lit dock, campfire, and colorful bazaar wares.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

// Palette (< 48 flat colours, rich storybook desert warmth + cool oasis teal)
const STONE_DARK = "#6b4435";
const STONE_MID = "#8e5b44";
const STONE_LIGHT = "#b37758";
const STONE_RIM = "#c98d68";

const SAND_DEEP = "#d69456";
const SAND_WARM = "#e8ad6b";
const SAND_LIGHT = "#f4c587";
const SAND_CREAM = "#fae0b0";

const WATER_DEEP = "#19858f";
const WATER_MID = "#28a9b0";
const WATER_SHALLOW = "#59cfd1";
const WATER_FOAM = "#c8f5f0";

const LILY_GREEN = "#489e52";
const LILY_LIGHT = "#6ebf69";
const LOTUS_PINK = "#f57ea1";
const LOTUS_CREAM = "#fff2c9";

const TRUNK_DARK = "#6e4730";
const TRUNK_LIGHT = "#8c5c3e";
const FROND_DARK = "#2d783e";
const FROND_MID = "#45994c";
const FROND_LIGHT = "#6ab859";
const DATE_GOLD = "#d97b24";

const TENT_RED = "#c93b3b";
const TENT_CRIMSON = "#96272b";
const TENT_CREAM = "#f7ead0";
const TENT_GOLD = "#eba834";
const TENT_BLUE = "#2b6ca3";
const TENT_TEAL = "#258f89";
const TENT_PURPLE = "#6e3b82";

const WOOD_DARK = "#593825";
const WOOD_MID = "#7d5135";
const WOOD_LIGHT = "#a36e49";
const ROPE_TAN = "#c9a573";

const CAMEL_TAN = "#c98a4b";
const CAMEL_LIGHT = "#e0a96d";
const CAMEL_DARK = "#855228";
const EYE_DARK = "#1f1612";

const CLAY_TERRA = "#bf5b3b";
const CLAY_OCHRE = "#d98938";
const BRASS_GOLD = "#f0b938";
const IRON_DARK = "#363130";

const CACTUS_GREEN = "#39854c";
const FLOWER_CORAL = "#ff6b57";

const GLOW_WARM = "#ffbe4f";
const GLOW_FIRE = "#ff6e26";
const GLOW_GEM = "#63f5ef";

export default function build() {
  const b = createBuilder({ name: "desertOasisDiorama", detail: 1 });
  const rand = rng(4207);

  // Root and moving joints
  const root = b.joint("root", { at: [0, 0, 0] });

  // Hinged / articulated joints for diorama story items
  const tentFlapJoint = b.joint("tentFlap", {
    parent: root,
    at: [-0.26, 0.78, 0.22],
    dir: [0, 1, 0],
    role: "hinge",
  });
  const chestLidJoint = b.joint("chestLid", {
    parent: root,
    at: [-0.46, 0.43, 0.56],
    dir: [0, 1, 0],
    role: "hinge",
  });
  const bannerJoint = b.joint("bazaarBanner", {
    parent: root,
    at: [0.02, 1.08, 0.58],
    dir: [0, -1, 0],
    role: "hinge",
  });
  const lanternCordJoint = b.joint("lanternHang", {
    parent: root,
    at: [-0.18, 0.96, 0.42],
    dir: [0, -1, 0],
    role: "hinge",
  });
  constcamelNeck1 = b.joint("camelNeck", {
    parent: root,
    at: [0.68, 0.68, 0.24],
    dir: [-0.2, 0.9, 0.35],
    role: "neck",
  });
  const camelHead1 = b.joint("camelHead", {
    parent: constcamelNeck1,
    at: [0.63, 0.94, 0.33],
    dir: [-0.3, 0.1, 0.9],
    role: "head",
  });

  // =========================================================================
  // 1. DIORAMA PLINTH & STEPPED SAND/STONE BASE (Sits cleanly on y = 0)
  // =========================================================================
  // Bottom dark stone plinth foot (y = 0 to 0.10)
  b.frustumBox([0, 0, 0], [0, 0.1, 0], [2.46, 2.26], [2.58, 2.38], {
    bone: root,
    color: STONE_DARK,
    up: [0, 0, 1],
    group: "base",
    name: "plinthBottom",
  });

  // Mid rocky bevelled tier (y = 0.10 to 0.24)
  b.frustumBox([0, 0.1, 0], [0, 0.24, 0], [2.58, 2.38], [2.68, 2.48], {
    bone: root,
    color: STONE_MID,
    up: [0, 0, 1],
    group: "base",
    name: "plinthMid",
  });

  // Upper sandstone rim (y = 0.24 to 0.32)
  b.frustumBox([0, 0.24, 0], [0, 0.32, 0], [2.68, 2.48], [2.62, 2.42], {
    bone: root,
    color: STONE_LIGHT,
    up: [0, 0, 1],
    group: "base",
    name: "plinthRim",
  });

  // Cornerstone blocks around the plinth perimeter for chunky low-poly charm
  const cornerCoords: Array<[number, number, number, number, number]> = [
    [-1.28, 0.16, -1.16, 0.22, 0.32],
    [1.28, 0.16, -1.16, 0.24, 0.3],
    [-1.28, 0.16, 1.16, 0.22, 0.3],
    [1.28, 0.16, 1.16, 0.24, 0.32],
    [0.0, 0.14, 1.21, 0.34, 0.26],
    [0.0, 0.14, -1.21, 0.36, 0.26],
    [-1.32, 0.14, 0.0, 0.24, 0.32],
    [1.32, 0.14, 0.0, 0.24, 0.32],
  ];
  for (let i = 0; i < cornerCoords.length; i++) {
    const [cx, cy, cz, cw, ch] = cornerCoords[i];
    b.part(new THREE.BoxGeometry(cw, ch, cw), i % 2 === 0 ? STONE_RIM : STONE_MID, {
      bone: root,
      at: [cx, cy, cz],
      rotation: [0, (i * 19) % 25 - 12, 0],
      flat: true,
      group: "base",
    });
  }

  // Main sandy island deck (y = 0.30 to 0.36)
  b.frustumBox([0, 0.3, 0], [0, 0.36, 0], [2.56, 2.36], [2.46, 2.26], {
    bone: root,
    color: SAND_DEEP,
    up: [0, 0, 1],
    group: "sand",
    name: "sandBase",
  });

  // Sculpted low-poly sand dunes around the oasis basin
  // West dune (under the grand tent)
  const westDuneOutline: OutlinePoint[] = [
    [-1.2, -1.05],
    [0.1, -1.05],
    [0.25, -0.45],
    [-0.1, 0.05],
    [-0.05, 0.65],
    [-0.35, 1.05],
    [-1.18, 1.02],
  ];
  b.extrude(westDuneOutline, {
    at: [0, 0.38, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.09, 0.05],
    bevel: 0.02,
    smoothing: 1,
    color: SAND_WARM,
    bone: root,
    group: "sand",
    name: "westDune",
  });

  // Upper West terrace pad for the main tent
  const tentPadOutline: OutlinePoint[] = [
    [-1.12, -0.82],
    [-0.08, -0.82],
    [0.02, -0.25],
    [-0.18, 0.35],
    [-1.08, 0.38],
  ];
  b.extrude(tentPadOutline, {
    at: [0, 0.42, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.05,
    bevel: 0.015,
    smoothing: 1,
    color: SAND_LIGHT,
    bone: root,
    group: "sand",
    name: "tentPad",
  });

  // East & North dune ridge (under the cliff & camels)
  const eastDuneOutline: OutlinePoint[] = [
    [0.05, -1.08],
    [1.2, -1.05],
    [1.22, 0.98],
    [0.42, 1.06],
    [0.25, 0.65],
    [0.68, 0.25],
    [0.62, -0.35],
    [0.12, -0.58],
  ];
  b.extrude(eastDuneOutline, {
    at: [0, 0.38, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: [0.1, 0.05],
    bevel: 0.02,
    smoothing: 1,
    color: SAND_WARM,
    bone: root,
    group: "sand",
    name: "eastDune",
  });

  // Higher sandy crest on East side for the standing camel
  const camelCrestOutline: OutlinePoint[] = [
    [0.38, -0.55],
    [1.14, -0.52],
    [1.15, 0.85],
    [0.48, 0.88],
    [0.58, 0.2],
  ];
  b.extrude(camelCrestOutline, {
    at: [0, 0.42, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.06,
    bevel: 0.02,
    smoothing: 1,
    color: SAND_LIGHT,
    bone: root,
    group: "sand",
    name: "camelCrest",
  });

  // Soft cream sand ripples on the foreground beach
  for (let i = 0; i < 5; i++) {
    const rx = -0.75 + i * 0.22;
    const rz = 0.65 + (i % 2) * 0.16;
    b.capsule([rx - 0.12, 0.39, rz], [rx + 0.12, 0.39, rz + 0.04], [0.025, 0.018], {
      bone: root,
      color: SAND_CREAM,
      sides: 5,
      smooth: false,
      group: "sand",
    });
  }

  // =========================================================================
  // 2. TURQUOISE OASIS LAGOON, WATERFALL & WATER DETAILS
  // =========================================================================
  // Deep lagoon layer
  const poolDeepOutline: OutlinePoint[] = [
    [-0.12, -0.52],
    [0.52, -0.45],
    [0.68, 0.08],
    [0.45, 0.72],
    [-0.08, 0.86],
    [-0.38, 0.55],
    [-0.25, -0.05],
  ];
  b.extrude(poolDeepOutline, {
    at: [0, 0.355, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.03,
    bevel: 0.005,
    smoothing: 2,
    color: WATER_DEEP,
    bone: root,
    group: "water",
    name: "poolDeep",
  });

  // Mid turquoise water layer
  const poolMidOutline: OutlinePoint[] = [
    [-0.06, -0.44],
    [0.45, -0.38],
    [0.58, 0.08],
    [0.38, 0.62],
    [-0.04, 0.75],
    [-0.28, 0.48],
    [-0.18, -0.02],
  ];
  b.extrude(poolMidOutline, {
    at: [0, 0.368, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.02,
    bevel: 0.004,
    smoothing: 2,
    color: WATER_MID,
    bone: root,
    group: "water",
    name: "poolMid",
  });

  // Shallow shimmering centre & waterfall splash pool
  const poolShallowOutline: OutlinePoint[] = [
    [0.02, -0.36],
    [0.36, -0.3],
    [0.44, 0.1],
    [0.26, 0.46],
    [-0.02, 0.52],
    [-0.14, 0.25],
  ];
  b.extrude(poolShallowOutline, {
    at: [0, 0.376, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.015,
    bevel: 0.003,
    smoothing: 2,
    color: WATER_SHALLOW,
    bone: root,
    group: "water",
    name: "poolShallow",
  });

  // Lily pads with tiny lotus blossoms
  const lilySpots: Array<[number, number, number, number]> = [
    [0.34, 0.388, 0.32, 0.09],
    [0.22, 0.388, 0.45, 0.075],
    [-0.1, 0.388, 0.55, 0.085],
    [0.38, 0.388, -0.08, 0.07],
    [0.05, 0.388, 0.18, 0.08],
  ];
  for (let i = 0; i < lilySpots.length; i++) {
    const [lx, ly, lz, lr] = lilySpots[i];
    b.part(new THREE.CylinderGeometry(lr, lr * 0.9, 0.014, 7), i % 2 === 0 ? LILY_GREEN : LILY_LIGHT, {
      bone: root,
      at: [lx, ly, lz],
      rotation: [0, i * 47, 0],
      flat: true,
      group: "water",
    });
    if (i < 3) {
      // Lotus flower on pad
      b.ring(
        frame([lx, ly + 0.012, lz], [0, 1, 0]),
        { count: 6, radius: 0.012, tilt: 45, group: "water" },
        (petal) => {
          b.spike(petal, petal, 0.036, 0.016, LOTUS_PINK, { sides: 4, smooth: false, group: "water" });
        },
      );
      b.part(new THREE.DodecahedronGeometry(0.016, 0), LOTUS_CREAM, {
        bone: root,
        at: [lx, ly + 0.022, lz],
        flat: true,
        group: "water",
      });
    }
  }

  // Smooth river stepping stones & shoreline boulders around the water edge
  const shoreRocks: Array<[number, number, number, number, string]> = [
    [-0.22, 0.39, -0.35, 0.08, STONE_MID],
    [-0.3, 0.38, 0.12, 0.07, STONE_LIGHT],
    [-0.36, 0.38, 0.42, 0.09, STONE_DARK],
    [-0.15, 0.38, 0.82, 0.085, STONE_MID],
    [0.18, 0.38, 0.78, 0.075, STONE_LIGHT],
    [0.48, 0.39, 0.58, 0.095, STONE_DARK],
    [0.58, 0.39, 0.22, 0.08, STONE_MID],
    [0.55, 0.4, -0.22, 0.1, STONE_DARK],
  ];
  for (let i = 0; i < shoreRocks.length; i++) {
    const [rx, ry, rz, rr, col] = shoreRocks[i];
    b.part(new THREE.DodecahedronGeometry(rr, 0), col, {
      bone: root,
      at: [rx, ry, rz],
      scale: [1.2, 0.65, 1.0],
      rotation: [i * 15, i * 37, 0],
      flat: true,
      group: "rocks",
    });
  }

  // Reeds & cattails along the water's edge
  const reedClusters: Array<[number, number]> = [
    [-0.26, -0.22],
    [0.52, 0.38],
    [-0.28, 0.65],
    [0.46, -0.32],
  ];
  for (let c = 0; c < reedClusters.length; c++) {
    const [cx, cz] = reedClusters[c];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + c;
      const rx = cx + Math.cos(a) * 0.045;
      const rz = cz + Math.sin(a) * 0.045;
      const h = 0.22 + (k % 3) * 0.06;
      const leanX = Math.cos(a) * 0.04;
      const leanZ = Math.sin(a) * 0.04;
      b.rod([rx, 0.36, rz], [rx + leanX, 0.36 + h, rz + leanZ], [0.01, 0.005], LILY_GREEN, {
        bone: root,
        sides: 4,
        smooth: false,
        group: "plants",
      });
      if (k % 2 === 0) {
        b.capsule(
          [rx + leanX * 0.75, 0.36 + h * 0.7, rz + leanZ * 0.75],
          [rx + leanX * 0.92, 0.36 + h * 0.9, rz + leanZ * 0.92],
          0.016,
          TRUNK_DARK,
          { bone: root, sides: 5, smooth: false, group: "plants" },
        );
      }
    }
  }

  // =========================================================================
  // 3. BACK SANDSTONE CLIFF, SPRINGWATER CASCADE & ANCIENT RUIN ARCH
  // =========================================================================
  // Stepped low-poly sandstone mesas at the back (+X / -Z quadrant)
  const cliff Pillars: Array<[number, number, number, number, number, number, string]> = [
    [0.32, 0.38, -0.78, 0.56, 0.44, 0.52, STONE_MID],
    [0.68, 0.38, -0.75, 0.52, 0.46, 0.68, STONE_DARK],
    [0.02, 0.38, -0.82, 0.46, 0.38, 0.38, STONE_LIGHT],
    [0.48, 0.38, -0.92, 0.62, 0.38, 0.78, STONE_MID],
    [0.88, 0.38, -0.62, 0.42, 0.42, 0.48, STONE_LIGHT],
    [0.2, 0.78, -0.82, 0.38, 0.32, 0.22, STONE_RIM],
    [0.62, 0.96, -0.84, 0.42, 0.34, 0.24, STONE_LIGHT],
  ];
  for (let i = 0; i < cliffPillars.length; i++) {
    const [px, py, pz, w, d, h, col] = cliffPillars[i];
    b.frustumBox([px, py, pz], [px, py + h, pz], [w, d], [w * 0.84, d * 0.84], {
      bone: root,
      color: col,
      up: [0, 0, 1],
      group: "cliff",
    });
  }

  // Waterfall cascading from the cliff notch into the north end of the lagoon
  const fallCurve = bezier([0.3, 0.88, -0.74], [0.28, 0.84, -0.52], [0.24, 0.62, -0.44], [0.22, 0.38, -0.36]);
  b.sweep(fallCurve, (t) => [0.09 + 0.04 * t, 0.025], {
    bone: root,
    color: WATER_SHALLOW,
    section: "box",
    smooth: false,
    group: "water",
    name: "waterfallMain",
  });
  // White foam ribbons & splash bubbles at waterfall base
  for (const s of [-1, 0, 1]) {
    const foamPath = bezier(
      [0.3 + s * 0.04, 0.89, -0.73],
      [0.27 + s * 0.05, 0.72, -0.49],
      [0.22 + s * 0.06, 0.39, -0.34],
    );
    b.sweep(foamPath, 0.014, WATER_FOAM, {
      bone: root,
      sides: 4,
      smooth: false,
      group: "water",
    });
  }
  for (let i = 0; i < 7; i++) {
    const ang = (i / 7) * Math.PI * 2;
    const rad = 0.05 + (i % 3) * 0.03;
    b.part(new THREE.DodecahedronGeometry(0.028 - (i % 2) * 0.006, 0), WATER_FOAM, {
      bone: root,
      at: [0.22 + Math.cos(ang) * rad, 0.39, -0.34 + Math.sin(ang) * rad],
      flat: true,
      group: "water",
    });
  }

  // Ancient Desert Ruin Archway crowning the back-left cliff ridge
  const archCenter: [number, number, number] = [-0.22, 0.42, -0.76];
  for (const s of [-1, 1]) {
    const px = archCenter[0] + s * 0.24;
    const pz = archCenter[2];
    // Pillar base plinth
    b.frustumBox([px, 0.41, pz], [px, 0.5, pz], [0.16, 0.16], [0.13, 0.13], {
      bone: root,
      color: STONE_DARK,
      up: [0, 0, 1],
      group: "ruin",
    });
    // Segmented sandstone blocks
    for (let seg = 0; seg < 3; seg++) {
      b.frustumBox(
        [px, 0.5 + seg * 0.14, pz],
        [px, 0.63 + seg * 0.14, pz],
        [0.12, 0.12],
        [0.115, 0.115],
        {
          bone: root,
          color: seg % 2 === 0 ? STONE_RIM : STONE_LIGHT,
          up: [0, 0, 1],
          group: "ruin",
        },
      );
    }
    // Pillar capital
    b.frustumBox([px, 0.92, pz], [px, 0.98, pz], [0.13, 0.13], [0.17, 0.17], {
      bone: root,
      color: STONE_DARK,
      up: [0, 0, 1],
      group: "ruin",
    });
  }
  // Arch lintel and stepped keystone crown
  b.frustumBox([-0.22, 0.98, -0.76], [-0.22, 1.07, -0.76], [0.68, 0.18], [0.74, 0.2], {
    bone: root,
    color: STONE_MID,
    up: [0, 0, 1],
    group: "ruin",
  });
  b.frustumBox([-0.22, 1.07, -0.76], [-0.22, 1.13, -0.76], [0.52, 0.15], [0.44, 0.13], {
    bone: root,
    color: STONE_RIM,
    up: [0, 0, 1],
    group: "ruin",
  });
  // Glowing turquoise sun-emblem crystal embedded in the ruin lintel
  glow(
    b.part(new THREE.OctahedronGeometry(0.055, 0), GLOW_GEM, {
      bone: root,
      at: [-0.22, 1.04, -0.66],
      scale: [1, 1.3, 0.5],
      flat: true,
      group: "ruin",
      name: "ruinCrystal",
    }),
    1.4,
  );
  // Gold sun-horns flanking the crystal
  for (const s of [-1, 1]) {
    b.spike([-0.22 + s * 0.06, 1.04, -0.67], [s * 0.8, 0.5, 0.2], 0.09, 0.022, BRASS_GOLD, {
      bone: root,
      sides: 4,
      smooth: false,
      group: "ruin",
    });
  }

  // =========================================================================
  // 4. WHIMSICAL CURVED DATE PALM TREES (5 trees with ringed trunks & dates)
  // =========================================================================
  function buildPalmTree(
    basePos: [number, number, number],
    midPos: [number, number, number],
    topPos: [number, number, number],
    frondCount: number,
    frondLen: number,
    trunkR0: number,
    trunkR1: number,
    tag: string,
  ) {
    const trunkPath = bezier(basePos, midPos, topPos);
    const ringSegments = 9;
    // Build segmented stacked palm trunk collars for authentic low-poly stylized texture
    for (let i = 0; i < ringSegments; i++) {
      const t0 = i / ringSegments;
      const t1 = (i + 1) / ringSegments;
      const p0 = trunkPath.at(t0);
      const p1 = trunkPath.at(t1);
      const r0 = trunkR0 * (1 - t0 * 0.45);
      const r1 = trunkR1 + (trunkR0 - trunkR1) * (1 - t1 * 0.65) * 0.85;
      b.rod(p0, p1, [r0 * 0.88, r1 * 1.12], i % 2 === 0 ? TRUNK_DARK : TRUNK_LIGHT, {
        bone: root,
        sides: 6,
        smooth: false,
        group: `palm_${tag}`,
      });
    }

    // Crown hub
    const crownAt = topPos;
    b.part(new THREE.DodecahedronGeometry(trunkR1 * 1.35, 0), TRUNK_DARK, {
      bone: root,
      at: crownAt,
      flat: true,
      group: `palm_${tag}`,
    });

    // Hanging golden date clusters under the fronds
    b.ring(
      frame([crownAt[0], crownAt[1] - 0.04, crownAt[2]], [0, 1, 0]),
      { count: 4, radius: trunkR1 * 1.2, group: `palm_${tag}` },
      (dateFrame, idx) => {
        const dp = dateFrame.at;
        b.rod(crownAt, [dp.x, dp.y - 0.05, dp.z], 0.01, DATE_GOLD, {
          bone: root,
          sides: 4,
          smooth: false,
          group: `palm_${tag}`,
        });
        for (let d = 0; d < 3; d++) {
          const a = (d / 3) * Math.PI * 2 + idx;
          b.part(new THREE.DodecahedronGeometry(0.026, 0), d % 2 === 0 ? DATE_GOLD : CLAY_OCHRE, {
            bone: root,
            at: [dp.x + Math.cos(a) * 0.018, dp.y - 0.05 - d * 0.018, dp.z + Math.sin(a) * 0.018],
            scale: [0.9, 1.3, 0.9],
            flat: true,
            group: `palm_${tag}`,
          });
        }
      },
    );

    // Lower tier of drooping arched fronds
    for (let f = 0; f < frondCount; f++) {
      const ang = (f / frondCount) * Math.PI * 2 + (tag.length * 0.4);
      const dx = Math.cos(ang);
      const dz = Math.sin(ang);
      const pStart: [number, number, number] = [
        crownAt[0] + dx * 0.03,
        crownAt[1] + 0.02,
        crownAt[2] + dz * 0.03,
      ];
      const pMid: [number, number, number] = [
        crownAt[0] + dx * frondLen * 0.55,
        crownAt[1] + frondLen * 0.24,
        crownAt[2] + dz * frondLen * 0.55,
      ];
      const pTip: [number, number, number] = [
        crownAt[0] + dx * frondLen,
        crownAt[1] - frondLen * 0.28,
        crownAt[2] + dz * frondLen,
      ];
      const frondCurve = bezier(pStart, pMid, pTip);
      const frondCol = f % 3 === 0 ? FROND_LIGHT : f % 2 === 0 ? FROND_MID : FROND_DARK;
      b.sweep(
        frondCurve,
        (t) => [
          Math.sin(Math.min(1, t * 1.15) * Math.PI) * (frondLen * 0.22) + 0.012 * (1 - t),
          0.016 * (1 - t * 0.6),
        ],
        {
          bone: root,
          color: frondCol,
          section: { ngon: 4 },
          smooth: false,
          caps: { start: "flat", end: "point" },
          group: `palm_${tag}`,
        },
      );
    }

    // Upper inner tuft of perky young fronds
    const upperCount = Math.max(3, Math.floor(frondCount * 0.6));
    for (let f = 0; f < upperCount; f++) {
      const ang = ((f + 0.5) / upperCount) * Math.PI * 2;
      const dx = Math.cos(ang);
      const dz = Math.sin(ang);
      const len = frondLen * 0.68;
      const fCurve = bezier(
        [crownAt[0], crownAt[1] + 0.03, crownAt[2]],
        [crownAt[0] + dx * len * 0.5, crownAt[1] + len * 0.42, crownAt[2] + dz * len * 0.5],
        [crownAt[0] + dx * len, crownAt[1] + len * 0.05, crownAt[2] + dz * len],
      );
      b.sweep(
        fCurve,
        (t) => [Math.sin(t * Math.PI) * (len * 0.2) + 0.01 * (1 - t), 0.014 * (1 - t * 0.5)],
        {
          bone: root,
          color: FROND_LIGHT,
          section: { ngon: 4 },
          smooth: false,
          caps: { start: "flat", end: "point" },
          group: `palm_${tag}`,
        },
      );
    }
  }

  // Hero Palm 1: Tall, sweeping gracefully over the lagoon from behind the main tent
  buildPalmTree([-0.42, 0.42, -0.42], [-0.28, 1.08, -0.22], [-0.08, 1.66, -0.05], 8, 0.52, 0.085, 0.052, "hero1");
  // Palm 2: Sister palm leaning outward to the left
  buildPalmTree([-0.55, 0.42, -0.35], [-0.74, 0.92, -0.25], [-0.86, 1.36, -0.12], 7, 0.42, 0.072, 0.045, "sister2");
  // Palm 3: Tall cliffside palm on the right bank arching over the camels
  buildPalmTree([0.76, 0.43, -0.32], [0.64, 1.02, -0.15], [0.52, 1.54, 0.02], 8, 0.48, 0.08, 0.048, "east3");
  // Palm 4: Shorter whimsical curved palm near the southeast water edge
  buildPalmTree([0.62, 0.41, 0.42], [0.76, 0.82, 0.52], [0.84, 1.16, 0.62], 6, 0.36, 0.064, 0.04, "south4");
  // Palm 5: High cliff palm growing from the upper sandstone terrace
  buildPalmTree([0.85, 0.82, -0.62], [0.96, 1.24, -0.55], [1.02, 1.62, -0.45], 6, 0.38, 0.06, 0.038, "cliff5");

  // =========================================================================
  // 5. BEDOUIN MERCHANT TENT & SIDE CANOPY PAVILION (West Bank)
  // =========================================================================
  const tentC: [number, number, number] = [-0.66, 0.44, -0.02];

  // Woven carpet base under the main tent
  b.frustumBox(
    [tentC[0] + 0.08, 0.44, tentC[2] + 0.08],
    [tentC[0] + 0.08, 0.458, tentC[2] + 0.08],
    [0.86, 0.82],
    [0.84, 0.8],
    {
      bone: root,
      color: TENT_RED,
      up: [0, 0, 1],
      group: "tentMain",
      name: "tentCarpetOuter",
    },
  );
  b.frustumBox(
    [tentC[0] + 0.08, 0.458, tentC[2] + 0.08],
    [tentC[0] + 0.08, 0.466, tentC[2] + 0.08],
    [0.72, 0.68],
    [0.7, 0.66],
    {
      bone: root,
      color: TENT_GOLD,
      up: [0, 0, 1],
      group: "tentMain",
      name: "tentCarpetInner",
    },
  );
  b.frustumBox(
    [tentC[0] + 0.08, 0.466, tentC[2] + 0.08],
    [tentC[0] + 0.08, 0.472, tentC[2] + 0.08],
    [0.54, 0.5],
    [0.52, 0.48],
    {
      bone: root,
      color: TENT_TEAL,
      up: [0, 0, 1],
      group: "tentMain",
      name: "tentCarpetCore",
    },
  );

  // Tent wooden corner posts
  const postOffsets: Array<[number, number]> = [
    [-0.34, -0.32],
    [0.34, -0.32],
    [-0.34, 0.32],
    [0.34, 0.32],
  ];
  for (const [ox, oz] of postOffsets) {
    const px = tentC[0] + ox;
    const pz = tentC[2] + oz;
    b.rod([px, 0.44, pz], [px, 0.84, pz], 0.022, WOOD_DARK, {
      bone: root,
      sides: 6,
      smooth: false,
      group: "tentMain",
    });
    // Guy-rope and wooden peg in the sand
    const pegX = tentC[0] + ox * 1.32;
    const pegZ = tentC[2] + oz * 1.32;
    b.rod([px, 0.78, pz], [pegX, 0.43, pegZ], 0.006, ROPE_TAN, {
      bone: root,
      sides: 4,
      smooth: false,
      group: "tentMain",
    });
    b.spike([pegX, 0.41, pegZ], [ox * 0.3, 1, oz * 0.3], 0.07, 0.016, WOOD_MID, {
      bone: root,
      sides: 4,
      smooth: false,
      group: "tentMain",
    });
  }

  // Tent lower walls (striped canvas tiers)
  b.frustumBox([tentC[0], 0.44, tentC[2]], [tentC[0], 0.64, tentC[2]], [0.7, 0.66], [0.66, 0.62], {
    bone: root,
    color: TENT_CRIMSON,
    up: [0, 0, 1],
    group: "tentMain",
  });
  b.frustumBox([tentC[0], 0.64, tentC[2]], [tentC[0], 0.8, tentC[2]], [0.66, 0.62], [0.64, 0.6], {
    bone: root,
    color: TENT_CREAM,
    up: [0, 0, 1],
    group: "tentMain",
  });

  // Decorative scalloped valance trim around the eaves
  for (const side of [-1, 1]) {
    for (let k = -3; k <= 3; k++) {
      const col = Math.abs(k) % 2 === 0 ? TENT_RED : TENT_GOLD;
      // Front/Back eaves
      b.spike(
        [tentC[0] + k * 0.095, 0.8, tentC[2] + side * 0.32],
        [0, -1, side * 0.15],
        0.065,
        0.038,
        col,
        { bone: root, sides: 4, smooth: false, group: "tentMain" },
      );
      // Left/Right eaves
      b.spike(
        [tentC[0] + side * 0.34, 0.8, tentC[2] + k * 0.09],
        [side * 0.15, -1, 0],
        0.065,
        0.038,
        col,
        { bone: root, sides: 4, smooth: false, group: "tentMain" },
      );
    }
  }

  // Swooping Bedouin tent roof (tiered pyramid-pagoda curves)
  b.frustumBox([tentC[0], 0.8, tentC[2]], [tentC[0], 0.94, tentC[2]], [0.74, 0.7], [0.46, 0.42], {
    bone: root,
    color: TENT_RED,
    up: [0, 0, 1],
    group: "tentMain",
  });
  b.frustumBox([tentC[0], 0.94, tentC[2]], [tentC[0], 1.06, tentC[2]], [0.46, 0.42], [0.22, 0.2], {
    bone: root,
    color: TENT_CREAM,
    up: [0, 0, 1],
    group: "tentMain",
  });
  b.frustumBox([tentC[0], 1.06, tentC[2]], [tentC[0], 1.16, tentC[2]], [0.22, 0.2], [0.04, 0.04], {
    bone: root,
    color: TENT_GOLD,
    up: [0, 0, 1],
    group: "tentMain",
  });

  // Ornate brass finial & crescent on the main tent peak
  b.rod([tentC[0], 1.15, tentC[2]], [tentC[0], 1.29, tentC[2]], 0.012, BRASS_GOLD, {
    bone: root,
    sides: 6,
    smooth: false,
    group: "tentMain",
  });
  b.part(new THREE.OctahedronGeometry(0.036, 0), BRASS_GOLD, {
    bone: root,
    at: [tentC[0], 1.22, tentC[2]],
    flat: true,
    group: "tentMain",
  });
  b.part(new THREE.OctahedronGeometry(0.024, 0), BRASS_GOLD, {
    bone: root,
    at: [tentC[0], 1.29, tentC[2]],
    flat: true,
    group: "tentMain",
  });

  // Hinged front awning flap extending toward the oasis (+X / +Z side of tent)
  b.frustumBox(
    [-0.34, 0.78, 0.08],
    [-0.1, 0.85, 0.34],
    [0.44, 0.025],
    [0.38, 0.02],
    {
      bone: tentFlapJoint,
      color: TENT_TEAL,
      up: [0, 1, 0],
      group: "tentMain",
      name: "tentAwning",
    },
  );
  // Awning support poles
  for (const s of [-1, 1]) {
    const poleTop: [number, number, number] = [-0.14 + s * 0.14, 0.84, 0.3 + s * 0.08];
    const poleBot: [number, number, number] = [-0.14 + s * 0.14, 0.44, 0.3 + s * 0.08];
    b.rod(poleBot, poleTop, 0.015, WOOD_MID, {
      bone: root,
      sides: 5,
      smooth: false,
      group: "tentMain",
    });
  }

  // Hanging brass lantern on its own hinge joint under the awning
  b.rod([-0.18, 0.96, 0.42], [-0.18, 0.86, 0.42], 0.005, IRON_DARK, {
    bone: lanternCordJoint,
    sides: 4,
    smooth: false,
    group: "lantern",
  });
  b.part(new THREE.ConeGeometry(0.042, 0.035, 6), BRASS_GOLD, {
    bone: lanternCordJoint,
    at: [-0.18, 0.85, 0.42],
    flat: true,
    group: "lantern",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.036, 0), GLOW_WARM, {
      bone: lanternCordJoint,
      at: [-0.18, 0.81, 0.42],
      scale: [0.85, 1.2, 0.85],
      flat: true,
      group: "lantern",
      name: "hangingLanternGlass",
    }),
    1.6,
  );
  b.part(new THREE.ConeGeometry(0.028, 0.025, 6), BRASS_GOLD, {
    bone: lanternCordJoint,
    at: [-0.18, 0.77, 0.42],
    rotation: [180, 0, 0],
    flat: true,
    group: "lantern",
  });

  // Second smaller round nomadic tent in the northwest corner
  const tent2C: [number, number, number] = [-0.82, 0.42, -0.64];
  const yurtProfile: OutlinePoint[] = [
    [0, 0],
    [0.28, 0],
    [0.27, 0.22, "sharp"],
    [0.31, 0.23, "sharp"],
    [0.14, 0.38],
    [0.02, 0.48, "sharp"],
    [0, 0.49],
  ];
  b.lathe(yurtProfile, {
    at: tent2C,
    segments: 8,
    color: TENT_BLUE,
    bone: root,
    group: "tentSmall",
    name: "nomadYurt",
  });
  // Gold crown cap on the small tent
  b.part(new THREE.ConeGeometry(0.16, 0.12, 8), TENT_GOLD, {
    bone: root,
    at: [tent2C[0], tent2C[1] + 0.43, tent2C[2]],
    flat: true,
    group: "tentSmall",
  });
  b.part(new THREE.OctahedronGeometry(0.025, 0), BRASS_GOLD, {
    bone: root,
    at: [tent2C[0], tent2C[1] + 0.51, tent2C[2]],
    flat: true,
    group: "tentSmall",
  });

  // =========================================================================
  // 6. TWO STYLIZED LOW-POLY CAMELS (One Standing, One Resting by Cargo)
  // =========================================================================
  // --- Camel 1: Standing Proudly on the East Dune ---
  const c1Center: [number, number, number] = [0.76, 0.64, 0.06];
  // Torso barrel
  b.capsule([0.8, 0.64, -0.1], [0.72, 0.65, 0.2], [0.125, 0.115], CAMEL_TAN, {
    bone: root,
    sides: 7,
    smooth: false,
    group: "camelStanding",
    name: "camel1Torso",
  });
  // Whimsical tall rounded hump
  b.part(new THREE.DodecahedronGeometry(0.12, 0), CAMEL_DARK, {
    bone: root,
    at: [0.77, 0.78, 0.04],
    scale: [0.85, 1.15, 1.1],
    flat: true,
    group: "camelStanding",
  });
  // Decorative saddle blanket over the hump (crimson & gold)
  b.frustumBox([0.77, 0.63, 0.04], [0.77, 0.82, 0.04], [0.27, 0.24], [0.18, 0.22], {
    bone: root,
    color: TENT_RED,
    up: [0, 0, 1],
    group: "camelStanding",
  });
  b.frustumBox([0.77, 0.61, 0.04], [0.77, 0.65, 0.04], [0.28, 0.26], [0.27, 0.25], {
    bone: root,
    color: TENT_GOLD,
    up: [0, 0, 1],
    group: "camelStanding",
  });
  // Side cargo packs on standing camel
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.07, 0.12, 0.18), s > 0 ? TENT_TEAL : TENT_PURPLE, {
      bone: root,
      at: [0.77 + s * 0.14, 0.68, 0.04],
      rotation: [0, 0, -s * 12],
      flat: true,
      group: "camelStanding",
    });
  }

  // 4 Sturdy stylized legs with knobby knees & broad desert foot pads
  const c1Legs: Array<[number, number, number, number]> = [
    [0.66, 0.45, 0.18, 0.67], // Front Right
    [0.82, 0.45, 0.2, 0.81], // Front Left
    [0.7, 0.45, -0.1, 0.71], // Back Right
    [0.86, 0.45, -0.08, 0.85], // Back Left
  ];
  for (let l = 0; l < c1Legs.length; l++) {
    const [lx, ly, lz, hx] = c1Legs[l];
    const kneeY = 0.54;
    const kneeZ = lz + (l < 2 ? 0.015 : -0.015);
    // Upper leg
    b.rod([hx, 0.64, lz], [lx, kneeY, kneeZ], [0.036, 0.024], CAMEL_TAN, {
      bone: root,
      sides: 5,
      smooth: false,
      group: "camelStanding",
    });
    // Knobby knee joint sphere
    b.part(new THREE.DodecahedronGeometry(0.028, 0), CAMEL_DARK, {
      bone: root,
      at: [lx, kneeY, kneeZ],
      flat: true,
      group: "camelStanding",
    });
    // Lower leg
    b.rod([lx, kneeY, kneeZ], [lx, ly, lz], [0.022, 0.018], CAMEL_LIGHT, {
      bone: root,
      sides: 5,
      smooth: false,
      group: "camelStanding",
    });
    // Broad cushioned camel foot pad
    b.part(new THREE.CylinderGeometry(0.028, 0.035, 0.025, 6), CAMEL_DARK, {
      bone: root,
      at: [lx, ly, lz + 0.008],
      flat: true,
      group: "camelStanding",
    });
  }

  // Curved S-shaped camel neck (on camelNeck1 joint)
  const neckCurve1 = bezier(
    [0.71, 0.64, 0.2],
    [0.66, 0.56, 0.34],
    [0.65, 0.78, 0.38],
    [0.63, 0.94, 0.33],
  );
  b.sweep(neckCurve1, [0.058, 0.042], {
    bone: constcamelNeck1,
    color: CAMEL_TAN,
    sides: 6,
    smooth: false,
    group: "camelStanding",
  });

  // Camel 1 Head & Snout (on camelHead1 joint)
  b.frustumBox([0.63, 0.94, 0.32], [0.57, 0.92, 0.47], [0.085, 0.08], [0.055, 0.05], {
    bone: camelHead1,
    color: CAMEL_LIGHT,
    up: [0, 1, 0],
    group: "camelStanding",
  });
  // Tufted crown hair
  b.part(new THREE.DodecahedronGeometry(0.038, 0), CAMEL_DARK, {
    bone: camelHead1,
    at: [0.63, 0.99, 0.32],
    flat: true,
    group: "camelStanding",
  });
  // Ears & Eyes
  for (const s of [-1, 1]) {
    b.spike(
      [0.63 + s * 0.042, 0.97, 0.31],
      [s * 0.7, 0.8, -0.3],
      0.048,
      0.018,
      CAMEL_TAN,
      { bone: camelHead1, sides: 4, smooth: false, group: "camelStanding" },
    );
    b.part(new THREE.SphereGeometry(0.013, 5, 4), EYE_DARK, {
      bone: camelHead1,
      at: [0.61 + s * 0.042, 0.95, 0.37],
      flat: true,
      group: "camelStanding",
    });
  }
  // Red bridle & lead rope
  b.rod([0.58, 0.91, 0.44], [0.64, 0.68, 0.25], 0.006, TENT_RED, {
    bone: root,
    sides: 4,
    smooth: false,
    group: "camelStanding",
  });
  // Tail with dark tuft
  b.rod([0.81, 0.65, -0.2], [0.84, 0.51, -0.25], [0.016, 0.01], CAMEL_TAN, {
    bone: root,
    sides: 4,
    smooth: false,
    group: "camelStanding",
  });
  b.part(new THREE.ConeGeometry(0.022, 0.05, 5), CAMEL_DARK, {
    bone: root,
    at: [0.84, 0.49, -0.25],
    rotation: [165, 0, 0],
    flat: true,
    group: "camelStanding",
  });

  // --- Camel 2: Resting / Kneeling contentedly on the Northeast Sand ---
  const c2Base: [number, number, number] = [0.92, 0.5, 0.46];
  b.capsule([0.96, 0.51, 0.35], [0.86, 0.52, 0.58], [0.11, 0.105], CAMEL_LIGHT, {
    bone: root,
    sides: 7,
    smooth: false,
    group: "camelResting",
    name: "camel2Torso",
  });
  // Tucked legs folded along the body sides
  for (const s of [-1, 1]) {
    b.capsule(
      [0.91 + s * 0.1, 0.45, 0.36],
      [0.87 + s * 0.1, 0.45, 0.58],
      0.032,
      CAMEL_TAN,
      { bone: root, sides: 5, smooth: false, group: "camelResting" },
    );
  }
  // Resting camel hump & turquoise saddle cloth
  b.part(new THREE.DodecahedronGeometry(0.105, 0), CAMEL_TAN, {
    bone: root,
    at: [0.91, 0.63, 0.46],
    scale: [0.85, 1.1, 1.05],
    flat: true,
    group: "camelResting",
  });
  b.frustumBox([0.91, 0.51, 0.46], [0.91, 0.67, 0.46], [0.24, 0.22], [0.16, 0.18], {
    bone: root,
    color: TENT_BLUE,
    up: [0, 0, 1],
    group: "camelResting",
  });
  // Resting camel neck & head looking toward the campfire
  const neckCurve2 = bezier(
    [0.85, 0.51, 0.58],
    [0.78, 0.46, 0.69],
    [0.76, 0.64, 0.72],
    [0.74, 0.75, 0.68],
  );
  b.sweep(neckCurve2, [0.05, 0.038], {
    bone: root,
    color: CAMEL_LIGHT,
    sides: 6,
    smooth: false,
    group: "camelResting",
  });
  b.frustumBox([0.74, 0.75, 0.67], [0.66, 0.73, 0.78], [0.075, 0.07], [0.048, 0.044], {
    bone: root,
    color: CAMEL_TAN,
    up: [0, 1, 0],
    group: "camelResting",
  });
  for (const s of [-1, 1]) {
    b.spike(
      [0.74 + s * 0.036, 0.78, 0.66],
      [s * 0.6, 0.8, -0.3],
      0.042,
      0.015,
      CAMEL_DARK,
      { bone: root, sides: 4, smooth: false, group: "camelResting" },
    );
  }

  // =========================================================================
  // 7. WOODEN LAGOON PIER, STEPPING BRIDGE & CAMPFIRE GATHERING
  // =========================================================================
  // Small wooden jetty jutting into the southern lagoon
  const dockX = -0.02;
  const dockZ0 = 0.88;
  const dockZ1 = 0.48;
  // Support pilings
  for (const px of [dockX - 0.11, dockX + 0.11]) {
    for (const pz of [0.84, 0.68, 0.52]) {
      b.rod([px, 0.34, pz], [px, 0.47, pz], 0.02, WOOD_DARK, {
        bone: root,
        sides: 5,
        smooth: false,
        group: "dock",
      });
    }
    // Side stringer beam
    b.rod([px, 0.43, dockZ0], [px, 0.43, dockZ1], 0.016, WOOD_MID, {
      bone: root,
      sides: 4,
      smooth: false,
      group: "dock",
    });
  }
  // Wooden planks across the jetty
  for (let p = 0; p < 7; p++) {
    const pz = dockZ0 - p * 0.062;
    b.part(new THREE.BoxGeometry(0.28, 0.022, 0.046), p % 2 === 0 ? WOOD_LIGHT : WOOD_MID, {
      bone: root,
      at: [dockX, 0.445, pz],
      rotation: [0, (p % 3 - 1) * 2.5, 0],
      flat: true,
      group: "dock",
    });
  }
  // Mooring post with coiled rope & glowing dock lantern at pier tip
  b.rod([dockX + 0.11, 0.44, dockZ1], [dockX + 0.11, 0.66, dockZ1], 0.024, WOOD_DARK, {
    bone: root,
    sides: 6,
    smooth: false,
    group: "dock",
  });
  b.part(new THREE.TorusGeometry(0.032, 0.01, 5, 7), ROPE_TAN, {
    bone: root,
    at: [dockX + 0.11, 0.5, dockZ1],
    rotation: [90, 0, 0],
    flat: true,
    group: "dock",
  });
  glow(
    b.part(new THREE.OctahedronGeometry(0.032, 0), GLOW_WARM, {
      bone: root,
      at: [dockX + 0.11, 0.69, dockZ1],
      flat: true,
      group: "dock",
      name: "dockLantern",
    }),
    1.5,
  );

  // Cozy Desert Campfire in the foreground clearing
  const fireC: [number, number, number] = [-0.42, 0.4, 0.72];
  // Ring of fire stones
  b.ring(
    frame(fireC, [0, 1, 0]),
    { count: 9, radius: 0.11, group: "campfire" },
    (stone, idx) => {
      b.part(new THREE.DodecahedronGeometry(0.032, 0), idx % 2 === 0 ? STONE_DARK : STONE_MID, {
        bone: root,
        at: stone.at,
        scale: [1.1, 0.75, 1.0],
        flat: true,
        group: "campfire",
      });
    },
  );
  // Charred firewood logs
  for (let l = 0; l < 4; l++) {
    const a = (l / 4) * Math.PI + 0.3;
    const dx = Math.cos(a) * 0.085;
    const dz = Math.sin(a) * 0.085;
    b.rod(
      [fireC[0] - dx, fireC[1] + 0.01, fireC[2] - dz],
      [fireC[0] + dx, fireC[1] + 0.035, fireC[2] + dz],
      0.018,
      WOOD_DARK,
      { bone: root, sides: 5, smooth: false, group: "campfire" },
    );
  }
  // Glowing low-poly flames
  glow(
    b.spike(fireC, [0, 1, 0], 0.15, 0.055, GLOW_FIRE, {
      bone: root,
      sides: 5,
      smooth: false,
      group: "campfire",
      name: "flameCore",
    }),
    1.8,
  );
  for (let f = 0; f < 3; f++) {
    const a = (f / 3) * Math.PI * 2 + 0.5;
    glow(
      b.spike(
        [fireC[0] + Math.cos(a) * 0.03, fireC[1] + 0.01, fireC[2] + Math.sin(a) * 0.03],
        [Math.cos(a) * 0.25, 1, Math.sin(a) * 0.25],
        0.1,
        0.032,
        GLOW_WARM,
        { bone: root, sides: 4, smooth: false, group: "campfire" },
      ),
      1.6,
    );
  }

  // Wooden tripod over the fire with a hanging brass tea kettle
  for (let t = 0; t < 3; t++) {
    const a = (t / 3) * Math.PI * 2 + 0.2;
    b.rod(
      [fireC[0] + Math.cos(a) * 0.16, 0.39, fireC[2] + Math.sin(a) * 0.16],
      [fireC[0], 0.68, fireC[2]],
      [0.012, 0.008],
      WOOD_MID,
      { bone: root, sides: 4, smooth: false, group: "campfire" },
    );
  }
  b.rod([fireC[0], 0.67, fireC[2]], [fireC[0], 0.57, fireC[2]], 0.005, IRON_DARK, {
    bone: root,
    sides: 4,
    smooth: false,
    group: "campfire",
  });
  b.part(new THREE.DodecahedronGeometry(0.038, 0), BRASS_GOLD, {
    bone: root,
    at: [fireC[0], 0.55, fireC[2]],
    scale: [1.1, 0.85, 1.1],
    flat: true,
    group: "campfire",
  });

  // =========================================================================
  // 8. BAZAAR CLUTTER: AMPHORAE, TREASURE CHEST, CRATES, CUSHIONS & CACTI
  // =========================================================================
  // Hinged merchant treasure chest near the main tent entrance
  const chestPos: [number, number, number] = [-0.46, 0.4, 0.56];
  b.part(new THREE.BoxGeometry(0.18, 0.09, 0.12), WOOD_DARK, {
    bone: root,
    at: [chestPos[0], chestPos[1] + 0.045, chestPos[2]],
    flat: true,
    group: "props",
    name: "chestBase",
  });
  // Chest lid on its hinge joint
  b.part(new THREE.BoxGeometry(0.186, 0.045, 0.126), WOOD_MID, {
    bone: chestLidJoint,
    at: [chestPos[0], chestPos[1] + 0.11, chestPos[2]],
    rotation: [-18, 0, 0],
    flat: true,
    group: "props",
    name: "chestLidMesh",
  });
  // Brass lock plate & gleaming gold coins peeking out
  b.part(new THREE.BoxGeometry(0.03, 0.035, 0.015), BRASS_GOLD, {
    bone: chestLidJoint,
    at: [chestPos[0], chestPos[1] + 0.095, chestPos[2] + 0.062],
    flat: true,
    group: "props",
  });
  glow(
    b.part(new THREE.DodecahedronGeometry(0.035, 0), GLOW_WARM, {
      bone: root,
      at: [chestPos[0], chestPos[1] + 0.09, chestPos[2] + 0.01],
      scale: [1.8, 0.4, 1.0],
      flat: true,
      group: "props",
    }),
    1.2,
  );

  // Turned terracotta amphorae & water jars clustered around the tents and spring
  const vaseProfile: OutlinePoint[] = [
    [0, 0],
    [0.032, 0],
    [0.056, 0.05],
    [0.048, 0.1],
    [0.022, 0.13],
    [0.034, 0.155, "sharp"],
    [0.026, 0.16, "sharp"],
    [0, 0.155],
  ];
  const jarLocations: Array<[number, number, number, number, string]> = [
    [-0.25, 0.44, 0.35, 1.0, CLAY_TERRA],
    [-0.18, 0.44, 0.28, 0.82, CLAY_OCHRE],
    [-0.31, 0.44, -0.32, 1.1, CLAY_TERRA],
    [0.52, 0.43, -0.02, 0.9, TENT_TEAL],
    [-0.64, 0.42, -0.46, 0.95, CLAY_OCHRE],
    [0.34, 0.4, 0.72, 0.85, CLAY_TERRA],
  ];
  for (let j = 0; j < jarLocations.length; j++) {
    const [jx, jy, jz, sc, col] = jarLocations[j];
    const scaledProfile: OutlinePoint[] = vaseProfile.map((pt) =>
      pt.length === 3 ? [pt[0] * sc, pt[1] * sc, "sharp"] : [pt[0] * sc, pt[1] * sc],
    );
    b.lathe(scaledProfile, {
      at: [jx, jy, jz],
      segments: 7,
      color: col,
      bone: root,
      group: "props",
    });
  }

  // Plump floor poufs / embroidered cushions around the carpet & campfire
  const cushions: Array<[number, number, number, string]> = [
    [-0.3, 0.47, 0.05, TENT_PURPLE],
    [-0.32, 0.47, -0.12, TENT_GOLD],
    [-0.62, 0.41, 0.68, TENT_RED],
    [-0.26, 0.41, 0.84, TENT_BLUE],
  ];
  for (const [cx, cy, cz, col] of cushions) {
    b.part(new THREE.CylinderGeometry(0.068, 0.072, 0.042, 7), col, {
      bone: root,
      at: [cx, cy, cz],
      flat: true,
      group: "props",
    });
    b.part(new THREE.DodecahedronGeometry(0.018, 0), BRASS_GOLD, {
      bone: root,
      at: [cx, cy + 0.024, cz],
      flat: true,
      group: "props",
    });
  }

  // Stacked wooden cargo crates & rolled carpets near the resting camel
  b.part(new THREE.BoxGeometry(0.16, 0.14, 0.16), WOOD_MID, {
    bone: root,
    at: [0.58, 0.49, 0.56],
    rotation: [0, 18, 0],
    flat: true,
    group: "props",
  });
  b.part(new THREE.BoxGeometry(0.12, 0.11, 0.12), WOOD_LIGHT, {
    bone: root,
    at: [0.58, 0.61, 0.56],
    rotation: [0, -12, 0],
    flat: true,
    group: "props",
  });
  // Rolled bazaar rugs leaning against the crate
  b.capsule([0.46, 0.43, 0.52], [0.52, 0.62, 0.54], 0.026, TENT_RED, {
    bone: root,
    sides: 6,
    smooth: false,
    group: "props",
  });
  b.capsule([0.49, 0.43, 0.6], [0.54, 0.6, 0.59], 0.024, TENT_GOLD, {
    bone: root,
    sides: 6,
    smooth: false,
    group: "props",
  });

  // Festival Banner / Signpost on a wooden mast with a hinged cloth flag
  b.rod([0.02, 0.4, 0.58], [0.02, 1.12, 0.58], [0.02, 0.014], WOOD_DARK, {
    bone: root,
    sides: 5,
    smooth: false,
    group: "banner",
  });
  b.rod([-0.1, 1.08, 0.58], [0.14, 1.08, 0.58], 0.012, WOOD_MID, {
    bone: bannerJoint,
    sides: 4,
    smooth: false,
    group: "banner",
  });
  // Hanging swallowtail silk banner on bannerJoint
  const flagOutline: OutlinePoint[] = [
    [-0.09, 0],
    [0.09, 0],
    [0.08, -0.26, "sharp"],
    [0.0, -0.18, "sharp"],
    [-0.08, -0.26, "sharp"],
  ];
  b.extrude(flagOutline, {
    at: [0.02, 1.07, 0.58],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    color: TENT_GOLD,
    bone: bannerJoint,
    group: "banner",
    name: "bazaarBannerCloth",
  });

  // Whimsical desert barrel cacti & prickly pear clusters with coral blossoms
  const cactusSpots: Array<[number, number, number, number]> = [
    [-1.02, 0.43, 0.58, 1.0],
    [-0.95, 0.43, 0.74, 0.75],
    [1.02, 0.45, -0.15, 1.1],
    [0.98, 0.45, 0.76, 0.85],
    [-0.55, 0.42, -0.84, 0.9],
  ];
  for (let i = 0; i < cactusSpots.length; i++) {
    const [cx, cy, cz, sc] = cactusSpots[i];
    const h = 0.16 * sc;
    const r = 0.062 * sc;
    b.capsule([cx, cy, cz], [cx, cy + h, cz], [r * 0.85, r], CACTUS_GREEN, {
      bone: root,
      sides: 6,
      smooth: false,
      group: "plants",
    });
    // Side cactus arm on larger cacti
    if (i % 2 === 0) {
      const armPath = polyline([
        [cx, cy + h * 0.55, cz],
        [cx + 0.08 * sc, cy + h * 0.6, cz],
        [cx + 0.08 * sc, cy + h * 1.05, cz],
      ]);
      b.sweep(armPath, r * 0.55, CACTUS_GREEN, {
        bone: root,
        sides: 5,
        smooth: false,
        group: "plants",
      });
    }
    // Bright coral cactus flower on top
    b.part(new THREE.ConeGeometry(0.032 * sc, 0.035 * sc, 5), FLOWER_CORAL, {
      bone: root,
      at: [cx, cy + h + r * 0.85, cz],
      rotation: [180, i * 35, 0],
      flat: true,
      group: "plants",
    });
  }

  // Scattered desert pebbles & desert grass tufts for rich ground texture
  for (let p = 0; p < 18; p++) {
    const angle = rand() * Math.PI * 2;
    const dist = 0.72 + rand() * 0.36;
    const px = Math.cos(angle) * dist;
    const pz = Math.sin(angle) * dist * 0.9;
    const pr = 0.022 + rand() * 0.025;
    b.part(
      new THREE.DodecahedronGeometry(pr, 0),
      p % 3 === 0 ? STONE_LIGHT : p % 2 === 0 ? STONE_MID : SAND_DEEP,
      {
        bone: root,
        at: [px, 0.41, pz],
        scale: [1.2, 0.6, 1.0],
        rotation: [p * 23, p * 41, 0],
        flat: true,
        group: "pebbles",
      },
    );
  }

  return b.root;
}

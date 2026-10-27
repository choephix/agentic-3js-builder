import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";
import { cel, animeEye, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "chibi axolotl",
  description: "A friendly low-poly chibi axolotl with a rounded pink body, expressive eyes, broad tail and exuberant frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const PINK = cel("#f28cae", "#b94e72");
  const PALE = cel("#ffd1dc", "#e99caf");
  const BELLY = cel("#fff0e7", "#f4b8bd");
  const GILL = cel("#ff7fa6", "#c73d70");
  const DARK = "#24162b";
  const BLACK = "#16111d";
  const WHITE = "#fff9f3";
  const GOLD = "#ffd35c";
  const MINT = "#8de0c4";

  // Skeleton first: one central spine, a head, tail, and four readable little legs.
  const hips = b.joint("hips", {
    at: [0, 0.42, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.55],
      [0, 0.46, -0.18],
      [0, 0.51, 0.18],
      [0, 0.55, 0.48],
    ]),
    {
      parent: hips,
      names: ["spine1", "spine2", "spine3", "spineTip"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.5, 0.32],
      [0, 0.58, 0.55],
      [0, 0.66, 0.72],
    ]),
    {
      parent: spine.tip,
      names: ["neck1", "neck2", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 0.68, 0.76],
    dir: [0, 0.18, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.61, 0.86],
    dir: [0, -0.12, 1],
    role: "jaw",
    group: "face",
  });

  const legChains: { side: number; front: boolean; chain: any }[] = [];
  for (const side of [1, -1]) {
    for (const front of [true, false]) {
      const x = side * 0.21;
      const z = front ? 0.27 : -0.30;
      const root = [x, 0.43, z] as [number, number, number];
      const foot = [side * 0.34, 0.115, z + (front ? 0.10 : -0.04)] as [number, number, number];
      const pts = limb(root, foot, [0.16, 0.16], [[side * 0.4, -0.3, front ? 1 : -1]]);
      const chain = b.chain(
        `${front ? "fore" : "hind"}Leg${side > 0 ? "L" : "R"}`,
        pts,
        {
          parent: spine.joints[front ? 2 : 0],
          names: [
            `${front ? "shoulder" : "hip"}${side > 0 ? "L" : "R"}`,
            `${front ? "elbow" : "knee"}${side > 0 ? "L" : "R"}`,
            `${front ? "wrist" : "ankle"}${side > 0 ? "L" : "R"}`,
          ],
          role: "leg",
          contact: foot,
        },
      );
      legChains.push({ side, front, chain });
    }
  }

  // Main soft body and broad tapering tail.
  const body = b.sweep(
    catmull([
      [0, 0.40, -0.58],
      [0, 0.47, -0.32],
      [0, 0.51, 0.02],
      [0, 0.54, 0.34],
      [0, 0.57, 0.53],
    ]),
    (t) => 0.17 + 0.055 * Math.sin(Math.PI * t),
    {
      bone: [hips, ...spine.joints, neck.joints[0]],
      color: PINK,
      section: { ngon: 8 },
      sides: 8,
      name: "roundedBody",
      group: "body",
    },
  );

  const tail = b.sweep(
    catmull([
      [0, 0.43, -0.52],
      [0, 0.39, -0.82],
      [0, 0.34, -1.13],
      [0, 0.30, -1.42],
      [0, 0.29, -1.67],
    ]),
    (t) => 0.145 * (1 - t) + 0.012,
    {
      bone: [hips, spine.joints[0], spine.joints[1], spine.joints[2]],
      color: PINK,
      sides: 7,
      section: "circle",
      caps: { start: "round", end: "point" },
      name: "longTaperedTail",
      group: "tail",
    },
  );

  // Pale belly patch as a soft inset volume, keeping the silhouette primitive and chunky.
  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    BELLY,
    {
      bone: hips,
      at: [0, 0.43, 0.19],
      scale: [0.14, 0.16, 0.20],
      name: "bellyPatch",
      group: "body",
    },
  );

  // Four chunky limbs, feet, and three squared toes per foot.
  for (const { side, front, chain } of legChains) {
    b.sweep(chain, [0.065, 0.052], {
      color: PINK,
      sides: 6,
      skin: "rigid",
      name: `${front ? "front" : "back"}LegTube${side > 0 ? "L" : "R"}`,
      group: "legs",
    });

    const foot = chain.tip;
    b.part(new THREE.SphereGeometry(0.075, 8, 5), PALE, {
      bone: foot,
      at: foot.at,
      scale: [1.15, 0.65, 1.25],
      name: `${front ? "front" : "back"}Foot${side > 0 ? "L" : "R"}`,
      group: "feet",
    });

    for (let i = -1; i <= 1; i++) {
      const toeStart = [side * (0.34 + i * 0.035), 0.09, foot.at.z + 0.045] as [number, number, number];
      const toeEnd = [side * (0.35 + i * 0.043), 0.055, foot.at.z + 0.135] as [number, number, number];
      b.sweep([toeStart, toeEnd], [0.021, 0.006], {
        bone: foot,
        color: PALE,
        sides: 5,
        caps: { start: "round", end: "point" },
        name: `${front ? "front" : "back"}Toe${side > 0 ? "L" : "R"}${i}`,
        group: "digits",
      });
    }
  }

  // Huge cute head and lower jaw.
  const skull = b.part(
    new THREE.SphereGeometry(1, 14, 10),
    PINK,
    {
      bone: head,
      at: [0, 0.70, 0.84],
      scale: [0.31, 0.27, 0.27],
      name: "bigRoundedHead",
      group: "head",
    },
  );

  b.part(
    new THREE.SphereGeometry(1, 12, 8),
    PALE,
    {
      bone: jaw,
      at: [0, 0.605, 0.96],
      scale: [0.21, 0.105, 0.14],
      name: "softLowerJaw",
      group: "face",
    },
  );

  // Broad muzzle and tiny smiling mouth.
  b.part(
    new THREE.SphereGeometry(1, 10, 6),
    BELLY,
    {
      bone: jaw,
      at: [0, 0.645, 1.055],
      scale: [0.145, 0.075, 0.075],
      name: "muzzle",
      group: "face",
    },
  );
  b.rod([0, 0.64, 1.117], [0, 0.625, 1.13], 0.009, {
    bone: jaw,
    color: INK,
    name: "smile",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.027, 7, 5), INK, {
    bone: jaw,
    at: [0, 0.675, 1.13],
    name: "tinyNose",
    group: "face",
  });

  // Eyes are deliberately oversized and readable from the front.
  const eyeTexture = animeEye({
    iris: "#5b4bce",
    irisLight: "#9ee8ff",
    irisDark: "#28205d",
    blush: false,
    brow: false,
    size: 256,
  });
  const faceSurface = b.surface(skull);
  for (const side of [1, -1]) {
    const eyeAt = [side * 0.145, 0.755, 1.035] as [number, number, number];
    b.decal(faceSurface, eyeTexture, {
      at: eyeAt,
      dir: [0, 0.15, 1],
      up: [0, 1, 0],
      size: [0.125, 0.16],
      mirror: side > 0,
      lift: 0.006,
      segments: 6,
      name: `shinyEye${side > 0 ? "L" : "R"}`,
      group: "face",
    });
  }

  // Cheek blush discs and a few freckles.
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 8, 5), "#f56f9b", {
      bone: head,
      at: [side * 0.235, 0.655, 1.035],
      scale: [1.2, 0.45, 0.18],
      name: `blush${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.009, 6, 4), "#d95d84", {
        bone: head,
        at: [side * (0.205 + i * 0.025), 0.69 + (i % 2) * 0.018, 1.075],
        name: `freckle${side > 0 ? "L" : "R"}${i}`,
        group: "face",
      });
    }
  }

  // External gill stalks: six vivid branches on each side.
  for (const side of [1, -1]) {
    const gillRoot = [side * 0.265, 0.73, 0.73] as [number, number, number];

    for (let branch = 0; branch < 3; branch++) {
      const y = 0.80 - branch * 0.075;
      const outward = 0.14 + branch * 0.018;
      const tip = [side * (0.265 + outward), y + 0.035, 0.66 - branch * 0.035] as [number, number, number];

      b.sweep(
        catmull([
          gillRoot,
          [side * (0.30 + branch * 0.01), y, 0.70],
          tip,
        ]),
        [0.026, 0.009],
        {
          bone: head,
          color: GILL,
          sides: 6,
          caps: { start: "round", end: "point" },
          name: `gillStem${side > 0 ? "L" : "R"}${branch}`,
          group: "gills",
        },
      );

      // Four separated frond blades per stalk make the feathery silhouette.
      for (let frond = 0; frond < 4; frond++) {
        const fy = y - 0.055 + frond * 0.037;
        const fz = 0.66 - branch * 0.035;
        const reach = 0.10 + 0.018 * Math.sin(frond * 2.2 + branch);
        const outline: [number, number, "sharp"][] = [
          [0, 0],
          [reach * 0.44, 0.018],
          [reach, 0.0],
          [reach * 0.58, -0.024],
          [0.10, -0.018],
        ];
        b.extrude(outline, {
          at: [side * (0.31 + branch * 0.012), fy, fz],
          x: [0, 0, side],
          y: [0, 1, 0],
          thickness: 0.014,
          bevel: 0.003,
          smoothing: 0,
          bone: head,
          color: GILL,
          name: `frillyGill${side > 0 ? "L" : "R"}${branch}_${frond}`,
          group: "gills",
        });
      }
    }

    // Small darker gill base rosette.
    b.part(new THREE.SphereGeometry(0.055, 8, 5), "#d94c78", {
      bone: head,
      at: [side * 0.278, 0.735, 0.725],
      scale: [0.75, 1.0, 0.5],
      name: `gillBase${side > 0 ? "L" : "R"}`,
      group: "gills",
    });
  }

  // A handful of pale dorsal spots and tail markings add charm without losing the blocky read.
  const random = rng(22);
  for (let i = 0; i < 18; i++) {
    const t = random();
    const z = -0.43 + t * 1.0;
    const x = (random() - 0.5) * 0.22;
    const y = 0.56 + Math.abs(x) * 0.12;
    b.part(new THREE.SphereGeometry(0.014 + random() * 0.009, 6, 4), PALE, {
      bone: hips,
      at: [x, y, z],
      name: `dorsalSpot${i}`,
      group: "markings",
    });
  }

  // A tiny glowing forehead jewel gives the chibi creature a focal sparkle.
  const jewel = b.part(new THREE.OctahedronGeometry(0.027, 0), MINT, {
    bone: head,
    at: [0, 0.895, 0.985],
    name: "foreheadJewel",
    group: "ornament",
  });
  glow(jewel, 1.4);

  return b.root;
}

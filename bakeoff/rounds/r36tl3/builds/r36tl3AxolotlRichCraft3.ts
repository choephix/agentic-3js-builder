import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "Chibi Axolotl",
  description: "A cute low-poly axolotl with a rounded lavender body, glowing anime eyes, and extravagant frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const BODY = cel("#9d82c4", "#694c93");
  const BELLY = cel("#f4d8dc", "#c994b1");
  const GILL = cel("#ff91b7", "#c95787");
  const GILL_LIGHT = cel("#ffbed1", "#e46d9a");
  const DARK = INK;
  const PAW = cel("#d99ac1", "#9d5f91");
  const EYE_TEX = animeEye({
    iris: "#8d54c9",
    irisLight: "#e6b7ff",
    irisDark: "#39205c",
    brow: false,
    blush: "#ff83ad",
    size: 256,
  });

  // Skeleton first: one central spine, a head hinge, a tail chain, and four readable legs.
  const hips = b.joint("hips", {
    at: [0, 0.47, -0.05],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.47, -0.73],
    [0, 0.49, -0.38],
    [0, 0.51, 0.0],
    [0, 0.53, 0.36],
    [0, 0.55, 0.62],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineBack", "spineMid", "spineFront", "chest"],
    role: "spine",
  });

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.57, 0.62],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.48, 0.78],
    dir: [0, -0.12, 0.99],
    role: "jaw",
    group: "face",
  });

  const tailPath = catmull([
    [0, 0.47, -0.55],
    [0, 0.43, -0.92],
    [0, 0.34, -1.3],
    [0, 0.24, -1.64],
    [0, 0.15, -1.88],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
  });

  const legChains: { side: number; front: boolean; chain: any }[] = [];
  for (const side of [-1, 1]) {
    for (const front of [false, true]) {
      const x = side * (front ? 0.25 : 0.29);
      const z = front ? 0.38 : -0.37;
      const foot = [x + side * 0.12, 0.105, z + (front ? 0.16 : -0.1)] as [number, number, number];
      const root = [x, 0.48, z] as [number, number, number];
      const pts = limb(
        root,
        foot,
        front ? [0.20, 0.18, 0.17] : [0.23, 0.20, 0.18],
        front ? [[0, 0, 1], [0, 0, -1]] : [[0, 0, -1], [0, 0, 1]],
        { sole: [0, 1, 0] },
      );
      const prefix = `${front ? "arm" : "leg"}${side > 0 ? "L" : "R"}`;
      const chain = b.chain(prefix, pts, {
        parent: front ? spine.tip : hips,
        names: [`${prefix}Hip`, `${prefix}Knee`, `${prefix}Ankle`, `${prefix}Toe`],
        role: front ? "arm" : "leg",
        contact: foot,
      });
      legChains.push({ side, front, chain });
    }
  }

  // Main rounded body, with a pale belly and a soft graphic edge.
  const coat = furEdge(BODY, BELLY, {
    axis: [0, 1, 0],
    level: -0.1,
    teeth: 0.16,
    period: 0.11,
    ink: "#704b83",
    inkWidth: 0.025,
  });
  const body = b.sweep(spine, (t) => 0.29 - 0.045 * Math.abs(t - 0.55), {
    color: coat,
    section: { ngon: 10 },
    caps: "round",
    name: "soft-body",
    group: "body",
  });

  b.sweep(tail, (t) => 0.17 * (1 - t) + 0.018, {
    color: coat,
    section: { ngon: 8 },
    caps: { start: "round", end: "point" },
    name: "tapered-tail",
    group: "body",
  });

  // Oversized head and a pale lower jaw.
  const skull = b.part(
    new THREE.SphereGeometry(0.38, 12, 8),
    coat,
    {
      bone: head,
      at: [0, 0.61, 0.67],
      scale: [1.08, 0.92, 1.0],
      name: "big-round-head",
      group: "head",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.23, 10, 6),
    BELLY,
    {
      bone: jaw,
      at: [0, 0.48, 0.81],
      scale: [1.0, 0.48, 0.9],
      name: "lower-jaw",
      group: "face",
    },
  );

  // Wide cute muzzle and tiny smiling mouth.
  b.part(
    new THREE.SphereGeometry(0.12, 8, 6),
    BELLY,
    {
      bone: jaw,
      at: [0, 0.55, 0.965],
      scale: [1.45, 0.72, 0.72],
      name: "muzzle",
      group: "face",
    },
  );
  b.rod([0, 0.55, 1.03], [0, 0.535, 1.12], 0.012, {
    color: DARK,
    bone: jaw,
    name: "smile",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.025, 7, 5), DARK, {
    bone: jaw,
    at: [-0.075, 0.59, 1.055],
    name: "nostrilR",
    group: "face",
  });
  b.part(new THREE.SphereGeometry(0.025, 7, 5), DARK, {
    bone: jaw,
    at: [0.075, 0.59, 1.055],
    name: "nostrilL",
    group: "face",
  });

  // Huge expressive decal eyes, placed on the forward-facing head surface.
  const faceSurface = b.surface(skull);
  for (const side of [-1, 1]) {
    const hit = faceSurface.around([0, 0.63, 0.72]).at(side * 30, 8);
    if (hit) {
      b.decal(faceSurface, EYE_TEX, {
        at: hit,
        size: [0.16, 0.22],
        mirror: side > 0,
        lift: 0.004,
        segments: 7,
        name: side > 0 ? "eyeL" : "eyeR",
        group: "face",
      });
    }
  }

  // Tiny external cheek dots add axolotl character without obscuring the eyes.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), "#f47fa9", {
        bone: head,
        at: [side * (0.19 + i * 0.035), 0.535 - i * 0.012, 0.96 - i * 0.015],
        name: `cheek${side > 0 ? "L" : "R"}${i}`,
        group: "face",
      });
    }
  }

  // Four short, chunky legs with broad four-fingered toes.
  for (const item of legChains) {
    const { side, front, chain } = item;
    b.sweep(chain, (t) => front ? 0.075 - t * 0.035 : 0.09 - t * 0.045, {
      color: coat,
      section: { ngon: 7 },
      caps: "round",
      name: `${front ? "arm" : "leg"}Tube${side > 0 ? "L" : "R"}`,
      group: "limbs",
    });
    const foot = chain.tip;
    b.part(new THREE.SphereGeometry(front ? 0.105 : 0.12, 8, 5), PAW, {
      bone: foot,
      at: foot.at,
      scale: [1.15, 0.42, 1.25],
      name: `${front ? "hand" : "foot"}${side > 0 ? "L" : "R"}`,
      group: "limbs",
    });
    for (let toe = -1; toe <= 1; toe++) {
      const tx = foot.at.x + side * toe * 0.035;
      const tz = foot.at.z + (front ? 0.06 : -0.045) + Math.abs(toe) * 0.012;
      b.part(new THREE.SphereGeometry(0.027, 6, 4), PAW, {
        bone: foot,
        at: [tx, 0.075, tz],
        scale: [0.9, 0.48, 1.35],
        name: `${front ? "finger" : "toe"}${side > 0 ? "L" : "R"}${toe}`,
        group: "limbs",
      });
    }
  }

  // Signature frilly gills: each side has a fleshy root and three branching, jagged pink fans.
  for (const side of [-1, 1]) {
    const sx = side;
    const root = [sx * 0.29, 0.72, 0.56] as [number, number, number];

    b.sweep(
      catmull([
        root,
        [sx * 0.42, 0.78, 0.55],
        [sx * 0.5, 0.83, 0.49],
      ]),
      [0.065, 0.035],
      {
        bone: head,
        color: GILL,
        section: { ngon: 7 },
        caps: "round",
        name: `gillRoot${side > 0 ? "L" : "R"}`,
        group: "gills",
      },
    );

    const branches = [
      [[sx * 0.43, 0.77, 0.55], [sx * 0.56, 0.94, 0.62], [sx * 0.64, 1.06, 0.58]],
      [[sx * 0.45, 0.76, 0.54], [sx * 0.62, 0.82, 0.67], [sx * 0.72, 0.89, 0.7]],
      [[sx * 0.44, 0.74, 0.52], [sx * 0.58, 0.66, 0.68], [sx * 0.68, 0.57, 0.73]],
    ] as [number, number, number][][];

    branches.forEach((points, branch) => {
      b.sweep(catmull(points), [0.028, 0.006], {
        bone: head,
        color: GILL_LIGHT,
        section: { ngon: 6 },
        caps: { start: "round", end: "point" },
        name: `gillFilament${side > 0 ? "L" : "R"}${branch}`,
        group: "gills",
      });

      // Broad angular web between the filament and its root, like a stylized frill.
      const a = points[0];
      const tip = points[2];
      const web = [
        [a[0], a[1] - 0.025, a[2]],
        [tip[0], tip[1] - 0.055, tip[2] - 0.015],
        [tip[0] + sx * 0.025, tip[1] + 0.045, tip[2] + 0.01],
        [a[0], a[1] + 0.03, a[2]],
      ] as [number, number, "sharp"][];
      b.slab(web, {
        color: GILL,
        thickness: 0.012,
        bone: head,
        name: `gillWeb${side > 0 ? "L" : "R"}${branch}`,
        group: "gills",
      });

      // Fine darker vein down each frill.
      b.rod(points[0], points[2], 0.006, {
        color: "#a94378",
        bone: head,
        name: `gillVein${side > 0 ? "L" : "R"}${branch}`,
        group: "gills",
      });
    });
  }

  // A subtle dorsal fin gives the tail a strong axolotl silhouette.
  const dorsal = b.extrude(
    [
      [0, 0],
      [0.04, 0.03],
      [0.10, 0.14],
      [0.18, 0.24, "sharp"],
      [0.25, 0.13],
      [0.31, 0.03],
      [0.35, 0],
    ],
    {
      at: [0, 0.59, -0.55],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 0,
      color: GILL,
      bone: hips,
      name: "tailFin",
      group: "tail",
    },
  );

  // Small tail-side fin echoes, kept simple so the gills remain the hero.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.12, 0.015],
        [0.2, 0.09, "sharp"],
        [0.14, 0.16],
        [0.03, 0.05],
      ],
      {
        at: [side * 0.025, 0.45, -0.9],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        color: GILL_LIGHT,
        bone: tail.joints[0],
        name: `tailSideFin${side > 0 ? "L" : "R"}`,
        group: "tail",
      },
    );
  }

  return b.root;
}

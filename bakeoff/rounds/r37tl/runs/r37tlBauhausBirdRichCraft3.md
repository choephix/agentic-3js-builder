```ts
import * as THREE from "three";
import { createBuilder, polyline, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Bauhaus Songbird on a Branch",
  description:
    "A cheerful low-poly songbird assembled from bold primary-colour geometry, perched on a simple angular branch."
};

export default function build() {
  const b = createBuilder({ name: "bauhaus-songbird", detail: 1 });

  const RED = "#e53935";
  const BLUE = "#1769aa";
  const YELLOW = "#f6c431";
  const BLACK = "#171717";
  const WHITE = "#fff8df";
  const BROWN = "#70452b";
  const BRANCH_DARK = "#3d281d";
  const ORANGE = "#f28c28";
  const GREEN = "#3d8b50";

  // Skeleton first: hips, spine, head, and a separate jaw hinge.
  const hips = b.joint("hips", {
    at: [0, 0.76, 0],
    dir: [0, 0.15, 1],
    role: "spine"
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.76, -0.18],
      [0, 0.82, 0.05],
      [0, 0.91, 0.28],
      [0, 1.02, 0.46]
    ]),
    {
      parent: hips,
      names: ["back", "chest", "neckBase", "neckTip"],
      role: "spine"
    }
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 1.1, 0.48],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head"
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.055, 0.56],
    dir: [0, -0.05, 1],
    role: "jaw",
    group: "head"
  });

  // Angular perch and two small offshoots.
  b.sweep(
    catmull([
      [-0.9, 0.105, -0.28],
      [-0.48, 0.075, -0.1],
      [0, 0.09, 0.04],
      [0.48, 0.11, 0.18],
      [0.92, 0.12, 0.38]
    ]),
    0.075,
    {
      color: BRANCH_DARK,
      sides: 7,
      section: "box",
      caps: "round",
      name: "perch",
      group: "scenery"
    }
  );

  b.sweep(
    polyline([
      [-0.42, 0.1, -0.08],
      [-0.62, 0.3, 0.15],
      [-0.78, 0.37, 0.3]
    ]),
    [0.045, 0.018],
    {
      color: BROWN,
      sides: 6,
      caps: "round",
      name: "twigL",
      group: "scenery"
    }
  );

  b.sweep(
    polyline([
      [0.38, 0.1, 0.16],
      [0.61, 0.3, 0.38],
      [0.77, 0.34, 0.46]
    ]),
    [0.04, 0.014],
    {
      color: BROWN,
      sides: 6,
      caps: "round",
      name: "twigR",
      group: "scenery"
    }
  );

  // Body and graphic belly.
  b.sweep(spine, (t) => (t < 0.55 ? 0.22 : 0.16), {
    color: RED,
    section: "box",
    sides: 8,
    name: "redBody",
    group: "body"
  });

  b.part(new THREE.SphereGeometry(0.255, 10, 7), YELLOW, {
    bone: spine.joints[1],
    at: [0, 0.86, 0.18],
    scale: [0.82, 1, 0.8],
    name: "goldenBelly",
    group: "body"
  });

  b.part(new THREE.SphereGeometry(0.205, 10, 7), BLUE, {
    bone: head,
    at: [0, 1.12, 0.51],
    scale: [1, 0.95, 1.08],
    name: "blueHead",
    group: "head"
  });

  // Bold triangular wings and a contrasting wing bar.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.19, -0.02],
        [0.27, -0.18],
        [0.17, -0.38],
        [0.03, -0.29]
      ],
      {
        at: [s * 0.16, 0.98, 0.18],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: RED,
        bone: spine.joints[1],
        name: `wing${s > 0 ? "L" : "R"}`,
        group: "wing"
      }
    );

    b.part(new THREE.BoxGeometry(0.035, 0.22, 0.07), YELLOW, {
      bone: spine.joints[1],
      at: [s * 0.285, 0.91, 0.17],
      rotation: [0, 0, s * 20],
      name: "wingBar",
      group: "wing"
    });
  }

  // Three geometric tail pennants.
  for (const s of [-1, 0, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.105, 0.01],
        [0.075, 0.42],
        [0.015, 0.53],
        [-0.025, 0.2]
      ],
      {
        at: [s * 0.09, 0.82, -0.28],
        x: [0, 0, -1],
        y: [0, 1, 0],
        thickness: 0.035,
        color: s === 0 ? YELLOW : BLUE,
        bone: hips,
        name: "tailFeather",
        group: "tail"
      }
    );
  }

  // Separate upper and lower beaks, giving the bird a readable singing pose.
  b.part(new THREE.ConeGeometry(0.1, 0.25, 4), ORANGE, {
    bone: head,
    at: [0, 1.105, 0.72],
    dir: [0, 0, 1],
    rotation: [Math.PI / 2, 0, 0],
    scale: [1, 0.65, 1],
    name: "upperBeak",
    group: "jaw"
  });

  b.part(new THREE.ConeGeometry(0.075, 0.17, 4), YELLOW, {
    bone: jaw,
    at: [0, 1.055, 0.71],
    dir: [0, 0, 1],
    rotation: [Math.PI / 2, 0, 0],
    scale: [1, 0.5, 1],
    name: "lowerBeak",
    group: "jaw"
  });

  // Large graphic eyes.
  for (const s of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.065, 10, 6), WHITE, {
      bone: head,
      at: [s * 0.105, 1.17, 0.655],
      scale: [1, 1, 0.42],
      name: "eyeWhite",
      group: "face"
    });

    b.part(new THREE.SphereGeometry(0.032, 8, 5), BLACK, {
      bone: head,
      at: [s * 0.105, 1.17, 0.705],
      scale: [1, 1, 0.35],
      name: "pupil",
      group: "face"
    });
  }

  // Yellow crest, like a Bauhaus cut-paper silhouette.
  b.extrude(
    [
      [0, 0],
      [0.07, 0],
      [0.045, 0.15],
      [0, 0.22],
      [-0.045, 0.15],
      [-0.07, 0]
    ],
    {
      at: [0, 1.24, 0.47],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: YELLOW,
      bone: head,
      name: "crest",
      group: "head"
    }
  );

  // Orange legs and simple toes curling over the branch.
  for (const s of [-1, 1]) {
    const leg = b.chain(
      `leg${s > 0 ? "L" : "R"}`,
      [
        [s * 0.13, 0.73, 0.02],
        [s * 0.14, 0.48, 0.08],
        [s * 0.15, 0.2, 0.06]
      ],
      {
        parent: hips,
        names: [
          `hip${s > 0 ? "L" : "R"}`,
          `ankle${s > 0 ? "L" : "R"}`,
          `foot${s > 0 ? "L" : "R"}`
        ],
        role: "leg",
        contact: [s * 0.15, 0.12, 0.06]
      }
    );

    b.sweep(leg, [0.035, 0.025], {
      color: ORANGE,
      section: "box",
      caps: "round",
      name: "leg",
      group: "leg"
    });

    for (const dz of [-0.045, 0, 0.045]) {
      b.sweep(
        polyline([
          [s * 0.15, 0.21, 0.06],
          [s * 0.15 + s * 0.045, 0.17, 0.06 + dz]
        ]),
        [0.016, 0.006],
        {
          color: ORANGE,
          caps: "round",
          name: "toe",
          group: "digit"
        }
      );
    }
  }

  // Two restrained green buds complete the branch composition.
  for (const p of [
    [-0.57, 0.31, 0.15],
    [0.68, 0.3, 0.4]
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.052, 7, 5), GREEN, {
      at: p,
      name: "leafBud",
      group: "scenery"
    });
  }

  return b.root;
}
```
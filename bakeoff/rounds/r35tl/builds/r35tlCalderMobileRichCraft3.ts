import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An abstract Alexander Calder-inspired hanging mobile with black wire arms, colorful flat geometric forms, counterweights, and asymmetrical balance.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17151b";
  const RED = "#e84b35";
  const BLUE = "#2779b8";
  const YELLOW = "#f3c83d";
  const ORANGE = "#ec812f";
  const WHITE = "#e9dfc6";
  const PINK = "#d94d83";
  const GREEN = "#4e9b68";

  // The mobile hangs in open air: the top hook is the highest point.
  const hook = b.joint("hook", {
    at: [0, 2.55, 0],
    dir: [0, -1, 0],
    role: "spine",
  });

  const stem = b.joint("stem", {
    parent: hook,
    at: [0, 2.55, 0],
    dir: [0, -1, 0],
    role: "spine",
  });

  b.rod([0, 2.55, 0], [0, 2.36, 0], 0.012, {
    color: BLACK,
    bone: hook,
    caps: "round",
  });

  // Small top loop and cap.
  b.part(new THREE.TorusGeometry(0.045, 0.009, 6, 12), BLACK, {
    bone: hook,
    at: [0, 2.57, 0],
    rotation: [90, 0, 0],
    name: "hangingLoop",
  });
  b.part(new THREE.SphereGeometry(0.035, 8, 5), BLACK, {
    bone: hook,
    at: [0, 2.36, 0],
    name: "topKnot",
  });

  const armA = b.chain(
    "armA",
    catmull([
      [0, 2.36, 0],
      [0.42, 2.34, 0.015],
      [0.86, 2.37, -0.01],
    ]),
    {
      parent: stem,
      names: ["armA_root", "armA_mid", "armA_tip"],
      role: "fan",
    },
  );
  b.sweep(armA, 0.012, {
    color: BLACK,
    caps: "round",
    section: { ngon: 6 },
  });

  const armB = b.chain(
    "armB",
    catmull([
      [0, 2.34, 0],
      [-0.38, 2.31, -0.02],
      [-0.76, 2.16, 0.015],
    ]),
    {
      parent: stem,
      names: ["armB_root", "armB_mid", "armB_tip"],
      role: "fan",
    },
  );
  b.sweep(armB, 0.012, {
    color: BLACK,
    caps: "round",
    section: { ngon: 6 },
  });

  // Flat Calder-like cut paper shapes.
  const disk = (at: THREE.Vector3 | [number, number, number], radius: number, color: string, bone: any, name: string) => {
    const points: [number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      points.push([Math.cos(a) * radius, Math.sin(a) * radius]);
    }
    return b.extrude(points, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.003,
      color,
      bone,
      name,
    });
  };

  const triangle = (
    at: THREE.Vector3 | [number, number, number],
    size: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.extrude(
      [
        [-size * 0.55, -size * 0.45],
        [size * 0.62, -size * 0.38],
        [-size * 0.08, size * 0.62],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.003,
        color,
        bone,
        name,
      },
    );

  const diamond = (
    at: THREE.Vector3 | [number, number, number],
    w: number,
    h: number,
    color: string,
    bone: any,
    name: string,
  ) =>
    b.extrude(
      [
        [0, h * 0.55],
        [w * 0.52, 0],
        [0, -h * 0.55],
        [-w * 0.52, 0],
      ],
      {
        at,
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.013,
        bevel: 0.002,
        color,
        bone,
        name,
      },
    );

  // First tier: deliberately uneven, with oversized forms.
  disk(armA.at(0.78).at, 0.105, RED, armA.tip, "redDisc");
  triangle(armA.at(0.36).at, 0.19, YELLOW, armA.joints[1], "yellowTriangle");

  const dropA = b.sprout(
    "dropA",
    armA.tip,
    [0.86, 1.87, -0.01],
    [0.009, 0.006],
    {
      count: 2,
      names: ["dropA_wire", "dropA_tip"],
      role: "fan",
      color: BLACK,
      caps: "round",
    },
  );
  disk([0.86, 1.78, -0.01], 0.145, BLUE, dropA.chain!.tip, "blueDisc");

  const dropB = b.sprout(
    "dropB",
    armA.joints[1],
    [0.39, 1.89, 0.01],
    [0.008, 0.005],
    {
      count: 1,
      names: ["dropB_tip"],
      role: "fan",
      color: BLACK,
      caps: "round",
    },
  );
  triangle([0.39, 1.79, 0.01], 0.16, PINK, dropB.chain!.tip, "pinkTriangle");

  // Second main arm, carrying a long counterweight and a nested mobile.
  diamond(armB.at(0.78).at, 0.23, 0.31, ORANGE, armB.tip, "orangeDiamond");

  const dropC = b.sprout(
    "dropC",
    armB.tip,
    [-0.76, 1.63, 0.02],
    [0.009, 0.006],
    {
      count: 2,
      names: ["dropC_wire", "dropC_tip"],
      role: "fan",
      color: BLACK,
      caps: "round",
    },
  );
  disk([-0.76, 1.53, 0.02], 0.095, WHITE, dropC.chain!.tip, "whiteDisc");

  const lowerArm = b.chain(
    "lowerArm",
    catmull([
      [-0.76, 1.63, 0.02],
      [-0.35, 1.59, 0.015],
      [-0.07, 1.72, -0.005],
    ]),
    {
      parent: dropC.chain!.tip,
      names: ["lowerArm_root", "lowerArm_mid", "lowerArm_tip"],
      role: "fan",
    },
  );
  b.sweep(lowerArm, 0.010, {
    color: BLACK,
    caps: "round",
    section: { ngon: 6 },
  });

  diamond(lowerArm.at(0.12).at, 0.18, 0.28, GREEN, lowerArm.joints[0], "greenDiamond");
  triangle(lowerArm.at(0.78).at, 0.2, RED, lowerArm.tip, "lowerRedTriangle");

  const dropD = b.sprout(
    "dropD",
    lowerArm.tip,
    [0.08, 1.28, 0],
    [0.008, 0.005],
    {
      count: 1,
      names: ["dropD_tip"],
      role: "fan",
      color: BLACK,
      caps: "round",
    },
  );
  disk([0.08, 1.18, 0], 0.12, YELLOW, dropD.chain!.tip, "lowerYellowDisc");

  // A separate right-side pendant makes the silhouette read as a balanced,
  // hand-tuned sculpture rather than a symmetrical chandelier.
  const dropE = b.sprout(
    "dropE",
    armB.joints[1],
    [-0.36, 1.78, -0.015],
    [0.008, 0.005],
    {
      count: 1,
      names: ["dropE_tip"],
      role: "fan",
      color: BLACK,
      caps: "round",
    },
  );
  diamond([-0.36, 1.68, -0.015], 0.16, 0.25, BLUE, dropE.chain!.tip, "smallBlueDiamond");

  // Counterweights: chunky wooden-looking colored beads at selected ends.
  b.part(new THREE.SphereGeometry(0.055, 8, 5), BLACK, {
    bone: armA.tip,
    at: [0.86, 2.37, -0.01],
    scale: [1.2, 0.8, 1.2],
    name: "armAWeight",
  });
  b.part(new THREE.SphereGeometry(0.05, 8, 5), BLACK, {
    bone: armB.tip,
    at: [-0.76, 2.16, 0.015],
    scale: [1.3, 0.8, 1.1],
    name: "armBWeight",
  });

  // Tiny brass-colored-looking black pivots emphasize the wire construction.
  for (const p of [
    [0, 2.36, 0],
    [0.42, 2.34, 0.015],
    [-0.38, 2.31, -0.02],
    [-0.07, 1.72, -0.005],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.022, 7, 5), BLACK, {
      at: p,
      name: "pivot",
    });
  }

  return b.root;
}

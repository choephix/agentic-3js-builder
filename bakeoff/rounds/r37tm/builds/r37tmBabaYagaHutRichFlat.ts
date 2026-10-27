import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut",
  description:
    "A stylized Slavic folk-art diorama of Baba Yaga's crooked wooden hut perched on expressive chicken legs, with carved shutters, glowing windows, a steep roof, moss, and folk decorations.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = "#6b321f";
  const WOOD_LIGHT = "#9b552d";
  const WOOD_DARK = "#3a1c19";
  const BARK = "#44231c";
  const ROOF = "#54284d";
  const ROOF_LIGHT = "#7c3d65";
  const GOLD = "#d69b3d";
  const CREAM = "#f1d69a";
  const INK = "#241329";
  const LEG = "#c37b3d";
  const LEG_DARK = "#7e402c";
  const CLAW = "#d9b46a";
  const MOSS = "#496b38";
  const LEAF = "#718d40";
  const WINDOW = "#f6b84c";
  const RED = "#a83e3c";
  const BLUE = "#355b78";

  const root = b.joint("hutRoot", {
    at: [0, 1.12, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const legLPath = [
    [0.38, 1.12, 0.04],
    [0.48, 0.83, 0.02],
    [0.38, 0.43, 0.11],
    [0.39, 0.27, 0.18],
  ];
  const legRPath = [
    [-0.38, 1.12, 0.04],
    [-0.49, 0.84, 0.02],
    [-0.39, 0.43, 0.11],
    [-0.41, 0.27, 0.18],
  ];

  const legL = b.chain("legL", legLPath, {
    parent: root,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.39, 0.02, 0.18],
  });
  const legR = b.chain("legR", legRPath, {
    parent: root,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.41, 0.02, 0.18],
  });

  b.sweep(legL, (t) => 0.105 - t * 0.045, {
    color: LEG,
    sides: 7,
    section: "circle",
  });
  b.sweep(legR, (t) => 0.105 - t * 0.045, {
    color: LEG,
    sides: 7,
    section: "circle",
  });

  const toe = (a: THREE.Vector3 | number[], c: THREE.Vector3 | number[]) =>
    b.rod(a, c, 0.026, { color: CLAW, caps: "round" });

  for (const s of [1, -1]) {
    const foot = [s * 0.4, 0.24, 0.18] as [number, number, number];
    toe(foot, [s * 0.66, 0.16, 0.31]);
    toe(foot, [s * 0.43, 0.14, 0.48]);
    toe(foot, [s * 0.19, 0.16, 0.32]);
    toe([s * 0.39, 0.26, 0.16], [s * 0.27, 0.15, -0.02]);
    b.part(new THREE.SphereGeometry(0.045, 7, 5), LEG_DARK, {
      bone: s > 0 ? legL.tip : legR.tip,
      at: foot,
    });
  }

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      bone: root,
      at,
      rotation,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 8,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone: root,
      at,
      dir,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    segments = 8,
  ) =>
    b.part(new THREE.SphereGeometry(radius, segments, Math.max(5, segments - 2)), color, {
      bone: root,
      at,
      flat: true,
    });

  // Small mossy presentation plinth, kept subordinate to the hut.
  cylinder(0.9, 0.08, [0, 0.04, 0], "#4d3c32", 10);
  cylinder(0.78, 0.055, [0, 0.105, 0], MOSS, 10);

  for (const p of [
    [-0.64, 0.145, 0.28],
    [0.54, 0.145, 0.37],
    [-0.46, 0.145, -0.39],
    [0.46, 0.145, -0.42],
  ] as [number, number, number][]) {
    sphere(0.09, p, "#695242", 7);
    sphere(0.045, [p[0] + 0.025, p[1] + 0.05, p[2] + 0.01], MOSS, 6);
  }

  // Crooked lower house body.
  box([1.43, 0.78, 1.12], [0, 1.65, 0], WOOD, [0, 0, -2], "crookedWall");
  box([1.5, 0.09, 1.17], [0.01, 1.27, 0], WOOD_DARK);
  box([1.48, 0.07, 1.13], [0, 2.04, 0], WOOD_LIGHT);

  // Horizontal log courses.
  for (const y of [1.34, 1.53, 1.73, 1.93]) {
    box([1.53, 0.065, 1.19], [0, y, 0], WOOD_LIGHT);
    box([1.48, 0.018, 1.2], [0, y + 0.037, 0.006], WOOD_DARK);
  }

  // Projecting log ends on both side walls.
  for (const s of [1, -1]) {
    for (const y of [1.39, 1.59, 1.79, 1.99]) {
      cylinder(0.055, 0.19, [s * 0.78, y, 0], WOOD_LIGHT, 7, [1, 0, 0]);
      cylinder(0.05, 0.18, [s * 0.79, y, -0.37], WOOD_DARK, 7, [1, 0, 0]);
    }
  }

  // Steep two-sided roof.
  box([0.98, 0.12, 1.4], [0.47, 2.37, 0], ROOF, [0, 0, -28], "roofLeft");
  box([0.98, 0.12, 1.4], [-0.47, 2.37, 0], ROOF_LIGHT, [0, 0, 28], "roofRight");
  box([0.15, 0.16, 1.45], [0, 2.78, 0], WOOD_DARK, [0, 0, 0], "roofRidge");

  // Roof plank stripes and hanging scalloped eaves.
  for (const s of [1, -1]) {
    for (const z of [-0.48, -0.16, 0.16, 0.48]) {
      box(
        [0.94, 0.025, 0.035],
        [s * 0.47, 2.37, z],
        s > 0 ? ROOF_LIGHT : ROOF,
        [0, 0, s * -28],
      );
    }
    for (const z of [-0.52, -0.26, 0, 0.26, 0.52]) {
      const x = s * 0.9;
      cylinder(0.025, 0.17, [x, 2.0, z], GOLD, 6, [0, -1, 0]);
      sphere(0.045, [x, 1.9, z], RED, 6);
    }
  }

  // Front door, threshold, and heavy carved frame.
  box([0.38, 0.6, 0.055], [0, 1.56, 0.585], WOOD_DARK, undefined, "door");
  box([0.46, 0.07, 0.08], [0, 1.87, 0.62], WOOD_LIGHT);
  box([0.07, 0.67, 0.08], [-0.23, 1.57, 0.61], WOOD_LIGHT);
  box([0.07, 0.67, 0.08], [0.23, 1.57, 0.61], WOOD_LIGHT);
  box([0.5, 0.06, 0.11], [0, 1.23, 0.62], WOOD_DARK);
  cylinder(0.035, 0.035, [0.12, 1.57, 0.635], GOLD, 8, [0, 0, 1]);

  // Door folk carving: sun, diamond, and vertical boards.
  for (const x of [-0.12, 0, 0.12]) box([0.018, 0.53, 0.012], [x, 1.56, 0.626], WOOD);
  cylinder(0.115, 0.018, [0, 1.78, 0.64], GOLD, 12, [0, 0, 1]);
  cylinder(0.07, 0.022, [0, 1.78, 0.655], RED, 10, [0, 0, 1]);
  for (const s of [1, -1]) {
    box([0.025, 0.19, 0.014], [s * 0.055, 1.78, 0.668], CREAM, [0, 0, s * 45]);
  }

  // Glowing front window with chunky cross frame.
  const windowFrame = box([0.43, 0.38, 0.065], [0.43, 1.7, 0.585], WOOD_DARK);
  const pane = b.part(new THREE.BoxGeometry(0.31, 0.27, 0.02), WINDOW, {
    bone: root,
    at: [0.43, 1.7, 0.627],
    name: "warmWindow",
  });
  const paneMaterial = pane.mesh.material as THREE.MeshStandardMaterial;
  paneMaterial.emissive.set(WINDOW);
  paneMaterial.emissiveIntensity = 1.4;
  box([0.035, 0.31, 0.035], [0.43, 1.7, 0.65], GOLD);
  box([0.36, 0.035, 0.035], [0.43, 1.7, 0.65], GOLD);
  box([0.5, 0.05, 0.1], [0.43, 1.93, 0.62], WOOD_LIGHT);

  // Side window and shutters.
  box([0.05, 0.4, 0.43], [-0.735, 1.72, -0.08], WOOD_DARK);
  box([0.02, 0.3, 0.3], [-0.77, 1.72, -0.08], WINDOW);
  box([0.035, 0.34, 0.34], [-0.8, 1.72, -0.27], RED, [0, 0, -8]);
  box([0.035, 0.34, 0.34], [-0.8, 1.72, 0.11], BLUE, [0, 0, 8]);
  for (const z of [-0.27, 0.11]) {
    box([0.015, 0.03, 0.28], [-0.825, 1.72, z], GOLD);
    box([0.015, 0.28, 0.03], [-0.825, 1.72, z], GOLD);
  }

  // Carved triangular gable ornament.
  const gable = b.extrude(
    [
      [-0.42, 0],
      [0.42, 0],
      [0, 0.43, "sharp"],
    ],
    {
      at: [0, 2.05, 0.57],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      color: WOOD_LIGHT,
      bone: root,
      name: "gableCarving",
    },
  );
  cylinder(0.07, 0.04, [0, 2.31, 0.61], GOLD, 8, [0, 0, 1]);
  for (const s of [1, -1]) {
    b.spike([s * 0.19, 2.16, 0.62], [0, 0, 1], 0.13, 0.025, {
      color: RED,
      bone: root,
    });
  }

  // Moss along roof and wall seams.
  for (const p of [
    [-0.7, 2.06, -0.46],
    [-0.52, 2.08, -0.15],
    [0.62, 2.08, 0.18],
    [0.76, 2.1, 0.48],
    [-0.57, 2.72, 0.2],
    [0.48, 2.75, -0.34],
  ] as [number, number, number][]) {
    sphere(0.055, p, MOSS, 6);
    b.spike(p, [0, 1, 0], 0.09, 0.028, { color: LEAF, bone: root });
  }

  // Folk-art garland under the front eave.
  for (let i = 0; i < 9; i++) {
    const x = -0.66 + i * 0.165;
    const y = 2.08 - 0.045 * Math.abs(i - 4);
    cylinder(0.025, 0.16, [x, y, 0.61], i % 2 ? RED : GOLD, 6, [0, -1, 0]);
    sphere(0.04, [x, y - 0.1, 0.61], i % 2 ? BLUE : CREAM, 6);
  }

  // A crooked chimney with a folk cap.
  box([0.22, 0.36, 0.22], [-0.3, 2.43, -0.2], WOOD_DARK, [0, 0, -4], "chimney");
  box([0.29, 0.07, 0.28], [-0.31, 2.63, -0.2], ROOF_LIGHT, [0, 0, -4]);
  for (const x of [-0.37, -0.25]) sphere(0.045, [x, 2.7, -0.2], MOSS, 6);

  // Small hanging herbs beside the door.
  for (let i = 0; i < 5; i++) {
    const x = -0.48 + i * 0.07;
    b.rod([x, 1.96, 0.66], [x + 0.025, 1.72, 0.66], 0.012, {
      color: LEAF,
      bone: root,
    });
    b.spike([x + 0.025, 1.75, 0.66], [0, -1, 0], 0.1 + (i % 2) * 0.04, 0.018, {
      color: MOSS,
      bone: root,
    });
  }

  // Three little folk-art pennants at the ridge.
  for (const [x, c] of [
    [-0.38, RED],
    [0, GOLD],
    [0.38, BLUE],
  ] as [number, string][]) {
    b.rod([x, 2.78, 0.02], [x, 2.98, 0.02], 0.012, { color: WOOD_DARK, bone: root });
    b.extrude(
      [
        [0, 0],
        [0.16, -0.03],
        [0.04, -0.13, "sharp"],
      ],
      {
        at: [x, 2.9, 0.03],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: c,
        bone: root,
      },
    );
  }

  // A few irregular nail heads and carved studs.
  const random = rng(19);
  for (let i = 0; i < 18; i++) {
    const x = -0.66 + random() * 1.32;
    const y = 1.34 + random() * 0.62;
    sphere(0.014, [x, y, 0.607], GOLD, 5);
  }

  return b.root;
}

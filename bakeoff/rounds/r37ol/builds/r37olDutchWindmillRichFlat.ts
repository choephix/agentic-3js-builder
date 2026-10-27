import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Dutch Windmill",
  description: "A cheerful Animal Crossing-style Dutch windmill with a tapered brick tower, red cap, windows, door, sails, and flower-box details.",
};

export default function build() {
  const b = createBuilder({ name: "dutchWindmill", detail: 1 });

  const CREAM = "#f4e4b8";
  const CREAM_LIGHT = "#fff1c9";
  const BRICK = "#b95745";
  const BRICK_DARK = "#803a36";
  const ROOF = "#b94238";
  const ROOF_DARK = "#702c31";
  const WOOD = "#57352b";
  const WOOD_LIGHT = "#8b5940";
  const INK = "#282635";
  const GLASS = "#79b9c5";
  const GOLD = "#efb84f";
  const GRASS = "#78a94d";
  const FLOWER = "#e86b73";
  const FLOWER_YELLOW = "#f4cf54";
  const STONE = "#aaa28e";
  const STONE_DARK = "#777267";

  const box = (size: [number, number, number], color: string, at: [number, number, number], rotation?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      flat: true,
    });

  const cylinder = (radius: number, height: number, color: string, at: [number, number, number], radial = 10) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      flat: true,
    });

  const rod = (a: THREE.Vector3 | [number, number, number], z: THREE.Vector3 | [number, number, number], radius: number, color: string) =>
    b.rod(a, z, radius, { color, section: { ngon: 6 }, caps: "flat" });

  // Foundation stones, kept simple and chunky.
  const foundation = [
    [-0.34, 0.07, 0.0],
    [-0.17, 0.06, -0.03],
    [0.0, 0.065, -0.025],
    [0.18, 0.06, -0.02],
    [0.35, 0.07, 0.0],
    [-0.31, 0.06, 0.18],
    [0.0, 0.06, 0.2],
    [0.31, 0.06, 0.18],
  ] as [number, number, number][];

  foundation.forEach((p, i) => {
    const s = 0.15 + (i % 3) * 0.018;
    box([s, 0.13, 0.13], i % 2 ? STONE : STONE_DARK, p, [0, (i % 3) * 7, 0]);
  });

  // Main tapered Dutch tower.
  b.frustumBox(
    [0, 0.14, 0],
    [0, 1.48, 0],
    [0.66, 0.12],
    [0.43, 0.09],
    { color: CREAM, section: "box", caps: "flat", flat: true, name: "tower" },
  );

  // Warm brick courses and corner accents.
  for (let y = 0.28; y <= 1.35; y += 0.22) {
    b.sweep(
      [
        [-0.53, y, -0.01],
        [0.53, y, -0.01],
      ],
      0.018,
      { color: BRICK, section: { ngon: 4 }, caps: "flat", name: `brickCourse${y.toFixed(2)}` },
    );
  }

  // Vertical red corner pilasters.
  for (const x of [-0.43, 0.43]) {
    rod([x, 0.18, 0.01], [x * 0.72, 1.43, 0.01], 0.035, BRICK_DARK);
  }

  // Dark timber band just beneath the cap.
  b.sweep(
    [
      [-0.45, 1.43, 0],
      [0.45, 1.43, 0],
    ],
    0.045,
    { color: WOOD, section: { ngon: 6 }, caps: "flat", name: "capBeam" },
  );

  // Red octagonal cap and golden finial.
  cylinder(0.5, 0.22, ROOF, [0, 1.58, 0], 8);
  b.part(new THREE.ConeGeometry(0.5, 0.34, 8), ROOF_DARK, {
    at: [0, 1.83, 0],
    flat: true,
    name: "roof",
  });
  cylinder(0.075, 0.18, WOOD, [0, 2.08, 0], 8);
  b.part(new THREE.SphereGeometry(0.095, 8, 5), GOLD, {
    at: [0, 2.19, 0],
    flat: true,
    name: "finial",
  });

  // Front door: raised dark timber frame, warm door, and round handle.
  box([0.28, 0.48, 0.045], WOOD, [0, 0.39, 0.345]);
  box([0.22, 0.40, 0.052], WOOD_LIGHT, [0, 0.4, 0.371]);
  box([0.025, 0.38, 0.058], WOOD, [0, 0.4, 0.404]);
  box([0.19, 0.025, 0.06], WOOD, [0, 0.39, 0.405]);
  cylinder(0.025, 0.018, GOLD, [0.07, 0.4, 0.435], 8);
  b.part(new THREE.SphereGeometry(0.028, 8, 5), GOLD, {
    at: [0.07, 0.4, 0.45],
    flat: true,
    name: "doorHandle",
  });

  // Front windows, each with a thick dark surround and crossbars.
  const window = (x: number, y: number, scale: number) => {
    box([0.19 * scale, 0.23 * scale, 0.04], WOOD, [x, y, 0.335]);
    box([0.145 * scale, 0.18 * scale, 0.047], GLASS, [x, y, 0.36]);
    box([0.018 * scale, 0.18 * scale, 0.06], WOOD, [x, y, 0.39]);
    box([0.145 * scale, 0.018 * scale, 0.06], WOOD, [x, y, 0.392]);
  };
  window(-0.235, 0.73, 1);
  window(0.235, 0.73, 1);
  window(0, 1.17, 0.75);

  // Small flower boxes below the windows.
  for (const x of [-0.235, 0.235]) {
    box([0.28, 0.07, 0.12], WOOD, [x, 0.56, 0.39]);
    for (const dx of [-0.09, 0, 0.09]) {
      cylinder(0.025, 0.07, GRASS, [x + dx, 0.63, 0.39], 6);
      b.part(new THREE.SphereGeometry(0.042, 7, 5), dx === 0 ? FLOWER_YELLOW : FLOWER, {
        at: [x + dx, 0.7, 0.39],
        flat: true,
        name: "flower",
      });
    }
  }

  // Rear-side suggestion: a little cream tail door on the back.
  box([0.18, 0.28, 0.04], WOOD, [0, 0.52, -0.32]);
  box([0.13, 0.22, 0.048], CREAM_LIGHT, [0, 0.52, -0.35]);

  // Sail hub on the front face, facing +Z.
  cylinder(0.115, 0.13, WOOD, [0, 1.54, 0.47], 10);
  cylinder(0.072, 0.145, GOLD, [0, 1.54, 0.55], 10);

  // Four broad timber arms. The rods are deliberately oversized and toy-like.
  const center = new THREE.Vector3(0, 1.54, 0.64);
  const armTips = [
    new THREE.Vector3(0, 2.18, 0.64),
    new THREE.Vector3(0.64, 1.54, 0.64),
    new THREE.Vector3(0, 0.90, 0.64),
    new THREE.Vector3(-0.64, 1.54, 0.64),
  ];

  armTips.forEach((tip, i) => {
    rod(center, tip, 0.042, WOOD);
    // Cream sail panels sit on the clockwise side of each arm.
    const dx = tip.x - center.x;
    const dy = tip.y - center.y;
    const length = Math.hypot(dx, dy);
    const nx = -dy / length;
    const ny = dx / length;
    const inner = 0.13;
    const outer = length * 0.88;
    const p0: [number, number, number] = [
      center.x + dx / length * inner + nx * 0.04,
      center.y + dy / length * inner + ny * 0.04,
      0.69,
    ];
    const p1: [number, number, number] = [
      center.x + dx / length * outer + nx * 0.04,
      center.y + dy / length * outer + ny * 0.04,
      0.69,
    ];
    const width = 0.17;
    const a: [number, number, number] = [p0[0] + nx * width, p0[1] + ny * width, p0[2]];
    const c: [number, number, number] = [p1[0] + nx * width * 0.58, p1[1] + ny * width * 0.58, p1[2]];
    const mid = new THREE.Vector3((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, 0.7);
    const sailLen = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const angle = Math.atan2(c[1] - a[1], c[0] - a[0]);
    box([sailLen, width * 0.72, 0.025], i % 2 ? CREAM_LIGHT : CREAM, [mid.x, mid.y, mid.z], [0, 0, angle]);
    // Dark outer sail rib.
    rod([a[0], a[1], 0.725], [c[0], c[1], 0.725], 0.016, WOOD_DARK);
  });

  // Small triangular-looking diagonal braces at the hub.
  for (const s of [-1, 1]) {
    rod([0, 1.54, 0.73], [s * 0.2, 1.74, 0.73], 0.018, WOOD_LIGHT);
    rod([0, 1.54, 0.73], [s * 0.2, 1.34, 0.73], 0.018, WOOD_LIGHT);
  }

  // A tiny weather vane shaped like a bird on the roof.
  rod([0, 2.19, 0], [0, 2.29, 0], 0.012, GOLD);
  rod([-0.01, 2.28, 0], [0.15, 2.31, 0], 0.012, GOLD);
  b.part(new THREE.ConeGeometry(0.035, 0.12, 5), GOLD, {
    at: [0.18, 2.31, 0],
    dir: [1, 0, 0],
    flat: true,
    name: "weatherVane",
  });

  // A few cheerful grass tufts at the footprint, without creating scenery beyond the subject.
  const random = rng(14);
  for (let i = 0; i < 12; i++) {
    const x = (random() - 0.5) * 0.9;
    const z = (random() - 0.5) * 0.5;
    const h = 0.08 + random() * 0.06;
    rod([x, 0.13, z], [x + (random() - 0.5) * 0.05, 0.13 + h, z], 0.009, GRASS);
  }

  return b.root;
}

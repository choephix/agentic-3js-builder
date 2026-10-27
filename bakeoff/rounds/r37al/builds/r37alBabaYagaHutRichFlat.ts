import * as THREE from "three";
import { createBuilder, rng, catmull } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description: "A richly decorated Slavic folk-art diorama of a crooked log hut perched on expressive chicken legs.",
};

export default function build() {
  const b = createBuilder({ name: "babaYagaHut", detail: 1 });

  const WOOD = "#6f351f";
  const WOOD_DARK = "#3d1b16";
  const WOOD_LIGHT = "#a86132";
  const ROOF = "#3c2630";
  const ROOF_RED = "#733226";
  const ROOF_LIGHT = "#a94d31";
  const STRAW = "#b99445";
  const GOLD = "#d5a83c";
  const BLACK = "#17151a";
  const IVORY = "#ead9aa";
  const BONE = "#cdbb8b";
  const LEG = "#a96835";
  const LEG_DARK = "#63341f";
  const RED = "#a62e2f";
  const BLUE = "#315a76";
  const CREAM = "#e6c98a";
  const GREEN = "#355b3a";
  const GROUND = "#30271f";

  const root = b.joint("hutRoot", { at: [0, 0.72, 0], role: "spine" });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone: opts.bone ?? root,
      at,
      rotation: opts.rotation,
      scale: opts.scale,
      name: opts.name,
      group: opts.group,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    opts: any = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius * (opts.taper ?? 1), height, opts.segments ?? 8),
      color,
      {
        bone: opts.bone ?? root,
        at,
        rotation: opts.rotation,
        name: opts.name,
        group: opts.group,
      },
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    opts: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, opts.segments ?? 8, opts.rings ?? 5), color, {
      bone: opts.bone ?? root,
      at,
      scale: opts.scale,
      name: opts.name,
      group: opts.group,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    opts: any = {},
  ) => b.rod(a, c, radius, { bone: opts.bone ?? root, color, caps: "round", name: opts.name });

  // A small painted earth island keeps the hut grounded without competing with it.
  cyl(1.23, 0.09, [0, 0.045, 0], GROUND, { segments: 12, name: "earthIsland" });
  cyl(1.05, 0.025, [0, 0.102, 0], "#5b6239", { segments: 12, name: "mossTop" });
  for (const p of [
    [-0.82, 0.12, 0.22],
    [0.72, 0.12, -0.28],
    [0.18, 0.12, 0.83],
    [-0.42, 0.12, -0.73],
  ] as [number, number, number][]) {
    sphere(0.11, p, "#55402d", { segments: 7, rings: 4 });
    sphere(0.07, [p[0], p[1] + 0.06, p[2]], "#6d7542", { segments: 6, rings: 3 });
  }

  // Two crooked chicken legs, skeleton first. Their toes rest on the moss.
  const legL = b.chain(
    "legL",
    catmull([
      [0.37, 0.91, 0.02],
      [0.46, 0.62, 0.02],
      [0.35, 0.37, 0.03],
      [0.42, 0.18, 0.04],
    ]),
    { parent: root, names: ["hipL", "kneeL", "ankleL", "footL"], role: "leg", contact: [0.42, 0.12, 0.04] },
  );
  const legR = b.chain(
    "legR",
    catmull([
      [-0.37, 0.91, -0.04],
      [-0.45, 0.65, -0.02],
      [-0.31, 0.38, -0.03],
      [-0.4, 0.18, -0.05],
    ]),
    { parent: root, names: ["hipR", "kneeR", "ankleR", "footR"], role: "leg", contact: [-0.4, 0.12, -0.05] },
  );

  b.sweep(legL, (t) => 0.075 - t * 0.025, {
    bone: legL,
    color: LEG,
    sides: 7,
    section: { ngon: 6 },
    caps: "round",
    name: "legL.shaft",
  });
  b.sweep(legR, (t) => 0.075 - t * 0.025, {
    bone: legR,
    color: LEG,
    sides: 7,
    section: { ngon: 6 },
    caps: "round",
    name: "legR.shaft",
  });

  // Knobby joints and ornamental bands.
  for (const s of [1, -1]) {
    const x = s * 0.42;
    sphere(0.095, [x, 0.61, s * 0.015], LEG_DARK, { bone: s > 0 ? legL.joints[0] : legR.joints[0], segments: 7 });
    sphere(0.08, [s * 0.35, 0.37, s * 0.025], LEG_DARK, { segments: 7 });
    rod([s * 0.405, 0.51, 0.01], [s * 0.40, 0.58, 0.01], 0.014, GOLD);
    rod([s * 0.34, 0.29, 0.03], [s * 0.38, 0.34, 0.03], 0.012, RED);
  }

  // Three-toed chicken feet, exaggerated and readable.
  for (const s of [1, -1]) {
    const ankle: [number, number, number] = [s * 0.42, 0.17, s * 0.04];
    for (const [dx, dz, len] of [
      [s * 0.16, 0.02, 0.22],
      [s * 0.03, 0.1, 0.2],
      [s * -0.05, -0.1, 0.19],
    ] as [number, number, number][]) {
      const tip: [number, number, number] = [ankle[0] + dx, 0.115, ankle[2] + dz];
      rod(ankle, tip, 0.026, LEG, { name: "toe" });
      sphere(0.032, tip, LEG_DARK, { segments: 6, rings: 4 });
    }
    sphere(0.08, ankle, LEG, { segments: 7, rings: 4 });
  }

  // Cabin body: a compact squared log house with projecting log ends.
  const bodyY = 1.27;
  box([1.15, 0.76, 0.92], [0, bodyY, 0], WOOD_DARK, { name: "cabinShadow" });

  // Horizontal log courses on front and back.
  const courses = [0.94, 1.10, 1.26, 1.42, 1.58];
  for (let i = 0; i < courses.length; i++) {
    const y = courses[i];
    const c = i % 2 ? WOOD_LIGHT : WOOD;
    rod([-0.69, y, 0.46], [0.69, y, 0.46], 0.075, c, { name: "frontLog" });
    rod([-0.69, y, -0.46], [0.69, y, -0.46], 0.075, c, { name: "backLog" });
    rod([-0.57, y, -0.52], [-0.57, y, 0.52], 0.07, c, { name: "sideLogL" });
    rod([0.57, y, -0.52], [0.57, y, 0.52], 0.07, c, { name: "sideLogR" });
  }

  // Round log ends at the corners, like a folk-carved dovetail cabin.
  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.5, 0.5]) {
      for (let i = 0; i < 4; i++) {
        cyl(0.071, 0.18, [x, 1.02 + i * 0.18, z], i % 2 ? WOOD_LIGHT : WOOD, {
          rotation: [0, 0, Math.PI / 2],
          segments: 7,
          name: "logEnd",
        });
      }
    }
  }

  // Decorative dark seams between courses.
  for (const y of [1.015, 1.175, 1.335, 1.495]) {
    rod([-0.56, y, 0.522], [0.56, y, 0.522], 0.009, WOOD_DARK);
    rod([-0.56, y, -0.522], [0.56, y, -0.522], 0.009, WOOD_DARK);
  }

  // Gable wall and triangular roof support.
  const gableOutline: [number, number, "sharp"][] = [
    [-0.54, 0],
    [0.54, 0],
    [0, 0.55, "sharp"],
  ];
  b.extrude(gableOutline, {
    at: [-0.005, 1.62, 0.0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.92,
    color: WOOD,
    bone: root,
    name: "frontGable",
  });

  // Two thick sloping roof planes, visibly handmade and slightly uneven.
  box([1.38, 0.08, 0.73], [-0.34, 1.97, 0], ROOF, { rotation: [0, 0, -0.56], name: "roofLeft" });
  box([1.38, 0.08, 0.73], [0.34, 2.00, 0], ROOF_RED, { rotation: [0, 0, 0.56], name: "roofRight" });
  rod([-0.78, 1.77, 0], [0, 2.28, 0], 0.055, ROOF_LIGHT);
  rod([0, 2.28, 0], [0.78, 1.80, 0], 0.055, ROOF_LIGHT);
  rod([-0.78, 1.77, 0.47], [0, 2.28, 0.47], 0.042, STRAW);
  rod([0, 2.28, 0.47], [0.78, 1.80, 0.47], 0.042, STRAW);

  // Roof ridge ornaments: carved finials and dangling yarn.
  cyl(0.07, 0.25, [0, 2.38, 0], GOLD, { segments: 6 });
  sphere(0.095, [0, 2.52, 0], RED, { segments: 7, rings: 4 });
  rod([0, 2.58, 0], [0, 2.78, 0], 0.014, GOLD);
  for (const s of [-1, 1]) {
    rod([s * 0.48, 2.08, 0.48], [s * 0.59, 1.94, 0.48], 0.018, STRAW);
    sphere(0.045, [s * 0.59, 1.91, 0.48], RED, { segments: 6, rings: 4 });
  }

  // Front door, heavy frame, iron studs and a crescent handle.
  box([0.32, 0.58, 0.035], [0, 1.19, 0.49], WOOD_DARK, { name: "door" });
  box([0.24, 0.49, 0.025], [0, 1.18, 0.513], "#4d2b25", { name: "doorInset" });
  for (const y of [0.98, 1.18, 1.38]) {
    sphere(0.018, [-0.09, y, 0.535], GOLD, { segments: 6, rings: 4 });
    sphere(0.018, [0.09, y, 0.535], GOLD, { segments: 6, rings: 4 });
  }
  cyl(0.022, 0.10, [0.075, 1.18, 0.555], GOLD, { rotation: [Math.PI / 2, 0, 0], segments: 8 });
  sphere(0.045, [0.075, 1.18, 0.585], GOLD, { segments: 7, rings: 4 });

  // Window with blue glass, red shutters, and a sunflower-like trim.
  box([0.34, 0.31, 0.035], [0.37, 1.34, 0.49], WOOD_DARK);
  box([0.25, 0.22, 0.022], [0.37, 1.34, 0.516], BLUE);
  rod([0.37, 1.23, 0.535], [0.37, 1.45, 0.535], 0.012, GOLD);
  rod([0.26, 1.34, 0.535], [0.48, 1.34, 0.535], 0.012, GOLD);
  for (const s of [-1, 1]) {
    box([0.07, 0.36, 0.045], [0.37 + s * 0.22, 1.34, 0.49], RED, { rotation: [0, 0, s * 0.04] });
    for (let i = 0; i < 3; i++) sphere(0.019, [0.37 + s * 0.22, 1.23 + i * 0.11, 0.525], GOLD, { segments: 6, rings: 4 });
  }

  // Carved folk symbols on the façade: sun, diamonds, and blue/red stripes.
  cyl(0.11, 0.025, [-0.38, 1.75, 0.49], GOLD, { rotation: [Math.PI / 2, 0, 0], segments: 12 });
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    rod(
      [-0.38 + Math.cos(a) * 0.11, 1.75 + Math.sin(a) * 0.11, 0.52],
      [-0.38 + Math.cos(a) * 0.17, 1.75 + Math.sin(a) * 0.17, 0.52],
      0.012,
      GOLD,
    );
  }
  const diamond = [
    [-0.1, 0],
    [0, 0.1],
    [0.1, 0],
    [0, -0.1],
  ] as [number, number][];
  b.extrude(diamond, { at: [0.37, 1.72, 0.53], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.018, color: RED });
  for (const x of [-0.53, -0.43]) rod([x, 0.98, 0.54], [x, 1.58, 0.54], 0.015, sColor(x));

  function sColor(x: number) {
    return x < -0.47 ? BLUE : GOLD;
  }

  // Chimney and crooked smoke cap.
  box([0.22, 0.34, 0.22], [0.31, 2.05, -0.12], WOOD_DARK, { rotation: [0, 0, -0.08] });
  box([0.28, 0.06, 0.27], [0.30, 2.23, -0.11], ROOF_RED, { rotation: [0, 0, -0.08] });
  const smoke = b.chain(
    "smoke",
    catmull([
      [0.31, 2.28, -0.11],
      [0.42, 2.42, -0.1],
      [0.31, 2.57, -0.08],
      [0.47, 2.70, -0.06],
    ]),
    { parent: root, role: "fan", count: 3 },
  );
  b.sweep(smoke, [0.07, 0.025], { color: "#8a746e", caps: "round", name: "blueSmoke" });
  sphere(0.08, [0.47, 2.72, -0.06], "#9d8980", { segments: 7, rings: 4 });

  // A little hanging witch-broom bundle beneath the eave.
  rod([-0.68, 1.82, 0.43], [-0.76, 1.30, 0.43], 0.018, WOOD_LIGHT);
  for (let i = 0; i < 7; i++) {
    const x = -0.82 + i * 0.035;
    rod([x, 1.19, 0.43], [x + 0.04, 1.34, 0.43], 0.012, STRAW);
  }
  rod([-0.86, 1.34, 0.43], [-0.60, 1.34, 0.43], 0.024, RED);

  // Doorstep skull charm: a signature Baba Yaga detail.
  sphere(0.075, [0.0, 0.73, 0.62], BONE, { segments: 8, rings: 6 });
  sphere(0.022, [-0.027, 0.75, 0.685], BLACK, { segments: 6, rings: 4 });
  sphere(0.022, [0.027, 0.75, 0.685], BLACK, { segments: 6, rings: 4 });
  box([0.05, 0.025, 0.035], [0, 0.70, 0.69], BONE);
  for (const x of [-0.018, 0, 0.018]) box([0.008, 0.025, 0.02], [x, 0.68, 0.69], BLACK);

  // Short picket fence around the island, irregular and folk-painted.
  const fencePosts: [number, number, number][] = [
    [-0.95, 0.26, -0.55],
    [-0.72, 0.29, -0.78],
    [-0.38, 0.25, -0.92],
    [0.0, 0.27, -0.98],
    [0.45, 0.26, -0.88],
    [0.78, 0.28, -0.65],
  ];
  for (let i = 0; i < fencePosts.length; i++) {
    const [x, y, z] = fencePosts[i];
    cyl(0.035, 0.32 + (i % 2) * 0.08, [x, y + 0.14, z], i % 2 ? BLUE : RED, { segments: 6 });
    const topY = y + 0.31 + (i % 2) * 0.08;
    b.spike([x, topY, z], [0, 1, 0], 0.09, 0.035, { color: GOLD });
  }
  for (let i = 0; i < fencePosts.length - 1; i++) {
    const a = fencePosts[i], c = fencePosts[i + 1];
    rod([a[0], 0.30, a[2]], [c[0], 0.30, c[2]], 0.018, STRAW);
    rod([a[0], 0.43, a[2]], [c[0], 0.43, c[2]], 0.018, STRAW);
  }

  // Folk-painted stepping stones toward the door.
  for (const [i, z] of [-0.82, -0.64, -0.46].entries()) {
    sphere(0.095, [0, 0.13, z], i % 2 ? "#7c6245" : "#856c4a", { scale: [1.5, 0.45, 0.8], segments: 7, rings: 4 });
    rod([-0.04, 0.165, z], [0.04, 0.165, z], 0.012, i % 2 ? RED : BLUE);
  }

  return b.root;
}

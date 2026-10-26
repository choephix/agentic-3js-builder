import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "cyanotype-spitfire",
  description: "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint.",
};

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });

  const INK = "#031b38";
  const DEEP = "#06345d";
  const BLUE = "#0a5680";
  const MID = "#0c7195";
  const CYAN = "#38c7dc";
  const PALE = "#b7f5f5";
  const WHITE = "#e0ffff";
  const GLASS = "#082b55";
  const RUBBER = "#02182d";
  const HUB = "#55d4df";
  const WARNING = "#1a91ae";

  const flat = true;

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number] | THREE.Vector3,
    options: Record<string, unknown> = {},
  ) {
    return b.part(geometry, color, {
      at,
      flat,
      ...options,
    });
  }

  function box(
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) {
    return part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, options);
  }

  function cylinder(
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) {
    return part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, at, {
      dir,
    });
  }

  function disc(
    radius: number,
    depth: number,
    color: string,
    at: [number, number, number],
    dir: [number, number, number] = [0, 1, 0],
    segments = 24,
  ) {
    return part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, at, {
      dir,
    });
  }

  function sphere(
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    segments = 12,
    rings = 8,
  ) {
    return part(new THREE.SphereGeometry(1, segments, rings), color, at, { scale });
  }

  function rod(
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: "flat",
      section: { ngon: 6 },
      ...options,
    });
  }

  function capsule(
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
  ) {
    return b.capsule(a, c, radius, {
      color,
      section: { ngon: 8 },
    });
  }

  function wingOutline() {
    return [
      [0, -1.20],
      [0.65, -1.14],
      [1.65, -1.00],
      [2.85, -0.78],
      [4.05, -0.52],
      [4.90, -0.20],
      [5.33, 0.12],
      [5.45, 0.38],
      [5.36, 0.62],
      [5.02, 0.80],
      [4.35, 0.91],
      [3.35, 1.00],
      [2.25, 1.09],
      [1.20, 1.16],
      [0, 1.20],
    ] as [number, number][];
  }

  function tailPlaneOutline() {
    return [
      [0, -0.58],
      [0.56, -0.54],
      [1.18, -0.42],
      [1.72, -0.23],
      [2.05, 0.02],
      [1.98, 0.22],
      [1.70, 0.37],
      [1.17, 0.48],
      [0.56, 0.55],
      [0, 0.58],
    ] as [number, number][];
  }

  function makeWing(side: number) {
    const wing = b.extrude(wingOutline(), {
      at: [0, 2.10, 0.02],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.13, 0.085],
      bevel: 0.035,
      smoothing: 1,
      color: DEEP,
      name: side > 0 ? "wingL" : "wingR",
      group: "airframe",
    });

    const topY = 2.185;

    rod(
      [side * 0.18, topY, 1.10],
      [side * 5.02, topY, 0.72],
      0.018,
      PALE,
      { name: side > 0 ? "leadingEdgeL" : "leadingEdgeR" },
    );

    rod(
      [side * 0.18, topY + 0.004, -1.10],
      [side * 4.78, topY + 0.004, -0.22],
      0.012,
      CYAN,
      { name: side > 0 ? "trailingEdgeL" : "trailingEdgeR" },
    );

    rod(
      [side * 0.35, topY + 0.006, 0.73],
      [side * 4.55, topY + 0.006, 0.18],
      0.009,
      MID,
    );

    const panelX = [0.95, 1.65, 2.45, 3.25, 4.05];
    for (let i = 0; i < panelX.length; i++) {
      const x = panelX[i];
      const front = 1.11 - x * 0.085;
      const back = -1.10 + x * 0.17;
      rod(
        [side * x, topY + 0.008, back],
        [side * x, topY + 0.008, front],
        0.006,
        MID,
        { name: `wingPanel${side > 0 ? "L" : "R"}${i}` },
      );
    }

    const flapStart = 0.40;
    const flapEnd = 2.20;
    rod(
      [side * flapStart, topY + 0.015, -0.92],
      [side * flapEnd, topY + 0.015, -0.80],
      0.019,
      PALE,
    );

    rod(
      [side * flapStart, topY + 0.017, -0.88],
      [side * flapEnd, topY + 0.017, -0.76],
      0.006,
      INK,
    );

    const aileronStart = 3.15;
    const aileronEnd = 5.12;
    rod(
      [side * aileronStart, topY + 0.015, -0.57],
      [side * aileronEnd, topY + 0.015, -0.18],
      0.017,
      PALE,
    );

    rod(
      [side * aileronStart, topY + 0.018, -0.52],
      [side * aileronEnd, topY + 0.018, -0.13],
      0.006,
      INK,
    );

    // Two small cannon fairings on each wing.
    for (const x of [2.45, 3.35]) {
      rod(
        [side * x, 2.20, 0.70],
        [side * x, 2.20, 1.16],
        0.028,
        INK,
      );
      rod(
        [side * x, 2.205, 1.08],
        [side * x, 2.205, 1.23],
        0.017,
        CYAN,
      );
    }

    // A pair of stylized shell-ejection seams.
    for (const x of [1.50, 2.10, 2.70]) {
      rod(
        [side * x, 2.175, -0.35],
        [side * x, 2.175, -0.08],
        0.005,
        BLUE,
      );
    }

    return wing;
  }

  function makeTailPlane(side: number) {
    const tail = b.extrude(tailPlaneOutline(), {
      at: [0, 2.28, -3.02],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.105, 0.065],
      bevel: 0.022,
      smoothing: 1,
      color: BLUE,
      name: side > 0 ? "tailplaneL" : "tailplaneR",
      group: "tail",
    });

    const y = 2.35;

    rod(
      [side * 0.16, y, -2.46],
      [side * 1.88, y, -2.80],
      0.014,
      PALE,
    );

    rod(
      [side * 0.18, y + 0.006, -3.56],
      [side * 1.88, y + 0.006, -3.20],
      0.010,
      CYAN,
    );

    rod(
      [side * 0.72, y + 0.01, -3.43],
      [side * 0.72, y + 0.01, -2.54],
      0.006,
      MID,
    );

    rod(
      [side * 1.33, y + 0.01, -3.31],
      [side * 1.33, y + 0.01, -2.67],
      0.006,
      MID,
    );

    // Elevator hinge.
    rod(
      [side * 0.40, y + 0.015, -3.34],
      [side * 1.80, y + 0.015, -3.06],
      0.018,
      PALE,
    );

    return tail;
  }

  // ---------------------------------------------------------------------------
  // Main fuselage: a faceted, gently curved tube with a pale lower belly.
  // ---------------------------------------------------------------------------

  const fuselagePath = catmull([
    [0, 2.35, -4.16],
    [0, 2.34, -3.72],
    [0, 2.35, -2.95],
    [0, 2.37, -1.85],
    [0, 2.39, -0.55],
    [0, 2.42, 0.75],
    [0, 2.45, 1.85],
    [0, 2.47, 2.70],
    [0, 2.45, 3.35],
    [0, 2.40, 3.92],
    [0, 2.37, 4.18],
  ]);

  const fuselage = b.sweep(
    fuselagePath,
    (t: number) => {
      if (t < 0.10) return 0.18 + t * 1.4;
      if (t < 0.35) return 0.32 + (t - 0.10) * 0.85;
      if (t < 0.70) return 0.53;
      if (t < 0.88) return 0.53 - (t - 0.70) * 0.75;
      return 0.395 - (t - 0.88) * 1.8;
    },
    {
      color: DEEP,
      sides: 10,
      smooth: false,
      caps: "round",
      sectors: [
        [118, 242, BLUE],
        [242, 300, MID],
      ],
      name: "fuselage",
      group: "airframe",
    },
  );

  // Tail cone and a raised dorsal spine.
  rod([0, 2.43, -3.72], [0, 2.50, -2.42], 0.035, CYAN);
  rod([0, 2.52, -2.35], [0, 2.64, -0.78], 0.026, CYAN);
  rod([0, 2.64, -0.73], [0, 2.70, 0.22], 0.022, PALE);

  // A thin blueprint centerline beneath the belly.
  rod([0, 1.91, -2.65], [0, 1.93, 2.78], 0.014, INK);

  // Structural hoops around the fuselage. These follow the actual tube surface.
  const shell = b.surface(fuselage);
  for (const t of [0.19, 0.34, 0.51, 0.67, 0.80]) {
    const p = fuselage.at(t);
    const loop = shell.loop(p, { dir: p.tangent, lift: 0.009 });
    b.sweep(loop, 0.011, {
      color: t > 0.65 ? PALE : CYAN,
      section: { ngon: 6 },
      caps: "none",
      name: `fuselageHoop${Math.round(t * 100)}`,
      group: "blueprint-lines",
    });
  }

  // Long side panel lines.
  for (const side of [-1, 1]) {
    rod(
      [side * 0.48, 2.46, -2.55],
      [side * 0.52, 2.53, 2.82],
      0.009,
      MID,
    );
    rod(
      [side * 0.43, 2.17, -2.20],
      [side * 0.49, 2.12, 2.36],
      0.008,
      CYAN,
    );
  }

  // ---------------------------------------------------------------------------
  // Elliptical main wings and the distinctive tail surfaces.
  // ---------------------------------------------------------------------------

  makeWing(1);
  makeWing(-1);
  makeTailPlane(1);
  makeTailPlane(-1);

  // Wing-root fairings, blocky and deliberately visible in blueprint style.
  for (const side of [-1, 1]) {
    box([0.32, 0.22, 1.72], BLUE, [side * 0.40, 2.05, 0.06], {
      scale: [1, 1, 1],
    });
    rod(
      [side * 0.56, 2.19, -0.75],
      [side * 0.56, 2.19, 0.82],
      0.018,
      PALE,
    );
  }

  // ---------------------------------------------------------------------------
  // Vertical fin and rudder.
  // ---------------------------------------------------------------------------

  const finOutline = [
    [-0.62, 0.00],
    [0.48, 0.00],
    [0.43, 0.42],
    [0.24, 1.13],
    [-0.03, 1.53],
    [-0.30, 1.62],
    [-0.49, 1.22],
    [-0.62, 0.44],
  ] as [number, number][];

  b.extrude(finOutline, {
    at: [0, 2.27, -3.50],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.11, 0.075],
    bevel: 0.026,
    smoothing: 1,
    color: BLUE,
    name: "verticalTail",
    group: "tail",
  });

  // Fin leading edge and rudder hinge, mirrored on both faces.
  for (const side of [-1, 1]) {
    rod(
      [side * 0.065, 2.30, -3.02],
      [side * 0.065, 3.48, -3.53],
      0.017,
      PALE,
    );
    rod(
      [side * 0.069, 2.48, -4.10],
      [side * 0.069, 3.38, -4.02],
      0.009,
      CYAN,
    );
    rod(
      [side * 0.072, 2.45, -3.78],
      [side * 0.072, 3.36, -3.82],
      0.007,
      MID,
    );
  }

  // Rudder trailing edge.
  rod([0, 2.34, -4.08], [0, 3.35, -4.00], 0.020, PALE);

  // ---------------------------------------------------------------------------
  // Cockpit and canopy.
  // ---------------------------------------------------------------------------

  const canopy = sphere(GLASS, [0, 2.77, 0.22], [0.47, 0.42, 0.78], 14, 10);

  // Canopy sill rails.
  for (const side of [-1, 1]) {
    rod(
      [side * 0.42, 2.53, -0.48],
      [side * 0.47, 2.56, 0.82],
      0.024,
      PALE,
    );
    rod(
      [side * 0.43, 2.60, 0.82],
      [side * 0.29, 3.08, 0.48],
      0.019,
      CYAN,
    );
    rod(
      [side * 0.29, 3.08, 0.48],
      [side * 0.31, 3.12, -0.34],
      0.015,
      PALE,
    );
    rod(
      [side * 0.31, 3.12, -0.34],
      [side * 0.39, 2.72, -0.52],
      0.015,
      CYAN,
    );
  }

  // Center canopy spine and rear bulkhead.
  rod([0, 3.14, -0.36], [0, 3.18, 0.48], 0.021, PALE);
  rod([-0.38, 2.67, -0.54], [0.38, 2.67, -0.54], 0.025, CYAN);

  // Small rear cockpit fairing.
  box([0.62, 0.13, 0.50], BLUE, [0, 2.55, -0.70]);
  rod([-0.30, 2.64, -0.91], [0.30, 2.64, -0.91], 0.012, PALE);

  // Radio mast and aerial wire.
  rod([0, 3.10, -0.92], [0, 3.54, -1.42], 0.018, CYAN);
  rod([0, 3.54, -1.42], [0, 2.75, -3.12], 0.006, PALE);

  // ---------------------------------------------------------------------------
  // Nose, spinner, propeller, intake, and exhaust stacks.
  // ---------------------------------------------------------------------------

  const spinner = part(
    new THREE.ConeGeometry(0.34, 0.72, 12),
    MID,
    [0, 2.38, 4.28],
    { dir: [0, 0, 1] },
  );

  rod([0, 2.38, 3.96], [0, 2.38, 4.63], 0.018, PALE);

  cylinder(0.105, 0.20, INK, [0, 2.38, 4.68], [0, 0, 1], 12);

  // Propeller blades in the plane facing the viewer.
  const bladeOutline = [
    [0.12, -0.055],
    [0.48, -0.13],
    [0.93, -0.12],
    [1.28, -0.045],
    [1.38, 0.045],
    [1.16, 0.13],
    [0.68, 0.14],
    [0.25, 0.075],
    [0.12, 0.055],
  ] as [number, number][];

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const xDir: [number, number, number] = [Math.cos(angle), Math.sin(angle), 0];
    const yDir: [number, number, number] = [-Math.sin(angle), Math.cos(angle), 0];

    b.extrude(bladeOutline, {
      at: [0, 2.38, 4.73],
      x: xDir,
      y: yDir,
      thickness: 0.055,
      bevel: 0.012,
      color: PALE,
      name: `propellerBlade${i + 1}`,
      group: "propeller",
    });

    const tipA: [number, number, number] = [
      Math.cos(angle) * 0.30,
      2.38 + Math.sin(angle) * 0.30,
      4.765,
    ];
    const tipB: [number, number, number] = [
      Math.cos(angle) * 1.25,
      2.38 + Math.sin(angle) * 1.25,
      4.765,
    ];
    rod(tipA, tipB, 0.009, CYAN);
  }

  cylinder(0.20, 0.10, CYAN, [0, 2.38, 4.76], [0, 0, 1], 12);
  cylinder(0.115, 0.13, INK, [0, 2.38, 4.84], [0, 0, 1], 12);

  // Underslung radiator intake.
  const intake = part(
    new THREE.CylinderGeometry(0.24, 0.29, 0.14, 12),
    INK,
    [0, 1.96, 3.22],
    { dir: [0, 0, 1] },
  );
  disc(0.19, 0.018, CYAN, [0, 1.96, 3.30], [0, 0, 1], 12);
  disc(0.125, 0.022, INK, [0, 1.96, 3.315], [0, 0, 1], 10);
  for (const x of [-0.09, 0, 0.09]) {
    rod([x, 1.86, 3.33], [x, 2.06, 3.33], 0.008, PALE);
  }

  // Six exhaust outlets on each side.
  const exhaustZ = [1.98, 2.22, 2.46, 2.70, 2.94, 3.18];
  for (const side of [-1, 1]) {
    for (let i = 0; i < exhaustZ.length; i++) {
      const z = exhaustZ[i];
      rod(
        [side * 0.48, 2.50 + (i % 2) * 0.018, z],
        [side * 0.58, 2.51 + (i % 2) * 0.018, z + 0.09],
        0.035,
        INK,
      );
      cylinder(0.040, 0.028, CYAN, [side * 0.59, 2.51 + (i % 2) * 0.018, z + 0.095], [side, 0, 0], 8);
    }
  }

  // Nose cowling panel arcs.
  for (const side of [-1, 1]) {
    rod(
      [side * 0.42, 2.68, 3.38],
      [side * 0.48, 2.66, 3.93],
      0.010,
      PALE,
    );
    rod(
      [side * 0.43, 2.06, 3.40],
      [side * 0.47, 2.08, 3.92],
      0.009,
      MID,
    );
  }

  // ---------------------------------------------------------------------------
  // RAF roundels: layered geometric discs on the upper wings and fuselage sides.
  // ---------------------------------------------------------------------------

  function wingRoundel(side: number) {
    const x = side * 3.05;
    const z = -0.04;
    disc(0.51, 0.035, PALE, [x, 2.205, z], [0, 1, 0], 28);
    disc(0.34, 0.041, INK, [x, 2.228, z], [0, 1, 0], 28);
    disc(0.145, 0.047, PALE, [x, 2.253, z], [0, 1, 0], 24);
    rod([x - side * 0.49, 2.277, z], [x + side * 0.49, 2.277, z], 0.006, CYAN);
    rod([x, 2.279, z - 0.49], [x, 2.279, z + 0.49], 0.006, CYAN);
  }

  wingRoundel(1);
  wingRoundel(-1);

  function sideRoundel(side: number) {
    const x = side * 0.535;
    const y = 2.39;
    const z = 0.18;
    disc(0.40, 0.035, PALE, [x, y, z], [side, 0, 0], 26);
    disc(0.265, 0.042, INK, [side * 0.559, y, z], [side, 0, 0], 26);
    disc(0.115, 0.050, PALE, [side * 0.585, y, z], [side, 0, 0], 22);
  }

  sideRoundel(1);
  sideRoundel(-1);

  // Small tail flash, made from three stacked vertical panels.
  for (const side of [-1, 1]) {
    const x = side * 0.075;
    const z = -3.86;
    box([0.025, 0.52, 0.10], PALE, [x, 2.62, z]);
    box([0.029, 0.52, 0.075], MID, [x, 2.62, z + 0.09]);
    box([0.033, 0.52, 0.050], INK, [x, 2.62, z + 0.165]);
  }

  // ---------------------------------------------------------------------------
  // Landing gear: broad low-poly wheels keep the aircraft resting on y = 0.
  // ---------------------------------------------------------------------------

  function wheel(side: number, x: number, z: number, radius: number, tireWidth: number) {
    const wheel = part(
      new THREE.TorusGeometry(radius, tireWidth, 8, 16),
      RUBBER,
      [side * x, radius + tireWidth + 0.012, z],
      { dir: [1, 0, 0] },
    );

    cylinder(
      radius * 0.45,
      tireWidth * 1.8,
      HUB,
      [side * x, radius + tireWidth + 0.012, z],
      [1, 0, 0],
      10,
    );

    cylinder(
      radius * 0.18,
      tireWidth * 2.1,
      INK,
      [side * x, radius + tireWidth + 0.012, z],
      [1, 0, 0],
      8,
    );

    return wheel;
  }

  wheel(1, 1.33, -0.33, 0.235, 0.070);
  wheel(-1, 1.33, -0.33, 0.235, 0.070);

  rod([0.45, 1.98, -0.29], [1.31, 0.56, -0.33], 0.060, INK);
  rod([-0.45, 1.98, -0.29], [-1.31, 0.56, -0.33], 0.060, INK);
  rod([0.50, 1.96, -0.30], [1.31, 0.57, -0.33], 0.021, CYAN);
  rod([-0.50, 1.96, -0.30], [-1.31, 0.57, -0.33], 0.021, CYAN);

  // Gear doors.
  for (const side of [-1, 1]) {
    b.extrude(
      [
        [0, -0.12],
        [0.72, -0.12],
        [0.72, 0.12],
        [0.15, 0.18],
        [0, 0.10],
      ] as [number, number][],
      {
        at: [side * 0.75, 1.03, -0.42],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.035,
        bevel: 0.008,
        color: BLUE,
        name: `gearDoor${side > 0 ? "L" : "R"}`,
        group: "undercarriage",
      },
    );
  }

  // Small tailwheel with a visible fork.
  wheel(1, 0.01, -2.65, 0.135, 0.045);
  rod([0, 1.45, -2.48], [0, 0.35, -2.65], 0.039, INK);
  rod([0, 1.42, -2.47], [0, 0.35, -2.65], 0.014, CYAN);
  box([0.22, 0.08, 0.35], BLUE, [0, 1.12, -2.48]);

  // ---------------------------------------------------------------------------
  // Small blueprint annotations made from physical linework: access hatches,
  // inspection circles, wing-root bolts, and pitot tube.
  // ---------------------------------------------------------------------------

  for (const side of [-1, 1]) {
    // Wing-root bolt heads.
    for (const z of [-0.78, -0.40, 0.02, 0.44, 0.82]) {
      cylinder(0.022, 0.018, PALE, [side * 0.64, 2.205, z], [0, 1, 0], 8);
    }

    // Side access hatch.
    const hatchY = 2.31;
    const hatchZ = -1.10;
    rod([side * 0.505, hatchY, hatchZ - 0.32], [side * 0.505, hatchY, hatchZ + 0.32], 0.008, PALE);
    rod([side * 0.505, hatchY, hatchZ + 0.32], [side * 0.505, hatchY, hatchZ + 0.32], 0.008, PALE);
    rod([side * 0.505, hatchY, hatchZ - 0.32], [side * 0.505, hatchY, hatchZ - 0.32], 0.008, PALE);
    cylinder(0.026, 0.016, PALE, [side * 0.526, hatchY, hatchZ], [side, 0, 0], 8);

    // A row of small panel fasteners beside the cockpit.
    for (let i = 0; i < 5; i++) {
      cylinder(
        0.016,
        0.013,
        CYAN,
        [side * 0.51, 2.57, -0.34 + i * 0.22],
        [side, 0, 0],
        7,
      );
    }
  }

  // Circular inspection plates under the rear fuselage.
  for (const z of [-1.55, -2.05, -2.55]) {
    disc(0.14, 0.018, BLUE, [0, 1.88, z], [0, 1, 0], 16);
    disc(0.085, 0.022, PALE, [0, 1.895, z], [0, 1, 0], 12);
    rod([-0.08, 1.91, z], [0.08, 1.91, z], 0.006, INK);
  }

  // Pitot tube projecting from the left wing.
  rod([2.25, 2.08, 0.54], [2.25, 2.08, 1.35], 0.018, INK);
  rod([2.25, 2.08, 1.32], [2.25, 2.08, 1.56], 0.011, PALE);
  cylinder(0.027, 0.045, CYAN, [2.25, 2.08, 1.58], [0, 0, 1], 8);

  // Gunsight ring on the cowling.
  rod([-0.12, 2.79, 3.25], [0.12, 2.79, 3.25], 0.012, PALE);
  rod([0.12, 2.79, 3.25], [0.12, 2.79, 3.39], 0.012, PALE);
  rod([0.12, 2.79, 3.39], [-0.12, 2.79, 3.39], 0.012, PALE);
  rod([-0.12, 2.79, 3.39], [-0.12, 2.79, 3.25], 0.012, PALE);
  rod([0, 2.66, 3.25], [0, 2.82, 3.25], 0.009, CYAN);

  // A few prominent rivet chains along the fuselage sides.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 11; i++) {
      const z = -2.25 + i * 0.48;
      cylinder(0.012, 0.012, PALE, [side * 0.535, 2.52, z], [side, 0, 0], 6);
    }
  }

  // Nose access panel rectangle.
  for (const side of [-1, 1]) {
    rod([side * 0.49, 2.63, 2.72], [side * 0.49, 2.63, 3.21], 0.008, PALE);
    rod([side * 0.49, 2.63, 3.21], [side * 0.49, 2.63, 3.55], 0.008, PALE);
    rod([side * 0.49, 2.63, 3.55], [side * 0.49, 2.63, 2.72], 0.008, PALE);
  }

  // A blueprint-style transverse ruler line across the tail.
  rod([-1.90, 2.37, -2.83], [1.90, 2.37, -2.83], 0.007, CYAN);

  // Return the builder's complete object.
  return b.root;
}

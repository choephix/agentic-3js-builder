import * as THREE from "three";
import { createBuilder, type Builder, type Joint, catmull, rng, line } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Blade Revolver",
  "description": "A Final Fantasy style gunblade planted tip-down in the ground: a great glowing-edged sword blade rising out of a revolver gun-housing with a curved leather grip and a lion-headed guard."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  ironDark: "#2c303c",
  gunmetal: "#3b4250",
  steel: "#8b93a7",
  steelBright: "#c9cedd",
  ink: "#14161c",
  goldTrim: "#e7b814",
  goldBright: "#f2c94c",
  bronze: "#8a6a2f",
  cyanGlow: "#2ff3ff",
  cyanDeep: "#0e7f8f",
  redLeather: "#7a1f2b",
  redLeatherDark: "#4d121b",
  cream: "#e8dfc9",
  lionGold: "#d4a017",
  brownGrip: "#5c3a24",
};
const M = {
  bladeRoot: [0, 1.95, -0.02] as [number, number, number],
  guardPlane: [0, 1.92, 0] as [number, number, number],
  cylinderCentre: [0, 2.1, 0] as [number, number, number],
  gripRoot: [0, 2.1, -0.16] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // blade
  (() => {
function buildBlade({ b, J, P }: Ctx) {
  const core = J.core;
  const INK = P.ink;
  const BODY = P.gunmetal;
  const DARK = P.ironDark;
  const STEEL = P.steel;
  const BRIGHT = P.steelBright;
  const GOLD = P.goldTrim;
  const GOLD_BRIGHT = P.goldBright;
  const CYAN = P.cyanGlow;
  const CYAN_DEEP = P.cyanDeep;
  const BRONZE = P.bronze;

  const tipZ = 0.12;
  const topZ = -0.02;
  const front = (y: number) => tipZ + (topZ - tipZ) * (y / 1.95);

  const width = (y: number) => {
    if (y < 0.12) return 0.07 + (0.11 - 0.07) * (y / 0.12);
    if (y < 0.45) return 0.11 + (0.18 - 0.11) * ((y - 0.12) / 0.33);
    if (y < 1.5) return 0.18 - 0.02 * ((y - 0.45) / 1.05);
    return 0.16 + 0.01 * ((y - 1.5) / 0.45);
  };

  type XY = [number, number];

  function prism(
    points: XY[],
    z: (y: number) => number,
    depth: number,
    name: string,
  ) {
    const n = points.length;
    const positions: number[] = [];
    const indices: number[] = [];

    for (const [x, y] of points) positions.push(x, y, z(y) + depth * 0.5);
    for (const [x, y] of points) positions.push(x, y, z(y) - depth * 0.5);

    let cx = 0;
    let cy = 0;
    for (const [x, y] of points) {
      cx += x;
      cy += y;
    }
    cx /= n;
    cy /= n;
    const frontCenter = positions.length / 3;
    positions.push(cx, cy, z(cy) + depth * 0.5);
    const backCenter = positions.length / 3;
    positions.push(cx, cy, z(cy) - depth * 0.5);

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      indices.push(frontCenter, i, j);
      indices.push(backCenter, n + j, n + i);
      indices.push(i, n + i, n + j);
      indices.push(i, n + j, j);
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(positions), 3),
    );
    g.setIndex(indices);
    g.computeVertexNormals();
    g.name = name;
    return g;
  }

  function add(
    geometry: THREE.BufferGeometry,
    color: string,
    name: string,
  ) {
    return b.part(geometry, color, {
      bone: core,
      at: [0, 0, 0],
      name,
      group: "blade",
    });
  }

  function frontPart(points: XY[], color: string, name: string, lift = 0.004) {
    return add(
      prism(points, (y) => front(y) + lift, 0.008, name),
      color,
      name,
    );
  }

  function rectangle(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
  ): XY[] {
    return [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ];
  }

  // Main planted blade. The point is exactly on the floor; the shallow bottom
  // bevel is buried only within the permitted floor tolerance.
  const silhouette: XY[] = [
    [0, 0],
    [0.072, 0.12],
    [0.18, 0.45],
    [0.165, 1.48],
    [0.17, 1.95],
    [-0.17, 1.95],
    [-0.165, 1.48],
    [-0.18, 0.45],
    [-0.072, 0.12],
  ];
  add(prism(silhouette, front, 0.07, "bladeCore"), BODY, "bladeCore");

  // Darker inset field gives the broad flat FF-style blade face a framed,
  // forged appearance.
  frontPart(
    [
      [-0.135, 0.27],
      [-0.145, 0.52],
      [-0.132, 1.83],
      [0.135, 1.83],
      [0.13, 0.52],
      [0.055, 0.2],
      [-0.055, 0.2],
    ],
    DARK,
    "bladeInset",
    0.006,
  );

  // A raised steel mid-band runs as a broad central fuller.
  frontPart(
    [
      [-0.052, 0.24],
      [-0.043, 0.5],
      [-0.036, 1.82],
      [0.038, 1.82],
      [0.044, 0.5],
      [0.052, 0.24],
    ],
    STEEL,
    "steelMidBand",
    0.012,
  );

  // Narrow pale highlight within the forged center band.
  frontPart(
    rectangle(-0.012, 0.014, 0.33, 1.83),
    BRIGHT,
    "midBandHighlight",
    0.017,
  );

  // Cutting edge on the +X side: deep cyan bed beneath a bright steel bevel.
  const edgeOuter: XY[] = [];
  const edgeInner: XY[] = [];
  const edgeSteps = 12;
  for (let i = 0; i <= edgeSteps; i++) {
    const y = 0.075 + (1.91 - 0.075) * (i / edgeSteps);
    const w = width(y);
    edgeOuter.push([w - 0.003, y]);
    edgeInner.push([w - 0.032, y]);
  }
  frontPart(
    [...edgeOuter, ...edgeInner.reverse()],
    CYAN_DEEP,
    "glowingEdgeBed",
    0.011,
  );

  const steelEdge: XY[] = [];
  const steelEdgeInner: XY[] = [];
  for (let i = 0; i <= edgeSteps; i++) {
    const y = 0.085 + (1.9 - 0.085) * (i / edgeSteps);
    const w = width(y);
    steelEdge.push([w + 0.001, y]);
    steelEdgeInner.push([w - 0.014, y]);
  }
  const edgePart = frontPart(
    [...steelEdge, ...steelEdgeInner.reverse()],
    BRIGHT,
    "cuttingEdge",
    0.022,
  );
  glow(edgePart, 1.7);

  // A second, hairline cyan tracer makes the energy edge readable at a distance.
  const tracer: XY[] = [];
  const tracerInner: XY[] = [];
  for (let i = 0; i <= edgeSteps; i++) {
    const y = 0.13 + (1.88 - 0.13) * (i / edgeSteps);
    const w = width(y);
    tracer.push([w - 0.020, y]);
    tracerInner.push([w - 0.027, y]);
  }
  const tracerPart = frontPart(
    [...tracer, ...tracerInner.reverse()],
    CYAN,
    "cyanEdgeTracer",
    0.031,
  );
  glow(tracerPart, 2.4);

  // Heavy blunt spine on the negative-X side, with a warm metal bevel.
  const spineOuter: XY[] = [];
  const spineInner: XY[] = [];
  for (let i = 0; i <= edgeSteps; i++) {
    const y = 0.11 + (1.92 - 0.11) * (i / edgeSteps);
    const w = width(y);
    spineOuter.push([-w - 0.002, y]);
    spineInner.push([-w + 0.026, y]);
  }
  frontPart(
    [...spineOuter, ...spineInner.reverse()],
    BRONZE,
    "spineBevel",
    0.012,
  );
  frontPart(
    spineInner.concat(spineOuter.reverse()),
    STEEL,
    "spineHighlight",
    0.018,
  );

  // A worn, pale triangular tip plate.
  frontPart(
    [
      [0, 0.018],
      [0.064, 0.125],
      [0.038, 0.235],
      [-0.038, 0.235],
      [-0.064, 0.125],
    ],
    BRIGHT,
    "wornTip",
    0.026,
  );

  // Six engraved rune marks, each assembled as a small angular glyph.
  const runeYs = [0.52, 0.76, 1.0, 1.24, 1.48, 1.72];
  const runeForms: XY[][] = [
    [
      [-0.023, -0.07],
      [0.004, -0.07],
      [0.004, -0.012],
      [0.026, 0],
      [0.004, 0.012],
      [0.004, 0.07],
      [-0.023, 0.07],
      [-0.023, 0.012],
      [-0.002, 0],
      [-0.023, -0.012],
    ],
    [
      [-0.026, -0.065],
      [0.026, -0.065],
      [0.026, -0.045],
      [-0.004, -0.045],
      [0.026, 0.025],
      [0.026, 0.065],
      [-0.026, 0.065],
      [-0.026, 0.045],
      [0.004, 0.045],
      [-0.026, -0.025],
    ],
    [
      [-0.024, -0.065],
      [0.024, -0.065],
      [0.024, -0.044],
      [-0.004, -0.044],
      [-0.004, 0.044],
      [0.024, 0.044],
      [0.024, 0.065],
      [-0.024, 0.065],
    ],
    [
      [-0.026, -0.065],
      [0.004, -0.065],
      [0.026, -0.02],
      [0.026, 0.065],
      [0.004, 0.065],
      [0.004, 0.005],
      [-0.026, -0.035],
    ],
    [
      [-0.025, -0.065],
      [0.026, -0.065],
      [0.026, -0.042],
      [-0.002, -0.042],
      [0.026, 0.044],
      [0.026, 0.065],
      [-0.025, 0.065],
    ],
    [
      [-0.026, -0.065],
      [0.026, -0.065],
      [0.026, -0.043],
      [-0.003, -0.043],
      [0.026, 0.043],
      [0.026, 0.065],
      [-0.026, 0.065],
      [-0.026, 0.043],
      [0.003, 0.043],
    ],
  ];

  for (let i = 0; i < runeYs.length; i++) {
    const y = runeYs[i];
    const form = runeForms[i];
    const shifted = form.map(([x, dy]) => [x, y + dy] as XY);
    frontPart(shifted, INK, `engravedRune${i + 1}`, 0.024);
  }

  // Gold diamond heraldic mark near the blade heel.
  frontPart(
    [
      [0, 0.275],
      [0.052, 0.33],
      [0, 0.385],
      [-0.052, 0.33],
    ],
    GOLD_BRIGHT,
    "heelDiamond",
    0.029,
  );
  frontPart(
    [
      [0, 0.3],
      [0.022, 0.33],
      [0, 0.36],
      [-0.022, 0.33],
    ],
    GOLD,
    "heelDiamondInset",
    0.036,
  );

  // Spine bolts: dark collars and bright gold heads are separate readable parts.
  const boltYs = [0.48, 0.76, 1.04, 1.32, 1.6, 1.84];
  for (let i = 0; i < boltYs.length; i++) {
    const y = boltYs[i];
    const x = -width(y) + 0.028;
    const z = front(y) + 0.031;
    add(
      new THREE.CylinderGeometry(0.018, 0.018, 0.009, 8),
      BRONZE,
      `spineBoltCollar${i + 1}`,
    ).mesh.position.set(x, y, z);
    const bolt = b.part(
      new THREE.CylinderGeometry(0.010, 0.010, 0.012, 8),
      GOLD_BRIGHT,
      {
        bone: core,
        at: [x, y, z + 0.006],
        dir: [0, 0, 1],
        name: `spineBolt${i + 1}`,
        group: "blade",
      },
    );
    void bolt;
  }

  // Small gold studs along the fuller shoulders.
  for (const y of [0.61, 0.92, 1.23, 1.54, 1.78]) {
    for (const s of [-1, 1]) {
      const x = s * 0.073;
      const stud = b.part(
        new THREE.SphereGeometry(0.009, 6, 4),
        GOLD,
        {
          bone: core,
          at: [x, y, front(y) + 0.027],
          name: `fullerStud${s > 0 ? "L" : "R"}${y.toFixed(2)}`,
          group: "blade",
        },
      );
      void stud;
    }
  }

  // Simpler mirrored treatment on the back face: a recessed cyan line and a
  // narrow pale edge, kept slightly behind the main blade volume.
  const backSurface = (y: number) => front(y) - 0.041;
  const backCyan: XY[] = [];
  const backSteel: XY[] = [];
  for (let i = 0; i <= 10; i++) {
    const y = 0.16 + (1.88 - 0.16) * (i / 10);
    const w = width(y);
    backCyan.push([w - 0.027, y]);
    backSteel.push([w - 0.015, y]);
  }
  const backEdge = add(
    prism(
      [...backCyan, ...backSteel.reverse()],
      (y) => backSurface(y),
      0.007,
      "backCyanEdge",
    ),
    CYAN_DEEP,
    "backCyanEdge",
  );
  glow(backEdge, 1.2);

  const backSpine: XY[] = [];
  for (let i = 0; i <= 10; i++) {
    const y = 0.18 + (1.86 - 0.18) * (i / 10);
    backSpine.push([-width(y) + 0.012, y]);
  }
  add(
    prism(
      [...backSpine, ...backSpine.slice().reverse().map(([x, y]) => [x + 0.014, y] as XY)],
      (y) => backSurface(y) - 0.004,
      0.006,
      "backSpineTrim",
    ),
    BRONZE,
    "backSpineTrim",
  );
}
    return buildBlade;
  })(),
  // hiltGun
  (() => {
function buildHiltGun({ b, J, P, M }: Ctx) {
  const core = J.core;
  const spin = J.cylinderSpin;

  const IRON = P.ironDark;
  const GUN = P.gunmetal;
  const STEEL = P.steel;
  const BRIGHT = P.steelBright;
  const INK = P.ink;
  const GOLD = P.goldTrim;
  const GOLDHI = P.goldBright;
  const BRONZE = P.bronze;
  const CYAN = P.cyanGlow;
  const CYANDEEP = P.cyanDeep;

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const box = (
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    name: string,
    bone = core,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      bone,
      at: p,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    p: [number, number, number],
    color: string,
    name: string,
    bone = core,
    radial = 10,
    axis: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial, 1, false), color, {
      bone,
      at: p,
      dir: axis,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    p: [number, number, number],
    color: string,
    name: string,
    bone = core,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      bone,
      at: p,
      name,
      flat: true,
    });

  const frontPlate = (
    size: [number, number, number],
    p: [number, number, number],
    color: string,
    name: string,
    bone = core,
  ) => box(size, p, color, name, bone);

  // Main iron receiver: a deliberately chunky, angular block around the blade root.
  box([0.50, 0.33, 0.39], at(0, 2.105, 0.015), IRON, "hiltGun.receiver");

  // Sloped shoulder plates make the housing feel forged rather than like a plain cube.
  b.frustumBox(
    at(-0.235, 1.945, 0.0),
    at(-0.235, 2.235, 0.0),
    [0.055, 0.30],
    [0.045, 0.24],
    { bone: core, color: GUN, name: "hiltGun.shoulderL" },
  );
  b.frustumBox(
    at(0.235, 1.945, 0.0),
    at(0.235, 2.235, 0.0),
    [0.055, 0.30],
    [0.045, 0.24],
    { bone: core, color: GUN, name: "hiltGun.shoulderR" },
  );

  // Front armour plate and inset central panel.
  frontPlate([0.42, 0.255, 0.018], at(0, 2.095, 0.215), GUN, "hiltGun.frontPlate");
  frontPlate([0.245, 0.17, 0.012], at(0, 2.10, 0.228), IRON, "hiltGun.frontInset");

  // Ink-dark panel seams, kept as individual raised geometry.
  box([0.008, 0.22, 0.006], at(-0.205, 2.10, 0.231), INK, "hiltGun.seamFrontL");
  box([0.008, 0.22, 0.006], at(0.205, 2.10, 0.231), INK, "hiltGun.seamFrontR");
  box([0.39, 0.008, 0.006], at(0, 1.985, 0.232), INK, "hiltGun.seamFrontBottom");
  box([0.39, 0.008, 0.006], at(0, 2.215, 0.232), INK, "hiltGun.seamFrontTop");

  // Side panel strips and rear armour edge.
  box([0.012, 0.25, 0.29], at(-0.258, 2.10, 0.0), GUN, "hiltGun.sidePlateL");
  box([0.012, 0.25, 0.29], at(0.258, 2.10, 0.0), GUN, "hiltGun.sidePlateR");
  box([0.42, 0.24, 0.014], at(0, 2.105, -0.205), IRON, "hiltGun.rearPlate");

  // Gold and bronze corner rivets on the receiver.
  const rivetPoints: [number, number, number][] = [
    [-0.205, 1.985, 0.242],
    [0.205, 1.985, 0.242],
    [-0.205, 2.215, 0.242],
    [0.205, 2.215, 0.242],
    [-0.265, 2.0, 0.12],
    [0.265, 2.0, 0.12],
    [-0.265, 2.205, 0.12],
    [0.265, 2.205, 0.12],
  ];
  rivetPoints.forEach((p, i) => sphere(0.012, p, i % 3 === 0 ? GOLDHI : GOLD, `hiltGun.rivet${i}`));

  // Small bronze bolts in a vertical side row.
  for (let i = 0; i < 4; i++) {
    sphere(0.009, at(-0.272, 2.015 + i * 0.06, 0.09), BRONZE, `hiltGun.sideBoltL${i}`);
    sphere(0.009, at(0.272, 2.015 + i * 0.06, 0.09), BRONZE, `hiltGun.sideBoltR${i}`);
  }

  // Revolver drum, axis vertical, riding the dedicated cylinder-spin joint.
  cyl(0.16, 0.235, at(0, 2.10, 0.0), BRONZE, "hiltGun.revolverDrum", spin, 12);
  cyl(0.145, 0.245, at(0, 2.10, 0.0), GOLD, "hiltGun.drumFace", spin, 12);

  // Drum face boss and dark annular rim.
  cyl(0.070, 0.255, at(0, 2.10, 0.0), BRONZE, "hiltGun.drumBoss", spin, 10);
  const drumRim = b.part(new THREE.TorusGeometry(0.145, 0.008, 6, 18), GOLDHI, {
    bone: spin,
    at: at(0, 2.10, 0.132),
    dir: [0, 0, 1],
    axis: "z",
    name: "hiltGun.drumRim",
    flat: true,
  });

  // Six forward-facing chamber bores and luminous cyan interiors.
  const chamberRadius = 0.105;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.sin(a) * chamberRadius;
    const y = 2.10 + Math.cos(a) * chamberRadius;

    const recess = b.part(new THREE.TorusGeometry(0.027, 0.007, 6, 10), INK, {
      bone: spin,
      at: at(x, y, 0.145),
      dir: [0, 0, 1],
      axis: "z",
      name: `hiltGun.chamberRing${i}`,
      flat: true,
    });

    const bore = cyl(
      0.021,
      0.009,
      at(x, y, 0.149),
      CYANDEEP,
      `hiltGun.chamber${i}`,
      spin,
      10,
      [0, 0, 1],
    );
    glow(bore, 2.2);

    const glint = b.part(new THREE.CircleGeometry(0.012, 8), CYAN, {
      bone: spin,
      at: at(x - 0.004, y + 0.004, 0.155),
      dir: [0, 0, 1],
      axis: "z",
      name: `hiltGun.chamberGlow${i}`,
      flat: true,
    });
    glow(glint, 2.8);
  }

  // Central blade clearance slit in the drum face.
  frontPlate([0.052, 0.25, 0.012], at(0, 2.10, 0.158), INK, "hiltGun.bladeSlot", spin);
  frontPlate([0.026, 0.25, 0.006], at(0, 2.10, 0.165), CYANDEEP, "hiltGun.slotGlow", spin);

  // Barrel stub above and slightly behind the drum.
  cyl(0.075, 0.145, at(0, 2.285, -0.005), IRON, "hiltGun.barrelStub", core, 10);
  cyl(0.088, 0.022, at(0, 2.355, -0.005), GOLD, "hiltGun.muzzleBand", core, 10);
  cyl(0.066, 0.026, at(0, 2.37, -0.005), INK, "hiltGun.muzzle", core, 10);

  // Gold front sight, kept within the upper silhouette.
  box([0.018, 0.075, 0.018], at(0, 2.315, 0.105), GOLDHI, "hiltGun.frontSightPost");
  box([0.045, 0.014, 0.028], at(0, 2.35, 0.105), GOLDHI, "hiltGun.frontSightBlade");

  // Hammer and rear spur: a sharp fin visible above the housing.
  b.extrude(
    [
      [-0.055, 0],
      [0.055, 0],
      [0.044, 0.075],
      [0.015, 0.13],
      [-0.012, 0.115],
      [-0.045, 0.055],
    ],
    {
      bone: core,
      at: at(0, 2.255, -0.16),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.004,
      color: IRON,
      name: "hiltGun.hammer",
      smoothing: 0,
    },
  );
  box([0.075, 0.018, 0.06], at(0, 2.255, -0.175), GOLD, "hiltGun.hammerCap");
  sphere(0.018, at(-0.045, 2.27, -0.19), GOLDHI, "hiltGun.hammerStudL");
  sphere(0.018, at(0.045, 2.27, -0.19), GOLDHI, "hiltGun.hammerStudR");

  // Gold collar where the grip and guard meet the back of the receiver.
  box([0.23, 0.034, 0.05], at(0, 1.955, -0.17), GOLD, "hiltGun.gripCollar");
  box([0.17, 0.018, 0.058], at(0, 1.94, -0.18), GOLDHI, "hiltGun.gripCollarHighlight");

  // Small rear inspection plate and its four bright fasteners.
  box([0.20, 0.13, 0.012], at(0, 2.10, -0.218), GUN, "hiltGun.rearInspection");
  box([0.12, 0.006, 0.008], at(0, 2.10, -0.226), INK, "hiltGun.rearSeam");
  for (let i = 0; i < 4; i++) {
    const sx = i % 2 === 0 ? -0.08 : 0.08;
    const sy = i < 2 ? 2.055 : 2.145;
    sphere(0.009, at(sx, sy, -0.232), GOLD, `hiltGun.rearRivet${i}`);
  }

  // A few narrow gold trim bars make the housing read as Final Fantasy metalwork.
  box([0.012, 0.18, 0.010], at(-0.145, 2.10, 0.244), GOLD, "hiltGun.trimL");
  box([0.012, 0.18, 0.010], at(0.145, 2.10, 0.244), GOLD, "hiltGun.trimR");
  box([0.20, 0.012, 0.010], at(0, 2.185, 0.244), GOLDHI, "hiltGun.trimTop");

  // Bronze axle pin visible below the drum.
  cyl(0.033, 0.29, at(0, 1.94, 0), BRONZE, "hiltGun.lowerAxle", spin, 8);

  // A compact side socket on the right flank, leaving the trigger assembly room below.
  cyl(0.038, 0.018, at(-0.278, 2.13, 0.075), GOLD, "hiltGun.sideSocket", core, 8, [-1, 0, 0]);
  sphere(0.015, at(-0.292, 2.13, 0.075), GOLDHI, "hiltGun.sideSocketCap");
}
    return buildHiltGun;
  })(),
  // guardEmblems
  (() => {
function buildGuardEmblems({ b, J, P, M }: Ctx) {
  const bone = J.core;
  const GOLD = P.goldTrim;
  const BRIGHT = P.goldBright;
  const BRONZE = P.bronze;
  const INK = P.ink;
  const CREAM = P.cream;
  const LION = P.lionGold;
  const IRON = P.ironDark;

  const at = (x: number, y: number, z: number): [number, number, number] => [x, y, z];

  const sphere = (
    p: [number, number, number],
    r: number,
    color: string,
    scale: [number, number, number] = [1, 1, 1],
    seg = 8,
  ) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(5, Math.floor(seg * 0.7))), color, {
      bone,
      at: p,
      scale,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { bone, color, section: { ngon: 6 }, caps: "round" });

  const frontCylinder = (
    p: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    segments = 16,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      bone,
      at: p,
      dir: [0, 0, 1],
      flat: true,
    });

  const goldStud = (x: number, y: number, z = 0.125, r = 0.014) =>
    sphere(at(x, y, z), r, BRIGHT, [1, 1, 0.7], 7);

  // Broad dark bronze foundation beneath the guard.
  const underOutline: [number, number][] = [
    [-0.44, 0.005],
    [-0.39, 0.035],
    [-0.32, 0.095],
    [-0.21, 0.12],
    [-0.095, 0.09],
    [0, 0.075],
    [0.095, 0.09],
    [0.21, 0.12],
    [0.32, 0.095],
    [0.39, 0.035],
    [0.44, 0.005],
    [0.39, -0.035],
    [0.28, -0.02],
    [0.17, 0.015],
    [0, 0.03],
    [-0.17, 0.015],
    [-0.28, -0.02],
    [-0.39, -0.035],
  ];
  b.extrude(underOutline, {
    at: at(0, 1.895, 0.005),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.055,
    bevel: 0.008,
    color: BRONZE,
    bone,
    name: "guardEmblemsUnderplate",
    group: "guardEmblems",
  });

  // Main gold plate, deliberately more angular than the under-plate.
  const mainOutline: [number, number][] = [
    [-0.415, 0.02],
    [-0.355, 0.05],
    [-0.285, 0.125],
    [-0.18, 0.14],
    [-0.075, 0.105],
    [0, 0.095],
    [0.075, 0.105],
    [0.18, 0.14],
    [0.285, 0.125],
    [0.355, 0.05],
    [0.415, 0.02],
    [0.365, -0.005],
    [0.265, 0.018],
    [0.16, 0.055],
    [0.07, 0.045],
    [0, 0.035],
    [-0.07, 0.045],
    [-0.16, 0.055],
    [-0.265, 0.018],
    [-0.365, -0.005],
  ];
  b.extrude(mainOutline, {
    at: at(0, 1.91, 0.052),
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.048,
    bevel: 0.006,
    color: GOLD,
    bone,
    name: "guardEmblemsGoldPlate",
    group: "guardEmblems",
  });

  // Raised central collar around the blade.
  b.extrude(
    [
      [-0.105, 0],
      [-0.125, 0.035],
      [-0.105, 0.1],
      [-0.055, 0.13],
      [0, 0.135],
      [0.055, 0.13],
      [0.105, 0.1],
      [0.125, 0.035],
      [0.105, 0],
      [0.055, 0.02],
      [0, 0.025],
      [-0.055, 0.02],
    ],
    {
      at: at(0, 1.895, 0.092),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.004,
      color: BRIGHT,
      bone,
      name: "guardEmblemsBladeCollar",
      group: "guardEmblems",
    },
  );

  // Dark separation seams make the layered plate construction legible.
  rod(at(-0.355, 1.91, 0.083), at(-0.27, 1.965, 0.083), 0.006, INK);
  rod(at(0.355, 1.91, 0.083), at(0.27, 1.965, 0.083), 0.006, INK);
  rod(at(-0.25, 1.927, 0.084), at(-0.12, 1.958, 0.084), 0.004, BRIGHT);
  rod(at(0.25, 1.927, 0.084), at(0.12, 1.958, 0.084), 0.004, BRIGHT);

  // Beaded gold rim, including the winged tips.
  const rim: Array<[number, number]> = [
    [-0.405, 1.918],
    [-0.36, 1.948],
    [-0.315, 1.995],
    [-0.265, 2.025],
    [-0.19, 2.035],
    [-0.11, 2.01],
    [-0.045, 1.998],
    [0.045, 1.998],
    [0.11, 2.01],
    [0.19, 2.035],
    [0.265, 2.025],
    [0.315, 1.995],
    [0.36, 1.948],
    [0.405, 1.918],
    [-0.36, 1.903],
    [-0.28, 1.916],
    [-0.19, 1.94],
    [-0.1, 1.94],
    [0, 1.93],
    [0.1, 1.94],
    [0.19, 1.94],
    [0.28, 1.916],
    [0.36, 1.903],
  ];
  for (const [x, y] of rim) goldStud(x, y, 0.113, 0.012);

  // Larger terminal studs emphasize the two wing tips.
  for (const s of [-1, 1]) {
    goldStud(s * 0.412, 1.918, 0.118, 0.019);
    goldStud(s * 0.32, 1.995, 0.12, 0.015);
  }

  // Lion medallion: dark outline disk, bright outer disk, and inset face.
  frontCylinder(at(0, 1.982, 0.132), 0.125, 0.026, INK, 16);
  frontCylinder(at(0, 1.982, 0.148), 0.115, 0.026, BRIGHT, 16);
  frontCylinder(at(0, 1.982, 0.166), 0.092, 0.012, LION, 14);

  // Mane rays, built as individual low-poly spikes around the medallion.
  const maneCount = 12;
  for (let i = 0; i < maneCount; i++) {
    const a = (i / maneCount) * Math.PI * 2;
    const x = Math.cos(a) * 0.086;
    const y = 1.982 + Math.sin(a) * 0.086;
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    b.spike(at(x, y, 0.168), [dx, dy, 0.12], 0.055, 0.018, {
      bone,
      color: BRIGHT,
      caps: "point",
      section: { ngon: 5 },
      name: `guardEmblemsMane${i}`,
      group: "guardEmblems",
    });
  }

  // Lion brow and muzzle silhouette.
  rod(at(-0.053, 2.015, 0.188), at(-0.018, 2.03, 0.188), 0.009, INK);
  rod(at(0.053, 2.015, 0.188), at(0.018, 2.03, 0.188), 0.009, INK);

  sphere(at(-0.032, 1.997, 0.189), 0.014, INK, [1, 0.8, 0.5], 7);
  sphere(at(0.032, 1.997, 0.189), 0.014, INK, [1, 0.8, 0.5], 7);
  sphere(at(-0.027, 2.001, 0.198), 0.0045, CREAM, [1, 1, 0.5], 6);
  sphere(at(0.027, 2.001, 0.198), 0.0045, CREAM, [1, 1, 0.5], 6);

  sphere(at(-0.026, 1.965, 0.192), 0.025, CREAM, [1.25, 0.7, 0.45], 8);
  sphere(at(0.026, 1.965, 0.192), 0.025, CREAM, [1.25, 0.7, 0.45], 8);
  sphere(at(0, 1.96, 0.207), 0.014, INK, [1.25, 0.75, 0.5], 7);
  rod(at(-0.018, 1.948, 0.205), at(0, 1.942, 0.205), 0.004, INK);
  rod(at(0.018, 1.948, 0.205), at(0, 1.942, 0.205), 0.004, INK);

  // Small gold filigree wings curling from the medallion toward the housing.
  for (const s of [-1, 1]) {
    rod(at(s * 0.08, 1.995, 0.121), at(s * 0.16, 2.025, 0.105), 0.009, BRIGHT);
    rod(at(s * 0.145, 2.025, 0.105), at(s * 0.245, 2.045, 0.08), 0.007, GOLD);
    rod(at(s * 0.19, 1.968, 0.112), at(s * 0.285, 1.95, 0.078), 0.006, BRIGHT);
    goldStud(s * 0.255, 2.043, 0.087, 0.011);
  }

  // A second pair of shallow rear filigree rails makes the guard wrap around the housing.
  for (const s of [-1, 1]) {
    rod(at(s * 0.24, 1.93, -0.035), at(s * 0.34, 1.975, -0.07), 0.012, BRONZE);
    rod(at(s * 0.34, 1.975, -0.07), at(s * 0.27, 2.025, -0.085), 0.008, GOLD);
    sphere(at(s * 0.27, 2.025, -0.085), 0.014, BRIGHT, [1, 1, 0.7], 7);
  }

  // Gold chain descending from the model's left guard tip toward the blade spine.
  const chainPath = catmull([
    at(0.39, 1.92, 0.105),
    at(0.405, 1.79, 0.11),
    at(0.37, 1.62, 0.115),
    at(0.335, 1.43, 0.12),
    at(0.31, 1.22, 0.12),
  ]);
  b.sweep(chainPath, 0.006, {
    bone,
    color: GOLD,
    sides: 6,
    caps: "round",
    name: "guardEmblemsChainCord",
    group: "guardEmblems",
  });

  const chainRng = rng(417);
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const p = chainPath.at(t);
    const ring = new THREE.TorusGeometry(0.019, 0.0045, 6, 10);
    b.part(ring, i % 2 ? BRIGHT : GOLD, {
      bone,
      at: [p.x, p.y, p.z + 0.005],
      dir: [0, 0, 1],
      rotation: [0, 0, (i % 2 ? 1 : -1) * (28 + chainRng() * 14)],
      flat: true,
      name: `guardEmblemsChainLink${i}`,
      group: "guardEmblems",
    });
  }

  // Tiny clasp at the chain's origin and a teardrop terminal.
  sphere(at(0.39, 1.92, 0.112), 0.022, BRIGHT, [1, 1, 0.7], 7);
  b.spike(at(0.31, 1.205, 0.12), [0, -1, 0], 0.045, 0.014, {
    bone,
    color: BRIGHT,
    caps: "point",
    section: { ngon: 5 },
    name: "guardEmblemsChainDrop",
    group: "guardEmblems",
  });

  // Four dark rivets at the guard's structural corners.
  for (const s of [-1, 1]) {
    sphere(at(s * 0.29, 1.935, 0.116), 0.009, INK, [1, 1, 0.55], 7);
    sphere(at(s * 0.19, 2.025, 0.117), 0.008, INK, [1, 1, 0.55], 7);
  }

  // A small vertical gold seam on the blade collar, visually tying guard and blade together.
  rod(at(-0.118, 1.91, 0.112), at(-0.118, 1.985, 0.112), 0.006, GOLD);
  rod(at(0.118, 1.91, 0.112), at(0.118, 1.985, 0.112), 0.006, GOLD);

  // Decorative side fins tucked behind the outer tips.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0],
        [0.085, 0.012],
        [0.125, 0.055],
        [0.1, 0.085],
        [0.035, 0.055],
      ],
      {
        at: at(s * 0.29, 1.92, -0.095),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: GOLD,
        bone,
        name: `guardEmblemsSideFin${s > 0 ? "L" : "R"}`,
        group: "guardEmblems",
      },
    );
  }
}
    return buildGuardEmblems;
  })(),
  // gripTrigger
  (() => {
function buildGripTrigger({ b, J, P, M }: Ctx) {
  const core = J.core;
  const hinge = J.triggerHinge;

  const brown = P.brownGrip;
  const leather = P.redLeather;
  const leatherDark = P.redLeatherDark;
  const gold = P.goldTrim;
  const brightGold = P.goldBright;
  const lionGold = P.lionGold;
  const ink = P.ink;
  const bronze = P.bronze;
  const cream = P.cream;

  const V = (p: number[] | THREE.Vector3) =>
    p instanceof THREE.Vector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]);

  const gripPoints = [
    V(M.gripRoot),
    new THREE.Vector3(0.0, 1.99, -0.235),
    new THREE.Vector3(0.015, 1.86, -0.325),
    new THREE.Vector3(0.035, 1.72, -0.405),
    new THREE.Vector3(0.055, 1.63, -0.475),
  ];

  const gripPath = catmull(gripPoints);
  const grip = b.chain("gripTriggerGrip", gripPath, {
    parent: core,
    names: [
      "gripTriggerRoot",
      "gripTriggerUpper",
      "gripTriggerMid",
      "gripTriggerLower",
      "gripTriggerPommel",
    ],
    role: "arm",
    count: 5,
  });

  const gripTube = b.sweep(grip, (t) => 0.105 - 0.018 * t, {
    bone: grip,
    color: brown,
    sides: 8,
    caps: "round",
    name: "gripTriggerLeatherCore",
    group: "gripTrigger",
  });

  const gripBandTs = [0.08, 0.22, 0.36, 0.50, 0.64, 0.78, 0.91];
  const bandColors = [leather, leatherDark, leather, leatherDark, leather, leatherDark, leather];

  for (let i = 0; i < gripBandTs.length; i++) {
    const t = gripBandTs[i];
    const at = grip.at(t);
    const tangent = grip.path.tangentAt(t).normalize();

    b.part(
      new THREE.CylinderGeometry(0.113, 0.113, 0.043, 8),
      bandColors[i],
      {
        bone: at.bone ?? core,
        at: at.at,
        dir: tangent,
        axis: "y",
        flat: true,
        name: `gripTriggerBand${i}`,
        group: "gripTrigger",
      },
    );

    const side = new THREE.Vector3(1, 0, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const center = at.at.clone();

    for (const s of [-1, 1]) {
      const studAt = center
        .clone()
        .addScaledVector(side, s * 0.089)
        .addScaledVector(forward, 0.025);

      b.part(
        new THREE.SphereGeometry(0.014, 6, 4),
        brightGold,
        {
          bone: at.bone ?? core,
          at: studAt,
          flat: true,
          name: `gripTriggerBand${i}Stud${s > 0 ? "L" : "R"}`,
          group: "gripTrigger",
        },
      );
    }
  }

  // A second, slightly raised seam winding down the rear of the handle.
  const seamPath = catmull([
    new THREE.Vector3(-0.075, 2.035, -0.18),
    new THREE.Vector3(-0.085, 1.91, -0.29),
    new THREE.Vector3(-0.07, 1.78, -0.39),
    new THREE.Vector3(-0.055, 1.65, -0.48),
  ]);
  b.sweep(seamPath, 0.009, {
    bone: grip.joints[0],
    color: leatherDark,
    sides: 6,
    caps: "round",
    name: "gripTriggerRearSeam",
    group: "gripTrigger",
  });

  const pommel = grip.at(1);
  const pommelCenter = pommel.at.clone().add(new THREE.Vector3(0, -0.015, -0.005));

  b.part(
    new THREE.SphereGeometry(0.135, 10, 7),
    brightGold,
    {
      bone: pommel.bone ?? core,
      at: pommelCenter,
      scale: [0.88, 1.0, 0.7],
      flat: true,
      name: "gripTriggerPommelGold",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.105, 0.12, 0.055, 8),
    gold,
    {
      bone: pommel.bone ?? core,
      at: pommelCenter.clone().add(new THREE.Vector3(0, 0.045, 0)),
      dir: [0, 1, 0],
      flat: true,
      name: "gripTriggerPommelCollar",
      group: "gripTrigger",
    },
  );

  // Lion face on the pommel, biased toward the front and the model's right.
  const face = pommelCenter.clone().add(new THREE.Vector3(-0.018, 0.01, 0.105));

  b.part(
    new THREE.SphereGeometry(0.072, 8, 6),
    lionGold,
    {
      bone: pommel.bone ?? core,
      at: face,
      scale: [1.0, 1.05, 0.38],
      flat: true,
      name: "gripTriggerLionFace",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.SphereGeometry(0.037, 7, 5),
    cream,
    {
      bone: pommel.bone ?? core,
      at: face.clone().add(new THREE.Vector3(0, -0.018, 0.036)),
      scale: [1.15, 0.7, 0.42],
      flat: true,
      name: "gripTriggerLionMuzzle",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.012, 0.035, 0.008),
    ink,
    {
      bone: pommel.bone ?? core,
      at: face.clone().add(new THREE.Vector3(-0.018, 0.005, 0.052)),
      name: "gripTriggerLionNose",
      group: "gripTrigger",
    },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.011, 6, 4),
      ink,
      {
        bone: pommel.bone ?? core,
        at: face.clone().add(new THREE.Vector3(s * 0.027, 0.025, 0.051)),
        name: `gripTriggerLionEye${s > 0 ? "L" : "R"}`,
        group: "gripTrigger",
      },
    );

    b.part(
      new THREE.ConeGeometry(0.027, 0.095, 6),
      brightGold,
      {
        bone: pommel.bone ?? core,
        at: face.clone().add(new THREE.Vector3(s * 0.055, 0.055, -0.005)),
        dir: [s * 0.55, 0.45, -0.25],
        flat: true,
        name: `gripTriggerLionManeTop${s > 0 ? "L" : "R"}`,
        group: "gripTrigger",
      },
    );

    b.part(
      new THREE.ConeGeometry(0.025, 0.09, 6),
      gold,
      {
        bone: pommel.bone ?? core,
        at: face.clone().add(new THREE.Vector3(s * 0.068, -0.02, -0.015)),
        dir: [s * 0.75, -0.3, -0.3],
        flat: true,
        name: `gripTriggerLionManeSide${s > 0 ? "L" : "R"}`,
        group: "gripTrigger",
      },
    );

    b.part(
      new THREE.ConeGeometry(0.022, 0.085, 6),
      lionGold,
      {
        bone: pommel.bone ?? core,
        at: face.clone().add(new THREE.Vector3(s * 0.04, -0.075, -0.01)),
        dir: [s * 0.45, -0.75, -0.2],
        flat: true,
        name: `gripTriggerLionManeLower${s > 0 ? "L" : "R"}`,
        group: "gripTrigger",
      },
    );
  }

  const tasselTop = pommelCenter.clone().add(new THREE.Vector3(0.02, -0.105, -0.01));
  const tasselPath = catmull([
    tasselTop,
    tasselTop.clone().add(new THREE.Vector3(0.035, -0.045, 0)),
    tasselTop.clone().add(new THREE.Vector3(0.015, -0.085, 0.005)),
  ]);

  b.sweep(tasselPath, 0.009, {
    bone: pommel.bone ?? core,
    color: brightGold,
    sides: 6,
    caps: "round",
    name: "gripTriggerTasselLoop",
    group: "gripTrigger",
  });

  b.part(
    new THREE.SphereGeometry(0.022, 7, 5),
    brightGold,
    {
      bone: pommel.bone ?? core,
      at: tasselPath.at(1),
      name: "gripTriggerTasselKnot",
      group: "gripTrigger",
    },
  );

  for (let i = 0; i < 3; i++) {
    b.part(
      new THREE.ConeGeometry(0.012, 0.07 + i * 0.012, 5),
      gold,
      {
        bone: pommel.bone ?? core,
        at: tasselPath.at(1).clone().add(new THREE.Vector3((i - 1) * 0.018, -0.032, 0)),
        dir: [(i - 1) * 0.22, -1, -0.05],
        flat: true,
        name: `gripTriggerTasselFringe${i}`,
        group: "gripTrigger",
      },
    );
  }

  // Right-side trigger guard: the weapon's right is -X.
  const guardPoints = [
    new THREE.Vector3(-0.205, 2.105, -0.015),
    new THREE.Vector3(-0.255, 2.055, -0.055),
    new THREE.Vector3(-0.265, 1.91, -0.075),
    new THREE.Vector3(-0.225, 1.82, -0.065),
    new THREE.Vector3(-0.17, 1.84, 0.005),
    new THREE.Vector3(-0.16, 1.97, 0.015),
  ];
  const guardPath = catmull(guardPoints);

  b.sweep(guardPath, 0.022, {
    bone: core,
    color: ink,
    sides: 7,
    caps: "round",
    name: "gripTriggerGuard",
    group: "gripTrigger",
  });

  b.sweep(
    catmull([
      new THREE.Vector3(-0.207, 2.096, -0.014),
      new THREE.Vector3(-0.238, 2.05, -0.05),
      new THREE.Vector3(-0.242, 1.92, -0.065),
    ]),
    0.008,
    {
      bone: core,
      color: gold,
      sides: 6,
      caps: "round",
      name: "gripTriggerGuardGoldRim",
      group: "gripTrigger",
    },
  );

  const triggerAt = new THREE.Vector3(-0.205, 1.985, -0.045);
  const triggerTip = new THREE.Vector3(-0.225, 1.885, -0.055);

  b.rod(triggerAt, triggerTip, 0.018, {
    bone: hinge,
    color: leather,
    section: { ngon: 6 },
    caps: "round",
    name: "gripTriggerBlade",
    group: "gripTrigger",
  });

  b.part(
    new THREE.SphereGeometry(0.034, 8, 5),
    brightGold,
    {
      bone: hinge,
      at: new THREE.Vector3(-0.205, 2.01, -0.045),
      scale: [1.0, 0.7, 0.55],
      flat: true,
      name: "gripTriggerHingePin",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.058, 0.058, 0.018, 8),
    bronze,
    {
      bone: core,
      at: new THREE.Vector3(-0.285, 2.045, -0.07),
      dir: [-1, 0, 0],
      flat: true,
      name: "gripTriggerSidePlate",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.041, 0.041, 0.021, 8),
    brightGold,
    {
      bone: core,
      at: new THREE.Vector3(-0.298, 2.045, -0.07),
      dir: [-1, 0, 0],
      flat: true,
      name: "gripTriggerSidePlateGold",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.BoxGeometry(0.025, 0.009, 0.055),
    cream,
    {
      bone: core,
      at: new THREE.Vector3(-0.312, 2.045, -0.07),
      dir: [-1, 0, 0],
      name: "gripTriggerSidePlateMark",
      group: "gripTrigger",
    },
  );

  // A compact row of decorative gold rivets follows the outside of the trigger guard.
  const guardRivets = [
    [-0.275, 2.06, -0.055],
    [-0.285, 1.995, -0.075],
    [-0.282, 1.925, -0.075],
    [-0.25, 1.855, -0.065],
  ];

  guardRivets.forEach((p, i) => {
    b.part(
      new THREE.SphereGeometry(0.012, 6, 4),
      brightGold,
      {
        bone: core,
        at: p,
        flat: true,
        name: `gripTriggerGuardRivet${i}`,
        group: "gripTrigger",
      },
    );
  });

  // Small rear ferrule and gold collar where the grip enters the housing.
  b.part(
    new THREE.CylinderGeometry(0.12, 0.11, 0.075, 8),
    ink,
    {
      bone: core,
      at: new THREE.Vector3(0, 2.082, -0.175),
      dir: [0, 1, 0],
      flat: true,
      name: "gripTriggerRootFerrule",
      group: "gripTrigger",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.115, 0.115, 0.018, 8),
    brightGold,
    {
      bone: core,
      at: new THREE.Vector3(0, 2.12, -0.175),
      dir: [0, 1, 0],
      flat: true,
      name: "gripTriggerRootGoldCollar",
      group: "gripTrigger",
    },
  );

  for (const s of [-1, 1]) {
    b.part(
      new THREE.SphereGeometry(0.016, 6, 4),
      brightGold,
      {
        bone: core,
        at: new THREE.Vector3(s * 0.082, 2.12, -0.185),
        flat: true,
        name: `gripTriggerRootRivet${s > 0 ? "L" : "R"}`,
        group: "gripTrigger",
      },
    );
  }
}
    return buildGripTrigger;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const J: Record<string, Joint> = {};
  J["core"] = b.joint("core", { at: [0,2.1,0], dir: [0,1,0], role: "spine" });
  J["cylinderSpin"] = b.joint("cylinderSpin", { parent: J["core"], at: [0,2.1,0], dir: [0,1,0], role: "hinge", group: "gun" });
  J["triggerHinge"] = b.joint("triggerHinge", { parent: J["core"], at: [-0.14,2,-0.05], dir: [-1,0,0], role: "hinge", group: "gun" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

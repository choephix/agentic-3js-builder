import * as THREE from "three";
import {
  bezier,
  catmull,
  createBuilder,
  polyline,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "calder-hanging-mobile",
  description:
    "A colorful Alexander Calder-inspired hanging mobile with articulated black wire arms, counterbalanced abstract steel plates, painted geometric silhouettes, and graphic surface motifs.",
};

export default function build() {
  const b = createBuilder({ name: "calder-mobile", detail: 1 });

  const BLACK = "#17191c";
  const RED = "#d83138";
  const RED_DARK = "#98252f";
  const YELLOW = "#f3c331";
  const BLUE = "#2366a8";
  const BLUE_DARK = "#19446f";
  const ORANGE = "#e87532";
  const CREAM = "#f0e6ca";
  const WHITE = "#fff8e7";
  const BRASS = "#b38a3b";

  /*
   * Graphic drawings are intentionally sparse. Calder's painted steel often
   * relies on a broad silhouette first, then one or two quiet marks.
   */
  const ringMark = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="34" fill="none" stroke="#18191c" stroke-width="7"/>
      <circle cx="50" cy="50" r="9" fill="#f0e6ca"/>
    </svg>`,
    { size: 192 },
  );

  const slashMark = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 78 L78 12" fill="none" stroke="#17191c" stroke-width="12" stroke-linecap="round"/>
      <path d="M37 88 L88 37" fill="none" stroke="#f0e6ca" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const dotMark = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="#fff8e7"/>
      <circle cx="50" cy="50" r="20" fill="#17191c"/>
    </svg>`,
    { size: 160 },
  );

  const arcMark = svg(
    `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 76 Q42 10 108 28" fill="none" stroke="#17191c" stroke-width="9" stroke-linecap="round"/>
      <path d="M20 88 Q50 38 104 45" fill="none" stroke="#fff8e7" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const triangleMark = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L91 84 L9 84 Z" fill="none" stroke="#17191c" stroke-width="8" stroke-linejoin="round"/>
      <circle cx="50" cy="67" r="8" fill="#f3c331"/>
    </svg>`,
    { size: 192 },
  );

  /*
   * Skeleton first: a suspended spine, four principal balancing arms, and
   * secondary arms whose hanging drops carry the painted steel forms.
   */
  const suspension = b.joint("suspension", {
    at: [0, 2.67, 0],
    dir: [0, -1, 0],
    role: "hinge",
    group: "suspension",
  });

  const spine = b.chain(
    "spine",
    polyline([
      [0, 2.67, 0],
      [0, 2.48, 0],
      [0.015, 2.22, 0],
      [0, 1.98, 0],
    ]),
    {
      parent: suspension,
      names: ["spine1", "spine2", "spine3", "hub"],
      role: "spine",
      group: "suspension",
    },
  );

  const armL = b.chain(
    "armL",
    catmull([
      spine.at(0.22),
      [0.34, 2.53, 0.02],
      [0.74, 2.40, 0.08],
      [1.12, 2.26, 0.16],
    ]),
    {
      parent: spine.jointAt(0.22),
      names: ["armL1", "armL2", "armLTip"],
      role: "arm",
      group: "primary-arms",
    },
  );

  const armR = b.chain(
    "armR",
    catmull([
      spine.at(0.42),
      [-0.31, 2.32, -0.02],
      [-0.65, 2.18, -0.08],
      [-1.08, 2.04, -0.18],
    ]),
    {
      parent: spine.jointAt(0.42),
      names: ["armR1", "armR2", "armRTip"],
      role: "arm",
      group: "primary-arms",
    },
  );

  const armF = b.chain(
    "armF",
    bezier(
      spine.at(0.72),
      [0.08, 2.05, 0.32],
      [0.35, 1.92, 0.72],
      [0.62, 1.84, 1.08],
    ),
    {
      parent: spine.jointAt(0.72),
      names: ["armF1", "armF2", "armFTip"],
      role: "arm",
      group: "primary-arms",
    },
  );

  const armB = b.chain(
    "armB",
    catmull([
      spine.at(1),
      [-0.16, 1.87, -0.38],
      [-0.39, 1.76, -0.69],
      [-0.68, 1.67, -1.02],
    ]),
    {
      parent: spine.jointAt(1),
      names: ["armB1", "armB2", "armBTip"],
      role: "arm",
      group: "primary-arms",
    },
  );

  const branchL = b.chain(
    "branchL",
    bezier(
      armL.at(0.45),
      [0.49, 2.39, 0.22],
      [0.62, 2.25, 0.39],
      [0.77, 2.10, 0.52],
    ),
    {
      parent: armL.jointAt(0.45),
      names: ["branchL1", "branchL2", "branchLTip"],
      role: "fan",
      group: "secondary-arms",
    },
  );

  const branchR = b.chain(
    "branchR",
    bezier(
      armR.at(0.45),
      [-0.39, 2.19, -0.27],
      [-0.48, 2.04, -0.43],
      [-0.58, 1.88, -0.56],
    ),
    {
      parent: armR.jointAt(0.45),
      names: ["branchR1", "branchR2", "branchRTip"],
      role: "fan",
      group: "secondary-arms",
    },
  );

  const branchF = b.chain(
    "branchF",
    catmull([
      armF.at(0.46),
      [0.30, 1.92, 0.72],
      [0.14, 1.78, 0.79],
      [-0.06, 1.66, 0.80],
    ]),
    {
      parent: armF.jointAt(0.46),
      names: ["branchF1", "branchF2", "branchFTip"],
      role: "fan",
      group: "secondary-arms",
    },
  );

  const branchB = b.chain(
    "branchB",
    bezier(
      armB.at(0.48),
      [-0.52, 1.72, -0.73],
      [-0.74, 1.59, -0.69],
      [-0.89, 1.47, -0.55],
    ),
    {
      parent: armB.jointAt(0.48),
      names: ["branchB1", "branchB2", "branchBTip"],
      role: "fan",
      group: "secondary-arms",
    },
  );

  const dropL = b.chain(
    "dropL",
    polyline([armL.tip, [1.12, 1.42, 0.16]]),
    {
      parent: armL.jointAt(1),
      names: ["dropL", "dropLTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropR = b.chain(
    "dropR",
    polyline([armR.tip, [-1.08, 1.19, -0.18]]),
    {
      parent: armR.jointAt(1),
      names: ["dropR", "dropRTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropF = b.chain(
    "dropF",
    polyline([armF.tip, [0.62, 1.16, 1.08]]),
    {
      parent: armF.jointAt(1),
      names: ["dropF", "dropFTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropB = b.chain(
    "dropB",
    polyline([armB.tip, [-0.68, 0.91, -1.02]]),
    {
      parent: armB.jointAt(1),
      names: ["dropB", "dropBTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropSL = b.chain(
    "dropSL",
    polyline([branchL.tip, [0.77, 1.72, 0.52]]),
    {
      parent: branchL.jointAt(1),
      names: ["dropSL", "dropSLTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropSR = b.chain(
    "dropSR",
    polyline([branchR.tip, [-0.58, 1.42, -0.56]]),
    {
      parent: branchR.jointAt(1),
      names: ["dropSR", "dropSRTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropSF = b.chain(
    "dropSF",
    polyline([branchF.tip, [-0.06, 1.25, 0.80]]),
    {
      parent: branchF.jointAt(1),
      names: ["dropSF", "dropSFTip"],
      role: "hinge",
      group: "drops",
    },
  );

  const dropSB = b.chain(
    "dropSB",
    polyline([branchB.tip, [-0.89, 1.08, -0.55]]),
    {
      parent: branchB.jointAt(1),
      names: ["dropSB", "dropSBTip"],
      role: "hinge",
      group: "drops",
    },
  );

  /*
   * Wire construction helpers.
   */
  const wire = (chain: ReturnType<typeof b.chain>, name: string, radius = 0.009) =>
    b.sweep(chain, radius, {
      color: BLACK,
      section: { ngon: 6 },
      caps: "round",
      skin: "smooth",
      name,
      group: "black-wire",
    });

  wire(spine, "spine-wire", 0.012);
  wire(armL, "armL-wire");
  wire(armR, "armR-wire");
  wire(armF, "armF-wire");
  wire(armB, "armB-wire");
  wire(branchL, "branchL-wire", 0.007);
  wire(branchR, "branchR-wire", 0.007);
  wire(branchF, "branchF-wire", 0.007);
  wire(branchB, "branchB-wire", 0.007);

  wire(dropL, "dropL-wire", 0.006);
  wire(dropR, "dropR-wire", 0.006);
  wire(dropF, "dropF-wire", 0.006);
  wire(dropB, "dropB-wire", 0.006);
  wire(dropSL, "dropSL-wire", 0.0055);
  wire(dropSR, "dropSR-wire", 0.0055);
  wire(dropSF, "dropSF-wire", 0.0055);
  wire(dropSB, "dropSB-wire", 0.0055);

  /*
   * The top suspension eye, central hub, and small brass pivot details.
   */
  b.part(
    new THREE.TorusGeometry(0.055, 0.010, 6, 14),
    BLACK,
    {
      bone: suspension,
      at: suspension.at,
      rotation: [0, 0, 0],
      name: "top-suspension-eye",
      group: "hardware",
      flat: true,
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.035, 0.035, 0.025, 10),
    BRASS,
    {
      bone: spine.tip,
      at: spine.tip.at,
      name: "central-brass-cap",
      group: "hardware",
      flat: true,
    },
  );

  b.part(
    new THREE.TorusGeometry(0.078, 0.008, 6, 18),
    BLACK,
    {
      bone: spine.tip,
      at: spine.tip.at,
      name: "central-hub-ring",
      group: "hardware",
      flat: true,
    },
  );

  const bead = (
    on: ReturnType<typeof b.chain>,
    t: number,
    radius: number,
    color = BRASS,
    name = "pivot-bead",
  ) => {
    const p = on.at(t);
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      bone: p.bone,
      frame: p,
      name,
      group: "hardware",
      flat: true,
    });
  };

  bead(armL, 0.02, 0.018, BRASS, "armL-root-bead");
  bead(armR, 0.02, 0.018, BRASS, "armR-root-bead");
  bead(armF, 0.02, 0.018, BRASS, "armF-root-bead");
  bead(armB, 0.02, 0.018, BRASS, "armB-root-bead");
  bead(branchL, 0.02, 0.013, BRASS, "branchL-bead");
  bead(branchR, 0.02, 0.013, BRASS, "branchR-bead");
  bead(branchF, 0.02, 0.013, BRASS, "branchF-bead");
  bead(branchB, 0.02, 0.013, BRASS, "branchB-bead");

  /*
   * Repeated tiny collars along the principal bars give the wirework a
   * hand-fabricated, articulated quality without making the rods heavy.
   */
  const collars = (chain: ReturnType<typeof b.chain>, count: number, prefix: string) => {
    b.along(chain, count, (at) => {
      b.part(new THREE.SphereGeometry(0.012, 7, 5), BRASS, {
        frame: at,
        bone: at.bone,
        name: `${prefix}-collar-${at.t.toFixed(2)}`,
        group: "hardware",
        flat: true,
      });
    });
  };

  collars(armL, 3, "armL");
  collars(armR, 3, "armR");
  collars(armF, 3, "armF");
  collars(armB, 3, "armB");

  /*
   * Abstract plate vocabulary. Coordinates are local to each silhouette:
   * x is its broad horizontal measure and y is its hanging measure.
   */
  type Vec = readonly [number, number];
  type PlateSpec = {
    name: string;
    drop: ReturnType<typeof b.chain>;
    outline: readonly Vec[];
    color: string;
    x: THREE.Vector3;
    y: THREE.Vector3;
    thickness?: number;
    bevel?: number;
    mark?: THREE.Texture;
    markSize?: readonly [number, number];
  };

  const plate = (spec: PlateSpec) => {
    const x = spec.x.clone().normalize();
    const y = spec.y.clone().normalize();
    const normal = new THREE.Vector3().crossVectors(x, y).normalize();

    const part = b.extrude(spec.outline, {
      at: spec.drop.at(1),
      bone: spec.drop.jointAt(1),
      x,
      y,
      thickness: spec.thickness ?? 0.018,
      bevel: spec.bevel ?? 0.004,
      smoothing: 0,
      color: spec.color,
      name: spec.name,
      group: "painted-steel",
    });

    if (spec.mark) {
      b.decal(part, spec.mark, {
        at: part.at,
        dir: normal,
        up: y,
        size: spec.markSize ?? [0.18, 0.18],
        segments: 5,
        lift: 0.002,
        bone: spec.drop.jointAt(1),
        name: `${spec.name}-graphic`,
        group: "surface-graphics",
      });
    }

    return part;
  };

  const redLeaf: Vec[] = [
    [-0.26, -0.06],
    [-0.13, -0.23],
    [0.08, -0.22],
    [0.28, -0.05],
    [0.24, 0.13],
    [0.05, 0.27],
    [-0.17, 0.21],
    [-0.30, 0.07],
  ];

  const yellowCrescent: Vec[] = [
    [-0.23, -0.16],
    [-0.02, -0.23],
    [0.19, -0.12],
    [0.24, 0.05],
    [0.12, 0.21],
    [-0.10, 0.24],
    [-0.23, 0.13],
    [-0.11, 0.04],
    [0.07, 0.01],
    [0.11, -0.08],
  ];

  const blueShard: Vec[] = [
    [-0.29, -0.15],
    [-0.04, -0.28],
    [0.27, -0.12],
    [0.14, 0.02],
    [0.30, 0.23],
    [0.02, 0.16],
    [-0.19, 0.29],
    [-0.16, 0.05],
  ];

  const longOrange: Vec[] = [
    [-0.30, -0.08],
    [-0.12, -0.22],
    [0.24, -0.14],
    [0.17, 0.01],
    [0.30, 0.18],
    [0.02, 0.22],
    [-0.19, 0.12],
  ];

  const creamHook: Vec[] = [
    [-0.23, -0.18],
    [0.02, -0.25],
    [0.23, -0.12],
    [0.26, 0.05],
    [0.12, 0.22],
    [-0.10, 0.25],
    [-0.27, 0.12],
    [-0.15, 0.02],
    [0.06, 0.07],
    [0.11, -0.06],
  ];

  const smallFan: Vec[] = [
    [-0.16, -0.10],
    [-0.04, -0.18],
    [0.14, -0.11],
    [0.22, 0.04],
    [0.05, 0.16],
    [-0.15, 0.12],
  ];

  const blackWave: Vec[] = [
    [-0.28, -0.08],
    [-0.14, -0.20],
    [0.10, -0.18],
    [0.27, -0.03],
    [0.14, 0.06],
    [0.28, 0.20],
    [0.02, 0.17],
    [-0.20, 0.25],
    [-0.12, 0.08],
  ];

  const blueHook: Vec[] = [
    [-0.18, -0.23],
    [0.08, -0.22],
    [0.23, -0.06],
    [0.18, 0.15],
    [-0.01, 0.25],
    [-0.20, 0.15],
    [-0.07, 0.03],
    [0.08, 0.06],
  ];

  const pRed = plate({
    name: "red-left-leaf",
    drop: dropL,
    outline: redLeaf,
    color: RED,
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    mark: arcMark,
    markSize: [0.25, 0.22],
  });

  plate({
    name: "yellow-left-crescent",
    drop: dropSL,
    outline: yellowCrescent,
    color: YELLOW,
    x: new THREE.Vector3(0.93, 0, 0.36),
    y: new THREE.Vector3(0, 1, 0),
    mark: ringMark,
    markSize: [0.18, 0.18],
  });

  const pBlue = plate({
    name: "blue-right-shard",
    drop: dropR,
    outline: blueShard,
    color: BLUE,
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 0.98, 0.18),
    mark: slashMark,
    markSize: [0.26, 0.23],
  });

  plate({
    name: "orange-right-fan",
    drop: dropSR,
    outline: smallFan,
    color: ORANGE,
    x: new THREE.Vector3(0.82, 0, -0.57),
    y: new THREE.Vector3(0.04, 0.98, 0.12),
    mark: dotMark,
    markSize: [0.15, 0.15],
  });

  const pOrange = plate({
    name: "orange-forward-sail",
    drop: dropF,
    outline: longOrange,
    color: ORANGE,
    x: new THREE.Vector3(0.76, 0, 0.65),
    y: new THREE.Vector3(0, 0.97, -0.20),
    mark: triangleMark,
    markSize: [0.21, 0.21],
  });

  plate({
    name: "cream-forward-small",
    drop: dropSF,
    outline: creamHook,
    color: CREAM,
    x: new THREE.Vector3(0.98, 0, 0.12),
    y: new THREE.Vector3(0, 0.62, 0.78),
    mark: ringMark,
    markSize: [0.16, 0.16],
  });

  const pBlueHook = plate({
    name: "blue-back-hook",
    drop: dropB,
    outline: blueHook,
    color: BLUE_DARK,
    x: new THREE.Vector3(0.97, 0, -0.24),
    y: new THREE.Vector3(0, 0.95, 0.30),
    mark: arcMark,
    markSize: [0.18, 0.17],
  });

  plate({
    name: "black-back-wave",
    drop: dropSB,
    outline: blackWave,
    color: BLACK,
    x: new THREE.Vector3(0.88, 0, 0.48),
    y: new THREE.Vector3(0, 0.91, -0.42),
    mark: dotMark,
    markSize: [0.15, 0.15],
  });

  /*
   * A few flat discs interrupt the polygon vocabulary. They are deliberately
   * low-sided, like cut and bent sheet rather than polished sculpture.
   */
  const disk = (
    name: string,
    drop: ReturnType<typeof b.chain>,
    radius: number,
    color: string,
    normal: THREE.Vector3,
  ) => {
    b.part(new THREE.CylinderGeometry(radius, radius, 0.020, 10), color, {
      bone: drop.jointAt(1),
      at: drop.at(1).at,
      dir: normal,
      name,
      group: "painted-steel",
      flat: true,
    });
  };

  disk("yellow-round-counterweight", dropL, 0.125, YELLOW, new THREE.Vector3(0.16, 0.93, 0.32));
  disk("cream-round-counterweight", dropR, 0.105, CREAM, new THREE.Vector3(-0.16, 0.96, 0.24));
  disk("red-forward-round-counterweight", dropF, 0.095, RED_DARK, new THREE.Vector3(0.12, 0.90, 0.42));

  /*
   * Three short, separate counterweight rods make the balance legible:
   * the eye reads a chain of forces rather than a collection of hanging cards.
   */
  b.rod(
    dropL.at(1),
    [1.37, 1.32, 0.12],
    0.007,
    BLACK,
    { name: "left-counterweight-stem", group: "black-wire" },
  );
  b.part(new THREE.SphereGeometry(0.055, 8, 5), RED_DARK, {
    at: [1.37, 1.32, 0.12],
    name: "left-counterweight",
    group: "painted-steel",
    flat: true,
  });

  b.rod(
    [-1.08, 1.19, -0.18],
    [-1.30, 1.08, -0.26],
    0.007,
    BLACK,
    { name: "right-counterweight-stem", group: "black-wire" },
  );
  b.part(new THREE.SphereGeometry(0.048, 8, 5), BLUE_DARK, {
    at: [-1.30, 1.08, -0.26],
    name: "right-counterweight",
    group: "painted-steel",
    flat: true,
  });

  b.rod(
    [-0.68, 0.91, -1.02],
    [-0.42, 0.75, -1.13],
    0.006,
    BLACK,
    { name: "back-counterweight-stem", group: "black-wire" },
  );
  b.part(new THREE.SphereGeometry(0.043, 8, 5), YELLOW, {
    at: [-0.42, 0.75, -1.13],
    name: "back-counterweight",
    group: "painted-steel",
    flat: true,
  });

  /*
   * Small graphic bolts on the hero plates. They are decals rather than
   * floating stickers, so they conform to the cut steel and follow its bone.
   */
  const redFront = new THREE.Vector3(0, 0, 1);
  b.decal(pRed, ringMark, {
    at: pRed.at,
    dir: redFront,
    up: new THREE.Vector3(0, 1, 0),
    size: [0.14, 0.14],
    segments: 4,
    lift: 0.0025,
    name: "red-plate-small-ring",
    group: "surface-graphics",
  });

  b.decal(pBlue, dotMark, {
    at: pBlue.at,
    dir: new THREE.Vector3(0, 0.98, 0.18),
    up: new THREE.Vector3(0, 1, 0),
    size: [0.13, 0.13],
    segments: 4,
    lift: 0.0025,
    name: "blue-plate-small-dot",
    group: "surface-graphics",
  });

  b.decal(pOrange, slashMark, {
    at: pOrange.at,
    dir: new THREE.Vector3(-0.65, 0.20, 0.73).normalize(),
    up: new THREE.Vector3(0, 1, 0),
    size: [0.15, 0.15],
    segments: 4,
    lift: 0.0025,
    name: "orange-plate-small-slash",
    group: "surface-graphics",
  });

  b.decal(pBlueHook, triangleMark, {
    at: pBlueHook.at,
    dir: new THREE.Vector3(-0.24, 0.30, 0.92).normalize(),
    up: new THREE.Vector3(0, 1, 0),
    size: [0.13, 0.13],
    segments: 4,
    lift: 0.0025,
    name: "blue-back-small-triangle",
    group: "surface-graphics",
  });

  return b.root;
}

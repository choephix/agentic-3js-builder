<!-- call: plan -->

```json
{
  "name": "Calder Hanging Mobile",
  "description": "An Alexander Calder hanging mobile: a hair-thin black spine carrying five alternating balance arms with black counterweights, hung from a steel hook and ceiling plate, holding nine hand-cut flat leaves in bold primaries that float in mid-air.",
  "builderName": "calderMobile",
  "size": [2.4, 2.55, 0.3],
  "layout": "A Calder mobile hangs in the air and never touches the floor: the top anchor (cream ceiling plate + steel hook ring) sits at y=2.70 and the lowest leaf bottom is at y=0.18. From the front (+Z): the hook and plate sit centred at x=0; a black spine rod drops 1.46 m down the centre. Five thin black balance arms pierce the spine at pivot collars, alternating direction: arm1 long to the LEFT (y=2.42), arm2 long to the RIGHT (y=2.14), arm3 long to the LEFT (y=1.84) with a second sub-arm branching further left from its tip, arm4 long to the RIGHT (y=1.52), arm5 long to the LEFT (y=1.24, the lowest). Each short side carries a black counterweight (ball or disc) that balances the long side; each long tip carries a hair-thin black string holding a flat, hand-cut Calder leaf in orange, yellow, blue, red or cream, one large black fan among them. All leaf plates face the viewer (+Z) with a slight y-rotation for life, and leaves sit at slightly different depths via the strings. The style is unmistakable Calder: razor-thin black rods and strings, flat organic cut-out shapes in primaries, black hardware, and perfect visual balance between weight and leaf.",
  "palette": {
    "black": "#1c1b1e",
    "red": "#e23b2a",
    "yellow": "#f2c11b",
    "blue": "#2757b8",
    "orange": "#ec7a2a",
    "cream": "#f2ead8",
    "steel": "#9aa0a8"
  },
  "mounts": {
    "hookTop": [0, 2.7, 0],
    "pivotArm1": [0, 2.42, 0],
    "pivotArm2": [0, 2.14, 0],
    "pivotArm3": [0, 1.84, 0],
    "pivotArm3sub": [-0.6, 1.84, 0],
    "pivotArm4": [0, 1.52, 0],
    "pivotArm5": [0, 1.24, 0]
  },
  "joints": [
    { "name": "hanger", "at": [0, 2.62, 0], "dir": [0, 1, 0], "role": "hinge" },
    { "name": "spine", "parent": "hanger", "at": [0, 2.56, 0], "dir": [0, -1, 0], "role": "spine" },
    { "name": "arm1", "parent": "spine", "at": [0, 2.42, 0], "dir": [-1, 0, 0], "role": "hinge" },
    { "name": "arm2", "parent": "spine", "at": [0, 2.14, 0], "dir": [1, 0, 0], "role": "hinge" },
    { "name": "arm3", "parent": "spine", "at": [0, 1.84, 0], "dir": [-1, 0, 0], "role": "hinge" },
    { "name": "arm3sub", "parent": "arm3", "at": [-0.6, 1.84, 0], "dir": [-1, 0, 0], "role": "hinge" },
    { "name": "arm4", "parent": "spine", "at": [0, 1.52, 0], "dir": [1, 0, 0], "role": "hinge" },
    { "name": "arm5", "parent": "spine", "at": [0, 1.24, 0], "dir": [-1, 0, 0], "role": "hinge" }
  ],
  "parts": [
    {
      "id": "spine",
      "builds": "The suspension column: all black hardware plus two steel/cream pieces at the top. From the top down: a cream ceiling plate (flat disc, radius 0.075, thickness 0.014, axis y) centred at (0, 2.69, 0) - this is the model's hanging anchor at mount hookTop; below it a steel hook ring (torus, ring radius 0.05, tube radius 0.007, lying in the x-y plane so it reads as a circle from the front) centred at (0, 2.62, 0); a short steel link rod (radius 0.005) from (0, 2.575, 0) down to (0, 2.56, 0); then the spine rod itself: black tapered rod, radius 0.011 at top shrinking to 0.008 at the bottom, running straight down from (0, 2.56, 0) to (0, 1.24, 0). Cap the bottom with a small black finial sphere (radius 0.018) at (0, 1.222, 0). Add five black pivot collars (cylinders, axis y, radius 0.02, height 0.045) centred on the spine at y = 2.42, 2.14, 1.84, 1.52 and 1.24 - these are the clamps at mounts pivotArm1 through pivotArm5 where the tier parts thread their rods through; each collar carries one tiny steel screw stud (cylinder, axis x, radius 0.004, height 0.008) poking in +x from its rim at the pivot height. The hook ring and link ride joint hanger; the plate, spine rod, finial and all five collars ride joint spine.",
      "box": [[-0.08, 1.2, -0.08], [0.08, 2.7, 0.08]],
      "attaches": "Top anchor at mount hookTop (0, 2.7, 0); the five collars clamp the spine at mounts pivotArm1..pivotArm5, through which the four tier parts build their rods. Rides joints hanger and spine.",
      "joints": ["hanger", "spine"],
      "floor": false,
      "budget": 130
    },
    {
      "id": "upperTier",
      "builds": "Top-tier arms, rods, weights, strings and leaves. Conventions: arm rods black radius 0.009 with black tip spheres radius 0.013 at every rod end; drop strings black radius 0.0035; leaves are flat extruded plates thickness 0.012, bevel 0.004, smoothing 2, each with a small black grommet disc (radius 0.007, height 0.014, axis z) seated at the leaf's top edge where its string meets it. Arm 1 (joint arm1): black rod from (-0.85, 2.42, 0) to (0.28, 2.42, 0) through mount pivotArm1; black counterweight ball radius 0.05 at (0.28, 2.42, 0) on the short right side. From the long left tip a black string drops to (-0.85, 2.12, 0) holding leaf L1: flat ORANGE plate, outline about centre (-0.85, 2.03, 0) as [(-0.14, 0), (-0.11, 0.07), (0, 0.085), (0.11, 0.07), (0.14, 0), (0.11, -0.07), (0, -0.085), (-0.11, -0.07)], rotated 12 degrees about y; grommet at (-0.85, 2.12, 0). Arm 2 (joint arm2): black rod from (-0.3, 2.14, 0) to (0.95, 2.14, 0) through mount pivotArm2; black counterweight ball radius 0.05 at (-0.3, 2.14, 0) on the short left side. From the long right tip (0.95, 2.14, 0) two black strings: one straight down to (0.95, 1.74, 0) holding leaf L2, a YELLOW kite, outline about centre (0.95, 1.64, 0) as [(0, 0.1), (0.1, 0.03), (0.06, -0.09), (-0.06, -0.09), (-0.1, 0.03)], rotated -8 degrees about y, grommet at its top edge; the other string slightly forward-down to (0.95, 2.02, 0.07) holding leaf L3, a small BLUE triangle, outline about centre (0.95, 1.92, 0.07) as [(0, 0.09), (0.09, -0.07), (-0.09, -0.07)], unrotated, grommet at (0.95, 2.015, 0.07).",
      "box": [[-1.02, 1.54, -0.06], [1.1, 2.46, 0.13]],
      "attaches": "Both rods thread through the spine collars at mounts pivotArm1 (0, 2.42, 0) and pivotArm2 (0, 2.14, 0). All geometry rides joints arm1 and arm2.",
      "joints": ["arm1", "arm2"],
      "floor": false,
      "budget": 210
    },
    {
      "id": "midTier",
      "builds": "Middle tier: one arm plus a branching sub-arm. Conventions as the other tiers: rods black radius 0.009 with tip spheres radius 0.013; strings black radius 0.0035; leaves flat plates thickness 0.012, bevel 0.004, smoothing 2, each with a black grommet disc (radius 0.007, height 0.014, axis z) at the leaf's top edge. Arm 3 (joint arm3): black rod from (-0.6, 1.84, 0) to (0.32, 1.84, 0) through mount pivotArm3; black counterweight disc (cylinder, axis x, radius 0.05, height 0.022) at (0.32, 1.84, 0) on the short right side. The long left tip is mount pivotArm3sub at (-0.6, 1.84, 0) and carries the sub-arm (joint arm3sub): black rod from (-0.6, 1.84, 0) out to (-1.05, 1.84, 0) with a tip sphere. From the sub-arm tip a black string drops to (-1.05, 1.52, 0) holding leaf L4, the model's one large BLACK fan, outline about centre (-1.05, 1.42, 0) as [(-0.17, -0.1), (-0.15, 0.04), (-0.06, 0.095), (0.06, 0.095), (0.15, 0.04), (0.17, -0.1)], unrotated (face toward +Z); grommet at (-1.05, 1.515, 0). A second black string drops forward from the sub-arm at (-0.8, 1.84, 0) to (-0.8, 1.63, 0.14) holding leaf L5, a small RED oval, outline about centre (-0.8, 1.56, 0.14) as [(-0.08, 0), (-0.06, 0.045), (0, 0.055), (0.06, 0.045), (0.08, 0), (0.06, -0.045), (0, -0.055), (-0.06, -0.045)], rotated 15 degrees about y, grommet at its top edge.",
      "box": [[-1.24, 1.31, -0.06], [0.4, 1.9, 0.17]],
      "attaches": "Arm 3 threads the spine collar at mount pivotArm3 (0, 1.84, 0); the sub-arm pivots at mount pivotArm3sub (-0.6, 1.84, 0) on arm 3's tip. Geometry rides joints arm3 and arm3sub.",
      "joints": ["arm3", "arm3sub"],
      "floor": false,
      "budget": 190
    },
    {
      "id": "lowerTier",
      "builds": "Fourth tier: one arm, its weight and two hanging leaves. Conventions: rods black radius 0.009 with tip spheres radius 0.013; strings black radius 0.0035; leaves flat plates thickness 0.012, bevel 0.004, smoothing 2, each with a black grommet disc (radius 0.007, height 0.014, axis z) at the leaf's top edge. Arm 4 (joint arm4): black rod from (-0.35, 1.52, 0) to (0.72, 1.52, 0) through mount pivotArm4; black counterweight ball radius 0.055 at (-0.35, 1.52, 0) on the short left side. From the long right tip (0.72, 1.52, 0) two black strings: one straight down to (0.72, 1.18, 0) holding leaf L6, a big BLUE leaf, outline about centre (0.72, 1.06, 0) as [(0, 0.12), (0.13, 0.09), (0.2, 0), (0.13, -0.09), (0, -0.12), (-0.13, -0.09), (-0.2, 0), (-0.13, 0.09)], rotated 6 degrees about y, grommet at its top; the other string tips forward-down to (0.72, 1.4, 0.09) holding leaf L7, a small YELLOW oval, outline about centre (0.72, 1.34, 0.09) as [(-0.075, 0), (-0.05, 0.045), (0, 0.055), (0.05, 0.045), (0.075, 0), (0.05, -0.045), (0, -0.055), (-0.05, -0.045)], unrotated, grommet at its top edge.",
      "box": [[-0.42, 0.92, -0.12], [0.95, 1.6, 0.16]],
      "attaches": "Rod threads the spine collar at mount pivotArm4 (0, 1.52, 0). All geometry rides joint arm4.",
      "joints": ["arm4"],
      "floor": false,
      "budget": 180
    },
    {
      "id": "bottomTier",
      "builds": "Lowest tier: the last arm and the model's lowest, signature leaf. Conventions: rods black radius 0.009 with tip spheres radius 0.013; strings black radius 0.0035; leaves flat plates thickness 0.012, bevel 0.004, smoothing 2, each with a black grommet disc (radius 0.007, height 0.014, axis z) at the leaf's top edge. Arm 5 (joint arm5): black rod from (-0.48, 1.24, 0) to (0.2, 1.24, 0) through mount pivotArm5; black counterweight disc (cylinder, axis x, radius 0.045, height 0.02) at (0.2, 1.24, 0) on the short right side. From the long left tip (-0.48, 1.24, 0) a long black string drops to (-0.48, 0.64, 0) holding leaf L8, the signature big RED leaf, outline about centre (-0.48, 0.4, 0) as [(0, 0.22), (0.17, 0.15), (0.25, 0), (0.16, -0.17), (0, -0.22), (-0.16, -0.17), (-0.25, 0), (-0.17, 0.15)], rotated -10 degrees about y; grommet at (-0.48, 0.635, 0). Its bottom edge must land at y = 0.18, the model's lowest point - nothing may touch y = 0. A second, shorter black string drops from (-0.05, 1.24, 0) down to (-0.05, 1.0, 0) holding leaf L9, a small CREAM leaf, outline about centre (-0.05, 0.94, 0) as [(0, 0.06), (0.09, 0.02), (0.09, -0.04), (0, -0.06), (-0.09, -0.04), (-0.09, 0.02)], unrotated, grommet at its top edge.",
      "box": [[-0.76, 0.16, -0.06], [0.26, 1.3, 0.08]],
      "attaches": "Rod threads the spine collar at mount pivotArm5 (0, 1.24, 0), the lowest pivot on the spine just above the finial. All geometry rides joint arm5.",
      "joints": ["arm5"],
      "floor": false,
      "budget": 180
    }
  ]
}
```

<!-- call: bottomTier -->

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, readonly [number, number, number]>;
};

export function buildBottomTier({ b, J, P }: Ctx) {
  const bone = J.arm5;
  const BLACK = P.black;
  const RED = P.red;
  const CREAM = P.cream;
  const STEEL = P.steel;

  const armRoot: [number, number, number] = [0, 1.24, 0];
  const longTip: [number, number, number] = [-0.48, 1.24, 0];
  const shortTip: [number, number, number] = [0.2, 1.24, 0];

  // A small low-poly helper for the puppet-like black hardware.
  const ball = (at: [number, number, number], radius: number, name: string) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), BLACK, {
      bone,
      at,
      name,
      group: "bottomTierHardware",
      flat: true,
    });

  const cylinder = (
    at: [number, number, number],
    radius: number,
    height: number,
    dir: [number, number, number],
    color: string,
    name: string,
    sides = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      bone,
      at,
      dir,
      name,
      group: "bottomTierHardware",
      flat: true,
    });

  // Calder's almost invisible balance arm.
  b.rod(armRoot, longTip, 0.009, {
    bone,
    color: BLACK,
    caps: "flat",
    name: "bottomTierArm5Long",
    group: "bottomTierArm",
    sides: 6,
  });
  b.rod(armRoot, shortTip, 0.009, {
    bone,
    color: BLACK,
    caps: "flat",
    name: "bottomTierArm5Short",
    group: "bottomTierArm",
    sides: 6,
  });
  ball(longTip, 0.013, "bottomTierArm5LongTip");
  ball(shortTip, 0.013, "bottomTierArm5ShortTip");

  // The flattened counterweight on the short side, with a tiny steel axle cap.
  cylinder(shortTip, 0.045, 0.02, [1, 0, 0], BLACK, "bottomTierCounterweight", 12);
  cylinder([0.211, 1.24, 0], 0.011, 0.006, [1, 0, 0], STEEL, "bottomTierCounterweightAxle", 8);

  // Fine suspension strings.
  b.rod(longTip, [-0.48, 0.64, 0], 0.0035, {
    bone,
    color: BLACK,
    caps: "flat",
    name: "bottomTierStringL8",
    group: "bottomTierStrings",
    sides: 5,
  });
  b.rod([-0.05, 1.24, 0], [-0.05, 1.0, 0], 0.0035, {
    bone,
    color: BLACK,
    caps: "flat",
    name: "bottomTierStringL9",
    group: "bottomTierStrings",
    sides: 5,
  });

  // Rotate a leaf in its own front-facing X/Y plane around world Y.
  const leafPoint = (
    center: [number, number, number],
    x: number,
    y: number,
    degrees: number,
    front = 0,
  ): [number, number, number] => {
    const a = (degrees * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // The plate's front normal is (-sin(a), 0, cos(a)).
    return [
      center[0] + c * x - s * front,
      center[1] + y,
      center[2] + s * x + c * front,
    ];
  };

  const grommet = (
    at: [number, number, number],
    name: string,
    spin = 0,
  ) => {
    const a = (spin * Math.PI) / 180;
    cylinder(
      at,
      0.007,
      0.014,
      [-Math.sin(a), 0, Math.cos(a)],
      BLACK,
      name,
      10,
    );
  };

  const addLeaf = (
    name: string,
    center: [number, number, number],
    outline: readonly [number, number][],
    color: string,
    rotation: number,
    grommetAt: [number, number, number],
  ) => {
    const a = (rotation * Math.PI) / 180;
    const xAxis: [number, number, number] = [Math.cos(a), 0, Math.sin(a)];

    b.extrude(outline, {
      at: center,
      x: xAxis,
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 2,
      detail: 1,
      color,
      bone,
      name,
      group: "bottomTierLeaves",
    });

    grommet(grommetAt, `${name}Grommet`, rotation);
  };

  // Signature red leaf. Its lower point is exactly y = 0.18.
  const redCenter: [number, number, number] = [-0.48, 0.4, 0];
  const redOutline: readonly [number, number][] = [
    [0, 0.22],
    [0.17, 0.15],
    [0.25, 0],
    [0.16, -0.17],
    [0, -0.22],
    [-0.16, -0.17],
    [-0.25, 0],
    [-0.17, 0.15],
  ];
  addLeaf(
    "bottomTierLeafL8",
    redCenter,
    redOutline,
    RED,
    -10,
    [-0.48, 0.635, 0],
  );

  // A restrained black cut-line/vein detail on the red leaf front.
  const redStem = leafPoint(redCenter, 0, -0.17, -10, 0.008);
  const redHub = leafPoint(redCenter, 0, 0.015, -10, 0.008);
  b.rod(redStem, redHub, 0.0032, {
    bone,
    color: BLACK,
    caps: "flat",
    name: "bottomTierLeafL8Stem",
    group: "bottomTierLeafDetails",
    sides: 5,
  });

  for (const [i, x] of [-0.11, 0.11].entries()) {
    const start = leafPoint(redCenter, 0, 0.015, -10, 0.009);
    const end = leafPoint(redCenter, x, 0.105, -10, 0.009);
    b.rod(start, end, 0.0022, {
      bone,
      color: BLACK,
      caps: "flat",
      name: `bottomTierLeafL8Vein${i + 1}`,
      group: "bottomTierLeafDetails",
      sides: 5,
    });
  }

  // Small cream leaf on the forward string.
  const creamCenter: [number, number, number] = [-0.05, 0.94, 0];
  const creamOutline: readonly [number, number][] = [
    [0, 0.06],
    [0.09, 0.02],
    [0.09, -0.04],
    [0, -0.06],
    [-0.09, -0.04],
    [-0.09, 0.02],
  ];
  addLeaf(
    "bottomTierLeafL9",
    creamCenter,
    creamOutline,
    CREAM,
    0,
    [-0.05, 1.0, 0],
  );

  // Tiny dark midrib keeps the cream cut-out readable against bright lighting.
  b.rod(
    [-0.05, 0.89, 0.008],
    [-0.05, 0.995, 0.008],
    0.002,
    {
      bone,
      color: BLACK,
      caps: "flat",
      name: "bottomTierLeafL9Midrib",
      group: "bottomTierLeafDetails",
      sides: 5,
    },
  );
}
```

<!-- call: spine -->

```ts
import * as THREE from "three";
import { frame } from "agentic-3js-builder";

export function buildSpine({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const STEEL = P.steel;
  const CREAM = P.cream;

  const hanger = J.hanger;
  const spine = J.spine;

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  // Cream ceiling mounting plate, centred at the specified top anchor.
  b.part(
    new THREE.CylinderGeometry(0.075, 0.075, 0.014, 24, 1, false),
    CREAM,
    {
      at: V([0, 2.69, 0]),
      bone: spine,
      dir: [0, 1, 0],
      name: "spine.ceilingPlate",
      group: "spine",
    },
  );

  // A shallow dark underside gives the ceiling plate a crisp, cut-metal silhouette.
  b.part(
    new THREE.CylinderGeometry(0.061, 0.061, 0.004, 20, 1, false),
    BLACK,
    {
      at: V([0, 2.681, 0]),
      bone: spine,
      dir: [0, 1, 0],
      name: "spine.plateUnderside",
      group: "spine",
    },
  );

  // Steel hanging ring: TorusGeometry's native Y axis is turned to Z,
  // putting the circular ring in the X/Y plane for a front view.
  b.part(
    new THREE.TorusGeometry(0.05, 0.007, 8, 24),
    STEEL,
    {
      at: V([0, 2.62, 0]),
      bone: hanger,
      dir: [0, 0, 1],
      name: "spine.hookRing",
      group: "spine",
    },
  );

  // Small straight link below the ring.
  b.rod(
    V([0, 2.575, 0]),
    V([0, 2.56, 0]),
    0.005,
    {
      color: STEEL,
      bone: hanger,
      caps: "round",
      sides: 8,
      name: "spine.link",
      group: "spine",
    },
  );

  // Hair-thin central suspension column, very slightly tapered toward its finial.
  b.rod(
    V([0, 2.56, 0]),
    V([0, 1.24, 0]),
    [0.011, 0.008],
    {
      color: BLACK,
      bone: spine,
      caps: { start: "flat", end: "flat" },
      sides: 8,
      name: "spine.column",
      group: "spine",
    },
  );

  // The small terminal bead is deliberately almost swallowed by the column.
  b.part(
    new THREE.SphereGeometry(0.018, 10, 6),
    BLACK,
    {
      at: V([0, 1.222, 0]),
      bone: spine,
      name: "spine.finial",
      group: "spine",
    },
  );

  const pivotYs = [2.42, 2.14, 1.84, 1.52, 1.24];

  for (let i = 0; i < pivotYs.length; i++) {
    const y = pivotYs[i];
    const n = i + 1;

    // Low-sided collars keep the handmade, mechanical Calder hardware read.
    b.part(
      new THREE.CylinderGeometry(0.02, 0.02, 0.045, 12, 1, false),
      BLACK,
      {
        at: V([0, y, 0]),
        bone: spine,
        dir: [0, 1, 0],
        name: `spine.pivotCollar${n}`,
        group: "spine",
      },
    );

    // A narrow upper highlight edge makes each collar legible against the spine.
    b.part(
      new THREE.TorusGeometry(0.019, 0.0022, 6, 16),
      BLACK,
      {
        at: V([0, y + 0.019, 0]),
        bone: spine,
        dir: [0, 1, 0],
        name: `spine.collarLip${n}`,
        group: "spine",
      },
    );

    // Tiny steel screw head projecting from the model's +X side.
    b.part(
      new THREE.CylinderGeometry(0.004, 0.004, 0.008, 8, 1, false),
      STEEL,
      {
        at: V([0.022, y, 0]),
        bone: spine,
        dir: [1, 0, 0],
        name: `spine.screw${n}`,
        group: "spine",
      },
    );

    // A smaller dark centre makes the screw read as a fastener rather than a bead.
    b.part(
      new THREE.CylinderGeometry(0.0015, 0.0015, 0.0085, 6, 1, false),
      BLACK,
      {
        at: V([0.026, y, 0]),
        bone: spine,
        dir: [1, 0, 0],
        name: `spine.screwSlot${n}`,
        group: "spine",
      },
    );
  }
}
```

<!-- call: lowerTier -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildLowerTier({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const BLUE = P.blue;
  const YELLOW = P.yellow;

  const arm4 = J.arm4;
  const pivot = M.pivotArm4;

  const armLeft: [number, number, number] = [-0.35, 1.52, 0];
  const armRight: [number, number, number] = [0.72, 1.52, 0];

  const leaf6StringEnd: [number, number, number] = [0.72, 1.18, 0];
  const leaf7StringEnd: [number, number, number] = [0.72, 1.4, 0.09];

  const leaf6Center: [number, number, number] = [0.72, 1.06, 0];
  const leaf7Center: [number, number, number] = [0.72, 1.34, 0.09];

  const bone = arm4;

  // Main balance arm, deliberately razor-thin and slightly overhanging the collar.
  b.rod(armLeft, armRight, 0.009, {
    color: BLACK,
    bone,
    caps: "flat",
    name: "lowerTier.arm4Rod",
    group: "lowerTier",
  });

  // The long-side tip and the compact counterweight on the short side.
  b.part(new THREE.SphereGeometry(0.013, 10, 6), BLACK, {
    at: armRight,
    bone,
    name: "lowerTier.arm4LongTip",
    group: "lowerTier",
    flat: true,
  });

  b.part(new THREE.SphereGeometry(0.055, 12, 8), BLACK, {
    at: armLeft,
    bone,
    name: "lowerTier.arm4Counterweight",
    group: "lowerTier",
    flat: true,
  });

  // A small dark washer at the balance pivot reinforces the mechanical Calder silhouette.
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 12), BLACK, {
    at: pivot,
    dir: [0, 1, 0],
    bone,
    name: "lowerTier.pivotWasher",
    group: "lowerTier",
    flat: true,
  });

  // Two separate suspension strings, one vertical and one angled toward the viewer.
  b.rod(armRight, leaf6StringEnd, 0.0035, {
    color: BLACK,
    bone,
    caps: "flat",
    name: "lowerTier.stringL6",
    group: "lowerTier",
  });

  b.rod(armRight, leaf7StringEnd, 0.0035, {
    color: BLACK,
    bone,
    caps: "flat",
    name: "lowerTier.stringL7",
    group: "lowerTier",
  });

  // Large eight-sided blue leaf, with the slightly rotated hand-cut silhouette.
  const leaf6 = b.extrude(
    [
      [0, 0.12],
      [0.13, 0.09],
      [0.2, 0],
      [0.13, -0.09],
      [0, -0.12],
      [-0.13, -0.09],
      [-0.2, 0],
      [-0.13, 0.09],
    ],
    {
      at: leaf6Center,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 2,
      rotation: [0, 6, 0],
      color: BLUE,
      bone,
      name: "lowerTier.leafL6",
      group: "lowerTier",
    },
  );

  // Small yellow oval leaf, held a little forward so the two plates separate in depth.
  const leaf7 = b.extrude(
    [
      [-0.075, 0],
      [-0.05, 0.045],
      [0, 0.055],
      [0.05, 0.045],
      [0.075, 0],
      [0.05, -0.045],
      [0, -0.055],
      [-0.05, -0.045],
    ],
    {
      at: leaf7Center,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 2,
      color: YELLOW,
      bone,
      name: "lowerTier.leafL7",
      group: "lowerTier",
    },
  );

  // Black grommets sit over the upper edge of each plate.
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.014, 12), BLACK, {
    at: [0.72, 1.18, 0.007],
    dir: [0, 0, 1],
    bone,
    name: "lowerTier.grommetL6",
    group: "lowerTier",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.014, 12), BLACK, {
    at: [0.72, 1.395, 0.097],
    dir: [0, 0, 1],
    bone,
    name: "lowerTier.grommetL7",
    group: "lowerTier",
    flat: true,
  });

  // Tiny central pin faces the viewer on each grommet, giving the cut plates a handmade hardware cue.
  b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 8), BLACK, {
    at: [0.72, 1.18, 0.015],
    dir: [0, 0, 1],
    bone,
    name: "lowerTier.grommetL6Pin",
    group: "lowerTier",
    flat: true,
  });

  b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 8), BLACK, {
    at: [0.72, 1.395, 0.105],
    dir: [0, 0, 1],
    bone,
    name: "lowerTier.grommetL7Pin",
    group: "lowerTier",
    flat: true,
  });

  // Preserve live handles for downstream builders without changing the shared layout.
  void leaf6;
  void leaf7;
}
```

<!-- call: upperTier -->

```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export function buildUpperTier({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const ORANGE = P.orange;
  const YELLOW = P.yellow;
  const BLUE = P.blue;

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    bone: any,
    name: string,
  ) => {
    return b.rod(a, z, radius, {
      color: BLACK,
      bone,
      caps: "flat",
      name: `upperTier${name}`,
      group: "upperTier",
    });
  };

  const tip = (
    at: [number, number, number],
    radius: number,
    bone: any,
    name: string,
  ) => {
    return b.part(new THREE.SphereGeometry(radius, 10, 7), BLACK, {
      at,
      bone,
      name: `upperTier${name}`,
      group: "upperTier",
      flat: true,
    });
  };

  const stringRod = (
    a: [number, number, number],
    z: [number, number, number],
    bone: any,
    name: string,
  ) => {
    return b.rod(a, z, 0.0035, {
      color: BLACK,
      bone,
      caps: "flat",
      name: `upperTier${name}`,
      group: "upperTier",
    });
  };

  const grommet = (
    at: [number, number, number],
    bone: any,
    name: string,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(0.007, 0.007, 0.014, 10),
      BLACK,
      {
        at,
        bone,
        dir: [0, 0, 1],
        name: `upperTier${name}`,
        group: "upperTier",
        flat: true,
      },
    );
  };

  const leaf = (
    center: [number, number, number],
    outline: [number, number][],
    color: string,
    angle: number,
    bone: any,
    name: string,
    grommetAt: [number, number, number],
  ) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    // Rotate the drawing plane around world Y while keeping it facing generally +Z.
    const xAxis: [number, number, number] = [c, 0, -s];

    b.extrude(
      outline,
      {
        at: center,
        x: xAxis,
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.004,
        smoothing: 2,
        color,
        bone,
        name: `upperTier${name}`,
        group: "upperTier",
      },
    );

    grommet(grommetAt, bone, `${name}Grommet`);
  };

  // ---------------------------------------------------------------------------
  // Arm 1: long to the left, with a short weighted right end.
  // ---------------------------------------------------------------------------

  const arm1Start: [number, number, number] = [-0.85, 2.42, 0];
  const arm1End: [number, number, number] = [0.28, 2.42, 0];

  rod(arm1Start, arm1End, 0.009, J.arm1, "Arm1Rod");
  tip(arm1Start, 0.013, J.arm1, "Arm1LeftTip");
  tip(arm1End, 0.013, J.arm1, "Arm1RightTip");

  b.part(new THREE.SphereGeometry(0.05, 12, 8), BLACK, {
    at: [0.28, 2.42, 0],
    bone: J.arm1,
    name: "upperTierArm1Counterweight",
    group: "upperTier",
    flat: true,
  });

  const arm1LeafHook: [number, number, number] = [-0.85, 2.12, 0];
  stringRod(arm1Start, arm1LeafHook, J.arm1, "Arm1String");

  leaf(
    [-0.85, 2.03, 0],
    [
      [-0.14, 0],
      [-0.11, 0.07],
      [0, 0.085],
      [0.11, 0.07],
      [0.14, 0],
      [0.11, -0.07],
      [0, -0.085],
      [-0.11, -0.07],
    ],
    ORANGE,
    12 * Math.PI / 180,
    J.arm1,
    "LeafL1",
    arm1LeafHook,
  );

  // ---------------------------------------------------------------------------
  // Arm 2: long to the right, with a short weighted left end.
  // ---------------------------------------------------------------------------

  const arm2Start: [number, number, number] = [-0.3, 2.14, 0];
  const arm2End: [number, number, number] = [0.95, 2.14, 0];

  rod(arm2Start, arm2End, 0.009, J.arm2, "Arm2Rod");
  tip(arm2Start, 0.013, J.arm2, "Arm2LeftTip");
  tip(arm2End, 0.013, J.arm2, "Arm2RightTip");

  b.part(new THREE.SphereGeometry(0.05, 12, 8), BLACK, {
    at: [-0.3, 2.14, 0],
    bone: J.arm2,
    name: "upperTierArm2Counterweight",
    group: "upperTier",
    flat: true,
  });

  // Main hanging yellow kite.
  const arm2KiteHook: [number, number, number] = [0.95, 1.74, 0];
  stringRod(arm2End, arm2KiteHook, J.arm2, "Arm2YellowString");

  leaf(
    [0.95, 1.64, 0],
    [
      [0, 0.1],
      [0.1, 0.03],
      [0.06, -0.09],
      [-0.06, -0.09],
      [-0.1, 0.03],
    ],
    YELLOW,
    -8 * Math.PI / 180,
    J.arm2,
    "LeafL2",
    arm2KiteHook,
  );

  // Smaller blue triangle, hung slightly forward for depth separation.
  const arm2TriangleStart: [number, number, number] = [0.95, 2.14, 0];
  const arm2TriangleHook: [number, number, number] = [0.95, 2.015, 0.07];
  stringRod(arm2TriangleStart, arm2TriangleHook, J.arm2, "Arm2BlueString");

  leaf(
    [0.95, 1.92, 0.07],
    [
      [0, 0.09],
      [0.09, -0.07],
      [-0.09, -0.07],
    ],
    BLUE,
    0,
    J.arm2,
    "LeafL3",
    arm2TriangleHook,
  );
}
```

<!-- call: midTier -->

```ts
import * as THREE from "three";
import { frame, rng } from "agentic-3js-builder";

export function buildMidTier({ b, J, P, M }: Ctx) {
  const BLACK = P.black;
  const RED = P.red;

  const pivot = M.pivotArm3;
  const subPivot = M.pivotArm3sub;

  const armEnd: [number, number, number] = [0.32, 1.84, 0];
  const subTip: [number, number, number] = [-1.05, 1.84, 0];

  const addRod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    bone: any,
    name: string,
  ) => b.rod(a, c, radius, BLACK, { bone, name, group: "midTier" });

  const addTip = (
    at: [number, number, number],
    radius: number,
    bone: any,
    name: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), BLACK, {
      at,
      bone,
      name,
      group: "midTier",
      flat: true,
    });

  const addString = (
    a: [number, number, number],
    c: [number, number, number],
    name: string,
  ) => addRod(a, c, 0.0035, J.arm3sub, name);

  const addGrommet = (
    at: [number, number, number],
    name: string,
  ) =>
    b.part(
      new THREE.CylinderGeometry(0.007, 0.007, 0.014, 10, 1, false),
      BLACK,
      {
        at,
        dir: [0, 0, 1],
        axis: "y",
        bone: J.arm3sub,
        name,
        group: "midTier",
        flat: true,
      },
    );

  const addLeaf = (
    outline: [number, number][],
    center: [number, number, number],
    color: string,
    name: string,
    yaw = 0,
  ) => {
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);

    // Rotating the drawing basis about world Y gives the hand-cut plate a
    // subtle Calder-like turn while keeping its broad face toward +Z.
    return b.extrude(outline, {
      at: center,
      x: [c, 0, -s],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 2,
      detail: 1,
      color,
      bone: J.arm3sub,
      name,
      group: "midTier",
    });
  };

  // Main balance arm: the long arm projects left from its pivot, with the
  // shorter weighted side projecting right.
  addRod(
    [-0.6, pivot[1], pivot[2]],
    armEnd,
    0.009,
    J.arm3,
    "midTier.arm3",
  );
  addTip([-0.6, pivot[1], pivot[2]], 0.013, J.arm3, "midTier.arm3.leftTip");
  addTip(armEnd, 0.013, J.arm3, "midTier.arm3.rightTip");

  // Heavy black counterweight on the short side, turned edge-on along X.
  b.part(
    new THREE.CylinderGeometry(0.05, 0.05, 0.022, 12, 1, false),
    BLACK,
    {
      at: armEnd,
      dir: [1, 0, 0],
      axis: "y",
      bone: J.arm3,
      name: "midTier.arm3.counterweight",
      group: "midTier",
      flat: true,
    },
  );

  // Branching sub-arm begins exactly at the left tip of arm 3.
  addRod(
    [-0.6, subPivot[1], subPivot[2]],
    subTip,
    0.009,
    J.arm3sub,
    "midTier.subArm",
  );
  addTip(subTip, 0.013, J.arm3sub, "midTier.subArm.tip");

  // Large black fan, suspended straight below the sub-arm tip.
  const fanStringTop: [number, number, number] = [-1.05, 1.52, 0];
  const fanCenter: [number, number, number] = [-1.05, 1.42, 0];

  addString(subTip, fanStringTop, "midTier.fan.string");

  addLeaf(
    [
      [-0.17, -0.1],
      [-0.15, 0.04],
      [-0.06, 0.095],
      [0.06, 0.095],
      [0.15, 0.04],
      [0.17, -0.1],
    ],
    fanCenter,
    BLACK,
    "midTier.leafL4.fan",
    0,
  );
  addGrommet(fanStringTop, "midTier.leafL4.grommet");

  // A forward-offset red oval hangs from the middle of the branching arm.
  const redStringStart: [number, number, number] = [-0.8, 1.84, 0];
  const redGrommet: [number, number, number] = [-0.8, 1.63, 0.14];
  const redCenter: [number, number, number] = [-0.8, 1.56, 0.14];

  addString(redStringStart, redGrommet, "midTier.leafL5.string");

  addLeaf(
    [
      [-0.08, 0],
      [-0.06, 0.045],
      [0, 0.055],
      [0.06, 0.045],
      [0.08, 0],
      [0.06, -0.045],
      [0, -0.055],
      [-0.06, -0.045],
    ],
    redCenter,
    RED,
    "midTier.leafL5.redOval",
    THREE.MathUtils.degToRad(15),
  );
  addGrommet(redGrommet, "midTier.leafL5.grommet");
}
```
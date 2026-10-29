import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Calder Hanging Mobile",
  "description": "An Alexander Calder hanging mobile: a hair-thin black spine carrying five alternating balance arms with black counterweights, hung from a steel hook and ceiling plate, holding nine hand-cut flat leaves in bold primaries that float in mid-air."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  black: "#1c1b1e",
  red: "#e23b2a",
  yellow: "#f2c11b",
  blue: "#2757b8",
  orange: "#ec7a2a",
  cream: "#f2ead8",
  steel: "#9aa0a8",
};
const M = {
  hookTop: [0, 2.7, 0] as [number, number, number],
  pivotArm1: [0, 2.42, 0] as [number, number, number],
  pivotArm2: [0, 2.14, 0] as [number, number, number],
  pivotArm3: [0, 1.84, 0] as [number, number, number],
  pivotArm3sub: [-0.6, 1.84, 0] as [number, number, number],
  pivotArm4: [0, 1.52, 0] as [number, number, number],
  pivotArm5: [0, 1.24, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // spine
  (() => {
function buildSpine({ b, J, P, M }: Ctx) {
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
    return buildSpine;
  })(),
  // upperTier
  (() => {
function buildUpperTier({ b, J, P, M }: Ctx) {
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
    return buildUpperTier;
  })(),
  // midTier
  (() => {
function buildMidTier({ b, J, P, M }: Ctx) {
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
    return buildMidTier;
  })(),
  // lowerTier
  (() => {
function buildLowerTier({ b, J, P, M }: Ctx) {
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
    return buildLowerTier;
  })(),
  // bottomTier
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, readonly [number, number, number]>;
};

function buildBottomTier({ b, J, P }: Ctx) {
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
    return buildBottomTier;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const J: Record<string, Joint> = {};
  J["hanger"] = b.joint("hanger", { at: [0,2.62,0], dir: [0,1,0], role: "hinge" });
  J["spine"] = b.joint("spine", { parent: J["hanger"], at: [0,2.56,0], dir: [0,-1,0], role: "spine" });
  J["arm1"] = b.joint("arm1", { parent: J["spine"], at: [0,2.42,0], dir: [-1,0,0], role: "hinge" });
  J["arm2"] = b.joint("arm2", { parent: J["spine"], at: [0,2.14,0], dir: [1,0,0], role: "hinge" });
  J["arm3"] = b.joint("arm3", { parent: J["spine"], at: [0,1.84,0], dir: [-1,0,0], role: "hinge" });
  J["arm3sub"] = b.joint("arm3sub", { parent: J["arm3"], at: [-0.6,1.84,0], dir: [-1,0,0], role: "hinge" });
  J["arm4"] = b.joint("arm4", { parent: J["spine"], at: [0,1.52,0], dir: [1,0,0], role: "hinge" });
  J["arm5"] = b.joint("arm5", { parent: J["spine"], at: [0,1.24,0], dir: [-1,0,0], role: "hinge" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  catmull,
  bezier,
  limb,
} from "agentic-3js-builder";
import {
  cel,
  furEdge,
  INK,
} from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "chibi axolotl",
  description:
    "A chunky, friendly chibi axolotl with glossy button eyes, a broad smile, a sweeping tail, tiny webbed feet, and six richly frilled pink external gills.",
};

const COAT = cel("#e9a9bd", "#b9688b", { threshold: 0.05 });
const COAT_LIGHT = cel("#ffd1dc", "#d884a0", { threshold: 0.02 });
const BELLY = furEdge("#fff2e2", COAT_LIGHT, {
  by: "position",
  axis: [0, 0, 1],
  level: 0.25,
  teeth: 0.025,
  period: 0.07,
  along: [1, 0, 0],
  ink: "#c47991",
  inkWidth: 0.003,
});
const GILL = cel("#ff739f", "#c52f70", { threshold: 0.0 });
const GILL_LIGHT = cel("#ffb0c7", "#dc4d83", { threshold: 0.02 });
const GILL_DARK = cel("#cf3d76", "#84234f", { threshold: 0.02 });
const FIN = cel("#ff9fba", "#c83d73", { threshold: 0.0 });
const FIN_EDGE = cel("#ffd0da", "#dd5b86", { threshold: 0.02 });
const EYE_BLACK = "#171522";
const EYE_IRIS = "#5a284b";
const EYE_GLEAM = "#fff9f2";
const NOSE = "#6f274f";
const MOUTH = "#3b1731";
const TOE = cel("#f48eae", "#a92e61", { threshold: 0.02 });
const TOEBEAN = "#ffcad8";
const SPOT = cel("#cf7695", "#914466", { threshold: 0.02 });
const SPOT_LIGHT = "#f7b0bd";
const WATER_BLUE = "#b9e3e5";

function sphere(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function lowSphere(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: THREE.Vector3 | [number, number, number],
  radius: number,
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: THREE.Vector3 | [number, number, number],
  radius: number,
  height: number,
  dir: THREE.Vector3 | [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
    at,
    dir,
    bone,
    flat: true,
    name,
  });
}

function addEye(
  b: ReturnType<typeof createBuilder>,
  head: any,
  side: number,
) {
  const outer = head.local({
    left: side * 0.215,
    up: 0.105,
    forward: 0.325,
  });

  sphere(b, EYE_BLACK, outer, [0.091, 0.105, 0.075], head, `eyeOuter${side > 0 ? "L" : "R"}`);

  const iris = outer.clone().add(new THREE.Vector3(0, 0, 0.052));
  sphere(b, EYE_IRIS, iris, [0.057, 0.068, 0.025], head, `iris${side > 0 ? "L" : "R"}`);

  const pupil = iris.clone().add(new THREE.Vector3(0, 0.006, 0.018));
  sphere(b, EYE_BLACK, pupil, [0.025, 0.045, 0.018], head, `pupil${side > 0 ? "L" : "R"}`);

  const gleam = iris.clone().add(
    new THREE.Vector3(-side * 0.018, 0.032, 0.026),
  );
  lowSphere(b, EYE_GLEAM, gleam, 0.019, head, `eyeGleam${side > 0 ? "L" : "R"}`);

  const tinyGleam = iris.clone().add(
    new THREE.Vector3(side * 0.025, -0.026, 0.025),
  );
  lowSphere(b, EYE_GLEAM, tinyGleam, 0.008, head, `eyeGleamTiny${side > 0 ? "L" : "R"}`);

  const brow = head.local({
    left: side * 0.23,
    up: 0.225,
    forward: 0.305,
  });
  b.sweep(
    bezier(
      brow.clone().add(new THREE.Vector3(-side * 0.08, -0.005, 0)),
      brow.clone().add(new THREE.Vector3(-side * 0.025, 0.018, 0)),
      brow.clone().add(new THREE.Vector3(side * 0.035, 0.02, 0)),
      brow.clone().add(new THREE.Vector3(side * 0.08, 0.004, 0)),
    ),
    0.012,
    {
      color: GILL_DARK,
      bone: head,
      caps: "round",
      name: `brow${side > 0 ? "L" : "R"}`,
    },
  );
}

function addFoot(
  b: ReturnType<typeof createBuilder>,
  chain: any,
  target: THREE.Vector3,
  side: number,
  rear: boolean,
) {
  const footBone = chain.joints[chain.joints.length - 1];

  sphere(
    b,
    TOE,
    target,
    rear ? [0.095, 0.055, 0.12] : [0.09, 0.055, 0.105],
    footBone,
    `${rear ? "hind" : "front"}Paw${side > 0 ? "L" : "R"}`,
  );

  const toeZ = rear ? 0.105 : 0.12;
  const spread = rear ? 0.052 : 0.045;
  const toeY = target.y - 0.006;

  for (let i = -1; i <= 1; i++) {
    const start = new THREE.Vector3(
      target.x + i * spread * 0.42,
      toeY,
      target.z + toeZ * 0.55,
    );
    const end = new THREE.Vector3(
      target.x + i * spread,
      0.045,
      target.z + toeZ,
    );

    b.rod(start, end, 0.017, {
      color: TOE,
      bone: footBone,
      section: { ngon: 6 },
      caps: "round",
      name: `${rear ? "hind" : "front"}Toe${side > 0 ? "L" : "R"}${i + 2}`,
    });

    lowSphere(
      b,
      TOEBEAN,
      end.clone().add(new THREE.Vector3(0, 0.012, 0.006)),
      0.018,
      footBone,
      `${rear ? "hind" : "front"}ToeBean${side > 0 ? "L" : "R"}${i + 2}`,
    );
  }

  const web = [
    new THREE.Vector3(target.x - spread * 0.82, 0.048, target.z + toeZ * 0.48),
    new THREE.Vector3(target.x + spread * 0.82, 0.048, target.z + toeZ * 0.48),
    new THREE.Vector3(target.x + spread * 0.55, 0.045, target.z + toeZ * 0.9),
    new THREE.Vector3(target.x, 0.046, target.z + toeZ * 1.03),
    new THREE.Vector3(target.x - spread * 0.55, 0.045, target.z + toeZ * 0.9),
  ];

  b.slab(web, {
    color: FIN_EDGE,
    thickness: 0.009,
    bone: footBone,
    name: `${rear ? "hind" : "front"}Web${side > 0 ? "L" : "R"}`,
  });
}

function addGillBranch(
  b: ReturnType<typeof createBuilder>,
  head: any,
  side: number,
  index: number,
) {
  const root = head.local({
    left: side * (0.37 + index * 0.012),
    up: 0.015 + index * 0.02,
    forward: -0.015 + index * 0.025,
  });

  const middle = new THREE.Vector3(
    side * (0.49 + index * 0.018),
    1.115 + index * 0.035,
    0.43 + index * 0.055,
  );

  const tip = new THREE.Vector3(
    side * (0.61 + index * 0.018),
    index === 1 ? 1.40 : index === 0 ? 1.31 : 1.29,
    0.40 + index * 0.10,
  );

  const path = catmull([root, middle, tip]);
  const stem = b.chain(
    `gill${side > 0 ? "L" : "R"}${index}`,
    path,
    {
      parent: head,
      count: 3,
      names: [
        `gill${side > 0 ? "L" : "R"}${index}Base`,
        `gill${side > 0 ? "L" : "R"}${index}Mid`,
        `gill${side > 0 ? "L" : "R"}${index}Tip`,
      ],
      role: "fan",
      group: "gills",
    },
  );

  b.sweep(stem, (t) => 0.034 * (1 - t) + 0.012, {
    color: GILL_DARK,
    section: { ngon: 7 },
    caps: "round",
    name: `gillStem${side > 0 ? "L" : "R"}${index}`,
  });

  cylinder(
    b,
    GILL_LIGHT,
    root,
    0.043,
    0.027,
    path.tangentAt(0),
    head,
    `gillCollar${side > 0 ? "L" : "R"}${index}`,
  );

  const blade = [
    [0, -0.038],
    [0.045, -0.025],
    [0.064, 0.012],
    [0.024, 0.095, "sharp"] as [number, number, "sharp"],
    [-0.024, 0.065],
    [-0.046, 0.012],
  ] as [number, number, "sharp"][];

  const bladeSmall = [
    [0, -0.03],
    [0.033, -0.02],
    [0.051, 0.006],
    [0.019, 0.072, "sharp"] as [number, number, "sharp"],
    [-0.018, 0.049],
    [-0.036, 0.008],
  ] as [number, number, "sharp"][];

  for (let j = 0; j < 6; j++) {
    const t = 0.11 + j * 0.145;
    const at = stem.at(t);
    const bladeAt = at.at.clone().add(
      new THREE.Vector3(
        0,
        (j % 2 === 0 ? 0.004 : -0.006),
        (j - 2.5) * 0.006,
      ),
    );

    const outline = j === 0 || j === 5 ? bladeSmall : blade;
    const color = j % 3 === 0 ? GILL_LIGHT : j % 3 === 1 ? GILL : FIN;

    b.extrude(outline, {
      at: bladeAt,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.014, 0.006],
      bevel: 0.004,
      smoothing: 1,
      color,
      bone: at.bone,
      name: `gillFrill${side > 0 ? "L" : "R"}${index}_${j}`,
      group: "gills",
    });

    const veinEnd = bladeAt.clone().add(
      new THREE.Vector3(0, j === 5 ? 0.055 : 0.073, 0.005),
    );

    b.rod(bladeAt, veinEnd, 0.006, {
      color: GILL_DARK,
      bone: at.bone,
      caps: "round",
      name: `gillVein${side > 0 ? "L" : "R"}${index}_${j}`,
    });

    if (j === 1 || j === 3 || j === 4) {
      const filamentTip = bladeAt.clone().add(
        new THREE.Vector3(
          0,
          0.035 + (j % 2) * 0.015,
          side * 0.055,
        ),
      );

      b.spike(bladeAt, filamentTip, null, 0.007, {
        color: GILL_LIGHT,
        bone: at.bone,
        name: `gillFilament${side > 0 ? "L" : "R"}${index}_${j}`,
      });
    }
  }

  return stem;
}

export default function build() {
  const b = createBuilder({
    name: "chibi-axolotl",
    detail: 1,
    paintSize: 1024,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: a compact spine, a hinged jaw, four short limbs, the tail, and six articulated gill branches.

  const hips = b.joint("hips", {
    at: [0, 0.54, -0.18],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const bodyPath = catmull([
    [0, 0.54, -0.18],
    [0, 0.61, 0.02],
    [0, 0.73, 0.23],
    [0, 0.88, 0.42],
  ]);

  const body = b.chain("spine", bodyPath, {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "chest", "neckBase"],
    role: "spine",
    group: "body",
  });

  const tailPath = catmull([
    [0, 0.54, -0.19],
    [0, 0.50, -0.43],
    [0, 0.43, -0.72],
    [0, 0.31, -1.04],
    [0, 0.17, -1.34],
    [0, 0.10, -1.56],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
    group: "body",
  });

  const neckBase = body.joints[body.joints.length - 1];

  const head = b.joint("head", {
    parent: neckBase,
    at: [0, 1.035, 0.56],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.25, down: 0.18 }),
    dir: [0, 0, 1],
    role: "jaw",
    group: "face",
  });

  const frontLegs: { side: number; chain: any; target: THREE.Vector3 }[] = [];
  const hindLegs: { side: number; chain: any; target: THREE.Vector3 }[] = [];

  for (const side of [1, -1]) {
    const frontRoot = new THREE.Vector3(side * 0.29, 0.58, 0.25);
    const frontTarget = new THREE.Vector3(side * 0.39, 0.085, 0.48);
    const frontPts = limb(
      frontRoot,
      frontTarget,
      [0.27, 0.245],
      [0, 0, 1],
    );

    const front = b.chain(
      `arm${side > 0 ? "L" : "R"}`,
      frontPts,
      {
        parent: hips,
        names: [
          `shoulder${side > 0 ? "L" : "R"}`,
          `elbow${side > 0 ? "L" : "R"}`,
          `hand${side > 0 ? "L" : "R"}`,
        ],
        role: "arm",
        contact: [frontTarget.x, 0, frontTarget.z],
        group: "limbs",
      },
    );

    frontLegs.push({ side, chain: front, target: frontTarget });

    const hindRoot = new THREE.Vector3(side * 0.30, 0.53, -0.12);
    const hindTarget = new THREE.Vector3(side * 0.42, 0.085, -0.38);
    const hindPts = limb(
      hindRoot,
      hindTarget,
      [0.29, 0.245],
      [0, 0, -1],
    );

    const hind = b.chain(
      `leg${side > 0 ? "L" : "R"}`,
      hindPts,
      {
        parent: hips,
        names: [
          `hip${side > 0 ? "L" : "R"}`,
          `knee${side > 0 ? "L" : "R"}`,
          `ankle${side > 0 ? "L" : "R"}`,
        ],
        role: "leg",
        contact: [hindTarget.x, 0, hindTarget.z],
        group: "limbs",
      },
    );

    hindLegs.push({ side, chain: hind, target: hindTarget });
  }

  const gillChains: any[] = [];
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      gillChains.push(addGillBranch(b, head, side, i));
    }
  }

  // A relaxed, slightly open jaw makes the hinge and the lower lip readable to a rigger.
  b.pose(jaw, {
    axis: [1, 0, 0],
    deg: 7,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Main body: a soft, chunky tube, a pale front belly, and a broad faceted head.

  const bodyTube = b.sweep(body, (t) => {
    if (t < 0.2) return 0.215 + t * 0.30;
    return 0.275 - (t - 0.2) * 0.035;
  }, {
    color: COAT,
    section: { ngon: 8 },
    caps: "round",
    name: "softBody",
    group: "body",
  });

  const tailTube = b.sweep(tail, (t) => 0.13 * (1 - t) + 0.027, {
    color: COAT,
    section: { ngon: 7 },
    caps: "round",
    name: "tailTube",
    group: "body",
  });

  const headPart = sphere(
    b,
    COAT_LIGHT,
    head.at,
    [0.54, 0.43, 0.42],
    head,
    "bigAxolotlHead",
  );

  const muzzle = head.local({
    forward: 0.315,
    down: 0.095,
  });

  sphere(
    b,
    BELLY,
    muzzle,
    [0.275, 0.155, 0.115],
    head,
    "creamMuzzle",
  );

  const lowerJaw = jaw.at.clone().add(new THREE.Vector3(0, -0.012, 0.055));
  sphere(
    b,
    COAT_LIGHT,
    lowerJaw,
    [0.245, 0.085, 0.13],
    jaw,
    "lowerJaw",
  );

  const throat = head.local({
    forward: 0.16,
    down: 0.26,
  });

  sphere(
    b,
    BELLY,
    throat,
    [0.22, 0.15, 0.07],
    head,
    "throatPatch",
  );

  // The belly is a separate soft plate that sits over the front of the body.
  sphere(
    b,
    BELLY,
    [0, 0.64, 0.315],
    [0.30, 0.255, 0.065],
    body.joints[1],
    "largeBellyPatch",
  );

  // A small rosy chest medallion breaks up the broad pale belly.
  lowSphere(
    b,
    SPOT_LIGHT,
    [0, 0.68, 0.385],
    0.048,
    body.joints[1],
    "chestBlush",
  );

  // -------------------------------------------------------------------------------------------------------------
  // Face: bead eyes, highlights, nostrils, a broad smiling mouth, and cheek freckles.

  addEye(b, head, 1);
  addEye(b, head, -1);

  for (const side of [1, -1]) {
    const nostril = head.local({
      left: side * 0.075,
      up: 0.005,
      forward: 0.406,
    });

    lowSphere(
      b,
      NOSE,
      nostril,
      0.019,
      head,
      `nostril${side > 0 ? "L" : "R"}`,
    );

    const cheek = head.local({
      left: side * 0.335,
      up: -0.065,
      forward: 0.285,
    });

    lowSphere(
      b,
      SPOT,
      cheek,
      0.043,
      head,
      `cheekSpot${side > 0 ? "L" : "R"}`,
    );

    lowSphere(
      b,
      SPOT_LIGHT,
      cheek.clone().add(new THREE.Vector3(-side * 0.055, 0.035, 0.017)),
      0.018,
      head,
      `cheekHighlight${side > 0 ? "L" : "R"}`,
    );
  }

  const mouthLeft = head.local({
    left: -0.225,
    down: 0.145,
    forward: 0.405,
  });
  const mouthCenter = head.local({
    down: 0.19,
    forward: 0.425,
  });
  const mouthRight = head.local({
    left: 0.225,
    down: 0.145,
    forward: 0.405,
  });

  b.sweep(
    bezier(
      mouthLeft,
      mouthLeft.clone().add(new THREE.Vector3(0.055, -0.025, 0.008)),
      mouthCenter.clone().add(new THREE.Vector3(-0.055, -0.012, 0)),
      mouthCenter,
    ),
    0.015,
    {
      color: MOUTH,
      bone: head,
      caps: "round",
      section: { ngon: 6 },
      name: "smileLeft",
      group: "face",
    },
  );

  b.sweep(
    bezier(
      mouthCenter,
      mouthCenter.clone().add(new THREE.Vector3(0.055, -0.012, 0)),
      mouthRight.clone().add(new THREE.Vector3(-0.055, -0.025, 0.008)),
      mouthRight,
    ),
    0.015,
    {
      color: MOUTH,
      bone: head,
      caps: "round",
      section: { ngon: 6 },
      name: "smileRight",
      group: "face",
    },
  );

  const lowerLipLeft = jaw.at.clone().add(new THREE.Vector3(-0.18, 0.012, 0.145));
  const lowerLipRight = jaw.at.clone().add(new THREE.Vector3(0.18, 0.012, 0.145));
  const lowerLipMid = jaw.at.clone().add(new THREE.Vector3(0, -0.014, 0.17));

  b.sweep(
    bezier(
      lowerLipLeft,
      lowerLipLeft.clone().add(new THREE.Vector3(0.05, -0.018, 0)),
      lowerLipRight.clone().add(new THREE.Vector3(-0.05, -0.018, 0)),
      lowerLipRight,
    ),
    0.012,
    {
      color: NOSE,
      bone: jaw,
      caps: "round",
      section: { ngon: 6 },
      name: "lowerLip",
      group: "face",
    },
  );

  lowSphere(
    b,
    TOEBEAN,
    lowerLipMid,
    0.018,
    jaw,
    "lowerLipHighlight",
  );

  // A few deliberately oversized freckles make the cheeks read at thumbnail size.
  for (const side of [1, -1]) {
    const freckles = [
      [side * 0.29, 0.985, 0.855, 0.018],
      [side * 0.34, 0.955, 0.82, 0.013],
      [side * 0.255, 0.95, 0.86, 0.011],
    ] as const;

    freckles.forEach(([x, y, z, r], i) => {
      lowSphere(
        b,
        i === 0 ? SPOT : SPOT_LIGHT,
        [x, y, z],
        r,
        head,
        `freckle${side > 0 ? "L" : "R"}${i}`,
      );
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Gill collars and the six pink feather fans.

  // The branches were created during skeleton construction. Add subtle root pads under their stalks.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const root = head.local({
        left: side * (0.37 + i * 0.012),
        up: 0.015 + i * 0.02,
        forward: -0.015 + i * 0.025,
      });

      sphere(
        b,
        GILL_DARK,
        root,
        [0.058, 0.045, 0.052],
        head,
        `gillRootPad${side > 0 ? "L" : "R"}${i}`,
      );

      const rootHighlight = root.clone().add(
        new THREE.Vector3(-side * 0.025, 0.025, 0.035),
      );

      lowSphere(
        b,
        GILL_LIGHT,
        rootHighlight,
        0.018,
        head,
        `gillRootHighlight${side > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail fin: a tall, low-poly caudal membrane with visible supporting rays.

  const finSamples = [0, 0.18, 0.37, 0.56, 0.74, 0.9, 1];
  const upperEdge: THREE.Vector3[] = [];
  const lowerEdge: THREE.Vector3[] = [];

  for (const t of finSamples) {
    const p = tail.at(t).at.clone();
    const width = 0.105 * (1 - t) + 0.018;
    upperEdge.push(p.clone().add(new THREE.Vector3(0, width, 0)));
    lowerEdge.push(p.clone().add(new THREE.Vector3(0, -width * 0.76, 0)));
  }

  b.membrane(upperEdge, lowerEdge, {
    color: FIN,
    thickness: 0.012,
    rows: 5,
    cols: 8,
    scallop: 0.08,
    bone: tail,
    name: "wideTailFin",
    group: "tail",
  });

  for (let i = 1; i < finSamples.length - 1; i++) {
    const t = finSamples[i];
    const p = tail.at(t).at.clone();
    const width = 0.105 * (1 - t) + 0.018;
    const upper = p.clone().add(new THREE.Vector3(0, width * 0.93, 0));
    const lower = p.clone().add(new THREE.Vector3(0, -width * 0.67, 0));

    b.rod(p, upper, 0.008, {
      color: FIN_EDGE,
      bone: tail.at(t).bone,
      section: { ngon: 6 },
      caps: "round",
      name: `tailRayUpper${i}`,
      group: "tail",
    });

    b.rod(p, lower, 0.007, {
      color: GILL_DARK,
      bone: tail.at(t).bone,
      section: { ngon: 6 },
      caps: "round",
      name: `tailRayLower${i}`,
      group: "tail",
    });
  }

  // A few flat spots on the tail make the pink fin feel patterned rather than uniform.
  for (let i = 1; i < finSamples.length - 1; i += 2) {
    const t = finSamples[i];
    const p = tail.at(t).at.clone();
    const spotAt = p.add(new THREE.Vector3(0, 0.045 * (1 - t), 0.018));
    b.stick(
      new THREE.CylinderGeometry(0.019, 0.019, 0.009, 7),
      GILL_LIGHT,
      {
        at: spotAt,
        dir: [0, 1, 0],
        axis: "y",
        bone: tail.at(t).bone,
        embed: 0.2,
        name: `tailFinSpot${i}`,
      },
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Four squat legs and twelve chunky toes.

  for (const item of frontLegs) {
    b.sweep(item.chain, [0.064, 0.052, 0.036], {
      color: COAT,
      section: { ngon: 7 },
      caps: "round",
      name: `frontArmTube${item.side > 0 ? "L" : "R"}`,
      group: "limbs",
    });

    addFoot(b, item.chain, item.target, item.side, false);

    const elbow = item.chain.at(0.5).at;
    lowSphere(
      b,
      COAT_LIGHT,
      elbow.clone().add(new THREE.Vector3(0, 0.01, 0)),
      0.061,
      item.chain.joints[1],
      `frontElbowPad${item.side > 0 ? "L" : "R"}`,
    );
  }

  for (const item of hindLegs) {
    b.sweep(item.chain, [0.073, 0.058, 0.039], {
      color: COAT,
      section: { ngon: 7 },
      caps: "round",
      name: `hindLegTube${item.side > 0 ? "L" : "R"}`,
      group: "limbs",
    });

    addFoot(b, item.chain, item.target, item.side, true);

    const knee = item.chain.at(0.47).at;
    lowSphere(
      b,
      COAT_LIGHT,
      knee.clone().add(new THREE.Vector3(0, 0.01, 0)),
      0.069,
      item.chain.joints[1],
      `hindKneePad${item.side > 0 ? "L" : "R"}`,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Surface details: lilac spots on the body and a soft color break along the back.

  const bodySurface = b.surface(bodyTube);
  const bodySpots = bodySurface.scatter(18, {
    rng: rng(7401),
    minDist: 0.085,
    filter: (hit) => hit.n.y > -0.35 && hit.n.z < 0.8,
  });

  bodySpots.forEach((hit, i) => {
    b.stick(
      new THREE.SphereGeometry(0.034 + (i % 3) * 0.008, 7, 5),
      i % 4 === 0 ? SPOT_LIGHT : SPOT,
      hit,
      {
        embed: 0.42,
        scale: [1, 0.24, 1],
        name: `bodySpot${i}`,
        group: "skin markings",
      },
    );
  });

  const headSurface = b.surface(headPart);
  const crownSpots = headSurface.scatter(8, {
    rng: rng(991),
    minDist: 0.09,
    filter: (hit) => hit.n.y > 0.15 && hit.n.z > -0.2,
  });

  crownSpots.forEach((hit, i) => {
    b.stick(
      new THREE.SphereGeometry(0.025 + (i % 2) * 0.006, 7, 5),
      i % 3 === 0 ? SPOT_LIGHT : SPOT,
      hit,
      {
        embed: 0.45,
        scale: [1, 0.22, 1],
        name: `crownSpot${i}`,
        group: "skin markings",
      },
    );
  });

  // A short row of pale dorsal beads emphasizes the spine without making the animal spiky.
  for (let i = 0; i < 5; i++) {
    const t = 0.18 + i * 0.15;
    const p = body.at(t).at.clone().add(new THREE.Vector3(0, 0.17, 0));
    lowSphere(
      b,
      COAT_LIGHT,
      p,
      0.025 - i * 0.002,
      body.at(t).bone,
      `dorsalBead${i}`,
    );
  }

  // Tiny side gill-shadow marks reinforce the iconic three-branch silhouette.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const p = head.local({
        left: side * (0.355 + i * 0.018),
        up: -0.07 + i * 0.035,
        forward: 0.04 + i * 0.025,
      });

      b.rod(
        p.clone().add(new THREE.Vector3(0, -0.018, 0)),
        p.clone().add(new THREE.Vector3(0, 0.055, 0.018)),
        0.006,
        {
          color: GILL_DARK,
          bone: head,
          caps: "round",
          section: { ngon: 6 },
          name: `gillShadowMark${side > 0 ? "L" : "R"}${i}`,
          group: "gills",
        },
      );
    }
  }

  // A little pale patch below the mouth gives the head the soft, rounded axolotl expression.
  const chin = jaw.at.clone().add(new THREE.Vector3(0, -0.065, 0.045));
  sphere(
    b,
    BELLY,
    chin,
    [0.14, 0.065, 0.045],
    jaw,
    "chinHighlight",
  );

  // Preserve a tiny amount of cool blue-green as a reflected-color accent in the tail membrane.
  b.sweep(
    catmull([
      [0, 0.59, -0.34],
      [0, 0.54, -0.66],
      [0, 0.43, -0.97],
      [0, 0.30, -1.23],
    ]),
    [0.009, 0.004],
    {
      color: WATER_BLUE,
      bone: tail,
      caps: "round",
      name: "tailCoolStripe",
      group: "tail",
    },
  );

  return b.root;
}
```
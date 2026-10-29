import * as THREE from "three";
import { createBuilder, type Builder, type Joint, polyline, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Bauhaus Songbird",
  "description": "A stylized songbird built from pure Bauhaus geometry — red egg body, blue ball head, yellow triangle beak and a black fan tail — perched on an ink-black branch dotted with primary-coloured circle leaves."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  bauhausRed: "#e03a2f",
  bauhausBlue: "#2657c9",
  bauhausYellow: "#f5c400",
  ink: "#181714",
  cream: "#f4ead8",
  white: "#ffffff",
};
const M = {
  perchTop: [0, 0.18, 0] as [number, number, number],
  hipCenter: [0, 0.36, 0] as [number, number, number],
  neck: [0, 0.56, 0.14] as [number, number, number],
  shoulderL: [0.14, 0.47, 0.04] as [number, number, number],
  shoulderR: [-0.14, 0.47, 0.04] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // branch
  (() => {
function buildBranch({ b, J, P, M }: any) {
  const INK = P.ink;
  const RED = P.bauhausRed;
  const BLUE = P.bauhausBlue;
  const YELLOW = P.bauhausYellow;
  const CREAM = P.cream;

  const perch = new THREE.Vector3(...(M.perchTop ?? [0, 0.18, 0]));

  const add = (a: readonly number[], d: readonly number[]) =>
    [a[0] + d[0], a[1] + d[1], a[2] + d[2]] as [number, number, number];

  const sub = (a: readonly number[], d: readonly number[]) =>
    [a[0] - d[0], a[1] - d[1], a[2] - d[2]] as [number, number, number];

  const norm = (x: number, y: number, z: number) => {
    const l = Math.hypot(x, y, z) || 1;
    return [x / l, y / l, z / l] as [number, number, number];
  };

  // The black perch is deliberately almost horizontal: its upper crown remains
  // broad and readable beneath the two feet.
  const branchPath = polyline([
    [-0.75, 0.072, 0],
    [-0.58, 0.092, 0],
    [-0.38, 0.105, 0],
    [-0.18, 0.095, 0],
    [0, 0.09, 0],
    [0.2, 0.096, 0],
    [0.43, 0.108, 0],
    [0.62, 0.091, 0],
    [0.75, 0.072, 0],
  ]);

  b.sweep(branchPath, (t: number) => {
    const edge = Math.min(t, 1 - t) * 2;
    return 0.05 + 0.04 * Math.pow(Math.max(0, edge), 0.72);
  }, {
    color: INK,
    caps: "flat",
    sides: 8,
    smooth: false,
    name: "branchMain",
    group: "branch",
  });

  // Short, angular black twigs. Their ends are kept above the floor so the
  // foliage, rather than the wood, defines the lower silhouette.
  const twigLeft = polyline([
    [-0.39, 0.074, 0.005],
    [-0.43, 0.058, 0.035],
    [-0.51, 0.055, 0.078],
  ]);
  b.sweep(twigLeft, [0.021, 0.012], {
    color: INK,
    caps: "round",
    sides: 6,
    smooth: false,
    name: "twigLeft",
    group: "branch",
  });

  const twigRight = polyline([
    [0.43, 0.106, 0],
    [0.47, 0.132, -0.045],
    [0.56, 0.165, -0.105],
  ]);
  b.sweep(twigRight, [0.021, 0.012], {
    color: INK,
    caps: "round",
    sides: 6,
    smooth: false,
    name: "twigRight",
    group: "branch",
  });

  const twigSmall = polyline([
    [-0.15, 0.094, 0],
    [-0.18, 0.105, -0.055],
    [-0.2, 0.112, -0.092],
  ]);
  b.sweep(twigSmall, [0.017, 0.009], {
    color: INK,
    caps: "round",
    sides: 6,
    smooth: false,
    name: "twigSmall",
    group: "branch",
  });

  const circleOutline = (r: number, segments = 12): [number, number][] => {
    const out: [number, number][] = [];
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      out.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return out;
  };

  const halfCircleOutline = (r: number, flip = false): [number, number][] => {
    const out: [number, number][] = [
      [-r, -r * 0.18],
      [r, -r * 0.18],
    ];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;
      const yy = Math.sin(a) * r * (flip ? -1 : 1);
      out.push([Math.cos(a) * r, yy]);
    }
    return out;
  };

  const leaf = (
    center: readonly number[],
    color: string,
    radius: number,
    across: readonly number[],
    half = false,
    flip = false,
    name = "leaf",
  ) => {
    const x = norm(across[0], across[1], across[2]);
    const outline = half
      ? halfCircleOutline(radius, flip)
      : circleOutline(radius, radius > 0.04 ? 12 : 10);

    b.extrude(outline, {
      at: center,
      x,
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0,
      color,
      name,
      group: "foliage",
    });
  };

  // Four deliberately mismatched primary-colour leaves fan from the left twig.
  const leftTip: [number, number, number] = [-0.51, 0.055, 0.078];
  leaf([-0.555, 0.074, 0.078], RED, 0.047, [-0.98, 0, -0.18], false, false, "leftRedDisc");
  leaf([-0.515, 0.092, 0.083], BLUE, 0.043, [-0.82, 0, 0.57], true, false, "leftBlueHalf");
  leaf([-0.47, 0.078, 0.075], YELLOW, 0.045, [0.82, 0, 0.57], false, false, "leftYellowDisc");
  leaf([-0.505, 0.037, 0.088], CREAM, 0.039, [0.28, 0, 0.96], true, true, "leftCreamHalf");

  // A second small fork makes the left cluster read as foliage rather than a
  // single flower head.
  const leftFork = polyline([
    [-0.485, 0.06, 0.076],
    [-0.45, 0.052, 0.108],
  ]);
  b.sweep(leftFork, [0.011, 0.006], {
    color: INK,
    caps: "round",
    sides: 6,
    smooth: false,
    name: "leftFork",
    group: "branch",
  });
  leaf([-0.435, 0.072, 0.11], CREAM, 0.034, [0.9, 0, 0.2], true, false, "leftForkCream");

  // The upward/backward twig carries a brighter, more open fan.
  leaf([0.585, 0.184, -0.105], BLUE, 0.047, [-0.95, 0, -0.18], false, false, "rightBlueDisc");
  leaf([0.615, 0.177, -0.09], RED, 0.044, [-0.72, 0, 0.7], true, false, "rightRedHalf");
  leaf([0.555, 0.21, -0.095], YELLOW, 0.042, [0.72, 0, 0.7], false, false, "rightYellowDisc");
  leaf([0.585, 0.145, -0.12], CREAM, 0.039, [0.2, 0, 0.98], true, true, "rightCreamHalf");

  // The small rear twig is intentionally simple: one large cream half-disc.
  leaf([-0.2, 0.117, -0.102], CREAM, 0.064, [1, 0, 0.08], true, false, "largeCreamHalf");

  // Tiny black collars at twig/foliage junctions sharpen the graphic cut-paper
  // quality and visually seat every leaf on its stem.
  const collar = (p: readonly number[], r: number, dir: readonly number[], name: string) => {
    b.part(new THREE.CylinderGeometry(r, r * 0.92, 0.014, 8), INK, {
      at: p,
      dir,
      name,
      group: "branch",
    });
  };

  collar(leftTip, 0.025, [0, 1, 0], "leftLeafCollar");
  collar([0.585, 0.184, -0.105], 0.024, [0, 1, 0], "rightLeafCollar");
  collar([-0.2, 0.117, -0.102], 0.026, [0, 1, 0], "smallLeafCollar");

  // Flat cut-face accents on the two branch ends, kept flush with the black
  // wood so they do not read as extra props.
  b.part(new THREE.CircleGeometry(0.048, 10), INK, {
    at: [-0.751, 0.072, 0],
    dir: [-1, 0, 0],
    axis: "z",
    name: "branchCutLeft",
    group: "branch",
  });
  b.part(new THREE.CircleGeometry(0.048, 10), INK, {
    at: [0.751, 0.072, 0],
    dir: [1, 0, 0],
    axis: "z",
    name: "branchCutRight",
    group: "branch",
  });
}
    return buildBranch;
  })(),
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const YELLOW = P.bauhausYellow;
  const BLACK = P.ink;
  const CREAM = P.cream;

  const rod = (a: [number, number, number], c: [number, number, number], radius: number, color: string, bone: any) =>
    b.rod(a, c, radius, { color, bone, section: { ngon: 8 }, caps: "round", name: "legRod" });

  const collar = (at: [number, number, number], radius: number, height: number, color: string, bone: any, name: string) => {
    const part = b.part(
      new THREE.CylinderGeometry(radius, radius, height, 10, 1, false),
      color,
      {
        at,
        bone,
        dir: [0, 1, 0],
        name,
      },
    );
    return part;
  };

  const ring = (at: [number, number, number], major: number, tube: number, color: string, bone: any, name: string) => {
    return b.part(
      new THREE.TorusGeometry(major, tube, 6, 12),
      color,
      {
        at,
        bone,
        dir: [0, 1, 0],
        axis: "z",
        name,
      },
    );
  };

  const claw = (at: [number, number, number], bone: any, name: string) => {
    return b.spike(at, [0, -1, 0], 0.014, 0.0045, {
      color: BLACK,
      bone,
      caps: "point",
      name,
    });
  };

  const buildFoot = (x: number, bone: any, side: string) => {
    const ankle: [number, number, number] = [x, 0.193, 0.008];

    // Three forward toes fan across the top-front of the branch.
    const spreads = [-0.018, 0, 0.018];
    spreads.forEach((spread, i) => {
      const mid: [number, number, number] = [x + spread, 0.178, 0.032 + Math.abs(spread) * 0.35];
      const tip: [number, number, number] = [x + spread * 1.35, 0.171, 0.058 + Math.abs(spread) * 0.2];

      rod(ankle, mid, 0.007, BLACK, bone);
      rod(mid, tip, 0.006, BLACK, bone);
      claw(tip, bone, `toeClaw${side}F${i}`);
    });

    // A rear toe curls over the back of the perch.
    const rearMid: [number, number, number] = [x + 0.004, 0.178, -0.025];
    const rearTip: [number, number, number] = [x - 0.004, 0.171, -0.058];
    rod(ankle, rearMid, 0.007, BLACK, bone);
    rod(rearMid, rearTip, 0.006, BLACK, bone);
    claw(rearTip, bone, `toeClaw${side}Rear`);

    // Tiny central pad gives the toes a deliberate graphic contact point.
    b.part(
      new THREE.SphereGeometry(0.012, 8, 5),
      BLACK,
      {
        at: [x, 0.184, 0.006],
        scale: [1, 0.55, 1.15],
        bone,
        name: `footPad${side}`,
      },
    );
  };

  const buildLeg = (x: number, bone: any, side: string) => {
    // The yellow shank ends just inside the branch top so the black toes visibly grip it.
    rod([x, 0.355, 0], [x, 0.202, 0], 0.02, YELLOW, bone);

    // Bold Bauhaus ankle cuff immediately above the foot.
    collar([x, 0.217, 0], 0.027, 0.018, BLACK, bone, `ankleCuff${side}`);

    // Cream feather trim at the body/leg junction.
    ring([x, 0.348, 0], 0.024, 0.0045, CREAM, bone, `featherCuff${side}`);

    buildFoot(x, bone, side);
  };

  buildLeg(0.055, J.legL, "L");
  buildLeg(-0.055, J.legR, "R");
}
    return buildLegs;
  })(),
  // body
  (() => {
function buildBody({ b, J, P, M }: Ctx) {
  const RED = P.bauhausRed;
  const BLUE = P.bauhausBlue;
  const YELLOW = P.bauhausYellow;
  const INK = P.ink;
  const CREAM = P.cream;
  const WHITE = P.white;

  const V = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]);
  const body = J.body;
  const tailBase = J.tailBase;

  // Egg-shaped torso: broad through the wing sockets, narrowing toward both neck and rump.
  const torso = b.loft(
    [
      { at: [-0.005, 0.405, -0.035], w: 0.235, h: 0.145 },
      { at: [0, 0.445, 0.005], w: 0.335, h: 0.255 },
      { at: [0, 0.505, 0.055], w: 0.305, h: 0.245 },
      { at: [0, 0.555, 0.105], w: 0.205, h: 0.145 },
    ],
    {
      bone: body,
      color: RED,
      section: { ngon: 10 },
      caps: "round",
      name: "body.egg",
      group: "body",
    },
  );

  // A second small red shoulder collar makes the blue head and red egg meet decisively.
  b.part(new THREE.CylinderGeometry(0.095, 0.108, 0.045, 10), RED, {
    bone: body,
    at: [0, 0.555, 0.105],
    dir: [0, 0.25, 1],
    axis: "y",
    name: "body.neckSocket",
    group: "body",
  });

  // Cream breast bib, backed by a slightly larger black silhouette rim.
  const bibOutline: [number, number, "sharp"?][] = [
    [-0.105, 0.045],
    [-0.108, 0.105],
    [-0.098, 0.155],
    [-0.075, 0.195],
    [-0.035, 0.218],
    [0, 0.224],
    [0.035, 0.218],
    [0.075, 0.195],
    [0.098, 0.155],
    [0.108, 0.105],
    [0.105, 0.045],
    [0.065, 0.018],
    [0, 0.005],
    [-0.065, 0.018],
  ];

  const bibRimOutline: [number, number, "sharp"?][] = bibOutline.map(([x, y]) => [
    x * 1.12,
    y * 1.12,
  ]);

  const bibRim = b.extrude(bibRimOutline, {
    at: [0, 0.345, 0.142],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.002,
    smoothing: 1,
    bone: body,
    color: INK,
    name: "body.bibRim",
    group: "body",
  });

  b.extrude(bibOutline, {
    at: [0, 0.348, 0.15],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.014,
    bevel: 0.003,
    smoothing: 1,
    bone: body,
    color: CREAM,
    name: "body.bib",
    group: "body",
  });

  // Small inset black-and-cream geometric bib bars, keeping the panel visibly Bauhaus.
  b.part(new THREE.BoxGeometry(0.105, 0.009, 0.006), INK, {
    bone: body,
    at: [0, 0.405, 0.164],
    name: "body.bibBar",
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.068, 0.008, 0.007), RED, {
    bone: body,
    at: [0, 0.405, 0.169],
    name: "body.bibBarInset",
    group: "body",
  });

  // White circular Bauhaus stamp on the bird's left flank (+X).
  b.part(new THREE.CylinderGeometry(0.021, 0.021, 0.009, 12), WHITE, {
    bone: body,
    at: [0.166, 0.452, 0.018],
    dir: [1, 0, 0],
    axis: "y",
    name: "body.leftCircleStamp",
    group: "body",
  });
  b.part(new THREE.CylinderGeometry(0.010, 0.010, 0.012, 10), RED, {
    bone: body,
    at: [0.172, 0.452, 0.018],
    dir: [1, 0, 0],
    axis: "y",
    name: "body.leftCircleStampCore",
    group: "body",
  });

  // Tail-root collar, aligned with the down-and-back tail axis.
  const tailDir = new THREE.Vector3(0, 0.6, -1).normalize();
  b.part(new THREE.CylinderGeometry(0.061, 0.066, 0.065, 10), BLUE, {
    bone: tailBase,
    at: tailBase.at,
    dir: tailDir,
    axis: "y",
    name: "body.tailBlueCollar",
    group: "tail",
  });

  // Tail fan: a broad black quarter-circle silhouette hanging down and backward.
  const tailX = new THREE.Vector3(1, 0, 0);
  const tailY = tailDir;
  const tailFan: [number, number, "sharp"?][] = [
    [-0.045, -0.015],
    [0.045, -0.015],
    [0.095, 0.045],
    [0.132, 0.115],
    [0.145, 0.19],
    [0.125, 0.255],
    [0.082, 0.292],
    [0.018, 0.305],
    [-0.018, 0.292],
    [-0.032, 0.235],
    [-0.038, 0.155],
    [-0.044, 0.075],
  ];

  const fan = b.extrude(tailFan, {
    at: tailBase.at,
    x: tailX,
    y: tailY,
    thickness: 0.031,
    bevel: 0.002,
    smoothing: 1,
    bone: tailBase,
    color: INK,
    name: "body.tailFan",
    group: "tail",
  });

  // A black central spine gives the fan a clean root-to-tip graphic seam.
  b.part(new THREE.BoxGeometry(0.018, 0.23, 0.012), INK, {
    bone: tailBase,
    at: tailBase.at.clone().add(tailY.clone().multiplyScalar(0.12)).add(new THREE.Vector3(0, 0.002, 0)),
    dir: tailY,
    axis: "y",
    rotation: [0, 0, 0],
    name: "body.tailSpine",
    group: "tail",
  });

  // Yellow wedge laid over the lower/back tip of the black fan.
  const yellowWedge: [number, number, "sharp"?][] = [
    [-0.072, 0.205],
    [0.072, 0.205],
    [0.048, 0.275],
    [0, 0.305],
    [-0.048, 0.275],
  ];

  const fanNormal = new THREE.Vector3().crossVectors(tailX, tailY).normalize();
  const wedgeAt = tailBase.at
    .clone()
    .add(tailY.clone().multiplyScalar(0.004))
    .add(fanNormal.clone().multiplyScalar(0.019));

  b.extrude(yellowWedge, {
    at: wedgeAt,
    x: tailX,
    y: tailY,
    thickness: 0.008,
    bevel: 0.001,
    smoothing: 0,
    bone: tailBase,
    color: YELLOW,
    name: "body.tailYellowWedge",
    group: "tail",
  });

  // Small blue root disk beneath the collar reinforces the tail's graphic joint.
  b.part(new THREE.CylinderGeometry(0.073, 0.073, 0.018, 10), BLUE, {
    bone: tailBase,
    at: tailBase.at.clone().add(tailDir.clone().multiplyScalar(-0.004)),
    dir: tailDir,
    axis: "y",
    name: "body.tailRootDisk",
    group: "tail",
  });

  // A few tiny red graphic bars at the rear of the torso echo the tail palette.
  b.part(new THREE.BoxGeometry(0.075, 0.014, 0.009), RED, {
    bone: body,
    at: [-0.0, 0.421, -0.151],
    name: "body.rumpStripe",
    group: "body",
  });
  b.part(new THREE.BoxGeometry(0.042, 0.012, 0.01), YELLOW, {
    bone: body,
    at: [0, 0.445, -0.158],
    name: "body.rumpAccent",
    group: "body",
  });

  return b.root;
}
    return buildBody;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: any) {
  const BLUE = P.bauhausBlue;
  const RED = P.bauhausRed;
  const BLACK = P.ink;
  const CREAM = P.cream;
  const YELLOW = P.bauhausYellow;

  const wingL = M.shoulderL ?? [0.14, 0.47, 0.04];
  const wingR = M.shoulderR ?? [-0.14, 0.47, 0.04];

  // The drawing plane is vertical and faces sideways. Its local x axis runs
  // toward the tail, while local y remains model-up.
  const backAxis: [number, number, number] = [0, 0, -1];
  const upAxis: [number, number, number] = [0, 1, 0];

  const blueWing: [number, number, "sharp"][] = [
    [0.00, -0.035, "sharp"],
    [0.035, 0.075, "sharp"],
    [0.115, 0.105, "sharp"],
    [0.205, 0.070, "sharp"],
    [0.255, 0.000, "sharp"],
    [0.225, -0.090, "sharp"],
    [0.125, -0.115, "sharp"],
    [0.035, -0.070, "sharp"],
  ];

  const redCrescent: [number, number, "sharp"][] = [
    [0.070, 0.015, "sharp"],
    [0.130, 0.055, "sharp"],
    [0.215, 0.035, "sharp"],
    [0.235, -0.020, "sharp"],
    [0.185, -0.072, "sharp"],
    [0.105, -0.062, "sharp"],
    [0.145, -0.020, "sharp"],
  ];

  const blackTip: [number, number, "sharp"][] = [
    [0.205, -0.090, "sharp"],
    [0.270, -0.025, "sharp"],
    [0.250, -0.105, "sharp"],
  ];

  const creamArc: [number, number, "sharp"][] = [
    [0.018, 0.079, "sharp"],
    [0.062, 0.112, "sharp"],
    [0.132, 0.126, "sharp"],
    [0.202, 0.103, "sharp"],
    [0.205, 0.082, "sharp"],
    [0.135, 0.101, "sharp"],
    [0.070, 0.090, "sharp"],
    [0.022, 0.061, "sharp"],
  ];

  const yellowBadge: [number, number, "sharp"][] = [];
  const badgeRadius = 0.026;
  const badgeCenter = [0.108, -0.005];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    yellowBadge.push([
      badgeCenter[0] + Math.cos(a) * badgeRadius,
      badgeCenter[1] + Math.sin(a) * badgeRadius,
      "sharp",
    ]);
  }

  const addWing = (
    side: number,
    root: readonly number[],
    bone: any,
    suffix: string,
  ) => {
    const outer = root[0] + side * 0.012;

    // Broad blue half-disc foundation.
    b.extrude(blueWing, {
      at: [outer, root[1], root[2]],
      x: backAxis,
      y: upAxis,
      thickness: 0.032,
      bevel: 0.002,
      smoothing: 0,
      color: BLUE,
      bone,
      name: `wing${suffix}Blue`,
      group: "wings",
    });

    // A second, slightly proud blue shoulder plate makes the root read as
    // layered rather than pasted onto the body.
    b.extrude(
      [
        [0.000, 0.005, "sharp"],
        [0.040, 0.064, "sharp"],
        [0.085, 0.082, "sharp"],
        [0.105, 0.050, "sharp"],
        [0.075, 0.020, "sharp"],
        [0.020, -0.010, "sharp"],
      ],
      {
        at: [outer + side * 0.008, root[1], root[2] + 0.002],
        x: backAxis,
        y: upAxis,
        thickness: 0.038,
        bevel: 0.0015,
        smoothing: 0,
        color: BLUE,
        bone,
        name: `wing${suffix}Shoulder`,
        group: "wings",
      },
    );

    // Red lower-rear crescent.
    b.extrude(redCrescent, {
      at: [outer + side * 0.027, root[1], root[2] - 0.006],
      x: backAxis,
      y: upAxis,
      thickness: 0.026,
      bevel: 0.0015,
      smoothing: 0,
      color: RED,
      bone,
      name: `wing${suffix}RedCrescent`,
      group: "wings",
    });

    // Crisp ink triangular feather tip.
    b.extrude(blackTip, {
      at: [outer + side * 0.043, root[1], root[2] - 0.008],
      x: backAxis,
      y: upAxis,
      thickness: 0.024,
      bevel: 0.001,
      smoothing: 0,
      color: BLACK,
      bone,
      name: `wing${suffix}InkTip`,
      group: "wings",
    });

    // Cream arc at the shoulder/top seam.
    b.extrude(creamArc, {
      at: [outer + side * 0.049, root[1], root[2] + 0.003],
      x: backAxis,
      y: upAxis,
      thickness: 0.010,
      bevel: 0.001,
      smoothing: 0,
      color: CREAM,
      bone,
      name: `wing${suffix}CreamArc`,
      group: "wings",
    });

    // Bauhaus yellow circle stamp on each folded wing.
    b.extrude(yellowBadge, {
      at: [outer + side * 0.056, root[1], root[2] + 0.004],
      x: backAxis,
      y: upAxis,
      thickness: 0.008,
      bevel: 0.001,
      smoothing: 0,
      color: YELLOW,
      bone,
      name: `wing${suffix}YellowStamp`,
      group: "wings",
    });

    // Tiny black separator studs emphasize the stacked construction.
    const studGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.008, 8);
    for (let i = 0; i < 3; i++) {
      const u = 0.052 + i * 0.055;
      b.part(studGeo, BLACK, {
        at: [outer + side * 0.062, root[1] + 0.086 - i * 0.008, root[2] - u],
        dir: [side, 0, 0],
        axis: "y",
        bone,
        name: `wing${suffix}Stud${i}`,
        group: "wings",
      });
    }
  };

  addWing(1, wingL, J.wingL, "L");
  addWing(-1, wingR, J.wingR, "R");
}
    return buildWings;
  })(),
  // head
  (() => {
function buildHead({ b, J, P, M }: Ctx) {
  const head = J.head;
  const BLUE = P.bauhausBlue;
  const YELLOW = P.bauhausYellow;
  const RED = P.bauhausRed;
  const INK = P.ink;
  const WHITE = P.white;

  const headCenter: [number, number, number] = [0, 0.62, 0.20];

  // Blue geometric head ball.
  b.part(new THREE.SphereGeometry(0.115, 16, 10), BLUE, {
    bone: head,
    at: headCenter,
    name: "headBall",
  });

  // Red collar, slightly buried into the lower edge of the blue ball and the torso.
  b.part(new THREE.CylinderGeometry(0.087, 0.087, 0.038, 12), RED, {
    bone: head,
    at: [0, 0.558, 0.145],
    name: "redNeckCollar",
  });

  // A thin dark collar line gives the red neck ring a crisp Bauhaus separation.
  b.part(new THREE.CylinderGeometry(0.091, 0.091, 0.009, 12), INK, {
    bone: head,
    at: [0, 0.581, 0.145],
    name: "collarInkEdge",
  });

  const eyeGeometry = new THREE.CircleGeometry(0.043, 20);
  const highlightGeometry = new THREE.CircleGeometry(0.012, 12);

  // Face first: wide-set black eye discs with clean white offset highlights.
  for (const side of [-1, 1]) {
    const eyeX = side * 0.064;

    b.part(eyeGeometry, INK, {
      bone: head,
      at: [eyeX, 0.642, 0.296],
      dir: [0, 0, 1],
      axis: "z",
      name: side < 0 ? "eyeR" : "eyeL",
    });

    b.part(highlightGeometry, WHITE, {
      bone: head,
      at: [eyeX - side * 0.009, 0.659, 0.3005],
      dir: [0, 0, 1],
      axis: "z",
      name: side < 0 ? "eyeHighlightR" : "eyeHighlightL",
    });
  }

  // Four-sided yellow cone beak, pointing directly toward +Z.
  b.part(new THREE.ConeGeometry(0.036, 0.092, 4), YELLOW, {
    bone: head,
    at: [0, 0.614, 0.344],
    dir: [0, 0, 1],
    axis: "y",
    rotation: [0, 45, 0],
    name: "yellowTriangleBeak",
  });

  // Narrow black basal band where the beak meets the blue face.
  b.part(new THREE.CylinderGeometry(0.039, 0.039, 0.012, 8), INK, {
    bone: head,
    at: [0, 0.614, 0.299],
    dir: [0, 0, 1],
    axis: "y",
    name: "beakBaseBand",
  });

  // Three black-edged semicircle crest fins.
  const crestShape = (halfWidth: number, height: number) => {
    const points: [number, number][] = [[-halfWidth, 0], [halfWidth, 0]];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI * (i / steps);
      points.push([
        Math.cos(a) * halfWidth,
        Math.sin(a) * height,
      ]);
    }
    return points;
  };

  const crestXs = [-0.043, 0, 0.043];
  for (let i = 0; i < crestXs.length; i++) {
    const x = crestXs[i];

    b.extrude(crestShape(0.027, 0.060), {
      bone: head,
      at: [x, 0.690, 0.198],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: INK,
      name: `crestEdge${i + 1}`,
    });

    b.extrude(crestShape(0.021, 0.050), {
      bone: head,
      at: [x, 0.693, 0.204],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.009,
      color: YELLOW,
      name: `yellowCrest${i + 1}`,
    });
  }
}
    return buildHead;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "bauhausSongbird" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.4,0], dir: [0,1,0], role: "spine" });
  J["head"] = b.joint("head", { parent: J["body"], at: [0,0.56,0.14], dir: [0,0.35,1], role: "head" });
  J["tailBase"] = b.joint("tailBase", { parent: J["body"], at: [0,0.42,-0.4], dir: [0,0.6,-1], role: "tail" });
  J["legL"] = b.joint("legL", { parent: J["body"], at: [0.055,0.36,0], dir: [0,-1,0], role: "leg" });
  J["legR"] = b.joint("legR", { parent: J["body"], at: [-0.055,0.36,0], dir: [0,-1,0], role: "leg" });
  J["wingL"] = b.joint("wingL", { parent: J["body"], at: [0.14,0.47,0.04], dir: [1,0.1,0], role: "wing" });
  J["wingR"] = b.joint("wingR", { parent: J["body"], at: [-0.14,0.47,0.04], dir: [-1,0.1,0], role: "wing" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

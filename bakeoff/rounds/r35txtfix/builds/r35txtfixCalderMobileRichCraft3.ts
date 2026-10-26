import * as THREE from "three";
import { createBuilder, catmull, polyline, rng, spiral, svg } from "../../../../src/index";
import type { Fill, OutlinePoint } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile of black wire, hand-cut biomorphic plates, bright primary colors, balance arms, loops, beads, and painted graphic marks.",
};

type Builder = ReturnType<typeof createBuilder>;
type BoneRef = any;
type CableRole = "spine" | "fan" | "hinge" | "tentacle";

const GROUP = "calder-mobile";

const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);

const BLACK = cel("#201923", "#08070c");
const RED = cel("#db383e", "#831d2b");
const YELLOW = cel("#efbd32", "#a96419");
const BLUE = cel("#3179b5", "#174b82");
const TURQUOISE = cel("#3bb6a5", "#176e6b");
const PINK = cel("#df6682", "#8d2d4b");
const CREAM = cel("#f0dfab", "#ae956d");
const BRASS = cel("#c89b43", "#68471f");

const WIRE = BLACK;
const DARK = INK;

const LEAF: OutlinePoint[] = [
  [0, 0.29, "sharp"],
  [0.13, 0.19],
  [0.2, 0.04],
  [0.12, -0.14],
  [0, -0.28, "sharp"],
  [-0.12, -0.15],
  [-0.2, 0.02],
  [-0.13, 0.19],
];

const COMMA: OutlinePoint[] = [
  [-0.18, -0.22],
  [-0.02, -0.27],
  [0.13, -0.19],
  [0.2, -0.04],
  [0.16, 0.13],
  [0.05, 0.24],
  [-0.1, 0.23],
  [-0.19, 0.12],
  [-0.11, 0.07],
  [-0.01, 0.11],
  [0.08, 0.05],
  [0.09, -0.05],
  [0.02, -0.14],
  [-0.1, -0.14],
];

const FAN: OutlinePoint[] = [
  [-0.25, -0.2],
  [0.04, -0.2],
  [0.24, -0.06, "sharp"],
  [0.13, 0.02],
  [0.25, 0.16, "sharp"],
  [-0.04, 0.24],
  [-0.23, 0.14],
  [-0.1, 0],
];

const SPIKE: OutlinePoint[] = [
  [-0.18, -0.2],
  [0.1, -0.15],
  [0.26, 0.02, "sharp"],
  [0.08, 0.08],
  [0.18, 0.25, "sharp"],
  [-0.03, 0.14],
  [-0.2, 0.2],
  [-0.1, 0.02],
];

const CRESCENT: OutlinePoint[] = [
  [-0.2, -0.21],
  [-0.03, -0.27],
  [0.13, -0.2],
  [0.2, -0.05],
  [0.16, 0.13],
  [0.05, 0.24],
  [-0.1, 0.22],
  [-0.2, 0.1],
  [-0.11, 0.07],
  [-0.02, 0.11],
  [0.07, 0.05],
  [0.08, -0.05],
  [0.01, -0.14],
  [-0.1, -0.14],
];

const ARROW: OutlinePoint[] = [
  [-0.25, -0.16],
  [0.06, -0.16],
  [0.25, 0, "sharp"],
  [0.06, 0.18],
  [-0.25, 0.18],
  [-0.09, 0.02],
];

const PETAL: OutlinePoint[] = [
  [0, 0.25, "sharp"],
  [0.16, 0.11],
  [0.18, -0.05],
  [0.06, -0.24, "sharp"],
  [-0.11, -0.15],
  [-0.19, 0.03],
  [-0.11, 0.16],
];

const TARGET = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="38" fill="none" stroke="#211923" stroke-width="7"/>
    <circle cx="50" cy="50" r="21" fill="none" stroke="#f5e2a5" stroke-width="5"/>
    <circle cx="50" cy="50" r="7" fill="#211923"/>
  </svg>`,
  { size: 192 },
);

const RAYS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g stroke="#211923" stroke-width="5" stroke-linecap="round">
      <path d="M50 50 L50 10"/>
      <path d="M50 50 L82 25"/>
      <path d="M50 50 L91 54"/>
      <path d="M50 50 L73 86"/>
      <path d="M50 50 L20 78"/>
      <path d="M50 50 L9 45"/>
      <path d="M50 50 L25 16"/>
    </g>
    <circle cx="50" cy="50" r="9" fill="#f1dfaa"/>
  </svg>`,
  { size: 192 },
);

const SWOOP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M12 67 C30 12 66 15 88 37 C68 31 52 43 42 70 C34 88 21 86 12 67Z" fill="#211923"/>
    <path d="M26 66 C38 39 55 29 73 32" fill="none" stroke="#f3dfa5" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const DOTS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g fill="#211923">
      <circle cx="24" cy="25" r="7"/>
      <circle cx="51" cy="18" r="4"/>
      <circle cx="76" cy="30" r="8"/>
      <circle cx="34" cy="54" r="4"/>
      <circle cx="66" cy="58" r="6"/>
      <circle cx="22" cy="80" r="5"/>
      <circle cx="53" cy="82" r="8"/>
      <circle cx="83" cy="78" r="3"/>
    </g>
  </svg>`,
  { size: 160 },
);

const CROSS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M44 10 H58 V41 H90 V57 H58 V90 H42 V57 H10 V41 H42Z" fill="#211923"/>
    <circle cx="50" cy="49" r="8" fill="#f2dfa6"/>
  </svg>`,
  { size: 160 },
);

const DASH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M16 28 Q39 9 83 23" fill="none" stroke="#211923" stroke-width="7" stroke-linecap="round"/>
    <path d="M16 52 Q41 33 84 46" fill="none" stroke="#211923" stroke-width="7" stroke-linecap="round"/>
    <path d="M16 76 Q41 57 79 69" fill="none" stroke="#f5e2a5" stroke-width="5" stroke-linecap="round"/>
  </svg>`,
  { size: 160 },
);

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function horizontal(angle: number) {
  return new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).normalize();
}

function scaleOutline(outline: readonly OutlinePoint[], scale: number): OutlinePoint[] {
  return outline.map((point) =>
    point[2] === "sharp"
      ? [point[0] * scale, point[1] * scale, "sharp"]
      : [point[0] * scale, point[1] * scale],
  ) as OutlinePoint[];
}

type Cable = {
  name: string;
  chain: any;
  radius: number;
  beads: boolean;
};

function addCable(
  b: Builder,
  cables: Cable[],
  name: string,
  points: THREE.Vector3[],
  parent: BoneRef,
  role: CableRole,
  radius: number,
  smooth: boolean,
  beads = false,
) {
  const names = points.map((_, i) => {
    if (i === 0) return `${name}Root`;
    if (i === points.length - 1) return `${name}Tip`;
    return `${name}${i}`;
  });

  const path = smooth ? catmull(points) : polyline(points);
  const chain = b.chain(name, path, {
    parent,
    names,
    role,
    group: GROUP,
  });

  cables.push({ name, chain, radius, beads });
  return chain;
}

function addHub(b: Builder, joint: any, radius: number, color: ColorInput, name: string) {
  return b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
    bone: joint,
    at: joint.at,
    group: GROUP,
    name,
    flat: true,
  });
}

function addWireLoop(
  b: Builder,
  name: string,
  center: THREE.Vector3,
  u: THREE.Vector3,
  w: THREE.Vector3,
  radius: number,
  bone: BoneRef,
  thickness = 0.005,
) {
  const points: THREE.Vector3[] = [];
  const uu = u.clone().normalize();
  const ww = w.clone().normalize();

  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    points.push(
      center
        .clone()
        .addScaledVector(uu, Math.cos(a) * radius)
        .addScaledVector(ww, Math.sin(a) * radius),
    );
  }

  return b.sweep(polyline(points, { closed: true }), thickness, {
    color: WIRE,
    bone,
    caps: "none",
    section: { ngon: 6 },
    group: GROUP,
    name,
  });
}

function addStud(
  b: Builder,
  part: any,
  center: THREE.Vector3,
  normal: THREE.Vector3,
  desired: THREE.Vector3,
  color: Fill,
  name: string,
  radius = 0.014,
) {
  const origin = desired.clone().addScaledVector(normal, 0.35);
  const hit = b.surface(part).ray(origin, normal.clone().multiplyScalar(-1));
  if (!hit) return null;

  return b.stick(new THREE.SphereGeometry(radius, 7, 5), color, hit, {
    embed: 0.25,
    group: GROUP,
    name,
    flat: true,
  });
}

type PlateOptions = {
  scale?: number;
  thickness?: number;
  texture?: THREE.Texture;
  markSize?: [number, number];
  bevel?: number;
  smoothing?: number;
};

function makePlate(
  b: Builder,
  name: string,
  center: THREE.Vector3,
  bone: BoneRef,
  outline: readonly OutlinePoint[],
  color: ColorInput,
  xDirection: THREE.Vector3,
  options: PlateOptions = {},
) {
  const scale = options.scale ?? 1;
  const thickness = options.thickness ?? 0.024;
  const x = xDirection.clone().normalize();
  const y = UP.clone();
  const normal = x.clone().cross(y).normalize();

  const part = b.extrude(scaleOutline(outline, scale), {
    at: center,
    bone,
    x,
    y,
    thickness,
    bevel: options.bevel ?? 0.007,
    smoothing: options.smoothing ?? 1,
    color,
    group: GROUP,
    name,
  });

  if (options.texture) {
    b.decal(part, options.texture, {
      at: center.clone().addScaledVector(normal, thickness * 0.5 + 0.002),
      dir: normal,
      up: y,
      size: options.markSize ?? [0.22 * scale, 0.22 * scale],
      lift: 0.0015,
      segments: 10,
      group: GROUP,
      name: `${name}Mark`,
    });
  }

  return {
    part,
    center,
    x,
    y,
    normal,
    thickness,
    scale,
  };
}

function makeDisk(
  b: Builder,
  name: string,
  center: THREE.Vector3,
  bone: BoneRef,
  radius: number,
  thickness: number,
  color: ColorInput,
  normal: THREE.Vector3,
  texture?: THREE.Texture,
  markSize = radius * 1.55,
) {
  const n = normal.clone().normalize();
  const part = b.part(new THREE.CylinderGeometry(radius, radius, thickness, 16, 1), color, {
    bone,
    at: center,
    dir: n,
    up: UP,
    group: GROUP,
    name,
    flat: true,
  });

  if (texture) {
    b.decal(part, texture, {
      at: center.clone().addScaledVector(n, thickness * 0.5 + 0.002),
      dir: n,
      up: UP,
      size: [markSize, markSize],
      lift: 0.0015,
      segments: 12,
      group: GROUP,
      name: `${name}Mark`,
    });
  }

  addStud(
    b,
    part,
    center,
    n,
    center.clone().addScaledVector(n, thickness * 0.5),
    DARK,
    `${name}Hub`,
    radius * 0.14,
  );

  return {
    part,
    center,
    normal: n,
    x: horizontal(0),
    y: UP.clone(),
    thickness,
    radius,
  };
}

function addFinial(
  b: Builder,
  name: string,
  at: THREE.Vector3,
  bone: BoneRef,
  color: ColorInput,
  axis: THREE.Vector3 = new THREE.Vector3(0, -1, 0),
) {
  return b.lathe(
    [
      [0, 0],
      [0.022, 0],
      [0.04, 0.014],
      [0.035, 0.045],
      [0.016, 0.078],
      [0, 0.092],
    ],
    {
      at,
      bone,
      axis,
      segments: 8,
      smoothing: 1,
      color,
      group: GROUP,
      name,
    },
  );
}

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "calder-hanging-mobile",
    detail: 1,
    paintSize: 1024,
  });

  const cables: Cable[] = [];

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: a single suspension root, then a hierarchy of balancing arms and hanging drops.

  const suspension = b.joint("suspension", {
    at: [0, 2.68, 0],
    dir: [0, -1, 0],
    role: "spine",
    group: GROUP,
  });

  const hook = addCable(
    b,
    cables,
    "hook",
    [
      v(0, 2.68, 0),
      v(0.01, 2.79, 0),
      v(0.09, 2.9, 0),
      v(0.2, 2.95, 0),
      v(0.28, 2.89, 0),
      v(0.27, 2.8, 0),
    ],
    suspension,
    "hinge",
    0.011,
    true,
  );

  const mast = addCable(
    b,
    cables,
    "mast",
    [v(0, 2.68, 0), v(0, 2.49, 0.015), v(0, 2.31, 0)],
    suspension,
    "spine",
    0.01,
    false,
    true,
  );

  const upperLeft = addCable(
    b,
    cables,
    "upperLeft",
    [v(0, 2.31, 0), v(-0.27, 2.37, 0.045), v(-0.78, 2.31, 0.16)],
    mast.tip,
    "fan",
    0.008,
    true,
    true,
  );

  const upperRight = addCable(
    b,
    cables,
    "upperRight",
    [v(0, 2.31, 0), v(0.33, 2.27, -0.045), v(0.78, 2.2, -0.02)],
    mast.tip,
    "fan",
    0.008,
    true,
    true,
  );

  const upperLeftDrop = addCable(
    b,
    cables,
    "upperLeftDrop",
    [v(-0.78, 2.31, 0.16), v(-0.8, 2.12, 0.16), v(-0.76, 1.94, 0.14)],
    upperLeft.tip,
    "tentacle",
    0.007,
    false,
  );

  const upperRightDrop = addCable(
    b,
    cables,
    "upperRightDrop",
    [v(0.78, 2.2, -0.02), v(0.82, 1.97, -0.035), v(0.78, 1.75, -0.09)],
    upperRight.tip!,
    "tentacle",
    0.007,
    false,
  );

  const middleDrop = addCable(
    b,
    cables,
    "middleDrop",
    [v(0, 2.31, 0), v(-0.015, 2.14, 0.015), v(0, 1.98, 0.05)],
    mast.tip,
    "tentacle",
    0.008,
    false,
    true,
  );

  const middleLeft = addCable(
    b,
    cables,
    "middleLeft",
    [v(0, 1.98, 0.05), v(-0.34, 2.01, 0.2), v(-0.85, 1.9, 0.3)],
    middleDrop.tip,
    "fan",
    0.008,
    true,
    true,
  );

  const middleRight = addCable(
    b,
    cables,
    "middleRight",
    [v(0, 1.98, 0.05), v(0.3, 1.91, -0.16), v(0.92, 1.95, -0.25)],
    middleDrop.tip,
    "fan",
    0.008,
    true,
    true,
  );

  const middleLeftDrop = addCable(
    b,
    cables,
    "middleLeftDrop",
    [v(-0.85, 1.9, 0.3), v(-0.86, 1.68, 0.3), v(-0.84, 1.54, 0.3)],
    middleLeft.tip,
    "tentacle",
    0.007,
    false,
  );

  const middleRightDrop = addCable(
    b,
    cables,
    "middleRightDrop",
    [v(0.92, 1.95, -0.25), v(0.94, 1.7, -0.25), v(0.9, 1.55, -0.27)],
    middleRight.tip,
    "tentacle",
    0.007,
    false,
  );

  const lowerDrop = addCable(
    b,
    cables,
    "lowerDrop",
    [v(0, 1.98, 0.05), v(0, 1.77, 0.06), v(0, 1.58, 0.08)],
    middleDrop.tip,
    "tentacle",
    0.008,
    false,
    true,
  );

  const lowerLeft = addCable(
    b,
    cables,
    "lowerLeft",
    [v(0, 1.58, 0.08), v(-0.27, 1.53, 0.18), v(-0.63, 1.4, 0.37)],
    lowerDrop.tip,
    "fan",
    0.008,
    true,
    true,
  );

  const lowerRight = addCable(
    b,
    cables,
    "lowerRight",
    [v(0, 1.58, 0.08), v(0.34, 1.61, -0.05), v(0.73, 1.49, -0.45)],
    lowerDrop.tip,
    "fan",
    0.008,
    true,
    true,
  );

  const frontArm = addCable(
    b,
    cables,
    "frontArm",
    [v(0, 1.58, 0.08), v(0.12, 1.45, 0.3), v(0.31, 1.33, 0.57)],
    lowerDrop.tip,
    "fan",
    0.007,
    true,
    true,
  );

  const bottomDrop = addCable(
    b,
    cables,
    "bottomDrop",
    [v(0, 1.58, 0.08), v(0, 1.21, 0.1), v(0, 0.8, 0.12)],
    lowerDrop.tip,
    "tentacle",
    0.008,
    false,
  );

  const lowerLeftDrop = addCable(
    b,
    cables,
    "lowerLeftDrop",
    [v(-0.63, 1.4, 0.37), v(-0.64, 1.17, 0.37), v(-0.62, 1.08, 0.37)],
    lowerLeft.tip,
    "tentacle",
    0.0065,
    false,
  );

  const lowerRightDrop = addCable(
    b,
    cables,
    "lowerRightDrop",
    [v(0.73, 1.49, -0.45), v(0.74, 1.25, -0.45), v(0.72, 1.13, -0.45)],
    lowerRight.tip,
    "tentacle",
    0.0065,
    false,
  );

  const frontDrop = addCable(
    b,
    cables,
    "frontDrop",
    [v(0.31, 1.33, 0.57), v(0.31, 1.08, 0.57), v(0.29, 0.92, 0.57)],
    frontArm.tip,
    "tentacle",
    0.006,
    false,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Wire skin, balance hubs, and small deterministic beads.

  const beadRng = rng(7314);

  for (const cable of cables) {
    b.sweep(cable.chain, cable.radius, {
      color: WIRE,
      section: { ngon: 6 },
      caps: "round",
      skin: "smooth",
      group: GROUP,
      name: `${cable.name}Wire`,
    });

    for (let i = 0; i < cable.chain.joints.length; i++) {
      const joint = cable.chain.joints[i];
      if (i === 0 && cable.name !== "mast" && cable.name !== "hook") continue;
      addHub(
        b,
        joint,
        cable.radius * 1.65,
        i % 3 === 0 ? BRASS : WIRE,
        `${cable.name}Hub${i}`,
      );
    }

    if (cable.beads) {
      let beadIndex = 0;
      b.along(cable.chain, 3, (at: any) => {
        const radius = 0.0075 + beadRng() * 0.0035;
        const color = beadIndex++ % 2 === 0 ? BRASS : WIRE;
        return b.stick(
          new THREE.SphereGeometry(radius, 7, 5),
          color,
          at,
          {
            embed: 0.1,
            group: GROUP,
            name: `${cable.name}Bead${beadIndex}`,
            flat: true,
          },
        );
      });
    }
  }

  addFinial(b, "suspensionFinial", suspension.at, suspension, BRASS);

  // A short spring-like scribble wraps the central drop, a distinctly Calder-like bit of wire punctuation.
  const centralCoil = spiral(
    v(0.07, 1.86, 0.08),
    v(0.07, 1.86, 0.08).add(new THREE.Vector3(0.055, 0, 0)),
    v(0, -0.24, 0),
    { turns: 2.5, pitch: 0.09 },
  );
  b.sweep(centralCoil, 0.0042, {
    color: WIRE,
    bone: middleDrop.tip,
    section: { ngon: 5 },
    caps: "round",
    group: GROUP,
    name: "centralCoil",
  });

  // Small beads orbit a pivot rather than merely filling it.
  let pivotBead = 0;
  b.ring(
    middleDrop.tip,
    {
      count: 8,
      radius: 0.052,
      fromDeg: 0,
      toDeg: 360,
      name: "pivotBeads",
      role: "fan",
      group: GROUP,
    },
    (item: any) =>
      b.stick(
        new THREE.SphereGeometry(0.0085, 7, 5),
        pivotBead++ % 2 ? YELLOW : BRASS,
        item,
        {
          embed: 0.15,
          group: GROUP,
          name: `pivotBead${pivotBead}`,
          flat: true,
        },
      ),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Painted sheet-metal forms.

  const blueLeaf = makePlate(
    b,
    "blueLeaf",
    upperLeftDrop.tip.at.clone().add(v(0, -0.12, 0)),
    upperLeftDrop.tip,
    LEAF,
    BLUE,
    horizontal(0.12),
    {
      scale: 0.92,
      texture: TARGET,
      markSize: [0.16, 0.2],
      thickness: 0.026,
    },
  );

  const yellowComma = makePlate(
    b,
    "yellowComma",
    upperRightDrop.tip.at.clone().add(v(0, -0.13, 0)),
    upperRightDrop.tip,
    COMMA,
    YELLOW,
    horizontal(-0.18),
    {
      scale: 0.86,
      texture: RAYS,
      markSize: [0.15, 0.17],
      thickness: 0.025,
    },
  );

  const redDisk = makeDisk(
    b,
    "redDisk",
    middleLeftDrop.tip.at.clone().add(v(0, -0.13, 0)),
    middleLeftDrop.tip,
    0.18,
    0.027,
    RED,
    FRONT,
    TARGET,
    0.23,
  );

  const turquoiseSpike = makePlate(
    b,
    "turquoiseSpike",
    middleRightDrop.tip.at.clone().add(v(0, -0.13, 0)),
    middleRightDrop.tip,
    SPIKE,
    TURQUOISE,
    horizontal(-0.3),
    {
      scale: 0.9,
      texture: SWOOP,
      markSize: [0.18, 0.2],
      thickness: 0.025,
    },
  );

  const yellowFan = makePlate(
    b,
    "yellowFan",
    lowerLeftDrop.tip.at.clone().add(v(0, -0.13, 0)),
    lowerLeftDrop.tip,
    FAN,
    YELLOW,
    horizontal(0.23),
    {
      scale: 0.84,
      texture: DOTS,
      markSize: [0.18, 0.17],
      thickness: 0.026,
    },
  );

  const redCrescent = makePlate(
    b,
    "redCrescent",
    lowerRightDrop.tip.at.clone().add(v(0, -0.13, 0)),
    lowerRightDrop.tip,
    CRESCENT,
    RED,
    horizontal(-0.38),
    {
      scale: 1.02,
      texture: SWOOP,
      markSize: [0.17, 0.2],
      thickness: 0.026,
    },
  );

  const pinkPetal = makePlate(
    b,
    "pinkPetal",
    frontDrop.tip.at.clone().add(v(0, -0.12, 0)),
    frontDrop.tip,
    PETAL,
    PINK,
    horizontal(0.18),
    {
      scale: 0.64,
      texture: CROSS,
      markSize: [0.12, 0.14],
      thickness: 0.022,
    },
  );

  const bottomBlue = makePlate(
    b,
    "bottomBlue",
    bottomDrop.tip.at.clone().add(v(0, -0.15, 0)),
    bottomDrop.tip,
    CRESCENT,
    BLUE,
    horizontal(0.08),
    {
      scale: 0.94,
      texture: TARGET,
      markSize: [0.17, 0.2],
      thickness: 0.028,
    },
  );

  // A cream disc and a small black arrow create a visual counterweight on the lowest branch.
  const creamDisc = makeDisk(
    b,
    "creamDisc",
    bottomDrop.tip.at.clone().add(v(0.22, -0.24, 0.03)),
    bottomDrop.tip,
    0.105,
    0.022,
    CREAM,
    FRONT,
    DASH,
    0.13,
  );

  const arrowPlate = makePlate(
    b,
    "blackArrow",
    upperLeftDrop.tip.at.clone().add(v(0.14, -0.3, -0.12)),
    upperLeftDrop.tip,
    ARROW,
    BLACK,
    horizontal(-0.2),
    {
      scale: 0.58,
      texture: CROSS,
      markSize: [0.12, 0.1],
      thickness: 0.018,
      bevel: 0.004,
    },
  );

  // Rivet-like studs are seated by surface rays, so they remain genuinely attached to the painted plates.
  addStud(
    b,
    redDisk.part,
    redDisk.center,
    redDisk.normal,
    redDisk.center.clone().add(v(-0.09, 0.075, 0.02)),
    BRASS,
    "redDiskRivetA",
    0.012,
  );
  addStud(
    b,
    redDisk.part,
    redDisk.center,
    redDisk.normal,
    redDisk.center.clone().add(v(0.085, -0.055, 0.02)),
    BRASS,
    "redDiskRivetB",
    0.012,
  );
  addStud(
    b,
    yellowFan.part,
    yellowFan.center,
    yellowFan.normal,
    yellowFan.center.clone().add(v(-0.11, -0.05, 0.02)),
    DARK,
    "yellowFanRivet",
    0.011,
  );
  addStud(
    b,
    bottomBlue.part,
    bottomBlue.center,
    bottomBlue.normal,
    bottomBlue.center.clone().add(v(0.08, 0.06, 0.02)),
    BRASS,
    "bottomBlueRivet",
    0.012,
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Loose wire contours: asymmetrical halos around the plates make the sculpture read as assembled wire and metal.

  addWireLoop(
    b,
    "blueLeafContour",
    blueLeaf.center.clone().addScaledVector(blueLeaf.normal, 0.036),
    blueLeaf.x,
    blueLeaf.y,
    0.155,
    upperLeftDrop.tip,
    0.0045,
  );

  addWireLoop(
    b,
    "yellowCommaContour",
    yellowComma.center.clone().addScaledVector(yellowComma.normal, 0.035),
    yellowComma.x,
    yellowComma.y,
    0.142,
    upperRightDrop.tip,
    0.0045,
  );

  addWireLoop(
    b,
    "redDiskContour",
    redDisk.center.clone().addScaledVector(redDisk.normal, 0.034),
    horizontal(0),
    UP,
    0.207,
    middleLeftDrop.tip,
    0.0048,
  );

  addWireLoop(
    b,
    "turquoiseContour",
    turquoiseSpike.center.clone().addScaledVector(turquoiseSpike.normal, 0.035),
    turquoiseSpike.x,
    turquoiseSpike.y,
    0.14,
    middleRightDrop.tip,
    0.0043,
  );

  addWireLoop(
    b,
    "yellowFanContour",
    yellowFan.center.clone().addScaledVector(yellowFan.normal, 0.037),
    yellowFan.x,
    yellowFan.y,
    0.17,
    lowerLeftDrop.tip,
    0.0045,
  );

  addWireLoop(
    b,
    "redCrescentContour",
    redCrescent.center.clone().addScaledVector(redCrescent.normal, 0.036),
    redCrescent.x,
    redCrescent.y,
    0.155,
    lowerRightDrop.tip,
    0.0045,
  );

  addWireLoop(
    b,
    "pinkPetalContour",
    pinkPetal.center.clone().addScaledVector(pinkPetal.normal, 0.03),
    pinkPetal.x,
    pinkPetal.y,
    0.09,
    frontDrop.tip,
    0.004,
  );

  addWireLoop(
    b,
    "bottomBlueContour",
    bottomBlue.center.clone().addScaledVector(bottomBlue.normal, 0.037),
    bottomBlue.x,
    bottomBlue.y,
    0.17,
    bottomDrop.tip,
    0.0048,
  );

  // A few secondary loops sit in different planes, giving the mobile depth when the viewer circles it.
  addWireLoop(
    b,
    "upperDepthLoop",
    v(-0.36, 2.24, 0.22),
    new THREE.Vector3(0, 0, 1),
    UP,
    0.105,
    upperLeft.tip,
    0.0042,
  );

  addWireLoop(
    b,
    "middleDepthLoop",
    v(0.42, 1.78, -0.27),
    new THREE.Vector3(0, 0, 1),
    UP,
    0.12,
    middleRight.tip,
    0.0042,
  );

  addWireLoop(
    b,
    "lowerDepthLoop",
    v(-0.28, 1.2, 0.48),
    horizontal(0.2),
    new THREE.Vector3(0, 0, 1),
    0.105,
    lowerLeft.tip,
    0.0042,
  );

  // Small turned counterweights are intentionally placed at a few arm ends, like Calder's weighted punctuation.
  addFinial(b, "upperLeftWeight", upperLeft.tip.at.clone().add(v(0, -0.012, 0)), upperLeft.tip, BRASS);
  addFinial(b, "upperRightWeight", upperRight.tip.at.clone().add(v(0, -0.012, 0)), upperRight.tip, BRASS);
  addFinial(b, "middleRightWeight", middleRight.tip.at.clone().add(v(0, -0.012, 0)), middleRight.tip, CREAM);
  addFinial(b, "lowerRightWeight", lowerRight.tip.at.clone().add(v(0, -0.012, 0)), lowerRight.tip, BRASS);

  // Add a few thin colored balancing rods behind the main silhouettes.
  b.rod(
    v(-0.78, 2.27, 0.16),
    v(-0.46, 2.12, 0.2),
    0.004,
    RED,
    {
      bone: upperLeft.tip!,
      group: GROUP,
      name: "upperLeftColorRod",
      section: { ngon: 5 },
    },
  );

  b.rod(
    v(0.78, 2.16, -0.02),
    v(0.49, 1.97, -0.1),
    0.004,
    BLUE,
    {
      bone: upperRight.tip!,
      group: GROUP,
      name: "upperRightColorRod",
      section: { ngon: 5 },
    },
  );

  b.rod(
    v(-0.84, 1.83, 0.3),
    v(-0.56, 1.64, 0.34),
    0.004,
    TURQUOISE,
    {
      bone: middleLeft.tip!,
      group: GROUP,
      name: "middleLeftColorRod",
      section: { ngon: 5 },
    },
  );

  b.rod(
    v(0.72, 1.43, -0.45),
    v(0.49, 1.29, -0.38),
    0.004,
    YELLOW,
    {
      bone: lowerRight.tip!,
      group: GROUP,
      name: "lowerRightColorRod",
      section: { ngon: 5 },
    },
  );

  // A small, slightly skewed open ring at the top makes the suspension point unmistakable.
  addWireLoop(
    b,
    "topHangingRing",
    v(0.16, 2.86, 0),
    new THREE.Vector3(1, 0, 0),
    UP,
    0.07,
    hook.tip,
    0.0055,
  );

  // Ensure the root remains the only scene root and return the assembled mobile.
  return b.root;
}

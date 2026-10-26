import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  polyline,
  mid,
  paint,
  mottle,
  stripes,
  countershade,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

const PVC = paint((_p, n) => {
  if (n.y > 0.38) return "#f7f1df";
  if (n.y < -0.42) return "#a2b2b4";
  return "#d9e2dc";
});

const PVC_BLUE = countershade("#289bb8", "#123f5c", { level: -0.05, soft: 0.22 });
const PVC_YELLOW = stripes("#f3c24b", "#a86228", {
  size: 0.075,
  axis: "z",
  width: 0.28,
  wobble: 0.12,
  seed: 12,
});
const DARK = "#202b32";
const RUBBER = "#293137";
const BRASS = "#bd7e35";
const OXIDE = "#6a3c2d";
const GLASS = "#ffad42";
const SAIL = mottle("#e9f2df", "#8ec4b8", { size: 0.11, contrast: 1.35, seed: 31 });
const SAIL_BLUE = stripes("#46b5c3", ["#e9f2df", "#efb94d"], {
  size: 0.13,
  axis: "x",
  width: 0.42,
  wobble: 0.08,
  seed: 9,
});

const SAIL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <rect width="160" height="160" fill="#e7f1df"/>
    <path d="M-20 150 L30 0 M20 170 L70 0 M60 170 L110 0 M100 170 L150 0 M140 170 L190 20"
      stroke="#3bb5bd" stroke-width="18"/>
    <path d="M-20 125 L25 0 M38 170 L85 0 M98 170 L145 0"
      stroke="#eab54b" stroke-width="7"/>
    <path d="M0 18 Q42 40 80 18 T160 18 M0 75 Q42 97 80 75 T160 75 M0 132 Q42 154 80 132 T160 132"
      fill="none" stroke="#254d5b" stroke-width="3" opacity=".7"/>
    <circle cx="119" cy="44" r="19" fill="#fff7d7" stroke="#254d5b" stroke-width="4"/>
    <path d="M119 28 L124 39 L136 40 L127 48 L130 60 L119 54 L108 60 L111 48 L102 40 L114 39Z"
      fill="#e4a83a"/>
  </svg>`,
  { size: 256 },
);

const EMBLEM_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <rect width="128" height="96" rx="9" fill="#24343a"/>
    <path d="M9 48 Q32 18 64 18 Q96 18 119 48 Q96 78 64 78 Q32 78 9 48Z"
      fill="#d9efe0" stroke="#1b2429" stroke-width="5"/>
    <circle cx="64" cy="48" r="21" fill="#35a9b2" stroke="#1b2429" stroke-width="5"/>
    <path d="M64 29 L69 43 L84 43 L72 52 L76 67 L64 58 L52 67 L56 52 L44 43 L59 43Z"
      fill="#f0bb46"/>
    <path d="M16 86 H112" stroke="#f0bb46" stroke-width="4"/>
  </svg>`,
  { size: 192 },
);

const WARNING_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="#212a2d"/>
    <path d="M-10 64 L18 0 H31 L3 64Z M33 64 L61 0 H74 L46 64Z"
      fill="#efbd45"/>
    <path d="M0 9 H64 M0 55 H64" stroke="#e8f0df" stroke-width="3" opacity=".55"/>
  </svg>`,
  { size: 128, pixelated: true },
);

const GAUGE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <circle cx="80" cy="80" r="74" fill="#f3e2b7" stroke="#202b32" stroke-width="7"/>
    <path d="M25 98 A58 58 0 1 1 135 98" fill="none" stroke="#d36a38" stroke-width="12"/>
    <path d="M28 93 A58 58 0 1 1 132 93" fill="none" stroke="#243e45" stroke-width="4"
      stroke-dasharray="3 8"/>
    <path d="M80 80 L52 43" stroke="#b6312e" stroke-width="7" stroke-linecap="round"/>
    <circle cx="80" cy="80" r="10" fill="#bd7e35" stroke="#202b32" stroke-width="4"/>
    <text x="80" y="120" text-anchor="middle" font-family="sans-serif" font-weight="bold"
      font-size="18" fill="#202b32">WIND</text>
  </svg>`,
  { size: 192 },
);

const FLAG_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 160">
    <path d="M10 8 H88 L78 24 L88 40 L78 56 L88 72 L78 88 L88 104 L78 120 L88 136 L78 152 H10Z"
      fill="#eab84b" stroke="#233f49" stroke-width="5"/>
    <path d="M19 25 H72 M19 57 H72 M19 89 H72 M19 121 H72"
      stroke="#39aeb7" stroke-width="11"/>
    <circle cx="49" cy="73" r="17" fill="#f2e9d2" stroke="#233f49" stroke-width="4"/>
    <path d="M49 58 L53 69 L65 69 L55 76 L59 88 L49 81 L39 88 L43 76 L33 69 L45 69Z"
      fill="#d97839"/>
  </svg>`,
  { size: 192 },
);

const EYE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
    <path d="M7 50 Q40 8 73 50 Q40 92 7 50Z" fill="#f1ead8" stroke="#202b32" stroke-width="7"/>
    <ellipse cx="42" cy="50" rx="17" ry="25" fill="#39b4bd" stroke="#202b32" stroke-width="5"/>
    <ellipse cx="43" cy="52" rx="7" ry="18" fill="#202b32"/>
    <circle cx="36" cy="38" r="5" fill="#fffdf0"/>
    <circle cx="49" cy="63" r="3" fill="#fffdf0"/>
  </svg>`,
  { size: 192 },
);

function ellipseLoop(z: number, cy: number, rx: number, ry: number, count = 10) {
  const points: number[][] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    points.push([Math.cos(a) * rx, cy + Math.sin(a) * ry, z]);
  }
  return polyline(points, { closed: true });
}

function jointSphere(b: ReturnType<typeof createBuilder>, at: any, color = DARK, radius = 0.045) {
  return b.stick(new THREE.SphereGeometry(radius, 8, 6), color, at, {
    embed: 0,
    flat: true,
    name: "mechanicalJoint",
  });
}

function axlePin(
  b: ReturnType<typeof createBuilder>,
  p: number[],
  side: number,
  radius = 0.028,
  length = 0.16,
  color = BRASS,
  bone?: any,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, length, 8), color, {
    at: p,
    bone,
    dir: [side, 0, 0],
    axis: "y",
    flat: true,
    name: "axlePin",
  });
}

function linkageRod(
  b: ReturnType<typeof createBuilder>,
  a: any,
  c: any,
  radius: number,
  color: any,
  bone?: any,
) {
  return b.rod(a, c, radius, {
    color,
    bone,
    section: "box",
    caps: "flat",
    flat: true,
    name: "kineticLink",
  });
}

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton first: one central spine, a tail, a wind-catching mast, a head/jaw, and eight articulated legs.

  const spineRoot = b.joint("spineRoot", {
    at: [0, 1.04, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.02, -0.76],
      [0, 1.07, -0.39],
      [0, 1.09, 0.02],
      [0, 1.07, 0.42],
      [0, 1.03, 0.78],
    ]),
    {
      parent: spineRoot,
      names: ["thorax", "midSpine", "frontSpine", "headBase"],
      role: "spine",
      up: [0, 1, 0],
    },
  );

  const tail = b.chain(
    "tail",
    polyline([
      [0, 1.02, -0.72],
      [0, 1.07, -1.02],
      [0, 1.17, -1.28],
      [0, 1.34, -1.46],
    ]),
    {
      parent: spine.joints[0],
      names: ["tailBase", "tailMid", "tailRise", "tailTip"],
      role: "tail",
      up: [0, 1, 0],
    },
  );

  const head = b.joint("head", {
    parent: spine.joints[3],
    at: [0, 1.1, 0.83],
    dir: [0, 0.02, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.99, 0.87],
    dir: [0, -0.16, 1],
    role: "jaw",
  });

  const mast = b.joint("windMast", {
    parent: spine.joints[2],
    at: [0, 1.17, 0.08],
    dir: [0, 1, 0],
    role: "fan",
  });

  const rotor = b.joint("windRotor", {
    parent: mast,
    at: [0, 1.49, 0.29],
    dir: [0, 0, 1],
    role: "fan",
  });

  type LegRecord = {
    side: number;
    index: number;
    z: number;
    points: THREE.Vector3[];
    chain: ReturnType<typeof b.chain>;
  };

  const legs: LegRecord[] = [];
  const legLabels = ["Rear", "BackMid", "FrontMid", "Front"];

  for (const side of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const z = [-0.56, -0.23, 0.12, 0.47][i];
      const phase = i % 2 === 0 ? -0.07 : 0.09;
      const t = spine.path.closestT([0, 1.05, z]);
      const hip = spine.at(t).at.clone().setX(side * 0.18).setY(0.96);
      const knee = new THREE.Vector3(side * 0.43, 0.7, z + phase);
      const ankle = new THREE.Vector3(side * 0.61, 0.34, z - phase * 0.8);
      const foot = new THREE.Vector3(side * 0.7, 0.105, z + (i % 2 === 0 ? -0.08 : 0.11));

      const label = legLabels[i];
      const chain = b.chain(
        `leg${side > 0 ? "L" : "R"}${label}`,
        polyline([hip, knee, ankle, foot]),
        {
          parent: spine.jointAt(t),
          names: [
            `hip${side > 0 ? "L" : "R"}${label}`,
            `knee${side > 0 ? "L" : "R"}${label}`,
            `ankle${side > 0 ? "L" : "R"}${label}`,
            `foot${side > 0 ? "L" : "R"}${label}`,
          ],
          role: "leg",
          contact: [foot.x, 0, foot.z],
          up: [0, 1, 0],
        },
      );

      legs.push({ side, index: i, z, points: [hip, knee, ankle, foot], chain });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Main body: a square-section PVC thorax, longitudinal rails, and many open ribs.

  const thorax = b.sweep(spine, {
    radius: (t) => 0.145 - 0.018 * t,
    color: PVC,
    section: "box",
    skin: "smooth",
    caps: "flat",
    sides: 8,
    name: "continuousThorax",
    group: "body",
  });

  b.sweep(tail, [0.09, 0.024], {
    color: PVC_BLUE,
    section: "box",
    skin: "smooth",
    caps: { start: "flat", end: "point" },
    name: "taperedTail",
    group: "tail",
  });

  for (const z of [-0.67, -0.43, -0.19, 0.06, 0.31, 0.55, 0.73]) {
    b.sweep(ellipseLoop(z, 1.06, 0.19 - Math.abs(z) * 0.025, 0.145, 10), 0.014, {
      color: z > 0.5 ? PVC_YELLOW : PVC,
      caps: "none",
      name: "thoraxRib",
      group: "body",
    });
  }

  for (const side of [1, -1]) {
    const railA = new THREE.Vector3(side * 0.17, 1.17, -0.7);
    const railB = new THREE.Vector3(side * 0.17, 1.17, 0.73);
    const railC = new THREE.Vector3(side * 0.17, 0.94, -0.65);
    const railD = new THREE.Vector3(side * 0.17, 0.94, 0.68);
    linkageRod(b, railA, railB, 0.021, PVC_BLUE, spine.joints[1]);
    linkageRod(b, railC, railD, 0.018, PVC_YELLOW, spine.joints[1]);
  }

  for (const z of [-0.57, -0.24, 0.11, 0.46]) {
    linkageRod(b, [0.19, 1.01, z], [-0.19, 1.01, z], 0.018, PVC_BLUE, spine.joints[1]);
    linkageRod(b, [0.16, 1.16, z], [-0.16, 1.16, z], 0.014, PVC, spine.joints[1]);
  }

  // Body end plates and a front-facing emblem.
  b.part(new THREE.BoxGeometry(0.32, 0.28, 0.04), DARK, {
    at: [0, 1.06, 0.78],
    bone: spine.joints[3],
    flat: true,
    name: "frontEndPlate",
  });

  b.part(new THREE.PlaneGeometry(0.27, 0.2), "#ffffff", {
    at: [0, 1.07, 0.805],
    bone: spine.joints[3],
    dir: [0, 0, 1],
    axis: "z",
    texture: EMBLEM_TEX,
    name: "windEmblem",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Eight Theo-Jansen-inspired legs. Every limb gets its own tube, triangular linkages, pins, and broad foot.

  for (const leg of legs) {
    const [hip, knee, ankle, foot] = leg.points;
    const { side, index, chain } = leg;
    const legColor = index % 2 === 0 ? PVC : PVC_BLUE;

    b.sweep(chain, [0.042, 0.027], {
      color: legColor,
      section: "box",
      skin: "rigid",
      caps: "flat",
      name: `legTube${side > 0 ? "L" : "R"}${index}`,
      group: "legs",
    });

    const anchorRear = new THREE.Vector3(side * 0.19, 0.84, leg.z - 0.13);
    const anchorFront = new THREE.Vector3(side * 0.19, 0.87, leg.z + 0.16);
    const anchorHigh = new THREE.Vector3(side * 0.22, 1.12, leg.z - 0.03);

    linkageRod(b, anchorRear, knee, 0.018, DARK, chain.joints[0]);
    linkageRod(b, anchorRear, ankle, 0.016, PVC_YELLOW, chain.joints[0]);
    linkageRod(b, anchorFront, ankle, 0.019, PVC_BLUE, chain.joints[0]);
    linkageRod(b, anchorHigh, knee, 0.014, PVC, chain.joints[0]);
    linkageRod(b, anchorHigh, foot, 0.012, DARK, chain.joints[0]);

    jointSphere(b, chain.at(chain.path.closestT(hip)), DARK, 0.052);
    jointSphere(b, chain.at(chain.path.closestT(knee)), DARK, 0.05);
    jointSphere(b, chain.at(chain.path.closestT(ankle)), DARK, 0.045);
    jointSphere(b, chain.at(chain.path.closestT(foot)), DARK, 0.04);

    axlePin(b, [hip.x, hip.y, hip.z], side, 0.028, 0.19, BRASS, chain.joints[0]);
    axlePin(b, [knee.x, knee.y, knee.z], side, 0.024, 0.12, BRASS, chain.joints[1]);
    axlePin(b, [ankle.x, ankle.y, ankle.z], side, 0.022, 0.11, OXIDE, chain.joints[2]);

    const warningCenter = mid(knee, ankle);
    b.part(new THREE.BoxGeometry(0.075, 0.055, 0.12), "#ffffff", {
      at: warningCenter,
      bone: chain.joints[1],
      dir: ankle.clone().sub(knee),
      texture: WARNING_TEX,
      flat: true,
      name: "stripedSafetySleeve",
    });

    const pad = new THREE.Vector3(foot.x, 0.038, foot.z + 0.045);
    b.part(new THREE.BoxGeometry(0.19, 0.076, 0.28), RUBBER, {
      at: pad,
      bone: chain.tip ?? chain.joints[2],
      flat: true,
      name: "beachFoot",
    });

    b.part(new THREE.BoxGeometry(0.13, 0.025, 0.075), PVC_YELLOW, {
      at: [foot.x, 0.086, foot.z + 0.112],
      bone: chain.tip ?? chain.joints[2],
      flat: true,
      name: "footToeCap",
    });

    for (const s of [-1, 1]) {
      const toe = [foot.x + s * 0.055, 0.092, foot.z + 0.12];
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BRASS, {
        at: toe,
        bone: chain.tip ?? chain.joints[2],
        flat: true,
        name: "toeRivet",
      });
    }
  }

  // A row of large exposed body bearings makes the linkage read as a real machine.
  for (const z of [-0.57, -0.24, 0.11, 0.46]) {
    for (const side of [1, -1]) {
      const p = [side * 0.205, 1.0, z];
      b.part(new THREE.CylinderGeometry(0.076, 0.076, 0.036, 12), BRASS, {
        at: p,
        dir: [side, 0, 0],
        axis: "y",
        bone: spine.joints[1],
        flat: true,
        name: "bodyBearing",
      });
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.045, 10), DARK, {
        at: [side * 0.228, 1.0, z],
        dir: [side, 0, 0],
        axis: "y",
        bone: spine.joints[1],
        flat: true,
        name: "bearingCap",
      });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head and separated jaws: an abstract wind creature face with two bright, readable eyes.

  const skull = b.part(new THREE.SphereGeometry(0.18, 10, 7), PVC, {
    at: [0, 1.1, 0.84],
    bone: head,
    scale: [1.0, 0.86, 1.12],
    flat: true,
    name: "facetedHead",
  });

  for (const side of [1, -1]) {
    const eye = b.part(new THREE.PlaneGeometry(0.075, 0.1), "#ffffff", {
      at: [side * 0.092, 1.135, 1.015],
      bone: head,
      dir: [0, 0, 1],
      axis: "z",
      texture: EYE_TEX,
      name: `windEye${side > 0 ? "L" : "R"}`,
    });
    glow(eye, 1.35);

    b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 8), GLASS, {
      at: [side * 0.092, 1.135, 1.012],
      bone: head,
      dir: [0, 0, 1],
      axis: "y",
      flat: true,
      name: "eyeGlassLens",
    });
  }

  const upperLeft = new THREE.Vector3(-0.13, 1.08, 0.86);
  const upperRight = new THREE.Vector3(0.13, 1.08, 0.86);
  const upperTip = new THREE.Vector3(0, 1.08, 1.13);
  linkageRod(b, upperLeft, upperTip, 0.026, PVC_YELLOW, head);
  linkageRod(b, upperRight, upperTip, 0.026, PVC_YELLOW, head);
  linkageRod(b, upperLeft, upperRight, 0.018, DARK, head);

  const lowerLeft = new THREE.Vector3(-0.11, 0.95, 0.9);
  const lowerRight = new THREE.Vector3(0.11, 0.95, 0.9);
  const lowerTip = new THREE.Vector3(0, 0.94, 1.12);
  linkageRod(b, lowerLeft, lowerTip, 0.024, PVC_BLUE, jaw);
  linkageRod(b, lowerRight, lowerTip, 0.024, PVC_BLUE, jaw);
  linkageRod(b, lowerLeft, lowerRight, 0.017, DARK, jaw);

  jointSphere(b, head, DARK, 0.048);
  jointSphere(b, jaw, BRASS, 0.04);

  // Side-mounted gauges are decorative but make the sculpture feel like a wind-powered mechanism.
  for (const side of [1, -1]) {
    const gaugeCenter = [side * 0.255, 1.12, 0.52];
    b.part(new THREE.CylinderGeometry(0.082, 0.082, 0.032, 14), BRASS, {
      at: gaugeCenter,
      bone: spine.joints[2],
      dir: [side, 0, 0],
      axis: "y",
      flat: true,
      name: "gaugeHousing",
    });
    b.part(new THREE.CircleGeometry(0.068, 18), "#ffffff", {
      at: [side * 0.276, 1.12, 0.52],
      bone: spine.joints[2],
      dir: [side, 0, 0],
      axis: "z",
      texture: GAUGE_TEX,
      name: "windGauge",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Wind mast, braced sail, and a five-bladed front rotor.

  linkageRod(b, [0, 1.1, 0.08], [0, 1.49, 0.29], 0.032, PVC_BLUE, mast);
  linkageRod(b, [-0.23, 1.18, 0.08], [0.23, 1.18, 0.08], 0.018, PVC_YELLOW, spine.joints[2]);
  linkageRod(b, [-0.43, 1.06, 0.15], [0.43, 1.06, 0.15], 0.016, PVC, spine.joints[2]);
  linkageRod(b, [-0.22, 1.54, 0.25], [0.22, 1.54, 0.25], 0.017, PVC, mast);

  for (const side of [1, -1]) {
    const topInner = [0, 1.49, 0.18];
    const topOuter = [side * 0.53, 1.63, 0.18];
    const bottomInner = [0, 1.12, 0.18];
    const bottomOuter = [side * 0.67, 1.08, 0.18];

    b.membrane(
      polyline([topInner, topOuter]),
      polyline([bottomInner, bottomOuter]),
      {
        color: side > 0 ? SAIL : SAIL_BLUE,
        thickness: 0.009,
        rows: 4,
        cols: 5,
        name: "windSailMembrane",
        group: "sails",
      },
    );

    linkageRod(b, topInner, topOuter, 0.012, PVC_YELLOW, mast);
    linkageRod(b, bottomInner, bottomOuter, 0.012, PVC_BLUE, mast);
    linkageRod(b, topOuter, bottomOuter, 0.012, PVC, mast);

    const sailCard = b.cards(
      [frame([side * 0.3, 1.34, 0.195], [0, 0, 1])],
      SAIL_TEX,
      {
        size: [0.47, 0.42],
        lean: 90,
        flow: [side, 0.1, 0],
        mirror: side < 0,
        color: "#ffffff",
        sink: 0.02,
        name: "printedSail",
        group: "sails",
      },
    );
    glow(sailCard, 0.25);
  }

  const rotorCenter = rotor.at;
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.075, 12), BRASS, {
    at: rotorCenter,
    bone: rotor,
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    name: "rotorHub",
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.15, 8), DARK, {
    at: rotorCenter,
    bone: rotor,
    dir: [0, 0, 1],
    axis: "y",
    flat: true,
    name: "rotorAxle",
  });

  const bladeOutline: [number, number, "sharp"][] = [
    [0, -0.025, "sharp"],
    [0.28, -0.038, "sharp"],
    [0.42, -0.005, "sharp"],
    [0.35, 0.04, "sharp"],
    [0.11, 0.055, "sharp"],
    [0, 0.025, "sharp"],
  ];

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.18;
    const radial: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const tangent: [number, number, number] = [-Math.sin(a), Math.cos(a), 0];

    b.extrude(bladeOutline, {
      at: rotorCenter,
      x: radial,
      y: tangent,
      thickness: [0.018, 0.008],
      bevel: 0.006,
      smoothing: 1,
      color: i % 2 === 0 ? PVC_YELLOW : PVC_BLUE,
      bone: rotor,
      name: "windRotorBlade",
      group: "rotor",
    });

    const rivet = new THREE.Vector3(
      rotorCenter.x + Math.cos(a) * 0.2,
      rotorCenter.y + Math.sin(a) * 0.2,
      rotorCenter.z + 0.025,
    );
    b.part(new THREE.SphereGeometry(0.018, 7, 5), BRASS, {
      at: rivet,
      bone: rotor,
      flat: true,
      name: "rotorRivet",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Tail fan: five printed streamers and a small tail-end bearing.

  const tailEnd = tail.tip ?? tail.joints[tail.joints.length - 1];
  b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.08, 10), BRASS, {
    at: tailEnd.at,
    bone: tailEnd,
    dir: tailEnd.axis,
    axis: "y",
    flat: true,
    name: "tailBearing",
  });

  const fan = b.ring(
    tailEnd,
    {
      count: 5,
      radius: 0.028,
      fromDeg: -72,
      toDeg: 72,
      tilt: -12,
      name: "tailPennantFan",
      role: "fan",
    },
  );

  b.cards(fan.items, FLAG_TEX, {
    size: [0.075, 0.22],
    lean: 42,
    bend: 18,
    flow: [0, -0.2, -1],
    vary: 0.16,
    spin: 9,
    rng: rng(204),
    color: "#ffffff",
    sink: 0.06,
    name: "printedTailPennant",
    group: "tail",
  });

  // Small rivet ladders along the top rail finish the silhouette without adding scenery.
  for (const z of [-0.63, -0.42, -0.21, 0, 0.21, 0.42, 0.63]) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), BRASS, {
      at: [0, 1.205, z],
      bone: spine.joints[1],
      flat: true,
      name: "topRailRivet",
    });
  }

  return b.root;
}

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A stylized Theo Jansen-inspired beach walker built from faceted PVC tubes, eight articulated kinetic legs, open ribs, gauges, a wind sail, rotor, glowing eyes, and a printed tail pennant.",
};

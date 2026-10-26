import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  grain,
  paint,
  polyline,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Aeolian Strandbeast",
  description:
    "A stylized Theo Jansen-inspired wind-walking beach creature assembled from faceted ivory tubes, articulated kinetic legs, axle hubs, wind sails, sensor feelers, and painted mechanical details.",
};

const BODY = countershade(
  grain("#eee8d1", "#aaa183", { size: 0.055, axis: [0, 0, 1], seed: 17 }),
  "#716d61",
  { level: -0.18, soft: 0.32 },
);

const STRUT = countershade(
  grain("#d8cfb1", "#817963", { size: 0.045, axis: [0, 0, 1], seed: 29 }),
  "#514f49",
  { level: -0.1, soft: 0.3 },
);

const WEATHERED = grain("#b9b091", "#69665c", {
  size: 0.07,
  axis: [0, 0, 1],
  seed: 44,
});

const SAIL_CYAN = "#58b7b0";
const SAIL_PALE = "#bfe3ce";
const SAIL_DARK = "#225c63";
const JOINT = "#252d2d";
const AXLE = "#45483f";
const AXLE_HIGHLIGHT = "#d88c45";
const WARNING = "#d95e37";
const DEEP = "#172326";
const FOAM = "#f4efd9";
const BLUE = "#3b8590";

const SAIL_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="cloth" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#1d616b"/>
        <stop offset=".52" stop-color="#65c6bd"/>
        <stop offset="1" stop-color="#d2edcf"/>
      </linearGradient>
    </defs>
    <path d="M50 96 L8 10 Q43 17 91 31 Z" fill="url(#cloth)" stroke="#193c43" stroke-width="4" stroke-linejoin="round"/>
    <path d="M19 24 Q47 32 82 38" fill="none" stroke="#d8f2d4" stroke-width="4" opacity=".85"/>
    <path d="M25 42 Q51 48 75 53" fill="none" stroke="#245a63" stroke-width="3"/>
    <path d="M34 61 Q51 65 63 67" fill="none" stroke="#e5f0cf" stroke-width="3" opacity=".8"/>
    <circle cx="49" cy="20" r="4" fill="#f5c16d"/>
  </svg>`,
  { size: 256 },
);

const SIDE_SAIL_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 72">
    <path d="M5 63 Q39 9 113 9 Q91 35 38 66 Z" fill="#77c9b9" stroke="#214e55" stroke-width="4"/>
    <path d="M20 57 Q53 28 99 17" fill="none" stroke="#d6edd0" stroke-width="5"/>
    <path d="M39 60 Q69 39 108 23" fill="none" stroke="#2e7376" stroke-width="4"/>
    <path d="M63 57 Q85 44 106 33" fill="none" stroke="#edc36e" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const WIND_EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="#e9e0bd" stroke="#1b3336" stroke-width="6"/>
    <path d="M21 66 C28 38 57 28 81 39 C98 47 96 66 79 70 C61 74 47 61 51 49 C55 36 75 35 84 45"
      fill="none" stroke="#d4653c" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 81 C42 92 68 95 90 77" fill="none" stroke="#328b91" stroke-width="6" stroke-linecap="round"/>
    <circle cx="60" cy="59" r="8" fill="#1e3437"/>
    <circle cx="57" cy="56" r="2.8" fill="#fff8d7"/>
    <path d="M18 28 L32 25 M90 94 L103 88" stroke="#1e3437" stroke-width="4" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const SERIAL_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70">
    <rect x="3" y="3" width="294" height="64" rx="9" fill="#e9e2c8" stroke="#243b3d" stroke-width="6"/>
    <path d="M15 18 H285 M15 52 H285" stroke="#c36f43" stroke-width="3" opacity=".7"/>
    <text x="150" y="42" text-anchor="middle" font-family="monospace" font-size="27" font-weight="bold" fill="#243b3d">AEOLIAN / 06</text>
  </svg>`,
  { size: 384 },
);

const AXLE_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#d89a4d" stroke="#202b2c" stroke-width="7"/>
    <circle cx="50" cy="50" r="33" fill="#687873" stroke="#202b2c" stroke-width="5"/>
    <path d="M50 13 V28 M87 50 H72 M50 87 V72 M13 50 H28" stroke="#dce0c3" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="12" fill="#202b2c"/>
    <circle cx="46" cy="46" r="3.5" fill="#f8e4a0"/>
  </svg>`,
  { size: 192 },
);

const WARNING_TEXTURE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 48">
    <rect width="120" height="48" fill="#1e2b2d"/>
    <path d="M-10 48 L14 0 M22 48 L46 0 M54 48 L78 0 M86 48 L110 0 M118 48 L142 0"
      stroke="#e7a44d" stroke-width="13"/>
    <path d="M3 38 L16 12 M55 38 L68 12 M107 38 L120 12" stroke="#fff0ba" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function rotateFanVector(deg: number, length: number) {
  const r = (deg * Math.PI) / 180;
  return v(-Math.sin(r) * length, Math.cos(r) * length, 0);
}

function addAxle(
  builder: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  radius: number,
  length: number,
  bone: any,
  name: string,
) {
  builder.part(
    new THREE.CylinderGeometry(radius, radius, length, 10, 1, false),
    AXLE,
    {
      at,
      dir: [1, 0, 0],
      bone,
      flat: true,
      name,
      group: "axles",
    },
  );
  builder.part(
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, length + 0.006, 10, 1, false),
    AXLE_HIGHLIGHT,
    {
      at,
      dir: [1, 0, 0],
      bone,
      flat: true,
      name: `${name}Cap`,
      group: "axles",
    },
  );
}

function addWarningPlate(
  builder: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  dir: [number, number, number],
  bone: any,
  rotation?: [number, number, number],
) {
  builder.part(
    new THREE.PlaneGeometry(0.15, 0.06),
    "#ffffff",
    {
      at,
      dir,
      axis: "z",
      rotation,
      texture: WARNING_TEXTURE,
      bone,
      name: "warningPlate",
      group: "markings",
    },
  );
}

export default function build() {
  const b = createBuilder({
    name: "aeolian-strandbeast",
    detail: 0.9,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one central spine, twelve articulated walking legs, a sail mast, and two wind sensors.

  const pelvis = b.joint("pelvis", {
    at: [0, 1.04, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "core",
  });

  const spinePath = catmull([
    [0, 1.05, -0.92],
    [0, 1.08, -0.55],
    [0, 1.08, -0.12],
    [0, 1.09, 0.38],
    [0, 1.08, 0.88],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: pelvis,
    names: ["spineRear", "spineRearMid", "spineMid", "spineFront", "spineNose"],
    role: "spine",
    group: "core",
  });

  const stations = [-0.77, -0.47, -0.17, 0.15, 0.47, 0.77];
  const legs: any[] = [];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    for (let i = 0; i < stations.length; i++) {
      const z = stations[i];
      const stride = i % 2 === 0 ? 0.13 : -0.11;
      const kneeZ = z + stride;
      const ankleZ = z - stride * 0.6;
      const footZ = z + (i % 2 === 0 ? 0.13 : -0.16);

      const hip = v(side * 0.31, 1.08, z);
      const knee = v(side * (0.49 + (i % 3) * 0.025), 0.67, kneeZ);
      const ankle = v(side * 0.70, 0.25, ankleZ);
      const foot = v(side * (0.88 + (i % 2) * 0.018), 0.065, footZ);

      const parent = spine.jointAt((z + 0.92) / 1.8);
      const chain = b.chain(
        `leg${sideName}${i + 1}`,
        polyline([hip, knee, ankle, foot]),
        {
          parent,
          names: [
            `hip${sideName}${i + 1}`,
            `knee${sideName}${i + 1}`,
            `ankle${sideName}${i + 1}`,
            `foot${sideName}${i + 1}`,
          ],
          role: "leg",
          contact: [foot.x, 0, foot.z],
          group: "walkingLegs",
        },
      );

      legs.push({
        side,
        sideName,
        index: i,
        z,
        hip,
        knee,
        ankle,
        foot,
        chain,
      });
    }
  }

  const mast = b.chain(
    "mast",
    polyline([
      [0, 1.08, -0.60],
      [0, 1.34, -0.60],
      [0, 1.66, -0.60],
    ]),
    {
      parent: spine.jointAt(0.16),
      names: ["mastBase", "mastMiddle", "mastTop"],
      role: "spine",
      group: "sails",
    },
  );

  const rotor = b.joint("rotor", {
    parent: mast.tip,
    at: mast.tip.at,
    dir: [0, 0, 1],
    role: "hinge",
    group: "sails",
  });

  const sensorL = b.chain(
    "sensorL",
    polyline([
      [0.28, 1.12, 0.67],
      [0.39, 1.30, 0.88],
      [0.45, 1.52, 1.01],
    ]),
    {
      parent: spine.jointAt(0.93),
      names: ["sensorLBase", "sensorLMid", "sensorLTip"],
      role: "tentacle",
      group: "sensors",
    },
  );

  const sensorR = b.chain(
    "sensorR",
    polyline([
      [-0.28, 1.12, 0.67],
      [-0.39, 1.30, 0.88],
      [-0.45, 1.52, 1.01],
    ]),
    {
      parent: spine.jointAt(0.93),
      names: ["sensorRBase", "sensorRMid", "sensorRTip"],
      role: "tentacle",
      group: "sensors",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Main body: a faceted central thorax, twin rails, rib bars, and a visible underside.

  const mainBody = b.sweep(spine, 0.068, {
    color: BODY,
    section: { ngon: 8 },
    caps: "round",
    skin: "smooth",
    name: "centralThorax",
    group: "body",
  });

  b.sweep(
    catmull([
      [-0.20, 1.02, -0.86],
      [-0.20, 1.03, -0.42],
      [-0.20, 1.03, 0.08],
      [-0.20, 1.04, 0.56],
      [-0.20, 1.03, 0.86],
    ]),
    0.032,
    {
      color: STRUT,
      bone: spine,
      section: { ngon: 6 },
      caps: "round",
      name: "leftBodyRail",
      group: "body",
    },
  );

  b.sweep(
    catmull([
      [0.20, 1.02, -0.86],
      [0.20, 1.03, -0.42],
      [0.20, 1.03, 0.08],
      [0.20, 1.04, 0.56],
      [0.20, 1.03, 0.86],
    ]),
    0.032,
    {
      color: STRUT,
      bone: spine,
      section: { ngon: 6 },
      caps: "round",
      name: "rightBodyRail",
      group: "body",
    },
  );

  b.sweep(
    catmull([
      [0, 0.985, -0.80],
      [0, 0.995, -0.38],
      [0, 1.00, 0.08],
      [0, 1.005, 0.52],
      [0, 1.00, 0.80],
    ]),
    0.043,
    {
      color: WEATHERED,
      bone: spine,
      section: { ngon: 7 },
      caps: "round",
      name: "bellySpine",
      group: "body",
    },
  );

  for (let i = 0; i < stations.length; i++) {
    const z = stations[i];
    const p = v(0, 1.055, z);
    const joint = spine.jointAt((z + 0.92) / 1.8);

    b.rod(
      v(-0.36, 1.055, z),
      v(0.36, 1.055, z),
      0.024,
      {
        color: STRUT,
        bone: joint,
        section: { ngon: 6 },
        name: `ribBar${i + 1}`,
        group: "bodyRibs",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.055, 8, 5),
      JOINT,
      {
        at: p,
        bone: joint,
        flat: true,
        name: `ribNode${i + 1}`,
        group: "bodyRibs",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.034, 0.034, 0.015, 8, 1),
      AXLE_HIGHLIGHT,
      {
        at: v(0, 1.055, z),
        dir: [1, 0, 0],
        bone: joint,
        flat: true,
        name: `ribWasher${i + 1}`,
        group: "bodyRibs",
      },
    );
  }

  // Long diagonal braces make the torso read as a tensioned kinetic frame rather than an animal skeleton.
  const bodyBracePairs: [THREE.Vector3, THREE.Vector3][] = [
    [v(-0.22, 1.03, -0.82), v(0.22, 1.03, -0.40)],
    [v(0.22, 1.03, -0.82), v(-0.22, 1.03, -0.40)],
    [v(-0.22, 1.03, 0.22), v(0.22, 1.03, 0.64)],
    [v(0.22, 1.03, 0.22), v(-0.22, 1.03, 0.64)],
  ];

  for (let i = 0; i < bodyBracePairs.length; i++) {
    b.rod(bodyBracePairs[i][0], bodyBracePairs[i][1], 0.017, {
      color: STRUT,
      bone: spine,
      section: { ngon: 6 },
      name: `bodyDiagonal${i + 1}`,
      group: "bodyBraces",
    });
  }

  // Small raised bolts around the body tube.
  for (const t of [0.12, 0.36, 0.61, 0.84]) {
    const ring = b.ring(spine.at(t), {
      count: 8,
      radius: 0.077,
      fromDeg: 0,
      toDeg: 360,
      name: "bodyBoltRing",
      group: "bodyBolts",
      role: "fan",
    });

    for (const item of ring.items) {
      b.part(
        new THREE.SphereGeometry(0.012, 6, 4),
        AXLE_HIGHLIGHT,
        {
          frame: item,
          flat: true,
          name: "bodyBolt",
          group: "bodyBolts",
        },
      );
    }
  }

  // Dorsal studs follow the centre tube and exaggerate the sculpture's segmented silhouette.
  b.along(mainBody, 9, (at) =>
    b.spike(at, at, 0.036, 0.009, {
      color: AXLE_HIGHLIGHT,
      section: { ngon: 6 },
      name: "dorsalStud",
      group: "bodyBolts",
    }),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Twelve paired articulated legs. Every leg has a smooth primary chain plus the characteristic triangular linkage.

  for (const leg of legs) {
    const { side, sideName, index, chain, hip, knee, ankle, foot } = leg;
    const n = index + 1;
    const hipJoint = chain.joints[0];
    const kneeJoint = chain.joints[1];
    const ankleJoint = chain.joints[2];
    const footJoint = chain.tip;

    b.sweep(chain, (t: number) => {
      if (t < 0.36) return 0.052 - t * 0.018;
      if (t < 0.72) return 0.040;
      return 0.037;
    }, {
      color: BODY,
      section: { ngon: 7 },
      caps: "round",
      skin: "smooth",
      name: `primaryLeg${sideName}${n}`,
      group: "walkingLegs",
    });

    // Rear diagonal, forward diagonal, and a high triangular return member.
    b.rod(
      chain.at(0),
      chain.at(2),
      0.026,
      {
        color: STRUT,
        section: { ngon: 6 },
        name: `rearLink${sideName}${n}`,
        group: "walkingLinks",
      },
    );

    b.rod(
      chain.at(1),
      chain.at(3),
      0.023,
      {
        color: STRUT,
        section: { ngon: 6 },
        name: `frontLink${sideName}${n}`,
        group: "walkingLinks",
      },
    );

    b.rod(
      chain.at(0),
      chain.at(3),
      0.018,
      {
        color: WEATHERED,
        section: { ngon: 6 },
        name: `longReturn${sideName}${n}`,
        group: "walkingLinks",
      },
    );

    // A short duplicate brace near the ankle gives each foot the layered, engineered look of a Strandbeest limb.
    const braceStart = v(side * 0.58, 0.47, (knee.z + ankle.z) * 0.5);
    b.rod(
      braceStart,
      foot,
      0.014,
      {
        color: STRUT,
        bone: ankleJoint,
        section: { ngon: 6 },
        name: `ankleBrace${sideName}${n}`,
        group: "walkingLinks",
      },
    );

    // Joint blocks and axles.
    for (const [j, p, r, label] of [
      [hipJoint, hip, 0.078, "hip"],
      [kneeJoint, knee, 0.058, "knee"],
      [ankleJoint, ankle, 0.050, "ankle"],
    ] as any[]) {
      b.part(
        new THREE.SphereGeometry(r, 8, 5),
        JOINT,
        {
          at: p,
          bone: j,
          flat: true,
          name: `${label}Block${sideName}${n}`,
          group: "legJoints",
        },
      );

      addAxle(
        b,
        p,
        r * 0.56,
        0.082,
        j,
        `${label}Axle${sideName}${n}`,
      );
    }

    // Orange axle end faces sit on the outside of each leg.
    for (const [p, j, r, label] of [
      [hip, hipJoint, 0.043, "hip"],
      [knee, kneeJoint, 0.032, "knee"],
      [ankle, ankleJoint, 0.027, "ankle"],
    ] as any[]) {
      const outer = v(p.x + side * 0.052, p.y, p.z);
      b.part(
        new THREE.CircleGeometry(r, 12),
        "#ffffff",
        {
          at: outer,
          dir: [side, 0, 0],
          axis: "z",
          bone: j,
          texture: AXLE_TEXTURE,
          flat: true,
          name: `${label}Dial${sideName}${n}`,
          group: "legJoints",
        },
      );
    }

    // Broad beach feet: a tube toe and a low paddle, both just above the sand line.
    const toeTip = v(side * 0.98, 0.06, foot.z + (index % 2 === 0 ? 0.18 : -0.18));
    b.rod(
      foot,
      toeTip,
      0.040,
      {
        color: BODY,
        bone: footJoint,
        section: { ngon: 7 },
        caps: "round",
        name: `toeBar${sideName}${n}`,
        group: "feet",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.18, 0.045, 0.115),
      BODY,
      {
        at: v(side * 0.91, 0.055, foot.z + (index % 2 === 0 ? 0.075 : -0.075)),
        bone: footJoint,
        flat: true,
        name: `sandPaddle${sideName}${n}`,
        group: "feet",
      },
    );

    b.part(
      new THREE.BoxGeometry(0.12, 0.015, 0.125),
      AXLE_HIGHLIGHT,
      {
        at: v(side * 0.91, 0.083, foot.z + (index % 2 === 0 ? 0.075 : -0.075)),
        bone: footJoint,
        flat: true,
        name: `footSole${sideName}${n}`,
        group: "feet",
      },
    );

    addWarningPlate(
      b,
      v(side * 0.54, 0.56, (knee.z + ankle.z) * 0.5),
      [side, 0, 0],
      kneeJoint,
      [0, 0, side > 0 ? 90 : -90],
    );
  }

  // Cross braces between paired hips make the legs feel driven by a common crankshaft.
  for (let i = 0; i < stations.length; i++) {
    const z = stations[i];
    const joint = spine.jointAt((z + 0.92) / 1.8);

    b.rod(
      v(-0.40, 1.08, z),
      v(0.40, 1.08, z),
      0.018,
      {
        color: WEATHERED,
        bone: joint,
        section: { ngon: 6 },
        name: `crankshaft${i + 1}`,
        group: "walkingDrive",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.082, 0.082, 0.025, 12),
      JOINT,
      {
        at: v(-0.37, 1.08, z),
        dir: [1, 0, 0],
        bone: joint,
        flat: true,
        name: `leftCrank${i + 1}`,
        group: "walkingDrive",
      },
    );

    b.part(
      new THREE.CylinderGeometry(0.082, 0.082, 0.025, 12),
      JOINT,
      {
        at: v(0.37, 1.08, z),
        dir: [1, 0, 0],
        bone: joint,
        flat: true,
        name: `rightCrank${i + 1}`,
        group: "walkingDrive",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Mast and wind rotor.

  b.sweep(mast, [0.045, 0.035], {
    color: BODY,
    section: { ngon: 7 },
    caps: "round",
    name: "windMast",
    group: "sails",
  });

  b.rod(
    v(-0.16, 1.09, -0.60),
    mast.tip.at,
    0.018,
    {
      color: STRUT,
      bone: mast.joints[0],
      section: { ngon: 6 },
      name: "mastLeftStay",
      group: "sails",
    },
  );

  b.rod(
    v(0.16, 1.09, -0.60),
    mast.tip.at,
    0.018,
    {
      color: STRUT,
      bone: mast.joints[0],
      section: { ngon: 6 },
      name: "mastRightStay",
      group: "sails",
    },
  );

  const rotorAt = mast.tip.at.clone();

  b.part(
    new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12, 1),
    JOINT,
    {
      at: rotorAt,
      dir: [0, 0, 1],
      bone: rotor,
      flat: true,
      name: "rotorHub",
      group: "sails",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.072, 0.072, 0.155, 12, 1),
    AXLE_HIGHLIGHT,
    {
      at: rotorAt,
      dir: [0, 0, 1],
      bone: rotor,
      flat: true,
      name: "rotorCap",
      group: "sails",
    },
  );

  for (let i = 0; i < 4; i++) {
    const angle = i * 90 + 18;
    const bladeDir = rotateFanVector(angle, 0.74);
    const sideDir = rotateFanVector(angle + 90, 1);
    const bladeTip = rotorAt.clone().add(bladeDir);
    const edgeA = rotorAt.clone().add(rotateFanVector(angle, 0.12)).addScaledVector(sideDir, 0.24);
    const edgeB = rotorAt.clone().add(rotateFanVector(angle, 0.12)).addScaledVector(sideDir, -0.24);

    b.rod(
      rotorAt,
      bladeTip,
      0.020,
      {
        color: BODY,
        bone: rotor,
        section: { ngon: 6 },
        name: `sailSpine${i + 1}`,
        group: "sails",
      },
    );

    b.rod(
      edgeA,
      bladeTip,
      0.012,
      {
        color: STRUT,
        bone: rotor,
        section: { ngon: 6 },
        name: `sailEdgeA${i + 1}`,
        group: "sails",
      },
    );

    b.rod(
      edgeB,
      bladeTip,
      0.012,
      {
        color: STRUT,
        bone: rotor,
        section: { ngon: 6 },
        name: `sailEdgeB${i + 1}`,
        group: "sails",
      },
    );

    const sailPlane = new THREE.PlaneGeometry(0.50, 0.74).translate(0, 0.37, 0);
    b.part(
      sailPlane,
      "#ffffff",
      {
        at: rotorAt,
        dir: [0, 0, 1],
        axis: "z",
        rotation: [0, 0, angle],
        texture: SAIL_TEXTURE,
        bone: rotor,
        name: `windSail${i + 1}`,
        group: "sails",
      },
    );

    b.part(
      new THREE.SphereGeometry(0.026, 7, 5),
      AXLE_HIGHLIGHT,
      {
        at: bladeTip,
        bone: rotor,
        flat: true,
        name: `sailTip${i + 1}`,
        group: "sails",
      },
    );
  }

  // Two side-catching cloth panels give the silhouette a second sail direction.
  for (const side of [1, -1]) {
    const sideBone = spine.jointAt(0.22);
    const sailAt = v(side * 0.31, 1.28, -0.27);

    b.part(
      new THREE.PlaneGeometry(0.54, 0.34),
      "#ffffff",
      {
        at: sailAt,
        dir: [side, 0, 0],
        axis: "z",
        texture: SIDE_SAIL_TEXTURE,
        bone: sideBone,
        name: `sideWindCloth${side > 0 ? "L" : "R"}`,
        group: "sails",
      },
    );

    b.rod(
      v(side * 0.28, 1.10, -0.48),
      v(side * 0.39, 1.44, -0.18),
      0.014,
      {
        color: STRUT,
        bone: sideBone,
        section: { ngon: 6 },
        name: `sideSailFrame${side > 0 ? "L" : "R"}`,
        group: "sails",
      },
    );

    b.rod(
      v(side * 0.39, 1.44, -0.18),
      v(side * 0.36, 1.15, 0.02),
      0.011,
      {
        color: BODY,
        bone: sideBone,
        section: { ngon: 6 },
        name: `sideSailTop${side > 0 ? "L" : "R"}`,
        group: "sails",
      },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Front wind nose: a layered intake drum, emblem, and paired sensor feelers.

  const nose = b.part(
    new THREE.CylinderGeometry(0.145, 0.165, 0.13, 12, 1, false),
    WEATHERED,
    {
      at: [0, 1.08, 0.91],
      dir: [0, 0, 1],
      bone: spine.tip,
      flat: true,
      name: "windNose",
      group: "front",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.116, 0.116, 0.145, 12, 1, false),
    JOINT,
    {
      at: [0, 1.08, 0.985],
      dir: [0, 0, 1],
      bone: spine.tip,
      flat: true,
      name: "noseDarkRing",
      group: "front",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.098, 0.098, 0.16, 12, 1, false),
    AXLE_HIGHLIGHT,
    {
      at: [0, 1.08, 1.015],
      dir: [0, 0, 1],
      bone: spine.tip,
      flat: true,
      name: "noseOrangeRing",
      group: "front",
    },
  );

  b.part(
    new THREE.CylinderGeometry(0.075, 0.075, 0.17, 12, 1, false),
    DEEP,
    {
      at: [0, 1.08, 1.045],
      dir: [0, 0, 1],
      bone: spine.tip,
      flat: true,
      name: "noseAperture",
      group: "front",
    },
  );

  b.decal(nose, WIND_EMBLEM, {
    at: [0, 1.08, 1.052],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.145, 0.145],
    segments: 10,
    lift: 0.003,
    bone: spine.tip,
    name: "windEmblem",
    group: "front",
  });

  b.sweep(sensorL, [0.021, 0.010], {
    color: STRUT,
    section: { ngon: 6 },
    caps: "round",
    name: "leftWindWhisker",
    group: "sensors",
  });

  b.sweep(sensorR, [0.021, 0.010], {
    color: STRUT,
    section: { ngon: 6 },
    caps: "round",
    name: "rightWindWhisker",
    group: "sensors",
  });

  b.spike(sensorL.tip, sensorL.tip, 0.12, 0.025, {
    color: AXLE_HIGHLIGHT,
    section: { ngon: 7 },
    name: "leftSensorFlag",
    group: "sensors",
  });

  b.spike(sensorR.tip, sensorR.tip, 0.12, 0.025, {
    color: AXLE_HIGHLIGHT,
    section: { ngon: 7 },
    name: "rightSensorFlag",
    group: "sensors",
  });

  for (const side of [1, -1]) {
    const p = v(side * 0.11, 1.19, 0.93);
    b.part(
      new THREE.SphereGeometry(0.032, 8, 5),
      AXLE_HIGHLIGHT,
      {
        at: p,
        bone: spine.tip,
        flat: true,
        name: `frontEye${side > 0 ? "L" : "R"}`,
        group: "front",
      },
    );
  }

  // A pair of small front chevrons and a serial placard make the machine's purpose legible.
  for (const side of [1, -1]) {
    b.part(
      new THREE.PlaneGeometry(0.20, 0.055),
      "#ffffff",
      {
        at: [side * 0.21, 1.14, 0.86],
        dir: [0, 0, 1],
        axis: "z",
        texture: WARNING_TEXTURE,
        bone: spine.tip,
        rotation: [0, 0, side > 0 ? 10 : -10],
        name: `frontChevron${side > 0 ? "L" : "R"}`,
        group: "markings",
      },
    );
  }

  for (const side of [1, -1]) {
    b.part(
      new THREE.PlaneGeometry(0.34, 0.08),
      "#ffffff",
      {
        at: [side * 0.225, 1.115, -0.15],
        dir: [side, 0, 0],
        axis: "z",
        texture: SERIAL_TEXTURE,
        bone: spine.jointAt(0.47),
        name: `serialPlate${side > 0 ? "L" : "R"}`,
        group: "markings",
      },
    );
  }

  // Small upper and lower front rails frame the nose like a stylized beak.
  b.rod(
    v(-0.26, 1.19, 0.73),
    v(0.26, 1.19, 0.73),
    0.017,
    {
      color: BODY,
      bone: spine.tip,
      section: { ngon: 6 },
      name: "upperNoseRail",
      group: "front",
    },
  );

  b.rod(
    v(-0.20, 0.96, 0.76),
    v(0.20, 0.96, 0.76),
    0.016,
    {
      color: STRUT,
      bone: spine.tip,
      section: { ngon: 6 },
      name: "lowerNoseRail",
      group: "front",
    },
  );

  // A few painted bands break up the repeated ivory tubes without losing the low-poly puppet language.
  const bandPaint = paint((_p, n) => (n.y > 0.2 ? "#d88a43" : "#8b4933"));

  for (const leg of legs.filter((entry) => entry.index === 1 || entry.index === 4)) {
    b.sweep(
      polyline([
        leg.knee.clone().add(v(0, -0.048, 0)),
        leg.knee.clone().add(v(0, 0.048, 0)),
      ]),
      0.064,
      {
        color: bandPaint,
        bone: leg.chain.joints[1],
        section: { ngon: 7 },
        caps: "round",
        name: `paintedKneeBand${leg.sideName}${leg.index + 1}`,
        group: "markings",
      },
    );
  }

  return b.root;
}

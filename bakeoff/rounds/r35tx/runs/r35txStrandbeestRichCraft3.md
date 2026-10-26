```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, paint, rng, svg } from "agentic-3js-builder";

const PVC = paint((p, n, _s) => {
  const warm = 0.5 + 0.5 * Math.sin(p.z * 24 + p.x * 9 + p.y * 17);
  if (n.y < -0.45) return warm > 0.52 ? "#9b6323" : "#74431d";
  if (n.y > 0.48) return warm > 0.5 ? "#f2d76b" : "#d9b642";
  return warm > 0.55 ? "#e6c451" : "#c9932f";
});

const PVC_LIGHT = "#f0d45e";
const PVC_BLUE = "#376d7d";
const PVC_RUST = "#bd642d";
const JOINT = "#172125";
const JOINT_HIGHLIGHT = "#36464a";
const AXLE = "#596467";
const RUBBER = "#191d20";
const INK = "#151b20";
const CREAM = "#f2e4ad";

const SAIL_A = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M10 118 L10 8 L118 118 Z" fill="#e2b83f"/>
    <path d="M18 104 L18 22 L101 104 Z" fill="#f2d96b"/>
    <path d="M12 102 L108 112 M12 82 L89 111 M12 60 L65 111 M12 38 L42 111" stroke="#8d5922" stroke-width="4" opacity=".8"/>
    <path d="M19 18 L109 111" stroke="#fff1a2" stroke-width="3" opacity=".8"/>
    <path d="M27 11 L111 11 L111 20 L27 20 Z" fill="#273f43"/>
  </svg>`,
  { size: 256 },
);

const SAIL_B = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M12 116 L12 12 L116 116 Z" fill="#5e9d9b"/>
    <path d="M19 102 L19 28 L94 102 Z" fill="#a9d3b7"/>
    <path d="M15 94 L105 111 M15 71 L79 111 M15 48 L53 111" stroke="#2e5960" stroke-width="4"/>
    <circle cx="34" cy="35" r="9" fill="#e8c952"/>
    <path d="M34 26 L34 44 M25 35 L43 35" stroke="#263d40" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const RIBBON_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 160">
    <path d="M5 4 H59 V150 L32 136 L5 150 Z" fill="#d9e3c1"/>
    <path d="M5 20 L59 42 M5 50 L59 72 M5 80 L59 102 M5 110 L59 132" stroke="#3d7780" stroke-width="9"/>
    <path d="M5 8 L59 30 M5 38 L59 60 M5 68 L59 90 M5 98 L59 120" stroke="#e8bd48" stroke-width="4"/>
    <path d="M5 4 H59 V150 L32 136 L5 150 Z" fill="none" stroke="#202e32" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const WIND_ICON = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="60" fill="#e8d99b" stroke="#1d292d" stroke-width="6"/>
    <path d="M25 49 C42 24 90 28 96 52 C101 72 71 79 58 66 C48 56 57 43 71 47
             M24 72 C39 96 83 101 96 78 C106 60 88 51 75 59
             M41 89 C54 105 78 100 84 87"
          fill="none" stroke="#397b83" stroke-width="7" stroke-linecap="round"/>
    <path d="M64 18 L64 33 M110 64 L95 64 M64 110 L64 95 M18 64 L33 64"
          stroke="#bd642d" stroke-width="5" stroke-linecap="round"/>
    <circle cx="64" cy="64" r="8" fill="#172125"/>
  </svg>`,
  { size: 256 },
);

const AXLE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <circle cx="48" cy="48" r="44" fill="#b8c2b7" stroke="#172125" stroke-width="7"/>
    <circle cx="48" cy="48" r="28" fill="#617275" stroke="#26363a" stroke-width="4"/>
    <circle cx="48" cy="48" r="10" fill="#e3c451" stroke="#172125" stroke-width="4"/>
    <path d="M48 9 V24 M87 48 H72 M48 87 V72 M9 48 H24" stroke="#e9d56e" stroke-width="5"/>
  </svg>`,
  { size: 192 },
);

const LABEL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 72">
    <rect x="3" y="3" width="250" height="66" rx="8" fill="#e8dfb2" stroke="#1e2a2d" stroke-width="6"/>
    <path d="M18 51 H238" stroke="#bd642d" stroke-width="5"/>
    <text x="128" y="40" text-anchor="middle" font-family="monospace" font-weight="bold"
      font-size="25" letter-spacing="3" fill="#1e2a2d">WIND / WALK</text>
  </svg>`,
  { size: 256 },
);

const WARNING_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 96">
    <rect width="128" height="96" fill="#e3c34d"/>
    <path d="M-20 96 L26 0 H49 L3 96 Z M35 96 L81 0 H104 L58 96 Z M90 96 L136 0 H159 L113 96 Z"
      fill="#202b2d"/>
    <rect x="3" y="3" width="122" height="90" fill="none" stroke="#f4e7a8" stroke-width="6"/>
  </svg>`,
  { size: 192 },
);

const BLADE: [number, number][] = [
  [0.018, 0],
  [0.105, 0.045],
  [0.078, 0.255],
  [0.026, 0.345],
  [-0.019, 0.225],
  [-0.016, 0.06],
];

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A low-poly Theo Jansen-inspired strandbeest assembled from warm PVC tubes, articulated black joints, crank axles, a four-bladed wind rotor, and a striped beach sail.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one central spine, ten articulated legs, a tail fan, and a wind-catching mast.

  const bodyRoot = b.joint("bodyRoot", {
    at: [0, 0.91, -0.86],
    dir: [0, 0, 1],
    role: "spine",
    group: "skeleton",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.9, -1.08],
      [0, 0.91, -0.58],
      [0, 0.93, -0.05],
      [0, 0.94, 0.5],
      [0, 0.96, 1.1],
    ]),
    {
      parent: bodyRoot,
      names: ["spineRear", "spineMidRear", "spineCenter", "spineMidFront", "spineFront"],
      role: "spine",
      group: "skeleton",
    },
  );

  const spineTip = spine.tip ?? spine.joints[spine.joints.length - 1];

  const head = b.joint("windHead", {
    parent: spineTip,
    at: [0, 0.95, 1.16],
    dir: [0, 0, 1],
    role: "head",
    group: "skeleton",
  });

  const rotor = b.joint("windRotor", {
    parent: head,
    at: [0, 0.95, 1.35],
    dir: [0, 0, 1],
    role: "hinge",
    group: "skeleton",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.9, -1.06],
      [0, 0.96, -1.34],
      [0, 1.08, -1.58],
      [0, 1.2, -1.76],
    ]),
    {
      parent: bodyRoot,
      names: ["tailBase", "tailMid", "tailEnd", "tailTip"],
      role: "tail",
      group: "skeleton",
    },
  );

  const mast = b.chain(
    "windMast",
    catmull([
      [0, 0.99, -0.48],
      [0, 1.4, -0.48],
      [0, 1.86, -0.48],
    ]),
    {
      parent: spine.joints[1],
      names: ["mastBase", "mastMid", "mastTip"],
      role: "fan",
      group: "skeleton",
    },
  );

  const legEntries: Array<{
    side: number;
    index: number;
    points: THREE.Vector3[];
    chain: any;
    target: THREE.Vector3;
    parent: any;
  }> = [];

  const legZ = [-0.78, -0.37, 0.04, 0.47, 0.88];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const stagger = i % 2 === 0 ? 0.14 : -0.14;
      const root = new THREE.Vector3(side * 0.145, 0.84, z);
      const target = new THREE.Vector3(side * 0.68, 0.095, z + stagger);
      const points = limb(
        root,
        target,
        [0.36, 0.46, 0.38],
        [
          [0, 0, 1],
          [0, 0, -1],
        ],
      );

      const parent = spine.jointAt(Math.min(0.96, Math.max(0.04, (z + 1.08) / 2.18)));
      const chain = b.chain(`leg${sideName}${i + 1}`, points, {
        parent,
        names: [
          `hip${sideName}${i + 1}`,
          `knee${sideName}${i + 1}`,
          `ankle${sideName}${i + 1}`,
          `foot${sideName}${i + 1}`,
        ],
        role: "leg",
        contact: [target.x, 0, target.z],
        group: "legs",
      });

      legEntries.push({ side, index: i, points, chain, target, parent });
    }
  }

  // A slight rest-pose turn makes the rotor feel like a mechanism without disturbing the walking stance.
  b.pose(rotor, { axis: [0, 0, 1], deg: 18 });

  // ---------------------------------------------------------------------------------------------------------------
  // Reusable mechanical helpers.

  const collar = (on: any, ringRadius: number, tubeRadius: number, color: any, name: string) => {
    const ring = b.ring(on, { count: 8, radius: ringRadius });
    return b.sweep(catmull(ring.items, { closed: true }), tubeRadius, {
      color,
      section: { ngon: 6 },
      caps: "none",
      name,
      group: "collars",
    });
  };

  const jointHardware = (joint: any, size: number, name: string) => {
    b.part(new THREE.SphereGeometry(size, 8, 6), JOINT, {
      frame: joint,
      bone: joint,
      flat: true,
      name: `${name}_knuckle`,
      group: "joints",
    });

    b.part(new THREE.CylinderGeometry(size * 0.72, size * 0.72, size * 1.8, 8), AXLE, {
      frame: joint,
      dir: [1, 0, 0],
      bone: joint,
      flat: true,
      name: `${name}_axle`,
      group: "joints",
    });
  };

  // ---------------------------------------------------------------------------------------------------------------
  // Central body and its visible side-frame.

  const bodyTube = b.sweep(spine, (t) => 0.135 - 0.022 * t, {
    color: PVC,
    section: "circle",
    sides: 8,
    smooth: false,
    caps: "round",
    name: "faceted_body_tube",
    group: "body",
  });

  b.rod([-0.2, 0.985, -1.1], [-0.2, 0.995, 1.13], 0.037, {
    color: PVC,
    bone: bodyRoot,
    section: { ngon: 6 },
    name: "left_body_rail",
    group: "body",
  });

  b.rod([0.2, 0.985, -1.1], [0.2, 0.995, 1.13], 0.037, {
    color: PVC,
    bone: bodyRoot,
    section: { ngon: 6 },
    name: "right_body_rail",
    group: "body",
  });

  const bodyStations = [0.06, 0.27, 0.49, 0.71, 0.92];

  for (let i = 0; i < bodyStations.length; i++) {
    const t = bodyStations[i];
    const p = spine.at(t);
    const bodyBone = p.bone ?? bodyRoot;

    b.rod([-0.31, p.at.y, p.at.z], [0.31, p.at.y, p.at.z], 0.019, {
      color: AXLE,
      bone: bodyBone,
      section: { ngon: 6 },
      name: `crossbar_${i}`,
      group: "body_frame",
    });

    for (const side of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(0.078, 0.078, 0.04, 10), JOINT_HIGHLIGHT, {
        at: [side * 0.285, p.at.y, p.at.z],
        dir: [1, 0, 0],
        bone: bodyBone,
        texture: AXLE_TEX,
        flat: true,
        name: `body_wheel_${side > 0 ? "L" : "R"}_${i}`,
        group: "axles",
      });

      b.part(new THREE.CircleGeometry(0.052, 12), CREAM, {
        at: [side * 0.308, p.at.y, p.at.z],
        dir: [side, 0, 0],
        axis: "z",
        bone: bodyBone,
        texture: AXLE_TEX,
        flat: true,
        name: `body_bolt_${side > 0 ? "L" : "R"}_${i}`,
        group: "axles",
      });
    }

    collar(p, 0.142, 0.011, JOINT, `body_collar_${i}`);
  }

  for (let i = 0; i < bodyStations.length - 1; i++) {
    const z0 = spine.at(bodyStations[i]).at.z;
    const z1 = spine.at(bodyStations[i + 1]).at.z;

    for (const side of [-1, 1]) {
      b.rod([side * 0.2, 0.995, z0 + 0.07], [side * 0.2, 0.79, z1 - 0.07], 0.014, {
        color: PVC_LIGHT,
        bone: bodyRoot,
        section: { ngon: 6 },
        name: `diagonal_body_brace_${side > 0 ? "L" : "R"}_${i}`,
        group: "body_frame",
      });
    }
  }

  const bodySurface = b.surface(bodyTube);

  for (const hit of bodySurface.scatter(24, {
    rng: rng(108),
    minDist: 0.13,
    filter: (h) => h.n.y > -0.3,
  })) {
    b.stick(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 7), PVC_LIGHT, hit, {
      embed: 0.45,
      flat: true,
      name: "body_rivet",
      group: "rivets",
    });
  }

  for (const side of [-1, 1]) {
    b.decal(bodyTube, LABEL_TEX, {
      at: [side * 0.125, 0.95, 0.23],
      dir: [side, 0, 0],
      up: [0, 1, 0],
      size: [0.24, 0.075],
      segments: 5,
      lift: 0.003,
      mirror: side < 0,
      name: `side_label_${side > 0 ? "L" : "R"}`,
      group: "markings",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ten Jansen-style legs: a primary bent tube, triangular braces, collars, crank bosses, and broad foot pads.

  for (const entry of legEntries) {
    const { side, index, chain, target } = entry;
    const sideName = side > 0 ? "L" : "R";
    const legName = `${sideName}${index + 1}`;

    b.sweep(chain, (t) => 0.036 - 0.011 * t, {
      color: PVC,
      section: "circle",
      sides: 6,
      smooth: false,
      caps: "round",
      name: `leg_${legName}_main`,
      group: "legs",
    });

    b.rod(chain.at(0), chain.at(0.58), 0.017, {
      color: PVC_LIGHT,
      section: { ngon: 6 },
      name: `leg_${legName}_front_strut`,
      group: "leg_struts",
    });

    b.rod(chain.at(0.3), chain.at(1), 0.015, {
      color: PVC_RUST,
      section: { ngon: 6 },
      name: `leg_${legName}_rear_strut`,
      group: "leg_struts",
    });

    b.rod(chain.at(0.13), chain.at(0.83), 0.011, {
      color: AXLE,
      section: { ngon: 6 },
      name: `leg_${legName}_thin_link`,
      group: "leg_struts",
    });

    collar(chain.at(0.28), 0.044, 0.009, JOINT, `leg_${legName}_collar_a`);
    collar(chain.at(0.63), 0.039, 0.009, JOINT, `leg_${legName}_collar_b`);

    for (let j = 0; j < chain.joints.length; j++) {
      jointHardware(chain.joints[j], j === 0 ? 0.057 : 0.047, `leg_${legName}_${j}`);
    }

    const foot = target.clone();
    foot.y = 0.056;

    b.part(new THREE.BoxGeometry(0.18, 0.07, 0.14), RUBBER, {
      at: foot,
      bone: chain.tip ?? chain.joints[chain.joints.length - 1],
      flat: true,
      name: `foot_${legName}_sole`,
      group: "feet",
    });

    b.part(new THREE.BoxGeometry(0.13, 0.026, 0.105), PVC_LIGHT, {
      at: [foot.x, 0.099, foot.z],
      bone: chain.tip ?? chain.joints[chain.joints.length - 1],
      flat: true,
      name: `foot_${legName}_cap`,
      group: "feet",
    });

    b.part(new THREE.PlaneGeometry(0.105, 0.07), "#ffffff", {
      at: [foot.x, 0.114, foot.z],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      axis: "z",
      bone: chain.tip ?? chain.joints[chain.joints.length - 1],
      texture: WARNING_TEX,
      name: `foot_${legName}_warning`,
      group: "feet",
    });

    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 6), PVC_BLUE, {
      at: [foot.x, 0.098, foot.z - 0.048],
      dir: [0, 0, 1],
      bone: chain.tip ?? chain.joints[chain.joints.length - 1],
      flat: true,
      name: `foot_${legName}_toe_bar`,
      group: "feet",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tapered tail and the three-pronged rear wind fork.

  b.sweep(tail, (t) => 0.078 - 0.045 * t, {
    color: PVC,
    section: "circle",
    sides: 7,
    smooth: false,
    caps: "round",
    name: "tapered_tail",
    group: "tail",
  });

  for (const t of [0.24, 0.5, 0.76]) {
    collar(tail.at(t), 0.075 - t * 0.025, 0.009, JOINT, `tail_collar_${Math.round(t * 100)}`);
  }

  const tailTip = tail.at(1);
  const tailFanPoints = [
    new THREE.Vector3(-0.4, 1.34, -1.82),
    new THREE.Vector3(0, 1.51, -1.92),
    new THREE.Vector3(0.4, 1.34, -1.82),
  ];

  for (let i = 0; i < tailFanPoints.length; i++) {
    b.rod(tailTip, tailFanPoints[i], 0.014, {
      color: PVC_LIGHT,
      bone: tail.tip ?? tail.joints[tail.joints.length - 1],
      section: { ngon: 6 },
      name: `tail_fan_arm_${i}`,
      group: "tail_fan",
    });
  }

  b.part(new THREE.SphereGeometry(0.066, 8, 6), JOINT, {
    frame: tail.tip ?? tail.joints[tail.joints.length - 1],
    bone: tail.tip ?? tail.joints[tail.joints.length - 1],
    flat: true,
    name: "tail_fan_hub",
    group: "tail_fan",
  });

  for (const side of [-1, 1]) {
    b.part(new THREE.PlaneGeometry(0.29, 0.35), "#ffffff", {
      at: [side * 0.275, 1.29, -1.79],
      dir: [0, 0, 1],
      axis: "z",
      bone: tail.tip ?? tail.joints[tail.joints.length - 1],
      texture: RIBBON_TEX,
      name: `tail_flag_${side > 0 ? "L" : "R"}_front`,
      group: "tail_fan",
    });

    b.part(new THREE.PlaneGeometry(0.29, 0.35), "#ffffff", {
      at: [side * 0.275, 1.29, -1.805],
      dir: [0, 0, -1],
      axis: "z",
      bone: tail.tip ?? tail.joints[tail.joints.length - 1],
      texture: RIBBON_TEX,
      name: `tail_flag_${side > 0 ? "L" : "R"}_back`,
      group: "tail_fan",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head pod and front wind rotor.

  b.rod([0, 0.95, 1.08], [0, 0.95, 1.31], 0.085, {
    color: PVC,
    bone: head,
    section: { ngon: 8 },
    name: "wind_nose_tube",
    group: "head",
  });

  b.part(new THREE.CylinderGeometry(0.164, 0.164, 0.045, 12), JOINT, {
    at: [0, 0.95, 1.285],
    dir: [0, 0, 1],
    bone: head,
    flat: true,
    name: "wind_face_rim",
    group: "head",
  });

  b.part(new THREE.CircleGeometry(0.128, 20), "#ffffff", {
    at: [0, 0.95, 1.311],
    dir: [0, 0, 1],
    axis: "z",
    bone: head,
    texture: WIND_ICON,
    name: "wind_face_emblem",
    group: "head",
  });

  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.075, 12), AXLE, {
    at: [0, 0.95, 1.39],
    dir: [0, 0, 1],
    bone: rotor,
    texture: AXLE_TEX,
    flat: true,
    name: "front_rotor_hub",
    group: "rotor",
  });

  const rotorCenter = new THREE.Vector3(0, 0.95, 1.405);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 18 * (Math.PI / 180);
    const xAxis: [number, number, number] = [Math.cos(angle), Math.sin(angle), 0];
    const yAxis: [number, number, number] = [-Math.sin(angle), Math.cos(angle), 0];

    b.extrude(BLADE, {
      at: rotorCenter,
      x: xAxis,
      y: yAxis,
      thickness: 0.022,
      bevel: 0.004,
      smoothing: 1,
      bone: rotor,
      color: i % 2 === 0 ? PVC_LIGHT : PVC_BLUE,
      name: `rotor_blade_${i}`,
      group: "rotor",
    });

    b.part(new THREE.SphereGeometry(0.018, 7, 5), CREAM, {
      at: [0, 0.95, 1.438],
      bone: rotor,
      flat: true,
      name: `rotor_bolt_${i}`,
      group: "rotor",
    });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Tall wind mast, triangular sail, striped streamers, and a small top pennant.

  b.sweep(mast, [0.035, 0.022], {
    color: PVC,
    section: "circle",
    sides: 6,
    smooth: false,
    caps: "round",
    name: "wind_mast_tube",
    group: "mast",
  });

  for (const y of [1.14, 1.48, 1.78]) {
    b.rod([-0.53, y, -0.48], [0.53, y, -0.48], 0.014, {
      color: AXLE,
      bone: mast.joints[1],
      section: { ngon: 6 },
      name: `mast_crossbar_${y.toFixed(2)}`,
      group: "mast",
    });
  }

  b.part(new THREE.PlaneGeometry(0.94, 0.86), "#ffffff", {
    at: [0, 1.43, -0.455],
    dir: [0, 0, 1],
    axis: "z",
    bone: mast.joints[1],
    texture: SAIL_A,
    name: "main_wind_sail_front",
    group: "sail",
  });

  b.part(new THREE.PlaneGeometry(0.94, 0.86), "#ffffff", {
    at: [0, 1.43, -0.472],
    dir: [0, 0, -1],
    axis: "z",
    bone: mast.joints[1],
    texture: SAIL_A,
    name: "main_wind_sail_back",
    group: "sail",
  });

  b.rod([-0.46, 1.02, -0.43], [0.46, 1.02, -0.43], 0.014, {
    color: PVC_BLUE,
    bone: mast.joints[1],
    section: { ngon: 6 },
    name: "sail_lower_boom",
    group: "sail_frame",
  });

  b.rod([-0.46, 1.84, -0.43], [0.46, 1.84, -0.43], 0.014, {
    color: PVC_BLUE,
    bone: mast.joints[1],
    section: { ngon: 6 },
    name: "sail_upper_boom",
    group: "sail_frame",
  });

  b.rod([-0.46, 1.03, -0.43], [0.02, 1.83, -0.43], 0.012, {
    color: JOINT,
    bone: mast.joints[1],
    section: { ngon: 6 },
    name: "sail_leading_edge",
    group: "sail_frame",
  });

  b.rod([0.46, 1.03, -0.43], [-0.02, 1.83, -0.43], 0.012, {
    color: JOINT,
    bone: mast.joints[1],
    section: { ngon: 6 },
    name: "sail_trailing_edge",
    group: "sail_frame",
  });

  for (const side of [-1, 1]) {
    b.part(new THREE.PlaneGeometry(0.23, 0.68), "#ffffff", {
      at: [side * 0.57, 1.38, -0.455],
      dir: [0, 0, 1],
      axis: "z",
      bone: mast.joints[1],
      texture: RIBBON_TEX,
      name: `mast_ribbon_${side > 0 ? "L" : "R"}_front`,
      group: "sail",
    });

    b.part(new THREE.PlaneGeometry(0.23, 0.68), "#ffffff", {
      at: [side * 0.57, 1.38, -0.472],
      dir: [0, 0, -1],
      axis: "z",
      bone: mast.joints[1],
      texture: RIBBON_TEX,
      name: `mast_ribbon_${side > 0 ? "L" : "R"}_back`,
      group: "sail",
    });
  }

  b.extrude(
    [
      [-0.25, 0],
      [0.25, 0],
      [0.14, 0.085],
      [-0.14, 0.085],
    ],
    {
      at: [0, 1.87, -0.47],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.004,
      smoothing: 1,
      bone: mast.tip ?? mast.joints[mast.joints.length - 1],
      color: PVC_RUST,
      name: "mast_top_pennant",
      group: "mast",
    },
  );

  b.part(new THREE.SphereGeometry(0.043, 8, 6), JOINT_HIGHLIGHT, {
    frame: mast.tip ?? mast.joints[mast.joints.length - 1],
    bone: mast.tip ?? mast.joints[mast.joints.length - 1],
    flat: true,
    name: "mast_top_cap",
    group: "mast",
  });

  // A pair of small blue plates below the sail visually locks the mast into the body frame.
  for (const side of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.12, 0.16, 0.035), PVC_BLUE, {
      at: [side * 0.14, 1.03, -0.48],
      bone: spine.joints[1],
      flat: true,
      name: `mast_foot_plate_${side > 0 ? "L" : "R"}`,
      group: "mast",
    });

    b.part(new THREE.CircleGeometry(0.029, 10), CREAM, {
      at: [side * 0.14, 1.03, -0.503],
      dir: [0, 0, -1],
      axis: "z",
      bone: spine.joints[1],
      texture: AXLE_TEX,
      flat: true,
      name: `mast_foot_bolt_${side > 0 ? "L" : "R"}`,
      group: "mast",
    });
  }

  return b.root;
}
```
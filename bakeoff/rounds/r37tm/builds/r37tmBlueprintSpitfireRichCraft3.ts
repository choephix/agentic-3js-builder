import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  line,
  paint,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Cyanotype Spitfire",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with elliptical wings, clipped tail, canopy, propeller, landing gear, panel lines, and blueprint roundels.",
};

export default function build() {
  const b = createBuilder({ name: "spitfire-blueprint", detail: 1 });

  const NAVY = "#052c4b";
  const DEEP = "#041c34";
  const BLUE = "#0a4168";
  const CYAN = "#45d9e7";
  const PALE = "#b9fbff";
  const WHITE = "#e2ffff";
  const ACCENT = "#168eb2";
  const INK = "#021426";

  const blueprintMetal = paint((_p, n) => {
    if (n.y > 0.55) return CYAN;
    if (n.z > 0.35) return "#237fa2";
    if (n.y < -0.35) return DEEP;
    return BLUE;
  });

  const bodyPaint = paint((_p, n) => {
    const top = n.y > 0.18;
    const front = n.z > 0.3;
    if (top && front) return "#0d668c";
    if (top) return "#0b557c";
    if (n.y < -0.45) return DEEP;
    return NAVY;
  });

  const blueprintGrid = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#052c4b"/>
      <g stroke="#47dbea" stroke-width="1.2" opacity=".42">
        <path d="M0 16H128M0 32H128M0 48H128M0 64H128M0 80H128M0 96H128M0 112H128"/>
        <path d="M16 0V128M32 0V128M48 0V128M64 0V128M80 0V128M96 0V128M112 0V128"/>
      </g>
      <g stroke="#b9fbff" stroke-width=".7" opacity=".75">
        <path d="M0 8H128M0 40H128M0 72H128M0 104H128"/>
        <path d="M8 0V128M40 0V128M72 0V128M104 0V128"/>
      </g>
    </svg>`,
    { size: 256, pixelated: true },
  );

  const roundel = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#052c4b" stroke="#b9fbff" stroke-width="4"/>
      <circle cx="50" cy="50" r="34" fill="#45d9e7"/>
      <circle cx="50" cy="50" r="21" fill="#052c4b"/>
      <path d="M50 30L55 45L70 50L55 55L50 70L45 55L30 50L45 45Z" fill="#b9fbff"/>
    </svg>`,
    { size: 256 },
  );

  const canopyTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <rect width="160" height="100" fill="#073b5e"/>
      <path d="M8 86 Q28 14 80 9 Q132 14 152 86 Q119 70 80 72 Q41 70 8 86Z"
        fill="#126a8b" stroke="#b9fbff" stroke-width="4"/>
      <path d="M80 10V72M27 27Q55 46 80 42Q105 46 133 27M18 57Q48 68 80 64Q112 68 142 57"
        fill="none" stroke="#45d9e7" stroke-width="3"/>
      <path d="M43 17Q57 34 58 70M117 17Q103 34 102 70" fill="none"
        stroke="#b9fbff" stroke-width="2" opacity=".8"/>
      <path d="M24 82Q80 59 136 82" fill="none" stroke="#021426" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const serialTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64">
      <rect width="240" height="64" rx="5" fill="#052c4b" stroke="#b9fbff" stroke-width="3"/>
      <text x="120" y="28" text-anchor="middle" font-family="monospace"
        font-size="18" font-weight="bold" fill="#b9fbff">MK. IX • BLUEPRINT</text>
      <text x="120" y="49" text-anchor="middle" font-family="monospace"
        font-size="11" fill="#45d9e7">ROLL • PITCH • YAW</text>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first: one airframe root, a segmented fuselage, and a propeller hinge.
  const airframe = b.joint("airframe", {
    at: [0, 0.82, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "airframe",
  });

  const propeller = b.joint("propeller", {
    parent: airframe,
    at: [0, 0.9, 3.34],
    dir: [0, 0, 1],
    role: "hinge",
    group: "propeller",
  });

  const fuselagePath = catmull([
    [0, 0.76, -3.25],
    [0, 0.78, -2.45],
    [0, 0.82, -1.2],
    [0, 0.88, 0.55],
    [0, 0.94, 1.85],
    [0, 0.94, 2.75],
    [0, 0.9, 3.34],
  ]);

  const fuselage = b.chain("fuselage", fuselagePath, {
    parent: airframe,
    names: ["tail", "rear", "mid", "front", "nose", "spinner"],
    role: "spine",
    group: "airframe",
  });

  b.sweep(fuselage, (t) => {
    const r = t < 0.16 ? 0.24 + t * 0.55 : 0.33 + 0.12 * Math.sin(t * Math.PI);
    return [r, r * 0.92];
  }, {
    color: bodyPaint,
    sides: 8,
    caps: "round",
    group: "fuselage",
    name: "fuselageShell",
  });

  // Nose ring and spinner.
  b.sweep(
    catmull([
      [0, 0.9, 2.68],
      [0, 0.9, 2.9],
      [0, 0.9, 3.12],
      [0, 0.9, 3.34],
    ]),
    [0.27, 0.045],
    {
      color: blueprintMetal,
      bone: airframe,
      caps: "round",
      sides: 8,
      group: "nose",
      name: "cowling",
    },
  );

  b.part(new THREE.CylinderGeometry(0.285, 0.285, 0.045, 12), CYAN, {
    bone: airframe,
    at: [0, 0.9, 3.04],
    dir: [0, 0, 1],
    group: "nose",
    name: "noseRing",
  });

  b.spike([0, 0.9, 3.28], [0, 0, 1], 0.28, 0.19, {
    bone: propeller,
    color: PALE,
    caps: "point",
    group: "propeller",
    name: "spinner",
  });

  // Main elliptical wings, each made as a thick polygonal plate.
  const wingL = b.slab(
    [
      [-0.12, 0.86, 1.45],
      [1.0, 0.84, 1.32],
      [2.25, 0.8, 0.88],
      [3.18, 0.77, 0.22],
      [3.4, 0.76, -0.42],
      [2.98, 0.78, -1.2],
      [2.1, 0.81, -1.52],
      [0.68, 0.84, -1.28],
      [0.1, 0.85, -0.62],
    ],
    {
      color: blueprintMetal,
      thickness: 0.1,
      bone: airframe,
      group: "wings",
      name: "wingL",
    },
  );

  const wingR = b.slab(
    [
      [0.12, 0.86, 1.45],
      [-1.0, 0.84, 1.32],
      [-2.25, 0.8, 0.88],
      [-3.18, 0.77, 0.22],
      [-3.4, 0.76, -0.42],
      [-2.98, 0.78, -1.2],
      [-2.1, 0.81, -1.52],
      [-0.68, 0.84, -1.28],
      [-0.1, 0.85, -0.62],
    ],
    {
      color: blueprintMetal,
      thickness: 0.1,
      bone: airframe,
      group: "wings",
      name: "wingR",
    },
  );

  // Wing roots and characteristic swept leading-edge strips.
  for (const s of [1, -1]) {
    b.rod([s * 0.1, 0.91, 1.42], [s * 3.15, 0.82, 0.22], 0.035, {
      bone: airframe,
      color: PALE,
      group: "wingLines",
      name: `leadingEdge${s > 0 ? "L" : "R"}`,
    });
    b.rod([s * 0.62, 0.91, -1.22], [s * 2.18, 0.86, -1.44], 0.025, {
      bone: airframe,
      color: CYAN,
      group: "wingLines",
      name: `trailingEdge${s > 0 ? "L" : "R"}`,
    });
    b.rod([s * 0.78, 0.92, 0.72], [s * 2.55, 0.86, 0.62], 0.018, {
      bone: airframe,
      color: CYAN,
      group: "wingLines",
      name: `spar${s > 0 ? "L" : "R"}`,
    });

    // Top-view RAF-inspired cyanotype roundels.
    b.part(new THREE.CircleGeometry(0.34, 20), WHITE, {
      bone: airframe,
      at: [s * 1.78, 0.925, -0.28],
      dir: [0, 1, 0],
      axis: "z",
      texture: roundel,
      group: "markings",
      name: `roundel${s > 0 ? "L" : "R"}`,
    });
  }

  // Cockpit sill and canopy, placed above the fuselage behind the wing.
  b.part(new THREE.SphereGeometry(1, 16, 10), BLUE, {
    bone: airframe,
    at: [0, 1.11, 0.98],
    scale: [0.34, 0.28, 0.72],
    texture: canopyTexture,
    group: "cockpit",
    name: "canopy",
  });

  b.rod([-0.31, 1.12, 0.4], [0.31, 1.12, 0.4], 0.035, {
    bone: airframe,
    color: PALE,
    group: "cockpit",
    name: "canopySillFront",
  });
  b.rod([-0.34, 1.1, 1.56], [0.34, 1.1, 1.56], 0.035, {
    bone: airframe,
    color: PALE,
    group: "cockpit",
    name: "canopySillRear",
  });

  // Horizontal tailplane.
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.02, 0.91, -2.2],
        [s * 0.72, 0.89, -2.22],
        [s * 1.34, 0.87, -2.66],
        [s * 1.18, 0.87, -3.02],
        [s * 0.34, 0.89, -2.88],
      ],
      {
        color: blueprintMetal,
        thickness: 0.07,
        bone: airframe,
        group: "tail",
        name: `tailplane${s > 0 ? "L" : "R"}`,
      },
    );
    b.rod([s * 0.12, 0.95, -2.28], [s * 1.19, 0.91, -2.7], 0.018, {
      bone: airframe,
      color: PALE,
      group: "tail",
      name: `tailLine${s > 0 ? "L" : "R"}`,
    });
  }

  // Tall fin and rudder, with a clipped Spitfire-like top.
  b.extrude(
    [
      [0, 0],
      [0.52, 0.03],
      [0.78, 0.42],
      [0.7, 1.08],
      [0.48, 1.62],
      [0.2, 1.83, "sharp"],
      [0.04, 1.72],
    ],
    {
      at: [-0.018, 0.88, -2.4],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.018,
      color: blueprintMetal,
      bone: airframe,
      group: "tail",
      name: "verticalFin",
    },
  );

  b.rod([-0.015, 1.04, -2.42], [0.015, 2.48, -2.42], 0.018, {
    bone: airframe,
    color: PALE,
    group: "tail",
    name: "finRidge",
  });

  // Elevator and rudder hinge lines.
  b.rod([-0.77, 0.95, -2.83], [0.77, 0.95, -2.83], 0.016, {
    bone: airframe,
    color: CYAN,
    group: "tailLines",
    name: "elevatorHinge",
  });
  b.rod([0.02, 1.35, -2.42], [0.02, 2.3, -2.42], 0.016, {
    bone: airframe,
    color: CYAN,
    group: "tailLines",
    name: "rudderHinge",
  });

  // Undercarriage: stout blueprint rods and two low-poly wheels.
  for (const s of [1, -1]) {
    b.rod([s * 0.42, 0.78, 0.35], [s * 0.72, 0.24, 0.22], 0.045, {
      bone: airframe,
      color: PALE,
      group: "landingGear",
      name: `gearLeg${s > 0 ? "L" : "R"}`,
    });
    b.rod([s * 0.72, 0.23, 0.22], [s * 0.72, 0.19, -0.05], 0.032, {
      bone: airframe,
      color: CYAN,
      group: "landingGear",
      name: `gearFork${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.09, 12), DEEP, {
      bone: airframe,
      at: [s * 0.72, 0.19, -0.08],
      dir: [1, 0, 0],
      group: "landingGear",
      name: `wheel${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.098, 12), CYAN, {
      bone: airframe,
      at: [s * 0.72, 0.19, -0.08],
      dir: [1, 0, 0],
      group: "landingGear",
      name: `wheelHub${s > 0 ? "L" : "R"}`,
    });
  }

  // Tail wheel.
  b.rod([0, 0.62, -2.7], [0, 0.2, -2.88], 0.026, {
    bone: airframe,
    color: CYAN,
    group: "landingGear",
    name: "tailWheelLeg",
  });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.075, 10), DEEP, {
    bone: airframe,
    at: [0, 0.12, -2.94],
    dir: [1, 0, 0],
    group: "landingGear",
    name: "tailWheel",
  });

  // Three broad propeller blades on the nose hinge.
  const bladeOutline: [number, number, "sharp"][] = [
    [-0.075, 0],
    [0.075, 0],
    [0.2, 0.5],
    [0.14, 1.2],
    [0.045, 1.58, "sharp"],
    [-0.03, 1.28],
    [-0.12, 0.56],
  ];
  for (const angle of [0, 120, 240]) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      (angle * Math.PI) / 180,
    );
    b.extrude(bladeOutline, {
      at: [0, 0.9, 3.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.012,
      quat: q,
      bone: propeller,
      color: PALE,
      group: "propeller",
      name: `propBlade${angle}`,
    });
  }

  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.13, 12), CYAN, {
    bone: propeller,
    at: [0, 0.9, 3.49],
    dir: [0, 0, 1],
    group: "propeller",
    name: "propHub",
  });

  // Fine cyanotype construction marks: fuselage station rings, wing-root bolts, and control panels.
  for (const z of [-2.45, -1.72, -0.8, 0.15, 1.1, 1.85, 2.45]) {
    const r = z > 2 ? 0.255 : z < -2 ? 0.22 : 0.34;
    b.sweep(
      catmull([
        [-r, 0.88, z],
        [0, 0.88 + r * 0.9, z],
        [r, 0.88, z],
        [0, 0.88 - r * 0.9, z],
        [-r, 0.88, z],
      ], { closed: true }),
      0.012,
      {
        bone: airframe,
        color: CYAN,
        sides: 5,
        caps: "flat",
        group: "constructionLines",
        name: `station${z}`,
      },
    );
  }

  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.SphereGeometry(0.025, 6, 4), PALE, {
        bone: airframe,
        at: [s * (0.82 + i * 0.33), 0.92, 0.95 - i * 0.14],
        group: "rivets",
        name: `wingRivet${s > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // A small blueprint title plate tucked behind the cockpit.
  b.part(new THREE.PlaneGeometry(0.72, 0.19), WHITE, {
    bone: airframe,
    at: [0, 1.14, -0.08],
    dir: [0, 1, 0],
    axis: "z",
    texture: serialTexture,
    group: "markings",
    name: "blueprintLabel",
  });

  // A few luminous cyan construction marks on the planform.
  const centerline = b.rod([0, 1.18, -2.65], [0, 1.18, 2.82], 0.009, {
    bone: airframe,
    color: PALE,
    group: "constructionLines",
    name: "centerline",
  });

  // Blueprint-grid cards sit behind the aircraft as a compact presentation panel,
  // sized to the aircraft footprint rather than becoming scenery.
  b.part(new THREE.PlaneGeometry(7.2, 5.6), NAVY, {
    bone: airframe,
    at: [0, 0.015, -0.1],
    dir: [0, 1, 0],
    axis: "z",
    texture: blueprintGrid,
    group: "blueprint",
    name: "blueprintSheet",
  });

  return b.root;
}

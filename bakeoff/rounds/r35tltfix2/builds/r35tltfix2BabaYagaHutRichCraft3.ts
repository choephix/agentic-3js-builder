import * as THREE from "three";
import { createBuilder, catmull, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A whimsical Slavic folk-art hut with crooked logs, a steep decorated roof, glowing windows, and four sturdy chicken legs.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = "#6b321d";
  const WOOD_LIGHT = "#a85c2d";
  const WOOD_DARK = "#321914";
  const ROOF = "#382447";
  const ROOF_LIGHT = "#6f376c";
  const TRIM = "#e0a43b";
  const TRIM_RED = "#b83732";
  const CREAM = "#f1d59a";
  const IRON = "#201827";
  const SKIN = "#c88b45";
  const CLAW = "#e8bd62";
  const GLOW = "#ffd86b";

  const root = b.joint("hutRoot", {
    at: [0, 0.72, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const houseCenter: [number, number, number] = [0, 1.55, 0];
  const frontZ = 0.52;

  const windowTexture = svg(
    `<svg viewBox="0 0 100 100">
      <rect width="100" height="100" rx="5" fill="#21152b" stroke="#e0a43b" stroke-width="7"/>
      <path d="M50 5V95M5 50H95" stroke="#e0a43b" stroke-width="7"/>
      <path d="M12 12L88 88M88 12L12 88" stroke="#7c3a52" stroke-width="4"/>
      <circle cx="50" cy="50" r="25" fill="#ffd86b" opacity=".9"/>
      <circle cx="40" cy="42" r="8" fill="#fff1a8"/>
    </svg>`,
    { size: 256 },
  );

  const doorTexture = svg(
    `<svg viewBox="0 0 100 160">
      <rect width="100" height="160" rx="8" fill="#47251c" stroke="#e0a43b" stroke-width="6"/>
      <path d="M12 35Q50 5 88 35M12 75Q50 45 88 75M12 115Q50 85 88 115" fill="none" stroke="#9d562c" stroke-width="8"/>
      <circle cx="76" cy="82" r="8" fill="#e0a43b"/>
      <path d="M28 142Q50 120 72 142" fill="none" stroke="#201827" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );

  const roofTexture = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M0 8L32 0L64 8L32 16Z" fill="#d19a43"/>
      <path d="M0 24L32 16L64 24L32 32Z" fill="#b83732"/>
      <path d="M0 40L32 32L64 40L32 48Z" fill="#d19a43"/>
      <path d="M0 56L32 48L64 56L32 64Z" fill="#b83732"/>
    </svg>`,
    { size: 128, pixelated: true },
  );

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    extra: Partial<{
      rotation: [number, number, number];
      texture: THREE.Texture;
      bone: any;
      name: string;
    }> = {},
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone: extra.bone ?? root,
      rotation: extra.rotation,
      texture: extra.texture,
      name: extra.name,
    });
  }

  function cylinder(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    rotation: [number, number, number] = [0, 0, 0],
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius * 0.92, height, 8),
      color,
      { at, bone: root, rotation },
    );
  }

  function logBeam(
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.075,
    color = WOOD_LIGHT,
  ) {
    return b.rod(a, c, radius, { color, bone: root, section: { ngon: 6 } });
  }

  // Four animated-looking chicken legs. They are placed first as a skeleton.
  const legTargets = [
    { side: "L", x: 0.46, z: 0.34, front: true },
    { side: "R", x: -0.46, z: 0.34, front: true },
    { side: "L", x: 0.46, z: -0.34, front: false },
    { side: "R", x: -0.46, z: -0.34, front: false },
  ];

  const legs: any[] = [];
  for (const leg of legTargets) {
    const s = leg.x > 0 ? 1 : -1;
    const hip: [number, number, number] = [leg.x, 1.15, leg.z];
    const knee: [number, number, number] = [
      leg.x + s * 0.055,
      0.68,
      leg.z + (leg.front ? 0.09 : -0.09),
    ];
    const ankle: [number, number, number] = [
      leg.x - s * 0.025,
      0.27,
      leg.z + (leg.front ? 0.04 : -0.04),
    ];
    const chain = b.chain(
      `leg${leg.side}${leg.front ? "F" : "B"}`,
      catmull([hip, knee, ankle, [ankle[0], 0.16, ankle[2]]]),
      {
        parent: root,
        names: [
          `hip${leg.side}${leg.front ? "F" : "B"}`,
          `knee${leg.side}${leg.front ? "F" : "B"}`,
          `ankle${leg.side}${leg.front ? "F" : "B"}`,
        ],
        role: "leg",
        contact: [ankle[0], 0, ankle[2]],
      },
    );
    const tube = b.sweep(chain, (t) => (t < 0.48 ? 0.105 : 0.075), {
      color: SKIN,
      section: { ngon: 6 },
      caps: "round",
    });
    legs.push({ chain, tube, s, ankle, front: leg.front });
  }

  // House body: chunky log cabin, slightly wider than tall.
  box([1.28, 0.82, 1.02], houseCenter, WOOD, { name: "square-log-house" });
  box([1.16, 0.68, 0.9], [0, 1.58, 0.01], WOOD_LIGHT, {
    name: "warm-wall-face",
  });

  // Horizontal log courses on the front, sides, and back.
  for (const y of [1.19, 1.34, 1.49, 1.64, 1.79, 1.94]) {
    logBeam([-0.68, y, 0.54], [0.68, y, 0.54], 0.055, WOOD_LIGHT);
    logBeam([-0.68, y, -0.54], [0.68, y, -0.54], 0.055, WOOD_DARK);
  }
  for (const x of [-0.65, 0.65]) {
    for (const y of [1.2, 1.38, 1.56, 1.74, 1.92]) {
      logBeam([x, y, -0.48], [x, y, 0.48], 0.052, WOOD_LIGHT);
    }
  }

  // Exaggerated corner log ends.
  for (const x of [-0.68, 0.68]) {
    for (const z of [-0.54, 0.54]) {
      for (const y of [1.22, 1.43, 1.64, 1.85]) {
        cylinder(0.09, 0.18, [x, y, z], WOOD_DARK, [Math.PI / 2, 0, 0]);
      }
    }
  }

  // Door and golden threshold on the front.
  box([0.32, 0.58, 0.035], [0, 1.36, 0.565], CREAM, {
    texture: doorTexture,
    name: "painted-door",
  });
  box([0.46, 0.06, 0.12], [0, 1.05, 0.57], TRIM, {
    name: "door-threshold",
  });
  cylinder(0.045, 0.08, [0.105, 1.38, 0.605], TRIM, [Math.PI / 2, 0, 0]);

  // Two glowing folk-art windows.
  for (const x of [-0.42, 0.42]) {
    box([0.25, 0.27, 0.035], [x, 1.65, 0.56], GLOW, {
      texture: windowTexture,
      name: x < 0 ? "window-left" : "window-right",
    });
    box([0.31, 0.035, 0.04], [x, 1.81, 0.59], TRIM);
    box([0.31, 0.035, 0.04], [x, 1.49, 0.59], TRIM);
  }

  // Steep two-sided roof, with broad eaves.
  box([1.58, 0.08, 0.84], [-0.34, 2.13, 0], ROOF_LIGHT, {
    rotation: [0, 0, -0.62],
    texture: roofTexture,
    name: "roof-left-slope",
  });
  box([1.58, 0.08, 0.84], [0.34, 2.13, 0], ROOF, {
    rotation: [0, 0, 0.62],
    texture: roofTexture,
    name: "roof-right-slope",
  });
  box([0.14, 0.14, 1.12], [0, 2.48, 0], TRIM, {
    rotation: [Math.PI / 2, 0, 0],
    name: "roof-ridge",
  });

  // Decorative carved gable boards.
  const gableOutline: [number, number][] = [
    [-0.52, 0],
    [0.52, 0],
    [0, 0.58],
  ];
  for (const z of [0.53, -0.53]) {
    b.extrude(gableOutline, {
      at: [0, 1.98, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: TRIM_RED,
      bone: root,
      name: "carved-gable",
    });
  }

  // Sunburst ornament on the front gable.
  cylinder(0.11, 0.035, [0, 2.2, 0.58], TRIM, [Math.PI / 2, 0, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    logBeam(
      [0, 2.2, 0.61],
      [Math.sin(a) * 0.17, 2.2 + Math.cos(a) * 0.17, 0.61],
      0.018,
      TRIM,
    );
  }

  // Chimney with crooked cap and little smoke-like folk ornaments.
  box([0.22, 0.34, 0.22], [0.4, 2.47, -0.12], WOOD_DARK, {
    rotation: [0, 0, -0.08],
    name: "crooked-chimney",
  });
  box([0.3, 0.06, 0.28], [0.39, 2.66, -0.13], TRIM_RED, {
    rotation: [0, 0, -0.08],
  });
  for (const p of [
    [0.4, 2.79, -0.13],
    [0.34, 2.89, -0.1],
    [0.43, 2.98, -0.08],
  ] as [number, number, number][]) {
    b.part(new THREE.SphereGeometry(0.065, 7, 5), "#76658f", {
      at: p,
      bone: root,
      name: "smoke-puff",
    });
  }

  // Chicken feet: three splayed toes per leg, touching the floor.
  for (const leg of legs) {
    const [x, , z] = leg.ankle;
    for (const toe of [-1, 0, 1]) {
      const toeEnd: [number, number, number] = [
        x + leg.s * (0.13 + Math.abs(toe) * 0.035),
        0.075,
        z + toe * 0.095 + (leg.front ? 0.04 : -0.04),
      ];
      b.rod([x, 0.18, z], toeEnd, 0.034, {
        color: SKIN,
        bone: leg.chain.joints[2],
        section: { ngon: 5 },
      });
      b.spike(toeEnd, [0, -1, 0], 0.07, 0.028, {
        color: CLAW,
        bone: leg.chain.joints[2],
      });
    }
    // A small ankle bell gives the legs a folk-tale puppet quality.
    b.part(new THREE.SphereGeometry(0.075, 8, 5), TRIM, {
      at: [x, 0.28, z],
      bone: leg.chain.joints[2],
      name: "ankle-bell",
    });
  }

  // Hanging herb bundles beneath the eaves.
  for (const x of [-0.52, -0.28, 0.28, 0.52]) {
    const top: [number, number, number] = [x, 1.17, 0.62];
    const bottom: [number, number, number] = [x + (x > 0 ? 0.025 : -0.025), 0.87, 0.62];
    b.rod(top, bottom, 0.018, { color: TRIM_RED, bone: root });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.035, 6, 4), "#53713a", {
        at: [bottom[0] + (i - 1) * 0.035, bottom[1] - i * 0.025, bottom[2]],
        bone: root,
        name: "herb-leaf",
      });
    }
  }

  // A small carved witch-sign over the door.
  const sign = b.extrude(
    [
      [-0.13, 0],
      [0.13, 0],
      [0.1, 0.17],
      [0, 0.27, "sharp"],
      [-0.1, 0.17],
    ],
    {
      at: [0, 1.82, 0.61],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: TRIM,
      bone: root,
      name: "witch-sign",
    },
  );
  b.part(new THREE.SphereGeometry(0.035, 7, 5), IRON, {
    at: [0, 1.94, 0.64],
    bone: root,
    name: "sign-rivet",
  });

  return b.root;
}

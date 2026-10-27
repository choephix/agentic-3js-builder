```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  grain,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A whimsical Slavic folk-art diorama of a crooked log hut, painted shutters, carved ornaments, a bright roof, and four articulated chicken legs with splayed toes.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD_DARK = "#43251d";
  const WOOD = "#75402c";
  const WOOD_LIGHT = "#a9673e";
  const WOOD_GOLD = "#d28a48";
  const RED = "#ad3035";
  const RED_LIGHT = "#df5a45";
  const BLUE = "#245985";
  const BLUE_LIGHT = "#4a91ac";
  const CREAM = "#f2d79a";
  const PALE = "#ffeab2";
  const INK = "#25151b";
  const LEG = "#5b3428";
  const CLAW = "#d7a34c";
  const ROOF = "#4b263b";
  const ROOF_LIGHT = "#743c58";
  const GREEN = "#52734a";

  const timber = grain(WOOD, WOOD_LIGHT, {
    size: 0.055,
    axis: [0, 0, 1],
    seed: 14,
  });
  const roofPaint = countershade(ROOF_LIGHT, ROOF, { level: -0.05, soft: 0.28 });
  const legPaint = countershade(LEG, "#3d211d", { level: -0.1, soft: 0.25 });
  const goldPaint = grain(WOOD_GOLD, "#8e4d2b", {
    size: 0.035,
    axis: [0, 1, 0],
    seed: 9,
  });

  const eyeTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="47" fill="#f4d98a" stroke="#25151b" stroke-width="7"/>
      <circle cx="50" cy="50" r="26" fill="#315c70" stroke="#25151b" stroke-width="5"/>
      <circle cx="50" cy="53" r="10" fill="#17121a"/>
      <circle cx="39" cy="36" r="7" fill="#fff7d4"/>
      <circle cx="61" cy="67" r="3" fill="#fff7d4"/>
    </svg>`,
    { size: 128 },
  );

  const doorTexture = svg(
    `<svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="112" height="212" rx="5" fill="#7d342c" stroke="#25151b" stroke-width="8"/>
      <path d="M15 55 Q60 20 105 55 M15 110 Q60 75 105 110 M15 165 Q60 130 105 165"
        fill="none" stroke="#d99048" stroke-width="7"/>
      <path d="M60 12 V208" stroke="#43251d" stroke-width="7"/>
      <circle cx="89" cy="112" r="8" fill="#f4c35e" stroke="#25151b" stroke-width="4"/>
      <path d="M20 200 Q60 180 100 200" fill="none" stroke="#f1d68e" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const windowTexture = svg(
    `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="7" width="146" height="146" rx="12" fill="#173b54" stroke="#f1d68e" stroke-width="12"/>
      <path d="M80 10 V150 M10 80 H150" stroke="#f1d68e" stroke-width="10"/>
      <path d="M25 35 Q80 10 135 35 M25 125 Q80 150 135 125" fill="none" stroke="#d95345" stroke-width="7"/>
      <circle cx="42" cy="42" r="10" fill="#f7df9f"/>
      <circle cx="117" cy="117" r="10" fill="#f7df9f"/>
    </svg>`,
    { size: 192 },
  );

  const rosetteTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#d58a43" stroke="#25151b" stroke-width="6"/>
      <path d="M50 13 L59 39 L87 32 L67 51 L87 68 L59 62 L50 88 L41 62 L13 68 L33 50 L13 32 L41 39 Z"
        fill="#f1d78e" stroke="#25151b" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="12" fill="#b13c39" stroke="#25151b" stroke-width="4"/>
    </svg>`,
    { size: 128 },
  );

  const roofMark = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 6 L61 36 L94 36 L67 55 L78 88 L50 68 L22 88 L33 55 L6 36 L39 36 Z"
        fill="#f1d68e" stroke="#25151b" stroke-width="6" stroke-linejoin="round"/>
    </svg>`,
    { size: 128 },
  );

  // The single root gives the hut a natural rig anchor; the four leg chains are readable to a rigger.
  const body = b.joint("body", {
    at: [0, 1.18, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  const legData = [
    {
      side: "L",
      corner: "Front",
      x: 0.54,
      z: 0.34,
      knee: [0.67, 0.55, 0.42] as [number, number, number],
      ankle: [0.76, 0.24, 0.55] as [number, number, number],
      foot: [0.78, 0.1, 0.69] as [number, number, number],
    },
    {
      side: "R",
      corner: "Front",
      x: -0.54,
      z: 0.34,
      knee: [-0.67, 0.55, 0.42] as [number, number, number],
      ankle: [-0.76, 0.24, 0.55] as [number, number, number],
      foot: [-0.78, 0.1, 0.69] as [number, number, number],
    },
    {
      side: "L",
      corner: "Back",
      x: 0.54,
      z: -0.34,
      knee: [0.65, 0.54, -0.42] as [number, number, number],
      ankle: [0.73, 0.23, -0.52] as [number, number, number],
      foot: [0.74, 0.1, -0.64] as [number, number, number],
    },
    {
      side: "R",
      corner: "Back",
      x: -0.54,
      z: -0.34,
      knee: [-0.65, 0.54, -0.42] as [number, number, number],
      ankle: [-0.73, 0.23, -0.52] as [number, number, number],
      foot: [-0.74, 0.1, -0.64] as [number, number, number],
    },
  ];

  const legs: {
    chain: ReturnType<typeof b.chain>;
    foot: [number, number, number];
  }[] = [];

  for (const d of legData) {
    const path = catmull([
      [d.x, 0.86, d.z],
      d.knee,
      d.ankle,
      d.foot,
    ]);
    const chain = b.chain(
      `leg${d.side}${d.corner}`,
      path,
      {
        parent: body,
        names: [
          `hip${d.side}${d.corner}`,
          `knee${d.side}${d.corner}`,
          `ankle${d.side}${d.corner}`,
          `foot${d.side}${d.corner}`,
        ],
        role: "leg",
        contact: d.foot,
      },
    );
    b.sweep(chain, (t) => 0.075 - t * 0.035, {
      bone: chain,
      color: legPaint,
      sides: 7,
      caps: "round",
      group: "chicken-legs",
      name: `leg-shaft-${d.side}-${d.corner}`,
    });
    legs.push({ chain, foot: d.foot });
  }

  // Main square log cabin body.
  b.part(new THREE.BoxGeometry(1.56, 0.78, 1.04), timber, {
    bone: body,
    at: [0, 1.35, 0],
    group: "hut-walls",
    name: "log-wall-core",
    flat: true,
  });

  // Horizontal log courses: front/back and side walls, deliberately oversized at the corners.
  for (let i = 0; i < 5; i++) {
    const y = 1.03 + i * 0.16;
    b.rod([-0.86, y, -0.56], [0.86, y, -0.56], 0.09, timber, {
      bone: body,
      sides: 8,
      group: "logs",
      name: `front-log-${i}`,
    });
    b.rod([-0.86, y, 0.56], [0.86, y, 0.56], 0.09, timber, {
      bone: body,
      sides: 8,
      group: "logs",
      name: `back-log-${i}`,
    });
    b.rod([-0.84, y, -0.56], [-0.84, y, 0.56], 0.09, timber, {
      bone: body,
      sides: 8,
      group: "logs",
      name: `left-log-${i}`,
    });
    b.rod([0.84, y, -0.56], [0.84, y, 0.56], 0.09, timber, {
      bone: body,
      sides: 8,
      group: "logs",
      name: `right-log-${i}`,
    });
  }

  // Dark end caps and golden carved corner pegs.
  for (const x of [-0.87, 0.87]) {
    for (const z of [-0.57, 0.57]) {
      for (let i = 0; i < 5; i++) {
        b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 8), WOOD_DARK, {
          bone: body,
          at: [x, 1.03 + i * 0.16, z],
          dir: [x, 0, 0],
          group: "log-ends",
          name: `log-end-${x}-${z}-${i}`,
        });
      }
      b.part(new THREE.SphereGeometry(0.055, 8, 5), goldPaint, {
        bone: body,
        at: [x * 1.01, 1.01, z * 1.01],
        group: "corner-carving",
        name: "golden-corner-knot",
      });
    }
  }

  // Gable triangles, front and rear.
  const gable = [
    [-0.82, 0, "sharp"],
    [0.82, 0, "sharp"],
    [0, 0.63, "sharp"],
  ] as [number, number, "sharp"][];

  for (const z of [-0.59, 0.59]) {
    b.extrude(gable, {
      at: [0, 1.74, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.015,
      color: timber,
      bone: body,
      group: "gables",
      name: `gable-${z}`,
    });
  }

  // Broad, crooked roof planes.
  b.part(new THREE.BoxGeometry(1.12, 0.13, 1.34), roofPaint, {
    bone: body,
    at: [-0.47, 2.15, 0],
    rotation: [0, 0, -34],
    group: "roof",
    name: "left-roof-slope",
    flat: true,
  });
  b.part(new THREE.BoxGeometry(1.12, 0.13, 1.34), roofPaint, {
    bone: body,
    at: [0.47, 2.15, 0],
    rotation: [0, 0, 34],
    group: "roof",
    name: "right-roof-slope",
    flat: true,
  });
  b.rod([-0.02, 2.45, -0.72], [-0.02, 2.45, 0.72], 0.105, WOOD_DARK, {
    bone: body,
    sides: 8,
    group: "roof",
    name: "roof-ridge",
  });

  // Roof tile stripes, like painted wooden shingles.
  for (let i = -4; i <= 4; i++) {
    const z = i * 0.145;
    b.rod([-0.97, 1.82, z], [-0.08, 2.39, z], 0.018, RED_LIGHT, {
      bone: body,
      sides: 6,
      group: "roof-tiles",
      name: `left-shingle-line-${i}`,
    });
    b.rod([0.08, 2.39, z], [0.97, 1.82, z], 0.018, RED_LIGHT, {
      bone: body,
      sides: 6,
      group: "roof-tiles",
      name: `right-shingle-line-${i}`,
    });
  }

  // Crooked chimney with a cap.
  b.part(new THREE.BoxGeometry(0.22, 0.42, 0.22), WOOD_DARK, {
    bone: body,
    at: [0.35, 2.53, -0.12],
    rotation: [0, 0, -7],
    group: "chimney",
    name: "crooked-chimney",
  });
  b.part(new THREE.BoxGeometry(0.34, 0.07, 0.3), RED, {
    bone: body,
    at: [0.34, 2.76, -0.12],
    rotation: [0, 0, -7],
    group: "chimney",
    name: "chimney-cap",
  });

  // Front door and bright frame.
  b.part(new THREE.BoxGeometry(0.31, 0.56, 0.035), WOOD_DARK, {
    bone: body,
    at: [0, 1.28, 0.59],
    group: "door",
    name: "door-shadow",
  });
  b.part(new THREE.PlaneGeometry(0.275, 0.52), "#ffffff", {
    bone: body,
    at: [0, 1.29, 0.612],
    dir: [0, 0, 1],
    axis: "z",
    texture: doorTexture,
    group: "door",
    name: "painted-front-door",
  });
  for (const x of [-0.19, 0.19]) {
    b.rod([x, 0.98, 0.63], [x, 1.61, 0.63], 0.025, CREAM, {
      bone: body,
      sides: 6,
      group: "door-trim",
      name: "door-side-trim",
    });
  }
  b.rod([-0.21, 1.64, 0.63], [0.21, 1.64, 0.63], 0.028, CREAM, {
    bone: body,
    sides: 6,
    group: "door-trim",
    name: "door-top-trim",
  });

  // Two side windows with shutters, crossbars, and flower-like surrounds.
  for (const x of [-0.89, 0.89]) {
    const sideDir = [x, 0, 0] as [number, number, number];
    b.part(new THREE.BoxGeometry(0.035, 0.32, 0.38), WOOD_DARK, {
      bone: body,
      at: [x, 1.39, -0.02],
      dir: sideDir,
      group: "windows",
      name: "window-recess",
    });
    b.part(new THREE.PlaneGeometry(0.31, 0.31), "#ffffff", {
      bone: body,
      at: [x * 1.02, 1.39, -0.02],
      dir: sideDir,
      axis: "z",
      texture: windowTexture,
      group: "windows",
      name: "painted-window",
    });
    for (const z of [-0.23, 0.23]) {
      b.part(new THREE.BoxGeometry(0.035, 0.17, 0.16), RED, {
        bone: body,
        at: [x * 1.035, 1.39, z],
        dir: sideDir,
        group: "shutters",
        name: "red-shutter",
      });
    }
    for (const y of [1.18, 1.6]) {
      b.rod([x * 1.05, y, -0.23], [x * 1.05, y, 0.23], 0.014, CREAM, {
        bone: body,
        sides: 6,
        group: "window-trim",
        name: "window-crossbar",
      });
    }
  }

  // Painted gable symbols and a pair of huge folk-art "watching" eyes.
  for (const z of [-0.67, 0.67]) {
    b.part(new THREE.PlaneGeometry(0.24, 0.24), "#ffffff", {
      bone: body,
      at: [0, 2.04, z],
      dir: [0, 0, z],
      axis: "z",
      texture: rosetteTexture,
      group: "gable-ornament",
      name: "sun-rosette",
    });
    b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
      bone: body,
      at: [-0.36, 2.02, z + Math.sign(z) * 0.012],
      dir: [0, 0, z],
      axis: "z",
      texture: eyeTexture,
      group: "gable-ornament",
      name: "watching-eye-left",
    });
    b.part(new THREE.PlaneGeometry(0.18, 0.18), "#ffffff", {
      bone: body,
      at: [0.36, 2.02, z + Math.sign(z) * 0.012],
      dir: [0, 0, z],
      axis: "z",
      texture: eyeTexture,
      group: "gable-ornament",
      name: "watching-eye-right",
    });
  }

  // Carved ridge finial and dangling folk ribbons.
  b.spike([0, 2.45, 0], [0, 1, 0], 0.29, 0.08, {
    bone: body,
    color: GOLD_ORANGE,
    sides: 7,
    group: "finial",
    name: "ridge-finial",
  });

  const ribbon = svg(
    `<svg viewBox="0 0 40 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 0 H35 L29 82 L38 112 L20 101 L2 118 L11 82 Z" fill="#e05045" stroke="#25151b" stroke-width="4"/>
      <path d="M12 8 H28" stroke="#f7df9e" stroke-width="5"/>
      <path d="M9 25 H31" stroke="#f7df9e" stroke-width="5"/>
    </svg>`,
    { size: 128 },
  );
  for (const x of [-0.6, 0.6]) {
    b.cards(
      [
        {
          at: new THREE.Vector3(x, 1.87, 0.63),
          axis: new THREE.Vector3(0, 0, 1),
        } as any,
      ],
      ribbon,
      {
        size: [0.09, 0.28],
        lean: 8,
        flow: [x * 0.2, -0.2, 1],
        color: RED,
        sink: 0.04,
        group: "ribbons",
      },
    );
  }

  // Four broad splayed toes on each chicken foot.
  for (const d of legData) {
    const [x, y, z] = d.foot;
    const toes = [
      [x - 0.12, y - 0.012, z + 0.19],
      [x, y - 0.014, z + 0.23],
      [x + 0.12, y - 0.012, z + 0.18],
    ] as [number, number, number][];
    for (let i = 0; i < toes.length; i++) {
      b.rod([x, y + 0.015, z], toes[i], 0.027, CLAW, {
        bone: body,
        sides: 6,
        caps: "round",
        group: "toes",
        name: `toe-${d.side}-${d.corner}-${i}`,
      });
      b.spike(toes[i], [0, -0.25, 0.97], 0.085, 0.024, {
        bone: body,
        color: CLAW,
        sides: 6,
        group: "claws",
        name: `claw-${d.side}-${d.corner}-${i}`,
      });
    }
    // A little rear toe gives the silhouette a recognizably avian foot.
    b.rod([x, y + 0.012, z], [x, y - 0.005, z - 0.16], 0.025, CLAW, {
      bone: body,
      sides: 6,
      group: "toes",
      name: `rear-toe-${d.side}-${d.corner}`,
    });
  }

  // Small painted medallions on the four visible lower wall corners.
  for (const x of [-0.72, 0.72]) {
    for (const z of [-0.6, 0.6]) {
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 10), RED_LIGHT, {
        bone: body,
        at: [x, 0.94, z],
        dir: [0, 1, 0],
        group: "folk-carving",
        name: "lower-red-medallion",
      });
    }
  }

  // A few stylized smoke puffs above the chimney, kept attached to the hut as scenery.
  const smoke = [
    [0.34, 2.92, -0.12, 0.11],
    [0.29, 3.1, -0.1, 0.14],
    [0.39, 3.29, -0.08, 0.1],
  ] as const;
  for (let i = 0; i < smoke.length; i++) {
    const [x, y, z, r] = smoke[i];
    b.part(new THREE.IcosahedronGeometry(r, 1), i === 1 ? "#b5a393" : "#d0b8a0", {
      bone: body,
      at: [x, y, z],
      group: "smoke",
      name: `smoke-puff-${i}`,
      flat: true,
    });
  }

  // Tiny roof-star ornaments along the ridge.
  for (const z of [-0.48, 0, 0.48]) {
    b.extrude(
      [
        [0, 0.1, "sharp"],
        [0.035, 0.035, "sharp"],
        [0.1, 0, "sharp"],
        [0.035, -0.035, "sharp"],
        [0, -0.1, "sharp"],
        [-0.035, -0.035, "sharp"],
        [-0.1, 0, "sharp"],
        [-0.035, 0.035, "sharp"],
      ],
      {
        at: [0, 2.53, z],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.018,
        color: CREAM,
        bone: body,
        group: "ridge-stars",
        name: "ridge-star",
      },
    );
  }

  return b.root;
}

const GOLD_ORANGE = "#e0a247";
```
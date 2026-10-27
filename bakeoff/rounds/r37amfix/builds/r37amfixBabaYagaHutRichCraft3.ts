import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  stripes,
  countershade,
  frame,
  line,
} from "../../../../src/index";
import { svg } from "../../../../src/index";
import { cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Baba Yaga's Chicken-Legged Hut",
  description:
    "A stylized Slavic folk-art diorama of Baba Yaga's crooked log hut, balanced on four expressive chicken legs.",
};

const WOOD = cel("#8f4e29", "#552718");
const WOOD_LIGHT = cel("#c47a3d", "#70401f");
const WOOD_DARK = cel("#4b241b", "#25131a");
const ROOF = cel("#5b2931", "#2d1823");
const ROOF_LIGHT = cel("#863b42", "#421c2b");
const GOLD = cel("#e6ad3e", "#916021");
const BLUE = cel("#3d88a5", "#1c4c67");
const TURQUOISE = cel("#3bafa0", "#1e665f");
const CREAM = cel("#f5d99b", "#a9794c");
const WHITE = "#fff1c9";
const BLACK = "#1c1018";
const RED = "#c94b3f";
const LEG = cel("#d0a83f", "#745322");
const LEG_DARK = cel("#8d6c2b", "#4b351e");
const CLAW = cel("#d6c28a", "#76613e");

const bark = furEdge(WOOD_LIGHT, WOOD_DARK, {
  level: -0.12,
  teeth: 0.08,
  period: 0.17,
  along: [1, 0, 0],
  ink: "#3b1b18",
  inkWidth: 0.025,
});

const legPaint = stripes(LEG, [LEG_DARK, "#b4832b"], {
  size: 0.16,
  axis: "y",
  width: 0.24,
  wobble: 0.15,
  seed: 12,
});

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  at: [number, number, number],
  color: any,
  opts: any = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone: opts.bone,
    rotation: opts.rotation,
    scale: opts.scale,
    texture: opts.texture,
    name: opts.name,
    group: opts.group,
    flat: true,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  opts: any = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius * 0.94, height, opts.segments ?? 8),
    color,
    {
      at,
      bone: opts.bone,
      dir: opts.dir,
      rotation: opts.rotation,
      name: opts.name,
      group: opts.group,
      flat: true,
    },
  );
}

function logBeam(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: any,
  name: string,
) {
  return b.capsule(a, c, radius, {
    color,
    caps: "round",
    sides: 7,
    name,
    group: "hut.logs",
  });
}

function peg(
  b: ReturnType<typeof createBuilder>,
  at: [number, number, number],
  color: any = GOLD,
  r = 0.027,
) {
  return b.part(new THREE.SphereGeometry(r, 7, 5), color, {
    at,
    bone: rootBone,
    name: "carvedPeg",
    group: "folk.ornament",
  });
}

function braid(
  b: ReturnType<typeof createBuilder>,
  points: [number, number, number][],
  color: any,
  name: string,
) {
  const p = catmull(points);
  b.sweep(p, 0.023, {
    color,
    sides: 6,
    caps: "round",
    name,
    group: "folk.carving",
  });
}

function clawToe(
  b: ReturnType<typeof createBuilder>,
  a: [number, number, number],
  c: [number, number, number],
  name: string,
) {
  b.capsule(a, c, 0.026, {
    color: CLAW,
    sides: 6,
    caps: "round",
    name,
    group: "chicken.toes",
  });
}

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  // ------------------------------------------------------------------------------------
  // Skeleton first: one root and four readable chicken-leg chains.

  const root = b.joint("hutRoot", {
    at: [0, 1.16, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "hut",
  });

  const legData = [
    {
      side: "L",
      x: 0.43,
      z: 0.28,
      knee: [0.5, 0.77, 0.34] as [number, number, number],
      ankle: [0.46, 0.18, 0.28] as [number, number, number],
    },
    {
      side: "R",
      x: -0.43,
      z: 0.28,
      knee: [-0.51, 0.77, 0.35] as [number, number, number],
      ankle: [-0.47, 0.18, 0.29] as [number, number, number],
    },
    {
      side: "L",
      x: 0.43,
      z: -0.28,
      knee: [0.51, 0.76, -0.36] as [number, number, number],
      ankle: [0.46, 0.18, -0.31] as [number, number, number],
    },
    {
      side: "R",
      x: -0.43,
      z: -0.28,
      knee: [-0.5, 0.76, -0.37] as [number, number, number],
      ankle: [-0.46, 0.18, -0.3] as [number, number, number],
    },
  ];

  const legs = legData.map((d, i) => {
    const hip: [number, number, number] = [d.x, 1.18, d.z];
    return b.chain(
      `leg${d.side}${i + 1}`,
      catmull([hip, d.knee, d.ankle]),
      {
        parent: root,
        names: [`hip${d.side}${i + 1}`, `knee${d.side}${i + 1}`, `ankle${d.side}${i + 1}`],
        role: "leg",
        contact: [d.ankle[0], 0, d.ankle[2]],
        group: "chicken.legs",
      },
    );
  });

  // ------------------------------------------------------------------------------------
  // Legs: chunky, angular golden chicken shanks.

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, (t) => 0.075 - t * 0.022, {
      color: legPaint,
      sides: 7,
      skin: "smooth",
      caps: "round",
      name: `scalyShank${i + 1}`,
      group: "chicken.legs",
    });

    const d = legData[i];
    const s = d.x > 0 ? 1 : -1;
    const z = d.z > 0 ? 1 : -1;

    // knobby knee and ankle plates
    b.part(new THREE.SphereGeometry(0.085, 7, 5), LEG_DARK, {
      at: d.knee,
      bone: leg.joints[1],
      name: `kneeKnob${i + 1}`,
      group: "chicken.legs",
    });
    b.part(new THREE.SphereGeometry(0.062, 7, 5), GOLD, {
      at: d.ankle,
      bone: leg.tip,
      name: `ankleKnob${i + 1}`,
      group: "chicken.legs",
    });

    // three splayed toes per foot, all touching the floor.
    clawToe(
      b,
      [d.ankle[0], 0.13, d.ankle[2]],
      [d.ankle[0] + s * 0.16, 0.045, d.ankle[2] + z * 0.08],
      `toeFront${i + 1}`,
    );
    clawToe(
      b,
      [d.ankle[0], 0.13, d.ankle[2]],
      [d.ankle[0] + s * 0.08, 0.045, d.ankle[2] + z * 0.18],
      `toeSide${i + 1}`,
    );
    clawToe(
      b,
      [d.ankle[0], 0.13, d.ankle[2]],
      [d.ankle[0] - s * 0.12, 0.045, d.ankle[2] - z * 0.02],
      `toeBack${i + 1}`,
    );
    b.spike(
      [d.ankle[0] - s * 0.03, 0.12, d.ankle[2] - z * 0.01],
      [-s * 0.8, -0.35, -z * 0.4],
      0.15,
      0.031,
      {
        color: CLAW,
        bone: leg.tip,
        name: `rearTal${i + 1}`,
        group: "chicken.toes",
      },
    );
  }

  // ------------------------------------------------------------------------------------
  // Main hut: dark underbody, a warm log cube, and pronounced corner posts.

  box(b, [1.18, 0.72, 0.96], [0, 1.66, 0], WOOD_DARK, {
    bone: root,
    name: "shadowyHutCore",
    group: "hut.body",
  });

  const logY = [1.34, 1.48, 1.62, 1.76, 1.9];
  for (let row = 0; row < logY.length; row++) {
    const y = logY[row];
    logBeam(b, [-0.65, y, -0.45], [0.65, y, -0.45], 0.075, bark, `frontLog${row}`);
    logBeam(b, [-0.65, y, 0.45], [0.65, y, 0.45], 0.075, bark, `backLog${row}`);
    logBeam(b, [-0.58, y, -0.46], [-0.58, y, 0.46], 0.075, bark, `leftLog${row}`);
    logBeam(b, [0.58, y, -0.46], [0.58, y, 0.46], 0.075, bark, `rightLog${row}`);
  }

  // Corner uprights and their pale cut ends.
  for (const x of [-0.59, 0.59]) {
    for (const z of [-0.46, 0.46]) {
      b.capsule([x, 1.27, z], [x, 2.0, z], 0.095, {
        color: WOOD_LIGHT,
        sides: 7,
        name: `cornerPost${x}${z}`,
        group: "hut.body",
      });
      for (const y of [1.33, 1.47, 1.61, 1.75, 1.89]) {
        b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.012, 8), CREAM, {
          at: [x + (x > 0 ? 0.008 : -0.008), y, z],
          dir: [x > 0 ? 1 : -1, 0, 0],
          name: "logEnd",
          group: "hut.body",
        });
      }
    }
  }

  // Front threshold and chunky door surround.
  box(b, [0.38, 0.08, 0.08], [0, 1.28, 0.5], WOOD_LIGHT, {
    bone: root,
    name: "doorThreshold",
    group: "hut.door",
  });
  box(b, [0.1, 0.62, 0.08], [-0.24, 1.61, 0.49], WOOD_LIGHT, {
    bone: root,
    name: "doorFrameL",
    group: "hut.door",
  });
  box(b, [0.1, 0.62, 0.08], [0.24, 1.61, 0.49], WOOD_LIGHT, {
    bone: root,
    name: "doorFrameR",
    group: "hut.door",
  });
  box(b, [0.48, 0.1, 0.08], [0, 1.94, 0.49], WOOD_LIGHT, {
    bone: root,
    name: "doorLintel",
    group: "hut.door",
  });

  const doorTexture = svg(
    `<svg viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="150" rx="8" fill="#38202a"/>
      <path d="M50 10 L86 42 L76 128 L50 143 L24 128 L14 42 Z" fill="#6d3926" stroke="#d69a46" stroke-width="5"/>
      <path d="M50 24 L50 127 M28 57 L72 57 M30 92 L70 92" stroke="#3a1b1b" stroke-width="5"/>
      <circle cx="68" cy="76" r="7" fill="#e3b44d"/>
      <path d="M50 34 L59 49 L50 64 L41 49 Z M50 101 L59 116 L50 131 L41 116 Z" fill="#d7a24a"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.BoxGeometry(0.36, 0.57, 0.055), "#ffffff", {
    at: [0, 1.61, 0.535],
    bone: root,
    texture: doorTexture,
    name: "paintedDoor",
    group: "hut.door",
  });

  // ------------------------------------------------------------------------------------
  // Windows, shutters, folk rosettes.

  const windowTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="12" fill="#171a29" stroke="#e3b44d" stroke-width="7"/>
      <path d="M50 4 V96 M4 50 H96" stroke="#e3b44d" stroke-width="6"/>
      <path d="M50 14 L58 40 L86 50 L58 60 L50 88 L42 60 L14 50 L42 40 Z" fill="#42a2a1" stroke="#f5d99b" stroke-width="3"/>
      <circle cx="50" cy="50" r="9" fill="#c94b3f"/>
    </svg>`,
    { size: 256 },
  );

  for (const x of [-0.4, 0.4]) {
    b.part(new THREE.BoxGeometry(0.28, 0.28, 0.035), "#ffffff", {
      at: [x, 1.68, 0.502],
      bone: root,
      texture: windowTexture,
      name: `frontWindow${x}`,
      group: "hut.windows",
    });
    box(b, [0.07, 0.34, 0.06], [x - 0.18, 1.68, 0.51], RED, {
      bone: root,
      rotation: [0, 0, x > 0 ? -8 : 8],
      name: "windowShutter",
      group: "hut.windows",
    });
    box(b, [0.07, 0.34, 0.06], [x + 0.18, 1.68, 0.51], RED, {
      bone: root,
      rotation: [0, 0, x > 0 ? 8 : -8],
      name: "windowShutter",
      group: "hut.windows",
    });
  }

  // Side windows are deliberately asymmetrical, like hand-painted folk architecture.
  b.part(new THREE.BoxGeometry(0.035, 0.27, 0.29), "#ffffff", {
    at: [0.612, 1.7, -0.05],
    bone: root,
    texture: windowTexture,
    dir: [1, 0, 0],
    name: "sideWindow",
    group: "hut.windows",
  });

  // Painted sun discs and little diamond trim.
  for (const x of [-0.48, 0.48]) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.018, 10), GOLD, {
      at: [x, 2.03, 0.48],
      dir: [0, 0, 1],
      bone: root,
      name: "sunRosette",
      group: "folk.ornament",
    });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      peg(b, [x + Math.sin(a) * 0.078, 2.03 + Math.cos(a) * 0.078, 0.495], RED, 0.014);
    }
  }

  // ------------------------------------------------------------------------------------
  // Gabled roof: two broad crooked painted slabs plus ridge, scalloped eaves and chimney.

  box(b, [1.52, 0.1, 0.88], [0, 2.16, 0.27], ROOF, {
    bone: root,
    rotation: [36, 0, 0],
    name: "roofRight",
    group: "hut.roof",
  });
  box(b, [1.52, 0.1, 0.88], [0, 2.16, -0.27], ROOF_LIGHT, {
    bone: root,
    rotation: [-36, 0, 0],
    name: "roofLeft",
    group: "hut.roof",
  });

  logBeam(b, [-0.78, 2.42, 0], [0.78, 2.42, 0], 0.065, WOOD_LIGHT, "roofRidge");

  // Bright sawtooth eave ornaments.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const x = -0.7 + i * 0.175;
      const z = side * (0.57 + Math.abs(x) * 0.012);
      b.spike([x, 1.94, z], [0, -1, 0], 0.13, 0.026, {
        color: GOLD,
        bone: root,
        name: "eaveTooth",
        group: "folk.ornament",
      });
    }
  }

  // Crooked chimney with red cap.
  box(b, [0.22, 0.34, 0.22], [0.33, 2.52, -0.08], WOOD_DARK, {
    bone: root,
    rotation: [0, 0, -7],
    name: "chimney",
    group: "hut.roof",
  });
  box(b, [0.3, 0.07, 0.29], [0.33, 2.7, -0.08], RED, {
    bone: root,
    rotation: [0, 0, -7],
    name: "chimneyCap",
    group: "hut.roof",
  });
  for (const x of [0.27, 0.39]) {
    b.part(new THREE.SphereGeometry(0.027, 7, 5), GOLD, {
      at: [x, 2.75, -0.08],
      bone: root,
      name: "chimneyFinial",
      group: "folk.ornament",
    });
  }

  // ------------------------------------------------------------------------------------
  // Baba Yaga folk carvings: ribbons, wheat-like braids, protective symbols.

  braid(
    b,
    [
      [-0.5, 1.25, 0.54],
      [-0.34, 1.19, 0.57],
      [-0.16, 1.25, 0.57],
      [0, 1.18, 0.57],
      [0.16, 1.25, 0.57],
      [0.34, 1.19, 0.57],
      [0.5, 1.25, 0.54],
    ],
    TURQUOISE,
    "frontProtectiveBraid",
  );

  for (const x of [-0.49, -0.29, -0.09, 0.11, 0.31, 0.51]) {
    b.part(new THREE.SphereGeometry(0.027, 7, 5), GOLD, {
      at: [x, 1.25, 0.59],
      bone: root,
      name: "braidBead",
      group: "folk.ornament",
    });
  }

  // Carved diamond garlands on both side walls.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = -0.28 + i * 0.19;
      const x = side * 0.63;
      b.part(new THREE.ConeGeometry(0.055, 0.025, 4), GOLD, {
        at: [x, 1.97, z],
        dir: [side, 0, 0],
        bone: root,
        name: "sideDiamond",
        group: "folk.ornament",
      });
    }
  }

  // A little hanging horseshoe charm beneath the front eave.
  const charm = catmull([
    [-0.27, 2.08, 0.57],
    [-0.27, 2.0, 0.59],
    [-0.27, 1.92, 0.57],
  ]);
  b.sweep(charm, 0.017, {
    color: GOLD,
    sides: 6,
    caps: "round",
    name: "horseshoeCharm",
    group: "folk.ornament",
  });
  for (const x of [-0.31, -0.23]) peg(b, [x, 1.99, 0.59], RED, 0.018);

  // ------------------------------------------------------------------------------------
  // A few painted log cracks and nails give the simple primitives hand-made character.

  const cracks = [
    [[-0.25, 1.43, 0.53], [-0.2, 1.39, 0.545], [-0.16, 1.42, 0.545]],
    [[0.28, 1.8, 0.53], [0.33, 1.76, 0.545], [0.3, 1.71, 0.545]],
    [[0.1, 1.51, -0.53], [0.15, 1.55, -0.54], [0.2, 1.51, -0.54]],
  ] as [number, number, number][][];

  cracks.forEach((points, i) =>
    b.sweep(polyline(points), 0.009, {
      color: BLACK,
      caps: "flat",
      name: `woodCrack${i}`,
      group: "hut.detail",
    }),
  );

  for (const x of [-0.53, -0.34, 0.34, 0.53]) {
    for (const y of [1.4, 1.72, 1.9]) {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 7), BLACK, {
        at: [x, y, 0.535],
        dir: [0, 0, 1],
        bone: root,
        name: "ironNail",
        group: "hut.detail",
      });
    }
  }

  // Root metadata helper: keeps the root visibly named and gives the diorama a stable folk-art palette.
  root.object.userData.style = "Slavic folk art";
  root.object.userData.subject = "Baba Yaga hut on chicken legs";

  return b.root;
}

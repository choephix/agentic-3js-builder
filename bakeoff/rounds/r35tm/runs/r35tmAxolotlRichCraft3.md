```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  paint,
  rng,
  svg,
} from "agentic-3js-builder";
import {
  cel,
  furEdge,
  animeEye,
  INK,
} from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "chibi axolotl",
  description:
    "A low-poly chibi axolotl with a soft aqua body, huge expressive eyes, a broad tail fin, tiny feet, and six frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibiAxolotl", detail: 1 });

  const MINT = cel("#8edbd0", "#4b9f9e");
  const BELLY = cel("#fff0df", "#e5bcb2");
  const PALE = cel("#f7d9d0", "#c98691");
  const GILL = cel("#ff8fb0", "#c94370");
  const GILL_LIGHT = cel("#ffc1c7", "#e56683");
  const DARK_MINT = cel("#397f82", "#24515f");
  const CLAW = cel("#f7c7b8", "#b96e78");
  const MOUTH = "#54243f";
  const INK_SOFT = "#351b35";

  const bellyPaint = furEdge(MINT, BELLY, {
    axis: [0, 1, 0],
    level: -0.18,
    teeth: 0.18,
    period: 0.075,
    along: [0, 0, 1],
    ink: "#6d6970",
    inkWidth: 0.025,
  });

  const facePaint = furEdge(MINT, PALE, {
    axis: [0, 0, 1],
    by: "position",
    level: 0.58,
    teeth: 0.045,
    period: 0.08,
    along: [1, 0, 0],
  });

  const finPaint = cel("#68bfc4", "#327d8e");
  const eyeTexture = animeEye({
    iris: "#754fce",
    irisLight: "#d9b9ff",
    irisDark: "#34205e",
    ink: INK,
    blush: "#ff9ab0",
    size: 384,
  });

  const mouthTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <path d="M8 27 Q64 59 120 27 Q97 42 64 43 Q31 42 8 27Z" fill="#54243f"/>
      <path d="M20 29 Q64 48 108 29 Q83 37 64 37 Q45 37 20 29Z" fill="#e98791"/>
      <path d="M29 27 Q64 40 99 27" stroke="#ffccd1" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  // ------------------------------------------------------------------------------------------------
  // Skeleton first: one root spine, head and jaw, four legs, tail, and six independent gill fingers.

  const hips = b.joint("hips", {
    at: [0, 0.42, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.42, -0.43],
      [0, 0.49, -0.12],
      [0, 0.53, 0.2],
      [0, 0.59, 0.43],
    ]),
    {
      parent: hips,
      names: ["spineBase", "spineMid", "shoulders", "neckBase"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.56, 0.35],
      [0, 0.64, 0.46],
      [0, 0.69, 0.52],
    ]),
    {
      parent: hips,
      names: ["neck1", "neck2", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 0.69, 0.52],
    dir: [0, 0.05, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.59, 0.67],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.43, -0.35],
      [0, 0.39, -0.67],
      [0, 0.34, -1.0],
      [0, 0.31, -1.32],
      [0, 0.28, -1.58],
    ]),
    {
      parent: hips,
      names: ["tailBase", "tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  const legChains: Record<string, ReturnType<typeof b.chain>> = {};
  const legData = [
    {
      side: "L",
      x: 0.25,
      z: 0.27,
      names: ["shoulderL", "elbowL", "wristL", "pawL"],
    },
    {
      side: "R",
      x: -0.25,
      z: 0.27,
      names: ["shoulderR", "elbowR", "wristR", "pawR"],
    },
    {
      side: "L",
      x: 0.25,
      z: -0.28,
      names: ["hipL", "kneeL", "ankleL", "footL"],
    },
    {
      side: "R",
      x: -0.25,
      z: -0.28,
      names: ["hipR", "kneeR", "ankleR", "footR"],
    },
  ];

  for (const leg of legData) {
    const root: [number, number, number] = [leg.x, 0.43, leg.z];
    const target: [number, number, number] = [
      leg.x * 1.06,
      0.095,
      leg.z + (leg.z > 0 ? 0.09 : -0.03),
    ];
    const points = limb(
      root,
      target,
      leg.z > 0 ? [0.16, 0.16, 0.15] : [0.18, 0.17, 0.14],
      leg.z > 0
        ? [
            [0, 0, 1],
            [0, 0, -1],
          ]
        : [
            [0, 0, -1],
            [0, 0, 1],
          ],
      { sole: [0, 1, 0] },
    );
    legChains[leg.side + (leg.z > 0 ? "Front" : "Back")] = b.chain(
      "leg" + leg.side + (leg.z > 0 ? "Front" : "Back"),
      points,
      {
        parent: hips,
        names: leg.names,
        role: "leg",
        contact: target,
      },
    );
  }

  const gillChains: ReturnType<typeof b.chain>[] = [];
  for (const s of [1, -1]) {
    const roots: [number, number, number][] = [
      [s * 0.24, 0.78, 0.48],
      [s * 0.26, 0.72, 0.51],
      [s * 0.25, 0.67, 0.49],
    ];
    const tips: [number, number, number][][] = [
      [
        roots[0],
        [s * 0.39, 0.9, 0.48],
        [s * 0.55, 0.99, 0.42],
        [s * 0.67, 0.9, 0.34],
      ],
      [
        roots[1],
        [s * 0.4, 0.76, 0.54],
        [s * 0.58, 0.79, 0.58],
        [s * 0.69, 0.71, 0.52],
      ],
      [
        roots[2],
        [s * 0.39, 0.62, 0.46],
        [s * 0.56, 0.57, 0.39],
        [s * 0.65, 0.62, 0.29],
      ],
    ];
    tips.forEach((path, i) => {
      gillChains.push(
        b.chain(
          `gill${s > 0 ? "L" : "R"}${i + 1}`,
          catmull(path),
          {
            parent: head,
            names: [
              `gill${s > 0 ? "L" : "R"}${i + 1}Root`,
              `gill${s > 0 ? "L" : "R"}${i + 1}Mid`,
              `gill${s > 0 ? "L" : "R"}${i + 1}Tip`,
            ],
            role: "fan",
            group: "gills",
          },
        ),
      );
    });
  }

  // ------------------------------------------------------------------------------------------------
  // Body and silhouette.

  const bodyTube = b.sweep(spine, (t) => 0.19 + 0.035 * Math.sin(t * Math.PI), {
    color: bellyPaint,
    sides: 8,
    section: "circle",
    group: "body",
    name: "soft rounded body",
  });

  b.sweep(neck, [0.17, 0.23], {
    color: facePaint,
    sides: 8,
    group: "body",
    name: "short neck",
  });

  const skull = b.part(
    new THREE.SphereGeometry(0.5, 12, 8),
    facePaint,
    {
      bone: head,
      at: [0, 0.7, 0.56],
      scale: [0.34, 0.29, 0.32],
      flat: true,
      group: "head",
      name: "large rounded head",
    },
  );

  // Cheek pads make the head read as a friendly axolotl rather than a generic blob.
  for (const s of [1, -1]) {
    b.part(
      new THREE.SphereGeometry(0.13, 8, 6),
      PALE,
      {
        bone: head,
        at: [s * 0.245, 0.59, 0.68],
        scale: [1.15, 0.8, 0.65],
        flat: true,
        group: "face",
        name: `cheek${s > 0 ? "L" : "R"}`,
      },
    );
  }

  // Four extremely readable, slightly flattened legs.
  for (const [key, chain] of Object.entries(legChains)) {
    const front = key.includes("Front");
    b.sweep(
      chain,
      front ? [0.072, 0.055] : [0.082, 0.058],
      {
        color: bellyPaint,
        sides: 6,
        section: "circle",
        group: "legs",
        name: key,
      },
    );
    const paw = chain.tip!;
    b.part(
      new THREE.SphereGeometry(front ? 0.088 : 0.096, 8, 5),
      PALE,
      {
        bone: paw,
        at: paw.at,
        scale: [1.0, 0.5, 1.2],
        flat: true,
        group: "feet",
        name: `${key} paw pad`,
      },
    );
    for (const toe of [-1, 0, 1]) {
      const start = paw.at;
      const end: [number, number, number] = [
        start.x + toe * 0.035,
        0.075,
        start.z + (front ? 0.075 : -0.065),
      ];
      b.rod(start, end, 0.014, {
        color: CLAW,
        sides: 5,
        group: "digits",
        name: `${key} toe ${toe}`,
      });
    }
  }

  // Broad tapering tail plus two translucent-looking solid fin membranes.
  const tailTube = b.sweep(tail, [0.16, 0.025], {
    color: bellyPaint,
    sides: 8,
    caps: { start: "round", end: "point" },
    group: "tail",
    name: "tapering tail",
  });

  const tailTop = catmull([
    [0, 0.57, -0.42],
    [0, 0.56, -0.72],
    [0, 0.54, -1.04],
    [0, 0.49, -1.36],
    [0, 0.39, -1.58],
  ]);
  const tailBottom = catmull([
    [0, 0.29, -0.42],
    [0, 0.25, -0.72],
    [0, 0.22, -1.04],
    [0, 0.2, -1.36],
    [0, 0.25, -1.58],
  ]);

  b.membrane(tail, tailTop, {
    color: finPaint,
    thickness: 0.018,
    rows: 5,
    cols: 10,
    scallop: 0.08,
    group: "tailFin",
    name: "upper tail fin",
  });
  b.membrane(tailBottom, tail, {
    color: finPaint,
    thickness: 0.018,
    rows: 5,
    cols: 10,
    scallop: 0.08,
    group: "tailFin",
    name: "lower tail fin",
  });

  // ------------------------------------------------------------------------------------------------
  // Face: giant decals, a tiny nose, freckles, and a separate lower jaw.

  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeAt = new THREE.Vector3(s * 0.145, 0.73, 0.805);
    const eyeHit = headSurface.nearest(eyeAt);
    b.decal(headSurface, eyeTexture, {
      at: eyeHit.at,
      dir: [0, 0.35, 1],
      up: [0, 1, 0],
      size: [0.135, 0.18],
      lift: 0.003,
      mirror: s > 0,
      group: "face",
      name: `huge eye ${s > 0 ? "L" : "R"}`,
    });
  }

  b.part(
    new THREE.SphereGeometry(0.035, 8, 5),
    MOUTH,
    {
      bone: head,
      at: [0, 0.66, 0.865],
      scale: [1.15, 0.65, 0.55],
      flat: true,
      group: "face",
      name: "little nose",
    },
  );

  const lowerJaw = b.sweep(
    catmull([
      [0, 0.59, 0.69],
      [0, 0.55, 0.78],
      [0, 0.57, 0.84],
    ]),
    [0.095, 0.055],
    {
      bone: jaw,
      color: PALE,
      sides: 7,
      caps: "round",
      group: "jaw",
      name: "lower jaw",
    },
  );

  b.decal(b.surface(lowerJaw), mouthTexture, {
    at: [0, 0.585, 0.835],
    dir: [0, 0.12, 1],
    up: [0, 1, 0],
    size: [0.19, 0.075],
    lift: 0.004,
    segments: 6,
    group: "face",
    name: "smiling mouth",
  });

  // Tiny cheek freckles give the pale face more graphic character.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const p = new THREE.Vector3(
        s * (0.22 + (i % 2) * 0.025),
        0.59 + Math.floor(i / 2) * 0.035,
        0.78 + (i % 2) * 0.01,
      );
      const h = headSurface.nearest(p);
      b.stick(
        new THREE.SphereGeometry(0.009, 5, 4),
        "#d47b93",
        h,
        { embed: 0.35, group: "face", name: "cheek freckle" },
      );
    }
  }

  // ------------------------------------------------------------------------------------------------
  // Signature frilly pink external gills.

  for (let i = 0; i < gillChains.length; i++) {
    const g = gillChains[i];
    const side = i < 3 ? 1 : -1;
    const shade = i % 2 === 0 ? GILL : GILL_LIGHT;
    const gillSweep = b.sweep(g, (t) => 0.035 * (1 - t) + 0.009, {
      bone: g,
      color: shade,
      sides: 6,
      caps: { start: "round", end: "point" },
      group: "gills",
      name: `frilly gill ${i + 1}`,
    });

    // Side spikes make each taper look like a feathery, branching plume.
    for (const t of [0.28, 0.52, 0.72]) {
      const at = gillSweep.at(t, side > 0 ? 90 : -90, 0.004);
      b.spike(
        at,
        [0, 0.38 + 0.08 * (1 - t), 0],
        0.075 * (1 - t * 0.35),
        0.014,
        {
          color: i % 2 === 0 ? GILL_LIGHT : GILL,
          group: "gills",
          name: `gill filament ${i + 1}`,
        },
      );
      b.spike(
        at,
        [0, -0.28 - 0.06 * t, 0],
        0.058 * (1 - t * 0.3),
        0.011,
        {
          color: shade,
          group: "gills",
          name: `lower gill filament ${i + 1}`,
        },
      );
    }
  }

  // A few pale dorsal flecks break up the mint body without making it noisy.
  const bodySurface = b.surface(bodyTube);
  const fleckRng = rng(41);
  for (let i = 0; i < 18; i++) {
    const hit = bodySurface.scatter(1, {
      rng: fleckRng,
      minDist: 0.045,
      filter: (h) => h.n.y > -0.15 && h.at.z > -0.75 && h.at.z < 0.38,
    })[0];
    if (hit) {
      b.stick(
        new THREE.SphereGeometry(0.012 + fleckRng() * 0.008, 5, 4),
        "#c9eee1",
        hit,
        { embed: 0.45, group: "body markings", name: "pale body fleck" },
      );
    }
  }

  // Pose the jaw a little open: the jaw remains a distinct hinge for animation.
  b.pose(jaw, { axis: [1, 0, 0], deg: -8 });

  return b.root;
}
```
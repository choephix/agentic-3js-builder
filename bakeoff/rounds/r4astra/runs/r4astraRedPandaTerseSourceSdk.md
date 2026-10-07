```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  paint,
  mottle,
  mix,
  rng,
} from "agentic-3js-builder";
import type {
  Fill,
  JointRef,
  SweepOptions,
} from "agentic-3js-builder";

export const meta = {
  name: "Ember the Red Panda",
  description:
    "A low-poly red panda with a copper coat, creamy cheek ruffs, expressive dark eyes, little clawed paws, and a long, articulated ringed tail.",
};

export default function (): THREE.Object3D {
  const b = createBuilder({
    name: "Ember the Red Panda",
    detail: 0.8,
    paintSize: 1024,
  });

  // Authoring dimensions are scaled into a roughly 1.2 m nose-to-tail adult.
  const S = 0.82;
  const P = (a: readonly number[]) => a.map((v) => v * S);
  const random = rng(8317);

  const C = {
    rust: "#b94f2c",
    copper: "#cc6735",
    lightRust: "#d57943",
    deepRust: "#9b3e27",
    tailRust: "#ae492a",
    tailGold: "#dfaa70",
    tailGoldLight: "#e9b77f",
    dark: "#362729",
    darkLight: "#49302d",
    sole: "#2b2427",
    cream: "#f3e5cf",
    creamShade: "#e4ceb0",
    earDark: "#68372c",
    earInner: "#bd8c77",
    eyeRim: "#713127",
    eye: "#191b1c",
    iris: "#603d2c",
    nose: "#292125",
    mouth: "#382326",
    claw: "#cfb49a",
    whisker: "#e9d9c1",
    glint: "#fff4dc",
  };

  // ---------------------------------------------------------------------------
  // Skeleton first.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: P([0, 0.32, -0.205]),
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 0.325, -0.205],
      [0, 0.35, -0.03],
      [0, 0.355, 0.17],
    ].map(P),
    {
      parent: hips,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
      up: [0, 1, 0],
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 0.358, 0.176],
      [0, 0.414, 0.25],
      [0, 0.467, 0.318],
    ].map(P),
    {
      parent: "chest",
      names: ["neck1", "neck2"],
      role: "neck",
      up: [0, 1, 0],
    },
  );

  const head = b.joint("head", {
    parent: neck,
    at: P([0, 0.467, 0.318]),
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "head",
  });

  const upperJaw = b.joint("upperJaw", {
    parent: head,
    at: P([0, 0.431, 0.43]),
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: P([0, 0.408, 0.397]),
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  const ears = [1, -1].map((s) => ({
    s,
    bone: b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: P([s * 0.113, 0.553, 0.336]),
      dir: [s * 0.3, 1, 0],
      up: [0, 0, 1],
      role: "hinge",
    }),
  }));

  const tail = b.chain(
    "tail",
    catmull(
      [
        [0, 0.335, -0.262],
        [0.016, 0.355, -0.374],
        [0.043, 0.343, -0.515],
        [0.079, 0.306, -0.66],
        [0.126, 0.263, -0.805],
        [0.162, 0.241, -0.945],
      ].map(P),
    ),
    {
      parent: hips,
      count: 6,
      names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6"],
      up: [0, 1, 0],
      role: "tail",
    },
  );

  const legs = [true, false].flatMap((front) =>
    [1, -1].map((s) => {
      const side = s === 1 ? "L" : "R";
      const tag = `${front ? "F" : "H"}${side}`;
      const x = s * 0.162;
      const pawZ = front ? 0.267 : -0.152;
      const points = front
        ? [
            [s * 0.105, 0.352, 0.176],
            [s * 0.14, 0.211, 0.17],
            [x, 0.073, 0.218],
            [x, 0.032, pawZ],
          ]
        : [
            [s * 0.103, 0.323, -0.205],
            [s * 0.146, 0.219, -0.145],
            [x, 0.095, -0.228],
            [x, 0.032, pawZ],
          ];

      const chain = b.chain(`leg${tag}`, points.map(P), {
        parent: front ? "chest" : hips,
        names: front
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `paw${tag}`]
          : [`hip${side}`, `knee${side}`, `hock${side}`, `paw${tag}`],
        role: "leg",
        contact: P([x, 0, pawZ + 0.029]),
        up: [0, 0, 1],
      });

      const toes = Array.from({ length: 5 }, (_, i) => {
        const across = (i - 2) * 0.017;
        const tx = x + across;
        const startZ = pawZ + 0.027;
        const endZ = pawZ + 0.064 - 0.005 * Math.abs(i - 2);
        const chainToe = b.chain(
          `digit${tag}${i + 1}`,
          [P([tx, 0.013, startZ]), P([tx, 0.012, endZ])],
          {
            parent: chain.tip!,
            names: [`toe${tag}${i + 1}`],
            role: "digit",
            up: [0, 1, 0],
          },
        );
        return { x: tx, startZ, endZ, chain: chainToe };
      });
      return { s, front, tag, x, pawZ, chain, toes };
    }),
  );

  // ---------------------------------------------------------------------------
  // Reusable primitive helpers and restrained fur paints.
  // ---------------------------------------------------------------------------

  const sphereGeometry = new THREE.SphereGeometry(1, 12, 8);

  function ellipsoid(
    name: string,
    at: number[],
    radii: number[],
    color: Fill,
    bone: JointRef,
  ) {
    return b.part(sphereGeometry, color, {
      name,
      at: P(at),
      scale: P(radii),
      bone,
      flat: true,
    });
  }

  function loft(
    name: string,
    stations: number[][],
    color: Fill,
    bone: JointRef,
    extra: SweepOptions = {},
  ) {
    return b.loft(
      stations.map(([x, y, z, w, h]) => ({
        at: P([x, y, z]),
        w: w * S,
        h: h * S,
      })),
      {
        name,
        color,
        bone,
        sides: 10,
        smooth: false,
        caps: "round",
        up: [0, 1, 0],
        ...extra,
      },
    );
  }

  function outline(points: number[][]) {
    return points.map(([x, y]) => [x * S, y * S]);
  }

  // A little faceted, laid-back lock of fur, not an upright spike.
  function furGeometry(width: number, length: number, height: number) {
    const vertices = [
      [-width, 0, -length * 0.25],
      [width, 0, -length * 0.25],
      [width * 0.8, 0, length * 0.28],
      [0, 0, length],
      [-width * 0.8, 0, length * 0.28],
      [0, height, length * 0.1],
    ];
    const indices: number[] = [];
    for (let i = 0; i < 5; i++) indices.push(5, (i + 1) % 5, i);
    indices.push(0, 1, 2, 0, 2, 3, 0, 3, 4);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices.flatMap(P), 3),
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  const bodyLock = furGeometry(0.011, 0.032, 0.008);
  const smallLock = furGeometry(0.008, 0.025, 0.006);
  const tailLock = furGeometry(0.0085, 0.031, 0.0065);

  const rustVariation = mottle(C.rust, C.copper, {
    size: 0.095 * S,
    seed: 31,
    contrast: 0.6,
  });
  const creamVariation = mottle(C.cream, "#eddbc1", {
    size: 0.05 * S,
    seed: 9,
    contrast: 0.65,
  });

  const bodyPaint = paint((p) => {
    const y = p.y / S;
    const z = p.z / S;
    const x = Math.abs(p.x / S);
    const furHem =
      0.314 +
      0.005 * Math.sin(z * 113) +
      0.004 * Math.sin(z * 59 + x * 81);
    if (y < furHem) return y < 0.26 ? C.dark : C.darkLight;
    if (y > 0.442) return mix(C.copper, C.lightRust, 0.26);
    return rustVariation;
  });

  const facePaint = paint((p) => {
    const x = Math.abs(p.x / S);
    const y = p.y / S;
    const z = p.z / S;
    const edge = 0.002 * Math.sin(y * 530 + x * 230);
    const eyePatch =
      ((x - 0.081) / 0.058) ** 2 +
      ((y - 0.491) / (0.056 + edge)) ** 2;
    const orbital = z > 0.387 && eyePatch < 1;
    const cheek = z > 0.322 && y < 0.466 + edge && x > 0.055;
    const chin = z > 0.405 && y < 0.426;
    const bridge =
      z > 0.413 && y > 0.5 && y < 0.543 &&
      x < 0.025 * (1 - Math.abs(y - 0.519) / 0.039);
    let white = orbital || cheek || chin || bridge;

    // Cinnamon tear markings distinguish the mask from a raccoon's black band.
    const tearCenter = 0.078 + 0.2 * (0.48 - y);
    const tear =
      z > 0.415 &&
      y < 0.48 &&
      y > 0.413 &&
      Math.abs(x - tearCenter) < 0.0135 + edge;
    if (tear) return C.deepRust;
    if (white) return creamVariation;
    if (y > 0.543) return rustVariation;
    return C.rust;
  });

  // ---------------------------------------------------------------------------
  // Simple, substantial body volumes.
  // ---------------------------------------------------------------------------

  const torso = loft(
    "russetCoat",
    [
      [0, 0.321, -0.264, 0.13, 0.145],
      [0, 0.345, -0.2, 0.249, 0.223],
      [0, 0.356, -0.083, 0.28, 0.239],
      [0, 0.358, 0.067, 0.272, 0.247],
      [0, 0.361, 0.178, 0.231, 0.215],
      [0, 0.363, 0.227, 0.149, 0.153],
    ],
    bodyPaint,
    spine,
    { sides: 12 },
  );

  loft(
    "ruffAndNeck",
    [
      [0, 0.357, 0.164, 0.2, 0.184],
      [0, 0.397, 0.237, 0.195, 0.183],
      [0, 0.453, 0.299, 0.176, 0.174],
    ],
    bodyPaint,
    neck,
  );

  const haunches = [1, -1].map((s) =>
    ellipsoid(
      `haunch${s === 1 ? "L" : "R"}`,
      [s * 0.094, 0.3, -0.204],
      [0.081, 0.098, 0.086],
      bodyPaint,
      s === 1 ? "hipL" : "hipR",
    ),
  );

  const coatSurface = b.surface([torso, ...haunches]);
  const coatHits = coatSurface.scatter(52, {
    rng: random,
    minDist: 0.035 * S,
    filter: (hit) => hit.at.y > 0.336 * S,
  });
  for (const hit of coatHits) {
    b.stick(bodyLock, random() > 0.7 ? C.copper : C.rust, hit, {
      name: "laidBackGuardFur",
      embed: 0.38,
      flow: [0, -0.13, -1],
      scale: 0.75 + random() * 0.5,
      flat: true,
    });
  }

  // Dark stocking legs, broad palms, individually articulated toes.
  for (const leg of legs) {
    b.sweep(
      leg.chain,
      (leg.front
        ? [0.052, 0.046, 0.034, 0.03]
        : [0.067, 0.061, 0.031, 0.028]
      ).map((v) => v * S),
      {
        name: `stocking${leg.tag}`,
        color: C.dark,
        sides: 8,
        smooth: false,
        caps: "round",
      },
    );

    loft(
      `palm${leg.tag}`,
      [
        [leg.x, 0.032, leg.pawZ - 0.027, 0.052, 0.048],
        [leg.x, 0.028, leg.pawZ + 0.005, 0.079, 0.049],
        [leg.x, 0.025, leg.pawZ + 0.033, 0.074, 0.038],
      ],
      C.sole,
      leg.chain.tip!,
      { sides: 8, caps: "flat" },
    );

    for (const toe of leg.toes) {
      b.sweep(
        toe.chain,
        (t) => [
          (0.0075 - t * 0.0007) * S,
          (0.012 - t * 0.0022) * S,
        ],
        {
          name: `toeFur${leg.tag}`,
          color: C.dark,
          sides: 6,
          smooth: false,
          caps: "round",
        },
      );
      b.sweep(
        bezier(
          P([toe.x, 0.017, toe.endZ + 0.003]),
          P([toe.x, 0.019, toe.endZ + 0.014]),
          P([toe.x, 0.008, toe.endZ + 0.026]),
        ),
        [0.0038, 0.003, 0].map((v) => v * S),
        {
          name: `littleClaw${leg.tag}`,
          bone: toe.chain,
          color: C.claw,
          sides: 5,
          smooth: false,
          caps: "flat",
        },
      );
    }

    const shin = b.surface(leg.chain.joints[1]);
    const hits = shin.scatter(3, {
      rng: random,
      minDist: 0.026 * S,
      filter: (h) =>
        h.at.y > 0.115 * S &&
        h.at.y < 0.22 * S &&
        h.n.z > 0.2,
    });
    for (const hit of hits) {
      b.stick(smallLock, C.darkLight, hit, {
        flow: [0, -1, 0.15],
        embed: 0.45,
        flat: true,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Long, fluffy tail. Eleven large alternating bands remain readable at distance.
  // ---------------------------------------------------------------------------

  const tailBands: Array<readonly [number, string]> = Array.from(
    { length: 11 },
    (_, i) => [(i + 1) / 11, i % 2 ? C.tailGold : C.tailRust] as const,
  );

  const tailCoat = b.sweep(
    tail,
    [0.054, 0.069, 0.076, 0.075, 0.068, 0.048, 0.008].map(
      (v) => v * S,
    ),
    {
      name: "ringedTail",
      bands: tailBands,
      sides: 10,
      smooth: false,
      caps: "round",
    },
  );

  b.along(tailCoat, 11, (at) => {
    const band = Math.min(10, Math.floor(at.t * 11));
    if (band === 10) return;
    for (let k = 0; k < 6; k++) {
      const hit = tailCoat.at(at.t, k * 60 + (band % 2) * 17);
      b.stick(
        tailLock,
        band % 2 ? C.tailGold : C.tailRust,
        hit,
        {
          name: "tailGuardFur",
          flow: hit.tangent,
          embed: 0.4,
          scale: 0.8 + random() * 0.32,
          flat: true,
        },
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Broad head, angular cream cheek ruff and cinnamon tear marks.
  // ---------------------------------------------------------------------------

  const skull = loft(
    "maskedHead",
    [
      [0, 0.462, 0.254, 0.18, 0.19],
      [0, 0.474, 0.298, 0.247, 0.232],
      [0, 0.475, 0.363, 0.278, 0.233],
      [0, 0.463, 0.428, 0.23, 0.176],
      [0, 0.441, 0.464, 0.13, 0.102],
    ],
    facePaint,
    head,
    { sides: 12 },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      `creamCheek${s === 1 ? "L" : "R"}`,
      [s * 0.102, 0.416, 0.419],
      [0.064, 0.055, 0.059],
      facePaint,
      head,
    );

    b.extrude(
      outline([
        [0.099, 0.46],
        [0.143, 0.46],
        [0.177, 0.435],
        [0.153, 0.428],
        [0.18, 0.408],
        [0.151, 0.403],
        [0.163, 0.38],
        [0.123, 0.386],
        [0.093, 0.41],
      ]),
      {
        name: `cheekRuff${s === 1 ? "L" : "R"}`,
        at: P([0, 0, 0.397]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.047 * S,
        bevel: 0.004 * S,
        detail: 0.5,
        color: C.cream,
        bone: head,
      },
    );
  }

  const skullSurface = b.surface(skull);
  for (const hit of skullSurface.scatter(13, {
    rng: random,
    minDist: 0.025 * S,
    filter: (h) => h.at.y > 0.549 * S && h.at.z < 0.419 * S,
  })) {
    b.stick(smallLock, C.copper, hit, {
      name: "crownFur",
      embed: 0.45,
      flow: [0, 0.15, -1],
      scale: 0.7 + random() * 0.3,
      flat: true,
    });
  }

  // Broad, triangular ears with thick ivory rims and recessed warm interiors.
  const earOutline = [
    [-0.044, -0.019],
    [-0.042, 0.033],
    [-0.012, 0.083],
    [0.028, 0.115],
    [0.053, 0.088],
    [0.057, 0.031],
    [0.037, -0.012],
  ];

  for (const { s, bone } of ears) {
    b.extrude(outline(earOutline), {
      name: `earBack${s === 1 ? "L" : "R"}`,
      at: P([s * 0.112, 0.553, 0.332]),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.04 * S, 0.02 * S],
      bevel: 0.003 * S,
      detail: 0.5,
      color: C.earDark,
      bone,
    });

    b.extrude(
      outline(earOutline.map(([x, y]) => [x * 0.95, y * 0.96])),
      {
        name: "ivoryEarRim",
        at: P([s * 0.112, 0.553, 0.353]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012 * S,
        bevel: 0.003 * S,
        detail: 0.5,
        color: C.cream,
        bone,
      },
    );

    b.extrude(
      outline([
        [-0.025, 0.009],
        [-0.025, 0.035],
        [0.025, 0.091],
        [0.035, 0.065],
        [0.035, 0.022],
        [0.018, 0.003],
      ]),
      {
        name: "recessedEarInterior",
        at: P([s * 0.112, 0.553, 0.361]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.005 * S,
        color: C.earDark,
        bone,
      },
    );

    b.extrude(
      outline([
        [-0.022, 0.013],
        [-0.008, 0.034],
        [0.001, 0.022],
        [0.017, 0.048],
        [0.023, 0.015],
        [0.013, -0.001],
        [-0.01, 0.001],
      ]),
      {
        name: "earFluff",
        at: P([s * 0.112, 0.553, 0.365]),
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.006 * S,
        color: C.creamShade,
        bone,
      },
    );
  }

  // Eyes sit on the actual head surface, with no white human-like sclera.
  for (const s of [1, -1]) {
    const hit = skullSurface.ray(
      P([s * 0.079, 0.489, 0.7]),
      [0, 0, -1],
    )!;

    b.stick(sphereGeometry, C.eyeRim, hit, {
      name: `eyeSurround${s === 1 ? "L" : "R"}`,
      scale: P([0.026, 0.009, 0.027]),
      embed: 0.36,
      flat: true,
    });

    const eye = b.stick(sphereGeometry, C.eye, hit, {
      name: `eye${s === 1 ? "L" : "R"}`,
      scale: P([0.0185, 0.015, 0.021]),
      embed: 0.24,
      flat: true,
    });

    b.part(new THREE.SphereGeometry(0.0043 * S, 8, 6), C.glint, {
      name: "eyeCatchlight",
      at: eye.local(P([-0.005, 0.0135, 0.007])),
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0019 * S, 6, 4), C.creamShade, {
      name: "smallEyeCatchlight",
      at: eye.local(P([0.005, 0.014, -0.006])),
      bone: head,
    });

    b.sweep(
      catmull([
        eye.local(P([-0.019, 0.002, 0.007])),
        eye.local(P([-0.009, 0.008, 0.019])),
        eye.local(P([0.006, 0.008, 0.021])),
        eye.local(P([0.019, 0.002, 0.01])),
      ]),
      0.0026 * S,
      {
        name: "upperEyelid",
        color: C.deepRust,
        bone: head,
        sides: 6,
        caps: "round",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Separate upper muzzle and hinged lower jaw.
  // ---------------------------------------------------------------------------

  loft(
    "lowerJaw",
    [
      [0, 0.397, 0.408, 0.104, 0.035],
      [0, 0.387, 0.454, 0.121, 0.041],
      [0, 0.394, 0.495, 0.089, 0.026],
    ],
    C.creamShade,
    jaw,
    { sides: 8 },
  );

  loft(
    "lowerLip",
    [
      [0, 0.407, 0.436, 0.103, 0.013],
      [0, 0.407, 0.479, 0.103, 0.013],
      [0, 0.409, 0.506, 0.075, 0.009],
    ],
    C.mouth,
    jaw,
    { sides: 8, caps: "flat" },
  );

  for (const s of [1, -1]) {
    ellipsoid(
      "upperMuzzleLobe",
      [s * 0.027, 0.432, 0.477],
      [0.043, 0.032, 0.043],
      creamVariation,
      upperJaw,
    );
  }

  b.extrude(
    outline([
      [-0.025, 0.008],
      [-0.02, 0.018],
      [0.02, 0.018],
      [0.025, 0.008],
      [0.01, -0.009],
      [0, -0.014],
      [-0.011, -0.009],
    ]),
    {
      name: "softTriangularNose",
      at: P([0, 0.438, 0.513]),
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.022 * S,
      bevel: 0.005 * S,
      detail: 0.65,
      color: C.nose,
      bone: upperJaw,
    },
  );

  ellipsoid(
    "noseSoftHighlight",
    [-0.006, 0.448, 0.525],
    [0.009, 0.003, 0.0015],
    "#6e5650",
    upperJaw,
  );

  b.sweep(
    [P([0, 0.427, 0.522]), P([0, 0.409, 0.519])],
    0.0017 * S,
    {
      name: "philtrum",
      color: C.mouth,
      bone: upperJaw,
      sides: 5,
      caps: "round",
    },
  );

  for (const s of [1, -1]) {
    b.sweep(
      catmull(
        [
          [0, 0.409, 0.519],
          [s * 0.023, 0.404, 0.511],
          [s * 0.044, 0.409, 0.498],
        ].map(P),
      ),
      0.0016 * S,
      {
        name: "muzzleSmileLine",
        color: C.mouth,
        bone: upperJaw,
        sides: 5,
        caps: "round",
      },
    );

    for (let i = 0; i < 3; i++) {
      const root = [
        s * (0.048 + i * 0.003),
        0.429 - i * 0.007,
        0.505 - i * 0.003,
      ];
      ellipsoid(
        "whiskerFollicle",
        root,
        [0.0017, 0.0015, 0.0014],
        C.earDark,
        upperJaw,
      );
      b.sweep(
        bezier(
          P(root),
          P([s * 0.103, 0.444 - i * 0.014, 0.53]),
          P([s * (0.174 - i * 0.009), 0.455 - i * 0.022, 0.518]),
        ),
        [0.00105, 0.0008, 0.00015].map((v) => v * S),
        {
          name: "creamWhisker",
          bone: upperJaw,
          color: C.whisker,
          sides: 4,
          smooth: false,
          caps: "flat",
        },
      );
    }
  }

  // Small amounts of gloss only on the living facial features.
  b.material(C.eye).roughness = 0.2;
  b.material(C.eye).metalness = 0.03;
  b.material(C.nose).roughness = 0.38;
  b.material(C.dark).roughness = 0.91;
  b.material(C.sole).roughness = 0.94;
  b.material(C.cream).roughness = 0.86;
  b.material(C.claw).roughness = 0.58;

  return b.root;
}
```
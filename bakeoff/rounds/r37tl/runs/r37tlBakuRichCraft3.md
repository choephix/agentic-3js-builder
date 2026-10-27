```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  svg,
  spots,
  countershade,
  paint,
} from "agentic-3js-builder";

export const meta = {
  name: "Baku, Dream-Eating Tapir Spirit",
  description:
    "A blocky ukiyo-e woodblock print interpretation of the baku: a sleepy tapir spirit with a cream belly, indigo-black coat, curled trunk, painted eyes, striped legs, broad ears, mane, tusks, and floating dream-cloud cards.",
};

const INK = "#211b2b";
const NIGHT = "#17243f";
const INDIGO = "#243b67";
const BLUE = "#41618a";
const CREAM = "#e7d2a0";
const PAPER = "#f2dfb3";
const RUSSET = "#9c4c36";
const RED = "#71302e";
const GOLD = "#d59b43";
const MOSS = "#52604b";
const PALEBLUE = "#9db6c2";

const coat = countershade(
  spots(INDIGO, [BLUE, "#304b78", "#1d3158"], {
    size: 0.19,
    amount: 0.28,
    rosette: true,
    seed: 19,
  }),
  NIGHT,
  { level: -0.18, soft: 0.28 },
);

const belly = paint((p, n) => {
  const warm = 0.5 + 0.5 * Math.max(-0.2, Math.min(1, n.y));
  return warm > 0.4 ? CREAM : "#b89578";
});

const stripedLeg = paint((p) => {
  const k = Math.sin(p.y * 34 + p.z * 4) > 0.1;
  return k ? INK : RUSSET;
});

const dreamInk = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M15 76 C24 48 49 44 63 62 C75 26 111 33 111 61
             C126 62 126 91 105 94 C93 112 63 106 58 88
             C40 103 18 96 15 76Z"
          fill="#e8d4a4" stroke="#211b2b" stroke-width="7"
          stroke-linejoin="round"/>
    <path d="M38 71 Q49 57 61 72 Q72 87 84 66 Q93 54 103 68"
          fill="none" stroke="#71302e" stroke-width="5"/>
    <circle cx="42" cy="76" r="5" fill="#243b67"/>
    <circle cx="92" cy="72" r="5" fill="#243b67"/>
  </svg>`,
  { size: 192 },
);

const eyeTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
    <path d="M6 51 Q39 10 74 51 Q40 91 6 51Z"
          fill="#f4dfae" stroke="#211b2b" stroke-width="8"/>
    <ellipse cx="41" cy="51" rx="15" ry="25" fill="#71302e"/>
    <ellipse cx="41" cy="51" rx="7" ry="19" fill="#211b2b"/>
    <circle cx="35" cy="38" r="5" fill="#fff5d0"/>
    <circle cx="47" cy="63" r="3" fill="#fff5d0"/>
  </svg>`,
  { size: 256 },
);

const earMark = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M10 79 Q30 15 89 20 Q62 42 48 81Z"
      fill="#71302e" stroke="#211b2b" stroke-width="8"/>
    <path d="M28 69 Q43 37 69 29" fill="none"
      stroke="#d59b43" stroke-width="6"/>
  </svg>`,
  { size: 160 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: any,
  at: [number, number, number],
  bone: any,
  bevel = 0,
) {
  const g = new THREE.BoxGeometry(...size);
  return b.part(g, color, { at, bone, flat: true, name: "block", ...(bevel ? {} : {}) });
}

function disk(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  color: any,
  at: THREE.Vector3 | [number, number, number],
  bone: any,
  dir: [number, number, number] = [0, 0, 1],
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, depth, 10), color, {
    at,
    bone,
    dir,
    flat: true,
    name: "woodblock-disc",
  });
}

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton: one root, broad spine, neck, head, opening jaw, trunk, tail, legs.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.78, -0.22],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.78, -0.48],
    [0, 0.88, -0.17],
    [0, 0.92, 0.18],
    [0, 1.02, 0.47],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.98, 0.42],
    [0, 1.12, 0.55],
    [0, 1.26, 0.68],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.29, 0.72],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.16, 0.79],
    dir: [0, -0.1, 1],
    role: "jaw",
    group: "face",
  });

  const trunkPath = catmull([
    [0, 1.19, 0.86],
    [0, 1.10, 1.04],
    [0, 0.91, 1.17],
    [0, 0.70, 1.10],
    [0, 0.61, 0.93],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: head,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunkTip"],
    role: "tentacle",
  });

  const tailPath = catmull([
    [0, 0.83, -0.53],
    [0, 0.78, -0.70],
    [0, 0.88, -0.87],
    [0.01, 1.00, -0.98],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  const feet = [
    { s: 1, z: 0.24, name: "fore" },
    { s: -1, z: 0.24, name: "fore" },
    { s: 1, z: -0.30, name: "hind" },
    { s: -1, z: -0.30, name: "hind" },
  ];

  const legs: any[] = [];
  for (const f of feet) {
    const x = f.s * 0.28;
    const rear = f.z < 0;
    const pts = [
      [x, 0.78, f.z] as [number, number, number],
      [x * 1.08, rear ? 0.51 : 0.49, f.z + (rear ? -0.02 : 0.05)] as [
        number,
        number,
        number,
      ],
      [x * 1.04, 0.23, f.z + (rear ? -0.06 : 0.08)] as [
        number,
        number,
        number,
      ],
      [x * 1.02, 0.16, f.z + (rear ? -0.08 : 0.1)] as [
        number,
        number,
        number,
      ],
    ];
    legs.push(
      b.chain(`leg${f.name}${f.s > 0 ? "L" : "R"}`, polyline(pts), {
        parent: hips,
        names: [
          `${f.name}Hip${f.s > 0 ? "L" : "R"}`,
          `${f.name}Knee${f.s > 0 ? "L" : "R"}`,
          `${f.name}Ankle${f.s > 0 ? "L" : "R"}`,
          `${f.name}Foot${f.s > 0 ? "L" : "R"}`,
        ],
        role: "leg",
        contact: [pts[3][0], 0, pts[3][2]],
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // Main body and broad tapir silhouette.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.31 + 0.035 * Math.sin(t * Math.PI), {
    color: coat,
    section: { ngon: 8 },
    sides: 8,
    name: "ink-blue body",
  });

  b.sweep(spine, (t) => 0.285 + 0.025 * Math.sin(t * Math.PI), {
    color: belly,
    sectors: [[112, 248, belly]],
    section: { ngon: 8 },
    sides: 8,
    name: "cream belly",
  });

  b.sweep(neck, [0.24, 0.18], {
    color: coat,
    section: { ngon: 8 },
    name: "heavy neck",
  });

  b.sweep(tail, [0.105, 0.025], {
    color: coat,
    section: { ngon: 7 },
    caps: { end: "point", start: "round" },
    name: "short tail",
  });

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, (t) => (t < 0.45 ? 0.115 : 0.095), {
      color: stripedLeg,
      section: { ngon: 6 },
      skin: "smooth",
      name: `striped leg ${i}`,
    });
  }

  // Chunky hoof-paws, with separate toe blocks.
  for (const f of feet) {
    const x = f.s;
    const z = f.z + (f.z < 0 ? -0.08 : 0.1);
    box(b, [0.20, 0.12, 0.24], INK, [x * 0.285, 0.13, z], hips);
    for (let j = -1; j <= 1; j++) {
      b.part(new THREE.SphereGeometry(0.045, 7, 5), CREAM, {
        at: [x * 0.285 + j * 0.045, 0.105, z + 0.10],
        bone: hips,
        flat: true,
        name: "paw toe",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Head, muzzle, cheeks, jaw and large expressive eyes.
  // ---------------------------------------------------------------------------

  const skull = b.part(
    new THREE.SphereGeometry(0.29, 12, 8),
    coat,
    {
      bone: head,
      at: [0, 1.31, 0.75],
      scale: [0.92, 1.0, 1.08],
      flat: true,
      name: "rounded spirit skull",
    },
  );

  const cheekL = b.part(
    new THREE.SphereGeometry(0.20, 9, 7),
    coat,
    { bone: head, at: [0.17, 1.20, 0.84], flat: true, name: "left cheek" },
  );
  const cheekR = b.part(
    new THREE.SphereGeometry(0.20, 9, 7),
    coat,
    { bone: head, at: [-0.17, 1.20, 0.84], flat: true, name: "right cheek" },
  );

  const muzzle = b.sweep(
    catmull([
      [0, 1.17, 0.83],
      [0, 1.10, 0.98],
      [0, 1.03, 1.10],
    ]),
    [0.19, 0.12],
    { bone: jaw, color: belly, section: { ngon: 8 }, name: "cream muzzle" },
  );

  b.sweep(
    catmull([
      [0, 1.10, 1.075],
      [0, 1.075, 1.15],
    ]),
    [0.12, 0.035],
    { bone: jaw, color: INK, caps: { end: "flat" }, name: "lower lip" },
  );

  b.part(new THREE.SphereGeometry(0.095, 8, 6), INK, {
    bone: jaw,
    at: [0, 1.07, 1.18],
    flat: true,
    name: "soft black nose",
  });

  // Painted eyes as curved decals, plus raised brow ridges.
  const faceSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const hit = faceSurface.around([0, 1.31, 0.75]).at(s * 42, 5);
    if (hit) {
      b.decal(faceSurface, eyeTexture, {
        at: hit.at,
        dir: hit.n,
        size: [0.115, 0.145],
        mirror: s > 0,
        lift: 0.006,
        name: s > 0 ? "left painted eye" : "right painted eye",
      });
    }
    b.sweep(
      catmull([
        [s * 0.08, 1.43, 0.91],
        [s * 0.16, 1.47, 0.91],
        [s * 0.23, 1.44, 0.88],
      ]),
      0.022,
      { bone: head, color: INK, caps: "round", name: "bold brow" },
    );
  }

  // Tusks: small ivory hooks framing the trunk.
  for (const s of [-1, 1]) {
    const tusk = catmull([
      [s * 0.105, 1.13, 1.00],
      [s * 0.145, 1.05, 1.09],
      [s * 0.16, 0.98, 1.12],
    ]);
    b.sweep(tusk, [0.035, 0.004], {
      bone: jaw,
      color: CREAM,
      caps: { end: "point", start: "round" },
      name: "small ivory tusk",
    });
  }

  // ---------------------------------------------------------------------------
  // Ears: broad angular woodblock silhouettes with red inner marks.
  // ---------------------------------------------------------------------------

  for (const s of [-1, 1]) {
    const ear = b.extrude(
      [
        [0, 0],
        [0.10, 0.04],
        [0.16, 0.22],
        [0.11, 0.38],
        [0.02, 0.29],
      ],
      {
        at: [s * 0.20, 1.42, 0.68],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        smoothing: 0,
        bone: head,
        color: coat,
        name: s > 0 ? "left pointed ear" : "right pointed ear",
      },
    );
    b.decal(
      ear,
      earMark,
      {
        at: ear.local([0.095, 0.19, 0.026]),
        dir: [0, 0, 1],
        size: [0.12, 0.19],
        lift: 0.002,
        mirror: s < 0,
        bone: head,
        name: "red ear woodcut",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Indigo mane, dorsal tufts, whiskers and graphic fur cuts.
  // ---------------------------------------------------------------------------

  const maneTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
      <path d="M16 0 L31 18 L22 19 L31 38 L21 37 L28 58 L18 54 L20 78 L11 68 L6 96
               L3 68 L0 75 L5 51 L-2 54 L7 34 L1 34 L11 17 L5 18Z"
            fill="#211b2b" stroke="#17243f" stroke-width="2"/>
    </svg>`,
    { size: 128 },
  );

  const maneHits = b.surface(body).scatter(20, {
    rng: rng(44),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.35 && h.at.z > -0.45 && h.at.z < 0.55,
  });
  b.cards(maneHits, maneTex, {
    size: [0.075, 0.25],
    lean: 58,
    bend: 18,
    vary: 0.25,
    color: INK,
    rng: rng(45),
    sink: 0.18,
    name: "sawtooth mane",
  });

  // A few deliberate shoulder and rump tufts to make the silhouette readable.
  for (const z of [-0.34, -0.18, 0.02, 0.22, 0.40]) {
    b.spike([0, 1.11, z], [0, 0.36, 0], 0.12, 0.045, {
      bone: spine.joints[Math.min(2, Math.floor((z + 0.5) * 3))],
      color: INK,
      name: "mane ridge spike",
    });
  }

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      b.sweep(
        [
          [s * 0.17, 1.13 - i * 0.035, 0.99],
          [s * (0.27 + i * 0.025), 1.10 - i * 0.045, 1.08],
        ],
        0.008,
        { bone: jaw, color: CREAM, caps: "point", name: "tapir whisker" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Ukiyo-e graphic marks: red flank seal, cream spiral, and dream clouds.
  // ---------------------------------------------------------------------------

  const seal = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="9" y="9" width="82" height="82" rx="5" fill="#71302e" stroke="#211b2b" stroke-width="5"/>
      <path d="M27 31 Q50 18 73 31 Q59 39 70 51 Q52 47 37 61 Q45 70 27 74
               Q37 55 27 31Z" fill="#e7d2a0"/>
    </svg>`,
    { size: 128 },
  );

  b.decal(body, seal, {
    at: [0.285, 0.88, -0.02],
    dir: [1, 0.1, 0],
    up: [0, 1, 0],
    size: [0.12, 0.12],
    lift: 0.008,
    name: "vermilion spirit seal",
  });

  for (const s of [-1, 1]) {
    const spiral = b.sweep(
      catmull([
        [s * 0.29, 0.88, 0.20],
        [s * 0.34, 0.93, 0.22],
        [s * 0.35, 1.00, 0.13],
        [s * 0.30, 1.04, 0.07],
      ]),
      0.012,
      { bone: spine.tip, color: GOLD, caps: "round", name: "golden dream spiral" },
    );
    b.part(new THREE.SphereGeometry(0.025, 7, 5), GOLD, {
      at: [s * 0.30, 1.04, 0.07],
      bone: spine.tip,
      flat: true,
      name: "spiral bead",
    });
  }

  // Floating dream motifs are part of the spirit's silhouette, not a separate scene.
  const dreamFrames = [
    { at: [0.45, 1.52, 0.28], n: [0.15, 0.45, 0.88] },
    { at: [-0.48, 1.36, 0.05], n: [-0.18, 0.38, 0.91] },
    { at: [0.34, 1.22, -0.56], n: [0.22, 0.35, 0.90] },
  ];
  for (const d of dreamFrames) {
    b.cards(
      [
        {
          at: new THREE.Vector3(...d.at),
          axis: new THREE.Vector3(...d.n).normalize(),
        } as any,
      ],
      dreamInk,
      {
        size: [0.22, 0.20],
        lean: 12,
        bend: 8,
        color: PAPER,
        sink: 0,
        name: "floating dream cloud",
      },
    );
  }

  // Small gold studs and block-print dots along the shoulder, brow, and trunk.
  const studs: [number, number, number][] = [];
  for (let i = 0; i < 8; i++) {
    const z = -0.35 + i * 0.105;
    studs.push([0.245, 1.02 + 0.035 * Math.sin(i), z]);
    studs.push([-0.245, 1.02 + 0.035 * Math.sin(i), z]);
  }
  for (const p of studs) {
    b.part(new THREE.SphereGeometry(0.016, 6, 4), GOLD, {
      at: p,
      bone: spine.joints[1],
      flat: true,
      name: "golden print dot",
    });
  }

  // A graphic line separating the cream belly from the dark flank.
  b.sweep(
    catmull([
      [0.285, 0.79, -0.48],
      [0.30, 0.80, -0.12],
      [0.30, 0.87, 0.25],
      [0.24, 0.96, 0.50],
    ]),
    0.012,
    { bone: spine.joints[1], color: INK, caps: "round", name: "belly contour line" },
  );

  // Trunk rings, giving the long nose a carved woodblock rhythm.
  for (let i = 1; i < 6; i++) {
    const at = trunk.at(i / 6);
    b.ring(at, { count: 8, radius: at.radius ? at.radius * 0.98 : 0.095 }, (r) =>
      b.part(new THREE.SphereGeometry(0.009, 5, 4), GOLD, {
        frame: r,
        name: "trunk ring bead",
        flat: true,
      }),
    );
  }

  // End of trunk: a dark, friendly, slightly oversized tip.
  b.part(new THREE.SphereGeometry(0.065, 8, 6), INK, {
    bone: trunk.tip,
    at: [0, 0.61, 0.93],
    flat: true,
    name: "trunk tip",
  });

  return b.root;
}
```
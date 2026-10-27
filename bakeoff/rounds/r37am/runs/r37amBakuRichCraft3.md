```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  limb,
  rng,
  svg,
  countershade,
  stripes,
  paint,
} from "agentic-3js-builder";

export const meta = {
  name: "Baku — Dream-Eating Tapir Spirit",
  description:
    "A stylized ukiyo-e woodblock baku: a squat tapir spirit with a long trunk, fan ears, indigo coat, cream muzzle and rump, bold carved-line markings, cloud-like dream wisps, and a moon crest.",
};

const INK = "#19152a";
const INDIGO = "#263b67";
const DEEP_INDIGO = "#172342";
const BLUE = "#42648f";
const CREAM = "#e8d4a2";
const PALE = "#f5e6bb";
const RUST = "#a94d3a";
const GOLD = "#d49a45";
const RED = "#8d3040";
const NIGHT = "#10152b";
const CLOUD = "#9fb2c4";
const WHITE = "#fff5d0";

const COAT = countershade(
  stripes(INDIGO, [DEEP_INDIGO, BLUE], {
    size: 0.28,
    width: 0.22,
    wobble: 0.22,
    seed: 11,
  }),
  DEEP_INDIGO,
  { level: -0.18, soft: 0.25 },
);

const BELLY = countershade(CREAM, PALE, { level: 0.05, soft: 0.3 });

const WOODBLOCK_EDGE = paint((p, n) => {
  const ridge = Math.sin(p.z * 34 + p.x * 11) * 0.5 + 0.5;
  return n.y < -0.3 ? (ridge > 0.76 ? INK : INDIGO) : ridge > 0.9 ? BLUE : INDIGO;
});

const EYE_TEXTURE = svg(
  `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 64 Q50 20 92 64 Q50 105 8 64Z" fill="#16152b" stroke="#0c1020" stroke-width="5"/>
    <ellipse cx="52" cy="63" rx="25" ry="31" fill="#d49a45" stroke="#19152a" stroke-width="5"/>
    <ellipse cx="54" cy="65" rx="11" ry="25" fill="#19152a"/>
    <circle cx="43" cy="48" r="8" fill="#fff5d0"/>
    <circle cx="65" cy="78" r="4" fill="#fff5d0"/>
    <path d="M13 45 Q50 12 87 44" fill="none" stroke="#19152a" stroke-width="6"/>
  </svg>`,
  { size: 256 },
);

const DREAM_TEXTURE = svg(
  `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
    <path d="M65 108 C55 86 65 77 48 67 C31 56 40 34 59 39
      C60 18 91 18 91 42 C111 39 119 63 101 72
      C111 91 90 104 77 91 C74 108 69 114 65 108Z"
      fill="#9fb2c4" stroke="#19152a" stroke-width="6"/>
    <path d="M55 59 Q68 45 84 55 Q72 65 55 59Z" fill="#e8d4a2"/>
    <circle cx="75" cy="71" r="5" fill="#19152a"/>
    <path d="M66 84 Q77 91 87 82" fill="none" stroke="#19152a" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(1, 10, 7), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function box(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: THREE.Vector3 | [number, number, number],
  scale: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(1, 1, 1), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function woodblockStripe(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3 | [number, number, number],
  bone: any,
  width: number,
  height: number,
  color: any,
) {
  return b.part(new THREE.BoxGeometry(width, height, 0.012), color, {
    at,
    bone,
    dir: [0, 0, 1],
    axis: "z",
    name: "carved-mark",
  });
}

export default function build() {
  const b = createBuilder({ name: "baku", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton first: a low, heavy spirit with a long flexible muzzle.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.83, -0.28],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.83, -0.52],
    [0, 0.87, -0.22],
    [0, 0.9, 0.08],
    [0, 0.98, 0.31],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spineRear", "spineMid", "shoulders"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.98, 0.27],
    [0, 1.08, 0.43],
    [0, 1.23, 0.56],
    [0, 1.31, 0.68],
  ]);

  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neckBase", "neckMid", "neckTip"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.34, 0.69],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.27, 0.73],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const trunkPath = catmull([
    [0, 1.29, 0.78],
    [0, 1.22, 0.93],
    [0, 1.08, 1.06],
    [0, 0.93, 1.15],
    [0, 0.79, 1.22],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: jaw,
    names: ["trunkBase", "trunkMid", "trunkLower", "trunkTip"],
    role: "tentacle",
  });

  const tailPath = catmull([
    [0, 0.86, -0.57],
    [0, 0.82, -0.82],
    [0.02, 0.9, -1.05],
    [0.06, 1.0, -1.2],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: spine.joints[0],
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  const legData = [
    {
      s: 1,
      x: 0.22,
      z: -0.37,
      names: ["hipR", "kneeR", "ankleR", "pawR"],
    },
    {
      s: -1,
      x: -0.22,
      z: -0.37,
      names: ["hipL", "kneeL", "ankleL", "pawL"],
    },
    {
      s: 1,
      x: 0.24,
      z: 0.22,
      names: ["shoulderR", "elbowR", "wristR", "hoofR"],
    },
    {
      s: -1,
      x: -0.24,
      z: 0.22,
      names: ["shoulderL", "elbowL", "wristL", "hoofL"],
    },
  ];

  const legs = legData.map((d, i) => {
    const root: [number, number, number] = [d.x, 0.83, d.z];
    const target: [number, number, number] = [d.x * 1.08, 0.105, d.z + (d.z > 0 ? 0.07 : -0.04)];
    const pts = limb(
      root,
      target,
      [0.27, 0.25, 0.22],
      [
        [d.s * 0.15, 0, 1],
        [d.s * -0.08, 0, -1],
      ],
      { sole: [0, 0, 1] },
    );
    return b.chain(`leg${i}`, pts, {
      parent: d.z > 0 ? spine.tip : spine.joints[0],
      names: d.names,
      role: "leg",
      contact: target,
    });
  });

  // ---------------------------------------------------------------------------
  // Main body, belly, neck and head.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.27 + 0.045 * Math.sin(t * Math.PI), {
    color: COAT,
    sides: 8,
    flat: true,
    name: "heavy-indigo-body",
  });

  b.sweep(spinePath, 0.275, {
    color: BELLY,
    sectors: [[118, 242, BELLY]],
    sides: 8,
    flat: true,
    name: "warm-belly",
  });

  b.sweep(neck, [0.22, 0.18], {
    color: COAT,
    sides: 8,
    flat: true,
    name: "indigo-neck",
  });

  const skull = sphere(b, COAT, [0, 1.34, 0.68], [0.29, 0.31, 0.3], head, "round-spirit-skull");
  const cheek = sphere(b, BELLY, [0, 1.27, 0.81], [0.23, 0.18, 0.18], jaw, "cream-cheeks");

  b.sweep(trunk, (t) => 0.12 - 0.075 * t, {
    color: BELLY,
    sides: 8,
    flat: true,
    caps: { start: "round", end: "round" },
    name: "long-dream-snuffling-trunk",
  });

  // Lower jaw, slightly open for a readable spirit silhouette.
  b.rod([0, 1.19, 0.73], [0, 1.16, 0.96], 0.07, {
    color: INK,
    bone: jaw,
    section: { ngon: 6 },
    name: "open-lower-jaw",
  });
  b.part(new THREE.BoxGeometry(0.18, 0.035, 0.13), PALE, {
    at: [0, 1.2, 0.86],
    bone: jaw,
    name: "lower-jaw-plate",
  });

  // Tiny tusk-like dream teeth: ornamental rather than zoologically literal.
  for (const s of [-1, 1]) {
    b.spike([s * 0.105, 1.235, 0.88], [0, -1, 0.16], 0.075, 0.018, {
      color: PALE,
      bone: jaw,
      name: `dream-tusk-${s}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Legs and paws: blocky, grounded, with ukiyo-e red ankle bands.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, [0.095, 0.065], {
      color: COAT,
      sides: 6,
      flat: true,
      name: `sturdy-leg-${i}`,
    });

    const tip = leg.tip.at;
    sphere(b, INK, tip, [0.105, 0.07, 0.13], leg.tip, `ink-paw-${i}`);
    box(
      b,
      RUST,
      [tip.x, tip.y + 0.105, tip.z],
      [0.105, 0.025, 0.105],
      leg.joints[Math.max(0, leg.joints.length - 2)],
      `vermilion-ankle-band-${i}`,
    );

    for (const toe of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.027, 6, 4), PALE, {
        at: [tip.x + toe * 0.045, 0.07, tip.z + 0.075],
        bone: leg.tip,
        name: `paw-toe-${i}-${toe}`,
      });
    }
  }

  // Tail with a pale brush at the end.
  b.sweep(tail, (t) => 0.075 - 0.045 * t, {
    color: COAT,
    bands: [[0.72, PALE]],
    sides: 7,
    flat: true,
    name: "curling-tail",
  });

  // ---------------------------------------------------------------------------
  // Large tapir ears, fan-like and carved as thick flat woodblock shapes.
  // ---------------------------------------------------------------------------

  const earOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.13, 0.015, "sharp"],
    [0.2, 0.12, "sharp"],
    [0.18, 0.31, "sharp"],
    [0.1, 0.43, "sharp"],
    [0.025, 0.34, "sharp"],
  ];

  for (const s of [-1, 1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.18, 1.48, 0.61],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.012,
      color: COAT,
      bone: head,
      name: `fan-ear-${s}`,
    });

    b.extrude(
      [
        [0.025, 0.04],
        [0.1, 0.055],
        [0.145, 0.13],
        [0.13, 0.28],
        [0.09, 0.34],
        [0.045, 0.27],
      ],
      {
        at: [s * 0.185, 1.49, 0.615],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.052,
        bevel: 0.006,
        color: RUST,
        bone: head,
        name: `rust-ear-inset-${s}`,
      },
    );

    b.part(new THREE.SphereGeometry(0.025, 6, 4), GOLD, {
      at: [s * 0.25, 1.7, 0.615],
      bone: head,
      name: `ear-gold-nail-${s}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Face: decals are settled before crest and mane.
  // ---------------------------------------------------------------------------

  const headSurface = b.surface(skull);
  for (const s of [-1, 1]) {
    const eyeHit = headSurface.around([0, 1.34, 0.68]).at(s * 38, 5);
    if (eyeHit) {
      b.decal(headSurface, EYE_TEXTURE, {
        at: eyeHit,
        size: [0.105, 0.13],
        lift: 0.006,
        mirror: s > 0,
        name: `painted-spirit-eye-${s}`,
      });
    }

    b.part(new THREE.SphereGeometry(0.022, 7, 5), INK, {
      at: [s * 0.11, 1.23, 0.96],
      bone: jaw,
      name: `nostril-${s}`,
    });
  }

  // Nose tip, a broad dark seal.
  sphere(b, INK, [0, 0.77, 1.29], [0.105, 0.075, 0.065], trunk.tip, "black-nose-seal");

  // ---------------------------------------------------------------------------
  // Mane, moon mark, and ukiyo-e carved contour accents.
  // ---------------------------------------------------------------------------

  const manePath = catmull([
    [0, 1.18, 0.36],
    [0, 1.3, 0.18],
    [0, 1.25, -0.05],
    [0, 1.12, -0.32],
    [0, 1.0, -0.52],
  ]);

  const mane = b.sweep(manePath, [0.075, 0.025], {
    color: INK,
    sides: 5,
    flat: true,
    caps: "point",
    name: "ink-black-mane",
  });

  const maneBlue = b.sweep(
    catmull([
      [0, 1.19, 0.28],
      [0, 1.28, 0.08],
      [0, 1.18, -0.15],
      [0, 1.05, -0.4],
    ]),
    [0.035, 0.012],
    {
      color: BLUE,
      sides: 5,
      flat: true,
      caps: "point",
      name: "blue-mane-highlight",
    },
  );

  // Bold circular moon emblem on the shoulder.
  const moon = b.part(new THREE.CircleGeometry(0.105, 12), GOLD, {
    at: [0.285, 1.02, 0.18],
    dir: [1, 0, 0],
    axis: "z",
    bone: spine.tip,
    name: "golden-moon-mark",
  });
  b.part(new THREE.CircleGeometry(0.073, 12), DEEP_INDIGO, {
    at: [0.292, 1.02, 0.18],
    dir: [1, 0, 0],
    axis: "z",
    bone: spine.tip,
    name: "moon-cutout",
  });

  // Woodblock contour bars on haunches and cheeks.
  for (const s of [-1, 1]) {
    woodblockStripe(b, [s * 0.275, 0.92, -0.22], hips, 0.014, 0.27, INK);
    woodblockStripe(b, [s * 0.27, 1.02, -0.05], spine.tip, 0.012, 0.18, RUST);
    woodblockStripe(b, [s * 0.215, 1.32, 0.84], jaw, 0.012, 0.12, RUST);
  }

  // ---------------------------------------------------------------------------
  // Dream wisps: a restrained halo, like smoke curling from a woodblock print.
  // ---------------------------------------------------------------------------

  const wisp1 = b.sweep(
    catmull([
      [0.17, 1.25, 0.4],
      [0.37, 1.45, 0.25],
      [0.43, 1.67, 0.05],
      [0.32, 1.82, -0.1],
    ]),
    [0.026, 0.005],
    { color: CLOUD, sides: 6, flat: true, caps: "point", name: "dream-wisp-right" },
  );

  const wisp2 = b.sweep(
    catmull([
      [-0.18, 1.23, 0.38],
      [-0.36, 1.42, 0.18],
      [-0.4, 1.6, -0.02],
      [-0.28, 1.72, -0.16],
    ]),
    [0.024, 0.005],
    { color: CLOUD, sides: 6, flat: true, caps: "point", name: "dream-wisp-left" },
  );

  b.decal(b.root, DREAM_TEXTURE, {
    at: [0, 1.63, -0.68],
    dir: [0, 0.25, -1],
    up: [0, 1, 0],
    size: [0.24, 0.24],
    lift: 0.002,
    name: "floating-dream-seal",
  });

  // Small gold beads along the mane, an ornamental print-like rhythm.
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const p = manePath.at(t);
    sphere(b, GOLD, [p.x + 0.065, p.y + 0.02, p.z], [0.026, 0.026, 0.026], spine.joints[1], `mane-bead-${i}`);
  }

  // A few broad, angular ink strokes on the body emphasize the carved silhouette.
  for (const z of [-0.42, -0.16, 0.1, 0.34]) {
    b.part(new THREE.BoxGeometry(0.42, 0.012, 0.018), WOODBLOCK_EDGE, {
      at: [0, 1.12, z],
      bone: spine.joints[1],
      rotation: [0, z * 18, 0],
      name: `back-carved-line-${z}`,
    });
  }

  return b.root;
}
```
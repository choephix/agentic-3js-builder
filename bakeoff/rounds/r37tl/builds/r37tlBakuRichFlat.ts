import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  spiral,
  frame,
  rng,
} from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Baku — Dream-Eating Tapir Spirit",
  description:
    "A squat, friendly baku tapir spirit in an ukiyo-e woodblock palette, with bold ink-like bands, curled trunk, leaf ears, tusks, a striped mane, and luminous dream ribbons.",
};

const INK = "#211b2d";
const INDIGO = "#243c67";
const DEEP = "#172744";
const BLUE = "#416b8f";
const CREAM = "#ead8ae";
const PALE = "#f5e8c5";
const RED = "#b64b45";
const OCHRE = "#c88d48";
const GOLD = "#e0b762";
const MOSS = "#526c58";
const DREAM = "#91b8bf";
const NIGHT = "#302b59";

const box = (x: number, y: number, z: number) =>
  new THREE.BoxGeometry(x, y, z);
const sphere = (r: number, w = 10, h = 7) =>
  new THREE.SphereGeometry(r, w, h);
const cyl = (r: number, h: number, n = 8) =>
  new THREE.CylinderGeometry(r, r, h, n);
const cone = (r: number, h: number, n = 7) =>
  new THREE.ConeGeometry(r, h, n);

function oval(
  b: ReturnType<typeof createBuilder>,
  at: any,
  scale: [number, number, number],
  color: string,
  bone?: any,
  name?: string,
) {
  return b.part(sphere(1, 10, 7), color, {
    at,
    bone,
    scale,
    flat: true,
    name,
  });
}

function bead(
  b: ReturnType<typeof createBuilder>,
  at: any,
  r: number,
  color: string,
  bone?: any,
  name?: string,
) {
  return b.part(sphere(r, 7, 5), color, { at, bone, flat: true, name });
}

function tuft(
  b: ReturnType<typeof createBuilder>,
  base: any,
  tip: any,
  color: string,
  radius = 0.035,
  bone?: any,
) {
  return b.spike(base, tip, null, radius, {
    color,
    bone,
    caps: "point",
    section: { ngon: 5 },
  });
}

function inkStripe(
  b: ReturnType<typeof createBuilder>,
  at: any,
  scale: [number, number, number],
  bone?: any,
) {
  return oval(b, at, scale, INK, bone, "woodblock-contour");
}

export default function build() {
  const b = createBuilder({ name: "baku-dream-eater", detail: 1 });

  // ---------------------------------------------------------------------------
  // Skeleton: one readable root, a broad spine, four sturdy legs, neck, jaw,
  // curling tail, and a small articulated trunk.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 0.72, -0.28],
    dir: [0, 0.02, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.72, -0.28],
    [0, 0.82, 0.02],
    [0, 0.89, 0.32],
    [0, 0.96, 0.57],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 0.96, 0.57],
    [0, 1.08, 0.70],
    [0, 1.25, 0.77],
    [0, 1.38, 0.79],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.42, 0.80],
    dir: [0, -0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.31, 0.92],
    dir: [0, -0.24, 1],
    role: "jaw",
    group: "head",
  });

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 1.34, 1.00],
      [0, 1.27, 1.16],
      [0, 1.17, 1.27],
      [0, 1.08, 1.24],
      [0, 1.04, 1.14],
    ]),
    {
      parent: jaw,
      names: ["trunk1", "trunk2", "trunk3", "trunkTip"],
      role: "tentacle",
    },
  );

  const legTargets = [
    { s: 1, z: 0.25, name: "legFL", knee: "kneeFL", foot: "footFL" },
    { s: -1, z: 0.25, name: "legFR", knee: "kneeFR", foot: "footFR" },
    { s: 1, z: -0.42, name: "legHL", knee: "kneeHL", foot: "footHL" },
    { s: -1, z: -0.42, name: "legHR", knee: "kneeHR", foot: "footHR" },
  ] as const;

  const legs: any[] = [];
  for (const leg of legTargets) {
    const x = leg.s * 0.27;
    const root = [x, 0.72, leg.z] as [number, number, number];
    const knee = [leg.s * 0.30, 0.42, leg.z + (leg.z > 0 ? 0.08 : -0.04)] as [
      number,
      number,
      number,
    ];
    const ankle = [leg.s * 0.25, 0.17, leg.z + 0.01] as [number, number, number];
    const foot = [leg.s * 0.25, 0.105, leg.z + 0.10] as [number, number, number];
    const ch = b.chain(
      leg.name,
      [root, knee, ankle, foot],
      {
        parent: hips,
        names: [leg.name, leg.knee, leg.foot],
        role: "leg",
        contact: foot,
      },
    );
    legs.push({ ...leg, ch, root, knee, ankle, foot });
  }

  const tailPath = bezier(
    [0, 0.73, -0.61],
    [0, 0.62, -0.86],
    [0, 0.73, -1.00],
    [0.04, 0.86, -1.10],
  );
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });

  // ---------------------------------------------------------------------------
  // Main body: low-poly, broad and rounded, with a cream belly and graphic
  // indigo woodblock contour bands.
  // ---------------------------------------------------------------------------

  const body = b.sweep(spine, (t) => 0.29 + 0.04 * Math.sin(t * Math.PI), {
    color: INDIGO,
    section: { ngon: 8 },
    sides: 8,
    sectors: [
      [118, 242, CREAM],
      [-48, 48, BLUE],
    ],
    name: "broad-indigo-body",
  });

  b.sweep(neck, [0.22, 0.18], {
    color: INDIGO,
    section: { ngon: 7 },
    sectors: [[118, 242, CREAM]],
    name: "short-neck",
  });

  b.sweep(tail, [0.13, 0.025], {
    color: DEEP,
    section: { ngon: 7 },
    caps: "point",
    name: "tapered-tail",
  });

  // Belly bib, rump patch, and graphic contour marks.
  oval(b, [0, 0.69, 0.22], [0.235, 0.20, 0.22], CREAM, spine.joints[1], "cream-belly");
  oval(b, [0, 0.81, -0.48], [0.255, 0.22, 0.22], BLUE, spine.joints[0], "blue-rump-patch");

  for (const z of [-0.48, -0.32, -0.16, 0.02, 0.20]) {
    b.sweep(
      polyline([
        [-0.245, 0.86, z],
        [0.245, 0.86, z],
      ]),
      0.009,
      { color: INK, caps: "round", name: "woodblock-body-line" },
    );
  }

  // Small stylized shoulder plates / ink contours.
  for (const s of [-1, 1]) {
    oval(b, [s * 0.235, 0.92, 0.42], [0.035, 0.16, 0.16], INK, spine.joints[2], "shoulder-ink");
    oval(b, [s * 0.265, 0.72, -0.39], [0.025, 0.13, 0.20], RED, hips, "hip-red-mark");
  }

  // ---------------------------------------------------------------------------
  // Legs and feet: stout tapir legs, dark cuffs, cream ankle wraps, four-toed
  // blocky feet.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    b.sweep(leg.ch, [0.105, 0.085, 0.065], {
      color: DEEP,
      section: { ngon: 6 },
      skin: "smooth",
      name: `${leg.name}-dark-leg`,
    });

    const side = leg.s;
    const ankle = leg.ch.at(0.70);
    b.stick(cyl(0.105, 0.035, 8), RED, ankle, {
      embed: 0.35,
      spin: side * 12,
      name: `${leg.name}-red-cuff`,
    });

    const footFrame = leg.ch.at(0.98);
    b.stick(box(0.16, 0.105, 0.24), CREAM, footFrame, {
      embed: 0.32,
      scale: [1, 0.78, 1],
      name: `${leg.name}-cream-foot`,
    });

    for (const toe of [-1, 0, 1]) {
      const p = [
        side * (0.25 + toe * 0.045),
        0.075,
        leg.z + 0.205,
      ] as [number, number, number];
      b.part(sphere(0.035, 6, 4), INK, {
        at: p,
        bone: leg.ch.tip,
        scale: [1, 0.55, 1.35],
        name: `${leg.name}-toe`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Head: oversized friendly tapir head, white blaze, long muzzle, expressive
  // eyes, broad ears and two tiny tusks.
  // ---------------------------------------------------------------------------

  oval(b, [0, 1.38, 0.78], [0.34, 0.33, 0.35], INDIGO, head, "large-tapir-head");
  oval(b, [0, 1.39, 1.00], [0.255, 0.22, 0.28], CREAM, head, "face-blaze");
  oval(b, [0, 1.30, 1.15], [0.20, 0.18, 0.25], PALE, jaw, "lower-muzzle");
  oval(b, [0, 1.20, 1.30], [0.135, 0.12, 0.17], DEEP, trunk.tip, "soft-nose");
  oval(b, [0, 1.18, 1.36], [0.085, 0.055, 0.04], INK, trunk.tip, "nostril-shadow");

  // Mouth as a separate dark line and lower jaw, visibly hinged.
  b.sweep(
    bezier(
      [-0.18, 1.29, 1.19],
      [-0.08, 1.26, 1.27],
      [0.08, 1.26, 1.27],
      [0.18, 1.29, 1.19],
    ),
    0.012,
    { color: INK, bone: jaw, name: "smiling-mouth-line" },
  );
  b.part(box(0.27, 0.045, 0.15), RED, {
    at: [0, 1.255, 1.19],
    bone: jaw,
    name: "open-jaw-inner",
  });

  // Eyes: ink sockets, pale whites, dark pupils, gold highlights.
  for (const s of [-1, 1]) {
    const eyeAt = [s * 0.145, 1.49, 1.015] as [number, number, number];
    oval(b, eyeAt, [0.082, 0.095, 0.035], INK, head, "eye-ink-socket");
    oval(b, [s * 0.145, 1.49, 1.046], [0.060, 0.068, 0.018], PALE, head, "eye-white");
    bead(b, [s * 0.145, 1.49, 1.067], 0.034, INK, head, "round-pupil");
    bead(b, [s * 0.132, 1.515, 1.091], 0.010, GOLD, head, "eye-glint");
    b.sweep(
      polyline([
        [s * 0.205, 1.555, 1.055],
        [s * 0.16, 1.58, 1.07],
        [s * 0.08, 1.59, 1.06],
      ]),
      0.012,
      { color: INK, bone: head, caps: "round", name: "heavy-eyebrow" },
    );
  }

  // Broad leaf-like ears, made as thick woodblock silhouettes.
  const earOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.15, 0.04, "sharp"],
    [0.23, 0.25, "sharp"],
    [0.16, 0.48, "sharp"],
    [0.035, 0.36, "sharp"],
  ];
  for (const s of [-1, 1]) {
    const ear = b.extrude(earOutline, {
      at: [s * 0.25, 1.60, 0.77],
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: [0.045, 0.025],
      bevel: 0.008,
      color: DEEP,
      bone: head,
      name: "leaf-ear",
    });
    b.part(
      new THREE.ConeGeometry(0.035, 0.16, 5),
      RED,
      {
        at: ear.local([s * 0.12, 0.26, 0.028]),
        bone: head,
        dir: [0, 1, 0],
        name: "ear-inner-red",
      },
    );
  }

  // White blaze stripes and little cheek whisker marks.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y = 1.26 + i * 0.055;
      b.sweep(
        polyline([
          [s * 0.19, y, 1.075],
          [s * 0.27, y + 0.018, 1.055],
        ]),
        0.006,
        { color: INK, bone: head, caps: "round", name: "cheek-engraving" },
      );
    }
  }

  // Tiny ivory tusks tucked beside the trunk.
  for (const s of [-1, 1]) {
    b.spike(
      [s * 0.155, 1.25, 1.16],
      [s * 0.18, 1.15, 1.22],
      null,
      0.030,
      { color: PALE, bone: jaw, caps: "point", name: "small-tusk" },
    );
  }

  // ---------------------------------------------------------------------------
  // Mane: a graphic saw-toothed indigo/ochre crest from skull down the neck.
  // ---------------------------------------------------------------------------

  const manePath = catmull([
    [0, 1.62, 0.62],
    [0, 1.54, 0.49],
    [0, 1.41, 0.37],
    [0, 1.27, 0.23],
    [0, 1.10, 0.08],
  ]);
  const mane = b.sweep(manePath, [0.065, 0.018], {
    color: INK,
    caps: "point",
    bone: [head, ...neck.joints, spine.tip],
    name: "ink-black-mane",
  });
  b.along(mane, 8, (p: any) => {
    const lift = 0.025;
    const base = p.at;
    const tip = p.moved([0, lift + 0.09, 0.02]);
    tuft(b, base, tip, OCHRE, 0.028, p.bone);
  });

  // Additional ochre mane blades make the silhouette readable from the side.
  for (let i = 0; i < 7; i++) {
    const z = 0.56 - i * 0.075;
    const y = 1.52 - i * 0.075;
    tuft(
      b,
      [0, y, z],
      [0, y + 0.13, z - 0.045],
      i % 2 ? OCHRE : RED,
      0.032,
      neck.joints[Math.min(2, Math.floor(i / 3))],
    );
  }

  // ---------------------------------------------------------------------------
  // Dream-eating spirit details: a bronze forehead medallion, dream beads,
  // and three curling ribbons that rise behind the head like printed smoke.
  // ---------------------------------------------------------------------------

  const medallion = b.part(cyl(0.075, 0.018, 10), GOLD, {
    at: [0, 1.59, 1.035],
    bone: head,
    dir: [0, 0, 1],
    name: "dream-medallion",
  });
  b.part(cyl(0.045, 0.020, 8), RED, {
    at: [0, 1.59, 1.051],
    bone: head,
    dir: [0, 0, 1],
    name: "medallion-red-center",
  });
  b.part(
    new THREE.TorusGeometry(0.032, 0.006, 5, 10),
    INK,
    {
      at: [0, 1.59, 1.064],
      bone: head,
      dir: [0, 0, 1],
      name: "medallion-ring",
    },
  );

  const dreamPearl = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 3 C48 16 58 28 49 43 C42 55 21 58 12 43 C4 30 17 13 32 3Z" fill="#dcefe1" stroke="#211b2d" stroke-width="4"/>
      <path d="M20 36 C27 26 38 24 45 17" fill="none" stroke="#91b8bf" stroke-width="5"/>
      <circle cx="37" cy="18" r="5" fill="#fff5ca"/>
    </svg>`,
    { size: 128 },
  );

  const dreamRoots = [
    [0.27, 1.08, 0.28],
    [-0.28, 1.10, 0.32],
    [0.22, 1.24, 0.58],
  ] as const;
  const dreamEnds = [
    [0.52, 1.52, 0.20],
    [-0.52, 1.62, 0.28],
    [0.45, 1.82, 0.52],
  ] as const;

  for (let i = 0; i < dreamRoots.length; i++) {
    const s = i === 1 ? -1 : 1;
    const root = dreamRoots[i];
    const end = dreamEnds[i];
    const curve = bezier(
      root,
      [s * 0.40, 1.22 + i * 0.05, 0.10],
      [s * 0.18, 1.72 + i * 0.08, 0.06],
      end,
    );
    b.sweep(curve, [0.018, 0.006], {
      color: DREAM,
      caps: "round",
      name: "dream-ribbon",
    });
    const p = curve.at(0.72);
    b.part(new THREE.SphereGeometry(0.050, 8, 6), PALE, {
      at: p,
      texture: dreamPearl,
      name: "dream-pearl",
    });
    b.part(new THREE.SphereGeometry(0.020, 6, 4), RED, {
      at: curve.at(0.34),
      name: "dream-ribbon-knot",
    });
  }

  // A small spirit flame above the medallion, kept low enough to remain part of
  // the baku silhouette rather than becoming scenery.
  const flame = b.extrude(
    [
      [0, 0, "sharp"],
      [0.07, 0.02, "sharp"],
      [0.10, 0.13, "sharp"],
      [0.04, 0.25, "sharp"],
      [0, 0.38, "sharp"],
      [-0.045, 0.24, "sharp"],
      [-0.10, 0.12, "sharp"],
      [-0.07, 0.02, "sharp"],
    ],
    {
      at: [0, 1.66, 0.84],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.004,
      color: RED,
      bone: head,
      name: "spirit-flame",
    },
  );
  b.part(new THREE.ConeGeometry(0.025, 0.11, 5), GOLD, {
    at: flame.local([0, 0.16, 0.025]),
    bone: head,
    name: "flame-gold-core",
  });

  // Ukiyo-e style repeated pale registration marks on the rump.
  for (let i = 0; i < 5; i++) {
    const z = -0.54 + i * 0.095;
    b.part(new THREE.TorusGeometry(0.028, 0.006, 4, 8), PALE, {
      at: [0.20, 0.87, z],
      bone: hips,
      rotation: [Math.PI / 2, 0, 0],
      name: "rump-print-mark",
    });
  }

  // A few dark contour dashes under the body reinforce the carved-print look.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      b.part(box(0.018, 0.018, 0.09), INK, {
        at: [s * 0.30, 0.53, -0.42 + i * 0.20],
        bone: hips,
        rotation: [0, s * 0.22, 0],
        name: "underbelly-carved-dash",
      });
    }
  }

  return b.root;
}

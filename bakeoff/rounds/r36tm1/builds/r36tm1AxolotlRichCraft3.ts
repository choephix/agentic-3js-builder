import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  limb,
  rng,
  svg,
  paint,
} from "../../../../src/index";
import {
  cel,
  furEdge,
  animeEye,
  INK,
} from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chibi Axolotl",
  description:
    "A low-poly chibi axolotl with a blushing peach body, huge sparkling eyes, tiny feet, broad tail, and six flamboyant frilly pink external gills.",
};

const BODY = cel("#f28f9d", "#bd536f");
const BODY_EDGE = furEdge(BODY, "#ffd4c5", {
  level: -0.18,
  teeth: 0.18,
  period: 0.075,
  along: [0, 0, 1],
  ink: "#7d355d",
  inkWidth: 0.035,
});
const PALE = cel("#ffe4d2", "#eaa4a5");
const DEEP_PINK = cel("#ee5b91", "#a92e68");
const GILL = cel("#ff78ad", "#d63c7d");
const GILL_LIGHT = cel("#ffb5c9", "#ed6796");
const FOOT = cel("#e87b96", "#a94368");
const DARK = "#371b42";
const MOUTH = "#6b234c";
const WHITE = "#fff9f0";
const SPOT = "#d85278";

const eyeTexture = animeEye({
  iris: "#55d9c9",
  irisLight: "#b8fff0",
  irisDark: "#218b9f",
  blush: "#ff94ad",
  size: 512,
});

const gillTexture = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <path d="M32 126 C27 105 30 87 22 73 C15 61 4 55 7 48
             C17 51 27 58 33 69 C31 52 20 38 25 32
             C35 40 40 52 42 65 C46 48 43 29 50 22
             C56 39 52 59 47 74 C44 91 45 108 40 126Z"
          fill="#ff9fbe" stroke="#c83d72" stroke-width="3"
          stroke-linejoin="round"/>
    <path d="M34 119 C31 94 36 75 31 57 M40 116 C39 88 47 67 49 45"
          fill="none" stroke="#ffd2dc" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

function sphere(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: any,
  scale: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.SphereGeometry(1, 12, 8), color, {
    at,
    bone,
    scale,
    name,
    flat: true,
  });
}

function lowBox(
  b: ReturnType<typeof createBuilder>,
  color: any,
  at: any,
  scale: [number, number, number],
  bone?: any,
  name?: string,
) {
  return b.part(new THREE.BoxGeometry(1, 1, 1), color, {
    at,
    bone,
    scale,
    name,
    flat: true,
  });
}

function makeGill(
  b: ReturnType<typeof createBuilder>,
  head: any,
  side: number,
  index: number,
  baseY: number,
  tipY: number,
  back: number,
) {
  const x0 = side * 0.235;
  const x1 = side * (0.40 + index * 0.018);
  const z0 = 0.34 - index * 0.025;
  const z1 = back - index * 0.035;

  const mainPath = catmull([
    [x0, baseY, z0],
    [side * 0.29, baseY + (tipY - baseY) * 0.28, z0 - 0.015],
    [x1, tipY, z1],
  ]);

  const names = [`gill${side > 0 ? "L" : "R"}${index}Base`, `gill${side > 0 ? "L" : "R"}${index}Mid`, `gill${side > 0 ? "L" : "R"}${index}Tip`];
  const chain = b.chain(`gill${side > 0 ? "L" : "R"}${index}`, mainPath, {
    parent: head,
    names,
    role: "fan",
    count: 3,
  });

  const tube = b.sweep(chain, [0.029, 0.022, 0.008], {
    color: GILL,
    caps: "round",
    sides: 7,
    name: `gillStem${side > 0 ? "L" : "R"}${index}`,
  });

  // Three long, slightly separated fronds make each gill read as a soft fan.
  for (let f = 0; f < 3; f++) {
    const spread = (f - 1) * 0.045;
    const root = [side * (0.275 + f * 0.008), baseY + f * 0.012, z0 - f * 0.01] as [number, number, number];
    const tip = [
      side * (0.43 + index * 0.018 + Math.abs(spread) * 0.45),
      tipY + spread * 0.9,
      z1 - 0.06 + spread * 0.7,
    ] as [number, number, number];

    const frond = bezier(
      root,
      [
        side * (0.33 + index * 0.018),
        baseY + (tipY - baseY) * 0.34 + spread,
        z0 - 0.035,
      ],
      [
        side * (0.39 + index * 0.02),
        tipY - 0.045 + spread * 0.5,
        z1 - 0.04,
      ],
      tip,
    );

    b.sweep(frond, [0.014, 0.006], {
      bone: chain.joints[0],
      color: f === 1 ? GILL_LIGHT : GILL,
      caps: "round",
      sides: 6,
      name: `gillFrill${side > 0 ? "L" : "R"}${index}_${f}`,
    });

    // Tiny bead-like filaments emphasize the feathery edge without making it smooth.
    for (let q = 1; q <= 3; q++) {
      const t = q / 4;
      const p = frond.at(t);
      b.spike(
        p,
        [side * 0.6, 0.42 + 0.12 * f, -0.2 - 0.1 * q],
        0.045 + 0.008 * (3 - q),
        0.005,
        {
          color: GILL_LIGHT,
          name: `gillBarb${side > 0 ? "L" : "R"}${index}_${f}_${q}`,
        },
      );
    }
  }

  // A translucent-looking illustrated blade sits behind the rods and creates a bold silhouette.
  const cardFrames = [
    chain.at(0.42),
    chain.at(0.62),
    chain.at(0.80),
  ];
  b.cards(cardFrames, gillTexture, {
    size: [0.09, 0.17],
    lean: 38,
    bend: 18,
    flow: [side * 0.7, 0.25, -0.45],
    mirror: side < 0,
    color: GILL_LIGHT,
    sink: 0.18,
    name: `gillBlade${side > 0 ? "L" : "R"}${index}`,
  });

  return tube;
}

export default function build() {
  const b = createBuilder({
    name: "chibi-axolotl",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------
  // Skeleton first: a compact central spine, a head hinge, tail, four legs, and
  // six articulated gill fans.
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", {
    at: [0, 0.39, -0.25],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.39, -0.58],
      [0, 0.43, -0.26],
      [0, 0.47, 0.05],
      [0, 0.51, 0.30],
    ]),
    {
      parent: hips,
      names: ["spineBack", "spineMid", "shoulders", "neckBase"],
      role: "spine",
      count: 4,
    },
  );

  const head = b.joint("head", {
    parent: spine.tip,
    at: [0, 0.54, 0.39],
    dir: [0, 0.02, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.47, 0.63],
    dir: [0, -0.18, 1],
    role: "jaw",
    group: "head",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.38, -0.52],
      [0, 0.34, -0.82],
      [0, 0.28, -1.12],
      [0, 0.20, -1.39],
      [0, 0.12, -1.57],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      count: 5,
    },
  );

  const legChains: any[] = [];
  const legSpecs = [
    { side: 1, z: 0.10, label: "LFront", target: [0.31, 0.105, 0.20] },
    { side: -1, z: 0.10, label: "RFront", target: [-0.31, 0.105, 0.20] },
    { side: 1, z: -0.34, label: "LHind", target: [0.33, 0.105, -0.39] },
    { side: -1, z: -0.34, label: "RHind", target: [-0.33, 0.105, -0.39] },
  ];

  for (const spec of legSpecs) {
    const root = [spec.side * 0.18, 0.38, spec.z] as [number, number, number];
    const pts = limb(
      root,
      spec.target as [number, number, number],
      [0.17, 0.14, 0.11],
      [[spec.side * 0.3, 0, 1], [spec.side * 0.2, 0, -1]],
      { sole: [0, 1, 0] },
    );
    const chain = b.chain(`leg${spec.label}`, pts, {
      parent: hips,
      names: [`hip${spec.label}`, `knee${spec.label}`, `ankle${spec.label}`, `foot${spec.label}`],
      role: "leg",
      count: 4,
      contact: spec.target as [number, number, number],
    });
    legChains.push({ chain, spec });
  }

  // Gill roots are joints too, so a future rig can flap whole fans.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      b.joint(`gill${side > 0 ? "L" : "R"}Root${i}`, {
        parent: head,
        at: [side * 0.22, 0.62 - i * 0.045, 0.30 - i * 0.045],
        dir: [side, 0.15, -0.3],
        role: "fan",
        group: "gills",
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Body and tail: broad, low, and slightly flattened like a plush aquatic larva.
  // ---------------------------------------------------------------------------
  b.sweep(spine, (t) => 0.255 - t * 0.035, {
    bone: spine,
    color: BODY_EDGE,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    name: "softBody",
  });

  b.sweep(tail, (t) => 0.17 * (1 - t) + 0.012, {
    bone: tail,
    color: BODY_EDGE,
    section: { ngon: 6 },
    caps: { start: "round", end: "point" },
    name: "taperedTail",
  });

  // A wide, almost triangular tail fin gives the silhouette a salamander identity.
  b.membrane(
    catmull([
      [0, 0.43, -0.48],
      [0, 0.48, -0.82],
      [0, 0.45, -1.20],
      [0, 0.32, -1.53],
    ]),
    catmull([
      [0, 0.29, -0.48],
      [0, 0.22, -0.82],
      [0, 0.14, -1.20],
      [0, 0.12, -1.53],
    ]),
    {
      color: PALE,
      thickness: 0.012,
      rows: 5,
      cols: 10,
      scallop: 0.12,
      bone: tail,
      name: "tailFin",
    },
  );

  // ---------------------------------------------------------------------------
  // Four chubby legs and broad little webbed toes.
  // ---------------------------------------------------------------------------
  for (const { chain, spec } of legChains) {
    b.sweep(chain, [0.075, 0.06, 0.045], {
      bone: chain,
      color: BODY,
      section: { ngon: 6 },
      caps: "round",
      name: `legTube${spec.label}`,
    });

    const foot = chain.tip;
    sphere(b, FOOT, foot.at, [0.085, 0.055, 0.11], foot, `paw${spec.label}`);

    for (let t = -1; t <= 1; t++) {
      const toeRoot = [spec.side * (0.31 + t * 0.025), 0.105, spec.z + t * 0.035] as [
        number,
        number,
        number,
      ];
      const toeTip = [
        toeRoot[0] + spec.side * 0.075,
        0.078,
        toeRoot[2] + (spec.z > 0 ? 0.045 : -0.03) + t * 0.012,
      ] as [number, number, number];
      b.sweep(polyline([toeRoot, toeTip]), [0.018, 0.004], {
        bone: foot,
        color: FOOT,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `toe${spec.label}${t + 1}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Oversized head, cheeks, muzzle, and an open readable mouth.
  // ---------------------------------------------------------------------------
  const skull = sphere(
    b,
    BODY_EDGE,
    [0, 0.59, 0.43],
    [0.34, 0.31, 0.31],
    head,
    "roundHead",
  );

  sphere(b, PALE, [0, 0.53, 0.67], [0.215, 0.135, 0.125], head, "creamMuzzle");

  // Plump cheek puffs make the face distinctly chibi.
  for (const side of [1, -1]) {
    sphere(
      b,
      PALE,
      [side * 0.215, 0.55, 0.56],
      [0.115, 0.12, 0.13],
      head,
      `cheek${side > 0 ? "L" : "R"}`,
    );
  }

  // Big anime eyes are decals, seated on the actual skull surface.
  for (const side of [1, -1]) {
    const eyeAt = [side * 0.135, 0.66, 0.685] as [number, number, number];
    const eye = b.decal(skull, eyeTexture, {
      at: eyeAt,
      dir: [0, 0.08, 1],
      up: [0, 1, 0],
      size: [0.145, 0.195],
      lift: 0.004,
      mirror: side > 0,
      segments: 8,
      name: `sparkleEye${side > 0 ? "L" : "R"}`,
      group: "face",
    });
    glow(eye, 1.1);
  }

  // Tiny nostrils are dark, raised beads above the mouth.
  for (const side of [1, -1]) {
    sphere(
      b,
      DARK,
      [side * 0.052, 0.595, 0.762],
      [0.018, 0.012, 0.009],
      head,
      `nostril${side > 0 ? "L" : "R"}`,
    );
  }

  // Upper lip and visibly separate lower jaw.
  b.sweep(
    bezier(
      [-0.105, 0.535, 0.755],
      [-0.04, 0.515, 0.735],
      [0.04, 0.515, 0.735],
      [0.105, 0.535, 0.755],
    ),
    0.012,
    { bone: head, color: MOUTH, caps: "round", sides: 6, name: "upperMouthLine" },
  );

  lowBox(b, MOUTH, [0, 0.465, 0.705], [0.20, 0.035, 0.10], jaw, "openLowerMouth");
  sphere(b, PALE, [0, 0.435, 0.745], [0.19, 0.045, 0.075], jaw, "lowerLip");

  // A few rosy freckles break up the pale cheeks.
  for (const side of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      sphere(
        b,
        SPOT,
        [side * (0.18 + i * 0.025), 0.52 + (i % 2) * 0.027, 0.675 - i * 0.012],
        [0.009, 0.006, 0.004],
        head,
        `freckle${side > 0 ? "L" : "R"}${i}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Six extravagant external gill fans, three per side.
  // ---------------------------------------------------------------------------
  for (const side of [1, -1]) {
    makeGill(b, head, side, 0, 0.69, 0.82, 0.29);
    makeGill(b, head, side, 1, 0.64, 0.69, 0.25);
    makeGill(b, head, side, 2, 0.59, 0.54, 0.21);
  }

  // Small dorsal and cheek highlights: simple stylized surface marks.
  b.sweep(
    catmull([
      [-0.11, 0.65, 0.39],
      [0, 0.70, 0.34],
      [0.11, 0.65, 0.39],
    ]),
    0.012,
    { bone: head, color: GILL_LIGHT, caps: "round", sides: 6, name: "headCrownHighlight" },
  );

  // Keep all components comfortably above the floor; the lowest paw toes are at ~0.074 m.
  b.root.userData.subject = "axolotl";
  b.root.userData.style = "chibi";
  return b.root;
}

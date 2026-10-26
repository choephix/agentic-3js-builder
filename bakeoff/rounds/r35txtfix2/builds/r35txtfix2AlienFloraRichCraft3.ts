import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  frame,
  mottle,
  noise,
  paint,
  polyline,
  rng,
  spots,
  stripes,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";
import { svg } from "../../../../src/index";

export const meta = {
  name: "bioluminescent-alien-plant",
  description:
    "A stylized Avatar-inspired alien plant with a faceted living trunk, neon veins, luminous flowers, tendrils, alien glyphs, roots, and broad bioluminescent leaves.",
};

const INK = "#160f2b";
const CYAN = "#5ffff0";
const BLUE = "#38bfff";
const PINK = "#ff55d9";
const VIOLET = "#b15cff";
const LIME = "#baff68";
const PALE = "#eaffda";
const DEEP = "#061727";

const STEM_PATTERN = stripes(
  spots("#164b59", ["#1a7b79", "#245d84", "#372e68"], {
    size: 0.18,
    amount: 0.62,
    rosette: true,
    seed: 14,
  }),
  ["#237f82", "#493c89"],
  {
    size: 0.34,
    axis: "y",
    width: 0.16,
    wobble: 0.22,
    seed: 18,
  },
);

const STEM = cel(
  countershade(STEM_PATTERN, "#071d31", {
    level: -0.12,
    soft: 0.3,
  }),
  "#061a2b",
  { threshold: 0.04 },
);

const ROOT = cel(
  mottle("#173f4b", "#0a2238", {
    size: 0.2,
    contrast: 1.25,
    seed: 22,
  }),
  "#061728",
  { threshold: 0.03 },
);

const LEAF_FIELD = paint((p, n) => {
  const cloud = noise(p, 0.17, 31);
  const current = Math.sin(p.z * 30 + p.x * 13 + cloud * 3.0);
  if (n.y < -0.25) return "#10374e";
  if (current > 0.62 && n.y > 0.1) return "#47cdb0";
  if (cloud > 0.64) return "#277d88";
  if (cloud < 0.3) return "#153e61";
  return "#1c6476";
});

const LEAF = cel(LEAF_FIELD, "#08253e", {
  threshold: 0.08,
});

const POD = cel(
  mottle("#73349b", "#3b205f", {
    size: 0.09,
    contrast: 1.4,
    seed: 37,
  }),
  "#25163f",
  { threshold: 0.06 },
);

const POD_EDGE = cel("#cb50b7", "#5d236f", {
  threshold: 0.05,
});

const PETAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 128">
    <defs>
      <linearGradient id="petal" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#ff4fd1"/>
        <stop offset="0.42" stop-color="#a455dc"/>
        <stop offset="0.78" stop-color="#36d8e8"/>
        <stop offset="1" stop-color="#b9fff1"/>
      </linearGradient>
      <linearGradient id="edge" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#ff83df"/>
        <stop offset="1" stop-color="#74fff2"/>
      </linearGradient>
    </defs>
    <path d="M32 126 C13 112 5 82 10 52 C14 28 25 9 32 2 C39 9 50 28 54 52 C59 82 51 112 32 126Z"
      fill="url(#petal)" stroke="#d6fff4" stroke-width="2"/>
    <path d="M32 119 C30 88 31 49 32 12" stroke="url(#edge)" stroke-width="3.5" fill="none"/>
    <path d="M29 87 C20 72 17 61 15 48 M35 88 C44 72 47 61 49 48"
      stroke="#70fff1" stroke-width="1.6" fill="none" opacity=".9"/>
    <circle cx="32" cy="23" r="4" fill="#ffffff" opacity=".9"/>
  </svg>`,
  { size: 256 },
);

const LEAF_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M64 119 C61 88 63 52 64 13" stroke="#6affec" stroke-width="5" fill="none"/>
    <path d="M62 79 C42 71 29 59 18 41 M65 91 C86 78 101 63 111 44"
      stroke="#47c7ff" stroke-width="3" fill="none"/>
    <path d="M62 62 C47 55 37 47 30 35 M66 70 C80 61 90 51 98 37"
      stroke="#ff73e0" stroke-width="2.4" fill="none"/>
    <circle cx="64" cy="13" r="5" fill="#eaffda"/>
  </svg>`,
  { size: 256 },
);

const SPECK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M16 1 L18.3 13.7 L31 16 L18.3 18.3 L16 31 L13.7 18.3 L1 16 L13.7 13.7Z"
      fill="#66fff1"/>
    <circle cx="16" cy="16" r="3.2" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const GLYPH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 160">
    <path d="M48 151 C17 132 20 110 43 100 C67 90 77 72 60 57 C44 42 25 52 27 71
      C29 88 48 95 59 84 C70 73 66 55 50 48 C31 40 25 22 44 9"
      fill="none" stroke="#6affed" stroke-width="5" stroke-linecap="round"/>
    <path d="M26 123 L9 112 M70 103 L88 91 M33 40 L11 29 M63 61 L87 50"
      stroke="#ff5bd7" stroke-width="3" stroke-linecap="round"/>
    <circle cx="44" cy="9" r="5" fill="#ffffff"/>
    <circle cx="48" cy="151" r="4" fill="#baff68"/>
  </svg>`,
  { size: 256 },
);

const RUNE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 192">
    <defs>
      <radialGradient id="r" cx=".5" cy=".4" r=".7">
        <stop offset="0" stop-color="#eaffff"/>
        <stop offset=".25" stop-color="#55fff0"/>
        <stop offset=".55" stop-color="#5775e8"/>
        <stop offset="1" stop-color="#25184c"/>
      </radialGradient>
    </defs>
    <ellipse cx="64" cy="96" rx="56" ry="84" fill="#160f2b" stroke="#65fff0" stroke-width="4"/>
    <ellipse cx="64" cy="96" rx="45" ry="72" fill="url(#r)" opacity=".92"/>
    <path d="M64 157 C57 136 60 116 77 101 C91 88 88 68 71 60 C53 51 39 65 42 82
      C45 97 61 104 72 94 C80 87 79 74 70 68"
      fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    <path d="M43 42 L64 25 L85 42 M34 112 L18 124 M94 112 L110 124"
      fill="none" stroke="#ff6cdb" stroke-width="4" stroke-linecap="round"/>
    <circle cx="64" cy="25" r="5" fill="#baff68"/>
    <circle cx="42" cy="82" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({
    name: "bioluminescent-alien-plant",
    detail: 1,
    paintSize: 2048,
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton. The plant has a single rooted spine, fan-like branch chains, and separate neutral tendrils.

  const rootJoint = b.joint("root", {
    at: [0, 0, 0],
    role: "spine",
    group: "plant",
  });

  const trunkPath = catmull([
    [0, 0.16, 0],
    [0, 0.46, -0.015],
    [0, 0.88, 0.015],
    [0, 1.28, 0.035],
    [0, 1.67, 0.075],
    [0, 2.02, 0.14],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: rootJoint,
    names: [
      "trunkBase",
      "trunkLow",
      "trunkMid",
      "trunkHigh",
      "trunkCrown",
      "trunkTip",
    ],
    role: "spine",
    group: "plant",
  });

  const rayDirections = [
    [1, 0, 0.15],
    [0.55, 0, 0.88],
    [-0.55, 0, 0.88],
    [-1, 0, 0.15],
    [-0.72, 0, -0.72],
    [0.72, 0, -0.72],
  ] as const;

  const rootChains: any[] = [];
  for (let i = 0; i < rayDirections.length; i++) {
    const d = new THREE.Vector3(...rayDirections[i]).normalize();
    rootChains.push(
      b.chain(
        `rootRay${i + 1}`,
        catmull([
          [0, 0.11, 0],
          [d.x * 0.3, 0.07, d.z * 0.3],
          [d.x * 0.68, 0.038, d.z * 0.68],
        ]),
        {
          parent: rootJoint,
          names: [`rootRay${i + 1}Base`, `rootRay${i + 1}Mid`, `rootRay${i + 1}Tip`],
          role: "tentacle",
          group: "roots",
        },
      ),
    );
  }

  function makeFanBranch(
    name: string,
    start: any,
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    tip: THREE.Vector3,
    parent: any,
  ) {
    return b.chain(
      name,
      catmull([start, p1, p2, tip]),
      {
        parent,
        names: [`${name}Base`, `${name}Mid`, `${name}Shoulder`, `${name}Tip`],
        role: "fan",
        group: "fronds",
      },
    );
  }

  const lowL = makeFanBranch(
    "frondL",
    trunk.at(0.3),
    new THREE.Vector3(0.22, 0.67, 0.035),
    new THREE.Vector3(0.58, 0.88, 0.19),
    new THREE.Vector3(1.0, 1.06, 0.38),
    trunk.joints[1],
  );

  const lowR = makeFanBranch(
    "frondR",
    trunk.at(0.3),
    new THREE.Vector3(-0.22, 0.67, 0.035),
    new THREE.Vector3(-0.58, 0.88, 0.19),
    new THREE.Vector3(-1.0, 1.06, 0.38),
    trunk.joints[1],
  );

  const midL = makeFanBranch(
    "frondMidL",
    trunk.at(0.5),
    new THREE.Vector3(0.21, 1.01, 0.055),
    new THREE.Vector3(0.52, 1.3, 0.2),
    new THREE.Vector3(0.87, 1.56, 0.4),
    trunk.joints[2],
  );

  const midR = makeFanBranch(
    "frondMidR",
    trunk.at(0.5),
    new THREE.Vector3(-0.21, 1.01, 0.055),
    new THREE.Vector3(-0.52, 1.3, 0.2),
    new THREE.Vector3(-0.87, 1.56, 0.4),
    trunk.joints[2],
  );

  const highL = makeFanBranch(
    "frondHighL",
    trunk.at(0.7),
    new THREE.Vector3(0.2, 1.4, 0.1),
    new THREE.Vector3(0.5, 1.7, 0.3),
    new THREE.Vector3(0.83, 1.96, 0.48),
    trunk.joints[3],
  );

  const highR = makeFanBranch(
    "frondHighR",
    trunk.at(0.7),
    new THREE.Vector3(-0.2, 1.4, 0.1),
    new THREE.Vector3(-0.5, 1.7, 0.3),
    new THREE.Vector3(-0.83, 1.96, 0.48),
    trunk.joints[3],
  );

  const rear = makeFanBranch(
    "frondRear",
    trunk.at(0.4),
    new THREE.Vector3(0, 0.78, -0.22),
    new THREE.Vector3(0, 1.03, -0.5),
    new THREE.Vector3(0, 1.26, -0.73),
    trunk.joints[2],
  );

  const front = makeFanBranch(
    "frondFront",
    trunk.at(0.55),
    new THREE.Vector3(0, 1.03, 0.29),
    new THREE.Vector3(0, 1.27, 0.62),
    new THREE.Vector3(0, 1.47, 0.86),
    trunk.joints[2],
  );

  const crown = b.chain(
    "crown",
    catmull([
      trunk.at(0.86),
      [0, 2.04, 0.19],
      [0, 2.26, 0.36],
      [0, 2.47, 0.53],
    ]),
    {
      parent: trunk.joints[4],
      names: ["crownBase", "crownMid", "crownNeck", "crownTip"],
      role: "fan",
      group: "crown",
    },
  );

  const tendrilL = b.chain(
    "tendrilL",
    catmull([
      lowL.at(0.62),
      [0.66, 0.83, 0.24],
      [0.78, 0.55, 0.37],
      [0.76, 0.22, 0.53],
    ]),
    {
      parent: lowL.joints[1],
      names: ["tendrilLBase", "tendrilLMid", "tendrilLCurl", "tendrilLTip"],
      role: "tentacle",
      group: "tendrils",
    },
  );

  const tendrilR = b.chain(
    "tendrilR",
    catmull([
      lowR.at(0.62),
      [-0.66, 0.83, 0.24],
      [-0.78, 0.55, 0.37],
      [-0.76, 0.22, 0.53],
    ]),
    {
      parent: lowR.joints[1],
      names: ["tendrilRBase", "tendrilRMid", "tendrilRCurl", "tendrilRTip"],
      role: "tentacle",
      group: "tendrils",
    },
  );

  const tendrilFront = b.chain(
    "tendrilFront",
    catmull([
      front.at(0.55),
      [0.1, 1.12, 0.69],
      [0.18, 0.77, 0.9],
      [0.08, 0.38, 1.03],
    ]),
    {
      parent: front.joints[1],
      names: ["tendrilFrontBase", "tendrilFrontMid", "tendrilFrontCurl", "tendrilFrontTip"],
      role: "tentacle",
      group: "tendrils",
    },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Main structural tubes.

  const baseMound = b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.31, 0.045],
      [0.36, 0.11],
      [0.33, 0.18],
      [0.24, 0.25],
      [0.12, 0.29],
      [0, 0.3],
    ],
    {
      at: [0, 0, 0],
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: ROOT,
      bone: rootJoint,
      group: "roots",
      name: "rootMound",
    },
  );

  const rootTubes = rootChains.map((chain, i) =>
    b.sweep(chain, (t) => 0.07 * (1 - t) + 0.014, {
      color: ROOT,
      section: { ngon: 7 },
      caps: "round",
      skin: "smooth",
      group: "roots",
      name: `rootTube${i + 1}`,
    }),
  );

  const trunkTube = b.sweep(trunk, (t) => 0.145 * (1 - t) + 0.065, {
    color: STEM,
    section: { ngon: 8 },
    caps: "round",
    skin: "smooth",
    group: "trunk",
    name: "livingTrunk",
  });

  const branchChains = [lowL, lowR, midL, midR, highL, highR, rear, front];
  const branchTubes = branchChains.map((chain, i) =>
    b.sweep(chain, (t) => 0.058 * (1 - t) + 0.017, {
      color: STEM,
      section: { ngon: 7 },
      caps: "round",
      skin: "smooth",
      group: "fronds",
      name: `frondTube${i + 1}`,
    }),
  );

  const crownTube = b.sweep(crown, (t) => 0.052 * (1 - t) + 0.025, {
    color: STEM,
    section: { ngon: 7 },
    caps: "round",
    skin: "smooth",
    group: "crown",
    name: "crownTube",
  });

  const tendrilChains = [tendrilL, tendrilR, tendrilFront];
  const tendrilTubes = tendrilChains.map((chain, i) =>
    b.sweep(chain, [0.034, 0.007], {
      color: STEM,
      section: { ngon: 7 },
      caps: { start: "round", end: "point" },
      skin: "smooth",
      group: "tendrils",
      name: `tendrilTube${i + 1}`,
    }),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Root halos and low-growing luminous root ornament.

  for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
    const radius = [0.32, 0.46, 0.59][ringIndex];
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const wobble = 1 + 0.035 * Math.sin(i * 2.7 + ringIndex * 1.4);
      points.push([
        Math.cos(a) * radius * wobble,
        0.016 + 0.002 * Math.sin(i * 1.6),
        Math.sin(a) * radius * wobble,
      ] as unknown as THREE.Vector3);
    }
    const halo = b.sweep(polyline(points, { closed: true }), 0.0065, {
      color: ringIndex === 1 ? PINK : CYAN,
      section: { ngon: 6 },
      caps: "none",
      group: "root-light",
      name: `rootHalo${ringIndex + 1}`,
    });
    glow(halo, 1.65 - ringIndex * 0.2);
  }

  const rootSurface = b.surface(baseMound);
  const rootCrystals = rootSurface.scatter(15, {
    rng: rng(531),
    minDist: 0.075,
    filter: (hit) => hit.n.y > 0.18,
  });

  rootCrystals.forEach((hit, i) => {
    const crystal = b.spike(
      hit,
      hit,
      0.055 + (i % 4) * 0.014,
      0.012 + (i % 3) * 0.003,
      {
        color: i % 3 === 0 ? LIME : i % 3 === 1 ? CYAN : BLUE,
        group: "root-light",
        name: `rootCrystal${i + 1}`,
      },
    );
    glow(crystal, 1.45);
  });

  rootTubes.forEach((tube, tubeIndex) => {
    b.along(
      tube,
      4,
      (at) => {
        const bead = b.stick(
          new THREE.IcosahedronGeometry(0.014 + 0.003 * (tubeIndex % 2), 0),
          tubeIndex % 2 === 0 ? CYAN : PINK,
          at,
          {
            embed: 0.32,
            group: "root-light",
            name: `rootBead${tubeIndex + 1}`,
          },
        );
        glow(bead, 1.35);
      },
      { from: 0.28, to: 0.9 },
    );
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Neon trunk veins, collars, glyph cards, and surface nodes.

  for (const [i, degree] of [28, 146, 258].entries()) {
    const vein = b.sweep(trunkTube.line(degree, 0.006), 0.008, {
      color: i === 1 ? PINK : CYAN,
      section: { ngon: 6 },
      caps: "round",
      group: "trunk-light",
      name: `trunkVein${i + 1}`,
    });
    glow(vein, 1.8);
  }

  const trunkSurface = b.surface(trunkTube);

  for (const [i, t] of [0.2, 0.43, 0.68, 0.86].entries()) {
    const loop = trunkSurface.loop(trunk.at(t), {
      lift: 0.007,
    });
    const collar = b.sweep(loop, 0.009, {
      color: i % 2 === 0 ? PINK : BLUE,
      section: { ngon: 6 },
      caps: "none",
      group: "trunk-light",
      name: `trunkCollar${i + 1}`,
    });
    glow(collar, 1.6);
  }

  let trunkNodeIndex = 0;
  b.along(
    trunkTube,
    15,
    (at) => {
      const i = trunkNodeIndex++;
      const node = b.stick(
        new THREE.IcosahedronGeometry(0.018 + (i % 3) * 0.003, 0),
        i % 3 === 0 ? CYAN : i % 3 === 1 ? PINK : LIME,
        at,
        {
          embed: 0.28,
          group: "trunk-light",
          name: `trunkNode${i + 1}`,
        },
      );
      glow(node, 1.65);
    },
  );

  const glyphHits = trunkSurface.scatter(17, {
    rng: rng(774),
    minDist: 0.105,
    filter: (hit) => hit.n.z > -0.35 && hit.n.y > -0.5,
  });

  const glyphCards = b.cards(glyphHits, GLYPH, {
    size: [0.038, 0.085],
    lean: 62,
    bend: 12,
    vary: 0.3,
    sink: 0.08,
    flow: [0, 0.18, 1],
    color: "#ffffff",
    rng: rng(775),
    group: "trunk-glyphs",
  });
  glow(glyphCards, 1.5);

  const trunkFront = trunkSurface.around([0, 1.14, 0]).at(0, 3);
  if (trunkFront) {
    const emblem = b.decal(trunkTube, RUNE, {
      at: trunkFront,
      dir: trunkFront.n,
      up: [0, 1, 0],
      size: [0.14, 0.245],
      segments: 8,
      lift: 0.003,
      group: "trunk-glyphs",
      name: "trunkRune",
    });
    glow(emblem, 1.8);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Branch collars, thorns, and small lights.

  function decorateFrond(tube: any, chain: any, index: number) {
    const surface = b.surface(tube);

    for (const [j, t] of [0.24, 0.52, 0.78].entries()) {
      const loop = surface.loop(chain.at(t), {
        lift: 0.0045,
      });
      const collar = b.sweep(loop, 0.006, {
        color: j % 2 === 0 ? BLUE : PINK,
        section: { ngon: 6 },
        caps: "none",
        group: "frond-light",
        name: `frond${index + 1}Collar${j + 1}`,
      });
      glow(collar, 1.35);
    }

    let frondSpineIndex = 0;
    b.along(
      tube,
      5,
      (at) => {
        const i = frondSpineIndex++;
        const spine = b.spike(
          at,
          at,
          0.032,
          0.007,
          {
            color: LIME,
            group: "frond-light",
            name: `frond${index + 1}Spine${i + 1}`,
          },
        );
        glow(spine, 1.3);
      },
      { from: 0.15, to: 0.88 },
    );

    const hits = surface.scatter(5, {
      rng: rng(830 + index),
      minDist: 0.09,
      filter: (hit) => hit.n.y > -0.05,
    });

    hits.forEach((hit, i) => {
      const bead = b.stick(
        new THREE.SphereGeometry(0.012 + (i % 2) * 0.003, 7, 5),
        i % 2 === 0 ? CYAN : PINK,
        hit,
        {
          embed: 0.38,
          group: "frond-light",
          name: `frond${index + 1}Bead${i + 1}`,
        },
      );
      glow(bead, 1.3);
    });
  }

  branchTubes.forEach((tube, i) => decorateFrond(tube, branchChains[i], i));
  decorateFrond(crownTube, crown, 8);

  // ---------------------------------------------------------------------------------------------------------------
  // Broad alien leaves. Each leaf is a faceted extruded silhouette with a built-up glowing vein network.

  function makeLeaf(
    base: any,
    growthInput: THREE.Vector3,
    width: number,
    length: number,
    scale: number,
    index: number,
  ) {
    const growth = growthInput.clone().normalize();
    let side = new THREE.Vector3(0, 1, 0).cross(growth);
    if (side.lengthSq() < 0.001) side.set(1, 0, 0);
    side.normalize();

    const normal = side.clone().cross(growth).normalize();
    const half = width * 0.5;
    const outline: [number, number][] = [
      [0, 0],
      [half * 0.62, length * 0.1],
      [half, length * 0.38],
      [half * 0.82, length * 0.7],
      [half * 0.42, length * 0.96],
      [0, length * 1.12],
      [-half * 0.42, length * 0.96],
      [-half * 0.82, length * 0.7],
      [-half, length * 0.38],
      [-half * 0.62, length * 0.1],
    ];

    const leaf = b.extrude(outline, {
      at: base,
      x: side,
      y: growth,
      thickness: [0.014 * scale, 0.005 * scale],
      bevel: 0.006 * scale,
      smoothing: 1,
      color: LEAF,
      bone: base.bone,
      group: "leaves",
      name: `alienLeaf${index + 1}`,
    });

    const veinStart = leaf.local([0, length * 0.045, 0.009 * scale]);
    const veinEnd = leaf.local([0, length * 1.02, 0.009 * scale]);
    const centralVein = b.rod(veinStart, veinEnd, 0.009 * scale, {
      color: CYAN,
      bone: base.bone,
      section: { ngon: 6 },
      group: "leaf-light",
      name: `leaf${index + 1}CentralVein`,
    });
    glow(centralVein, 1.75);

    for (let j = 0; j < 4; j++) {
      const f = 0.25 + j * 0.17;
      const center = leaf.local([0, length * f, 0.009 * scale]);
      const spread = half * (0.5 - j * 0.045);
      for (const s of [-1, 1]) {
        const edge = leaf.local([
          s * spread,
          length * Math.min(f + 0.1, 1.02),
          0.009 * scale,
        ]);
        const sideVein = b.rod(center, edge, 0.0045 * scale, {
          color: j % 2 === 0 ? BLUE : PINK,
          bone: base.bone,
          section: { ngon: 5 },
          group: "leaf-light",
          name: `leaf${index + 1}SideVein${j + 1}${s > 0 ? "L" : "R"}`,
        });
        glow(sideVein, 1.42);
      }
    }

    const mark = b.decal(leaf, LEAF_MARK, {
      at: leaf.local([0, length * 0.62, 0.009 * scale]),
      dir: normal,
      up: growth,
      size: [width * 0.48, length * 0.26],
      segments: 6,
      lift: 0.002,
      group: "leaf-glyphs",
      name: `leaf${index + 1}Glyph`,
    });
    glow(mark, 1.45);

    const tip = leaf.local([0, length * 1.07, 0.008 * scale]);
    const lamp = b.part(
      new THREE.IcosahedronGeometry(0.022 * scale, 1),
      index % 3 === 0 ? LIME : CYAN,
      {
        at: tip,
        bone: base.bone,
        group: "leaf-light",
        name: `leaf${index + 1}TipLamp`,
      },
    );
    glow(lamp, 1.65);

    return leaf;
  }

  const leafSpecs = [
    [lowL.at(1), new THREE.Vector3(0.52, 0.42, 0.24), 0.64, 0.92, 1.0],
    [lowR.at(1), new THREE.Vector3(-0.52, 0.42, 0.24), 0.64, 0.92, 1.0],
    [midL.at(1), new THREE.Vector3(0.4, 0.58, 0.4), 0.68, 0.98, 1.0],
    [midR.at(1), new THREE.Vector3(-0.4, 0.58, 0.4), 0.68, 0.98, 1.0],
    [highL.at(1), new THREE.Vector3(0.28, 0.66, 0.48), 0.59, 0.86, 0.95],
    [highR.at(1), new THREE.Vector3(-0.28, 0.66, 0.48), 0.59, 0.86, 0.95],
    [rear.at(1), new THREE.Vector3(0, 0.38, -0.93), 0.72, 1.05, 1.0],
    [front.at(1), new THREE.Vector3(0, 0.42, 0.95), 0.74, 1.02, 1.05],
  ] as const;

  leafSpecs.forEach(([base, direction, width, length, scale], i) => {
    makeLeaf(base, direction, width, length, scale, i);
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Luminous flowers and seed lanterns.

  function makeBloom(
    base: any,
    axisInput: THREE.Vector3,
    scale: number,
    name: string,
    seed: number,
  ) {
    const axis = axisInput.clone().normalize();
    const h = 0.29 * scale;
    const r = 0.12 * scale;

    const pod = b.lathe(
      [
        [0, 0],
        [r * 0.48, 0],
        [r, h * 0.14],
        [r * 0.92, h * 0.42],
        [r * 0.62, h * 0.72],
        [r * 0.28, h * 0.93],
        [0, h],
      ],
      {
        at: base,
        axis,
        segments: 10,
        smoothing: 1,
        color: POD,
        bone: base.bone,
        group: "seed-pods",
        name: `${name}Pod`,
      },
    );

    const petalRing = b.ring(frame(base, axis), {
      count: 9,
      radius: 0.105 * scale,
      tilt: -7,
      group: "flowers",
      name: `${name}PetalRing`,
    });

    const petals = b.cards(petalRing.items, PETAL, {
      size: [0.17 * scale, 0.31 * scale],
      lean: 58,
      bend: 22,
      vary: 0.14,
      sink: 0.1,
      flow: [0, -0.16, -1],
      color: "#ffffff",
      rng: rng(seed),
      group: "flowers",
    });
    glow(petals, 1.18);

    const filamentRing = b.ring(frame(base, axis), {
      count: 8,
      radius: 0.04 * scale,
      tilt: 0,
      group: "flowers",
      name: `${name}FilamentRing`,
    });

    filamentRing.items.forEach((item, i) => {
      const filament = b.spike(
        item,
        item,
        0.14 * scale + (i % 3) * 0.018 * scale,
        0.0065 * scale,
        {
          color: i % 2 === 0 ? PINK : VIOLET,
          group: "flower-light",
          name: `${name}Filament${i + 1}`,
        },
      );
      glow(filament, 1.8);
    });

    const center = base.at.clone().addScaledVector(axis, h * 1.06);
    const orb = b.part(
      new THREE.IcosahedronGeometry(0.065 * scale, 1),
      CYAN,
      {
        at: center,
        bone: base.bone,
        group: "flower-light",
        name: `${name}Core`,
      },
    );
    glow(orb, 2.15);

    const podSurface = b.surface(pod);
    const jewelHits = podSurface.scatter(6, {
      rng: rng(seed + 100),
      minDist: 0.035 * scale,
      filter: (hit) => hit.n.y > -0.7,
    });

    jewelHits.forEach((hit, i) => {
      const jewel = b.stick(
        new THREE.SphereGeometry(0.012 * scale, 7, 5),
        i % 2 === 0 ? PINK : LIME,
        hit,
        {
          embed: 0.35,
          group: "flower-light",
          name: `${name}Jewel${i + 1}`,
        },
      );
      glow(jewel, 1.55);
    });

    const front = podSurface.around(center).at(0, 2);
    if (front) {
      const rune = b.decal(pod, RUNE, {
        at: front,
        dir: front.n,
        up: [0, 1, 0],
        size: [0.085 * scale, 0.14 * scale],
        segments: 7,
        lift: 0.002,
        group: "flower-glyphs",
        name: `${name}Rune`,
      });
      glow(rune, 1.9);
    }

    const collarLoop = podSurface.loop(base, {
      lift: 0.003,
    });
    const collar = b.sweep(collarLoop, 0.005 * scale, {
      color: POD_EDGE,
      section: { ngon: 6 },
      caps: "none",
      group: "flower-light",
      name: `${name}PodCollar`,
    });
  }

  makeBloom(crown.at(1), new THREE.Vector3(0, 0.38, 0.9), 1.12, "crownBloom", 1201);
  makeBloom(lowL.at(1), new THREE.Vector3(0.38, 0.54, 0.72), 0.67, "leftBloom", 1202);
  makeBloom(lowR.at(1), new THREE.Vector3(-0.38, 0.54, 0.72), 0.67, "rightBloom", 1203);
  makeBloom(front.at(1), new THREE.Vector3(0, 0.5, 0.86), 0.54, "frontBloom", 1204);

  // ---------------------------------------------------------------------------------------------------------------
  // Pendant tendrils carry evenly spaced glowing spores and small translucent glyph cards.

  tendrilTubes.forEach((tube, tubeIndex) => {
    let tendrilSporeIndex = 0;
    b.along(
      tube,
      7,
      (at) => {
        const i = tendrilSporeIndex++;
        const spore = b.stick(
          new THREE.SphereGeometry(0.016, 7, 5),
          tubeIndex % 3 === 0 ? LIME : tubeIndex % 3 === 1 ? CYAN : PINK,
          at,
          {
            embed: 0.32,
            group: "tendril-light",
            name: `tendril${tubeIndex + 1}Spore${i}`,
          },
        );
        glow(spore, 1.75);

        if (tubeIndex % 2 === 0) {
          const filament = b.spike(at, at, 0.045, 0.0045, {
            color: BLUE,
            group: "tendril-light",
            name: `tendril${tubeIndex + 1}Filament${i}`,
          });
          glow(filament, 1.25);
        }
      },
      { from: 0.14, to: 0.88 },
    );

    const surface = b.surface(tube);
    const hits = surface.scatter(4, {
      rng: rng(1500 + tubeIndex),
      minDist: 0.06,
      filter: (hit) => hit.n.z > -0.5,
    });
    const cards = b.cards(hits, SPECK, {
      size: [0.025, 0.05],
      lean: 68,
      bend: 10,
      vary: 0.2,
      sink: 0.1,
      flow: [0, 0.1, 1],
      color: "#ffffff",
      rng: rng(1600 + tubeIndex),
      group: "tendril-glyphs",
    });
    glow(cards, 1.45);
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Final upright seed motes around the crown make the silhouette read as alien and alive.

  const crownSurface = b.surface(crownTube);
  const crownMotes = crownSurface.scatter(10, {
    rng: rng(1991),
    minDist: 0.075,
    filter: (hit) => hit.n.y > -0.2,
  });

  crownMotes.forEach((hit, i) => {
    const mote = b.stick(
      new THREE.IcosahedronGeometry(0.014 + (i % 3) * 0.003, 0),
      i % 2 === 0 ? CYAN : VIOLET,
      hit,
      {
        embed: 0.3,
        group: "crown-light",
        name: `crownMote${i + 1}`,
      },
    );
    glow(mote, 1.7);
  });

  const crownGlyphs = b.cards(crownMotes, SPECK, {
    size: [0.027, 0.055],
    lean: 70,
    bend: 12,
    vary: 0.22,
    sink: 0.08,
    flow: [0, 0.1, 1],
    color: "#ffffff",
    rng: rng(1992),
    group: "crown-glyphs",
  });
  glow(crownGlyphs, 1.5);

  return b.root;
}

import * as THREE from "three";
import {
  catmull,
  createBuilder,
  frame,
  mottle,
  countershade,
  paint,
  rng,
  stripes,
} from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with violet bark, turquoise luminous veins, broad floating leaves, hanging glowing pods, tendrils, flowers, and drifting spores.",
};

const INK = "#160d2d";
const DEEP = "#081424";
const STEM_BASE = "#16384a";
const STEM_LIGHT = "#286c72";
const LEAF_BASE = "#0c4050";
const LEAF_LIGHT = "#1e9a91";
const CYAN = "#52fff0";
const PALE_CYAN = "#a4fff2";
const BLUE_GLOW = "#4bb8ff";
const VIOLET = "#692b9b";
const MAGENTA = "#df4dce";
const PINK = "#ff91e8";
const AMBER = "#ffd66b";
const POD_PURPLE = "#4d247c";
const FLOOR_PURPLE = "#160d2e";

const STEM = countershade(
  mottle(STEM_BASE, STEM_LIGHT, { size: 0.16, contrast: 1.2, seed: 17 }),
  "#091326",
  { level: -0.18, soft: 0.42 },
);

const STEM_STRIPED = countershade(
  stripes(STEM_BASE, ["#0f6c73", "#522278"], {
    size: 0.34,
    width: 0.18,
    wobble: 0.28,
    seed: 8,
  }),
  "#070d20",
  { level: -0.2, soft: 0.3 },
);

const LEAF = countershade(
  stripes(
    mottle(LEAF_BASE, LEAF_LIGHT, { size: 0.22, contrast: 1.15, seed: 31 }),
    ["#22a99b", "#185b76"],
    { size: 0.18, width: 0.2, wobble: 0.18, seed: 12 },
  ),
  "#07182c",
  { level: -0.12, soft: 0.3 },
);

const LEAF_DARK = countershade(
  mottle("#102846", "#235b61", { size: 0.17, contrast: 1.3, seed: 41 }),
  "#071127",
  { level: -0.1, soft: 0.28 },
);

const PETAL = cel("#b834c5", "#4c176f", { threshold: 0.02 });
const PETAL_LIGHT = cel("#ed72df", "#762a91", { threshold: 0.08 });
const POD_PAINT = countershade(
  mottle(POD_PURPLE, "#b341ad", { size: 0.08, contrast: 1.3, seed: 64 }),
  "#170c32",
  { level: -0.06, soft: 0.3 },
);

const LEAF_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 180">
    <defs>
      <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7ffff0"/>
        <stop offset="0.52" stop-color="#249f9c"/>
        <stop offset="1" stop-color="#12395a"/>
      </linearGradient>
      <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#51fff0" stop-opacity=".15"/>
        <stop offset=".5" stop-color="#a7fff5"/>
        <stop offset="1" stop-color="#51fff0" stop-opacity=".15"/>
      </linearGradient>
    </defs>
    <path d="M50 178 C18 147 4 106 16 69 C24 42 40 18 50 3 C60 18 76 42 84 69 C96 106 82 147 50 178Z"
      fill="url(#leaf)" stroke="#092b48" stroke-width="4"/>
    <path d="M50 176 C49 126 49 75 50 9" fill="none" stroke="#b7fff5" stroke-width="3"/>
    <path d="M48 132 C35 118 27 105 21 88 M51 119 C66 105 74 91 80 75 M49 93 C38 83 31 72 27 60 M50 72 C60 63 67 53 72 42"
      fill="none" stroke="url(#edge)" stroke-width="2.2"/>
    <path d="M50 178 C43 163 41 151 42 137" fill="none" stroke="#55fff1" stroke-width="1.5"/>
  </svg>`,
  { size: 256 },
);

const SMALL_LEAF_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
    <path d="M40 118 C12 96 5 63 16 36 C24 18 35 7 40 2 C45 7 56 18 64 36 C75 63 68 96 40 118Z"
      fill="#3ce9d0" stroke="#102b5e" stroke-width="4"/>
    <path d="M40 115 L40 8 M40 82 L24 59 M40 68 L58 43" stroke="#b4fff4" stroke-width="3" fill="none"/>
  </svg>`,
  { size: 192 },
);

const FLOWER_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="p">
        <stop offset="0" stop-color="#ffd9ff"/>
        <stop offset=".35" stop-color="#ef68e4"/>
        <stop offset="1" stop-color="#641b91"/>
      </radialGradient>
    </defs>
    <path d="M64 65 C35 56 14 39 19 20 C23 5 41 7 54 23 C61 31 63 43 64 65Z" fill="url(#p)" stroke="#34105b" stroke-width="3"/>
    <path d="M64 65 C57 37 58 12 74 7 C89 2 98 18 91 35 C85 49 74 58 64 65Z" fill="url(#p)" stroke="#34105b" stroke-width="3"/>
    <path d="M64 65 C79 42 99 28 111 38 C123 48 114 65 96 72 C83 77 72 72 64 65Z" fill="url(#p)" stroke="#34105b" stroke-width="3"/>
    <path d="M64 65 C92 72 108 87 101 104 C95 118 77 112 68 96 C63 87 62 75 64 65Z" fill="url(#p)" stroke="#34105b" stroke-width="3"/>
    <path d="M64 65 C57 91 43 110 28 105 C14 100 18 82 32 72 C43 64 54 63 64 65Z" fill="url(#p)" stroke="#34105b" stroke-width="3"/>
    <circle cx="64" cy="65" r="14" fill="#ffe99a" stroke="#4a155b" stroke-width="4"/>
    <circle cx="59" cy="60" r="3" fill="#fffbd0"/>
    <circle cx="70" cy="70" r="3" fill="#fffbd0"/>
  </svg>`,
  { size: 256 },
);

const SPORE_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
    <defs>
      <radialGradient id="s">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset=".22" stop-color="#b1ffff"/>
        <stop offset=".6" stop-color="#56cfff"/>
        <stop offset="1" stop-color="#5a38d6" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#s)"/>
    <path d="M32 58 C24 70 29 82 32 93 C35 82 40 70 32 58Z" fill="#61e9ff" fill-opacity=".72"/>
    <path d="M32 57 L32 90" stroke="#d5ffff" stroke-width="2"/>
  </svg>`,
  { size: 160 },
);

const POD_CARD = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
    <defs>
      <radialGradient id="pod" cx=".35" cy=".25">
        <stop offset="0" stop-color="#eaffff"/>
        <stop offset=".18" stop-color="#8afff4"/>
        <stop offset=".53" stop-color="#2798d3"/>
        <stop offset="1" stop-color="#281660"/>
      </radialGradient>
    </defs>
    <path d="M40 4 C62 17 70 45 61 76 C56 95 47 108 40 116 C33 108 24 95 19 76 C10 45 18 17 40 4Z"
      fill="url(#pod)" stroke="#8fffee" stroke-width="3"/>
    <path d="M40 11 L40 108 M24 30 C33 35 47 35 57 30 M19 53 C31 58 49 58 61 53 M22 77 C32 81 48 81 58 77"
      stroke="#baffff" stroke-width="2" fill="none" opacity=".75"/>
  </svg>`,
  { size: 192 },
);

function P(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function addGlowSphere(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  radius: number,
  color: string,
  name: string,
  strength = 1.6,
) {
  const part = b.part(
    new THREE.SphereGeometry(radius, 8, 6),
    color,
    { at, flat: true, name, group: "luminescence" },
  );
  glow(part, strength);
  return part;
}

function addLuminousRod(
  b: ReturnType<typeof createBuilder>,
  a: THREE.Vector3,
  c: THREE.Vector3,
  radius: number,
  color: string,
  name: string,
  strength = 1.25,
) {
  const rod = b.rod(a, c, radius, {
    color,
    caps: "round",
    sides: 6,
    name,
    group: "luminescence",
  });
  glow(rod, strength);
  return rod;
}

function addLeaf(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3,
  tip: THREE.Vector3,
  width: number,
  leafColor: typeof LEAF | typeof LEAF_DARK,
  name: string,
  bone?: any,
) {
  const direction = tip.clone().sub(base);
  const length = direction.length();
  const d = direction.clone().normalize();

  let side = new THREE.Vector3(0, 1, 0).cross(d);
  if (side.lengthSq() < 0.01) side = new THREE.Vector3(1, 0, 0);
  side.normalize();

  const normal = d.clone().cross(side).normalize();
  const crown = base.clone().addScaledVector(d, length * 0.47);
  const broad = base.clone().addScaledVector(d, length * 0.70);

  const p1 = base.clone().addScaledVector(d, length * 0.17).addScaledVector(side, width * 0.45);
  const p2 = crown.clone().addScaledVector(side, width);
  const p3 = broad.clone().addScaledVector(side, width * 0.64);
  const p4 = tip.clone();
  const p5 = broad.clone().addScaledVector(side, -width * 0.64);
  const p6 = crown.clone().addScaledVector(side, -width);
  const p7 = base.clone().addScaledVector(d, length * 0.17).addScaledVector(side, -width * 0.45);

  const points = [base, p1, p2, p3, p4, p5, p6, p7].map((p) =>
    p.clone().addScaledVector(normal, Math.sin(p.distanceTo(base) / Math.max(length, 0.001) * Math.PI) * 0.012),
  );

  const slab = b.slab(points, {
    color: leafColor,
    thickness: 0.012,
    bone,
    name,
    group: "broad-leaves",
  });

  const veinStart = base.clone().addScaledVector(normal, 0.014);
  const veinEnd = tip.clone().addScaledVector(normal, 0.014);
  addLuminousRod(b, veinStart, veinEnd, 0.006, CYAN, `${name}.central-vein`, 1.8);

  for (let i = 1; i <= 3; i++) {
    const t = i / 4;
    const center = base.clone().lerp(tip, t).addScaledVector(normal, 0.015);
    const spread = Math.sin(Math.PI * t) * width * 0.86;
    const left = center.clone().addScaledVector(side, spread);
    const right = center.clone().addScaledVector(side, -spread);
    addLuminousRod(b, center, left, 0.0028, PALE_CYAN, `${name}.veinL${i}`, 1.15);
    addLuminousRod(b, center, right, 0.0028, PALE_CYAN, `${name}.veinR${i}`, 1.15);

    if (i !== 2) {
      addGlowSphere(b, left, 0.009, CYAN, `${name}.nodeL${i}`, 1.4);
      addGlowSphere(b, right, 0.009, CYAN, `${name}.nodeR${i}`, 1.4);
    }
  }

  return { slab, normal, direction: d };
}

function addFlower(
  b: ReturnType<typeof createBuilder>,
  center: THREE.Vector3,
  scale: number,
  name: string,
) {
  const up = P(0, 1, 0);
  const petalCount = 5;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 + 0.25;
    const radial = P(Math.cos(angle), 0.08, Math.sin(angle)).normalize();
    const side = up.clone().cross(radial).normalize();

    const base = center.clone().addScaledVector(radial, scale * 0.015);
    const shoulder = center.clone().addScaledVector(radial, scale * 0.085).addScaledVector(up, scale * 0.03);
    const tip = center.clone().addScaledVector(radial, scale * 0.17).addScaledVector(up, scale * 0.13);

    const petal = b.slab(
      [
        base,
        shoulder.clone().addScaledVector(side, scale * 0.055),
        tip.clone().addScaledVector(side, scale * 0.018),
        tip,
        tip.clone().addScaledVector(side, -scale * 0.018),
        shoulder.clone().addScaledVector(side, -scale * 0.055),
      ],
      {
        color: i % 2 === 0 ? "#b834c5" : "#ed72df",
        thickness: scale * 0.018,
        name: `${name}.petal${i}`,
        group: "night-flowers",
      },
    );
    glow(petal, 0.65);
  }

  const centerOrb = addGlowSphere(
    b,
    center.clone().addScaledVector(up, scale * 0.025),
    scale * 0.055,
    AMBER,
    `${name}.luminous-heart`,
    2.5,
  );

  const pollen = [
    P(0.045, 0.04, 0),
    P(-0.03, 0.055, 0.035),
    P(-0.015, 0.045, -0.04),
    P(0.025, 0.07, 0.03),
  ];
  for (let i = 0; i < pollen.length; i++) {
    const p = center.clone().add(new THREE.Vector3(pollen[i].x, pollen[i].y, pollen[i].z).multiplyScalar(scale));
    addGlowSphere(b, p, scale * 0.012, PALE_CYAN, `${name}.pollen${i}`, 2.2);
  }

  return centerOrb;
}

function addPod(
  b: ReturnType<typeof createBuilder>,
  base: THREE.Vector3,
  scale: number,
  name: string,
) {
  const podTop = base.clone().add(P(0, scale * 0.19, 0));

  const shell = b.lathe(
    [
      [0, 0],
      [scale * 0.045, 0],
      [scale * 0.075, scale * 0.025],
      [scale * 0.09, scale * 0.09],
      [scale * 0.065, scale * 0.17],
      [scale * 0.025, scale * 0.205],
      [0, scale * 0.21],
    ],
    {
      at: base,
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: POD_PAINT,
      name: `${name}.shell`,
      group: "glowing-pods",
    },
  );

  const inner = b.part(
    new THREE.SphereGeometry(scale * 0.056, 10, 7),
    "#72eaff",
    {
      at: base.clone().add(P(0, scale * 0.105, 0)),
      texture: POD_CARD,
      flat: true,
      name: `${name}.inner-light`,
      group: "glowing-pods",
    },
  );
  glow(inner, 2.4);

  const collar = b.part(
    new THREE.TorusGeometry(scale * 0.061, scale * 0.008, 6, 12),
    CYAN,
    {
      at: base.clone().add(P(0, scale * 0.035, 0)),
      flat: true,
      name: `${name}.collar`,
      group: "glowing-pods",
    },
  );
  glow(collar, 1.8);

  const cap = addGlowSphere(b, podTop, scale * 0.018, PALE_CYAN, `${name}.cap`, 1.9);
  return { shell, inner, cap };
}

export default function build() {
  const b = createBuilder({
    name: "bioluminescent-alien-plant",
    detail: 1,
    paintSize: 2048,
  });

  const root = b.joint("root", {
    at: [0, 0.12, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "plant-skeleton",
  });

  const trunkPath = catmull(
    [
      [0, 0.13, 0],
      [0.025, 0.48, -0.015],
      [-0.045, 0.93, 0.01],
      [0.035, 1.42, -0.025],
      [-0.02, 1.9, 0.02],
      [0.03, 2.32, 0.01],
      [-0.02, 2.58, -0.01],
    ],
    { tension: 0.42 },
  );

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "trunkCrown", "trunkTip"],
    role: "spine",
    group: "plant-skeleton",
  });

  const trunkTube = b.sweep(trunk, (t) => 0.135 - 0.092 * t, {
    color: STEM_STRIPED,
    section: { ngon: 7 },
    sides: 7,
    caps: "round",
    name: "main-violet-stem",
    group: "stem",
  });

  const trunkSurface = b.surface(trunkTube);

  for (let i = 0; i < 5; i++) {
    const t = 0.18 + i * 0.16;
    const around = trunkSurface.loop(trunkTube.at(t, i % 2 ? 90 : -90), { lift: 0.006 });
    const ring = b.sweep(around, 0.009, {
      color: i % 2 ? CYAN : "#8d54e8",
      section: { ngon: 6 },
      caps: "none",
      name: `trunk-luminous-ring-${i}`,
      group: "luminescence",
    });
    glow(ring, i % 2 ? 1.4 : 0.8);
  }

  b.along(trunkTube, 10, (at) => {
    const bead = b.stick(
      new THREE.SphereGeometry(0.014, 7, 5),
      iColor(at.t),
      at,
      {
        embed: 0.32,
        flat: true,
        name: `stem-bead-${Math.round(at.t * 100)}`,
        group: "luminescence",
      },
    );
    glow(bead, 1.35);
  });

  const rootEnds = [
    P(0.56, 0.05, 0.18),
    P(-0.53, 0.055, 0.2),
    P(0.28, 0.045, 0.58),
    P(-0.24, 0.05, -0.56),
    P(0.72, 0.045, -0.24),
    P(-0.68, 0.05, -0.18),
  ];

  for (let i = 0; i < rootEnds.length; i++) {
    const end = rootEnds[i];
    const start = P(0, 0.12, 0);
    const bend = start.clone().lerp(end, 0.45).add(P(0, 0.08 + (i % 2) * 0.03, 0));
    const rootPath = catmull([start, bend, end], { tension: 0.5 });
    const rootTube = b.sweep(rootPath, [0.065, 0.018], {
      color: STEM,
      section: { ngon: 6 },
      caps: "round",
      name: `root-tendril-${i}`,
      group: "roots",
    });

    for (let j = 1; j <= 3; j++) {
      const t = j / 4;
      const beadAt = rootTube.at(t, 0, 0.012);
      const bead = b.stick(
        new THREE.SphereGeometry(0.013 - j * 0.0015, 7, 5),
        j === 2 ? CYAN : BLUE_GLOW,
        beadAt,
        {
          embed: 0.26,
          flat: true,
          name: `root-light-${i}-${j}`,
          group: "luminescence",
        },
      );
      glow(bead, 1.2);
    }
  }

  type BranchInfo = {
    sweep: any;
    chain: any;
    end: THREE.Vector3;
    name: string;
  };

  const branches: BranchInfo[] = [];

  function addBranch(
    name: string,
    t: number,
    angle: number,
    bend: THREE.Vector3,
    end: THREE.Vector3,
    width: number,
  ) {
    const rootPoint = trunkTube.at(t, angle, 0.012);
    const branchPath = catmull([rootPoint, bend, end], { tension: 0.42 });
    const branch = b.sprout(name, rootPoint, branchPath, [width, 0.014], {
      count: 2,
      names: [`${name}Base`, `${name}Tip`],
      role: "tentacle",
      color: STEM,
      section: { ngon: 6 },
      caps: "round",
      group: "branching-stems",
    });

    const accent = b.sweep(branch.sweep.curve(), [0.008, 0.003], {
      color: STEM_LIGHT,
      section: { ngon: 5 },
      caps: "round",
      name: `${name}.ridge`,
      group: "branching-stems",
    });

    branches.push({
      sweep: branch.sweep,
      chain: branch.chain,
      end: end.clone(),
      name,
    });

    for (let i = 1; i <= 2; i++) {
      const at = branch.sweep.at(i / 3, 0, 0.012);
      const light = b.stick(
        new THREE.SphereGeometry(0.012, 7, 5),
        CYAN,
        at,
        {
          embed: 0.3,
          flat: true,
          name: `${name}.node${i}`,
          group: "luminescence",
        },
      );
      glow(light, 1.35);
    }

    return { branch, accent };
  }

  addBranch("branchL1", 0.26, 90, P(0.28, 0.63, 0.01), P(0.68, 0.86, 0.07), 0.06);
  addBranch("branchR1", 0.3, -90, P(-0.28, 0.68, -0.01), P(-0.74, 0.9, -0.04), 0.058);
  addBranch("branchL2", 0.43, 90, P(0.31, 1.14, 0.04), P(0.84, 1.33, 0.02), 0.055);
  addBranch("branchR2", 0.46, -90, P(-0.3, 1.18, -0.03), P(-0.82, 1.48, 0.08), 0.054);
  addBranch("branchFront1", 0.55, 180, P(0.03, 1.26, 0.34), P(0.04, 1.54, 0.67), 0.052);
  addBranch("branchBack1", 0.59, 0, P(-0.04, 1.38, -0.3), P(-0.08, 1.63, -0.68), 0.05);
  addBranch("branchL3", 0.68, 90, P(0.25, 1.7, 0.02), P(0.72, 1.93, -0.04), 0.046);
  addBranch("branchR3", 0.72, -90, P(-0.24, 1.82, 0.04), P(-0.68, 2.03, 0.1), 0.044);
  addBranch("branchFront2", 0.8, 180, P(0.03, 2.04, 0.27), P(0.04, 2.26, 0.55), 0.04);
  addBranch("branchBack2", 0.84, 0, P(-0.03, 2.13, -0.22), P(-0.06, 2.38, -0.46), 0.038);

  const leafSpecs: Array<[number, number, number, number, string, boolean]> = [
    [0, 0.34, 1.02, 0.23, "L1a", false],
    [0, 0.72, 1.14, 0.27, "L1b", true],
    [1, 0.38, 1.0, 0.22, "R1a", true],
    [1, 0.78, 1.17, 0.25, "R1b", false],
    [2, 0.34, 1.5, 0.28, "L2a", false],
    [2, 0.82, 1.56, 0.3, "L2b", true],
    [3, 0.3, 1.69, 0.28, "R2a", true],
    [3, 0.78, 1.72, 0.3, "R2b", false],
    [4, 0.38, 1.86, 0.24, "F1a", false],
    [4, 0.82, 1.85, 0.27, "F1b", true],
    [5, 0.42, 1.92, 0.25, "B1a", true],
    [5, 0.8, 1.94, 0.28, "B1b", false],
    [6, 0.3, 2.18, 0.24, "L3a", false],
    [7, 0.35, 2.24, 0.24, "R3a", true],
    [8, 0.34, 2.46, 0.22, "F2a", false],
    [9, 0.35, 2.5, 0.22, "B2a", true],
  ];

  for (const [branchIndex, t, length, width, label, dark] of leafSpecs) {
    const branch = branches[branchIndex];
    const base = branch.sweep.at(t, branchIndex % 2 ? -25 : 25, 0.014).at;
    const outward = base.clone().sub(P(0, base.y, 0));
    if (outward.lengthSq() < 0.01) outward.set(0, 0, 1);
    outward.normalize();

    const tip = base
      .clone()
      .addScaledVector(outward, length * 0.72)
      .add(P((branchIndex % 2 ? -1 : 1) * 0.04, length * 0.43, (branchIndex % 3 - 1) * 0.1));

    addLeaf(
      b,
      base,
      tip,
      width,
      dark ? LEAF_DARK : LEAF,
      `leaf-${label}`,
      branch.chain ?? root,
    );
  }

  const cardFrames = [
    [P(0.23, 0.7, 0.07), P(0.35, 0.65, 0.4)],
    [P(-0.26, 0.78, -0.02), P(-0.35, 0.68, -0.3)],
    [P(0.35, 1.23, 0.05), P(0.46, 0.65, 0.3)],
    [P(-0.37, 1.31, 0.02), P(-0.5, 0.6, -0.18)],
    [P(0.18, 1.68, 0.08), P(0.42, 0.62, 0.3)],
    [P(-0.18, 1.78, 0.03), P(-0.4, 0.62, -0.25)],
    [P(0.15, 2.08, 0.03), P(0.2, 0.76, 0.38)],
    [P(-0.12, 2.18, -0.02), P(-0.2, 0.7, -0.35)],
    [P(0.05, 2.4, 0.05), P(0.34, 0.65, 0.3)],
    [P(-0.03, 2.45, -0.02), P(-0.35, 0.64, -0.25)],
  ].map(([at, dir]) => frame(at, dir));

  const leafCards = b.cards(cardFrames, LEAF_CARD, {
    size: [0.16, 0.42],
    lean: 58,
    bend: 24,
    vary: 0.16,
    spin: 16,
    rng: rng(22),
    color: "#5df8e3",
    sink: 0.08,
    group: "translucent-leaflets",
  });
  glow(leafCards, 0.8);

  const smallCards = b.cards(
    [
      frame(P(0.42, 1.04, 0.18), [0.55, 0.5, 0.5]),
      frame(P(-0.42, 1.22, -0.04), [-0.55, 0.55, -0.3]),
      frame(P(0.41, 1.71, 0.16), [0.4, 0.72, 0.4]),
      frame(P(-0.37, 1.87, -0.14), [-0.44, 0.72, -0.3]),
      frame(P(0.25, 2.12, 0.11), [0.34, 0.75, 0.3]),
      frame(P(-0.24, 2.24, -0.13), [-0.36, 0.72, -0.28]),
    ],
    SMALL_LEAF_CARD,
    {
      size: [0.1, 0.27],
      lean: 66,
      bend: 18,
      vary: 0.2,
      rng: rng(33),
      color: "#7effed",
      sink: 0.07,
      group: "small-leaflets",
    },
  );
  glow(smallCards, 0.95);

  addFlower(b, P(0.73, 1.03, 0.07), 0.9, "flower-left-low");
  addFlower(b, P(-0.82, 1.58, 0.08), 0.82, "flower-right-mid");
  addFlower(b, P(0.7, 2.05, -0.04), 0.72, "flower-left-high");
  addFlower(b, P(-0.04, 2.55, 0.02), 0.86, "flower-crown");

  const pods = [
    [P(0.87, 1.34, 0.02), 0.85, "podL1"],
    [P(-0.9, 1.57, 0.09), 0.76, "podR1"],
    [P(0.77, 1.94, -0.06), 0.7, "podL2"],
    [P(-0.77, 2.04, 0.1), 0.68, "podR2"],
    [P(0.08, 2.28, 0.64), 0.62, "podF1"],
    [P(-0.1, 2.38, -0.52), 0.58, "podB1"],
    [P(0.23, 2.54, 0.12), 0.52, "podC1"],
  ] as Array<[THREE.Vector3, number, string]>;

  for (const [base, scale, name] of pods) addPod(b, base, scale, name);

  const tendrilData: Array<[THREE.Vector3, THREE.Vector3, THREE.Vector3, string]> = [
    [P(0.6, 0.93, 0.05), P(0.95, 1.02, 0.18), P(1.02, 1.28, 0.1), "tendrilA"],
    [P(-0.61, 1.02, -0.03), P(-0.92, 1.16, -0.2), P(-0.9, 1.43, -0.04), "tendrilB"],
    [P(0.62, 1.48, 0.05), P(1.02, 1.62, 0.22), P(1.04, 1.9, 0.16), "tendrilC"],
    [P(-0.61, 1.57, 0.02), P(-0.96, 1.74, -0.18), P(-0.91, 2.0, -0.08), "tendrilD"],
    [P(0.42, 1.92, -0.03), P(0.67, 2.12, -0.24), P(0.53, 2.37, -0.22), "tendrilE"],
    [P(-0.42, 2.0, 0.04), P(-0.72, 2.16, 0.18), P(-0.58, 2.42, 0.26), "tendrilF"],
    [P(0.12, 2.3, 0.03), P(0.3, 2.48, 0.28), P(0.22, 2.72, 0.22), "tendrilG"],
    [P(-0.12, 2.34, -0.01), P(-0.27, 2.52, -0.25), P(-0.14, 2.7, -0.32), "tendrilH"],
  ];

  for (let i = 0; i < tendrilData.length; i++) {
    const [a, bend, tip, name] = tendrilData[i];
    const path = catmull([a, bend, tip], { tension: 0.48 });
    const tendril = b.sweep(path, [0.014, 0.003], {
      color: i % 2 ? STEM_STRIPED : STEM,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      name,
      group: "curled-tendrils",
    });

    const accent = b.sweep(path.slice(0.18, 0.88), [0.0035, 0.001], {
      color: i % 3 === 0 ? MAGENTA : CYAN,
      section: { ngon: 5 },
      caps: { start: "round", end: "point" },
      name: `${name}.luminous-thread`,
      group: "luminescence",
    });
    glow(accent, i % 3 === 0 ? 1.1 : 1.65);

    addGlowSphere(b, tip, 0.022, i % 3 === 0 ? MAGENTA : CYAN, `${name}.tip`, 2.2);
    addGlowSphere(b, tip.clone().add(P(0, 0.04, 0)), 0.009, PALE_CYAN, `${name}.tip-star`, 2.6);
  }

  const sporeFrames = [
    frame(P(0.95, 1.46, 0.28), [0.42, 0.75, 0.35]),
    frame(P(-1.0, 1.77, -0.25), [-0.45, 0.76, -0.32]),
    frame(P(0.96, 2.05, 0.24), [0.35, 0.82, 0.35]),
    frame(P(-0.9, 2.25, -0.23), [-0.4, 0.8, -0.25]),
    frame(P(0.54, 2.5, -0.38), [0.25, 0.85, -0.38]),
    frame(P(-0.55, 2.58, 0.34), [-0.26, 0.84, 0.38]),
    frame(P(0.15, 2.78, 0.45), [0.1, 0.94, 0.35]),
    frame(P(-0.18, 2.76, -0.43), [-0.1, 0.92, -0.38]),
    frame(P(1.08, 1.93, -0.16), [0.62, 0.72, -0.18]),
    frame(P(-1.05, 1.35, 0.2), [-0.62, 0.72, 0.16]),
  ];

  const spores = b.cards(sporeFrames, SPORE_CARD, {
    size: [0.075, 0.12],
    lean: 20,
    bend: 8,
    vary: 0.22,
    spin: 24,
    rng: rng(48),
    color: "#a1ffff",
    sink: 0.06,
    group: "drifting-spores",
  });
  glow(spores, 1.7);

  const podSprites = b.cards(
    [
      frame(P(0.88, 1.36, 0.03), [0.3, 0.7, 0.3]),
      frame(P(-0.91, 1.59, 0.1), [-0.3, 0.72, -0.22]),
      frame(P(0.77, 1.96, -0.06), [0.26, 0.8, -0.25]),
      frame(P(-0.77, 2.07, 0.1), [-0.24, 0.8, 0.28]),
    ],
    POD_CARD,
    {
      size: [0.085, 0.16],
      lean: 55,
      bend: 12,
      vary: 0.1,
      rng: rng(57),
      color: "#8befff",
      sink: 0.08,
      group: "pod-icons",
    },
  );
  glow(podSprites, 1.25);

  const crownHalo = b.sweep(
    catmull([
      P(-0.48, 2.67, 0.02),
      P(0, 2.76, 0.16),
      P(0.48, 2.67, 0.02),
      P(0, 2.57, -0.18),
    ], { closed: true }),
    0.008,
    {
      color: MAGENTA,
      section: { ngon: 6 },
      caps: "none",
      name: "crown-halo",
      group: "luminescence",
    },
  );
  glow(crownHalo, 1.55);

  const crownDots = [
    P(-0.43, 2.69, 0.03),
    P(0, 2.77, 0.16),
    P(0.43, 2.69, 0.03),
    P(0, 2.58, -0.18),
  ];
  for (let i = 0; i < crownDots.length; i++) {
    addGlowSphere(b, crownDots[i], 0.018, i % 2 ? PALE_CYAN : MAGENTA, `crown-beacon-${i}`, 1.9);
  }

  const rootMound = b.lathe(
    [
      [0, 0],
      [0.18, 0],
      [0.25, 0.035],
      [0.22, 0.075],
      [0.12, 0.11],
      [0, 0.125],
    ],
    {
      at: P(0, 0.012, 0),
      axis: [0, 1, 0],
      segments: 9,
      smoothing: 1,
      color: countershade(
        mottle(FLOOR_PURPLE, "#39205a", { size: 0.12, contrast: 1.1, seed: 91 }),
        "#090816",
        { level: -0.05, soft: 0.32 },
      ),
      name: "root-crown",
      group: "plant-base",
    },
  );

  const rootGems = [
    P(0.17, 0.105, 0.09),
    P(-0.16, 0.1, 0.11),
    P(0.11, 0.11, -0.13),
    P(-0.08, 0.112, -0.15),
  ];
  for (let i = 0; i < rootGems.length; i++) {
    addGlowSphere(
      b,
      rootGems[i],
      0.018,
      i % 2 ? BLUE_GLOW : CYAN,
      `root-crown-gem-${i}`,
      1.55,
    );
  }

  return b.root;
}

function iColor(t: number) {
  if (t < 0.28) return BLUE_GLOW;
  if (t > 0.72) return MAGENTA;
  return CYAN;
}

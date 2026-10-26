import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  catmull,
  spiral,
  paint,
  noise,
  smoothstep,
  countershade,
  mottle,
  stripes,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "bioluminescent-alien-plant",
  description:
    "A stylized Avatar-inspired alien plant with faceted violet bark, branching turquoise veins, luminous leaves, hanging tendrils, root bulbs, and radiant lantern flowers.",
};

const DEEP_SPACE = "#101329";
const BARK_INK = "#21183d";
const VIOLET = "#42235f";
const CYAN = "#48f5d1";
const CYAN_BRIGHT = "#b4fff0";
const BLUE_GLOW = "#63a7ff";
const MAGENTA = "#c044df";
const PETAL_LIT = "#8d39c2";
const PETAL_DARK = "#351b66";
const ROOT_PURPLE = "#2c1a45";
const SPORE = "#e1fff2";
const GOLD = "#ffd86b";

const LEAF_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220">
    <defs>
      <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b6fff0"/>
        <stop offset=".32" stop-color="#52e4c4"/>
        <stop offset="1" stop-color="#28549a"/>
      </linearGradient>
      <linearGradient id="vein" x1="0" y1="0" x2="1" y2="0">
        <stop stop-color="#dffff8"/>
        <stop offset=".5" stop-color="#4affd4"/>
        <stop offset="1" stop-color="#78a8ff"/>
      </linearGradient>
    </defs>
    <path d="M50 219 C31 185 8 139 12 93 C16 49 37 18 50 2 C63 18 84 49 88 93 C92 139 69 185 50 219Z" fill="url(#leaf)" stroke="#b4fff0" stroke-width="2"/>
    <path d="M50 213 C50 155 50 73 50 8" stroke="url(#vein)" stroke-width="4" fill="none"/>
    <path d="M49 173 C34 155 24 136 18 111 M50 153 C67 134 76 116 83 92 M50 119 C36 105 27 91 21 73 M51 91 C64 78 73 63 78 46 M49 193 C39 184 31 173 26 160 M51 187 C63 176 70 163 75 149"
      stroke="#c4fff3" stroke-width="2.5" fill="none" opacity=".9"/>
    <circle cx="50" cy="28" r="5" fill="#ffffff"/>
    <circle cx="34" cy="142" r="3" fill="#dffff8"/>
    <circle cx="68" cy="116" r="3" fill="#dffff8"/>
  </svg>`,
  { size: 256 },
);

const FLOWER_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
    <defs>
      <radialGradient id="petal">
        <stop stop-color="#f7d4ff"/>
        <stop offset=".3" stop-color="#d64de9"/>
        <stop offset="1" stop-color="#331b71"/>
      </radialGradient>
    </defs>
    <path d="M80 80 C53 66 38 42 48 20 C59 0 78 20 80 52 C83 20 101 0 112 20 C122 42 107 66 80 80Z" fill="url(#petal)" stroke="#aeffee" stroke-width="2"/>
    <path d="M80 80 C94 53 119 38 140 48 C160 59 140 78 108 80 C140 83 160 101 140 112 C119 122 94 107 80 80Z" fill="url(#petal)" stroke="#aeffee" stroke-width="2"/>
    <path d="M80 80 C107 94 122 119 112 140 C101 160 83 140 80 108 C77 140 59 160 48 140 C38 119 53 94 80 80Z" fill="url(#petal)" stroke="#aeffee" stroke-width="2"/>
    <path d="M80 80 C66 107 41 122 20 112 C0 101 20 83 52 80 C20 78 0 59 20 48 C41 38 66 53 80 80Z" fill="url(#petal)" stroke="#aeffee" stroke-width="2"/>
    <circle cx="80" cy="80" r="19" fill="#dffff7" stroke="#4affd4" stroke-width="4"/>
    <circle cx="80" cy="80" r="8" fill="#ffffff"/>
  </svg>`,
  { size: 256 },
);

const NODE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="orb">
        <stop stop-color="#ffffff"/>
        <stop offset=".22" stop-color="#bafff0"/>
        <stop offset=".6" stop-color="#4affd4"/>
        <stop offset="1" stop-color="#267fc2" stop-opacity=".1"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#orb)"/>
    <path d="M32 8 L35 27 L54 32 L35 36 L32 56 L28 36 L10 32 L28 27Z" fill="#ffffff" opacity=".85"/>
  </svg>`,
  { size: 128 },
);

const VEIN_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M4 53 Q25 31 48 50 T96 43" fill="none" stroke="#c9fff3" stroke-width="4"/>
    <path d="M22 39 L30 20 M35 47 L48 27 M55 50 L66 24 M73 47 L84 29" stroke="#4affd4" stroke-width="3"/>
    <circle cx="30" cy="20" r="3" fill="#ffffff"/>
    <circle cx="66" cy="24" r="3" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const RUNE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="#162244" stroke="#5bf6d5" stroke-width="3"/>
    <path d="M50 11 L57 39 L84 50 L57 57 L50 88 L43 57 L16 50 L43 39Z" fill="none" stroke="#b9fff0" stroke-width="4"/>
    <circle cx="50" cy="50" r="11" fill="#4affd4"/>
    <circle cx="50" cy="50" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

const SPORE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120">
    <path d="M40 116 C28 88 18 67 21 43 C24 20 34 8 40 3 C46 8 56 20 59 43 C62 67 52 88 40 116Z" fill="#71ffe0" stroke="#e8fff9" stroke-width="3"/>
    <path d="M40 104 L40 13 M40 76 L28 56 M40 64 L53 44" stroke="#ffffff" stroke-width="3"/>
  </svg>`,
  { size: 128 },
);

const TRUNK = countershade(
  mottle("#30204b", "#164a63", { size: 0.2, contrast: 1.25, seed: 17 }),
  "#111a34",
  { level: -0.18, soft: 0.3 },
);

const BRANCH = mottle("#352052", "#17615f", {
  size: 0.13,
  contrast: 1.3,
  seed: 22,
});

const LEAF = countershade(
  stripes("#1f755f", ["#3fc7a1", "#2c6eaa", "#174478"], {
    size: 0.22,
    width: 0.22,
    wobble: 0.25,
    axis: "z",
    seed: 31,
  }),
  "#122949",
  { level: -0.1, soft: 0.25 },
);

const PETAL = countershade(
  mottle(PETAL_LIT, "#442184", { size: 0.11, contrast: 1.1, seed: 51 }),
  PETAL_DARK,
  { level: 0.02, soft: 0.2 },
);

const ROOT_PAINT = mottle(ROOT_PURPLE, "#4c316b", {
  size: 0.08,
  contrast: 1.4,
  seed: 71,
});

const GLOW_VEIN = paint((p, n) => {
  const pulse = 0.5 + 0.5 * Math.sin(p.y * 21 + p.z * 11 + p.x * 8);
  const light = smoothstep(-0.2, 0.75, n.y);
  return pulse * light > 0.42 ? CYAN_BRIGHT : CYAN;
});

const ALIEN_SHADOW = paint((p, n) => {
  const fleck = noise(p, 0.065, 103);
  if (n.y < -0.35) return "#10142c";
  return fleck > 0.64 ? "#4b327d" : "#1d3965";
});

function vec(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

function addGlowOrb(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  radius: number,
  strength = 1.8,
  color = CYAN,
) {
  const orb = b.part(new THREE.IcosahedronGeometry(radius, 1), color, {
    at,
    group: "bioluminescent-nodes",
  });
  glow(orb, strength);
  return orb;
}

function addNodeCard(
  b: ReturnType<typeof createBuilder>,
  at: THREE.Vector3,
  normal: THREE.Vector3,
  size: number,
  texture = NODE_TEX,
) {
  const cards = b.cards([frame(at, normal)], texture, {
    size: [size, size],
    lean: 0,
    sink: 0.03,
    color: "#ffffff",
  });
  glow(cards, 1.5);
  return cards;
}

function makeLeaf(
  b: ReturnType<typeof createBuilder>,
  base: any,
  direction: THREE.Vector3,
  length: number,
  width: number,
  index: number,
) {
  const d = direction.clone().normalize();

  let xAxis = new THREE.Vector3(0, 1, 0).cross(d);
  if (xAxis.lengthSq() < 0.05) xAxis.set(1, 0, 0);
  xAxis.normalize();

  const normal = d.clone().cross(xAxis).normalize();
  const basePoint = base.at ? base.at.clone() : new THREE.Vector3(base.x, base.y, base.z);
  const tip = basePoint.clone().addScaledVector(d, length);
  const raisedBase = basePoint.clone().addScaledVector(normal, 0.009);

  const outline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [width * 0.7, length * 0.14, "sharp"],
    [width, length * 0.38, "sharp"],
    [width * 0.72, length * 0.72, "sharp"],
    [0, length, "sharp"],
    [-width * 0.72, length * 0.72, "sharp"],
    [-width, length * 0.38, "sharp"],
    [-width * 0.7, length * 0.14, "sharp"],
  ];

  const leaf = b.extrude(outline, {
    at: base,
    x: xAxis,
    y: d,
    thickness: 0.012,
    bevel: 0.006,
    smoothing: 1,
    color: LEAF,
    group: "alien-leaves",
    name: `leaf${index}`,
  });

  const vein = b.rod(
    basePoint.clone().addScaledVector(normal, 0.016),
    tip.clone().addScaledVector(normal, 0.016),
    0.0045,
    {
      color: GLOW_VEIN,
      group: "leaf-veins",
      name: `leafVein${index}`,
    },
  );

  const sideA = basePoint
    .clone()
    .addScaledVector(d, length * 0.39)
    .addScaledVector(xAxis, width * 0.82)
    .addScaledVector(normal, 0.016);

  const sideB = basePoint
    .clone()
    .addScaledVector(d, length * 0.67)
    .addScaledVector(xAxis, -width * 0.72)
    .addScaledVector(normal, 0.016);

  const crossA = b.rod(
    basePoint.clone().addScaledVector(d, length * 0.39).addScaledVector(normal, 0.016),
    sideA,
    0.0028,
    { color: CYAN_BRIGHT, group: "leaf-veins" },
  );

  const crossB = b.rod(
    basePoint.clone().addScaledVector(d, length * 0.67).addScaledVector(normal, 0.016),
    sideB,
    0.0028,
    { color: CYAN_BRIGHT, group: "leaf-veins" },
  );

  glow(vein, 1.3);
  glow(crossA, 1.1);
  glow(crossB, 1.1);

  const leafCard = b.cards([frame(raisedBase, normal)], LEAF_TEX, {
    size: [width * 2.05, length * 1.02],
    lean: 90,
    flow: d,
    sink: 0.012,
    mirror: index % 2 === 0,
    color: "#ffffff",
    group: "leaf-luminescence",
    name: `leafCard${index}`,
  });
  glow(leafCard, 0.8);

  const midPoint = basePoint
    .clone()
    .addScaledVector(d, length * 0.53)
    .addScaledVector(normal, 0.023);
  const tipOrb = addGlowOrb(b, tip.clone().addScaledVector(normal, 0.021), width * 0.075, 1.4);
  const midOrb = addGlowOrb(b, midPoint, width * 0.045, 1.0);

  addNodeCard(b, tip.clone().addScaledVector(normal, 0.026), normal, width * 0.26);

  return { leaf, vein, tipOrb, midOrb };
}

function makePetal(
  b: ReturnType<typeof createBuilder>,
  center: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  width: number,
  index: number,
) {
  const d = direction.clone().normalize();
  let xAxis = new THREE.Vector3(0, 1, 0).cross(d);
  if (xAxis.lengthSq() < 0.03) xAxis = new THREE.Vector3(1, 0, 0);
  xAxis.normalize();

  const normal = d.clone().cross(xAxis).normalize();

  const outline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [width * 0.7, length * 0.22, "sharp"],
    [width, length * 0.57, "sharp"],
    [width * 0.55, length * 0.84, "sharp"],
    [0, length, "sharp"],
    [-width * 0.55, length * 0.84, "sharp"],
    [-width, length * 0.57, "sharp"],
    [-width * 0.7, length * 0.22, "sharp"],
  ];

  const petal = b.extrude(outline, {
    at: center,
    x: xAxis,
    y: d,
    thickness: 0.015,
    bevel: 0.005,
    smoothing: 1,
    color: PETAL,
    group: "lantern-flowers",
    name: `petal${index}`,
  });

  const petalVein = b.rod(
    center.clone().addScaledVector(normal, 0.012),
    center.clone().addScaledVector(d, length * 0.9).addScaledVector(normal, 0.012),
    0.003,
    {
      color: CYAN_BRIGHT,
      group: "flower-veins",
    },
  );
  glow(petalVein, 1.0);

  const petalCard = b.cards([frame(center.clone().addScaledVector(normal, 0.02), normal)], FLOWER_TEX, {
    size: [width * 2.1, length * 1.05],
    lean: 84,
    flow: d,
    sink: 0.02,
    mirror: index % 2 === 1,
    color: "#ffffff",
    group: "flower-translucence",
  });
  glow(petalCard, 1.1);

  return petal;
}

function makeBloom(
  b: ReturnType<typeof createBuilder>,
  base: any,
  scale: number,
  flowerIndex: number,
) {
  const basePoint = base.at ? base.at.clone() : new THREE.Vector3(base.x, base.y, base.z);
  const center = basePoint.clone().add(vec(0, scale * 0.11, 0));

  const calyx = b.part(
    new THREE.TorusGeometry(scale * 0.105, scale * 0.018, 6, 14),
    "#2d9a9a",
    {
      at: center,
      dir: [0, 1, 0],
      axis: "z",
      group: "lantern-flowers",
      name: `calyx${flowerIndex}`,
    },
  );
  glow(calyx, 0.7);

  const orb = addGlowOrb(b, center, scale * 0.105, 2.5, CYAN_BRIGHT);
  addNodeCard(b, center.clone().add(vec(0, 0, scale * 0.11)), vec(0, 0, 1), scale * 0.26);

  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2 + flowerIndex * 0.31;
    const radial = vec(Math.cos(angle), 0.12 + 0.08 * Math.sin(angle * 2), Math.sin(angle));
    const petalBase = center.clone().addScaledVector(radial, scale * 0.07);
    const petalDirection = radial.clone().multiplyScalar(0.72).add(vec(0, 0.34, 0)).normalize();

    makePetal(
      b,
      petalBase,
      petalDirection,
      scale * (0.32 + 0.035 * (i % 3)),
      scale * (0.12 + 0.012 * (i % 2)),
      flowerIndex * 10 + i,
    );

    const filament = b.rod(
      center.clone().addScaledVector(radial, scale * 0.06),
      center.clone().addScaledVector(petalDirection, scale * 0.29),
      scale * 0.009,
      {
        color: CYAN,
        group: "flower-filaments",
      },
    );
    glow(filament, 1.7);

    addGlowOrb(
      b,
      center.clone().addScaledVector(petalDirection, scale * 0.3),
      scale * 0.026,
      1.9,
      i % 2 === 0 ? CYAN_BRIGHT : BLUE_GLOW,
    );
  }

  const halo = b.sweep(
    spiral(
      center.clone().add(vec(scale * 0.18, 0, 0)),
      center.clone().add(vec(scale * 0.18, 0, 0)),
      [0, 1, 0],
      { turns: 1.2, pitch: scale * 0.04 },
    ),
    scale * 0.008,
    {
      color: CYAN,
      caps: "round",
      group: "flower-halos",
      name: `flowerHalo${flowerIndex}`,
    },
  );
  glow(halo, 1.4);

  return { orb, calyx };
}

export default function build() {
  const b = createBuilder({
    name: "bioluminescent-alien-plant",
    detail: 1,
    paintSize: 2048,
  });

  const rootJoint = b.joint("root", {
    at: [0, 0.14, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "plant-skeleton",
  });

  const trunkPath = catmull([
    [0, 0.14, 0],
    [0.02, 0.45, 0.015],
    [-0.035, 0.82, 0.02],
    [0.03, 1.2, 0.01],
    [-0.02, 1.58, 0.035],
    [0.015, 1.93, 0.025],
    [0.035, 2.27, 0.02],
    [0.0, 2.49, 0.0],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: rootJoint,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkChest", "trunkHigh", "trunkCrown", "trunkTip"],
    role: "spine",
    group: "plant-skeleton",
  });

  const branchDefinitions = [
    { t: 0.18, c1: [0.17, 0.61, 0.03], c2: [0.47, 0.73, 0.1], end: [0.84, 0.89, 0.16] },
    { t: 0.23, c1: [-0.18, 0.69, 0.0], c2: [-0.49, 0.86, -0.03], end: [-0.86, 1.08, 0.02] },
    { t: 0.39, c1: [0.21, 1.0, 0.02], c2: [0.56, 1.18, 0.06], end: [1.02, 1.42, 0.0] },
    { t: 0.46, c1: [-0.2, 1.13, 0.03], c2: [-0.58, 1.27, -0.04], end: [-1.0, 1.53, 0.04] },
    { t: 0.57, c1: [0.19, 1.45, 0.02], c2: [0.48, 1.65, 0.12], end: [0.82, 1.93, 0.08] },
    { t: 0.64, c1: [-0.21, 1.58, 0.01], c2: [-0.54, 1.78, -0.04], end: [-0.94, 2.05, 0.03] },
    { t: 0.76, c1: [0.13, 1.91, 0.04], c2: [0.36, 2.08, -0.02], end: [0.59, 2.32, 0.04] },
    { t: 0.82, c1: [-0.16, 2.01, 0.02], c2: [-0.39, 2.19, 0.07], end: [-0.64, 2.39, 0.02] },
  ];

  const branches: any[] = [];

  for (let i = 0; i < branchDefinitions.length; i++) {
    const spec = branchDefinitions[i];
    const start = trunk.at(spec.t).at.clone();
    const branchPath = catmull([start, vec(...(spec.c1 as [number, number, number])), vec(...(spec.c2 as [number, number, number])), vec(...(spec.end as [number, number, number]))]);
    const parent = trunk.jointAt(spec.t);

    const branch = b.chain(`branch${i + 1}`, branchPath, {
      parent,
      count: 4,
      names: [`branch${i + 1}Base`, `branch${i + 1}Mid`, `branch${i + 1}High`, `branch${i + 1}Tip`],
      role: "fan",
      group: "plant-skeleton",
    });

    branches.push(branch);
  }

  const trunkSweep = b.sweep(trunk, (t) => 0.14 - 0.078 * t, {
    color: TRUNK,
    section: { ngon: 8 },
    caps: "round",
    group: "alien-bark",
    name: "faceted-main-stem",
  });

  const trunkRim = b.sweep(trunk, (t) => 0.144 - 0.079 * t, {
    color: ALIEN_SHADOW,
    section: { ngon: 8 },
    caps: "none",
    sectors: [[-32, 33, "#3d8d83"]],
    group: "bark-light",
    name: "stem-light-ribbon",
  });

  for (let i = 0; i < branches.length; i++) {
    const branch = branches[i];
    const branchSweep = b.sweep(branch, (t) => 0.064 - 0.038 * t, {
      color: BRANCH,
      section: { ngon: 7 },
      caps: "round",
      group: "alien-branches",
      name: `branchTube${i + 1}`,
    });

    const glowRib = b.sweep(branch, (t) => 0.006 - 0.003 * t, {
      color: GLOW_VEIN,
      shift: [0.045, 0.02],
      section: { ngon: 5 },
      caps: "round",
      group: "branch-veins",
      name: `branchGlowRib${i + 1}`,
    });
    glow(glowRib, 1.15);

    const leafCount = i % 2 === 0 ? 5 : 4;
    for (let j = 0; j < leafCount; j++) {
      const t = 0.18 + (j / (leafCount - 1)) * 0.74;
      const cp = branch.at(t);
      const tangent = cp.tangent.clone().normalize();
      const angle = i * 0.83 + j * 1.67 + (i % 2) * 0.4;

      const fan = vec(
        Math.cos(angle) * (0.72 + 0.08 * (j % 2)),
        0.26 + 0.08 * Math.sin(angle * 1.4),
        Math.sin(angle) * 0.6,
      );
      const leafDirection = fan.addScaledVector(tangent, 0.35).normalize();

      makeLeaf(
        b,
        cp,
        leafDirection,
        0.38 + 0.06 * ((i + j) % 3),
        0.105 + 0.018 * ((i + 2 * j) % 3),
        i * 10 + j,
      );
    }

    if (i === 0 || i === 2 || i === 4 || i === 6) {
      makeBloom(b, branch.at(0.98), 0.74 + 0.06 * (i % 3), i);
    } else if (i === 1 || i === 5) {
      makeBloom(b, branch.at(0.95), 0.58 + 0.04 * i, i);
    }
  }

  const tendrilDefinitions = [
    { branch: 0, t: 0.72, end: [0.98, 0.35, 0.22], bend: [0.92, 0.58, 0.3] },
    { branch: 1, t: 0.68, end: [-1.05, 0.52, -0.03], bend: [-0.86, 0.7, 0.1] },
    { branch: 2, t: 0.8, end: [1.16, 0.8, -0.12], bend: [1.02, 1.03, 0.05] },
    { branch: 3, t: 0.77, end: [-1.12, 0.94, 0.18], bend: [-0.94, 1.14, 0.0] },
    { branch: 4, t: 0.72, end: [0.95, 1.18, 0.3], bend: [0.79, 1.43, 0.15] },
    { branch: 5, t: 0.72, end: [-1.08, 1.32, -0.15], bend: [-0.9, 1.53, -0.02] },
    { branch: 6, t: 0.7, end: [0.72, 1.51, -0.25], bend: [0.62, 1.75, -0.08] },
    { branch: 7, t: 0.72, end: [-0.74, 1.62, 0.12], bend: [-0.55, 1.86, 0.04] },
  ];

  const tendrils: any[] = [];

  for (let i = 0; i < tendrilDefinitions.length; i++) {
    const spec = tendrilDefinitions[i];
    const branch = branches[spec.branch];
    const start = branch.at(spec.t).at.clone();
    const path = catmull([
      start,
      vec(...(spec.bend as [number, number, number])),
      vec(...(spec.end as [number, number, number])),
    ]);

    const tendril = b.chain(`tendril${i + 1}`, path, {
      parent: branch.jointAt(spec.t),
      count: 3,
      names: [`tendril${i + 1}Base`, `tendril${i + 1}Mid`, `tendril${i + 1}Tip`],
      role: "tentacle",
      group: "plant-skeleton",
    });

    tendrils.push(tendril);

    const tube = b.sweep(tendril, (t) => 0.014 - 0.009 * t, {
      color: i % 2 === 0 ? "#3c75a1" : "#7641a2",
      section: { ngon: 6 },
      caps: "round",
      group: "hanging-tendrils",
      name: `tendrilTube${i + 1}`,
    });

    glow(tube, 0.75);

    b.along(tendril, 4, (at) => {
      const node = addGlowOrb(b, at.at.clone(), 0.024 - at.t * 0.008, 1.7, at.t < 0.5 ? CYAN : BLUE_GLOW);
      if (at.i % 2 === 0) {
        addNodeCard(b, at.at.clone().add(vec(0, 0, 0.012)), vec(0, 0, 1), 0.06, SPORE_TEX);
      }
      return node;
    });
  }

  const rootPaths = [
    [[0, 0.11, 0], [0.18, 0.075, 0.08], [0.52, 0.045, 0.17], [0.78, 0.035, 0.2]],
    [[0, 0.11, 0], [-0.2, 0.07, 0.05], [-0.52, 0.045, 0.08], [-0.83, 0.034, 0.06]],
    [[0, 0.11, 0], [0.12, 0.07, -0.18], [0.36, 0.045, -0.42], [0.63, 0.03, -0.49]],
    [[0, 0.11, 0], [-0.12, 0.07, -0.16], [-0.37, 0.045, -0.36], [-0.7, 0.032, -0.42]],
    [[0, 0.11, 0], [0.05, 0.07, 0.2], [0.03, 0.045, 0.51], [-0.03, 0.03, 0.79]],
    [[0, 0.11, 0], [0.08, 0.07, -0.1], [0.12, 0.045, -0.38], [0.17, 0.03, -0.7]],
  ];

  for (let i = 0; i < rootPaths.length; i++) {
    const rootPath = catmull(rootPaths[i] as number[][]);
    const rootTube = b.sweep(rootPath, [0.04, 0.012], {
      color: ROOT_PAINT,
      section: { ngon: 7 },
      caps: "round",
      group: "alien-roots",
      name: `rootRib${i + 1}`,
    });

    const rootGlow = b.sweep(rootPath, [0.006, 0.002], {
      color: CYAN,
      shift: [0.015, 0.012],
      section: { ngon: 5 },
      caps: "round",
      group: "root-veins",
    });
    glow(rootGlow, 0.9);

    const endpoint = rootPath.at(1);
    addGlowOrb(b, endpoint, 0.052, 1.2, i % 2 ? BLUE_GLOW : CYAN);
  }

  const rootBulb = b.part(new THREE.SphereGeometry(0.17, 10, 7), ROOT_PAINT, {
    at: [0, 0.12, 0],
    scale: [1, 0.76, 1],
    group: "root-core",
    name: "root-bulb",
  });

  const rootHalo = b.part(
    new THREE.TorusGeometry(0.19, 0.012, 6, 24),
    CYAN,
    {
      at: [0, 0.1, 0],
      dir: [0, 1, 0],
      axis: "z",
      group: "root-core",
      name: "root-halo",
    },
  );
  glow(rootHalo, 1.5);

  const rootRuneCards = b.cards(
    [
      frame([0.31, 0.012, 0.18], [0, 1, 0]),
      frame([-0.34, 0.012, 0.11], [0, 1, 0]),
      frame([0.18, 0.012, -0.37], [0, 1, 0]),
      frame([-0.2, 0.012, -0.33], [0, 1, 0]),
    ],
    RUNE_TEX,
    {
      size: [0.15, 0.15],
      lean: 90,
      flow: [1, 0, 0],
      mirror: true,
      sink: 0.02,
      color: "#ffffff",
      group: "root-runes",
    },
  );
  glow(rootRuneCards, 0.9);

  const barkSurface = b.surface([trunkSweep, trunkRim]);
  const barkLights = barkSurface.scatter(30, {
    rng: rng(203),
    minDist: 0.085,
    filter: (hit) => hit.n.y > -0.72,
  });

  for (let i = 0; i < barkLights.length; i++) {
    const hit = barkLights[i];
    const scale = 0.65 + (i % 4) * 0.1;
    const stud = b.stick(
      new THREE.OctahedronGeometry(0.023 * scale, 0),
      i % 3 === 0 ? CYAN_BRIGHT : CYAN,
      hit,
      {
        embed: 0.52,
        group: "stem-lights",
        name: `stemLight${i}`,
      },
    );
    glow(stud, 1.4 + (i % 3) * 0.3);
  }

  const stemCards = b.cards(barkLights.slice(0, 15), VEIN_TEX, {
    size: [0.045, 0.065],
    lean: 8,
    flow: [0, 0, 1],
    sink: 0.08,
    color: "#ffffff",
    group: "stem-glyphs",
  });
  glow(stemCards, 0.85);

  const upperSpores = [
    [0.72, 2.18, 0.22],
    [-0.78, 2.23, 0.12],
    [0.48, 2.43, -0.2],
    [-0.35, 2.51, 0.18],
    [0.94, 1.73, -0.08],
    [-0.92, 1.83, -0.12],
    [0.61, 1.99, 0.31],
    [-0.58, 2.08, 0.29],
  ];

  for (let i = 0; i < upperSpores.length; i++) {
    const p = vec(...(upperSpores[i] as [number, number, number]));
    const bob = vec(
      Math.sin(i * 2.1) * 0.045,
      Math.cos(i * 1.4) * 0.045,
      Math.sin(i * 1.7) * 0.04,
    );
    const spore = addGlowOrb(b, p.clone().add(bob), 0.022 + (i % 3) * 0.005, 1.4, SPORE);
    addNodeCard(
      b,
      p.clone().add(bob).add(vec(0, 0, 0.018)),
      vec(0, 0, 1),
      0.055,
      SPORE_TEX,
    );
    if (i % 2 === 0) {
      const filament = b.rod(
        p.clone().add(vec(0, -0.04, 0)),
        p.clone().add(bob),
        0.0025,
        { color: CYAN, group: "spore-filaments" },
      );
      glow(filament, 0.8);
    }
    void spore;
  }

  const crown = b.part(
    new THREE.ConeGeometry(0.1, 0.24, 7),
    ALIEN_SHADOW,
    {
      at: [0, 2.53, 0],
      dir: [0, 1, 0],
      group: "crown",
      name: "crown-fin",
    },
  );

  const crownGlow = b.part(
    new THREE.ConeGeometry(0.028, 0.28, 6),
    CYAN,
    {
      at: [0, 2.55, 0],
      dir: [0, 1, 0],
      group: "crown",
      name: "crown-light",
    },
  );
  glow(crownGlow, 1.8);

  const crownRing = b.part(
    new THREE.TorusGeometry(0.11, 0.008, 5, 18),
    CYAN_BRIGHT,
    {
      at: [0, 2.48, 0],
      dir: [0, 1, 0],
      axis: "z",
      group: "crown",
      name: "crown-ring",
    },
  );
  glow(crownRing, 1.5);

  const crownCards = b.cards(
    [frame([0, 2.66, 0], [0, 1, 0])],
    NODE_TEX,
    {
      size: [0.14, 0.14],
      lean: 0,
      sink: 0,
      color: "#ffffff",
      group: "crown",
    },
  );
  glow(crownCards, 2.2);

  return b.root;
}

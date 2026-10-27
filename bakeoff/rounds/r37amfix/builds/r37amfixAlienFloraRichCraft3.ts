import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  paint,
  noise,
  countershade,
  mottle,
  stripes,
  svg,
} from "../../../../src/index";
import { cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A stylized Avatar-inspired alien flower with a braided violet stalk, luminous turquoise veins, floating crown fronds, and glowing seed pods.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent-alien-plant", detail: 1 });

  const VIOLET = cel("#5d2d91", "#28164f");
  const VIOLET_DARK = cel("#35175d", "#160d31");
  const TEAL = cel("#31d9cf", "#126f7c");
  const AQUA = cel("#7affee", "#1b9da2");
  const MAGENTA = cel("#d94fe5", "#67206f");
  const LEAF = cel("#3a9e70", "#174a4a");
  const LEAF_EDGE = furEdge(LEAF, "#142f39", {
    level: -0.08,
    teeth: 0.22,
    period: 0.065,
    along: [1, 0, 0],
    ink: "#112332",
    inkWidth: 0.025,
  });
  const INK_PAINT = cel(INK, "#080914");
  const GLOW_CYAN = "#4dfff1";
  const GLOW_LIME = "#b8ff70";
  const GLOW_PINK = "#ff72e8";
  const CORE = mottle("#6d36a4", "#251946", { size: 0.22, seed: 9 });
  const TRUNK = countershade(CORE, "#1b1238", { level: -0.1, soft: 0.3 });
  const VEIN = stripes(TEAL, [AQUA, "#d7fff1"], {
    size: 0.18,
    width: 0.19,
    wobble: 0.25,
    seed: 12,
  });

  const bulbTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g"><stop offset="0" stop-color="#ffffff"/>
          <stop offset=".28" stop-color="#a8fff2"/><stop offset=".7" stop-color="#29d9d1"/>
          <stop offset="1" stop-color="#17627c"/></radialGradient>
      </defs>
      <circle cx="64" cy="64" r="58" fill="url(#g)" stroke="#cafff4" stroke-width="4"/>
      <path d="M21 78 Q64 42 107 78" fill="none" stroke="#eaffff" stroke-width="4" opacity=".8"/>
      <path d="M31 91 Q64 67 97 91" fill="none" stroke="#52fff1" stroke-width="3" opacity=".8"/>
      <circle cx="43" cy="38" r="10" fill="#fff" opacity=".9"/>
    </svg>`,
    { size: 192 },
  );

  const leafTexture = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 256 Q56 170 64 0" stroke="#d4fff3" stroke-width="5" fill="none"/>
      <path d="M63 180 Q35 151 11 147 M63 151 Q91 122 116 113 M63 112 Q39 89 17 86
               M64 75 Q90 52 110 45 M64 218 Q35 195 18 194" fill="none"
            stroke="#62fbe9" stroke-width="3" stroke-linecap="round"/>
      <circle cx="64" cy="21" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const sporeTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#dffff7"/>
      <circle cx="24" cy="22" r="9" fill="#ffffff"/>
      <circle cx="42" cy="39" r="6" fill="#6affd8"/>
      <path d="M17 46 Q32 35 48 47" fill="none" stroke="#48cfff" stroke-width="3"/>
    </svg>`,
    { size: 96 },
  );

  const root = b.joint("root", {
    at: [0, 0.075, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "plant",
  });

  const trunkPath = catmull([
    [0, 0.09, 0],
    [-0.035, 0.42, 0.01],
    [0.045, 0.78, -0.015],
    [-0.025, 1.12, 0.02],
    [0.02, 1.47, 0.06],
    [0, 1.76, 0.1],
  ]);
  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    count: 6,
    names: ["trunkBase", "trunkLow", "trunkMid", "trunkHigh", "trunkCrown", "trunkTip"],
    role: "spine",
  });
  const trunkTube = b.sweep(trunk, (t) => 0.105 - 0.035 * t, {
    color: TRUNK,
    sides: 8,
    caps: "round",
    group: "stalk",
  });

  const rootBulb = b.part(new THREE.SphereGeometry(0.13, 10, 7), VIOLET_DARK, {
    bone: root,
    at: [0, 0.11, -0.015],
    scale: [1.15, 0.72, 1.05],
    group: "root",
    name: "rootBulb",
  });

  const rootRays = [
    [[0, 0.1, 0], [0.28, 0.045, 0.18]],
    [[0, 0.1, 0], [-0.24, 0.045, 0.2]],
    [[0, 0.1, 0], [0.08, 0.045, -0.32]],
    [[0, 0.1, 0], [-0.16, 0.045, -0.28]],
  ];
  for (let i = 0; i < rootRays.length; i++) {
    const [a, z] = rootRays[i];
    const ray = b.rod(a, z, 0.035, { color: VIOLET_DARK, caps: "round", name: `rootRay${i}` });
    b.part(new THREE.SphereGeometry(0.045, 7, 5), TEAL, {
      at: z,
      bone: root,
      name: `rootNode${i}`,
    });
  }

  function branch(
    name: string,
    points: number[][],
    radius: number,
    color: any = VIOLET,
  ) {
    const chain = b.chain(name, catmull(points), {
      parent: root,
      count: Math.max(2, points.length - 1),
      role: "arm",
      group: "branches",
    });
    const sweep = b.sweep(chain, [radius, radius * 0.42], {
      color,
      sides: 7,
      caps: "round",
      group: "branches",
    });
    return { chain, sweep };
  }

  const branches = [
    branch("branchL", [
      [-0.015, 1.18, 0.02],
      [0.23, 1.34, 0.06],
      [0.5, 1.53, 0.16],
      [0.75, 1.65, 0.27],
    ], 0.052),
    branch("branchR", [
      [0.02, 1.31, 0.04],
      [-0.22, 1.47, 0.09],
      [-0.5, 1.62, 0.18],
      [-0.74, 1.7, 0.3],
    ], 0.052),
    branch("branchFront", [
      [0.01, 1.48, 0.07],
      [0.02, 1.66, 0.28],
      [0.02, 1.78, 0.52],
      [0.03, 1.82, 0.72],
    ], 0.047),
    branch("branchBack", [
      [0, 1.08, 0.02],
      [0.03, 1.27, -0.2],
      [0.02, 1.44, -0.42],
      [0, 1.57, -0.62],
    ], 0.043),
    branch("branchHigh", [
      [0, 1.62, 0.07],
      [0.18, 1.78, 0.2],
      [0.32, 1.95, 0.38],
      [0.36, 2.08, 0.56],
    ], 0.038),
  ];

  for (let i = 0; i < branches.length; i++) {
    const { chain, sweep } = branches[i];
    for (let j = 0; j < 3; j++) {
      const at = chain.at(0.2 + j * 0.22);
      const node = b.part(new THREE.SphereGeometry(0.035 - j * 0.004, 7, 5), GLOW_CYAN, {
        at,
        bone: at.bone,
        name: `branchNode${i}_${j}`,
        group: "branch-lights",
      });
      glow(node, 1.4);
    }

    const leafAt = chain.at(0.72);
    const tangent = leafAt.tangent.clone().normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const leaf = b.extrude(
      [
        [0, 0],
        [0.095, 0.13],
        [0.075, 0.42],
        [0.025, 0.68],
        [0, 0.81],
        [-0.025, 0.68],
        [-0.075, 0.42],
        [-0.095, 0.13],
      ],
      {
        at: leafAt,
        x: side,
        y: tangent,
        thickness: [0.018, 0.006],
        bevel: 0.006,
        smoothing: 1,
        color: LEAF_EDGE,
        group: "leaves",
        name: `leaf${i}`,
      },
    );

    const leafTip = leaf.local([0, 0.78, 0.012]);
    const vein = b.rod(leafAt, leafTip, 0.009, {
      color: GLOW_CYAN,
      caps: "round",
      bone: leafAt.bone,
      name: `leafVein${i}`,
      group: "leaf-lights",
    });
    glow(vein, 1.7);

    const sideVeins = [0.25, 0.42, 0.59];
    for (let k = 0; k < sideVeins.length; k++) {
      const q = sideVeins[k];
      const c = leaf.local([0, q, 0.015]);
      const left = leaf.local([-0.07 + q * 0.025, q + 0.08, 0.016]);
      const right = leaf.local([0.07 - q * 0.025, q + 0.08, 0.016]);
      const v1 = b.rod(c, left, 0.0045, { color: GLOW_CYAN, bone: leafAt.bone, name: `leafVeinL${i}_${k}` });
      const v2 = b.rod(c, right, 0.0045, { color: GLOW_CYAN, bone: leafAt.bone, name: `leafVeinR${i}_${k}` });
      glow(v1, 1.5);
      glow(v2, 1.5);
    }

    const pod = b.part(new THREE.SphereGeometry(0.075 - i * 0.004, 10, 8), GLOW_CYAN, {
      at: chain.at(1),
      bone: chain.tip!,
      texture: bulbTexture,
      scale: [1, 1.22, 1],
      group: "glowing-seed-pods",
      name: `seedPod${i}`,
    });
    glow(pod, 3.2);

    const collar = b.ring(chain.at(0.82), {
      count: 7,
      radius: 0.052,
      fromDeg: 0,
      toDeg: 360,
      tilt: 20,
      group: "pod-collars",
    });
    for (let k = 0; k < collar.items.length; k++) {
      const petal = b.spike(collar.items[k], collar.items[k], 0.055, 0.012, {
        color: GLOW_PINK,
        caps: "point",
        name: `podPetal${i}_${k}`,
      });
      if (k % 2 === 0) glow(petal, 1.3);
    }
  }

  const crownPoints = [
    [0, 1.72, 0.08],
    [0.08, 1.91, 0.2],
    [0.03, 2.08, 0.38],
    [0, 2.2, 0.48],
  ];
  const crown = b.chain(
    "crown",
    catmull(crownPoints),
    {
      parent: root,
      count: 3,
      names: ["crownBase", "crownMid", "crownTip"],
      role: "fan",
      group: "crown",
    },
  );
  b.sweep(crown, [0.052, 0.014], {
    color: MAGENTA,
    sides: 7,
    caps: "point",
    group: "crown",
  });

  const crownBulb = b.part(new THREE.SphereGeometry(0.105, 12, 9), GLOW_PINK, {
    at: crown.at(1),
    bone: crown.tip!,
    texture: bulbTexture,
    scale: [1.1, 1.25, 1.1],
    name: "crownLantern",
    group: "crown-lights",
  });
  glow(crownBulb, 4);

  const petalFrames = [
    frame([0, 2.16, 0.46], [0.65, 0.3, 0.2]),
    frame([0, 2.16, 0.46], [-0.65, 0.3, 0.2]),
    frame([0, 2.16, 0.46], [0.16, 0.35, 0.8]),
    frame([0, 2.16, 0.46], [-0.16, 0.35, 0.8]),
    frame([0, 2.16, 0.46], [0.2, 0.75, -0.35]),
    frame([0, 2.16, 0.46], [-0.2, 0.75, -0.35]),
  ];

  for (let i = 0; i < petalFrames.length; i++) {
    const f = petalFrames[i];
    const p = b.part(new THREE.PlaneGeometry(0.18, 0.54, 1, 3), GLOW_CYAN, {
      frame: f,
      texture: leafTexture,
      axis: "z",
      scale: [1, 1, 1],
      group: "crown-fronds",
      name: `crownFrond${i}`,
    });
    glow(p, 1.8);
  }

  const tendrilSpecs = [
    [[0.12, 1.72, 0.11], [0.26, 1.9, 0.08], [0.42, 2.0, -0.04], [0.5, 1.9, -0.18]],
    [[-0.12, 1.72, 0.11], [-0.3, 1.9, 0.08], [-0.48, 1.96, -0.05], [-0.56, 1.83, -0.2]],
    [[0.08, 1.78, -0.02], [0.2, 1.95, -0.2], [0.17, 2.04, -0.42], [0.02, 1.98, -0.55]],
    [[-0.08, 1.78, -0.02], [-0.2, 1.95, -0.2], [-0.17, 2.04, -0.42], [-0.02, 1.98, -0.55]],
  ];

  for (let i = 0; i < tendrilSpecs.length; i++) {
    const t = branch(`tendril${i}`, tendrilSpecs[i], 0.018, TEAL);
    const seed = b.part(new THREE.SphereGeometry(0.045, 9, 7), GLOW_LIME, {
      at: t.chain.at(1),
      bone: t.chain.tip!,
      texture: sporeTexture,
      name: `tendrilSeed${i}`,
      group: "tendril-lights",
    });
    glow(seed, 3.5);

    const tip = t.chain.at(1);
    const ring = b.ring(tip, {
      count: 5,
      radius: 0.032,
      fromDeg: 0,
      toDeg: 360,
      tilt: 35,
      group: "tendril-corona",
    });
    for (let j = 0; j < ring.items.length; j++) {
      const sp = b.spike(ring.items[j], ring.items[j], 0.07, 0.006, {
        color: j % 2 ? GLOW_CYAN : GLOW_PINK,
        caps: "point",
        name: `tendrilRay${i}_${j}`,
      });
      glow(sp, 2.6);
    }
  }

  const trunkSpots = b.surface(trunkTube).scatter(18, {
    rng: rng(33),
    minDist: 0.07,
    filter: (h) => h.n.y > -0.25,
  });
  for (let i = 0; i < trunkSpots.length; i++) {
    const spot = b.stick(
      new THREE.SphereGeometry(0.012 + (i % 3) * 0.004, 6, 4),
      i % 2 ? GLOW_CYAN : GLOW_PINK,
      trunkSpots[i],
      { embed: 0.35, name: `trunkPore${i}`, group: "trunk-lights" },
    );
    glow(spot, 1.5);
  }

  const spores = [
    [0.55, 1.5, 0.55],
    [-0.55, 1.85, 0.48],
    [0.7, 2.05, -0.1],
    [-0.65, 1.35, 0.22],
    [0.22, 2.28, 0.1],
    [-0.22, 2.34, 0.22],
  ];
  for (let i = 0; i < spores.length; i++) {
    const s = spores[i];
    const spore = b.part(new THREE.SphereGeometry(0.018 + (i % 2) * 0.008, 7, 5), GLOW_CYAN, {
      at: s,
      bone: root,
      texture: sporeTexture,
      name: `floatingSpore${i}`,
      group: "floating-spores",
    });
    glow(spore, 3);
    const halo = b.part(new THREE.SphereGeometry(0.032, 7, 5), GLOW_CYAN, {
      at: [s[0], s[1] - 0.012, s[2]],
      bone: root,
      scale: [1.5, 0.28, 1.5],
      name: `sporeHalo${i}`,
      group: "floating-spores",
    });
    glow(halo, 1.3);
  }

  const crownRing = b.ring(frame([0, 1.82, 0.08], [0, 1, 0]), {
    count: 8,
    radius: 0.18,
    tilt: 35,
    group: "crown-rings",
  });
  for (let i = 0; i < crownRing.items.length; i++) {
    const orb = b.part(new THREE.SphereGeometry(0.025, 7, 5), i % 2 ? GLOW_CYAN : GLOW_PINK, {
      frame: crownRing.items[i],
      name: `crownOrb${i}`,
      group: "crown-lights",
    });
    glow(orb, 2.4);
  }

  return b.root;
}

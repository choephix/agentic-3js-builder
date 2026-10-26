```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  noise,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { cel } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Avatar Bioluminescent Alien Plant",
  description:
    "A stylized alien rainforest plant with a braided violet trunk, luminous cyan leaves, glowing seed bulbs, root tendrils, and floating bioluminescent spores.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent_alien_plant", detail: 1 });

  const INK = "#160b2d";
  const ROOT_DARK = "#241237";
  const ROOT_MID = "#563071";
  const ROOT_LIT = "#9b4fbd";
  const CYAN = "#31f4dc";
  const CYAN_DARK = "#087f9b";
  const MINT = "#a6ffe8";
  const BLUE = "#218bdf";
  const MAGENTA = "#e94eff";
  const PINK = "#ff8de9";
  const GOLD = "#ffe76a";

  const trunkPaint = paint((p, n) => {
    const ripple = 0.5 + 0.5 * Math.sin(p.y * 21 + p.z * 6);
    const glowBand = noise(p, 0.22, 17);
    if (n.y > 0.45 && glowBand > 0.72) return ROOT_LIT;
    return ripple > 0.62 ? ROOT_MID : ROOT_DARK;
  });

  const leafPaint = cel(
    paint((p, n) => {
      const wave = 0.5 + 0.5 * Math.sin(p.x * 30 + p.z * 19 + p.y * 8);
      if (n.y < -0.25) return CYAN_DARK;
      return wave > 0.57 ? MINT : CYAN;
    }),
    "#075b83",
    { threshold: 0.02 },
  );

  const finPaint = cel("#63fff0", "#1682a7", { threshold: 0.08 });
  const bulbPaint = cel("#64fff1", "#1687b4", { threshold: -0.05 });

  const leafTexture = svg(
    `<svg viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
          <stop offset=".55" stop-color="#8affee" stop-opacity=".75"/>
          <stop offset="1" stop-color="#20b8da" stop-opacity=".15"/>
        </linearGradient>
      </defs>
      <path d="M64 256 C60 190 65 126 64 8" fill="none" stroke="url(#v)" stroke-width="5"/>
      <path d="M62 197 C38 180 22 160 9 133 M64 164 C88 147 105 127 119 101 M63 128 C40 110 25 92 14 69 M65 92 C84 78 99 61 111 39"
        fill="none" stroke="#d4fff8" stroke-width="2.5" opacity=".85"/>
      <path d="M65 232 C92 213 108 194 119 168 M62 219 C39 204 24 187 12 164"
        fill="none" stroke="#2ee4df" stroke-width="2" opacity=".7"/>
    </svg>`,
    { size: 256 },
  );

  const bulbTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="b">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".22" stop-color="#bafff3"/>
          <stop offset=".55" stop-color="#43f0dc"/>
          <stop offset="1" stop-color="#087eae"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="58" fill="url(#b)"/>
      <path d="M22 68 Q64 35 106 68 Q65 91 22 68Z" fill="none" stroke="#eaffff" stroke-width="4" opacity=".7"/>
      <circle cx="42" cy="42" r="8" fill="#fff"/>
      <circle cx="84" cy="83" r="4" fill="#c4fff8"/>
    </svg>`,
    { size: 128 },
  );

  const sporeTexture = svg(
    `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="s"><stop stop-color="#fff"/><stop offset=".3" stop-color="#ffccff"/><stop offset="1" stop-color="#ce37ff" stop-opacity="0"/></radialGradient></defs>
      <circle cx="32" cy="32" r="30" fill="url(#s)"/>
    </svg>`,
    { size: 64 },
  );

  const ringTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="48" fill="none" stroke="#9ffff0" stroke-width="8"/>
      <circle cx="64" cy="64" r="30" fill="none" stroke="#28bad9" stroke-width="3" stroke-dasharray="8 8"/>
      <circle cx="64" cy="64" r="9" fill="#fff"/>
    </svg>`,
    { size: 128 },
  );

  // Skeleton first.
  const root = b.joint("root", {
    at: [0, 0.08, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const trunkPath = catmull([
    [0, 0.08, 0],
    [0.02, 0.32, -0.01],
    [-0.03, 0.72, 0.02],
    [0.06, 1.08, 0.03],
    [-0.02, 1.42, 0.01],
    [0.03, 1.75, 0.02],
    [0, 2.02, 0.04],
  ]);

  const trunk = b.chain("trunk", trunkPath, {
    parent: root,
    count: 7,
    names: ["trunk0", "trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "crown"],
    role: "spine",
  });

  const branchData = [
    { side: 1, start: [0.03, 0.72, 0.02] as const, tip: [0.55, 1.24, 0.18] as const, bend: [0.78, 1.48, 0.28] as const },
    { side: -1, start: [-0.03, 0.82, 0.02] as const, tip: [-0.58, 1.25, 0.18] as const, bend: [-0.82, 1.53, 0.25] as const },
    { side: 1, start: [0.05, 1.04, 0.03] as const, tip: [0.62, 1.60, 0.02] as const, bend: [0.93, 1.78, 0.04] as const },
    { side: -1, start: [-0.02, 1.17, 0.02] as const, tip: [-0.61, 1.64, 0.02] as const, bend: [-0.92, 1.86, -0.01] as const },
    { side: 1, start: [0.02, 1.39, 0.03] as const, tip: [0.48, 1.86, -0.02] as const, bend: [0.75, 2.12, -0.04] as const },
    { side: -1, start: [-0.02, 1.52, 0.02] as const, tip: [-0.46, 1.94, -0.03] as const, bend: [-0.72, 2.18, -0.04] as const },
    { side: 1, start: [0.02, 1.72, 0.03] as const, tip: [0.36, 2.08, 0.10] as const, bend: [0.48, 2.34, 0.20] as const },
    { side: -1, start: [-0.01, 1.78, 0.03] as const, tip: [-0.34, 2.10, 0.10] as const, bend: [-0.46, 2.35, 0.20] as const },
  ];

  const branches = branchData.map((d, i) => {
    const path = catmull([d.start, d.tip, d.bend]);
    return {
      data: d,
      path,
      chain: b.chain(`branch${i}`, path, {
        parent: trunk.joints[Math.min(6, 2 + Math.floor(i * 0.55))],
        count: 3,
        names: [`branch${i}Root`, `branch${i}Mid`, `branch${i}Tip`],
        role: "fan",
      }),
    };
  });

  const rootPaths = [
    [[0, 0.1, 0], [0.35, 0.035, 0.12], [0.72, 0.025, 0.18]],
    [[0, 0.1, 0], [-0.35, 0.035, 0.12], [-0.74, 0.025, 0.16]],
    [[0, 0.1, 0], [0.12, 0.035, 0.34], [0.18, 0.025, 0.65]],
    [[0, 0.1, 0], [-0.13, 0.035, -0.32], [-0.22, 0.025, -0.62]],
    [[0, 0.1, 0], [0.4, 0.035, -0.16], [0.68, 0.025, -0.32]],
    [[0, 0.1, 0], [-0.38, 0.035, -0.16], [-0.68, 0.025, -0.30]],
  ];

  // Main body and roots.
  b.sweep(trunk, (t) => 0.14 - t * 0.07, {
    color: trunkPaint,
    sides: 9,
    section: "circle",
  });

  for (const path of rootPaths) {
    b.sweep(catmull(path), [0.065, 0.018], {
      bone: root,
      color: trunkPaint,
      sides: 7,
      caps: "round",
    });
  }

  // Branch tubes, luminous collars, leaves, and seed bulbs.
  branches.forEach(({ data, chain, path }, i) => {
    const branch = b.sweep(chain, (t) => 0.065 - t * 0.035, {
      color: trunkPaint,
      sides: 7,
      section: "circle",
    });

    b.along(branch, 4, (at) => {
      const node = glow(
        b.part(new THREE.SphereGeometry(0.038, 8, 6), CYAN, {
          frame: at,
          scale: [1.15, 0.65, 1.15],
          name: `luminous_node_${i}`,
        }),
        1.8,
      );
      return node;
    });

    const tip = path.at(1);
    const d = new THREE.Vector3(data.bend[0] - data.tip[0], 0, data.bend[2] - data.tip[2]).normalize();
    const across = new THREE.Vector3(-d.z, 0.12, d.x).normalize();
    const growth = new THREE.Vector3(d.x * 0.34, 0.92, d.z * 0.34).normalize();

    const leaf = b.extrude(
      [
        [-0.16, 0],
        [0.16, 0],
        [0.28, 0.22],
        [0.20, 0.49],
        [0.06, 0.82],
        [0, 1.0, "sharp"],
        [-0.09, 0.78],
        [-0.24, 0.46],
        [-0.28, 0.20],
      ],
      {
        at: tip,
        x: across,
        y: growth,
        thickness: [0.018, 0.004],
        bevel: 0.006,
        smoothing: 1,
        color: leafPaint,
        bone: chain.tip,
        name: `alien_leaf_${i}`,
      },
    );

    const leafMid = leaf.local([0, 0.48, 0.012]);
    const vein = glow(
      b.rod(tip, leaf.local([0, 0.94, 0]), 0.009, {
        color: MINT,
        bone: chain.tip,
        name: `leaf_vein_${i}`,
      }),
      1.7,
    );

    b.part(new THREE.PlaneGeometry(0.22, 0.68), "#ffffff", {
      at: leafMid,
      dir: new THREE.Vector3().crossVectors(across, growth).normalize(),
      axis: "z",
      texture: leafTexture,
      bone: chain.tip,
      name: `leaf_texture_${i}`,
    });

    const bulb = glow(
      b.part(new THREE.SphereGeometry(0.095, 12, 8), "#54ffe3", {
        at: leaf.local([0, 0.92, 0.02]),
        bone: chain.tip,
        texture: bulbTexture,
        name: `seed_lantern_${i}`,
      }),
      2.4,
    );

    b.part(new THREE.TorusGeometry(0.12, 0.008, 5, 16), MAGENTA, {
      at: leaf.local([0, 0.92, 0.018]),
      dir: growth,
      bone: chain.tip,
      name: `lantern_halo_${i}`,
    });

    // Small side fronds make the crown silhouette less symmetrical.
    const s = data.side;
    const frondBase = chain.at(0.58).at;
    const frondTip = new THREE.Vector3(frondBase.x + s * 0.21, frondBase.y + 0.2, frondBase.z + 0.12);
    b.sweep(
      catmull([frondBase, [frondBase.x + s * 0.12, frondBase.y + 0.11, frondBase.z], frondTip]),
      [0.028, 0.008],
      { color: finPaint, bone: chain.joints[1], sides: 6, caps: "round" },
    );
    glow(
      b.part(new THREE.SphereGeometry(0.045, 8, 6), "#ff74ec", {
        at: frondTip,
        bone: chain.joints[1],
        texture: bulbTexture,
        name: `side_flower_${i}`,
      }),
      2.1,
    );
  });

  // Crown flower: five broad fins around the top lantern.
  const crown = trunk.tip;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const radial = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    const side = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
    const petal = b.extrude(
      [
        [-0.13, 0],
        [0.13, 0],
        [0.19, 0.24],
        [0.08, 0.58],
        [0, 0.79, "sharp"],
        [-0.09, 0.55],
        [-0.18, 0.24],
      ],
      {
        at: crown.local({ up: 0.01 }),
        x: side,
        y: new THREE.Vector3(radial.x * 0.22, 0.82, radial.z * 0.22).normalize(),
        thickness: [0.018, 0.004],
        bevel: 0.004,
        smoothing: 1,
        color: finPaint,
        bone: crown,
        name: `crown_petal_${i}`,
      },
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.12, 0.5), "#ffffff", {
        at: petal.local([0, 0.38, 0.012]),
        dir: new THREE.Vector3().crossVectors(side, radial).normalize(),
        axis: "z",
        texture: leafTexture,
        bone: crown,
        name: `crown_glow_vein_${i}`,
      }),
      1.5,
    );
  }

  const crownBulb = glow(
    b.part(new THREE.SphereGeometry(0.13, 14, 10), "#78fff0", {
      at: crown.local({ up: 0.18 }),
      bone: crown,
      texture: bulbTexture,
      name: "crown_heart",
    }),
    3.2,
  );

  b.part(new THREE.TorusGeometry(0.17, 0.012, 6, 24), GOLD, {
    at: crown.local({ up: 0.18 }),
    dir: [0, 1, 0],
    bone: crown,
    name: "crown_gold_ring",
  });

  // A few floating spores rise above the plant, attached to the crown bone.
  const spores = [
    [0.18, 2.42, 0.18],
    [-0.23, 2.56, 0.08],
    [0.04, 2.72, -0.05],
    [0.30, 2.84, -0.14],
    [-0.30, 2.78, -0.12],
    [0.02, 2.98, 0.08],
  ];

  spores.forEach((p, i) => {
    const spore = glow(
      b.part(new THREE.SphereGeometry(i % 2 ? 0.028 : 0.038, 8, 6), "#ff75ed", {
        at: p,
        bone: crown,
        texture: sporeTexture,
        name: `floating_spore_${i}`,
      }),
      2.6,
    );
    b.rod(
      [p[0], p[1] - 0.045, p[2]],
      [p[0] - p[0] * 0.35, p[1] - 0.16, p[2] - 0.03],
      0.003,
      { color: MAGENTA, bone: crown, name: `spore_filament_${i}` },
    );
  });

  // Decorative luminous rings around the lower trunk.
  for (let i = 0; i < 3; i++) {
    const y = 0.42 + i * 0.18;
    b.part(new THREE.TorusGeometry(0.13 - i * 0.012, 0.008, 5, 18), i % 2 ? BLUE : CYAN, {
      at: [0, y, 0],
      dir: [0, 1, 0],
      bone: trunk.joints[Math.min(i + 1, trunk.joints.length - 1)],
      name: `trunk_light_ring_${i}`,
    });
  }

  // Tiny glowing plaques on the root crown suggest alien vascular markings.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = [Math.sin(a) * 0.13, 0.17 + (i % 2) * 0.05, Math.cos(a) * 0.13] as const;
    glow(
      b.part(new THREE.SphereGeometry(0.018, 6, 4), i % 2 ? GOLD : PINK, {
        at: p,
        bone: root,
        name: `root_mark_${i}`,
      }),
      1.8,
    );
  }

  return b.root;
}
```
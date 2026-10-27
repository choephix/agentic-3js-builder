import * as THREE from "three";
import { createBuilder, catmull, paint, rng, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bioluminescent Alien Plant",
  description:
    "A stylized Avatar-inspired alien plant with a luminous violet trunk, cyan veined leaves, glowing crown flowers, tendrils, roots, and floating spores.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescent_alien_plant", detail: 1 });

  const DARK = "#10112b";
  const ROOT = "#27204b";
  const VIOLET = "#713cbb";
  const MAGENTA = "#d649bd";
  const CYAN = "#48f5e2";
  const AQUA = "#8dfff2";
  const BLUE = "#2679db";
  const PINK = "#ff78d5";
  const WHITE = "#eaffff";

  const rand = rng(77);

  const trunkPaint = paint((p, n) => {
    const rib = 0.5 + 0.5 * Math.sin(p.y * 34 + p.z * 8);
    if (n.y < -0.35) return ROOT;
    return rib > 0.63 ? MAGENTA : rib > 0.38 ? VIOLET : "#3d2b8f";
  });

  const leafPaint = paint((p, n) => {
    const vein = Math.abs(Math.sin(p.y * 31 + p.z * 9));
    if (vein > 0.91) return WHITE;
    return n.y > 0.35 ? AQUA : CYAN;
  });

  const tendrilPaint = paint((p, n) => (n.y > 0.2 ? CYAN : BLUE));

  const flowerTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".22" stop-color="#bffff8"/>
          <stop offset=".55" stop-color="#44e8dc"/>
          <stop offset="1" stop-color="#1549b9" stop-opacity=".1"/>
        </radialGradient>
      </defs>
      <circle cx="64" cy="64" r="61" fill="url(#g)"/>
      <circle cx="64" cy="64" r="18" fill="#fff"/>
      <circle cx="64" cy="64" r="8" fill="#ffb8ed"/>
      <path d="M64 4v38M64 86v38M4 64h38M86 64h38" stroke="#d9ffff" stroke-width="3" opacity=".8"/>
    </svg>`,
    { size: 256 },
  );

  const sporeTexture = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="s" x2="0" y2="1">
        <stop stop-color="#ffffff"/><stop offset=".3" stop-color="#8dfff2"/>
        <stop offset="1" stop-color="#2f75ed" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="M16 2 C28 10 30 27 16 62 C2 27 4 10 16 2Z" fill="url(#s)"/>
      <path d="M16 8v38" stroke="#fff" stroke-width="2" opacity=".8"/>
    </svg>`,
    { size: 128 },
  );

  function capsule(
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: any,
    name: string,
  ) {
    return b.sweep([a, c], radius, {
      color,
      sides: 7,
      caps: "round",
      name,
      group: "plant",
    });
  }

  function leaf(
    base: readonly [number, number, number],
    tip: readonly [number, number, number],
    width: number,
    color = leafPaint,
    name = "leaf",
  ) {
    const a = new THREE.Vector3(...base);
    const t = new THREE.Vector3(...tip);
    const d = t.clone().sub(a).normalize();
    const side = new THREE.Vector3(1, 0, 0);
    if (Math.abs(d.dot(side)) > 0.8) side.set(0, 0, 1);
    side.crossVectors(d, new THREE.Vector3(0, 1, 0)).normalize();

    const mid = a.clone().lerp(t, 0.48);
    const shoulder = a.clone().lerp(t, 0.23);
    const far = a.clone().lerp(t, 0.78);

    return b.slab(
      [
        a,
        shoulder.clone().add(side.clone().multiplyScalar(width * 0.7)),
        mid.clone().add(side.clone().multiplyScalar(width)),
        far.clone().add(side.clone().multiplyScalar(width * 0.52)),
        t,
        far.clone().add(side.clone().multiplyScalar(-width * 0.52)),
        mid.clone().add(side.clone().multiplyScalar(-width)),
        shoulder.clone().add(side.clone().multiplyScalar(-width * 0.7)),
      ],
      { color, thickness: 0.012, name, group: "foliage" },
    );
  }

  function flower(at: THREE.Vector3, scale: number, name: string) {
    const petals: THREE.Object3D[] = [];
    const center = b.part(
      new THREE.SphereGeometry(scale * 0.12, 8, 6),
      WHITE,
      { at, name: `${name}_heart`, group: "flowers" },
    );
    glow(center, 2.5);

    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const p = at.clone().add(
        new THREE.Vector3(Math.cos(ang) * scale * 0.24, 0, Math.sin(ang) * scale * 0.24),
      );
      const petal = b.part(
        new THREE.SphereGeometry(scale * 0.18, 8, 5),
        i % 2 ? CYAN : AQUA,
        {
          at: p,
          scale: [1.25, 0.32, 0.62],
          rotation: [0, -ang, 0],
          name: `${name}_petal_${i}`,
          group: "flowers",
        },
      );
      glow(petal, 1.8);
      petals.push(petal.mesh);
    }

    const disk = b.part(new THREE.CircleGeometry(scale * 0.43, 16), WHITE, {
      at: at.clone().add(new THREE.Vector3(0, 0.012, 0)),
      dir: [0, 1, 0],
      axis: "z",
      texture: flowerTexture,
      name: `${name}_halo`,
      group: "flowers",
    });
    glow(disk, 2.2);
  }

  // Low, spreading root crown.
  const rootEnds: [number, number, number][] = [
    [0.34, 0.035, 0.28],
    [-0.38, 0.035, 0.18],
    [0.25, 0.035, -0.38],
    [-0.28, 0.035, -0.34],
    [0.55, 0.035, -0.08],
    [-0.53, 0.035, -0.05],
  ];

  rootEnds.forEach((end, i) => {
    const mid = [end[0] * 0.55, 0.12 + (i % 2) * 0.03, end[2] * 0.55] as [
      number,
      number,
      number,
    ];
    capsule([0, 0.12, 0], mid, 0.055, ROOT, `root_${i}`);
    capsule(mid, end, 0.027, trunkPaint, `root_tip_${i}`);
    b.part(
      new THREE.SphereGeometry(0.037, 7, 5),
      BLUE,
      { at: end, name: `root_lamp_${i}`, group: "roots" },
    );
  });

  // Main alien trunk, with a bulbous base and branching crown.
  const trunk = b.sweep(
    catmull([
      [0, 0.08, 0],
      [0.02, 0.38, -0.015],
      [-0.025, 0.78, 0.01],
      [0.025, 1.12, 0.04],
      [0, 1.38, 0.02],
    ]),
    (t: number) => 0.16 - t * 0.055,
    {
      color: trunkPaint,
      sides: 8,
      caps: "round",
      name: "luminous_trunk",
      group: "stem",
    },
  );

  const baseGlow = b.part(
    new THREE.SphereGeometry(0.19, 10, 7),
    MAGENTA,
    { at: [0, 0.18, 0], scale: [1, 0.8, 1], name: "root_bulb", group: "stem" },
  );
  glow(baseGlow, 1.6);

  // Main side boughs.
  const branches = [
    { s: 1, end: [0.58, 0.96, 0.08] as [number, number, number], tip: [0.92, 1.18, 0.14] as [number, number, number] },
    { s: -1, end: [-0.58, 1.02, 0.02] as [number, number, number], tip: [-0.93, 1.25, 0.12] as [number, number, number] },
    { s: 1, end: [0.38, 1.25, -0.02] as [number, number, number], tip: [0.65, 1.55, 0.02] as [number, number, number] },
    { s: -1, end: [-0.38, 1.3, 0.04] as [number, number, number], tip: [-0.66, 1.58, 0.05] as [number, number, number] },
  ];

  branches.forEach((br, i) => {
    const start = [br.s * 0.01, 0.78 + i * 0.1, 0.02] as [number, number, number];
    capsule(start, br.end, 0.052, trunkPaint, `branch_${i}`);
    capsule(br.end, br.tip, 0.026, tendrilPaint, `branch_tip_${i}`);

    leaf(
      [br.end[0] * 0.72, br.end[1] + 0.02, br.end[2]],
      [br.tip[0] * 1.18, br.tip[1] + 0.18, br.tip[2] + 0.04],
      0.16,
      leafPaint,
      `branch_leaf_${i}`,
    );

    flower(new THREE.Vector3(...br.tip), 0.16, `side_flower_${i}`);
  });

  // Crown leaves radiating like a luminous alien rosette.
  const crownLeaves = [
    [[0, 1.35, 0.03], [0.72, 1.72, 0.35], 0.19],
    [[0, 1.38, 0.03], [-0.72, 1.75, 0.31], 0.19],
    [[0, 1.39, 0.03], [0.34, 1.95, 0.42], 0.17],
    [[0, 1.4, 0.03], [-0.34, 1.98, 0.4], 0.17],
    [[0, 1.42, 0.02], [0.02, 2.03, 0.55], 0.18],
    [[0, 1.34, -0.01], [0.48, 1.7, -0.42], 0.16],
    [[0, 1.34, -0.01], [-0.48, 1.68, -0.42], 0.16],
  ] as const;

  crownLeaves.forEach((l, i) => leaf(l[0], l[1], l[2], i % 3 === 0 ? AQUA : leafPaint, `crown_leaf_${i}`));

  flower(new THREE.Vector3(0, 2.02, 0.55), 0.27, "crown_flower_front");
  flower(new THREE.Vector3(0.34, 1.94, 0.42), 0.18, "crown_flower_left");
  flower(new THREE.Vector3(-0.34, 1.96, 0.4), 0.18, "crown_flower_right");

  // Fine curling tendrils and luminous beads.
  const tendrilPaths = [
    catmull([[0.12, 0.72, 0.02], [0.34, 0.62, 0.16], [0.57, 0.7, 0.18], [0.66, 0.88, 0.08]]),
    catmull([[-0.1, 0.92, 0.01], [-0.3, 0.78, -0.08], [-0.54, 0.82, -0.16], [-0.62, 1.0, -0.04]]),
    catmull([[0.05, 1.12, 0.02], [0.2, 1.24, -0.2], [0.16, 1.44, -0.31], [0.02, 1.55, -0.27]]),
  ];

  tendrilPaths.forEach((path, i) => {
    const tube = b.sweep(path, [0.018, 0.006], {
      color: tendrilPaint,
      sides: 6,
      caps: "round",
      name: `curling_tendril_${i}`,
      group: "tendrils",
    });
    for (let j = 1; j < 4; j++) {
      const bead = b.part(
        new THREE.SphereGeometry(0.035 - j * 0.004, 7, 5),
        j % 2 ? AQUA : PINK,
        {
          at: path.at(j / 4),
          name: `tendril_bead_${i}_${j}`,
          group: "lights",
        },
      );
      glow(bead, 2.4);
    }
  });

  // A few floating bioluminescent spores above the crown.
  const spores = [
    [0.55, 2.16, 0.22],
    [-0.58, 2.27, 0.18],
    [0.28, 2.42, -0.05],
    [-0.22, 2.55, 0.12],
    [0.02, 2.72, 0.24],
    [0.72, 1.92, -0.26],
    [-0.7, 2.0, -0.2],
  ];

  spores.forEach((p, i) => {
    const s = 0.055 + (i % 3) * 0.012;
    const card = b.part(
      new THREE.PlaneGeometry(s, s * 1.8),
      WHITE,
      {
        at: p as [number, number, number],
        dir: [0, 1, 0],
        axis: "z",
        texture: sporeTexture,
        rotation: [0, (i * 37) % 90, 0],
        name: `floating_spore_${i}`,
        group: "spores",
      },
    );
    glow(card, 2.8);
  });

  // Tiny floor-level cyan stones make the root silhouette readable without becoming scenery.
  [
    [0.28, 0.025, 0.42],
    [-0.36, 0.025, 0.33],
    [0.43, 0.025, -0.31],
  ].forEach((p, i) => {
    const stone = b.part(
      new THREE.IcosahedronGeometry(0.045 + i * 0.008, 0),
      BLUE,
      { at: p as [number, number, number], name: `root_crystal_${i}`, group: "roots" },
    );
    glow(stone, 1.2);
  });

  return b.root;
}

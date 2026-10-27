import * as THREE from "three";
import { createBuilder, catmull, spiral, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "bioluminescent alien plant",
  description:
    "A stylized Avatar-inspired alien plant with a faceted violet trunk, luminous turquoise leaves, glowing tendrils, root bulbs, and a radiant crown flower.",
};

export default function build() {
  const b = createBuilder({ name: "bioluminescentAlienPlant", detail: 1 });

  const VIOLET = "#44266e";
  const VIOLET_DARK = "#24153f";
  const MAGENTA = "#b638a8";
  const CYAN = "#32e9dc";
  const CYAN_DARK = "#087c86";
  const BLUE = "#1968a7";
  const LIME = "#a8f04d";
  const GOLD = "#ffe66d";
  const WHITE = "#eaffff";
  const INK = "#140d29";
  const SOIL = "#102636";

  const root = b.joint("root", {
    at: [0, 0.12, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const stemPath = catmull([
    [0, 0.12, 0],
    [0.01, 0.42, -0.015],
    [-0.035, 0.82, 0.015],
    [0.025, 1.22, 0.025],
    [-0.015, 1.62, 0.01],
    [0.02, 1.98, 0.0],
    [0.0, 2.25, 0.02],
  ]);

  const stem = b.chain("stem", stemPath, {
    parent: root,
    names: ["stemBase", "stemLow", "stemMid", "stemHigh", "stemNeck", "stemTip"],
    role: "spine",
  });

  const trunk = b.sweep(stem, (t) => 0.14 - t * 0.085, {
    color: VIOLET,
    sides: 7,
    section: "circle",
    caps: "round",
    sectors: [
      [125, 235, VIOLET_DARK],
      [-42, 42, MAGENTA],
    ],
  });

  const branchData = [
    {
      name: "branchL1",
      parent: stem.joints[1],
      points: [
        stem.at(0.22).at,
        [0.28, 0.68, 0.015],
        [0.58, 0.86, 0.04],
        [0.83, 1.02, 0.02],
      ],
      radius: [0.065, 0.018],
      side: 1,
    },
    {
      name: "branchR1",
      parent: stem.joints[1],
      points: [
        stem.at(0.24).at,
        [-0.27, 0.64, -0.01],
        [-0.55, 0.78, 0.015],
        [-0.78, 0.94, 0.03],
      ],
      radius: [0.06, 0.016],
      side: -1,
    },
    {
      name: "branchL2",
      parent: stem.joints[3],
      points: [
        stem.at(0.57).at,
        [0.25, 1.28, 0.025],
        [0.52, 1.47, 0.08],
        [0.76, 1.65, 0.1],
      ],
      radius: [0.058, 0.014],
      side: 1,
    },
    {
      name: "branchR2",
      parent: stem.joints[3],
      points: [
        stem.at(0.6).at,
        [-0.25, 1.3, 0.02],
        [-0.48, 1.52, -0.015],
        [-0.72, 1.72, 0.0],
      ],
      radius: [0.055, 0.014],
      side: -1,
    },
    {
      name: "branchBack",
      parent: stem.joints[4],
      points: [
        stem.at(0.75).at,
        [0.0, 1.82, -0.22],
        [0.02, 2.0, -0.43],
      ],
      radius: [0.045, 0.012],
      side: 0,
    },
  ] as const;

  const branches: any[] = [];

  for (const data of branchData) {
    const chain = b.chain(
      data.name,
      catmull(data.points),
      {
        parent: data.parent,
        names: [`${data.name}Base`, `${data.name}Mid`, `${data.name}Tip`],
        role: "arm",
      },
    );
    const tube = b.sweep(chain, data.radius, {
      color: VIOLET,
      sides: 7,
      sectors: [
        [115, 245, VIOLET_DARK],
        [-50, 35, MAGENTA],
      ],
    });
    branches.push({ chain, tube, side: data.side });
  }

  function addOrb(
    at: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    bone?: any,
    strength = 1.5,
  ) {
    const part = b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      flat: true,
    });
    glow(part, strength);
    return part;
  }

  function addLeaf(
    base: THREE.Vector3 | [number, number, number],
    width: number,
    length: number,
    xDir: [number, number, number],
    yDir: [number, number, number],
    color: string,
    bone?: any,
    veinColor = CYAN_DARK,
  ) {
    const outline: [number, number, "sharp"][] = [
      [0, 0, "sharp"],
      [width * 0.34, length * 0.2, "sharp"],
      [width * 0.5, length * 0.58, "sharp"],
      [0, length, "sharp"],
      [-width * 0.5, length * 0.58, "sharp"],
      [-width * 0.34, length * 0.2, "sharp"],
    ];

    const leaf = b.extrude(outline, {
      at: base,
      x: xDir,
      y: yDir,
      thickness: [0.018, 0.006],
      bevel: 0.004,
      color,
      bone,
      name: "alienLeaf",
      group: "foliage",
    });
    glow(leaf, 1.25);

    const bx = new THREE.Vector3(...xDir).normalize();
    const by = new THREE.Vector3(...yDir).normalize();
    const p0 = new THREE.Vector3(
      Array.isArray(base) ? base[0] : base.x,
      Array.isArray(base) ? base[1] : base.y,
      Array.isArray(base) ? base[2] : base.z,
    );
    const p1 = p0.clone().addScaledVector(by, length * 0.92);
    const vein = b.rod(p0, p1, 0.008, {
      color: veinColor,
      bone,
      caps: "round",
      name: "leafVein",
      group: "foliage",
    });
    glow(vein, 2);
    return leaf;
  }

  function addLeafFan(
    base: THREE.Vector3,
    bone: any,
    side: number,
    elevation: number,
    color = CYAN,
  ) {
    const dirs = [
      {
        x: [side * 0.98, 0.0, 0.12] as [number, number, number],
        y: [side * 0.12, elevation + 0.15, 0.2] as [number, number, number],
        w: 0.22,
        l: 0.58,
      },
      {
        x: [side * 0.72, 0.0, 0.58] as [number, number, number],
        y: [side * 0.18, elevation + 0.05, 0.54] as [number, number, number],
        w: 0.2,
        l: 0.5,
      },
      {
        x: [side * 0.72, 0.0, -0.58] as [number, number, number],
        y: [side * 0.15, elevation + 0.25, -0.35] as [number, number, number],
        w: 0.18,
        l: 0.48,
      },
    ];

    for (const d of dirs) {
      addLeaf(base, d.w, d.l, d.x, d.y, color, bone);
    }
  }

  for (const item of branches) {
    const tip = item.chain.tip?.at ?? item.chain.at(1).at;
    addOrb(tip, 0.045, LIME, item.chain.tip, 2.1);
    addLeafFan(tip, item.chain.tip, item.side || 1, 0.55, CYAN);

    const mid = item.chain.at(0.54).at;
    addOrb(mid, 0.026, GOLD, item.chain.at(0.54).bone, 1.7);
  }

  const lowerL = stem.at(0.3).at;
  const lowerR = stem.at(0.37).at;
  addLeafFan(lowerL, stem.at(0.3).bone, 1, 0.38, BLUE);
  addLeafFan(lowerR, stem.at(0.37).bone, -1, 0.42, BLUE);

  const crown = stem.at(0.95).at;
  const crownBone = stem.joints[stem.joints.length - 1];

  addOrb(crown, 0.115, CYAN_DARK, crownBone, 2.2);
  addOrb(new THREE.Vector3(crown.x, crown.y + 0.04, crown.z + 0.015), 0.055, GOLD, crownBone, 3);

  const petalDirections: [number, number, number][] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0.7, 0, 0.72],
    [-0.7, 0, 0.72],
    [0.7, 0, -0.72],
    [-0.7, 0, -0.72],
  ];

  for (let i = 0; i < petalDirections.length; i++) {
    const dir = new THREE.Vector3(...petalDirections[i]).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    const petalBase = crown.clone().addScaledVector(dir, 0.055);
    const petal = b.extrude(
      [
        [-0.065, 0, "sharp"],
        [0.065, 0, "sharp"],
        [0.11, 0.17, "sharp"],
        [0.025, 0.42, "sharp"],
        [-0.035, 0.25, "sharp"],
      ],
      {
        at: petalBase,
        x: side.clone(),
        y: dir.clone().multiplyScalar(0.35).add(new THREE.Vector3(0, 0.94, 0)).normalize(),
        thickness: [0.018, 0.004],
        bevel: 0.004,
        color: i % 2 === 0 ? MAGENTA : CYAN,
        bone: crownBone,
        name: `crownPetal${i}`,
        group: "flower",
      },
    );
    glow(petal, 2.3);

    const filamentStart = crown.clone().addScaledVector(dir, 0.08);
    const filamentEnd = crown
      .clone()
      .addScaledVector(dir, 0.14)
      .add(new THREE.Vector3(0, 0.26, 0));
    const filament = b.rod(filamentStart, filamentEnd, 0.009, {
      color: GOLD,
      bone: crownBone,
      name: `flowerFilament${i}`,
      group: "flower",
    });
    glow(filament, 2.5);
    addOrb(filamentEnd, 0.025, WHITE, crownBone, 3.5);
  }

  const tendrilBases = [
    { p: stem.at(0.43).at, axis: [1, 0.1, 0] as [number, number, number], turns: 1.8 },
    { p: stem.at(0.7).at, axis: [-1, 0.1, 0.2] as [number, number, number], turns: -2.1 },
    { p: branches[2].chain.at(0.72).at, axis: [0.25, -0.15, 1] as [number, number, number], turns: 1.65 },
    { p: branches[3].chain.at(0.72).at, axis: [-0.25, -0.1, 1] as [number, number, number], turns: -1.7 },
  ];

  for (let i = 0; i < tendrilBases.length; i++) {
    const item = tendrilBases[i];
    const start = item.p.clone();
    const direction = new THREE.Vector3(...item.axis).normalize();
    const end = start
      .clone()
      .addScaledVector(direction, 0.42)
      .add(new THREE.Vector3(0, 0.12, 0));
    const coilPath = spiral(
      start,
      start.clone().add(new THREE.Vector3(0.04, 0, 0)),
      end.clone().sub(start),
      { turns: item.turns, r1: 0.008, pitch: 0.035 },
    );
    const tendril = b.sweep(coilPath, [0.014, 0.003], {
      color: CYAN,
      bone: stem.joints[Math.min(i + 1, stem.joints.length - 1)],
      sides: 6,
      caps: { start: "round", end: "point" },
      name: `glowingTendril${i}`,
      group: "tendrils",
    });
    glow(tendril, 2.2);
    addOrb(end, 0.027, LIME, tendril.bone, 2.8);
  }

  const rootColors = [VIOLET_DARK, BLUE, CYAN_DARK];
  const rootRng = rng(44);

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const reach = 0.22 + rootRng() * 0.18;
    const rootStart = new THREE.Vector3(0, 0.1, 0);
    const rootEnd = new THREE.Vector3(
      Math.cos(a) * reach,
      0.035 + rootRng() * 0.018,
      Math.sin(a) * reach,
    );
    const rootPath = catmull([
      rootStart,
      new THREE.Vector3(Math.cos(a) * 0.09, 0.065, Math.sin(a) * 0.09),
      rootEnd,
    ]);
    const rootTube = b.sweep(rootPath, [0.075, 0.018], {
      color: rootColors[i % rootColors.length],
      sides: 6,
      caps: "round",
      name: `rootTentacle${i}`,
      group: "roots",
      bone: root,
    });
    if (i % 2 === 0) glow(rootTube, 0.85);

    addOrb(
      rootEnd.clone().add(new THREE.Vector3(0, 0.018, 0)),
      0.042,
      i % 3 === 0 ? LIME : CYAN,
      root,
      1.7,
    );
  }

  const collar = b.surface(trunk).loop(stem.at(0.3), { lift: 0.006 });
  b.sweep(collar, 0.013, {
    color: MAGENTA,
    caps: "round",
    name: "stemLuminescentCollar",
    group: "ornament",
  });

  for (let i = 0; i < 7; i++) {
    const t = 0.18 + i * 0.095;
    const at = trunk.at(t, i % 2 === 0 ? 35 : -35, 0.002);
    const node = b.stick(
      new THREE.SphereGeometry(0.027 + (i % 3) * 0.006, 7, 5),
      i % 2 ? GOLD : LIME,
      at,
      { embed: 0.18, name: `stemNode${i}`, group: "bioluminescence" },
    );
    glow(node, 2.3);
  }

  const crownHalo = b.ring(
    { at: crown, axis: new THREE.Vector3(0, 1, 0) },
    { count: 10, radius: 0.22, fromDeg: 0, toDeg: 360, tilt: -18, name: "halo", role: "fan" },
  );

  for (let i = 0; i < crownHalo.items.length; i++) {
    const h = crownHalo.items[i];
    const haloOrb = b.stick(
      new THREE.SphereGeometry(0.018 + (i % 3) * 0.004, 6, 4),
      i % 2 ? CYAN : GOLD,
      h,
      { embed: 0.25, name: `haloParticle${i}`, group: "flower" },
    );
    glow(haloOrb, 2.5);
  }

  const floorGlow = b.part(
    new THREE.CylinderGeometry(0.32, 0.38, 0.025, 12),
    SOIL,
    { at: [0, 0.012, 0], bone: root, name: "rootShadow", group: "groundAccent", flat: true },
  );
  glow(floorGlow, 0.25);

  return b.root;
}

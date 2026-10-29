import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, spiral, bezier, frame, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Lumen Bloom",
  "description": "A tall bioluminescent alien plant from Pandora: a pale spiral stalk rising from glowing roots into an arching crown of long leaves and a large translucent bud that lights the model from inside."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  stalk: "#9fd8c2",
  stalkShade: "#6fae96",
  leafTop: "#3f7a5e",
  leafUnder: "#c9e8d4",
  leafEdge: "#2c5846",
  soil: "#2e3140",
  rootBark: "#4a3d52",
  moss: "#3a6b52",
  petalViolet: "#7a4fa8",
  petalDeep: "#4a2d6e",
  budInner: "#f3e6ff",
  glowCyan: "#3ef0e0",
  glowPink: "#ff5ec4",
  glowViolet: "#a86bff",
  stamen: "#e8d8ff",
  beadCore: "#ffffff",
  sheath: "#d8f0e4",
};
const M = {
  groundCenter: [0, 0.02, 0] as [number, number, number],
  stalkBase: [0, 0.12, 0] as [number, number, number],
  stalkMid: [0, 0.95, 0.03] as [number, number, number],
  crownShoulder: [0, 1.7, 0.08] as [number, number, number],
  budBase: [0, 1.82, 0.1] as [number, number, number],
  leafRing: [0, 1.05, 0.04] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // rootMound
  (() => {
function buildRootMound({ b, J, P, M }: Ctx) {
  const R = rng(7319);
  const soil = P.soil;
  const bark = P.rootBark;
  const moss = P.moss;
  const leaf = P.leafUnder;
  const cyan = P.glowCyan;
  const pink = P.glowPink;

  const glowPart = (part: any, strength = 1.7) => {
    glow(part, strength);
    return part;
  };

  // A shallow, low-poly earthen island. The profile is broad enough to fill the
  // requested footprint while keeping its edge sunk naturally into the floor.
  b.lathe(
    [
      [0, 0],
      [0.43, 0],
      [0.50, 0.018],
      [0.49, 0.055],
      [0.42, 0.115],
      [0.30, 0.158],
      [0.15, 0.178],
      [0, 0.182],
    ],
    {
      at: [M.groundCenter[0], 0, M.groundCenter[2]],
      axis: [0, 1, 0],
      segments: 12,
      color: soil,
      bone: J.stalk,
      name: "rootMound.soil",
      group: "rootMound",
    },
  );

  // A darker central collar hides the join between mound, trunk flare and roots.
  b.sweep(
    [
      [0, 0.055, 0],
      [0, 0.105, 0],
      [0, 0.18, 0],
      [0, 0.245, 0],
    ],
    [0.19, 0.145, 0.105, 0.075],
    {
      color: bark,
      bone: J.stalk,
      sides: 8,
      caps: "round",
      name: "rootMound.centralFlare",
      group: "rootMound",
    },
  );

  // Nine thick roots radiate from the flare, swell into knuckles, then dive
  // back into the soil. Alternating root bones give the existing rig useful
  // independent deformation without adding joints.
  const rootCount = 9;
  const rootTips: THREE.Vector3[] = [];
  for (let i = 0; i < rootCount; i++) {
    const a = (i / rootCount) * Math.PI * 2 + 0.14;
    const wobble = (R() - 0.5) * 0.055;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const side = i % 2 === 0 ? J.rootL : J.rootR;

    const start: [number, number, number] = [ca * 0.065, 0.105, sa * 0.065];
    const shoulder: [number, number, number] = [
      ca * (0.19 + wobble),
      0.105 + (R() - 0.5) * 0.018,
      sa * (0.19 + wobble),
    ];
    const knuckle: [number, number, number] = [
      ca * (0.34 + wobble),
      0.105 + (R() - 0.5) * 0.016,
      sa * (0.34 + wobble),
    ];
    const tip: [number, number, number] = [
      ca * (0.46 + wobble),
      0.045 + (R() - 0.5) * 0.012,
      sa * (0.46 + wobble),
    ];
    rootTips.push(new THREE.Vector3(...tip));

    b.sweep([start, shoulder, knuckle, tip], [0.078, 0.095, 0.073, 0.026], {
      color: bark,
      bone: side,
      sides: 7,
      caps: "round",
      name: `rootMound.root${i}`,
      group: "roots",
    });

    // Two broken cyan vein runs sit just above each root's upper ridge.
    const perpX = -sa;
    const perpZ = ca;
    for (let v = 0; v < 2; v++) {
      const offset = (v === 0 ? -1 : 1) * 0.022;
      const lift = 0.074 + v * 0.006;
      const vein: [number, number, number][] = [
        [ca * 0.14 + perpX * offset, 0.145 + lift * 0.18, sa * 0.14 + perpZ * offset],
        [ca * 0.25 + perpX * offset, 0.163 + lift * 0.35, sa * 0.25 + perpZ * offset],
        [ca * 0.35 + perpX * offset, 0.145 + lift * 0.5, sa * 0.35 + perpZ * offset],
      ];
      const veinSweep = b.sweep(vein, [0.0065, 0.005, 0.002], {
        color: cyan,
        bone: side,
        sides: 5,
        caps: "round",
        name: `rootMound.vein${i}_${v}`,
        group: "rootGlow",
      });
      glowPart(veinSweep, 2.4);
    }

    // A tiny terminal lamp makes every root legible in the silhouette.
    const bead = b.part(new THREE.SphereGeometry(0.022, 8, 5), cyan, {
      at: [tip[0], tip[1] + 0.018, tip[2]],
      bone: side,
      name: `rootMound.rootBead${i}`,
      group: "rootGlow",
    });
    glowPart(bead, 3.1);

    const beadHighlight = b.part(new THREE.SphereGeometry(0.006, 6, 4), "#ffffff", {
      at: [tip[0] - ca * 0.008, tip[1] + 0.034, tip[2] - sa * 0.008],
      bone: side,
      name: `rootMound.rootBeadHighlight${i}`,
      group: "rootGlow",
    });
    glowPart(beadHighlight, 2.5);
  }

  // Moss islands break up the soil around each root junction.
  for (let i = 0; i < rootCount; i++) {
    const t = 0.18 + (i % 3) * 0.025;
    const p = rootTips[i].clone().multiplyScalar(t / 0.46);
    const patch = b.part(new THREE.CylinderGeometry(0.055 + (i % 2) * 0.014, 0.065, 0.008, 7), moss, {
      at: [p.x, 0.183, p.z],
      bone: J.stalk,
      name: `rootMound.moss${i}`,
      group: "moss",
    });
    // A few small moss lights, kept sparse so the cyan veins remain the focus.
    if (i % 2 === 0) {
      const mossLight = b.part(new THREE.SphereGeometry(0.008, 6, 4), cyan, {
        at: [p.x + 0.018, 0.191, p.z - 0.012],
        bone: J.stalk,
        name: `rootMound.mossLight${i}`,
        group: "rootGlow",
      });
      glowPart(mossLight, 1.4);
    }
    void patch;
  }

  // Eight tiny alien sprouts occupy the gaps between the large roots.
  const sproutCount = 8;
  const leafOutline: [number, number, "sharp"][] = [
    [0, 0, "sharp"],
    [0.025, 0.028],
    [0.020, 0.075],
    [0, 0.112, "sharp"],
    [-0.020, 0.075],
    [-0.025, 0.028],
  ];

  for (let i = 0; i < sproutCount; i++) {
    const a = (i / sproutCount) * Math.PI * 2 + Math.PI / 9;
    const rr = 0.22 + (i % 3) * 0.055;
    const x = Math.cos(a) * rr;
    const z = Math.sin(a) * rr;
    const h = 0.085 + (i % 4) * 0.018;
    const sproutBone = i % 2 === 0 ? J.rootL : J.rootR;

    b.sweep(
      [
        [x, 0.17, z],
        [x + Math.cos(a) * 0.012, 0.17 + h * 0.55, z + Math.sin(a) * 0.012],
        [x + Math.cos(a) * 0.018, 0.17 + h, z + Math.sin(a) * 0.018],
      ],
      [0.014, 0.010, 0.004],
      {
        color: moss,
        bone: sproutBone,
        sides: 6,
        caps: "round",
        name: `rootMound.sproutStem${i}`,
        group: "groundSprouts",
      },
    );

    const topX = x + Math.cos(a) * 0.018;
    const topY = 0.17 + h;
    const topZ = z + Math.sin(a) * 0.018;

    for (let l = 0; l < 3; l++) {
      const side = l === 0 ? -1 : l === 1 ? 1 : (i % 2 ? -1 : 1);
      const lean = 0.035 + l * 0.009;
      const base: [number, number, number] = [
        topX + side * 0.006,
        topY - 0.008 + l * 0.006,
        topZ,
      ];
      const leafPart = b.extrude(leafOutline, {
        at: base,
        x: [side, 0, 0],
        y: [0.08 * side, 1, 0.05],
        thickness: 0.006,
        bevel: 0.002,
        smoothing: 1,
        color: leaf,
        bone: sproutBone,
        name: `rootMound.sproutLeaf${i}_${l}`,
        group: "groundSprouts",
      });

      const tip = leafPart.local([0, 0.112, 0]);
      const tipLight = b.part(new THREE.SphereGeometry(0.009, 7, 4), pink, {
        at: tip,
        bone: sproutBone,
        name: `rootMound.sproutTip${i}_${l}`,
        group: "rootGlow",
      });
      glowPart(tipLight, 2.6);

      // A small cyan midrib gives the leaf a recognizable internal structure.
      const midrib = b.sweep(
        [
          base,
          [
            base[0] + side * lean * 0.55,
            base[1] + 0.045,
            base[2] + 0.004,
          ],
          [tip.x, tip.y, tip.z],
        ],
        [0.0028, 0.002, 0.0005],
        {
          color: cyan,
          bone: sproutBone,
          sides: 4,
          caps: "round",
          name: `rootMound.sproutVein${i}_${l}`,
          group: "rootGlow",
        },
      );
      glowPart(midrib, 1.8);
    }
  }

  // A few low cyan pinpricks around the central flare visually tie the mound
  // into the luminous stalk that another builder supplies.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const p = [Math.cos(a) * 0.16, 0.205, Math.sin(a) * 0.16] as [number, number, number];
    const pin = b.part(new THREE.SphereGeometry(0.012, 7, 4), cyan, {
      at: p,
      bone: J.stalk,
      name: `rootMound.flarePin${i}`,
      group: "rootGlow",
    });
    glowPart(pin, 2.0);
  }
}
    return buildRootMound;
  })(),
  // stalkTrunk
  (() => {
function buildStalkTrunk({ b, J, P, M }: Ctx) {
  const stalkPath = catmull([
    [0, 0.12, 0],
    [0, 0.38, 0.008],
    [0, 0.72, 0.018],
    [0.005, 1.04, 0.032],
    [0.018, 1.34, 0.052],
    [0.035, 1.58, 0.07],
    [0.05, 1.70, 0.08],
  ]);

  const stalk = b.sweep(stalkPath, (t: number) => {
    if (t < 0.08) return 0.135 - t * 0.25;
    return 0.112 - t * 0.061;
  }, {
    bone: [J.stalk, J.stalkNeck],
    color: P.stalk,
    section: { ngon: 8 },
    sides: 8,
    caps: "round",
    sectors: [
      [52, 128, P.stalkShade],
      [232, 308, P.stalkShade],
    ],
    name: "stalkTrunk.main",
    group: "stalkTrunk",
  });

  const stemPoint = (y: number) => {
    const t = Math.max(0, Math.min(1, (y - 0.12) / 1.58));
    return stalkPath.at(t);
  };

  const addTorus = (
    name: string,
    at: THREE.Vector3,
    major: number,
    minor: number,
    color: string,
    bone: any,
    emissive = false,
  ) => {
    const part = b.part(
      new THREE.TorusGeometry(major, minor, 6, 14),
      color,
      {
        at,
        bone,
        rotation: [Math.PI / 2, 0, 0],
        flat: true,
        name,
        group: "stalkTrunk",
      },
    );
    if (emissive) glow(part, 1.8);
    return part;
  };

  const addStud = (
    name: string,
    at: THREE.Vector3,
    radius: number,
    color: string,
    bone: any,
  ) => {
    const part = b.part(
      new THREE.SphereGeometry(radius, 7, 5),
      color,
      {
        at,
        bone,
        flat: true,
        name,
        group: "stalkTrunk.glow",
      },
    );
    glow(part, 2.2);
    return part;
  };

  // A squat basal flare merges visually into the root mound.
  b.sweep(
    catmull([
      [0, 0.105, 0],
      [0, 0.12, 0],
      [0, 0.18, 0.004],
      [0, 0.25, 0.008],
    ]),
    [0.16, 0.105],
    {
      bone: J.stalk,
      color: P.stalkShade,
      section: { ngon: 8 },
      caps: "round",
      name: "stalkTrunk.baseFlare",
      group: "stalkTrunk",
    },
  );

  // Five broad collar sheaths, each with a separate luminous lower rim and a pink vein node.
  const collarYs = [0. thirty as any];
}
    return buildStalkTrunk;
  })(),
  // leafCrown
  (() => {
function buildLeafCrown({ b, J, P, M }: Ctx) {
  const LEAF_TOP = P.leafTop;
  const LEAF_UNDER = P.leafUnder;
  const LEAF_EDGE = P.leafEdge;
  const STALK_SHADE = P.stalkShade;
  const SHEATH = P.sheath;
  const CYAN = P.glowCyan;
  const PINK = P.glowPink;
  const VIOLET = P.glowViolet;
  const STAMEN = P.stamen;

  const rand = rng(417);
  const v = (p: [number, number, number]) => new THREE.Vector3(p[0], p[1], p[2]);
  const norm = (p: THREE.Vector3) => p.clone().normalize();
  const add = (a: THREE.Vector3, b: THREE.Vector3) => a.clone().add(b);
  const scale = (a: THREE.Vector3, n: number) => a.clone().multiplyScalar(n);

  type LeafSpec = {
    name: string;
    root: [number, number, number];
    shoulder: [number, number, number];
    end: [number, number, number];
    width: number;
    length: number;
    bone: any;
  };

  const specs: LeafSpec[] = [
    {
      name: "A",
      root: [0.14, 1.15, 0.06],
      shoulder: [0.25, 1.13, 0.24],
      end: [0.47, 0.84, 0.48],
      width: 0.21,
      length: 0.68,
      bone: J.stemA,
    },
    {
      name: "B",
      root: [-0.14, 1.15, 0.06],
      shoulder: [-0.25, 1.13, 0.24],
      end: [-0.47, 0.84, 0.48],
      width: 0.21,
      length: 0.68,
      bone: J.stemB,
    },
    {
      name: "C",
      root: [0.16, 1.3, -0.02],
      shoulder: [0.34, 1.23, -0.03],
      end: [0.66, 0.91, -0.08],
      width: 0.19,
      length: 0.62,
      bone: J.stemC,
    },
    {
      name: "D",
      root: [-0.16, 1.3, -0.02],
      shoulder: [-0.34, 1.23, -0.03],
      end: [-0.66, 0.91, -0.08],
      width: 0.19,
      length: 0.62,
      bone: J.stemD,
    },
    {
      name: "E",
      root: [0.1, 1.42, -0.08],
      shoulder: [0.18, 1.42, -0.27],
      end: [0.31, 1.11, -0.56],
      width: 0.18,
      length: 0.58,
      bone: J.stemE,
    },
    {
      name: "F",
      root: [-0.1, 1.42, -0.08],
      shoulder: [-0.18, 1.42, -0.27],
      end: [-0.31, 1.11, -0.56],
      width: 0.18,
      length: 0.58,
      bone: J.stemF,
    },
  ];

  function glowingPart(
    geometry: THREE.BufferGeometry,
    color: string,
    options: Record<string, any>,
    strength = 1.5,
  ) {
    return glow(b.part(geometry, color, options), strength);
  }

  function makeLeaf(spec: LeafSpec, index: number) {
    const root = v(spec.end);
    const outward = norm(new THREE.Vector3(spec.end[0], -0.16, spec.end[2]));
    const forward = norm(new THREE.Vector3(spec.end[0] * 0.3, -0.15, spec.end[2] + (spec.end[2] > 0 ? 0.22 : -0.18)));
    const along = norm(outward.clone().multiplyScalar(0.72).add(forward.clone().multiplyScalar(0.55)));
    const tip = root.clone().addScaledVector(along, spec.length);
    const side = norm(new THREE.Vector3(-along.z, 0, along.x));
    const down = new THREE.Vector3(0, -1, 0);
    const normal = norm(side.clone().cross(along));

    const w = spec.width;
    const L = spec.length;
    const outline: [number, number][] = [
      [0, 0],
      [w * 0.42, L * 0.18],
      [w * 0.5, L * 0.42],
      [w * 0.34, L * 0.7],
      [0.035 * w, L],
      [-w * 0.34, L * 0.7],
      [-w * 0.5, L * 0.42],
      [-w * 0.42, L * 0.18],
    ];

    const leaf = b.extrude(outline, {
      at: root,
      x: side,
      y: along,
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 1,
      color: LEAF_TOP,
      bone: spec.bone,
      name: `leafCrownLeaf${spec.name}`,
      group: "leafCrown",
    });

    const undersideOutline: [number, number][] = outline.map(([x, y]) => [
      x * 0.96,
      y * 0.97,
    ]);
    b.extrude(undersideOutline, {
      at: root.clone().addScaledVector(normal, -0.012),
      x: side,
      y: along,
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      color: LEAF_UNDER,
      bone: spec.bone,
      name: `leafCrownUnder${spec.name}`,
      group: "leafCrown",
    });

    for (let i = 0; i < outline.length; i++) {
      const a = outline[i];
      const z = outline[(i + 1) % outline.length];
      const pa = root
        .clone()
        .addScaledVector(side, a[0])
        .addScaledVector(along, a[1])
        .addScaledVector(normal, 0.018);
      const pz = root
        .clone()
        .addScaledVector(side, z[0])
        .addScaledVector(along, z[1])
        .addScaledVector(normal, 0.018);
      b.rod(pa, pz, 0.006, {
        color: LEAF_EDGE,
        bone: spec.bone,
        caps: "flat",
        name: `leafCrownRim${spec.name}${i}`,
        group: "leafCrown",
      });
    }

    const midrib = root.clone().addScaledVector(normal, 0.026);
    for (let i = 1; i <= 6; i++) {
      const t = i / 7;
      const p = midrib
        .clone()
        .addScaledVector(along, L * t)
        .addScaledVector(side, Math.sin(t * Math.PI) * w * 0.035);
      const vein = glowingPart(
        new THREE.CylinderGeometry(0.011, 0.011, 0.007, 8),
        CYAN,
        {
          at: p,
          dir: normal,
          bone: spec.bone,
          name: `leafCrownVein${spec.name}${i}`,
          group: "leafGlow",
        },
        2.2,
      );
      void vein;

      if (i >= 3) {
        const q = p
          .clone()
          .addScaledVector(side, i % 2 ? w * 0.24 : -w * 0.24)
          .addScaledVector(along, 0.015);
        glowingPart(
          new THREE.SphereGeometry(0.010, 7, 5),
          CYAN,
          {
            at: q,
            bone: spec.bone,
            name: `leafCrownBranch${spec.name}${i}`,
            group: "leafGlow",
          },
          2.0,
        );
      }
    }

    for (let i = 0; i < 4; i++) {
      const t = 0.62 + i * 0.085;
      const q = root
        .clone()
        .addScaledVector(along, L * t)
        .addScaledVector(side, (i % 2 ? -1 : 1) * w * (0.22 + i * 0.035))
        .addScaledVector(normal, 0.025);
      glowingPart(
        new THREE.SphereGeometry(0.014 - i * 0.0012, 7, 5),
        PINK,
        {
          at: q,
          bone: spec.bone,
          name: `leafCrownTipBead${spec.name}${i}`,
          group: "leafGlow",
        },
        2.4,
      );
    }

    return { root, along, side, normal, tip };
  }

  for (let i = 0; i < specs.length; i++) {
    const s = specs[i];
    const stemPath = catmull(
      [
        s.root,
        s.shoulder,
        [
          s.end[0] * 0.72,
          s.end[1] + (s.name === "E" || s.name === "F" ? 0.04 : 0.02),
          s.end[2] * 0.72,
        ],
        s.end,
      ],
      { tension: 0.22 },
    );

    b.sweep(stemPath, (t) => 0.031 * (1 - t) + 0.015 * t, {
      color: LEAF_TOP,
      bone: s.bone,
      sides: 7,
      caps: "round",
      sectors: [[-42, 42, STALK_SHADE]],
      name: `leafCrownStem${s.name}`,
      group: "leafCrown",
    });

    const socket = b.part(
      new THREE.ConeGeometry(0.055, 0.075, 7),
      SHEATH,
      {
        at: v(s.root).add(new THREE.Vector3(0, -0.005, 0)),
        dir: norm(v(s.shoulder).sub(v(s.root))),
        bone: s.bone,
        name: `leafCrownSocket${s.name}`,
        group: "leafCrown",
      },
    );
    void socket;

    const leaf = makeLeaf(s, i);

    const start = v(s.root).add(new THREE.Vector3(0, 0.015, 0));
    const tangent = norm(v(s.shoulder).sub(v(s.root)));
    const axis = new THREE.Vector3(0, 1, 0);
    const spiralStart = start.clone().addScaledVector(
      new THREE.Vector3(-tangent.z, 0, tangent.x).normalize(),
      0.014,
    );
    const coilPath = spiral(start, spiralStart, axis, {
      turns: i % 2 ? -1.15 : 1.15,
      r1: 0.008,
      pitch: 0.075,
    });

    b.sweep(coilPath, [0.008, 0.003], {
      color: LEAF_EDGE,
      bone: s.bone,
      sides: 6,
      caps: "round",
      name: `leafCrownTendril${s.name}`,
      group: "tendrils",
    });

    const tendrilTip = coilPath.at(1);
    glowingPart(
      new THREE.SphereGeometry(0.018, 8, 6),
      VIOLET,
      {
        at: tendrilTip,
        bone: s.bone,
        name: `leafCrownTendrilBead${s.name}`,
        group: "leafGlow",
      },
      2.5,
    );

    if (i % 2 === 0) {
      const socketGlowAt = v(s.root)
        .addScaledVector(tangent, 0.045)
        .add(new THREE.Vector3(0, 0.012, 0));
      glowingPart(
        new THREE.SphereGeometry(0.009, 7, 5),
        CYAN,
        {
          at: socketGlowAt,
          bone: s.bone,
          name: `leafCrownSocketLight${s.name}`,
          group: "leafGlow",
        },
        2.1,
      );
    }

    void leaf;
  }
}
    return buildLeafCrown;
  })(),
  // glowBud
  (() => {
function buildGlowBud({ b, J, P, M }: Ctx) {
  const bud = J.bud;
  const jaw = J.jaw;

  const C = {
    violet: P.petalViolet,
    deep: P.petalDeep,
    inner: P.budInner,
    pink: P.glowPink,
    cyan: P.glowCyan,
    purple: P.glowViolet,
    stamen: P.stamen,
    white: P.beadCore,
    edge: P.leafEdge,
  };

  const center = new THREE.Vector3(...M.budBase);
  const UP = new THREE.Vector3(0, 1, 0);
  const FRONT = new THREE.Vector3(0, 0, 1);

  const radial = (a: number, r: number, y: number) =>
    new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r).add(center);

  const tangent = (a: number) =>
    new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)).normalize();

  const outward = (a: number) =>
    new THREE.Vector3(Math.sin(a), 0, Math.cos(a)).normalize();

  const glowPart = <T>(part: T, strength = 1.7): T => {
    glow(part as any, strength);
    return part;
  };

  const glowSweep = (sweep: any, strength = 1.7) => {
    glow(sweep as any, strength);
    return sweep;
  };

  // A small dark-violet calyx collar receives the six wax petals.
  const calyx = b.lathe(
    [
      [0, 0],
      [0.075, 0],
      [0.125, 0.035],
      [0.14, 0.075],
      [0.115, 0.13],
      [0.082, 0.17],
      [0, 0.19],
    ],
    {
      at: center.clone().add(new THREE.Vector3(0, -0.025, 0)),
      axis: [0, 1, 0],
      segments: 12,
      smoothing: 1,
      color: C.deep,
      bone: bud,
      name: "glowBudCalyx",
      group: "glowBud",
    },
  );

  // Six overlapping tulip petals. Each is a broad, thick, faceted shell
  // standing in a radial plane, with a raised outer face.
  const petalOutline: [number, number, "sharp"?][] = [
    [-0.018, 0],
    [-0.064, 0.045],
    [-0.095, 0.18],
    [-0.088, 0.31],
    [-0.056, 0.405],
    [0, 0.445, "sharp"],
    [0.056, 0.405],
    [0.088, 0.31],
    [0.095, 0.18],
    [0.064, 0.045],
    [0.018, 0],
  ];

  const petalAngles: number[] = [];
  for (let i = 0; i < 6; i++) petalAngles.push((i * Math.PI) / 3);

  for (let i = 0; i < petalAngles.length; i++) {
    const a = petalAngles[i];
    const r = outward(a);
    const t = tangent(a);
    const base = center.clone().addScaledVector(r, 0.066);
    base.y -= 0.005;

    const petal = b.extrude(petalOutline, {
      at: base,
      x: t,
      y: [0, 1, 0],
      thickness: [0.026, 0.042],
      bevel: 0.008,
      smoothing: 1,
      color: C.violet,
      bone: bud,
      name: `glowBudPetal${i + 1}`,
      group: "petals",
    });

    // Slightly irregular upper tips make the closed flower read as organic.
    const tipLift = i % 2 === 0 ? 0.008 : -0.004;
    const rimY = center.y + 0.445 + tipLift;
    const rimR = 0.112 + (i % 3) * 0.006;

    // Cream light leak along the upper lip of each petal.
    const rimA = radial(a, rimR, rimY - 0.012);
    const rimB = radial(a - 0.27, rimR + 0.006, rimY - 0.026);
    const rimC = radial(a + 0.27, rimR + 0.006, rimY - 0.026);
    const rim = glowSweep(
      b.sweep(
        bezier(rimB, rimA.clone().addScaledVector(UP, 0.018), rimA.clone().addScaledVector(UP, 0.018), rimC),
        [0.012, 0.006],
        {
          color: C.inner,
          bone: bud,
          caps: "round",
          name: `glowBudCreamRim${i + 1}`,
          group: "rims",
        },
      ),
      2.4,
    );

    // Dark vertical crease between neighboring petals.
    const seamBase = center.clone().addScaledVector(outward(a + Math.PI / 6), 0.119);
    seamBase.y = center.y + 0.015;
    const seamTip = seamBase.clone().addScaledVector(UP, 0.385);
    b.sweep(
      bezier(
        seamBase,
        seamBase.clone().add(new THREE.Vector3(0, 0.12, 0)),
        seamTip.clone().add(new THREE.Vector3(0, -0.08, 0)),
        seamTip,
      ),
      [0.009, 0.004],
      {
        color: C.deep,
        bone: bud,
        caps: "round",
        name: `glowBudCrease${i + 1}`,
        group: "creases",
      },
    );

    // Three branching magenta veins on the petal's outward face.
    const veinBaseR = 0.113;
    for (let v = 0; v < 3; v++) {
      const side = v - 1;
      const y0 = center.y + 0.10 + v * 0.055;
      const x0 = side * 0.018;
      const p0 = radial(a, veinBaseR, y0).addScaledVector(t, x0);
      const p1 = radial(a, veinBaseR + 0.006, y0 + 0.075).addScaledVector(t, x0 * 0.6);
      const p2 = radial(a, veinBaseR + 0.009, y0 + 0.17).addScaledVector(t, x0 * 0.18);
      const p3 = radial(a, veinBaseR + 0.007, y0 + 0.255).addScaledVector(t, -x0 * 0.35);

      glowSweep(
        b.sweep(bezier(p0, p1, p2, p3), [0.0055, 0.0022], {
          color: C.pink,
          bone: bud,
          caps: "round",
          name: `glowBudPetal${i + 1}Vein${v + 1}`,
          group: "veins",
        }),
        2.8,
      );

      // Tiny branch toward one side of the main vein.
      if (v !== 1) {
        const branchStart = p2;
        const branchEnd = radial(a, veinBaseR + 0.011, y0 + 0.215).addScaledVector(
          t,
          side * 0.045,
        );
        glowSweep(
          b.rod(branchStart, branchEnd, 0.003, {
            color: C.pink,
            bone: bud,
            caps: "round",
            name: `glowBudBranch${i + 1}_${v + 1}`,
            group: "veins",
          }),
          2.4,
        );
      }
    }

    // Bright dots punctuate the bottom of each petal's vein.
    for (let d = 0; d < 2; d++) {
      const dotAt = radial(a, 0.121, center.y + 0.105 + d * 0.085).addScaledVector(
        t,
        d === 0 ? -0.024 : 0.024,
      );
      glowPart(
        b.part(new THREE.SphereGeometry(0.009, 8, 5), C.pink, {
          at: dotAt,
          bone: bud,
          name: `glowBudPetalDot${i + 1}_${d + 1}`,
          group: "veins",
        }),
        2.8,
      );
    }
  }

  // Six inner cream petals are set farther forward and slightly higher,
  // creating a readable 20-degree opening instead of a solid cap.
  const innerOutline: [number, number, "sharp"?][] = [
    [-0.012, 0],
    [-0.046, 0.05],
    [-0.065, 0.16],
    [-0.045, 0.29],
    [0, 0.355, "sharp"],
    [0.045, 0.29],
    [0.065, 0.16],
    [0.046, 0.05],
    [0.012, 0],
  ];

  for (let i = 0; i < 6; i++) {
    const a = petalAngles[i] + Math.PI / 6;
    const r = outward(a);
    const t = tangent(a);
    const innerAt = center.clone().addScaledVector(r, 0.105);
    innerAt.y = center.y + 0.11;

    const inner = b.extrude(innerOutline, {
      at: innerAt,
      x: t,
      y: [0, 1, 0],
      thickness: [0.012, 0.022],
      bevel: 0.004,
      smoothing: 1,
      color: C.inner,
      bone: jaw,
      name: `glowBudInnerPetal${i + 1}`,
      group: "innerPetals",
    });

    // Thin violet shadow at each inner petal fold.
    const foldA = radial(a + 0.11, 0.124, center.y + 0.15);
    const foldB = radial(a + 0.11, 0.124, center.y + 0.39);
    b.rod(foldA, foldB, 0.004, {
      color: C.deep,
      bone: jaw,
      caps: "round",
      name: `glowBudInnerFold${i + 1}`,
      group: "innerPetals",
    });
  }

  // A broken cream mouth ring reinforces the open flower silhouette.
  for (let i = 0; i < 5; i++) {
    const a0 = -1.04 + (i * 2.08) / 5;
    const a1 = a0 + 0.28;
    const points: THREE.Vector3[] = [];
    for (let k = 0; k <= 4; k++) {
      const a = a0 + ((a1 - a0) * k) / 4;
      points.push(radial(a, 0.142, center.y + 0.435 + 0.012 * Math.cos(a * 3)));
    }
    glowSweep(
      b.sweep(polyline(points), 0.007, {
        color: C.inner,
        bone: jaw,
        caps: "round",
        name: `glowBudMouthBand${i + 1}`,
        group: "mouth",
      }),
      2.7,
    );
  }

  // Eleven stamens emerge through the opening. The central three are taller
  // and pink; the remainder carry cyan anthers.
  const stamenCount = 11;
  for (let i = 0; i < stamenCount; i++) {
    const u = i / (stamenCount - 1);
    const x = (u - 0.5) * 0.23;
    const central = i === 5 || i === 4 || i === 6;
    const z = 0.24 + 0.035 * Math.cos(i * 1.7);
    const y = center.y + 0.39;
    const start = center.clone().add(new THREE.Vector3(x * 0.42, 0.01, z));
    const end = center.clone().add(
      new THREE.Vector3(
        x * (central ? 1.42 : 1.18),
        central ? 0.78 : 0.65 + 0.035 * Math.sin(i * 1.3),
        z + 0.08 + 0.025 * Math.cos(i),
      ),
    );

    const control1 = start.clone().add(new THREE.Vector3(x * 0.3, 0.12, 0.015));
    const control2 = end.clone().add(new THREE.Vector3(-x * 0.18, -0.13, -0.015));

    glowSweep(
      b.sweep(bezier(start, control1, control2, end), [0.006, 0.0025], {
        color: C.stamen,
        bone: jaw,
        caps: "round",
        name: `glowBudStamen${i + 1}`,
        group: "stamens",
      }),
      1.55,
    );

    const antherColor = central ? C.pink : C.cyan;
    const antherTip = end.clone().add(new THREE.Vector3(0, 0.045, 0));
    glowSweep(
      b.spike(end, [0, 1, 0], 0.052, 0.016, {
        color: antherColor,
        bone: jaw,
        caps: "point",
        name: `glowBudAnther${i + 1}`,
        group: "anthers",
      }),
      2.8,
    );

    glowPart(
      b.part(new THREE.SphereGeometry(0.0065, 7, 5), C.white, {
        at: antherTip.clone().add(new THREE.Vector3(0, 0.006, 0.012)),
        bone: jaw,
        name: `glowBudAntherHighlight${i + 1}`,
        group: "anthers",
      }),
      3.2,
    );
  }

  // Five curling tendrils coil around the calyx and finish in violet beads.
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + 0.25;
    const r = outward(a);
    const start = center
      .clone()
      .addScaledVector(r, 0.115)
      .add(new THREE.Vector3(0, 0.12 + i * 0.018, 0));

    const axis = new THREE.Vector3(0, 1, 0);
    const from = start.clone().addScaledVector(r, 0.035);
    const curl = spiral(start, from, axis, {
      turns: i % 2 === 0 ? 0.72 : -0.68,
      r1: 0.14 + (i % 2) * 0.025,
      pitch: 0.075,
    });

    const tendril = b.sweep(curl, [0.008, 0.002], {
      color: C.deep,
      bone: bud,
      caps: "round",
      name: `glowBudTendril${i + 1}`,
      group: "tendrils",
    });

    const tip = curl.at(1);
    glowPart(
      b.part(new THREE.SphereGeometry(0.018, 9, 6), C.purple, {
        at: tip,
        bone: bud,
        name: `glowBudTendrilBead${i + 1}`,
        group: "tendrils",
      }),
      3.0,
    );

    glowPart(
      b.part(new THREE.SphereGeometry(0.006, 7, 5), C.white, {
        at: tip.clone().add(new THREE.Vector3(0, 0.012, 0.008)),
        bone: bud,
        name: `glowBudTendrilHighlight${i + 1}`,
        group: "tendrils",
      }),
      3.2,
    );
  }
}
    return buildGlowBud;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "lumenBloom" });
  const J: Record<string, Joint> = {};
  J["stalk"] = b.joint("stalk", { at: [0,0.12,0], dir: [0,1,0], role: "spine" });
  J["stalkNeck"] = b.joint("stalkNeck", { parent: J["stalk"], at: [0,1,0.03], dir: [0.05,1,0.08], role: "neck" });
  J["bud"] = b.joint("bud", { parent: J["stalkNeck"], at: [0,1.82,0.1], dir: [0.05,1,0.08], role: "head" });
  J["jaw"] = b.joint("jaw", { parent: J["bud"], at: [0,2.02,0.12], dir: [0.05,1,0.08], role: "jaw" });
  J["stemA"] = b.joint("stemA", { parent: J["stalkNeck"], at: [0.14,1.15,0.06], dir: [0.6,0.35,0.7], role: "arm", group: "stems" });
  J["stemB"] = b.joint("stemB", { parent: J["stalkNeck"], at: [-0.14,1.15,0.06], dir: [-0.6,0.35,0.7], role: "arm", group: "stems" });
  J["stemC"] = b.joint("stemC", { parent: J["stalkNeck"], at: [0.16,1.3,-0.02], dir: [0.95,0.3,-0.1], role: "arm", group: "stems" });
  J["stemD"] = b.joint("stemD", { parent: J["stalkNeck"], at: [-0.16,1.3,-0.02], dir: [-0.95,0.3,-0.1], role: "arm", group: "stems" });
  J["stemE"] = b.joint("stemE", { parent: J["stalkNeck"], at: [0.1,1.42,-0.08], dir: [0.4,0.55,-0.85], role: "arm", group: "stems" });
  J["stemF"] = b.joint("stemF", { parent: J["stalkNeck"], at: [-0.1,1.42,-0.08], dir: [-0.4,0.55,-0.85], role: "arm", group: "stems" });
  J["rootL"] = b.joint("rootL", { parent: J["stalk"], at: [0.12,0.15,0.02], dir: [0.8,-0.3,0.3], role: "leg", group: "roots" });
  J["rootR"] = b.joint("rootR", { parent: J["stalk"], at: [-0.12,0.15,0.02], dir: [-0.8,-0.3,0.3], role: "leg", group: "roots" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}

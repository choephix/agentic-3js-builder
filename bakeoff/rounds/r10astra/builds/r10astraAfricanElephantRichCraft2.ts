import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  rng,
  paint,
  noise,
  mix,
  grain,
  mottle,
  svg,
} from "../../../../src/index";
import type { Joint, Fill, PointInput } from "../../../../src/index";

export const meta = {
  name: "Savanna Monarch",
  description:
    "An adult African bush elephant in a neutral standing pose: broad African-shaped ears, a long articulated trunk, sweeping ivory tusks, dusty faceted skin, and a small sun-baked savanna setting.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "savannaMonarch", paintSize: 2048 });
  const random = rng(78103);

  const C = {
    skin: "#777e7b",
    light: "#93978a",
    shadow: "#555f60",
    crease: "#505957",
    creaseSoft: "#666d66",
    lip: "#424b49",
    earEdge: "#72766d",
    earWarm: "#8c8178",
    ivory: "#e8dec0",
    nail: "#a4a18d",
    hair: "#393d36",
    earth: "#ae8755",
    earthSide: "#806346",
    dryGrass: "#b5a06a",
    grassLight: "#d6bc7e",
    grassDark: "#827a4e",
  };

  // Dust settles on the legs, while the back is sun-bleached and warm.
  const skin = paint((p, n) => {
    const variation = noise(p, 0.36, 17);
    let color = mix(C.shadow, C.light, 0.38 + variation * 0.35 + n.y * 0.12);
    const fine = noise(p, 0.025, 45);
    color = mix(color, "#b0ac98", Math.max(0, fine - 0.54) * 0.22);
    const dust = Math.max(0, 1 - (p.y - 0.15) / 0.86);
    return mix(color, "#aa9978", dust * 0.43);
  });

  const earSkin = paint((p, n) => {
    const warm = noise(p, 0.25, 31);
    return mix(
      mix("#6f7773", "#a29583", warm * 0.64),
      "#b0a28b",
      Math.max(0, n.y) * 0.14,
    );
  });

  const ivory = grain("#c6bda0", "#efe6cb", {
    size: 0.045,
    axis: "z",
    seed: 20,
  });
  const nailPaint = mottle("#878b7b", "#b9b29b", {
    size: 0.11,
    seed: 12,
  });
  const earth = paint((p, n) => {
    const broad = noise(p, 0.65, 72);
    const speckle = noise(p, 0.055, 15);
    return mix(
      n.y > 0.4 ? "#ad8857" : "#765b40",
      n.y > 0.4 ? "#c1a16b" : "#987747",
      broad * 0.65 + speckle * 0.25,
    );
  });

  const eyeDrawing = svg(
    `<svg viewBox="0 0 160 100">
      <path d="M8 54 Q32 15 78 19 Q127 17 153 49
               Q122 80 80 80 Q35 80 8 54Z"
            fill="#333c39" stroke="#727a70" stroke-width="6"/>
      <path d="M25 51 Q52 31 82 33 Q117 33 137 50
               Q115 68 81 68 Q48 68 25 51Z" fill="#807b5d"/>
      <ellipse cx="83" cy="50" rx="22" ry="22" fill="#6e5834"/>
      <ellipse cx="83" cy="52" rx="14" ry="19" fill="#202b29"/>
      <path d="M28 45 Q77 17 136 46" fill="none"
            stroke="#38413e" stroke-width="9" stroke-linecap="round"/>
      <circle cx="76" cy="42" r="5.5" fill="#f1ebd3"/>
      <circle cx="91" cy="59" r="2" fill="#bbbda7"/>
      <path d="M32 73 Q81 91 133 68" fill="none"
            stroke="#a4a18d" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const earDrawing = svg(
    `<svg viewBox="0 0 240 340">
      <g fill="none" stroke-linecap="round">
        <path d="M27 147 Q85 105 154 46
                 M29 151 Q108 142 206 111
                 M27 157 Q106 175 213 190
                 M30 164 Q95 225 168 283
                 M30 170 Q57 248 84 315"
              stroke="#575f59" stroke-width="4" opacity=".34"/>
        <path d="M47 135 Q61 91 83 54
                 M84 108 Q107 94 143 91
                 M119 146 Q135 119 151 101
                 M152 136 Q179 142 199 152
                 M94 176 Q116 203 119 239
                 M144 182 Q168 165 191 168
                 M81 215 Q72 250 65 273
                 M122 247 Q147 245 173 254"
              stroke="#5a625b" stroke-width="2.5" opacity=".3"/>
        <path d="M43 145 Q104 117 159 63
                 M42 163 Q121 180 194 187
                 M43 176 Q82 226 149 282"
              stroke="#c0af94" stroke-width="3" opacity=".3"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const skinDrawing = svg(
    `<svg viewBox="0 0 240 180">
      <g fill="none" stroke="#4f5b56" stroke-width="3"
         stroke-linecap="round" opacity=".45">
        <path d="M17 28 Q85 43 139 21 M33 53 Q104 67 207 38"/>
        <path d="M9 78 Q100 99 227 65 M26 109 Q133 123 212 94"/>
        <path d="M48 139 Q119 154 194 132 M81 164 Q137 170 171 157"/>
      </g>
      <g fill="none" stroke="#afb09b" stroke-width="2" opacity=".25">
        <path d="M17 33 Q85 48 139 26 M26 114 Q133 128 212 99"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const tuskDrawing = svg(
    `<svg viewBox="0 0 128 256">
      <g fill="none" stroke="#998d6f" opacity=".28" stroke-width="2">
        <path d="M18 5 Q27 98 18 251 M43 0 Q31 124 43 256
                 M71 2 Q83 139 71 255 M104 0 Q93 155 108 254"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------
  // Skeleton. All appendage chains are authored before their geometry.
  // ---------------------------------------------------------------------------

  const hips = b.joint("hips", {
    at: [0, 2.34, -1.05],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 2.34, -1.45],
      [0, 2.46, -0.45],
      [0, 2.52, 0.55],
      [0, 2.61, 1.12],
    ],
    { parent: hips, names: ["rump", "spineMid", "chest"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 2.64, 1.02],
      [0, 2.91, 1.45],
      [0, 2.99, 1.73],
    ],
    { parent: spine.joints[2], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 2.98, 1.75],
    dir: [0, -0.1, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.26, 1.94],
    dir: [0, 0, 1],
    role: "jaw",
  });

  const earJoints = [1, -1].map((s) =>
    b.joint(s === 1 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.59, 2.94, 1.29],
      dir: [0, 0, 1],
      role: "hinge",
    }),
  );

  const trunk = b.chain(
    "trunk",
    catmull([
      [0, 2.94, 2.29],
      [0, 2.55, 2.57],
      [0, 2.02, 2.72],
      [0, 1.43, 2.78],
      [0, 0.91, 2.88],
      [0, 0.57, 3.12],
      [0, 0.59, 3.43],
    ]),
    {
      parent: head,
      count: 9,
      role: "tentacle",
      names: (i) => `trunk${i + 1}`,
    },
  );

  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.55, -1.83],
      [0.04, 2.05, -2.18],
      [0.12, 1.43, -2.3],
      [0.22, 0.95, -2.29],
    ]),
    { parent: hips, count: 4, role: "tail" },
  );

  const legs = [
    { side: "L", s: 1, front: true },
    { side: "R", s: -1, front: true },
    { side: "HL", s: 1, front: false },
    { side: "HR", s: -1, front: false },
  ].map(({ side, s, front }) => {
    const x = s * (front ? 0.81 : 0.79);
    const z = front ? 0.94 : -1.29;
    const points = [
      [x, front ? 2.58 : 2.37, z],
      [x * 1.04, 1.35, z + (front ? -0.055 : 0.16)],
      [x * 1.07, 0.47, z + (front ? 0.06 : -0.025)],
    ];
    const chain = b.chain(`leg${side}`, points, {
      parent: front ? spine.joints[2] : hips,
      names: front
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
        : [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
      contact: [x * 1.07, 0.12, points[2][2]],
    });
    return { side, s, front, x: x * 1.07, z: points[2][2], chain };
  });

  // ---------------------------------------------------------------------------
  // Shared primitive helpers.
  // ---------------------------------------------------------------------------

  function ellipsoid(
    name: string,
    at: PointInput,
    size: [number, number, number],
    color: Fill,
    bone: Joint,
    detail = 1,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      name,
      at,
      scale: size,
      bone,
      flat: true,
    });
  }

  function line(
    name: string,
    points: number[][],
    radius: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.sweep(catmull(points), radius, {
      name,
      color,
      bone,
      sides: 5,
      caps: "round",
    });
  }

  // ---------------------------------------------------------------------------
  // Large masses: a sloping back, deep barrel, heavy shoulders and angular head.
  // ---------------------------------------------------------------------------

  const body = b.sweep(
    spine,
    (t) => {
      const width = 0.8 + 0.24 * Math.sin(Math.PI * t);
      const depth = 0.87 + 0.24 * Math.sin(Math.PI * t);
      return [width, depth];
    },
    {
      name: "barrel",
      color: skin,
      sides: 12,
      smooth: false,
      caps: "round",
    },
  );

  b.sweep(neck, [0.78, 0.7, 0.62], {
    name: "heavyNeck",
    color: skin,
    sides: 10,
    smooth: false,
  });

  const skull = ellipsoid(
    "angularSkull",
    [0, 3.03, 1.81],
    [0.77, 0.89, 0.76],
    skin,
    head,
    2,
  );

  ellipsoid("forehead", [0, 3.38, 2.03], [0.65, 0.5, 0.54], skin, head, 1);

  for (const s of [1, -1]) {
    ellipsoid(
      s > 0 ? "cheekL" : "cheekR",
      [s * 0.49, 2.55, 2.02],
      [0.37, 0.51, 0.47],
      skin,
      head,
      1,
    );
  }

  const lowerJaw = ellipsoid(
    "lowerJaw",
    [0, 2.21, 2.1],
    [0.49, 0.245, 0.49],
    skin,
    jaw,
    1,
  );

  const mouthSurface = b.surface(lowerJaw);
  for (const s of [1, -1]) {
    const mouthPath = mouthSurface.drape(
      [
        [s * 0.43, 2.3, 2.1],
        [s * 0.38, 2.31, 2.34],
        [s * 0.21, 2.29, 2.5],
      ],
      { lift: 0.006 },
    );
    b.sweep(mouthPath, 0.017, {
      color: C.lip,
      bone: jaw,
      name: `mouthCorner${s > 0 ? "L" : "R"}`,
      sides: 5,
    });
  }

  // Small, alert eyes surrounded by thick leathery lids.
  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";
    const eyeHit = headSurface.nearest([s * 0.62, 3.0, 2.3]);

    const socketGeometry = new THREE.SphereGeometry(1, 10, 6);
    socketGeometry.scale(0.145, 0.045, 0.105);

    const socket = b.stick(socketGeometry, C.shadow, eyeHit, {
      name: `eyeSocket${suffix}`,
      embed: 0.32,
      flow: [0, 1, 0],
      bone: head,
    });

    b.decal(socket, eyeDrawing, {
      at: eyeHit,
      dir: eyeHit.n,
      size: [0.238, 0.146],
      up: [0, 1, 0],
      mirror: s > 0,
      bone: head,
      lift: 0.003,
      name: `eye${suffix}`,
    });

    const brow = headSurface.drape(
      [
        [s * 0.44, 3.15, 2.4],
        [s * 0.61, 3.18, 2.32],
        [s * 0.73, 3.12, 2.18],
      ],
      { lift: 0.018 },
    );
    b.sweep(brow, [0.035, 0.055, 0.02], {
      color: skin,
      bone: head,
      sides: 6,
      name: `brow${suffix}`,
    });

    b.decal(skull, skinDrawing, {
      at: [s * 0.61, 2.8, 2.24],
      dir: [s * 0.6, 0, 0.8],
      size: [0.28, 0.23],
      bone: head,
      mirror: s < 0,
      name: `eyeWrinkles${suffix}`,
    });
  }

  // ---------------------------------------------------------------------------
  // African ears. Broad angular fans with long tapering lower lobes.
  // ---------------------------------------------------------------------------

  const earOutline = [
    [0, 0.45],
    [0.43, 0.83],
    [1.04, 0.79],
    [1.48, 0.37],
    [1.62, -0.18],
    [1.36, -0.69],
    [0.98, -1.19],
    [0.56, -1.36],
    [0.2, -0.86],
    [-0.02, -0.34],
  ];

  function earPoint(s: number, u: number, v: number, lift = 0): number[] {
    return [s * (0.59 + u), 2.94 + v, 1.29 - 0.4 * u + lift];
  }

  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const bone = earJoints[i];
    const suffix = s > 0 ? "L" : "R";

    b.slab(
      earOutline.map(([u, v]) => earPoint(s, u, v)),
      {
        thickness: 0.105,
        color: skin,
        bone,
        name: `earFan${suffix}`,
      },
    );

    const inner = b.slab(
      earOutline.map(([u, v]) =>
        earPoint(s, 0.65 + (u - 0.65) * 0.88, -0.15 + (v + 0.15) * 0.89, 0.065),
      ),
      {
        thickness: 0.015,
        color: earSkin,
        bone,
        name: `earInner${suffix}`,
      },
    );

    b.sweep(
      polyline(
        earOutline.map(([u, v]) => earPoint(s, u, v, 0.045)),
        { closed: true },
      ),
      0.025,
      {
        color: C.earEdge,
        bone,
        sides: 5,
        name: `earRim${suffix}`,
      },
    );

    b.decal(inner, earDrawing, {
      at: earPoint(s, 0.77, -0.22, 0.09),
      dir: [s * 0.4, 0, 1],
      size: [1.6, 2.08],
      mirror: s < 0,
      segments: 12,
      lift: 0.002,
      bone,
      name: `earVeins${suffix}`,
    });

    // Raised folds where the thin ear meets its stout hinge.
    for (let j = 0; j < 3; j++) {
      line(
        `earRootFold${suffix}${j}`,
        [
          earPoint(s, 0.06 + j * 0.065, 0.34, 0.1),
          earPoint(s, 0.16 + j * 0.065, -0.03, 0.11),
          earPoint(s, 0.2 + j * 0.065, -0.46, 0.09),
        ],
        0.021 - j * 0.003,
        j === 1 ? C.creaseSoft : skin,
        bone,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Trunk: continuous articulated tube, with broad transverse creases.
  // ---------------------------------------------------------------------------

  const trunkTube = b.sweep(
    trunk,
    [0.34, 0.31, 0.255, 0.205, 0.16, 0.122, 0.101],
    {
      name: "trunkSkin",
      color: skin,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "flat" },
    },
  );

  for (let i = 0; i < 29; i++) {
    const t = 0.1 + (i / 28) * 0.84;
    const spread = 61 + (i % 4) * 8;
    const points = [];
    for (let j = 0; j < 7; j++) {
      points.push(trunkTube.at(t, -spread + (2 * spread * j) / 6, 0.003));
    }
    b.sweep(catmull(points), i < 11 ? 0.009 : 0.006, {
      name: `trunkCrease${i + 1}`,
      color: i % 3 === 0 ? C.crease : C.creaseSoft,
      sides: 4,
      caps: "round",
    });
  }

  for (const angle of [-112, 112]) {
    b.sweep(trunkTube.line(angle, 0.002).slice(0.28, 0.86), 0.006, {
      color: C.creaseSoft,
      sides: 4,
      name: `trunkLongFold${angle < 0 ? "R" : "L"}`,
    });
  }

  const trunkEnd = trunk.at(1);
  const tipBone = trunk.joints[trunk.joints.length - 1];

  b.part(new THREE.CylinderGeometry(0.091, 0.096, 0.024, 10), C.shadow, {
    at: trunkEnd,
    dir: trunkEnd.tangent,
    bone: tipBone,
    name: "trunkTip",
  });

  for (const s of [1, -1]) {
    const holeGeometry = new THREE.SphereGeometry(1, 8, 5);
    holeGeometry.scale(0.023, 0.012, 0.036);
    b.part(holeGeometry, C.lip, {
      at: trunkEnd.local([s * 0.039, 0.018, 0]),
      dir: trunkEnd.tangent,
      bone: tipBone,
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }

  // African elephants have both an upper and a lower finger at the trunk tip.
  b.sweep(
    [
      [0, 0.675, 3.385],
      [0, 0.701, 3.47],
      [0, 0.681, 3.535],
    ],
    [0.038, 0.031, 0.009],
    {
      color: skin,
      bone: tipBone,
      sides: 6,
      name: "trunkUpperFinger",
    },
  );
  b.sweep(
    [
      [0, 0.515, 3.39],
      [0, 0.495, 3.463],
      [0, 0.512, 3.515],
    ],
    [0.034, 0.025, 0.008],
    {
      color: skin,
      bone: tipBone,
      sides: 6,
      name: "trunkLowerFinger",
    },
  );

  // ---------------------------------------------------------------------------
  // Tusks: exposed roots, heavy ivory shafts, and elegant upturned points.
  // ---------------------------------------------------------------------------

  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";

    b.sweep(
      [
        [s * 0.47, 2.32, 2.12],
        [s * 0.58, 2.15, 2.39],
      ],
      [0.23, 0.177],
      {
        name: `tuskSocket${suffix}`,
        color: skin,
        sides: 8,
        bone: head,
      },
    );

    const tusk = b.sweep(
      bezier(
        [s * 0.55, 2.2, 2.32],
        [s * 0.76, 1.51, 2.8],
        [s * 0.94, 1.5, 3.45],
        [s * 0.87, 2.0, 3.83],
      ),
      (t) => 0.168 * Math.pow(1 - t, 0.83),
      {
        name: `tusk${suffix}`,
        color: ivory,
        sides: 9,
        smooth: false,
        bone: head,
        caps: { start: "flat", end: "point" },
      },
    );

    b.decal(tusk, tuskDrawing, {
      at: [s * 0.73, 1.85, 2.77],
      dir: [s * 0.3, 0.2, 1],
      size: [0.23, 0.46],
      bone: head,
      name: `ivoryGrain${suffix}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Pillar-like legs, broad padded feet, nails and compressed ankle folds.
  // ---------------------------------------------------------------------------

  for (const leg of legs) {
    const { side, front, x, z, chain } = leg;

    const legTube = b.sweep(
      chain,
      front
        ? [0.43, 0.385, 0.31, 0.26, 0.275]
        : [0.47, 0.4, 0.315, 0.26, 0.285],
      {
        name: `legSkin${side}`,
        color: skin,
        sides: 9,
        smooth: false,
        caps: "round",
      },
    );

    const footBone = chain.tip ?? chain.joints[chain.joints.length - 1];

    b.lathe(
      [
        [0, 0],
        [0.27, 0],
        [0.335, 0.06],
        [0.35, 0.19],
        [0.315, 0.34],
        [0.26, 0.43],
        [0, 0.43],
      ],
      {
        at: [x, 0.12, z],
        color: skin,
        bone: footBone,
        segments: 10,
        name: `foot${side}`,
      },
    );

    const numberOfNails = front ? 4 : 3;
    for (let j = 0; j < numberOfNails; j++) {
      const a = ((j - (numberOfNails - 1) / 2) * 29 * Math.PI) / 180;
      const px = x + Math.sin(a) * 0.292;
      const pz = z + Math.cos(a) * 0.292;
      const nail = new THREE.SphereGeometry(1, 8, 5);
      nail.scale(0.077, 0.106, 0.035);
      b.part(nail, nailPaint, {
        at: [px, 0.244, pz],
        rotation: [0, (a * 180) / Math.PI, 0],
        bone: footBone,
        name: `nail${side}${j + 1}`,
        flat: true,
      });
    }

    const legSurface = b.surface(legTube);
    for (let j = 0; j < 3; j++) {
      const h = 0.68 + j * 0.082;
      const fold = legSurface.drape(
        [
          [x - 0.22, h, z + 0.2],
          [x, h - 0.035, z + 0.35],
          [x + 0.22, h, z + 0.2],
        ],
        { lift: 0.004 },
      );
      b.sweep(fold, 0.009, {
        color: C.creaseSoft,
        sides: 4,
        name: `ankleFold${side}${j}`,
        bone: footBone,
      });
    }

    b.decal(legTube, skinDrawing, {
      at: [x, 1.39, z + 0.4],
      dir: [0, 0, 1],
      size: [0.43, 0.35],
      segments: 7,
      name: `kneeWrinkles${side}`,
    });
  }

  // Shoulder and flank folds are projected onto the barrel rather than floating.
  const bodySurface = b.surface(body);
  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";
    b.decal(body, skinDrawing, {
      at: [s * 1.0, 2.22, -0.4],
      dir: [s, 0, 0],
      size: [1.2, 0.8],
      roll: s * 12,
      mirror: s < 0,
      name: `flankWrinkles${suffix}`,
    });

    for (let j = 0; j < 4; j++) {
      const z = 0.66 - j * 0.09;
      const crease = bodySurface.drape(
        [
          [s * 0.72, 3.18, z],
          [s * 0.97, 2.78, z - 0.05],
          [s * 1.02, 2.29, z - 0.03],
          [s * 0.88, 1.85, z + 0.04],
        ],
        { lift: 0.004 },
      );
      b.sweep(crease, 0.011, {
        name: `shoulderFold${suffix}${j}`,
        color: j % 2 ? C.creaseSoft : C.crease,
        sides: 4,
      });
    }
  }

  b.decal(skull, skinDrawing, {
    at: [0, 3.52, 2.44],
    dir: [0, 0.25, 1],
    size: [0.64, 0.4],
    bone: head,
    name: "foreheadWrinkles",
  });

  // Long thin tail, with a deliberately coarse dark brush at its end.
  b.sweep(tail, [0.1, 0.078, 0.055, 0.034], {
    name: "tailSkin",
    color: skin,
    sides: 7,
    smooth: false,
  });

  const tailBone = tail.joints[tail.joints.length - 1];
  ellipsoid(
    "tailBrush",
    [0.23, 0.83, -2.29],
    [0.105, 0.235, 0.105],
    C.hair,
    tailBone,
    1,
  );

  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    b.sweep(
      [
        [0.22 + Math.cos(a) * 0.047, 0.97, -2.29 + Math.sin(a) * 0.047],
        [0.25 + Math.cos(a) * 0.093, 0.78, -2.29 + Math.sin(a) * 0.081],
        [0.27 + Math.cos(a) * 0.075, 0.59 + (i % 3) * 0.025, -2.28 + Math.sin(a) * 0.065],
      ],
      [0.018, 0.014, 0],
      {
        color: i % 3 === 0 ? "#5a5847" : C.hair,
        bone: tailBone,
        sides: 4,
        name: `tailHair${i + 1}`,
      },
    );
  }

  // A few sparse, stiff crown hairs, not a furry coat.
  for (let i = 0; i < 7; i++) {
    const x = (i - 3) * 0.065;
    const hit = headSurface.nearest([x, 3.9, 1.83]);
    b.spike(hit, [x * 0.5, 1, -0.35], 0.055 + (i % 2) * 0.025, 0.005, {
      color: C.hair,
      bone: head,
      sides: 4,
      name: `crownBristle${i + 1}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Small savanna vignette. The elephant remains the dominant silhouette.
  // ---------------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(1, 0.975, 0.12, 16), earth, {
    at: [0, 0.06, 0.48],
    scale: [2.66, 1, 3.43],
    bone: hips,
    name: "savannaGround",
    flat: true,
  });

  // Flat, scattered stones and dusty chips around the outer margin.
  for (let i = 0; i < 19; i++) {
    const a = random() * Math.PI * 2;
    const radius = 0.78 + random() * 0.15;
    const x = Math.cos(a) * 2.53 * radius;
    const z = 0.48 + Math.sin(a) * 3.3 * radius;
    const size = 0.045 + random() * 0.09;
    ellipsoid(
      `savannaStone${i + 1}`,
      [x, 0.135 + size * 0.22, z],
      [size * 1.3, size * 0.4, size],
      i % 3 === 0 ? "#8f8268" : i % 3 === 1 ? "#b59e75" : "#c1aa7b",
      hips,
      0,
    );
  }

  function grassTuft(x: number, z: number, index: number) {
    const height = 0.13 + random() * 0.13;
    for (let blade = 0; blade < 4; blade++) {
      const a = random() * Math.PI * 2;
      const lean = 0.035 + random() * 0.075;
      const h = height * (0.7 + random() * 0.4);
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const width = 0.012 + random() * 0.008;
      b.slab(
        [
          [x - dz * width, 0.118, z + dx * width],
          [x + dz * width, 0.118, z - dx * width],
          [x + dx * lean, 0.118 + h, z + dz * lean],
          [x + dx * lean * 0.5 - dz * width * 0.3, 0.118 + h * 0.6, z + dz * lean * 0.5 + dx * width * 0.3],
        ],
        {
          color: blade % 3 === 0 ? C.grassLight : blade % 3 === 1 ? C.dryGrass : C.grassDark,
          thickness: 0.003,
          bone: hips,
          name: `grass${index}_${blade}`,
        },
      );
    }
  }

  const grassSites = [
    [-2.01, -0.8],
    [-1.91, -1.18],
    [-1.64, -1.95],
    [-1.18, -2.36],
    [0.72, -2.52],
    [1.34, -2.1],
    [1.91, -1.38],
    [2.17, -0.5],
    [2.18, 0.33],
    [2.1, 1.16],
    [-2.17, 0.25],
    [-2.1, 1.22],
    [-1.83, 2.05],
    [1.81, 2.15],
  ];

  grassSites.forEach(([x, z], i) => grassTuft(x, z, i));

  return b.root;
}

```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  paint,
  noise,
  mix,
  mottle,
  svg,
} from "agentic-3js-builder";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";

export const meta = {
  name: "Savanna Monarch",
  description:
    "A mature African bush elephant with cupped, leathery ears, gently curved ivory tusks, an articulated trunk and broad, dusty feet on a restrained savanna base.",
};

/*
Art-direction changes
1. Replace the sharply kinked, mottled tusks with continuous ivory arcs;
   bury their roots cleanly inside the sockets.
2. Give the ears cupping and irregular, tapered edges instead of the
   thick picture-frame rims. Keep the broad African-ear silhouette.
3. Simplify the forehead and cheeks, recess the eyes, and soften the
   raised wrinkle lines so the face reads as an elephant, not armor.
4. Join the ankles cleanly to the feet and seat visible toenails on
   their actual surfaces.
5. Warm the dusty skin subtly, improve the trunk-tip construction,
   and retain the quiet, low-poly savanna setting.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "savannaMonarch", paintSize: 2048 });
  const random = rng(78103);

  const C = {
    skin: "#85877e",
    light: "#a5a397",
    shadow: "#626b69",
    crease: "#626963",
    creaseSoft: "#767c71",
    lip: "#424a43",
    earEdge: "#85877b",
    ivory: "#e8dec0",
    nail: "#ada792",
    hair: "#414336",
    dryGrass: "#b5a06a",
    grassLight: "#d6bc7e",
    grassDark: "#827a4e",
  };

  const skin = paint((p, n) => {
    let color = mix(
      C.shadow,
      C.light,
      0.35 + noise(p, 0.44, 17) * 0.34 + n.y * 0.14,
    );
    color = mix(
      color,
      "#c4b199",
      Math.max(0, noise(p, 0.095, 45) - 0.53) * 0.16,
    );
    const dust = Math.max(0, 1 - (p.y - 0.12) / 1.04);
    return mix(color, "#b29d7b", dust * 0.4);
  });

  const earSkin = paint((p, n) =>
    mix(
      mix("#798078", "#a39886", noise(p, 0.35, 31) * 0.58),
      "#b5aa95",
      Math.max(0, n.y) * 0.12,
    ),
  );

  // Broad ivory coloration, not high-frequency wood-grain camouflage.
  const ivory = paint((p, n) => {
    const warmth = Math.min(1, Math.max(0, (p.z - 2.25) / 1.5));
    let color = mix("#c9bea1", "#f2e8ce", 0.35 + warmth * 0.56);
    color = mix(color, "#fff2d5", Math.max(0, n.y) * 0.17);
    return mix(color, "#bfb193", (noise(p, 0.23, 20) - 0.3) * 0.07);
  });

  const nailPaint = mottle("#a09d87", "#c8bda0", {
    size: 0.2,
    seed: 12,
  });

  const earth = paint((p, n) =>
    mix(
      n.y > 0.4 ? "#b38e60" : "#806346",
      n.y > 0.4 ? "#c4a777" : "#a1875b",
      noise(p, 0.65, 72) * 0.65 + noise(p, 0.055, 15) * 0.25,
    ),
  );

  const eyeDrawing = svg(
    `<svg viewBox="0 0 160 100">
      <path d="M8 54 Q32 15 78 19 Q127 17 153 49
               Q122 80 80 80 Q35 80 8 54Z"
            fill="#454d43" stroke="#878c7d" stroke-width="7"/>
      <path d="M25 51 Q52 31 82 33 Q117 33 137 50
               Q115 68 81 68 Q48 68 25 51Z" fill="#79765a"/>
      <ellipse cx="83" cy="50" rx="22" ry="22" fill="#735c35"/>
      <ellipse cx="83" cy="52" rx="15" ry="19" fill="#26302a"/>
      <path d="M24 45 Q77 17 139 46" fill="none"
            stroke="#4d5549" stroke-width="10" stroke-linecap="round"/>
      <circle cx="77" cy="43" r="4.5" fill="#f1ebd3"/>
      <circle cx="91" cy="59" r="1.7" fill="#bbbda7"/>
      <path d="M32 73 Q81 86 133 68" fill="none"
            stroke="#aaa38d" stroke-width="3"/>
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
              stroke="#626c5f" stroke-width="3.5" opacity=".44"/>
        <path d="M47 135 Q61 91 83 54
                 M84 108 Q107 94 143 91
                 M119 146 Q135 119 151 101
                 M152 136 Q179 142 199 152
                 M94 176 Q116 203 119 239
                 M144 182 Q168 165 191 168
                 M81 215 Q72 250 65 273
                 M122 247 Q147 245 173 254"
              stroke="#697060" stroke-width="2.5" opacity=".4"/>
        <path d="M43 145 Q104 117 159 63
                 M42 163 Q121 180 194 187
                 M43 176 Q82 226 149 282"
              stroke="#c0af94" stroke-width="3" opacity=".32"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const skinDrawing = svg(
    `<svg viewBox="0 0 240 180">
      <g fill="none" stroke="#626d60" stroke-width="3"
         stroke-linecap="round" opacity=".42">
        <path d="M17 28 Q85 43 139 21 M33 53 Q104 67 207 38"/>
        <path d="M9 78 Q100 99 227 65 M26 109 Q133 123 212 94"/>
        <path d="M48 139 Q119 154 194 132 M81 164 Q137 170 171 157"/>
        <path d="M63 39 L59 54 M129 64 L126 81 M80 98 L77 114"/>
      </g>
      <g fill="none" stroke="#b8b09b" stroke-width="2" opacity=".28">
        <path d="M17 33 Q85 48 139 26 M26 114 Q133 128 212 99"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const tuskDrawing = svg(
    `<svg viewBox="0 0 128 256">
      <g fill="none" stroke="#b7a789" opacity=".16" stroke-width="2">
        <path d="M18 5 Q27 98 18 251 M43 0 Q31 124 43 256
                 M71 2 Q83 139 71 255 M104 0 Q93 155 108 254"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first.
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
    {
      parent: hips,
      names: ["rump", "spineMid", "chest"],
      role: "spine",
    },
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
    return { side, front, x: x * 1.07, z: points[2][2], chain };
  });

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

  // Large low-poly masses. One coherent skull replaces overlapping brow domes.
  const body = b.sweep(
    spine,
    (t) => [
      0.8 + 0.24 * Math.sin(Math.PI * t),
      0.87 + 0.24 * Math.sin(Math.PI * t),
    ],
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
    [0, 3.06, 1.85],
    [0.77, 0.88, 0.76],
    skin,
    head,
    2,
  );

  for (const s of [1, -1]) {
    ellipsoid(
      s > 0 ? "cheekL" : "cheekR",
      [s * 0.46, 2.57, 2.01],
      [0.32, 0.44, 0.39],
      skin,
      head,
      1,
    );
  }

  const lowerJaw = ellipsoid(
    "lowerJaw",
    [0, 2.21, 2.1],
    [0.46, 0.225, 0.45],
    skin,
    jaw,
    1,
  );

  const mouthSurface = b.surface(lowerJaw);
  for (const s of [1, -1]) {
    b.sweep(
      mouthSurface.drape(
        [
          [s * 0.43, 2.3, 2.1],
          [s * 0.38, 2.31, 2.34],
          [s * 0.21, 2.29, 2.5],
        ],
        { lift: 0.002 },
      ),
      0.01,
      {
        color: C.lip,
        bone: jaw,
        name: `mouthCorner${s > 0 ? "L" : "R"}`,
        sides: 5,
      },
    );
  }

  const headSurface = b.surface(skull);
  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";
    const eyeHit = headSurface.nearest([s * 0.62, 3.0, 2.3]);
    const socketGeometry = new THREE.SphereGeometry(1, 10, 6);
    socketGeometry.scale(0.135, 0.024, 0.085);

    const socket = b.stick(socketGeometry, skin, eyeHit, {
      name: `eyeSocket${suffix}`,
      embed: 0.42,
      flow: [0, 1, 0],
      bone: head,
    });

    b.decal(socket, eyeDrawing, {
      at: eyeHit,
      dir: eyeHit.n,
      size: [0.22, 0.133],
      up: [0, 1, 0],
      mirror: s > 0,
      bone: head,
      lift: 0.002,
      name: `eye${suffix}`,
    });

    b.sweep(
      headSurface.drape(
        [
          [s * 0.45, 3.115, 2.4],
          [s * 0.61, 3.145, 2.32],
          [s * 0.72, 3.09, 2.18],
        ],
        { lift: 0.004 },
      ),
      [0.016, 0.032, 0.009],
      {
        color: skin,
        bone: head,
        sides: 6,
        name: `brow${suffix}`,
      },
    );

    b.decal(skull, skinDrawing, {
      at: [s * 0.61, 2.8, 2.24],
      dir: [s * 0.6, 0, 0.8],
      size: [0.28, 0.23],
      bone: head,
      mirror: s < 0,
      name: `eyeWrinkles${suffix}`,
    });
  }

  // Cupped ear fans: radial low-poly surfaces, front and back, with a thin rim.
  // Each perimeter point carries its own depth instead of forming a flat shield.
  const earOutline = [
    [0, 0.43],
    [0.27, 0.69],
    [0.62, 0.83],
    [0.98, 0.78],
    [1.24, 0.57],
    [1.43, 0.29],
    [1.52, -0.04],
    [1.48, -0.29],
    [1.32, -0.55],
    [1.16, -0.78],
    [1.04, -0.99],
    [0.84, -1.18],
    [0.61, -1.31],
    [0.4, -1.21],
    [0.23, -0.92],
    [0.1, -0.6],
    [-0.015, -0.3],
    [-0.045, 0.07],
  ];

  function earPoint(s: number, u: number, v: number, lift = 0): number[] {
    const cup =
      0.16 * Math.sin(Math.min(1, Math.max(0, u / 1.52)) * Math.PI) *
      Math.max(0.15, 1 - Math.abs(v + 0.2) * 0.38);
    return [
      s * (0.59 + u),
      2.94 + v,
      1.29 - 0.36 * u + cup + lift,
    ];
  }

  function earGeometry(s: number) {
    const count = earOutline.length;
    const center = [0.48, -0.12];
    const coordinates: number[][] = [center];
    for (const factor of [0.48, 1]) {
      for (const [u, v] of earOutline) {
        coordinates.push([
          center[0] + (u - center[0]) * factor,
          center[1] + (v - center[1]) * factor,
        ]);
      }
    }

    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const layerSize = coordinates.length;

    for (const face of [1, -1]) {
      for (let i = 0; i < coordinates.length; i++) {
        const [u, v] = coordinates[i];
        const thickness = i > count ? 0.017 : 0.037;
        vertices.push(...earPoint(s, u, v, face * thickness));
        uvs.push((u + 0.05) / 1.6, (v + 1.34) / 2.2);
      }
    }

    function triangle(a: number, c: number, d: number, front: boolean) {
      // Mirroring changes the winding; maintain outward normals on both ears.
      if ((s > 0) === front) indices.push(a, d, c);
      else indices.push(a, c, d);
    }

    for (let face = 0; face < 2; face++) {
      const offset = face * layerSize;
      for (let i = 0; i < count; i++) {
        const next = (i + 1) % count;
        triangle(offset, offset + 1 + i, offset + 1 + next, face === 0);
        const a = offset + 1 + i;
        const c = offset + 1 + next;
        const d = offset + 1 + count + i;
        const e = offset + 1 + count + next;
        triangle(a, d, e, face === 0);
        triangle(a, e, c, face === 0);
      }
    }

    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const a = 1 + count + i;
      const c = 1 + count + next;
      triangle(a, c, c + layerSize, true);
      triangle(a, c + layerSize, a + layerSize, true);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const bone = earJoints[i];
    const suffix = s > 0 ? "L" : "R";

    const ear = b.part(earGeometry(s), earSkin, {
      at: [0, 0, 0],
      bone,
      name: `earFan${suffix}`,
      flat: true,
    });

    b.sweep(
      polyline(
        earOutline.map(([u, v]) => earPoint(s, u, v, 0.005)),
        { closed: true },
      ),
      0.012,
      {
        color: skin,
        bone,
        sides: 5,
        name: `earThinEdge${suffix}`,
      },
    );

    b.decal(ear, earDrawing, {
      at: earPoint(s, 0.77, -0.22, 0.15),
      dir: [s * 0.36, 0, 1],
      size: [1.52, 2.08],
      mirror: s < 0,
      segments: 18,
      lift: 0.003,
      bone,
      name: `earVeins${suffix}`,
    });

    const earSurface = b.surface(ear);
    for (let j = 0; j < 3; j++) {
      b.sweep(
        earSurface.drape(
          [
            earPoint(s, 0.055 + j * 0.065, 0.32, 0.2),
            earPoint(s, 0.15 + j * 0.065, -0.03, 0.2),
            earPoint(s, 0.19 + j * 0.065, -0.46, 0.2),
          ],
          { lift: 0.002 },
        ),
        0.012 - j * 0.002,
        {
          color: j === 1 ? C.creaseSoft : skin,
          bone,
          sides: 5,
          name: `earRootFold${suffix}${j}`,
        },
      );
    }
  }

  // Trunk has a continuous skinned surface and much subtler fold relief.
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

  for (let i = 0; i < 33; i++) {
    const t = 0.1 + (i / 32) * 0.84;
    const spread = 59 + (i % 4) * 7;
    const points = [];
    for (let j = 0; j < 9; j++) {
      const angle = -spread + (2 * spread * j) / 8;
      const stagger = 0.002 * Math.sin(j * 1.1 + i * 0.6);
      points.push(trunkTube.at(t + stagger, angle, 0.001));
    }
    b.sweep(catmull(points), i < 11 ? 0.0055 : 0.004, {
      name: `trunkCrease${i + 1}`,
      color: i % 4 === 0 ? C.crease : C.creaseSoft,
      sides: 4,
      caps: "round",
    });
  }

  for (const angle of [-112, 112]) {
    b.sweep(trunkTube.line(angle, 0.001).slice(0.28, 0.86), 0.0035, {
      color: C.creaseSoft,
      sides: 4,
      name: `trunkLongFold${angle < 0 ? "R" : "L"}`,
    });
  }

  const trunkEnd = trunk.at(1);
  const tipBone = trunk.joints[trunk.joints.length - 1];

  b.part(new THREE.CylinderGeometry(0.096, 0.098, 0.018, 10), skin, {
    at: trunkEnd,
    dir: trunkEnd.tangent,
    bone: tipBone,
    name: "trunkTip",
  });

  for (const s of [1, -1]) {
    const nostril = new THREE.SphereGeometry(1, 8, 5);
    nostril.scale(0.025, 0.009, 0.032);
    b.part(nostril, C.lip, {
      at: trunkEnd.local([s * 0.038, 0.013, 0]),
      dir: trunkEnd.tangent,
      bone: tipBone,
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }

  b.sweep(
    [
      [0, 0.66, 3.38],
      [0, 0.68, 3.445],
      [0, 0.67, 3.505],
    ],
    [0.037, 0.028, 0.008],
    {
      color: skin,
      bone: tipBone,
      sides: 6,
      name: "trunkUpperFinger",
    },
  );

  b.sweep(
    [
      [0, 0.525, 3.385],
      [0, 0.515, 3.45],
      [0, 0.53, 3.49],
    ],
    [0.032, 0.024, 0.008],
    {
      color: skin,
      bone: tipBone,
      sides: 6,
      name: "trunkLowerFinger",
    },
  );

  // Sample the cubic explicitly: enough longitudinal facets to read as an arc,
  // while keeping a decisively low-poly nine-sided cross-section.
  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";

    b.sweep(
      [
        [s * 0.46, 2.34, 2.12],
        [s * 0.56, 2.18, 2.35],
      ],
      [0.215, 0.176],
      {
        name: `tuskSocket${suffix}`,
        color: skin,
        sides: 10,
        bone: head,
        caps: { start: "round", end: "flat" },
      },
    );

    const p0 = new THREE.Vector3(s * 0.535, 2.235, 2.285);
    const p1 = new THREE.Vector3(s * 0.73, 1.64, 2.76);
    const p2 = new THREE.Vector3(s * 0.96, 1.52, 3.38);
    const p3 = new THREE.Vector3(s * 0.88, 2.01, 3.85);
    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
    const points = curve.getPoints(22);

    const tusk = b.sweep(polyline(points), (t) => 0.151 * Math.pow(1 - t, 0.85), {
      name: `tusk${suffix}`,
      color: ivory,
      sides: 9,
      smooth: false,
      bone: head,
      caps: { start: "flat", end: "point" },
    });

    b.decal(tusk, tuskDrawing, {
      at: [s * 0.7, 1.94, 2.78],
      dir: [s * 0.3, 0.2, 1],
      size: [0.2, 0.35],
      bone: head,
      name: `ivoryStriation${suffix}`,
    });
  }

  // Legs and feet. Flat-ended legs are deeply seated in the tapered foot tops.
  for (const leg of legs) {
    const { side, front, x, z, chain } = leg;

    const legTube = b.sweep(
      chain,
      front
        ? [0.43, 0.385, 0.31, 0.265, 0.268]
        : [0.47, 0.4, 0.315, 0.265, 0.268],
      {
        name: `legSkin${side}`,
        color: skin,
        sides: 10,
        smooth: false,
        caps: { start: "round", end: "flat" },
      },
    );

    const footBone = chain.tip ?? chain.joints[chain.joints.length - 1];

    const foot = b.lathe(
      [
        [0, 0],
        [0.285, 0],
        [0.342, 0.055],
        [0.354, 0.16],
        [0.331, 0.28],
        [0.302, 0.39],
        [0.266, 0.51],
        [0, 0.51],
      ],
      {
        at: [x, 0.12, z],
        color: skin,
        bone: footBone,
        segments: 10,
        name: `foot${side}`,
      },
    );

    const footSurface = b.surface(foot);
    const numberOfNails = front ? 4 : 3;

    for (let j = 0; j < numberOfNails; j++) {
      const a = ((j - (numberOfNails - 1) / 2) * 29 * Math.PI) / 180;
      const target = [
        x + Math.sin(a) * 0.5,
        0.245,
        z + Math.cos(a) * 0.5,
      ];
      const hit = footSurface.nearest(target);
      const nail = new THREE.SphereGeometry(1, 8, 6);
      nail.scale(0.077, 0.032, 0.09);
      b.stick(nail, nailPaint, hit, {
        embed: 0.22,
        flow: [0, 1, 0],
        bone: footBone,
        name: `nail${side}${j + 1}`,
      });
    }

    const legSurface = b.surface(legTube);
    for (let j = 0; j < 3; j++) {
      const h = 0.74 + j * 0.065;
      b.sweep(
        legSurface.drape(
          [
            [x - 0.22, h, z + 0.2],
            [x, h - 0.018, z + 0.35],
            [x + 0.22, h, z + 0.2],
          ],
          { lift: 0.001 },
        ),
        0.0045,
        {
          color: C.creaseSoft,
          sides: 4,
          name: `ankleFold${side}${j}`,
          bone: footBone,
        },
      );
    }

    b.decal(legTube, skinDrawing, {
      at: [x, 1.39, z + 0.4],
      dir: [0, 0, 1],
      size: [0.43, 0.35],
      segments: 7,
      name: `kneeWrinkles${side}`,
    });

    b.decal(foot, skinDrawing, {
      at: [x, 0.45, z + 0.36],
      dir: [0, 0, 1],
      size: [0.46, 0.18],
      segments: 7,
      bone: footBone,
      name: `footWrinkles${side}`,
    });
  }

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
      b.sweep(
        bodySurface.drape(
          [
            [s * 0.72, 3.18, z],
            [s * 0.97, 2.78, z - 0.05],
            [s * 1.02, 2.29, z - 0.03],
            [s * 0.88, 1.85, z + 0.04],
          ],
          { lift: 0.001 },
        ),
        0.005,
        {
          name: `shoulderFold${suffix}${j}`,
          color: C.creaseSoft,
          sides: 4,
        },
      );
    }
  }

  b.decal(skull, skinDrawing, {
    at: [0, 3.52, 2.44],
    dir: [0, 0.25, 1],
    size: [0.64, 0.4],
    bone: head,
    name: "foreheadWrinkles",
  });

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
    [0.085, 0.22, 0.085],
    C.hair,
    tailBone,
    1,
  );

  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    b.sweep(
      [
        [0.22 + Math.cos(a) * 0.043, 0.97, -2.29 + Math.sin(a) * 0.043],
        [0.25 + Math.cos(a) * 0.087, 0.78, -2.29 + Math.sin(a) * 0.075],
        [
          0.27 + Math.cos(a) * 0.069,
          0.59 + (i % 3) * 0.025,
          -2.28 + Math.sin(a) * 0.06,
        ],
      ],
      [0.016, 0.012, 0],
      {
        color: i % 3 === 0 ? "#66614b" : C.hair,
        bone: tailBone,
        sides: 4,
        name: `tailHair${i + 1}`,
      },
    );
  }

  // Sparse bristles, deliberately unobtrusive against the crown.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.069;
    const hit = headSurface.nearest([x, 3.96, 1.83]);
    b.spike(hit, [x * 0.5, 1, -0.35], 0.035 + (i % 2) * 0.013, 0.0035, {
      color: C.hair,
      bone: head,
      sides: 4,
      name: `crownBristle${i + 1}`,
    });
  }

  // Low, warm, quiet staging.
  b.part(new THREE.CylinderGeometry(1, 0.975, 0.12, 16), earth, {
    at: [0, 0.06, 0.48],
    scale: [2.66, 1, 3.43],
    bone: hips,
    name: "savannaGround",
    flat: true,
  });

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
      i % 3 === 0 ? "#94856b" : i % 3 === 1 ? "#b59e75" : "#c1aa7b",
      hips,
      0,
    );
  }

  function grassTuft(x: number, z: number, index: number) {
    const height = 0.15 + random() * 0.15;
    for (let blade = 0; blade < 5; blade++) {
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
          [
            x + dx * lean * 0.5 - dz * width * 0.3,
            0.118 + h * 0.6,
            z + dz * lean * 0.5 + dx * width * 0.3,
          ],
        ],
        {
          color:
            blade % 3 === 0
              ? C.grassLight
              : blade % 3 === 1
                ? C.dryGrass
                : C.grassDark,
          thickness: 0.003,
          bone: hips,
          name: `grass${index}_${blade}`,
        },
      );

      if (blade === 0 && index % 3 === 0) {
        line(
          `grassSeedStem${index}`,
          [
            [x, 0.12, z],
            [x + dx * lean * 0.6, 0.12 + h * 0.7, z + dz * lean * 0.6],
            [x + dx * lean, 0.12 + h * 1.15, z + dz * lean],
          ],
          0.0035,
          C.grassDark,
          hips,
        );
        ellipsoid(
          `grassSeedHead${index}`,
          [x + dx * lean, 0.12 + h * 1.15, z + dz * lean],
          [0.012, 0.035, 0.012],
          C.dryGrass,
          hips,
          0,
        );
      }
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
```
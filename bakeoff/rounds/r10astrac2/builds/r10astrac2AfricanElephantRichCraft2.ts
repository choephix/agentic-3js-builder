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
} from "../../../../src/index";
import type { Joint, Fill, PointInput } from "../../../../src/index";

export const meta = {
  name: "Savanna Monarch",
  description:
    "A mature African bush elephant: broad cupped ears, continuous sweeping ivory tusks, recessed amber eyes, articulated trunk, and substantial dusty feet on a quiet savanna vignette.",
};

/*
1. Rebuild the tusks with explicitly sampled tapered geometry: the former
   sweep simplified the curves into visibly broken, angular elbows.
2. Make each leg and foot one continuous skin, removing the zigzag ankle
   intersections and raised, bead-like toenails.
3. Recess the eyes, reduce the eyebrows and cheek masses, and broaden the
   trunk root. The expression should be dignified, not mechanical.
4. Remove floating shoulder/ear-root wrinkle tubes. Restore the translucent
   drawings with opaque, restrained colors that survive alpha testing.
5. Soften the ears' radial shading, refine their irregular silhouettes,
   and vary the trunk folds. Preserve the low-poly masses and quiet staging.
*/

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "savannaMonarch", paintSize: 2048 });
  const random = rng(78103);

  const C = {
    skin: "#85877e",
    light: "#a5a397",
    shadow: "#626b69",
    crease: "#666e65",
    creaseSoft: "#7b8175",
    lip: "#424a43",
    ivory: "#e8dec0",
    hair: "#414336",
    dryGrass: "#b5a06a",
    grassLight: "#d6bc7e",
    grassDark: "#827a4e",
  };

  const skin = paint((p, n) => {
    let color = mix(
      C.shadow,
      C.light,
      0.37 + noise(p, 0.44, 17) * 0.32 + n.y * 0.13,
    );
    color = mix(
      color,
      "#c4b199",
      Math.max(0, noise(p, 0.095, 45) - 0.53) * 0.16,
    );
    const dust = Math.max(0, 1 - (p.y - 0.12) / 0.95);
    return mix(color, "#b29d7b", dust * 0.36);
  });

  const earSkin = paint((p, n) =>
    mix(
      mix("#798078", "#a39886", noise(p, 0.35, 31) * 0.55),
      "#b5aa95",
      Math.max(0, n.y) * 0.12,
    ),
  );

  const ivory = paint((p, n) => {
    const warmth = Math.min(1, Math.max(0, (p.z - 2.25) / 1.5));
    let color = mix("#c9bea1", "#f2e8ce", 0.38 + warmth * 0.52);
    color = mix(color, "#fff2d5", Math.max(0, n.y) * 0.15);
    return mix(color, "#bfb193", (noise(p, 0.23, 20) - 0.3) * 0.06);
  });

  const nailPaint = mottle("#a09d87", "#bfb59c", {
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
      <path d="M8 54 Q36 23 79 26 Q122 22 153 49
               Q121 77 80 77 Q36 76 8 54Z"
            fill="#555e50" stroke="#818776" stroke-width="6"/>
      <path d="M25 51 Q52 35 82 35 Q117 35 137 50
               Q115 67 81 67 Q48 67 25 51Z" fill="#79765a"/>
      <ellipse cx="83" cy="50" rx="21" ry="20" fill="#735c35"/>
      <ellipse cx="83" cy="52" rx="14" ry="18" fill="#26302a"/>
      <path d="M24 46 Q77 24 139 47" fill="none"
            stroke="#4d5549" stroke-width="9" stroke-linecap="round"/>
      <circle cx="77" cy="44" r="4" fill="#f1ebd3"/>
      <circle cx="91" cy="59" r="1.7" fill="#bbbda7"/>
      <path d="M32 73 Q81 83 133 68" fill="none"
            stroke="#9d9e88" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  // Solid muted strokes: sub-50%-alpha strokes disappear in the atlas.
  const earDrawing = svg(
    `<svg viewBox="0 0 240 340">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M27 147 Q85 105 154 46
                 M29 151 Q108 142 206 111
                 M27 157 Q106 175 213 190
                 M30 164 Q95 225 168 283
                 M30 170 Q57 248 84 315"
              stroke="#747b6e" stroke-width="2.7"/>
        <path d="M47 135 Q61 91 83 54
                 M84 108 Q107 94 143 91
                 M119 146 Q135 119 151 101
                 M152 136 Q179 142 199 152
                 M94 176 Q116 203 119 239
                 M144 182 Q168 165 191 168
                 M81 215 Q72 250 65 273
                 M122 247 Q147 245 173 254"
              stroke="#7a8071" stroke-width="2"/>
        <path d="M43 145 Q104 117 159 63
                 M42 163 Q121 180 194 187
                 M43 176 Q82 226 149 282"
              stroke="#959782" stroke-width="2"/>
        <path d="M26 92 Q14 139 32 201 M36 86 Q26 141 45 211
                 M46 91 Q39 145 55 206"
              stroke="#737c6d" stroke-width="3"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const skinDrawing = svg(
    `<svg viewBox="0 0 240 180">
      <g fill="none" stroke="#757e6e" stroke-width="2.6"
         stroke-linecap="round">
        <path d="M17 28 Q85 43 139 21 M33 53 Q104 67 207 38"/>
        <path d="M9 78 Q100 99 227 65 M26 109 Q133 123 212 94"/>
        <path d="M48 139 Q119 154 194 132 M81 164 Q137 170 171 157"/>
        <path d="M63 39 L59 54 M129 64 L126 81 M80 98 L77 114"/>
      </g>
      <g fill="none" stroke="#929780" stroke-width="2">
        <path d="M17 32 Q85 47 139 25 M26 113 Q133 127 212 98"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const shoulderDrawing = svg(
    `<svg viewBox="0 0 140 240">
      <g fill="none" stroke-linecap="round">
        <path d="M30 17 Q58 76 37 155 Q30 192 41 225
                 M49 27 Q74 91 53 161 Q47 185 55 213
                 M70 36 Q89 88 75 143 Q62 179 73 207
                 M92 52 Q106 103 90 147 Q82 169 88 189"
              stroke="#747c6c" stroke-width="3"/>
        <path d="M34 18 Q62 77 41 155 M74 37 Q93 89 79 143"
              stroke="#92957e" stroke-width="2"/>
        <path d="M39 87 L56 92 M49 137 L72 141
                 M55 174 L69 178 M73 69 L94 75"
              stroke="#7a806e" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

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
      [0, 2.98, 2.27],
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
      contact: [x * 1.07, 0.12, points[2][2] + 0.025],
    });
    return {
      side,
      front,
      points,
      x: x * 1.07,
      z: points[2][2],
      chain,
    };
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
    [0.77, 0.85, 0.76],
    skin,
    head,
    2,
  );

  for (const s of [1, -1]) {
    ellipsoid(
      s > 0 ? "cheekL" : "cheekR",
      [s * 0.405, 2.59, 1.98],
      [0.305, 0.39, 0.35],
      skin,
      head,
      1,
    );
  }

  const lowerJaw = ellipsoid(
    "lowerJaw",
    [0, 2.225, 2.075],
    [0.43, 0.205, 0.41],
    skin,
    jaw,
    1,
  );

  const mouthSurface = b.surface(lowerJaw);
  for (const s of [1, -1]) {
    b.sweep(
      mouthSurface.drape(
        [
          [s * 0.4, 2.3, 2.1],
          [s * 0.35, 2.31, 2.32],
          [s * 0.21, 2.29, 2.45],
        ],
        { lift: 0.001 },
      ),
      0.007,
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

    b.decal(skull, eyeDrawing, {
      at: eyeHit,
      dir: eyeHit.n,
      size: [0.195, 0.112],
      up: [0, 1, 0],
      mirror: s > 0,
      bone: head,
      lift: 0.002,
      name: `eye${suffix}`,
    });

    b.sweep(
      headSurface.drape(
        [
          [s * 0.49, 3.105, 2.4],
          [s * 0.61, 3.115, 2.32],
          [s * 0.71, 3.065, 2.18],
        ],
        { lift: 0.001 },
      ),
      [0.006, 0.017, 0.004],
      {
        color: skin,
        bone: head,
        sides: 6,
        name: `brow${suffix}`,
      },
    );

    b.decal(skull, skinDrawing, {
      at: [s * 0.63, 2.835, 2.24],
      dir: [s * 0.6, 0, 0.8],
      size: [0.22, 0.165],
      bone: head,
      mirror: s < 0,
      lift: 0.002,
      name: `eyeWrinkles${suffix}`,
    });
  }

  const earOutline = [
    [0, 0.43],
    [0.27, 0.69],
    [0.62, 0.8],
    [0.98, 0.75],
    [1.24, 0.54],
    [1.43, 0.27],
    [1.51, -0.04],
    [1.46, -0.28],
    [1.37, -0.43],
    [1.39, -0.5],
    [1.25, -0.66],
    [1.13, -0.82],
    [1.03, -1.02],
    [0.83, -1.21],
    [0.6, -1.33],
    [0.4, -1.21],
    [0.23, -0.92],
    [0.1, -0.6],
    [-0.015, -0.3],
    [-0.045, 0.07],
  ];

  function earPoint(s: number, u: number, v: number, lift = 0): number[] {
    const cup =
      0.105 *
      Math.sin(Math.min(1, Math.max(0, u / 1.52)) * Math.PI) *
      Math.max(0.15, 1 - Math.abs(v + 0.2) * 0.38);
    const tipFold = Math.max(0, -v - 0.8) * 0.11;
    return [
      s * (0.59 + u),
      2.94 + v,
      1.29 - 0.36 * u + cup - tipFold + lift,
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
        const thickness = i > count ? 0.013 : 0.032;
        vertices.push(...earPoint(s, u, v, face * thickness));
        uvs.push((u + 0.05) / 1.6, (v + 1.34) / 2.2);
      }
    }

    function triangle(a: number, c: number, d: number, front: boolean) {
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
    });

    b.sweep(
      polyline(
        earOutline.map(([u, v]) => earPoint(s, u, v, 0.002)),
        { closed: true },
      ),
      0.01,
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
      size: [1.49, 2.06],
      mirror: s < 0,
      segments: 18,
      lift: 0.002,
      bone,
      name: `earVeins${suffix}`,
    });
  }

  const trunkTube = b.sweep(
    trunk,
    [0.365, 0.31, 0.255, 0.205, 0.16, 0.122, 0.101],
    {
      name: "trunkSkin",
      color: skin,
      sides: 10,
      smooth: false,
      caps: { start: "round", end: "flat" },
    },
  );

  for (let i = 0; i < 29; i++) {
    const t = 0.12 + (i / 28) * 0.82;
    const spread = 43 + (i % 5) * 8;
    const shift = i % 3 === 0 ? 10 : i % 3 === 1 ? -8 : 0;
    const points = [];
    for (let j = 0; j < 9; j++) {
      const angle = shift - spread + (2 * spread * j) / 8;
      const stagger = 0.0035 * Math.sin(j * 0.95 + i * 0.7);
      points.push(trunkTube.at(t + stagger, angle, 0.0007));
    }
    b.sweep(catmull(points), i < 10 ? 0.0043 : 0.0034, {
      name: `trunkCrease${i + 1}`,
      color: i % 4 === 0 ? C.crease : C.creaseSoft,
      sides: 4,
      caps: "round",
    });
  }

  for (const angle of [-112, 112]) {
    b.sweep(trunkTube.line(angle, 0.001).slice(0.28, 0.86), 0.0028, {
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
    nostril.scale(0.023, 0.006, 0.03);
    b.part(nostril, C.lip, {
      at: trunkEnd.local([s * 0.036, 0.012, 0]),
      dir: trunkEnd.tangent,
      bone: tipBone,
      name: `nostril${s > 0 ? "L" : "R"}`,
    });
  }

  b.sweep(
    [
      [0, 0.66, 3.38],
      [0, 0.675, 3.445],
      [0, 0.66, 3.485],
    ],
    [0.032, 0.024, 0.006],
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
      [0, 0.52, 3.44],
      [0, 0.535, 3.475],
    ],
    [0.028, 0.02, 0.006],
    {
      color: skin,
      bone: tipBone,
      sides: 6,
      name: "trunkLowerFinger",
    },
  );

  // Explicit curved geometry retains every longitudinal station. Nine flat
  // radial faces preserve the primitive-built look without kinked centerlines.
  function tuskGeometry(curve: THREE.CubicBezierCurve3) {
    const rings = 24;
    const sides = 9;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < rings; i++) {
      const t = i / rings;
      const center = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const u = new THREE.Vector3(1, 0, 0);
      u.addScaledVector(tangent, -u.dot(tangent)).normalize();
      const v = new THREE.Vector3().crossVectors(tangent, u).normalize();
      const radius = 0.148 * Math.pow(1 - t, 0.88);
      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        const p = center
          .clone()
          .addScaledVector(u, Math.cos(angle) * radius)
          .addScaledVector(v, Math.sin(angle) * radius);
        positions.push(p.x, p.y, p.z);
        uvs.push(j / sides, t);
      }
    }

    for (let i = 0; i < rings - 1; i++) {
      for (let j = 0; j < sides; j++) {
        const next = (j + 1) % sides;
        const a = i * sides + j;
        const c = i * sides + next;
        const d = (i + 1) * sides + j;
        const e = (i + 1) * sides + next;
        indices.push(a, c, d, c, e, d);
      }
    }

    const tipIndex = positions.length / 3;
    const tip = curve.getPoint(1);
    positions.push(tip.x, tip.y, tip.z);
    uvs.push(0.5, 1);
    for (let j = 0; j < sides; j++) {
      indices.push(
        (rings - 1) * sides + j,
        (rings - 1) * sides + ((j + 1) % sides),
        tipIndex,
      );
    }

    const rootIndex = positions.length / 3;
    const root = curve.getPoint(0);
    positions.push(root.x, root.y, root.z);
    uvs.push(0.5, 0);
    for (let j = 0; j < sides; j++) {
      indices.push(rootIndex, (j + 1) % sides, j);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";

    b.sweep(
      [
        [s * 0.445, 2.35, 2.105],
        [s * 0.545, 2.19, 2.335],
      ],
      [0.205, 0.166],
      {
        name: `tuskSocket${suffix}`,
        color: skin,
        sides: 10,
        bone: head,
        caps: { start: "round", end: "flat" },
      },
    );

    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(s * 0.525, 2.245, 2.275),
      new THREE.Vector3(s * 0.72, 1.6, 2.83),
      new THREE.Vector3(s * 0.99, 1.53, 3.36),
      new THREE.Vector3(s * 0.89, 2.055, 3.83),
    );

    b.part(tuskGeometry(curve), ivory, {
      at: [0, 0, 0],
      bone: head,
      flat: true,
      name: `tusk${suffix}`,
    });
  }

  function interpolateRadius(y: number, front: boolean) {
    const stations = [
      [0.12, 0.328],
      [0.22, 0.348],
      [0.37, 0.327],
      [0.62, 0.274],
      [1.02, 0.287],
      [1.35, 0.326],
      [1.95, front ? 0.385 : 0.402],
      [2.7, front ? 0.435 : 0.475],
    ];
    if (y <= stations[0][0]) return stations[0][1];
    for (let i = 1; i < stations.length; i++) {
      if (y <= stations[i][0]) {
        const a = stations[i - 1];
        const c = stations[i];
        const t = (y - a[0]) / (c[0] - a[0]);
        return a[1] + (c[1] - a[1]) * t;
      }
    }
    return stations[stations.length - 1][1];
  }

  for (const leg of legs) {
    const { side, front, x, z, chain, points } = leg;
    const legPath = catmull([
      points[0],
      points[1],
      [x, 0.64, z],
      [x, 0.37, z + 0.025],
      [x, 0.22, z + 0.025],
      [x, 0.12, z + 0.025],
    ]);

    const legTube = b.sweep(
      legPath,
      (t) => interpolateRadius(legPath.at(t).y, front),
      {
        name: `legAndFoot${side}`,
        bone: chain,
        color: skin,
        sides: 10,
        smooth: false,
        caps: { start: "round", end: "flat" },
      },
    );

    const footBone = chain.tip ?? chain.joints[chain.joints.length - 1];
    const legSurface = b.surface(legTube);
    const numberOfNails = front ? 4 : 3;

    for (let j = 0; j < numberOfNails; j++) {
      const a = ((j - (numberOfNails - 1) / 2) * 29 * Math.PI) / 180;
      const hit = legSurface.nearest([
        x + Math.sin(a) * 0.5,
        0.225,
        z + 0.025 + Math.cos(a) * 0.5,
      ]);
      const nail = new THREE.SphereGeometry(1, 8, 6);
      nail.scale(0.076, 0.016, 0.075);
      b.stick(nail, nailPaint, hit, {
        embed: 0.25,
        flow: [0, 1, 0],
        bone: footBone,
        name: `nail${side}${j + 1}`,
      });
    }

    b.decal(legTube, skinDrawing, {
      at: [x, 1.38, z + 0.4],
      dir: [0, 0, 1],
      size: [0.4, 0.3],
      segments: 9,
      lift: 0.002,
      name: `kneeWrinkles${side}`,
    });

    b.decal(legTube, skinDrawing, {
      at: [x, 0.66, z + 0.36],
      dir: [0, 0, 1],
      size: [0.4, 0.21],
      segments: 9,
      bone: footBone,
      lift: 0.002,
      name: `ankleWrinkles${side}`,
    });

    b.decal(legTube, skinDrawing, {
      at: [x, 0.385, z + 0.39],
      dir: [0, 0, 1],
      size: [0.44, 0.14],
      segments: 9,
      bone: footBone,
      lift: 0.002,
      name: `footWrinkles${side}`,
    });
  }

  for (const s of [1, -1]) {
    const suffix = s > 0 ? "L" : "R";

    b.decal(body, skinDrawing, {
      at: [s * 1.0, 2.22, -0.4],
      dir: [s, 0, 0],
      size: [1.12, 0.72],
      roll: s * 12,
      mirror: s < 0,
      segments: 12,
      lift: 0.002,
      name: `flankWrinkles${suffix}`,
    });

    b.decal(body, shoulderDrawing, {
      at: [s * 1.02, 2.58, 0.54],
      dir: [s, 0, 0],
      size: [0.59, 1.13],
      mirror: s < 0,
      segments: 14,
      lift: 0.002,
      name: `shoulderFolds${suffix}`,
    });

    b.decal(body, skinDrawing, {
      at: [s * 0.88, 2.31, -1.33],
      dir: [s, 0, -0.15],
      size: [0.48, 0.43],
      mirror: s > 0,
      segments: 10,
      lift: 0.002,
      name: `haunchWrinkles${suffix}`,
    });
  }

  b.decal(skull, skinDrawing, {
    at: [0, 3.48, 2.44],
    dir: [0, 0.25, 1],
    size: [0.58, 0.31],
    bone: head,
    lift: 0.002,
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

  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.069;
    const hit = headSurface.nearest([x, 3.96, 1.83]);
    b.spike(hit, [x * 0.5, 1, -0.35], 0.028 + (i % 2) * 0.01, 0.003, {
      color: C.hair,
      bone: head,
      sides: 4,
      name: `crownBristle${i + 1}`,
    });
  }

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

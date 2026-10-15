```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
  type Joint,
  type Paint,
} from "agentic-3js-builder";

export const meta = {
  name: "Savanna Matriarch",
  description:
    "An adult African bush elephant: monumental faceted masses, weathered fan ears, amber eyes, curved ivory and a finely articulated trunk, on a quiet patch of sunbaked savanna.",
};

/*
1. Remove the floating bracelet-like folds and projecting body creases.
   Wrinkles now belong to the skin rather than hovering above it.
2. Reverse the ear drawings so their veins originate at the head, soften
   their contrast, and give the ears broad crowns and narrower lower lobes.
3. Bury the trunk root inside the forehead and give the tusks a more
   continuous curve without losing their low-poly cross-sections.
4. Replace the protruding eye sockets, eyebrow rods and bead-like nails
   with quieter, integrated anatomical features.
5. Warm the skin with selective ochre dust and preserve the restrained,
   subordinate savanna setting.
*/

type P = [number, number, number];
type Finish = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Savanna Matriarch",
    paintSize: 2048,
  });
  const random = rng(43719);

  // ------------------------------------------------------------------
  // Materials: warm grey hide, restrained wrinkles and deposited dust.
  // ------------------------------------------------------------------

  const skin = paint((p, n) => {
    const broad = noise(p, 0.47, 17);
    let c = mix("#858783", "#a7a69a", broad);
    c = mix(c, "#727977", Math.max(0, -n.y) * 0.19);
    const pores = smoothstep(0.62, 0.86, noise(p, 0.021, 91));
    c = mix(c, "#72766e", pores * 0.09);

    const lowDust = (1 - smoothstep(0.27, 0.95, p.y)) * 0.33;
    const settledDust =
      smoothstep(0.38, 0.92, n.y) *
      smoothstep(0.36, 0.71, noise(p, 0.53, 67)) *
      0.36;
    return mix(c, "#c5ae8b", lowDust + settledDust);
  });

  const earSkin = paint((p, n) => {
    let c = mix("#96968a", "#aaa28f", noise(p, 0.31, 41));
    const rose = smoothstep(0.38, 0.77, noise(p, 0.19, 71));
    c = mix(c, "#b39b92", rose * 0.24);
    c = mix(c, "#7c8277", noise(p, 0.027, 9) * 0.075);
    return mix(c, "#c0b39a", Math.max(0, n.y) * 0.13);
  });

  const ivory = paint((p, n) => {
    const rootAge = 1 - smoothstep(1.5, 2.94, p.z);
    let c = mix("#eee7cf", "#b8a57d", rootAge * 0.58);
    const grain = Math.sin(p.z * 106 + noise(p, 0.12, 20) * 5);
    c = mix(c, "#c9bd9d", (grain * 0.5 + 0.5) * 0.065);
    return mix(c, "#fff3d9", Math.max(0, n.y) * 0.16);
  });

  const nailFinish = paint((p, n) => {
    const striation = 0.5 + 0.5 * Math.sin(p.x * 173 + p.z * 85);
    let c = mix("#979b8c", "#b9bba6", 0.3 + striation * 0.17);
    c = mix(c, "#96917a", (1 - smoothstep(0.17, 0.35, p.y)) * 0.25);
    return mix(c, "#d0cbb1", Math.max(0, n.y) * 0.1);
  });

  const earth = paint((p, n) => {
    let c = mix("#ac8f63", "#cbb184", noise(p, 0.52, 5));
    c = mix(c, "#dfc795", noise(p, 0.055, 12) * 0.13);
    return mix(c, "#947a54", Math.max(0, -n.y) * 0.3);
  });

  const stone = paint((p, n) =>
    mix(
      mix("#8c8975", "#aaa28b", noise(p, 0.17, 33)),
      "#c3b28d",
      Math.max(0, n.y) * 0.22,
    ),
  );

  // ------------------------------------------------------------------
  // Skeleton. Every appendage has a readable, independent rig.
  // ------------------------------------------------------------------

  const pelvis = b.joint("pelvis", {
    at: [0, 2.13, -1.66],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    [
      [0, 2.13, -1.66],
      [0, 2.19, -0.38],
      [0, 2.43, 0.64],
    ],
    {
      parent: pelvis,
      names: ["spine1", "spine2", "chest"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    [
      [0, 2.43, 0.64],
      [0, 2.71, 0.92],
      [0, 2.93, 1.08],
    ],
    {
      parent: spine.tip!,
      names: ["neck1", "neck2", "neckTop"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip!,
    at: [0, 3.05, 1.1],
    dir: [0, 0, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 2.58, 1.03],
    dir: [0, -0.06, 1],
    role: "jaw",
  });

  const trunk = b.chain(
    "trunk",
    [
      [0, 3.3, 1.365],
      [0, 3.095, 1.67],
      [0, 2.72, 1.89],
      [0, 2.25, 2.035],
      [0, 1.78, 2.125],
      [0, 1.32, 2.235],
      [0, 0.94, 2.42],
      [0, 0.69, 2.73],
      [0, 0.65, 3.06],
    ],
    {
      parent: head,
      names: [
        "trunk1",
        "trunk2",
        "trunk3",
        "trunk4",
        "trunk5",
        "trunk6",
        "trunk7",
        "trunk8",
        "trunkTip",
      ],
      role: "tentacle",
    },
  );

  const upperFinger = b.joint("trunkFingerUpper", {
    parent: trunk.tip!,
    at: [0, 0.715, 3.015],
    dir: [0, 0, 1],
    role: "digit",
  });

  const lowerFinger = b.joint("trunkFingerLower", {
    parent: trunk.tip!,
    at: [0, 0.586, 3.015],
    dir: [0, 0, 1],
    role: "digit",
  });

  const earJoints = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.59, 3.08, 0.77],
      dir: [s, 0, -0.24],
      role: "hinge",
    }),
  );

  const legSpecs = [
    { side: 1, front: true, suffix: "L", z: 0.57 },
    { side: -1, front: true, suffix: "R", z: 0.57 },
    { side: 1, front: false, suffix: "HL", z: -1.64 },
    { side: -1, front: false, suffix: "HR", z: -1.64 },
  ];

  const legs = legSpecs.map((spec) => {
    const { side: s, front, suffix, z } = spec;
    const x = s * (front ? 0.79 : 0.77);
    const points: P[] = front
      ? [
          [x, 2.42, z],
          [x + s * 0.035, 1.42, z + 0.08],
          [x + s * 0.035, 0.65, z + 0.18],
          [x + s * 0.035, 0.39, z + 0.28],
        ]
      : [
          [x, 2.23, z],
          [x + s * 0.075, 1.43, z + 0.15],
          [x + s * 0.1, 0.69, z - 0.015],
          [x + s * 0.1, 0.39, z + 0.14],
        ];

    const chain = b.chain(`leg${suffix}`, points, {
      parent: front ? spine.tip! : pelvis,
      names: front
        ? [
            `shoulder${suffix}`,
            `elbow${suffix}`,
            `wrist${suffix}`,
            `foot${suffix}`,
          ]
        : [
            `hip${suffix}`,
            `knee${suffix}`,
            `ankle${suffix}`,
            `foot${suffix}`,
          ],
      role: "leg",
      contact: [points[3][0], 0.15, points[3][2]],
    });

    return { ...spec, points, chain };
  });

  const tail = b.chain(
    "tail",
    [
      [0, 2.27, -2.27],
      [0.12, 1.97, -2.5],
      [0.25, 1.55, -2.64],
      [0.34, 1.17, -2.68],
    ],
    {
      parent: pelvis,
      names: ["tail1", "tail2", "tail3", "tailTip"],
      role: "tail",
    },
  );

  // ------------------------------------------------------------------
  // Reusable primitive placement.
  // ------------------------------------------------------------------

  function ellipsoid(
    name: string,
    at: P,
    size: P,
    color: Finish,
    bone: Joint,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, 7), color, {
      name,
      at,
      scale: size,
      bone,
      flat: true,
    });
  }

  // ------------------------------------------------------------------
  // Drawings: understated rather than decorative anatomical markings.
  // ------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 54 Q45 30 89 32 Q130 32 170 53
        Q132 72 88 72 Q47 71 9 54Z" fill="#858b7c"/>
      <path d="M19 54 Q52 38 89 38 Q127 38 160 54
        Q126 65 89 65 Q51 65 19 54Z" fill="#a6aa94"/>
      <ellipse cx="92" cy="52" rx="22" ry="19" fill="#675a43"/>
      <ellipse cx="93" cy="54" rx="16" ry="17" fill="#9b7e49"/>
      <path d="M81 63 Q94 71 106 60" fill="none"
        stroke="#b49b65" stroke-width="3.5"/>
      <ellipse cx="94" cy="52" rx="10" ry="16" fill="#29332e"/>
      <ellipse cx="87" cy="45" rx="4" ry="3.7" fill="#f0ecd9"/>
      <circle cx="100" cy="58" r="1.8" fill="#d0d0b9"/>
      <path d="M13 53 Q49 31 89 33 Q131 33 166 53"
        fill="none" stroke="#535f53" stroke-width="5"
        stroke-linecap="round"/>
      <path d="M31 74 Q89 83 146 71"
        fill="none" stroke="#8a9180" stroke-width="2.7"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M20 34 Q114 7 218 34
          M39 57 Q120 37 206 57 M63 82 Q122 67 184 82"
          stroke="#8a8f81" stroke-width="3"/>
        <path d="M29 39 Q121 18 211 39
          M46 62 Q119 46 198 62"
          stroke="#b4b39f" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const cheekTexture = svg(
    `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M17 21 Q74 33 98 67 M12 49 Q65 62 93 93
          M14 80 Q61 89 80 121 M20 113 Q54 124 64 148"
          stroke="#899080" stroke-width="3"/>
        <path d="M22 27 Q68 41 91 70 M18 55 Q61 69 85 95
          M20 86 Q53 95 73 123"
          stroke="#b1b29f" stroke-width="2.3"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 220 250" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 109 C47 95 66 62 98 46
          C117 35 134 29 154 24
          M17 115 C69 94 107 91 150 73 C170 65 184 57 195 46
          M18 121 C80 110 131 119 196 101
          M19 126 C75 128 112 150 187 154
          M21 130 C60 150 89 182 146 206
          M23 134 C47 167 64 198 88 223"
          stroke="#959788" stroke-width="2.2"/>
        <path d="M70 65 Q80 47 78 35 M105 45 Q128 48 142 41
          M87 94 Q109 75 116 60 M140 78 Q162 83 179 76
          M100 115 Q128 101 148 101
          M127 118 Q143 134 163 136
          M88 146 Q110 140 128 146
          M109 183 Q116 202 128 214
          M62 191 Q66 207 78 216"
          stroke="#999b8a" stroke-width="2"/>
        <path d="M22 113 C67 94 105 89 149 69
          M27 124 C81 125 124 145 183 150
          M32 140 C60 168 90 194 139 211"
          stroke="#b3ad98" stroke-width="2.3"/>
        <path d="M38 72 Q50 66 57 54 M151 28 Q170 34 181 47
          M185 170 Q176 182 162 188
          M104 224 Q119 227 130 218"
          stroke="#a4a590" stroke-width="2.2"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  // A coherent network, not isolated pale lines resembling loose wires.
  const bodyCreases = svg(
    `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M55 19 C76 61 65 96 85 139 Q105 181 98 227
          M81 20 C102 62 89 96 108 136 Q129 176 120 242
          M111 28 C131 65 113 97 132 132 Q153 170 149 218
          M142 42 C160 77 143 107 160 136 Q176 162 179 190
          M32 57 C48 90 42 125 60 157 Q77 187 72 218
          M54 235 Q105 258 161 235
          M72 256 Q113 272 146 257"
          stroke="#8b9182" stroke-width="2.7"/>
        <path d="M61 22 C81 63 72 96 91 139
          M88 25 C107 63 96 98 115 138
          M118 33 C136 67 121 98 139 134"
          stroke="#acaf9b" stroke-width="2.2"/>
        <path d="M67 91 L88 99 M89 139 L110 148
          M113 91 L134 100 M134 157 L154 166
          M62 177 L79 184 M101 215 L122 220"
          stroke="#939887" stroke-width="2"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const grassTexture = svg(
    `<svg viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M73 220 Q69 119 43 15 Q81 89 85 220Z" fill="#c4ad71"/>
      <path d="M72 220 Q42 131 9 93 Q62 122 86 220Z" fill="#9c8c59"/>
      <path d="M80 220 Q87 95 111 12 Q103 125 89 220Z" fill="#d3bc7e"/>
      <path d="M82 220 Q123 118 152 90 Q120 152 92 220Z" fill="#b5a16a"/>
      <path d="M77 220 Q51 165 27 153 Q64 163 84 220Z" fill="#d3b77a"/>
      <path d="M89 220 Q111 175 139 162 Q110 198 96 220Z" fill="#8e8858"/>
      <path d="M84 217 Q83 107 84 67" stroke="#e0c78b" stroke-width="3" fill="none"/>
      <path d="M110 49 l-8 -10 M108 61 l12 -12 M106 75 l-9 -11
        M104 87 l11 -11" stroke="#c8ad70" stroke-width="5" fill="none"/>
    </svg>`,
    { size: 256 },
  );

  const footprintTexture = svg(
    `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M31 78 Q27 26 97 22 Q168 22 175 86
        L168 158 Q151 201 100 204 Q43 203 28 159Z"
        fill="#ad9061" stroke="#c5a877" stroke-width="9"/>
      <path d="M43 85 Q45 47 99 45 Q151 46 155 90 L151 156
        Q136 182 100 183 Q64 182 47 156Z" fill="#b49a6a"/>
      <path d="M48 53 Q59 34 73 46 M85 39 Q101 28 115 39
        M128 43 Q145 39 153 60" fill="none"
        stroke="#917b55" stroke-width="9" stroke-linecap="round"/>
      <path d="M46 171 Q98 202 150 173" fill="none"
        stroke="#d8bb85" stroke-width="6"/>
    </svg>`,
    { size: 256 },
  );

  const cracksTexture = svg(
    `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#a58b61" stroke-width="3" stroke-linejoin="round">
        <path d="M17 62 L65 78 L85 48 L130 52 L153 22
          M65 78 L70 121 L111 143 L132 112 L177 107 L195 62 L238 69 L273 40
          M130 52 L148 82 L132 112 M177 107 L201 142 L248 153
          M70 121 L28 147 M195 62 L186 28 M238 69 L259 104 L291 112"/>
      </g>
      <g fill="none" stroke="#d0b481" stroke-width="2.2">
        <path d="M20 68 L61 84 L65 120 M88 53 L127 58 L142 82
          M138 117 L174 113 L196 146 M201 66 L236 75 L255 107"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  // ------------------------------------------------------------------
  // Monumental body masses.
  // ------------------------------------------------------------------

  const torso = b.loft(
    [
      { at: [0, 2.04, -2.31], w: 0.9, h: 1.14 },
      { at: [0, 2.13, -1.84], w: 1.95, h: 1.79 },
      { at: [0, 2.09, -0.91], w: 2.21, h: 1.82 },
      { at: [0, 2.22, -0.04], w: 2.17, h: 1.88 },
      { at: [0, 2.41, 0.58], w: 1.86, h: 1.73 },
      { at: [0, 2.59, 1.02], w: 1.15, h: 1.12 },
    ],
    {
      bone: [pelvis, spine, neck],
      color: skin,
      sides: 12,
      smooth: false,
      name: "saddleBackAndBelly",
    },
  );

  const shoulders = [1, -1].map((s) =>
    ellipsoid(
      `shoulderMass${s > 0 ? "L" : "R"}`,
      [s * 0.75, 2.2, 0.45],
      [0.43, 0.76, 0.61],
      skin,
      spine.tip!,
      12,
    ),
  );

  const haunches = [1, -1].map((s) =>
    ellipsoid(
      `haunchMass${s > 0 ? "L" : "R"}`,
      [s * 0.75, 2.04, -1.65],
      [0.46, 0.75, 0.65],
      skin,
      pelvis,
      12,
    ),
  );

  // ------------------------------------------------------------------
  // Face: eyes lie on the skull, without separate protruding sockets.
  // ------------------------------------------------------------------

  const skull = ellipsoid(
    "broadAfricanForehead",
    [0, 3.055, 1.075],
    [0.735, 0.7, 0.69],
    skin,
    head,
    14,
  );

  const cheeks = [1, -1].map((s) =>
    ellipsoid(
      `cheek${s > 0 ? "L" : "R"}`,
      [s * 0.47, 2.755, 1.15],
      [0.305, 0.43, 0.43],
      skin,
      head,
      12,
    ),
  );

  const headSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSurface.around([0, 3.055, 1.075]).at(s * 49, 1);

    b.decal(skull, eyeTexture, {
      name: `amberEye${side}`,
      at: hit,
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.225, 0.125],
      mirror: s > 0,
      lift: 0.003,
      bone: head,
      segments: 8,
    });

    b.decal(cheeks[s > 0 ? 0 : 1], cheekTexture, {
      name: `cheekCreases${side}`,
      at: [s * 0.62, 2.79, 1.51],
      dir: [s * 0.4, 0, 1],
      size: [0.27, 0.4],
      mirror: s < 0,
      bone: head,
      lift: 0.002,
      segments: 7,
    });
  }

  b.decal(skull, foreheadTexture, {
    name: "foreheadWisdomLines",
    at: [0, 3.47, 1.66],
    dir: [0, 0.19, 1],
    size: [0.8, 0.28],
    bone: head,
    lift: 0.002,
    segments: 10,
  });

  b.loft(
    [
      { at: [0, 2.53, 1], w: 0.68, h: 0.4 },
      { at: [0, 2.465, 1.34], w: 0.55, h: 0.27 },
      { at: [0, 2.49, 1.61], w: 0.3, h: 0.14 },
    ],
    {
      name: "lowerJaw",
      bone: jaw,
      color: skin,
      sides: 8,
      smooth: false,
    },
  );

  ellipsoid(
    "mouthInterior",
    [0, 2.59, 1.405],
    [0.27, 0.048, 0.18],
    "#505951",
    jaw,
    8,
  );

  b.sweep(
    catmull([
      [-0.235, 2.51, 1.48],
      [-0.12, 2.485, 1.59],
      [0.12, 2.485, 1.59],
      [0.235, 2.51, 1.48],
    ]),
    0.023,
    {
      name: "lowerLip",
      color: skin,
      bone: jaw,
      sides: 6,
    },
  );

  // ------------------------------------------------------------------
  // Great fan ears: broad upper edge, tapered lower lobe, shallow cup.
  // ------------------------------------------------------------------

  const earOutline: [number, number][] = [
    [0, -0.06],
    [0.12, -0.39],
    [0.3, -0.83],
    [0.5, -1.1],
    [0.72, -1.21],
    [0.9, -1.14],
    [1.015, -0.99],
    [1.12, -0.975],
    [1.36, -0.68],
    [1.51, -0.36],
    [1.59, -0.06],
    [1.56, 0.22],
    [1.4, 0.5],
    [1.16, 0.7],
    [0.9, 0.77],
    [0.65, 0.69],
    [0.43, 0.52],
    [0.23, 0.32],
    [0.075, 0.18],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bone = earJoints[s > 0 ? 0 : 1];

    const ep = (u: number, v: number, lift = 0): P => [
      s * (0.59 + u),
      3.08 + v,
      0.77 - u * 0.32 + lift,
    ];

    const ear = b.slab(
      earOutline.map(([u, v]) => ep(u, v)),
      {
        name: `greatFanEar${side}`,
        color: skin,
        thickness: 0.073,
        bone,
      },
    );

    const upper: P[] = [
      ep(0.07, 0.04, 0.055),
      ep(0.3, 0.34, 0.06),
      ep(0.58, 0.56, 0.075),
      ep(0.89, 0.67, 0.085),
      ep(1.16, 0.59, 0.09),
      ep(1.39, 0.36, 0.09),
      ep(1.5, 0.08, 0.075),
    ];

    const lower: P[] = [
      ep(0.07, 0.04, 0.055),
      ep(0.25, -0.53, 0.06),
      ep(0.47, -0.97, 0.075),
      ep(0.71, -1.11, 0.085),
      ep(0.99, -0.91, 0.09),
      ep(1.29, -0.59, 0.095),
      ep(1.5, 0.08, 0.075),
    ];

    const inner = b.membrane(upper, lower, {
      name: `cuppedEarSkin${side}`,
      color: earSkin,
      thickness: 0.015,
      rows: 4,
      cols: 10,
      bone,
    });

    b.sweep(
      catmull(
        earOutline.map(([u, v]) => ep(u, v, 0.035)),
        { closed: true },
      ),
      0.009,
      {
        name: `softEarMargin${side}`,
        color: skin,
        sides: 5,
        bone,
      },
    );

    b.decal(inner, earTexture, {
      name: `fineEarVeins${side}`,
      at: ep(0.83, -0.18, 0.23),
      dir: [s * 0.32, 0, 1],
      up: [0, 1, 0],
      size: [1.46, 1.75],
      mirror: s < 0,
      bone,
      lift: 0.0015,
      segments: 14,
    });

    // Root relief is deliberately short and buried into the hinge.
    const earSurface = b.surface([ear, inner]);
    b.sweep(
      earSurface.drape(
        [
          ep(0.05, 0.17, 0.2),
          ep(0.095, -0.03, 0.2),
          ep(0.14, -0.3, 0.2),
          ep(0.235, -0.54, 0.2),
        ],
        { lift: 0 },
      ),
      [0.032, 0.013],
      {
        name: `earRootCartilage${side}`,
        color: skin,
        bone,
        sides: 6,
      },
    );
  }

  // ------------------------------------------------------------------
  // Tusks. Sampled from one curve: enough longitudinal facets for a
  // sweeping arc, with a deliberately octagonal-looking cross-section.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    ellipsoid(
      `tuskRootPad${side}`,
      [s * 0.49, 2.645, 1.45],
      [0.19, 0.21, 0.22],
      skin,
      head,
      10,
    );

    const curve = catmull([
      [s * 0.49, 2.64, 1.43],
      [s * 0.6, 2.43, 1.76],
      [s * 0.76, 2.335, 2.17],
      [s * 0.89, 2.405, 2.57],
      [s * 0.945, 2.59, 2.92],
      [s * 0.925, 2.795, 3.13],
    ]);

    const samples = Array.from(
      { length: 22 },
      (_, i) => curve.at(i / 21),
    );

    b.sweep(samples, (t) => 0.15 * Math.pow(1 - t, 0.86), {
      name: `sweepingIvoryTusk${side}`,
      bone: head,
      color: ivory,
      sides: 10,
      smooth: false,
      detail: 1.5,
      caps: { start: "flat", end: "point" },
    });
  }

  // ------------------------------------------------------------------
  // Integrated trunk wrinkles, subordinate to the trunk's silhouette.
  // ------------------------------------------------------------------

  const trunkFinish = paint((p, n, uv) => {
    const t = uv[0];
    const a = (uv[1] * Math.PI) / 180;
    const wandering =
      Math.sin(a * 2.1 + t * 17) * 0.12 +
      Math.sin(a * 4.7 - t * 11) * 0.055;
    const phase = t * 44 + wandering;
    const f = phase - Math.floor(phase);
    const crease = 1 - smoothstep(0.025, 0.085, Math.abs(f - 0.36));
    const ridge = 1 - smoothstep(0.03, 0.1, Math.abs(f - 0.49));
    const emphasis = 0.09 + 0.065 * (0.5 + 0.5 * Math.cos(a));
    const c = mix(skin.at(p, n), "#737b70", crease * emphasis);
    return mix(c, "#b5b7a2", ridge * 0.085);
  });

  b.sweep(
    trunk,
    [0.35, 0.315, 0.262, 0.218, 0.18, 0.148, 0.123, 0.108, 0.1],
    {
      name: "articulatedTrunk",
      color: trunkFinish,
      sides: 12,
      smooth: false,
      caps: "flat",
      detail: 1.2,
    },
  );

  b.sweep(
    catmull([
      [0, 0.715, 3.005],
      [0, 0.752, 3.075],
      [0, 0.748, 3.165],
      [0, 0.721, 3.205],
    ]),
    [0.059, 0.044, 0.025, 0.008],
    {
      name: "upperTrunkFinger",
      bone: upperFinger,
      color: skin,
      sides: 6,
      caps: "round",
    },
  );

  b.sweep(
    catmull([
      [0, 0.586, 3.005],
      [0, 0.565, 3.087],
      [0, 0.592, 3.165],
    ]),
    [0.051, 0.031, 0.008],
    {
      name: "lowerTrunkFinger",
      bone: lowerFinger,
      color: skin,
      sides: 6,
      caps: "round",
    },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), "#3b4840", {
      name: `trunkNostril${s > 0 ? "L" : "R"}`,
      at: [s * 0.043, 0.65, 3.069],
      scale: [0.024, 0.029, 0.007],
      bone: trunk.tip!,
      flat: true,
    });
  }

  // ------------------------------------------------------------------
  // Pillar legs. No added loops or draped lines can leave the surface.
  // ------------------------------------------------------------------

  const legFinish = paint((p, n, uv) => {
    const t = uv[0];
    const a = (uv[1] * Math.PI) / 180;
    const phase = t * 33 + Math.sin(a * 2 + t * 9) * 0.12;
    const f = phase - Math.floor(phase);
    const crease = 1 - smoothstep(0.025, 0.09, Math.abs(f - 0.4));
    const ankle = smoothstep(0.7, 0.84, t);
    const knee = Math.exp(-Math.pow((t - 0.47) / 0.075, 2));
    const amount = 0.025 + ankle * 0.11 + knee * 0.07;
    return mix(skin.at(p, n), "#757e70", crease * amount);
  });

  for (const leg of legs) {
    const { chain, suffix, front, points } = leg;

    b.sweep(
      chain,
      front ? [0.385, 0.31, 0.258, 0.3] : [0.415, 0.32, 0.255, 0.3],
      {
        name: `pillarLeg${suffix}`,
        color: legFinish,
        sides: 10,
        smooth: false,
        caps: "flat",
      },
    );

    const footCenter: P = [
      points[3][0],
      0.345,
      points[3][2] + 0.045,
    ];
    const r = front ? 0.368 : 0.355;

    const foot = b.lathe(
      [
        [0, 0],
        [r * 0.9, 0],
        [r, 0.048],
        [r * 1.025, 0.14],
        [r * 0.985, 0.25],
        [r * 0.83, 0.36],
        [r * 0.77, 0.43],
        [0, 0.43],
      ],
      {
        name: `flatSoleFoot${suffix}`,
        at: [footCenter[0], 0.15, footCenter[2]],
        color: skin,
        segments: 12,
        bone: chain.tip!,
      },
    );

    const footSurface = b.surface(foot);
    const count = front ? 4 : 3;

    for (let i = 0; i < count; i++) {
      const azimuth = -54 + (i / (count - 1)) * 108;
      const a = (azimuth * Math.PI) / 180;
      const direction: P = [Math.sin(a), 0, Math.cos(a)];
      const hit = footSurface.ray(
        [
          footCenter[0] + Math.sin(a) * 0.75,
          0.235,
          footCenter[2] + Math.cos(a) * 0.75,
        ],
        [-direction[0], 0, -direction[2]],
      );

      if (!hit) continue;

      // A very shallow, broad shield: the nail grows out of the foot,
      // rather than reading as a round stone glued onto it.
      b.stick(
        new THREE.SphereGeometry(1, 8, 6),
        nailFinish,
        hit,
        {
          name: `toenail${suffix}${i + 1}`,
          scale: [front ? 0.074 : 0.084, 0.011, 0.067],
          embed: 0.42,
          flow: [0, 1, 0],
          bone: chain.tip!,
        },
      );
    }
  }

  // ------------------------------------------------------------------
  // Quiet wrinkles conformed directly onto the shoulders and haunches.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const index = s > 0 ? 0 : 1;

    b.decal(shoulders[index], bodyCreases, {
      name: `shoulderSkinCreases${side}`,
      at: [s * 1.25, 2.16, 0.43],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.68, 1.08],
      mirror: s > 0,
      lift: 0.0015,
      bone: spine.tip!,
      segments: 12,
    });

    b.decal(haunches[index], bodyCreases, {
      name: `haunchSkinCreases${side}`,
      at: [s * 1.3, 2.06, -1.65],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.61, 0.92],
      mirror: s > 0,
      lift: 0.0015,
      bone: pelvis,
      segments: 10,
    });
  }

  // A few coarse hairs, rather than a fuzzy coat.
  const crownHits = b.surface(skull).scatter(10, {
    rng: rng(812),
    minDist: 0.08,
    filter: (h) => h.n.y > 0.77 && h.at.z < 1.32,
  });

  crownHits.forEach((hit, i) => {
    b.spike(hit, hit, 0.022 + (i % 3) * 0.004, 0.002, {
      name: `crownBristle${i + 1}`,
      color: "#7c8070",
      sides: 4,
    });
  });

  const backHits = b.surface(torso).scatter(9, {
    rng: rng(271),
    minDist: 0.17,
    filter: (h) => h.n.y > 0.88 && Math.abs(h.at.x) < 0.25,
  });

  backHits.forEach((hit, i) => {
    b.spike(hit, hit, 0.027, 0.0022, {
      name: `backBristle${i + 1}`,
      color: "#7c8070",
      sides: 4,
    });
  });

  // ------------------------------------------------------------------
  // Slender tail with a coarse, tapering brush.
  // ------------------------------------------------------------------

  b.sweep(tail, [0.087, 0.067, 0.048, 0.035], {
    name: "extendedTail",
    color: skin,
    sides: 7,
    smooth: false,
    caps: "round",
  });

  ellipsoid(
    "tailBrushCore",
    [0.345, 1.045, -2.7],
    [0.067, 0.18, 0.058],
    "#464c42",
    tail.tip!,
    8,
  );

  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const x = 0.34 + Math.cos(a) * 0.04;
    const z = -2.69 + Math.sin(a) * 0.035;

    b.sweep(
      catmull([
        [x, 1.18, z],
        [x + Math.cos(a) * 0.025, 1.01, z - 0.01],
        [
          x + Math.cos(a) * 0.068,
          0.8 + (i % 3) * 0.033,
          z - 0.038,
        ],
      ]),
      [0.015, 0.012, 0],
      {
        name: `tailBrushStrand${i + 1}`,
        color: i % 3 === 0 ? "#656b58" : "#464c42",
        sides: 4,
        caps: "point",
        bone: tail.tip!,
      },
    );
  }

  // ------------------------------------------------------------------
  // Compact, low savanna stage.
  // ------------------------------------------------------------------

  b.part(
    new THREE.CylinderGeometry(2.76, 2.84, 0.13, 14),
    "#98774e",
    {
      name: "lowSavannaPlinth",
      at: [0, 0.065, 0.15],
      scale: [1, 1, 1.22],
      bone: pelvis,
      flat: true,
    },
  );

  const ground = b.part(
    new THREE.CylinderGeometry(2.765, 2.76, 0.025, 14),
    earth,
    {
      name: "dustyGround",
      at: [0, 0.1375, 0.15],
      scale: [1, 1, 1.22],
      bone: pelvis,
      flat: true,
    },
  );

  [
    { at: [1.35, 0.153, 1.8] as P, angle: 9, size: 0.57 },
    { at: [-1.1, 0.153, 2.33] as P, angle: -12, size: 0.55 },
    { at: [1.08, 0.153, -2.24] as P, angle: 14, size: 0.5 },
  ].forEach((print, i) => {
    b.part(
      new THREE.PlaneGeometry(print.size, print.size * 1.08),
      "#ffffff",
      {
        name: `oldFootprint${i + 1}`,
        texture: footprintTexture,
        at: print.at,
        rotation: [-90, 0, print.angle],
        bone: pelvis,
      },
    );
  });

  b.decal(ground, cracksTexture, {
    name: "sunBakedEarthCracks",
    at: [0.35, 0.155, 2.35],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [1.15, 0.7],
    lift: 0.002,
    bone: pelvis,
    segments: 4,
  });

  const rockSites: P[] = [
    [2.02, 0.17, -1.45],
    [2.2, 0.16, -1.32],
    [1.92, 0.17, -1.67],
    [-2.17, 0.17, -0.82],
    [-2.32, 0.16, -0.61],
    [-2.12, 0.16, -1.03],
    [1.82, 0.16, 2.1],
    [1.99, 0.16, 2.02],
    [-1.82, 0.16, 2.23],
    [-1.96, 0.16, 2.07],
    [0.91, 0.17, -2.63],
    [0.71, 0.16, -2.74],
    [-1.31, 0.16, -2.48],
    [-1.46, 0.16, -2.35],
    [2.4, 0.16, 0.35],
    [-2.47, 0.16, 0.56],
  ];

  rockSites.forEach((p, i) => {
    const r = 0.075 + random() * 0.1;

    b.part(new THREE.DodecahedronGeometry(1, 0), stone, {
      name: `savannaStone${i + 1}`,
      at: [p[0], p[1] + r * 0.33, p[2]],
      scale: [r * 1.25, r * 0.6, r * (0.75 + random() * 0.6)],
      rotation: [random() * 25, random() * 180, random() * 12],
      bone: pelvis,
      flat: true,
    });
  });

  const grassSites: P[] = [
    [2.12, 0.151, -1.8],
    [2.25, 0.151, -1.63],
    [1.87, 0.151, -2.03],
    [-2.21, 0.151, -1.37],
    [-2.32, 0.151, -1.11],
    [-2.08, 0.151, -1.54],
    [1.26, 0.151, -2.69],
    [1.02, 0.151, -2.77],
    [-1.6, 0.151, -2.41],
    [-1.84, 0.151, -2.19],
    [2.42, 0.151, 0.04],
    [2.48, 0.151, 0.28],
    [-2.5, 0.151, 0.31],
    [-2.48, 0.151, 0.71],
    [2.05, 0.151, 1.96],
    [1.85, 0.151, 2.22],
    [-1.98, 0.151, 1.94],
    [-1.83, 0.151, 2.18],
  ];

  b.cards(
    grassSites.map((p) => frame(p, [0, 1, 0])),
    grassTexture,
    {
      name: "sparseSavannaGrass",
      size: [0.27, 0.39],
      cross: true,
      lean: 3,
      bend: 10,
      vary: 0.26,
      spin: 75,
      rng: rng(233),
      flow: [0.3, 0, 1],
      bone: pelvis,
    },
  );

  for (let i = 0; i < 7; i++) {
    const p = grassSites[i * 2];
    const h = 0.21 + random() * 0.14;

    b.sweep(
      [
        [p[0] + 0.09, 0.15, p[2] - 0.035],
        [p[0] + 0.11, 0.15 + h, p[2] - 0.01],
      ],
      [0.006, 0.002],
      {
        name: `drySeedStalk${i + 1}`,
        color: "#bda775",
        bone: pelvis,
        sides: 4,
        caps: "flat",
      },
    );

    ellipsoid(
      `drySeedHead${i + 1}`,
      [p[0] + 0.11, 0.15 + h, p[2] - 0.01],
      [0.016, 0.039, 0.013],
      "#b3a06c",
      pelvis,
      6,
    );
  }

  return b.root;
}
```
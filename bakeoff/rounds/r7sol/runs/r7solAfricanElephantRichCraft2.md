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
    "An adult African bush elephant: expansive, veined ears, weathered ivory tusks, a long articulated trunk, dusty pillar legs and a quietly detailed savanna setting.",
};

type P = [number, number, number];
type Finish = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "Savanna Matriarch", paintSize: 2048 });
  const random = rng(43719);

  const C = {
    crease: "#626d69",
    creaseLight: "#9b9f91",
    deep: "#35433f",
    earCrease: "#797c73",
    hair: "#333e37",
    ivory: "#e6ddbc",
    sandEdge: "#8f704a",
    sand: "#b69b70",
    grass: "#b9a16b",
    rock: "#938c76",
  };

  // Four continuous, place-specific finishes. The elephant is dusty grey,
  // rather than blue; the warmer colour gathers on crowns and at the feet.
  const skin = paint((p, n) => {
    const cloud = noise(p, 0.43, 17);
    let col = mix("#7a8580", "#a5a89a", cloud);
    col = mix(col, "#626f6c", Math.max(0, -n.y) * 0.2);
    const fine = noise(p, 0.024, 91);
    col = mix(col, "#535f5b", smoothstep(0.62, 0.87, fine) * 0.13);
    const dustAtFeet = (1 - smoothstep(0.23, 0.95, p.y)) * 0.43;
    const dustAbove = smoothstep(0.25, 0.95, n.y) * 0.19;
    return mix(col, "#bea98a", dustAtFeet + dustAbove);
  });

  const earSkin = paint((p, n) => {
    let col = mix("#898d80", "#aaa18e", noise(p, 0.26, 41));
    col = mix(col, "#a58f86", 0.21 + Math.max(0, n.z) * 0.12);
    return mix(col, "#717d75", noise(p, 0.035, 9) * 0.12);
  });

  const ivory = paint((p, n) => {
    const age = 1 - smoothstep(1.42, 2.95, p.z);
    let col = mix("#eee6ca", "#bbaa80", age * 0.63);
    const grain = Math.sin(p.z * 100 + noise(p, 0.12, 20) * 5);
    col = mix(col, "#c7bc97", (grain * 0.5 + 0.5) * 0.09);
    return mix(col, "#fff3d4", Math.max(0, n.y) * 0.2);
  });

  const nailFinish = paint((p, n) => {
    const striation = 0.5 + 0.5 * Math.sin(p.x * 175 + p.z * 81);
    let col = mix("#a4aa98", "#ceccb1", striation * 0.25 + 0.3);
    col = mix(col, "#8e917d", (1 - smoothstep(0.18, 0.4, p.y)) * 0.25);
    return mix(col, "#dedbc2", Math.max(0, n.y) * 0.12);
  });

  const earth = paint((p, n) => {
    let col = mix("#a98c60", "#cbb485", noise(p, 0.52, 5));
    col = mix(col, "#dfc796", noise(p, 0.055, 12) * 0.15);
    return mix(col, "#8f7652", Math.max(0, -n.y) * 0.35);
  });

  const stone = paint((p, n) =>
    mix(
      mix("#8b8874", "#aaa18a", noise(p, 0.17, 33)),
      "#c3b18b",
      Math.max(0, n.y) * 0.23,
    ),
  );

  // ------------------------------------------------------------------
  // Skeleton. All of the animal's moving assemblies are declared first.
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
      [0, 3.27, 1.58],
      [0, 2.98, 1.82],
      [0, 2.59, 1.97],
      [0, 2.12, 2.07],
      [0, 1.66, 2.16],
      [0, 1.22, 2.28],
      [0, 0.87, 2.47],
      [0, 0.67, 2.76],
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

  const earJoints = [1, -1].map((s) =>
    b.joint(s > 0 ? "earL" : "earR", {
      parent: head,
      at: [s * 0.59, 3.08, 0.77],
      dir: [s, 0, -0.18],
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
        ? [`shoulder${suffix}`, `elbow${suffix}`, `wrist${suffix}`, `foot${suffix}`]
        : [`hip${suffix}`, `knee${suffix}`, `ankle${suffix}`, `foot${suffix}`],
      role: "leg",
      contact: [points[3][0], 0.145, points[3][2]],
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
  // Small reusable geometry and placement helpers.
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

  function fold(
    name: string,
    path: P[],
    radius: number,
    color: Finish,
    bone: Joint,
  ) {
    return b.sweep(catmull(path), radius, {
      color,
      bone,
      sides: 5,
      smooth: false,
      caps: "round",
      name,
    });
  }

  function texturedPlane(
    name: string,
    texture: THREE.Texture,
    at: P,
    size: [number, number],
    dir: P,
    bone: Joint,
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      name,
      texture,
      at,
      dir,
      up: [0, 1, 0],
      axis: "z",
      bone,
    });
  }

  // ------------------------------------------------------------------
  // Drawings: quiet anatomical detail, not a noisy geometric surface.
  // ------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 54 Q37 16 82 22 Q125 23 152 52 Q119 78 77 78 Q37 77 8 54Z"
        fill="#525b50" stroke="#536158" stroke-width="9"/>
      <path d="M17 53 Q49 30 84 31 Q120 32 143 53 Q113 70 78 70 Q43 70 17 53Z"
        fill="#b3ad8d"/>
      <ellipse cx="83" cy="51" rx="30" ry="28" fill="#5a4930"/>
      <ellipse cx="84" cy="53" rx="23" ry="23" fill="#92703d"/>
      <path d="M66 63 Q86 78 106 61" fill="none" stroke="#bea16b" stroke-width="5"/>
      <ellipse cx="85" cy="51" rx="14" ry="22" fill="#202f2b"/>
      <ellipse cx="74" cy="40" rx="6" ry="5" fill="#f8f0d9"/>
      <circle cx="95" cy="59" r="2.6" fill="#d1d4bc"/>
      <path d="M8 52 Q46 14 84 24 Q126 25 153 51"
        fill="none" stroke="#34443e" stroke-width="10" stroke-linecap="round"/>
      <path d="M22 76 Q81 94 139 73" fill="none"
        stroke="#69796b" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M21 34 Q113 6 217 34" stroke="#727e73" stroke-width="4"/>
        <path d="M37 52 Q119 31 207 52" stroke="#66756c" stroke-width="4"/>
        <path d="M49 73 Q122 54 194 74" stroke="#6e7b70" stroke-width="4"/>
        <path d="M67 94 Q120 81 175 94" stroke="#758174" stroke-width="3.5"/>
        <path d="M30 40 Q121 15 211 40" stroke="#b4b5a1" stroke-width="2.5"/>
        <path d="M43 58 Q119 39 200 58" stroke="#acb09c" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const cheekTexture = svg(
    `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M17 21 Q74 33 98 67 M12 47 Q65 60 93 91
          M12 74 Q61 86 80 117 M16 103 Q54 115 66 146"
          stroke="#6a786d" stroke-width="4"/>
        <path d="M22 29 Q68 43 91 72 M17 55 Q61 69 85 95
          M17 83 Q53 94 73 122"
          stroke="#adb09c" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 105 Q70 86 156 27
          M25 111 Q98 99 181 70
          M24 119 Q102 127 187 121
          M26 125 Q95 149 166 176
          M28 130 Q76 177 112 207"
          stroke="#7c8175" stroke-width="3.7"/>
        <path d="M86 72 L92 40 M111 55 L137 52 M101 99 L131 78
          M124 94 L149 102 M93 126 L128 113 M125 129 L151 143
          M81 149 L111 147 M115 162 L125 186 M65 170 L82 189"
          stroke="#858778" stroke-width="2.5"/>
        <path d="M23 98 Q89 74 148 26 M30 116 Q107 119 182 115
          M36 130 Q100 156 160 181"
          stroke="#b4aa95" stroke-width="2.3"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  let trunkMarks = "";
  for (let i = 0; i < 27; i++) {
    const y = 14 + i * 17.7;
    const half = 68 - i * 1.65;
    const cx = 90;
    trunkMarks += `
      <path d="M${cx - half} ${y} Q${cx} ${y + 14} ${cx + half} ${y}"
        stroke="${i % 3 === 0 ? "#66746c" : "#758175"}"
        stroke-width="${i < 8 ? 3.8 : 3.1}" fill="none" stroke-linecap="round"/>
      <path d="M${cx - half + 5} ${y + 5} Q${cx} ${y + 17} ${cx + half - 5} ${y + 5}"
        stroke="#b0b39e" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;
  }
  const trunkTexture = svg(
    `<svg viewBox="0 0 180 500" xmlns="http://www.w3.org/2000/svg">${trunkMarks}</svg>`,
    { size: 768 },
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
        Q136 182 100 183 Q64 182 47 156Z"
        fill="#b49a6a"/>
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
      <g fill="none" stroke="#927b56" stroke-width="3.3" stroke-linejoin="round">
        <path d="M17 62 L65 78 L85 48 L130 52 L153 22
          M65 78 L70 121 L111 143 L132 112 L177 107 L195 62 L238 69 L273 40
          M130 52 L148 82 L132 112 M177 107 L201 142 L248 153
          M70 121 L28 147 M195 62 L186 28 M238 69 L259 104 L291 112"/>
      </g>
      <g fill="none" stroke="#d5b985" stroke-width="2.2">
        <path d="M20 68 L61 84 L65 120 M88 53 L127 58 L142 82
          M138 117 L174 113 L196 146 M201 66 L236 75 L255 107"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  // ------------------------------------------------------------------
  // Large masses. The saddle dips gently between rump and shoulders.
  // ------------------------------------------------------------------

  const torso = b.loft(
    [
      { at: [0, 2.04, -2.31], w: 0.9, h: 1.14 },
      { at: [0, 2.13, -1.84], w: 1.95, h: 1.79 },
      { at: [0, 2.09, -0.91], w: 2.21, h: 1.77 },
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

  const shoulderMasses = [];
  const haunchMasses = [];

  for (const s of [1, -1]) {
    shoulderMasses.push(
      ellipsoid(
        `shoulderMass${s > 0 ? "L" : "R"}`,
        [s * 0.77, 2.2, 0.45],
        [0.43, 0.76, 0.61],
        skin,
        spine.tip!,
      ),
    );
    haunchMasses.push(
      ellipsoid(
        `haunchMass${s > 0 ? "L" : "R"}`,
        [s * 0.76, 2.04, -1.65],
        [0.47, 0.75, 0.65],
        skin,
        pelvis,
      ),
    );
  }

  // ------------------------------------------------------------------
  // Head and face. The eyes are settled before ears and tusks surround it.
  // ------------------------------------------------------------------

  const skull = ellipsoid(
    "broadAfricanForehead",
    [0, 3.055, 1.075],
    [0.735, 0.70, 0.69],
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
    ),
  );

  const headSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSurface.around([0, 3.055, 1.075]).at(s * 48, 1);

    const socket = b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      "#7b8578",
      hit,
      {
        name: `eyeSocket${side}`,
        scale: [0.163, 0.042, 0.113],
        embed: 0.3,
        flow: [0, 1, 0],
        bone: head,
      },
    );

    b.decal(socket, eyeTexture, {
      name: `amberEye${side}`,
      at: hit.moved([0, 0.065, 0]),
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.247, 0.153],
      mirror: s > 0,
      lift: 0.002,
      bone: head,
      segments: 8,
    });

    const browRough: P[] = [
      [s * 0.35, 3.245, 1.73],
      [s * 0.49, 3.255, 1.73],
      [s * 0.64, 3.21, 1.66],
      [s * 0.73, 3.13, 1.51],
    ];
    b.sweep(headSurface.drape(browRough, { lift: 0.012 }), [0.043, 0.029], {
      name: `heavyBrow${side}`,
      color: skin,
      sides: 6,
      bone: head,
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
    at: [0, 3.43, 1.66],
    dir: [0, 0.19, 1],
    size: [0.87, 0.39],
    bone: head,
    lift: 0.002,
    segments: 10,
  });

  // A distinct mandible and dark oral interior can rotate on the jaw joint.
  b.loft(
    [
      { at: [0, 2.53, 1.0], w: 0.68, h: 0.4 },
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
    [0.27, 0.07, 0.2],
    C.deep,
    jaw,
    8,
  );

  fold(
    "lowerLip",
    [
      [-0.235, 2.51, 1.48],
      [-0.12, 2.485, 1.59],
      [0.12, 2.485, 1.59],
      [0.235, 2.51, 1.48],
    ],
    0.035,
    skin,
    jaw,
  );

  // ------------------------------------------------------------------
  // Monumental fan ears: thick faceted silhouettes, inset warm skin,
  // structural folds, a softly rolled margin, and delicate painted veins.
  // ------------------------------------------------------------------

  const earOutline: [number, number][] = [
    [0, -0.06],
    [0.12, -0.39],
    [0.30, -0.83],
    [0.49, -1.08],
    [0.73, -1.19],
    [0.96, -1.15],
    [1.08, -1.04],
    [1.2, -0.99],
    [1.39, -0.69],
    [1.48, -0.4],
    [1.59, -0.12],
    [1.6, 0.12],
    [1.49, 0.4],
    [1.28, 0.62],
    [1.01, 0.73],
    [0.76, 0.72],
    [0.48, 0.59],
    [0.23, 0.36],
    [0.075, 0.18],
  ];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const earBone = earJoints[s > 0 ? 0 : 1];
    const ep = (u: number, v: number, lift = 0): P => [
      s * (0.59 + u),
      3.08 + v,
      0.77 - u * 0.18 + lift,
    ];

    const ear = b.slab(
      earOutline.map(([u, v]) => ep(u, v)),
      {
        name: `greatFanEar${side}`,
        color: skin,
        thickness: 0.115,
        bone: earBone,
      },
    );

    const inner = b.slab(
      earOutline.map(([u, v]) => ep(0.095 + u * 0.86, v * 0.87 - 0.015, 0.062)),
      {
        name: `earInnerSkin${side}`,
        color: earSkin,
        thickness: 0.018,
        bone: earBone,
      },
    );

    b.sweep(
      catmull(earOutline.map(([u, v]) => ep(u, v, 0.05)), { closed: true }),
      0.024,
      {
        name: `rolledEarMargin${side}`,
        color: skin,
        sides: 6,
        bone: earBone,
      },
    );

    const earSurface = b.surface([ear, inner]);

    const rays = [
      { end: [0.95, 0.6], mid: [0.43, 0.18] },
      { end: [1.42, 0.31], mid: [0.7, 0.06] },
      { end: [1.48, -0.13], mid: [0.77, -0.18] },
      { end: [1.25, -0.67], mid: [0.7, -0.46] },
      { end: [0.85, -1.04], mid: [0.45, -0.58] },
    ];

    rays.forEach((ray, i) => {
      const path: P[] = [
        ep(0.06, -0.15, 0.2),
        ep(0.29, -0.18, 0.2),
        ep(ray.mid[0], ray.mid[1], 0.2),
        ep(ray.end[0], ray.end[1], 0.2),
      ];
      b.sweep(earSurface.drape(path, { lift: 0.004 }), [0.024, 0.007], {
        name: `earRadialFold${side}${i + 1}`,
        color: i % 2 ? C.earCrease : skin,
        bone: earBone,
        sides: 5,
      });
    });

    b.decal(inner, earTexture, {
      name: `earVeins${side}`,
      at: ep(0.86, -0.16, 0.2),
      dir: [s * 0.18, 0, 1],
      up: [0, 1, 0],
      size: [1.45, 1.75],
      mirror: s > 0,
      bone: earBone,
      lift: 0.002,
      segments: 12,
    });

    b.sweep(
      earSurface.drape(
        [
          ep(0.065, 0.2, 0.18),
          ep(0.11, -0.02, 0.18),
          ep(0.14, -0.35, 0.18),
          ep(0.3, -0.7, 0.18),
        ],
        { lift: 0.018 },
      ),
      [0.067, 0.035],
      {
        name: `earRootCartilage${side}`,
        color: skin,
        bone: earBone,
        sides: 6,
      },
    );
  }

  // ------------------------------------------------------------------
  // Tusks. Broad root, sweeping belly, and fine upturned ivory point.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    ellipsoid(
      `tuskRootPad${side}`,
      [s * 0.49, 2.645, 1.45],
      [0.205, 0.235, 0.235],
      skin,
      head,
      10,
    );

    const tuskPath = catmull([
      [s * 0.49, 2.64, 1.43],
      [s * 0.62, 2.39, 1.77],
      [s * 0.8, 2.3, 2.22],
      [s * 0.94, 2.42, 2.69],
      [s * 0.97, 2.68, 3.02],
      [s * 0.92, 2.84, 3.17],
    ]);

    b.sweep(tuskPath, [0.151, 0.145, 0.12, 0.083, 0.043, 0], {
      name: `sweepingIvoryTusk${side}`,
      bone: head,
      color: ivory,
      sides: 10,
      smooth: false,
      caps: { start: "flat", end: "point" },
    });

    fold(
      `tuskSocketCrease${side}`,
      [
        [s * 0.35, 2.73, 1.49],
        [s * 0.44, 2.79, 1.59],
        [s * 0.58, 2.74, 1.6],
        [s * 0.64, 2.64, 1.53],
      ],
      0.019,
      C.crease,
      head,
    );
  }

  // ------------------------------------------------------------------
  // Trunk: one continuous skinned tube, with a long neutral extension.
  // The two grasping fingers are an African elephant's diagnostic tip.
  // ------------------------------------------------------------------

  const trunkRadii = [0.325, 0.30, 0.245, 0.205, 0.17, 0.143, 0.121, 0.108, 0.1];

  const trunkTube = b.sweep(trunk, trunkRadii, {
    name: "articulatedTrunk",
    color: skin,
    sides: 10,
    smooth: false,
    caps: "flat",
  });

  b.decal(trunkTube, trunkTexture, {
    name: "trunkAccordionDrawing",
    at: [0, 1.97, 2.6],
    dir: [0, 0, 1],
    size: [0.7, 2.51],
    lift: 0.002,
    segments: 18,
  });

  // The transverse folds continue around the sides, not just the front.
  for (let i = 0; i < 15; i++) {
    const t = 0.13 + i * 0.052;
    const band = [-142, -100, -55, 0, 55, 100, 142].map((a) =>
      trunkTube.at(t, a, 0.003),
    );
    b.sweep(catmull(band), 0.0095 - t * 0.003, {
      name: `trunkSideFold${i + 1}`,
      color: i % 3 === 0 ? C.crease : "#7c887b",
      sides: 5,
      caps: "round",
    });
  }

  const tipBone = trunk.tip!;
  b.sweep(
    catmull([
      [0, 0.72, 2.99],
      [0, 0.765, 3.10],
      [0, 0.78, 3.23],
      [0, 0.74, 3.29],
    ]),
    [0.068, 0.055, 0.035, 0.014],
    {
      name: "upperTrunkFinger",
      bone: tipBone,
      color: skin,
      sides: 6,
      caps: "round",
    },
  );

  b.sweep(
    catmull([
      [0, 0.58, 3.0],
      [0, 0.545, 3.11],
      [0, 0.57, 3.23],
    ]),
    [0.06, 0.042, 0.014],
    {
      name: "lowerTrunkFinger",
      bone: tipBone,
      color: skin,
      sides: 6,
      caps: "round",
    },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 5), C.deep, {
      name: `trunkNostril${s > 0 ? "L" : "R"}`,
      at: [s * 0.044, 0.648, 3.067],
      scale: [0.027, 0.042, 0.009],
      bone: tipBone,
      flat: true,
    });
  }

  // ------------------------------------------------------------------
  // Four separated pillar legs and broad, weight-bearing round feet.
  // African bush elephants have four front and three hind toenails.
  // ------------------------------------------------------------------

  for (const leg of legs) {
    const { chain, suffix, front, points } = leg;
    const legTube = b.sweep(
      chain,
      front ? [0.385, 0.31, 0.258, 0.30] : [0.415, 0.32, 0.255, 0.30],
      {
        name: `pillarLeg${suffix}`,
        color: skin,
        sides: 10,
        smooth: false,
        caps: "flat",
      },
    );

    const footAt: P = [points[3][0], 0.405, points[3][2] + 0.045];
    const foot = ellipsoid(
      `broadFoot${suffix}`,
      footAt,
      [front ? 0.365 : 0.355, 0.26, front ? 0.435 : 0.415],
      skin,
      chain.tip!,
      12,
    );

    const footSurface = b.surface(foot);
    const count = front ? 4 : 3;

    for (let i = 0; i < count; i++) {
      const azimuth = -55 + (i / (count - 1)) * 110;
      const hit = footSurface.around(footAt).at(azimuth, -13);
      b.stick(new THREE.SphereGeometry(1, 8, 6), nailFinish, hit, {
        name: `toenail${suffix}${i + 1}`,
        scale: [front ? 0.078 : 0.089, 0.036, 0.105],
        embed: 0.28,
        flow: [0, 1, 0],
        bone: chain.tip!,
      });
    }

    const legSurface = b.surface(legTube);
    const ringTs = front
      ? [0.43, 0.49, 0.73, 0.79, 0.87]
      : [0.43, 0.49, 0.72, 0.79, 0.87];

    ringTs.forEach((t, i) => {
      const loop = legSurface.loop(chain.at(t), { lift: 0.002 });
      b.sweep(loop, i < 2 ? 0.012 : 0.009, {
        name: `jointWrinkle${suffix}${i + 1}`,
        color: i === 0 || i === 3 ? C.crease : "#7a8679",
        sides: 5,
      });
    });

    // Short folds sweep downward from each knee rather than decorating
    // the leg with arbitrary regular stripes.
    const p = points[1];
    for (const splay of [-1, 1]) {
      const rough: P[] = [
        [p[0] + splay * 0.16, p[1] + 0.16, p[2] + 0.42],
        [p[0] + splay * 0.21, p[1] + 0.01, p[2] + 0.43],
        [p[0] + splay * 0.18, p[1] - 0.17, p[2] + 0.39],
      ];
      b.sweep(legSurface.drape(rough, { lift: 0.005 }), [0.018, 0.007], {
        name: `kneeFanFold${suffix}${splay > 0 ? "A" : "B"}`,
        color: skin,
        sides: 5,
        bone: chain.joints[1],
      });
    }

    // A low rolled cuff joins the foot to its ankle.
    const cuff = b.surface([legTube, foot]).loop(
      [footAt[0], 0.57, footAt[2]],
      { dir: [0, 1, 0], lift: 0.004 },
    );
    b.sweep(cuff, 0.014, {
      name: `ankleCuff${suffix}`,
      color: skin,
      bone: chain.tip!,
      sides: 5,
    });
  }

  // ------------------------------------------------------------------
  // Body folds follow the built volumes. Sparse, broad wrinkles retain
  // the simple primitive silhouette at a distance.
  // ------------------------------------------------------------------

  const bodySurface = b.surface([torso, shoulderMasses, haunchMasses]);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    for (let i = 0; i < 5; i++) {
      const z = 0.68 - i * 0.18;
      const rough: P[] = [
        [s * 1.38, 2.77 - i * 0.025, z - 0.03],
        [s * 1.43, 2.4, z - 0.12],
        [s * 1.43, 1.99, z - 0.04],
        [s * 1.28, 1.6, z + 0.13],
      ];
      b.sweep(bodySurface.drape(rough, { lift: 0.004 }), [0.018, 0.009], {
        name: `shoulderDrape${side}${i + 1}`,
        color: i % 2 ? "#7c877b" : C.crease,
        bone: spine.tip!,
        sides: 5,
      });
    }

    for (let i = 0; i < 4; i++) {
      const z = -1.93 + i * 0.16;
      const rough: P[] = [
        [s * 1.37, 2.63, z],
        [s * 1.43, 2.35, z + 0.04],
        [s * 1.42, 1.99, z + 0.13],
        [s * 1.33, 1.68, z + 0.11],
      ];
      b.sweep(bodySurface.drape(rough, { lift: 0.004 }), [0.016, 0.008], {
        name: `haunchDrape${side}${i + 1}`,
        color: "#748174",
        bone: pelvis,
        sides: 5,
      });
    }

    for (let i = 0; i < 3; i++) {
      const y = 1.58 + i * 0.115;
      const rough: P[] = [
        [s * 1.37, y + 0.04, -1.2],
        [s * 1.4, y - 0.04, -0.86],
        [s * 1.4, y - 0.055, -0.53],
        [s * 1.34, y, -0.3],
      ];
      b.sweep(bodySurface.drape(rough, { lift: 0.003 }), 0.008, {
        name: `bellyFold${side}${i + 1}`,
        color: "#7b877a",
        bone: spine.joints[0],
        sides: 5,
      });
    }
  }

  // ------------------------------------------------------------------
  // Tail and coarse brush. Broad tapered strands, not smooth fur.
  // ------------------------------------------------------------------

  const tailTube = b.sweep(tail, [0.087, 0.067, 0.048, 0.035], {
    name: "extendedTail",
    color: skin,
    sides: 7,
    smooth: false,
    caps: "round",
  });

  for (let i = 0; i < 3; i++) {
    const t = 0.18 + i * 0.23;
    const around = [-120, -60, 0, 60, 120].map((a) =>
      tailTube.at(t, a, 0.003),
    );
    b.sweep(catmull(around), 0.007, {
      name: `tailFold${i + 1}`,
      color: C.crease,
      sides: 5,
    });
  }

  ellipsoid(
    "tailBrushCore",
    [0.345, 1.045, -2.7],
    [0.095, 0.21, 0.08],
    C.hair,
    tail.tip!,
    8,
  );

  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = 0.34 + Math.cos(a) * 0.055;
    const z = -2.69 + Math.sin(a) * 0.045;
    b.sweep(
      catmull([
        [x, 1.19, z],
        [x + Math.cos(a) * 0.035, 1.02, z - 0.01],
        [x + Math.cos(a) * 0.095, 0.81 + (i % 3) * 0.035, z - 0.045],
      ]),
      [0.026, 0.021, 0],
      {
        name: `tailBrushStrand${i + 1}`,
        color: i % 3 === 0 ? "#536052" : C.hair,
        sides: 4,
        caps: "point",
        bone: tail.tip!,
      },
    );
  }

  // ------------------------------------------------------------------
  // Compact savanna stage. Its low edge is the only artificial framing;
  // everything above it is sand, sparse dry grass and weathered stones.
  // ------------------------------------------------------------------

  b.part(new THREE.CylinderGeometry(2.88, 2.96, 0.13, 14), C.sandEdge, {
    name: "lowSavannaPlinth",
    at: [0, 0.065, 0.15],
    scale: [1, 1, 1.17],
    bone: pelvis,
    flat: true,
  });

  const ground = b.part(
    new THREE.CylinderGeometry(2.885, 2.88, 0.025, 14),
    earth,
    {
      name: "dustyGround",
      at: [0, 0.1375, 0.15],
      scale: [1, 1, 1.17],
      bone: pelvis,
      flat: true,
    },
  );

  // A few prints continue the animal's path, clear of its planted feet.
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
    [2.3, 0.151, -1.63],
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

  // A handful of isolated stalks give the grass clumps a less uniform edge.
  for (let i = 0; i < 7; i++) {
    const p = grassSites[i * 2];
    const h = 0.21 + random() * 0.14;
    b.sweep(
      [
        [p[0] + 0.09, 0.15, p[2] - 0.035],
        [p[0] + 0.11, 0.15 + h, p[2] - 0.01],
      ],
      [0.008, 0.003],
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
      [0.018, 0.045, 0.015],
      "#b3a06c",
      pelvis,
      6,
    );
  }

  return b.root;
}
```
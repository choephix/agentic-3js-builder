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
    "A low-poly adult African bush elephant with cupped, weathered ears, warm ivory tusks, an articulated trunk and firmly planted feet on a little savanna stage.",
};

/*
Art-direction changes
1. Replace the floating-looking rounded soles with broad, flat-bottomed feet.
2. Remove the ear's umbrella-like ribs and the trunk's wire-like wrinkles:
   these details now live predominantly in restrained surface paintings.
3. Cup the great ears, give their margins a more elephantine silhouette,
   and reduce the eye makeup and heavy brows.
4. Warm the grey skin, soften the joint markings, and refine the trunk fingers.
5. Keep the quiet savanna setting, with the elephant unmistakably the hero.
*/

type P = [number, number, number];
type Finish = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Savanna Matriarch",
    paintSize: 2048,
  });
  const random = rng(43719);

  const C = {
    deep: "#38423e",
    crease: "#73796f",
    hair: "#41463e",
    sandEdge: "#98774e",
  };

  // Grey skin with warm dust, not an overall green cast.
  const skin = paint((p, n) => {
    let col = mix("#7f8580", "#aaa99b", noise(p, 0.43, 17));
    col = mix(col, "#68716e", Math.max(0, -n.y) * 0.18);
    col = mix(
      col,
      "#656c65",
      smoothstep(0.64, 0.88, noise(p, 0.023, 91)) * 0.12,
    );
    const footDust = (1 - smoothstep(0.24, 0.94, p.y)) * 0.37;
    const upperDust = smoothstep(0.35, 0.95, n.y) * 0.19;
    return mix(col, "#c2ac8a", footDust + upperDust);
  });

  const earSkin = paint((p, n) => {
    let col = mix("#8d9185", "#aca28e", noise(p, 0.29, 41));
    col = mix(col, "#ad958a", 0.16 + Math.max(0, n.z) * 0.11);
    return mix(col, "#727b71", noise(p, 0.032, 9) * 0.09);
  });

  const ivory = paint((p, n) => {
    const age = 1 - smoothstep(1.45, 2.95, p.z);
    let col = mix("#eee5c9", "#b9a77c", age * 0.62);
    const grain = Math.sin(p.z * 106 + noise(p, 0.12, 20) * 5);
    col = mix(col, "#c6ba94", (grain * 0.5 + 0.5) * 0.08);
    return mix(col, "#fff2d3", Math.max(0, n.y) * 0.17);
  });

  const nails = paint((p, n) => {
    const striation = 0.5 + 0.5 * Math.sin(p.x * 173 + p.z * 85);
    let col = mix("#9d9e89", "#c3c2aa", 0.4 + striation * 0.18);
    col = mix(
      col,
      "#8f8c74",
      (1 - smoothstep(0.17, 0.34, p.y)) * 0.23,
    );
    return mix(col, "#d9d3b8", Math.max(0, n.y) * 0.12);
  });

  const earth = paint((p, n) => {
    let col = mix("#ac8f63", "#ccb486", noise(p, 0.52, 5));
    col = mix(col, "#dfc795", noise(p, 0.055, 12) * 0.13);
    return mix(col, "#947a54", Math.max(0, -n.y) * 0.3);
  });

  const stone = paint((p, n) =>
    mix(
      mix("#8c8975", "#aaa28b", noise(p, 0.17, 33)),
      "#c3b28d",
      Math.max(0, n.y) * 0.22,
    ),
  );

  // ------------------------------------------------------------------
  // Skeleton first.
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
      [0, 3.21, 1.52],
      [0, 2.98, 1.81],
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
  // Reusable construction helpers.
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

  // ------------------------------------------------------------------
  // Drawings. Fine wrinkles are paint, not wires standing off the skin.
  // ------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 53 Q43 25 88 28 Q132 28 168 52
        Q130 73 86 74 Q44 73 10 53Z"
        fill="#70776b"/>
      <path d="M20 53 Q50 35 89 35 Q126 35 158 53
        Q126 66 88 67 Q52 66 20 53Z"
        fill="#a8aa92"/>
      <ellipse cx="91" cy="51" rx="24" ry="23" fill="#665339"/>
      <ellipse cx="91" cy="53" rx="18" ry="20" fill="#957744"/>
      <path d="M77 63 Q92 74 107 61" fill="none"
        stroke="#bca06a" stroke-width="4"/>
      <ellipse cx="92" cy="52" rx="11" ry="19" fill="#29332e"/>
      <ellipse cx="84" cy="43" rx="4.5" ry="4" fill="#eee9d6"/>
      <circle cx="100" cy="59" r="2" fill="#c6c9b1"/>
      <path d="M13 52 Q48 25 89 29 Q132 29 166 51"
        fill="none" stroke="#46534a" stroke-width="7"
        stroke-linecap="round"/>
      <path d="M28 73 Q88 85 147 70"
        fill="none" stroke="#798375" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M21 34 Q113 6 217 34
          M37 54 Q119 33 207 54 M56 77 Q122 60 190 77
          M76 98 Q121 87 169 98"
          stroke="#7b8377" stroke-width="3.5"/>
        <path d="M30 39 Q121 15 211 39
          M44 59 Q119 41 199 59"
          stroke="#b2b39f" stroke-width="2.7"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const cheekTexture = svg(
    `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M17 21 Q74 33 98 67 M12 47 Q65 60 93 91
          M12 74 Q61 86 80 117 M16 103 Q54 115 66 146"
          stroke="#7b8477" stroke-width="3.5"/>
        <path d="M22 27 Q68 41 91 70 M17 53 Q61 67 85 93
          M17 80 Q53 91 73 119"
          stroke="#acaf9c" stroke-width="2.6"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 220 250" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 109 C49 96 68 62 98 46
          C117 35 134 29 154 24
          M17 115 C69 94 107 91 150 73 C170 65 184 57 195 46
          M18 121 C80 110 131 119 196 101
          M19 126 C75 128 112 150 187 154
          M21 130 C60 150 89 182 146 206
          M23 134 C47 167 64 198 88 223"
          stroke="#858979" stroke-width="2.7"/>
        <path d="M70 65 Q80 47 78 35 M105 45 Q128 48 142 41
          M87 94 Q109 75 116 60 M140 78 Q162 83 179 76
          M100 115 Q128 101 148 101
          M127 118 Q143 134 163 136
          M88 146 Q110 140 128 146
          M109 183 Q116 202 128 214
          M62 191 Q66 207 78 216"
          stroke="#8d8e7d" stroke-width="2.3"/>
        <path d="M22 113 C67 94 105 89 149 69
          M27 124 C81 125 124 145 183 150
          M32 140 C60 168 90 194 139 211"
          stroke="#b5ab95" stroke-width="2.6"/>
        <path d="M38 72 Q50 66 57 54 M151 28 Q170 34 181 47
          M185 170 Q176 182 162 188
          M104 224 Q119 227 130 218"
          stroke="#989b87" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const shoulderTexture = svg(
    `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M42 15 C67 56 53 93 74 135 C83 156 100 176 113 188
          M67 17 C93 58 75 95 94 133 C108 162 133 174 144 196
          M97 23 C119 65 100 96 119 130 C135 157 159 165 169 188
          M124 37 C145 70 127 100 143 126 C160 149 176 152 181 169
          M25 56 C43 89 34 121 54 155 C67 176 79 184 91 214"
          stroke="#7a8276" stroke-width="3.2"/>
        <path d="M48 18 C72 57 59 94 80 133
          M74 22 C98 60 82 97 101 134
          M104 29 C124 66 108 96 126 129
          M33 60 C49 91 41 121 61 154"
          stroke="#b0b09d" stroke-width="2.4"/>
        <path d="M63 218 Q111 239 158 219
          M79 234 Q116 249 144 238"
          stroke="#828a7b" stroke-width="2.7"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const haunchTexture = svg(
    `<svg viewBox="0 0 180 240" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M34 18 Q20 77 46 137 Q58 167 51 200
          M59 18 Q41 79 67 130 Q83 164 74 219
          M88 26 Q68 77 91 127 Q105 157 102 211
          M117 42 Q101 90 120 125 Q136 155 133 186"
          stroke="#7d8578" stroke-width="3.1"/>
        <path d="M40 20 Q28 78 52 135
          M66 22 Q49 79 74 130
          M95 31 Q76 79 98 127"
          stroke="#b0b09c" stroke-width="2.4"/>
        <path d="M24 168 Q58 183 97 177
          M34 187 Q68 199 104 189"
          stroke="#858b7b" stroke-width="2.8"/>
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
  // The great masses: broad belly, high shoulder, gently saddled back.
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
  // Face: small observant amber eyes, a massive forehead, separate jaw.
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
    const hit = headSurface.around([0, 3.055, 1.075]).at(s * 48, 1);

    const socket = b.stick(
      new THREE.SphereGeometry(1, 10, 6),
      skin,
      hit,
      {
        name: `eyeSocket${side}`,
        scale: [0.141, 0.032, 0.09],
        embed: 0.3,
        flow: [0, 1, 0],
        bone: head,
      },
    );

    b.decal(socket, eyeTexture, {
      name: `amberEye${side}`,
      at: hit.moved([0, 0.05, 0]),
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.203, 0.112],
      mirror: s > 0,
      lift: 0.002,
      bone: head,
      segments: 8,
    });

    // Same colour as the skull: a modest anatomical brow, not an eyebrow.
    b.sweep(
      headSurface.drape(
        [
          [s * 0.4, 3.195, 1.74],
          [s * 0.52, 3.205, 1.7],
          [s * 0.64, 3.16, 1.61],
          [s * 0.69, 3.105, 1.53],
        ],
        { lift: 0.004 },
      ),
      [0.026, 0.014],
      {
        name: `browRidge${side}`,
        color: skin,
        sides: 6,
        bone: head,
      },
    );

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
    size: [0.84, 0.37],
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
    [0.27, 0.065, 0.2],
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
    0.026,
    skin,
    jaw,
  );

  // ------------------------------------------------------------------
  // Ears. Two polygonal surfaces enclose a shallow cup. There are no
  // radiating structural rods: ear veins belong in the skin.
  // ------------------------------------------------------------------

  const earOutline: [number, number][] = [
    [0, -0.06],
    [0.12, -0.39],
    [0.3, -0.83],
    [0.5, -1.1],
    [0.75, -1.23],
    [0.96, -1.2],
    [1.08, -1.075],
    [1.19, -1.035],
    [1.43, -0.72],
    [1.53, -0.43],
    [1.6, -0.13],
    [1.59, 0.12],
    [1.47, 0.4],
    [1.25, 0.62],
    [0.98, 0.73],
    [0.73, 0.7],
    [0.46, 0.56],
    [0.23, 0.35],
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
        thickness: 0.105,
        bone,
      },
    );

    // A second, shallower fan is recessed into the thick outer margin.
    // Its upper and lower edges advance slightly to create a real cup.
    const upper: P[] = [
      ep(0.07, 0.04, 0.07),
      ep(0.3, 0.35, 0.075),
      ep(0.59, 0.58, 0.095),
      ep(0.91, 0.64, 0.105),
      ep(1.2, 0.53, 0.115),
      ep(1.43, 0.3, 0.12),
      ep(1.51, 0.07, 0.1),
    ];

    const lower: P[] = [
      ep(0.07, 0.04, 0.07),
      ep(0.25, -0.53, 0.08),
      ep(0.49, -0.96, 0.095),
      ep(0.76, -1.13, 0.115),
      ep(1.04, -1.015, 0.12),
      ep(1.36, -0.62, 0.125),
      ep(1.51, 0.07, 0.1),
    ];

    const inner = b.membrane(upper, lower, {
      name: `cuppedEarSkin${side}`,
      color: earSkin,
      thickness: 0.018,
      rows: 4,
      cols: 10,
      bone,
    });

    b.sweep(
      catmull(
        earOutline.map(([u, v]) => ep(u, v, 0.052)),
        { closed: true },
      ),
      0.016,
      {
        name: `softEarMargin${side}`,
        color: skin,
        sides: 6,
        bone,
      },
    );

    b.decal(inner, earTexture, {
      name: `fineEarVeins${side}`,
      at: ep(0.83, -0.18, 0.25),
      dir: [s * 0.32, 0, 1],
      up: [0, 1, 0],
      size: [1.48, 1.82],
      mirror: s > 0,
      bone,
      lift: 0.002,
      segments: 14,
    });

    const earSurface = b.surface([ear, inner]);

    b.sweep(
      earSurface.drape(
        [
          ep(0.06, 0.2, 0.25),
          ep(0.105, -0.02, 0.25),
          ep(0.145, -0.33, 0.25),
          ep(0.29, -0.67, 0.25),
        ],
        { lift: 0.009 },
      ),
      [0.049, 0.021],
      {
        name: `earRootCartilage${side}`,
        color: skin,
        bone,
        sides: 6,
      },
    );

    // Two subdued broad folds at the hinge, not across the whole fan.
    for (let i = 0; i < 2; i++) {
      b.sweep(
        earSurface.drape(
          [
            ep(0.12, -0.12 - i * 0.085, 0.25),
            ep(0.27, -0.19 - i * 0.11, 0.25),
            ep(0.46, -0.26 - i * 0.16, 0.25),
          ],
          { lift: 0.002 },
        ),
        [0.013, 0.003],
        {
          name: `earHingeFold${side}${i + 1}`,
          color: skin,
          sides: 5,
          bone,
        },
      );
    }
  }

  // ------------------------------------------------------------------
  // Tusks: broad weathered roots, clean warm ivory, upturned fine tips.
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
      [s * 0.61, 2.41, 1.76],
      [s * 0.78, 2.32, 2.18],
      [s * 0.91, 2.41, 2.61],
      [s * 0.96, 2.62, 2.96],
      [s * 0.93, 2.8, 3.15],
    ]);

    b.sweep(tuskPath, [0.151, 0.143, 0.119, 0.083, 0.04, 0], {
      name: `sweepingIvoryTusk${side}`,
      bone: head,
      color: ivory,
      sides: 10,
      smooth: false,
      detail: 1.4,
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
      0.011,
      C.crease,
      head,
    );
  }

  // ------------------------------------------------------------------
  // Trunk folds use the tube's own coordinates. They cannot float,
  // zigzag off the facets, or project onto the opposite side.
  // ------------------------------------------------------------------

  const trunkFinish = paint((p, n, uv) => {
    const t = uv[0];
    const angle = (uv[1] * Math.PI) / 180;
    const underlying = skin.at(p, n);
    const wandering =
      Math.sin(angle * 2.1 + t * 17) * 0.12 +
      Math.sin(angle * 4.7 - t * 11) * 0.055;
    const phase = t * 43 + wandering;
    const f = phase - Math.floor(phase);
    const crease = 1 - smoothstep(0.024, 0.075, Math.abs(f - 0.36));
    const shoulder = 1 - smoothstep(0.028, 0.09, Math.abs(f - 0.48));
    const emphasis = 0.15 + 0.12 * (0.5 + 0.5 * Math.cos(angle));
    const ringed = mix(underlying, "#5f6b62", crease * emphasis);
    return mix(ringed, "#bbc0aa", shoulder * 0.14);
  });

  const trunkTube = b.sweep(
    trunk,
    [0.337, 0.3, 0.245, 0.205, 0.17, 0.143, 0.121, 0.108, 0.1],
    {
      name: "articulatedTrunk",
      color: trunkFinish,
      sides: 10,
      smooth: false,
      caps: "flat",
    },
  );

  // Only the largest root folds have actual relief.
  for (let i = 0; i < 4; i++) {
    const t = 0.075 + i * 0.045;
    b.sweep(
      catmull(
        [-95, -50, 0, 50, 95].map((a) => trunkTube.at(t, a, 0.001)),
      ),
      0.006,
      {
        name: `trunkRootFold${i + 1}`,
        color: skin,
        sides: 5,
      },
    );
  }

  const tipBone = trunk.tip!;

  b.sweep(
    catmull([
      [0, 0.715, 3],
      [0, 0.752, 3.075],
      [0, 0.748, 3.165],
      [0, 0.721, 3.205],
    ]),
    [0.066, 0.046, 0.026, 0.01],
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
      [0, 0.586, 3.005],
      [0, 0.565, 3.087],
      [0, 0.592, 3.165],
    ]),
    [0.055, 0.033, 0.01],
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
      at: [s * 0.043, 0.65, 3.069],
      scale: [0.025, 0.032, 0.009],
      bone: tipBone,
      flat: true,
    });
  }

  // ------------------------------------------------------------------
  // Weight-bearing legs. Wrinkles are integrated into their material.
  // The flat sole is a deliberate geometric feature, not a sphere pole.
  // ------------------------------------------------------------------

  const legFinish = paint((p, n, uv) => {
    const t = uv[0];
    const angle = (uv[1] * Math.PI) / 180;
    const phase = t * 33 + Math.sin(angle * 2 + t * 9) * 0.12;
    const f = phase - Math.floor(phase);
    const crease = 1 - smoothstep(0.02, 0.075, Math.abs(f - 0.4));
    const ankle = smoothstep(0.7, 0.84, t);
    const knee = Math.exp(-Math.pow((t - 0.47) / 0.075, 2));
    const amount = 0.035 + ankle * 0.14 + knee * 0.1;
    return mix(skin.at(p, n), "#687267", crease * amount);
  });

  for (const leg of legs) {
    const { chain, suffix, front, points } = leg;

    const legTube = b.sweep(
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
        [r * 0.86, 0],
        [r, 0.065],
        [r * 1.025, 0.155],
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
      const hit = footSurface.around(footCenter).at(azimuth, -17);

      b.stick(new THREE.SphereGeometry(1, 8, 6), nails, hit, {
        name: `toenail${suffix}${i + 1}`,
        scale: [front ? 0.068 : 0.079, 0.024, 0.083],
        embed: 0.24,
        flow: [0, 1, 0],
        bone: chain.tip!,
      });
    }

    const legSurface = b.surface(legTube);

    // A little relief only at the bent joints, not five dark bracelets.
    [0.46, 0.8].forEach((t, i) => {
      b.sweep(
        legSurface.loop(chain.at(t), { lift: 0.001 }),
        i === 0 ? 0.007 : 0.006,
        {
          name: `softJointFold${suffix}${i + 1}`,
          color: skin,
          sides: 5,
        },
      );
    });

    const p = points[1];

    for (const splay of [-1, 1]) {
      b.sweep(
        legSurface.drape(
          [
            [p[0] + splay * 0.15, p[1] + 0.13, p[2] + 0.41],
            [p[0] + splay * 0.19, p[1] + 0.01, p[2] + 0.42],
            [p[0] + splay * 0.17, p[1] - 0.12, p[2] + 0.38],
          ],
          { lift: 0.001 },
        ),
        [0.009, 0.003],
        {
          name: `kneeFanFold${suffix}${splay > 0 ? "A" : "B"}`,
          color: skin,
          sides: 5,
          bone: chain.joints[1],
        },
      );
    }

    const cuff = b.surface([legTube, foot]).loop(
      [footCenter[0], 0.545, footCenter[2]],
      { dir: [0, 1, 0], lift: 0.001 },
    );

    b.sweep(cuff, 0.009, {
      name: `softAnkleCuff${suffix}`,
      color: skin,
      bone: chain.tip!,
      sides: 5,
    });
  }

  // ------------------------------------------------------------------
  // Broad shoulder and haunch creases, painted across the actual masses.
  // ------------------------------------------------------------------

  const bodySurface = b.surface([torso, shoulders, haunches]);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    b.decal(bodySurface, shoulderTexture, {
      name: `shoulderSkinCreases${side}`,
      at: [s * 1.35, 2.19, 0.37],
      dir: [s, 0, 0.04],
      up: [0, 1, 0],
      size: [0.73, 1.13],
      mirror: s > 0,
      lift: 0.002,
      bone: spine.tip!,
      segments: 12,
    });

    b.decal(bodySurface, haunchTexture, {
      name: `haunchSkinCreases${side}`,
      at: [s * 1.35, 2.14, -1.66],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.66, 0.98],
      mirror: s > 0,
      lift: 0.002,
      bone: pelvis,
      segments: 10,
    });

    // Two shallow skin rolls under the belly; almost the same colour.
    for (let i = 0; i < 2; i++) {
      const y = 1.58 + i * 0.12;
      b.sweep(
        bodySurface.drape(
          [
            [s * 1.37, y + 0.04, -1.2],
            [s * 1.4, y - 0.04, -0.86],
            [s * 1.4, y - 0.055, -0.53],
            [s * 1.34, y, -0.3],
          ],
          { lift: 0.001 },
        ),
        0.006,
        {
          name: `bellySkinRoll${side}${i + 1}`,
          color: skin,
          bone: spine.joints[0],
          sides: 5,
        },
      );
    }
  }

  // Sparse coarse bristles catch light at the crown and shoulder.
  const crownHits = b.surface(skull).scatter(12, {
    rng: rng(812),
    minDist: 0.075,
    filter: (h) => h.n.y > 0.75 && h.at.z < 1.32,
  });

  crownHits.forEach((hit, i) => {
    b.spike(hit, hit, 0.025 + (i % 3) * 0.005, 0.0025, {
      name: `crownBristle${i + 1}`,
      color: "#747c6b",
      sides: 4,
    });
  });

  // ------------------------------------------------------------------
  // Slender tail and a modest, coarse black brush.
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
    [0.076, 0.19, 0.065],
    C.hair,
    tail.tip!,
    8,
  );

  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const x = 0.34 + Math.cos(a) * 0.043;
    const z = -2.69 + Math.sin(a) * 0.037;

    b.sweep(
      catmull([
        [x, 1.18, z],
        [x + Math.cos(a) * 0.025, 1.01, z - 0.01],
        [
          x + Math.cos(a) * 0.074,
          0.8 + (i % 3) * 0.033,
          z - 0.038,
        ],
      ]),
      [0.018, 0.014, 0],
      {
        name: `tailBrushStrand${i + 1}`,
        color: i % 3 === 0 ? "#626957" : C.hair,
        sides: 4,
        caps: "point",
        bone: tail.tip!,
      },
    );
  }

  // ------------------------------------------------------------------
  // Compact savanna stage: low, warm, sparse and subordinate.
  // ------------------------------------------------------------------

  b.part(
    new THREE.CylinderGeometry(2.76, 2.84, 0.13, 14),
    C.sandEdge,
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
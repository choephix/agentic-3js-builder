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
    "A monumental, low-poly African bush elephant with sweeping ivory, weathered fan ears, watchful amber eyes and an articulated trunk, standing on sun-warmed savanna.",
};

/*
Art-direction changes
1. Rebuild the tusks with explicitly sampled tapered geometry: flowing
   ivory arcs replace the conspicuous elbow-shaped bends.
2. Integrate the shoulder, cheek and foot masses more closely, eliminating
   the appearance of shoulder pads, cheek attachments and ankle cuffs.
3. Enlarge the eyes modestly and improve their lids and amber highlights,
   retaining the small, thoughtful eyes of an adult elephant.
4. Replace the conspicuous radial ear diagram with much quieter,
   branching skin markings. Unify the ear surfaces and soften their rims.
5. Add selective dusty highlights and restrained, surface-bound wrinkles.
   Keep the faceted silhouette and the quiet, subordinate savanna stage.
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
  // Hide, ivory, horn and sunbaked earth.
  // ------------------------------------------------------------------

  const skin = paint((p, n) => {
    let c = mix("#858b86", "#aaa99b", noise(p, 0.47, 17));
    c = mix(c, "#737e79", Math.max(0, -n.y) * 0.19);

    const pores = smoothstep(0.63, 0.87, noise(p, 0.024, 91));
    c = mix(c, "#747b71", pores * 0.075);

    const lowDust = (1 - smoothstep(0.27, 0.93, p.y)) * 0.3;
    const settledDust =
      smoothstep(0.34, 0.9, n.y) *
      smoothstep(0.3, 0.7, noise(p, 0.6, 67)) *
      0.42;
    return mix(c, "#c8b38e", lowDust + settledDust);
  });

  const earSkin = paint((p, n) => {
    let c = mix("#95998b", "#aaa692", noise(p, 0.32, 41));
    c = mix(
      c,
      "#b29d92",
      smoothstep(0.4, 0.77, noise(p, 0.22, 71)) * 0.2,
    );
    c = mix(c, "#818878", noise(p, 0.03, 9) * 0.065);
    return mix(c, "#c0b49b", Math.max(0, n.y) * 0.15);
  });

  const ivory = paint((p, n) => {
    const rootAge = 1 - smoothstep(1.48, 2.86, p.z);
    let c = mix("#eee7cf", "#b7a47a", rootAge * 0.57);
    const streak = Math.sin(p.z * 103 + noise(p, 0.13, 20) * 5);
    c = mix(c, "#c9bd9d", (streak * 0.5 + 0.5) * 0.06);
    return mix(c, "#fff3dc", Math.max(0, n.y) * 0.17);
  });

  const nailFinish = paint((p, n) => {
    const grain = 0.5 + 0.5 * Math.sin(p.x * 173 + p.z * 85);
    let c = mix("#969b8c", "#bcbca6", 0.3 + grain * 0.16);
    c = mix(c, "#999077", (1 - smoothstep(0.17, 0.35, p.y)) * 0.27);
    return mix(c, "#d1cbb2", Math.max(0, n.y) * 0.1);
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
  // Skeleton first. +Z is forward; +X is the animal's left.
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
  // Reusable primitives and a deliberately sampled ivory surface.
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

  function tuskGeometry(points: P[], rootRadius: number) {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      false,
      "centripetal",
    );

    const rings = 32;
    const sides = 10;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const center = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const across = new THREE.Vector3(1, 0, 0);
      across.addScaledVector(tangent, -across.dot(tangent)).normalize();
      const vertical = new THREE.Vector3()
        .crossVectors(tangent, across)
        .normalize();
      const radius = rootRadius * Math.pow(1 - t, 0.82);

      for (let j = 0; j <= sides; j++) {
        const a = (j / sides) * Math.PI * 2;
        const vertex = center
          .clone()
          .addScaledVector(across, Math.cos(a) * radius)
          .addScaledVector(vertical, Math.sin(a) * radius);
        positions.push(vertex.x, vertex.y, vertex.z);
        uvs.push(j / sides, t);

        if (i < rings && j < sides) {
          const k = i * (sides + 1) + j;
          indices.push(
            k,
            k + 1,
            k + sides + 1,
            k + 1,
            k + sides + 2,
            k + sides + 1,
          );
        }
      }
    }

    const cap = positions.length / 3;
    positions.push(...points[0]);
    uvs.push(0.5, 0);
    for (let j = 0; j < sides; j++) indices.push(cap, j + 1, j);

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

  // ------------------------------------------------------------------
  // Drawings. Quiet anatomical detail, never graphic ornament.
  // ------------------------------------------------------------------

  const eyeTexture = svg(
    `<svg viewBox="0 0 180 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 55 Q43 27 88 29 Q132 29 172 54
        Q132 76 88 76 Q43 74 8 55Z" fill="#858e7d"/>
      <path d="M17 55 Q50 36 89 36 Q130 36 163 54
        Q128 69 89 68 Q49 68 17 55Z" fill="#b1b29c"/>
      <ellipse cx="93" cy="52" rx="23" ry="21" fill="#61573f"/>
      <ellipse cx="94" cy="54" rx="18" ry="19" fill="#aa864b"/>
      <path d="M79 63 Q94 76 110 60" fill="none"
        stroke="#d0ad67" stroke-width="4"/>
      <ellipse cx="95" cy="51" rx="11" ry="18" fill="#29372e"/>
      <ellipse cx="87" cy="43" rx="5" ry="4.5" fill="#f6f0dc"/>
      <circle cx="103" cy="59" r="2.4" fill="#e2d7af"/>
      <path d="M11 53 Q48 29 89 30 Q134 30 169 53"
        fill="none" stroke="#505e50" stroke-width="6"
        stroke-linecap="round"/>
      <path d="M26 76 Q88 90 151 74"
        fill="none" stroke="#858e7c" stroke-width="3"/>
      <path d="M31 24 Q87 10 139 24"
        fill="none" stroke="#a8ad96" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const foreheadTexture = svg(
    `<svg viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M20 34 Q114 7 218 34 M39 57 Q120 37 206 57
          M63 82 Q122 67 184 82" stroke="#8b9383" stroke-width="3"/>
        <path d="M29 39 Q121 18 211 39 M46 62 Q119 46 198 62"
          stroke="#b4b6a0" stroke-width="2.5"/>
      </g>
    </svg>`,
    { size: 384 },
  );

  const cheekTexture = svg(
    `<svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round">
        <path d="M17 21 Q74 33 98 67 M12 49 Q65 62 93 93
          M14 80 Q61 89 80 121 M20 113 Q54 124 64 148"
          stroke="#899181" stroke-width="3"/>
        <path d="M22 27 Q68 41 91 70 M18 55 Q61 69 85 95
          M20 86 Q53 95 73 123"
          stroke="#aeb39d" stroke-width="2.3"/>
      </g>
    </svg>`,
    { size: 256 },
  );

  const earTexture = svg(
    `<svg viewBox="0 0 220 250" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 114 Q51 102 71 78 Q84 62 110 58
          M73 78 Q72 53 90 39
          M109 59 Q128 58 145 44
          M35 116 Q69 108 95 108 Q129 107 153 90
          M94 108 Q111 88 133 81
          M151 90 Q168 88 184 74
          M26 127 Q62 125 87 138 Q106 150 131 151
          M86 138 Q92 155 110 164
          M131 151 Q155 151 171 159
          M31 139 Q53 164 68 180 Q82 193 107 202
          M68 180 Q65 197 79 215"
          stroke="#989d8a" stroke-width="1.7"/>
        <path d="M55 55 Q68 49 74 37 M146 34 Q165 43 171 53
          M184 113 Q174 124 176 135 M154 192 Q141 199 136 216
          M101 224 Q114 227 126 218
          M53 95 Q65 86 67 73 M125 122 Q139 118 150 123"
          stroke="#9ca08d" stroke-width="1.8"/>
        <path d="M44 119 Q69 113 90 114
          M92 143 Q111 156 129 155
          M54 166 Q72 192 100 205"
          stroke="#b1b39d" stroke-width="1.7"/>
      </g>
    </svg>`,
    { size: 512 },
  );

  const bodyCreases = svg(
    `<svg viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M55 19 C76 61 65 96 85 139 Q105 181 98 227
          M81 20 C102 62 89 96 108 136 Q129 176 120 242
          M111 28 C131 65 113 97 132 132 Q153 170 149 218
          M142 42 C160 77 143 107 160 136 Q176 162 179 190
          M32 57 C48 90 42 125 60 157 Q77 187 72 218
          M54 235 Q105 258 161 235 M72 256 Q113 272 146 257"
          stroke="#909786" stroke-width="2.5"/>
        <path d="M61 22 C81 63 72 96 91 139
          M88 25 C107 63 96 98 115 138
          M118 33 C136 67 121 98 139 134"
          stroke="#acb19a" stroke-width="2"/>
        <path d="M67 91 L88 99 M89 139 L110 148
          M113 91 L134 100 M134 157 L154 166
          M62 177 L79 184 M101 215 L122 220"
          stroke="#969c89" stroke-width="2"/>
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
  // Main mass: high shoulders, a shallow saddle and heavy abdomen.
  // ------------------------------------------------------------------

  const torso = b.loft(
    [
      { at: [0, 2.04, -2.31], w: 0.9, h: 1.14 },
      { at: [0, 2.13, -1.84], w: 1.95, h: 1.79 },
      { at: [0, 2.09, -0.91], w: 2.24, h: 1.88 },
      { at: [0, 2.22, -0.04], w: 2.2, h: 1.94 },
      { at: [0, 2.41, 0.58], w: 1.98, h: 1.8 },
      { at: [0, 2.59, 1.02], w: 1.2, h: 1.18 },
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
      [s * 0.695, 2.24, 0.43],
      [0.38, 0.67, 0.59],
      skin,
      spine.tip!,
      12,
    ),
  );

  const haunches = [1, -1].map((s) =>
    ellipsoid(
      `haunchMass${s > 0 ? "L" : "R"}`,
      [s * 0.705, 2.085, -1.65],
      [0.415, 0.69, 0.64],
      skin,
      pelvis,
      12,
    ),
  );

  // ------------------------------------------------------------------
  // Face. The eyes remain exposed above the tusk roots.
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
      [s * 0.405, 2.765, 1.135],
      [0.32, 0.405, 0.41],
      skin,
      head,
      12,
    ),
  );

  const headSurface = b.surface(skull);

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hit = headSurface.around([0, 3.055, 1.075]).at(s * 49, 3);

    b.decal(skull, eyeTexture, {
      name: `amberEye${side}`,
      at: hit,
      dir: hit.n,
      up: [0, 1, 0],
      size: [0.305, 0.168],
      mirror: s > 0,
      lift: 0.003,
      bone: head,
      segments: 10,
    });

    b.decal(cheeks[s > 0 ? 0 : 1], cheekTexture, {
      name: `cheekCreases${side}`,
      at: [s * 0.55, 2.79, 1.48],
      dir: [s * 0.4, 0, 1],
      size: [0.225, 0.33],
      mirror: s < 0,
      bone: head,
      lift: 0.0015,
      segments: 8,
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
  // Broad African fan ears. One coherent membrane fills each silhouette;
  // there is no inset shield or contrasting border.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const bone = earJoints[s > 0 ? 0 : 1];

    const ep = (u: number, v: number, cup = 0): P => [
      s * (0.59 + u),
      3.08 + v,
      0.77 - u * 0.32 + cup,
    ];

    const upper: P[] = [
      ep(0, 0),
      ep(0.2, 0.32, 0.01),
      ep(0.43, 0.53, 0.025),
      ep(0.68, 0.7, 0.035),
      ep(0.94, 0.75, 0.035),
      ep(1.2, 0.65, 0.025),
      ep(1.43, 0.43, 0.01),
      ep(1.57, 0.13),
      ep(1.59, -0.13),
    ];

    const lower: P[] = [
      ep(0, 0),
      ep(0.13, -0.37, 0.01),
      ep(0.29, -0.77, 0.025),
      ep(0.48, -1.08, 0.035),
      ep(0.72, -1.2, 0.035),
      ep(0.91, -1.12, 0.025),
      ep(1.15, -0.92, 0.01),
      ep(1.42, -0.58),
      ep(1.59, -0.13),
    ];

    const ear = b.membrane(upper, lower, {
      name: `greatFanEar${side}`,
      color: earSkin,
      thickness: 0.058,
      rows: 6,
      cols: 14,
      bone,
    });

    b.decal(ear, earTexture, {
      name: `fineEarVeins${side}`,
      at: ep(0.82, -0.18, 0.17),
      dir: [s * 0.32, 0, 1],
      up: [0, 1, 0],
      size: [1.45, 1.72],
      mirror: s < 0,
      bone,
      lift: 0.0015,
      segments: 16,
    });

    const earSurface = b.surface(ear);

    // Buried cartilage at the hinge, not a rod along the entire ear.
    b.sweep(
      earSurface.drape(
        [
          ep(0.045, 0.1, 0.15),
          ep(0.085, -0.07, 0.15),
          ep(0.14, -0.3, 0.15),
          ep(0.22, -0.5, 0.15),
        ],
        { lift: -0.008 },
      ),
      [0.026, 0.01],
      {
        name: `earRootCartilage${side}`,
        color: skin,
        bone,
        sides: 6,
      },
    );
  }

  // ------------------------------------------------------------------
  // Sweeping ivory. Explicit longitudinal rings prevent angular elbows.
  // The tips taper to true points, with subtly unequal final elevations.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    ellipsoid(
      `tuskRootPad${side}`,
      [s * 0.445, 2.64, 1.425],
      [0.155, 0.17, 0.19],
      skin,
      head,
      10,
    );

    const tipY = s > 0 ? 2.78 : 2.735;
    const points: P[] = [
      [s * 0.46, 2.645, 1.43],
      [s * 0.53, 2.49, 1.71],
      [s * 0.64, 2.405, 2.04],
      [s * 0.755, 2.425, 2.36],
      [s * 0.835, 2.55, 2.65],
      [s * 0.85, tipY, 2.91],
    ];

    b.part(tuskGeometry(points, 0.145), ivory, {
      name: `sweepingIvoryTusk${side}`,
      at: [0, 0, 0],
      bone: head,
    });
  }

  // ------------------------------------------------------------------
  // Trunk: integrated roots, fine skin folds and two African fingers.
  // ------------------------------------------------------------------

  const trunkFinish = paint((p, n, uv) => {
    const t = uv[0];
    const a = (uv[1] * Math.PI) / 180;
    const phase =
      t * 44 +
      Math.sin(a * 2.1 + t * 17) * 0.12 +
      Math.sin(a * 4.7 - t * 11) * 0.055;
    const f = phase - Math.floor(phase);
    const crease = 1 - smoothstep(0.025, 0.085, Math.abs(f - 0.36));
    const ridge = 1 - smoothstep(0.03, 0.1, Math.abs(f - 0.49));
    const strength = 0.1 + 0.065 * (0.5 + 0.5 * Math.cos(a));
    const c = mix(skin.at(p, n), "#737e70", crease * strength);
    return mix(c, "#b8b9a2", ridge * 0.09);
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
  // Weight-bearing pillars and integrated, shallow toenails.
  // ------------------------------------------------------------------

  const legFinish = paint((p, n, uv) => {
    const t = uv[0];
    const a = (uv[1] * Math.PI) / 180;
    const phase = t * 33 + Math.sin(a * 2 + t * 9) * 0.12;
    const f = phase - Math.floor(phase);
    const crease = 1 - smoothstep(0.025, 0.09, Math.abs(f - 0.4));
    const ankle = smoothstep(0.7, 0.84, t);
    const knee = Math.exp(-Math.pow((t - 0.47) / 0.075, 2));
    return mix(
      skin.at(p, n),
      "#757e70",
      crease * (0.025 + ankle * 0.11 + knee * 0.07),
    );
  });

  for (const leg of legs) {
    const { chain, suffix, front, points } = leg;

    b.sweep(
      chain,
      front
        ? [0.385, 0.325, 0.275, 0.285]
        : [0.415, 0.335, 0.275, 0.285],
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
      points[3][2] + 0.035,
    ];
    const r = front ? 0.358 : 0.35;

    const foot = b.lathe(
      [
        [0, 0],
        [r * 0.91, 0],
        [r, 0.05],
        [r * 1.015, 0.14],
        [r * 0.975, 0.25],
        [r * 0.88, 0.34],
        [r * 0.79, 0.4],
        [r * 0.77, 0.45],
        [0, 0.45],
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

      b.stick(
        new THREE.SphereGeometry(1, 8, 6),
        nailFinish,
        hit,
        {
          name: `toenail${suffix}${i + 1}`,
          scale: [front ? 0.077 : 0.087, 0.008, 0.067],
          embed: 0.48,
          flow: [0, 1, 0],
          bone: chain.tip!,
        },
      );
    }
  }

  // ------------------------------------------------------------------
  // Wrinkles stay seated on the volume; no loose sweeps over the legs.
  // ------------------------------------------------------------------

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const index = s > 0 ? 0 : 1;

    b.decal([torso, shoulders[index]], bodyCreases, {
      name: `shoulderSkinCreases${side}`,
      at: [s * 1.25, 2.16, 0.43],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.67, 1.02],
      mirror: s > 0,
      lift: 0.0015,
      bone: spine.tip!,
      segments: 12,
    });

    b.decal([torso, haunches[index]], bodyCreases, {
      name: `haunchSkinCreases${side}`,
      at: [s * 1.3, 2.06, -1.65],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.58, 0.87],
      mirror: s > 0,
      lift: 0.0015,
      bone: pelvis,
      segments: 10,
    });
  }

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
  // Tail and coarse brush.
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
  // Quiet savanna stage. Ground reaches y = 0; all four soles meet it.
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